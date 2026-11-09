/* 수르 첫 페이지 — 잡스 판(주문 1532 · 사장님 2026-11-08 15:32 「6번으로 해서 잡스에 빙식으로 해서 만들어봐」 · 샘플 j06 「제품 소개 쪽」 · docs/design/su-jobs11-2026-11-08)
   한 화면에 생각 하나: 큰 제목 「지금, 그리고 될 듯.」 · 흰 바탕에 빛나는 구슬 둘(환한 큰 구슬 = 지금 · 속에서 불이 오르는 작은 유리 구슬 = 될 듯) · 지금 21 | 될 듯 21
   아래로 내리면: 불장 · 꽃이 될 · 돈이 몰리는 마다 왼쪽 지금 일곱 · 오른쪽 될 듯 일곱(한 줄에 짝 하나 · 이름 20 · 값 18 · 누름 60)
   덜어냄: 무하 그림 · 금 테 · 장식 0 · 흐림 필터 0(밝기 차만으로 빛남) · 색은 검정 · 회색 · 호박색 하나
   칸마다 현재가 · 한 달 꺾은선(주문 1837 · 사장님 2026-11-08 18:37 「첫패이지에 나온 종목들에 현재가와 꺽기 그래프 한달 올려」)
     현재가 = 그 회사 마지막 값(board.json close — 지금 셋 su21.json · 될 듯 셋 su21-next.json · 그날 = asOf.board) · 꺾은선 = 21 마지막 값(board.json c — 20거래일 앞 ~ 마지막 날) 그대로
     칸 = 이름 · 값 · 현재가(왼쪽) + 오른쪽 꺾은선(회색 2px · 한 달 전 값에 옅은 가로줄 · 마지막 값 점 — 지금 = 호박색 찬 점 · 될 듯 = 고리 점) · 누름 92
   그리기: s() 만(createElementNS · setAttribute) · 색 · 움직임은 su-apple.css(움직임 줄이기면 끝 모습) */
import {s} from '/su/su-fig.js';

export const CSS = '/su/su-apple.css';
/** 자료 — su21.json(지금 셋은 현재가 · 21 마지막 값까지) + su21-next.json(될 듯 셋의 현재가 · 21 마지막 값 — 첫 화면 자료를 가볍게 두려고 따로 · 주문 1837)
 *  받은 자료는 고치지 않고 새 묶음으로(다른 쪽이 같은 자료를 씀) · su21-next.json 을 못 받으면 될 듯 칸은 「확인 필요」 */
const NXF = ['close', 'date', 'c'];
export async function load(get) {
  try {
    const [d, n] = await Promise.all([get('/su/data/su21.json'), get('/su/data/su21-next.json').catch(() => null)]);
    if (!d) return null;
    const lists = {...(d.lists ?? {})};
    for (const k of ['hotNext', 'bloomNext', 'moneyNext']) {
      const by = new Map((n?.lists?.[k] ?? []).map(c => [String(c.code), c]));
      lists[k] = (d.lists?.[k] ?? []).map(c => { const f = by.get(String(c.code)); return f ? {...c, ...Object.fromEntries(NXF.filter(x => f[x] != null).map(x => [x, f[x]]))} : c; });
    }
    return {...d, lists};
  } catch { return null; }
}

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
const f1 = v => Math.round(v * 10) / 10;
const won = v => NF.format(Math.round(v)) + '원';
/** 날짜 「2026-11-06」 → 「11월 6일」 */
const mday = t => { const m = /^\d{4}-(\d{2})-(\d{2})$/.exec(String(t ?? '')); return m ? +m[1] + '월 ' + +m[2] + '일' : null; };

