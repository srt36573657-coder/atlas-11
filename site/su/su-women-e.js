/* 수르 — 첫 화면 세 여인(su-women-e · 넷째 판 다른 안 · docs/design/su-musk-2026-11-05/r4-brief.md 「W2」 · judge-r3.md 공통 여덟)
   짜임: 한 무대 — 큰 아치 창 하나에 세 여인이 나란히 섬 · 여인마다 제 아치 벽감(살구 · 연두 · 옅은 금빛)과 잘리지 않은 온전한 후광
   몸: 8등신 · 허리 잘록 · 골반 둥글게 · 골반에서 발치로 S 로 휘는 큰 주름 넷 · 바깥선은 굵다가 가늘게 · 치맛자락은 발치에서 소용돌이로 말림
   자세: 불장 = 불꽃을 머리 위로 높이 듦 · 꽃이 될 = 고개를 기울이고 꽃다발을 가슴에 · 돈이 몰리는 = 엉덩이를 뺀 S 자 · 두 손에서 넘쳐 꽃 띠까지 굽이쳐 내리는 세 겹 금빛 파도 띠
   이름표 21 = 위가 둥근 아치 판(부품 plaque) · 양옆 판은 가는 덩굴로 이어진 세로 장식 판 · 아래 일곱과는 꽃 덩굴 띠로 이음
   보안 규칙: createElementNS · setAttribute 만(글 속 style 없음) · 꾸밈은 su-women-e.css 와 부품 꾸밈 클래스 */
