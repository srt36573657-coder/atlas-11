import fs from 'node:fs/promises';import{spawn}from'node:child_process';import{gunzipSync}from'node:zlib';
import{operationWindow,contentHash,dailyScoreRecord,mergeObservedPrices,scorePublicationPair}from'../lib/completion-operation.mjs';
import{currentFomoAudit}from'../lib/completion-fomo.mjs';
const dir='reports/completion/operations',at=new Date().toISOString(),bundlePath='public/data/atlas.json';await fs.mkdir(dir,{recursive:true});
const raw=await fs.readFile(bundlePath,'utf8'),bundle=JSON.parse(raw),window=operationWindow(bundle.input,at),file=dir+'/'+at.replace(/[:.]/g,'-')+'.json';
const result={schema:'atlas-completion-operation-1',at,...window,steps:[],serverInstalled:false,status:'started',exitCode:0};
async function save(){await fs.writeFile(file,JSON.stringify(result,null,2));await fs.writeFile(dir+'/latest.json',JSON.stringify(result,null,2));}
if(!window.eligible){result.status=window.ended?'period_ended':window.session?'before_1600_kst':'closed_session';result.retainedActualAsOf=bundle.input.actualAsOf;await save();console.log(JSON.stringify(result));process.exit(0);}
let lock;try{lock=await fs.open(dir+'/run.lock','wx');await lock.writeFile(JSON.stringify({pid:process.pid,at}));}catch(e){if(e.code!=='EEXIST')throw e;result.status='already_running_or_unresolved_lock';result.exitCode=2;await save();console.log(JSON.stringify(result));process.exit(2);}
const env={...process.env};delete env.NODE_TEST_CONTEXT;
async function execute(script,timeout=180000){const begin=Date.now();return await new Promise(resolve=>{const child=spawn(process.execPath,[script],{env,stdio:'inherit'});let timer=setTimeout(()=>child.kill('SIGTERM'),timeout);child.on('error',e=>{clearTimeout(timer);resolve({script,code:null,error:e.message});});child.on('exit',(code,signal)=>{clearTimeout(timer);resolve({script,code,signal,durationMs:Date.now()-begin});});});}
try{
  let prior;try{prior=JSON.parse(await fs.readFile(dir+'/completed-'+window.day+'.json','utf8'));}catch(e){if(e.code!=='ENOENT')throw e;}
  if(prior?.inputHash===contentHash(bundle.input)&&prior?.status==='complete'){result.status='unchanged_already_complete';await save();}
  else{
    // Collection is bounded and failures retained. Never install or reset historical engines here.
    for(const script of ['scripts/collect_completion_fomo.mjs','scripts/collect_completion_market.mjs','scripts/collect_completion_company.mjs']){
      const step=await execute(script);result.steps.push(step);if(step.code!==0)result.exitCode=2;
    }
    let priceReport;try{priceReport=JSON.parse(await fs.readFile('reports/completion/fomo-latest.json','utf8'));}catch(e){if(e.code!=='ENOENT')throw e;}
    const updated=mergeObservedPrices(bundle.input,priceReport?.priceObservations??[],{now:new Date().toISOString(),expectedHash:contentHash(bundle.input)});
    if(updated.changed){
      if(await fs.readFile(bundlePath,'utf8')!==raw)throw Error('CONCURRENT_INPUT_EDIT');
      await fs.writeFile(dir+'/input-before-'+contentHash(raw)+'.json',JSON.stringify({input:bundle.input,sourceBundleHash:contentHash(raw)}),{flag:'wx'}).catch(e=>{if(e.code!=='EEXIST')throw e;});
      await fs.writeFile(bundlePath+'.next',JSON.stringify({...bundle,input:updated.input}));await fs.rename(bundlePath+'.next',bundlePath);
    }
    if(updated.changed)await fs.writeFile('public/data/input.json',JSON.stringify(updated.input));
    if(priceReport){
      const quoteKeys=new Set((priceReport.priceObservations??[]).flatMap(o=>o.rows.flatMap(r=>['open','high','low','volume','turnover'].map(field=>`${o.code}:${r.date}:${field}`))));
      const extraRecords=(priceReport.acceptedRecords??[]).filter(r=>!quoteKeys.has(`${r.code}:${r.date}:${r.field}`));
      const latestAudit=currentFomoAudit(updated.input,{observations:priceReport.priceObservations??[],records:extraRecords,now:new Date()});
      await fs.writeFile('reports/completion/fomo-latest.json',JSON.stringify({...priceReport,...latestAudit,appliedToOperatingInput:updated.changed}));
    }
    const wave=JSON.parse(gunzipSync(await fs.readFile('public/data/news-wave.json.gz'))),score=dailyScoreRecord(wave.candidate,updated.input);
    await fs.mkdir(dir+'/scores',{recursive:true});await fs.writeFile(dir+'/scores/'+score.id+'.json',JSON.stringify(score,null,2),{flag:'wx'}).catch(e=>{if(e.code!=='EEXIST')throw e;});
    await fs.writeFile('public/data/completion-daily-score.json',JSON.stringify(score));
    result.freshStocks=updated.freshCodes.length;result.actualAsOf=updated.actualAsOf;result.previousForecastId=wave.id;result.scoreId=score.id;
    if(result.freshStocks!==52)result.exitCode=2;
    const forecastStep=await execute('scripts/research_factor36.mjs',360000);result.steps.push(forecastStep);if(forecastStep.code!==0)throw Error('FORECAST_FAILED');
    const currentWave=JSON.parse(gunzipSync(await fs.readFile('public/data/news-wave.json.gz')));
    result.forecastId=currentWave.id;result.newForecast=result.forecastId!==wave.id;
    const publicationScores=scorePublicationPair(wave.candidate,currentWave.candidate,updated.input);
    await fs.writeFile(dir+'/scores/'+publicationScores.current.id+'.json',JSON.stringify(publicationScores.current,null,2),{flag:'wx'}).catch(e=>{if(e.code!=='EEXIST')throw e;});
    await fs.writeFile('public/data/completion-daily-score.json',JSON.stringify(publicationScores.current));
    result.currentScoreId=publicationScores.current.id;

    result.status=result.exitCode===0?'complete':'partial';await save();
    const ledgerStep=await execute('scripts/write_completion_status.mjs',60000);result.steps.push(ledgerStep);if(ledgerStep.code!==0)result.exitCode=2;
    result.status=result.exitCode===0?'complete':'partial';result.inputHash=contentHash(updated.input);await save();
    if(result.status==='complete')await fs.writeFile(dir+'/completed-'+window.day+'.json',JSON.stringify(result,null,2));
  }
}catch(e){result.status='failed';result.exitCode=2;result.error=String(e.message);await save();}finally{await lock.close();await fs.unlink(dir+'/run.lock');}
console.log(JSON.stringify(result));process.exitCode=result.exitCode;
