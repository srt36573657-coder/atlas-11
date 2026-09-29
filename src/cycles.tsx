import React from 'react';
import {explainCycle} from '../lib/cycle-explanation.mjs';
const pct=(x:any)=>x==null?'—':(x>0?'+':'')+(Math.expm1(x)*100).toFixed(2)+'%';
const number=(x:any)=>Number.isFinite(x)?x.toFixed(3):'—';
export function CyclePanel({report,code,date,baselineId,compact=false}:any){
 const e=explainCycle(report,code,date,baselineId);
 if(compact)return <div className="cycle-compact" data-cycle-code={code}><span>시장 {e.market?.label??'자료 대기'}</span><span>업종 {e.sector?.label??'자료 대기'}</span><small>{e.target?'주기 후보 있음 · 연구용':'주기 보정 유보'}</small></div>;
 return <section className="cycle-panel" data-cycle-detail={code} aria-label="이 종목 지수·업종 주기">
  <div className="cycle-heading"><h4>지수·업종 주기</h4><span>연구 단계</span></div>
  <p>{e.summary}</p>
  <div className="cycle-pair"><div><small>{e.marketName??'시장 지수'}</small><strong>{e.market?.label??'자료 미확보'}</strong><span>민감도 {number(e.exposure?.coefficients?.[0])}</span></div><div><small>{e.sectorName??'업종 고유 흐름'}</small><strong>{e.sector?.label??'자료 미확보'}</strong><span>민감도 {number(e.exposure?.coefficients?.[1])}</span></div></div>
  {e.mappingType&&<p className="muted">{e.mappingType==='exact'?'공식 업종 대응':'넓은 업종 대리 지수'} · 상태는 {e.observedThrough}까지 관측</p>}
  {e.target&&<div className="cycle-contribution"><b>{e.target.date}까지 누적 후보 보정 {pct(e.target.deltaLog)}</b><p>전 거래일 대비 보정 변화 {pct(e.target.dailyDeltaLog)}</p>{e.target.contributions.map((c:any)=><div key={c.label}><span>{c.label}</span><span>{(c.logValue*100).toFixed(4)} 로그 %p</span></div>)}<p>{e.intervalNote}</p></div>}
  {e.reasons?.map((reason:string,i:number)=><p className="cycle-reason" key={i}>{reason}</p>)}
  <details><summary>계산과 근거</summary><p>기존 뉴스 모형의 오차 중 시장·업종 상태로 설명되는 부분만 별도로 학습합니다. 네 상태는 상승 확률이 아닙니다.</p><p>관측 자료가 없는 미래 상태·FOMO는 만들어 넣지 않습니다. 운영 가격 반영 0 · 실제 신뢰 확률 미산정.</p>{e.sourceUrls?.map((url:string)=><a key={url} href={url} target="_blank" rel="noreferrer">공식 원문 ↗ </a>)}<p><a href="/downloads/ATLAS_CYCLE_EQUATIONS.md" download>주기 계산식·검증 결과 ↓</a></p></details>
 </section>;
}
export function CycleWorkbench({cycle,onImport,onAnalyze,busy}:any){
 const report=cycle?.report,counts=report?.counts??{assets:52,mapped:0,features:0,candidates:0,live:0},collection=cycle?.collection;
 return <section className="panel cycle-workbench" data-cycle-workbench>
  <div className="cycle-heading"><div><h3>10년 지수·업종 주기</h3><p>공통 흐름을 찾고 종목별 반응을 따로 검증합니다.</p></div><span>운영 보정 {counts.live}/52</span></div>
  <div className="cycle-stats"><div><b>{counts.mapped}/52</b><small>공식 대응 연결</small></div><div><b>{counts.features}/52</b><small>주기·민감도 계산</small></div><div><b>{counts.candidates}/52</b><small>보정 연구 후보</small></div></div>
  <p className="cycle-collection">{collection?.reason??'공식 장기 지수 자료가 필요합니다.'}</p>
  <div className="cycle-actions"><button onClick={onImport} disabled={busy}>공식 주기 자료 JSON 추가</button><button onClick={onAnalyze} disabled={busy}>저장 자료로 다시 분석</button><a href="/downloads/ATLAS_CYCLE_INPUT.md" download>입력·수집 안내 ↓</a><a href="/downloads/ATLAS_CYCLE_EQUATIONS.md" download>방정식·검증 ↓</a></div>
  <p>추가 자료가 없으면 같은 결과를 유지합니다. ‘10년’은 관찰 기간이며 10년마다 같은 주가가 반복된다는 뜻이 아닙니다.</p>
  <details><summary>52종목의 자료와 계산 상태</summary><div className="table-scroll"><table><thead><tr><th>종목</th><th>시장</th><th>업종</th><th>계산 상태</th></tr></thead><tbody>{report?.rows?.map((r:any)=><tr key={r.code}><td>{r.name}<small className="cycle-code">{r.code}</small></td><td>{r.marketName??'미확보'}</td><td>{r.sectorIndexName??'미확보'}</td><td>{r.status==='research_only'?'연구 후보':r.status==='descriptive_only'?'상태만 계산':'유보'}<small className="cycle-code">{r.reasons?.[0]}</small></td></tr>)}</tbody></table></div></details>
  <details><summary>공통 관계·검증 결과</summary><p>지수 쌍 조사 {report?.pairs?.length??0}개 · 실제 적용 0개 · 독립 전향 검증 0회</p>{report?.pairs?.map((p:any)=><p key={p.key}>{p.key}: {p.observations}거래일 · {p.reason}</p>)}<p>모형 후보를 기존 ATLAS·가격 유지와 시간 순서로 비교합니다. 과거 시험이 좋아도 미래 성과를 인증하지 않습니다.</p><a href="/downloads/cycle_research.json" download>보관 연구 보고서 ↓</a> · <a href="/downloads/cycle_audit.json" download>보관 검증 보고서 ↓</a></details>
 </section>;
}
