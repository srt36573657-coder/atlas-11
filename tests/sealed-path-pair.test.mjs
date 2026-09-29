import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {buildSealedStudy} from '../lib/sealed-path-pair.mjs';
import {SEALED_ORIGIN,SEALED_END,SEALED_CUTOFF,SEALED_SESSIONS,sealedStudyPolicy} from '../lib/sealed-study-policy.mjs';

const now='2026-09-28T00:00:00Z',digest='a'.repeat(64);
function fixture({event=true,codes=['005930']}={}) {
  const history=[];
  for(let t=Date.parse('2023-01-02');t<Date.parse(SEALED_ORIGIN);t+=86400000){const d=new Date(t);if(d.getUTCDay()!==0&&d.getUTCDay()!==6)history.push(d.toISOString().slice(0,10));}
  const sessions=[...history,...SEALED_SESSIONS];
  const assets=codes.map((code,k)=>({code,name:`Issuer ${code}`,sector:'example',priceSource:{provider:'fixture',url:'https://example.org/prices',priceVintageVerified:true,corporateActionsChecked:true,basisId:'adjusted-v1',observedAt:SEALED_CUTOFF},prices:sessions.filter(d=>d<=SEALED_ORIGIN).map((date,i)=>({date,close:100+10*k+i*.01+Math.sin(i*.7)}))}));
  const samples=Array.from({length:24},(_,i)=>{
    const index=40+i*23,date=sessions[index],value=i%2?.02:-.01;
    return {id:`past-${i}`,economicEventId:`econ-${i}`,assetCode:codes[0],kind:'EARNINGS',phaseId:'result',date,availableAt:`${date}T08:00:00Z`,responseAvailableAt:`${sessions[index+1]}T08:00:00Z`,value,weight:1,baselineContinuous:true,baselineSessions:20,priceVintageVerified:true,corporateActionsChecked:true,windowStart:date,windowEnd:sessions[index+1],additionalResponseVerified:true,sourceDigest:digest,path:[{offsetSessions:0,value:value/2},{offsetSessions:1,value}]};
  });
  const e={id:'event-one',kind:'EARNINGS',name:'Issuer earnings',economicEventId:'earnings-2026q3',phaseId:'result',scope:{type:'company',codes:[codes[0]]},eventDate:'2026-09-22',targetDate:'2026-09-22',status:'scheduled',availableAt:'2026-09-10T07:00:00Z',publishedAt:'2026-09-10T07:00:00Z',originalVintageVerified:true,sources:[{url:'https://example.org/ir/announcement',publisherRole:'issuer',sourceBodyRead:true,primaryPublisherVerified:true,observedAt:'2026-09-10T07:01:00Z'}],sealedReactions:[{assetCode:codes[0],method:'same_issuer_additional_simple_return',knownAt:'2026-09-16T07:00:00Z',protocolFixedAt:'2023-01-02T07:00:00Z',preregistered:true,evidenceDigest:digest,pricedInAdjustmentVerified:true,outcomeIntegrationVerified:true,independenceReviewed:true,samples}]};
  return {input:{calendar:{sessions},assets,events:event?[e]:[],newsRevisions:[],priceRevisions:[]},options:{now,policy:{fixtureUniverse:{testOnly:true,codes}}}};
}
const run=f=>buildSealedStudy(f.input,f.options);

test('fixed 52 real universe creates 104 records, 44 days, origin A and honest B missing',()=>{
  const input=JSON.parse(fs.readFileSync(new URL('../public/data/atlas.json',import.meta.url))).input;
  const before=JSON.stringify(input),study=buildSealedStudy(input,{now});
  assert.equal(study.recordCount,104);assert.equal(study.assets.length,52);assert.equal(study.calendarDays.length,44);assert.equal(study.sessions.length,28);
  assert.equal(study.validARecords,52);assert.equal(study.validBRecords,0);
  for(const a of study.assets){assert.equal(a.rows.length,44);for(const r of a.rows){assert.equal(r.a.price,a.originPrice);assert.equal(r.b.price,null);assert.equal(r.b.status,'UNESTIMABLE');}}
  assert.equal(JSON.stringify(input),before);assert.equal(study.retrospective,true);assert.equal(study.provenance.trustProbability,null);
});

test('additional sample paths compute B on event sessions and preserve effect afterwards',()=>{
  const f=fixture(),s=run(f),a=s.assets[0],rows=new Map(a.rows.map(r=>[r.date,r]));
  assert.equal(s.validBRecords,1,JSON.stringify(a.newsEvidence));
  assert.equal(rows.get('2026-09-21').b.centerReturn,0);
  assert.ok(Math.abs(rows.get('2026-09-22').b.centerReturn-.0025)<1e-14);
  assert.ok(Math.abs(rows.get('2026-09-23').b.centerReturn-.005)<1e-14);
  assert.equal(rows.get('2026-10-30').b.centerReturn,rows.get('2026-09-23').b.centerReturn);
  for(const r of a.rows){assert.ok(Math.abs((r.a.upperReturn-r.a.lowerReturn)-(r.b.upperReturn-r.b.lowerReturn))<1e-14);assert.ok(Math.abs((r.b.upperReturn-r.b.centerReturn)-(r.b.centerReturn-r.b.lowerReturn))<1e-14);}
});

