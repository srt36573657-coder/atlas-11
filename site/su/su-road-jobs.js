/* 큐피트 그림 부품 — su-road-jobs(주문 2011 · 사장님 2026-11-08 20:11 「제 처음부터 끝까지 모든 페이지를 첫페이지 기준으로 모두 변경해」)
   옛 무하 판(친구에게)을 첫 페이지 잡스 판(su-apple)과 같은 말투로 새로 그림 — 흰 바탕 · 검정 · 회색 · 호박색 하나 · 흐림 필터 0
   친구에게(#/f · arg 'friend') — 부제 두 줄 → 구슬 둘(환한 구슬 = 큐피트가 찾은 곳 · 맑은 유리 구슬 = 친구 · 호박색 점이 건너감)
      → 「찾은 곳 21곳 | 친구에게 4가지」(21곳 = 그날 판의 세 목록 칸 수 · 내가 열어 본 곳이 아님) → 건네는 칸(두 줄 · 가는 선 · 주소 · aria-label · data-gift 는 옛 판 그대로)
   주문 1114-1306(사장님 2026-11-14 13:06 「… 다 해」) ⑧ — 옛 기능 쪽 「셋의 길」(#/g)을 버려 그 그림(고리 · 여덟 칸)도 지움 · 옛 무하 판 파일(su-road-art)도 지움
   자료는 su21.json 셋 목록 수뿐 · 빈 값은 「확인 필요」 · 지어낸 숫자 0
   그리기는 s()(createElementNS · setAttribute)만 · 색 · 움직임은 /su/su-road-jobs.css(움직임 줄이기면 끝 모습) */
import {s} from '/su/su-fig.js';

export const CSS = '/su/su-road-jobs.css';
const W = 390, MID = W / 2, PAD = 20, NEED = '확인 필요';
/** 친구에게 건네는 넷 — 이름 · 주소는 친구 쪽 카드(su-21.js vFriend)와 같음 · 읽는 차례(왼쪽 → 오른쪽, 위 → 아래)
 *  주문 1114-0922(사장님 2026-11-14 08:27 「… 과거 찌꺼기 버릴것은 버리고」) — 보상 칸 「선물 · 상품권 받기」 「커피 쿠폰」을 뺌(친구 쪽 카드와 같이 · 본질에 없는 보상)
 *  넷 모두 닫히지 않는 옛 앱 쪽(카톡 보내기 · 내 종목 · 진화)과 소개 쪽 — 닫히는 옛 쪽(시황 · 급등 · 급등 달력 · 오늘 시장)과 /atlas/ 화면으로 가는 고리 0(주문 1114-1306 ②)
 *  say = vFriend 카드 글을 줄인 한 줄(숫자 없음) */
const FRIEND = Object.freeze([
  {t: '카톡 보내기', href: '/next/?su=guest#/share', say: '한 곳을 보내요'},
  {t: '소개 영상', href: '/hello.html?su=guest', say: '큐피트가 하는 일'},
  {t: '내 종목', href: '/next/?su=stop#/me', say: '같은 잣대로'},
  {t: '진화', href: '/next/?su=back#/jinhwa', say: '큐피트가 고친 것'}]);
let UID = 0;

/** 자료 — 친구에게(arg 'friend') · 찾은 곳 수 = 그날 판 세 목록 칸 수(su21.json) · 못 받으면 null(「확인 필요」) */
export async function load(get) {
  let T = null;
  try { T = typeof get === 'function' ? await get('/su/data/su21.json') : null; } catch { T = null; }
  const n = ['hot', 'bloom', 'money'].reduce((a, k) => a + (Array.isArray(T?.lists?.[k]) ? T.lists[k].length : 0), 0);
  return {which: 'friend', items: FRIEND, n: n || null};
}

/** 그림 — load 가 준 것으로 <svg viewBox="0 0 390 H"> 하나 */
export function picture(d) {
  return friend(d);
}

