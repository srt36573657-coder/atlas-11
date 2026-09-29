import {CYCLE_PROTOCOL as P,CYCLE_LABELS} from './cycle-protocol.mjs';
import {ridge,predict,standardizer,standardize,mean,sum,sha256,stableJSON} from './cycle-math.mjs';
import {validDay,validTime,https} from './cycle-data.mjs';
const validRow=r=>validDay(r.date)&&validDay(r.targetDate)&&r.targetDate>r.date&&r.targetDate<=P.parameterSelectionCutoff&&
 r.vintageVerified===true&&https(r.archiveUrl)&&validTime(r.knownAt)&&Date.parse(r.knownAt)<=Date.parse(r.targetDate+'T23:59:59+09:00')&&r.calendarVerified===true&&r.pointInTimeVerified===true&&r.adjustmentsVerified===true&&r.baselineModelVersion==='atlas-news-7.0.0'&&
 Number.isFinite(r.baselineMedianPrice)&&r.baselineMedianPrice>0&&r.baselineOrigin===r.date&&r.baselineId&&/^[a-f0-9]{64}$/.test(r.baselineDataHash??'')&&
 r.baselineLogMeaning==='expected_log_return'&&validTime(r.featureAsOf)&&Date.parse(r.featureAsOf)<=Date.parse(r.date+'T23:59:59+09:00')&&
 validTime(r.baselineInformationCutoff)&&Date.parse(r.baselineInformationCutoff)<=Date.parse(r.date+'T23:59:59+09:00')&&Date.parse(r.featureAsOf)<=Date.parse(r.baselineInformationCutoff)&&
 Array.isArray(r.sourceUrls)&&r.sourceUrls.length>0&&r.sourceUrls.every(https)&&
 Array.isArray(r.features)&&r.features.length===4&&r.features.every(Number.isFinite)&&
 [r.originPrice,r.actualPrice].every(v=>typeof v==='number'&&Number.isFinite(v)&&v>0)&&Number.isFinite(r.baseExpectedLogReturn);
