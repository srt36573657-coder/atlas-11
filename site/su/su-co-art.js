/* 수르 — 회사 쪽 큰 그림 「su-co-art」(주문 1023 「머스크 판 4」 · 넷째 판 — docs/design/su-musk-2026-11-05/r4-brief.md 「C」 · judge-r3.md 공통 여덟)
   일곱째 판(r7-brief.md 「C」 · judge-r6.md): 아치 띠 무늬 「꽃 · 점 · 마름모 · 점」 한 박자 · 머리는 뒤통수에서 이어진 가는 가닥이 띠 아래를 따라 좌우로 흐름 · 창 머리는 메달 둘레로 오목하게 · 창 안 빛살 없음
   · 아래 두 칸은 칸마다 큰 값 하나만 크게(나머지 작은 한 줄) · 지붕에 큰 상징 · 아랫단 둥글게 닫음 · 금선은 어깨 · 바닥 귀퉁이에서 소용돌이로 풂
   사장님 「… 알폰스 무하 … 그의 화풍이 짙게 묻어 나오게 하라」 · 「정말 아름답게, 정말 아름답게 수르가 되어야 한다」
   한 장 = 무하 포스터(viewBox 0 0 390 620) — 위 아치(회사 이름을 아치 따라 휘어 씀) 안 공용 메달 여인(su-mucha-kit medallion v=3 · 반측면 · 머리가 테 밖으로)
     → 위가 둥근 창(금 두 줄 테 · 머리에 금 덩굴 · 옅은 빛살) 안 한 달 줄(회사 polyline 그대로 + 굵다가 가늘어지는 금 리본 · 시장 polyline 그대로 + 잎 몇 장 덩굴 · 처음 = 100 금 구슬 줄)
     → 끝값 이름표(su-lg-c · su-lg-i · 값 tspan.v · 기간은 창 머리에 한 번 — 두 값의 기간이 다르면 값마다)
     → 「왜 여기 있나」 길(업종 두루마리 → 목록마다 위가 둥근 아치 창 · 기간은 창 머리에 한 번 · su-21.js whyRoad 와 같은 값) · 21곳 밖은 아치 머리 글씨판에 업종 두루마리
   흰 상자 없음 · 글씨는 처음부터 진하게(움직임은 꽃 · 별 · 머리카락에만 transform · 들어옴 0.6초 안) · 여인 · 두루마리는 고정 색(어두운 판에서도 같은 색)
   같은 틀을 su-more-art 가 씀(MU.poster) · 보안: createElementNS · setAttribute 만 · 옛 아이폰 사파리를 위해 뒤돌아보기 글꼴 · .at() · ??= 없음 */
import {s} from '/su/su-fig.js';
import {CODE, pct, dateKo, coLine, idxLine} from '/su/su-data.js';
import {NEED, num} from '/su/su-six.js';
import {KIND} from '/su/su-21.js';
import {medallion, scroll as kScroll, vine as kVine, beads as kBeads, taper as kTaper} from './su-mucha-kit.js';

export const CSS = '/su/su-co-art.css';
const W = 390, HT = 620, CX = 195, KEY = ['hot', 'bloom', 'money'];
const fin = v => typeof v === 'number' && Number.isFinite(v);
const r1 = v => Math.round(v * 10) / 10;
const lastOf = a => (Array.isArray(a) && a.length ? a[a.length - 1] : null);
/* whyRoad 와 같은 꼴(su-21.js sgn · sgnP 그대로) */
const sgn = x => (fin(x) ? (x > 0 ? '+' : x < 0 ? '−' : '') + num(Math.abs(Math.round(x * 10) / 10)) : NEED);
const sgnP = x => (fin(x) ? sgn(x) + '%' : NEED);
const indHref = n => '#/i/' + encodeURIComponent(n);
const dk = d => (typeof d === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(d) ? dateKo(d) : null);
let SEQ = 0;

/* ── 글 폭 어림(한글 1 · 숫자 0.6 · 영어 0.56~0.72 글자) · 줄 나누기(띄어쓰기 · 가운뎃점 뒤에서 · 글은 바꾸지 않음) ── */
const EM = ch => (/[가-힣㄰-㆏]/.test(ch) ? 1 : /[0-9]/.test(ch) ? 0.6 : /[A-Z&]/.test(ch) ? 0.72 : /[a-z]/.test(ch) ? 0.56 : ch === ' ' ? 0.3 : /[·.,:]/.test(ch) ? 0.36 : ch === '%' ? 0.9 : ch === '›' ? 0.5 : 0.66);
const tw = (t, px, ls = 0) => Array.from(String(t == null ? '' : t)).reduce((a, ch) => a + EM(ch) + ls, 0) * px;
function hard(l, px, maxW) {
  const chs = Array.from(l), k = Math.max(1, Math.ceil(tw(l, px) / maxW)), per = Math.ceil(chs.length / k), even = [];
  for (let i = 0; i < chs.length; i += per) even.push(chs.slice(i, i + per).join(''));
  if (even.every(x => tw(x, px) <= maxW)) return even;
  const out = []; let cur = ''; for (const ch of chs) { if (cur && tw(cur + ch, px) > maxW) { out.push(cur); cur = ch; } else cur += ch; } if (cur) out.push(cur); return out;
}
function wrapW(t, px, maxW) {
  const toks = []; let cur = '';
  for (const ch of Array.from(String(t == null ? '' : t))) { cur += ch; if (ch === ' ' || ch === '·') { toks.push(cur); cur = ''; } }
  if (cur) toks.push(cur);
  const out = []; let line = '';
  for (const k of toks) { if (line.trim() && tw((line + k).trim(), px) > maxW) { out.push(line.trim()); line = k; } else line += k; }
  if (line.trim()) out.push(line.trim());
  const all = out.reduce((a, l) => a.concat(tw(l, px) <= maxW ? [l] : hard(l, px, maxW)), []);
  return all.length ? all : [''];
}
/** 고른 줄 나누기 — 한 줄에 안 들고 두 줄이면 두 줄 길이가 가장 비슷한 띄어쓰기 자리에서(「돈이 몰리는 / 7곳에 듦」) */
function wrapB(t, px, maxW) {
  const L = wrapW(t, px, maxW);
  if (L.length !== 2) return L;
  const w = String(t).split(' ');
  let best = L, bw = Math.max(tw(L[0], px), tw(L[1], px));
  for (let i = 1; i < w.length; i++) { const a = w.slice(0, i).join(' '), b = w.slice(i).join(' '), m = Math.max(tw(a, px), tw(b, px)); if (m <= maxW && m < bw) { best = [a, b]; bw = m; } }
  return best;
}
/** 기간 줄 — 한 줄에 들면 한 줄 · 아니면 「한 달 · 10월 2일」 / 「~ 11월 3일」처럼 물결 앞에서 나눔 */
function spanLines(len, a, b, px, maxW) {
  if (!a && !b) return [];
  const one = len + ' · ' + (a && b ? a + ' ~ ' + b : (a || b) + '까지');
  if (tw(one, px) <= maxW) return [one];
  return a && b ? [len + ' · ' + a, '~ ' + b] : [len, (a || b) + '까지'];
}

