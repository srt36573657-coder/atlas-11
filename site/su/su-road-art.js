/* 수르 그림 부품 — su-road-art(주문 1023 「머스크 판 4」 · 아름다움 심사 2회 judge-r2.md → 셋째 판 r3-brief.md 「F」)
   ① 친구에게(#/f) — 짜임은 그대로: S자로 선 여인 · 아치 둘레 꽃 화환 · 여섯 꽃 메달(주소 · 차례 그대로)
      얼굴 · 머리 · 손은 공용 부품(su-mucha-kit.js): 내리깐 눈 반측면 얼굴(face) · 머리는 가는 올 다발(strands · 뿌리 굵게 끝 가늘게)이
      정수리에서 후광 둘레를 따라 어깨 · 등 뒤로 흘러내려 말림(옆으로 뻗지 않음 · 끝 몇 올은 후광 테 밖) · 머리에 얹은 손 = 긴 손가락(sleeve touch)
      후광 = 빛살 + 살구 · 금 꽃잎 고리 + 점 고리(흰 타원 없음) · 분홍 겉옷 = 휘는 주름 넷(가늘게 → 굵게) · 메달 리본 끝 = 말린 리본
      「21곳을 친구와 함께」 = 양끝 말린 두루마리(치맛단 아래 · 치마 아랫단을 조금 올려 띠가 자르지 않음)
   ② 셋의 길(#/g) — 넷째 판 r4-brief.md 「F」: 제목은 아치 안쪽 곡선을 따라 휜 띠(ribbon)에 새김(흰 테 없음) · 메달 여인 v=7 ·
      굵은 머리 다발이 메달 테를 넘어 S 로 양옆 세로 판 덩굴까지 · 부제는 메달 밑을 감싸는 띠 · 가운데 줄기는 크게 S(아래 굵고 위 가늚) ·
      여덟 갈래 = 줄기에서 돋은 잎사귀 패(줄기 쪽 넓고 끝이 둥글게 뾰족 · 가는 금 테 · 글씨 밑 줄 없음 · 복숭아 · 쑥 · 크림 셋)
   그리기는 createElementNS · setAttribute(su-fig.js s · 부품)만 — 꾸밈은 /su/su-road-art.css 클래스 · 부품 꾸밈은 쪽이 이미 받음
   글씨는 처음부터 진하게 · 움직임은 꽃 · 머리칼에만(transform · 들어오는 움직임은 0.6초 안에 끝남)
   여인의 살 · 옷 · 꽃은 고정 색(어두운 판에서도 크림 · 상아 · 파스텔) — 바탕과 틀만 판 색을 따름
   무하 요소는 <g data-mucha="…"> — halo · arch · outline · whiplash · vine · mosaic · pastel · lettering · panel · stars */
import {s} from '/su/su-fig.js';
import {feats, ORDER, SHORT, HEAD} from '/su/su-roads.js';
import {strands, face, hair, medallion, scroll, rays, sleeve, ribbon} from './su-mucha-kit.js';

export const CSS = '/su/su-road-art.css';
const W = 390, H = 620, NEED = '확인 필요', PI = Math.PI;
/** 친구에게 건네는 여섯 — 주소는 vFriend 카드 그대로 · 읽는 차례(왼쪽 → 오른쪽, 위 → 아래) */
const FRIEND = Object.freeze([
  {t: '카톡 보내기', href: '/next/?su=guest#/share', c: 'apri'},
  {t: '선물', href: '/next/?su=guest#/gift', c: 'gold'},
  {t: '커피 쿠폰', href: '/next/?su=stop#/why', c: 'leaf'},
  {t: '소개 영상', href: '/hello.html?su=guest', c: 'apri'},
  {t: '내 종목', href: '/next/?su=stop#/me', c: 'gold'},
  {t: '진화', href: '/next/?su=back#/jinhwa', c: 'leaf'}]);
/** 여덟 갈래 이름표 색 — 복숭아 · 쑥 · 크림 셋을 차례로(옆 갈래와 겹치지 않게) · 안쪽 끝 꽃 색 */
const TONES = ['peach', 'ssuk', 'cream'];
const BLOOM = {peach: 'apri', ssuk: 'gold', cream: 'rose'};

/** 자료 — which = 'roads'(셋의 길) | 'friend'(친구에게) */
export async function load(get, which = 'roads') {
  if (which === 'friend') {
    let T = null;
    try { T = typeof get === 'function' ? await get('/su/data/su21.json') : null; } catch { T = null; }
    const n = ['hot', 'bloom', 'money'].reduce((a, k) => a + (Array.isArray(T?.lists?.[k]) ? T.lists[k].length : 0), 0);
    return {which: 'friend', items: FRIEND, n: n || null};
  }
  let F = [];
  try { F = await feats(); } catch { F = []; }
  if (!Array.isArray(F)) F = [];
  return {which: 'roads', total: F.length || null,
    rows: ORDER.map(k => ({g: k, name: SHORT[k], head: HEAD[k], n: F.length ? F.filter(f => f.group === k).length : null}))};
}

/** 그림 — load 가 준 것으로 <svg viewBox="0 0 390 620"> 하나 */
export function picture(d, opt = {}) {
  return (d?.which ?? opt?.which) === 'friend' ? friend(d) : roads(d);
}

