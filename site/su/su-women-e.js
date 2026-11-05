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
    else if (ch === '%') w += 1.0;
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
const INS = 12; // 판 테(모자이크 점 띠 · 안쪽 금선까지 3.7) + 안쪽 여백 8 — 이름 · 값 글은 이 안에만(글자 사이를 좁히지 않음)
/** 칸 글 꼴 후보(좋은 차례) — 두 줄(이름 / 값 · 20 → 18) · ✦ 를 값 줄로 · 아래 칸은 낱말 경계에서 나눈 뒷말 곁에 값 ·
    옆 칸은 ✦ 를 이름 위 보석 줄로 · 낱말 경계 세 줄(낱말 가운데서 끊지 않음 · 숫자는 나누지 않음) */
function forms(it, low) {
  const st = it.star ? '✦ ' : '', [a, b] = split2(it.name), F = [];
  for (const px of [20, 19, 18]) F.push({px, rows: [{t: st + it.name}, {t: it.val, v: 1}]});
  if (st) F.push({px: 18, rows: [{t: it.name}, {t: st + it.val, v: 1}]});
  if (low) F.push({px: 18, rows: [{t: st + a}, {t: b, tail: it.val}]});
  else {
    if (st) F.push({px: 18, rows: [{t: '✦', gem: 1}, {t: it.name}, {t: it.val, v: 1}]});
    F.push({px: 18, rows: [{t: st + a}, {t: b}, {t: it.val, v: 1}]}, {px: 18, rows: [{t: a}, {t: b}, {t: st + it.val, v: 1}]});
  }
  return F;
}
const rowW = (r, px) => (r.tail ? est(r.t, px) * 1.02 + 5 + est(r.tail, 18) : r.v || r.gem ? est(r.t, 18) : est(r.t, px) * 1.02);
const formW = f => Math.max(...f.rows.map(r => rowW(r, f.px)));
/** 넓이 nW 안에 드는 첫 꼴 · 없으면 가장 좁은 꼴 */
function lay(it, nW, low = false) {
  const F = forms(it, low);
  return F.find(f => formW(f) <= nW) ?? F.reduce((p, f) => (formW(f) < formW(p) ? f : p));
}
/** 그 칸에 꼭 있어야 할 글 넓이(가장 좁은 꼴) — 옆 판 폭을 자료에 맞춰 정함 */
const needW = (it, low) => Math.min(...forms(it, low).map(formW));

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
/* 긴 옷 — 목 · 손목 · 발목까지 · 가슴(앞으로 둥글게) · 허리 0.8h(잘록) · 골반(무게 실은 뒤쪽이 더 나옴) · 굽힌 앞 무릎 · 발치에 고여 물결지며 퍼지는 자락 */
/* 엉덩이를 한쪽(앞 = +u)으로 뺀 S — 허리 잘록(±0.3) · 무게 실은 쪽 골반이 둥글게 크게 · 반대쪽은 낮고 작게 · 발치에서 자락이 퍼져 고임 */
const G_BACK = [[-0.2, 0.9], [-0.5, 1.0], [-0.66, 1.18], [-0.67, 1.55], [-0.55, 2.15], [-0.36, 2.72], [-0.42, 3.22], [-0.58, 3.78], [-0.6, 4.4], [-0.52, 5.3], [-0.5, 6.3], [-0.62, 7.2], [-0.9, 8.0], [-1.25, 8.62], [-1.55, 8.98]];
const G_HEM = [[-1.55, 8.98], [-1.26, 9.1], [-0.98, 8.99], [-0.66, 9.12], [-0.32, 9.0], [0.02, 9.14], [0.36, 9.02], [0.7, 9.1], [1.0, 8.96], [1.22, 8.88]];
const G_FRONT = [[1.22, 8.88], [1.0, 8.3], [0.78, 7.55], [0.7, 6.8], [0.84, 6.15], [0.86, 5.45], [0.86, 4.6], [0.82, 3.9], [0.56, 3.32], [0.3, 2.88], [0.36, 2.5], [0.62, 2.2], [0.76, 1.9], [0.72, 1.55], [0.54, 1.18], [0.2, 0.9]];
/* 가운데 여인 — 앞 무릎을 굽힘(무릎이 옷을 앞으로 밀고 자락이 무릎에서 곧게 떨어짐 · 앞 자락이 들림) */
const G_FRONT_B = [[1.2, 8.7], [1.12, 8.1], [1.1, 7.3], [1.12, 6.55], [1.08, 6.05], [0.92, 5.55], [0.8, 4.7], [0.82, 3.9], [0.56, 3.32], [0.3, 2.88], [0.36, 2.5], [0.62, 2.2], [0.76, 1.9], [0.72, 1.55], [0.54, 1.18], [0.2, 0.9]];
const G_HEM_B = [[-1.55, 8.98], [-1.26, 9.1], [-0.98, 8.99], [-0.66, 9.12], [-0.32, 9.0], [0.02, 9.06], [0.36, 8.9], [0.7, 8.84], [1.0, 8.72], [1.2, 8.7]];
const GOWN = [...G_BACK, ...G_HEM.slice(1, -1), ...G_FRONT];
const GOWN_B = [...G_BACK, ...G_HEM_B.slice(1, -1), ...G_FRONT_B];
/* 주름 일곱 — 허리 · 골반 · 무릎에서 S 로 흘러 발치에 고였다가 소용돌이(CURL = [반지름 h · 도는 쪽] · 0 은 말림 없음) */
const FOLDS = [
  [[0.3, 3.2], [0.12, 4.1], [-0.14, 5.2], [-0.36, 6.4], [-0.6, 7.6], [-0.96, 8.5]],
  [[0.46, 3.5], [0.34, 4.6], [0.1, 5.8], [-0.06, 7.0], [-0.26, 8.1], [-0.36, 8.66]],
  [[0.62, 3.85], [0.6, 4.9], [0.44, 6.0], [0.3, 7.1], [0.14, 8.2], [0.06, 8.7]],
  [[0.8, 6.25], [0.62, 7.0], [0.5, 7.8], [0.44, 8.7]],
  [[0.84, 6.42], [0.84, 7.2], [0.92, 8.0], [0.98, 8.58]],
  [[-0.5, 3.7], [-0.42, 4.8], [-0.36, 6.0], [-0.44, 7.1], [-0.7, 8.1], [-1.08, 8.62]],
  [[-0.1, 4.4], [-0.22, 5.6], [-0.18, 6.8], [-0.28, 7.9], [-0.56, 8.7]]];
