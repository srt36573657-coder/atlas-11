import React from 'react';
import './completion-status.css';

const stages = [
  ['rawSource', '원자료'], ['collector', '수집기'], ['history', '과거 이력'],
  ['calculation', '계산'], ['ui', '화면'], ['validation', '검증'],
] as const;
const labels: Record<string,string> = {
  ready: '확보', partial: '일부', missing: '미확보', blocked: '접근 필요',
  failed: '실패', excluded: '제외', not_applicable: '해당 없음',
};
const validStatus = (s:any) => Object.hasOwn(labels, s) ? s : 'missing';
const stageLabel = (key:string,status:string) => status==='ready'
  ? ({rawSource:'확보',collector:'정상',history:'확보',calculation:'사용',ui:'연결',validation:'검사 완료'} as Record<string,string>)[key]??labels[status]
  : labels[status];
const count = (n:any) => Number.isInteger(n) && n >= 0 ? n.toLocaleString('ko-KR') : '미집계';
const safeURL = (value:any) => { try { const u=new URL(value); return u.protocol==='https:'?u.href:null; } catch { return null; } };
const stamp = (value:any) => value && Number.isFinite(Date.parse(value))
  ? new Date(value).toLocaleString('ko-KR', {timeZone:'Asia/Seoul'}) : '미기록';
const installation=(value:any)=>value===true?'확인':value===false?'미설치':'미확인';

// The report is a read-only evidence ledger, never an alternative forecast.
// Stale or incomplete identities must not borrow the current issue's authority.
export function validCompletionReport(report:any, version:any) {
  if (report?.schema !== 'atlas-completion-status-1' || report.forecastId !== version?.id) return false;
  if (!Array.isArray(report.stocks) || report.stocks.length !== 52 || !Array.isArray(report.factors) || report.factors.length !== 36) return false;
  const ids=Array.from({length:36},(_,i)=>`F${String(i+1).padStart(2,'0')}`);
  if (new Set(report.factors.map((f:any)=>f.id)).size !== 36 || ids.some(id=>!report.factors.some((f:any)=>f.id===id))) return false;
  const codes=report.stocks.map((s:any)=>s.code);
  if (new Set(codes).size !== 52 || codes.some((code:any)=>!/^\d{6}$/.test(code))) return false;
  if (Array.isArray(version.assets) && (version.assets.length!==52 || version.assets.some((s:any)=>!codes.includes(s.code)))) return false;
  return report.stocks.every((s:any)=>Array.isArray(s.factors) && s.factors.length===36
    && new Set(s.factors.map((f:any)=>f.id)).size===36 && ids.every(id=>s.factors.some((f:any)=>f.id===id)) && s.fomo);
}

function Stage({name,value,stage}:any) {
  const status=validStatus(value?.status);
  return <span className="completion-stage" data-stage-status={status} title={value?.reason||'확인 기록 없음'}><small>{name}</small><b>{stageLabel(stage,status)}</b></span>;
}

function EvidenceRow({item, fomo=false}:any) {
  const score=Number.isFinite(item?.score)?item.score:null;
  return <details className="completion-row" data-completion-factor={fomo?'FOMO':item.id}>
    <summary><span className="completion-factor-name"><b>{fomo?'FOMO · 관심·추격·과열':item.name}</b><small>{fomo?(score===null?'점수 미산출':`관측 점수 ${score.toLocaleString('ko-KR',{maximumFractionDigits:2})}${item.asOf?` · ${item.asOf}`:''}`):item.id}</small></span>
      <span className="completion-stages">{stages.map(([key,label])=><Stage key={key} stage={key} name={label} value={item[key]}/>)}</span>
      <span className="completion-expand" aria-hidden="true">＋</span>
    </summary>
    {fomo&&Number.isFinite(item.partialMetric?.score)&&<p className="completion-partial-metric"><b>{item.partialMetric.name||'부분 관측 지표'} {item.partialMetric.score.toLocaleString('ko-KR',{maximumFractionDigits:2})}</b><br/>{item.partialMetric.reason||'확보한 일부 자료로 계산한 값이며 전체 FOMO 점수가 아닙니다.'}</p>}
    <div className="completion-evidence">{stages.map(([key,label])=>{
      const value=item[key],status=validStatus(value?.status);
      return <section key={key}><h4>{label} · {stageLabel(key,status)}</h4><p>{value?.reason||'근거 기록이 없습니다. 완료로 세지 않습니다.'}</p>
        {Number.isInteger(value?.count)&&<p className="completion-meta">자료 {count(value.count)}개{value.firstDate&&value.lastDate?` · ${value.firstDate} — ${value.lastDate}`:''}</p>}
        {value?.sources?.map((source:any,i:number)=>{
          const url=safeURL(source.url);return <div className="completion-source" key={`${source.url}-${i}`}>
            {url?<a href={url} target="_blank" rel="noreferrer">{source.title||'원자료 출처'} ↗</a>:<span>유효한 공개 출처 주소 없음</span>}
            {source.observedAt&&<small>관측 {stamp(source.observedAt)}</small>}
            {source.rawHash&&<code title={source.rawHash}>원문 지문 {source.rawHash.slice(0,16)}…</code>}
          </div>;
        })}
      </section>;
    })}</div>
    {fomo&&<p className="completion-caveat">관측 점수와 이후 주가를 맞히는 능력은 별개입니다. 미확보는 0점이 아니며, 높은 점수를 자동 상승률로 더하지 않습니다.</p>}
  </details>;
}

