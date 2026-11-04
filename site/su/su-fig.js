/* 수르 — 움직이는 도식(빈 파일에서 새로 씀 · 주문 1616 [화면 짜임] 「1. 모든 화면을 움직이는 도식으로 만들어라 2. 그림이 화면 대부분을 차지하게 해라」)
   그림마다 네 박자 — b1 기(틀) → b2 승(값이 자람) → b3 전(그런데 — 기준 · 못 된 것) → b4 결(큰 값 표시) · 한 번만 · 박자마다 0.45초 · 모두 2초 안
   움직임은 css 한 번(transform · opacity · stroke-dashoffset) · 움직임 줄이기면 끝 모습 · 보안 규칙(글 속 style 없음 — 모양은 SVG 속성 · 색은 css 표)
   SVG 글은 21 넘게(320 폭에서 줄어도 17 넘게) */

const SVGNS = 'http://www.w3.org/2000/svg';
/** DOM — h('p', {class, text, ...}, ...kids) */
export function h(tag, attrs = {}, ...kids) {
  const e = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs ?? {})) {
    if (v == null || v === false) continue;
    if (k === 'text') e.textContent = String(v);
    else if (k === 'class') e.className = v;
    else e.setAttribute(k, v === true ? '' : String(v));
  }
  for (const c of kids.flat(4)) if (c != null && c !== false) e.append(c instanceof Node ? c : String(c));
  return e;
}
/** SVG — s('rect', {x, y, ...}, ...kids) · text 는 {text} */
export function s(tag, attrs = {}, ...kids) {
  const e = document.createElementNS(SVGNS, tag);
  for (const [k, v] of Object.entries(attrs ?? {})) {
    if (v == null || v === false) continue;
    if (k === 'text') e.textContent = String(v);
    else e.setAttribute(k, String(v));
  }
  for (const c of kids.flat(4)) if (c != null && c !== false) e.append(c);
  return e;
}
const fin = v => typeof v === 'number' && Number.isFinite(v);
const r1 = v => Math.round(v * 10) / 10;
/** 한글 줄 나누기 — 띄어쓰기 자리에서 max 글자 안쪽 */
export function wrap(t, max = 14) {
  const out = []; let line = '';
  for (const w of String(t ?? '').split(/\s+/).filter(Boolean)) {
    if ((line + ' ' + w).trim().length > max && line) { out.push(line); line = w; } else line = (line + ' ' + w).trim();
  }
  if (line) out.push(line);
  return out;
}
const txt = (x, y, t, cls = 'g-t', extra = {}) => s('text', {x, y, class: cls, ...extra, text: t});
const lines = (x, y, arr, cls, lh = 28, extra = {}) => arr.map((t, i) => txt(x, y + i * lh, t, cls, extra));
const svg = (w, hgt, label, ...kids) => s('svg', {class: 'su-svg', viewBox: `0 0 ${w} ${hgt}`, role: 'img', 'aria-label': label, preserveAspectRatio: 'xMidYMid meet'}, ...kids);
/** 그림 틀 — data-g(그림 넓이 셈) · 큰 그림(hero)은 화면 끝까지 · cap = 네 박자 글(기 · 승 · 전 · 결) */
export function fig(kind, label, body, {hero = false, cap = null, title = null} = {}) {
  return h('figure', {class: 'su-fig su-f-' + kind + (hero ? ' su-hero' : ''), 'aria-label': label},
    title ? h('h2', {class: 'su-ft', text: title}) : null,
    hero && cap ? h('ol', {class: 'su-beats', 'aria-hidden': 'true', 'data-g': 'beats'}, ['기', '승', '전', '결'].map((t, i) => h('li', {class: 'b' + (i + 1) + ' a-lit', text: t}))) : null, // 시안 4 — 네 칸이 박자대로 켜짐
    h('div', {class: 'su-g', 'data-g': kind}, body),
    cap ? h('figcaption', {class: 'su-cap'}, cap.filter(Boolean).map((t, i) => h('p', {class: 'b' + (i + 1) + ' a-up', text: t}))) : null);
}

