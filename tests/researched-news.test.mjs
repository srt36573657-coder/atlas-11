import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {forecast,gateEvents} from '../lib/news-engine.mjs';
import {mergeResearchRelease,researchCoverage} from '../lib/researched-news.mjs';
import {appliesTo} from '../lib/news-scope.mjs';
const b=JSON.parse(fs.readFileSync(new URL('../public/data/atlas.json',import.meta.url))),input=b.input;
test('52 research records route all real reviewed news only to the eligible businesses',()=>{
 const rows=researchCoverage(input,b.candidate);assert.equal(rows.length,52);assert.equal(new Set(rows.map(r=>r.code)).size,52);
 for(const a of b.candidate.assets)assert.deepEqual(a.news.map(n=>n.id).sort(),b.candidate.eventGate.accepted.filter(e=>appliesTo(e,a)).map(e=>e.id).sort());
 const ke=b.candidate.assets.find(a=>a.code==='003490'),p=ke.news.find(n=>n.id==='REVIEW:KE-FUEL-20261001');assert.ok(p.sampleCount>=5);assert.equal(p.used,true);
 assert.equal(b.candidate.assets.filter(a=>a.news.some(n=>n.id===p.id)).length,1);
 assert.equal(b.candidate.assets.filter(a=>a.news.some(n=>n.id==='REVIEW:KOS-2026')).length,1);
 assert.equal(b.candidate.assets.find(a=>a.code==='352820').news.filter(n=>n.id.startsWith('REVIEW:HYBE-')).length,4);
 assert.ok(gateEvents(input,b.candidate.origin,'2026-09-23T23:59:59Z').accepted.every(e=>!e.id.startsWith('REVIEW:')));
});
test('cumulative release migration includes older tagged events and preserves local edits without duplicates',()=>{
 const old=structuredClone(input);delete old.newsResearch;old.events=old.events.filter(e=>!e.id.startsWith('REVIEW:'));
 const release=structuredClone(input);release.events.filter(e=>e.id.startsWith('REVIEW:')).slice(0,23).forEach(e=>e.reviewReleaseId='older-release');
 const full=mergeResearchRelease(old,release);assert.equal(full.events.filter(e=>e.id.startsWith('REVIEW:')).length,release.newsResearch.eventIds.length);assert.equal(mergeResearchRelease(full,release),full);
 const edited=structuredClone(old),record=structuredClone(release.events.find(e=>e.id==='REVIEW:KOS-2026'));record.name='사용자 수정';edited.events.push(record);
 const merged=mergeResearchRelease(edited,release);assert.equal(merged.events.find(e=>e.id===record.id).name,'사용자 수정');assert.deepEqual(merged.newsResearch.localConflicts,[record.id]);
});
test('removing actual airline news changes Korean Air only; all other 51 price distributions are preserved',()=>{
 const opts={origin:b.candidate.origin,paths:2000,seed:20260917,informationCutoff:input.informationAsOf,createdAt:'2026-09-25T00:00:00Z'};
 const other=structuredClone(input);other.events=other.events.filter(e=>!e.id.startsWith('REVIEW:KE-FUEL-'));
 const full=forecast(input,opts),none=forecast(other,opts);
 for(const a of full.assets){const c=none.assets.find(v=>v.code===a.code);if(a.code==='003490')assert.notDeepEqual(a.rows,c.rows);else assert.deepEqual(a.rows,c.rows);}
});
test('official corporate IR schedules stay company-specific and unverified candidates cannot inflate the counts',()=>{
 const codes=['034020','005930','012450','207940'];
 for(const code of codes){
  const id='REVIEW:KPW-IR-'+code+'-20260929';
  const event=input.events.find(e=>e.id===id);assert.ok(event);
  assert.deepEqual(event.scope,{type:'company',codes:[code]});
  const recipients=b.candidate.assets.filter(a=>a.news.some(n=>n.id===id));
  assert.deepEqual(recipients.map(a=>a.code),[code]);
  assert.equal(recipients[0].news.find(n=>n.id===id).used,false);
 }
 assert.equal(input.newsResearch.followup25.complete,false);
 assert.deepEqual([...input.newsResearch.followup25.unresolvedCodes].sort(),['034730','005490','010130','138040','047050','029780','030000'].sort());
 for(const code of ['030000'])assert.equal(researchCoverage(input,b.candidate).find(r=>r.code===code).byScope.company,0);
});
test('new filing deadlines and business seminar are isolated and do not invent price effects',()=>{
 for(const [code,kind,date]of [['012330','COMPANY_REDISCLOSURE','20261023'],['000720','COMPANY_IR','20260930'],['086280','COMPANY_IR','20260930'],['032830','COMPANY_REDISCLOSURE','20261002'],['000810','COMPANY_REDISCLOSURE','20261002'],['012750','COMPANY_BUSINESS_SEMINAR','20261012']]){
  const id=`REVIEW:${kind}-${code}-${date}`,e=input.events.find(e=>e.id===id);assert.ok(e);
  const recipients=b.candidate.assets.filter(a=>a.news.some(n=>n.id===id));
  assert.deepEqual(recipients.map(a=>a.code),[code]);
  assert.equal(recipients[0].news.find(n=>n.id===id).used,false);
  const before=new Date(Date.parse(e.availableAt)-1).toISOString();
  assert.equal(gateEvents(input,b.candidate.origin,before).accepted.some(v=>v.id===id),false);
  assert.ok(input.newsResearch.followup25.fullyConfirmedCompanyScheduleCodes.includes(code));
 }
 const f=input.newsResearch.followup25;
 assert.equal(f.requestedCodes.length,f.fullyConfirmedCompanyScheduleCodes.length+f.unresolvedCodes.length);
 assert.equal(f.unresolvedCodes.some(code=>f.fullyConfirmedCompanyScheduleCodes.includes(code)),false);
});
test('parallel review preserves all 18 outcomes, company boundaries and after-close calendar dates',()=>{
 const review=[...(input.newsResearch.batchReviewHistory??[]),input.newsResearch.batchReview].find(v=>v?.searchedCount===18&&v?.addedEventIds?.length===8);
 assert.equal(review.searchedCount,18);assert.equal(review.agentCount,5);
 assert.equal(new Set(review.requestedCodes).size,18);
 assert.equal(review.allRequestedReviewed,true);assert.equal(review.allSchedulesConfirmed,false);
 assert.equal(review.newlyConfirmedCodes.length,5);assert.equal(review.unresolvedCodes.length,13);
 assert.equal(review.addedEventIds.length,8);
 const expectedDates=new Map([
  ['REVIEW:COMPANY_PRODUCT_PRESENTATION-005380-20261012','2026-10-13'],
  ['REVIEW:COMPANY_EXHIBITION_FAKUMA-051910-20261012','2026-10-13'],
  ['REVIEW:COMPANY_EXHIBITION_TOKYOPACK-051910-20261014','2026-10-14'],
  ['REVIEW:COMPANY_EXHIBITION_APLAR-051910-20261029','2026-10-30']
 ]);
 for(const id of review.addedEventIds){
  const e=input.events.find(e=>e.id===id);assert.ok(e);assert.equal(e.scope.type,'company');assert.equal(e.scope.codes.length,1);
  const recipients=b.candidate.assets.filter(a=>a.news.some(n=>n.id===id));
  assert.deepEqual(recipients.map(a=>a.code),e.scope.codes);
  assert.equal(recipients[0].news.find(n=>n.id===id).used,false);
  assert.ok(Date.parse(e.availableAt)>=Date.parse('2026-09-26T00:00:00Z'));
  if(expectedDates.has(id))assert.equal(e.targetDate,expectedDates.get(id));
 }
 const kb=input.events.find(e=>e.id==='REVIEW:COMPANY_GOVERNANCE_RECOMMENDATION-105560-20261002');
 assert.match(kb.channel,/자격 검증/);assert.match(kb.channel,/취임 확정일.*아니/);
 const previous=b.priorVersions.find(v=>v.id==='2026-09-23-c68c580b');assert.ok(previous);
 // Compare this historical batch to its own retained output, before later
 // releases add new company events that can trigger same-day abstention.
 const historicalResult=b.priorVersions.find(v=>v.id==='2026-09-23-23af9ae0');assert.ok(historicalResult);
 for(const a of historicalResult.assets.filter(a=>!review.newlyConfirmedCodes.includes(a.code)))assert.deepEqual(a.rows,previous.assets.find(v=>v.code===a.code).rows);
});
test('tracked 13-stock research installs six verified schedules without fabricating price changes',()=>{
 const v6Result=b.priorVersions.find(v=>v.id==='2026-09-23-ff421f25');assert.ok(v6Result); // Frozen historical release, before the user-authorized v7 policy change.
 const review=input.newsResearch.batchReview;
 const expected=['028260','033780','002380','111770','226950','010170'].sort();
 assert.equal(review.searchedCount,13);assert.equal(review.agentCount,4);
 assert.deepEqual([...review.newlyConfirmedCodes].sort(),expected);
 assert.equal(review.addedEventIds.length,6);assert.equal(review.unresolvedCodes.length,7);
 assert.equal(review.allSchedulesConfirmed,false);
 const earlier=b.priorVersions.find(v=>v.id==='2026-09-23-23af9ae0');assert.ok(earlier);
 for(const id of review.addedEventIds){
  const e=input.events.find(v=>v.id===id);assert.ok(e);
  assert.equal(e.scope.type,'company');assert.equal(e.scope.codes.length,1);
  assert.equal(e.reviewEvidence.trackerEvidence.reviewer,'/root');
  assert.notEqual(e.reviewEvidence.trackerEvidence.researcher,'/root');
  const recipients=b.candidate.assets.filter(a=>a.news.some(n=>n.id===id));
  assert.deepEqual(recipients.map(a=>a.code),e.scope.codes);
  assert.equal(recipients[0].news.find(n=>n.id===id).used,false);
  const cutoff=new Date(Date.parse(e.availableAt)-1).toISOString();
  assert.equal(gateEvents(input,b.candidate.origin,cutoff).accepted.some(v=>v.id===id),false);
 }
 for(const a of v6Result.assets.filter(a=>a.code!=='033780'))assert.deepEqual(a.rows,earlier.assets.find(v=>v.code===a.code).rows);
 // KT&G's contract window maps from the October5 holiday to October6,
 // already occupied by JOBS. The unchanged v6 joint-evidence rule holds BOTH
 // events. Test the exact reason and isolated effect instead of demanding
 // that newly known overlapping events leave an old distribution untouched.
 const ktgNow=v6Result.assets.find(v=>v.code==='033780'),ktgBefore=earlier.assets.find(v=>v.code==='033780');
 const overlap=ktgNow.news.filter(n=>n.date==='2026-10-06');
 assert.deepEqual(overlap.map(n=>n.id).sort(),['BLS:JOBS:September-2026','REVIEW:033780:GRANPEAK-CONTRACT-OPEN:20261005'].sort());
 assert.equal(ktgBefore.news.find(n=>n.id==='BLS:JOBS:September-2026').used,true);
 for(const n of overlap){assert.equal(n.used,false);assert.equal(n.effect,null);assert.match(n.reason,/同一|동일 종목·같은 날 복수 사건/);}
 assert.notDeepEqual(ktgNow.rows,ktgBefore.rows);
 assert.deepEqual(ktgNow.rows.filter(r=>r.date<'2026-10-06'),ktgBefore.rows.filter(r=>r.date<'2026-10-06'));
 assert.deepEqual(ktgNow.rows.find(r=>r.date==='2026-10-06').eventIds,[]);
 for(const row of ktgNow.rows){
  const old=ktgBefore.rows.find(r=>r.date===row.date);
  for(const field of ['noNewsP10','noNewsP50','noNewsP90','noNewsProbUp'])assert.equal(row[field],old[field]);
 }
 const added=review.addedEventIds.map(id=>input.events.find(e=>e.id===id));
 const youngone=added.find(e=>e.scope.codes[0]==='111770');
 assert.equal(youngone.eventDate,'2026-10-13');assert.equal(youngone.targetDate,'2026-10-14');
 const ktg=added.find(e=>e.scope.codes[0]==='033780');
 assert.equal(ktg.eventDate,'2026-10-05');assert.equal(ktg.targetDate,'2026-10-06');
 assert.equal(input.calendar.sessions.includes('2026-10-05'),false);
 const kcc=added.find(e=>e.scope.codes[0]==='002380');
 assert.ok(kcc.reviewEvidence.throughSubsidiary);assert.equal(kcc.reviewEvidence.independentParentIR,false);
 assert.match(kcc.reference,/모회사 직접 IR 아님/);
});


