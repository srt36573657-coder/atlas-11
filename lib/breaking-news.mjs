// Explicit user-reviewed incident research. No automatic official verification,
// no live watcher, and no changes to already issued forecast objects.
import {hashString} from './engine.mjs';
import {estimateBreakingImpact} from './breaking-model.mjs';
const ARRAYS=['events','decisions','forecasts','evaluations','premises','candidates','collectionStatus','candidateErrors'];
const clone=structuredClone;
const finite=x=>typeof x==='number'&&Number.isFinite(x);
const positive=x=>finite(x)&&x>0;
const parse=x=>{const value=x instanceof Date?x.toISOString():x;return typeof value==='string'&&/T.*(?:Z|[+-]\d{2}:\d{2})$/i.test(value)?Date.parse(value):NaN;};
const stamp=x=>{const t=parse(x);if(!Number.isFinite(t))throw Error('시간대가 명시된 유효 시각이 필요합니다.');return new Date(t).toISOString();};
const kdate=x=>new Date(parse(x)+9*3600000).toISOString().slice(0,10);
const validDay=d=>typeof d==='string'&&/^\d{4}-\d{2}-\d{2}$/.test(d)&&Number.isFinite(Date.parse(d+'T00:00:00Z'))&&new Date(d+'T00:00:00Z').toISOString().slice(0,10)===d;
const close=d=>parse(d+'T15:30:00+09:00');
const startOf=d=>parse(d+'T00:00:00+09:00');
const canonical=x=>Array.isArray(x)?x.map(canonical):x&&typeof x==='object'?Object.fromEntries(Object.keys(x).sort().map(k=>[k,canonical(x[k])])):x;
const serial=x=>JSON.stringify(canonical(x));
const idFor=(type,x)=>{const s=serial(x);return type+'-'+hashString(s)+'-'+hashString([...s].reverse().join(''));};
const text=(v,name,max,required=false)=>{if(v==null&&!required)return '';if(typeof v!=='string'||v.trim().length>max||required&&!v.trim())throw Error(name+' 입력을 확인하세요.');return v.trim();};
function https(value){let u;try{u=new URL(value);}catch{throw Error('출처 URL 오류');}if(u.protocol!=='https:'||u.username||u.password)throw Error('출처는 인증정보 없는 HTTPS 주소여야 합니다.');return u.href;}
export function createBreakingState(){return {schema:1,events:[],decisions:[],forecasts:[],evaluations:[],premises:[],candidates:[],collectionStatus:[],candidateErrors:[]};}
function stateOf(state){if(state==null)return createBreakingState();if(state.schema!==1)throw Error('돌발뉴스 기록 형식이 달라 원본을 유지합니다.');const out=clone(state);for(const key of ARRAYS){if(out[key]==null)out[key]=[];if(!Array.isArray(out[key]))throw Error('돌발뉴스 기록 배열 오류: '+key);}return out;}
function period(now,start='2026-09-17',end='2026-10-30'){const day=kdate(now);return day>=start&&day<=(end<'2026-10-30'?end:'2026-10-30');}
function add(array,row){const old=array.find(x=>x.id===row.id);if(old){if(serial(old)!==serial(row))throw Error('불변 기록 ID 충돌: '+row.id);return;}array.push(row);}
const effectiveEvents=state=>{const superseded=new Set(state.events.map(e=>e.supersedesId).filter(Boolean));return state.events.filter(e=>!superseded.has(e.id));};
const phaseKey=e=>serial([e.economicEventId,e.phaseId]);
const nextSession=(input,at)=>input.calendar.sessions.find(d=>d>kdate(at)&&d<=input.end&&d<='2026-10-30');
export function recordBreakingEvent(state,payload,{now=new Date(),codes=[],start='2026-09-17',end='2026-10-30'}={}){
 if(!period(now,start,end))return state??createBreakingState();
 const out=stateOf(state),discoveredAt=stamp(now);
 const scope=payload.scope;if(!['company','sector','market','index'].includes(scope))throw Error('뉴스 범위를 명시하세요.');
 if(!Array.isArray(payload.targetCodes)||!payload.targetCodes.length)throw Error('대상 종목을 선택하세요.');
 const targetCodes=[...new Set(payload.targetCodes)].sort();if(targetCodes.some(c=>!codes.includes(c)))throw Error('등록된 종목 외에는 적용할 수 없습니다.');
 if(typeof payload.publishedAt!=='string'||!/(Z|[+-]\d\d:\d\d)$/i.test(payload.publishedAt))throw Error('공개 시각에 시간대가 필요합니다.');
 const publishedAt=stamp(payload.publishedAt);if(parse(publishedAt)>parse(discoveredAt))throw Error('미래 공개 시각은 발생한 뉴스로 등록할 수 없습니다.');
 const sourceType=payload.sourceType??'unverified',status=payload.status??'reported';
 if(!['official','press','unverified'].includes(sourceType)||!['reported','confirmed','corrected','retracted'].includes(status))throw Error('출처 종류 또는 사건 상태를 확인하세요.');
 const content={economicEventId:text(payload.economicEventId,'경제 사건 ID',200,true),phaseId:text(payload.phaseId,'단계 ID',200,true),title:text(payload.title,'제목',300,true),summary:text(payload.summary,'요약',5000),scope,targetCodes,publishedAt,sourceUrl:https(payload.sourceUrl),sourceType,sourceBodyReviewed:payload.sourceBodyReviewed===true,indexMembership:payload.indexMembership==null?null:clone(payload.indexMembership),status,supersedesId:payload.supersedesId??null,businessPath:text(payload.businessPath,'사업 경로',3000),changeToPremise:text(payload.changeToPremise,'전제 변화',3000),premiseIds:[...new Set(payload.premiseIds??[])].sort(),importance:payload.importance??'normal'};
 if(!['normal','important'].includes(content.importance)||!Array.isArray(payload.premiseIds??[])||content.premiseIds.some(x=>typeof x!=='string'))throw Error('중요도 또는 전제 ID 오류');
 if(['corrected','retracted'].includes(status)&&!content.supersedesId)throw Error('정정·철회 대상 원래 사건 ID가 필요합니다.');
 if(content.supersedesId){const prior=out.events.find(e=>e.id===content.supersedesId);if(!prior||phaseKey(prior)!==phaseKey(content))throw Error('동일 경제 사건·단계의 원래 기록을 지정하세요.');}
 const revisionKey=idFor('revision',content),existing=out.events.find(e=>e.revisionKey===revisionKey);if(existing)return state;
 const event={id:idFor('event',content),...content,revisionKey,discoveredAt,knownAt:discoveredAt,evidenceStatus:'USER_RECORDED_NOT_INDEPENDENTLY_VERIFIED',scopeEvidence:'USER_SELECTED_TARGETS_NOT_VERIFIED_MEMBERSHIP',causal:false};
 add(out.events,event);
 if(content.changeToPremise)add(out.premises,{id:event.id+':premise',eventId:event.id,codeTargets:targetCodes,at:discoveredAt,recordedAt:discoveredAt,baselineId:null,retrospectivePremiseReconstruction:true,detail:content.changeToPremise,businessPath:content.businessPath,premiseIds:content.premiseIds,status:'HYPOTHESIS',causal:false,supersedesEventId:content.supersedesId});
 return out;
}
export function decideBreakingEvent(state,payload,{now=new Date(),input,versions=[],active}={}){
 if(!input?.calendar?.sessions)throw Error('기존 종목·거래일 자료가 필요합니다.');
 if(!period(now,input.origin,input.end))return state??createBreakingState();
 const out=stateOf(state),issuedAt=stamp(now),event=out.events.find(e=>e.id===payload.eventId),requestedDecision=payload.decision;
 if(!event||!event.targetCodes.includes(payload.code)||!input.assets.some(a=>a.code===payload.code))throw Error('해당 종목의 등록 사건을 선택하세요.');
 if(!Number.isFinite(parse(event.knownAt))||!Number.isFinite(parse(event.publishedAt))||!Number.isFinite(parse(event.discoveredAt))||parse(event.knownAt)<Math.max(parse(event.publishedAt),parse(event.discoveredAt))||parse(event.knownAt)>parse(issuedAt))throw Error('유효한 공개·관측 시각으로 확인된 사건이 필요합니다.');
 if(!['KEEP','WATCH','SCENARIO','REVISE','BLOCK'].includes(requestedDecision))throw Error('지원하지 않는 결정입니다.');
 const selected=payload.baselineId??active,baseline=typeof selected==='string'?versions.find(v=>v.id===selected):selected;
 const asset=baseline?.assets?.find(a=>a.code===payload.code);
 if(!asset||!Number.isFinite(parse(baseline.createdAt??baseline.issuedAt))||!Number.isFinite(parse(baseline.informationCutoff))||parse(baseline.createdAt??baseline.issuedAt)>parse(issuedAt)||parse(baseline.informationCutoff)>parse(issuedAt)||parse(baseline.informationCutoff)>parse(baseline.createdAt??baseline.issuedAt))throw Error('당시에 발행된 해당 종목 기준 전망이 필요합니다.');
 const requestKey=idFor('request',{eventId:event.id,code:payload.code,baselineId:baseline.id,decision:requestedDecision,reason:payload.reason??'',approvedImpact:payload.approvedImpact??null});
 if(out.decisions.some(d=>d.requestKey===requestKey))return state;
 const activeId=typeof active==='string'?active:active?.id;
 let decision=requestedDecision,impact=null,replacesForecastId=null;const reasons=[];
 const live=effectiveEvents(out),superseded=!live.some(e=>e.id===event.id);
 const effectiveFrom=nextSession(input,issuedAt);
 if(['KEEP','REVISE'].includes(decision)&&!effectiveFrom){decision='BLOCK';reasons.push('기간 안에 남은 미래 거래일이 없음');}
 if(decision==='REVISE'){
  if(event.scope==='index'){
   const m=event.indexMembership;let validUrl=false;try{validUrl=https(m?.url)===m.url;}catch{}
   if(!m||!validUrl||m.sourceBodyReviewed!==true||!Array.isArray(m.codes)||!m.codes.includes(payload.code)||!Number.isFinite(parse(m.availableAt))||parse(m.availableAt)>parse(event.knownAt)||!validDay(m.effectiveFrom)||m.effectiveFrom>kdate(event.knownAt)||(m.effectiveTo&&(!validDay(m.effectiveTo)||m.effectiveTo<kdate(event.knownAt)))){decision='BLOCK';reasons.push('지수 구성 대상의 출처·공개 시각·적용 기간 검토 근거 미확보');}
  }
  if(event.supersedesId&&out.events.filter(e=>e.supersedesId===event.supersedesId).length>1){decision='BLOCK';reasons.push('동일 원문에서 갈라진 상충 정정 기록의 해결 필요');}
  if(event.status==='retracted'||superseded){decision='BLOCK';reasons.push('철회되거나 정정으로 대체된 사건');}
  if(activeId&&baseline.id!==activeId){decision='BLOCK';reasons.push('현재 기준 전망과 다른 과거 기준의 수치 변경은 유보');}
  const prior=out.forecasts.filter(f=>f.code===payload.code&&f.kind==='REVISE'&&f.economicEventId===event.economicEventId&&f.phaseId===event.phaseId);
  if(prior.length){
   const replaced=new Set(out.forecasts.map(f=>f.replacesForecastId).filter(Boolean)),leaves=prior.filter(f=>!replaced.has(f.id));
   const requested=payload.approvedImpact?.replacesForecastId,target=leaves.find(f=>f.id===requested);
   let ancestor=event.supersedesId,reachesPrior=false;const seen=new Set();
   while(ancestor&&!seen.has(ancestor)){if(ancestor===target?.eventId){reachesPrior=true;break;}seen.add(ancestor);ancestor=out.events.find(e=>e.id===ancestor)?.supersedesId;}
   if(event.status==='corrected'&&target&&leaves.length===1&&reachesPrior&&target.baselineId===baseline.id&&serial(target.sourceOriginal?.asset)===serial(asset)){
    replacesForecastId=target.id;
   }else{decision='BLOCK';reasons.push('같은 경제 사건·단계의 수치 충격이 이미 기록됨; 명시적 정정 대체 검토 필요');}
  }else if(payload.approvedImpact?.replacesForecastId){decision='BLOCK';reasons.push('대체할 이전 수치 전망을 확인할 수 없음');}
  const overlapping=live.filter(e=>e.id!==event.id&&phaseKey(e)!==phaseKey(event)&&e.targetCodes.includes(payload.code)&&e.importance==='important'&&e.status!=='retracted'&&nextSession(input,e.knownAt)===nextSession(input,event.knownAt)).filter(e=>{const latest=out.decisions.filter(d=>d.eventId===e.id&&d.code===payload.code).at(-1);return !latest||['WATCH','BLOCK','SCENARIO','REVISE'].includes(latest.decision);});
  if(overlapping.length){decision='BLOCK';reasons.push('동일 반영일의 미해결 중요 사건 중첩: '+overlapping.map(e=>e.id).join(','));}
  const replacedIds=new Set(out.forecasts.map(f=>f.replacesForecastId).filter(Boolean));
  const otherImpulses=out.forecasts.filter(f=>f.kind==='REVISE'&&f.code===payload.code&&f.baselineId===baseline.id&&!replacedIds.has(f.id)&&phaseKey(f)!==phaseKey(event)&&f.end>=effectiveFrom);
  if(otherImpulses.length){decision='BLOCK';reasons.push('다른 돌발 수치안과 기간이 겹치며 공동 반응 근거가 없음; 기존 수치안을 지우거나 합산하지 않음');}
  if(decision==='REVISE'){
   impact=estimateBreakingImpact({event:{...event,observedAt:event.discoveredAt,approvedImpact:clone(payload.approvedImpact??event.approvedImpact??null)},code:payload.code,baseline:{...baseline,calendar:input.calendar},now});
   if(!impact?.eligible||!finite(impact.deltaLog)){decision='WATCH';reasons.push(...(impact?.reasons??['수치 추정 근거 부족']));}
  }
 }
 if(decision!=='REVISE')replacesForecastId=null;
 if(decision==='KEEP')reasons.push('기준 전망을 그대로 보관하는 비교안; 개선 효과를 입증하지 않음');
 if(decision==='SCENARIO')reasons.push('정성 시나리오 기록; 임의 가격 충격 미입력');
 const reason=text(payload.reason,'결정 근거',5000);
 const identity={eventId:event.id,code:payload.code,baselineId:baseline.id,requestedDecision,decision,reason,impact:impact??null,reasons,approvedImpact:payload.approvedImpact??null};
 const id=idFor('decision',identity),priorDecision=out.decisions.find(d=>d.id===id);if(priorDecision)return state;
 const row={id,requestKey,eventId:event.id,code:payload.code,baselineId:baseline.id,requestedDecision,decision,effectiveDecision:decision,reason,reasons,impact,issuedAt,knownAt:issuedAt,sourceEventKnownAt:event.knownAt,sourceUrl:event.sourceUrl,evidenceStatus:event.evidenceStatus,replacesForecastId,causal:false,reviewInputs:clone(payload.approvedImpact??null)};
 add(out.decisions,row);
 if(event.changeToPremise)add(out.premises,{id:id+':premise-review',eventId:event.id,decisionId:id,code:payload.code,baselineId:baseline.id,recordedAt:issuedAt,detail:event.changeToPremise,premiseIds:event.premiseIds??[],status:'HYPOTHESIS',retrospectivePremiseReconstruction:true,causal:false,reason:'현재 검토에서 재구성한 전제 가설; 최초 발행본의 원전제라고 주장하지 않음'});
 if(['KEEP','REVISE'].includes(decision)){
  const deltaLog=decision==='KEEP'?0:impact.deltaLog;
  const referenceDate=[...input.calendar.sessions].reverse().find(date=>observedPrice(input,payload.code,date,issuedAt));
  const reference=referenceDate?observedPrice(input,payload.code,referenceDate,issuedAt):null;
  const scale=(value,apply)=>{if(!positive(value))return null;const n=apply?Math.exp(Math.log(value)+deltaLog):value;return positive(n)?n:null;};
  const rows=asset.rows.filter(r=>r.date>=input.origin&&r.date<=input.end&&r.date<='2026-10-30'&&input.calendar.sessions.includes(r.date)).map(r=>{const apply=decision==='REVISE'&&r.date>=effectiveFrom;return {date:r.date,baselineP50:r.p50??null,baselineP10:r.p10??null,baselineP90:r.p90??null,p50:scale(r.p50,apply),p10:scale(r.p10,apply),p90:scale(r.p90,apply),adjusted:apply,deltaLog:apply?deltaLog:0,numericStatus:positive(r.p50)&&scale(r.p50,apply)===null?'numeric_range_limit':'finite_or_missing'};});
  add(out.forecasts,{id:id+':forecast',decisionId:id,eventId:event.id,economicEventId:event.economicEventId,phaseId:event.phaseId,replacesForecastId,code:asset.code,name:asset.name,kind:decision,baselineId:baseline.id,issuedAt,knownAt:issuedAt,sourceEventKnownAt:event.knownAt,effectiveFrom,end:input.end,deltaLog,referencePrice:reference?.close??null,referenceDate:referenceDate??null,referenceObservedAt:reference?.observedAt??null,referenceVintageId:reference?.vintage??null,impulseHorizonSessions:1,application:'one_time_log_shift_carried_forward_not_repeated_daily',sourceOriginal:{id:baseline.id,origin:baseline.origin,createdAt:baseline.createdAt??baseline.issuedAt,informationCutoff:baseline.informationCutoff,asset:clone(asset)},rows,sourceUrl:event.sourceUrl,status:'SEPARATE_RESEARCH_NOT_PROMOTED',trustProbability:null,causal:false,trainingEligible:false,intervalMeaning:'shifted_baseline_uncalibrated'});
 }
 return out;
}
function observedPrice(input,code,date,now){
 if(!input.calendar.sessions.includes(date)||date>input.end||close(date)>parse(now))return null;
 const matches=input.assets.find(a=>a.code===code)?.prices.filter(p=>p.date===date)??[];if(matches.length!==1)return null;
 const p=matches[0];if(!positive(p.close)||p.quality==='conflict')return null;
 const revisions=(input.priceRevisions??[]).filter(r=>r.code===code&&r.date===date);
 if(revisions.some(r=>!Number.isFinite(parse(r.at))||parse(r.at)>parse(now)))return null;
 const last=revisions.slice().sort((a,b)=>parse(a.at)-parse(b.at)).at(-1);
 if(last&&last.after!==p.close&&last.afterRow?.close!==p.close)return null;
 const at=last?.at??p.observedAt??p.retrievedAt??p.featureObservedAt;
 if(!Number.isFinite(parse(at))||parse(at)<close(date)||parse(at)>parse(now))return null;
 return {close:p.close,observedAt:stamp(at),vintage:idFor('actual',{code,date,close:p.close,quality:p.quality??null,revisionAt:last?.at??null})};
}
export function evaluateBreaking(state,{input,now=new Date()}={}){
 if(!input||!period(now,input.origin,input.end))return state??createBreakingState();
 const out=stateOf(state),recordedAt=stamp(now),ids=new Set(out.evaluations.map(e=>e.id));
 for(const f of out.forecasts)for(const r of f.rows){
  if(!['KEEP','REVISE'].includes(f.kind)||!input.calendar.sessions.includes(f.effectiveFrom)||!Number.isFinite(parse(f.issuedAt))||!Number.isFinite(parse(f.knownAt))||!Number.isFinite(startOf(r.date))||r.date<f.effectiveFrom||parse(f.issuedAt)>=startOf(r.date)||parse(f.knownAt)>parse(f.issuedAt)||!positive(r.p50)||!positive(r.baselineP50))continue;
  const actual=observedPrice(input,f.code,r.date,now);if(!actual)continue;
  const id=idFor('evaluation',{forecastId:f.id,date:r.date,vintage:actual.vintage});if(ids.has(id))continue;
  const errorWon=actual.close-r.p50,baselineErrorWon=actual.close-r.baselineP50;
  const referenceValid=positive(f.referencePrice)&&Number.isFinite(parse(f.referenceObservedAt))&&parse(f.referenceObservedAt)<=parse(f.issuedAt);
  const referenceErrorWon=referenceValid?actual.close-f.referencePrice:null;
  const horizonSessionIndex=input.calendar.sessions.indexOf(r.date)-input.calendar.sessions.indexOf(f.effectiveFrom)+1;
  add(out.evaluations,{id,forecastId:f.id,decisionId:f.decisionId,eventId:f.eventId,code:f.code,name:f.name,date:r.date,kind:f.kind,issuedAt:f.issuedAt,knownAt:f.knownAt,predicted:r.p50,baselinePredicted:r.baselineP50,actual:actual.close,errorWon,baselineErrorWon,horizonSessionIndex,referencePrice:referenceValid?f.referencePrice:null,referenceDate:f.referenceDate??null,referenceErrorWon,referenceAbsolutePercentageError:referenceValid?Math.abs(referenceErrorWon)/actual.close:null,absolutePercentageError:Math.abs(errorWon)/actual.close,baselineAbsolutePercentageError:Math.abs(baselineErrorWon)/actual.close,pairedErrorDifference:Math.abs(baselineErrorWon)/actual.close-Math.abs(errorWon)/actual.close,comparisonMeaning:f.kind==='KEEP'?'identical_baseline_not_improvement':'paired_same_date_research_not_causal',actualObservedAt:actual.observedAt,actualVintageId:actual.vintage,recordedAt,trainingEligible:false,causal:false,diagnosis:'UNKNOWN',supersededAtEvaluation:out.events.some(e=>e.supersedesId===f.eventId)});ids.add(id);
 }
 return serial(out)===serial(state)?state:out;
}
export function mergeBreaking(a,b){const out=stateOf(a),other=stateOf(b);for(const key of ARRAYS)for(const row of other[key])add(out[key],clone(row));return out;}
