/* ATLAS 11 · SVG 차트 v4 — 실제 검정 실선 2px · 오늘 전망 파랑 실선 2px · 어제 전망 회색 점선 1px · 세 겹 부채꼴(5~95 · 10~90 · 25~75%) · 실제/미래 경계 세로선 · 출발 검은 점
   재생 중에는 커서만 움직인다(전체를 다시 그리지 않음). 처음 그릴 때 전망선이 출발점에서 뻗어 나가는 짧은 드러내기(줄임 모션이면 없음). */
import {finite, shortDate, num, esc, niceTicks, pct, reducedMotion, wonShort, chartScale} from './util.js';
const NS = 'http://www.w3.org/2000/svg';
const svgEl = (tag, attrs = {}) => { const el = document.createElementNS(NS, tag); for (const [k, v] of Object.entries(attrs)) if (v != null) el.setAttribute(k, v); return el; };
const text = (attrs, content) => { const t = svgEl('text', attrs); t.textContent = content; return t; };

export function geometry({dates, series, width, height, left, right, top, bottom}) {
  const values = series.flatMap(s => s.points.flatMap(p => [p.value, p.low, p.high])).filter(finite);
  const low = Math.min(...values), high = Math.max(...values);
  const pad = Math.max((high - low) * 0.08, Math.abs(high) * 0.002), min = low - pad, max = high + pad;
  const x = i => left + (dates.length > 1 ? i / (dates.length - 1) : 0) * (width - left - right);
  const y = v => top + (max - v) / Math.max(1e-12, max - min) * (height - top - bottom);
  return {x, y, min, max};
}
function path(points, x, y, key = 'value') {
  let d = '', active = false;
  for (const p of points) { const v = p[key]; if (!finite(v) || p.index == null) { active = false; continue; } d += `${active ? 'L' : 'M'}${x(p.index).toFixed(2)},${y(v).toFixed(2)}`; active = true; }
  return d;
}
const bandPath = (rows, x, y) => rows.map((p, i) => `${i ? 'L' : 'M'}${x(p.index).toFixed(2)},${y(p.high).toFixed(2)}`).join('') + [...rows].reverse().map(p => `L${x(p.index).toFixed(2)},${y(p.low).toFixed(2)}`).join('') + 'Z';