/* ── 1 맞춤표 — 회사 × 조건(● 맞음 · ■ 못 맞음) · 기 틀 → 승 맞음 → 전 못 맞음 → 결 셈 ── */
export function matrix(comps, conds, {label = '회사와 조건', hero = false, cap = null, title = null} = {}) {
  const W = 390, rowH = comps.length ? Math.max(64, Math.min(104, Math.floor(300 / comps.length))) : 0, top = 132, left = 150, cw = (W - left - 64) / Math.max(1, conds.length);
  const H = top + rowH * comps.length + 30 + (comps.length ? 0 : 60);
  const head = conds.map((c, j) => s('g', {class: 'b1 a-fade'},
    s('circle', {cx: left + cw * j + cw / 2, cy: 44, r: 26, class: 'g-head'}), txt(left + cw * j + cw / 2, 52, String(j + 1), 'g-tn', {'text-anchor': 'middle'}),
    lines(left + cw * j + cw / 2, 96, wrap(c.short ?? '조건 ' + (j + 1), 5).slice(0, 2), 'g-ts', 24, {'text-anchor': 'middle'})));
  const rows = comps.map((r, i) => {
    const y = top + rowH * i, cy = y + rowH / 2, okN = conds.filter((_, j) => r.ok[j]).length;
    return s('g', {}, s('rect', {x: 8, y: y + 4, width: W - 16, height: rowH - 8, rx: 14, class: 'g-row b1 a-fade'}),
      lines(20, cy - (wrap(r.name, 6).length > 1 ? 6 : -8), wrap(r.name, 6).slice(0, 2), 'g-tb b1 a-fade', 26),
      conds.map((_, j) => r.ok[j]
        ? s('circle', {cx: left + cw * j + cw / 2, cy, r: 17, class: 'g-ok b2 a-pop'})
        : s('rect', {x: left + cw * j + cw / 2 - 15, y: cy - 15, width: 30, height: 30, rx: 3, class: 'g-no b3 a-pop'})),
      txt(W - 22, cy + 9, okN + '/' + conds.length, okN === conds.length ? 'g-tk g-okt b4 a-up' : 'g-tk b4 a-up', {'text-anchor': 'end'}));
  });
  const empty = comps.length ? null : txt(W / 2, top + 30, '오늘 조건에 맞춰 볼 회사가 없어요', 'g-t b2 a-fade', {'text-anchor': 'middle'});
  return fig('matrix', label, svg(W, H, label, head, rows, empty), {hero, cap, title});
}

/* ── 2 막대(가로) — 값 · 기준 표시(v2) · 기 이름 → 승 막대 → 전 기준 선 → 결 값 글 ── */
export function bars(rows, {label = '막대', unit = '', max = null, base = null, hero = false, cap = null, title = null, cur = null, href = null, signed = false} = {}) {
  const W = 390, rh = signed ? 70 : 62, top = 12, H = top + rh * rows.length + 16;
  const vals = rows.flatMap(r => [r.v, r.v2]).filter(fin), M = max ?? Math.max(1, ...vals.map(Math.abs)), x0 = signed ? 195 : 16, span = signed ? 110 : W - 32 - 92;
  const sx = v => (span * Math.min(1, Math.abs(v) / M));
  const g = rows.map((r, i) => {
    const y = top + rh * i, on = cur != null && r.key === cur, neg = signed && fin(r.v) && r.v < 0, wv = fin(r.v) ? Math.max(3, sx(r.v)) : 0;
    const bx = signed ? (neg ? x0 - wv : x0) : x0;
    const label = r.t ?? (fin(r.v) ? String(r1(r.v)) + unit : '?');
    const kids = [
      txt(signed ? 16 : x0, y + 22, wrap(r.name, 14)[0], 'g-ts b1 a-fade' + (on ? ' g-on' : '')),
      s('rect', {x: bx, y: y + 32, width: wv, height: 24, rx: 5, class: 'b2 ' + (signed && neg ? 'a-gxr' : 'a-gx') + ' ' + (r.cls ?? (on ? 'g-bar g-baron' : neg ? 'g-barneg' : 'g-bar'))}),
      fin(r.v2) ? s('rect', {x: x0 + sx(r.v2) - 2, y: y + 26, width: 4, height: 36, rx: 2, class: 'g-base b3 a-fade'}) : null,
      signed ? txt(neg ? x0 + 8 : x0 - 8, y + 52, label, 'g-tk b4 a-up' + (on ? ' g-on' : ''), {'text-anchor': neg ? 'start' : 'end'})
        : txt(W - 16, y + 52, label, 'g-tk b4 a-up' + (on ? ' g-on' : ''), {'text-anchor': 'end'})];
    return r.href && href ? s('a', {href: r.href, class: 'g-link'}, s('g', {}, kids)) : s('g', {}, kids);
  });
  const axis = signed ? s('line', {x1: x0, y1: 4, x2: x0, y2: H - 4, class: 'g-axis b1 a-fade'}) : null;
  const baseLine = fin(base) ? s('line', {x1: x0 + sx(base), y1: 4, x2: x0 + sx(base), y2: H - 4, class: 'g-baseline b3 a-fade'}) : null;
  return fig('bars', label, svg(W, H, label, axis, baseLine, g), {hero, cap, title});
}