/* ── 작은 손 ── */
const f1 = v => Math.round(v * 10) / 10;
const T = (x, y, text, cls, extra = {}) => s('text', {x: f1(x), y: f1(y), class: cls, ...extra, text});
const MA = {'text-anchor': 'middle'};
const fin = v => typeof v === 'number' && Number.isFinite(v);
/** 글 넓이 어림(굵은 글 · 한글은 1em 로 넉넉히 — 글꼴이 바뀌어도 넘치지 않게) */
function est(t, px) {
  let w = 0;
  for (const ch of String(t)) {
    if (/[ᄀ-ᇿ㄰-㆏가-힯「」]/.test(ch)) w += 1;
    else if (/[A-Z&]/.test(ch)) w += 0.7;
    else if (/[a-z]/.test(ch)) w += 0.56;
    else if (/[0-9+−-]/.test(ch)) w += 0.62;
    else if (/[ .,·]/.test(ch)) w += 0.3;
    else w += 0.8;
  }
  return w * px;
}
const root = (kind, H, label) => s('svg', {class: 'su-svg su-road-jobs srj-' + kind, viewBox: `0 0 ${W} ${H}`, role: 'img', preserveAspectRatio: 'xMidYMid meet', 'data-clean': 'jobs', 'aria-label': label});
/** 점 — A 호박색 찬 점(셋 · 찾은 곳) · C 회색 고리 점(다른 것 · 친구) */
const dot = (x, y, k) => (k === 'A' ? s('circle', {cx: f1(x), cy: f1(y), r: 6.5, class: 'srj-dotA'}) : s('circle', {cx: f1(x), cy: f1(y), r: 6, class: 'srj-dotC'}));
/** 맨 위 부제 두 줄(20px 회색 · 가운데) */
const sub = (a, b) => s('g', {class: 'srj-top srj-in srj-in1'}, T(MID, 40, a, 'srj-sub', MA), T(MID, 67, b, 'srj-sub', MA));
/** 칸 줄 — 굵은 첫 줄 · 칸 사이 가는 가로줄 · 가운데 가는 세로줄(첫 페이지 칸 짜임) */
function lines(y0, rows, rowH) {
  const g = s('g', {class: 'srj-lines', 'aria-hidden': 'true'}, s('path', {d: `M${PAD} ${y0}H${W - PAD}`, class: 'srj-rule'}),
    s('path', {d: `M${MID} ${y0 + 16}V${y0 + rows * rowH - 16}`, class: 'srj-div'}));
  for (let i = 1; i < rows; i++) g.append(s('path', {d: `M${PAD} ${y0 + i * rowH}H${W - PAD}`, class: 'srj-line'}));
  return g;
}
/** 칸 자리 — 두 줄(왼쪽 · 오른쪽) · 첫 페이지 칸과 같은 넓이 */
const CW = MID - PAD - 3;
const cellAt = (i, y0, rowH) => ({x: i % 2 ? MID + 3 : PAD - 6, y: y0 + ((i / 2) | 0) * rowH, w: CW, h: rowH});

