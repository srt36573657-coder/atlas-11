/* ATLAS 11 · 1만원 비교 v9 — 헤드라인(52종목 평균 1만원의 20거래일 뒤 값) → 52선 그래프(굵은 평균선의 마지막 값 = 헤드라인 숫자) → 순위 가로 막대
   52종목이 같은 날 1만원으로 출발 · 선택 종목 강조 · 날짜별 순위 · 그 순위 종목의 일정 */
import {h, num, pct, won, prob, korDate, shortDate, dirMark, dirWord, DIR, reducedMotion, clamp, download, csvCell, signCls} from './util.js';
import {loadRace, loadStock, setSummary} from './store.js';
import {raceChart} from './chart.js';
import {headline, editionSource, hbar} from './frame.js';

const race = {index: null, playing: false, timer: null, speed: 1, selected: null, mode: 'level', base: 'today', group: null};
export function pauseRace() { race.playing = false; clearTimeout(race.timer); race.timer = null; }

export async function renderRace(main, {manifest}) {
  const data = await loadRace();
  const dates = data.dates, anchorIndex = data.actualDates.length - 1, end = dates.at(-1);
  const from = race.base === 'today' ? anchorIndex : 0;
  if (race.index == null || race.index < from) race.index = dates.length - 1;
  race.selected ??= [...data.stocks].sort((a, b) => b.fromToday.at(-1).value - a.fromToday.at(-1).value || a.code.localeCompare(b.code))[0].code;
  // 출발 기준 둘: 「발행일 종가 1만원」(기본 · 52선이 발행일 한 점에서 갈라짐) · 「20거래일 전 종가 1만원」(자료의 값 그대로)
  const rebase = s => race.base === 'today' ? s.startClose / s.anchorClose : 1;
  const stocks = data.stocks.map(s => ({code: s.code, name: s.name, sector: s.sector, group: s.group, actual: s.actual.map((p, i) => ({index: i, value: p.value * rebase(s)})), forecast: race.base === 'today' ? s.fromToday.map((p, j) => ({index: anchorIndex + j + 1, value: p.value})) : s.forecast.map((p, j) => ({index: anchorIndex + j, value: p.value})), fromToday: s.fromToday}));
  // 헤드라인 숫자: 발행일 종가 1만원씩 → 20거래일 뒤 중앙 전망 52종목 평균(= 그래프 굵은 평균선의 마지막 값)
  const lastVals = data.stocks.map(s => s.fromToday.at(-1).value), mean = lastVals.reduce((a, b) => a + b, 0) / lastVals.length, over = lastVals.filter(v => v > 10000).length;
  const top = data.stocks.map(s => ({name: s.name, v: s.fromToday.at(-1).value})).sort((a, b) => b.v - a.v)[0];
  setSummary(`1만원 비교. ${korDate(data.anchorDate)} 종가에 52종목을 1만원씩 샀다면, ${korDate(end)} 중앙 전망 평균 ${won(mean)}. 1만원보다 많아지는 종목 ${over}종목. 1위 ${top.name} ${won(top.v)}.`);
  const hl = headline({speak: `${korDate(data.anchorDate)} 종가에 1만원씩, ${korDate(end)} 중앙 전망 52종목 평균 ${won(mean)}, 1만원 넘는 종목 ${over}종목`,
    parts: [`${korDate(data.anchorDate)} 종가에 1만원씩 · ${korDate(end)} 중앙 전망 52종목 평균 `, {figure: won(mean)}, ` · 1만원 넘는 종목 ${over}종목`],
    source: [['이 숫자', `52종목 각각 「1만원 × ${korDate(end)} 중앙 전망 ÷ ${korDate(data.anchorDate)} 종가」를 구해 단순 평균한 값(1위 ${top.name} ${won(top.v)})`], ['1만원 넘는 종목', `${over}종목 · 못 넘는 종목 ${52 - over}종목`], ['조정', '배당·기업행위 미조정 · 수수료·세금 빼지 않음'], ...editionSource(manifest, 'race.json')]});

  const chartBox = h('div', {class: 'chart-box'}), rankBox = h('ol', {class: 'rank-list', 'aria-label': '순위'}), newsBox = h('div', {class: 'rank-news'}), cursorLabel = h('span', {class: 'cursor-text'});
  const playBtn = h('button', {class: 'ctl primary', type: 'button'}, '▶ 재생');
  const slider = h('input', {class: 'slider', type: 'range', min: from, max: dates.length - 1, step: 1, value: race.index, 'aria-label': '날짜 커서', oninput: ev => { stop(); setIndex(Number(ev.target.value)); }});
  const modeBtn = (mode, label) => h('button', {class: 'ctl toggle' + (race.mode === mode ? ' on' : ''), type: 'button', 'aria-pressed': String(race.mode === mode), onclick: () => { race.mode = mode; draw(); }}, label);
  const modeRow = h('div', {class: 'toggles'});
  const groupRow = h('div', {class: 'toggles groups', role: 'group', 'aria-label': '묶음 강조'});
  const hlLabel = h('span', null, '커서 날짜 상위 5종목');
  const detailCache = new Map();
  async function stockDetail(code) { if (!detailCache.has(code)) detailCache.set(code, loadStock(code)); return detailCache.get(code); }
  const valueAt = (s, i) => [...s.actual, ...s.forecast].find(p => p.index === i)?.value ?? (race.base === 'today' && i === anchorIndex ? 10000 : null);

  function ranksAt(i) {
    const date = dates[i];
    if (race.mode === 'future' && i > anchorIndex) return data.futureReturnRank[date].map(code => { const s = stocks.find(s => s.code === code), f = s.fromToday[i - anchorIndex - 1]; return {code, name: s.name, value: f.return, text: pct(f.return), signed: f.return}; });
    const order = race.base === 'today' ? [...stocks].map(s => ({code: s.code, v: valueAt(s, i) ?? 0})).sort((a, b) => b.v - a.v || a.code.localeCompare(b.code)).map(x => x.code) : data.levelRank[date];
    return order.map(code => { const s = stocks.find(s => s.code === code), v = valueAt(s, i); return {code, name: s.name, value: v, text: won(v), signed: v / 10000 - 1}; });
  }
  function draw() {
    const i = race.index, date = dates[i];
    const baseBtn = (b, label) => h('button', {class: 'ctl toggle' + (race.base === b ? ' on' : ''), type: 'button', 'aria-pressed': String(race.base === b), onclick: () => { race.base = b; renderRace(main, {manifest}); }}, label);
    // 발행일 1만원 기준이면 「1만원 값 순위」와 「발행일부터 수익률 순위」가 같으므로 순위 단추를 보이지 않는다(같은 것을 두 번 말하지 않기)
    modeRow.replaceChildren(h('span', {class: 'lbl muted xs'}, '출발'), baseBtn('today', `${korDate(data.anchorDate)} 종가 1만원`), baseBtn('start', `${korDate(data.startDate)} 종가 1만원`), ...(race.base === 'today' ? [] : [h('span', {class: 'lbl muted xs'}, '순위'), modeBtn('level', '1만원이 얼마가 됐나'), i > anchorIndex ? modeBtn('future', `${korDate(data.anchorDate)}부터 수익률`) : null]));
    if (race.base === 'today') race.mode = 'level';
    const groupBtn = (id, label) => h('button', {class: 'ctl toggle' + (race.group === id ? ' on' : ''), type: 'button', 'aria-pressed': String(race.group === id), dataset: {group: id ?? 'all'}, onclick: () => { race.group = id; draw(); }}, label);
    groupRow.replaceChildren(h('span', {class: 'lbl muted xs'}, '묶음'), groupBtn(null, '전체'), ...(data.groups ?? []).map(g => groupBtn(g.id, `${g.name} ${g.count}종목`)));
    const highlight = race.group ? stocks.filter(s => s.group === race.group).map(s => s.code) : ranksAt(i).slice(0, 5).map(r => r.code);
    hlLabel.textContent = race.group ? `${data.groups.find(g => g.id === race.group)?.name} 묶음` : '커서 날짜 상위 5종목';
    raceChart(chartBox, {dates, stocks, selected: race.selected, cursorIndex: i, anchorIndex, highlight, average: race.base === 'today', from, baseLabel: `${shortDate(race.base === 'today' ? data.anchorDate : data.startDate)} 1만원`, onPick: j => { stop(); setIndex(j); }});
    cursorLabel.textContent = `${korDate(date)} · ${i > anchorIndex ? (i - anchorIndex) + '거래일 뒤 전망' : i === anchorIndex ? '출발(실제 종가)' : '실제 종가'}`;
    slider.value = i;
    const rows = ranksAt(i), mx = Math.max(...rows.map(r => Math.abs(r.signed ?? 0)), 1e-9);
    rankBox.replaceChildren(...rows.map((r, k) => h('li', {class: 'rank-row' + (r.code === race.selected ? ' selected' : '') + (k < 5 ? ' top' : ''), dataset: {code: r.code}, 'data-speak': k < 3 ? `${k + 1}위 ${r.name} ${r.text}` : null}, h('button', {class: 'rank-btn', type: 'button', onclick: () => { race.selected = r.code; draw(); }, 'aria-label': `${k + 1}위 ${r.name} 선택`}, h('span', {class: 'rank-no'}, `${k + 1}위`), h('span', {class: 'rank-name'}, r.name), hbar(r.signed, {max: mx, label: r.text})))));
    const sel = rankBox.querySelector('.selected'); if (sel && !reducedMotion()) sel.scrollIntoView({block: 'nearest'});
    renderNews(date);
  }
  async function renderNews(date) {
    const s = stocks.find(s => s.code === race.selected); if (!s) return;
    const rank = ranksAt(race.index).findIndex(r => r.code === s.code) + 1;
    newsBox.replaceChildren(h('h3', null, `${rank}위 ${s.name} · ${korDate(date)} 일정`), h('p', {class: 'muted small'}, '읽는 중'));
    const d = await stockDetail(s.code); if (race.selected !== s.code) return;
    const x = d.explain[date], events = x?.events ?? (d.news ?? []).filter(n => n.date === date).map(n => ({name: n.name, kind: n.kind, important: n.important, reason: n.reason, sources: n.sources}));
    newsBox.replaceChildren(h('h3', null, `${rank}위 ${s.name} · ${korDate(date)}`),
      x?.kind === 'forecast' ? h('p', {class: 'small'}, `중앙 전망 ${won(x.p50)} (출발 종가 대비 ${pct(x.cumulativeReturn)}) · 방향 `, h('span', {class: DIR[x.direction.cumulative.selected].cls}, `${dirMark(x.direction.cumulative.selected)} ${dirWord(x.direction.cumulative.selected)} ${prob(x.direction.cumulative.probabilities[x.direction.cumulative.selected])}`), x.direction.cumulative.closeCall ? h('span', {class: 'badge warn'}, '비슷함') : null) : x ? h('p', {class: 'small'}, `실제 종가 ${won(x.close)} (${pct(x.dailyChange)})`) : null,
      events.length ? h('ul', {class: 'events'}, ...events.map(e => h('li', null, h('b', null, e.name), h('span', {class: 'badge ' + (e.important ? 'warn' : '')}, e.important ? '중요' : '참고'), h('span', {class: 'badge'}, '전망 숫자에 안 넣음'), h('div', {class: 'small'}, ...(e.sources ?? []).filter(s => s.url).map(s => h('a', {href: s.url, target: '_blank', rel: 'noopener'}, s.name ?? '출처')))))) : h('p', {class: 'muted small'}, '이 날 확인된 일정 없음'),
      h('a', {class: 'link', href: '#/stock/' + s.code}, s.name + ' 상세 보기 ›'));
  }
  function setIndex(i) { race.index = clamp(i, from, dates.length - 1); draw(); }
  function tick() { if (!race.playing) return; if (race.index >= dates.length - 1) { stop(); return; } race.index++; draw(); race.timer = setTimeout(tick, 1000 / race.speed); }
  function play() { if (race.index >= dates.length - 1) race.index = from; race.playing = true; playBtn.textContent = '❚❚ 정지'; clearTimeout(race.timer); race.timer = setTimeout(tick, 1000 / race.speed); }
  function stop() { race.playing = false; clearTimeout(race.timer); race.timer = null; playBtn.textContent = '▶ 재생'; }
  playBtn.addEventListener('click', () => race.playing ? stop() : play());
  const csv = () => download(`ATLAS_10000_${data.actualAsOf.replaceAll('-', '')}.csv`, ['날짜,' + stocks.map(s => csvCell(s.name)).join(','), ...dates.map((d, i) => [d, ...stocks.map(s => { const v = valueAt(s, i); return v != null ? v.toFixed(2) : ''; })].join(','))].join('\r\n'));
  main.replaceChildren(hl,
    h('section', {class: 'race-body'},
      h('div', {class: 'chart-col'},
        h('div', {class: 'legend'}, race.base === 'today' ? h('span', {class: 'leg'}, h('span', {class: 'swatch avg'}), '52종목 평균') : null, h('span', {class: 'leg'}, h('span', {class: 'swatch today'}), '선택 종목'), h('span', {class: 'leg'}, h('span', {class: 'swatch highlight'}), hlLabel), h('span', {class: 'leg'}, h('span', {class: 'swatch other'}), '나머지'), h('span', {class: 'leg'}, h('span', {class: 'swatch dashed'}), '전망 구간(점선)')),
        chartBox,
        h('div', {class: 'player'}, playBtn, h('button', {class: 'ctl', type: 'button', 'aria-label': '하루 전', onclick: () => { stop(); setIndex(race.index - 1); }}, '‹'), h('button', {class: 'ctl', type: 'button', 'aria-label': '하루 뒤', onclick: () => { stop(); setIndex(race.index + 1); }}, '›'), cursorLabel, h('select', {class: 'select small', 'aria-label': '재생 속도', onchange: ev => { race.speed = Number(ev.target.value); }}, ...[[0.5, '느리게 · 하루 2초'], [1, '보통 · 하루 1초'], [2, '빠르게 · 하루 0.5초']].map(([v, l]) => h('option', {value: v, selected: v === race.speed}, l)))),
        slider, modeRow, groupRow,
        h('div', {class: 'toggles'}, h('button', {class: 'ctl', type: 'button', onclick: csv}, '52종목 CSV 내려받기')),
        h('details', {class: 'more'}, h('summary', null, '읽는 법'), h('ul', {class: 'plain small'}, h('li', null, '「1만원이 얼마가 됐나」와 「발행일부터 수익률」은 서로 다른 순위입니다 · 같으면 종목코드 순'), h('li', null, '전망 구간은 중앙 전망(가운데 값)이며 범위는 종목 상세에서 봅니다'), h('li', null, '배당·기업행위 미조정 · 수수료·세금 빼지 않음')))),
      h('aside', {class: 'rank-col'}, h('h2', {class: 'panel-title'}, '순위'), rankBox, newsBox)));
  draw();
  let lastW = chartBox.clientWidth; new ResizeObserver(() => { if (chartBox.clientWidth !== lastW) { lastW = chartBox.clientWidth; draw(); } }).observe(chartBox);
}
