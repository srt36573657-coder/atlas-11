// Presentation only: never edits prices, events, saved forecasts or their equations.
import {appliesTo,scopeOf,scopeLabel} from './news-scope.mjs';
const number=value=>typeof value==='number'&&Number.isFinite(value)?value:null;
const positive=value=>number(value)!==null&&value>0;
const validDate=value=>typeof value==='string'&&/^\d{4}-\d{2}-\d{2}$/.test(value)&&Number.isFinite(Date.parse(value))&&new Date(value).toISOString().slice(0,10)===value;
const displayedZero=(value,digits)=>Math.abs(value)<0.5*10**(-digits)?0:value;
const fmt=(value,digits=2)=>number(value)===null?'미확보':displayedZero(value,digits).toLocaleString('ko-KR',{maximumFractionDigits:digits,minimumFractionDigits:digits});
const signed=(value,digits=2)=>number(value)===null?'미확보':`${displayedZero(value,digits)>0?'+':''}${fmt(value,digits)}`;
const price=value=>positive(value)?`${fmt(value)}원`:'자료 없음';
const delta=(current,prior)=>positive(current)&&positive(prior)?{amount:current-prior,rate:current/prior-1}:null;
const sourceList=(...groups)=>{
 const sources=new Map();
 for(const source of groups.flat().filter(Boolean)){
  if(typeof source!=='object')continue;
  try{const url=new URL(source.url);if(!['https:','http:'].includes(url.protocol))continue;}
  catch{continue;}
  if(!sources.has(source.url))sources.set(source.url,{name:source.name??source.provider??'출처',url:source.url,publishedAt:source.publishedAt??null,observedAt:source.observedAt??source.retrievedAt??null});
 }
 return [...sources.values()];
};

