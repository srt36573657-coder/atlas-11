import test from 'node:test';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {validateFactorRecords,factorValue,fitFactorModel,FEATURE_FACTORS,distributionScore} from '../lib/factor36.mjs';
import {externalDesign,mergeFactorRecords} from '../lib/factor36-input.mjs';
import {simulateJointFactor36} from '../lib/factor36-simulation.mjs';
const sha=x=>createHash('sha256').update(JSON.stringify(x)).digest('hex');
const dates=Array.from({length:400},(_,j)=>new Date(Date.UTC(2025,0,1+j)).toISOString().slice(0,10));
const record=(date=dates[0],extra={})=>({factorId:'F04',scope:'market',date,value:2,unit:'percent',sourceUrl:'https://example.com/official-series',rawHash:'a'.repeat(64),publishedAt:date+'T01:00:00Z',observedAt:date+'T02:00:00Z',vintageId:date,adjustmentStatus:'not_applicable',licensingStatus:'permitted',maxAgeDays:0,scenarioMode:'carry',pointInTimeVerified:true,...extra});
const validate=(records,cutoff='2026-09-16T07:00:00Z')=>validateFactorRecords({schema:'atlas-factor36-records-1',records},{codes:['000001','000002'],cutoff});
const baseRows=dates.slice(1).map((date,j)=>({date,x:Array(7).fill(Math.sin(j)/100),y:Math.sin(j)/100}));
const panel={dates};
test('future malformed or conflicting factor rows cannot alter historical eligibility or canonical digest',()=>{
 const r=record(),future={...r,observedAt:'2027-01-01T01:00:00Z',value:NaN,sourceUrl:'https://127.0.0.1/secret'};
 assert.equal(sha(validate([r])),sha(validate([future,r])));
 assert.equal(sha(validate([r,record(dates[1])])),sha(validate([Object.fromEntries(Object.entries(record(dates[1])).reverse()),Object.fromEntries(Object.entries(r).reverse())])));
 assert.throws(()=>validate([r,{...r,value:3}]),/FACTOR_CONFLICT/);
});
test('index membership requires explicit codes, source hash, public timestamp and effective period',()=>{
 const r=record(dates[2],{scope:'index',indexId:'TEST_INDEX',codes:['000001','000001'],membership:{url:'https://example.com/constituents',rawHash:'b'.repeat(64),availableAt:dates[0]+'T00:00:00Z',effectiveFrom:dates[0],effectiveTo:dates[10]}});
 const valid=validate([r]);assert.deepEqual(valid[0].codes,['000001']);
 assert.equal(factorValue(valid,'F04',{code:'000001'},dates[2],dates[2]+'T03:00:00Z').value,2);
 assert.equal(factorValue(valid,'F04',{code:'000002'},dates[2],dates[2]+'T03:00:00Z'),null);
 assert.equal(factorValue([{...valid[0],maxAgeDays:100}],'F04',{code:'000001'},dates[11],dates[11]+'T03:00:00Z'),null);
 assert.throws(()=>validate([{...r,membership:{...r.membership,rawHash:null}}]),/INDEX_MEMBERSHIP/);
 assert.throws(()=>validate([record(dates[0],{scope:'market',code:'000001'})]),/AMBIGUOUS_TARGET/);
});
test('bounded source validation rejects private, link-local and credential-bearing URLs',()=>{
 for(const sourceUrl of ['https://172.16.0.1/a','https://169.254.169.254/a','https://user:secret@example.com/a','https://a.localhost/a'])assert.throws(()=>validate([record(dates[0],{sourceUrl})]),/FACTOR_SOURCE/);
});
test('an adequate continuous recent history is accepted without inventing older observations',()=>{
 const records=validate(dates.slice(40).map(date=>record(date))),design=externalDesign(records,{code:'000001'},panel,baseRows,'2026-09-16T07:00:00Z');
 assert.equal(design.selected.length,1);assert.equal(design.history.removedPrefixRows,40);assert.equal(design.rows.length,359);
 assert.ok(design.rows.every(r=>r.x.length===8&&r.x[7]===2));assert.equal(design.selected[0].byTargetDate[baseRows[0].date],null);
});
test('a recent missing day requires a complete new 260-row suffix rather than zero imputation',()=>{
 const records=validate(dates.filter((_,j)=>j!==250).map(date=>record(date))),design=externalDesign(records,{code:'000001'},panel,baseRows,'2026-09-16T07:00:00Z');
 assert.equal(design.selected.length,0);assert.equal(design.rejected[0].code,'CONTIGUOUS_HISTORY_SHORT');assert.equal(design.rows.length,baseRows.length);assert.ok(design.rows.every(r=>r.x.length===7));
});
test('duplicate economic exposure exclusion is independent of factor record input order',()=>{
 const records=validate(dates.flatMap(date=>[record(date,{factorId:'F01',economicEventId:'same-rate-decision'}),record(date,{factorId:'F02',economicEventId:'same-rate-decision'})]));
 const a=externalDesign(records,{code:'000001'},panel,baseRows,'2026-09-16T07:00:00Z'),b=externalDesign(records.slice().reverse(),{code:'000001'},panel,baseRows,'2026-09-16T07:00:00Z');
 assert.deepEqual(a,b);assert.equal(a.selected.length,0);assert.ok(a.rejected.every(r=>r.code==='DUPLICATE_ECONOMIC_EXPOSURE'));
});
test('FOMO core evidence is stock-specific and its score has no forced positive price effect',()=>{
 const records=validate(dates.flatMap(date=>[record(date,{factorId:'FOMO',scope:'company',code:'000001',coreEvidenceVerified:true,value:95}),record(date,{factorId:'FOMO',scope:'company',code:'000002',coreEvidenceVerified:false,value:95})]));
 const a=externalDesign(records,{code:'000001'},panel,baseRows,'2026-09-16T07:00:00Z'),b=externalDesign(records,{code:'000002'},panel,baseRows,'2026-09-16T07:00:00Z');
 assert.equal(a.selected.length,1);assert.equal(b.selected.length,0);
 const m=fitFactorModel(a.rows,{featureFactors:a.featureFactors});assert.equal(m.regression.beta.at(-1),0);assert.equal(m.factorSelection.decisions[0].accepted,false);
});
test('append-only merging owns all previous and new objects, and never aliases the journal',()=>{
 const old={records:[record()],revisions:[{at:'a',before:null,after:record()}]},next=mergeFactorRecords(old,[record(dates[1])],{expectedHash:'x',actualHash:'x',at:'b'});
 next.records[0].value=99;next.records[1].value=77;next.revisions[0].after.value=66;
 assert.equal(old.records[0].value,2);assert.equal(old.revisions[0].after.value,2);assert.equal(next.revisions[1].after.value,2);
 assert.equal(mergeFactorRecords(old,[Object.fromEntries(Object.entries(record()).reverse())],{expectedHash:'x',actualHash:'x',at:'b'}).records.length,1);
});
const learning=dates.slice(0,380).map((date,j)=>({date,x:[Math.sin(j/8),Math.cos(j/9),j/1000,0,0,0,0,Math.sin(j/5)],y:.004*Math.sin(j/8)+.01*Math.sin(j/5)+.006*Math.cos(j/2)}));
test('additional-factor choice is frozen before holdout and robust to row input order',()=>{
 const args={featureFactors:[...FEATURE_FACTORS,'F04']},a=fitFactorModel(learning,args),b=fitFactorModel(learning.map((r,j)=>j>=320?{...r,y:r.y+2}:r),args),c=fitFactorModel(learning.slice().reverse(),args);
 assert.deepEqual(a.factorSelection,b.factorSelection);assert.deepEqual(a.selected,b.selected);assert.deepEqual(a,c);assert.equal(a.factorSelection.holdoutUsed,false);
 assert.throws(()=>fitFactorModel([...learning,learning[0]],args),/TRAINING_CHRONOLOGY/);
});
test('joint residual normalization, extreme losses and arithmetic price means remain finite',()=>{
 const m=fitFactorModel(learning.map(r=>({...r,x:r.x.slice(0,7)}))),panel={dates:learning.map(r=>r.date),returns:[learning.map(r=>r.y),learning.map(r=>r.y)],basket:learning.map(r=>r.y),breadth:learning.map(r=>Math.sign(r.y))};
 const assets=[0,1].map(()=>({prices:[{date:panel.dates.at(-1),close:100}]})),partial=structuredClone(m);partial.shockDates=partial.shockDates.slice(10);partial.shocks=partial.shocks.slice(10);
 const a=simulateJointFactor36([m,partial],panel,assets,['2026-09-28'],{paths:200,seed:5});assert.deepEqual(a.rows[0],a.rows[1]);assert.equal(a.audit.deletedForLoss,0);assert.ok(a.audit.lossPathsRetained.every(n=>n>0));assert.ok(a.audit.shockStandardization.every(s=>Number.isFinite(s.centerRemoved)));
 const enormous=structuredClone(m);enormous.regression.intercept=695;enormous.regression.beta.fill(0);
 const high=simulateJointFactor36([enormous,enormous],panel,assets,['2026-09-28'],{paths:200,seed:5});assert.ok(high.rows[0][0].mean>1e300&&Number.isFinite(high.rows[0][0].mean));
 const invalid=structuredClone(m);invalid.trainedThrough='1999-01-01';assert.throws(()=>simulateJointFactor36([m,invalid],panel,assets,['2026-09-28'],{paths:200}),/HISTORY_CONTRACT/);
});
test('explicit correction lineage preserves prior as-of value and deep before/after while ambiguity stays blocked',()=>{
 const old=record(dates[0],{maxAgeDays:30}),correction={...old,value:3,vintageId:'correction-1',supersedesVintageId:old.vintageId,publishedAt:dates[2]+'T01:00:00Z',observedAt:dates[2]+'T02:00:00Z'};
 const records=validate([old,correction]);assert.equal(factorValue(records,'F04',{code:'000001'},dates[1],dates[1]+'T03:00:00Z').value,2);assert.equal(factorValue(records,'F04',{code:'000001'},dates[3],dates[3]+'T03:00:00Z').value,3);
 assert.equal(sha(validate([old,correction],dates[1]+'T03:00:00Z')),sha(validate([old],dates[1]+'T03:00:00Z')));
 assert.equal(factorValue(validate([old,{...correction,supersedesVintageId:undefined}]),'F04',{code:'000001'},dates[3],dates[3]+'T03:00:00Z'),null);
 const next=mergeFactorRecords({records:[old],revisions:[]},[correction],{expectedHash:'x',actualHash:'x',at:dates[3]+'T03:00:00Z'});assert.equal(next.revisions[0].before.value,2);assert.equal(next.revisions[0].after.value,3);next.records[0].value=77;assert.equal(next.revisions[0].before.value,2);
 assert.throws(()=>mergeFactorRecords({records:[],revisions:[]},[correction],{expectedHash:'x',actualHash:'x',at:dates[3]+'T03:00:00Z'}),/CORRECTION_PREDECESSOR/);
 assert.throws(()=>validate([record(dates[0],{publishedAt:'2025-02-30T00:00:00Z',observedAt:'2025-03-05T00:00:00Z'})]),/FACTOR_TIME/);
});

