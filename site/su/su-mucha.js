/* 수르 — 무하 포스터 틀 7판(주문 1636 · 심사 6회 judge-r6.md · r7-brief.md 「M」: 어깨 앞 소시지 머리 → 메달 뒤 가는 가닥 여섯이 기둥 쪽으로 말림 ·
   두 손이 가슴 · 허리에서 줄기를 쥠 · 소매 주름 손목까지 · 꽃밭 키 · 크기 다르게 + 휜 풀줄기 · 제목은 아치 띠 안 글씨 띠 · 잎 테두리 굵기 변하는 금선 ·
   이름마다 덩굴손 · 안쪽 금선이 어깨 · 바닥 귀퉁이에서 소용돌이로 풀림) — 아래는 4판 설명
   쪽의 값 그래프를 그대로 품는 포스터 — 흰 판 · 흰 네모 없이 그래프를 아치 안 바탕 위에 바로 놓음(아치를 끊지 않음)
   공용 부품 2판(su-mucha-kit.js) — 메달 여인 v=0 · 줄 막대는 잎(leafBar · 길이 그대로) · 제목은 아치를 따라 휘는 리본(ribbon · 흰 테 없이 띠 안에 새김)
   메달 = 1.3배(반지름 70 · 줄이 많거나 그래프가 길면 54 까지 줄임 — 그래프는 같은 비율 그대로) · 어깨 옷자락이 원 밖으로 흘러 가운데 금 줄기로 이어짐
   아치 띠 = 가는 금선 두 줄 사이 꽃 · 별 모자이크 · 양옆 덩굴 = 굵게 S 로 감아 기둥과 아치 띠를 타고 제목 리본까지 · 회사 줄 높이마다 꽃 하나
   오름 = 금빛 잎 끝에 핀 꽃 · 내림 = 장밋빛 잎 끝에 닫힌 붉은 봉오리 · 줄기 밑동 양옆에 꽃 덤불 · 밝은 판 두 귀는 남색 대신 살구빛 새벽
   글씨는 처음부터 진하게(그래프의 들어오는 움직임 이름을 뗌) · 움직임은 꽃 · 잎 · 별 · 머리카락에만(transform) · 들어옴 0.5초
   여인의 살 · 머리칼 · 옷 · 리본 · 봉오리는 고정 색(어두운 판에서도 크림 · 파스텔) · 원화를 본뜨지 않고 화풍만 */
import {s, line} from '/su/su-fig.js';
import {taper as kTaper, medallion as kMedallion, vine, rays, leafBar, sleeve} from './su-mucha-kit.js';

export const CSS = '/su/su-mucha.css';

const W = 390, H = 620, CX = W / 2;
const E = 3, BAND = 30, YS = 150;                         // 바깥 테 · 아치 띠(= 양옆 덩굴 띠) 폭 · 아치가 시작하는 줄
const CROWN = 12;                                         // 7판 — 아치 띠가 꼭대기에서 12 더 넓음(띠 42 · 글씨 판 38 · 양옆 기둥은 30 그대로) · 글이 판 테에서 8 넘게 떨어짐
const RXO = CX - E, RYO = YS - E, RXI = RXO - BAND, RYI = RYO - BAND - CROWN, RXM = RXO - BAND / 2, RYM = (RYO + RYI) / 2;
const MOS_Y = 592, MOS_H = 25;                            // 아래 꽃 모자이크 띠(592 ~ 617)
const MTOP = 50, R0 = 54, R1 = 70;                        // 메달 위 끝(넓어진 띠 아래 5 띄움) · 반지름(3판 54 → 1.3배 70)
const WX0 = E + BAND + 4, WX1 = W - E - BAND - 4, WY1 = MOS_Y - 4;
const WIN_W = 330;                                        // 그래프 상자 폭(안쪽 여백은 덩굴 띠에 3px 걸쳐도 됨 — 값은 여백 안쪽)
let MED, WIN, ROWY = null, STEM = null, CTOP = 999;        // 한 장을 그리는 동안의 자리(frame 이 처음에 정함 · 동기 셈) · CTOP = 그래프 윗선(머리 가닥이 그 위에서 멈춤)
function setMed(r) { MED = {x: CX, y: MTOP + r, r}; WIN = {x0: WX0, x1: WX1, y0: MTOP + 2 * r + 12, y1: WY1}; }
setMed(R0);
const TONES = ['hot', 'bloom', 'money', 'calm'], KINDS = ['line', 'bars', 'cols', 'waffle', 'cal', 'split', 'matrix'];
const RING = {hot: 'petal', bloom: 'petal', money: 'mosaic', calm: 'stars'};     // 메달 테 — 틀 주인 색마다
const SCROLL = {hot: 'rose', bloom: 'sage', money: 'gold', calm: 'cream'};       // 두루마리 색(부품 색 · 고정)
const f1 = v => Math.round(v * 10) / 10, f2 = v => Math.round(v * 100) / 100;
const tone0 = t => (TONES.includes(t) ? t : 'calm');
const rad = d => d * Math.PI / 180;
const ell = (cx, cy, rx, ry, deg) => [cx + rx * Math.cos(rad(deg)), cy + ry * Math.sin(rad(deg))];
const poly = pts => pts.map((p, i) => (i ? 'L' : 'M') + f1(p[0]) + ' ' + f1(p[1])).join('');
let UID = 0;
const grp = (name, kids, cls = '') => s('g', {'data-mucha': name, class: ('mu-' + name + ' ' + cls).trim(), 'aria-hidden': 'true'}, kids);

