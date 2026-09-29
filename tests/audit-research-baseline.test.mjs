import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {createHash} from 'node:crypto';
import {initialState,upgradeState} from '../lib/service.mjs';
const bundle=JSON.parse(fs.readFileSync(new URL('../public/data/atlas.json',import.meta.url)));
const hash=x=>createHash('sha256').update(JSON.stringify(x)).digest('hex');
function checkHistory(state){
 assert.equal(state.cycleResearch.report.baselineId,bundle.candidate.id);
 assert.equal(state.pressResearch.report.baselineId,bundle.candidate.id);
 const cycles=[...state.cycleResearch.history,state.cycleResearch.report];
 for(const old of [...bundle.cycleResearch.history,bundle.cycleResearch.report])assert.ok(cycles.some(r=>hash(r)===hash(old)),'cycle report preserved');
 const reports=[...state.pressResearch.reports,state.pressResearch.report];
 for(const old of [...bundle.pressResearch.reports,bundle.pressResearch.report])assert.ok(reports.some(r=>hash(r)===hash(old)),'press report preserved');
 assert.equal(hash(state.input),hash(bundle.input));
 assert.equal(hash(state.versions.find(v=>v.id===bundle.candidate.id)),hash(bundle.candidate));
}
test('initial state derives active research baselines and preserves saved bundle/reports',()=>{
 const before=hash(bundle);const state=initialState(bundle);checkHistory(state);assert.equal(hash(bundle),before);
 const next=upgradeState(state,bundle);assert.equal(next.cycleResearch.history.length,state.cycleResearch.history.length);
 assert.equal(next.pressResearch.reports.length,state.pressResearch.reports.length);
});
test('same-model persisted state repairs stale research baselines without mutating saved state',()=>{
 const current=initialState(bundle),stale={...current,cycleResearch:bundle.cycleResearch,pressResearch:bundle.pressResearch};
 const before=hash(stale),next=upgradeState(stale,bundle);checkHistory(next);assert.equal(hash(stale),before);
});