/** 종목 상세 차트. bands: [{rows:[{index,low,high}], cls}] 바깥→안쪽 순. 돌려주는 update(cursorIndex) 로 커서만 옮긴다. */
export function priceChart(container, {dates, series, bands = [], anchorIndex, cursorIndex, onPick, onHover, ariaLabel, yFormat = v => num(v), endFormat = null, reveal = false}) {
  const endFmt = endFormat ?? yFormat, kindOf = s => String(s.kind).split(' ')[0];
  const width = Math.max(320, container.clientWidth || 900), mobile = width < 600, k = chartScale(width), height = Math.round((mobile ? 300 : 400) * k), left = (mobile ? 62 : 78) * k, right = (mobile ? 14 : 22) * k, top = 24 * k, bottom = 40 * k;
  const g = geometry({dates, series, width, height, left, right, top, bottom});
  const svg = svgEl('svg', {viewBox: `0 0 ${width} ${height}`, width: '100%', height, role: 'img', 'aria-label': ariaLabel, class: 'chart sfumato'}); svg.style.fontSize = (16 * k) + 'px';
  // 층 0: 정의(띠 그라데이션 · 실제선 그림자 흐림) — 그림자는 선 바로 아래 같은 색·낮은 불투명도라 다른 선으로 읽히지 않는다
  const uid = 'c' + Math.random().toString(36).slice(2, 8), defs = svgEl('defs');
  for (const [k, a0, a1] of [['outer', .04, .08], ['mid', .07, .14], ['inner', .12, .22]]) { const lg = svgEl('linearGradient', {id: `${uid}-band-${k}`, x1: '0', y1: '0', x2: '0', y2: '1'}); lg.append(svgEl('stop', {offset: '0%', class: 'band-stop', 'stop-opacity': a0})); lg.append(svgEl('stop', {offset: '100%', class: 'band-stop', 'stop-opacity': a1})); defs.append(lg); }
  const blur = svgEl('filter', {id: `${uid}-shadow`, x: '-5%', y: '-20%', width: '110%', height: '140%'}); blur.append(svgEl('feGaussianBlur', {stdDeviation: '1.6'})); defs.append(blur);
  const plateGrad = svgEl('linearGradient', {id: `${uid}-plate`, x1: '0', y1: '0', x2: '1', y2: '1'}); plateGrad.append(svgEl('stop', {offset: '0%', class: 'plate-stop light'})); plateGrad.append(svgEl('stop', {offset: '100%', class: 'plate-stop dark'})); defs.append(plateGrad);
  svg.append(defs);
  // 층 1: 바탕판(부드러운 명암) · 층 2: 격자(물러남)
  svg.append(svgEl('rect', {x: left, y: top, width: width - left - right, height: height - top - bottom, rx: 8, class: 'plate', fill: `url(#${uid}-plate)`}));
  for (const v of niceTicks(g.min, g.max, mobile ? 3 : 4)) { const yy = g.y(v); svg.append(svgEl('line', {x1: left, x2: width - right, y1: yy, y2: yy, class: 'grid'})); svg.append(text({x: left - 8 * k, y: yy + 4 * k, class: 'tick', 'text-anchor': 'end'}, yFormat(v))); }
  const step = Math.max(1, Math.round(dates.length / (mobile ? 5 : 9)));
  dates.forEach((d, i) => { const last = i === dates.length - 1; if (i % step === 0 && (dates.length - 1 - i) >= step / 2 || last) svg.append(text({x: g.x(i), y: height - bottom + 18 * k, class: 'tick', 'text-anchor': last ? 'end' : 'middle'}, shortDate(d))); });
  const animate = reveal && !reducedMotion();
  // 층 3: 범위 띠(투명한 층 겹침 · 각 띠의 실제 경계는 가는 선으로 정확히 읽힘 · 좌표 변형 없음)
  const bandGroup = svgEl('g', {class: 'bands' + (animate ? ' reveal' : '')});
  for (const b of bands) if (b.rows?.length) { const el = svgEl('path', {d: bandPath(b.rows, g.x, g.y), class: 'band ' + (b.cls ?? '')}); el.style.fill = `url(#${uid}-band-${b.cls ?? 'outer'})`; bandGroup.append(el); } // 스타일시트의 fill 보다 우선하도록 CSSOM 으로 지정(CSP 안)
  for (const b of bands) if (b.rows?.length) { const r = b.rows; for (const key of ['high', 'low']) bandGroup.append(svgEl('path', {d: r.map((p, i) => `${i ? 'L' : 'M'}${g.x(p.index).toFixed(2)},${g.y(p[key]).toFixed(2)}`).join(''), class: 'band-edge ' + (b.cls ?? '')})); }
  svg.append(bandGroup);
  if (anchorIndex != null) { svg.append(svgEl('line', {x1: g.x(anchorIndex), x2: g.x(anchorIndex), y1: top, y2: height - bottom, class: 'boundary'})); svg.append(text({x: g.x(anchorIndex) + 5 * k, y: top + 12 * k, class: 'tick boundary-label'}, '실제 | 전망')); }
  // 층 4: 선 — 실제선은 바로 아래 부드러운 그림자 한 겹(같은 색 · 2px 아래 · 흐림 1.6) 으로 판 위에 놓인 느낌 · 전망선·어제선은 그림자 없음
  const actualSeries = series.find(s => kindOf(s) === 'actual');
  if (actualSeries) svg.append(svgEl('path', {d: path(actualSeries.points, g.x, g.y), class: 'line-shadow', transform: 'translate(0,2)', filter: `url(#${uid}-shadow)`, 'aria-hidden': 'true'}));
  for (const s of series) { const p = svgEl('path', {d: path(s.points, g.x, g.y), class: 'line ' + s.kind + (animate && kindOf(s) !== 'actual' ? ' draw' : ''), 'data-series': s.id}); svg.append(p); }
  const anchor = series.find(s => kindOf(s) === 'actual')?.points.at(-1);
  if (anchor && finite(anchor.value)) { svg.append(svgEl('circle', {cx: g.x(anchor.index), cy: g.y(anchor.value), r: 11 * k, class: 'anchor-halo'})); svg.append(svgEl('circle', {cx: g.x(anchor.index), cy: g.y(anchor.value), r: 4.5 * k, class: 'anchor-dot'})); }
  const today = series.find(s => kindOf(s) === 'today'), last = today?.points.at(-1);
  if (last && finite(last.value) && anchor) {
    const above = last.value >= anchor.value;
    svg.append(text({x: g.x(last.index), y: g.y(last.value) + (above ? -10 : 18) * k, class: 'end-label ' + String(today.kind).split(' ').slice(1).join(' '), 'text-anchor': 'end'}, `${endFmt(last.value)} (${pct(last.value / anchor.value - 1, 2)})`));
    svg.append(text({x: g.x(anchor.index) - 8 * k, y: g.y(anchor.value) + (above ? 18 : -10) * k, class: 'end-label actual', 'text-anchor': 'end'}, endFmt(anchor.value)));
  }
  // 커서 묶음: 재생 때 이것만 움직인다
  const cursor = svgEl('g', {class: 'cursor-group'});
  const cLine = svgEl('line', {x1: 0, x2: 0, y1: top, y2: height - bottom, class: 'cursor'}); cursor.append(cLine);
  const dots = series.map(s => { const c = svgEl('circle', {cx: 0, cy: 0, r: (kindOf(s) === 'today' || kindOf(s) === 'actual' ? 5 : 3.5) * k, class: 'cursor-dot ' + s.kind}); cursor.append(c); return {s, c}; });
  const cLabel = text({x: 0, y: height - 4 * k, class: 'tick cursor-label', 'text-anchor': 'middle'}, ''); svg.append(cursor); svg.append(cLabel);
  function update(i) {
    if (i == null) { cursor.style.display = 'none'; cLabel.style.display = 'none'; return; }
    cursor.style.display = ''; cLabel.style.display = '';
    const cx = g.x(i); cursor.style.transform = `translate(${cx.toFixed(2)}px, 0)`;
    for (const {s, c} of dots) { const p = s.points.find(p => p.index === i); if (p && finite(p.value)) { c.style.display = ''; c.setAttribute('cy', g.y(p.value).toFixed(2)); } else c.style.display = 'none'; }
    cLabel.setAttribute('x', Math.min(width - right - 50 * k, Math.max(left + 30 * k, cx)).toFixed(2)); cLabel.textContent = shortDate(dates[i]);
  }
  update(cursorIndex);
  const hit = svgEl('rect', {x: left, y: top, width: width - left - right, height: height - top - bottom, class: 'hit'});
  const indexAt = ev => { const rect = svg.getBoundingClientRect(), px = (ev.clientX - rect.left) * width / rect.width; const i = Math.round((px - left) / (width - left - right) * (dates.length - 1)); return i >= 0 && i < dates.length ? i : null; };
  const pick = ev => { const i = indexAt(ev); if (i != null) onPick?.(i); };
  hit.addEventListener('click', pick); hit.addEventListener('pointermove', ev => { if (ev.buttons) pick(ev); else onHover?.(indexAt(ev), ev); }); hit.addEventListener('pointerleave', () => onHover?.(null));
  svg.append(hit);
  svg.__geometry = {x: g.x, y: g.y, top, left, width, height};
  container.replaceChildren(svg);
  return {svg, update, geometry: svg.__geometry};
}
export function chartTip(container, svg, {index, x, y, html}) {
  let tip = container.querySelector('.tip');
  if (index == null || !html) { tip?.remove(); return; }
  if (!tip) { tip = document.createElement('div'); tip.className = 'tip'; container.append(tip); }
  const rect = svg.getBoundingClientRect(), vb = svg.viewBox.baseVal, sx = rect.width / vb.width, sy = rect.height / vb.height;
  tip.innerHTML = html; tip.style.left = Math.max(60, Math.min(rect.width - 60, x * sx)) + 'px'; tip.style.top = Math.max(28, y * sy - 8) + 'px';
}