/* ── 모양 셈 ── */
const f1 = n => Math.round(n * 10) / 10;
const P = (x, y) => f1(x) + ' ' + f1(y);
const g = (a, ...k) => s('g', a, ...k);
const path = (d, cls, extra = {}) => s('path', {d, class: cls, ...extra});
const circ = (cx, cy, r, cls) => s('circle', {cx: f1(cx), cy: f1(cy), r: f1(r), class: cls});
const text = (x, y, t, cls, anchor = 'middle') => s('text', {x: f1(x), y: f1(y), 'text-anchor': anchor, class: cls, text: t});
/** 글 폭 어림 — 한글 1em · 숫자 0.6em · 띄어쓰기 0.32em */
const tw = (t, px) => [...String(t)].reduce((a, ch) => a + (/[ㄱ-힝]/.test(ch) ? 1 : /[0-9]/.test(ch) ? 0.6 : ch === ' ' ? 0.32 : 0.55) * px, 0);
/** 3차 곡선 점 */
function bez(a, b, c, d, n = 24) {
  const o = [];
  for (let i = 0; i <= n; i++) { const t = i / n, u = 1 - t;
    o.push([u * u * u * a[0] + 3 * u * u * t * b[0] + 3 * u * t * t * c[0] + t * t * t * d[0], u * u * u * a[1] + 3 * u * u * t * b[1] + 3 * u * t * t * c[1] + t * t * t * d[1]]); }
  return o;
}
/** 곡선 사슬 — [x0, y0, c1x, c1y, c2x, c2y, x1, y1, …] (3차 곡선을 이어 붙인 것) */
const segs = a => Array.from({length: (a.length - 2) / 6}, (_, k) => [[a[6 * k], a[6 * k + 1]], [a[6 * k + 2], a[6 * k + 3]], [a[6 * k + 4], a[6 * k + 5]], [a[6 * k + 6], a[6 * k + 7]]]);
const dC = a => segs(a).map(([, b, c, e]) => 'C' + P(...b) + ' ' + P(...c) + ' ' + P(...e)).join('');
const closed = (...ch) => 'M' + P(ch[0][0], ch[0][1]) + ch.map(dC).join('') + 'Z';
const pts = (a, n = 14) => segs(a).flatMap(([p, b, c, e], k) => bez(p, b, c, e, n).slice(k ? 1 : 0));
const rev = a => { const S = segs(a).reverse(); return [S[0][3][0], S[0][3][1], ...S.flatMap(([p, b, c]) => [c[0], c[1], b[0], b[1], p[0], p[1]])]; };
/** 두 사슬 사이(같은 마디 수) — 주름 결 */
const mix = (a, b, t) => a.map((v, i) => v + (b[i] - v) * t);
/** 굵기가 변하는 선 — 선 대신 채운 초승달 꼴(w0 에서 w1 로 · bulge = 가운데 부풂) */
function taper(p, w0, w1, bulge = 0) {
  const L = [], R = [], n = p.length;
  for (let i = 0; i < n; i++) {
    const q = p[Math.min(n - 1, i + 1)], o = p[Math.max(0, i - 1)];
    let dx = q[0] - o[0], dy = q[1] - o[1]; const len = Math.hypot(dx, dy) || 1; dx /= len; dy /= len;
    const t = i / Math.max(1, n - 1), hw = (w0 + (w1 - w0) * t + bulge * Math.sin(PI * t)) / 2;
    L.push([p[i][0] - dy * hw, p[i][1] + dx * hw]); R.push([p[i][0] + dy * hw, p[i][1] - dx * hw]);
  }
  return 'M' + L.map(([x, y]) => P(x, y)).join('L') + 'L' + R.reverse().map(([x, y]) => P(x, y)).join('L') + 'Z';
}
const edge = (a, w0, w1, cls = 'w-edge', bulge = 0) => path(taper(pts(a), w0, w1, bulge), cls);
/** 채찍 곡선 점 — 3차 곡선 하나로 휘었다가 끝이 안으로 말림(접선이 이어지게) · dir 1 = 화면에서 시계 방향 */
function whipPts(p0, p1, p2, p3, r, dir, turns = 1.15) {
  const A = bez(p0, p1, p2, p3, 22);
  let tx = p3[0] - p2[0], ty = p3[1] - p2[1]; const l = Math.hypot(tx, ty) || 1; tx /= l; ty /= l;
  const N = dir > 0 ? [-ty, tx] : [ty, -tx], c = [p3[0] + N[0] * r, p3[1] + N[1] * r], a0 = Math.atan2(p3[1] - c[1], p3[0] - c[0]), B = [];
  for (let i = 1; i <= 26; i++) { const t = i / 26, a = a0 - dir * t * turns * 2 * PI, rr = r * (1 - 0.8 * t); B.push([c[0] + rr * Math.cos(a), c[1] + rr * Math.sin(a)]); }
  return [...A, ...B];
}
const whip = (p0, p1, p2, p3, r, dir, w0, w1, turns) => taper(whipPts(p0, p1, p2, p3, r, dir, turns), w0, w1);
/** 끝 말림 — 점들 끝에 안으로 말리는 소용돌이를 이음(마지막 접선을 이어받음) */
function curl(A, r, dir, turns = 1.15) {
  const a = A[A.length - 2], b = A[A.length - 1];
  let tx = b[0] - a[0], ty = b[1] - a[1]; const l = Math.hypot(tx, ty) || 1; tx /= l; ty /= l;
  const N = dir > 0 ? [-ty, tx] : [ty, -tx], c = [b[0] + N[0] * r, b[1] + N[1] * r], a0 = Math.atan2(b[1] - c[1], b[0] - c[0]), B = [];
  for (let i = 1; i <= 24; i++) { const t = i / 24, an = a0 - dir * t * turns * 2 * PI, rr = r * (1 - 0.78 * t); B.push([c[0] + rr * Math.cos(an), c[1] + rr * Math.sin(an)]); }
  return [...A, ...B];
}
/** 점 사이를 매끈하게(캣멀-롬) — 머리 다발 속 띠 */
function smooth(p, k = 8) {
  const o = [p[0]], at = i => p[Math.max(0, Math.min(p.length - 1, i))];
  for (let i = 0; i < p.length - 1; i++) { const p0 = at(i - 1), p1 = at(i), p2 = at(i + 1), p3 = at(i + 2);
    for (let j = 1; j <= k; j++) { const t = j / k, t2 = t * t, t3 = t2 * t; o.push([0, 1].map(q => 0.5 * (2 * p1[q] + (p2[q] - p0[q]) * t + (2 * p0[q] - 5 * p1[q] + 4 * p2[q] - p3[q]) * t2 + (3 * p1[q] - p0[q] - 3 * p2[q] + p3[q]) * t3))); } }
  return o;
}
/** 머리 다발(친구에게) — 가는 속 띠(뿌리 굵게 · 끝 가늘게) 위에 공용 부품 strands 한 겹(2판 — 굵은 다발 넷 ~ 여섯 · 속 결은 부품이 그림) */
const tress = (p, {n = 8, spread = 10, w0 = 2.4, curl: cu = 0.6, seed = 1, tone = 1, sway = '', core = 0} = {}) => g({class: ('mk-hair mk-t' + tone + ' ' + sway).trim()},
  core ? path(taper(smooth(p), core, core * 0.12, core * 0.2), 'mk-hb') : null,
  strands(p, {n, spread, w0, w1: 0.22, curl: cu, seed, cls: 'mk-hb'})); // 부품 2판 strands 가 다발마다 속 결(어둡게 · 밝게)을 그리므로 한 겹만(세 겹이면 다발 열여섯 — 지푸라기)