/** 설명 한 줄을 두 글 조각으로(가운데 맞춤 · 한 조각이 느린 휴대폰 첫 화면의 「가장 큰 칠함」이 되어 첫 화면을 늦추지 않게 — 주문 1532 에서 배움) */
function note2(y, a, b, k = '') {
  const gap = est(' ', 18), wa = est(a, 18), x0 = MID - (wa + gap + est(b, 18)) / 2;
  return [T(f1(x0), y, a, 'sa-note sa-in sa-in3' + (k ? ' sa-' + k + 'a' : '')), T(f1(x0 + wa + gap), y, b, 'sa-note sa-in sa-in3' + (k ? ' sa-' + k + 'b' : ''))];
}

/* ── 한 달 꺾은선(주문 1837) — 그날마다 마지막 값 21개를 그대로 이음 · 높이는 그 회사의 한 달 가장 낮은 값 ~ 가장 높은 값 · 한 달 전 값에 옅은 가로줄 ── */
function spark(sp, x, y, w, h, side) {
  const g = s('g', {class: 'sa-spk', 'aria-hidden': 'true'});
  if (!sp) return g;
  const n = sp.length, lo = Math.min(...sp), hi = Math.max(...sp);
  const px = i => x + (w * i) / (n - 1), py = v => (hi === lo ? y + h / 2 : y + h - ((v - lo) / (hi - lo)) * h);
  g.append(s('path', {d: `M${f1(x)} ${f1(py(sp[0]))}H${f1(x + w)}`, class: 'sa-sp0'}),
    s('path', {d: 'M' + sp.map((v, i) => f1(px(i)) + ' ' + f1(py(v))).join('L'), class: 'sa-sp'}));
  const ex = f1(px(n - 1)), ey = f1(py(sp[n - 1]));
  if (side === 'now') g.append(s('circle', {cx: ex, cy: ey, r: 4, class: 'sa-spA'}));
  else g.append(s('circle', {cx: ex, cy: ey, r: 4, class: 'sa-spB'}), s('circle', {cx: ex, cy: ey, r: 1.6, class: 'sa-spBc'}));
  return g;
}

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

/* ── 이름 칸 하나(누르면 그 회사) — 이름 · 값 · 현재가 + 오른쪽 한 달 꺾은선(주문 1837) ── */
const SW = 52; // 꺾은선 넓이(칸 오른쪽 · 글 자리 100)
function cell(it, x, y, w, h, side) {
  const st = it.star ? '✦ ' : '', nm = st + it.name;
  const fs = est(nm, 20) <= w - 8 ? 20 : est(nm, 18) <= w - 8 ? 18 : 17;
  const sx = x + w - 8 - SW, room = sx - x - 12;
  const price = it.px != null ? won(it.px) : NEED, pfs = est(price, 18) <= room ? 18 : 17;
  const say = (it.px != null ? ' · 현재가 ' + price : '') + (it.sp ? ' · 한 달 전 ' + won(it.sp[0]) : '');
  // 첫 발견 · 며칠째 · 포모지수(주문 0123 · 사장님 2026-11-09 01:44 「몇일째 그 항목에 있는지 … 첫 발견」 · 02:01 「포모지수값을 첫페이지 42곳에 모두」) — 누르면 「왜?」 쪽(서른여섯 가지 · 기준 일곱 · 포모 까닭)
  const found = fin(it.days) && mday(it.found) ? '첫 발견 ' + mday(it.found) : '첫 발견 ' + NEED;
  const fo = fin(it.fomo) ? String(it.fomo) : '보류', dl = (fin(it.days) ? it.days + '일째' : NEED) + ' · ', dw = dl + '포모지수 ' + fo;
  const dline = est(dw, 17) <= w - 12 ? dw : dl + '포모 ' + fo;
  const a = s('a', {href: '#/c/' + encodeURIComponent(it.code) + '/y/' + it.k, class: 'sa-cell sa-' + side + (it.sx ? ' sa-x' : ''), 'data-k': it.k, 'data-name': it.name, 'data-px': it.px ?? '', 'data-code': it.code,
    'data-days': fin(it.days) ? it.days : '', 'data-found': it.found ?? '', 'data-fomo': fin(it.fomo) ? it.fomo : '', 'data-sx': it.sx ? '1' : '',
    'aria-label': (it.sx ? SXL + ' · ' : '') + (side === 'now' ? '지금 ' : '될 듯 ') + it.kind + ' · ' + it.name + ' · ' + it.val + say + (it.star ? ' · 두 목록에 함께' : '') + ' · ' + found + ' · ' + dl + '포모지수 ' + fo});
  const o = it.sx ? BX : 0; // 「수르 계산법」 표(주문 1209)가 붙은 칸은 맨 위에 표 · 글은 표 높이만큼 아래로
  a.append(s('title', {text: (it.sx ? SXL + ' · ' : '') + it.name + ' · ' + it.val + say}),
    s('rect', {x, y: y + 1, width: w, height: h - 2, rx: 12, class: 'sa-hit' + (it.sx ? ' sa-hitx' : '')}),
    it.sx ? sxTag(x + 6, y + 8) : null,
    T(x + 6, y + 26 + o, nm, 'sa-name', {'font-size': fs}),
    T(x + 6, y + 52 + o, it.val, 'sa-val sa-val-' + side + (it.val === '꽃' ? ' sa-bloomv' : '')),
    T(x + 6, y + 78 + o, price, 'sa-px' + (it.px != null ? '' : ' sa-need'), {'font-size': pfs}),
    T(x + 6, y + 104 + o, found, 'sa-found' + (fin(it.days) ? '' : ' sa-need'), {'font-size': 17}),
    T(x + 6, y + 128 + o, dline, 'sa-days' + (fin(it.fomo) ? '' : ' sa-need'), {'font-size': 17}),
    spark(it.sp, sx, y + 40 + o, SW, 34, side));
  CELL.set(a, {it, side, sx, sy: y + 40 + o, room, say0: say});
  return a;
}

