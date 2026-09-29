import {mappingFingerprint} from './cycle-training.mjs';
import {pricesAsOf} from './evidence.mjs';
import {CYCLE_PROTOCOL as P,assertCycleUniverse} from './cycle-protocol.mjs';
import {emptyCycleData,cycleSnapshot,resolveCycleMapping} from './cycle-data.mjs';
import {prepareCycleFeatures,causalStates,stateAt} from './cycle-features.mjs';
import {fitCycleModel,cycleCorrection,shiftedCandidate} from './cycle-model.mjs';
import {pairedCycleAudit} from './cycle-validation.mjs';
import {mean,quantile,correlation,sha256} from './cycle-math.mjs';
export function describePair(aligned){
 const original=aligned,statesAll=causalStates(original.residual);
 const indices=original.market.map((r,i)=>r.date>=P.researchStart&&r.date<=P.parameterSelectionCutoff?i:-1).filter(i=>i>=0);
 aligned={market:indices.map(i=>original.market[i]),sector:indices.map(i=>original.sector[i]),residual:indices.map(i=>original.residual[i])};
 const n=aligned.market.length,segments=[[0,Math.floor(n/3)],[Math.floor(n/3),Math.floor(2*n/3)],[Math.floor(2*n/3),n]];
 const lags=P.leadLags.map(lag=>{
  const parts=segments.map(([lo,hi])=>{
   const a=[],b=[],res=[];
   for(let i=lo;i<hi;i++){const j=i-lag;if(j<lo||j>=hi)continue;const x=aligned.sector[j]?.value,y=aligned.market[i]?.value,z=aligned.residual[j]?.value;if(Number.isFinite(x)&&Number.isFinite(y)){a.push(x);b.push(y);}if(Number.isFinite(z)&&Number.isFinite(y))res.push([z,y]);}
   return {n:a.length,correlation:correlation(a,b),residualCorrelation:correlation(res.map(r=>r[0]),res.map(r=>r[1]))};
  });
  return {lag,parts,stableSign:parts.every(p=>p.correlation!=null)&&parts.every(p=>Math.sign(p.correlation)===Math.sign(parts[0].correlation)),predictiveEvidence:false};
 });
 const states=indices.map(i=>statesAll[i]),outcomes=[];
 for(const horizon of [5,10,20]){
  let last=-Infinity;const samples=[];
  for(let i=0;i<n-horizon;i++){
   if(i<=last)continue;const state=stateAt(statesAll,states[i].date);
   const future=aligned.residual.slice(i+1,i+horizon+1);
   if(!state||future.some(r=>!Number.isFinite(r.value)))continue;
   samples.push({date:states[i].date,state:state.label,value:future.reduce((s,r)=>s+r.value,0)});last=i+horizon;
  }
  const unconditional=mean(samples.map(s=>s.value));
  outcomes.push({horizon,nonoverlap:samples.length,groups:[...new Set(samples.map(s=>s.state))].map(label=>{const rows=samples.filter(s=>s.state===label).map(s=>s.value);return {state:label,n:rows.length,mean:mean(rows),median:quantile(rows,.5),lower:quantile(rows,.1),upper:quantile(rows,.9),difference:mean(rows)-unconditional};})});
 }
 return {researchStart:P.researchStart,researchEnd:P.parameterSelectionCutoff,observations:n,validResidual:aligned.residual.filter(r=>Number.isFinite(r.value)).length,lags,outcomes,commonCycleEstablished:false,reason:'기술 통계. 탐색 후 독립 검증 전이며 반복 주기·예측 우위 미확인'};
}
export function buildCycleResearch(input,version,data=emptyCycleData(input),{cutoff=new Date().toISOString(),runPairAnalysis=false}={}){
 assertCycleUniverse(input);
 if(version.origin<input.origin||version.end!==input.end||version.assets.length!==52)throw Error('주기 기준 전망 불일치');
 const snapshot=cycleSnapshot(data,cutoff,{strict:false}),day=version.origin;
 const rows=[],pairs=new Map(),sharedCache=new Map(),holdout=[],asOfAssets=pricesAsOf(input,cutoff);
 for(const asset of asOfAssets){
  const mapped=resolveCycleMapping(snapshot,asset.code,day);
  const base={code:asset.code,name:asset.name,sectorName:asset.sector,date:day,informationCutoff:cutoff,
   mapping:mapped.mapping??null,status:'abstain',market:null,sector:null,exposure:null,
   correction:null,candidate:null,enabled:false,trustProbability:null,liveWeight:0,reasons:[]};
  if(mapped.status!=='ready'||!snapshot.calendar){base.reasons=[mapped.reason??'공식 거래일 원자료 미확보'];rows.push(base);continue;}
  const {market,sector,mapping}=mapped,pairKey=market.id+':'+sector.id;
  const stockSeries=snapshot.series.find(s=>s.kind==='stock'&&s.stockCode===asset.code);
  const featureAsset=stockSeries?{...asset,prices:stockSeries.rows}:asset;
  const prepared=prepareCycleFeatures(featureAsset,market,sector,snapshot.calendar,day,{shared:sharedCache.get(pairKey)});
  sharedCache.set(pairKey,prepared);
  base.market=prepared.market;base.sector=prepared.sector;base.exposure=prepared.exposure;
  base.marketName=market.name;base.sectorIndexName=sector.name;base.mappingType=mapping.mappingType;
  base.sourceUrls=[market.sourceUrl,sector.sourceUrl,mapping.sourceUrl];base.officialRows={market:market.rows.length,sector:sector.rows.length};
  if(runPairAnalysis&&!pairs.has(pairKey))pairs.set(pairKey,{key:pairKey,...describePair(prepared.aligned)});
  if(!prepared.vector){base.reasons=[prepared.missing];rows.push(base);continue;}
  base.status='descriptive_only';
  const mappingKey=mappingFingerprint(mapped);
  const forecastAsset=version.assets.find(a=>a.code===asset.code),horizons=forecastAsset.rows.slice(1).map((_,i)=>i+1);
  const model=fitCycleModel(snapshot.trainingRows,asset.code,horizons,{mappingKey});base.model=model;base.mappingKey=mappingKey;
  base.reasons=[...model.reasons];holdout.push(...(model.walkForwardHoldout??model.holdout));
  const anchor=stockSeries?.rows.find(r=>r.date===day)?.close;
  const strictCurrent=stockSeries?.adjustmentsVerified===true&&anchor>0&&Math.abs(anchor/forecastAsset.originPrice-1)<1e-8;
  if(!strictCurrent)base.reasons.push('공식 조정 가격·기준 전망 출발가 대조 미완료');
  if(model.fit&&strictCurrent){
   base.correction=cycleCorrection(model.fit,prepared.vector,horizons);
   base.candidate=shiftedCandidate(forecastAsset,base.correction);base.status='research_only';
  }
  rows.push(base);
 }
 const core={protocolHash:sha256(P),baselineId:version.id,origin:version.origin,end:version.end,dataHash:sha256({calendar:snapshot.calendar,series:snapshot.series,mappings:snapshot.mappings,trainingRows:snapshot.trainingRows}),rows};
 return {schema:'atlas-cycle-report-1',id:sha256({...core,rows:rows.map(({informationCutoff,...row})=>row)}),generatedAt:cutoff,protocol:P,...core,rows,
  counts:{assets:rows.length,mapped:rows.filter(r=>r.mapping).length,features:rows.filter(r=>r.exposure&&r.market&&r.sector).length,candidates:rows.filter(r=>r.candidate).length,live:0},
  priceSkillVerified:false,trustProbability:null,pairs:[...pairs.values()],audit:pairedCycleAudit(holdout),
  limits:['10년은 관찰 기간이며 고정 반복 길이가 아님','공식 지수·당시 빈티지·기업행위·회사별 외부 시험을 별도로 확인','모의 경로 비율은 실제 적중 확률이 아님']};
}
export function createCycleState(input,version,{data,collection,cutoff}={}){
 const current=data??emptyCycleData(input);
 return {schema:'atlas-cycle-state-1',data:current,report:buildCycleResearch(input,version,current,{cutoff}),
 collection:collection??{status:'not_collected',success:0,failed:0,deferred:0,reason:'공식 장기 지수 자료·인증된 수집 설정 미확보'},history:[]};
}
export function appendCycleReport(state,input,version,options={}){
 const next=structuredClone(state??createCycleState(input,version)),report=buildCycleResearch(input,version,next.data,options);
 if(next.report?.id!==report.id){if(next.report)(next.history??=[]).push(next.report);next.report=report;}
 else if(options.runPairAnalysis)next.report={...next.report,pairs:report.pairs};
 return next;
}