/* ── 구슬 둘(첫 페이지 su-apple 구슬과 같은 빛 · 크기만 줄임) — 밝기 차만으로 빛남(흐림 필터 없음) ── */
function orbs(id, A, B, FL, RH) {
  const ka = A.r / 84, kb = B.r / 54;
  const g = s('g', {class: 'srj-orbs', 'aria-hidden': 'true'});
  const rg = (gid, stops, at = {}) => s('radialGradient', {id: id + gid, ...at}, stops.map(([o, c]) => s('stop', {offset: o, class: c})));
  const defs = s('defs', {},
    rg('h', [[0, 'srj-hl0'], [0.4, 'srj-hl1'], [0.72, 'srj-hl2'], [1, 'srj-hl3']]),
    rg('b', [[0, 'srj-b0'], [0.2, 'srj-b1'], [0.46, 'srj-b2'], [0.7, 'srj-b3'], [0.88, 'srj-b4'], [1, 'srj-b5']], {cx: '44%', cy: '40%', r: '64%', fx: '40%', fy: '34%'}),
    rg('c', [[0, 'srj-c0'], [0.5, 'srj-c1'], [1, 'srj-c2']]),
    rg('s', [[0, 'srj-s0'], [0.6, 'srj-s1'], [1, 'srj-s2']]),
    rg('g', [[0, 'srj-g0'], [0.55, 'srj-g1'], [0.8, 'srj-g2'], [0.94, 'srj-g3'], [1, 'srj-g4']], {cx: '48%', cy: '44%', r: '56%'}),
    rg('e', [[0, 'srj-e0'], [0.5, 'srj-e1'], [1, 'srj-e2']]),
    rg('k', [[0, 'srj-k0'], [0.3, 'srj-k1'], [0.7, 'srj-k2'], [1, 'srj-k3']]),
    rg('d', [[0, 'srj-d0'], [0.6, 'srj-d1'], [1, 'srj-d2']]),
    rg('p', [[0, 'srj-p0'], [0.55, 'srj-p1'], [1, 'srj-p2']]),
    s('linearGradient', {id: id + 'w', x1: 0, y1: 0, x2: 1, y2: 0}, s('stop', {offset: 0, class: 'srj-w0'}), s('stop', {offset: 0.45, class: 'srj-w1'}), s('stop', {offset: 1, class: 'srj-w2'})),
    s('linearGradient', {id: id + 'f', x1: 0, y1: 0, x2: 0, y2: 1}, s('stop', {offset: 0, class: 'srj-f0'}), s('stop', {offset: 1, class: 'srj-f1'})),
    s('clipPath', {id: id + 'ca'}, s('circle', {cx: A.x, cy: A.y, r: A.r})),
    s('clipPath', {id: id + 'cb'}, s('circle', {cx: B.x, cy: B.y, r: B.r})),
    s('clipPath', {id: id + 'fl'}, s('rect', {x: 0, y: FL, width: W, height: RH})));
  const u = k => `url(#${id}${k})`;
  /* 찾은 곳 — 환한 구슬 */
  const orbA = s('g', {id: id + 'oa', class: 'srj-orbA'},
    s('circle', {cx: A.x, cy: A.y, r: A.r, fill: u('b')}),
    s('g', {'clip-path': u('ca')}, s('circle', {cx: f1(A.x - 12 * ka), cy: f1(A.y - 20 * ka), r: f1(46 * ka), fill: u('c')}), s('ellipse', {cx: A.x, cy: f1(A.y + 62 * ka), rx: f1(60 * ka), ry: f1(18 * ka), class: 'srj-under'})),
    s('ellipse', {cx: f1(A.x - 33 * ka), cy: f1(A.y - 46 * ka), rx: f1(27 * ka), ry: f1(11 * ka), transform: `rotate(-38 ${f1(A.x - 33 * ka)} ${f1(A.y - 46 * ka)})`, fill: u('s')}),
    s('circle', {cx: f1(A.x - 45 * ka), cy: f1(A.y - 26 * ka), r: 2.6, class: 'srj-glint'}),
    s('circle', {cx: A.x, cy: A.y, r: f1(A.r - 0.7), class: 'srj-rimA'}));
  /* 친구 — 맑은 유리 구슬 · 속에서 불이 막 오름 */
  const orbB = s('g', {id: id + 'ob', class: 'srj-orbB'},
    s('circle', {cx: B.x, cy: B.y, r: B.r, fill: u('g')}),
    s('g', {'clip-path': u('cb')},
      s('rect', {x: B.x - B.r, y: B.y - B.r, width: B.r * 2, height: B.r * 2, fill: u('w')}),
      s('ellipse', {cx: B.x, cy: f1(B.y + 38 * kb), rx: f1(36 * kb), ry: f1(9 * kb), class: 'srj-underB'}),
      s('g', {class: 'srj-ember'}, s('circle', {cx: B.x, cy: f1(B.y + 8 * kb), r: f1(38 * kb), fill: u('e')}), s('circle', {cx: B.x, cy: f1(B.y + 8 * kb), r: f1(13 * kb), fill: u('k')}))),
    s('ellipse', {cx: f1(B.x - 22 * kb), cy: f1(B.y - 26 * kb), rx: f1(17 * kb), ry: f1(7 * kb), transform: `rotate(-36 ${f1(B.x - 22 * kb)} ${f1(B.y - 26 * kb)})`, fill: u('s')}),
    s('circle', {cx: f1(B.x - 31 * kb), cy: f1(B.y - 11 * kb), r: 2, class: 'srj-glint'}),
    s('circle', {cx: B.x, cy: B.y, r: f1(B.r - 0.6), class: 'srj-rimB'}),
    s('path', {d: `M${f1(B.x + 33 * kb)} ${f1(B.y - 39 * kb)}A${f1(50 * kb)} ${f1(50 * kb)} 0 0 1 ${f1(B.x + 45 * kb)} ${f1(B.y + 18 * kb)}`, class: 'srj-edge'}));
  g.append(defs,
    s('ellipse', {cx: A.x + 8, cy: FL + 2, rx: f1(170 * ka), ry: f1(22 * ka), fill: u('p')}),                  // 바닥에 번진 빛
    s('circle', {cx: A.x, cy: A.y, r: f1(A.r * 1.45), fill: u('h'), class: 'srj-halo'}),                        // 구슬 둘레 빛(숨 쉼)
    s('ellipse', {cx: f1(B.x + 17 * kb), cy: FL + 1, rx: f1(56 * kb), ry: f1(7.5 * kb), fill: u('d')}), s('ellipse', {cx: A.x, cy: FL, rx: f1(54 * ka), ry: f1(6 * ka), fill: u('d')}),
    s('circle', {cx: A.x, cy: A.y, r: A.r + 5, class: 'srj-bloom'}),                                           // 가장자리로 번지는 빛
    orbA, orbB,
    s('g', {'clip-path': u('fl'), class: 'srj-refl'}, s('use', {href: '#' + id + 'oa', transform: `translate(0 ${2 * FL}) scale(1 -1)`}), s('use', {href: '#' + id + 'ob', transform: `translate(0 ${2 * FL}) scale(1 -1)`})),
    s('rect', {x: 0, y: FL, width: W, height: RH, fill: u('f')}));                                           // 비친 모습이 아래로 사라짐
  return g;
}
/** 빛이 건너감 — 환한 구슬 어깨에서 유리 구슬 어깨로 호박색 점 다섯(갈수록 크고 진하게) */
function hop(A, B) {
  const P0 = [A.x + A.r * Math.cos(-0.7), A.y + A.r * Math.sin(-0.7)], P2 = [B.x - B.r * Math.cos(-0.7), B.y + B.r * Math.sin(-0.7)];
  const P1 = [(P0[0] + P2[0]) / 2, Math.min(P0[1], P2[1]) - 36];
  return s('g', {class: 'srj-hop', 'aria-hidden': 'true'}, [0.16, 0.33, 0.5, 0.67, 0.84].map((t, i) => { const u = 1 - t;
    return s('circle', {cx: f1(u * u * P0[0] + 2 * u * t * P1[0] + t * t * P2[0]), cy: f1(u * u * P0[1] + 2 * u * t * P1[1] + t * t * P2[1]), r: f1(2 + i * 0.4), class: 'srj-hp srj-hp' + (i + 1)}); }));
}
/** 큰 숫자 + 단위 — 한 글(text) 안 두 조각(tspan) · 브라우저가 둘을 한 덩이로 가운데 맞춤(글 넓이 어림 없음 · 숫자 58 · 단위 22) */
const big = (cx, y, v, unit) => s('text', {x: f1(cx), y: f1(y), 'text-anchor': 'middle', class: 'srj-big'}, s('tspan', {class: 'srj-n', text: String(v)}), s('tspan', {class: 'srj-unit', dx: 8, text: unit}));
/** 두 칸 숫자(첫 페이지 「지금 21곳 | 될 듯 21곳」 짜임) — [점 · 이름] 위 · 큰 숫자 + 단위 아래 · 가운데 가는 세로줄 */
function pair(PY, cols) {
  const g = s('g', {class: 'srj-pair srj-in srj-in2'}, s('path', {d: `M${MID} ${PY + 6}V${PY + 102}`, class: 'srj-div'}));
  cols.forEach((c, j) => {
    const cx = j ? 285 : 105, x0 = cx - (est(c.k, 21) + 20) / 2;
    g.append(dot(x0 + 7, PY + 22, c.dot), T(x0 + 20, PY + 29, c.k, 'srj-k'));
    if (fin(c.v)) g.append(big(cx, PY + 90, c.v, c.unit));
    else g.append(T(cx, PY + 84, NEED, 'srj-need', MA));
  });
  return g;
}

