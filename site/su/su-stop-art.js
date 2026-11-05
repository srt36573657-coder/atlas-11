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
function frame(id) {
  const dots = [];
  for (let k = 1; k < 26; k++) { const a = Math.PI + k * Math.PI / 26; dots.push(s('circle', {cx: f1(195 + 181 * Math.cos(a)), cy: f1(124 + 110 * Math.sin(a)), r: k % 2 ? 1.9 : 1.2, class: 'ss-adot'})); }
  for (let y = 142; y < 596; y += 22) dots.push(s('circle', {cx: 14, cy: y, r: 1.6, class: 'ss-adot'}), s('circle', {cx: 376, cy: y, r: 1.6, class: 'ss-adot'}));
  return s('g', {'data-mucha': 'arch', class: 'ss-arch'},
    s('path', {d: OUT + ' ' + INN, 'fill-rule': 'evenodd', fill: `url(#${id}au)`, class: 'ss-band'}),
    s('path', {d: OUT, class: 'ss-edge'}), s('path', {d: INN, class: 'ss-edge2'}), dots);
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

/* ── ① 「왜 사?」 여인 — 서서 모래시계를 받침 · S자(고개는 오른쪽으로 기욺 · 가슴 오른쪽 · 엉덩이 왼쪽 · 발목 오른쪽) ── */
const QW = {
  /* 넷째 판 — 원뿔 옷 → 허리 잘록 · 골반 둥글게(오른쪽으로 뺀 S) · 치맛자락은 왼쪽으로 흐르다 발치에서 말려 받침을 덮음 */
  gown: 'M 186 138 C 176 141 168 145 166 152 C 162 166 162 184 166 200 C 169 218 176 236 178 252 C 179 268 171 286 170 306 C 169 328 172 352 173 378 C 174 408 172 440 170 470 C 168 490 158 504 142 512 C 126 519 106 516 94 504 C 88 498 82 500 84 508 C 88 524 98 534 112 540 C 122 545 130 542 140 548 C 160 544 178 552 198 548 C 216 544 230 551 246 544 C 258 540 264 534 264 527 C 264 515 252 507 242 499 C 232 486 227 468 227 448 C 227 420 231 392 234 368 C 237 346 245 330 244 310 C 243 290 229 272 222 254 C 220 240 226 222 230 206 C 234 190 236 166 232 154 C 228 146 220 141 210 138 C 202 137 194 137 186 138 Z',
  pool: 'M 120 538 C 124 528 158 523 200 523 C 242 523 276 528 282 538 C 278 550 244 557 200 557 C 156 557 124 550 120 538 Z',
  sash: 'M 175 251 C 190 259 208 259 224 251 C 225 257 224 264 222 270 C 208 278 190 278 176 271 C 175 264 174 258 175 251 Z',
  knot: 'M 181 257 C 187 253 195 255 195 263 C 195 271 187 274 181 270 C 177 266 177 261 181 257 Z',
  sleeveL: 'M 167 150 C 158 160 156 182 159 204 C 161 220 166 232 178 240 C 186 244 192 244 194 238 C 194 232 188 228 182 226 C 175 222 173 210 173 196 C 173 178 176 160 167 150 Z',
  dropL: 'M 161 208 C 158 228 156 248 151 264 C 148 272 151 277 157 274 C 168 268 178 256 186 244 C 176 240 166 228 161 208 Z',
  handL: 'M 184 238 C 190 244 202 246 212 240 C 216 236 212 232 206 234 C 200 236 192 236 188 232 C 184 232 182 235 184 238 Z',
  sleeveR: 'M 228 150 C 235 160 235 180 232 196 C 230 208 226 214 220 210 C 214 206 214 196 216 186 C 218 178 220 170 218 164 C 222 158 226 154 228 150 Z',
  dropR: 'M 228 200 C 232 220 236 240 240 258 C 242 266 238 270 233 266 C 225 254 219 236 218 212 C 222 210 226 206 228 200 Z',
  handR: 'M 216 162 C 218 156 226 154 229 159 C 232 165 229 173 223 175 C 219 175 216 170 216 162 Z',
  collar: 'M 185 134 C 194 141 204 141 211 134 C 212 137 212 140 211 143 C 204 149 194 149 185 143 C 184 140 184 137 185 134 Z',
  /* 주름은 몸을 따라 휨 — 허리에서 골반을 감아 내려가 왼쪽 치맛자락 말림으로 모임 */
  folds: [[[[186, 264], [181, 300], [180, 350], [180, 400], [177, 450], [168, 490], [146, 514], [120, 530]], 2.8],
    [[[200, 268], [204, 310], [202, 360], [199, 410], [196, 458], [186, 498], [160, 524], [130, 538]], 3],
    [[[214, 266], [228, 304], [224, 354], [218, 404], [214, 452], [210, 492], [192, 522], [164, 540]], 2.8],
    [[[234, 314], [234, 352], [229, 400], [228, 448], [236, 490], [250, 516]], 2.2],
    [[[192, 300], [190, 350], [190, 400], [186, 446]], 1.6], [[[210, 330], [210, 380], [206, 430]], 1.4],
    [[[176, 156], [172, 184], [176, 212]], 1.8], [[[226, 160], [224, 190], [218, 214]], 1.6], [[[160, 222], [158, 244], [154, 262]], 1.2],
    [[[150, 537], [190, 544], [232, 541], [258, 530]], 2]],
  tails: [[[184, 268], [170, 284], [154, 294], [140, 308], [134, 326]], [[192, 272], [199, 296], [193, 320], [200, 342]]],
};
/** 치맛자락 끝 말림 — 안으로 감기는 소용돌이(굵게 시작해 가늘게) */
function hemCurl(cx, cy, r0, a0, turn, dir) {
  const P = [];
  for (let i = 0; i <= 22; i++) { const u = i / 22, a = a0 + dir * u * turn * Math.PI, r = r0 * (1 - 0.72 * u); P.push([f1(cx + r * Math.cos(a)), f1(cy + r * Math.sin(a))]); }
  return T(P, 2.6, 0.4, 'ss-fold');
}
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
function quizWoman(id, done, total) {
  const Q = QW;
  // 머리 — 굵은 다발이 어깨 뒤에서 나와 달 후광 테두리를 따라 위로 돌아 끝이 말림 · 공용 머리(반측면)
  const rim = (a0, a1, R, n) => Array.from({length: n}, (_, i) => { const a = (a0 + (a1 - a0) * i / (n - 1)) * Math.PI / 180; return [f1(198 + R * Math.cos(a)), f1(92 + R * Math.sin(a))]; });
  const back = s('g', {'data-mucha': 'whiplash', class: 'ss-whip'},
    tress([[186, 70], [170, 78], [156, 92], ...rim(168, 124, 60, 4)], 7, 10, 3.6, 21, 0.9, 'ss-sway-l', 9),
    tress([[210, 70], [226, 78], [240, 92], ...rim(12, 56, 60, 4)], 7, 10, 3.6, 22, 0.9, 'ss-sway-r', 9),
    khair({cx: 198, cy: 96, h: 46, dir: 1, tone: 7, len: 2.6, seed: 5, view: 'three'}));
  const crown = s('g', {class: 'ss-crown'}, s('path', {d: crescent(198, 64, 6, 3, -1.4, 5), class: 'ss-gold'}),
    s('path', {d: star5(183, 70, 2.8, 1.2), class: 'ss-gold'}), s('path', {d: star5(213, 69, 2.8, 1.2), class: 'ss-gold'}));
  const body = s('g', {'data-mucha': 'outline', class: 'ss-woman ss-body'},
    part(Q.pool, 'ss-dais', 2.4, 0.5), s('path', {d: 'M 124 536 C 150 528 250 528 278 536', class: 'ss-dline'}),
    part(Q.gown, 'ss-gown', 4.2, 0.6),
    Q.folds.map(([p, w]) => T(p, w, 0.3, 'ss-fold')),
    part('M 94 504 C 88 498 82 500 84 508 C 88 518 96 524 106 524 C 106 516 100 509 94 504 Z', 'ss-gown2', 1.4, 0.4), hemCurl(92, 510, 6, Math.PI * 1.2, 1.3, -1),
    T([[172, 476], [158, 500], [130, 514], [100, 510]], 1.8, 0.3, 'ss-fold'), T([[178, 500], [160, 520], [126, 530], [104, 524]], 1.6, 0.3, 'ss-fold'),
    part(Q.sash, 'ss-sage', 2, 0.4),
    Q.tails.map(p => [T(p, 16.5, 11.5, 'ss-ink'), T(p, 14, 9, 'ss-sage'), T(p, 3, 0.6, 'ss-sage2')]),
    part(Q.knot, 'ss-sage2', 1.6, 0.4),
    kface({cx: 198, cy: 96, h: 46, dir: 1, view: 'three', tilt: 8, iris: 0}), crown,
    part(Q.collar, 'ss-gold2', 1.4, 0.4), s('circle', {cx: 198, cy: 146, r: 3.2, class: 'ss-gem'}),
    tress([[186, 112], [182, 140], [179, 166], [182, 190]], 3, 6, 2.6, 25, 0.8, 'ss-sway-l2'),
    tress([[211, 114], [218, 140], [222, 164]], 2, 5, 2.4, 26, 0.8, 'ss-sway-r2'),
    part(Q.dropL, 'ss-gown2', 2.2, 0.4), part(Q.sleeveL, 'ss-gown', 2.8, 0.5), T([[162, 176], [164, 198], [169, 214], [177, 228]], 1.4, 0.3, 'ss-fold'),
    part(Q.dropR, 'ss-gown2', 2.2, 0.4), part(Q.sleeveR, 'ss-gown', 2.6, 0.5),
    hourglass(id, done, total, 199, 176, 234),
    part(Q.handL, 'ss-skin', 1.6, 0.4), part(Q.handR, 'ss-skin', 1.4, 0.4),
    [[[224, 163], [217, 163], [210, 166], [206, 170]], [[225, 167], [218, 168], [211, 171], [207, 175]], [[224, 171], [218, 173], [212, 176]]] // 위 접시를 감싸는 가늘고 긴 손가락
      .map(p => [T(p, 3.6, 2.2, 'ss-ink'), T(p, 2.6, 1.4, 'ss-skin')]));
  return [back, body];
}

/* ── ① 별자리 이름표 — 둥근 크림 판(가는 금 겹선 · 말림 없음) · 바깥 끝에 작은 금 메달 · 금테 안쪽으로 20 들임 · 몸에서 떼어 둠 ── */
const LX = 54, RX = 336;
/** [쪽, 높이, 판 안쪽 끝 한계(왼쪽 = 오른끝 최대 · 오른쪽 = 왼끝 최소)] — 몸 윤곽에서 10 넘게 뗌 */
const QPOS = {1: ['L', 176, 150], 2: ['L', 220, 146], 3: ['L', 270, 138], 4: ['R', 176, 248], 9: ['R', 230, 252], 11: ['R', 286, 258],
  5: ['L', 404, 160], 6: ['L', 452, 154], 7: ['R', 396, 244], 8: ['R', 438, 240], 10: ['R', 474, 242]};
const GPOS = {이유: ['L', 152], 돈: ['R', 141], 때: ['L', 376], 마음: ['R', 354]};
/** 한 줄이 넘치면 두 줄 — 띄어쓰기에서, 없으면 가운데 글자에서(물음표는 뒷줄) */
function wrap2(t, max) {
  if (tw(t, 18) <= max) return [t];
  const sp = t.indexOf(' ');
  if (sp > 0) return [t.slice(0, sp), t.slice(sp + 1)];
  const ch = [...t], k = Math.ceil((ch.length - (ch[ch.length - 1] === '?' ? 1 : 0)) / 2);
  return [ch.slice(0, k).join(''), ch.slice(k).join('')];
}
function qLabel(q, t, side, y, state, lim) {
  const isL = side === 'L', sx = isL ? LX : RX, tx = f1(isL ? sx + 21 : sx - 21), max = isL ? lim - 10 - tx : tx - 10 - lim;
  const lines = wrap2(t, max), w0 = Math.max(...lines.map(L => tw(L, 18))), h = lines.length > 1 ? 50 : 32;
  const x0 = isL ? sx - 6 : f1(tx - w0 - 11), x1 = isL ? f1(tx + w0 + 11) : sx + 6, r = h / 2;
  const pill = (i) => `M ${f1(x0 + r)} ${f1(y - r + i)} L ${f1(x1 - r)} ${f1(y - r + i)} A ${r - i} ${r - i} 0 0 1 ${f1(x1 - r)} ${f1(y + r - i)} L ${f1(x0 + r)} ${f1(y + r - i)} A ${r - i} ${r - i} 0 0 1 ${f1(x0 + r)} ${f1(y - r + i)} Z`;
  return s('g', {class: 'ss-lab' + (state === 'cur' ? ' ss-lab-cur' : state === 'on' ? ' ss-lab-on' : '')},
    state === 'cur' ? s('g', {transform: `translate(${sx} ${y})`}, s('circle', {r: 19, class: 'ss-ring ss-pulse'})) : null,
    s('path', {d: pill(0), class: 'ss-pill'}), s('path', {d: pill(0), class: 'ss-pill-l'}), s('path', {d: pill(3), class: 'ss-pill-l2'}),
    lines.map((L, i) => s('text', {x: tx, y: f1(y + 6.5 - (lines.length - 1) * 10.5 + i * 21), 'text-anchor': isL ? 'start' : 'end', class: 'ss-q', text: L})),
    s('circle', {cx: sx, cy: y, r: 14.5, class: 'ss-md'}), s('circle', {cx: sx, cy: y, r: 11.5, class: state === 'cur' ? 'ss-md-cur' : state === 'on' ? 'ss-md-on' : 'ss-md-off'}),
    s('text', {x: sx, y: y + 6.3, 'text-anchor': 'middle', class: 'ss-num', text: String(q)}));
}
function route(groups, qs, cur, done) {
  const roads = [], labs = [], names = [];
  groups.forEach(([name, list]) => {
    const g = GPOS[name] ?? ['L', 356], pts = [];
    names.push(s('g', {class: 'ss-gn'}, s('path', {d: spark(g[0] === 'L' ? LX : RX, g[1] - 6, 6), class: 'ss-sp'}),
      s('text', {x: g[0] === 'L' ? LX + 12 : RX - 12, y: g[1], 'text-anchor': g[0] === 'L' ? 'start' : 'end', class: 'ss-gname', text: name})));
    list.forEach(q => {
      const p = QPOS[q]; if (!p) return;
      const t = typeof qs[q - 1] === 'string' ? qs[q - 1] : NEED;
      pts.push([p[0] === 'L' ? LX : RX, p[1], q]);
      labs.push(qLabel(q, t, p[0], p[1], q === cur ? 'cur' : q <= done ? 'on' : 'off', p[2]));
    });
    for (let i = 1; i < pts.length; i++) {
      const [x1, y1, a] = pts[i - 1], [x2, y2, b] = pts[i], bend = x1 < 195 ? -9 : 9;
      roads.push(s('path', {d: `M ${x1} ${y1} C ${x1 + bend} ${f1(y1 + (y2 - y1) * 0.4)} ${x2 + bend} ${f1(y2 - (y2 - y1) * 0.4)} ${x2} ${y2}`, class: a <= done && b <= done ? 'ss-road ss-road-on' : 'ss-road'}));
    }
  });
  // 위 묶음과 아래 묶음을 판 가장자리로 잇는 별길(몸 바깥)
  roads.push(s('path', {d: `M ${LX} 294 C ${LX - 8} 320 ${LX - 8} 360 ${LX} 388`, class: 'ss-road'}), s('path', {d: `M ${RX} 310 C ${RX + 8} 334 ${RX + 8} 362 ${RX} 384`, class: 'ss-road'}));
  return s('g', {class: 'ss-route', 'aria-hidden': 'true'}, roads, names, labs);
}
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
  const [hair, body] = quizWoman(id, done, n);
  const label = qs && groups ? '보름달 아래 모래시계를 받친 여인과 열한 질문 별자리 · ' + (cur ? '지금 ' + cur + '번째 질문 · ' : '') + '답한 별 ' + done + '개' : '열한 질문 별자리 · ' + NEED;
  return s('svg', {class: 'su-svg su-art4 su-stop-art ss-quiz', viewBox: `0 0 ${W} ${H}`, role: 'img', 'aria-label': label, 'data-g': 'stop-art', preserveAspectRatio: 'xMidYMid meet'},
    defs(id),
    s('g', {'clip-path': `url(#${id}clip)`},
      sky(id), sunset(484),
      skyStars([[70, 118, 3, 0], [322, 114, 3, 1], [116, 152, 2.6, 1], [282, 152, 2.4, 0], [92, 326, 3, 1], [302, 332, 2.8, 0], [116, 364, 2.4, 0], [268, 362, 2.6, 1], [64, 304, 2.4, 0], [330, 344, 2.4, 1]]),
      s('g', {'data-mucha': 'halo', class: 'ss-halo'},
        s('circle', {cx: 198, cy: 92, r: 80, class: 'ss-hring3'}), s('circle', {cx: 198, cy: 92, r: 72, fill: `url(#${id}moon)`, class: 'ss-hdisk'}),
        s('path', {d: crescent(198, 92, 72, 30, -6, 66), class: 'ss-moon'}),
        s('circle', {cx: 198, cy: 92, r: 72, class: 'ss-hring'}), s('circle', {cx: 198, cy: 92, r: 60, class: 'ss-hring2'})),
      hair, body,
      s('g', {'data-mucha': 'vine', class: 'ss-vine'}, vineCorner(24, 548, false), vineCorner(24, 548, true)),
      qs && groups ? route(groups, qs, cur, done) : qLabel(0, NEED, 'L', 386, 'cur', 160),
      band('사기 전에 한 번 멈춰요', [[44, 580], [120, 572], [195, 569], [270, 572], [346, 580]], 32, 'ss-plqt'), mosaic()),
    frame(id));
}

