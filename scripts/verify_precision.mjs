import fs from 'node:fs';
import path from 'node:path';
import {createHash} from 'node:crypto';
import assert from 'node:assert/strict';
import {checkForecast} from '../lib/news-engine.mjs';
const read=p=>JSON.parse(fs.readFileSync(p));
const hash=x=>createHash('sha256').update(x).digest('hex'),jh=x=>hash(JSON.stringify(x));
export function sourceManifest(){
 const files=['package.json','package-lock.json','vite.config.mjs','server.mjs'];
 const walk=dir=>{for(const e of fs.readdirSync(dir,{withFileTypes:true})){const p=dir+'/'+e.name;if(e.isDirectory())walk(p);else if(e.isFile()&&!p.endsWith('.pyc'))files.push(p);}};
 for(const p of ['lib','src','tests','scripts','netlify'])walk(p);
 return Object.fromEntries(files.sort().map(p=>[p,hash(fs.readFileSync(p))]));
}
export function verifyPrecision(){
 const b=read('public/data/atlas.json'),old=read('reports/precision-before/preservation.json');
 assert.equal(jh(b.original),old.original);assert.equal(jh(b.input.assets),old.prices);assert.equal(jh(b.input.events),old.events);
 assert.deepEqual([b.input.origin,b.input.end],old.window);assert.deepEqual(b.input.assets.map(a=>a.code),old.codes);
 const versions=new Map([b.original,...b.priorVersions,b.candidate].map(v=>[v.id,jh(v)]));
 for(const [id,h] of Object.entries(old.versions))assert.equal(versions.get(id),h,'Changed prior forecast '+id);
 for(const k of ['evaluation','collectionLogs','actions'])assert.equal(jh(b[k]),old[k]);
 assert.deepEqual(b.updates.slice(0,old.updates.length),old.updates);
 assert.ok(checkForecast(b.candidate,b.input).complete);assert.equal(b.candidate.assets.length,52);
 assert.equal(b.candidate.paths,20000);assert.equal(b.candidate.trustProbability,null);
 const previous=b.priorVersions.find(v=>v.id===old.candidateId);
 let rows=0,maximumMeanChange=0;
 for(const a of b.candidate.assets){
  const pa=previous.assets.find(v=>v.code===a.code);
  for(let i=0;i<a.rows.length;i++){
   const r=a.rows[i]; rows++;
   assert.equal(r.date,pa.rows[i].date);assert.equal(r.mean,pa.rows[i].mean);assert.equal(r.exactVariance,pa.rows[i].exactVariance);
   assert.equal(r.numericStatus,'finite');assert.ok(r.p10<=r.p50&&r.p50<=r.p90);
   if(i===1){assert.equal(r.distributionMethod,'exact_one_step_empirical_distribution');assert.equal(r.probabilityMonteCarloSE,0);}
   if(i>1){const p=r.numericalPrecision;assert.equal(p.method,'fixed_n_dkw_massart');assert.equal(p.paths,20000);assert.equal(p.familySize,52*(a.rows.length-1));assert.ok(p.singleDistribution.cdfErrorBound>0);assert.ok(p.wholeForecast.cdfErrorBound>p.singleDistribution.cdfErrorBound);assert.equal(p.trustProbability,null);}
  }
 }
 assert.equal(b.pressResearch.report.baselineId,b.candidate.id);
 assert.equal(b.cycleResearch.report.baselineId,b.candidate.id);
 const news=read('reports/news-recheck-7-20260926.json');assert.equal(news.rechecks.length,7);assert.equal(new Set(news.rechecks.map(r=>r.code)).size,7);assert.equal(news.newVerifiedScheduledEvents,0);assert.equal(news.allNewsComplete,false);
 return {status:'PASS',assets:52,rows,paths:20000,priorForecastsPreserved:Object.keys(old.versions).length,originalSHA256:old.original,maximumMeanChange,exactFirstStepStocks:52,predictiveAccuracyCertified:false,trustProbability:null};
}
export function verifyFreshTests(){
 assert.deepEqual(sourceManifest(),read('reports/precision-test-sources.json'),'Source changed after test invocation');
 const tap=fs.readFileSync('reports/tests.tap','utf8'),n=k=>Number([...tap.matchAll(new RegExp('^# '+k+' (\\d+)\\s*$','gm'))].at(-1)?.[1]);
 assert.ok(n('pass')>=198);for(const k of ['fail','cancelled','skipped','todo'])assert.equal(n(k),0);
 assert.equal(n('tests'),n('pass'));return {passed:n('pass'),failed:0,sha256:hash(tap)};
}
if(process.argv[1]&&path.resolve(process.argv[1])===path.resolve(new URL(import.meta.url).pathname)){
 const command=process.argv[2]??'all';
 if(command==='capture')fs.writeFileSync('reports/precision-test-sources.json',JSON.stringify(sourceManifest(),null,2)+'\n');
 else if(command==='tests')console.log(JSON.stringify(verifyFreshTests()));
 else if(command==='data')console.log(JSON.stringify(verifyPrecision()));
 else console.log(JSON.stringify({data:verifyPrecision(),tests:verifyFreshTests()}));
}