const CURL = [[0.24, 1], [0, 0], [0.18, -1], [0, 0], [0.16, -1], [0.26, 1], [0.14, 1]];
/* 몸의 휨(높이 → 옆으로) — 양옆 여인: 어깨는 바깥 · 골반은 가운데 쪽(+u) · 발은 다시 머리 밑 / 가운데: 반대로 휘고 무릎을 굽힘 */
const BEND = {
  hot: [[-1.2, -0.14], [1.0, -0.18], [2.9, 0.0], [3.9, 0.3], [5.0, 0.26], [6.6, 0.06], [8.0, -0.04], [9.0, -0.04]],
  bloom: [[-1.2, 0.26], [1.0, 0.22], [2.9, -0.12], [3.9, -0.5], [5.0, -0.42], [6.6, -0.06], [8.0, 0.16], [9.0, 0.2]],
  money: [[-1.2, -0.16], [1.0, -0.2], [2.9, 0.02], [3.9, 0.34], [5.0, 0.3], [6.6, 0.08], [8.0, -0.04], [9.0, -0.04]],
};
const FS = 1.2, LEG = 1.1; // 얼굴 · 머리는 몸 단위의 1.2 배(얼굴 1.3 배 언저리) · 목 아래 몸은 1.1 배로 길게 → 머리 하나의 여덟 배 안팎
/* 금빛 파도 띠의 등줄기(돈이 몰리는 여인 · 두 손 → 몸 앞을 S 로 가로질러 → 발치 꽃 띠) */
const WAVE = [[0.5, 2.74], [0.92, 3.3], [1.12, 4.1], [0.78, 4.95], [0.1, 5.6], [-0.5, 6.35], [-0.86, 7.25], [-0.62, 8.1], [-0.84, 8.9], [-1.02, 9.25]];
/** 촘촘한 점 줄 끝에 안으로 말리는 소용돌이를 이음(지나온 방향을 그대로 이어 돎) */
function curlEnd(Q, r, sg, turns = 0.9) {
  const p = Q[Q.length - 1], q = Q[Math.max(0, Q.length - 3)], dl = Math.hypot(p[0] - q[0], p[1] - q[1]) || 1, dx = (p[0] - q[0]) / dl, dy = (p[1] - q[1]) / dl;
  const c = [p[0] - dy * sg * r, p[1] + dx * sg * r], a0 = Math.atan2(p[1] - c[1], p[0] - c[0]);
  return Q.concat(spiral(c, r, a0, turns, sg, 0.35, 14).slice(1));
}
const thin = (Q, w0) => bandD(Q, t => w0 * Math.pow(Math.sin(PI * t), 0.8) + 0.3);

