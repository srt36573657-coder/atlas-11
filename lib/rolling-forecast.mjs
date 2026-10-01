import fs from 'node:fs/promises';
import path from 'node:path';
import {createHash} from 'node:crypto';
import {FACTOR36_POLICY,pricePanel,examplesFor,fitFactorModel,validateFactorRecords} from './factor36.mjs';
import {externalDesign} from './factor36-input.mjs';
import {simulateJointFactor36} from './factor36-simulation.mjs';

export const ROLLING_POLICY=Object.freeze({id:'atlas-rolling20-1',horizon:20,history:60,method:'A',calibration:'existing_factor36_pre_20260917',interval:.8,trustProbability:null});
const sha=x=>createHash('sha256').update(x).digest('hex');
const canonical=x=>Array.isArray(x)?x.map(canonical):x&&typeof x==='object'?Object.fromEntries(Object.keys(x).sort().filter(k=>x[k]!==undefined).map(k=>[k,canonical(x[k])])):x;
const digest=x=>sha(JSON.stringify(canonical(x)));
const validDate=d=>/^\d{4}-\d{2}-\d{2}$/.test(d??'')&&Number.isFinite(Date.parse(d))&&new Date(d).toISOString().slice(0,10)===d;
export const koreanDate=at=>new Date(Date.parse(at)+9*3600000).toISOString().slice(0,10);

/** Observed prices are the only numerical anchor. No earlier forecast is an input. */
export function rollingInput(bundle,{calendar=bundle.input?.calendar,issuedAt=new Date().toISOString(),futureDays=20}={}){
 // futureDays: 기본 20(옛 동작 그대로) · 1 이면 「내일 하루만」(config/atlas11/horizon.json · 2026-10-02 사장님 명령) — 다음 거래일 하나만 요구한다
 if(!Number.isInteger(futureDays)||futureDays<1||futureDays>20)throw Error('ROLLING_FUTURE_DAYS');
 const source=bundle?.input;
 if(!source||!Number.isFinite(Date.parse(issuedAt))||source.assets?.length!==52||new Set(source.assets.map(a=>a.code)).size!==52||source.assets.some(a=>!/^\d{6}$/.test(a.code)))throw Error('ROLLING_52_CONTRACT');
 if(!validDate(source.actualAsOf)||source.actualAsOf>koreanDate(issuedAt))throw Error('ROLLING_ACTUAL_DATE');
 if(source.actualAsOf===koreanDate(issuedAt)&&new Date(Date.parse(issuedAt)+9*3600000).toISOString().slice(11,16)<'15:30')throw Error('ROLLING_CLOSE_NOT_FINAL');
 if(!Array.isArray(calendar?.sessions)||!calendar.sources?.length||!calendar.status)throw Error('ROLLING_CALENDAR_EVIDENCE_REQUIRED');
 const sessions=calendar.sessions;
 if(sessions.some((d,i)=>!validDate(d)||[0,6].includes(new Date(d).getUTCDay())||calendar.holidays?.[d]||i&&d<=sessions[i-1])||!sessions.includes(source.actualAsOf))throw Error('ROLLING_CALENDAR_CONTRACT');
 const futureDates=sessions.filter(d=>d>source.actualAsOf).slice(0,futureDays);
 if(futureDates.length!==futureDays)throw Error('ROLLING_CALENDAR_'+futureDays+'_REQUIRED');
 const historyDates=sessions.filter(d=>d<=source.actualAsOf).slice(-60);
 if(historyDates.length!==60)throw Error('ROLLING_HISTORY_60_REQUIRED');
 for(const a of source.assets){
  const seen=new Set();for(const p of a.prices.filter(p=>p.date<=source.actualAsOf)){if(seen.has(p.date))throw Error('ROLLING_PRICE_DUPLICATE '+a.code);seen.add(p.date);if(p.observedAt&&(!Number.isFinite(Date.parse(p.observedAt))||Date.parse(p.observedAt)>Date.parse(issuedAt)))throw Error('ROLLING_PRICE_FUTURE_OBSERVATION '+a.code);}
  for(const d of historyDates){const p=a.prices.find(p=>p.date===d);if(!p||!Number.isFinite(p.close)||p.close<=0||p.quality==='conflict')throw Error('ROLLING_OBSERVED_HISTORY_GAP '+a.code+' '+d);}
 }
 const input={...source,calendar:{...calendar,sessions:sessions.filter(d=>d<=futureDates.at(-1))},end:futureDates.at(-1),assets:source.assets.map(a=>({...a,prices:a.prices.filter(p=>p.date<=source.actualAsOf)}))};
 return {input,futureDates,historyDates,currentDateKST:koreanDate(issuedAt)};
}

