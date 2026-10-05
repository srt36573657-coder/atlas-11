// One-time authorized implementation migration. Daily collection remains npm run refresh.
import fs from 'node:fs';
import {createHash} from 'node:crypto';
import {forecast,checkForecast} from '../lib/forecast-engine.mjs';
import {CONDITIONAL_POLICY} from '../lib/conditional-return.mjs';
import {appendEvaluationLedger} from '../lib/evaluation-ledger.mjs';
import {appendPressReport} from '../lib/press-runtime.mjs';
import {appendCycleReport} from '../lib/cycle-research.mjs';
const path='public/data/atlas.json';
const b=JSON.parse(fs.readFileSync(path));
if(b.conditionalUpdate)throw Error('v8 migration already installed; preserve existing results');
const now=new Date().toISOString(),hash=x=>createHash('sha256').update(JSON.stringify(x)).digest('hex');
fs.writeFileSync('reports/implementation-8.0/protocol.json',JSON.stringify({at:now,policy:CONDITIONAL_POLICY,
  policySHA256:hash(CONDITIONAL_POLICY),selectionThrough:'2026-09-16',newIndependentAccuracyAudit:false,
  paths:20000,seed:20260917,oldForecastsImmutable:true,trustProbability:null},null,2));
const originalHash=hash(b.original),old=b.candidate;
const next=forecast(b.input,{origin:old.origin,paths:20000,seed:20260917,
  informationCutoff:now,createdAt:now,live:true});
if(!checkForecast(next,b.input).complete)throw Error('Incomplete conditional forecast');
b.priorVersions=[...new Map([...(b.priorVersions??[]),old].map(v=>[v.id,v])).values()];
b.candidate=next;b.checks=checkForecast(next,b.input);
b.conditionalUpdate={version:'8.0.0',at:now,previousForecast:old.id,newForecast:next.id,
  priceDataChanged:false,newsDataChanged:false,independentAccuracyValidated:false,trustProbability:null,
  estimatedStocks:next.assets.filter(a=>a.conditionalPath.status==='RESEARCH_ESTIMATE').length};
b.updates.push({type:'conditional-model-implementation',at:now,version:next.id,originalUnchanged:true,modelStatus:'research_only'});
b.evaluationLedger=appendEvaluationLedger(b.evaluationLedger??[],[b.original,...b.priorVersions,next],b.input,{now});
if(b.pressResearch)b.pressResearch=appendPressReport(b.pressResearch,b.input,next,{cutoff:now});
if(b.cycleResearch)b.cycleResearch=appendCycleReport(b.cycleResearch,b.input,next,{cutoff:now});
if(hash(b.original)!==originalHash)throw Error('Original forecast changed');
fs.writeFileSync(path,JSON.stringify(b));
fs.writeFileSync('reports/implementation-8.0/calculation.json',JSON.stringify({at:now,id:next.id,
  originalSHA256:originalHash,stocks:next.assets.map(a=>({code:a.code,name:a.name,
    status:a.conditionalPath.status,trainedThrough:a.conditionalPath.trainedThrough,
    firstExpectedLogReturn:a.rows[1]?.conditionalReturn?.meanLogReturn,
    terminalReturn:a.rows.at(-1).return,priorTerminalReturn:old.assets.find(o=>o.code===a.code).rows.at(-1).return,
    internalValidation:a.conditionalPath.validation})),evaluationRecords:b.evaluationLedger.length},null,2));
console.log(JSON.stringify({id:next.id,rows:next.rowCount,stocks:next.assets.length,estimatedStocks:b.conditionalUpdate.estimatedStocks,
  preservedForecasts:b.priorVersions.length+1,originalSHA256:originalHash,evaluationRecords:b.evaluationLedger.length}));
