import {eventsAsOf,pricesAsOf} from './evidence.mjs';
import {assessEvent,eventClusterKey,eventPhaseKey,sampleEvidence} from './event-evidence-v7.mjs';
import {appliesTo,scopeKey} from './news-scope.mjs';
import {quantile,sha256,stableJSON,sum} from './cycle-math.mjs';
import {SEALED_ORIGIN,SEALED_END,SEALED_CUTOFF,SEALED_SESSIONS,SEALED_STUDY_VERSION,isCalendarDate,isExactInstant,knownByCutoff,sealedCalendarDays,sealedStudyPolicy} from './sealed-study-policy.mjs';

const validHash=s=>typeof s==='string' && /^[a-f0-9]{64}$/i.test(s);
const unique=a=>[...new Set(a)];
function priceValidity(p) {
  if(!p || !isCalendarDate(p.date) || !Number.isFinite(p.close) || p.close<=0) return false;
  for(const k of ['open','high','low']) if(p[k]!=null && (!Number.isFinite(p[k]) || p[k]<=0))return false;
  if(p.volume!=null && (!Number.isFinite(p.volume)||p.volume<0))return false;
  if(p.low!=null && p.high!=null && p.low>p.high)return false;
  if(p.low!=null && (p.close<p.low || p.open!=null && p.open<p.low))return false;
  if(p.high!=null && (p.close>p.high || p.open!=null && p.open>p.high))return false;
  if(['invalid','conflict','suspect','missing'].includes(p.quality)||p.conflict===true)return false;
  return true;
}
function priceMap(asset,sessions) {
  const grouped=new Map(), invalid=[];
  for(const p of asset.prices??[]) {
    if(p?.date>SEALED_ORIGIN)continue;
    if(!p || !isCalendarDate(p.date) || !sessions.includes(p.date)) { invalid.push({date:p?.date??null,reason:'PRICE_DATE_OUTSIDE_CALENDAR'});continue; }
    if(!grouped.has(p.date))grouped.set(p.date,[]);grouped.get(p.date).push(p);
  }
  const values=new Map();
  for(const [date,ps] of grouped) {
    if(ps.length!==1 || !priceValidity(ps[0])) { invalid.push({date,reason:ps.length!==1?'DUPLICATE_PRICE_DATE':'INVALID_PRICE_ROW'});continue; }
    values.set(date,ps[0]);
  }
  return {values,invalid:invalid.sort((a,b)=>String(a.date).localeCompare(String(b.date)))};
}
function basis(asset,originRow) {
  const s=asset.priceSource??{};
  const timestamp=s.observedAt??s.retrievedAt;
  return originRow && s.priceVintageVerified===true && s.corporateActionsChecked===true && typeof s.basisId==='string' && s.basisId.trim() && knownByCutoff(timestamp)?'VERIFIED':'UNVERIFIED';
}
function widths(prices,sessions,policy,maxHorizon) {
  const history=sessions.filter(d=>d<=SEALED_ORIGIN).slice(-policy.width.lookbackSessions-1), result=[];
  result.push({widthReturn:0,widthStatus:'ESTIMATED_ORIGIN',sampleWindows:0,centerRemoved:null,reasons:[]});
  for(let h=1;h<=maxHorizon;h++) {
    const values=[];let numericRangeFailures=0;
    for(let i=0;i+h<history.length;i++) {
      const dates=history.slice(i,i+h+1);
      if(dates.some(d=>!prices.has(d)))continue;
      const value=prices.get(dates.at(-1)).close/prices.get(dates[0]).close-1;
      if(Number.isFinite(value))values.push(value);else numericRangeFailures++;
    }
    const center=values.length?sum(values.map(v=>v/values.length)):null, deviations=center==null?[]:values.map(v=>Math.abs(v-center));
    const enough=values.length>=policy.width.minWindows && numericRangeFailures===0 && Number.isFinite(center) && deviations.every(Number.isFinite);
    const w=enough?quantile(deviations,policy.width.nominalCoverage):null;
    result.push({widthReturn:w,widthStatus:numericRangeFailures?'NUMERIC_RANGE_ERROR':w==null?'UNESTIMABLE':'EXPLORATORY',sampleWindows:values.length,centerRemoved:Number.isFinite(center)?center:null,reasons:numericRangeFailures?['NUMERIC_RANGE_ERROR_VALID_PATHS_NOT_DISCARDED']:w==null?['INSUFFICIENT_CONTIGUOUS_HISTORY']:['EXPLORATORY_UNCALIBRATED_WIDTH','OVERLAPPING_WINDOWS_NOT_INDEPENDENT']});
  }
  return result;
}
function knownEvents(input) {
  return (eventsAsOf(input,SEALED_CUTOFF)??[]).filter(e=>knownByCutoff(e.availableAt) && e.targetDate>SEALED_ORIGIN && e.targetDate<=SEALED_END).map(e=>{
    // Later attestation/sample additions are not part of the old information set.
    const v=structuredClone(e);
    v.sources=(v.sources??[]).filter(s=>knownByCutoff(s.attestedAt??s.firstObservedAt??s.observedAt??s.retrievedAt));
    v.sealedReactions=(v.sealedReactions??[]).filter(r=>knownByCutoff(r.knownAt)).map(r=>({...r,samples:(r.samples??[]).filter(s=>knownByCutoff(s.availableAt)&&knownByCutoff(s.responseAvailableAt))}));
    return v;
  });
}
function semanticEvent(event,code) {
  // Do not let descriptive IDs, source order or target-code order multiply an economic event.
  return {kind:event.kind,targetDate:event.targetDate,eventDate:event.eventDate??event.announcementDate,status:event.status,availableAt:event.availableAt,publishedAt:event.publishedAt??null,originalVintageVerified:event.originalVintageVerified===true,materialityEvidence:event.materialityEvidence??null,throughSubsidiary:event.throughSubsidiary??event.reviewEvidence?.throughSubsidiary??null,scope:JSON.parse(scopeKey(event)),cluster:eventClusterKey(event),phase:eventPhaseKey(event),reactions:[...(event.sealedReactions??[])].filter(r=>code==null||r.assetCode===code).sort((a,b)=>String(a.assetCode).localeCompare(String(b.assetCode)))};
}
function reactionFor(event,asset,allAssets,sessions,prices,policy) {
  const reactions=(event.sealedReactions??[]).filter(r=>r.assetCode===asset.code);
  const reaction=reactions.length===1?reactions[0]:null;
  const base=assessEvent(event,asset,{cutoff:SEALED_CUTOFF,assets:allAssets,sessions});
  const out={eventId:event.id??null,sourceIds:event.id?[event.id]:[],name:event.name??null,targetDate:event.targetDate,phaseId:eventPhaseKey(event),economicEventId:eventClusterKey(event),scope:JSON.parse(scopeKey(event)),publishedAt:event.publishedAt??null,availableAt:event.availableAt,sources:(event.sources??[]).map(s=>({url:s.url??null,observedAt:s.attestedAt??s.firstObservedAt??s.observedAt??s.retrievedAt??null,publisherRole:s.publisherRole??s.role??null,sourceBodyRead:s.sourceBodyRead===true,primaryPublisherVerified:s.primaryPublisherVerified===true,contentDigest:s.contentDigest??s.sha256??null})).sort((a,b)=>stableJSON(a).localeCompare(stableJSON(b))),status:'UNESTIMABLE',reasons:[],path:[],sampleCount:0,effectiveSampleSize:0,causal:false};
  if(base.materiality.status==='context_only'){out.status='CONTEXT_ONLY';out.reasons=unique(['SCHEDULE_NOT_PRICE_CATALYST',...base.reasons]);return out;}
  out.reasons.push(...base.reasons);
  if(!isExactInstant(event.publishedAt) || !knownByCutoff(event.publishedAt))out.reasons.push('PUBLICATION_INSTANT_NOT_VERIFIED_AT_CUTOFF');
  if(!base.source.vintageVerified)out.reasons.push('ORIGINAL_EVENT_VINTAGE_UNVERIFIED');
  if(!event.sources?.some(s=>s.sourceBodyRead===true && s.primaryPublisherVerified===true && ['issuer','regulator','exchange','organizer'].includes(s.publisherRole??s.role)))out.reasons.push('PRIMARY_BODY_AT_CUTOFF_NOT_VERIFIED');
  if(!reaction)out.reasons.push(reactions.length>1?'CONFLICTING_ISSUER_REACTION_RECORDS':'NEWS_ADDITIONAL_RESPONSE_UNAVAILABLE');
  if(reaction) {
    if(!knownByCutoff(reaction.protocolFixedAt) || !knownByCutoff(reaction.knownAt) || reaction.preregistered!==true || !validHash(reaction.evidenceDigest))out.reasons.push('REACTION_PROTOCOL_OR_EVIDENCE_UNVERIFIED');
    if(reaction.pricedInAdjustmentVerified!==true)out.reasons.push('ALREADY_PRICED_IN_COMPONENT_UNRESOLVED');
    if(reaction.outcomeIntegrationVerified!==true)out.reasons.push('FUTURE_RESULT_DISTRIBUTION_UNRESOLVED');
    if(reaction.method!=='same_issuer_additional_simple_return')out.reasons.push('UNSUPPORTED_ADDITIONAL_REACTION_METHOD');
    const good=[],bad=[];
    for(const s of reaction.samples??[]) {
      const path=s.path;
      const sampleIndex=sessions.indexOf(s.date);
      const previous=sessions.slice(sampleIndex-20,sampleIndex);
      const contiguous=sampleIndex>=20 && previous.length===20 && previous.every(d=>prices.has(d));
      const pathValid=Array.isArray(path)&&path.length>0&&path.every((p,i)=>Number.isInteger(p.offsetSessions)&&p.offsetSessions===i&&Number.isFinite(p.value))&&path.at(-1).value===s.value;
      const ending=pathValid?sessions[sampleIndex+path.at(-1).offsetSessions]:null;
      const observedPath=pathValid&&sessions.slice(sampleIndex,sampleIndex+path.length).every(d=>prices.has(d));
      if(typeof s.id!=='string' || !s.id || !contiguous || !pathValid || !observedPath || !ending || ending>SEALED_ORIGIN || !isCalendarDate(s.windowEnd) || s.windowEnd<ending || s.additionalResponseVerified!==true || !validHash(s.sourceDigest) || Date.parse(reaction.protocolFixedAt)>=Date.parse(s.responseAvailableAt) || Date.parse(s.responseAvailableAt)<Date.parse(`${ending}T15:30:00+09:00`) || Date.parse(s.availableAt)>Date.parse(s.responseAvailableAt))bad.push({id:s.id??null,reasons:['UNVERIFIED_ADDITIONAL_SAMPLE_PATH_OR_BASELINE']});
      else good.push(s);
    }
    const statistics=sampleEvidence(event,asset,good,{cutoff:SEALED_CUTOFF,precision:{maxFrequencyHalfWidth:policy.news.maxFrequencyHalfWidth,independenceReviewed:reaction.independenceReviewed===true,protocolFixedBeforeOutcomes:reaction.preregistered===true}});
    out.sampleCount=statistics.independentDateClusters;out.effectiveSampleSize=statistics.effectiveSampleSize;
    out.sampleEvidence={...statistics,excluded:[...statistics.excluded,...bad]};
    out.reasons.push(...statistics.reasons);
    if(statistics.independentDateClusters<policy.news.minIndependentDateClusters)out.reasons.push('INSUFFICIENT_INDEPENDENT_EVENT_DATES');
    // A date can contain rejected other-issuer records. Select only individually accepted
    // records which also survived the grouped conflict/overlap rules, never good.find(date).
    const individuallyValid=good.filter(s=>sampleEvidence(event,asset,[s],{cutoff:SEALED_CUTOFF}).clusters.length===1);
    const acceptedGroups=statistics.clusters.map(c=>individuallyValid.filter(s=>s.date===c.date && c.ids.includes(s.id)));
    const samples=acceptedGroups.map(group=>group[0]);
    // Every contributing issuer sample must expose the same empirically observed horizon.
    if(new Set(samples.map(s=>s.path.length)).size>1)out.reasons.push('INCOMPARABLE_REACTION_PATH_HORIZONS');
    if(samples.some((s,i)=>acceptedGroups[i].some(g=>stableJSON(g.path)!==stableJSON(s.path))))out.reasons.push('CONFLICTING_WITHIN_EVENT_PATHS');
    if(!out.reasons.length && samples.length) {
      const total=sum(statistics.clusters.map(c=>c.weight));
      out.path=samples[0].path.map((p,j)=>({offsetSessions:p.offsetSessions,value:sum(samples.map((s,i)=>s.path[j].value*(statistics.clusters[i].weight/total)))}));
      if(out.path.every(p=>Number.isFinite(p.value))) {out.status='ESTIMATED';out.evidenceDigest=reaction.evidenceDigest;out.method=reaction.method;}
      else {out.path=[];out.reasons.push('REACTION_NUMERIC_RANGE_ERROR');}
    }
  }
  out.reasons=unique(out.reasons);return out;
}
function line(center,price,width,status='ESTIMATED') {
  if(center==null||price==null)return {status:'UNESTIMABLE',centerReturn:null,price:null,lowerReturn:null,upperReturn:null,bandStatus:'UNESTIMABLE'};
  const lower=width==null?null:center-width,upper=width==null?null:center+width;
  if(width!=null && (!Number.isFinite(lower)||!Number.isFinite(upper)))return {status,centerReturn:center,price:price*(1+center),lowerReturn:null,upperReturn:null,bandStatus:'NUMERIC_RANGE_ERROR'};
  return {status,centerReturn:center,price:price*(1+center),lowerReturn:lower,upperReturn:upper,bandStatus:width==null?'UNESTIMABLE':lower < -1?'INVALID_PRICE_SUPPORT':'EXPLORATORY'};
}