function previousFor(code,priorPublications,issuedAt,sessions){
 const previousDay=sessions.filter(d=>d<koreanDate(issuedAt)).at(-1);
 const prior=priorPublications.filter(p=>p.schema==='atlas-rolling-forecast-1'&&p.id&&Date.parse(p.issuedAt)<Date.parse(issuedAt)&&koreanDate(p.issuedAt)===previousDay).sort((a,b)=>a.issuedAt.localeCompare(b.issuedAt)).at(-1);
 const a=prior?.assets.find(a=>a.code===code);
 return a?{id:prior.id,issuedAt:prior.issuedAt,actualAsOf:prior.actualAsOf,rows:structuredClone(a.rows),source:'immutable_published_forecast'}:null;
}

/** Re-fits the unchanged A policy on its original calibration dates, then updates
 * state with all actually observed prices. B is not silently substituted. */
export function buildRollingForecast({bundle,recordsPayload={schema:'atlas-factor36-records-1',records:[]},registry,calendar,issuedAt=new Date().toISOString(),paths=FACTOR36_POLICY.paths,implementationSHA256='unrecorded',priorPublications=[]}){
 const {input,futureDates,historyDates,currentDateKST}=rollingInput(bundle,{calendar:calendar??bundle.input.calendar,issuedAt});
 if(registry?.factors?.length!==36)throw Error('ROLLING_FACTOR_REGISTRY');
 const records=validateFactorRecords(recordsPayload,{codes:input.assets.map(a=>a.code),cutoff:issuedAt});
 const panel=pricePanel(input),models=[],external=[];
 for(let i=0;i<input.assets.length;i++){
  const design=externalDesign(records,input.assets[i],panel,examplesFor(panel,i),issuedAt),model=fitFactorModel(design.rows,{featureFactors:design.featureFactors});
  if(model.status!=='research_estimate')throw Error('ROLLING_MODEL_HISTORY '+input.assets[i].code+' '+model.reason);
  external.push(design);models.push(model);
 }
 const simulation=simulateJointFactor36(models,panel,input.assets,futureDates,{paths,seed:FACTOR36_POLICY.seed,external});
 const newsSource=bundle.candidate?.assets??[];
 const semantic={policy:ROLLING_POLICY,implementationSHA256,paths,seed:FACTOR36_POLICY.seed,origin:input.actualAsOf,futureDates,historyCalendar:panel.dates,assets:input.assets.map(a=>({code:a.code,sector:a.sector,prices:a.prices.map(p=>({date:p.date,close:p.close,quality:p.quality??null}))})),records,news:newsSource.map(a=>({code:a.code,news:(a.news??[]).map(n=>({id:n.id,name:n.name,date:n.date,scope:n.scope,status:n.status,publishedAt:n.publishedAt,phaseId:n.phaseId,sources:n.sources?.map(s=>({url:s.url,name:s.name}))}))}))};
 const semanticSHA256=digest(semantic),id=input.actualAsOf+'-rolling20-'+semanticSHA256.slice(0,16),csvDate=koreanDate(issuedAt).replaceAll('-','');
 const assets=input.assets.map((a,i)=>{
  const m=models[i],old=newsSource.find(x=>x.code===a.code),actual=a.prices.find(p=>p.date===input.actualAsOf),anchor={date:input.actualAsOf,close:actual.close};
  const anchorRow={date:anchor.date,p10:anchor.close,p50:anchor.close,p90:anchor.close,mean:anchor.close,return:0,anchor:true,eventIds:[]};
  const factors=registry.factors.map(f=>{const used=m.featureFactors.some((id,j)=>id===f.id&&(m.factorSelection?.acceptedFeatureIndices??[]).includes(j))||f.id==='F36',ext=external[i].selected.find(s=>s.factorId===f.id);return {...f,status:used?(f.id==='F11'?'measured_universe_proxy':'measured_research'):'missing',role:f.id==='F36'?'variance':used?'conditional_mean':'not_used',reason:f.id==='F11'?'ATLAS52 가격 폭 대용값 · KOSPI나 공식 업종지수가 아님':f.id==='F35'?'자기 종목 실제 1·2·5·20·60거래일 수익률':f.id==='F36'?'자기 잔차 변동폭':ext?'시점·대상 검증 이력': '검증된 시점별 입력 미확보',sourceUrl:ext?.current.sourceUrl??(used?a.priceSource?.url:null)};});
  return {code:a.code,name:a.name,sector:a.sector,anchor,actual60:historyDates.map(date=>({date,close:a.prices.find(p=>p.date===date).close})),rows:[anchorRow,...simulation.rows[i].map(r=>({...r,targetCompletedBeforeIssue:Date.parse(r.date+'T15:30:00+09:00')<=Date.parse(issuedAt)}))],previous:previousFor(a.code,priorPublications,issuedAt,calendar?.sessions??bundle.input.calendar.sessions),csvUrl:'/downloads/rolling/'+id+'/ATLAS_'+a.code+'_'+csvDate+'.csv',news:(old?.news??[]).map(n=>({...structuredClone(n),used:false,effect:null,impact:null,numericImpactAllowed:false,reason:'일정은 설명 자료 · 기대 대비 결과와 추가 예측력 미검증'})),model:{id:FACTOR36_POLICY.id,selected:m.selected,regression:m.regression,volatility:m.volatility,featureNames:external[i].featureNames,featureFactors:m.featureFactors,factors,factorSelection:m.factorSelection,trainedThrough:m.trainedThrough,trainCount:m.trainCount,sourceStatus:'retrospective_single_provider_unadjusted',calibrationFrozenBefore:FACTOR36_POLICY.trainingBefore,stateUpdatedThrough:input.actualAsOf,externalRejected:external[i].rejected,trustProbability:null},errors:{1:null,5:null,10:null,20:null},previousReason:'직전 거래일에 실제 발행한 롤링 전망이 없으면 표시하지 않습니다.'};
 });
 const fresh=input.actualAsOf===currentDateKST;
 const publication={schema:'atlas-rolling-forecast-1',id,issuedAt,actualAsOf:input.actualAsOf,currentDateKST,dataStatus:fresh?'current_close':'stored_close',publicationStatus:fresh?'live_research_forecast':'stored_close_reference',staleAnchor:!fresh,horizon:20,futureDates,policy:{...ROLLING_POLICY,paths,seed:FACTOR36_POLICY.seed},assets,summary:{stocks:52,anchorMatches:assets.filter(a=>a.rows[0].p50===a.anchor.close).length,futurePointsPerStock:20,afterIssuanceFuturePoints:futureDates.filter(d=>Date.parse(d+'T15:30:00+09:00')>Date.parse(issuedAt)).length,csvFiles:52,chosenMethod:'A',methodReason:'기존 A도 실제 종가에서 재출발 · 새 포장만으로 B 우위를 주장하지 않음',newCurrentCloseStocks:fresh?52:0,newLiveForecastStocks:fresh?52:0,previousForecastStocks:assets.filter(a=>a.previous).length,trustProbability:null,liveAdvantageProven:false},provenance:{semanticSHA256,implementationSHA256,inputSHA256:digest(input),calendar:{status:input.calendar.status,sources:input.calendar.sources,verifiedThrough:input.calendar.verifiedThrough??input.calendar.sessions.at(-1)},anchorSource:'observed_close_only',priorForecastUsedAsNumericInput:false,calibration:'unchanged_A_frozen_before_20260917',state:'own_observed_returns_and_variance_recomputed',priceAdjustmentStatus:'unverified',backdatedIssuance:false},audit:simulation.audit};
 validateRollingPublication(publication);
 return publication;
}