/* ── 「수르 계산법」 표(주문 1209 · 사장님 2026-11-09 12:09 「엄격한 2개를 수르 계산법으로 찾은 종목이라고 해서 별도로 표기를 해봐」) — 칸 맨 위 작은 이름표 · 풀이는 위 셋째 줄 ── */
const BX = 30, SXT = '수르 계산법', SXL = '수르 계산법으로 찾은 종목';
function sxTag(x, y) {
  const bw = Math.ceil(est(SXT, 17)) + 18;
  return s('g', {class: 'sa-sx', 'aria-hidden': 'true'}, s('rect', {x, y, width: bw, height: 24, rx: 12, class: 'sa-sxb'}), T(f1(x + bw / 2), y + 18, SXT, 'sa-sxt', {'text-anchor': 'middle'}));
}
function legendSx(y) { // 셋째 줄 [수르 계산법] 수르 계산법으로 찾은 종목 · 넷째 줄 31가지 기준을 모두 지난 곳이에요.(사장님 말씀 그대로 · 이해 보고 12:10 「표 위에 「수르 계산법으로 찾은 종목」이라고 풀어 적어요」)
  const bw = Math.ceil(est(SXT, 17)) + 18, gap = 8, tl = SXL, x0 = MID - (bw + gap + est(tl, 18)) / 2;
  return [s('g', {class: 'sa-sx sa-note3x sa-in sa-in3', 'aria-hidden': 'true'}, s('rect', {x: f1(x0), y: y - 18, width: bw, height: 24, rx: 12, class: 'sa-sxb'}), T(f1(x0 + bw / 2), y, SXT, 'sa-sxt', {'text-anchor': 'middle'})),
    T(f1(x0 + bw + gap), y, tl, 'sa-note sa-in sa-in3 sa-note3b', {'aria-label': SXT + ' 표 = ' + tl}),
    ...note2(y + 26, '31가지 기준을', '모두 지난 곳이에요.', 'note4')];
}

