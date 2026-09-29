// Pure numerical and evidence contract. Research estimates are not causal effects or calibrated forecasts.
export const FACTOR36_POLICY=Object.freeze({id:'atlas-factor36-1',trainingBefore:'2026-09-17',minimumTrain:160,innerDays:40,holdoutDays:60,maxTrain:504,windows:[1,2,5,20,60],penalties:[1,10],flatRate:.001,seed:20260917,paths:20000,sourceStatus:'retrospective_single_provider',trustProbability:null});
const finite=x=>typeof x==='number'&&Number.isFinite(x);
const validTime=x=>typeof x==='string'&&/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:Z|[+-]\d{2}:\d{2})$/.test(x)&&validDate(x.slice(0,10))&&Number.isFinite(Date.parse(x));
const validDate=x=>typeof x==='string'&&/^\d{4}-\d{2}-\d{2}$/.test(x)&&Number.isFinite(Date.parse(x))&&new Date(x).toISOString().slice(0,10)===x;
const canonical=x=>Array.isArray(x)?x.map(canonical):x&&typeof x==='object'?Object.fromEntries(Object.keys(x).sort().map(k=>[k,canonical(x[k])])):x;
const recordKey=r=>JSON.stringify([r.factorId,r.scope,r.code??'',r.sector??'',r.scope==='index'?[r.indexId,r.codes,canonical(r.membership)]:null,r.date,r.vintageId]);
function sourceURL(value){let u;try{u=new URL(value);}catch{return false;}const h=u.hostname;return u.protocol==='https:'&&!u.username&&!u.password&&h.includes('.')&&!/^localhost$|\.localhost$|^127\.|^10\.|^192\.168\.|^169\.254\.|^0\.|^172\.(1[6-9]|2[0-9]|3[01])\.|^\[/.test(h);}
export const mean=a=>a.length?a.reduce((s,x)=>s+x,0)/a.length:NaN;
const variance=a=>mean(a.map(x=>(x-mean(a))**2));
const median=a=>quantile([...a].sort((x,y)=>x-y),.5);
export function quantile(a,p){if(!a.length)return null;const x=(a.length-1)*p,l=Math.floor(x);return a[l]+(a[Math.ceil(x)]-a[l])*(x-l);}
export function validateFactorRecords(payload,{codes,cutoff}){
 if(payload?.schema!=='atlas-factor36-records-1'||!Array.isArray(payload.records))throw Error('FACTOR_SCHEMA');
 if(!validTime(cutoff))throw Error('FACTOR_CUTOFF');
 const seen=new Map(),out=[];
 for(const supplied of payload.records){
  // A future observation must not change an earlier validation result, rejection or hash.
  if(!validTime(supplied?.observedAt))throw Error('FACTOR_TIME');
  if(Date.parse(supplied.observedAt)>Date.parse(cutoff))continue;
  const r=structuredClone(supplied);
  if(r.scope==='index'&&Array.isArray(r.codes))r.codes=[...new Set(r.codes)].sort();
  if(!/^F(0[1-9]|[12][0-9]|3[0-6])$|^FOMO$/.test(r.factorId)||!finite(r.value)||typeof r.unit!=='string'||!r.unit.trim()||!/^\d{4}-\d{2}-\d{2}$/.test(r.date)||!Number.isFinite(Date.parse(r.date))||new Date(r.date).toISOString().slice(0,10)!==r.date)throw Error('FACTOR_VALUE');
  if(!['market','company','sector','index'].includes(r.scope)||r.scope==='company'&&!codes.includes(r.code)||r.scope==='sector'&&!(typeof r.sector==='string'&&r.sector.length))throw Error('FACTOR_TARGET');
  if(r.scope==='index'){const m=r.membership;if(!r.indexId||!r.codes?.length||r.codes.some(c=>!codes.includes(c))||!m||!sourceURL(m.url)||!/^[a-f0-9]{64}$/.test(m.rawHash??'')||!validTime(m.availableAt)||!validDate(m.effectiveFrom)||!validDate(m.effectiveTo)||m.effectiveFrom>m.effectiveTo||Date.parse(m.availableAt)>Date.parse(r.observedAt))throw Error('FACTOR_INDEX_MEMBERSHIP');}
  if(r.scope==='market'&&(r.code||r.sector||r.indexId)||r.scope==='company'&&(r.sector||r.indexId)||r.scope==='sector'&&(r.code||r.indexId))throw Error('FACTOR_AMBIGUOUS_TARGET');
  for(const k of ['publishedAt','observedAt'])if(!validTime(r[k]))throw Error('FACTOR_TIME');
  if(Date.parse(r.publishedAt)>Date.parse(r.observedAt)||r.date>new Date(r.observedAt).toISOString().slice(0,10))throw Error('FACTOR_TIME_ORDER');
  if(!sourceURL(r.sourceUrl)||!/^[a-f0-9]{64}$/.test(r.rawHash??''))throw Error('FACTOR_SOURCE');
  if(r.supersedesVintageId!=null&&(typeof r.supersedesVintageId!=='string'||!r.supersedesVintageId||r.supersedesVintageId===r.vintageId))throw Error('FACTOR_CORRECTION');
  if(!r.vintageId||!['verified','unverified','not_applicable'].includes(r.adjustmentStatus)||r.licensingStatus!=='permitted')throw Error('FACTOR_PROVENANCE');
  if(!Number.isInteger(r.maxAgeDays)||r.maxAgeDays<0||r.maxAgeDays>730||!['carry','bootstrap'].includes(r.scenarioMode))throw Error('FACTOR_SCENARIO');
  const key=recordKey(r),signature=JSON.stringify(canonical(r));
  if(seen.has(key)){if(seen.get(key)!==signature)throw Error('FACTOR_CONFLICT');continue;}seen.set(key,signature);out.push(canonical(r));
 }
 return out.sort((a,b)=>recordKey(a).localeCompare(recordKey(b))); 
}
export function factorValue(records,factorId,asset,date,asOf,{strict=true}={}){
 const rows=records.filter(r=>r.factorId===factorId&&(r.scope==='market'||r.scope==='company'&&r.code===asset.code||r.scope==='sector'&&r.sector===asset.sector||r.scope==='index'&&r.codes?.includes(asset.code)&&r.membership?.effectiveFrom<=date&&r.membership?.effectiveTo>=date&&Date.parse(r.membership?.availableAt)<=Date.parse(asOf))&&r.date<=date&&Date.parse(r.publishedAt)<=Date.parse(asOf)&&Date.parse(r.observedAt)<=Date.parse(asOf)&&(!strict||r.pointInTimeVerified===true&&r.adjustmentStatus!=='unverified'));
 if(!rows.length)return null;const latest=rows.sort((a,b)=>a.date.localeCompare(b.date)||Date.parse(a.observedAt)-Date.parse(b.observedAt)).at(-1),age=(Date.parse(date)-Date.parse(latest.date))/86400000;
 if(age>latest.maxAgeDays)return null;
 const same=rows.filter(r=>r.date===latest.date),superseded=new Set();
 for(const r of same){if(!r.supersedesVintageId)continue;const prior=same.find(p=>p.vintageId===r.supersedesVintageId&&p.scope===r.scope&&p.code===r.code&&p.sector===r.sector&&p.indexId===r.indexId);if(!prior||Date.parse(prior.publishedAt)>=Date.parse(r.publishedAt)||Date.parse(prior.observedAt)>Date.parse(r.observedAt))return null;superseded.add(prior.vintageId);}
 const heads=same.filter(r=>!superseded.has(r.vintageId));if(!heads.length||heads.some(r=>r.unit!==heads[0].unit||r.value!==heads[0].value))return null;
 return heads.sort((a,b)=>Date.parse(a.observedAt)-Date.parse(b.observedAt)||a.vintageId.localeCompare(b.vintageId)).at(-1);
}
export function pricePanel(input){
 const dates=input.calendar.sessions.filter(d=>d<=input.actualAsOf),returns=input.assets.map(a=>{const m=new Map();for(const p of a.prices){if(m.has(p.date))throw Error('PRICE_DUPLICATE');m.set(p.date,p.quality==='conflict'?null:p.close);}return dates.map((d,j)=>{const p=m.get(d),q=m.get(dates[j-1]);return finite(p)&&p>0&&finite(q)&&q>0?Math.log(p/q):null;});});
 const breadth=dates.map((d,j)=>{const x=returns.map(r=>r[j]);return x.every(finite)?mean(x.map(v=>v>0?1:v<0?-1:0)):null;});
 const basket=dates.map((d,j)=>{const x=returns.map(r=>r[j]);return x.every(finite)?mean(x):null;});
 return{dates,returns,breadth,basket};
}
export function features(history,breadth,basket){if(history.length<60||history.slice(-60).some(x=>!finite(x))||!finite(breadth)||basket.length<5||basket.slice(-5).some(x=>!finite(x)))return null;return[...FACTOR36_POLICY.windows.map(n=>mean(history.slice(-n))),breadth,mean(basket.slice(-5))];}
export const FEATURE_NAMES=['자체 1일','자체 2일','자체 5일','자체 20일','자체 60일','ATLAS52 상승·하락 폭','ATLAS52 5일 평균'];
export const FEATURE_FACTORS=['F35','F35','F35','F35','F35','F11','F11'];
function solve(A,b){const n=b.length,m=A.map((r,i)=>[...r,b[i]]);for(let j=0;j<n;j++){let p=j;for(let i=j+1;i<n;i++)if(Math.abs(m[i][j])>Math.abs(m[p][j]))p=i;if(Math.abs(m[p][j])<1e-15)return null;[m[j],m[p]]=[m[p],m[j]];const d=m[j][j];for(let k=j;k<=n;k++)m[j][k]/=d;for(let i=0;i<n;i++)if(i!==j){const c=m[i][j];for(let k=j;k<=n;k++)m[i][k]-=c*m[j][k];}}return m.map(r=>r[n]);}
export function fitRidge(rows,lambda,mask=null){
 if(rows.length<30)throw Error('TRAINING_TOO_SHORT');const k=rows[0].x.length;
 if(rows.some(r=>r.x.length!==k||r.x.some(v=>!finite(v))||!finite(r.y)))throw Error('NONFINITE_TRAINING');
 const center=Array.from({length:k},(_,j)=>median(rows.map(r=>r.x[j]))),scale=center.map((c,j)=>Math.max(1e-8,1.4826*median(rows.map(r=>Math.abs(r.x[j]-c)))));
 const intercept=lambda===Infinity?0:rows.reduce((s,r)=>s+r.y,0)/(rows.length+252);
 if(lambda===Infinity)return{intercept,center,scale,beta:Array(k).fill(0),n:rows.length,lambda:'zero'};
 const X=rows.map(r=>r.x.map((x,j)=>mask&&!mask.includes(j)?0:(x-center[j])/scale[j]));
 const A=Array.from({length:k},(_,j)=>Array.from({length:k},(_,l)=>mean(X.map(x=>x[j]*x[l]))+(j===l?lambda:0)));
 const b=Array.from({length:k},(_,j)=>mean(X.map((x,i)=>x[j]*(rows[i].y-intercept))));const beta=solve(A,b);if(!beta||beta.some(x=>!finite(x)))throw Error('RIDGE_SINGULAR');return{intercept,center,scale,beta,n:rows.length,lambda};
}
export function components(model,x){if(x.length!==model.beta.length||x.some(v=>!finite(v)))throw Error('INVALID_FEATURE_VECTOR');const cs=x.map((v,j)=>model.beta[j]*(v-model.center[j])/model.scale[j]);return{intercept:model.intercept,values:cs,total:model.intercept+cs.reduce((s,v)=>s+v,0)};}
export function fitVolatility(residuals,kind){
 if(!residuals.length||residuals.some(x=>!finite(x))||!['constant','garch11'].includes(kind))throw Error('VOLATILITY_INPUT');
 const v=Math.max(mean(residuals.map(r=>r*r)),1e-12);if(kind==='constant')return{kind,omega:v,a:0,b:0,initial:v,last:v};
 let best=null;for(const a of [.02,.06,.12])for(const b of [.75,.85,.93]){if(a+b>=.995)continue;const omega=v*(1-a-b);let h=v,nll=0;for(const e of residuals){nll+=Math.log(h)+e*e/h;h=omega+a*e*e+b*h;}if(!best||nll<best.nll)best={kind:'garch11',omega,a,b,initial:v,last:h,nll};}return best;
}
export function volatilityNext(model,h,error){const v=model.omega+model.a*error*error+model.b*h;if(!finite(v)||v<=0)throw Error('INVALID_VARIANCE');return v;}
export function empiricalCRPS(sorted,y){const n=sorted.length;if(!n||!finite(y)||sorted.some(x=>!finite(x)))throw Error('CRPS_INPUT');let first=0,pair=0;for(let j=0;j<n;j++){first+=Math.abs(sorted[j]-y);pair+=(2*j-n+1)*sorted[j];}return first/n-pair/(n*n);}
export function intervalScore(low,high,y,alpha=.2){if(![low,high,y,alpha].every(finite)||low>high||alpha<=0||alpha>=1)throw Error('INTERVAL_INPUT');return high-low+(y<low?2*(low-y)/alpha:0)+(y>high?2*(y-high)/alpha:0);}
export function direction(r){return r>.001?'up':r<-.001?'down':'flat';}
export function distributionScore(shocks,mu,sigma,y){
 const sorted=shocks.map(z=>mu+sigma*z).sort((a,b)=>a-b),p={up:0,flat:0,down:0};for(const x of sorted)p[direction(Math.expm1(x))]++;for(const k in p)p[k]/=sorted.length;
 const actual=direction(Math.expm1(y)),low=quantile(sorted,.1),high=quantile(sorted,.9),medianLogReturn=quantile(sorted,.5),directionSelected=['flat','up','down'].sort((a,b)=>p[b]-p[a])[0];
 const absolutePriceError=Math.abs(Math.expm1(medianLogReturn-y)),bandWidthPrice=Math.exp(high)-Math.exp(low);
 return{crps:empiricalCRPS(sorted,y),brier:['up','flat','down'].reduce((s,k)=>s+(p[k]-(actual===k?1:0))**2,0),interval:intervalScore(low,high,y),covered:y>=low&&y<=high,probabilities:p,medianLogReturn,bandWidthLog:high-low,bandWidthPrice:Number.isFinite(bandWidthPrice)?bandWidthPrice:null,absolutePriceError:Number.isFinite(absolutePriceError)?absolutePriceError:null,directionSelected,directionActual:actual,directionCorrect:directionSelected===actual};
}
const diagnosticMean=(rows,key)=>{const values=rows.map(r=>r[key]).filter(finite);return values.length?mean(values):null;};
function fitted(rows,lambda,volKind,mask){const regression=fitRidge(rows,lambda,mask),errors=rows.map(r=>r.y-components(regression,r.x).total),volatility=fitVolatility(errors,volKind);let h=volatility.initial;const raw=errors.map(e=>{const z=e/Math.sqrt(h);h=volatilityNext(volatility,h,e);return z;});const c=mean(raw),s=Math.sqrt(variance(raw))||1;return{regression,volatility,shocks:raw.map(x=>(x-c)/s),shockDates:rows.map(r=>r.date),shockMeanRemoved:c,shockScale:s};}
function evaluate(model,rows){let h=model.volatility.last;return rows.map(r=>{const mu=components(model.regression,r.x).total,score=distributionScore(model.shocks,mu,Math.sqrt(h),r.y);h=volatilityNext(model.volatility,h,r.y-mu);return{date:r.date,...score,meanLogReturn:mu,actualLogReturn:r.y};});}
export function fitFactorModel(rows,{featureFactors=FEATURE_FACTORS}={}){
 const policy=FACTOR36_POLICY,all=rows.filter(r=>r.date<policy.trainingBefore).slice().sort((a,b)=>a.date.localeCompare(b.date));
 if(all.some((r,j)=>!validDate(r.date)||j&&r.date===all[j-1].date||r.x.length!==featureFactors.length||r.x.some(v=>!finite(v))||!finite(r.y)))throw Error('TRAINING_CHRONOLOGY_OR_VALUES');
 const end=all.length-policy.holdoutDays,innerStart=end-policy.innerDays;
 if(innerStart<policy.minimumTrain)return{status:'insufficient_history',reason:'최소 학습160 + 선택40 + 별도 평가60 거래일 미충족'};
 const train=all.slice(Math.max(0,innerStart-policy.maxTrain),innerStart),inner=all.slice(innerStart,end),holdout=all.slice(end);
 const candidatesFor=mask=>{const candidates=[];for(const lambda of [Infinity,...policy.penalties])for(const kind of ['constant','garch11']){const model=fitted(train,lambda,kind,mask),score=evaluate(model,inner);candidates.push({id:(lambda===Infinity?'zero':'ridge'+lambda)+'-'+kind,lambda:lambda===Infinity?'zero':lambda,kind,loss:mean(score.map(x=>x.crps))});}return candidates.sort((a,b)=>a.loss-b.loss||a.id.localeCompare(b.id));};
 // Fixed-order forward selection uses only the inner dates. It is a research candidate screen, not proof of economic causation.
 const optional=[...new Set(featureFactors.filter(f=>!['F11','F35','F36'].includes(f)))].sort();
 let mask=featureFactors.map((f,j)=>optional.includes(f)?-1:j).filter(j=>j>=0),candidates=candidatesFor(optional.length?mask:null);const decisions=[];
 for(const factorId of optional){const trialMask=[...mask,...featureFactors.map((f,j)=>f===factorId?j:-1).filter(j=>j>=0)].sort((a,b)=>a-b),trial=candidatesFor(trialMask),before=candidates[0].loss,after=trial[0].loss,accepted=after<before-1e-12;decisions.push({factorId,accepted,innerCRPSWithout:before,innerCRPSWith:after,reason:accepted?'inner_crps_improved':'no_incremental_inner_crps_gain',validatedImportance:null});if(accepted){mask=trialMask;candidates=trial;}}
 const activeMask=optional.length?mask:null,selected=candidates[0],lambda=selected.lambda==='zero'?Infinity:selected.lambda,pre=all.slice(Math.max(0,end-policy.maxTrain),end),outerModel=fitted(pre,lambda,selected.kind,activeMask),outer=evaluate(outerModel,holdout),baseline=evaluate(fitted(pre,Infinity,'constant'),holdout);
 const final=fitted(all.slice(-policy.maxTrain),lambda,selected.kind,activeMask),ablations=[];
 for(const group of [...new Set(featureFactors)]){const ablationMask=featureFactors.map((g,j)=>g===group||activeMask&&!activeMask.includes(j)?-1:j).filter(j=>j>=0),refit=fitted(train,lambda,selected.kind,ablationMask),ev=evaluate(refit,inner);ablations.push({factorId:group,scope:'internal_selection_diagnostic',relativeGain:(mean(ev.map(x=>x.crps))-selected.loss)/Math.max(mean(ev.map(x=>x.crps)),1e-12),validatedImportance:null});}
 return{status:'research_estimate',...final,featureFactors,selected,candidates,ablations,factorSelection:{method:'forward_inner_crps_fixed_factor_id_order',first:inner[0].date,last:inner.at(-1).date,holdoutUsed:false,decisions,acceptedFeatureIndices:activeMask??featureFactors.map((_,j)=>j),liveAdvantageProven:false},trainedThrough:all.at(-1).date,trainCount:all.length,validation:{kind:'chronological_holdout_retrospective_prices',strictPointInTime:false,priceAdjustmentsVerified:false,usedForSelection:false,first:holdout[0].date,last:holdout.at(-1).date,days:holdout.length,rows:outer.map((r,j)=>({...r,baseline:baseline[j]})),crps:mean(outer.map(x=>x.crps)),baselineCRPS:mean(baseline.map(x=>x.crps)),brier:mean(outer.map(x=>x.brier)),baselineBrier:mean(baseline.map(x=>x.brier)),interval:mean(outer.map(x=>x.interval)),baselineInterval:mean(baseline.map(x=>x.interval)),directionAccuracy:mean(outer.map(x=>Number(x.directionCorrect))),baselineDirectionAccuracy:mean(baseline.map(x=>Number(x.directionCorrect))),coverage:mean(outer.map(x=>Number(x.covered))),baselineCoverage:mean(baseline.map(x=>Number(x.covered))),absolutePriceError:diagnosticMean(outer,'absolutePriceError'),baselineAbsolutePriceError:diagnosticMean(baseline,'absolutePriceError'),bandWidthLog:diagnosticMean(outer,'bandWidthLog'),baselineBandWidthLog:diagnosticMean(baseline,'bandWidthLog'),bandWidthPrice:diagnosticMean(outer,'bandWidthPrice'),baselineBandWidthPrice:diagnosticMean(baseline,'bandWidthPrice'),diagnosticCounts:{absolutePriceError:outer.filter(x=>finite(x.absolutePriceError)).length,baselineAbsolutePriceError:baseline.filter(x=>finite(x.absolutePriceError)).length,bandWidthPrice:outer.filter(x=>finite(x.bandWidthPrice)).length,baselineBandWidthPrice:baseline.filter(x=>finite(x.bandWidthPrice)).length},metricUnits:{absolutePriceError:'absolute_fraction_of_actual_target_price',bandWidthPrice:'fraction_of_previous_close',bandWidthLog:'log_return',directionAccuracy:'share_of_dates',coverage:'share_of_dates',centralInterval:.8},liveAdvantageProven:false},trustProbability:null};
}
export function examplesFor(panel,assetIndex){const ys=panel.returns[assetIndex],out=[];for(let j=60;j<ys.length;j++){const x=features(ys.slice(j-60,j),panel.breadth[j-1],panel.basket.slice(Math.max(0,j-5),j));if(x&&finite(ys[j]))out.push({date:panel.dates[j],x,y:ys[j]});}return out;}
export function forecastChoice(counts,n){if(!Number.isInteger(n)||n<=0||['up','flat','down'].some(k=>!Number.isInteger(counts[k])||counts[k]<0)||Object.values(counts).reduce((s,v)=>s+v,0)!==n)throw Error('CHOICE_COUNTS');const probabilities=Object.fromEntries(Object.entries(counts).map(([k,v])=>[k,v/n])),order=['flat','up','down'].sort((a,b)=>probabilities[b]-probabilities[a]);return{selected:order[0],probabilities,modelProbability:probabilities[order[0]],runnerUpGap:probabilities[order[0]]-probabilities[order[1]],monteCarloSE:Math.sqrt(probabilities[order[0]]*(1-probabilities[order[0]])/n),trustProbability:null,calibrated:false};}
export function rng(seed){let s=seed>>>0;return()=>{s=(Math.imul(1664525,s)+1013904223)>>>0;return s/4294967296;};}