/* ── 3 기둥(세로) — 달마다 꽃이 된 횟수 · 짧은 금 = 아무 회사 · 못한 달은 ■ 표 · 세는 중인 달은 빗금 ── */
export function cols(rows, {label = '달마다', hero = false, cap = null, title = null, mark = null, H = 440} = {}) {
  const W = 390, top = 76, bot = 70, L = 40, R = 12, n = Math.max(1, rows.length), cw = (W - L - R) / n, M = Math.max(10, ...rows.flatMap(r => [r.v, r.v2]).filter(fin));
  const y = v => top + (H - top - bot) * (1 - Math.min(1, v / M)), y0 = H - bot;
  const grid = [0, 25, 50].filter(v => v <= M).map(v => s('g', {class: 'b1 a-fade'}, s('line', {x1: L, y1: y(v), x2: W - R, y2: y(v), class: 'g-grid'}), txt(L - 6, y(v) + 7, String(v), 'g-tx', {'text-anchor': 'end'})));
  const g = rows.map((r, i) => {
    const x = L + cw * i, bw = Math.max(4, Math.min(cw - 5, n <= 6 ? cw * 0.6 : cw)), worse = fin(r.v) && fin(r.v2) && r.v < r.v2 && !r.open;
    return s('g', {},
      fin(r.v) ? s('rect', {x: x + 2, y: y(r.v), width: bw, height: Math.max(2, y0 - y(r.v)), rx: 3, class: 'b2 a-gy ' + (r.open ? 'g-open' : worse ? 'g-barneg' : 'g-bar') + (mark === r.key ? ' g-baron' : '')}) : null,
      fin(r.v2) ? s('rect', {x: x, y: y(r.v2) - 2, width: bw + 4, height: 4, rx: 2, class: 'g-base b3 a-fade'}) : null,
      worse ? s('rect', {x: x + bw / 2 - 5, y: y0 + 8, width: 10, height: 10, class: 'g-no b3 a-pop'}) : null,
      r.tick ? txt(x + bw / 2 + 2, y0 + 44, r.tick, 'g-tx', {'text-anchor': 'middle'}) : null,
      r.label && fin(r.v) ? txt(x + bw / 2 + 2, y(r.v) - 10, r.label, 'g-tk b4 a-up', {'text-anchor': 'middle'}) : r.label ? txt(x + bw / 2 + 2, y0 - 12, r.label, 'g-tx b4 a-up', {'text-anchor': 'middle'}) : null);
  });
  const legend = s('g', {class: 'b4 a-up'}, s('rect', {x: L, y: 8, width: 18, height: 18, rx: 3, class: 'g-bar'}), txt(L + 26, 25, '고른 회사', 'g-tx'),
    s('rect', {x: L + 150, y: 15, width: 22, height: 4, class: 'g-base'}), txt(L + 180, 25, '아무 회사', 'g-tx'));
  return fig('cols', label, svg(W, H, label, grid, s('line', {x1: L, y1: y0, x2: W - R, y2: y0, class: 'g-axis b1 a-fade'}), g, legend), {hero, cap, title});
}

