import test from 'node:test';
import assert from 'node:assert/strict';
import {pairedCycleAudit} from '../lib/cycle-validation.mjs';
const day=i=>new Date(Date.UTC(2024,0,1+i)).toISOString().slice(0,10);
const fixture=(step=30)=>Array.from({length:12},(_,i)=>({code:'A',date:day(i*step),targetDate:day(i*step+20),horizon:20,lossCandidate:.01+i*.001,lossBase:.2,lossNaive:.21}));
test('audit rejects overlapping target windows without enabling model',()=>{
 const r=pairedCycleAudit(fixture(1),{draws:99});
 assert.equal(r.status,'insufficient_evidence');assert.equal(r.enabled,false);
 assert.equal(r.inputErrors[0].code,'OVERLAPPING_TARGET_WINDOWS');assert.deepEqual(r.comparisons,[]);
});
test('audit identical duplicates and input ordering do not change result',()=>{
 const rows=fixture(),base=pairedCycleAudit(rows,{draws:99});
 assert.equal(base.status,'retrospective_research_only');
 assert.deepEqual(pairedCycleAudit([...rows,rows[0]],{draws:99}),base);
 assert.deepEqual(pairedCycleAudit([...rows].reverse(),{draws:99}),base);
});
test('audit conflicting duplicates fail closed regardless of ordering',()=>{
 const rows=fixture(),conflict={...rows[0],lossCandidate:9};
 for(const input of [[conflict,...rows],[...rows,conflict]]){
  const r=pairedCycleAudit(input,{draws:99});assert.equal(r.status,'insufficient_evidence');
  assert.equal(r.inputErrors[0].code,'CONFLICTING_DUPLICATE');assert.deepEqual(r.comparisons,[]);
 }
});
test('audit conflicting target dates fail closed',()=>{
 const rows=fixture();const r=pairedCycleAudit([...rows,{...rows[0],targetDate:day(21)}],{draws:99});
 assert.equal(r.inputErrors[0].code,'CONFLICTING_DUPLICATE');
});

test('audit accepts adjacent half-open return windows sharing a boundary',()=>{
 const rows=fixture(20);const r=pairedCycleAudit(rows,{draws:99});
 assert.equal(r.status,'retrospective_research_only');assert.equal(r.dateClusters,12);
 assert.equal(r.inputErrors,undefined);assert.equal(r.enabled,false);
});
