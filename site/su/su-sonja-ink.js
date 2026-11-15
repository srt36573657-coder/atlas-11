/* 손자병법 먹그림(주문 1116-0118 · 빈 파일에서 새로 그림 · 남의 옛 그림을 베끼지 않음)
   사장님 2026-11-16(마카오) 00:18 「지금 글이 너무 많다 그로 설명 되어 있는것을 손자뵹법에 어울리는 고전 그림으로 변경해서 하나에 서사가 이어지도록 하라」 · 00:20 「맞아」
   (원문 docs/design/sonja-ink-2026-11-15/order-0118.txt)
   한 장수의 이야기 — 제1장 땅을 살피다(첫 쪽 형세) → 제2장 꾀를 고르다(꾀 두루마리) → 제3장 꾀를 펼치다(꾀 쪽) → 제4장 성을 살피다(회사 쪽) → 장부(정산)
   · 붓 한 획 = 가늘게 들어가 굵어졌다 가늘게 빠지는 면(stroke) · 먹 번짐 = 옅은 먹 면 겹침(fill-opacity) · 안개 = 한지 색 띠
   · 이야기의 한 사람 = 손무(사장님 2026-11-16 00:32 손무 초상을 기준으로 줌 — 「이사진이 손무 선생이다 … 단 이그림 이 기준이다」 · 기준의 모습만 따라 새로 그림 · 베끼지 않음)
   · 빨강 0(한국에서 빨강은 오름) · 그림 속 글은 짧은 이름표만(18 넘게)
   · 그림 뜻은 그림 밖 글이 없어도 통하게: 깃발 열 가운데 선 깃발 = 오른 몫 · 화살 열 가운데 꺾인 화살 = 잃은 몫 · 디딤돌 스물 = 지난 스무 날
   보안 규칙: innerHTML 없음 · 글 속 style 없음(색 · 짙기는 SVG 속성) · 다른 주소 0 */
import {s} from '/su/su-fig.js';

export const INK = '#3B1A14', NAVY = '#1F2A44', PAPER = '#F1E3D3', ACC = '#8A5A44', SOFT = '#B8A08E';
const r1 = v => Math.round(v * 10) / 10;
/** 씨앗 있는 흔들림(그릴 때마다 같은 그림) */
const rng = seed => { let x = (seed * 2654435761) >>> 0 || 1; return () => { x ^= x << 13; x >>>= 0; x ^= x >> 17; x ^= x << 5; x >>>= 0; return x / 4294967296; }; };
/** 점 줄 → 부드러운 곡선 위 점들(캣멀롬) */
function spline(P, n = 18) {
  if (P.length < 2) return P;
  const out = [], seg = P.length - 1;
  for (let i = 0; i < seg; i++) {
    const p0 = P[Math.max(0, i - 1)], p1 = P[i], p2 = P[i + 1], p3 = P[Math.min(P.length - 1, i + 2)], m = Math.max(2, Math.round(n / seg));
    for (let j = 0; j < m; j++) {
      const t = j / m, t2 = t * t, t3 = t2 * t;
      out.push([0.5 * (2 * p1[0] + (-p0[0] + p2[0]) * t + (2 * p0[0] - 5 * p1[0] + 4 * p2[0] - p3[0]) * t2 + (-p0[0] + 3 * p1[0] - 3 * p2[0] + p3[0]) * t3),
        0.5 * (2 * p1[1] + (-p0[1] + p2[1]) * t + (2 * p0[1] - 5 * p1[1] + 4 * p2[1] - p3[1]) * t2 + (-p0[1] + 3 * p1[1] - 3 * p2[1] + p3[1]) * t3)]);
    }
  }
  out.push(P[P.length - 1]);
  return out;
}
const smooth = t => t * t * (3 - 2 * t);
/** 붓 한 획의 면 — w = 가장 굵은 넓이 · a/b = 처음 · 끝 굵기 몫 · peak = 가장 굵은 자리 */
function strokeD(P, w, {a = 0.2, b = 0.12, peak = 0.3, n = 22} = {}) {
  const Q = spline(P, n), L = [], R = [], N = Q.length;
  for (let i = 0; i < N; i++) {
    const p = Q[i], q = Q[Math.min(N - 1, i + 1)], o = Q[Math.max(0, i - 1)];
    let dx = q[0] - o[0], dy = q[1] - o[1]; const d = Math.hypot(dx, dy) || 1; dx /= d; dy /= d;
    const t = N > 1 ? i / (N - 1) : 0, k = t < peak ? a + (1 - a) * smooth(t / peak) : 1 + (b - 1) * smooth((t - peak) / (1 - peak)), hw = (w * k) / 2;
    L.push([p[0] - dy * hw, p[1] + dx * hw]); R.push([p[0] + dy * hw, p[1] - dx * hw]);
  }
  const pts = [...L, ...R.reverse()];
  return 'M' + pts.map(p => r1(p[0]) + ' ' + r1(p[1])).join('L') + 'Z';
}
/** 붓 한 획 */
export const br = (P, w, o = {}) => s('path', {d: strokeD(P, w, o), fill: o.c ?? INK, ...(o.al != null ? {'fill-opacity': o.al} : {}), ...(o.cls ? {class: o.cls} : {})});
/** 먹 면(번짐) — 닫힌 점 줄 */
export const wash = (P, al = 0.12, c = INK) => s('path', {d: 'M' + spline(P, Math.max(24, P.length * 6)).map(p => r1(p[0]) + ' ' + r1(p[1])).join('L') + 'Z', fill: c, 'fill-opacity': al});
const dot = (x, y, r, al = 1, c = INK) => s('circle', {cx: r1(x), cy: r1(y), r: r1(r), fill: c, ...(al < 1 ? {'fill-opacity': al} : {})});
const ring = (x, y, r, w = 1.6, c = INK, al = 1) => s('circle', {cx: r1(x), cy: r1(y), r: r1(r), fill: 'none', stroke: c, 'stroke-width': w, ...(al < 1 ? {'stroke-opacity': al} : {})});
const line = (x1, y1, x2, y2, w = 1.4, c = INK, al = 1) => s('line', {x1: r1(x1), y1: r1(y1), x2: r1(x2), y2: r1(y2), stroke: c, 'stroke-width': w, 'stroke-linecap': 'round', ...(al < 1 ? {'stroke-opacity': al} : {})});
const g = (tr, ...kids) => s('g', tr ? {transform: tr} : {}, ...kids.flat().filter(Boolean));
const at = (x, y, sc = 1, rot = 0) => 'translate(' + r1(x) + ' ' + r1(y) + ')' + (rot ? ' rotate(' + rot + ')' : '') + (sc !== 1 ? ' scale(' + sc + ')' : '');
/* ── 움직임(주문 1116-0209 — 사장님 01:09 「… 지금 그린그림들이 상황애 맞게 3단애서 7간으로 자연스럽게 움직이게 …」 · 01:12 「응」)
   · 그림이 화면에 들어오면 한 번 놀고 멈춤(단계 1 ~ 7 · 단계마다 0.5초) · 움직임은 변환이 없는 감싼 묶음(g.ik-m)에만 — 제자리 변환(transform 속성)을 덮지 않게
   · 움직이기 전 모습 = 끝 모습(바른 셈 · 움직임이 없는 휴대폰도 같은 그림) · 휴대폰에서 움직임을 줄여 두면 멈춘 그림 그대로(su-sonja.css)
   · 무엇이 어떻게 움직이나 = 그림 부품 이름(data-mo) → 움직임(MO) · 꾀 그림마다 따로 정한 움직임(ANIM) */
const mo = (name, el) => { el?.setAttribute?.('data-mo', name); return el; };
/** 감싼 묶음 — motion(움직임 이름) · st(단계 1 ~ 7 또는 차례 이름 'ik-bq3' 같은 것) */
export const M = (motion, st, ...kids) => s('g', {class: 'ik-m ik-' + motion + ' ' + (typeof st === 'number' ? 'ik-s' + Math.max(1, Math.min(7, st | 0)) : st)}, ...kids.flat().filter(Boolean));
let IO = null;
const lessMotion = () => { try { return matchMedia('(prefers-reduced-motion: reduce)').matches; } catch { return false; } };
/** 그림 하나를 지켜봄 — 화면 가까이 오면 ik-play(한 번) · 지켜볼 수 없으면 끝 모습 그대로 */
export function watch(svg) {
  svg.classList.add('ik-anim');
  if (typeof IntersectionObserver !== 'function' || lessMotion()) return svg;
  svg.classList.add('ik-wait'); // 처음 칠할 때 끝 모습이 한 번 번쩍이지 않게(지켜볼 수 있을 때만 · 화면 가까이 오면 ik-play)
  IO ??= new IntersectionObserver(es => { for (const e of es) if (e.isIntersecting) { e.target.classList.add('ik-play'); IO.unobserve(e.target); } }, {rootMargin: '0px', threshold: 0.2});
  IO.observe(svg);
  return svg;
}
/** 그림 부품 → 움직임(상황에 맞게: 배는 나아가고 · 불은 일렁이고 · 새는 날아들고 · 깃발은 서고 · 나무는 자람) */
const MO = Object.freeze({ground: 'fade', hills: 'fade', mountain: 'rise', mist: 'drift', waves: 'drift', moon: 'glow', sun: 'glow', general: 'walk', walker: 'walk', sitter: 'rise',
  boat: 'sail', castle: 'rise', gate: 'rise', pavilion: 'rise', tent: 'rise', roof: 'drop', frame: 'rise', brick: 'drop', steps: 'rise', road: 'fade', cliff: 'rise', cage: 'drop', shield: 'rise', cauldron: 'rise', logs: 'drop', qin: 'rise',
  pine: 'grow', tree: 'grow', bare: 'grow', grass: 'grow', blossom: 'pop', peony: 'pop', fire: 'flicker', drum: 'beat', sound: 'pulse', sword: 'strike', staff: 'strike', hand: 'strike', fan: 'sway',
  sheep: 'walk', tiger: 'walk', rope: 'drop', chain: 'drop', net: 'drop', snake: 'rear', bird: 'fly', cicada: 'fly', jade: 'glow', fish: 'swim', shell: 'fade', letter: 'drop', ladder: 'rise', bigFlag: 'wave', bundle: 'drop', arrowsOut: 'shoot', scarecrow: 'sway',
  banner: 'stand', bannerDn: 'lean', arrow: 'shoot', stone: 'pop'});
export const MOTIONS = Object.freeze(['fade', 'rise', 'sail', 'sailL', 'drift', 'flicker', 'fly', 'flyL', 'stand', 'lean', 'grow', 'drop', 'sway', 'pulse', 'glow', 'walk', 'walkL', 'swim', 'beat', 'strike', 'rear', 'wave', 'shoot', 'snap', 'pop', 'wipe', 'wipeL', 'roll', 'tie', 'shake', 'none']);
const moOf = el => { const m = el?.getAttribute?.('data-mo'); if (m) return m; const c = el?.getAttribute?.('class') ?? ''; return /ik-bn/.test(c) ? (/ik-dn/.test(c) ? 'bannerDn' : 'banner') : /ik-ar/.test(c) ? 'arrow' : /ik-st/.test(c) ? 'stone' : null; };
/** 꾀 그림 부품들을 단계대로 감쌈 — spec[i] = [움직임, 단계](없으면 부품 이름으로 · 차례대로 3 ~ 7 단계) */
function wrapItems(items, spec) {
  const n = items.length, S = Math.min(7, Math.max(3, n));
  return items.map((el, i) => {
    const sp = Array.isArray(spec?.[i]) ? spec[i] : null, m = moOf(el), motion = sp && MOTIONS.includes(sp[0]) ? sp[0] : MO[m] ?? 'fade';
    if (motion === 'none') return el;
    return M(motion, sp && Number.isFinite(sp[1]) ? sp[1] : m === 'ground' || m === 'hills' ? 1 : 1 + Math.floor((i * S) / n), el);
  });
}
/** 그림 속 이름표(글 — 18 넘게 · 먹 색 · 가운데 맞춤 기본) */
export const label = (x, y, t, {size = 19, anchor = 'middle', c = INK, weight = 700, cls = 'ik-t'} = {}) => s('text', {x: r1(x), y: r1(y), 'font-size': size, 'text-anchor': anchor, fill: c, 'font-weight': weight, class: cls, text: t});

