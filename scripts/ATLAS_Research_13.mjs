#!/usr/bin/env node
// Node 24+, no dependencies. Durable research queue and completion gate.
// This file does not search the web or launch agents by itself.
// Source truth must be checked by researchers; flags are review attestations.
// A blocked source remains unresolved. A completed search is not a found date.
// CLI:
// node ATLAS_Research_13.mjs init state.json
// node ATLAS_Research_13.mjs plan state.json
// node ATLAS_Research_13.mjs record state.json result.json EXPECTED_REVISION
// node ATLAS_Research_13.mjs check state.json public/data/atlas.json
// node ATLAS_Research_13.mjs finalize state.json atlas.json validation.json ATLAS_Netlify.zip
// node ATLAS_Research_13.mjs self-test
import fs from 'node:fs';
import path from 'node:path';
import {inflateRawSync} from 'node:zlib';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {fileURLToPath} from 'node:url';

export const TARGETS = Object.freeze([
  '028260', '034730', '005490', '010130', '138040', '033780', '047050',
  '029780', '002380', '111770', '226950', '010170', '030000',
]);
export const WINDOW = Object.freeze({start:'2026-09-17', end:'2026-10-30'});
const END_EXCLUSIVE = Date.parse('2026-10-31T00:00:00+09:00');
const ORIGINAL_SHA256 = '1af446f745c88cfb308de348f238f2fa8d31265b5322e2f035f5aafb6d5833ca';
const CHECKS = Object.freeze([
  'primaryPublisherVerified', 'sourceBodyRead', 'exactDateVerified',
  'companyParticipationVerified', 'latestCorrectionsChecked',
  'notAnOldYear', 'notASubsidiaryDuplicate',
]);
const hash = value => createHash('sha256').update(typeof value==='string'?value:JSON.stringify(value)).digest('hex');
const read = file => JSON.parse(fs.readFileSync(file,'utf8'));
const iso = time => new Date(time).toISOString();
const validDate = value => typeof value==='string' && /^\d{4}-\d{2}-\d{2}$/.test(value)
  && Number.isFinite(Date.parse(value)) && iso(value).slice(0,10)===value;

export function initialState(now=Date.now()) {
  return {schema:1, revision:0, window:{...WINDOW}, targets:[...TARGETS],
    createdAt:iso(now), rows:Object.fromEntries(TARGETS.map(code=>[code,{
      code, state:'UNRESOLVED', attempts:[], evidence:null, reviewHistory:[], nextCheckAt:iso(now),
    }])), journal:[]};
}

export function validateState(s) {
  assert.equal(s.schema,1); assert.deepEqual(s.window,WINDOW);
  assert.deepEqual(s.targets,TARGETS); assert.deepEqual(Object.keys(s.rows).sort(),[...TARGETS].sort());
  assert.ok(Number.isInteger(s.revision)&&s.revision>=0,'Invalid revision');
  assert.ok(Number.isFinite(Date.parse(s.createdAt)),'Invalid creation time');
  assert.ok(Array.isArray(s.journal),'Journal required');
  assert.equal(s.revision,s.journal.length);
  // The journal is an integrity check, not a claim that a publisher is truthful.
  // Replay the recorded attempts: a valid journal alone cannot certify edited rows.
  const replay=initialState(Date.parse(s.createdAt));
  let previous=null,index=0;
  for(const entry of s.journal) {
    const {digest,...body}=entry;
    assert.equal(body.revision,++index,'Journal revision changed');
    assert.ok(TARGETS.includes(body.code),'Unknown journal company');
    assert.ok(Number.isFinite(Date.parse(body.at)),'Invalid journal time');
    assert.equal(body.previous,previous,'Journal chain changed');
    assert.equal(digest,hash(body),'Journal entry changed'); previous=digest;
    const recorded=s.rows[body.code]?.attempts?.[replay.rows[body.code].attempts.length];
    assert.ok(recorded,'Journal attempt missing');
    const {at,...result}=recorded;
    assert.equal(at,body.at,'Attempt time changed');
    assert.equal(result.code,body.code,'Attempt company changed');
    assert.equal(result.outcome,body.outcome,'Attempt outcome changed');
    assert.equal(hash(result),body.resultDigest,'Attempt payload changed');
    updateRow(replay,result,Date.parse(at));
  }
  assert.deepEqual(s.rows,replay.rows,'Research rows differ from recorded attempts');
  return s;
}

