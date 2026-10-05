/** Actual acquisition and a current-observation FOMO view; no forecast mutation. */
import {createHash} from 'node:crypto';
import {collectSources52} from './news-collection52.mjs';
import {fomoRegistry} from './fomo-collector-v2.mjs';
import {parseNaver} from './market-data.mjs';
import {calculateFomoV2} from './fomo-v2.mjs';
import {mergeFomoRecords} from './fomo-records.mjs';
export const COMPLETION_FOMO='atlas-completion-fomo-1';
const sha=x=>createHash('sha256').update(x).digest('hex');
const day=x=>typeof x==='string'&&/^\d{4}-\d{2}-\d{2}$/.test(x)&&Number.isFinite(Date.parse(x))&&new Date(x).toISOString().slice(0,10)===x;
const instant=x=>typeof x==='string'&&/T.*(?:Z|[+-]\d\d:\d\d)$/.test(x)&&Number.isFinite(Date.parse(x));
const finite=x=>typeof x==='number'&&Number.isFinite(x);
export function completedCloseDate(input,now=new Date()){
 if(!Number.isFinite(now.getTime())||!Array.isArray(input.calendar?.sessions))throw Error('CALENDAR_REQUIRED');
 const today=new Intl.DateTimeFormat('sv-SE',{timeZone:'Asia/Seoul'}).format(now);
 const ready=now.getTime()>=Date.parse(today+'T16:00:00+09:00');
 return input.calendar.sessions.filter(d=>day(d)&&(d<today||ready&&d===today)&&d<=input.end).at(-1)??null;
}
function provenance({sourceUrl,rawHash,observedAt}){
 const u=new URL(sourceUrl);if(u.protocol!=='https:'||u.username||u.password||!['fchart.stock.naver.com','openapi.krx.co.kr','alphasquare.co.kr','m.alphasquare.co.kr'].includes(u.hostname)||!instant(observedAt)||!/^([a-f0-9]{64})$/.test(rawHash))throw Error('PRICE_PROVENANCE');
 return {sourceUrl:u.href,rawHash,observedAt,availableAt:observedAt,publicationBasis:'observed_availability_only',adjustmentsVerified:false};
}
export function naverPriceObservation(raw,code,{input,sourceUrl,observedAt}){
 const cutoff=completedCloseDate(input,new Date(observedAt));if(!cutoff)throw Error('NO_COMPLETED_SESSION');
 const rawHash=sha(raw),rows=parseNaver(Buffer.from(raw).toString('utf8'),code,cutoff,input.calendar.sessions);
 return{code,rows,...provenance({sourceUrl,rawHash,observedAt})};
}
// Supports authenticated KRX API exports. No short-code/name guess is permitted.
export function parseKrxStockDaily(raw,{date,input,sourceUrl,observedAt}){
 if(!day(date)||date>completedCloseDate(input,new Date(observedAt)))throw Error('KRX_UNCLOSED_DATE');
 const body=JSON.parse(Buffer.from(raw).toString('utf8'));if(!Array.isArray(body.OutBlock_1))throw Error('KRX_ENVELOPE');
 const meta=provenance({sourceUrl,rawHash:sha(raw),observedAt}),allowed=new Set(input.assets.map(a=>a.code)),seen=new Set(),out=[];
 const number=(v,positive=false)=>{if(typeof v!=='number'&&!(typeof v==='string'&&/^-?\d[\d,]*(?:\.\d+)?$/.test(v)))throw Error('KRX_NUMBER');const n=Number(String(v).replaceAll(',',''));if(!finite(n)||n<0||positive&&n<=0)throw Error('KRX_NUMBER');return n;};
 for(const row of body.OutBlock_1){
  let code=String(row.ISU_SRT_CD??row.ISU_CD??'');if(/^KR7\d{6}\d{3}$/.test(code))code=code.slice(3,9);
  if(!/^\d{6}$/.test(code))throw Error('KRX_CODE');if(!allowed.has(code))continue;
  if(String(row.BAS_DD)!==date.replaceAll('-','')||seen.has(code))throw Error('KRX_DATE_OR_DUPLICATE');seen.add(code);
  const r={date,open:number(row.TDD_OPNPRC),high:number(row.TDD_HGPRC),low:number(row.TDD_LWPRC),close:number(row.TDD_CLSPRC,true),volume:number(row.ACC_TRDVOL),turnover:number(row.ACC_TRDVAL),quality:'single_source'};
  const suspended=r.open===0&&r.high===0&&r.low===0&&r.volume===0&&r.turnover===0;
  if(!suspended&&(r.low<=0||r.high<r.low||r.open<r.low||r.open>r.high||r.close<r.low||r.close>r.high))throw Error('KRX_OHLC');
  out.push({code,rows:[r],...meta});
 }return out;
}
export function observationRecords(observations){
 return observations.flatMap(o=>o.rows.flatMap(r=>['open','high','low','volume','turnover'].filter(field=>finite(r[field])&&(!['open','high','low'].includes(field)||r[field]>0)).map(field=>({code:o.code,date:r.date,field,value:r[field],unit:field==='volume'?'shares':'KRW',publishedAt:null,availableAt:o.availableAt,observedAt:o.observedAt,sourceUrl:o.sourceUrl,snapshotHash:o.rawHash,adjustmentsVerified:o.adjustmentsVerified===true}))));
}
/** Parse only the explicitly headed daily table, never the live quote above it. */
export function parseAlphaExtracted(text,code,{input,sourceUrl,observedAt}){
 const u=new URL(sourceUrl);if(!['alphasquare.co.kr','m.alphasquare.co.kr'].includes(u.hostname)||u.searchParams.get('code')!==code||!input.assets.some(a=>a.code===code))throw Error('ALPHA_REQUEST_TARGET');
 const clean=text.replace(/^L\d+: ?/gm,''),head=clean.match(/^# [^\n]+ \((\d{6})\) 주가 및 종목 정보/m);if(head?.[1]!==code)throw Error('ALPHA_BODY_TARGET');
 const marker='## 일별 주가',start=clean.indexOf(marker);if(start<0)throw Error('ALPHA_DAILY_TABLE');const section=clean.slice(start+marker.length).split(/\n## /)[0];
 if(!/날짜\s*\|\s*시가\s*\|\s*고가\s*\|\s*저가\s*\|\s*종가\s*\|\s*거래량\s*\|\s*거래대금/.test(section))throw Error('ALPHA_TABLE_UNITS');
 const cutoff=completedCloseDate(input,new Date(observedAt)),seen=new Set(),rows=[];
 for(const line of section.split('\n')){const cols=line.split('|').map(x=>x.trim());if(!/^\d{4}\.\d{2}\.\d{2}$/.test(cols[0]))continue;if(cols.length!==7||cols.slice(1).some(x=>!/^\d[\d,]*(?:\.\d+)?$/.test(x)))throw Error('ALPHA_ROW');const date=cols[0].replaceAll('.','-');if(!day(date)||seen.has(date))throw Error('ALPHA_DATE_DUPLICATE');seen.add(date);if(date>cutoff)continue;if(!input.calendar.sessions.includes(date))throw Error('ALPHA_NONSESSION');
  const [open,high,low,close,volume,turnover]=cols.slice(1).map(x=>Number(x.replaceAll(',','')));if(![open,high,low,close,volume,turnover].every(finite)||close<=0||volume<0||turnover<0||low<=0||high<low||open<low||open>high||close<low||close>high)throw Error('ALPHA_OHLC');
  rows.push({date,open,high,low,close,volume,turnover,quality:'single_source'});
 }if(!rows.length)throw Error('ALPHA_NO_DAILY_ROWS');
 return{code,rows:rows.sort((a,b)=>a.date.localeCompare(b.date)),...provenance({sourceUrl,observedAt,rawHash:sha(text)}),provider:'ALPHASQUARE',rawHashType:'web_extracted_text',rawOriginHtmlAvailable:false};
}
/** Existing closes are never changed here. Source conflicts stay visible and unused. */
export function currentFomoAudit(input,{observations=[],records=[],now=new Date()}={}){
 const at=now.toISOString(),requestedDate=new Intl.DateTimeFormat('sv-SE',{timeZone:'Asia/Seoul'}).format(now),cutoff=completedCloseDate(input,now),conflicts=[];
 let view=structuredClone(input);view.fomoInformationAsOf=at;view.informationAsOf=at;
 const sourceRecords=observationRecords(observations),eligible=[];
 for(const r of [...sourceRecords,...records]){
  const asset=view.assets.find(a=>a.code===r.code),p=asset?.prices.find(p=>p.date===r.date),obs=observations.find(o=>o.code===r.code&&o.rows.some(p=>p.date===r.date)),quote=obs?.rows.find(p=>p.date===r.date);
  if(!p||p.date>cutoff||p.quality==='conflict'||quote&&quote.close!==p.close){conflicts.push({code:r.code,date:r.date,field:r.field,reason:'retained_close_missing_or_conflicting'});continue;}
  eligible.push(r);
 }
 if(eligible.length)view=mergeFomoRecords(view,{schema:'atlas-fomo-records-2',records:eligible},{now:at});
 const stocks52=view.assets.map(a=>{
  const calc=calculateFomoV2({input:view,code:a.code,date:requestedDate});
  return{code:a.code,name:a.name,asOf:calc.asOf,observedAt:at,fullFomoScore:calc.score,priceHeat:calc.priceHeat,partialPriceHeatLabel:'종가 기반 가격 열기 · FOMO 전체 점수 아님',coreCoverage:calc.coverage,coreTotal:calc.total,missing:calc.missing,subindices:Object.fromEntries(calc.features.map(f=>[f.id,{value:f.value,score:f.score,referenceCount:f.referenceCount,status:f.status}])),windowDates:calc.windowDates,forecastIntegration:{enabled:false,reason:'FOMO 관측과 향후 가격 영향 검증은 별개; 엄격한 당시 빈티지·수급·관심 이력 필요'},trustProbability:null};
 });
 return{schema:COMPLETION_FOMO,at,cutoffDate:cutoff,stocks52,fullFomoCount:stocks52.filter(s=>s.fullFomoScore!==null).length,partialPriceHeatCount:stocks52.filter(s=>s.priceHeat!==null).length,conflicts,acceptedRecords:eligible,appliedToOperatingInput:false};
}
/** Bounded public acquisition. Injected fetch is useful for an approved provider, never a bypass. */
export async function collectCompletionFomo(input,{now=new Date(),onSnapshot=async()=>{},sourceOptions={},naverId,naverSecret,fetcher=globalThis.fetch,krxKey='',krxServices=[],maxKrxRequests=12}={}){
 const at=now.toISOString(),cutoffDate=completedCloseDate(input,now);if(!cutoffDate)throw Error('NO_COMPLETED_SESSION');
 if(!Number.isInteger(maxKrxRequests)||maxKrxRequests<1||maxKrxRequests>1000)throw Error('KRX_REQUEST_BUDGET');
 const copy={...input,actualAsOf:cutoffDate},registry=fomoRegistry(copy),priceObservations=[],failures=[],rawSnapshots=[];
 const keep=async s=>{await onSnapshot(s);rawSnapshots.push({sourceUrl:s.source?.url??s.metadata?.source,rawHash:s.metadata.contentSha256,observedAt:s.metadata.observedAt});};
 // One NAVER download supplies OHLCV and every price-derived FOMO feature.
 const price=await collectSources52(registry,{deadlineMs:20000,timeoutMs:4000,maxAttempts:1,perHostConcurrency:2,circuitThreshold:2,...sourceOptions,onSnapshot:async s=>{await keep(s);priceObservations.push(naverPriceObservation(s.body,s.source.codes[0],{input:copy,sourceUrl:s.source.url,observedAt:s.metadata.observedAt}));}});
 // Avoid a duplicate NAVER price download inside the older combined collector.
 let searchRecords=[],search=copy.assets.map(a=>({code:a.code,status:'not_configured',reason:'NAVER_CLIENT_ID/NAVER_CLIENT_SECRET 필요'}));
 if(naverId&&naverSecret){
  const searchOnly=await collectSearchOnly(copy,{now,onSnapshot:keep,naverId,naverSecret,fetcher});
  search=searchOnly.search;searchRecords=searchOnly.records;
 }
 // Each requested date/market is downloaded once for all 52 targets.
 const krx={status:krxKey&&krxServices.length?'attempted':'not_configured',attempted:0,success:0,failed:0,deferred:0};
 if(krxKey&&krxServices.length){
  const jobs=[],set=new Set();for(const s of krxServices){const u=new URL(s.endpoint);if(u.protocol!=='https:'||u.hostname!=='openapi.krx.co.kr'||u.port&&u.port!=='443'||!/^\/svc\/apis\/sto\/[a-z0-9_]+$/.test(u.pathname)||u.search||u.username||u.password||!day(s.start))throw Error('KRX_APPROVED_ENDPOINT_REQUIRED');for(const date of copy.calendar.sessions.filter(d=>d>=s.start&&d<=cutoffDate)){const key=u.href+date;if(!set.has(key)){set.add(key);jobs.push({date,endpoint:u.href});}}}
  let stopped=false;for(const job of jobs){if(stopped||krx.attempted>=maxKrxRequests){krx.deferred++;continue;}krx.attempted++;const u=new URL(job.endpoint);u.searchParams.set('basDd',job.date.replaceAll('-',''));
   try{const r=await fetcher(u.href,{headers:{AUTH_KEY:krxKey,Accept:'application/json'},redirect:'error',signal:AbortSignal.timeout(5000)});if(!r.ok)throw Object.assign(Error('HTTP_'+r.status),{status:r.status});const bytes=await boundedBody(r,5000000),observedAt=new Date().toISOString(),source={url:u.href,codes:registry.codes},metadata={contentSha256:sha(bytes),observedAt};const parsed=parseKrxStockDaily(bytes,{date:job.date,input:copy,sourceUrl:u.href,observedAt});await keep({body:bytes,source,metadata});priceObservations.push(...parsed);krx.success++;}
   catch(e){krx.failed++;failures.push({provider:'KRX',date:job.date,reason:e.status?'HTTP_'+e.status:'NETWORK_OR_INVALID_RESPONSE'});if(krx.failed>=2||[401,403,429].includes(e.status))stopped=true;}
  }
 }
 const observationTimes=[...priceObservations,...searchRecords].map(x=>Date.parse(x.observedAt)).filter(Number.isFinite),auditAt=new Date(Math.max(now.getTime(),...observationTimes));
 const audit=currentFomoAudit(input,{observations:priceObservations,records:searchRecords,now:auditAt}),seen=new Set(priceObservations.filter(o=>o.rows.some(r=>r.date===cutoffDate)).map(o=>o.code));
 return{...audit,priceObservations,searchRecords,priceCollection:price.report,rawSnapshots,search,krx,failures,priceSuccessCount:seen.size,stocks52:audit.stocks52.map(s=>({...s,priceStatus:seen.has(s.code)?'observed_completed_close':'not_observed_completed_close',searchStatus:search.find(x=>x.code===s.code)?.status??'missing',flowStatus:'official_individual_flow_required'})),exitCode:seen.size===52&&audit.fullFomoCount===52?0:2};
}
async function boundedBody(response,maximum){const reader=response.body.getReader(),parts=[];let size=0;try{while(true){const {done,value}=await reader.read();if(done)break;size+=value.byteLength;if(size>maximum)throw Error('BODY_LIMIT');parts.push(value);}}finally{await reader.cancel().catch(()=>{});}return Buffer.concat(parts);}
async function collectSearchOnly(input,{now,onSnapshot,naverId,naverSecret,fetcher}){
 const records=[],search=[],dates=input.calendar.sessions.filter(d=>d<=input.actualAsOf),start=dates.at(-500)??dates[0];let failures=0;
 for(let i=0;i<input.assets.length;i+=5){const group=input.assets.slice(i,i+5);if(failures>=2){search.push(...group.map(a=>({code:a.code,status:'deferred',reason:'search_provider_circuit_open'})));continue;}
  const request={startDate:start,endDate:input.actualAsOf,timeUnit:'date',keywordGroups:group.map(a=>({groupName:a.code,keywords:[a.name+' 주가',a.code+' 주가']}))},requestText=JSON.stringify(request),queryId=sha(requestText),url='https://openapi.naver.com/v1/datalab/search';
  try{const response=await fetcher(url,{method:'POST',redirect:'error',signal:AbortSignal.timeout(5000),headers:{'Content-Type':'application/json','X-Naver-Client-Id':naverId,'X-Naver-Client-Secret':naverSecret},body:requestText});if(!response.ok)throw Error('HTTP_'+response.status);const raw=await boundedBody(response,4000000),data=JSON.parse(raw),snapshotHash=sha(raw),observedAt=new Date().toISOString();
   if(data.startDate!==request.startDate||data.endDate!==request.endDate||data.timeUnit!=='date'||!Array.isArray(data.results)||data.results.length!==group.length||new Set(data.results.map(s=>s.title)).size!==group.length)throw Error('SEARCH_ENVELOPE');
   const next=[];for(const a of group){const series=data.results.find(s=>s.title===a.code),seen=new Set();if(!series||!Array.isArray(series.data))throw Error('SEARCH_TARGET');for(const row of series.data){if(!day(row.period)||seen.has(row.period)||!finite(row.ratio)||row.ratio<0||row.ratio>100)throw Error('SEARCH_RATIO');seen.add(row.period);if(dates.includes(row.period))next.push({code:a.code,date:row.period,field:'searchIndex',value:row.ratio,unit:'relative-100',queryId,publishedAt:null,availableAt:observedAt,observedAt,sourceUrl:url,snapshotHash,adjustmentsVerified:false});}}
   await onSnapshot({body:raw,source:{url,codes:group.map(a=>a.code)},metadata:{contentSha256:snapshotHash,observedAt,queryId,request}});records.push(...next);search.push(...group.map(a=>({code:a.code,status:'observed',queryId})));failures=0;
  }catch(e){failures++;search.push(...group.map(a=>({code:a.code,status:'failed',reason:/^HTTP_\d+$/.test(e.message)?e.message:'NETWORK_OR_INVALID_RESPONSE'})));}
 }return{records,search};
}
