import test from 'node:test';
import assert from 'node:assert/strict';
import {updateEvolution,mergeEvolution,EVOLUTION_POLICY} from '../lib/evolution.mjs';
function fixture(){
 const sessions=[];for(let d=new Date('2026-09-17T00:00:00Z');d<=new Date('2026-10-30T00:00:00Z');d.setUTCDate(d.getUTCDate()+1))if(![0,6].includes(d.getUTCDay()))sessions.push(d.toISOString().slice(0,10));
 const prices=sessions.map(date=>({date,close:100,quality:'single_source',observedAt:date+'T07:00:00Z'}));
 const input={origin:'2026-09-17',end:'2026-10-30',actualAsOf:sessions[0],calendar:{sessions},assets:[{code:'A',name:'A',prices},{code:'B',name:'B',prices:structuredClone(prices)}]};
 const make=(origin,id)=>({id,origin,end:input.end,createdAt:origin+'T07:00:00Z',informationCutoff:origin+'T07:00:00Z',assets:input.assets.map(a=>({code:a.code,name:a.name,originPrice:100,rows:sessions.filter(d=>d>=origin).map(date=>({date,p50:90,p10:70,p90:110,rawProbUp:.8}))}))});
 const versions=sessions.slice(0,5).map((d,i)=>make(d,'f'+i));const active=make('2026-09-25','active');
 const original={...make(input.origin,'original'),isRetrospectiveReconstruction:true};
 return{input,versions,active,original,evaluationLedger:[],now:'2026-09-25T08:00:00Z'};
}
test('strict prospective own-stock next-session residuals train with fixed ridge; null probabilities never inherited',()=>{
 const f=fixture(),e=updateEvolution(f,f.now),a=e.versions[0].assets[0];
 assert.equal(a.training.count,5);assert.equal(a.training.status,'TRAINED');
 assert.ok(Math.abs(a.training.correction-(5*Math.log(100/90)/(5+5)))<1e-14);
 assert.equal(a.rows.find(r=>r.date==='2026-09-28').horizon,1);assert.ok(a.rows.find(r=>r.date==='2026-09-28').p50>90);
 assert.equal(e.versions[0].issuedAt,new Date(f.now).toISOString());assert.equal(e.versions[0].origin,'2026-09-25');
 assert.ok(a.rows.every(r=>!('rawProbUp'in r)&&!('probUp'in r)&&!('mean'in r)));
});
test('retrospective, same-target-day, future-issued and future-observed rows cannot train',()=>{
 for(const kind of ['retrospective','sameDay','futureIssue','futureObserved']){
  const f=fixture();if(kind==='retrospective')f.versions.forEach(v=>v.isRetrospectiveReconstruction=true);
  if(kind==='sameDay')f.versions.forEach(v=>{const target=f.input.calendar.sessions[f.input.calendar.sessions.indexOf(v.origin)+1];v.createdAt=target+'T01:00:00Z';v.informationCutoff=v.createdAt;});
  if(kind==='futureIssue')f.versions.forEach(v=>v.createdAt='2026-10-01T07:00:00Z');
  if(kind==='futureObserved')f.input.assets.forEach(a=>a.prices.forEach(p=>p.observedAt='2026-10-01T07:00:00Z'));
  const a=updateEvolution(f,f.now).versions[0].assets[0];assert.equal(a.training.count,0,kind);assert.equal(a.training.status,'INSUFFICIENT');assert.ok(a.rows.every(r=>r.p50===r.baselineP50));
 }
});
test('same stock/date multiple vintages and horizons are not independent training samples',()=>{
 const f=fixture();f.versions.push({...structuredClone(f.versions[0]),id:'later',createdAt:f.versions[0].origin+'T08:00:00Z'});
 const a=updateEvolution(f,f.now).versions[0].assets[0];assert.equal(a.training.count,5);assert.equal(new Set(a.training.refs.map(r=>r.date)).size,5);assert.equal(a.training.refs[0].forecastId,'later');
});
test('unknown and null prices stay unavailable; other stock does not contaminate training; extreme loss retained',()=>{
 const f=fixture();f.input.assets[0].prices[1].close=.001;f.input.assets[1].prices.forEach(p=>{delete p.observedAt;p.close=null;});
 const e=updateEvolution(f,f.now);assert.equal(e.versions[0].assets[0].training.count,5);assert.ok(e.versions[0].assets[0].training.refs.some(r=>r.actual===.001&&r.residual<-10));assert.equal(e.versions[0].assets[1].training.count,0);
 f.active.assets[1].rows[1].p50=null;const n=updateEvolution(f,f.now);assert.equal(n.versions[0].assets[1].rows[1].p50,null);
});
test('matching collector insertion journal timestamps permit training beyond common date; future revisions defer',()=>{
 const f=fixture();f.input.priceRevisions=[];for(const a of f.input.assets)for(const p of a.prices){f.input.priceRevisions.push({code:a.code,date:p.date,before:null,after:p.close,at:p.observedAt});delete p.observedAt;}
 assert.equal(updateEvolution(f,f.now).versions[0].assets[0].training.count,5);
 f.input.priceRevisions.push({code:'A',date:f.input.calendar.sessions[1],before:100,after:101,at:'2026-10-01T07:00:00Z'});
 assert.equal(updateEvolution(f,f.now).versions[0].assets[0].training.count,4);
});
test('same meaningful data is idempotent, observation time alone is not new input, arguments are immutable',()=>{
 const f=fixture(),before=JSON.stringify(f);const e=updateEvolution(f,f.now);assert.equal(JSON.stringify(f),before);
 assert.deepEqual(updateEvolution({...f,evolution:e},new Date(f.now)),e);
 f.input.assets.forEach(a=>a.prices.forEach(p=>{if(p.observedAt<=f.now)p.observedAt=f.now;}));
 assert.deepEqual(updateEvolution({...f,evolution:e},f.now),e);
});
test('frozen shadow evaluation is paired to its baseline, append-only, and cannot train on its own output',()=>{
 const f=fixture(),e=updateEvolution(f,f.now),later=updateEvolution({...f,evolution:e},'2026-09-28T08:00:00Z');
 assert.ok(later.evaluations.length>0);const r=later.evaluations.find(x=>x.code==='A');assert.equal(r.date,'2026-09-28');assert.equal(r.baselinePredicted,90);assert.equal(r.actual,100);assert.equal(r.trainingEligible,false);assert.equal(r.diagnosis,'UNKNOWN');
 assert.deepEqual(later.versions[0],e.versions[0]);assert.deepEqual(updateEvolution({...f,evolution:later},'2026-09-28T08:00:00Z'),later);
});
test('after period end no new work, and merge preserves immutable histories and manual notes',()=>{
 const f=fixture(),e=updateEvolution(f,f.now);e.notes=[{id:'manual1',status:'HYPOTHESIS',applied:false}];
 assert.deepEqual(updateEvolution({...f,evolution:e},'2026-10-30T15:00:01Z'),e);
 assert.deepEqual(mergeEvolution(e,e),e);const modified=structuredClone(e);modified.versions[0].sourceId='changed';assert.throws(()=>mergeEvolution(e,modified),/immutable record conflict/);
 assert.equal(EVOLUTION_POLICY.lambda,5);
});

