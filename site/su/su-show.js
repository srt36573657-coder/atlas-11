/* 쇼 판 s04 — 잡스 발표 무대(주문 1249 · docs/design/su-show-2026-11-08/brief.md)
   짜임: 검은 무대 한 장 · 양옆 빛 기둥 둘(왼 지금 · 오른 될 듯 — 기둥 머리에 큰 숫자 21) · 기둥은 아래에서 꺾여 무대 앞까지 이어짐(ㄴ 자 둘)
   가운데 무대: 무하 아치 · 조명 셋 · 조명 속 세 여인 전신(트위드 재킷 · 진주 · 흑백에 금 한 점 · 투톤 구두) · 빛 점 벽
   쇼: 조명 셋이 차례로 켜짐 → 지금 이름이 위에서부터 켜짐 → 「하나 더」처럼 될 듯 기둥이 아래에서 떠오름(2.4초 안 한 번) · 그 뒤 조명만 숨 쉼
   그리기: s() 만(createElementNS · setAttribute) · 색 · 움직임은 art.css 클래스 */
import {s} from '/su/su-fig.js';
import {strands, face, hair, sleeve, rays} from '/su/su-mucha-kit.js';

export const CSS = '/su/su-show.css';
export async function load(get) { try { return (await get('/su/data/su21.json')) ?? null; } catch { return null; } }

const NEED = '확인 필요';
const KEY = ['hot', 'bloom', 'money'];
const KIND = {hot: '불장', bloom: '꽃이 될', money: '돈이 몰리는'};
const KINDN = {hot: '불장이 될 듯', bloom: '꽃이 될 듯', money: '돈이 몰릴 듯'};
const NXK = {hot: 'hotNext', bloom: 'bloomNext', money: 'moneyNext'};
const W = 390, PI = Math.PI;
const fin = v => typeof v === 'number' && Number.isFinite(v);
const NF = new Intl.NumberFormat('ko-KR');
const r1 = v => Math.round(v * 10) / 10;
let UID = 0;

