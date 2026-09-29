import {compensatedSum} from './news-numerics-v7.mjs';
export const sum = compensatedSum;
export const mean = a => a.length ? sum(a)/a.length : null;
export function variance(a) { if(a.length<2)return null;const m=mean(a);return sum(a.map(v=>(v-m)**2))/(a.length-1); }
export function median(a) { if(!a.length)return null;const s=[...a].sort((a,b)=>a-b),i=Math.floor(s.length/2);return s.length%2?s[i]:(s[i-1]+s[i])/2; }
export function quantile(a,q) { if(!a.length)return null;const s=[...a].sort((a,b)=>a-b),x=(s.length-1)*q,i=Math.floor(x);return s[i]+(s[Math.min(i+1,s.length-1)]-s[i])*(x-i); }
export function robustScale(a) { const m=median(a);return m==null?null:1.4826*median(a.map(v=>Math.abs(v-m))); }
export function correlation(a,b) {
 if(a.length!==b.length||a.length<3)return null;
 const ma=mean(a),mb=mean(b),aa=sum(a.map(v=>(v-ma)**2)),bb=sum(b.map(v=>(v-mb)**2));
 return aa>1e-24&&bb>1e-24?sum(a.map((v,i)=>(v-ma)*(b[i]-mb)))/Math.sqrt(aa*bb):null;
}
export function standardizer(rows) {
 if(!rows.length)return null;
 const center=rows[0].map((_,j)=>median(rows.map(r=>r[j]))),scale=rows[0].map((_,j)=>robustScale(rows.map(r=>r[j])));
 return scale.every(s=>Number.isFinite(s)&&s>1e-12)?{center,scale}:null;
}
export const standardize=(row,n)=>row.map((v,j)=>(v-n.center[j])/n.scale[j]);
// Cholesky solves the positive definite ridge system; no explicit inverse.
export function ridge(X,y,lambda,{intercept=false}={}) {
 if(!X.length||X.length!==y.length||!(lambda>0)||!Number.isFinite(lambda))throw Error('회귀 입력 오류');
 const n=X[0].length;if(!n||X.some(r=>r.length!==n||r.some(v=>!Number.isFinite(v)))||y.some(v=>!Number.isFinite(v)))throw Error('유한 회귀 자료 필요');
 const p=n+(intercept?1:0),Z=X.map(r=>intercept?[1,...r]:r);
 const A=Array.from({length:p},(_,i)=>Array.from({length:p},(_,j)=>sum(Z.map(r=>r[i]*r[j]))+(i===j&&(!intercept||i>0)?lambda:0)));
 const b=Array.from({length:p},(_,i)=>sum(Z.map((r,k)=>r[i]*y[k])));
 const L=Array.from({length:p},()=>Array(p).fill(0));
 for(let i=0;i<p;i++)for(let j=0;j<=i;j++){
  const v=A[i][j]-sum(Array.from({length:j},(_,k)=>L[i][k]*L[j][k]));
  if(i===j){if(!(v>1e-20))throw Error('회귀 행렬 불안정');L[i][j]=Math.sqrt(v);}else L[i][j]=v/L[j][j];
 }
 const diag=L.map((r,i)=>r[i]),conditionProxy=(Math.max(...diag)/Math.min(...diag))**2;
 if(!Number.isFinite(conditionProxy)||conditionProxy>1e14)throw Error('회귀 행렬 조건 불량');
 const w=Array(p).fill(0),coef=Array(p).fill(0);
 for(let i=0;i<p;i++)w[i]=(b[i]-sum(Array.from({length:i},(_,j)=>L[i][j]*w[j])))/L[i][i];
 for(let i=p-1;i>=0;i--)coef[i]=(w[i]-sum(Array.from({length:p-i-1},(_,k)=>L[i+1+k][i]*coef[i+1+k])))/L[i][i];
 const residual=Math.max(...A.map((r,i)=>Math.abs(sum(r.map((v,j)=>v*coef[j]))-b[i])))/Math.max(1,...b.map(Math.abs));
 if(!coef.every(Number.isFinite)||residual>1e-7)throw Error('회귀 수치 잔차 검사 실패');
 return {coefficients:intercept?coef.slice(1):coef,intercept:intercept?coef[0]:0,conditionProxy,relativeSystemResidual:residual};
}
export const predict=(model,row)=>model.intercept+sum(row.map((v,j)=>v*model.coefficients[j]));
export function phaseMembership(trendScaled,accelerationScaled) {
 if(![trendScaled,accelerationScaled].every(Number.isFinite))return null;
 const sigmoid=x=>x>=0?1/(1+Math.exp(-x)):Math.exp(x)/(1+Math.exp(x));
 const t=sigmoid(trendScaled),a=sigmoid(accelerationScaled);
 return {risingFaster:t*a,risingSlower:t*(1-a),fallingFaster:(1-t)*(1-a),recovering:(1-t)*a};
}
export function stableJSON(v) {
 if(v===null||typeof v!=='object')return JSON.stringify(v);
 return Array.isArray(v)?'['+v.map(stableJSON).join(',')+']':'{'+Object.keys(v).filter(k=>v[k]!==undefined).sort().map(k=>JSON.stringify(k)+':'+stableJSON(v[k])).join(',')+'}';
}
// Portable SHA-256 for identical browser/Node audit keys, checked against node:crypto.
export function sha256(value) {
 const bytes=new TextEncoder().encode(typeof value==='string'?value:stableJSON(value));
 const K=[0x428a2f98,0x71374491,0xb5c0fbcf,0xe9b5dba5,0x3956c25b,0x59f111f1,0x923f82a4,0xab1c5ed5,0xd807aa98,0x12835b01,0x243185be,0x550c7dc3,0x72be5d74,0x80deb1fe,0x9bdc06a7,0xc19bf174,0xe49b69c1,0xefbe4786,0x0fc19dc6,0x240ca1cc,0x2de92c6f,0x4a7484aa,0x5cb0a9dc,0x76f988da,0x983e5152,0xa831c66d,0xb00327c8,0xbf597fc7,0xc6e00bf3,0xd5a79147,0x06ca6351,0x14292967,0x27b70a85,0x2e1b2138,0x4d2c6dfc,0x53380d13,0x650a7354,0x766a0abb,0x81c2c92e,0x92722c85,0xa2bfe8a1,0xa81a664b,0xc24b8b70,0xc76c51a3,0xd192e819,0xd6990624,0xf40e3585,0x106aa070,0x19a4c116,0x1e376c08,0x2748774c,0x34b0bcb5,0x391c0cb3,0x4ed8aa4a,0x5b9cca4f,0x682e6ff3,0x748f82ee,0x78a5636f,0x84c87814,0x8cc70208,0x90befffa,0xa4506ceb,0xbef9a3f7,0xc67178f2];
 const data=new Uint8Array(Math.ceil((bytes.length+9)/64)*64);data.set(bytes);data[bytes.length]=128;
 const view=new DataView(data.buffer),bits=bytes.length*8;
 view.setUint32(data.length-8,Math.floor(bits/2**32));view.setUint32(data.length-4,bits>>>0);
 const H=[0x6a09e667,0xbb67ae85,0x3c6ef372,0xa54ff53a,0x510e527f,0x9b05688c,0x1f83d9ab,0x5be0cd19],W=new Uint32Array(64);
 const ro=(x,n)=>(x>>>n)|(x<<(32-n));
 for(let offset=0;offset<data.length;offset+=64){
  for(let i=0;i<16;i++)W[i]=view.getUint32(offset+i*4);
  for(let i=16;i<64;i++){const x=W[i-15],y=W[i-2];W[i]=(W[i-16]+(ro(x,7)^ro(x,18)^(x>>>3))+W[i-7]+(ro(y,17)^ro(y,19)^(y>>>10)))>>>0;}
  let [a,b,c,d,e,f,g,h]=H;
  for(let i=0;i<64;i++){const t1=(h+(ro(e,6)^ro(e,11)^ro(e,25))+((e&f)^(~e&g))+K[i]+W[i])>>>0,t2=((ro(a,2)^ro(a,13)^ro(a,22))+((a&b)^(a&c)^(b&c)))>>>0;h=g;g=f;f=e;e=(d+t1)>>>0;d=c;c=b;b=a;a=(t1+t2)>>>0;}
  [a,b,c,d,e,f,g,h].forEach((x,i)=>H[i]=(H[i]+x)>>>0);
 }
 return H.map(x=>x.toString(16).padStart(8,'0')).join('');
}
export function random(seed) { let s=seed>>>0;return()=>{s=(s+0x6D2B79F5)>>>0;let t=s;t=Math.imul(t^(t>>>15),t|1);t^=t+Math.imul(t^(t>>>7),t|61);return((t^(t>>>14))>>>0)/4294967296;}; }
