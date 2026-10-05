// Every observation below is synthetic; these tests certify eligibility mechanics, not market accuracy.
import test from 'node:test';
import assert from 'node:assert/strict';
import {estimateBreakingImpact} from '../lib/breaking-model.mjs';
function fixture(){
 const now='2026-09-27T08:00:00Z',reviewedAt=now;
 const calendar=[];for(let t=new Date('2025-08-01T00:00:00Z');t<=new Date('2026-10-30T00:00:00Z');t.setUTCDate(t.getUTCDate()+1))if(![0,6].includes(t.getUTCDay()))calendar.push(t.toISOString().slice(0,10));
 const dates=['2025-09-01','2025-09-08','2025-09-15','2025-09-22','2025-09-29'];
 const samples=dates.map((date,i)=>{const beforeDate=calendar[calendar.indexOf(date)-1];return{id:'s'+i,groupId:'g'+i,code:'A',phaseId:'result',eventAt:date+'T01:00:00Z',knownAt:date+'T01:10:00Z',horizonSessions:1,
  adjustmentVerified:true,expectationVerified:true,overlapChecked:true,overlappingEventIds:[],
  source:{url:'https://example.com/history/'+i,bodyRead:true,digest:'synthetic-test-body-'+i,reviewedAt},
  prices:{beforeClose:100,afterClose:110,beforeAt:beforeDate+'T06:30:00Z',afterAt:date+'T06:30:00Z',observedAt:date+'T07:00:00Z',adjustmentVerified:true},
  expectedLogReturn:.01,expectationKnownAt:beforeDate+'T07:00:00Z',expectationSourceUrl:'https://example.com/expectation/'+i,residualLogReturn:Math.log(110)-Math.log(100)-.01};});
 const baseline={id:'base',origin:'2026-09-23',createdAt:'2026-09-23T07:00:00Z',informationCutoff:'2026-09-23T07:00:00Z',assets:[{code:'A',news:[]}],calendar:{sessions:calendar}};
 const event={id:'current',economicEventId:'economic-current',phaseId:'result',targetCodes:['A'],publishedAt:'2026-09-27T06:00:00Z',discoveredAt:'2026-09-27T07:00:00Z',knownAt:'2026-09-27T07:00:00Z',status:'confirmed',sourceType:'official',sourceBodyReviewed:true,sourceUrl:'https://example.com/current',
 approvedImpact:{reviewedEventId:'current',code:'A',phaseId:'result',method:'own_stock_phase_residual',horizonSessions:1,adjustmentVerified:true,expectationVerified:true,evidenceReviewedAt:reviewedAt,
 eventSource:{url:'https://example.com/current',bodyRead:true,digest:'synthetic-current',reviewedAt},baselineReview:{baselineId:'base',reviewedAt,eventAlreadyIncluded:false,residualOverlap:false,otherPhaseOverlap:false},samples}};
 return {event,code:'A',baseline,now};
}
test('synthetic independently grouped own-phase samples yield reproducible shrinkage, not a probability',()=>{
 const f=fixture(),before=JSON.stringify(f),r=estimateBreakingImpact(f);
 assert.equal(r.eligible,true);assert.equal(r.sampleCount,5);assert.ok(Math.abs(r.deltaLog-(Math.log(1.1)-.01)/2)<1e-14);assert.equal(r.trustProbability,null);assert.equal(r.causal,false);assert.equal(JSON.stringify(f),before);
});
test('manual confirmation and arbitrary delta alone cannot bypass evidence',()=>{
 const f=fixture();f.event.approvedImpact={...f.event.approvedImpact,samples:[],deltaLog:.5};const r=estimateBreakingImpact(f);assert.equal(r.eligible,false);assert.equal(r.deltaLog,null);
});
test('fewer than five, other stock, other phase, and fabricated residuals are rejected',()=>{
 for(const change of [s=>s.pop(),s=>s[0].code='B',s=>s[0].phaseId='application',s=>s[0].residualLogReturn=10]){
 const f=fixture();change(f.event.approvedImpact.samples);const r=estimateBreakingImpact(f);assert.equal(r.eligible,false);assert.ok(r.sampleCount<5);}
});
test('future observations and future conflicting duplicates cannot alter earlier admissible sample',()=>{
 const f=fixture(),before=estimateBreakingImpact(f);const future=structuredClone(f.event.approvedImpact.samples[0]);future.knownAt='2026-10-01T07:00:00Z';future.residualLogReturn=200;f.event.approvedImpact.samples.push(future);
 const after=estimateBreakingImpact(f);assert.equal(after.eligible,true);assert.equal(after.deltaLog,before.deltaLog);assert.deepEqual(after.refs,before.refs);
});
test('duplicate group reprints do not increase count; conflicting same-group observations are excluded',()=>{
 const f=fixture();f.event.approvedImpact.samples.push({...structuredClone(f.event.approvedImpact.samples[0]),id:'reprint'});assert.equal(estimateBreakingImpact(f).sampleCount,5);
 f.event.approvedImpact.samples.at(-1).prices.afterClose=120;f.event.approvedImpact.samples.at(-1).residualLogReturn=Math.log(120)-Math.log(100)-.01;const r=estimateBreakingImpact(f);assert.equal(r.sampleCount,4);assert.equal(r.eligible,false);
});
test('different IDs on the same response day are not independent samples',()=>{
 const f=fixture();const copy=structuredClone(f.event.approvedImpact.samples[0]);copy.id='distinct-id';copy.groupId='different-group';f.event.approvedImpact.samples.push(copy);const r=estimateBreakingImpact(f);assert.equal(r.sampleCount,4);assert.equal(r.eligible,false);
});
test('calendar verifies one trading session and blocks post-event expectation',()=>{
 const f=fixture();f.event.approvedImpact.samples[0].prices.beforeAt='2025-08-27T06:30:00Z';assert.equal(estimateBreakingImpact(f).eligible,false);
 const g=fixture();g.event.approvedImpact.samples[0].expectationKnownAt=g.event.approvedImpact.samples[0].eventAt;assert.equal(estimateBreakingImpact(g).eligible,false);
});
test('baseline already priced event, same phase included, or residual evolution correction blocks double addition',()=>{
 const mutations=[f=>f.baseline.origin='2026-09-27',f=>f.baseline.assets[0].news=[{id:'other',economicEventId:'economic-current',phaseId:'result',used:true}],f=>f.baseline.assets[0].training={correction:.01,status:'TRAINED'},f=>delete f.event.approvedImpact.baselineReview];
 for(const mutate of mutations){const f=fixture();mutate(f);assert.equal(estimateBreakingImpact(f).eligible,false);}
});
test('a different confirmed phase needs explicit nonoverlap review, not automatic same-event rejection',()=>{
 const f=fixture();f.baseline.assets[0].news=[{id:'older',economicEventId:'economic-current',phaseId:'application',used:true}];assert.equal(estimateBreakingImpact(f).eligible,true);
 delete f.event.approvedImpact.baselineReview.otherPhaseOverlap;assert.equal(estimateBreakingImpact(f).eligible,false);
});
test('retracted/reported/unverified events and correction with old review remain held',()=>{
 for(const status of ['retracted','reported','withdrawn','unverified']){const f=fixture();f.event.status=status;assert.equal(estimateBreakingImpact(f).eligible,false);}
 const f=fixture();f.event.status='corrected';f.event.id='new-revision';assert.equal(estimateBreakingImpact(f).eligible,false);
});
test('extreme losses remain, null price evidence and after-period calculations are held',()=>{
 const f=fixture();f.event.approvedImpact.samples[0].prices.afterClose=.001;f.event.approvedImpact.samples[0].residualLogReturn=Math.log(.001)-Math.log(100)-.01;
 const r=estimateBreakingImpact(f);assert.equal(r.eligible,true);assert.equal(r.sampleCount,5);assert.ok(r.deltaLog<0);
 f.event.approvedImpact.samples[0].prices.afterClose=null;assert.equal(estimateBreakingImpact(f).eligible,false);
 const g=fixture();g.now='2026-10-31T00:00:00Z';assert.equal(estimateBreakingImpact(g).eligible,false);
});