export function evidenceErrors(e,code,now=Date.now()) {
  const errors=[];
  if(!e || e.code!==code) return ['WRONG_OR_MISSING_COMPANY'];
  if(typeof e.eventId!=='string'||!e.eventId.startsWith('REVIEW:'))errors.push('MISSING_EVENT_ID');
  if(!validDate(e.eventDate)||e.eventDate<WINDOW.start||e.eventDate>WINDOW.end)errors.push('EVENT_OUTSIDE_FIXED_WINDOW');
  if(!validDate(e.targetDate)||e.targetDate<WINDOW.start||e.targetDate>WINDOW.end)errors.push('INVALID_KOREAN_TRADING_DATE');
  if(!['issuer','regulator','organizer'].includes(e.publisherRole))errors.push('NOT_PRIMARY_EVIDENCE');
  try { const u=new URL(e.sourceUrl);if(u.protocol!=='https:'||u.username||u.password)throw Error(); }
  catch { errors.push('INVALID_SOURCE_URL'); }
  if(!Number.isFinite(Date.parse(e.observedAt))||Date.parse(e.observedAt)>now)errors.push('INVALID_OBSERVATION_TIME');
  if(!e.researcher||!e.reviewer||e.researcher===e.reviewer)errors.push('INDEPENDENT_REVIEW_REQUIRED');
  for(const check of CHECKS)if(e.checks?.[check]!==true)errors.push(check.toUpperCase());
  if(typeof e.evidenceLocation!=='string'||!e.evidenceLocation.trim())errors.push('MISSING_SOURCE_LOCATION');
  if(typeof e.dateBasis!=='string'||!e.dateBasis.trim())errors.push('MISSING_DATE_BASIS');
  if(!/^[a-f0-9]{64}$/.test(e.evidenceDigest??''))errors.push('MISSING_EVIDENCE_DIGEST');
  if(e.reviewedDigest!==e.evidenceDigest)errors.push('REVIEW_DOES_NOT_MATCH_EVIDENCE');
  if(e.trustProbability!==null||e.priceImpact!=='ABSTAIN')errors.push('UNSUPPORTED_PRICE_CLAIM');
  return errors;
}

export function plan(s,now=Date.now(),workers=5) {
  validateState(s);
  assert.ok(Number.isInteger(workers)&&workers>=1&&workers<=TARGETS.length,'Invalid worker count');
  const unresolved=TARGETS.filter(code=>s.rows[code].state!=='VERIFIED');
  const expired=now>=END_EXCLUSIVE;
  const due=expired?[]:unresolved.filter(code=>Date.parse(s.rows[code].nextCheckAt)<=now)
    .sort((a,b)=>s.rows[a].attempts.length-s.rows[b].attempts.length||a.localeCompare(b));
  const batches=Array.from({length:workers},()=>[]);
  due.forEach((code,i)=>batches[i%workers].push({code,
    previousAttempts:s.rows[code].attempts,
    requirements:[...CHECKS],
    instructions:'Check a new official route or changed source. Do not repeat a blocked URL blindly.'}));
  return {status:expired&&unresolved.length?'EXPIRED_UNRESOLVED':unresolved.length?'PENDING':'READY_FOR_INTEGRATION',
    researchComplete:unresolved.length===0, taskComplete:false, verified:13-unresolved.length,
    required:13, unresolved, batches:batches.filter(b=>b.length),
    nextCheckAt:unresolved.length&&!expired?unresolved.map(c=>s.rows[c].nextCheckAt).sort()[0]:null};
}

function updateRow(s,result,now) {
  assert.ok(TARGETS.includes(result.code),'Unknown company');
  assert.ok(!Object.hasOwn(result,'at'),'Attempt timestamp is managed by the tracker');
  assert.ok(Number.isFinite(now),'Invalid attempt time');
  assert.ok(now>=Date.parse(s.createdAt),'Attempt predates tracker creation');
  assert.ok(now<END_EXCLUSIVE,'Fixed research window expired; do not extend it');
  assert.ok(['VERIFIED','BLOCKED','NOT_PUBLISHED','REJECTED'].includes(result.outcome));
  assert.ok(typeof result.reason==='string'&&result.reason.trim(),'Reason required');
  const r=s.rows[result.code];
  if(result.outcome==='VERIFIED') {
    const errors=evidenceErrors(result.evidence,result.code,now);
    assert.deepEqual(errors,[],'Evidence failed validation');
    for(const [otherCode,other]of Object.entries(s.rows))if(otherCode!==result.code)
      assert.notEqual(other.evidence?.eventId,result.evidence.eventId,'Duplicate cross-company event');
    if(r.evidence)r.reviewHistory.push(structuredClone(r.evidence));
    r.evidence=structuredClone(result.evidence);r.state='VERIFIED';r.nextCheckAt=null;
  } else {
    assert.ok(Array.isArray(result.checkedUrls)&&result.checkedUrls.length,'Attempted sources required');
    assert.ok(typeof result.nextAction==='string'&&result.nextAction.trim(),'Next action required');
    if(r.evidence)r.reviewHistory.push(structuredClone(r.evidence));
    r.evidence=null;r.state=result.outcome;
    // Persistent scheduling, not an endless busy loop. The host resumes due work.
    const hours=Math.min(24,2**Math.min(r.attempts.length+1,5));
    r.nextCheckAt=iso(now+hours*3600000);
  }
  r.attempts.push({at:iso(now),...structuredClone(result)});
}