/** 여인 — o: {k, x, y(얼굴 가운데) · h · dir(1 = 오른쪽을 봄) · tilt · tone(머리) · cloth · iris · seed} */
function lady(o) {
  const {k, h} = o, bend = bendFn(BEND[k]), b0 = bend(0), lv = v => (v <= 1 ? v : 1 + (v - 1) * LEG);
  const P = pts => pts.map(([u, v]) => [(u + bend(v) - b0) * h, lv(v) * h]);
  const g = s('g', {class: 'we-w we-' + k, 'data-body': k, transform: `translate(${r1(o.x)} ${r1(o.y)})` + (o.dir < 0 ? ' scale(-1 1)' : '')});
  const T = 'mk-hair mk-t' + o.tone, cl = o.cloth, hf = h * FS, fy = -(1.01 * FS - 1) * h; // 얼굴 단위 · 얼굴 가운데(목 끝이 깃 안에 들도록 올림)
  const front = k === 'bloom' ? G_FRONT_B : G_FRONT, hem = k === 'bloom' ? G_HEM_B : G_HEM;
  /* 1 머리 — 등 뒤로 S 로 흘러 허리께에서 말리는 다발 + 후광 밖으로 넘치는 굵은 소용돌이 다발(불장 → 불꽃 쪽 · 돈 → 금빛 물결 쪽 · 가운데 → 양옆 여인 쪽) */
  const hb = P([[-0.38, -0.5], [-0.84, 0.12], [-1.04, 0.85], [-0.86, 1.6], [-1.02, 2.3], [-1.3, 2.7]]);
  const SW = {
    hot: [[[-0.3, -1.0], [-0.78, -1.3], [-1.18, -1.12], [-1.34, -0.66], [-1.16, -0.3]], [[-0.46, -0.66], [-0.98, -0.5], [-1.22, 0.02], [-1.08, 0.5]]],
    money: [[[0.22, -0.2], [0.56, 0.36], [0.6, 1.1], [0.74, 1.78], [0.62, 2.42]], [[-0.36, -0.92], [-0.88, -1.06], [-1.24, -0.72], [-1.28, -0.2], [-1.08, 0.2]]],
    bloom: [[[-0.3, -0.96], [-0.9, -1.0], [-1.3, -0.62], [-1.36, -0.04], [-1.12, 0.4]], [[0.34, -1.0], [0.86, -0.96], [1.22, -0.56], [1.24, 0.0], [1.02, 0.36]]],
  }[k];
  const swl = (q, i) => strands(P(q), {n: 2, spread: h * (i ? 0.26 : 0.34), w0: h * (i ? 0.16 : 0.22), w1: 0.45, curl: 1, seed: o.seed * 5 + i, cls: 'mk-hb'});
  g.append(s('g', {class: T, 'data-mucha': 'whiplash'}, s('g', {class: 'mk-sway'},
    strands(hb, {n: 3, spread: h * 0.36, w0: h * 0.2, w1: 0.4, curl: 1, seed: o.seed * 3 + 1, cls: 'mk-hb'}),
    strands(hb, {n: 2, spread: h * 0.2, w0: h * 0.05, w1: 0.15, curl: 1, seed: o.seed * 3 + 2, cls: 'mk-hd'})),
    s('g', {class: 'mk-sway2'}, SW.map((q, i) => (k === 'money' && !i ? null : swl(q, i))))));
  g.append(s('g', {transform: `translate(0 ${r1(fy)}) rotate(${o.tilt})`}, hair({cx: 0, cy: 0, h: hf, dir: 1, tone: o.tone, len: 2.6, seed: o.seed, view: 'three'})));
  /* 2 긴 옷 · 발치에 고인 자락(말린 끝 셋) */
  const curlB = spiral([-1.24, 8.6], 0.4, 2.4, 1.2, 1), curlF = spiral([1.0, k === 'bloom' ? 8.44 : 8.62], 0.28, 0.9, 1.1, -1), curlM = spiral([-0.24, 8.84], 0.2, 1.3, 1.05, 1);
  g.append(s('path', {d: dotD(...P([[-1.24, 8.6]])[0], h * 0.38) + dotD(...P([[1.0, k === 'bloom' ? 8.44 : 8.62]])[0], h * 0.26), class: 'mk-cl-' + cl}),
    s('path', {d: closedD(P(k === 'bloom' ? GOWN_B : GOWN)), class: 'mk-cl-' + cl}));
  /* 부피 — 그늘(등 · 허리 · 가슴 밑 · 무릎 아래) · 빛(가슴 · 무게 실은 골반 · 앞 허벅지) */
  g.append(s('path', {d: lens(P([[-0.56, 1.3], [-0.46, 2.2], [-0.34, 2.8], [-0.44, 3.8], [-0.44, 5.0], [-0.42, 6.4], [-0.68, 7.9]]), h * 0.2, 0.6)
      + lens(P([[0.26, 2.12], [0.5, 2.32], [0.72, 2.14]]), h * 0.1) + lens(P([[0.7, 6.35], [0.56, 7.2], [0.62, 8.2]]), h * 0.15), class: 'mk-cld-' + cl + ' we-sh'}),
    s('path', {d: lens(P([[0.4, 1.52], [0.6, 1.7], [0.64, 1.98]]), h * 0.1) + lens(P([[0.5, 3.6], [0.66, 4.3], [0.62, 5.2]]), h * 0.2) + lens(P([[0.44, 5.4], [0.56, 6.0], [0.7, 6.4]]), h * 0.12), class: 'we-hl'}));
  /* 주름 일곱(가늘게) — 넷은 발치에서 소용돌이 */
  let fd = '';
  FOLDS.forEach((f, i) => { const Q = crPts(P(f), 6); fd += thin(CURL[i][0] ? curlEnd(Q, CURL[i][0] * h, CURL[i][1]) : Q, h * 0.042); });
  g.append(s('path', {d: fd + lens(P([[-0.4, 1.45], [-0.24, 1.95], [-0.04, 2.22]]), h * 0.035) + lens(P([[0.14, 1.5], [0.22, 2.0], [0.34, 2.3]]), h * 0.03), class: 'mk-cld-' + cl}));
  /* 바깥선 — 어깨에서 굵게 시작해 발치로 가늘게(안쪽 주름보다 세 배) */
  const tp = (Q, w0) => bandD(crPts(Q, 8), t => w0 * (t < 0.12 ? 0.5 + 0.5 * t / 0.12 : 1 - 0.78 * (t - 0.12) / 0.88) + 0.35);
  g.append(s('path', {d: tp(P(G_BACK), h * 0.13) + tp(P([...front].reverse()), h * 0.11), class: 'mk-ink'}),
    s('path', {d: lens(P(hem), h * 0.05), class: 'mk-ink2'}),
    taper(P(curlB), {w0: h * 0.1, w1: 0.4, cls: 'mk-ink'}), taper(P(curlF), {w0: h * 0.08, w1: 0.35, cls: 'mk-ink'}), taper(P(curlM), {w0: h * 0.05, w1: 0.3, cls: 'mk-ink2'}));
  /* 허리 띠 · 앞으로 늘어진 띠 끝 */
  g.append(s('path', {d: lens(P([[-0.4, 2.76], [-0.1, 2.92], [0.2, 2.92], [0.36, 2.8]]), h * 0.15), class: 'mk-gold'}),
    taper(P([[0.3, 2.92], [0.46, 3.55], [0.36, 4.25], [0.5, 4.95]]), {w0: h * 0.1, w1: 0.5, cls: 'mk-gold2'}));
  if (k === 'money') g.append(s('g', {class: T, 'data-mucha': 'whiplash'}, swl(SW[0], 0))); // 돈 여인 — 앞 어깨에서 가슴 앞으로 흘러 금빛 물결이 시작하는 두 손 쪽으로 감기는 다발(옷 위)
  /* 3 얼굴(부품 · 몸 단위의 1.2 배) · 높은 깃 · 보석 */
  const sl = (from, to, hand, w = h * 0.44) => { const [a, b] = P([from, to]), vx = b[0] - a[0], vy = b[1] - a[1]; return sleeve({x: r1(a[0]), y: r1(a[1]), ang: r1(Math.atan2(-vx, vy) * 180 / PI), len: Math.max(8, Math.hypot(vx, vy) - w * 0.32), w, hand, dir: 1, tone: cl}); };
  const fc = s('g', {transform: `translate(0 ${r1(fy)}) rotate(${o.tilt})`}, face({cx: 0, cy: 0, h: hf, dir: 1, view: 'three', tilt: 0, iris: o.iris}), diadem(k, hf));
  const collar = s('path', {d: closedD([[-0.33, 0.72], [0, 0.79], [0.33, 0.72], [0.37, 0.96], [0, 1.03], [-0.37, 0.96]].map(([u, v]) => [u * h, v * h])), class: 'mk-collar'});
  const gem = s('path', {d: dotD(0, 1.0 * h, h * 0.06), class: 'mk-gem-' + (k === 'hot' ? 'r' : k === 'bloom' ? 'g' : 'b')});
  g.append(fc, collar, gem);
  /* 4 자세와 든 것 */
  if (k === 'hot') g.append(sl([0.5, 1.12], [0.72, 3.05], 'rest', h * 0.42), torchArm(pts => P(pts.map(([u, v]) => [u * 0.84, v])), h, cl)); // 앞 손은 골반에 · 뒤 팔은 팔꿈치를 굽혀 횃불을 듦
  else if (k === 'bloom') { // 두 팔로 꽃다발을 가슴에 안음
    g.append(sl([0.48, 1.1], [0.66, 2.3], 'hold', h * 0.46));
    const [cx, cy] = P([[0.3, 1.92]])[0];
    g.append(bouquet(cx, cy, h), sl([-0.5, 1.1], [0.18, 2.55], 'hold', h * 0.46));
  } else { // 두 손 사이로 금빛 파도가 넘쳐 몸 앞을 S 로 가로질러 꽃 띠까지
    g.append(sl([0.48, 1.1], [0.68, 2.6], 'hold', h * 0.42), waves(P(WAVE), h), sl([-0.5, 1.12], [0.34, 2.8], 'hold', h * 0.42));
  }
  return g;
}
/** 횃불 든 팔 — 어깨 → 굽힌 팔꿈치 → 들어 올린 주먹 · 넓은 소매가 팔꿈치 아래로 주름지며 흘러내림(손목까지 덮음) */
function torchArm(P, h, cl) {
  const B = (pts, wf) => bandD(crPts(P(pts), 8), wf);
  const up = [[-0.48, 1.08], [-0.86, 0.68], [-1.2, 0.46]], fore = [[-1.2, 0.46], [-1.1, -0.04], [-0.92, -0.46]];
  const upW = t => h * (0.3 + 0.08 * Math.sin(PI * t)), foW = t => h * (0.3 - 0.09 * t);
  const drape = [[-1.0, -0.34], [-1.18, 0.06], [-1.42, 0.5], [-1.55, 1.0], [-1.5, 1.4], [-1.36, 1.56], [-1.2, 1.38], [-1.06, 1.12], [-0.94, 0.84], [-0.9, 0.5], [-0.94, 0.1]];
  const g = s('g', {class: 'we-arm', 'data-mucha': 'outline'});
  g.append(s('path', {d: B(up, t => upW(t) + h * 0.075), class: 'mk-ink'}), s('path', {d: B(up, upW), class: 'mk-cl-' + cl}),
    s('path', {d: B([[-0.62, 0.98], [-0.88, 0.78], [-1.08, 0.62]], t => h * 0.03 * Math.sin(PI * t) + 0.3), class: 'mk-cld-' + cl}));
  /* 흘러내린 소매 자락 — 주름 셋 · 바깥선 굵게 · 금 단 */
  let dr = '';
  for (const f of [[[-1.04, -0.2], [-1.26, 0.4], [-1.4, 1.0], [-1.42, 1.42]], [[-1.0, 0.06], [-1.12, 0.6], [-1.22, 1.06], [-1.22, 1.32]], [[-0.96, 0.4], [-1.0, 0.8], [-1.08, 1.08]]]) dr += thin(crPts(P(f), 6), h * 0.04);
  g.append(s('path', {d: closedD(P(drape)), class: 'mk-cl-' + cl}), s('path', {d: dr, class: 'mk-cld-' + cl}),
    s('path', {d: lens(P([[-1.0, -0.34], [-1.18, 0.06], [-1.42, 0.5], [-1.55, 1.0], [-1.5, 1.4], [-1.36, 1.56]]), h * 0.09, 0.5) + lens(P([[-0.9, 0.5], [-0.94, 0.84], [-1.06, 1.12]]), h * 0.04), class: 'mk-ink'}),
    s('path', {d: lens(P([[-1.52, 1.36], [-1.36, 1.56], [-1.2, 1.38], [-1.06, 1.12]]), h * 0.09), class: 'mk-gold'}));
  /* 아래팔(소매가 손목까지) · 금 소맷부리 */
  g.append(s('path', {d: B(fore, t => foW(t) + h * 0.07), class: 'mk-ink'}), s('path', {d: B(fore, foW), class: 'mk-cl-' + cl}),
    s('path', {d: lens(P([[-1.04, -0.42], [-0.92, -0.47], [-0.8, -0.44]]), h * 0.1), class: 'mk-gold'}));
  /* 자루 · 잔 · 불꽃(주먹 뒤에서 위로) · 주먹(손가락 마디 셋 · 엄지) */
  const [cx, cy] = P([[-0.9, -1.16]])[0], [hx, hy] = P([[-0.88, -0.3]])[0];
  g.append(torch(cx, cy, h, hx, hy));
  const fist = P([[-1.02, -0.54], [-1.05, -0.68], [-0.99, -0.81], [-0.88, -0.86], [-0.78, -0.8], [-0.75, -0.67], [-0.79, -0.55], [-0.9, -0.5]]);
  const m = fist.reduce((a, p) => [a[0] + p[0] / fist.length, a[1] + p[1] / fist.length], [0, 0]);
  g.append(s('path', {d: closedD(fist.map(p => [m[0] + (p[0] - m[0]) * 1.16, m[1] + (p[1] - m[1]) * 1.12])), class: 'mk-ink'}), s('path', {d: closedD(fist), class: 'mk-skin'}),
    s('path', {d: lens(P([[-0.86, -0.6], [-0.8, -0.62], [-0.76, -0.6]]), h * 0.025) + lens(P([[-0.86, -0.68], [-0.8, -0.7], [-0.76, -0.68]]), h * 0.025) + lens(P([[-0.87, -0.76], [-0.81, -0.78], [-0.77, -0.76]]), h * 0.025)
      + lens(P([[-1.0, -0.78], [-0.93, -0.84], [-0.84, -0.8]]), h * 0.035), class: 'mk-ink2'}));
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
/** 횃불 — 자루(주먹 아래 hx,hy → 잔 x,y) · 금 잔 · 세 갈래 불꽃(밑동에서 갈라져 위로 S 로 휘고 끝이 말림 · 양옆은 바깥으로 · 지난 판의 두 배) · 불티 */
function torch(x, y, h, hx, hy) {
  const b = y - h * 0.1, X = (u, v) => [x + u * h, b - v * h];
  const tongue = (Q, w0, sg, r) => bandD(curlEnd(crPts(Q, 8), r, sg, 0.85), t => w0 * (t < 0.14 ? 0.62 + 0.38 * t / 0.14 : Math.pow(1 - (t - 0.14) / 0.86, 1.2)) + 0.25);
  const C = [X(0, 0), X(0.18, 0.6), X(-0.12, 1.25), X(0.06, 1.9)], Lt = [X(-0.1, 0), X(-0.36, 0.42), X(-0.4, 0.88), X(-0.56, 1.24)], Rt = [X(0.1, 0), X(0.38, 0.45), X(0.4, 0.94), X(0.58, 1.32)];
  const inner = (Q, k) => Q.map(([px, py]) => [x + (px - x) * 0.8, b + (py - b) * k]);
  const cup = `M${r1(x - h * 0.3)} ${r1(y - h * 0.08)}Q${r1(x)} ${r1(y + h * 0.3)} ${r1(x + h * 0.3)} ${r1(y - h * 0.08)}Z`;
  let sp = ''; for (const [u, v, r] of [[-0.62, 1.72, 0.05], [0.64, 1.92, 0.045], [-0.34, 2.28, 0.04], [0.42, 2.4, 0.035]]) sp += dotD(...X(u, v), r * h);
  return s('g', {class: 'we-torch', 'data-held': 'torch'},
    taper([[hx, hy], [(hx + x) / 2, (hy + y) / 2], [x, y + 0.05 * h]], {w0: h * 0.075, w1: h * 0.1, cls: 'mk-gold'}),
    s('g', {class: 'we-flame', 'data-mucha': 'whiplash'},
      s('path', {d: tongue(Lt, h * 0.34, -1, h * 0.11) + tongue(Rt, h * 0.34, 1, h * 0.11) + tongue(C, h * 0.52, -1, h * 0.14), class: 'we-fire'}),
      s('path', {d: tongue(inner(Lt, 0.7), h * 0.16, -1, h * 0.07) + tongue(inner(Rt, 0.7), h * 0.16, 1, h * 0.07) + tongue(inner(C, 0.72), h * 0.28, -1, h * 0.09), class: 'we-fire2'}),
      s('path', {d: tongue(inner(C, 0.44), h * 0.16, -1, h * 0.06), class: 'we-fire3'})),
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

/** 판 둘레 점 — 위가 둥근 아치(rise) · 아래 두 귀퉁이 둥글게 · ins = 안으로 들인 만큼 · 고른 사이 step 의 점(자리 · 방향)과 촘촘한 둘레 */
function ring(x0, y0, w, hh, rise, ins, step = 6.2) {
  const X0 = x0 + ins, X1 = x0 + w - ins, Y0 = y0 + ins, Y1 = y0 + hh - ins, cx = (X0 + X1) / 2, rx = (X1 - X0) / 2, ry = Math.max(0.01, rise - ins * 0.4), r = Math.max(2, 8 - ins);
  const D = [];
  for (let i = 0; i <= 36; i++) { const a = PI + PI * i / 36; D.push([cx + rx * Math.cos(a), Y0 + ry + ry * Math.sin(a)]); }
  for (let i = 0; i <= 6; i++) { const a = PI / 2 * i / 6; D.push([X1 - r + r * Math.cos(a), Y1 - r + r * Math.sin(a)]); }
  for (let i = 0; i <= 6; i++) { const a = PI / 2 + PI / 2 * i / 6; D.push([X0 + r + r * Math.cos(a), Y1 - r + r * Math.sin(a)]); }
  const L = [0]; for (let i = 1; i < D.length; i++) L.push(L[i - 1] + Math.hypot(D[i][0] - D[i - 1][0], D[i][1] - D[i - 1][1]));
  const tot = L[L.length - 1] + Math.hypot(D[0][0] - D[D.length - 1][0], D[0][1] - D[D.length - 1][1]), n = Math.max(8, Math.round(tot / step)), at = [];
  const E = [...D, D[0]], LL = [...L, tot];
  for (let k = 0, j = 1; k < n; k++) { const want = k * tot / n; while (j < E.length - 1 && LL[j] < want) j++; const u = (want - LL[j - 1]) / ((LL[j] - LL[j - 1]) || 1); at.push([E[j - 1][0] + (E[j][0] - E[j - 1][0]) * u, E[j - 1][1] + (E[j][1] - E[j - 1][1]) * u, Math.atan2(E[j][1] - E[j - 1][1], E[j][0] - E[j - 1][0])]); }
  return {d: 'M' + D.map(pt).join('L') + 'Z', at};
}
/** 금선이 귀퉁이에서 소용돌이로 풀림 — (x, y) 에서 방향 a0 로 나가 반지름 r 로 sg 쪽으로 말림(굵게 시작해 가늘게) */
function unwind(x, y, a0, r, sg, w0 = 1.6) {
  const c = [x + Math.cos(a0 + sg * PI / 2) * r, y + Math.sin(a0 + sg * PI / 2) * r], b0 = Math.atan2(y - c[1], x - c[0]);
  return bandD(crPts(spiral(c, r, b0, 1.25, sg, 0.28, 22), 2), t => w0 * (1 - 0.8 * t) + 0.25);
}

/* ── 그림 ── */
export function picture(d, opt = {}) {
  const id = 'we' + (++UID);
  const lists = d?.lists ?? {};
  const ok = KEY.every(k => Array.isArray(lists[k]) && lists[k].length);
  const day = d?.asOf?.board ?? null;
  const svg = s('svg', {class: 'su-svg su-art4 su-women-e', viewBox: `0 0 ${W} ${H}`, role: 'img', preserveAspectRatio: 'xMidYMid meet',
    'aria-label': ok ? '세 여인 그림 · 불장 ' + lists.hot.length + '곳 · 꽃이 될 ' + lists.bloom.length + '곳 · 돈이 몰리는 ' + lists.money.length + '곳' + (day ? ' · ' + day + ' 자료' : '') : '세 여인 그림 · 자료 ' + NEED});
  const items = k => (lists[k] ?? []).slice(0, 7).map(c => ({k, code: String(c.code ?? ''), name: String(c.name ?? NEED), val: valText(c, k), star: Array.isArray(c.in) && c.in.length > 1}));
  const hot = ok ? items('hot') : [], money = ok ? items('money') : [], bloom = ok ? items('bloom') : [];
  /* 틀 자리 — 양옆 장식 판 폭은 자료 글에 맞춤(가장 긴 글 + 테 · 여백 8 · 글자 사이를 좁히지 않음) · 가운데 한 무대(아치 창) · 아래 판 하나(맨 아래 8 단위는 꾸밈만) */
  const sideW = list => Math.max(92, Math.min(118, Math.ceil(Math.max(0, ...list.map(it => needW(it, false))) + 2 * INS)));
  const CL = 2, CR = 388, CWL = sideW(hot), CWR = sideW(money), CT = 47, CB = 480, RISE = 13, PT = 484, PB = 612;
  const WL = CL + CWL + 3, WR = CR - CWR - 3, WS = 84, WT = 44, WX = (WL + WR) / 2, WRX = (WR - WL) / 2, SWD = WR - WL;
  const winD = `M${WL} ${CB}L${WL} ${WS}A${r1(WRX)} ${WS - WT} 0 0 1 ${WR} ${WS}L${WR} ${CB}Z`;
  /* 벽감 셋(겹친 아케이드) — [왼 · 오른 · 꼭대기] */
  const NI = [[WL, WX + 4, 104], [WX - 46, WX + 46, 56], [WX - 4, WR, 104]];
  const nicheD = ([a, b, top]) => { const rx = (b - a) / 2, ry = rx * 0.92; return `M${r1(a)} ${CB}L${r1(a)} ${r1(top + ry)}A${r1(rx)} ${r1(ry)} 0 0 1 ${r1(b)} ${r1(top + ry)}L${r1(b)} ${CB}Z`; };

  const defs = s('defs');
  defs.append(s('clipPath', {id: id + 'w'}, s('path', {d: winD})));
  const MR = 178, MY = 26; // 글씨가 앉는 띠 가운데 선(납작한 타원 한 호)
  defs.append(s('path', {id: id + 'a', d: `M${195 - MR} ${CT}A${MR} ${MY} 0 0 1 ${195 + MR} ${CT}`}));
  const ARC = (() => { const N = 400, Q = [], L = [0]; for (let i = 0; i <= N; i++) { const a = PI * (1 - i / N); Q.push([195 + Math.cos(a) * MR, CT - Math.sin(a) * MY]); if (i) L.push(L[i - 1] + Math.hypot(Q[i][0] - Q[i - 1][0], Q[i][1] - Q[i - 1][1])); } return {len: L[N], at: t => { const want = t * L[N]; let i = 1; while (i < N && L[i] < want) i++; return Q[i]; }}; })();
  svg.append(defs);

  /* 1 바탕 · 글씨 띠(아치 머리) · 한 무대 창 · 벽감 셋(살구 · 연두 · 옅은 금빛) */
  const outer = `M${CL + 2} ${CT}A191 44 0 0 1 ${CR - 2} ${CT}`;
  svg.append(s('rect', {x: 0, y: 0, width: W, height: H, rx: 18, class: 'we-p0'}),
    s('path', {d: outer + `L${WR} ${CT}L${WR} ${WS}A${r1(WRX)} ${WS - WT} 0 0 0 ${WL} ${WS}L${WL} ${CT}Z`, class: 'we-band'}),
    s('path', {d: winD, class: 'we-win'}));
  /* 창 안 옅은 동심원(벽감 뒤) */
  let rings = '';
  for (const r of [40, 62, 84, 106]) rings += `M${r1(WX - r)} 130a${r} ${r} 0 1 0 ${2 * r} 0a${r} ${r} 0 1 0 ${-2 * r} 0`;
  svg.append(s('g', {'clip-path': `url(#${id}w)`, 'data-mucha': 'pastel'}, s('path', {d: rings, class: 'we-rings'}),
    s('path', {d: nicheD(NI[1]), class: 'we-niche we-n1'}), s('path', {d: nicheD(NI[0]), class: 'we-niche we-n0'}), s('path', {d: nicheD(NI[2]), class: 'we-niche we-n2'}),
    s('path', {d: nicheD(NI[1]), class: 'we-nline'}), s('path', {d: nicheD(NI[0]), class: 'we-nline'}), s('path', {d: nicheD(NI[2]), class: 'we-nline'})));

  /* 2 별 · 초승달 · 해 — 창 아치 위 두 귀퉁이(글씨 띠 아래 · 창 밖) */
  let st = '';
  for (const [x, y, r] of [[WL + 26, 52, 2.6], [WL + 41, 46, 2.0], [WR - 26, 52, 2.6], [WR - 41, 46, 2.0]]) st += starD(x, y, r);
  svg.append(s('g', {'data-mucha': 'stars'}, s('path', {d: `M${WL + 13} 47A8 8 0 1 0 ${WL + 13} 63A11 11 0 0 1 ${WL + 13} 47Z`, class: 'we-moon'}), s('g', {class: 'we-twinkle'}, s('path', {d: st, class: 'we-star'})),
    s('path', {d: dotD(WR - 12, 56, 4.6), class: 'we-sun'}), rays(WR - 12, 56, 5.6, 9.6, {n: 14})));

  /* 3 후광 셋(온전한 원 · 큰 머리의 두 배) · 세 여인(가운데가 뒤 · 양옆이 앞 · 셋의 머리가 한 덩어리로 이어짐) */
  const F = {
    hot: {k: 'hot', x: WL + SWD * 0.215, y: 136, h: 31.5, dir: 1, tilt: -7, tone: 0, cloth: 'peach', iris: 0, seed: 2, hf: 'mk-hf2'},
    bloom: {k: 'bloom', x: WX + 1, y: 112, h: 34.5, dir: 1, tilt: 10, tone: 1, cloth: 'ivory', iris: 1, seed: 5, hf: 'mk-hf1'},
    money: {k: 'money', x: WR - SWD * 0.215, y: 136, h: 31.5, dir: -1, tilt: -8, tone: 5, cloth: 'cream', iris: 2, seed: 8, hf: 'mk-hf0'},
  };
  const people = s('g', {'clip-path': `url(#${id}w)`, 'data-mucha': 'outline'});
  const halos = s('g', {'data-mucha': 'halo'});
  for (const k of ['bloom', 'hot', 'money']) { const f = F[k], hf = f.h * FS, fy = -(1.01 * FS - 1) * f.h; halos.append(halo(f.x + (k === 'bloom' ? -1 : 0), f.y + fy - 0.14 * hf, hf * 1.16, f.hf)); }
  people.append(halos);
  for (const k of ['bloom', 'hot', 'money']) people.append(lady(F[k]));
  /* 발치 꽃밭 — 무대 바닥(꽃만 살랑임) */
  let lf = '', da = '', po = '', ce = '', ce2 = '';
  const meadow = Array.from({length: 10}, (_, i) => [WL + 8 + i * (SWD - 16) / 9, 472 + (i % 2 ? -7 : 3), i % 3 === 1 ? 'p' : 'd']);
  for (const [i, [x, y]] of meadow.entries()) lf += leafD(x - 2, y + 6, (200 + i * 17) * PI / 180, 13, 4) + leafD(x + 2, y + 6, (-30 - i * 9) * PI / 180, 12, 3.6);
  const nod = [s('g', {class: 'we-nod we-nod0'}), s('g', {class: 'we-nod we-nod1'})];
  for (const [i, [x, y, kind]] of meadow.entries()) {
    if (kind === 'p') { po += petalsD(x, y, 7, 5, 0.55, i); ce2 += dotD(x, y, 2.2); } else { da += petalsD(x, y, 6.2, 10, 0.2, i); ce += dotD(x, y, 1.8); }
  }
  nod[0].append(s('path', {d: po, class: 'mk-fl-poppy'}), s('path', {d: ce2, class: 'mk-fl-c2'}));
  nod[1].append(s('path', {d: da, class: 'mk-fl-daisy'}), s('path', {d: ce, class: 'mk-fl-c'}));
  people.append(s('g', {'data-mucha': 'vine'}, s('path', {d: `M${WL} 478C${r1(WL + SWD * 0.25)} 466 ${r1(WX - 20)} 480 ${r1(WX)} 472C${r1(WX + 20)} 480 ${r1(WR - SWD * 0.25)} 466 ${WR} 478L${WR} ${CB}L${WL} ${CB}Z`, class: 'we-ground'}), s('path', {d: lf, class: 'mk-leaf'}), nod));
  svg.append(people);

  /* 4 창 금테 · 글씨 띠 금선 두 겹 — 컴퍼스 선만이 아니라 어깨 · 바닥 귀퉁이에서 소용돌이로 풂 */
  let uw = '';
  uw += unwind(WL + 1.5, WS + 2, PI / 2, 5.6, -1) + unwind(WR - 1.5, WS + 2, PI / 2, 5.6, 1); // 아치 어깨 → 안으로 말림
  uw += unwind(WL + 1.5, CB - 8, -PI / 2, 6.2, 1) + unwind(WR - 1.5, CB - 8, -PI / 2, 6.2, -1); // 바닥 귀퉁이 → 위로 말림
  uw += unwind(CL + 7, CT - 1, -PI / 2 + 0.5, 4.4, -1, 1.3) + unwind(CR - 7, CT - 1, -PI / 2 - 0.5, 4.4, 1, 1.3); // 글씨 띠 두 끝
  svg.append(s('g', {'data-mucha': 'arch'}, s('path', {d: winD, class: 'we-arch'}), s('path', {d: outer, class: 'we-arch'}),
    s('path', {d: `M${CL + 7} ${CT}A186 39.5 0 0 1 ${CR - 7} ${CT}`, class: 'we-arch2'}), s('path', {d: uw, class: 'we-vst'})));

  /* 5 꽃 덩굴 띠 — 창 밑을 가로질러 양옆 판 · 아래 판과 이음 */
  const vy = 482.2;
  let vl = '', vf = '', vc = '';
  for (let x = WL + 6, i = 0; x < WR - 4; x += 19, i++) { vl += leafD(x, vy, (i % 2 ? -0.5 : 0.5) - (i % 2 ? 0 : PI), 7, 2.2) + leafD(x + 4, vy, (i % 2 ? 0.4 : -0.4), 6, 2.0); if (i % 3 === 1) { vf += petalsD(x + 9, vy, 3.2, 5, 0.55, i); vc += dotD(x + 9, vy, 1.1); } }
  svg.append(s('g', {'data-mucha': 'vine'}, taper([[WL - 2, vy + 0.4], [WX - 40, vy - 0.6], [WX, vy + 0.4], [WX + 40, vy - 0.6], [WR + 2, vy + 0.4]], {w0: 1.4, w1: 0.8, cls: 'we-vst'}),
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
  const tags = [];
  /** 이름 하나 — 누르는 자리 = 칸 전체(높이 60 넘게 · 투명) · 테 없이 글만 판 위에(가운데 맞춤 · 글 자리 nW 안) */
  const tag = (it, L, x0, y0, w, hh, nW) => {
    const a = s('a', {href: '#/c/' + encodeURIComponent(it.code), class: 'we-tag we-tag-' + it.k, 'data-k': it.k, 'data-name': it.name,
      'aria-label': it.name + ' · ' + KIND[it.k] + ' · ' + it.val + (it.star ? ' · 두 목록에 함께' : '')});
    a.append(s('rect', {x: r1(x0), y: r1(y0), width: r1(w), height: r1(hh), rx: 9, class: 'we-hit'}));
    const n = L.rows.length, lh = n === 3 ? 20 : 21.5, cx = x0 + w / 2, cy = y0 + hh / 2;
    L.rows.forEach((row, j) => {
      const yy = r1(cy + (j - (n - 1) / 2) * lh), px = row.v || row.gem ? 18 : L.px;
      const tx = s('text', {x: r1(cx), y: yy, 'text-anchor': 'middle', 'dominant-baseline': 'central', class: row.gem ? 'we-val we-gemt' : row.v ? 'we-val we-v-' + it.k : 'we-name we-n' + px});
      if (row.tail) tx.append(s('tspan', {text: row.t}), s('tspan', {dx: 5, class: 'we-val we-v-' + it.k, text: row.tail}));
      else tx.textContent = row.t;
      if (rowW(row, px) > nW + 0.5) { tx.setAttribute('textLength', r1(nW)); tx.setAttribute('lengthAdjust', 'spacingAndGlyphs'); } // 자료가 아주 길 때만(오늘 자료에는 없음)
      a.append(tx);
    });
    return a;
  };
  /** 장식 판 하나 — 위가 둥근 아치 머리 · 테 = 모자이크 점 띠(금 · 남 · 녹 마름모와 금 점이 번갈아) + 안쪽 가는 금선 · 이름 사이 작은 꽃 점 */
  const panel = (x0, y0, w, hh, tone, cuts, across, rise) => {
    const o = ring(x0, y0, w, hh, rise, 0.6), band = ring(x0, y0, w, hh, rise, 1.95, 5.6), inner = ring(x0, y0, w, hh, rise, 3.7);
    const q = ['', '', ''];
    let dt = '';
    band.at.forEach(([x, y, a], i) => {
      if (i % 2) { dt += dotD(x, y, 0.75); return; }
      const z = 1.4, ca = Math.cos(a), sa = Math.sin(a);
      q[(i / 2) % 3] += `M${r1(x + ca * z)} ${r1(y + sa * z)}L${r1(x - sa * z)} ${r1(y + ca * z)}L${r1(x - ca * z)} ${r1(y - sa * z)}L${r1(x + sa * z)} ${r1(y - ca * z)}Z`;
    });
    let lf2 = '', fl = '', fc = '';
    for (const [x, y] of cuts) {
      fl += petalsD(x, y, 3.9, 5, 0.55, 0.3); fc += dotD(x, y, 1.3);
      lf2 += across ? leafD(x - 3.2, y, PI + 0.14, 10, 2.7) + leafD(x + 3.2, y, -0.14, 10, 2.7) : leafD(x, y - 3.2, -PI / 2 + 0.14, 10, 2.7) + leafD(x, y + 3.2, PI / 2 + 0.14, 10, 2.7);
    }
    return s('g', {'data-mucha': 'panel'}, s('path', {d: o.d, class: 'we-pan we-pan-' + tone}), s('path', {d: o.d, class: 'we-pfr'}),
      s('g', {'data-mucha': 'mosaic'}, s('path', {d: q[0], class: 'mk-mo-g'}), s('path', {d: q[1], class: 'mk-mo-b'}), s('path', {d: q[2], class: 'mk-mo-n'}), s('path', {d: dt, class: 'we-mdot'})),
      s('path', {d: inner.d, class: 'we-pfr2'}), s('path', {d: lf2, class: 'mk-leaf'}), s('path', {d: fl, class: 'mk-fl-rose'}), s('path', {d: fc, class: 'mk-fl-c'}));
  };
  /* 양옆 — 아치 머리 판 하나에 이름 일곱(세 줄 이름은 66 · 두 줄은 60 넘게 · 글은 테에서 8 넘게) */
  const side = (list, x0, w, tone) => {
    const nW = w - 2 * INS, Ls = list.map(it => lay(it, nW)), want = Ls.map(L => (L.rows.length === 3 ? 63 : 60.2));
    const top = CT + 7, total = CB - 3 - top, sum = want.reduce((a, b) => a + b, 0);
    const hs = sum <= total ? want.map(v => v + (total - sum) / list.length) : want.map(v => (v > 60.2 ? Math.max(60.2, (total - 60.2 * want.filter(x => x <= 60.2).length) / want.filter(x => x > 60.2).length) : 60.2));
    let y = top; const cuts = [];
    list.forEach((it, i) => { if (i) cuts.push([x0 + w / 2, y]); tags.push(tag(it, Ls[i], x0, y, w, hs[i], nW)); y += hs[i]; });
    svg.insertBefore(panel(x0, CT, w, CB - CT, tone, cuts, true, RISE), let9);
  };
  side(hot, CL, CWL, 'hot'); side(money, CR - CWR, CWR, 'money');
  /* 아래 — 꽃이 될 일곱을 판 하나에 두 줄(넷 · 셋 또는 셋 · 넷 — 글이 넉넉한 쪽) · 칸 넓이는 글에 맞추고 남는 자리는 고르게 */
  const span = CR - CL - 10, IN = 12;
  const fitRow = row => { // 먼저 글 크기를 20 → 19 → 18 로 줄이고 · 그래도 넘치면 긴 이름부터 낱말 경계에서 나눔(이름 뒷말 곁에 값)
    const Fs = row.map(it => forms(it, true)), tl = Fs.map(fs => fs.findIndex(f => f.rows.some(x => x.tail)));
    const wOf = (i, j) => formW(Fs[i][j]) + IN, tot = pk => pk.reduce((a, j, i) => a + wOf(i, j), 0);
    let pick = row.map(() => 2);
    for (const j of [0, 1, 2]) { const pk = row.map(() => j); if (tot(pk) <= span) { pick = pk; break; } }
    const order = row.map((_, i) => i).sort((a, b) => wOf(b, 2) - wOf(a, 2));
    for (const i of order) { if (tot(pick) <= span) break; if (tl[i] >= 0 && wOf(i, tl[i]) < wOf(i, pick[i])) pick[i] = tl[i]; }
    const ws = pick.map((j, i) => wOf(i, j)), sum = ws.reduce((a, b) => a + b, 0);
    return {Ls: pick.map((j, i) => Fs[i][j]), ws: ws.map(v => v + (span - sum) / row.length), spare: span - sum, cut: pick.filter((j, i) => j === tl[i]).length};
  };
  const splits = [3, 4].map(n => [bloom.slice(0, n), bloom.slice(n)].filter(r => r.length).map(fitRow));
  const cut = c => c.reduce((a, r) => a + r.cut, 0) * 1000 + (Math.min(...c.map(r => r.spare)) < 0 ? 500 : 0); // 이름을 나눈 칸이 적은 쪽 · 같으면 셋 · 넷(아래가 넓은 받침)
  const best = splits.reduce((p, c) => (cut(c) < cut(p) - 0.5 ? c : p));
  const rowH = 60.2, cuts = [];
  best.forEach((R, ri) => {
    const row = ri ? bloom.slice(bloom.length - R.Ls.length) : bloom.slice(0, R.Ls.length);
    let x = CL + 5;
    row.forEach((it, j) => { tags.push(tag(it, R.Ls[j], x, PT + 5 + ri * rowH, R.ws[j], rowH, R.ws[j] - IN)); x += R.ws[j]; if (j < row.length - 1) cuts.push([x, PT + 5 + ri * rowH + rowH / 2]); });
  });
  svg.insertBefore(panel(CL, PT, CR - CL, PB - PT, 'bloom', cuts, false, 5), let9);
  let9.append(...tags);
  return svg;
}
