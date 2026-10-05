import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {sha256} from '../lib/cycle-math.mjs';
import {buildPressHistoryReport} from '../lib/press-history.mjs';
import {createPressResearch,appendPressReport,replacePressResearch} from '../lib/press-runtime.mjs';
import {initialState,upgradeState,transition,refreshState,mergeRefresh} from '../lib/service.mjs';

const input=JSON.parse(fs.readFileSync(new URL('../public/data/input.json',import.meta.url)));
const data=JSON.parse(fs.readFileSync(new URL('../public/data/press-history.json',import.meta.url)));
const cutoff='2026-09-27T02:35:00+09:00',later='2026-09-28T04:00:00+09:00';
// Short forecast fixtures exercise state handling without running another model.
// The historical observations and operating prices below are the real dataset.
function fixture(){
 const candidate={id:'2026-09-23-11111111',modelVersion:'atlas-news-7.0.0',origin:'2026-09-23',end:input.end,informationCutoff:cutoff,assets:input.assets.map(a=>({code:a.code,name:a.name,sector:a.sector,originPrice:100,rows:[{date:'2026-09-23',p10:100,p50:100,p90:100,mean:100,anchor:true}],news:[]}))};
 const bundle={input:structuredClone(input),candidate,original:{...structuredClone(candidate),id:'2026-09-17-00000000',origin:input.origin},priorVersions:[]};
 bundle.pressResearch=createPressResearch(bundle.input,candidate,data,{cutoff});
 return bundle;
}
const operatingHash=s=>sha256({input:s.input,versions:s.versions,original:s.original,active:s.active,actions:s.actions});
const revisedData=()=>{const next=structuredClone(data);next.observations.find(o=>o.id==='press-0149').value=180;return next;};

test('real articles connect all 52 stocks with 4 agreeing, 8 conflicting and 3 unavailable company comparisons',()=>{
 const bundle=fixture(),before=sha256({input:bundle.input,candidate:bundle.candidate,data});
 const report=buildPressHistoryReport(bundle.input,bundle.candidate,data,{cutoff});
 assert.equal(report.rows.length,52);
 assert.equal(report.counts.observations,160);
 assert.equal(report.counts.companyObservations,15);
 assert.equal(report.counts.pricePass,4);
 assert.equal(report.counts.priceWarn,8);
 assert.equal(report.counts.priceMissing,3);
 assert.equal(report.counts.live,0);
 const samsung=report.rows.find(r=>r.code==='005930');
 assert.deepEqual(samsung.observations.map(o=>o.id).sort(),['press-0146','press-0149','press-0152','press-0160']);
 const daily=samsung.priceChecks.find(c=>c.observationId==='press-0152');
 assert.equal(daily.status,'warn');assert.equal(daily.reported,2.01);
 assert.ok(Math.abs(daily.computed-100*(253500/250500-1))<1e-12);
 assert.deepEqual(daily.referenceDates,['2026-09-15','2026-09-16']);
 const close=samsung.priceChecks.find(c=>c.observationId==='press-0160');
 assert.equal(close.status,'pass');assert.equal(close.computed,253500);
 const unlinked=report.rows.find(r=>r.code==='000720');
 assert.equal(unlinked.observationCount,0);assert.deepEqual(unlinked.priceChecks,[]);
 for(const row of report.rows){
  assert.ok(row.observations.every(o=>o.stockCode===row.code));
  assert.equal(row.effects.priceShift,0);assert.equal(row.effects.dailyTrainingRows,0);
  assert.equal(row.evidenceDecision.numericImpactAllowed,false);assert.equal(row.trustProbability,null);
 }
 assert.equal(sha256({input:bundle.input,candidate:bundle.candidate,data}),before);
});

test('report history is idempotent and later-collected articles cannot enter a historical cutoff',()=>{
 const bundle=fixture(),first=bundle.pressResearch;
 const repeat=appendPressReport(first,bundle.input,bundle.candidate,{cutoff:later});
 assert.equal(repeat,first);assert.equal(repeat.reports.length,1);
 const historical=appendPressReport(first,bundle.input,bundle.candidate,{cutoff:'2026-09-17T16:00:00+09:00'});
 assert.equal(historical.report.counts.observations,0);
 assert.equal(historical.reports.length,2);
 assert.deepEqual(historical.reports[0],first.report);
 assert.equal(first.report.counts.observations,160);
 assert.deepEqual(historical.data,first.data);
});

