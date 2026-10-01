/* ATLAS 11 · 성적(실시간 채점 + 채점 예정표) · 자료 상태(36요인 격자 · 달력 · 실행 기록 · 검사 증거 · 무결성) — 진화는 view-evolution.js */
import {h, num, pct, pctPoint, pctRaw, won, korDate, shortDate, weekday, stamp, kst, dirWord, dirMark, DIR, finite, download, csvCell, reducedMotion} from './util.js';
import {loadScores, loadEvolution, loadStatus, loadCards, loadLedger, loadMisses, setSummary, url, state} from './store.js';
import {reportDetails} from './view-records.js';
import {headline, editionSource, lineChart, pickBox} from './frame.js';
import {bars} from './chart.js';

const section = (title, ...children) => h('section', {class: 'card'}, h('h2', null, title), ...children);
const table = (head, rows, cls = '') => h('div', {class: 'table-wrap'}, h('table', {class: 'table ' + cls}, h('thead', null, h('tr', null, ...head.map(x => h('th', null, x)))), h('tbody', null, ...rows.map(r => h('tr', null, ...r.map(c => h('td', null, c)))))));
const f2 = v => finite(v) ? v.toFixed(2) : '미산출';
const f3 = v => finite(v) ? v.toFixed(3) : '미산출';

