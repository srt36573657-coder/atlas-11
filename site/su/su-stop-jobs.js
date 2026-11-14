/* 큐피트 — 「멈춤」 탭 큰 그림 둘 · 잡스 판(주문 2011 · 사장님 2026-11-08 20:11 「제 처음부터 끝까지 모든 페이지를 첫페이지 기준으로 모두 변경해」)
   옛 무하 판(su-stop-art.js — 보름달 여인 · 돌 의자 여인 · 아치 틀)을 덜어 내고 첫 페이지 잡스 판(su-apple.js)과 같은 말투로 새로 그림
   ① 「왜 사?」(#/q) — 흰 바탕에 열한 구슬이 말굽 꼴로 둘러섬 · 답한 구슬은 호박빛으로 켜짐 · 지금 구슬은 크게(아직이면 속에 불씨)
      가운데 큰 숫자 「N번째 질문」과 그 질문(WHY_QS 글자 그대로) · 아래로 답한 질문 | 남은 질문 두 칸 · 네 묶음(WHY_GROUPS 차례 그대로) 한 줄
      opt = {cur: 지금 질문 1 ~ 11, done: 답한 수}(su-why.js 가 누를 때마다 다시 그림 · 끝에는 cur = done = 11 → 모두 켜짐)
   ② 「내 매매일지」(#/j) — 호박빛 구슬(답한 날)에서 유리 구슬(한 달 뒤)로 · 쌓인 기록 | 돌아볼 기록 두 칸
      새 기록 세 줄마다 한 달 줄(호박색 점 → 지난 날만큼 차오르는 선 → 유리 구슬 · 정한 대로 했으면 구슬이 켜짐)
      자료 = 옛 부품과 같은 셈(이 휴대폰의 「왜 사?」 기록 readWhy · fullWhy · 장 스무 번 /atlas/data/days.json · 달력 서른 날)
   덜어 냄: 사람 그림 · 아치 · 덩굴 · 꽃 · 금 테 · 별 · 흐림 필터 0 · 아무 수 0 · 눈에 띄는 색은 호박색 하나
   그리기: s() 만(createElementNS · setAttribute) · 색 · 움직임은 su-stop-jobs.css(들어올 때 한 번 · 숨 쉬는 빛 하나 · 움직임 줄이기면 끝 모습) */
import {WHY_QS, WHY_GROUPS, WHY_V, readWhy, fullWhy, seoulDay} from '/su/su-why.js';
import {s} from '/su/su-fig.js';

export const CSS = '/su/su-stop-jobs.css';

const W = 390, MID = W / 2, NEED = '확인 필요';
const DAY = 864e5, LATER = 20; // 한 달 = 장 스무 번 또는 달력 서른 날(su-why.js 와 같은 셈)
let UID = 0;
const f1 = v => Math.round(v * 10) / 10;
const MIDA = {'text-anchor': 'middle'};
const T = (x, y, text, cls, extra = {}) => s('text', {x: f1(x), y: f1(y), class: cls, ...extra, text});
/** 글 넓이 어림(굵은 글 · su-apple.js 와 같은 셈) */
function est(t, px) {
  let w = 0;
  for (const ch of String(t)) {
    if (/[ᄀ-ᇿ㄰-㆏가-힯]/.test(ch)) w += 0.94;
    else if (/[A-Z&]/.test(ch)) w += 0.7;
    else if (/[a-z]/.test(ch)) w += 0.56;
    else if (/[0-9+−-]/.test(ch)) w += 0.62;
    else if (/[ .,·]/.test(ch)) w += 0.3;
    else w += 0.8;
  }
  return w * px;
}
/** 날짜 「2026-11-08」 → 「11월 8일」 */
const dKo = d => { const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(d ?? '')); return m ? `${+m[2]}월 ${+m[3]}일` : NEED; };

/* ── 자료 받기(옛 부품 su-stop-art.js 와 같은 셈 · 같은 꼴) ── */
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

