// Release migration only. Daily updates must use npm run refresh.
import fs from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {forecast,checkForecast,MODEL_VERSION} from '../lib/news-engine.mjs';
const root=new URL('../',import.meta.url),read=p=>fs.readFile(new URL(p,root),'utf8'),hash=s=>createHash('sha256').update(s).digest('hex');
const b=JSON.parse(await read('public/data/atlas.json')),audit=JSON.parse(await read('reports/model_audit.json'));
if(audit.method!==MODEL_VERSION||audit.engineSHA256!==hash(await read('lib/news-engine.mjs')))throw Error('현재 엔진으로 감사부터 실행하세요.');
if(b.candidate.modelVersion===MODEL_VERSION){console.log('Already migrated.');process.exit(0);}
const original=JSON.stringify(b.original),old=b.candidate;
delete b.input.calibration;
const auditInput={...b.input};delete auditInput.calibration;
if(audit.inputSHA256!==hash(JSON.stringify(auditInput)))throw Error('감사 입력과 설치 입력이 다릅니다.');
b.candidate=forecast(b.input,{origin:old.origin,paths:10000,seed:20260917,informationCutoff:b.input.informationAsOf,live:false});
b.priorVersions=[...new Map([...(b.priorVersions??[]),old].filter(v=>v.id!==b.original.id&&v.id!==b.candidate.id).map(v=>[v.id,v])).values()];
b.checks=checkForecast(b.candidate,b.input);b.modelAudit=audit;
if(!b.checks.complete||JSON.stringify(b.original)!==original||hash(original)!=='1af446f745c88cfb308de348f238f2fa8d31265b5322e2f035f5aafb6d5833ca')throw Error('원본 보존/계산 검사 실패');
b.revision++;b.updates.push({at:new Date().toISOString(),type:'model-upgrade',model:MODEL_VERSION,previous:old.id,next:b.candidate.id,originalUnchanged:true,reason:'signed-tail restoration; evidence and revision audit; abstention'});
await fs.writeFile(new URL('public/data/atlas.json',root),JSON.stringify(b));
await fs.writeFile(new URL('public/data/input.json',root),JSON.stringify(b.input));
console.log(JSON.stringify({model:MODEL_VERSION,latest:b.candidate.id,original:b.original.id,priorVersions:b.priorVersions.length,trustProbability:b.candidate.trustProbability}));
