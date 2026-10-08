/* ATLAS 11 · 공통 차트 부품 — 2026-10-09 「ATLAS 업데이트 실행 프롬프트」(사장님 01:41 마카오 시각 첨부) 0-F · 0-G · 7
   옛 그림(봉화대 · 산수화 · 방패연 · 풍등 · 구슬 그릇 · 달 · 매듭 · 항아리 · 돌계단)을 같은 축 막대 · 분포 · 날짜 축 · 시간순 기록으로 바꿈
   · 이름 · 숫자 · 눈금은 HTML(또렷함 · 73개 말 번역 · 화면 읽기) · 막대 자리와 길이는 CSS 변수(CSSOM — 글 속 style 속성 없음 · CSP)
   · 빨강 = 오름 · 파랑 = 내림 — 부호와 단위를 늘 함께 씀(색만으로 뜻을 전하지 않음) · 0 줄은 늘 그림 · 한 차트 안 막대는 같은 축
   · 걸음(data-at)이 같은 줄들은 한 묶음(.bc-grp)으로 — 재생 때 한 번에 하나만 움직이게(art.js) */
import {h, finite} from './util.js';

export const sideOf = v => (finite(v) ? (v > 0 ? 'up' : v < 0 ? 'down' : 'flat') : 'na');
const P = v => `${v.toFixed(2)}%`;
/** 축 — 값들과 0 을 모두 담는 [lo, hi] · 양 끝에 조금 여백 · 값이 없으면 ±1 */
export function axisOf(vals, {pad = 0.04} = {}) {
  const v = (vals ?? []).filter(finite); let lo = Math.min(0, ...v), hi = Math.max(0, ...v);
  if (hi - lo < 1e-9) { lo = -1; hi = 1; }
  const span = hi - lo; return {lo: lo < 0 ? lo - span * pad : lo, hi: hi > 0 ? hi + span * pad : hi};
}
export const posOf = (ax, v) => Math.max(0, Math.min(100, ((v - ax.lo) / (ax.hi - ax.lo)) * 100));
const setL = (el, v) => { el.style.setProperty('--l', P(v)); return el; };
/** 막대 한 개 — 0 에서 v 까지(값이 없으면 빈 칸 · 0 으로 그리지 않음) */
export function barEl(ax, v, cls = '') {
  const b = h('span', {class: `bc-bar ${sideOf(v)}${cls ? ' ' + cls : ''}`});
  if (finite(v)) { const a = posOf(ax, 0), z = posOf(ax, v); b.style.setProperty('--l', P(Math.min(a, z))); b.style.setProperty('--w', P(Math.max(0.6, Math.abs(z - a)))); }
  else b.classList.add('bc-none');
  return b;
}
/** 막대 길 하나(0 줄 · 막대 · 기준 점선들) */
export function trackEl(ax, v, refs = [], cls = '') {
  const t = h('span', {class: 'bc-track', 'aria-hidden': 'true'}, setL(h('span', {class: 'bc-zero'}), posOf(ax, 0)), barEl(ax, v, cls));
  for (const f of refs) if (finite(f.v)) t.append(setL(h('span', {class: 'bc-ref' + (f.cls ? ' ' + f.cls : '')}), posOf(ax, f.v)));
  return t;
}
/** 줄 하나 — 이름(링크) · 값 · 막대 · 작은 글(sub) · 표시(tag) */
function rowEl(r, ax, refs) {
  const name = r.ident ? h('span', {'data-ident': ''}, r.name) : r.name;
  return h('div', {class: `bc-row${r.cls ? ' ' + r.cls : ''}${r.ex ? ' is-ex' : ''}`, 'data-id': r.id ?? null, 'data-at': r.grp ? null : r.at == null ? null : String(r.at)},
    h('p', {class: 'bc-top'}, r.rank != null ? h('span', {class: 'bc-rk'}, r.rank) : null,
      r.href ? h('a', {class: 'bc-name', href: r.href}, name) : h('span', {class: 'bc-name'}, name),
      r.tag ? h('span', {class: 'bc-tag'}, r.tag) : null,
      h('b', {class: `bc-val ${r.ex ? 'na' : sideOf(r.v)}`}, r.txt)),
    trackEl(ax, r.ex ? null : r.v, refs, r.mine ? 'bc-mine' : ''),
    r.sub ? h('p', {class: 'bc-sub'}, r.sub) : null);
}
/** 같은 축 막대 줄들 — rows = [{id, name, ident, href, v, txt, sub, tag, rank, cls, at, ex, mine}] · refs = [{v, cls}](세로 점선 — 뜻은 keyEl 로 적음)
 *  걸음(at)이 같은 이웃 줄은 한 묶음(.bc-grp[data-at]) */
