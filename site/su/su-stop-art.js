/* 수르 — 「멈춤」 탭 큰 그림 둘(주문 1023 「머스크 판 4」 · 일꾼 su-stop-art · 심사 1회 「아니오」 뒤 여인을 새로 그림 — judge-r1.md)
   ① 「왜 사?」(#/q) — 무하 「달과 별」(1902) · 「달」처럼 보름달 후광 아래 선 여인 · S자(고개는 오른쪽 · 가슴은 왼쪽 · 골반은 오른쪽 · 발은 왼쪽)
      한 손은 모래시계를 받치고 한 손은 어깨 자락을 쥠 · 구릿빛 머리칼이 후광을 가로질러 소용돌이침
      열한 질문(WHY_QS 글자 그대로)은 네 묶음(WHY_GROUPS) 별자리 — 몸 둘레 바깥 네 귀퉁이에 금테 리본 글씨로(몸 · 머리칼 위에는 하나도 없음)
      답한 별은 금빛(opt.done) · 지금 별은 살구빛(opt.cur · 1 ~ 11) · 모래시계 모래도 답한 만큼 내려감
   ② 「내 매매일지」(#/j) — 무하 「장식 인물」(1905)처럼 둥근 틀에 앉아 무릎 위 공책에 깃펜으로 적는 다른 여인(꿀빛 머리 · 장밋빛 옷)
      한 손은 깃펜 · 한 손은 어깨에서 머리 타래를 쥠 · 이 휴대폰의 「왜 사?」 기록(readWhy() 가운데 fullWhy) 수 · 날짜 · 판정 · 한 달 뒤 칸(달이 차오름)
      기록이 없으면 빈 칸 셋(옅은 금테 꽃 메달)과 「아직 기록이 없어요」
   바깥 선은 채운 초승달 꼴(빛 반대쪽이 굵고 빛 쪽이 가늚) · 머리칼 · 주름은 굵게 시작해 가늘게 빠지는 채운 모양
   그림은 createElementNS · setAttribute 로만(su-fig.js 의 s) · 여인 · 이름표 색은 고정(어두운 판에서도 크림 · 상아) · 밤하늘만 어두워짐
   글씨는 처음부터 진하게(opacity 1) · 움직임은 별 · 모래 · 머리칼에만(transform)
   셋째 판(r3-brief.md · judge-r2.md) — 얼굴 · 머리 올 다발 · 두루마리 · 손은 공용 부품(su-mucha-kit.js) · 그림 안은 아치 바깥 테로 잘라 틀 밖 선 0
   ① 옆으로 뻗던 더듬이 머리 → 후광 안에서 말리고 어깨 · 등 뒤로 흐르는 올 다발 · S자 몸 · 둥근 주름 열하나 · 허리에 감겨 나부끼는 초록 띠 · 발 둘레에 고인 치맛단
     금빛 · 복숭아빛 노을 띠와 모자이크 줄 · 물음 띠 열하나 = 크림 · 금 두루마리(몸에서 떼어 둠) · 번호는 작은 금 메달
   ② 한 벌 장밋빛 옷(손목까지) · 어깨 위 머리를 가볍게 대는 손 · 바닥까지 흐르는 주름 치마 · 돌 의자와 방석 · 무릎 위 책 · 후광을 감싸는 금빛 머리채
     둥근 틀 안 작은 별 · 꽃 무늬 띠 · 빈 칸에 가는 금 안쪽 아치 테와 잎 */
import {WHY_QS, WHY_GROUPS, WHY_V, readWhy, fullWhy, seoulDay} from '/su/su-why.js';
import {s} from '/su/su-fig.js';
import {taper, strands, face as kface, hair as khair, sleeve, ribbon, vine as kvine} from './su-mucha-kit.js';

export const CSS = '/su/su-stop-art.css';

const W = 390, H = 620, NEED = '확인 필요';
const DAY = 864e5, LATER = 20; // 한 달 = 장 스무 번 또는 달력 서른 날(su-why.js 와 같은 셈)
let SEQ = 0;
const f1 = v => Math.round(v * 10) / 10;

/* ── 자료 받기 ── */
const okD = x => typeof x === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(x);
const VSHORT = {go: ['좋아', '●', 'g'], wait: ['반만', '▲', 'y'], rest: ['쉬어', '■', 'r']};

/** which = 'quiz' | 'journal' */
export async function load(get, which) {
  if (which !== 'journal') return {kind: 'quiz', qs: [...WHY_QS], groups: WHY_GROUPS.map(([n, qs]) => [n, [...qs]])};
  const raw = readWhy(), can = raw != null, full = (raw ?? []).filter(fullWhy);
  let DD = null;
  try { const days = typeof get === 'function' && full.length ? await get('/atlas/data/days.json') : null; DD = Array.isArray(days?.dates) && days.dates.length ? days.dates : null; } catch { DD = null; }
  const now = Date.now();
  const recs = full.map(r => {
    const at = Date.parse(r.at), atOk = Number.isFinite(at), day = atOk ? seoulDay(at) : null;
    let e = null; // 스무 번째 장 날(su-why.js windowOfRec 와 같은 셈)
    if (DD) {
      const t0 = okD(r.day) ? r.day : okD(r.asOf) ? r.asOf : day;
      if (t0 && t0 <= DD[DD.length - 1]) { let k = -1; for (let j = DD.length - 1; j >= 0; j--) if (DD[j] <= t0) { k = j; break; } if (k >= 0) e = DD[k + LATER] ?? null; }
    }
    const cal = atOk && (now - at) / DAY >= 30, due = !!e || cal;
    const kept = r.kept?.a === 'yes' ? 'yes' : r.kept?.a === 'no' ? 'no' : null;
    const v = VSHORT[WHY_V[r.verdict]] ?? null;
    return {day, due, kept, frac: due ? 1 : atOk ? Math.max(0, Math.min(1, (now - at) / (30 * DAY))) : 0,
      dueDay: atOk ? seoulDay(at + 30 * DAY) : null, v: v ? {name: v[0], shape: v[1], tone: v[2]} : null};
  });
  return {kind: 'journal', can, n: full.length, recs};
}

/* ── 선 도구 — 굵기가 변하는 선(채운 모양) ── */
/** 'M x y C … C …' (절대 좌표 · M 과 C 만) → 점 줄 */
function bez(d, N = 10) {
  const n = String(d).match(/-?\d+(?:\.\d+)?/g).map(Number), P = [[n[0], n[1]]];
  for (let i = 2; i + 5 < n.length; i += 6) {
    const [x0, y0] = P[P.length - 1];
    for (let k = 1; k <= N; k++) {
      const t = k / N, u = 1 - t, a = u * u * u, b = 3 * u * u * t, c = 3 * u * t * t, e = t * t * t;
      P.push([a * x0 + b * n[i] + c * n[i + 2] + e * n[i + 4], a * y0 + b * n[i + 1] + c * n[i + 3] + e * n[i + 5]]);
    }
  }
  return P;
}
const fp = q => f1(q[0]) + ' ' + f1(q[1]);
const SHADE = [0.5, 0.866]; // 빛은 왼쪽 위 → 오른쪽 아래 선이 굵음
/** 닫힌 모양의 바깥 선 — 채운 초승달 꼴 고리(빛 반대쪽 굵게 · 빛 쪽 가늘게) */
function ring(d, wmax, wmin = 0.45) {
  const P = bez(d, 8);
  if (P.length > 2 && Math.hypot(P[0][0] - P[P.length - 1][0], P[0][1] - P[P.length - 1][1]) < 0.05) P.pop();
  let A = 0; for (let i = 0; i < P.length; i++) { const p = P[i], q = P[(i + 1) % P.length]; A += p[0] * q[1] - q[0] * p[1]; }
  const sg = A > 0 ? 1 : -1, O = [], I = [];
  for (let i = 0; i < P.length; i++) {
    const a = P[(i - 1 + P.length) % P.length], b = P[(i + 1) % P.length];
    let tx = b[0] - a[0], ty = b[1] - a[1]; const m = Math.hypot(tx, ty) || 1; tx /= m; ty /= m;
    const nx = ty * sg, ny = -tx * sg, k = (1 + nx * SHADE[0] + ny * SHADE[1]) / 2, w = (wmin + (wmax - wmin) * k * k) / 2;
    O.push([P[i][0] + nx * w, P[i][1] + ny * w]); I.push([P[i][0] - nx * w, P[i][1] - ny * w]);
  }
  return 'M ' + O.map(fp).join(' L ') + ' Z M ' + I.map(fp).join(' L ') + ' Z';
}
/** 열린 선 — 굵게 시작해 가늘게(taper) · 또는 가운데가 부푼 붓 선(swell) */
function brush(d, w0, w1 = 0.3, swell = false) {
  const P = bez(d, 10), L = [0];
  for (let i = 1; i < P.length; i++) L.push(L[i - 1] + Math.hypot(P[i][0] - P[i - 1][0], P[i][1] - P[i - 1][1]));
  const T = L[L.length - 1] || 1, A = [], B = [];
  P.forEach((p, i) => {
    const a = P[Math.max(0, i - 1)], b = P[Math.min(P.length - 1, i + 1)];
    let tx = b[0] - a[0], ty = b[1] - a[1]; const m = Math.hypot(tx, ty) || 1; tx /= m; ty /= m;
    const t = L[i] / T, w = (swell ? w1 + (w0 - w1) * Math.sin(Math.PI * t) : (w1 + (w0 - w1) * Math.pow(1 - t, 1.15)) * Math.min(1, 0.4 + t * 9)) / 2;
    A.push([p[0] - ty * w, p[1] + tx * w]); B.push([p[0] + ty * w, p[1] - tx * w]);
  });
  return 'M ' + A.map(fp).join(' L ') + ' L ' + B.reverse().map(fp).join(' L ') + ' Z';
}
/** 몸 조각 — 채움 + 초승달 꼴 바깥 선 */
const part = (d, cls, wmax = 3.4, wmin = 0.5) => [s('path', {d, class: cls}), s('path', {d: ring(d, wmax, wmin), class: 'ss-ink', 'fill-rule': 'evenodd'})];
const line = (d, w, cls = 'ss-ink', w1 = 0.3, sw = false) => s('path', {d: brush(d, w, w1, sw), class: cls});

