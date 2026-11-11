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
const KIND = {hot: '불장', bloom: '꽃이 될', money: '돈이 몰리는', quiet: '조용한데 힘이 모이는'}; // quiet = 넷째 창(주문 1111-1334 · 지금 28곳)
const KINDN = {hot: '불장이 될 듯', bloom: '꽃이 될 듯', money: '돈이 몰릴 듯'};
/* 쉬운 판(주문 1112-0253 · 사장님 2026-11-12 02:53 「… 용어도 명확하게 하고 쉽게 해」) — 묶음 이름 아래 한 줄 뜻(이름은 본질 그대로 · 뜻만 붙임) */
export const MEAN = Object.freeze({hot: '한 달 동안 값이 크게 오른 곳이에요.', bloom: '업종이 오를 때 막 오르기 시작한 곳이에요.', money: '한 달 동안 회사 값이 크게 늘어난 곳이에요.', quiet: '값은 조용한데 큰손이 모으는 곳'});
const MEANH = 30; // 뜻 한 줄 높이
const NXK = {hot: 'hotNext', bloom: 'bloomNext', money: 'moneyNext'};
const W = 390, PAD = 20, MID = W / 2;
const ORBY = 204, PY0 = ORBY + 86 + 64 + 4; // 구슬 가운데 높이 · 구슬 아래 첫 줄(= orbs(…, ORBY).bottom + 4 — LIST0 를 그리기 전에 셈)
const fin = v => typeof v === 'number' && Number.isFinite(v);
const NF = new Intl.NumberFormat('ko-KR');
let UID = 0;