/* ── 다섯 갈래 별 · 초승달 · 꽃 · 잎 ── */
function star5(x, y, r, cls) {
  const pts = Array.from({length: 10}, (_, i) => ell(x, y, i % 2 ? r * 0.42 : r, i % 2 ? r * 0.42 : r, -90 + i * 36));
  return s('path', {d: poly(pts) + 'Z', class: cls});
}
function moon(x, y, r) { // 초승달 — 큰 원에서 옆으로 비킨 원을 뺀 꼴
  const d = r * 0.62, hy = Math.sqrt(r * r - (d / 2) * (d / 2)), x1 = x + d / 2;
  return s('path', {d: `M${f1(x1)} ${f1(y - hy)}A${f1(r)} ${f1(r)} 0 1 0 ${f1(x1)} ${f1(y + hy)}A${f1(r)} ${f1(r)} 0 0 1 ${f1(x1)} ${f1(y - hy)}Z`, class: 'mu-moon'});
}
/** 동그란 꽃잎 다섯 장 — 바깥 g 가 들어옴(0.5초) · 안 g 가 천천히 흔들림(anim 이 있을 때만) */
function flower(x, y, r, k = 0, {anim = true, pet = 'mu-pet', core = 'mu-core'} = {}) {
  return s('g', {transform: `translate(${f1(x)} ${f1(y)})`}, s('g', {class: 'mu-in' + (k % 3)}, s('g', {class: anim ? 'mu-sway mu-sw' + (k % 3) : ''},
    [0, 72, 144, 216, 288].map(a => s('ellipse', {cx: 0, cy: f1(-r * 0.5), rx: f1(r * 0.37), ry: f1(r * 0.52), transform: `rotate(${a + (k % 2) * 36})`, class: pet})),
    s('circle', {cx: 0, cy: 0, r: f1(r * 0.3), class: core}))));
}
const leafD = L => `M0 0C${f1(L * 0.28)} ${f1(-L * 0.42)} ${f1(L * 0.76)} ${f1(-L * 0.4)} ${f1(L)} 0C${f1(L * 0.76)} ${f1(L * 0.4)} ${f1(L * 0.28)} ${f1(L * 0.42)} 0 0Z`;
function leaf(x, y, L, deg, k = -1, cls = 'mu-leaf') {
  const p = s('path', {d: leafD(L), class: cls});
  return s('g', {transform: `translate(${f1(x)} ${f1(y)}) rotate(${f1(deg)})`}, k < 0 ? p : s('g', {class: 'mu-flut mu-fl' + (k % 2)}, p));
}
/** 길 그림(d) 셈 — 다섯 갈래 별 · 둥근 꽃잎 n 장 · 점 · 3차 곡선 점 */
const starD = (x, y, r) => poly(Array.from({length: 10}, (_, i) => ell(x, y, i % 2 ? r * 0.42 : r, i % 2 ? r * 0.42 : r, -90 + i * 36))) + 'Z';
function petD(x, y, r, n = 5, rot = -90, wk = 0.42) {
  let d = '';
  for (let i = 0; i < n; i++) {
    const a = rad(rot + i * 360 / n), c = Math.cos(a), sn = Math.sin(a), w = r * wk, P = (u, v) => f1(x + c * u - sn * v) + ' ' + f1(y + sn * u + c * v);
    d += `M${f1(x)} ${f1(y)}C${P(r * 0.15, w * 1.3)} ${P(r * 0.95, w * 0.95)} ${P(r, 0)}C${P(r * 0.95, -w * 0.95)} ${P(r * 0.15, -w * 1.3)} ${f1(x)} ${f1(y)}Z`;
  }
  return d;
}
const dotD = (x, y, r) => `M${f1(x - r)} ${f1(y)}a${r} ${r} 0 1 0 ${f1(2 * r)} 0a${r} ${r} 0 1 0 ${f1(-2 * r)} 0Z`;
const bez = (p0, c1, c2, p3, n = 14) => Array.from({length: n + 1}, (_, i) => { const t = i / n, u = 1 - t; return [0, 1].map(k => u * u * u * p0[k] + 3 * u * u * t * c1[k] + 3 * u * t * t * c2[k] + t * t * t * p3[k]); });
/** 활짝 핀 꽃(오름 잎 끝) — 꽃받침 잎 둘 · 꽃잎 다섯(겹) · 금 꽃술 · (x, y) = 잎 끝 · sg = 뻗는 쪽 */
function openFlower(x, y, sg, r, k) {
  const c = [x + sg * (r * 0.78 + 1), y];
  return s('g', {class: 'mu-bloom'},
    s('path', {d: `M${f1(x - sg * 1)} ${f1(y)}L${f1(c[0])} ${f1(y)}`, class: 'mu-ostalk'}),
    leaf(c[0] - sg * r * 0.2, y - 1, r * 1.05, sg > 0 ? -150 : -30, -1, 'mu-leaf mu-sep'), leaf(c[0] - sg * r * 0.2, y + 1, r * 1.05, sg > 0 ? 150 : 30, -1, 'mu-leaf mu-sep'),
    s('g', {transform: `translate(${f1(c[0])} ${f1(c[1])})`}, s('g', {class: 'mu-in' + (k % 3)}, s('g', {class: 'mu-sway mu-sw' + (k % 3)},
      s('path', {d: petD(0, 0, r, 5, -90 + (k % 2) * 36, 0.5), class: 'mu-opet'}), s('path', {d: petD(0, 0, r * 0.62, 5, -54 + (k % 2) * 36, 0.46), class: 'mu-opet2'}),
      s('circle', {cx: 0, cy: 0, r: f1(r * 0.27), class: 'mu-ocore'}), s('path', {d: [0, 1, 2, 3, 4].map(i => dotD(...ell(0, 0, r * 0.42, r * 0.42, -90 + i * 72), r * 0.07)).join(''), class: 'mu-ocore'})))));
}
/** 닫힌 붉은 봉오리(내림 잎 끝) — 끝이 뾰족한 물방울 · 꽃잎 접힌 선 · 밑을 감싼 큰 꽃받침 셋(봉오리 반을 넘게 감쌈 · 길이 그대로) · 짧은 꽃자루 */
function closedBud(x, y, sg, L) {
  const P = (u, v) => f1(x + sg * u) + ' ' + f1(y + v), b = 2.5, w = L * 0.4, cw = w * 1.5, cl = L * 0.66;
  return s('g', {class: 'mu-cbudg'},
    s('path', {d: `M${P(-1, 0)}L${P(b + 0.5, 0)}`, class: 'mu-ostalk'}),
    s('path', {d: `M${P(b, 0)}C${P(b + L * 0.08, -w)} ${P(b + L * 0.62, -w * 0.95)} ${P(b + L, 0)}C${P(b + L * 0.62, w * 0.95)} ${P(b + L * 0.08, w)} ${P(b, 0)}Z`, class: 'mu-cbud'}),
    s('path', {d: `M${P(b + L * 0.2, -w * 0.25)}C${P(b + L * 0.45, -w * 0.55)} ${P(b + L * 0.75, -w * 0.4)} ${P(b + L * 0.97, -0.3)}`, class: 'mu-cbudl'}),
    s('path', {d: `M${P(b - 0.6, 0)}C${P(b + L * 0.06, -cw * 1.05)} ${P(b + cl * 0.72, -cw * 0.95)} ${P(b + cl, -w * 0.22)}C${P(b + cl * 0.55, -w * 0.5)} ${P(b + L * 0.16, -w * 0.36)} ${P(b - 0.6, 0)}Z`
      + `M${P(b - 0.6, 0)}C${P(b + L * 0.06, cw * 1.05)} ${P(b + cl * 0.72, cw * 0.95)} ${P(b + cl, w * 0.22)}C${P(b + cl * 0.55, w * 0.5)} ${P(b + L * 0.16, w * 0.36)} ${P(b - 0.6, 0)}Z`
      + `M${P(b - 0.4, 0)}C${P(b + cl * 0.3, -w * 0.3)} ${P(b + cl * 0.62, -w * 0.12)} ${P(b + cl * 0.82, 0)}C${P(b + cl * 0.62, w * 0.12)} ${P(b + cl * 0.3, w * 0.3)} ${P(b - 0.4, 0)}Z`, class: 'mu-leaf mu-sep'}));
}
/** 채찍 곡선 — 3차 곡선 하나로 휘었다가 끝이 안으로 말림(접선이 이어지게 · 말림 반지름 r · dir 1 = 화면에서 시계 방향) */
function whipPts(p0, p1, p2, p3, r, dir, turns = 1.1) {
  const A = bez(p0, p1, p2, p3, 20), q = A[A.length - 2], p = A[A.length - 1];
  let tx = p[0] - q[0], ty = p[1] - q[1]; const l = Math.hypot(tx, ty) || 1; tx /= l; ty /= l;
  const N = dir > 0 ? [-ty, tx] : [ty, -tx], c = [p[0] + N[0] * r, p[1] + N[1] * r], a0 = Math.atan2(p[1] - c[1], p[0] - c[0]), B = [];
  for (let i = 1; i <= 22; i++) { const t = i / 22, a = a0 + dir * t * turns * 2 * Math.PI, rr = r * (1 - 0.78 * t); B.push([c[0] + rr * Math.cos(a), c[1] + rr * Math.sin(a)]); }
  return [...A, ...B];
}
/* ── 1 바탕 · 아치 밖 두 귀(밤하늘) · 메달에서 퍼지는 아주 옅은 빛살 ── */
function pastel(winClip) {
  const sky = `M${E} ${YS}V15Q${E} ${E} 15 ${E}H${W - 15}Q${W - E} ${E} ${W - E} 15V${YS}A${RXO} ${RYO} 0 0 0 ${CX} ${E}A${RXO} ${RYO} 0 0 0 ${E} ${YS}Z`;
  return grp('pastel', [s('rect', {x: E, y: E, width: W - 2 * E, height: H - 2 * E, rx: 14, class: 'mu-bg'}), s('path', {d: sky, class: 'mu-sky'}),
    s('g', {'clip-path': `url(#${winClip})`, class: 'mu-rays'}, rays(MED.x, MED.y, MED.r + 6, 600, {n: 40}))]);
}
function stars() {
  const k = [moon(30, 34, 13), s('circle', {cx: 46, cy: 52, r: 1.6, class: 'mu-sdot'})];
  [[66, 16, 6, 0], [16, 68, 4, 1], [88, 10, 3.4, 2], [W - 30, 32, 8.5, 1], [W - 64, 15, 5.5, 2], [W - 16, 70, 4, 0], [W - 90, 10, 3.2, 1], [W - 42, 54, 3, 2]]
    .forEach(([x, y, r, i]) => k.push(s('g', {transform: `translate(${x} ${y})`}, s('g', {class: 'mu-tw mu-tw' + i}, star5(0, 0, r, 'mu-star')))));
  [[50, 22], [20, 40], [74, 30], [W - 50, 30], [W - 22, 46], [W - 76, 26], [104, 6], [W - 106, 6]].forEach(([x, y]) => k.push(s('circle', {cx: x, cy: y, r: 1.2, class: 'mu-sdot'})));
  return grp('stars', k);
}

