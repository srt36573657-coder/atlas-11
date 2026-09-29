import test from 'node:test';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import fs from 'node:fs';
import {sha256,ridge,predict,phaseMembership,stableJSON,mean,variance} from '../lib/cycle-math.mjs';
import {emptyCycleData,mergeCycleData,cycleSnapshot,resolveCycleMapping} from '../lib/cycle-data.mjs';
import {logReturns,sectorInnovations,prepareCycleFeatures} from '../lib/cycle-features.mjs';
import {fitCycleModel,cycleCorrection,shiftedCandidate,trainingOrigins} from '../lib/cycle-model.mjs';
import {buildCycleResearch,createCycleState,appendCycleReport} from '../lib/cycle-research.mjs';
import {collectCycleData,parseKrxIndexResponse} from '../lib/cycle-collection.mjs';
import {pairedCycleAudit} from '../lib/cycle-validation.mjs';
import {explainCycle} from '../lib/cycle-explanation.mjs';
import {CYCLE_PROTOCOL as P} from '../lib/cycle-protocol.mjs';
import {initialState,transition,upgradeState,mergeRefresh} from '../lib/service.mjs';
const input={origin:'2026-09-17',end:'2026-10-30',actualAsOf:'2026-09-23',calendar:{sessions:['2026-09-17','2026-09-18','2026-09-21','2026-09-22','2026-09-23','2026-09-28']},assets:Array.from({length:52},(_,i)=>({code:String(i).padStart(6,'0'),name:'합성 검사 '+i,sector:'합성 업종 '+i,prices:[]}))};
const source='https://data.krx.co.kr/test-fixture',now='2026-09-26T17:00:00+09:00',later='2026-09-27T17:00:00+09:00';
const evidence={sourceUrl:source,observedAt:now,vintageVerified:true,archiveUrl:source+'/archive',availableAt:'2026-09-01T16:00:00+09:00'};
function payload(){
 return {schema:'atlas-cycle-input-1',
 calendar:{...evidence,sessions:input.calendar.sessions},
 series:[{id:'M',name:'합성 시장',kind:'market',market:'KOSPI',currency:'KRW',basis:'PR',methodId:'fixture',launchDate:'1980-01-01',...evidence,rows:[{date:'2026-09-17',close:100,...evidence,availableAt:'2026-09-17T16:00:00+09:00'},{date:'2026-09-18',close:110,...evidence,availableAt:'2026-09-18T16:00:00+09:00'}]},
 {id:'S',name:'합성 업종',kind:'sector',market:'KOSPI',currency:'KRW',basis:'PR',methodId:'fixture',launchDate:'1980-01-01',...evidence,rows:[]}],
 mappings:[{id:'map0',code:'000000',marketIndexId:'M',sectorIndexId:'S',mappingType:'exact',effectiveFrom:'2020-01-01',effectiveTo:null,...evidence}]};
}
test('portable SHA-256 matches node crypto, including Korean and long inputs',()=>{
 for(const v of ['', 'abc','주기·업종 🔎','a'.repeat(20000)]){
  assert.equal(sha256(v),createHash('sha256').update(v).digest('hex'));
 }
 assert.equal(sha256({b:2,a:1}),sha256({a:1,b:2}));
});
test('ridge solves known coefficients with a stable residual and rejects nonfinite inputs',()=>{
 const X=Array.from({length:300},(_,i)=>[Math.sin(i),Math.cos(i*.3)]),y=X.map(r=>2*r[0]-3*r[1]+.4);
 const fit=ridge(X,y,1e-9,{intercept:true});assert.ok(Math.abs(fit.coefficients[0]-2)<1e-9);assert.ok(Math.abs(fit.coefficients[1]+3)<1e-9);assert.ok(Math.abs(fit.intercept-.4)<1e-9);assert.ok(fit.relativeSystemResidual<1e-10);
 assert.throws(()=>ridge([[NaN]],[1],1));
});
test('state membership sums to one, preserves signs and is not a probability field',()=>{
 for(const x of [-1000,-2,0,2,1000])for(const y of [-1000,-2,0,2,1000]){
  const p=phaseMembership(x,y);assert.ok(Math.abs(Object.values(p).reduce((a,b)=>a+b)-1)<1e-12);assert.ok(Object.values(p).every(Number.isFinite));
  if(x>0&&y>0)assert.equal(Math.max(...Object.values(p)),p.risingFaster);
 }
 assert.equal(phaseMembership(NaN,0),null);
});
test('new evidence is immutable, idempotent and cannot silently replace an index observation',()=>{
 const blank=emptyCycleData(input),data=mergeCycleData(blank,payload(),input,{now});
 assert.equal(blank.series.length,0);assert.equal(data.series.length,2);
 assert.deepEqual(mergeCycleData(data,payload(),input,{now:later}),data);
 const changed=payload();changed.series[0].rows[0].close=90;
 assert.throws(()=>mergeCycleData(data,changed,input,{now:later}),/충돌/);
});
test('recorded index corrections undo at the historical cutoff; future duplicate mapping does not block the past',()=>{
 const data=mergeCycleData(emptyCycleData(input),payload(),input,{now}),before=cycleSnapshot(data,'2026-09-20T18:00:00+09:00');
 const p=payload();p.series[0].rows=p.series[0].rows.slice(0,1);p.series[0].rows[0].close=90;p.series=p.series.slice(0,1);delete p.calendar;delete p.mappings;
 p.replacements=[{entity:'row:M',key:'2026-09-17',expectedHash:sha256(data.series[0].rows[0]),reason:'검사 수정'}];
 let after=mergeCycleData(data,p,input,{now:later});
 assert.deepEqual(cycleSnapshot(after,'2026-09-20T18:00:00+09:00').series,before.series);
 const m={...payload().mappings[0],id:'future-conflict',vintageVerified:false,observedAt:later};
 after=mergeCycleData(after,{schema:'atlas-cycle-input-1',mappings:[m]},input,{now:later});
 assert.equal(resolveCycleMapping(cycleSnapshot(after,'2026-09-20T18:00:00+09:00'),'000000','2026-09-18').status,'ready');
 assert.equal(resolveCycleMapping(cycleSnapshot(after,later),'000000','2026-09-18').status,'abstain');
});
test('index launch backcasts cannot become contemporaneous verified history',()=>{
 const p=payload();p.series[0].launchDate='2026-09-22';
 const data=mergeCycleData(emptyCycleData(input),p,input,{now});
 assert.ok(data.series[0].rows.every(r=>r.backcast&&!r.vintageVerified));
 assert.equal(cycleSnapshot(data,now).series[0].rows.length,0);
});
test('missing trading day breaks a return window and large signed losses are retained',()=>{
 const sessions=['2026-09-17','2026-09-18','2026-09-21','2026-09-22'];
 const r=logReturns([{date:sessions[0],close:100},{date:sessions[1],close:60},{date:sessions[3],close:50}],sessions);
 assert.ok(Math.abs(r[0].value-Math.log(.6))<1e-12);assert.equal(r[1].value,null);assert.equal(r[2].value,null);
});
test('causal features do not change when later prices are altered; series are not silently spliced across gaps',()=>{
 const sessions=Array.from({length:850},(_,i)=>new Date(Date.UTC(2020,0,1+i)).toISOString().slice(0,10));
 let m=100,s=100,a=100;
 const market={rows:[]},sector={rows:[]},asset={prices:[]};
 sessions.forEach((date,i)=>{const r=.012*Math.sin(i*.12)+.002*Math.cos(i*.009),u=.008*Math.cos(i*.23);m*=Math.exp(r);s*=Math.exp(.7*r+u);a*=Math.exp(1.2*r+.8*u);market.rows.push({date,close:m});sector.rows.push({date,close:s});asset.prices.push({date,close:a});});
 const base=prepareCycleFeatures(asset,market,sector,{sessions},sessions[799]);
 assert.ok(base.vector?.every(Number.isFinite));assert.ok(base.exposure.count>=126);
 const altered=structuredClone(market);altered.rows[810].close*=.4;
 assert.deepEqual(prepareCycleFeatures(asset,altered,sector,{sessions},sessions[799]).vector,base.vector);
 const missing=structuredClone(sector);missing.rows.splice(760,1);
 assert.equal(prepareCycleFeatures(asset,market,missing,{sessions},sessions[799]).vector,null);
});
function learningRows(code='000000',horizons=3){
 const rows=[];
 for(let i=0;i<62;i++){
  const start=new Date(Date.UTC(2018,0,1)+i*40*86400000),date=start.toISOString().slice(0,10),features=[Math.sin(i*.7),Math.cos(i*.4),Math.sin(i*.17),Math.cos(i*.9)];
  for(let h=1;h<=horizons;h++){
   const targetDate=new Date(+start+h*86400000).toISOString().slice(0,10),y=(.03*features[0]-.02*features[1]+.01*features[2]-.015*features[3])*h;
   rows.push({id:code+':'+date+':'+h,code,date,targetDate,horizon:h,features,originPrice:100,actualPrice:100*Math.exp(y),
    baselineMedianPrice:100,baseExpectedLogReturn:0,baselineOrigin:date,baselineId:'synthetic:'+date,baselineModelVersion:'atlas-news-7.0.0',baselineDataHash:'a'.repeat(64),
    baselineLogMeaning:'expected_log_return',baselineInformationCutoff:date+'T16:00:00+09:00',featureAsOf:date+'T16:00:00+09:00',
    vintageVerified:true,archiveUrl:source,knownAt:targetDate+'T16:00:00+09:00',pointInTimeVerified:true,adjustmentsVerified:true,calendarVerified:true,sourceUrls:[source],mappingKey:'fixture'});
  }
 }
 return rows;
}
test('residual calibration uses only the same company and purges targets from train/test overlap',()=>{
 const rows=learningRows(),model=fitCycleModel(rows,'000000',[1,2,3],{mappingKey:'fixture'});
 assert.equal(model.status,'retrospective_research_only');assert.ok(model.fit.trainedThrough<model.holdout[0].date);assert.ok(model.pointMetrics.candidate<model.pointMetrics.base);
 assert.equal(model.enabled,false);assert.equal(model.trustProbability,null);assert.equal(model.liveWeight,0);
 const irrelevant=learningRows('000001').map(r=>({...r,actualPrice:r.actualPrice*10}));
 assert.deepEqual(fitCycleModel([...rows,...irrelevant],'000000',[1,2,3],{mappingKey:'fixture'}),model);
 assert.equal(fitCycleModel(rows.map(r=>({...r,baselineLogMeaning:'log_mean_price'})),'000000',[1,2,3]).eligible,0);
 assert.equal(fitCycleModel(rows.map(r=>({...r,targetDate:'2026-09-18'})),'000000',[1,2,3]).eligible,0);
});
test('holdout outcomes cannot change learned coefficients or selected ridge',()=>{
 const rows=learningRows(),first=fitCycleModel(rows,'000000',[1,2,3],{mappingKey:'fixture'}),firstTest=first.holdout[0].date;
 const modified=rows.map(r=>r.date>=firstTest?{...r,actualPrice:r.actualPrice*1.5}:r);
 const second=fitCycleModel(modified,'000000',[1,2,3],{mappingKey:'fixture'});
 assert.deepEqual(second.fit,first.fit);assert.notEqual(second.pointMetrics.candidate,first.pointMetrics.candidate);
});
test('duplicate horizon records abstain rather than arbitrarily selecting a training outcome',()=>{
 const rows=learningRows(),base=trainingOrigins(rows,'000000',[1,2,3]).origins.length;
 assert.equal(trainingOrigins([...rows,{...rows[0],id:'duplicate',actualPrice:500}],'000000',[1,2,3]).origins.length,base-1);
});
test('daily contributions reconcile with cumulative shift, leaving baseline paths untouched',()=>{
 const model=fitCycleModel(learningRows(),'000000',[1,2,3],{mappingKey:'fixture'}),correction=cycleCorrection(model.fit,[.2,.8,-.3,.5],[1,2,3]);
 const asset={code:'000000',rows:Array.from({length:4},(_,i)=>({date:'2026-09-'+(17+i),p10:90,p50:100,p90:110,mean:101}))},before=JSON.stringify(asset);
 const candidate=shiftedCandidate(asset,correction);assert.equal(JSON.stringify(asset),before);assert.equal(candidate.rows[0].p50,100);
 for(let i=1;i<4;i++){assert.ok(Math.abs(correction[i].contributions.reduce((s,c)=>s+c.logValue,0)-correction[i].dailyDelta)<1e-10);assert.ok(Math.abs(candidate.rows[i].p50/100-Math.exp(correction[i].delta))<1e-12);}
 assert.equal(candidate.enabled,false);assert.equal(candidate.trustProbability,null);
});
test('date-cluster audit never equates resampling with independent validation or certifies live use',()=>{
 const rows=Array.from({length:16},(_,i)=>({code:'000000',date:new Date(Date.UTC(2023,0,1)+i*40*86400000).toISOString().slice(0,10),targetDate:new Date(Date.UTC(2023,0,21)+i*40*86400000).toISOString().slice(0,10),horizon:20,lossCandidate:.01+i*.0001,lossBase:.03+i*.0003,lossNaive:.04+i*.0001}));
 const audit=pairedCycleAudit(rows,{draws:99});assert.equal(audit.dateClusters,16);assert.equal(audit.draws,99);assert.equal(audit.enabled,false);assert.equal(audit.independentCrossValidationCount,null);assert.equal(audit.comparisons.length,2);
});
test('collector requires credentials and configuration without inventing requests or history',async()=>{
 let requests=0;const data=emptyCycleData(input);
 const result=await collectCycleData(input,data,{apiKey:'',fetcher:async()=>{requests++;throw Error('unexpected');}});
 assert.equal(requests,0);assert.equal(result.exitCode,2);assert.deepEqual(result.data,data);assert.equal(result.log.attempted,0);
});
test('official daily response matches exact index name/date and rejects wrong company-like data',()=>{
 const defs=[{id:'M',responseName:'검사 지수'}];
 const parsed=parseKrxIndexResponse({OutBlock_1:[{BAS_DD:'20260923',IDX_NM:'검사 지수',CLSPRC_IDX:'1,234.5'}]},{date:'2026-09-23',definitions:defs,observedAt:now,sourceUrl:source});
 assert.equal(parsed[0].rows[0].close,1234.5);assert.equal(parsed[0].rows[0].vintageVerified,false);
 assert.throws(()=>parseKrxIndexResponse({OutBlock_1:[{BAS_DD:'20260922',IDX_NM:'검사 지수',CLSPRC_IDX:100}]},{date:'2026-09-23',definitions:defs}),/불일치/);
});
test('403 stops retries and retains last good data; API key never enters the failure report',async()=>{
 const data=mergeCycleData(emptyCycleData(input),payload(),input,{now}),key='synthetic-test-key';let calls=0;
 const result=await collectCycleData(input,data,{apiKey:key,now:new Date(later),config:{services:[{endpoint:'https://data-dbg.krx.co.kr/svc/apis/idx/example',start:'2026-09-21',series:[{id:'M'}]}]},fetcher:async()=>{calls++;return new Response('',{status:403});}});
 assert.equal(calls,1);assert.equal(result.log.failed,1);assert.ok(result.log.deferred>0);assert.deepEqual(result.data,data);assert.ok(!JSON.stringify(result).includes(key));
});
test('52 real stocks are all represented; original forecasts, inputs and price engine remain unchanged',()=>{
 const b=JSON.parse(fs.readFileSync(new URL('../public/data/atlas.json',import.meta.url)));
 const before=sha256({input:b.input,original:b.original,prior:b.priorVersions,candidate:b.candidate});
 const state=createCycleState(b.input,b.candidate,{cutoff:now}),report=state.report;
 assert.equal(report.rows.length,52);assert.equal(report.counts.features,0);assert.equal(report.counts.live,0);assert.equal(report.trustProbability,null);
 const again=appendCycleReport(state,b.input,b.candidate,{cutoff:later});assert.equal(again.history.length,0);
 assert.equal(sha256({input:b.input,original:b.original,prior:b.priorVersions,candidate:b.candidate}),before);
 assert.equal(createHash('sha256').update(JSON.stringify(b.original)).digest('hex'),'1af446f745c88cfb308de348f238f2fa8d31265b5322e2f035f5aafb6d5833ca');
 assert.equal(explainCycle(report,b.input.assets[0].code,'2026-10-30','other-baseline').status,'stale');
});
test('collector resumes missing dates, shares requests, stores last good rows and does not refetch identical coverage',async()=>{
 const data=mergeCycleData(emptyCycleData(input),payload(),input,{now});
 const config={services:[{endpoint:'https://data-dbg.krx.co.kr/svc/apis/idx/example',start:'2026-09-21',series:[{...data.series[0],responseName:'검사 지수'}]}]};
 let calls=0;const fetcher=async url=>{calls++;const date=new URL(url).searchParams.get('basDd');return Response.json({OutBlock_1:[{BAS_DD:date,IDX_NM:'검사 지수',CLSPRC_IDX:'120'}]});};
 const first=await collectCycleData(input,data,{config,apiKey:'fixture',now:new Date(later),fetcher});
 assert.equal(first.exitCode,0);assert.equal(first.log.success,3);assert.equal(first.log.addedRows,3);assert.equal(calls,3);assert.equal(data.series[0].rows.length,2);
 const second=await collectCycleData(input,first.data,{config,apiKey:'fixture',now:new Date(later),fetcher});
 assert.equal(calls,3);assert.equal(second.log.addedRows,0);assert.deepEqual(second.data,first.data);
});
test('stock market and sector classification cannot be relabeled across a history under the same series ID',()=>{
 const data=mergeCycleData(emptyCycleData(input),payload(),input,{now}),changed=payload();
 changed.series[0].methodId='new-classification';changed.replacements=[{entity:'series',key:'M',expectedHash:sha256(data.series[0]),reason:'classification change'}];
 assert.throws(()=>mergeCycleData(data,changed,input,{now:later}),/새 series ID/);
});
test('post-target knowledge and post-origin features are excluded from strict calibration',()=>{
 const rows=learningRows();
 assert.equal(fitCycleModel(rows.map(r=>({...r,knownAt:'2026-09-26T16:00:00+09:00'})),'000000',[1,2,3]).eligible,0);
 assert.equal(fitCycleModel(rows.map(r=>({...r,featureAsOf:r.date+'T17:00:00+09:00'})),'000000',[1,2,3]).eligible,0);
 assert.equal(fitCycleModel(rows.map(r=>({...r,archiveUrl:null})),'000000',[1,2,3]).eligible,0);
});
function stateFixture(){
 const candidate={id:'2026-09-17-11111111',modelVersion:'atlas-news-7.0.0',origin:input.origin,end:input.end,informationCutoff:now,assets:input.assets.map(a=>({...a,originPrice:100,rows:[{date:input.origin,p10:100,p50:100,p90:100,mean:100,anchor:true}],news:[]}))};
 return {input:structuredClone(input),candidate,original:{...structuredClone(candidate),id:'2026-09-17-00000000'},priorVersions:[]};
}
test('cycle import persists separately and cannot change original input, price forecasts or operating storage identity',()=>{
 const b=stateFixture(),state=initialState(b),before=stableJSON({input:state.input,versions:state.versions});
 const next=transition(state,'cycle-input',{data:payload()});
 assert.equal(stableJSON({input:next.input,versions:next.versions}),before);
 assert.equal(state.cycleResearch.data.series.length,0);assert.equal(next.cycleResearch.data.series.length,2);
 const old=structuredClone(state);delete old.cycleResearch;
 const upgraded=upgradeState(old,b);assert.deepEqual(upgraded.versions,old.versions);assert.deepEqual(upgraded.input,old.input);
 assert.equal(upgraded.cycleResearch.report.rows.length,52);
 assert.ok(fs.readFileSync(new URL('../src/storage.mjs',import.meta.url),'utf8').includes('indexedDB.open("atlas-news-v3", 1)'));
});
test('concurrent refresh retains user-edited cycle evidence and keeps the unapplied collector copy',()=>{
 const b=stateFixture(),base=transition(initialState(b),'cycle-input',{data:payload()});
 const current=structuredClone(base),update=structuredClone(base);
 current.cycleResearch.data.mappings[0].note='사용자 확인';
 update.cycleResearch.data.mappings[0].note='수집기 확인';
 Object.defineProperty(update,'refreshBase',{value:{input:base.input,cycleDataHash:sha256(base.cycleResearch.data)}});
 const merged=mergeRefresh(current,update);
 assert.equal(merged.cycleResearch.data.mappings[0].note,'사용자 확인');
 assert.equal(merged.cycleResearch.unappliedCollections.at(-1).data.mappings[0].note,'수집기 확인');
 assert.deepEqual(merged.versions,current.versions);
});
test('rolling sector residual equals the full ridge reference on the same strictly prior window',()=>{
 const sessions=Array.from({length:300},(_,i)=>new Date(Date.UTC(2020,0,1+i)).toISOString().slice(0,10));
 let a=100,b=100;const market={rows:[]},sector={rows:[]};
 sessions.forEach((date,i)=>{a*=Math.exp(.01*Math.sin(i*.12));b*=Math.exp(.007*Math.sin(i*.12)+.005*Math.cos(i*.27));market.rows.push({date,close:a});sector.rows.push({date,close:b});});
 const result=sectorInnovations(market,sector,sessions),i=280;
 const X=result.market.slice(i-252,i).map(r=>[r.value]),y=result.sector.slice(i-252,i).map(r=>r.value);
 const full=ridge(X,y,P.residualRidge*variance(X.map(r=>r[0])),{intercept:true});
 assert.ok(Math.abs(result.residual[i].value-(result.sector[i].value-predict(full,[result.market[i].value])))<1e-12);
});

