/* ATLAS 11 · 전망 — 52종목 카드(첫 화면: 작은 그래프·확률 막대) + 종목 상세(그래프가 주인공 · 두 겹 부채꼴 · 커서 말풍선 · 이유는 「한 줄」부터) */
import {h, won, pct, pctPoint, num, korDate, shortDate, weekday, stamp, dirWord, dirMark, DIR, finite, download, reducedMotion, clamp, wonShort} from './util.js';
import {loadCards, loadStock, prefs, url, state, setSummary} from './store.js';
import {priceChart, chartTip, sparkline, probBar, contributionBars, quantileBox} from './chart.js';
import {renderInfo, renderContextBox, renderChain, loadNetwork} from './view-network.js';

/* ---------- 재생 상태: 종목마다 독립 (커서·재생·속도·확인한 사건) · 종목당 타이머 1개 ---------- */
const players = new Map();
function player(code) {
  if (!players.has(code)) players.set(code, {index: 59, playing: false, speed: prefs.get('speed', 1), timer: null, acked: new Set(), waiting: null});
  return players.get(code);
}
export function pauseAllPlayers() { for (const p of players.values()) { p.playing = false; clearTimeout(p.timer); p.timer = null; } }

const tieBadge = (d, small) => d.exactTie ? '동률·규칙' : d.statisticalTie ? (small ? '통계적 동률' : '통계적으로 못 가름') : small ? '비슷함' : '확률 비슷함';
const dirChip = (d, {small = false} = {}) => h('span', {class: 'dir ' + (DIR[d.selected]?.cls ?? '') + (small ? ' small' : ''), title: `상승 ${pctPoint(d.probabilities?.up)} · 보합 ${pctPoint(d.probabilities?.flat)} · 하락 ${pctPoint(d.probabilities?.down)} · 표준오차 ±${pctPoint(d.monteCarloSE ?? 0)}`}, h('b', null, dirMark(d.selected) + ' ' + dirWord(d.selected)), h('span', {class: 'prob'}, ' ' + pctPoint(d.probabilities?.[d.selected], 0)), (d.closeCall || d.statisticalTie) ? h('span', {class: 'badge warn'}, tieBadge(d, small)) : null);

