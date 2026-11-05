/* 수르 — 땅 지도 큰 그림 둘(su-land-art · 주문 1023 「머스크 판 4」 · 그림 70% · 알폰스 무하 화풍 · 셋째 판 — judge-r2.md · r3-brief.md L)
   셋째 판: 여인 = 공용 메달(02 v=1 · 03 v=2) · 02 잇는 줄 = 잎 달린 S자 덩굴 · 빛살 = 꽃잎 고리 · 이름판 = 두루마리 · 03 막대 = 꽃대(stemBar) · 축 = 아래 굵은 줄기
   두루마리는 공용 scroll 과 같은 색 · 금테(mk-sc · mk-gl)로 짓되 끝 말림만 작게 — 공용 scroll 은 끝 말림이 띠 높이의 0.8배라 18px 두 줄 이름이 세 칸 줄에 들어가지 않음
   틀(두 그림 같은 뼈대)
   · 위 아치 띠 — 제목을 아치를 따라 휘어 씀(그림에 녹인 글씨)
   · 아치 안 — 여인 얼굴 둥근 액자(메달 · 옆얼굴 · 후광 · 소용돌이 머리칼 · 목까지 덮는 긴 옷 · 색은 고정이라 어두운 판에서도 크림 · 파스텔)
   · 양옆 — 굵게 휘는 채찍 덩굴 띠(꽃 · 잎) · 아래 — 꽃 모자이크 띠
   ① 열 땅 #/m — 둥근 메달 열 개(회사 수 · ✦ 수 · 땅 이름 띠) · 누르면 #/m/<땅 id> · ✦ 가 많은 두 땅은 여인 곁 윗자리
   ② 한 땅 #/m/<id> — 업종 막대(값 = 업종 ch20 · 같은 값이면 같은 길이 · 차례는 자료 그대로) · 막대 끝에 값 · 오름 = --ok 쪽 · 내림 = --no 쪽 · 흰 판 없이 그림 안에
      ✦ 회사 이름 띠(누르면 #/c/<번호>)는 아래 덩굴에 달림
   그리기는 createElementNS · setAttribute 만(su-fig.js 의 s) · 글 속 style 없음 · 색과 움직임은 su-land-art.css 클래스
   글씨는 처음부터 진하게(들어오는 움직임 없음) · 움직임은 꽃 · 덩굴 잎 · 별에만(transform) · 장식은 이름표 · 값 · 막대 자리와 겹치면 그리지 않음 */
import {s} from '/su/su-fig.js';
import {taper as ktaper, strands, medallion, vine as kvine, face, hair, sleeve, rays, leafBar, plaque, ribbon} from './su-mucha-kit.js';
/* 넷째 판(r4-brief.md L): 02 = 가운데 여인 반신(어깨 · 팔 · 옷 주름 · 두 손에 꽃) · 머리 다발은 아치 안쪽을 따라 원판 뒤로 · 이름 = 원판 아래 휘는 리본 · 잇는 덩굴 = 꽃다발에서 S 로 내려가는 나무 한 줄기와 가지 · 빈 원(✦0) 봉오리 고리 · 아치 안 옅은 동심원 · 아치 글씨 흰 테 없음
   03 = 막대 = 잎(leafBar · 길이 그대로) · 회사 이름 = 줄기 아래 끝에서 갈라진 덩굴에 매단 아치 판(셋씩) · 날개 바퀴 · 돛배 1.5배(후광 양옆에 붙음 · 파스텔 · 굵기 변하는 윤곽) · 빈 바탕에 옅은 물결 · 별 */

export const CSS = '/su/su-land-art.css';
const MAP = '/su/data/su21-map.json';
const W = 390, H = 620, NEED = '확인 필요';
const fin = x => typeof x === 'number' && Number.isFinite(x);
const f = v => Math.round(v * 10) / 10, f2 = v => Math.round(v * 100) / 100; // f2 = 막대 자리(같은 값 → 같은 길이를 0.01 까지)
const pt = p => f(p[0]) + ' ' + f(p[1]);
const isStar = c => Array.isArray(c?.in) && c.in.length > 0;
const sgnP = v => (fin(v) ? (v > 0 ? '+' : v < 0 ? '−' : '') + String(Math.abs(f(v))) + '%' : NEED);
const G = (name, ...kids) => s('g', {'data-mucha': name}, ...kids);
const KO = ['', '한', '두', '세', '네', '다섯', '여섯', '일곱', '여덟', '아홉', '열', '열한', '열두'];
let UID = 0;
const uid = k => 'la-' + k + '-' + (++UID) + Math.random().toString(36).slice(2, 6);

/** 글 폭 어림(굵은 글 · 한글 한 자 0.95em — 잰 값 0.92em 보다 조금 넉넉히) */
function tw(t, fs) {
  let w = 0;
  for (const ch of String(t ?? '')) {
    const c = ch.codePointAt(0);
    w += (c >= 0xAC00 && c <= 0xD7A3) || (c >= 0x3130 && c <= 0x318F) ? 0.95 : ch === '✦' ? 1 : /[0-9]/.test(ch) ? 0.6 : /[A-Z]/.test(ch) ? 0.72 : /[a-z]/.test(ch) ? 0.58
      : ch === ' ' ? 0.3 : ch === '·' ? 0.35 : ch === '%' ? 0.95 : ch === '.' ? 0.3 : /[−+&]/.test(ch) ? 0.7 : ch === '-' ? 0.45 : 0.6;
  }
  return w * fs;
}
/** 땅 이름을 띠 글씨로 — 「 · 」 자리에서 두 줄(긴 줄이 가장 짧아지게) · 줄 안 「·」 는 붙여 씀 */
function split2(name, fs, maxW) {
  const parts = String(name ?? '').split(/\s*·\s*/).filter(Boolean);
  if (tw(parts.join('·'), fs) <= maxW || parts.length < 2) return [parts.join('·') || String(name ?? '')];
  let best = null;
  for (let i = 1; i < parts.length; i++) {
    const l = [parts.slice(0, i).join('·'), parts.slice(i).join('·')], m = Math.max(tw(l[0], fs), tw(l[1], fs));
    if (!best || m < best.m) best = {m, l};
  }
  return best.l;
}
/** 자리 장부 — 이름표 · 값 · 막대가 앉은 자리 · 장식은 빈 자리에만 */
function seats() {
  const R = [];
  return {
    add(x, y, w, h) { R.push([x, y, x + w, y + h]); },
    free(x, y, w, h, pad = 3) { const a = [x - pad, y - pad, x + w + pad, y + h + pad]; return !R.some(b => a[0] < b[2] && a[2] > b[0] && a[1] < b[3] && a[3] > b[1]); },
  };
}

/* ── 곡선 연장 ── */
/** Catmull-Rom → 3차 베지에(접선이 끊기지 않게 · 소용돌이 곡선) */
function spline(P) {
  const seg = [];
  for (let i = 0; i < P.length - 1; i++) {
    const p0 = P[Math.max(0, i - 1)], p1 = P[i], p2 = P[i + 1], p3 = P[Math.min(P.length - 1, i + 2)];
    seg.push([p1, [p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6], [p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6], p2]);
  }
  return seg;
}
const bz = (q, t) => { const u = 1 - t; return [0, 1].map(k => u * u * u * q[0][k] + 3 * u * u * t * q[1][k] + 3 * u * t * t * q[2][k] + t * t * t * q[3][k]); };
const bzd = (q, t) => { const u = 1 - t; return [0, 1].map(k => 3 * u * u * (q[1][k] - q[0][k]) + 6 * u * t * (q[2][k] - q[1][k]) + 3 * t * t * (q[3][k] - q[2][k])); };
const segD = seg => 'M' + pt(seg[0][0]) + seg.map(q => 'C' + pt(q[1]) + ' ' + pt(q[2]) + ' ' + pt(q[3])).join('');
/** 굵기가 변하는 선 — 곡선을 따라 채운 모양(처음 wa · 가운데 wm · 끝 wb) · 무하의 붓 선처럼 굵게 시작해 가늘게 빠짐 */
function taper(P, wa, wb, wm = (wa + wb) / 2, n = 8) {
  const seg = spline(P), L = [], R = [], tot = seg.length * n;
  seg.forEach((q, si) => { for (let i = si ? 1 : 0; i <= n; i++) {
    const t = i / n, p = bz(q, t), dv = bzd(q, t), len = Math.hypot(dv[0], dv[1]) || 1, nx = -dv[1] / len, ny = dv[0] / len, u = (si * n + i) / tot;
    const w = Math.max(0.15, (wa * (1 - u) + wb * u + (wm - (wa + wb) / 2) * Math.sin(Math.PI * u)) / 2);
    L.push([p[0] + nx * w, p[1] + ny * w]); R.push([p[0] - nx * w, p[1] - ny * w]);
  } });
  return 'M' + L.map(pt).join('L') + 'L' + R.reverse().map(pt).join('L') + 'Z';
}
/** 줄기를 따라 step 마다 점(자리 · 기울기) */
function walk(seg, step, first = step) {
  const out = []; let acc = step - first, prev = null;
  for (const q of seg) for (let i = 0; i <= 24; i++) {
    const p = bz(q, i / 24); if (prev) acc += Math.hypot(p[0] - prev[0], p[1] - prev[1]); prev = p;
    if (acc >= step) { acc = 0; const d = bzd(q, i / 24); out.push({p, a: Math.atan2(d[1], d[0]) * 180 / Math.PI}); }
  }
  return out;
}

