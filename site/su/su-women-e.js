/* 수르 — 첫 화면 세 여인(su-women-e · 다섯째 판 · docs/design/su-musk-2026-11-05/r5-brief.md 「W」 · judge-r4.md 셋이 겹쳐 짚은 여섯)
   짜임: 한 무대 — 큰 아치 창 하나에 세 여인 · 양옆 · 아래 이름은 가는 금 덩굴 테 하나짜리 장식 판 셋(칸마다 두른 테 없음 · 이름 사이 작은 꽃 점) → 가운데 창을 넓힘
   몸: 8등신 · 한쪽 다리에 무게를 실은 S 자(굽힌 앞 무릎) · 가슴 · 골반 · 팔에 부피(그늘 · 빛) · 허리 아래 주름 여섯이 발치에 고였다가 소용돌이 · 바깥선 가운데 굵고 끝 가늘게 · 안쪽 주름 가늘게
   자세: 불장 = 팔꿈치를 굽혀 횃불을 듦 · 넓은 소매가 주름지며 흘러내림 · 세 갈래로 말려 오르는 큰 불꽃 · 꽃이 될 = 고개를 기울이고 꽃다발을 가슴에 · 돈이 몰리는 = 두 손에서 넘쳐 꽃 띠까지 굽이쳐 내리는 세 겹 금빛 파도 띠
   머리: 어깨 아래로 S 로 흘러 끝이 말리는 굵은 다발(부품 strands) · 아치 글씨 셋은 한 호 위에 같은 크기 · 같은 간격(글 넓이를 재어 사이를 고르게)
   보안 규칙: createElementNS · setAttribute 만(글 속 style 없음) · 꾸밈은 su-women-e.css 와 부품 꾸밈 클래스 */
import {s} from '/su/su-fig.js';
import {taper, strands, face, hair, sleeve, rays} from './su-mucha-kit.js';

export const CSS = '/su/su-women-e.css';
const D = '/su/data/su21.json';
const KEY = ['hot', 'bloom', 'money'];
const KIND = {hot: '불장', bloom: '꽃이 될', money: '돈이 몰리는'};
const NEED = '확인 필요';
const W = 390, H = 620;
const fin = v => typeof v === 'number' && Number.isFinite(v);
const NF = new Intl.NumberFormat('ko-KR');
const r1 = v => Math.round(v * 10) / 10;
const PI = Math.PI;
let UID = 0;

/** 자료 받기 — 못 받으면 null(그림은 「확인 필요」로 그림) */
export async function load(get, arg = null) { // arg(회사 번호)는 이 그림에 쓰지 않음
  try { return (await get(D)) ?? null; } catch { return null; }
}

/* ── 값 글(옛 21곳 그림과 같은 셈) ── */
function valText(c, k) {
  if (k === 'hot') return fin(c?.ch20) ? (c.ch20 > 0 ? '+' : c.ch20 < 0 ? '−' : '') + Math.abs(c.ch20).toFixed(1) + '%' : NEED;
  if (k === 'money') { const g = c?.why?.gain; return fin(g) ? (g >= 0 ? '+' : '−') + NF.format(Math.abs(Math.round(g))) + '억' : NEED; }
  return c?.why?.full === true ? '꽃' : '싹';
}
/** 글 넓이 어림(굵은 글 · 잰 값에 맞춤) — 한글 0.94 · 대문자 0.7 · 숫자 0.64 */
function est(t, px) {
  let w = 0;
  for (const ch of String(t)) {
    if (/[ᄀ-ᇿ㄰-㆏가-힯一-鿿]/.test(ch)) w += 0.94;
    else if (ch === '✦') w += 0.8;
    else if (/[A-Z&]/.test(ch)) w += 0.7;
    else if (ch === '%') w += 0.98;
    else if (/[a-z]/.test(ch)) w += 0.56;
    else if (/[0-9+−-]/.test(ch)) w += 0.64;
    else if (/[ .,·]/.test(ch)) w += 0.3;
    else w += 0.8;
  }
  return w * px;
}
const SUFFIX = ['인터내셔널', '글로비스', '글로벌', '홀딩스', '산업개발', '중공업', '에너지', '바이오', '제약', '전자', '증권', '생명', '화재', '해상', '화학', '건설', '링크', '게이트', '그룹', '금융', '지주', '항공', '진로', '칠성', '티앤씨'];
/** 긴 이름은 두 줄로 — 띄어쓰기 · 영어와 한글 사이 · 흔한 끝말 앞(낱말 경계) · 없으면 가운데 */
function split2(name) {
  const t = String(name);
  const sp = [...t.matchAll(/ /g)].map(m => m.index);
  if (sp.length) { const mid = t.length / 2, i = sp.reduce((a, b) => (Math.abs(b - mid) < Math.abs(a - mid) ? b : a)); return [t.slice(0, i), t.slice(i + 1)]; }
  const m = /^([A-Za-z0-9&]+)([가-힯].*)$/.exec(t);
  if (m) return [m[1], m[2]];
  for (const suf of SUFFIX) if (t.endsWith(suf) && t.length - suf.length >= 2) return [t.slice(0, t.length - suf.length), suf];
  const h = Math.ceil(t.length / 2);
  return [t.slice(0, h), t.slice(h)];
}
const SQ = 1.18, SQV = 1.14; // 글자 사이를 좁혀도 되는 만큼(이름 18 · 값 14 안)
/** 칸 글 줄 — 이름 한 줄(20 → 19 → 18) + 값 아랫줄 · ✦ 는 들어가는 줄에 · 안 들어가면 이름을 낱말 경계에서 두 줄(값은 아랫줄 · 꽃이 될 칸은 둘째 줄 끝에 한 글자 값) */
function lay(it, nW, tailOK = false, vW = nW) {
  const star = it.star ? '✦ ' : '';
  const fit = (t, px, k = 1) => est(t, px) <= nW * k, fitV = (t, k = SQV) => est(t, 18) <= vW * k;
  for (const px of [20, 19, 18]) if (fit(star + it.name, px) && fitV(it.val)) return {px, rows: [{t: star + it.name}, {t: it.val, v: 1}]};
  if (star) for (const px of [19, 18]) if (fit(it.name, px, SQ) && fitV(star + it.val)) return {px, rows: [{t: it.name}, {t: star + it.val, v: 1}]};
  if (fit(star + it.name, 18, SQ) && fitV(it.val)) return {px: 18, rows: [{t: star + it.name}, {t: it.val, v: 1}]};
  const [a, b] = split2(it.name);
  if (tailOK && fit(star + a, 18, SQ) && fitV(b + ' ' + it.val, SQ)) return {px: 18, rows: [{t: star + a}, {t: b, tail: it.val}]};
  return {px: 18, rows: [{t: star + a}, {t: b}, {t: it.val, v: 1}]};
}
/* ── 모양 도우미 ── */
/** Catmull-Rom 곡선을 촘촘한 점으로(열린 곡선 · 닫힌 곡선) */
function crPts(P, step = 8, closed = false) {
  const out = [], n = P.length, at = i => (closed ? P[(i + n) % n] : P[Math.max(0, Math.min(n - 1, i))]);
  const segs = closed ? n : n - 1;
  for (let i = 0; i < segs; i++) {
    const p0 = at(i - 1), p1 = at(i), p2 = at(i + 1), p3 = at(i + 2);
    for (let j = 0; j < step; j++) {
      const t = j / step, t2 = t * t, t3 = t2 * t;
      out.push([0, 1].map(k => 0.5 * ((2 * p1[k]) + (-p0[k] + p2[k]) * t + (2 * p0[k] - 5 * p1[k] + 4 * p2[k] - p3[k]) * t2 + (-p0[k] + 3 * p1[k] - 3 * p2[k] + p3[k]) * t3)));
    }
  }
  if (!closed) out.push(P[n - 1]);
  return out;
}
const pt = p => r1(p[0]) + ' ' + r1(p[1]);
const closedD = P => 'M' + crPts(P, 6, true).map(pt).join('L') + 'Z';
/** 촘촘한 점 줄 → 가늘게 · 굵게 · 가늘게(렌즈 꼴) 채운 띠 · wf(t) = 굵기 */
function bandD(q, wf) {
  const n = q.length, L = [], R = [];
  for (let i = 0; i < n; i++) {
    const a = q[Math.max(0, i - 1)], b = q[Math.min(n - 1, i + 1)];
    let tx = b[0] - a[0], ty = b[1] - a[1]; const m = Math.hypot(tx, ty) || 1; tx /= m; ty /= m;
    const w = wf(i / (n - 1));
    L.push([q[i][0] - ty * w / 2, q[i][1] + tx * w / 2]); R.push([q[i][0] + ty * w / 2, q[i][1] - tx * w / 2]);
  }
  return 'M' + L.map(pt).join('L') + 'L' + R.reverse().map(pt).join('L') + 'Z';
}
const lens = (P, w0, k = 0.7) => bandD(crPts(P, 8), t => w0 * Math.pow(Math.sin(PI * t), k) + 0.3);
/** 키 높이 → 옆으로 민 값(매끈하게) — 몸을 S자로 휘게 함 */
function bendFn(keys) {
  return y => {
    if (y <= keys[0][0]) return keys[0][1];
    for (let i = 0; i < keys.length - 1; i++) {
      const [y0, v0] = keys[i], [y1, v1] = keys[i + 1];
      if (y <= y1) { const t = (y - y0) / (y1 - y0), u = t * t * (3 - 2 * t); return v0 + (v1 - v0) * u; }
    }
    return keys[keys.length - 1][1];
  };
}
/** 소용돌이 점 — 가운데 c · 처음 반지름 r0 · 처음 각 a0 · 바퀴 · 돌 방향 sg */
function spiral(c, r0, a0, turns, sg, keep = 0.3, n = 26) {
  const out = [];
  for (let i = 0; i <= n; i++) { const t = i / n, a = a0 + sg * t * turns * 2 * PI, r = r0 * (1 - (1 - keep) * t); out.push([c[0] + Math.cos(a) * r, c[1] + Math.sin(a) * r]); }
  return out;
}
/** 꽃잎(여럿을 한 길에) · 잎 · 별 · 점 */
function petalsD(x, y, r, n, wd = 0.42, rot = 0) {
  let d = '';
  for (let i = 0; i < n; i++) {
    const a = rot + i * 2 * PI / n, ca = Math.cos(a), sa = Math.sin(a), px = -sa * r * wd, py = ca * r * wd;
    d += `M${r1(x)} ${r1(y)}Q${r1(x + ca * r * 0.5 + px)} ${r1(y + sa * r * 0.5 + py)} ${r1(x + ca * r)} ${r1(y + sa * r)}Q${r1(x + ca * r * 0.5 - px)} ${r1(y + sa * r * 0.5 - py)} ${r1(x)} ${r1(y)}Z`;
  }
  return d;
}
function leafD(x, y, a, L, Wd) {
  const ca = Math.cos(a), sa = Math.sin(a), q = (u, v) => r1(x + ca * u - sa * v) + ' ' + r1(y + sa * u + ca * v);
  return `M${q(0, 0)}C${q(L * 0.25, -Wd)} ${q(L * 0.7, -Wd * 0.8)} ${q(L, 0)}C${q(L * 0.65, Wd * 0.7)} ${q(L * 0.3, Wd * 0.9)} ${q(0, 0)}Z`;
}
const dotD = (x, y, r) => `M${r1(x - r)} ${r1(y)}a${r1(r)} ${r1(r)} 0 1 0 ${r1(2 * r)} 0a${r1(r)} ${r1(r)} 0 1 0 ${r1(-2 * r)} 0`;
function starD(x, y, r) { let d = ''; for (let i = 0; i < 10; i++) { const a = -PI / 2 + i * PI / 5, rr = i % 2 ? r * 0.42 : r; d += (i ? 'L' : 'M') + r1(x + rr * Math.cos(a)) + ' ' + r1(y + rr * Math.sin(a)); } return d + 'Z'; }