/** 선택 날짜의 분포 상자: 5~95% 수염 · 10~90% 띠 · 25~75% 상자 · 중앙 · 출발가 눈금 */
export function quantileBox(container, {row, anchor}) {
  const width = Math.max(240, container.clientWidth || 320), k = chartScale(width * 1.6), height = Math.round(64 * k), left = 8, right = 8;
  const lo = Math.min(row.p05, anchor), hi = Math.max(row.p95, anchor), pad = (hi - lo) * 0.08;
  const x = v => left + (v - (lo - pad)) / Math.max(1e-9, hi + 2 * pad - lo) * (width - left - right);
  const svg = svgEl('svg', {viewBox: `0 0 ${width} ${height}`, width: '100%', height, class: 'qbox', role: 'img', 'aria-label': `분포 상자: 5% ${wonShort(row.p05)} · 25% ${wonShort(row.p25)} · 중앙 ${wonShort(row.p50)} · 75% ${wonShort(row.p75)} · 95% ${wonShort(row.p95)} · 출발가 ${wonShort(anchor)}`});
  svg.style.fontSize = (16 * k) + 'px';
  const cy = 28 * k;
  svg.append(svgEl('line', {x1: x(row.p05), x2: x(row.p95), y1: cy, y2: cy, class: 'q-whisker'}));
  svg.append(svgEl('rect', {x: x(row.p10), y: cy - 9 * k, width: Math.max(1, x(row.p90) - x(row.p10)), height: 18 * k, rx: 4, class: 'q-80'}));
  svg.append(svgEl('rect', {x: x(row.p25), y: cy - 12 * k, width: Math.max(1, x(row.p75) - x(row.p25)), height: 24 * k, rx: 5, class: 'q-50'}));
  svg.append(svgEl('line', {x1: x(row.p50), x2: x(row.p50), y1: cy - 14 * k, y2: cy + 14 * k, class: 'q-median'}));
  svg.append(svgEl('line', {x1: x(anchor), x2: x(anchor), y1: cy - 18 * k, y2: cy + 18 * k, class: 'q-anchor'}));
  svg.append(text({x: x(row.p05), y: cy + 30 * k, class: 'q-label', 'text-anchor': 'start'}, wonShort(row.p05)));
  svg.append(text({x: x(row.p50), y: cy - 18 * k, class: 'q-label median', 'text-anchor': 'middle'}, '중앙 ' + wonShort(row.p50)));
  svg.append(text({x: x(row.p95), y: cy + 30 * k, class: 'q-label', 'text-anchor': 'end'}, wonShort(row.p95)));
  svg.append(text({x: Math.min(width - 44 * k, Math.max(44 * k, x(anchor))), y: cy + 30 * k, class: 'q-label anchor', 'text-anchor': 'middle'}, '출발 ' + wonShort(anchor)));
  container.replaceChildren(svg);
  return svg;
}