/* ── 빈 자리(주문 0854 — 엄격 셈을 통과한 곳이 일곱이 안 되면 남는 자리는 비움 · 그 묶음 첫 빈 자리에만 까닭 글) ── */
function empty(x, y, w, h, side, first) {
  return s('g', {class: 'sa-empty', 'data-empty': side, role: 'img', 'aria-label': '빈 자리 — 31가지 기준을 모두 지난 곳이 더 없어요'},
    s('rect', {x: x + 6, y: y + 12, width: w - 12, height: h - 24, rx: 16, class: 'sa-emp'}),
    T(x + w / 2, y + h / 2 + (first ? -16 : 6), '빈 자리', 'sa-empt', {'text-anchor': 'middle'}),
    first ? T(x + w / 2, y + h / 2 + 10, '기준을 다 지난', 'sa-empd', {'text-anchor': 'middle'}) : null,
    first ? T(x + w / 2, y + h / 2 + 34, '곳이 더 없어요', 'sa-empd', {'text-anchor': 'middle'}) : null);
}

/* ── 장 중 현재가(주문 2011 · 사장님 2026-11-08 20:11 「어 그렇게 하고」 — 장이 열려 있는 낮에도 현재가가 바뀌게) ──
   그림을 그린 뒤 /api/price(넷리파이 함수 · 네이버 증권 분봉 그대로 · lib/atlas11/price.mjs)에 칸 회사들을 물음 · 첫 화면을 기다리게 하지 않음
   받은 값이 있는 칸만 바꿈: 현재가 글 · data-px · data-live(때) · 이름표 · 꺾은선(오늘이 판보다 뒤 = 맨 앞 하루를 빼고 오늘 값을 끝에 · 같은 날 = 끝 값만 바꿈)
   날짜 글 「현재가는 ○월 ○일 오후 ○시 ○분 값이에요.」(장 중) · 「○월 ○일 마지막 값이에요.」(장 끝) · 장 중이면 1분마다 다시(화면이 보일 때만 · 그림이 쪽에서 빠지면 멈춤)
   못 받으면(쉬는 날 · 밤 · 함수 없음) 아무것도 바꾸지 않음 — 판 값 그대로 */
const CELL = new WeakMap();
const hm = t => { const m = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})$/.exec(String(t ?? '')); if (!m) return null; const H = +m[4]; return +m[2] + '월 ' + +m[3] + '일 ' + (H < 12 ? '오전 ' : '오후 ') + (H % 12 || 12) + '시' + (+m[5] ? ' ' + +m[5] + '분' : ''); };
function relive(svg, j, day) {
  let last = null, n = 0;
  for (const a of svg.querySelectorAll('a.sa-cell[data-code]')) {
    const c = CELL.get(a), v = j.items?.[a.getAttribute('data-code')];
    if (!c || !v || !fin(v.p) || v.p <= 0 || typeof v.t !== 'string' || !c.it.sp || !(j.day >= day)) continue;
    const sp = j.day > day ? [...c.it.sp.slice(1), v.p] : [...c.it.sp.slice(0, 20), v.p], price = won(v.p);
    const px = a.querySelector('text.sa-px'); if (px) { px.textContent = price; px.setAttribute('font-size', est(price, 18) <= c.room ? 18 : 17); px.classList.remove('sa-need'); }
    a.querySelector('g.sa-spk')?.replaceWith(spark(sp, c.sx, c.sy, SW, 34, c.side));
    const say = ' · 현재가 ' + price + ' · 한 달 전 ' + won(sp[0]), lab = a.getAttribute('aria-label') ?? '';
    a.setAttribute('aria-label', lab.replace(c.say0, say)); a.querySelector('title').textContent = c.it.name + ' · ' + c.it.val + say;
    a.setAttribute('data-px', String(v.p)); a.setAttribute('data-live', v.t);
    if (!last || v.t > last) last = v.t; n++;
  }
  if (!n) return 0;
  const b = svg.querySelector('text.sa-note1b'), a0 = svg.querySelector('text.sa-note1a');
  if (a0 && b) { const t = (j.status === 'open' ? hm(last) + ' 값이에요.' : (mday(j.day) ?? '') + ' 마지막 값이에요.'); const [na, nb] = note2(+a0.getAttribute('y'), '현재가는', t); a0.setAttribute('x', na.getAttribute('x')); b.setAttribute('x', nb.getAttribute('x')); b.textContent = t; }
  svg.setAttribute('data-live', j.status + ' ' + last);
  return n;
}
function live(svg, day) {
  const codes = [...new Set([...svg.querySelectorAll('a.sa-cell[data-code]')].map(a => a.getAttribute('data-code')))].filter(c => /^[0-9A-Z]{6}$/.test(c)).sort();
  if (!codes.length || typeof fetch !== 'function') return;
  const ask = async () => {
    if (!svg.isConnected && svg.dataset.asked) return; // 쪽이 바뀌면 멈춤
    svg.dataset.asked = '1';
    try {
      if (document.visibilityState === 'visible') {
        const r = await fetch('/api/price?codes=' + codes.join(','));
        const j = r.ok ? await r.json() : null;
        if (j && j.items && typeof j.day === 'string') { relive(svg, j, day ?? ''); if (j.status !== 'open') return; }
        else return;
      }
    } catch { return; }
    setTimeout(ask, 60000);
  };
  setTimeout(ask, 0);
}