/* ═══ 무하 붓 — 3차 베지에를 점으로 · 굵기가 변하는 채운 모양(굵게 시작해 가늘게 빠지는 선) ═══ */
function segsOf(d) { // 'M x y C x1 y1 x2 y2 x y …'(절대 좌표 · M 과 C 만)
  const n = (String(d).match(/-?\d*\.?\d+/g) || []).map(Number), out = []; let p = [n[0], n[1]];
  for (let i = 2; i + 5 < n.length; i += 6) { const q = [[n[i], n[i + 1]], [n[i + 2], n[i + 3]], [n[i + 4], n[i + 5]]]; out.push([p, q[0], q[1], q[2]]); p = q[2]; }
  return out;
}
const bz = (g, t) => { const u = 1 - t, a = u * u * u, b = 3 * u * u * t, c = 3 * u * t * t, e = t * t * t; return [a * g[0][0] + b * g[1][0] + c * g[2][0] + e * g[3][0], a * g[0][1] + b * g[1][1] + c * g[2][1] + e * g[3][1]]; };
function along(d, n) { const P = []; segsOf(d).forEach((g, k) => { for (let i = k ? 1 : 0; i <= n; i++) P.push(bz(g, i / n)); }); return P; }
/** 붓선 — 가운데 줄 d 를 따라 굵기 wf(0 ~ 1) 로 채운 모양 */
function brush(d, wf, n = 12) {
  const P = along(d, n), L = [], R = [], m = P.length - 1;
  P.forEach((p, i) => { const a = P[Math.max(0, i - 1)], b = P[Math.min(m, i + 1)], dx = b[0] - a[0], dy = b[1] - a[1], l = Math.hypot(dx, dy) || 1, w = Math.max(0.2, wf(i / m)) / 2;
    L.push(r1(p[0] - dy / l * w) + ' ' + r1(p[1] + dx / l * w)); R.push(r1(p[0] + dy / l * w) + ' ' + r1(p[1] - dx / l * w)); });
  return 'M' + L.join('L') + 'L' + R.reverse().join('L') + 'Z';
}
const fall = (a, b) => t => a + (b - a) * t;
const swell = (a, b) => t => a + (b - a) * Math.sin(Math.PI * Math.min(1, t * 1.1));
/** 꺾은선 리본 — 점과 점을 곧게 잇는 그대로(줄 모양을 바꾸지 않음) 굵기만 wf(0 ~ 1)로 · 마디는 둥글게 · [마디 사이 판, 마디 원] 두 path(감김 방향이 같아 구멍 없음) */
function ribbonD(P, wf) {
  const L = [0]; for (let i = 1; i < P.length; i++) L.push(L[i - 1] + Math.hypot(P[i][0] - P[i - 1][0], P[i][1] - P[i - 1][1]));
  const tot = L[L.length - 1] || 1, w = i => Math.max(0.3, wf(L[i] / tot)) / 2; let q = '', c = '';
  for (let i = 1; i < P.length; i++) {
    const [x1, y1] = P[i - 1], [x2, y2] = P[i], l = Math.hypot(x2 - x1, y2 - y1) || 1, nx = -(y2 - y1) / l, ny = (x2 - x1) / l, a = w(i - 1), b = w(i);
    q += `M${r1(x1 + nx * a)} ${r1(y1 + ny * a)}L${r1(x2 + nx * b)} ${r1(y2 + ny * b)}L${r1(x2 - nx * b)} ${r1(y2 - ny * b)}L${r1(x1 - nx * a)} ${r1(y1 - ny * a)}Z`;
  }
  P.forEach((p, i) => { const r = Math.max(0.2, w(i)); c += `M${r1(p[0] - r)} ${r1(p[1])}a${r1(r)} ${r1(r)} 0 1 0 ${r1(2 * r)} 0a${r1(r)} ${r1(r)} 0 1 0 ${r1(-2 * r)} 0Z`; });
  return [q, c];
}
/** 위가 둥근 창 — x0 ~ x1 · 꼭대기 top · 어깨까지 ry · 바닥 bot */
const archD = (x0, x1, top, ry, bot) => `M${r1(x0)} ${r1(bot)}V${r1(top + ry)}A${r1((x1 - x0) / 2)} ${r1(ry)} 0 0 1 ${r1(x1)} ${r1(top + ry)}V${r1(bot)}Z`;
/** 창 머리 위 점 — t 0 = 왼 어깨 · 0.5 = 꼭대기 · 1 = 오른 어깨 · [x, y, 기울기(도)] */
const archPt = (x0, x1, top, ry, t) => { const rx = (x1 - x0) / 2, a = Math.PI * (1 - t); return [x0 + rx + rx * Math.cos(a), top + ry - ry * Math.sin(a), Math.atan2(ry * Math.cos(a), rx * Math.sin(a)) * 180 / Math.PI]; };
/** 위가 둥근 창인데 메달이 걸리는 곳은 메달 둘레를 따라 오목하게 — N = {cx, cy, r}(메달 + 틈) · {d, t1}(t1 = 오목이 시작하는 창 머리 자리) */
function winD(x0, x1, top, ry, bot, N) {
  const rx = (x1 - x0) / 2, yc = top + ry, dd = t => { const p = archPt(x0, x1, top, ry, t); return Math.hypot(p[0] - N.cx, p[1] - N.cy) - N.r; };
  if (!N || dd(0.5) >= 0) return {d: archD(x0, x1, top, ry, bot), t1: 0.5};
  const cut = (a, b) => { for (let i = 0; i < 32; i++) { const m = (a + b) / 2; if (dd(m) > 0) a = m; else b = m; } return a; };
  const t1 = cut(0.02, 0.5), t2 = cut(0.98, 0.5);
  const P1 = archPt(x0, x1, top, ry, t1), P2 = archPt(x0, x1, top, ry, t2);
  return {d: `M${r1(x0)} ${r1(bot)}V${r1(yc)}A${r1(rx)} ${r1(ry)} 0 0 1 ${r1(P1[0])} ${r1(P1[1])}A${r1(N.r)} ${r1(N.r)} 0 0 0 ${r1(P2[0])} ${r1(P2[1])}A${r1(rx)} ${r1(ry)} 0 0 1 ${r1(x1)} ${r1(yc)}V${r1(bot)}Z`, t1};
}
/** 아랫단을 둥글게 닫은 아치 칸 — 바닥 귀퉁이 반지름 rb */
const panD = (x0, x1, top, ry, bot, rb) => `M${r1(x0)} ${r1(bot - rb)}V${r1(top + ry)}A${r1((x1 - x0) / 2)} ${r1(ry)} 0 0 1 ${r1(x1)} ${r1(top + ry)}V${r1(bot - rb)}Q${r1(x1)} ${r1(bot)} ${r1(x1 - rb)} ${r1(bot)}H${r1(x0 + rb)}Q${r1(x0)} ${r1(bot)} ${r1(x0)} ${r1(bot - rb)}Z`;
/** 금선 소용돌이 — (x, y) 에서 a0 쪽 원을 따라 sg(1 = 화면 시계 방향)로 감기며 가늘어짐 */
const volute = (x, y, a0, r0, sg, turns = 1.3, w0 = 2.4) => kTaper(curlPts(x, y, a0, r0, sg, turns), {w0, w1: 0.45, cls: 'mu-gv'});
/** 점 줄 끝에 안으로 말리는 소용돌이를 이음(마지막 접선을 이어받음 · dir 1 = 화면 시계 방향) */
function curlEnd(A, r, dir, turns = 1.2) {
  const a = A[A.length - 2], b = A[A.length - 1], l = Math.hypot(b[0] - a[0], b[1] - a[1]) || 1, tx = (b[0] - a[0]) / l, ty = (b[1] - a[1]) / l;
  const N = dir > 0 ? [-ty, tx] : [ty, -tx], c = [b[0] + N[0] * r, b[1] + N[1] * r], a0 = Math.atan2(b[1] - c[1], b[0] - c[0]), B = [];
  for (let i = 1; i <= 18; i++) { const t = i / 18, an = a0 + dir * t * turns * 2 * Math.PI, rr = r * (1 - 0.72 * t); B.push([c[0] + rr * Math.cos(an), c[1] + rr * Math.sin(an)]); }
  return A.concat(B);
}

