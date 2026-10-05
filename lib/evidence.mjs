// Replay only revisions recorded by ATLAS. This cannot reconstruct missing historical vintages.
export function eventsAsOf(input, cutoff) {
  const limit=Date.parse(cutoff);
  if(!Number.isFinite(limit))throw Error('Invalid evidence cutoff');
  const revisions=(input.newsRevisions??[]).map((r,index)=>({...r,index}))
    .filter(r=>Date.parse(r.at)>limit)
    .sort((a,b)=>Date.parse(b.at)-Date.parse(a.at)||b.index-a.index);
  if(!revisions.length)return input.events;
  // An ID may be conflicted. A Map would silently discard one of those records
  // merely because an unrelated event acquired a later revision.
  const events=structuredClone(input.events);
  const key=(e)=>JSON.stringify(canonical(e,new Set(['lastVerifiedAt','observedAt','availableAt','availabilityBasis'])));
  for(const r of revisions){
    const indices=events.flatMap((e,i)=>e.id===r.id?[i]:[]);
    const matching=r.after?indices.filter(i=>key(events[i])===key(r.after)):[];
    const index=matching.length===1?matching[0]:indices.length===1?indices[0]:null;
    if(r.before){
      if(index!==null)events[index]=structuredClone(r.before);
      // Ambiguous legacy journals must retain conflicts, not choose a winner.
      else if(!events.some(e=>JSON.stringify(canonical(e))===JSON.stringify(canonical(r.before))))events.push(structuredClone(r.before));
    } else if(index!==null)events.splice(index,1);
  }
  return events;
}
function canonical(value,omit=new Set()) {
  if(Array.isArray(value))return value.map(v=>canonical(v,omit));
  if(value&&typeof value==='object')return Object.fromEntries(Object.keys(value).sort().filter(k=>!omit.has(k)).map(k=>[k,canonical(value[k],omit)]));
  return value;
}
export function pricesAsOf(input, cutoff) {
  const limit=Date.parse(cutoff);
  if(!Number.isFinite(limit))throw Error('Invalid evidence cutoff');
  const revisions=(input.priceRevisions??[]).map((r,index)=>({...r,index})).filter(r=>Date.parse(r.at)>limit).sort((a,b)=>Date.parse(b.at)-Date.parse(a.at)||b.index-a.index);
  if(!revisions.length)return input.assets;
  const assets=structuredClone(input.assets);
  for(const r of revisions){
    const asset=assets.find(a=>a.code===r.code);
    if(!asset)continue;
    const index=asset.prices.findIndex(p=>p.date===r.date);
    if(Object.hasOwn(r,'beforeRow')&&r.beforeRow===null){
      // Only an explicit insertion journal permits removal. Missing journals
      // cannot be used to claim recovery of unrecorded historical vintages.
      if(index>=0)asset.prices.splice(index,1);
    }else if(r.beforeRow){
      if(index>=0)asset.prices[index]=structuredClone(r.beforeRow);
      else asset.prices.push(structuredClone(r.beforeRow));
    }else if(index>=0&&Object.hasOwn(r,'before'))asset.prices[index].close=r.before;
  }
  for(const asset of assets)asset.prices.sort((a,b)=>a.date.localeCompare(b.date));
  return assets;
}
// No general confidence percentage is inferable from Monte Carlo path counts.
export function evidenceStatus(asset) {
  const counts=asset.newsByScope??{}, reasons=[];
  if(!(counts.company>0))reasons.push('기업 고유 예정 뉴스 미확보');
  if(!(counts.sector>0))reasons.push('업종 고유 예정 뉴스 미확보');
  if(!asset.eventsUsed)reasons.push('반영할 사건 표본 부족');
  if(asset.news?.some(p=>!p.used))reasons.push('일부 사건 계산 유보');
  reasons.push('발표 결과·시장 예상 대비 차이 미반영','단순 기준 대비 미래 예측 우위 미입증','가격 조정·당시 원본 자료 미검증');
  return {status:'research_only',direction:'abstain',label:'방향 판단 유보',trustProbability:null,
    reasons,companyEvents:counts.company??0,sectorEvents:counts.sector??0,
    nextStep:'공식 기업·업종 일정과 예상/결과 자료를 확보하고 새로 발행한 전망을 실제 결과와 채점'};
}