/* ── 2 아치 띠 + 양옆 세로 판 ── */
const archPath = (rx, ry, x0, x1, yb) => `M${f1(x0)} ${yb}V${YS}A${f1(rx)} ${f1(ry)} 0 0 1 ${f1(x1)} ${YS}V${yb}`;
function bandArc(rx = RXM, ry = RYM) { // 띠 가운데 타원 — 점 · 길이 셈(왼쪽 180° → 꼭대기 270° → 오른쪽 360°)
  const pts = Array.from({length: 721}, (_, i) => ell(CX, YS, rx, ry, 180 + i / 4));
  const acc = [0]; for (let i = 1; i < pts.length; i++) acc.push(acc[i - 1] + Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]));
  return {pts, acc, L: acc[acc.length - 1]};
}
/** 아치 띠 — 바탕 띠 위 가는 금선 두 줄(바깥 · 안쪽에서 6 들임) · 그 사이 골에 꽃 · 별 · 점 모자이크(제목 리본 자리는 비움) */
function arch(ribbonHalf) {
  const outer = archPath(RXO, RYO, E, W - E, MOS_Y), inner = archPath(RXI, RYI, E + BAND, W - E - BAND, MOS_Y);
  const lo = archPath(RXO - 6, RYO - 6, E + 6, W - E - 6, MOS_Y), li = archPath(RXI + 6, RYI + 6, E + BAND - 6, W - E - BAND + 6, MOS_Y);
  const A = bandArc(), mid = A.L / 2;
  let fl = '', co = '', st = '', dt = '';
  for (let d = 7, i = 0; d < A.L - 4; d += 10.5, i++) {
    if (Math.abs(d - mid) < ribbonHalf + 6) continue;
    const j = A.acc.findIndex(v => v >= d), [x, y] = A.pts[j];
    if (i % 4 === 0) { fl += petD(x, y, 5.6, 4, 135 + j / 4, 0.55); co += dotD(x, y, 1.3); }
    else if (i % 4 === 2) st += starD(x, y, 3.5);
    else dt += dotD(x, y, 1.15);
  }
  // 기둥(아치 아래 곧은 띠)에도 같은 골 · 덩굴 밑에 깔리는 작은 점만
  for (let y = MOS_Y - 8, i = 0; y > YS + 4; y -= 10.5, i++) for (const x of [E + BAND / 2, W - E - BAND / 2]) { if (i % 2) dt += dotD(x, y, 1.05); else st += starD(x, y, 2.6); }
  return grp('arch', [s('path', {d: outer + 'Z' + inner + 'Z', 'fill-rule': 'evenodd', class: 'mu-aband'}),
    s('path', {d: lo + 'Z' + li + 'Z', 'fill-rule': 'evenodd', class: 'mu-ach'}), s('path', {d: lo + li, class: 'mu-aline2'}),
    s('path', {d: fl, class: 'mu-mopet'}), s('path', {d: co, class: 'mu-core'}), s('path', {d: st, class: 'mu-astar'}), s('path', {d: dt, class: 'mu-adot'})]);
}
/** 바깥 테 — 기둥 아래에서 굵게(5) 들어가 아치 꼭대기에서 가늘게(1.4) 빠지는 채운 모양 · 안쪽 테 가늘게 */
function outlines() {
  const half = sg => { const x = sg < 0 ? E + 0.4 : W - E - 0.4, pts = [[x, MOS_Y - 2], [x, (MOS_Y + YS) / 2], [x, YS]];
    for (let a = 6; a <= 90; a += 6) pts.push(ell(CX, YS, RXO - 0.4, RYO - 0.4, sg < 0 ? 180 + a : 360 - a)); return pts; };
  return grp('outline', [kTaper(half(-1), {w0: 5, w1: 1.4, cls: 'mu-aout'}), kTaper(half(1), {w0: 5, w1: 1.4, cls: 'mu-aout'}),
    s('path', {d: archPath(RXI, RYI, E + BAND, W - E - BAND, MOS_Y), class: 'mu-ain'}), volutes()]);
}
/** 7판 — 안쪽 금선이 어깨(아치가 기둥에 닿는 곳)와 바닥 귀퉁이에서 한 번씩 소용돌이로 풀림(뿌리 굵고 끝 가늘게 · 좌우 거울 · 왼쪽 시계 반대 / 오른쪽 시계) */
function volutes() {
  const xi = E + BAND, k = [];
  for (const sg of [-1, 1]) {
    const X = x => sg < 0 ? x : W - x, P0 = p => [X(p[0]), p[1]], a = ell(CX, YS, RXI, RYI, sg < 0 ? 197 : 343);
    k.push(kTaper(whipPts(a, P0([xi + 0.4, YS - 5]), P0([xi + 2.5, YS + 12]), P0([xi + 15, YS + 15]), 6, sg, 1.05), {w0: 2.8, w1: 0.45, cls: 'mu-vol'}));
    k.push(kTaper(whipPts(P0([xi, MOS_Y - 34]), P0([xi + 0.4, MOS_Y - 18]), P0([xi + 3, MOS_Y - 5]), P0([xi + 13, MOS_Y - 7]), 4.2, sg, 1.0), {w0: 2.3, w1: 0.4, cls: 'mu-vol'}));
  }
  return s('g', {class: 'mu-volute', 'data-mucha': 'volute'}, k);
}

/* ── 3 제목 — 아치 띠를 따라 휘는 리본(부품 ribbon · 끝은 접혀 갈라짐) · 글씨는 리본 가운데 선 위에 흰 테 없이 갈색으로 새김 ── */
const textW = (t, fs) => [...String(t)].reduce((a, ch) => a + (/\s/.test(ch) ? 0.3 : /[0-9]/.test(ch) ? 0.6 : /[.,]/.test(ch) ? 0.32 : /[%]/.test(ch) ? 0.88 : /[+−\-]/.test(ch) ? 0.62 : /[·…]/.test(ch) ? 0.5 : /[A-Za-z]/.test(ch) ? 0.62 : 1.02) * fs, 0);
function titleOf(title) {
  const t = String(title ?? '').trim() || '확인 필요';
  const fs = textW(t, 22) <= 250 ? 22 : 20;
  return {t, fs, half: textW(t, fs) / 2 + 18};
}
/** 7판 — 접힌 꼬리 리본 대신 아치 띠 안에 새긴 글씨 띠: 띠 안쪽에 상아 · 파스텔 판이 아치를 따라 휘고(끝은 둥글게 닫힘) ·
 *  가장자리 금선은 가운데 굵고 두 끝으로 가늘게 · 두 끝에 작은 금 소용돌이 · 글씨는 띠 가운데 선(아치 따라 휜 길) 위에 흰 테 없이 새김 */
function lettering(T, tn, id) {
  const A = bandArc(), mid = A.L / 2, sc = SCROLL[tn], j0 = A.acc.findIndex(v => v >= mid - T.half + 6), j1 = A.acc.findIndex(v => v >= mid + T.half - 6);
  const O = (j, k) => ell(CX, YS, RXM + k * (BAND / 2), RYM + k * ((RYO - RYI) / 2), 180 + j / 4); // k = -1 안쪽 테 · 0 가운데 · 1 바깥 테
  const out = [], inn = [];
  for (let j = j0; j <= j1; j += 2) { out.push(O(j, 0.9)); inn.push(O(j, -0.9)); }
  const cap = (j, side) => { const c = O(j, 0), a = O(j, 0.9), b = O(j, -0.9), rr = Math.hypot(a[0] - b[0], a[1] - b[1]) / 2, th = Math.atan2(a[1] - c[1], a[0] - c[0]), q = [];
    for (let i = 1; i < 12; i++) { const t = th + side * Math.PI * i / 12; q.push([c[0] + rr * Math.cos(t), c[1] + rr * Math.sin(t)]); } return q; };
  const strip = poly([...out, ...cap(j1, 1), ...inn.slice().reverse(), ...cap(j0, 1)]) + 'Z';
  // 가장자리 금선 — 가운데에서 두 끝으로(굵게 → 가늘게) · 두 끝에서 안으로 말림
  const half = (k, from, to) => { const a = []; for (let j = from; from < to ? j <= to : j >= to; j += from < to ? 3 : -3) a.push(O(j, k)); return a; };
  const jm = Math.round((j0 + j1) / 2), edges = [];
  for (const k of [0.9, -0.9]) for (const [a, b] of [[jm, j0], [jm, j1]]) edges.push(kTaper(half(k, a, b), {w0: 1.7, w1: 0.5, cls: 'mu-tedge'}));
  const curls = [[j0, -1], [j1, 1]].map(([j, sg]) => { const c = O(j, 0), p = O(j - sg * 10, 0);
    return kTaper(whipPts(p, [p[0] + (c[0] - p[0]) * 0.4, p[1] + (c[1] - p[1]) * 0.4 - 1], [c[0], c[1]], [c[0] + (c[0] - p[0]) * 0.25, c[1] + (c[1] - p[1]) * 0.25 + 1.5], 3.2, -sg, 1.0), {w0: 1.8, w1: 0.35, cls: 'mu-tedge'}); });
  const pid = 'mu-tp-' + id, tp = poly(Array.from({length: 181}, (_, i) => O(i * 4, -0.09))); // 한글 먹이 글자 칸 가운데보다 조금 위에 앉으므로 길을 1.7 안쪽으로(위 · 아래 여백 같게)
  return grp('lettering', [s('path', {d: strip, class: 'mk-pq-' + sc + ' mu-tstrip'}), edges, curls, s('path', {id: pid, d: tp, class: 'mu-tpath'}),
    s('text', {class: 'mu-title' + (T.fs < 22 ? ' mu-title-s' : ''), 'data-sc': sc, 'dominant-baseline': 'central'}, s('textPath', {href: '#' + pid, startOffset: '50%', 'text-anchor': 'middle', text: T.t}))], 'mu-scroll');
}

/* ── 4 메달 — 부품 여인 v=0(반측면 · 장미 관 · 복숭아 옷 · 머리가 얼굴 옆으로 흘러 테 아래로 넘침) ── */
/** 옷자락 — 메달 안 어깨 옷(v=0 복숭아)이 아래 테를 덮고 원 밖으로 흘러내림
 *  toStem = 가운데 금 줄기 꼭대기(tipY)로 좁아져 이어짐 · 아니면 테 아래에서 물결 단으로 멈춤(그래프 위 12 안) */
