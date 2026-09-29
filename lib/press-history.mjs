// Newspaper observations are a second description of recorded history, not a daily
// return panel. This module connects them to the selected forecast's evidence checks
// without inventing missing returns, sector membership or a calibrated price effect.
import {sha256,mean,median} from './cycle-math.mjs';
import {pricesAsOf} from './evidence.mjs';
import {assertCycleUniverse} from './cycle-protocol.mjs';

export const PRESS_PROTOCOL=Object.freeze({
 id:'atlas-press-integration-1.0.0',mode:'research_only',
 forecastStart:'2026-09-17',forecastEnd:'2026-10-30',
 annualToDailyConversion:false,sectorMappingInference:false,
 trustProbability:null,defaultLiveWeight:0,
 roundingRule:'half of the last retained decimal unit; conservative when trailing zeros were not preserved',
});
const dateOK=x=>typeof x==='string'&&/^\d{4}-\d{2}-\d{2}$/.test(x)&&Number.isFinite(Date.parse(x))&&new Date(x).toISOString().slice(0,10)===x;
const instant=x=>typeof x==='string'&&/(?:Z|[+-]\d{2}:\d{2})$/.test(x)&&Number.isFinite(Date.parse(x))?Date.parse(x):null;
const finite=x=>typeof x==='number'&&Number.isFinite(x);
const safeURL=x=>{try{const u=new URL(x);return ['https:','http:'].includes(u.protocol)&&!u.username&&!u.password;}catch{return false;}};
const sortedUnique=xs=>[...new Set(xs)].sort();
const copy=x=>structuredClone(x);
const rejection=(id,reason)=>({id,reason});
const periodIdentity=o=>[o.kind,o.stockCode??null,o.indexFamily??null,o.kind==='company'?null:o.entity,o.periodStart??null,o.periodEnd,o.periodType,o.metric,o.unit];