/** 카드용 작은 그래프: 최근 실제 20 + 전망 20(띠) · 출발점 */
export function sparkline(spark, {width = 200, height = 44, dir = null} = {}) {
  const actual = spark.actual, forecast = spark.forecast, low = spark.low ?? forecast, high = spark.high ?? forecast;
  const all = [...actual, ...forecast, ...low, ...high].filter(finite), min = Math.min(...all), max = Math.max(...all), n = actual.length + forecast.length;
  const x = i => 2 + i / (n - 1) * (width - 4), y = v => 3 + (max - v) / Math.max(1e-9, max - min) * (height - 6);
  const svg = svgEl('svg', {viewBox: `0 0 ${width} ${height}`, class: 'spark', 'aria-hidden': 'true', preserveAspectRatio: 'none'});
  const a0 = actual.length - 1;
  svg.append(svgEl('line', {x1: 2, x2: width - 2, y1: y(actual[a0]), y2: y(actual[a0]), class: 's-base'}));
  svg.append(svgEl('path', {d: `M${x(a0).toFixed(1)},${y(actual[a0]).toFixed(1)}` + forecast.map((v, j) => `L${x(a0 + j + 1).toFixed(1)},${y(high[j]).toFixed(1)}`).join('') + forecast.map((v, j) => forecast.length - 1 - j).map(j => `L${x(a0 + j + 1).toFixed(1)},${y(low[j]).toFixed(1)}`).join('') + 'Z', class: 's-band'}));
  svg.append(svgEl('path', {d: actual.map((v, i) => `${i ? 'L' : 'M'}${x(i).toFixed(1)},${y(v).toFixed(1)}`).join(''), class: 's-actual'}));
  svg.append(svgEl('path', {d: `M${x(a0).toFixed(1)},${y(actual[a0]).toFixed(1)}` + forecast.map((v, j) => `L${x(a0 + j + 1).toFixed(1)},${y(v).toFixed(1)}`).join(''), class: 's-forecast ' + (dir ?? '')}));
  svg.append(svgEl('circle', {cx: x(a0), cy: y(actual[a0]), r: 2.5, class: 's-anchor'}));
  return svg;
}

