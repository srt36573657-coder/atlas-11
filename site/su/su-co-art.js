/* 수르 — 회사 쪽 큰 그림 「su-co-art」(주문 1023 「머스크 판 4」 · 넷째 판 — docs/design/su-musk-2026-11-05/r4-brief.md 「C」 · judge-r3.md 공통 여덟)
   넷째 판: 꼭대기 굵고 양끝 가는 아치 띠(모자이크 · 꽃 · 별 · 흰 테 없이 새긴 제목) · 여인 1.3배와 원 밖으로 흐르는 머리 다발 · 아래 두 판 꼭대기 상징(불꽃 · 금빛 물결) · 숫자 크게 설명 작게 · 줄 사이 가는 덩굴 · 두루마리는 차트 창 밑선 아래 · 양옆 S 덩굴(잎 · 봉오리 세 배)
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
import {medallion, scroll as kScroll, vine as kVine, beads as kBeads, rays as kRays, taper as kTaper, strands as kStrands} from './su-mucha-kit.js';

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
function archVine(x0, x1, top, ry, k = 4, cls = 'mu-gv') {
  const half = side => Array.from({length: 10}, (_, i) => archPt(x0, x1, top, ry, side ? 0.5 + i * 0.05 : 0.5 - i * 0.05).slice(0, 2));
  const lv = [];
  for (let i = 0; i < k; i++) for (const side of [0, 1]) {
    const t = 0.1 + 0.32 * (i + 0.5) / k, p = archPt(x0, x1, top, ry, side ? 1 - t : t), grow = side ? p[2] : p[2] + 180;
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
  // 띠 무늬 — 모자이크 네모 · 별 · 다섯 점 꽃 · 잎 점(띠 굵기에 맞춰 크기가 변함 · 제목 자리는 비움)
  const deco = [];
  for (let d = 4, i = 0; d <= 176; d += 5.2, i++) {
    const th = d * Math.PI / 180, x = CX + 175.5 * Math.cos(th), y = ACY - 122 * Math.sin(th), T = 13 + 25 * Math.pow(Math.sin(th), 1.6), z = T * 0.27;
    if (Math.abs(x - CX) < tHalf && y < 80) continue;
    const k = i % 4, c = 'mu-m' + (i % 3);
    if (k === 0) deco.push(s('path', {d: `M${r1(x)} ${r1(y - z)}l${r1(z)} ${r1(z)}l${r1(-z)} ${r1(z)}l${r1(-z)} ${r1(-z)}z`, class: c}));
    else if (k === 1) deco.push(star(x, y, z * 1.05, i, 'mu-bstar'));
    else if (k === 2) deco.push(s('g', {}, [0, 1, 2, 3, 4].map(q => { const a = -Math.PI / 2 + q * 2 * Math.PI / 5; return s('circle', {cx: r1(x + Math.cos(a) * z * 0.62), cy: r1(y + Math.sin(a) * z * 0.62), r: r1(z * 0.42), class: 'mu-m2'}); }), s('circle', {cx: r1(x), cy: r1(y), r: r1(z * 0.3), class: 'mu-m0'})));
    else deco.push(s('circle', {cx: r1(x), cy: r1(y), r: r1(z * 0.5), class: 'mu-m1'}));
  }
  const tp = s('textPath', {href: '#' + id + 'tp', startOffset: '50%', text: title});
  tp.setAttributeNS('http://www.w3.org/1999/xlink', 'xlink:href', '#' + id + 'tp');
  const lettering = s('g', {'data-mucha': 'lettering'},
    s('text', {class: 'mu-title mu-n' + size, 'text-anchor': 'middle', ...(o.proper ? {'data-proper': ''} : {})}, tp));
  const bandDeco = s('g', {'data-mucha': 'mosaic', class: 'mu-bdeco'}, deco);
  // 어깨 받침(금 기둥 머리 · 둥근 모서리)
  const caps = s('g', {'data-mucha': 'panel'}, [[10, 44], [W - 54, 44]].map(([x, w]) => s('rect', {x, y: ACY, width: w, height: SH - ACY, rx: 4, class: 'mu-cap'})));
  // 별과 달(마당 빈 쪽 — 여인이 보는 쪽)
  const sx = x => CX + sd * x;
  const spec = [[70, 76, 6, 0], [128, 132, 5, 2], [84, 140, 3.6, 1], [118, 84, 3.4, 2], [-114, 136, 3.4, 1], [-60, 66, 3.2, 0]].filter(([x, y]) => !(o.clear && o.clear(sx(x), y)) && Math.hypot(sx(x) - CX, y - MY) > MR + 10);
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
  // 원 밖으로 흐르는 머리 다발(메달 뒤 — 원 가장자리에서 나와 띠 · 별까지 · 굵은 다발은 공용 strands)
  const locks = o.locks && Array.isArray(o.locks.list) ? s('g', {class: 'mk-hair mk-t' + (o.locks.tone | 0), 'data-mucha': 'whiplash', 'aria-hidden': 'true'},
    o.locks.list.map((pts, i) => s('g', {class: 'mk-sway' + (i % 2 ? '2' : '')}, kStrands(pts, {n: 3, spread: 7, w0: 5, w1: 0.4, curl: 0.9, seed: 40 + i * 7 + v, cls: 'mk-hb'}),
      kStrands(pts, {n: 2, spread: 7, w0: 1.6, w1: 0.15, curl: 0.9, seed: 52 + i * 7 + v, cls: 'mk-hd'}), kStrands(pts, {n: 2, spread: 5, w0: 1.2, w1: 0.12, curl: 0.7, seed: 61 + i * 7 + v, cls: 'mk-hl'})))) : null;
  // 아홉째 판: o.noMedal 이면 메달 흉상을 그리지 않음(큰 여인이 그림을 채움) · o.under = 아치 띠 밑에 깔 것(여인 후광 — 띠가 후광 윗머리를 덮음)
  return {back: [ground, o.under || null, outline, bandDeco, caps, stars, vine, mosaic, plateVine], front: [lettering, locks, o.noMedal ? null : s('g', {class: 'mu-medal'}, medallion({cx: CX, cy: MY, r: MR, v, dir: o.dir === -1 ? -1 : 1, ring: o.ring || 'mosaic'}))],
    defs: [s('path', {id: id + 'tp', d: ell(166, 111.5)}), s('clipPath', {id: id + 'gc'}, s('rect', {x: 3, y: 3, width: W - 6, height: HT - 6, rx: 20}))]};
}
/* ═══ 아홉째 판 — 큰 여인 한 명이 그림을 채움(docs/design/su-musk-2026-11-05/r9-brief.md 「새 짜임」 · su-road-art friend 의 그리는 법을 빌림)
   몸 = 점을 캣멀-롬으로 이은 채운 모양 · 바깥선 = 굵게 시작해 끝에서 가늘어지는 공용 taper · 주름 = 위 가늘고 아래 굵은 채운 줄 · 머리채 = 가는 가닥을 묶은 공용 strands 다발
   04 · 05 가 같은 뼈대를 쓰되 T(좌우 뒤집기 · 세로 줄임) · 팔 · 소품 · 옷 색을 달리함 ═══ */
