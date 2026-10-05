import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {gunzipSync} from 'node:zlib';
import {sha} from '../scripts/verify_audit_release.mjs';
import {verifyDailyBundle,verifyDailyFiles,engineManifest} from '../scripts/verify_daily_refresh.mjs';
const current=JSON.parse(fs.readFileSync(new URL('../public/data/atlas.json',import.meta.url)));
// A model release must not retrospectively claim the daily refresh changed no code.
const pinned=current.auditRelease?JSON.parse(fs.readFileSync(new URL('../'+current.auditRelease.preservationPath,import.meta.url))):null;
const snapshot=pinned?fs.readFileSync(new URL('../'+pinned.beforePath,import.meta.url)):null;
if(pinned)assert.equal(sha(snapshot),pinned.beforeSHA256,'Pre-release daily snapshot changed');
const bundle=pinned?JSON.parse(gunzipSync(snapshot)):current;
const before=JSON.parse(fs.readFileSync(new URL('../'+bundle.dailyRefresh.preservationPath,import.meta.url)));
test('daily refresh preserves pinned original, all prior forecasts, journals, 52 codes, dates and numerical code',()=>{
 let result;
 if(pinned){
  const raw=fs.readFileSync(new URL('../'+before.beforePath,import.meta.url));
  assert.equal(sha(raw),before.beforeSHA256,'Daily before snapshot changed');
  result={verification:verifyDailyBundle(bundle,before,{engineHashes:before.engineHashes})};
 }else result=verifyDailyFiles();
 assert.equal(result.verification.status,'PASS');assert.equal(result.verification.predictiveAccuracyCertified,false);
 assert.equal(result.verification.engineUnchanged,true);
});
test('daily refresh verification rejects corrupted original and earlier forecast',()=>{
 const original={...bundle.original,origin:'2026-09-18'};
 assert.throws(()=>verifyDailyBundle({...bundle,original},before));
 const priorVersions=bundle.priorVersions.map((v,i)=>i===0?{...v,rowCount:v.rowCount+1}:v);
 assert.throws(()=>verifyDailyBundle({...bundle,priorVersions},before),/Earlier forecast changed|Conflicting forecast ID/);
});
test('daily refresh verification rejects journal removal and rewrite',()=>{
 assert.ok(before.journals.collectionLogs.length>0);
 assert.throws(()=>verifyDailyBundle({...bundle,collectionLogs:bundle.collectionLogs.slice(1)},before),/Journal/);
 const collectionLogs=bundle.collectionLogs.map((v,i)=>i===0?{...v,at:'2099-01-01'}:v);
 assert.throws(()=>verifyDailyBundle({...bundle,collectionLogs},before),/Journal/);
});
test('daily refresh verification rejects missing codes, changed period and changed engine',()=>{
 assert.throws(()=>verifyDailyBundle({...bundle,input:{...bundle.input,assets:bundle.input.assets.slice(1)}},before));
 assert.throws(()=>verifyDailyBundle({...bundle,input:{...bundle.input,end:'2026-11-01'}},before));
 const engineHashes={...engineManifest(),'lib/news-engine.mjs':'mutated'};
 assert.throws(()=>verifyDailyBundle(bundle,before,{engineHashes}),/changed model\/engine/);
});
