import test from 'node:test';import assert from 'node:assert/strict';
import {transition} from '../lib/service.mjs';
import {journalInputChange} from '../lib/input-revisions.mjs';
import {pricesAsOf,eventsAsOf} from '../lib/evidence.mjs';
import {mergeNews} from '../lib/news-sources.mjs';
import {evaluateForecast} from '../lib/engine.mjs';
import {appendEvaluationLedger,latestEvaluationRows} from '../lib/evaluation-ledger.mjs';
const fixture=()=>({schema:2,newsSchema:1,origin:'2026-09-17',end:'2026-10-30',actualAsOf:'2026-09-18',events:[],calendar:{sessions:['2026-09-17','2026-09-18','2026-10-30']},assets:Array.from({length:52},(_,i)=>({code:String(i+1).padStart(6,'0'),name:'fixture'+i,sector:'sector',prices:[{date:'2026-09-17',close:100},{date:'2026-09-18',close:101}]}))});
const evt={id:'x',kind:'IR',name:'fixture',announcementDate:'2026-10-01',targetDate:'2026-10-01',status:'completed',scope:{type:'company',codes:['000001']},sources:[{url:'https://example.org'}],availableAt:'2026-09-18T00:00:00Z',publicationDate:'2026-09-18',publishedAt:'2026-09-18T00:00:00Z'};
test('manual writes journal price/news inserts edits deletes and replay original cutoff',()=>{
 const old=fixture();old.events=[evt];const incoming=structuredClone(old);incoming.assets[0].prices[0].close=999;incoming.assets[1].prices.pop();incoming.events=[];incoming.priceRevisions=[];
 const {input:next}=journalInputChange(old,incoming,{now:'2026-09-27T00:00:00Z'});
 assert.deepEqual(pricesAsOf(next,'2026-09-19T00:00:00Z'),old.assets);assert.deepEqual(eventsAsOf(next,'2026-09-19T00:00:00Z'),old.events);
 const again=journalInputChange(next,{...next,priceRevisions:[],newsRevisions:[]},{now:'2026-09-28T00:00:00Z'});assert.deepEqual(again.input,next);assert.equal(again.changed,false);
 const inserted=fixture();inserted.events=[evt];const x=journalInputChange(fixture(),inserted,{now:'2026-09-27T00:00:00Z'}).input;assert.deepEqual(eventsAsOf(x,'2026-09-19T00:00:00Z'),[]);assert.equal(x.events[0].availableAt,'2026-09-27T00:00:00Z');
});
test('input revision advances once on real change; no-op and caller mutation cannot affect state',()=>{
 const input=fixture(),state={input,revision:9,versions:[]};assert.equal(transition(state,'input',{input}).revision,9);
 const edited=structuredClone(input);edited.assets[0].prices[0].close=999;const next=transition(state,'input',{input:edited});assert.equal(next.revision,10);edited.assets[0].prices[0].close=1;assert.equal(next.input.assets[0].prices[0].close,999);assert.equal(state.input.assets[0].prices[0].close,100);
});
test('publication corrections journal; explicit full snapshots remove obsolete evidence while parser patches preserve it',()=>{
 const input={...fixture(),events:[{...evt,materialityEvidence:{verified:true}}]};
 for(const field of ['publishedAt','publicationDate','timezone']){const e={...input.events[0],[field]:'changed'};const m=mergeNews(input,[e],[],'2026-09-27T00:00:00Z');assert.equal(m.events[0][field],'changed');assert.equal(m.newsRevisions.length,1);}
 const patch={...evt,name:'changed'};const partial=mergeNews(input,[patch],[],'2026-09-27T00:00:00Z');assert.deepEqual(partial.events[0].materialityEvidence,{verified:true});const full=mergeNews(input,[patch],[],'2026-09-27T00:00:00Z',{completeRecords:true});assert.equal(full.events[0].materialityEvidence,undefined);assert.deepEqual(eventsAsOf(full,'2026-09-19T00:00:00Z'),input.events);
});
const version=()=>({id:'v',origin:'2026-09-17',createdAt:'2026-09-17T07:00:00Z',informationCutoff:'2026-09-17T07:00:00Z',assets:[{code:'000001',originPrice:100,rows:[{date:'2026-09-18',p50:100,p10:90,p90:110,rawProbUp:.5}]}]});
test('unavailable and invalid point forecasts never become zero-price scores',()=>{
 for(const p50 of [null,NaN,Infinity,0,-1]){const v=version();v.assets[0].rows[0].p50=p50;assert.equal(evaluateForecast(v,fixture()).n,0);assert.equal(appendEvaluationLedger([],[v],fixture()).length,0);}
 const v=version();v.assets[0].rows[0].p10=null;assert.equal(evaluateForecast(v,fixture()).coverage,null);assert.equal(evaluateForecast(v,fixture()).meanWidth,null);assert.equal(appendEvaluationLedger([],[v],fixture())[0].interval.inside,null);
});
test('latest evaluated vintage is independent of merge insertion order',()=>{
 const a=appendEvaluationLedger([],[version()],fixture(),{now:'2026-09-19T00:00:00Z'})[0];const b={...a,id:'corrected',actual:102,actualObservedAt:'2026-09-20T00:00:00Z',recordedAt:'2026-09-20T00:00:00Z'};
 assert.equal(latestEvaluationRows([a,b])[0].actual,102);assert.equal(latestEvaluationRows([b,a])[0].actual,102);
});
