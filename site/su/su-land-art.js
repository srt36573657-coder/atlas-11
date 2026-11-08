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
import {taper as ktaper, strands, medallion, vine as kvine, face, hair, sleeve, rays, leafBar, plaque} from './su-mucha-kit.js';
/* 넷째 판(r4-brief.md L): 02 = 가운데 여인 반신(어깨 · 팔 · 옷 주름 · 두 손에 꽃) · 머리 다발은 아치 안쪽을 따라 원판 뒤로 · 이름 = 원판 아래 휘는 리본 · 잇는 덩굴 = 꽃다발에서 S 로 내려가는 나무 한 줄기와 가지 · 빈 원(✦0) 봉오리 고리 · 아치 안 옅은 동심원 · 아치 글씨 흰 테 없음
   03 = 막대 = 잎(leafBar · 길이 그대로) · 회사 이름 = 줄기 아래 끝에서 갈라진 덩굴에 매단 아치 판(셋씩) · 날개 바퀴 · 돛배 1.5배(후광 양옆에 붙음 · 파스텔 · 굵기 변하는 윤곽) · 빈 바탕에 옅은 물결 · 별
   일곱째 판(r7-brief.md L): 02 = 리본 꼬리 → 메달 아래 둥근 이름 띠(겹침 0) · 꽃잎 술 → 두 겹 금테 + 모자이크 점 고리 · 여인 = 주름 옷 · 두 손에서 덩굴 · 소용돌이 머리 타래
   03 = 회사 여섯 → 기둥을 나눠 쓰는 아치 회랑(분홍 · 연두 · 크림 · 어두운 판은 짙은 갈색 + 금테) · 물건은 후광에 붙은 모자이크 원 안 · 옅은 햇살 · 동심원 · 메달 1.2배 · 머리 한 가닥이 줄기로 */

export const CSS = '/su/su-land-art.css';
const MAP = '/su/data/su21-map.json';
const W = 390, H = 620, NEED = '확인 필요';
const fin = x => typeof x === 'number' && Number.isFinite(x);
const f = v => Math.round(v * 10) / 10, f2 = v => Math.round(v * 100) / 100; // f2 = 막대 자리(같은 값 → 같은 길이를 0.01 까지)
const pt = p => f(p[0]) + ' ' + f(p[1]);
const mid = (a, b, t) => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t];
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

/* ── 낱장(일곱째 판 · r7-brief.md L) — 메달 아래 둥근 이름 띠(꼬리 없음) · 두 겹 금테 + 모자이크 점 고리(✦ 땅만 꽃 관) · 반신 여인(어깨 · 팔꿈치 · 손목이 보이는 주름 옷 · 두 손에서 덩굴 줄기) · 끝이 가늘어지는 소용돌이 머리 타래 · 땅을 뜻하는 물건 ── */
/** 일곱째 판 — 메달 아래 둥근 이름 띠: 메달 밑을 받치는 웃는 활꼴 띠 · 끝은 둥근 모서리(꼬리 · 접힘 없음 → 이웃 띠와 겹치지 않음) · 두 겹 금테 · 글은 띠를 따라 휨(흰 테 없음) */
const NB = 150, RB2 = 46, RB1 = 28, NPAD = 18;
function nameBand(u, defs, on) {
  const two = u.lines.length > 1, th = two ? RB2 : RB1, yMid = u.cy + 35 + th / 2, oy = yMid - NB, half = u.rw / 2;
  const P2 = (r, t) => [u.cx + r * Math.sin(t), oy + r * Math.cos(t)];
  const shape = (i0, i1, hw, dr) => { const t0 = Math.asin(Math.min(0.95, hw / NB)), a = P2(i0, -t0 + dr / i0), b = P2(i0, t0 - dr / i0), c = P2(i0 + dr, t0), d = P2(i1 - dr, t0), e = P2(i1, t0 - dr / i1), g = P2(i1, -t0 + dr / i1), h = P2(i1 - dr, -t0), k = P2(i0 + dr, -t0);
    return `M${pt(a)}A${f(i0)} ${f(i0)} 0 0 0 ${pt(b)}Q${pt(P2(i0, t0))} ${pt(c)}L${pt(d)}Q${pt(P2(i1, t0))} ${pt(e)}A${f(i1)} ${f(i1)} 0 0 1 ${pt(g)}Q${pt(P2(i1, -t0))} ${pt(h)}L${pt(k)}Q${pt(P2(i0, -t0))} ${pt(a)}Z`; };
  const rb = s('g', {class: 'la-nb ' + (on ? 'la-nb-on' : 'la-nb-off'), 'data-mucha': 'lettering'}, s('path', {d: shape(NB - th / 2, NB + th / 2, half, 9), class: 'la-nbf'}), s('path', {d: shape(NB - th / 2 + 3, NB + th / 2 - 3, half - 3, 6.5), class: 'la-nbl'}));
  const t1 = Math.asin(Math.min(0.95, (half + 24) / NB)), base = two ? [NB - 11 + 6.4, NB + 11 + 6.4] : [NB + 6.4];
  const txt = base.map((rad, i) => { const id = uid('n'); defs.push(s('path', {id, d: `M${pt(P2(rad, -t1))}A${f(rad)} ${f(rad)} 0 0 0 ${pt(P2(rad, t1))}`})); return s('text', {class: 'la-rt', 'text-anchor': 'middle', 'data-proper': ''}, s('textPath', {href: '#' + id, startOffset: '50%', text: u.lines[i]})); });
  return {rb, txt: G('lettering', txt), bot: yMid + th / 2};
}
/** 메달 둘레 — 두 겹 금테 밖 모자이크 점 고리(금 · 잎 · 살구 점과 작은 마름모 · 아래 띠 뒤는 비움) · ✦ 있는 땅만 꼭대기에 작은 꽃 관(분홍 꽃잎 술 · 배지 느낌 지움) */
function dotRing(cx, cy, r, crown) {
  const n = 30, q = ['', '', ''];
  for (let i = 0; i < n; i++) {
    const a = i * 2 * Math.PI / n - Math.PI / 2, dg = (((a * 180 / Math.PI) % 360) + 540) % 360 - 180;
    if ((dg > 32 && dg < 148) || (crown && dg > -126 && dg < -54)) continue;
    const x = cx + r * Math.cos(a), y = cy + r * Math.sin(a);
    q[i % 3] += i % 2 ? circ(x, y, 1.5) : `M${f(x)} ${f(y - 2.1)}L${f(x + 2.1)} ${f(y)}L${f(x)} ${f(y + 2.1)}L${f(x - 2.1)} ${f(y)}Z`;
  }
  const kids = [s('path', {d: q[0], class: 'la-m1'}), s('path', {d: q[1], class: 'la-m2'}), s('path', {d: q[2], class: 'la-m3'})];
  if (crown) {
    const at = (dg, rr) => [cx + rr * Math.cos(dg * Math.PI / 180), cy + rr * Math.sin(dg * Math.PI / 180)];
    for (const [dg, lr] of [[-104, 1], [-76, -1]]) { const p = at(dg, r - 1); kids.push(leaf(p[0], p[1], dg + lr * 34, 9, 'lw-leaf')); }
    kids.push(...[[-90, 5.4], [-115, 4.1], [-65, 4.1]].map(([dg, fr]) => { const p = at(dg, r + 1.5); return flower(p[0], p[1], fr, 'lw'); }));
  }
  return s('g', {'data-mucha': 'mosaic', class: 'la-ring'}, kids);
}
/** 굵기 변하는 채운 선(점 목록 그대로) — 처음 w0 · 끝 w1 · 가운데 부풂 wm */
function fillLine(p, w0, w1, wm = 0, pw = 1) {
  const L = [], R = [], n = p.length;
  for (let i = 0; i < n; i++) { const q = p[Math.min(n - 1, i + 1)], o = p[Math.max(0, i - 1)]; let dx = q[0] - o[0], dy = q[1] - o[1]; const l = Math.hypot(dx, dy) || 1; dx /= l; dy /= l;
    const t = i / Math.max(1, n - 1), hw = Math.max(0.15, (w0 + (w1 - w0) * Math.pow(t, pw) + wm * Math.sin(Math.PI * t)) / 2); L.push([p[i][0] - dy * hw, p[i][1] + dx * hw]); R.push([p[i][0] + dy * hw, p[i][1] - dx * hw]); }
  return 'M' + L.map(pt).join('L') + 'L' + R.reverse().map(pt).join('L') + 'Z';
}
/** 곡선(Catmull-Rom) 끝에 안으로 말리는 소용돌이를 이음(마지막 접선을 이어받음 · dir 1 = 시계 방향) */
function curled(P, r, dir, turns = 1.2) {
  const A = []; spline(P).forEach((q, si) => { for (let i = si ? 1 : 0; i <= 10; i++) A.push(bz(q, i / 10)); });
  const a = A[A.length - 2], b = A[A.length - 1]; let tx = b[0] - a[0], ty = b[1] - a[1]; const l = Math.hypot(tx, ty) || 1; tx /= l; ty /= l;
  const N = dir > 0 ? [-ty, tx] : [ty, -tx], c = [b[0] + N[0] * r, b[1] + N[1] * r], a0 = Math.atan2(b[1] - c[1], b[0] - c[0]);
  for (let i = 1; i <= 22; i++) { const t = i / 22, an = a0 - dir * t * turns * 2 * Math.PI, rr = r * (1 - 0.74 * t); A.push([c[0] + rr * Math.cos(an), c[1] + rr * Math.sin(an)]); }
  return A;
}
/** 머리 한 타래 — 뿌리 굵고 끝 가는 채운 띠 · 끝은 소용돌이 · 짙은 테 한 겹 · 밝은 결 한 줄(빗자루 직선 묶음 대신) */
function lock(P, r, dir, w0, tone = 1, turns = 1.2, sw = 0) {
  const A = curled(P, r, dir, turns), m = Math.max(3, Math.round((A.length - 22) * 0.62));
  return s('g', {class: 'mk-hair mk-t' + tone}, s('g', {class: sw % 2 ? 'mk-sway2' : 'mk-sway'},
    s('path', {d: fillLine(A, w0 + 1.6, 0.6, 0, 0.55), class: 'mk-hd'}), s('path', {d: fillLine(A, w0, 0.3, 0, 0.55), class: 'mk-hb'}),
    s('path', {d: fillLine(A.slice(3, m), w0 * 0.2, 0.25), class: 'mk-hl'})));
}
/** 닫힌 곡선(Catmull-Rom) */
function closedD(P) {
  const n = P.length, seg = [];
  for (let i = 0; i < n; i++) { const p0 = P[(i - 1 + n) % n], p1 = P[i], p2 = P[(i + 1) % n], p3 = P[(i + 2) % n];
    seg.push([p1, [p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6], [p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6], p2]); }
  return segD(seg) + 'Z';
}
/* ── 아홉째 판(r9-brief.md B23) — 메달 흉상을 지우고 큰 여인 한 명이 그림을 채움 ──
   머리는 그림 위 1/5 안 · 치맛단은 아래 1/5 · S자(엉덩이를 오른쪽으로 · 왼 무릎 굽힘 · 고개 기울임) · 둥근 어깨 · 풍만한 엉덩이 · 옷은 목 · 손목 · 발목까지
   띠(겉옷)가 오른 어깨에서 왼 엉덩이로 몸을 비스듬히 감고 발치에서 말림 · 치맛단은 바닥에 퍼져 양끝이 말림(분홍 꼬리 없음) · 후광은 머리 뒤 큰 원 */