/* ── 낱개 무늬 ── */
/** 꽃 — 끝이 둥근 꽃잎 다섯(무하 들장미 꼴 · 금 가는 테) · 바깥 g 는 자리 · 안쪽 g 가 피어남(0.5초) 뒤 천천히 흔들림(transform) */
function flower(cx, cy, r, tone = '', sway = 1) {
  let d = '';
  for (let k = 0; k < 5; k++) {
    const a = -Math.PI / 2 + k * 2 * Math.PI / 5, ca = Math.cos(a), sa = Math.sin(a), q = (u, v) => r1(cx + ca * u - sa * v) + ' ' + r1(cy + sa * u + ca * v);
    d += `M${q(0, 0)}C${q(r * 0.18, r * 0.6)} ${q(r * 1.06, r * 0.6)} ${q(r, 0)}C${q(r * 1.06, -r * 0.6)} ${q(r * 0.18, -r * 0.6)} ${q(0, 0)}Z`;
  }
  return s('g', {class: 'mu-bloom'}, s('g', {class: 'mu-sway mu-sw' + sway}, s('path', {d, class: 'mu-pet' + tone}), s('circle', {cx: r1(cx), cy: r1(cy), r: r1(r * 0.3), class: 'mu-core'}), s('circle', {cx: r1(cx), cy: r1(cy), r: r1(r * 0.12), class: 'mu-core2'})));
}
/** 잎 — 잎맥 하나 · ang 도 · 잎자루가 (x, y) */
function leaf(x, y, ang, len = 12, cls = 'mu-leaf') {
  const w = len * 0.36, T = `translate(${r1(x)} ${r1(y)}) rotate(${r1(ang)})`;
  return s('g', {transform: T}, s('path', {d: `M0 0C${r1(len * 0.28)} ${r1(-w)} ${r1(len * 0.74)} ${r1(-w * 0.8)} ${len} 0C${r1(len * 0.7)} ${r1(w * 0.72)} ${r1(len * 0.3)} ${r1(w * 0.9)} 0 0Z`, class: cls}),
    s('path', {d: `M${r1(len * 0.1)} 0Q${r1(len * 0.5)} ${r1(-w * 0.14)} ${r1(len * 0.86)} 0`, class: 'mu-vein'}));
}
/** 별 — 다섯 갈래(반짝임은 크기만 · transform) */
function star(cx, cy, R, k = 0, cls = 'mu-star') {
  const p = []; for (let i = 0; i < 10; i++) { const a = -Math.PI / 2 + i * Math.PI / 5, rr = i % 2 ? R * 0.42 : R; p.push(r1(cx + Math.cos(a) * rr) + ',' + r1(cy + Math.sin(a) * rr)); }
  return s('g', {class: 'mu-tw mu-tw' + (k % 3)}, s('polygon', {points: p.join(' '), class: cls}));
}
/** 초승달 — 왼쪽으로 부푼 달 */
const moon = (cx, cy, r, cls = 'mu-moon') => s('path', {d: `M${r1(cx)} ${r1(cy - r)}A${r} ${r} 0 1 0 ${r1(cx)} ${r1(cy + r)}A${r1(r * 0.58)} ${r} 0 1 1 ${r1(cx)} ${r1(cy - r)}Z`, class: cls});
const at = (rx, ry, cy, th) => [CX + rx * Math.cos(th), cy - ry * Math.sin(th)]; // 아치 타원 위 점(th = 라디안 · 왼쪽 = π · 꼭대기 = π/2)
/** 금 덩굴 테 — 창 머리를 따라 꼭대기에서 두 어깨로 굵다가 가늘어지는 금 줄기 · 작은 잎 */
function archVine(x0, x1, top, ry, k = 4, cls = 'mu-gv', gap = 0) {
  const tIn = 0.5 - gap, half = side => Array.from({length: 10}, (_, i) => { const t = tIn - i * (tIn - 0.05) / 9; return archPt(x0, x1, top, ry, side ? 1 - t : t).slice(0, 2); });
  const lv = [];
  for (let i = 0; i < k; i++) for (const side of [0, 1]) {
    const t = 0.1 + (tIn - 0.18) * (i + 0.5) / k, p = archPt(x0, x1, top, ry, side ? 1 - t : t), grow = side ? p[2] : p[2] + 180;
    lv.push(leaf(p[0], p[1], grow + (i % 2 ? 38 : -38) * (side ? 1 : -1), 7 + (i % 2) * 2, 'mu-gleaf'));
  }
  return s('g', {'data-mucha': 'vine', class: 'mu-gvine'}, kTaper(half(0), {w0: 2.6, w1: 0.5, cls}), kTaper(half(1), {w0: 2.6, w1: 0.5, cls}), lv);
}
/** 두루마리 이름표 — 공용 scroll(양끝 말림) 안 가운데 글씨(두루마리는 고정 색이라 글씨도 고정 짙은 색) */
function scrollT(x, y, w, h, lines, px, tone = 'cream', extra = {}) {
  const lh = px + 3, y0 = y + h / 2 + px * 0.36 - (lines.length - 1) * lh / 2;
  return [kScroll({x, y, w, h, ends: 'both', tone}), lines.map((l, i) => s('text', {x: r1(extra.cx != null ? extra.cx : x + w / 2), y: r1(y0 + i * lh), 'text-anchor': 'middle', class: 'mu-sct mu-f' + px, ...(extra.proper ? {'data-proper': ''} : {}), text: l}))];
}

/* ═══ 포스터 틀 — 바탕 · 아치(꼭대기 굵고 양끝 가는 띠 · 모자이크 · 꽃 · 별 · 띠 안에 새긴 제목) · 공용 메달 여인 · 별과 달 · 양옆 S 덩굴(두세 번 휨 · 아래 모자이크 띠까지) · 아래 글씨판(아치 머리) · 꽃 모자이크 띠 ═══
   o = {id, title, proper, v(공용 메달 여인 번호), dir, side(별 쪽 1 · −1), ring, my, mr, plateTop, bot, clear, locks({tone, list:[점들]} — 원 밖으로 흐르는 머리 다발), vinePts(side → 점들)} → {back, front, defs}
   아치 어깨 y = 158 · 글씨판 plateTop ~ bot(없으면 null) · 꽃 모자이크 띠 bot + 2 ~ bot + 18 */