/* ── 구슬 빛(첫 페이지 su-apple 과 같은 그러데이션 · 밝기 차만으로 빛남 · 흐림 필터 없음) ── */
function defs(id) {
  const rg = (k, stops, at = {}) => s('radialGradient', {id: id + k, ...at}, stops.map(([o, c]) => s('stop', {offset: o, class: c})));
  return s('defs', {},
    rg('h', [[0, 'ssj-hl0'], [0.4, 'ssj-hl1'], [0.72, 'ssj-hl2'], [1, 'ssj-hl3']]),
    rg('b', [[0, 'ssj-b0'], [0.2, 'ssj-b1'], [0.46, 'ssj-b2'], [0.7, 'ssj-b3'], [0.88, 'ssj-b4'], [1, 'ssj-b5']], {cx: '44%', cy: '40%', r: '64%', fx: '40%', fy: '34%'}),
    rg('c', [[0, 'ssj-c0'], [0.5, 'ssj-c1'], [1, 'ssj-c2']]),
    rg('s', [[0, 'ssj-s0'], [0.6, 'ssj-s1'], [1, 'ssj-s2']]),
    rg('g', [[0, 'ssj-g0'], [0.55, 'ssj-g1'], [0.8, 'ssj-g2'], [0.94, 'ssj-g3'], [1, 'ssj-g4']], {cx: '48%', cy: '44%', r: '56%'}),
    rg('e', [[0, 'ssj-e0'], [0.5, 'ssj-e1'], [1, 'ssj-e2']]),
    rg('k', [[0, 'ssj-k0'], [0.3, 'ssj-k1'], [0.7, 'ssj-k2'], [1, 'ssj-k3']]),
    rg('d', [[0, 'ssj-d0'], [0.6, 'ssj-d1'], [1, 'ssj-d2']]),
    rg('p', [[0, 'ssj-p0'], [0.55, 'ssj-p1'], [1, 'ssj-p2']]),
    s('linearGradient', {id: id + 'w', x1: 0, y1: 0, x2: 1, y2: 0}, s('stop', {offset: 0, class: 'ssj-w0'}), s('stop', {offset: 0.45, class: 'ssj-w1'}), s('stop', {offset: 1, class: 'ssj-w2'})));
}
const U = (id, k) => `url(#${id}${k})`;
/** 작은 구슬 — lit = 호박빛(답함 · 정한 대로 함) · 아니면 맑은 유리 · ember = 속 불씨(지금 묻는 중 · 한 달 됨) · wash = 유리 속 따뜻한 빛(자를 테 이름 · 큰 구슬만) */
function bead(id, x, y, r, {lit = false, ember = false, cls = '', wash = null} = {}) {
  const sx = f1(x - r * 0.39), sy = f1(y - r * 0.5), ey = f1(y + r * 0.15);
  return s('g', {class: 'ssj-bead' + (cls ? ' ' + cls : '')},
    s('circle', {cx: x, cy: y, r, fill: U(id, lit ? 'b' : 'g')}),
    wash && !lit ? [s('defs', {}, s('clipPath', {id: id + wash}, s('circle', {cx: x, cy: y, r}))),
      s('rect', {x: f1(x - r), y: f1(y - r), width: 2 * r, height: 2 * r, fill: U(id, 'w'), 'clip-path': U(id, wash)})] : null,
    ember ? [s('circle', {cx: x, cy: ey, r: f1(r * (wash ? 0.74 : 0.68)), fill: U(id, 'e')}), s('circle', {cx: x, cy: ey, r: f1(r * (wash ? 0.28 : 0.25)), fill: U(id, 'k')})] : null,
    s('ellipse', {cx: sx, cy: sy, rx: f1(r * 0.34), ry: f1(r * 0.14), transform: `rotate(-38 ${sx} ${sy})`, fill: U(id, 's')}),
    s('circle', {cx: x, cy: y, r: f1(r - 0.6), class: lit ? 'ssj-rimA' : 'ssj-rimB'}));
}
/** 작은 표 점 — A = 호박색 찬 점 · B = 고리 점(속 호박색) · O = 빈 고리 */
function mark(x, y, kind) {
  if (kind === 'A') return s('circle', {cx: f1(x), cy: f1(y), r: 7, class: 'ssj-dotA'});
  return s('g', {}, s('circle', {cx: f1(x), cy: f1(y), r: 6.5, class: 'ssj-dotB'}), kind === 'B' ? s('circle', {cx: f1(x), cy: f1(y), r: 2.6, class: 'ssj-dotBc'}) : null);
}
/** 표 점 + 이름(가운데 맞춤) */
function keyLabel(cx, y, kind, text, cls = 'ssj-k', px = 21) {
  const x0 = cx - (14 + 8 + est(text, px)) / 2;
  return s('g', {}, mark(x0 + 7, y - 7, kind), T(x0 + 22, y, text, cls));
}
/** 큰 숫자 + 단위(한 글 줄 · 가운데 맞춤) — 값이 없으면 「확인 필요」 */
function numText(cx, y, v, unit, cls = 'ssj-n') {
  if (!(typeof v === 'number' && Number.isFinite(v))) return T(cx, y - 12, NEED, 'ssj-k', MIDA);
  return s('text', {x: f1(cx), y: f1(y), class: cls, ...MIDA}, s('tspan', {text: String(v)}), s('tspan', {class: 'ssj-unit', dx: 5, text: unit}));
}