/* ── 값 글(su-women-e.js 의 valText 와 같은 셈) ── */
const pct = x => (x > 0 ? '+' : x < 0 ? '−' : '') + Math.abs(x).toFixed(1) + '%';
function valText(c, k, nx = false) {
  if (nx) {
    const w = c?.why ?? {};
    if (k === 'hot') return fin(w.r20) ? pct(w.r20) : NEED;
    if (k === 'money') return fin(w.gain) ? (w.gain >= 0 ? '+' : '−') + NF.format(Math.abs(Math.round(w.gain))) + '억' : NEED;
    return fin(w.x5) ? pct(w.x5) : NEED;
  }
  if (k === 'hot') return fin(c?.ch20) ? (c.ch20 > 0 ? '+' : c.ch20 < 0 ? '−' : '') + Math.abs(c.ch20).toFixed(1) + '%' : NEED;
  if (k === 'money') { const g = c?.why?.gain; return fin(g) ? (g >= 0 ? '+' : '−') + NF.format(Math.abs(Math.round(g))) + '억' : NEED; }
  return c?.why?.full === true ? '꽃' : '싹';
}
/** 글 넓이 어림(굵은 글) */
function est(t, px) {
  let w = 0;
  for (const ch of String(t)) {
    if (/[ᄀ-ᇿ㄰-㆏가-힯]/.test(ch)) w += 0.94;
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
const SUFFIX = ['인터내셔널', '글로비스', '글로벌', '홀딩스', '헬스케어', '조선해양', '건설기계', '에너지', '솔루션', '드래곤', '시멘트', '신세계', '항공우주', '식품', '진로', '생명', '해상', '화재', '항공', '칠성', '티앤씨', '링크', '게이트', '윈드'];
function split2(name) {
  const t = String(name);
  const sp = [...t.matchAll(/ /g)].map(m => m.index);
  if (sp.length) { const mid = t.length / 2, i = sp.reduce((a, b) => (Math.abs(b - mid) < Math.abs(a - mid) ? b : a)); return [t.slice(0, i), t.slice(i + 1)]; }
  for (const suf of SUFFIX) if (t.endsWith(suf) && t.length - suf.length >= 2) return [t.slice(0, t.length - suf.length), suf];
  const m = /^([A-Za-z0-9&]+)([가-힯].*)$/.exec(t);
  if (m) return [m[1], m[2]];
  const hh = Math.ceil(t.length / 2);
  return [t.slice(0, hh), t.slice(hh)];
}

/* ── 모양 도우미 ── */
function crPts(P, step = 8, closed = false) {
  const out = [], n = P.length, at = i => (closed ? P[(i + n) % n] : P[Math.max(0, Math.min(n - 1, i))]);
  for (let i = 0; i < (closed ? n : n - 1); i++) {
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
const openD = P => 'M' + crPts(P, 6).map(pt).join('L');
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
/** 붓 선 — 굵게 시작해 끝으로 가늘게 */
const brush = (Q, w0) => bandD(crPts(Q, 8), t => w0 * Math.min(1, t / 0.07 + 0.25) * Math.pow(1 - t, 0.9) + 0.25);
const dotD = (x, y, r) => `M${r1(x - r)} ${r1(y)}a${r1(r)} ${r1(r)} 0 1 0 ${r1(2 * r)} 0a${r1(r)} ${r1(r)} 0 1 0 ${r1(-2 * r)} 0`;
function petalsD(x, y, r, n, wd = 0.42, rot = 0) {
  let d = '';
  for (let i = 0; i < n; i++) {
    const a = rot + i * 2 * PI / n, ca = Math.cos(a), sa = Math.sin(a), px = -sa * r * wd, py = ca * r * wd;
    d += `M${r1(x)} ${r1(y)}Q${r1(x + ca * r * 0.5 + px)} ${r1(y + sa * r * 0.5 + py)} ${r1(x + ca * r)} ${r1(y + sa * r)}Q${r1(x + ca * r * 0.5 - px)} ${r1(y + sa * r * 0.5 - py)} ${r1(x)} ${r1(y)}Z`;
  }
  return d;
}
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
/** 늘어진 곡선(진주 줄) 위 점 */
function sag(a, b, dip, n) { const out = []; for (let i = 0; i <= n; i++) { const t = i / n; out.push([a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t + dip * 4 * t * (1 - t)]); } return out; }

/* ── 여인(제 자리 — 얼굴 가운데 0,0 · 단위 h · 오른쪽을 봄 · 발바닥 8.28h) ── */
const JACKET = [[-0.2, 0.9], [-0.5, 0.98], [-0.66, 1.16], [-0.69, 1.6], [-0.6, 2.1], [-0.47, 2.55], [-0.6, 3.0], [-0.69, 3.42], [-0.3, 3.5], [0.1, 3.52], [0.62, 3.42], [0.57, 2.98], [0.44, 2.55], [0.57, 2.1], [0.68, 1.65], [0.67, 1.18], [0.54, 0.98], [0.22, 0.9]];
const SKIRT = [[-0.46, 2.6], [-0.62, 3.2], [-0.69, 4.1], [-0.7, 4.98], [-0.3, 5.05], [0.1, 5.07], [0.69, 4.98], [0.66, 4.1], [0.6, 3.2], [0.44, 2.6]];
const DRESS = [[-0.2, 0.92], [-0.5, 1.0], [-0.64, 1.18], [-0.66, 1.62], [-0.55, 2.1], [-0.44, 2.55], [-0.58, 3.1], [-0.68, 3.8], [-0.73, 4.6], [-0.74, 5.02], [-0.3, 5.09], [0.1, 5.11], [0.73, 5.01], [0.7, 4.6], [0.64, 3.8], [0.56, 3.1], [0.42, 2.55], [0.52, 2.1], [0.62, 1.64], [0.62, 1.2], [0.5, 1.0], [0.22, 0.92]];
const LEG_W = [[-0.47, 4.86], [-0.42, 5.6], [-0.46, 6.25], [-0.36, 7.0], [-0.27, 7.84], [-0.12, 7.86], [-0.11, 7.0], [-0.1, 6.3], [-0.16, 5.65], [-0.06, 4.86]];
const LEG_R = [[0.06, 4.86], [0.12, 5.62], [0.08, 6.3], [0.1, 7.0], [0.12, 7.74], [0.27, 7.74], [0.28, 7.0], [0.36, 6.28], [0.42, 5.6], [0.5, 4.86]];
/** 투톤 구두(베이지 · 검정 코) — 발목 가운데 (ax, ay) · 앞은 +u */
function shoe(P, ax, ay, lift = 0) {
  const Q = pts => P(pts.map(([u, v]) => [ax + u, ay + v - lift * (v > 0.2 ? 1 : 0)]));
  const body = Q([[-0.13, -0.04], [0.06, 0.02], [0.2, 0.2], [0.31, 0.34], [0.32, 0.43], [0.15, 0.43], [0.0, 0.3], [-0.12, 0.2], [-0.17, 0.08]]);
  const cap = Q([[0.17, 0.18], [0.2, 0.2], [0.31, 0.34], [0.32, 0.43], [0.15, 0.43], [0.12, 0.33]]);
  const heel = Q([[-0.12, 0.19], [-0.11, 0.33], [-0.1, 0.44]]);
  return [s('path', {d: closedD(body), class: 's4-shoe'}), s('path', {d: closedD(cap), class: 's4-toe'}), s('path', {d: bandD(crPts(heel, 4), t => 0.06 * (1 - t) * 40 / 40 * 1 + 0.6), class: 's4-toe'})];
}
/** 여인 — o: {k, x, y, h, dir, view, tone, iris, seed, look: 'wjacket' | 'bjacket' | 'dress', bend} */
function lady(o) {
  const {k, h} = o, bend = bendFn(o.bend), b0 = bend(0);
  const P = pts => pts.map(([u, v]) => [(u + bend(v) - b0) * h, v * h]);
  const g = s('g', {class: 's4-w s4-w-' + k, 'data-body': k, transform: `translate(${r1(o.x)} ${r1(o.y)})` + (o.dir < 0 ? ' scale(-1 1)' : '')});
  const body = s('g', {class: 's4-sway s4-sw-' + k});
  g.append(body);
  const dark = o.look !== 'wjacket';
  /* 1 등 뒤 머리 — 어깨 아래로 S 로 흘러 끝이 말리는 다발(무하 머리채) */
  const hb = P([[-0.36, -0.4], [-0.74, 0.18], [-0.9, 0.86], [-0.78, 1.5], [-0.96, 2.1], [-1.16, 2.44]]);
  body.append(s('g', {class: 'mk-hair mk-t' + o.tone, 'data-mucha': 'whiplash'}, s('g', {class: 'mk-sway'},
    strands(hb, {n: 3, spread: h * 0.3, w0: h * 0.15, w1: 0.4, curl: 1, seed: o.seed * 3 + 1, cls: 'mk-hb'}),
    strands(hb, {n: 2, spread: h * 0.18, w0: h * 0.045, w1: 0.15, curl: 1, seed: o.seed * 3 + 2, cls: 'mk-hd'}))));
  /* 2 다리(검정 스타킹) · 투톤 구두 */
  body.append(s('path', {d: closedD(P(LEG_W)) + closedD(P(LEG_R)), class: 's4-leg'}),
    s('path', {d: lens(P([[-0.36, 5.75], [-0.38, 6.3], [-0.3, 7.1]]), h * 0.06) + lens(P([[0.3, 5.75], [0.3, 6.3], [0.22, 7.0]]), h * 0.05), class: 's4-legl'}),
    ...shoe(P, -0.2, 7.84), ...shoe(P, 0.19, 7.74, 0.08));
  /* 3 옷 — 치마 · 재킷(트위드) 또는 검정 원피스 */
  const cl = o.look === 'wjacket' ? 'w' : 'b';
  if (o.look === 'dress') {
    body.append(s('path', {d: closedD(P(DRESS)), class: 's4-dress'}),
      s('path', {d: lens(P([[0.36, 1.4], [0.5, 1.8], [0.46, 2.2]]), h * 0.12) + lens(P([[0.3, 3.3], [0.46, 4.1], [0.5, 4.9]]), h * 0.16), class: 's4-sheen'}),
      s('path', {d: lens(P([[-0.4, 2.62], [0, 2.7], [0.4, 2.62]]), h * 0.09), class: 's4-belt'}));
    let fd = '';
    for (const f of [[[-0.36, 3.1], [-0.5, 4.0], [-0.56, 4.95]], [[0.0, 3.2], [-0.04, 4.1], [-0.08, 5.0]], [[0.3, 3.1], [0.4, 4.0], [0.46, 4.95]]]) fd += lens(P(f), 0.9);
    body.append(s('path', {d: fd, class: 's4-fold-b'}));
    /* 흰 깃(둥근 깃 둘) */
    body.append(s('path', {d: closedD(P([[-0.02, 0.98], [-0.3, 0.94], [-0.42, 1.1], [-0.3, 1.3], [-0.04, 1.22]])) + closedD(P([[0.02, 0.98], [0.3, 0.94], [0.42, 1.1], [0.3, 1.3], [0.04, 1.22]])), class: 's4-collar'}));
  } else {
    body.append(s('path', {d: closedD(P(SKIRT)), class: 's4-tw-' + (dark ? 'b' : 'b')}));
    body.append(s('path', {d: openD(P([[-0.7, 4.95], [-0.3, 5.02], [0.1, 5.04], [0.69, 4.95]])), class: 's4-br0-b'}), s('path', {d: openD(P([[-0.7, 4.95], [-0.3, 5.02], [0.1, 5.04], [0.69, 4.95]])), class: 's4-br1-b'}));
    let fd = '';
    for (const f of [[[-0.3, 3.6], [-0.42, 4.95]], [[0.1, 3.6], [0.12, 5.0]], [[0.4, 3.6], [0.5, 4.92]]]) fd += lens(P(f), 0.8);
    body.append(s('path', {d: fd, class: 's4-fold-b'}));
    body.append(s('path', {d: closedD(P(JACKET)), class: 's4-tw-' + cl}),
      s('path', {d: lens(P([[0.34, 1.35], [0.52, 1.75], [0.5, 2.2]]), h * 0.12) + lens(P([[-0.5, 2.9], [-0.56, 3.2], [-0.5, 3.4]]), h * 0.08), class: 's4-sheen'}));
    /* 땋은 테 — 목둘레 · 앞섶 · 밑단 · 주머니 둘 */
    const edges = [[[-0.2, 0.92], [-0.08, 1.06], [0.06, 1.06], [0.2, 0.92]], [[0.04, 1.06], [0.06, 2.2], [0.08, 3.5]], [[-0.68, 3.4], [-0.3, 3.48], [0.1, 3.5], [0.6, 3.4]],
      [[0.18, 2.86], [0.48, 2.84]], [[-0.52, 2.9], [-0.2, 2.92]]];
    for (const e of edges) body.append(s('path', {d: openD(P(e)), class: 's4-br0-' + cl}), s('path', {d: openD(P(e)), class: 's4-br1-' + cl}));
    let bt = '';
    for (const v of [1.5, 2.0, 2.5, 3.0]) bt += dotD(...P([[0.1, v]])[0], h * 0.045);
    body.append(s('path', {d: bt, class: 's4-btn'}));
  }
  /* 4 얼굴 · 머리(부품) · 검정 리본 */
  const head = s('g', {transform: `rotate(${o.tilt ?? 0})`});
  head.append(hair({cx: 0, cy: 0, h, dir: 1, tone: o.tone, len: 2.2, seed: o.seed, view: o.view}),
    face({cx: 0, cy: 0, h, dir: 1, view: o.view, tilt: 0, iris: o.iris}));
  const bx = -0.52 * h, by = -0.42 * h;
  head.append(s('path', {d: `M${r1(bx)} ${r1(by)}C${r1(bx - 0.3 * h)} ${r1(by - 0.34 * h)} ${r1(bx - 0.46 * h)} ${r1(by + 0.02 * h)} ${r1(bx)} ${r1(by)}ZM${r1(bx)} ${r1(by)}C${r1(bx + 0.06 * h)} ${r1(by - 0.42 * h)} ${r1(bx + 0.3 * h)} ${r1(by - 0.3 * h)} ${r1(bx)} ${r1(by)}Z`
    + bandD(crPts([[bx, by], [bx - 0.1 * h, by + 0.3 * h], [bx - 0.04 * h, by + 0.62 * h]], 5), t => h * 0.07 * (1 - t) + 0.6) + bandD(crPts([[bx, by], [bx + 0.08 * h, by + 0.34 * h], [bx + 0.16 * h, by + 0.58 * h]], 5), t => h * 0.06 * (1 - t) + 0.6), class: 's4-bow'}),
    s('path', {d: dotD(bx, by, h * 0.06), class: 's4-bow2'}));
  body.append(head);
  /* 5 진주 여러 줄 */
  let pe = '', ph = '';
  [[0.3, 9], [0.55, 12], [0.86, 15]].forEach(([dip, n], i) => {
    for (const q of sag([-0.24 - i * 0.04, 0.98], [0.26 + i * 0.04, 0.98], dip, n).slice(1, -1)) { const [x, y] = P([q])[0]; pe += dotD(x, y, h * 0.036); ph += dotD(x + h * 0.012, y - h * 0.012, h * 0.012); }
  });
  body.append(s('path', {d: pe, class: 's4-pearl'}), s('path', {d: ph, class: 's4-pearlh'}));
  /* 6 팔과 든 것 */
  const tone = dark ? 'cream' : 'ivory';
  const sl = (from, to, hand, w = h * 0.36) => { const [a, b] = P([from, to]), vx = b[0] - a[0], vy = b[1] - a[1]; return sleeve({x: r1(a[0]), y: r1(a[1]), ang: r1(Math.atan2(-vx, vy) * 180 / PI), len: Math.max(8, Math.hypot(vx, vy) - w * 0.32), w, hand, dir: 1, tone}); };
  const arms = s('g', {class: 's4-arms s4-cl-' + cl});
  if (k === 'hot') { // 바깥 팔로 금 횃불을 머리 위로 · 앞 손은 허리에
    const [tx, ty] = P([[-0.58, -1.16]])[0];
    arms.append(sl([-0.48, 1.08], [-0.58, -0.82], 'hold'), torch(tx, ty, h * 0.78), sl([0.5, 1.1], [0.72, 2.95], 'rest'));
  } else if (k === 'bloom') { // 동백 한 송이를 가슴 앞에
    const [fx, fy] = P([[0.2, 1.72]])[0];
    arms.append(sl([-0.5, 1.1], [-0.66, 3.0], 'rest'), sl([0.5, 1.1], [0.16, 2.3], 'hold'), camellia(fx, fy, h));
  } else { // 마름모 누빔 가방(금 사슬) — 앞 손에 듦
    const [gx, gy] = P([[0.66, 3.3]])[0];
    arms.append(sl([-0.5, 1.1], [-0.12, 2.36], 'hold'), bag(gx, gy, h), sl([0.5, 1.1], [0.7, 2.9], 'rest'));
  }
  body.append(arms);
  return g;
}
/** 금 횃불 — 손 위 (x, y) · 불꽃 세 갈래 */
function torch(x, y, h) {
  const b = y - h * 0.2, X = (u, v) => [x + u * h, b - v * h];
  const tongue = (Q, w0) => bandD(crPts(Q, 8), t => w0 * (t < 0.16 ? 0.6 + 0.4 * t / 0.16 : Math.pow(1 - (t - 0.16) / 0.84, 1.2)) + 0.25);
  return s('g', {class: 's4-torch', 'data-held': 'torch', 'data-mucha': 'whiplash'},
    s('path', {d: bandD(crPts([[x, y + h * 0.42], [x, b + h * 0.06]], 4), t => h * 0.07 + 0.3), class: 's4-gold'}),
    s('path', {d: tongue([X(-0.06, 0), X(-0.3, 0.38), X(-0.26, 0.8), X(-0.44, 1.12)], h * 0.28) + tongue([X(0.06, 0), X(0.3, 0.4), X(0.28, 0.84), X(0.46, 1.16)], h * 0.28) + tongue([X(0, 0), X(0.16, 0.56), X(-0.1, 1.1), X(0.06, 1.64)], h * 0.44), class: 's4-fire'}),
    s('path', {d: tongue([X(0, 0), X(0.1, 0.4), X(-0.06, 0.8), X(0.04, 1.12)], h * 0.22), class: 's4-fire2'}),
    s('path', {d: `M${r1(x - h * 0.24)} ${r1(b)}Q${r1(x)} ${r1(b + h * 0.3)} ${r1(x + h * 0.24)} ${r1(b)}Z`, class: 's4-gold'}));
}
/** 흰 동백 한 송이 */
function camellia(x, y, h) {
  const r = h * 0.3;
  return s('g', {class: 's4-cam', 'data-held': 'camellia'},
    s('path', {d: petalsD(x - r * 0.9, y + r * 0.5, r * 0.9, 2, 0.32, 2.4), class: 's4-leaf'}),
    s('path', {d: petalsD(x, y, r, 7, 0.7, 0.3), class: 's4-cam1'}), s('path', {d: petalsD(x, y, r * 0.66, 6, 0.7, 0.8), class: 's4-cam2'}),
    s('path', {d: petalsD(x, y, r * 0.36, 5, 0.7, 1.2), class: 's4-cam1'}), s('path', {d: dotD(x, y, r * 0.16), class: 's4-gold'}));
}
/** 평범한 마름모 누빔 가방 · 금 사슬 끈(손 (x, y) 에서 늘어짐) */
function bag(x, y, h) {
  const w = h * 0.84, hh = h * 0.6, x0 = x - w * 0.5, y0 = y + h * 0.5;
  let q = '';
  for (let i = -3; i <= 3; i++) { q += `M${r1(x0 + w * (i / 3))} ${r1(y0)}L${r1(x0 + w * (i / 3) + hh)} ${r1(y0 + hh)}M${r1(x0 + w * (i / 3) + w * 0.333)} ${r1(y0)}L${r1(x0 + w * (i / 3) + w * 0.333 - hh)} ${r1(y0 + hh)}`; }
  const id = 's4bag' + (++UID);
  return s('g', {class: 's4-bag', 'data-held': 'bag'},
    s('path', {d: `M${r1(x0 + w * 0.12)} ${r1(y0)}Q${r1(x)} ${r1(y - h * 0.2)} ${r1(x0 + w * 0.88)} ${r1(y0)}`, class: 's4-chain'}),
    s('clipPath', {id}, s('rect', {x: r1(x0), y: r1(y0), width: r1(w), height: r1(hh), rx: r1(h * 0.08)})),
    s('rect', {x: r1(x0), y: r1(y0), width: r1(w), height: r1(hh), rx: r1(h * 0.08), class: 's4-bagb'}),
    s('path', {d: q, class: 's4-quilt', 'clip-path': `url(#${id})`}),
    s('path', {d: `M${r1(x0)} ${r1(y0 + hh * 0.34)}Q${r1(x)} ${r1(y0 + hh * 0.5)} ${r1(x0 + w)} ${r1(y0 + hh * 0.34)}`, class: 's4-flap'}),
    s('path', {d: `M${r1(x - h * 0.07)} ${r1(y0 + hh * 0.4)}h${r1(h * 0.14)}v${r1(h * 0.09)}h${r1(-h * 0.14)}Z`, class: 's4-gold'}));
}

/* ── 그림 ── */
export function picture(d, opt = {}) {
  const id = 's4' + (++UID);
  const L0 = d?.lists ?? {};
  const okNow = KEY.every(k => Array.isArray(L0[k]) && L0[k].length), okNx = KEY.every(k => Array.isArray(L0[NXK[k]]) && L0[NXK[k]].length);
  const ovs = new Set((d?.overlap ?? []).map(o => o.name));
  const items = (k, nx) => (L0[nx ? NXK[k] : k] ?? []).slice(0, 7).map(c => ({k: nx ? NXK[k] : k, base: k, nx, code: String(c.code ?? ''), name: String(c.name ?? NEED), val: valText(c, k, nx), star: !nx && ovs.has(String(c.name))}));
  const nNow = okNow ? KEY.reduce((a, k) => a + Math.min(7, L0[k].length), 0) : null, nNx = okNx ? KEY.reduce((a, k) => a + Math.min(7, L0[NXK[k]].length), 0) : null;

  /* 자리 — 칸 넷(폭 94.5) · 위 = 기둥 머리 + 불장 칸 · 가운데 무대 · 아래 = 꽃 · 돈 칸 넷 */
  const CX = [12, 103.5, 197, 288.5], CWD = 89.5, HEAD = 90, HDR = 34, ROW = 60; // 바깥 12 — 쪽 금테(안 6 · 10)가 글을 긋지 않게
  const ROW2 = 62, T0 = HEAD + HDR, TE = T0 + 7 * ROW, L1 = TE + 6, LH = L1 + HDR, H = LH + 7 * ROW2 + 4;
  const SL = CX[1] + 1, SR = CX[2] + CWD - 1, SX = (SL + SR) / 2, FT = 488;
  const day = d?.asOf?.board ?? null;
  const svg = s('svg', {class: 'su-svg su-art4 s4', 'data-show': 'now-next', viewBox: `0 0 ${W} ${H}`, role: 'img', preserveAspectRatio: 'xMidYMid meet',
    'aria-label': (okNow && okNx) ? `검은 무대 그림 · 세 여인 · 왼쪽 기둥 지금 ${nNow}곳 · 오른쪽 기둥 될 듯 ${nNx}곳` + (day ? ' · ' + day + ' 자료' : '') : '검은 무대 그림 · 세 여인 · 자료 ' + NEED});
  const defs = s('defs');
  /* 트위드 결(검정 · 흰) · 조명 빛줄기 · 후광 빛 */
  const tw = (pid, base, a, b, c) => s('pattern', {id: pid, width: 5, height: 5, patternUnits: 'userSpaceOnUse', patternTransform: 'rotate(20)'},
    s('rect', {width: 5, height: 5, class: base}), s('path', {d: 'M0.4 0.8h1.6v0.7h-1.6zM2.8 3.1h1.5v0.7h-1.5z', class: a}), s('path', {d: 'M3.2 0.4h0.7v1.3h-0.7zM0.9 2.9h0.7v1.4h-0.7z', class: b}), s('path', {d: 'M2.1 2.0h0.6v0.6h-0.6z', class: c}));
  defs.append(tw('s4twB', 's4-twb0', 's4-twb1', 's4-twb2', 's4-twg'), tw('s4twW', 's4-tww0', 's4-tww1', 's4-tww2', 's4-twg'),
    s('linearGradient', {id: 's4cone', x1: 0, y1: 0, x2: 0, y2: 1}, s('stop', {offset: 0, class: 's4-st0'}), s('stop', {offset: 0.55, class: 's4-st1'}), s('stop', {offset: 1, class: 's4-st2'})),
    s('radialGradient', {id: 's4halo'}, s('stop', {offset: 0, class: 's4-hs0'}), s('stop', {offset: 0.7, class: 's4-hs1'}), s('stop', {offset: 1, class: 's4-hs2'})),
    s('radialGradient', {id: 's4pool'}, s('stop', {offset: 0, class: 's4-ps0'}), s('stop', {offset: 1, class: 's4-ps1'})),
    s('radialGradient', {id: 's4wash'}, s('stop', {offset: 0, class: 's4-ws0'}), s('stop', {offset: 0.6, class: 's4-ws1'}), s('stop', {offset: 1, class: 's4-ws2'})),
    s('clipPath', {id: id + 's'}, s('rect', {x: SL, y: 0, width: SR - SL, height: L1 - 3})));
  svg.append(defs);
  svg.append(s('rect', {x: 0, y: 0, width: W, height: H, rx: 18, class: 's4-bg'}));

  /* 1 무대 — 빛 점 벽 · 아치 · 조명 셋 · 바닥 */
  const stage = s('g', {'clip-path': `url(#${id}s)`});
  let dim = '', lit = '';
  for (let y = 16, j = 0; y < FT - 4; y += 10, j++) for (let x = SL + 7, i = 0; x < SR - 3; x += 10, i++) { if ((i * 7 + j * 3) % 11 === 0 && y < 300) lit += dotD(x, y, 1.5); else dim += dotD(x, y, 1.1); }
  stage.append(s('ellipse', {cx: SX, cy: 300, rx: 150, ry: 260, class: 's4-wash'}),
    s('g', {'data-mucha': 'stars'}, s('path', {d: dim, class: 's4-led'}), s('path', {d: lit, class: 's4-led2'})));
  const F = {
    hot: {k: 'hot', x: SX - 52, y: 150, h: 43, dir: 1, view: 'three', tilt: -8, tone: 4, iris: 0, seed: 2, look: 'wjacket', bend: [[-1.2, 0.18], [1.0, 0.1], [2.6, -0.1], [3.4, -0.2], [5.0, -0.06], [6.6, 0.04], [8.2, 0.08]]},
    bloom: {k: 'bloom', x: SX + 2, y: 124, h: 49, dir: 1, view: 'three', tilt: 6, tone: 2, iris: 1, seed: 5, look: 'dress', bend: [[-1.2, 0.12], [1.0, 0.06], [2.6, -0.1], [3.4, -0.18], [5.0, -0.06], [6.6, 0.06], [8.2, 0.1]]},
    money: {k: 'money', x: SX + 54, y: 150, h: 43, dir: -1, view: 'three', tilt: 8, tone: 0, iris: 2, seed: 8, look: 'bjacket', bend: [[-1.2, 0.2], [1.0, 0.12], [2.6, -0.1], [3.4, -0.22], [5.0, -0.08], [6.6, 0.04], [8.2, 0.08]]},
  };
  F.hot.foot = F.hot.y + 8.28 * F.hot.h; F.money.foot = F.money.y + 8.28 * F.money.h; F.bloom.foot = F.bloom.y + 8.28 * F.bloom.h;
  /* 아치(무하) — 두 기둥 머리를 잇는 무대 틀 */
  const AT = 30, archD = `M${SL} ${HEAD + 6}C${SL} ${AT + 10} ${SX - 60} ${AT - 6} ${SX} ${AT - 6}C${SX + 60} ${AT - 6} ${SR} ${AT + 10} ${SR} ${HEAD + 6}`;
  /* 조명 셋 — 아치 밑 등에서 여인 발치까지 */
  const lamps = s('g', {class: 's4-lamps', 'data-mucha': 'halo'});
  const cones = s('g', {class: 's4-cones'});
  ['hot', 'bloom', 'money'].forEach((k, i) => {
    const f = F[k], lx = SX + (i - 1) * 46, ly = AT + 12 + (i === 1 ? -4 : 6), fx = f.x + (k === 'hot' ? -4 : k === 'money' ? 4 : 0), fy = f.foot;
    cones.append(s('g', {class: 's4-cone s4-c' + i}, s('path', {d: `M${r1(lx - 5)} ${r1(ly)}L${r1(fx - 46)} ${r1(fy)}Q${r1(fx)} ${r1(fy + 10)} ${r1(fx + 46)} ${r1(fy)}L${r1(lx + 5)} ${r1(ly)}Z`, class: 's4-beam'}),
      s('ellipse', {cx: r1(fx), cy: r1(fy - 1), rx: 44, ry: 8, class: 's4-pool'})));
    lamps.append(s('path', {d: `M${r1(lx - 7)} ${r1(ly - 7)}h14l-3 7h-8Z`, class: 's4-lamp'}), s('path', {d: dotD(lx, ly + 0.5, 3.2), class: 's4-bulb s4-b' + i}));
  });
  stage.append(cones);
  /* 후광 셋(조명이 뒤 벽에 맺힌 둥근 빛 · 금 테) */
  const halos = s('g', {'data-mucha': 'halo'});
  for (const k of ['hot', 'money', 'bloom']) { const f = F[k], cx = f.x + f.dir * -0.12 * f.h, cy = f.y - 0.18 * f.h, r = f.h * 1.2; halos.append(s('circle', {cx: r1(cx), cy: r1(cy), r: r1(r), class: 's4-halo'}), rays(cx, cy, r * 0.34, r * 0.96, {n: 28}), s('circle', {cx: r1(cx), cy: r1(cy), r: r1(r), class: 's4-hrim'}), s('circle', {cx: r1(cx), cy: r1(cy), r: r1(r - 3.2), class: 's4-hrim2'})); }
  stage.append(halos);
  /* 바닥 — 반짝이는 검은 바닥 줄 */
  stage.append(s('path', {d: `M${SL} ${FT}L${SR} ${FT}L${SR} ${L1}L${SL} ${L1}Z`, class: 's4-floor'}),
    s('path', {d: `M${SL} ${FT}H${SR}M${SL} ${FT + 20}H${SR}M${SL} ${FT + 44}H${SR}`, class: 's4-fline'}));
  /* 여인 셋 — 양옆이 뒤 · 가운데(센터)가 앞 */
  const people = s('g', {'data-mucha': 'outline', id: id + 'p'});
  for (const k of ['hot', 'money', 'bloom']) people.append(lady(F[k]));
  /* 반짝이는 바닥 — 센터 발밑에 비친 모습(옅게 · 바닥 띠 안만) */
  const fy = r1(F.bloom.foot);
  defs.append(s('clipPath', {id: id + 'f'}, s('rect', {x: SL, y: fy, width: SR - SL, height: L1 - 3 - fy})));
  stage.append(s('g', {'clip-path': `url(#${id}f)`}, s('use', {href: '#' + id + 'p', transform: `translate(0 ${r1(2 * fy)}) scale(1 -1)`, class: 's4-refl'})));
  stage.append(people, lamps);
  svg.append(stage);
  const AY = 15.5, ax0 = SL + 4, ax1 = SR - 6;
  svg.append(s('g', {class: 's4-time', 'data-mucha': 'whiplash'}, s('path', {d: bandD(crPts([[ax0, AY], [SX, AY - 1.5], [ax1 - 6, AY]], 8), t => 2.2 * (1 - t) + 0.9), class: 's4-gold'}),
    s('path', {d: `M${r1(ax1 + 3)} ${AY}L${r1(ax1 - 8)} ${r1(AY - 6)}L${r1(ax1 - 5)} ${AY}L${r1(ax1 - 8)} ${r1(AY + 6)}Z`, class: 's4-gold'})));
  svg.append(s('g', {'data-mucha': 'arch'}, s('path', {d: archD, class: 's4-arch'}), s('path', {d: archD.replace(/(\d+(?:\.\d+)?) (\d+(?:\.\d+)?)/g, (m, a, b) => a + ' ' + r1(+b + 5)), class: 's4-arch2'})));

  /* 2 기둥 둘(ㄴ 자) — 테 · 가장자리 전구 줄 */
  const lpath = (xa, xb, xc, flip) => { // xa 바깥 칸 · xb 안쪽 칸 끝
    const r = 10, y0 = 2, y1 = L1 - 2, y2 = H - 2;
    return flip
      ? `M${xa + CWD - r} ${y0}A${r} ${r} 0 0 1 ${xa + CWD} ${y0 + r}V${y2 - r}A${r} ${r} 0 0 1 ${xa + CWD - r} ${y2}H${xc + r}A${r} ${r} 0 0 1 ${xc} ${y2 - r}V${y1 + r}A${r} ${r} 0 0 1 ${xc + r} ${y1}H${xa - 1}V${y0 + r}A${r} ${r} 0 0 1 ${xa + r} ${y0}Z`
      : `M${xa + r} ${y0}H${xa + CWD - r}A${r} ${r} 0 0 1 ${xa + CWD} ${y0 + r}V${y1}H${xb - r}A${r} ${r} 0 0 1 ${xb} ${y1 + r}V${y2 - r}A${r} ${r} 0 0 1 ${xb - r} ${y2}H${xa + r}A${r} ${r} 0 0 1 ${xa} ${y2 - r}V${y0 + r}A${r} ${r} 0 0 1 ${xa + r} ${y0}Z`;
  };
  const pilL = lpath(CX[0], CX[1] + CWD, 0, false), pilR = lpath(CX[3], 0, CX[2], true);
  const pillars = s('g', {'data-mucha': 'panel'}, s('path', {d: pilL, class: 's4-pil s4-pil-now'}), s('path', {d: pilR, class: 's4-pil s4-pil-nx'}),
    s('path', {d: pilL, class: 's4-pfr'}), s('path', {d: pilR, class: 's4-pfr'}));
  svg.append(pillars);

  /* 3 기둥 머리 — 큰 숫자 21 둘(지금 · 될 듯) */
  const lettering = s('g', {'data-mucha': 'lettering'});
  const headG = (x, label, n, nx) => s('g', {class: 's4-head' + (nx ? ' s4-rise' : '')},
    s('text', {x: r1(x + CWD / 2), y: 15.5, 'text-anchor': 'middle', 'dominant-baseline': 'central', class: 's4-hl', text: label}),
    s('text', {x: r1(x + CWD / 2), y: 59, 'text-anchor': 'middle', 'dominant-baseline': 'central', class: 's4-num' + (n == null ? ' s4-need' : ''), text: n == null ? NEED : String(n)}));
  const nowHead = headG(CX[0], '지금', nNow, false), nxHead = headG(CX[3], '될 듯', nNx, true);
  lettering.append(nowHead);

  /* 4 이름표 — 칸마다 일곱(차례 그대로) · 누름 자리 = 칸 한 줄 전체(94.5 × 60) */
  const PAD = 2.5, nW = CWD - 2 * PAD;
  const tag = (it, x0, y0, i, RH = ROW) => {
    const KN = it.nx ? KINDN : KIND;
    const a = s('a', {href: '#/c/' + encodeURIComponent(it.code), class: 's4-tag s4-t-' + it.base + ' s4-i' + i, 'data-k': it.k, 'data-name': it.name,
      'aria-label': it.name + ' · ' + KN[it.base] + ' · ' + it.val + (it.star ? ' · 두 목록에 함께' : '')});
    a.append(s('rect', {x: r1(x0), y: r1(y0), width: CWD, height: RH, class: 's4-hit'}));
    const st = it.star ? '✦ ' : '', cx = x0 + CWD / 2, cy = y0 + RH / 2;
    let rows;
    const nm = st + it.name;
    if (est(nm, 20) <= nW) rows = [[nm, 20, 0], [it.val, 20, 1]];
    else if (est(nm, 19.6) <= nW * 1.2) rows = [[nm, 19.6, 0], [it.val, 20, 1]];
    else if (st && est(it.name, 19.6) <= nW * 1.2) rows = [[it.name, 19.6, 0], [st + it.val, 20, 1]]; // ✦ 는 값 줄로
    else { const [p, q] = split2(it.name); rows = [[p, 18, 0], [q, 18, 0], [st + it.val, 18, 1]]; }
    const lh = rows.length === 3 ? (RH > 61 ? 20.4 : 19.8) : 22.5;
    rows.forEach(([t, px, v], j) => {
      const tx = s('text', {x: r1(cx), y: r1(cy + (j - (rows.length - 1) / 2) * lh), 'text-anchor': 'middle', 'dominant-baseline': 'central', class: (v ? 's4-val s4-v-' + it.base : 's4-name') + ' s4-f' + String(px).replace('.', ''), text: t});
      if (est(t, px) > nW) { tx.setAttribute('textLength', r1(nW)); tx.setAttribute('lengthAdjust', 'spacingAndGlyphs'); }
      a.append(tx);
    });
    return a;
  };
  /* 칸 머리 글(무하 글씨) + 칸 사이 가는 금줄 */
  const col = (x, yHdr, k, nx) => {
    const g = s('g', {class: 's4-col' + (nx ? ' s4-rise' : ' s4-now')});
    const word = KIND[k];
    const t = s('text', {x: r1(x + CWD / 2), y: r1(yHdr + HDR / 2 + 1), 'text-anchor': 'middle', 'dominant-baseline': 'central', class: 's4-ch s4-ch-' + k, text: word});
    if (est(word, 20) > nW - 2) { t.setAttribute('textLength', r1(nW - 2)); t.setAttribute('lengthAdjust', 'spacingAndGlyphs'); }
    g.append(t);
    let ln = '';
    const R = yHdr > HEAD ? ROW2 : ROW;
    for (let i = 1; i < 7; i++) { const y = yHdr + HDR + i * R; ln += `M${r1(x + 22)} ${y}H${r1(x + CWD - 22)}` + dotD(x + CWD / 2, y, 1.8); }
    ln += `M${r1(x + 12)} ${r1(yHdr + HDR - 2)}H${r1(x + CWD - 12)}`;
    g.append(s('path', {d: ln, class: 's4-sep'}));
    const list = items(k, nx);
    if (!list.length) g.append(s('text', {x: r1(x + CWD / 2), y: r1(yHdr + HDR + 40), 'text-anchor': 'middle', 'dominant-baseline': 'central', class: 's4-name s4-n20', text: NEED}));
    list.forEach((it, i) => g.append(tag(it, x, yHdr + HDR + i * R, i, R)));
    return g;
  };
  const nowG = s('g', {class: 's4-pnow'}), nxG = s('g', {class: 's4-pnx'});
  nowG.append(col(CX[0], HEAD, 'hot', false), col(CX[0], L1, 'bloom', false), col(CX[1], L1, 'money', false));
  nxG.append(nxHead, col(CX[3], HEAD, 'hot', true), col(CX[2], L1, 'bloom', true), col(CX[3], L1, 'money', true));
  lettering.append(nowG, nxG);
  svg.append(lettering);
  return svg;
}
