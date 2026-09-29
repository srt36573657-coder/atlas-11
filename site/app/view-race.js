/* ATLAS 11 · 1만원 비교 — 52종목이 같은 날 1만원으로 출발 · 52선 모두 그리고 선택 종목 강조 · 날짜별 순위 · 그 순위 종목의 일정 */
import {h, num, pct, korDate, shortDate, weekday, dirMark, DIR, esc, reducedMotion, clamp, download, csvCell} from './util.js';
import {loadRace, loadStock, prefs, setSummary} from './store.js';
import {raceChart} from './chart.js';

const race = {index: null, playing: false, timer: null, speed: 1, selected: null, mode: 'level', base: 'start', group: null};
export function pauseRace() { race.playing = false; clearTimeout(race.timer); race.timer = null; }

export async function renderRace(main, {manifest}) {
  const data = await loadRace();
  const dates = data.dates, anchorIndex = data.actualDates.length - 1;
  if (race.index == null) race.index = anchorIndex;
  race.selected ??= data.levelRank[dates.at(-1)][0];
  // 출발 기준 둘: 「20거래일 전 1만원」(자료의 값 그대로) · 「오늘 1만원」(출발가로 다시 환산 → 52선이 오늘 한 점에서 갈라짐)
  const rebase = s => race.base === 'today' ? s.startClose / s.anchorClose : 1;
  const stocks = data.stocks.map(s => ({code: s.code, name: s.name, sector: s.sector, group: s.group, actual: s.actual.map((p, i) => ({index: i, value: p.value * rebase(s)})), forecast: race.base === 'today' ? s.fromToday.map((p, j) => ({index: anchorIndex + j, value: p.value})) : s.forecast.map((p, j) => ({index: anchorIndex + j, value: p.value})), fromToday: s.fromToday}));
  const top20 = data.levelRank[dates.at(-1)].slice(0, 5);
  setSummary(`1만원 비교. ${korDate(data.startDate)}에 52종목 모두 1만원으로 출발했을 때, 20거래일 뒤 중앙 전망 기준 1위 ${stocks.find(s => s.code === top20[0])?.name}, 2위 ${stocks.find(s => s.code === top20[1])?.name}, 3위 ${stocks.find(s => s.code === top20[2])?.name}. 순위는 오늘부터 향후 수익률 순위와 다를 수 있습니다.`);

  const chartBox = h('div', {class: 'chart-box'}), rankBox = h('ol', {class: 'rank-list', 'aria-label': '순위'}), newsBox = h('div', {class: 'rank-news'}), cursorLabel = h('span', {class: 'cursor-text'});
  const playBtn = h('button', {class: 'ctl primary', type: 'button'}, '▶ 재생');
  const slider = h('input', {class: 'slider', type: 'range', min: 0, max: dates.length - 1, step: 1, value: race.index, 'aria-label': '날짜 커서', oninput: ev => { stop(); setIndex(Number(ev.target.value)); }});
  const modeBtn = (mode, label) => h('button', {class: 'ctl toggle' + (race.mode === mode ? ' on' : ''), type: 'button', 'aria-pressed': String(race.mode === mode), onclick: () => { race.mode = mode; draw(); }}, label);
  const modeRow = h('div', {class: 'toggles'});
  // 묶음(산업) 단추: 고르면 그 묶음의 선만 밝게 — 같은 산업이 같이 움직이는지 한눈에
  const groupRow = h('div', {class: 'toggles groups', role: 'group', 'aria-label': '묶음 강조'});
  const hlLabel = h('span', null, '커서 날짜 상위 5');
  const detailCache = new Map();
  async function stockDetail(code) { if (!detailCache.has(code)) detailCache.set(code, loadStock(code)); return detailCache.get(code); }

  function ranksAt(i) {
    const date = dates[i];
    if (race.mode === 'future' && i > anchorIndex) return data.futureReturnRank[date].map(code => { const s = stocks.find(s => s.code === code), f = s.fromToday[i - anchorIndex - 1]; return {code, name: s.name, value: f.return, text: pct(f.return), sub: dirMark(f.selected) + (f.closeCall ? ' 비슷함' : '')}; });
    const order = race.base === 'today' ? [...stocks].map(s => ({code: s.code, v: [...s.actual, ...s.forecast].find(p => p.index === i)?.value ?? 0})).sort((a, b) => b.v - a.v || a.code.localeCompare(b.code)).map(x => x.code) : data.levelRank[date];
    return order.map(code => { const s = stocks.find(s => s.code === code), p = [...s.actual, ...s.forecast].find(p => p.index === i); return {code, name: s.name, value: p.value, text: num(p.value) + '원', sub: pct(p.value / 10000 - 1)}; });
  }
  let prevOrder = null;
  function draw() {
    const i = race.index, date = dates[i];
    const baseBtn = (b, label) => h('button', {class: 'ctl toggle' + (race.base === b ? ' on' : ''), type: 'button', 'aria-pressed': String(race.base === b), onclick: () => { race.base = b; renderRace(main, {manifest}); }}, label);
    modeRow.replaceChildren(h('span', {class: 'lbl muted xs'}, '출발'), baseBtn('start', `${shortDate(data.startDate)} 1만원`), baseBtn('today', `오늘(${shortDate(data.anchorDate)}) 1만원`), h('span', {class: 'lbl muted xs'}, '순위'), modeBtn('level', data.names.level), i > anchorIndex ? modeBtn('future', data.names.futureReturn) : h('span', {class: 'muted xs'}, '전망 구간에서 「향후 수익률 순위」'));
    const groupBtn = (id, label) => h('button', {class: 'ctl toggle' + (race.group === id ? ' on' : ''), type: 'button', 'aria-pressed': String(race.group === id), dataset: {group: id ?? 'all'}, onclick: () => { race.group = id; draw(); }}, label);
    groupRow.replaceChildren(h('span', {class: 'lbl muted xs'}, '묶음'), groupBtn(null, '전체'), ...(data.groups ?? []).map(g => groupBtn(g.id, `${g.name} ${g.count}`)));
    const highlight = race.group ? stocks.filter(s => s.group === race.group).map(s => s.code) : ranksAt(i).slice(0, 5).map(r => r.code);
    hlLabel.textContent = race.group ? `${data.groups.find(g => g.id === race.group)?.name} 묶음` : '커서 날짜 상위 5';
    raceChart(chartBox, {dates, stocks, selected: race.selected, cursorIndex: i, anchorIndex, highlight, baseLabel: race.base === 'today' ? '오늘 1만원' : shortDate(data.startDate) + ' 1만원', onPick: j => { stop(); setIndex(j); }});
    cursorLabel.textContent = `${korDate(date)}(${weekday(date)}) ${i > anchorIndex ? 'D+' + (i - anchorIndex) + ' 전망' : i === anchorIndex ? '출발(실제)' : '실제'}`;
    slider.value = i;
    const rows = ranksAt(i), order = rows.map(r => r.code);
    rankBox.replaceChildren(...rows.map((r, k) => { const moved = prevOrder ? prevOrder.indexOf(r.code) - k : 0; return h('li', {class: 'rank-row' + (r.code === race.selected ? ' selected' : '') + (k < 5 ? ' top' : ''), dataset: {code: r.code}, 'data-speak': k < 3 ? `${k + 1}위 ${r.name} ${r.text}` : null}, h('button', {class: 'rank-btn', type: 'button', onclick: () => { race.selected = r.code; draw(); }, 'aria-label': `${k + 1}위 ${r.name} 선택`}, h('span', {class: 'rank-no'}, k + 1), h('span', {class: 'rank-name'}, r.name), h('span', {class: 'rank-move ' + (moved > 0 ? 'up' : moved < 0 ? 'down' : '')}, moved ? (moved > 0 ? '▲' : '▼') + Math.abs(moved) : ''), h('b', {class: 'rank-val'}, r.text), h('span', {class: 'rank-sub muted'}, r.sub))); }));
    prevOrder = order;
    const sel = rankBox.querySelector('.selected'); if (sel && !reducedMotion()) sel.scrollIntoView({block: 'nearest'});
    renderNews(date);
  }
  async function renderNews(date) {
    const s = stocks.find(s => s.code === race.selected); if (!s) return;
    const rank = ranksAt(race.index).findIndex(r => r.code === s.code) + 1;
    newsBox.replaceChildren(h('h3', null, `${rank}위 ${s.name} · ${korDate(date)} 일정`), h('p', {class: 'muted small'}, '읽는 중…'));
    const d = await stockDetail(s.code); if (race.selected !== s.code) return;
    const x = d.explain[date], events = x?.events ?? (d.news ?? []).filter(n => n.date === date).map(n => ({name: n.name, kind: n.kind, important: n.important, reason: n.reason, sources: n.sources}));
    newsBox.replaceChildren(h('h3', null, `${rank}위 ${s.name} · ${korDate(date)}`),
      x?.kind === 'forecast' ? h('p', {class: 'small'}, `중앙 전망 ${num(x.p50)}원 · 출발가 대비 ${pct(x.cumulativeReturn)} · 방향 ${dirMark(x.direction.cumulative.selected)} ${DIR[x.direction.cumulative.selected].word}${x.direction.cumulative.closeCall ? '(확률 비슷함)' : ''}`) : x ? h('p', {class: 'small'}, `실제 종가 ${num(x.close)}원 · ${pct(x.dailyChange)}`) : null,
      events.length ? h('ul', {class: 'events'}, ...events.map(e => h('li', null, h('b', null, e.name), h('span', {class: 'badge ' + (e.important ? 'warn' : '')}, e.important ? '중요' : '참고'), h('span', {class: 'badge'}, '수치 미반영'), h('div', {class: 'small'}, ...(e.sources ?? []).filter(s => s.url).map(s => h('a', {href: s.url, target: '_blank', rel: 'noopener'}, s.name ?? '출처')))))) : h('p', {class: 'muted small'}, '이 날 확인된 일정 없음'),
      h('a', {class: 'link', href: '#/stock/' + s.code}, s.name + ' 상세 보기 ›'));
  }
  function setIndex(i) { race.index = clamp(i, 0, dates.length - 1); draw(); }
  function tick() { if (!race.playing) return; if (race.index >= dates.length - 1) { stop(); return; } race.index++; draw(); race.timer = setTimeout(tick, 1000 / race.speed); }
  function play() { if (race.index >= dates.length - 1) race.index = 0; race.playing = true; playBtn.textContent = '❚❚ 정지'; clearTimeout(race.timer); race.timer = setTimeout(tick, 1000 / race.speed); }
  function stop() { race.playing = false; clearTimeout(race.timer); race.timer = null; playBtn.textContent = '▶ 재생'; }
  playBtn.addEventListener('click', () => race.playing ? stop() : play());
  const csv = () => download(`ATLAS_10000_${data.actualAsOf.replaceAll('-', '')}.csv`, ['날짜,' + stocks.map(s => csvCell(s.name)).join(','), ...dates.map((d, i) => [d, ...stocks.map(s => { const p = [...s.actual, ...s.forecast].find(p => p.index === i); return p ? p.value.toFixed(2) : ''; })].join(','))].join('\r\n'));
  main.replaceChildren(
    h('section', {class: 'lead'}, h('h1', {class: 'h1', 'data-speak': '1만원 비교'}, '1만원 비교'), h('p', {class: 'muted'}, `${korDate(data.startDate)}에 52종목을 모두 1만원으로 샀다면 · 실제 ${data.actualDates.length - 1}거래일 + 전망 ${data.futureDates.length}거래일 · 같은 발행본 ${data.forecastId.slice(0, 26)}… · 배당·기업행위 미조정`)),
    h('section', {class: 'race-body'},
      h('div', {class: 'chart-col'},
        h('div', {class: 'legend'}, h('span', {class: 'leg'}, h('span', {class: 'swatch today'}), '선택 종목'), h('span', {class: 'leg'}, h('span', {class: 'swatch highlight'}), hlLabel), h('span', {class: 'leg'}, h('span', {class: 'swatch other'}), '나머지'), h('span', {class: 'leg'}, h('span', {class: 'swatch dashed'}), '전망 구간(점선)')),
        chartBox,
        h('div', {class: 'player'}, playBtn, h('button', {class: 'ctl', type: 'button', 'aria-label': '하루 전', onclick: () => { stop(); setIndex(race.index - 1); }}, '‹'), h('button', {class: 'ctl', type: 'button', 'aria-label': '하루 뒤', onclick: () => { stop(); setIndex(race.index + 1); }}, '›'), cursorLabel, h('select', {class: 'select small', 'aria-label': '재생 속도', onchange: ev => { race.speed = Number(ev.target.value); }}, ...[[0.5, '느리게'], [1, '1초/거래일'], [2, '빠르게']].map(([v, l]) => h('option', {value: v, selected: v === race.speed}, l)))),
        slider, modeRow, groupRow,
        h('div', {class: 'toggles'}, h('button', {class: 'ctl', type: 'button', onclick: csv}, '52선 CSV 내려받기')),
        h('p', {class: 'muted small'}, '「같은 시작일 1만원 수준 순위」와 「오늘부터 향후 수익률 순위」는 서로 다른 지표입니다. 동률은 종목코드 순. 전망 구간은 중앙 전망(p50)이며 범위는 종목 상세에서 봅니다.')),
      h('aside', {class: 'rank-col'}, rankBox, newsBox)));
  draw();
  new ResizeObserver(() => draw()).observe(chartBox);
}
