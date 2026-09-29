import React,{useMemo,useState} from 'react';
import {latestEvaluationRows} from '../lib/evaluation-ledger.mjs';

/** Read-only presentation. onUpdate requests the parent's persisted evolution action;
 * this component never trains, creates prices, edits a forecast or writes a ledger.
 * Accepts normalized service state or a stored bundle; evolution schema 1. */
const finite=(v:any):v is number=>typeof v==='number'&&Number.isFinite(v);
const price=(v:any)=>finite(v)?`${v.toLocaleString('ko-KR',{maximumFractionDigits:0})}원`:'미확보';
const signed=(v:any)=>finite(v)?`${v>0?'+':''}${v.toLocaleString('ko-KR',{maximumFractionDigits:0})}원`:'—';
const short=(d:string)=>d?.slice(5).replace('-','/')??'—';
const days=(start:string,end:string)=>{const result:string[]=[];for(let d=new Date(start+'T00:00:00Z');d.toISOString().slice(0,10)<=end;d.setUTCDate(d.getUTCDate()+1))result.push(d.toISOString().slice(0,10));return result;};
const stateVersions=(state:any)=>{const arr=state.versions??[typeof state.original==='object'?state.original:null,...(state.priorVersions??[]),state.candidate];return [...new Map(arr.filter(Boolean).map((v:any)=>[v.id,v])).values()] as any[];};

