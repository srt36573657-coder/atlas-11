import test from 'node:test';import assert from 'node:assert/strict';import fs from 'node:fs';
import {initialState,refreshState,collectActual} from '../lib/service.mjs';
const b=JSON.parse(fs.readFileSync(new URL('../public/data/atlas.json',import.meta.url)));
test('fixed period end refuses collection before invoking any remote collector',async()=>{
 const state=initialState(b);let calls=0;
 const result=await refreshState(state,{now:new Date('2026-10-30T15:00:00Z'),fetcher:async()=>{calls++;throw Error('should not run');},companyCollector:async()=>{calls++;},cycleCollector:async()=>{calls++;}});
 assert.equal(calls,0);assert.equal(result,state);assert.equal(result.input.end,'2026-10-30');
});
test('2026-09-27 holiday reports cached 52 closes and no new provider fetch',async()=>{
 let calls=0;const r=await collectActual(b.input,{now:new Date('2026-09-27T07:00:00Z'),fetcher:async()=>{calls++;throw Error('no holiday price fetch');}});
 assert.equal(calls,0);assert.equal(r.log.cached,52);assert.equal(r.log.success,0);assert.equal(r.log.marketClosed,true);assert.equal(r.log.cutoff,'2026-09-23');assert.deepEqual(r.input.assets,b.input.assets);
});