test('post-cutoff news, prices, observations and future duplicate samples cannot alter as-of id or paths',()=>{
  const f=fixture(),original=run(f),later=structuredClone(f);
  later.input.events.push({...structuredClone(f.input.events[0]),availableAt:'2026-09-20T09:00:00Z',targetDate:'2026-09-29',name:'Future conflict'});
  later.input.events[0].sealedReactions[0].samples.push({...structuredClone(f.input.events[0].sealedReactions[0].samples[0]),value:.9,availableAt:'2026-09-19T09:00:00Z'});
  later.input.assets[0].prices.push({date:'2026-09-23',close:100000});
  later.options.now='2026-10-05T00:00:00Z';
  const changed=run(later);assert.equal(changed.id,original.id);assert.deepEqual(changed.assets,original.assets);
});

test('journal replay restores news edits and price edits made after cutoff without mutating input',()=>{
  const f=fixture(),baseline=run(f),changed=structuredClone(f),e=changed.input.events[0],old=structuredClone(e);
  e.targetDate='2026-09-29';changed.input.newsRevisions.push({id:e.id,at:'2026-09-24T00:00:00Z',before:old,after:structuredClone(e)});
  const p=changed.input.assets[0].prices.find(p=>p.date===SEALED_ORIGIN),before=structuredClone(p);p.close*=2;
  changed.input.priceRevisions.push({code:changed.input.assets[0].code,date:p.date,at:'2026-09-24T00:00:00Z',beforeRow:before,afterRow:structuredClone(p)});
  assert.equal(run(changed).id,baseline.id);assert.equal(p.close,before.close*2);
});

test('other-issuer event and sample cannot enter this issuer center',()=>{
  const f=fixture({codes:['005930','009150']}),s=run(f);assert.equal(s.assets[0].rows.at(-1).b.status,'ESTIMATED');assert.equal(s.assets[1].rows.at(-1).b.status,'UNESTIMABLE');
  const changed=structuredClone(f);changed.input.events[0].sealedReactions[0].samples.forEach(s=>s.assetCode='009150');assert.equal(run(changed).validBRecords,0);
});

test('date-only publication and unverified vintage cannot become a numerical B',()=>{
  for(const mutate of [e=>e.publishedAt='2026-09-10',e=>e.originalVintageVerified=false,e=>e.sources[0].observedAt='2026-09-18T07:00:00Z',e=>e.sealedReactions[0].pricedInAdjustmentVerified=false,e=>e.sealedReactions[0].outcomeIntegrationVerified=false]){
    const f=fixture();mutate(f.input.events[0]);const a=run(f).assets[0];assert.equal(a.rows.at(-1).b.status,'UNESTIMABLE');assert.equal(a.rows.at(-1).b.centerReturn,null);
  }
});

test('economic duplicate IDs count once, conflicts and multiple material events with no joint evidence abstain',()=>{
  const f=fixture(),baseline=run(f);f.input.events.push({...structuredClone(f.input.events[0]),id:'republished-id'});
  const s=run(f);assert.equal(s.assets[0].newsEvidence.length,1);assert.equal(s.assets[0].rows.at(-1).b.centerReturn,baseline.assets[0].rows.at(-1).b.centerReturn);assert.equal(s.assets[0].newsEvidence[0].sampleCount,24);
  f.input.events[1].targetDate='2026-09-29';assert.equal(run(f).validBRecords,0);
  const g=fixture();g.input.events.push({...structuredClone(g.input.events[0]),id:'unrelated',economicEventId:'other'});assert.ok(run(g).assets[0].reasons.includes('MATERIAL_SAME_DAY_OVERLAP_UNRESOLVED'));
  const h=fixture();h.input.events.push({...structuredClone(h.input.events[0]),name:'conflict',targetDate:'2026-09-29'});assert.ok(run(h).assets[0].newsEvidence[0].reasons.includes('CONFLICTING_SAME_EVENT_ID'));
});

test('missing 20-session history, overlapping and conflicting sample paths abstain',()=>{
  const f=fixture(),samples=f.input.events[0].sealedReactions[0].samples;
  for(const s of samples){const k=f.input.calendar.sessions.indexOf(s.date);f.input.assets[0].prices=f.input.assets[0].prices.filter(p=>p.date!==f.input.calendar.sessions[k-1]);}
  assert.equal(run(f).validBRecords,0);
  const g=fixture(),ss=g.input.events[0].sealedReactions[0].samples;ss[1].windowStart=ss[0].date;assert.equal(run(g).assets[0].newsEvidence[0].sampleCount,23);
  const h=fixture(),hs=h.input.events[0].sealedReactions[0].samples;hs.push({...structuredClone(hs[0]),id:'conflicting-path',path:[{offsetSessions:0,value:.1},{offsetSessions:1,value:hs[0].value}]});assert.equal(run(h).validBRecords,0);
});