const ACY = 150, SH = 158, OB = [182, 141], IB = [169, 103];
/** 끝이 말리는 덩굴손 — (x, y) 에서 sg 쪽으로 감김 */
function curlPts(x, y, a0, r0, sg, turns = 1.6) { const P = []; for (let j = 0; j <= 22; j++) { const u = j / 22, a = a0 + sg * u * turns * 2 * Math.PI, r = r0 * (1 - 0.72 * u); P.push([x + Math.cos(a) * r - Math.cos(a0) * r0, y + Math.sin(a) * r - Math.sin(a0) * r0]); } return P; }
export function poster(o) {
  const {id} = o, v = Number.isInteger(o.v) ? o.v : 3, sd = o.side === -1 ? -1 : 1, MY = fin(o.my) ? o.my : 100, MR = fin(o.mr) ? o.mr : 50;
  const bot = o.bot || 592, plateTop = fin(o.plateTop) ? Math.min(bot - 24, o.plateTop) : null, vEnd = plateTop == null ? bot - 4 : plateTop + 14, title = String(o.title || NEED);
  const ell = (rx, ry, sw = 1) => `M${CX - rx} ${ACY}A${rx} ${ry} 0 0 ${sw} ${CX + rx} ${ACY}`;
  const cres = (a, b) => ell(a[0], a[1]) + `L${CX + b[0]} ${ACY}A${b[0]} ${b[1]} 0 0 0 ${CX - b[0]} ${ACY}Z`;
  const ground = s('g', {'data-mucha': 'pastel'},
    s('rect', {x: 1, y: 1, width: W - 2, height: HT - 2, rx: 22, class: 'mu-ground'}),
    s('path', {d: ell(IB[0], IB[1]) + 'Z', class: 'mu-field'}));
  // 굵기가 변하는 아치 — 바깥 금테(꼭대기 7 → 끝 4) · 띠(꼭대기 38 → 끝 13) · 안 금테(꼭대기 3 → 끝 1.5)
  const outline = s('g', {'data-mucha': 'outline'},
    s('path', {d: cres([186, 148], OB), class: 'mu-ol'}), s('path', {d: cres(OB, IB), class: 'mu-band'}), s('path', {d: cres(IB, [IB[0] - 1.5, IB[1] - 3]), class: 'mu-ol'}));
  // 띠 글씨 — 띠 안에 새김(흰 테 없음 · 갈색 · 금빛)
  const em = tw(title, 1, 0.08), size = Math.max(20, Math.min(28, Math.floor(232 / Math.max(1, em)))), tHalf = tw(title, size, 0.08) / 2 + 14;
  // 띠 무늬 — 「꽃 · 점 · 마름모 · 점」 한 박자(둘레 길이로 같은 간격 · 꼭대기에서 좌우 같게 · 띠 굵기에 맞춰 크기만 변함 · 제목 자리는 비움)
  const deco = [], BRX = 175.5, BRY = 122, NS = 360, thK = k => (4 + 172 * k / NS) * Math.PI / 180, arcL = [0];
  for (let k = 1; k <= NS; k++) arcL.push(arcL[k - 1] + Math.hypot(BRX * (Math.cos(thK(k)) - Math.cos(thK(k - 1))), BRY * (Math.sin(thK(k)) - Math.sin(thK(k - 1)))));
  const thAt = L => { let k = 1; while (k < NS && arcL[k] < L) k++; const u = (L - arcL[k - 1]) / ((arcL[k] - arcL[k - 1]) || 1); return thK(k - 1) + (thK(k) - thK(k - 1)) * u; };
  const midL = arcL[NS] / 2, STEP = 14.2;
  for (let j = 0; midL + j * STEP <= arcL[NS] - 3; j++) for (const sg of j ? [-1, 1] : [1]) {
    const th = thAt(midL + sg * j * STEP), x = CX + BRX * Math.cos(th), y = ACY - BRY * Math.sin(th), T = 13 + 25 * Math.pow(Math.sin(th), 1.6), z = T * 0.27;
    if (Math.abs(x - CX) < tHalf && y < 80) continue;
    const k = j % 4;
    if (k === 0) deco.push(s('g', {}, [0, 1, 2, 3, 4].map(q => { const a = -Math.PI / 2 + q * 2 * Math.PI / 5; return s('circle', {cx: r1(x + Math.cos(a) * z * 0.6), cy: r1(y + Math.sin(a) * z * 0.6), r: r1(z * 0.44), class: 'mu-m2'}); }), s('circle', {cx: r1(x), cy: r1(y), r: r1(z * 0.3), class: 'mu-m0'})));
    else if (k === 2) deco.push(s('path', {d: `M${r1(x)} ${r1(y - z * 0.92)}l${r1(z * 0.92)} ${r1(z * 0.92)}l${r1(-z * 0.92)} ${r1(z * 0.92)}l${r1(-z * 0.92)} ${r1(-z * 0.92)}z`, class: 'mu-m1'}));
    else deco.push(s('circle', {cx: r1(x), cy: r1(y), r: r1(z * 0.34), class: 'mu-m0'}));
  }
  const tp = s('textPath', {href: '#' + id + 'tp', startOffset: '50%', text: title});
  tp.setAttributeNS('http://www.w3.org/1999/xlink', 'xlink:href', '#' + id + 'tp');
  const lettering = s('g', {'data-mucha': 'lettering'},
    s('text', {class: 'mu-title mu-n' + size, 'text-anchor': 'middle', ...(o.proper ? {'data-proper': ''} : {})}, tp));
  const bandDeco = s('g', {'data-mucha': 'mosaic', class: 'mu-bdeco'}, deco);
  // 어깨 받침(금 기둥 머리 · 둥근 모서리) — 안쪽 끝에서 금선이 소용돌이로 풀림(컴퍼스 반원만이 아니게)
  const caps = s('g', {'data-mucha': 'panel'}, [[10, 44], [W - 54, 44]].map(([x, w]) => s('rect', {x, y: ACY, width: w, height: SH - ACY, rx: 4, class: 'mu-cap'})),
    volute(54, ACY + 4, -Math.PI / 2, 6.2, 1, 1.25, 2.6), volute(W - 54, ACY + 4, -Math.PI / 2, 6.2, -1, 1.25, 2.6));
  // 별과 달(마당 빈 쪽 — 여인이 보는 쪽)
  const sx = x => CX + sd * x;
  const spec = [[70, 76, 6, 0], [128, 132, 5, 2], [84, 140, 3.6, 1], [118, 84, 3.4, 2], [-114, 136, 3.4, 1], [-60, 66, 3.2, 0], [-92, 104, 3, 2]].filter(([x, y]) => !(o.clear && o.clear(sx(x), y)) && Math.hypot(sx(x) - CX, y - MY) > MR + 10);
  const stars = s('g', {'data-mucha': 'stars'}, s('g', {class: 'mu-tw mu-tw1'}, moon(sx(MR + 52), MY + 4, 12)), spec.map(([x, y, r, k]) => star(sx(x), y, r, k)));
  // 양옆 덩굴 — S 로 두세 번 휘는 굵은 덩굴(아래 굵고 위 가늚 · 잎 · 봉오리 세 배) · 아래 끝은 모자이크 띠 위에서 말림 · 틀 밖으로 나가지 않게 자름
  const y0 = SH + 4, y1 = vEnd, hh = y1 - y0;
  const vp = o.vinePts || (side => { const X = x => (side ? W - x : x), P = []; for (let i = 0; i <= 12; i++) { const t = i / 12; P.push([X(20 + 15 * Math.sin(2 * Math.PI * 1.25 * t + 0.4 + side * 0.9)), y1 - hh * t]); } return P; });
  const vines = [0, 1].map(side => { const pts = vp(side), p0 = pts[0], dx = side ? -1 : 1;
    return [kVine(pts, {w0: 6.4, w1: 1.2, leaves: Math.max(12, Math.round(hh / 15)), buds: 9, seed: 11 + side * 6 + v}),
      kTaper(curlPts(p0[0], p0[1], side ? 0 : Math.PI, 9, dx * -1, 1.5), {w0: 3.4, w1: 0.6, cls: 'mk-vstem'})]; });
  const vine = s('g', {'data-mucha': 'vine'}, s('g', {'clip-path': `url(#${id}gc)`}, vines),
    flower(32, ACY + 4, 8.5, '', 2), flower(W - 32, ACY + 4, 8.5, '', 3));
  // 아래 글씨판(아치 머리 · 금 덩굴 테) + 꽃 모자이크 띠(네모 · 동그라미 · 다섯 점 꽃을 금 · 잎 · 살구로 번갈아)
  const tiles = [], my = bot + 10;
  for (let x = 20, i = 0; x <= W - 20; x += 12.5, i++) {
    const c = 'mu-m' + (i % 3);
    tiles.push(i % 4 === 2 ? s('g', {}, [0, 1, 2, 3, 4].map(q => { const a = -Math.PI / 2 + q * 2 * Math.PI / 5; return s('circle', {cx: r1(x + Math.cos(a) * 2.6), cy: r1(my + Math.sin(a) * 2.6), r: 1.7, class: 'mu-m2'}); }), s('circle', {cx: r1(x), cy: my, r: 1.3, class: 'mu-m0'}))
      : i % 2 ? s('circle', {cx: r1(x), cy: my, r: 2.8, class: c}) : s('path', {d: `M${r1(x)} ${my - 4.6}l4.6 4.6l-4.6 4.6l-4.6 -4.6z`, class: c}));
  }
  const mosaic = s('g', {'data-mucha': 'mosaic'},
    plateTop == null ? null : [s('path', {d: archD(12, W - 12, plateTop - 10, 22, bot), class: 'mu-plate'}), s('path', {d: archD(17, W - 17, plateTop - 5, 18, bot), class: 'mu-plate2'})],
    s('rect', {x: 6, y: bot + 1, width: W - 12, height: 18, rx: 9, class: 'mu-mband'}), tiles);
  const plateVine = plateTop == null ? null : archVine(12, W - 12, plateTop - 10, 22, 6);
  // 뒤통수에서 이어진 가는 머리 가닥(메달 뒤에서 나와 아치 띠 아래를 따라 흐르다 끝이 말림 · 왼쪽 · 오른쪽 짝 · 굵기 · 말림 크기 다르게)
  const locks = o.locks && Array.isArray(o.locks.list) ? s('g', {class: 'mk-hair mk-t' + (o.locks.tone | 0), 'data-mucha': 'whiplash', 'aria-hidden': 'true'},
    o.locks.list.map((L, i) => s('g', {class: 'mk-sway' + (i % 2 ? '2' : '')}, kTaper(L.pts, {w0: L.w, w1: 0.35, cls: L.cls || 'mk-hb'})))) : null;
  return {back: [ground, outline, bandDeco, caps, stars, vine, mosaic, plateVine], front: [lettering, locks, s('g', {class: 'mu-medal'}, medallion({cx: CX, cy: MY, r: MR, v, dir: o.dir === -1 ? -1 : 1, ring: o.ring || 'mosaic'}))],
    defs: [s('path', {id: id + 'tp', d: ell(166, 111.5)}), s('clipPath', {id: id + 'gc'}, s('rect', {x: 3, y: 3, width: W - 6, height: HT - 6, rx: 20}))]};
}
export const MU = {poster, brush, fall, swell, flower, leaf, star, moon, wrapW, tw, spanLines, r1, ribbonD, archD, archPt, archVine, scrollT, curlPts};

