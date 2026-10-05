import test from 'node:test';import assert from 'node:assert/strict';
import {estimateBreakingImpact} from '../lib/breaking-model.mjs';
import {createBreakingState,recordBreakingEvent,decideBreakingEvent,evaluateBreaking,mergeBreaking} from '../lib/breaking-news.mjs';
function impactFixture(){
 const now='2026-09-27T14:00:00+09:00';
 const baseline={id:'baseline',origin:'2026-09-23',createdAt:'2026-09-23T16:00:00+09:00',informationCutoff:'2026-09-23T16:00:00+09:00',assets:[{code:'A',rows:[],news:[]}]};
 const samples=Array.from({length:5},(_,i)=>{
  const n=1+i*4,d=String(n).padStart(2,'0'),prev=String(n===1?31:n-1).padStart(2,'0'),before=n===1?`2026-07-${prev}`:`2026-08-${prev}`;
  return{id:'sample'+i,groupId:'history'+i,code:'A',phaseId:'release',horizonSessions:1,eventAt:`2026-08-${d}T09:00:00+09:00`,knownAt:`2026-08-${d}T09:05:00+09:00`,
   adjustmentVerified:true,expectationVerified:true,overlapChecked:true,overlappingEventIds:[],
   expectedLogReturn:0,expectationKnownAt:`2026-08-${d}T08:00:00+09:00`,expectationSourceUrl:'https://example.com/expectation/'+i,
   residualLogReturn:Math.log(1.1),source:{url:'https://example.com/source/'+i,bodyRead:true,digest:'fixture-'+i,reviewedAt:'2026-09-27T12:30:00+09:00'},
   prices:{beforeClose:100,afterClose:110,beforeAt:before+'T15:30:00+09:00',afterAt:`2026-08-${d}T15:30:00+09:00`,observedAt:`2026-08-${d}T16:00:00+09:00`,adjustmentVerified:true}};
 });
 const event={id:'event',economicEventId:'new-event',phaseId:'release',targetCodes:['A'],publishedAt:'2026-09-27T12:00:00+09:00',discoveredAt:'2026-09-27T12:10:00+09:00',knownAt:'2026-09-27T12:10:00+09:00',
  approvedImpact:{code:'A',phaseId:'release',method:'own_stock_phase_residual',horizonSessions:1,adjustmentVerified:true,expectationVerified:true,evidenceReviewedAt:'2026-09-27T13:00:00+09:00',baselineReview:{baselineId:'baseline',reviewedAt:'2026-09-27T13:00:00+09:00',eventAlreadyIncluded:false,residualOverlap:false},samples}};
 baseline.calendar={sessions:samples.flatMap(s=>[s.prices.beforeAt.slice(0,10),s.prices.afterAt.slice(0,10)])};
 Object.assign(event,{status:'confirmed',sourceType:'official',sourceBodyReviewed:true,sourceUrl:'https://example.com/current'});
 Object.assign(event.approvedImpact,{reviewedEventId:event.id,eventSource:{url:event.sourceUrl,bodyRead:true,digest:'synthetic-current',reviewedAt:'2026-09-27T13:00:00+09:00'}});
 return{event,baseline,code:'A',now};
}
test('breaking independent review: declared complete synthetic evidence recomputes residual and preserves inputs',()=>{
 const f=impactFixture(),old=JSON.stringify(f),r=estimateBreakingImpact(f);
 assert.equal(r.eligible,true);assert.equal(r.sampleCount,5);assert.ok(Math.abs(r.deltaLog-Math.log(1.1)/2)<1e-12);
 assert.equal(JSON.stringify(f),old);assert.equal(r.trustProbability,null);assert.equal(r.causal,false);
});
test('breaking independent review: user verification checkbox and arbitrary delta never confer eligibility',()=>{
 const f=impactFixture();f.event.verified=true;f.event.approvedImpact={verified:true,approved:true,deltaLog:.8};
 const r=estimateBreakingImpact(f);assert.equal(r.eligible,false);assert.equal(r.deltaLog,null);
});
test('breaking independent review: unrelated stock sample cannot become own-stock evidence',()=>{
 const f=impactFixture();f.event.approvedImpact.samples[0].code='B';const r=estimateBreakingImpact(f);
 assert.equal(r.eligible,false);assert.equal(r.sampleCount,4);assert.equal(r.deltaLog,null);
});
test('breaking independent review: republished group does not add sample and future conflicting copy does not rewrite past evidence',()=>{
 const f=impactFixture(),base=estimateBreakingImpact(f),copy=structuredClone(f.event.approvedImpact.samples[0]);
 copy.id='republished';f.event.approvedImpact.samples.push(copy);assert.equal(estimateBreakingImpact(f).sampleCount,5);
 const future=structuredClone(copy);future.id='sample0';future.knownAt='2026-09-28T10:00:00+09:00';future.prices.afterClose=999;
 future.residualLogReturn=Math.log(9.99);future.prices.observedAt='2026-09-28T16:00:00+09:00';f.event.approvedImpact.samples.push(future);
 const result=estimateBreakingImpact(f);assert.equal(result.eligible,true);assert.equal(result.deltaLog,base.deltaLog);
});
test('breaking independent review: overlapping response windows and mismatched residual claims are held',()=>{
 const f=impactFixture();f.event.approvedImpact.samples[0].residualLogReturn=.7;
 assert.equal(estimateBreakingImpact(f).eligible,false);
 const overlap=impactFixture();Object.assign(overlap.event.approvedImpact.samples[1],{eventAt:overlap.event.approvedImpact.samples[0].eventAt,knownAt:overlap.event.approvedImpact.samples[0].knownAt,expectationKnownAt:overlap.event.approvedImpact.samples[0].expectationKnownAt,prices:structuredClone(overlap.event.approvedImpact.samples[0].prices)});
 const r=estimateBreakingImpact(overlap);assert.equal(r.eligible,false);assert.equal(r.sampleCount,3);
});
test('breaking independent review: future event, stale baseline review and fixed end cannot permit revision',()=>{
 const future=impactFixture();future.event.publishedAt='2026-09-28T12:00:00+09:00';assert.equal(estimateBreakingImpact(future).eligible,false);
 const stale=impactFixture();stale.event.approvedImpact.baselineReview.baselineId='other';assert.equal(estimateBreakingImpact(stale).eligible,false);
 const ended=impactFixture();ended.now='2026-10-31T00:00:01+09:00';assert.equal(estimateBreakingImpact(ended).eligible,false);
});
function ledgerFixture(){
 const f=impactFixture();f.baseline.assets[0].rows=['2026-09-25','2026-09-28','2026-09-29','2026-10-30'].map((date,i)=>({date,p50:100+i,p10:90+i,p90:110+i}));
 const input={origin:'2026-09-17',end:'2026-10-30',calendar:{sessions:[...f.baseline.calendar.sessions,'2026-09-25','2026-09-28','2026-09-29','2026-10-30']},assets:[{code:'A',prices:[]},{code:'B',prices:[]}]};
 const payload={...f.event,title:'Synthetic only',summary:'Synthetic fixture',scope:'company'};delete payload.approvedImpact;
 const state=recordBreakingEvent(createBreakingState(),payload,{now:f.event.discoveredAt,codes:['A','B']});
 const event=state.events[0],impact={...f.event.approvedImpact,reviewedEventId:event.id};
 return {...f,input,state,event,impact,options:{now:f.now,input,versions:[f.baseline],active:f.baseline.id}};
}
test('breaking independent review: discovery cannot be backdated and registration is idempotent',()=>{
 const f=ledgerFixture(),before=JSON.stringify(f.state),payload={...f.event,knownAt:'2026-09-20T00:00:00Z',discoveredAt:'2026-09-20T00:00:00Z'};
 const repeated=recordBreakingEvent(f.state,payload,{now:f.now,codes:['A','B']});assert.equal(repeated,f.state);assert.equal(JSON.stringify(f.state),before);
 assert.throws(()=>recordBreakingEvent(f.state,{...payload,publishedAt:'2026-09-28T12:00:00+09:00'},{now:f.now,codes:['A','B']}));
 assert.throws(()=>decideBreakingEvent(f.state,{eventId:f.event.id,code:'A',decision:'KEEP'},{...f.options,now:'2026-09-27T12:05:00+09:00'}));
 assert.throws(()=>decideBreakingEvent(f.state,{eventId:f.event.id,code:'B',decision:'KEEP'},f.options));
});
test('breaking independent review: reviewed revision is one future impulse and source snapshots are immutable',()=>{
 const f=ledgerFixture(),old=JSON.stringify(f.baseline),request={eventId:f.event.id,code:'A',decision:'REVISE',approvedImpact:f.impact};
 const s=decideBreakingEvent(f.state,request,f.options);assert.equal(s.decisions[0].decision,'REVISE',JSON.stringify(s.decisions[0].reasons));
 const p=s.forecasts[0];assert.equal(p.effectiveFrom,'2026-09-28');assert.equal(p.rows[0].p50,100);
 for(const r of p.rows.slice(1))assert.ok(Math.abs(Math.log(r.p50/r.baselineP50)-p.deltaLog)<1e-12);
 assert.equal(JSON.stringify(f.baseline),old);assert.equal(decideBreakingEvent(s,request,f.options),s);
 const repost=recordBreakingEvent(s,{...f.event,title:'Another article',sourceUrl:'https://example.com/repost'},{now:f.now,codes:['A','B']});
 const e=repost.events.at(-1),blocked=decideBreakingEvent(repost,{...request,eventId:e.id,approvedImpact:{...f.impact,reviewedEventId:e.id,eventSource:{...f.impact.eventSource,url:e.sourceUrl}}},f.options);
 assert.equal(blocked.decisions.at(-1).decision,'BLOCK');assert.equal(blocked.forecasts.length,1);
});
test('breaking independent review: price revision appends paired same-date vintages without rewriting KEEP history',()=>{
 const f=ledgerFixture();let s=decideBreakingEvent(f.state,{eventId:f.event.id,code:'A',decision:'KEEP'},f.options);
 const frozen=JSON.stringify(s.forecasts);f.input.assets[0].prices=[{date:'2026-09-28',close:105,observedAt:'2026-09-28T16:00:00+09:00'}];
 assert.equal(evaluateBreaking(s,{input:f.input,now:'2026-09-28T15:45:00+09:00'}).evaluations.length,0);
 s=evaluateBreaking(s,{input:f.input,now:'2026-09-28T17:00:00+09:00'});assert.equal(s.evaluations.length,1);assert.equal(s.evaluations[0].pairedErrorDifference,0);
 const originalEvaluation=JSON.stringify(s.evaluations[0]);f.input.assets[0].prices[0].close=108;
 f.input.priceRevisions=[{code:'A',date:'2026-09-28',at:'2026-09-29T16:00:00+09:00',before:105,after:108,afterRow:{date:'2026-09-28',close:108}}];
 assert.equal(evaluateBreaking(s,{input:f.input,now:'2026-09-28T18:00:00+09:00'}).evaluations.length,1);
 s=evaluateBreaking(s,{input:f.input,now:'2026-09-29T17:00:00+09:00'});assert.equal(s.evaluations.length,2);assert.equal(JSON.stringify(s.evaluations[0]),originalEvaluation);assert.equal(JSON.stringify(s.forecasts),frozen);
 assert.deepEqual(evaluateBreaking(s,{input:f.input,now:'2026-09-29T17:30:00+09:00'}),s);
});
test('breaking independent review: correction lineage and merge conflicts preserve old evidence; fixed end freezes state',()=>{
 const f=ledgerFixture(),s=decideBreakingEvent(f.state,{eventId:f.event.id,code:'A',decision:'KEEP'},f.options),old=JSON.stringify(s);
 const amended=recordBreakingEvent(s,{...f.event,status:'retracted',supersedesId:f.event.id,title:'Retracted'},{now:f.now,codes:['A','B']});
 assert.equal(amended.events.length,2);assert.equal(JSON.stringify(s),old);assert.deepEqual(amended.forecasts,s.forecasts);
 const bad=structuredClone(s);bad.events[0].title='silently overwritten';assert.throws(()=>mergeBreaking(s,bad));
 assert.equal(evaluateBreaking(amended,{input:f.input,now:'2026-10-31T01:00:00+09:00'}),amended);
 assert.equal(decideBreakingEvent(amended,{eventId:f.event.id,code:'A',decision:'KEEP'},{...f.options,now:'2026-10-31T01:00:00+09:00'}),amended);
});
test('breaking independent review: malformed restored event time cannot authorize KEEP',()=>{
 const f=ledgerFixture();f.state.events[0].knownAt='not-a-time';
 assert.throws(()=>decideBreakingEvent(f.state,{eventId:f.event.id,code:'A',decision:'KEEP'},f.options));
});
test('breaking independent review: derived research rows never extend beyond October 30',()=>{
 const f=ledgerFixture();f.baseline.assets[0].rows.push({date:'2026-11-02',p50:120,p10:100,p90:140});
 const s=decideBreakingEvent(f.state,{eventId:f.event.id,code:'A',decision:'KEEP'},f.options);
 assert.ok(s.forecasts[0].rows.every(r=>r.date<='2026-10-30'));assert.equal(f.baseline.assets[0].rows.at(-1).date,'2026-11-02');
});
test('breaking independent review: correction replaces latest branch against frozen baseline instead of accumulating shocks',()=>{
 const f=ledgerFixture();let s=decideBreakingEvent(f.state,{eventId:f.event.id,code:'A',decision:'REVISE',approvedImpact:f.impact},f.options);
 const originalForecast=JSON.stringify(s.forecasts[0]),first=s.forecasts[0];
 s=recordBreakingEvent(s,{...f.event,status:'corrected',supersedesId:f.event.id,title:'Corrected synthetic event'},{now:'2026-09-27T14:30:00+09:00',codes:['A','B']});
 const e=s.events.at(-1),impact=structuredClone(f.impact);impact.reviewedEventId=e.id;impact.replacesForecastId=first.id;
 impact.evidenceReviewedAt=impact.eventSource.reviewedAt=impact.baselineReview.reviewedAt='2026-09-27T15:00:00+09:00';
 for(const sample of impact.samples){sample.prices.afterClose=90;sample.residualLogReturn=Math.log(.9);sample.source.reviewedAt=impact.evidenceReviewedAt;}
 const fixed=decideBreakingEvent(s,{eventId:e.id,code:'A',decision:'REVISE',approvedImpact:impact},{...f.options,now:'2026-09-27T15:30:00+09:00'});
 assert.equal(fixed.decisions.at(-1).decision,'REVISE',JSON.stringify(fixed.decisions.at(-1).reasons));assert.equal(fixed.forecasts.length,2);assert.equal(JSON.stringify(fixed.forecasts[0]),originalForecast);
 const newest=fixed.forecasts.at(-1);assert.equal(newest.replacesForecastId,first.id);assert.ok(Math.abs(newest.rows[1].p50-101*Math.sqrt(.9))<1e-10);
});