/* ── 여인 하나 — 제 자리(얼굴 가운데 0,0 · 얼굴은 +x 쪽을 봄 · 단위 h = 이마 위 ~ 턱 끝) ── 아홉째 판(r9-brief.md 「B01」): 가슴 아래를 sy 배 늘여 머리는 무대 아치에 닿고 치맛단은 아래 띠에 고임 */
/* 긴 옷 — 목 · 손목 · 발목까지 · 둥근 어깨 · 앞으로 둥근 가슴 · 잘록한 허리 · 풍만한 엉덩이(무게 실은 뒤쪽이 더 나옴) · 굽힌 앞 무릎 · 발치에 고여 물결지는 자락 */
const G_BACK = [[-0.2, 0.9], [-0.56, 0.96], [-0.78, 1.12], [-0.8, 1.5], [-0.66, 2.1], [-0.5, 2.7], [-0.72, 3.2], [-0.98, 3.8], [-1.01, 4.45], [-0.88, 5.3], [-0.74, 6.3], [-0.8, 7.2], [-0.98, 8.0], [-1.18, 8.62], [-1.32, 8.98]];
const G_HEM = [[-1.32, 8.98], [-1.1, 9.1], [-0.86, 8.99], [-0.56, 9.12], [-0.26, 9.0], [0.04, 9.14], [0.36, 9.02], [0.66, 9.1], [0.94, 8.96], [1.1, 8.88]];
const G_FRONT = [[1.1, 8.88], [0.94, 8.3], [0.8, 7.55], [0.74, 6.8], [0.88, 6.15], [0.84, 5.45], [0.78, 4.6], [0.8, 3.9], [0.6, 3.3], [0.38, 2.9], [0.46, 2.5], [0.72, 2.2], [0.86, 1.9], [0.82, 1.52], [0.62, 1.12], [0.2, 0.9]];
const GOWN = [...G_BACK, ...G_HEM.slice(1, -1), ...G_FRONT];
/* 주름 다발 셋 — 허리띠에서 모여 나와(가늘게) 엉덩이 · 무릎을 돌아 발치로 부채처럼 퍼짐(굵게) · [점들, 말림 반지름 h(0 = 말림 없음), 도는 쪽] */
const FOLDS = [
  [[[-0.34, 3.0], [-0.62, 3.9], [-0.7, 5.2], [-0.74, 6.8], [-1.0, 8.6]], 0.17, 1],
  [[[-0.26, 3.04], [-0.48, 4.0], [-0.52, 5.4], [-0.54, 7.0], [-0.72, 8.85]], 0, 0],
  [[[-0.1, 3.06], [-0.18, 4.2], [-0.16, 5.6], [-0.2, 7.2], [-0.32, 8.95]], 0.12, -1],
  [[[0.0, 3.06], [-0.03, 4.3], [0.02, 5.7], [0.0, 7.3], [0.02, 9.02]], 0, 0],
  [[[0.1, 3.02], [0.14, 4.2], [0.24, 5.6], [0.28, 7.3], [0.32, 9.0]], 0.12, -1],
  [[[0.24, 2.98], [0.44, 4.0], [0.54, 5.4], [0.54, 6.9], [0.64, 8.9]], 0, 0],
  [[[0.32, 2.95], [0.62, 3.9], [0.72, 5.0], [0.76, 6.2], [0.84, 7.4], [0.94, 8.7]], 0.15, -1]];
/* 몸의 휨(높이 → 옆으로) — 어깨는 앞 · 골반은 뒤(무게 실은 다리) · 발은 다시 앞 · 셋이 다름 */
const BEND = {
  hot: [[-1.2, 0.18], [1.0, 0.1], [2.9, -0.16], [3.9, -0.38], [5.6, -0.1], [7.6, 0.14], [9.0, 0.2]],
  bloom: [[-1.2, 0.22], [1.0, 0.08], [2.9, -0.18], [3.9, -0.42], [5.6, -0.14], [7.6, 0.12], [9.0, 0.22]],
  money: [[-1.2, 0.24], [1.0, 0.12], [2.9, -0.16], [3.9, -0.38], [5.6, -0.16], [7.6, 0.04], [9.0, 0.14]],
};
/* 금빛 물줄기(돈이 몰리는 여인) — 가슴 높이 두 손바닥 위 물결 더미에서 넘쳐 몸 앞 선을 따라 발치로 흘러내림 */
const WAVE = [[1.12, 2.2], [1.0, 2.8], [1.04, 3.6], [0.96, 4.5], [1.06, 5.4], [0.98, 6.4], [1.1, 7.4], [1.2, 8.3], [1.36, 9.1]];
/** 붓 선 — 굵게 시작해 끝으로 가늘어짐(바깥선) */
const brush = (Q, w0) => bandD(crPts(Q, 8), t => w0 * Math.min(1, t / 0.06 + 0.2) * Math.pow(1 - t, 0.85) + 0.3);
/** 속 주름 — 위 가늘게 아래로 조금 굵게 · 1 아래 */
const fine = Q => bandD(Q, t => 0.2 + 0.72 * Math.pow(t, 0.7));
/** 촘촘한 점 줄 끝에 안으로 말리는 소용돌이를 이음(지나온 방향을 그대로 이어 돎) */
function curlEnd(Q, r, sg, turns = 0.9) {
  const p = Q[Q.length - 1], q = Q[Math.max(0, Q.length - 3)], dl = Math.hypot(p[0] - q[0], p[1] - q[1]) || 1, dx = (p[0] - q[0]) / dl, dy = (p[1] - q[1]) / dl;
  const c = [p[0] - dy * sg * r, p[1] + dx * sg * r], a0 = Math.atan2(p[1] - c[1], p[0] - c[0]);
  return Q.concat(spiral(c, r, a0, turns, sg, 0.35, 14).slice(1));
}
const thin = (Q, w0) => bandD(Q, t => w0 * Math.pow(Math.sin(PI * t), 0.8) + 0.3);

