/* 수르 — 무하 포스터 틀 4판(주문 1023 · 심사 3회 docs/design/su-musk-2026-11-05/judge-r3.md · r4-brief.md 「M」을 고침)
   쪽의 값 그래프를 그대로 품는 포스터 — 흰 판 · 흰 네모 없이 그래프를 아치 안 바탕 위에 바로 놓음(아치를 끊지 않음)
   공용 부품 2판(su-mucha-kit.js) — 메달 여인 v=0 · 줄 막대는 잎(leafBar · 길이 그대로) · 제목은 아치를 따라 휘는 리본(ribbon · 흰 테 없이 띠 안에 새김)
   메달 = 1.3배(반지름 70 · 줄이 많거나 그래프가 길면 54 까지 줄임 — 그래프는 같은 비율 그대로) · 어깨 옷자락이 원 밖으로 흘러 가운데 금 줄기로 이어짐
   아치 띠 = 가는 금선 두 줄 사이 꽃 · 별 모자이크 · 양옆 덩굴 = 굵게 S 로 감아 기둥과 아치 띠를 타고 제목 리본까지 · 회사 줄 높이마다 꽃 하나
   오름 = 금빛 잎 끝에 핀 꽃 · 내림 = 장밋빛 잎 끝에 닫힌 붉은 봉오리 · 줄기 밑동 양옆에 꽃 덤불 · 밝은 판 두 귀는 남색 대신 살구빛 새벽
   글씨는 처음부터 진하게(그래프의 들어오는 움직임 이름을 뗌) · 움직임은 꽃 · 잎 · 별 · 머리카락에만(transform) · 들어옴 0.5초
   여인의 살 · 머리칼 · 옷 · 리본 · 봉오리는 고정 색(어두운 판에서도 크림 · 파스텔) · 원화를 본뜨지 않고 화풍만 */
import {s, line} from '/su/su-fig.js';
import {taper as kTaper, strands, medallion as kMedallion, vine, rays, leafBar, ribbon} from './su-mucha-kit.js';

export const CSS = '/su/su-mucha.css';

const W = 390, H = 620, CX = W / 2;
const E = 3, BAND = 30, YS = 150;                         // 바깥 테 · 아치 띠(= 양옆 덩굴 띠) 폭 · 아치가 시작하는 줄
const RXO = CX - E, RYO = YS - E, RXI = RXO - BAND, RYI = RYO - BAND, RXM = RXO - BAND / 2, RYM = RYO - BAND / 2;
const MOS_Y = 592, MOS_H = 25;                            // 아래 꽃 모자이크 띠(592 ~ 617)
const MTOP = 40, R0 = 54, R1 = 70;                        // 메달 위 끝 · 반지름(3판 54 → 1.3배 70)
const WX0 = E + BAND + 4, WX1 = W - E - BAND - 4, WY1 = MOS_Y - 4;
const WIN_W = 330;                                        // 그래프 상자 폭(안쪽 여백은 덩굴 띠에 3px 걸쳐도 됨 — 값은 여백 안쪽)
let MED, WIN, ROWY = null, STEM = null;                    // 한 장을 그리는 동안의 자리(frame 이 처음에 정함 · 동기 셈)
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
/** 닫힌 붉은 봉오리(내림 잎 끝) — 끝이 뾰족한 물방울 · 꽃잎 접힌 선 · 밑을 감싼 꽃받침 둘 · 짧은 꽃자루 */
function closedBud(x, y, sg, L) {
  const P = (u, v) => f1(x + sg * u) + ' ' + f1(y + v), b = 2.5, w = L * 0.4;
  return s('g', {class: 'mu-cbudg'},
    s('path', {d: `M${P(-1, 0)}L${P(b + 0.5, 0)}`, class: 'mu-ostalk'}),
    s('path', {d: `M${P(b, 0)}C${P(b + L * 0.08, -w)} ${P(b + L * 0.62, -w * 0.95)} ${P(b + L, 0)}C${P(b + L * 0.62, w * 0.95)} ${P(b + L * 0.08, w)} ${P(b, 0)}Z`, class: 'mu-cbud'}),
    s('path', {d: `M${P(b + L * 0.2, -w * 0.25)}C${P(b + L * 0.45, -w * 0.55)} ${P(b + L * 0.75, -w * 0.4)} ${P(b + L * 0.97, -0.3)}`, class: 'mu-cbudl'}),
    s('path', {d: `M${P(b - 0.5, 0)}C${P(b + L * 0.1, -w * 1.15)} ${P(b + L * 0.42, -w * 0.9)} ${P(b + L * 0.5, -w * 0.32)}C${P(b + L * 0.28, -w * 0.5)} ${P(b + L * 0.12, -w * 0.3)} ${P(b - 0.5, 0)}Z`
      + `M${P(b - 0.5, 0)}C${P(b + L * 0.1, w * 1.15)} ${P(b + L * 0.42, w * 0.9)} ${P(b + L * 0.5, w * 0.32)}C${P(b + L * 0.28, w * 0.5)} ${P(b + L * 0.12, w * 0.3)} ${P(b - 0.5, 0)}Z`, class: 'mu-leaf mu-sep'}));
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
    s('path', {d: archPath(RXI, RYI, E + BAND, W - E - BAND, MOS_Y), class: 'mu-ain'})]);
}

