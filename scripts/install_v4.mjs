// One-time local migration. Keep every old forecast and the frozen original intact.
import fs from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {forecast,checkForecast} from '../lib/news-engine.mjs';
import {fitCalibration,calibrationEvidenceKey} from '../lib/probability.mjs';
const url=new URL('../public/data/atlas.json',import.meta.url),b=JSON.parse(await fs.readFile(url,'utf8')),
 report=JSON.parse(await fs.readFile(new URL('../reports/probability_audit.json',import.meta.url),'utf8')),
 records=JSON.parse(await fs.readFile(new URL('../reports/probability_folds.json',import.meta.url),'utf8'));
const originalText=JSON.stringify(b.original);
report.calibration=fitCalibration(records,'atlas-news-4.0.0','2026-09-16');
report.calibration.evidenceKey=calibrationEvidenceKey(b.input,'2026-09-16');
report.calibration.id=createHash('sha256').update(JSON.stringify(report.calibration)).digest('hex').slice(0,16);
b.input.calibration=report.calibration;
const previous=b.candidate;
b.candidate=forecast(b.input,{origin:previous.origin,paths:10000,seed:20260917,informationCutoff:b.input.informationAsOf,live:false});
b.priorVersions=[...new Map([...(b.priorVersions??[]),previous].filter(v=>v.id!==b.original.id&&v.id!==b.candidate.id).map(v=>[v.id,v])).values()];
b.checks=checkForecast(b.candidate,b.input);
if(!b.checks.complete||JSON.stringify(b.original)!==originalText)throw Error('검사 또는 원본 보존 실패');
b.probabilityAudit=report;b.revision++;
b.updates=[...(b.updates??[]),{at:new Date().toISOString(),type:'model-upgrade',model:'atlas-news-4.0.0',previous:previous.id,next:b.candidate.id,originalUnchanged:true}];
await fs.writeFile(url,JSON.stringify(b));
await fs.writeFile(new URL('../public/data/input.json',import.meta.url),JSON.stringify(b.input));
for(const p of ['../reports/probability_audit.json','../public/downloads/probability_audit.json'])await fs.writeFile(new URL(p,import.meta.url),JSON.stringify(report,null,2));
console.log(JSON.stringify({version:b.candidate.id,original:b.original.id,retained:b.priorVersions.length,calibratedHorizons:report.calibration.groups.filter(g=>g.alpha!==1).map(g=>g.horizon),audit:report.audit}));