/* ── 산 · 물 · 안개 ── */
/** 산줄기 — 봉우리 점 줄(ridge)에서 바닥(base)까지 옅은 먹 면 · 등선 붓 획 · 결 획(준) */
export function mountain(ridge, base, {al = 0.13, w = 3.2, seed = 1, tex = 6, edge = 1} = {}) {
  const R = rng(seed), area = [...ridge, [ridge[ridge.length - 1][0], base], [ridge[0][0], base]];
  const kids = [wash(area, al)];
  if (edge) kids.push(br(ridge, w, {a: 0.15, b: 0.1, peak: 0.4, al: 0.9}));
  for (let i = 0; i < tex; i++) { // 결 — 등선 아래 짧은 비낀 획
    const j = 1 + Math.floor(R() * (ridge.length - 2)), p = ridge[j], d = 10 + R() * 22, x = p[0] + (R() - 0.5) * 18;
    kids.push(br([[x, p[1] + 6], [x - 4 - R() * 6, p[1] + 6 + d * 0.5], [x - 8 - R() * 8, p[1] + 6 + d]], 1.6 + R() * 1.4, {a: 0.3, b: 0.1, al: 0.45}));
  }
  return mo('mountain', g(null, kids));
}
/** 먼 산(옅음 · 등선 없음) */
export const farHills = (ridge, base, al = 0.07) => mo('hills', wash([...ridge, [ridge[ridge.length - 1][0], base], [ridge[0][0], base]], al));
/** 안개 띠(한지 색) */
export const mist = (x, y, w, h, al = 0.82) => s('ellipse', {cx: r1(x), cy: r1(y), rx: r1(w / 2), ry: r1(h / 2), fill: PAPER, 'fill-opacity': al, 'data-mo': 'mist'});
/** 물결 — 가는 획 여러 줄 */
export function waves(x0, x1, y, {rows = 3, amp = 3, gap = 9, seed = 2, al = 0.7, w = 1.3} = {}) {
  const R = rng(seed), kids = [];
  for (let r = 0; r < rows; r++) {
    const yy = y + r * gap, xs = x0 + R() * 14, xe = x1 - R() * 14, P = [];
    for (let x = xs; x <= xe; x += 12) P.push([x, yy + Math.sin((x + r * 7) / 8) * amp]);
    if (P.length > 1) kids.push(br(P, w + R() * 0.8, {a: 0.2, b: 0.2, peak: 0.5, al: al - r * 0.12}));
  }
  return mo('waves', g(null, kids));
}
export const moon = (x, y, r) => mo('moon', g(null, dot(x, y, r + 7, 0.06), s('circle', {cx: r1(x), cy: r1(y), r: r1(r), fill: PAPER, stroke: INK, 'stroke-width': 1.3, 'stroke-opacity': 0.55})));
export const sun = (x, y, r) => mo('sun', g(null, dot(x, y, r + 8, 0.07, ACC), dot(x, y, r, 0.55, ACC)));

/* ── 장수(뒷모습 실루엣 · 얼굴 0) ── */
/** 장수 — 발 자리(x, y) · 키 = 100 × sc · 창과 깃발 · facing = -1 이면 왼쪽을 봄 */
export function general(x, y, sc = 1, {facing = -1, flag = true, spear = true} = {}) {
  const f = facing;
  const body = s('path', {fill: INK, d: 'M-12 -8 C-14 -26 -15 -46 -13 -58 C-11 -66 -6 -70 0 -70 C6 -70 11 -66 13 -58 C15 -46 15 -26 13 -8 C8 -4 -6 -4 -12 -8Z'}); // 망토
  const hem = br([[-14, -10], [-4, -2], [8, -4], [16, -12]], 3, {a: 0.6, b: 0.3, peak: 0.5});
  const head = s('path', {fill: INK, d: 'M-7 -72 C-8 -80 -5 -86 0 -86 C5 -86 8 -80 7 -72 Z'}); // 투구
  const plume = br([[0, -86], [3 * f, -93], [9 * f, -96], [15 * f, -94]], 3.4, {a: 0.5, b: 0.15, peak: 0.35}); // 투구 술
  const brim = br([[-10, -72], [0, -70], [10, -72]], 3.2, {a: 0.6, b: 0.6, peak: 0.5});
  const legs = [br([[-5, -6], [-6, 0]], 4, {a: 1, b: 0.8}), br([[5, -6], [6, 0]], 4, {a: 1, b: 0.8})];
  const sx = 16 * -f;
  const sp = spear ? [br([[sx, 2], [sx + 2 * -f, -60], [sx + 3 * -f, -128]], 2.6, {a: 0.9, b: 0.6, peak: 0.5}), s('path', {fill: INK, d: `M${sx + 3 * -f - 3} -126 L${sx + 3 * -f} -140 L${sx + 3 * -f + 3} -126Z`})] : [];
  const fl = spear && flag ? s('path', {fill: ACC, 'fill-opacity': 0.85, d: `M${sx + 3 * -f} -122 C${sx + 3 * -f + 14 * f} -120 ${sx + 3 * -f + 22 * f} -116 ${sx + 3 * -f + 34 * f} -118 C${sx + 3 * -f + 28 * f} -108 ${sx + 3 * -f + 30 * f} -100 ${sx + 3 * -f + 36 * f} -92 C${sx + 3 * -f + 22 * f} -96 ${sx + 3 * -f + 12 * f} -94 ${sx + 3 * -f} -98Z`}) : null;
  return mo('general', g(at(x, y, sc), dot(0, 1, 16, 0.12), ...legs, body, hem, brim, head, plume, ...sp, fl));
}
/** 앉은 사람(뒷모습 · 삿갓) */
export function sitter(x, y, sc = 1) {
  return mo('sitter', g(at(x, y, sc), dot(0, 0, 14, 0.1), s('path', {fill: INK, d: 'M-14 0 C-16 -10 -12 -24 -6 -28 C-2 -30 2 -30 6 -28 C12 -24 16 -10 14 0Z'}),
    s('path', {fill: INK, d: 'M-16 -30 L0 -42 L16 -30 C8 -28 -8 -28 -16 -30Z'})));
}
/** 걷는 사람(뒷모습 · 봇짐) */
export function walker(x, y, sc = 1) {
  return mo('walker', g(at(x, y, sc), s('path', {fill: INK, d: 'M-8 -4 C-10 -18 -9 -34 -6 -40 C-3 -44 3 -44 6 -40 C9 -34 10 -18 8 -4Z'}), s('ellipse', {cx: 0, cy: -48, rx: 5.5, ry: 6.5, fill: INK}),
    br([[-4, -4], [-9, 6]], 3.4, {a: 1, b: 0.7}), br([[4, -4], [7, 5]], 3.4, {a: 1, b: 0.7}), br([[6, -36], [18, -52]], 2, {a: 1, b: 1}), s('ellipse', {cx: 20, cy: -54, rx: 6, ry: 5, fill: INK, 'fill-opacity': 0.8})));
}

/* ── 깃발 · 화살 · 디딤돌(셈을 그림으로) ── */
/** 깃발 — 선 깃발(up) · 기운 깃발(오르지 않음 — 장대가 기울고 깃발이 처짐 · 옆 깃발과 겹치지 않음) */
export function banner(x, y, h = 46, up = true, sc = 1, c = ACC) {
  if (up) return s('g', {class: 'ik-bn ik-up', transform: at(x, y, sc)}, br([[0, 0], [1, -h * 0.5], [0, -h]], 2.4, {a: 0.9, b: 0.5}),
    s('path', {d: `M0 ${-h + 2} C8 ${-h + 1} 14 ${-h + 5} 22 ${-h + 2} C19 ${-h + 10} 21 ${-h + 16} 24 ${-h + 22} C15 ${-h + 19} 8 ${-h + 21} 0 ${-h + 18}Z`, fill: c, 'fill-opacity': 0.9}));
  const L = h * 0.82, tx = L * 0.5, ty = -L * 0.866; // 30도 기움
  return s('g', {class: 'ik-bn ik-dn', transform: at(x, y, sc)}, br([[0, 0], [tx * 0.5, ty * 0.5], [tx, ty]], 2.2, {a: 0.9, b: 0.5, al: 0.85}),
    s('path', {d: `M${r1(tx)} ${r1(ty)} C${r1(tx + 3)} ${r1(ty + 6)} ${r1(tx + 2)} ${r1(ty + 12)} ${r1(tx + 4)} ${r1(ty + 19)} C${r1(tx - 1)} ${r1(ty + 15)} ${r1(tx - 3)} ${r1(ty + 9)} ${r1(tx - 4)} ${r1(ty + 4)}Z`, fill: c, 'fill-opacity': 0.6}));
}
/** 화살 — 꺾인 화살(broken) = 잃은 싸움 */
export function arrow(x, y, len = 44, broken = false, sc = 1) {
  if (!broken) return s('g', {class: 'ik-ar', transform: at(x, y, sc)}, br([[0, 0], [0, -len]], 2.2, {a: 1, b: 1}), s('path', {fill: INK, d: `M-4 ${-len + 4} L0 ${-len - 6} L4 ${-len + 4}Z`}), br([[0, -2], [-5, 6]], 1.6, {a: 1, b: 0.4}), br([[0, -2], [5, 6]], 1.6, {a: 1, b: 0.4}));
  return s('g', {class: 'ik-ar ik-broken', transform: at(x, y, sc)}, br([[0, 0], [0, -len * 0.45]], 2.2, {a: 1, b: 1, al: 0.75}), br([[0, -2], [-5, 6]], 1.6, {a: 1, b: 0.4, al: 0.75}), br([[0, -2], [5, 6]], 1.6, {a: 1, b: 0.4, al: 0.75}),
    M('snap', 4, g('translate(0 ' + r1(-len * 0.45) + ') rotate(38)', br([[0, 0], [0, -len * 0.42]], 2.2, {a: 1, b: 1, c: NAVY}), s('path', {fill: NAVY, d: `M-4 ${-len * 0.42 + 4} L0 ${-len * 0.42 - 6} L4 ${-len * 0.42 + 4}Z`}))));
}
/** 디딤돌 — 칠한 돌(same) · 오늘 돌(now) */
export function stone(x, y, r = 7, same = false, now = false, seed = 3) {
  const R = rng(seed), P = [];
  for (let i = 0; i < 9; i++) { const t = (i / 9) * Math.PI * 2, k = r * (0.82 + R() * 0.3); P.push([x + Math.cos(t) * k * 1.25, y + Math.sin(t) * k * 0.72]); }
  return s('g', {class: 'ik-st' + (same ? ' ik-same' : '') + (now ? ' ik-now' : '')}, now ? M('pulse', 'ik-tq21', ring(x, y, r * 1.7, 1.6, NAVY)) : null, same ? wash(P, 0.85, now ? NAVY : INK) : s('path', {d: 'M' + spline([...P, P[0]], 30).map(p => r1(p[0]) + ' ' + r1(p[1])).join('L') + 'Z', fill: 'none', stroke: INK, 'stroke-width': 1.4, 'stroke-opacity': 0.6}));
}