/* ---------- 52 카드 ---------- */
async function renderCards(main, manifest) {
  const data = await loadCards();
  const sortKey = prefs.get('sort', 'day20'), filterKey = prefs.get('filter', 'all');
  const q = prefs.get('query', '');
  const sorters = {day20: (a, b) => b.day20.return - a.day20.return || a.code.localeCompare(b.code), name: (a, b) => a.name.localeCompare(b.name, 'ko'), code: (a, b) => a.code.localeCompare(b.code), day1: (a, b) => (b.day1.probabilities.up - b.day1.probabilities.down) - (a.day1.probabilities.up - a.day1.probabilities.down) || a.code.localeCompare(b.code), band: (a, b) => (b.day20.p90 - b.day20.p10) / b.close - (a.day20.p90 - a.day20.p10) / a.close};
  const filters = {all: () => true, up: c => c.day1.selected === 'up', down: c => c.day1.selected === 'down', close: c => c.day1.closeCall || c.day1.statisticalTie, clear: c => !c.day1.closeCall && !c.day1.statisticalTie};
  const up = data.cards.filter(c => c.day1.selected === 'up').length, down = data.cards.filter(c => c.day1.selected === 'down').length, close = data.cards.filter(filters.close).length;
  const list = () => [...data.cards].sort(sorters[sortKey] ?? sorters.day20).filter(filters[filterKey] ?? filters.all).filter(c => !q || c.name.includes(q) || c.code.includes(q));
  const first = list()[0];
  setSummary(`52종목 전망. 자료 기준일 ${korDate(manifest.actualAsOf)} 확정 종가. 내일 상승 선택 ${up}종목, 하락 선택 ${down}종목, 확률이 비슷한 종목 ${close}개. 20거래일 전망 1위 ${first?.name ?? ''} ${pct(first?.day20.return)}.`);
  const grid = h('div', {class: 'grid', role: 'list'});
  const render = () => { const rows = list(); grid.replaceChildren(...rows.map(c => card(c))); counter.textContent = `${rows.length}종목 표시`; };
  const counter = h('span', {class: 'muted small'});
  const filterBtn = (key, label) => h('button', {class: 'filter' + (filterKey === key ? ' on' : ''), type: 'button', 'aria-pressed': String(filterKey === key), onclick: () => { prefs.set('filter', key); renderCards(main, manifest); }}, label);
  main.replaceChildren(
    h('section', {class: 'lead'},
      h('div', {class: 'lead-row'},
        h('h1', {class: 'h1', 'data-speak': '52종목의 내일'}, '52종목의 내일'),
        h('p', {class: 'muted', 'data-speak': `${korDate(manifest.actualAsOf)} 확정 종가에서 출발. 미래 ${manifest.futureDates.length}거래일.`}, `${korDate(manifest.actualAsOf)}(${weekday(manifest.actualAsOf)}) 확정 종가에서 출발 · 발행 ${stamp(manifest.issuedAt)} · 미래 ${manifest.futureDates.length}거래일(${shortDate(manifest.futureDates[0])}~${shortDate(manifest.futureDates.at(-1))})`)),
      h('div', {class: 'lead-stats'},
        stat('내일 상승 선택', up + '종목', 'up'), stat('내일 하락 선택', down + '종목', 'down'), stat('확률 비슷함', close + '종목', 'warn'), stat('실제 성적', manifest.scoredDates ? manifest.scoredDates + '일 채점' : `첫 채점 ${shortDate(manifest.firstScorableDate)}`, '')),
      h('div', {class: 'controls-row'},
        filterBtn('all', '전체 52'), filterBtn('up', `상승 선택 ${up}`), filterBtn('down', `하락 선택 ${down}`), filterBtn('close', `비슷함 ${close}`),
        h('label', {class: 'field'}, h('span', {class: 'sr'}, '정렬'), h('select', {class: 'select', 'aria-label': '정렬', onchange: ev => { prefs.set('sort', ev.target.value); renderCards(main, manifest); }}, ...[['day20', '20일 전망 높은 순'], ['day1', '내일 상승 확률 순'], ['band', '불확실성 큰 순'], ['name', '이름 순'], ['code', '코드 순']].map(([v, l]) => h('option', {value: v, selected: v === sortKey}, l)))),
        h('label', {class: 'field grow'}, h('span', {class: 'sr'}, '종목 찾기(선택)'), h('input', {class: 'input', type: 'search', placeholder: '종목 찾기 (선택 사항)', value: q, oninput: ev => { prefs.set('query', ev.target.value.trim()); render(); }})),
        counter)),
    grid,
    h('p', {class: 'foot muted'}, '작은 그래프: 검정 = 최근 20거래일 실제, 파랑 = 앞으로 20거래일 중앙 전망, 연한 띠 = 80% 모형 범위. 모형 비율은 2만 개 모의 경로에서 센 빈도이며 실제 적중률이 아닙니다. 「비슷함」은 1·2위 차이가 5%p 미만, 「통계적 동률」은 몬테카를로 표준오차 안입니다. 뉴스·전체 FOMO는 숫자에 넣지 않았습니다.'));
  render();
  // 효율: 화면이 한가할 때 앞쪽 종목 6개 상세를 미리 받아 두면 카드를 눌렀을 때 바로 열린다
  const idle = window.requestIdleCallback ?? (fn => setTimeout(fn, 400));
  idle(() => { for (const c of list().slice(0, 6)) loadStock(c.code).catch(() => {}); });
}
const stat = (label, value, cls) => h('div', {class: 'stat ' + cls, 'data-speak': `${label} ${value}`}, h('span', {class: 'stat-label'}, label), h('b', {class: 'stat-value'}, value));
function card(c) {
  const el = h('a', {class: 'stock-card', href: '#/stock/' + c.code, role: 'listitem', 'aria-label': `${c.name} 상세 · 내일 ${dirWord(c.day1.selected)} ${pctPoint(c.day1.probabilities[c.day1.selected], 0)} · 20일 ${pct(c.day20.return)}`},
    h('div', {class: 'card-head'}, h('span', {class: 'name'}, c.name), h('span', {class: 'code muted'}, c.code), h('span', {class: 'status-dot ' + (c.finalClose ? 'ok' : 'warn'), title: c.finalClose ? '확정 종가' : '보관 종가'})),
    h('div', {class: 'card-price'}, h('b', {class: 'price'}, won(c.close)), h('span', {class: 'chg ' + (c.change1 > 0 ? 'up' : c.change1 < 0 ? 'down' : 'flat')}, pct(c.change1))),
    sparkline(c.spark),
    h('div', {class: 'card-row'}, h('span', {class: 'lbl'}, '내일'), dirChip(c.day1, {small: true})),
    probBar(c.day1.probabilities, {legend: false}),
    h('div', {class: 'card-row'}, h('span', {class: 'lbl'}, '20일'), h('span', {class: 'ret ' + (DIR[c.day20.selected]?.cls ?? '')}, dirMark(c.day20.selected) + ' ' + pct(c.day20.return)), h('span', {class: 'muted small'}, won(c.day20.p50))),
    h('div', {class: 'card-row muted xs'}, h('span', null, `범위 ${wonShort(c.day20.p10)}~${wonShort(c.day20.p90)}`), h('span', null, c.recentError?.[1]?.ape != null ? `1일 오차 ${c.recentError[1].ape.toFixed(2)}%` : '오차 대기')),
    c.info ? miniRange(c.info) : null);
  return el;
}
/* 카드의 1년 범위 작은 띠: 현재가가 52주 최저~최고 사이 어디에 있는지 + 묶음 이름 */
function miniRange(i) {
  const pos = Math.max(0, Math.min(1, i.pos52 ?? 0));
  const bar = h('span', {class: 'range mini', role: 'img', 'aria-label': `1년 범위 ${wonShort(i.low52)}~${wonShort(i.high52)} 중 현재 위치 ${pctPoint(pos, 0)}`}, h('span', {class: 'range-track'}, h('span', {class: 'range-dot'})));
  bar.querySelector('.range-dot').style.left = (pos * 100).toFixed(1) + '%';
  return h('div', {class: 'card-row xs card-range'}, h('span', {class: 'lbl'}, '1년'), bar, h('span', {class: 'muted'}, `${pctPoint(pos, 0)} · ${i.groupName ?? ''}`));
}

