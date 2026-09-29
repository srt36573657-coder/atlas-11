import test from 'node:test';
import assert from 'node:assert/strict';
import {assessEvent,assessCoverage52,assessSameDayOverlap,eventClusterKey,sampleEvidence,wilsonInterval} from '../lib/event-evidence-v7.mjs';
const cutoff='2026-09-26T13:00:00Z';
const asset={code:'033780',name:'KT&G',sector:'tobacco'};
const source={url:'https://issuer.example/notice/123',publisherRole:'issuer',primaryPublisherVerified:true,sourceBodyRead:true,observedAt:'2026-09-25T00:00:00Z'};
const base=()=>({id:'earnings-1',name:'Earnings announcement',kind:'EARNINGS',eventDate:'2026-10-06',announcementDate:'2026-10-06',targetDate:'2026-10-06',availableAt:'2026-09-25T00:00:00Z',status:'scheduled',scope:{type:'company',codes:[asset.code]},sources:[source]});
const opts={cutoff,assets:[asset],sessions:['2026-10-06']};
const sample=(n,extra={})=>({id:`s-${n}`,code:asset.code,kind:'EARNINGS',date:`2026-08-${String(n).padStart(2,'0')}`,availableAt:'2026-09-01T00:00:00Z',responseAvailableAt:'2026-09-01T00:00:00Z',value:n%2?.01:-.01,baselineContinuous:true,baselineSessions:20,priceVintageVerified:true,corporateActionsChecked:true,...extra});

