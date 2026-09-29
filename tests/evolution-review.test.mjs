import test from 'node:test';import assert from 'node:assert/strict';
import {updateEvolution,mergeEvolution} from '../lib/evolution.mjs';
// Synthetic session calendar: this fixture is not a claim about actual exchange holidays.
const date=n=>`2026-09-${String(n).padStart(2,'0')}`,at=n=>date(n)+'T16:00:00+09:00';
function fixture(){
 const sessions=Array.from({length:14},(_,i)=>date(17+i));
 const versions=Array.from({length:5},(_,i)=>({id:'v'+i,origin:date(17+i),createdAt:at(17+i),informationCutoff:at(17+i),isRetrospectiveReconstruction:false,assets:[{code:'A',name:'A',originPrice:100,rows:[{date:date(18+i),p50:100,p10:90,p90:110}]}]}));
 const baseline={id:'base',origin:date(22),createdAt:at(22),informationCutoff:at(22),isRetrospectiveReconstruction:false,assets:[{code:'A',name:'A',originPrice:100,rows:sessions.filter(d=>d>=date(22)).map(d=>({date:d,p50:100,p10:90,p90:110,probUp:.9,mean:101}))}]};
 versions.push(baseline);
 return {input:{origin:date(17),end:'2026-10-30',actualAsOf:date(22),calendar:{sessions},assets:[{code:'A',name:'A',prices:Array.from({length:5},(_,i)=>({date:date(18+i),close:110,observedAt:at(18+i)}))}],priceRevisions:[]},versions,original:'original',active:'base',evaluationLedger:[]};
}
const now=at(23);
test('independent review: residual correction uses five distinct next-session dates without mutating baseline',()=>{
 const state=fixture(),before=JSON.stringify(state),e=updateEvolution(state,now),a=e.versions[0].assets[0];
 assert.equal(a.training.count,5);assert.ok(Math.abs(a.training.correction-Math.log(1.1)/2)<1e-12);
 assert.equal(JSON.stringify(state),before);assert.equal(a.rows.find(r=>r.date===date(24)).horizon,1);
 assert.ok(Math.abs(a.rows.find(r=>r.date===date(24)).p50-100*Math.sqrt(1.1))<1e-10);
 assert.ok(a.rows.every(r=>!('probUp' in r)&&!('mean' in r)));
 assert.deepEqual(updateEvolution({...state,evolution:e},at(23)),e);
});
test('independent review: same-day issue and future correction cannot enter training',()=>{
 const state=fixture();state.versions[0].createdAt=date(18)+'T00:00:00+09:00';
 assert.equal(updateEvolution(state,now).versions[0].assets[0].training.count,4);
 const revised=fixture();revised.input.priceRevisions.push({code:'A',date:date(18),after:110,at:at(24)});
 const a=updateEvolution(revised,now).versions[0].assets[0];assert.equal(a.training.count,4);assert.equal(a.training.correction,0);
});
test('independent review: unrelated company price changes do not change A correction or path',()=>{
 const state=fixture(),expected=updateEvolution(state,now).versions[0].assets[0];
 state.input.assets.push({code:'B',name:'B',prices:[{date:date(22),close:99999,observedAt:at(22)}]});
 const got=updateEvolution(state,now).versions[0].assets[0];assert.deepEqual(got,expected);
});
test('independent review: shadow outcome appends once, cannot feed its own training, and stops after fixed end',()=>{
 const state=fixture(),e=updateEvolution(state,now);state.evolution=e;
 state.input.assets[0].prices.push({date:date(24),close:105,observedAt:at(24)});
 const out=updateEvolution(state,at(24));assert.equal(out.versions.length,1);assert.equal(out.evaluations.length,1);
 assert.equal(out.evaluations[0].trainingEligible,false);assert.equal(out.evaluations[0].diagnosis,'UNKNOWN');
 assert.deepEqual(updateEvolution({...state,evolution:out},at(24)),out);
 assert.deepEqual(updateEvolution({...state,evolution:out},'2026-10-31T16:00:00+09:00'),out);
 const altered=structuredClone(out);altered.versions[0].assets[0].rows[0].p50=999;
 assert.throws(()=>mergeEvolution(out,altered),/conflict/);
});
test('independent review: original string ID is never a training candidate and baseline times must be known',()=>{
 const state=fixture();state.original='v0';
 assert.equal(updateEvolution(state,now).versions[0].assets[0].training.count,4);
 const invalid=fixture();invalid.versions.at(-1).informationCutoff='not-a-time';
 assert.throws(()=>updateEvolution(invalid,now),/Unknown or future/);
});
test('independent review: contradictory latest revision cannot fall back to an old observation stamp',()=>{
 const state=fixture();state.input.priceRevisions.push({code:'A',date:date(18),after:999,at:at(23)});
 const trained=updateEvolution(state,now).versions[0].assets[0].training;
 assert.equal(trained.count,4);assert.equal(trained.correction,0);
});
