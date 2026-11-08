/* 수르 첫 페이지 — 잡스 판(주문 1532 · 사장님 2026-11-08 15:32 「6번으로 해서 잡스에 빙식으로 해서 만들어봐」 · 샘플 j06 「제품 소개 쪽」 · docs/design/su-jobs11-2026-11-08)
   한 화면에 생각 하나: 큰 제목 「지금, 그리고 될 듯.」 · 흰 바탕에 빛나는 구슬 둘(환한 큰 구슬 = 지금 · 속에서 불이 오르는 작은 유리 구슬 = 될 듯) · 지금 21 | 될 듯 21
   아래로 내리면: 불장 · 꽃이 될 · 돈이 몰리는 마다 왼쪽 지금 일곱 · 오른쪽 될 듯 일곱(한 줄에 짝 하나 · 이름 20 · 값 18 · 누름 60)
   덜어냄: 무하 그림 · 금 테 · 장식 0 · 흐림 필터 0(밝기 차만으로 빛남) · 색은 검정 · 회색 · 호박색 하나
   그리기: s() 만(createElementNS · setAttribute) · 색 · 움직임은 su-apple.css(움직임 줄이기면 끝 모습) */
import {s} from '/su/su-fig.js';

export const CSS = '/su/su-apple.css';
export async function load(get) { try { return (await get('/su/data/su21.json')) ?? null; } catch { return null; } }

const NEED = '확인 필요';
const KEY = ['hot', 'bloom', 'money'];
const KIND = {hot: '불장', bloom: '꽃이 될', money: '돈이 몰리는'};
const KINDN = {hot: '불장이 될 듯', bloom: '꽃이 될 듯', money: '돈이 몰릴 듯'};
const NXK = {hot: 'hotNext', bloom: 'bloomNext', money: 'moneyNext'};
const W = 390, PAD = 20, MID = W / 2;
const fin = v => typeof v === 'number' && Number.isFinite(v);
const NF = new Intl.NumberFormat('ko-KR');
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
  if (k === 'hot') return fin(c?.ch20) ? pct(c.ch20) : NEED;
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
    else if (/[a-z]/.test(ch)) w += 0.56;
    else if (/[0-9+−-]/.test(ch)) w += 0.62;
    else if (/[ .,·]/.test(ch)) w += 0.3;
    else w += 0.8;
  }
  return w * px;
}
const T = (x, y, text, cls, extra = {}) => s('text', {x, y, class: cls, ...extra, text});