function drape(tipY, toStem) {
  const {x, y, r} = MED, A = (deg, k = 1) => ell(x, y, r * k, r * k, deg);
  const pL = A(146), pR = A(34), iL = A(146, 0.84), iR = A(34, 0.84), ri = f1(0.84 * r);
  const top = `L${f1(iR[0])} ${f1(iR[1])}A${ri} ${ri} 0 0 1 ${f1(iL[0])} ${f1(iL[1])}Z`;
  let eL, eR, hem = [], folds;
  if (toStem) {
    // 허리까지 오는 웃옷(연두) — 어깨에서 허리로 잘록해지고 허리 끝은 둥근 단(두 손 · 소매가 앞을 덮음 · 줄기에 꽂히는 뾰족 끝 없음)
    const wx = 0.3 * r;
    eL = bez(pL, [pL[0] + 0.02 * r, pL[1] + 0.3 * r], [x - wx - 0.1 * r, tipY - 0.2 * r], [x - wx, tipY]);
    eR = bez(pR, [pR[0] - 0.02 * r, pR[1] + 0.3 * r], [x + wx + 0.1 * r, tipY - 0.2 * r], [x + wx, tipY]);
    hem = bez([x - wx, tipY], [x - wx * 0.45, tipY + 6], [x + wx * 0.45, tipY + 6], [x + wx, tipY], 8).slice(1, -1);
    folds = [[A(122, 0.8), [x - 0.34 * r, y + 0.98 * r], [x - 0.22 * r, tipY - 9], [x - 0.17 * r, tipY + 2]], [A(98, 0.82), [x - 0.05 * r, y + 1.02 * r], [x - 0.07 * r, tipY - 10], [x - 0.03 * r, tipY + 4]],
      [A(64, 0.8), [x + 0.28 * r, y + 0.98 * r], [x + 0.2 * r, tipY - 9], [x + 0.16 * r, tipY + 2]]];
  } else {
    const hx = 0.58 * r;
    eL = bez(pL, [pL[0] - 0.1 * r, pL[1] + 0.24 * r], [x - 0.8 * r, tipY - 0.04 * r], [x - hx, tipY - 2]);
    eR = bez(pR, [pR[0] + 0.1 * r, pR[1] + 0.24 * r], [x + 0.8 * r, tipY - 0.04 * r], [x + hx, tipY - 2]);
    hem = bez([x - hx, tipY - 2], [x - hx * 0.45, tipY + 4], [x + hx * 0.45, tipY + 4], [x + hx, tipY - 2], 12).slice(1, -1); // 옷단은 매끈한 한 곡선(호박 같은 물결 셋 지움)
    folds = [[A(120, 0.72), [x - hx / 3 - 2, tipY - 6], [x - hx / 3, tipY - 2]], [A(64, 0.72), [x + hx / 3 + 2, tipY - 6], [x + hx / 3, tipY - 2]]];
  }
  const body = poly([...eL, ...hem, ...eR.slice().reverse()]) + top;
  const inward = pts => pts.map(p => [p[0] + Math.sign(x - p[0]) * Math.min(3.2, Math.abs(x - p[0]) * 0.45), p[1] - (toStem ? 0 : 1.6)]); // 옷 가장자리 안쪽 금 수 선
  // 바깥선은 어깨에서 굵게(2.6) 허리로 가늘게 · 안쪽 주름은 가늘게(굵기가 변하는 윤곽)
  return grp('drape', [s('path', {d: body, class: 'mu-dress'}),
    kTaper(inward(eL.slice(1, -1)), {w0: 1.3, w1: 0.35, cls: 'mu-hemg'}), kTaper(inward(eR.slice(1, -1)), {w0: 1.3, w1: 0.35, cls: 'mu-hemg'}),
    folds.map(p => kTaper(p, {w0: Math.max(0.9, r * 0.018), w1: 0.3, cls: 'mu-dressd'})),
    kTaper(eL, {w0: Math.max(1.8, r * 0.038), w1: 0.6, cls: 'mk-ink'}), kTaper(eR, {w0: Math.max(1.5, r * 0.032), w1: 0.5, cls: 'mk-ink'}),
    hem.length ? kTaper(hem, {w0: 1, w1: 0.5, cls: 'mk-ink2'}) : null], 'mu-drape');
}
function medal(tn) {
  const {x, y, r} = MED;
  const tipY = STEM ? STEM.hy : y + r + 9;
  return s('g', {class: 'mu-medal'}, locks(), kMedallion({cx: x, cy: y, r, v: 0, dir: 1, ring: RING[tn]}), drape(tipY, !!STEM));
}
/** 7판 머리 — 어깨 앞 굵은 두 가닥(소시지)을 지우고, 메달 뒤에서 나온 굵기 다른 가는 가닥 여섯(왼쪽 셋 · 오른쪽 셋)이
 *  S 로 휘며 아치 기둥 쪽으로 흘러내려 끝이 크기 다르게 말림(좌우 비대칭 · 뿌리 굵고 끝 가늘게 · 구리빛 + 금빛 결) · 그래프 윗선(CTOP) 위에서 멈춤 */
function locks() {
  const {x, y, r} = MED, yb = Math.min(CTOP - 12, y + 1.62 * r), k = [];
  // [나오는 각(도) · 바깥 몫 · 아래 몫 · 굵기 · 말림 반지름 · 말림 바퀴] — 왼쪽 셋(길고 굵게) · 오른쪽 셋(짧고 가늘게) · 좌우 비대칭
  // 그래프 쪽(줄기 없음)은 자리가 낮아 가닥 넷이 메달 옆을 따라 짧게 흘러내림(옆으로 뻗지 않게 · 아래로 흐를 높이가 모자라면 그리지 않음)
  // 한 다발로 나와(같은 자리 · 같은 첫 휨) 아래 셋째 몫에서 갈라짐 — 뿌리 가지처럼 따로 뻗지 않게
  const L = STEM ? [[170, 1, 1, 6.2, 8.8, 1.15], [167, 0.74, 0.76, 4, 6, 1.05], [164, 0.5, 0.54, 2.6, 4.2, 0.95]] : [[150, 0.34, 1, 4.2, 5.6, 1.1], [146, 0.2, 0.7, 2.6, 3.8, 1.0]];
  const R = STEM ? [[12, 0.86, 0.6, 5, 7, 1.1], [15, 0.62, 0.88, 3.2, 5.2, 1.0], [18, 0.38, 0.42, 2, 3.6, 0.9]] : [[32, 0.28, 0.8, 3.6, 4.8, 1.05], [36, 0.16, 1, 2.2, 3.4, 0.95]];
  for (const [sg, set] of [[-1, L], [1, R]]) set.forEach(([deg, o, v, w, cr, tu]) => {
    const s0 = ell(x, y, r * 0.86, r * 0.86, deg), room = STEM ? Math.abs(s0[0] - (sg < 0 ? E + BAND + 18 : W - E - BAND - 26)) : r;
    const dx = room * o, dy = (yb - s0[1]) * v, D0 = (yb - s0[1]) * set[0][2], X0 = room * set[0][1];
    if (dy < (STEM ? 12 : 22)) return;
    const pts = whipPts(s0, [s0[0] + sg * X0 * 0.05, s0[1] + D0 * 0.42], [s0[0] + sg * dx * 0.86, s0[1] + dy * 0.4], [s0[0] + sg * dx, s0[1] + dy], cr, sg < 0 ? -1 : 1, tu);
    k.push(kTaper(pts, {w0: w + 1.3, w1: 0.5, cls: 'mk-hd'}), kTaper(pts, {w0: w, w1: 0.3, cls: 'mk-hb'}),
      kTaper(pts.slice(3, Math.round(pts.length * 0.6)).map(([a, b]) => [a - sg * w * 0.14, b - w * 0.08]), {w0: w * 0.24, w1: 0.12, cls: 'mk-hy'}));
  });
  return grp('whiplash', s('g', {class: 'mk-hair mk-t0'}, s('g', {class: 'mk-sway2'}, k)), 'mu-locks');
}
/** 두 팔 — 어깨에서 손목까지 오는 소매(부품 sleeve · 연두 · 손목에 금 단) · 위 손은 가슴 높이 · 아래 손은 허리 높이에서 줄기를 쥠(서로 떨어져 또렷이) ·
 *  손가락이 줄기 앞을 감싸고 줄기는 두 손 위아래로 보임 · 소매 주름 셋이 어깨에서 손목 금 단까지 휘며 내려옴 */
