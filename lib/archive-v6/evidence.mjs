// Replay only revisions recorded by ATLAS. This cannot reconstruct missing historical vintages.
export function eventsAsOf(input, cutoff) {
  const limit=Date.parse(cutoff), events=new Map(input.events.map(e=>[e.id,e]));
  for(const r of [...(input.newsRevisions??[])].filter(r=>Date.parse(r.at)>limit).sort((a,b)=>Date.parse(b.at)-Date.parse(a.at))){
    if(r.before)events.set(r.id,r.before);else events.delete(r.id);
  }
  // Preserve repeated IDs for the gate's conflict/duplicate checks when there is no replay.
  if(!(input.newsRevisions??[]).some(r=>Date.parse(r.at)>limit))return input.events;
  return [...events.values()];
}
export function pricesAsOf(input, cutoff) {
  const revisions=(input.priceRevisions??[]).filter(r=>Date.parse(r.at)>Date.parse(cutoff)).sort((a,b)=>Date.parse(b.at)-Date.parse(a.at));
  if(!revisions.length)return input.assets;
  const assets=structuredClone(input.assets);
  for(const r of revisions){
    const p=assets.find(a=>a.code===r.code)?.prices.find(p=>p.date===r.date);
    if(p){if(r.beforeRow)Object.assign(p,r.beforeRow);else p.close=r.before;}
  }
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
