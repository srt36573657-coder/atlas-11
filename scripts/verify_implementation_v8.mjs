import fs from 'node:fs';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {fileURLToPath} from 'node:url';
import path from 'node:path';
import {sourceManifest} from './verify_precision.mjs';
import {checkForecast} from '../lib/forecast-engine.mjs';
const read=f=>JSON.parse(fs.readFileSync(f)),hash=x=>createHash('sha256').update(x).digest('hex'),jh=x=>hash(JSON.stringify(x));
export function verifyImplementation(){
 const b=read('public/data/atlas.json'),before=read('reports/implementation-8.0/preservation.json');
 assert.equal(jh(b.original),before.original);assert.equal(jh(b.input),before.input);
 const versions=new Map([b.original,...b.priorVersions,b.candidate].map(v=>[v.id,jh(v)]));
 for(const [id,h] of Object.entries(before.versions))assert.equal(versions.get(id),h,id);
 for(const k of ['evaluation','collectionLogs','actions'])assert.equal(jh(b[k]),before[k]);
 assert.equal(b.candidate.modelVersion,'atlas-news-8.0.0');assert.equal(b.candidate.trustProbability,null);
 assert.equal(b.candidate.validatedPromotion,false);assert.equal(b.candidate.paths,20000);
 assert.equal(b.candidate.assets.length,52);assert.deepEqual([b.input.origin,b.input.end],['2026-09-17','2026-10-30']);
 assert.equal(checkForecast(b.candidate,b.input).complete,true);
 for(const a of b.candidate.assets){
  assert.equal(a.conditionalPath.status,'RESEARCH_ESTIMATE');assert.ok(a.conditionalPath.trainedThrough<b.input.origin);
  assert.ok(a.rows.every(r=>r.p10<=r.p50&&r.p50<=r.p90&&Number.isFinite(r.mean)));
  assert.ok(a.news.every(n=>n.used||n.impact===null));
 }
 return{status:'PASS',assets:52,forecastRows:b.candidate.rowCount,paths:b.candidate.paths,originalSHA256:before.original,
  priorForecastsPreserved:Object.keys(before.versions).length,candidateId:b.candidate.id,actualAsOf:b.input.actualAsOf,
  evaluationRecords:b.evaluationLedger.length,prospectiveRecords:b.evaluationLedger.filter(r=>r.evaluationKind==='PROSPECTIVE').length,
  sourceInputUnchanged:true,predictiveAccuracyCertified:false,trustProbability:null};
}
export function verifyImplementationTests(){
 assert.deepEqual(sourceManifest(),read('reports/implementation-8.0/test-sources.json'),'Source changed after test invocation');
 const tap=fs.readFileSync('reports/tests.tap','utf8');
 const n=k=>Number([...tap.matchAll(new RegExp('^# '+k+' (\\d+)\\s*$','gm'))].at(-1)?.[1]);
 assert.ok(n('pass')>=218);for(const k of ['fail','cancelled','skipped','todo'])assert.equal(n(k),0);
 assert.equal(n('tests'),n('pass'));return{passed:n('pass'),failed:0,sha256:hash(tap)};
}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url)){
 const command=process.argv[2]??'all';
 if(command==='capture')fs.writeFileSync('reports/implementation-8.0/test-sources.json',JSON.stringify(sourceManifest(),null,2)+'\n');
 else console.log(JSON.stringify({data:verifyImplementation(),...(command==='data'?{}:{tests:verifyImplementationTests()})}));
}