/* ═══ 회사 그림 ═══ */
/** 자료 셋 — 회사 · 첫 화면(지수) · 21곳 · 못 받으면 null(그림은 「확인 필요」로 그려짐) */
export async function load(get, code) {
  const c = typeof code === 'string' && CODE.test(code) ? code : null;
  if (!c || typeof get !== 'function') return {code: c, co: null, H: null, T: null};
  const safe = u => Promise.resolve().then(() => get(u)).catch(() => null);
  const [co, H, T] = await Promise.all([safe('/atlas/data/co/' + c + '.json'), safe('/atlas/data/home.json'), safe('/su/data/su21.json')]);
  return {code: c, co, H, T};
}

/** 자료 → 그릴 값(새 셈 없음 — su-data.js coLine · idxLine · pct 와 whyRoad 의 값 그대로 · 기간은 자료 날짜에서) */
function model(d) {
  const code = d && typeof d.code === 'string' ? d.code : null, co = d ? d.co : null, c = co ? co.c : null, H = d ? d.H : null, T = d ? d.T : null;
  if (!c || typeof c.name !== 'string' || !c.name) return {ok: false, code};
  const cl = coLine(co), il = idxLine(H, c.market, H ? H.base : null, H ? H.asOf : null);
  const ind = typeof c.i === 'string' && c.i ? c.i : null;
  const lists = T && T.lists ? T.lists : {}, asOf = T && T.asOf ? T.asOf : {};
  const roads = KEY.filter(k => Array.isArray(lists[k]) && lists[k].some(x => x && x.code === code)).map(k => {
    const x = lists[k].find(y => y.code === code), w = x.why || {};
    // 기간: 불장 업종 = 20거래일(why.to) · 회사 = 20거래일(그날 값 날짜) · 시장보다 = 한 달(theme 자료 날짜) · 회사 크기 = 20거래일(mkt 자료 날짜)
    const ivp = k === 'hot' ? (fin(w.ind20) ? ['20거래일', dk(w.to) || dk(x.date)] : null) : (fin(w.indX) ? ['한 달', dk(asOf.data)] : null);
    const cvp = k === 'money' ? (fin(w.gain) ? ['20거래일', dk(asOf.mkt)] : null) : k === 'hot' ? (fin(x.ch20) ? ['20거래일', dk(x.date)] : null) : null;
    const ivL = k === 'hot' ? '업종' : '시장보다', ivN = k === 'hot' ? sgnP(w.ind20) : sgn(w.indX);
    return {k, kind: KIND[k], ind: x.ind || ind || NEED, iv: ivL + ' ' + ivN, ivL, ivN,
      name: x.name || c.name, cv: k === 'money' ? (fin(w.gain) ? '+' + num(w.gain) + '억 원' : NEED) : k === 'bloom' ? '아직 싹' : sgnP(x.ch20), ivp, cvp};
  });
  const from = H && typeof H.base === 'string' ? H.base : null, to = typeof c.priceDate === 'string' ? c.priceDate : H && typeof H.asOf === 'string' ? H.asOf : null;
  return {ok: true, code, name: c.name, ind, cl, il, last: cl ? lastOf(cl) - 100 : null, ilast: il ? lastOf(il.line) - 100 : null, from, to, roads};
}

/* ── 글씨(처음부터 진하게 · 바탕색 테) ── */
const T = (x, y, t, cls, extra = {}) => s('text', {x: r1(x), y: r1(y), class: cls, ...extra, text: t});

