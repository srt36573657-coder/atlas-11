/* ATLAS 11 · 화면 뼈대 부품 — 시장 띠 · 지난 종가 선 그래프 · 무결성 한 줄 (예측 없음)
   시장 띠: 코스피·코스닥 값·등락·기준 날짜(판 manifest.market · 날마다 16:00 관측 묶음의 지수 원문에서 옴) */
import {h, korDate, shortDate, pts, pctRaw, signCls, finite, esc, chartScale, won} from './util.js';
import {state} from './store.js';

export function integrityText() { const i = state.integrity; if (!i.available) return '보안 연결이 아니라 이 기기에서는 확인할 수 없음'; if (i.failed.length) return `맞지 않음 ${i.failed.length}개 (${i.failed.join(', ')})`; return `읽은 파일 ${i.checked.length}개 모두 판 목록의 SHA-256 과 같음`; }
document.addEventListener('atlas:integrity', () => { for (const el of document.querySelectorAll('.integrity-text')) el.textContent = integrityText(); });

const NS = 'http://www.w3.org/2000/svg';
const svgEl = (tag, attrs = {}) => { const el = document.createElementNS(NS, tag); for (const [k, v] of Object.entries(attrs)) if (v != null) el.setAttribute(k, v); return el; };
const svgText = (attrs, content) => { const t = svgEl('text', attrs); t.textContent = content; return t; };

/** 시장 띠: 「10월 2일(금) 15:30 KST 종가」(자료 날짜를 맨 앞에 — 2026-10-05 「잡스였다면」 개혁) · 코스피 7,003.74포인트 +0.46% · 코스닥 893.29포인트 −0.11% */
export function marketStrip(m) {
  const mk = m?.market;
  if (!mk?.items?.length) return h('div', {class: 'mstrip', 'data-clarity': 'strip', role: 'note'}, h('span', {class: 'm-time'}, `시장 지수 없음 · 종목 종가 기준 ${korDate(m?.asOf)} 15:30 KST`));
  const same = mk.items.every(i => i.date === mk.items[0].date);
  return h('div', {class: 'mstrip', 'data-clarity': 'strip', role: 'note', 'aria-label': '시장 지수'},
    h('span', {class: 'm-time'}, `${korDate(mk.items[0].date)} 15:30 KST 종가`),
    ...mk.items.map(i => h('span', {class: 'm-item', title: `${i.name} ${korDate(i.date)} 종가 · 출처 ${i.sourceName}`}, h('b', {class: 'm-name'}, i.name), h('span', {class: 'm-val'}, pts(i.close)), h('span', {class: 'm-chg ' + signCls(i.changePct)}, pctRaw(i.changePct, 2, true)), same ? null : h('span', {class: 'm-date'}, korDate(i.date)))));
}

/** 지난 종가 선 그래프: rows = [{date, close}] · 눈금 하나 · 마지막 값에 직접 이름표 · 가리키면 그날 종가 말풍선
   band: 이 날(차례)부터 끝까지 옅은 띠 — 앞 화면(판 · 출목표)의 20거래일과 같은 구간을 이어 보인다(애플 WWDC22 「작은 그래프 → 큰 그래프: 모양과 숫자를 잇는다」) */
export function closeChart(container, rows, {height = 200, ariaLabel = '', band = null} = {}) {
  const width = Math.max(300, Math.round(container.clientWidth || 520)), mobile = width < 560, k = chartScale(width);
  const left = (mobile ? 76 : 88) * k, right = (mobile ? 18 : 24) * k, top = 14 * k, bottom = 28 * k, H = Math.round(height * k);
  const vals = rows.map(r => r.close).filter(finite);
  if (vals.length < 2) { container.replaceChildren(h('p', {class: 'muted small'}, '그래프를 그릴 종가가 모자랍니다.')); return null; }
  const lo = Math.min(...vals), hi = Math.max(...vals), pad = (hi - lo) * 0.08 || hi * 0.01, y0 = lo - pad, y1 = hi + pad;
  const x = i => left + (rows.length > 1 ? i / (rows.length - 1) : .5) * (width - left - right);
  const y = v => top + (y1 - v) / (y1 - y0) * (H - top - bottom);
  const svg = svgEl('svg', {viewBox: `0 0 ${width} ${H}`, width: '100%', height: H, role: 'img', 'aria-label': ariaLabel, class: 'lc'}); svg.style.fontSize = (16 * k) + 'px';
  if (Number.isInteger(band) && band > 0 && band < rows.length - 1) svg.append(svgEl('rect', {x: x(band), y: top, width: x(rows.length - 1) - x(band), height: H - top - bottom, class: 'lc-band', 'data-from': rows[band].date}));
  for (const t of [lo, (lo + hi) / 2, hi]) { svg.append(svgEl('line', {x1: left, x2: width - right, y1: y(t), y2: y(t), class: 'lc-grid'})); svg.append(svgText({x: left - 8 * k, y: y(t) + 4 * k, class: 'lc-tick', 'text-anchor': 'end'}, Math.round(t).toLocaleString('ko-KR') + '원')); }
  const marks = [0, Math.round((rows.length - 1) / 2), rows.length - 1];
  for (const i of marks) svg.append(svgText({x: x(i), y: H - 8 * k, class: 'lc-tick', 'text-anchor': i === 0 ? 'start' : i === rows.length - 1 ? 'end' : 'middle'}, shortDate(rows[i].date)));
  let d = '';
  rows.forEach((r, i) => { if (finite(r.close)) d += `${d ? 'L' : 'M'}${x(i).toFixed(1)},${y(r.close).toFixed(1)}`; });
  svg.append(svgEl('path', {d, class: 'lc-line'}));
  const li = rows.length - 1; svg.append(svgEl('circle', {cx: x(li), cy: y(rows[li].close), r: 4.5 * k, class: 'lc-dot'}));
  const tip = h('div', {class: 'lc-tip', hidden: true});
  const cursor = svgEl('line', {x1: 0, x2: 0, y1: top, y2: H - bottom, class: 'lc-cursor', visibility: 'hidden'});
  const hit = svgEl('rect', {x: left - 10, y: top, width: width - left - right + 20, height: H - top - bottom, class: 'lc-hit'});
  hit.addEventListener('pointermove', ev => { const r = svg.getBoundingClientRect(), px = (ev.clientX - r.left) * width / r.width; const i = Math.max(0, Math.min(li, Math.round((px - left) / Math.max(1, width - left - right) * li))); cursor.setAttribute('x1', x(i)); cursor.setAttribute('x2', x(i)); cursor.setAttribute('visibility', 'visible'); tip.hidden = false; tip.innerHTML = `<b>${esc(korDate(rows[i].date))}</b><br>종가 ${esc(won(rows[i].close))}`; tip.style.left = Math.min(r.width - 60, Math.max(60, x(i) * r.width / width)) + 'px'; tip.style.top = '0px'; });
  hit.addEventListener('pointerleave', () => { tip.hidden = true; cursor.setAttribute('visibility', 'hidden'); });
  svg.append(cursor, hit);
  container.replaceChildren(svg, tip);
  container.classList.add('lc-box');
  return svg;
}
