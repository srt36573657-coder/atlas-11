/** File-based rolling daily runner; installing this file does not install a hosted scheduler. */
import fs from 'node:fs/promises';
import path from 'node:path';
import {spawn} from 'node:child_process';
import {rollingOperationWindow,rollingHash,mergeRollingPrices,rollingScoreRecord,persistRollingScore} from '../lib/rolling-operation.mjs';
const dir='reports/rolling/operations',at=new Date().toISOString(),bundlePath='public/data/atlas.json';
const read=async(file,otherwise)=>{try{return JSON.parse(await fs.readFile(file,'utf8'));}catch(e){if(e.code==='ENOENT'&&otherwise!==undefined)return otherwise;throw e;}};
await fs.mkdir(dir,{recursive:true});
const raw=await fs.readFile(bundlePath,'utf8'),bundle=JSON.parse(raw),calendar=await read('public/data/rolling-calendar.json',bundle.input.calendar),window=rollingOperationWindow(bundle.input,at,{calendar});
const file=dir+'/'+at.replace(/[:.]/g,'-')+'.json',scoresOnly=process.argv.includes('--scores-only'),existingOnly=process.argv.includes('--existing');
const result={schema:'atlas-rolling-operation-1',at,...window,steps:[],serverInstalled:false,status:'started',exitCode:0,forecastHorizonTradingDays:20,runEndDate:bundle.input.end,forecastEndIsNotRunEnd:true};
async function save(){result.finishedAt=new Date().toISOString();result.completedBeforeDeadline=Date.parse(result.finishedAt)<Date.parse(window.deadlineAt);result.deadlineMissed=!result.completedBeforeDeadline;await fs.writeFile(file,JSON.stringify(result,null,2));await fs.writeFile(dir+'/latest.json',JSON.stringify(result,null,2));}
async function publications(){let files;try{files=await fs.readdir('reports/rolling/versions');}catch(e){if(e.code==='ENOENT')return[];throw e;}return await Promise.all(files.filter(x=>x.endsWith('.json')).sort().map(x=>read('reports/rolling/versions/'+x)));}
async function saveScore(input){const prior=await read('public/data/rolling-scores.json',null),record=rollingScoreRecord(await publications(),input,{now:new Date().toISOString(),calendar,previousScoreId:prior?.scoreId??null});const saved=await persistRollingScore(record);result.scoreId=saved.scoreId;result.scoredDates=saved.record.independentDateCount;result.scoreCells=saved.record.assets.length*4;return saved;}
if(scoresOnly){await saveScore(bundle.input);result.status='scores_only';result.actualAsOf=bundle.input.actualAsOf;await save();console.log(JSON.stringify(result));process.exit(0);}
if(!window.eligible){result.status=window.ended?'run_period_ended':window.session?'before_scheduled_close_collection':'closed_session';result.retainedActualAsOf=bundle.input.actualAsOf;await saveScore(bundle.input);await save();console.log(JSON.stringify(result));process.exit(0);}
let lock;try{lock=await fs.open(dir+'/run.lock','wx');await lock.writeFile(JSON.stringify({pid:process.pid,at}));}catch(e){if(e.code!=='EEXIST')throw e;result.status='already_running_or_unresolved_lock';result.exitCode=2;await save();console.log(JSON.stringify(result));process.exit(2);}
const env={...process.env};delete env.NODE_TEST_CONTEXT;
async function execute(script,args=[],timeout=180000){const started=Date.now();return new Promise(resolve=>{const child=spawn(process.execPath,[script,...args],{env,stdio:'inherit'});let settled=false,killTimer;const finish=value=>{if(settled)return;settled=true;clearTimeout(timer);clearTimeout(killTimer);resolve({script,...value,durationMs:Date.now()-started});};const timer=setTimeout(()=>{child.kill('SIGTERM');killTimer=setTimeout(()=>child.kill('SIGKILL'),2000);},timeout);child.on('error',e=>finish({code:null,error:e.message}));child.on('exit',(code,signal)=>finish({code,signal}));});}
try{
 result.previousForecastId=(await read('public/data/rolling-forecast.json',null))?.id??null;
 if(!existingOnly){
  // Independent collectors use distinct report paths; shared input remains read-only until all finish.
  const steps=await Promise.all(['scripts/collect_completion_fomo.mjs','scripts/collect_completion_market.mjs','scripts/collect_completion_company.mjs'].map(s=>execute(s)));
  result.steps.push(...steps);if(steps.some(x=>x.code!==0))result.exitCode=2;
 }else{result.exitCode=2;result.steps.push({script:null,status:'stored_evidence_only',networkAttempted:false});}
 const priceReport=await read('reports/completion/fomo-latest.json',{priceObservations:[]}),supplementPath=process.env.ATLAS_ROLLING_FINAL_PRICES;
 const supplement=supplementPath?await read(supplementPath):{priceObservations:[]};
 if(supplementPath){
  // An early final quote needs a retained source snapshot matching its hash, not just a boolean.
  for(const o of supplement.priceObservations??[]){
   const snapshot=path.resolve(o.rawSnapshotPath??''),reports=path.resolve('reports')+path.sep;
   if(!snapshot.startsWith(reports)||rollingHash(await fs.readFile(snapshot))!==o.rawHash)throw Error('EXPLICIT_FINAL_SNAPSHOT_REQUIRED');
  }
 }
 const updated=mergeRollingPrices(bundle.input,[...(priceReport.priceObservations??[]),...(supplement.priceObservations??[])],{now:new Date().toISOString(),expectedHash:rollingHash(bundle.input),calendar});
 if(updated.changed){
  if(await fs.readFile(bundlePath,'utf8')!==raw)throw Error('CONCURRENT_INPUT_EDIT');
  const beforeFile=dir+'/input-before-'+rollingHash(raw)+'.json';await fs.writeFile(beforeFile,JSON.stringify({input:bundle.input,sourceBundleHash:rollingHash(raw)}),{flag:'wx'}).catch(e=>{if(e.code!=='EEXIST')throw e;});
  await fs.writeFile(bundlePath+'.next',JSON.stringify({...bundle,input:updated.input}));await fs.rename(bundlePath+'.next',bundlePath);
  await fs.writeFile('public/data/input.json.next',JSON.stringify(updated.input));await fs.rename('public/data/input.json.next','public/data/input.json');
 }
 result.actualAsOf=updated.actualAsOf;result.freshStocks=updated.freshCodes.length;result.confirmedTodayStocks=updated.confirmedTodayCodes.length;result.retainedStoredClose=updated.retainedStoredClose;
 // Score issued old vintages before computing a new one. Revisions produce a new immutable score id.
 await saveScore(updated.input);
 if(updated.confirmedTodayCodes.length===52&&updated.actualAsOf===window.day){
  const step=await execute('scripts/build_rolling_forecast.mjs',[],360000);result.steps.push(step);if(step.code!==0)throw Error('ROLLING_FORECAST_FAILED');
  const latest=await read('public/data/rolling-forecast.json');result.forecastId=latest.id;result.newForecast=latest.id!==result.previousForecastId;result.liveForecastStocks=latest.assets.length;
 }else{
  result.exitCode=2;result.forecastId=result.previousForecastId;result.newForecast=false;result.liveForecastStocks=0;result.forecastWithheldReason='52_current_session_final_closes_not_confirmed';
 }
 await saveScore(updated.input);
 result.inputHash=rollingHash(updated.input);result.status=result.exitCode===0?'complete':'partial';await save();
}catch(e){result.status='failed';result.exitCode=2;result.error=String(e.message);await save();}finally{await lock.close();await fs.unlink(dir+'/run.lock');}
console.log(JSON.stringify(result));process.exitCode=result.exitCode;