/** 상승·보합·하락 비율 막대 */
export function probBar(p, {large = false, legend = true} = {}) {
  const wrap = document.createElement('div');
  const bar = document.createElement('div'); bar.className = 'pbar' + (large ? ' lg' : ''); bar.setAttribute('role', 'img'); bar.setAttribute('aria-label', `상승 ${(p.up * 100).toFixed(0)}% 보합 ${(p.flat * 100).toFixed(0)}% 하락 ${(p.down * 100).toFixed(0)}%`);
  for (const k of ['up', 'flat', 'down']) { const s = document.createElement('span'); s.className = 'p-' + k; s.style.width = (p[k] * 100).toFixed(2) + '%'; bar.append(s); }
  wrap.append(bar);
  if (legend) { const l = document.createElement('div'); l.className = 'pbar-legend'; l.innerHTML = `<span class="up">▲ ${(p.up * 100).toFixed(0)}%</span><span>— ${(p.flat * 100).toFixed(0)}%</span><span class="down">▼ ${(p.down * 100).toFixed(0)}%</span>`; wrap.append(l); }
  return wrap;
}

/** 부호 있는 기여 막대 (가운데 0) */
export function contributionBars(container, rows) {
  const max = Math.max(...rows.map(r => Math.abs(r.value)).filter(finite), 1e-12);
  container.replaceChildren(...rows.map(r => { const el = document.createElement('div'); el.className = 'cbar'; const w = finite(r.value) ? Math.abs(r.value) / max * 50 : 0; el.innerHTML = `<span>${esc(r.label)}</span><span class="track"><span class="fill ${r.value < 0 ? 'neg' : ''}"></span></span><span class="val">${finite(r.value) ? (r.value * 100 > 0 ? '+' : '') + (r.value * 100).toFixed(3) + '%p' : '미산출'}</span>`; const fill = el.querySelector('.fill'); fill.style.left = (r.value < 0 ? 50 - w : 50) + '%'; fill.style.width = w + '%'; return el; }));
}

/** 1만원 비교 — 52선 모두 그리고 선택 종목 강조 · from: 그릴 첫 날짜 번호(발행일 1만원 기준이면 발행일부터 · 과거 구간은 그리지 않아 전망이 잘 보임)
 *  이름표(강조 종목 · 선택 종목 · 평균)는 한 줄에 모아 겹치지 않게 위아래로 벌린다 */