test('original ID strings are excluded and unknown baseline time is rejected',()=>{
 const f=fixture();f.original=f.versions[0].id;assert.equal(updateEvolution(f,f.now).versions[0].assets[0].training.count,4);
 delete f.active.createdAt;assert.throws(()=>updateEvolution(f,f.now),/Unknown or future/);
});
test('numeric range failures retain the extreme training path and return flagged nulls',()=>{
 const f=fixture();for(const v of f.versions)for(const a of v.assets)for(const r of a.rows)r.p50=1e-300;
 for(const a of f.input.assets)for(const p of a.prices)p.close=1e300;
 const a=updateEvolution(f,f.now).versions[0].assets[0];assert.equal(a.training.count,5);assert.ok(a.training.correction>600);
 assert.ok(a.rows.some(r=>r.numericStatus==='numeric_range_limit'&&r.p50===null));
});

test('price versus latest correction journal conflict is deferred, never observedAt fallback',()=>{
 const f=fixture(),date=f.input.calendar.sessions[1];f.input.priceRevisions=[{code:'A',date,before:100,after:101,at:date+'T07:00:00Z'}];
 const out=updateEvolution(f,f.now);assert.equal(out.versions[0].assets[0].training.count,4);assert.equal(out.versions[0].assets[1].training.count,5);
});
test('an archived branch cannot displace active shadow matching accepted inputs',()=>{
 const f=fixture(),first=updateEvolution(f,f.now);const changed=structuredClone(f);changed.active.id='other';const branch=updateEvolution(changed,f.now);
 const merged=mergeEvolution(first,branch),next=updateEvolution({...f,evolution:merged},f.now);
 assert.equal(next.versions.length,2);assert.equal(next.activeId,first.activeId);assert.equal(next.versions.at(-1).sourceId,'other');
});