/* ── 사물(꾀 그림 부품) — 모두 제 자리(0,0) 둘레 · 크기 ≈ 60 ── */
const P_ = {
  boat: () => g(null, br([[-30, 0], [-12, 8], [14, 8], [32, -2]], 5, {a: 0.5, b: 0.4, peak: 0.5}), br([[0, 4], [1, -40]], 2, {a: 1, b: 0.7}), s('path', {fill: INK, 'fill-opacity': 0.7, d: 'M2 -38 C14 -30 18 -18 16 -6 C10 -8 6 -8 2 -6Z'})),
  castle: () => g(null, s('path', {fill: INK, 'fill-opacity': 0.88, d: 'M-34 0 L-34 -22 L-28 -22 L-28 -26 L-22 -26 L-22 -22 L-12 -22 L-12 -26 L-6 -26 L-6 -22 L6 -22 L6 -26 L12 -26 L12 -22 L22 -22 L22 -26 L28 -26 L28 -22 L34 -22 L34 0Z'}),
    s('path', {fill: PAPER, d: 'M-7 0 L-7 -10 C-7 -16 7 -16 7 -10 L7 0Z'}), br([[-22, -34], [0, -40], [22, -34]], 4, {a: 0.6, b: 0.6, peak: 0.5}), br([[-26, -31], [-20, -35]], 2.4, {a: 1, b: 0.3}), br([[26, -31], [20, -35]], 2.4, {a: 1, b: 0.3}), s('rect', {x: -12, y: -34, width: 24, height: 9, fill: INK, 'fill-opacity': 0.85})),
  pine: () => g(null, br([[0, 0], [-3, -22], [2, -44], [-2, -62]], 5, {a: 0.7, b: 0.3, peak: 0.2}), ...[[-2, -30, -22], [1, -44, 18], [-1, -56, -16], [0, -64, 10]].map(([x, y, d]) => g(null, br([[x, y], [x + d * 0.6, y - 4], [x + d, y - 2]], 2.4, {a: 0.6, b: 0.2}),
    s('ellipse', {cx: r1(x + d), cy: r1(y - 6), rx: 11, ry: 5, fill: INK, 'fill-opacity': 0.75})))),
  tree: () => g(null, br([[0, 0], [2, -20], [-2, -40]], 5, {a: 0.8, b: 0.3, peak: 0.2}), br([[0, -24], [14, -36]], 2.4, {a: 0.8, b: 0.2}), br([[-1, -30], [-14, -42]], 2.4, {a: 0.8, b: 0.2}), dot(-2, -48, 15, 0.22), dot(10, -42, 11, 0.2), dot(-13, -44, 10, 0.2)),
  bare: () => g(null, br([[0, 0], [-2, -18], [2, -34], [0, -46]], 4.6, {a: 0.8, b: 0.2, peak: 0.2}), br([[1, -22], [14, -34], [20, -36]], 2.2, {a: 0.8, b: 0.15}), br([[0, -30], [-12, -40], [-18, -38]], 2.2, {a: 0.8, b: 0.15}), br([[1, -40], [8, -52]], 1.8, {a: 0.8, b: 0.15})),
  fire: () => g(null, s('path', {fill: ACC, 'fill-opacity': 0.85, d: 'M0 0 C-14 -2 -16 -16 -8 -26 C-6 -18 -2 -18 -2 -24 C-2 -32 4 -38 8 -44 C8 -34 16 -30 14 -18 C18 -20 18 -26 18 -28 C24 -18 22 -2 0 0Z'}), s('path', {fill: PAPER, 'fill-opacity': 0.75, d: 'M2 -2 C-4 -4 -6 -12 -1 -18 C0 -12 4 -12 5 -16 C8 -10 9 -4 2 -2Z'})),
  drum: () => g(null, s('ellipse', {cx: 0, cy: -18, rx: 16, ry: 6, fill: INK, 'fill-opacity': 0.25, stroke: INK, 'stroke-width': 1.6}), s('path', {fill: INK, 'fill-opacity': 0.85, d: 'M-16 -18 L-16 0 C-10 5 10 5 16 0 L16 -18 C10 -13 -10 -13 -16 -18Z'}),
    br([[-26, -40], [-8, -22]], 2.6, {a: 1, b: 0.7}), br([[24, -42], [8, -24]], 2.6, {a: 1, b: 0.7})),
  sound: () => g(null, ...[10, 18, 26].map((r, i) => s('path', {fill: 'none', stroke: INK, 'stroke-width': 1.6, 'stroke-opacity': 0.7 - i * 0.18, d: `M${r} ${-r} A${r} ${r} 0 0 1 ${r} ${r}`}))),
  tent: () => g(null, s('path', {fill: INK, 'fill-opacity': 0.82, d: 'M-28 0 L0 -34 L28 0Z'}), s('path', {fill: PAPER, d: 'M-6 0 L0 -18 L6 0Z'}), br([[0, -34], [0, -46]], 2, {a: 1, b: 0.6}), s('path', {fill: ACC, d: 'M0 -46 L12 -43 L0 -40Z'})),
  sword: () => g(null, s('path', {fill: INK, 'fill-opacity': 0.9, d: 'M-2 -2 L-2 -56 L0 -62 L2 -56 L2 -2Z'}), br([[-10, 0], [10, 0]], 3.6, {a: 1, b: 1}), br([[0, 2], [0, 14]], 3.4, {a: 1, b: 0.8}), dot(0, 16, 2.8)),
  fan: () => g(null, s('path', {fill: INK, 'fill-opacity': 0.14, stroke: INK, 'stroke-width': 1.6, d: 'M0 0 L-30 -26 A40 40 0 0 1 30 -26Z'}), ...[-24, -12, 0, 12, 24].map(x => line(0, 0, x, -36 + Math.abs(x) * 0.25, 1.1, INK, 0.6))),
  sheep: () => g(null, ...[[-10, -12], [0, -16], [10, -12], [-4, -8], [6, -8]].map(([x, y]) => dot(x, y, 8, 0.2)), s('ellipse', {cx: 18, cy: -16, rx: 6, ry: 5, fill: INK, 'fill-opacity': 0.85}),
    ...[-8, -2, 6, 12].map(x => br([[x, -4], [x, 6]], 2.2, {a: 1, b: 0.7}))),
  rope: () => br([[0, 0], [12, 4], [26, 0], [40, 6]], 1.6, {a: 1, b: 1, al: 0.8}),
  snake: () => g(null, br([[-26, 8], [-14, 0], [-8, 10], [4, 2], [10, -10], [8, -20]], 4, {a: 0.3, b: 0.9, peak: 0.8}), dot(8, -21, 4)),
  grass: () => g(null, ...[[-16, 18], [-8, 26], [0, 22], [8, 28], [16, 20]].map(([x, h], i) => br([[x, 0], [x + (i % 2 ? 3 : -3), -h * 0.6], [x + (i % 2 ? 8 : -6), -h]], 2.2, {a: 1, b: 0.1, al: 0.8}))),
  tiger: () => g(null, s('path', {fill: INK, 'fill-opacity': 0.82, d: 'M-30 -10 C-26 -24 -6 -26 10 -22 C20 -20 28 -18 32 -24 C38 -22 38 -12 32 -8 C26 -2 14 0 -4 0 C-16 0 -26 0 -30 -10Z'}),
    ...[-14, -6, 2, 10].map(x => br([[x, -22], [x + 2, -6]], 2.2, {a: 0.6, b: 0.2, c: PAPER, al: 0.85})), br([[-30, -12], [-40, -22], [-38, -32]], 2.8, {a: 1, b: 0.3}), br([[-18, 0], [-20, 8]], 3.4, {a: 1, b: 0.7}), br([[18, -2], [20, 8]], 3.4, {a: 1, b: 0.7})),
  cage: () => g(null, s('path', {fill: 'none', stroke: INK, 'stroke-width': 1.8, d: 'M-18 0 L-18 -26 C-18 -40 18 -40 18 -26 L18 0Z'}), ...[-9, 0].map(x => line(x, 0, x, -36 + Math.abs(x) * 0.2, 1.4)), line(-18, 0, 18, 0, 2.2),
    s('path', {fill: 'none', stroke: INK, 'stroke-width': 1.6, d: 'M18 -24 L30 -30 L30 -6 L18 0'})),
  bird: () => g(null, br([[-12, 0], [-5, -4], [0, 0]], 2.4, {a: 0.3, b: 1, peak: 0.8}), br([[0, 0], [6, -5], [13, -3]], 2.4, {a: 1, b: 0.3, peak: 0.2})),
  brick: () => g(null, s('rect', {x: -14, y: -9, width: 28, height: 14, fill: INK, 'fill-opacity': 0.5, transform: 'rotate(-12)'})),
  jade: () => g(null, s('circle', {cx: 0, cy: 0, r: 14, fill: NAVY, 'fill-opacity': 0.75}), s('circle', {cx: 0, cy: 0, r: 5, fill: PAPER})),
  cauldron: () => g(null, s('path', {fill: INK, 'fill-opacity': 0.88, d: 'M-20 -24 C-22 -8 -12 0 0 0 C12 0 22 -8 20 -24Z'}), br([[-22, -25], [22, -25]], 3.4, {a: 1, b: 1}), br([[-12, -1], [-16, 10]], 2.6, {a: 1, b: 0.7}), br([[12, -1], [16, 10]], 2.6, {a: 1, b: 0.7}),
    br([[-6, -30], [-2, -38], [-6, -46]], 1.6, {a: 0.6, b: 0.1, al: 0.5}), br([[6, -30], [10, -38], [6, -48]], 1.6, {a: 0.6, b: 0.1, al: 0.5})),
  logs: () => g(null, br([[-18, 0], [18, -4]], 5, {a: 1, b: 1, al: 0.85}), br([[-14, -6], [16, 2]], 5, {a: 1, b: 1, al: 0.7})),
  fish: () => g(null, s('path', {fill: INK, 'fill-opacity': 0.82, d: 'M-14 0 C-8 -8 8 -8 12 0 C8 8 -8 8 -14 0Z M12 0 L22 -7 L20 0 L22 7Z'}), dot(-7, -1, 1.4, 1, PAPER)),
  net: () => g(null, ...[-20, -10, 0, 10, 20].map(x => line(x, -14, x + 6, 14, 1, INK, 0.45)), ...[-20, -10, 0, 10, 20].map(x => line(x + 6, -14, x, 14, 1, INK, 0.45))),
  cicada: () => g(null, s('ellipse', {cx: 0, cy: 0, rx: 6, ry: 11, fill: INK, 'fill-opacity': 0.88}), s('path', {fill: INK, 'fill-opacity': 0.2, stroke: INK, 'stroke-width': 1, d: 'M2 -6 C14 -12 22 0 16 10 C10 6 6 2 2 -6Z M-2 -6 C-14 -12 -22 0 -16 10 C-10 6 -6 2 -2 -6Z'})),
  shell: () => g(null, s('ellipse', {cx: 0, cy: 0, rx: 6, ry: 11, fill: 'none', stroke: INK, 'stroke-width': 1.4, 'stroke-dasharray': '3 2'})),
  gate: () => g(null, s('rect', {x: -24, y: -38, width: 48, height: 38, fill: INK, 'fill-opacity': 0.85}), line(0, -38, 0, 0, 1.6, PAPER, 0.9), br([[-28, -20], [28, -20]], 5, {a: 1, b: 1, c: ACC}), br([[-30, -46], [0, -52], [30, -46]], 4.4, {a: 0.6, b: 0.6, peak: 0.5})),
  road: () => g(null, br([[-30, 0], [-8, -30], [-2, -46]], 2, {a: 1, b: 0.3, al: 0.7}), br([[30, 0], [8, -30], [2, -46]], 2, {a: 1, b: 0.3, al: 0.7})),
  steps: () => g(null, ...[[-8, -4], [6, -12], [-4, -20], [6, -28], [-2, -36]].map(([x, y], i) => s('ellipse', {cx: x, cy: y, rx: 3.4 - i * 0.3, ry: 2.2 - i * 0.15, fill: INK, 'fill-opacity': 0.75}))),
  frame: () => g(null, br([[-24, 0], [-24, -34]], 3.6, {a: 1, b: 1}), s('path', {fill: 'none', stroke: INK, 'stroke-width': 2.4, 'stroke-dasharray': '4 3', d: 'M24 0 L24 -34'}), br([[-30, -34], [30, -34]], 4, {a: 1, b: 1}), br([[-34, -40], [0, -48], [34, -40]], 3.6, {a: 0.6, b: 0.6, peak: 0.5})),
  staff: () => br([[0, 0], [16, -18], [34, -30]], 2.4, {a: 1, b: 0.4}),
  ladder: () => g(null, line(-24, 0, 24, -6, 2, INK), line(-24, 8, 24, 2, 2, INK), ...[-16, -6, 4, 14].map(x => line(x, -1 - (x + 24) * 0.12, x, 7 - (x + 24) * 0.12, 1.6, INK))),
  roof: () => g(null, s('rect', {x: -22, y: -26, width: 44, height: 26, fill: INK, 'fill-opacity': 0.25}), br([[-34, -26], [-16, -34], [0, -38], [16, -34], [34, -26]], 5, {a: 0.5, b: 0.5, peak: 0.5}), br([[-36, -24], [-30, -29]], 2.4, {a: 1, b: 0.3}), br([[36, -24], [30, -29]], 2.4, {a: 1, b: 0.3})),
  blossom: () => g(null, ...[[0, 0], [7, -3], [-6, -4], [3, 7], [-4, 6]].map(([x, y]) => dot(x, y, 4.2, 0.55, ACC)), dot(0, 0, 2, 1, INK)),
  pavilion: () => g(null, br([[-20, 0], [-20, -22]], 2.6, {a: 1, b: 1}), br([[20, 0], [20, -22]], 2.6, {a: 1, b: 1}), br([[-30, -22], [-12, -30], [0, -34], [12, -30], [30, -22]], 4.6, {a: 0.5, b: 0.5, peak: 0.5}), br([[-24, 0], [24, 0]], 3, {a: 1, b: 1})),
  peony: () => g(null, ...[0, 72, 144, 216, 288].map(a => s('ellipse', {cx: r1(Math.cos(a * Math.PI / 180) * 8), cy: r1(Math.sin(a * Math.PI / 180) * 8), rx: 9, ry: 6, transform: 'rotate(' + a + ' ' + r1(Math.cos(a * Math.PI / 180) * 8) + ' ' + r1(Math.sin(a * Math.PI / 180) * 8) + ')', fill: ACC, 'fill-opacity': 0.5})),
    dot(0, 0, 5, 0.8, INK), br([[0, 8], [-4, 30]], 2, {a: 1, b: 0.4}), s('ellipse', {cx: -10, cy: 20, rx: 8, ry: 3.4, transform: 'rotate(-30 -10 20)', fill: INK, 'fill-opacity': 0.6})),
  qin: () => g(null, s('path', {fill: INK, 'fill-opacity': 0.85, d: 'M-30 -2 C-30 -8 30 -8 30 -2 C30 2 -30 2 -30 -2Z'}), ...[-4, -1, 2].map(y => line(-26, y - 1, 26, y - 1, 0.7, PAPER, 0.8))),
  letter: () => g(null, s('rect', {x: -16, y: -10, width: 32, height: 20, fill: PAPER, stroke: INK, 'stroke-width': 1.8}), line(-16, -10, 0, 2, 1.4), line(16, -10, 0, 2, 1.4), s('rect', {x: -4, y: -2, width: 8, height: 8, fill: NAVY})),
  shield: () => g(null, s('path', {fill: INK, 'fill-opacity': 0.8, d: 'M0 -30 C14 -26 18 -22 18 -12 C18 4 8 12 0 16 C-8 12 -18 4 -18 -12 C-18 -22 -14 -26 0 -30Z'}), br([[-2, -28], [4, -14], [-3, -4], [3, 8]], 2.2, {a: 1, b: 0.6, c: PAPER})),
  chain: () => g(null, ...[-12, 0, 12].map((x, i) => s('ellipse', {cx: x, cy: 0, rx: 7, ry: 4, fill: 'none', stroke: INK, 'stroke-width': 2, transform: i === 1 ? 'rotate(90 0 0)' : null}))),
  bundle: () => g(null, s('ellipse', {cx: 0, cy: 0, rx: 10, ry: 8, fill: INK, 'fill-opacity': 0.8})),
  arrowsOut: () => g(null, ...[-10, 0, 10].map(d => br([[0, 0], [24, d * 0.8]], 1.8, {a: 1, b: 0.5})), ...[-10, 0, 10].map(d => s('path', {fill: INK, d: `M24 ${d * 0.8 - 3} L32 ${d * 0.8} L24 ${d * 0.8 + 3}Z`}))),
  scarecrow: () => g(null, br([[0, 0], [0, -34]], 2.4, {a: 1, b: 0.8}), br([[-14, -24], [14, -26]], 2.4, {a: 1, b: 0.8}), s('path', {fill: INK, 'fill-opacity': 0.55, d: 'M-8 -10 L8 -10 L6 -26 L-6 -26Z'}), s('path', {fill: INK, 'fill-opacity': 0.8, d: 'M-9 -34 L0 -42 L9 -34Z'})),
  cliff: () => g(null, wash([[-34, 10], [-30, -40], [-18, -46], [-14, 10]], 0.5), wash([[34, 10], [30, -36], [18, -42], [14, 10]], 0.5), ...[-12, -4, 4, 12].map(x => line(x - 3, -20, x + 3, -20, 2.2, INK, 0.8)), line(-14, -18, 14, -18, 1.2, INK, 0.5)),
  bigFlag: () => g(null, br([[0, 0], [0, -56]], 3.2, {a: 1, b: 0.6}), s('path', {fill: NAVY, 'fill-opacity': 0.88, d: 'M0 -56 C12 -58 22 -52 34 -56 C30 -44 32 -36 38 -26 C24 -30 12 -28 0 -32Z'}), ring(18, -42, 26, 1.4, INK, 0.45)),
  hand: () => g(null, br([[-20, 0], [-6, -2], [8, -8], [18, -16]], 5, {a: 0.6, b: 0.5, al: 0.85})),
};
const motif = (name, x, y, sc = 1, rot = 0) => (P_[name] ? mo(name, g(at(x, y, sc, rot), P_[name]())) : null);