/* ── 무하 낱장 무늬 ── */
const circ = (cx, cy, r) => `M${f(cx - r)} ${f(cy)}a${f(r)} ${f(r)} 0 1 0 ${f(2 * r)} 0a${f(r)} ${f(r)} 0 1 0 ${f(-2 * r)} 0Z`;
/** 꽃 — 동그란 꽃잎 다섯 장(양식화) · k = 색 이름(la 는 판 색 · lw 는 여인 고정 색) */
const flower = (x, y, r, k = 'la') => s('g', {class: k + '-flw'}, Array.from({length: 5}, (_, i) => { const a = -Math.PI / 2 + i * 2 * Math.PI / 5; return s('circle', {cx: f(x + r * 0.6 * Math.cos(a)), cy: f(y + r * 0.6 * Math.sin(a)), r: f(r * 0.46), class: k + '-pet'}); }),
  s('circle', {cx: f(x), cy: f(y), r: f(r * 0.3), class: k + '-core'}));
/** 잎 — 물방울 꼴(끝이 가늘어지는 채운 모양) · 밑동 (x, y) 에서 deg 쪽으로 */
const leaf = (x, y, deg, L = 12, cls = 'la-leaf') => s('path', {d: `M0 0Q${f(L * 0.42)} ${f(-L * 0.4)} ${L} 0Q${f(L * 0.42)} ${f(L * 0.4)} 0 0Z`, transform: `translate(${f(x)} ${f(y)}) rotate(${f(deg)})`, class: cls});
/** 별 — 다섯 갈래 */
const star5 = (x, y, r, cls) => s('path', {d: 'M' + Array.from({length: 10}, (_, i) => { const a = -Math.PI / 2 + i * Math.PI / 5, q = i % 2 ? r * 0.42 : r; return pt([x + q * Math.cos(a), y + q * Math.sin(a)]); }).join('L') + 'Z', class: cls});
/** 초승달 — 오른쪽이 트인 달 */
const moon = (x, y, r) => s('path', {d: `M${f(x)} ${f(y - r)}A${r} ${r} 0 1 0 ${f(x)} ${f(y + r)}A${f(r * 0.72)} ${r} 0 1 1 ${f(x)} ${f(y - r)}Z`, class: 'la-moon'});
/** 흔들리는 낱장(제 밑동에서만 · transform) */
const sway = (el, k = 0) => s('g', {class: 'la-sway' + (k % 2 ? ' la-sway2' : '')}, el);

/* ── 틀 — 위 아치 띠(제목) · 양옆 채찍 덩굴 띠 · 아래 꽃 모자이크 띠 ── */
const OX0 = 6, OX1 = 384, OB = 606, AB = 150, BW = 26, CX = 195;
const IX0 = OX0 + BW, IX1 = OX1 - BW, IB = OB - 28; // 안쪽 창: 32 ~ 358 · 아래 띠 578 ~ 606
const ORX = (OX1 - OX0) / 2, ORY = AB - 6, IRX = ORX - BW, IRY = ORY - BW, CRX = ORX - BW / 2, CRY = ORY - BW / 2;
const archOut = `M${OX0} ${OB}V${AB}A${ORX} ${ORY} 0 0 1 ${OX1} ${AB}V${OB}Z`;
const archIn = `M${IX0} ${IB}V${AB}A${IRX} ${IRY} 0 0 1 ${IX1} ${AB}V${IB}Z`;
/** 안쪽 창 아치 선의 높이(x 자리) */
const archY = x => AB - IRY * Math.sqrt(Math.max(0, 1 - ((x - CX) / IRX) ** 2));
/** 띠 가운데 타원 위의 점(a = 각 · π 왼쪽 ~ 1.5π 꼭대기 ~ 2π 오른쪽) */
const ell = (a, d = 0) => [CX + (CRX + d) * Math.cos(a), AB + (CRY + d) * Math.sin(a)];
/** 꼭대기에서 띠를 따라 len 만큼 간 자리의 각 */
function arcAngle(len, dir) {
  let a = 1.5 * Math.PI, acc = 0, p = ell(a);
  while (acc < len && a > Math.PI && a < 2 * Math.PI) { a += 0.002 * dir; const q = ell(a); acc += Math.hypot(q[0] - p[0], q[1] - p[1]); p = q; }
  return a;
}
function frame(title, fs, S) {
  const half = tw(title, fs) / 2, aL = arcAngle(half + 16, -1), aR = arcAngle(half + 16, 1);
  const tid = uid('t'), cid = uid('c'), brx = CRX - 0.36 * fs, bry = CRY - 0.36 * fs;
  const defs = s('defs', {}, s('path', {id: tid, d: `M${f(CX - brx)} ${AB}A${f(brx)} ${f(bry)} 0 0 1 ${f(CX + brx)} ${AB}`}),
    s('clipPath', {id: cid}, s('path', {d: archOut + archIn, 'clip-rule': 'evenodd'})));
  /* 파스텔 — 창 안은 크림 색면 · 띠는 살구 색면 · 가운데 둥근 빛 */
  const pastel = G('pastel', s('path', {d: archOut, class: 'la-panel'}), s('path', {d: archIn, class: 'la-win'}),
    s('ellipse', {cx: CX, cy: 360, rx: 150, ry: 210, class: 'la-glow'}), s('path', {d: archOut + archIn, 'fill-rule': 'evenodd', class: 'la-band'}));
  /* 아치 — 띠 안 점 · 짧은 금(제목 자리는 비움) */
  const dots = [];
  for (let i = 0; i <= 40; i++) { const a = Math.PI + i * Math.PI / 40; if (a > aL - 0.03 && a < aR + 0.03) continue;
    const [x, y] = ell(a, -BW / 2 + 3.5); dots.push(s('circle', {cx: f(x), cy: f(y), r: 1.6, class: 'la-dot'})); }
  const titleEl = s('text', {class: 'la-arch-t' + (fs < 20 ? ' la-arch-s' : ''), 'text-anchor': 'middle', 'data-proper': ''}, s('textPath', {href: '#' + tid, startOffset: '50%', text: title}));
  const arch = G('arch', dots, G('lettering', titleEl));
  /* 굵기가 변하는 테 — 바깥 아치 선은 꼭대기 굵게 · 아래 끝으로 가늘게(채운 모양) · 안쪽은 가늘게 두 겹 */
  const AP = [[OX0, OB - 2], [OX0, (OB + AB) / 2], [OX0, AB]];
  for (let i = 1; i < 24; i++) AP.push(ell(Math.PI + i * Math.PI / 24, BW / 2 - 0.5));
  AP.push([OX1, AB], [OX1, (OB + AB) / 2], [OX1, OB - 2]);
  const outline = G('outline', s('path', {d: taper(AP, 1.2, 1.2, 6.4, 6), class: 'la-fr1t'}), s('path', {d: archIn, class: 'la-fr2'}), s('path', {d: archIn, class: 'la-fr3'}));
  /* 양옆 채찍 덩굴 띠 — 아래 모서리에서 지그재그로 올라 아치 어깨에서 말려 끝남 · 잎 · 꽃은 띠 안에만 */
  const vine = (dir) => {
    const xc = dir < 0 ? OX0 + BW / 2 : OX1 - BW / 2, P = [];
    for (let y = IB - 4, i = 0; y > AB + 6; y -= 34, i++) P.push([xc + (i % 2 ? 5.5 : -5.5) * -dir, y]);
    const a0 = dir < 0 ? Math.PI : 2 * Math.PI, aE = dir < 0 ? aL : aR;
    for (let k = 1; k <= 6; k++) { const a = a0 + (aE - a0) * k / 6; P.push(ell(a, k % 2 ? 4.5 : -4.5)); }
    const e = ell(aE), e2 = ell(aE - dir * 0.02), tx = (e[0] - e2[0]), ty = (e[1] - e2[1]), tl = Math.hypot(tx, ty) || 1, t = [tx / tl, ty / tl], n = [-t[1] * dir, t[0] * dir];
    for (const [u, v] of [[6, -3], [10, 2], [7, 7], [2, 6], [2, 2], [5, 1.5]]) P.push([e[0] + t[0] * u + n[0] * v, e[1] + t[1] * u + n[1] * v]);
    const seg = spline(P), kids = [];
    walk(seg, 24, 14).forEach(({p, a}, i) => {
      if (p[1] < 40 && Math.abs(p[0] - CX) < half + 10) return;
      kids.push(sway(i % 4 === 2 ? flower(p[0], p[1], 6.6) : leaf(p[0], p[1], a + (i % 2 ? 38 : -38) * dir, 10.5, i % 3 ? 'la-leaf' : 'la-leaf la-leaf2'), i));
    });
    return [s('path', {d: taper(P, 4.6, 0.6, 3.6), class: 'la-whip'}), kids];
  };
  const whip = s('g', {'clip-path': 'url(#' + cid + ')'}, G('whiplash', vine(-1), vine(1)));
  /* 아래 꽃 모자이크 띠 — 금 · 잎 · 살구 낱알을 번갈아 · 사이사이 꽃 */
  const tiles = [], C = ['la-m1', 'la-m2', 'la-m3'], yb = IB + 14;
  const FL = [24, 72, 120, 270, 318, 366];
  for (let x = 14, i = 0; x <= 376; x += 11, i++) {
    if (FL.some(c => Math.abs(c - x) < 10) || !S.free(x - 3, yb - 3, 6, 6, 1)) continue;
    tiles.push(i % 2 ? s('circle', {cx: x, cy: yb, r: 2.8, class: C[(i + 1) % 3]}) : s('rect', {x: x - 3.4, y: yb - 3.4, width: 6.8, height: 6.8, rx: 1, transform: `rotate(45 ${x} ${yb})`, class: C[i % 3]}));
  }
  const fls = FL.filter(x => S.free(x - 8, yb - 8, 16, 16, 0)).map((x, i) => sway(flower(x, yb, 7.4), i));
  const mosaic = G('mosaic', s('line', {x1: OX0 + 4, y1: IB + 3, x2: OX1 - 4, y2: IB + 3, class: 'la-mline'}), s('line', {x1: OX0 + 4, y1: OB - 3, x2: OX1 - 4, y2: OB - 3, class: 'la-mline'}), tiles, G('vine', fls));
  return {defs, pastel, arch, outline, whip, mosaic};
}

