import {calculateFomoV2} from './fomo-v2.mjs';
// Exploratory, company-specific empirical response paths. Never a live accuracy certificate.
export const WAVE_POLICY=Object.freeze({id:'atlas-news-wave-1',lags:3,baselineDays:20,minimumTemplates:5,ordinaryBlock:3,flatRate:.001,paths:100000,seed:20260917,trainingBefore:'2026-09-17',causal:false,trustProbability:null});
const finite=x=>typeof x==='number'&&Number.isFinite(x);
const avg=a=>a.reduce((s,v)=>s+v,0)/a.length;
const time=s=>typeof s==='string'&&Number.isFinite(Date.parse(s))?Date.parse(s):NaN;
export function chooseDirection(counts,n){
 if(!Number.isInteger(n)||n<=0||['up','flat','down'].some(k=>!Number.isInteger(counts[k])||counts[k]<0)||Object.values(counts).reduce((a,b)=>a+b,0)!==n)throw Error('Invalid probability counts');
 const probabilities=Object.fromEntries(['up','flat','down'].map(k=>[k,counts[k]/n]));
 const order=['flat','up','down'].sort((a,b)=>probabilities[b]-probabilities[a]);
 const selected=order[0],p=probabilities[selected];return{selected,probabilities,modelProbability:p,runnerUpGap:p-probabilities[order[1]],monteCarloSE:Math.sqrt(p*(1-p)/n),tieRule:'flat_then_up_then_down',trustProbability:null,calibrated:false};
}
export const classify=r=>r>WAVE_POLICY.flatRate?'up':r< -WAVE_POLICY.flatRate?'down':'flat';
export function ownReturns(asset,sessions,cutoff){
 const prices=new Map();for(const p of asset.prices){if(p.date>cutoff)continue;if(prices.has(p.date))throw Error('Duplicate price '+asset.code+' '+p.date);prices.set(p.date,p.quality==='conflict'?null:p.close);}
 return sessions.flatMap((date,j)=>{const p=prices.get(date),prev=prices.get(sessions[j-1]);return date<=cutoff&&finite(p)&&p>0&&finite(prev)&&prev>0?[{date,index:j,value:Math.log(p/prev)}]:[];});
}
export function prepareWave(asset,profile,input,{informationCutoff}={}){
 const sessions=input.calendar.sessions,trainingCutoff=sessions.filter(d=>d<WAVE_POLICY.trainingBefore).at(-1);
 const returns=ownReturns(asset,sessions,trainingCutoff),byIndex=new Map(returns.map(r=>[r.index,r]));
 const rawEvents=new Map(input.events.map(e=>[e.id,e])),seen=new Set(),events=[];
 for(const n of profile.news??[]){
  const source=rawEvents.get(n.id),phase=source?.phaseId??source?.kind??n.kind,key=JSON.stringify([n.economicEventId??source?.economicEventId??n.id,phase]);
  const out={id:n.id,name:n.name,date:n.date,phase,sources:n.sources??[],templates:[],excluded:[],status:'withheld',reason:null,causal:false};events.push(out);
  if(seen.has(key)){out.reason='duplicate_event_phase';continue;}seen.add(key);
  const scope=n.scope?.type;const applies=scope==='market'||scope==='company'&&n.scope.codes?.includes(asset.code)||scope==='sector'&&n.scope.sectors?.includes(asset.sector)||scope==='index'&&n.evidenceAssessment?.scheduleVerified&&n.scope.codes?.includes(asset.code)&&source?.compositionSource&&source?.compositionPublishedAt&&source?.effectiveFrom&&source?.effectiveTo;
  if(!applies){out.reason='unverified_target';continue;}
  if(n.evidenceAssessment?.classification!=='price_evidence_candidate'||!n.evidenceAssessment?.source?.verified){out.reason='context_or_unverified_source';continue;}
  if(!source||!finite(time(source.availableAt??source.publishedAt))||time(source.availableAt??source.publishedAt)>time(informationCutoff)||!finite(time(source.observedAt))||time(source.observedAt)>time(informationCutoff)){out.reason='unavailable_at_information_cutoff';continue;}
  if(!sessions.includes(n.date)||n.date<=input.actualAsOf||n.date>input.end){out.reason='outside_forecast';continue;}
  const usedDates=new Set(),usedIds=new Set();
  for(const s of [...(n.samples??[])].sort((a,b)=>a.date.localeCompare(b.date))){
   const idx=sessions.indexOf(s.date),id=s.economicEventId??s.id,record={id,date:s.date};let reason=null;
   if(s.code!==asset.code||s.kind!==n.kind||(s.phaseId??s.kind)!==phase)reason='company_or_phase_mismatch';
   else if(!finite(time(s.availableAt))||time(s.availableAt)>time(informationCutoff)||!finite(time(s.sourceObservedAt??source.observedAt))||time(s.sourceObservedAt??source.observedAt)>time(informationCutoff))reason='historical_evidence_not_available';
   else if(usedIds.has(id))reason='duplicate_economic_event';
   else if(idx<20||!sessions[idx+WAVE_POLICY.lags-1]||sessions[idx+WAVE_POLICY.lags-1]>trainingCutoff)reason='future_or_short_window';
   const before=Array.from({length:20},(_,j)=>byIndex.get(idx-20+j));const after=Array.from({length:WAVE_POLICY.lags},(_,j)=>byIndex.get(idx+j));
   if(!reason&&[...before,...after].some(x=>!x))reason='noncontinuous_prices';
   if(!reason&&after.some(x=>usedDates.has(x.date)))reason='overlapping_historical_window';
   if(reason){out.excluded.push({...record,reason});continue;}
   usedIds.add(id);after.forEach(x=>usedDates.add(x.date));const baseline=avg(before.map(x=>x.value));
   out.templates.push({...record,code:asset.code,phase,baseline,values:after.map(x=>x.value-baseline),dates:after.map(x=>x.date),priceVintageVerified:s.priceVintageVerified===true,corporateActionsChecked:s.corporateActionsChecked===true});
  }
  if(out.templates.length<WAVE_POLICY.minimumTemplates){out.reason='fewer_than_5_templates';continue;}
  out.status='exploratory';out.reason='observational_response_not_causal';
  out.kernel=Array.from({length:WAVE_POLICY.lags},(_,k)=>avg(out.templates.map(t=>t.values[k])));
  out.energy=out.kernel.reduce((s,x)=>s+Math.abs(x),0);out.netLogResponse=out.kernel.reduce((s,x)=>s+x,0);
  out.peakLag=out.kernel.reduce((best,v,k)=>Math.abs(v)>Math.abs(out.kernel[best])?k:best,0);
  out.reversal=out.kernel.some((x,k)=>k>0&&x*out.kernel[k-1]<0);out.windowSessions=WAVE_POLICY.lags;
 }
 // Refuse overlapping future kernels. Do not delete adverse outcomes or context-only dates.
 const eligible=events.filter(e=>e.status==='exploratory');
 for(const e of eligible)if(eligible.some(o=>o!==e&&Math.abs(sessions.indexOf(o.date)-sessions.indexOf(e.date))<WAVE_POLICY.lags)){e.status='withheld';e.reason='overlapping_future_waves_no_joint_evidence';}
 const active=events.filter(e=>e.status==='exploratory'),reserved=new Set(active.flatMap(e=>e.templates.flatMap(t=>t.dates)));
 const ordinary=returns.filter(r=>!reserved.has(r.date)).slice(-504),center=ordinary.length?avg(ordinary.map(x=>x.value)):null;
 if(ordinary.length<60)throw Error('Insufficient own ordinary returns '+asset.code);
 const shocks=ordinary.map(r=>({...r,value:r.value-center}));
 const blocks=shocks.flatMap((r,i)=>{const b=shocks.slice(i,i+WAVE_POLICY.ordinaryBlock);return b.length===WAVE_POLICY.ordinaryBlock&&b.every((v,k)=>v.index===r.index+k)?[b.map(v=>v.value)]:[];});
 if(!blocks.length)throw Error('No consecutive own return blocks');
 const observedFomo=calculateFomoV2({input,code:asset.code,date:input.actualAsOf});
 return{code:asset.code,events,blocks,ordinaryCount:ordinary.length,trainingCutoff,ordinaryMean:center,priceBasis:'NAVER_single_provider_unadjusted_vintage_unverified',fomo:{enabled:false,value:observedFomo.score,missing:observedFomo.missing,coverage:observedFomo.coverage,total:observedFomo.total,vector:observedFomo.vector,asOf:input.actualAsOf,reason:observedFomo.score===null?'verified_attention_volume_flow_inputs_missing':'joint_news_fomo_residual_training_missing'},trustProbability:null};
}
function rng(seed){let s=seed>>>0;return()=>{s=(Math.imul(s,1664525)+1013904223)>>>0;return s/4294967296;};}
const quantile=(a,p)=>{const i=(a.length-1)*p,l=Math.floor(i);return a[l]+(a[Math.ceil(i)]-a[l])*(i-l);};
export function simulateWave(prepared,{originPrice,dates,baseMeans,paths=WAVE_POLICY.paths,seed=WAVE_POLICY.seed}={}){
 if(!finite(originPrice)||originPrice<=0||!Number.isInteger(paths)||paths<100||paths>100000||!Number.isInteger(seed)||dates.length!==baseMeans.length||!dates.length||baseMeans.some(x=>!finite(x))||dates.some((d,i)=>i&&d<=dates[i-1]))throw Error('Invalid simulation contract');
 const active=prepared.events.filter(e=>e.status==='exploratory');const eventAt=dates.map(date=>active.findIndex(e=>e.date===date));
 const random=rng(seed),cols=dates.map(()=>new Float64Array(paths)),increments=dates.map(()=>new Float64Array(paths));
 let invalidPaths=0,lossPaths=0,minTerminal=Infinity,maxTerminal=0;
 for(let p=0;p<paths;p++){
  let logP=Math.log(originPrice),block=null,k=0,wave=null,lag=0,invalid=false;
  for(let d=0;d<dates.length;d++){
   if(eventAt[d]>=0){const e=active[eventAt[d]];wave=e.templates[Math.floor(random()*e.templates.length)].values;lag=0;block=null;}
   let shock;
   if(wave){shock=wave[lag++];if(lag===wave.length)wave=null;}
   else{if(!block||k>=block.length){block=prepared.blocks[Math.floor(random()*prepared.blocks.length)];k=0;}shock=block[k++];}
   const r=baseMeans[d]+shock;logP+=r;const price=Math.exp(logP),rate=Math.expm1(r);
   if(!finite(price)||price<=0||!finite(rate)){invalid=true;cols[d][p]=NaN;increments[d][p]=NaN;}else{cols[d][p]=price;increments[d][p]=rate;}
  }
  if(invalid)invalidPaths++;else{const last=cols.at(-1)[p];if(last<originPrice)lossPaths++;minTerminal=Math.min(minTerminal,last);maxTerminal=Math.max(maxTerminal,last);}
 }
 // Never renormalize by surviving paths: any numerical overflow blocks this release.
 if(invalidPaths)throw Error('NUMERIC_RANGE_EXCEEDED: '+invalidPaths+' / '+paths+' paths. No paths silently removed.');
 const rows=dates.map((date,d)=>{
  const c=cols[d],r=increments[d],daily={up:0,flat:0,down:0},terminal={up:0,flat:0,down:0};let sum=0,rateSum=0;
  for(let p=0;p<paths;p++){daily[classify(r[p])]++;terminal[classify(c[p]/originPrice-1)]++;sum+=c[p];rateSum+=Math.log1p(r[p]);}
  c.sort();r.sort();const e=active.find(e=>{const idx=dates.indexOf(e.date);return d>=idx&&d<idx+WAVE_POLICY.lags;}),lag=e?d-dates.indexOf(e.date):null;
  return{date,p10:quantile(c,.1),p50:quantile(c,.5),p90:quantile(c,.9),mean:sum/paths,monteCarloMean:sum/paths,probUp:terminal.up/paths,return:quantile(c,.5)/originPrice-1,anchor:false,eventIds:e?[e.id]:[],numericStatus:'finite',probabilityStatus:'model_frequency_uncalibrated',wave:{daily:chooseDirection(daily,paths),horizon:chooseDirection(terminal,paths),baseMeanLogReturn:baseMeans[d],newsMeanLogReturn:e?e.kernel[lag]:0,eventId:e?.id??null,eventName:e?.name??null,lag,templateCount:e?.templates.length??0,fomoLogReturn:null,fomoStatus:prepared.fomo.reason},dailyMovement:{meanLogReturn:rateSum/paths,returnP10:quantile(r,.1),returnP90:quantile(r,.9),upModelShare:daily.up/paths,downModelShare:daily.down/paths}};
 });
 return{rows,audit:{attempted:paths,validatedPaths:paths,invalidPaths,lossPathsRetained:lossPaths,deletedForLoss:0,minTerminal,maxTerminal,independentAccuracyTests:0},trustProbability:null};
}
