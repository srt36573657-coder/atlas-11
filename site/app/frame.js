/* ATLAS 11 · v9 화면 뼈대 — 모든 화면이 같은 세 박자로 말한다
   ① 맨 위 헤드라인 한 줄(날짜·숫자 · 헤드라인 숫자를 누르면 출처·기준 시각이 열린다)
   ② 가운데 그래프(헤드라인 숫자의 증거 · 첫 그래프의 마지막 값 = 헤드라인 숫자)
   ③ 아래 나머지 비교도 그래프 · 자세한 표는 눌러야 열린다
   시장 띠: 코스피·코스닥 값·등락·기준 시각(발행본 manifest.market · 장부의 시장 수집 기록에서 옴) */
import {h, korDate, shortDate, stamp, pts, pctRaw, signCls, finite, esc, chartScale} from './util.js';
import {state} from './store.js';

/** 무결성 검사 한 줄(헤드라인 출처 칸 안 · 파일을 더 읽으면 저절로 고쳐 쓴다) */
/** 선택 상자: 닫힌 선택 상자의 글은 줄을 바꾸지 못해 휴대폰·큰 글씨에서 잘린다(10/01 새벽 사장님 휴대폰).
 *  보이는 글은 줄바꿈되는 칸에 두고, 진짜 선택 상자는 투명하게 그 위를 덮는다 — 누르면 휴대폰 기본 선택 창이 그대로 뜬다. */
export function pickBox(select, {cls = ''} = {}) {
  const text = h('span', {class: 'pick-text', 'aria-hidden': 'true'});
  const sync = () => { text.textContent = select.options[select.selectedIndex]?.text ?? ''; };
  select.classList.add('pick-select'); select.addEventListener('change', sync); sync();
  return h('span', {class: ('pick ' + cls).trim()}, text, h('span', {class: 'pick-arrow', 'aria-hidden': 'true'}, '▾'), select);
}

export function integrityText() { const i = state.integrity; if (!i.available) return '보안 연결이 아니라 이 기기에서는 확인 불가'; if (i.failed.length) return `실패 ${i.failed.length}개 (${i.failed.join(', ')})`; return `읽은 파일 ${i.checked.length}개 모두 발행본 목록의 SHA-256 과 같음`; }
document.addEventListener('atlas:integrity', () => { for (const el of document.querySelectorAll('.integrity-text')) el.textContent = integrityText(); });

const NS = 'http://www.w3.org/2000/svg';
const svgEl = (tag, attrs = {}) => { const el = document.createElementNS(NS, tag); for (const [k, v] of Object.entries(attrs)) if (v != null) el.setAttribute(k, v); return el; };
const svgText = (attrs, content) => { const t = svgEl('text', attrs); t.textContent = content; return t; };

/** 시장 띠 한 줄: 「코스피 6,838.04포인트 −0.48% · 코스닥 855.91포인트 +0.72% · 9월 30일(수) 15:30 KST 종가」 */
export function marketStrip(m) {
  const mk = m?.market;
  if (!mk?.items?.length) return h('div', {class: 'mstrip', 'data-clarity': 'strip', role: 'note'}, h('span', {class: 'm-time'}, `시장 지수 미수집 · 기준 ${korDate(m?.actualAsOf)} 15:30 KST 종가`));
  const same = mk.items.every(i => i.date === mk.items[0].date);
  return h('div', {class: 'mstrip', 'data-clarity': 'strip', role: 'note', 'aria-label': '시장 지수'},
    ...mk.items.map(i => h('span', {class: 'm-item', title: `${i.name} ${korDate(i.date)} 종가 · 출처 ${i.sourceName}`}, h('b', {class: 'm-name'}, i.name), h('span', {class: 'm-val'}, pts(i.close)), h('span', {class: 'm-chg ' + signCls(i.changePct)}, pctRaw(i.changePct, 2, true)), same ? null : h('span', {class: 'm-date'}, korDate(i.date)))),
    h('span', {class: 'm-time'}, `${korDate(mk.items[0].date)} 15:30 KST 종가`));
}