export function buildSealedStudy(input,{now=new Date(),policy:overrides={}}={}) {
  const createdAt=new Date(now).toISOString(),policy=sealedStudyPolicy(overrides);
  if(Date.parse(createdAt)<Date.parse(SEALED_CUTOFF))throw Error('CANNOT_CREATE_STUDY_BEFORE_ORIGIN_CLOSE');
  if(!input || !Array.isArray(input.assets))throw Error('SEALED_ASSETS_REQUIRED');
  const expected=policy.universeCodes;
  if(input.assets.length!==expected.length || new Set(input.assets.map(a=>a.code)).size!==expected.length || input.assets.some(a=>!expected.includes(a.code)))throw Error('EXACT_ORIGINAL_52_UNIQUE_CODES_REQUIRED');
  const sessions=input.calendar?.sessions;
  if(!Array.isArray(sessions)||new Set(sessions).size!==sessions.length||sessions.some((d,i)=>!isCalendarDate(d)||(i>0&&d<=sessions[i-1])))throw Error('INVALID_OR_DUPLICATE_TRADING_CALENDAR');
  if(stableJSON(sessions.filter(d=>d>=SEALED_ORIGIN&&d<=SEALED_END))!==stableJSON(SEALED_SESSIONS))throw Error('FIXED_STUDY_SESSION_CALENDAR_MISMATCH');
  const asOf=pricesAsOf(input,SEALED_CUTOFF),events=knownEvents(input);
  const days=sealedCalendarDays(),assets=[],inputManifest=[];
  for(const code of expected) {
    const asset=asOf.find(a=>a.code===code),{values:prices,invalid}=priceMap(asset,sessions);
    const originRow=prices.get(SEALED_ORIGIN),originPrice=originRow?.close??null,priceBasisStatus=basis(asset,originRow);
    const ws=widths(prices,sessions,policy,SEALED_SESSIONS.length-1);
    const relevant=events.filter(e=>appliesTo(e,asset)),grouped=new Map(),idShapes=new Map();
    for(const e of relevant){if(!idShapes.has(e.id))idShapes.set(e.id,new Set());idShapes.get(e.id).add(stableJSON(semanticEvent(e,code)));}
    for(const e of relevant){const key=eventClusterKey(e)+'|'+eventPhaseKey(e);if(!grouped.has(key))grouped.set(key,[]);grouped.get(key).push(e);}
    const newsEvidence=[];
    for(const group of grouped.values()) {
      group.sort((a,b)=>String(a.id).localeCompare(String(b.id)));
      const sourceMap=new Map(group.flatMap(e=>e.sources??[]).map(s=>[stableJSON(s),s]));
      const e={...group[0],sources:[...sourceMap.values()]},v=reactionFor(e,asset,asOf,sessions,prices,policy);v.sourceIds=unique(group.map(x=>x.id).filter(Boolean)).sort();
      const attestations=new Map();
      for(const s of v.sources){const key=stableJSON([s.url,s.observedAt]);if(!attestations.has(key))attestations.set(key,new Set());attestations.get(key).add(stableJSON(s));}
      if([...attestations.values()].some(shapes=>shapes.size>1)){v.status='UNESTIMABLE';v.path=[];v.reasons.push('CONFLICTING_SOURCE_ATTESTATION');}
      if(group.some(x=>idShapes.get(x.id).size>1)) {v.status='UNESTIMABLE';v.path=[];v.reasons.push('CONFLICTING_SAME_EVENT_ID');}
      if(new Set(group.map(x=>stableJSON(semanticEvent(x,code)))).size>1) {v.status='UNESTIMABLE';v.path=[];v.reasons.push('CONFLICTING_ECONOMIC_EVENT_DUPLICATES');}
      newsEvidence.push(v);
    }
    newsEvidence.sort((a,b)=>a.targetDate.localeCompare(b.targetDate)||String(a.eventId).localeCompare(String(b.eventId)));
    const material=newsEvidence.filter(e=>e.status!=='CONTEXT_ONLY'), reasons=[];
    if(originPrice==null)reasons.push('ORIGIN_CLOSE_MISSING_OR_INVALID');
    if(priceBasisStatus!=='VERIFIED')reasons.push('PRICE_VINTAGE_OR_CORPORATE_ACTION_UNVERIFIED');
    if(!material.length)reasons.push('NO_ESTIMABLE_NEWS_CENTER');
    if(material.some(e=>e.status!=='ESTIMATED'))reasons.push('ONE_OR_MORE_NEWS_EFFECTS_UNESTIMABLE');
    // Joint paths are not supplied by the current contract. Do not add separate economic
    // events or different stages of one event as though independence/additivity were proven.
    if(material.length>1)reasons.push(new Set(material.map(e=>e.targetDate)).size<material.length?'MATERIAL_SAME_DAY_OVERLAP_UNRESOLVED':'MULTI_EVENT_ADDITIVITY_UNVERIFIED');
    const usable=reasons.length===0, response=usable?material[0]:null;
    const rows=days.map(date=>{
      const index=SEALED_SESSIONS.filter(d=>d<=date).length-1,referenceDate=SEALED_SESSIONS[index],w=ws[index];
      let center=null;
      if(response) {
        const eventIndex=SEALED_SESSIONS.indexOf(response.targetDate),offset=index-eventIndex;
        center=offset<0?0:response.path[Math.min(offset,response.path.length-1)].value;
      }
      const domainOkay=center==null||center>-1&&Number.isFinite(originPrice*(1+center));
      const a=line(originPrice==null?null:0,originPrice,w.widthReturn),b=line(domainOkay?center:null,originPrice,w.widthReturn);
      const rowReasons=[...w.reasons];
      if(!domainOkay)rowReasons.push('NEWS_CENTER_INVALID_PRICE_DOMAIN');
      if(a.bandStatus==='INVALID_PRICE_SUPPORT'||b.bandStatus==='INVALID_PRICE_SUPPORT')rowReasons.push('SYMMETRIC_BAND_BELOW_MINUS_100_PERCENT');
      return {date,isSession:SEALED_SESSIONS.includes(date),referenceDate,horizonSessions:index,widthReturn:w.widthReturn,widthStatus:w.widthStatus,widthSampleWindows:w.sampleWindows,a,b,reasons:rowReasons};
    });
    const historicalPrices=[...prices.values()].sort((a,b)=>a.date.localeCompare(b.date)).map(p=>[p.date,p.close]);
    const source=asset.priceSource??{}, observation=source.observedAt??source.retrievedAt;
    const priceBasis={provider:source.provider??null,url:source.url??null,quality:source.quality??null,basisId:priceBasisStatus==='VERIFIED'?source.basisId:null,priceVintageVerified:priceBasisStatus==='VERIFIED',corporateActionsChecked:priceBasisStatus==='VERIFIED',observedAt:knownByCutoff(observation)?observation:null,unrecordedVintageNotReconstructed:priceBasisStatus!=='VERIFIED'};
    inputManifest.push({code,priceRowsDigest:sha256(historicalPrices),priceRowCount:historicalPrices.length,priceSource:priceBasis,invalidPrices:invalid,eventEvidenceDigest:sha256(newsEvidence)});
    assets.push({code,name:asset.name??code,sector:asset.sector??null,originPrice,priceBasisStatus,priceBasisId:priceBasis.basisId,priceBasis,newsEvidence,reasons,rows,widthMethod:{...policy.width,centerRemoved:true,withinBlockDependenceRetained:true,calibrationVerified:false,eventAdditionalRisk:'NOT_ESTIMATED_MULTIPLIER_ONE',widthIsNotHitProbability:true},invalidPrices:invalid});
  }
  const provenance={version:SEALED_STUDY_VERSION,informationSet:'journal_replayed_as_of_cutoff_unrecorded_vintages_not_recovered',inputDigest:sha256(inputManifest),inputManifest,sourceCodeFiles:['lib/sealed-study-policy.mjs','lib/sealed-path-pair.mjs'],retrospectiveDesign:true,backdatedSeal:false,originalOperatingForecastsChanged:false,allPeriodsFixed:true,newsCutoffViolationsUsed:0,postCutoffPricesUsed:0,unverifiedVintagePermittedForExploratoryWidth:true,trustProbability:null};
  return {schema:1,id:`sealed-${SEALED_ORIGIN}-${sha256({policy,assets,provenance}).slice(0,16)}`,createdAt,origin:SEALED_ORIGIN,end:SEALED_END,informationCutoff:SEALED_CUTOFF,policy,retrospective:true,sessions:[...SEALED_SESSIONS],calendarDays:days,assets,recordCount:assets.length*2,validARecords:assets.filter(a=>a.originPrice!=null).length,validBRecords:assets.filter(a=>a.rows.every(r=>r.b.status==='ESTIMATED')).length,provenance};
}