/* ── 친구에게 ── */
function friend(d) {
  const items = Array.isArray(d?.items) && d.items.length === FRIEND.length ? d.items : FRIEND;
  const n = fin(d?.n) ? d.n : null, rows = Math.ceil(items.length / 2);
  const id = 'srj' + (++UID), H = 664; // 그림 높이는 그대로(첫 화면의 그림 몫 70 넘게 — 검사 ⑪) · 칸이 줄면 칸을 크게
  const svg = root('friend', H, '친구에게 건네는 ' + items.length + '가지 · 큐피트가 찾은 곳 ' + (n != null ? n + '곳' : NEED) + ' · 칸을 누르면 그 길');
  svg.append(s('rect', {x: 0, y: 0, width: W, height: H, class: 'srj-bg'}), sub('큐피트가 찾은 곳을', '친구와 함께 봐요.'));
  // 물건 하나 — 환한 구슬(찾은 곳) · 맑은 유리 구슬(친구) · 빛이 건너감
  const FL = 224, A = {x: 118, y: FL - 2 - 62, r: 62}, B = {x: 284, y: FL - 2 - 40, r: 40};
  svg.append(orbs(id, A, B, FL, 32), hop(A, B));
  // 찾은 곳 21곳 | 친구에게 4가지
  const PY = FL + 36;
  svg.append(pair(PY, [{dot: 'A', k: '찾은 곳', v: n, unit: '곳'}, {dot: 'C', k: '친구에게', v: items.length, unit: '가지'}]));
  // 건네는 칸 — 이름 · 한 줄(옛 판과 같은 주소 · aria-label · data-gift · 차례)
  const Y0 = PY + 118, ROW = Math.round(76 * 3 / rows); // 세 줄 자리(228)를 줄 수로 나눔 — 넷이면 두 줄 · 칸 114
  const cells = s('g', {class: 'srj-cells srj-fade'}, lines(Y0, rows, ROW), items.map((it, i) => { const c = cellAt(i, Y0, ROW);
    return s('a', {href: it.href, class: 'srj-a srj-cell', 'aria-label': it.t, 'data-gift': String(i)},
      s('rect', {x: c.x, y: c.y + 3, width: c.w, height: c.h - 6, rx: 12, class: 'srj-hit'}),
      T(c.x + 8, c.y + 37 + (ROW - 76) / 2, it.t, 'srj-name'),
      it.say ? T(c.x + 8, c.y + 62 + (ROW - 76) / 2, it.say, 'srj-say') : null); })); // 칸이 커지면 글을 칸 가운데로
  svg.append(cells, T(MID, Y0 + rows * ROW + 42, '친구에게도 사고팔기를 권하지 않아요.', 'srj-d srj-in srj-in3', MA));
  return svg;
}

