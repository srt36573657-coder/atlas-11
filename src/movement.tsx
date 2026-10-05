import React from 'react';
export function DailyMovementReason({asset,date}:any){
 const row=asset.rows.find((r:any)=>r.date===date),d=row?.dailyMovement;if(!d)return null;
 const fmt=(x:number)=>(x>=0?'+':'')+(100*x).toFixed(2)+'%';
 const conditional=row.conditionalReturn;
 return <section className="fomo-panel" data-daily-movement={asset.code}>
  <b>{date} · 일일 등락 계산</b>
  <p>중심 변화 <strong>{fmt(Math.expm1(d.meanLogReturn))}</strong></p>
  <p>하루 변동 범위 <b>{fmt(d.returnP10)} ~ {fmt(d.returnP90)}</b></p>
  <p>모형 분포의 상승 비중 {(100*d.upModelShare).toFixed(1)}% · 하락 {(100*d.downModelShare).toFixed(1)}%</p>
  <details><summary>이 종목의 계산 근거</summary><p>직전 1·2일과 5·20·60일 수익률을 함께 사용합니다. 계수는 9/17 이전 자료의 시간순 내부 검증으로 정하고, 이후 알려진 가격은 상태 갱신에 사용합니다.</p><p>조건부 중심 변화 {conditional?.meanLogReturn==null?'자료 부족':fmt(Math.expm1(conditional.meanLogReturn))}. 해당 날짜의 사용 가능한 뉴스 분포를 결합하며, 미래에 나온 뉴스 내용을 만들어 넣지 않습니다.</p><p>위 범위는 일일 P10~P90이고 중심 변화는 로그평균 기준입니다. 누적 가격 중앙값의 차이와 같은 통계가 아닙니다. 분포 비중은 실제 적중 확률이 아닙니다. 예측 경로의 실제 우위는 아직 검증하지 않았습니다.</p></details>
 </section>;
}