/* ── 넷째 판 낱장 — 꽃잎 고리 · 봉오리 고리 · 원판 아래 휘는 리본 · 반신 여인 · 아치를 따라 흐르는 머리 다발 · 땅을 뜻하는 물건 ── */
/** 꽃잎 고리 — 땅 메달 위쪽 활꼴에 살구 · 금 꽃잎을 번갈아(시계 눈금 같은 빛살 대신) */
function petalRing(cx, cy, r, n, big) {
  const d0 = 200, d1 = 340, L = big ? 10.5 : 8.5, Wd = big ? 3.4 : 3;
  let a1 = '', a2 = '', dt = '';
  for (let i = 0; i < n; i++) {
    const a = (d0 + (d1 - d0) * i / (n - 1)) * Math.PI / 180, ca = Math.cos(a), sa = Math.sin(a), b = r + 3.5, x = cx + b * ca, y = cy + b * sa, l = i % 2 ? L * 0.78 : L;
    const pd = `M${f(x)} ${f(y)}Q${f(x + ca * l * 0.5 - sa * Wd)} ${f(y + sa * l * 0.5 + ca * Wd)} ${f(x + ca * l)} ${f(y + sa * l)}Q${f(x + ca * l * 0.5 + sa * Wd)} ${f(y + sa * l * 0.5 - ca * Wd)} ${f(x)} ${f(y)}Z`;
    if (i % 2) a2 += pd; else a1 += pd;
    if (i < n - 1) { const c = (d0 + (d1 - d0) * (i + 0.5) / (n - 1)) * Math.PI / 180; dt += circ(cx + (b + 2.2) * Math.cos(c), cy + (b + 2.2) * Math.sin(c), 1.1); }
  }
  return s('g', {class: 'la-hal'}, s('path', {d: a1, class: 'la-pa'}), s('path', {d: a2, class: 'la-pb'}), s('path', {d: dt, class: 'la-dot'}));
}
/** 봉오리 고리 — ✦ 가 없는 땅 메달 위쪽에 닫힌 작은 봉오리(가는 줄기 활 위에 · 아직 피지 않음) */
function budRing(cx, cy, r, n) {
  const d0 = 208, d1 = 332, b = r + 3;
  let bd = '', lv = '';
  for (let i = 0; i < n; i++) {
    const a = (d0 + (d1 - d0) * i / (n - 1)) * Math.PI / 180, ca = Math.cos(a), sa = Math.sin(a), x = cx + b * ca, y = cy + b * sa, L = i % 2 ? 5.6 : 7, W = 2.3;
    bd += `M${f(x)} ${f(y)}C${f(x + ca * L * 0.3 - sa * W * 1.4)} ${f(y + sa * L * 0.3 + ca * W * 1.4)} ${f(x + ca * L * 0.8 - sa * W * 0.8)} ${f(y + sa * L * 0.8 + ca * W * 0.8)} ${f(x + ca * L)} ${f(y + sa * L)}C${f(x + ca * L * 0.8 + sa * W * 0.8)} ${f(y + sa * L * 0.8 - ca * W * 0.8)} ${f(x + ca * L * 0.3 + sa * W * 1.4)} ${f(y + sa * L * 0.3 - ca * W * 1.4)} ${f(x)} ${f(y)}Z`;
    for (const sg of [-1, 1]) { const la = a + sg * 0.75, l2 = 3.2; lv += `M${f(x)} ${f(y)}Q${f(x + Math.cos(la) * l2 * 0.5 - Math.sin(la) * 1.2)} ${f(y + Math.sin(la) * l2 * 0.5 + Math.cos(la) * 1.2)} ${f(x + Math.cos(la) * l2)} ${f(y + Math.sin(la) * l2)}Q${f(x + Math.cos(la) * l2 * 0.5 + Math.sin(la) * 1.2)} ${f(y + Math.sin(la) * l2 * 0.5 - Math.cos(la) * 1.2)} ${f(x)} ${f(y)}Z`; }
  }
  const p = a => [cx + b * Math.cos(a * Math.PI / 180), cy + b * Math.sin(a * Math.PI / 180)];
  const arc = `M${pt(p(d0 - 4))}A${f(b)} ${f(b)} 0 0 1 ${pt(p(d1 + 4))}`;
  return s('g', {class: 'la-hal', 'data-mucha': 'vine'}, s('path', {d: arc, class: 'la-budstem'}), s('path', {d: lv, class: 'la-leaf'}), s('path', {d: bd, class: 'la-bud'}));
}
/** 원판 아래 휘는 리본 — 원판 밑 곡선(큰 원의 아래 활)을 따라 휨 · 두 줄 이름은 같은 중심의 두 활 위에 새김(흰 테 없음) */
const RA = 240, RB2 = 44, RB1 = 28;
/** 리본 몸통(끝 접힘을 뺀 글 자리) 길이 비 — 부품에 한 번 물어 앎(부품이 바뀌어도 글이 띠 안에 들게) */
let RBK = null;
function ribbonSpan(tw0, th) {
  if (!RBK) { RBK = {}; for (const w of [RB1, RB2]) { const g = ribbon([[0, 0], [100, 0], [200, 0]], {w}); const L = +g.getAttribute('data-len'); RBK[w] = L > 20 && L <= 200 ? L / 200 : 0.7; } }
  return f((tw0 + 5) / (RBK[th] ?? 0.7) + 2);
}
function nameRibbon(u, defs, tone) {
  const two = u.lines.length > 1, th = two ? RB2 : RB1, half = u.rw / 2, yMid = u.cy + 34 + 2 + th / 2, oy = yMid - RA;
  const t0 = Math.asin(Math.min(0.8, half / RA));
  const arc = rad => Array.from({length: 15}, (_, i) => { const t = -t0 + 2 * t0 * i / 14; return [u.cx + rad * Math.sin(t), oy + rad * Math.cos(t)]; });
  const rb = ribbon(arc(RA), {w: th, tone});
  const base = two ? [RA - 11 + 6.4, RA + 11 + 6.4] : [RA + 6.4];
  const txt = base.map((rad, i) => { const id = uid('n'); defs.push(s('path', {id, d: 'M' + arc(rad).map(pt).join('L')})); return s('text', {class: 'la-rt', 'text-anchor': 'middle', 'data-proper': ''}, s('textPath', {href: '#' + id, startOffset: '50%', text: u.lines[i]})); });
  return {rb, txt: G('lettering', txt), bot: yMid + th / 2};
}
/** 아치 안쪽 선을 따라 흐르는 머리 다발 — 머리 꼭대기에서 나와 아치를 따라 땅 원판 뒤로 지나 아치 어깨 덩굴에 닿음(원판 위를 가로지르지 않음) */
function archHair(fx, fy, h, sg, tone, seed) {
  const P = sg > 0 ? [[fx + 0.3 * h, fy - 0.35 * h], [fx + 0.8 * h, fy + 0.35 * h], [fx + 1.2 * h, fy + 1.15 * h], [fx + 1.55 * h, fy + 1.62 * h], [fx + 1.95 * h, fy + 1.55 * h], [fx + 2.3 * h, fy + 1.1 * h], [fx + 2.9 * h, fy + 0.85 * h], [IX1 - 22, fy + 1.25 * h], [IX1 - 6, fy + 1.8 * h], [IX1 - 1, fy + 2.3 * h]]
    : [[fx + 0.1 * h, fy - 0.2 * h], [fx - 0.45 * h, fy + 0.55 * h], [fx - 1.0 * h, fy + 1.15 * h], [fx - 1.5 * h, fy + 1.62 * h], [fx - 1.95 * h, fy + 1.55 * h], [fx - 2.3 * h, fy + 1.1 * h], [fx - 2.9 * h, fy + 0.85 * h], [IX0 + 22, fy + 1.25 * h], [IX0 + 6, fy + 1.8 * h], [IX0 + 1, fy + 2.3 * h]];
  return s('g', {class: 'mk-hair mk-t' + tone, 'data-mucha': 'whiplash'}, s('g', {class: sg < 0 ? 'mk-sway' : 'mk-sway2'},
    strands(P, {n: 5, spread: 8, w0: 4.4, w1: 0.4, curl: 0.9, seed, cls: 'mk-hb'}),
    strands(P, {n: 2, spread: 4.5, w0: 1.4, w1: 0.2, curl: 0.8, seed: seed + 5, cls: 'mk-hd'}),
    strands(P, {n: 2, spread: 3.5, w0: 1.1, w1: 0.15, curl: 0.6, seed: seed + 9, cls: 'mk-hl'})));
}
/** 닫힌 곡선(Catmull-Rom) */
function closedD(P) {
  const n = P.length, seg = [];
  for (let i = 0; i < n; i++) { const p0 = P[(i - 1 + n) % n], p1 = P[i], p2 = P[(i + 1) % n], p3 = P[(i + 2) % n];
    seg.push([p1, [p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6], [p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6], p2]); }
  return segD(seg) + 'Z';
}
/** 가운데 여인 반신 — 후광 원(빛살 · 꽃잎 고리) · 뒤 머리 · 아치를 따라 흐르는 다발 둘 · 어깨 · 팔 · 옷 주름(목까지 옷 · 옷깃) · 옆얼굴 · 꽃관 · 두 손에 꽃다발 */
function bust(cx, hy, hr, cid) {
  const h = hr * 0.6, fx = cx + 2, fy = hy - 6, X = (u, v) => [cx + u * h, fy + v * h], M = a => a.map(([u, v]) => X(u, v));
  const ring = [];
  { const ri = hr * 0.86, ro = hr * 0.985, n = 30; let a1 = '', a2 = '', dt = '';
    for (let i = 0; i < n; i++) { const a = i * 2 * Math.PI / n, ca = Math.cos(a), sa = Math.sin(a), x = cx + ri * Math.cos(a), y = hy + ri * Math.sin(a), L = ro - ri, W = L * 0.5;
      const pd = `M${f(x)} ${f(y)}Q${f(x + ca * L * 0.5 - sa * W)} ${f(y + sa * L * 0.5 + ca * W)} ${f(x + ca * L)} ${f(y + sa * L)}Q${f(x + ca * L * 0.5 + sa * W)} ${f(y + sa * L * 0.5 - ca * W)} ${f(x)} ${f(y)}Z`;
      if (i % 2) a2 += pd; else a1 += pd; const b = a + Math.PI / n; dt += circ(cx + (ro - 1) * Math.cos(b), hy + (ro - 1) * Math.sin(b), 0.9); }
    ring.push(s('path', {d: a1, class: 'mk-pe-a'}), s('path', {d: a2, class: 'mk-pe-b'}), s('path', {d: dt, class: 'mk-mo-g'})); }
  const halo = G('halo', s('circle', {cx, cy: hy, r: hr, class: 'mk-hf1'}), rays(cx, hy, hr * 0.3, hr * 0.84, {n: 36}), s('circle', {cx, cy: hy, r: hr * 0.84, class: 'mk-rim2', 'stroke-width': 0.9}), ring, s('circle', {cx, cy: hy, r: hr, class: 'mk-rim', 'stroke-width': 2.2}));
  const flow = s('g', {'clip-path': 'url(#' + cid + ')'}, archHair(fx, fy, h, -1, 1, 41), archHair(fx, fy, h, 1, 1, 57));
  const back = hair({cx: fx, cy: fy, h, dir: -1, tone: 1, len: 2.1, seed: 4, view: 'profile'});
  /* 몸 — 어깨 · 위팔(소매) · 허리 · 아래는 물결 단(목까지 덮는 옷) */
  const L = [[-0.3, 0.8], [-0.68, 0.96], [-0.98, 1.1], [-1.12, 1.3], [-1.17, 1.6], [-1.15, 1.95], [-1.04, 2.2], [-0.86, 2.38], [-0.66, 2.72], [-0.44, 3.02], [-0.2, 3.1]];
  const body = [...L, [0, 3.04], ...L.slice().reverse().map(([u, v]) => [-u, v]), [0, 0.74]];
  const cloth = s('path', {d: closedD(M(body)), class: 'mk-cl-sage'});
  const folds = [[[-0.2, 1.15], [-0.28, 1.85], [-0.2, 2.5], [-0.32, 3.0]], [[0.22, 1.2], [0.3, 1.9], [0.22, 2.55], [0.34, 3.0]], [[0.02, 1.3], [-0.04, 2.0], [0.04, 2.95]],
    [[-0.86, 1.2], [-1.0, 1.6], [-0.98, 2.0]], [[-0.7, 1.24], [-0.8, 1.66], [-0.76, 2.1]], [[0.86, 1.2], [1.0, 1.6], [0.98, 2.0]], [[0.7, 1.24], [0.8, 1.66], [0.76, 2.1]]]
    .map(p => ktaper(M(p), {w0: 1.5, w1: 0.3, cls: 'mk-cld-sage'}));
  const edge = [ktaper(M([[-0.3, 0.8], [-0.68, 0.96], [-0.98, 1.1], [-1.12, 1.3], [-1.17, 1.6], [-1.15, 1.95], [-1.04, 2.2]]), {w0: 1.2, w1: 2.4, cls: 'mk-ink'}),
    ktaper(M([[0.3, 0.8], [0.68, 0.96], [0.98, 1.1], [1.12, 1.3], [1.17, 1.6], [1.15, 1.95], [1.04, 2.2]]), {w0: 1.2, w1: 2.4, cls: 'mk-ink'}),
    ktaper(M([[-0.95, 2.4], [-0.72, 2.72], [-0.46, 3.02], [-0.22, 3.1]]), {w0: 1.6, w1: 0.3, cls: 'mk-ink'}), ktaper(M([[0.95, 2.4], [0.72, 2.72], [0.46, 3.02], [0.22, 3.1]]), {w0: 1.6, w1: 0.3, cls: 'mk-ink'})];
  const fc = face({cx: fx, cy: fy, h, dir: -1, view: 'profile', tilt: 3, iris: 1});
  /* 옷깃 — 목을 끝까지 덮는 둥근 깃(살색이 목 아래로 내려오지 않음) · 금 구슬 · 보석 */
  const col = [[-0.27, 0.62], [0, 0.57], [0.29, 0.62], [0.42, 0.86], [0.6, 1.06], [0.2, 1.16], [0, 1.24], [-0.2, 1.16], [-0.6, 1.06], [-0.42, 0.86]];
  let bd = ''; for (let i = 0; i <= 8; i++) { const t = i / 8, u = -0.52 + 1.04 * t, v = 1.08 + 0.12 * Math.sin(Math.PI * t); const p = X(u, v); bd += circ(p[0], p[1], 1.05); }
  const gp = X(0, 1.24), collar = [s('path', {d: closedD(M(col)), class: 'mk-collar'}), s('path', {d: bd, class: 'mk-pearl'}),
    s('path', {d: `M${pt(gp)}C${f(gp[0] + 3)} ${f(gp[1] + 3)} ${f(gp[0] + 2)} ${f(gp[1] + 7)} ${f(gp[0])} ${f(gp[1] + 8)}C${f(gp[0] - 2)} ${f(gp[1] + 7)} ${f(gp[0] - 3)} ${f(gp[1] + 3)} ${pt(gp)}Z`, class: 'mk-gem-g'})];
  /* 앞 머리 다발 — 귀 뒤에서 오른 어깨 앞으로 흘러 끝이 말림 */
  const front = s('g', {class: 'mk-hair mk-t1'}, s('g', {class: 'mk-sway'}, strands(M([[0.16, 0.25], [0.3, 0.6], [0.52, 0.95], [0.66, 1.35], [0.6, 1.75], [0.74, 2.1]]), {n: 4, spread: h * 0.14, w0: h * 0.07, w1: 0.3, curl: 0.7, seed: 12, cls: 'mk-hb'}),
    strands(M([[0.16, 0.25], [0.3, 0.6], [0.52, 0.95], [0.66, 1.35], [0.6, 1.75]]), {n: 2, spread: h * 0.1, w0: h * 0.025, w1: 0.15, curl: 0.6, seed: 13, cls: 'mk-hd'})));
  /* 꽃관 — 머리 뒤쪽 꼭대기에 작은 꽃 셋 · 잎 */
  const A = a => [fx + (-0.2 + 0.52 * Math.cos(a)) * h * -1, fy + (-0.3 + 0.47 * Math.sin(a)) * h];
  const crown = [-150, -118, -86].flatMap((dg, i) => { const p = A(dg * Math.PI / 180); return [leaf(p[0], p[1], dg + 200, 8, 'lw-leaf'), flower(p[0], p[1], i === 1 ? 5.4 : 4.4, 'lw')]; });
  /* 팔 — 팔꿈치에서 안으로 굽어 가슴 앞에서 두 손이 꽃다발을 쥠(긴 소매 · 손목까지) */
  const eL = X(-0.98, 1.98), eR = X(0.98, 1.98), hc = X(0, 2.62), arm = (e, sg) => { const dx = hc[0] - sg * 3.5 - e[0], dy = hc[1] - e[1], Ln = Math.hypot(dx, dy); return sleeve({x: e[0], y: e[1], ang: -Math.atan2(dx, dy) * 180 / Math.PI, len: Ln - 9, w: 14, hand: 'hold', dir: -sg, tone: 'peach'}); };
  const fp = X(0, 2.3), bouquet = [leaf(fp[0] - 2, fp[1] + 6, 205, 11, 'lw-leaf'), leaf(fp[0] + 2, fp[1] + 6, -25, 11, 'lw-leaf'), flower(fp[0] - 7.5, fp[1] + 3, 5, 'lw'), flower(fp[0] + 7.5, fp[1] + 2, 5, 'lw'), flower(fp[0], fp[1] - 3, 6, 'lw')];
  return G('outline', halo, flow, back, cloth, folds, edge, fc, collar, front, crown, arm(eL, -1), arm(eR, 1), G('pastel', bouquet));
}
/** 땅을 뜻하는 물건 — 날개 단 바퀴(운송) · 돛배(유통 · 바다) · 번개(전력) · 금화(금융) · 잎(바이오) · 그 밖은 별 · 파스텔 칠 · 굵기 변하는 금 윤곽 */
function wingedWheel(x, y, r) {
  let sp = '', fe = '', fe2 = '';
  const edges = [];
  for (let i = 0; i < 8; i++) { const a = i * Math.PI / 4; sp += `M${f(x + r * 0.24 * Math.cos(a))} ${f(y + r * 0.24 * Math.sin(a))}L${f(x + r * 0.78 * Math.cos(a))} ${f(y + r * 0.78 * Math.sin(a))}`; }
  for (const sg of [-1, 1]) for (let j = 0; j < 4; j++) {
    const bx = x + sg * r * 0.8, by = y - r * 0.12, a = -(0.32 + j * 0.3), ang = sg > 0 ? a : Math.PI - a, L = r * (1.62 - j * 0.24), W = r * 0.27;
    const ca = Math.cos(ang), sa = Math.sin(ang), side = sg > 0 ? 1 : -1;
    const d = `M${f(bx)} ${f(by)}Q${f(bx + ca * L * 0.5 - sa * W * side)} ${f(by + sa * L * 0.5 + ca * W * side)} ${f(bx + ca * L)} ${f(by + sa * L)}Q${f(bx + ca * L * 0.55 + sa * W * 0.45 * side)} ${f(by + sa * L * 0.55 - ca * W * 0.45 * side)} ${f(bx)} ${f(by)}Z`;
    if (j % 2) fe2 += d; else fe += d;
    if (j === 3) edges.push(ktaper([[bx, by], [bx + ca * L * 0.5 + sa * W * 0.6 * side, by + sa * L * 0.5 - ca * W * 0.6 * side], [bx + ca * L, by + sa * L]], {w0: 2.4, w1: 0.4, cls: 'lw-goldl'}));
  }
  return [s('path', {d: fe2, class: 'lw-wing2'}), s('path', {d: fe, class: 'lw-wing'}), edges, s('circle', {cx: f(x), cy: f(y), r: f(r * 0.8), class: 'lw-disc'}),
    s('path', {d: circ(x, y, r) + circ(x, y, r * 0.8), 'fill-rule': 'evenodd', class: 'lw-gold'}), s('path', {d: sp, class: 'lw-spoke'}), s('circle', {cx: f(x), cy: f(y), r: f(r * 0.24), class: 'lw-gold'}), s('circle', {cx: f(x), cy: f(y), r: f(r * 0.1), class: 'lw-disc'})];
}
function sailShip(x, y, z) {
  const hull = `M${f(x - 1.25 * z)} ${f(y)}C${f(x - 0.9 * z)} ${f(y + 0.55 * z)} ${f(x + 0.9 * z)} ${f(y + 0.55 * z)} ${f(x + 1.3 * z)} ${f(y - 0.05 * z)}Z`;
  const sail = `M${f(x - 0.05 * z)} ${f(y - 1.55 * z)}C${f(x + 0.6 * z)} ${f(y - 1.1 * z)} ${f(x + 0.75 * z)} ${f(y - 0.55 * z)} ${f(x + 0.85 * z)} ${f(y - 0.18 * z)}L${f(x - 0.05 * z)} ${f(y - 0.18 * z)}Z`;
  const sail2 = `M${f(x - 0.18 * z)} ${f(y - 1.25 * z)}C${f(x - 0.55 * z)} ${f(y - 0.9 * z)} ${f(x - 0.75 * z)} ${f(y - 0.5 * z)} ${f(x - 0.85 * z)} ${f(y - 0.18 * z)}L${f(x - 0.18 * z)} ${f(y - 0.18 * z)}Z`;
  const wave = (yy, k) => ktaper(Array.from({length: 9}, (_, i) => [x - 1.5 * z + i * 0.375 * z, yy + Math.sin(i * 1.6 + k) * 0.12 * z]), {w0: 2.2, w1: 0.4, cls: 'lw-wave'});
  return [s('path', {d: sail2, class: 'lw-sail2'}), s('path', {d: sail, class: 'lw-sail'}),
    ktaper([[x - 0.05 * z, y - 1.55 * z], [x + 0.6 * z, y - 1.1 * z], [x + 0.78 * z, y - 0.55 * z], [x + 0.85 * z, y - 0.18 * z]], {w0: 0.5, w1: 2.2, cls: 'lw-goldl'}),
    ktaper([[x - 0.18 * z, y - 1.25 * z], [x - 0.55 * z, y - 0.9 * z], [x - 0.75 * z, y - 0.5 * z], [x - 0.85 * z, y - 0.18 * z]], {w0: 0.5, w1: 1.8, cls: 'lw-goldl'}),
    ktaper([[x - 0.1 * z, y + 0.02 * z], [x - 0.1 * z, y - 1.7 * z]], {w0: 2.2, w1: 0.7, cls: 'lw-goldl'}), s('path', {d: hull, class: 'lw-gold'}),
    ktaper([[x - 1.1 * z, y + 0.12 * z], [x, y + 0.3 * z], [x + 1.15 * z, y + 0.06 * z]], {w0: 0.4, w1: 1.4, cls: 'lw-disc'}), wave(y + 0.5 * z, 0), wave(y + 0.78 * z, 1.5)];
}
function emblem(id, x, y) {
  const k = String(id ?? '');
  if (k === 'hold' || k === 'heavy') return k === 'hold' ? wingedWheel(x, y, 19.5) : sailShip(x, y + 8, 22);
  if (k === 'power') return [s('path', {d: `M${f(x + 4)} ${f(y - 27)}L${f(x - 13)} ${f(y + 3)}L${f(x - 1)} ${f(y + 3)}L${f(x - 7)} ${f(y + 27)}L${f(x + 15)} ${f(y - 6)}L${f(x + 3)} ${f(y - 6)}Z`, class: 'lw-wing'}),
    ktaper([[x + 4, y - 27], [x - 13, y + 3], [x - 1, y + 3], [x - 7, y + 27]], {w0: 2.4, w1: 0.6, cls: 'lw-goldl'})];
  if (k === 'fin') return [s('circle', {cx: x, cy: y, r: 20, class: 'lw-wing'}), s('path', {d: circ(x, y, 21) + circ(x, y, 15.5), 'fill-rule': 'evenodd', class: 'lw-gold'}), star5(x, y, 11, 'lw-gold')];
  if (k === 'bio') return [leaf(x - 2, y + 18, -70, 44, 'lw-leaf'), leaf(x - 2, y + 18, -125, 32, 'lw-leaf'), leaf(x - 2, y + 18, -20, 30, 'lw-leaf')];
  return [star5(x, y, 19, 'lw-gold'), star5(x - 25, y + 13, 7, 'lw-gold'), star5(x + 24, y + 15, 6.5, 'lw-gold')];
}
const emblem2 = (id, x, y) => (String(id) === 'hold' ? sailShip(x, y + 8, 22) : String(id) === 'heavy' ? wingedWheel(x, y, 18) : emblem('', x, y));
/** 빈 바탕 무늬 — 아래 빈 자리에 옅은 물결 · 작은 별(자리 장부의 빈 곳에만) */
function calm(S, y0, y1) {
  const kids = [];
  for (let y = y0, r = 0; y <= y1; y += 24, r++) for (let x = 48 + (r % 2) * 16; x <= 342; x += 34) {
    if (y < archY(x) + 10) continue;
    if (r % 2 === 0 && S.free(x - 13, y - 5, 26, 10, 3)) kids.push(ktaper([[x - 12, y + 1], [x - 6, y - 2.5], [x, y + 1], [x + 6, y - 2.5], [x + 12, y + 1]], {w0: 1.6, w1: 0.4, cls: 'la-calm'}));
    else if (r % 2 && S.free(x - 5, y - 5, 10, 10, 3)) kids.push(star5(x, y, 3.2, 'la-calm'));
  }
  return G('stars', kids);
}