test('economic candidate is not probability validation or an approved price shift',()=>{
 const a=assessEvent(base(),asset,opts);
 assert.equal(a.classification,'price_evidence_candidate'); assert.equal(a.scheduleVerified,true);
 assert.equal(a.statisticalEligibility.eligibleForResearchEstimation,false);
 assert.equal(a.trustProbability,null);assert.equal(a.numericImpactAllowed,false);assert.equal(a.direction,'abstain');
});
test('52 calendar slots are not a quota of price-affecting events',()=>{
 const e={...base(),kind:'COMPANY_PROPERTY_CONTRACT_WINDOW'}; const a=assessEvent(e,asset,opts);
 assert.equal(a.classification,'context_only');assert.equal(a.scheduleVerified,true);
 for(const kind of ['COMPANY_IR','COMPANY_REDISCLOSURE','COMPANY_EXHIBITION','COMPANY_POPUP_ANGGAE_SEONGSU','INDUSTRY_SEDEX-2026'])assert.equal(assessEvent({...e,kind},asset,opts).classification,'context_only');
});
test('explicit economic evidence may promote context to research candidate, never price certainty',()=>{
 const e={...base(),kind:'COMPANY_PROPERTY_CONTRACT_WINDOW',materialityEvidence:{verified:true,publisherRole:'issuer',sourceUrl:source.url,observedAt:source.observedAt,economicChannel:'Signed contract amount relative to last audited revenue',evidenceLocation:'Section 2',amount:100,unit:'KRW'}};
 assert.equal(assessEvent(e,asset,opts).classification,'price_evidence_candidate');
 e.materialityEvidence.observedAt='2026-10-20T00:00:00Z';assert.equal(assessEvent(e,asset,opts).classification,'context_only');
});
test('unknown general calendar does not become market news',()=>{
 const e={...base(),kind:'UNKNOWN',scope:{type:'market'}};
 const a=assessEvent(e,asset,opts);assert.equal(a.classification,'abstain');assert.ok(a.reasons.includes('INVALID_SCOPE_OR_MEMBERSHIP'));
});
test('HTTPS homepage without explicit primary-body verification is insufficient',()=>{
 const e={...base(),sources:[{url:'https://issuer.example/'}]};assert.equal(assessEvent(e,asset,opts).classification,'abstain');
});
test('retained source-body review preserves documented legacy schedule without claiming current refetch',()=>{
 const e={...base(),sources:[{url:source.url}],reviewReleaseId:'official-news-20260926-6',reviewEvidence:{eventDate:'2026-10-06',targetDate:'2026-10-06',sources:[{url:source.url,verification:'The original corporate calendar body stated October 6.'}]}};
 const a=assessEvent(e,asset,opts);assert.equal(a.scheduleVerified,true);assert.equal(a.source.basis,'retained_review_attestation');assert.equal(a.source.vintageVerified,false);
});
test('future availability and withdrawn event never count as verified',()=>{
 assert.equal(assessEvent({...base(),availableAt:'2026-10-01T00:00:00Z'},asset,opts).scheduleVerified,false);
 assert.equal(assessEvent({...base(),status:'withdrawn'},asset,opts).scheduleVerified,false);
});
test('duplicate articles and reordered scope do not multiply economic event count',()=>{
 const a={...base(),scope:{type:'company',codes:['005930',asset.code]}};
 const b={...a,id:'repost',name:'New headline',sources:[source,{...source,url:'https://issuer.example/repost'}],scope:{codes:[asset.code,'005930'],type:'company'}};
 assert.equal(eventClusterKey(a),eventClusterKey(b));
});
test('another issuer cannot contaminate target history even for same-day same-kind news',()=>{
 const r=sampleEvidence(base(),asset,[sample(1,{code:'005930'}),sample(2)],{cutoff});
 assert.equal(r.independentDateClusters,1);assert.ok(r.excluded[0].reasons.includes('OTHER_ISSUER_OR_UNSCOPED_SAMPLE'));
});
test('same date is one cluster; duplicate rows do not tighten precision',()=>{
 const s=sample(1), a=sampleEvidence(base(),asset,[s],{cutoff}), b=sampleEvidence(base(),asset,Array.from({length:500},(_,i)=>({...s,id:`copy-${i}`})),{cutoff});
 assert.equal(b.effectiveSampleSize,1);assert.deepEqual(a.historicalFrequencyInterval,b.historicalFrequencyInterval);
});
test('conflicting same-date returns and return windows are excluded, independent of row order',()=>{
 const s=sample(1);for(const t of [{...s,value:-.1},{...s,windowEnd:'2026-08-02'}]){
  assert.equal(sampleEvidence(base(),asset,[s,t],{cutoff}).independentDateClusters,0);
  assert.equal(sampleEvidence(base(),asset,[t,s],{cutoff}).independentDateClusters,0);
 }
});
test('large signed returns are retained; vintage and discontinuity are explicit exclusions',()=>{
 const r=sampleEvidence(base(),asset,[sample(1,{value:-.7}),sample(2,{value:.8}),sample(3,{priceVintageVerified:false}),sample(4,{baselineContinuous:false})],{cutoff});
 assert.deepEqual(r.clusters.map(s=>s.value),[-.7,.8]);assert.equal(r.excluded.length,2);
});
test('overlapping response windows do not inflate independent event count',()=>{
 const r=sampleEvidence(base(),asset,[sample(1,{windowEnd:'2026-08-02'}),sample(2),sample(3)],{cutoff});
 assert.equal(r.independentDateClusters,2);assert.ok(r.excluded.some(s=>s.reasons.includes('OVERLAPPING_RESPONSE_WINDOW')));
});
test('five observations are not evidence of validated precision; gate must be declared beforehand',()=>{
 const ss=Array.from({length:5},(_,i)=>sample(i+1));
 const a=sampleEvidence(base(),asset,ss,{cutoff,precision:{maxFrequencyHalfWidth:.05,independenceReviewed:true,protocolFixedBeforeOutcomes:true}});
 assert.equal(a.eligibleForResearchEstimation,false);assert.ok(a.historicalFrequencyInterval.halfWidth>.05);
});
test('Wilson interval stays bounded at all-positive and all-negative edges',()=>{
 for(let n=1;n<=100;n++)for(const p of [0,n/2,n]){const x=wilsonInterval(p,n);assert.ok(x.low>=0&&x.high<=1&&x.low<=x.high);}
 assert.equal(wilsonInterval(2,1),null);assert.equal(wilsonInterval(0,0),null);
});
test('context-only KT&G window does not veto JOBS but remains a confounding warning',()=>{
 const macro={...base(),id:'jobs',kind:'JOBS',provider:'BLS',scope:{type:'market'},sources:[{url:'https://www.bls.gov/schedule/2026/10_sched.htm'}]};
 const ctx={...base(),id:'property',kind:'COMPANY_PROPERTY_CONTRACT_WINDOW'};
 const a=assessSameDayOverlap(macro,[ctx],asset,opts);
 assert.equal(a.attributableToSingleEvent,true);assert.equal(a.contextWarnings.length,1);assert.equal(a.blocking.length,0);
 const b=assessSameDayOverlap(macro,[base()],asset,opts);assert.equal(b.attributableToSingleEvent,false);
});
test('future overlapping events cannot change past overlap decisions',()=>{
 const a=assessSameDayOverlap(base(),[{...base(),id:'future',availableAt:'2026-10-07T00:00:00Z'}],asset,opts);
 assert.equal(a.blocking.length,0);assert.equal(a.contextWarnings.length,0);
});
test('subsidiary mapping is explicitly non-independent and requires ownership source',()=>{
 const e={...base(),kind:'COMPANY_SUBSIDIARY_EXHIBITION_FAKUMA',throughSubsidiary:{company:'Subsidiary',ownershipSource:'https://issuer.example/subsidiaries'}};
 const a=assessEvent(e,asset,opts);assert.equal(a.classification,'context_only');assert.ok(a.warnings.includes('SUBSIDIARY_CONTEXT_NOT_INDEPENDENT_PARENT_NEWS'));
 e.throughSubsidiary.ownershipSource=null;assert.equal(assessEvent(e,asset,opts).classification,'abstain');
});
test('coverage validates all 52, deduplicates articles and excludes unknown future conflicts',()=>{
 const assets=[asset,...Array.from({length:51},(_,i)=>({code:String(i).padStart(6,'0'),name:`Issuer${i}`,sector:'other'}))];
 const event=base();const dup={...event,id:'copy',name:'headline repost'};
 const r=assessCoverage52([event,dup],assets,{cutoff});assert.equal(r.assetCount,52);assert.equal(r.rows[0].sourceRecordCount,2);assert.equal(r.rows[0].uniqueEventClusters,1);assert.equal(r.fixedNewsQuota,null);
 const conflict={...event,targetDate:'2026-10-07'};assert.equal(assessCoverage52([event,conflict],assets,{cutoff}).rows[0].scheduleVerified,0);
 conflict.availableAt='2026-10-01T00:00:00Z';assert.equal(assessCoverage52([event,conflict],assets,{cutoff}).rows[0].scheduleVerified,1);
 assert.throws(()=>assessCoverage52([],assets.slice(1),{cutoff}),/52/);
});

