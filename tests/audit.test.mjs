import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import {forecast,gateEvents,reactionSample,historicalEvents} from '../lib/news-engine.mjs';
import {scopeKey} from '../lib/news-scope.mjs';
import {eventsAsOf,pricesAsOf,evidenceStatus} from '../lib/evidence.mjs';
import {mergeNews} from '../lib/news-sources.mjs';
import {nonOverlappingOrigins,blockInterval,intervalScore} from '../lib/audit.mjs';
const input=JSON.parse(await fs.readFile(new URL('./fixtures/input-v3.json',import.meta.url),'utf8'));
const options={origin:input.actualAsOf,paths:2000,seed:1717,informationCutoff:input.informationAsOf,createdAt:'2026-09-24T00:00:00Z'};
test('large genuine losses remain in stock and common-day distributions; no amplitude deletion',()=>{
  const v=forecast(input,options),a=v.assets.find(a=>a.code==='028300');
  assert.ok(a.training.retainedExtremeDays.includes('2026-07-10'));
  assert.ok(a.training.retainedExtremeDays.includes('2026-07-13'));
  assert.ok(v.assets.every(a=>a.training.ordinaryDates.includes('2026-07-10')));
  const raw=input.assets.find(a=>a.code==='028300').prices;
  assert.ok(raw.find(p=>p.date==='2026-07-10').close/raw.find(p=>p.date==='2026-07-09').close-1<-.29);
});
test('revised news retains a deep copy of the old record and reconstructs the earlier forecast',()=>{
  const e=input.events.find(e=>e.targetDate==='2026-09-30'),oldText=JSON.stringify(e),cutoff='2026-09-24T23:59:59Z';
  const changed={...e,targetDate:'2026-10-01',announcementDate:'2026-09-30'};
  const merged=mergeNews(input,[changed],[],'2026-09-25T12:00:00Z');
  const revision=merged.newsRevisions.at(-1);
  assert.equal(JSON.stringify(revision.before),oldText);
  assert.equal(eventsAsOf(merged,cutoff).find(x=>x.id===e.id).targetDate,'2026-09-30');
  assert.equal(eventsAsOf(merged,'2026-09-26T12:00:00Z').find(x=>x.id===e.id).targetDate,'2026-10-01');
  assert.deepEqual(forecast(merged,{...options,informationCutoff:cutoff}),forecast(input,{...options,informationCutoff:cutoff}));
});
test('logged later price corrections cannot leak into an earlier as-of forecast',()=>{
  const revised=structuredClone(input),p=revised.assets[0].prices.find(p=>p.date==='2026-09-16');
  revised.priceRevisions=[{code:revised.assets[0].code,date:p.date,before:p.close,after:p.close*1.2,at:'2026-09-25T12:00:00Z'}];p.close*=1.2;
  assert.equal(pricesAsOf(revised,options.informationCutoff)[0].prices.find(p=>p.date==='2026-09-16').close,input.assets[0].prices.find(p=>p.date==='2026-09-16').close);
  assert.deepEqual(forecast(revised,options),forecast(input,options));
});
test('hidden future duplicate and invalid historical sources cannot alter accepted samples or price rows',()=>{
  const data=structuredClone(input),e=data.events.find(e=>e.targetDate==='2026-09-30');
  data.events.unshift({...e,name:'unknown revision',availableAt:'2026-10-01T00:00:00Z'});
  const past=input.calendar.sessions.filter(d=>d<'2026-09-17'&&!input.events.some(e=>e.targetDate===d)).at(-5);
  data.events.push({...e,id:'TEST:invalid-history',targetDate:past,announcementDate:past,availableAt:'2025-01-01T00:00:00Z',sources:[]});
  const a=forecast(input,options),b=forecast(data,options);
  assert.deepEqual(b.assets,a.assets);assert.equal(b.dataDigest,a.dataDigest);
});
test('same event under another ID is deduplicated, while semantically equal scope order is stable',()=>{
  const data=structuredClone(input),e=data.events.find(e=>e.targetDate==='2026-09-30');data.events.push({...e,id:'ZZZ:duplicate'});
  const g=gateEvents(data,input.origin,options.informationCutoff);
  assert.equal(g.accepted.filter(x=>x.targetDate===e.targetDate&&x.kind===e.kind).length,1);
  assert.ok(g.rejected.some(r=>r.reasons.some(s=>s.includes('동일 사건'))));
  assert.deepEqual(forecast(data,options).assets,forecast(input,options).assets);
  assert.equal(scopeKey({scope:{type:'company',codes:['005930','009150']}}),scopeKey({scope:{codes:['009150','005930'],type:'company'}}));
});
test('a missing prior session cannot be silently replaced by an older return in an event sample',()=>{
  const a=structuredClone(input.assets[0]),e=input.events.find(e=>e.kind==='FOMC'&&e.targetDate>'2026-06-01'&&e.targetDate<input.origin);
  const histories=historicalEvents(input,input.origin,options.informationCutoff),before=reactionSample(a,e,histories,input.calendar.sessions,input.origin);
  const sample=before.samples.at(-1);assert.ok(sample);
  const gap=input.calendar.sessions[input.calendar.sessions.indexOf(sample.date)-5];a.prices=a.prices.filter(p=>p.date!==gap);
  const after=reactionSample(a,e,histories,input.calendar.sessions,input.origin);
  assert.ok(!after.samples.some(s=>s.date===sample.date));assert.ok(after.excluded.some(s=>s.date===sample.date&&s.reason.includes('연속')));
});
test('Monte Carlo error and source counts cannot become a fabricated trust percentage',()=>{
  const v=forecast(input,options);
  assert.equal(v.trustProbability,null);assert.ok(v.assets.every(a=>a.evidence.direction==='abstain'&&a.evidence.trustProbability===null));
  const r=v.assets[0].rows.at(-1);assert.equal(r.probabilityMonteCarloSE,Math.sqrt(r.rawProbUp*(1-r.rawProbUp)/options.paths));
  assert.ok(r.medianMonteCarlo95[0]<=r.p50&&r.medianMonteCarlo95[1]>=r.p50);
  assert.equal(evidenceStatus({newsByScope:{company:9999,sector:9999},eventsUsed:9999,news:[]}).trustProbability,null);
});
test('evaluation windows are disjoint; bootstrap works on date clusters and proper interval scores penalize misses',()=>{
  const folds=[{origin:'2025-01-01',end:'2025-02-01'},{origin:'2025-01-15',end:'2025-02-15'},{origin:'2025-02-02',end:'2025-03-01'}];
  assert.deepEqual(nonOverlappingOrigins(folds),['2025-01-01','2025-02-02']);
  const ci=blockInterval([1,1,1],{replications:100,seed:1});assert.equal(ci.groups,3);assert.equal(ci.low,1);assert.equal(ci.high,1);
  assert.equal(intervalScore(0,1,.5),1);assert.equal(intervalScore(0,1,2),11);
});