test('reviewed release remains intact in the current model and covers all 52 and keeps phases, observed facts, and missing evidence distinct',()=>{
 assert.equal(b.candidate.modelVersion,'atlas-news-8.0.1');
 assert.equal(input.newsResearch.rebuild52.checkedCount,52);
 assert.equal(new Set(input.newsResearch.rebuild52.checkedCodes).size,52);
 assert.equal(b.candidate.eventGate.accepted.length,55);
 assert.equal(b.candidate.evidenceCoverage.globalUniqueEventClusters,54);
 const ids=input.newsResearch.rebuild52.addedEventIds;
 assert.equal(ids.length,7);
 for(const id of ids){
  const e=input.events.find(x=>x.id===id);assert.ok(e);
  const profiles=b.candidate.assets.flatMap(a=>a.news.filter(n=>n.id===id).map(n=>({a,n})));
  assert.equal(profiles.length,1);assert.equal(profiles[0].a.code,e.scope.codes[0]);
  assert.equal(profiles[0].n.used,false);assert.equal(profiles[0].n.effect,null);
  assert.equal(gateEvents(input,b.candidate.origin,new Date(Date.parse(e.availableAt)-1).toISOString()).accepted.some(x=>x.id===id),false);
 }
 const bio=b.candidate.evidenceCoverage.rows.find(r=>r.code==='207940');
 const rights=bio.assessments.find(a=>a.phases?.length===2);assert.ok(rights);
 assert.equal(rights.classification,'price_evidence_candidate');
 const hlb=input.events.find(e=>e.id==='REVIEW:028300:FDA-APPROVED:20260923');
 assert.equal(hlb.status,'announced');assert.equal(hlb.publishedAt,null);assert.equal(hlb.publicationDate,'2026-09-23');
 assert.equal(hlb.targetDate,'2026-09-28');assert.equal(hlb.marketReactionDateEstimated,true);
 assert.ok(!input.events.some(e=>e.kind==='PRODUCT_LAUNCH_MONTH_ONLY'));
 const ktg=b.candidate.assets.find(a=>a.code==='033780');
 const macro=ktg.news.find(n=>n.id==='BLS:JOBS:September-2026');
 assert.equal(macro.used,true);assert.equal(macro.sameDayEvidence.contextWarnings.length,1);
 assert.equal(ktg.news.find(n=>n.id==='REVIEW:033780:GRANPEAK-CONTRACT-OPEN:20261005').used,false);
 assert.equal(b.candidate.trustProbability,null);
});


test('observed publication dates use their declared timezone and reject impossible dates',()=>{
 const original=input.events.find(e=>e.id==='REVIEW:028300:FDA-APPROVED:20260923');
 const e={...structuredClone(original),id:'TEST:observed-zone',publicationDate:'2026-09-26',timezone:'Asia/Seoul',availableAt:'2026-09-25T15:30:00Z'};
 const data={...input,events:[e]};
 const cutoffs=['2026-09-25T16:00:00Z','2026-09-26T01:00:00+09:00','2026-09-25T12:00:00-04:00'];
 for(const cutoff of cutoffs)assert.equal(gateEvents(data,b.candidate.origin,cutoff).accepted.length,1);
 e.publicationDate='2026-02-30';assert.equal(gateEvents(data,b.candidate.origin,cutoffs[0]).accepted.length,0);
 e.publicationDate='2026-09-26';delete e.timezone;assert.equal(gateEvents(data,b.candidate.origin,cutoffs[0]).accepted.length,0);
});
