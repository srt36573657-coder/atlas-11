/* 쇼 판 합친 판(final · s04 바탕) — 잡스 발표 무대(주문 1249 · docs/design/su-show-2026-11-08/brief.md)
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
const JACKET0 = [[-0.2, 0.9], [-0.5, 0.98], [-0.66, 1.16], [-0.69, 1.6], [-0.6, 2.1], [-0.47, 2.55], [-0.6, 3.0], [-0.69, 3.42], [-0.3, 3.5], [0.1, 3.52], [0.62, 3.42], [0.57, 2.98], [0.44, 2.55], [0.57, 2.1], [0.68, 1.65], [0.67, 1.18], [0.54, 0.98], [0.22, 0.9]];
const SKIRT0 = [[-0.46, 2.6], [-0.62, 3.2], [-0.69, 4.1], [-0.7, 4.98], [-0.3, 5.05], [0.1, 5.07], [0.69, 4.98], [0.66, 4.1], [0.6, 3.2], [0.44, 2.6]];
const DRESS0 = [[-0.2, 0.92], [-0.5, 1.0], [-0.64, 1.18], [-0.66, 1.62], [-0.55, 2.1], [-0.44, 2.55], [-0.58, 3.1], [-0.68, 3.8], [-0.73, 4.6], [-0.74, 5.02], [-0.3, 5.09], [0.1, 5.11], [0.73, 5.01], [0.7, 4.6], [0.64, 3.8], [0.56, 3.1], [0.42, 2.55], [0.52, 2.1], [0.62, 1.64], [0.62, 1.2], [0.5, 1.0], [0.22, 0.92]];
/* 사장님 13:31 「섹시하게 · 아줌마 같아 · 예쁘게」 — 짧은 트위드 재킷(허리 위) · 무릎 위 짧은 치마 · 몸에 붙는 짧은 검정 원피스 · 긴 다리(무릎 아래를 1.16 배) */
const JACKET = [[-0.2, 0.9], [-0.46, 0.97], [-0.6, 1.12], [-0.62, 1.55], [-0.54, 2.0], [-0.44, 2.38], [-0.47, 2.52], [-0.2, 2.56], [0.1, 2.58], [0.47, 2.52], [0.44, 2.38], [0.52, 2.0], [0.62, 1.6], [0.6, 1.14], [0.48, 0.97], [0.22, 0.9]];
const SKIRT = [[-0.42, 2.4], [-0.56, 2.9], [-0.63, 3.4], [-0.62, 3.85], [-0.58, 4.12], [-0.3, 4.17], [0.1, 4.19], [0.58, 4.12], [0.62, 3.85], [0.6, 3.4], [0.54, 2.9], [0.42, 2.4]];
const DRESS = [[-0.2, 0.92], [-0.46, 0.99], [-0.6, 1.14], [-0.62, 1.58], [-0.52, 2.05], [-0.4, 2.5], [-0.53, 2.95], [-0.6, 3.45], [-0.6, 3.9], [-0.56, 4.14], [-0.3, 4.2], [0.1, 4.22], [0.58, 4.14], [0.6, 3.9], [0.58, 3.45], [0.51, 2.95], [0.38, 2.5], [0.5, 2.05], [0.6, 1.6], [0.6, 1.16], [0.48, 0.99], [0.22, 0.92]];
const LEG_W0 = [[-0.47, 4.86], [-0.42, 5.6], [-0.46, 6.25], [-0.36, 7.0], [-0.27, 7.84], [-0.12, 7.86], [-0.11, 7.0], [-0.1, 6.3], [-0.16, 5.65], [-0.06, 4.86]];
const LEG_W = [[-0.56, 4.3], [-0.52, 5.0], [-0.42, 5.62], [-0.47, 6.2], [-0.36, 7.0], [-0.27, 7.84], [-0.12, 7.86], [-0.11, 7.0], [-0.12, 6.3], [-0.17, 5.66], [-0.08, 5.0], [-0.02, 4.3]];
const LEG_R = [[0.02, 4.3], [0.08, 5.0], [0.1, 5.62], [0.03, 6.3], [-0.03, 7.0], [-0.06, 7.74], [0.09, 7.74], [0.14, 7.0], [0.27, 6.25], [0.4, 5.62], [0.52, 5.0], [0.55, 4.3]]; // 무대 걸음 — 앞 다리 무릎 아래가 안쪽으로(사장님 13:36 「섹시하게」)
const LS = 1.03, FOOT = 3.0 + 5.28 * LS; // 무릎 아래 늘임 — 평균보다 조금 긴 다리(지나치게 긴 다리는 덜 아름다움 · research-1342.md)
const LEG_R0 = [[0.06, 4.86], [0.12, 5.62], [0.08, 6.3], [0.1, 7.0], [0.12, 7.74], [0.27, 7.74], [0.28, 7.0], [0.36, 6.28], [0.42, 5.6], [0.5, 4.86]];
/** 투톤 구두(베이지 · 검정 코) — 발목 가운데 (ax, ay) · 앞은 +u */
function shoe(P, ax, ay, lift = 0) {
  const Q = pts => P(pts.map(([u, v]) => [ax + u, ay + v - lift * (v > 0.2 ? 1 : 0)]));
  const body = Q([[-0.13, -0.04], [0.06, 0.02], [0.2, 0.2], [0.31, 0.34], [0.32, 0.43], [0.15, 0.43], [0.0, 0.3], [-0.12, 0.2], [-0.17, 0.08]]);
  const cap = Q([[0.17, 0.18], [0.2, 0.2], [0.31, 0.34], [0.32, 0.43], [0.15, 0.43], [0.12, 0.33]]);
  const heel = Q([[-0.12, 0.19], [-0.11, 0.33], [-0.1, 0.44]]);
  return [s('path', {d: closedD(body), class: 'sh-shoe'}), s('path', {d: closedD(cap), class: 'sh-toe'}), s('path', {d: bandD(crPts(heel, 4), t => 0.06 * (1 - t) * 40 / 40 * 1 + 0.6), class: 'sh-toe'})];
}
/** 큰 깃털 날개 둘 — 날개 꼴(앞 날 · 깃 끝 물결 · 아래 끝) 셋을 겹침(바깥 · 가운데 · 안 덮깃) + 깃대 선 · 오른 날개 좌표를 왼쪽으로 뒤집어 씀 */
function wings(o) {
  const {h} = o, g = s('g', {class: 'sh-wings', 'aria-hidden': 'true'});
  const R = [0.16, 1.15], T = [1.15, -1.55], B = [0.7, 3.75];
  const cub = (p0, p1, p2, p3, n) => { const out = []; for (let i = 0; i <= n; i++) { const t = i / n, u = 1 - t; out.push([u * u * u * p0[0] + 3 * u * u * t * p1[0] + 3 * u * t * t * p2[0] + t * t * t * p3[0], u * u * u * p0[1] + 3 * u * u * t * p1[1] + 3 * u * t * t * p2[1] + t * t * t * p3[1]]); } return out; };
  const trail = cub(T, [1.95, -0.6], [1.75, 2.1], B, 9);
  for (const sg of [-1, 1]) {
    const X = ([u, v], k = 1) => [r1((R[0] + (u - R[0]) * k) * sg * h), r1((R[1] + (v - R[1]) * k) * h)];
    const wg = s('g', {class: 'sh-wing ' + (sg < 0 ? 'sh-wing-l' : 'sh-wing-r')});
    for (const [k, cls] of [[1, 'sh-wf0'], [0.74, 'sh-wf1'], [0.48, 'sh-wf2']]) {
      const p = q => X(q, k).join(' ');
      let d = `M${p(R)}C${p([0.3, 0.1])} ${p([0.6, -1.2])} ${p(T)}`;
      for (let i = 0; i < trail.length - 1; i++) {
        const a = trail[i], b = trail[i + 1], dx = b[0] - a[0], dy = b[1] - a[1], m = [(a[0] + b[0]) / 2 + dy * 0.5, (a[1] + b[1]) / 2 - dx * 0.5];
        d += `Q${p(m)} ${p(b)}`;
      }
      d += `C${p([0.45, 3.0])} ${p([0.2, 1.9])} ${p(R)}Z`;
      wg.append(s('path', {d, class: cls}));
    }
    let sh = '';
    for (const q of trail.slice(1, -1)) { const a = X([R[0] + (q[0] - R[0]) * 0.3, R[1] + (q[1] - R[1]) * 0.3]), b = X(q, 0.96); sh += `M${a[0]} ${a[1]}L${b[0]} ${b[1]}`; }
    wg.append(s('path', {d: sh, class: 'sh-wshaft'}));
    g.append(wg);
  }
  return g;
}
/** 여인 — o: {k, x, y, h, dir, view, tone, iris, seed, look: 'wjacket' | 'bjacket' | 'dress', bend} */
function lady(o) {
  const {k, h} = o, bend = bendFn(o.bend), b0 = bend(0);
  const P = pts => pts.map(([u, v]) => [(u + bend(v) - b0) * h, (v > 3 ? 3 + (v - 3) * LS : v) * h]);
  const g = s('g', {class: 'sh-w sh-w-' + k, 'data-body': k, id: o.id, transform: `translate(${r1(o.x)} ${r1(o.y)})` + (o.dir < 0 ? ' scale(-1 1)' : '')});
  const body = s('g', {class: 'sh-sway sh-sw-' + k});
  g.append(body);
  const dark = o.look !== 'wjacket';
  /* 1 등 뒤 머리 — 어깨 아래로 S 로 흘러 끝이 말리는 다발(무하 머리채) */
  const hb = P([[-0.22, -0.41], [-0.78, 0.12], [-0.98, 0.9], [-0.84, 1.7], [-1.02, 2.5], [-0.96, 3.25]]); // 풍성한 웨이브(무대 모델 머리)
  body.append(s('g', {class: 'mk-hair mk-t' + o.tone, 'data-mucha': 'whiplash'}, s('g', {class: 'mk-sway'},
    strands(hb, {n: 6, spread: h * 0.52, w0: h * 0.075, w1: 0.3, curl: 1.3, seed: o.seed * 3 + 1, cls: 'mk-hb'}),
    strands(P([[0.22, -0.41], [0.66, 0.2], [0.82, 1.0], [0.7, 1.8], [0.9, 2.5]]), {n: 4, spread: h * 0.34, w0: h * 0.06, w1: 0.25, curl: 1.2, seed: o.seed * 3 + 2, cls: 'mk-hb'}),
    strands(hb, {n: 3, spread: h * 0.26, w0: h * 0.022, w1: 0.12, curl: 1, seed: o.seed * 3 + 3, cls: 'mk-hd'}),
    strands(hb, {n: 2, spread: h * 0.3, w0: h * 0.03, w1: 0.1, curl: 0.6, seed: o.seed * 3 + 4, cls: 'mk-hl'}))));
  /* 2 다리(검정 스타킹) · 투톤 구두 */
  body.append(s('path', {d: closedD(P(LEG_W)), class: 'sh-leg'}), s('path', {d: closedD(P(LEG_R)), class: 'sh-leg'}), // 비치는 검정 스타킹 — 다리마다 둥근 빛(shleg)
    s('path', {d: lens(P([[-0.4, 4.5], [-0.36, 5.2], [-0.38, 6.3], [-0.3, 7.1]]), h * 0.07) + lens(P([[0.36, 4.5], [0.3, 5.3], [0.16, 6.3], [0.04, 7.0]]), h * 0.06), class: 'sh-legl'}),
    ...shoe(P, -0.2, 7.84), ...shoe(P, 0.03, 7.74, 0.08));
  /* 3 옷 — 치마 · 재킷(트위드) 또는 검정 원피스 */
  const cl = o.look === 'wjacket' ? 'w' : 'b';
  if (o.look === 'dress') {
    body.append(s('path', {d: closedD(P(DRESS)), class: 'sh-dress'}),
      s('path', {d: lens(P([[0.36, 1.4], [0.5, 1.8], [0.46, 2.2]]), h * 0.12) + lens(P([[0.3, 3.0], [0.44, 3.6], [0.46, 4.3]]), h * 0.14), class: 'sh-sheen'}),
      s('path', {d: lens(P([[-0.4, 2.62], [0, 2.7], [0.4, 2.62]]), h * 0.09), class: 'sh-belt'}));
    let fd = '';
    for (const f of [[[-0.34, 3.0], [-0.46, 3.6], [-0.5, 4.1]], [[0.28, 3.0], [0.38, 3.6], [0.42, 4.1]]]) fd += lens(P(f), 0.9);
    body.append(s('path', {d: fd, class: 'sh-fold-b'}));
    const hemD = [[-0.56, 4.14], [-0.3, 4.2], [0.1, 4.22], [0.58, 4.14]];
    body.append(s('path', {d: openD(P(hemD)), class: 'sh-br0-b'}), s('path', {d: openD(P(hemD)), class: 'sh-br1-b'}));
    /* 흰 깃(둥근 깃 둘) */
    body.append(s('path', {d: closedD(P([[-0.02, 0.98], [-0.3, 0.94], [-0.42, 1.1], [-0.3, 1.3], [-0.04, 1.22]])) + closedD(P([[0.02, 0.98], [0.3, 0.94], [0.42, 1.1], [0.3, 1.3], [0.04, 1.22]])), class: 'sh-collar'}));
  } else {
    body.append(s('path', {d: closedD(P(SKIRT)), class: 'sh-tw-' + (dark ? 'b' : 'b')}));
    const hemQ = [[-0.58, 4.1], [-0.3, 4.15], [0.1, 4.17], [0.58, 4.1]];
    body.append(s('path', {d: openD(P(hemQ)), class: 'sh-br0-b'}), s('path', {d: openD(P(hemQ)), class: 'sh-br1-b'}));
    let fd = '';
    for (const f of [[[-0.3, 3.0], [-0.4, 4.08]], [[0.36, 3.0], [0.46, 4.08]]]) fd += lens(P(f), 0.8);
    body.append(s('path', {d: fd, class: 'sh-fold-b'}));
    body.append(s('path', {d: closedD(P(JACKET)), class: 'sh-tw-' + cl}),
      s('path', {d: lens(P([[0.34, 1.35], [0.5, 1.75], [0.46, 2.2]]), h * 0.12), class: 'sh-sheen'}));
    /* 땋은 테 — 목둘레 · 앞섶 · 밑단 · 주머니 둘 */
    const edges = [[[-0.2, 0.92], [-0.08, 1.06], [0.06, 1.06], [0.2, 0.92]], [[0.04, 1.06], [0.06, 1.8], [0.08, 2.56]], [[-0.46, 2.5], [-0.2, 2.55], [0.1, 2.57], [0.46, 2.5]],
      [[0.2, 1.62], [0.46, 1.6]], [[-0.46, 1.64], [-0.22, 1.66]]];
    for (const e of edges) body.append(s('path', {d: openD(P(e)), class: 'sh-br0-' + cl}), s('path', {d: openD(P(e)), class: 'sh-br1-' + cl}));
    let bt = '';
    for (const v of [1.4, 1.82, 2.24]) bt += dotD(...P([[0.1, v]])[0], h * 0.045);
    body.append(s('path', {d: bt, class: 'sh-btn'}));
  }
  /* 4 얼굴 · 머리(부품) · 검정 리본 */
  const head = s('g', {transform: `rotate(${o.tilt ?? 0})`});
  const H2 = (pts, n, sp, w0, cu, sd, cls) => strands(pts.map(([u, v]) => [u * h, v * h]), {n, spread: h * sp, w0: h * w0, w1: 0.25, curl: cu, seed: sd, cls});
  head.append(hair({cx: 0, cy: 0, h, dir: 1, tone: o.tone, len: 3.0, seed: o.seed, view: o.view}),
    face({cx: 0, cy: 0, h, dir: 1, view: o.view, tilt: 0, iris: o.iris, v: 1}));
  /* 젊고 예쁜 얼굴 — 눈꼬리 선 · 긴 속눈썹 · 장밋빛 입술 · 볼 홍조 · 살짝 웃는 입꼬리 */
  const Q = a => a.map(([x, y]) => [x * h, y * h]);
  const liner = bandD(crPts(Q([[-0.2, -0.07], [-0.27, -0.055], [-0.34, -0.1]]), 5), t => h * 0.022 * (1 - t) + 0.3) + bandD(crPts(Q([[0.27, -0.072], [0.32, -0.06], [0.375, -0.1]]), 5), t => h * 0.016 * (1 - t) + 0.3)
    + [[-0.24, -0.075, -0.31, -0.13], [-0.2, -0.085, -0.25, -0.145], [-0.15, -0.09, -0.18, -0.15], [0.29, -0.075, 0.34, -0.125], [0.25, -0.083, 0.28, -0.135]].map(([a, b, c, e]) => bandD(crPts(Q([[a, b], [(a + c) / 2 + 0.005, (b + e) / 2 - 0.005], [c, e]]), 4), t => h * 0.012 * (1 - t) + 0.2)).join('');
  const lipU = Q([[0.0, 0.262], [0.05, 0.243], [0.085, 0.236], [0.104, 0.246], [0.124, 0.235], [0.165, 0.243], [0.205, 0.258], [0.16, 0.268], [0.104, 0.272], [0.05, 0.27]]);
  const lipL = Q([[0.02, 0.268], [0.104, 0.276], [0.188, 0.266], [0.165, 0.3], [0.104, 0.317], [0.048, 0.302]]);
  head.append(s('ellipse', {cx: r1(-0.15 * h), cy: r1(0.13 * h), rx: r1(0.11 * h), ry: r1(0.06 * h), class: 'sh-blush'}), s('ellipse', {cx: r1(0.24 * h), cy: r1(0.11 * h), rx: r1(0.05 * h), ry: r1(0.045 * h), class: 'sh-blush'}),
    s('path', {d: closedD(lipU), class: 'sh-lip1'}), s('path', {d: closedD(lipL), class: 'sh-lip2'}), s('path', {d: lens(Q([[0.07, 0.288], [0.104, 0.292], [0.135, 0.288]]), h * 0.012), class: 'sh-liph'}),
    s('path', {d: liner + bandD(crPts(Q([[-0.005, 0.262], [-0.02, 0.252]]), 3), () => 0.7) + bandD(crPts(Q([[0.208, 0.258], [0.222, 0.246]]), 3), () => 0.6), class: 'sh-liner'}));
  /* 옆으로 넘긴 앞머리(눈썹 위) */
  head.append(s('g', {class: 'mk-hair mk-t' + o.tone, 'data-mucha': 'hair'}, H2([[0.32, -0.66], [0.12, -0.52], [-0.12, -0.44], [-0.32, -0.3], [-0.42, -0.04]], 2, 0.16, 0.075, 0.5, o.seed * 5 + 1, 'mk-hb')));
  if (k === 'money') { // 진주 머리띠
    let hp = '', hh2 = '';
    for (let i = 0; i <= 12; i++) { const a = PI * (1.06 + i * 0.07), x = (-0.08 + Math.cos(a) * 0.5) * h, y = (-0.3 + Math.sin(a) * 0.46) * h; hp += dotD(x, y, h * 0.04); hh2 += dotD(x + h * 0.012, y - h * 0.014, h * 0.013); }
    head.append(s('path', {d: hp, class: 'sh-pearl'}), s('path', {d: hh2, class: 'sh-pearlh'}));
  }
  const bx = -0.52 * h, by = -0.42 * h;
  if (k === 'bloom') { const ax = -0.47 * h, ay = -0.69 * h, cr = h * 0.27;
    head.append(s('g', {class: 'sh-hcam', 'data-mucha': 'pastel'}, s('path', {d: petalsD(ax - cr * 0.6, ay + cr * 0.6, cr * 1.1, 2, 0.34, 2.2), class: 'sh-leaf'}),
      s('path', {d: petalsD(ax, ay, cr, 6, 0.62, 0.2), class: 'sh-cam1'}), s('path', {d: petalsD(ax, ay, cr * 0.7, 6, 0.6, 0.7), class: 'sh-cam2'}),
      s('path', {d: petalsD(ax, ay, cr * 0.4, 5, 0.6, 1.1), class: 'sh-cam1'}), s('path', {d: dotD(ax, ay, cr * 0.17), class: 'sh-gold'})));
  } else head.append(s('path', {d: `M${r1(bx)} ${r1(by)}C${r1(bx - 0.3 * h)} ${r1(by - 0.34 * h)} ${r1(bx - 0.46 * h)} ${r1(by + 0.02 * h)} ${r1(bx)} ${r1(by)}ZM${r1(bx)} ${r1(by)}C${r1(bx + 0.06 * h)} ${r1(by - 0.42 * h)} ${r1(bx + 0.3 * h)} ${r1(by - 0.3 * h)} ${r1(bx)} ${r1(by)}Z`
    + bandD(crPts([[bx, by], [bx - 0.1 * h, by + 0.3 * h], [bx - 0.04 * h, by + 0.62 * h]], 5), t => h * 0.07 * (1 - t) + 0.6) + bandD(crPts([[bx, by], [bx + 0.08 * h, by + 0.34 * h], [bx + 0.16 * h, by + 0.58 * h]], 5), t => h * 0.06 * (1 - t) + 0.6), class: 'sh-bow'}),
    s('path', {d: dotD(bx, by, h * 0.06), class: 'sh-bow2'}));
  body.append(head);
  /* 5 진주 여러 줄 */
  let pe = '', ph = '';
  for (const q of sag([-0.17, 0.78], [0.19, 0.78], 0.07, 10).slice(1, -1)) { const [x, y] = P([q])[0]; pe += dotD(x, y, h * 0.036); ph += dotD(x + h * 0.012, y - h * 0.012, h * 0.012); } // 목에 붙는 진주 한 줄(초커)
  { const [x, y] = P([[0.01, 0.9]])[0]; pe += dotD(x, y, h * 0.05); ph += dotD(x + h * 0.016, y - h * 0.016, h * 0.016); }
  body.append(s('path', {d: pe, class: 'sh-pearl'}), s('path', {d: ph, class: 'sh-pearlh'}));
  /* 6 팔과 든 것 */
  const tone = dark ? 'cream' : 'ivory';
  const sl = (from, to, hand, w = h * 0.36) => { const [a, b] = P([from, to]), vx = b[0] - a[0], vy = b[1] - a[1]; return sleeve({x: r1(a[0]), y: r1(a[1]), ang: r1(Math.atan2(-vx, vy) * 180 / PI), len: Math.max(8, Math.hypot(vx, vy) - w * 0.32), w, hand, dir: 1, tone}); };
  const arms = s('g', {class: 'sh-arms sh-cl-' + cl});
  if (k === 'hot') { // 바깥 팔로 금 횃불을 머리 위로 · 앞 손은 허리에
    const [tx, ty] = P([[-0.58, -1.16]])[0];
    arms.append(sl([-0.48, 1.08], [-0.58, -0.82], 'hold'), torch(tx, ty, h * 0.78), sl([0.48, 1.1], [0.74, 2.7], 'rest'));
  } else if (k === 'bloom') { // 동백 한 송이를 가슴 앞에
    const [fx, fy] = P([[0.2, 1.72]])[0];
    arms.append(sl([-0.5, 1.1], [-0.66, 3.0], 'rest'), sl([0.5, 1.1], [0.16, 2.3], 'hold'), camellia(fx, fy, h));
  } else { // 마름모 누빔 가방(금 사슬) — 앞 손에 듦
    const [gx, gy] = P([[-0.2, 2.5]])[0];
    arms.append(sl([0.48, 1.1], [0.74, 2.7], 'rest'), bag(gx, gy, h), sl([-0.5, 1.1], [-0.16, 2.3], 'hold'));
  }
  body.append(arms);
  return g;
}
/** 금 횃불 — 손 위 (x, y) · 불꽃 세 갈래 */
function torch(x, y, h) {
  const b = y - h * 0.2, X = (u, v) => [x + u * h, b - v * h];
  const tongue = (Q, w0) => bandD(crPts(Q, 8), t => w0 * (t < 0.16 ? 0.6 + 0.4 * t / 0.16 : Math.pow(1 - (t - 0.16) / 0.84, 1.2)) + 0.25);
  return s('g', {class: 'sh-torch', 'data-held': 'torch', 'data-mucha': 'whiplash'},
    s('path', {d: bandD(crPts([[x, y + h * 0.42], [x, b + h * 0.06]], 4), t => h * 0.07 + 0.3), class: 'sh-gold'}),
    s('path', {d: tongue([X(-0.06, 0), X(-0.3, 0.38), X(-0.26, 0.8), X(-0.44, 1.12)], h * 0.28) + tongue([X(0.06, 0), X(0.3, 0.4), X(0.28, 0.84), X(0.46, 1.16)], h * 0.28) + tongue([X(0, 0), X(0.16, 0.56), X(-0.1, 1.1), X(0.06, 1.64)], h * 0.44), class: 'sh-fire'}),
    s('path', {d: tongue([X(0, 0), X(0.1, 0.4), X(-0.06, 0.8), X(0.04, 1.12)], h * 0.22), class: 'sh-fire2'}),
    s('path', {d: `M${r1(x - h * 0.24)} ${r1(b)}Q${r1(x)} ${r1(b + h * 0.3)} ${r1(x + h * 0.24)} ${r1(b)}Z`, class: 'sh-gold'}));
}
/** 흰 동백 한 송이 */
function camellia(x, y, h) {
  const r = h * 0.3;
  return s('g', {class: 'sh-cam', 'data-held': 'camellia'},
    s('path', {d: petalsD(x - r * 0.9, y + r * 0.5, r * 0.9, 2, 0.32, 2.4), class: 'sh-leaf'}),
    s('path', {d: petalsD(x, y, r, 7, 0.7, 0.3), class: 'sh-cam1'}), s('path', {d: petalsD(x, y, r * 0.66, 6, 0.7, 0.8), class: 'sh-cam2'}),
    s('path', {d: petalsD(x, y, r * 0.36, 5, 0.7, 1.2), class: 'sh-cam1'}), s('path', {d: dotD(x, y, r * 0.16), class: 'sh-gold'}));
}
/** 평범한 마름모 누빔 가방 · 금 사슬 끈(손 (x, y) 에서 늘어짐) */
function bag(x, y, h) {
  const w = h * 0.84, hh = h * 0.6, x0 = x - w * 0.5, y0 = y + h * 0.5;
  let q = '';
  for (let i = -3; i <= 3; i++) { q += `M${r1(x0 + w * (i / 3))} ${r1(y0)}L${r1(x0 + w * (i / 3) + hh)} ${r1(y0 + hh)}M${r1(x0 + w * (i / 3) + w * 0.333)} ${r1(y0)}L${r1(x0 + w * (i / 3) + w * 0.333 - hh)} ${r1(y0 + hh)}`; }
  const id = 'shbag' + (++UID);
  return s('g', {class: 'sh-bag', 'data-held': 'bag'},
    s('path', {d: `M${r1(x0 + w * 0.12)} ${r1(y0)}Q${r1(x)} ${r1(y - h * 0.2)} ${r1(x0 + w * 0.88)} ${r1(y0)}`, class: 'sh-chain'}),
    s('clipPath', {id}, s('rect', {x: r1(x0), y: r1(y0), width: r1(w), height: r1(hh), rx: r1(h * 0.08)})),
    s('rect', {x: r1(x0), y: r1(y0), width: r1(w), height: r1(hh), rx: r1(h * 0.08), class: 'sh-bagb'}),
    s('path', {d: q, class: 'sh-quilt', 'clip-path': `url(#${id})`}),
    s('path', {d: `M${r1(x0)} ${r1(y0 + hh * 0.34)}Q${r1(x)} ${r1(y0 + hh * 0.5)} ${r1(x0 + w)} ${r1(y0 + hh * 0.34)}`, class: 'sh-flap'}),
    s('path', {d: `M${r1(x - h * 0.07)} ${r1(y0 + hh * 0.4)}h${r1(h * 0.14)}v${r1(h * 0.09)}h${r1(-h * 0.14)}Z`, class: 'sh-gold'}));
}