/** 하늘 — 별(아치 안 빈 자리에만) */
function sky(S, spots) {
  const kids = []; let i = 0;
  for (const [x, y, k] of spots) {
    const r = k === 'moon' ? 9 : k === 'big' ? 6 : 3.4;
    if (y - r < archY(x) + 4 || !S.free(x - r, y - r, 2 * r, 2 * r)) continue;
    kids.push(s('g', {class: 'la-tw la-tw' + (1 + (i++ % 3))}, k === 'moon' ? moon(x, y, r) : star5(x, y, r, 'la-star')));
  }
  return G('stars', kids);
}
/** 어두운 판에서 아치 바깥 귀퉁이를 짙은 밤색으로(밝은 판은 비움) */
const backing = () => s('rect', {x: 0, y: 0, width: W, height: H, class: 'la-bgd'});
/** 두루마리 위 글(고정 색 — 두루마리가 어두운 판에서도 크림이라) */
const pText = (x, y, kids, cls = '') => s('text', {x: f(x), y: f(y), 'text-anchor': 'middle', class: 'la-pt' + (cls ? ' ' + cls : ''), 'data-proper': ''}, kids);

/* ── 빈 자료 — 「확인 필요」 그림(멈추지 않음) ── */
function needPic(d) {
  const S = seats(); S.add(70, 270, 250, 90); S.add(CX - 72, 30, 144, 150);
  const F = frame('땅 지도', 20, S);
  return s('svg', {class: 'su-svg su-art4 su-land-art la-need', viewBox: `0 0 ${W} ${H}`, role: 'img', 'aria-label': '땅 지도 · ' + NEED, preserveAspectRatio: 'xMidYMid meet'},
    backing(), F.defs, F.pastel, F.arch, F.whip, F.mosaic, F.outline, sky(S, [[80, 120, 'moon'], [310, 114, 'big'], [96, 160, 'small'], [294, 160, 'small']]),
    medallion({cx: CX, cy: 100, r: 64, v: 1, ring: 'petal'}),
    G('lettering', s('text', {x: CX, y: 306, 'text-anchor': 'middle', class: 'la-t la-title', text: NEED}),
      s('text', {x: CX, y: 342, 'text-anchor': 'middle', class: 'la-t la-f19 la-soft', text: d?.mode === 'one' ? '이 땅 자료를 받지 못했어요' : '땅 자료를 받지 못했어요'})));
}