/* ── 작은 도구 ── */
const tw = (t, px) => { let w = 0; for (const ch of String(t)) w += /[가-힣]/.test(ch) ? 0.96 : ch === ' ' ? 0.3 : /[0-9]/.test(ch) ? 0.6 : ch === '?' ? 0.56 : 0.62; return w * px; };
const dKo = d => { const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(d ?? '')); return m ? `${+m[2]}월 ${+m[3]}일` : NEED; };
const star5 = (cx, cy, R, r) => { let d = ''; for (let k = 0; k < 10; k++) { const a = -Math.PI / 2 + k * Math.PI / 5, q = k % 2 ? r : R; d += (k ? 'L' : 'M') + f1(cx + q * Math.cos(a)) + ' ' + f1(cy + q * Math.sin(a)) + ' '; } return d + 'Z'; };
const spark = (cx, cy, R) => `M ${cx} ${f1(cy - R)} Q ${cx} ${cy} ${f1(cx + R)} ${cy} Q ${cx} ${cy} ${cx} ${f1(cy + R)} Q ${cx} ${cy} ${f1(cx - R)} ${cy} Q ${cx} ${cy} ${cx} ${f1(cy - R)} Z`;
/** 초승달 — 큰 원에서 옆으로 민 원을 뺀 꼴 */
function crescent(cx, cy, r, dx, dy, r2) {
  const d = Math.hypot(dx, dy), a = (r * r - r2 * r2 + d * d) / (2 * d), hh = Math.sqrt(Math.max(0, r * r - a * a));
  const bx = cx + a * dx / d, by = cy + a * dy / d, px = -dy / d, py = dx / d;
  const P1 = [f1(bx + hh * px), f1(by + hh * py)], P2 = [f1(bx - hh * px), f1(by - hh * py)];
  return `M ${P1[0]} ${P1[1]} A ${r} ${r} 0 1 1 ${P2[0]} ${P2[1]} A ${r2} ${r2} 0 0 0 ${P1[0]} ${P1[1]} Z`;
}
/** 달의 찬 만큼(0 = 그믐 · 1 = 보름) — 오른쪽부터 차오름 */
function moonLit(cx, cy, r, f) {
  if (f >= 0.995) return `M ${cx} ${cy - r} A ${r} ${r} 0 1 1 ${cx} ${cy + r} A ${r} ${r} 0 1 1 ${cx} ${cy - r} Z`;
  const rx = f1(r * Math.abs(1 - 2 * f));
  return `M ${cx} ${cy - r} A ${r} ${r} 0 0 1 ${cx} ${cy + r} A ${rx} ${r} 0 0 ${f < 0.5 ? 0 : 1} ${cx} ${cy - r} Z`;
}
const flower = (cx, cy, r, cls = 'ss-fl') => s('g', {class: cls},
  [0, 1, 2, 3, 4].map(k => { const a = -Math.PI / 2 + k * 2 * Math.PI / 5; return s('circle', {cx: f1(cx + r * 0.62 * Math.cos(a)), cy: f1(cy + r * 0.62 * Math.sin(a)), r: f1(r * 0.48), class: 'ss-pet'}); }),
  s('circle', {cx, cy, r: f1(r * 0.34), class: 'ss-flc'}));
const leaf = (x, y, deg, len = 16) => s('path', {d: `M 0 0 C ${f1(len * 0.35)} ${f1(-len * 0.32)} ${f1(len * 0.8)} ${f1(-len * 0.3)} ${len} 0 C ${f1(len * 0.8)} ${f1(len * 0.3)} ${f1(len * 0.35)} ${f1(len * 0.32)} 0 0 Z`, transform: `translate(${x} ${y}) rotate(${deg})`, class: 'ss-leaf'});

/* ── 틀 — 말굽 아치(arch) · 밤하늘 · 모자이크 띠(mosaic) ── */
const OUT = 'M 8 614 L 8 124 A 187 116 0 0 1 382 124 L 382 614 Z';
const INN = 'M 20 598 L 20 126 A 175 104 0 0 1 370 126 L 370 598 Z';
function defs(id) {
  return s('defs', {},
    s('linearGradient', {id: id + 'sky', x1: 0, y1: 0, x2: 0, y2: 1}, s('stop', {offset: 0, class: 'ss-sk1'}), s('stop', {offset: 0.62, class: 'ss-sk2'}), s('stop', {offset: 1, class: 'ss-sk3'})),
    s('linearGradient', {id: id + 'au', x1: 0, y1: 0, x2: 1, y2: 0}, s('stop', {offset: 0, class: 'ss-au1'}), s('stop', {offset: 0.5, class: 'ss-au2'}), s('stop', {offset: 1, class: 'ss-au1'})),
    s('radialGradient', {id: id + 'moon', cx: 0.5, cy: 0.5, r: 0.5}, s('stop', {offset: 0, class: 'ss-mo1'}), s('stop', {offset: 0.72, class: 'ss-mo2'}), s('stop', {offset: 1, class: 'ss-mo3'})),
    s('radialGradient', {id: id + 'med', cx: 0.5, cy: 0.42, r: 0.6}, s('stop', {offset: 0, class: 'ss-me1'}), s('stop', {offset: 1, class: 'ss-me2'})),
    s('path', {id: id + 'ap', d: 'M 34 132 A 161 92 0 0 1 356 132'}),
    s('clipPath', {id: id + 'clip'}, s('path', {d: OUT}))); // 그림 안은 아치 바깥 테까지만(틀 밖으로 나가는 선 0)
}
/** 아치 틀 — 금빛 띠 · 점 · 안쪽 금선이 어깨(아치가 기둥과 만나는 곳)에서 안으로 한 번 반 소용돌이로 풀림 · low = 바닥 귀퉁이에서도(일곱째 판) */
function frame(id, low = false) {
  const dots = [];
  for (let k = 1; k < 26; k++) { const a = Math.PI + k * Math.PI / 26; dots.push(s('circle', {cx: f1(195 + 181 * Math.cos(a)), cy: f1(124 + 110 * Math.sin(a)), r: k % 2 ? 1.9 : 1.2, class: 'ss-adot'})); }
  for (let y = 142; y < 596; y += 22) dots.push(s('circle', {cx: 14, cy: y, r: 1.6, class: 'ss-adot'}), s('circle', {cx: 376, cy: y, r: 1.6, class: 'ss-adot'}));
  const curls = s('g', {class: 'ss-fcurl'}, swirl(32, 110, 7.5, Math.PI * 0.75, 2.2, 1, 2.6, 'ss-gold', [21, 124]), swirl(358, 110, 7.5, Math.PI * 0.25, 2.2, -1, 2.6, 'ss-gold', [369, 124]),
    low ? [swirl(31, 586, 7, Math.PI * 0.75, 2.1, 1, 2.4, 'ss-gold', [21, 597]), swirl(359, 586, 7, Math.PI * 0.25, 2.1, -1, 2.4, 'ss-gold', [369, 597])] : null);
  return s('g', {'data-mucha': 'arch', class: 'ss-arch'},
    s('path', {d: OUT + ' ' + INN, 'fill-rule': 'evenodd', fill: `url(#${id}au)`, class: 'ss-band'}),
    s('path', {d: OUT, class: 'ss-edge'}), s('path', {d: INN, class: 'ss-edge2'}), dots, curls);
}
const sky = id => s('path', {d: INN, fill: `url(#${id}sky)`, class: 'ss-sky'});
function mosaic() {
  const t = [];
  for (let i = 0; i < 31; i++) {
    const x = 14 + i * 12, y = 606, c = ['ss-m1', 'ss-m2', 'ss-m3'][i % 3];
    t.push(i % 2 ? s('circle', {cx: x, cy: y, r: 3.6, class: c}) : s('rect', {x: x - 3.6, y: y - 3.6, width: 7.2, height: 7.2, rx: 1, class: c, transform: `rotate(45 ${x} ${y})`}));
  }
  return s('g', {'data-mucha': 'mosaic', class: 'ss-mosaic'}, s('rect', {x: 8, y: 598, width: 374, height: 16, class: 'ss-mbar'}), t, s('line', {x1: 8, y1: 598, x2: 382, y2: 598, class: 'ss-edge'}));
}
/** 하늘 별 — 반짝임은 크기만(transform) */
const skyStars = pts => s('g', {'data-mucha': 'stars', class: 'ss-stars'},
  pts.map(([x, y, r, k], i) => s('g', {transform: `translate(${x} ${y})`}, s('g', {class: 'ss-tw ss-t' + (i % 4)}, k ? s('path', {d: spark(0, 0, r), class: 'ss-sp'}) : s('path', {d: star5(0, 0, r, r * 0.42), class: 'ss-st'})))));
/** 노을 띠 — 복숭아빛 · 금빛 두 겹(납작한 색면 · 금빛 선) · 사이에 모자이크 줄(회보라 언덕 대신) */
function sunset(y) {
  const tiles = [];
  for (let i = 0; i < 34; i++) {
    const x = f1(27 + i * 10.4), yy = f1(y + 21 + 2.4 * Math.sin(i * 0.55)), c = ['ss-m1', 'ss-m3', 'ss-m2'][i % 3];
    tiles.push(i % 2 ? s('circle', {cx: x, cy: yy, r: 2.5, class: c}) : s('rect', {x: f1(x - 2.6), y: f1(yy - 2.6), width: 5.2, height: 5.2, rx: 0.8, class: c, transform: `rotate(45 ${x} ${yy})`}));
  }
  return s('g', {'data-mucha': 'pastel', class: 'ss-pastel'},
    s('path', {d: `M 20 ${y} C 90 ${y - 16} 150 ${y - 6} 200 ${y - 12} C 260 ${y - 18} 320 ${y - 8} 370 ${y - 2} L 370 598 L 20 598 Z`, class: 'ss-sun1'}),
    s('path', {d: `M 20 ${y + 30} C 100 ${y + 26} 160 ${y + 32} 210 ${y + 29} C 270 ${y + 26} 330 ${y + 31} 370 ${y + 32} L 370 598 L 20 598 Z`, class: 'ss-sun2'}),
    s('path', {d: `M 20 ${y} C 90 ${y - 16} 150 ${y - 6} 200 ${y - 12} C 260 ${y - 18} 320 ${y - 8} 370 ${y - 2}`, class: 'ss-pline'}),
    s('path', {d: `M 20 ${y + 30} C 100 ${y + 26} 160 ${y + 32} 210 ${y + 29} C 270 ${y + 26} 330 ${y + 31} 370 ${y + 32}`, class: 'ss-pline'}),
    s('g', {'data-mucha': 'mosaic'}, tiles));
}
/** 머리 올 다발 — 뿌리 굵고 끝 가는 여러 가닥(공용 strands) · 머리색 · 그늘 · 윤기 세 겹 */
const tress = (pts, n, sp, w0, seed, curl, cls, base = 0) => s('g', {class: 'mk-hair ' + cls},
  base ? taper(pts, {w0: base, w1: base * 0.18, cls: 'mk-hd'}) : null,
  strands(pts, {n, spread: sp, w0, w1: 0.3, curl, seed, cls: 'mk-hb'}));
