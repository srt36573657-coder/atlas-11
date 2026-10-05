// One-time release migration, not the daily update command.
import fs from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {forecast,checkForecast,MODEL_VERSION} from '../lib/news-engine.mjs';
import {normalizeEvent} from '../lib/news-scope.mjs';
import {calibrationEvidenceKey} from '../lib/probability.mjs';
const url=new URL('../public/data/atlas.json',import.meta.url),b=JSON.parse(await fs.readFile(url,'utf8'));
if(b.candidate.modelVersion===MODEL_VERSION){console.log('Already migrated.');process.exit(0);}
const originalText=JSON.stringify(b.original),old=b.candidate;
const report=JSON.parse(await fs.readFile(new URL('../reports/probability_audit.json',import.meta.url),'utf8'));
if(report.method!==MODEL_VERSION)throw Error('Run this engine’s chronological validation first.');
b.input.events=b.input.events.map(normalizeEvent);
if(report.calibration.evidenceKey!==calibrationEvidenceKey(b.input,report.calibration.trainedThrough))throw Error('Calibration evidence differs.');
b.input.calibration=report.calibration;
b.candidate=forecast(b.input,{origin:old.origin,paths:10000,seed:20260917,informationCutoff:b.input.informationAsOf,live:false});
b.priorVersions=[...new Map([...(b.priorVersions??[]),old].filter(v=>v.id!==b.original.id&&v.id!==b.candidate.id).map(v=>[v.id,v])).values()];
b.checks=checkForecast(b.candidate,b.input);
if(!b.checks.complete||JSON.stringify(b.original)!==originalText)throw Error('Forecast validation/original retention failed.');
const hash=createHash('sha256').update(originalText).digest('hex');
if(hash!=='1af446f745c88cfb308de348f238f2fa8d31265b5322e2f035f5aafb6d5833ca')throw Error('Frozen original hash differs.');
b.probabilityAudit=report;b.revision++;
b.updates=[...(b.updates??[]),{at:new Date().toISOString(),type:'model-upgrade',model:MODEL_VERSION,previous:old.id,next:b.candidate.id,originalUnchanged:true}];
await fs.writeFile(url,JSON.stringify(b));
await fs.writeFile(new URL('../public/data/input.json',import.meta.url),JSON.stringify(b.input));
console.log(JSON.stringify({model:MODEL_VERSION,latest:b.candidate.id,priorVersions:b.priorVersions.map(v=>v.id),originalSHA256:hash,byScope:b.candidate.newsCoverage.byScope}));