/* ── 꾀 서른여섯 그림(삼십육계 옛 이야기를 새로 그림 · 200 × 150) ── */
const GROUND = (y = 128, al = 0.1) => mo('ground', wash([[0, y], [60, y - 4], [140, y - 2], [200, y - 5], [200, 150], [0, 150]], al));
const SC = {
  g01: () => [farHills([[0, 70], [40, 52], [90, 62], [150, 48], [200, 60]], 100, 0.06), moon(126, 30, 11), waves(10, 190, 96, {rows: 4, seed: 11}), mist(70, 90, 120, 18, 0.85), motif('boat', 92, 108, 0.9)], // 몰래 바다 건너기
  g02: () => [GROUND(), motif('castle', 52, 124, 0.8), motif('castle', 152, 118, 0.62), motif('arrowsOut', 80, 92, 1), ...[0, 1, 2].map(i => motif('fire', 140 + i * 9, 92, 0.3))], // 딴 데 쳐서 구하기
  g03: () => ([farHills([[0,96],[50,84],[110,92],[200,80]],128,0.06), GROUND(), general(30,128,0.58,{facing:1,flag:false,spear:false}), wash([[200,54],[168,58],[150,64],[144,73],[156,80],[200,78]],0.8,NAVY), motif('sword',146,72,1.15,-135), banner(56,131,52,false,1), banner(70,137,40,false,0.85)]), // 남의 칼 빌리기 · 다시 그림(주문 1116-0118)
  g04: () => [GROUND(), moon(128, 28, 10), motif('tent', 78, 124, 1.1), ...[0, 1, 2].map(i => br([[124 + i * 10, 128], [126 + i * 10, 86]], 2, {a: 1, b: 0.5}))], // 쉬다가 치기
  g05: () => [GROUND(), motif('castle', 100, 120, 1.05), motif('fire', 78, 86, 0.8), motif('fire', 118, 80, 0.95), banner(170, 128, 50, true)], // 불난 틈 타기
  g06: () => ([GROUND(), motif('castle',90,124,0.85), motif('drum',138,124,0.8), motif('sound',150,106,0.75), banner(14,130,46,true,0.9), banner(30,132,40,true,0.9), motif('arrowsOut',38,108,0.9)]), // 동쪽 소리 서쪽 치기 · 다시 그림(주문 1116-0118)
  g07: () => ([moon(26,24,9), GROUND(134), motif('castle',100,66,1.45), ...[62,100,138].map((x,i)=>g(null, line(x,66,x,77,1.3,INK,0.8), g(at(x,123,1.1),P_.scarecrow()), ...[0,1,2].map(j=>g(at(x+21,95+j*8-(i%2)*3,0.42,-90+(j-1)*10), arrow(0,0,40)))))]), // 없는 데서 만들기 · 다시 그림(주문 1116-0118)
  g08: () => [motif('cliff', 70, 110, 1.3), motif('steps', 150, 140, 1.2), farHills([[110, 120], [150, 90], [200, 104]], 150, 0.12)], // 몰래 다른 길 가기
  g09: () => [GROUND(140), waves(10, 190, 84, {rows: 3, seed: 9}), motif('fire', 138, 70, 0.8), motif('castle', 150, 72, 0.45), motif('pavilion', 56, 136, 0.9), sitter(56, 132, 0.5)], // 강 건너 불 보기
  g10: () => [GROUND(), motif('sword', 96, 112, 1, -20), motif('fan', 104, 104, 1.2)], // 웃음 속 칼
  g11: () => [GROUND(), motif('tree', 62, 126, 1.1), motif('blossom', 54, 76, 0.9), motif('blossom', 74, 70, 0.8), g(at(140, 126, 1, -78), P_.bare())], // 대신 쓰러지기
  g12: () => ([farHills([[0,92],[60,78],[130,88],[200,76]],128,0.06), GROUND(), motif('grass',28,130,0.7), motif('grass',180,128,0.6), motif('sheep',62,126,1.2), br([[112,100],[100,110],[90,108],[84,106]],1.5,{a:1,b:1,al:0.85}), walker(122,126,1)]), // 손에 걸린 양 끌기 · 다시 그림(주문 1116-0118)
  g13: () => ([GROUND(), walker(34, 130, 0.8), br([[40, 96], [70, 106], [100, 118]], 3.2, {a: 1, b: 0.5, peak: 0.3}), ...[[96, 104, 88, 96], [104, 108, 104, 98], [108, 116, 116, 110]].map(([x1, y1, x2, y2]) => line(x1, y1, x2, y2, 1.4, INK, 0.7)), motif('grass', 96, 132, 1.7), motif('grass', 128, 132, 1.3), br([[118, 132], [132, 124], [124, 112], [134, 100], [146, 90], [150, 80]], 6, {a: 0.4, b: 0.9, peak: 0.7}), s('ellipse', {cx: 153, cy: 77, rx: 6, ry: 4.4, fill: INK, transform: 'rotate(-30 153 77)'}), line(158, 73, 165, 70, 1.2, INK, 0.9), line(165, 70, 168, 66, 1, INK, 0.9), line(165, 70, 169, 72, 1, INK, 0.9), motif('sound', 160, 86, 0.7)]), // 풀 쳐서 뱀 놀래기 · 다시 그림(주문 1116-0118)
  g14: () => ([GROUND(), sun(138, 62, 16), br([[118, 131], [140, 128], [176, 127]], 7, {a: 0.9, b: 0.5, peak: 0.2, al: 0.45}), br([[146, 128], [152, 118], [150, 112]], 1.8, {a: 0.9, b: 0.2, al: 0.45}), br([[162, 127], [170, 120]], 1.6, {a: 0.9, b: 0.2, al: 0.45}), wash([[72, 132], [78, 120], [80, 104], [88, 98], [100, 101], [110, 97], [116, 104], [118, 120], [126, 132]], 0.85), s('ellipse', {cx: 98, cy: 101, rx: 17, ry: 4.2, fill: SOFT}), ring(98, 101, 7, 1, INK, 0.4), br([[98, 100], [96, 86], [102, 72], [100, 56], [104, 46]], 3.6, {a: 0.9, b: 0.4, peak: 0.3}), ...[[97, 86, -1], [101, 74, 1], [100, 62, -1], [103, 50, 1]].map(([x, y, d]) => s('ellipse', {cx: x + d * 9, cy: y - 3, rx: 9, ry: 4, fill: ACC, 'fill-opacity': 0.9, transform: 'rotate(' + (d * -28) + ' ' + (x + d * 9) + ' ' + (y - 3) + ')'})), dot(104, 44, 4, 1, ACC)]), // 다시 살아나기 · 다시 그림(주문 1116-0118)
  g15: () => [mountain([[0, 110], [40, 60], [70, 74], [100, 40], [130, 80]], 150, {seed: 15}), GROUND(132), motif('tiger', 162, 128, 0.9)], // 범을 산에서 끌어내기
  g16: () => [GROUND(), motif('cage', 76, 124, 1.3), motif('bird', 140, 60, 1.3), motif('bird', 164, 44, 0.9)], // 잡으려면 놓아주기
  g17: () => [GROUND(), motif('brick', 66, 108, 1.4), br([[80, 98], [104, 84], [124, 88]], 1.4, {a: 1, b: 0.3, al: 0.5}), motif('jade', 140, 98, 1.3)], // 벽돌 던져 옥 얻기
  g18: () => [GROUND(), ...[30, 48, 66, 152, 170].map((x, i) => banner(x, 130 - (i % 2) * 4, 34, true, 0.8)), motif('bigFlag', 100, 126, 1.25)], // 우두머리 잡기
  g19: () => [GROUND(), motif('cauldron', 96, 110, 1.4), motif('logs', 96, 124, 0.9), g(at(150, 130, 1, -18), P_.logs())], // 솥 밑 장작 빼기
  g20: () => [wash([[0, 70], [200, 62], [200, 150], [0, 150]], 0.16), wash([[30, 96], [90, 80], [150, 100], [110, 120], [40, 116]], 0.14), motif('net', 100, 104, 1.6), motif('fish', 80, 100, 1), motif('fish', 124, 112, 0.8)], // 흐린 물 고기 잡기
  g21: () => [motif('bare', 70, 140, 1.6), motif('shell', 82, 86, 1.1), motif('cicada', 150, 54, 1.1, 30)], // 매미 허물 벗기
  g22: () => ([GROUND(132), wash([[30, 90], [100, 66], [170, 90], [100, 114]], 0.08), s('ellipse', {cx: 100, cy: 96, rx: 72, ry: 24, fill: 'none', stroke: INK, 'stroke-width': 10, 'stroke-opacity': 0.3}), s('ellipse', {cx: 100, cy: 90, rx: 72, ry: 24, fill: 'none', stroke: INK, 'stroke-width': 5, 'stroke-opacity': 0.85}), walker(80, 98, 0.62), motif('gate', 100, 124, 0.7), dot(100, 110, 3.4, 1, NAVY), general(30, 142, 0.36, {facing: 1, flag: false}), general(170, 142, 0.36, {facing: -1, flag: false})]), // 문 닫고 도둑 잡기 · 다시 그림(주문 1116-0118)
  g23: () => [farHills([[100, 60], [140, 36], [200, 52]], 90, 0.1), banner(150, 64, 30, true, 0.8, NAVY), GROUND(), motif('castle', 60, 122, 0.85), motif('arrowsOut', 110, 98, 0.9, 180)], // 먼 데 사귀고 가까운 데 치기
  g24: () => ([farHills([[0, 84], [50, 70], [110, 80], [200, 64]], 120, 0.06), GROUND(), br([[4, 142], [40, 132], [80, 122], [120, 118], [160, 114], [196, 112]], 10, {a: 1, b: 0.6, peak: 0.1, al: 0.15}), motif('castle', 90, 122, 1.0), motif('castle', 172, 110, 0.56), motif('fire', 164, 88, 0.48), motif('fire', 180, 90, 0.4), general(24, 136, 0.5, {facing: 1}), ...[[46, 132], [58, 129], [70, 126], [86, 121], [94, 121], [132, 117], [142, 116]].map(([x, y]) => dot(x, y, 1.9, 0.8)), motif('arrowsOut', 126, 104, 0.6)]), // 길 빌려 치기 · 다시 그림(주문 1116-0118)
  g25: () => ([GROUND(), motif('frame', 80, 126, 1.3), walker(150, 124, 0.75), br([[128, 116], [182, 82]], 4.2, {a: 1, b: 1, al: 0.92}), br([[112, 128], [126, 128]], 1.2, {a: 1, b: 0.3, al: 0.4}), br([[104, 122], [120, 122]], 1.2, {a: 1, b: 0.3, al: 0.4})]), // 기둥 바꾸기 · 다시 그림(주문 1116-0118)
  g26: () => [GROUND(), motif('tree', 150, 126, 1.2), motif('tree', 56, 126, 0.9), motif('staff', 70, 96, 1.6)], // 빗대어 꾸짖기
  g27: () => [GROUND(), waves(110, 196, 112, {rows: 3, seed: 27, amp: 1.6}), sitter(90, 122, 1), br([[102, 92], [140, 80], [170, 92]], 1.4, {a: 1, b: 0.4, al: 0.7})], // 어리석은 척하기
  g28: () => ([GROUND(), s('rect', {x: 60, y: 98, width: 48, height: 28, fill: INK, opacity: 0.2}), s('rect', {x: 79, y: 108, width: 10, height: 18, fill: INK, opacity: 0.5}), motif('roof', 84, 98, 1.2), walker(84, 52, 0.42), motif('ladder', 146, 116, 0.9, -24), walker(170, 124, 0.62)]), // 지붕 올리고 사다리 치우기 · 다시 그림(주문 1116-0118)
  g29: () => [GROUND(), motif('bare', 100, 128, 1.6), ...[[78, 76], [110, 64], [124, 82], [92, 92], [70, 96]].map(([x, y]) => motif('blossom', x, y, 0.8))], // 나무에 꽃 달기
  g30: () => [GROUND(), motif('pavilion', 100, 120, 1.4), banner(84, 86, 26, true, 0.8, NAVY), banner(132, 128, 30, false, 0.8)], // 손님이 주인 되기
  g31: () => [GROUND(), moon(128, 34, 12), motif('peony', 86, 84, 1.3), motif('fan', 132, 118, 0.7)], // 미인 꾀
  g32: () => [GROUND(), motif('castle', 100, 124, 1.5), motif('qin', 100, 80, 0.7), sitter(100, 76, 0.4)], // 빈 성 꾀
  g33: () => ([GROUND(), moon(26, 28, 8), motif('tent', 40, 120, 0.8), general(22, 124, 0.5, {facing: 1}), ...[70, 78, 86, 94].map((x, i) => dot(x, 130 - (i % 2) * 2, 1.4, 0.5, INK)), walker(110, 124, 0.8), motif('letter', 124, 101, 0.5), motif('castle', 166, 124, 0.85)]), // 적 첩자 쓰기 · 다시 그림(주문 1116-0118)
  g34: () => ([GROUND(), general(64, 124, 0.72, {facing: 1}), br([[78, 92], [102, 72], [126, 82]], 1.3, {a: 0.3, b: 0.3, al: 0.35}), br([[70, 100], [124, 90]], 3, {a: 1, b: 0.5, al: 0.95}), sitter(128, 126, 0.95), br([[140, 96], [150, 90]], 1.6, {a: 1, b: 0.2, al: 0.9, c: ACC}), br([[142, 103], [153, 98]], 1.6, {a: 1, b: 0.2, al: 0.9, c: ACC}), br([[143, 110], [154, 106]], 1.6, {a: 1, b: 0.2, al: 0.9, c: ACC})]), // 제 몸 다치기 · 다시 그림(주문 1116-0118)
  g35: () => [waves(6, 194, 108, {rows: 3, seed: 35}), motif('boat', 46, 104, 0.7), motif('boat', 100, 100, 0.7), motif('boat', 154, 104, 0.7), motif('chain', 73, 104, 0.8), motif('chain', 127, 104, 0.8)], // 고리 잇기
  g36: () => [farHills([[0, 60], [60, 44], [120, 54], [200, 40]], 96, 0.08), GROUND(), br([[30, 146], [80, 120], [120, 104], [160, 92]], 6, {a: 1, b: 0.2, al: 0.22}), walker(118, 104, 0.8)], // 달아나기
};
/* ANIM< — 꾀 그림마다 따로 정한 움직임(부품 차례마다 [움직임, 단계] · 없는 칸은 부품 이름으로 · 그림 일꾼이 꾀 이야기에 맞춰 정함) */
const ANIM = Object.freeze({
  g01: [['fade',1],['glow',2],['drift',2],['drift',4],['sail',3]],
  g02: [['fade',1],['rise',2],['rise',2],['fly',3],['flicker',4],['flicker',4],['flicker',5]],
  g03: [['fade',1],['fade',1],['walk',2],['wipeL',3],['strike',4],['drop',5],['drop',5]],
  g04: [['fade',1],['glow',2],['rise',2],['rise',4],['rise',5],['rise',6]],
  g05: [['fade',1],['rise',2],['flicker',3],['flicker',4],['sailL',5]],
  g06: [['fade',1],['rise',2],['pop',3],['pulse',4],['sail',5],['sail',5],['fly',6]],
  g07: [['glow',1],['fade',1],['rise',2],['drop',3],['drop',4],['drop',5]],
  g08: [['rise',2],['fade',3],['drift',1]],
  g09: [['fade',1],['drift',1],['flicker',4],['rise',2],['rise',3],['fade',3]],
  g10: [['fade',1],['strike',4],['rise',2]],
  g11: [['fade',1],['grow',2],['pop',3],['pop',3],['drop',4]],
  g12: [['drift',1],['fade',1],['grow',2],['grow',2],['walk',2],['wipeL',4],['walkL',3]],
  g13: [['fade',1],['walk',2],['strike',3],['fade',4],['fade',4],['fade',4],['shake',4],['shake',4],['rear',5],['rear',5],['fade',6],['fade',6],['fade',6],['pulse',6]],
  g14: [['fade',1],['glow',2],['fade',1],['fade',1],['fade',1],['rise',1],['fade',1],['fade',1],['grow',3],['pop',4],['pop',4],['pop',5],['pop',5],['glow',6]],
  g15: [['wipe',2],['fade',1],['walk',3]],
  g16: [['fade',1],['rise',2],['fly',3],['fly',4]],
  g17: [['fade',1],['pop',2],['wipe',3],['glow',4]],
  g18: [['fade',1],['rise',2],['rise',2],['rise',2],['rise',3],['rise',3],['pop',4]],
  g19: [['fade',1],['rise',2],['fade',3],['sail',4]],
  g20: [['drift',1],['drift',2],['drop',4],['swim',3],['swim',3]],
  g21: [['grow',1],['fade',2],['fly',3]],
  g22: [['fade',1],['drift',1],['fade',2],['fade',2],['walk',3],['drop',4],['pop',5],['walk',6],['walkL',6]],
  g23: [['fade',1],['rise',2],['fade',1],['fade',1],['flyL',3]],
  g24: [['fade',1],['fade',1],['wipe',2],['fade',1],['fade',1],['flicker',7],['flicker',7],['walk',3],['walk',4],['walk',4],['walk',4],['walk',5],['walk',5],['walk',5],['walk',5],['fly',6]],
  g25: [['fade',1],['fade',2],['walkL',3],['walkL',3],['fade',4],['fade',4]],
  g26: [['fade',1],['grow',2],['grow',3],['strike',4]],
  g27: [['fade',1],['drift',2],['fade',3],['wipe',4]],
  g28: [['fade',1],['rise',1],['fade',2],['drop',2],['rise',3],['sail',4],['walk',4]],
  g29: [['fade',1],['grow',2],['pop',3],['pop',4],['pop',3],['pop',5],['pop',4]],
  g30: [['fade',1],['rise',2],['rise',4],['drop',3]],
  g31: [['fade',1],['glow',2],['grow',3],['pop',4]],
  g32: [['fade',1],['rise',2],['fade',3],['rise',4]],
  g33: [['fade',1],['glow',1],['fade',2],['rise',3],['fade',4],['fade',4],['fade',5],['fade',5],['walk',5],['pop',6],['fade',2]],
  g34: [['fade',1],['rise',1],['fade',3],['strike',3],['fade',2],['pop',4],['pop',4],['pop',5]],
  g35: [['drift',1],['sail',2],['sail',2],['sailL',2],['wipe',3],['wipe',4]],
  g36: [['drift',1],['fade',1],['wipe',2],['walk',3]]
});
/* >ANIM */
/** 꾀 그림 하나 — k = g01 ~ g36 · no = 제 몇 계(오른쪽 위 도장) · 빈 테두리(앨범 한 장) */
export function kkoePic(k, {w = 200, h = 150, seal = true, frame = true, cls = 'ik-kk', label: lab = null, anim = null} = {}) {
  const make = SC[k], n = +String(k).slice(1), items = make ? [make()].flat(9).filter(Boolean) : [];
  const svg = s('svg', {class: cls, viewBox: '0 0 200 150', width: w, height: h, role: 'img', 'aria-label': lab ?? '꾀 그림', 'data-k': k, focusable: 'false'},
    frame ? s('rect', {x: 1.5, y: 1.5, width: 197, height: 147, fill: 'none', stroke: INK, 'stroke-width': 1.2, 'stroke-opacity': 0.35}) : null,
    g(null, wrapItems(items, anim ?? ANIM[k] ?? null)),
    seal ? g(null, s('rect', {x: 166, y: 8, width: 26, height: 26, rx: 2, fill: ACC, 'fill-opacity': 0.9}), s('text', {x: 179, y: 27, 'font-size': 17, 'text-anchor': 'middle', fill: PAPER, 'font-weight': 800, class: 'ik-seal', text: String(n)})) : null);
  return watch(svg);
}
/** 꾀 그림 부품 목록(움직임을 정할 때 — 차례 · 부품 이름 · 꼴) */
export const inkItems = k => (SC[k] ? [SC[k]()].flat(9).filter(Boolean).map((el, i) => ({i, mo: moOf(el), tag: el.tagName})) : []);

