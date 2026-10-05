// Derive calibration rows from archived baseline forecasts and point-in-time
// official data. No future baseline is reconstructed from today's news.
import {CYCLE_PROTOCOL as P} from './cycle-protocol.mjs';
import {cycleSnapshot,resolveCycleMapping,https,validTime} from './cycle-data.mjs';
import {prepareCycleFeatures} from './cycle-features.mjs';
import {sha256,stableJSON} from './cycle-math.mjs';
export const mappingFingerprint=({market,sector,mapping})=>sha256({market:market.id,sector:sector.id,marketMethod:market.methodId,sectorMethod:sector.methodId,mappingType:mapping.mappingType});
function historicalRow(data,id,date,cutoff){
 let row=data.series.find(s=>s.id===id)?.rows.find(r=>r.date===date);
 for(const change of [...data.revisions].reverse()){
  if(change.entity==='row:'+id&&change.key===date&&Date.parse(change.at)>Date.parse(cutoff)){
   if(!change.before&&Date.parse(change.after?.knownAt)<=Date.parse(cutoff))continue;
   row=change.before;
  }
 }
 return row?.vintageVerified&&Date.parse(row.knownAt)<=Date.parse(cutoff)?row:null;
}
export function deriveCycleTrainingRows(records,data,input,{now=new Date().toISOString()}={}){
 const rows=[],skipped=[],codes=input.assets.map(a=>a.code).sort();
 for(const record of records){
  const v=record.version;
  const reject=reason=>skipped.push({baselineId:v?.id??null,reason});
  if(!v||v.modelVersion!=='atlas-news-7.0.0'||v.origin>P.parameterSelectionCutoff){reject('9/17 이전 동일 모형의 기준 전망 아님');continue;}
  if(!validTime(v.informationCutoff)||Date.parse(v.informationCutoff)>Date.parse(v.origin+'T23:59:59+09:00')||
   record.provenance?.pointInTimeVerified!==true||!https(record.provenance?.archiveUrl)){reject('기준 전망의 당시 입력·정보 시각·보관 원문 부족');continue;}
  if(stableJSON(v.assets.map(a=>a.code).sort())!==stableJSON(codes)||!record.input){reject('기준 전망 입력·52종목 불일치');continue;}
  const snap=cycleSnapshot(data,v.informationCutoff),baselineDataHash=sha256(record.input);
  const cache=new Map();
  for(const asset of input.assets){
   const mapped=resolveCycleMapping(snap,asset.code,v.origin),stock=snap.series.find(s=>s.kind==='stock'&&s.stockCode===asset.code);
   const base=v.assets.find(a=>a.code===asset.code);
   if(mapped.status!=='ready'||!snap.calendar||!stock?.adjustmentsVerified||!mapped.mapping.vintageVerified){skipped.push({baselineId:v.id,code:asset.code,reason:'당시 업종 대응·공식 조정 가격 부족'});continue;}
   const anchor=stock.rows.find(r=>r.date===v.origin)?.close;
   if(!anchor||Math.abs(anchor/base.originPrice-1)>1e-8){skipped.push({baselineId:v.id,code:asset.code,reason:'공식 가격과 기준 전망 출발가 불일치'});continue;}
   const key=mapped.market.id+':'+mapped.sector.id;
   const f=prepareCycleFeatures({...asset,prices:stock.rows},mapped.market,mapped.sector,snap.calendar,v.origin,{shared:cache.get(key)});cache.set(key,f);
   if(!f.vector){skipped.push({baselineId:v.id,code:asset.code,reason:f.missing});continue;}
   const mappingKey=mappingFingerprint(mapped);
   for(let h=1;h<base.rows.length;h++){
    const target=base.rows[h],numeric=base.numericSummary?.rows?.find(r=>r.date===target.date);
    if(target.date>P.parameterSelectionCutoff)continue;
    const targetCutoff=target.date+'T23:59:59+09:00',actual=historicalRow(data,stock.id,target.date,targetCutoff);
    if(!actual||!Number.isFinite(numeric?.expectedLogPrice)||!https(actual.archiveUrl)){skipped.push({baselineId:v.id,code:asset.code,date:target.date,reason:'당시 실제 종가·평균 로그 가격 원본 부족'});continue;}
    rows.push({id:sha256({code:asset.code,origin:v.origin,target:target.date,baselineId:v.id}),code:asset.code,date:v.origin,targetDate:target.date,horizon:h,
     features:f.vector,originPrice:anchor,actualPrice:actual.close,baseExpectedLogReturn:numeric.expectedLogPrice-Math.log(anchor),baselineMedianPrice:target.p50,
     baselineOrigin:v.origin,baselineId:v.id,baselineModelVersion:v.modelVersion,baselineDataHash,baselineLogMeaning:'expected_log_return',
     baselineInformationCutoff:v.informationCutoff,featureAsOf:v.informationCutoff,pointInTimeVerified:true,adjustmentsVerified:true,calendarVerified:true,mappingKey,
     sourceUrl:actual.sourceUrl,sourceUrls:[actual.sourceUrl,mapped.market.sourceUrl,mapped.sector.sourceUrl,mapped.mapping.sourceUrl,record.provenance.archiveUrl],
     observedAt:now,targetPublishedAt:actual.knownAt,availableAt:actual.knownAt,vintageVerified:true,archiveUrl:actual.archiveUrl});
   }
  }
 }
 return {schema:'atlas-cycle-input-1',trainingRows:rows,report:{generatedAt:now,archives:records.length,derivedRows:rows.length,skipped,accuracyCertified:false}};
}