const pressMetric:Record<string,string>={executed_treasury_buyback_shares:'자사주 매입 누적 주식 수',executed_treasury_buyback_amount:'자사주 매입 누적 금액',executed_treasury_buyback_plan_ratio:'자사주 매입 계획 대비 집행률',reported_consensus_revenue:'당시 매출 예상치',reported_consensus_operating_profit:'당시 영업이익 예상치',market_margin_credit_balance:'시장 전체 신용융자 잔고',market_securities_collateral_loan_balance:'시장 전체 예탁증권담보융자',investor_deposit_balance:'투자자 예탁금',BOK_base_rate_after_decision:'결정 후 기준금리',BOK_base_rate_before_decision:'결정 전 기준금리',BOK_base_rate_change:'기준금리 변경폭',Korea_total_exports_provisional:'잠정 수출액',Korea_exports_growth_yoy:'수출 전년 대비 변화',Korea_imports_provisional:'잠정 수입액',reported_revenue:'보도된 매출',reported_operating_profit:'보도된 영업이익',reported_FnGuide_consensus_revenue:'당시 에프앤가이드 매출 예상',reported_FnGuide_consensus_operating_profit:'당시 에프앤가이드 영업이익 예상',reported_completed_buyback_cumulative:'완료된 자사주 매입 누적',reported_cancellation_cumulative:'자사주 소각 누적',planned_additional_buyback:'추가 자사주 매입 계획',foreign_net_buy_amount:'외국인 순매수 금액',retail_net_buy_rank:'개인 순매수 순위',retail_net_sell_rank:'개인 순매도 순위',reported_current_consensus_operating_profit:'보도 시점 영업이익 예상',reported_consensus_operating_profit_three_months_earlier:'3개월 전 영업이익 예상',reported_three_month_consensus_revision:'3개월간 예상치 수정',retail_net_buy_amount:'개인 순매수 금액',Korea_CPI_reported:'보도된 소비자물가',reported_YonhapInfomax_consensus_operating_profit:'당시 연합인포맥스 영업이익 예상',reported_completed_cancellation:'완료된 자사주 소각',BOK_GDP_growth_projection_not_actual:'한국은행 성장률 전망 · 실제값 아님',survey_share_expected_hold:'금리 동결 예상 응답 비중',survey_sample_size:'설문 응답자 수',pension_funds_etc_net_buy:'연기금 등 순매수 · 국민연금 단독 아님',M2_monthly_average_seasonally_adjusted:'계절조정 M2 월평균',M2_change_mom:'M2 전월 대비 금액 변화',M2_growth_mom:'M2 전월 대비 증가율',M2_growth_yoy:'M2 전년 대비 증가율',foreign_net_buy:'외국인 순매수',retail_net_buy:'개인 순매수',institution_total_net_buy:'기관 전체 순매수',kospi_foreign_spot_net_buy:'코스피 외국인 현물 순매수',kospi200_foreign_futures_net_buy:'코스피200 외국인 선물 순매수',preliminary_operating_profit:'잠정 영업이익',reported_LSEG_SmartEstimate_operating_profit:'당시 LSEG 영업이익 예상',planned_investment_budget:'투자 예산 계획',planned_investment_duration:'투자 계획 기간'};
const pressUnit:Record<string,string>={shares:'주',KRW:'원',percent:'%', 'KRW billion':'십억원',KRW_100m:'억원',percentage_points:'%p',USD:'달러',percent_yoy:'% · 전년 대비','KRW 100 million':'억원',rank:'위',percent_respondents:'% · 응답자 비중',respondents:'명',KRW_trillion:'조원',KRW_trillion_change_mom:'조원 · 전월 대비','percent_mom':'% · 전월 대비','KRW trillion':'조원','USD million':'백만 달러',years:'년'};
export function newspaperForStock(report:any,code:string){
 if(report?.schema!=='atlas-newspaper-evidence-1'||!Array.isArray(report.sources))return [];
 return report.sources.filter((source:any)=>source.sourceBodyRead===true&&source.snapshotVerified===true).map((source:any)=>({...source,observations:(source.observations??[]).filter((o:any)=>o.scope==='market'||Array.isArray(o.targetCodes)&&o.targetCodes.includes(code))})).filter((source:any)=>source.observations.length);
}
export function NewspaperEvidence({code,name}:any){
 const[state,setState]=React.useState<any>({kind:'loading'});
 React.useEffect(()=>{let live=true;fetch('/data/newspaper-evidence.json',{cache:'no-store'}).then(async response=>{if(!response.ok)throw Error('신문 자료를 읽지 못했습니다.');const report=await response.json();if(report.schema!=='atlas-newspaper-evidence-1')throw Error('신문 자료 형식 확인 필요');if(live)setState({kind:'ready',report});}).catch(error=>{if(live)setState({kind:'error',message:error.message});});return()=>{live=false;};},[]);
 const sources=state.kind==='ready'?newspaperForStock(state.report,code):[];
 return <details className="completion-newspaper" data-newspaper-stock={code}><summary>신문으로 보완한 자료 · {name}·시장 공통 {state.kind==='ready'?`${sources.length}개 기사`:'확인 중'}</summary>
  <p>별도로 조사한 신문 관측입니다. 공식 원자료 확보 수나 모형 계산 사용 수로 올려 세지 않습니다. 아래 수치는 현재 전망 계산에 미반영입니다.</p>
  {state.kind==='error'?<p>{state.message}</p>:state.kind==='loading'?<p>신문 근거를 불러옵니다.</p>:!sources.length?<p>이 종목에 연결할 본문 확인 자료가 없습니다.</p>:sources.map((source:any)=><article key={source.id} data-newspaper-source={source.id}><h4>{safeURL(source.url)?<a href={safeURL(source.url)!} target="_blank" rel="noreferrer">{source.title} ↗</a>:source.title}</h4><small>{source.publisher} · 발표 {source.publicationDate||'날짜 미확보'} · {source.publicationTimeVerified?'공개 시각 확인':'공개 시각 미확보'} · ATLAS 확인 {stamp(source.knownToAtlasAt??source.observedAt)}</small>
   {source.observations.map((o:any,index:number)=><div className="completion-press-observation" key={index} data-newspaper-target={o.scope==='market'?'market':code}><b>{pressMetric[o.metric]||o.metric}</b><span>{o.rawNumericObservationUsable===true&&Number.isFinite(o.value)?`${o.value.toLocaleString('ko-KR',{maximumFractionDigits:6})} ${pressUnit[o.unit]||o.unit}`:'관측값 유보'}</span><small>{o.scope==='market'?'시장 전체 · 종목별 수급 아님':name} · {o.startDate&&o.endDate?`${o.startDate} — ${o.endDate}`:o.periodLabel||o.date||'대상 시점 미확보'} · {o.aggregation==='period_sum'?'기간 합계 · 일별값 아님':o.aggregation==='period_total'?'기간 누적 관측 · 일별값 아님':o.aggregation==='period_rank'?'기간 순위 · 금액 아님':o.periodLabel?'해당 기간 자료 · 일별값 아님':'시점 관측'}</small><p>모형 미반영: {o.reason||'당시 빈티지·연속 이력·추가 예측력 미검증'}</p></div>)}
   {source.limitations?.length>0&&<p className="completion-caveat">{source.limitations.join(' · ')}</p>}
  </article>)}
 </details>;
}