export function validateRollingPublication(p){
 if(p?.schema!=='atlas-rolling-forecast-1'||!/^\d{4}-\d{2}-\d{2}-rolling20-[a-f0-9]{16}$/.test(p.id??'')||p.assets?.length!==52||new Set(p.assets.map(a=>a.code)).size!==52||p.futureDates?.length!==20||p.horizon!==20||!Number.isFinite(Date.parse(p.issuedAt)))throw Error('ROLLING_PUBLICATION_CONTRACT');
 if(p.futureDates.some((d,i)=>!validDate(d)||d<=p.actualAsOf||[0,6].includes(new Date(d).getUTCDay())||i&&d<=p.futureDates[i-1]))throw Error('ROLLING_FUTURE_SESSIONS');
 for(const a of p.assets){
  if(!/^\d{6}$/.test(a.code)||a.anchor?.date!==p.actualAsOf||!Number.isFinite(a.anchor.close)||a.anchor.close<=0||a.rows?.length!==21||a.actual60?.length!==60)throw Error('ROLLING_ASSET_CONTRACT '+a.code);
  const r=a.rows[0],actual=a.actual60.at(-1);if(r.date!==p.actualAsOf||!r.anchor||r.p50!==a.anchor.close||r.p10!==a.anchor.close||r.p90!==a.anchor.close||actual.date!==p.actualAsOf||actual.close!==a.anchor.close)throw Error('ROLLING_ANCHOR_DIFFERENCE '+a.code);
  for(let j=1;j<a.rows.length;j++){const row=a.rows[j];if(row.date!==p.futureDates[j-1]||![row.p10,row.p50,row.p90].every(Number.isFinite)||row.p10<=0||row.p10>row.p50||row.p50>row.p90)throw Error('ROLLING_ROW_CONTRACT '+a.code);}
  if(a.previous&&(a.previous.id===p.id||Date.parse(a.previous.issuedAt)>=Date.parse(p.issuedAt)||a.previous.source!=='immutable_published_forecast'))throw Error('ROLLING_PREVIOUS_NOT_PRIOR');
 }
 return true;
}