/* ── 3 제목 — 아치 띠를 따라 휘는 리본(부품 ribbon · 끝은 접혀 갈라짐) · 글씨는 리본 가운데 선 위에 흰 테 없이 갈색으로 새김 ── */
const textW = (t, fs) => [...String(t)].reduce((a, ch) => a + (/\s/.test(ch) ? 0.3 : /[0-9]/.test(ch) ? 0.6 : /[.,]/.test(ch) ? 0.32 : /[%]/.test(ch) ? 0.88 : /[+−\-]/.test(ch) ? 0.62 : /[·…]/.test(ch) ? 0.5 : /[A-Za-z]/.test(ch) ? 0.62 : 1.02) * fs, 0);
function titleOf(title) {
  const t = String(title ?? '').trim() || '확인 필요';
  const fs = textW(t, 23) <= 250 ? 23 : 21;
  return {t, fs, half: textW(t, fs) / 2 + 18};
}
function lettering(T, tn) {
  const A = bandArc(), mid = A.L / 2, sc = SCROLL[tn];
  const pts = A.pts.filter((_, i) => Math.abs(A.acc[i] - mid) <= T.half && i % 4 === 0);
  const R = ribbon(pts, {w: 28, tone: sc}), pid = R.dataset?.path ?? R.getAttribute('data-path');
  return grp('lettering', [R,
    s('text', {class: 'mu-title' + (T.fs < 23 ? ' mu-title-s' : ''), 'data-sc': sc, 'dominant-baseline': 'central'}, s('textPath', {href: '#' + pid, startOffset: '50%', 'text-anchor': 'middle', text: T.t}))], 'mu-scroll');
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
    eL = bez(pL, [pL[0] - 0.05 * r, pL[1] + 0.34 * r], [x - 0.36 * r, tipY - 0.26 * r], [x - 3, tipY]);
    eR = bez(pR, [pR[0] + 0.04 * r, pR[1] + 0.32 * r], [x + 0.33 * r, tipY - 0.28 * r], [x + 3, tipY]);
    folds = [[A(132, 0.72), [x - 0.62 * r, y + 0.86 * r], [x - 0.42 * r, y + r + 4], [x - 6, tipY - 4]], [A(114, 0.7), [x - 0.3 * r, y + 0.9 * r], [x - 0.24 * r, y + r + 2], [x - 3, tipY - 6]],
      [A(94, 0.72), [x - 0.06 * r, y + 0.92 * r], [x + 0.02 * r, y + r + 4], [x - 0.5, tipY - 8]], [A(72, 0.7), [x + 0.24 * r, y + 0.9 * r], [x + 0.2 * r, y + r + 3], [x + 3, tipY - 6]],
      [A(50, 0.72), [x + 0.58 * r, y + 0.86 * r], [x + 0.38 * r, y + r + 4], [x + 5.5, tipY - 4]]];
  } else {
    const hx = 0.58 * r;
    eL = bez(pL, [pL[0] - 0.1 * r, pL[1] + 0.24 * r], [x - 0.8 * r, tipY - 0.04 * r], [x - hx, tipY - 2]);
    eR = bez(pR, [pR[0] + 0.1 * r, pR[1] + 0.24 * r], [x + 0.8 * r, tipY - 0.04 * r], [x + hx, tipY - 2]);
    for (let i = 0; i < 3; i++) { const a = x - hx + i * 2 * hx / 3, b = a + 2 * hx / 3; hem.push(...bez([a, tipY - 2], [a + hx * 0.15, tipY + 3], [b - hx * 0.15, tipY + 3], [b, tipY - 2], 6).slice(1)); }
    folds = [[A(120, 0.72), [x - hx / 3 - 2, tipY - 6], [x - hx / 3, tipY - 2]], [A(64, 0.72), [x + hx / 3 + 2, tipY - 6], [x + hx / 3, tipY - 2]]];
  }
  const body = poly([...eL, ...hem, ...eR.slice().reverse()]) + top;
  const inward = pts => pts.map(p => [p[0] + Math.sign(x - p[0]) * Math.min(3.2, Math.abs(x - p[0]) * 0.45), p[1] - (toStem ? 0 : 1.6)]); // 옷 가장자리 안쪽 금 수 선
  return grp('drape', [s('path', {d: body, class: 'mk-cl-peach'}),
    kTaper(inward(eL.slice(1, -1)), {w0: 1.3, w1: 0.35, cls: 'mu-hemg'}), kTaper(inward(eR.slice(1, -1)), {w0: 1.3, w1: 0.35, cls: 'mu-hemg'}),
    folds.map(p => kTaper(p, {w0: Math.max(1, r * 0.022), w1: 0.35, cls: 'mk-cld-peach'})),
    kTaper(eL, {w0: Math.max(1.6, r * 0.034), w1: 0.5, cls: 'mk-ink'}), kTaper(eR, {w0: Math.max(1.2, r * 0.026), w1: 0.45, cls: 'mk-ink2'}),
    hem.length ? kTaper(hem, {w0: 0.9, w1: 0.5, cls: 'mk-ink2'}) : null], 'mu-drape');
}
function medal(tn) {
  const {x, y, r} = MED, P = (deg, k) => ell(x, y, r * k, r * k, deg);
  // 얼굴 옆 머리채 둘 — 어깨 위로 흘러 옷자락 바깥 테를 따라 돌고 원 밖에서 말림(옆으로 뻗지 않음 · 그래프 자리 위에서 멈춤)
  const locks = [[[x - 0.36 * r, y + 0.4 * r], P(128, 0.84), [x - 0.64 * r, y + 0.84 * r], [x - 0.52 * r, y + 1.0 * r], [x - 0.4 * r, y + 1.04 * r]],
    [[x + 0.16 * r, y - 0.42 * r], [x + 0.36 * r, y - 0.16 * r], [x + 0.4 * r, y + 0.3 * r], P(50, 0.86), [x + 0.62 * r, y + 0.9 * r], [x + 0.48 * r, y + 1.08 * r], [x + 0.32 * r, y + 1.13 * r]]];
  const hairs = locks.map((pts, i) => s('g', {class: 'mk-sway' + (i ? '2' : '')},   // 부품 2판 굵은 다발 둘(속 결은 부품이 그림)
    strands(pts, {n: 2, spread: r * 0.17, w0: r * 0.075, w1: 0.25, curl: 0.8, seed: 41 + i * 7, cls: 'mk-hb'})));
  const tipY = STEM ? STEM.y : y + r + 9;
  return s('g', {class: 'mu-medal'}, kMedallion({cx: x, cy: y, r, v: 0, dir: 1, ring: RING[tn]}), drape(tipY, !!STEM), grp('whiplash', s('g', {class: 'mk-hair mk-t0'}, hairs), 'mu-locks'));
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
function barsArt(src) {
  const P = barRows(src); if (!P) return null;
  const {rows, x0, signed} = P, n = rows.length;
  // 메달 1.3배 · 밑동 덤불 자리 — 줄이 많으면 덤불을 빼고 메달을 54 까지 줄임(줄 높이 32 넘게)
  let r = R1, bh = signed ? 34 : 0, rh = 0;
  const fit = () => { setMed(r); rh = Math.min(64, (WIN.y1 - 4 - bh - (WIN.y0 + 6)) / n); };
  fit(); if (rh < 40 && bh) { bh = 0; fit(); }
  while (rh < 32 && r > R0) { r = Math.max(R0, r - 4); fit(); }
  if (rh < 30) return null; // 너무 많으면 그래프를 같은 비율로 줄여 담는 길로
  const top = WIN.y0 + 6, bot = WIN.y1 - 4 - bh;
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
  const sTop = yA - 2;
  if (signed) STEM = {x: ax, y: sTop + 4};
  kids.push(kTaper([[ax, bh ? yb : yEnd + 6], [ax + 1.4, (yA + yEnd) / 2 + 30], [ax - 1.2, yA + 40], [ax, sTop]], {w0: 7.5, w1: 2.6, cls: 'mu-axis'}));
  for (let i = 1; i < n; i++) kids.push(leaf(ax, yA + rh * i, Math.min(13, rh * 0.28), i % 2 ? -38 : 218, i, 'mu-leaf mu-bleaf'));
  if (signed) kids.push(s('ellipse', {cx: ax, cy: f1(sTop + 4), rx: 5.6, ry: 2.6, class: 'mu-knot'}), s('ellipse', {cx: ax, cy: f1(sTop + 9), rx: 4.4, ry: 2, class: 'mu-knot'}));
  else kids.push(flower(ax, yA - 8, 6, 2, {anim: true}));
  if (bh) kids.push(bush(ax, yb, Math.min(34, yb - yEnd + 4)));
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
      kids.push(bar);
      kids.push(dn ? closedBud(tipX, yc, sgn, bl) : openFlower(tipX, yc, sgn, fr, i));
    }
    else { bar = s('g', {}, s('circle', {cx: ax, cy: f1(yc), r: 3.2, class: 'mu-zero'})); kids.push(bar); }
    for (const [k, val] of [['data-bar', ''], ['data-name', r.name], ['data-val', v.t], ['data-len', f2(L)]]) bar.setAttribute(k, val);
    const vx = ax + sgn * (1.5 + L + ext + 4 + (r.on ? onPad : 0));
    kids.push(s('text', {x: f1(vx), y: f1(yc + fs * 0.36), 'text-anchor': sgn < 0 ? 'end' : 'start', class: 'mu-val ' + (dn ? 'mu-vdn' : eq ? 'mu-veq' : 'mu-vup'), text: v.t}));
    const nf = fitName(r.name, fs, nameRoom, rh), nx = signed ? (dn ? ax + 11 : ax - 11) : ax - 11, anc = signed && dn ? 'start' : 'end';
    const lh = nf.fs * 1.08, ny = yc + nf.fs * 0.36 - (nf.ls.length - 1) * lh / 2;
    const tx = nf.ls.map((t, j) => s('text', {x: f1(nx), y: f1(ny + j * lh), 'text-anchor': anc, class: 'mu-name' + (r.on ? ' mu-nameon' : '') + (nf.fs < 19 ? ' mu-name-s' : ''), text: t}));
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
  setMed(R0); ROWY = null; STEM = null;
  let win = kd === 'bars' ? barsArt(src) : null;
  if (!win) { ROWY = null; STEM = null; win = chartWin(src, kd); }       // 자리(메달 크기 · 줄 높이)는 그래프를 먼저 놓고 정함
  const label = [T.t, src.getAttribute('aria-label')].filter(Boolean).join(' — ');
  return s('svg', {class: `su-svg su-art4 su-mucha mu-${tn} mu-k-${kd}`, viewBox: `0 0 ${W} ${H}`, role: 'img', 'aria-label': label, preserveAspectRatio: 'xMidYMid meet', 'data-kind': kd, 'data-tone': tn, 'data-r': MED.r},
    s('defs', {}, s('clipPath', {id: cw}, s('path', {d: archPath(RXI, RYI, E + BAND, W - E - BAND, MOS_Y) + 'Z'})), s('clipPath', {id: cf}, s('path', {d: archPath(RXO, RYO, E, W - E, MOS_Y) + 'Z'}))),
    pastel(cw), stars(),
    arch(T.half), sideBands(cf, T), mosaic(), outlines(),
    medal(tn),
    win,
    lettering(T, tn));
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
