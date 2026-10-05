import test from 'node:test';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {applyReviewedBenchmarkResearch} from '../scripts/install_benchmark_research.mjs';
import {benchmarkScore} from '../lib/benchmark-score.mjs';

const now='2026-09-28T02:00:00Z',observedAt='2026-09-27T17:00:00Z';
const hash=s=>createHash('sha256').update(s).digest('hex');
const dates=['2026-09-17','2026-09-18'];
function fixture(){
 const failure={at:'2026-09-27T16:00:00Z',provider:'NAVER',status:'failed',error:'BENCHMARK_TIMEOUT',exitCode:2};
 const bundle={input:{calendar:{sessions:dates},actualAsOf:dates[1],assets:[],events:[]},original:{id:'original-fixture',rows:[1,2]},candidate:{id:'candidate-fixture'},priorVersions:[{id:'prior-fixture'}],atlasBenchmark:{code:'KOSPI',prices:[],collectionLogs:[failure]},sealedStudy:{schema:1,studies:[],reports:[{id:'preserved-report'}],proofs:[{id:'preserved-proof'}],errors:[]}};
 const rows=dates.map((date,i)=>{const url='https://example.org/fixture-kospi/'+date,excerpt='Synthetic fixture close '+(100+i);return {code:'KOSPI',date,close:100+i,observedAt,quality:'press_original_checked',vintageVerified:false,krxLedgerVerified:false,priceVendorDoubleVerified:false,sourceBodyRead:true,source:{provider:'PRESS_ORIGINAL_RESEARCH',url},sources:[{url,publisher:'Synthetic fixture',publishedAt:date+'T16:00:00+09:00',observedAt,originalPageRead:true,sourceBodyRead:true,evidenceExcerpt:excerpt,excerptSHA256:hash(excerpt)}]};});
 return {bundle,research:{schema:1,id:'fixture-reviewed-press-1',code:'KOSPI',createdAt:observedAt,rows}};
}
test('reviewed benchmark import is immutable and identical research cannot duplicate prices or logs',()=>{
 const {bundle,research}=fixture(),before=structuredClone(bundle),next=applyReviewedBenchmarkResearch(bundle,research,{now});
 assert.deepEqual(bundle,before);assert.notEqual(next,bundle);assert.equal(next.atlasBenchmark.prices.length,2);assert.equal(next.atlasBenchmark.collectionLogs.length,2);
 assert.deepEqual(next.atlasBenchmark.collectionLogs[0],bundle.atlasBenchmark.collectionLogs[0]);
 for(const k of ['input','original','candidate','priorVersions','sealedStudy'])assert.deepEqual(next[k],bundle[k]);
 const repeated=applyReviewedBenchmarkResearch(next,structuredClone(research),{now});
 assert.strictEqual(repeated,next);assert.equal(repeated.atlasBenchmark.prices.length,2);assert.equal(repeated.atlasBenchmark.collectionLogs.length,2);
});
test('same research ID with changed values cannot replace the reviewed source record',()=>{
 const {bundle,research}=fixture(),next=applyReviewedBenchmarkResearch(bundle,research,{now}),before=structuredClone(next),changed=structuredClone(research);
 changed.rows[1].close=102;
 assert.throws(()=>applyReviewedBenchmarkResearch(next,changed,{now}),/RESEARCH_ID_CONFLICT/);assert.deepEqual(next,before);
});
test('future observation in row or primary evidence is rejected, including idempotent replay under past now',()=>{
 for(const update of [r=>r.rows[1].observedAt='2026-09-29T00:00:00Z',r=>r.rows[1].sources[0].observedAt='2026-09-29T00:00:00Z']){
  const {bundle,research}=fixture();update(research);assert.throws(()=>applyReviewedBenchmarkResearch(bundle,research,{now}),/RESEARCH_(?:OBSERVATION|SOURCE)_INVALID/);assert.equal(bundle.atlasBenchmark.prices.length,0);
 }
 const {bundle,research}=fixture(),next=applyReviewedBenchmarkResearch(bundle,research,{now});
 assert.throws(()=>applyReviewedBenchmarkResearch(next,research,{now:'2026-09-27T16:00:00Z'}),/RESEARCH_(?:OBSERVATION|SOURCE)_INVALID/);
});
test('conflicting preexisting index close fails atomically and preserves both original bundle and incoming research',()=>{
 const {bundle,research}=fixture();bundle.atlasBenchmark.prices=[{code:'KOSPI',date:dates[0],close:99,observedAt,source:{provider:'NAVER',url:'https://finance.naver.com/sise/sise_index.naver?code=KOSPI'}}];
 const before=structuredClone(bundle),incoming=structuredClone(research);
 assert.throws(()=>applyReviewedBenchmarkResearch(bundle,research,{now}),/BENCHMARK_CONFLICT_KEEP_EXISTING/);assert.deepEqual(bundle,before);assert.deepEqual(research,incoming);
});
test('press research remains an observed diagnostic and never upgrades failed NAVER, vintage or future-forecast certification',()=>{
 const {bundle,research}=fixture(),next=applyReviewedBenchmarkResearch(bundle,research,{now}),log=next.atlasBenchmark.collectionLogs.at(-1);
 assert.equal(next.atlasBenchmark.status,'press_observed');assert.equal(next.atlasBenchmark.sourceStatus,'PRESS_ORIGINAL_CROSSCHECK_NOT_EXCHANGE_LEDGER');
 assert.equal(log.naverCollectionSucceeded,false);assert.equal(log.sourceVerifiedTwice,false);assert.equal(log.exchangeLedgerVerified,false);
 for(const row of next.atlasBenchmark.prices){assert.equal(row.vintageVerified,false);assert.equal(row.krxLedgerVerified,false);assert.equal(row.priceVendorDoubleVerified,false);}
 const study={origin:dates[0],end:'2026-10-30',sessions:dates,createdAt:'2026-09-27T16:00:00Z',informationCutoff:'2026-09-17T16:00:00+09:00'};
 const score=benchmarkScore({study,benchmark:next.atlasBenchmark,date:dates[1],actualReturn:.03,now});
 assert.equal(score.status,'OBSERVED_DIAGNOSTIC');assert.equal(score.forwardExcessForecastStatus,'UNESTIMABLE');assert.equal(score.forward,null);
 const promoted=structuredClone(research);promoted.id='promotion-attempt';promoted.rows[0].vintageVerified=true;
 assert.throws(()=>applyReviewedBenchmarkResearch(bundle,promoted,{now}),/RESEARCH_EVIDENCE_INVALID/);
});