test('retained registry is explicit and cannot verify a completely unreferenced event',()=>{
 const e={...base(),sources:[{url:source.url}],reviewReleaseId:'official-news-20260926-7'};
 assert.equal(assessEvent(e,asset,{...opts,attestedEventIds:[e.id]}).source.basis,'retained_review_registry');
 assert.equal(assessEvent({...e,reviewReleaseId:undefined},asset,{...opts,attestedEventIds:[e.id]}).scheduleVerified,false);
});
test('record date remains context rather than an invented ex-dividend price shock',()=>{
 assert.equal(assessEvent({...base(),kind:'DIVIDEND_RECORD'},asset,opts).classification,'context_only');
});
test('event fingerprint reacts to materiality/proof changes and ignores mere fetch metadata',async()=>{
 const {policyFingerprint}=await import('../lib/event-evidence-v7.mjs');
 const e=base(), before=policyFingerprint(e);
 assert.equal(policyFingerprint({...e,sources:[{...source,retrievedAt:'2026-10-01T00:00:00Z',lastFetchedAt:'2026-10-02T00:00:00Z'}]}),before);
 assert.notEqual(policyFingerprint({...e,materialityEvidence:{verified:true}}),before);
 assert.notEqual(policyFingerprint({...e,sources:[{...source,sourceBodyRead:false}]}),before);
});
test('duplicate source order cannot hide an available verified primary body',()=>{
 const assets=[asset,...Array.from({length:51},(_,i)=>({code:String(i).padStart(6,'0'),name:`Issuer${i}`,sector:'other'}))];
 const a=base(),b={...a,id:'unverified-repost',sources:[{url:'https://press.example/repost'}]};
 for(const order of [[a,b],[b,a]]){const r=assessCoverage52(order,assets,{cutoff});assert.equal(r.rows[0].scheduleVerified,1);assert.equal(r.rows[0].uniqueEventClusters,1);}
});

test('one economic occurrence relabeled on two dates is not two independent observations',()=>{
 const a=sample(1,{economicEventId:'contract-42'}),b=sample(2,{economicEventId:'contract-42'});
 const r=sampleEvidence(base(),asset,[a,b,sample(3)],{cutoff});
 assert.equal(r.independentDateClusters,1);assert.equal(r.excluded.filter(x=>x.reasons.includes('SAME_ECONOMIC_OCCURRENCE_HAS_CONFLICTING_RESPONSE_DATES')).length,2);
});

test('explicit economic event stays one occurrence across legitimate dated phases',()=>{
 const assets=[asset,...Array.from({length:51},(_,i)=>({code:String(i).padStart(6,'0'),name:`Issuer${i}`,sector:'other'}))];
 const first={...base(),id:'capital-record',kind:'CAPITAL_INCREASE',economicEventId:'rights-issue-2026',phase:'record-date'};
 const second={...first,id:'capital-listing',phase:'new-share-listing',eventDate:'2026-10-28',announcementDate:'2026-10-28',targetDate:'2026-10-28'};
 assert.equal(eventClusterKey(first),eventClusterKey(second));
 const r=assessCoverage52([first,second],assets,{cutoff}).rows[0];
 assert.equal(r.uniqueEventClusters,1);assert.equal(r.scheduleVerified,1);assert.equal(r.assessments[0].phases.length,2);
 assert.deepEqual(r.assessments[0].phases.map(p=>p.targetDates[0]),['2026-10-06','2026-10-28']);
 const conflict={...first,id:'contradictory-record-date',targetDate:'2026-10-07'};
 assert.equal(assessCoverage52([first,second,conflict],assets,{cutoff}).rows[0].scheduleVerified,0);
});