/* ── ① 열 땅 정원 ── */
/** 한 줄에 놓기 — 먼저 고른 자리(고르게) · 안 되면 폭대로 붙여 가운데 정렬 · 그래도 넘치면 null */
function place(Wd, pref, lo, hi, gap = 4) {
  const n = Wd.length, ok = xs => xs.every((x, i) => x - Wd[i] / 2 >= lo && x + Wd[i] / 2 <= hi && (!i || xs[i - 1] + Wd[i - 1] / 2 + gap <= x - Wd[i] / 2));
  if (pref && ok(pref)) return pref;
  const sum = Wd.reduce((a, w) => a + w, 0); if (sum + gap * (n - 1) > hi - lo) return null;
  const g = n > 1 ? Math.min(16, (hi - lo - sum) / (n - 1)) : 0; let x = (lo + hi) / 2 - (sum + g * (n - 1)) / 2;
  return Wd.map(w => { const c = x + w / 2; x += w + g; return f(c); });
}
/** 한 줄 놓기(리본) — 바깥 리본 끝이 아치 창 안 · 이웃 원판 · 글 띠가 닿지 않게 · 먼저 고른 자리가 되면 그대로 */
function placeR(us, pref) {
  const n = us.length, R = 34, lo = IX0 + 2, hi = IX1 - 2, m = us.map(u => u.tw + 8);
  const gap = i => Math.max(2 * R + 10, (m[i] + m[i + 1]) / 2 + 4), x0 = lo + us[0].rw / 2, xn = hi - us[n - 1].rw / 2;
  const ok = xs => xs[0] >= x0 - 0.5 && xs[n - 1] <= xn + 0.5 && xs.every((x, i) => !i || x - xs[i - 1] >= gap(i - 1) - 0.5);
  if (pref && pref.length === n && ok(pref)) return pref;
  if (n === 1) return x0 <= CX && CX <= xn ? [CX] : null;
  let G0 = 0; for (let i = 0; i < n - 1; i++) G0 += gap(i);
  const extra = xn - x0 - G0; if (extra < 0) return null;
  const e = extra / (n + 1), xs = [f(x0 + e)]; for (let i = 1; i < n; i++) xs.push(f(xs[i - 1] + gap(i - 1) + e));
  return xs;
}
function allPic(d) {
  const lands = [...d.lands].sort((a, b) => b.star - a.star || a.i - b.i); // ✦ 가 많은 땅이 윗자리(먼저 눈에 듦) · 같으면 자료 차례
  const total = lands.reduce((a, u) => a + u.n, 0), title = '우량주 ' + total + '곳 · ' + (KO[lands.length] ?? lands.length) + ' 땅';
  const R = 34, NFS = 18, HY = 98, HR = 56, S = seats(), lo = IX0 + 2, hi = IX1 - 2;
  for (const u of lands) { u.lines = split2(u.name, NFS, 96); u.tw = Math.max(...u.lines.map(l => tw(l, NFS))); u.rh = u.lines.length > 1 ? RB2 + 2 : RB1 + 2; u.rw = ribbonSpan(u.tw, u.lines.length > 1 ? RB2 : RB1); u.uw = Math.max(2 * R + 6, u.rw - 10); }
  /* 줄 나누기 — 첫 줄은 여인 곁 두 자리 · 나머지는 세 · 두 칸 줄(리본이 서로 닿지 않는 나눔을 고름 · 차례는 그대로) */
  const top = lands.slice(0, Math.min(2, lands.length)), rest = lands.slice(top.length), pats = [];
  const comp = (m, acc) => { if (!m) { pats.push(acc); return; } for (const c of [3, 2]) if (c <= m && m - c !== 1) comp(m - c, [...acc, c]); if (m === 1) pats.push([...acc, 1]); };
  comp(rest.length, []);
  pats.sort((a, b) => a.length - b.length || (b.every((c, i) => !i || c !== b[i - 1]) ? 1 : 0) - (a.every((c, i) => !i || c !== a[i - 1]) ? 1 : 0));
  const PREF = {1: [CX], 2: [130, 260], 3: [86, 195, 304]};
  let rows = null;
  for (const pat of pats) {
    let k = 0; const rr = [];
    for (const c of pat) { const us = rest.slice(k, k + c); k += c; const xs = placeR(us, PREF[c]); if (!xs) { rr.length = 0; break; } rr.push({us, xs}); }
    if (rr.length) { rows = rr; break; }
  }
  if (!rows) { rows = []; for (let k = 0; k < rest.length; k += 3) { const us = rest.slice(k, k + 3); rows.push({us, xs: PREF[us.length]}); } }
  const tx = top.length === 2 ? [Math.max(80, lo + top[0].rw / 2 - 4), Math.min(310, hi - top[1].rw / 2 + 4)] : [CX];
  rows.unshift({us: top, xs: tx, top: true});
  /* 높이 — 메달 · 리본(메달 밑 곡선을 따라 휨) · ✦ 줄은 꽃잎 고리 자리만큼 더 */
  let y = 120; const U = [];
  rows.forEach((row, r) => {
    const st = row.us.some(u => u.star > 0), ph = Math.max(...row.us.map(u => u.rh));
    if (r) y = y + 2 + R + (st ? 12 : 4);
    row.us.forEach((u, j) => U.push({...u, cx: f(row.xs[j]), cy: y, row: r}));
    row.cy = y; row.bot = y + R + ph; y = row.bot;
  });
  const spare = Math.max(0, IB - 30 - y), step = rows.length > 1 ? Math.min(14, spare / (rows.length - 1)) : 0;
  rows.forEach((row, r) => { row.cy = f(row.cy + step * r); });
  for (const u of U) u.cy = f(u.cy + step * u.row);
  S.add(CX - HR - 6, HY - HR - 6, 2 * HR + 12, 2 * HR + 60); // 여인 반신
  for (const u of U) { S.add(u.cx - R - 3, u.cy - R - 3, 2 * R + 6, 2 * R + 6); S.add(u.cx - u.rw / 2 - 4, u.cy + R - 8, u.rw + 8, u.rh + 12); if (u.star > 0) S.add(u.cx - R - 14, u.cy - R - 14, 2 * R + 28, R + 16); }
  const legend = '✦ 는 21곳에 든 회사 수', legW = f(tw(legend, NFS) + 30);
  S.add(CX - legW / 2 + 8, IB + 4, legW - 16, 24);
  const F = frame(title, 20, S), cid = uid('w'), ldefs = [];
  /* 아치 안 옅은 동심원 후광(여인 후광에서 퍼져 나감) */
  const inWin = (x, y) => x > IX0 + 2 && x < IX1 - 2 && y < IB - 2 && y > archY(x) + 2;
  const conc = G('halo', [78, 104, 134, 168, 206, 250, 300, 356].map((r, i) => { let dd = '', on = false;
    for (let k = 0; k <= 240; k++) { const a = k * Math.PI / 120, x = CX + r * Math.cos(a), y = HY + r * Math.sin(a); if (inWin(x, y)) { dd += (on ? 'L' : 'M') + f(x) + ' ' + f(y); on = true; } else on = false; }
    return dd ? s('path', {d: dd, class: 'la-cc' + (i % 2 ? ' la-cc2' : '')}) : null; }));
  /* 나무 — 여인 꽃다발에서 나와 S 로 내려가는 한 줄기(위 굵게 · 아래 가늘게) · 줄마다 땅 사이 틈으로 지나며 가지가 땅 원판으로(원판 뒤로 들어감) */
  const TP = [[CX, HY - 6 + 2.62 * HR * 0.6], [CX - 3, HY - 6 + 3.3 * HR * 0.6]];
  const gaps = rows.slice(1).map((row, r) => { const xs = U.filter(u => u.row === r + 1).map(u => u.cx).sort((a, b) => a - b); const g = xs.length > 1 ? xs.slice(1).map((x, i) => (x + xs[i]) / 2) : [xs[0] + (r % 2 ? 50 : -50)]; return {g: g[g.length > 1 ? r % 2 : 0], cy: row.cy}; });
  gaps.forEach(({g, cy}, i) => { if (i) TP.push([(g + gaps[i - 1].g) / 2, (cy + gaps[i - 1].cy) / 2 - 8]); TP.push([g, cy]); });
  const lastG = gaps.length ? gaps[gaps.length - 1] : {g: CX, cy: TP[1][1]}; TP.push([lastG.g + 6, lastG.cy + 44], [lastG.g - 4, Math.min(IB - 14, lastG.cy + 70)]);
  const branches = U.filter(u => u.row > 0).map((u, i) => { const gp = gaps[u.row - 1], a = [gp.g, gp.cy], m = [(a[0] + u.cx) / 2, (a[1] + u.cy) / 2 - 12]; return kvine([a, m, [u.cx, u.cy]], {w0: 3.4, w1: 1.1, leaves: 2, buds: i % 2, seed: 7 + i * 5}); });
  const tree = s('g', {'clip-path': 'url(#' + cid + ')'}, G('vine', kvine(TP, {w0: 7.5, w1: 1.6, leaves: 14, buds: 4, seed: 3}), branches));
  /* 고리 — ✦ 가 있는 땅은 꽃잎 고리(셋 넘으면 꽃잎 열다섯) · ✦ 0 은 작은 봉오리 고리 */
  const halo = G('halo', U.map(u => (u.star > 0 ? petalRing(u.cx, u.cy, R, u.star >= 3 ? 15 : 11, u.star >= 3) : budRing(u.cx, u.cy, R, 9))));
  /* 땅 메달 — 굵기가 변하는 금 테(초승달 꼴) · 안은 원판 · 아래 휘는 리본 · 누르는 자리 높이 60 넘게 */
  const rbs = [], units = U.map(u => {
    const on = u.star > 0, rb = nameRibbon(u, ldefs, on ? 'gold' : 'cream'), hitT = u.cy - R - 6, hitB = rb.bot + 4, hw = Math.max(64, u.uw);
    rbs.push(rb.rb);
    return s('a', {href: '#/m/' + u.id, class: 'la-u', 'aria-label': u.name + ' 땅 · 우량주 ' + u.n + '곳 · 21곳에 든 회사 ' + u.star + '곳'},
      s('circle', {cx: u.cx, cy: u.cy, r: R - 2, class: on ? 'la-disc-on' : 'la-disc-off'}),
      G('outline', s('path', {d: circ(u.cx, u.cy, R) + circ(u.cx - 1.1, u.cy - 1.5, R - 5.2), 'fill-rule': 'evenodd', class: on ? 'la-ring-on' : 'la-ring-off'}), s('circle', {cx: u.cx, cy: u.cy, r: R + 3, class: 'la-fine'})),
      s('text', {x: u.cx, y: f(u.cy + 1), 'text-anchor': 'middle', class: 'la-t la-cnt', text: u.n + '곳'}),
      s('text', {x: u.cx, y: f(u.cy + 22), 'text-anchor': 'middle', class: 'la-t la-st ' + (on ? 'la-st-on' : 'la-st-off'), text: '✦ ' + u.star}),
      rb.txt,
      s('rect', {x: f(u.cx - hw / 2), y: f(hitT), width: f(hw), height: f(hitB - hitT), rx: 14, class: 'la-hit'}));
  });
  const leg = G('lettering', s('text', {x: CX, y: IB + 23, 'text-anchor': 'middle', class: 'la-legt'}, s('tspan', {class: 'la-legs', text: '✦'}), s('tspan', {text: ' 는 21곳에 든 회사 수'})));
  const clip = s('defs', {}, s('clipPath', {id: cid}, s('path', {d: archIn})), ldefs);
  return s('svg', {class: 'su-svg su-art4 su-land-art la-all', viewBox: `0 0 ${W} ${H}`, role: 'group', preserveAspectRatio: 'xMidYMid meet',
    'aria-label': '땅 지도 · 우량주 ' + total + '곳을 ' + U.length + '땅으로 · ✦ 는 21곳에 든 회사 수'},
  backing(), F.defs, clip, F.pastel, conc, F.whip, F.mosaic, F.outline, F.arch, tree, bust(CX, HY, HR, cid), halo, leg, s('g', {'clip-path': 'url(#' + cid + ')'}, G('lettering', rbs)), s('g', {class: 'la-units'}, units));
}