function arms() {
  if (!STEM) return null;
  const {x, y, r} = MED, w = Math.max(16, r * 0.31), k = [];
  const one = (sg, top, grip) => { // top = 소매 위 끝(어깨) · grip = 쥔 자리(줄기 위)
    const dx = grip[0] - top[0], dy = grip[1] - top[1], D = Math.hypot(dx, dy), ang = -Math.atan2(dx, dy) * 180 / Math.PI, len = D - 0.95 * w;
    const fold = [[-0.2, -0.46, 0.07], [0.18, 0.36, 0.05]].map(([u0, u1, b]) => kTaper([[u0 * w * sg, len * 0.06], [(u0 * 0.6 + u1 * 0.4 + b) * w * sg, len * 0.45], [(u0 * 0.2 + u1 * 0.8 - b) * w * sg, len * 0.82], [u1 * w * sg, len + w * 0.06]], {w0: 0.4, w1: Math.max(1.1, w * 0.075), cls: 'mu-sfold'}));
    return [sleeve({x: f1(top[0]), y: f1(top[1]), ang: f1(ang), len: f1(len), w: f1(w), hand: 'hold', dir: sg, tone: 'sage'}),
      s('g', {transform: `translate(${f1(top[0])} ${f1(top[1])}) rotate(${f1(ang)})`, class: 'mu-sfolds'}, fold)];
  };
  k.push(one(1, ell(x, y, r * 0.9, r * 0.9, 34), [x - 6, STEM.g2]), one(-1, ell(x, y, r * 0.9, r * 0.9, 150), [x + 6, STEM.g1])); // 쥔 자리를 줄기 너머로 — 손바닥이 줄기 앞을 덮고 손가락이 줄기를 감쌈
  return grp('arms', k, 'mu-arms');
}

/* ── 5 양옆 덩굴 — 굵게(8 → 1.8) S 로 감기며 기둥을 타고 올라 아치 띠를 따라 제목 리본 끝까지 · 회사 줄 높이마다 꽃 하나(줄이 없으면 고른 간격) · 틀 안에서 자름 ── */
const VAMP = 6.5, VPER = 116, VX = E + BAND / 2;
const vx = y => VX + VAMP * Math.sin((MOS_Y + 3 - y) / VPER * 2 * Math.PI);   // 왼쪽 기둥 위 덩굴의 x(오른쪽은 W - x)
function sideBands(clip, T) {
  const A = bandArc(), end = A.L / 2 - T.half + 4, left = [];
  for (let y = MOS_Y + 3; y > YS; y -= 10) left.push([vx(y), y]);
  const d0 = MOS_Y + 3 - YS;
  for (let d = 0; d <= end; d += 10) {
    const j = Math.max(0, A.acc.findIndex(v => v >= d)), [x, y] = A.pts[j], th = rad(180 + j / 4), nx = Math.cos(th) / RXM, ny = Math.sin(th) / RYM, nn = Math.hypot(nx, ny) || 1;
    const o = -VAMP * Math.sin((d0 + d) / VPER * 2 * Math.PI);
    left.push([x + nx / nn * o, y + ny / nn * o]);
  }
  const right = left.map(([x, y]) => [W - x, y]);
  const ys = ROWY ?? [560, 486, 412, 338, 264, 196];
  const fl = ys.map((y, i) => { const sg = i % 2 ? 1 : -1, x = sg < 0 ? vx(y) : W - vx(y);
    return s('g', {}, leaf(x, y + 1, 9, sg < 0 ? 25 : 155, i, 'mu-leaf'), leaf(x, y - 1, 8, sg < 0 ? -30 : 210, -1, 'mu-leaf'), flower(x, y, 7.2, i, {anim: true, pet: 'mu-vpet', core: 'mu-core'})); });
  return grp('vine', [s('g', {'clip-path': `url(#${clip})`},
    vine(left, {w0: 8, w1: 1.8, leaves: 17, buds: 5, seed: 11}), vine(right, {w0: 8, w1: 1.8, leaves: 16, buds: 5, seed: 29}), fl)]);
}

/* ── 6 아래 꽃 모자이크 띠 — 다섯 잎 꽃과 마름모 · 점을 번갈아 ── */
function mosaic() {
  const x0 = E, w = W - 2 * E, cy = MOS_Y + MOS_H / 2, n = 14, step = (w - 24) / n, kids = [];
  kids.push(s('rect', {x: x0, y: MOS_Y, width: w, height: MOS_H, rx: 4, class: 'mu-mband'}),
    s('line', {x1: x0, y1: MOS_Y + 2, x2: x0 + w, y2: MOS_Y + 2, class: 'mu-mline'}), s('line', {x1: x0, y1: MOS_Y + MOS_H - 2, x2: x0 + w, y2: MOS_Y + MOS_H - 2, class: 'mu-mline'}));
  for (let i = 0; i <= n; i++) {
    const tx = x0 + 12 + i * step;
    kids.push(i % 2 ? s('rect', {x: f1(tx - 3.4), y: f1(cy - 3.4), width: 6.8, height: 6.8, transform: `rotate(45 ${f1(tx)} ${f1(cy)})`, class: i % 4 === 1 ? 'mu-t0' : 'mu-t2'})
      : flower(tx, cy, 8.4, i / 2, {anim: false, pet: 'mu-mpet', core: 'mu-core'}));
    if (i < n) kids.push(s('circle', {cx: f1(tx + step / 2), cy: f1(cy), r: 1.3, class: 'mu-mdot'}));
  }
  return grp('mosaic', kids);
}

/* ── 그래프 — 흰 판 없이 · 들어오는 움직임 이름을 떼서 글씨가 처음부터 진하게 ── */
const BEAT = /^(a-[a-z]+|b[1-4])$/;
function calmChart(body, vb) {
  for (const e of [body, ...body.querySelectorAll('*')]) {
    const c = e.getAttribute('class'); if (c) { const k = c.split(/\s+/).filter(x => x && !BEAT.test(x)); if (k.length) e.setAttribute('class', k.join(' ')); else e.removeAttribute('class'); }
  }
  for (const r of [...body.querySelectorAll('rect')]) { // 바탕 판(그래프를 거의 다 덮는 네모 · 작은 그림 바탕)
    const w = +r.getAttribute('width'), h = +r.getAttribute('height');
    if ((w >= vb[2] * 0.9 && h >= vb[3] * 0.6) || /\bg-thumbbg\b/.test(r.getAttribute('class') || '')) r.remove();
  }
}
/** 칸 그림(날마다 · 100칸) — 칸 뒤에 금빛 테를 두른 색유리 창(칸 사이가 납 선처럼 보임) */
function glass(body, vb) {
  const cells = [...body.querySelectorAll('rect')].filter(r => /\bg-(ok|no|wait|empty|basefill)\b/.test(r.getAttribute('class') || ''));
  if (cells.length < 9) return null;
  const groups = [[], []];
  for (const c of cells) groups[+c.getAttribute('x') + +c.getAttribute('width') / 2 < vb[2] / 2 ? 0 : 1].push(c);
  const one = groups.every(g => g.length) && Math.abs(groups[0].length - groups[1].length) <= 2 ? groups : [cells];
  return s('g', {class: 'mu-glass'}, one.map(g => {
    const x0 = Math.min(...g.map(c => +c.getAttribute('x'))) - 5, y0 = Math.min(...g.map(c => +c.getAttribute('y'))) - 5;
    const x1 = Math.max(...g.map(c => +c.getAttribute('x') + +c.getAttribute('width'))) + 5, y1 = Math.max(...g.map(c => +c.getAttribute('y') + +c.getAttribute('height'))) + 5, R = Math.min(22, (x1 - x0) / 2);
    return s('path', {d: `M${f1(x0)} ${f1(y1)}V${f1(y0 + R)}A${R} ${R} 0 0 1 ${f1(x0 + R)} ${f1(y0)}H${f1(x1 - R)}A${R} ${R} 0 0 1 ${f1(x1)} ${f1(y0 + R)}V${f1(y1)}Z`, class: 'mu-lead'});
  }));
}
/** 같은 줄에서 서로 겹치는 이름표(예: 해마다 「고른 적 없음」 둘)는 띄어쓰기 자리에서 두 줄로 — 글씨는 줄이지 않음 */
function unclash(body) {
  const ts = [...body.querySelectorAll('text')].filter(t => t.getAttribute('text-anchor') === 'middle' && /\s/.test(t.textContent.trim()) && !t.querySelector('tspan'));
  const box = t => { const w = textW(t.textContent.trim(), 21); return [+t.getAttribute('x') - w / 2, +t.getAttribute('x') + w / 2, +t.getAttribute('y')]; };
  for (const a of ts) {
    const A = box(a);
    if (!ts.some(b => b !== a && Math.abs(box(b)[2] - A[2]) < 4 && box(b)[0] < A[1] && A[0] < box(b)[1])) continue;
    const ws = a.textContent.trim().split(/\s+/), h = Math.ceil(ws.length / 2), x = a.getAttribute('x');
    a.textContent = '';
    a.append(s('tspan', {x, dy: '-1.05em', text: ws.slice(0, h).join(' ')}), s('tspan', {x, dy: '1.05em', text: ws.slice(h).join(' ')}));
  }
}
function chartWin(src, kd) {
  setMed(R0);
  const vb = viewOf(src), k = Math.min(WIN_W / vb[2], (WIN.y1 - WIN.y0) / vb[3]), wh = vb[3] * k;
  setMed(Math.max(R0, Math.min(R1, Math.floor((WY1 - MTOP - 12 - wh) / 2)))); // 그래프 비율 k 는 그대로 · 남는 높이만큼 메달을 키움(1.3배까지)
  const ww = vb[2] * k, wx = (W - ww) / 2, wy = WIN.y0 + (WIN.y1 - WIN.y0 - wh) / 2;
  CTOP = wy;
  const g = s('g', {class: 'mu-chart mu-k-' + kd, transform: `translate(${f1(wx)} ${f1(wy)}) scale(${+k.toFixed(5)})` + (vb[0] || vb[1] ? ` translate(${-vb[0]} ${-vb[1]})` : ''), 'data-k': +k.toFixed(5)});
  const body = src.cloneNode(true); // 그래프를 복사해 담음(모양 · 값 · 차례 그대로 · 원본은 건드리지 않음)
  calmChart(body, vb);
  unclash(body);
  const lead = kd === 'cal' || kd === 'waffle' ? glass(body, vb) : null;
  if (lead) g.append(lead);
  while (body.firstChild) g.append(body.firstChild);
  return g;
}

