// Append-only forecast/outcome pairs. Neither saved forecasts nor old scores are edited.
import {hashString} from './engine.mjs';
export const EVALUATION_POLICY=Object.freeze({id:'frozen-forecast-outcome-1',
  signedError:'actual_minus_predicted',absolutePercentageDenominator:'actual',
  returnErrorDenominator:'forecast_origin',flatThreshold:0,priceHitTolerance:null,
  trustProbability:null});
const finite=n=>typeof n==='number'&&Number.isFinite(n);
const positive=n=>finite(n)&&n>0;
const stamp=x=>Number.isFinite(Date.parse(x))?Date.parse(x):-Infinity;
const direction=x=>x>0?'UP':x<0?'DOWN':'FLAT';
function diagnostics(asset,row,actual,error,input,version){
  const events=(asset.news??[]).filter(p=>p.date===row.date),notes=[];
  notes.push({kind:'PRICE_BASIS',status:'UNKNOWN',detail:'NAVER 단일 출처 · 기업행위 조정/당시 빈티지 미검증'});
  if(events.some(p=>p.samples?.some(s=>s.code&&s.code!==asset.code)))
    notes.push({kind:'SCOPE_ERROR',status:'CONFIRMED',detail:'다른 종목 코드의 반응 표본 발견'});
  if(events.some(p=>!p.used))notes.push({kind:'HELD_EVENT',status:'CONFIRMED',detail:'해당 날짜의 유보 일정은 가격 영향으로 계산하지 않았음',eventIds:events.filter(p=>!p.used).map(p=>p.id)});
  if(events.some(p=>p.used))notes.push({kind:'EVENT_RESPONSE',status:'HYPOTHESIS',detail:'사용한 과거 발표일 반응이 이번 결과와 달랐을 가능성 · 인과 원인 미확정',eventIds:events.filter(p=>p.used).map(p=>p.id)});
  if(asset.conditionalPath)notes.push({kind:'CONDITIONAL_RETURN',status:'HYPOTHESIS',detail:'종목별 추세·회귀 추정과 이후 실제 경로의 차이 점검',trainedThrough:asset.conditionalPath.trainedThrough});
  const late=(input.events??[]).filter(e=>e.targetDate===row.date&&Date.parse(e.availableAt)>Date.parse(version.informationCutoff));
  // Do not attribute unrelated companies' late events to this issuer.
  const relevant=late.filter(e=>e.scope?.type==='market'||e.scope?.codes?.includes(asset.code)||e.scope?.sectors?.includes(asset.sector));
  if(relevant.length)notes.push({kind:'LATER_INFORMATION',status:'CONFIRMED',detail:'예측 기준 뒤에 수집된 같은 대상 일정 존재 · 실제 오차 원인이라는 뜻은 아님',eventIds:relevant.map(e=>e.id)});
  notes.push({kind:'UNEXPLAINED',status:'UNKNOWN',detail:error===0?'가격이 일치해도 인과 설명의 정확성이 입증된 것은 아님':'가격 오차만으로 방정식의 특정 항을 원인으로 확정할 수 없음',residualWon:error});
  return notes;
}
export function appendEvaluationLedger(existing=[],versions,input,{now=new Date().toISOString()}={}){
  const result=[...existing],ids=new Set(existing.map(r=>r.id));
  const sessions=new Set(input.calendar.sessions),sources=new Map(input.assets.map(a=>[a.code,a]));
  const policyHash=hashString(JSON.stringify(EVALUATION_POLICY));
  for(const version of versions){
    if(!version.assets?.length)continue;
    for(const asset of version.assets){
      const source=sources.get(asset.code);if(!source)continue;
      for(const row of asset.rows){
        if(row.date<=version.origin||row.date>input.actualAsOf||!sessions.has(row.date)||!positive(row.p50)||!positive(asset.originPrice))continue;
        const matches=source.prices.filter(p=>p.date===row.date);
        if(matches.length!==1)continue;
        const actual=matches[0];if(!positive(actual.close)||actual.quality==='conflict')continue;
        const revision=(input.priceRevisions??[]).filter(r=>r.code===asset.code&&r.date===row.date&&r.before!==r.after).sort((a,b)=>stamp(a.at)-stamp(b.at)).at(-1);
        const actualVersion=hashString(JSON.stringify({date:actual.date,close:actual.close,quality:actual.quality,
          venue:actual.venue??'provider_unspecified',session:actual.session??'daily_close',revisionAt:revision?.at??null}));
        const key=[asset.code,row.date,version.id,actualVersion,policyHash].join(':');
        if(ids.has(key))continue;
        const closeTime=Date.parse(row.date+'T15:30:00+09:00');
        const published=Date.parse(version.createdAt),known=Date.parse(version.informationCutoff);
        const prospective=!version.isRetrospectiveReconstruction&&Number.isFinite(published)&&Number.isFinite(known)&&published<closeTime&&known<closeTime;
        const error=actual.close-row.p50;
        const predictedDirection=direction(row.p50-asset.originPrice),actualDirection=direction(actual.close-asset.originPrice);
        const inside=positive(row.p10)&&positive(row.p90)&&row.p90>=row.p10?actual.close>=row.p10&&actual.close<=row.p90:null;
        const rawProbability=finite(row.rawProbUp)?row.rawProbUp:null;
        result.push({id:key,code:asset.code,name:asset.name,date:row.date,forecastId:version.id,
          forecastOrigin:version.origin,forecastPublishedAt:version.createdAt,informationCutoff:version.informationCutoff,
          modelVersion:version.modelVersion,inputDigest:version.inputDigest,conditionalPolicy:asset.conditionalPath?.policy??null,
          actualVintageId:actualVersion,actualObservedAt:revision?.at??actual.observedAt??actual.retrievedAt??null,
          recordedAt:now,metricPolicyHash:policyHash,evaluationKind:prospective?'PROSPECTIVE':'RECONSTRUCTED_OR_LATE',
          predicted:row.p50,actual:actual.close,errorWon:error,absolutePercentageError:Math.abs(error)/actual.close,
          errorReturn:error/asset.originPrice,predictedDirection,actualDirection,directionMatched:predictedDirection===actualDirection,
          interval:{lower:row.p10,upper:row.p90,inside},priceHit:null,
          brier:rawProbability===null?null:(rawProbability-Number(actual.close>asset.originPrice))**2,
          probabilityMeaning:'model_path_frequency_not_trust',trustProbability:null,
          diagnosis:diagnostics(asset,row,actual,error,input,version),repairStatus:'NOT_AUTOMATICALLY_TUNED'});
        ids.add(key);
      }
    }
  }
  return result;
}
export function latestEvaluationRows(ledger,{forecastId,code,kind}={}){
  const map=new Map();
  for(const row of ledger){
    if(forecastId&&row.forecastId!==forecastId||code&&row.code!==code||kind&&row.evaluationKind!==kind)continue;
    const key=row.forecastId+':'+row.code+':'+row.date,old=map.get(key);
    const order=old ? stamp(row.actualObservedAt)-stamp(old.actualObservedAt) : 1;
    const recorded=old ? stamp(row.recordedAt)-stamp(old.recordedAt) : 1;
    if(!old||order>0||(!(order<0)&&(recorded>0||(!(recorded<0)&&String(row.id)>String(old.id)))))map.set(key,row);
  }
  return [...map.values()].sort((a,b)=>b.date.localeCompare(a.date)||a.code.localeCompare(b.code));
}
