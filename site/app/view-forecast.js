/* ATLAS 11 · 전망 — 52종목 카드(첫 화면: 작은 그래프·확률 막대) + 종목 상세(그래프가 주인공 · 두 겹 부채꼴 · 커서 말풍선 · 이유는 「한 줄」부터) */
import {h, won, pct, pctPoint, pctRaw, prob, num, korDate, shortDate, weekday, stamp, dirWord, dirMark, DIR, finite, download, reducedMotion, clamp, wonShort, signCls} from './util.js';
import {headline, editionSource, lineChart, hbar, pickBox} from './frame.js';
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

/* ---------- 전망(첫 화면) v9: 헤드라인 한 줄 → 증거 그래프(마지막 값 = 헤드라인 숫자) → 52종목 가로 막대 목록 ---------- */
async function renderCards(main, manifest) {
  const data = await loadCards();
  const d1 = data.day1, target = d1.date, end = manifest.futureDates.at(-1), base = manifest.actualAsOf;
  const sortKey = prefs.get('sort9', 'day1'), filterKey = prefs.get('filter', 'all');
  const q = prefs.get('query', '');
  const edge = c => c.day1.probabilities.up - c.day1.probabilities.down;
  const sorters = {day1: (a, b) => edge(b) - edge(a) || a.code.localeCompare(b.code), day20: (a, b) => b.day20.return - a.day20.return || a.code.localeCompare(b.code), name: (a, b) => a.name.localeCompare(b.name, 'ko'), change: (a, b) => b.change1 - a.change1 || a.code.localeCompare(b.code), band: (a, b) => (b.day20.p90 - b.day20.p10) / b.close - (a.day20.p90 - a.day20.p10) / a.close};
  const filters = {all: () => true, up: c => c.day1.selected === 'up', down: c => c.day1.selected === 'down', close: c => c.day1.closeCall || c.day1.statisticalTie};
  const list = () => [...data.cards].sort(sorters[sortKey] ?? sorters.day1).filter(filters[filterKey] ?? filters.all).filter(c => !q || c.name.includes(q) || c.code.includes(q));
  const n = data.cards.length; // 종목 수도 발행본 카드에서 센다
  setSummary(`${korDate(base)} 종가 기준. ${korDate(target)} ${n}종목 중 상승 선택 ${d1.up}종목, 하락 선택 ${d1.down}종목. ${n}종목 평균 ${pct(d1.meanReturn)} 전망.`);
  // ① 헤드라인 한 줄
  const hl = headline({speak: `${korDate(base)} 종가 기준, ${korDate(target)} ${n}종목 중 상승 선택 ${d1.up}종목, 평균 ${pct(d1.meanReturn)} 전망`,
    parts: [`${korDate(base)} 종가 기준 · ${korDate(target)} ${n}종목 중 상승 선택 `, {figure: `${d1.up}종목`}, ` · 평균 ${pct(d1.meanReturn)} 전망`],
    source: [['이 숫자', `${n}종목 가운데 ${korDate(target)} 방향이 「상승」으로 선택된 종목 수 (하락 선택 ${d1.down}종목 · 보합 선택 ${d1.flat}종목) — 세 방향 중 모의 경로 비율이 가장 큰 쪽을 고름`], ['평균 전망', `${pct(d1.meanReturn)} — ${d1.meanReturnBasis}`], ...editionSource(manifest, 'cards.json')]});
  // ② 증거 그래프: 날짜별 상승 선택 종목 수(마지막 점 = 헤드라인 숫자) · 실제로 오른 종목 수
  const hist = data.directionHistory, top = Math.max(20, Math.ceil((Math.max(...hist.flatMap(d => [d.predictedUp, d.actualUp ?? 0])) + 2) / 10) * 10);
  const evBox = h('div', {class: 'ev-chart'});
  const evidence = h('section', {class: 'panel', 'aria-label': '헤드라인 숫자의 증거 그래프'},
    h('h2', {class: 'panel-title'}, `날짜별 상승 종목 수 · ATLAS 선택과 실제`),
    evBox,
    h('p', {class: 'legend-line'}, h('span', {class: 'leg-i'}, h('span', {class: 'key pred'}), 'ATLAS 상승 선택(그 날을 겨눈 첫 발행본)'), h('span', {class: 'leg-i'}, h('span', {class: 'key act'}), `실제로 +0.10% 넘게 오른 종목(${korDate(hist.filter(d => d.actualUp != null).at(-1)?.date)}까지 채점)`)));
  // ③ 52종목 가로 막대 목록
  const max20 = Math.max(...data.cards.map(c => Math.abs(c.day20.return)));
  const grid = h('div', {class: 'wl', role: 'list', 'aria-label': '52종목 목록'});
  const counter = h('span', {class: 'muted small'});
  const render = () => { const rows = list(); grid.replaceChildren(...rows.map(c => wlRow(c, max20, target))); counter.textContent = `${rows.length}종목 표시`; };
  const filterBtn = (key, label) => h('button', {class: 'filter' + (filterKey === key ? ' on' : ''), type: 'button', 'aria-pressed': String(filterKey === key), onclick: () => { prefs.set('filter', key); renderCards(main, manifest); }}, label);
  main.replaceChildren(
    hl, evidence,
    h('section', {class: 'panel', 'aria-label': '52종목 전망'},
      h('h2', {class: 'panel-title'}, `52종목 · ${korDate(target)} 방향과 ${korDate(end)} 중앙 전망`),
      h('div', {class: 'controls-row'},
        filterBtn('all', '전체'), filterBtn('up', '상승 선택'), filterBtn('down', '하락 선택'), filterBtn('close', '비슷함'),
        h('label', {class: 'field pick-field'}, h('span', {class: 'sr'}, '정렬'), pickBox(h('select', {class: 'select', 'aria-label': '정렬', onchange: ev => { prefs.set('sort9', ev.target.value); renderCards(main, manifest); }}, ...[['day1', `${korDate(target)} 상승 확률 높은 순`], ['day20', `${korDate(end)} 전망 높은 순`], ['change', `${korDate(base)} 등락 높은 순`], ['band', '범위 넓은 순'], ['name', '이름 순']].map(([v, l]) => h('option', {value: v, selected: v === sortKey}, l))))),
        h('label', {class: 'field grow'}, h('span', {class: 'sr'}, '종목 찾기'), h('input', {class: 'input', type: 'search', placeholder: '종목 이름·코드', value: q, oninput: ev => { prefs.set('query', ev.target.value.trim()); render(); }})),
        counter),
      h('div', {class: 'wl-head', 'aria-hidden': 'true'}, h('span', null, '종목'), h('span', {class: 'num'}, `${korDate(base)} 종가`), h('span', {class: 'num'}, '등락'), h('span', null, `${korDate(target)} 선택·확률`), h('span', null, `${korDate(end)} 중앙 전망`), h('span', {class: 'wl-spark-h'}, '실제 20일 → 전망 20일')),
      grid,
      h('p', {class: 'foot small'}, `확률은 모의 경로 2만 개에서 센 모형 비율이며 실제 적중률이 아닙니다. 「비슷함」은 가장 큰 두 확률의 차이가 5%p 미만인 종목(${d1.closeCall}종목)입니다. 실제 적중은 「성적」 화면에 있습니다.`),
      h('details', {class: 'more'}, h('summary', null, '읽는 법'), h('ul', {class: 'plain small'}, h('li', null, '작은 그래프: 검은 선 = 실제 종가 20거래일 · 색 선 = 중앙 전망 20거래일(빨강 오름 · 파랑 내림) · 회색 띠 = 80% 모형 범위'), h('li', null, '가로 막대: 가운데 세로선이 0% · 오른쪽 빨강 = 오름 · 왼쪽 파랑 = 내림 · 막대 길이는 52종목 가운데 가장 큰 값 기준'), h('li', null, '뉴스·전체 FOMO 는 전망 숫자에 넣지 않았습니다')))));
  lineChart(evBox, {dates: hist.map(d => d.date), series: [{id: 'act', name: '실제로 오른 종목', values: hist.map(d => d.actualUp), cls: 'act'}, {id: 'pred', name: 'ATLAS 상승 선택', values: hist.map(d => d.predictedUp), cls: 'pred'}], unit: '종목', format: v => String(Math.round(v)), yMin: 0, yMax: top, ticks: [0, top / 2, top], height: 200, band: {from: hist.length - 1, to: hist.length - 1, label: '전망'}, ariaLabel: `날짜별 상승 종목 수: ` + hist.map(d => `${korDate(d.date)} ATLAS ${d.predictedUp}종목${d.actualUp != null ? ` · 실제 ${d.actualUp}종목` : ''}`).join(', ')});
  render();
  // 효율: 화면이 한가할 때 앞쪽 종목 6개 상세를 미리 받아 두면 줄을 눌렀을 때 바로 열린다
  const idle = window.requestIdleCallback ?? (fn => setTimeout(fn, 400));
  idle(() => { for (const c of list().slice(0, 6)) loadStock(c.code).catch(() => {}); });
}
/** 한 줄: 종목 · 종가 · 등락 · 첫 거래일 방향(확률 막대) · 20거래일 중앙 전망(가운데 0 막대) · 작은 그래프 */
function wlRow(c, max20, target) {
  const d = c.day1, sel = d.selected, close = d.closeCall || d.statisticalTie;
  return h('a', {class: 'wl-row', href: '#/stock/' + c.code, role: 'listitem', 'aria-label': `${c.name} · ${korDate(target)} ${dirWord(sel)} ${prob(d.probabilities[sel])} · 20거래일 ${pct(c.day20.return)}`},
    h('span', {class: 'wl-name'}, h('b', null, c.name), h('code', {class: 'wl-code'}, c.code)),
    h('span', {class: 'wl-price num'}, won(c.close)),
    h('span', {class: 'wl-chg num ' + signCls(c.change1)}, pct(c.change1)),
    h('span', {class: 'wl-dir'}, h('span', {class: 'wl-dir-t ' + (DIR[sel]?.cls ?? '')}, `${dirMark(sel)} ${dirWord(sel)} ${prob(d.probabilities[sel])}`, close ? h('span', {class: 'badge warn'}, '비슷함') : null), probBar(d.probabilities, {legend: false})),
    h('span', {class: 'wl-20'}, hbar(c.day20.return, {max: max20, label: pct(c.day20.return)})),
    h('span', {class: 'wl-spark'}, sparkline(c.spark, {dir: c.day20.selected})));
}