export function calendarDates(origin,end){
 if(!validDate(origin)||!validDate(end)||origin>end)throw RangeError('올바른 시작일·종료일이 필요합니다.');
 const count=(Date.parse(end)-Date.parse(origin))/86400000+1;
 if(count>3660)throw RangeError('달력 범위가 너무 큽니다.');
 return Array.from({length:count},(_,index)=>new Date(Date.parse(origin)+index*86400000).toISOString().slice(0,10));
}
function context({asset,version,input}){
 const source=input?.assets?.find(a=>a.code===asset?.code);
 if(!source||!version||!Array.isArray(input?.calendar?.sessions))throw TypeError('지정 종목·버전·거래일표가 필요합니다.');
 if(!validDate(input.origin)||!validDate(input.end))throw RangeError('고정 분석 기간이 필요합니다.');
 const member=version.assets?.find(a=>a.code===asset.code);
 // Accept full or projected assets, but never a different company object.
 if(!member)throw TypeError('선택 버전에 없는 종목입니다.');
 return{asset,version,input,source,sessions:input.calendar.sessions};
}
function actualRow(ctx,date){
 const rows=(ctx.source.prices??[]).filter(p=>p.date===date);
 if(rows.length!==1||!positive(rows[0].close)||rows[0].quality==='conflict'||date>ctx.input.actualAsOf)return null;
 const row=rows[0],index=ctx.sessions.indexOf(date),previousDate=index>0?ctx.sessions[index-1]:null;
 const previous=(ctx.source.prices??[]).filter(p=>p.date===previousDate);
 const prior=previous.length===1&&positive(previous[0].close)&&previous[0].quality!=='conflict'?previous[0]:null;
 return{date,close:row.close,quality:row.quality??ctx.source.priceSource?.quality??'single_source',
   previousDate,previousClose:prior?.close??null,change:delta(row.close,prior?.close),
   sources:sourceList(row.sources??[],ctx.source.priceSource?[ctx.source.priceSource]:[])};
}
function forecastRow(ctx,date){
 const matches=(ctx.asset.rows??[]).filter(row=>row.date===date),row=matches.length===1?matches[0]:null;
 if(!row||!positive(row.p50))return null;
 const index=ctx.sessions.indexOf(date),previousDate=index>0?ctx.sessions[index-1]:null;
 const previous=(ctx.asset.rows??[]).filter(r=>r.date===previousDate),prior=previous.length===1?previous[0]:null;
 const numeric=ctx.asset.numericSummary?.rows?.find(r=>r.date===date);
 const ordinary=(ctx.asset.rows??[]).filter(r=>!r.anchor&&Array.isArray(r.eventIds)&&r.eventIds.length===0)
   .map(r=>({row:r,numeric:ctx.asset.numericSummary?.rows?.find(n=>n.date===r.date)}))
   .filter(item=>number(item.numeric?.increment?.logGrossMean)!==null);
 let modelDistributionComparison=null;
 const eventLog=number(numeric?.increment?.logGrossMean),referenceLog=number(ordinary[0]?.numeric?.increment?.logGrossMean);
 const ownMean=row.conditionalReturn?.meanLogReturn??0;
 const centeredLog=item=>item.numeric.increment.logGrossMean-(item.row.conditionalReturn?.meanLogReturn??0);
 const ordinaryBase=referenceLog===null?null:centeredLog(ordinary[0]);
 const ordinaryLog=ordinaryBase===null?null:ordinaryBase+ownMean;
 if(positive(prior?.mean)&&eventLog!==null&&ordinaryLog!==null&&ordinary.every(item=>Math.abs(centeredLog(item)-ordinaryBase)<=1e-14)){
  const eventGrossFactor=Math.exp(eventLog),ordinaryGrossFactor=Math.exp(ordinaryLog),eventMean=prior.mean*eventGrossFactor;
  if(positive(eventGrossFactor)&&positive(ordinaryGrossFactor)&&number(eventMean)!==null&&positive(row.mean)&&Math.abs(eventMean-row.mean)<=Math.max(1e-8,Math.abs(row.mean)*1e-10)){
   const meanDifference=prior.mean*(eventGrossFactor-ordinaryGrossFactor);
   if(number(meanDifference)!==null)modelDistributionComparison={ordinaryReferenceDate:ordinary[0].row.date,eventGrossFactor,ordinaryGrossFactor,previousMean:prior.mean,meanDifference,causal:false,
    meaning:'같은 직전 모형 평균에 당일 분포 또는 일반일 분포를 적용한 조건부 평균 차이 · 뉴스의 인과효과 아님'};
  }
 }
 return{date,p10:number(row.p10),p50:row.p50,p90:number(row.p90),mean:number(row.mean),anchor:row.anchor===true,
   previousDate,previousP50:number(prior?.p50),previousMean:number(prior?.mean),
   p50Change:delta(row.p50,prior?.p50),meanChange:delta(row.mean,prior?.mean),
   eventIds:[...(row.eventIds??[])],numericStatus:row.numericStatus??numeric?.numericStatus??null,
   numericFlags:[...(row.numericFlags??numeric?.flags??[])],
   meanMethod:numeric?.meanMethod??(number(row.meanMonteCarloSE)===0?'analytic_conditional_empirical_moments':null),
   increment:numeric?.increment?structuredClone(numeric.increment):null,
   modelDistributionComparison,
   conditionalReturn:row.conditionalReturn??null,
   trustProbability:null};
}
function datedValue(ctx,date){
 const actual=actualRow(ctx,date),forecast=forecastRow(ctx,date);
 if(actual)return{date,kind:'actual',label:'실제 종가',value:actual.close,valueDate:date,actual,forecast};
 // An anchor is an observed starting price, not evidence that a missing quote was observed.
 if(forecast&&!forecast.anchor&&date>ctx.version.origin)return{date,kind:'forecast',label:'모형 전망',value:forecast.p50,valueDate:date,actual:null,forecast};
 return{date,kind:'missing',label:'자료 없음',value:null,valueDate:null,actual:null,forecast};
}
function eventDetails(ctx,date){
 const accepted=ctx.version.eventGate?.accepted??[];
 return(ctx.asset.news??[]).filter(p=>p.date===date).flatMap(profile=>{
  const event=accepted.find(e=>e.id===profile.id);
  const scope=profile.scope??(event?scopeOf(event):null);
  if(!scope||!appliesTo({...profile,scope},ctx.source))return[];
  if(event&&(!appliesTo(event,ctx.source)||event.targetDate!==date))return[];
  const samples=Array.isArray(profile.samples)?profile.samples:null;
  const foreign=samples?.some(s=>s.code!==undefined&&s.code!==ctx.asset.code)??false;
  const count=number(profile.sampleCount)??samples?.length??null;
  const finiteSamples=samples?.map(s=>number(s.value)).filter(v=>v!==null)??[];
  const rawMean=foreign||count===0?null:number(profile.selection?.rawMean)??(finiteSamples.length?finiteSamples.reduce((a,b)=>a+b,0)/finiteSamples.length:null);
  const selection=foreign||count===0?null:profile.selection?{
    rawMean,lambda:number(profile.selection.lambda),mu:number(profile.selection.mu),folds:number(profile.selection.folds),
    baselineLoss:number(profile.selection.baselineLoss),selectedLoss:number(profile.selection.selectedLoss),status:profile.selection.status??null,
    candidates:(profile.selection.candidates??[]).map(c=>({lambda:number(c.lambda),kept:c.kept===true,reason:c.reason??null,loss:number(c.loss),crps:number(c.crps),brier:number(c.brier)})),
  }:null;
  const sources=sourceList(profile.sources??[],event?.sources??[]);
  const reviewed=profile.reviewEvidence??event?.reviewEvidence;
  const business=reviewed?.businessDescription;
  const transmission=typeof profile.transmission==='string'?profile.transmission:profile.transmission?.text;
  const businessContext=typeof business?.text==='string'&&business.verified===true&&sourceList(business.sources??[]).length
    ?{text:business.text,sources:sourceList(business.sources),basis:'명시적으로 확인된 사업 설명'}
    :typeof transmission==='string'&&transmission.trim()&&sources.length
      ?{text:transmission,sources,basis:'해당 종목 자료에 기록된 전달경로 · 인과효과 입증 아님'}:null;
  const used=profile.used===true,effect=foreign||count===0?null:number(profile.effect);
  const details={id:profile.id,title:profile.name??event?.name??'제목 미확보',date,scope:structuredClone(scope),route:scopeLabel({scope}),used,
    reason:foreign?'다른 종목 코드가 섞인 표본이 있어 수치 설명 유보':profile.reason??'계산 여부의 상세 근거 미확보',
    sampleCount:count,sampleDates:foreign?[]:[...new Set((samples??[]).map(s=>s.date).filter(validDate))].sort(),
    sampleOwnership:foreign?'MISMATCH':samples?.some(s=>s.code===undefined)?'ASSET_PROFILE_CODE_METADATA_OMITTED':samples?'EXPLICIT_ASSET_CODE':'ASSET_PROFILE_SUMMARY',
    numericEvidenceUsable:!foreign,rawMeanLog:rawMean,rawMeanLogPercent:rawMean===null?null:rawMean*100,
    effect,selection,sources,businessContext,trustProbability:null,paragraphs:[]};
  details.paragraphs.push(`${ctx.asset.name}에 연결된 ${details.route} 일정: ${details.title}. ${used?'모형 계산에 사용된 기록입니다.':'계산을 유보한 기록입니다.'} ${details.reason}.`);
  if(!foreign){
   details.paragraphs.push(`${ctx.asset.name} 자체 과거 반응 표본 ${count===null?'미확보':count+'개'}${details.sampleDates.length?' ('+details.sampleDates[0]+'~'+details.sampleDates.at(-1)+')':''}. ${details.rawMeanLogPercent===null?'잔여반응 평균과 중심 효과를 설명할 표본 통계가 없습니다.':'잔여반응 평균(로그수익률)은 '+signed(details.rawMeanLogPercent)+'%입니다.'}`);
   if(selection)details.paragraphs.push(`선택계수 λ=${fmt(selection.lambda,4)}, 중심 로그효과 μ=${fmt(selection.mu,6)}, 시간순 검증 구간 ${selection.folds??'미확보'}개입니다.${effect!==null?' 저장된 중심 효과는 '+signed(effect*100)+'%입니다.':''}`);
   if(used&&effect===0)details.paragraphs.push('중심 효과 0은 방향 효과를 주지 않았다는 뜻입니다. 과거 발표일 변동성이나 모형 범위까지 0이라는 뜻은 아닙니다.');
  }
  if(businessContext)details.paragraphs.push(`${businessContext.basis}: ${businessContext.text}`);
  return[details];
 });
}