/* ── 4 백 점 둘 — 100번에 몇 번(앞 = 고른 회사 · 뒤 = 아무 회사 · 같은 크기) ── */
export function waffle(a, b, {label = '100번에 몇 번', la = '고른 회사', lb = '아무 회사', hero = false, cap = null, title = null} = {}) {
  const W = 390, cell = 15, ch = hero ? 34 : 30, gap = 3, side = 10 * (cell + gap), sideY = 10 * (ch + gap), gx = [16, W - 16 - side], top = 56, H = top + sideY + 52; // 큰 그림은 칸을 키가 크게(첫 화면 끝까지 그림)
  const grid = (x0, n, cls, beat) => Array.from({length: 100}, (_, k) => {
    const i = k, cx = x0 + (i % 10) * (cell + gap), cy = top + Math.floor(i / 10) * (ch + gap), on = k < n; // 위에서부터 채움(첫 화면에 찬 칸이 먼저 보이게)
    return s('rect', {x: cx, y: cy, width: cell, height: ch, rx: 4, class: on ? cls + ' ' + beat + ' a-pop' : 'g-empty b1 a-fade'});
  });
  const A = fin(a) ? Math.round(a) : 0, Bn = fin(b) ? Math.round(b) : 0;
  return fig('waffle', label, svg(W, H, label,
    txt(gx[0], 36, wrap(la, 8)[0], 'g-tb b1 a-fade'), txt(gx[1], 36, wrap(lb, 8)[0], 'g-tb b1 a-fade'),
    grid(gx[0], A, 'g-ok', 'b2'), grid(gx[1], Bn, 'g-basefill', 'b3'),
    txt(gx[0], top + sideY + 34, fin(a) ? '100번에 ' + A + '번' : '?', 'g-tk b4 a-up'), txt(gx[1], top + sideY + 34, fin(b) ? '100번에 ' + Bn + '번' : '?', 'g-tk b4 a-up')), {hero, cap, title});
}

/* ── 5 한 달 줄 — 회사(굵은 줄) · 지수(가는 줄) · 오른쪽 끝 = 마지막 날 · 그 뒤는 비워 둠(앞날을 그리지 않음) ── */
export function line(co, idx, {label = '한 달 줄', name = '회사', iname = '지수', hero = false, cap = null, title = null, pctText = null} = {}) {
  const W = 390, H = 470, L = 16, R = 96, T = 40, Bt = 60, all = [...(co ?? []), ...(idx ?? [])].filter(fin), lo = Math.min(97, ...all), hi = Math.max(103, ...all);
  const x = (i, n) => L + (W - L - R) * (n <= 1 ? 0 : i / (n - 1)), y = v => T + (H - T - Bt) * (1 - (v - lo) / (hi - lo));
  const path = arr => (arr ?? []).map((v, i, a) => r1(x(i, a.length)) + ',' + r1(y(v))).join(' ');
  const base = s('line', {x1: L, y1: y(100), x2: W - R, y2: y(100), class: 'g-grid b1 a-fade'});
  const last = a => (Array.isArray(a) && a.length ? a[a.length - 1] : null);
  return fig('line', label, svg(W, H, label,
    s('rect', {x: W - R + 6, y: T, width: R - 14, height: H - T - Bt, rx: 10, class: 'g-future b1 a-fade'}),
    lines(W - R / 2 + 2, T + 40, ['앞날은', '비워', '둬요'], 'g-tx', 28, {'text-anchor': 'middle', class: 'g-tx b1 a-fade'}),
    base, txt(L, y(100) - 10, '처음 = 100', 'g-tx b1 a-fade'),
    idx ? s('polyline', {points: path(idx), class: 'g-idx b2 a-draw', pathLength: 1}) : null,
    co ? s('polyline', {points: path(co), class: 'g-co b3 a-draw', pathLength: 1}) : null,
    co ? s('circle', {cx: x(co.length - 1, co.length), cy: y(last(co)), r: 9, class: 'g-dot b4 a-pop'}) : null,
    txt(L, H - 22, name + ' ━  ' + iname + ' ─', 'g-tx b1 a-fade'),
    pctText ? txt(W - R - 4, Math.max(T + 26, y(last(co)) - 18), pctText, 'g-tk b4 a-up', {'text-anchor': 'end'}) : null), {hero, cap, title});
}

/* ── 6 달력 — 60거래일 · 날마다 ● 꽃이 됨 · ■ 못 됨 · ▲ 기다림 · 빈 칸 = 고른 회사 없음 ── */
export function cal(days, {label = '날마다', hero = false, cap = null, title = null, href = null} = {}) {
  const W = 390, cols5 = 5, cell = 66, gap = 6, L = 22, T = 56, n = days.length, rowsN = Math.ceil(n / cols5), H = T + rowsN * (cell / 2 + gap) + 30;
  const head = ['월', '화', '수', '목', '금'].map((d, j) => txt(L + j * (cell + gap) + cell / 2, 36, d, 'g-tx b1 a-fade', {'text-anchor': 'middle'}));
  const g = days.map((d, i) => {
    const x = L + (i % cols5) * (cell + gap), y = T + Math.floor(i / cols5) * (cell / 2 + gap), on = fin(d.n) && d.n > 0;
    const kind = !on ? 'g-empty' : d.hit > 0 && d.hit >= d.miss ? 'g-ok' : d.miss > 0 ? 'g-no' : 'g-wait';
    const beat = !on ? 'b1 a-fade' : kind === 'g-ok' ? 'b2 a-pop' : kind === 'g-no' ? 'b3 a-pop' : 'b4 a-pop';
    const box = s('rect', {x, y, width: cell, height: cell / 2, rx: 6, class: kind + ' ' + beat});
    return on && href ? s('a', {href: href(d), class: 'g-link'}, box) : box;
  });
  return fig('cal', label, svg(W, H, label, head, g), {hero, cap, title});
}

