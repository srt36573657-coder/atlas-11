import test from 'node:test';
import assert from 'node:assert/strict';
import {benchmarkScore} from '../lib/benchmark-score.mjs';
import {collectBenchmark,parseNaverBenchmark,NAVER_KOSPI_DAILY_URL} from '../lib/benchmark-collection.mjs';

const origin='2026-09-17',date='2026-09-18',at='2026-09-18T08:00:00Z';
const sessions=[origin,date];
const study={origin,end:'2026-10-30',sessions,informationCutoff:'2026-09-17T07:00:00Z',createdAt:'2026-09-18T07:00:00Z'};
const price=(date,close)=>({date,close,observedAt:at,source:{provider:'NAVER',url:NAVER_KOSPI_DAILY_URL}});
const initial=()=>({code:'KOSPI',prices:[price(origin,100),price(date,105)],collectionLogs:[]});
const args=(extra={})=>({study,benchmark:initial(),date,actualReturn:.12,predictedReturnA:0,predictedReturnB:.10,now:at,...extra});
const html=(rows=[[origin,100],[date,105]])=>`<html><a href="?code=KOSPI&amp;page=2">2</a><table>${rows.map(([date,value])=>`<tr><td class="date">${date.replaceAll('-','.')}</td><td class="number_1">${value}</td><td>0</td></tr>`).join('')}</table></html>`;
const options={sessions,origin,end:'2026-10-30',cutoff:date,observedAt:at};
const response=(body=html())=>({ok:true,status:200,url:NAVER_KOSPI_DAILY_URL,text:async()=>body});
test('benchmark actual excess is same-horizon beta=1 diagnostic and never a forecast',()=>{
  const score=benchmarkScore(args());
  assert.equal(score.status,'OBSERVED_DIAGNOSTIC');assert.ok(Math.abs(score.benchmarkReturn-.05)<1e-12);assert.ok(Math.abs(score.actualExcessReturn-.07)<1e-12);
  assert.equal(score.forward,null);assert.equal(score.forwardExcessForecastStatus,'UNESTIMABLE');
  assert.ok(score.reasons.includes('FROZEN_MARKET_FORECAST_MISSING'));
});
test('subtracting the same actual market return from prediction and outcome leaves error unchanged',()=>{
  const score=benchmarkScore(args()),p=.1,y=.12,m=score.benchmarkReturn;
  assert.ok(Math.abs(((p-m)-(y-m))-(p-y))<1e-12);
  const L=.04,U=.16;assert.equal(y>=L&&y<=U,y-m>=L-m&&y-m<=U-m);
});
test('benchmark rejects missing, duplicate, conflicting and mismatched series',()=>{
  for(const benchmark of [{code:'KOSDAQ',prices:[]},{code:'KOSPI',prices:[price(date,105)]},{...initial(),prices:[...initial().prices,price(date,105)]},{...initial(),prices:[...initial().prices,price(date,106)]}]) {
    const s=benchmarkScore(args({benchmark}));assert.equal(s.status,'UNAVAILABLE');assert.equal(s.actualExcessReturn,null);
  }
});
test('benchmark rejects unseen, before-close, missing-source and wrong-code rows',()=>{
  for(const patch of [{observedAt:'2026-09-19T08:00:00Z'},{observedAt:'2026-09-18T05:00:00Z'},{observedAt:'2026-09-18'},{source:null},{code:'KOSDAQ'},{close:0}]){
    const benchmark=initial();Object.assign(benchmark.prices[1],patch);
    assert.equal(benchmarkScore(args({benchmark})).status,'UNAVAILABLE');
  }
});
test('benchmark cannot substitute nearest date or calendar holiday',()=>{
  assert.equal(benchmarkScore(args({date:'2026-09-19'})).status,'UNAVAILABLE');
  assert.equal(benchmarkScore(args({date:'2026-09-16'})).status,'UNAVAILABLE');
  assert.equal(benchmarkScore(args({actualReturn:null})).status,'UNAVAILABLE');
  assert.equal(benchmarkScore(args({now:'2026-09-18T05:00:00Z'})).status,'UNAVAILABLE');
});
test('only cutoff-matched, seal-bound market forecast permits separate excess diagnostics',()=>{
  const withForecast={...study,benchmarkForecast:{code:'KOSPI',sourceKind:'FORECAST',origin,informationCutoff:study.informationCutoff,createdAt:study.createdAt,rows:[{date,predictedReturn:.03}]}};
  const s=benchmarkScore(args({study:withForecast}));
  assert.equal(s.forwardExcessForecastStatus,'FROZEN_MODEL_DIAGNOSTIC');assert.ok(Math.abs(s.forward.b.predictedExcessReturn-.07)<1e-12);assert.ok(Math.abs(s.forward.b.errorReturn)<1e-12);
  assert.equal(s.forward.b.intervalScore,null);assert.equal(s.forward.a.directionMatched,false);
  for(const patch of [{sourceKind:'ACTUAL'},{origin:'2026-09-16'},{informationCutoff:'2026-09-18T06:00:00Z'},{createdAt:'2026-09-19T08:00:00Z'},{rows:[{date,predictedReturn:.03},{date,predictedReturn:.04}]}]){
    const ss=benchmarkScore(args({study:{...withForecast,benchmarkForecast:{...withForecast.benchmarkForecast,...patch}}}));assert.equal(ss.forward,null);
  }
});
test('unresolved benchmark correction blocks descriptive excess and preserves conflict evidence',()=>{
  const benchmark={...initial(),conflicts:[{date,resolved:false}]};
  assert.ok(benchmarkScore(args({benchmark})).reasons.includes('BENCHMARK_UNRESOLVED_CONFLICT'));
});
test('NAVER daily parser preserves exact dates, closes, source digest and single-provider status',()=>{
  const rows=parseNaverBenchmark(html([[date,'7,080.92'],[origin,'6,715.00']]),options);
  assert.deepEqual(rows.map(r=>[r.date,r.close]),[[origin,6715],[date,7080.92]]);assert.equal(rows[0].vintageVerified,false);assert.match(rows[0].sourceSha256,/^[0-9a-f]{64}$/);
});
test('NAVER daily parser fails closed on wrong code/schema/invalid date/duplicate/price/non-session',()=>{
  const bodies=[html().replaceAll('KOSPI','KOSDAQ'),'<html>redirected client app</html>',html([[date,0]]),html([[date,'1,00']]),html([[date,105],[date,105]]),html([[date,105],[date,106]]),html([['2026-02-30',105]]),html([['2026-09-19',105]])];
  for(const body of bodies)assert.throws(()=>parseNaverBenchmark(body,{...options,cutoff:'2026-09-19'}));
});
test('NAVER parser never stores unclosed or out-of-range prices',()=>{
  const rows=parseNaverBenchmark(html([[origin,100],[date,105],['2026-09-21',110]]),options);assert.equal(rows.length,2);
  assert.throws(()=>parseNaverBenchmark(html(),{...options,observedAt:'2026-09-18T05:00:00Z'}));
});
test('collector performs one request, no mutation, retains old observations on repeated values',async()=>{
  const previous={code:'KOSPI',prices:[price(origin,100)],collectionLogs:[]},before=structuredClone(previous);let calls=0;
  const result=await collectBenchmark(previous,{sessions,now:new Date(at),fetcher:async(url,init)=>{calls++;assert.equal(url,NAVER_KOSPI_DAILY_URL);assert.equal(init.redirect,'error');return response();}});
  assert.equal(calls,1);assert.equal(result.exitCode,0);assert.equal(result.log.addedRows,1);assert.equal(result.log.reusedRows,1);assert.deepEqual(previous,before);assert.deepEqual(result.benchmark.prices[0],previous.prices[0]);
});
test('collector HTTP/schema/redirect/large responses fail without replacing lastgood',async()=>{
  for(const fetcher of [async()=>({ok:false,status:403}),async()=>response('<html>client shell</html>'),async()=>({...response(),url:'https://example.org/redirect'}),async()=>({...response(),headers:{get:()=>String(2*1024*1024)}})]){
    const previous=initial(),result=await collectBenchmark(previous,{sessions,now:new Date(at),fetcher});assert.equal(result.exitCode,2);assert.equal(result.log.attempts,1);assert.deepEqual(result.benchmark.prices,previous.prices);
  }
});
test('collector enforces deadline even when injected fetch ignores abort',async()=>{
  let calls=0;const start=Date.now();
  const result=await collectBenchmark(initial(),{sessions,now:new Date(at),timeoutMs:15,fetcher:async()=>{calls++;return new Promise(()=>{});}});
  assert.equal(calls,1);assert.equal(result.exitCode,2);assert.equal(result.log.error,'BENCHMARK_TIMEOUT');assert.ok(Date.now()-start<1000);
});
test('collector records before/after conflict and never silently updates old closes',async()=>{
  const previous=initial();const result=await collectBenchmark(previous,{sessions,now:new Date(at),fetcher:async()=>response(html([[origin,100],[date,106]]))});
  assert.equal(result.exitCode,2);assert.equal(result.benchmark.prices[1].close,105);assert.equal(result.benchmark.conflicts[0].after.close,106);assert.equal(result.benchmark.conflicts[0].before[0].close,105);assert.equal(previous.conflicts,undefined);
});
test('latest-table gap remains partial and fixed period is never extended',async()=>{
  const result=await collectBenchmark({code:'KOSPI',prices:[],collectionLogs:[]},{sessions,now:new Date(at),fetcher:async()=>response(html([[date,105]]))});
  assert.equal(result.exitCode,2);assert.deepEqual(result.log.missingDates,[origin]);
  const end=await collectBenchmark(initial(),{sessions,now:new Date('2026-10-31T08:00:00Z'),fetcher:async()=>{throw Error('must not fetch');}});
  assert.equal(end.log.attempts,0);assert.equal(end.log.status,'period_complete');
});
test('invalid prior rows never become silent duplicates and unresolved conflict keeps partial status',async()=>{
  const bad={...initial(),prices:[...initial().prices,price(date,105)]};
  const failed=await collectBenchmark(bad,{sessions,now:new Date(at),fetcher:async()=>{throw Error('must not fetch');}});
  assert.equal(failed.exitCode,2);assert.equal(failed.log.attempts,0);assert.deepEqual(failed.benchmark.prices,bad.prices);
  const previous={...initial(),conflicts:[{date,resolved:false}]};
  const partial=await collectBenchmark(previous,{sessions,now:new Date(at),fetcher:async()=>response()});
  assert.equal(partial.exitCode,2);assert.equal(partial.log.unresolvedConflicts,1);
});