/** 머리 다발 — 가는 가닥 대여섯을 묶은 다발(속 띠 하나 + 공용 strands · 뿌리 굵고 끝 가늚) */
const tress = (p, {n = 6, spread = 12, w0 = 2.4, curl = 0.7, seed = 1, tone = 1, core = 6, sw = 0} = {}) => s('g', {class: 'mk-hair mk-t' + tone}, s('g', {class: sw % 2 ? 'mk-sway2' : 'mk-sway'},
  core ? ktaper(p, {w0: core, w1: 0.6, cls: 'mk-hb'}) : null, strands(p, {n, spread, w0, w1: 0.22, curl, seed, cls: 'mk-hb'})));
/** 큰 후광 — 빛살 · 꽃잎 고리 · 점 고리 · 두 겹 금테(머리 뒤) */
function bigHalo(cx, cy, r) {
  const ri = r * 0.86, ro = r * 0.985, n = 32; let a1 = '', a2 = '', dt = '';
  for (let i = 0; i < n; i++) { const a = i * 2 * Math.PI / n, ca = Math.cos(a), sa = Math.sin(a), x = cx + ri * ca, y = cy + ri * sa, L = ro - ri, Wd = L * 0.5;
    const pd = `M${f(x)} ${f(y)}Q${f(x + ca * L * 0.5 - sa * Wd)} ${f(y + sa * L * 0.5 + ca * Wd)} ${f(x + ca * L)} ${f(y + sa * L)}Q${f(x + ca * L * 0.5 + sa * Wd)} ${f(y + sa * L * 0.5 - ca * Wd)} ${f(x)} ${f(y)}Z`;
    if (i % 2) a2 += pd; else a1 += pd; const b = a + Math.PI / n; dt += circ(cx + (ro - 1) * Math.cos(b), cy + (ro - 1) * Math.sin(b), 0.9); }
  return G('halo', s('circle', {cx: f(cx), cy: f(cy), r: f(r), class: 'mk-hf1'}), rays(cx, cy, r * 0.3, r * 0.84, {n: 40}), s('circle', {cx: f(cx), cy: f(cy), r: f(r * 0.84), class: 'mk-rim2', 'stroke-width': 0.9}),
    s('path', {d: a1, class: 'mk-pe-a'}), s('path', {d: a2, class: 'mk-pe-b'}), s('path', {d: dt, class: 'mk-mo-g'}), s('circle', {cx: f(cx), cy: f(cy), r: f(r), class: 'mk-rim', 'stroke-width': 2.4}));
}
/** 큰 여인 — pose 'open'(두 팔을 들어 벌림 · 두 손이 덩굴을 쥠) | 'hold'(두 손이 가슴 앞에서 줄기를 위아래로 쥠 · hx = 줄기 자리)
   돌려줌 {halo, back, body, hands, y} — 쓰는 쪽이 층(후광 → 뒤 머리 → 몸)을 정함 */
