import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {createHash} from 'node:crypto';
import {gunzipSync} from 'node:zlib';
import {fitConditionalPath,CONDITIONAL_POLICY} from '../lib/conditional-return.mjs';
import {forecast as currentForecast} from '../lib/forecast-engine.mjs';
import {forecast as legacyForecast} from '../lib/news-engine.mjs';
const b=JSON.parse(fs.readFileSync(new URL('../public/data/atlas.json',import.meta.url)));
const original=JSON.parse(fs.readFileSync(new URL('../reports/implementation-8.0/preservation.json',import.meta.url)));
const hash=x=>createHash('sha256').update(JSON.stringify(x)).digest('hex');
const opts={origin:b.candidate.origin,informationCutoff:b.candidate.informationCutoff,createdAt:'2026-09-27T02:00:00Z',paths:2000,seed:412};
const near=(a,c)=>assert.ok(Math.abs(a-c)<Math.max(1e-8,Math.abs(c)*1e-10),`${a} != ${c}`);
test('immutable v8 installation preserves every earlier forecast, original, input, evaluation and failures',()=>{
 // Installation is a historical transition, not a claim that later daily inputs never change.
 const descriptor=JSON.parse(fs.readFileSync(new URL('../reports/implementation-8.0/installed-state.json.sha256',import.meta.url)));
 const raw=fs.readFileSync(new URL('../'+descriptor.path,import.meta.url));
 assert.equal(createHash('sha256').update(raw).digest('hex'),descriptor.sha256);
 const plain=gunzipSync(raw);assert.equal(createHash('sha256').update(plain).digest('hex'),descriptor.jsonSHA256);
 const b=JSON.parse(plain);
 assert.equal(hash(b.original),original.original);assert.equal(hash(b.input),original.input);
 const versions=new Map([b.original,...b.priorVersions,b.candidate].map(v=>[v.id,hash(v)]));
 for(const [id,h] of Object.entries(original.versions))assert.equal(versions.get(id),h,id);
 for(const key of ['evaluation','collectionLogs','actions'])assert.equal(hash(b[key]),original[key]);
 assert.equal(b.candidate.modelVersion,'atlas-news-8.0.0');assert.equal(b.candidate.trustProbability,null);
 assert.equal(b.candidate.validatedPromotion,false);assert.equal(b.candidate.assets.length,52);
});
test('selection is before 9/17; later observed prices update features, not chosen coefficients',()=>{
 const input=structuredClone(b.input),asset=input.assets[0],targets=b.candidate.targets;
 const before=fitConditionalPath(asset,input,opts.origin,targets);
 asset.prices.find(p=>p.date===opts.origin).close*=1.1;
 const after=fitConditionalPath(asset,input,opts.origin,targets);
 assert.deepEqual(before.models,after.models);assert.equal(before.trainedThrough,'2026-09-16');
 assert.notDeepEqual(before.rows,after.rows);
 for(const m of before.models)assert.ok(m.coefficients.reduce((s,x)=>s+Math.abs(x),0)<1);
 assert.ok(Math.abs(before.models.reduce((s,m)=>s+m.weight,0)-1)<1e-12);
 for(const m of before.models)for(const f of m.folds)assert.ok(f.origin<f.targetEnd&&f.targetEnd<input.origin);
});
test('future quotes are excluded and missing continuity is null, not a zero-return estimate',()=>{
 const input=structuredClone(b.input),a=input.assets[0],targets=b.candidate.targets;
 const before=fitConditionalPath(a,input,opts.origin,targets);
 a.prices.push({date:targets.at(-1),close:99999999,quality:'single_source'});
 assert.deepEqual(fitConditionalPath(a,input,opts.origin,targets),before);
 const previous=input.calendar.sessions.filter(d=>d<opts.origin).at(-1);
 a.prices=a.prices.filter(p=>p.date!==previous);
 const held=fitConditionalPath(a,input,opts.origin,targets);
 assert.equal(held.status,'UNAVAILABLE');assert.equal(held.rows[1].meanLogReturn,null);
});
test('conditional arithmetic agrees with an analytic deterministic shift, all 52 stocks',()=>{
 const old=legacyForecast(b.input,opts),next=currentForecast(b.input,opts);
 let different=0;
 for(const a of next.assets){
  const prior=old.assets.find(x=>x.code===a.code);let shift=0;
  for(let j=0;j<a.rows.length;j++){
   const r=a.rows[j];shift+=r.conditionalReturn.meanLogReturn;
   near(r.mean,prior.rows[j].mean*Math.exp(shift));near(r.exactVariance,prior.rows[j].exactVariance*Math.exp(2*shift));
   assert.ok(r.p10<=r.p50&&r.p50<=r.p90);assert.ok(r.rawProbUp===null||r.rawProbUp>=0&&r.rawProbUp<=1);
   if(j>1)assert.equal(r.numericalPrecision.assumptions,'iid_paths_from_frozen_model_fixed_sample_size');
  }
  if(a.rows.at(-1).p50!==prior.rows.at(-1).p50)different++;
  for(const p of a.news){if(!p.used)assert.equal(p.impact,null);else if(p.impact){assert.ok(p.impact.distributionChangePP>=0);assert.equal(p.impact.causal,false);}}
 }
 assert.ok(different>0);assert.equal(next.conditionalPolicy.id,CONDITIONAL_POLICY.id);
});
test('conditioning cannot read other companies news or prices through its input',()=>{
 const input=structuredClone(b.input),a=input.assets[1],targets=b.candidate.targets;
 const before=fitConditionalPath(a,input,opts.origin,targets);
 input.assets[0].prices.forEach(p=>p.close*=3);input.events=[];
 assert.deepEqual(fitConditionalPath(a,input,opts.origin,targets),before);
});