/* ---------- 성적 v9: 헤드라인(그날 방향 맞힘) → 날짜별 방향 맞힘(선, 마지막 값 = 헤드라인) → 오차 분포(막대) → 표는 눌러야 열림 ---------- */
export async function renderScores(main, {manifest}) {
  const [s, ev, cards] = await Promise.all([loadScores(), loadEvolution(), loadCards()]);
  const scored = s.byDate.filter(d => (d.horizonSummary?.[1]?.evaluated ?? 0) > 0);
  const latest = scored.at(-1);
  const schedule = s.schedule ?? [];
  const firstByHorizon = Object.fromEntries([1, 5, 10, 20].map(k => [k, schedule.find(x => x.horizon === k)?.targetDate ?? manifest.futureDates[k - 1]]));
  const ledger = await loadLedger().catch(() => null), sp = ev.autoEvolution?.scoringPolicy ?? null;
  const nameOf = code => cards.cards.find(x => x.code === code)?.name ?? code;
  const pending = h('ul', {class: 'plain small'}, ...[1, 5, 10, 20].map(k => h('li', null, `${k}거래일 전망 · 첫 채점 ${korDate(firstByHorizon[k])} 종가 뒤${firstByHorizon[k] <= s.targetDate ? ' · 채점함' : ''}`)));
  if (!latest) {
    setSummary(`실제 성적은 아직 없습니다. 첫 채점은 ${korDate(firstByHorizon[1])} 종가가 확정된 뒤입니다.`);
    main.replaceChildren(headline({parts: [`첫 채점 ${korDate(firstByHorizon[1])} 종가 뒤 · 지금까지 채점 `, {figure: '0종목'}], source: editionSource(manifest, 'scores.json')}), h('section', {class: 'panel'}, h('h2', {class: 'panel-title'}, '채점 예정표'), pending));
    return;
  }
  const hs1 = latest.horizonSummary[1];
  const ids = [...new Set(latest.rows.map(r => r.horizons['1']).filter(c => c?.status === 'evaluated').map(c => c.forecastId))];
  setSummary(`${korDate(latest.date)} 종가 채점. 1거래일 전망 ${hs1.evaluated}종목 중 방향 맞힘 ${hs1.correct}종목, 평균 오차 ${pctRaw(hs1.meanAPE)}.`);
  const hl = headline({speak: `${korDate(latest.date)} 종가 채점, 1거래일 전망 ${hs1.evaluated}종목 중 방향 맞힘 ${hs1.correct}종목, 평균 오차 ${pctRaw(hs1.meanAPE)}`,
    parts: [`${korDate(latest.date)} 종가 채점 · 1거래일 전망 ${hs1.evaluated}종목 중 방향 맞힘 `, {figure: `${hs1.correct}종목`}, ` · 평균 오차 ${pctRaw(hs1.meanAPE)}`],
    source: [['이 숫자', `예측한 방향(상승·보합·하락)과 실제 방향이 같은 종목 수 · 틀림 ${hs1.wrong}종목(그중 실제 보합 ${hs1.flatActual}종목)`], ['평균 오차', `|중앙 전망 − 실제 종가| ÷ 실제 종가 를 ${hs1.evaluated}종목 평균한 값`], ['채점 규칙', `보합 경계 ±${((s.delta ?? 0.001) * 100).toFixed(2)}% · 같은 거래일에 여러 번 발행하면 먼저 발행한 것만 채점 · 규칙은 결과를 보기 전에 고정${sp ? `(${sp.version})` : ''}`], ['채점한 발행본', h('span', null, ...ids.map(id => h('code', null, id)))], ...editionSource(manifest, 'scores.json')]});
  // 증거 그래프: 날짜별 방향 맞힘(마지막 값 = 헤드라인 숫자) · 가운데 기준선 = 52종목의 절반
  const lineBox = h('div');
  const evidence = h('section', {class: 'panel', 'aria-label': '헤드라인 숫자의 증거 그래프'}, h('h2', {class: 'panel-title'}, '날짜별 1거래일 전망 방향 맞힘'), lineBox,
    h('p', {class: 'legend-line'}, h('span', {class: 'leg-i'}, h('span', {class: 'key pred'}), '방향 맞힘 종목 수'), h('span', {class: 'leg-i'}, h('span', {class: 'key ref'}), `점선 = 52종목의 절반(26종목)`)));
  // 그날 판: 오차 분포 막대 · 종목별 표(눌러야 열림)
  const sel = h('select', {class: 'select small', 'aria-label': '채점 날짜', onchange: ev => renderDay(ev.target.value)}, ...scored.slice().reverse().map(d => h('option', {value: d.date, selected: d.date === latest.date}, korDate(d.date))));
  const dayTitle = h('h2', {class: 'panel-title'}), distBox = h('div', {class: 'bars'}), resultBox = h('div', {class: 'bars'}), bandBox = h('div', {class: 'bars'}), tableFold = h('details', {class: 'more'});
  const BINS = [[0, 0.5, '0.5% 미만'], [0.5, 1, '0.5%~1%'], [1, 2, '1%~2%'], [2, 3, '2%~3%'], [3, Infinity, '3% 이상']];
  const renderDay = date => {
    const d = scored.find(x => x.date === date), hs = d.horizonSummary;
    const rows = d.rows.filter(r => r.horizons['1']?.status === 'evaluated').sort((a, b) => a.horizons['1'].ape - b.horizons['1'].ape);
    dayTitle.textContent = `${korDate(date)} 종가 · 1거래일 전망 ${hs[1].evaluated}종목`;
    const inBand = rows.filter(r => r.horizons['1'].covered === true).length;
    bars(resultBox, [{label: '방향 맞힘', value: hs[1].correct}, {label: `방향 틀림(실제 보합 ${hs[1].flatActual}종목 포함)`, value: hs[1].wrong}], {max: hs[1].evaluated, format: v => v + '종목'});
    bars(bandBox, [{label: '80% 범위 안', value: inBand}, {label: '80% 범위 밖', value: rows.length - inBand}], {max: hs[1].evaluated, format: v => v + '종목'});
    bars(distBox, BINS.map(([a, b, label]) => ({label, value: rows.filter(r => r.horizons['1'].ape >= a && r.horizons['1'].ape < b).length})), {max: hs[1].evaluated, format: v => v + '종목'});
    tableFold.replaceChildren(h('summary', null, `종목별 채점 표 열기 · ${rows.length}종목`),
      table(['종목', '예측 중앙', '실제 종가', '오차', '예측 방향', '실제 방향', '80% 범위'], rows.map(r => { const c = r.horizons['1']; return [r.name, won(c.forecast), won(c.actual), pctRaw(c.ape), dirMark(c.predictedDirection) + dirWord(c.predictedDirection), dirMark(c.observedDirection) + dirWord(c.observedDirection), c.covered ? '안' : '밖']; }), 'small'),
      h('div', {class: 'toggles'}, h('button', {class: 'ctl', type: 'button', onclick: () => download(`ATLAS_score_${date.replaceAll('-', '')}.csv`, ['날짜,거리,종목,코드,예측,실제,오차%,예측방향,실제방향,띠담김,Brier,발행본', ...[1, 5, 10, 20].flatMap(k => d.rows.filter(r => r.horizons[k]?.status === 'evaluated').map(r => { const c = r.horizons[k]; return [date, k, csvCell(r.name), r.code, c.forecast, c.actual, c.ape?.toFixed(4), c.predictedDirection, c.observedDirection, c.covered, c.brier?.toFixed(4), c.forecastId].join(','); }))].join('\r\n'))}, 'CSV 내려받기'), h('button', {class: 'ctl', type: 'button', onclick: () => download(`ATLAS_score_${date.replaceAll('-', '')}.json`, JSON.stringify(d, null, 1), 'application/json;charset=utf-8')}, 'JSON 내려받기')));
  };
  const ho = ev.operating.holdoutAverage, cb = ev.candidateB;
  const retro = h('details', {class: 'more'}, h('summary', null, '후향 진단 열기 · 과거 자료로 돌린 진단(실시간 성적 아님)'),
    h('p', {class: 'muted small'}, '발행 뒤 실제 성적과 분리합니다. 당시 빈티지·기업행위 미검증 · 단일 출처.'),
    table(['지표', '운영 A', '비교 기준(평균 0 · 분산 고정)'], [['CRPS(낮을수록 좋음)', f3(ho.crps), f3(ho.baselineCRPS)], ['방향 정답률', pctPoint(ho.directionAccuracy), pctPoint(ho.baselineDirectionAccuracy)], ['80% 범위 담김', pctPoint(ho.coverage), pctPoint(ho.baselineCoverage)], ['가격 절대오차', pctPoint(ho.absolutePriceError), pctPoint(ho.baselineAbsolutePriceError)]], 'small'),
    h('p', {class: 'muted xs'}, `보류 구간 ${korDate(ho.first)} ~ ${korDate(ho.last)} · ${ho.note}`),
    cb ? table(['A/B 후향 비교', '운영 A', '후보 B', '채택 조건'], [['평균 절대 가격 오차율', pctRaw(cb.A.meanErrorPct), pctRaw(cb.B.meanErrorPct), 'B 가 A 보다 작아야 함'], ['상위 5종목 순위 적중 합계', `${cb.A.rankHits}회/${cb.rankMaximum}회`, `${cb.B.rankHits}회/${cb.rankMaximum}회`, 'B 가 A 이상이어야 함']], 'small') : null);
  const misses = await loadMisses().catch(() => null);
  main.replaceChildren(...[hl, evidence,
    h('section', {class: 'panel'}, dayTitle, h('div', {class: 'controls-row'}, h('label', {class: 'field'}, h('span', {class: 'lbl'}, '채점 날짜'), pickBox(sel, {cls: 'small'}))), h('h3', {class: 'panel-sub'}, '방향'), resultBox, misses?.counts?.wrong ? h('button', {class: 'ctl jump-misses', type: 'button', onclick: () => document.getElementById('misses')?.scrollIntoView({behavior: reducedMotion() ? 'auto' : 'smooth', block: 'start'})}, '방향이 틀린 까닭 보기 ↓') : null, h('h3', {class: 'panel-sub'}, '가격이 80% 범위 안에 들었나'), bandBox, h('h3', {class: 'panel-sub'}, '가격 오차 분포'), distBox, tableFold),
    missPanel(misses),
    h('section', {class: 'panel'}, h('h2', {class: 'panel-title'}, '채점 예정표'), pending, retro),
    h('section', {class: 'panel'}, h('h2', {class: 'panel-title'}, '일일 보고'), reportDetails(ledger?.dailyReport ?? null))].filter(Boolean));
  lineChart(lineBox, {dates: scored.map(d => d.date), series: [{id: 'hit', name: '방향 맞힘', values: scored.map(d => d.horizonSummary[1].correct), cls: 'pred'}], unit: '종목', format: v => String(Math.round(v)), yMin: 0, yMax: 52, ticks: [0, 26, 52], ref: 26, height: 190, ariaLabel: '날짜별 방향 맞힘: ' + scored.map(d => `${korDate(d.date)} ${d.horizonSummary[1].correct}종목`).join(', ')});
  renderDay(latest.date);
}

