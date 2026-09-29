import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {gzipSync,gunzipSync} from 'node:zlib';
import {fileURLToPath} from 'node:url';
import {sourceManifest} from './verify_precision.mjs';
import {checkForecast} from '../lib/forecast-engine.mjs';
export const sha=value=>createHash('sha256').update(value).digest('hex');
export const jsonSHA=value=>sha(JSON.stringify(value));
const read=file=>JSON.parse(fs.readFileSync(file));
const forecasts=b=>[b.original,...(b.priorVersions??[]),b.candidate];
const journalPaths=['collectionLogs','actions','updates','evaluationLedger','input.newsRevisions','input.sourceCorrections'];
const get=(b,key)=>key.split('.').reduce((v,k)=>v?.[k],b)??[];
export function engineManifest(root='.'){
 const walk=dir=>fs.readdirSync(path.join(root,dir),{withFileTypes:true}).flatMap(e=>e.isDirectory()?walk(path.join(dir,e.name)):[path.join(dir,e.name)]);
 return Object.fromEntries(walk('lib').sort().map(f=>[f,sha(fs.readFileSync(path.join(root,f)))]));
}
export function captureDailyBefore(bundle,{beforePath,runId,root='.'}){
 return {schemaVersion:1,runId,beforePath,beforeSHA256:sha(fs.readFileSync(path.join(root,beforePath))),original:jsonSHA(bundle.original),
  versions:Object.fromEntries(forecasts(bundle).map(v=>[v.id,jsonSHA(v)])),candidateId:bundle.candidate.id,
  codes:bundle.input.assets.map(a=>a.code).sort(),origin:bundle.input.origin,end:bundle.input.end,
  input:jsonSHA(bundle.input),engineHashes:engineManifest(root),modelVersion:bundle.candidate.modelVersion,
  journals:Object.fromEntries(journalPaths.map(k=>[k,get(bundle,k).map(jsonSHA)]))};
}
export function verifyDailyBundle(bundle,before,{engineHashes}={}){
 assert.equal(bundle.original.id,'2026-09-17-b001c94a');
 assert.equal(jsonSHA(bundle.original),'1af446f745c88cfb308de348f238f2fa8d31265b5322e2f035f5aafb6d5833ca');
 assert.equal(jsonSHA(bundle.original),before.original,'Original forecast mutated');
 const codes=bundle.input.assets.map(a=>a.code).sort();assert.equal(codes.length,52);assert.equal(new Set(codes).size,52);assert.deepEqual(codes,before.codes,'Stock universe changed');
 assert.deepEqual([bundle.input.origin,bundle.input.end],['2026-09-17','2026-10-30']);
 const versions=new Map();for(const v of forecasts(bundle)){const h=jsonSHA(v);if(versions.has(v.id))assert.equal(versions.get(v.id),h,'Conflicting forecast ID');versions.set(v.id,h);}
 for(const [id,h] of Object.entries(before.versions))assert.equal(versions.get(id),h,`Earlier forecast changed: ${id}`);
 for(const [key,hashes] of Object.entries(before.journals)){
  const values=get(bundle,key);assert.ok(values.length>=hashes.length,`Journal shortened: ${key}`);
  hashes.forEach((h,i)=>assert.equal(jsonSHA(values[i]),h,`Journal changed: ${key}[${i}]`));
 }
 if(engineHashes)assert.deepEqual(engineHashes,before.engineHashes,'Daily refresh changed model/engine code');
 assert.equal(bundle.candidate.modelVersion,before.modelVersion);assert.equal(bundle.candidate.trustProbability,null);assert.equal(bundle.candidate.validatedPromotion,false);
 assert.equal(bundle.candidate.assets.length,52);assert.deepEqual(bundle.candidate.assets.map(a=>a.code).sort(),codes);
 assert.equal(checkForecast(bundle.candidate,bundle.input).complete,true,'Current forecast incomplete');
 return {status:'PASS',assets:52,originalSHA256:before.original,priorForecastsPreserved:Object.keys(before.versions).length,
  candidateId:bundle.candidate.id,newForecast:bundle.candidate.id!==before.candidateId,inputChanged:jsonSHA(bundle.input)!==before.input,
  engineUnchanged:!!engineHashes,predictiveAccuracyCertified:false,trustProbability:null};
}
export function verifyDailyFiles(root='.'){
 const bundle=read(path.join(root,'public/data/atlas.json')),meta=bundle.dailyRefresh;
 assert.equal(meta?.schemaVersion,1,'dailyRefresh metadata required');
 const before=read(path.join(root,meta.preservationPath));assert.equal(before.runId,meta.runId);
 const raw=fs.readFileSync(path.join(root,before.beforePath));assert.equal(sha(raw),before.beforeSHA256,'Saved before bundle mutated');
 const saved=JSON.parse(before.beforePath.endsWith('.gz')?gunzipSync(raw):raw);
 assert.deepEqual(captureDailyBefore(saved,{beforePath:before.beforePath,runId:before.runId,root}),before,'Preservation baseline no longer matches saved source/model');
 return {bundle,before,verification:verifyDailyBundle(bundle,before,{engineHashes:engineManifest(root)})};
}
export function verifyDailyTests(root='.'){
 const bundle=read(path.join(root,'public/data/atlas.json'));
 const reportDir=path.dirname(bundle.dailyRefresh.preservationPath);
 assert.deepEqual(sourceManifest(),read(path.join(root,reportDir,'test-sources.json')),'Source changed after test invocation');
 const tap=fs.readFileSync(path.join(root,'reports/tests.tap'),'utf8');
 const n=k=>Number([...tap.matchAll(new RegExp('^# '+k+' (\\d+)\\s*$','gm'))].at(-1)?.[1]);
 assert.ok(n('pass')>=218);for(const k of ['fail','cancelled','skipped','todo'])assert.equal(n(k),0);assert.equal(n('tests'),n('pass'));
 return {passed:n('pass'),failed:0,sha256:sha(tap),type:'functional_regression_not_predictive_accuracy'};
}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url)){
 const command=process.argv[2];
 if(command==='capture'){
  const b=read('public/data/atlas.json');fs.writeFileSync(path.join(path.dirname(b.dailyRefresh.preservationPath),'test-sources.json'),JSON.stringify(sourceManifest(),null,2)+'\n');
 }else console.log(JSON.stringify(verifyDailyFiles().verification));
}
