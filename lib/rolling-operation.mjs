/** Daily rolling operation: immutable vintages, observed actual revisions and publication-time scoring. */
import {createHash} from 'node:crypto';
import fs from 'node:fs/promises';
import path from 'node:path';
import {journalInputChange} from './input-revisions.mjs';
import {sessionCloseGate,validateRollingCalendar} from './rolling-calendar.mjs';
export const ROLLING_HORIZONS=Object.freeze([1,5,10,20]);
const finite=x=>typeof x==='number'&&Number.isFinite(x);
const iso=x=>typeof x==='string'&&/T.*(?:Z|[+-]\d\d:\d\d)$/.test(x)&&Number.isFinite(Date.parse(x));
export const rollingHash=x=>createHash('sha256').update(typeof x==='string'||Buffer.isBuffer(x)||x instanceof Uint8Array?x:JSON.stringify(x)).digest('hex');
export const koreaDay=at=>new Date(Date.parse(at)+9*3600000).toISOString().slice(0,10);
const closeInstant=date=>Date.parse(date+'T15:30:00+09:00');
function sessionsOf(input,calendar){
 const checked=calendar??input.calendar;validateRollingCalendar(checked);const sessions=checked.sessions;
 if(!Array.isArray(sessions)||!sessions.length||sessions.some((x,i)=>!/^\d{4}-\d{2}-\d{2}$/.test(x)||(i&&sessions[i-1]>=x)))throw Error('ROLLING_SESSION_CALENDAR_REQUIRED');
 return sessions;
}
export function rollingOperationWindow(input,now=new Date().toISOString(),{calendar,runEndDate=input.end}={}){
 if(!iso(now))throw Error('INVALID_CLOCK');
 const sessions=sessionsOf(input,calendar),local=new Date(Date.parse(now)+9*3600000).toISOString(),day=local.slice(0,10),clock=local.slice(11,16);
 const calendarGate=sessionCloseGate(calendar??input.calendar,new Date(now)),session=sessions.includes(day),afterClose=calendarGate.mayCollectFinalClose===true,atScheduledStart=clock>='15:40';
 const cutoff=sessions.filter(d=>d<day||(d===day&&afterClose)).at(-1)??null;
 const ended=runEndDate!=null&&day>runEndDate;
 return {day,session,afterClose,atScheduledStart,calendarGate,cutoff,ended,notStarted:day<input.origin,eligible:session&&afterClose&&atScheduledStart&&!ended&&day>=input.origin,scheduleStartKST:'15:40',marketCloseKST:'15:30',deadlineKST:'16:00',deadlineMissed:clock>='16:00',deadlineAt:day+'T16:00:00+09:00',finalPriceRequired:true};
}
/** Before 16:00 the supplement MUST carry explicit provider finality evidence. Time alone is insufficient. */
export function mergeRollingPrices(input,observations,{now=new Date().toISOString(),expectedHash,calendar,runEndDate=input.end}={}){
 if(expectedHash!==rollingHash(input))throw Error('INPUT_VERSION_CONFLICT');
 const window=rollingOperationWindow(input,now,{calendar,runEndDate});
 if(window.ended)throw Error('RUN_PERIOD_ENDED');
 const sessions=new Set(sessionsOf(input,calendar)),next=structuredClone(input),codes=new Set(input.assets.map(a=>a.code)),seen=new Map(),fresh=new Set();
 for(const o of observations){
  if(!codes.has(o.code))throw Error('PRICE_CODE');
  let source;try{source=new URL(o.sourceUrl);}catch{throw Error('PRICE_PROVENANCE');}
  if(source.protocol!=='https:'||source.username||source.password||!['fchart.stock.naver.com','finance.naver.com','m.stock.naver.com','api.stock.naver.com','openapi.krx.co.kr','data.krx.co.kr','alphasquare.co.kr','m.alphasquare.co.kr','stock.mk.co.kr','query1.finance.yahoo.com','query2.finance.yahoo.com'].includes(source.hostname)||!/^[a-f0-9]{64}$/i.test(o.rawHash??'')||!iso(o.observedAt)||Date.parse(o.observedAt)>Date.parse(now))throw Error('PRICE_PROVENANCE');
  const asset=next.assets.find(a=>a.code===o.code),prices=new Map(asset.prices.map(p=>[p.date,p]));
  for(const p of o.rows??[]){
   if(!sessions.has(p.date)||p.date>window.cutoff)throw Error('PRICE_NOT_COMPLETED_SESSION');
   if(p.date===window.day){
    if(Date.parse(o.observedAt)<closeInstant(p.date))throw Error('INTRADAY_OBSERVATION');
    if(Date.parse(o.observedAt)<Date.parse(p.date+'T16:00:00+09:00')){
     if(o.finalClose!==true||o.sessionDate!==p.date||!iso(o.finalizedAt)||Date.parse(o.finalizedAt)<closeInstant(p.date)||Date.parse(o.finalizedAt)>Date.parse(o.observedAt)||!/^https:\/\//.test(o.finalitySourceUrl??'')||typeof o.finalityBasis!=='string'||!o.finalityBasis.trim())throw Error('EXPLICIT_FINAL_CLOSE_EVIDENCE_REQUIRED');
    }
   }
   // 정규장 종가만 있는 행(priceBasis KRX_REGULAR · 시가·고가·저가·거래량 없음)은 종가만 검사한다 — 다른 세션의 OHLC·거래량을 섞지 않기 위해 비워 둔다
   const closeOnly=(p.priceBasis??o.priceBasis)==='KRX_REGULAR'&&[p.open,p.high,p.low,p.volume].every(v=>v==null);
   if(closeOnly){if(!finite(p.close)||p.close<=0)throw Error('PRICE_NUMERIC');}
   else{
   if(![p.open,p.high,p.low,p.close,p.volume].every(finite)||p.close<=0||p.volume<0||p.turnover!=null&&(!finite(p.turnover)||p.turnover<0))throw Error('PRICE_NUMERIC');
   const halted=p.open===0&&p.high===0&&p.low===0&&p.volume===0;
   if(!halted&&(p.low<=0||p.high<p.low||p.open<p.low||p.open>p.high||p.close<p.low||p.close>p.high))throw Error('PRICE_OHLC');
   }
   const key=o.code+':'+p.date,previous=seen.get(key);
   if(previous&&['open','high','low','close','volume','turnover'].some(k=>previous[k]!=null&&p[k]!=null&&previous[k]!==p[k]))throw Error('PRICE_CONFLICT');
   seen.set(key,{...previous,...p});
   const old=prices.get(p.date);
   if(old?.priceBasis==='KRX_REGULAR'&&o.priceBasis!=='KRX_REGULAR'){if(old.close!==p.close)throw Error('PRICE_SESSION_BASIS_CONFLICT');continue;}
   // 정규장 종가 행이 다른 세션 기준의 옛 행을 바꿀 때는 옛 행의 시가·고가·저가·거래량을 물려받지 않는다(세션 섞임 방지)
   const replaceWhole=(p.priceBasis??o.priceBasis)==='KRX_REGULAR'&&old?.priceBasis!=='KRX_REGULAR';
   const combined=Object.fromEntries(Object.entries(replaceWhole?{...p,priceBasis:'KRX_REGULAR'}:{...old,...p}).filter(([,v])=>v!==null&&v!==undefined));
   if(!old||['open','high','low','close','volume','turnover'].some(k=>old[k]!==combined[k]))prices.set(p.date,{...combined,quality:'single_source',sourceUrl:o.sourceUrl,rawHash:o.rawHash,observedAt:o.observedAt,adjustmentsVerified:o.adjustmentsVerified===true,...(o.finalClose?{finalClose:true,finalizedAt:o.finalizedAt,finalitySourceUrl:o.finalitySourceUrl,finalityBasis:o.finalityBasis}:{})});
   if(p.date===window.day)fresh.add(o.code);
  }
  asset.prices=[...prices.values()].sort((a,b)=>a.date.localeCompare(b.date));
 }
 const common=[...sessions].filter(d=>d<=window.cutoff&&next.assets.every(a=>a.prices.some(p=>p.date===d&&finite(p.close)&&p.close>0&&p.quality!=='conflict'))).at(-1);
 if(common)next.actualAsOf=common;
 const result=journalInputChange(input,next,{now});
 for(const r of result.input.priceRevisions?.slice(input.priceRevisions?.length??0)??[])r.provider='ROLLING_REVIEWED_COLLECTOR';
 const confirmedToday=result.input.assets.filter(a=>a.prices.some(p=>p.date===window.day&&finite(p.close)&&p.close>0&&p.quality!=='conflict'&&iso(p.observedAt)&&Date.parse(p.observedAt)>=closeInstant(window.day)&&Date.parse(p.observedAt)<=Date.parse(now)&&(Date.parse(p.observedAt)>=Date.parse(window.day+'T16:00:00+09:00')||explicitFinality(p,window.day)))).map(a=>a.code);
 return {...result,freshCodes:[...fresh].sort(),confirmedTodayCodes:confirmedToday.sort(),actualAsOf:result.input.actualAsOf,retainedStoredClose:result.input.actualAsOf!==window.day};
}
function publicationCohort(p,sessions){
 const at=p.issuedAt??p.createdAt;if(!iso(at))return null;
 const day=koreaDay(at);
 // A weekend reconstruction is not a Friday publication. Live vintages begin after that session closes.
 return sessions.includes(day)&&Date.parse(at)>=closeInstant(day)?day:null;
}
function explicitFinality(o,date){return o.finalClose===true&&iso(o.finalizedAt)&&Date.parse(o.finalizedAt)>=closeInstant(date)&&Date.parse(o.finalizedAt)<=Date.parse(o.observedAt)&&/^https:\/\//.test(o.finalitySourceUrl??'')&&typeof o.finalityBasis==='string'&&o.finalityBasis.trim().length>0;}
const direction=value=>value>0?'up':value<0?'down':'flat';
function emptyCell(horizon,targetDate,originDate,reason,extra={}){return {horizon,status:'pending',ape:null,forecast:null,actual:null,targetDate,originDate,forecastId:null,reason,...extra};}
/** Four cells per stock. Dates are issuance-session vintages, never reconstructed anchor dates. */
export function rollingScoreRecord(publications,input,{now=new Date().toISOString(),calendar,previousScoreId=null}={}){
 const sessions=sessionsOf(input,calendar),window=rollingOperationWindow(input,now,{calendar,runEndDate:null}),targetDate=window.cutoff;
 const validPublications=publications.filter(p=>p?.id&&iso(p.issuedAt??p.createdAt)&&Date.parse(p.issuedAt??p.createdAt)<=Date.parse(now)&&p.status!=='discarded'&&p.discarded!==true).sort((a,b)=>Date.parse(a.issuedAt??a.createdAt)-Date.parse(b.issuedAt??b.createdAt)||a.id.localeCompare(b.id));
 const cohorts=new Map();for(const p of validPublications){const c=publicationCohort(p,sessions);if(c===null)continue;if(!cohorts.has(c))cohorts.set(c,[]);cohorts.get(c).push(p);}
 function cell(asset,date,horizon){
  if((calendar??input.calendar).notices?.some(n=>n.date===date&&n.requiresCloseReview))return emptyCell(horizon,date,null,'special_close_unverified');
  const ti=sessions.indexOf(date),originDate=ti>=horizon?sessions[ti-horizon]:null;
  if(!originDate)return emptyCell(horizon,date,null,'calendar_history_missing');
  const candidates=cohorts.get(originDate)??[];
  // First published eligible vintage is fixed; a later favourable correction does not replace it.
  const p=candidates.find(v=>v.assets?.some(a=>a.code===asset.code));
  if(!p)return emptyCell(horizon,date,originDate,'no_published_vintage');
  const issuedAt=p.issuedAt??p.createdAt,extra={forecastId:p.id,issuedAt,actualAnchorDate:p.actualAsOf,staleAnchor:p.actualAsOf!==originDate};
  if(Date.parse(issuedAt)>=closeInstant(date))return emptyCell(horizon,date,originDate,'issued_after_target_close',extra);
  const a=p.assets.find(a=>a.code===asset.code),r=(a.rows??a.today??[]).find(r=>r.date===date),prediction=r?.p50??r?.forecast??r?.value??r?.close;
  if(!r||!finite(prediction)||prediction<=0)return emptyCell(horizon,date,originDate,'forecast_target_unavailable',extra);
  const actualRow=asset.prices.find(x=>x.date===date),actual=actualRow?.close;
  if(!finite(actual)||actual<=0||actualRow.quality==='conflict')return emptyCell(horizon,date,originDate,'actual_close_unavailable',{...extra,forecast:prediction});
  if(iso(actualRow.observedAt)&&Date.parse(actualRow.observedAt)>Date.parse(now))return emptyCell(horizon,date,originDate,'actual_observed_in_future',{...extra,forecast:prediction});
  if(date===window.day&&(!iso(actualRow.observedAt)||Date.parse(actualRow.observedAt)<closeInstant(date)))return emptyCell(horizon,date,originDate,'actual_finality_unverified',{...extra,forecast:prediction});
  if(iso(actualRow.observedAt)&&koreaDay(actualRow.observedAt)===date&&Date.parse(actualRow.observedAt)<Date.parse(date+'T16:00:00+09:00')&&!explicitFinality(actualRow,date))return emptyCell(horizon,date,originDate,'actual_finality_unverified',{...extra,forecast:prediction});
  const lower=r.lower??r.p10,upper=r.upper??r.p90,bandValid=finite(lower)&&finite(upper)&&lower<=upper;
  const originActual=asset.prices.find(x=>x.date===originDate)?.close;
  const actualReturn=finite(originActual)&&originActual>0?actual/originActual-1:null,predictedReturn=finite(originActual)&&originActual>0?prediction/originActual-1:null;
  const covered=bandValid?actual>=lower&&actual<=upper:null;
  const alpha=.2,intervalScore=bandValid?(upper-lower)+(actual<lower?2/alpha*(lower-actual):actual>upper?2/alpha*(actual-upper):0):null;
  return {horizon,status:'evaluated',reason:null,ape:Math.abs(prediction-actual)/actual*100,forecast:prediction,actual,targetDate:date,originDate,...extra,actualReturn,predictedReturn,directionCorrect:actualReturn===null?null:direction(actualReturn)===direction(predictedReturn),lower:bandValid?lower:null,upper:bandValid?upper:null,covered,intervalScore,actualEvidence:{sourceUrl:actualRow.sourceUrl??null,rawHash:actualRow.rawHash??null,observedAt:actualRow.observedAt??null,rowHash:rollingHash(actualRow)},actualRevisions:(input.priceRevisions??[]).filter(x=>x.code===asset.code&&x.date===date&&Date.parse(x.at)<=Date.parse(now)).map(x=>({at:x.at,before:x.before,after:x.after,provider:x.provider}))};
 }
 const assets=input.assets.map(a=>({code:a.code,name:a.name,horizons:Object.fromEntries(ROLLING_HORIZONS.map(h=>[h,cell(a,targetDate,h)]))}));
 const firstCohort=[...cohorts.keys()].filter(Boolean).sort()[0],dates=firstCohort?sessions.filter(d=>d>firstCohort&&d<=targetDate):[];
 const byDate=dates.map(date=>{
  const rows=input.assets.map(a=>({code:a.code,horizons:Object.fromEntries(ROLLING_HORIZONS.map(h=>[h,cell(a,date,h)]))}));
  const h1=rows.map(a=>a.horizons[1]).filter(c=>c.status==='evaluated'),mean=values=>values.length?values.reduce((s,x)=>s+x,0)/values.length:null;
  return {date,rows,evaluatedStocks:h1.length,meanAbsoluteErrorPercent:mean(h1.map(c=>c.ape)),correct:h1.filter(c=>c.directionCorrect===true).length,wrong:h1.filter(c=>c.directionCorrect===false).length,coverage:mean(h1.filter(c=>c.covered!=null).map(c=>Number(c.covered))),commonDirectionFraction:h1.length?Math.max(...['up','flat','down'].map(d=>h1.filter(c=>c.actualReturn!==null&&direction(c.actualReturn)===d).length))/h1.length:null};
 });
 const body={schema:'atlas-rolling-scores-1',actualAsOf:input.actualAsOf,targetDate,assets,byDate,horizons:[...ROLLING_HORIZONS],stockRowsAreIndependent:false,independentDateCount:byDate.filter(d=>d.evaluatedStocks>0).length,causalExplanationEstablished:false,cohortBasis:'actual_publication_session_not_stale_anchor',selection:'first_published_vintage_per_session',intervalNominalCoverage:.8};
 return {...body,scoreId:rollingHash(body),observedAt:now,previousScoreId};
}
async function immutableJson(file,value){
 await fs.mkdir(path.dirname(file),{recursive:true});
 try{await fs.writeFile(file,JSON.stringify(value,null,2),{flag:'wx'});return value;}catch(e){if(e.code!=='EEXIST')throw e;const old=JSON.parse(await fs.readFile(file,'utf8'));const {scoreId,observedAt,previousScoreId,...body}=old;if(scoreId!==value.scoreId||rollingHash(body)!==scoreId)throw Error('IMMUTABLE_SCORE_CONFLICT');return old;}
}
export async function persistRollingScore(record,{rootDir='.'}={}){
 const archive=path.join(rootDir,'reports/rolling/scores',record.scoreId+'.json'),saved=await immutableJson(archive,record);
 const target=path.join(rootDir,'public/data/rolling-scores.json');await fs.mkdir(path.dirname(target),{recursive:true});await fs.writeFile(target+'.next',JSON.stringify(saved));await fs.rename(target+'.next',target);
 return {scoreId:saved.scoreId,archive,record:saved};
}
