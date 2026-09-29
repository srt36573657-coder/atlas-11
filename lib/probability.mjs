import {scopeOf,appliesTo} from "./news-scope.mjs";
// Chronological probability calibration: tuning, acceptance, then untouched audit.
import { hashString } from './engine.mjs';
export function calibrationEvidenceKey(input,cutoff,code) {
 const assets=input.assets.filter(a=>!code||a.code===code);
 return hashString(JSON.stringify({prices:assets.map(a=>[a.code,a.sector,a.prices.filter(p=>p.date<=cutoff).map(p=>[p.date,p.close,p.quality])]),events:input.events.filter(e=>e.targetDate<=cutoff&&(!code||assets.some(a=>appliesTo(e,a)))).map(e=>[e.id,e.kind,e.targetDate,scopeOf(e),e.status,e.availableAt,e.sources?.map(s=>s.url)])}));
}
export const CALIBRATION_VERSION = 'atlas-calibration-1';
export const clamp = p => Math.max(0, Math.min(1, p));
export const shrinkProbability = (p, alpha) => clamp(0.5 + alpha * (p - 0.5));
const avg = a => a.length ? a.reduce((s,x)=>s+x,0)/a.length : null;
export function probabilityScores(rows, alpha = 1) {
  const p = rows.map(r=>({p:shrinkProbability(r.prob,alpha),y:r.actualUp?1:0}));
  const bins = Array.from({length:5},(_,i)=>{
    const a=p.filter(r=>Math.min(4,Math.floor(r.p*5))===i);
    return {from:i/5,to:(i+1)/5,n:a.length,predicted:avg(a.map(r=>r.p)),observed:avg(a.map(r=>r.y))};
  });
  return {n:p.length,origins:new Set(rows.map(r=>r.origin)).size,
    brier:avg(p.map(r=>(r.p-r.y)**2)),baselineBrier:p.length?0.25:null,
    logLoss:avg(p.map(r=>-(r.y*Math.log(Math.max(1e-6,r.p))+(1-r.y)*Math.log(Math.max(1e-6,1-r.p))))),bins};
}
export function fitCalibration(records, engineVersion, trainedThrough) {
  const origins=[...new Set(records.map(r=>r.origin))].sort(),
    gateStart=origins[Math.floor(origins.length*0.50)],auditStart=origins[Math.floor(origins.length*0.75)];
  const horizons=[...new Set(records.map(r=>r.horizon))].sort((a,b)=>a-b);
  const groups=horizons.map(h=>{
    const all=records.filter(r=>r.horizon===h),
      train=all.filter(r=>r.origin<gateStart&&r.target<gateStart),
      gate=all.filter(r=>r.origin>=gateStart&&r.origin<auditStart&&r.target<auditStart),
      audit=all.filter(r=>r.origin>=auditStart),
      candidates=[0,0.25,0.5,0.75,1].map(alpha=>({alpha,...probabilityScores(train,alpha)}));
    const enough=probabilityScores(train).origins>=8&&probabilityScores(gate).origins>=3;
    const selected=[...candidates].sort((a,b)=>(a.brier??Infinity)-(b.brier??Infinity)||b.alpha-a.alpha)[0].alpha;
    const accepted=enough&&probabilityScores(gate,selected).brier<=probabilityScores(gate,1).brier;
    const alpha=accepted?selected:1;
    return {horizon:h,alpha,status:accepted&&alpha!==1?'chronologically_selected':accepted?'raw_passed_gate':'raw_insufficient_or_no_gain',
      candidates,train:probabilityScores(train,alpha),gateRaw:probabilityScores(gate,1),gateSelected:probabilityScores(gate,alpha),
      auditRaw:probabilityScores(audit,1),auditSelected:probabilityScores(audit,alpha),
      trainLastTarget:train.map(r=>r.target).sort().at(-1),gateStart,gateLastTarget:gate.map(r=>r.target).sort().at(-1),auditStart};
  });
  return {schema:1,version:CALIBRATION_VERSION,engineVersion,trainedThrough,groups,
    note:'시간순 분할·목표일 간격을 지킨 사후 이력 검증. 같은 날 52종목은 독립 표본이 아님. 당시 데이터 빈티지 미확인.'};
}
export function calibratedProbability(raw, horizon, calibration, origin, engineVersion) {
  const group=calibration?.groups?.find(g=>g.horizon===horizon);
  const usable=group&&calibration.engineVersion===engineVersion&&calibration.trainedThrough<origin;
  return {value:usable?shrinkProbability(raw,group.alpha):raw,raw,
    alpha:usable?group.alpha:1,status:usable?group.status:'raw_unvalidated_horizon',
    auditOrigins:usable?group.auditSelected.origins:0};
}