/* ── ① 「왜 사?」 — 열한 구슬 말굽 ── */
const QH = 660;
function quizPic(d, opt, id) {
  const qs = Array.isArray(d?.qs) && d.qs.length ? d.qs : null, groups = Array.isArray(d?.groups) && d.groups.length ? d.groups : null;
  const n = qs ? qs.length : 11, done = Number.isInteger(opt.done) ? Math.max(0, Math.min(n, opt.done)) : 0;
  const all = done >= n, cur = !all && Number.isInteger(opt.cur) && opt.cur >= 1 && opt.cur <= n ? opt.cur : null;
  const label = '열한 질문 구슬 · ' + (all ? '모두 답했어요 · ' : cur ? '지금 ' + cur + '번째 질문 · ' : '') + '답한 질문 ' + done + '개 · 남은 질문 ' + (n - done) + '개' + (qs ? '' : ' · 질문 ' + NEED);
  const svg = s('svg', {class: 'su-svg su-stop-jobs ssj-quiz', viewBox: `0 0 ${W} ${QH}`, role: 'img', preserveAspectRatio: 'xMidYMid meet', 'data-clean': 'jobs', 'data-cur': cur ?? '', 'data-done': done, 'aria-label': label});
  svg.append(defs(id), s('rect', {x: 0, y: 0, width: W, height: QH, class: 'ssj-bg'}));
  /* 1 한 문장 */
  svg.append(s('g', {class: 'ssj-in ssj-in1'}, T(MID, 42, '사기 전에 한 번 멈춰요.', 'ssj-sub', MIDA), T(MID, 70, '열한 가지를 차례로 물어요.', 'ssj-sub', MIDA)));
  /* 2 물건 하나 — 열한 구슬이 말굽 꼴(아래 왼쪽 1번에서 위로 돌아 아래 오른쪽 11번) */
  const C = {x: MID, y: 262}, R = 132, RL = 166, ang = k => (210 - (n > 1 ? (240 * k) / (n - 1) : 0)) * Math.PI / 180;
  const dial = s('g', {class: 'ssj-dial', 'aria-hidden': 'true'});
  if (!cur) dial.append(s('circle', {cx: C.x, cy: C.y + 14, r: 112, fill: U(id, 'h'), class: 'ssj-glow ssj-breathe'})); // 지금 구슬이 없으면 가운데 빛이 숨 쉼
  const beads = [], nums = [];
  for (let k = 0; k < n; k++) {
    const q = k + 1, a = ang(k), x = f1(C.x + R * Math.cos(a)), y = f1(C.y - R * Math.sin(a)), on = q <= done;
    if (q === cur) {
      dial.append(s('circle', {cx: x, cy: y, r: 52, fill: U(id, 'h'), class: 'ssj-halo ssj-breathe'})); // 지금 구슬 둘레 빛(숨 쉼)
      beads.push(s('circle', {cx: x, cy: y, r: 31, class: 'ssj-ring'}), bead(id, x, y, 25, {lit: on, ember: !on, cls: 'ssj-pop ssj-cur', wash: 'cq'}));
    } else {
      beads.push(bead(id, x, y, 16, {lit: on, cls: q === done ? 'ssj-pop' : ''}));
      nums.push(T(C.x + RL * Math.cos(a), C.y - RL * Math.sin(a) + 6.5, String(q), on ? 'ssj-num ssj-num-on' : 'ssj-num', MIDA));
    }
  }
  dial.append(...beads, ...nums);
  /* 가운데 — 지금 질문(묶음 · 큰 번호 · 질문 글) · 모두 답했으면 답한 수 */
  const grp = cur && groups ? groups.find(([, l]) => Array.isArray(l) && l.includes(cur)) : null;
  const top = cur ? (grp ? grp[0] + ' 묶음' : NEED) : '답한 질문';
  const line = cur ? (qs && typeof qs[cur - 1] === 'string' ? qs[cur - 1] : NEED) : all ? '모두 답했어요' : '아직 다 답하지 않았어요'; // 「답한 질문 · 3 / 11」 아래 — 끊긴 말 없이 한 문장
  const center = s('g', {class: 'ssj-in ssj-in2'},
    T(MID, 214, top, 'ssj-d', MIDA),
    cur ? numText(MID, 282, cur, '번째 질문', 'ssj-big') : numText(MID, 282, done, '/ ' + n, 'ssj-big'),
    T(MID, 322, line, 'ssj-q', MIDA));
  svg.append(dial, center);
  /* 3 답한 질문 | 남은 질문 */
  const PY = 372;
  svg.append(s('g', {class: 'ssj-in ssj-in3'},
    s('path', {d: `M${MID} ${PY + 6}V${PY + 126}`, class: 'ssj-div'}),
    keyLabel(98, PY + 29, 'A', '답한 질문'), numText(98, PY + 92, done, '개'), T(98, PY + 121, '켜진 구슬', 'ssj-d', MIDA),
    keyLabel(292, PY + 29, 'O', '남은 질문'), numText(292, PY + 92, n - done, '개'), T(292, PY + 121, '유리 구슬', 'ssj-d', MIDA)));
  /* 4 네 묶음 — 가는 선으로 나눈 칸 넷(다 답한 묶음 = 찬 점 · 답하는 중 = 고리 점 · 아직 = 빈 고리) */
  const GY = 518, gs = s('g', {class: 'ssj-in ssj-in4'}, s('path', {d: `M20 ${GY}H370`, class: 'ssj-line'}));
  if (groups) {
    const cw = 350 / groups.length;
    groups.forEach(([name, list], i) => {
      const L = Array.isArray(list) ? list : [], cx = 20 + cw * (i + 0.5);
      const full = L.length > 0 && L.every(q => q <= done), part = !full && L.some(q => q <= done || q === cur);
      if (i) gs.append(s('path', {d: `M${f1(20 + cw * i)} ${GY + 18}V${GY + 80}`, class: 'ssj-line'}));
      gs.append(keyLabel(cx, GY + 41, full ? 'A' : part ? 'B' : 'O', String(name), 'ssj-gname'), T(cx, GY + 71, L.join('·') + '번', 'ssj-gq', MIDA));
    });
  } else gs.append(T(MID, GY + 52, '네 묶음 ' + NEED, 'ssj-d', MIDA));
  svg.append(gs, s('g', {class: 'ssj-in ssj-in4'}, T(MID, 638, '맞히는 시험이 아니에요.', 'ssj-d', MIDA)));
  return svg;
}