const T = (pts, w0, w1, cls) => taper(pts, {w0, w1, cls});
/** 귀퉁이 덩굴 — 감아 오르는 줄기 · 물방울 잎 · 다섯 잎 꽃(flip = 오른쪽) */
function vineCorner(x, y, flip) {
  const m = v => (flip ? 390 - v : v);
  const d = `M ${m(x)} ${y} C ${m(x + 6)} ${y - 30} ${m(x + 34)} ${y - 44} ${m(x + 58)} ${y - 36} C ${m(x + 78)} ${y - 28} ${m(x + 74)} ${y - 6} ${m(x + 58)} ${y - 8} C ${m(x + 46)} ${y - 10} ${m(x + 48)} ${y - 24} ${m(x + 58)} ${y - 22}`;
  return s('g', {class: 'ss-sway-v'}, s('path', {d: brush(d, 3.4, 0.8), class: 'ss-stem'}),
    leaf(m(x + 6), y - 18, flip ? -120 : -60, 15), leaf(m(x + 30), y - 40, flip ? 160 : 20, 14), leaf(m(x + 70), y - 34, flip ? -150 : -30, 13),
    flower(m(x + 18), y - 30, 10), flower(m(x + 60), y - 22, 7), s('circle', {cx: m(x + 40), cy: y - 46, r: 4, class: 'ss-bud'}));
}
/** 아치에 녹인 글씨(lettering) */
const archText = (id, t) => s('g', {'data-mucha': 'lettering', class: 'ss-letter'},
  s('text', {class: 'ss-archt'}, s('textPath', {href: '#' + id + 'ap', startOffset: '50%', 'text-anchor': 'middle', text: t})));

/* ── ① 「왜 사?」 여인 — 여덟째 판(r8-brief A06 · judge-r7 6): 인어 치마 차렷 → 오른 다리로 디딘 S자(오른 골반 높이 · 왼 무릎은 굽어 안으로 · 정강이는 바깥 아래로)
   사선 주름 넷(오른 골반 → 굽힌 무릎 · 정강이) · 발목에서 퍼진 자락이 왼쪽 아래(물음 칸이 비운 자리)로 흘러 소용돌이 · 무릎께 짧은 갈색 선 둘은 지움
   머리 — 어깨로 처진 가닥 대신 굵다 가늘어지는 가는 가닥 다섯씩의 S자 다발 둘이 달 후광 둘레를 감고 끝은 첫 물음 칸 머리에 감기는 소용돌이
   모래시계 — 아래 손은 손바닥으로 밑판을 받치고 손가락 넷이 밑판 오른끝을 감아 오름 · 옆 손은 오른 기둥을 감아쥐고 손끝이 유리 앞으로 내려옴
   바깥선은 굵게 시작해 끝에서 가늘게 · 속선(주름)은 1 아래 · 물음 칸(왼 x ≤ 136 · 오른 ≥ 254)에서 8 넘게 떨어짐 ── */
/** 점 줄 → 매끈한 'M … C …'(캣멀-롬 · 절대 좌표 M 과 C 만 — ring · bez 가 읽음) */
function crD(P, closed = false) {
  const n = P.length, at = i => (closed ? P[(i + n) % n] : P[Math.max(0, Math.min(n - 1, i))]);
  let d = 'M ' + fp(P[0]);
  for (let i = 0; i < (closed ? n : n - 1); i++) {
    const p0 = at(i - 1), p1 = at(i), p2 = at(i + 1), p3 = at(i + 2);
    d += ' C ' + fp([p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6]) + ' ' + fp([p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6]) + ' ' + fp(p2);
  }
  return d + (closed ? ' Z' : '');
}
/* 옷 윤곽 — 왼쪽(목 → 굽힌 무릎 → 발목 → 왼쪽 아래로 흐르는 자락 끝) · 자락 밑단(왼 → 오른) · 오른쪽(발치 → 목)
   허리 잘록(176 ~ 220) · 오른 골반 높고 넓게(244, 300) · 왼 골반 낮게(165, 322) · 왼 무릎 안으로(177, 396) · 오른 다리 곧게 */