const ratio=(value:any)=>Number.isFinite(value)?`${(value*100).toFixed(1)}%`:'미산출';
const decimal=(value:any)=>Number.isFinite(value)?value.toFixed(5):'미산출';
export function CompletionDailyReport({version}:any) {
  const [state,setState]=React.useState<any>({kind:'loading'});
  React.useEffect(()=>{let live=true;setState({kind:'loading'});
    fetch('/data/completion-daily-score.json',{cache:'no-store'}).then(async response=>{
      if(!response.ok)throw Error('이 발행본의 일일 보고서가 아직 없습니다.');
      const report=await response.json();
      if(report.schema!=='atlas-completion-daily-score-1'||report.forecastId!==version.id||!Array.isArray(report.byDate))throw Error('선택 발행본과 일치하는 일일 보고서가 없습니다.');
      if(live)setState({kind:'ready',report});
    }).catch(error=>{if(live)setState({kind:'error',message:error.message});});return()=>{live=false;};
  },[version.id]);
  if(state.kind!=='ready')return <section className="panel completion-daily" data-completion-daily-state={state.kind}><h2>날짜별 결과 기록</h2><p>{state.kind==='loading'?'발행 이후의 관측 보고서를 확인합니다.':state.message}</p></section>;
  const report=state.report,days=[...report.byDate].sort((a:any,b:any)=>a.date.localeCompare(b.date)),latest=days.at(-1);
  return <section className="panel completion-daily" data-completion-daily-state="ready" data-daily-forecast={report.forecastId}>
    <div className="completion-heading"><div><h2>날짜별 결과 기록</h2><p>관측 {days.length}거래일 · 발행 이후의 실제 종가로 채점합니다.</p></div><a href="/data/completion-daily-score.json" download="ATLAS_Daily_Report.json">일일 보고서 JSON ↓</a></div>
    {latest?<><p><b>{latest.date}</b> · 채점 {count(latest.stocks)}종목 · 방향 맞음 {count(latest.correct)} / 틀림 {count(latest.wrong)}</p>
      <div className="completion-daily-metrics">{[['당일 방향 일치',ratio(latest.hitRate)],['예측 대비 절대 오차',ratio(latest.meanAbsoluteError)],['예측 범위 담김',ratio(latest.coverage)],['폭·담김 점수',decimal(latest.intervalScore)],['방향 Brier',decimal(latest.brier)],['같은 방향 최대 비중',ratio(latest.commonDirectionFraction)]].map(([name,value])=><div key={name}><small>{name}</small><b>{value}</b></div>)}</div>
      <details className="completion-coverage"><summary>날짜별 기록 {days.length}건</summary>{days.map((day:any)=><article className="completion-daily-row" key={day.date}><b>{day.date}</b><span>맞음 {count(day.correct)} / 틀림 {count(day.wrong)} · {ratio(day.hitRate)}</span><span>가격 오차 {ratio(day.meanAbsoluteError)} · 범위 담김 {ratio(day.coverage)}</span><small>폭·담김 {decimal(day.intervalScore)} · Brier {decimal(day.brier)} · 같은 방향 {ratio(day.commonDirectionFraction)}</small></article>)}</details></>:<p className="completion-daily-pending">채점 가능한 발행 이후의 실제 종가를 기다립니다. 맞음·틀림·적중률은 아직 미산출입니다.</p>}
    <p className="completion-caveat">같은 날 52종목을 52번의 독립 시험으로 세지 않습니다. 당일 방향 일치율은 관측 결과이며 미래 적중 확률이 아닙니다. 폭·담김 점수와 Brier는 낮을수록 좋습니다. 오차의 원인 규명과 인과관계는 별도 검증이 필요합니다.</p>
  </section>;
}