/** 헤드라인 한 줄. parts: 글과 {figure:'15종목'} 섞은 배열 · source: [[이름, 값], ...] (값은 글 또는 요소)
 *  숫자(figure)는 단추 — 누르면 바로 아래 출처·기준 시각 칸이 열린다. */
let hlSeq = 0;
export function headline({parts, source, speak}) {
  const id = 'hl-src-' + (++hlSeq);
  const panel = h('div', {class: 'hl-src', id, hidden: true, role: 'region', 'aria-label': '헤드라인 숫자의 출처와 기준 시각'},
    h('dl', null, ...source.flatMap(([k, v]) => [h('dt', null, k), h('dd', null, v)])));
  // 「 · 」로 나뉜 짧은 마디는 줄바꿈으로 쪼개지지 않게 묶는다(좁은 화면에서 「평균 / −0.09% 전망」처럼 갈라지지 않게)
  const seg = t => t.split(/( · )/).map(x => x === ' · ' ? x : x.length && x.trim().length <= 16 ? h('span', {class: 'hl-seg'}, x) : x);
  const line = h('h1', {class: 'hl-line', 'data-speak': speak ?? null},
    ...parts.flatMap(p => typeof p === 'string' ? seg(p) : h('button', {class: 'hl-num', type: 'button', 'aria-expanded': 'false', 'aria-controls': id, title: '출처·기준 시각 보기', onclick: ev => { panel.hidden = !panel.hidden; ev.currentTarget.setAttribute('aria-expanded', String(!panel.hidden)); }}, p.figure)));
  return h('section', {class: 'hl', 'data-clarity': 'headline'}, line, panel);
}

/** 발행본 출처 줄(모든 헤드라인 공통) */
export function editionSource(m, file) {
  const f = m.files?.[file];
  return [
    ['기준 시각', `${korDate(m.actualAsOf)} 15:30 KST 종가(한국거래소 정규장)`],
    ['발행 시각', stamp(m.issuedAt)],
    ['발행본', h('code', null, m.forecastId)],
    ['자료 파일', f ? h('span', null, h('code', null, 'data/atlas11/view/' + file), ` · SHA-256 `, h('code', null, f.sha256.slice(0, 12))) : h('code', null, file)],
    ['무결성', h('span', {class: 'integrity-text'}, integrityText())],
  ];
}

/** 시간 그래프(선): x = 날짜들 · series: [{id, name, values:[number|null], cls}] · unit: 눈금 단위 글자 · 마지막 값에 직접 이름표
 *  눈금은 하나(y 하나) · 격자는 물러나게 · 점은 지름 8px 이상 · 가리키면 그 날 값 말풍선 */
