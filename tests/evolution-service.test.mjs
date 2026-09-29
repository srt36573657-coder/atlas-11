import test from 'node:test';
import assert from 'node:assert/strict';
import {initialState,clientState,refreshState,transition,upgradeState,mergeRefresh} from '../lib/service.mjs';
import {updateEvolution} from '../lib/evolution.mjs';
function fixture(){
 const codes=['005930','000660'];
 const input={schema:2,newsSchema:1,origin:'2026-09-17',end:'2026-10-30',actualAsOf:'2026-09-18',informationAsOf:'2026-09-18T08:00:00Z',events:[],calendar:{sessions:['2026-09-17','2026-09-18','2026-09-21','2026-09-28','2026-10-30']},assets:codes.map(code=>({code,name:code,sector:'semiconductor',prices:[{date:'2026-09-17',close:100,quality:'single_source'},{date:'2026-09-18',close:101,quality:'single_source'}]}))};
 const version={id:'2026-09-17-00000001',origin:input.origin,end:input.end,modelVersion:'atlas-news-8.1.0',createdAt:'2026-09-17T08:00:00Z',informationCutoff:'2026-09-17T08:00:00Z',assets:codes.map(code=>({code,name:code,sector:'semiconductor',originPrice:100,news:[],rows:[{date:'2026-09-18',p50:101,p10:90,p90:112,rawProbUp:.55},{date:'2026-09-21',p50:102,p10:90,p90:115,rawProbUp:.56},{date:'2026-09-28',p50:104,p10:89,p90:119,rawProbUp:.57},{date:'2026-10-30',p50:110,p10:80,p90:130,rawProbUp:.6}]}))};
 // This fixture tests an already issued shadow forecast, never one issued at the test runner's current date.
 const evolution=updateEvolution({input,versions:[version],original:version,active:version.id,evaluationLedger:[]},new Date('2026-09-18T08:00:00Z'));
 return {input,original:version,candidate:structuredClone(version),priorVersions:[],evaluationLedger:[],evolution};
}
test('service hydration and compact API preserve evolution without mutating frozen forecasts',()=>{
 const b=fixture(),before=JSON.stringify(b);const s=initialState(b);assert.ok(s.evolution);assert.equal(JSON.stringify(b),before);assert.deepEqual(clientState(s).evolution,s.evolution);
 const next=upgradeState(s,b);assert.deepEqual(next.versions,s.versions);assert.deepEqual(next.evolution,s.evolution);
});
test('partial price refresh updates learning from observed issuer while retaining all forecasts',async()=>{
 const b=fixture(),state=initialState(b);const frozen=JSON.stringify(state.versions);const now=new Date('2026-09-28T08:00:00Z');
 const fetcher=async url=>{const u=new URL(url);if(u.hostname!=='fchart.stock.naver.com'||u.searchParams.get('symbol')!=='005930')throw Error('fixture source unavailable');return new Response('<chartdata symbol="005930"><item data="20260928|105|106|104|105|100"/></chartdata>');};
 const next=await refreshState(state,{now,fetcher});assert.equal(next.input.assets[0].prices.at(-1).date,'2026-09-28');assert.equal(next.input.assets[1].prices.at(-1).date,'2026-09-18');assert.equal(JSON.stringify(next.versions),frozen);assert.equal(next.collectionLogs.at(-1).partial,true);
 assert.ok(next.evolution.evaluations.some(e=>e.code==='005930'&&e.date==='2026-09-28'));
 assert.equal(next.evolution.evaluations.some(e=>e.code==='000660'&&e.date==='2026-09-28'),false);
 assert.deepEqual(next.evolution,updateEvolution({...next,evolution:state.evolution},now));
 assert.deepEqual(updateEvolution(next,now),next.evolution);
 assert.ok(Object.hasOwn(next,'refreshBase'));
});
test('failed source collection retains evolution and does not fabricate a fresh outcome',async()=>{
 const state=initialState(fixture()),now=new Date('2026-09-28T08:00:00Z');state.evolution=updateEvolution(state,now);const before=JSON.stringify(state.evolution);
 const next=await refreshState(state,{now,fetcher:async()=>{throw Error('fixture offline');}});assert.equal(JSON.stringify(next.evolution),before);assert.equal(next.collectionLogs.at(-1).partial,true);assert.deepEqual(next.versions,state.versions);
});
test('state merge preserves both incoming and current append-only evolution records',()=>{
 const state=initialState(fixture()),incoming=structuredClone(state);Object.defineProperty(incoming,'refreshBase',{value:{input:state.input}});const next=mergeRefresh(state,incoming);assert.deepEqual(next.evolution,state.evolution);assert.deepEqual(clientState(next).evolution,next.evolution);
});