export function rollingCSV(asset){
 if(asset.rows?.length!==21)throw Error('ROLLING_CSV_ROWS');
 return '\uFEFF날짜,예측값,상단,하단\r\n'+asset.rows.slice(1).map(r=>[r.date,r.p50,r.p90,r.p10].join(',')).join('\r\n')+'\r\n';
}

async function readJSON(file){try{return JSON.parse(await fs.readFile(file,'utf8'));}catch(e){if(e.code==='ENOENT')return null;throw e;}}
async function immutable(file,bytes){try{await fs.writeFile(file,bytes,{flag:'wx'});}catch(e){if(e.code!=='EEXIST')throw e;const old=await fs.readFile(file);if(!old.equals(Buffer.from(bytes)))throw Error('ROLLING_IMMUTABLE_CONFLICT '+file);}}
async function atomic(file,bytes){const tmp=file+'.'+process.pid+'.tmp';try{await fs.writeFile(tmp,bytes,{flag:'wx'});await fs.rename(tmp,file);}finally{await fs.rm(tmp,{force:true});}}

/** All files become visible before latest changes; same semantic input reuses the
 * original timestamp and CSV names. Expected latest ID is a compare-and-swap. */
export async function persistRollingForecast(publication,{rootDir='.',expectedLatestId=null}={}){
 validateRollingPublication(publication);
 const reports=path.join(rootDir,'reports/rolling'),versions=path.join(reports,'versions'),publicData=path.join(rootDir,'public/data'),latestFile=path.join(publicData,'rolling-forecast.json');
 await fs.mkdir(versions,{recursive:true});await fs.mkdir(publicData,{recursive:true});
 const lock=await fs.open(path.join(reports,'publish.lock'),'wx');
 try{
  const latest=await readJSON(latestFile);if(latest)validateRollingPublication(latest);
  if((latest?.id??null)!==expectedLatestId)throw Error('ROLLING_LATEST_CONFLICT');
  const versionFile=path.join(versions,publication.id+'.json'),existing=await readJSON(versionFile);
  if(existing&&(existing.provenance?.semanticSHA256!==publication.provenance?.semanticSHA256||existing.provenance?.implementationSHA256!==publication.provenance?.implementationSHA256))throw Error('ROLLING_ID_COLLISION');
  const chosen=existing??publication;validateRollingPublication(chosen);
  if(latest&&latest.id!==chosen.id)await immutable(path.join(versions,latest.id+'.json'),JSON.stringify(latest));
  const csvDir=path.join(rootDir,'public/downloads/rolling',chosen.id);await fs.mkdir(csvDir,{recursive:true});
  const csvFiles=[];
  for(const a of chosen.assets){
   const basename='ATLAS_'+a.code+'_'+koreanDate(chosen.issuedAt).replaceAll('-','')+'.csv';
   if(a.csvUrl!=='/downloads/rolling/'+chosen.id+'/'+basename)throw Error('ROLLING_CSV_PATH_CONTRACT');
   const bytes=rollingCSV(a);await immutable(path.join(csvDir,basename),bytes);csvFiles.push({code:a.code,file:basename,sha256:sha(bytes),anchor:a.anchor,futurePoints:20});
  }
  const manifest={schema:'atlas-rolling-csv-manifest-1',id:chosen.id,issuedAt:chosen.issuedAt,actualAsOf:chosen.actualAsOf,dataStatus:chosen.dataStatus,files:csvFiles};
  await immutable(path.join(csvDir,'manifest.json'),JSON.stringify(manifest));
  await immutable(versionFile,JSON.stringify(chosen));
  if(latest?.id!==chosen.id)await atomic(latestFile,JSON.stringify(chosen));
  const result={id:chosen.id,issuedAt:chosen.issuedAt,actualAsOf:chosen.actualAsOf,reused:Boolean(existing),createdForecastFiles:existing?0:52,csvFiles:52,archive:versionFile,publication:chosen};
  await atomic(path.join(reports,'latest.json'),JSON.stringify({...result,publication:undefined,summary:chosen.summary},null,2));
  return result;
 }finally{await lock.close();await fs.unlink(path.join(reports,'publish.lock'));}
}

export async function readRollingPublications(rootDir='.'){
 const dir=path.join(rootDir,'reports/rolling/versions');let files;try{files=await fs.readdir(dir);}catch(e){if(e.code==='ENOENT')return [];throw e;}
 const publications=[];for(const file of files.filter(f=>f.endsWith('.json')).sort()){const p=await readJSON(path.join(dir,file));validateRollingPublication(p);publications.push(p);}return publications;
}