test('article replacements are conditional and preserve every previous release and report',()=>{
 const bundle=fixture(),previous=bundle.pressResearch,before=sha256(previous),replacement=revisedData();
 assert.throws(()=>replacePressResearch(previous,bundle.input,bundle.candidate,replacement,{cutoff,expectedDataHash:'stale'}),/변경/);
 assert.equal(sha256(previous),before);
 const next=replacePressResearch(previous,bundle.input,bundle.candidate,replacement,{cutoff:later,expectedDataHash:previous.dataHash});
 assert.equal(next.releaseHistory.length,2);assert.equal(next.reports.length,2);
 assert.deepEqual(next.releaseHistory[0].data,data);
 assert.deepEqual(next.reports[0],previous.report);
 const restored=appendPressReport(next,bundle.input,bundle.candidate,{cutoff:'2026-09-27T04:00:00+09:00'});
 assert.equal(restored.report.rows.find(r=>r.code==='005930').observations.find(o=>o.id==='press-0149').value,178.57,'later accepted corrections cannot rewrite an earlier comparison');
 assert.equal(restored.reports.length,2);
 assert.deepEqual(restored.reports.find(r=>r.id===previous.report.id),previous.report,'archived report and its original metadata stay immutable');
 assert.equal(restored.data.observations.find(o=>o.id==='press-0149').value,180,'historical replay does not revert the current input');
 replacement.observations[0].value=-999;
 assert.notEqual(next.data.observations[0].value,-999,'caller mutation cannot alter the accepted input');
 assert.equal(sha256(previous),before);
});

test('state installation, upgrade and conditional import preserve the original prices and forecast records',()=>{
 const bundle=fixture(),state=initialState(bundle),before=operatingHash(state);
 assert.equal(state.pressResearch.report.counts.linkedForecasts,52);
 const old=structuredClone(state);delete old.pressResearch;
 const upgraded=upgradeState(old,bundle);
 assert.equal(upgraded.pressResearch.dataHash,state.pressResearch.dataHash);
 assert.equal(operatingHash(upgraded),before);
 const next=transition(state,'press-input',{data:revisedData(),expectedDataHash:state.pressResearch.dataHash});
 assert.equal(operatingHash(next),before);
 assert.equal(next.pressResearch.releaseHistory.length,2);
 assert.equal(next.pressResearch.report.baselineId,next.active);
 assert.equal(next.pressResearch.priceAdjustmentApplied,false);
 assert.throws(()=>transition(next,'press-input',{data,expectedDataHash:state.pressResearch.dataHash}),/변경/);
 assert.equal(state.pressResearch.releaseHistory.length,1);
});

test('a bundled article update keeps a local edit and retains the offered release for review',()=>{
 const bundle=fixture(),base=initialState(bundle);
 const current=transition(base,'press-input',{data:revisedData(),expectedDataHash:base.pressResearch.dataHash});
 const incoming=structuredClone(data);incoming.observations.find(o=>o.id==='press-0149').value=181;
 const offered={...bundle,pressResearch:createPressResearch(bundle.input,bundle.candidate,incoming,{cutoff:later})};
 const merged=upgradeState(current,offered);
 assert.equal(merged.pressResearch.dataHash,current.pressResearch.dataHash);
 assert.equal(merged.pressResearch.data.observations.find(o=>o.id==='press-0149').value,180);
 assert.equal(merged.pressResearch.unappliedReleases.at(-1).data.observations.find(o=>o.id==='press-0149').value,181);
 assert.equal(operatingHash(merged),operatingHash(current));
 assert.equal(upgradeState(merged,offered),merged,'the same offered release is not duplicated');
});

test('offline refresh and concurrent merge preserve article evidence, user edits and all forecast prices',async()=>{
 const state=initialState(fixture());
 const update=await refreshState(state,{now:new Date(cutoff),fetcher:async()=>{throw Error('fixture offline');}});
 assert.deepEqual(update.versions,state.versions);
 assert.deepEqual(update.pressResearch.data,state.pressResearch.data);
 assert.equal(update.collectionLogs.at(-1).exitCode,2);
 assert.equal(update.pressResearch.report.baselineId,update.active);
 const current=transition(state,'press-input',{data:revisedData(),expectedDataHash:state.pressResearch.dataHash});
 const merged=mergeRefresh(current,update);
 assert.equal(merged.pressResearch.dataHash,current.pressResearch.dataHash);
 assert.equal(merged.pressResearch.unappliedReleases.at(-1).dataHash,update.pressResearch.dataHash);
 assert.deepEqual(merged.versions,current.versions);
 assert.equal(merged.pressResearch.report.baselineId,merged.active);
});