function ComparisonChart({dates,forecast,forecastClass,actual,selected,onSelect}:any){
  const W=940,H=330,L=78,R=22,T=22,B=44;
  const all=[...forecast,...actual].map((r:any)=>r.value).filter(finite);
  if(!all.length)return <div className="evo-empty">이 종목의 비교 가능한 가격이 아직 없습니다.</div>;
  let low=Math.min(...all),high=Math.max(...all);const pad=Math.max((high-low)*.1,Math.abs(high)*.025,1);low-=pad;high+=pad;
  const x=(d:string)=>L+dates.indexOf(d)*(W-L-R)/Math.max(1,dates.length-1);
  const y=(v:number)=>T+(high-v)/(high-low)*(H-T-B);
  const path=(series:any[])=>{const map=new Map(series.map(r=>[r.date,r.value]));let active=false;return dates.map((d:string)=>{const v=map.get(d);if(!finite(v)){if(!map.has(d))return '';active=false;return '';}const p=`${active?'L':'M'}${x(d).toFixed(2)},${y(v).toFixed(2)}`;active=true;return p;}).join(' ');};
  const select=(e:React.MouseEvent<SVGSVGElement>)=>{const box=e.currentTarget.getBoundingClientRect();if(!box.width)return;const p=(e.clientX-box.left)/box.width*W;onSelect(dates[Math.max(0,Math.min(dates.length-1,Math.round((p-L)/(W-L-R)*(dates.length-1))))]);};
  return <svg className="evo-chart" viewBox={`0 0 ${W} ${H}`} role="img" aria-label="선택한 저장 전망 하나와 실제 종가의 전체 기간 가격 비교. 아래 날짜 버튼으로 같은 정보를 확인할 수 있습니다." onClick={select}>
    {[0,.25,.5,.75,1].map(t=><g key={t}><line x1={L} x2={W-R} y1={T+t*(H-T-B)} y2={T+t*(H-T-B)} className="evo-gridline"/><text x={L-10} y={T+t*(H-T-B)+4} textAnchor="end">{Math.round(high-t*(high-low)).toLocaleString('ko-KR')}</text></g>)}
    <path d={path(forecast)} className={`evo-line ${forecastClass}`} data-evolution-displayed-forecast/>
    <path d={path(actual)} className="evo-line evo-actual"/>
    {actual.map((r:any)=><circle key={r.date} cx={x(r.date)} cy={y(r.value)} r="3" className="evo-actual-dot"><title>{`${r.date} 실제 종가 ${price(r.value)}`}</title></circle>)}
    <line x1={x(selected)} x2={x(selected)} y1={T} y2={H-B} className="evo-cursor"/>
    {[dates[0],dates[14],dates[28],dates.at(-1)].filter(Boolean).map((d:string)=><text key={d} x={x(d)} y={H-16} textAnchor="middle">{short(d)}</text>)}
  </svg>;
}
function ErrorBars({rows,selected,onSelect}:any){
  const bound=Math.max(1,...rows.map((r:any)=>Math.abs(r.errorWon)));
  return <div className="evo-error-list" role="group" aria-label="실제 종가가 있는 거래일의 부호 있는 오차">{rows.length?rows.map((r:any)=><button key={r.date} className="evo-error-row" aria-pressed={r.date===selected} onClick={()=>onSelect(r.date)}><time>{short(r.date)}</time><span className="evo-error-track" aria-hidden="true"><i style={{left:r.errorWon<0?`${50-Math.abs(r.errorWon)/bound*48}%`:'50%',width:`${(r.errorWon===0?0:Math.max(.5,Math.abs(r.errorWon)/bound*48))}%`}} className={r.errorWon<0?'below':'above'}/></span><b>{signed(r.errorWon)}</b></button>):<p className="evo-muted">아직 연결할 실제 평가 기록이 없습니다. 미래 오차를 만들지 않습니다.</p>}</div>;
}
export function EvolutionWorkbench({state,selectedVersion,onUpdate}:any){
  const versions=useMemo(()=>stateVersions(state),[state.versions,state.original,state.priorVersions,state.candidate]);
  const originalId=typeof state.original==='string'?state.original:state.original?.id;
  const original=versions.find(v=>v.id===originalId)??versions[0];
  const evolution=state.evolution??{versions:[],evaluations:[],proposals:[],runs:[]};
  const [code,setCode]=useState(state.input.assets[0]?.code??''),[chartView,setChartView]=useState('operating'),[shadowId,setShadowId]=useState(''),[selected,setSelected]=useState(state.input.actualAsOf??state.input.origin),[busy,setBusy]=useState(false),[message,setMessage]=useState(''),[noteKind,setNoteKind]=useState('REVIEW'),[noteDetail,setNoteDetail]=useState(''),[noteUrl,setNoteUrl]=useState('');
  const shadowVersion=evolution.versions.find((v:any)=>v.id===(shadowId||evolution.activeId))??evolution.versions.at(-1);
  const baseline=selectedVersion??versions.find(v=>v.id===state.active)??versions.at(-1)??original;
  const dates=useMemo(()=>days('2026-09-17','2026-10-30'),[]);
  const date=dates.includes(selected)?selected:dates[0];
  const source=state.input.assets.find((a:any)=>a.code===code)??state.input.assets[0];
  const originalAsset=original?.assets?.find((a:any)=>a.code===source.code),baseAsset=baseline?.assets?.find((a:any)=>a.code===source.code),shadowAsset=shadowVersion?.assets?.find((a:any)=>a.code===source.code);
  const sessions=new Set(state.input.calendar?.sessions??[]);
  const actualRows=(source.prices??[]).filter((r:any)=>dates.includes(r.date)&&sessions.has(r.date)&&r.date<=state.input.actualAsOf&&finite(r.close)&&r.close>0&&r.quality!=='conflict'&&(source.prices??[]).filter((x:any)=>x.date===r.date).length===1);
  const series=(asset:any)=>(asset?.rows??[]).filter((r:any)=>dates.includes(r.date)).map((r:any)=>({date:r.date,value:finite(r.p50)&&r.p50>0?r.p50:null}));
  const actual=actualRows.find((r:any)=>r.date===date),baseRow=baseAsset?.rows?.find((r:any)=>r.date===date),originalRow=originalAsset?.rows?.find((r:any)=>r.date===date),shadowRow=shadowAsset?.rows?.find((r:any)=>r.date===date);
  const evaluations=latestEvaluationRows(state.evaluationLedger??[],{forecastId:baseline?.id,code:source.code}).filter((r:any)=>dates.includes(r.date)&&r.date<=state.input.actualAsOf&&sessions.has(r.date)&&finite(r.actual)&&finite(r.errorWon));
  const evaluation=evaluations.find((r:any)=>r.date===date);
  const evolvedEvaluation=[...(evolution.evaluations??[])].reverse().find((r:any)=>r.versionId===shadowVersion?.id&&r.code===source.code&&r.date===date);
  const train=shadowAsset?.training,waiting=!train||train.status!=='TRAINED';
  const beforeShadow=Boolean(shadowVersion&&date<shadowVersion.origin);
  const shadowSeries=series(shadowAsset).filter((r:any)=>shadowVersion?.origin&&r.date>=shadowVersion.origin);
  const pairedMap=new Map<string,any>();
  for(const r of evolution.evaluations??[]){
    if(r.versionId!==shadowVersion?.id||r.code!==source.code||r.date<=shadowVersion.origin||r.date>state.input.actualAsOf||!sessions.has(r.date)||!finite(r.actual)||!finite(r.errorWon)||!finite(r.baselineErrorWon))continue;
    const closeTime=Date.parse(`${r.date}T15:30:00+09:00`);
    if(!(Date.parse(shadowVersion.issuedAt)<closeTime&&Date.parse(shadowVersion.informationCutoff)<closeTime))continue;
    const prior=pairedMap.get(r.date);
    if(!prior||String(r.recordedAt)>String(prior.recordedAt))pairedMap.set(r.date,r);
  }
  const paired=[...pairedMap.values()],pairedError=paired.length?paired.reduce((sum:number,r:any)=>sum+Math.abs(r.errorWon),0)/paired.length:null,baselineError=paired.length?paired.reduce((sum:number,r:any)=>sum+Math.abs(r.baselineErrorWon),0)/paired.length:null;
  const mismatch=Boolean(shadowVersion&&baseline?.id!==shadowVersion.sourceId);
  const displayedShadow=chartView==='shadow'&&Boolean(shadowVersion);
  const displayedSeries=displayedShadow?shadowSeries:series(baseAsset);
  const displayedRow=displayedShadow?(beforeShadow?null:shadowRow):baseRow;
  const displayedEvaluation=displayedShadow?evolvedEvaluation:evaluation;
  const displayedLabel=displayedShadow?'선택한 진화 연구안':'현재 선택한 운영 전망';
  const update=async(e:React.FormEvent)=>{e.preventDefault();if(!onUpdate||!noteDetail.trim()||busy)return;setBusy(true);setMessage('');try{if(noteUrl){const url=new URL(noteUrl);if(!['https:','http:'].includes(url.protocol))throw Error('출처는 http 또는 https 링크를 입력하세요.');}await onUpdate({code:source.code,date,kind:noteKind,detail:noteDetail.trim(),...(noteUrl?{evidenceUrl:noteUrl}:{})});setNoteDetail('');setNoteUrl('');setMessage('개선 가설을 기록했습니다. 계산식에는 아직 적용하지 않았습니다.');}catch(e:any){setMessage(e.message??'가설 기록에 실패했습니다. 기존 전망은 그대로입니다.');}finally{setBusy(false);}};
  return <section className="evolution-workbench" data-evolution-workbench>
    <div className="evo-heading"><div><span className="section-kicker">기록 → 오차 → 별도 검토</span><h2>예측은 남기고, 개선은 따로</h2><p>실제 종가로 차이를 기록합니다. 새 진화안은 기존 전망을 덮어쓰지 않습니다.</p></div><span className="evo-research-tag">별도 연구안 · 원본 보존</span></div>
    {message&&<p className="evo-message" role="status">{message}</p>}
    <details className="evo-stock-picker" open><summary>종목 선택 <b>{source.name}</b><span>{state.input.assets.length}종목 · 눌러서 선택</span></summary><div className="evo-stock-grid" role="group" aria-label="진화 비교 종목">{state.input.assets.map((a:any)=><button key={a.code} aria-pressed={source.code===a.code} data-evolution-code={a.code} onClick={()=>setCode(a.code)}><b>{a.name}</b><small>{a.sector} · {a.code}</small></button>)}</div></details>
    <div className="evo-version-controls"><p><b>현재 표시: {displayedLabel}</b><br/><small>{displayedShadow?shadowVersion?.id:baseline?.id} · 예측 하나와 실제 종가</small></p><details><summary>다른 보관 진화안 확인</summary><label>차트에 표시할 저장 기록<select aria-label="진화 차트 표시 전망" value={displayedShadow?shadowVersion.id:'operating'} onChange={e=>{if(e.target.value==='operating'){setChartView('operating');}else{setShadowId(e.target.value);setChartView('shadow');}}}><option value="operating">현재 선택한 운영 전망</option>{evolution.versions.map((v:any)=><option key={v.id} value={v.id}>연구안 · {v.issuedAt?.slice(0,16).replace('T',' ')} · {v.id.slice(-8)}</option>)}</select></label><p>선택하면 전망을 교체해 표시합니다. 여러 예측선을 겹치지 않습니다.</p></details></div>
    <div className="evo-state" data-training-state={train?.status??'NOT_CREATED'}><b>{waiting?'학습 대기':'연구용 보정안'}</b><span>{!shadowVersion?'저장된 별도 진화안이 없습니다.':waiting?'충분한 학습 기록이 없어 보정값 0. 계수 검증이 완료된 개선안이 아닙니다.':'종목별 과거 오차를 사용한 별도 보정안입니다. 실제 예측 우위는 아직 검증되지 않았습니다.'}</span><small>검증된 적중 확률 없음</small></div>
    {displayedShadow&&mismatch&&<p className="evo-message">선택한 저장 전망은 이 진화안의 출발 버전과 다릅니다. 진화안 출발 ID: {shadowVersion.sourceId}</p>}
    <div className="evo-reading-layout"><div className="evo-plot-panel"><div className="evo-panel-heading"><h3>{source.name} <small>{source.code}</small></h3><span>09.17 — 10.30</span></div><div className="evo-legend"><span className={displayedShadow?'shadow':'baseline'}>{displayedLabel}</span><span className="actual">실제 종가</span></div>
      <ComparisonChart dates={dates} forecast={displayedSeries} forecastClass={displayedShadow?'evo-shadow':'evo-baseline'} actual={actualRows.map((r:any)=>({date:r.date,value:r.close}))} selected={date} onSelect={setSelected}/>
      <p className="evo-chart-note">점선은 위에 표시한 저장 전망 하나입니다. 진화안을 선택하면 해당 발행 기준일부터만 표시합니다. 최초 9/17 전망은 9/24 재구성 기록입니다. 실제 사전 발행 성적과 구분합니다. 휴장일의 새 종가는 만들지 않습니다.</p>
      <div className="evo-date-strip" role="group" aria-label="진화 비교 날짜">{dates.map(d=><button key={d} aria-pressed={date===d} data-evolution-date={d} onClick={()=>setSelected(d)}><b>{short(d)}</b><small>{actualRows.some((r:any)=>r.date===d)?'실제 있음':sessions.has(d)?'거래일':'휴장일'}</small></button>)}</div>
      <div className="evo-error-heading"><h4>실제 − 선택 전망</h4><span>왼쪽: 실제가 낮음 · 오른쪽: 실제가 높음</span></div><ErrorBars rows={displayedShadow?paired:evaluations} selected={date} onSelect={setSelected}/>
    </div><aside className="evo-day-panel" aria-label="선택 날짜의 예측 비교와 원인"><div className="evo-day-title"><span>선택 날짜</span><h3>{date}</h3><p>{source.name}</p></div><dl className="evo-values"><div><dt>{displayedLabel}</dt><dd>{displayedShadow&&beforeShadow?'발행 전 · 진화 예측 없음':price(displayedRow?.p50)}</dd></div><div><dt>실제 종가</dt><dd>{actual?price(actual.close):sessions.has(date)?'아직 미확보':'휴장 · 새 종가 없음'}</dd></div><div><dt>기록된 실제 − 선택 전망</dt><dd>{displayedEvaluation?signed(displayedEvaluation.errorWon):'평가 기록 없음'}</dd></div></dl><details><summary>보관값 비교 기록</summary><p>최초 재구성 전망 {price(originalRow?.p50)}</p><p>운영 전망 {price(baseRow?.p50)}</p><p>진화안 {beforeShadow?'발행 전 · 진화 예측 없음':price(shadowRow?.p50)}</p><p>진화안 오차 {evolvedEvaluation?signed(evolvedEvaluation.errorWon):'평가 기록 없음'}</p></details>
      <p className="evo-issued">선택 전망 발행 기록<br/><time>{(displayedShadow?shadowVersion?.issuedAt:baseline?.createdAt)??'미확보'}</time><br/>{displayedShadow?'별도 진화 연구 기록 · 우위 미입증':evaluation?.evaluationKind==='PROSPECTIVE'?'결과 전 발행 평가':evaluation?'재구성·결과 후 발행 평가':'이 날짜의 평가 구분 미확보'}</p>
      <h4>무엇을 확인했나요?</h4>{displayedEvaluation?.diagnosis?.length?displayedEvaluation.diagnosis.map((d:any,i:number)=><article className="evo-reason" key={i} data-reason-status={d.status}><b>{d.status==='CONFIRMED'?'확인된 기록':d.status==='HYPOTHESIS'?'원인 후보':'원인 미확인'}</b><p>{d.detail}</p></article>):<p className="evo-muted">이 날짜의 저장된 원인 점검이 없습니다. 가격 차이만으로 뉴스나 방정식을 원인으로 단정하지 않습니다.</p>}
      {displayedEvaluation&&<details><summary>평가에 연결된 가격 원본</summary><p>평가 종가 {price(displayedEvaluation.actual)}</p><code>{displayedEvaluation.actualVintageId}</code><p>기록 시각 {displayedEvaluation.recordedAt}</p></details>}
    </aside></div>
    <section className="evo-paired" data-evolution-paired><h3>결과 전 발행한 진화안의 같은 날짜 비교</h3><p>{source.name} · 같은 실제 종가에 연결된 기록만 비교합니다. 사후 재구성·중복 날짜는 제외합니다.</p><div className="evo-training-metrics"><div><span>고유 거래일</span><b data-paired-count>{paired.length}일</b></div><div><span>출발 전망 절대 오차 평균</span><b>{price(baselineError)}</b></div><div><span>진화안 절대 오차 평균</span><b>{price(pairedError)}</b></div></div>{!paired.length&&<p>아직 사전 발행 진화안의 실제 결과가 없습니다. 개선 효과를 입증한 상태가 아닙니다.</p>}</section>
    <section className="evo-learning"><div><span className="section-kicker">별도 진화안의 상태</span><h3>무엇을 학습했고, 무엇을 기다리나요?</h3><p>종목별 학습 상태와 사용 기록을 공개합니다. 보정안 생성은 정확도 개선의 증명이 아닙니다.</p></div><div className="evo-training-metrics"><div><span>학습 기록</span><b>{train?.count??0}<small> / 최소 {train?.minimum??'미설정'}</small></b></div><div><span>하루 로그수익률 보정</span><b>{finite(train?.correction)?train.correction.toPrecision(5):'미산정'}</b></div><div><span>상태</span><b>{waiting?'대기':'연구용'}</b></div></div><details><summary>방정식·학습 정책과 사용 기록</summary><p className="evo-equation">c = Σ[h × ln(실제 ÷ 예측)] ÷ (5 + Σh²)<br/>진화안 가격 = 출발 전망 가격 × exp(c × 미래 거래일 수)</p><p>다음 거래일 평가만 사용해 h=1입니다. 최근 최대 20개 고유 목표일에서 최소 5일이 필요합니다. 범위에도 같은 배율을 적용하지만 실전 보정이 검증된 범위는 아닙니다.</p><p>이 화면은 저장된 보정 계수와 경로를 표시합니다. 화면에서 다시 학습하거나 원본 가격을 바꾸지 않습니다.</p><pre>{JSON.stringify({policy:train?.policy??null,correction:train?.correction??null,trainingRefs:train?.refs??[],issuedAt:shadowVersion?.issuedAt??null,informationCutoff:shadowVersion?.informationCutoff??null,originalSHA:shadowVersion?.originalSHA??null},null,2)}</pre></details></section>
    <section className="evo-notes"><details><summary>개선 가설 기록 · {source.name} / {date}</summary><p>추가·축소·삭제 제안은 가설로 저장합니다. 기록만으로 방정식이나 보정 계수가 바뀌지 않습니다.</p><form onSubmit={update}><label>제안 종류<select value={noteKind} onChange={e=>setNoteKind(e.target.value)}><option value="REVIEW">검토 필요</option><option value="ADD">추가 제안</option><option value="REDUCE">비중 축소 제안</option><option value="REMOVE">제외 제안</option></select></label><label>가설과 확인할 근거<textarea required maxLength={3000} value={noteDetail} onChange={e=>setNoteDetail(e.target.value)} placeholder="어떤 입력이나 가정을 다시 확인해야 하나요?"/></label><label>출처 URL · 선택<input type="url" value={noteUrl} onChange={e=>setNoteUrl(e.target.value)} placeholder="https://…"/></label><button className="primary" disabled={!onUpdate||busy||!noteDetail.trim()}>{busy?'기록 중…':'가설로 기록'}</button>{!onUpdate&&<p>현재 화면에서는 저장 연결이 제공되지 않습니다.</p>}</form></details><div className="evo-note-history">{[...(evolution.notes??[])].filter((n:any)=>n.code===source.code).reverse().map((n:any,i:number)=><article key={n.id??i}><b>가설 · 계산 미적용</b><span>{n.date} · {{ADD:'추가',REDUCE:'축소',REMOVE:'제외',REVIEW:'검토'}[n.kind as string]??n.kind}</span><p>{n.detail}</p><small>기록 {n.recordedAt??'시각 미확보'}</small>{typeof n.evidenceUrl==='string'&&/^https?:\/\//i.test(n.evidenceUrl)&&<a href={n.evidenceUrl} target="_blank" rel="noreferrer">연결 출처 ↗</a>}</article>)}</div></section>
    <details className="evo-history"><summary>진화안 기록 {evolution.versions.length}개 · 기존 발행본 {versions.length}개 보존</summary>{[...evolution.versions].reverse().map((v:any)=><article key={v.id}><button onClick={()=>{setShadowId(v.id);setChartView('shadow');}}>{v.issuedAt} · {v.id}</button><p>출발 전망 {v.sourceId} · {v.status}</p></article>)}{!evolution.versions.length&&<p>아직 기록된 진화안이 없습니다.</p>}</details>
  </section>;
}