const GL = [[186, 137], [173, 143], [166, 154], [163, 172], [165, 196], [170, 220], [176, 240], [175, 258], [170, 278], [166, 300], [165, 322], [168, 346], [173, 372], [177, 396], [174, 420], [166, 446], [156, 470], [146, 490], [132, 508], [112, 522], [88, 533], [64, 541], [46, 547]];
const GP = [[40, 552], [56, 557], [92, 559], [134, 557], [170, 554], [198, 553], [222, 554], [240, 551], [247, 544]];
const GR = [[245, 534], [240, 518], [237, 500], [235, 476], [234, 450], [235, 424], [237, 398], [239, 372], [242, 346], [244, 320], [243, 298], [238, 280], [231, 264], [223, 250], [220, 236], [222, 216], [227, 192], [230, 170], [229, 154], [222, 143], [210, 137]];
const QW = {
  gown: crD([...GL, ...GP, ...GR], true),
  /* 그늘 — 디딘 오른 다리 바깥 · 굽힌 무릎 아래 종아리 · 흐르는 자락 안쪽(같은 크림의 한 톤 짙은 색면) */
  shade: [crD([[244, 304], [243, 334], [240, 372], [237, 410], [235, 450], [236, 490], [241, 522], [244, 538], [234, 536], [228, 500], [226, 460], [228, 420], [232, 380], [236, 340], [238, 312]], true),
    crD([[190, 404], [202, 430], [198, 462], [186, 488], [174, 472], [182, 440]], true),
    crD([[150, 506], [126, 528], [96, 545], [70, 551], [104, 552], [140, 544], [164, 526]], true)],
  sash: 'M 177 254 C 191 260 208 256 223 246 C 225 252 225 259 224 265 C 209 274 192 278 178 274 C 176 267 176 260 177 254 Z',
  knot: 'M 183 259 C 189 255 197 257 197 265 C 197 273 189 276 183 272 C 179 268 179 263 183 259 Z',
  /* 왼팔은 몸에 붙여 아래 그릇을 받침(소매 자락은 곧게 늘어짐) · 오른팔은 굽혀 모래시계 허리를 감쌈 */
  sleeveL: 'M 167 150 C 160 160 160 182 163 202 C 165 216 170 230 180 238 C 186 242 190 242 192 238 C 192 232 188 228 184 226 C 178 222 176 210 176 196 C 176 178 178 160 167 150 Z',
  dropL: 'M 167 208 C 166 228 166 246 165 262 C 165 270 168 274 173 270 C 180 264 184 254 188 244 C 180 240 171 228 167 208 Z',
  sleeveR: 'M 228 150 C 236 160 238 178 236 194 C 235 204 232 212 226 212 C 220 212 218 204 219 194 C 220 184 221 172 218 164 C 222 158 226 154 228 150 Z',
  dropR: 'M 230 196 C 234 214 238 232 241 250 C 242 258 238 262 234 258 C 227 246 223 228 222 212 C 226 210 229 204 230 196 Z',
  collar: 'M 185 134 C 194 141 204 141 211 134 C 212 137 212 140 211 143 C 204 149 194 149 185 143 C 184 140 184 137 185 134 Z',
  /* 속선(1 아래) — 사선 주름 넷(오른 골반 → 굽힌 왼 무릎 · 정강이) · 디딘 오른 다리 둘 · 발목에서 왼쪽 아래로 흐르는 자락 셋 · 윗옷 둘 */
  folds: [[[[232, 286], [216, 306], [198, 330], [184, 354]], 1], [[[240, 316], [222, 340], [204, 366], [189, 390]], 1],
    [[[241, 348], [223, 374], [205, 402], [191, 430], [178, 454]], 1], [[[237, 382], [221, 412], [205, 444], [187, 472], [167, 494]], 0.95],
    [[[226, 404], [227, 444], [231, 488], [239, 530]], 0.9], [[[214, 436], [214, 476], [217, 514], [221, 548]], 0.85],
    [[[170, 474], [150, 502], [124, 524], [96, 540], [64, 550]], 0.95], [[[186, 486], [170, 512], [148, 534], [120, 552]], 0.9], [[[200, 474], [197, 510], [191, 550]], 0.85],
    [[[180, 158], [176, 184], [179, 212]], 0.9], [[[168, 222], [168, 244], [168, 262]], 0.8]],
  tails: [[[188, 270], [182, 294], [178, 320], [171, 346]], [[197, 274], [199, 300], [195, 326], [198, 352]]],
};
/** 소용돌이 — 안으로 감기는 선(굵게 시작해 가늘게) · cls 로 옷 · 금 · 머리 */
function swirl(cx, cy, r0, a0, turn, dir, w0 = 2.6, cls = 'ss-fold', lead = null) {
  const P = lead ? [lead] : [];
  for (let i = 0; i <= 24; i++) { const u = i / 24, a = a0 + dir * u * turn * Math.PI, r = r0 * (1 - 0.74 * u); P.push([f1(cx + r * Math.cos(a)), f1(cy + r * Math.sin(a))]); }
  return T(P, w0, 0.4, cls);
}
const hemCurl = (cx, cy, r0, a0, turn, dir) => swirl(cx, cy, r0, a0, turn, dir);
/** 손가락 — 먹 테(조금 굵게) 위에 살 · 끝은 둥글게 가늘어짐(갈고리 · 소시지 아님) */
const finger = (p, w) => [T(p, w + 1.3, w * 0.55 + 0.9, 'ss-ink'), T(p, w, w * 0.55, 'ss-skin')];
/** 모래시계 — 두 그릇 · 남은 모래(위) · 쌓인 모래(아래) · 떨어지는 알갱이(transform) */
function hourglass(id, done, total, cx, y0, y1) {
  const top = Math.max(0, Math.min(1, (total - done) / total)), bot = 1 - top, mid = (y0 + y1) / 2, hw = 14;
  const UP = `M ${cx - hw} ${y0 + 4} C ${cx - hw} ${mid - 12} ${cx - 2} ${mid - 5} ${cx} ${mid} C ${cx + 2} ${mid - 5} ${cx + hw} ${mid - 12} ${cx + hw} ${y0 + 4} Z`;
  const LO = `M ${cx - hw} ${y1 - 4} C ${cx - hw} ${mid + 12} ${cx - 2} ${mid + 5} ${cx} ${mid} C ${cx + 2} ${mid + 5} ${cx + hw} ${mid + 12} ${cx + hw} ${y1 - 4} Z`;
  const ys = f1(mid - (mid - y0 - 4) * top), hb = f1((y1 - 4 - mid) * 0.8 * bot);
  return s('g', {class: 'ss-hg'},
    s('defs', {}, s('clipPath', {id: id + 'cu'}, s('path', {d: UP})), s('clipPath', {id: id + 'cl'}, s('path', {d: LO}))),
    s('path', {d: UP, class: 'ss-glass'}), s('path', {d: LO, class: 'ss-glass'}),
    top > 0 ? s('rect', {x: cx - hw - 2, y: ys, width: 2 * hw + 4, height: f1(mid + 1 - ys), 'clip-path': `url(#${id}cu)`, class: 'ss-sand'}) : null,
    bot > 0 ? s('path', {d: `M ${cx - hw - 2} ${y1 - 3} L ${cx - hw - 2} ${f1(y1 - 4 - hb)} Q ${cx} ${f1(y1 - 4 - hb - 9 * bot)} ${cx + hw + 2} ${f1(y1 - 4 - hb)} L ${cx + hw + 2} ${y1 - 3} Z`, 'clip-path': `url(#${id}cl)`, class: 'ss-sand'}) : null,
    top > 0 && done < total ? [0, 1, 2].map(k => s('circle', {cx, cy: mid + 2, r: 1.2, class: 'ss-grain ss-g' + k})) : null,
    s('path', {d: `M ${cx - 9} ${y0 + 8} C ${cx - 9} ${mid - 12} ${cx - 4} ${mid - 7} ${cx - 1} ${mid - 3}`, class: 'ss-sheen'}),
    s('path', {d: UP, class: 'ss-glassl'}), s('path', {d: LO, class: 'ss-glassl'}),
    s('rect', {x: cx - hw - 5, y: y0 - 1, width: 3, height: y1 - y0 + 2, rx: 1.5, class: 'ss-post'}), s('rect', {x: cx + hw + 2, y: y0 - 1, width: 3, height: y1 - y0 + 2, rx: 1.5, class: 'ss-post'}),
    s('rect', {x: cx - hw - 8, y: y0 - 5, width: 2 * hw + 16, height: 6, rx: 3, class: 'ss-plate'}), s('rect', {x: cx - hw - 8, y: y1 - 1, width: 2 * hw + 16, height: 6, rx: 3, class: 'ss-plate'}));
}
/** S자 머리 다발 — 굵은 뿌리(짙은 덩어리) 위로 가는 가닥 다섯이 한 길을 따라 흐르다 끝에서 갈라져 저마다 다른 크기로 감김(dir 1 = 오른쪽으로 감김) */
function lockS(P, {sp = 10, w0 = 2.5, R0 = 8, dir = 1, cls = ''} = {}) {
  const m = P.length, N = P.map((p, i) => { const a = P[Math.max(0, i - 1)], b = P[Math.min(m - 1, i + 1)], dx = b[0] - a[0], dy = b[1] - a[1], d = Math.hypot(dx, dy) || 1; return [-dy / d, dx / d]; });
  const RK = [0.5, 0.8, 1.05, 0.7, 0.42], TK = [1.1, 1.5, 1.8, 1.35, 0.95], WK = [0.75, 1, 1.12, 0.92, 0.7], EK = [m - 2, m - 1, m - 1, m - 1, m - 2]; // 가닥마다 끝 자리 · 감김이 다름(갈라진 끝)
  const one = k => {
    const u = k / 4 - 0.5, pts = P.slice(0, EK[k] + 1).map((p, i) => { const t = i / (m - 1), o = u * sp * (0.75 + 0.55 * t * t); return [p[0] + N[i][0] * o, p[1] + N[i][1] * o]; });
    const z = pts.length - 1, e = pts[z], q = pts[z - 1], dl = Math.hypot(e[0] - q[0], e[1] - q[1]) || 1, tx = (e[0] - q[0]) / dl, ty = (e[1] - q[1]) / dl, r0 = R0 * RK[k];
    const c = dir > 0 ? [e[0] - ty * r0, e[1] + tx * r0] : [e[0] + ty * r0, e[1] - tx * r0], a0 = Math.atan2(e[1] - c[1], e[0] - c[0]);
    for (let j = 1; j <= 18; j++) { const v = j / 18, a = a0 + dir * v * TK[k] * Math.PI, r = r0 * (1 - 0.62 * v); pts.push([f1(c[0] + r * Math.cos(a)), f1(c[1] + r * Math.sin(a))]); }
    return [T(pts, w0 * WK[k] + 0.9, 0.4, 'mk-hd'), T(pts, w0 * WK[k], 0.25, 'mk-hb')];
  };
  return s('g', {class: 'mk-hair ' + cls}, T(P.slice(0, Math.ceil(m * 0.6)), sp * 0.9 + w0, 1.2, 'mk-hd'), [0, 4, 1, 3, 2].map(one),
    T(P.slice(1, m - 1).map(([x, y], i) => [x + N[i + 1][0] * sp * 0.1, y + N[i + 1][1] * sp * 0.1]), 1, 0.15, 'mk-hl'));
}
/** 머리 덩어리 — 공용 반측면 머리(h 46)의 덩어리 · 테 · 결 · 윤기를 그대로 옮기고 어깨로 처지는 가닥은 뺌 */
const HAIR8 = {mass: [[210.9, 90.5], [215, 77.6], [210, 65.5], [198, 58.5], [182.5, 58.5], [168.5, 65.5], [160.5, 80], [160.5, 97], [166.5, 111], [177.5, 117], [185.6, 100.6], [186, 89.1], [192.5, 82.2], [202.6, 81.3], [209, 86.8]],
  edge: [[210, 65.5], [198, 58.5], [182.5, 58.5], [168.5, 65.5], [160.5, 80], [160.5, 97], [166.5, 111], [177.5, 117]],
  lines: [[[200.8, 73], [192.5, 65.6], [179.6, 65.2], [171.3, 75.3], [169.5, 89.1]], [[202.6, 72.1], [198, 63.8], [186.5, 61.7], [175, 67]], [[188.8, 74.8], [181, 79.4], [178.2, 90.5], [179.1, 102.9]]],
  light: [[196.2, 67.5], [184.2, 64.3], [175, 70.2]]};
/* ── ① 아홉째 판(r9-brief B06 · 주문 1844 「어 다 채워」) — 큰 여인이 그림을 채움 · 네모 물음 칸을 걷음
   몸 — 목과 발치는 그대로 두고 어깨에서 무릎까지 가운데(200)에서 바깥으로 1.16 배(둥근 어깨 · 풍만한 엉덩이) · 오른 발목 자락도 밖으로 퍼짐(S자 치마)
   머리 · 얼굴 · 달 후광은 목(198, 142)을 축으로 1.1 배 — 굵다 가늘어지는 S자 다발 둘이 달 테를 감음
   물음 — 아치 테를 따라 내려오는 꽃 덩굴에 걸린 작은 꽃 메달 열하나(번호) · 물음 글은 메달 안쪽 곁에 한두 줄(띄어쓰기에서만)
   왼 = 이유 · 때 · 오른 = 돈 · 마음(WHY_GROUPS 차례 · 질문 차례 그대로) · 글은 여인 몸 · 달 · 꽃잎에서 8 넘게 떨어짐 ── */
const WK = y => { const a = Math.max(0, Math.min(1, (y - 132) / 30)), b = Math.max(0, Math.min(1, (556 - y) / 80)), t = Math.min(a, b); return 1 + 0.16 * t * t * (3 - 2 * t); };
const WX = (x, y) => f1(200 + (x - 200) * WK(y));
const wP = P => P.map(([x, y]) => [WX(x, y), y]);
const wD = d => d.replace(/(-?\d+(?:\.\d+)?) (-?\d+(?:\.\d+)?)/g, (m, a, b) => WX(+a, +b) + ' ' + b);
const HEAD9 = 'translate(198 142) scale(1.1) translate(-198 -142)';
const GP9 = [[40, 552], [56, 557], [92, 559], [134, 557], [170, 554], [198, 553], [224, 556], [246, 558], [264, 554], [271, 545]];
const GR9 = [[262, 536], [247, 519], ...GR.slice(2)];
const QW9 = {gown: crD(wP([...GL, ...GP9, ...GR9]), true), shade: QW.shade.map(wD), sash: wD(QW.sash), knot: wD(QW.knot), collar: wD(QW.collar),
  sleeveL: wD(QW.sleeveL), dropL: wD(QW.dropL), sleeveR: wD(QW.sleeveR), dropR: wD(QW.dropR), folds: QW.folds.map(([p, w]) => [wP(p), w]), tails: QW.tails.map(wP)};
