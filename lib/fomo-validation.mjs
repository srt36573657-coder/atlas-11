// Candidate validation protocol. A descriptive score never silently becomes a drift.
export const FOMO_VALIDATION=Object.freeze({version:'atlas-fomo-validation-1',cutoff:'2026-09-16',minimumTrain:30,minimumTest:10,ridge:1,horizon:10,independentProspectiveApprovalRequired:true});
export function evaluateFomoCandidate(rows,code){
 const p=FOMO_VALIDATION,eligible=rows.filter(r=>r.code===code&&r.featureCount===18&&r.pointInTimeVerified===true&&r.adjustmentsVerified===true&&Number.isFinite(r.score)&&r.score>=0&&r.score<=100&&Number.isFinite(r.baseLogReturn)&&Number.isFinite(r.actualLogReturn)&&r.targetDate>r.date&&r.targetDate<=p.cutoff&&r.horizon===p.horizon).sort((a,b)=>a.date.localeCompare(b.date));
 const independent=[];for(const r of eligible)if(!independent.length||r.date>independent.at(-1).targetDate)independent.push(r);
 const test=independent.slice(-p.minimumTest),train=independent.slice(0,-p.minimumTest).filter(r=>!test.length||r.targetDate<test[0].date);
 const common={code,eligible:eligible.length,nonoverlap:independent.length,train:train.length,test:test.length,enabled:false,trustProbability:null,liveWeight:0,protocol:p};
 if(train.length<p.minimumTrain||test.length<p.minimumTest)return{...common,status:'insufficient_evidence',coefficient:null,reason:'같은 종목의 완전한 18항목·시점 원본·비중복 평가 자료 부족'};
 const x=r=>(r.score-50)/50,y=r=>r.actualLogReturn-r.baseLogReturn;
 const coefficient=train.reduce((s,r)=>s+x(r)*y(r),0)/(p.ridge+train.reduce((s,r)=>s+x(r)**2,0));
 const mae=fn=>test.reduce((s,r)=>s+Math.abs(fn(r)-r.actualLogReturn),0)/test.length;
 const baseMAE=mae(r=>r.baseLogReturn),candidateMAE=mae(r=>r.baseLogReturn+coefficient*x(r));
 return{...common,status:'retrospective_research_only',coefficient,baseMAE,candidateMAE,improved:candidateMAE<baseMAE,
  reason:'과거 시험은 후보 진단이며 독립적인 향후 검증·승인 이전에는 가격 가중치 0'};
}
