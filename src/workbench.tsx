import React,{useEffect,useId,useMemo,useRef,useState} from 'react';
import {createPortal} from 'react-dom';
import {latestEvaluationRows} from '../lib/evaluation-ledger.mjs';
import {scopeLabel} from '../lib/news-scope.mjs';
const won=(n:any)=>Number.isFinite(n)?Math.round(n).toLocaleString('ko-KR')+'원':'—';
const percent=(n:any)=>Number.isFinite(n)?`${n>0?'+':''}${(n*100).toFixed(2)}%`:'—';
export function rankedStocks(assets:any[]){return [...assets].sort((a,b)=>{
  const av=a.rows.at(-1)?.return,bv=b.rows.at(-1)?.return;
  return (Number.isFinite(bv)?bv:-Infinity)-(Number.isFinite(av)?av:-Infinity)||a.code.localeCompare(b.code);
});}
export function StockPicker({assets,selected,onSelect}:any){
  const [sector,setSector]=useState(''),[query,setQuery]=useState('');
  return <div className="stock-picker" data-stock-picker>
    <p>종목을 눌러 그래프를 여세요. 10/30 모형 예상 수익률 순입니다.</p>
    <div className="picker-filters"><label>업종 <select value={sector} onChange={e=>setSector(e.target.value)}><option value="">전체 업종</option>{[...new Set(assets.map((a:any)=>a.sector))].map((s:any)=><option key={s}>{s}</option>)}</select></label><label>이름으로 찾기 <input value={query} onChange={e=>setQuery(e.target.value)} placeholder="선택 사항"/></label></div>
    <div className="picker-grid">{rankedStocks(assets).filter(a=>(!sector||a.sector===sector)&&(!query||`${a.name} ${a.code}`.includes(query))).map(a=><button key={a.code} data-picker-code={a.code} aria-pressed={a.code===selected} onClick={()=>onSelect(a.code)}><span><b>{a.name}</b><small>{a.sector} · {a.code}</small></span><strong>{percent(a.rows.at(-1)?.return)}</strong></button>)}</div>
  </div>;
}
export function NewsWorkbench({version,code,onCode,onOpenDate}:any){
  const asset=version.assets.find((a:any)=>a.code===code)??rankedStocks(version.assets)[0];
  const [sort,setSort]=useState('impact'),[chosen,setChosen]=useState<string|null>(null);
  const newsDetail=useRef<HTMLElement>(null);
  const items=useMemo(()=>[...(asset?.news??[])].sort((a,b)=>sort==='date'?a.date.localeCompare(b.date):
    (b.impact?.distributionChangePP??-Infinity)-(a.impact?.distributionChangePP??-Infinity)||a.date.localeCompare(b.date)||a.id.localeCompare(b.id)),[asset,sort]);
  const profile=items.find(p=>p.id===chosen)??items[0];
  useEffect(()=>setChosen(null),[asset?.code]);
  return <section className="news-workbench" data-news-workbench data-news-forecast-id={version.id}>
    <div className="workbench-heading"><label>종목 <select aria-label="뉴스 종목 선택" value={asset?.code} onChange={e=>onCode(e.target.value)}>{rankedStocks(version.assets).map(a=><option value={a.code} key={a.code}>{a.name}</option>)}</select></label><label>정렬 <select value={sort} onChange={e=>setSort(e.target.value)}><option value="impact">이 종목 영향순</option><option value="date">날짜순</option></select></label><button className="news-read-action" disabled={!profile} onClick={()=>newsDetail.current?.focus()}>선택한 뉴스 읽기</button></div>
    <p className="muted">{asset?.name}의 10/30 모형 분포 변화로 비교합니다. 미산정은 0이 아니며, 실제 인과효과·적중 확률과 다릅니다.</p>
    <p className="news-selection-status" role="status" aria-live="polite" aria-atomic="true">{profile?`선택 뉴스: ${profile.name}`:'선택한 종목에 연결된 뉴스가 없습니다.'}</p>
    <div className="news-reading-layout"><div className="news-reading-list" role="group" aria-label="선택 종목 뉴스">
      {items.map(p=><button key={p.id} aria-pressed={profile?.id===p.id} onClick={()=>setChosen(p.id)}><small>{p.date} · {scopeLabel(p)}</small><b>{p.name}</b><span>{Number.isFinite(p.impact?.distributionChangePP)?`분포 변화 ${p.impact.distributionChangePP.toFixed(3)}%p`:'가격 영향 미산정'}</span></button>)}
      {!items.length&&<p>확인된 연결 일정이 없습니다.</p>}
    </div><article ref={newsDetail} className="news-reading-detail" role="region" tabIndex={0} aria-label={`${asset?.name??'선택 종목'} 선택 뉴스 상세`} data-selected-news={profile?.id}>
      {profile?<><small>{asset.name} · {profile.date} · {scopeLabel(profile)}</small><h3>{profile.name}</h3>
        <p>{profile.reason}</p>{Number.isFinite(profile.impact?.distributionChangePP)&&<div className="impact-reading"><b>분포 변화 {profile.impact.distributionChangePP.toFixed(3)}%p</b><span>중앙값 차이 {profile.impact.medianChangePP>0?'+':''}{Number.isFinite(profile.impact.medianChangePP)?profile.impact.medianChangePP.toFixed(3)+'%p':'미산정'}</span><small>같은 난수로 이 사건 반영/해제를 비교한 모형 값</small></div>}
        <p>이 종목의 과거 반응 {profile.sampleCount}건. 발표 결과와 발표 직전 시장 예상의 차이는 별도 자료가 필요합니다.</p>
        <button className="primary" onClick={()=>onOpenDate?.(asset.code,profile.date,version.id)} data-news-open-date={profile.date} data-news-open-code={asset.code} data-news-open-forecast={version.id}>이 날짜의 그래프 보기</button>
        <h4>연결 출처</h4><p className="news-source-state" data-schedule-verified={profile.evidenceAssessment?.scheduleVerified===true?'true':profile.evidenceAssessment?.scheduleVerified===false?'false':'unrecorded'}>{profile.evidenceAssessment?.scheduleVerified===true?'저장된 검토: 일정 확인':profile.evidenceAssessment?.scheduleVerified===false?'저장된 검토: 일정 미확인':'저장된 일정 확인 상태 없음'}. 출처 링크 제공은 이번 원문 재확인을 뜻하지 않습니다.</p>{!profile.sources?.length&&<p>저장된 출처 링크가 없습니다.</p>}{profile.sources?.map((s:any,j:number)=><a className="source-card" href={s.url} target="_blank" rel="noreferrer" key={s.url+j}>{s.name??'원문'} ↗<small>{s.url}</small></a>)}
        <details><summary>표본과 계산 계수</summary><p>λ {profile.selection?.lambda??'—'} · 중심 로그효과 {profile.selection?.mu??'미산정'} · {profile.selection?.status}</p><p>{profile.excluded?.map((s:any)=>`${s.date}: ${s.reason}`).join(' / ')||'기록된 제외 표본 없음'}</p></details>
      </>:<p>종목을 선택해 주세요.</p>}
    </article></div>
  </section>;
}
/** D364: one modal surface for recorded diagnoses; no score or evidence mutation. */
export function DiagnosisDialog({detail,onClose,returnFocus}:any){
  const sheet=useRef<HTMLDivElement>(null),backdrop=useRef<HTMLDivElement>(null),closeButton=useRef<HTMLButtonElement>(null);
  const close=useRef(onClose);close.current=onClose;
  const titleId=useId(),descriptionId=useId();
  useEffect(()=>{
    const previous=(returnFocus??document.activeElement) as HTMLElement|null;
    const oldOverflow=document.body.style.overflow;
    // The portal is a sibling of the app. Preserve existing inert attributes exactly.
    const background=Array.from(document.body.children).filter((el):el is HTMLElement=>el instanceof HTMLElement&&el!==backdrop.current).map(el=>({el,inert:el.getAttribute('inert')}));
    for(const item of background)item.el.setAttribute('inert','');
    document.body.style.overflow='hidden';
    const controls=()=>Array.from(sheet.current?.querySelectorAll<HTMLElement>('button:not(:disabled),a[href],input:not(:disabled),select:not(:disabled),textarea:not(:disabled),summary,[tabindex]')??[]).filter(el=>{
      if(el.tabIndex<0)return false;
      for(let node:HTMLElement|null=el;node&&node!==sheet.current;node=node.parentElement){
        const style=getComputedStyle(node);
        if(node.hidden||node.hasAttribute('inert')||style.display==='none'||style.visibility==='hidden'||style.visibility==='collapse')return false;
        if(node.tagName==='DETAILS'&&!(node as HTMLDetailsElement).open){
          const summary=Array.from(node.children).find(child=>child.tagName==='SUMMARY');
          if(!summary?.contains(el))return false;
        }
      }
      return true;
    });
    const focusInside=()=>{(closeButton.current??sheet.current)?.focus({preventScroll:true});};
    const onKey=(e:KeyboardEvent)=>{
      if(e.key==='Escape'){e.preventDefault();e.stopPropagation();close.current();return;}
      if(e.key!=='Tab')return;
      const list=controls(),first=list[0],last=list.at(-1),active=document.activeElement;
      if(!first){e.preventDefault();sheet.current?.focus();return;}
      if(!sheet.current?.contains(active)||active===sheet.current){e.preventDefault();(e.shiftKey?last:first)?.focus();}
      else if(e.shiftKey&&active===first){e.preventDefault();last?.focus();}
      else if(!e.shiftKey&&active===last){e.preventDefault();first.focus();}
    };
    const onFocus=(e:FocusEvent)=>{if(!sheet.current?.contains(e.target as Node))focusInside();};
    document.addEventListener('keydown',onKey,true);
    document.addEventListener('focusin',onFocus,true);
    focusInside();
    return()=>{
      document.removeEventListener('keydown',onKey,true);
      document.removeEventListener('focusin',onFocus,true);
      document.body.style.overflow=oldOverflow;
      for(const {el,inert} of background){if(inert===null)el.removeAttribute('inert');else el.setAttribute('inert',inert);}
      if(previous?.isConnected)previous.focus({preventScroll:true});
    };
  },[]);
  return createPortal(<div ref={backdrop} className="diagnosis-backdrop" data-diagnosis-backdrop onClick={e=>{if(e.target===e.currentTarget)close.current();}}>
    <div ref={sheet} className="diagnosis-sheet" role="dialog" aria-modal="true" aria-labelledby={titleId} aria-describedby={descriptionId} tabIndex={-1} data-diagnosis-dialog>
      <div className="diagnosis-header"><div><span>예측 원인 점검</span><h3 id={titleId}>{detail.name} · {detail.date}</h3></div><button ref={closeButton} type="button" aria-label="원인 점검 닫기" onClick={()=>close.current()}>닫기 ×</button></div>
      <div className="diagnosis-body" tabIndex={0} role="region" aria-label="기록된 원인과 추적 정보">
        <p id={descriptionId}>{won(detail.errorWon)} 차이 · {detail.evaluationKind==='PROSPECTIVE'?'결과 전 발행':'사후 비교'}</p>
        {detail.diagnosis.map((d:any,j:number)=><article key={j}><b>{d.status==='CONFIRMED'?'확인됨':d.status==='HYPOTHESIS'?'추정':'미확인'}</b><p>{d.detail}</p></article>)}
        <details><summary>추적 식별값</summary><p>예측 {detail.forecastId}</p><p>방정식 {detail.modelVersion}</p><p>가격 원본 {detail.actualVintageId}</p><p>평가 규칙 {detail.metricPolicyHash}</p></details>
      </div>
    </div>
  </div>,document.body);
}
export function ScoreWorkbench({state,initialCode='',selectedVersion,onOpenDate}:any){
  const forecastId=selectedVersion?.id??state.active??state.original;
  const version=selectedVersion??state.versions?.find((v:any)=>v.id===forecastId);
  const [code,setCode]=useState(initialCode),[kind,setKind]=useState(''),[date,setDate]=useState(''),[outcome,setOutcome]=useState('all'),[detail,setDetail]=useState<any>(null);
  const detailTrigger=useRef<HTMLButtonElement|null>(null);
  const rows=useMemo(()=>latestEvaluationRows(state.evaluationLedger??[],{forecastId,code,kind}),[state.evaluationLedger,forecastId,code,kind]);
  const dates=[...new Set<string>(rows.map((r:any)=>r.date))];
  const observedDate=state.input.actualAsOf;
  const referenceDate=(state.input.calendar?.sessions??[]).includes(observedDate)&&Date.parse(observedDate+'T15:30:00+09:00')<=Date.now()&&(!version?.end||observedDate<=version.end)?observedDate:(dates[0]??version?.origin??state.input.origin);
  // The latest common observed session remains selectable when its evaluation
  // has not arrived. Never introduce a future or holiday score placeholder.
  if(referenceDate>version?.origin&&(state.input.calendar?.sessions??[]).includes(referenceDate)&&!dates.includes(referenceDate))dates.push(referenceDate);
  dates.sort((a,b)=>b.localeCompare(a));
  const effectiveDate=dates.includes(date)?date:(dates[0]??referenceDate);
  const show=rows.filter((r:any)=>r.date===effectiveDate);
  const assets=state.input.assets.filter((a:any)=>!code||a.code===code);
  const outcomes=assets.map((asset:any)=>{
    const row=show.find((r:any)=>r.code===asset.code);
    return {asset,row,kind:row?.directionMatched===true?'hit':row?.directionMatched===false?'miss':'pending'};
  });
  const counts={all:outcomes.length,hit:outcomes.filter((r:any)=>r.kind==='hit').length,miss:outcomes.filter((r:any)=>r.kind==='miss').length,pending:outcomes.filter((r:any)=>r.kind==='pending').length};
  const directionDenominator=counts.hit+counts.miss;
  const displayed=outcome==='all'?outcomes:outcomes.filter((r:any)=>r.kind===outcome);
  useEffect(()=>{setDate('');setDetail(null);setOutcome('all');},[forecastId]);
  const finiteErrors=show.filter((r:any)=>Number.isFinite(r.absolutePercentageError));
  const avg=finiteErrors.length?finiteErrors.reduce((s:number,r:any)=>s+r.absolutePercentageError,0)/finiteErrors.length:null;
  const matched=directionDenominator?counts.hit/directionDenominator:null;
  const cumulativeErrors=rows.filter((r:any)=>Number.isFinite(r.absolutePercentageError));
  const cumulativeAvg=cumulativeErrors.length?cumulativeErrors.reduce((s:number,r:any)=>s+r.absolutePercentageError,0)/cumulativeErrors.length:null;
  const benchmarkRows=state.atlasBenchmark?.code==='KOSPI'?(state.atlasBenchmark.prices??[]):[];
  const benchmarkAt=(d:string)=>{const found=benchmarkRows.filter((r:any)=>r.date===d&&Number.isFinite(r.close)&&r.close>0&&r.quality!=='conflict'&&(!r.observedAt||Number.isFinite(Date.parse(r.observedAt))&&Date.parse(r.observedAt)<=Date.now()));return found.length===1?found[0]:null;};
  const benchmark=benchmarkAt(effectiveDate),benchmarkOrigin=benchmarkAt('2026-09-17');
  const benchmarkReturn=benchmark&&benchmarkOrigin?benchmark.close/benchmarkOrigin.close-1:null;
  const benchmarkSources=(benchmark?.sources??[benchmark?.source]).filter((s:any)=>typeof s?.url==='string'&&/^https?:\/\//i.test(s.url));
  const openRow=(targetCode:string,targetDate:string,targetForecastId=forecastId)=>onOpenDate?.(targetCode,targetDate,targetForecastId);
  return <section className="score-workbench" data-score-workbench data-score-forecast-id={forecastId}>
    <div className="section-heading"><div><span className="section-kicker">결과를 남기는 예측</span><h2>예측 성적과 원인 추적</h2><p>당시 저장한 전망을 고정하고 실제 종가와 비교합니다. 종목을 누르면 같은 날짜·같은 전망의 그래프가 열립니다.</p></div></div>
    <div className="score-filters"><label>평가하는 저장 전망 <output>{version?.origin} 출발 · {forecastId?.slice(-8)}</output><small>종목 그래프와 같은 전망</small></label><label>종목 <select aria-label="성적 종목 선택" value={code} onChange={e=>{setCode(e.target.value);setDate('');setOutcome('all');}}><option value="">52종목 전체</option>{state.input.assets.map((a:any)=><option key={a.code} value={a.code}>{a.name}</option>)}</select></label><label>평가 구분 <select aria-label="성적 평가 구분" value={kind} onChange={e=>{setKind(e.target.value);setDate('');setOutcome('all');}}><option value="">구분 표시하고 모두 보기</option><option value="PROSPECTIVE">결과 전 발행 전망만</option><option value="RECONSTRUCTED_OR_LATE">재구성·결과 후 발행</option></select></label></div>
    <div className="score-metrics" data-score-date={effectiveDate}><div><small>{effectiveDate} 평가 기록</small><b>{show.length} / {assets.length}종목</b><span>선택 날짜·조건 · 독립 검증 횟수 아님</span></div><div><small>절대 가격 오차율 평균</small><b>{avg===null?'미산정':(avg*100).toFixed(2)+'%'}</b><span>실제 종가 대비 · 오차 평가 {finiteErrors.length}종목</span></div><div><small>기준일 대비 방향 일치</small><b>{matched===null?'미산정':(matched*100).toFixed(1)+'%'}</b><span data-score-direction-denominator>일치 {counts.hit} / 방향 평가 {directionDenominator}종목 · 신뢰 확률 아님</span></div><div><small>방향 미평가</small><b>{counts.pending}종목</b><span>선택 조건 기준 · 적중률 분모에서 제외</span></div></div>
    <p className="score-context" data-score-benchmark>{effectiveDate} 코스피 종가 <b>{benchmark?benchmark.close.toLocaleString('ko-KR',{minimumFractionDigits:2,maximumFractionDigits:2})+'P':'미확보'}</b> · 9/17 대비 <b>{percent(benchmarkReturn)}</b>{benchmark&&<> · {benchmark.source?.provider==='PRESS_ORIGINAL_RESEARCH'?'언론 원문 확인 · 거래소 원장 직접 확인 아님':'제공자 관측 · 거래소 원장 검증 미확인'} · {benchmarkSources.map((source:any,i:number)=><React.Fragment key={source.url}>{i>0&&' / '}<a href={source.url} target="_blank" rel="noreferrer">{source.publisher??'원문'} ↗</a></React.Fragment>)}</>}<br/><small>실제 시장 움직임 참고값입니다. 시장 대비 예측 적중률이 아닙니다.</small></p>
    <details className="score-cumulative"><summary>이 전망의 누적 평가 기록 {rows.length}개 · {new Set(rows.map((r:any)=>r.date)).size}개 날짜</summary><p>{rows.length?[...rows.map((r:any)=>r.date)].sort()[0]+' ~ '+[...rows.map((r:any)=>r.date)].sort().at(-1):'평가 기간 미확보'} · 절대 가격 오차율 평균 {cumulativeAvg===null?'미산정':(cumulativeAvg*100).toFixed(2)+'%'} · 종목·날짜 기록을 독립 시험 횟수로 세지 않습니다.</p></details>
    <p className="score-context">재구성·결과 후 발행 기록은 실전 적중 성적과 구분합니다. 잘 맞은 날도 상쇄 오차·자료 문제를 점검하며, 원인이 불명확하면 미확인으로 남깁니다. 종가 수집은 거래일 한국시간 16:00부터 시작합니다.</p>
    {dates.length>0&&<label className="score-date">목표 날짜 <select aria-label="성적 목표 날짜" value={effectiveDate} onChange={e=>setDate(e.target.value)}>{dates.map((d:string)=><option key={d}>{d}</option>)}</select></label>}
    <div className="section-switch score-outcome-filters" role="group" aria-label="날짜별 방향 결과 필터">{([['all','전체'],['hit','방향 일치'],['miss','방향 불일치'],['pending','미평가']] as const).map(([key,label])=><button key={key} data-score-filter={key} aria-pressed={outcome===key} onClick={()=>setOutcome(key)}>{label} {counts[key]}</button>)}</div>
    <p className="score-list-status" role="status" aria-live="polite" data-score-list-status>{effectiveDate} · {displayed.length} / {assets.length}종목 표시 · 방향 평가 분모 {directionDenominator}종목. 목록 필터를 바꿔도 적중률의 분모는 바뀌지 않습니다.</p>
    <div className="table-scroll"><table><caption className="sr-only">{effectiveDate} 예측과 실제 비교 · 종목을 누르면 이 전망과 날짜의 그래프 열기</caption><thead><tr><th scope="col">종목</th><th scope="col">당시 예측</th><th scope="col">실제 종가</th><th scope="col">실제−예측</th><th scope="col">절대 오차</th><th scope="col">방향</th><th scope="col">범위</th><th scope="col">기록·점검</th></tr></thead><tbody>{displayed.map(({asset,row:r,kind:resultKind}:any)=>r?<tr key={r.id} data-score-row={r.code} data-score-result={resultKind}><th scope="row"><button aria-label={`${r.name} ${r.date} 예측과 실제 보기`} onClick={()=>openRow(r.code,r.date,r.forecastId)}>{r.name}</button><small>{r.date}</small></th><td>{won(r.predicted)}</td><td>{won(r.actual)}</td><td>{r.errorWon>0?'+':''}{won(r.errorWon)}</td><td>{Number.isFinite(r.absolutePercentageError)?(r.absolutePercentageError*100).toFixed(2)+'%':'미산정'}</td><td>{r.directionMatched===true?'일치':r.directionMatched===false?'불일치':'미평가'}</td><td>{r.interval?.inside===true?'포함':r.interval?.inside===false?'범위 밖':'미산정'}</td><td><small>{r.evaluationKind==='PROSPECTIVE'?'결과 전 발행':'재구성·사후'}</small><button onClick={e=>{detailTrigger.current=e.currentTarget;setDetail(r);}}>원인 점검</button></td></tr>:<tr key={asset.code} data-score-pending={asset.code} data-score-row={asset.code} data-score-result="pending"><th scope="row"><button aria-label={`${asset.name} ${effectiveDate} 예측과 실제 보기`} onClick={()=>openRow(asset.code,effectiveDate)}>{asset.name}</button><small>{effectiveDate}</small></th><td>{won(version?.assets?.find((a:any)=>a.code===asset.code)?.rows?.find((r:any)=>r.date===effectiveDate)?.p50)}</td><td colSpan={5}>이 조건의 평가 기록 없음 · 적중으로 세지 않음</td><td><small>평가 대기</small></td></tr>)}</tbody></table></div>
    {!displayed.length&&<div className="empty-stocks"><b>이 결과에 해당하는 종목이 없습니다.</b><p>전체 또는 다른 결과 필터를 선택하세요.</p></div>}
    {!rows.length&&<div className="empty-stocks"><b>이 조건의 실제 비교 기록이 아직 없습니다.</b><p>미래 종가를 받은 뒤 기록합니다. 당일 종가로 다시 계산한 출발점은 적중으로 세지 않습니다.</p></div>}
    {detail&&<DiagnosisDialog detail={detail} onClose={()=>setDetail(null)} returnFocus={detailTrigger.current}/>}
  </section>;
}

async function accountApi(action?:string,payload:any={}){
  const response=await fetch('/api/account',{method:action?'POST':'GET',credentials:'same-origin',headers:{'content-type':'application/json'},...(action?{body:JSON.stringify({action,...payload})}:{})});
  if(!response.headers.get('content-type')?.includes('application/json'))throw Error('계정 저장 서버 연결이 필요합니다.');
  const data=await response.json();if(!response.ok)throw Object.assign(Error(data.error??'계정 요청 실패'),{status:response.status,data});return data;
}
export function useAccount(){
  const [account,setAccount]=useState<any>({configured:false,user:null,watchlist:[],revision:0}),[status,setStatus]=useState('연결 확인 중');
  const generation=useRef(0),queue=useRef(Promise.resolve()),accountRef=useRef(account);accountRef.current=account;
  const refresh=async()=>{const id=++generation.current;try{const data=await accountApi();if(id===generation.current){accountRef.current=data;setAccount(data);setStatus(data.user?'계정에 저장됨':data.configured?'로그인 후 저장':'로그인 연결 설정 필요');}return data;}catch(e:any){if(id===generation.current)setStatus(e.message);return null;}};
  useEffect(()=>{refresh();return()=>{generation.current++;};},[]);
  const save=(code:string,watched:boolean)=>{
    const intendedAccount=accountRef.current.user?.accountId;
    const work=queue.current.then(async()=>{
      setStatus('저장 중');let current=await accountApi();
      if(!current.user)throw Error('Google 로그인 후 관심종목을 저장하세요.');
      for(let attempt=0;attempt<3;attempt++){
        if(!intendedAccount||current.user.accountId!==intendedAccount)throw Error('계정이 바뀌었습니다. 로그인과 목록을 다시 확인하세요.');
        try{const data=await accountApi('watch',{code,watched,expectedRevision:current.revision,expectedAccountId:intendedAccount});setAccount({...data,configured:true});setStatus('계정에 저장됨');return data;}
        catch(e:any){if(e.status!==409)throw e;current=await accountApi();}
      }
      throw Error('다른 기기와 저장이 겹쳤습니다. 다시 눌러 주세요.');
    });queue.current=work.catch(()=>{});return work.catch(e=>{setStatus(e.message);throw e;});
  };
  const logout=async()=>{await queue.current;await accountApi('logout');generation.current++;setAccount({configured:true,user:null,watchlist:[],revision:0});setStatus('로그아웃');};
  const clear=async()=>{await queue.current;const data=await accountApi('clear',{expectedRevision:account.revision,expectedAccountId:account.user?.accountId});setAccount({...data,configured:true});setStatus('관심종목을 비웠습니다.');};
  return{account,status,save,refresh,logout,clear};
}
export function AccountPanel({controller,onLoggedIn}:any){
  const button=useRef<HTMLDivElement>(null),[message,setMessage]=useState(''),[ready,setReady]=useState(false),[confirmClear,setConfirmClear]=useState(false);
  useEffect(()=>{
    if(controller.account.user)return;let alive=true;
    (async()=>{try{
      const r=await fetch('/api/account?action=config',{credentials:'same-origin'});
      if(!r.ok||!r.headers.get('content-type')?.includes('application/json'))throw Error('Google 로그인 서버가 연결되지 않았습니다.');
      const config=await r.json();if(!config.configured)throw Error(config.reason);
      if(!(window as any).google?.accounts?.id)await new Promise<void>((resolve,reject)=>{
        const script=document.createElement('script');script.src='https://accounts.google.com/gsi/client';script.async=true;script.onload=()=>resolve();script.onerror=()=>reject(Error('Google 로그인 화면을 불러오지 못했습니다.'));document.head.append(script);
      });
      if(!alive)return;
      (window as any).google.accounts.id.initialize({client_id:config.clientId,nonce:config.nonce,auto_select:false,
        callback:async(result:any)=>{try{await accountApi('login',{credential:result.credential});const user=await controller.refresh();if(alive){setMessage('로그인되었습니다.');onLoggedIn?.(user);}}catch(e:any){if(alive)setMessage(e.message);}}});
      (window as any).google.accounts.id.renderButton(button.current,{theme:'outline',size:'large',text:'signin_with',width:280});setReady(true);
    }catch(e:any){if(alive)setMessage(e.message);}})();return()=>{alive=false;};
  },[controller.account.user]);
  return <section className="account-panel">{controller.account.user?<><h3>{controller.account.user.name}</h3><p>{controller.account.user.email}</p><p>관심종목 {controller.account.watchlist.length}개 · {controller.status}</p><div className="account-actions"><button onClick={()=>{const link=document.createElement('a');link.href=URL.createObjectURL(new Blob([JSON.stringify({codes:controller.account.watchlist,exportedAt:new Date().toISOString()},null,2)],{type:'application/json'}));link.download='ATLAS_Watchlist.json';link.click();setTimeout(()=>URL.revokeObjectURL(link.href),1000);}}>관심종목 내보내기</button><button onClick={()=>setConfirmClear(true)}>관심종목 비우기</button></div>{confirmClear&&<p>계정의 관심종목을 모두 비울까요? <button onClick={()=>controller.clear().then(()=>setConfirmClear(false)).catch((e:any)=>setMessage(e.message))}>모두 비우기</button> <button onClick={()=>setConfirmClear(false)}>취소</button></p>}<button onClick={()=>controller.logout().catch((e:any)=>setMessage(e.message))}>로그아웃</button></>:<><h3>내 관심종목을 기기마다 그대로</h3><p>Google 계정으로 로그인하면 관심종목을 계정에 저장합니다.</p><div ref={button}/>{!ready&&<p>로그인 연결 상태를 확인합니다.</p>}</>}{message&&<p role="status">{message}</p>}<a href="/downloads/ACCOUNT_SETUP.md" download>로그인 연결 안내</a></section>;
}
