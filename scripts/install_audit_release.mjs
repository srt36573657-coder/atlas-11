// Explicit one-time code repair release. No collectors, resets, or historical rewrites.
import fs from 'node:fs';
import assert from 'node:assert/strict';
import {gzipSync} from 'node:zlib';
import {forecast,checkForecast,MODEL_VERSION,eligibleOrigins} from '../lib/forecast-engine.mjs';
import {sha,jsonSHA,uniqueForecasts,captureAuditBefore,verifyAuditBundle,releaseDirectory} from './verify_audit_release.mjs';
const file='public/data/atlas.json',b=JSON.parse(fs.readFileSync(file));
if(b.auditRelease)throw Error('Audit release already installed; refusing duplicate/rewrite');
assert.equal(MODEL_VERSION,'atlas-news-8.0.1','Version bump must precede installation');
assert.equal(uniqueForecasts(b).size,16);const old=b.candidate,now=new Date().toISOString();
assert.equal(old.origin,eligibleOrigins(b.input).at(-1),'Existing origin differs from latest common valid close');
fs.mkdirSync(releaseDirectory,{recursive:true});
const beforePath=releaseDirectory+'/before.json.gz',preservationPath=releaseDirectory+'/preservation.json';
if(fs.existsSync(beforePath)||fs.existsSync(preservationPath))throw Error('Existing repair snapshot found; inspect instead of overwriting');
const raw=gzipSync(JSON.stringify(b));fs.writeFileSync(beforePath,raw,{flag:'wx'});
const before=captureAuditBefore(b,{beforePath,beforeSHA256:sha(raw)});fs.writeFileSync(preservationPath,JSON.stringify(before,null,2),{flag:'wx'});
const next=forecast(b.input,{origin:old.origin,paths:20000,seed:20260917,informationCutoff:old.informationCutoff,createdAt:now,live:true});
const checks=checkForecast(next,b.input);assert.equal(checks.ok,true);assert.equal(checks.complete,true);
b.priorVersions=[...new Map([...(b.priorVersions??[]),old].map(v=>[v.id,v])).values()];
b.candidate=next;b.checks=checks;b.revision=(b.revision??0)+1;
b.auditRelease={schemaVersion:1,version:'8.0.1',at:now,beforePath,preservationPath,previousForecast:old.id,newForecast:next.id,
 inputChanged:false,newMarketDataCollected:false,independentAccuracyValidated:false,trustProbability:null,informationCutoff:old.informationCutoff};
b.updates=[...(b.updates??[]),{type:'audit-code-repair',at:now,version:next.id,previousVersion:old.id,model:MODEL_VERSION,originalUnchanged:true,inputChanged:false}];
const verification=verifyAuditBundle(b,before);
fs.writeFileSync(releaseDirectory+'/calculation.json',JSON.stringify({at:now,...verification,stocks:next.assets.map(a=>({code:a.code,priorReturn:old.assets.find(p=>p.code===a.code)?.rows.at(-1)?.return,return:a.rows.at(-1)?.return}))},null,2));
fs.writeFileSync(file+'.next',JSON.stringify(b));fs.renameSync(file+'.next',file);
console.log(JSON.stringify(verification));