// Both publication and actual collection govern availability. A later conflicting
// source or observation cannot change a report at an earlier information cutoff.
export function pressSnapshot(dataset,{cutoff,stockCodes=[]}={}){
 const limit=instant(cutoff);
 if(limit===null)throw Error('기사 자료 기준 시각에 시간대가 필요합니다.');
 if(dataset?.schema!=='atlas-press-history-1.0'||!Array.isArray(dataset.sources)||!Array.isArray(dataset.observations)||
  dataset.researchWindow?.from!=='2016-09-17'||dataset.researchWindow?.to!=='2026-09-16'||
  dataset.forecastWindow?.from!==PRESS_PROTOCOL.forecastStart||dataset.forecastWindow?.to!==PRESS_PROTOCOL.forecastEnd)throw Error('기사 역사자료 형식·고정 기간 오류');
 const sourceGroups=new Map(),rejected=[],allowedCodes=new Set(stockCodes);
 for(const source of dataset.sources){
  const pub=instant(source.publishedAt),seen=instant(source.observedAt);
  if((pub!==null&&pub>limit)||(seen!==null&&seen>limit))continue;
  if(typeof source.id!=='string'||!source.id||pub===null||seen===null||!safeURL(source.url)||source.verification!=='article_body_read'){
   rejected.push(rejection(source.id??null,'출처·공개 시각·관측 시각·본문 대조 상태 오류'));continue;
  }
  const list=sourceGroups.get(source.id)??[];list.push(source);sourceGroups.set(source.id,list);
 }
 const sources=new Map();
 for(const [id,group] of sourceGroups){
  if(new Set(group.map(sha256)).size!==1){rejected.push(rejection(id,'동일 출처 ID의 상충 기록'));continue;}
  sources.set(id,group[0]);
 }
 const idGroups=new Map(),blockedObservationIds=new Set();
 for(const observation of dataset.observations){
  const at=instant(observation.availableAt),obsAt=observation.observedAt===undefined?null:instant(observation.observedAt);
  if((at!==null&&at>limit)||(obsAt!==null&&obsAt>limit))continue;
  const requestedRefs=Array.isArray(observation.sourceIds)?sortedUnique(observation.sourceIds):[];
  // Additional future coverage must not suppress an already available source.
  // A known conflicting/invalid source remains a rejection, never a future source.
  const isFutureOnly=id=>!sources.has(id)&&!sourceGroups.has(id)&&dataset.sources.some(s=>s.id===id&&((instant(s.publishedAt)??-Infinity)>limit||(instant(s.observedAt)??-Infinity)>limit));
  const refs=requestedRefs.filter(id=>!isFutureOnly(id));
  if(requestedRefs.length&&!refs.length)continue;
  const kind=observation.kind,metric=observation.metric;
  const start=observation.periodStart,end=observation.periodEnd;
  if(typeof observation.id!=='string'||!observation.id||at===null||(observation.observedAt!==undefined&&obsAt===null)||!dateOK(end)||(start!==null&&start!==undefined&&(!dateOK(start)||start>end))||!finite(observation.value)||!refs.length||refs.some(id=>!sources.has(id))){
   rejected.push(rejection(observation.id??null,'관측 식별자·기간·값·가용 시각·출처 오류'));blockedObservationIds.add(observation.id);continue;
  }
  if(!['company','market_index','sector_index'].includes(kind)||typeof observation.entity!=='string'||!observation.entity||
   !['annual','half_year','daily','daily_snapshot','year_end_snapshot','half_year_end_snapshot'].includes(observation.periodType)||
   !(metric==='price_return_pct'&&observation.unit==='percent'||metric==='index_close'&&observation.unit==='point'&&kind!=='company'||metric==='close_price'&&observation.unit==='KRW'&&kind==='company')||
   (metric!=='price_return_pct'&&!(observation.value>0))||
   (kind==='company'&&(!/^\d{6}$/.test(observation.stockCode??'')||(allowedCodes.size&&!allowedCodes.has(observation.stockCode))))){
   rejected.push(rejection(observation.id,'대상·기간 종류·지표·단위 불일치'));blockedObservationIds.add(observation.id);continue;
  }
  const linked=refs.map(id=>sources.get(id));
  const usableAt=Math.max(at,obsAt??-Infinity,...linked.flatMap(s=>[instant(s.publishedAt),instant(s.observedAt)]));
  if(usableAt>limit)continue;
  // A reported date after the cutoff is not observed history, even if its metadata
  // claims it was available earlier. The research boundary is fixed as well.
  const koreaDate=new Date(limit+9*3600000).toISOString().slice(0,10);
  if(end>koreaDate||end>dataset.researchWindow?.to){rejected.push(rejection(observation.id,'역사자료 관측 종료일이 기준 시각 또는 연구 기간 뒤임'));blockedObservationIds.add(observation.id);continue;}
  const normalized={...copy(observation),sourceIds:refs,sourceUrls:sortedUnique(linked.map(s=>s.url)),usableAt:new Date(usableAt).toISOString(),eligibleForDailyModel:false};
  const group=idGroups.get(normalized.id)??[];group.push(normalized);idGroups.set(normalized.id,group);
 }
 const visible=[];
 for(const [id,group] of idGroups){
  if(blockedObservationIds.has(id)){rejected.push(rejection(id,'동일 관측 ID에 유효하지 않은 공개 기록이 함께 존재'));continue;}
  if(new Set(group.map(sha256)).size!==1){rejected.push(rejection(id,'동일 관측 ID의 상충 기록'));continue;}
  visible.push(group[0]);
 }
 const factGroups=new Map();
 for(const o of visible){const key=JSON.stringify(periodIdentity(o)),group=factGroups.get(key)??[];group.push(o);factGroups.set(key,group);}
 const observations=[];
 for(const group of factGroups.values()){
  if(new Set(group.map(o=>o.value)).size!==1){for(const o of group)rejected.push(rejection(o.id,'같은 대상·기간·지표의 상충 값'));continue;}
  group.sort((a,b)=>a.id.localeCompare(b.id));
  // Identical syndicated or repeated numbers are one observation, not extra samples.
  const o=group[0];observations.push({...o,duplicateObservationIds:group.slice(1).map(x=>x.id),sourceIds:sortedUnique(group.flatMap(x=>x.sourceIds)),sourceUrls:sortedUnique(group.flatMap(x=>x.sourceUrls))});
 }
 observations.sort((a,b)=>a.periodEnd.localeCompare(b.periodEnd)||a.id.localeCompare(b.id));
 const used=new Set(observations.flatMap(o=>o.sourceIds)),visibleSources=[...sources.values()].filter(s=>used.has(s.id)).map(copy).sort((a,b)=>a.id.localeCompare(b.id));
 rejected.sort((a,b)=>String(a.id).localeCompare(String(b.id))||a.reason.localeCompare(b.reason));
 return {sources:visibleSources,observations,rejected,hash:sha256({protocol:PRESS_PROTOCOL.id,sources:visibleSources,observations,rejected})};
}