/* ---------- 왜 틀렸나(10/01 사장님 요청): 틀린 1거래일 전망을 네 통으로 · 한꺼번에 민 까닭(「하락」 쏠림)
   숫자는 misses.json(매일 실행 때 장부의 채점·원인 분석으로 다시 만듦) · 비교는 막대 · 목록·대조·규칙은 눌러야 열림 ---------- */
const signedP = (v, d = 1) => finite(v) ? `${v > 0 ? '+' : v < 0 ? '−' : ''}${Math.abs(v).toFixed(d)}%p` : '미산출';
const share = (a, b) => b ? Math.round(a / b * 100) : 0;
function missPanel(m) {
  if (!m || !m.counts?.wrong || !m.dates?.length) return null;
  const n = m.counts.cells, w = m.counts.wrong, L = m.lean, ns = m.noSignal, sg = m.signal;
  const span = m.dates.length > 1 ? `${korDate(m.firstDate)}~${korDate(m.lastDate)} 채점 ${m.dates.length}일` : `${korDate(m.firstDate)} 채점`;
  const lean = L.wrongFromDown >= L.wrongFromUp ? {word: '「하락」', n: L.wrongFromDown, tail: '오르거나 그대로였음'} : {word: '「상승」', n: L.wrongFromUp, tail: '내리거나 그대로였음'};
  const binBox = h('div', {class: 'bars'}), leanBox = h('div', {class: 'bars'}), hitBox = h('div', {class: 'bars'}), rangeBox = h('div', {class: 'bars'});
  bars(binBox, m.bins.map(b => ({label: b.label, value: m.binTotals[b.id] ?? 0})), {max: w, format: v => v + '건'});
  bars(leanBox, [{label: `예측 「하락」 (${n}건 중)`, value: L.predictedDown}, {label: `실제 하락 (${n}건 중)`, value: L.observedDown}], {max: n, format: v => `${v}건(${share(v, n)}%)`});
  bars(hitBox, [ns.cells ? {label: `신호 없던 ${ns.cells}건 중 맞힘 ${ns.right}건`, value: share(ns.right, ns.cells)} : null, sg.cells ? {label: `신호 있던 ${sg.cells}건 중 맞힘 ${sg.right}건`, value: share(sg.right, sg.cells)} : null].filter(Boolean), {max: 100, format: v => v + '%'});
  if (ns.ranges?.length) bars(rangeBox, ns.ranges.map(r => ({label: `예상 범위 ${r.from}~${r.to}% · ${r.n}건(「하락」 ${r.down}건)`, value: Math.max(0, r.tilt)})), {max: Math.max(...ns.ranges.map(r => r.tilt), 1), format: v => signedP(v)});
  const days = m.dates.map(d => `${korDate(d)} ${pctRaw(m.byDate[d].basketPct, 2, true)}`).join(' · ');
  const allDown = L.downDays === m.dates.length;
  const byBin = m.bins.map(b => [b, m.list.filter(x => x.bin === b.id)]).filter(([, xs]) => xs.length);
  const dirTxt = (k, extra) => `${dirMark(k)}${dirWord(k)} ${extra}`;
  return h('section', {class: 'panel', id: 'misses', 'aria-label': '왜 틀렸나'},
    h('h2', {class: 'panel-title'}, `왜 틀렸나 · 1거래일 전망 · ${span}`),
    h('p', {class: 'miss-lead'}, `틀린 ${w}건 중 ${lean.n}건은 ${lean.word}이라 했는데 ${lean.tail}`),
    h('h3', {class: 'panel-sub'}, `틀린 ${w}건을 네 통으로`), binBox,
    h('h3', {class: 'panel-sub'}, '여러 종목을 한꺼번에 틀리게 한 까닭: 「하락」 쏠림'), leanBox,
    h('p', {class: 'small'}, `모델 신호가 없던 종목(기본값·자기 추세·52종목 폭·평균 세 항이 모두 0.00%) ${ns.cells}건 중 ${ns.down}건을 「하락」으로 고름 · 하락 확률이 상승 확률보다 평균 ${signedP(ns.tilt)}`),
    h('h3', {class: 'panel-sub'}, '맞힌 비율'), hitBox,
    h('p', {class: 'muted small'}, `52종목 평균: ${days}${allDown ? ` · 채점한 ${m.dates.length}일 모두 내린 날이라, 맞힌 ${m.counts.right}건 중 ${ns.rightDown}건은 신호 없는 종목에서 고른 「하락」이 맞은 것 · 오르는 날의 성적은 아직 없음` : ` · 맞힌 ${m.counts.right}건 중 ${ns.rightDown}건은 신호 없는 종목에서 고른 「하락」`}`),
    ns.ranges?.length ? h('details', {class: 'more'}, h('summary', null, `흔들림이 넓을수록 「하락」 쪽으로 기욺 열기 · 신호 없던 종목 ${ns.rangedCells}건`), rangeBox, h('p', {class: 'muted xs'}, '예상 범위 = 그 종목의 80% 범위 폭 · 막대 = 하락 확률 − 상승 확률 평균 · 왜 기우는지는 아직 모름(시험 후보)')) : null,
    h('details', {class: 'more'}, h('summary', null, `틀린 ${w}건 목록 열기 · 통별`),
      ...byBin.flatMap(([b, xs]) => [h('h3', {class: 'panel-sub'}, `${b.label} ${xs.length}건`),
        table(['날짜', '종목', '예측', '실제', '까닭'], xs.map(x => [korDate(x.date), x.name, dirTxt(x.predicted, finite(x.prob) ? Math.round(x.prob * 100) + '%' : ''), dirTxt(x.observed, pct(x.actualReturn)), x.note ? `${x.why} · ${x.note}` : x.why]))])),
    h('details', {class: 'more'}, h('summary', null, '맞힌 종목과 견준 결과 열기'),
      table(['근거 종류', '틀린 쪽', '맞힌 쪽', '판정'], m.contrast.map(c => [c.label, `${c.wrongWith}/${c.wrong}건(${share(c.wrongWith, c.wrong)}%)`, `${c.rightWith}/${c.right}건(${share(c.rightWith, c.right)}%)`, c.passes ? '틀린 쪽에 더 많음' : '맞힌 쪽에 같거나 더 많음 → 까닭으로 보지 않음'])),
      h('p', {class: 'muted xs'}, '「전망 전에 알 수 있던 기업 일정」은 건수가 적어 판단이 약함')),
    h('details', {class: 'more'}, h('summary', null, '나누는 규칙 열기 · 결과를 보기 전에 정함'),
      h('ul', {class: 'plain small'}, ...m.rules.map(r => h('li', null, r))), h('p', {class: 'muted xs'}, m.basis)));
}