/* ── ② 한 땅 — 아치 창 안의 업종 꽃대(줄기에서 돋은 잎 막대) ── */
const XL = 36, XR = 354; // 그림 안쪽 글 자리(덩굴 띠 안)
/** 한 줄 짜임 — 이름은 막대 반대쪽 축 곁 · 값은 막대 끝 잎 너머 · 같은 값이면 같은 길이가 되는 가장 긴 막대(k = 1 값당 길이)를 찾음 */
function solve1(rows, nfs, neg, pos, tip) {
  const NL = Math.max(0, ...rows.filter(r => r.v > 0).map(r => tw(r.nm, nfs))), NR = Math.max(0, ...rows.filter(r => r.v <= 0).map(r => tw(r.nm, nfs)));
  const labL = Math.max(0, ...rows.filter(r => r.v <= 0).map(r => tw(sgnP(r.v), nfs))), labR = Math.max(0, ...rows.filter(r => r.v > 0).map(r => tw(sgnP(r.v), nfs)));
  const lower = k => Math.max(XL + (NL ? NL + 9 : 0), XL + (neg > 0 ? labL + 7 + tip + neg * k : 0)), upper = k => Math.min(XR - (NR ? NR + 9 : 0), XR - (pos > 0 ? labR + 7 + tip + pos * k : 0));
  const big = Math.max(neg, pos, 1e-9); let a = 0, b = 230 / big;
  if (lower(0) > upper(0)) return null;
  for (let i = 0; i < 40; i++) { const m = (a + b) / 2; if (lower(m) <= upper(m)) a = m; else b = m; }
  return big * a >= 48 ? {k: a, axis: (lower(a) + upper(a)) / 2} : null;
}
/** 회사 이름 줄 — 판 폭에 들면 한 줄 · 넘치면 두 줄(두 줄 가운데 긴 줄이 가장 짧아지는 자리) */
function nameLines(name, fs, maxW) {
  const t = String(name ?? '');
  if (tw(t, fs) <= maxW || t.length < 4) return [t];
  const pre = ['포스코', '현대', '효성', '삼성', '한화', '롯데', '두산', '한국', '대한', '신세계', '제주', '한진', '아이티센', '제이에스', 'LG', 'SK', 'CJ', 'GS', 'HD', 'KT'].find(p => t.startsWith(p) && t.length > p.length + 1 && tw(t.slice(p.length), fs) <= maxW);
  if (pre) return [pre, t.slice(pre.length)];
  let best = null;
  for (let i = 2; i <= t.length - 2; i++) { const l = [t.slice(0, i), t.slice(i)], m = Math.max(tw(l[0], fs), tw(l[1], fs)); if (!best || m < best.m) best = {m, l}; }
  return best.l;
}
/** 잎 끝 장식 — 오름 = 작은 핀 꽃 · 내림 = 닫힌 붉은 봉오리(잎 끝과 값 사이 빈 틈에 · 값을 가리지 않음) */
function tipBud(r, axis, tip, i) {
  if (!(r.len > 6) || tip < 10) return null;
  const sg = r.v < 0 ? -1 : 1, x0 = axis + sg * r.len, cx = x0 + sg * Math.min(9, tip * 0.5), cy = r.bc;
  if (sg > 0) return sway(flower(cx, cy, 6.2, 'lw'), i);
  return null && sway(s('g', {}, s('path', {d: `M${f(x0)} ${f(cy)}L${f(cx + 3.5)} ${f(cy)}`, class: 'la-budstem'}), s('path', {d: `M${f(cx + 4)} ${f(cy)}C${f(cx + 2)} ${f(cy - 4.2)} ${f(cx - 3)} ${f(cy - 3.6)} ${f(cx - 5)} ${f(cy)}C${f(cx - 3)} ${f(cy + 3.6)} ${f(cx + 2)} ${f(cy + 4.2)} ${f(cx + 4)} ${f(cy)}Z`, class: 'la-bud la-bud-dn'})), i);
}
function onePic(d) {
  const inds = (d.inds ?? []).filter(g => g && g.name);
  if (!inds.length) return needPic(d);
  const seen = new Set(), stars = (d.stars ?? []).filter(c => c?.code && !seen.has(c.code) && seen.add(c.code));
  const S = seats(), tFs = tw(d.name, 20) <= 250 ? 20 : 19, LCY = 90, LR = 52;
  S.add(CX - LR - 6, LCY - LR - 6, 2 * LR + 12, 2 * LR + 18);
  /* ✦ 회사 아치 판 — 셋씩 한 줄(차례 그대로) · 판 꼭대기 ✦ · 이름은 한 줄, 넓으면 낱말 자리에서 두 줄 · 줄 간격 82(누르는 자리 높이 60 넘게) */
  const TFS = 18, PW = 100, PH = 72, TP = 82, PG = 9, tags = stars.map(c => ({...c, lines: nameLines(c.name, TFS, PW - 13)})), trows = [];
  for (let i = 0; i < tags.length; i += 3) { const items = tags.slice(i, i + 3); trows.push({items, w: items.length * PW + (items.length - 1) * PG}); }
  const tagsH = trows.length ? trows.length * TP + 18 : 50, Y0 = 162, BOT = IB - 4 - tagsH;
  const N = inds.length, rh = Math.min(64, (BOT - Y0) / N);
  const R = inds.map(g => ({g, v: fin(g.ch20) ? g.ch20 : 0, nm: (g.star ? '✦ ' : '') + g.name}));
  const neg = Math.max(0, ...R.map(r => -r.v)), pos = Math.max(0, ...R.map(r => r.v));
  /* 짜임 고르기 — 줄이 넉넉하면 두 줄(이름 위 · 꽃대 아래) · 빽빽하면 한 줄(이름은 꽃대 반대쪽) — 글 상자끼리 겹치지 않게 */
  let two = rh >= 60, nfs = 18, k = 1, axis = CX, side = 'X';
  const bh1 = Math.round(Math.min(22, Math.max(14, rh * 0.42))), tip1 = bh1 * 0.85 + 2;
  if (!two) { let sol = null; for (nfs = rh >= 46 ? 20 : rh >= 40 ? 19 : 18; nfs >= 18; nfs--) if ((sol = solve1(R, nfs, neg, pos, tip1))) break; if (sol) ({k, axis} = sol); else { two = true; nfs = 18; } }
  const bh = two ? Math.round(Math.min(20, Math.max(14, nfs * 0.95))) : bh1, tip = bh * 0.85 + 2;
  if (two) {
    nfs = Math.max(18, Math.min(21, Math.floor((rh - 6) / 3)));
    const labL = Math.max(0, ...R.filter(r => r.v <= 0).map(r => tw(sgnP(r.v), nfs))), labR = Math.max(0, ...R.filter(r => r.v > 0).map(r => tw(sgnP(r.v), nfs)));
    const lo = neg > 0 ? XL + labL + 7 + tip : 46, hi = pos > 0 ? XR - labR - 7 - tip : 344;
    k = (hi - lo) / Math.max(1e-9, neg + pos); axis = lo + neg * k;
    side = axis - 8 - Math.max(...R.map(r => tw(r.nm, nfs))) >= XL ? 'L' : 'R';
  }
  axis = f(axis);
  const rows = R.map((r, i) => {
    const y = Y0 + i * rh, len = Math.abs(r.v) * k, nw = tw(r.nm, nfs), vw = tw(sgnP(r.v), nfs);
    let nb, vb, bc;
    if (two && rh < 58) { nb = y + 0.95 * nfs; bc = nb + 0.25 * nfs + bh / 2 + 3; vb = bc + 0.36 * nfs; } // 빽빽한 두 줄 — 값 줄이 다음 이름 줄에 닿지 않게
    else if (two) { nb = y + 1.16 * nfs + 2; vb = nb + 1.45 * nfs + 2; bc = vb - 0.36 * nfs; }
    else { bc = y + rh / 2; nb = vb = bc + 0.36 * nfs; }
    const bt = bc - bh / 2, bx = r.v < 0 ? axis - len : axis, vx = r.v < 0 ? axis - len - tip - 5 : axis + len + tip + 5;
    const nLeft = two ? side === 'L' : r.v > 0, nx = nLeft ? axis - 9 : axis + 9;
    S.add(nLeft ? nx - nw : nx, nb - 1.16 * nfs, nw, 1.46 * nfs); S.add(Math.min(bx, bx - (r.v < 0 ? tip : 0)) - 2, bt - 2, Math.max(2, len) + tip + 4, bh + 4); S.add(r.v < 0 ? vx - vw : vx, vb - 1.16 * nfs, vw, 1.46 * nfs);
    return {...r, y, len, bt, bc, nb, vb, bx, vx, nx, nLeft};
  });
  const barsEnd = Y0 + N * rh;
  /* 축 = 아래 굵고 위 가는 줄기 · 꽃대 사이 빈 틈에 잎(꽃대 · 이름 · 값을 가리지 않게) */
  const axLeaves = [];
  for (let i = 0; i < N - 1; i++) { const gy = f((rows[i].bt + bh + rows[i + 1].bt) / 2); if (rows[i + 1].bt - (rows[i].bt + bh) < 12) continue;
    if (S.free(axis - 13, gy - 6, 12, 10, 1)) axLeaves.push(sway(leaf(axis - 1, gy, i % 2 ? 200 : 160, 11, i % 2 ? 'la-leaf' : 'la-leaf la-leaf2'), i));
    if (S.free(axis + 1, gy - 6, 12, 10, 1)) axLeaves.push(sway(leaf(axis + 1, gy, i % 2 ? -20 : 20, 11, i % 2 ? 'la-leaf la-leaf2' : 'la-leaf'), i + 1)); }
  S.add(axis - 4, Y0 - 16, 8, barsEnd - Y0 + 22);
  /* 땅을 뜻하는 물건 — 메달 양옆 */
  const EM = [[CX - 102, 124], [CX + 84, 120]];
  for (const [x, y] of EM) S.add(x - 50, y - 34, 100, 60);
  /* 아래 — ✦ 회사 두루마리 줄 또는 「없어요」 두루마리 */
  const tagTop = f(barsEnd + 4), tagRows = trows.map((r, i) => { const py = tagTop + 18 + i * TP; let x = CX - r.w / 2; const items = r.items.map(t => { const it = {...t, x, py}; x += PW + PG; S.add(it.x, py - 2, PW, PH + 4); return it; }); return {py, items}; });
  const noteT = '이 땅에는 이번 21곳이 없어요', noteW = f(tw(noteT, 19) + 30);
  if (!trows.length) S.add(CX - noteW / 2, tagTop, noteW, 52);
  const F = frame(d.name, tFs, S), cid = uid('w');
  /* 덩굴 — 줄기 아래 끝에서 갈라져 아치 판 꼭대기마다 닿음(판 뒤로 지남) */
  const vines = [], fork = [axis, f(barsEnd + 8)];
  tagRows.forEach((r, ri) => r.items.forEach((t, j) => { const top = [t.x + PW / 2, t.py + 3], mid = [(fork[0] + top[0]) / 2 + (j - 1) * 6, Math.min(fork[1], top[1]) - 6 + ri * 10]; vines.push(kvine([fork, mid, top], {w0: 3, w1: 1.1, leaves: 2, buds: (j + ri) % 2, seed: 11 + ri * 7 + j * 3})); }));
  const stars2 = sky(S, [[312, 60 + 10, 'small'], [78, 72, 'small'], [56, 140, 'small'], [336, 140, 'small']]);
  /* 줄기 — 맨 아래에서 굵게 올라와 맨 위 꽃대 위에서 가늘게 끝남(작은 잎 둘) */
  const stemTop = Y0 - 14, stemBot = f(trows.length ? barsEnd + 8 : barsEnd + 2);
  const stem = G('vine', ktaper([[axis, stemBot], [axis, (stemBot + stemTop) / 2], [axis, stemTop]], {w0: 5.6, w1: 1.4, cls: 'mk-vstem'}),
    leaf(axis, stemTop + 3, -128, 10, 'la-leaf'), leaf(axis, stemTop + 3, -52, 10, 'la-leaf la-leaf2'), axLeaves);
  /* 값 꽃대 — 모양은 그대로(같은 값 → 같은 길이 · 같은 차례) · 오름 = 금 꽃대 · 내림 = 붉은 꽃대 · 끝에 잎 · 잎 너머에 값 */
  const bars = s('g', {class: 'la-bars'},
    rows.map((r, i) => s('g', {class: 'la-row', 'data-v': f(r.v), 'data-len': f2(r.len)},
      leafBar({x: axis, y: f(r.bc), len: f2(r.len), dir: r.v < 0 ? 'left' : 'right', w: Math.min(22, bh + 4), tone: r.v < 0 ? 'red' : 'gold'}), tipBud(r, axis, tip, i),
      s('text', {x: f(r.nx), y: f(r.nb), 'text-anchor': r.nLeft ? 'end' : 'start', class: 'la-t la-ind la-f' + nfs, 'data-proper': ''}, r.g.star ? s('tspan', {class: 'la-gold', text: '✦ '}) : null, s('tspan', {text: r.g.name})),
      s('text', {x: f(r.vx), y: f(r.vb), 'text-anchor': r.v < 0 ? 'end' : 'start', class: 'la-t la-val la-f' + nfs + (r.v > 0 ? ' la-val-up' : r.v < 0 ? ' la-val-dn' : ''), text: sgnP(r.g.ch20)}))));
  const tagEls = tagRows.flatMap(r => r.items.map(t => { const cx = t.x + PW / 2, two = t.lines.length > 1, by = two ? [t.py + 45, t.py + 65] : [t.py + 55];
    return s('a', {href: '#/c/' + t.code, class: 'la-tag', 'aria-label': t.name + ' · 21곳에 든 회사 · ' + t.ind + ' 업종'},
      plaque({x: t.x, y: t.py, w: PW, h: PH, tone: 'cream'}),
      s('text', {x: f(cx), y: f(t.py + 25), 'text-anchor': 'middle', class: 'la-rt la-pgold', text: '✦'}),
      t.lines.map((l, i) => s('text', {x: f(cx), y: f(by[i]), 'text-anchor': 'middle', class: 'la-rt la-tag-t', 'data-proper': '', text: l})),
      s('rect', {x: f(t.x - 2), y: f(t.py - 4), width: PW + 4, height: PH + 8, rx: 16, class: 'la-hit'})); }));
  const note = trows.length ? null : [plaque({x: CX - noteW / 2, y: tagTop + 2, w: noteW, h: 48, tone: 'cream', knots: false}), s('text', {x: CX, y: f(tagTop + 38), 'text-anchor': 'middle', class: 'la-rt la-f19', text: noteT})];
  const em = G('outline', s('g', {class: 'la-emb'}, emblem(d.id, ...EM[0])), s('g', {class: 'la-emb'}, emblem2(d.id, ...EM[1])));
  const restTop = trows.length ? tagTop + tagsH : tagTop + 56, calmEl = calm(S, f(barsEnd + 12), IB - 12);
  return s('svg', {class: 'su-svg su-art4 su-land-art la-one', viewBox: `0 0 ${W} ${H}`, role: 'group', preserveAspectRatio: 'xMidYMid meet',
    'aria-label': d.name + ' 땅 · 업종 ' + N + '개 · 20거래일 동안 움직인 만큼 · 21곳에 든 회사 ' + stars.length + '곳'},
  backing(), F.defs, s('defs', {}, s('clipPath', {id: cid}, s('path', {d: archIn}))), F.pastel, calmEl, F.whip, F.mosaic, F.outline, F.arch, stars2, em,
  medallion({cx: CX, cy: LCY, r: LR, v: 2, ring: 'mosaic'}), s('g', {'clip-path': 'url(#' + cid + ')'}, G('vine', vines)), stem, bars, G('lettering', note, tagEls));
}

