import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import {fitCalibration,calibratedProbability,calibrationEvidenceKey,probabilityScores} from '../lib/probability.mjs';
import {forecast,MODEL_VERSION,empiricalCRPS} from '../lib/news-engine.mjs';
import {initialState,upgradeState} from '../lib/service.mjs';
import {buildStory,nextPlayback} from '../lib/story.mjs';
const input=JSON.parse(await fs.readFile(new URL('./fixtures/input-v3.json',import.meta.url),'utf8'));
const opts={paths:2000,seed:1234,createdAt:'2026-09-24T00:00:00Z'};
test('probability selection is chronological with target embargo; audit outcomes cannot change alpha',()=>{
 const records=Array.from({length:80},(_,i)=>{
  const origin=new Date(Date.UTC(2025,0,i*2+1)).toISOString().slice(0,10),target=new Date(Date.UTC(2025,0,i*2+2)).toISOString().slice(0,10);
  return {origin,target,horizon:1,prob:0.9,actualUp:i%2===0};
 });
 const c=fitCalibration(records,MODEL_VERSION,'2025-08-01');
 const altered=records.map(r=>r.origin>=c.groups[0].auditStart?{...r,actualUp:true}:r),d=fitCalibration(altered,MODEL_VERSION,'2025-08-01');
 assert.equal(c.groups[0].alpha,0);assert.equal(d.groups[0].alpha,c.groups[0].alpha);
 assert.ok(c.groups[0].trainLastTarget<c.groups[0].gateStart);assert.ok(c.groups[0].gateLastTarget<c.groups[0].auditStart);
 assert.equal(probabilityScores(records,0).brier,0.25);
 assert.equal(calibratedProbability(0.9,1,c,'2025-08-02',MODEL_VERSION).value,0.5);
 assert.equal(calibratedProbability(0.9,1,c,'2025-07-01',MODEL_VERSION).value,0.9);
});
test('CRPS has exact empirical values and retains adverse outcomes',()=>{
 assert.equal(empiricalCRPS([0,1],0),0.25);
 assert.equal(empiricalCRPS([-1,1],0),0.5);
 assert.equal(empiricalCRPS([0,0],0),0);
});
test('calibration changes probabilities only and invalidates after historical evidence changes',()=>{
 const baseline=forecast(input,opts),data=structuredClone(input);
 data.calibration={id:'test',engineVersion:MODEL_VERSION,trainedThrough:'2026-09-16',evidenceKey:calibrationEvidenceKey(input,'2026-09-16'),groups:[{horizon:1,alpha:0,status:'chronologically_selected',auditSelected:{origins:10}}]};
 const calibrated=forecast(data,opts);
 for(let i=0;i<52;i++){
  assert.equal(calibrated.assets[i].rows[1].probUp,0.5);
  assert.deepEqual(calibrated.assets[i].rows.map(r=>[r.p10,r.p50,r.p90]),baseline.assets[i].rows.map(r=>[r.p10,r.p50,r.p90]));
 }
 data.assets[0].prices.find(p=>p.date==='2026-09-16').close*=1.01;
 assert.equal(forecast(data,opts).probabilityCalibration,null);
});
test('story playback reaches all dates, stops on every important news date and ends without looping',()=>{
 const v=forecast(input,opts),stops=buildStory(v),visited=[v.origin],paused=[];
 let date=v.origin;
 for(let i=0;i<100;i++){
  const n=nextPlayback(v.targets,date,stops);if(n.ended)break;
  visited.push(n.date);if(n.stop)paused.push(n.stop.date);date=n.date;
 }
 assert.deepEqual(visited,v.targets);assert.deepEqual(paused,stops.map(s=>s.date));
 assert.ok(stops.every(s=>s.items.every(i=>i.related.length>0&&i.related.every(r=>Number.isFinite(r.importance)))));
});
test('upgrade keeps frozen original, old versions and actions, then is idempotent',async()=>{
 const b=JSON.parse(await fs.readFile(new URL('../public/data/atlas.json',import.meta.url),'utf8'));
 const old=initialState(structuredClone(b));old.modelRevision='atlas-news-3.0.1';delete old.input.calibration;
 const before=JSON.stringify(old.versions.find(v=>v.id===old.original)),count=old.versions.length;
 const next=upgradeState(old,b);
 assert.equal(JSON.stringify(next.versions.find(v=>v.id===next.original)),before);
 assert.ok(next.versions.length>=count);assert.deepEqual(next.actions,old.actions);
 assert.equal(next.modelRevision,b.candidate.modelVersion);assert.equal(upgradeState(next,b),next);
});
