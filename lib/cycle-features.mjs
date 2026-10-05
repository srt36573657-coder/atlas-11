import {CYCLE_PROTOCOL as P} from './cycle-protocol.mjs';
import {mean,variance,robustScale,ridge,predict,phaseMembership} from './cycle-math.mjs';
export function logReturns(rows,sessions){
 const prices=new Map(rows.filter(r=>r.close>0&&r.quality!=='conflict').map(r=>[r.date,r.close])),out=[];
 for(let i=1;i<sessions.length;i++){const a=prices.get(sessions[i-1]),b=prices.get(sessions[i]);out.push({date:sessions[i],value:a>0&&b>0?Math.log(b)-Math.log(a):null});}
 return out;
}
export function sectorInnovations(market,sector,sessions){
 const m=logReturns(market.rows,sessions),s=logReturns(sector.rows,sessions),out=[];
 const prefix=Array.from({length:6},()=>[0]);
 for(let i=0;i<m.length;i++){
  const x=m[i].value,y=s[i].value,ok=Number.isFinite(x)&&Number.isFinite(y);
  const values=ok?[1,x,y,x*x,x*y,y*y]:[0,0,0,0,0,0];
  values.forEach((v,j)=>prefix[j].push(prefix[j].at(-1)+v));
  let value=null;
  if(i>=P.exposureWindow&&ok){
   const n=P.exposureWindow,v=prefix.map(a=>a[i]-a[i-n]);
   if(v[0]===n){
    const xx=Math.max(0,v[3]-v[1]*v[1]/n),xy=v[4]-v[1]*v[2]/n;
    const scale2=xx/(n-1);
    if(scale2>P.epsilon**2){const beta=xy/(xx+P.residualRidge*scale2),intercept=v[2]/n-beta*v[1]/n;value=y-intercept-beta*x;}
   }
  }
  out.push({date:m[i].date,value});
 }
 return {market:m,sector:s,residual:out};
}
export function causalStates(rows){
 const out=[],prefix=[0],valid=[0];
 for(let i=0;i<rows.length;i++){
  const ok=Number.isFinite(rows[i].value);prefix.push(prefix.at(-1)+(ok?rows[i].value:0));valid.push(valid.at(-1)+(ok?1:0));
  let T=null;
  if(i>=251&&valid[i+1]-valid[i-251]===252){
   const sd=Math.sqrt(variance(rows.slice(i-62,i+1).map(r=>r.value)));
   if(sd>P.epsilon)T=mean(P.trendWindows.map(h=>(prefix[i+1]-prefix[i+1-h])/(sd*Math.sqrt(h))));
  }
  const old=out[i-P.accelerationLag]?.trend;
  out.push({date:rows[i].date,trend:T,acceleration:T!=null&&old!=null?T-old:null});
 }
 return out;
}
export function stateAt(states,date){
 const i=states.findLastIndex(r=>r.date<=date);if(i<0||states[i].trend==null||states[i].acceleration==null)return null;
 const prior=states.slice(0,i).filter(r=>r.trend!=null&&r.acceleration!=null).slice(-252);
 const st=robustScale(prior.map(r=>r.trend)),sa=robustScale(prior.map(r=>r.acceleration));
 const membership=prior.length>=60&&st>P.epsilon&&sa>P.epsilon?phaseMembership(states[i].trend/st,states[i].acceleration/sa):null;
 const labels={risingFaster:'상승·가속',risingSlower:'상승·둔화',fallingFaster:'하락·가속',recovering:'하락·회복'};
 const peak=membership?Object.entries(membership).sort((a,b)=>b[1]-a[1])[0]:null;
 return {...states[i],membership,label:peak&&peak[1]>=P.stateThreshold?labels[peak[0]]:'혼재',meaning:'state_membership_not_probability',scalingHistory:prior.length};
}
export function stockExposure(asset,aligned,sessions,date){
 const returns=logReturns(asset.prices,sessions),n=returns.findLastIndex(r=>r.date<=date),start=Math.max(0,n-P.exposureWindow+1);
 const rows=returns.slice(start,n+1).map((r,j)=>({stock:r.value,market:aligned.market[start+j]?.value,sector:aligned.residual[start+j]?.value}));
 // Missing middle sessions break the trailing window; do not splice distant days together.
 let cut=rows.findLastIndex(r=>![r.stock,r.market,r.sector].every(Number.isFinite));const clean=rows.slice(cut+1);
 if(clean.length<P.minimumExposureRows)return null;
 try{
  const center=[mean(clean.map(r=>r.market)),mean(clean.map(r=>r.sector))],scale=[Math.sqrt(variance(clean.map(r=>r.market))),Math.sqrt(variance(clean.map(r=>r.sector)))];
  if(scale.some(v=>!(v>P.epsilon)))return null;
  const fit=ridge(clean.map(r=>[(r.market-center[0])/scale[0],(r.sector-center[1])/scale[1]]),clean.map(r=>r.stock),P.exposureRidge,{intercept:true});
  const coefficients=fit.coefficients.map((v,j)=>v/scale[j]);
  return {...fit,coefficients,intercept:fit.intercept-coefficients.reduce((s,v,j)=>s+v*center[j],0),count:clean.length,date:returns[n]?.date,penaltyBasis:P.exposurePenaltyBasis};
 }catch{return null;}
}
export function prepareCycleFeatures(asset,market,sector,calendar,date,{shared}={}){
 const sessions=calendar.sessions.filter(d=>d<=date),aligned=shared?.aligned??sectorInnovations(market,sector,sessions);
 const marketStates=shared?.marketStates??causalStates(aligned.market),sectorStates=shared?.sectorStates??causalStates(aligned.residual);
 const m=stateAt(marketStates,date),s=stateAt(sectorStates,date),exposure=stockExposure(asset,aligned,sessions,date);
 const vector=m&&s&&exposure?[exposure.coefficients[0]*m.trend,exposure.coefficients[0]*m.acceleration,exposure.coefficients[1]*s.trend,exposure.coefficients[1]*s.acceleration]:null;
 return {date,market:m,sector:s,exposure,vector,aligned,marketStates,sectorStates,
  missing:!m?'시장 주기 연속 이력 부족':!s?'업종 고유 주기 연속 이력 부족':!exposure?'이 종목의 연속 민감도 표본 부족':null};
}