/** 물방울 잎 — (x, y) 에서 ang 쪽으로 len */
const leaf = (x, y, len, ang, cls = 'w-leaf') => path(`M0 0Q${f1(len * 0.45)} ${f1(-len * 0.36)} ${f1(len)} 0Q${f1(len * 0.45)} ${f1(len * 0.36)} 0 0Z`, cls, {transform: `translate(${f1(x)} ${f1(y)}) rotate(${f1(ang)})`});
/** 다섯 장 꽃(양식화) — 꽃잎은 고정 파스텔 · cls = 꽃 묶음 움직임 */
function flower(x, y, r, tone, k = 5, rot = -90, cls = 'ra-bloom') {
  return g({class: cls},
    Array.from({length: k}, (_, i) => { const a = rot + i * 360 / k, ar = a * PI / 180, ex = x + r * 0.56 * Math.cos(ar), ey = y + r * 0.56 * Math.sin(ar);
      return s('ellipse', {cx: f1(ex), cy: f1(ey), rx: f1(r * 0.52), ry: f1(r * 0.38), transform: `rotate(${f1(a)} ${f1(ex)} ${f1(ey)})`, class: 'w-pet w-p-' + tone}); }),
    circ(x, y, r * 0.3, 'w-core'));
}
/** 다섯 갈래 별 · 초승달 */
function star(x, y, r, cls = 'ra-star') {
  const p = Array.from({length: 10}, (_, i) => { const a = -PI / 2 + i * PI / 5, rr = i % 2 ? r * 0.42 : r; return P(x + rr * Math.cos(a), y + rr * Math.sin(a)); });
  return path('M' + p.join('L') + 'Z', cls);
}
const moon = (x, y, r, cls = 'ra-moon') => path(`M${P(x + r * 0.2, y - r)}A${f1(r)} ${f1(r)} 0 1 0 ${P(x + r * 0.2, y + r)}A${f1(r * 0.78)} ${f1(r * 0.78)} 0 1 1 ${P(x + r * 0.2, y - r)}Z`, cls);

/* ── 틀(두 그림이 같이 씀) — 아치 · 아치 띠 모자이크 · 세로 판 ── */
const archD = i => `M${10 + i} ${612 - i}V176A${185 - i} ${166 - i} 0 0 1 ${380 - i} 176V${612 - i}Z`;
const root = (cls, label) => s('svg', {class: 'su-svg su-art4 su-road-art ' + cls, viewBox: `0 0 ${W} ${H}`, role: 'group', 'aria-label': label, preserveAspectRatio: 'xMidYMid meet'});
function frame() {
  const arch = g({'data-mucha': 'arch', class: 'ra-arch'}, path(archD(0), 'ra-arch-o'), path(archD(10), 'ra-arch-i'));
  // 아치 띠 안 모자이크 — 금 · 연두 · 살구 작은 네모와 점을 번갈아(비잔틴 풍)
  const tiles = [];
  for (let k = 0; k <= 44; k++) { const a = PI + PI * k / 44, x = 195 + 180 * Math.cos(a), y = 176 + 161 * Math.sin(a), deg = a * 180 / PI + 90, tone = ['ra-m1', 'ra-m2', 'ra-m3'][k % 3];
    tiles.push(k % 2 ? circ(x, y, 1.9, tone) : s('rect', {x: f1(x - 2.6), y: f1(y - 2.6), width: 5.2, height: 5.2, rx: 0.8, class: tone, transform: `rotate(${f1(deg)} ${f1(x)} ${f1(y)})`})); }
  for (let y = 186; y <= 600; y += 14) [15, 375].forEach((x, j) => tiles.push(((y - 186) / 14 + j) % 2 ? circ(x, y, 1.8, 'ra-m' + (1 + ((y / 14) | 0) % 3)) : s('rect', {x: x - 2.4, y: y - 2.4, width: 4.8, height: 4.8, rx: 0.8, class: 'ra-m' + (1 + ((y / 14) | 0) % 3), transform: `rotate(45 ${x} ${y})`})));
  const mosaic = g({'data-mucha': 'mosaic', class: 'ra-mosaic'}, tiles);
  return {arch, mosaic};
}
/** 후광 — 바깥 금테 · 점 고리 · 살구 · 금 꽃잎 고리(바깥으로 핌) · 아주 옅은 빛살 · 머리 뒤 둥근 판(흰 타원 없음) */
function halo(cx, cy, r, inner) {
  const pet = [[], []], n = 30;
  for (let k = 0; k < n; k++) { const a = k * 360 / n - 90, ar = a * PI / 180, r0 = r - 27; pet[k % 2].push(leaf(cx + r0 * Math.cos(ar), cy + r0 * Math.sin(ar), k % 2 ? 13 : 17, a, k % 2 ? 'ra-hp2' : 'ra-hp')); }
  return g({'data-mucha': 'halo', class: 'ra-halo'}, circ(cx, cy, r, 'ra-h0'), rays(cx, cy, inner, r - 8, {n: 56}), circ(cx, cy, r - 9, 'ra-h1'),
    Array.from({length: 60}, (_, k) => { const a = k * PI / 30; return circ(cx + (r - 4.6) * Math.cos(a), cy + (r - 4.6) * Math.sin(a), k % 2 ? 0.9 : 1.6, 'ra-hd'); }),
    g({class: 'ra-hpet'}, pet), circ(cx, cy, inner, 'ra-h2'), circ(cx, cy, inner - 4, 'ra-h3'));
}