test('archived baseline extraction uses exact mean-log values and refuses late or missing original provenance',async()=>{
 const {deriveCycleTrainingRows}=await import('../lib/cycle-training.mjs');
 const dates=Array.from({length:850},(_,i)=>new Date(Date.UTC(2020,0,1+i)).toISOString().slice(0,10));
 const provenance={sourceUrl:source,observedAt:now,vintageVerified:true,archiveUrl:source+'/archive',availableAt:'2019-01-01T16:00:00+09:00'};
 const series=['M','S','A'].map((id,j)=>({id,name:'합성 검사 '+id,kind:j===0?'market':j===1?'sector':'stock',market:'KOSPI',currency:'KRW',basis:'PR',methodId:'synthetic-only',launchDate:'1980-01-01',...provenance,...(j===2?{stockCode:'000000',adjustmentsVerified:true}:{}),rows:[]}));
 let prices=[100,100,100];
 dates.forEach((date,i)=>{const m=.012*Math.sin(i*.12)+.002*Math.cos(i*.009),u=.008*Math.cos(i*.23);
  const returns=[m,.7*m+u,1.2*m+.8*u];
  series.forEach((s,j)=>{prices[j]*=Math.exp(returns[j]);s.rows.push({date,close:prices[j],...provenance,availableAt:date+'T16:00:00+09:00'});});
 });
 const p={schema:'atlas-cycle-input-1',calendar:{...provenance,sessions:dates},series,mappings:[{...payload().mappings[0],...provenance}]};
 const data=mergeCycleData(emptyCycleData(input),p,input,{now}),origin=dates[799],anchor=series[2].rows[799].close;
 const baseRows=dates.slice(799,803).map((date,h)=>({date,p10:anchor*.8,p50:anchor*(1+h*.01),p90:anchor*1.2}));
 const version={id:'synthetic-archived',origin,end:dates[802],modelVersion:'atlas-news-7.0.0',informationCutoff:origin+'T18:00:00+09:00',assets:input.assets.map(a=>({...a,originPrice:anchor,rows:baseRows,numericSummary:{rows:baseRows.map((r,h)=>({date:r.date,expectedLogPrice:Math.log(anchor)+h*.02}))}}))};
 const record={version,input:structuredClone(input),provenance:{pointInTimeVerified:true,archiveUrl:source+'/stored-baseline'}};
 const result=deriveCycleTrainingRows([record],data,input,{now});
 assert.equal(result.trainingRows.length,3,JSON.stringify(result.report.skipped.slice(0,4)));assert.ok(result.trainingRows.every(r=>r.code==='000000'));
 assert.ok(Math.abs(result.trainingRows[1].baseExpectedLogReturn-.04)<1e-12);
 assert.equal(result.trainingRows[1].baselineMedianPrice,baseRows[2].p50);
 assert.equal(result.trainingRows[1].actualPrice,series[2].rows[801].close);
 const corrected={schema:'atlas-cycle-input-1',series:[{...series[2],rows:[{...series[2].rows[801],close:999}]}],replacements:[{entity:'row:A',key:dates[801],expectedHash:sha256(data.series[2].rows[801]),reason:'합성 검사에서의 사후 정정'}]};
 const revised=mergeCycleData(data,corrected,input,{now:later});
 assert.equal(deriveCycleTrainingRows([record],revised,input,{now:later}).trainingRows[1].actualPrice,series[2].rows[801].close);
 const merged=mergeCycleData(data,result,input,{now});
 assert.equal(trainingOrigins(merged.trainingRows,'000000',[1,2,3]).origins.length,1);
 const late=structuredClone(record);late.version.informationCutoff=dates[800]+'T16:00:00+09:00';
 assert.equal(deriveCycleTrainingRows([late],data,input,{now}).trainingRows.length,0);
 const absent=structuredClone(record);delete absent.provenance;
 assert.equal(deriveCycleTrainingRows([absent],data,input,{now}).trainingRows.length,0);
});

