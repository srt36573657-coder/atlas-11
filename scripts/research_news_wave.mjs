import fs from 'node:fs/promises';import {createHash} from 'node:crypto';import {gzipSync} from 'node:zlib';import {WAVE_POLICY,prepareWave,simulateWave} from '../lib/news-wave.mjs';import {fitConditionalPath} from '../lib/daily-movement-return.mjs';
const sha=x=>createHash('sha256').update(x).digest('hex'),raw=await fs.readFile('public/data/atlas.json'),b=JSON.parse(raw),sourceSHA256=sha(raw),at=new Date().toISOString(),origin=b.input.actualAsOf,dates=b.input.calendar.sessions.filter(d=>d>origin&&d<=b.input.end),dir='reports/news-wave';
await fs.mkdir(dir+'/versions',{recursive:true});
const implementationSHA256=sha((await fs.readFile('lib/news-wave.mjs'))+(await fs.readFile('lib/daily-movement-return.mjs'))),id=origin+'-wave-'+sha(sourceSHA256+implementationSHA256+JSON.stringify(WAVE_POLICY)).slice(0,12),versionFile=dir+'/versions/'+id+'.json';let result;
try{result=JSON.parse(await fs.readFile(versionFile));if(result.sourceSHA256!==sourceSHA256)throw Error('Source conflict');console.log('Reusing identical input/model '+id);}catch(e){if(e.code!=='ENOENT')throw e;}
if(!result){
 const assets=[],audit=[];
 for(const a of b.input.assets){
  const profile=b.candidate.assets.find(x=>x.code===a.code),prepared=prepareWave(a,profile,b.input,{informationCutoff:at});
  const conditional=fitConditionalPath(a,b.input,origin,[origin,...dates]);
  if(conditional.status!=='RESEARCH_ESTIMATE')throw Error('No own coefficients '+a.code);
  const originPrice=a.prices.find(p=>p.date===origin)?.close,seed=(WAVE_POLICY.seed+Number(a.code))>>>0;
  const sim=simulateWave(prepared,{originPrice,dates,baseMeans:conditional.rows.slice(1).map(r=>r.meanLogReturn),seed});
  const anchor={date:origin,p10:originPrice,p50:originPrice,p90:originPrice,mean:originPrice,return:0,anchor:true,eventIds:[]};
  const news=profile.news.map(n=>{const w=prepared.events.find(e=>e.id===n.id),used=w?.status==='exploratory';return{id:n.id,name:n.name,date:n.date,scope:n.scope,kind:n.kind,channel:n.channel,sources:n.sources,status:n.status,economicEventId:n.economicEventId,used,reason:w?.reason,sampleCount:w?.templates.length??0,effect:used?w.netLogResponse:0,numericImpactAllowed:false,pricingResearchOnly:true,evidenceAssessment:n.evidenceAssessment,impact:null,waveStatus:w?.status};});
  const {blocks,...model}=prepared;
  assets.push({id:profile.id,code:a.code,name:a.name,sector:a.sector,originPrice,originQuality:profile.originQuality,rows:[anchor,...sim.rows],news,conditionalPath:conditional,waveModel:{...model,coefficients:conditional.models,policy:WAVE_POLICY,seed},eventsUsed:news.filter(n=>n.used).length,newsByScope:profile.newsByScope,mode:'research_only',newsEffect:'observational_three_session_kernel',score:null,training:{ordinaryCount:prepared.ordinaryCount},fullHorizonValidated:false,probabilityCalibrationId:null,probTop10:null});
  const summary={code:a.code,name:a.name,selected:sim.rows.at(-1).wave.horizon,newsWaves:prepared.events.filter(e=>e.status==='exploratory').length,withheld:prepared.events.filter(e=>e.status!=='exploratory').map(e=>({id:e.id,reason:e.reason})),fomo:prepared.fomo,audit:sim.audit};audit.push(summary);
  console.log(JSON.stringify({code:a.code,name:a.name,paths:sim.audit.validatedPaths,newsWaves:summary.newsWaves,choice:summary.selected.selected}));
 }
 if(assets.length!==52||new Set(assets.map(a=>a.code)).size!==52)throw Error('Not original 52');
 const candidate={schema:b.candidate.schema,id,origin,end:b.input.end,createdAt:at,informationCutoff:at,modelVersion:WAVE_POLICY.id,modelStatus:'research_only',validatedPromotion:false,isRetrospectiveReconstruction:true,paths:WAVE_POLICY.paths,seed:WAVE_POLICY.seed,targets:[origin,...dates],assets,blocked:[],ranking:[],rankingStatus:'experimental_only',trustProbability:null,rowCount:assets.reduce((s,a)=>s+a.rows.length,0),notes:['종목별 3거래일 관측 반응 · 인과 효과 미입증','최근 보관 종가에서 다시 계산한 연구 전망 · 원래 발행본 아님','모형 확률 선택은 매매 권고 또는 실제 적중률이 아님']};
 result={schema:'atlas-news-wave-1',at,id,sourceSHA256,implementationSHA256,sourceForecastId:b.candidate.id,actualAsOf:origin,policy:WAVE_POLICY,candidate,audit,summary:{stocks:52,paths:52*WAVE_POLICY.paths,newsWaveStocks:audit.filter(a=>a.newsWaves>0).length,fomoEnabledStocks:0,actualAccuracy:null,newPricesCollected:false},sources:['https://otexts.com/fpp3/tscv.html','https://otexts.com/fpp3/prediction-intervals.html']};
 await fs.writeFile(versionFile,JSON.stringify(result),{flag:'wx'});
}
const rawResult=JSON.stringify(result);await fs.writeFile('public/data/news-wave.json.gz',gzipSync(rawResult,{level:9}));await fs.writeFile(dir+'/latest.json',JSON.stringify({...result,candidate:undefined},null,2));
await fs.writeFile('public/downloads/ATLAS_WAVE_52_EQUATIONS.json',JSON.stringify(result.candidate.assets.map(a=>({code:a.code,name:a.name,formula:'r = own_conditional_mean + event_template_or_ordinary_block; P = P0 * exp(sum r)',coefficientAsOf:a.conditionalPath.trainedThrough,models:a.conditionalPath.models,news:a.waveModel.events.map(({templates,...e})=>({...e,templateCount:templates.length})),fomo:a.waveModel.fomo,choice:a.rows.at(-1).wave.horizon})),null,2));
if(sha(await fs.readFile('public/data/atlas.json'))!==sourceSHA256)throw Error('Original changed');console.log(JSON.stringify({id,bytes:rawResult.length,...result.summary,originalPreserved:true}));

await import('./write_wave_display.mjs');