test('holidays carry prior session only; no fake daily price changes or extra trading sessions',()=>{
  const s=run(fixture()),a=s.assets[0],r=a.rows.find(r=>r.date==='2026-09-25'),p=a.rows.find(r=>r.date==='2026-09-23');
  assert.equal(r.isSession,false);assert.equal(r.referenceDate,p.date);assert.deepEqual(r.b,p.b);assert.equal(r.widthReturn,p.widthReturn);
  const f=fixture();f.input.calendar.sessions.push('2026-10-31');f.input.calendar.sessions.sort();assert.equal(run(f).sessions.at(-1),SEALED_END);
});

test('invalid dates, duplicate codes and altered fixed universe/calendar are rejected',()=>{
  const f=fixture();assert.throws(()=>buildSealedStudy(f.input,{now}),/52/);
  const g=fixture();g.input.calendar.sessions.push(g.input.calendar.sessions[0]);assert.throws(()=>run(g),/CALENDAR/);
  const h=fixture();h.input.calendar.sessions=h.input.calendar.sessions.filter(d=>d!=='2026-09-22');assert.throws(()=>run(h),/CALENDAR/);
  assert.throws(()=>sealedStudyPolicy({origin:'2026-09-18'}),/IMMUTABLE/);assert.throws(()=>sealedStudyPolicy({width:{eventMultiplier:2}}),/WIDTH/);
  assert.throws(()=>sealedStudyPolicy({scoring:{magnitudeToleranceReturn:-1}}),/SCORING/);
});

test('missing origin or duplicate price date never coerces to zero; large losses are retained',()=>{
  const f=fixture();f.input.assets[0].prices.push(structuredClone(f.input.assets[0].prices.at(-1)));const a=run(f).assets[0];assert.equal(a.originPrice,null);assert.equal(a.rows[0].a.price,null);
  const g=fixture({event:false});const ps=g.input.assets[0].prices;ps[ps.length-50].close*=.1;const before=run(g).assets[0];assert.ok(before.widthMethod.withinBlockDependenceRetained);assert.equal(before.invalidPrices.length,0);
  const h=fixture({event:false});h.input.assets[0].prices=h.input.assets[0].prices.slice(-10);assert.equal(run(h).assets[0].rows.at(-1).widthReturn,null);
});

test('symmetric invalid negative support is not silently clipped',()=>{
  const f=fixture({event:false}),ps=f.input.assets[0].prices;for(let i=0;i<ps.length;i++)ps[i].close=i%2?1000:1;
  const a=run(f).assets[0],bad=a.rows.find(r=>r.a.lowerReturn < -1);assert.ok(bad);assert.equal(bad.a.bandStatus,'INVALID_PRICE_SUPPORT');assert.equal(bad.a.upperReturn,-bad.a.lowerReturn);
});

test('unverified latest source refresh timestamps do not create a new old-information experiment',()=>{
  const f=fixture({event:false});f.input.assets[0].priceSource.observedAt='2026-09-24T00:00:00Z';const before=run(f);f.input.assets[0].priceSource.observedAt='2026-09-28T00:00:00Z';assert.equal(run(f).id,before.id);assert.equal(before.assets[0].priceBasisStatus,'UNVERIFIED');
});

test('finite extreme prices cannot silently remove overflowing return windows',()=>{
  const f=fixture({event:false}),ps=f.input.assets[0].prices;ps[ps.length-30].close=1e-308;ps[ps.length-29].close=1e308;
  const a=run(f).assets[0];assert.equal(a.invalidPrices.length,0);assert.equal(a.rows.find(r=>r.horizonSessions===1).widthStatus,'NUMERIC_RANGE_ERROR');assert.equal(a.rows.find(r=>r.horizonSessions===1).widthReturn,null);assert.doesNotMatch(JSON.stringify(a),/NaN|Infinity/);
});

test('additional signed losses below minus one are preserved as evidence, not censored samples',()=>{
  const f=fixture(),samples=f.input.events[0].sealedReactions[0].samples;
  for(let i=0;i<samples.length;i++){const value=i%2?.02:-3;samples[i].value=value;samples[i].path=[{offsetSessions:0,value:value/2},{offsetSessions:1,value}];}
  const a=run(f).assets[0];assert.equal(a.newsEvidence[0].sampleCount,24);assert.equal(a.newsEvidence[0].status,'ESTIMATED');assert.ok(a.newsEvidence[0].path.at(-1).value < -1);assert.equal(a.rows.at(-1).b.status,'UNESTIMABLE');assert.ok(a.rows.at(-1).reasons.includes('NEWS_CENTER_INVALID_PRICE_DOMAIN'));
});

test('an explanatory IR calendar cannot create a shock or automatically veto a valid material reaction',()=>{
  const f=fixture();f.input.events.push({...structuredClone(f.input.events[0]),id:'ir-calendar',kind:'COMPANY_IR',economicEventId:'ir-only',sources:[],sealedReactions:[]});
  const a=run(f).assets[0];assert.equal(a.newsEvidence.find(e=>e.eventId==='ir-calendar').status,'CONTEXT_ONLY');assert.equal(a.rows.at(-1).b.status,'ESTIMATED');assert.ok(Math.abs(a.rows.at(-1).b.centerReturn-.005)<1e-14);
});
