import test from 'node:test';
import assert from 'node:assert/strict';
import {initialState, clientState, refreshState, upgradeState, mergeRefresh} from '../lib/service.mjs';
import {updateEvolution} from '../lib/evolution.mjs';
import {sealStudy, verifyStudySeal} from '../lib/sealed-manifest.mjs';
import {mergeSealedState, syncSealedState, mergeBenchmark} from '../lib/sealed-state.mjs';

function fixture() {
 const codes=['005930','000660'], sessions=['2026-09-17','2026-09-18','2026-09-21','2026-09-28','2026-10-30'];
 const input={schema:2,newsSchema:1,origin:'2026-09-17',end:'2026-10-30',actualAsOf:'2026-09-18',informationAsOf:'2026-09-18T08:00:00Z',events:[],calendar:{sessions},assets:codes.map(code=>({code,name:code,sector:'semiconductor',
  prices:[{date:'2026-09-17',close:100,quality:'single_source',observedAt:'2026-09-17T08:00:00Z'},{date:'2026-09-18',close:101,quality:'single_source',observedAt:'2026-09-18T08:00:00Z'}],
  priceSource:{provider:'LOCAL_FIXTURE',priceVintageVerified:true,corporateActionsChecked:true,basisId:'fixture-basis'}}))};
 const version={id:'2026-09-17-00000001',origin:input.origin,end:input.end,modelVersion:'atlas-news-8.1.0',createdAt:'2026-09-17T08:00:00Z',informationCutoff:'2026-09-17T08:00:00Z',assets:codes.map(code=>({code,name:code,sector:'semiconductor',originPrice:100,news:[],rows:sessions.slice(1).map((date,i)=>({date,p50:101+i,p10:90,p90:115,rawProbUp:.55}))}))};
 const evolution=updateEvolution({input,versions:[version],original:version,active:version.id,evaluationLedger:[]},new Date('2026-09-18T08:00:00Z'));
 const study=sealStudy({schema:1,id:'LOCAL-SERVICE-FIXTURE',createdAt:'2026-09-18T08:00:00Z',origin:input.origin,end:input.end,informationCutoff:'2026-09-17T16:00:00+09:00',retrospective:true,sessions,recordCount:4,
  policy:{scoring:{alpha:.2,directionFlatThresholdReturn:0,magnitudeToleranceReturn:null}},provenance:{fixtureOnly:true},
  assets:codes.map(code=>({code,name:code,sector:'semiconductor',originPrice:100,priceBasisStatus:'VERIFIED',priceBasisId:'fixture-basis',newsEvidence:[],reasons:[],rows:sessions.map(date=>({date,widthReturn:.1,widthStatus:'CALIBRATED',
   a:{status:'ESTIMATED',centerReturn:0,price:100,lowerReturn:-.1,upperReturn:.1},b:{status:'ESTIMATED',centerReturn:.02,price:102,lowerReturn:-.08,upperReturn:.12},reasons:[]}))}))});
 return {input,original:version,candidate:structuredClone(version),priorVersions:[],evaluationLedger:[],evolution,
  sealedStudy:{schema:1,studies:[study],reports:[],proofs:[],errors:[]},
  atlasBenchmark:{schema:1,status:'OBSERVED_ONLY',prices:[{date:'2026-09-17',close:100,quality:'single_source'},{date:'2026-09-18',close:101,quality:'single_source'}],collectionLogs:[{at:'2026-09-18T08:00:00Z',status:'LOCAL_FIXTURE'}],revisions:[],conflicts:[]}};
}

test('service hydration scores Date-clock inputs, preserves frozen study and client projection seal',()=>{
 const bundle=fixture(),original=JSON.stringify(bundle),state=initialState(bundle);
 assert.equal(JSON.stringify(bundle),original);
 assert.ok(state.sealedStudy.reports.some(r=>r.date==='2026-09-18'),'initialState must produce available daily report');
 assert.deepEqual(state.sealedStudy.studies,bundle.sealedStudy.studies);
 assert.equal(verifyStudySeal(state.sealedStudy.studies[0]).valid,true);
 const client=clientState(state);
 assert.deepEqual(client.sealedStudy,state.sealedStudy);
 assert.equal(verifyStudySeal(client.sealedStudy.studies[0]).valid,true);
 assert.equal(client.sealedStudy.studies[0].seal.digest,bundle.sealedStudy.studies[0].seal.digest);
});

test('unchanged release upgrade and repeated reporting preserve state identity and report IDs',()=>{
 const bundle=fixture(),state=initialState(bundle);bundle.evolution=structuredClone(state.evolution);
 const before=JSON.stringify(state.sealedStudy),reportIds=state.sealedStudy.reports.map(r=>r.id);
 assert.equal(upgradeState(state,bundle),state);
 assert.equal(syncSealedState(state,{now:new Date('2026-09-28T08:00:00Z')}),state);
 assert.equal(JSON.stringify(state.sealedStudy),before);
 assert.deepEqual(state.sealedStudy.reports.map(r=>r.id),reportIds);
});

