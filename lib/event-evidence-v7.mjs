// ATLAS v7 research evidence policy. This module never issues a trading probability.
import { MACRO_KINDS, appliesTo, scopeOf, scopeErrors, scopeKey, stableValue } from './news-scope.mjs';

export const EVIDENCE_POLICY_VERSION = 'atlas-event-evidence-7.0.0';
export const ECONOMIC_FAMILIES = Object.freeze({
  EARNINGS: 'earnings', COMPANY_EARNINGS: 'earnings', EARNINGS_GUIDANCE: 'guidance', COMPANY_GUIDANCE: 'guidance',
  CAPITAL_INCREASE: 'capital_action', SHARE_BUYBACK: 'capital_action', SHARE_CANCELLATION: 'capital_action',
  CB_ISSUANCE: 'capital_action', BOND_ISSUANCE: 'financing', DEBT_MATURITY: 'financing',
  DIVIDEND_DECISION: 'corporate_action', STOCK_SPLIT: 'corporate_action',
  MATERIAL_CONTRACT: 'material_contract', CONTRACT_TERMINATION: 'material_contract',
  MERGER_ACQUISITION: 'merger_acquisition', REGULATORY_DECISION: 'regulatory',
  LITIGATION_DECISION: 'legal', CLINICAL_RESULT: 'clinical', DRUG_APPROVAL: 'regulatory',
  PRODUCTION_DISRUPTION: 'operational', CREDIT_EVENT: 'credit', AIRLINE_FUEL_POLICY: 'pricing_policy',
});
const CONTEXT_PATTERNS = /^(?:INDUSTRY_|COMPANY_(?:EXHIBITION|SUBSIDIARY_EXHIBITION|POPUP|RETAIL_CAMPAIGN|BUSINESS_SEMINAR|PRODUCT_PRESENTATION|PROPERTY_CONTRACT_WINDOW|FACILITY_OPENING|OPENING_CEREMONY|GOVERNANCE_RECOMMENDATION|IR$|KPW_IR$|REDISCLOSURE$)|HYBE_(?:CINE|CONCERT)|GAS_PAYMENT_POLICY$|DIVIDEND_RECORD$)/;
const OFFICIAL_MACRO_HOSTS = { BLS: ['bls.gov'], FED: ['federalreserve.gov'], BOK: ['bok.or.kr'] };
const VALID_ROLES = new Set(['issuer', 'regulator', 'organizer', 'exchange']);
const finiteTime = x => typeof x === 'string' && Number.isFinite(Date.parse(x));
const knownBy = (x, cutoff) => finiteTime(x) && finiteTime(cutoff) && Date.parse(x) <= Date.parse(cutoff);
const validDate = x => typeof x === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(x) && !Number.isNaN(Date.parse(x)) && new Date(x).toISOString().slice(0,10) === x;
const https = x => { try { const u = new URL(x); return u.protocol === 'https:' && !!u.hostname && !u.username && !u.password; } catch { return false; } };
const uniq = xs => [...new Set(xs)];
const sum = xs => xs.reduce((a,b) => a+b,0);

export function eventFamily(event) {
  if (MACRO_KINDS.has(event.kind)) return `macro:${event.kind}`;
  return ECONOMIC_FAMILIES[event.kind] ?? (CONTEXT_PATTERNS.test(event.kind ?? '') ? 'business_context' : 'unclassified');
}

// Different article IDs, headlines, source URLs and source order do not multiply an event.
// Without a verified separate contract/reference, same issuer/day/family is one conservative cluster.
export function eventClusterKey(event) {
  const relation = event.economicEventId ?? event.underlyingEventId;
  if (relation) return JSON.stringify([scopeKey(event), ['economic_event', relation]]);
  return JSON.stringify([scopeKey(event), event.eventDate ?? event.announcementDate ?? event.targetDate,
    [eventFamily(event), event.kind, event.referencePeriod ?? event.referenceId ?? '']]);
}
export function eventPhaseKey(event) {
  return String(event.phaseId ?? event.phase ?? event.kind ?? 'unknown');
}