function quizWoman9(id, done, total) {
  const Q = QW9, H = HAIR8;
  const back = s('g', {'data-mucha': 'whiplash', class: 'ss-whip'}, s('g', {transform: HEAD9},
    lockS([[171, 100], [161, 112], [147, 117], [135, 110], [127, 96], [126, 79], [132, 64], [144, 53], [158, 47]], {sp: 8, w0: 2.3, R0: 7.5, dir: 1, cls: 'ss-sway-l'}),
    lockS([[205, 64], [222, 57], [240, 59], [255, 68], [264, 84], [266, 101], [261, 117], [251, 128]], {sp: 8.5, w0: 2.4, R0: 8, dir: -1, cls: 'ss-sway-r'}),
    lockS([[176, 108], [170, 122], [158, 130], [146, 130], [138, 124]], {sp: 5, w0: 1.8, R0: 5, dir: -1, cls: 'ss-sway-l2'}),
    s('g', {class: 'mk-hair', 'aria-hidden': 'true'}, s('path', {d: crD(H.mass, true), class: 'mk-hb'}), T(H.edge, 2.6, 0.5, 'mk-hd'),
      H.lines.map(p => T(p, 1, 0.15, 'mk-hx')), T(H.light, 1.8, 0.2, 'mk-hl'))));
  const crown = s('g', {class: 'ss-crown'}, s('path', {d: crescent(198, 64, 6, 3, -1.4, 5), class: 'ss-gold'}),
    s('path', {d: star5(183, 70, 2.8, 1.2), class: 'ss-gold'}), s('path', {d: star5(213, 69, 2.8, 1.2), class: 'ss-gold'}));
  const hk = f1(WK(205) * 1000) / 1000;
  const body = s('g', {'data-mucha': 'outline', class: 'ss-woman ss-body'},
    s('path', {d: Q.gown, class: 'ss-gown'}), Q.shade.map(d => s('path', {d, class: 'ss-gown2'})),
    Q.folds.map(([p, w]) => T(p, w, 0.2, 'ss-fold')),
    // 바깥선 — 어깨에서 굵게 시작해 발치 · 자락 끝으로 가늘게 · 밑단은 가는 선 · 두 발목 자락 끝이 소용돌이
    T(wP(GL), 4.6, 0.7, 'ss-ink'), T(wP([...GR9].reverse()), 5, 0.8, 'ss-ink'), T(wP([GL[GL.length - 1], ...GP9, GR9[0]]), 1.3, 0.8, 'ss-ink'),
    hemCurl(53, 549, 5.5, Math.PI * 0.95, 1.4, 1), hemCurl(264, 543, 4.8, Math.PI * 1.9, 1.3, 1), hemCurl(130, 553, 4, Math.PI * 0.6, 1.2, -1),
    part(Q.sash, 'ss-sage', 2, 0.4),
    Q.tails.map(p => [T(p, 16.5, 11.5, 'ss-ink'), T(p, 14, 9, 'ss-sage'), T(p, 3, 0.6, 'ss-sage2')]),
    part(Q.knot, 'ss-sage2', 1.6, 0.4),
    s('g', {transform: HEAD9}, kface({cx: 198, cy: 96, h: 46, dir: 1, view: 'three', tilt: 8, iris: 0}), crown),
    part(Q.collar, 'ss-gold2', 1.4, 0.4), s('circle', {cx: 198, cy: 146, r: 3.2, class: 'ss-gem'}),
    part(Q.dropL, 'ss-gown2', 2.4, 0.4), part(Q.sleeveL, 'ss-gown', 4.2, 0.6), T(wP([[165, 176], [167, 198], [171, 214], [178, 228]]), 0.9, 0.2, 'ss-fold'),
    part(Q.dropR, 'ss-gown2', 2.4, 0.4), part(Q.sleeveR, 'ss-gown', 3.8, 0.6), T(wP([[229, 162], [231, 182], [229, 202]]), 0.9, 0.2, 'ss-fold'),
    s('g', {transform: `translate(200 0) scale(${hk} 1) translate(-200 0)`}, hourglass(id, done, total, 199, 176, 234)),
    // 아래 손 — 손바닥이 밑판 밑을 받치고 가늘고 긴 손가락 넷이 밑판 오른끝을 감아 오름 · 엄지는 왼 기둥을 따라 오름(몸과 같이 넓힘 — 손가락은 길어지고 굵기는 그대로)
    part(wD('M 186 238 C 191 244 200 247 209 247 C 215 247 219 245 220 242 C 220 239 217 239 214 240 C 210 241 204 241 198 240 C 193 239 190 236 189 234 C 187 232 184 234 186 238 Z'), 'ss-skin', 2, 0.5),
    [[[[206, 247.8], [211.5, 249.6], [215.6, 248.6], [217.6, 246]], 3], [[[208.6, 246.4], [214.8, 247.2], [219.8, 244.8], [221.8, 241.4]], 3.6],
      [[[210.6, 243.8], [217.2, 243.8], [221.8, 240.6], [222.8, 237]], 3.8], [[[212.2, 241], [217.6, 240.2], [221, 237.2], [221, 234]], 3.5]].map(([p, w]) => finger(wP(p), w)),
    finger(wP([[189, 237.5], [185.6, 232.5], [184.8, 227], [186.4, 222.4]]), 3.6),
    // 옆 손 — 오른 소매 끝에서 손등 · 손가락 넷이 오른 기둥을 감아쥐고 손끝은 유리 앞으로 내려옴
    part(wD('M 237 196 C 234 191 228 189 223 191 C 219 193 217 198 217 204 C 217 210 219 215 223 217 C 228 219 234 216 236 211 C 238 206 238 200 237 196 Z'), 'ss-skin', 2, 0.5),
    [[[[221.5, 209.8], [216.4, 210.4], [213.4, 212.4], [213.8, 215]], 3.2], [[[221.5, 204.8], [215.4, 205], [211.8, 207.2], [211.8, 210.4]], 3.8],
      [[[221.5, 199.6], [215, 199.4], [211, 201.6], [210.6, 205]], 4], [[[222, 194.6], [216, 193.6], [211.6, 195.4], [210.8, 198.8]], 3.8]].map(([p, w]) => finger(wP(p), w)),
    finger(wP([[227, 191.5], [222.5, 187], [217, 184.6], [212, 185]]), 3.4),
    T(wP([[238.5, 193], [236, 202], [237.5, 212]]), 1.6, 0.4, 'ss-ink'));
  return [back, body];
}

/* ── ① 꽃 메달 열하나 — 메달(번호)은 아치 안쪽 테를 따라 내려오는 덩굴에 걸림(아치 어깨에서는 둥근 테를 따라 안으로) · 물음 글은 메달 곁(꽃잎에서 8 넘게)
   묶음 이름은 덩굴 위 반짝이 곁에 · 묶음 사이는 두 배로 띄움 · 위 78 ~ 아래 왼 458(자락이 흐르는 자리를 비움) · 오른 506(노을 띠 위) ── */
const MQX = 31, MQR = 13, MQP = 15.3, MQT = 28; // 메달 가운데 x(왼) · 메달 반지름 · 꽃잎 고리 · 메달 가운데에서 글까지
const archX = y => (y >= 126 ? 20 : 195 - 175 * Math.sqrt(Math.max(0, 1 - ((126 - y) / 104) ** 2)));
const wrap2 = t => { const sp = t.indexOf(' '); return sp > 0 ? [t.slice(0, sp), t.slice(sp + 1)] : [t]; };
const qLines = t => (tw(t, 18) > 80 ? wrap2(t) : [t]);
const medX = (sd, cy) => { const x = Math.max(MQX, f1(archX(cy) + 12)); return sd === 'L' ? x : 390 - x; };
function layout9(groups, qs) {
  const S = {L: [], R: []}, TOP = 78, BOT = {L: 458, R: 506}, out = [];
  groups.forEach(([name, list], gi) => { const sd = gi % 2 ? 'R' : 'L';
    S[sd].push({sd, name, h: 24});
    list.forEach(q => { const t = typeof qs[q - 1] === 'string' ? qs[q - 1] : NEED, L = qLines(t); S[sd].push({sd, q, L, h: L.length > 1 ? 42 : 32}); }); });
  for (const sd of ['L', 'R']) {
    const A = S[sd], tot = A.reduce((a, it) => a + it.h, 0), wt = A.slice(1).reduce((a, it) => a + (it.name != null ? 2 : 1), 0), g = (BOT[sd] - TOP - tot) / wt;
    let y = TOP;
    A.forEach((it, i) => { if (i) y += g * (it.name != null ? 2 : 1); it.top = f1(y); it.cy = f1(y + it.h / 2); y += it.h; it.bot = f1(y); out.push(it); });
  }
  return out;
}
/** 메달 하나 — 꽃잎 열둘 고리 · 금테 원판(번호) · 지금 메달은 뒤에서 비스듬한 별빛이 숨 쉼 · 물음 글 한두 줄(메달 쪽으로 붙임) */
function qMedal9(it, state) {
  const {sd, q, L, cy} = it, mx = medX(sd, cy), tx = f1(mx + (sd === 'L' ? MQT : -MQT)), pet = [];
  for (let k = 0; k < 12; k++) { const a = k * 30 + 15, ar = a * Math.PI / 180, ex = f1(mx + MQP * Math.cos(ar)), ey = f1(cy + MQP * Math.sin(ar)); pet.push(s('ellipse', {cx: ex, cy: ey, rx: 3.9, ry: 3.1, transform: `rotate(${a} ${ex} ${ey})`, class: 'sq-pet'})); }
  return s('g', {class: 'sq-md' + (state === 'cur' ? ' sq-cur' : state === 'on' ? ' sq-on' : ''), 'data-q': q},
    state === 'cur' ? s('g', {transform: `translate(${mx} ${cy}) rotate(45)`}, s('g', {class: 'ss-pulse'}, s('path', {d: spark(0, 0, 23), class: 'sq-glow'}))) : null,
    s('g', {class: 'sq-ring'}, pet),
    s('circle', {cx: mx, cy, r: MQR, class: 'sq-disk'}),
    s('text', {x: mx, y: f1(cy + 6.3), 'text-anchor': 'middle', class: 'sq-num', 'data-qn': '', text: String(q)}),
    L.map((t, i) => s('text', {x: tx, y: f1(cy + 6.3 + (L.length > 1 ? (i - 0.5) * 21 : 0)), 'text-anchor': sd === 'L' ? 'start' : 'end', class: 'sq-qt', 'data-qt': '', text: t})));
}
/** 묶음 이름 — 덩굴 위 네 갈래 반짝이 + 이름(메달 글과 같은 줄) */
const gName9 = it => { const mx = medX(it.sd, it.cy); return s('g', {class: 'sq-g'}, s('path', {d: spark(mx, it.cy, 7.5), class: 'sq-spk'}),
  s('text', {x: f1(mx + (it.sd === 'L' ? MQT - 2 : -MQT + 2)), y: f1(it.cy + 7), 'text-anchor': it.sd === 'L' ? 'start' : 'end', class: 'sq-gn', 'data-gname': '', text: it.name})); };
