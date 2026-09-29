import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import {initialState,collectActual,mergeRefresh,refreshState} from '../lib/service.mjs';
import {pricesAsOf} from '../lib/evidence.mjs';
import {historicalBundle} from './helpers/before-completion.mjs';
const bundle=historicalBundle();
const clone=structuredClone;
const at='2026-09-28T08:00:00.000Z';
test('NAVER insertion and correction have reversible full-row journals and input is immutable',async()=>{
 const input=clone(bundle.input),asset=input.assets[0],code=asset.code;
 const existing=asset.prices.find(p=>p.date===input.actualAsOf&&p.close>0),newClose=Math.round(existing.close*1.02),correction=Math.round(existing.close*1.01);
 existing.previousProviderOnly='preserved in beforeRow only';const before=JSON.stringify(input);
 const row=(date,close)=>`<item data="${date.replaceAll('-','')}|${close}|${close+1}|${close-1}|${close}|10"/>`;
 const result=await collectActual(input,{now:new Date(at),fetcher:async url=>{
  if(new URL(url).searchParams.get('symbol')!==code)throw Error('other provider unavailable');
  return new Response(`<chartdata symbol="${code}">${row(existing.date,correction)}${row('2026-09-28',newClose)}</chartdata>`);
 }});
 assert.equal(JSON.stringify(input),before);
 const revisions=result.input.priceRevisions.filter(r=>r.at===at&&r.code===code);
 assert.equal(revisions.length,2);assert.equal(revisions.find(r=>r.date==='2026-09-28').beforeRow,null);
 assert.equal(revisions.find(r=>r.date===existing.date).afterRow.close,correction);
 const installed=result.input.assets[0].prices.find(p=>p.date===existing.date);
 assert.deepEqual(revisions.find(r=>r.date===existing.date).afterRow,installed);assert.equal(installed.previousProviderOnly,undefined);
 assert.deepEqual(pricesAsOf(result.input,'2026-09-27T00:00:00Z').find(a=>a.code===code).prices,asset.prices);
});
function changedUpdate(state){
 const update=clone(state),asset=update.input.assets[0],row=asset.prices.at(-1),before=clone(row);
 row.close*=1.01;
 update.input.priceRevisions=[...(update.input.priceRevisions??[]),{code:asset.code,date:row.date,before:before.close,beforeRow:before,after:row.close,afterRow:clone(row),at}];
 update.input.informationAsOf=at;update.input.newsCheckedAt='2026-09-25T00:00:00Z';
 Object.defineProperty(update,'refreshBase',{value:{input:state.input},enumerable:false});
 return update;
}
test('concurrent merge retains price journal despite an older macro-news timestamp',()=>{
 const state=initialState(clone(bundle)),update=changedUpdate(state),current=clone(state);
 current.input.newsCheckedAt='2026-09-29T00:00:00Z';
 const merged=mergeRefresh(current,update),code=state.input.assets[0].code;
 assert.equal(merged.input.assets[0].prices.at(-1).close,update.input.assets[0].prices.at(-1).close);
 assert.ok(merged.input.priceRevisions.some(r=>r.at===at&&r.code===code));
 assert.equal(merged.input.newsCheckedAt,current.input.newsCheckedAt);
 assert.deepEqual(pricesAsOf(merged.input,'2026-09-27T00:00:00Z')[0].prices,state.input.assets[0].prices);
});
test('conflicting user edits and duplicate news survive three-way merge without activating an incompatible forecast',()=>{
 const state=initialState(clone(bundle)),update=changedUpdate(state),current=clone(state);
 current.input.assets[0].prices.at(-1).close*=0.97;
 const event=clone(current.input.events[0]);
 const id=event.id;current.input.events[0].name='user edit';update.input.events.find(e=>e.id===id).name='concurrent source edit';
 const merged=mergeRefresh(current,update);
 assert.equal(merged.input.assets[0].prices.at(-1).close,current.input.assets[0].prices.at(-1).close);
 assert.equal(merged.input.events.filter(e=>e.id===id).length,2);
 assert.ok(merged.mergeConflicts.some(c=>c.type==='price'));assert.ok(merged.mergeConflicts.some(c=>c.type==='news'));
 assert.ok(merged.unappliedPriceRevisions.some(r=>r.at===at));
 assert.equal(merged.active,current.active);assert.deepEqual(merged.actions,current.actions);
});
test('company-source partial results persist independently while injected legacy fetch never starts company requests',async()=>{
 const state=initialState(clone(bundle));let companyCalls=0;
 const collector=async({previous,input})=>{companyCalls++;assert.equal(input.assets.length,52);return{registry:previous?.registry??null,state:{lastGood:'retained'},report:{partial:true,newVerifiedEvents:0,perAsset:input.assets.map(a=>({code:a.code,observedSources:0}))},exitCode:2};};
 const opts={now:new Date('2026-09-26T08:00:00Z'),fetcher:async()=>{throw Error('offline');}};
 const skipped=await refreshState(state,opts);assert.equal(companyCalls,0);assert.equal(skipped.collectionLogs.at(-1).companyNews.status,'NOT_RUN');
 const result=await refreshState(state,{...opts,companyCollector:collector});
 assert.equal(companyCalls,1);assert.equal(result.companyNewsCollection.state.lastGood,'retained');
 assert.equal(result.collectionLogs.at(-1).exitCode,2);assert.equal(result.collectionLogs.at(-1).companyNews.perAsset.length,52);
 assert.equal(Object.keys(result).includes('refreshBase'),false);
 assert.deepEqual(result.versions,state.versions);
});
