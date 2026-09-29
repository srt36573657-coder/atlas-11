// Shadow-only joint price/state simulation; no promotion of synthetic results.
import {fitResidual,predictResidual} from './fomo-model-v2.mjs';
import {FOMO_V2} from './fomo-v2.mjs';
const finite=x=>typeof x==='number'&&Number.isFinite(x);
const logit=x=>Math.log(Math.max(1e-4,Math.min(1-1e-4,x))/(1-Math.max(1e-4,Math.min(1-1e-4,x))));
const logistic=x=>x>=0?1/(1+Math.exp(-x)):Math.exp(x)/(1+Math.exp(x));
const vector=s=>[...s,s[0]*s[2],s[2]*s[3]];
export function fitJointFomo(rows,{code,cutoff,lambda=5}={}){
 if(!/^\d{6}$/.test(code)||!/^\d{4}-\d{2}-\d{2}$/.test(cutoff??''))throw Error('Code/cutoff required');
 const r=rows.filter(r=>r.code===code&&r.horizon===1&&r.featureVersion===FOMO_V2&&r.date<r.targetDate&&r.targetDate<=cutoff&&r.pointInTimeVerified===true&&r.adjustmentsVerified===true&&r.vector?.length===6&&r.vector.every(x=>finite(x)&&x>=0&&x<=1)&&r.nextState?.length===4&&r.nextState.every(x=>finite(x)&&x>=0&&x<=1)&&finite(r.actualLogReturn)&&finite(r.baseLogReturn)&&Number.isFinite(Date.parse(r.observedAt))&&Date.parse(r.observedAt)<=Date.parse(r.issuedAt)&&r.issuedAt?.slice(0,10)===r.date).sort((a,b)=>a.date.localeCompare(b.date));
 if(new Set(r.map(x=>x.date)).size!==r.length)throw Error('Duplicate daily labels');
 if(r.length<60)return{status:'insufficient_evidence',code,count:r.length,enabled:false};
 const coefficients=fitResidual(r,{lambda});
 const transitions=Array.from({length:4},(_,j)=>fitResidual(r.map(x=>({...x,baseLogReturn:0,actualLogReturn:logit(x.nextState[j])-logit(x.vector[j])})),{lambda}));
 const residuals=r.map(x=>({date:x.date,targetDate:x.targetDate,shock:[x.actualLogReturn-x.baseLogReturn-predictResidual(coefficients,x.vector),...transitions.map((c,j)=>logit(x.nextState[j])-logit(x.vector[j])-predictResidual(c,x.vector))]}));
 // Recenter shocks; conditional intercept remains in the fitted coefficients.
 const means=Array.from({length:5},(_,j)=>residuals.reduce((s,r)=>s+r.shock[j],0)/r.length);
 for(const x of residuals)x.shock=x.shock.map((v,j)=>v-means[j]);
 return{version:FOMO_V2,code,cutoff,lambda,count:r.length,coefficients,transitions,residuals,status:'shadow_research',enabled:false,trustProbability:null,stateTransform:'logit epsilon 0.0001; no price/return clipping',intervalCalibration:'unverified'};
}
export function simulateFomoPath(model,{state,originPrice,baseIncrements,paths=1000,seed=1729,blockLength=3}={}){
 if(model.status!=='shadow_research'||!(originPrice>0)||!finite(originPrice)||state?.length!==4||!state.every(x=>finite(x)&&x>=0&&x<=1)||!Number.isInteger(paths)||paths<100||paths>100000||!Number.isInteger(seed)||!Number.isInteger(blockLength)||blockLength<1||!Array.isArray(baseIncrements)||!baseIncrements.length||baseIncrements.some(x=>!finite(x.mean)||x.date<=model.cutoff)||baseIncrements.some((x,i)=>i&&x.date<=baseIncrements[i-1].date))throw Error('Invalid shadow path contract');
 let rng=seed>>>0;const random=()=>{rng=(Math.imul(1664525,rng)+1013904223)>>>0;return rng/4294967296;};
 const columns=baseIncrements.map(()=>[]);let overflow=0;
 for(let p=0;p<paths;p++){
  let s=[...state],logPrice=Math.log(originPrice),index=0,remaining=0;
  for(let k=0;k<baseIncrements.length;k++){
   if(!remaining){index=Math.floor(random()*model.residuals.length);remaining=blockLength;}
   const record=model.residuals[index],shock=record.shock,x=vector(s);
   logPrice+=baseIncrements[k].mean+predictResidual(model.coefficients,x)+shock[0];
   s=s.map((v,j)=>logistic(logit(v)+predictResidual(model.transitions[j],x)+shock[j+1]));
   const price=Math.exp(logPrice);if(!finite(price)||price===0){columns[k].push(null);overflow++;}else columns[k].push(price);
   remaining--;const next=index+1;if(next>=model.residuals.length||model.residuals[next].date!==record.targetDate)remaining=0;index=next;
  }
 }
 return{code:model.code,status:'shadow_research',enabled:false,trustProbability:null,paths,seed,blockLength,overflow,causal:false,intervalCalibration:'unverified',rows:columns.map((values,k)=>{if(values.some(x=>x===null))return{date:baseIncrements[k].date,p10:null,p50:null,p90:null,status:'numeric_range_exceeded'};values.sort((a,b)=>a-b);const q=p=>values[Math.floor((values.length-1)*p)];return{date:baseIncrements[k].date,p10:q(.1),p50:q(.5),p90:q(.9),status:'research_only'};})};
}