/* ── 한 달 줄 창 — 위가 둥근 창 · 줄 둘 · 끝값 이름표(기간은 창 머리에 한 번 · 두 값의 기간이 다르면 값마다) ── */
function chartG(m, P) {
  const {PL, PR, PT, PB, LX, LR, A, ry, WX0, WX1, WB, NC} = P, out = [], labs = [];
  // 창 — 메달이 걸리는 머리는 메달 둘레를 따라 오목하게 · 빛살 없음(값만 또렷이) · 금 두 줄 테 · 머리에 금 덩굴 · 바닥 두 귀퉁이에서 금선이 소용돌이로 풀림
  const win = winD(WX0, WX1, A, ry, WB, NC), win2 = winD(WX0 + 5, WX1 - 5, A + 5, ry - 4, WB, NC ? {cx: NC.cx, cy: NC.cy, r: NC.r + 5} : null);
  out.push(s('g', {'data-mucha': 'panel'}, s('path', {d: win.d, class: 'ca-win'}), s('path', {d: win.d, class: 'ca-winl'}), s('path', {d: win2.d, class: 'ca-winl2'}),
      volute(WX0, WB, Math.PI / 2, 6.5, 1, 1.3, 2.4), volute(WX1, WB, Math.PI / 2, 6.5, -1, 1.3, 2.4)),
    archVine(WX0, WX1, A, ry, 5, 'mu-gv', 0.5 - win.t1 + 0.012));
  const all = [...(m.cl || []), ...(m.il ? m.il.line : [])].filter(fin), lo = Math.min(97, ...all), hi = Math.max(103, ...all);
  const N = Math.max(m.cl ? m.cl.length : 0, m.il ? m.il.line.length : 0), step = N > 1 ? (PR - PL) / (N - 1) : 0;
  const X = i => PL + i * step, Y = v => PT + (PB - PT) * (1 - (v - lo) / (hi - lo));
  const pts = a => a.map((v, i) => r1(X(i)) + ',' + r1(Y(v))).join(' ');
  const y100 = Y(100);
  // 처음 = 100 — 금 구슬 줄
  out.push(s('g', {class: 'ca-base'}, kBeads(PL - 4, r1(y100), PR + 4, r1(y100), {gap: 7, r: 1.9})));
  // 회사 줄 = polyline 그대로(가는 금 심) + 굵다가 가늘어지는 금 리본(점과 점을 곧게 잇는 그대로) · 시장 줄 = polyline 그대로 + 덩굴 줄기 · 잎 몇 장(위에 — 두 줄이 붙어 가도 가는 줄이 보이게)
  if (m.cl) {
    const Pc = m.cl.map((v, i) => [X(i), Y(v)]), [q, c] = ribbonD(Pc, t => 7.4 - 5.2 * Math.pow(t, 0.85));
    out.push(s('g', {'data-line': 'co'}, s('polyline', {points: pts(m.cl), class: 'ca-cou'}), s('path', {d: q, class: 'ca-crib'}), s('path', {d: c, class: 'ca-crib'}),
      s('polyline', {points: pts(m.cl), class: 'ca-co'}), s('polyline', {points: pts(m.cl), class: 'ca-coin'})));
  }
  if (m.il) {
    const L = m.il.line, Pi = L.map((v, i) => [X(i), Y(v)]), [q, c] = ribbonD(Pi, t => 3.8 - 2.6 * t), lv = [], n = L.length;
    for (let k = 1; k <= 5 && n > 6; k++) {
      const i = Math.round(k * (n - 1) / 6), a = Pi[Math.max(0, i - 1)], b = Pi[Math.min(n - 1, i + 1)], ang = Math.atan2(b[1] - a[1], b[0] - a[0]) * 180 / Math.PI;
      lv.push(leaf(Pi[i][0], Pi[i][1], ang + (k % 2 ? -50 : 50), 9 + (k % 3), 'ca-ileaf'));
    }
    out.push(s('g', {'data-line': 'idx'}, s('polyline', {points: pts(L), class: 'ca-idxu'}), s('path', {d: q, class: 'ca-ivn'}), s('path', {d: c, class: 'ca-ivn'}), lv, s('polyline', {points: pts(L), class: 'ca-idx'})));
  }
  if (!m.cl) out.push(T((PL + PR) / 2, (PT + PB) / 2, '한 달 줄 ' + NEED, 'ca-t ca-b ca-f20 ca-onw', {'text-anchor': 'middle'}));
  // 「처음 = 100」 — 구슬 줄 위 · 아래 가운데 줄이 지나가지 않는 첫 자리
  const segs = [];
  for (const a of [m.cl, m.il ? m.il.line : null]) if (a) for (let i = 1; i < a.length; i++) segs.push([X(i - 1), Y(a[i - 1]), X(i), Y(a[i])]);
  const bw = tw('처음 = 100', 18), hitN = b => { let n = 0; for (const [x1, y1, x2, y2] of segs) for (let t = 0; t <= 1; t += 0.125) { const x = x1 + (x2 - x1) * t, y = y1 + (y2 - y1) * t; if (x >= b.x - 4 && x <= b.x + b.w + 4 && y >= b.y - 4 && y <= b.y + b.h + 4) n++; } return n; };
  let best = null;
  scan: for (let x = PL; x <= PR - bw + 6; x += 8) for (const up of [true, false]) {
    const b = {x, y: up ? y100 - 24 : y100 + 6, w: bw, h: 19, up};
    if (b.y < PT - 10 || b.y + b.h > PB + 12) continue;
    const n = hitN(b); if (!best || n < best.n) best = {...b, n};
    if (!n) break scan;
  }
  if (best) out.push(T(best.x, best.up ? y100 - 8 : y100 + 21, '처음 = 100', 'ca-t ca-m ca-f18 ca-onw'));
  // 기간 — 두 값이 같은 기간이면 창 머리에 한 번(창 안 값 모두에 걸림 · 아치를 따라 휘어 씀) · 다르면 이름표마다
  const ca = m.cl ? [dk(m.from), dk(m.to)] : null, ia = m.il ? [dk(m.il.from), dk(m.il.to)] : null;
  const head = (ca || ia) && (!ca || !ia || (ca[0] === ia[0] && ca[1] === ia[1])) ? (ca || ia) : null, headT = head && (head[0] || head[1]) ? spanLines('한 달', head[0], head[1], 18, 999)[0] : null;
  if (headT) out.push(s('g', {'data-per': 'line'}, T(CX, P.headY, headT, 'ca-t ca-m ca-f18 ca-onw', {'text-anchor': 'middle'})));
  // 끝값 이름표 — 오른쪽 · 줄 끝 높이에 맞추되 겹치지 않게 · 흰 상자 없이 금빛 리본 막대와 글씨
  const tmax = LR - LX - 14;
  if (m.cl) labs.push({cls: 'su-lg-c', k: 'c', val: pct(m.last), name: m.name, proper: true, ex: X(m.cl.length - 1), ey: Y(lastOf(m.cl)), a: dk(m.from), b: dk(m.to)});
  labs.push({cls: 'su-lg-i', k: 'i', val: m.il ? pct(m.ilast) : NEED, name: m.il ? m.il.name : '시장', proper: false, ex: m.il ? X(m.il.line.length - 1) : PR, ey: m.il ? Y(lastOf(m.il.line)) : PB,
    a: m.il ? dk(m.il.from) : null, b: m.il ? dk(m.il.to) : null});
  for (const b of labs) {
    b.one = tw(b.val, 24) + 8 + tw(b.name, 19) <= tmax; b.names = b.one ? [] : wrapW(b.name, 19, tmax);
    b.per = headT ? [] : spanLines('한 달', b.a, b.b, 18, tmax); b.h = 30 + (b.names.length + b.per.length) * 21; b.top = b.ey - 15;
  }
  const minT = PT - 4, maxB = P.bot;
  labs.sort((a, b) => a.ey - b.ey);
  for (let it = 0; it < 8; it++) {
    for (const b of labs) b.top = Math.max(minT, Math.min(maxB - b.h, b.top));
    for (let i = 1; i < labs.length; i++) { const a = labs[i - 1], b = labs[i], ov = a.top + a.h + 10 - b.top; if (ov > 0) { a.top -= ov / 2; b.top += ov / 2; } }
  }
  labs.forEach(b => {
    const vy = b.top + 24, my = b.top + 16;
    out.push(s('path', {d: brush(`M${r1(b.ex + 6)} ${r1(b.ey)}C${r1(b.ex + 12)} ${r1(b.ey)} ${r1(LX - 9)} ${r1(my)} ${r1(LX - 1)} ${r1(my)}`, fall(2.6, 0.8), 10), class: 'ca-lead-' + b.k}));
    out.push(b.k === 'c' ? flower(b.ex, b.ey, 9, ' ca-endpet', 2) : s('circle', {cx: r1(b.ex), cy: r1(b.ey), r: 5.5, class: 'ca-dot-i'}));
    let y = vy + 23; const rows = [];
    for (const t of b.names) { rows.push(T(LX + 12, y, t, 'ca-t ca-b ca-f19 ca-onw', b.proper ? {'data-proper': ''} : {})); y += 21; }
    for (const t of b.per) { rows.push(T(LX + 12, y, t, 'ca-t ca-m ca-f18 ca-onw')); y += 21; }
    out.push(s('g', {class: b.cls + ' ca-lab', 'data-end': b.k},
      s('circle', {cx: r1(LX + 1), cy: r1(my), r: 3.2, class: 'ca-rib-' + b.k}),
      s('text', {x: r1(LX + 12), y: r1(vy), class: 'ca-t ca-b ca-f24 ca-onw ca-v-' + b.k}, s('tspan', {class: 'v', text: b.val}),
        b.one ? s('tspan', {dx: 8, class: 'ca-nm2', ...(b.proper ? {'data-proper': ''} : {}), text: b.name}) : null),
      rows));
  });
  return out;
}