/** 여인 — o: {k, x, y(얼굴 가운데) · h · sy(가슴 아래 늘임) · dir(1 = 오른쪽을 봄) · tilt · tone(머리) · cloth · iris · seed} */
function lady(o) {
  const {k, h} = o, sy = o.sy ?? 1, bend = bendFn(BEND[k]), b0 = bend(0);
  const V = v => (v <= 1.6 ? v : 1.6 + (v - 1.6) * sy);
  const P = pts => pts.map(([u, v]) => [(u + bend(v) - b0) * h, V(v) * h]);
  const g = s('g', {class: 'we-w we-' + k, 'data-body': k, transform: `translate(${r1(o.x)} ${r1(o.y)})` + (o.dir < 0 ? ' scale(-1 1)' : '')});
  const T = 'mk-hair mk-t' + o.tone, cl = o.cloth;
  /* 1 등 뒤 머리 — 가는 가닥 다발 둘이 어깨 뒤로 S 로 흘러 허리 아래에서 끝이 말림 */
  const hb = P([[-0.36, -0.46], [-0.8, 0.08], [-1.04, 0.85], [-0.92, 1.6], [-1.1, 2.4], [-1.02, 3.1], [-1.24, 3.7]]);
  const hb2 = P([[-0.16, -0.5], [-0.6, 0.18], [-0.76, 1.0], [-0.64, 1.8], [-0.8, 2.5], [-0.72, 3.0]]);
  g.append(s('g', {class: T, 'data-mucha': 'whiplash'}, s('g', {class: 'mk-sway'},
    strands(hb, {n: 3, spread: h * 0.36, w0: h * 0.15, w1: 0.3, curl: 1, seed: o.seed * 3 + 1, cls: 'mk-hb'})),
    s('g', {class: 'mk-sway2'}, strands(hb2, {n: 2, spread: h * 0.2, w0: h * 0.08, w1: 0.25, curl: 0.8, seed: o.seed * 3 + 2, cls: 'mk-hb'}))));
  g.append(s('g', {transform: `rotate(${o.tilt})`}, hair({cx: 0, cy: 0, h, dir: 1, tone: o.tone, len: 2.8, seed: o.seed, view: o.view})));
  /* 뒤 팔(몸 뒤로 숨는 윗팔) */
  const arm = (pts, w0, w1) => { const Q = crPts(P(pts), 8); return [s('path', {d: bandD(Q, t => w0 + (w1 - w0) * t + h * 0.07), class: 'mk-ink'}), s('path', {d: bandD(Q, t => w0 + (w1 - w0) * t), class: 'mk-cl-' + cl}),
    s('path', {d: fine(Q.slice(2, -3).map(([x, y], i, A) => { const a = A[Math.max(0, i - 1)], b = A[Math.min(A.length - 1, i + 1)], m = Math.hypot(b[0] - a[0], b[1] - a[1]) || 1; return [x + (b[1] - a[1]) / m * w0 * 0.18, y - (b[0] - a[0]) / m * w0 * 0.18]; })), class: 'mk-cld-' + cl})]; };
  /** 아래팔 소매 + 손(부품 sleeve) — grip = 쥔 자리(주먹 가운데) */
  const fore = (from, to, hand, w) => {
    const [a, b] = P([from, to]), vx = b[0] - a[0], vy = b[1] - a[1], L = Math.hypot(vx, vy) || 1, len = Math.max(8, L - w * 0.32), along = len - w * 0.12 + 0.42 * w * 1.55;
    return {el: sleeve({x: r1(a[0]), y: r1(a[1]), ang: r1(Math.atan2(-vx, vy) * 180 / PI), len: r1(len), w: r1(w), hand, dir: 1, tone: cl}), grip: [a[0] + vx / L * along, a[1] + vy / L * along]};
  };
  if (k === 'bloom') g.append(...arm([[-0.56, 1.12], [-0.7, 1.7], [-0.62, 2.3]], h * 0.32, h * 0.28));
  /* 2 긴 옷 · 발치에 고인 자락(말린 끝 셋) */
  const curlB = spiral([-1.12, 8.62], 0.32, 2.4, 1.15, 1), curlF = spiral([0.9, 8.64], 0.22, 0.9, 1.05, -1), curlM = spiral([-0.22, 8.86], 0.16, 1.3, 1.0, 1);
  g.append(s('path', {d: dotD(...P([[-1.12, 8.62]])[0], h * 0.3) + dotD(...P([[0.9, 8.64]])[0], h * 0.2), class: 'mk-cl-' + cl}),
    s('path', {d: closedD(P(GOWN)), class: 'mk-cl-' + cl}));
  /* 부피 — 그늘(등 · 엉덩이 · 가슴 밑 · 굽힌 무릎 아래) · 빛(가슴 · 앞 허벅지 · 뒤 골반) */
  g.append(s('path', {d: lens(P([[-0.6, 1.3], [-0.5, 2.2], [-0.44, 2.8], [-0.7, 3.8], [-0.7, 5.0], [-0.58, 6.4], [-0.74, 7.9]]), h * 0.22, 0.6)
      + lens(P([[0.26, 2.14], [0.52, 2.34], [0.76, 2.16]]), h * 0.11) + lens(P([[0.7, 6.35], [0.56, 7.2], [0.6, 8.2]]), h * 0.15), class: 'mk-cld-' + cl + ' we-sh'}),
    s('path', {d: lens(P([[0.42, 1.5], [0.64, 1.68], [0.7, 1.98]]), h * 0.12) + lens(P([[0.44, 3.95], [0.6, 4.9], [0.7, 5.9]]), h * 0.17) + lens(P([[-0.58, 3.55], [-0.68, 4.15], [-0.62, 4.8]]), h * 0.12), class: 'we-hl'}));
  /* 속 주름 다발(1 아래) — 허리에서 발치로 · 끝 넷은 소용돌이 */
  let fd = '';
  for (const [f, r, sg] of FOLDS) { const Q = crPts(P(f), 6); fd += fine(r ? curlEnd(Q, r * h, sg) : Q); }
  g.append(s('path', {d: fd + lens(P([[-0.42, 1.45], [-0.26, 1.95], [-0.04, 2.22]]), 0.6) + lens(P([[0.14, 1.5], [0.22, 2.0], [0.36, 2.3]]), 0.55), class: 'mk-cld-' + cl}));
  /* 바깥선 — 겨드랑이에서 굵게 시작해 발치로 가늘게(붓 선) · 단은 가늘게 */
  g.append(s('path', {d: brush(P(G_BACK.slice(1)), h * 0.12) + brush(P(G_FRONT.slice().reverse().slice(1)), h * 0.1), class: 'mk-ink'}),
    s('path', {d: lens(P(G_HEM), 1.1), class: 'mk-ink2'}),
    taper(P(curlB), {w0: h * 0.1, w1: 0.4, cls: 'mk-ink'}), taper(P(curlF), {w0: h * 0.08, w1: 0.35, cls: 'mk-ink'}), taper(P(curlM), {w0: h * 0.05, w1: 0.3, cls: 'mk-ink2'}));
  /* 띠 — 앞 어깨에서 가슴을 비스듬히 감아 뒤 골반으로 · 끝은 엉덩이에서 늘어져 나부낌 */
  const SA = P([[0.6, 1.16], [0.38, 1.7], [0.02, 2.3], [-0.42, 2.92], [-0.84, 3.5]]), SE = P([[-0.8, 3.42], [-1.0, 4.1], [-0.9, 4.9], [-1.08, 5.7]]);
  g.append(s('path', {d: lens(SA, h * 0.2, 0.45), class: 'we-sash we-sash-' + k}), taper(SE, {w0: h * 0.17, w1: 0.6, cls: 'we-sash we-sash-' + k}),
    s('path', {d: fine(crPts(P([[0.52, 1.24], [0.26, 1.78], [-0.1, 2.38], [-0.5, 2.98], [-0.8, 3.44]]), 5)) + fine(crPts(P([[-0.86, 3.6], [-0.96, 4.3], [-0.92, 5.0]]), 5)), class: 'we-sash2'}),
    s('path', {d: lens(P([[-0.48, 2.82], [-0.12, 2.98], [0.2, 2.98], [0.4, 2.86]]), h * 0.14), class: 'mk-gold'}));
  /* 3 얼굴(부품) · 높은 깃 · 보석 */
  const fc = s('g', {transform: `rotate(${o.tilt})`}, face({cx: 0, cy: 0, h, dir: 1, view: o.view, tilt: 0, iris: o.iris}), diadem(k, h, o.view));
  const collar = s('path', {d: closedD([[-0.27, 0.74], [0, 0.8], [0.27, 0.74], [0.31, 0.95], [0, 1.02], [-0.31, 0.95]].map(([u, v]) => [u * h, v * h])), class: 'mk-collar'});
  const gem = s('path', {d: dotD(0, 1.0 * h, h * 0.055), class: 'mk-gem-' + (k === 'hot' ? 'r' : k === 'bloom' ? 'g' : 'b')});
  g.append(fc, collar, gem);
  /* 4 자세와 든 것 */
  if (k === 'hot') { // 앞 팔을 팔꿈치에서 굽혀 주먹이 횃불 자루를 세로로 감쌈 · 잔은 턱 높이 · 불꽃은 얼굴 옆
    g.append(...arm([[0.52, 1.12], [0.6, 1.72], [0.56, 2.36]], h * 0.36, h * 0.3));
    const F1 = fore([0.56, 2.36], [0.86, 2.34], 'hold', h * 0.36), [fx, fy] = F1.grip;
    g.append(torch(fx, h * 0.8, h * 0.5, fx, fy + h * 0.78), F1.el);
  } else if (k === 'bloom') { // 두 팔로 허리 앞에 큰 꽃다발을 안음 · 꽃다발에서 덩굴이 발치 꽃밭까지 흘러내림
    g.append(...arm([[0.5, 1.12], [0.66, 1.72], [0.64, 2.3]], h * 0.34, h * 0.3));
    const F1 = fore([0.64, 2.3], [0.36, 2.66], 'hold', h * 0.34), F2 = fore([-0.6, 2.28], [-0.08, 2.74], 'hold', h * 0.32);
    const [cx, cy] = P([[0.12, 2.6]])[0];
    g.append(trail(P, h), bouquet(cx, cy, h * 1.18), F2.el, F1.el);
  } else { // 두 손바닥이 가슴 높이에서 금빛 물결 더미를 받쳐 듦 · 더미에서 넘친 물줄기가 몸 앞 선을 따라 발치로
    g.append(waves(P(WAVE), h * 0.6));
    const F2 = fore([-0.3, 2.26], [0.66, 2.14], 'rest', h * 0.32);
    g.append(F2.el, ...arm([[0.5, 1.12], [0.6, 1.72], [0.6, 2.3]], h * 0.35, h * 0.3));
    const F1 = fore([0.6, 2.3], [1.08, 2.18], 'rest', h * 0.34);
    const [ax, ay] = F2.grip, [bx, by] = F1.grip;
    g.append(heldWave((ax + bx) / 2 + h * 0.06, Math.min(ay, by) - h * 0.06, h * 1.3), F1.el);
  }
  return g;
}
/** 손바닥 위 금빛 물결 더미 — 밑동 가운데 (x, y) · 폭 w · 물마루 셋이 솟아 안으로 말리고(물거품) · 금 알갱이 */
function heldWave(x, y, w) {
  const X = (u, v) => [x + u * w, y - v * w];
  const tongue = (Q, w0, sg, r) => bandD(curlEnd(crPts(Q, 8), r, sg, 1.05), t => w0 * (t < 0.1 ? 0.7 + 0.3 * t / 0.1 : Math.pow(1 - (t - 0.1) / 0.9, 0.7)) + 0.4);
  const mound = closedD([X(-0.52, 0.02), X(-0.44, 0.2), X(-0.22, 0.3), X(0.04, 0.34), X(0.3, 0.28), X(0.5, 0.14), X(0.54, 0.0), X(0.2, -0.07), X(-0.24, -0.07)]);
  const T = [[[X(-0.4, 0.1), X(-0.5, 0.34), X(-0.38, 0.54), X(-0.16, 0.56)], 0.26, 1, 0.1],
    [[X(-0.1, 0.2), X(-0.12, 0.5), X(0.02, 0.76), X(0.24, 0.8)], 0.3, 1, 0.12],
    [[X(0.22, 0.14), X(0.36, 0.36), X(0.48, 0.5), X(0.6, 0.42)], 0.22, 1, 0.08]];
  let a = '', b = '', foam = '', grain = '';
  for (const [Q, w0, sg, r] of T) {
    a += tongue(Q, w * w0, sg, w * r);
    b += tongue(Q.map(([px, py]) => [px + (x - px) * 0.08, py + (y - py) * 0.1]), w * w0 * 0.45, sg, w * r * 0.6);
    const e = Q[Q.length - 1]; foam += bandD(crPts(spiral([e[0] + w * 0.02, e[1] + w * r * 0.9], w * r * 0.9, PI * 1.2, 1.05, 1, 0.25, 14), 2), u => w * 0.05 * (1 - u) + 0.3);
  }
  for (const [u, v, r] of [[-0.5, 0.5, 0.03], [-0.2, 0.72, 0.025], [0.12, 0.98, 0.032], [0.46, 0.68, 0.026], [0.62, 0.2, 0.03], [-0.6, 0.12, 0.024]]) grain += dotD(...X(u, v), r * w);
  return s('g', {class: 'we-wave', 'data-held': 'wave', 'data-mucha': 'whiplash'},
    s('path', {d: mound, class: 'we-wv2'}), s('path', {d: a, class: 'we-wv2'}), s('path', {d: b, class: 'we-wv3'}), s('path', {d: lens([X(-0.46, 0.08), X(-0.1, 0.2), X(0.24, 0.16), X(0.5, 0.06)], w * 0.05), class: 'we-streak'}), s('path', {d: foam, class: 'we-foam'}), s('path', {d: grain, class: 'we-coin'}));
}
/** 꽃다발에서 흘러내리는 덩굴 — 치마 앞을 S 로 타고 발치 꽃밭까지(잎 · 작은 들국) */
function trail(P, h) {
  const Q = crPts(P([[0.16, 3.0], [0.0, 4.2], [0.28, 5.6], [0.02, 7.0], [0.22, 8.2], [0.06, 9.1]]), 8);
  let lv = '', da = '', ce = '';
  [0.12, 0.26, 0.4, 0.55, 0.7, 0.84].forEach((t, i) => { const p = Q[Math.round(t * (Q.length - 1))], sg = i % 2 ? 1 : -1; lv += leafD(p[0], p[1], (sg > 0 ? 0.5 : PI - 0.5) + 0.3, h * 0.36, h * 0.11); });
  for (const t of [0.33, 0.62, 0.9]) { const p = Q[Math.round(t * (Q.length - 1))]; da += petalsD(p[0] + h * 0.1, p[1], h * 0.15, 10, 0.2, t * 9); ce += dotD(p[0] + h * 0.1, p[1], h * 0.045); }
  return s('g', {class: 'we-trail', 'data-mucha': 'vine'}, s('path', {d: bandD(Q, t => 1.5 * (1 - t) + 0.5), class: 'mk-vstem0'}),
    s('path', {d: lv, class: 'mk-leaf'}), s('path', {d: da, class: 'mk-fl-daisy'}), s('path', {d: ce, class: 'mk-fl-c'}));
}
/** 머리 장식 — 불장 = 붉은 양귀비 · 꽃이 될 = 흰 들국 화관 · 돈이 몰리는 = 금 동전 머리띠 */
function diadem(k, h, view = 'three') {
  const c0 = view === 'profile' ? -0.26 : -0.12, A = a => [(c0 + 0.5 * Math.cos(a * PI / 180)) * h, (-0.3 + 0.45 * Math.sin(a * PI / 180)) * h];
  const g = s('g', {class: 'we-crown'});
  if (k === 'money') {
    let d = '', e = '';
    for (const a of [-160, -136, -112, -88, -64, -40]) { const [x, y] = A(a); d += dotD(x, y, h * 0.065); e += dotD(x, y, h * 0.03); }
    g.append(s('path', {d: lens([A(-170), A(-140), A(-100), A(-60), A(-30)], h * 0.05), class: 'mk-gold'}), s('path', {d, class: 'we-coin'}), s('path', {d: e, class: 'mk-gold'}));
    return g;
  }
  const spots = k === 'hot' ? [[-150, 0.15], [-118, 0.19], [-88, 0.13]] : [[-160, 0.12], [-132, 0.14], [-104, 0.12], [-78, 0.1]];
  let lv = '', pe = '', ce = '';
  for (const [a, r] of spots) {
    const [x, y] = A(a);
    lv += leafD(x, y, (a + 40) * PI / 180, r * h * 1.4, r * h * 0.4);
    pe += petalsD(x, y, r * h, k === 'hot' ? 5 : 9, k === 'hot' ? 0.5 : 0.2, a / 50);
    ce += dotD(x, y, r * h * 0.28);
  }
  g.append(s('path', {d: lv, class: 'mk-leaf'}), s('path', {d: pe, class: k === 'hot' ? 'mk-fl-poppy' : 'mk-fl-daisy'}), s('path', {d: ce, class: k === 'hot' ? 'mk-fl-c2' : 'mk-fl-c'}));
  return g;
}
/** 횃불 — 자루(주먹 아래 hx,hy → 잔 x,y) · 금 잔 · 세 갈래 불꽃(밑동에서 갈라져 위로 S 로 휘고 끝이 말림 · 양옆은 바깥으로 · 지난 판의 두 배) · 불티 */
/** 세 갈래 불꽃 — 밑동 가운데 (x, b) · 크기 h(횃불과 이름 판 머리가 같이 씀) */
function flame(x, b, h) {
  const X = (u, v) => [x + u * h, b - v * h];
  const tongue = (Q, w0, sg, r) => bandD(curlEnd(crPts(Q, 8), r, sg, 0.85), t => w0 * (t < 0.14 ? 0.62 + 0.38 * t / 0.14 : Math.pow(1 - (t - 0.14) / 0.86, 1.2)) + 0.25);
  const C = [X(0, 0), X(0.18, 0.6), X(-0.12, 1.25), X(0.06, 1.9)], Lt = [X(-0.1, 0), X(-0.36, 0.42), X(-0.4, 0.88), X(-0.56, 1.24)], Rt = [X(0.1, 0), X(0.38, 0.45), X(0.4, 0.94), X(0.58, 1.32)];
  const inner = (Q, k) => Q.map(([px, py]) => [x + (px - x) * 0.8, b + (py - b) * k]);
  return s('g', {class: 'we-flame', 'data-mucha': 'whiplash'},
    s('path', {d: tongue(Lt, h * 0.34, -1, h * 0.11) + tongue(Rt, h * 0.34, 1, h * 0.11) + tongue(C, h * 0.52, -1, h * 0.14), class: 'we-fire'}),
    s('path', {d: tongue(inner(Lt, 0.7), h * 0.16, -1, h * 0.07) + tongue(inner(Rt, 0.7), h * 0.16, 1, h * 0.07) + tongue(inner(C, 0.72), h * 0.28, -1, h * 0.09), class: 'we-fire2'}),
    s('path', {d: tongue(inner(C, 0.44), h * 0.16, -1, h * 0.06), class: 'we-fire3'}));
}
/** 금빛 물마루 셋 — 가운데 (x, y) · 폭 w(이름 판 머리 문양) */
function crest(x, y, w) {
  const a = w / 6, base = [];
  for (let i = 0; i <= 24; i++) { const t = i / 24; base.push([x - w / 2 + w * t, y + a * 0.28 * Math.sin(t * 6 * PI + PI / 2)]); }
  let foam = '', grain = '';
  for (const i of [-1, 0, 1]) { const cx = x + i * w / 3, c = [cx + a * 0.1, y - a * 0.42]; foam += bandD(crPts(spiral(c, a * 0.62, PI * 0.95, 1.05, 1, 0.25, 14), 2), u => a * 0.36 * (1 - u) + 0.3); grain += dotD(cx + a * 0.95, y - a * 0.9, a * 0.13); }
  return s('g', {class: 'we-crest', 'data-mucha': 'whiplash'}, s('path', {d: bandD(base, t => a * 0.62 * Math.pow(Math.sin(PI * t), 0.4) + 0.4), class: 'we-wv2'}), s('path', {d: foam, class: 'we-foam'}), s('path', {d: grain, class: 'we-coin'}));
}
function torch(x, y, h, hx, hy) {
  const b = y - h * 0.1, X = (u, v) => [x + u * h, b - v * h];
  const cup = `M${r1(x - h * 0.3)} ${r1(y - h * 0.08)}Q${r1(x)} ${r1(y + h * 0.3)} ${r1(x + h * 0.3)} ${r1(y - h * 0.08)}Z`;
  let sp = ''; for (const [u, v, r] of [[-0.62, 1.72, 0.05], [0.64, 1.92, 0.045], [-0.34, 2.28, 0.04], [0.42, 2.4, 0.035]]) sp += dotD(...X(u, v), r * h);
  return s('g', {class: 'we-torch', 'data-held': 'torch'},
    taper([[hx, hy], [(hx + x) / 2, (hy + y) / 2], [x, y + 0.05 * h]], {w0: h * 0.075, w1: h * 0.1, cls: 'mk-gold'}),
    flame(x, b, h),
    s('path', {d: sp, class: 'we-fire3'}),
    s('path', {d: cup, class: 'mk-gold'}), s('path', {d: lens([[x - h * 0.3, y - h * 0.08], [x, y - h * 0.15], [x + h * 0.3, y - h * 0.08]], h * 0.06), class: 'mk-gold2'}));
}
/** 세 겹 금빛 파도 띠 — 두 손에서 넘쳐 굽이쳐 내림 · 물마루마다 안으로 말린 물거품 · 금 알갱이(그릇 없음) */
function waves(Q, h) {
  const C = crPts(Q, 10), n = C.length;
  const N = C.map((p, i) => { const a = C[Math.max(0, i - 1)], b = C[Math.min(n - 1, i + 1)]; const tx = b[0] - a[0], ty = b[1] - a[1], m = Math.hypot(tx, ty) || 1; return [-ty / m, tx / m]; });
  const off = (o, amp, ph) => C.map((p, i) => { const t = i / (n - 1), oo = (o + amp * Math.sin(t * 9 * PI + ph)) * h * Math.min(1, t * 5 + 0.15); return [p[0] + N[i][0] * oo, p[1] + N[i][1] * oo]; });
  const wf = (w0) => t => w0 * h * Math.min(1, t * 6 + 0.1) * (0.55 + 0.45 * Math.sin(PI * Math.min(1, t * 1.1 + 0.05))) + 0.4;
  const g = s('g', {class: 'we-wave', 'data-held': 'wave', 'data-mucha': 'whiplash'});
  g.append(s('path', {d: bandD(off(0.27, 0.1, 0), wf(0.34)), class: 'we-wv1'}), s('path', {d: bandD(off(0, 0.1, 1.4), wf(0.4)), class: 'we-wv2'}), s('path', {d: bandD(off(-0.25, 0.1, 2.8), wf(0.28)), class: 'we-wv3'}));
  let streak = '';
  for (const [o, ph] of [[0.1, 0.6], [-0.12, 2.0]]) { const q = off(o, 0.1, ph); for (const [a, b] of [[0.12, 0.3], [0.42, 0.6], [0.7, 0.86]]) streak += bandD(q.slice(Math.round(a * (n - 1)), Math.round(b * (n - 1))), u => 0.05 * h * Math.sin(PI * u) + 0.2); }
  g.append(s('path', {d: streak, class: 'we-streak'}));
  /* 물마루 — 바깥 가장자리에서 솟아 안으로 말린 물거품(작은 소용돌이) */
  let foam = '', grain = '';
  for (const [t, sg] of [[0.16, 1], [0.3, -1], [0.44, 1], [0.58, -1], [0.72, 1], [0.86, -1]]) {
    const i = Math.round(t * (n - 1)), p = C[i], nn = N[i], o = sg * 0.42 * h, b = [p[0] + nn[0] * o, p[1] + nn[1] * o];
    const a0 = Math.atan2(-nn[1] * sg, -nn[0] * sg), c = [b[0] + nn[0] * sg * 0.12 * h, b[1] + nn[1] * sg * 0.12 * h];
    foam += bandD(crPts(spiral(c, 0.21 * h, a0, 1.15, sg, 0.22, 16), 2), u => 0.13 * h * (1 - u) + 0.3);
    grain += dotD(b[0] + nn[0] * sg * 0.3 * h, b[1] + nn[1] * sg * 0.3 * h, 0.045 * h);
  }
  const e = C[n - 1];
  foam += bandD(crPts(spiral([e[0] - 0.1 * h, e[1] - 0.18 * h], 0.24 * h, 1.6, 1.1, 1, 0.25, 18), 2), u => 0.12 * h * (1 - u) + 0.4);
  g.append(s('path', {d: foam, class: 'we-foam'}), s('path', {d: grain, class: 'we-coin'}));
  return g;
}
/** 꽃다발 — 흰 들국 · 복숭아빛 장미 · 잎 · 아래로 늘어진 줄기와 리본 */
function bouquet(x, y, h) {
  let lv = '', da = '', ro = '', ce = '', st = '';
  for (const [dx, dy, a] of [[-0.52, 0.12, 200], [0.5, 0.1, -20], [-0.44, -0.32, 230], [0.42, -0.34, -50], [0.0, 0.44, 95], [-0.62, -0.05, 170], [0.58, 0.38, 10]]) lv += leafD(x + dx * h, y + dy * h, a * PI / 180, h * 0.44, h * 0.14);
  for (const [dx, dy, r] of [[0, -0.05, 0.28], [-0.31, 0.14, 0.21], [0.31, 0.16, 0.22], [-0.12, -0.37, 0.19], [0.2, -0.33, 0.18], [0.04, 0.33, 0.17]]) { da += petalsD(x + dx * h, y + dy * h, r * h, 10, 0.2, dx * 3); ce += dotD(x + dx * h, y + dy * h, r * h * 0.3); }
  for (const [dx, dy, r] of [[-0.42, -0.16, 0.16], [0.44, -0.08, 0.15], [-0.22, 0.42, 0.14]]) ro += petalsD(x + dx * h, y + dy * h, r * h, 5, 0.55, dx) + petalsD(x + dx * h, y + dy * h, r * h * 0.55, 5, 0.5, dx + 0.6);
  for (const [dx, a] of [[-0.12, 0.08], [0.0, -0.05], [0.12, 0.1], [0.24, -0.04]]) st += taper([[x + dx * h, y + 0.38 * h], [x + (dx + a) * h, y + 1.2 * h], [x + (dx - a) * h, y + 2.0 * h], [x + (dx + a * 2) * h, y + 2.5 * h]], {w0: h * 0.05, w1: h * 0.02}).getAttribute('d');
  return s('g', {class: 'we-bouq', 'data-held': 'bouquet'},
    s('path', {d: st, class: 'mk-vstem0'}),
    s('path', {d: lens([[x - 0.3 * h, y + 0.62 * h], [x, y + 0.7 * h], [x + 0.32 * h, y + 0.6 * h]], h * 0.14) + lens([[x + 0.02 * h, y + 0.68 * h], [x + 0.22 * h, y + 1.3 * h], [x + 0.06 * h, y + 1.9 * h]], h * 0.09), class: 'we-ribbon'}),
    s('path', {d: lv, class: 'mk-leaf'}), s('path', {d: ro, class: 'mk-fl-rose'}), s('path', {d: da, class: 'mk-fl-daisy'}), s('path', {d: ce, class: 'mk-fl-c'}));
}
/** 후광 — 잘리지 않은 온전한 원 · 빛살 · 모자이크 고리(금 · 남 · 녹) · 점 · 금 테 두 겹 */
function halo(cx, cy, r, hf) {
  const rm = r * 0.885, bw = r * 0.15, n = Math.max(15, Math.round(2 * PI * rm / 6.2 / 3) * 3), q = ['', '', ''];
  let dt = '';
  for (let i = 0; i < n; i++) {
    const a = i * 2 * PI / n, x = cx + rm * Math.cos(a), y = cy + rm * Math.sin(a), z = bw * 0.36, ca = Math.cos(a + PI / 4), sa = Math.sin(a + PI / 4);
    q[i % 3] += `M${r1(x + ca * z)} ${r1(y + sa * z)}L${r1(x - sa * z)} ${r1(y + ca * z)}L${r1(x - ca * z)} ${r1(y - sa * z)}L${r1(x + sa * z)} ${r1(y - ca * z)}Z`;
    const b = a + PI / n; dt += dotD(cx + rm * Math.cos(b), cy + rm * Math.sin(b), bw * 0.11);
  }
  return s('g', {class: 'we-halo'}, s('circle', {cx: r1(cx), cy: r1(cy), r: r1(r), class: hf}), rays(cx, cy, r * 0.3, r * 0.78, {n: 30}),
    s('circle', {cx: r1(cx), cy: r1(cy), r: r1(rm), class: 'mk-mob', 'stroke-width': r1(bw)}),
    s('path', {d: q[0], class: 'mk-mo-g'}), s('path', {d: q[1], class: 'mk-mo-b'}), s('path', {d: q[2], class: 'mk-mo-n'}), s('path', {d: dt, class: 'mk-mo-d'}),
    s('circle', {cx: r1(cx), cy: r1(cy), r: r1(r), class: 'we-hrim'}), s('circle', {cx: r1(cx), cy: r1(cy), r: r1(rm - bw / 2 - 0.8), class: 'we-hrim2'}));
}