/** 자료 받기 — id 가 없으면 ① 열 땅 · 있으면 ② 한 땅 */
export async function load(get, id = null) {
  const M = await get(MAP);
  const lands = Array.isArray(M?.lands) ? M.lands : null;
  if (!lands || !lands.length) return {mode: id ? 'one' : 'all', need: true, id: id ?? null};
  const asOf = M?.asOf?.board ?? null;
  if (!id) return {mode: 'all', asOf, lands: lands.map((L, i) => { const cos = (L.inds ?? []).flatMap(g => g?.cos ?? []); return {id: L.id, name: L.name, n: cos.length, star: cos.filter(isStar).length, i}; })};
  const L = lands.find(x => x.id === id);
  if (!L) return {mode: 'one', need: true, id};
  return {mode: 'one', asOf, id: L.id, name: L.name,
    inds: (L.inds ?? []).map(g => ({name: g?.name, ch20: g?.ch20, star: (g?.cos ?? []).filter(isStar).length})),
    stars: (L.inds ?? []).flatMap(g => (g?.cos ?? []).filter(isStar).map(c => ({code: c.code, name: c.name, ind: g.name})))};
}
/** 그림 — <svg viewBox="0 0 390 620"> 하나(자료가 없으면 「확인 필요」 그림) */
export function picture(d, opt = {}) {
  void opt;
  if (!d || d.need) return needPic(d);
  return d.mode === 'one' ? onePic(d) : allPic(d);
}