export function barRows(rows, {ax = axisOf(rows.map(r => (r.ex ? null : r.v))), refs = [], cls = ''} = {}) {
  const out = []; let grp = null;
  rows.forEach((r, i) => {
    const same = r.at != null && rows.filter(x => x.at === r.at).length > 1;
    if (same) { if (!grp || grp.dataset.at !== String(r.at)) { grp = h('div', {class: 'bc-grp', 'data-at': String(r.at)}); out.push(grp); } grp.append(rowEl({...r, grp: true}, ax, refs)); }
    else { grp = null; out.push(rowEl(r, ax, refs)); }
    void i;
  });
  return h('div', {class: 'bc' + (cls ? ' ' + cls : '')}, ...out);
}
/** 보기표 한 줄 — [{cls, label}] (점선 · 칠한 칸이 무엇인지 · 글로) */
export const keyEl = (items, at = null) => h('p', {class: 'bc-key', 'data-at': at == null ? null : String(at)}, ...items.filter(Boolean).flatMap((x, i) => [i ? ' ' : null, h('span', {class: 'bc-ki'}, h('i', {class: 'bc-sw ' + (x.cls ?? ''), 'aria-hidden': 'true'}), x.label)]));

/** 분포(같은 폭 구간 막대) — vals(% 숫자) · step(구간 폭) · lim(±lim 밖은 양 끝 한 칸씩) · marks = [{v, cls, at}](세로 선 — 뜻은 이름표 글)
 *  구간 = (아래, 위] · 정확히 0 은 「0 이하」 칸이 아니라 따로 세지 않고 0 위 칸(보합 1곳 같은 값이 빨강으로 보이지 않게 회색) */
export function histoEl(vals, {step = 5, lim = 30, marks = [], at = 0} = {}) {
  const v = (vals ?? []).filter(finite), inner = Math.round((2 * lim) / step), n = inner + 2;
  const bins = Array.from({length: n}, (_, k) => ({k, lo: k === 0 ? -Infinity : -lim + (k - 1) * step, hi: k === n - 1 ? Infinity : -lim + k * step, c: 0, z: 0}));
  for (const x of v) { const b = x === 0 ? bins.find(y => y.lo <= 0 && 0 < y.hi) : x < -lim ? bins[0] : x > lim ? bins[n - 1] : bins.find(y => y.lo < x && x <= y.hi); if (!b) continue; if (x === 0) b.z++; else b.c++; }
  const mx = Math.max(1, ...bins.map(b => b.c + b.z));
  const col = b => { const side = b.hi <= 0 ? 'down' : b.lo >= 0 ? 'up' : 'flat', c = h('span', {class: `hg-col ${side}${b.k === 0 || b.k === n - 1 ? ' hg-out' : ''}`}); c.style.setProperty('--k', ((b.c + b.z) / mx).toFixed(4)); return c; };
  const xOf = x => ((x < -lim ? 0.5 : x > lim ? n - 0.5 : 1 + (x + lim) / step) / n) * 100;
  const plot = h('div', {class: 'hg-plot', 'aria-hidden': 'true'}, h('div', {class: 'hg-cols', 'data-at': String(at)}, ...bins.map(col)),
    ...marks.filter(m => finite(m.v)).map(m => setL(h('span', {class: 'hg-mark ' + (m.cls ?? ''), 'data-at': m.at == null ? null : String(m.at)}), xOf(m.v))));
  plot.style.setProperty('--n', String(n));
  const ticks = h('div', {class: 'hg-ticks', 'aria-hidden': 'true'}, ...[-lim, -lim / 2, 0, lim / 2, lim].map(t => setL(h('span', {class: 'hg-tk'}, `${t > 0 ? '+' : t < 0 ? '−' : ''}${Math.abs(t)}%`), xOf(t))));
  return {el: h('div', {class: 'hg'}, plot, ticks), bins, xOf};
}

