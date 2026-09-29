// Eligibility-gated, own-stock/phase event research. Does not alter any forecast.
import {compensatedSum} from './news-numerics-v7.mjs';
export const BREAKING_IMPACT_POLICY=Object.freeze({id:'breaking-own-phase-residual-1',method:'own_stock_phase_residual',minimumSamples:5,priorSize:5,horizonSessions:1,end:'2026-10-30',trustProbability:null,causal:false});
const finite=x=>typeof x==='number'&&Number.isFinite(x);
const positive=x=>finite(x)&&x>0;
const text=x=>typeof x==='string'&&x.trim().length>0;
const stamp=x=>{const s=x instanceof Date?x.toISOString():x;return typeof s==='string'&&/T.*(?:Z|[+-]\d{2}:\d{2})$/.test(s)?Date.parse(s):NaN;};
const known=(x,cutoff)=>Number.isFinite(stamp(x))&&stamp(x)<=cutoff;
const koreanDay=x=>new Date(x+9*3600000).toISOString().slice(0,10);
const https=x=>{try{const u=new URL(x);return u.protocol==='https:'&&!u.username&&!u.password&&!!u.hostname;}catch{return false;}};
const unique=xs=>[...new Set(xs)];
const clone=x=>structuredClone(x);
export function estimateBreakingImpact({event,code,baseline,now=new Date()}={}){
 const reasons=[],excluded=[],cutoff=stamp(now),impact=event?.approvedImpact;
 const result=(refs=[])=>({eligible:false,reasons:unique(reasons),deltaLog:null,sampleCount:refs.length,refs:clone(refs),excluded:clone(excluded),
  method:BREAKING_IMPACT_POLICY.method,policyId:BREAKING_IMPACT_POLICY.id,horizonSessions:1,
  minimumSamples:5,priorSize:5,status:'HELD',trustProbability:null,causal:false,
  meaning:'reviewed_input_research_estimate_not_verified_market_effect',inputVerification:'user_reviewed_not_independently_verified'});
 if(!Number.isFinite(cutoff)){reasons.push('INVALID_CUTOFF');return result();}
 if(koreanDay(cutoff)>BREAKING_IMPACT_POLICY.end){reasons.push('FIXED_PERIOD_ENDED');return result();}
 if(!event||!text(event.id)||!text(event.economicEventId)||!text(event.phaseId))reasons.push('EVENT_IDENTITY_OR_PHASE_MISSING');
 const targets=event?.targetCodes??event?.scope?.codes;
 if(!Array.isArray(targets)||!targets.includes(code))reasons.push('EXPLICIT_TARGET_CODE_REQUIRED');
 const eventKnown=stamp(event?.knownAt),published=stamp(event?.publishedAt),discovered=stamp(event?.discoveredAt??event?.observedAt);
 if(!Number.isFinite(eventKnown)||!Number.isFinite(published)||!Number.isFinite(discovered)||eventKnown>cutoff||published>cutoff||discovered>cutoff||eventKnown<Math.max(published,discovered))reasons.push('EVENT_NOT_KNOWN_AT_CUTOFF');
 if(!['confirmed','corrected'].includes(event?.status))reasons.push('EVENT_STATUS_NOT_REVIEWED');
 if(!['official','press'].includes(event?.sourceType)||event?.sourceBodyReviewed!==true||!https(event?.sourceUrl))reasons.push('EVENT_SOURCE_BODY_NOT_REVIEWED');
 const asset=baseline?.assets?.find(a=>a.code===code),baselineIssued=stamp(baseline?.issuedAt??baseline?.createdAt),baselineKnown=stamp(baseline?.informationCutoff);
 if(!text(baseline?.id)||!asset||!Number.isFinite(baselineIssued)||!Number.isFinite(baselineKnown)||baselineKnown>baselineIssued||baselineIssued>cutoff)reasons.push('BASELINE_ID_OR_VINTAGE_UNAVAILABLE');
 const review=impact?.baselineReview;
 if(!review||review.baselineId!==baseline?.id||!known(review.reviewedAt,cutoff)||stamp(review.reviewedAt)<Math.max(eventKnown,baselineIssued)||review.eventAlreadyIncluded!==false||review.residualOverlap!==false)reasons.push('BASELINE_INCLUSION_REVIEW_MISSING_OR_STALE');
 const relatedNews=(asset?.news??[]).filter(p=>p.used===true&&p.economicEventId&&p.economicEventId===event?.economicEventId);
 const matchingNews=(asset?.news??[]).filter(p=>p.used===true&&(p.id===event?.id||(p.economicEventId&&p.economicEventId===event?.economicEventId&&(!text(p.phaseId)||p.phaseId===event?.phaseId))));
 if(relatedNews.some(p=>text(p.phaseId)&&p.phaseId!==event?.phaseId)&&review?.otherPhaseOverlap!==false)reasons.push('OTHER_PHASE_OVERLAP_REVIEW_MISSING');
 if(matchingNews.length||(baseline?.includedEventIds??[]).includes(event?.id)||(baseline?.includedEconomicEventIds??[]).includes(event?.economicEventId))reasons.push('EVENT_ALREADY_INCLUDED_IN_BASELINE');
 if((finite(asset?.training?.correction)&&asset.training.correction!==0)||(baseline?.status==='SHADOW_RESEARCH'&&asset?.training?.status==='TRAINED'))reasons.push('RESIDUAL_EVOLUTION_OVERLAP_UNRESOLVED');
 const anchorTime=stamp(baseline?.origin+'T15:30:00+09:00');
 if(!Number.isFinite(anchorTime))reasons.push('BASELINE_PRICE_DATE_UNAVAILABLE');
 else if(Number.isFinite(published)&&anchorTime>=published)reasons.push('BASELINE_PRICE_MAY_ALREADY_REFLECT_EVENT');
 if(!impact){reasons.push('NO_REVIEWED_IMPACT_EVIDENCE');return result();}
 const eventSource=impact.eventSource??{};
 if(impact.reviewedEventId!==event?.id||eventSource.url!==event?.sourceUrl||eventSource.bodyRead!==true||!text(eventSource.digest)||!known(eventSource.reviewedAt,cutoff)||stamp(eventSource.reviewedAt)<eventKnown||stamp(impact.evidenceReviewedAt)<stamp(eventSource.reviewedAt))reasons.push('EVENT_REVISION_SOURCE_REVIEW_MISSING');
 if(impact.code!==code||impact.phaseId!==event?.phaseId)reasons.push('IMPACT_STOCK_OR_PHASE_MISMATCH');
 if(impact.method!==BREAKING_IMPACT_POLICY.method||impact.horizonSessions!==1)reasons.push('UNSUPPORTED_IMPACT_METHOD_OR_HORIZON');
 if(impact.adjustmentVerified!==true||impact.expectationVerified!==true)reasons.push('ADJUSTMENT_OR_EXPECTATION_UNVERIFIED');
 if(!known(impact.evidenceReviewedAt,cutoff)||stamp(impact.evidenceReviewedAt)<eventKnown)reasons.push('EVIDENCE_REVIEW_TIME_UNVERIFIED');
 if(!Array.isArray(impact.samples)){reasons.push('NO_INDEPENDENT_SAMPLES');return result();}
 const calendar=baseline?.calendar?.sessions;
 const calendarValid=Array.isArray(calendar)&&calendar.length>1&&new Set(calendar).size===calendar.length&&calendar.every((d,i)=>typeof d==='string'&&/^\d{4}-\d{2}-\d{2}$/.test(d)&&(!i||d>calendar[i-1]));
 if(!calendarValid)reasons.push('RESPONSE_SESSION_CALENDAR_UNAVAILABLE');
 const candidates=[];
 for(const raw of impact.samples){
  const s=raw??{},why=[],p=s.prices??{},source=s.source??{},at=stamp(s.eventAt),ka=stamp(s.knownAt),before=stamp(p.beforeAt),after=stamp(p.afterAt),observed=stamp(p.observedAt),expectedAt=stamp(s.expectationKnownAt);
  // Filter future observations before duplicate/conflict grouping: future evidence cannot rewrite history.
  if(!Number.isFinite(ka)||ka>cutoff||!Number.isFinite(observed)||observed>cutoff||!Number.isFinite(at)||at>=published)why.push('FUTURE_OR_UNDATED_SAMPLE');
  if(!text(s.id)||!text(s.groupId))why.push('INDEPENDENT_EVENT_GROUP_MISSING');
  if(s.groupId===event?.economicEventId||s.id===event?.id)why.push('CURRENT_EVENT_IS_NOT_HISTORICAL_SAMPLE');
  if(s.code!==code||s.phaseId!==event?.phaseId)why.push('OTHER_STOCK_OR_PHASE');
  if(s.horizonSessions!==1)why.push('SAMPLE_HORIZON_NOT_ONE_SESSION');
  if(calendarValid&&Number.isFinite(before)&&Number.isFinite(after)){const a=calendar.indexOf(koreanDay(before)),b=calendar.indexOf(koreanDay(after));if(a<0||b!==a+1)why.push('PRICE_WINDOW_NOT_NEXT_TRADING_SESSION');}
  if(s.adjustmentVerified!==true||p.adjustmentVerified!==true||s.expectationVerified!==true)why.push('SAMPLE_ADJUSTMENT_OR_EXPECTATION_UNVERIFIED');
  if(s.overlapChecked!==true||!Array.isArray(s.overlappingEventIds)||s.overlappingEventIds.length)why.push('OVERLAPPING_EVENTS_NOT_EXCLUDED');
  if(!https(source.url)||source.bodyRead!==true||!text(source.digest)||!known(source.reviewedAt,cutoff)||stamp(source.reviewedAt)<Math.max(ka,observed)||stamp(impact.evidenceReviewedAt)<stamp(source.reviewedAt))why.push('SOURCE_REVIEW_PROVENANCE_MISSING');
  if(!positive(p.beforeClose)||!positive(p.afterClose)||!Number.isFinite(before)||!Number.isFinite(after)||before>=at||at>after||after>observed||after>=published||ka<at)why.push('INVALID_ADJUSTED_PRICE_WINDOW');
  if(!finite(s.expectedLogReturn)||!Number.isFinite(expectedAt)||expectedAt>=at||!https(s.expectationSourceUrl))why.push('PRE_EVENT_EXPECTATION_MISSING');
  const residual=positive(p.beforeClose)&&positive(p.afterClose)&&finite(s.expectedLogReturn)?Math.log(p.afterClose)-Math.log(p.beforeClose)-s.expectedLogReturn:NaN;
  if(!finite(s.residualLogReturn)||!finite(residual)||Math.abs(s.residualLogReturn-residual)>1e-12*Math.max(1,Math.abs(residual)))why.push('RESIDUAL_NOT_REPRODUCIBLE_FROM_EVIDENCE');
  if(why.length){excluded.push({id:s.id??null,groupId:s.groupId??null,reasons:unique(why)});continue;}
  candidates.push({id:s.id,groupId:s.groupId,code,phaseId:s.phaseId,eventAt:s.eventAt,knownAt:s.knownAt,
   residualLogReturn:residual,horizonSessions:1,source:clone(source),prices:clone(p),expectedLogReturn:s.expectedLogReturn,
   expectationKnownAt:s.expectationKnownAt,expectationSourceUrl:s.expectationSourceUrl,windowStart:before,windowEnd:after});
 }
 const ids=new Map(),groups=new Map();
 for(const s of candidates){const list=ids.get(s.id)??[];list.push(s);ids.set(s.id,list);}
 const conflictingIds=new Set([...ids].filter(([,xs])=>new Set(xs.map(x=>JSON.stringify([x.groupId,x.eventAt,x.windowStart,x.windowEnd,x.residualLogReturn]))).size>1).map(([id])=>id));
 for(const s of candidates){if(conflictingIds.has(s.id)){excluded.push({id:s.id,groupId:s.groupId,reasons:['CONFLICTING_SAMPLE_ID']});continue;}const list=groups.get(s.groupId)??[];list.push(s);groups.set(s.groupId,list);}
 const independent=[];
 for(const [groupId,list] of groups){
  const signatures=new Set(list.map(s=>JSON.stringify([s.eventAt,s.windowStart,s.windowEnd,s.residualLogReturn])));
  if(signatures.size!==1){excluded.push({groupId,reasons:['CONFLICTING_ECONOMIC_EVENT_GROUP']});continue;}
  // Re-publications do not multiply a sample; the earliest known representative is stable.
  list.sort((a,b)=>stamp(a.knownAt)-stamp(b.knownAt)||a.id.localeCompare(b.id));independent.push(list[0]);
 }
 independent.sort((a,b)=>a.windowStart-b.windowStart||a.groupId.localeCompare(b.groupId));
 const overlapping=new Set();
 for(let i=0;i<independent.length;i++)for(let j=i+1;j<independent.length;j++){
  const a=independent[i],b=independent[j];
  if((a.windowStart<b.windowEnd&&b.windowStart<a.windowEnd)||koreanDay(stamp(a.eventAt))===koreanDay(stamp(b.eventAt))){overlapping.add(a.groupId);overlapping.add(b.groupId);}
 }
 const refs=independent.filter(s=>{if(overlapping.has(s.groupId)){excluded.push({id:s.id,groupId:s.groupId,reasons:['NONINDEPENDENT_DATE_OR_RESPONSE_WINDOW']});return false;}return true;});
 if(refs.length<BREAKING_IMPACT_POLICY.minimumSamples)reasons.push('FEWER_THAN_FIVE_INDEPENDENT_EVENT_GROUPS');
 const out=result(refs);
 if(reasons.length)return out;
 let deltaLog;try{deltaLog=compensatedSum(refs.map(s=>s.residualLogReturn))/(refs.length+BREAKING_IMPACT_POLICY.priorSize);}catch{out.reasons.push('NUMERIC_RANGE_LIMIT');return out;}
 if(!finite(deltaLog)){out.reasons.push('NUMERIC_RANGE_LIMIT');return out;}
 return {...out,eligible:true,reasons:[],deltaLog,status:'EXPERIMENTAL_ELIGIBLE',
  equation:'sum(own_stock_same_phase_residual_log_return)/(independent_groups+5)',
  directionMeaning:'shrunken_historical_research_shift_not_confirmed_direction',
  application:'one_log_shift_once_from_next_eligible_session_not_a_daily_drift'};
}