function roundingTolerance(o){
 const decimalPlaces=Number.isInteger(o.reportedDecimalPlaces)&&o.reportedDecimalPlaces>=0&&o.reportedDecimalPlaces<=10?o.reportedDecimalPlaces:null;
 const [mantissa,exponent='0']=String(o.value).toLowerCase().split('e');
 const retained=decimalPlaces??Math.max(0,(mantissa.split('.')[1]?.length??0)-Number(exponent));
 // Floating-point arithmetic allowance scales with the reported number, rather
 // than imposing a fixed floor that would dwarf very small reported returns.
 return {value:.5*10**(-retained)+Number.EPSILON*Math.max(1,Math.abs(o.value))*16,decimalPlaces:retained,precisionAssumed:decimalPlaces===null};
}
function priceAt(asset,date){
 const rows=(asset.prices??[]).filter(r=>r.date===date);
 return rows.length===1&&finite(rows[0].close)&&rows[0].close>0&&rows[0].quality!=='conflict'?rows[0]:null;
}
export function comparePressPrice(observation,asset,sessions,{actualAsOf}={}){
 if(observation.kind!=='company'||observation.stockCode!==asset.code)throw Error('다른 종목의 기사값을 대조할 수 없습니다.');
 const o=observation,isReturn=o.metric==='price_return_pct',date=o.periodEnd;
 const rounded=roundingTolerance(o);
 const base={observationId:o.id,periodType:o.periodType,date,metric:o.metric,reported:o.value,computed:null,
  unit:isReturn?'percentage_point':'KRW',reportedUnit:o.unit,difference:null,tolerance:isReturn?rounded.value:0,
  precisionAssumed:isReturn&&rounded.precisionAssumed,status:'missing',reason:'같은 기간의 보관 가격 미확보',
  flags:['조정가격 기준 미확인','당시 원본 빈티지 미검증','기사와 가격 제공자의 독립성 미확인'],
  referenceDates:[],sourceUrls:[...o.sourceUrls??[]],independentProviderVerification:false};
 if(actualAsOf&&date>actualAsOf)return {...base,reason:'보관 실제 종가 기준일 이후의 기사값'};
 if(!sessions.includes(date))return {...base,reason:'기사의 기간 종료일이 보관 거래일표에 없음'};
 const end=priceAt(asset,date);
 if(!end)return base;
 if(!isReturn){
  if(o.metric!=='close_price'||o.periodType!=='daily_snapshot')return {...base,reason:'지원하지 않는 종가 관측 기간'};
  base.computed=end.close;base.referenceDates=[date];
 }else{
  let priorDate;
  if(o.periodType==='daily'){
   const i=sessions.indexOf(date);priorDate=i>0?sessions[i-1]:null;
  }else if(o.periodType==='annual'||o.periodType==='half_year'){
   // Calendar-year and first-half figures use the preceding year's final close.
   // Never substitute the first quote found in an incomplete local history.
   if(!/^\d{4}-01-01$/.test(o.periodStart??'')||o.periodStart.slice(0,4)!==date.slice(0,4))return {...base,reason:'연간·상반기 기준 날짜를 확정할 수 없음'};
   priorDate=sessions.filter(d=>d<o.periodStart).at(-1);
   if(!priorDate||priorDate.slice(0,4)!==String(Number(o.periodStart.slice(0,4))-1)||!/-12-(?:2[4-9]|3[01])$/.test(priorDate))return {...base,reason:'직전 연말 거래일 기준 종가 미확보'};
   base.flags.push('기사의 정확한 배당·분할 조정 산식 미확인');
  }else return {...base,reason:'해당 기간의 수익률 대조 방식 미지원'};
  const prior=priorDate?priceAt(asset,priorDate):null;
  if(!prior)return {...base,reason:'직전 거래일 또는 직전 연말 종가 미확보',referenceDates:priorDate?[priorDate,date]:[date]};
  base.computed=100*(end.close/prior.close-1);base.referenceDates=[priorDate,date];base.referencePrices=[prior.close,end.close];
 }
 base.difference=base.computed-base.reported;
 if(!finite(base.difference))return {...base,computed:null,difference:null,reason:'수익률 계산이 유한하지 않음'};
 const pass=Math.abs(base.difference)<=base.tolerance;
 return {...base,status:pass?'pass':'warn',reason:pass?'보관 가격과 기사 표시 정밀도 안에서 일치 · 실제 정확도·독립 검증 아님':'같은 종목·기간의 기사값과 보관 가격이 불일치 · 기준 차이·정정·기업행위 여부 확인 필요'};
}