function crp(p, closed = false, k = 6) {
  const n = p.length, at = i => (closed ? p[((i % n) + n) % n] : p[Math.max(0, Math.min(n - 1, i))]), o = [p[0]];
  for (let i = 0; i < (closed ? n : n - 1); i++) {
    const p0 = at(i - 1), p1 = at(i), p2 = at(i + 1), p3 = at(i + 2);
    for (let j = 1; j <= k; j++) { const t = j / k, t2 = t * t, t3 = t2 * t; o.push([0, 1].map(q => 0.5 * (2 * p1[q] + (p2[q] - p0[q]) * t + (2 * p0[q] - 5 * p1[q] + 4 * p2[q] - p3[q]) * t2 + (3 * p1[q] - p0[q] - 3 * p2[q] + p3[q]) * t3))); }
  }
  return o;
}
const fillD = p => 'M' + crp(p, true).map(q => r1(q[0]) + ' ' + r1(q[1])).join('L') + 'Z';
const shape = (p, cls) => s('path', {d: fillD(p), class: cls});
const inkL = (p, w0 = 2.8, w1 = 0.45, cls = 'lw-ink') => kTaper(p, {w0, w1, cls});
const foldL = (p, w0 = 0.35, w1 = 2.1, cls = 'lw-fold') => kTaper(p, {w0, w1, cls});
/** 머리 다발 — 가는 가닥을 묶은 다발 하나(뿌리 굵고 끝 가늘게 · 끝이 말림) */
const tress = (pts, {n = 4, spread = 12, w0 = 2.6, curl = 0.8, seed = 1, tone = 3, sway = ''} = {}) => s('g', {class: ('mk-hair mk-t' + tone + ' ' + sway).trim()}, kStrands(pts, {n, spread, w0, w1: 0.22, curl, seed, cls: 'mk-hb'}));
/** 꽃잎 후광 — 금테 · 빛살 · 점 고리 · 살구와 금 꽃잎 고리 · 머리 뒤 둥근 판 */
function haloL(cx, cy, r) {
  const pet = [[], []], n = 28;
  for (let k = 0; k < n; k++) { const a = k * 360 / n - 90, ar = a * Math.PI / 180, r0 = r - 24; pet[k % 2].push(leaf(cx + r0 * Math.cos(ar), cy + r0 * Math.sin(ar), a, k % 2 ? 11 : 15, k % 2 ? 'lw-hp2' : 'lw-hp')); }
  const dots = []; for (let k = 0; k < 56; k++) { const a = k * Math.PI / 28; dots.push(s('circle', {cx: r1(cx + (r - 4.4) * Math.cos(a)), cy: r1(cy + (r - 4.4) * Math.sin(a)), r: k % 2 ? 0.9 : 1.5, class: 'lw-hd'})); }
  return s('g', {'data-mucha': 'halo', class: 'lw-halo'}, s('circle', {cx, cy, r, class: 'lw-h0'}), kRays(cx, cy, r * 0.5, r - 8, {n: 48}), s('circle', {cx, cy, r: r - 9, class: 'lw-h1'}), dots, pet, s('circle', {cx, cy, r: r * 0.52, class: 'lw-h2'}), s('circle', {cx, cy, r: r * 0.52 - 4, class: 'lw-h3'}));
}
/** 여인 뼈대(04 자리 · 목 밑 y 136 · 치맛단 y 588 · 엉덩이를 왼쪽으로 내민 S자) */
const LB = {
  L: [[186, 134], [166, 140], [150, 148], [144, 160], [147, 178], [152, 196], [160, 212], [167, 226], [156, 246], [136, 268], [123, 294], [127, 334], [139, 376], [146, 416], [142, 458], [134, 502], [122, 546], [104, 582]],
  HEM: [[104, 582], [120, 591], [140, 585], [158, 593], [178, 587], [198, 594], [220, 588], [242, 594], [264, 586], [284, 591], [298, 579]],
  R: [[298, 579], [278, 542], [264, 498], [256, 452], [252, 406], [250, 358], [251, 314], [250, 282], [244, 256], [230, 234], [224, 222], [232, 206], [240, 190], [244, 170], [242, 154], [230, 144], [212, 138], [204, 134]],
  folds: [[[178, 252], [168, 330], [180, 420], [166, 500], [176, 586]], [[206, 250], [218, 330], [206, 420], [220, 500], [214, 590]], [[232, 262], [244, 344], [234, 430], [250, 510], [262, 586]],
    [[154, 276], [143, 360], [154, 440], [142, 520], [132, 584]], [[192, 300], [197, 380], [188, 460], [199, 540], [196, 592]], [[244, 300], [238, 380], [246, 456], [240, 520], [282, 584]]],
  bodice: [[[176, 168], [186, 182], [196, 188], [208, 184], [218, 170]], [[170, 194], [182, 206], [196, 210], [212, 206], [224, 194]]],
  sash: [[240, 148], [236, 170], [222, 196], [202, 214], [182, 228], [164, 242], [150, 258], [166, 266], [184, 250], [204, 238], [226, 220], [244, 198], [252, 172], [250, 152]],
  casc: [[150, 258], [134, 292], [126, 342], [124, 402], [118, 462], [106, 522], [88, 566], [66, 586], [96, 594], [120, 582], [140, 550], [156, 502], [164, 442], [168, 382], [170, 322], [168, 264]],
  cfold: [[[146, 286], [138, 360], [136, 440], [124, 520], [100, 574]], [[158, 300], [154, 380], [150, 460], [138, 530], [118, 580]]],
  belt: [[164, 218], [196, 226], [228, 216], [229, 227], [196, 237], [163, 229]],
  collar: [[176, 132], [196, 139], [216, 131], [218, 143], [196, 152], [174, 144]],
};
/** 큰 여인 — o = {T(점 → 점), dress, mantle, hair(머리 색 번호), face:{cx, cy, h, dir, tilt, iris, v}, up:[윗팔 소매 둘](T 뒤 좌표), arms:[공용 sleeve 설정], tresses:[[점들, 설정]], front:[[점들, 설정]], crown}
 *  → {back(머리채 · 뒤), body(몸 · 옷 · 얼굴), arms(앞 팔)} */