/* ── 값 글(su-women-e.js 의 valText 와 같은 셈) ── */
const pct = x => (x > 0 ? '+' : x < 0 ? '−' : '') + Math.abs(x).toFixed(1) + '%';
/** 늘어난 회사 값(억 원) — 1조가 넘으면 「4.7조」, 아니면 「7,797억」(쉬운 판 · 큰 돈은 조 · 억) */
export const eok = g => (g >= 0 ? '+' : '−') + (Math.abs(g) >= 10000 ? (Math.round(Math.abs(g) / 1000) / 10).toFixed(1) + '조' : NF.format(Math.abs(Math.round(g))) + '억');
function valText(c, k, nx = false) {
  if (nx) {
    const w = c?.why ?? {};
    if (k === 'hot') return fin(w.r20) ? pct(w.r20) : NEED;
    if (k === 'money') return fin(w.gain) ? eok(w.gain) : NEED;
    return fin(w.x5) ? pct(w.x5) : NEED;
  }
  if (k === 'hot') return fin(c?.ch20) ? pct(c.ch20) : NEED;
  if (k === 'money') { const g = c?.why?.gain; return fin(g) ? eok(g) : NEED; }
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
  const tl = it.r3 ? R3L + ' ' + it.r3 + '등' : it.sx ? SXL : ''; // 칸 이름표 글(소리 · 길잡이)
  const a = s('a', {href: '#/c/' + encodeURIComponent(it.code) + '/y/' + it.k, class: 'sa-cell sa-' + side + (it.sx ? ' sa-x' : '') + (it.r3 ? ' sa-x sa-r' + it.r3 : ''), 'data-k': it.k, 'data-name': it.name, 'data-px': it.px ?? '', 'data-code': it.code,
    'data-days': fin(it.days) ? it.days : '', 'data-found': it.found ?? '', 'data-fomo': fin(it.fomo) ? it.fomo : '', 'data-sx': it.sx ? '1' : '', 'data-r3': it.r3 ? String(it.r3) : '',
    'aria-label': (tl ? tl + ' · ' : '') + (side === 'now' ? '지금 ' : '될 듯 ') + it.kind + ' · ' + it.name + ' · ' + it.val + say + (it.star ? ' · 두 목록에 함께' : '') + ' · ' + found + ' · ' + dl + '포모지수 ' + fo});
  const o = it.sx || it.r3 ? BX : 0; // 「수르 계산법」 표(주문 1209) · 1등 · 2등 · 3등 표(주문 1422)가 붙은 칸은 맨 위에 표 · 글은 표 높이만큼 아래로
  a.append(s('title', {text: (tl ? tl + ' · ' : '') + it.name + ' · ' + it.val + say}),
    s('rect', {x, y: y + 1, width: w, height: h - 2, rx: 12, class: 'sa-hit' + (it.sx || it.r3 ? ' sa-hitx' : '')}),
    it.r3 ? sxTag(x + 6, y + 8, it.r3 + '등', 'sa-r3') : it.sx ? sxTag(x + 6, y + 8) : null,
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
const BX = 30, SXT = '큐피트 계산법', SXL = '큐피트 계산법으로 찾은 종목';
function sxTag(x, y, text = SXT, cls = '') {
  const bw = Math.ceil(est(text, 17)) + 18;
  return s('g', {class: 'sa-sx' + (cls ? ' ' + cls : ''), 'aria-hidden': 'true'}, s('rect', {x, y, width: bw, height: 24, rx: 12, class: 'sa-sxb'}), T(f1(x + bw / 2), y + 18, text, 'sa-sxt', {'text-anchor': 'middle'}));
}
/* ── 1등 · 2등 · 3등 표(주문 1422 · 사장님 2026-11-09 14:22 「42개를 찾은 것 중에서 다시 몬테카를로 … 1억 번 … 소거법도 1억 번 해서 1등 2등 3등을 찾아내서 표기」) — 셋째 줄 [1등][2등][3등] 수르 계산법 차례 · 넷째 줄 풀이 ── */
const R3L = '큐피트 계산법';
function legendR3(y, cul = false) {
  const ws = [1, 2, 3].map(n => Math.ceil(est(n + '등', 17)) + 18), gap = 6, tl = R3L + ' 차례', tw = est(tl, 18), all = ws.reduce((a, v) => a + v, 0) + gap * 2 + 8 + tw;
  let x = MID - all / 2;
  const tags = [1, 2, 3].map((n, i) => { const g = sxTag(f1(x), y - 18, n + '등', 'sa-r3'); x += ws[i] + gap; return g; });
  return [s('g', {class: 'sa-sx sa-note3x sa-r3x sa-in sa-in3', 'aria-hidden': 'true'}, ...tags),
    T(f1(x - gap + 8), y, tl, 'sa-note sa-in sa-in3 sa-note3b', {'aria-label': '1등 · 2등 · 3등 표 = ' + tl}),
    ...(cul ? note2(y + 26, '문화 일곱으로 고르고', '1억 번 섞었어요.', 'note4') : note2(y + 26, '1억 번 섞어', '끝까지 남은 차례예요.', 'note4'))];
}
/* ── 새 잣대 1등 · 2등 · 3등(주문 1111-1857 · 사장님 2026-11-11 18:57 「… 선정 기준을 상승할것 같은 종목 으로 해야 해! 에이전트 100개 만들어서 알고리즘 만들어 재대로 상황 공부하고 대입해」)
   — 우량주 365곳에서 고름(42칸 밖일 수 있음)
   주문 1112-0044(사장님 2026-11-12 00:44 「여기 1.2.3에 그래프 그리고 다양한 정보 직관적으로 보이게 하고 클릭 하면 그정보가 이어지게 해」):
   셋째 줄 머리 「● 새 잣대 1 · 2 · 3등 · 누르면 까닭 ›」 → 한 줄에 한 곳(넓은 칸 셋 · 칸마다 누름 140):
     [N등] 이름 · 현재가 · 한 달 오른 만큼 · 업종 · 가장 큰 까닭(잣대 넷 가운데 값이 가장 큰 것) + 오른쪽 한 달 꺾은선(크게 · 한 달 전 값 옅은 줄 · 마지막 값 점) + ›
     누르면 그 회사 새 잣대 쪽(#/c/<번호>/t — 크게 그린 한 달 · 잣대 넷 막대 · 넷을 더한 차례 · 다른 두 곳 · 달력 · 회사 쪽)
   아래 풀이 「새 잣대로 우량주 365곳에서 골랐어요.」 · 그 아래 「1 · 2 · 3등 달력 ›」(날마다 뽑힌 셋 · 따로 누름 48) ── */
const UPR = 140, UPG = 8, USW = 104, USH = 54; // 칸 높이 · 칸 사이 · 꺾은선 넓이 · 높이
export const UP3H = 16 + 3 * (UPR + UPG) - UPG + 120; // 머리 줄 아래 ~ 달력 고리 아래(LIST0 = 셋째 줄 + 이 높이) · 고리 높이 60 = 320 폭에서도 누름 48 넘게(49)
const UPHOW = ['긴 오름세 · 덜 흔들림', '1년 오른 날 몫', '업종 따라잡기', '닷새 눌림'];
/* 쉬운 판(주문 1112-0253 · 사장님 2026-11-12 02:53 「… 용어도 명확하게 하고 쉽게 해」) — 기준 넷을 문장으로(자료 이름은 그대로 · 보이는 말만) */
export const EASYHOW = Object.freeze({'긴 오름세 · 덜 흔들림': '1년 꾸준히 오름', '1년 오른 날 몫': '1년 오른 날이 많음', '업종 따라잡기': '업종보다 덜 오름', '닷새 눌림': '최근 5일 쉼'});
export const easyHow = t => EASYHOW[t] ?? t;
/** 가장 큰 이유 — 기준 넷 가운데 값이 가장 큰 것(같으면 앞 것) · 쉬운 말로 · 값이 없으면 null */
export const topWhy = (r, how = UPHOW) => { const ps = Array.isArray(r?.parts) ? r.parts : []; let j = -1; ps.forEach((v, i) => { if (fin(v) && (j < 0 || v > ps[j])) j = i; }); return j < 0 ? null : easyHow(how[j] ?? UPHOW[j]); };
const ch20Of = r => (fin(r?.ch20) ? r.ch20 : Array.isArray(r?.c) && r.c.length === 21 && fin(r.c[0]) && r.c[0] > 0 && fin(r.c[20]) ? Math.round((r.c[20] / r.c[0] - 1) * 1000) / 10 : null);
function up3Row(r, n, y, day, how) {
  const x = PAD - 6, w = W - 2 * (PAD - 6), sx = x + w - 30 - USW, room = sx - x - 18;
  const px = fin(r?.close) && r.close > 0 && (!r.date || !day || r.date === day) ? r.close : null; // 그날(asOf.board) 마지막 값만
  const sp = Array.isArray(r?.c) && r.c.length === 21 && r.c.every(v => fin(v) && v > 0) && px === r.c[20] ? r.c : null; // 21 마지막 값 · 끝 = 현재가일 때만
  const nm = String(r?.name ?? NEED), tw = Math.ceil(est(n + '등', 17)) + 18, fs = est(nm, 20) <= room - tw - 8 ? 20 : est(nm, 18) <= room - tw - 8 ? 18 : 17;
  const price = px != null ? won(px) : NEED, c20 = sp ? ch20Of(r) : null, mon = '한 달 ' + (c20 != null ? pct(c20) : NEED);
  const ind = String(r?.ind ?? NEED), why = topWhy(r, how), wl = '이유 — ' + (why ?? NEED);
  const say = ' · 현재가 ' + price + ' · ' + mon + (sp ? ' · 한 달 전 ' + won(sp[0]) : '');
  const a = s('a', {href: '#/c/' + encodeURIComponent(String(r?.code ?? '')) + '/t', class: 'sa-up3a sa-x', 'data-place': String(n), 'data-code': String(r?.code ?? ''), 'data-px': px ?? '', 'data-name': nm,
    'aria-label': '오늘의 ' + n + '등 · ' + nm + say + ' · ' + ind + ' · ' + wl + ' · 누르면 이유 쪽'});
  a.append(s('title', {text: '오늘의 ' + n + '등 · ' + nm + say}),
    s('rect', {x, y, width: w, height: UPR, rx: 14, class: 'sa-hit sa-hitx sa-up3hit'}),
    sxTag(x + 10, y + 10, n + '등', 'sa-r3'),
    T(f1(x + 10 + tw + 8), y + 29, nm, 'sa-name sa-up3n', {'font-size': fs}),
    T(x + 12, y + 58, price, 'sa-px' + (px != null ? '' : ' sa-need'), {'font-size': est(price, 18) <= room ? 18 : 17}),
    T(x + 12, y + 84, mon, 'sa-val sa-up3m ' + (c20 != null && c20 < 0 ? 'sa-val-next' : 'sa-val-now') + (c20 != null ? '' : ' sa-need')),
    T(x + 12, y + 108, ind, 'sa-found sa-up3i', {'font-size': 17}),
    T(x + 12, y + 131, wl, 'sa-days sa-up3w' + (why ? '' : ' sa-need'), {'font-size': 17}),
    spark(sp, sx, y + 34, USW, USH, 'now'),
    T(x + w - 14, y + 70, '›', 'sa-chev', {'text-anchor': 'end'}));
  CELL.set(a, {it: {name: nm, val: mon, sp}, side: 'now', sx, sy: y + 34, sw: USW, sh: USH, room, say0: say, up3: true});
  return a;
}
function legendUp3(y, rank, day, how) {
  const R = n => (rank ?? []).find(r => r?.place === n);
  const head = [s('circle', {cx: PAD + 7, cy: y - 7, r: 6, class: 'sa-dotA sa-in sa-in3'}), T(PAD + 20, y, '오늘의 1 · 2 · 3등', 'sa-kh sa-up3h sa-in sa-in3'),
    T(W - PAD, y, '누르면 이유 ›', 'sa-d sa-up3t sa-in sa-in3', {'text-anchor': 'end'})];
  const rows = [1, 2, 3].map((n, i) => up3Row(R(n), n, y + 16 + i * (UPR + UPG), day, how));
  const yb = y + 16 + 3 * (UPR + UPG) - UPG; // 칸 셋 아래
  const cal = s('a', {href: '#/r/c', class: 'sa-up3c', 'aria-label': '1 · 2 · 3등 달력 보기 — 날마다 뽑힌 셋'},
    s('rect', {x: PAD - 6, y: yb + 46, width: W - 2 * (PAD - 6), height: 60, rx: 14, class: 'sa-hit sa-up3ch'}),
    T(MID, yb + 83, '1 · 2 · 3등 달력 — 날마다 뽑힌 셋 ›', 'sa-up3ct', {'text-anchor': 'middle'}));
  return [...head, s('g', {class: 'sa-up3g sa-in sa-in3'}, ...rows), ...note2(yb + 30, '지난 기록 차례예요.', '앞날은 몰라요.', 'note4'), cal];
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
  for (const a of svg.querySelectorAll('a.sa-cell[data-code], a.sa-up3a[data-code]')) { // 새 잣대 1 · 2 · 3등 칸(주문 1112-0044)도 같은 값으로 · 한 달 오른 만큼도 다시 셈
    const c = CELL.get(a), v = j.items?.[a.getAttribute('data-code')];
    if (!c || !v || !fin(v.p) || v.p <= 0 || typeof v.t !== 'string' || !c.it.sp || !(j.day >= day)) continue;
    const sp = j.day > day ? [...c.it.sp.slice(1), v.p] : [...c.it.sp.slice(0, 20), v.p], price = won(v.p);
    const px = a.querySelector('text.sa-px'); if (px) { px.textContent = price; px.setAttribute('font-size', est(price, 18) <= c.room ? 18 : 17); px.classList.remove('sa-need'); }
    a.querySelector('g.sa-spk')?.replaceWith(spark(sp, c.sx, c.sy, c.sw ?? SW, c.sh ?? 34, c.side));
    let say = ' · 현재가 ' + price + ' · 한 달 전 ' + won(sp[0]);
    if (c.up3) { const ch = Math.round((v.p / sp[0] - 1) * 1000) / 10, mon = '한 달 ' + pct(ch), m = a.querySelector('text.sa-up3m'); if (m) { m.textContent = mon; m.classList.remove('sa-need'); m.classList.toggle('sa-val-next', ch < 0); m.classList.toggle('sa-val-now', ch >= 0); } say = ' · 현재가 ' + price + ' · ' + mon + ' · 한 달 전 ' + won(sp[0]); c.it.val = mon; }
    const lab = a.getAttribute('aria-label') ?? '';
    a.setAttribute('aria-label', lab.replace(c.say0, say)); a.querySelector('title').textContent = (c.up3 ? '오늘의 ' + a.getAttribute('data-place') + '등 · ' + c.it.name + say : c.it.name + ' · ' + c.it.val + say); c.say0 = say;
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
  const codes = [...new Set([...svg.querySelectorAll('a.sa-cell[data-code], a.sa-up3a[data-code]')].map(a => a.getAttribute('data-code')))].filter(c => /^[0-9A-Z]{6}$/.test(c)).sort();
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
  const items = (k, nx) => (L[nx ? NXK[k] : k] ?? []).slice(0, 7).map(c => ({k: nx ? NXK[k] : k, kind: nx ? KINDN[k] : KIND[k], code: String(c.code ?? ''), name: String(c.name ?? NEED), val: valText(c, k, nx), star: !nx && ovs.has(String(c.name)), px: pxOf(c), sp: spOf(c), days: c.days, found: c.found, fomo: c.fomo, sx: MARK && c.sx === true, r3: RANK && [1, 2, 3].includes(c.r3) ? c.r3 : null}));
  const QL = opt.mode === 'next' ? [] : (L.quiet ?? []).slice(0, 7).map(c => ({k: 'quiet', kind: KIND.quiet, code: String(c.code ?? ''), name: String(c.name ?? NEED), px: pxOf(c), sp: spOf(c), w: c.why ?? {}, r3q: [1, 2, 3].includes(c.r3q) ? c.r3q : null})); // 넷째 창 조용한데 힘이 모이는(주문 1111-1334) — 처음 쪽에만
  const nNow = KEY.reduce((a, k) => a + Math.min(7, (L[k] ?? []).length), 0) + Math.min(7, (L.quiet ?? []).length), nNx = KEY.reduce((a, k) => a + Math.min(7, (L[NXK[k]] ?? []).length), 0);
  const ROW = 140, HEADH = 58, GAP = 26, CW = MID - PAD - 3; // 줄 넷째 · 다섯째 = 첫 발견 · 며칠째와 포모지수(주문 0123)
  const STRICT = !!d?.strict && d.strict.mode !== 'mark'; // 엄격 셈(주문 0854 · 사장님 2026-11-09 08:54 · 09:02 「어」 — 일곱이 안 되면 통과한 곳만 · 남는 자리는 비움) — 옛 판 자료만
  const RANK = !!d?.top3 && Array.isArray(d.top3.rank), CULT = d?.listRule === 'culture7-v1', UP3 = RANK && d.top3.v === 'up3-v1'; // 주문 1422(사장님 2026-11-09 14:22 「… 1억 번 계산하고 소거법도 1억 번 해서 1등 2등 3등을 찾아내서 표기」) — 42칸 가운데 1등 · 2등 · 3등 칸에 표
  const MARK = d?.strict?.mode === 'mark'; // 주문 1209(사장님 2026-11-09 12:09 「42개를 다 보이고 엄격한 2개를 수르 계산법으로 찾은 종목이라고 해서 별도로 표기」) — 42칸 그대로 · 엄격 셈을 모두 지난 칸에 「수르 계산법」 표
  const LIST0 = UP3 ? PY0 + 266 + UP3H : MARK || RANK ? 662 : STRICT ? 636 : 608; // 새 잣대(주문 1111-1857 · 1112-0044) — 머리 줄 · 넓은 칸 셋(꺾은선 · 값 · 한 달 · 업종 · 까닭) · 풀이 · 달력 고리 // 지금 21 | 될 듯 21 · 안전 문장 · 현재가 날짜 두 줄(엄격 셈이면 셋째 줄 「31가지 기준을 모두 지난 곳만」 · 표시 판이면 셋째 · 넷째 줄 「수르 계산법」 풀이) 아래
  const rowsOf = k => STRICT ? 7 : Math.max(items(k, false).length, items(k, true).length, 1);
  const tagOf = c => c?.sx || c?.r3; // 칸 맨 위 표(수르 계산법 · 1등 · 2등 · 3등)
  const rowH = (k, i) => ROW + (tagOf(items(k, false)[i]) || tagOf(items(k, true)[i]) ? BX : 0); // 표가 붙은 칸이 있는 줄만 표 높이만큼 더
  const nSx = MARK ? KEY.reduce((a, k) => a + items(k, false).filter(c => c.sx).length + items(k, true).filter(c => c.sx).length, 0) : 0;
  const qRows = Math.ceil(QL.length / 2), qRowH = i => ROW + (QL[2 * i]?.r3q || QL[2 * i + 1]?.r3q ? BX : 0); // 넷째 창 — 한 줄에 둘(왼 · 오른) · 등수 표가 붙은 줄만 표 높이만큼 더
  const H = LIST0 + KEY.reduce((a, k) => a + HEADH + MEANH + Array.from({length: rowsOf(k)}, (_, i) => rowH(k, i)).reduce((b, v) => b + v, 0) + GAP, 0) + (QL.length ? HEADH + 30 + Array.from({length: qRows}, (_, i) => qRowH(i)).reduce((b, v) => b + v, 0) + GAP : 0) + 24;
  const svg = s('svg', {class: 'su-svg su-apple', viewBox: `0 0 ${W} ${H}`, role: 'img', preserveAspectRatio: 'xMidYMid meet', 'data-show': 'now-next', 'data-clean': 'jobs',
    'aria-label': `흰 바탕에 빛나는 구슬 둘 · 지금 ${nNow}곳 · 될 듯 ${nNx}곳` + (MARK ? ` · 큐피트 계산법으로 찾은 칸 ${nSx}` : '') + (UP3 ? ' · 오늘의 1등 · 2등 · 3등 ' + d.top3.rank.map(r => r.place + '등 ' + r.name).join(' · ') : RANK ? ' · 1억 번 셈 1등 · 2등 · 3등' : '') + (day ? ' · ' + day + ' 자료' : ''), 'data-sx': MARK ? String(nSx) : null, 'data-r3': RANK ? KEY.flatMap(k => [...items(k, false), ...items(k, true)]).filter(c => c.r3).sort((a, b) => a.r3 - b.r3).map(c => c.r3 + ':' + c.k + ':' + c.code).join(' ') : null});
  svg.append(s('rect', {x: 0, y: 0, width: W, height: H, class: 'sa-bg'}));
  /* 1 한 문장 */
  /* 큰 제목 「지금, 그리고 될 듯.」은 쪽 머리(h1 · 쪽과 함께 바로 그려짐 — 느린 휴대폰 첫 칠함 2.5초)에 · 그림은 부제부터 */
  const top = s('g', {class: 'sa-top'},
    T(MID, 42, '한국 큰 회사 365곳 가운데', 'sa-sub sa-in sa-in1', {'text-anchor': 'middle'}),
    T(MID, 70, '요즘 눈에 띄는 곳을 찾았어요.', 'sa-sub sa-in sa-in1', {'text-anchor': 'middle'}));
  svg.append(top);
  /* 2 물건 하나 — 구슬 둘 */
  const O = orbs(id, ORBY);
  svg.append(O.g);
  /* 3 지금 21 | 될 듯 21 */
  const PY = O.bottom + 4; // = PY0
  const pair = s('g', {class: 'sa-pair sa-in sa-in2'},
    s('path', {d: `M${MID} ${PY + 6}V${PY + 128}`, class: 'sa-div'}),
    s('circle', {cx: 74, cy: PY + 22, r: 7, class: 'sa-dotA'}), T(88, PY + 27, '지금', 'sa-k'),
    T(105, PY + 96, String(STRICT ? nNow : nNow || NEED), 'sa-n', {'text-anchor': 'middle'}), T(105 + est(String(nNow), 58) / 2 + 4, PY + 96, '곳', 'sa-unit'),
    T(105, PY + 124, '지금 눈에 띄는 곳', 'sa-d', {'text-anchor': 'middle'}),
    s('circle', {cx: 248, cy: PY + 22, r: 6.5, class: 'sa-dotB'}), s('circle', {cx: 248, cy: PY + 22, r: 2.6, class: 'sa-dotBc'}), T(262, PY + 27, '될 듯', 'sa-k'),
    T(285, PY + 96, String(STRICT ? nNx : nNx || NEED), 'sa-n', {'text-anchor': 'middle'}), T(285 + est(String(nNx), 58) / 2 + 4, PY + 96, '곳', 'sa-unit'),
    T(285, PY + 124, '곧 그렇게 될 듯한 곳', 'sa-d', {'text-anchor': 'middle'}));
  svg.append(pair, T(MID, PY + 168, '지난 기록이에요. 사라는 말은 아니에요.', 'sa-safe sa-in sa-in3', {'text-anchor': 'middle'}),
    ...note2(PY + 202, '현재가는', (mday(day) ? mday(day) + ' ' : '') + '마지막 값이에요.', 'note1'),
    ...note2(PY + 228, '꺾은선은 한 달,', '옅은 줄은 한 달 전 값이에요.'),
    ...(STRICT ? note2(PY + 254, '31가지 기준을', '모두 지난 곳만 보여요.', 'note3') : UP3 ? legendUp3(PY + 266, d.top3.rank, day, d.top3.how) : RANK ? legendR3(PY + 254, CULT) : MARK ? legendSx(PY + 254) : []));
  /* 4 셋 × 둘 — 한 줄에 짝 하나(왼 지금 · 오른 될 듯) */
  let y = LIST0;
  KEY.forEach((k, ki) => {
    const now = items(k, false), nx = items(k, true), sec = s('g', {class: 'sa-sec sa-sec' + ki});
    sec.append(s('path', {d: `M${PAD} ${y}H${W - PAD}`, class: 'sa-rule'}),
      s('circle', {cx: PAD + 7, cy: y + 33, r: 6, class: 'sa-dotA'}), T(PAD + 20, y + 40, KIND[k], 'sa-kh'),
      s('circle', {cx: MID + 10, cy: y + 33, r: 5.5, class: 'sa-dotB'}), s('circle', {cx: MID + 10, cy: y + 33, r: 2.2, class: 'sa-dotBc'}), T(MID + 23, y + 40, KINDN[k], 'sa-kh'),
      T(PAD, y + 68, MEAN[k], 'sa-mean', {'data-mean': k}));
    y += HEADH + MEANH;
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
  /* 5 넷째 창 — 조용한데 힘이 모이는 일곱(주문 1111-1334 · 사장님 2026-11-11 13:34 「조용한데 에너지가 모이는 주식창을 하나더 만들어라 그래서 총 28개로 만들고 몬태카를로 소거법으로을 찾아내라」)
     한 줄에 둘 · 칸 = 이름 · 한 달 폭 · 현재가 · 이만큼 조용하기 · 외국인과 기관 + 한 달 꺾은선 · 첫 셋에 1 · 2 · 3등 표(몬테카를로 차례) · 누르면 그 회사 · 머리 줄을 누르면 넷째 창 쪽(#/s) */
  if (QL.length) {
    const sec = s('g', {class: 'sa-sec sa-sec3 sa-secq', 'data-sec': 'quiet'});
    const head = s('a', {href: '#/s', class: 'sa-qhead', 'aria-label': '넷째 창 · 조용한데 힘이 모이는 ' + QL.length + '곳 · 걸러 온 길 보기'},
      s('rect', {x: PAD - 6, y: y + 6, width: W - 2 * PAD + 12, height: HEADH + 24, rx: 12, class: 'sa-hit'}),
      s('circle', {cx: PAD + 7, cy: y + 33, r: 6, class: 'sa-dotA'}), T(PAD + 20, y + 40, KIND.quiet + ' ' + QL.length, 'sa-kh'),
      T(PAD + 20, y + 68, MEAN.quiet + ' ›', 'sa-d', {'data-mean': 'quiet'}));
    sec.append(s('path', {d: `M${PAD} ${y}H${W - PAD}`, class: 'sa-rule'}), head);
    y += HEADH + 30;
    for (let i = 0; i < qRows; i++) {
      const row = s('g', {class: 'sa-row'}), rh = qRowH(i);
      if (i) row.append(s('path', {d: `M${PAD} ${y}H${W - PAD}`, class: 'sa-line'}));
      if (QL[2 * i]) row.append(cellQ(QL[2 * i], PAD - 6, y, CW, rh));
      if (QL[2 * i + 1]) row.append(cellQ(QL[2 * i + 1], MID + 3, y, CW, rh));
      sec.append(row);
      y += rh;
    }
    svg.append(sec);
  }
  return svg;
}
/* ── 넷째 창 칸 하나(누르면 그 회사) — 이름 · 한 달 폭(그림 값 「%」) · 현재가 + 한 달 꺾은선 · 이만큼 조용하기(100번에 ○번) · 외국인과 기관 닷새 ── */
function cellQ(it, x, y, w, h) {
  const nm = it.name, fs = est(nm, 20) <= w - 8 ? 20 : est(nm, 18) <= w - 8 ? 18 : 17;
  const sx = x + w - 8 - SW, room = sx - x - 12, q = it.w ?? {};
  const price = it.px != null ? won(it.px) : NEED, pfs = est(price, 18) <= room ? 18 : 17;
  const span = fin(q.span20) ? '폭 ' + q.span20.toFixed(1) + '%' : '폭 ' + NEED;
  const rare = fin(q.p) ? (q.p * 100 < 0.1 ? '100번에 0.1번 아래' : '100번에 ' + (Math.round(q.p * 1000) / 10) + '번') : NEED;
  const fl = fin(q.f) && fin(q.i) ? (q.f + q.i > 0 ? '외국인·기관 들어옴' : q.f + q.i < 0 ? '외국인·기관 나감' : '외국인·기관 같음') : '외국인·기관 ' + NEED;
  const o = it.r3q ? BX : 0, say = (it.px != null ? ' · 현재가 ' + price : '') + (it.sp ? ' · 한 달 전 ' + won(it.sp[0]) : '');
  it.val = span; // 장 중 현재가(relive)가 이름표 · 제목을 고칠 때 씀
  const a = s('a', {href: '#/c/' + encodeURIComponent(it.code), class: 'sa-cell sa-now sa-q' + (it.r3q ? ' sa-x sa-r' + it.r3q : ''), 'data-k': 'quiet', 'data-name': it.name, 'data-px': it.px ?? '', 'data-code': it.code, 'data-r3q': it.r3q ? String(it.r3q) : '',
    'aria-label': (it.r3q ? '조용한 힘 ' + it.r3q + '등 · ' : '') + '지금 ' + it.kind + ' · ' + it.name + ' · ' + span + say + ' · 이만큼 조용하기 ' + rare + ' · ' + fl});
  a.append(s('title', {text: it.name + ' · ' + span + say}),
    s('rect', {x, y: y + 1, width: w, height: h - 2, rx: 12, class: 'sa-hit' + (it.r3q ? ' sa-hitx' : '')}),
    it.r3q ? sxTag(x + 6, y + 8, it.r3q + '등', 'sa-r3') : null,
    T(x + 6, y + 26 + o, nm, 'sa-name', {'font-size': fs}),
    T(x + 6, y + 52 + o, span, 'sa-val sa-val-now'),
    T(x + 6, y + 78 + o, price, 'sa-px' + (it.px != null ? '' : ' sa-need'), {'font-size': pfs}),
    T(x + 6, y + 104 + o, rare, 'sa-found' + (fin(q.p) ? '' : ' sa-need'), {'font-size': 17}),
    T(x + 6, y + 128 + o, fl, 'sa-days', {'font-size': 17}),
    spark(it.sp, sx, y + 40 + o, SW, 34, 'now'));
  CELL.set(a, {it, side: 'now', sx, sy: y + 40 + o, room, say0: say}); // 장 중 현재가(주문 2011)도 다른 칸과 같이 바뀜
  return a;
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
