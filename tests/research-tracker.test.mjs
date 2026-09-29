import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {createHash} from 'node:crypto';
import {
  TARGETS, initialState, validateState, applyResult, plan, completionGate, finalize,
} from '../scripts/ATLAS_Research_13.mjs';

// Synthetic evidence stays in memory. It must never enter production news/state.
const now=Date.parse('2026-09-26T12:00:00Z');
const stored=JSON.parse(fs.readFileSync(new URL('../public/data/atlas.json',import.meta.url)));
const digest=createHash('sha256').update('TRACKER_TEST_FIXTURE_ONLY').digest('hex');
const checks=Object.fromEntries([
  'primaryPublisherVerified','sourceBodyRead','exactDateVerified',
  'companyParticipationVerified','latestCorrectionsChecked',
  'notAnOldYear','notASubsidiaryDuplicate',
].map(name=>[name,true]));
function evidence(code,date='2026-10-07') {
  return {code,eventId:`REVIEW:TRACKER-TEST-${code}`,eventDate:date,targetDate:date,
    publisherRole:'issuer',sourceUrl:`https://example.org/test-only/${code}`,
    observedAt:new Date(now).toISOString(),researcher:'test-researcher',reviewer:'test-reviewer',
    checks,evidenceLocation:'TEST FIXTURE ONLY',dateBasis:'TEST FIXTURE ONLY',
    evidenceDigest:digest,reviewedDigest:digest,trustProbability:null,priceImpact:'ABSTAIN'};
}
function result(code,date) {
  return {code,outcome:'VERIFIED',reason:'TEST FIXTURE ONLY',evidence:evidence(code,date)};
}
function completedFixture(date='2026-10-07') {
  let state=initialState(now);
  for(const code of TARGETS)state=applyResult(state,result(code,date),now);
  const assets=stored.original.assets.map(({code})=>({code}));
  const bundle={original:stored.original,
    input:{origin:'2026-09-17',end:'2026-10-30',assets:structuredClone(assets),calendar:stored.input.calendar},
    candidate:{id:'TEST_ONLY',origin:'2026-09-23',end:'2026-10-30',assets:structuredClone(assets),
      eventGate:{accepted:TARGETS.map(code=>{
        const e=state.rows[code].evidence;
        return {id:e.eventId,eventDate:e.eventDate,targetDate:e.targetDate,status:'scheduled',
          scope:{type:'company',codes:[code]},sources:[{url:e.sourceUrl}]};
      })}}};
  bundle.input.events=structuredClone(bundle.candidate.eventGate.accepted);
  return {state,bundle};
}

test('research tracker rejects forged row completion and changes outside the journal',()=>{
  const empty=initialState(now),forged=structuredClone(empty);
  for(const code of TARGETS)Object.assign(forged.rows[code],{
    state:'VERIFIED',evidence:evidence(code),nextCheckAt:null,
  });
  assert.throws(()=>plan(forged,now),/Research rows differ/);
  const valid=applyResult(empty,result(TARGETS[0]),now);
  assert.equal(validateState(valid),valid);
  for(const mutate of [
    s=>s.rows[TARGETS[0]].attempts[0].reason='unrecorded change',
    s=>s.rows[TARGETS[0]].evidence.sourceUrl='https://example.org/changed',
    s=>s.rows[TARGETS[1]].nextCheckAt=null,
    s=>s.journal[0].revision=99,
  ]) {
    const changed=structuredClone(valid);mutate(changed);
    assert.throws(()=>validateState(changed));
  }
});

test('revoked evidence stays in history and blocked work remains due for a later attempt',()=>{
  const code=TARGETS[0];
  let state=applyResult(initialState(now),result(code),now);
  const earlier=structuredClone(state.rows[code].evidence);
  state=applyResult(state,{code,outcome:'BLOCKED',reason:'Primary source correction needs review',
    checkedUrls:[earlier.sourceUrl],nextAction:'Read corrected issuer attachment'},now+1000);
  assert.equal(state.rows[code].evidence,null);
  assert.deepEqual(state.rows[code].reviewHistory,[earlier]);
  assert.equal(plan(state,now+1000).unresolved.length,13);
  assert.ok(!plan(state,now+1000).batches.flat().some(r=>r.code===code));
  assert.ok(plan(state,Date.parse(state.rows[code].nextCheckAt)).batches.flat().some(r=>r.code===code));
  assert.throws(()=>applyResult(state,{...result(code),at:'2026-01-01T00:00:00Z'},now+2000),/timestamp/);
});