test('direction, price error, coverage and interval width are separate heldout diagnostics',()=>{
 const score=distributionScore([-2,-1,0,1,2],.01,.01,.03);
 assert.equal(score.medianLogReturn,.01);assert.equal(score.directionSelected,'up');assert.equal(score.directionActual,'up');assert.equal(score.directionCorrect,true);assert.equal(score.covered,false);
 assert.ok(Math.abs(score.absolutePriceError-Math.abs(Math.expm1(-.02)))<1e-14);
 assert.ok(Math.abs(score.bandWidthLog-.032)<1e-14);assert.ok(Math.abs(score.bandWidthPrice-(Math.exp(.026)-Math.exp(-.006)))<1e-14);
 const tied=distributionScore([-1,1],0,.01,0);assert.equal(tied.directionSelected,'up');assert.equal(tied.directionCorrect,false);
 const model=fitFactorModel(learning.map(r=>({...r,x:r.x.slice(0,7)}))),v=model.validation,rows=v.rows;
 for(const [aggregate,rowKey] of [['directionAccuracy','directionCorrect'],['coverage','covered'],['absolutePriceError','absolutePriceError'],['bandWidthLog','bandWidthLog'],['bandWidthPrice','bandWidthPrice']]){
  assert.ok(Math.abs(v[aggregate]-rows.reduce((s,r)=>s+Number(r[rowKey]),0)/rows.length)<1e-14);
  const baselineAggregate='baseline'+aggregate[0].toUpperCase()+aggregate.slice(1);assert.ok(Math.abs(v[baselineAggregate]-rows.reduce((s,r)=>s+Number(r.baseline[rowKey]),0)/rows.length)<1e-14);
 }
 assert.equal(v.metricUnits.absolutePriceError,'absolute_fraction_of_actual_target_price');assert.equal(v.diagnosticCounts.absolutePriceError,60);assert.equal(model.selected.loss,model.candidates[0].loss);
});