/* ── 「왜 여기 있나」 길 — 업종 두루마리(누르면 업종) → 목록마다 위가 둥근 아치 창(꼭대기 상징 · 기간은 창 머리에 한 번 → 업종 값 → 회사 값 → 든 목록 · 숫자 크게 설명 작게) ── */
/** 큰 값 하나 — 숫자는 크게(칸에 맞춰 36 → 22) · 뒤 한글 단위(억 원)는 작게 같은 줄 · 숫자가 아닌 값(아직 싹 · 확인 필요)은 24 안 */
const BIG = [36, 34, 32, 30, 29, 28, 27, 26, 25, 24, 23, 22];
function bigFit(v, tmax) {
  const m = /^([+−-]?[0-9][0-9,.]*)(.*)$/.exec(String(v)), unit = m && /[가-힣]/.test(m[2]) ? m[2].trim() : '', numT = unit ? m[1] : String(v);
  const w = px => tw(numT, px) + (unit ? 3 + tw(unit, 19) : 0);
  return {numT, unit, w, px: (m ? BIG : [24, 22, 20]).find(px => w(px) <= tmax) || 20};
}
/** 작은 줄 — 값과 기간을 한 줄에(들면) · 안 들면 값 줄 다음에 기간 줄(낱말 가운데서 끊지 않음) */
const joinPer = (a, per, tmax) => { const one = per.length === 1 ? a + ' · ' + per[0] : null; return one && tw(one, 18) <= tmax ? [one] : [...wrapB(a, 18, tmax), ...per]; };
function roadPlan(m) {
  const n = m.roads.length;
  if (!n) { const lines = m.ind ? wrapW(m.ind + ' 업종', 20, 220) : []; return {n, plateH: m.ind ? Math.max(84, lines.length * 24 + 58) : 30, lines, H: 0}; }
  const gap = 10, X0 = 18, X1 = W - 18, pw = n === 1 ? 300 : (X1 - X0 - (n - 1) * gap) / n, tmax = pw - 20;
  const cols = m.roads.map(r => {
    const pers = [r.ivp, r.cvp].filter(Boolean), same = pers.length > 0 && pers.every(p => p[0] === pers[0][0] && p[1] === pers[0][1]), sameD = pers.length > 0 && !!pers[0][1] && pers.every(p => p[1] === pers[0][1]);
    const head = same ? spanLines(pers[0][0], null, pers[0][1], 18, tmax) : sameD ? [pers[0][1] + '까지'] : [];
    const perOf = p => (!p || same ? [] : sameD ? [p[0]] : spanLines(p[0], null, p[1], 18, tmax));
    return {head, iv: joinPer(r.ivL + ' ' + r.ivN, perOf(r.ivp), tmax), nm: joinPer(r.name, perOf(r.cvp), tmax), big: bigFit(r.cv, tmax), kind: wrapB(r.kind + ' 7곳에 듦', 18, tmax)};
  });
  const px = Math.min(...cols.map(c => c.big.px)), mx = k => Math.max(...cols.map(c => c[k].length));
  const headN = mx('head'), ivN = mx('iv'), nmN = mx('nm'), kN = mx('kind'), LH = 20, G0 = 20;
  const rib = wrapW(m.roads[0].ind + ' 업종', 20, 230), rh = 34 + (rib.length - 1) * 23;
  return {n, gap, X0, pw, cols, px, headN, ivN, nmN, kN, LH, G0, rib, rh, plateH: 0, H: rh + G0 + 20 + headN * LH + 8 + ivN * LH + 12 + nmN * LH + 6 + Math.round(px * 1.12) + 6 + kN * LH + 14};
}
/** 판 꼭대기 상징 — 불장 = 불꽃 · 돈이 몰리는 = 금빛 물결 · 꽃이 될 = 새싹(굵기 변하는 윤곽) */
function sigil(k, x, y) {
  if (k === 'hot') return s('g', {class: 'ca-sig', 'data-mucha': 'whiplash'},
    s('path', {d: `M${r1(x)} ${r1(y + 10)}C${r1(x - 10)} ${r1(y + 10)} ${r1(x - 11)} ${r1(y - 1)} ${r1(x - 5)} ${r1(y - 7)}C${r1(x - 4.5)} ${r1(y - 2)} ${r1(x - 2)} ${r1(y - 1)} ${r1(x - 1)} ${r1(y - 3)}C${r1(x - 2)} ${r1(y - 9)} ${r1(x + 1)} ${r1(y - 13)} ${r1(x + 4)} ${r1(y - 16)}C${r1(x + 4)} ${r1(y - 9)} ${r1(x + 11)} ${r1(y - 5)} ${r1(x + 10)} ${r1(y + 2)}C${r1(x + 9)} ${r1(y + 7)} ${r1(x + 5)} ${r1(y + 10)} ${r1(x)} ${r1(y + 10)}Z`, class: 'ca-flame'}),
    s('path', {d: `M${r1(x)} ${r1(y + 8)}C${r1(x - 5)} ${r1(y + 8)} ${r1(x - 5.5)} ${r1(y + 2)} ${r1(x - 2)} ${r1(y - 2)}C${r1(x - 1)} ${r1(y + 1)} ${r1(x + 1)} ${r1(y + 1)} ${r1(x + 1.5)} ${r1(y - 4)}C${r1(x + 4.5)} ${r1(y - 1)} ${r1(x + 6)} ${r1(y + 3)} ${r1(x + 4.5)} ${r1(y + 6)}C${r1(x + 3.5)} ${r1(y + 7.5)} ${r1(x + 2)} ${r1(y + 8)} ${r1(x)} ${r1(y + 8)}Z`, class: 'ca-flame2'}));
  if (k === 'money') return s('g', {class: 'ca-sig', 'data-mucha': 'whiplash'},
    s('path', {d: brush(`M${r1(x - 15)} ${r1(y + 7)}C${r1(x - 9)} ${r1(y + 7)} ${r1(x - 8)} ${r1(y - 9)} ${r1(x + 1)} ${r1(y - 9)}C${r1(x + 9)} ${r1(y - 9)} ${r1(x + 11)} ${r1(y + 1)} ${r1(x + 4)} ${r1(y + 1)}C${r1(x)} ${r1(y + 1)} ${r1(x)} ${r1(y - 4)} ${r1(x + 4)} ${r1(y - 4)}`, swell(1.4, 5.2), 10), class: 'ca-wave'}),
    s('path', {d: brush(`M${r1(x - 16)} ${r1(y + 11)}C${r1(x - 6)} ${r1(y + 6)} ${r1(x + 6)} ${r1(y + 14)} ${r1(x + 16)} ${r1(y + 8)}`, swell(0.8, 2.6), 10), class: 'ca-wave'}),
    [[-10, -4, 1.6], [12, -10, 1.3], [15, -3, 1.1]].map(([dx, dy, r]) => s('circle', {cx: r1(x + dx), cy: r1(y + dy), r, class: 'ca-wave'})));
  return s('g', {class: 'ca-sig', 'data-mucha': 'vine'}, s('path', {d: brush(`M${r1(x)} ${r1(y + 11)}C${r1(x - 2)} ${r1(y + 4)} ${r1(x + 2)} ${r1(y - 2)} ${r1(x)} ${r1(y - 8)}`, fall(2.6, 1), 8), class: 'ca-sprout'}),
    leaf(x, y + 2, -150, 12, 'mu-leaf'), leaf(x, y, -30, 12, 'mu-leaf'), s('circle', {cx: r1(x), cy: r1(y - 10), r: 3.2, class: 'ca-bud'}));
}
/** 줄 사이 가는 덩굴 — 가운데 굵고 양끝 가는 금선 · 작은 잎 둘 */
const vineRule = (cx, y) => [s('path', {d: brush(`M${r1(cx)} ${r1(y)}C${r1(cx - 12)} ${r1(y - 4)} ${r1(cx - 22)} ${r1(y + 4)} ${r1(cx - 34)} ${r1(y - 1)}`, fall(1.7, 0.35), 10), class: 'ca-conn'}),
  s('path', {d: brush(`M${r1(cx)} ${r1(y)}C${r1(cx + 12)} ${r1(y + 4)} ${r1(cx + 22)} ${r1(y - 4)} ${r1(cx + 34)} ${r1(y + 1)}`, fall(1.7, 0.35), 10), class: 'ca-conn'}),
  leaf(cx - 17, y, -150, 6, 'mu-gleaf'), leaf(cx + 17, y, -30, 6, 'mu-gleaf'), s('circle', {cx: r1(cx), cy: r1(y), r: 1.8, class: 'ca-conn'})];
