// ATLAS FOMO 1: observable proxies, never a probability or a fabricated return.
import {pricesAsOf} from './evidence.mjs';
export const FOMO_POLICY=Object.freeze({version:'atlas-fomo-1.0.0',window:10,referenceWindows:252,minReference:60,groupCount:6,priceWeight:0,trustProbability:null});
export const FOMO_FEATURES=Object.freeze([
 ['return10','추세','10일 상승률','Σ₁₀ log(Cₜ/Cₜ₋₁)','close'],
 ['acceleration','추세','상승 가속','Σ최근5 r − Σ이전5 r','close'],
 ['upDays','추세','상승일 비중','Σ₁₀ 1(r>0) / 10','close'],
 ['maGap','가격 위치','20일 평균 이격','C / mean(C 최근20) − 1','close'],
 ['breakout','가격 위치','직전 60일 고점 돌파','C / max(C 직전60) − 1','close'],
 ['upVariation','가격 위치','상승 변동 집중','Σ₁₀ max(r,0)² / Σ₁₀ r²','close'],
 ['volumeBurst','거래 참여','거래량 증가','mean(V 최근10) / mean(V 이전60) − 1','volume'],
 ['notionalBurst','거래 참여','거래규모 증가 대용값','mean(CV 최근10) / mean(CV 이전60) − 1','volume'],
 ['upVolume','거래 참여','상승일 거래량 비중','Σ₁₀ V·1(r>0) / Σ₁₀ V','volume'],
 ['gapUp','장중 추격','갭 상승 압력','mean₁₀ max(log(O/C₋₁),0)','ohlc'],
 ['closeLocation','장중 추격','고가 부근 마감','mean₁₀ (C−L)/(H−L)','ohlc'],
 ['intraday','장중 추격','장중 매수 압력','mean₁₀ log(C/O)','ohlc'],
 ['retailNet','개인 참여','개인 순매수 강도','Σ₁₀ 개인 순매수금액 / Σ₁₀ 실제 거래대금','flow'],
 ['retailShare','개인 참여','개인 거래 참여율','Σ₁₀ (개인 매수금액+매도금액) / (2Σ₁₀ 실제 거래대금)','flow'],
 ['marginChange','개인 참여','신용잔고 증가','신용잔고ₜ / 신용잔고ₜ₋₁₀ − 1','flow'],
 ['articleBurst','관심 확산','기업 기사 증가','mean(고유 사건 기사 최근10) / mean(이전60) − 1','attention'],
 ['searchBurst','관심 확산','검색 관심 증가','mean(검색지수 최근10) / mean(이전60) − 1','attention'],
 ['authorBurst','관심 확산','게시 작성자 증가','mean(고유 작성자 최근10) / mean(이전60) − 1','attention'],
].map(([id,group,label,equation,requires])=>Object.freeze({id,group,label,equation,requires})));
const finite=x=>typeof x==='number'&&Number.isFinite(x),positive=x=>finite(x)&&x>0;
const mean=xs=>xs.reduce((a,b)=>a+b,0)/xs.length;
const sum=xs=>xs.reduce((a,b)=>a+b,0);
const dateOK=d=>typeof d==='string'&&/^\d{4}-\d{2}-\d{2}$/.test(d)&&!Number.isNaN(Date.parse(d))&&new Date(d).toISOString().slice(0,10)===d;
export function midRank(value,reference){return !finite(value)||!reference.length?null:100*reference.reduce((n,x)=>n+(x<value?1:x===value?.5:0),0)/reference.length;}
function corr(a,b){const ma=mean(a),mb=mean(b);let cov=0,aa=0,bb=0;for(let i=0;i<a.length;i++){const x=a[i]-ma,y=b[i]-mb;cov+=x*y;aa+=x*x;bb+=y*y;}return aa&&bb?cov/Math.sqrt(aa*bb):0;}
function rankArray(a){const sorted=[...a].sort((x,y)=>x-y),ranks=new Map();for(let i=0;i<sorted.length;){let j=i+1;while(j<sorted.length&&sorted[j]===sorted[i])j++;ranks.set(sorted[i],100*(i+(j-i)/2)/sorted.length);i=j;}return a.map(x=>ranks.get(x));}
const safeURL=u=>{try{return new URL(u).protocol==='https:';}catch{return false;}};
function cleanRows(asset,sessions,cutoff){
 const byDate=new Map();for(const p of asset.prices??[]){if(p.date>cutoff.slice(0,10)||!positive(p.close)||p.quality==='conflict')continue;
  const row={...p};
  if(byDate.has(p.date)){byDate.set(p.date,null);continue;}
  // Feature timestamps are distinct from a closing date. No fabricated historical vintage.
  const observed=p.featureObservedAt??p.sources?.[0]?.retrievedAt;
  if(!observed||!Number.isFinite(Date.parse(observed))||Date.parse(observed)>Date.parse(cutoff))for(const key of ['volume','open','high','low'])delete row[key];
  const f=p.fomo;
  row.fomo=f&&f.code===asset.code&&f.date===p.date&&safeURL(f.sourceUrl)&&Number.isFinite(Date.parse(f.observedAt))&&Date.parse(f.observedAt)<=Date.parse(cutoff)?f:null;
  byDate.set(p.date,row);
 }
 return sessions.map(d=>byDate.get(d)??null);
}
function rawAt(rows,i){
 const out=Object.fromEntries(FOMO_FEATURES.map(f=>[f.id,null]));
 const slice=(n,end=i)=>end-n+1>=0?rows.slice(end-n+1,end+1):[];
 const valid=(xs,n,key='close')=>xs.length===n&&xs.every(x=>x&&finite(x[key])&&(key==='volume'?x[key]>=0:x[key]>0));
 const recent=slice(10),eleven=slice(11);
 if(!valid(eleven,11))return out;
 const r=recent.map((p,k)=>Math.log(p.close/eleven[k].close));
 out.return10=sum(r);out.acceleration=sum(r.slice(5))-sum(r.slice(0,5));out.upDays=r.filter(x=>x>0).length/10;
 out.upVariation=sum(r.map(x=>x*x))>0?sum(r.map(x=>Math.max(0,x)**2))/sum(r.map(x=>x*x)):.5;
 const twenty=slice(20),sixty=slice(60,i-1),prior=slice(60,i-10);
 if(valid(twenty,20))out.maGap=rows[i].close/mean(twenty.map(p=>p.close))-1;
 if(valid(sixty,60))out.breakout=rows[i].close/Math.max(...sixty.map(p=>p.close))-1;
 if(valid(recent,10,'volume')){
  const v=sum(recent.map(p=>p.volume));if(v>0)out.upVolume=sum(recent.map((p,k)=>r[k]>0?p.volume:0))/v;
  if(valid(prior,60,'volume')){
   const base=mean(prior.map(p=>p.volume)),money=mean(prior.map(p=>p.close*p.volume));
   if(base>0)out.volumeBurst=mean(recent.map(p=>p.volume))/base-1;
   if(money>0)out.notionalBurst=mean(recent.map(p=>p.close*p.volume))/money-1;
  }
 }
 if(recent.every(p=>positive(p.open)&&positive(p.high)&&positive(p.low)&&p.low<=p.open&&p.open<=p.high&&p.low<=p.close&&p.close<=p.high)){
  out.gapUp=mean(recent.map((p,k)=>Math.max(0,Math.log(p.open/eleven[k].close))));
  out.closeLocation=mean(recent.map(p=>p.high>p.low?(p.close-p.low)/(p.high-p.low):.5));
  out.intraday=mean(recent.map(p=>Math.log(p.close/p.open)));
 }
 const flows=recent.map(p=>p.fomo),has=(key,xs=flows,n=10)=>xs.length===n&&xs.every(f=>f&&finite(f[key]));
 if(has('turnover')&&flows.every(f=>f.turnover>0)){
  const turnover=sum(flows.map(f=>f.turnover));
  if(has('retailNetBuy'))out.retailNet=sum(flows.map(f=>f.retailNetBuy))/turnover;
  if(has('retailBuy')&&has('retailSell')&&flows.every(f=>f.retailBuy>=0&&f.retailSell>=0&&f.retailBuy<=f.turnover&&f.retailSell<=f.turnover))out.retailShare=sum(flows.map(f=>f.retailBuy+f.retailSell))/(2*turnover);
 }
 if(positive(rows[i]?.fomo?.marginBalance)&&positive(rows[i-10]?.fomo?.marginBalance))out.marginChange=rows[i].fomo.marginBalance/rows[i-10].fomo.marginBalance-1;
 for(const [id,key] of [['articleBurst','uniqueCompanyEvents'],['searchBurst','searchIndex'],['authorBurst','uniqueAuthors']]){
  const old=prior.map(p=>p?.fomo);const series=[...flows,...old];
  if(has(key)&&has(key,old,60)&&series.every(f=>f[key]>=0&&typeof f.methodId==='string'&&f.methodId===flows[0].methodId)){
   const base=mean(old.map(f=>f[key]));if(base>0)out[id]=mean(flows.map(f=>f[key]))/base-1;
  }
 }
 for(const key of Object.keys(out))if(!finite(out[key]))out[key]=null;
 return out;
}
export function calculateFomo({input,code,date}){
 if(!dateOK(date)||!input.calendar?.sessions)throw Error('FOMO: valid date and trading calendar required');
 const asOf=date<input.actualAsOf?date:input.actualAsOf;
 const known=[input.fomoInformationAsOf,input.informationAsOf,input.retrievedAt].map(Date.parse).filter(Number.isFinite);
 const requestedCutoff=Date.parse(date+'T23:59:59+09:00');
 const cutoff=new Date(Math.min(requestedCutoff,known.length?Math.max(...known):requestedCutoff)).toISOString();
 const source=pricesAsOf(input,cutoff).find(a=>a.code===code);if(!source)throw Error('FOMO: unknown company');
 const sessions=input.calendar.sessions.filter(d=>d<=asOf),rows=cleanRows(source,sessions,cutoff),index=rows.length-1;
 const raw=rawAt(rows,index),references=[];
 // Every calibration window ends before the current ten-session window starts.
 for(let i=Math.max(0,index-FOMO_POLICY.referenceWindows-9);i<=index-10;i++)references.push({date:sessions[i],raw:rawAt(rows,i)});
 const features=FOMO_FEATURES.map(f=>{const ref=references.map(r=>r.raw[f.id]).filter(finite),value=raw[f.id];
  return{...f,value,score:finite(value)&&ref.length>=FOMO_POLICY.minReference?midRank(value,ref):null,referenceCount:ref.length,weight:null,
   status:!finite(value)?'missing_input':ref.length<FOMO_POLICY.minReference?'insufficient_reference':'calculated',
   reason:!finite(value)?'연속 관측값 또는 필요한 원자료 미확보':ref.length<FOMO_POLICY.minReference?'비교용 과거 창 60개 미만':null};});
 const groups=[...new Set(FOMO_FEATURES.map(f=>f.group))].map(name=>{
  const members=features.filter(f=>f.group===name&&f.score!==null);
  for(const f of members){let redundancy=0;for(const other of members){if(other===f)continue;
    const pair=references.filter(r=>finite(r.raw[f.id])&&finite(r.raw[other.id]));
    redundancy+=pair.length>=60?Math.abs(corr(rankArray(pair.map(r=>r.raw[f.id])),rankArray(pair.map(r=>r.raw[other.id])))):1;
   }f.weight=1/(1+redundancy);
  }
  const den=sum(members.map(f=>f.weight));for(const f of members)f.groupContribution=f.score*f.weight/den;
  return{name,available:members.length,total:3,score:members.length?sum(members.map(f=>f.groupContribution)):null,complete:members.length===3};
 });
 const available=features.filter(f=>f.score!==null),complete=groups.every(g=>g.complete),priceGroups=groups.slice(0,2);
 const score=complete?mean(groups.map(g=>g.score)):null;
 const priceHeat=priceGroups.every(g=>g.complete)?mean(priceGroups.map(g=>g.score)):null;
 return{version:FOMO_POLICY.version,code,name:source.name,requestedDate:date,asOf:sessions.at(-1)??null,informationAsOf:cutoff,windowDates:sessions.slice(-10),
  score,priceHeat,available:available.length,total:18,groups,features,carried:date>asOf||!input.calendar.sessions.includes(date),
  status:complete?'research_proxy':'partial',priceWeight:0,trustProbability:null,
  interpretation:'개인 심리의 직접 측정·상승 확률이 아닌 관측 대용 지표. 가격 열기는 종가 기반 6항목만 사용.',
  vintage:'기록된 수정만 되돌림. 미보관 당시 원본과 기업행위 조정은 미검증.',
  forecastIntegration:{enabled:false,reason:complete?'독립 전망 검증과 승인된 계수 없음':'18항목 자료·비교 기간이 완성되지 않음'},
  source:source.priceSource??null,referenceEnd:references.at(-1)?.date??null,
  leaders:[...available].sort((a,b)=>b.score-a.score).slice(0,3).map(f=>({id:f.id,label:f.label,value:f.value,score:f.score,group:f.group}))};
}
