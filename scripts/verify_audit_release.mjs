import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {gunzipSync} from 'node:zlib';
import {fileURLToPath} from 'node:url';
import {sourceManifest} from './verify_precision.mjs';
import {checkForecast} from '../lib/forecast-engine.mjs';
export const sha=x=>createHash('sha256').update(x).digest('hex');
export const jsonSHA=x=>sha(JSON.stringify(x));
export const releaseDirectory='reports/audit-release-8.0.1';
const read=p=>JSON.parse(fs.readFileSync(p));
export const uniqueForecasts=b=>{
 const map=new Map();for(const v of [b.original,...(b.priorVersions??[]),b.candidate]){
  if(map.has(v.id))assert.equal(jsonSHA(map.get(v.id)),jsonSHA(v),'Conflicting forecast ID');map.set(v.id,v);
 }return map;
};
export function captureAuditBefore(b,{beforePath,beforeSHA256}){
 return {schemaVersion:1,beforePath,beforeSHA256,original:jsonSHA(b.original),input:jsonSHA(b.input),
  codes:b.input.assets.map(a=>a.code).sort(),versions:Object.fromEntries([...uniqueForecasts(b)].map(([id,v])=>[id,jsonSHA(v)])),candidateId:b.candidate.id,
  preserved:Object.fromEntries(['evaluation','evaluationLedger','collectionLogs','actions','companyNewsCollection','dailyRefresh','conditionalUpdate','pressResearch','cycleResearch'].map(k=>[k,jsonSHA(b[k]??null)])),
  updates:(b.updates??[]).map(jsonSHA),revision:b.revision??0};
}
export function verifyAuditBundle(b,before){
 assert.equal(b.original.id,'2026-09-17-b001c94a');
 assert.equal(jsonSHA(b.original),'1af446f745c88cfb308de348f238f2fa8d31265b5322e2f035f5aafb6d5833ca');
 assert.equal(jsonSHA(b.original),before.original);assert.equal(jsonSHA(b.input),before.input,'Input changed during code-only repair');
 const codes=b.input.assets.map(a=>a.code).sort();assert.equal(codes.length,52);assert.equal(new Set(codes).size,52);assert.deepEqual(codes,before.codes);
 assert.deepEqual([b.input.origin,b.input.end],['2026-09-17','2026-10-30']);
 const versions=uniqueForecasts(b);assert.equal(Object.keys(before.versions).length,16,'Pinned pre-release forecast count differs');
 for(const [id,h] of Object.entries(before.versions))assert.equal(jsonSHA(versions.get(id)),h,'Earlier forecast changed: '+id);
 assert.equal(versions.size,17);assert.ok(!before.versions[b.candidate.id]);
 for(const [key,h] of Object.entries(before.preserved))assert.equal(jsonSHA(b[key]??null),h,'Preserved record changed: '+key);
 assert.ok(b.updates.length>=before.updates.length);before.updates.forEach((h,i)=>assert.equal(jsonSHA(b.updates[i]),h,'Update history changed'));
 assert.equal(b.candidate.modelVersion,'atlas-news-8.0.1');assert.equal(b.candidate.paths,20000);assert.equal(b.candidate.seed,20260917);
 assert.equal(b.candidate.trustProbability,null);assert.equal(b.candidate.validatedPromotion,false);assert.equal(b.candidate.assets.length,52);
 assert.deepEqual(b.candidate.assets.map(a=>a.code).sort(),codes);
 assert.equal(b.candidate.informationCutoff,versions.get(before.candidateId).informationCutoff,'Code repair must preserve information cutoff');
 const checks=checkForecast(b.candidate,b.input);assert.equal(checks.complete,true);assert.equal(checks.ok,true);
 assert.equal(b.auditRelease.newForecast,b.candidate.id);assert.equal(b.auditRelease.previousForecast,before.candidateId);
 assert.equal(b.auditRelease.version,'8.0.1');assert.equal(b.auditRelease.inputChanged,false);
 return {status:'PASS',modelVersion:b.candidate.modelVersion,assets:52,priorForecastsPreserved:16,totalForecasts:17,
  candidateId:b.candidate.id,originalSHA256:before.original,inputUnchanged:true,previousLedgerUnchanged:true,
  forecastRows:b.candidate.rowCount,actualAsOf:b.input.actualAsOf,predictiveAccuracyCertified:false,trustProbability:null};
}
export function verifyAuditFiles({bundlePath='public/data/atlas.json'}={}){
 const bytes=fs.readFileSync(bundlePath),bundle=JSON.parse(bundlePath.endsWith('.gz')?gunzipSync(bytes):bytes),before=read(bundle.auditRelease.preservationPath);
 const raw=fs.readFileSync(before.beforePath);assert.equal(sha(raw),before.beforeSHA256);
 const saved=JSON.parse(gunzipSync(raw));assert.deepEqual(captureAuditBefore(saved,before),before,'Release snapshot changed');
 return {bundle,before,saved,verification:verifyAuditBundle(bundle,before)};
}
export function verifyAuditTests(){
 assert.deepEqual(sourceManifest(),read(releaseDirectory+'/test-sources.json'),'Source changed since tests started');
 const tap=fs.readFileSync('reports/tests.tap','utf8');
 const n=k=>Number([...tap.matchAll(new RegExp('^# '+k+' (\\d+)\\s*$','gm'))].at(-1)?.[1]);
 assert.ok(n('pass')>=222);for(const k of ['fail','cancelled','skipped','todo'])assert.equal(n(k),0);assert.equal(n('tests'),n('pass'));
 return {passed:n('pass'),failed:0,sha256:sha(tap),meaning:'functional_regression_not_predictive_accuracy'};
}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url)){
 if(process.argv[2]==='capture'){fs.mkdirSync(releaseDirectory,{recursive:true});fs.writeFileSync(releaseDirectory+'/test-sources.json',JSON.stringify(sourceManifest(),null,2));}
 else if(process.argv[2]==='tests')console.log(JSON.stringify(verifyAuditTests()));
 else console.log(JSON.stringify(verifyAuditFiles().verification));
}