/* ── 구슬 둘 — 밝기 차만으로 빛남(흐림 필터 없음) ── */
function orbs(id, cy) {
  const A = {x: 148, y: cy, r: 84}, B = {x: 292, y: cy + 30, r: 54}, FL = cy + 86; // FL = 바닥 줄
  const g = s('g', {class: 'sa-orbs', 'aria-hidden': 'true'});
  const rg = (gid, stops, at = {}) => s('radialGradient', {id: id + gid, ...at}, stops.map(([o, c]) => s('stop', {offset: o, class: c})));
  const defs = s('defs', {},
    rg('h', [[0, 'sa-hl0'], [0.4, 'sa-hl1'], [0.72, 'sa-hl2'], [1, 'sa-hl3']]),
    rg('b', [[0, 'sa-b0'], [0.2, 'sa-b1'], [0.46, 'sa-b2'], [0.7, 'sa-b3'], [0.88, 'sa-b4'], [1, 'sa-b5']], {cx: '44%', cy: '40%', r: '64%', fx: '40%', fy: '34%'}),
    rg('c', [[0, 'sa-c0'], [0.5, 'sa-c1'], [1, 'sa-c2']]),
    rg('s', [[0, 'sa-s0'], [0.6, 'sa-s1'], [1, 'sa-s2']]),
    rg('g', [[0, 'sa-g0'], [0.55, 'sa-g1'], [0.8, 'sa-g2'], [0.94, 'sa-g3'], [1, 'sa-g4']], {cx: '48%', cy: '44%', r: '56%'}),
    rg('e', [[0, 'sa-e0'], [0.5, 'sa-e1'], [1, 'sa-e2']]),
    rg('k', [[0, 'sa-k0'], [0.3, 'sa-k1'], [0.7, 'sa-k2'], [1, 'sa-k3']]),
    rg('d', [[0, 'sa-d0'], [0.6, 'sa-d1'], [1, 'sa-d2']]),
    rg('p', [[0, 'sa-p0'], [0.55, 'sa-p1'], [1, 'sa-p2']]),
    s('linearGradient', {id: id + 'w', x1: 0, y1: 0, x2: 1, y2: 0}, s('stop', {offset: 0, class: 'sa-w0'}), s('stop', {offset: 0.45, class: 'sa-w1'}), s('stop', {offset: 1, class: 'sa-w2'})),
    s('linearGradient', {id: id + 'f', x1: 0, y1: 0, x2: 0, y2: 1}, s('stop', {offset: 0, class: 'sa-f0'}), s('stop', {offset: 1, class: 'sa-f1'})),
    s('clipPath', {id: id + 'ca'}, s('circle', {cx: A.x, cy: A.y, r: A.r})),
    s('clipPath', {id: id + 'cb'}, s('circle', {cx: B.x, cy: B.y, r: B.r})),
    s('clipPath', {id: id + 'fl'}, s('rect', {x: 0, y: FL, width: W, height: 64})));
  const u = k => `url(#${id}${k})`;
  /* 지금 — 환한 구슬 */
  const orbA = s('g', {id: id + 'oa', class: 'sa-orbA'},
    s('circle', {cx: A.x, cy: A.y, r: A.r, fill: u('b')}),
    s('g', {'clip-path': u('ca')}, s('circle', {cx: A.x - 12, cy: A.y - 20, r: 46, fill: u('c')}), s('ellipse', {cx: A.x, cy: A.y + 62, rx: 60, ry: 18, class: 'sa-under'})),
    s('ellipse', {cx: A.x - 33, cy: A.y - 46, rx: 27, ry: 11, transform: `rotate(-38 ${A.x - 33} ${A.y - 46})`, fill: u('s')}),
    s('circle', {cx: A.x - 45, cy: A.y - 26, r: 3.2, class: 'sa-glint'}),
    s('circle', {cx: A.x, cy: A.y, r: A.r - 0.7, class: 'sa-rimA'}));
  /* 될 듯 — 맑은 유리 구슬 · 속에서 불이 막 오름 */
  const orbB = s('g', {id: id + 'ob', class: 'sa-orbB'},
    s('circle', {cx: B.x, cy: B.y, r: B.r, fill: u('g')}),
    s('g', {'clip-path': u('cb')},
      s('rect', {x: B.x - B.r, y: B.y - B.r, width: B.r * 2, height: B.r * 2, fill: u('w')}),
      s('ellipse', {cx: B.x, cy: B.y + 38, rx: 36, ry: 9, class: 'sa-underB'}),
      s('g', {class: 'sa-ember'}, s('circle', {cx: B.x, cy: B.y + 8, r: 38, fill: u('e')}), s('circle', {cx: B.x, cy: B.y + 8, r: 13, fill: u('k')}))),
    s('ellipse', {cx: B.x - 22, cy: B.y - 26, rx: 17, ry: 7, transform: `rotate(-36 ${B.x - 22} ${B.y - 26})`, fill: u('s')}),
    s('circle', {cx: B.x - 31, cy: B.y - 11, r: 2.4, class: 'sa-glint'}),
    s('circle', {cx: B.x, cy: B.y, r: B.r - 0.6, class: 'sa-rimB'}),
    s('path', {d: `M${B.x + 33} ${B.y - 39}A50 50 0 0 1 ${B.x + 45} ${B.y + 18}`, class: 'sa-edge'}));
  g.append(defs,
    s('ellipse', {cx: A.x + 8, cy: FL + 2, rx: 170, ry: 22, fill: u('p')}),                       // 바닥에 번진 빛
    s('circle', {cx: A.x, cy: A.y, r: 122, fill: u('h'), class: 'sa-halo'}),                     // 지금 구슬 둘레 빛(숨 쉼)
    s('ellipse', {cx: B.x + 17, cy: FL + 1, rx: 56, ry: 7.5, fill: u('d')}), s('ellipse', {cx: A.x, cy: FL, rx: 54, ry: 6, fill: u('d')}),
    s('circle', {cx: A.x, cy: A.y, r: 90, class: 'sa-bloom'}),                                  // 가장자리로 번지는 빛
    orbA, orbB,
    s('g', {'clip-path': u('fl'), class: 'sa-refl'}, s('use', {href: '#' + id + 'oa', transform: `translate(0 ${2 * FL}) scale(1 -1)`}), s('use', {href: '#' + id + 'ob', transform: `translate(0 ${2 * FL}) scale(1 -1)`})),
    s('rect', {x: 0, y: FL, width: W, height: 64, fill: u('f')}));                              // 비친 모습이 아래로 사라짐
  return {g, bottom: FL + 64};
}