function lady(o) {
  const T = o.T || (p => p), M = a => a.map(T), dr = o.dress || 'lw-d1', ma = o.mantle || 'lw-m1';
  const L = M(LB.L), HEM = M(LB.HEM), R = M(LB.R), f = o.face;
  const dress = shape([...L, ...HEM.slice(1, -1), ...R], dr);
  const folds = LB.folds.map(a => foldL(M(a), 0.35, 2.2, 'lw-fold'));
  const bod = LB.bodice.map(a => foldL(M(a), 1.4, 0.3, 'lw-fold'));
  const hemDots = crp(HEM, false, 3).filter((_, i) => i % 3 === 1).map(q => s('circle', {cx: r1(q[0]), cy: r1(q[1] - 7), r: 1.5, class: 'lw-gdot'}));
  const sash = shape(M(LB.sash), ma), casc = shape(M(LB.casc), ma), cf = LB.cfold.map(a => foldL(M(a), 0.4, 2.4, 'lw-mfold'));
  const hl = T([66, 586]), hr = T([298, 579]), sg = T([1, 0])[0] > T([0, 0])[0] ? 1 : -1;
  const swirls = [kTaper(curlPts(hl[0], hl[1], sg > 0 ? Math.PI : 0, 9, -sg, 1.4), {w0: 6, w1: 0.6, cls: 'lw-mink'}), kTaper(curlPts(hr[0], hr[1], sg > 0 ? 0 : Math.PI, 8, sg, 1.4), {w0: 5, w1: 0.6, cls: 'lw-dink'})];
  const edges = [inkL(L.slice(2), 3, 0.5), inkL(R.slice(0, -2).reverse(), 3, 0.5), inkL(M(LB.casc.slice(0, 8)), 2.4, 0.5), inkL(M(LB.sash.slice(0, 7)), 1.8, 0.4), inkL(HEM, 1.6, 0.6)];
  const up = (o.up || []).map(p => [shape(p, 'lw-sl ' + (o.sleeve || 'lw-s1')), inkL(p.slice(0, 7), 2.4, 0.4)]);
  const upF = (o.up || []).map(p => foldL([p[1], p[3], p[5]].map(q => [q[0] * 0.7 + p[9][0] * 0.3, q[1] * 0.7 + p[9][1] * 0.3]), 0.3, 1.6, 'lw-fold'));
  const belt = shape(M(LB.belt), 'lw-belt'), bc = T([196, 231]);
  const collar = shape(M(LB.collar), 'lw-belt');
  const pearls = Array.from({length: 9}, (_, k) => { const q = T([179 + k * 4.6, 143 + Math.sin(k / 8 * Math.PI) * 4]); return s('circle', {cx: r1(q[0]), cy: r1(q[1]), r: 1.3, class: 'lw-pearl'}); });
  const fc = kFace({cx: f.cx, cy: f.cy, h: f.h, dir: f.dir, view: 'three', tilt: f.tilt, iris: f.iris || 0, v: f.v});
  const hr0 = s('g', {transform: `rotate(${r1(f.tilt * f.dir)} ${r1(f.cx)} ${r1(f.cy)})`}, kHair({cx: f.cx, cy: f.cy, h: f.h, dir: f.dir, tone: o.hair, len: 1.2, seed: o.seed || 5, view: 'three'}));
  const back = s('g', {'data-mucha': 'whiplash', class: 'lw-back'}, (o.tresses || []).map(([p, c]) => tress(p, {tone: o.hair, ...c})));
  const body = s('g', {'data-mucha': 'outline', class: 'lw-body'}, casc, cf, dress, folds, bod, hemDots, sash, swirls, up, upF, edges, belt, s('circle', {cx: r1(bc[0]), cy: r1(bc[1] - 4), r: 3.4, class: 'lw-gem'}), hr0, fc, collar, pearls,
    o.crown || null, (o.front || []).map(([p, c]) => tress(p, {tone: o.hair, ...c})));
  const arms = s('g', {'data-mucha': 'outline', class: 'lw-arms'}, (o.arms || []).map(a => kSleeve(a)));
  return {back, body, arms};
}
/** 꽃관 — 머리 위 둥근 줄을 따라 작은 꽃 · 잎(고개와 같이 기울임) */
function crownL(f, tones) {
  const a0 = f.tilt * f.dir * Math.PI / 180, P = (u, v) => [f.cx + u * Math.cos(a0) - v * Math.sin(a0), f.cy + u * Math.sin(a0) + v * Math.cos(a0)];
  return s('g', {class: 'lw-crown'}, tones.map((c, i) => { const a = (-160 + i * 140 / Math.max(1, tones.length - 1)) * Math.PI / 180, p = P((-0.1 * f.dir + 0.5 * Math.cos(a)) * f.h, (-0.32 + 0.46 * Math.sin(a)) * f.h);
    return [leaf(p[0], p[1], a * 180 / Math.PI - 40, 9, 'mu-leaf'), flower(p[0], p[1], 4.6 + (i % 2) * 1.2, ' lw-cf' + (i % 3), 1 + (i % 3))]; }));
}
export const MU = {poster, brush, fall, swell, flower, leaf, star, moon, wrapW, tw, spanLines, r1, ribbonD, archD, archPt, archVine, scrollT, curlPts, lady, haloL, crownL, crp, shape, inkL, foldL, tress};

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
  const {PL, PR, PT, PB, LX, LR, A, ry, WX0, WX1, WB, id} = P, out = [], labs = [];
  const win = archD(WX0, WX1, A, ry, WB);
  // 창 — 안은 아주 옅은 빛살(값을 가리지 않음) · 금 두 줄 테 · 머리에 금 덩굴
  out.push(s('defs', {}, s('clipPath', {id: id + 'wc'}, s('path', {d: win}))),
    s('g', {'data-mucha': 'panel'}, s('path', {d: win, class: 'ca-win'}), s('g', {'clip-path': `url(#${id}wc)`}, kRays(CX, WB, 26, Math.min(168, HT - 6 - WB), {n: 40})),
      s('path', {d: win, class: 'ca-winl'}), s('path', {d: archD(WX0 + 5, WX1 - 5, A + 5, ry - 4, WB), class: 'ca-winl2'})),
    archVine(WX0, WX1, A, ry, 5));
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
  if (headT) out.push(s('g', {'data-per': 'line'}, T(CX, A + 48, headT, 'ca-t ca-m ca-f18 ca-onw', {'text-anchor': 'middle'})));
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
/** 값 줄 — 설명(18) + 숫자(크게 · 칸에 맞춰 24 → 20) 한 줄 · 안 들면 두 줄 */
const NPX = [24, 23, 22, 21, 20];
function valRows(lab, val, tmax) {
  const one = lab ? NPX.find(px => tw(lab + ' ', 18) + tw(val, px) <= tmax) : NPX.find(px => tw(val, px) <= tmax);
  if (one) return {rows: [{lab, val, px: one}], h: 28};
  const px = NPX.find(q => tw(val, q) <= tmax) || 20;
  return {rows: [...(lab ? wrapW(lab, 18, tmax).map(l => ({lab: l, val: null, px: 18})) : []), ...wrapW(val, px, tmax).map(l => ({lab: null, val: l, px}))], h: 0};
}
const rowsH = R => R.h || R.rows.reduce((a, r) => a + (r.val ? 28 : 20), 0);
function roadPlan(m) {
  const n = m.roads.length;
  if (!n) { const lines = m.ind ? wrapW(m.ind + ' 업종', 20, 220) : []; return {n, plateH: m.ind ? Math.max(84, lines.length * 24 + 58) : 30, lines, H: 0}; }
  const gap = 12, X0 = 30, X1 = W - 30, pw = n === 1 ? 300 : (X1 - X0 - (n - 1) * gap) / n, tmax = pw - 12;
  const cols = m.roads.map(r => {
    const pers = [r.ivp, r.cvp].filter(Boolean), same = pers.length > 0 && pers.every(p => p[0] === pers[0][0] && p[1] === pers[0][1]), sameD = pers.length > 0 && !!pers[0][1] && pers.every(p => p[1] === pers[0][1]);
    const head = same ? spanLines(pers[0][0], null, pers[0][1], 18, tmax) : sameD ? [pers[0][1] + '까지'] : [];
    const perOf = p => (!p || same ? [] : sameD ? [p[0]] : spanLines(p[0], null, p[1], 18, tmax));
    const iv = valRows(r.ivL, r.ivN, tmax), cvBoth = valRows(r.name, r.cv, tmax);
    const cv = cvBoth.h || r.k !== 'money' ? cvBoth : valRows(null, r.cv, tmax);
    return {head, iv, ivPer: perOf(r.ivp), cv, cvPer: perOf(r.cvp), kind: wrapW(r.kind + ' 7곳에 듦', 19, tmax)};
  });
  const headN = Math.max(...cols.map(c => c.head.length)), nA = Math.max(...cols.map(c => rowsH(c.iv) + c.ivPer.length * 20)), nB = Math.max(...cols.map(c => rowsH(c.cv) + c.cvPer.length * 20)), nC = Math.max(...cols.map(c => c.kind.length));
  const rib = wrapW(m.roads[0].ind + ' 업종', 20, 230), rh = 34 + (rib.length - 1) * 23;
  return {n, gap, X0, pw, cols, headN, nA, nB, nC, rib, rh, plateH: 0, H: rh + 2 + 22 + headN * 20 + 8 + nA + 10 + nB + 10 + nC * 21 + 6};
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
  const {n, gap, X0, pw, cols, headN, nA, nB, rib, rh} = R, x0 = n === 1 ? (W - pw) / 2 : X0, wins = [], deco = [], rules = [], out = [];
  const Tp = top + rh + 2, ry = n === 1 ? 26 : 24, hTop = Tp + 22, aTop = hTop + headN * 20 + 8, bTop = aTop + nA + 10, cTop = bTop + nB + 10;
  const valG = (cx, y0, V, per, on) => { let y = y0; const g = [];
    for (const r of V.rows) {
      if (r.lab && r.val) { const w = tw(r.lab + ' ', 18) + tw(r.val, r.px), x = cx - w / 2; g.push(s('text', {x: r1(x), y: r1(y + 22), class: 'ca-t' + on}, s('tspan', {class: 'ca-lab ca-f18', text: r.lab + ' '}), s('tspan', {class: 'ca-num ca-f' + r.px, text: r.val}))); y += 28; }
      else if (r.val) { g.push(T(cx, y + 22, r.val, 'ca-t ca-num ca-f' + r.px + on, {'text-anchor': 'middle'})); y += 28; }
      else { g.push(T(cx, y + 16, r.lab, 'ca-t ca-lab ca-f18' + on, {'text-anchor': 'middle'})); y += 20; }
    }
    per.forEach((l, i) => g.push(T(cx, y + 15 + i * 20, l, 'ca-t ca-m ca-f18' + on, {'text-anchor': 'middle'})));
    return g; };
  cols.forEach((c, ci) => {
    const x = x0 + ci * (pw + gap), cx = x + pw / 2, k = m.roads[ci].k, on = ' ca-on-' + k;
    wins.push(s('path', {d: archD(x, x + pw, Tp, ry, bot), class: 'ca-pan ca-pan-' + k}), s('path', {d: archD(x + 4.5, x + pw - 4.5, Tp + 4.5, ry - 3.5, bot), class: 'ca-panl2'}));
    deco.push(archVine(x, x + pw, Tp, ry, 3), sigil(k, cx, Tp + 11));
    const h0 = hTop + (headN - c.head.length) * 10;
    out.push(s('g', {'data-road': 'per'}, c.head.map((l, i) => T(cx, h0 + 15 + i * 20, l, 'ca-t ca-m ca-f18' + on, {'text-anchor': 'middle'}))));
    if (c.head.length) deco.push(s('g', {class: 'ca-base'}, kBeads(cx - 26, r1(hTop + headN * 20 + 3), cx + 26, r1(hTop + headN * 20 + 3), {gap: 6.5, r: 1.4})));
    out.push(s('g', {'data-road': 'indv'}, valG(cx, aTop, c.iv, c.ivPer, on)));
    out.push(s('g', {'data-road': 'co'}, valG(cx, bTop, c.cv, c.cvPer, on)));
    out.push(s('g', {'data-road': 'list'}, c.kind.map((l, i) => T(cx, cTop + 16 + i * 21, l, 'ca-t ca-b ca-f19 ca-k-' + k + on, {'text-anchor': 'middle'}))));
    rules.push(vineRule(cx, aTop + nA + 4), vineRule(cx, bTop + nB + 4));
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
  const WB = R.n ? roadTop - 6 : plateTop - 22;
  const P = {PL: 50, PR: 166, PT: A + 62, PB: R.n ? roadTop - 24 : WB - 22, LX: 180, LR: 350, bot: R.n ? roadTop - 12 : WB - 10, A, ry: 52, WX0: 34, WX1: W - 34, WB, id};
  // 여인 1.3배(어깨 · 옷 주름까지) · 머리 다발 둘이 원 밖으로 흘러 띠의 별 · 꽃까지(뒤통수 쪽 = 왼쪽)
  const locks = {tone: 3, list: [[[CX - 26, MY - 30], [CX - 52, MY - 52], [CX - 80, MY - 40], [CX - 100, MY - 50], [CX - 108, MY - 70], [CX - 100, MY - 84]],
    [[CX - 34, MY + 18], [CX - 62, MY + 40], [CX - 92, MY + 24], [CX - 114, MY + 30], [CX - 122, MY + 48]]]};
  const F = poster({id, title: m.ok ? m.name : NEED, proper: m.ok, v: 3, side: 1, ring: 'mosaic', my: MY, mr: MR, plateTop: R.n ? null : plateTop, bot: BOT, locks});
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