test('walk-forward outer folds use distinct dates with every trained target before the test origin',()=>{
 const model=fitCycleModel(learningRows(),'000000',[1,2,3],{mappingKey:'fixture'});
 assert.equal(model.folds.length,2);
 const dates=new Set();
 for(const fold of model.folds)assert.ok(fold.trainedThrough<fold.testStart);
 for(const row of model.walkForwardHoldout.filter(r=>r.horizon===3)){
  assert.ok(!dates.has(row.date));dates.add(row.date);assert.ok(row.trainedThrough<row.date);
 }
 assert.equal(dates.size,24);
});

test('runtime configuration errors do not prevent server startup and invalid request budgets cannot claim success',async()=>{
 const {createCycleCollector}=await import('../lib/cycle-runtime.mjs');
 const previous=process.env.ATLAS_CYCLE_CONFIG_JSON;
 process.env.ATLAS_CYCLE_CONFIG_JSON='{broken';
 try{
  const collector=createCycleCollector({apiKey:'fixture'});
  const b=stateFixture();
  await assert.rejects(collector({input:b.input,version:b.candidate}),/형식 오류/);
 }finally{if(previous===undefined)delete process.env.ATLAS_CYCLE_CONFIG_JSON;else process.env.ATLAS_CYCLE_CONFIG_JSON=previous;}
 await assert.rejects(collectCycleData(input,emptyCycleData(input),{maxRequests:NaN}),/요청 예산/);
 await assert.rejects(collectCycleData(input,emptyCycleData(input),{maxRequests:0}),/요청 예산/);
});