/* ---------- 종목 상세 v9: 헤드라인(20거래일 뒤 중앙 전망) → 가격 그래프(마지막 값 = 헤드라인 숫자) → 첫 거래일 방향·기간 막대 → 나머지는 눌러야 열림 ---------- */
const STATE_WORD = {Bull: '상승 추세', Bear: '하락 추세', Neutral: '뚜렷한 추세 없음'};
async function renderDetail(main, manifest, code) {
  const [cards, d, network] = await Promise.all([loadCards(), loadStock(code), loadNetwork().catch(() => null)]);
  const p = player(code);
  const dates = [...d.actual60.map(r => r.date), ...d.futureDates], anchorIndex = 59;
  const r1 = d.rows[1], r20 = d.rows[20], dir20 = r20.direction.cumulative.selected;
  const series = () => {
    const s = [{id: 'actual', kind: 'actual', points: d.actual60.map((r, i) => ({index: i, date: r.date, value: r.close}))},
      {id: 'today', kind: 'today ' + (DIR[dir20]?.cls ?? ''), points: d.rows.map((r, j) => ({index: anchorIndex + j, date: r.date, value: r.p50, low: r.p10, high: r.p90}))}];
    if (p.showScenario) s.push({id: 'scenario', kind: 'scenario', points: d.scenario.prices.map((v, j) => ({index: anchorIndex + j, date: d.rows[j].date, value: v}))});
    if (d.previous && p.showPrevious !== false) s.push({id: 'previous', kind: 'previous', points: d.previous.rows.map(r => ({index: dates.indexOf(r.date), date: r.date, value: r.p50})).filter(x => x.index >= 0)});
    return s;
  };
  // 세 겹 부채꼴: 5~95% · 10~90% · 25~75% (분포의 분위수 그대로 · 대칭으로 바꾸지 않음)
  const bands = [{rows: d.rows.map((r, j) => ({index: anchorIndex + j, low: r.p05, high: r.p95})), cls: 'outer'}, {rows: d.rows.map((r, j) => ({index: anchorIndex + j, low: r.p10, high: r.p90})), cls: 'mid'}, {rows: d.rows.map((r, j) => ({index: anchorIndex + j, low: r.p25, high: r.p75})), cls: 'inner'}];
  const err1 = d.errors?.['1'] ?? d.errors?.[1];
  setSummary(`${d.name}. ${korDate(d.anchor.date)} 종가 ${won(d.anchor.close)} 기준. 20거래일 뒤 ${korDate(r20.date)} 중앙 전망 ${won(r20.p50)}, ${pct(r20.return)}. 80% 범위 ${won(r20.p10)}에서 ${won(r20.p90)}. ${korDate(r1.date)} 방향 ${dirWord(r1.direction.daily.selected)} ${prob(r1.direction.daily.probabilities[r1.direction.daily.selected])}.`);
  const baseSummary = () => state.summary;
  // ① 헤드라인
  const hl = headline({speak: `${d.name}, ${korDate(d.anchor.date)} 종가 ${won(d.anchor.close)} 기준, 20거래일 뒤 ${korDate(r20.date)} 중앙 전망 ${won(r20.p50)}, ${pct(r20.return)}`,
    parts: [`${d.name} · ${korDate(d.anchor.date)} 종가 ${won(d.anchor.close)} 기준 · 20거래일 뒤 ${korDate(r20.date)} 중앙 전망 `, {figure: won(r20.p50)}, `(${pct(r20.return)})`],
    source: [['이 숫자', `모의 경로 ${num(manifest.summary?.paths ?? 20000)}개 가운데 20거래일 뒤(${korDate(r20.date)}) 가격의 한가운데 값(50%) · 80% 범위 ${won(r20.p10)}~${won(r20.p90)}`], ['출발 종가', `${won(d.anchor.close)} · ${korDate(d.anchor.date)} 15:30 KST 정규장 종가`], ['운영 모델', h('code', null, d.modelVersion ?? d.model?.version ?? '—')], ...editionSource(manifest, 'stocks/' + d.code + '.json')]});
  // ② 가격 그래프(증거) + 재생
  const chartBox = h('div', {class: 'chart-box'}), explainBox = h('aside', {class: 'explain', 'aria-live': 'polite'}), dateStrip = h('div', {class: 'date-strip', role: 'listbox', 'aria-label': '날짜 선택', 'data-scroll': 'x'});
  const isMobile = () => window.matchMedia('(max-width: 899px)').matches;
  const backdrop = h('div', {class: 'sheet-backdrop', hidden: true, onclick: () => closeSheet()});
  let lastFocus = null;
  function openSheet() { if (!isMobile()) return; lastFocus = document.activeElement; explainBox.classList.add('open'); backdrop.hidden = false; explainBox.querySelector('.close')?.focus(); }
  function closeSheet() { explainBox.classList.remove('open'); backdrop.hidden = true; lastFocus?.focus?.(); }
  const reasonBtn = h('button', {class: 'ctl mobile-only', type: 'button', onclick: () => openSheet()}, '이 날 설명 보기');
  const cursorLabel = h('span', {class: 'cursor-text'});
  const playBtn = h('button', {class: 'ctl primary', type: 'button', 'aria-label': '재생 또는 정지'}, '▶ 재생');
  const speedSel = h('select', {class: 'select small', 'aria-label': '재생 속도', onchange: ev => { p.speed = Number(ev.target.value); prefs.set('speed', p.speed); }}, ...[[0.5, '느리게 · 하루 2초'], [1, '보통 · 하루 1초'], [2, '빠르게 · 하루 0.5초']].map(([v, l]) => h('option', {value: v, selected: v === p.speed}, l)));
  const slider = h('input', {class: 'slider', type: 'range', min: 0, max: dates.length - 1, step: 1, value: p.index, 'aria-label': '날짜 커서', oninput: ev => { setIndex(Number(ev.target.value)); }});
  const scenarioBtn = h('button', {class: 'ctl toggle' + (p.showScenario ? ' on' : ''), type: 'button', 'aria-pressed': String(Boolean(p.showScenario)), onclick: ev => { p.showScenario = !p.showScenario; ev.currentTarget.classList.toggle('on', p.showScenario); ev.currentTarget.setAttribute('aria-pressed', String(p.showScenario)); draw(); }}, '대표 시나리오 보기');
  const prevLabel = d.previous ? `직전 발행 전망(${korDate(d.previous.actualAsOf ?? d.previous.rows?.[0]?.date)}) 보기` : null;
  const prevBtn = d.previous ? h('button', {class: 'ctl toggle' + (p.showPrevious !== false ? ' on' : ''), type: 'button', 'aria-pressed': String(p.showPrevious !== false), onclick: ev => { p.showPrevious = p.showPrevious === false; ev.currentTarget.classList.toggle('on', p.showPrevious !== false); draw(); }}, prevLabel) : h('span', {class: 'muted small'}, '직전 거래일 발행본 없음');
  const csvBtn = h('a', {class: 'ctl', href: url(d.csvUrl), download: d.csvUrl.split('/').pop()}, 'CSV 내려받기');
  const jsonBtn = h('button', {class: 'ctl', type: 'button', onclick: () => download(`ATLAS_${d.code}_${d.actualAsOf.replaceAll('-', '')}_detail.json`, JSON.stringify(d, null, 1), 'application/json;charset=utf-8')}, '상세 JSON');
  const after = i => i > anchorIndex ? `${i - anchorIndex}거래일 뒤 전망` : i === anchorIndex ? '출발(실제 종가)' : '실제 종가';
  function tipFor(i) {
    if (i == null) return null;
    const date = dates[i], x = d.explain[date]; if (!x) return null;
    if (x.kind === 'forecast') return `<b>${korDate(date)} · ${x.horizon}거래일 뒤</b><br>중앙 ${won(x.p50)} (${pct(x.cumulativeReturn)})<br>80% 범위 ${wonShort(x.p10)}~${wonShort(x.p90)}<br>${dirMark(x.direction.daily.selected)} ${dirWord(x.direction.daily.selected)} ${prob(x.direction.daily.probabilities[x.direction.daily.selected])}`;
    return `<b>${korDate(date)}${x.kind === 'anchor' ? ' 출발' : ' 실제'}</b><br>종가 ${won(x.close)}${x.dailyChange != null ? ' (' + pct(x.dailyChange) + ')' : ''}`;
  }
  let chart = null, firstDraw = !p.drawnOnce;
  function drawChart() {
    chart = priceChart(chartBox, {dates, series: series(), bands, anchorIndex, cursorIndex: p.index, reveal: firstDraw, yFormat: v => wonShort(v), endFormat: v => won(v), ariaLabel: `${d.name} 실제 종가 60거래일과 전망 20거래일 그래프 · 마지막 점 ${korDate(r20.date)} 중앙 전망 ${won(r20.p50)}`, onPick: i => { stop(); setIndex(i); openSheet(); }, onHover: (i, ev) => { if (i == null) { chartTip(chartBox, chart.svg, {index: null}); return; } const g = chart.geometry; chartTip(chartBox, chart.svg, {index: i, x: g.x(i), y: g.top, html: tipFor(i)}); }});
    firstDraw = false; p.drawnOnce = true;
  }
  /* 커서만 옮긴다 — 재생 중에 그래프 전체를 다시 그리지 않는다 */
  function moveCursor() {
    chart?.update(p.index);
    const date = dates[p.index]; cursorLabel.textContent = `${korDate(date)} · ${after(p.index)}`;
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
    box.replaceChildren(h('div', {class: 'notice-card'}, h('h2', null, `${korDate(dates[i])} 중요 일정 ${events.length}건`), h('ul', null, ...events.map(e => h('li', null, h('b', null, e.name), h('span', {class: 'muted'}, ` · ${e.kind} · 전망 숫자에 넣지 않음`)))), h('p', {class: 'muted'}, '확인 전까지 재생을 멈춥니다. 이어지는 중요 일정은 하나씩 확인합니다. (Esc 로도 계속)'), btn));
    btn.focus();
  }
  const oneLine = x => x.kind === 'forecast' ? `${korDate(x.date)} 중앙 전망 ${won(x.p50)} (출발 종가 대비 ${pct(x.cumulativeReturn)})`
    : x.kind === 'anchor' ? `${korDate(x.date)} 종가 ${won(x.close)} — 이 발행본의 전망이 여기서 출발합니다` : `${korDate(x.date)} 실제 종가 ${won(x.close)} (${pct(x.dailyChange)})`;
  function renderExplain() {
    const date = dates[p.index], x = d.explain[date];
    if (!x) { explainBox.replaceChildren(h('p', {class: 'muted'}, '이 날짜의 설명이 없습니다.')); return; }
    const parts = [h('div', {class: 'sheet-handle', 'aria-hidden': 'true'}), h('div', {class: 'explain-head'}, h('div', {class: 'explain-title'}, h('h2', null, `${korDate(date)} · ${after(p.index)}`), h('button', {class: 'ctl mobile-only close', type: 'button', 'aria-label': '설명 닫기', onclick: () => closeSheet()}, '닫기')), h('p', {class: 'oneline'}, oneLine(x)))];
    if (x.kind === 'forecast') {
      const qb = h('div', {class: 'qbox-wrap'}); const row = d.rows[x.horizon]; if (row) { queueMicrotask(() => quantileBox(qb, {row, anchor: d.anchor.close})); }
      parts.push(h('h3', null, '이 날 가격 분포'), qb, h('p', {class: 'muted xs'}, '가는 선 5%~95% · 옅은 띠 10%~90% · 진한 상자 25%~75% · 굵은 선 중앙 · 점선 출발 종가'));
      parts.push(h('h3', null, '이 날 하루 방향'), h('div', {class: 'dir-row'}, dirChip(x.direction.daily)), probBar(x.direction.daily.probabilities, {large: true}));
      parts.push(h('p', {class: 'muted xs'}, `모의 경로에서 센 비율 · 오차 폭(몬테카를로 표준오차) ±${pctPoint(x.direction.daily.monteCarloSE)} · 실제 적중률이 아닙니다`));
      const bars = h('div', {class: 'cbars'});
      contributionBars(bars, [{label: '평균 성분', value: x.intercept}, ...x.contributions.map(c => ({label: c.name, value: c.dailyLogReturn})), {label: '합계(하루 기대)', value: x.meanLogReturn}]);
      parts.push(h('h3', null, '왜 이렇게 봤나 · 모형 안의 몫(하루 로그수익률)'), bars, h('p', {class: 'muted xs'}, '모형 안의 설명이며 원인이 확정된 것이 아닙니다.'));
      parts.push(h('h3', null, `이 날 일정 ${x.events.length}건`), x.events.length ? h('ul', {class: 'events'}, ...x.events.map(e => h('li', null, h('b', null, e.name), h('span', {class: 'badge ' + (e.important ? 'warn' : '')}, e.important ? '중요' : '참고'), h('span', {class: 'badge'}, '전망 숫자에 안 넣음'), h('div', {class: 'muted xs'}, e.reason), h('div', {class: 'small'}, ...e.sources.filter(s => s.url).map(s => h('a', {href: s.url, target: '_blank', rel: 'noopener'}, s.name ?? '출처')))))) : h('p', {class: 'muted small'}, '확인된 일정 없음'));
      parts.push(h('details', {class: 'more'}, h('summary', null, '숫자로 모두 보기'), h('div', {class: 'kv'}, kv('중앙 전망', won(x.p50)), kv('전날 전망점 대비', pct(x.dailyP50Change), signCls(x.dailyP50Change)), kv('출발 종가 대비', pct(x.cumulativeReturn), signCls(x.cumulativeReturn)), kv('80% 범위', `${won(x.p10)} ~ ${won(x.p90)}`), kv('하루 등락 80% 범위', `${pct(x.dailyRange.p10)} ~ ${pct(x.dailyRange.p90)}`), p.showScenario ? kv('대표 시나리오', won(x.scenarioPrice)) : null, kv('출발 종가 대비 누적 방향', `${dirWord(x.direction.cumulative.selected)} ${prob(x.direction.cumulative.probabilities[x.direction.cumulative.selected])}`)), h('h4', null, '미확보'), h('ul', {class: 'missing'}, ...x.missing.map(m => h('li', null, m))), h('p', {class: 'small'}, x.text)));
    } else {
      parts.push(h('div', {class: 'kv'}, kv('실제 종가', won(x.close)), kv('전 거래일 대비', pct(x.dailyChange), signCls(x.dailyChange))));
      if (x.kind === 'anchor') { const rb = h('div', {class: 'bars signed'}); const rets = [['1거래일', x.inputs.return1], ['5거래일', x.inputs.return5], ['20거래일', x.inputs.return20], ['60거래일', x.inputs.return60]]; const mx = Math.max(...rets.map(([, v]) => Math.abs(v ?? 0))); rb.replaceChildren(...rets.map(([k, v]) => h('div', {class: 'bar-row'}, h('span', {class: 'bar-label'}, `최근 ${k}`), hbar(v, {max: mx, label: pct(v)})))); parts.push(h('h3', null, '출발 전 흐름'), rb, h('p', {class: 'small'}, `20거래일 평균 ${won(x.inputs.ma20)} · 관측 상태 ${STATE_WORD[x.state.label] ?? x.state.label}`), h('p', {class: 'muted xs'}, x.state.basis)); }
      const cell = d.errors && Object.values(d.errors).find(c => c.targetDate === date && c.ape != null); if (cell) parts.push(h('p', {class: 'small'}, `이 날 채점: 오차 ${pctRaw(cell.ape)} · 방향 ${cell.directionCorrect ? '맞힘' : '틀림'} · 80% 범위 ${cell.covered ? '안' : '밖'}`));
      const hist = (d.scoreHistory ?? []).filter(c => c.targetDate === date);
      if (hist.length) parts.push(h('details', {class: 'more'}, h('summary', null, `이 날을 겨눈 과거 전망 ${hist.length}건 열기 · 발행 당시 값 그대로`), h('ul', {class: 'events history'}, ...hist.map(c => h('li', {class: 'hist ' + (c.directionCorrect ? 'up' : 'down')}, h('b', null, `${korDate(c.originDate)} 발행 · ${c.horizon}거래일 뒤`), h('span', {class: 'badge ' + (c.class === 4 ? 'warn' : '')}, c.classLabel), h('div', {class: 'small'}, `당시 예측 ${won(c.p50)}(${wonShort(c.p10)}~${wonShort(c.p90)}), 실제 ${won(c.actual)}, 오차 ${pctRaw(c.ape)}, 방향 ${dirWord(c.predictedDirection)}→${dirWord(c.actualDirection)} ${c.directionCorrect ? '맞힘' : '틀림'}`), c.causes?.length ? h('div', {class: 'muted xs'}, '원인 가설: ' + c.causes.join(' · ')) : null, c.facts?.length ? h('details', {class: 'more'}, h('summary', null, '근거 보기'), h('ul', {class: 'plain xs'}, ...c.facts.map(f => h('li', null, f)), ...(c.hypotheses ?? []).map(hp => h('li', null, `[가설] ${hp.category}: ${hp.evidence}`)))) : null, h('div', {class: 'muted xs'}, '모델 ', h('code', null, c.modelVersion), ' · 발행본 ', h('code', null, c.forecastId)))))));
    }
    parts.push(h('div', {class: 'sources xs'}, '출처: ', ...(x.sources ?? []).filter(s => s.url).slice(0, 6).map(s => h('a', {href: s.url, target: '_blank', rel: 'noopener'}, s.name))));
    explainBox.replaceChildren(...parts);
  }
  const kv = (k, v, cls = '') => h('div', {class: 'kv-item ' + cls}, h('span', {class: 'k'}, k), h('b', {class: 'v'}, v));
  dateStrip.replaceChildren(...dates.map((date, i) => h('button', {class: 'date-chip' + (i > anchorIndex ? ' future' : i === anchorIndex ? ' anchor' : ''), type: 'button', role: 'option', dataset: {index: i}, 'aria-selected': 'false', title: `${korDate(date)} · ${after(i)}`, onclick: () => { stop(); setIndex(i); openSheet(); }}, shortDate(date))));
  const selector = h('select', {class: 'select stock-select', 'aria-label': '종목 선택', onchange: ev => { location.hash = '#/stock/' + ev.target.value; }}, ...cards.cards.slice().sort((a, b) => a.name.localeCompare(b.name, 'ko')).map(c => h('option', {value: c.code, selected: c.code === code}, `${c.name} ${c.code}`)));
  const idx = cards.cards.findIndex(c => c.code === code), prevCode = cards.cards[(idx + 51) % 52].code, nextCode = cards.cards[(idx + 1) % 52].code;
  // ③ 첫 거래일 방향(확률 막대) · 지난 채점 한 줄
  const d1 = r1.direction.daily;
  const firstDay = h('section', {class: 'panel', 'aria-label': `${korDate(r1.date)} 방향`},
    h('h2', {class: 'panel-title'}, `${korDate(r1.date)} 방향 · `, h('span', {class: DIR[d1.selected]?.cls ?? ''}, `${dirMark(d1.selected)} ${dirWord(d1.selected)} ${prob(d1.probabilities[d1.selected])}`), (d1.closeCall || d1.statisticalTie) ? h('span', {class: 'badge warn'}, '비슷함') : null),
    probBar(d1.probabilities, {large: true}),
    h('p', {class: 'small muted'}, `${korDate(r1.date)} 중앙 전망 ${won(r1.p50)} (${pct(r1.return)}) · 모형 비율이며 실제 적중률이 아님`),
    err1?.ape != null ? h('p', {class: 'small'}, `지난 채점: ${korDate(err1.targetDate)} 1거래일 전망 오차 ${pctRaw(err1.ape)} · 방향 ${err1.directionCorrect ? '맞힘' : '틀림'} · 80% 범위 ${err1.covered ? '안' : '밖'}`) : h('p', {class: 'small muted'}, `첫 채점 ${korDate(manifest.firstScorableDate)} 종가 뒤`));
  const infoBox = h('section', {class: 'panel info', 'aria-label': '종목 정보'}), ctxBox = h('details', {class: 'more panel ctx'}), chainBox = h('details', {class: 'more panel chain'});
  main.replaceChildren(
    h('section', {class: 'detail'},
      h('div', {class: 'detail-top'},
        h('a', {class: 'back', href: '#/forecast'}, '‹ 52종목'),
        h('div', {class: 'stock-nav'}, h('a', {class: 'ctl icon', href: '#/stock/' + prevCode, 'aria-label': '이전 종목'}, '‹'), pickBox(selector, {cls: 'stock-pick'}), h('a', {class: 'ctl icon', href: '#/stock/' + nextCode, 'aria-label': '다음 종목'}, '›')),
        h('div', {class: 'chips'}, h('span', {class: 'chip ' + (d.state.label === 'Bull' ? 'up' : d.state.label === 'Bear' ? 'down' : 'flat'), title: d.state.basis}, STATE_WORD[d.state.label] ?? d.state.label), h('span', {class: 'chip muted'}, d.sector))),
      hl,
      h('div', {class: 'detail-body'},
        h('div', {class: 'chart-col'},
          h('div', {class: 'legend'}, leg('actual', '실제 종가 60거래일'), leg('today ' + (DIR[dir20]?.cls ?? ''), `이번 전망 중앙값(${korDate(manifest.actualAsOf)} 발행)`), leg('band outer', '90% 범위'), leg('band', '80% 범위'), leg('band inner', '50% 범위'), d.previous ? leg('previous', '직전 발행 전망') : null, p.showScenario ? leg('scenario', '대표 시나리오') : null),
          chartBox,
          h('div', {class: 'player'}, playBtn, h('button', {class: 'ctl', type: 'button', 'aria-label': '하루 전', onclick: () => { stop(); setIndex(p.index - 1); }}, '‹'), h('button', {class: 'ctl', type: 'button', 'aria-label': '하루 뒤', onclick: () => { stop(); setIndex(p.index + 1); }}, '›'), cursorLabel, speedSel, reasonBtn),
          slider, dateStrip,
          h('div', {class: 'toggles'}, scenarioBtn, prevBtn, csvBtn, jsonBtn),
          h('details', {class: 'more'}, h('summary', null, '그래프 읽는 법'), h('ul', {class: 'plain small'}, h('li', null, '전망선은 출발 종가(실제 마지막 점)에서 미래 20거래일 중앙값을 이은 선입니다 · 빨강 = 20거래일 뒤 오름 쪽 · 파랑 = 내림 쪽'), h('li', null, '세 겹 띠는 모의 분포의 25%~75% · 10%~90% · 5%~95% 구간 그대로입니다(대칭으로 바꾸지 않음)'), h('li', null, `대표 시나리오는 모의 경로 ${num(manifest.summary?.paths ?? 20000)}개 가운데 중심에 가까운 경로 하나이며, 그 경로 전체가 일어날 확률은 표시하지 않습니다`)))),
        backdrop, explainBox),
      firstDay, infoBox, ctxBox, chainBox));
  chartBox.style.position = 'relative';
  draw();
  renderInfo(infoBox, d);
  renderContextBox(ctxBox, d.context ?? null);
  // 연쇄 지도: 눌러서 열 때 그린다(닫힌 칸은 너비가 없어서)
  if (network) {
    let chain = null, lastMapW = 0;
    chainBox.replaceChildren(h('summary', null, `연쇄 지도 열기 · ${d.name}이(가) 움직이면 누가 따라 움직이나(과거 동조 관계 · 전망 숫자에 넣지 않음)`), h('div', {class: 'chain-body'}));
    chainBox.addEventListener('toggle', () => { if (!chainBox.open) { chain?.stop(); return; } if (!chain) { chain = renderChain(chainBox.querySelector('.chain-body'), {network, code, onNavigate: c => { location.hash = '#/stock/' + c; }}); lastMapW = chainBox.clientWidth; new ResizeObserver(() => { if (chainBox.open && chainBox.clientWidth !== lastMapW) { lastMapW = chainBox.clientWidth; chain.stop(); chain.draw(); } }).observe(chainBox); } });
  } else chainBox.replaceChildren(h('summary', null, '연쇄 지도 · 관계망 파일을 읽지 못함'), h('p', {class: 'muted'}, '관계망 파일(network.json)을 읽지 못해 이 칸을 비웁니다.'));
  main.addEventListener('keydown', ev => { if (ev.target.tagName === 'INPUT' || ev.target.tagName === 'SELECT') return; if (ev.key === 'ArrowLeft') { stop(); setIndex(p.index - 1); } else if (ev.key === 'ArrowRight') { stop(); setIndex(p.index + 1); } else if (ev.key === ' ') { ev.preventDefault(); p.playing ? stop() : play(); } });
  if (p.playing) play();
  let lastW = chartBox.clientWidth; new ResizeObserver(() => { if (chartBox.clientWidth !== lastW) { lastW = chartBox.clientWidth; drawChart(); chart.update(p.index); } }).observe(chartBox);
}
const leg = (kind, text) => h('span', {class: 'leg'}, h('span', {class: 'swatch ' + kind}), text);

export async function renderForecast(main, {hash, manifest}) {
  const m = hash.match(/^#\/stock\/(\d{6})/);
  if (m) return renderDetail(main, manifest, m[1]);
  return renderCards(main, manifest);
}
