import {rng,quantile} from './engine.mjs';
export const average=a=>a.length?a.reduce((s,x)=>s+x,0)/a.length:null;
export function nonOverlappingOrigins(folds) {
  const selected=[];let end='';
  for(const f of [...folds].sort((a,b)=>a.origin.localeCompare(b.origin)))if(f.origin>end){selected.push(f.origin);end=f.end;}
  return selected;
}
// Resample whole date groups, never stock rows. Paired differences use the same blocks.
// Consecutive two-origin blocks reduce (but cannot remove) serial-dependence assumptions.
export function blockInterval(values,{replications=10000,seed=260924,blockLength=2}={}) {
  if(values.length<2)return {estimate:average(values),low:null,high:null,groups:values.length,replications:0};
  const random=rng(seed),draws=[];
  for(let b=0;b<replications;b++){
    const selected=[];
    while(selected.length<values.length){const start=Math.floor(random()*values.length);for(let j=0;j<blockLength&&selected.length<values.length;j++)selected.push(values[(start+j)%values.length]);}
    draws.push(average(selected));
  }
  draws.sort((a,b)=>a-b);
  return {estimate:average(values),low:quantile(draws,.025),high:quantile(draws,.975),groups:values.length,replications,blockLength,
    interpretation:'표본·시간 의존 가정하의 95% 부트스트랩 구간. 투자 성공 확률이 아님'};
}
export function intervalScore(low,high,actual,alpha=.2) {
  return high-low+2/alpha*Math.max(0,low-actual)+2/alpha*Math.max(0,actual-high);
}
export function logLoss(p,y){p=Math.max(1e-6,Math.min(1-1e-6,p));return -(y*Math.log(p)+(1-y)*Math.log(1-p));}