/* ── ① 친구에게 — S자로 선 여인 · 아치 둘레 꽃 화환 · 여섯 꽃 메달 ── */
const MX = [58, 332], MY = [236, 356, 476], MR = 34; // 메달 자리(왼쪽 · 오른쪽 기둥 위 · 세 줄 — 꽃잎이 아치 금테 안) · 메달 원 반지름
const FY = 360, FK = 0.85; // 치마 아랫단 줄임 — 허리(360) 아래만 0.85 배(두루마리 띠가 치맛단을 자르지 않게)
const ly = y => (y <= FY ? y : FY + (y - FY) * FK);
const sq = a => a.map((v, i) => (i % 2 ? ly(v) : v));
const Q = (x, y) => [x, ly(y)];
const HC = [188, 140], HH = 56, TILT = -10; // 얼굴 가운데 · 얼굴 높이(이마 ~ 턱) · 고개 기울기(왼쪽으로)
/** 머리 틀 안 점 → 그림 점(고개 기울기만큼 돌림) */
const hp = (u, v) => { const a = TILT * PI / 180; return [HC[0] + u * Math.cos(a) - v * Math.sin(a), HC[1] + u * Math.sin(a) + v * Math.cos(a)]; };
function friend(d) {
  const items = Array.isArray(d?.items) && d.items.length === 6 ? d.items : FRIEND;
  const n = Number.isFinite(d?.n) ? d.n : null;
  const svg = root('ra-friend', '친구에게 건네는 여섯 가지 · 아치 둘레 꽃 메달을 누르면 그 길');
  const {arch, mosaic} = frame();
  const pastel = g({'data-mucha': 'pastel', class: 'ra-pastel'}, path(archD(0), 'ra-field'), circ(196, 150, 128, 'ra-glow'),
    path('M20 612C60 552 128 528 195 526C262 528 330 552 370 612Z', 'ra-ground'));
  const panel = g({'data-mucha': 'panel', class: 'ra-panel'}, [15, 375].map(x => s('line', {x1: x, y1: 180, x2: x, y2: 606, class: 'ra-pil'})));
  const hal = halo(196, 150, 110, 64);
  // 화환 — 아치 안쪽 둘레(왼 기둥 → 아치 꼭대기 → 오른 기둥) · 잎과 작은 꽃
  const gp = [];
  for (let y = 596; y > 176; y -= 6) gp.push([55 + 3.2 * Math.sin(y / 17), y]);
  for (let k = 0; k <= 60; k++) { const a = PI + PI * k / 60; gp.push([195 + 140 * Math.cos(a), 176 + 142 * Math.sin(a)]); }
  for (let y = 176; y <= 596; y += 6) gp.push([335 - 3.2 * Math.sin(y / 17), y]);
  const gl = [], gf = [];
  gp.forEach(([x, y], i) => { if (i % 3) return; const q = gp[Math.min(gp.length - 1, i + 1)], o = gp[Math.max(0, i - 1)], ang = Math.atan2(q[1] - o[1], q[0] - o[0]) * 180 / PI;
    gl.push(leaf(x, y, 13, ang + (i % 6 ? 40 : -40), 'w-leaf ra-gleaf')); });
  [[55, 296], [55, 416], [55, 540], [335, 296], [335, 416], [335, 540]].forEach(([x, y], i) => gf.push(flower(x, y, 11, ['rose', 'apri', 'gold'][i % 3], 5, -90 + i * 20)));
  for (let k = 1; k <= 7; k++) { const a = PI + PI * k / 8; gf.push(flower(195 + 140 * Math.cos(a), 176 + 142 * Math.sin(a), k === 4 ? 13 : 9.5, ['apri', 'rose', 'gold', 'apri', 'gold', 'rose', 'apri'][k - 1], 5, k * 25)); }
  const garland = g({'data-mucha': 'vine', class: 'ra-vine'}, path('M' + gp.map(([x, y]) => P(x, y)).join('L'), 'ra-rope'), path('M' + gp.map(([x, y], i) => P(x + 2.6 * Math.sin(i / 2.2), y + 2.6 * Math.cos(i / 2.2))).join('L'), 'ra-twine'), gl, g({class: 'ra-gfl'}, gf));
  // 별과 달 — 화환 바깥 아치 모서리
  const sky = g({'data-mucha': 'stars', class: 'ra-stars'}, moon(62, 92, 9), star(92, 62, 5.5), star(330, 96, 6.5), star(300, 58, 4.2), circ(108, 46, 1.8, 'ra-sdot'), circ(286, 44, 1.8, 'ra-sdot'), circ(44, 130, 1.8, 'ra-sdot'), circ(348, 140, 1.8, 'ra-sdot'));

  // 머리 — 가는 올 다발 셋이 정수리에서 후광 안쪽 둘레를 따라 어깨 · 등 뒤로 흘러내려 끝이 말림(끝 몇 올은 후광 테 밖) + 머리 덩이(부품 hair · 고개와 같이 기울임)
  const back = g({'data-mucha': 'whiplash', class: 'ra-whiplash'},
    tress([[192, 108], [222, 98], [252, 110], [272, 136], [282, 168], [292, 200], [308, 228], [316, 258]], {n: 17, spread: 18, w0: 2.8, curl: 0.75, seed: 5, core: 8, sway: 'ra-sway ra-o-l'}),
    tress([[200, 122], [230, 140], [250, 172], [258, 206], [272, 236], [288, 262], [296, 288]], {n: 13, spread: 14, w0: 2.6, curl: 0.65, seed: 9, core: 8, sway: 'ra-sway2 ra-o-l'}),
    tress([[182, 106], [154, 96], [128, 104], [110, 126], [100, 154], [100, 184], [92, 214]], {n: 16, spread: 17, w0: 2.6, curl: 0.75, seed: 13, core: 8, sway: 'ra-sway ra-o-r'}),
    g({transform: `rotate(${TILT} ${HC[0]} ${HC[1]})`}, hair({cx: HC[0], cy: HC[1], h: HH, dir: 1, tone: 1, len: 1.6, seed: 4, view: 'three'})));
  // 몸 — 긴 옷(목 · 손목 · 발목까지) · 겉옷 자락 · 소매 · 손(치마 아랫단은 ly 로 조금 올림)
  const L = sq([188, 186, 180, 192, 174, 196, 170, 204, 166, 220, 168, 238, 170, 252, 172, 268, 182, 282, 186, 298, 188, 314, 178, 330, 176, 350, 172, 392, 176, 432, 170, 476, 164, 516, 150, 548, 128, 578]);
  const HEM = sq([128, 578, 146, 590, 164, 580, 182, 588, 198, 595, 212, 584, 228, 590, 244, 597, 258, 586, 270, 584]);
  const R = sq([270, 584, 254, 558, 240, 528, 236, 494, 232, 456, 242, 410, 248, 380, 250, 360, 248, 342, 242, 328, 234, 312, 218, 304, 214, 296, 214, 284, 226, 268, 230, 252, 234, 236, 234, 218, 236, 208, 228, 198, 216, 192, 210, 186]);
  const dress = path(closed(L, HEM, R), 'w-dress');
  const Rd = rev(R);
  // 치마 주름 — 허리에서 휘며 흘러내림(곧은 세로줄 아님) · 위는 가늘고 아래로 갈수록 굵음
  const folds = [[204, 362, 192, 420, 210, 488, 186, 588], [222, 356, 234, 418, 216, 492, 232, 590], [190, 372, 176, 436, 188, 506, 162, 582], [236, 384, 248, 446, 232, 508, 252, 586]]
    .map(a => path(taper(pts(sq(a)), 0.4, 2.1, 0.5), 'w-foldf'));
  const bodice = [[178, 236, 188, 246, 200, 254, 212, 258], [180, 262, 188, 270, 198, 276, 208, 278]].map(a => path(taper(pts(a), 1.5, 0.3, 0.3), 'w-foldf'));
  const hemDots = Array.from({length: 13}, (_, k) => { const p = pts(HEM, 8), q = p[Math.round(k * (p.length - 1) / 12)]; return circ(q[0], q[1] - 6, 1.6, 'w-gdot'); });
  // 겉옷 — 오른 어깨에서 왼 골반으로 가슴을 비스듬히 감고, 오른손에 모였다가 치마를 비스듬히 가로질러 왼 발끝에서 휘감김
  const SA = [226, 204, 226, 226, 214, 252, 198, 274, 190, 286, 182, 300, 176, 320];
  const SB = [176, 346, 186, 330, 194, 316, 204, 302, 222, 278, 238, 248, 240, 214];
  const sash = path('M' + P(226, 204) + dC(SA) + 'L176 346' + dC(SB) + 'Z', 'w-mantle');
  const CA = sq([238, 338, 220, 370, 202, 404, 192, 440, 182, 478, 166, 516, 152, 546, 144, 562, 132, 574, 118, 580]);
  const CB = sq([118, 580, 136, 588, 152, 586, 164, 576, 182, 546, 198, 506, 212, 468, 226, 430, 244, 396, 252, 350]);
  const CBr = rev(CB);
  const cascade = path(closed(CA, CB), 'w-mantle');
  // 분홍 자락 주름 넷 — 서로 다른 자리에서 시작해 휘며 흐르고(나란한 곧은 줄무늬 아님) 아래로 갈수록 굵음
  const cfold = [[0.2, 0.04, 0.62, 0], [0.44, 0.16, 0.97, 1.7], [0.67, 0.02, 0.8, 3.1], [0.86, 0.36, 1, 4.4]].map(([t, a, b, ph]) => {
    const q = pts(mix(CA, CBr, t), 12), i0 = Math.round(a * (q.length - 1)), i1 = Math.round(b * (q.length - 1)), m = Math.max(1, i1 - i0);
    return path(taper(q.slice(i0, i1 + 1).map(([x, y], j) => [x + 4.6 * Math.sin(j / m * 2 * PI * (0.6 + 0.15 * ph) + ph), y]), 0.4, 2.4, 0.8), 'w-mfoldf');
  });
  const DA = sq([248, 346, 260, 390, 264, 430, 258, 470, 254, 506, 262, 540, 284, 566]);
  const DB = sq([290, 566, 270, 540, 264, 506, 268, 470, 272, 430, 268, 390, 256, 346]);
  const drape = path('M' + P(248, 346) + dC(DA) + 'L' + P(290, ly(566)) + dC(DB) + 'Z', 'w-mantle2');
  // 발끝 자락 말림(옷이라 움직이지 않음)
  const swirl = [path(whip(Q(126, 578), Q(98, 596), Q(74, 584), Q(84, 558), 9, 1, 13, 0.8, 1.15), 'w-mantle'), path(whip(Q(150, 586), Q(130, 602), Q(106, 602), Q(104, 586), 5, 1, 7, 0.6, 1.1), 'w-mantle2'),
    path(whip(Q(284, 566), Q(306, 592), Q(332, 588), Q(326, 562), 8, -1, 11, 0.7, 1.15), 'w-mantle2'), path(whip(Q(258, 588), Q(276, 602), Q(298, 602), Q(300, 588), 5, -1, 6, 0.6, 1.1), 'w-mantle')];
  // 소매 — 들어 올린 팔(왼쪽)은 크게 늘어진 종 모양 소매 · 내린 팔(오른쪽)은 엉덩이에서 겉옷을 쥠
  const SL = [146, 114, 134, 128, 120, 146, 112, 168, 106, 196, 108, 232, 116, 262, 122, 284, 130, 300, 140, 306, 150, 296, 158, 280, 164, 262, 168, 248, 172, 236, 174, 224, 176, 214, 178, 204, 180, 196, 166, 188, 148, 176, 136, 164, 144, 152, 154, 140, 162, 128];
  const SR = [222, 196, 240, 196, 256, 206, 262, 224, 268, 242, 268, 258, 270, 276, 272, 298, 278, 322, 277, 346, 277, 364, 272, 376, 263, 378, 256, 372, 252, 360, 250, 346, 248, 338, 247, 332, 246, 326, 246, 306, 248, 288, 248, 270, 246, 256, 240, 244, 232, 236];
  const sleeveL = path(closed(SL), 'w-sleeve'), sleeveR = path(closed(SR), 'w-sleeve');
  const sfold = [[132, 176, 118, 214, 130, 252, 136, 296], [150, 182, 138, 220, 154, 256, 152, 290], [160, 200, 154, 232, 166, 256, 162, 270],
    [256, 236, 266, 276, 260, 320, 270, 368], [252, 260, 260, 300, 254, 340, 262, 370]].map(a => path(taper(pts(a), 0.4, 1.9, 0.5), 'w-foldf'));
  // 손 — 공용 부품(긴 손가락): 머리에 가볍게 댄 손(touch) · 겉옷을 쥔 손(hold)
  const armL = sleeve({x: 148, y: 152, ang: -166, len: 26, w: 22, hand: 'touch', dir: 1, tone: 'ivory'});
  const armR = sleeve({x: 258, y: 290, ang: 22, len: 30, w: 20, hand: 'hold', dir: -1, tone: 'ivory'});
  const fc = face({cx: HC[0], cy: HC[1], h: HH, dir: 1, view: 'three', tilt: TILT, iris: 0});
  const collar = g({}, path('M182 180C192 187 206 187 216 179L217 191C207 200 192 200 182 192Z', 'w-collar'), Array.from({length: 8}, (_, k) => circ(184.5 + k * 4.4, 194.6 + Math.sin(k / 7 * PI) * 2.6, 1.3, 'w-pearl')),
    path('M199 199L201.8 204.5L199 211L196.2 204.5Z', 'w-collar'));
  const belt = path('M184 292C196 299 206 299 216 291L216 300C206 307 196 307 184 300Z', 'w-collar');
  // 꽃관 — 머리 위 둥근 줄을 따라 작은 꽃 다섯(고개와 같이 기울임)
  const cw = [[-160, 6.5, 'apri'], [-134, 7.5, 'rose'], [-106, 8.5, 'gold'], [-78, 7.5, 'apri'], [-50, 6.5, 'rose']].map(([a, r, c]) => { const ar = a * PI / 180; return [hp((-0.14 + 0.54 * Math.cos(ar)) * HH, (-0.3 + 0.5 * Math.sin(ar)) * HH), r, c, a]; });
  const crown = g({class: 'ra-crown'}, cw.map(([p, , , a]) => leaf(p[0], p[1], 12, a - 50 + TILT)), cw.map(([p, r, c, a], i) => flower(p[0], p[1], r * 1.5, c, 5, a + i * 20, 'ra-bloom ra-in ra-d' + i)));
  const front = tress([[212, 152], [222, 176], [218, 202], [226, 228], [236, 250], [232, 272]], {n: 9, spread: 7, w0: 2.2, curl: 0.7, seed: 21, core: 6, sway: 'ra-sway2 ra-o-l'});
  // 바깥 선 — 굵게 시작해 가늘게(채운 초승달 꼴)
  const edges = [edge(L.slice(12), 3, 0.5), edge(Rd.slice(12, Rd.length), 3, 0.5), edge(SL.slice(0, 26), 2.8, 0.5), edge(SR.slice(0, 26), 2.8, 0.5),
    edge(CA, 2.6, 0.5), edge(DA, 2.2, 0.5), edge(SA, 2, 0.5)];
  const body = g({'data-body': '1', class: 'w-body'}, dress, folds, bodice, hemDots, sash, cascade, cfold, drape, sleeveR, sleeveL, sfold, edges, armR, fc, collar, belt, front, crown, armL);
  const outline = g({'data-mucha': 'outline', class: 'ra-outline'}, body, swirl);
  // 꽃 메달 여섯 — 화환 위(몸에서 떨어진 아치 둘레) · 읽는 차례 왼 → 오른, 위 → 아래
  const medals = items.map((it, i) => medal(it, MX[i % 2], MY[(i / 2) | 0], i));
  const pw = 214, py = 577, ph = 27;
  const plaque = g({class: 'ra-plaque'}, scroll({x: 195 - pw / 2, y: py, w: pw, h: ph, tone: 'gold'}), text(195, py + ph / 2 + 6.7, (n != null ? n + '곳' : '21곳') + '을 친구와 함께', 'ra-t ra-tb'));
  svg.append(pastel, arch, mosaic, panel, sky, hal, garland, back, outline, g({'data-mucha': 'lettering', class: 'ra-lettering'}, medals, plaque));
  return svg;
}
/** 꽃 메달 — 꽃잎 고리(움직임) · 금테 원 · 이름(한두 줄 · 처음부터 진하게) · 끝이 말린 리본 두 갈래 · 누르는 자리 지름 94 */
function medal(it, x, y, i) {
  const tone = it.c ?? 'apri', words = String(it.t).split(' '), two = words.length > 1 && tw(it.t, 18) > 2 * MR - 8;
  const lines = two ? [words[0], words.slice(1).join(' ')] : [it.t];
  const pet = g({class: 'ra-bloom ra-in ra-d' + i}, Array.from({length: 12}, (_, k) => { const a = k * 30 + 15, ar = a * PI / 180, ex = x + 38.5 * Math.cos(ar), ey = y + 38.5 * Math.sin(ar);
    return s('ellipse', {cx: f1(ex), cy: f1(ey), rx: 7.6, ry: 6.2, transform: `rotate(${f1(a)} ${f1(ex)} ${f1(ey)})`, class: 'w-pet w-p-' + tone}); }),
    Array.from({length: 4}, (_, k) => leaf(x + 32 * Math.cos((k * 90 + 45) * PI / 180), y + 32 * Math.sin((k * 90 + 45) * PI / 180), 14, k * 90 + 45, 'w-leaf')));
  const tails = [-1, 1].map(sx => path(taper(curl(bez([x + sx * 6, y + 30], [x + sx * 9, y + 40], [x + sx * 17, y + 44], [x + sx * 18, y + 52], 14), 3.4, sx < 0 ? 1 : -1, 0.95), 6.4, 1.1), 'ra-rtail'));
  return s('a', {href: it.href, class: 'ra-a', 'aria-label': it.t, 'data-gift': String(i)},
    circ(x, y, 47, 'ra-hit'), tails, pet,
    circ(x, y, MR, 'ra-md ra-md-' + tone), circ(x, y, MR - 4, 'ra-md2'),
    two ? [text(x, y - 3, lines[0], 'ra-t ra-tf ra-tm-' + tone), text(x, y + 18, lines[1], 'ra-t ra-tf ra-tm-' + tone)] : text(x, y + 6.5, lines[0], 'ra-t ra-tf ra-tm-' + tone));
}