function roadG(m, R, top, bot) {
  const {n, gap, X0, pw, cols, px, headN, ivN, nmN, LH, G0, rib, rh} = R, x0 = n === 1 ? (W - pw) / 2 : X0, wins = [], deco = [], rules = [], out = [];
  const Tp = top + rh + G0, ry = n === 1 ? 26 : 24, hTop = Tp + 20, aTop = hTop + headN * LH + 8, nTop = aTop + ivN * LH + 12, bTop = nTop + nmN * LH + 6, cTop = bTop + Math.round(px * 1.12) + 6;
  const lines = (cx, y0, L, cls, slots) => { const o = (slots - L.length) * LH / 2; return L.map((l, i) => T(cx, y0 + o + 15 + i * LH, l, cls, {'text-anchor': 'middle'})); };
  cols.forEach((c, ci) => {
    const x = x0 + ci * (pw + gap), cx = x + pw / 2, k = m.roads[ci].k, on = ' ca-on-' + k;
    // 칸 — 위가 둥근 아치 · 아랫단은 둥글게 닫음 · 금 두 줄 테 · 지붕에 큰 상징(불꽃 · 금빛 물결 · 새싹) · 지붕 금 덩굴은 상징 옆에서 시작
    wins.push(s('path', {d: panD(x, x + pw, Tp, ry, bot - 5, 18), class: 'ca-pan ca-pan-' + k}), s('path', {d: panD(x + 4.5, x + pw - 4.5, Tp + 4.5, ry - 3.5, bot - 9.5, 14), class: 'ca-panl2'}));
    deco.push(archVine(x, x + pw, Tp, ry, 3, 'mu-gv', 0.14), s('g', {class: 'ca-roof', transform: `translate(${r1(cx)} ${r1(Tp - 2)}) scale(1.5) translate(${r1(-cx)} ${r1(-(Tp - 2))})`}, sigil(k, cx, Tp - 2)));
    // 기간(작게 · 칸 머리에 한 번) → 업종 값(작은 한 줄) → 회사 이름(작은 한 줄) → 회사 값 하나만 크게 → 든 목록(작은 한 줄)
    out.push(s('g', {'data-road': 'per'}, lines(cx, hTop, c.head, 'ca-t ca-m ca-f18' + on, headN)));
    if (c.head.length) deco.push(s('g', {class: 'ca-base'}, kBeads(cx - 26, r1(hTop + headN * LH + 4), cx + 26, r1(hTop + headN * LH + 4), {gap: 6.5, r: 1.4})));
    out.push(s('g', {'data-road': 'indv'}, lines(cx, aTop, c.iv, 'ca-t ca-lab ca-f18' + on, ivN)));
    const b = c.big, bw = b.w(px), by = bTop + Math.round(px * 0.9);
    out.push(s('g', {'data-road': 'co'}, lines(cx, nTop, c.nm, 'ca-t ca-b ca-f18' + on, nmN),
      s('text', {x: r1(b.unit ? cx - bw / 2 : cx), y: r1(by), 'text-anchor': b.unit ? 'start' : 'middle', class: 'ca-t ca-big ca-k-' + k + on}, s('tspan', {class: 'ca-f' + px, text: b.numT}), b.unit ? s('tspan', {dx: 3, class: 'ca-unit ca-f19', text: b.unit}) : null)));
    out.push(s('g', {'data-road': 'list'}, c.kind.map((l, i) => T(cx, cTop + 15 + i * LH, l, 'ca-t ca-b ca-f18 ca-k-' + k + on, {'text-anchor': 'middle'}))));
    rules.push(vineRule(cx, nTop - 6));
  });
  // 업종 두루마리(양끝 말림) — 두 창 위 · 차트 창 밑선 아래 · 누르면 그 업종(투명한 누름 자리 높이 64)
  const rw = Math.min(314, Math.max(170, Math.max(...rib.map(l => tw(l, 20))) + 84)), rx = (W - rw) / 2, ry0 = top, hitH = Math.max(64, rh + 26);
  const link = s('g', {'data-road': 'ind'}, s('a', {href: indHref(m.roads[0].ind), class: 'ca-link', 'aria-label': m.roads[0].ind + ' 업종 보기'},
    s('rect', {x: r1(rx - 8), y: r1(ry0 + rh / 2 - hitH / 2), width: r1(rw + 16), height: r1(hitH), class: 'ca-hit'}),
    scrollT(rx, ry0, rw, rh, rib, 20, 'sage', {cx: CX - 7, proper: true}),
    T(rx + rw - rh * 0.6 - 9, ry0 + rh / 2 + 7.5, '›', 'mu-sct ca-chev ca-f22', {'text-anchor': 'middle'})));
  return [s('g', {'data-mucha': 'panel'}, wins), deco, s('g', {'data-mucha': 'whiplash'}, rules), out, link];
}
/** 21곳 밖 — 아치 머리 글씨판에 업종 두루마리 하나(누르면 그 업종) */
function indG(m, R, plateTop) {
  if (!m.ind) return null;
  const w = Math.min(310, Math.max(200, Math.max(...R.lines.map(l => tw(l, 20))) + 92)), x = (W - w) / 2, h = 34 + (R.lines.length - 1) * 23, y = plateTop + (R.plateH - h) / 2 - 2, hitH = Math.max(64, h + 26);
  return s('g', {'data-road': 'ind'}, s('a', {href: indHref(m.ind), class: 'ca-link', 'aria-label': m.ind + ' 업종 보기'},
    s('rect', {x: r1(x - 8), y: r1(y + h / 2 - hitH / 2), width: r1(w + 16), height: r1(hitH), class: 'ca-hit'}),
    scrollT(x, y, w, h, R.lines, 20, 'sage', {cx: CX - 7, proper: true}),
    T(x + w - h * 0.8 - 9, y + h / 2 + 7.5, '›', 'mu-sct ca-chev ca-f22', {'text-anchor': 'middle'})));
}

/** 그림 한 장 — load 가 준 것으로 <svg viewBox="0 0 390 620"> 하나 */
export function picture(d, opt = {}) {
  const m = model(d), id = 'ca' + (++SEQ) + (m.code || 'x');
  const R = m.ok ? roadPlan(m) : {n: 0, plateH: 30, lines: [], H: 0};
  const BOT = 592, MY = 108, MR = 65, A = 148, plateTop = BOT - R.plateH, roadTop = R.n ? BOT - R.H : plateTop;
  const WB = R.n ? roadTop - 6 : plateTop - 22, NC = {cx: CX, cy: MY, r: MR + 7};
  const P = {PL: 50, PR: 166, PT: A + 78, PB: R.n ? roadTop - 24 : WB - 22, LX: 180, LR: 350, bot: R.n ? roadTop - 12 : WB - 10, A, ry: 52, WX0: 34, WX1: W - 34, WB, NC, headY: MY + MR + 7 + 30};
  // 머리 가닥 — 메달 뒤 정수리에서 나와 아치 띠 아래(띠 안쪽 테와 나란한 타원)를 따라 왼쪽 · 오른쪽으로 흐르다 끝이 안으로 말림(굵기 · 길이 · 말림 크기 다르게 · 좌우 비대칭)
  const LRX = 160, LRY = 95, along = (t0, t1, off) => Array.from({length: 17}, (_, i) => { const t = (t0 + (t1 - t0) * i / 16) * Math.PI / 180; return [CX + (LRX + off) * Math.cos(t), ACY - (LRY + off) * Math.sin(t)]; });
  const locks = {tone: 3, list: [
    {pts: curlEnd(along(100, 160, 0), 8.5, -1, 1.15), w: 5.2}, {pts: curlEnd(along(104, 166, -6), 5.5, -1, 1.2), w: 3, cls: 'mk-hd'}, {pts: curlEnd(along(98, 152, 6), 4.2, -1, 1.1), w: 2.4, cls: 'mk-hd'},
    {pts: curlEnd(along(80, 18, 0), 7, 1, 1.15), w: 4.6}, {pts: curlEnd(along(76, 26, 6), 4.6, 1, 1.1), w: 2.6, cls: 'mk-hd'}, {pts: curlEnd(along(82, 12, -6), 3.6, 1, 1.1), w: 2, cls: 'mk-hd'}]};
  const clear = (x, y) => (y < ACY && Math.abs(Math.hypot((x - CX) / LRX, (y - ACY) / LRY) - 1) < 0.16) || (x > 318 && y > 112);
  const F = poster({id, title: m.ok ? m.name : NEED, proper: m.ok, v: 3, side: 1, ring: 'mosaic', my: MY, mr: MR, plateTop: R.n ? null : plateTop, bot: BOT, locks, clear});
  const label = m.ok ? m.name + ' 한 달 줄 ' + (m.cl ? pct(m.last) : NEED) + ' · ' + (m.il ? m.il.name + ' ' + pct(m.ilast) : '시장 ' + NEED) + (m.from && m.to ? ' · ' + dk(m.from) + ' ~ ' + dk(m.to) : '')
    + (m.roads.length ? ' · 21곳에 든 길 ' + m.roads.map(r => r.ind + ' ' + r.iv + (r.ivp ? ' ' + r.ivp.join(' ') + '까지' : '') + ' → ' + r.name + ' ' + r.cv + (r.cvp ? ' ' + r.cvp.join(' ') + '까지' : '') + ' → ' + r.kind).join(' · ') : m.ind ? ' · ' + m.ind + ' 업종' : '') : '회사 자료 ' + NEED;
  const svg = s('svg', {class: 'su-svg su-art4 su-co-art', viewBox: `0 0 ${W} ${HT}`, role: 'group', 'aria-label': label, preserveAspectRatio: 'xMidYMid meet', 'data-g': 'su-co-art', 'data-mode': R.n ? 'road' + R.n : m.ok && m.ind ? 'ind' : m.ok ? 'line' : 'need'},
    s('defs', {}, F.defs), F.back,
    m.ok ? chartG(m, P) : T(CX, 330, '이 회사 자료 ' + NEED, 'ca-t ca-b ca-f21', {'text-anchor': 'middle'}),
    R.n ? roadG(m, R, roadTop, BOT) : indG(m, R, plateTop),
    F.front);
  if (opt && opt.still) svg.classList.add('mu-still');
  return svg;
}