/* ── 제1장 땅을 살피다 — 첫 쪽 형세 큰 그림(390 × 440) ── */
const LANDSHAPE = { // 땅마다 가운데 산세(봉우리 점 줄)와 앞 땅
  fall: {mid: [[0, 150], [60, 170], [130, 200], [200, 236], [270, 262], [390, 288]], far: [[0, 120], [80, 96], [160, 112], [250, 88], [390, 104]]},
  shake: {mid: [[0, 236], [50, 206], [90, 244], [140, 196], [190, 240], [240, 200], [290, 246], [340, 210], [390, 236]], far: [[0, 132], [70, 110], [150, 126], [230, 100], [390, 120]]},
  rise: {mid: [[0, 290], [80, 262], [160, 226], [230, 184], [300, 150], [390, 128]], far: [[0, 140], [90, 124], [180, 110], [280, 92], [390, 86]]},
  narrow: {mid: [[0, 120], [40, 116], [120, 132], [150, 250], [240, 250], [270, 132], [350, 118], [390, 124]], far: [[0, 110], [100, 96], [200, 104], [300, 94], [390, 102]]},
  calm: {mid: [[0, 232], [80, 222], [160, 230], [240, 220], [320, 228], [390, 224]], far: [[0, 150], [90, 136], [180, 146], [270, 132], [390, 142]]},
};
/** 형세 그림 — land · 깃발 열(up 개 섬) · 디딤돌 스물(path: 땅 열쇠 줄 · 끝 = 오늘) */
export function landPic({land = 'calm', name = '', up = 0, path = [], sameName = '', title = true} = {}) {
  const L = LANDSHAPE[land] ?? LANDSHAPE.calm, W = 390, H = 440, kids = [];
  // 움직임 일곱 단계 — 1 땅 · 2 해와 달 · 안개 · 손무 · 3 두건 끈 · 깃발이 하나씩 섬 · 5 「열에 ○」 · 6 디딤돌이 하나씩 · 7 오늘 돌이 빛남
  kids.push(M('fade', 1, farHills(L.far, 300, 0.07)));
  if (land === 'rise') kids.push(M('glow', 2, sun(318, 70, 18))); else if (land === 'calm') kids.push(M('glow', 2, moon(318, 70, 16))); else if (land === 'fall') kids.push(M('glow', 2, moon(320, 66, 13)));
  kids.push(M('rise', 1, mountain(L.mid, 330, {al: 0.16, w: 3.6, seed: 7, tex: 9})));
  if (land === 'shake') kids.push(M('drift', 2, waves(20, 370, 258, {rows: 4, amp: 5, gap: 11, seed: 4, w: 1.8})), M('fly', 3, ...[[60, 150], [300, 140]].map(([x, y]) => br([[x, y], [x + 30, y - 6], [x + 60, y + 2]], 1.6, {a: 0.2, b: 0.2, peak: 0.5, al: 0.5}))));
  if (land === 'calm') kids.push(M('drift', 2, waves(40, 350, 262, {rows: 3, amp: 1.2, gap: 12, seed: 5, al: 0.45})));
  if (land === 'narrow') kids.push(M('fade', 2, wash([[150, 250], [195, 236], [240, 250], [232, 300], [158, 300]], 0.1)));
  kids.push(M('drift', 2, mist(120, 214, 260, 26, 0.7), mist(300, 232, 200, 20, 0.6)));
  // 깃발 열 — 오른 몫만큼 섬(오른쪽 = 선 깃발)
  const bx = 24, by = 304;
  for (let i = 0; i < 10; i++) kids.push(M(i < up ? 'stand' : 'lean', 'ik-bq' + i, banner(bx + i * 28, by + (i % 2) * 3, 40, i < up, 0.9)));
  kids.push(M('fade', 6, label(bx + 126, by + 36, '열에 ' + ['영', '하나', '둘', '셋', '넷', '다섯', '여섯', '일곱', '여덟', '아홉', '열'][Math.max(0, Math.min(10, up))] + ' 올랐어요', {size: 19})));
  // 앞 언덕 · 손무(땅을 내려다봄)
  kids.push(M('fade', 1, wash([[296, 372], [322, 344], [362, 336], [390, 342], [390, 376]], 0.2)), M('walkL', 2, hero(350, 348, 0.78, {facing: -1, slips: true, st: 3})));
  // 디딤돌 스물 — 같은 땅 날 칠함 · 끝 = 오늘
  const P = path.slice(-20), n = P.length;
  for (let i = 0; i < n; i++) { const x = 22 + i * 17.4, y = 400 - Math.sin(i / 3) * 4; kids.push(M('pop', 'ik-tq' + i, stone(x, y, 6.4, P[i] === land, i === n - 1, 40 + i))); }
  if (n) kids.push(M('fade', 7, label(22, 432, (n === 20 ? '지난 스무 날' : '지난 ' + n + '거래일') + ' · ' + (sameName || '같은 땅') + ' ' + P.filter(k => k === land).length + '날', {size: 18, anchor: 'start'})), M('fade', 'ik-tq20', label(22 + (n - 1) * 17.4, 382, '오늘', {size: 17, c: NAVY})));
  return watch(s('svg', {class: 'ik-land', viewBox: `0 0 ${W} ${H}`, role: 'img', 'aria-label': (name || '오늘 땅') + ' 그림 · 깃발 열 가운데 ' + up + '개가 섬 · 지난 스무 날 디딤돌', 'data-land': land, 'data-up': String(up), 'data-stones': String(n), focusable: 'false'},
    title && name ? label(18, 46, name, {size: 38, anchor: 'start', cls: 'ik-t ik-brush', weight: 400}) : null, ...kids));
}

