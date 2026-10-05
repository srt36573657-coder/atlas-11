// Separate, append-only shadow research. Never rewrites an issued baseline forecast.
import {hashString} from './engine.mjs';
export const EVOLUTION_POLICY=Object.freeze({id:'next-session-ridge-residual-1',lambda:5,minimumDates:5,maxDates:20,
  targetRule:'next_session_only',issuanceRule:'before_target_korean_calendar_day',end:'2026-10-30',
  intervalMeaning:'experimental_shifted_uncalibrated',promotion:'none',causeIdentification:'unknown'});
const clone=x=>structuredClone(x);
const finite=x=>typeof x==='number'&&Number.isFinite(x);
const positive=x=>finite(x)&&x>0;
const time=x=>{const value=x instanceof Date?x.toISOString():x;return typeof value==='string'&&/T.*(?:Z|[+-]\d{2}:\d{2})$/.test(value)?Date.parse(value):NaN;};
const iso=x=>{const t=time(x);if(!Number.isFinite(t))throw new TypeError('Valid evolution observation time required');return new Date(t).toISOString();};
const kdate=t=>new Date(t+9*3600000).toISOString().slice(0,10);
const close=d=>time(d+'T15:30:00+09:00');
const start=d=>time(d+'T00:00:00+09:00');
const fingerprint=x=>{const s=JSON.stringify(x);return hashString(s)+'-'+hashString([...s].reverse().join(''))+'-'+s.length;};
const newState=()=>({schema:1,versions:[],evaluations:[],proposals:[],runs:[],notes:[],activeId:null});
function stateOf(value){
 if(value==null)return newState();
 if(value.schema!==1)throw new Error('Unknown evolution schema: preserve before migration');
 for(const key of ['versions','evaluations','proposals','runs'])if(!Array.isArray(value[key]))throw new TypeError('Invalid evolution history '+key);
 const result=clone(value);if(result.notes===undefined)result.notes=[];else if(!Array.isArray(result.notes))throw new TypeError('Invalid evolution notes');return result;
}
export function mergeEvolution(existing,incoming){
 const out=stateOf(existing),other=stateOf(incoming);
 for(const key of ['versions','evaluations','proposals','runs','notes']){
  const seen=new Map(out[key].map(x=>[x.id,JSON.stringify(x)]));
  for(const row of other[key]){if(seen.has(row.id)){if(seen.get(row.id)!==JSON.stringify(row))throw new Error('Evolution immutable record conflict: '+key+':'+row.id);continue;}out[key].push(clone(row));seen.set(row.id,JSON.stringify(row));}
 }
 return out;
}
function visiblePrices(input,now){
 const result=new Map(),sessions=new Set(input.calendar.sessions);
 for(const asset of input.assets){
  const dates=new Map();for(const p of asset.prices??[]){const list=dates.get(p.date)??[];list.push(p);dates.set(p.date,list);}
  const valid=new Map();
  for(const [date,matches] of dates){
   if(matches.length!==1||!sessions.has(date)||close(date)>now)continue;
   const p=matches[0];
   if(!positive(p.close)||p.quality==='conflict')continue;
   // Revisions after the calculation cutoff must not leak their replacement value.
   const revisions=(input.priceRevisions??[]).filter(r=>r.code===asset.code&&r.date===date);
   if(revisions.some(r=>!Number.isFinite(time(r.at))||time(r.at)>now))continue;
   const latest=revisions.slice().sort((a,b)=>time(a.at)-time(b.at)).at(-1);
   const revisionMatches=latest&&(latest.after===p.close||latest.afterRow?.close===p.close);
   if(latest&&!revisionMatches)continue;
   const observed=time(revisionMatches?latest.at:(p.observedAt??p.retrievedAt??p.featureObservedAt));
   if(!Number.isFinite(observed)||observed>now||observed<close(date))continue;
   const materialRevision=revisions.filter(r=>r.before!==r.after||r.beforeRow?.quality!==r.afterRow?.quality).sort((a,b)=>time(a.at)-time(b.at)).at(-1);
   const vintage=fingerprint({code:asset.code,date,close:p.close,quality:p.quality??null,revisionAt:materialRevision?.at??null});
   valid.set(date,{...p,observedAt:new Date(observed).toISOString(),vintage});
  }
  result.set(asset.code,valid);
 }
 return result;
}
function genuinelyProspective(version,target,now){
 const issued=time(version.issuedAt??version.createdAt),known=time(version.informationCutoff);
 return !version.isRetrospectiveReconstruction&&Number.isFinite(issued)&&Number.isFinite(known)
  &&issued<=now&&known<=issued&&issued<start(target)&&known<start(target);
}
function trainingFor(code,input,versions,original,prices,ledger,now){
 const sessions=input.calendar.sessions,candidates=new Map();
 for(const v of versions){
  if(v.id===original?.id||v.status==='SHADOW_RESEARCH')continue;
  const oi=sessions.indexOf(v.origin),target=sessions[oi+1];
  if(oi<0||!target||target<input.origin||target>EVOLUTION_POLICY.end||!genuinelyProspective(v,target,now))continue;
  const a=v.assets?.find(a=>a.code===code),r=a?.rows?.find(r=>r.date===target),p=prices.get(code)?.get(target);
  if(!positive(r?.p50)||!p)continue;
  const residual=Math.log(p.close)-Math.log(r.p50);
  if(!finite(residual))continue;
  const candidate={code,date:target,horizon:1,forecastId:v.id,predicted:r.p50,actual:p.close,residual,
   forecastIssuedAt:v.issuedAt??v.createdAt,informationCutoff:v.informationCutoff,actualObservedAt:p.observedAt,
   actualVintageId:p.vintage,ledgerIds:ledger.filter(l=>l.code===code&&l.date===target&&l.forecastId===v.id&&l.actual===p.close&&l.predicted===r.p50).map(l=>l.id)};
  const prior=candidates.get(target);
  // Most recently issued eligible next-session forecast is selected before looking at its error.
  if(!prior||time(candidate.forecastIssuedAt)>time(prior.forecastIssuedAt)||(time(candidate.forecastIssuedAt)===time(prior.forecastIssuedAt)&&String(candidate.forecastId)>String(prior.forecastId)))candidates.set(target,candidate);
 }
 const refs=[...candidates.values()].sort((a,b)=>a.date.localeCompare(b.date)).slice(-EVOLUTION_POLICY.maxDates);
 const numerator=refs.reduce((s,r)=>s+r.horizon*r.residual,0),denominator=EVOLUTION_POLICY.lambda+refs.reduce((s,r)=>s+r.horizon*r.horizon,0);
 const trained=refs.length>=EVOLUTION_POLICY.minimumDates;
 return {status:trained?'TRAINED':'INSUFFICIENT',count:refs.length,minimum:EVOLUTION_POLICY.minimumDates,
  correction:trained?numerator/denominator:0,numerator,denominator,lambda:EVOLUTION_POLICY.lambda,
  refs,policy:EVOLUTION_POLICY.id,meaning:'experimental_log_return_shift_not_validated_skill'};
}
function scalePrice(value,shift){
 if(!positive(value))return null;
 if(shift===0)return value;
 const output=Math.exp(Math.log(value)+shift);
 return positive(output)?output:null;
}
export function updateEvolution({input,versions=[],original,active,evaluationLedger=[],evolution,originalSHA=null}={},now=new Date()){
 const out=stateOf(evolution),issuedAt=iso(now),nowMs=time(issuedAt),today=kdate(nowMs);
 original=typeof original==='string'?(versions.find(v=>v.id===original)??{id:original}):original;
 if(!input?.calendar?.sessions||!Array.isArray(input.assets))return out;
 const end=input.end<EVOLUTION_POLICY.end?input.end:EVOLUTION_POLICY.end;
 if(today>end||today<input.origin)return out;
 const available=visiblePrices(input,nowMs);
 // Evaluate frozen shadow forecasts only after a genuine, observed outcome exists.
 const initialEvaluationCount=out.evaluations.length;
 const evaluationIds=new Set(out.evaluations.map(e=>e.id));
 for(const v of out.versions)for(const a of v.assets??[])for(const r of a.rows??[]){
  if(r.horizon<1||!genuinelyProspective(v,r.date,nowMs)||!positive(r.p50)||!positive(r.baselineP50))continue;
  const p=available.get(a.code)?.get(r.date);if(!p)continue;
  const id=[v.id,a.code,r.date,p.vintage].join(':');if(evaluationIds.has(id))continue;
  out.evaluations.push({id,versionId:v.id,sourceId:v.sourceId,code:a.code,name:a.name,date:r.date,
   issuedAt:v.issuedAt,predicted:r.p50,baselinePredicted:r.baselineP50,actual:p.close,
   errorWon:p.close-r.p50,baselineErrorWon:p.close-r.baselineP50,
   absolutePercentageError:Math.abs(p.close-r.p50)/p.close,baselineAbsolutePercentageError:Math.abs(p.close-r.baselineP50)/p.close,
   observedAt:p.observedAt,recordedAt:issuedAt,actualVintageId:p.vintage,diagnosis:'UNKNOWN',
   diagnosisDetail:'가격 차이만으로 뉴스나 방정식의 특정 항을 원인으로 확정할 수 없음',trainingEligible:false});evaluationIds.add(id);
 }
 const baseline=typeof active==='string'?versions.find(v=>v.id===active):active;
 if(!baseline?.assets?.length)return out;
 const baselineIssued=time(baseline.createdAt??baseline.issuedAt),baselineKnown=time(baseline.informationCutoff);
 if(!Number.isFinite(baselineIssued)||!Number.isFinite(baselineKnown)||baselineKnown>baselineIssued||baselineIssued>nowMs)throw new Error('Unknown or future baseline information cannot seed evolution');
 if(baseline.status==='SHADOW_RESEARCH')throw new Error('A shadow forecast cannot become its own baseline');
 const unique=new Map();for(const v of [...versions,original?.assets?original:null,baseline].filter(Boolean)){
  const prior=unique.get(v.id);if(prior&&JSON.stringify(prior)!==JSON.stringify(v))throw new Error('Conflicting baseline forecast identity '+v.id);unique.set(v.id,v);
 }
 const origin=input.calendar.sessions.filter(d=>d<=end&&close(d)<=nowMs).at(-1);
 if(!origin)return out;
 const trainings=new Map(baseline.assets.map(a=>[a.code,trainingFor(a.code,input,[...unique.values()],original,available,evaluationLedger,nowMs)]));
 const semantic={policy:EVOLUTION_POLICY,sourceId:baseline.id,sourceOrigin:baseline.origin,end,
  assets:baseline.assets.map(a=>({code:a.code,rows:a.rows.map(r=>[r.date,r.p50,r.p10,r.p90]),training:trainings.get(a.code).refs.map(r=>[r.date,r.forecastId,r.predicted,r.actual,r.actualVintageId])}))};
 const inputFingerprint=fingerprint(semantic);
 const matching=out.versions.filter(v=>v.inputFingerprint===inputFingerprint&&time(v.issuedAt)<=nowMs).sort((a,b)=>time(a.issuedAt)-time(b.issuedAt)).at(-1);
 if(matching){
  out.activeId=matching.id;
  if(out.evaluations.length>initialEvaluationCount){const newIds=out.evaluations.slice(initialEvaluationCount).map(e=>e.id);out.runs.push({id:'evaluation-'+fingerprint(newIds),at:issuedAt,status:'OUTCOMES_APPENDED',inputFingerprint,evaluationsAdded:newIds.length,independentValidationCount:0});}
  return out;
 }
 const id='shadow-'+issuedAt.replace(/[-:.]/g,'')+'-'+inputFingerprint;
 const assets=baseline.assets.map(a=>{
  const training=trainings.get(a.code),originIndex=input.calendar.sessions.indexOf(origin);
  const rows=a.rows.filter(r=>r.date>=input.origin&&r.date<=end).map(r=>{
   const horizon=Math.max(0,input.calendar.sessions.indexOf(r.date)-originIndex),future=close(r.date)>nowMs&&r.date<=end;
   const shift=future?training.correction*horizon:0;
   const p50=scalePrice(r.p50,shift),p10=scalePrice(r.p10,shift),p90=scalePrice(r.p90,shift);
   return {date:r.date,horizon,baselineP50:r.p50??null,baselineP10:r.p10??null,baselineP90:r.p90??null,p50,p10,p90,
    adjusted:future&&training.status==='TRAINED'&&shift!==0,numericStatus:[[r.p50,p50],[r.p10,p10],[r.p90,p90]].some(([before,after])=>positive(before)&&after===null)?'numeric_range_limit':'finite_or_missing',
    intervalMeaning:EVOLUTION_POLICY.intervalMeaning};
  });
  return {code:a.code,name:a.name,sector:a.sector,originPrice:a.originPrice,training,rows};
 });
 const previous=out.versions.find(v=>v.id===out.activeId)??out.versions.at(-1);
 out.versions.push({id,sourceId:baseline.id,sourceOrigin:baseline.origin,origin,end,issuedAt,informationCutoff:issuedAt,
  status:'SHADOW_RESEARCH',isRetrospectiveReconstruction:false,inputFingerprint,originalSHA:originalSHA??out.versions[0]?.originalSHA??null,
  policy:clone(EVOLUTION_POLICY),assets,rangeCalibration:'UNVERIFIED',promoted:false});
 out.activeId=id;
 out.proposals.push({id:id+':proposal',versionId:id,issuedAt,kind:'SHADOW_RESIDUAL_UPDATE',status:'EXPERIMENT_ONLY',
  reason:previous?'새 기준 전망 또는 관측 잔차가 달라져 별도 연구안을 저장':'별도 비교 연구 시작; 충분한 실제 사전 발행 오차가 없으면 기존 선과 동일',
  changes:assets.map(a=>({code:a.code,previousCorrection:previous?.assets.find(p=>p.code===a.code)?.training.correction??null,
   correction:a.training.correction,count:a.training.count,status:a.training.status,trainingRefs:a.training.refs.map(r=>({date:r.date,forecastId:r.forecastId,actualVintageId:r.actualVintageId}))})),
  causalClaim:false,automaticallyPromoted:false,factorChanges:[]});
 out.runs.push({id:id+':run',at:issuedAt,versionId:id,inputFingerprint,status:'SHADOW_SAVED',
  trainedStocks:assets.filter(a=>a.training.status==='TRAINED').length,stockCount:assets.length,
  distinctTrainingDates:new Set(assets.flatMap(a=>a.training.refs.map(r=>r.date))).size,
  independentValidationCount:0});
 return out;
}