export function applyResult(s,result,now=Date.now()) {
  validateState(s);
  const next=structuredClone(s);
  updateRow(next,result,now);
  const entry={revision:s.revision+1,at:iso(now),code:result.code,outcome:result.outcome,
    resultDigest:hash(result),previous:s.journal.at(-1)?.digest??null};
  next.journal.push({...entry,digest:hash(entry)});next.revision++;
  return validateState(next);
}

export function completionGate(s,bundle,now=Date.now()) {
  const status=plan(s,now),errors=[];
  const sessions=bundle?.input?.calendar?.sessions;
  for(const code of TARGETS) {
    const row=s.rows[code];
    if(row.state!=='VERIFIED'){errors.push(`${code}:UNRESOLVED`);continue;}
    errors.push(...evidenceErrors(row.evidence,code,now).map(e=>`${code}:${e}`));
    if(!Array.isArray(sessions)||!sessions.includes(row.evidence.targetDate))
      errors.push(`${code}:NOT_A_KOREAN_TRADING_SESSION`);
    const matchesReviewed=e=>e?.scope?.type==='company'&&e.scope.codes?.length===1
      &&e.scope.codes[0]===code&&e.eventDate===row.evidence.eventDate
      &&e.targetDate===row.evidence.targetDate&&e.status==='scheduled'
      &&e.sources?.some(v=>v.url===row.evidence.sourceUrl);
    // A later forecast drops elapsed events from its future-event gate. Retained
    // accepted versions preserve proof of installation; the latest input must
    // still match so an old version cannot conceal a correction or withdrawal.
    const inputMatches=bundle?.input?.events?.filter(e=>e.id===row.evidence.eventId)??[];
    const past=row.evidence.targetDate<=bundle?.candidate?.origin;
    const versions=past?(bundle?.priorVersions??[]):[bundle?.candidate];
    const wasAccepted=versions.some(version=>{
      const matches=version?.eventGate?.accepted?.filter(e=>e.id===row.evidence.eventId)??[];
      return version?.origin<row.evidence.targetDate&&matches.length===1&&matchesReviewed(matches[0]);
    });
    if(inputMatches.length!==1||!matchesReviewed(inputMatches[0])||!wasAccepted)
      errors.push(`${code}:NOT_INSTALLED_AS_REVIEWED`);
  }
  if(!bundle||hash(bundle.original)!==ORIGINAL_SHA256)errors.push('ORIGINAL_NOT_PRESERVED');
  const originalCodes=bundle?.original?.assets?.map(a=>a.code).sort();
  for(const assets of [bundle?.input?.assets,bundle?.candidate?.assets]) {
    const codes=assets?.map(a=>a.code).sort();
    if(!codes||codes.length!==52||new Set(codes).size!==52||hash(codes)!==hash(originalCodes??[]))
      errors.push('WRONG_UNIVERSE');
  }
  if(bundle?.input?.origin!==WINDOW.start||bundle?.input?.end!==WINDOW.end
    ||bundle?.candidate?.end!==WINDOW.end)errors.push('WINDOW_CHANGED');
  return {...status,status:errors.length?status.status:'RESEARCH_INTEGRATED',
    taskComplete:false, researchIntegrated:errors.length===0,
    finalReleaseAllowed:false,
    nextGate:errors.length?'RESOLVE_EVIDENCE_AND_INTEGRATION':'RUN_EXISTING_TEST_BUILD_AND_ZIP_VALIDATION',errors};
}