/* ── 그림 ── */
export function picture(d, opt = {}) {
  const id = 'we' + (++UID);
  const lists = d?.lists ?? {};
  const ok = KEY.every(k => Array.isArray(lists[k]) && lists[k].length);
  const day = d?.asOf?.board ?? null;
  const svg = s('svg', {class: 'su-svg su-art4 su-women-e', viewBox: `0 0 ${W} ${H}`, role: 'img', preserveAspectRatio: 'xMidYMid meet',
    'aria-label': ok ? '세 여인 그림 · 불장 ' + lists.hot.length + '곳 · 꽃이 될 ' + lists.bloom.length + '곳 · 돈이 몰리는 ' + lists.money.length + '곳' + (day ? ' · ' + day + ' 자료' : '') : '세 여인 그림 · 자료 ' + NEED});
  /* 틀 자리 — 양옆 장식 판(폭 90 · 칸 테를 걷어 4 씩 좁힘) · 가운데 한 무대(아치 창 · 지난 판보다 10 넓음) · 아래 판 하나(맨 아래 8 단위는 꾸밈만) */
  const CL = 4, CR = 386, CW = 90, CT = 47, CB = 486, PT = 491, PB = 612, WL = CL + CW + 3, WR = CR - CW - 3, WS = 84, WT = 44, WX = (WL + WR) / 2, WRX = (WR - WL) / 2;
  const winD = `M${WL} ${CB}L${WL} ${WS}A${WRX} ${WS - WT} 0 0 1 ${WR} ${WS}L${WR} ${CB}Z`;
  /* 벽감 셋(겹친 아케이드) — [왼 · 오른 · 꼭대기] */
  const NI = [[WL, 180, 98], [152, 244, 52], [210, WR, 98]];
  const nicheD = ([a, b, top]) => { const rx = (b - a) / 2, ry = rx * 0.92; return `M${a} ${CB}L${a} ${r1(top + ry)}A${r1(rx)} ${r1(ry)} 0 0 1 ${b} ${r1(top + ry)}L${b} ${CB}Z`; };

  const defs = s('defs');
  defs.append(s('clipPath', {id: id + 'w'}, s('path', {d: winD})));
  const MR = 178, MY = 26; // 글씨가 앉는 띠 가운데 선(납작한 타원 한 호)
  defs.append(s('path', {id: id + 'a', d: `M${195 - MR} ${CT}A${MR} ${MY} 0 0 1 ${195 + MR} ${CT}`}));
  const ARC = (() => { const N = 400, Q = [], L = [0]; for (let i = 0; i <= N; i++) { const a = PI * (1 - i / N); Q.push([195 + Math.cos(a) * MR, CT - Math.sin(a) * MY]); if (i) L.push(L[i - 1] + Math.hypot(Q[i][0] - Q[i - 1][0], Q[i][1] - Q[i - 1][1])); } return {len: L[N], at: t => { const want = t * L[N]; let i = 1; while (i < N && L[i] < want) i++; return Q[i]; }}; })();
  svg.append(defs);

  /* 1 바탕 · 글씨 띠(아치 머리) · 한 무대 창 · 벽감 셋(살구 · 연두 · 옅은 금빛) */
  const outer = `M${CL} ${CT}A191 44 0 0 1 ${CR} ${CT}`;
  svg.append(s('rect', {x: 0, y: 0, width: W, height: H, rx: 18, class: 'we-p0'}),
    s('path', {d: outer + `L${WR} ${CT}L${WR} ${WS}A${WRX} ${WS - WT} 0 0 0 ${WL} ${WS}L${WL} ${CT}Z`, class: 'we-band'}),
    s('path', {d: winD, class: 'we-win'}));
  /* 창 안 옅은 동심원(벽감 뒤) */
  let rings = '';
  for (const r of [40, 62, 84, 106]) rings += `M${WX - r} 140a${r} ${r} 0 1 0 ${2 * r} 0a${r} ${r} 0 1 0 ${-2 * r} 0`;
  svg.append(s('g', {'clip-path': `url(#${id}w)`, 'data-mucha': 'pastel'}, s('path', {d: rings, class: 'we-rings'}),
    s('path', {d: nicheD(NI[1]), class: 'we-niche we-n1'}), s('path', {d: nicheD(NI[0]), class: 'we-niche we-n0'}), s('path', {d: nicheD(NI[2]), class: 'we-niche we-n2'}),
    s('path', {d: nicheD(NI[1]), class: 'we-nline'}), s('path', {d: nicheD(NI[0]), class: 'we-nline'}), s('path', {d: nicheD(NI[2]), class: 'we-nline'})));

  /* 2 별 · 초승달 · 해 — 창 아치 위 두 귀퉁이(글씨 띠 아래 · 창 밖) */
  let st = '';
  for (const [x, y, r] of [[124, 50, 2.6], [139, 44, 2.0], [266, 50, 2.6], [251, 44, 2.0]]) st += starD(x, y, r);
  svg.append(s('g', {'data-mucha': 'stars'}, s('path', {d: `M${WL + 15} 46A8 8 0 1 0 ${WL + 15} 62A11 11 0 0 1 ${WL + 15} 46Z`, class: 'we-moon'}), s('g', {class: 'we-twinkle'}, s('path', {d: st, class: 'we-star'})),
    s('path', {d: dotD(WR - 13, 54, 4.6), class: 'we-sun'}), rays(WR - 13, 54, 5.6, 9.6, {n: 14})));

  /* 3 후광 셋(온전한 원 · 머리의 두 배) · 세 여인(가운데가 뒤 · 양옆이 앞) */
  /* 얼굴 셋을 달리 — 불장 = ¾ 로 위를 봄 · 꽃이 될 = 반대쪽 ¾ 로 꽃다발에 고개를 숙임 · 돈이 몰리는 = 옆얼굴 · 옷 = 복숭아 · 연두 · 황토(색은 css) */
  const F = {
    hot: {k: 'hot', x: 140, y: 88, h: 38, sy: 1.12, dir: 1, view: 'three', tilt: -8, tone: 0, cloth: 'peach', iris: 0, seed: 2, hf: 'mk-hf2'},
    bloom: {k: 'bloom', x: 199, y: 79, h: 39, sy: 1.15, dir: -1, view: 'three', tilt: 10, tone: 1, cloth: 'sage', iris: 1, seed: 5, hf: 'mk-hf0'},
    money: {k: 'money', x: 256, y: 89, h: 38, sy: 1.12, dir: -1, view: 'profile', tilt: -4, tone: 5, cloth: 'cream', iris: 2, seed: 8, hf: 'mk-hf1'},
  };
  const people = s('g', {'clip-path': `url(#${id}w)`, 'data-mucha': 'outline'});
  const halos = s('g', {'data-mucha': 'halo'});
  /* 후광 — 머리 뒤 큰 원(가운데가 가장 큼 · 위는 무대 아치가 덮음) */
  for (const k of ['bloom', 'hot', 'money']) { const f = F[k]; halos.append(halo(f.x + (k === 'hot' ? -2 : 2), f.y + 0.06 * f.h, f.h * (k === 'bloom' ? 1.3 : 1.16), f.hf)); }
  people.append(halos);
  for (const k of ['bloom', 'hot', 'money']) people.append(lady(F[k]));
  /* 발치 꽃밭 — 무대 바닥(꽃만 살랑임) */
  let lv = '', da = '', po = '', ce = '', ce2 = '';
  const meadow = [[102, 478, 'p'], [128, 482, 'd'], [168, 481, 'd'], [196, 483, 'p'], [226, 481, 'd'], [264, 482, 'd'], [288, 478, 'p']];
  for (const [i, [x, y]] of meadow.entries()) lv += leafD(x - 2, y + 6, (200 + i * 17) * PI / 180, 13, 4) + leafD(x + 2, y + 6, (-30 - i * 9) * PI / 180, 12, 3.6);
  const nod = [s('g', {class: 'we-nod we-nod0'}), s('g', {class: 'we-nod we-nod1'})];
  for (const [i, [x, y, kind]] of meadow.entries()) {
    if (kind === 'p') { po += petalsD(x, y, 7, 5, 0.55, i); ce2 += dotD(x, y, 2.2); } else { da += petalsD(x, y, 6.2, 10, 0.2, i); ce += dotD(x, y, 1.8); }
  }
  nod[0].append(s('path', {d: po, class: 'mk-fl-poppy'}), s('path', {d: ce2, class: 'mk-fl-c2'}));
  nod[1].append(s('path', {d: da, class: 'mk-fl-daisy'}), s('path', {d: ce, class: 'mk-fl-c'}));
  people.append(s('g', {'data-mucha': 'vine'}, s('path', {d: `M${WL} 482C140 470 170 484 195 476C222 484 252 470 ${WR} 482L${WR} ${CB}L${WL} ${CB}Z`, class: 'we-ground'}), s('path', {d: lv, class: 'mk-leaf'}), nod));
  svg.append(people);

  /* 4 창 금테 · 글씨 띠 금선 두 겹 */
  svg.append(s('g', {'data-mucha': 'arch'}, s('path', {d: winD, class: 'we-arch'}), s('path', {d: outer, class: 'we-arch'}),
    s('path', {d: `M${CL + 5} ${CT}A186 39.5 0 0 1 ${CR - 5} ${CT}`, class: 'we-arch2'})));

  /* 5 꽃 덩굴 띠 — 창 밑을 가로질러 양옆 판 · 아래 판과 이음 */
  const vy = 488.6;
  let vl = '', vf = '', vc = '';
  for (let x = 14, i = 0; x < W - 10; x += 21, i++) { vl += leafD(x, vy, (i % 2 ? -0.5 : 0.5) - (i % 2 ? 0 : PI), 8, 2.6) + leafD(x + 4, vy, (i % 2 ? 0.4 : -0.4), 7, 2.3); if (i % 3 === 1) { vf += petalsD(x + 10, vy, 3.6, 5, 0.55, i); vc += dotD(x + 10, vy, 1.2); } }
  svg.append(s('g', {'data-mucha': 'vine'}, taper([[CL + 2, vy + 0.6], [100, vy - 0.8], [195, vy + 0.6], [290, vy - 0.8], [CR - 2, vy + 0.6]], {w0: 1.6, w1: 0.9, cls: 'we-vst'}),
    s('path', {d: vl, class: 'mk-leaf'}), s('path', {d: vf, class: 'mk-fl-rose'}), s('path', {d: vc, class: 'mk-fl-c'})));

  /* 6 글씨 — 아치 띠 세 말(한 호 위 · 같은 크기 · 글 넓이를 재어 사이를 같게 · 사이마다 보석 하나) · 이름표 21개 */
  const let9 = s('g', {'data-mucha': 'lettering'});
  svg.append(let9);
  const word = (t, at, k) => {
    const tx = s('text', {class: 'we-aw we-aw-' + k, 'text-anchor': 'middle', 'dominant-baseline': 'central'});
    const tp = s('textPath', {href: '#' + id + 'a', startOffset: r1(at) + '%', text: t});
    tp.setAttributeNS('http://www.w3.org/1999/xlink', 'xlink:href', '#' + id + 'a');
    tx.append(tp); return tx;
  };
  const ww = KEY.map(k => est(KIND[k], 20) + [...KIND[k]].length * 1.2), use = ARC.len * 0.84, gap = (use - ww.reduce((a, b) => a + b, 0)) / 2;
  let at = (ARC.len - use) / 2;
  KEY.forEach((k, i) => {
    let9.append(word(KIND[k], (at + ww[i] / 2) / ARC.len * 100, k)); at += ww[i];
    if (i < KEY.length - 1) { const [px, py] = ARC.at((at + gap / 2) / ARC.len); let9.append(s('path', {d: `M${r1(px)} ${r1(py - 4.5)}L${r1(px + 3.6)} ${r1(py)}L${r1(px)} ${r1(py + 4.5)}L${r1(px - 3.6)} ${r1(py)}Z`, class: 'we-gem'})); at += gap; }
  });

  if (!ok) {
    let9.append(s('text', {x: 195, y: 552, 'text-anchor': 'middle', 'dominant-baseline': 'central', class: 'we-need', text: NEED}));
    return svg;
  }
  const items = k => (lists[k] ?? []).slice(0, 7).map(c => ({k, code: String(c.code ?? ''), name: String(c.name ?? NEED), val: valText(c, k), star: Array.isArray(c.in) && c.in.length > 1}));
  const tags = [], PAD = 4, INK = px => 0.42 * px, MIN = 60.8; // INK = 굵은 글 먹 반높이 어림 · MIN = 누름 자리 높이
  /** 이름 하나 — 누르는 자리 = 칸 전체(투명 · 높이 60 넘게) · 글은 판 위에 가운데 맞춤 · cyT = 글 덩이 가운데 · lhT = 줄 사이 · 빈 줄은 자리만 */
  const tag = (it, x0, y0, w, hh, L, cyT, lhT) => {
    const a = s('a', {href: '#/c/' + encodeURIComponent(it.code), class: 'we-tag we-tag-' + it.k, 'data-k': it.k, 'data-name': it.name,
      'aria-label': it.name + ' · ' + KIND[it.k] + ' · ' + it.val + (it.star ? ' · 두 목록에 함께' : '')});
    a.append(s('rect', {x: r1(x0), y: r1(y0), width: r1(w), height: r1(hh), rx: 9, class: 'we-hit'}));
    const nW = w - 2 * PAD, n = L.rows.length, cx = x0 + w / 2;
    L.rows.forEach((row, j) => {
      if (!row.t) return;
      const px = row.v ? 18 : L.px, tx = s('text', {x: r1(cx), y: r1(cyT + (j - (n - 1) / 2) * lhT), 'text-anchor': 'middle', 'dominant-baseline': 'central', class: row.v ? 'we-val we-v-' + it.k : 'we-name we-n' + px, text: row.t});
      if (est(row.t, px) > nW) { tx.setAttribute('textLength', r1(nW)); tx.setAttribute('lengthAdjust', 'spacingAndGlyphs'); }
      a.append(tx);
    });
    return a;
  };
  /** 장식 판 — 바탕 · 가는 금 테(옆 판은 머리가 아치 · 꼭대기에 불꽃이나 금빛 물마루) · 옆 판은 틈 한가운데 잔가지 · 아래 판은 덩굴손 */
  const panel = (x0, y0, w, hh, tone, cuts, head) => {
    const q = 2.8, rr = 9, rect = (i, r) => `M${r1(x0 + i + r)} ${r1(y0 + i)}H${r1(x0 + w - i - r)}A${r} ${r} 0 0 1 ${r1(x0 + w - i)} ${r1(y0 + i + r)}V${r1(y0 + hh - i - r)}A${r} ${r} 0 0 1 ${r1(x0 + w - i - r)} ${r1(y0 + hh - i)}H${r1(x0 + i + r)}A${r} ${r} 0 0 1 ${r1(x0 + i)} ${r1(y0 + hh - i - r)}V${r1(y0 + i + r)}A${r} ${r} 0 0 1 ${r1(x0 + i + r)} ${r1(y0 + i)}Z`;
    const ah = head === 'fire' ? 20 : head === 'wave' ? 14 : 0, xl = x0 + q, xr = x0 + w - q, yb = y0 + hh - q, ri = rr - 2.3;
    const fr = ah ? `M${r1(xl)} ${r1(yb - ri)}V${r1(y0 + q + ah)}A${r1((xr - xl) / 2)} ${ah} 0 0 1 ${r1(xr)} ${r1(y0 + q + ah)}V${r1(yb - ri)}A${r1(ri)} ${r1(ri)} 0 0 1 ${r1(xr - ri)} ${r1(yb)}H${r1(xl + ri)}A${r1(ri)} ${r1(ri)} 0 0 1 ${r1(xl)} ${r1(yb - ri)}Z` : rect(q, ri);
    let lf = '', fl = '', fc = '', tw = '';
    for (const c of cuts) {
      if (head) { // 옆 판 — 틈 한가운데 잔가지(틈이 좁으면 작게 · 위아래 글과 8 넘게)
        const [x, y, gp] = c, k = Math.max(0.55, Math.min(1, (gp - 16) / 2 / 3.9));
        fl += petalsD(x, y, 3.9 * k, 5, 0.55, 0.3); fc += dotD(x, y, 1.3 * k);
        lf += leafD(x - 3.2 * k, y, PI + 0.1, 10 * k, 2.4 * k) + leafD(x + 3.2 * k, y, -0.1, 10 * k, 2.4 * k) + leafD(xl, y, 0.3, 7 * k, 2 * k) + leafD(xr, y, PI - 0.3, 7 * k, 2 * k);
      } else { // 아래 판 — 위 테에서 내려오는(윗줄) · 아래 테에서 오르는(아랫줄) 덩굴손 · 끝에 꽃봉오리
        const [x, ya, yz] = c, sg = yz > ya ? 1 : -1, L = Math.abs(yz - ya);
        tw += bandD(crPts([[x, ya], [x + 2.4, ya + sg * L * 0.35], [x - 2.4, ya + sg * L * 0.7], [x, yz]], 6), t => 1.3 * (1 - t) + 0.35);
        lf += leafD(x + 1.4, ya + sg * L * 0.3, sg * 1.2, 7.5, 2) + leafD(x - 1.4, ya + sg * L * 0.62, PI - sg * 1.2, 7, 1.9);
        fl += petalsD(x, yz, 3.4, 5, 0.55, 0.3); fc += dotD(x, yz, 1.1);
      }
    }
    for (const [cx0, sg] of [[x0 + q + rr * 0.9, 1], [x0 + w - q - rr * 0.9, -1]]) tw += thin(crPts(spiral([cx0, y0 + q + 5.4], 3.6, sg > 0 ? PI * 1.1 : -PI * 0.1, 0.9, sg, 0.35, 12), 2), 1.3);
    const g = s('g', {'data-mucha': 'panel'}, s('path', {d: rect(0.5, rr), class: 'we-pan we-pan-' + tone}), s('path', {d: fr, class: 'we-pfr'}),
      s('path', {d: tw, class: 'we-vst'}), s('path', {d: lf, class: 'mk-leaf'}), s('path', {d: fl, class: 'mk-fl-rose'}), s('path', {d: fc, class: 'mk-fl-c'}));
    if (head === 'fire') g.append(flame(x0 + w / 2, y0 + q + ah - 1.5, 8));
    if (head === 'wave') g.append(crest(x0 + w / 2, y0 + q + ah - 4.5, 44));
    return g;
  };
  const hot = items('hot'), money = items('money'), bloom = items('bloom');
  /* 양옆 — 판 하나에 이름 일곱 · 글 덩이 위아래 끝을 재어 틈을 고르게 · 잔가지는 틈 한가운데 · 누름 자리는 틈 안에서 60.5 넘게 */
  const side = (list, x0, tone, head) => {
    const Ls = list.map(it => lay(it, CW - 2 * PAD, false, CW - 2 * PAD));
    const ext = Ls.map(L => { const n = L.rows.length, lh = n === 3 ? 19.5 : 20; return [(n - 1) / 2 * lh + INK(L.px), (n - 1) / 2 * lh + INK(18), lh]; });
    const T0 = CT + (head === 'fire' ? 31 : 27), B1 = CB - 2.8 - 8, n = list.length;
    const gap = (B1 - T0 - ext.reduce((a, e) => a + e[0] + e[1], 0)) / Math.max(1, n - 1), lo = [], hi = [], cy = [];
    let y = T0;
    ext.forEach(([u, d]) => { lo.push(y); cy.push(y + u); y += u + d; hi.push(y); y += gap; });
    const b = [CT];
    for (let i = 1; i < n; i++) b.push((hi[i - 1] + lo[i]) / 2);
    b.push(CB);
    for (let i = 1; i < n; i++) b[i] = Math.max(b[i], b[i - 1] + MIN); // 틈 한가운데에서 시작해 앞에서 · 뒤에서 한 번씩 밀어 모두 60.8 넘게
    for (let i = n - 1; i >= 1; i--) b[i] = Math.min(b[i], b[i + 1] - MIN);
    const cuts = [];
    list.forEach((it, i) => { if (i) cuts.push([x0 + CW / 2, (hi[i - 1] + lo[i]) / 2, gap]); tags.push(tag(it, x0, b[i], CW, b[i + 1] - b[i], Ls[i], cy[i], ext[i][2])); });
    svg.insertBefore(panel(x0, CT, CW, CB - CT, tone, cuts, head), let9);
  };
  side(hot, CL, 'hot', 'fire'); side(money, CR - CW, 'money', 'wave');
  /* 머리채 넘침 — 양옆 여인의 머리 다발이 무대 아치를 넘어 이름 판 머리에서 말림(판 위 · 글 아래 · 이름 글과 8 넘게) */
  /* 가는 가닥 다섯을 묶은 다발 — 뿌리 굵게(1.9) 끝 가늘게 · 가닥마다 끝 말림 크기 · 길이가 다름 */
  const spill = (pts, sg, tone, sw) => {
    let d = '', e = '';
    [[-3.6, 1.0, 5.2], [-1.6, 0.9, 4.0], [0.4, 1.0, 6.0], [2.2, 0.86, 3.6], [4.0, 0.94, 4.6]].forEach(([o, len, r], i) => {
      const Q = crPts(pts.map(([x, y], j) => [x, y + o * (0.35 + 0.65 * j / (pts.length - 1))]), 8), cut = Q.slice(0, Math.max(3, Math.round(Q.length * len)));
      const band = bandD(curlEnd(cut, r, sg, 1.1), u => 1.9 * Math.pow(1 - u, 0.8) + 0.35);
      if (i === 0 || i === 4) e += band; else d += band;
    });
    return s('g', {class: 'mk-hair mk-t' + tone + ' we-spill', 'data-mucha': 'whiplash'}, s('g', {class: sw}, s('path', {d: e, class: 'mk-hd'}), s('path', {d, class: 'mk-hb'})));
  };
  svg.insertBefore(spill([[118, 80], [106, 72], [94, 67], [82, 66], [72, 64]], -1, F.hot.tone, 'mk-sway2'), let9);
  svg.insertBefore(spill([[276, 80], [288, 72], [299, 67], [309, 66], [318, 64]], 1, F.money.tone, 'mk-sway'), let9);
  /* 아래 — 꽃이 될 일곱(차례 그대로 두 줄) · 「싹」은 언제나 이름 바로 아래 같은 자리 · 긴 이름은 낱말 경계에서 두 줄 · 칸 사이는 덩굴손 */
  const SEPW = 30, AV = CR - CL - 2 * (2.8 + 8), sw = it => (it.star ? '✦ ' : '');
  const plan = row => {
    const room = AV - SEPW * Math.max(0, row.length - 1), sp = row.map(() => false);
    const wOf = (it, i, px) => Math.max(sp[i] ? Math.max(...split2(it.name).map((t, j) => est((j ? '' : sw(it)) + t, px))) : est(sw(it) + it.name, px), est(it.val, 18));
    for (const px of [20, 19, 18]) { const w = row.map((it, i) => wOf(it, i, px)); if (w.reduce((a, c) => a + c, 0) <= room) return {lines: 2, px, sp, w}; }
    let w = row.map((it, i) => wOf(it, i, 18));
    for (const i of row.map((_, i) => i).sort((a, c) => w[c] - w[a])) { if (w.reduce((a, c) => a + c, 0) <= room) break; sp[i] = true; w = row.map((it, j) => wOf(it, j, 18)); }
    return {lines: 3, px: 18, sp, w};
  };
  let best = null;
  for (const kk of [4, 3, 5, 2]) {
    if (kk >= bloom.length && bloom.length > 1) continue;
    const R = [plan(bloom.slice(0, kk)), plan(bloom.slice(kk))], sc = (R[0].lines + R[1].lines) * 10 + (R[0].lines > R[1].lines ? 3 : 0) + Math.abs(kk - bloom.length / 2);
    if (!best || sc < best.sc) best = {sc, kk, R};
  }
  const TT = PT + 2.8 + 8, TB = PB - 2.8 - 8, ext2 = p => (p.lines === 3 ? [18.5 + INK(18), 18.5 + INK(18), 18.5] : [10 + INK(p.px), 10 + INK(18), 20]);
  const [A, Bq] = best.R, eA = ext2(A), eB = ext2(Bq), cyA = TT + eA[0], cyB = TB - eB[1];
  const mid = Math.max(CB + MIN, Math.min(PB - MIN, (cyA + eA[1] + cyB - eB[0]) / 2));
  const rowsB = [[bloom.slice(0, best.kk), A, cyA, CB, mid], [bloom.slice(best.kk), Bq, cyB, mid, PB]].filter(r => r[0].length);
  if (rowsB.length === 1) { const r = rowsB[0], e = ext2(r[1]); r[2] = (TT + TB) / 2 + (e[0] - e[1]) / 2; r[3] = CB; r[4] = PB; }
  const cutsB = [];
  rowsB.forEach(([row, p, cyR, y0, y1], ri) => {
    const spare = (CR - CL - p.w.reduce((a, c) => a + c, 0)) / row.length;
    let x = CL;
    row.forEach((it, j) => {
      const cw = p.w[j] + spare, st = sw(it), [na, nb] = split2(it.name);
      const rows = p.lines === 2 ? [{t: st + it.name}, {t: it.val, v: 1}] : p.sp[j] ? [{t: st + na}, {t: nb}, {t: it.val, v: 1}] : [{t: ''}, {t: st + it.name}, {t: it.val, v: 1}];
      tags.push(tag(it, x, y0, cw, y1 - y0, {px: p.px, rows}, cyR, ext2(p)[2]));
      x += cw;
      if (j < row.length - 1) cutsB.push(ri === 0 ? [x, PT + 2.8, cyR + 2] : [x, PB - 2.8, cyR - 2]);
    });
  });
  svg.insertBefore(panel(CL, PT, CR - CL, PB - PT, 'bloom', cutsB, null), let9);
  let9.append(...tags);
  return svg;
}