/** 덩굴 — 메달 사이를 S 로 잇는 줄기(위 가늘고 아래 굵게) · 메달 사이마다 잎 둘 · 꽃 봉오리 · 끝은 말림 */
function garland9(items, sd) {
  const A = items.filter(it => it.sd === sd), dir = sd === 'L' ? 1 : -1, P = [], lv = [];
  const first = A[0], last = A[A.length - 1];
  P.push([medX(sd, first.cy - 34), first.cy - 34]);
  A.forEach((it, i) => { const x = medX(sd, it.cy); P.push([x, it.cy]);
    const nx = A[i + 1]; if (!nx) return; const my = (it.bot + nx.top) / 2, mxx = f1((x + medX(sd, nx.cy)) / 2 - dir * 4 * (i % 2 ? 1 : -1));
    P.push([mxx, my]); lv.push([mxx, my, i]); });
  P.push([medX(sd, last.cy + 30), last.cy + 30]);
  const tip = P[0], c = [tip[0] + dir * 6, tip[1]], a0 = dir > 0 ? Math.PI : 0, curl = []; // 맨 위 끝은 안쪽으로 말림
  for (let j = 0; j <= 16; j++) { const u = j / 16, a = a0 + dir * u * 1.6 * Math.PI, r = 6 * (1 - 0.6 * u); curl.push([f1(c[0] + r * Math.cos(a)), f1(c[1] + r * Math.sin(a))]); }
  return s('g', {class: 'sq-vine', 'data-mucha': 'vine'},
    T(P.slice().reverse(), 3.4, 0.9, 'sq-stem'), T(curl, 1, 0.3, 'sq-stem'), // 아래(굵게)에서 위(가늘게)
    lv.map(([x, y, i]) => [leaf(x, y, -90 - dir * 28 + (i % 2 ? 180 : 0), 12), leaf(x, y, 90 + dir * 28 + (i % 2 ? 180 : 0), 11)].map(e => { e.setAttribute('class', 'sq-leaf'); return e; })),
    lv.filter(([, , i]) => i % 2 === 0).map(([x, y]) => flower(f1(x - dir * 7), f1(y + 1), 4.6, 'sq-fl')));
}
function route9(groups, qs, cur, done) {
  const items = layout9(groups, qs), stars = [];
  for (const sd of ['L', 'R']) { const A = items.filter(it => it.sd === sd);
    A.forEach((it, i) => { if (!i || it.name == null) return; const pv = A[i - 1], y = f1((pv.bot + it.top) / 2), x = f1(medX(sd, y) + (sd === 'L' ? 62 : -62)); stars.push([x, y]); }); }
  return s('g', {class: 'sq-route', 'data-mucha': 'panel', 'aria-hidden': 'true'},
    garland9(items, 'L'), garland9(items, 'R'),
    s('g', {'data-mucha': 'stars'}, stars.map(([x, y], i) => s('g', {transform: `translate(${x} ${y})`}, s('g', {class: 'ss-tw ss-t' + (i % 4)}, s('path', {d: i % 2 ? spark(0, 0, 4.6) : star5(0, 0, 3.4, 1.4), class: 'ss-sp'}))))),
    items.map(it => (it.name != null ? gName9(it) : qMedal9(it, it.q === cur ? 'cur' : it.q <= done ? 'on' : 'off'))));
}
/** 별가루 — 반쯤 비치는 칸 너머 · 칸 사이로 보이는 밤하늘 작은 별(한 path) */
const DUST = [[34, 150], [126, 146], [58, 214], [128, 222], [36, 262], [112, 286], [52, 330], [130, 318], [38, 380], [116, 392], [60, 452], [128, 462], [34, 492],
  [264, 150], [356, 146], [300, 214], [360, 226], [262, 270], [334, 290], [286, 340], [358, 362], [266, 402], [338, 430], [290, 470], [360, 500], [270, 528], [148, 36], [246, 34]];
const dust9 = () => s('path', {d: DUST.filter(([x, y]) => y < 60 || !((x > 46 && x < 146) || (x > 244 && x < 344))).map(([x, y], i) => { const r = i % 3 ? 0.9 : 1.4; return `M ${f1(x - r)} ${y} a ${r} ${r} 0 1 0 ${f1(2 * r)} 0 a ${r} ${r} 0 1 0 ${f1(-2 * r)} 0`; }).join(' '), class: 'ss-dust'}); // 물음 글 자리를 비움
/** 아래 받침 글씨 — 곡선을 따라 휘는 리본 위에 새긴 글(띠 바탕이 고르니 테 없음) */
function band(t, pts, w, cls, extra) {
  const rb = ribbon(pts, {w, tone: 'cream'}), pid = rb.getAttribute('data-path');
  return s('g', {'data-mucha': 'lettering', class: 'ss-letter'}, rb,
    s('text', {class: cls, dy: 7}, s('textPath', {href: '#' + pid, startOffset: '50%', 'text-anchor': 'middle'}, extra ?? s('tspan', {text: t}))));
}

function quizPic(d, opt, id) {
  const qs = Array.isArray(d?.qs) && d.qs.length ? d.qs : null, groups = Array.isArray(d?.groups) && d.groups.length ? d.groups : null;
  const n = qs ? qs.length : 11, done = Number.isInteger(opt.done) ? Math.max(0, Math.min(n, opt.done)) : 0;
  const cur = Number.isInteger(opt.cur) && opt.cur >= 1 && opt.cur <= n ? opt.cur : null;
  const [hair, body] = quizWoman9(id, done, n);
  const panels = qs && groups ? route9(groups, qs, cur, done) : s('g', {class: 'sq-route'}, qMedal9({sd: 'L', q: 0, L: [NEED], cy: 150}, 'cur'));
  const label = qs && groups ? '보름달 앞에서 모래시계를 든 여인과 아치 테를 따라 걸린 열한 질문 꽃 메달 · ' + (cur ? '지금 ' + cur + '번째 질문 · ' : '') + '답한 질문 ' + done + '개' : '열한 질문 · ' + NEED;
  return s('svg', {class: 'su-svg su-art4 su-stop-art ss-quiz', viewBox: `0 0 ${W} ${H}`, role: 'img', 'aria-label': label, 'data-g': 'stop-art', preserveAspectRatio: 'xMidYMid meet'},
    defs(id),
    s('g', {'clip-path': `url(#${id}clip)`},
      sky(id), sunset(532), s('g', {'data-mucha': 'stars', class: 'ss-stars'}, dust9()),
      skyStars([[112, 44, 2.6, 1], [280, 44, 2.4, 0], [34, 506, 2.4, 1]]),
      s('g', {'data-mucha': 'halo', class: 'ss-halo'},
        s('circle', {cx: 198, cy: 92, r: 80, class: 'ss-hring3'}), s('circle', {cx: 198, cy: 92, r: 72, fill: `url(#${id}moon)`, class: 'ss-hdisk'}),
        s('path', {d: crescent(198, 92, 72, 30, -6, 66), class: 'ss-moon'}),
        s('circle', {cx: 198, cy: 92, r: 72, class: 'ss-hring'}), s('circle', {cx: 198, cy: 92, r: 60, class: 'ss-hring2'})),
      hair, body,
      band('사기 전에 한 번 멈춰요', [[44, 580], [120, 572], [195, 569], [270, 572], [346, 580]], 32, 'ss-plqt'), mosaic()),
    frame(id, true), panels); // 꽃 메달은 아치 테 위에 걸림(테 앞)
}

/* ── ② 「내 매매일지」 여인 — 돌 의자에 앉아 무릎 위 책에 깃펜으로 적음 · 한 벌 장밋빛 옷
   일곱째 판(r7-brief S 2 · 짜임 그대로): 허벅지(골반 226 → 무릎)를 0.8 배로 줄임(LAP) · 윗몸(몸통 · 머리 · 머리채)은 앉은 자리(186, 282)에서 1.12 배(UP)
   깃펜 쥔 손은 둥글게 말린 손가락 · 하는 일 없이 들렸던 왼손은 책 오른 장을 짚음 ── */