const crcTable=Array.from({length:256},(_,i)=>{
  let value=i;for(let bit=0;bit<8;bit++)value=value&1?0xedb88320^(value>>>1):value>>>1;
  return value>>>0;
});
function crc32(bytes){let crc=0xffffffff;for(const byte of bytes)crc=crcTable[(crc^byte)&255]^(crc>>>8);return (crc^0xffffffff)>>>0;}
export function inspectZip(bytes,wanted) {
  let end=bytes.length-22;
  for(;end>=Math.max(0,bytes.length-65557);end--)if(bytes.readUInt32LE(end)===0x06054b50&&end+22+bytes.readUInt16LE(end+20)===bytes.length)break;
  assert.ok(end>=0,'ZIP end record missing');
  assert.equal(bytes.readUInt16LE(end+4),0,'Multi-disk ZIP not supported');
  const count=bytes.readUInt16LE(end+10),directorySize=bytes.readUInt32LE(end+12);
  let offset=bytes.readUInt32LE(end+16),totalSize=0;const directoryStart=offset,selected=new Map(),seen=new Set();
  assert.ok(offset+directorySize<=end,'Invalid ZIP directory');
  for(let i=0;i<count;i++) {
    assert.equal(bytes.readUInt32LE(offset),0x02014b50,'Invalid central entry');
    const method=bytes.readUInt16LE(offset+10),crc=bytes.readUInt32LE(offset+16),packed=bytes.readUInt32LE(offset+20),size=bytes.readUInt32LE(offset+24),
      nameSize=bytes.readUInt16LE(offset+28),extra=bytes.readUInt16LE(offset+30),comment=bytes.readUInt16LE(offset+32),local=bytes.readUInt32LE(offset+42),
      name=bytes.subarray(offset+46,offset+46+nameSize).toString('utf8');
    assert.ok(!seen.has(name),'Duplicate ZIP entry');seen.add(name);
    assert.ok(!(bytes.readUInt16LE(offset+8)&1),'Encrypted ZIP rejected');
    assert.ok(size<=512*1024*1024&&(totalSize+=size)<=2*1024*1024*1024,'ZIP size limit');
    assert.equal(bytes.readUInt32LE(local),0x04034b50,'Invalid local entry');
    assert.equal(bytes.readUInt16LE(local+8),method,'ZIP method mismatch');
    const start=local+30+bytes.readUInt16LE(local+26)+bytes.readUInt16LE(local+28);
    assert.ok(start+packed<=directoryStart,'ZIP entry crosses directory');
    const payload=bytes.subarray(start,start+packed);
    assert.ok(method===0||method===8,'Unsupported ZIP compression');
    const body=method===0?payload:inflateRawSync(payload,{maxOutputLength:512*1024*1024});
    assert.equal(body.length,size,'ZIP length mismatch');assert.equal(crc32(body),crc,'ZIP CRC failure');
    if(wanted.includes(name))selected.set(name,body);
    offset+=46+nameSize+extra+comment;
  }
  assert.equal(offset,directoryStart+directorySize,'ZIP directory size mismatch');
  for(const name of wanted)assert.ok(selected.has(name),'ZIP file missing: '+name);
  return selected;
}