/** 화살 열 — 잃은 몫(lost = 0 ~ 10)만큼 꺾임 · 그림 아래 짧은 이름표 */
export function arrowsPic(lost, {say = null, w = 340, h = 96} = {}) {
  const kids = [];
  for (let i = 0; i < 10; i++) kids.push(M('shoot', 'ik-aq' + i, arrow(22 + i * 33, 66, 46, i >= 10 - lost, 1))); // 1 ~ 3 화살이 하나씩 날아와 섬 · 4 잃은 몫만큼 꺾임 · 5 이름표
  return watch(s('svg', {class: 'ik-arrows', viewBox: '0 0 340 96', width: w, height: h, role: 'img', 'aria-label': '화살 열 가운데 꺾인 화살 ' + lost + '개 · 꺾인 화살 = 잃은 싸움', 'data-lost': String(lost), focusable: 'false'},
    ...kids, say ? M('fade', 5, label(170, 92, say, {size: 18})) : null));
}

/** 한 달 산세 — 회사 한 달 값(21개)을 산등성이 먹선으로(제4장 성을 살피다) · 마지막 봉우리에 작은 성 */
export function ridgePic(sp, {first = '', last = '', down = false} = {}) {
  const W = 390, H = 220, P = 18, lo = Math.min(...sp), hi = Math.max(...sp), n = sp.length;
  const x = i => P + ((W - 2 * P) * i) / (n - 1), y = v => (hi === lo ? 110 : 40 + 120 * (1 - (v - lo) / (hi - lo)));
  const ridge = sp.map((v, i) => [x(i), y(v)]);
  return watch(s('svg', {class: 'ik-ridge', viewBox: `0 0 ${W} ${H}`, role: 'img', 'aria-label': '한 달 값 산세 · 한 달 전 ' + first + ' · 마지막 값 ' + last, 'data-mon': down ? 'dn' : 'up', focusable: 'false'},
    M('fade', 1, farHills([[0, 90], [100, 70], [220, 84], [390, 66]], 180, 0.06)), M('wipe', 2, mountain(ridge, 186, {al: 0.16, w: 3.4, seed: 21, tex: 8})), // 1 먼 산 · 2 산등성이가 왼쪽부터 · 3 한 달 전 줄 · 4 끝 봉우리 성 · 5 끝 점
    M('fade', 3, s('path', {d: `M${P} ${r1(y(sp[0]))}H${W - P}`, stroke: INK, 'stroke-width': 1.2, 'stroke-dasharray': '4 5', 'stroke-opacity': 0.55, fill: 'none'})),
    M('rise', 4, g(at(x(n - 1), y(sp[n - 1]) - 2, 0.42), P_.castle())), M('pulse', 5, dot(x(n - 1), y(sp[n - 1]), 4.4, 1, down ? NAVY : INK)),
    first ? M('fade', 5, label(P, 210, '한 달 전 ' + first, {size: 18, anchor: 'start'})) : null, last ? M('fade', 5, label(W - P, 210, last, {size: 18, anchor: 'end', c: down ? NAVY : INK})) : null));
}

/** 장수 작은 그림(쪽 머리 — 같은 장수가 장마다) — what = 'scroll'(꾀를 펼치다) · 'castle'(성을 살피다) · 'ledger'(장부) · 'book'(병서) */
export function heroPic(what = 'scroll') { // 움직임: 1 먼 산 · 땅 → 2 성 · 정자 · 책 · 두루마리가 섬(펼침) → 3 ~ 5 손무가 걸어 들어옴 · 두건 끈 · 편지
  const kids = [M('fade', 1, farHills([[0, 96], [90, 70], [180, 86], [300, 64], [390, 80]], 150, 0.07), wash([[0, 150], [120, 140], [260, 146], [390, 138], [390, 170], [0, 170]], 0.12))];
  if (what === 'castle') kids.push(M('rise', 2, g(at(110, 140, 1.25), P_.castle())), M('walkL', 3, hero(304, 152, 0.86, {facing: -1, slips: false, st: 4})));
  else if (what === 'ledger') kids.push(M('rise', 2, g(at(170, 150, 1.1), P_.pavilion())), M('rise', 3, sitter(170, 146, 0.8)), M('drop', 4, g(at(250, 148, 1), P_.letter())), M('walkL', 3, hero(334, 154, 0.8, {facing: -1, slips: true, st: 4})));
  else if (what === 'book') kids.push(...[0, 1, 2, 3, 4, 5].map(i => M('rise', 2 + (i >> 1), g(at(60 + i * 38, 140, 0.55), s('rect', {x: -22, y: -60, width: 44, height: 60, fill: INK, 'fill-opacity': 0.12 + (i % 2) * 0.08, stroke: INK, 'stroke-width': 1.2, 'stroke-opacity': 0.5})))), M('walkL', 5, hero(336, 154, 0.86, {facing: -1, slips: true, st: 6})));
  else kids.push(M('wipe', 2, s('rect', {x: 90, y: 92, width: 160, height: 46, fill: PAPER, stroke: INK, 'stroke-width': 1.6})), M('fade', 2, br([[86, 90], [86, 140]], 6, {a: 1, b: 1})), M('roll', 2, br([[254, 90], [254, 140]], 6, {a: 1, b: 1})), // 두루마리가 왼쪽에서 오른쪽으로 펼쳐짐
    M('fade', 4, ...[0, 1, 2, 3].map(i => br([[104 + i * 36, 104], [104 + i * 36, 128]], 3, {a: 0.6, b: 0.2, al: 0.7}))), M('walkL', 5, hero(322, 154, 0.86, {facing: -1, slips: true, st: 6})));
  return watch(s('svg', {class: 'ik-hero', viewBox: '0 0 390 170', role: 'img', 'aria-label': '손무 그림', 'data-hero': what, focusable: 'false'}, ...kids));
}

/** 정산 붓 막대 — 가운데 세로 먹줄 · 늘면 오른쪽 먹 획 · 줄면 왼쪽 남빛 획(길이 = 몫 · 늘고 줆 같은 크기) · r = 늘고 준 몫 · mx = 가장 큰 몫 */
export function brushBar(r, mx, {cls = 'sj-stbar'} = {}) {
  const w = r !== null && mx > 0 ? Math.max(4, Math.round((Math.abs(r) / mx) * 140)) : 0, up = r > 0;
  return watch(s('svg', {class: cls, viewBox: '0 0 300 22', preserveAspectRatio: 'none', 'aria-hidden': 'true', focusable: 'false', 'data-w': String(w), 'data-way': w ? (up ? 'up' : 'dn') : 'none'},
    M('fade', 1, br([[150, 1], [150, 21]], 1.6, {a: 1, b: 1, al: 0.6})), // 1 가운데 먹줄 · 2 붓 획이 가운데서 뻗음(늘면 오른쪽 · 줄면 왼쪽) · 3 끝에서 멈춤
    w ? M(up ? 'wipe' : 'wipeL', 2, br(up ? [[152, 12], [152 + w * 0.5, 10.5], [152 + w, 11.5]] : [[148, 12], [148 - w * 0.5, 10.5], [148 - w, 11.5]], 11, {a: 0.75, b: 0.3, peak: 0.25, c: up ? INK : NAVY, al: 0.88})) : null));
}

/* ── 손무(이야기의 한 사람 · 사장님 2026-11-16 00:32 「이사진이 손무 선생이다 … 기품있게 만들고 이기준으로 만귿어라 … 단 이그림 이 기준이다」)
   기준 그림의 모습만 따라 새로 그림(남의 그림을 베끼지 않음): 푸른 잿빛 두건과 뒤로 늘어진 두 끈 · 검은 머리 · 처진 콧수염과 뾰족한 턱수염 · 검은 깃이 「y」로 여민 흰 속깃 · 넓은 소매 · 죽간 */
function hero(x, y, sc = 1, o = {}) { return SONMU.stand(x, y, sc, o); }
export const sonmuBust = (x, y, sc = 1) => SONMU.bust(x, y, sc);
export const sonmuStand = (x, y, sc = 1, o = {}) => SONMU.stand(x, y, sc, o);
/** 손무 초상 한 장(첫 쪽 · 쪽 머리) — 가슴 위 · 한지 테두리 */
export function sonmuPic({w = 200, h = 240, cls = 'ik-sonmu'} = {}) {
  return watch(s('svg', {class: cls, viewBox: '0 0 200 240', width: w, height: h, role: 'img', 'aria-label': '손무 초상', focusable: 'false'},
    s('rect', {x: 1.5, y: 1.5, width: 197, height: 237, fill: PAPER, stroke: INK, 'stroke-width': 1.2, 'stroke-opacity': 0.35}), M('rise', 1, sonmuBust(100, 238, 1)))); // 1 손무가 떠오름 · 2 ~ 3 두건 끈이 바람에 날림
}

/* ── 「왜 사?」 · 매매일지 먹그림(주문 1116-0300 — 옛 꽃잎 · 시간 줄 · 기둥 · 막대를 지우고 손자병법 판으로 · 그림 일꾼이 빈 판에서 그림 · 아래 WHYK 덩이) ──
   whyPic(tones, cur) 열한 질문 디딤돌(고개 위 손무) · journalPic(items) 내 기록 길(돌 = 그날 판정 · 고리 = 한 달 뒤) · groupInk(rows) 네 묶음 붓 막대 · tallyInk(counts) 판정 셋 도장 */
