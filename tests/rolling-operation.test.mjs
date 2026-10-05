import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import {ROLLING_HORIZONS,rollingOperationWindow,mergeRollingPrices,rollingHash,rollingScoreRecord,persistRollingScore} from '../lib/rolling-operation.mjs';
const sessions=['2026-09-17','2026-09-18','2026-09-21','2026-09-22','2026-09-23','2026-09-28','2026-09-29','2026-09-30','2026-10-01','2026-10-02','2026-10-06','2026-10-07','2026-10-08','2026-10-12','2026-10-13','2026-10-14','2026-10-15','2026-10-16','2026-10-19','2026-10-20','2026-10-21','2026-10-22','2026-10-23','2026-10-26','2026-10-27','2026-10-28','2026-10-29','2026-10-30','2026-11-02'];
const input={origin:'2026-09-17',end:'2026-10-30',actualAsOf:'2026-09-23',calendar:{sessions},assets:[{code:'005930',name:'Samsung',prices:sessions.slice(0,5).map(date=>({date,close:100}))}],events:[]};
const obs={code:'005930',sourceUrl:'https://alphasquare.co.kr/home/stock-summary?code=005930',rawHash:'a'.repeat(64),observedAt:'2026-09-28T06:40:00Z',rows:[{date:'2026-09-28',open:100,high:102,low:65,close:70,volume:10,turnover:700}]};
const finalized={...obs,finalClose:true,sessionDate:'2026-09-28',finalizedAt:'2026-09-28T06:35:00Z',finalitySourceUrl:obs.sourceUrl,finalityBasis:'provider daily-final status; snapshot retained'};
const publication=(overrides={})=>({id:'p1',issuedAt:'2026-09-23T07:00:00Z',actualAsOf:'2026-09-23',assets:[{code:'005930',anchor:{date:'2026-09-23',close:100},rows:[{date:'2026-09-28',p50:95,p10:60,p90:120}]}],...overrides});
test('rolling starts after close at15:40, keeps run deadline distinct from20day horizon',()=>{
 assert.equal(rollingOperationWindow(input,'2026-09-28T06:29:59Z').cutoff,'2026-09-23');
 assert.equal(rollingOperationWindow(input,'2026-09-28T06:35:00Z').eligible,false);
 const ready=rollingOperationWindow(input,'2026-09-28T06:40:00Z');assert.equal(ready.eligible,true);assert.equal(ready.deadlineMissed,false);
 assert.equal(rollingOperationWindow(input,'2026-09-28T07:00:00Z').deadlineMissed,true);
 assert.equal(rollingOperationWindow(input,'2026-09-25T07:00:00Z').session,false);
 assert.equal(rollingOperationWindow(input,'2026-11-02T07:00:00Z').ended,true);
 assert.equal(rollingOperationWindow(input,'2026-11-02T07:00:00Z',{runEndDate:null}).eligible,true);
});
test('early session close cannot pass without explicit finality; extreme loss survives exact before/after journal',()=>{
 assert.throws(()=>mergeRollingPrices(input,[obs],{now:obs.observedAt,expectedHash:rollingHash(input)}),/FINAL_CLOSE_EVIDENCE/);
 const r=mergeRollingPrices(input,[finalized],{now:obs.observedAt,expectedHash:rollingHash(input)});
 assert.equal(r.input.assets[0].prices.at(-1).close,70);assert.equal(r.confirmedTodayCodes.length,1);assert.equal(r.input.priceRevisions[0].beforeRow,null);assert.equal(r.input.priceRevisions[0].afterRow.close,70);assert.equal(input.assets[0].prices.length,5);
 const same=mergeRollingPrices(r.input,[finalized],{now:obs.observedAt,expectedHash:rollingHash(r.input)});assert.equal(same.changed,false);
 assert.throws(()=>mergeRollingPrices(input,[finalized],{now:obs.observedAt,expectedHash:'old'}),/VERSION_CONFLICT/);
});
test('future, invalid, conflicting and wrong-company rows fail without mutation',()=>{
 const options={now:obs.observedAt,expectedHash:rollingHash(input)};
 assert.throws(()=>mergeRollingPrices(input,[{...finalized,code:'000000'}],options),/PRICE_CODE/);
 assert.throws(()=>mergeRollingPrices(input,[{...finalized,rows:[{...obs.rows[0],date:'2026-09-29'}]}],options),/NOT_COMPLETED/);
 assert.throws(()=>mergeRollingPrices(input,[{...finalized,rows:[{...obs.rows[0],volume:NaN}]}],options),/NUMERIC/);
 assert.throws(()=>mergeRollingPrices(input,[finalized,{...finalized,rows:[{...obs.rows[0],close:80}]}],options),/CONFLICT/);
 assert.throws(()=>mergeRollingPrices(input,[{...finalized,observedAt:'2026-09-28T06:20:00Z'}],options),/INTRADAY/);
 assert.equal(input.assets[0].prices.length,5);
});
test('four error cells use exact sessions, actual denominator and first immutable daily publication',()=>{
 const actual=mergeRollingPrices(input,[finalized],{now:obs.observedAt,expectedHash:rollingHash(input)}).input;
 const corrected=publication({id:'p2',issuedAt:'2026-09-23T08:00:00Z',assets:[{code:'005930',rows:[{date:'2026-09-28',p50:70,p10:60,p90:120}]}]});
 const score=rollingScoreRecord([corrected,publication()],actual,{now:obs.observedAt});
 assert.deepEqual(Object.keys(score.assets[0].horizons),['1','5','10','20']);assert.equal(score.assets[0].horizons[1].forecastId,'p1');assert.equal(score.assets[0].horizons[1].ape,25/70*100);assert.equal(score.assets[0].horizons[1].directionCorrect,true);assert.equal(score.assets[0].horizons[5].reason,'no_published_vintage');assert.equal(score.independentDateCount,1);assert.equal(score.stockRowsAreIndependent,false);assert.equal(ROLLING_HORIZONS.length,4);
});
test('newly reconstructed forecast never borrows stale anchor date as historical issuance',()=>{
 const actual=mergeRollingPrices(input,[finalized],{now:obs.observedAt,expectedHash:rollingHash(input)}).input;
 const late=publication({issuedAt:'2026-09-28T08:00:00Z'});
 const r=rollingScoreRecord([late],actual,{now:'2026-09-28T08:01:00Z'});
 assert.equal(r.assets[0].horizons[1].ape,null);assert.equal(r.assets[0].horizons[1].reason,'no_published_vintage');assert.equal(r.independentDateCount,0);
});
test('missing price is null not zero; zero, NaN and contradictory actual are unscored',()=>{
 for(const row of [undefined,{date:'2026-09-28',close:0},{date:'2026-09-28',close:NaN},{date:'2026-09-28',close:70,quality:'conflict'}]){
  const x=structuredClone(input);if(row)x.assets[0].prices.push(row);
  const r=rollingScoreRecord([publication()],x,{now:'2026-09-28T07:00:00Z'});assert.equal(r.assets[0].horizons[1].ape,null);
 }
});
test('actual correction creates distinct score archive and links exact revision without replacing prior score',async()=>{
 const root=await fs.mkdtemp(path.join(os.tmpdir(),'atlas-rolling-score-'));
 try{
  const x=mergeRollingPrices(input,[finalized],{now:obs.observedAt,expectedHash:rollingHash(input)}).input;
  const first=rollingScoreRecord([publication()],x,{now:'2026-09-28T07:00:00Z'}),saved=await persistRollingScore(first,{rootDir:root});
  const quote={...finalized,observedAt:'2026-09-28T07:05:00Z',rows:[{...obs.rows[0],close:80}]};
  const next=mergeRollingPrices(x,[quote],{now:quote.observedAt,expectedHash:rollingHash(x)}).input;
  const second=rollingScoreRecord([publication()],next,{now:quote.observedAt,previousScoreId:first.scoreId});await persistRollingScore(second,{rootDir:root});
  assert.notEqual(first.scoreId,second.scoreId);assert.equal(second.assets[0].horizons[1].actualRevisions.at(-1).before,70);assert.equal(second.assets[0].horizons[1].actualRevisions.at(-1).after,80);
  assert.equal(JSON.parse(await fs.readFile(saved.archive)).assets[0].horizons[1].actual,70);assert.equal((await fs.readdir(path.join(root,'reports/rolling/scores'))).length,2);
  const same=rollingScoreRecord([publication()],next,{now:'2026-09-28T07:06:00Z'});assert.equal(same.scoreId,second.scoreId);const reused=await persistRollingScore(same,{rootDir:root});assert.equal(reused.record.observedAt,second.observedAt);
 }finally{await fs.rm(root,{recursive:true,force:true});}
});
test('52 companies each retain exactlyfour cells without sharing another company forecast',()=>{
 const x=structuredClone(input);x.assets=Array.from({length:52},(_,i)=>({code:String(i).padStart(6,'0'),name:String(i),prices:[{date:'2026-09-28',close:100,observedAt:'2026-09-28T07:00:00Z'}]}));
 const r=rollingScoreRecord([publication()],x,{now:'2026-09-28T07:00:00Z'});assert.equal(r.assets.length,52);assert.equal(r.assets.flatMap(a=>Object.values(a.horizons)).length,208);assert.ok(r.assets.every(a=>Object.values(a.horizons).every(c=>c.ape===null)));
});
test('scorer independently rejects an early observed quote lacking finality and weekend backdating',()=>{
 const x=structuredClone(input);x.assets[0].prices.push({...obs.rows[0],observedAt:obs.observedAt});
 assert.equal(rollingScoreRecord([publication()],x,{now:'2026-09-28T07:00:00Z'}).assets[0].horizons[1].reason,'actual_finality_unverified');
 const monday={...publication(),issuedAt:'2026-09-27T09:00:00Z'};
 const a=mergeRollingPrices(input,[finalized],{now:obs.observedAt,expectedHash:rollingHash(input)}).input;
 const r=rollingScoreRecord([monday],a,{now:'2026-09-28T07:00:00Z'});assert.equal(r.assets[0].horizons[1].ape,null);assert.equal(r.independentDateCount,0);
});
test('raw source bytes use standard SHA256 for Buffer and Uint8Array including a sliced byte view',()=>{
 const expected='ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad';
 assert.equal(rollingHash('abc'),expected);
 assert.equal(rollingHash(Buffer.from('abc')),expected);
 assert.equal(rollingHash(new Uint8Array([97,98,99])),expected);
 assert.equal(rollingHash(new Uint8Array([0,97,98,99,0]).subarray(1,4)),expected);
 assert.notEqual(rollingHash({type:'Buffer',data:[97,98,99]}),expected);
 assert.equal(rollingHash({a:1}),rollingHash('{"a":1}'));
});
test('a finalClose label cannot authorize a wrong date, early finalizedAt or closed-session price',()=>{
 const options={now:obs.observedAt,expectedHash:rollingHash(input)};
 for(const change of [{sessionDate:'2026-09-23'},{finalizedAt:'2026-09-28T06:29:59Z'},{finalizedAt:'2026-09-28T06:41:00Z'},{finalitySourceUrl:''},{finalityBasis:''}])assert.throws(()=>mergeRollingPrices(input,[{...finalized,...change}],options),/FINAL_CLOSE_EVIDENCE/);
 assert.throws(()=>mergeRollingPrices(input,[{...finalized,rows:[{...obs.rows[0],date:'2026-09-25'}]}],options),/NOT_COMPLETED_SESSION/);
 const calendar={...input.calendar,notices:[{date:'2026-09-28',requiresCloseReview:true,reason:'special time unresolved'}]};
 assert.equal(rollingOperationWindow(input,obs.observedAt,{calendar}).eligible,false);
 assert.throws(()=>mergeRollingPrices(input,[finalized],{...options,calendar}),/NOT_COMPLETED_SESSION/);
});