/* ── 7 나눔 막대 — 모두 → 꽃이 됨 · 못 됨(까닭 셋) ── */
export function split(total, hit, parts, {label = '꽃이 된 것과 못 된 것', hero = false, cap = null, title = null} = {}) {
  const W = 390, L = 16, span = W - 32, BH = 120, H = 150 + BH - 46 + parts.length * 74, sx = v => (fin(v) && fin(total) && total > 0 ? span * v / total : 0);
  let x = L + sx(hit);
  const big = parts.reduce((m, p, k) => (fin(p.v) && p.v > (parts[m]?.v ?? -1) ? k : m), 0);
  const segs = parts.map((p, k) => { const w = sx(p.v), r = s('rect', {x, y: 60, width: Math.max(2, w - 3), height: BH, rx: 4, class: 'g-no' + k + ' b3 a-gx'}); x += w; return r; });
  const y0 = 60 + BH + 30;
  return fig('split', label, svg(W, H, label,
    s('rect', {x: L, y: 60, width: span, height: BH, rx: 6, class: 'g-empty b1 a-fade'}), txt(L, 40, '모두 ' + (fin(total) ? total.toLocaleString('ko-KR') : '?') + '번', 'g-tb b1 a-fade'),
    s('rect', {x: L, y: 60, width: Math.max(2, sx(hit) - 3), height: BH, rx: 4, class: 'g-ok b2 a-gx'}), txt(L + 8, 60 + BH / 2 + 8, fin(hit) ? '꽃 ' + hit.toLocaleString('ko-KR') : '', 'g-tn b2 a-fade'), segs,
    parts.map((p, k) => s('g', {class: 'b3 a-up'}, s('rect', {x: L, y: y0 + k * 74, width: 30, height: 30, rx: 5, class: 'g-no' + k}),
      txt(L + 42, y0 + 22 + k * 74, p.name, 'g-ts' + (k === big ? ' g-on' : '')), txt(W - 16, y0 + 22 + k * 74, (fin(p.v) ? p.v.toLocaleString('ko-KR') : '?') + '번', 'g-tk' + (k === big ? ' g-on' : ''), {'text-anchor': 'end'}))),
    s('rect', {x: L - 6, y: y0 - 8 + big * 74, width: span + 12, height: 46, rx: 8, class: 'g-ring b4 a-fade'})), {hero, cap, title});
}

/* ── 8 여섯 칸 — 누가 · 언제 · 어디서 · 무엇을 · 어떻게 · 왜(빈 칸은 「확인 필요」) ── */
const ICON = {누가: 'M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8zm-7 9a7 7 0 0 1 14 0', 언제: 'M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18zm0 4v5l3 3', 어디서: 'M12 21s7-6 7-11a7 7 0 0 0-14 0c0 5 7 11 7 11zm0-9a2 2 0 1 0 0-4 2 2 0 0 0 0 4z',
  무엇을: 'M4 7l8-4 8 4v10l-8 4-8-4zM4 7l8 4 8-4M12 11v10', 어떻게: 'M4 19h16M7 16V9M12 16V5M17 16v-4', 왜: 'M9 9a3 3 0 1 1 4 3c-1 .5-1 1-1 2M12 18h.01'};