export function raceChart(container, {dates, stocks, selected, cursorIndex, anchorIndex, onPick, highlight = [], baseLabel = '1만원', average = false, from = 0}) {
  const width = Math.max(320, container.clientWidth || 900), mobile = width < 600, k = chartScale(width), height = Math.round((mobile ? 320 : 430) * k), left = (mobile ? 60 : 76) * k, right = (mobile ? 14 : 22) * k, top = 16 * k, bottom = 40 * k;
  const pts = s => [...s.actual, ...s.forecast].filter(p => p.index >= from);
  const all = stocks.flatMap(s => pts(s).map(p => p.value)).concat([10000]);
  const lo = Math.min(...all), hi = Math.max(...all), pad = (hi - lo) * 0.06 || 50, min = lo - pad, max = hi + pad;
  const n = dates.length - 1 - from, x = i => left + (i - from) / Math.max(1, n) * (width - left - right), y = v => top + (max - v) / (max - min) * (height - top - bottom);
  const svg = svgEl('svg', {viewBox: `0 0 ${width} ${height}`, width: '100%', height, role: 'img', 'aria-label': '52종목 1만원 비교 그래프', class: 'chart race'}); svg.style.fontSize = (16 * k) + 'px';
  for (const v of niceTicks(min, max, mobile ? 3 : 4)) { const yy = y(v); svg.append(svgEl('line', {x1: left, x2: width - right, y1: yy, y2: yy, class: 'grid'})); svg.append(text({x: left - 8 * k, y: yy + 4 * k, class: 'tick', 'text-anchor': 'end'}, num(v) + '원')); }
  const step = Math.max(1, Math.round((n + 1) / (mobile ? 5 : 10)));
  for (let i = from; i < dates.length; i++) { const last = i === dates.length - 1; if (((i - from) % step === 0 && (dates.length - 1 - i) >= step / 2) || last) svg.append(text({x: x(i), y: height - bottom + 18 * k, class: 'tick', 'text-anchor': last ? 'end' : i === from ? 'start' : 'middle'}, shortDate(dates[i]))); }
  svg.append(svgEl('line', {x1: left, x2: width - right, y1: y(10000), y2: y(10000), class: 'base-line'}));
  svg.append(text({x: left + 6 * k, y: y(10000) + 16 * k, class: 'tick base-label', 'text-anchor': 'start'}, baseLabel));
  if (anchorIndex > from) svg.append(svgEl('line', {x1: x(anchorIndex), x2: x(anchorIndex), y1: top, y2: height - bottom, class: 'boundary'}));
  const clip = arr => arr.filter(p => p.index >= from);
  const order = [...stocks].sort((a, b) => (a.code === selected) - (b.code === selected) || highlight.includes(a.code) - highlight.includes(b.code));
  for (const s of order) {
    const cls = s.code === selected ? 'selected' : highlight.includes(s.code) ? 'highlight' : 'other';
    const fc = clip(s.forecast), start = from >= anchorIndex ? [{index: anchorIndex, value: 10000}] : [];
    if (from < anchorIndex) svg.append(svgEl('path', {d: path(clip(s.actual), x, y), class: 'race-line actual ' + cls, 'data-code': s.code}));
    svg.append(svgEl('path', {d: path([...start, ...fc], x, y), class: 'race-line forecast ' + cls, 'data-code': s.code}));
  }
  const labels = [];
  // 52종목 평균선(발행일 1만원 기준일 때) — 마지막 값 = 1만원 비교 헤드라인 숫자
  if (average) {
    const avg = dates.map((_, i) => { if (i < from) return null; if (i === anchorIndex && from >= anchorIndex) return 10000; const v = stocks.map(s => [...s.actual, ...s.forecast].find(p => p.index === i)?.value).filter(v => Number.isFinite(v)); return v.length === stocks.length ? v.reduce((a, b) => a + b, 0) / v.length : null; });
    svg.append(svgEl('path', {d: avg.map((v, i) => v == null ? '' : `${i > from && avg[i - 1] != null ? 'L' : 'M'}${x(i).toFixed(2)},${y(v).toFixed(2)}`).join(''), class: 'race-avg'}));
    const li = avg.findLastIndex(v => v != null); if (li >= 0) { svg.append(svgEl('circle', {cx: x(li), cy: y(avg[li]), r: 4.5 * k, class: 'race-avg-dot'})); if (cursorIndex !== li) labels.push({text: `평균 ${num(avg[li])}원`, yy: y(avg[li]), cls: 'race-avg-label', x: x(li)}); else labels.push({text: `평균 ${num(avg[li])}원`, yy: y(avg[li]), cls: 'race-avg-label'}); }
  }
  if (cursorIndex != null && cursorIndex >= from) {
    svg.append(svgEl('line', {x1: x(cursorIndex), x2: x(cursorIndex), y1: top, y2: height - bottom, class: 'cursor'}));
    const valAt = s => cursorIndex === anchorIndex && from >= anchorIndex ? 10000 : [...s.actual, ...s.forecast].find(p => p.index === cursorIndex)?.value;
    for (const code of highlight) { if (code === selected) continue; const s = stocks.find(s => s.code === code), v = s && valAt(s); if (Number.isFinite(v)) labels.push({text: s.name, yy: y(v), cls: 'race-tag'}); }
    const s = stocks.find(s => s.code === selected), v = s && valAt(s);
    if (Number.isFinite(v)) { svg.append(svgEl('circle', {cx: x(cursorIndex), cy: y(v), r: 5 * k, class: 'cursor-dot today'})); labels.push({text: `${s.name} ${num(v)}원`, yy: y(v), cls: 'race-label'}); }
  }
  // 이름표 벌리기(겹침 없이 14px 간격) · 커서가 오른쪽이면 왼쪽에 붙임
  const cx = cursorIndex != null && cursorIndex >= from ? x(cursorIndex) : x(dates.length - 1), side = cx > width * .6 ? 'end' : 'start', lx = side === 'end' ? cx - 10 * k : cx + 10 * k;
  labels.sort((a, b) => a.yy - b.yy);
  for (let j = 1; j < labels.length; j++) if (labels[j].yy - labels[j - 1].yy < 14 * k) labels[j].yy = labels[j - 1].yy + 14 * k;
  const overflow = labels.length ? labels.at(-1).yy - (height - bottom - 4 * k) : 0; if (overflow > 0) for (const l of labels) l.yy -= overflow;
  for (const l of labels) svg.append(text({x: lx, y: l.yy + 4 * k, class: l.cls, 'text-anchor': side}, l.text));
  const hit = svgEl('rect', {x: left, y: top, width: width - left - right, height: height - top - bottom, class: 'hit'});
  const pick = ev => { const rect = svg.getBoundingClientRect(), px = (ev.clientX - rect.left) * width / rect.width, i = from + Math.round((px - left) / (width - left - right) * n); if (i >= from && i < dates.length) onPick?.(i); };
  hit.addEventListener('click', pick); hit.addEventListener('pointermove', ev => { if (ev.buttons) pick(ev); });
  svg.append(hit);
  container.replaceChildren(svg);
  return svg;
}

/** 작은 막대(오차 등) */
export function bars(container, rows, {max = null, format = v => v.toFixed(1) + '%'} = {}) {
  const top = max ?? Math.max(...rows.map(r => r.value).filter(finite), 1e-9);
  container.replaceChildren(...rows.map(r => { const el = document.createElement('div'); el.className = 'bar-row'; el.innerHTML = `<span class="bar-label">${esc(r.label)}</span><span class="bar-track"><span class="bar-fill ${r.cls ?? ''}"></span></span><span class="bar-value">${finite(r.value) ? format(r.value) : '미산출'}</span>`; el.querySelector('.bar-fill').style.width = (finite(r.value) ? (r.value / top * 100).toFixed(1) : 0) + '%'; return el; }));
}