/* ── 막대 — 금 줄기에서 돋은 잎(부품 leafBar · 밑동 넓고 끝 뾰족) · 원래 너비 × 한 배수(같은 값 → 같은 길이) · 같은 차례 · 같은 개수 · 끝마다 값 그대로 ── */
function barRows(src) {
  const axis = src.querySelector('line.g-axis'), rows = [];
  for (const el of src.children) {
    if (el.localName !== 'g' && el.localName !== 'a') continue;
    const g = el.localName === 'a' ? el.querySelector('g') : el; if (!g) continue;
    const kids = [...g.children], cl = e => e.getAttribute('class') || '';
    const bar = kids.find(e => e.localName === 'rect' && !/\bg-base\b/.test(cl(e))), ts = kids.filter(e => e.localName === 'text');
    if (!bar || !ts.length) continue;
    const nm = ts.find(t => /\bg-ts\b/.test(cl(t))) ?? ts[0], vl = ts.find(t => /\bg-tk\b/.test(cl(t))) ?? (ts.length > 1 ? ts[ts.length - 1] : null);
    rows.push({name: (nm.textContent ?? '').trim(), val: (vl?.textContent ?? '').trim(), x: +bar.getAttribute('x'), w: +bar.getAttribute('width'), cls: cl(bar),
      on: /\bg-on\b/.test(cl(nm)) || /\bg-baron\b/.test(cl(bar)), href: el.localName === 'a' ? el.getAttribute('href') : null});
  }
  if (!rows.length || rows.some(r => !Number.isFinite(r.x) || !Number.isFinite(r.w))) return null;
  return {rows, x0: axis ? +axis.getAttribute('x1') : Math.min(...rows.map(r => r.x)), signed: !!axis};
}
/** 값 글 — 원래 글의 숫자 그대로 · 오름은 「+」 · 내림은 「−」 · 단위가 없는 오르내림 막대는 「%」(업종 한 달 움직임 = 목록의 「한 달 +31.9%」와 같은 값) */
function valOf(v, signed) {
  const m = /^\s*([+\-−–]?)\s*([0-9][0-9,]*(?:\.[0-9]+)?)\s*(.*)$/.exec(v ?? '');
  if (!m) return {t: v || '?', n: NaN};
  const n = parseFloat(m[2].replace(/,/g, '')) * (/[\-−–]/.test(m[1]) ? -1 : 1), u = m[3] || (signed ? '%' : '');
  return {t: (n > 0 && signed ? '+' : n < 0 ? '−' : '') + m[2] + u, n};
}
function fitName(t, fs0, room, rh) {
  for (const fs of [fs0, 19, 18]) if (textW(t, fs) <= room) return {ls: [t], fs};
  const ch = [...t], fs = 18;
  if (rh >= 40) { let i = ch.length - 1; while (i > 1 && textW(ch.slice(0, i).join(''), fs) > room) i--; const a = ch.slice(0, i).join(''), b = ch.slice(i).join(''); if (textW(b, fs) <= room) return {ls: [a, b], fs}; }
  let i = ch.length; while (i > 1 && textW(ch.slice(0, i).join('') + '…', fs) > room) i--;
  return {ls: [ch.slice(0, i).join('') + '…'], fs};
}
/** 아래 꽃밭 — 폭 전체 · 한 뿌리(가운데 줄기 밑동에서 굵게 나와 양옆 덩굴 기둥 밑동까지 가늘게 이어지는 뿌리줄기) 위에
 *  7판: 키 · 크기가 저마다 다른 꽃 · 봉오리와 휜 풀줄기(뿌리 굵고 끝 가늘게 · 끝이 숙음)를 섞음 · 좌우 다르게 */
const BED = {'-1': [[0.27, 'f', 1.3, 1.15], [0.39, 'g', 1.35, -1], [0.5, 'b', 0.78, 0.9], [0.61, 'f', 0.7, 0.8], [0.72, 'g', 0.95, 1]],
  '1': [[0.29, 'g', 1.05, 1], [0.38, 'f', 0.86, 0.92], [0.52, 'f', 1.5, 1.05], [0.63, 'g', 1.25, -1], [0.73, 'b', 1.15, 0.86]]};