function sourceProof(event, cutoff, attestedEventIds = []) {
  const sources = (event.sources ?? []).filter(s => https(s.url));
  const tracker = event.reviewEvidence?.trackerEvidence;
  const validTracker = tracker && VALID_ROLES.has(tracker.publisherRole) &&
    tracker.checks?.primaryPublisherVerified === true && tracker.checks?.sourceBodyRead === true &&
    tracker.checks?.exactDateVerified === true && tracker.evidenceDigest && tracker.evidenceDigest === tracker.reviewedDigest &&
    sources.some(s => s.url === tracker.sourceUrl) && knownBy(tracker.observedAt,cutoff);
  const explicit = sources.some(s => VALID_ROLES.has(s.publisherRole ?? s.role) && s.primaryPublisherVerified === true &&
    s.sourceBodyRead === true && knownBy(s.attestedAt ?? s.firstObservedAt ?? s.observedAt ?? event.availableAt,cutoff));
  const review = event.reviewEvidence;
  const reviewSources = review?.sources ?? [];
  const retainedReview = typeof event.reviewReleaseId === 'string' && review &&
    (review.eventDate ?? review.announcementDate) === (event.eventDate ?? event.announcementDate) &&
    (review.targetDate == null || review.targetDate === event.targetDate) &&
    reviewSources.some(s => sources.some(x => x.url === s.url)) &&
    (review.rootReviewed === true || (typeof review.evidenceSummary === 'string' && review.evidenceSummary.trim().length > 0) ||
      reviewSources.some(s => typeof s.verification === 'string' && s.verification.trim().length > 0));
  const registry = (attestedEventIds instanceof Set ? attestedEventIds : new Set(attestedEventIds));
  const retainedRegistry = registry.has(event.id) && typeof event.reviewReleaseId === 'string' && sources.length > 0;
  const macro = MACRO_KINDS.has(event.kind) && (OFFICIAL_MACRO_HOSTS[event.provider] ?? []).some(host => sources.some(s => {
    const name = new URL(s.url).hostname.toLowerCase(); return name === host || name.endsWith(`.${host}`);
  }));
  return { verified: !!(validTracker || explicit || retainedReview || retainedRegistry || macro), urls: sources.map(s => s.url),
    basis: validTracker ? 'independent_tracker_review' : explicit ? 'verified_primary_body' : retainedReview ? 'retained_review_attestation' : retainedRegistry ? 'retained_review_registry' : macro ? 'official_macro_provider' : 'unverified',
    vintageVerified: event.originalVintageVerified === true };
}

function materiality(event, cutoff) {
  const family = eventFamily(event);
  const claim = event.materialityEvidence;
  // A reviewer can document an economic channel, never manufacture a numeric impact weight.
  const documented = claim?.verified === true && VALID_ROLES.has(claim.publisherRole) &&
    https(claim.sourceUrl) && knownBy(claim.observedAt,cutoff) &&
    typeof claim.economicChannel === 'string' && claim.economicChannel.trim().length > 0 &&
    typeof claim.evidenceLocation === 'string' && claim.evidenceLocation.trim().length > 0;
  if (family === 'business_context' && !documented)
    return { status: 'context_only', family, reason: 'CALENDAR_IS_NOT_ECONOMIC_OUTCOME', directMagnitudeKnown: false };
  if (family === 'unclassified' && !documented)
    return { status: 'unclassified', family, reason: 'ECONOMIC_CHANNEL_NOT_VERIFIED', directMagnitudeKnown: false };
  return { status: 'potentially_material', family, reason: documented ? 'DOCUMENTED_ECONOMIC_CHANNEL' : 'ECONOMIC_EVENT_FAMILY',
    directMagnitudeKnown: documented && Number.isFinite(claim.amount) && claim.amount >= 0 && !!claim.unit,
    effectDirection: 'unknown' };
}