/* ── 그림 ── */
function draw(d, opt) {
  const id = 'sa' + (++UID);
  const L = d?.lists ?? {};
  const ovs = new Set((d?.overlap ?? []).map(o => o.name));
  const day = d?.asOf?.board ?? null;
  const pxOf = c => (fin(c?.close) && c.close > 0 && (!c.date || !day || c.date === day) ? c.close : null); // 그날(asOf.board) 마지막 값만 — 다른 날 값이면 「확인 필요」
  const spOf = c => (Array.isArray(c?.c) && c.c.length === 21 && c.c.every(v => fin(v) && v > 0) && pxOf(c) === c.c[20] ? c.c : null); // 21 마지막 값 · 끝 = 현재가일 때만
  const items = (k, nx) => (L[nx ? NXK[k] : k] ?? []).slice(0, 7).map(c => ({k: nx ? NXK[k] : k, kind: nx ? KINDN[k] : KIND[k], code: String(c.code ?? ''), name: String(c.name ?? NEED), val: valText(c, k, nx), star: !nx && ovs.has(String(c.name)), px: pxOf(c), sp: spOf(c), days: c.days, found: c.found, fomo: c.fomo, sx: MARK && c.sx === true}));
  const nNow = KEY.reduce((a, k) => a + Math.min(7, (L[k] ?? []).length), 0), nNx = KEY.reduce((a, k) => a + Math.min(7, (L[NXK[k]] ?? []).length), 0);
  const ROW = 140, HEADH = 58, GAP = 26, CW = MID - PAD - 3; // 줄 넷째 · 다섯째 = 첫 발견 · 며칠째와 포모지수(주문 0123)
  const STRICT = !!d?.strict && d.strict.mode !== 'mark'; // 엄격 셈(주문 0854 · 사장님 2026-11-09 08:54 · 09:02 「어」 — 일곱이 안 되면 통과한 곳만 · 남는 자리는 비움) — 옛 판 자료만
  const MARK = d?.strict?.mode === 'mark'; // 주문 1209(사장님 2026-11-09 12:09 「42개를 다 보이고 엄격한 2개를 수르 계산법으로 찾은 종목이라고 해서 별도로 표기」) — 42칸 그대로 · 엄격 셈을 모두 지난 칸에 「수르 계산법」 표
  const LIST0 = MARK ? 662 : STRICT ? 636 : 608; // 지금 21 | 될 듯 21 · 안전 문장 · 현재가 날짜 두 줄(엄격 셈이면 셋째 줄 「31가지 기준을 모두 지난 곳만」 · 표시 판이면 셋째 · 넷째 줄 「수르 계산법」 풀이) 아래
  const rowsOf = k => STRICT ? 7 : Math.max(items(k, false).length, items(k, true).length, 1);
  const rowH = (k, i) => ROW + (MARK && (items(k, false)[i]?.sx || items(k, true)[i]?.sx) ? BX : 0); // 표가 붙은 칸이 있는 줄만 표 높이만큼 더
  const nSx = MARK ? KEY.reduce((a, k) => a + items(k, false).filter(c => c.sx).length + items(k, true).filter(c => c.sx).length, 0) : 0;
  const H = LIST0 + KEY.reduce((a, k) => a + HEADH + Array.from({length: rowsOf(k)}, (_, i) => rowH(k, i)).reduce((b, v) => b + v, 0) + GAP, 0) + 24;
  const svg = s('svg', {class: 'su-svg su-apple', viewBox: `0 0 ${W} ${H}`, role: 'img', preserveAspectRatio: 'xMidYMid meet', 'data-show': 'now-next', 'data-clean': 'jobs',
    'aria-label': `흰 바탕에 빛나는 구슬 둘 · 지금 ${nNow}곳 · 될 듯 ${nNx}곳` + (MARK ? ` · 수르 계산법으로 찾은 칸 ${nSx}` : '') + (day ? ' · ' + day + ' 자료' : ''), 'data-sx': MARK ? String(nSx) : null});
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
    T(105, PY + 96, String(STRICT ? nNow : nNow || NEED), 'sa-n', {'text-anchor': 'middle'}), T(105 + est(String(nNow), 58) / 2 + 4, PY + 96, '곳', 'sa-unit'),
    T(105, PY + 124, '지금 그런 곳', 'sa-d', {'text-anchor': 'middle'}),
    s('circle', {cx: 248, cy: PY + 22, r: 6.5, class: 'sa-dotB'}), s('circle', {cx: 248, cy: PY + 22, r: 2.6, class: 'sa-dotBc'}), T(262, PY + 27, '될 듯', 'sa-k'),
    T(285, PY + 96, String(STRICT ? nNx : nNx || NEED), 'sa-n', {'text-anchor': 'middle'}), T(285 + est(String(nNx), 58) / 2 + 4, PY + 96, '곳', 'sa-unit'),
    T(285, PY + 124, '곧 그렇게 될 듯한 곳', 'sa-d', {'text-anchor': 'middle'}));
  svg.append(pair, T(MID, PY + 168, '앞날을 맞히는 목록이 아니에요.', 'sa-safe sa-in sa-in3', {'text-anchor': 'middle'}),
    ...note2(PY + 202, '현재가는', (mday(day) ? mday(day) + ' ' : '') + '마지막 값이에요.', 'note1'),
    ...note2(PY + 228, '꺾은선은 한 달,', '옅은 줄은 한 달 전 값이에요.'),
    ...(STRICT ? note2(PY + 254, '31가지 기준을', '모두 지난 곳만 보여요.', 'note3') : MARK ? legendSx(PY + 254) : []));
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
      const row = s('g', {class: 'sa-row'}), rh = rowH(k, i);
      if (i) row.append(s('path', {d: `M${PAD} ${y}H${W - PAD}`, class: 'sa-line'}));
      if (now[i]) row.append(cell(now[i], PAD - 6, y, CW, rh, 'now'));
      else if (STRICT) row.append(empty(PAD - 6, y, CW, ROW, 'now', i === now.length));
      if (nx[i]) row.append(cell(nx[i], MID + 3, y, CW, rh, 'next'));
      else if (STRICT) row.append(empty(MID + 3, y, CW, ROW, 'next', i === nx.length));
      if (!now[i] && !nx[i] && !STRICT) row.append(T(PAD, y + 36, NEED, 'sa-d'));
      sec.append(row);
      y += rh;
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
  if (opt.live !== false) live(svg, d?.asOf?.board ?? null); // 장 중 현재가(주문 2011) — 그림은 바로 돌려주고 값은 받은 뒤에 바꿈
  return svg;
}