test('conflicting study/report imports retain originals and quarantine incoming evidence once',()=>{
 const branch=initialState(fixture()).sealedStudy,study=branch.studies[0];
 const changed=structuredClone(study);delete changed.seal;changed.provenance.changed=true;
 const incoming=structuredClone(branch);incoming.studies=[sealStudy(changed)];
 incoming.reports[0].summary.trustProbability=.99;
 const original=JSON.stringify(branch),merged=mergeSealedState(branch,incoming);
 assert.equal(JSON.stringify(branch),original);
 assert.deepEqual(merged.studies,branch.studies);assert.deepEqual(merged.reports,branch.reports);
 assert.ok(merged.errors.some(e=>e.field==='studies'&&e.reason==='CONFLICTING_IMMUTABLE_RECORD'));
 assert.ok(merged.errors.some(e=>e.field==='reports'&&e.reason==='CONFLICTING_IMMUTABLE_RECORD'));
 assert.deepEqual(mergeSealedState(merged,incoming),merged);
});

test('invalid imported study cannot replace source or receive a scored report',()=>{
 const branch=initialState(fixture()).sealedStudy,bad=structuredClone(branch.studies[0]);bad.assets[0].rows[0].a.price=999;
 const merged=mergeSealedState(branch,{schema:1,studies:[bad],reports:[],proofs:[],errors:[]});
 assert.deepEqual(merged.studies,branch.studies);assert.equal(merged.errors.at(-1).reason,'INVALID_STUDY_SEAL');
 const onlyBad=mergeSealedState(null,{schema:1,studies:[bad],reports:[],proofs:[],errors:[]});
 assert.equal(onlyBad.studies.length,0);assert.ok(onlyBad.errors.length);
});

test('malformed release branches fail closed without losing original history or breaking hydration',()=>{
 const state=initialState(fixture()),before=JSON.stringify(state.sealedStudy);
 for(const bad of [
  {schema:99,studies:[],reports:[],proofs:[],errors:[]},
  {schema:1,studies:{unexpected:true},reports:[],proofs:[],errors:[]},
  {schema:1,studies:[],reports:{unexpected:true},proofs:[],errors:[]},
  {schema:1,studies:[],reports:[],proofs:{unexpected:true},errors:[]},
  {schema:1,studies:[],reports:[],proofs:[],errors:{unexpected:true}},
 ]){
  let merged;assert.doesNotThrow(()=>{merged=mergeSealedState(state.sealedStudy,bad);});
  assert.deepEqual(merged.studies,state.sealedStudy.studies);assert.deepEqual(merged.reports,state.sealedStudy.reports);
  assert.ok(merged.errors.length>state.sealedStudy.errors.length,'malformed release requires an explicit preserved failure');
  const bundle=fixture();bundle.sealedStudy=bad;
  assert.doesNotThrow(()=>initialState(bundle));
 }
 assert.equal(JSON.stringify(state.sealedStudy),before);
});

test('malformed saved records are quarantined while valid local study and reports survive',()=>{
 const state=initialState(fixture()),valid=structuredClone(state.sealedStudy),bad=structuredClone(valid);
 bad.studies.push(null,42,{id:'MALFORMED_LOCAL_STUDY'});
 bad.reports.push(null);bad.proofs.push(null);
 const original=JSON.stringify(bad);let merged;
 assert.doesNotThrow(()=>{merged=mergeSealedState(bad,null);});
 assert.equal(JSON.stringify(bad),original);
 assert.deepEqual(merged.studies,valid.studies);
 assert.deepEqual(merged.reports,valid.reports);
 assert.ok(merged.errors.length>valid.errors.length);
 assert.doesNotThrow(()=>syncSealedState({...state,sealedStudy:merged},{now:new Date('2026-09-28T08:00:00Z')}));
 for(const field of ['studies','reports','proofs']){
  const incoming=structuredClone(valid);incoming[field]=[null,{},12];
  const next=mergeSealedState(valid,incoming);assert.deepEqual(next[field],valid[field]);assert.ok(next.errors.length>valid.errors.length);
 }
});