function lady(o) {
  const {cx, top, hem, pose = 'open', cloth = 'sage', sash = 'gold', arm = 'ivory', tone = 5, view = 'three', fdir = 1, seed = 3, sx = 12, hx = cx, hw = 1} = o, hend = o.hend;
  const T = hem - top, Y = t => top + t * T, h = T * 0.104, fx = cx + fdir * 1.5, fy = top + h * 0.66;
  const ySh = fy + h * 0.98, yWa = o.wa ?? Y(0.355), yBu = (ySh + yWa) / 2 + 4, yHi = yWa + T * 0.085, yKn = Y(0.67), yCa = Y(0.83);
  const Lp = [[cx - 10, ySh - 7], [cx - 34, ySh - 3], [cx - 52, ySh + 9], [cx - 56, ySh + 30], [cx - 47, yBu + 4], [cx - 36, yBu + 24], [cx - 25 + sx * 0.3, yWa], [cx - 36 + sx, yWa + (yHi - yWa) * 0.55], [cx - 46 + sx, yHi],
    [cx - 46 + sx * 0.8, Y(0.54)], [cx - 42 + sx * 0.4, yKn], [cx - 52, yCa], [cx - 70, Y(0.93)], [cx - 88, hem - 4]];
  const Hm = [[cx - 66, hem + 2], [cx - 42, hem - 3], [cx - 18, hem + 3], [cx + 6, hem - 2], [cx + 30, hem + 3], [cx + 54, hem - 3], [cx + 76, hem + 1]];
  const Rp = [[cx + 94, hem - 6], [cx + 72, Y(0.92)], [cx + 56, yCa], [cx + 50 + sx * 0.4, yKn], [cx + 56 + sx * 0.8, Y(0.54)], [cx + 58 + sx, yHi], [cx + 46 + sx, yWa + (yHi - yWa) * 0.55], [cx + 29 + sx * 0.3, yWa],
    [cx + 38, yBu + 24], [cx + 49, yBu + 4], [cx + 57, ySh + 30], [cx + 53, ySh + 9], [cx + 35, ySh - 3], [cx + 10, ySh - 7]];
  const dress = s('path', {d: closedD([...Lp, ...Hm, ...Rp]), class: 'mk-cl-' + cloth + ' la-ol'});
  /* 치마 주름 — 엉덩이에서 휘며 흘러내려 아래로 갈수록 굵음(일곱 줄) · 굽힌 왼 무릎 둘레 주름 · 가슴 아래 잔주름 */
  const folds = Array.from({length: 7}, (_, i) => { const u = -1 + i / 3, j = i % 2 ? 1 : -1;
    return ktaper([[cx + sx * 0.7 + u * 26, yHi + 6 + (i % 2) * 14], [cx + sx * 0.45 + u * 36 + j * 6, Y(0.6)], [cx + u * 50 - j * 5, Y(0.79)], [cx + 6 + u * 72, hem - 5 - (i % 3) * 3]], {w0: 0.4, w1: 2.5, cls: 'mk-cld-' + cloth}); })
    .concat(ktaper([[cx - 40 + sx * 0.6, yKn - 44], [cx - 24, yKn - 10], [cx - 32, yKn + 26]], {w0: 0.4, w1: 2, cls: 'mk-cld-' + cloth}),
      [[[cx - 30, yBu + 6], [cx - 20, yBu + 18], [cx - 10, yWa - 8]], [[cx + 34, yBu + 4], [cx + 24, yBu + 18], [cx + 16, yWa - 8]]].map(a => ktaper(a, {w0: 1.4, w1: 0.3, cls: 'mk-cld-' + cloth})));
  /* 띠 — 오른 어깨에서 왼 엉덩이로 비스듬히 감고 왼쪽으로 흘러 발치에서 말림 */
  const A = [[cx + 42, ySh + 1], [cx + 22, yBu - 6], [cx - 6, yWa - 14], [cx - 36 + sx * 0.5, yHi - 12], [cx - 52, Y(0.58)], [cx - 62, Y(0.75)], [cx - 80, Y(0.9)], [cx - 104, hem - 2]];
  const B = [[cx - 84, hem + 4], [cx - 58, Y(0.9)], [cx - 44, Y(0.75)], [cx - 32, Y(0.58)], [cx - 16 + sx * 0.5, yHi + 2], [cx + 10, yWa + 2], [cx + 36, yBu + 10], [cx + 56, ySh + 18]];
  const sashEl = [s('path', {d: closedD([...A, ...B]), class: 'mk-cl-' + sash + ' la-ol'}),
    [0.32, 0.66].map((t, i) => ktaper(A.map((p, k) => mid(p, B[B.length - 1 - k], t)).slice(1), {w0: 0.4, w1: 2 + i * 0.4, cls: 'mk-cld-' + sash})),
    s('path', {d: fillLine(curled([[cx - 86, hem + 3], [cx - 104, hem + 1], [cx - 116, hem - 8]], 5.5, 1, 1.15), 8, 0.8, 0, 0.7), class: 'mk-cl-' + sash + ' la-ol'}),
    s('path', {d: fillLine(curled([[cx + 74, hem + 1], [cx + 94, hem - 1], [cx + 108, hem - 9]], 5.5, -1, 1.15), 8, 0.8, 0, 0.7), class: 'mk-cl-' + cloth + ' la-ol'})];
  const edges = [ktaper(Lp.slice(1), {w0: 3.4, w1: 0.6, cls: 'mk-ink'}), ktaper([...Rp].reverse().slice(1), {w0: 3.4, w1: 0.6, cls: 'mk-ink'}), ktaper(A, {w0: 2.4, w1: 0.5, cls: 'mk-ink'})];
  const belt = [s('path', {d: closedD([[cx - 26 + sx * 0.3, yWa - 5], [cx + 3, yWa - 2], [cx + 30 + sx * 0.3, yWa - 6], [cx + 31 + sx * 0.3, yWa + 3], [cx + 3, yWa + 6], [cx - 27 + sx * 0.3, yWa + 4]]), class: 'mk-collar'}),
    s('circle', {cx: f(cx + 3), cy: f(yWa + 2), r: 3.4, class: 'mk-gem-g'})];
  let pr = ''; for (let i = 0; i <= 8; i++) { const t = i / 8; pr += circ(cx - 18 + 36 * t, ySh + 2 + 5 * Math.sin(Math.PI * t), 1.15); }
  const collar = [s('path', {d: closedD([[cx - 13, ySh - 13], [cx, ySh - 15], [cx + 13, ySh - 13], [cx + 22, ySh - 1], [cx + 10, ySh + 8], [cx, ySh + 10], [cx - 10, ySh + 8], [cx - 22, ySh - 1]]), class: 'mk-collar'}), s('path', {d: pr, class: 'mk-pearl'})];
  /* 팔 — 부푼 윗소매 + 손목까지 소매(공용 sleeve · 가늘고 긴 손가락이 덩굴 · 줄기를 감쌈) */
  const ups = [], fores = [], hands = [];
  for (const sg of [-1, 1]) {
    const up = pose === 'open' ? [[cx + sg * 34, ySh - 4], [cx + sg * 58, ySh - 2], [cx + sg * 74, ySh + 16], [cx + sg * 84, ySh + 38], [cx + sg * 78, ySh + 52], [cx + sg * 64, ySh + 44], [cx + sg * 52, ySh + 28], [cx + sg * 40, ySh + 16]]
      : [[cx + sg * 34, ySh - 4], [cx + sg * 58, ySh], [cx + sg * 66, ySh + 22], [cx + sg * 64, yBu + 6], [cx + sg * 54, yBu + 16], [cx + sg * 46, yBu + 2], [cx + sg * 44, ySh + 22], [cx + sg * 38, ySh + 10]];
    ups.push(s('path', {d: closedD(up), class: 'mk-cl-' + arm + ' la-ol'}), ktaper([up[0], up[1], up[2], up[3], up[4]], {w0: 2.6, w1: 0.6, cls: 'mk-ink'}),
      ktaper([mid(up[1], up[6], 0.3), mid(up[2], up[6], 0.4), mid(up[3], up[5], 0.5)], {w0: 1.3, w1: 0.3, cls: 'mk-cld-' + arm}));
    const E = pose === 'open' ? [cx + sg * 78, ySh + 44] : [cx + sg * 56, yBu + 10];
    const H = pose === 'open' ? o.hands[sg < 0 ? 0 : 1] : [hx, sg < 0 ? ySh + 24 : ySh + 5];
    const dx = H[0] - E[0], dy = H[1] - E[1], L = Math.hypot(dx, dy), w = 15;
    fores.push(sleeve({x: f(E[0]), y: f(E[1]), ang: f(-Math.atan2(dx, dy) * 180 / Math.PI), len: f(Math.max(10, L - 9)), w, hand: 'hold', dir: pose === 'open' ? sg : -sg, tone: arm}));
    hands.push(H);
  }
  /* 머리 — 공용 hair(머리 덩이) + 가는 가닥 다발이 어깨 뒤로 흘러 엉덩이에서 말림 · 앞 다발 하나는 어깨 앞으로 · 꽃관 */
  const back = [tress([[fx - h * 0.25, fy - h * 0.3], [cx - 44, ySh - 10], [cx - 40 - 24 * hw, yBu - 4], [cx - 40 - 22 * hw, yWa], [cx - 46 - 28 * hw, hend ?? yHi + 8]], {n: 6, spread: 13, w0: 2.6, curl: 0.8, seed: seed + 1, tone, core: 7, sw: 0}),
    tress([[fx + h * 0.25, fy - h * 0.3], [cx + 46, ySh - 10], [cx + 42 + 24 * hw, yBu - 4], [cx + 42 + 24 * hw + sx * 0.5, yWa], [cx + 50 + 30 * hw + sx, hend ?? yHi + 10]], {n: 6, spread: 13, w0: 2.6, curl: 0.8, seed: seed + 2, tone, core: 7, sw: 1}),
    hair({cx: fx, cy: fy, h, dir: fdir, tone, len: 2, seed, view})];
  const front = tress([[fx - fdir * h * 0.36, fy + h * 0.02], [fx - fdir * h * 0.42, fy + h * 0.42], [cx - fdir * 30, ySh + 4], [cx - fdir * 36, yBu - 6], [cx - fdir * 30, yBu + 18]], {n: 4, spread: 7, w0: 2, curl: 0.7, seed: seed + 5, tone, core: 4, sw: 1});
  const fc = face({cx: fx, cy: fy, h, dir: fdir, view, tilt: -4, iris: 1});
  const Cr = a => [fx + (-0.12 * fdir + 0.5 * Math.cos(a)) * h, fy + (-0.36 + 0.42 * Math.sin(a)) * h];
  const crown = [-150, -120, -90, -60, -30].flatMap((dg, i) => { const p = Cr(dg * Math.PI / 180); return [leaf(p[0], p[1], dg + 180 + (i % 2 ? 30 : -30), 8, 'lw-leaf'), flower(p[0], p[1], i === 2 ? 5.6 : 4.4, 'lw')]; });
  return {halo: bigHalo(cx, fy - 2, h * 1.18), back: G('whiplash', back),
    body: G('outline', dress, folds, sashEl, belt, ups, edges, collar, fc, front, s('g', {'data-mucha': 'vine'}, crown)), fore: G('outline', fores), hands, y: {fy, ySh, yWa, yHi, hem, h}};
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
  /* 머리 — 끝이 가늘어지는 소용돌이 타래(왼쪽 둘 · 오른쪽 셋 · 굵기 · 말림 크기 · 방향 다르게 · 위로 솟는 고리 없음): 어깨 뒤에서 흘러내려 하나는 땅 메달 뒤로 지나 양옆 덩굴 테두리에서 작게 말리고 · 하나는 어깨 곁에서 크게 말림 */
  const flow = s('g', {'clip-path': 'url(#' + cid + ')', 'data-mucha': 'whiplash'},
    lock([[fx - 4, fy + 30], [cx - 34, fy + 39], [cx - 50, fy + 31], [cx - 68, fy + 28], [cx - 100, fy + 35], [cx - 140, fy + 40], [cx - 156, fy + 48]], 4, -1, 6, 1, 1.15, 1),
    lock([[fx, fy + 26], [cx - 40, fy + 44], [cx - 53, fy + 62], [cx - 51, fy + 80]], 7.4, -1, 5, 1, 1.25, 0),
    lock([[fx + 8, fy + 30], [cx + 36, fy + 39], [cx + 54, fy + 30], [cx + 72, fy + 27], [cx + 104, fy + 34], [cx + 140, fy + 38], [cx + 157, fy + 48]], 4.4, 1, 6.4, 1, 1.1, 0),
    lock([[fx + 16, fy - 4], [cx + 40, fy + 4], [cx + 56, fy + 20], [cx + 60, fy + 42]], 6.4, 1, 5, 1, 1.25, 1),
    lock([[fx + 16, fy + 30], [cx + 40, fy + 56], [cx + 50, fy + 76], [cx + 54, fy + 94]], 4.8, -1, 4.2, 1, 1.1, 0));
  const back = hair({cx: fx, cy: fy, h, dir: -1, tone: 1, len: 2.1, seed: 4, view: 'profile'});
  /* 몸 — 장미빛 긴 옷(목까지 · 허리 잘록) · 어깨에서 팔꿈치까지 부푼 상아빛 윗소매 · 팔꿈치 아래로 늘어진 소매 자락 · 손목에서 모인 두 손(초록 항아리 몸 지움) */
  const both = fn => [fn(-1), fn(1)], MS = (a, sg) => M(a.map(([u, v]) => [u * sg, v]));
  const torso = s('path', {d: closedD(M([[0, 0.76], [0.4, 0.82], [0.8, 0.98], [0.92, 1.36], [0.88, 1.8], [0.7, 2.2], [0.72, 2.6], [0.56, 2.98], [0.24, 3.16], [0, 3.1], [-0.24, 3.16], [-0.56, 2.98], [-0.72, 2.6], [-0.7, 2.2], [-0.88, 1.8], [-0.92, 1.36], [-0.8, 0.98], [-0.4, 0.82]])), class: 'mk-cl-rose'});
  const belt = s('path', {d: closedD(M([[-0.88, 1.72], [0, 1.83], [0.88, 1.72], [0.86, 1.86], [0, 1.97], [-0.86, 1.86]])), class: 'mk-collar'});
  const upper = both(sg => s('path', {d: closedD(MS([[0.5, 0.86], [0.9, 0.96], [1.18, 1.14], [1.34, 1.46], [1.36, 1.8], [1.27, 2.08], [1.08, 2.18], [0.93, 2.02], [0.9, 1.64], [0.82, 1.3], [0.66, 1.06]], sg)), class: 'mk-cl-ivory'}));
  const drape = both(sg => s('path', {d: closedD(MS([[1.22, 2.04], [1.33, 2.46], [1.23, 2.84], [0.98, 3.05], [0.8, 2.93], [0.66, 2.63], [0.5, 2.42], [0.78, 2.28], [1.02, 2.18]], sg)), class: 'mk-cl-ivory'}));
  const fold = (a, sg, w0, w1, c) => ktaper(MS(a, sg), {w0, w1, cls: c});
  const folds = [[[0.72, 1.06], [0.5, 1.4], [0.28, 1.7]], [[0.48, 1.0], [0.33, 1.34], [0.14, 1.68]]].flatMap(a => both(sg => fold(a, sg, 1.3, 0.3, 'mk-cld-rose')))
    .concat([[[0.48, 2.36], [0.56, 2.7], [0.44, 3.02]], [[0.2, 2.4], [0.26, 2.78], [0.16, 3.1]]].flatMap(a => both(sg => fold(a, sg, 0.3, 1.5, 'mk-cld-rose'))),
      [[[1.12, 1.2], [1.22, 1.55], [1.17, 1.95]], [[0.99, 1.3], [1.05, 1.65], [1.02, 1.98]]].flatMap(a => both(sg => fold(a, sg, 1.4, 0.3, 'mk-cld-ivory'))),
      [[[1.14, 2.28], [1.2, 2.6], [1.05, 2.93]], [[0.92, 2.34], [0.97, 2.64], [0.88, 2.9]]].flatMap(a => both(sg => fold(a, sg, 0.3, 1.6, 'mk-cld-ivory'))));
  /* 바깥선 — 어깨에서 굵게 시작해 팔꿈치 · 자락 끝으로 가늘게 · 안쪽 경계는 가늘게 */
  const edge = both(sg => [ktaper(MS([[0.34, 0.8], [0.7, 0.92], [1.0, 1.04], [1.25, 1.26], [1.37, 1.6], [1.33, 1.94], [1.25, 2.1]], sg), {w0: 2.8, w1: 0.9, cls: 'mk-ink'}),
    ktaper(MS([[1.25, 2.08], [1.34, 2.48], [1.23, 2.85], [0.98, 3.06]], sg), {w0: 2.2, w1: 0.4, cls: 'mk-ink'}),
    ktaper(MS([[0.98, 3.05], [0.8, 2.93], [0.66, 2.63], [0.52, 2.44]], sg), {w0: 0.4, w1: 1.1, cls: 'mk-ink'}),
    ktaper(MS([[0.82, 1.3], [0.9, 1.64], [0.93, 2.02]], sg), {w0: 1.2, w1: 0.4, cls: 'mk-ink'}),
    ktaper(MS([[0.56, 2.98], [0.4, 3.1], [0.24, 3.16], [0.08, 3.12]], sg), {w0: 1.1, w1: 0.4, cls: 'mk-ink'})]);
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
  /* 아래팔 — 팔꿈치에서 안으로 굽어 가슴 앞 두 손(손목까지 소매 · 가늘고 긴 손가락) · 손마다 덩굴 줄기를 쥠 → 두 줄기가 한 번 꼬여 옷단 밑에서 한 나무로 */
  const m0 = X(0, 3.24), arm = sg => { const e = X(sg * 1.12, 2.0), H = X(sg * 0.3, 2.27), dx = H[0] - e[0], dy = H[1] - e[1], Ln = Math.hypot(dx, dy), w = 15, len = Ln - 3;
    const hc = [e[0] + dx / Ln * (len + 5.5), e[1] + dy / Ln * (len + 5.5)];
    return {el: sleeve({x: e[0], y: e[1], ang: -Math.atan2(dx, dy) * 180 / Math.PI, len, w, hand: 'hold', dir: -sg, tone: 'ivory'}), hc}; };
  const AL = arm(-1), AR = arm(1);
  const stems = G('vine', [AL, AR].map((A, i) => { const sg = i ? 1 : -1, p = A.hc;
    return [kvine([p, [p[0] + sg * 2, p[1] + 14], [m0[0] + sg * 6, m0[1] - 12], m0], {w0: 2.6, w1: 4.4, leaves: 2, buds: 0, seed: 21 + i * 4}),
      kvine([p, [p[0] - sg * 1, p[1] - 10], [p[0] + sg * 7, p[1] - 18]], {w0: 2.2, w1: 0.7, leaves: 1, buds: 1, seed: 31 + i * 3})]; }));
  return {el: G('outline', halo, flow, back, torso, belt, upper, drape, folds, edge, fc, collar, front, crown, stems, AL.el, AR.el), m0};
}
/** 땅을 뜻하는 물건 — 날개 단 바퀴(운송) · 돛배(유통 · 바다) · 번개(전력) · 금화(금융) · 잎(바이오) · 그 밖은 별 · 파스텔 칠 · 굵기 변하는 금 윤곽 */
function wingedWheel(x, y, r) {
  let sp = '', fe = '', fe2 = '';
  const edges = [];
  /* 바퀴살 — 굴대 쪽 굵고 테 쪽 가는 쐐기(굵기 변하는 선) */
  for (let i = 0; i < 8; i++) { const a = i * Math.PI / 4 + Math.PI / 8, n = [-Math.sin(a), Math.cos(a)], p = (k, w) => [x + r * k * Math.cos(a) + n[0] * w, y + r * k * Math.sin(a) + n[1] * w];
    sp += `M${pt(p(0.22, r * 0.085))}L${pt(p(0.8, r * 0.03))}L${pt(p(0.8, -r * 0.03))}L${pt(p(0.22, -r * 0.085))}Z`; }
  /* 날개 — 깃털 넷(뒤 깃은 짧게) · 깃마다 가운데 깃대 한 줄(굵게 시작해 가늘게) · 맨 아래 깃 테는 금 */
  for (const sg of [-1, 1]) for (let j = 0; j < 4; j++) {
    const bx = x + sg * r * 0.8, by = y - r * 0.12, a = -(0.32 + j * 0.3), ang = sg > 0 ? a : Math.PI - a, L = r * (1.62 - j * 0.24), W = r * 0.27;
    const ca = Math.cos(ang), sa = Math.sin(ang), side = sg > 0 ? 1 : -1;
    const d = `M${f(bx)} ${f(by)}Q${f(bx + ca * L * 0.5 - sa * W * side)} ${f(by + sa * L * 0.5 + ca * W * side)} ${f(bx + ca * L)} ${f(by + sa * L)}Q${f(bx + ca * L * 0.55 + sa * W * 0.45 * side)} ${f(by + sa * L * 0.55 - ca * W * 0.45 * side)} ${f(bx)} ${f(by)}Z`;
    if (j % 2) fe2 += d; else fe += d;
    edges.push(ktaper([[bx, by], [bx + ca * L * 0.45 - sa * W * 0.12 * side, by + sa * L * 0.45 + ca * W * 0.12 * side], [bx + ca * L * 0.86, by + sa * L * 0.86]], {w0: 1.9, w1: 0.25, cls: 'lw-goldl'}));
    if (j === 3) edges.push(ktaper([[bx, by], [bx + ca * L * 0.5 + sa * W * 0.6 * side, by + sa * L * 0.5 - ca * W * 0.6 * side], [bx + ca * L, by + sa * L]], {w0: 2.6, w1: 0.4, cls: 'lw-goldl'}));
  }
  return [s('path', {d: fe2, class: 'lw-wing2'}), s('path', {d: fe, class: 'lw-wing'}), edges, s('circle', {cx: f(x), cy: f(y), r: f(r * 0.8), class: 'lw-disc'}),
    s('path', {d: circ(x, y, r) + circ(x - r * 0.04, y - r * 0.05, r * 0.8), 'fill-rule': 'evenodd', class: 'lw-gold'}), s('path', {d: sp, class: 'lw-goldl'}), s('circle', {cx: f(x), cy: f(y), r: f(r * 0.24), class: 'lw-gold'}), s('circle', {cx: f(x), cy: f(y), r: f(r * 0.1), class: 'lw-disc'})];
}
function sailShip(x, y, z) {
  const hull = `M${f(x - 1.25 * z)} ${f(y)}C${f(x - 0.9 * z)} ${f(y + 0.55 * z)} ${f(x + 0.9 * z)} ${f(y + 0.55 * z)} ${f(x + 1.3 * z)} ${f(y - 0.05 * z)}Z`;
  const sail = `M${f(x - 0.05 * z)} ${f(y - 1.55 * z)}C${f(x + 0.6 * z)} ${f(y - 1.1 * z)} ${f(x + 0.75 * z)} ${f(y - 0.55 * z)} ${f(x + 0.85 * z)} ${f(y - 0.18 * z)}L${f(x - 0.05 * z)} ${f(y - 0.18 * z)}Z`;
  const sail2 = `M${f(x - 0.18 * z)} ${f(y - 1.25 * z)}C${f(x - 0.55 * z)} ${f(y - 0.9 * z)} ${f(x - 0.75 * z)} ${f(y - 0.5 * z)} ${f(x - 0.85 * z)} ${f(y - 0.18 * z)}L${f(x - 0.18 * z)} ${f(y - 0.18 * z)}Z`;
  /* 소용돌이 물결 — 물마루가 굵게 부풀었다가 끝이 안으로 말림 */
  const wave = (yy, k) => s('path', {d: fillLine(curled([[x - 1.5 * z + k * 0.7 * z, yy + 0.06 * z], [x - 0.95 * z + k * 0.7 * z, yy - 0.02 * z], [x - 0.45 * z + k * 0.7 * z, yy - 0.16 * z], [x - 0.1 * z + k * 0.7 * z, yy - 0.34 * z]], 0.15 * z, 1, 1.05), 0.6, 0.35, 2.6), class: 'lw-wave'});
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
  const n = us.length, R = 34, lo = IX0 + 2, hi = IX1 - 2, m = us.map(u => u.rw);
  const gap = i => Math.max(2 * R + 18, (m[i] + m[i + 1]) / 2 + 5), x0 = lo + us[0].rw / 2, xn = hi - us[n - 1].rw / 2;
  const ok = xs => xs[0] >= x0 - 0.5 && xs[n - 1] <= xn + 0.5 && xs.every((x, i) => !i || x - xs[i - 1] >= gap(i - 1) - 0.5);
  if (pref && pref.length === n && ok(pref)) return pref;
  if (n === 1) return x0 <= CX && CX <= xn ? [CX] : null;
  let G0 = 0; for (let i = 0; i < n - 1; i++) G0 += gap(i);
  const extra = xn - x0 - G0; if (extra < 0) return null;
  const e = extra / (n + 1), xs = [f(x0 + e)]; for (let i = 1; i < n; i++) xs.push(f(xs[i - 1] + gap(i - 1) + e));
  return xs;
}
/** 땅 꽃 이름표(아홉째 판) — 양끝 둥근 판 · 가장자리 꽃잎 술(두 빛) · 두 겹 금테 · 안쪽 옆구리에 덩굴에 맺힌 꽃 · 이름은 반듯하게(기울이지 않음) · 아랫줄에 회사 수와 ✦ 수 */
function rimPts(X0, Y0, X1, Y1, q, step) {
  const o = [], line = (a, b, n) => { const L = Math.hypot(b[0] - a[0], b[1] - a[1]), k = Math.max(1, Math.round(L / step)); for (let i = 0; i < k; i++) o.push([a[0] + (b[0] - a[0]) * i / k, a[1] + (b[1] - a[1]) * i / k, n[0], n[1]]); };
  const arc = (c, a0) => { const k = Math.max(1, Math.round(q * Math.PI / 2 / step)); for (let i = 0; i < k; i++) { const a = (a0 + 90 * i / k) * Math.PI / 180; o.push([c[0] + q * Math.cos(a), c[1] + q * Math.sin(a), Math.cos(a), Math.sin(a)]); } };
  line([X0 + q, Y0], [X1 - q, Y0], [0, -1]); arc([X1 - q, Y0 + q], -90); line([X1, Y0 + q], [X1, Y1 - q], [1, 0]); arc([X1 - q, Y1 - q], 0);
  line([X1 - q, Y1], [X0 + q, Y1], [0, 1]); arc([X0 + q, Y1 - q], 90); line([X0, Y1 - q], [X0, Y0 + q], [-1, 0]); arc([X0 + q, Y0 + q], 180);
  return o;
}
function landTag(u, side) {
  const on = u.star > 0, x0 = u.x - u.w / 2, y0 = u.y, w = u.w, h = u.h, q = Math.min(24, h / 2);
  const rr = i => { const X0 = x0 + i, Y0 = y0 + i, X1 = x0 + w - i, Y1 = y0 + h - i, k = Math.max(2, q - i); return `M${f(X0 + k)} ${f(Y0)}H${f(X1 - k)}A${f(k)} ${f(k)} 0 0 1 ${f(X1)} ${f(Y0 + k)}V${f(Y1 - k)}A${f(k)} ${f(k)} 0 0 1 ${f(X1 - k)} ${f(Y1)}H${f(X0 + k)}A${f(k)} ${f(k)} 0 0 1 ${f(X0)} ${f(Y1 - k)}V${f(Y0 + k)}A${f(k)} ${f(k)} 0 0 1 ${f(X0 + k)} ${f(Y0)}Z`; };
  let pa = '', pb = '';
  rimPts(x0 + 1, y0 + 1, x0 + w - 1, y0 + h - 1, q - 1, 9.5).forEach(([x, y, nx, ny], i) => { const L = i % 2 ? 5.2 : 7, Wd = L * 0.42, tx = x + nx * L, ty = y + ny * L;
    const d = `M${f(x)} ${f(y)}Q${f(x + nx * L * 0.5 - ny * Wd)} ${f(y + ny * L * 0.5 + nx * Wd)} ${f(tx)} ${f(ty)}Q${f(x + nx * L * 0.5 + ny * Wd)} ${f(y + ny * L * 0.5 - nx * Wd)} ${f(x)} ${f(y)}Z`; if (i % 2) pb += d; else pa += d; });
  const two = u.lines.length > 1, by = two ? [y0 + 21, y0 + 41] : [y0 + 24], cy = y0 + h - (two ? 6 : 9);
  const cw = tw(u.n + '곳', 20), sw = tw('✦ ' + u.star, 19), x1 = u.x - (cw + 9 + sw) / 2;
  const fxo = side < 0 ? x0 + w : x0;
  return s('a', {href: '#/m/' + u.id, class: 'la-u', 'aria-label': u.name + ' 땅 · 우량주 ' + u.n + '곳 · 21곳에 든 회사 ' + u.star + '곳'},
    s('g', {'data-mucha': 'lettering', class: 'la-tg ' + (on ? 'la-tg-on' : 'la-tg-off')}, s('path', {d: pa, class: 'la-tfa'}), s('path', {d: pb, class: 'la-tfb'}), s('path', {d: rr(0), class: 'la-tgb'}), s('path', {d: rr(3.2), class: 'la-tgl'}),
      s('path', {d: `M${f(u.x - Math.min(30, w / 2 - 22))} ${f(cy - 21)}H${f(u.x + Math.min(30, w / 2 - 22))}`, class: 'la-tgr'})),
    sway(flower(fxo, f(y0 + h / 2), 8.4, 'lw'), side < 0 ? 0 : 1),
    s('text', {x: f(x1), y: f(cy), 'text-anchor': 'start', class: 'la-tc', text: u.n + '곳'}),
    s('text', {x: f(x1 + cw + 9), y: f(cy), 'text-anchor': 'start', class: 'la-ts ' + (on ? 'la-ts-on' : 'la-ts-off'), text: '✦ ' + u.star}),
    G('lettering', u.lines.map((l, i) => s('text', {x: f(u.x), y: f(by[i]), 'text-anchor': 'middle', class: 'la-rt', 'data-proper': '', text: l}))),
    s('rect', {x: f(x0 - 5), y: f(y0 - 3), width: f(w + 10), height: f(Math.max(64, h + 6)), rx: 18, class: 'la-hit'}));
}
function allPic(d) {
  const lands = [...d.lands].sort((a, b) => b.star - a.star || a.i - b.i); // ✦ 가 많은 땅이 윗자리(먼저 눈에 듦) · 같으면 자료 차례
  const total = lands.reduce((a, u) => a + u.n, 0), title = '우량주 ' + total + '곳 · ' + (KO[lands.length] ?? lands.length) + ' 땅';
  const NFS = 18, S = seats(), TOP = 46, HEM = 562;
  for (const u of lands) { u.lines = split2(u.name, NFS, 96); u.tw = Math.max(...u.lines.map(l => tw(l, NFS))); u.w = f(Math.max(98, u.tw + 18, tw(u.n + '곳', 20) + 9 + tw('✦ ' + u.star, 19) + 18)); u.h = u.lines.length > 1 ? 72 : 60; }
  /* 두 줄기 — 읽는 차례(왼 → 오른 · 위 → 아래)대로 왼쪽 · 오른쪽에 번갈아 · 여인 두 손에서 내려온 덩굴에 맺힘 */
  const cols = [lands.filter((_, i) => i % 2 === 0), lands.filter((_, i) => i % 2 === 1)], Y0 = 186, YM = 556;
  cols.forEach((col, c) => { if (!col.length) return; const wm = Math.max(...col.map(u => u.w)), sum = col.reduce((a, u) => a + u.h, 0), gap = col.length > 1 ? Math.min(14, Math.max(3, (YM - Y0 - sum) / (col.length - 1))) : 0; let y = Y0;
    col.forEach(u => { u.x = c ? f(IX1 - 4 - wm / 2) : f(IX0 + 4 + wm / 2); u.y = f(y); y += u.h + gap; }); col.edge = c ? Math.min(...col.map(u => u.x - u.w / 2)) : Math.max(...col.map(u => u.x + u.w / 2)); });
  for (const u of lands) S.add(u.x - u.w / 2 - 6, u.y - 6, u.w + 12, u.h + 12);
  const legend = '✦ 는 21곳에 든 회사 수', legW = f(tw(legend, NFS) + 30);
  S.add(CX - legW / 2 + 8, IB + 4, legW - 16, 24);
  const F = frame(title, 20, S), cid = uid('w');
  /* 여인 — 가운데 서서 두 팔을 들어 벌림(손은 첫 이름표 위 빈 자리) · 엉덩이는 왼쪽으로 · 치맛단은 발목까지 덮고 바닥에 퍼져 말림 */
  const HND = [[CX - 90, 128], [CX + 90, 128]];
  const Lw = lady({cx: CX, top: TOP, hem: HEM, pose: 'open', hands: HND, cloth: 'sage', sash: 'gold', arm: 'cream', tone: 5, view: 'three', fdir: 1, seed: 4, sx: -6, hw: 0.45});
  const HY = Lw.y.fy - 2;
  /* 아치 안 옅은 동심원 후광(여인 후광에서 퍼져 나감) */
  const inWin = (x, y) => x > IX0 + 2 && x < IX1 - 2 && y < IB - 2 && y > archY(x) + 2;
  const conc = G('halo', [84, 112, 144, 180, 222, 268, 320, 376].map((r, i) => { let dd = '', on = false;
    for (let k = 0; k <= 240; k++) { const a = k * Math.PI / 120, x = CX + r * Math.cos(a), y = HY + r * Math.sin(a); if (inWin(x, y)) { dd += (on ? 'L' : 'M') + f(x) + ' ' + f(y); on = true; } else on = false; }
    return dd ? s('path', {d: dd, class: 'la-cc' + (i % 2 ? ' la-cc2' : '')}) : null; }));
  /* 덩굴 — 두 손에서 갈라져(위로 새순 · 아래로 큰 줄기) 이름표 줄 안쪽 틈을 따라 내려가 치맛단 곁에서 말림 · 이름표는 그 덩굴에 맺힌 꽃 */
  const vines = [-1, 1].map((sg, k) => { const H0 = Lw.hands[k], col = cols[k]; if (!col.length) return null; const gx = col.edge + (sg < 0 ? 7 : -7), y1 = Math.max(...col.map(u => u.y + u.h));
    return [kvine([H0, [H0[0] + sg * 2, H0[1] + 28], [gx, Y0 + 12], [gx - sg * 3, (Y0 + y1) / 2], [gx + sg * 2, y1 - 30], [gx + sg * 16, Math.min(IB - 10, y1 + 10)]], {w0: 4.6, w1: 1.2, leaves: 12, buds: 3, seed: 5 + k * 6}),
      kvine([[H0[0], H0[1] + 4], [H0[0] - sg * 8, H0[1] - 16], [H0[0] + sg * 4, H0[1] - 34], [H0[0] - sg * 8, H0[1] - 50]], {w0: 2.8, w1: 0.8, leaves: 3, buds: 1, seed: 17 + k * 4})]; });
  const leg = G('lettering', s('text', {x: CX, y: IB + 23, 'text-anchor': 'middle', class: 'la-legt'}, s('tspan', {class: 'la-legs', text: '✦'}), s('tspan', {text: ' 는 21곳에 든 회사 수'})));
  const clip = s('defs', {}, s('clipPath', {id: cid}, s('path', {d: archIn})));
  const units = lands.map((u, i) => landTag(u, i % 2 ? 1 : -1));
  return s('svg', {class: 'su-svg su-art4 su-land-art la-all', viewBox: `0 0 ${W} ${H}`, role: 'group', preserveAspectRatio: 'xMidYMid meet',
    'aria-label': '땅 지도 · 우량주 ' + total + '곳을 ' + lands.length + '땅으로 · ✦ 는 21곳에 든 회사 수'},
  backing(), F.defs, clip, F.pastel, conc, F.whip, F.mosaic, F.outline, F.arch,
  s('g', {'clip-path': 'url(#' + cid + ')'}, Lw.halo, Lw.back, Lw.body, G('vine', vines), Lw.fore), leg, s('g', {class: 'la-units'}, units));
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
  const S = seats(), tFs = tw(d.name, 20) <= 250 ? 20 : 19, LCY = 69, LR = 62; // 아홉째 판 — 메달 지움 · LCY = 큰 여인 후광 가운데
  S.add(CX - LR - 6, LCY - LR - 6, 2 * LR + 12, 2 * LR + 12);
  /* ✦ 회사 — 기둥을 나눠 쓰는 아치 회랑(셋씩 한 줄 · 차례 그대로) · 칸 폭은 이름 폭 + 안쪽 여백(글이 테에 닿지 않게) · 이름은 낱말 자리에서 두 줄 · 줄 간격 82(누르는 자리 높이 60 넘게) */
  const TFS = 18, PH = 72, TP = 82, CW = 5, tags = stars.map(c => { const lines = nameLines(c.name, TFS, 86); return {...c, lines, w: f(Math.max(84, Math.max(...lines.map(l => tw(l, TFS))) + 20))}; }), trows = [];
  for (let i = 0; i < tags.length; i += 3) { const items = tags.slice(i, i + 3); trows.push({items, w: items.reduce((a, t) => a + t.w, 0) + (items.length + 1) * CW}); }
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
  /* 땅을 뜻하는 물건 — 여인 후광 테 양옆에 붙은 작은 모자이크 원 안 */
  const ER = 30, EM = [[CX - LR - ER + 3, LCY + 22], [CX + LR + ER - 3, LCY + 22]];
  for (const [x, y] of EM) S.add(x - ER - 2, y - ER - 2, 2 * ER + 4, 2 * ER + 4);
  /* 아래 — ✦ 회사 아치 회랑 또는 「없어요」 판 */
  const tagTop = f(barsEnd + 4), tagRows = trows.map((r, i) => { const py = tagTop + 18 + i * TP; let x = CX - r.w / 2 + CW; const items = r.items.map(t => { const it = {...t, x, py}; x += t.w + CW; S.add(it.x - CW, py - 4, t.w + 2 * CW, PH + 6); return it; }); return {py, items, x0: f(CX - r.w / 2), x1: f(CX + r.w / 2)}; });
  const noteT = '이 땅에는 이번 21곳이 없어요', noteW = f(tw(noteT, 19) + 30);
  if (!trows.length) S.add(CX - noteW / 2, tagTop, noteW, 52);
  const F = frame(d.name, tFs, S), cid = uid('w');
  /* 덩굴 — 줄기 아래 끝에서 갈라져 아치 판 꼭대기마다 닿음(판 뒤로 지남) */
  const vines = [], fork = [axis, f(barsEnd + 8)];
  tagRows.forEach((r, ri) => r.items.forEach((t, j) => { const top = [t.x + t.w / 2, t.py - 2], mid = [(fork[0] + top[0]) / 2 + (j - 1) * 6, Math.min(fork[1], top[1]) - 6 + ri * 10]; vines.push(kvine([fork, mid, top], {w0: 3, w1: 1.1, leaves: 2, buds: (j + ri) % 2, seed: 11 + ri * 7 + j * 3})); }));
  const stars2 = sky(S, [[318, 160, 'small'], [72, 160, 'small']]);
  /* 큰 여인(아홉째 판) — 가운데 서서 두 손으로 줄기를 위아래로 쥠 · 허리띠는 막대 줄 사이 빈 틈에(값 칸이 허리선을 가리지 않게) · 얼굴 · 손은 첫 막대 줄 위 */
  let waY = null, best = 1e9;
  for (let i = 0; i < N - 1; i++) { const a = rows[i], b = rows[i + 1], lo = Math.max(a.bc + bh / 2, a.vb + 0.3 * nfs, a.nb + 0.3 * nfs), hi = Math.min(b.bt, b.nb - 0.8 * nfs, b.vb - 0.8 * nfs), c = (lo + hi) / 2;
    if (hi - lo >= 7 && c > 190 && c < 300 && Math.abs(c - 232) < best) { best = Math.abs(c - 232); waY = f(c); } }
  const HX = f(Math.max(CX - 26, Math.min(CX + 26, axis))), sd = HX >= CX ? 1 : -1;
  const Lw = lady({cx: CX, top: 34, hem: 572, pose: 'hold', hx: HX, cloth: 'sky', sash: 'rose', arm: 'ivory', tone: 2, view: 'profile', fdir: -1, seed: 9, sx: 10, wa: waY, hw: 0.25, hend: (waY ?? 230) - 8});
  const hU = Lw.hands[1], hD = Lw.hands[0], stemBot = f(trows.length ? barsEnd + 8 : barsEnd + 2);
  /* 줄기 — 맨 아래에서 굵게 올라와 첫 막대 줄 위에서 여인 두 손으로 들어가 손 위에서 꽃 한 송이로 끝남(줄기가 멀면 막대 줄 위로 휘어 들어감) */
  const SP = Math.abs(axis - HX) < 3 ? [[axis, stemBot], [axis, (stemBot + Y0) / 2], [axis, Y0 - 8], [HX, hD[1]], [HX, hU[1] - 8], [HX + sd * 9, hU[1] - 28]]
    : [[axis, stemBot], [axis, (stemBot + Y0) / 2], [axis, Y0 - 2], [(axis + HX) / 2, Y0 - 9], [HX, hD[1] + 2], [HX, hU[1] - 8], [HX + sd * 9, hU[1] - 28]];
  const top2 = [HX + sd * 9, hU[1] - 31];
  const stem = G('vine', ktaper(SP, {w0: 5.6, w1: 1.4, cls: 'mk-vstem'}), leaf(top2[0], top2[1] + 8, sd > 0 ? -20 : 200, 10, 'lw-leaf'), leaf(top2[0], top2[1] + 10, sd > 0 ? 160 : 20, 9, 'lw-leaf'), sway(flower(top2[0], top2[1], 7.2, 'lw'), 1), axLeaves);
  /* 값 꽃대 — 모양은 그대로(같은 값 → 같은 길이 · 같은 차례) · 오름 = 금 꽃대 · 내림 = 붉은 꽃대 · 끝에 잎 · 잎 너머에 값 */
  const bars = s('g', {class: 'la-bars'},
    rows.map((r, i) => s('g', {class: 'la-row', 'data-v': f(r.v), 'data-len': f2(r.len)},
      leafBar({x: axis, y: f(r.bc), len: f2(r.len), dir: r.v < 0 ? 'left' : 'right', w: Math.min(22, bh + 4), tone: r.v < 0 ? 'red' : 'gold'}), tipBud(r, axis, tip, i),
      s('text', {x: f(r.nx), y: f(r.nb), 'text-anchor': r.nLeft ? 'end' : 'start', class: 'la-t la-ind la-f' + nfs, 'data-proper': ''}, r.g.star ? s('tspan', {class: 'la-gold', text: '✦ '}) : null, s('tspan', {text: r.g.name})),
      s('text', {x: f(r.vx), y: f(r.vb), 'text-anchor': r.v < 0 ? 'end' : 'start', class: 'la-t la-val la-f' + nfs + (r.v > 0 ? ' la-val-up' : r.v < 0 ? ' la-val-dn' : ''), text: sgnP(r.g.ch20)}))));
  /* 아치 회랑 — 칸 머리 반원 · 칸 사이 기둥 하나를 두 칸이 나눠 씀(기둥머리 · 받침 금) · 칸 바탕 분홍 · 연두 · 크림 번갈아 · 칸 꼭대기 작은 ✦ 별 · 기둥 위 금 점 · 위 가는 처마 금선 */
  const AR = 17, star4 = (x, y, r) => `M${f(x)} ${f(y - r)}Q${f(x)} ${f(y)} ${f(x + r * 0.8)} ${f(y)}Q${f(x)} ${f(y)} ${f(x)} ${f(y + r)}Q${f(x)} ${f(y)} ${f(x - r * 0.8)} ${f(y)}Q${f(x)} ${f(y)} ${f(x)} ${f(y - r)}Z`;
  const arcades = tagRows.map((r, ri) => { const y = r.py, cols = [r.x0, ...r.items.map(t => t.x + t.w)];
    return G('arch', s('rect', {x: f(r.x0 - 2), y: f(y - 3.4), width: f(r.x1 - r.x0 + 4), height: 2.4, rx: 1.2, class: 'la-cap'}),
      cols.map(x => [s('rect', {x: f(x), y: f(y + AR - 1), width: CW, height: f(PH - AR + 1), class: 'la-col'}), s('rect', {x: f(x - 1.8), y: f(y + AR - 4), width: f(CW + 3.6), height: 3.6, rx: 1, class: 'la-cap'}),
        s('rect', {x: f(x - 1.8), y: f(y + PH - 3), width: f(CW + 3.6), height: 3, rx: 1, class: 'la-cap'}), s('circle', {cx: f(x + CW / 2), cy: f(y + 6), r: 2.1, class: 'la-cap'})]),
      r.items.map((t, j) => { const x0 = t.x, x1 = t.x + t.w, bay = i => `M${f(x0 + i)} ${f(y + PH - i)}V${f(y + AR)}A${f(t.w / 2 - i)} ${f(AR - i * 0.7)} 0 0 1 ${f(x1 - i)} ${f(y + AR)}V${f(y + PH - i)}Z`;
        return [s('path', {d: bay(0), class: 'la-bay la-bay' + ((ri * 3 + j + ri) % 3)}), s('path', {d: bay(3), class: 'la-bayl'}), s('path', {d: star4(x0 + t.w / 2, y + 10.5, 6), class: 'la-bays'})]; })); });
  const tagEls = tagRows.flatMap(r => r.items.map(t => { const cx = t.x + t.w / 2, two = t.lines.length > 1, by = two ? [t.py + 39, t.py + 60] : [t.py + 51];
    return s('a', {href: '#/c/' + t.code, class: 'la-tag', 'aria-label': t.name + ' · 21곳에 든 회사 · ' + t.ind + ' 업종'},
      t.lines.map((l, i) => s('text', {x: f(cx), y: f(by[i]), 'text-anchor': 'middle', class: 'la-bay-t', 'data-proper': '', text: l})),
      s('rect', {x: f(t.x - 2), y: f(t.py - 4), width: f(t.w + 4), height: PH + 8, rx: 16, class: 'la-hit'})); }));
  const note = trows.length ? null : [plaque({x: CX - noteW / 2, y: tagTop + 2, w: noteW, h: 48, tone: 'cream', knots: false}), s('text', {x: CX, y: f(tagTop + 38), 'text-anchor': 'middle', class: 'la-rt la-f19', text: noteT})];
  /* 작은 모자이크 원 — 크림 원판 · 금 · 잎 · 살구 점 고리 · 두 겹 금테 · 안에 물건(작게) */
  const emDisc = ([x, y], kids, k) => { let q = ['', '', '']; for (let i = 0; i < 24; i++) { const a = i * Math.PI / 12, px = x + (ER - 4.4) * Math.cos(a), py = y + (ER - 4.4) * Math.sin(a); q[i % 3] += i % 2 ? circ(px, py, 1.3) : `M${f(px)} ${f(py - 1.9)}L${f(px + 1.9)} ${f(py)}L${f(px)} ${f(py + 1.9)}L${f(px - 1.9)} ${f(py)}Z`; }
    return s('g', {class: 'la-emb', 'data-mucha': 'mosaic'}, s('circle', {cx: f(x), cy: f(y), r: ER, class: 'lw-disc'}), s('circle', {cx: f(x), cy: f(y), r: ER - 4.4, class: 'lw-mob'}),
      s('path', {d: q[0], class: 'lw-m1'}), s('path', {d: q[1], class: 'lw-m2'}), s('path', {d: q[2], class: 'lw-m3'}), s('circle', {cx: f(x), cy: f(y), r: ER - 7.8, class: 'lw-rim2'}),
      s('path', {d: circ(x, y, ER) + circ(x, y, ER - 1.9), 'fill-rule': 'evenodd', class: 'lw-gold'}), s('g', {transform: `translate(${f(x)} ${f(y)}) scale(${k}) translate(${f(-x)} ${f(-y)})`}, kids)); };
  const kOf = id => (String(id) === 'hold' || String(id) === 'heavy' ? [0.5, 0.52] : [0.6, 0.6]);
  const em = G('outline', emDisc(EM[0], emblem(d.id, ...EM[0]), kOf(d.id)[0]), emDisc(EM[1], emblem2(d.id, ...EM[1]), kOf(d.id)[1]));
  /* 빈 크림 바탕 — 여인 메달에서 퍼지는 옅은 햇살 · 동심원(값 · 이름을 가리지 않게 아주 옅게) */
  const inWin = (x, y) => x > IX0 + 2 && x < IX1 - 2 && y < IB - 2 && y > archY(x) + 2;
  const sun = s('g', {'clip-path': 'url(#' + cid + ')', 'data-mucha': 'halo'}, s('path', {d: Array.from({length: 36}, (_, i) => { const a = i * Math.PI / 18 + 0.04, w0 = 0.004, w1 = i % 2 ? 0.016 : 0.026, r0 = LR + 6, ca = Math.cos(a), sa = Math.sin(a), r1 = Math.min(ca > 0.01 ? (IX1 - 4 - CX) / ca : ca < -0.01 ? (IX0 + 4 - CX) / ca : 999, sa > 0.01 ? (IB - 4 - LCY) / sa : sa < -0.01 ? (LCY - 30) / -sa : 999), P =(r, aa) => pt([CX + r * Math.cos(aa), LCY + r * Math.sin(aa)]);
    return `M${P(r0, a - w0)}L${P(r1, a - w1)}L${P(r1, a + w1)}L${P(r0, a + w0)}Z`; }).join(''), class: 'la-sun'}),
  [LR + 16, LR + 44, LR + 78, LR + 118, LR + 164, LR + 216, LR + 274, LR + 338, LR + 408].map((r, i) => { let dd = '', on = false;
    for (let k = 0; k <= 240; k++) { const a = k * Math.PI / 120, x = CX + r * Math.cos(a), y = LCY + r * Math.sin(a); if (inWin(x, y)) { dd += (on ? 'L' : 'M') + f(x) + ' ' + f(y); on = true; } else on = false; }
    return dd ? s('path', {d: dd, class: 'la-cc3' + (i % 2 ? ' la-cc2' : '')}) : null; }));
  const calmEl = calm(S, f(barsEnd + 12), IB - 12);
  return s('svg', {class: 'su-svg su-art4 su-land-art la-one', viewBox: `0 0 ${W} ${H}`, role: 'group', preserveAspectRatio: 'xMidYMid meet',
    'aria-label': d.name + ' 땅 · 업종 ' + N + '개 · 20거래일 동안 움직인 만큼 · 21곳에 든 회사 ' + stars.length + '곳'},
  backing(), F.defs, s('defs', {}, s('clipPath', {id: cid}, s('path', {d: archIn}))), F.pastel, sun, calmEl, F.whip, F.mosaic, F.outline, F.arch, stars2,
  s('g', {'clip-path': 'url(#' + cid + ')'}, Lw.halo, Lw.back), em, s('g', {'clip-path': 'url(#' + cid + ')'}, Lw.body, G('vine', vines)), stem, Lw.fore, bars, arcades, G('lettering', note, tagEls));
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