const LAP = x => (x < 226 ? f1(226 - (226 - x) * 0.8) : x);
const lapD = d => d.replace(/(-?\d+(?:\.\d+)?) (-?\d+(?:\.\d+)?)/g, (m, a, b) => LAP(+a) + " " + b);
const lapP = p => p.map(([x, y]) => [LAP(x), y]);
const UP = "translate(186 282) scale(1.12) translate(-186 -282)";
const JW = {
  torso: 'M 160 197 C 150 199 142 205 139 215 C 135 230 138 246 144 258 C 148 266 152 272 156 278 L 226 282 C 224 268 223 255 221 242 C 219 228 215 218 208 211 C 200 203 186 198 176 196 C 170 195 165 196 160 197 Z',
  /* 넷째 판 — 무릎 · 정강이 곡선이 드러나는 치마(무릎에서 발치까지) · 뒤쪽 자락은 돌 의자 위로 넘쳐 늘어짐 */
  skirt: 'M 154 268 C 136 272 118 278 104 285 C 94 290 88 297 89 306 C 91 322 90 344 87 362 C 85 375 82 386 78 394 C 74 399 73 403 78 405 C 104 408 146 407 176 405 C 186 404 194 403 199 400 C 201 390 202 380 204 368 C 208 378 216 380 222 375 C 226 382 236 382 240 373 C 246 370 249 362 250 352 C 252 336 250 320 246 308 C 242 296 236 286 228 280 C 204 272 178 268 154 268 Z',
  shoe: 'M 79 401 C 69 401 63 405 66 408 C 73 410 85 409 91 405 Z',
  seat: 'M 188 312 C 188 306 194 303 202 303 L 296 303 C 304 303 309 307 309 313 L 309 320 C 309 325 305 327 299 327 L 198 327 C 192 327 188 325 188 320 Z',
  base: 'M 200 327 L 297 327 C 296 350 296 372 299 392 L 198 392 C 201 372 201 350 200 327 Z',
  armQ: crD([[149, 190], [139, 200], [133, 218], [131, 236], [132, 252], [133, 264], [134, 272], [142, 280], [147, 270], [149, 256], [152, 240], [156, 224], [160, 208], [159, 196]], true),
  armR: 'M 206 208 C 218 212 228 230 232 250 C 234 262 226 268 218 264 C 212 256 208 240 204 226 C 202 218 202 212 206 208 Z',
  collar: 'M 162 202 C 170 209 178 209 186 202 C 187 205 187 208 186 211 C 178 217 170 217 162 211 C 161 208 161 205 162 202 Z',
  book: 'M 100 280 C 112 272 128 272 140 278 C 152 272 168 272 180 278 C 180 284 180 290 180 294 C 168 288 152 288 140 294 C 128 288 112 288 100 296 C 100 290 100 286 100 280 Z',
  /* 주름 — 정강이 선 · 무릎에서 부채처럼 늘어지는 셋 · 무릎과 의자 사이 처짐 · 의자 위로 넘친 자락 둘 · 웃옷 둘 */
  folds: [[[[103, 292], [97, 322], [93, 352], [87, 388]], 1.5], [[[108, 293], [118, 334], [126, 370], [130, 402]], 2.4], [[[113, 291], [136, 330], [152, 366], [162, 402]], 2.4],
    [[[120, 289], [154, 318], [178, 352], [190, 398]], 2.2], [[[150, 286], [176, 302], [198, 312], [216, 314]], 1.4],
    [[[216, 316], [219, 342], [222, 368]], 1.8], [[[232, 314], [238, 338], [240, 360]], 1.6],
    [[[152, 222], [154, 242], [160, 262]], 1.4], [[[210, 236], [212, 254], [216, 270]], 1.3]],
};
/** 손목 덮는 주름 소매 끝 — (wx, wy) 손목 가운데 · (ux, uy) 손 쪽 방향 */
function ruffle(wx, wy, ux, uy) {
  const nx = uy, ny = -ux, P = (u, v) => f1(wx + ux * u + nx * v) + ' ' + f1(wy + uy * u + ny * v);
  const d = `M ${P(0, -7.6)} C ${P(4, -9)} ${P(8, -10.5)} ${P(10, -11)} C ${P(13, -9)} ${P(12, -5)} ${P(10.5, -3.6)} C ${P(13.5, -2)} ${P(13.5, 2)} ${P(10.5, 3.6)} C ${P(12, 5)} ${P(13, 9)} ${P(10, 11)} C ${P(8, 10.5)} ${P(4, 9)} ${P(0, 7.6)} Z`;
  return [part(d, 'ss-rose', 1.8, 0.4), [[-6.5, -9.6], [0, -3.6], [6.5, 3.6]].map(([a, b]) => T([[1, a * 0.9], [6, (a + b) / 2], [10.5, b + (b > 0 ? 3 : -3)]].map(([u, v]) => P(u, v).split(' ').map(Number)), 1.2, 0.3, 'ss-fold3'))];
}
/** 깃펜 쥔 손 — 손등 · 펜을 따라 뻗은 검지 · 감싼 가운데 · 약지 · 엄지(가늘고 긴 손가락) */
function penHand(wx, wy, ux, uy) {
  const nx = uy, ny = -ux, Q = (u, v) => [f1(wx + ux * u + nx * v), f1(wy + uy * u + ny * v)];
  const fing = (pts, w) => [T(pts.map(([u, v]) => Q(u, v)), w + 1.3, w * 0.8 + 1.2, 'ss-ink'), T(pts.map(([u, v]) => Q(u, v)), w, w * 0.8, 'ss-skin')]; // 끝이 뭉툭하게 둥근 손가락(일곱째 판)
  const palm = [[2, -5.2], [7, -5.6], [11, -4.4], [12, 0], [10.5, 4.4], [6, 5.4], [2, 4.6]].map(([u, v]) => Q(u, v));
  const pd = 'M ' + palm[0].join(' ') + ' ' + palm.map((p, i) => { const q = palm[(i + 1) % palm.length]; return 'C ' + p.join(' ') + ' ' + q.join(' ') + ' ' + q.join(' '); }).join(' ') + ' Z';
  // 약지 · 가운데는 펜 밑으로 둥글게 말려 들어감 · 검지는 펜 위에서 끝이 펜으로 내려옴 · 엄지는 펜 옆을 둥글게 감쌈
  return [fing([[8, 4], [11.6, 6], [14.6, 5.8], [16, 3.8], [15.2, 2]], 2.3), fing([[9, 1.6], [13, 3.4], [16.4, 3.2], [18, 1.2], [17.2, -0.6]], 2.4),
    part(pd, 'ss-skin', 1.6, 0.4),
    fing([[10, -3.4], [14.5, -4], [18.5, -3.2], [21, -1.4], [21.4, 0.6]], 2.4), fing([[4, -5], [8.6, -7], [12.6, -6.8], [15.4, -5], [16.2, -2.8]], 2.6)];
}
function journalWoman() {
  const J = JW;
  // 머리채 — 등 뒤로 흘러 후광 오른쪽 아래를 감싸는 다발 · 정수리에서 후광 둘레로 두 다발(공용 strands 2판 굵은 다발)
  const hair = s('g', {'data-mucha': 'whiplash', class: 'ss-whip ss-body', transform: UP},
    tress([[196, 176], [212, 206], [232, 236], [258, 262], [288, 274], [318, 268], [332, 246]], 8, 12, 4, 31, 0.85, 'ss-sway-r', 14),
    tress([[158, 150], [142, 160], [124, 176], [108, 198], [100, 224], [102, 250]], 8, 11, 3.8, 32, 0.85, 'ss-sway-l', 13),
    tress([[190, 140], [214, 140], [240, 150], [264, 168], [284, 192], [294, 220]], 8, 11, 3.8, 33, 0.85, 'ss-sway-r2', 13),
    khair({cx: 172, cy: 164, h: 44, dir: -1, tone: 1, len: 2.4, seed: 9, view: 'three'}));
  const wreath = s('g', {transform: 'translate(172 164) rotate(-12)', 'data-mucha': 'flower'},
    [[-17, -27, 4.2], [-6, -32, 4.8], [6, -32, 4.4], [17, -26, 4]].map(([x, y, r]) => flower(x, y, r * 1.45, 'ss-fl2')));
  // 낮은 돌 의자 — 덩굴이 감기고 꽃이 덮음
  const bench = s('g', {class: 'ss-bench'},
    part(J.base, 'ss-stone', 2.4, 0.6), s('path', {d: 'M 208 336 L 289 336 C 288 354 288 370 290 384 L 207 384 C 209 370 209 354 208 336 Z', class: 'ss-carve'}),
    part(J.seat, 'ss-stone2', 2.4, 0.6), line('M 194 309 C 230 306 270 306 304 309', 1.2, 'ss-gold', 0.5, true),
    kvine([[300, 392], [272, 372], [292, 352], [262, 334], [286, 318]], {w0: 3.2, w1: 1, leaves: 6, buds: 2, seed: 41}),
    kvine([[202, 392], [228, 380], [214, 360], [236, 344]], {w0: 2.8, w1: 0.9, leaves: 4, buds: 1, seed: 42}),
    [[296, 300, 7.5], [284, 303, 6], [305, 307, 5.5], [272, 304, 5], [262, 386, 6], [290, 388, 5.5], [212, 388, 5]].map(([x, y, r]) => flower(x, y, r, 'ss-fl3')));
  const body = s('g', {'data-mucha': 'outline', class: 'ss-woman ss-body'},
    bench,
    s('g', {transform: UP}, part(J.torso, 'ss-rose', 3.4, 0.6)),
    part(lapD(J.skirt), 'ss-rose', 3.6, 0.6), J.folds.slice(0, 7).map(([p, w]) => T(lapP(p), w, 0.3, 'ss-fold3')),
    part(lapD(J.shoe), 'ss-shoe', 1.2, 0.4),
    T(lapP([[76, 404], [130, 407], [176, 405], [198, 401]]), 2.2, 0.8, 'ss-gold'),
    s('g', {transform: UP}, J.folds.slice(7).map(([p, w]) => T(p, w, 0.3, 'ss-fold3')),
      line('M 150 266 C 172 274 198 278 222 274', 3.4, 'ss-gold', 1.6, true), s('circle', {cx: 186, cy: 276, r: 3.4, class: 'ss-gem'}),
      kface({cx: 172, cy: 164, h: 44, dir: -1, view: 'three', tilt: 12, iris: 1}), wreath,
      part(J.collar, 'ss-gold2', 1.3, 0.4),
      tress([[184, 170], [196, 192], [204, 216], [210, 242]], 3, 6, 3, 34, 0.8, 'ss-sway-r2'),
      part(J.armR, 'ss-rose', 2, 0.5)),
    part(lapD(J.book), 'ss-page', 2.2, 0.5), line(lapD('M 140 278 C 140 284 140 289 140 294'), 1, 'ss-ink', 0.6),
    [0, 1, 2].map(k => line(lapD(`M 106 ${282 + k * 4} C 114 ${278 + k * 4} 126 ${278 + k * 4} 135 ${282 + k * 4}`), 0.9, 'ss-bl', 0.4)),
    [0, 1, 2].map(k => line(lapD(`M 145 ${282 + k * 4} C 154 ${278 + k * 4} 166 ${278 + k * 4} 175 ${282 + k * 4}`), 0.9, 'ss-bl', 0.4)),
    // 왼손 — 팔꿈치에서 내려와 책 오른 장을 손바닥으로 짚음(하는 일 없이 들린 손 지움)
    sleeve({x: 233, y: 254, ang: 62, len: 42, w: 14, hand: 'rest', dir: -1, tone: 'rose'}),
    // 깃펜 — 펜촉은 왼쪽 장 위 · 깃은 손 위로 비스듬히
    s('path', {d: lapD('M 104 288 C 98 272 92 256 86 238 C 82 228 80 222 80 216 C 86 222 94 234 100 250 C 104 262 106 274 106 286 Z'), class: 'ss-feather'}),
    line(lapD('M 105 290 C 99 270 92 248 81 218'), 1.3, 'ss-ink', 0.4),
    [0, 1, 2, 3].map(k => line(lapD(`M ${f1(100 - k * 4)} ${f1(266 - k * 12)} C ${f1(97 - k * 4)} ${f1(262 - k * 12)} ${f1(95 - k * 4)} ${f1(258 - k * 12)} ${f1(94 - k * 4)} ${f1(254 - k * 12)}`), 0.7, 'ss-ink', 0.2)),
    // 깃펜 쥔 팔 — 어깨(UP 뒤 자리)에서 손목까지 한 선 · 손목 덮는 주름 소매 · 둥글게 말린 손가락
    part(J.armQ, 'ss-rose', 2.6, 0.5), T([[154, 206], [146, 224], [141, 242], [139, 258]], 1.3, 0.3, 'ss-fold3'),
    penHand(139, 275, -0.62, 0.78), ruffle(141, 273, -0.62, 0.78));
  return [hair, body];
}
/** 후광 안 옅은 레이스 — 비스듬한 꽃 격자(무늬 한 칸 = 금실 두 줄 · 네 잎 꽃) · 가장자리 물결 레이스 고리(일곱째 판 · 빈 연두 원 채움) */
function lace(id) {
  let sc = ''; const n = 56;
  for (let k = 0; k < n; k++) { const a0 = k * 2 * Math.PI / n, a1 = (k + 1) * 2 * Math.PI / n, r = 119, p = a => fp([195 + r * Math.cos(a), 236 + r * Math.sin(a)]); sc += (k ? ' ' : 'M ' + p(a0) + ' ') + 'A 3.4 3.4 0 0 0 ' + p(a1); }
  return s('g', {class: 'ss-lace', 'data-mucha': 'mosaic'},
    s('defs', {}, s('pattern', {id: id + 'lace', width: 22, height: 22, patternUnits: 'userSpaceOnUse', patternTransform: 'rotate(45 195 236)'},
      s('path', {d: 'M 0 11 L 22 11 M 11 0 L 11 22', class: 'ss-lace-l'}),
      s('path', {d: 'M 11 6.4 Q 13 11 11 15.6 Q 9 11 11 6.4 Z M 6.4 11 Q 11 9 15.6 11 Q 11 13 6.4 11 Z', class: 'ss-lace-f'}), s('circle', {cx: 11, cy: 11, r: 1.3, class: 'ss-lace-c'}))),
    s('circle', {cx: 195, cy: 236, r: 116, fill: `url(#${id}lace)`, class: 'ss-lace-g'}), s('path', {d: sc, class: 'ss-lace-r'}));
}
/** 둥근 틀 — 「장식 인물」의 큰 원 · 금빛 겹테 · 꽃 무늬 띠 · 안에는 작은 별 */
function medallion(id) {
  const band = [], st = [];
  for (let k = 0; k < 36; k++) { const a = k * Math.PI / 18, x = f1(195 + 133.5 * Math.cos(a)), y = f1(236 + 133.5 * Math.sin(a));
    band.push(k % 2 ? s('circle', {cx: x, cy: y, r: 1.9, class: 'ss-m1'}) : flower(+x, +y, 4.6, 'ss-fl4')); }
  [[120, 150, 3.2], [270, 152, 3.4], [92, 236, 2.6], [300, 222, 3], [252, 120, 2.4], [138, 118, 2.4], [306, 290, 2.8], [86, 286, 2.4], [110, 196, 2], [286, 190, 2.2], [96, 330, 2], [300, 328, 2.2]]
    .forEach(([x, y, r], i) => st.push(s('g', {transform: `translate(${x} ${y})`}, s('g', {class: 'ss-tw ss-t' + (i % 4)}, s('path', {d: i % 3 ? spark(0, 0, r * 1.7) : star5(0, 0, r * 1.3, r * 0.55), class: 'ss-sp2'})))));
  return s('g', {'data-mucha': 'halo', class: 'ss-halo'},
    s('circle', {cx: 195, cy: 236, r: 148, class: 'ss-hring3'}),
    s('circle', {cx: 195, cy: 236, r: 140, class: 'ss-medband'}),
    s('circle', {cx: 195, cy: 236, r: 127, fill: `url(#${id}med)`, class: 'ss-meddisk'}),
    lace(id),
    s('g', {'data-mucha': 'stars'}, st),
    s('circle', {cx: 195, cy: 236, r: 140, class: 'ss-hring'}), s('circle', {cx: 195, cy: 236, r: 127, class: 'ss-hring'}),
    s('g', {'data-mucha': 'mosaic'}, band));
}