function bed(x, yb, hgt) {
  const k = Math.min(1, hgt / 34), kids = [], y0 = yb - 3, xl = E + BAND / 2 + 1;
  for (const sg of [-1, 1]) {
    const X = u => sg < 0 ? x - u * (x - xl) : x + u * (x - xl);
    kids.push(kTaper([[x, y0 + 1], [X(0.2), y0 - 3], [X(0.45), y0 + 0.5], [X(0.7), y0 - 2.5], [X(0.9), y0 + 1], [X(1), y0 + 5]], {w0: 5.5, w1: 2.6, cls: 'mu-root'}));
    BED[sg].forEach(([u, kind, hk, sk], i) => {
      const cx = X(u), cy = y0 - (i % 2 ? 1.5 : 0), H = 21 * k * hk;
      if (kind === 'g') { // 휜 풀줄기 셋 — 길이 다르게 · 둘은 한쪽으로 하나는 반대로 휘어 끝이 숙음
        [[1, 1], [-1, 0.72], [1, 0.5]].forEach(([dd, lk], j) => { const d = dd * sg * sk, len = H * 1.3 * lk, bx = cx + (j - 1) * 2.2;
          kids.push(kTaper(bez([bx, cy + 1], [bx + d * len * 0.04, cy - len * 0.62], [bx + d * len * 0.34, cy - len * 0.98], [bx + d * len * 0.64, cy - len * 0.74], 12), {w0: 2.5 - j * 0.4, w1: 0.22, cls: 'mu-grass'})); });
        return;
      }
      [[-62, 20], [-30, 24], [30, 22], [62, 18]].forEach(([a, L0], j) => { const L = L0 * k * (0.75 + 0.35 * sk) * (j % 2 ? 1 : 0.86);
        kids.push(s('g', {transform: `translate(${f1(cx)} ${f1(cy)}) rotate(${-90 + a + (i % 2 ? 6 : -4)})`},
          s('path', {d: `M0 0C${f1(L * 0.3)} ${f1(-L * 0.22)} ${f1(L * 0.75)} ${f1(-L * 0.18)} ${f1(L)} 0C${f1(L * 0.75)} ${f1(L * 0.18)} ${f1(L * 0.3)} ${f1(L * 0.22)} 0 0Z`, class: 'mu-leaf mu-bleaf'}),
          s('path', {d: `M1 0L${f1(L * 0.85)} 0`, class: 'mu-lvein'}))); });
      const bend = (i % 2 ? 1 : -1) * sg * 3;
      if (kind === 'f') kids.push(s('path', {d: `M${f1(cx)} ${f1(cy)}Q${f1(cx + bend)} ${f1(cy - H * 0.55)} ${f1(cx + bend * 0.4)} ${f1(cy - H)}`, class: 'mu-ostalk'}), flower(cx + bend * 0.4, cy - H - 2 * sk, 7.4 * k * sk, i + (sg > 0 ? 1 : 0), {anim: true, pet: i % 2 ? 'mu-mpet' : 'mu-vpet', core: 'mu-core'}));
      else kids.push(s('path', {d: `M${f1(cx)} ${f1(cy)}Q${f1(cx + sg * 3)} ${f1(cy - H * 0.6)} ${f1(cx + sg * 2)} ${f1(cy - H)}`, class: 'mu-ostalk'}),
        s('g', {class: 'mu-pbud', transform: `translate(${f1(cx + sg * 2)} ${f1(cy - H)}) rotate(-90)`}, closedBud(0, 0, 1, 11 * k * sk)));
    });
  }
  kids.push(bush(x, yb - 1, hgt * 0.9));
  return s('g', {class: 'mu-bed', 'data-mucha': 'bed'}, kids);
}
/** 줄기 밑동 꽃 덤불 — 양옆으로 부채처럼 퍼진 잎 · 핀 꽃 둘씩 · 봉오리 하나씩(모자이크 띠 바로 위 · 마지막 줄 글 아래) */
function bush(x, yb, hgt) {
  const k = Math.min(1, hgt / 34), kids = [];
  for (const sg of [-1, 1]) {
    [[8, 30], [24, 34], [42, 28], [62, 22], [84, 16]].forEach(([a, L], i) => kids.push(s('g', {transform: `translate(${f1(x + sg * (2 + i * 2))} ${f1(yb - 1)}) rotate(${sg < 0 ? 180 + a : -a})`},
      s('path', {d: `M0 0C${f1(L * k * 0.3)} ${f1(-L * k * 0.2)} ${f1(L * k * 0.75)} ${f1(-L * k * 0.17)} ${f1(L * k)} 0C${f1(L * k * 0.75)} ${f1(L * k * 0.17)} ${f1(L * k * 0.3)} ${f1(L * k * 0.2)} 0 0Z`, class: 'mu-leaf mu-bleaf'}),
      s('path', {d: `M1 0L${f1(L * k * 0.85)} 0`, class: 'mu-lvein'}))));
    kids.push(s('path', {d: `M${f1(x)} ${f1(yb - 2)}Q${f1(x + sg * 10 * k)} ${f1(yb - 22 * k)} ${f1(x + sg * 15 * k)} ${f1(yb - 27 * k)}`, class: 'mu-ostalk'}));
    kids.push(s('g', {class: 'mu-pbud'}, closedBud(x + sg * 15 * k, yb - 27 * k, sg, 11 * k)));
    kids.push(flower(x + sg * 30 * k, yb - 14 * k, 8 * k, sg < 0 ? 0 : 1, {anim: true, pet: 'mu-vpet', core: 'mu-core'}), flower(x + sg * 56 * k, yb - 7 * k, 6.2 * k, sg < 0 ? 2 : 0, {anim: true, pet: 'mu-mpet', core: 'mu-core'}));
  }
  return s('g', {class: 'mu-bush', 'data-mucha': 'bush'}, kids);
}
/** 지금 회사 줄 — 점선 테 대신 작은 꽃 테(둥근 네모 둘레에 꽃 · 금 점) */
function flowerRing(x0, x1, yc, hh, k0) {
  const r = hh, L = 2 * (x1 - x0) + 2 * Math.PI * r, n = Math.max(8, Math.round(L / 12) & ~1), kids = [];
  const at = d => { // 둘레 위 점(위 곧은 줄 → 오른쪽 반원 → 아래 곧은 줄 → 왼쪽 반원)
    const a = x1 - x0, c = Math.PI * r;
    if (d < a) return [x0 + d, yc - r]; d -= a;
    if (d < c) { const t = d / r - Math.PI / 2; return [x1 + r * Math.cos(t), yc + r * Math.sin(t)]; } d -= c;
    if (d < a) return [x1 - d, yc + r]; d -= a;
    const t = d / r + Math.PI / 2; return [x0 + r * Math.cos(t), yc + r * Math.sin(t)];
  };
  for (let i = 0; i < n; i++) { const [x, y] = at(i * L / n); kids.push(i % 2 ? s('circle', {cx: f1(x), cy: f1(y), r: 1.5, class: 'mu-ringdot'}) : flower(x, y, 4.6, k0 + i, {anim: i % 4 === 0, pet: 'mu-rpet', core: 'mu-core'})); }
  return s('g', {class: 'mu-flring'}, kids);
}
/** 7판 잎 테두리 — 잎 막대(부품 leafBar)와 같은 꼴의 가장자리를 밑동 굵게(1.9) · 끝 가늘게(0.4) 금선으로 덧그림(잎이 빛살보다 먼저 보이게 · 길이 그대로) */
function leafEdge(x, y, L, w, sgn) {
  if (!(L > 4)) return null;
  const hw = w / 2, m = Math.min(L * 0.3, w * 1.1), b = hw * 0.75, k = [];
  for (const sy of [-1, 1]) {
    const e = [[0.6, 0], ...bez([0, -b * sy], [m * 0.45, -hw * sy], [m * 0.8, -hw * sy], [m, -hw * sy], 6), ...bez([m, -hw * sy], [m + (L - m) * 0.45, -hw * sy], [L - (L - m) * 0.25, -hw * 0.3 * sy], [L, 0], 14).slice(1)];
    k.push(kTaper(e, {w0: 1.9, w1: 0.4, cls: 'mu-lfo'}));
  }
  return s('g', {transform: `translate(${f1(x)} ${f1(y)})` + (sgn < 0 ? ' scale(-1 1)' : ''), class: 'mu-lfedge'}, k);
}
function barsArt(src) {
  const P = barRows(src); if (!P) return null;
  const {rows, x0, signed} = P, n = rows.length;
  // 메달 1.3배 · 밑동 덤불 자리 — 줄이 많으면 덤불을 빼고 메달을 54 까지 줄임(줄 높이 32 넘게)
  let r = R1, bh = signed ? 34 : 0, rh = 0;
  const hy = () => MED.y + MED.r + 16, topOf = () => signed ? Math.max(WIN.y0 + 6, hy() + 22) : WIN.y0 + 6; // 두 손(줄기를 쥔 자리) 아래에서 줄이 시작
  const fit = () => { setMed(r); rh = Math.min(64, (WIN.y1 - 4 - bh - topOf()) / n); };
  fit(); if (rh < 40 && bh) { bh = 0; fit(); }
  while (rh < 32 && r > R0) { r = Math.max(R0, r - 4); fit(); }
  if (rh < 30) return null; // 너무 많으면 그래프를 같은 비율로 줄여 담는 길로
  const top = topOf(), bot = WIN.y1 - 4 - bh;
  const fs = rh >= 46 ? 21 : rh >= 38 ? 20 : 19, bw = Math.round(Math.max(13, Math.min(19, rh * 0.36))), yA = top + (bot - top - rh * n) / 2;
  const fr = Math.max(6.5, Math.min(8.5, bw * 0.46)), bl = Math.max(12, Math.min(16, bw * 0.85));         // 핀 꽃 반지름 · 닫힌 봉오리 길이
  const ext = Math.max(1.78 * fr + 2, bl + 3.5), onPad = rows.some(r => r.on) ? 11 : 0; // 잎 끝 너머 꽃 · 봉오리가 나가는 길이 · 꽃 테 자리
  const V = rows.map(r => valOf(r.val, signed)), neg = rows.map((r, i) => (signed ? r.x < x0 - 0.5 : /\bg-(no|barneg)\b/.test(r.cls) || V[i].n < 0));
  const mx = (arr) => Math.max(0, ...arr);
  let ax, f, nameRoom;
  if (signed) {
    ax = CX; nameRoom = ax - WIN.x0 - 12;
    const pw = mx(rows.filter((_, i) => !neg[i]).map(r => r.w)), nw = mx(rows.filter((_, i) => neg[i]).map(r => r.w));
    const pl = mx(V.filter((_, i) => !neg[i]).map(v => textW(v.t, fs))), nl = mx(V.filter((_, i) => neg[i]).map(v => textW(v.t, fs)));
    f = Math.min(pw ? (WIN.x1 - ax - 9 - ext - onPad - pl) / pw : 9, nw ? (ax - WIN.x0 - 9 - ext - onPad - nl) / nw : 9, 1.3);
  } else {
    const nmW = Math.min(150, mx(rows.map(r => textW(r.name, fs))));
    ax = WIN.x0 + nmW + 12; nameRoom = nmW;
    f = Math.min((WIN.x1 - ax - 9 - ext - onPad - mx(V.map(v => textW(v.t, fs)))) / Math.max(1, mx(rows.map(r => r.w))), 1.3);
  }
  if (!(f > 0.25)) return null;
  const yEnd = yA + rh * n, kids = [], yb = WIN.y1 + 2;
  ROWY = rows.map((_, i) => yA + rh * (i + 0.5));
  // 금 줄기 — 밑동(모자이크 띠 위) 굵고 위 가늘게 · 꼭대기는 메달 옷자락이 좁아져 이어지는 자리 · 줄 사이마다 작은 잎
  // 줄기 — 굵기 6 → 5(거의 고르게) · 위 끝은 두 손이 쥔 자리 위 작은 봉오리 · 마디마다 작은 잎 하나와 덩굴손 하나(서로 다른 쪽)
  const HY = hy(), sTop = signed ? HY - 34 : yA - 2;
  if (signed) STEM = {x: ax, y: sTop, hy: HY, g1: HY - 20, g2: HY + 6}; // 위 손(가슴) · 아래 손(허리) — 줄기가 두 손 위아래로 보임
  CTOP = yA;
  if (bh) kids.push(bed(ax, yb, Math.min(34, yb - yEnd + 4)));
  kids.push(kTaper([[ax, bh ? yb - 1 : yEnd + 6], [ax + 0.8, (yA + yEnd) / 2 + 30], [ax - 0.7, yA + 40], [ax, sTop]], {w0: 6, w1: 5, cls: 'mu-axis'}));
  for (let i = 1; i < n; i++) {
    const ny = yA + rh * i, sg = i % 2 ? 1 : -1;
    kids.push(leaf(ax, ny, Math.min(12, rh * 0.26), sg > 0 ? -38 : 218, i, 'mu-leaf mu-bleaf'));
  }
  if (signed) kids.push(s('g', {transform: `translate(${f1(ax)} ${f1(sTop + 1)}) rotate(-90)`}, closedBud(0, 0, 1, 10)));
  else kids.push(flower(ax, yA - 8, 6, 2, {anim: true}));
  rows.forEach((r, i) => {
    const yc = ROWY[i], L = Math.max(0, r.w * f), dn = neg[i], v = V[i], eq = !dn && !(v.n > 0) && signed, sgn = signed && dn ? -1 : 1;
    const tone = dn ? 'rose' : eq ? 'sage' : 'gold';
    if (r.on) { const rr = bw / 2 + 7, a = ax - sgn * 4 + sgn * rr, b = ax + sgn * (L + ext + 3) - sgn * rr; kids.push(flowerRing(Math.min(a, b, (a + b) / 2), Math.max(Math.min(a, b), Math.max(a, b)), yc, rr, i)); }
    let bar;
    const tipX = ax + sgn * (1.5 + L);
    if (L >= 1) {
      bar = leafBar({x: f1(ax + sgn * 1.5), y: f1(yc), len: f2(L), dir: sgn > 0 ? 'right' : 'left', w: bw, tone});
      // 오름 = 잎 달린 가지(밑동 쪽 작은 잎 하나) · 끝에 핀 꽃 / 내림 = 끝에 닫힌 붉은 봉오리
      if (!dn && !eq && L > 2 * bw) kids.push(leaf(ax + sgn * (1.5 + L * 0.38), yc - bw * 0.36, bw * 0.62, sgn > 0 ? -42 : 222, -1, 'mu-leaf mu-sep'));
      kids.push(bar, leafEdge(ax + sgn * 1.5, yc, L, bw, sgn));
      kids.push(dn ? closedBud(tipX, yc, sgn, bl) : openFlower(tipX, yc, sgn, fr, i));
    }
    else { bar = s('g', {}, s('circle', {cx: ax, cy: f1(yc), r: 3.2, class: 'mu-zero'})); kids.push(bar); }
    for (const [k, val] of [['data-bar', ''], ['data-name', r.name], ['data-val', v.t], ['data-len', f2(L)]]) bar.setAttribute(k, val);
    const vx = ax + sgn * (1.5 + L + ext + 4 + (r.on ? onPad : 0));
    kids.push(s('text', {x: f1(vx), y: f1(yc + fs * 0.36), 'text-anchor': sgn < 0 ? 'end' : 'start', class: 'mu-val ' + (dn ? 'mu-vdn' : eq ? 'mu-veq' : 'mu-vup'), text: v.t}));
    const nf = fitName(r.name, fs, nameRoom, rh), nx = signed ? (dn ? ax + 11 : ax - 11) : ax - 11, anc = signed && dn ? 'start' : 'end';
    const lh = nf.fs * 1.08, ny = yc + nf.fs * 0.36 - (nf.ls.length - 1) * lh / 2;
    const tx = nf.ls.map((t, j) => s('text', {x: f1(nx), y: f1(ny + j * lh), 'text-anchor': anc, class: 'mu-name' + (r.on ? ' mu-nameon' : '') + (nf.fs < 19 ? ' mu-name-s' : ''), text: t}));
    // 7판 — 줄기에서 나온 덩굴손이 이름 아래를 따라 글자 끝까지 뻗어 말림(이름이 줄기에 매달림 · 글씨 테가 덩굴손을 가림)
    const sN = signed && dn ? 1 : -1, nW = Math.max(...nf.ls.map(t => textW(t, nf.fs))), base = ny + (nf.ls.length - 1) * lh, xe = nx + sN * (nW + 3);
    kids.push(kTaper(whipPts([ax + sN * 2.6, yc + 1], [ax + sN * 9, base + 7.5], [nx + sN * nW * 0.55, base + 3.5], [xe, base + 1.5], 4.2, -sN, 1.05), {w0: 1.7, w1: 0.35, cls: 'mu-tend mu-ntend'}));
    kids.push(r.href ? s('a', {href: r.href, class: 'g-link'}, s('rect', {x: WIN.x0, y: f1(yc - Math.max(30, rh / 2)), width: WIN.x1 - WIN.x0, height: f1(Math.max(60, rh)), class: 'mu-hit'}), tx) : tx);
  });
  return s('g', {class: 'mu-chart mu-barart', 'data-f': +f.toFixed(5)}, grp('vine', kids, 'mu-barvine'));
}