/* ── ② 「내 매매일지」 여인 — 돌 의자에 앉아 무릎 위 책에 깃펜으로 적음 · 한 손은 어깨 위 머리를 가볍게 댐 · 한 벌 장밋빛 옷 ── */
const JW = {
  torso: 'M 160 197 C 150 199 142 205 139 215 C 135 230 138 246 144 258 C 148 266 152 272 156 278 L 226 282 C 224 268 223 255 221 242 C 219 228 215 218 208 211 C 200 203 186 198 176 196 C 170 195 165 196 160 197 Z',
  /* 넷째 판 — 무릎 · 정강이 곡선이 드러나는 치마(무릎에서 발치까지) · 뒤쪽 자락은 돌 의자 위로 넘쳐 늘어짐 */
  skirt: 'M 154 268 C 136 272 118 278 104 285 C 94 290 88 297 89 306 C 91 322 90 344 87 362 C 85 375 82 386 78 394 C 74 399 73 403 78 405 C 104 408 146 407 176 405 C 186 404 194 403 199 400 C 201 390 202 380 204 368 C 208 378 216 380 222 375 C 226 382 236 382 240 373 C 246 370 249 362 250 352 C 252 336 250 320 246 308 C 242 296 236 286 228 280 C 204 272 178 268 154 268 Z',
  shoe: 'M 79 401 C 69 401 63 405 66 408 C 73 410 85 409 91 405 Z',
  seat: 'M 188 312 C 188 306 194 303 202 303 L 296 303 C 304 303 309 307 309 313 L 309 320 C 309 325 305 327 299 327 L 198 327 C 192 327 188 325 188 320 Z',
  base: 'M 200 327 L 297 327 C 296 350 296 372 299 392 L 198 392 C 201 372 201 350 200 327 Z',
  armQ: 'M 156 203 C 143 206 135 220 133 236 C 132 246 130 254 126 260 C 122 265 118 268 114 270 L 124 280 C 130 276 137 270 142 264 C 148 256 152 248 156 238 C 159 228 160 216 160 208 C 159 205 158 204 156 203 Z',
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
  const fing = (pts, w) => [T(pts.map(([u, v]) => Q(u, v)), w + 1.3, w * 0.55 + 1, 'ss-ink'), T(pts.map(([u, v]) => Q(u, v)), w, w * 0.55, 'ss-skin')];
  const palm = [[2, -5.2], [7, -5.6], [11, -4.4], [12, 0], [10.5, 4.4], [6, 5.4], [2, 4.6]].map(([u, v]) => Q(u, v));
  const pd = 'M ' + palm[0].join(' ') + ' ' + palm.map((p, i) => { const q = palm[(i + 1) % palm.length]; return 'C ' + p.join(' ') + ' ' + q.join(' ') + ' ' + q.join(' '); }).join(' ') + ' Z';
  return [fing([[8, 4], [12, 5.4], [15, 4.6], [16.6, 3]], 2.3), fing([[9, 1.6], [13.6, 2.6], [17.2, 1.6], [18.8, 0]], 2.4),
    part(pd, 'ss-skin', 1.6, 0.4),
    fing([[10, -3.4], [15, -3.6], [19.6, -2.6], [22, -1.4]], 2.4), fing([[4, -5], [9, -6.6], [13.4, -6.2], [15.6, -4.6]], 2.6)];
}
function journalWoman() {
  const J = JW;
  // 머리채 — 등 뒤로 흘러 후광 오른쪽 아래를 감싸는 다발 · 정수리에서 후광 둘레로 두 다발(공용 strands 2판 굵은 다발)
  const hair = s('g', {'data-mucha': 'whiplash', class: 'ss-whip ss-body'},
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
    part(J.torso, 'ss-rose', 3.4, 0.6),
    part(J.skirt, 'ss-rose', 3.6, 0.6), J.folds.map(([p, w]) => T(p, w, 0.3, 'ss-fold3')),
    part(J.shoe, 'ss-shoe', 1.2, 0.4),
    T([[76, 404], [130, 407], [176, 405], [198, 401]], 2.2, 0.8, 'ss-gold'),
    line('M 150 266 C 172 274 198 278 222 274', 3.4, 'ss-gold', 1.6, true), s('circle', {cx: 186, cy: 276, r: 3.4, class: 'ss-gem'}),
    kface({cx: 172, cy: 164, h: 44, dir: -1, view: 'three', tilt: 12, iris: 1}), wreath,
    part(J.collar, 'ss-gold2', 1.3, 0.4),
    tress([[184, 170], [196, 192], [204, 216], [210, 242]], 3, 6, 3, 34, 0.8, 'ss-sway-r2'),
    part(J.armR, 'ss-rose', 2, 0.5),
    sleeve({x: 224, y: 258, ang: 156, len: 36, w: 15, hand: 'touch', dir: 1, tone: 'rose'}),
    part(J.book, 'ss-page', 2.2, 0.5), line('M 140 278 C 140 284 140 289 140 294', 1, 'ss-ink', 0.6),
    [0, 1, 2].map(k => line(`M 106 ${282 + k * 4} C 114 ${278 + k * 4} 126 ${278 + k * 4} 135 ${282 + k * 4}`, 0.9, 'ss-bl', 0.4)),
    [0, 1, 2].map(k => line(`M 145 ${282 + k * 4} C 154 ${278 + k * 4} 166 ${278 + k * 4} 175 ${282 + k * 4}`, 0.9, 'ss-bl', 0.4)),
    // 깃펜 — 펜촉은 왼쪽 장 위 · 깃은 손 위로 비스듬히
    s('path', {d: 'M 104 288 C 98 272 92 256 86 238 C 82 228 80 222 80 216 C 86 222 94 234 100 250 C 104 262 106 274 106 286 Z', class: 'ss-feather'}),
    line('M 105 290 C 99 270 92 248 81 218', 1.3, 'ss-ink', 0.4),
    [0, 1, 2, 3].map(k => line(`M ${f1(100 - k * 4)} ${f1(266 - k * 12)} C ${f1(97 - k * 4)} ${f1(262 - k * 12)} ${f1(95 - k * 4)} ${f1(258 - k * 12)} ${f1(94 - k * 4)} ${f1(254 - k * 12)}`, 0.7, 'ss-ink', 0.2)),
    // 깃펜 쥔 팔 — 어깨 · 소매 · 손목이 한 선 · 손목 덮는 주름 소매 · 손가락이 보임
    part(J.armQ, 'ss-rose', 2.6, 0.5), T([[152, 214], [144, 232], [139, 250], [130, 266]], 1.3, 0.3, 'ss-fold3'),
    penHand(117, 277, -0.68, 0.74), ruffle(119, 275, -0.68, 0.74));
  return [hair, body];
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