// Wilson interval describes observed historical positive-return frequency under a Bernoulli
// approximation. It is NOT a forecast hit-rate or calibrated probability of future return.
export function wilsonInterval(positive, total, z = 1.959963984540054) {
  if (!Number.isFinite(total) || total <= 0 || !Number.isFinite(positive) || positive < 0 || positive > total || !Number.isFinite(z) || z <= 0) return null;
  const p = positive / total, den = 1 + z*z/total;
  const center = (p + z*z/(2*total))/den;
  const halfWidth = z*Math.sqrt(p*(1-p)/total + z*z/(4*total*total))/den;
  return { low: Math.max(0,center-halfWidth), high: Math.min(1,center+halfWidth), halfWidth, center };
}

export function sampleEvidence(event, asset, historySamples = [], {cutoff, precision = null} = {}) {
  const excluded = [], candidates = [];
  for (const sample of historySamples) {
    const reasons = [], code = sample.assetCode ?? sample.code;
    const family = sample.family ?? eventFamily({kind: sample.kind});
    if (code !== asset.code) reasons.push('OTHER_ISSUER_OR_UNSCOPED_SAMPLE');
    if (family !== eventFamily(event) || sample.kind !== event.kind) reasons.push('NONCOMPARABLE_EVENT_FAMILY');
    if (eventPhaseKey(sample)!==eventPhaseKey(event)) reasons.push('NONCOMPARABLE_EVENT_PHASE');
    if (!validDate(sample.date) || sample.date >= (event.targetDate ?? '')) reasons.push('INVALID_OR_FUTURE_RESPONSE_DATE');
    if (!knownBy(sample.availableAt,cutoff) || !knownBy(sample.responseAvailableAt,cutoff)) reasons.push('NOT_KNOWN_AT_CUTOFF');
    if (!Number.isFinite(sample.value) || !Number.isFinite(sample.weight ?? 1) || (sample.weight ?? 1) <= 0 || (sample.weight ?? 1) > 1) reasons.push('INVALID_NUMERIC_SAMPLE');
    if (sample.baselineContinuous !== true || !Number.isInteger(sample.baselineSessions) || sample.baselineSessions < 20) reasons.push('INCOMPLETE_PRE_EVENT_BASELINE');
    if (sample.priceVintageVerified !== true || sample.corporateActionsChecked !== true) reasons.push('PRICE_VINTAGE_OR_CORPORATE_ACTION_UNVERIFIED');
    if (sample.confounded === true) reasons.push('MATERIAL_SAME_DAY_CONFOUNDING');
    if (reasons.length) excluded.push({ id: sample.id ?? null, date: sample.date ?? null, reasons });
    else candidates.push({...sample, weight: sample.weight ?? 1});
  }
  const occurrenceDates = new Map();
  for (const s of candidates) {
    const key=s.economicEventId ?? s.eventClusterId ?? s.id;
    if(key){if(!occurrenceDates.has(key))occurrenceDates.set(key,new Set());occurrenceDates.get(key).add(s.date);}
  }
  const distinctOccurrences=candidates.filter(s=>{
    const key=s.economicEventId ?? s.eventClusterId ?? s.id;
    if(key && occurrenceDates.get(key).size>1){excluded.push({id:s.id??null,date:s.date,reasons:['SAME_ECONOMIC_OCCURRENCE_HAS_CONFLICTING_RESPONSE_DATES']});return false;}
    return true;
  });
  const grouped = new Map();
  for (const s of distinctOccurrences) { if (!grouped.has(s.date)) grouped.set(s.date,[]); grouped.get(s.date).push(s); }
  const clusters = [];
  for (const [date, members] of [...grouped].sort(([a],[b])=>a.localeCompare(b))) {
    if (new Set(members.map(s => JSON.stringify([s.value,s.windowStart ?? s.date,s.windowEnd ?? s.date]))).size > 1) {
      excluded.push({date,reasons:['CONFLICTING_RESPONSES_WITHIN_DATE_CLUSTER']}); continue;
    }
    // The minimum weight prevents duplicate stories from upgrading reliability.
    clusters.push({date, value:members[0].value, weight:Math.min(...members.map(s=>s.weight)),
      ids:uniq(members.map(s=>s.id).filter(Boolean)), windowStart:members[0].windowStart ?? date, windowEnd:members[0].windowEnd ?? date});
  }
  const nonoverlap = [];
  for (const c of clusters) {
    if (!validDate(c.windowStart) || !validDate(c.windowEnd) || c.windowStart > c.date || c.windowEnd < c.date || c.windowStart > c.windowEnd) {
      excluded.push({date:c.date,reasons:['INVALID_RESPONSE_WINDOW']}); continue;
    }
    if (nonoverlap.some(p=>p.windowStart<=c.windowEnd && c.windowStart<=p.windowEnd)) {
      excluded.push({date:c.date,reasons:['OVERLAPPING_RESPONSE_WINDOW']}); continue;
    }
    nonoverlap.push(c);
  }
  const totalWeight = sum(nonoverlap.map(s=>s.weight));
  const effectiveSampleSize = totalWeight ? totalWeight**2 / sum(nonoverlap.map(s=>s.weight**2)) : 0;
  const historicalPositiveFraction = totalWeight ? sum(nonoverlap.filter(s=>s.value>0).map(s=>s.weight))/totalWeight : null;
  const interval = historicalPositiveFraction == null ? null : wilsonInterval(historicalPositiveFraction*effectiveSampleSize,effectiveSampleSize);
  const reasons = [];
  if (!precision || !Number.isFinite(precision.maxFrequencyHalfWidth) || precision.maxFrequencyHalfWidth <= 0 || precision.maxFrequencyHalfWidth >= .5)
    reasons.push('PRECISION_REQUIREMENT_NOT_DECLARED');
  if (!interval || interval.halfWidth > (precision?.maxFrequencyHalfWidth ?? 0)) reasons.push('HISTORICAL_FREQUENCY_TOO_IMPRECISE');
  if (precision?.independenceReviewed !== true) reasons.push('CROSS_DATE_DEPENDENCE_NOT_REVIEWED');
  if (precision?.protocolFixedBeforeOutcomes !== true) reasons.push('PRECISION_PROTOCOL_NOT_PREREGISTERED');
  return { eligibleForResearchEstimation: reasons.length===0, independentDateClusters:nonoverlap.length, effectiveSampleSize,
    submittedSampleRecords:historySamples.length, historicalPositiveFraction, historicalFrequencyInterval:interval,
    intervalAssumption:'Bernoulli approximation; unequal-weight Kish effective n is descriptive, not exact confidence coverage',
    reasons, clusters:nonoverlap, excluded, trustProbability:null, liveDirection:'abstain' };
}