/* ── 자료가 없을 때 — 빈 그림 대신 「확인 필요」 이름표가 든 작은 그래프 ── */
function needSvg() {
  return s('svg', {class: 'su-svg', viewBox: '0 0 390 300', role: 'img', 'aria-label': '자료 확인 필요'},
    s('rect', {x: 40, y: 110, width: 310, height: 80, rx: 16, class: 'g-empty'}), s('text', {x: 195, y: 158, 'text-anchor': 'middle', class: 'g-tb', text: '자료 확인 필요'}));
}
function chartSvg(chart) {
  if (!chart || typeof chart !== 'object' || typeof chart.querySelector !== 'function' && chart.localName !== 'svg') return null;
  if (chart.localName === 'svg') return chart;
  return chart.querySelector('svg.su-svg') ?? chart.querySelector('svg');
}
const viewOf = svg => { const v = String(svg?.getAttribute?.('viewBox') ?? '').trim().split(/[\s,]+/).map(Number); return v.length === 4 && v.every(Number.isFinite) && v[2] > 0 && v[3] > 0 ? v : null; };

/** 무하 포스터 틀 — chart = su-fig.js 그래프(figure 면 안의 svg) · kind = 그래프 꼴 · tone = 틀 주인 색(hot · bloom · money · calm) */
export function frame(chart, {title = null, kind = 'line', tone = 'calm'} = {}) {
  const tn = tone0(tone), kd = KINDS.includes(kind) ? kind : 'line', id = ++UID;
  let src = chartSvg(chart);
  if (!src || !viewOf(src)) src = needSvg();
  const T = titleOf(title), cw = 'mu-win-' + id, cf = 'mu-frm-' + id;
  setMed(R0); ROWY = null; STEM = null; CTOP = 999;
  let win = kd === 'bars' ? barsArt(src) : null;
  if (!win) { ROWY = null; STEM = null; CTOP = 999; win = chartWin(src, kd); }       // 자리(메달 크기 · 줄 높이)는 그래프를 먼저 놓고 정함
  const label = [T.t, src.getAttribute('aria-label')].filter(Boolean).join(' — ');
  return s('svg', {class: `su-svg su-art4 su-mucha mu-${tn} mu-k-${kd}`, viewBox: `0 0 ${W} ${H}`, role: 'img', 'aria-label': label, preserveAspectRatio: 'xMidYMid meet', 'data-kind': kd, 'data-tone': tn, 'data-r': MED.r},
    s('defs', {}, s('clipPath', {id: cw}, s('path', {d: archPath(RXI, RYI, E + BAND, W - E - BAND, MOS_Y) + 'Z'})), s('clipPath', {id: cf}, s('path', {d: archPath(RXO, RYO, E, W - E, MOS_Y) + 'Z'}))),
    pastel(cw), stars(),
    arch(T.half), sideBands(cf, T), mosaic(), outlines(),
    medal(tn),
    win,
    arms(),
    lettering(T, tn, id));
}

/* ── 부품 꼴(열하나 모두 같게) — 시험: 삼성전자 한 달 줄 ── */
const fin = v => typeof v === 'number' && Number.isFinite(v);
const pct = v => { if (!fin(v)) return null; const a = Math.abs(v).toFixed(1); return a === '0.0' ? '0.0%' : (v > 0 ? '+' : '−') + a + '%'; };
export async function load(get, arg = null) {
  const code = typeof arg === 'string' && /^\d{6}$/.test(arg) ? arg : '005930';
  const [co, H0] = await Promise.all([get('/atlas/data/co/' + code + '.json'), get('/atlas/data/home.json')]);
  const name = typeof co?.c?.name === 'string' ? co.c.name : null, cl = Array.isArray(co?.line) && co.line.filter(fin).length >= 2 ? co.line.filter(fin).map(v => v / 100) : null;
  if (!name || !cl) return null;
  const mk = co.c.market === 'KOSDAQ' ? 'KOSDAQ' : 'KOSPI', rows = H0?.idx?.[mk]?.rows, b = H0?.base, a = H0?.asOf;
  const sel = Array.isArray(rows) && b && a ? rows.filter(r => Array.isArray(r) && typeof r[0] === 'string' && r[0] >= b && r[0] <= a && fin(r[1]) && r[1] > 0) : [];
  const il = sel.length >= 2 ? sel.map(r => r[1] / sel[0][1] * 100) : null, iname = mk === 'KOSDAQ' ? '코스닥' : '코스피';
  const chart = line(cl, il, {label: name + ' 한 달 줄과 ' + (il ? iname : '시장'), name, iname: il ? iname : '시장', pctText: pct(cl[cl.length - 1] - 100)});
  return {code, name, title: name + ' 한 달', chart};
}
export function picture(d, opt = {}) {
  if (!d?.chart) return frame(null, {title: '확인 필요', kind: 'line', tone: opt.tone ?? 'calm'});
  return frame(d.chart, {title: d.title ?? '삼성전자 한 달', kind: 'line', tone: opt.tone ?? 'calm'});
}