/** 날짜 축(오늘 → 앞으로 days 일) — events = [{date, level, top}] 점 · 가장 중요한 일정은 테 · 눈금은 그 달의 날짜(HTML) */
export function dateAxisEl(day, events, {days = 60, at = 0, atTop = 1} = {}) {
  const t0 = Date.parse(day), x = d => Math.max(0, Math.min(100, ((Date.parse(d) - t0) / 864e5 / days) * 100));
  const line = h('div', {class: 'da-line', 'data-at': at == null ? null : String(at)}, ...events.filter(e => !e.top).map(e => setL(h('span', {class: `da-dot lv${e.level ?? 1}`}), x(e.date))));
  const top = events.find(e => e.top);
  const mark = top ? setL(h('span', {class: `da-dot da-top lv${top.level ?? 1}`, 'data-at': atTop == null ? null : String(atTop)}), x(top.date)) : null;
  const tk = [0, 0.5, 1].map(k => { const d = new Date(t0 + k * days * 864e5).toISOString().slice(0, 10); return setL(h('span', {class: 'da-tk'}, `${Number(d.slice(5, 7))}월 ${Number(d.slice(8, 10))}일`), k * 100); });
  return h('div', {class: 'da', 'aria-hidden': 'true'}, h('div', {class: 'da-plot'}, h('span', {class: 'da-base'}), line, mark), h('div', {class: 'da-ticks'}, ...tk));
}

/** 시간순 기둥(날마다 · 기록마다) — items = [{key, label, parts: [{v, cls}], at}] · 높이 = 합 ÷ 가장 큰 합 · 이름은 눈금(HTML) */
export function columnsEl(items, {at = null} = {}) {
  const mx = Math.max(1, ...items.map(it => it.parts.reduce((t, p) => t + (finite(p.v) ? p.v : 0), 0)));
  const col = it => { const c = h('span', {class: 'cl-col', 'data-key': it.key ?? null, 'data-at': it.at == null ? null : String(it.at)}, ...it.parts.filter(p => finite(p.v) && p.v > 0).map(p => { const s = h('span', {class: 'cl-seg ' + (p.cls ?? '')}); s.style.setProperty('--k', (p.v / mx).toFixed(4)); return s; })); return c; };
  const labs = items.map(it => it.label).filter(Boolean); // 눈금 글은 처음 · 끝 둘만(양 끝에 붙임 — 좁은 기둥 칸에 글을 넣어 잘리지 않게)
  const wrap = h('div', {class: 'cl', 'aria-hidden': 'true'}, h('div', {class: 'cl-cols', 'data-at': at == null ? null : String(at)}, ...items.map(col)), h('div', {class: 'cl-ticks'}, ...[labs[0], labs.length > 1 ? labs.at(-1) : null].filter(Boolean).map(t => h('span', {class: 'cl-tk'}, t))));
  wrap.style.setProperty('--n', String(Math.max(1, items.length)));
  return wrap;
}

/** 칸 하나 = 값 하나(지도 · 2D 열지도) — cells = [{id, name, href, v, txt, at}] · 색 세기 = |값| ÷ 가장 큰 |값| */
export function heatEl(cells, {cols = 3} = {}) {
  const mx = Math.max(1e-9, ...cells.map(c => (finite(c.v) ? Math.abs(c.v) : 0)));
  const grid = h('div', {class: 'hm'}, ...cells.map(c => { const el = h(c.href ? 'a' : 'span', {class: `hm-c ${sideOf(c.v)}`, href: c.href ?? null, 'data-id': c.id ?? null, 'data-at': c.at == null ? null : String(c.at)},
    h('span', {class: 'hm-n'}, c.name), h('b', {class: 'hm-v'}, c.txt)); el.style.setProperty('--k', (finite(c.v) ? 0.12 + 0.6 * (Math.abs(c.v) / mx) : 0).toFixed(3)); return el; }));
  grid.style.setProperty('--cols', String(cols));
  return grid;
}
