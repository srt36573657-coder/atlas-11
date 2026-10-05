// Read-only model/display diagnostics. No new Monte Carlo draws or price changes.
export function forecastSummary(asset,version){
 const first=asset.rows.find(r=>r.date===version.origin)??asset.rows[0],last=asset.rows.at(-1);
 const news=asset.news??[],used=news.filter(n=>n.used),direction=used.filter(n=>Number.isFinite(n.selection?.mu)&&Math.abs(n.selection.mu)>1e-12);
 const prices=asset.rows.map(r=>r.p50).filter(p=>Number.isFinite(p)&&p>0),start=first?.p50;
 return{origin:version.origin,end:version.end,start,endPrice:last?.p50,endReturn:start>0?last.p50/start-1:null,
  lower:last?.p10,upper:last?.p90,swing:start>0?(Math.max(...prices)-Math.min(...prices))/start:null,
  used:used.length,directional:direction.length,volatilityOnly:used.length-direction.length,held:news.filter(n=>!n.used&&n.evidenceAssessment?.classification!=='context_only').length,
  context:news.filter(n=>!n.used&&n.evidenceAssessment?.classification==='context_only').length,
  flatReason:asset.conditionalPath?(asset.conditionalPath.status==='RESEARCH_ESTIMATE'?'종목별 5·20·60거래일 특징 → 조건부 수익률 → 뉴스 분포와 누적 계산. 뉴스 영향 미확정을 종목 전체의 0% 전망으로 대체하지 않습니다.':'조건부 수익률 자료 부족: '+asset.conditionalPath.reason):direction.length===0?'일반일 추세 평균 0 · 뉴스 방향 근거 없음 · 범위로 변동 가능성 확인':'일반일 추세 평균 0 · 근거가 남은 사건만 평균 방향 반영'};
}
export function eventState(profile){return profile.used?(Math.abs(profile.selection?.mu??0)>1e-12?'direction':'variance'):profile.evidenceAssessment?.classification==='context_only'?'context':'held';}
export function chartDomain(rows,anchor,range=false){
 const values=rows.flatMap(r=>(range?[r.p10,r.p50,r.p90]:[r.p50]).filter(p=>p>0&&Number.isFinite(p)).map(p=>p/anchor-1));
 const lo=Math.min(0,...values),hi=Math.max(0,...values),pad=Math.max(.001,(hi-lo)*.12);
 return{lo:lo-pad,hi:hi+pad};
}