/* ---------- 종목 상세 ---------- */
async function renderDetail(main, manifest, code) {
  const [cards, d, network] = await Promise.all([loadCards(), loadStock(code), loadNetwork().catch(() => null)]);
  const p = player(code);
  const dates = [...d.actual60.map(r => r.date), ...d.futureDates], anchorIndex = 59;
  const series = () => {
    const s = [{id: 'actual', kind: 'actual', points: d.actual60.map((r, i) => ({index: i, date: r.date, value: r.close}))},
      {id: 'today', kind: 'today', points: d.rows.map((r, j) => ({index: anchorIndex + j, date: r.date, value: r.p50, low: r.p10, high: r.p90}))}];
    if (p.showScenario) s.push({id: 'scenario', kind: 'scenario', points: d.scenario.prices.map((v, j) => ({index: anchorIndex + j, date: d.rows[j].date, value: v}))});
    if (d.previous && p.showPrevious !== false) s.push({id: 'previous', kind: 'previous', points: d.previous.rows.map(r => ({index: dates.indexOf(r.date), date: r.date, value: r.p50})).filter(x => x.index >= 0)});
    return s;
  };
  // 세 겹 부채꼴: 5~95% · 10~90% · 25~75% (분포의 분위수 그대로 · 대칭으로 바꾸지 않음)
  const bands = [{rows: d.rows.map((r, j) => ({index: anchorIndex + j, low: r.p05, high: r.p95})), cls: 'outer'}, {rows: d.rows.map((r, j) => ({index: anchorIndex + j, low: r.p10, high: r.p90})), cls: 'mid'}, {rows: d.rows.map((r, j) => ({index: anchorIndex + j, low: r.p25, high: r.p75})), cls: 'inner'}];
  const r1 = d.rows[1], r5 = d.rows[5], r20 = d.rows[20];
  const err = d.errors, errText = k => err?.[k]?.ape != null ? err[k].ape.toFixed(2) + '%' : null;
  const recent = errText(1) ?? errText(5) ?? errText(10) ?? errText(20);
  const baseSummary = `${d.name}. ${korDate(d.anchor.date)} 종가 ${won(d.anchor.close)}. 내일 ${dirWord(r1.direction.daily.selected)} ${pctPoint(r1.direction.daily.probabilities[r1.direction.daily.selected], 0)}${r1.direction.daily.closeCall ? ', 확률이 비슷합니다' : ''}. 5거래일 뒤 중앙 전망 ${won(r5.p50)} ${pct(r5.return)}. 20거래일 뒤 ${won(r20.p50)} ${pct(r20.return)}, 범위 ${won(r20.p10)}에서 ${won(r20.p90)}. ${recent ? '최근 오차 ' + recent : '실제 성적은 ' + korDate(manifest.firstScorableDate) + ' 종가부터 채점합니다'}.`;
  setSummary(baseSummary);

  const chartBox = h('div', {class: 'chart-box'}), explainBox = h('aside', {class: 'explain', 'aria-live': 'polite'}), dateStrip = h('div', {class: 'date-strip', role: 'listbox', 'aria-label': '날짜 선택'});
  const isMobile = () => window.matchMedia('(max-width: 899px)').matches;
  const backdrop = h('div', {class: 'sheet-backdrop', hidden: true, onclick: () => closeSheet()});
  let lastFocus = null;
  function openSheet() { if (!isMobile()) return; lastFocus = document.activeElement; explainBox.classList.add('open'); backdrop.hidden = false; explainBox.querySelector('.close')?.focus(); }
  function closeSheet() { explainBox.classList.remove('open'); backdrop.hidden = true; lastFocus?.focus?.(); }
  const reasonBtn = h('button', {class: 'ctl mobile-only', type: 'button', onclick: () => openSheet()}, '이유 보기');
  const cursorLabel = h('span', {class: 'cursor-text'});
  const playBtn = h('button', {class: 'ctl primary', type: 'button', 'aria-label': '재생 또는 정지'}, '▶ 재생');
  const speedSel = h('select', {class: 'select small', 'aria-label': '재생 속도', onchange: ev => { p.speed = Number(ev.target.value); prefs.set('speed', p.speed); }}, ...[[0.5, '느리게 (2초/일)'], [1, '1초/거래일'], [2, '빠르게 (0.5초/일)']].map(([v, l]) => h('option', {value: v, selected: v === p.speed}, l)));
  const slider = h('input', {class: 'slider', type: 'range', min: 0, max: dates.length - 1, step: 1, value: p.index, 'aria-label': '날짜 커서', oninput: ev => { setIndex(Number(ev.target.value)); }});
  const scenarioBtn = h('button', {class: 'ctl toggle' + (p.showScenario ? ' on' : ''), type: 'button', 'aria-pressed': String(Boolean(p.showScenario)), onclick: ev => { p.showScenario = !p.showScenario; ev.currentTarget.classList.toggle('on', p.showScenario); ev.currentTarget.setAttribute('aria-pressed', String(p.showScenario)); draw(); }}, '대표 시나리오 보기');
  const prevBtn = d.previous ? h('button', {class: 'ctl toggle' + (p.showPrevious !== false ? ' on' : ''), type: 'button', 'aria-pressed': String(p.showPrevious !== false), onclick: ev => { p.showPrevious = p.showPrevious === false; ev.currentTarget.classList.toggle('on', p.showPrevious !== false); draw(); }}, '어제 전망 보기') : h('span', {class: 'muted small'}, '어제 발행 없음(직전 거래일 발행본 없음)');
  const csvBtn = h('a', {class: 'ctl', href: url(d.csvUrl), download: d.csvUrl.split('/').pop()}, 'CSV 내려받기');
  const jsonBtn = h('button', {class: 'ctl', type: 'button', onclick: () => download(`ATLAS_${d.code}_${d.actualAsOf.replaceAll('-', '')}_detail.json`, JSON.stringify(d, null, 1), 'application/json;charset=utf-8')}, '상세 JSON');

  function tipFor(i) {
    if (i == null) return null;
    const date = dates[i], x = d.explain[date]; if (!x) return null;
    if (x.kind === 'forecast') return `<b>${korDate(date)} D+${x.horizon}</b><br>중앙 ${won(x.p50)} (${pct(x.cumulativeReturn)})<br>80% ${wonShort(x.p10)}~${wonShort(x.p90)}<br>${dirMark(x.direction.daily.selected)} ${dirWord(x.direction.daily.selected)} ${pctPoint(x.direction.daily.probabilities[x.direction.daily.selected], 0)}`;
    return `<b>${korDate(date)}${x.kind === 'anchor' ? ' 출발' : ' 실제'}</b><br>종가 ${won(x.close)}${x.dailyChange != null ? ' (' + pct(x.dailyChange) + ')' : ''}`;
  }
  let chart = null, firstDraw = !p.drawnOnce;
  function drawChart() {
    chart = priceChart(chartBox, {dates, series: series(), bands, anchorIndex, cursorIndex: p.index, reveal: firstDraw, ariaLabel: `${d.name} 실제 60거래일과 전망 20거래일 그래프`, onPick: i => { stop(); setIndex(i); openSheet(); }, onHover: (i, ev) => { if (i == null) { chartTip(chartBox, chart.svg, {index: null}); return; } const g = chart.geometry; chartTip(chartBox, chart.svg, {index: i, x: g.x(i), y: g.top, html: tipFor(i)}); }});
    firstDraw = false; p.drawnOnce = true;
  }
  /* 커서만 옮긴다 — 재생 중에 그래프 전체를 다시 그리지 않는다 */
  function moveCursor() {
    chart?.update(p.index);
    const date = dates[p.index]; cursorLabel.textContent = `${korDate(date)}(${weekday(date)}) ${p.index > anchorIndex ? 'D+' + (p.index - anchorIndex) : p.index === anchorIndex ? '출발(실제)' : '실제'}`;
    slider.value = p.index;
    for (const el of dateStrip.children) { const on = Number(el.dataset.index) === p.index; el.classList.toggle('on', on); el.setAttribute('aria-selected', String(on)); }
    const on = dateStrip.querySelector('.on'); if (on && !reducedMotion()) on.scrollIntoView({block: 'nearest', inline: 'center', behavior: 'smooth'});
    renderExplain();
  }
  function draw() { drawChart(); moveCursor(); }
  function setIndex(i) { p.index = clamp(i, 0, dates.length - 1); moveCursor(); }
  function importantAt(i) { const x = d.explain[dates[i]]; return (x?.events ?? []).filter(e => e.important && !p.acked.has(e.id)); }
  function tick() {
    if (!p.playing) return;
    if (p.index >= dates.length - 1) { stop(); return; }
    const next = p.index + 1; p.index = next; moveCursor();
    const important = importantAt(next);
    if (important.length) { p.playing = false; playBtn.textContent = '▶ 재생'; showNotice(next, important); return; }
    p.timer = setTimeout(tick, 1000 / p.speed);
  }
  function play() { if (p.index >= dates.length - 1) p.index = anchorIndex; p.playing = true; playBtn.textContent = '❚❚ 정지'; clearTimeout(p.timer); p.timer = setTimeout(tick, 1000 / p.speed); }
  function stop() { p.playing = false; clearTimeout(p.timer); p.timer = null; playBtn.textContent = '▶ 재생'; }
  playBtn.addEventListener('click', () => p.playing ? stop() : play());
  function showNotice(i, events) {
    const box = document.getElementById('notice'); box.hidden = false;
    const btn = h('button', {class: 'primary', type: 'button', onclick: () => { events.forEach(e => p.acked.add(e.id)); box.hidden = true; box.replaceChildren(); playBtn.focus(); play(); }}, '확인 · 계속');
    box.replaceChildren(h('div', {class: 'notice-card'}, h('h2', null, `${korDate(dates[i])} 중요 일정 ${events.length}건`), h('ul', null, ...events.map(e => h('li', null, h('b', null, e.name), h('span', {class: 'muted'}, ` · ${e.kind} · 수치 미반영`)))), h('p', {class: 'muted'}, '확인 전까지 재생을 멈춥니다. 연속된 중요 일정은 각각 확인합니다. (Esc 로도 계속)'), btn));
    btn.focus();
  }
  const oneLine = x => x.kind === 'forecast'
    ? `${korDate(x.date)} 중앙 전망 ${won(x.p50)} · 출발가 대비 ${pct(x.cumulativeReturn)} · 이 날 ${dirWord(x.direction.daily.selected)} ${pctPoint(x.direction.daily.probabilities[x.direction.daily.selected], 0)}${x.direction.daily.closeCall ? '(확률 비슷함)' : ''} · 80% 범위 ${wonShort(x.p10)}~${wonShort(x.p90)}원`
    : x.kind === 'anchor' ? `${korDate(x.date)} 확정 종가 ${won(x.close)} — 오늘 전망이 여기서 출발합니다(첫 점 차이 0)` : `${korDate(x.date)} 실제 종가 ${won(x.close)} (${pct(x.dailyChange)})`;
  function renderExplain() {
    const date = dates[p.index], x = d.explain[date];
    if (!x) { explainBox.replaceChildren(h('p', {class: 'muted'}, '이 날짜의 설명이 없습니다.')); return; }
    setSummary(baseSummary + ' ' + oneLine(x));
    const parts = [h('div', {class: 'sheet-handle', 'aria-hidden': 'true'}), h('div', {class: 'explain-head'}, h('div', {class: 'explain-title'}, h('h2', null, `${korDate(date)}(${weekday(date)}) · ${x.kind === 'forecast' ? 'D+' + x.horizon + ' 전망' : x.kind === 'anchor' ? '출발점(실제)' : '실제'}`), h('button', {class: 'ctl mobile-only close', type: 'button', 'aria-label': '이유 닫기', onclick: () => closeSheet()}, '닫기')), h('p', {class: 'oneline', 'data-speak': oneLine(x)}, oneLine(x)))];
    if (x.kind === 'forecast') {
      parts.push(h('div', {class: 'kv'}, kv('중앙 전망', won(x.p50)), kv('전날 전망점 대비', pct(x.dailyP50Change), x.dailyP50Change > 0 ? 'up' : x.dailyP50Change < 0 ? 'down' : ''), kv('출발가 대비', pct(x.cumulativeReturn), x.cumulativeReturn > 0 ? 'up' : x.cumulativeReturn < 0 ? 'down' : ''), kv('80% 범위', `${won(x.p10)} ~ ${won(x.p90)}`), kv('하루 등락 80%', `${pct(x.dailyRange.p10, 1)} ~ ${pct(x.dailyRange.p90, 1)}`), p.showScenario ? kv('대표 시나리오', won(x.scenarioPrice)) : null));
      const qb = h('div', {class: 'qbox-wrap'}); const row = d.rows[x.horizon]; if (row) { queueMicrotask(() => quantileBox(qb, {row, anchor: d.anchor.close})); }
      parts.push(h('h3', null, '이 날 가격 분포'), qb, h('p', {class: 'muted xs'}, '수염 5~95% · 띠 10~90% · 상자 25~75% · 굵은 선 중앙 · 검은 눈금 출발가'));
      parts.push(h('div', {class: 'dir-row'}, h('span', {class: 'lbl'}, '이 날 방향'), dirChip(x.direction.daily), h('span', {class: 'lbl'}, '출발가 대비 누적'), dirChip(x.direction.cumulative)));
      parts.push(probBar(x.direction.daily.probabilities, {large: true}));
      parts.push(h('p', {class: 'muted xs'}, `모형 비율 · 몬테카를로 표준오차 ±${pctPoint(x.direction.daily.monteCarloSE)} · 실제 적중률이 아닙니다`));
      const bars = h('div', {class: 'cbars'});
      contributionBars(bars, [{label: '절편(평균 성분)', value: x.intercept}, ...x.contributions.map(c => ({label: c.name, value: c.dailyLogReturn})), {label: '합계(하루 기대)', value: x.meanLogReturn}]);
      parts.push(h('h3', null, '왜 이렇게 봤나 · 선택 모형 안의 기여(하루 로그수익률)'), bars, h('p', {class: 'muted xs'}, '기여도는 선택 모형 안의 설명이며 인과 확정이 아닙니다.'));
      parts.push(h('h3', null, `이 날 일정 (${x.events.length}건)`), x.events.length ? h('ul', {class: 'events'}, ...x.events.map(e => h('li', null, h('b', null, e.name), h('span', {class: 'badge ' + (e.important ? 'warn' : '')}, e.important ? '중요' : '참고'), h('span', {class: 'badge'}, '수치 미반영'), h('div', {class: 'muted xs'}, e.reason), h('div', {class: 'small'}, ...e.sources.filter(s => s.url).map(s => h('a', {href: s.url, target: '_blank', rel: 'noopener'}, s.name ?? '출처')))))) : h('p', {class: 'muted small'}, '확인된 일정 없음'));
      parts.push(h('h3', null, '미확보'), h('ul', {class: 'missing'}, ...x.missing.map(m => h('li', null, m))));
      parts.push(h('details', {class: 'more'}, h('summary', null, '문장으로 읽기'), h('p', null, x.text)));
    } else {
      parts.push(h('div', {class: 'kv'}, kv('실제 종가', won(x.close)), kv('전 거래일 대비', pct(x.dailyChange), x.dailyChange > 0 ? 'up' : x.dailyChange < 0 ? 'down' : '')));
      if (x.kind === 'anchor') parts.push(h('div', {class: 'kv'}, kv('1일', pct(x.inputs.return1)), kv('5일', pct(x.inputs.return5)), kv('20일', pct(x.inputs.return20)), kv('60일', pct(x.inputs.return60)), kv('20일 평균', won(x.inputs.ma20)), kv('관측 상태', x.state.label)), h('p', {class: 'muted xs'}, x.state.basis));
      parts.push(h('p', {class: 'small'}, x.text));
      const cell = d.errors && Object.values(d.errors).find(c => c.targetDate === date && c.ape != null); if (cell) parts.push(h('p', {class: 'small'}, `이 날 채점: 오차 ${cell.ape.toFixed(2)}% · 방향 ${cell.directionCorrect ? '정답' : '오답'} · 띠 ${cell.covered ? '담김' : '벗어남'}`));
      // 당시 예측·실제·오차·원인·모델 버전 (기록 장부의 채점 셀 · 이 날을 목표일로 삼은 과거 발행본 전부)
      const hist = (d.scoreHistory ?? []).filter(c => c.targetDate === date);
      if (hist.length) {
        parts.push(h('h3', null, `이 날을 겨눈 과거 전망 ${hist.length}건 (발행 당시 값 · 덮어쓰지 않음)`), h('ul', {class: 'events history'}, ...hist.map(c => h('li', {class: 'hist ' + (c.directionCorrect ? 'up' : 'down')}, h('b', null, `${shortDate(c.originDate)} 발행 · D+${c.horizon}`), h('span', {class: 'badge ' + (c.class === 1 ? 'ok' : c.class === 4 ? 'warn' : '')}, c.classLabel), h('div', {class: 'small'}, `당시 예측 ${won(c.p50)}(${wonShort(c.p10)}~${wonShort(c.p90)}) · 실제 ${won(c.actual)} · 오차 ${c.ape.toFixed(2)}% · 방향 ${dirWord(c.predictedDirection)}→${dirWord(c.actualDirection)} ${c.directionCorrect ? '정답' : '오답'} · 띠 ${c.covered == null ? '—' : c.covered ? '담김' : '벗어남'}`), c.causes?.length ? h('div', {class: 'muted xs'}, '원인 가설: ' + c.causes.join(' · ')) : null, c.facts?.length ? h('details', {class: 'more'}, h('summary', null, '근거 보기'), h('ul', {class: 'plain xs'}, ...c.facts.map(f => h('li', null, f)), ...(c.hypotheses ?? []).map(hp => h('li', null, `[가설] ${hp.category}: ${hp.evidence}`)))) : null, h('div', {class: 'muted xs'}, `모델 ${c.modelVersion} · 발행본 ${c.forecastId}`)))));
      }
    }
    parts.push(h('div', {class: 'sources xs'}, '출처: ', ...(x.sources ?? []).filter(s => s.url).slice(0, 6).map(s => h('a', {href: s.url, target: '_blank', rel: 'noopener'}, s.name))), h('p', {class: 'muted xs'}, `발행본 ${d.forecastId}`));
    explainBox.replaceChildren(...parts);
  }
  const kv = (k, v, cls = '') => h('div', {class: 'kv-item ' + cls}, h('span', {class: 'k'}, k), h('b', {class: 'v'}, v));

  dateStrip.replaceChildren(...dates.map((date, i) => h('button', {class: 'date-chip' + (i > anchorIndex ? ' future' : i === anchorIndex ? ' anchor' : ''), type: 'button', role: 'option', dataset: {index: i}, 'aria-selected': 'false', title: `${korDate(date)}(${weekday(date)})`, onclick: () => { stop(); setIndex(i); openSheet(); }}, i > anchorIndex ? 'D+' + (i - anchorIndex) : shortDate(date))));
  const selector = h('select', {class: 'select stock-select', 'aria-label': '종목 선택', onchange: ev => { location.hash = '#/stock/' + ev.target.value; }}, ...cards.cards.slice().sort((a, b) => a.name.localeCompare(b.name, 'ko')).map(c => h('option', {value: c.code, selected: c.code === code}, `${c.name} ${c.code}`)));
  const idx = cards.cards.findIndex(c => c.code === code), prevCode = cards.cards[(idx + 51) % 52].code, nextCode = cards.cards[(idx + 1) % 52].code;
  const numbers = h('div', {class: 'numbers'},
    big('현재 종가', won(d.anchor.close), pct(d.inputs.return1) + ' · ' + shortDate(d.anchor.date), (d.inputs.return1 > 0 ? 'up' : d.inputs.return1 < 0 ? 'down' : '') + ' first'),
    (() => { const b = big('내일 전망', won(r1.p50), dirChip(r1.direction.daily, {small: true}), DIR[r1.direction.daily.selected].cls); b.append(probBar(r1.direction.daily.probabilities, {legend: false})); return b; })(),
    big('5일 전망', won(r5.p50), dirMark(r5.direction.cumulative.selected) + ' ' + pct(r5.return) + ' · ' + shortDate(r5.date), DIR[r5.direction.cumulative.selected].cls),
    big('20일 전망', won(r20.p50), dirMark(r20.direction.cumulative.selected) + ' ' + pct(r20.return) + ' · 범위 ' + wonShort(r20.p10) + '~' + wonShort(r20.p90), DIR[r20.direction.cumulative.selected].cls),
    big('최근 오차', recent ?? '채점 대기', recent ? '1·5·10·20일 중 확보된 것' : `첫 채점 ${shortDate(manifest.firstScorableDate)}`, ''));
  for (const b of numbers.children) b.setAttribute('data-speak', b.textContent.replace(/\s+/g, ' '));
  const infoBox = h('section', {class: 'card info', 'aria-label': '종목 정보'}), ctxBox = h('section', {class: 'card ctx', 'aria-label': '수급·뉴스·공시'}), chainBox = h('section', {class: 'card chain', 'aria-label': '연쇄 지도'});
  const more = h('div', {class: 'detail-more'}, infoBox, ctxBox, chainBox);
  main.replaceChildren(
    h('section', {class: 'detail'},
      h('div', {class: 'detail-top'},
        h('a', {class: 'back', href: '#/forecast'}, '‹ 52종목'),
        h('div', {class: 'stock-nav'}, h('a', {class: 'ctl icon', href: '#/stock/' + prevCode, 'aria-label': '이전 종목'}, '‹'), selector, h('a', {class: 'ctl icon', href: '#/stock/' + nextCode, 'aria-label': '다음 종목'}, '›')),
        h('div', {class: 'chips'}, h('span', {class: 'chip ' + (d.state.label === 'Bull' ? 'up' : d.state.label === 'Bear' ? 'down' : 'flat'), title: d.state.basis}, d.state.label), h('span', {class: 'chip'}, `${d.dataStatus === 'current_close' ? '확정 종가' : '보관 종가'} ${shortDate(d.actualAsOf)}`), h('span', {class: 'chip muted'}, d.sector), d.modelVersion ? h('span', {class: 'chip muted', title: '운영 모델 버전'}, '모델 ' + d.modelVersion) : null)),
      h('h1', {class: 'h1 stock-title', 'data-speak': d.name}, d.name, h('span', {class: 'code muted'}, ' ' + d.code)),
      numbers,
      h('div', {class: 'detail-body'},
        h('div', {class: 'chart-col'},
          h('div', {class: 'legend'}, leg('actual', '실제 60거래일'), leg('today', '오늘 전망(중앙)'), leg('band outer', '90% 범위(5~95)'), leg('band', '80% 범위'), leg('band inner', '50% 범위'), d.previous ? leg('previous', '어제 전망') : null, p.showScenario ? leg('scenario', '대표 시나리오') : null),
          chartBox,
          h('div', {class: 'player'}, playBtn, h('button', {class: 'ctl', type: 'button', 'aria-label': '하루 전', onclick: () => { stop(); setIndex(p.index - 1); }}, '‹'), h('button', {class: 'ctl', type: 'button', 'aria-label': '하루 뒤', onclick: () => { stop(); setIndex(p.index + 1); }}, '›'), cursorLabel, speedSel, reasonBtn),
          slider, dateStrip,
          h('div', {class: 'toggles'}, scenarioBtn, prevBtn, csvBtn, jsonBtn),
          h('p', {class: 'muted xs'}, `전망선은 0번째 실제점과 미래 20개 거래일 점을 직선으로 이은 것입니다. 세 겹 띠는 모의 분포의 25~75%·10~90%·5~95% 분위수 그대로입니다. 대표 시나리오는 2만 경로 중 중심에 가까운 모의 경로 하나이며 경로 전체가 일어날 확률은 표시하지 않습니다. 발행 ${stamp(d.issuedAt)} · 발행본 ${d.forecastId}`)),
        backdrop, explainBox),
      more));
  chartBox.style.position = 'relative';
  draw();
  // 종목 정보 + 연쇄 지도: 그래프가 자리 잡은 뒤(너비 확정) 그린다 · 지도는 너비가 바뀌면 다시 그린다
  renderInfo(infoBox, d);
  renderContextBox(ctxBox, d.context ?? null);
  if (network) {
    const chain = renderChain(chainBox, {network, code, onNavigate: c => { location.hash = '#/stock/' + c; }});
    let lastMapW = chainBox.clientWidth; new ResizeObserver(() => { if (chainBox.clientWidth !== lastMapW) { lastMapW = chainBox.clientWidth; chain.stop(); chain.draw(); } }).observe(chainBox);
  } else chainBox.replaceChildren(h('h3', null, '연쇄 지도'), h('p', {class: 'muted'}, '관계망 파일(network.json)을 읽지 못해 이 칸을 비웁니다.'));
  main.addEventListener('keydown', ev => { if (ev.target.tagName === 'INPUT' || ev.target.tagName === 'SELECT') return; if (ev.key === 'ArrowLeft') { stop(); setIndex(p.index - 1); } else if (ev.key === 'ArrowRight') { stop(); setIndex(p.index + 1); } else if (ev.key === ' ') { ev.preventDefault(); p.playing ? stop() : play(); } });
  if (p.playing) play();
  let lastW = chartBox.clientWidth; new ResizeObserver(() => { if (chartBox.clientWidth !== lastW) { lastW = chartBox.clientWidth; drawChart(); chart.update(p.index); } }).observe(chartBox);
}
const big = (label, value, sub, cls) => h('div', {class: 'big ' + cls}, h('span', {class: 'big-label'}, label), h('b', {class: 'big-value'}, value), h('span', {class: 'big-sub'}, sub));
const leg = (kind, text) => h('span', {class: 'leg'}, h('span', {class: 'swatch ' + kind}), text);

export async function renderForecast(main, {hash, manifest}) {
  const m = hash.match(/^#\/stock\/(\d{6})/);
  if (m) return renderDetail(main, manifest, m[1]);
  return renderCards(main, manifest);
}