function marketSummaries(observations){
 const groups=new Map();
 for(const o of observations.filter(o=>o.kind==='market_index')){const key=JSON.stringify([o.indexFamily??null,o.entity]),rows=groups.get(key)??[];rows.push(o);groups.set(key,rows);}
 return [...groups.values()].map(rows=>{
  const annual=rows.filter(o=>o.periodType==='annual'&&o.metric==='price_return_pct');
  const values=annual.map(o=>o.value);
  return {entity:rows[0].entity,indexFamily:rows[0].indexFamily??null,observations:rows,annual:{n:values.length,min:values.length?Math.min(...values):null,max:values.length?Math.max(...values):null,mean:mean(values),median:median(values),years:annual.map(o=>o.periodEnd.slice(0,4))},
   meaning:'기사에 확보된 연간 수익률의 기술 통계 · 일별 분포·반복 주기·확률 추정 아님',selectionCompletenessVerified:false};
 });
}
function sectorSummaries(observations){
 const groups=new Map();
 for(const o of observations.filter(o=>o.kind==='sector_index')){const key=JSON.stringify([o.indexFamily??null,o.entity]),rows=groups.get(key)??[];rows.push(o);groups.set(key,rows);}
 return [...groups.values()].map(rows=>({indexFamily:rows[0].indexFamily??null,entity:rows[0].entity,observations:rows,officialMapping:false,classificationContinuityVerified:false,
  meaning:'같은 기사 업종명으로 묶은 참고값 · 구성·분류 연속성 미확인, 개별 기업에 배분하지 않음'})).sort((a,b)=>(a.indexFamily??'').localeCompare(b.indexFamily??'')||a.entity.localeCompare(b.entity));
}