/* ── 이름 칸 하나(누르면 그 회사) ── */
function cell(it, x, y, w, h, side) {
  const st = it.star ? '✦ ' : '', nm = st + it.name;
  const fs = est(nm, 20) <= w - 8 ? 20 : est(nm, 18) <= w - 8 ? 18 : 17;
  const a = s('a', {href: '#/c/' + encodeURIComponent(it.code), class: 'sa-cell sa-' + side, 'data-k': it.k, 'data-name': it.name,
    'aria-label': (side === 'now' ? '지금 ' : '될 듯 ') + it.kind + ' · ' + it.name + ' · ' + it.val + (it.star ? ' · 두 목록에 함께' : '')});
  a.append(s('rect', {x, y: y + 1, width: w, height: h - 2, rx: 12, class: 'sa-hit'}),
    T(x + 6, y + 26, nm, 'sa-name', {'font-size': fs}),
    T(x + 6, y + 50, it.val, 'sa-val sa-val-' + side + (it.val === '꽃' ? ' sa-bloomv' : '')));
  return a;
}

/* ── 그림 ── */
function draw(d, opt) {
  const id = 'sa' + (++UID);
  const L = d?.lists ?? {};
  const ovs = new Set((d?.overlap ?? []).map(o => o.name));
  const items = (k, nx) => (L[nx ? NXK[k] : k] ?? []).slice(0, 7).map(c => ({k: nx ? NXK[k] : k, kind: nx ? KINDN[k] : KIND[k], code: String(c.code ?? ''), name: String(c.name ?? NEED), val: valText(c, k, nx), star: !nx && ovs.has(String(c.name))}));
  const nNow = KEY.reduce((a, k) => a + Math.min(7, (L[k] ?? []).length), 0), nNx = KEY.reduce((a, k) => a + Math.min(7, (L[NXK[k]] ?? []).length), 0);
  const ROW = 60, HEADH = 58, GAP = 26, CW = MID - PAD - 3;
  const LIST0 = 548;
  const rowsOf = k => Math.max(items(k, false).length, items(k, true).length, 1);
  const H = LIST0 + KEY.reduce((a, k) => a + HEADH + rowsOf(k) * ROW + GAP, 0) + 24;
  const day = d?.asOf?.board ?? null;
  const svg = s('svg', {class: 'su-svg su-apple', viewBox: `0 0 ${W} ${H}`, role: 'img', preserveAspectRatio: 'xMidYMid meet', 'data-show': 'now-next', 'data-clean': 'jobs',
    'aria-label': `흰 바탕에 빛나는 구슬 둘 · 지금 ${nNow}곳 · 될 듯 ${nNx}곳` + (day ? ' · ' + day + ' 자료' : '')});
  svg.append(s('rect', {x: 0, y: 0, width: W, height: H, class: 'sa-bg'}));
  /* 1 한 문장 */
  /* 큰 제목 「지금, 그리고 될 듯.」은 쪽 머리(h1 · 쪽과 함께 바로 그려짐 — 느린 휴대폰 첫 칠함 2.5초)에 · 그림은 부제부터 */
  const top = s('g', {class: 'sa-top'},
    T(MID, 42, '한국 주식 회사 가운데', 'sa-sub sa-in sa-in1', {'text-anchor': 'middle'}),
    T(MID, 70, '될 듯한 곳을 찾아 드려요.', 'sa-sub sa-in sa-in1', {'text-anchor': 'middle'}));
  svg.append(top);
  /* 2 물건 하나 — 구슬 둘 */
  const O = orbs(id, 204);
  svg.append(O.g);
  /* 3 지금 21 | 될 듯 21 */
  const PY = O.bottom + 4;
  const pair = s('g', {class: 'sa-pair sa-in sa-in2'},
    s('path', {d: `M${MID} ${PY + 6}V${PY + 128}`, class: 'sa-div'}),
    s('circle', {cx: 74, cy: PY + 22, r: 7, class: 'sa-dotA'}), T(88, PY + 27, '지금', 'sa-k'),
    T(105, PY + 96, String(nNow || NEED), 'sa-n', {'text-anchor': 'middle'}), T(105 + est(String(nNow), 58) / 2 + 4, PY + 96, '곳', 'sa-unit'),
    T(105, PY + 124, '지금 그런 곳', 'sa-d', {'text-anchor': 'middle'}),
    s('circle', {cx: 248, cy: PY + 22, r: 6.5, class: 'sa-dotB'}), s('circle', {cx: 248, cy: PY + 22, r: 2.6, class: 'sa-dotBc'}), T(262, PY + 27, '될 듯', 'sa-k'),
    T(285, PY + 96, String(nNx || NEED), 'sa-n', {'text-anchor': 'middle'}), T(285 + est(String(nNx), 58) / 2 + 4, PY + 96, '곳', 'sa-unit'),
    T(285, PY + 124, '곧 그렇게 될 듯한 곳', 'sa-d', {'text-anchor': 'middle'}));
  svg.append(pair, T(MID, PY + 168, '앞날을 맞히는 목록이 아니에요.', 'sa-safe sa-in sa-in3', {'text-anchor': 'middle'}));
  /* 4 셋 × 둘 — 한 줄에 짝 하나(왼 지금 · 오른 될 듯) */
  let y = LIST0;
  KEY.forEach((k, ki) => {
    const now = items(k, false), nx = items(k, true), sec = s('g', {class: 'sa-sec sa-sec' + ki});
    sec.append(s('path', {d: `M${PAD} ${y}H${W - PAD}`, class: 'sa-rule'}),
      s('circle', {cx: PAD + 7, cy: y + 33, r: 6, class: 'sa-dotA'}), T(PAD + 20, y + 40, KIND[k], 'sa-kh'),
      s('circle', {cx: MID + 10, cy: y + 33, r: 5.5, class: 'sa-dotB'}), s('circle', {cx: MID + 10, cy: y + 33, r: 2.2, class: 'sa-dotBc'}), T(MID + 23, y + 40, KINDN[k], 'sa-kh'));
    y += HEADH;
    const n = rowsOf(k);
    for (let i = 0; i < n; i++) {
      const row = s('g', {class: 'sa-row'});
      if (i) row.append(s('path', {d: `M${PAD} ${y}H${W - PAD}`, class: 'sa-line'}));
      if (now[i]) row.append(cell(now[i], PAD - 6, y, CW, ROW, 'now'));
      if (nx[i]) row.append(cell(nx[i], MID + 3, y, CW, ROW, 'next'));
      if (!now[i] && !nx[i]) row.append(T(PAD, y + 36, NEED, 'sa-d'));
      sec.append(row);
      y += ROW;
    }
    y += GAP;
    svg.append(sec);
  });
  return svg;
}

/** 그림 — 처음 쪽(지금 · 될 듯 한 장) · 될 듯 21곳(#/n · opt.mode = 'next' — 같은 판 · data-k 를 hot · bloom · money 로 바꿔 검사와 차례를 맞춤 · 지금 이름표는 hotNow · bloomNow · moneyNow) */
export function picture(d, opt = {}) {
  const svg = draw(d, opt);
  if (opt.mode === 'next') {
    const M = {hot: 'hotNow', bloom: 'bloomNow', money: 'moneyNow', hotNext: 'hot', bloomNext: 'bloom', moneyNext: 'money'};
    for (const a of svg.querySelectorAll('a[data-k]')) { const k = a.getAttribute('data-k'); if (M[k]) a.setAttribute('data-k', M[k]); }
    svg.setAttribute('data-mode', 'next');
  } else svg.setAttribute('data-mode', 'now');
  return svg;
}
