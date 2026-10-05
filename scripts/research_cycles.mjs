import {deriveCycleTrainingRows} from '../lib/cycle-training.mjs';
import fs from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import {createCycleState,appendCycleReport} from '../lib/cycle-research.mjs';
import {mergeCycleData} from '../lib/cycle-data.mjs';
import {collectCycleData} from '../lib/cycle-collection.mjs';
import {sha256} from '../lib/cycle-math.mjs';
const root=new URL('../',import.meta.url),bundlePath=new URL('public/data/atlas.json',root);
const bundle=JSON.parse(await fs.readFile(bundlePath,'utf8')),before=sha256({input:bundle.input,original:bundle.original,versions:bundle.priorVersions,candidate:bundle.candidate,evaluation:bundle.evaluation,logs:bundle.collectionLogs});
const args=process.argv.slice(2),get=name=>args.includes(name)?args[args.indexOf(name)+1]:null,at=new Date().toISOString();
let state=bundle.cycleResearch??createCycleState(bundle.input,bundle.candidate,{cutoff:at}),exitCode=0;
const importFile=get('--import');
if(importFile){const payload=JSON.parse(await fs.readFile(importFile,'utf8'));state={...state,data:mergeCycleData(state.data,payload,bundle.input,{now:at})};}
const archiveFile=get('--archives');
if(archiveFile){
 const archives=JSON.parse(await fs.readFile(archiveFile,'utf8'));
 if(!Array.isArray(archives.records))throw Error('records 배열의 과거 기준 전망 보관본이 필요합니다.');
 const derived=deriveCycleTrainingRows(archives.records,state.data,bundle.input,{now:at});
 state={...state,data:mergeCycleData(state.data,derived,bundle.input,{now:at}),trainingDerivation:derived.report};
}
if(args.includes('--collect')){
 const configFile=get('--config'),config=configFile?JSON.parse(await fs.readFile(configFile,'utf8')):{};
 const result=await collectCycleData(bundle.input,state.data,{config,apiKey:process.env.KRX_API_KEY??'',maxRequests:Number(get('--max-requests')??12)});
 state={...state,data:result.data,collection:result.log,collectionLogs:[...(state.collectionLogs??[]),result.log]};exitCode=result.exitCode;
}
state=appendCycleReport(state,bundle.input,bundle.candidate,{cutoff:at,runPairAnalysis:true});
const out={...bundle,cycleResearch:state};
if(sha256({input:out.input,original:out.original,versions:out.priorVersions,candidate:out.candidate,evaluation:out.evaluation,logs:out.collectionLogs})!==before)throw Error('기존 자료 변경 거부');
await fs.mkdir(new URL('reports/cycles/',root),{recursive:true});
await fs.mkdir(new URL('public/downloads/',root),{recursive:true});
const name=at.replaceAll(':','-').replaceAll('.','-')+'-'+state.report.id.slice(0,12);
await fs.writeFile(new URL('reports/cycles/'+name+'.json',root),JSON.stringify({report:state.report,collection:state.collection},null,2));
await fs.writeFile(new URL('reports/cycles/latest.json',root),JSON.stringify({report:state.report,collection:state.collection},null,2));
await fs.writeFile(new URL('public/downloads/cycle_research.json',root),JSON.stringify(state.report,null,2));
await fs.writeFile(new URL('public/data/atlas.cycle.next.json',root),JSON.stringify(out));
await fs.rename(new URL('public/data/atlas.cycle.next.json',root),bundlePath);
console.log(JSON.stringify({protocol:state.report.protocolHash,...state.report.counts,collection:state.collection,existingInputsAndForecastsPreserved:true,report:fileURLToPath(new URL('reports/cycles/latest.json',root))},null,2));
process.exitCode=exitCode;