/* ── ② 「내 매매일지」 — 달이 차오르는 세 판(밤하늘에 녹는 반투명 크림 · 빈 칸은 반 높이) ── */
function recPanel(r, x, y, w, hh) {
  const cx = f1(x + w / 2), empty = !r, ah = 16;
  const shape = `M ${x} ${y + hh} L ${x} ${y + ah} A ${w / 2} ${ah} 0 0 1 ${x + w} ${y + ah} L ${x + w} ${y + hh} Z`;
  const inner = `M ${x + 5} ${y + hh - 4} L ${x + 5} ${y + ah + 2} A ${w / 2 - 5} ${ah - 4} 0 0 1 ${x + w - 5} ${y + ah + 2} L ${x + w - 5} ${y + hh - 4} Z`;
  if (empty) return s('g', {class: 'ss-pnlg'}, s('path', {d: shape, class: 'ss-pnl'}), s('path', {d: inner, class: 'ss-pl2'}),
    s('g', {class: 'ss-medal'}, leaf(+cx - 17, y + 30, 160, 12), leaf(+cx + 17, y + 30, 20, 12),
      s('circle', {cx, cy: y + 28, r: 12, class: 'ss-mdl'}), flower(+cx, y + 28, 8.5, 'ss-fl3')),
    s('text', {x: cx, y: y + 66, 'text-anchor': 'middle', class: 'ss-pm', text: '빈 칸'}));
  const lit = r.kept ? 1 : r.frac, my = y + 2;
  const res = r.kept === 'yes' ? ['정한 대로', '했어요'] : r.kept === 'no' ? ['정한 대로', '못 했어요'] : r.due ? ['한 달 됐어요', '답해 줘요'] : ['한 달 뒤', dKo(r.dueDay)];
  return s('g', {class: 'ss-pnlg'},
    s('path', {d: shape, class: 'ss-pnl'}), s('path', {d: inner, class: 'ss-pl2'}),
    s('g', {class: 'ss-mph'},
      !r.kept && r.due ? s('g', {transform: `translate(${cx} ${my})`}, s('circle', {r: 15, class: 'ss-ring ss-pulse'})) : null,
      s('circle', {cx, cy: my, r: 11, class: 'ss-mdisk'}),
      lit != null && lit > 0.02 ? s('path', {d: moonLit(+cx, my, 11, lit), class: r.kept === 'no' ? 'ss-mlit ss-mlit-no' : 'ss-mlit'}) : null,
      s('circle', {cx, cy: my, r: 11, class: 'ss-mrim'})),
    s('text', {x: cx, y: y + 33, 'text-anchor': 'middle', class: 'ss-pd', text: dKo(r.day)}),
    s('text', {x: cx, y: y + 55, 'text-anchor': 'middle', class: 'ss-pv'},
      s('tspan', {class: 'ss-tone-' + (r.v?.tone ?? 'y'), text: (r.v?.shape ?? '?') + ' '}), s('tspan', {text: r.v?.name ?? NEED})),
    s('line', {x1: x + 16, y1: y + 61, x2: x + w - 16, y2: y + 61, class: 'ss-div'}),
    res.map((t, i) => s('text', {x: cx, y: y + 79 + i * 22, 'text-anchor': 'middle', class: 'ss-pr', text: t})));
}
function journalPic(d, id) {
  const ok = d && Array.isArray(d.recs), recs = ok ? d.recs.slice(0, 3).reverse() : [], n = ok && Number.isInteger(d.n) ? d.n : 0;
  const [hair, body] = journalWoman();
  const say = !ok ? NEED : d.can === false ? '이 기기는 기록을 남길 수 없어요' : n ? null : '아직 기록이 없어요';
  const any = recs.length > 0, pw = 110, gap = 8, ph = any ? 112 : 78, py = 594 - ph, xs = [22, 22 + pw + gap, 22 + 2 * (pw + gap)];
  // 칸이 낮아진 만큼 여인 · 둥근 틀을 키움(빈 곳 없이) · 리본은 칸 바로 위
  const k = any ? 1.06 : 1.13, ry = py - (any ? 30 : 32), big = say && say.length > 12;
  const rw = say ? Math.min(330, Math.max(240, tw(say, big ? 19 : 22) + 110)) : 250;
  const rib = band(say ?? '', [[f1(195 - rw / 2), ry - 6], [f1(195 - rw / 4), ry + 2], [195, ry + 4], [f1(195 + rw / 4), ry + 2], [f1(195 + rw / 2), ry - 6]], 34, big ? 'ss-ribt ss-ribt-s' : 'ss-ribt',
    say ? null : [s('tspan', {text: '쌓인 기록 '}), s('tspan', {class: 'ss-ribn', text: String(n)}), s('tspan', {text: '번'})]);
  const label = '덩굴 감긴 돌 의자에 앉아 무릎 위 책에 적는 여인 · 내 매매일지 · ' + (say ?? '쌓인 기록 ' + n + '번') + ' · 한 달 뒤 칸 셋';
  return s('svg', {class: 'su-svg su-art4 su-stop-art ss-journal', viewBox: `0 0 ${W} ${H}`, role: 'img', 'aria-label': label, 'data-g': 'stop-art', preserveAspectRatio: 'xMidYMid meet'},
    defs(id),
    s('g', {'clip-path': `url(#${id}clip)`},
      sky(id),
      skyStars([[44, 170, 3.4, 1], [350, 176, 3, 0], [78, 120, 2.4, 0], [106, 92, 2.6, 1], [40, 470, 2.6, 0], [352, 462, 3, 1]]),
      s('g', {'data-mucha': 'stars', class: 'ss-stars'}, s('path', {d: crescent(318, 112, 18, 9, -3, 15.5), class: 'ss-moon'})),
      s('g', {transform: `translate(195 0) scale(${k}) translate(-195 0)`}, medallion(id),
        s('g', {'data-mucha': 'vine', class: 'ss-vine'}, vineCorner(30, 398, false), vineCorner(30, 398, true)), hair, body),
      rib,
      s('g', {'data-mucha': 'panel', class: 'ss-panels'}, xs.map((x, i) => recPanel(recs[i] ?? null, x, py, pw, ph))),
      mosaic()),
    frame(id), archText(id, '이 휴대폰에만 남는 기록'));
}

/** load 가 준 것으로 <svg viewBox="0 0 390 620"> 하나 — opt = {cur: 지금 질문 번호 1 ~ 11, done: 답한 수}(그림 ①) */
export function picture(d, opt = {}) {
  const id = 'ss' + (++SEQ) + '-';
  return d?.kind === 'journal' ? journalPic(d, id) : quizPic(d, opt ?? {}, id);
}
