import {Factor36Reason} from './factor36';
import React from 'react';
const names:any={up:'상승',flat:'보합',down:'하락'};
const fmt=(x:any)=>x==null?'미확보':`${x>=0?'+':''}${(100*Math.expm1(x)).toFixed(3)}%`;
const reasons:any={context_or_unverified_source:'설명용 일정 또는 출처 검증 부족',fewer_than_5_templates:'비교 가능한 과거 3거래일 표본 5건 미만',overlapping_future_waves_no_joint_evidence:'다른 뉴스의 파장과 겹침 · 결합 근거 부족',unavailable_at_information_cutoff:'기준 시각에 확인 가능한 원문 부족',unverified_target:'이 기업에 적용할 대상 근거 부족',outside_forecast:'전망 기간 밖',duplicate_event_phase:'같은 사건·단계 중복'};
export function WaveReason({asset,date}:any){
 if(asset.factorModel)return <Factor36Reason asset={asset} date={date}/>;
 if(!asset.waveModel)return null;
 const row=asset.rows.find((r:any)=>r.date===date),wave=row?.wave,end=asset.rows.at(-1)?.wave?.horizon,choice=wave?.daily;
 const event=asset.waveModel.events.find((e:any)=>e.id===wave?.eventId);
 return <section className="fomo-panel wave-reason" data-wave-reason={asset.code}>
  <h4>{date} · {asset.name} 확률 선택</h4>
  {choice?<><p><strong>{names[choice.selected]} 선택 · 모형 확률 {(100*choice.modelProbability).toFixed(1)}%</strong></p><p>{['up','flat','down'].map(k=>`${names[k]} ${(100*choice.probabilities[k]).toFixed(1)}%`).join(' · ')}</p><p>보합 기준 ±0.1% · 2순위와 차이 {(100*choice.runnerUpGap).toFixed(1)}%p</p><p>가격 흐름 {fmt(wave.baseMeanLogReturn)} + 뉴스 관측 반응 {fmt(wave.newsMeanLogReturn)}. 이 두 값은 로그수익률로 합산합니다.</p><p>{event?`${event.name} · 파장 ${wave.lag+1}/3거래일 · ${wave.templateCount}개 과거 사건 묶음`:'이 날짜에 적용 가능한 뉴스 파장 없음 · 해당 종목의 일반 변동 분포 사용'}</p></>:<p>전망 출발 전 날짜입니다. 아래는 10월 30일까지의 누적 선택입니다.</p>}
  <p>10/30: <b>{names[end.selected]} {(100*end.modelProbability).toFixed(1)}%</b> · {asset.rows[0].date} 종가 대비</p>
  <p><b>FOMO 수치 반영 대기</b> · 검증된 관심도·수급 학습 자료 미확보. 0으로 측정했다는 뜻이 아닙니다.</p>
  <details><summary>종목별 파장·계수·유보 이유</summary>
   <p>종목별 10만 경로. 모형 확률은 실제 적중률이 아닙니다. 그래프는 전체 경로의 중앙값이며, 매일의 최빈 방향을 이어 붙인 경로가 아닙니다.</p>
   <p>계수 학습 종료 {asset.conditionalPath.trainedThrough} · 가격 자료는 NAVER 단일 제공자 · 기업행위 조정/당시 원본 미검증.</p>
   {asset.waveModel.events.map((e:any)=><div key={e.id}><b>{e.date} · {e.name}</b><p>{e.status==='exploratory'?`관측 반응 ${e.kernel.map(fmt).join(' → ')} · ${e.templates.length}표본 · ${e.reversal?'반전 관측':'부호 반전 없음'}`:reasons[e.reason]??e.reason}</p>{e.sources.slice(0,1).map((s:any)=><a key={s.url} href={s.url} target="_blank" rel="noreferrer">출처 확인</a>)}</div>)}
   <p>3거래일은 사전에 고정한 관측 창입니다. 실제 뉴스 효과가 정확히 3일 뒤 끝난다는 주장이 아닙니다. 과거 동시 사건과 시장 영향을 완전히 분리하지 못했습니다.</p>
   <a href="/downloads/ATLAS_WAVE_52_EQUATIONS.json" download>52종목 계수·방정식 기록</a> · <a href="/downloads/ATLAS_NEWS_WAVE_PLAN.md" download>계산 기획서</a>
  </details>
 </section>;
}