/* ── ② 셋의 길 — 아치 안쪽 곡선을 따라 휜 제목 띠 · 메달 여인 v=7 · 굵은 머리 다발이 메달 테를 넘어 S 로 양옆 세로 판 덩굴까지 ·
      메달 밑을 감싸는 부제 띠 · 아래 굵고 위 가는 큰 S 줄기 · 줄기에서 돋은 잎사귀 패 여덟(줄기 쪽 넓고 끝이 둥글게 뾰족 · 가는 금 테) · 아래 꽃 모자이크 띠 ── */
const AC = [195, 176]; // 아치 가운데(archD 와 같은 타원의 가운데)
const arcPts = (a0, a1, rx, ry, n = 14) => Array.from({length: n + 1}, (_, i) => { const a = (a0 + (a1 - a0) * i / n) * PI / 180; return [AC[0] + rx * Math.cos(a), AC[1] + ry * Math.sin(a)]; });
/** 띠 위에 새긴 글 — 띠 가운데 선(부품 ribbon 의 data-path)을 따라 휨 · 흰 테 없음 */
const onRibbon = (rb, t, cls) => s('text', {class: cls, 'text-anchor': 'middle', 'dominant-baseline': 'central'}, s('textPath', {href: '#' + rb.getAttribute('data-path'), startOffset: '50%', text: t}));
function roads(d) {
  const rows = ORDER.map(k => d?.rows?.find(r => r.g === k) ?? {g: k, name: SHORT[k], head: HEAD[k], n: null});
  const total = Number.isFinite(d?.total) ? d.total : null;
  const svg = root('ra-roads', '셋의 길 · 옛 기능 ' + (total != null ? total + '가지' : NEED) + ' · 여덟 갈래 · 이름표를 누르면 그 길');
  const {arch, mosaic} = frame();
  const cx = 195, cy = 164, R = 72;
  const pastel = g({'data-mucha': 'pastel', class: 'ra-pastel'}, path(archD(0), 'ra-field'), circ(cx, cy, 114, 'ra-glow'), rays(cx, cy, R + 6, 128, {n: 44}));
  const med = medallion({cx, cy, r: R, v: 7, ring: 'petal'});
  // 가슴 분홍 덩어리 → 오른 어깨에 걸친 크림 겉옷(어깨 선 · 비스듬한 앞섶 · 아래로 모이는 주름 셋 · 금 브로치) — 메달 원 안에서만(머리 다발 · 얼굴 · 옷깃을 덮지 않음)
  const clip = s('clipPath', {id: 'ra-mclip'}, circ(cx, cy, R - 1.4));
  const fold = (a, w0, w1) => path(taper(bez(...a, 18), w0, w1, 0.3), 'w-mfoldc');
  const mantle = g({'clip-path': 'url(#ra-mclip)', class: 'ra-mantle', 'data-mucha': 'outline'},
    path(`M${P(cx + 68, cy + 24)}C${P(cx + 52, cy + 30)} ${P(cx + 36, cy + 31)} ${P(cx + 27, cy + 33)}C${P(cx + 19, cy + 42)} ${P(cx + 10, cy + 56)} ${P(cx - 1, cy + 76)}L${P(cx + 70, cy + 76)}Z`, 'w-mantlec'),
    fold([[cx + 36, cy + 36], [cx + 30, cy + 46], [cx + 22, cy + 58], [cx + 14, cy + 74]], 0.4, 2.2),
    fold([[cx + 46, cy + 38], [cx + 40, cy + 50], [cx + 33, cy + 62], [cx + 28, cy + 76]], 0.4, 2),
    fold([[cx + 56, cy + 40], [cx + 52, cy + 52], [cx + 46, cy + 64], [cx + 43, cy + 76]], 0.3, 1.6),
    path(taper(bez([cx + 27, cy + 33], [cx + 19, cy + 42], [cx + 10, cy + 56], [cx - 1, cy + 76], 20), 0.7, 2.6), 'w-edge'),
    path(taper(bez([cx + 68, cy + 24], [cx + 52, cy + 30], [cx + 36, cy + 31], [cx + 27, cy + 33], 16), 1.6, 0.6), 'w-edge'),
    path(taper(bez([cx + 25, cy + 38], [cx + 18, cy + 47], [cx + 10, cy + 60], [cx + 2, cy + 76], 20), 0.5, 1.4), 'w-mgold'),
    circ(cx + 30, cy + 35, 4.2, 'w-brooch'), circ(cx + 30, cy + 35, 1.9, 'w-brooch2'));
  // 머리 — 관자놀이 머리 덩이에서 나온 굵은 다발(왼쪽 셋 · 오른쪽 둘 — 짝 맞추지 않음)이 얼굴 · 옷 위를 지나지 않고 메달 테를 넘어 S 로 흘러내려 양옆 세로 판 덩굴 끝에서 말림
  //   다발은 메달(후광 판) 뒤 정수리 쪽에서 갈라져 테 바깥을 따라 양옆으로 돌아 내려오다(후광을 감쌈) 아래에서 바깥으로 꺾여 S 를 이룸 — 위로 뻗는 더듬이 · 옆으로 뻗는 다리 없음
  const rim = (a0, a1, rr, n = 6) => Array.from({length: n + 1}, (_, i) => { const a = (a0 + (a1 - a0) * i / n) * PI / 180; return [cx + rr * Math.cos(a), cy + rr * Math.sin(a)]; });
  const tresses = g({'data-mucha': 'whiplash', class: 'ra-whiplash'},
    g({class: 'mk-hair mk-t7 ra-sway ra-o-r'},
      lock([...rim(258, 196, 86, 6), [104, 168], [86, 178], [72, 192]], {w: 6, r: 4.5, dir: -1}),
      lock([...rim(272, 150, 78, 12), [110, 216], [88, 220], [66, 212], [52, 196]], {w: 11, r: 6, dir: 1})),
    g({class: 'mk-hair mk-t7 ra-sway2 ra-o-l'},
      lock([...rim(284, 344, 86, 6), [288, 160], [304, 168], [318, 182]], {w: 5.5, r: 4.5, dir: 1}),
      lock([...rim(268, 380, 78, 12), [284, 206], [304, 216], [326, 214], [344, 202]], {w: 10, r: 6, dir: -1})));
  // 제목 — 아치 안쪽 곡선을 따라 휜 띠에 새김 · 부제 — 메달 밑을 감싸는 띠
  const tRib = ribbon(arcPts(-134, -46, 151, 133), {w: 40, tone: 'gold'});
  const title = onRibbon(tRib, '셋의 길', 'ra-rt');
  const sub = total != null ? '옛 기능 ' + total + '가지 · 여덟 갈래' : '옛 기능 ' + NEED;
  const sRib = ribbon([[62, 247], [124, 267], [195, 274], [266, 267], [328, 247]], {w: 30, tone: 'cream'});
  const subT = onRibbon(sRib, sub, 'ra-rs');
  // 가운데 줄기 — 아래 띠에서 올라 크게 S 로 한 번 휘어(아래는 왼쪽 · 위는 오른쪽) 부제 띠 뒤로 들어감 · 아래 굵고 위 가늚
  const stem = bez([192, 596], [146, 500], [254, 386], [197, 266], 64);
  const sx = y => { for (let i = 1; i < stem.length; i++) if (stem[i][1] <= y) { const a = stem[i - 1], b = stem[i], t = (a[1] - y) / Math.max(0.01, a[1] - b[1]); return a[0] + (b[0] - a[0]) * t; } return 195; };
  const vine = [path(taper(stem, 11, 2.2, 1.2), 'mk-vstem')];
  const tags = [];
  rows.forEach((r, i) => {
    const side = i % 2 ? 1 : -1, yc = (side < 0 ? 317 : 350) + ((i / 2) | 0) * 67, name = r.name ?? NEED, cnt = Number.isFinite(r.n) ? r.n + '가지' : NEED;
    const tone = TONES[i % 3], st = sx(yc + 3), bx = st + side * 9, room = side < 0 ? bx - 46 : 344 - bx;
    const w1 = tw(name, 19), w2 = tw(cnt, 18), L = Math.min(room, leafLen(w1, w2)), tx = bx + side * 16;
    vine.push(path(taper([[st, yc + 7], [(st + bx) / 2, yc + 4], [bx + side * 3, yc + 2.5]], 4.6, 2.4), 'mk-vstem'));
    tags.push(s('a', {href: '#/g/' + r.g, class: 'ra-a', 'aria-label': (r.head ?? name) + ' · ' + cnt, 'data-road': r.g},
      s('rect', {x: f1(side < 0 ? bx - L - 6 : st), y: yc - 32, width: f1(side < 0 ? st - (bx - L - 6) : bx + L + 6 - st), height: 64, rx: 18, class: 'ra-hit'}),
      leafTag(bx, yc, L, side, tone, 16 + Math.max(w1, w2) + 6),
      flower(st, yc + 3, 10.5, BLOOM[tone], 5, -90 + i * 15, 'ra-bloom ra-in ra-d' + i),
      text(tx, yc - 3, name, 'ra-ln', side < 0 ? 'end' : 'start'), text(tx, yc + 19, cnt, 'ra-lc', side < 0 ? 'end' : 'start')));
  });
  // 아래 꽃 모자이크 띠
  const band = [s('rect', {x: 44, y: 584, width: 302, height: 22, rx: 11, class: 'ra-bandbg'}), s('line', {x1: 56, y1: 584, x2: 334, y2: 584, class: 'ra-ml'}), s('line', {x1: 56, y1: 606, x2: 334, y2: 606, class: 'ra-ml'})];
  for (let k = 0; k < 13; k++) { const x = 56 + k * 23.2; band.push(k % 2 ? s('rect', {x: f1(x - 4), y: 591, width: 8, height: 8, rx: 1, class: ['ra-m1', 'ra-m2', 'ra-m3'][k % 3], transform: `rotate(45 ${f1(x)} 595)`}) : flower(x, 595, 9.5, ['apri', 'rose', 'gold', 'leaf'][(k / 2) % 4], 5, -90 + k * 12)); }
  const sky = g({'data-mucha': 'stars', class: 'ra-stars'}, crescent(52, 126, 9), star(68, 96, 4.6), star(334, 122, 5.6), star(318, 96, 4), circ(40, 150, 1.7, 'ra-sdot'), circ(350, 150, 1.7, 'ra-sdot'));
  const panel = g({'data-mucha': 'panel', class: 'ra-panel'}, [[12, 40], [350, 378]].map(([a, b]) => [s('rect', {x: a, y: 196, width: b - a, height: 380, rx: 14, class: 'ra-pnl'}), s('rect', {x: a + 3, y: 199, width: b - a - 6, height: 374, rx: 11, class: 'ra-pnl2'})]));
  svg.append(s('defs', {}, clip), pastel, arch, mosaic, panel, sideVine(1), sideVine(-1), sky, tresses, med, mantle,
    g({'data-mucha': 'vine', class: 'ra-vine'}, vine, g({class: 'ra-fband'}, band)),
    g({'data-mucha': 'lettering', class: 'ra-lettering'}, tRib, title, sRib, subT, tags));
  return svg;
}
/** 초승달 — 바깥 반원과 안쪽 반타원 사이(두 호가 겹쳐 사라지지 않게) */
const crescent = (x, y, r) => path(`M${P(x, y - r)}A${f1(r)} ${f1(r)} 0 1 0 ${P(x, y + r)}A${f1(r * 0.6)} ${f1(r)} 0 0 1 ${P(x, y - r)}Z`, 'ra-moon');
/** 굵은 머리 다발 — 뿌리 굵고 끝 가는 채운 띠(가운데 살짝 부풂) · 속 결 셋(어둡게 둘 · 밝게 하나) · 바깥 가는 윤곽 · 끝은 소용돌이로 말림 */
function lock(p, {w = 12, r = 6, dir = 1, turns = 1.1} = {}) {
  const A = curl(smooth(p, 8), r, dir, turns), n = A.length, bul = w * 0.35;
  const off = o => A.map((q, i) => { const a = A[Math.max(0, i - 1)], b = A[Math.min(n - 1, i + 1)], dx = b[0] - a[0], dy = b[1] - a[1], l = Math.hypot(dx, dy) || 1, t = i / (n - 1); return [q[0] - dy / l * o(t), q[1] + dx / l * o(t)]; });
  const half = t => (w + (0.6 - w) * t + bul * Math.sin(PI * t)) / 2, cut = (a, k) => a.slice(0, Math.max(3, Math.round(a.length * k)));
  return [path(taper(A, w, 0.6, bul), 'mk-hb'),
    path(taper(cut(off(t => -half(t) * 0.4), 0.86), w * 0.2, 0.3), 'mk-hd'),
    path(taper(cut(off(t => half(t) * 0.5), 0.72), w * 0.13, 0.25), 'mk-hd'),
    path(taper(cut(off(t => half(t) * 0.05), 0.66), w * 0.17, 0.25), 'mk-hl'),
    path(taper(off(t => -half(t) + 0.45), 1.3, 0.25), 'mk-hd')];
}
/* 잎사귀 패 — 반폭(t = 밑동 0 → 끝 1): 밑동은 둥글게 넓어지고 가운데는 거의 고르며 끝은 둥글게 뾰족 · 가운데 줄은 끝으로 갈수록 살짝 들림 */
const LH = 28, LIFT = 12;
const lhw = t => t < 0.16 ? LH * Math.pow(Math.sin(t / 0.16 * PI / 2), 0.7) : t < 0.5 ? LH * (1 - 0.06 * (t - 0.16) / 0.34) : LH * 0.94 * Math.pow(Math.max(0, 1 - Math.pow((t - 0.5) / 0.5, 1.7)), 0.85);
const lmid = t => 2 - LIFT * Math.pow(t, 2.2);
/** 글이 들어가는 가장 짧은 잎 — 첫 줄(이름 · yc-20 ~ yc+1)과 둘째 줄(개수 · yc+3 ~ yc+23)이 테 안으로 3 단위 */
function leafLen(w1, w2, lo = 118, hi = 176) {
  for (let L = lo; L <= hi; L += 2) {
    const ok = (u0, u1, a, b) => { for (let u = u0; u <= u1; u += 4) { const t = Math.min(u1, u) / L; if (t >= 1) return false; const m = lmid(t), h = lhw(t); if (m - h > a - 3 || m + h < b + 3) return false; } return true; };
    if (ok(16, 16 + w1 + 3, -20, 1) && ok(16, 16 + w2 + 3, 3, 23)) return L;
  }
  return hi;
}
/** 잎사귀 패 그리기 — (bx, yc) 밑동 · side 쪽으로 L · 테는 가는 금선 · 글 자리에는 줄 없음 · 잎맥과 아래 그늘은 글 끝(u0)부터 잎 끝까지만 */
function leafTag(bx, yc, L, side, tone, u0) {
  const N = 56, T = [], B = [], M = [];
  for (let i = 0; i <= N; i++) { const t = i / N, x = bx + side * t * L, m = yc + lmid(t), h = lhw(t); T.push([x, m - h]); B.push([x, m + h]); M.push([x, m]); }
  const body = 'M' + [...T, ...B.slice().reverse()].map(([x, y]) => P(x, y)).join('L') + 'Z';
  const i0 = Math.min(N - 6, Math.ceil(u0 / L * N)), k = [];
  // 아래 그늘 — 글 끝부터 아래 테 안쪽을 따라 끝으로 가늘게
  const sh = B.slice(i0).map(([x, y]) => [x, y - 0.6]), sh2 = B.slice(i0).map(([x, y], j, a) => [x, y - 0.6 - 4.2 * Math.sin(PI * j / Math.max(1, a.length - 1)) * (1 - j / a.length * 0.4)]);
  k.push(path('M' + [...sh, ...sh2.reverse()].map(([x, y]) => P(x, y)).join('L') + 'Z', 'ra-lsh ra-ls-' + tone));
  // 잎맥 — 가운데 줄(끝으로 가늘게) · 끝 쪽으로 비스듬한 곁맥
  k.push(path(taper(M.slice(i0, N - 1), 1.7, 0.3), 'ra-lvein'));
  for (let j = i0 + 3; j < N - 6; j += 5) { const [x, m] = M[j], h = lhw(j / N); [-1, 1].forEach(v => k.push(path(taper([[x, m], [x + side * h * 0.35, m + v * h * 0.4], [x + side * h * 0.75, m + v * h * 0.62]], 1, 0.2), 'ra-lvein'))); }
  return g({class: 'ra-leafg', 'data-mucha': 'vine'}, path(body, 'ra-leaf ra-lf-' + tone), k, path(body, 'ra-leafo'));
}
/** 세로 판 안 덩굴 — 아래에서 S로 굽이쳐 올라 판 위에서 작게 말림 · 아래 굵고 끝으로 갈수록 더 가늚(판 안에만) · side 1 = 왼쪽 */
function sideVine(side) {
  const X = x => (side > 0 ? x : 390 - x);
  const ch = [26, 570, 30, 520, 22, 470, 26, 420, 30, 370, 22, 320, 26, 270, 30, 226, 28, 196, 40, 182].map((v, i) => (i % 2 ? v : X(v)));
  const p = curl(pts(ch, 16), 6, side > 0 ? 1 : -1, 1.05);
  const lv = [];
  p.forEach(([x, y], i) => { if (i % 5 !== 2 || y > 560 || y < 196) return; const q = p[Math.min(p.length - 1, i + 1)], o = p[Math.max(0, i - 1)], a = Math.atan2(q[1] - o[1], q[0] - o[0]) * 180 / PI;
    lv.push(leaf(x, y, (i / 5) % 3 ? 10 : 12, a + ((i / 5) % 2 < 1 ? 48 : -48))); });
  return g({'data-mucha': 'vine', class: 'ra-svine'}, path(taper(p, 3.4, 0.45), 'mk-vstem'), lv,
    g({class: 'ra-gfl'}, [[26, 520], [26, 400], [26, 290]].map(([x, y], k) => flower(X(x), y, 8.5, ['apri', 'rose', 'gold'][k], 5, -90 + k * 30))));
}