export function assessEvent(event, asset, options = {}) {
  const { cutoff, assets = [asset], sessions, historySamples = [], precision = null } = options;
  const reasons = [], warnings = [];
  if (!finiteTime(cutoff)) reasons.push('INVALID_INFORMATION_CUTOFF');
  if (!event?.id || !event.kind || !event.name) reasons.push('MISSING_EVENT_IDENTITY');
  if (!knownBy(event.availableAt,cutoff)) reasons.push('EVENT_NOT_KNOWN_AT_CUTOFF');
  if (!validDate(event.targetDate) || !validDate(event.eventDate ?? event.announcementDate)) reasons.push('EXACT_DATE_NOT_VERIFIED');
  if (sessions && !sessions.includes(event.targetDate)) reasons.push('TARGET_NOT_TRADING_SESSION');
  if (!['scheduled','announced','completed'].includes(event.status)) reasons.push('WITHDRAWN_OR_UNCONFIRMED');
  if (scopeErrors(event,assets,cutoff).length) reasons.push('INVALID_SCOPE_OR_MEMBERSHIP');
  if (!appliesTo(event,asset)) reasons.push('EVENT_DOES_NOT_APPLY_TO_ISSUER');
  const source = sourceProof(event,cutoff,options.attestedEventIds);
  if (!source.verified) reasons.push('PRIMARY_EVENT_BODY_NOT_VERIFIED');
  const relation = event.throughSubsidiary ?? event.reviewEvidence?.throughSubsidiary;
  if (relation) {
    warnings.push('SUBSIDIARY_CONTEXT_NOT_INDEPENDENT_PARENT_NEWS');
    if (!https(relation.ownershipSource)) reasons.push('SUBSIDIARY_RELATION_SOURCE_MISSING');
  }
  const economic = materiality(event,cutoff);
  if (economic.status === 'unclassified') reasons.push(economic.reason);
  const statistics = sampleEvidence(event,asset,historySamples,{cutoff,precision});
  const classification = reasons.length ? 'abstain' : economic.status === 'context_only' ? 'context_only' : 'price_evidence_candidate';
  if (!source.vintageVerified) warnings.push('ORIGINAL_PUBLICATION_VINTAGE_NOT_VERIFIED');
  if (source.basis.startsWith('retained_review_')) warnings.push('LEGACY_REVIEW_ATTESTATION_NOT_NEW_SOURCE_RETRIEVAL');
  if (classification==='context_only') warnings.push('NO_AUTOMATIC_PRICE_SHIFT');
  const scheduleVerified = !reasons.some(r=>r!=='ECONOMIC_CHANNEL_NOT_VERIFIED');
  return { policyVersion:EVIDENCE_POLICY_VERSION, eventId:event.id ?? null, assetCode:asset.code,
    clusterId:eventClusterKey(event), classification, scheduleVerified, materiality:economic, source,
    statisticalEligibility:statistics, reasons, warnings, underlyingEventCount:1,
    futureSurprise:event.status==='scheduled'?'unknown_until_published':'result_known_market_surprise_unmeasured', trustProbability:null, direction:'abstain',
    numericImpactAllowed:false, note:'Research eligibility never certifies a live predictive edge.' };
}