test('short calibration histories cannot satisfy the fixed three-year initial training requirement',()=>{
 const rows=learningRows().map((r,j)=>{
  const i=Math.floor(j/3),h=j%3+1,date=new Date(Date.UTC(2023,0,1)+i*10*86400000).toISOString().slice(0,10),targetDate=new Date(Date.parse(date+'T00:00:00Z')+h*86400000).toISOString().slice(0,10);
  return {...r,date,targetDate,baselineOrigin:date,baselineId:'short:'+date,featureAsOf:date+'T16:00:00+09:00',baselineInformationCutoff:date+'T16:00:00+09:00',knownAt:targetDate+'T16:00:00+09:00'};
 });
 const model=fitCycleModel(rows,'000000',[1,2,3]);
 assert.equal(model.fit,null);assert.match(model.reasons[0],/3년/);
 const long=fitCycleModel(learningRows(),'000000',[1,2,3]);
 assert.ok(long.walkForwardHoldout.every(r=>Number.isFinite(r.lossMarketOnly)));
 assert.ok(Number.isFinite(long.pointMetrics.marketOnly));
 const audit=pairedCycleAudit(long.walkForwardHoldout,{horizon:3,draws:99});
 assert.equal(audit.comparisons.length,3);assert.ok(audit.comparisons.some(r=>r.key.endsWith(':marketOnly')));
});