import {scoreWave} from '../lib/wave-score.mjs';
export function WaveScore({version,input}:any){
 const report=React.useMemo(()=>scoreWave(version,input),[version,input]);const dates=[...new Set(report.rows.map((r:any)=>r.date))] as string[];const [selected,setSelected]=React.useState('');const date=dates.includes(selected)?selected:report.dates.at(-1)??dates[0];const rows=report.rows.filter((r:any)=>r.date===date),done=rows.filter((r:any)=>r.matched!==null),correct=done.filter((r:any)=>r.matched).length;
 return <section className="panel" data-wave-score><h2>새 전망의 일일 성적</h2><p>전망 작성 {new Date(version.createdAt).toLocaleString('ko-KR',{timeZone:'Asia/Seoul'})} · 작성 이후의 실제 종가만 채점합니다.</p><label>평가 날짜 <select value={date??''} onChange={e=>setSelected(e.target.value)}>{dates.map(d=><option key={d}>{d}</option>)}</select></label><h3>맞음 {correct} · 틀림 {done.length-correct} · 대기 {rows.length-done.length}</h3><p>관측 방향 적중률 {done.length?(correct/done.length*100).toFixed(1)+'%':'평가 대기'} · 누적 평가 거래일 {report.dates.length}일</p><div className="table-scroll"><table><thead><tr><th>종목</th><th>방향 선택</th><th>모형 확률</th><th>예측 / 실제</th><th>차이</th><th>방향</th><th>P10~P90 담김</th><th>폭·담김 점수</th><th>방향 Brier</th></tr></thead><tbody>{rows.map((r:any)=><tr key={r.code}><td>{r.name}</td><td>{names[r.selected]}</td><td>{(r.modelProbability*100).toFixed(1)}%</td><td>{Math.round(r.forecast).toLocaleString()} / {r.actual===null?'대기':r.actual.toLocaleString()}</td><td>{r.errorRate===null?'—':(r.errorRate*100).toFixed(2)+'%'}</td><td>{r.matched===null?'대기':r.matched?'맞음':'틀림'}</td><td>{r.covered===null?'—':r.covered?'포함':'밖'}</td><td>{r.intervalScore==null?'—':r.intervalScore.toFixed(4)}</td><td>{r.brier==null?'—':r.brier.toFixed(4)}</td></tr>)}</tbody></table></div><p>모형 확률과 실제 관측 적중률은 다릅니다. 같은 날 52종목을 52개의 독립 시험으로 세지 않습니다.</p></section>;
}
export function WaveMath(){return <section className="panel"><h2>종목별 뉴스 파장 방정식</h2><p>자기 종목 가격 흐름 + 자기 종목 사건 반응 → 10만 경로 → 매일 상승·보합·하락 중 최대 모형 확률 선택</p><pre>r = μ + 뉴스 반응 또는 일반 변동\nP = P₀ × exp(누적 로그수익률)\nE = 3거래일 평균 반응의 절댓값 합\n선택 = argmax(상승, 보합, 하락 확률)</pre><p>FOMO = 100 × (관심 × 참여 × 추격)⅓. 핵심 자료가 없어 이번 가격 계산에는 가산하지 않았습니다. 뉴스 파장은 관측 반응이며 인과효과나 실전 우위가 입증된 값은 아닙니다.</p><a href="/downloads/ATLAS_NEWS_WAVE_PLAN.md" download>기획·전체 방정식</a> · <a href="/downloads/ATLAS_WAVE_52_EQUATIONS.json" download>52종목 실제 계수·파장</a></section>;}
