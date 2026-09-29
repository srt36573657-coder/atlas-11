// Display/research layer. Historical v1 and issued forecasts remain immutable.
import {calculateFomo} from './fomo.mjs';
export const FOMO_V2='atlas-fomo-core-2.0.0';
export const CORE=Object.freeze({attention:['searchBurst'],participation:['volumeBurst','retailShare'],chasing:['upVolume','intraday','retailNet']});
export const VECTOR=['attention','participation','chasing','overheat','attentionChasing','chasingOverheat'];
const finite=x=>typeof x==='number'&&Number.isFinite(x);
export function coreScore(features){
 const map=new Map(features.map(f=>[f.id,f]));
 const axes=Object.entries(CORE).map(([id,ids])=>{const missing=ids.filter(k=>!finite(map.get(k)?.score));return{id,required:ids,missing,value:missing.length?null:ids.reduce((s,k)=>s+map.get(k).score/100,0)/ids.length};});
 const missing=axes.flatMap(a=>a.missing),[A,V,C]=axes.map(a=>a.value),o=map.get('maGap')?.score;
 return{version:FOMO_V2,tier:'core-6',axes,missing,coverage:6-missing.length,total:6,score:missing.length?null:100*Math.cbrt(A*V*C),
  vector:missing.length||!finite(o)?null:[A,V,C,o/100,A*C,C*o/100],overheat:finite(o)?o:null,
  status:missing.length?'insufficient_input':'research_proxy',trustProbability:null};
}
export function calculateFomoV2({input,code,date}){
 const known=[input.fomoInformationAsOf,input.informationAsOf,input.retrievedAt].map(Date.parse).filter(Number.isFinite);
 const cutoff=new Date(Math.min(Date.parse(date+'T23:59:59+09:00'),known.length?Math.max(...known):Date.parse(date+'T23:59:59+09:00'))).toISOString();
 const records=(input.fomoResearch?.records??[]).filter(r=>r.code===code&&r.observedAt<=cutoff&&(r.availableAt??r.publishedAt)<=cutoff&&r.recordedAt<=cutoff);
 let view=input;
 if(records.length){
  // Only requested asset is cloned; complete original input stays untouched.
  const asset=structuredClone(input.assets.find(a=>a.code===code)),map=new Map(asset.prices.map(p=>[p.date,p]));
  const latestSearch=records.filter(r=>r.field==='searchIndex').sort((a,b)=>b.recordedAt.localeCompare(a.recordedAt)||b.queryId.localeCompare(a.queryId))[0]?.queryId;
  const selected=records.filter(r=>r.field!=='searchIndex'||r.queryId===latestSearch);
  const groups=new Map();for(const r of selected){const key=r.date+':'+r.field;const prev=groups.get(key);if(prev&&prev.value!==r.value)groups.set(key,{...r,conflict:true});else if(!prev)groups.set(key,r);}
  for(const r of groups.values()){
   const row=map.get(r.date);if(!row||r.conflict)continue;
   if(['open','high','low','volume'].includes(r.field)){row[r.field]=r.value;row.featureObservedAt=cutoff;}
   else {row.fomo??={code,date:r.date};row.fomo={...row.fomo,[r.field]:r.value,sourceUrl:r.sourceUrl,observedAt:cutoff};if(r.field==='searchIndex')row.fomo.methodId=r.queryId;}
  }
  view={...input,assets:input.assets.map(a=>a.code===code?asset:a)};
 }
 const legacy=calculateFomo({input:view,code,date}),core=coreScore(legacy.features);
 return{...legacy,legacyScore:legacy.score,...core,features:legacy.features,groups:legacy.groups,priceHeat:legacy.priceHeat,
  evidence:records.map(({value,...r})=>r),integration:{enabled:false,adjustment:null,reason:core.score===null?'핵심 검색·수급·거래 자료 부족':'독립 검증된 일별 경로 모형 없음'},
  formula:'100 × (관심 × 참여 × 추격)^(1/3)',vintage:'당시 보관 원본이 없는 자료는 재구성 연구용. 모형 개선 증거와 구분.'};
}