// A known low-information calendar is a warning, not an automatic veto of an otherwise
// eligible macro sample. Two potentially material events still require joint evidence.
export function assessSameDayOverlap(primary, others, asset, options = {}) {
  const relevant = others.filter(e=>e.id!==primary.id && e.targetDate===primary.targetDate && appliesTo(e,asset) && knownBy(e.availableAt,options.cutoff));
  const seen = new Set([eventClusterKey(primary)]), blocking = [], contextWarnings = [];
  for (const event of relevant) {
    const key=eventClusterKey(event); if(seen.has(key))continue; seen.add(key);
    const a=assessEvent(event,asset,options);
    if(a.classification==='context_only')contextWarnings.push({id:event.id,reason:'CONTEXT_SAME_DAY_POSSIBLE_UNMEASURED_CONFOUNDING'});
    else blocking.push({id:event.id,reason:a.classification==='abstain'?'UNRESOLVED_SAME_DAY_MATERIALITY':'MULTIPLE_POTENTIALLY_MATERIAL_EVENTS'});
  }
  return { attributableToSingleEvent:blocking.length===0, blocking, contextWarnings,
    policy:'Context-only does not veto; no causal identification claim; material or unresolved collisions require joint evidence.' };
}

export function assessCoverage52(events, assets, options = {}) {
  if (!Array.isArray(assets) || assets.length!==52 || new Set(assets.map(a=>a.code)).size!==52 || assets.some(a=>!/^\d{6}$/.test(a.code)))
    throw Error('EXACTLY_52_UNIQUE_ISSUERS_REQUIRED');
  if (!finiteTime(options.cutoff)) throw Error('VALID_INFORMATION_CUTOFF_REQUIRED');
  const known = events.filter(e=>knownBy(e.availableAt,options.cutoff));
  const idShapes = new Map();
  for (const e of known) { if (!idShapes.has(e.id)) idShapes.set(e.id,new Set()); idShapes.get(e.id).add(JSON.stringify([eventClusterKey(e),e.targetDate,e.status])); }
  const rows=assets.map(asset=>{
    const connected=known.filter(e=>appliesTo(e,asset));
    const clusters=new Map();
    for(const e of connected){const k=eventClusterKey(e);if(!clusters.has(k))clusters.set(k,[]);clusters.get(k).push(e);}
    const assessments=[...clusters.values()].map(group=>{
      const phaseGroups=new Map();
      for(const e of group){const phase=eventPhaseKey(e);if(!phaseGroups.has(phase))phaseGroups.set(phase,[]);phaseGroups.get(phase).push(e);}
      const conflict=[...phaseGroups.values()].some(members=>new Set(members.map(e=>JSON.stringify([e.targetDate,e.status,eventFamily(e)]))).size>1);
      const ranked=group.map(e=>assessEvent(e,asset,{...options,assets,historySamples: options.historySamplesByCode?.[asset.code] ?? options.historySamples ?? []}));
      const priority={price_evidence_candidate:0,context_only:1,abstain:2};
      ranked.sort((a,b)=>Number(b.scheduleVerified)-Number(a.scheduleVerified)||priority[a.classification]-priority[b.classification]||String(a.eventId).localeCompare(String(b.eventId)));
      const a={...ranked[0],phases:[...phaseGroups].map(([phase,members])=>({phase,eventIds:uniq(members.map(e=>e.id)),targetDates:uniq(members.map(e=>e.targetDate)).sort(),assessment:ranked.find(r=>members.some(e=>e.id===r.eventId))}))};
      if(conflict || group.some(e=>idShapes.get(e.id)?.size>1)){a.classification='abstain';a.scheduleVerified=false;a.reasons.push('CONFLICTING_EVENT_CLUSTER');}
      a.sourceRecordCount=group.length;
      return a;
    });
    return {code:asset.code,name:asset.name,sourceRecordCount:connected.length,uniqueEventClusters:assessments.length,
      scheduleVerified:assessments.filter(a=>a.scheduleVerified).length,
      priceEvidenceCandidates:assessments.filter(a=>a.classification==='price_evidence_candidate').length,
      contextOnly:assessments.filter(a=>a.classification==='context_only').length,
      abstained:assessments.filter(a=>a.classification==='abstain').length,
      researchEstimable:assessments.filter(a=>a.classification==='price_evidence_candidate'&&a.statisticalEligibility.eligibleForResearchEstimation).length,
      companyScheduleCount:assessments.filter(a=>a.scheduleVerified&&scopeOf(connected.find(e=>e.id===a.eventId)).type==='company').length,
      trustProbability:null,assessments};
  });
  return {policyVersion:EVIDENCE_POLICY_VERSION,cutoff:options.cutoff,assetCount:52,fixedNewsQuota:null,
    collectionCoverage:rows.filter(r=>r.sourceRecordCount>0).length,
    issuersWithPriceEvidenceCandidates:rows.filter(r=>r.priceEvidenceCandidates>0).length,
    issuersWithResearchEstimableEvents:rows.filter(r=>r.researchEstimable>0).length,
    globalUniqueEventClusters:new Set(known.map(eventClusterKey)).size,
    articleCountsAreNotIndependentSamples:true,trustProbability:null,rows};
}

// Hash this value in the model input digest. Fetch timestamps do not change information
// availability; first observation/attestation and all classification predicates do.
export function policyFingerprint(event) {
  const clean=value=>{
    if(Array.isArray(value))return value.map(clean);
    if(value&&typeof value==='object')return Object.fromEntries(Object.entries(value)
      .filter(([key])=>!['retrievedAt','fetchedAt','lastFetchedAt','retrievalRef'].includes(key))
      .map(([key,val])=>[key,clean(val)]));
    return value;
  };
  const fields=['id','kind','name','eventDate','announcementDate','targetDate','status','availableAt','firstObservedAt',
    'originalVintageVerified','provider','economicEventId','underlyingEventId','referencePeriod','referenceId',
    'materialityEvidence','throughSubsidiary','reviewReleaseId','reviewEvidence','phase','phaseId'];
  const value=Object.fromEntries(fields.filter(k=>event[k]!==undefined).map(k=>[k,clean(event[k])]));
  value.scope=JSON.parse(scopeKey(event));
  value.sources=(event.sources??[]).map(clean).sort((a,b)=>JSON.stringify(stableValue(a)).localeCompare(JSON.stringify(stableValue(b))));
  return JSON.stringify(stableValue(value));
}
