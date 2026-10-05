import fs from 'node:fs/promises';import {createHash} from 'node:crypto';import {forecast,checkForecast,sourceDataDigest} from '../lib/daily-movement-engine.mjs';
const sha=x=>createHash('sha256').update(x).digest('hex'),raw=await fs.readFile('public/data/atlas.json'),bundle=JSON.parse(raw),now=new Date().toISOString(),dir='reports/daily-movement';await fs.mkdir(dir+'/versions',{recursive:true});
const input=bundle.input,createdAt=now,informationCutoff=now;
let previous=null;try{previous=JSON.parse(await fs.readFile('public/data/daily-movement.json'));}catch(e){if(e.code!=='ENOENT')throw e;}
const reuse=previous?.candidate?.dataDigest===sourceDataDigest(input,input.actualAsOf,informationCutoff,{conditional:true})&&previous.candidate.paths===20000&&previous.candidate.seed===20260917;
const candidate=reuse?previous.candidate:forecast(input,{origin:input.actualAsOf,paths:20000,seed:20260917,informationCutoff,createdAt,conditional:true});
const checks=checkForecast(candidate,input);if(!checks.ok||!checks.complete)throw Error(JSON.stringify(checks));
candidate.researchLabel='일별 등락 연구 · 실전 우위 미검증';candidate.detailLoaded=true;
const summary=candidate.assets.map(a=>{const daily=a.rows.filter(r=>r.dailyMovement);const changes=daily.map(r=>r.dailyMovement.meanLogReturn),turns=changes.slice(1).filter((v,i)=>v*changes[i]<0).length;return{code:a.code,name:a.name,upDays:changes.filter(x=>x>0).length,downDays:changes.filter(x=>x<0).length,turns,oneDayRanges:daily.length,calibrated:false,windows:a.conditionalPath?.featureWindows};});
const result={schema:'atlas-daily-movement-1',reusedForecast:reuse,at:reuse?previous.at:now,sourceSHA256:sha(raw),sourceForecastId:bundle.candidate.id,actualAsOf:input.actualAsOf,candidate,summary,checks,operatingOriginalChanged:false,trustProbability:null};
const file=dir+'/versions/'+candidate.id+'.json';try{await fs.writeFile(file,JSON.stringify(result),{flag:'wx'});}catch(e){if(e.code!=='EEXIST')throw e;const old=JSON.parse(await fs.readFile(file));if(old.sourceSHA256!==result.sourceSHA256)throw Error('Research identity conflict');result.candidate=old.candidate;result.at=old.at;}
await fs.writeFile('public/data/daily-movement.json',JSON.stringify(result));await fs.writeFile(dir+'/latest.json',JSON.stringify({at:result.at,sourceSHA256:result.sourceSHA256,sourceForecastId:result.sourceForecastId,id:candidate.id,summary,checks},null,2));
if(sha(await fs.readFile('public/data/atlas.json'))!==sha(raw))throw Error('Original changed');
console.log(JSON.stringify({id:candidate.id,stocks:summary.length,downDayStocks:summary.filter(r=>r.downDays).length,turningStocks:summary.filter(r=>r.turns).length,checks,originalPreserved:true}));

await import('./write_daily_movement_display.mjs');
