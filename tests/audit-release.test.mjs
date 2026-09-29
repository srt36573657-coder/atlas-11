import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {MODEL_VERSION} from '../lib/forecast-engine.mjs';
import {verifyAuditFiles,verifyAuditBundle} from '../scripts/verify_audit_release.mjs';
test('8.0.1 release preserves 16 earlier forecasts, exact inputs, original, ledger and histories',()=>{
 const r=verifyAuditFiles({bundlePath:'reports/completion/before/atlas-9.4.json.gz'});assert.equal(r.verification.priorForecastsPreserved,16);assert.equal(r.verification.totalForecasts,17);
 assert.equal(r.verification.inputUnchanged,true);assert.equal(r.verification.predictiveAccuracyCertified,false);
 assert.equal(MODEL_VERSION,'atlas-news-8.0.1');assert.equal(r.bundle.candidate.modelVersion,MODEL_VERSION);
});
test('audit release rejects numerical input alteration or earlier forecast rewrite',()=>{
 const {bundle:b,before}=verifyAuditFiles({bundlePath:'reports/completion/before/atlas-9.4.json.gz'});
 assert.throws(()=>verifyAuditBundle({...b,input:{...b.input,actualAsOf:'2099-01-01'}},before),/Input changed/);
 assert.throws(()=>verifyAuditBundle({...b,priorVersions:b.priorVersions.map((v,i)=>i===0?{...v,rowCount:v.rowCount+1}:v)},before),/Earlier forecast changed|Conflicting forecast/);
});
test('audit release rejects removed evaluation ledger and wrong model promotion',()=>{
 const {bundle:b,before}=verifyAuditFiles({bundlePath:'reports/completion/before/atlas-9.4.json.gz'});assert.ok(b.evaluationLedger.length);
 assert.throws(()=>verifyAuditBundle({...b,evaluationLedger:b.evaluationLedger.slice(1)},before),/Preserved record changed/);
 assert.throws(()=>verifyAuditBundle({...b,candidate:{...b.candidate,modelVersion:'atlas-news-8.0.0'}},before));
 assert.throws(()=>verifyAuditBundle({...b,candidate:{...b.candidate,validatedPromotion:true}},before));
});