export function trainingOrigins(rows,code,horizons,{mappingKey}={}){
 const map=new Map();
 for(const r of rows.filter(r=>r.code===code&&validRow(r)&&(!mappingKey||r.mappingKey===mappingKey))){
  const values=map.get(r.date)??[];values.push(r);map.set(r.date,values);
 }
 const complete=[];
 for(const [date,values]of map){
  const byH=new Map();let conflict=false;
  for(const r of values){if(!horizons.includes(r.horizon))continue;if(byH.has(r.horizon)){conflict=true;break;}byH.set(r.horizon,r);}
  if(conflict||horizons.some(h=>!byH.has(h)))continue;
  const ordered=horizons.map(h=>byH.get(h)),first=ordered[0];
  if(ordered.some(r=>stableJSON(r.features)!==stableJSON(first.features)||r.baselineId!==first.baselineId||r.originPrice!==first.originPrice||r.baselineDataHash!==first.baselineDataHash))continue;
  complete.push({date,targetDate:ordered.at(-1).targetDate,features:first.features,rows:ordered});
 }
 complete.sort((a,b)=>a.date.localeCompare(b.date));
 const selected=[];for(const r of complete)if(!selected.length||r.date>selected.at(-1).targetDate)selected.push(r);
 return {complete:complete.length,origins:selected};
}
function fitOn(origins,horizons,lambda,featureCount=4){
 const normalizer=standardizer(origins.map(r=>r.features.slice(0,featureCount)));if(!normalizer)throw Error('학습 특징의 변동 부족');
 const X=origins.map(r=>standardize(r.features.slice(0,featureCount),normalizer)),models={};
 horizons.forEach((h,j)=>{models[h]=ridge(X,origins.map(r=>(Math.log(r.rows[j].actualPrice)-Math.log(r.rows[j].originPrice))-r.rows[j].baseExpectedLogReturn),lambda);});
 return {normalizer,models,featureCount};
}
function evaluate(fit,origins,horizons){
 const rows=[];
 for(const origin of origins){const z=standardize(origin.features.slice(0,fit.featureCount??4),fit.normalizer);
 horizons.forEach((h,j)=>{
  const r=origin.rows[j],actualLog=(Math.log(r.actualPrice)-Math.log(r.originPrice)),delta=predict(fit.models[h],z);
  const basePrice=r.baselineMedianPrice,candidatePrice=basePrice*Math.exp(delta);
  if(![basePrice,candidatePrice].every(Number.isFinite))throw Error('후보 가격 수치 범위 초과');
  rows.push({code:r.code,date:r.date,targetDate:r.targetDate,horizon:h,delta,
   lossBase:Math.abs(basePrice-r.actualPrice)/r.originPrice,lossCandidate:Math.abs(candidatePrice-r.actualPrice)/r.originPrice,
   lossNaive:Math.abs(r.originPrice-r.actualPrice)/r.originPrice,absoluteLogError:Math.abs(r.baseExpectedLogReturn+delta-actualLog),
   targetStatistic:'stored_baseline_median_shifted_in_log_space',baselineId:r.baselineId});
 });}
 return rows;
}
export function fitCycleModel(rows,code,horizons,{mappingKey}={}){
 const hs=[...new Set(horizons)].sort((a,b)=>a-b);
 const result={code,protocol:P.id,protocolHash:sha256(P),status:'insufficient_evidence',enabled:false,trustProbability:null,liveWeight:0,
  horizons:hs,eligible:0,train:0,test:0,fit:null,holdout:[],reasons:[]};
 if(!hs.length||hs[0]!==1||hs.some((h,i)=>h!==i+1)||hs.at(-1)>60)return {...result,reasons:['연속된 목표 거래일 1~H 필요']};
 const selected=trainingOrigins(rows,code,hs,{mappingKey}),origins=selected.origins;
 result.eligible=origins.length;result.completeOrigins=selected.complete;
 const test=origins.slice(-P.minimumNonoverlapTestOrigins),train=origins.slice(0,-P.minimumNonoverlapTestOrigins).filter(r=>!test.length||r.targetDate<test[0].date);
 result.train=train.length;result.test=test.length;
 if(train.length<P.minimumNonoverlapTrainOrigins||test.length<P.minimumNonoverlapTestOrigins)return {...result,reasons:['당시 원본·완전 목표 구간·비중복 학습 36개/시험 12개 부족']};
 try{
  const folds=[];
  const first=P.minimumNonoverlapTrainOrigins+(origins.length-P.minimumNonoverlapTrainOrigins)%P.minimumNonoverlapTestOrigins;
  for(let index=first;index+P.minimumNonoverlapTestOrigins<=origins.length;index+=P.minimumNonoverlapTestOrigins){
   const outerTest=origins.slice(index,index+P.minimumNonoverlapTestOrigins),outerTrain=origins.slice(0,index).filter(r=>r.targetDate<outerTest[0].date);
   const minimumTestDay=new Date(outerTrain[0].date+'T00:00:00Z');minimumTestDay.setUTCFullYear(minimumTestDay.getUTCFullYear()+P.minimumInitialYears);
   if(outerTest[0].date<minimumTestDay.toISOString().slice(0,10))continue;
   const innerTest=outerTrain.slice(-P.minimumInnerTestOrigins),innerTrain=outerTrain.slice(0,-P.minimumInnerTestOrigins).filter(r=>r.targetDate<innerTest[0].date);
   if(innerTrain.length<P.minimumInnerTrainOrigins)continue;
   const candidates=P.ridgeCandidates.map(lambda=>({lambda,loss:mean(evaluate(fitOn(innerTrain,hs,lambda),innerTest,hs).map(r=>r.absoluteLogError))}));
   const lambda=[...candidates].sort((a,b)=>a.loss-b.loss||b.lambda-a.lambda)[0].lambda;
   const fitted=fitOn(outerTrain,hs,lambda),trainingDigest=sha256(outerTrain);
   const fit={...fitted,code,horizons:hs,lambda,trainedThrough:outerTrain.at(-1).targetDate,trainingDigest,mappingKey:mappingKey??null,protocolHash:sha256(P),fitHash:sha256({fitted,trainingDigest,lambda,hs,mappingKey})};
   const marketCandidates=P.ridgeCandidates.map(lambda=>({lambda,loss:mean(evaluate(fitOn(innerTrain,hs,lambda,2),innerTest,hs).map(r=>r.absoluteLogError))}));
   const marketLambda=[...marketCandidates].sort((a,b)=>a.loss-b.loss||b.lambda-a.lambda)[0].lambda;
   const marketFit=fitOn(outerTrain,hs,marketLambda,2),marketRows=evaluate(marketFit,outerTest,hs);
   const holdout=evaluate(fitted,outerTest,hs).map((row,i)=>({...row,lossMarketOnly:marketRows[i].lossCandidate}));
   folds.push({train:outerTrain.length,test:outerTest.length,fit,candidates,holdout,marketLambda,testStart:outerTest[0].date,testEnd:outerTest.at(-1).targetDate});
  }
  if(!folds.length)return {...result,reasons:['최소 3년 초기 학습·내부 시간 분리 표본 부족']};
  const last=folds.at(-1),walkForwardHoldout=folds.flatMap((f,index)=>f.holdout.map(r=>({...r,fold:index,trainedThrough:f.fit.trainedThrough,fitHash:f.fit.fitHash})));
  return {...result,status:'retrospective_research_only',fit:last.fit,candidates:last.candidates,holdout:last.holdout,walkForwardHoldout,
   folds:folds.map(f=>({train:f.train,test:f.test,testStart:f.testStart,testEnd:f.testEnd,trainedThrough:f.fit.trainedThrough,fitHash:f.fit.fitHash,lambda:f.fit.lambda,marketOnlyLambda:f.marketLambda})),
   pointMetrics:{candidate:mean(walkForwardHoldout.map(r=>r.lossCandidate)),marketOnly:mean(walkForwardHoldout.map(r=>r.lossMarketOnly)),base:mean(walkForwardHoldout.map(r=>r.lossBase)),naive:mean(walkForwardHoldout.map(r=>r.lossNaive))},
   reasons:['과거 외부 시험 결과이며 독립 향후 검증·분포 검증 미완료 · 운영 반영 0']};
 }catch(e){return {...result,reasons:[e.message]};}
}