/* ── 그림 ── */
function draw(d, opt = {}) {
  const id = 'sh' + (++UID);
  const L0 = d?.lists ?? {};
  const okNow = KEY.every(k => Array.isArray(L0[k]) && L0[k].length), okNx = KEY.every(k => Array.isArray(L0[NXK[k]]) && L0[NXK[k]].length);
  const ovs = new Set((d?.overlap ?? []).map(o => o.name));
  const items = (k, nx) => (L0[nx ? NXK[k] : k] ?? []).slice(0, 7).map(c => ({k: nx ? NXK[k] : k, base: k, nx, code: String(c.code ?? ''), name: String(c.name ?? NEED), val: valText(c, k, nx), star: !nx && ovs.has(String(c.name))}));
  const nNow = okNow ? KEY.reduce((a, k) => a + Math.min(7, L0[k].length), 0) : null, nNx = okNx ? KEY.reduce((a, k) => a + Math.min(7, L0[NXK[k]].length), 0) : null;

  /* 자리 — 칸 넷(폭 94.5) · 위 = 기둥 머리 + 불장 칸 · 가운데 무대 · 아래 = 꽃 · 돈 칸 넷 */
  const CX = [12, 103.5, 197, 288.5], CWD = 89.5, HEAD = 88, HDR = 32, ROW = 60; // 바깥 12 — 쪽 금테(안 6 · 10)가 글을 긋지 않게
  const PAD = 2.5, nW = CWD - 2 * PAD;
  /* 이름표 꼴 — 이름 한 줄 + 값(두 줄 · 높이 59) · 안 되면 낱말 경계에서 이름 둘째 줄 끝에 값 · 그래도 안 되면 이름 두 줄 + 값(세 줄 · 높이 65) · 글자는 모두 19.6 넘게 */
  const plan = it => {
    const st = it.star ? '✦ ' : '', nm = st + it.name;
    if (est(nm, 20) <= nW) return {h: 59, rows: [['n', nm, 20], ['v', it.val, 20]]};
    if (est(nm, 19.6) <= nW * 1.2) return {h: 59, rows: [['n', nm, 19.6], ['v', it.val, 20]]};
    if (st && est(it.name, 19.6) <= nW * 1.2) return {h: 59, rows: [['n', it.name, 19.6], ['v', st + it.val, 20]]};
    const cands = [split2(it.name), ...SUFFIX.concat(['내셔널']).filter(x => it.name.endsWith(x) && it.name.length - x.length >= 2).map(x => [it.name.slice(0, it.name.length - x.length), x])];
    for (const [a, b] of cands) if (est(st + a, 19.6) <= nW * 1.15 && est(b, 19.6) + 5 + est(it.val, 19.6) <= nW * 1.12) return {h: 59, rows: [['n', st + a, 19.6], ['t', b, it.val]]};
    const [a, b] = split2(it.name);
    return {h: 65, rows: [['n', st + a, 19.6], ['n', b, 19.6], ['v', it.val, 19.6]]};
  };
  const colPlan = (k, nx) => items(k, nx).map(it => ({it, ...plan(it)}));
  const PL = {hot: colPlan('hot', false), hotN: colPlan('hot', true), bloom: colPlan('bloom', false), money: colPlan('money', false), bloomN: colPlan('bloom', true), moneyN: colPlan('money', true)};
  const sum = a => a.reduce((x, y) => x + y.h, 0);
  const HT = Math.max(7 * 59, sum(PL.hot), sum(PL.hotN)), HL = Math.max(7 * 59, sum(PL.bloom), sum(PL.money), sum(PL.bloomN), sum(PL.moneyN));
  const BAND = 24, T0 = HEAD + HDR, TE = T0 + HT, L1 = TE + 4, LH = L1 + BAND + HDR, H = LH + HL + 4;
  const SL = CX[1] + 1, SR = CX[2] + CWD - 1, SX = (SL + SR) / 2, FT = 488;
  const day = d?.asOf?.board ?? null;
  const svg = s('svg', {class: 'su-svg su-art4 sh', viewBox: `0 0 ${W} ${H}`, role: 'img', preserveAspectRatio: 'xMidYMid meet',
    'data-show': 'now-next', 'aria-label': (okNow && okNx) ? `검은 무대 그림 · 세 여인 · 왼쪽 기둥 지금 ${nNow}곳 · 오른쪽 기둥 될 듯 ${nNx}곳` + (day ? ' · ' + day + ' 자료' : '') : '검은 무대 그림 · 세 여인 · 자료 ' + NEED});
  const defs = s('defs');
  /* 트위드 결(검정 · 흰) · 조명 빛줄기 · 후광 빛 */
  const tw = (pid, base, a, b, c) => s('pattern', {id: pid, width: 5, height: 5, patternUnits: 'userSpaceOnUse', patternTransform: 'rotate(20)'},
    s('rect', {width: 5, height: 5, class: base}), s('path', {d: 'M0.4 0.8h1.6v0.7h-1.6zM2.8 3.1h1.5v0.7h-1.5z', class: a}), s('path', {d: 'M3.2 0.4h0.7v1.3h-0.7zM0.9 2.9h0.7v1.4h-0.7z', class: b}), s('path', {d: 'M2.1 2.0h0.6v0.6h-0.6z', class: c}));
  defs.append(tw('shtwB', 'sh-twb0', 'sh-twb1', 'sh-twb2', 'sh-twg'), tw('shtwW', 'sh-tww0', 'sh-tww1', 'sh-tww2', 'sh-twg'),
    s('linearGradient', {id: 'shcone', x1: 0, y1: 0, x2: 0, y2: 1}, s('stop', {offset: 0, class: 'sh-st0'}), s('stop', {offset: 0.55, class: 'sh-st1'}), s('stop', {offset: 1, class: 'sh-st2'})),
    s('linearGradient', {id: 'shleg', x1: 0, y1: 0, x2: 1, y2: 0}, s('stop', {offset: 0, class: 'sh-lg0'}), s('stop', {offset: 0.32, class: 'sh-lg1'}), s('stop', {offset: 0.55, class: 'sh-lg2'}), s('stop', {offset: 0.78, class: 'sh-lg1'}), s('stop', {offset: 1, class: 'sh-lg0'})),
    s('radialGradient', {id: 'shglow'}, s('stop', {offset: 0, class: 'sh-gl0'}), s('stop', {offset: 0.55, class: 'sh-gl1'}), s('stop', {offset: 1, class: 'sh-gl2'})),
    s('linearGradient', {id: 'shwg', x1: 0, y1: 0, x2: 0, y2: 1}, s('stop', {offset: 0, class: 'sh-wg0'}), s('stop', {offset: 1, class: 'sh-wg1'})),
    s('radialGradient', {id: 'shhalo'}, s('stop', {offset: 0, class: 'sh-hs0'}), s('stop', {offset: 0.7, class: 'sh-hs1'}), s('stop', {offset: 1, class: 'sh-hs2'})),
    s('radialGradient', {id: 'shpool'}, s('stop', {offset: 0, class: 'sh-ps0'}), s('stop', {offset: 1, class: 'sh-ps1'})),
    s('radialGradient', {id: 'shwash'}, s('stop', {offset: 0, class: 'sh-ws0'}), s('stop', {offset: 0.6, class: 'sh-ws1'}), s('stop', {offset: 1, class: 'sh-ws2'})),
    s('clipPath', {id: id + 's'}, s('rect', {x: SL, y: 0, width: SR - SL, height: L1 - 3})));
  svg.append(defs);
  svg.append(s('rect', {x: 0, y: 0, width: W, height: H, rx: 18, class: 'sh-bg'}));

  /* 1 무대 — 빛 점 벽 · 아치 · 조명 셋 · 바닥 */
  const stage = s('g', {'clip-path': `url(#${id}s)`});
  let dim = '', lit = '';
  for (let y = 16, j = 0; y < FT - 4; y += 10, j++) for (let x = SL + 7, i = 0; x < SR - 3; x += 10, i++) { if ((i * 7 + j * 3) % 11 === 0 && y < 300) lit += dotD(x, y, 1.5); else dim += dotD(x, y, 1.1); }
  let seam = '';
  for (let x = SL + 45; x < SR - 10; x += 45) seam += `M${r1(x)} 4V${FT}`;
  for (let y = 64; y < FT; y += 64) seam += `M${SL} ${y}H${SR}`;
  stage.append(s('ellipse', {cx: SX, cy: 300, rx: 150, ry: 260, class: 'sh-wash'}), s('path', {d: seam, class: 'sh-seam'}),
    s('g', {'data-mucha': 'stars'}, s('path', {d: dim, class: 'sh-led'}), s('path', {d: lit, class: 'sh-led2'})));
  const F = {
    hot: {k: 'hot', x: SX - 48, y: 148, h: 39, dir: 1, view: 'three', tilt: -8, tone: 4, iris: 0, seed: 2, look: 'wjacket', bend: [[-1.2, 0.2], [1.0, 0.12], [2.4, -0.12], [3.2, -0.27], [5.0, -0.06], [6.6, 0.05], [8.2, 0.1]]},
    bloom: {k: 'bloom', x: SX + 2, y: 122, h: 44, dir: 1, view: 'three', tilt: 6, tone: 2, iris: 1, seed: 5, look: 'dress', bend: [[-1.2, 0.14], [1.0, 0.07], [2.4, -0.1], [3.2, -0.24], [5.0, -0.06], [6.6, 0.06], [8.2, 0.12]]},
    money: {k: 'money', x: SX + 52, y: 148, h: 39, dir: -1, view: 'three', tilt: 8, tone: 0, iris: 2, seed: 8, look: 'bjacket', bend: [[-1.2, 0.22], [1.0, 0.13], [2.4, -0.12], [3.2, -0.28], [5.0, -0.08], [6.6, 0.05], [8.2, 0.1]]},
  };
  for (const k of KEY) F[k].id = id + 'w' + k;
  for (const k of KEY) F[k].foot = F[k].y + FOOT * F[k].h;
  /* 아치(무하) — 두 기둥 머리를 잇는 무대 틀 */
  const AT = 30, archD = `M${SL} ${HEAD + 6}C${SL} ${AT + 10} ${SX - 60} ${AT - 6} ${SX} ${AT - 6}C${SX + 60} ${AT - 6} ${SR} ${AT + 10} ${SR} ${HEAD + 6}`;
  /* 조명 셋 — 아치 밑 등에서 여인 발치까지 */
  const lamps = s('g', {class: 'sh-lamps', 'data-mucha': 'halo'});
  const cones = s('g', {class: 'sh-cones'});
  ['hot', 'bloom', 'money'].forEach((k, i) => {
    const f = F[k], lx = SX + (i - 1) * 46, ly = AT + 22 + (i === 1 ? -4 : 6), fx = f.x + (k === 'hot' ? -4 : k === 'money' ? 4 : 0), fy = f.foot;
    cones.append(s('g', {class: 'sh-cone sh-c' + i}, s('path', {d: `M${r1(lx - 5)} ${r1(ly)}L${r1(fx - 46)} ${r1(fy)}Q${r1(fx)} ${r1(fy + 10)} ${r1(fx + 46)} ${r1(fy)}L${r1(lx + 5)} ${r1(ly)}Z`, class: 'sh-beam'}),
      s('ellipse', {cx: r1(fx), cy: r1(fy - 1), rx: 44, ry: 8, class: 'sh-pool'})));
    lamps.append(s('path', {d: `M${r1(lx - 7)} ${r1(ly - 7)}h14l-3 7h-8Z`, class: 'sh-lamp'}), s('path', {d: dotD(lx, ly + 0.5, 3.2), class: 'sh-bulb sh-b' + i}));
  });
  stage.append(cones);
  /* 후광 셋(조명이 뒤 벽에 맺힌 둥근 빛 · 금 테) */
  const halos = s('g', {'data-mucha': 'halo'});
  for (const k of ['hot', 'money', 'bloom']) {
    const f = F[k], cx = f.x + f.dir * -0.12 * f.h, cy = f.y - 0.18 * f.h, r = f.h * 1.2; let dt = '', dq = '';
    for (let i = 0; i < 30; i++) { const a = i * 2 * PI / 30, x = cx + r * 0.88 * Math.cos(a), y = cy + r * 0.88 * Math.sin(a); if (i % 2) dt += dotD(x, y, 1.9); else dq += `M${r1(x)} ${r1(y - 3)}L${r1(x + 3)} ${r1(y)}L${r1(x)} ${r1(y + 3)}L${r1(x - 3)} ${r1(y)}Z`; }
    halos.append(s('circle', {cx: r1(cx), cy: r1(cy), r: r1(r), class: 'sh-halo'}), rays(cx, cy, r * 0.3, r * 0.8, {n: 28}), s('circle', {cx: r1(cx), cy: r1(cy), r: r1(r * 0.88), class: 'sh-hring'}),
      s('path', {d: dq, class: 'sh-hq'}), s('path', {d: dt, class: 'sh-hd'}), s('circle', {cx: r1(cx), cy: r1(cy), r: r1(r), class: 'sh-hrim'}), s('circle', {cx: r1(cx), cy: r1(cy), r: r1(r * 0.76), class: 'sh-hrim2'}));
  }
  stage.append(halos);
  /* 바닥 — 반짝이는 검은 바닥 줄 */
  stage.append(s('path', {d: `M${SL} ${FT}L${SR} ${FT}L${SR} ${L1}L${SL} ${L1}Z`, class: 'sh-floor'}),
    s('path', {d: `M${SL} ${FT}H${SR}M${SL} ${FT + 20}H${SR}M${SL} ${FT + 44}H${SR}`, class: 'sh-fline'}));
  /* 여인 셋 — 양옆이 뒤 · 가운데(센터)가 앞 */
  const people = s('g', {'data-mucha': 'outline', id: id + 'p'});
  for (const k of ['hot', 'money', 'bloom']) people.append(lady(F[k]));
  /* 반짝이는 바닥 — 센터 발밑에 비친 모습(옅게 · 바닥 띠 안만) */
  defs.append(s('clipPath', {id: id + 'f'}, s('rect', {x: SL, y: FT, width: SR - SL, height: L1 - 3 - FT})));
  stage.append(s('g', {'clip-path': `url(#${id}f)`, class: 'sh-refl', 'aria-hidden': 'true'}, KEY.map(k => s('use', {href: '#' + F[k].id, transform: `translate(0 ${r1(2 * F[k].foot + 2)}) scale(1 -1)`}))));
  /* 막 둘(양옆 · 처음에 넓게 가렸다가 한 번 걷힘) · 아치 밑 휘장 + 전구 */
  const curtain = sg => {
    const m = x => (sg < 0 ? SL + x : SR - x);
    const body = `M${m(0)} 0L${m(20)} 0C${m(17)} 120 ${m(7)} 250 ${m(9)} 318C${m(10)} 340 ${m(7)} 380 ${m(15)} ${FT}L${m(0)} ${FT}Z`;
    let folds = ''; for (const f of [5, 10, 15]) folds += `M${m(f)} 6C${m(f - 1)} 120 ${m(f * 0.45)} 240 ${m(f * 0.5)} 316`;
    return s('g', {class: 'sh-curtain ' + (sg < 0 ? 'sh-cur-l' : 'sh-cur-r'), 'aria-hidden': 'true'}, s('path', {d: body, class: 'sh-cur'}), s('path', {d: folds, class: 'sh-curf'}),
      s('path', {d: `M${m(1)} 312Q${m(6)} 322 ${m(12)} 316`, class: 'sh-tie'}));
  };
  const bez = (p0, p1, p2, p3, n) => { const o = []; for (let i = 0; i <= n; i++) { const t = i / n, u = 1 - t; o.push([u * u * u * p0[0] + 3 * u * u * t * p1[0] + 3 * u * t * t * p2[0] + t * t * t * p3[0], u * u * u * p0[1] + 3 * u * u * t * p1[1] + 3 * u * t * t * p2[1] + t * t * t * p3[1]]); } return o; };
  const AP = [...bez([SL, HEAD + 6], [SL, AT + 10], [SX - 60, AT - 6], [SX, AT - 6], 14), ...bez([SX, AT - 6], [SX + 60, AT - 6], [SR, AT + 10], [SR, HEAD + 6], 14).slice(1)];
  const inner = AP.map(([x, y], i) => [x + (x < SX ? 1 : -1) * 6, y + 9 + 4 * Math.abs(Math.sin(i * PI / 2.8))]);
  let bl = ''; inner.forEach(([x, y], i) => { if (i % 2 === 0 && i > 1 && i < inner.length - 2) bl += dotD(x, y + 1.5, 1.7); });
  const valance = s('g', {class: 'sh-val0', 'aria-hidden': 'true'}, s('path', {d: 'M' + AP.map(pt).join('L') + 'L' + inner.slice().reverse().map(pt).join('L') + 'Z', class: 'sh-valc'}), s('path', {d: bl, class: 'sh-vbulb'}));
  stage.insertBefore(s('g', {}, curtain(-1), curtain(1)), halos);
  /* 날개는 세 여인 모두의 뒤 한 겹에(양옆 여인 얼굴이 가운데 날개에 가리지 않게) · 양옆은 조금 작게 */
  const wingL = s('g', {class: 'sh-wingset', 'aria-hidden': 'true'});
  for (const k of ['hot', 'money', 'bloom']) { const f = F[k]; wingL.append(s('g', {class: 'sh-wk-' + k, transform: `translate(${r1(f.x)} ${r1(f.y)})` + (f.dir < 0 ? ' scale(-1 1)' : '')}, wings({...f, h: f.h * (k === 'bloom' ? 1.18 : 1.02)}))); }
  /* 여인 뒤 둥근 빛(밝기 차가 빛을 만듦 — 흐림 필터 없이) */
  const glow = s('g', {class: 'sh-glowset', 'aria-hidden': 'true'}, KEY.map(k => { const f = F[k]; return s('ellipse', {cx: r1(f.x), cy: r1(f.y + 2.4 * f.h), rx: r1(1.7 * f.h), ry: r1(3.4 * f.h), class: 'sh-glow'}); }));
  /* 반짝이 별 셋 무리(차례로 반짝) · 내리는 꽃잎 다섯 */
  const star = (x, y, r) => `M${r1(x)} ${r1(y - r)}L${r1(x + r * 0.28)} ${r1(y - r * 0.28)}L${r1(x + r)} ${r1(y)}L${r1(x + r * 0.28)} ${r1(y + r * 0.28)}L${r1(x)} ${r1(y + r)}L${r1(x - r * 0.28)} ${r1(y + r * 0.28)}L${r1(x - r)} ${r1(y)}L${r1(x - r * 0.28)} ${r1(y - r * 0.28)}Z`;
  const sp = ['', '', ''];
  for (let i = 0; i < 21; i++) { const x = SL + 8 + ((i * 67 + 13) % (SR - SL - 16)), y = 46 + ((i * 137 + 29) % 400); sp[i % 3] += star(x, y, 2.2 + (i % 4) * 0.9); }
  const sparks = s('g', {class: 'sh-sparks', 'data-mucha': 'stars', 'aria-hidden': 'true'}, sp.map((d, i) => s('path', {d, class: 'sh-spk sh-spk' + i})));
  const petals = s('g', {class: 'sh-petals', 'aria-hidden': 'true'});
  for (let i = 0; i < 5; i++) { const x = SL + 22 + i * (SR - SL - 44) / 4, y = 70 + (i % 2) * 60; petals.append(s('path', {d: petalsD(x, y, 4.2, 1, 0.5, i * 0.9), class: 'sh-petal sh-pt' + i})); }
  stage.append(glow, wingL, people, valance, lamps, sparks, petals);
  svg.append(stage);
  const AY = 15.5, ax0 = SL + 4, ax1 = SR - 6;
  svg.append(s('g', {class: 'sh-time', 'data-mucha': 'whiplash'}, s('path', {d: bandD(crPts([[ax0, AY], [SX, AY - 1.5], [ax1 - 6, AY]], 8), t => 2.2 * (1 - t) + 0.9), class: 'sh-gold'}),
    s('path', {d: `M${r1(ax1 + 3)} ${AY}L${r1(ax1 - 8)} ${r1(AY - 6)}L${r1(ax1 - 5)} ${AY}L${r1(ax1 - 8)} ${r1(AY + 6)}Z`, class: 'sh-gold'})));
  svg.append(s('g', {'data-mucha': 'arch'}, s('path', {d: archD, class: 'sh-arch'}), s('path', {d: archD.replace(/(\d+(?:\.\d+)?) (\d+(?:\.\d+)?)/g, (m, a, b) => a + ' ' + r1(+b + 5)), class: 'sh-arch2'})));

  /* 2 기둥 둘(ㄴ 자) — 테 · 가장자리 전구 줄 */
  const lpath = (xa, xb, xc, flip) => { // xa 바깥 칸 · xb 안쪽 칸 끝
    const r = 10, y0 = 2, y1 = L1 - 2, y2 = H - 2;
    return flip
      ? `M${xa + CWD - r} ${y0}A${r} ${r} 0 0 1 ${xa + CWD} ${y0 + r}V${y2 - r}A${r} ${r} 0 0 1 ${xa + CWD - r} ${y2}H${xc + r}A${r} ${r} 0 0 1 ${xc} ${y2 - r}V${y1 + r}A${r} ${r} 0 0 1 ${xc + r} ${y1}H${xa - 1}V${y0 + r}A${r} ${r} 0 0 1 ${xa + r} ${y0}Z`
      : `M${xa + r} ${y0}H${xa + CWD - r}A${r} ${r} 0 0 1 ${xa + CWD} ${y0 + r}V${y1}H${xb - r}A${r} ${r} 0 0 1 ${xb} ${y1 + r}V${y2 - r}A${r} ${r} 0 0 1 ${xb - r} ${y2}H${xa + r}A${r} ${r} 0 0 1 ${xa} ${y2 - r}V${y0 + r}A${r} ${r} 0 0 1 ${xa + r} ${y0}Z`;
  };
  const pilL = lpath(CX[0], CX[1] + CWD, 0, false), pilR = lpath(CX[3], 0, CX[2], true);
  const pillars = s('g', {'data-mucha': 'panel'}, s('path', {d: pilL, class: 'sh-pil sh-pil-now'}), s('path', {d: pilR, class: 'sh-pil sh-pil-nx'}),
    s('path', {d: pilL, class: 'sh-pfr'}), s('path', {d: pilR, class: 'sh-pfr'}));
  svg.append(pillars);

  /* 3 기둥 머리 — 큰 숫자 21 둘(지금 · 될 듯) */
  const lettering = s('g', {'data-mucha': 'lettering'});
  const headG = (x, label, n, nx) => s('g', {class: 'sh-head' + (nx ? ' sh-rise' : '')},
    s('path', {d: dotD(x + CWD / 2 - est(label, 21) / 2 - 11, 16, 5.5), class: nx ? 'sh-ring' : 'sh-pearlbig'}),
    s('text', {x: r1(x + CWD / 2 + 5), y: 15.5, 'text-anchor': 'middle', 'dominant-baseline': 'central', class: 'sh-hl', text: label}),
    s('text', {x: r1(x + CWD / 2), y: 59, 'text-anchor': 'middle', 'dominant-baseline': 'central', class: 'sh-num' + (n == null ? ' sh-need' : ''), text: n == null ? NEED : String(n)}));
  const nowHead = headG(CX[0], '지금', nNow, false), nxHead = headG(CX[3], '될 듯', nNx, true);
  lettering.append(nowHead);

  /* 4 이름표 — 칸마다 일곱(차례 그대로) · 누름 자리 = 칸 한 줄 전체(94.5 × 60) */
  const tag = (it, x0, y0, i, RH, pl) => {
    const KN = it.nx ? KINDN : KIND;
    const a = s('a', {href: '#/c/' + encodeURIComponent(it.code), class: 'sh-tag sh-t-' + it.base + ' sh-i' + i, 'data-k': it.k, 'data-name': it.name,
      'aria-label': it.name + ' · ' + KN[it.base] + ' · ' + it.val + (it.star ? ' · 두 목록에 함께' : '')});
    a.append(s('rect', {x: r1(x0), y: r1(y0), width: CWD, height: RH, class: 'sh-hit'}));
    const st = it.star ? '✦ ' : '', cx = x0 + CWD / 2, cy = y0 + RH / 2;
    const put = (t, x, y, px, cls, anchor, w) => {
      const tx = s('text', {x: r1(x), y: r1(y), 'text-anchor': anchor, 'dominant-baseline': 'central', class: cls + ' sh-f' + String(px).replace('.', ''), text: t});
      if (w != null) { tx.setAttribute('textLength', r1(w)); tx.setAttribute('lengthAdjust', 'spacingAndGlyphs'); }
      a.append(tx);
    };
    const vcls = 'sh-val sh-v-' + it.base, n = pl.rows.length, lh = n === 3 ? 21.6 : 22.5;
    pl.rows.forEach(([kind, t, px], j) => {
      const y = cy + (j - (n - 1) / 2) * lh;
      if (kind === 't') { // 이름 뒤 + 값(한 줄)
        const w2 = est(t, 19.6) + 5 + est(px, 19.6), k2 = Math.min(1, nW / w2), wq = est(t, 19.6) * k2, wv = est(px, 19.6) * k2, x0t = cx - (wq + 5 * k2 + wv) / 2;
        put(t, x0t, y, 19.6, 'sh-name', 'start', wq); put(px, x0t + wq + 5 * k2, y, 19.6, vcls, 'start', wv);
      } else put(t, cx, y, px, kind === 'v' ? vcls : 'sh-name', 'middle', est(t, px) > nW ? nW : null);
    });
    return a;
  };
  /* 칸 머리 글(무하 글씨) + 칸 사이 가는 금줄 */
  const col = (x, yHdr, k, nx) => {
    const g = s('g', {class: 'sh-col' + (nx ? ' sh-rise' : ' sh-now')});
    const word = KIND[k];
    const t = s('text', {x: r1(x + CWD / 2), y: r1(yHdr + HDR / 2 + 1), 'text-anchor': 'middle', 'dominant-baseline': 'central', class: 'sh-ch sh-ch-' + k, text: word});
    if (est(word, 20) > nW - 2) { t.setAttribute('textLength', r1(nW - 2)); t.setAttribute('lengthAdjust', 'spacingAndGlyphs'); }
    g.append(t);
    const low = yHdr > HEAD + 1, P0 = PL[k + (nx ? 'N' : '')] ?? [], extra = ((low ? HL : HT) - sum(P0)) / Math.max(1, P0.length);
    let ln = '', y = yHdr + HDR;
    if (!P0.length) g.append(s('text', {x: r1(x + CWD / 2), y: r1(yHdr + HDR + 40), 'text-anchor': 'middle', 'dominant-baseline': 'central', class: 'sh-name sh-f20', text: NEED}));
    P0.forEach((q, i) => { const rh = q.h + extra; if (i) ln += `M${r1(x + 22)} ${r1(y)}H${r1(x + CWD - 22)}` + dotD(x + CWD / 2, y, 1.8); g.append(tag(q.it, x, y, i, rh, q)); y += rh; });
    ln += `M${r1(x + 12)} ${r1(yHdr + HDR - 2)}H${r1(x + CWD - 12)}`;
    g.insertBefore(s('path', {d: ln, class: 'sh-sep'}), g.firstChild.nextSibling);
    return g;
  };
  const nowG = s('g', {class: 'sh-pnow'}), nxG = s('g', {class: 'sh-pnx'});
  const band = (x0, x1, label, nx) => { const cx = (x0 + x1) / 2, w = est(label, 21), px = cx - w / 2 - 12;
    return s('g', {class: 'sh-band'}, s('path', {d: dotD(px, L1 + BAND / 2 + 1, 6), class: nx ? 'sh-ring' : 'sh-pearlbig'}),
      s('text', {x: r1(cx + 6), y: r1(L1 + BAND / 2 + 1), 'text-anchor': 'middle', 'dominant-baseline': 'central', class: 'sh-bl', text: label})); };
  nowG.append(band(CX[0], CX[1] + CWD, '지금', false), col(CX[0], HEAD, 'hot', false), col(CX[0], L1 + BAND, 'bloom', false), col(CX[1], L1 + BAND, 'money', false));
  nxG.append(nxHead, band(CX[2], CX[3] + CWD, '될 듯', true), col(CX[3], HEAD, 'hot', true), col(CX[2], L1 + BAND, 'bloom', true), col(CX[3], L1 + BAND, 'money', true));
  lettering.append(nowG, nxG);
  svg.append(lettering);
  return svg;
}

/** 그림 — 처음 쪽(지금 · 될 듯 한 무대) · 될 듯 21곳(#/n · opt.mode = 'next' — 같은 무대에서 될 듯 이름표가 주인공 · data-k 를 hot · bloom · money 로 바꿔 검사와 차례를 맞춤 · 지금 이름표는 hotNow · bloomNow · moneyNow) */
export function picture(d, opt = {}) {
  const svg = draw(d, opt);
  if (!svg) return svg;
  if (opt.mode === 'next') {
    const M = {hot: 'hotNow', bloom: 'bloomNow', money: 'moneyNow', hotNext: 'hot', bloomNext: 'bloom', moneyNext: 'money'};
    for (const a of svg.querySelectorAll('a[data-k]')) { const k = a.getAttribute('data-k'); if (M[k]) a.setAttribute('data-k', M[k]); }
    svg.setAttribute('data-mode', 'next'); svg.classList.add('sh-mode-next');
  } else svg.setAttribute('data-mode', 'now');
  return svg;
}