export const whyPic = (tones, cur = null) => watch(WHYK.whyPic(tones, cur));
export const journalPic = items => watch(WHYK.journalPic(items));
export const groupInk = rows => watch(WHYK.groupInk(rows));
export const tallyInk = counts => watch(WHYK.tallyInk(counts));
/** 그림 부품 모음(시험 · 그림 일꾼이 장면을 짜 볼 때만 — 화면 코드는 위 함수를 바로 씀) */
export const KIT = Object.freeze({br, wash, dot, ring, line, g, at, motif, banner, arrow, stone, mountain, farHills, mist, waves, moon, sun, general, sitter, walker, label, GROUND, P_, s, INK, NAVY, PAPER, ACC, SOFT, rng});
/* SONMU< — 손무 그림(그림 일꾼 v2 · 빈 판에서 새로 그림) */
const SONMU = ((K) => {
  const {INK, NAVY, PAPER, ACC, SOFT} = K;
  const W = (P, al, c) => K.wash(P, al, c);
  const B = (P, w, a, b, peak, c = INK, al = 1) => K.br(P, w, {a, b, peak, c, al});
  // head in its own frame: face from y -32 (scarf edge) to 40 (chin); turned toward viewer's left
  const head = (k = 1) => {
    const face = [[-26, -24], [-28, -8], [-26, 8], [-20, 24], [-10, 36], [0, 40], [12, 34], [22, 20], [28, 2], [29, -16], [24, -28], [0, -32]];
    const scarf = [[-29, -20], [-22, -27], [-8, -30], [8, -30], [22, -27], [30, -23], [38, -28], [44, -38], [46, -50], [40, -60], [26, -68], [6, -70], [-12, -66], [-24, -56], [-31, -42], [-32, -30]];
    return [
      // hair behind ear (near side)
      W([[20, -26], [34, -28], [39, -14], [35, 2], [28, 6], [23, -8]], 0.9, INK),
      // face
      W(face, 1, PAPER), W(face, 0.16, ACC),
      // ear
      W([[25, -8], [31, -9], [33.5, -1], [31, 8], [26, 9]], 1, PAPER), W([[25, -8], [31, -9], [33.5, -1], [31, 8], [26, 9]], 0.2, ACC),
      B([[27, -8], [32, -6], [33.5, 2], [29, 9]], 2 * k, 0.4, 0.4, 0.5, INK, 0.75),
      // sideburn + far temple hair
      B([[24, -26], [23.5, -14], [22, -1]], 5.5 * k, 1, 0.25, 0.2),
      B([[-23, -25], [-27, -17], [-27.5, -9]], 3.6 * k, 1, 0.2, 0.15, INK, 0.92),
      // contour: far cheek, near jaw
      B([[-25, -20], [-28.5, -4], [-25.5, 12], [-18, 27]], 2.4 * k, 0.5, 0.4, 0.45, INK, 0.75),
      B([[28.5, -12], [28, 6], [22, 22], [12, 34]], 2.8 * k, 0.5, 0.35, 0.4, INK, 0.8),
      // brows — thin, outer ends lifted
      B([[-14.5, -13], [-20, -15.5], [-26, -18]], 2.4 * k, 0.6, 0.15, 0.3),
      B([[-2.5, -13], [6, -16.2], [16, -18.5]], 2.8 * k, 0.65, 0.15, 0.3),
      // eyes — level, narrowed, gaze to the left
      B([[-24.5, -5], [-20, -7.2], [-15, -5.6]], 2 * k, 0.4, 0.5, 0.5),
      B([[-23.5, -3.6], [-19.5, -3], [-16, -3.8]], 0.9 * k, 0.5, 0.5, 0.5, INK, 0.4),
      K.dot(-20.6, -4.9, 1.5 * Math.min(k, 1.5), 1, INK),
      B([[-3, -5.4], [3, -8], [10.5, -6.8], [14, -5]], 2.4 * k, 0.4, 0.6, 0.45),
      B([[-1, -3.4], [5, -2.4], [12, -3.6]], 1 * k, 0.5, 0.5, 0.5, INK, 0.45),
      B([[-1, -9.4], [6, -11], [13, -9.4]], 0.9 * k, 0.5, 0.5, 0.5, INK, 0.3),
      K.dot(3, -5.2, 1.9 * Math.min(k, 1.5), 1, INK),
      // nose — long and straight, tip toward the turn
      W([[-8.5, -6], [-5, 4], [-4, 12], [-9.5, 10]], 0.13, ACC),
      B([[-8, -9], [-10.2, 1], [-13.6, 10.6]], 1.8 * k, 0.3, 0.8, 0.7, INK, 0.82),
      B([[-14, 11], [-11, 14.2], [-7, 13.6], [-5, 12]], 1.6 * k, 0.6, 0.3, 0.3, INK, 0.82),
      B([[-4, 8.6], [-2.6, 11.8], [-5, 14]], 1.3 * k, 0.4, 0.4, 0.5, INK, 0.5),
      // mouth (mostly under the mustache)
      B([[-17, 23.4], [-9, 24.4], [0, 23.4]], 1.4 * k, 0.3, 0.3, 0.5, INK, 0.7),
      // mustache — long, ends drooping past the mouth corners
      B([[-9, 17], [-15, 18.4], [-20, 23], [-23, 31], [-24.5, 39]], 3.8 * k, 0.6, 0.05, 0.25),
      B([[-7.5, 17], [-2, 18], [4, 21], [7.5, 28.5], [8.5, 37]], 4 * k, 0.6, 0.05, 0.25),
      // pointed goatee
      B([[-8, 31], [-8.2, 42], [-9.5, 52], [-12, 63]], 11 * Math.min(k, 1.4) + 2.6, 0.5, 0.2, 0.32, PAPER, 1),
      B([[-9, 26], [-8.6, 33]], 3 * k, 0.9, 0.9, 0.5),
      B([[-8, 31], [-8.2, 42], [-9.5, 52], [-12, 63]], 11 * Math.min(k, 1.4), 0.4, 0.04, 0.32),
      // headscarf — blue-grey cloth, knot at the back
      W(scarf, 1, PAPER), W(scarf, 0.46, NAVY),
      B([[-25, -31], [-11, -50], [8, -61], [31, -58]], 2.2 * k, 0.3, 0.3, 0.5, NAVY, 0.6),
      B([[-14, -31], [1, -44], [22, -50], [41, -45]], 1.8 * k, 0.3, 0.3, 0.5, NAVY, 0.5),
      B([[-30, -20], [-18, -28.5], [0, -31.5], [18, -28.5], [31.5, -22]], 3.4 * k, 0.5, 0.6, 0.5, NAVY, 0.92),
      B([[-31, -30], [-26, -53], [-7, -68], [19, -69.5], [40, -60], [47, -46], [43, -32]], 3.6 * k, 0.45, 0.5, 0.45, INK, 0.88),
      W([[40, -47], [50, -51], [56, -42], [51, -33], [42, -34]], 1, PAPER),
      W([[40, -47], [50, -51], [56, -42], [51, -33], [42, -34]], 0.62, NAVY),
      B([[41, -48], [51, -51], [56.5, -42], [51, -32.5], [42, -34]], 2.2 * k, 0.5, 0.5, 0.5, INK, 0.85),
    ];
  };

  function bust(x, y, sc) {
    const RD = 'M -22 -108 C -50 -100 -78 -88 -90 -66 C -98 -48 -101 -24 -101 0 L 101 0 C 101 -24 99 -50 90 -70 C 80 -90 56 -102 24 -110 Z';
    return K.g(K.at(x, y, sc),
      // ties trailing behind the shoulders — 바람에 날림(움직임 ik-tie)
      K.s('g', {class: 'ik-m ik-tie ik-s2'}, B([[40, -196], [53, -170], [61, -140], [68, -108]], 10, 0.8, 0.5, 0.3, NAVY, 0.5),
        B([[36, -194], [44, -166], [47, -136], [51, -110]], 7.5, 0.8, 0.5, 0.3, NAVY, 0.42),
        B([[42, -196], [56, -170], [64, -140], [70, -108]], 1.6, 0.6, 0.6, 0.5, INK, 0.6)),
      // robe — pale paper-grey, few bold strokes
      K.s('path', {d: RD, fill: PAPER}), K.s('path', {d: RD, fill: SOFT, 'fill-opacity': 0.42}),
      K.s('path', {d: 'M -58 -92 C -80 -82 -96 -60 -100 -30 L -101 0 L -64 0 C -66 -30 -66 -60 -58 -92 Z', fill: SOFT, 'fill-opacity': 0.35}),
      K.s('path', {d: 'M 60 -96 C 80 -86 94 -62 98 -40 L 100 0 L 74 0 C 72 -40 70 -70 60 -96 Z', fill: SOFT, 'fill-opacity': 0.18}),
      B([[-20, -107], [-54, -97], [-82, -79], [-95, -48], [-100, -4]], 8, 0.3, 0.15, 0.35, INK, 0.9),
      B([[24, -109], [57, -99], [85, -81], [97, -50], [101, -6]], 8.5, 0.3, 0.2, 0.3, INK, 0.9),
      B([[-57, -74], [-64, -42], [-67, -3]], 4.5, 0.2, 0.1, 0.4, INK, 0.55),
      B([[63, -78], [69, -42], [71, -3]], 5, 0.2, 0.1, 0.4, INK, 0.55),
      B([[-30, -64], [-40, -40], [-44, -18]], 2.6, 0.2, 0.1, 0.4, ACC, 0.45),
      B([[30, -70], [36, -44], [38, -20]], 2.6, 0.2, 0.1, 0.4, ACC, 0.4),
      // back of the collar, behind the neck
      B([[-23, -110], [-17, -123], [2, -128], [19, -124], [25, -109]], 10, 0.9, 0.9, 0.5, INK, 0.92),
      // neck
      W([[-14, -136], [17, -138], [19, -104], [-13, -102]], 1, PAPER), W([[-14, -136], [17, -138], [19, -104], [-13, -102]], 0.17, ACC),
      B([[15, -134], [17.5, -114], [18.5, -104]], 2.4, 0.5, 0.5, 0.5, INK, 0.6),
      // inner lapel (under) then white inner collar
      B([[-19, -112], [-9, -95], [-1, -80]], 12, 0.95, 0.9, 0.5),
      B([[-11, -117], [-4, -105], [0, -96]], 4.4, 0.9, 0.5, 0.3, PAPER, 1),
      B([[-8.5, -117], [-1.6, -104], [1.8, -96]], 1, 0.6, 0.4, 0.4, INK, 0.7),
      // outer lapel — broad black band, "y": viewer's upper-right to lower-left
      B([[19, -112], [7, -88], [-12, -50], [-27, -22], [-38, -4]], 16, 0.95, 1, 0.5),
      B([[9, -116], [2, -103], [-4, -92]], 4.6, 0.9, 0.4, 0.3, PAPER, 1),
      B([[6.4, -116], [-0.6, -103], [-6.4, -92]], 1, 0.6, 0.4, 0.4, INK, 0.7),
      K.g(K.at(-4, -158, 1), ...head(1)),
    );
  }

  function stand(x, y, sc, {facing = -1, slips = true, st = 3} = {}) {
    const M = facing > 0 ? 'scale(-1 1)' : null;
    const sh = (facing + 1) * 1.5; // collar shift when mirrored (keeps the "y" crossing)
    const body = [[-4, -81], [-11, -78.5], [-15.5, -72], [-17.5, -60], [-17, -44], [-16, -24], [-18, -4], [-19.5, 0], [16.5, 0], [15.5, -6], [14.5, -26], [15.5, -46], [16.5, -62], [14.5, -73], [9, -78.5], [3, -81]];
    const sleeve = [[-17.5, -66], [-19.5, -54], [-19, -42], [-15.5, -34.5], [-9, -32], [-4, -34], [-1.6, -38], [1, -34], [6, -32], [13, -33.5], [17.5, -40], [18.5, -53], [16.5, -64], [8, -58.5], [-2, -56], [-10, -58.5]];
    const back = K.g(M,
      K.s('g', {class: 'ik-m ik-tie ik-s' + st}, B([[6, -94], [10, -87], [13.5, -78], [17, -66]], 2.6, 0.8, 0.45, 0.3, NAVY, 0.62),
        B([[5, -93], [7.6, -85], [9.6, -77], [11.5, -68]], 2, 0.8, 0.45, 0.3, NAVY, 0.52)),
      W(body, 1, PAPER), W(body, 0.45, SOFT),
      W([[-17.5, -30], [-8, -30], [-10, 0], [-19.5, 0]], 0.38, SOFT),
      B([[-11, -78.5], [-16, -70], [-18, -58], [-19, -46]], 2.6, 0.3, 0.3, 0.4, INK, 0.9),
      B([[9.5, -78.5], [15, -70], [17, -58], [18, -46]], 2.6, 0.3, 0.3, 0.4, INK, 0.9),
      B([[-15.5, -34], [-16.5, -18], [-18.5, -2]], 2.3, 0.5, 0.3, 0.4, INK, 0.85),
      B([[13.5, -34], [14.5, -18], [15.5, -2]], 2.3, 0.5, 0.3, 0.4, INK, 0.85),
      B([[-19.5, -0.8], [-8, 0.4], [4, 0.4], [16.5, -0.8]], 1.8, 0.6, 0.6, 0.5, INK, 0.8),
      B([[4.5, -31], [5.5, -15], [6.5, -2]], 1.1, 0.4, 0.3, 0.4, INK, 0.45),
      // dark trim of the robe front, below the sleeves
      B([[-7, -31.5], [-8.6, -16], [-10.6, -0.5]], 2.8, 0.9, 1, 0.5, INK, 0.92),
      B([[-12, -0.4], [-17.2, 0.3]], 2.8, 1, 0.5, 0.3),
      B([[-2.5, 0.2], [-7.6, 0.8]], 2.6, 1, 0.5, 0.3),
      slips ? K.g(K.at(20.5, -57, 1, 24),
        K.s('rect', {x: -3.4, y: -12, width: 6.8, height: 24, rx: 2.4, fill: PAPER}),
        K.s('rect', {x: -3.4, y: -12, width: 6.8, height: 24, rx: 2.4, fill: ACC, 'fill-opacity': 0.6, stroke: INK, 'stroke-width': 1.1, 'stroke-opacity': 0.85}),
        K.line(-1.1, -11, -1.1, 11, 0.5, INK, 0.5), K.line(1.2, -11, 1.2, 11, 0.5, INK, 0.5),
        K.line(-3.6, -6.5, 3.6, -6.5, 1, INK, 0.9), K.line(-3.6, 6, 3.6, 6, 1, INK, 0.9),
      ) : null,
    );
    // collar (never mirrored, so the crossing always reads as "y")
    const collar = K.g(null,
      B([[-5.6 + sh, -80], [-2.5 + sh, -83.2], [2.5 + sh, -83.4], [6 + sh, -80]], 2.4, 0.9, 0.9, 0.5, INK, 0.92),
      W([[-3 + sh, -85], [2.6 + sh, -85.4], [3 + sh, -80], [-2.6 + sh, -79.6]], 1, PAPER),
      W([[-3 + sh, -85], [2.6 + sh, -85.4], [3 + sh, -80], [-2.6 + sh, -79.6]], 0.17, ACC),
      B([[-4.4 + sh, -80.8], [-2.4 + sh, -77.6], [-0.6 + sh, -74]], 2.8, 0.95, 0.9, 0.5),
      B([[-2.6 + sh, -82.4], [-1 + sh, -79.6]], 1, 0.9, 0.5, 0.4, PAPER, 1),
      B([[4 + sh, -81], [1.4 + sh, -75], [-2.4 + sh, -67], [-5.6 + sh, -59]], 3.6, 0.95, 1, 0.5),
      B([[2.2 + sh, -82.6], [0.4 + sh, -78.6]], 1.1, 0.9, 0.5, 0.4, PAPER, 1),
    );
    const front = K.g(M,
      W(sleeve, 1, PAPER), W(sleeve, 0.5, SOFT),
      W([[-19, -50], [-15, -36], [-9, -33], [-9, -44], [-14, -56]], 0.3, SOFT),
      B([[-12, -55], [-13, -46], [-11, -37]], 1, 0.4, 0.3, 0.5, INK, 0.4),
      B([[10, -55], [11, -46], [9, -37]], 1, 0.4, 0.3, 0.5, INK, 0.4),
      B([[-2.4, -55.4], [-2.2, -49]], 2.6, 0.9, 0.2, 0.2, INK, 0.45),
      B([[-2, -55], [-1.8, -47], [-1.6, -38]], 1.4, 0.4, 0.6, 0.5, INK, 0.7),
      B([[-17.5, -64], [-19.5, -53], [-18.8, -42], [-15.5, -35], [-9, -32.2], [-4, -34], [-1.6, -38]], 2.6, 0.3, 0.6, 0.5, INK, 0.88),
      B([[-1.6, -38], [1, -34], [6, -32.2], [13, -33.6], [17.5, -40.5], [18.6, -52], [16.5, -63]], 2.6, 0.6, 0.3, 0.5, INK, 0.88),
      B([[-16.5, -63], [-9, -58], [-2, -55.5]], 1.8, 0.5, 0.7, 0.5, INK, 0.75),
      B([[15.5, -62], [8, -58], [-2, -55.5]], 1.8, 0.5, 0.7, 0.5, INK, 0.75),
      K.g(K.at(-1, -89, 0.14), ...head(2.2)),
    );
    return K.g(K.at(x, y, sc), back, collar, front);
  }

  return {bust, stand};
})(KIT);
/* >SONMU */
/* WHYK< — 「왜 사?」 · 매매일지 그림(그림 일꾼 · 빈 판에서 새로 그림) */
const WHYK = ((K, F) => {
  const {INK, NAVY, PAPER, ACC, SOFT} = K;
  const r1 = v => Math.round(v * 10) / 10;
  // wobbly ellipse points (same every draw)
  const blob = (x, y, rx, ry, seed = 1, n = 26) => {
    const P = [];
    for (let i = 0; i < n; i++) {
      const t = (i / n) * Math.PI * 2, k = 1 + 0.06 * Math.sin(3 * t + seed * 1.7) + 0.045 * Math.sin(5 * t + seed * 2.9);
      P.push([x + Math.cos(t) * rx * k, y + Math.sin(t) * ry * k]);
    }
    return P;
  };
  const outline = (P, w = 1.6, c = INK, al = 0.75, fill = PAPER) => K.s('path', {d: 'M' + P.map(p => r1(p[0]) + ' ' + r1(p[1])).join('L') + 'Z', fill, stroke: c, 'stroke-width': w, 'stroke-opacity': al, 'stroke-linejoin': 'round'});
  // tone shape: g = ink circle, y = acc triangle, r = navy square
  const mark = (tone, x, y, k) => {
    if (tone === 'g') return K.dot(x, y, k, 1, INK);
    if (tone === 'y') return K.s('path', {d: `M${r1(x)} ${r1(y - k * 1.15)}L${r1(x + k * 1.12)} ${r1(y + k * 0.8)}L${r1(x - k * 1.12)} ${r1(y + k * 0.8)}Z`, fill: ACC});
    if (tone === 'r') return K.s('rect', {x: r1(x - k * 0.88), y: r1(y - k * 0.88), width: r1(k * 1.76), height: r1(k * 1.76), fill: NAVY});
    return null;
  };
  const tq = i => 'ik-tq' + Math.max(0, Math.min(20, i | 0));
  const svg = (cls, vb, aria, extra, kids) => K.s('svg', {class: cls, viewBox: vb, role: 'img', 'aria-label': aria, focusable: 'false', ...extra}, ...kids.flat().filter(Boolean));

  /* 1. 사기 전 열한 물음 — 산길 디딤돌 열하나 · 고개 위 손무가 뒤돌아 내려다봄 */
  function whyPic(tones = [], cur = null) {
    const T = Array.from({length: 11}, (_, i) => tones[i] ?? null);
    const S = [[40, 330], [100, 319], [160, 307], [220, 295], [274, 268], [224, 237], [164, 223], [104, 208], [66, 174], [146, 152], [228, 131]];
    const PASS = [298, 106];
    const done = T.filter(Boolean).length;
    const c = Number.isInteger(cur) && cur >= 0 && cur <= 10 ? cur : null;
    const kids = [
      K.M('fade', 1, K.farHills([[0, 74], [60, 54], [130, 66], [200, 44], [262, 58], [330, 26], [390, 38]], 160, 0.06)),
      K.M('fade', 1, K.mountain([[0, 150], [52, 120], [122, 98], [192, 86], [252, 92], [298, 106], [334, 70], [366, 44], [390, 52]], 360, {al: 0.07, w: 3, seed: 5, tex: 7})),
      K.M('fade', 2, K.mist(120, 190, 260, 16, 0.55), K.mist(300, 300, 200, 14, 0.5)),
      K.M('wipe', 2, K.br([...S, PASS], 10, {a: 0.7, b: 0.5, peak: 0.5, al: 0.13})),
      K.M('rise', 3, F.stand(PASS[0] + 8, PASS[1] + 3, 0.68, {facing: -1, slips: true, st: 4})),
    ];
    S.forEach(([x, y], i) => {
      const t = T[i], P = blob(x, y, 19, 12, i + 3), now = i === c;
      kids.push(K.M('pop', tq(i), K.s('g', {class: 'ik-wq', 'data-q': String(i + 1), 'data-tone': t || 'none'},
        t ? K.wash(P, 0.16, INK) : null,
        outline(P, t ? 1.7 : 1.6, INK, t ? 0.85 : 0.7, t ? 'none' : PAPER),
        t ? mark(t, x, y + 0.5, 6.4) : null,
        K.label(x, y - 20, String(i + 1), {size: 17, c: now ? NAVY : INK}))));
    });
    if (c !== null) kids.push(K.M('pulse', 'ik-tq21', K.s('ellipse', {cx: S[c][0], cy: S[c][1], rx: 27, ry: 18, fill: 'none', stroke: NAVY, 'stroke-width': 2.4})));
    return svg('ik-why', '0 0 390 360', '사기 전 열한 물음 — ' + done + '개 답함', {'data-done': String(done), 'data-cur': c === null ? '' : String(c)}, kids);
  }

  /* 2. 매매 일기 — 왼쪽에서 오른쪽으로 난 붓 길 · 기록마다 돌 하나 · 위의 작은 고리 = 한 달 뒤 */
  function journalPic(items = []) {
    const L = (items || []).slice(0, 40);
    const Y = x => 236 - 0.09 * x + 8 * Math.sin(x / 48);
    const path = []; for (let x = 4; x <= 386; x += 22) path.push([x, Y(x)]);
    path.push([386, Y(386)]);
    const X0 = 22, X1 = 314, XT = 326;
    const kids = [
      K.M('fade', 1, K.farHills([[0, 150], [70, 118], [150, 140], [232, 106], [312, 128], [390, 96]], 270, 0.055)),
      K.M('fade', 1, K.mountain([[0, 166], [46, 136], [104, 154], [160, 140], [214, 162]], 270, {al: 0.05, w: 2.2, seed: 8, tex: 3})),
      K.M('fade', 2, K.mist(140, 200, 300, 12, 0.5)),
      K.M('wipe', 2, K.br(path, 9, {a: 0.5, b: 0.4, peak: 0.4, al: 0.2})),
      K.M('fade', 3, K.br([[XT, Y(XT) - 30], [XT, Y(XT) + 10]], 2, {a: 0.6, b: 0.6, c: NAVY, al: 0.75}), K.label(XT, Y(XT) - 38, '오늘', {size: 17, c: NAVY})),
      K.M('walkL', 3, F.stand(364, Y(364) + 3, 0.46, {facing: -1, slips: true, st: 4})),
    ];
    if (!L.length) {
      kids.push(K.M('fade', 2, K.label(186, 104, '아직 기록이 없어요', {size: 19})), K.M('fade', 3, K.label(186, 136, '「왜 사?」에 답하면 돌이 놓여요', {size: 17, c: ACC, weight: 600})));
    } else {
      const n = L.length, d = Math.min(14, (X1 - X0) / Math.max(1, n - 1));
      const ord = L.map((it, i) => ({it, i, X: X0 + Math.max(0, Math.min(1, +it.x || 0)) * (X1 - X0)})).sort((a, b) => a.X - b.X || a.i - b.i);
      for (let k = 1; k < n; k++) ord[k].X = Math.max(ord[k].X, ord[k - 1].X + d);
      ord[n - 1].X = Math.min(ord[n - 1].X, X1);
      for (let k = n - 2; k >= 0; k--) ord[k].X = Math.min(ord[k].X, ord[k + 1].X - d);
      const rx = d >= 12 ? 8 : 6.2, ry = rx * 0.68;
      ord.forEach(({it, X}, k) => {
        const y = Y(X), ty = y - 21, due = !!it.due, rr = rx >= 8 ? 4.4 : 3.6;
        const P = blob(X, y, rx, ry, k + 2, 18);
        kids.push(K.M('pop', tq(n > 21 ? Math.round((k * 20) / (n - 1)) : k), K.s('g', {class: 'ik-jr', 'data-tone': it.tone || 'none', 'data-due': due ? '1' : '0', 'data-kept': it.kept || ''},
          K.line(X, y - ry - 1.5, X, ty + rr + 1, 1, SOFT, 0.9),
          K.wash(P, 0.14, INK), outline(P, 1.2, INK, 0.8, 'none'),
          mark(it.tone, X, y + 0.3, rx * 0.5),
          K.s('circle', {cx: r1(X), cy: r1(ty), r: rr, fill: due ? NAVY : PAPER, stroke: NAVY, 'stroke-width': 1.3, 'stroke-opacity': due ? 1 : 0.6}),
          it.kept === 'no' ? K.line(X - rr - 1.5, ty + rr + 1.5, X + rr + 1.5, ty - rr - 1.5, 1.4, due ? PAPER : NAVY) : null,
          it.kept === 'yes' && due ? K.dot(X, ty, 1.5, 1, PAPER) : null)));
      });
    }
    return svg('ik-journal', '0 0 390 300', L.length ? '매매 일기 — 기록 ' + L.length + '개' : '매매 일기 — 아직 기록 없음', {'data-n': String(L.length)}, kids);
  }

  /* 3. 네 갈래 준비 — 이유 · 돈 · 때 · 마음 · 붓 막대 길이 = 준비된 몫 */
  function groupInk(rows = []) {
    const R = (rows || []).slice(0, 4), XS = 80, LEN = 220;
    const kids = [];
    R.forEach((row, i) => {
      const y = 38 + i * 48, mx = Math.max(1, +row.max || 1), rd = row.ready == null ? null : Math.max(0, Math.min(mx, +row.ready));
      const len = rd == null ? 0 : rd === 0 ? 0 : Math.max(10, (rd / mx) * LEN);
      kids.push(K.M('fade', 1, K.label(16, y + 6, row.n, {size: 18, anchor: 'start'}),
        K.br([[XS, y + 1], [XS + LEN / 2, y], [XS + LEN, y + 1]], 2, {a: 1, b: 1, c: SOFT, al: 0.7}),
        K.br([[XS - 2, y - 11], [XS - 2, y + 12]], 2.2, {a: 0.7, b: 0.5, al: 0.8})));
      if (len) kids.push(K.M('wipe', 2 + i, K.br([[XS, y + 1.5], [XS + len * 0.5, y - 1], [XS + len, y + 0.5]], 15, {a: 0.75, b: 0.3, peak: 0.25, c: rd >= mx ? NAVY : INK, al: 0.88})));
      kids.push(K.M('fade', 2 + i, K.label(376, y + 6, (rd == null ? '–' : String(rd)) + ' / ' + mx, {size: 17, anchor: 'end', c: rd == null ? ACC : INK})));
    });
    return svg('ik-groups', '0 0 390 220', '네 갈래 준비 — ' + R.map(r => r.n + ' ' + (r.ready == null ? '안 함' : r.ready + '/' + r.max)).join(', '), {}, kids);
  }

  /* 4. 판정 세 가지 — 도장 셋 · 안에 몇 번 · 아래 이름 */
  function tallyInk(counts = []) {
    const C = [0, 1, 2].map(i => counts[i] || {name: ['쉬어', '반만', '준비됨'][i], v: 0});
    const COL = [NAVY, ACC, INK], XS = [70, 195, 320], ROT = [-4, 3, -2];
    const kids = [K.M('fade', 1, K.br([[18, 150], [195, 147], [372, 150]], 1.6, {a: 0.4, b: 0.4, c: SOFT, al: 0.6}))];
    C.forEach((c, i) => {
      const x = XS[i], y = 68, v = Math.max(0, +c.v || 0);
      const P = []; for (let k = 0; k < 24; k++) { const t = (k / 24) * Math.PI * 2, sq = 1 / Math.max(Math.abs(Math.cos(t)), Math.abs(Math.sin(t))), w = 1 + 0.035 * Math.sin(7 * t + i * 2); P.push([Math.cos(t) * Math.min(sq, 1.3) * 36 * w, Math.sin(t) * Math.min(sq, 1.3) * 36 * w]); }
      kids.push(K.M('pop', 2 + i, K.g(K.at(x, y, 1, ROT[i]),
        K.wash(P, 0.92, COL[i]),
        K.s('rect', {x: -29, y: -29, width: 58, height: 58, rx: 4, fill: 'none', stroke: PAPER, 'stroke-width': 1.6, 'stroke-opacity': 0.75}),
        K.s('text', {x: 0, y: 9, class: 'g-tk', 'font-size': 25, 'text-anchor': 'middle', fill: PAPER, 'font-weight': 700, text: v + '번'}))));
      kids.push(K.M('fade', 2 + i, K.s('text', {x, y: 136, class: 'g-ts', 'font-size': 18, 'text-anchor': 'middle', fill: INK, 'font-weight': 700, text: c.name})));
    });
    return svg('ik-tally', '0 0 390 170', '판정 — ' + C.map(c => c.name + ' ' + (+c.v || 0) + '번').join(', '), {}, kids);
  }

  return {whyPic, journalPic, groupInk, tallyInk};
})({...KIT, M}, {stand: (x, y, sc, o) => SONMU.stand(x, y, sc, o)});
/* >WHYK */