test('a calendar date is not accepted as a Korean trading session merely because the date exists',()=>{
  const {state,bundle}=completedFixture('2026-10-05');
  assert.equal(plan(state,now).researchComplete,true);
  assert.ok(!bundle.input.calendar.sessions.includes('2026-10-05'));
  const check=completionGate(state,bundle,now);
  assert.equal(check.researchIntegrated,false);
  assert.equal(check.errors.filter(e=>e.endsWith(':NOT_A_KOREAN_TRADING_SESSION')).length,13);
});

test('completion requires the original unique 52 companies and fixed input window, allowing a later forecast origin',()=>{
  const {state,bundle}=completedFixture();
  assert.equal(completionGate(state,bundle,now).researchIntegrated,true);
  assert.equal(bundle.candidate.origin,'2026-09-23');
  for(const mutate of [
    b=>b.candidate.assets=Array.from({length:52},()=>b.candidate.assets[0]),
    b=>b.input.assets[0].code='999999',
    b=>b.input.origin='2026-01-01',
    b=>b.input.end='2026-11-30',
    b=>b.candidate.end='2026-11-30',
  ]) {
    const changed=structuredClone(bundle);mutate(changed);
    assert.equal(completionGate(state,changed,now).researchIntegrated,false);
  }
});

test('reviewed events must match the installed company, source and dates',()=>{
  const {state,bundle}=completedFixture();
  for(const mutate of [
    e=>e.scope.codes=[TARGETS[1]],
    e=>e.scope.type='market',
    e=>e.sources[0].url='https://example.org/unreviewed',
    e=>e.eventDate='2026-10-08',
    e=>e.targetDate='2026-10-08',
  ]) {
    const changed=structuredClone(bundle);mutate(changed.candidate.eventGate.accepted[0]);
    assert.ok(completionGate(state,changed,now).errors.includes(`${TARGETS[0]}:NOT_INSTALLED_AS_REVIEWED`));
  }
});

test('elapsed verified schedules require a retained accepted version and unchanged latest input',()=>{
  const {state,bundle}=completedFixture('2026-09-29');
  bundle.priorVersions=[structuredClone(bundle.candidate)];
  bundle.candidate.origin='2026-09-30';
  bundle.candidate.eventGate.accepted=[];
  assert.equal(completionGate(state,bundle,now).researchIntegrated,true);
  const withoutHistory=structuredClone(bundle);withoutHistory.priorVersions=[];
  assert.equal(completionGate(state,withoutHistory,now).researchIntegrated,false);
  for(const mutate of [
    e=>e.sources[0].url='https://example.org/corrected-unreviewed',
    e=>e.eventDate='2026-10-01',
    e=>e.status='withdrawn',
  ]) {
    const changed=structuredClone(bundle);mutate(changed.input.events[0]);
    assert.ok(completionGate(state,changed,now).errors.includes(`${TARGETS[0]}:NOT_INSTALLED_AS_REVIEWED`));
  }
  // An archived version cannot excuse missing a future event in the active gate.
  const future=structuredClone(bundle);future.candidate.origin='2026-09-23';
  assert.equal(completionGate(state,future,now).researchIntegrated,false);
});

test('twelve verified schedules cannot pass the final release gate or be reported as complete',()=>{
  let state=initialState(now);
  for(const code of TARGETS.slice(0,12))state=applyResult(state,result(code),now);
  const gate=finalize(state,null,null,null,now);
  assert.equal(gate.taskComplete,false);
  assert.equal(gate.finalReleaseAllowed,false);
  assert.deepEqual(gate.unresolved,[TARGETS[12]]);
  assert.throws(()=>plan(state,now,0),/worker count/);
});