test('partial refresh preserves sealed paths/history, records benchmark failure and adds only observed outcomes',async()=>{
 const state=initialState(fixture()),sealed=JSON.stringify(state.sealedStudy.studies),priorReports=structuredClone(state.sealedStudy.reports),benchmark=structuredClone(state.atlasBenchmark);
 const fetcher=async url=>{const u=new URL(url);if(u.hostname!=='fchart.stock.naver.com'||u.searchParams.get('symbol')!=='005930')throw Error('local fixture unavailable');return new Response('<chartdata symbol="005930"><item data="20260928|105|106|104|105|100"/></chartdata>');};
 const next=await refreshState(state,{now:new Date('2026-09-28T08:00:00Z'),fetcher,benchmarkCollector:async()=>{throw Error('benchmark fixture offline');}});
 assert.equal(JSON.stringify(next.sealedStudy.studies),sealed);assert.deepEqual(next.atlasBenchmark,benchmark);
 for(const old of priorReports)assert.deepEqual(next.sealedStudy.reports.find(r=>r.id===old.id),old);
 const report=next.sealedStudy.reports.filter(r=>r.date==='2026-09-28').at(-1);
 assert.ok(report,'available issuer should create partial daily report');assert.equal(report.summary.actualAvailable,1);assert.equal(report.summary.missingActual,1);
 assert.equal(report.rows.find(r=>r.code==='000660').actual,null);
 assert.equal(next.collectionLogs.at(-1).partial,true);assert.equal(next.collectionLogs.at(-1).exitCode,2);
 assert.equal(next.collectionLogs.at(-1).benchmark.status,'FAILED');assert.match(next.collectionLogs.at(-1).benchmark.error,/benchmark fixture offline/);
});

test('explicit benchmark failure with no replacement cannot erase last normal data',async()=>{
 const state=initialState(fixture()),before=structuredClone(state.atlasBenchmark);
 const next=await refreshState(state,{now:new Date('2026-09-28T08:00:00Z'),fetcher:async()=>{throw Error('offline fixture');},
  benchmarkCollector:async()=>({exitCode:2,benchmark:null,log:{status:'FAILED',error:'no usable benchmark result'}})});
 assert.deepEqual(next.atlasBenchmark,before);
 assert.equal(next.collectionLogs.at(-1).partial,true);assert.equal(next.collectionLogs.at(-1).exitCode,2);
 assert.equal(next.collectionLogs.at(-1).benchmark.error,'no usable benchmark result');
});

test('refresh merge preserves both report branches and benchmark conflicts without rewriting studies',()=>{
 const state=initialState(fixture()),incoming=structuredClone(state);
 incoming.atlasBenchmark.prices[1].close=102;
 incoming.atlasBenchmark.collectionLogs.push({at:'2026-09-28T08:00:00Z',status:'FAILED',error:'fixture preserved failure'});
 const modified=structuredClone(incoming.sealedStudy.reports[0]);modified.id+='-alternate';modified.summary.note='separate saved report';incoming.sealedStudy.reports.push(modified);
 Object.defineProperty(incoming,'refreshBase',{value:{input:state.input,atlasBenchmark:structuredClone(state.atlasBenchmark)}});
 // Simultaneous local correction must win over a stale refresh-base replacement.
 state.atlasBenchmark.prices[1].close=103;
 const merged=mergeRefresh(state,incoming);
 assert.deepEqual(merged.sealedStudy.studies,state.sealedStudy.studies);
 assert.ok(merged.sealedStudy.reports.some(r=>r.id===modified.id));
 assert.equal(merged.atlasBenchmark.prices.find(p=>p.date==='2026-09-18').close,103);
 assert.ok(merged.atlasBenchmark.conflicts.some(c=>c.date==='2026-09-18'));
 assert.ok(merged.atlasBenchmark.collectionLogs.some(c=>c.error==='fixture preserved failure'));
});

test('caller-supplied proof flags cannot turn daily reports into external temporal proof',()=>{
 const bundle=fixture(),study=bundle.sealedStudy.studies[0];
 bundle.sealedStudy.proofs.push({id:'forged-flag-only',studyId:study.id,studyDigest:study.seal.digest,status:'VERIFIED_AGAINST_PROVIDED_ROOT',fixtureOnly:false});
 const state=initialState(bundle);assert.ok(state.sealedStudy.reports.length);
 for(const report of state.sealedStudy.reports){assert.equal(report.externallyProven,false);assert.equal(report.temporalProof,'LOCAL_DECLARED_TIME_ONLY');assert.equal(report.summary.trustProbability,null);}
});

test('benchmark merge does not silently replace local corrections or discard previous failure logs',()=>{
 const prior=fixture().atlasBenchmark,incoming=structuredClone(prior);incoming.prices[1].close=110;incoming.collectionLogs=[{at:'2026-09-28T08:00:00Z',status:'FAILED'}];
 const merged=mergeBenchmark(prior,incoming);
 assert.equal(merged.prices[1].close,101);assert.equal(merged.conflicts.length,1);assert.equal(merged.collectionLogs.length,2);
 assert.deepEqual(mergeBenchmark(merged,incoming),merged);
});