import {s} from '/su/su-fig.js';
import {taper, strands, face, hair, sleeve, rays, plaque} from './su-mucha-kit.js';

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
/** 칸에 들어갈 가장 좁은 글 넓이(두 줄 꼴 가운데) — 아래 칸 넓이 나누기에 씀 */
function needW(it, tailOK) {
  const star = it.star ? '✦ ' : '', [a, b] = split2(it.name);
  const one = Math.max(est(star + it.name, 18), est(it.val, 18));
  return tailOK ? Math.min(one, Math.max(est(star + a, 18), est(b + ' ' + it.val, 18))) : one;
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

/* ── 여인 하나 — 제 자리(얼굴 가운데 0,0 · 얼굴은 +x 쪽을 봄 · 단위 h = 이마 위 ~ 턱 끝 · 머리 높이 ≈ 1.2h · 8등신 = 발치 9h) ── */
/* 긴 옷 — 목 · 손목 · 발목까지 · 어깨 1.2h · 허리 0.8h(잘록) · 골반 1.3h(둥글게) · 무릎 아래에서 퍼져 발치에 고임 */
const G_BACK = [[-0.2, 0.9], [-0.5, 1.02], [-0.64, 1.18], [-0.66, 1.5], [-0.6, 2.0], [-0.45, 2.58], [-0.41, 2.92], [-0.62, 3.42], [-0.78, 3.95], [-0.77, 4.6], [-0.69, 5.6], [-0.75, 6.6], [-0.92, 7.5], [-1.14, 8.3], [-1.34, 8.86]];
const G_HEM = [[-1.34, 8.86], [-1.0, 9.04], [-0.45, 8.94], [0.08, 9.05], [0.6, 8.92], [1.04, 8.8]];
const G_FRONT = [[1.04, 8.8], [0.92, 8.2], [0.74, 7.4], [0.62, 6.5], [0.6, 5.5], [0.66, 4.5], [0.7, 3.88], [0.56, 3.3], [0.38, 2.92], [0.42, 2.6], [0.58, 2.2], [0.63, 1.8], [0.6, 1.38], [0.5, 1.08], [0.2, 0.9]];
const GOWN = [...G_BACK, ...G_HEM.slice(1, -1), ...G_FRONT];
/* 큰 주름 넷 — 앞 골반 한 곳에서 부채처럼 갈라져 S 로 휘며 발치의 말린 자락으로(가늘게 · 가운데만 조금 굵게) */
const FOLDS = [
  [[0.28, 3.25], [-0.12, 4.2], [-0.5, 5.4], [-0.66, 6.6], [-1.0, 7.9], [-1.12, 8.72]],
  [[0.32, 3.45], [0.02, 4.7], [-0.3, 6.0], [-0.4, 7.3], [-0.62, 8.86]],
  [[0.38, 3.7], [0.22, 5.0], [0.0, 6.4], [0.06, 7.7], [0.0, 8.98]],
  [[0.46, 3.95], [0.42, 5.2], [0.5, 6.6], [0.62, 7.8], [0.82, 8.7]]];
/* 몸의 휨(높이 → 옆으로) — 셋이 다름 */
const BEND = {
  hot: [[-1.2, 0.06], [1.0, 0.0], [2.9, -0.1], [3.9, -0.24], [5.6, -0.06], [7.6, 0.1], [9.0, 0.16]],
  bloom: [[-1.2, 0.2], [1.0, 0.05], [2.9, -0.12], [3.9, -0.3], [5.6, -0.08], [7.6, 0.12], [9.0, 0.22]],
  money: [[-1.2, 0.3], [1.0, 0.14], [2.9, -0.2], [3.9, -0.52], [5.6, -0.28], [7.6, 0.02], [9.0, 0.14]],
};
/* 금빛 파도 띠의 등줄기(돈이 몰리는 여인 · 두 손 → 몸 앞을 S 로 가로질러 → 발치 꽃 띠) */
const WAVE = [[0.5, 2.74], [0.92, 3.3], [1.12, 4.1], [0.78, 4.95], [0.1, 5.6], [-0.5, 6.35], [-0.86, 7.25], [-0.62, 8.1], [-0.84, 8.9], [-1.02, 9.25]];

/** 여인 — o: {k, x, y(얼굴 가운데) · h · dir(1 = 오른쪽을 봄) · tilt · tone(머리) · cloth · iris · seed} */
function lady(o) {
  const {k, h} = o, bend = bendFn(BEND[k]), b0 = bend(0);
  const P = pts => pts.map(([u, v]) => [(u + bend(v) - b0) * h, v * h]);
  const g = s('g', {class: 'we-w we-' + k, 'data-body': k, transform: `translate(${r1(o.x)} ${r1(o.y)})` + (o.dir < 0 ? ' scale(-1 1)' : '')});
  const T = 'mk-hair mk-t' + o.tone, cl = o.cloth;
  /* 1 등 뒤 머리 — 어깨 밖으로 말리는 굵은 다발 */
  const hb = P([[-0.4, -0.45], [-0.8, 0.1], [-0.94, 0.85], [-1.02, 1.55], [-1.3, 2.05]]);
  g.append(s('g', {class: T, 'data-mucha': 'whiplash'}, s('g', {class: 'mk-sway'},
    strands(hb, {n: 3, spread: h * 0.32, w0: h * 0.17, w1: 0.4, curl: 1, seed: o.seed * 3 + 1, cls: 'mk-hb'}),
    strands(hb, {n: 2, spread: h * 0.22, w0: h * 0.05, w1: 0.15, curl: 1, seed: o.seed * 3 + 2, cls: 'mk-hd'}))));
  const head = s('g', {transform: `rotate(${o.tilt})`}, hair({cx: 0, cy: 0, h, dir: 1, tone: o.tone, len: 2.6, seed: o.seed, view: 'three'}));
  g.append(head);
  /* 2 긴 옷 · 말린 치맛자락 · 큰 주름 넷 · 굵다가 가늘어지는 바깥선 */
  const curlB = spiral([-1.08, 8.58], 0.36, 2.33, 1.15, 1), curlF = spiral([0.86, 8.62], 0.23, 0.9, 1.05, -1);
  g.append(s('path', {d: dotD(...P([[-1.08, 8.58]])[0], h * 0.34) + dotD(...P([[0.86, 8.62]])[0], h * 0.21), class: 'mk-cl-' + cl}),
    s('path', {d: closedD(P(GOWN)), class: 'mk-cl-' + cl}));
  for (const f of FOLDS) g.append(s('path', {d: lens(P(f), h * 0.07, 0.9), class: 'mk-cld-' + cl}));
  g.append(s('path', {d: lens(P([[-0.4, 1.45], [-0.24, 1.95], [-0.02, 2.2]]), h * 0.05) + lens(P([[0.12, 1.5], [0.2, 2.0], [0.34, 2.3]]), h * 0.045), class: 'mk-cld-' + cl}));
  g.append(taper(P(G_BACK), {w0: h * 0.06, w1: h * 0.13, cls: 'mk-ink'}), taper(P(G_FRONT.slice().reverse()), {w0: h * 0.05, w1: h * 0.1, cls: 'mk-ink'}),
    s('path', {d: lens(P(G_HEM), h * 0.06), class: 'mk-ink2'}),
    taper(P(curlB), {w0: h * 0.11, w1: 0.4, cls: 'mk-ink'}), taper(P(curlF), {w0: h * 0.08, w1: 0.35, cls: 'mk-ink'}));
  /* 허리 띠 · 앞으로 늘어진 띠 끝 */
  g.append(s('path', {d: lens(P([[-0.45, 2.78], [-0.1, 2.92], [0.2, 2.92], [0.42, 2.78]]), h * 0.15), class: 'mk-gold'}),
    taper(P([[0.3, 2.92], [0.44, 3.55], [0.32, 4.25], [0.46, 4.95]]), {w0: h * 0.1, w1: 0.5, cls: 'mk-gold2'}));
  /* 3 얼굴(부품) · 높은 깃 · 보석 */
  const sl = (from, to, hand, w = h * 0.44) => { const [a, b] = P([from, to]), vx = b[0] - a[0], vy = b[1] - a[1]; return sleeve({x: r1(a[0]), y: r1(a[1]), ang: r1(Math.atan2(-vx, vy) * 180 / PI), len: Math.max(8, Math.hypot(vx, vy) - w * 0.32), w, hand, dir: 1, tone: cl}); };
  const fc = s('g', {transform: `rotate(${o.tilt})`}, face({cx: 0, cy: 0, h, dir: 1, view: 'three', tilt: 0, iris: o.iris}), diadem(k, h));
  const collar = s('path', {d: closedD([[-0.27, 0.74], [0, 0.8], [0.27, 0.74], [0.31, 0.95], [0, 1.02], [-0.31, 0.95]].map(([u, v]) => [u * h, v * h])), class: 'mk-collar'});
  const gem = s('path', {d: dotD(0, 1.0 * h, h * 0.055), class: 'mk-gem-' + (k === 'hot' ? 'r' : k === 'bloom' ? 'g' : 'b')});
  g.append(fc, collar, gem);
  /* 4 자세와 든 것 */
  if (k === 'hot') { // 앞 손은 골반에 · 뒤 손은 불꽃을 머리 위로 높이 듦
    g.append(sl([0.5, 1.12], [0.7, 3.05], 'rest', h * 0.42));
    const [hx, hy] = P([[-1.0, -1.38]])[0];
    g.append(torch(hx, hy, h), sl([-0.52, 1.12], [-1.0, -1.38], 'hold', h * 0.4));
  } else if (k === 'bloom') { // 두 팔로 꽃다발을 가슴에 안음
    g.append(sl([0.48, 1.1], [0.66, 2.3], 'hold', h * 0.46));
    const [cx, cy] = P([[0.3, 1.92]])[0];
    g.append(bouquet(cx, cy, h), sl([-0.5, 1.1], [0.18, 2.55], 'hold', h * 0.46));
  } else { // 두 손 사이로 금빛 파도가 넘쳐 몸 앞을 S 로 가로질러 꽃 띠까지
    g.append(sl([0.48, 1.1], [0.68, 2.6], 'hold', h * 0.42), waves(P(WAVE), h), sl([-0.5, 1.12], [0.34, 2.8], 'hold', h * 0.42));
  }
  /* 5 어깨 앞으로 흘러 밖으로 말리는 머리 한 다발 · 머리 장식 */
  return g;
}
/** 머리 장식 — 불장 = 붉은 양귀비 · 꽃이 될 = 흰 들국 화관 · 돈이 몰리는 = 금 동전 머리띠 */
function diadem(k, h) {
  const A = a => [(-0.12 + 0.5 * Math.cos(a * PI / 180)) * h, (-0.3 + 0.45 * Math.sin(a * PI / 180)) * h];
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
/** 횃불 — 높이 든 손(x, y)이 쥔 금 자루 · 위에 잔 · 세 겹 불꽃 · 불티 */
function torch(x, y, h) {
  const top = y - 0.8 * h, fl = (x0, y0, hh, w) => `M${r1(x0)} ${r1(y0)}C${r1(x0 - w)} ${r1(y0 - hh * 0.3)} ${r1(x0 - w * 0.75)} ${r1(y0 - hh * 0.72)} ${r1(x0 - w * 0.08)} ${r1(y0 - hh)}C${r1(x0 + w * 0.1)} ${r1(y0 - hh * 0.78)} ${r1(x0 + w * 0.5)} ${r1(y0 - hh * 0.76)} ${r1(x0 + w * 0.45)} ${r1(y0 - hh * 0.92)}C${r1(x0 + w * 1.05)} ${r1(y0 - hh * 0.55)} ${r1(x0 + w * 0.85)} ${r1(y0 - hh * 0.15)} ${r1(x0)} ${r1(y0)}Z`;
  const cup = `M${r1(x - h * 0.28)} ${r1(top - h * 0.1)}Q${r1(x)} ${r1(top + h * 0.26)} ${r1(x + h * 0.28)} ${r1(top - h * 0.1)}Z`;
  let sp = ''; for (const [dx, dy, r] of [[-0.42, -0.85, 0.06], [0.4, -1.0, 0.05], [-0.2, -1.28, 0.045], [0.28, -1.4, 0.035]]) sp += dotD(x + dx * h, top + dy * h, r * h);
  return s('g', {class: 'we-torch', 'data-held': 'torch'},
    taper([[x + 0.02 * h, y + 0.55 * h], [x, y], [x - 0.01 * h, top]], {w0: h * 0.07, w1: h * 0.1, cls: 'mk-gold'}),
    s('path', {d: cup, class: 'mk-gold'}), s('path', {d: lens([[x - h * 0.28, top - h * 0.1], [x, top - h * 0.16], [x + h * 0.28, top - h * 0.1]], h * 0.06), class: 'mk-gold2'}),
    s('g', {class: 'we-flame'}, s('path', {d: fl(x, top - h * 0.12, h * 1.2, h * 0.4), class: 'we-fire'}), s('path', {d: fl(x + h * 0.02, top - h * 0.14, h * 0.86, h * 0.29), class: 'we-fire2'}),
      s('path', {d: fl(x + h * 0.02, top - h * 0.16, h * 0.48, h * 0.15), class: 'we-fire3'})), s('path', {d: sp, class: 'we-fire3'}));
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
  /* 틀 자리 — 양옆 장식 판(폭 92) · 가운데 한 무대(아치 창) · 아래 판 두 줄(맨 아래 8 단위는 꾸밈만) */
  const CL = 4, CR = 386, CW = 94, CT = 47, CB = 486, PT = 491, PB = 612, WL = CL + CW + 4, WR = CR - CW - 4, WS = 84, WT = 44, WX = (WL + WR) / 2, WRX = (WR - WL) / 2;
  const winD = `M${WL} ${CB}L${WL} ${WS}A${WRX} ${WS - WT} 0 0 1 ${WR} ${WS}L${WR} ${CB}Z`;
  /* 벽감 셋(겹친 아케이드) — [왼 · 오른 · 꼭대기] */
  const NI = [[WL, 178, 110], [151, 239, 62], [212, WR, 110]];
  const nicheD = ([a, b, top]) => { const rx = (b - a) / 2, ry = rx * 0.92; return `M${a} ${CB}L${a} ${r1(top + ry)}A${r1(rx)} ${r1(ry)} 0 0 1 ${b} ${r1(top + ry)}L${b} ${CB}Z`; };

  const defs = s('defs');
  defs.append(s('clipPath', {id: id + 'w'}, s('path', {d: winD})));
  const MR = 176, MY = 30; // 글씨가 앉는 띠 가운데 선(타원)
  defs.append(s('path', {id: id + 'a', d: `M${195 - MR} ${CT}A${MR} ${MY} 0 0 1 ${195 + MR} ${CT}`}));
  const arcAt = (() => { const N = 400, Q = [], L = [0]; for (let i = 0; i <= N; i++) { const a = PI * (1 - i / N); Q.push([195 + Math.cos(a) * MR, CT - Math.sin(a) * MY]); if (i) L.push(L[i - 1] + Math.hypot(Q[i][0] - Q[i - 1][0], Q[i][1] - Q[i - 1][1])); } return t => { const want = t * L[N]; let i = 1; while (i < N && L[i] < want) i++; return Q[i]; }; })();
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

  /* 2 별과 초승달 — 창 아치 위 두 귀퉁이 */
  let st = '';
  for (const [x, y, r] of [[128, 55, 3.2], [146, 50, 2.4], [262, 55, 3.2], [244, 50, 2.4], [108, 76, 2.2], [282, 76, 2.2]]) st += starD(x, y, r);
  svg.append(s('g', {'data-mucha': 'stars'}, s('path', {d: 'M112 57A9.5 9.5 0 1 0 112 76A7.4 7.4 0 1 1 112 57Z', class: 'we-moon'}), s('g', {class: 'we-twinkle'}, s('path', {d: st, class: 'we-star'})),
    s('path', {d: dotD(278, 64, 6), class: 'we-sun'}), rays(278, 64, 7, 12.5, {n: 14})));

  /* 3 후광 셋(온전한 원 · 머리의 두 배) · 세 여인(가운데가 뒤 · 양옆이 앞) */
  const F = {
    hot: {k: 'hot', x: 141, y: 182, h: 31, dir: 1, tilt: -7, tone: 0, cloth: 'peach', iris: 0, seed: 2, hf: 'mk-hf2'},
    bloom: {k: 'bloom', x: 196, y: 128, h: 34, dir: 1, tilt: 12, tone: 1, cloth: 'ivory', iris: 1, seed: 5, hf: 'mk-hf1'},
    money: {k: 'money', x: 249, y: 182, h: 31, dir: -1, tilt: -8, tone: 5, cloth: 'cream', iris: 2, seed: 8, hf: 'mk-hf0'},
  };
  const people = s('g', {'clip-path': `url(#${id}w)`, 'data-mucha': 'outline'});
  const halos = s('g', {'data-mucha': 'halo'});
  for (const k of ['bloom', 'hot', 'money']) { const f = F[k]; halos.append(halo(f.x + (k === 'bloom' ? -1 : 0), f.y - 0.14 * f.h, f.h * 1.2, f.hf)); }
  people.append(halos);
  for (const k of ['bloom', 'hot', 'money']) people.append(lady(F[k]));
  /* 발치 꽃밭 — 무대 바닥(꽃만 살랑임) */
  let lv = '', da = '', po = '', ce = '', ce2 = '';
  const meadow = [[106, 476, 'd'], [122, 468, 'p'], [140, 480, 'd'], [160, 470, 'd'], [178, 478, 'p'], [196, 466, 'd'], [212, 479, 'd'], [230, 470, 'p'], [250, 480, 'd'], [268, 470, 'd'], [284, 478, 'p']];
  for (const [i, [x, y]] of meadow.entries()) lv += leafD(x - 2, y + 6, (200 + i * 17) * PI / 180, 13, 4) + leafD(x + 2, y + 6, (-30 - i * 9) * PI / 180, 12, 3.6);
  const nod = [s('g', {class: 'we-nod we-nod0'}), s('g', {class: 'we-nod we-nod1'})];
  for (const [i, [x, y, kind]] of meadow.entries()) {
    if (kind === 'p') { po += petalsD(x, y, 7, 5, 0.55, i); ce2 += dotD(x, y, 2.2); } else { da += petalsD(x, y, 6.2, 10, 0.2, i); ce += dotD(x, y, 1.8); }
  }
  nod[0].append(s('path', {d: po, class: 'mk-fl-poppy'}), s('path', {d: ce2, class: 'mk-fl-c2'}));
  nod[1].append(s('path', {d: da, class: 'mk-fl-daisy'}), s('path', {d: ce, class: 'mk-fl-c'}));
  people.append(s('g', {'data-mucha': 'vine'}, s('path', {d: `M${WL} 482C140 470 170 484 195 476C222 484 252 470 ${WR} 482L${WR} ${CB}L${WL} ${CB}Z`, class: 'we-ground'}), s('path', {d: lv, class: 'mk-leaf'}), nod));
  svg.append(people);

  /* 4 창 금테(아치 끝으로 가늘게) · 글씨 띠 금선 두 겹 */
  svg.append(s('g', {'data-mucha': 'arch'}, s('path', {d: winD, class: 'we-arch'}), s('path', {d: outer, class: 'we-arch'}),
    s('path', {d: `M${CL + 5} ${CT}A186 39.5 0 0 1 ${CR - 5} ${CT}`, class: 'we-arch2'})));

  /* 5 꽃 덩굴 띠 — 창 밑을 가로질러 양옆 판 · 아래 일곱과 이음 */
  const vy = 488.6;
  let vl = '', vf = '', vc = '';
  for (let x = 14, i = 0; x < W - 10; x += 21, i++) { vl += leafD(x, vy, (i % 2 ? -0.5 : 0.5) - (i % 2 ? 0 : PI), 8, 2.6) + leafD(x + 4, vy, (i % 2 ? 0.4 : -0.4), 7, 2.3); if (i % 3 === 1) { vf += petalsD(x + 10, vy, 3.6, 5, 0.55, i); vc += dotD(x + 10, vy, 1.2); } }
  svg.append(s('g', {'data-mucha': 'vine'}, taper([[CL + 2, vy + 0.6], [100, vy - 0.8], [195, vy + 0.6], [290, vy - 0.8], [CR - 2, vy + 0.6]], {w0: 1.6, w1: 0.9, cls: 'we-vst'}),
    s('path', {d: vl, class: 'mk-leaf'}), s('path', {d: vf, class: 'mk-fl-rose'}), s('path', {d: vc, class: 'mk-fl-c'})));

  /* 6 글씨 — 아치 띠 세 말(띠 안에 새김 · 흰 테 없음) · 이름표 21개(아치 판) */
  const let9 = s('g', {'data-mucha': 'lettering'});
  svg.append(let9);
  const word = (t, at, k) => {
    const tx = s('text', {class: 'we-aw we-aw-' + k, 'text-anchor': 'middle', 'dominant-baseline': 'central'});
    const tp = s('textPath', {href: '#' + id + 'a', startOffset: at + '%', text: t});
    tp.setAttributeNS('http://www.w3.org/1999/xlink', 'xlink:href', '#' + id + 'a');
    tx.append(tp); return tx;
  };
  let9.append(word(KIND.hot, 14, 'hot'), word(KIND.bloom, 50, 'bloom'), word(KIND.money, 84, 'money'));
  for (const t of [0.31, 0.67]) { const [px, py] = arcAt(t); let9.append(s('path', {d: `M${r1(px)} ${r1(py - 4.5)}L${r1(px + 3.6)} ${r1(py)}L${r1(px)} ${r1(py + 4.5)}L${r1(px - 3.6)} ${r1(py)}Z`, class: 'we-gem'})); }

  if (!ok) {
    let9.append(s('text', {x: 195, y: 552, 'text-anchor': 'middle', 'dominant-baseline': 'central', class: 'we-need', text: NEED}));
    return svg;
  }
  const items = k => (lists[k] ?? []).slice(0, 7).map(c => ({k, code: String(c.code ?? ''), name: String(c.name ?? NEED), val: valText(c, k), star: Array.isArray(c.in) && c.in.length > 1}));
  const TONE = {hot: 'rose', money: 'gold', bloom: 'sage'}, tags = [];
  /** 판 안 글 자리 — 값 줄은 판 아래 곧은 쪽(금 겹선 안) · 이름 줄은 아치가 넓어지는 높이에서 잰 넓이(부품 plaque 와 같은 셈) */
  const room = (w, hh) => {
    const pw = w - 1, ph = hh - 2, ah = Math.min(pw / 2, ph * 0.4), g = Math.max(2, Math.min(4, ph * 0.08)), yb = 1 + ph - g - 10.5, top = yb - 20 - 9.6;
    const dy = Math.max(0, ah - top), hw = dy >= ah ? 0 : (pw / 2) * Math.sqrt(1 - (dy / ah) ** 2);
    return {nW: Math.max(20, 2 * (hw - g - 2)), vW: pw - 2 * g - 3, yb};
  };
  /** 아치 판 하나(부품 plaque) + 글 · 누르는 자리 = 칸 전체(높이 60 넘게) · 글은 판의 글 자리 안 */
  const tag = (it, x0, y0, w, hh, tailOK) => {
    const a = s('a', {href: '#/c/' + encodeURIComponent(it.code), class: 'we-tag we-tag-' + it.k, 'data-k': it.k, 'data-name': it.name,
      'aria-label': it.name + ' · ' + KIND[it.k] + ' · ' + it.val + (it.star ? ' · 두 목록에 함께' : '')});
    const pq = plaque({x: r1(x0 + 0.5), y: r1(y0 + 1), w: r1(w - 1), h: r1(hh - 2), tone: TONE[it.k], knots: false}); // 꽃 매듭은 판 사이 귀퉁이에 따로(이름 줄과 같은 높이라 긴 이름에 닿음)
    a.append(s('rect', {x: r1(x0), y: r1(y0), width: r1(w), height: r1(hh), class: 'we-hit'}), pq);
    const G = room(w, hh), L = lay(it, G.nW, tailOK, G.vW), n = L.rows.length, lh = n === 3 ? 20.5 : 20, cx = x0 + w / 2, yb = y0 + G.yb;
    L.rows.forEach((row, j) => {
      const yy = r1(yb - (n - 1 - j) * lh), px = row.v ? 18 : L.px;
      const full = row.tail ? row.t + ' ' + row.tail : row.t, lim = row.v || row.tail ? G.vW : G.nW;
      const tx = s('text', {x: r1(cx), y: yy, 'text-anchor': 'middle', 'dominant-baseline': 'central', class: row.v ? 'we-val we-v-' + it.k : 'we-name we-n' + px});
      if (row.tail) tx.append(s('tspan', {text: row.t}), s('tspan', {dx: 5, class: 'we-val we-v-' + it.k, text: row.tail}));
      else tx.textContent = row.t;
      if (est(full, px) > lim) { tx.setAttribute('textLength', r1(lim)); tx.setAttribute('lengthAdjust', 'spacingAndGlyphs'); }
      a.append(tx);
    });
    return a;
  };
  const hot = items('hot'), money = items('money'), bloom = items('bloom');
  /* 양옆 — 가는 덩굴로 이어진 세로 장식 판(판 사이 귀퉁이에 덩굴이 보임) · 세 줄 판은 78 · 두 줄 판은 60 넘게 */
  const side = (list, x0) => {
    const G = room(CW, 60.2), Ls = list.map(it => lay(it, G.nW, false, G.vW)), want = Ls.map(L => (L.rows.length === 3 ? 78 : 61));
    const sum = want.reduce((a, b) => a + b, 0), total = CB - CT;
    const n3 = want.filter(x => x === 78).length, hs = sum <= total ? want.map(v => v + (total - sum) / list.length) : want.map(v => (v === 78 ? (total - 60.2 * (list.length - n3)) / Math.max(1, n3) : 60.2));
    const vg = s('g', {'data-mucha': 'panel'});
    vg.append(taper([[x0 + 1.6, CT + 6], [x0 + 2.4, (CT + CB) / 2], [x0 + 1.6, CB]], {w0: 1.4, w1: 0.9, cls: 'we-vst'}), taper([[x0 + CW - 1.6, CT + 6], [x0 + CW - 2.4, (CT + CB) / 2], [x0 + CW - 1.6, CB]], {w0: 1.4, w1: 0.9, cls: 'we-vst'}));
    let y = CT, lf = '', fr = '', fc = '';
    list.forEach((it, i) => {
      tags.push(tag(it, x0, y, CW, hs[i], false));
      for (const [ex, sg] of [[x0 + 2, 1], [x0 + CW - 2, -1]]) { if (i) lf += leafD(ex, y + 3, sg > 0 ? -0.35 : PI + 0.35, 9, 2.8); fr += petalsD(ex + sg * 4.2, y + 7.5, 3.5, 5, 0.55, i + sg); fc += dotD(ex + sg * 4.2, y + 7.5, 1.1); }
      y += hs[i];
    });
    vg.append(s('path', {d: lf, class: 'mk-leaf'}), s('path', {d: fr, class: 'mk-fl-rose'}), s('path', {d: fc, class: 'mk-fl-c'}));
    svg.insertBefore(vg, let9);
  };
  side(hot, CL); side(money, CR - CW);
  /* 아래 — 꽃이 될 일곱(위 넷 · 아래 셋) · 판 넓이는 글에 맞추고 남는 자리는 고르게 */
  const rowH = (PB - PT) / 2;
  let kf = '', kc = '';
  [bloom.slice(0, 4), bloom.slice(4)].forEach((row, ri) => {
    const total = CR - CL, need = row.map(it => needW(it, true) + 20), sum = need.reduce((a, b) => a + b, 0);
    const ws = sum <= total ? need.map(v => v + (total - sum) / row.length) : need.map(v => total * v / sum);
    let x = CL;
    row.forEach((it, j) => { tags.push(tag(it, x, PT + ri * rowH, ws[j], rowH, true)); x += ws[j]; if (j < row.length - 1) { kf += petalsD(x, PT + ri * rowH + 7, 3.8, 5, 0.55, j); kc += dotD(x, PT + ri * rowH + 7, 1.2); } });
  });
  let9.append(...tags, s('path', {d: kf, class: 'mk-fl-rose', 'data-mucha': 'vine'}), s('path', {d: kc, class: 'mk-fl-c'}));
  return svg;
}