export function buildPressHistoryReport(input,version,dataset,{cutoff=new Date().toISOString()}={}){
 assertCycleUniverse(input);
 if(!version?.id||version.origin<input.origin||version.end!==input.end||version.assets?.length!==52||new Set(version.assets.map(a=>a.code)).size!==52||version.assets.some(a=>!input.assets.some(b=>b.code===a.code)))throw Error('기사 자료를 연결할 52종목 기준 전망이 일치하지 않습니다.');
 const snapshot=pressSnapshot(dataset,{cutoff,stockCodes:input.assets.map(a=>a.code)}),assetRows=pricesAsOf(input,cutoff);
 const sessions=[...input.calendar.sessions];
 if(sessions.some((d,i)=>!dateOK(d)||(i&&sessions[i-1]>=d)))throw Error('정렬된 고유 거래일표가 필요합니다.');
 const rows=assetRows.map(asset=>{
  const observations=snapshot.observations.filter(o=>o.kind==='company'&&o.stockCode===asset.code);
  const priceChecks=observations.map(o=>comparePressPrice(o,asset,sessions,{actualAsOf:input.actualAsOf}));
  const conflicts=priceChecks.filter(p=>p.status==='warn').length;
  return {code:asset.code,name:asset.name,sector:asset.sector,status:observations.length?'context_connected':'no_company_observations',observationCount:observations.length,
   observations,priceChecks,sourceUrls:sortedUnique(observations.flatMap(o=>o.sourceUrls)),
   effects:{centerShift:0,unit:'log_return',priceShift:0,liveWeight:0,dailyTrainingRows:0,
    reason:conflicts?'기사·보관가격 충돌이 있으며 비교 가능한 일별 학습 자료·독립 검증이 없어 가격 보정 유보':'비교 가능한 일별 학습 자료·공식 업종대응·독립 검증이 없어 가격 보정 유보'},
   evidenceDecision:{status:conflicts?'input_conflict':'research_only',numericImpactAllowed:false,trustProbability:null,priceWarnings:conflicts},
   reasons:[...(observations.length?[]:['기업 자체 기사 수치 미확보']),...(conflicts?['기사와 보관 가격의 불일치를 입력 점검 경고에 반영']:[]),
    '시장·업종 기사 수치를 기업 고유 표본으로 간주하지 않음','연간·상반기 수익률을 하루 수익률로 변환하지 않음'],trustProbability:null};
 });
 const checks=rows.flatMap(r=>r.priceChecks),counts={assets:rows.length,sources:snapshot.sources.length,observations:snapshot.observations.length,
  marketObservations:snapshot.observations.filter(o=>o.kind==='market_index').length,sectorObservations:snapshot.observations.filter(o=>o.kind==='sector_index').length,
  companyObservations:snapshot.observations.filter(o=>o.kind==='company').length,linkedCompanies:rows.filter(r=>r.observationCount).length,
  priceChecks:checks.length,pricePass:checks.filter(c=>c.status==='pass').length,priceWarn:checks.filter(c=>c.status==='warn').length,priceMissing:checks.filter(c=>c.status==='missing').length,
  linkedForecasts:rows.length,live:0};
 const core={protocol:PRESS_PROTOCOL.id,datasetHash:snapshot.hash,baselineId:version.id,origin:version.origin,end:version.end,rows,counts};
 return {schema:'atlas-press-report-1',id:sha256(core),...core,informationCutoff:cutoff,generatedAt:cutoff,mode:'research_only',trustProbability:null,
  sources:snapshot.sources,marketSummary:marketSummaries(snapshot.observations),sectorSummary:sectorSummaries(snapshot.observations),rejected:snapshot.rejected,
  eligibility:{appliedToEvidenceChecks:true,appliedToPriceDirection:false,dailyTrainingRows:0,liveWeight:0,priceSkillVerified:false,trustProbability:null},
  limitations:['당시 기사 원본 빈티지·가격의 기업행위 조정·기사와 가격 제공자의 독립성 미검증','기사 자료는 10년 매일의 완전한 가격 이력이 아님',
   '연간·반기 통계는 해당 기간의 실제 참고값이며 이번 예측 기간의 수익률·위험·확률로 환산하지 않음','52종목 공식 과거 업종대응 미확보 · 시장/업종 참고값을 기업 학습에 섞지 않음',
   '이 보고서는 선택한 전망에 새 근거 검사를 연결하며 그 전망의 저장 가격·과거 기록을 수정하지 않음']};
}
