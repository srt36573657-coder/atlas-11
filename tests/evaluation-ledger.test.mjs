import test from 'node:test';import assert from 'node:assert/strict';
import {appendEvaluationLedger,latestEvaluationRows} from '../lib/evaluation-ledger.mjs';
const input={origin:'2026-09-17',end:'2026-10-30',actualAsOf:'2026-09-18',calendar:{sessions:['2026-09-17','2026-09-18']},events:[],assets:[{code:'005930',name:'fixture',prices:[{date:'2026-09-18',close:98,quality:'single_source'}]}]};
const version={id:'test-version',modelVersion:'test',createdAt:'2026-09-17T08:00:00Z',informationCutoff:'2026-09-17T07:00:00Z',origin:'2026-09-17',isRetrospectiveReconstruction:false,assets:[{code:'005930',name:'fixture',originPrice:95,rows:[{date:'2026-09-18',p50:100,p10:90,p90:110,rawProbUp:.6}],news:[]}]};
test('frozen score keeps amount, percentage denominators, direction and probabilistic scoring distinct',()=>{
 const [r]=appendEvaluationLedger([],[version],input);
 assert.equal(r.errorWon,-2);assert.equal(r.absolutePercentageError,2/98);assert.equal(r.errorReturn,-2/95);
 assert.equal(r.evaluationKind,'PROSPECTIVE');assert.equal(r.directionMatched,true);assert.equal(r.interval.inside,true);
 assert.equal(r.brier,(.6-1)**2);assert.equal(r.priceHit,null);assert.equal(r.trustProbability,null);
});
test('later publication and reconstructed forecasts never become prospective scores',()=>{
 for(const change of [{createdAt:'2026-09-18T07:00:00Z'},{informationCutoff:'2026-09-18T07:00:00Z'},{isRetrospectiveReconstruction:true}])
  assert.equal(appendEvaluationLedger([],[{...version,...change}],input)[0].evaluationKind,'RECONSTRUCTED_OR_LATE');
});
test('retries are idempotent and corrected actuals append without rewriting scores',()=>{
 // Distinct observed corrections must have ordered recording times; wall-clock millisecond ties are not a chronology.
 const old=appendEvaluationLedger([],[version],input,{now:'2026-09-19T08:00:00Z'}),frozen=JSON.stringify(old);
 assert.deepEqual(appendEvaluationLedger(old,[version],input),old);
 const changed=structuredClone(input);changed.assets[0].prices[0].close=102;
 const next=appendEvaluationLedger(old,[version],changed,{now:'2026-09-20T08:00:00Z'});
 assert.equal(next.length,2);assert.equal(JSON.stringify(old),frozen);assert.deepEqual(next[0],old[0]);
 assert.equal(latestEvaluationRows(next)[0].actual,102);
});
test('missing, conflicting or origin prices cannot be counted as successful predictions',()=>{
 for(const p of [{date:'2026-09-18',close:null},{date:'2026-09-18',close:98,quality:'conflict'},{date:'2026-09-17',close:95}]){
  const changed=structuredClone(input);changed.assets[0].prices=[p];assert.equal(appendEvaluationLedger([],[version],changed).length,0);
 }
});
test('matching price does not certify equation correctness or tune parameters',()=>{
 const changed=structuredClone(input);changed.assets[0].prices[0].close=100;
 const [r]=appendEvaluationLedger([],[version],changed);
 assert.equal(r.errorWon,0);assert.ok(r.diagnosis.some(d=>d.kind==='UNEXPLAINED'&&d.status==='UNKNOWN'));
 assert.equal(r.repairStatus,'NOT_AUTOMATICALLY_TUNED');
});
