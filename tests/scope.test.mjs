import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import {forecast,gateEvents,sourceDataDigest} from '../lib/news-engine.mjs';
import {scopeErrors,appliesTo,scopeOf} from '../lib/news-scope.mjs';
import {mergeNews} from '../lib/news-sources.mjs';
import {buildStory,newPlayer,advancePlayer} from '../lib/story.mjs';
import {calibrationEvidenceKey} from '../lib/probability.mjs';
import {MODEL_VERSION} from '../lib/news-engine.mjs';
const input=JSON.parse(await fs.readFile(new URL('./fixtures/input-v3.json',import.meta.url),'utf8'));
const opts={paths:2000,seed:1717,createdAt:'2026-09-24T00:00:00Z'};
const A=input.assets[0],B=input.assets[1],cutoff=input.origin+'T16:00:00+09:00';
// Synthetic unit-test evidence only: recognized economic event and explicit primary-body proof.
// These reserved example-domain fixtures are never installed as real company news.
const corporate={id:'TEST:future:A',kind:'COMPANY_EARNINGS',name:'TEST ONLY company earnings',announcementDate:'2026-10-01',targetDate:'2026-10-01',availableAt:'2026-09-01T00:00:00Z',status:'scheduled',sources:[{url:'https://test-issuer.example/ir/test-only',publisherRole:'issuer',primaryPublisherVerified:true,sourceBodyRead:true,attestedAt:'2024-01-01T00:00:00Z'}],scope:{type:'company',codes:[A.code]}};
function withHistory(){
 const data=structuredClone(input),occupied=new Set(input.events.map(e=>e.targetDate));
 const dates=input.calendar.sessions.filter(d=>d>='2025-02-01'&&d<input.origin&&!occupied.has(d)).filter((d,i)=>i%15===0).slice(-14);
 data.events.push(...dates.map((d,i)=>({...corporate,id:'TEST:past:'+i,announcementDate:d,targetDate:d,availableAt:d+'T00:00:00Z'})));
 return data;
}
test('market, index, sector and company route only to explicit eligible targets; unknown all fails closed',()=>{
 assert.equal(appliesTo(corporate,A),true);assert.equal(appliesTo(corporate,B),false);
 const sector={...corporate,scope:{type:'sector',sectors:[A.sector]}};
 assert.equal(appliesTo(sector,A),true);assert.equal(appliesTo(sector,B),false);
 assert.deepEqual(scopeErrors(sector,input.assets,cutoff),[]);
 const index={...corporate,scope:{type:'index',name:'TEST index',codes:[B.code],membership:{url:'https://example.com/membership',availableAt:'2026-08-01T00:00:00Z',effectiveFrom:'2026-09-01',effectiveTo:'2026-12-31'}}};
 assert.deepEqual(scopeErrors(index,input.assets,cutoff),[]);assert.equal(appliesTo(index,A),false);assert.equal(appliesTo(index,B),true);
 const unknown={...corporate,scope:undefined,target:'all'};
 assert.ok(scopeErrors(unknown,input.assets,cutoff).length);
 assert.ok(scopeErrors({...index,scope:{...index.scope,membership:{...index.scope.membership,availableAt:'2026-10-01T00:00:00Z'}}},input.assets,cutoff).length);
 assert.ok(scopeErrors({...sector,scope:{type:'sector',sectors:['misspelled sector']}},input.assets,cutoff).length);
 const gate=gateEvents({...input,events:[corporate,sector,index,unknown]},input.origin,cutoff);
 assert.equal(gate.accepted.length,0); // Conflicting descriptions under one ID all fail closed.
 assert.equal(gate.rejected.length,4);
});
test('company future event changes only its own price distribution and story',()=>{
 const data=withHistory(),before=forecast(data,opts);data.events.push(corporate);const after=forecast(data,opts);
 const changed=after.assets.find(a=>a.code===A.code),original=before.assets.find(a=>a.code===A.code);
 const profile=changed.news.find(p=>p.id===corporate.id);assert.ok(profile.used);assert.ok(profile.sampleCount>=5);
 assert.notDeepEqual(changed.rows,original.rows);
 assert.deepEqual(changed.rows.filter(r=>r.date<corporate.targetDate),original.rows.filter(r=>r.date<corporate.targetDate));
 for(const asset of after.assets.filter(a=>a.code!==A.code)){
  const previous=before.assets.find(a=>a.code===asset.code);
  assert.deepEqual(asset.rows,previous.rows);assert.deepEqual(asset.news,previous.news);assert.deepEqual(asset.training,previous.training);
  assert.ok(buildStory(after,asset.code).every(s=>s.items.every(i=>i.event.id!==corporate.id)));
 }
 assert.deepEqual(buildStory(after,A.code).flatMap(s=>s.items).flatMap(i=>i.related).map(r=>r.code).filter(c=>c!==A.code),[]);
});
test('company historical evidence cannot change the other 51 stocks, including their macro samples',()=>{
 const before=forecast(input,opts),after=forecast(withHistory(),opts);
 for(const asset of after.assets.filter(a=>a.code!==A.code)){
  const previous=before.assets.find(a=>a.code===asset.code);
  assert.deepEqual(asset.rows,previous.rows);assert.deepEqual(asset.news,previous.news);assert.deepEqual(asset.training,previous.training);
 }
});
test('sector event computes only matching sector; overlapping events are visibly held',()=>{
 const data=withHistory();
 for(const e of data.events.filter(e=>e.kind===corporate.kind))e.scope={type:'sector',sectors:[A.sector]};
 const sector={...corporate,id:'TEST:sector',scope:{type:'sector',sectors:[A.sector]}};
 data.events.push(sector);
 const one=forecast(data,opts);assert.ok(one.assets.find(a=>a.code===A.code).news.find(p=>p.id===sector.id).used);
 assert.ok(one.assets.filter(a=>a.code!==A.code).every(a=>!a.news.some(p=>p.id===sector.id)));
 data.events.push({...corporate,id:'TEST:overlap'});
 const two=forecast(data,opts),a=two.assets.find(a=>a.code===A.code);
 assert.ok(a.news.filter(p=>p.date===corporate.targetDate).every(p=>!p.used&&p.effect===null&&p.reason.includes('복수 사건')));
 assert.deepEqual(a.rows.find(r=>r.date===corporate.targetDate).eventIds,[]);
});
test('target changes invalidate source digest and are retained as a news revision',()=>{
 const data={...input,events:[...input.events,corporate]};
 const changed={...corporate,scope:{type:'company',codes:[B.code]}};
 const merged=mergeNews(data,[changed],[],'2026-09-16T00:00:00Z');
 assert.notEqual(sourceDataDigest(data,input.origin,cutoff),sourceDataDigest(merged,input.origin,cutoff));
 assert.equal(merged.newsRevisions.length,1);assert.deepEqual(scopeOf(merged.events.find(e=>e.id===corporate.id)).codes,[B.code]);
 assert.deepEqual(corporate.scope.codes,[A.code]);
});
test('index event estimates only documented members using same-index historical reactions',()=>{
 const data=withHistory();
 const scope={type:'index',name:'TEST ONLY index',codes:[A.code],membership:{url:'https://example.com/test-membership',availableAt:'2024-01-01T00:00:00Z',effectiveFrom:'2024-01-01',effectiveTo:'2026-12-31'}};
 for(const e of data.events.filter(e=>e.kind===corporate.kind))e.scope=structuredClone(scope);
 const before=forecast(data,opts);data.events.push({...corporate,id:'TEST:index',scope});const after=forecast(data,opts);
 assert.ok(after.assets.find(a=>a.code===A.code).news.find(p=>p.id==='TEST:index').used);
 assert.notDeepEqual(after.assets.find(a=>a.code===A.code).rows,before.assets.find(a=>a.code===A.code).rows);
 for(const a of after.assets.filter(a=>a.code!==A.code))assert.deepEqual(a.rows,before.assets.find(x=>x.code===a.code).rows);
});
test('stock clock is independent; news stays paused and end does not loop',()=>{
 const dates=['2026-09-17','2026-09-18','2026-09-21'],stops=[{date:dates[1],items:[]}];
 const a={...newPlayer(dates[0]),playing:true,session:true},b=newPlayer(dates[0]),snapshot=structuredClone(b);
 const paused=advancePlayer(a,dates,stops);assert.equal(paused.date,dates[1]);assert.equal(paused.playing,false);assert.ok(paused.stop);
 assert.equal(advancePlayer(paused,dates,stops),paused);assert.deepEqual(b,snapshot);
 const ended=advancePlayer({...paused,playing:true,stop:null},dates,stops);assert.equal(ended.date,dates[2]);assert.equal(ended.session,false);assert.equal(ended.playing,false);
 assert.equal(advancePlayer(ended,dates,stops),ended);
});
test('calibration invalidation is per stock; new company evidence does not reset other stocks probabilities',()=>{
 const data=structuredClone(input),trainedThrough='2026-09-16';
 data.calibration={id:'TEST:per-stock',engineVersion:MODEL_VERSION,trainedThrough,
  evidenceKey:calibrationEvidenceKey(data,trainedThrough),
  assetEvidenceKeys:Object.fromEntries(data.assets.map(a=>[a.code,calibrationEvidenceKey(data,trainedThrough,a.code)])),
  supportedScopes:['market'],groups:[{horizon:1,alpha:0,status:'chronologically_selected',auditSelected:{origins:10}}]};
 const before=forecast(data,opts);
 const changed=withHistory();changed.calibration=data.calibration;const after=forecast(changed,opts);
 assert.equal(after.assets.find(a=>a.code===A.code).probabilityCalibrationId,null);
 for(const a of after.assets.filter(a=>a.code!==A.code)){
  assert.equal(a.probabilityCalibrationId,data.calibration.id);
  assert.deepEqual(a.rows,before.assets.find(x=>x.code===a.code).rows);
 }
});