export function buildDailyExplanation(options){
 const ctx=context(options),{date}=options;
 if(!validDate(date)||date<ctx.input.origin||date>ctx.input.end)throw RangeError('고정 분석 기간 안의 날짜가 필요합니다.');
 const isSession=ctx.sessions.includes(date),previousSession=ctx.sessions.filter(d=>d<date).at(-1)??null;
 const base=isSession?datedValue(ctx,date):{date,kind:'holiday',label:'휴장일',value:null,valueDate:null,actual:null,forecast:null};
 const reference=!isSession&&previousSession?datedValue(ctx,previousSession):null;
 if(reference){base.value=reference.value;base.valueDate=reference.valueDate;}
 const events=isSession?eventDetails(ctx,date):[];
 const result={code:ctx.asset.code,name:ctx.asset.name,sector:ctx.source.sector,date,...base,isSession,carried:!isSession&&base.value!==null,
   reference,events,trustProbability:null,direction:'abstain',summary:'',paragraphs:[]};
 const {actual,forecast}=base;
 result.sources=sourceList(actual?.sources??[],ctx.source.priceSource?[ctx.source.priceSource]:[],events.flatMap(e=>e.sources));
 if(base.kind==='holiday'){
  result.summary=`${ctx.asset.name} · ${date} 휴장일`;
  result.paragraphs.push(`${date}은 거래일표상 휴장일입니다. 새 종가를 만들지 않습니다. ${reference?.value!==null&&reference?.value!==undefined?`${previousSession}의 ${reference.label} ${price(reference.value)}을 참고값으로 표시합니다.`:'직전 거래일의 표시값도 확보되지 않았습니다.'}`);
 }else if(base.kind==='actual'){
  result.summary=`${ctx.asset.name} · 실제 종가 ${price(actual.close)}`;
  result.paragraphs.push(`${date} ${ctx.asset.name} 실제 종가는 ${price(actual.close)}입니다. ${actual.change?`직전 거래일 ${actual.previousDate} 대비 ${signed(actual.change.amount)}원 (${signed(actual.change.rate*100)}%)입니다.`:'직전 거래일 자료가 없어 하루 증감을 계산하지 않습니다.'}`);
  result.paragraphs.push('이 가격 움직임만으로 특정 뉴스가 원인이라고 판정하지 않습니다.');
 }else if(base.kind==='forecast'){
  result.summary=`${ctx.asset.name} · 모형 중앙값 ${price(forecast.p50)}`;
  result.paragraphs.push(`${date} ${ctx.asset.name}의 모형 중앙값은 ${price(forecast.p50)}입니다.${forecast.p50Change?` 직전 거래일 모형 중앙값 대비 ${signed(forecast.p50Change.amount)}원 (${signed(forecast.p50Change.rate*100)}%)입니다.`:''}`);
 }else{
  result.summary=`${ctx.asset.name} · ${date} 자료 없음`;
  result.paragraphs.push(`${date} ${ctx.asset.name}의 유효한 실제 종가와 해당 날짜 전망이 없습니다. 다른 종목이나 다른 날짜 가격으로 채우지 않습니다.`);
 }
 if(forecast){
  if(forecast.conditionalReturn&&ctx.asset.conditionalPath){
   const c=forecast.conditionalReturn,fit=ctx.asset.conditionalPath;
   result.paragraphs.push(c.meanLogReturn===null?`${ctx.asset.name}의 조건부 수익률은 ${fit.reason}로 미산정입니다. 이를 0% 추정으로 표시하지 않습니다.`:`${ctx.asset.name} 자체 가격 이력으로 계산한 당일 조건부 로그수익률은 ${signed(c.meanLogReturn*100,4)}%입니다. 5·20·60거래일 특징을 사용하며, 계수 선택 자료는 ${fit.trainedThrough}까지입니다. 이후 관측 가격은 출발 특징만 갱신합니다.`);
   if(c.components?.length)result.paragraphs.push('모형별 가중치: '+c.components.map(m=>`${m.id} ${fmt(m.weight*100,1)}%`).join(' · ')+'. 내부 시간순 비교 결과이며 독립 예측 정확도 인증이 아닙니다.');
  }
  result.paragraphs.push(`저장된 모형 평균 ${price(forecast.mean)}${forecast.meanChange?' (직전 거래일 평균 대비 '+signed(forecast.meanChange.amount)+'원, '+signed(forecast.meanChange.rate*100)+'%)':''}, P10~P90 범위 ${price(forecast.p10)}~${price(forecast.p90)}입니다. 이 범위는 현실의 80% 적중을 보장하지 않습니다.`);
  if(forecast.increment)result.paragraphs.push(`해당 종목의 당일 조건부 분포는 ${forecast.increment.count??'미확보'}개 지지값을 사용하며, 평균 로그수익률 ${signed(number(forecast.increment.logReturnMean)===null?null:forecast.increment.logReturnMean*100,4)}%, 로그수익률 표준편차 ${fmt(number(forecast.increment.logReturnVariance)===null?null:Math.sqrt(Math.max(0,forecast.increment.logReturnVariance))*100,4)}%입니다.`);
  if(forecast.modelDistributionComparison)result.paragraphs.push(`같은 직전 모형 평균에 일반일 분포(${forecast.modelDistributionComparison.ordinaryReferenceDate} 참고)를 적용한 경우와 비교한 당일 분포의 모형 평균 차이는 ${signed(forecast.modelDistributionComparison.meanDifference)}원입니다. 뉴스가 실제 가격을 이만큼 움직였다는 인과효과가 아닙니다.`);
 }
 for(const event of events)result.paragraphs.push(...event.paragraphs);
 if(isSession&&base.kind==='forecast'){
  if(!events.length)result.paragraphs.push(ctx.asset.conditionalPath?'이 날짜의 새 개별 사건은 확인되지 않았습니다. 종목별 조건부 수익률과 자기 종목의 과거 변동 분포를 누적해 계산했습니다.':'이 날짜에 연결된 별도 사건이 없습니다. 이 보관 버전은 추세 평균을 제거한 표본을 쓰는 이전 계산 방식입니다. 실제 주가가 그대로라는 확정 예측이 아니며, 미래 결과가 달라질 수 있습니다.');
  else if(!events.some(e=>e.used))result.paragraphs.push('이 날짜의 연결 일정은 모두 계산 유보 상태입니다. 중앙값의 하루 변화를 유보된 뉴스의 영향으로 설명하지 않습니다.');
  if(!events.some(e=>e.used)&&ctx.asset.training)result.paragraphs.push(`${ctx.asset.name}의 일반일 표본은 ${ctx.asset.training.start??'시작일 미확보'}~${ctx.asset.training.end??'종료일 미확보'}, ${ctx.asset.training.returns??'미확보'}개입니다. 저장된 일별 로그수익률 표준편차 σ는 ${fmt(number(ctx.asset.training.sigma)===null?null:ctx.asset.training.sigma*100,4)}%입니다.`);
  result.paragraphs.push('중앙값의 하루 변화는 전체 모의 분포의 결과입니다. 이를 개별 뉴스의 기여율로 나누지 않습니다. 실제 적중 신뢰 확률은 산정하지 않았습니다.');
 }
 result.text=result.paragraphs.join('\n');
 return result;
}
export function dateRows({asset,version,input}){
 return calendarDates(input.origin,input.end).map(date=>buildDailyExplanation({asset,version,input,date}));
}