export function sixTiles(six, {label = '이 값의 여섯 칸', need = '확인 필요', title = '이 값의 여섯 칸', small = false} = {}) {
  const keys = ['누가', '언제', '어디서', '무엇을', '어떻게', '왜'], beat = ['b1', 'b1', 'b2', 'b2', 'b3', 'b4'];
  const holes = keys.filter(k => !six?.[k]).length;
  return h('figure', {class: 'su-fig su-six' + (small ? ' su-six-s' : ''), 'aria-label': label},
    title ? h('h2', {class: 'su-ft', text: title + (holes ? ' · ' + need + ' ' + holes + '칸' : ' · 다 채움')}) : null,
    h('ol', {class: 'su-g su-sixg', 'data-g': 'six'}, keys.map((k, i) => h('li', {class: 'su-st ' + beat[i] + ' a-pop' + (six?.[k] ? '' : ' su-need')},
      h('span', {class: 'su-sk'}, s('svg', {class: 'su-si', viewBox: '0 0 24 24', 'aria-hidden': 'true'}, s('path', {d: ICON[k]})), h('b', {text: k})),
      h('span', {class: 'su-sv', text: six?.[k] ?? need})))));
}

/* ── 9 미리 보기 카드(유튜브처럼) — 작은 한 달 줄 + 이름 + 까닭 칩 ── */
export function thumb(co, idx, label) {
  const W = 160, H = 90, all = [...(co ?? []), ...(idx ?? [])].filter(fin), lo = Math.min(98, ...all), hi = Math.max(102, ...all);
  const pts = a => (a ?? []).map((v, i, arr) => r1(6 + (W - 12) * (arr.length <= 1 ? 0 : i / (arr.length - 1))) + ',' + r1(8 + (H - 16) * (1 - (v - lo) / (hi - lo)))).join(' ');
  return s('svg', {class: 'su-svg su-thumb', viewBox: `0 0 ${W} ${H}`, role: 'img', 'aria-label': label, 'data-g': 'thumb'},
    s('rect', {x: 0, y: 0, width: W, height: H, rx: 10, class: 'g-thumbbg'}),
    idx ? s('polyline', {points: pts(idx), class: 'g-idx b1 a-draw', pathLength: 1}) : null,
    co ? s('polyline', {points: pts(co), class: 'g-co b2 a-draw', pathLength: 1}) : null);
}

/* ── 10 열한 질문 길 — 네 묶음(기 이유 · 승 돈 · 전 때 · 결 마음) · 지금 질문 표시 ── */
export function qpath(groups, {label = '열한 질문 네 묶음', cur = null, done = 0, hero = false, cap = null, title = null} = {}) {
  const W = 390, H = 128 + groups.length * 70, L = 24;
  let n = 0;
  const g = groups.map(([name, qs], k) => s('g', {class: 'b' + (k + 1) + ' a-up'}, txt(L, 60 + k * 70, name, 'g-tb'),
    qs.map((q, j) => { n++; const i = n, cx = 120 + j * 64, cy = 52 + k * 70; return s('g', {}, s('circle', {cx, cy, r: 24, class: i === cur ? 'g-cur' : i <= done ? 'g-ok' : 'g-empty'}), txt(cx, cy + 8, String(i), 'g-tn', {'text-anchor': 'middle'})); })));
  return fig('qpath', label, svg(W, H, label, g), {hero, cap, title});
}

/* ── 11 판정 셋 — 좋아 · 반만 · 쉬어(내 기록 수) ── */
export function tally3(items, {label = '판정', hero = false, cap = null, title = null} = {}) {
  const W = 390, H = 260, M = Math.max(1, ...items.map(x => x.v).filter(fin)), cw = 96, L = 36;
  return fig('tally3', label, svg(W, H, label, items.map((it, k) => {
    const x = L + k * (cw + 26), hgt = fin(it.v) ? 150 * it.v / M : 0;
    return s('g', {}, s('rect', {x, y: 40, width: cw, height: 150, rx: 10, class: 'g-empty b1 a-fade'}),
      s('rect', {x, y: 190 - hgt, width: cw, height: Math.max(2, hgt), rx: 10, class: it.cls + ' b2 a-gy'}),
      txt(x + cw / 2, 230, it.name, 'g-ts b3 a-fade', {'text-anchor': 'middle'}), txt(x + cw / 2, 30, (fin(it.v) ? it.v : 0) + '번', 'g-tk b4 a-up', {'text-anchor': 'middle'}));
  })), {hero, cap, title});
}