export function CompletionStatus({version}:any) {
  const [state,setState]=React.useState<any>({kind:'loading'}),[selected,setSelected]=React.useState(''),[filter,setFilter]=React.useState('all');
  React.useEffect(()=>{
    let live=true;setState({kind:'loading'});
    fetch('/data/completion-status.json',{cache:'no-store'}).then(async response=>{
      if(!response.ok)throw Error('수집·연결 현황을 읽지 못했습니다.');
      const report=await response.json();
      if(!validCompletionReport(report,version))throw Error('선택 전망과 일치하는 52종목·36요인 현황이 없습니다. 이전 현황을 대신 표시하지 않습니다.');
      if(live){setState({kind:'ready',report});setSelected(current=>report.stocks.some((s:any)=>s.code===current)?current:report.stocks[0].code);}
    }).catch(error=>{if(live)setState({kind:'error',message:error.message});});
    return()=>{live=false;};
  },[version.id]);
  if(state.kind!=='ready')return <section className="panel completion-status" data-completion-state={state.kind} role="status"><h2>52종목 자료·계산 연결</h2><p>{state.kind==='loading'?'이 전망의 근거 현황을 확인합니다.':state.message}</p></section>;
  const report=state.report,s=report.summary,stock=report.stocks.find((item:any)=>item.code===selected)??report.stocks[0];
  const rows=stock.factors.filter((f:any)=>filter==='all'||(filter==='used'?f.calculation?.status==='ready':stages.some(([key])=>!['ready','not_applicable','excluded'].includes(f[key]?.status))));
  const operation=report.operation??{};
  return <section className="panel completion-status" data-completion-state="ready" data-completion-forecast={report.forecastId}>
    <div className="completion-heading"><div><h2>52종목 자료·계산 연결</h2><p>자료를 찾은 것과 가격 계산에 사용한 것을 따로 확인합니다.</p></div><a href="/data/completion-status.json" download="ATLAS_52_Factor_Status.json">전체 근거 JSON ↓</a></div>
    <div className="completion-totals">
      <article><small>36요인 원자료 확보</small><b>{count(s.factorTypesWithRawSource)}<span> / 36</span></b><p>부분 확보·대용값 제외{Number.isInteger(s.componentSourceFactorTypes)?` · 일부 ${s.componentSourceFactorTypes}종류`:''}</p></article>
      <article><small>현재 계산에서 사용</small><b>{count(s.factorTypesUsed)}<span>종류</span></b><p>사용 여부는 정확도 인증과 다릅니다.</p></article>
      <article><small>FOMO 계산 가능</small><b>{count(s.fomoComputedStocks)}<span> / 52종목</span></b><p>미확보는 0점으로 바꾸지 않습니다.</p></article>
    </div>
    <div className="completion-run"><b>이번 수집 {count(s.collectedStocks)} / 52종목</b><span>공통 보관 종가 {report.actualAsOf||'미확보'}</span><span>현황 작성 {stamp(report.generatedAt)}</span></div>
    <details className="completion-coverage"><summary>요인별 원자료 확보 종목 수 / 52</summary><div className="completion-coverage-grid">{report.factors.map((f:any)=><div key={f.id}><span>{f.id} · {f.name}</span><b>{count(f.rawSourceStocks)} / 52</b><small>현재 계산 사용 {count(f.usedStocks)}종목</small></div>)}</div></details>
    <details className="completion-stock-picker" open><summary>종목을 클릭해 개별 근거 확인 · {stock.name}</summary><div className="completion-stock-buttons" role="group" aria-label="근거 확인 종목 선택">{report.stocks.map((item:any)=><button type="button" key={item.code} data-completion-stock={item.code} aria-pressed={item.code===stock.code} onClick={()=>setSelected(item.code)}>{item.name}</button>)}</div></details>
    <div className="completion-selected"><div><h3>{stock.name}<small>{stock.code} · {stock.sector}</small></h3></div><div className="completion-filters" role="group" aria-label="요인 상태 필터">{[['all','전체 36'],['gaps','미완성'],['used','계산 사용']].map(([key,label])=><button type="button" aria-pressed={filter===key} key={key} onClick={()=>setFilter(key)}>{label}</button>)}</div></div>
    <NewspaperEvidence code={stock.code} name={stock.name}/><div data-completion-selected={stock.code}><EvidenceRow item={stock.fomo} fomo/>{rows.length?rows.map((f:any)=><EvidenceRow key={f.id} item={f}/>):<p>이 필터에 해당하는 요인이 없습니다.</p>}</div>
    <details className="completion-operation"><summary>오후 4시 운영 연결 상태</summary><p>서버 설치 {installation(operation.serverInstalled)} · 예약 연결 {installation(operation.schedulerInstalled)}</p><p>{operation.reason||'실제 설치·실행 증거가 없어 자동 운영 중으로 표시하지 않습니다.'}</p><p>최근 실행 {stamp(operation.lastRunAt)} · 결과 {operation.lastRunStatus||'미기록'}</p></details>
    <p className="completion-caveat">발행본 {report.forecastId}. 같은 발행본의 계산·그래프와 연결합니다. 연구 모형의 계산 사용, 화면 연결, 실제 시장에서의 예측력 검증은 서로 다른 단계입니다.</p>
  </section>;
}
