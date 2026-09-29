// Independent audit regressions. Synthetic evidence only; not real-market accuracy.
import test from 'node:test';
import assert from 'node:assert/strict';
import {buildSealedStudy} from '../lib/sealed-path-pair.mjs';
import {SEALED_ORIGIN,SEALED_CUTOFF,SEALED_SESSIONS} from '../lib/sealed-study-policy.mjs';
import {sealStudy} from '../lib/sealed-manifest.mjs';
import {buildDailyStudyReport} from '../lib/daily-score-report.mjs';
const digest='b'.repeat(64),now='2026-09-28T00:00:00Z';
function fixture(){
  const past=[];for(let n=Date.parse('2023-01-02');n<Date.parse(SEALED_ORIGIN);n+=86400000){const d=new Date(n);if(d.getUTCDay()%6!==0)past.push(d.toISOString().slice(0,10));}
  const sessions=[...past,...SEALED_SESSIONS],prices=sessions.filter(d=>d<=SEALED_ORIGIN).map((date,i)=>({date,close:100+i*.01+Math.sin(i*.7)}));
  const samples=Array.from({length:24},(_,i)=>{const at=40+i*23,date=sessions[at],value=i%2?.02:-.01;return {id:'sample-'+i,economicEventId:'past-'+i,assetCode:'005930',kind:'EARNINGS',phaseId:'result',date,availableAt:date+'T08:00:00Z',responseAvailableAt:sessions[at+1]+'T08:00:00Z',value,weight:1,baselineContinuous:true,baselineSessions:20,priceVintageVerified:true,corporateActionsChecked:true,windowStart:date,windowEnd:sessions[at+1],additionalResponseVerified:true,sourceDigest:digest,path:[{offsetSessions:0,value:value/2},{offsetSessions:1,value}]};});
  const source={url:'https://example.org/ir/a',publisherRole:'issuer',sourceBodyRead:true,primaryPublisherVerified:true,observedAt:'2026-09-10T07:01:00Z'};
  const event={id:'audit-event',kind:'EARNINGS',name:'Synthetic result event',economicEventId:'future-result',phaseId:'result',scope:{type:'company',codes:['005930']},eventDate:'2026-09-22',targetDate:'2026-09-22',status:'scheduled',availableAt:'2026-09-10T07:00:00Z',publishedAt:'2026-09-10T07:00:00Z',originalVintageVerified:true,sources:[source],sealedReactions:[{assetCode:'005930',method:'same_issuer_additional_simple_return',knownAt:'2026-09-16T07:00:00Z',protocolFixedAt:'2023-01-02T07:00:00Z',preregistered:true,evidenceDigest:digest,pricedInAdjustmentVerified:true,outcomeIntegrationVerified:true,independenceReviewed:true,samples}]};
  return {input:{calendar:{sessions},assets:[{code:'005930',name:'Audit issuer',sector:'test',priceSource:{provider:'fixture',url:'https://example.org/prices',priceVintageVerified:true,corporateActionsChecked:true,basisId:'same-basis',observedAt:SEALED_CUTOFF},prices}],events:[event],newsRevisions:[],priceRevisions:[],actualAsOf:'2026-09-18'},options:{now,policy:{fixtureUniverse:{testOnly:true,codes:['005930']}}}};
}
test('audit: accepted sample weights change the news-only center by weighted mean',()=>{
  const f=fixture(),plain=buildSealedStudy(f.input,f.options);assert.equal(plain.validBRecords,1);
  for(const sample of f.input.events[0].sealedReactions[0].samples)sample.weight=sample.value>0?.5:1;
  const weighted=buildSealedStudy(f.input,f.options);assert.equal(weighted.validBRecords,1);
  assert.ok(Math.abs(weighted.assets[0].rows.at(-1).b.centerReturn)<1e-14);
  assert.ok(Math.abs(plain.assets[0].rows.at(-1).b.centerReturn-.005)<1e-14);
});
test('audit: rejected other-issuer sample never poisons the accepted issuer path',()=>{
  const f=fixture(),before=buildSealedStudy(f.input,f.options),samples=f.input.events[0].sealedReactions[0].samples;
  const foreign=structuredClone(samples[0]);Object.assign(foreign,{id:'foreign',assetCode:'009150',value:.8,path:[{offsetSessions:0,value:.4},{offsetSessions:1,value:.8}]});samples.unshift(foreign);
  const after=buildSealedStudy(f.input,f.options);assert.equal(after.validBRecords,1);
  assert.deepEqual(after.assets[0].rows.map(r=>r.b),before.assets[0].rows.map(r=>r.b));
});
test('audit: source order does not manufacture another semantically identical study',()=>{
  const f=fixture();f.input.events[0].sources.push({...f.input.events[0].sources[0],url:'https://example.org/ir/b'});
  const before=buildSealedStudy(f.input,f.options);f.input.events[0].sources.reverse();const after=buildSealedStudy(f.input,f.options);
  assert.equal(after.id,before.id);assert.equal(after.provenance.inputDigest,before.provenance.inputDigest);
});
test('audit: conflicting same-ID source attestations fail closed independent of record order',()=>{
  const f=fixture(),contradiction=structuredClone(f.input.events[0]);
  contradiction.sources[0].primaryPublisherVerified=false;contradiction.sources[0].sourceBodyRead=false;
  f.input.events.push(contradiction);const before=buildSealedStudy(f.input,f.options);
  f.input.events.reverse();const after=buildSealedStudy(f.input,f.options);
  assert.equal(before.validBRecords,0);assert.equal(after.validBRecords,0);
  assert.equal(after.id,before.id);assert.equal(after.provenance.inputDigest,before.provenance.inputDigest);
});
test('audit: explicit suspect/missing/conflicted prices cannot be scored as actual closes',()=>{
  const f=fixture(),study=sealStudy(buildSealedStudy(f.input,f.options));
  for(const flags of [{quality:'suspect'},{quality:'missing'},{conflict:true}]){
    const input=structuredClone(f.input);input.assets[0].prices.push({date:'2026-09-18',close:110,observedAt:'2026-09-18T08:00:00Z',...flags});
    const report=buildDailyStudyReport(study,input,{date:'2026-09-18',now});
    assert.equal(report.rows[0].a,null);assert.equal(report.rows[0].observed.a,null);assert.equal(report.rows[0].actual,null);
  }
});
test('audit: report cannot display one forecast price while grading a different return',()=>{
  const f=fixture(),unsealed=buildSealedStudy(f.input,f.options);
  unsealed.assets[0].rows.find(r=>r.date==='2026-09-18').a.price*=1.5;
  const study=sealStudy(unsealed),input=structuredClone(f.input);
  input.assets[0].prices.push({date:'2026-09-18',close:110,observedAt:'2026-09-18T08:00:00Z'});
  const report=buildDailyStudyReport(study,input,{date:'2026-09-18',now});
  assert.equal(report.rows[0].a,null);assert.equal(report.rows[0].observed.a,null);
});