/* ── 12 깔때기(시안 3 · 5 · 6) — 코스피 · 코스닥 회사(점 무늬) → 조건 셋 → 모두 맞은 곳 · 가장 가까운 곳 ── */
export function funnel({total, conds = [], pick = [], near = [], miss = null, cap = null, label = '회사를 거르는 깔때기'}) {
  const W = 390, H = 440, n = pick.length, gy = [196, 236, 276], fx = y => 16 + (y - 170) * (149 / 140);
  const dots = s('pattern', {id: 'su-dots', width: 4.4, height: 4.4, patternUnits: 'userSpaceOnUse'}, s('circle', {cx: 2.2, cy: 2.2, r: 1.3, class: 'g-dotp'}));
  const gates = conds.slice(0, 3).map((c, j) => s('g', {class: 'b2 a-fade'},
    s('line', {x1: fx(gy[j]), y1: gy[j], x2: W - fx(gy[j]), y2: gy[j], class: 'g-gate'}),
    s('circle', {cx: W / 2, cy: gy[j], r: 15, class: c === miss ? 'g-no' : 'g-head'}), txt(W / 2, gy[j] + 7, String(j + 1), 'g-tn g-tn2', {'text-anchor': 'middle'})));
  const who = n ? pick : near;
  return fig('funnel', label, svg(W, H, label, s('defs', {}, dots),
    txt(16, 30, '코스피 · 코스닥 ' + (fin(total) ? total.toLocaleString('ko-KR') + '곳' : '회사'), 'g-tb b1 a-fade'),
    s('rect', {x: 16, y: 40, width: W - 32, height: 122, rx: 10, fill: 'url(#su-dots)', class: 'g-field b1 a-fade'}),
    s('polyline', {points: `16,170 ${fx(306)},306 ${W - fx(306)},306 ${W - 16},170`, class: 'g-funnel b2 a-draw', pathLength: 1}),
    gates,
    txt(16, 338, '조건 셋에 모두 맞은 곳', 'g-ts b3 a-fade'),
    txt(W - 16, 344, n + '곳', 'g-big b4 a-pop', {'text-anchor': 'end'}),
    who.length ? s('g', {class: 'b3 a-up'}, txt(16, 376, n ? '고른 곳' : '가장 가까운 곳 · 조건 하나 못 맞음', 'g-tx'),
      who.slice(0, 3).map((nm, i) => s('g', {}, s('circle', {cx: 26 + i * 124, cy: 410, r: 9, class: n ? 'g-ok' : 'g-wait'}), txt(40 + i * 124, 418, wrap(nm, 5)[0].slice(0, 5), 'g-tx')))) : null), {hero: true, cap});
}

/* ── 13 정직한 세 칸(시안 9) — 아무 회사 · 못했던 달 · 못 된 횟수(같은 크기 · 누르면 그 기록) ── */
export function honest3({base, rate, down, scored, miss, n, fall = null, fallBase = null} = {}) { // 숨기지 않는 네 칸(시안 9 장점) — 아무 회사 · 못한 달 · 못 된 때 · 크게 처진 때
  const two = (a, b, cls) => s('svg', {class: 'su-svg su-h3s', viewBox: '0 0 100 40', 'aria-hidden': 'true', 'data-g': 'h3'}, s('rect', {x: 0, y: 4, width: 100, height: 14, rx: 3, class: 'g-empty'}), s('rect', {x: 0, y: 4, width: fin(a) ? a : 0, height: 14, rx: 3, class: cls + ' b2 a-gx'}),
    s('rect', {x: 0, y: 24, width: 100, height: 14, rx: 3, class: 'g-empty'}), s('rect', {x: 0, y: 24, width: fin(b) ? b : 0, height: 14, rx: 3, class: 'g-basefill b3 a-gx'}));
  const mini = (kind) => {
    if (kind === 'b') return two(rate, base, 'g-ok');
    if (kind === 'f') return two(fall, fallBase, 'g-bad');
    if (kind === 'm') { const k = fin(scored) ? scored : 0; return s('svg', {class: 'su-svg su-h3s', viewBox: '0 0 100 40', 'aria-hidden': 'true', 'data-g': 'h3'}, Array.from({length: k}, (_, i) => s('rect', {x: (i % 11) * 9, y: Math.floor(i / 11) * 20 + 2, width: 7, height: 16, rx: 2, class: i < (fin(down) ? down : 0) ? 'g-no b3 a-pop' : 'g-bar b2 a-pop'}))); }
    return s('svg', {class: 'su-svg su-h3s', viewBox: '0 0 100 40', 'aria-hidden': 'true', 'data-g': 'h3'}, s('rect', {x: 0, y: 10, width: 100, height: 20, rx: 3, class: 'g-ok'}), s('rect', {x: fin(n) && fin(miss) && n > 0 ? 100 - 100 * miss / n : 100, y: 10, width: fin(n) && fin(miss) && n > 0 ? 100 * miss / n : 0, height: 20, rx: 3, class: 'g-no b3 a-gxr'}));
  };
  const tile = (href, kind, v, t) => h('a', {class: 'su-h3t', href}, mini(kind), h('b', {text: v}), h('span', {text: t}));
  return h('figure', {class: 'su-fig su-honest', 'aria-label': '그런데 · 숨기지 않는 네 칸'}, h('h2', {class: 'su-ft', text: '그런데 · 숨기지 않는 네 칸'}),
    h('div', {class: 'su-h3 su-h4'}, tile('#/r', 'b', fin(base) ? Math.round(base) + '번' : '?', '아무 회사도 100번에'),
      tile('#/r/m', 'm', fin(down) ? down + '달' : '?', '아무 회사보다 못했던 달'),
      tile('#/r/w', 'x', fin(miss) ? miss.toLocaleString('ko-KR') + '번' : '?', '조건에 맞고도 꽃이 못 됨'),
      fin(fall) ? tile('#/r', 'f', Math.round(fall) + '번', '100번에 시장보다 한참 덜 오름 · 아무 회사 ' + (fin(fallBase) ? Math.round(fallBase) + '번' : '?')) : null),
    h('p', {class: 'su-mean'}, h('i', {text: '그래서'}), h('span', {text: '좋은 숫자만 보여 주지 않는다는 뜻이에요. 못한 쪽도 같은 크기로 함께 봐요.'})));
}