export function cycleCorrection(fit,features,horizons){
 if(!fit||fit.protocolHash!==sha256(P)||!features?.every(Number.isFinite))return null;
 const z=standardize(features,fit.normalizer),out=[{horizon:0,delta:0,dailyDelta:0,contributions:[]}];
 for(const h of horizons){
  const model=fit.models[h];if(!model)return null;
  const previous=fit.models[h-1],delta=predict(model,z);
  const contributions=z.map((v,j)=>({label:CYCLE_LABELS[j],logValue:v*(model.coefficients[j]-(previous?.coefficients[j]??0))}));
  if(!Number.isFinite(delta))return null;
  const dailyDelta=delta-out.at(-1).delta;
  if(Math.abs(sum(contributions.map(c=>c.logValue))-dailyDelta)>1e-9)throw Error('주기 일별 기여 합 불일치');
  out.push({horizon:h,delta,dailyDelta,contributions});
 }
 return out;
}
export function shiftedCandidate(asset,corrections){
 if(!corrections||corrections.length!==asset.rows.length)return null;
 const rows=asset.rows.map((row,i)=>{
  const c=corrections[i],scale=Math.exp(c.delta);
  if(!Number.isFinite(scale)||!(scale>0))throw Error('주기 후보 수치 범위 초과');
  const values=Object.fromEntries(['p10','p50','p90','mean'].map(k=>[k,row[k]==null?null:row[k]*scale]));
  if(Object.values(values).some(v=>v!==null&&(!Number.isFinite(v)||v<=0)))throw Error('주기 후보 가격 오류');
  return {date:row.date,...values,deltaLog:c.delta,dailyDeltaLog:c.dailyDelta,contributions:c.contributions,trustProbability:null};
 });
 return {code:asset.code,rows,enabled:false,status:'research_only',intervalStatus:'coefficient_uncertainty_not_included',trustProbability:null};
}