/* ---------- 자료 상태 v9: 헤드라인(확정 종가 종목 수) → 날짜별 확정 종가 확보 수(선) → 36요인·관측 기록 막대 → 표는 눌러야 열림 ---------- */
export async function renderStatus(main, {manifest}) {
  const st = await loadStatus();
  const rows = st.factors.rows, used = rows.filter(f => f.used > 0).length, observedOnly = rows.filter(f => !f.used && f.observed).length, missing = rows.filter(f => !f.used && !f.observed).length;
  const cx = st.context, cal = st.calendar ?? {};
  // 날짜마다 마지막 실행의 확정 종가 종목 수(마지막 값 = 헤드라인 숫자)
  const byDay = new Map(); for (const o of [...(st.operations ?? [])].sort((a, b) => a.at.localeCompare(b.at))) if (o.confirmedTodayStocks != null) byDay.set(kst(o.at).date, o.confirmedTodayStocks);
  if (!byDay.has(st.actualAsOf)) byDay.set(st.actualAsOf, st.prices.finalClose);
  const days = [...byDay.keys()].sort();
  const nStocks = st.prices.stocks, nFactors = rows.length; // 종목 수·요인 수도 자료에서 센다
  setSummary(`자료 상태. ${korDate(st.actualAsOf)} 15:30 KST 종가, ${nStocks}종목 중 확정 종가 ${st.prices.finalClose}종목. ${nFactors}요인 중 전망에 쓰는 요인 ${used}개, 관측만 ${observedOnly}개, 미확보 ${missing}개.`);
  const hl = headline({speak: `${korDate(st.actualAsOf)} 15:30 KST 종가, ${nStocks}종목 중 확정 종가 ${st.prices.finalClose}종목, ${nFactors}요인 중 전망에 쓰는 요인 ${used}개`,
    parts: [`${korDate(st.actualAsOf)} 15:30 KST 종가 · ${nStocks}종목 중 확정 `, {figure: `${st.prices.finalClose}종목`}, `(${Math.round(st.prices.finalClose / nStocks * 100)}%) · ${nFactors}요인 중 전망에 쓰는 요인 ${used}개(${Math.round(used / nFactors * 100)}%)`],
    source: [['이 숫자', `한국거래소 정규장 종가(15:30 KST 종가 단일가)를 받아 같은 방법으로 한 번 더 대조한 종목 수 · 이 발행본의 출발가`], ['마지막 관측', stamp(st.prices.anchorObservedAt)], ['받은 곳', '네이버 증권 분봉 원문(15:30 KST 종가 단일가) · 기업행위 조정 미검증'], ...editionSource(manifest, 'status.json')]});
  const lineBox = h('div');
  const evidence = h('section', {class: 'panel', 'aria-label': '헤드라인 숫자의 증거 그래프'}, h('h2', {class: 'panel-title'}, '날짜별 확정 종가 확보 종목 수(그날 마지막 실행)'), lineBox);
  const factorBars = h('div', {class: 'bars'}), ctxBars = h('div', {class: 'bars'}), zeroBars = h('div', {class: 'bars'});
  const tiles = rows.map(f => { const cls = f.used > 0 ? (f.nonZeroCoefficient > 0 ? 'used' : 'partial') : f.observed ? 'observed' : ''; return h('div', {class: 'ftile ' + cls, title: f.observed && !f.used ? (f.observed.label ?? '') : f.reason}, h('b', null, f.id), h('span', null, f.name), h('span', {class: 'xs'}, f.used > 0 ? `연결 ${f.used}종목 · 0 아닌 계수 ${f.nonZeroCoefficient ?? 0}종목` : f.observed ? `관측 ${f.observed.scope === 'market' ? '시장 전체' : (f.observed.stocks ?? 0) + '종목'} · ${f.observed.latest ? korDate(f.observed.latest) : '날짜 없음'}${f.observed.componentOnly ? ' · 일부 성분' : ''} · 전망 미사용` : '미확보')); });
  const upcoming = (cal.upcomingSessions ?? []).slice(0, 10), holidays = (cal.holidays ?? []).filter(x => x.date > st.actualAsOf);
  const ops = st.operations ?? [];
  const opsLine = [`예약 실행 ${st.schedule?.cronMeaning ?? '—'} · ${st.collector.serverKind ?? '실행 서버 미연결'}`, `마지막 실행 ${st.operation ? `${stamp(st.operation.at)} · ${st.operation.status === 'complete' ? '완료' : st.operation.status}` : '기록 없음'}`, `사이트 배포 ${st.collector.site ? `${st.collector.site.state === 'ready' ? '완료' : st.collector.site.state} · ${stamp(st.collector.site.at)}` : '미연결'}`, `예약 실행 확인 ${st.collector.lastScheduledRun ? `${stamp(st.collector.lastScheduledRun.at)} · ${st.collector.lastScheduledRun.status}` : '아직 없음(손으로 시작한 실행만 기록됨)'}`, `발행 끝 ${korDate(st.schedule?.publishEnd)}`];
  main.replaceChildren(hl, evidence,
    h('section', {class: 'panel'}, h('h2', {class: 'panel-title'}, '36요인 · 전망에 쓰는 것과 아닌 것'), factorBars, h('h3', {class: 'panel-sub'}, `쓰는 요인(F35·F11)이 연결된 52종목 가운데 계수가 실제로 움직이는 종목`), zeroBars,
      h('details', {class: 'more'}, h('summary', null, '36요인 하나씩 보기'), h('div', {class: 'legend'}, h('span', {class: 'leg'}, '진한 칸 = 전망에 씀'), h('span', {class: 'leg'}, '점선 칸 = 매일 기록하지만 검증 전이라 전망에 안 씀'), h('span', {class: 'leg'}, '옅은 칸 = 미확보(계수 0 · 관측값 0 아님)')), h('div', {class: 'fgrid'}, ...tiles))),
    cx ? h('section', {class: 'panel'}, h('h2', {class: 'panel-title'}, `${korDate(cx.day)} 모은 관측 기록 · 전망 숫자에 넣지 않음`), ctxBars, h('p', {class: 'small muted'}, `수집 ${stamp(cx.fetchedAt)}. 수급은 ${cx.summary.flows.stocks}종목을 받았고 그중 당일 값이 있는 종목은 ${cx.summary.flows.stocksWithToday}종목(잠정)입니다. 수집 오류 ${cx.errors}건 — 빈 값을 영으로 채우지 않습니다.`)) : null,
    h('section', {class: 'panel'}, h('h2', {class: 'panel-title'}, `앞으로 거래일 ${upcoming.length}일`), h('div', {class: 'cal'}, ...upcoming.map((d, i) => h('div', {class: 'day' + (i === 0 ? ' first' : '')}, korDate(d)))), holidays.length ? h('p', {class: 'small'}, '휴장: ' + holidays.map(x => `${korDate(x.date)} ${x.name}`).join(' · ')) : null, (cal.notices ?? []).length ? h('p', {class: 'small warn'}, '검토 필요: ' + cal.notices.map(n => `${korDate(n.date)} ${n.reason}`).join(' · ')) : null, h('p', {class: 'muted small'}, `정규장 마감 ${cal.regularClose ?? '15:30'} KST · 달력 검토 ${stamp(cal.checkedAt ?? st.calendarVersion?.checkedAt)}`)),
    h('section', {class: 'panel'}, h('h2', {class: 'panel-title'}, '운영'), h('ul', {class: 'plain small'}, ...opsLine.map(t => h('li', null, t))),
      ops.length ? h('details', {class: 'more'}, h('summary', null, `실행 기록 ${ops.length}건 표 열기`), table(['시각', '시작', '상태', '종료 코드', '확정 종가', '새 발행'], ops.map(o => [stamp(o.at), o.event === 'schedule' ? '예약' : o.event === 'workflow_dispatch' ? '손' : '서버', o.status, String(o.exitCode), o.confirmedTodayStocks != null ? o.confirmedTodayStocks + '종목' : '—', o.newForecast ? '예' : '아니오']), 'small ops')) : null,
      h('details', {class: 'more'}, h('summary', null, '가격 출처·FOMO·뉴스·가정 열기'), h('p', {class: 'small'}, st.prices.provider), h('p', {class: 'small'}, `FOMO: 전체 산출 ${st.fomo.full}종목 · 가격 열기 부분지표 ${st.fomo.priceHeat}종목 · ${st.fomo.note}`), h('p', {class: 'small'}, `뉴스: 확인 일정 ${st.news.events}건 · 수치로 추정 가능 ${st.news.numeric}건 · ${st.news.reason}`), h('ul', {class: 'plain small'}, ...st.assumptions.map(a => h('li', null, a)))),
      h('details', {class: 'more'}, h('summary', null, '검사 증거 열기'), h('ul', {class: 'plain small'}, h('li', null, h('a', {href: url(st.evidence?.browserReport ?? '/docs/evidence/browser-report.json'), target: '_blank', rel: 'noopener'}, '실제 크롬 조작 검사 보고(JSON)')), h('li', null, h('a', {href: url(st.evidence?.tests ?? '/docs/evidence/tests.tap'), target: '_blank', rel: 'noopener'}, '단위 검사 기록(TAP)')), h('li', null, h('a', {href: url(st.evidence?.independentCheck ?? '/docs/evidence/independent-check.md'), target: '_blank', rel: 'noopener'}, '별도 검증 에이전트 보고'))), h('p', {class: 'muted xs'}, st.evidence?.note ?? ''))));
  lineChart(lineBox, {dates: days, series: [{id: 'close', name: '확정 종가', values: days.map(d => byDay.get(d)), cls: 'pred'}], unit: '종목', format: v => String(Math.round(v)), yMin: 0, yMax: 52, ticks: [0, 26, 52], height: 180, ariaLabel: '날짜별 확정 종가 확보 종목 수: ' + days.map(d => `${korDate(d)} ${byDay.get(d)}종목`).join(', ')});
  bars(factorBars, [{label: '전망에 씀', value: used}, {label: '관측만(전망 미사용)', value: observedOnly}, {label: '미확보', value: missing}], {max: 36, format: v => v + '개'});
  bars(zeroBars, [{label: '영이 아닌 계수 있음', value: 52 - (st.factors.zeroModelStocks ?? 0)}, {label: '계수가 모두 영(평균 성분만)', value: st.factors.zeroModelStocks ?? 0}], {max: 52, format: v => v + '종목'});
  if (cx) bars(ctxBars, [{label: '기사(같은 기사 가림)', value: cx.summary.news.distinct}, {label: '공시', value: cx.summary.disclosures.items}, {label: '기업행위 낱말 공시', value: cx.summary.disclosures.corporateActions}, {label: '정정(잠정 → 확정)', value: cx.summary.revisions}], {format: v => num(v) + '건'});
}