test('manual evolution notes are append-only hypotheses and cannot alter baseline coefficients',()=>{
 const state=initialState(fixture()),before=JSON.stringify(state.versions);
 const note={code:'005930',date:'2026-09-28',kind:'REVIEW',detail:'실제 결과와 모델 차이를 검토합니다',status:'CONFIRMED',applied:true};
 const first=transition(state,'evolutionNote',{note});assert.equal(first.evolution.notes.length,1);assert.equal(first.evolution.notes[0].status,'HYPOTHESIS');assert.equal(first.evolution.notes[0].applied,false);assert.equal(first.revision,state.revision+1);
 const retry=transition(first,'evolutionNote',{note});assert.equal(retry.evolution.notes.length,1);assert.equal(retry.revision,first.revision);assert.equal(JSON.stringify(retry.versions),before);
 const branch=transition(state,'evolutionNote',{note:{...note,detail:'다른 원문을 추가로 대조합니다'}});Object.defineProperty(branch,'refreshBase',{value:{input:state.input}});
 const merged=mergeRefresh(first,branch);assert.equal(merged.evolution.notes.length,2);assert.deepEqual(merged.evolution.notes[0],first.evolution.notes[0]);
});
test('evolution validation failure keeps prior object and marks partial even when repeated',async()=>{
 const state=initialState(fixture());state.evolution={schema:99,retained:'unmigrated record'};const now=new Date('2026-09-28T08:00:00Z');const options={now,fetcher:async()=>{throw Error('fixture offline');}};
 const next=await refreshState(state,options);assert.deepEqual(next.evolution,state.evolution);assert.equal(next.collectionLogs.at(-1).evolution.status,'FAILED_PRIOR_PRESERVED');assert.equal(next.evolutionErrors.length,1);
 const retry=await refreshState(next,options);assert.deepEqual(retry.evolution,state.evolution);assert.equal(retry.evolutionErrors.length,1);assert.equal(retry.collectionLogs.at(-1).evolution.status,'FAILED_PRIOR_PRESERVED');
});

test('unchanged released evolution upgrade returns the same state reference',()=>{
 const bundle=fixture(),state=initialState(bundle);bundle.evolution=structuredClone(state.evolution);
 assert.equal(upgradeState(state,bundle),state);
 assert.equal(upgradeState(upgradeState(state,bundle),bundle),state);
});
test('release hydration merges earlier immutable shadow notes and archives conflicting branches once',()=>{
 const bundle=fixture(),state=initialState(bundle);
 const note={id:'issued-before-device',code:'005930',date:'2026-09-18',kind:'REVIEW',detail:'보관된 이전 검토',status:'HYPOTHESIS',applied:false,recordedAt:'2026-09-18T08:00:00Z'};
 bundle.evolution={...structuredClone(state.evolution),notes:[note]};
 const merged=upgradeState(state,bundle);assert.deepEqual(merged.evolution.notes,[note]);assert.deepEqual(merged.evolution.versions,state.evolution.versions);assert.equal(upgradeState(merged,bundle),merged);
 const conflicted={...bundle,evolution:{...structuredClone(bundle.evolution),notes:[{...note,detail:'같은 ID의 다른 내용'}]}};
 const held=upgradeState(merged,conflicted);assert.deepEqual(held.evolution.notes,[note]);assert.equal(held.unappliedEvolution.length,1);assert.deepEqual(held.unappliedEvolution[0].evolution,conflicted.evolution);assert.equal(upgradeState(held,conflicted),held);
});