export function finalize(s,bundle,validation,zip,now=Date.now()) {
  const gate=completionGate(s,bundle,now);
  if(!gate.researchIntegrated)return gate;
  assert.equal(validation.tests.failed,0,'Tests failed');
  assert.ok(validation.tests.passed>=49,'Required test suite missing');
  assert.equal(validation.originalSHA256,ORIGINAL_SHA256);
  assert.equal(validation.latestId,bundle.candidate.id,'Validation is for another forecast');
  assert.equal(validation.inputSHA256,hash(bundle.input),'Validation input changed');
  const outer=inspectZip(zip,['data/atlas.json','downloads/ATLAS_Program_Source.zip']);
  assert.equal(hash(JSON.parse(outer.get('data/atlas.json'))),hash(bundle),'ZIP bundle is stale');
  const inner=inspectZip(outer.get('downloads/ATLAS_Program_Source.zip'),['public/data/atlas.json','reports/tests.tap','reports/validation.json']);
  assert.equal(hash(JSON.parse(inner.get('public/data/atlas.json'))),hash(bundle),'Source bundle differs');
  assert.equal(hash(JSON.parse(inner.get('reports/validation.json'))),hash(validation),'Packaged validation differs');
  const tap=inner.get('reports/tests.tap').toString('utf8');
  assert.equal(Number(tap.match(/^# pass (\d+)$/m)?.[1]),validation.tests.passed);
  assert.equal(Number(tap.match(/^# fail (\d+)$/m)?.[1]),0);
  assert.equal(Number(tap.match(/^# skipped (\d+)$/m)?.[1]),0);
  assert.equal(Number(tap.match(/^# cancelled (\d+)$/m)?.[1]),0);
  return {...gate,status:'COMPLETE',taskComplete:true,finalReleaseAllowed:true,nextGate:null,
    completedAt:iso(now),zipSHA256:createHash('sha256').update(zip).digest('hex'),errors:[]};
}

function saveResult(file,result,expectedRevision) {
  const lock=file+'.lock';const fd=fs.openSync(lock,'wx');
  try {
    const before=read(file);assert.equal(before.revision,expectedRevision,'Revision conflict; reload and merge');
    const after=applyResult(before,result);const temporary=file+'.tmp';
    fs.writeFileSync(temporary,JSON.stringify(after,null,2));fs.renameSync(temporary,file);
    return plan(after);
  } finally {fs.closeSync(fd);fs.unlinkSync(lock);}
}

function selfTest() {
  const now=Date.parse('2026-09-26T12:00:00Z');let s=initialState(now),tests=0;
  assert.equal(plan(s,now).unresolved.length,13);assert.equal(plan(s,now).taskComplete,false);tests++;
  assert.deepEqual(plan(s,now).batches.flat().map(v=>v.code).sort(),[...TARGETS].sort());tests++;
  s=applyResult(s,{code:TARGETS[0],outcome:'BLOCKED',reason:'HTTP 502',checkedUrls:['https://dart.fss.or.kr/'],nextAction:'Check issuer IR attachment'},now);
  assert.equal(plan(s,now).unresolved.length,13);assert.equal(plan(s,now).batches.flat().length,12);tests++;
  const evidence=code=>({code,eventId:`REVIEW:TEST-${code}`,eventDate:'2026-10-07',targetDate:'2026-10-07',
    publisherRole:'issuer',sourceUrl:'https://example.org/test-only',observedAt:iso(now),researcher:'test-a',reviewer:'test-b',
    checks:Object.fromEntries(CHECKS.map(k=>[k,true])),evidenceLocation:'test fixture only',dateBasis:'test fixture only',
    evidenceDigest:hash('TEST_ONLY'),reviewedDigest:hash('TEST_ONLY'),trustProbability:null,priceImpact:'ABSTAIN'});
  const wrong=evidence(TARGETS[0]);wrong.eventDate='2025-10-07';assert.ok(evidenceErrors(wrong,TARGETS[0],now).length);tests++;
  wrong.eventDate='2026-10-07';wrong.reviewer='test-a';assert.ok(evidenceErrors(wrong,TARGETS[0],now).length);tests++;
  for(const code of TARGETS.slice(0,12))s=applyResult(s,{code,outcome:'VERIFIED',reason:'TEST ONLY',evidence:evidence(code)},now);
  assert.equal(plan(s,now).researchComplete,false);assert.equal(plan(s,now).unresolved.length,1);tests++;
  s=applyResult(s,{code:TARGETS[12],outcome:'VERIFIED',reason:'TEST ONLY',evidence:evidence(TARGETS[12])},now);
  assert.equal(plan(s,now).researchComplete,true);assert.equal(completionGate(s,null,now).researchIntegrated,false);tests++;
  const altered=structuredClone(s);altered.journal[0].outcome='VERIFIED';assert.throws(()=>validateState(altered));tests++;
  assert.equal(plan(initialState(now),END_EXCLUSIVE).status,'EXPIRED_UNRESOLVED');tests++;
  assert.throws(()=>inspectZip(Buffer.from('BROKEN ZIP'),[]));tests++;
  assert.equal(finalize(initialState(now),null,null,null,now).taskComplete,false);tests++;
  // Test fixtures never enter the operational state or production news.
  return {testsPassed:tests,testsFailed:0,fixtures:'IN_MEMORY_ONLY'};
}

function main(args) {
  const [command,file,third,fourth]=args;
  if(command==='self-test')return selfTest();
  if(command==='init'){fs.writeFileSync(file,JSON.stringify(initialState(),null,2),{flag:'wx'});return plan(read(file));}
  if(command==='plan')return plan(read(file));
  if(command==='record')return saveResult(file,read(third),Number(fourth));
  if(command==='check') {
    const result=completionGate(read(file),read(third));
    process.exitCode=result.researchIntegrated?0:2;return result;
  }
  if(command==='finalize') {
    const result=finalize(read(file),read(third),read(fourth),fs.readFileSync(args[4]));
    process.exitCode=result.taskComplete?0:2;return result;
  }
  throw Error('Commands: init | plan | record | check | finalize | self-test');
}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url)) {
  try {console.log(JSON.stringify(main(process.argv.slice(2)),null,2));}
  catch(error){console.error(JSON.stringify({status:'ERROR',taskComplete:false,error:error.message}));process.exitCode=1;}
}