/* ── 14 여섯 꽃잎(시안 7) — 찬 잎 = 채운 칸 · 점선 잎 = 「확인 필요」 ── */
export function dots6(six) {
  const keys = ['누가', '언제', '어디서', '무엇을', '어떻게', '왜'];
  return s('svg', {class: 'su-svg su-petal', viewBox: '-14 -14 28 28', 'aria-hidden': 'true'}, keys.map((k, i) =>
    s('ellipse', {cx: 0, cy: -7, rx: 3.6, ry: 6.2, transform: `rotate(${i * 60})`, class: six?.[k] ? 'g-pf' : 'g-pe'})), s('circle', {cx: 0, cy: 0, r: 2.6, class: 'g-pc'}));
}

/* ── 15 여섯 칸 지도(시안 8) — 이 쪽 값마다 여섯 칸 · 빈 칸이 한눈에 ── */
export function sixMap(vals, {label = '이 쪽 값의 여섯 칸 지도'} = {}) {
  const keys = ['누가', '언제', '어디서', '무엇을', '어떻게', '왜'], beat = ['b1', 'b1', 'b2', 'b2', 'b3', 'b4'];
  const vs = (vals ?? []).filter(v => v && v.six);
  if (!vs.length) return null;
  const holes = vs.reduce((a, v) => a + keys.filter(k => !v.six[k]).length, 0);
  const grid6 = (cells) => h('span', {class: 'su-sm6'}, cells);
  return h('figure', {class: 'su-fig su-smap', 'aria-label': label},
    h('h2', {class: 'su-ft', text: '여섯 칸 지도 · 값 ' + vs.length + '개 · ' + (holes ? '확인 필요 ' + holes + '칸' : '다 채움')}),
    h('div', {class: 'su-g su-smg', 'data-g': 'smap'},
      h('p', {class: 'su-smh'}, h('b', {text: '칸 차례 '}), keys.join(' · ')),
      vs.map(v => { const n = keys.filter(k => !v.six[k]).length;
        return h('p', {class: 'su-smr'}, h('span', {class: 'su-sml'}, h('b', {text: v.label || '값'}), n ? h('em', {class: 'su-needt', text: ' 확인 필요 ' + n + '칸'}) : null),
          grid6(keys.map((k, i) => h('span', {class: 'su-smc ' + beat[i] + ' a-pop' + (v.six[k] ? '' : ' su-need'), role: 'img', 'aria-label': k + (v.six[k] ? ' 채움' : ' 확인 필요')})))); })),
    h('p', {class: 'su-mean'}, h('i', {text: '그래서'}), h('span', {text: holes ? '빈 칸 ' + holes + '개는 자료가 없어서 「확인 필요」로 남겼다는 뜻이에요. 지어서 채우지 않았어요.' : '이 쪽 값은 여섯 칸이 다 찼다는 뜻이에요.'})));
}