export function lineChart(container, {dates, series, unit = '', format = v => String(v), yMin = null, yMax = null, ticks = null, height = 220, ariaLabel = '', endLabel = null, band = null, ref = null, forecastIndex = null}) {
  const width = Math.max(300, Math.round(container.clientWidth || 640)), mobile = width < 560, k = chartScale(width);
  const left = (mobile ? 58 : 70) * k, right = (mobile ? 76 : 96) * k, top = 16 * k, bottom = 30 * k; height = Math.round(height * k);
  const vals = series.flatMap(s => s.values).filter(finite);
  const lo = yMin ?? Math.min(...vals), hi = yMax ?? Math.max(...vals);
  const span = Math.max(1e-9, hi - lo);
  const x = i => left + (dates.length > 1 ? i / (dates.length - 1) : 0.5) * (width - left - right);
  const y = v => top + (hi - v) / span * (height - top - bottom);
  const svg = svgEl('svg', {viewBox: `0 0 ${width} ${height}`, width: '100%', height, role: 'img', 'aria-label': ariaLabel, class: 'lc'}); svg.style.fontSize = (16 * k) + 'px';
  for (const t of ticks ?? [lo, (lo + hi) / 2, hi]) { svg.append(svgEl('line', {x1: left, x2: width - right, y1: y(t), y2: y(t), class: 'lc-grid'})); svg.append(svgText({x: left - 8 * k, y: y(t) + 4 * k, class: 'lc-tick', 'text-anchor': 'end'}, format(t) + unit)); }
  dates.forEach((d, i) => svg.append(svgText({x: x(i), y: height - 8 * k, class: 'lc-tick', 'text-anchor': 'middle'}, shortDate(d))));
  if (finite(ref)) svg.append(svgEl('line', {x1: left, x2: width - right, y1: y(ref), y2: y(ref), class: 'lc-ref'}));
  if (band) { svg.append(svgEl('rect', {x: x(band.from) - 16 * k, y: top, width: x(band.to) - x(band.from) + 32 * k, height: height - top - bottom, class: 'lc-band'})); if (band.label) svg.append(svgText({x: x(band.from), y: top + 12 * k, class: 'lc-band-label', 'text-anchor': 'middle'}, band.label)); }
  for (const s of series) {
    let d = '', on = false;
    s.values.forEach((v, i) => { if (!finite(v)) { on = false; return; } d += `${on ? 'L' : 'M'}${x(i).toFixed(1)},${y(v).toFixed(1)}`; on = true; });
    svg.append(svgEl('path', {d, class: 'lc-line ' + (s.cls ?? '')}));
    s.values.forEach((v, i) => { if (finite(v)) { const c = svgEl('circle', {cx: x(i), cy: y(v), r: 4.5 * k, class: 'lc-dot ' + (s.cls ?? ''), 'data-forecast-date': i === forecastIndex ? dates[i] : null}); c.append(Object.assign(svgEl('title'), {textContent: `${s.name} · ${korDate(dates[i])} · ${format(v)}${unit}`})); svg.append(c); } });
    const lastI = s.values.findLastIndex(finite);
    if (lastI >= 0) { const v = s.values[lastI], t = svgText({x: x(lastI) + 10 * k, y: y(v) + 4 * k, class: 'lc-end ' + (s.cls ?? '')}, (s.endText ?? (format(v) + unit))); if (lastI === forecastIndex) t.setAttribute('data-forecast-date', dates[lastI]); svg.append(t); }
  }
  // 가리키기: 가장 가까운 날의 값 말풍선
  const tip = h('div', {class: 'lc-tip', hidden: true});
  const hit = svgEl('rect', {x: left - 10, y: top, width: width - left - right + 20, height: height - top - bottom, class: 'lc-hit'});
  hit.addEventListener('pointermove', ev => { const r = svg.getBoundingClientRect(), px = (ev.clientX - r.left) * width / r.width; const i = Math.max(0, Math.min(dates.length - 1, Math.round((px - left) / Math.max(1, width - left - right) * (dates.length - 1)))); tip.hidden = false; tip.innerHTML = `<b>${esc(korDate(dates[i]))}</b>` + series.map(s => `<br>${esc(s.name)} ${finite(s.values[i]) ? esc(format(s.values[i]) + unit) : '없음'}`).join(''); tip.style.left = (x(i) * r.width / width) + 'px'; tip.style.top = '0px'; });
  hit.addEventListener('pointerleave', () => { tip.hidden = true; });
  svg.append(hit);
  container.replaceChildren(svg, tip);
  container.classList.add('lc-box');
  return svg;
}

/** 가로 막대 한 칸(부호 있는 값은 가운데 0에서 좌우로) — 표 대신 쓰는 비교 막대 */
export function hbar(value, {max, signed = true, cls = null, label = null}) {
  const w = finite(value) && max > 0 ? Math.min(1, Math.abs(value) / max) : 0;
  const fill = h('span', {class: 'hb-fill ' + (cls ?? (signed ? signCls(value) : 'ink'))});
  const track = h('span', {class: 'hb-track' + (signed ? ' signed' : '')}, fill);
  if (signed) { fill.style.width = (w * 50).toFixed(2) + '%'; fill.style.left = (value < 0 ? 50 - w * 50 : 50).toFixed(2) + '%'; }
  else { fill.style.width = (w * 100).toFixed(2) + '%'; fill.style.left = '0%'; }
  return h('span', {class: 'hb'}, track, label != null ? h('span', {class: 'hb-val ' + (signed ? signCls(value) : '')}, label) : null);
}