/* ── ② 「내 매매일지」 — 답한 날(호박빛 구슬) → 한 달 뒤(유리 구슬) ── */
const JH = 690;
/** 구슬 둘(첫 페이지 구슬 둘을 줄인 꼴) — 호박빛 = 답한 날 · 속에서 불이 오르는 유리 구슬 = 한 달 뒤 · 사이에 점선 활 「한 달」 */
function orbs(id) {
  const A = {x: 108, y: 172, r: 58}, B = {x: 286, y: 190, r: 40}, FL = 232, ka = A.r / 84, kb = B.r / 54;
  const sc = (o, k, v) => f1(o + v * k);
  const orbA = s('g', {class: 'ssj-orb ssj-orbA'},
    s('circle', {cx: A.x, cy: A.y, r: A.r, fill: U(id, 'b')}),
    s('g', {'clip-path': U(id, 'ca')}, s('circle', {cx: sc(A.x, ka, -12), cy: sc(A.y, ka, -20), r: f1(46 * ka), fill: U(id, 'c')}), s('ellipse', {cx: A.x, cy: sc(A.y, ka, 62), rx: f1(60 * ka), ry: f1(18 * ka), class: 'ssj-under'})),
    s('ellipse', {cx: sc(A.x, ka, -33), cy: sc(A.y, ka, -46), rx: f1(27 * ka), ry: f1(11 * ka), transform: `rotate(-38 ${sc(A.x, ka, -33)} ${sc(A.y, ka, -46)})`, fill: U(id, 's')}),
    s('circle', {cx: sc(A.x, ka, -45), cy: sc(A.y, ka, -26), r: f1(3.2 * ka), class: 'ssj-glint'}),
    s('circle', {cx: A.x, cy: A.y, r: f1(A.r - 0.7), class: 'ssj-rimA'}));
  const orbB = s('g', {class: 'ssj-orb ssj-orbB'},
    s('circle', {cx: B.x, cy: B.y, r: B.r, fill: U(id, 'g')}),
    s('g', {'clip-path': U(id, 'cb')},
      s('rect', {x: B.x - B.r, y: B.y - B.r, width: B.r * 2, height: B.r * 2, fill: U(id, 'w')}),
      s('ellipse', {cx: B.x, cy: sc(B.y, kb, 38), rx: f1(36 * kb), ry: f1(9 * kb), class: 'ssj-underB'}),
      s('g', {class: 'ssj-ember ssj-breathe'}, s('circle', {cx: B.x, cy: sc(B.y, kb, 8), r: f1(38 * kb), fill: U(id, 'e')}), s('circle', {cx: B.x, cy: sc(B.y, kb, 8), r: f1(13 * kb), fill: U(id, 'k')}))),
    s('ellipse', {cx: sc(B.x, kb, -22), cy: sc(B.y, kb, -26), rx: f1(17 * kb), ry: f1(7 * kb), transform: `rotate(-36 ${sc(B.x, kb, -22)} ${sc(B.y, kb, -26)})`, fill: U(id, 's')}),
    s('circle', {cx: sc(B.x, kb, -31), cy: sc(B.y, kb, -11), r: f1(2.4 * kb), class: 'ssj-glint'}),
    s('circle', {cx: B.x, cy: B.y, r: f1(B.r - 0.6), class: 'ssj-rimB'}),
    s('path', {d: `M${sc(B.x, kb, 33)} ${sc(B.y, kb, -39)}A${f1(50 * kb)} ${f1(50 * kb)} 0 0 1 ${sc(B.x, kb, 45)} ${sc(B.y, kb, 18)}`, class: 'ssj-edge'}));
  return s('g', {class: 'ssj-orbs', 'aria-hidden': 'true'},
    s('defs', {}, s('clipPath', {id: id + 'ca'}, s('circle', {cx: A.x, cy: A.y, r: A.r})), s('clipPath', {id: id + 'cb'}, s('circle', {cx: B.x, cy: B.y, r: B.r}))),
    s('ellipse', {cx: A.x + 8, cy: FL + 2, rx: 104, ry: 14, fill: U(id, 'p')}),                       // 바닥에 번진 빛
    s('circle', {cx: A.x, cy: A.y, r: f1(122 * ka), fill: U(id, 'h'), class: 'ssj-halo0'}),           // 답한 날 구슬 둘레 빛
    s('ellipse', {cx: sc(B.x, kb, 17), cy: FL + 1, rx: f1(56 * kb), ry: f1(7.5 * kb), fill: U(id, 'd')}), s('ellipse', {cx: A.x, cy: FL, rx: f1(54 * ka), ry: f1(6 * ka), fill: U(id, 'd')}),
    s('circle', {cx: A.x, cy: A.y, r: f1(90 * ka), class: 'ssj-bloom'}),
    orbA, orbB,
    s('path', {d: `M${A.x + 50} 118Q${f1((A.x + B.x) / 2 + 6)} 80 ${B.x - 30} 146`, class: 'ssj-arc'}));                   // 한 달(점선 활 · 이름은 활 아래 두 구슬 사이)
}
/** 기록 한 줄 — 날짜 · 판정 · 한 달 뒤 글 + 한 달 줄(호박색 점 → 지난 날만큼 차오르는 선 → 유리 구슬) */
const X0 = 30, X1 = 354; // 한 달 줄 처음(답한 날 점) · 끝(한 달 뒤 구슬)
function recRow(id, r, y0, i) {
  const g = s('g', {class: 'ssj-row ssj-r' + i});
  if (i) g.append(s('path', {d: `M20 ${y0}H370`, class: 'ssj-line'}));
  const date = r ? dKo(r.day) : NEED, vx = 24 + est(date, 20) + 12;
  g.append(T(24, y0 + 34, date, 'ssj-date'));
  if (r?.v) g.append(s('text', {x: f1(vx), y: y0 + 34, class: 'ssj-vname'}, s('tspan', {class: 'ssj-tone-' + r.v.tone, text: r.v.shape}), s('tspan', {dx: 5, text: r.v.name})));
  else g.append(T(vx, y0 + 34, NEED, 'ssj-d'));
  const kept = r?.kept ?? null, due = !!r?.due, frac = kept ? 1 : Math.max(0, Math.min(1, Number.isFinite(r?.frac) ? r.frac : 0));
  const st = kept === 'yes' ? ['정한 대로 했어요', 'ssj-st'] : kept === 'no' ? ['정한 대로 못 했어요', 'ssj-st'] : due ? ['한 달 됐어요', 'ssj-st ssj-st-due'] : [r?.dueDay ? dKo(r.dueDay) + '에 물어요' : NEED, 'ssj-d'];
  g.append(T(366, y0 + 34, st[0], st[1], {'text-anchor': 'end'}));
  const ty = y0 + 60, fx = f1(X0 + frac * (X1 - 12 - X0));
  g.append(s('path', {d: `M${X0} ${ty}H${X1 - 12}`, class: 'ssj-track'}),
    frac > 0.02 ? s('path', {d: `M${X0} ${ty}H${fx}`, class: 'ssj-fill'}) : null,
    s('circle', {cx: X0, cy: ty, r: 6.5, class: 'ssj-dotA'}),
    bead(id, X1, ty, 12, {lit: kept === 'yes', ember: !kept && due}));
  return g;
}
/** 빈 줄 — 아직 기록이 없는 자리(빈 고리 점 → 점선 → 유리 구슬 · 「빈 칸」) */
function ghostRow(id, y0, i) {
  const ty = y0 + 60;
  return s('g', {class: 'ssj-row ssj-r' + i}, i ? s('path', {d: `M20 ${y0}H370`, class: 'ssj-line'}) : null,
    T(24, y0 + 34, '빈 칸', 'ssj-d'),
    s('path', {d: `M${X0 + 9} ${ty}H${X1 - 15}`, class: 'ssj-track ssj-ghost'}),
    s('circle', {cx: X0, cy: ty, r: 6.5, class: 'ssj-dotB'}), bead(id, X1, ty, 12));
}
/** 기록이 없을 때 — 한 줄 글 둘 + 앞으로 생길 한 줄의 본보기(빈 고리 점 → 점선 → 유리 구슬 · 답한 날 · 한 달 뒤) */
function emptyRows(id, y0, say, sub) {
  const ty = y0 + 146;
  return s('g', {class: 'ssj-row ssj-r0'},
    T(MID, y0 + 52, say, 'ssj-k', MIDA), T(MID, y0 + 84, sub, 'ssj-d', MIDA),
    s('path', {d: `M${X0 + 9} ${ty}H${X1 - 15}`, class: 'ssj-track ssj-ghost'}),
    s('circle', {cx: X0, cy: ty, r: 6.5, class: 'ssj-dotB'}), bead(id, X1, ty, 12),
    T(24, ty + 36, '답한 날', 'ssj-d'), T(366, ty + 36, '한 달 뒤', 'ssj-d', {'text-anchor': 'end'}));
}
function journalPic(d, id) {
  const ok = !!d && Array.isArray(d.recs), recs = ok ? d.recs.filter(r => r && typeof r === 'object') : [];
  const n = ok && Number.isInteger(d.n) ? d.n : null, back = ok ? recs.filter(r => r.due && !r.kept).length : null; // 돌아볼 기록 = 한 달이 지나고 아직 안 물은 기록(쪽의 「한 달이 지나 돌아볼 기록」과 같은 셈)
  const say = !ok ? NEED : d.can === false ? '이 기기는 기록을 남길 수 없어요' : n ? null : '아직 기록이 없어요';
  const rows = say ? [] : recs.slice(0, 3); // 새 기록 세 줄(새 것이 위)
  const label = '내 매매일지 · 답한 날 호박빛 구슬에서 한 달 뒤 유리 구슬로 · 쌓인 기록 ' + (n ?? NEED) + '번 · 돌아볼 기록 ' + (back ?? NEED) + '번' + (say ? ' · ' + say : ' · 새 기록 ' + rows.length + '줄');
  const svg = s('svg', {class: 'su-svg su-stop-jobs ssj-journal', viewBox: `0 0 ${W} ${JH}`, role: 'img', preserveAspectRatio: 'xMidYMid meet', 'data-clean': 'jobs', 'data-n': n ?? '', 'aria-label': label});
  svg.append(defs(id), s('rect', {x: 0, y: 0, width: W, height: JH, class: 'ssj-bg'}));
  /* 1 한 문장 */
  svg.append(s('g', {class: 'ssj-in ssj-in1'}, T(MID, 42, '사기 전에 멈춘 날을 적고', 'ssj-sub', MIDA), T(MID, 70, '한 달 뒤에 돌아봐요.', 'ssj-sub', MIDA)));
  /* 2 물건 하나 — 구슬 둘 · 점선 활 「한 달」 */
  svg.append(orbs(id), s('g', {class: 'ssj-in ssj-in2'}, T(204, 150, '한 달', 'ssj-d', MIDA)));
  /* 3 쌓인 기록 | 돌아볼 기록 */
  const PY = 252;
  svg.append(s('g', {class: 'ssj-in ssj-in3'},
    s('path', {d: `M${MID} ${PY + 8}V${PY + 124}`, class: 'ssj-div'}),
    keyLabel(104, PY + 30, 'A', '답한 날'), numText(104, PY + 90, n, '번'), T(104, PY + 118, '쌓인 기록', 'ssj-d', MIDA),
    keyLabel(290, PY + 30, 'B', '한 달 뒤'), numText(290, PY + 90, back, '번'), T(290, PY + 118, '돌아볼 기록', 'ssj-d', MIDA)));
  /* 4 새 기록 세 줄 — 가는 선으로 나눈 줄마다 한 달 줄 */
  const RY = 396;
  svg.append(s('path', {d: `M20 ${RY}H370`, class: 'ssj-rule ssj-in ssj-in3'}));
  if (rows.length) for (let i = 0; i < 3; i++) svg.append(rows[i] ? recRow(id, rows[i], RY + i * 80, i) : ghostRow(id, RY + i * 80, i));
  else svg.append(emptyRows(id, RY, say ?? NEED, !ok ? '기록을 읽지 못했어요' : d.can === false ? '「왜 사?」 답은 그 화면에만 있어요' : '「왜 사?」에 답하면 여기에 남아요'));
  if (ok && d.can !== false) svg.append(s('g', {class: 'ssj-in ssj-in4'}, T(MID, 668, n > 3 ? '새 기록 세 줄만 보여요.' : '이 휴대폰에만 남는 기록이에요.', 'ssj-d', MIDA))); // 남길 수 없는 기계 · 못 읽은 때는 이 줄을 뺌(위 글과 어긋나지 않게)
  return svg;
}

/** load 가 준 것으로 <svg viewBox="0 0 390 H"> 하나 — 「왜 사?」 opt = {cur: 지금 질문 번호 1 ~ 11, done: 답한 수} · 매매일지는 opt 없음 */
export function picture(d, opt = {}) {
  const id = 'ssj' + (++UID) + '-';
  return d?.kind === 'journal' ? journalPic(d, id) : quizPic(d, opt ?? {}, id);
}
