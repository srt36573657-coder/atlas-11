/* 큐피트 1 · 2 · 3등 달력(주문 0938 · 사장님 2026-11-10 09:38 「자 달력을 만들어 1.2.3달력을 그리고 찾아낸 그날부터해서 첫페이지처럼 표현햐서 추적해
   그리고 10주씩 무조건 매수해 그리고 나서 수익율률을 추적하기 해봐   잡스라면」)
   길 #/r/c — 모든 사람(주문 1513 · 사장님 2026-11-10 15:13 「모든사람 휴대폰에 열리게 해」) · 아래 탭 「달력」(주문 0040) · 기록 쪽 서랍 맨 앞
   다시 짬(주문 1111-0938 · 사장님 2026-11-11 09:38 「종목이 복이게 하고 그때부터 지금까지 그래프 보이개 하고 매매 결과 직거ㅏㄴ적으로 보이게 하고
   에이번트 11개 가동해서 가방 이상적인 시스템 토론해 잡스라면」) — 일꾼 열하나의 판 · 토론 두 판(docs/design/top3-cal-2026-11-11/debate.md)에서 모인 것:
   ① 맨 위 한 문장(무엇인가 · 가짜 돈) ② 같은 크기 세 칸(늘었어요 · 줄었어요 · 아직 하루치)이 합보다 먼저 ③ 합은 그 밑 작은 두 줄 · 한 줄이 합을 흔들면 접힌 「합을 나눠 보면」
   ④ 한 주 한 줄 달력(월 ~ 금 · 뽑힌 날 칸에 1 · 2 · 3등 차례 세 모양 · 누르면 그 판으로) ⑤ 판마다 「처음 보인 때」 ⑥ 막 뽑힌 판(아직 하루치)은 이름 한 줄
   ⑦ 앞 판은 줄마다 등수 · 이름 · 「100원이 ○원」 · 10주 늘고 준 돈 · 같은 눈금(산 값 = 100 · 점선) · 같은 날 축 꺾은선 ⑧ 최근 다섯 판만 펴고 그 앞은 달마다 접음
   셈(화면에서): 산 값 = 그 판 날 마지막 값 × 10주 · 지금 = 가장 늦은 값 × 10주 · 번 것과 잃은 것을 같은 크기로 · 차례는 판 날 · 등수(번 크기 차례 0) · 「%」 0
   자료 /su/data/su21-book.json(scripts/atlas11/next/su21_book.mjs) · 글은 textContent 로만 · 꾸밈은 클래스(보안 규칙 style-src 'self') */
import {h, s} from '/su/su-fig.js';

export const CSS = '/su/su-book.css';
const RECENT = 5; // 펼쳐 두는 판 수(그 앞은 달마다 접음 — 마흔 날이 돼도 첫 화면 그대로)
const fin = v => typeof v === 'number' && Number.isFinite(v);
const num = v => (fin(v) ? Math.round(v).toLocaleString('ko-KR') : '?');
const DAY = /^\d{4}-\d{2}-\d{2}$/;
const md = d => (DAY.test(d ?? '') ? +d.slice(5, 7) + '월 ' + +d.slice(8, 10) + '일' : '?');
const WD = ['일', '월', '화', '수', '목', '금', '토'];
const wd = d => WD[new Date(d + 'T00:00:00Z').getUTCDay()];
const plus = (d, k) => { const t = new Date(d + 'T00:00:00Z'); t.setUTCDate(t.getUTCDate() + k); return t.toISOString().slice(0, 10); };
const monday = d => plus(d, -((new Date(d + 'T00:00:00Z').getUTCDay() + 6) % 7));
/** 돈 — 「196만 1,000원」 · 「4,500원」(억 · 만 자리) */
export const won = v => {
  if (!fin(v)) return '?';
  const a = Math.round(Math.abs(v)), e = Math.floor(a / 1e8), m = Math.floor((a % 1e8) / 1e4), r = a % 1e4;
  const out = [e ? num(e) + '억' : '', m ? num(m) + '만' : '', r || (!e && !m) ? num(r) : ''].filter(Boolean).join(' ');
  return out + '원';
};
/** 늘고 준 말 — 「11만 4,000원 늘었어요」 · 「그대로예요」 */
export const moved = d => (!fin(d) ? '?' : Math.round(d) > 0 ? won(d) + ' 늘었어요' : Math.round(d) < 0 ? won(d) + ' 줄었어요' : '그대로예요');
/** 산 값 100원어치가 지금 얼마 — 소수 한 자리 · 반올림이 작은 늘고 줆을 「100원」으로 가리면 둘째 자리까지(99.8원 · 100.02원) */
export const per100 = (now, buy) => {
  if (!fin(now) || !fin(buy) || buy <= 0) return null;
  const v = 100 * now / buy;
  const t = Math.round(v * 10) / 10;
  return t === 100 && now !== buy ? Math.round(v * 100) / 100 : t;
};
export const r100 = (now, buy) => { const t = per100(now, buy); return t == null ? '?' : '100원이 ' + t.toLocaleString('ko-KR', {maximumFractionDigits: 2}) + '원'; };
/** 모양 — 늘었어요 ▲ · 줄었어요 ▼ · 그대로 ― · 아직 하루치 ○(색만으로 가르지 않음 · 크기 · 굵기 같음) */
export const SHAPE = Object.freeze({up: '▲', dn: '▼', eq: '―', one: '○'});
const SAID = {up: '늘었어요', dn: '줄었어요', eq: '그대로예요', one: '아직 하루치예요'};
const NTH = ['', '첫', '두', '세', '네', '다섯', '여섯', '일곱', '여덟', '아홉', '열'];
const nth = k => (k < NTH.length ? NTH[k] + ' 번째' : k + '번째');
/** 처음 보인 때 — {day, text: 「11월 9일 오후 4시 20분」}(받은 때 글은 +09:00 · Z 둘 다 읽음) */
export function seenKo(t) {
  const ms = Date.parse(t ?? '');
  if (!Number.isFinite(ms)) return null;
  const k = new Date(ms + 9 * 3600e3), d = k.toISOString().slice(0, 10), hh = k.getUTCHours(), mm = k.getUTCMinutes();
  return {day: d, text: md(d) + ' ' + (hh < 12 ? '오전 ' : '오후 ') + (hh % 12 || 12) + '시' + (mm ? ' ' + mm + '분' : '')};
}

/* ── 셈 — 산 셈마다 산 값 · 지금 값 · 산 날부터 값 줄 · 모양(늘었어요 · 줄었어요 · 그대로 · 아직 하루치) · 같은 회사 몇 번째 ── */
export function bookCalc(B) {
  const qty = fin(B?.qty) ? B.qty : 10;
  const P = Object.fromEntries(Object.entries(B?.px ?? {}).map(([k, v]) => [k, (Array.isArray(v) ? v : Object.entries(v ?? {})).filter(([d, x]) => DAY.test(d) && fin(x) && x > 0).sort(([a], [b]) => a.localeCompare(b))]));
  const times = {};
  const rows = (B?.days ?? []).flatMap(d => (d.picks ?? []).map(p => {
    const got = (P[p.code] ?? []).filter(([dd]) => dd >= d.board), ser = got.length ? got : [[d.board, p.px]], now = ser[ser.length - 1];
    const one = ser.length < 2, st = one ? 'one' : now[1] > p.px ? 'up' : now[1] < p.px ? 'dn' : 'eq';
    times[p.code] = (times[p.code] ?? 0) + 1;
    return {day: d.board, seen: d.seen, place: p.place, k: p.k, code: p.code, name: p.name, buy: p.px, now: now[1], nowDay: now[0], ser, cost: p.px * qty, val: now[1] * qty, one, st, nth: times[p.code]};
  }));
  const cost = rows.reduce((a, r) => a + r.cost, 0), val = rows.reduce((a, r) => a + r.val, 0);
  const n = {up: 0, dn: 0, eq: 0, one: 0};
  for (const r of rows) n[r.st]++;
  const last = rows.map(r => r.nowDay).sort().pop() ?? B?.asOf ?? null;
  return {qty, rows, cost, val, diff: val - cost, last, days: [...new Set(rows.map(r => r.day))].sort(), n};
}
/** 합을 흔든 한 줄 — 늘고 준 돈이 가장 큰 줄이 합의 절반 넘게 움직였을 때만(늘든 줄든) · {r, d, rest} */
export function swing(C) {
  if ((C?.rows?.length ?? 0) < 2) return null;
  const big = C.rows.reduce((a, r) => (Math.abs(r.val - r.cost) > Math.abs(a.val - a.cost) ? r : a));
  const d = big.val - big.cost;
  return d && Math.abs(d) * 2 >= Math.abs(C.diff) ? {r: big, d, rest: C.diff - d} : null;
}
/** 세 칸 — 늘었어요 · 줄었어요 · 셋째 칸(아직 하루치 · 그대로 · 둘 다) */
export function tiles(n) {
  const third = n.one && n.eq ? {st: 'eq', label: '그대로 · 하루치', k: n.eq + n.one} : n.one ? {st: 'one', label: '아직 하루치', k: n.one} : {st: 'eq', label: '그대로', k: n.eq};
  return [{st: 'up', label: '늘었어요', k: n.up}, {st: 'dn', label: '줄었어요', k: n.dn}, third];
}
/** 위아래 눈금 — 모든 그림이 같은 자(산 값 = 100 · 가장 멀리 간 값을 5 단위로 올림 · 10 밑으로는 안 줄임) */
export const yRange = C => Math.max(10, Math.ceil(Math.max(0, ...C.rows.filter(r => !r.one).flatMap(r => r.ser.map(([, v]) => Math.abs(100 * v / r.buy - 100)))) / 5) * 5);

/* ── 그림 — 같은 날 축(먼저 뽑힌 줄일수록 왼쪽에서 시작) · 같은 눈금 · 점선 = 산 값 · 빈 점 = 산 날 · 찬 점 = 마지막 값(도형만 · 글은 HTML) ── */
const SW = 112, SH = 56;
function spark(r, axis, R) {
  const at = new Map(axis.map((d, i) => [d, axis.length > 1 ? 6 + (SW - 12) * i / (axis.length - 1) : SW - 6]));
  const Y = v => Math.min(SH - 4, Math.max(4, SH / 2 - (100 * v / r.buy - 100) / R * (SH / 2 - 6)));
  const pts = r.ser.filter(([d]) => at.has(d)).map(([d, v]) => [at.get(d), Y(v)]);
  if (!pts.length) return null;
  const [x0, y0] = pts[0], [x1, y1] = pts[pts.length - 1];
  return s('svg', {class: 'bk-sp', viewBox: `0 0 ${SW} ${SH}`, width: SW, height: SH, 'aria-hidden': 'true'},
    s('line', {x1: x0.toFixed(1), x2: SW - 6, y1: SH / 2, y2: SH / 2, class: 'bk-base'}),
    pts.length > 1 ? s('path', {d: pts.map(([x, y], i) => (i ? 'L' : 'M') + x.toFixed(1) + ' ' + y.toFixed(1)).join(' '), class: 'bk-line bk-l' + r.st}) : null,
    s('circle', {cx: x0.toFixed(1), cy: y0.toFixed(1), r: 4, class: 'bk-buy'}),
    pts.length > 1 ? s('circle', {cx: x1.toFixed(1), cy: y1.toFixed(1), r: 4.5, class: 'bk-now bk-n' + r.st}) : null);
}
const axisOf = rows => [...new Set(rows.flatMap(r => r.ser.map(([d]) => d)))].sort();
/** 모양 그림(도형 — 글꼴마다 넓이가 다른 글자 대신) · 늘었어요 채운 세모(호박색) · 줄었어요 채운 거꾸로 세모(검정) · 그대로 막대 · 아직 하루치 빈 동그라미 — 크기 같음 */
const shapeOf = (st, size = '') => s('svg', {class: 'bk-sh bk-s' + st + (size ? ' bk-sh' + size : ''), viewBox: '0 0 20 20', 'aria-hidden': 'true', 'data-shape': SHAPE[st]},
  st === 'up' ? s('path', {d: 'M10 2.5 L18.5 17.5 L1.5 17.5 Z'}) : st === 'dn' ? s('path', {d: 'M1.5 2.5 L18.5 2.5 L10 17.5 Z'}) : st === 'eq' ? s('rect', {x: 1.5, y: 8, width: 17, height: 4, rx: 2}) : s('circle', {cx: 10, cy: 10, r: 6.5}));

/** 줄 하나 — 등수 · 이름 · (같은 회사 몇 번째) · 모양 + 100원이 ○원 · 10주 늘고 준 돈 · 그림 · 누르면 그 회사 쪽 */
function row(r, axis, R, qty) {
  return h('a', {class: 'bk-row bk-' + r.st, href: '#/c/' + r.code, 'data-code': r.code, 'data-place': String(r.place), 'data-day': r.day, 'data-st': r.st},
    h('span', {class: 'bk-top'}, h('b', {class: 'bk-pl', text: r.place + '등'}), h('span', {class: 'bk-nm', text: r.name}),
      r.nth > 1 ? h('span', {class: 'bk-tag', text: '같은 회사 ' + nth(r.nth)}) : null, h('i', {class: 'bk-chev', 'aria-hidden': 'true', text: '›'})),
    h('span', {class: 'bk-res'}, shapeOf(r.st), h('span', {class: 'bk-r100', text: r100(r.now, r.buy)})),
    h('span', {class: 'bk-mon', text: qty + '주 ' + (r.one ? '— ' + SAID.one : moved(r.val - r.cost))}),
    spark(r, axis, R));
}
/** 판 하나 — 머리(날 · 요일 · 처음 보인 때) · 아직 하루치면 이름 한 줄 · 아니면 줄 셋 */
function boardSec(day, rs, axis, R, qty, key = false) {
  const one = rs.every(r => r.one), sn = seenKo(rs[0]?.seen);
  return h('section', {class: 'bk-board' + (one ? ' bk-oneday' : ''), 'data-day': day, 'aria-label': md(day) + ' 판'},
    h('h2', {class: 'bk-bh', text: md(day) + ' (' + wd(day) + ') 판' + (one ? ' · 아직 하루치' : '')}),
    sn ? h('p', {class: 'bk-seen', text: '처음 보인 때 ' + sn.text}) : null,
    sn && sn.day > day ? h('p', {class: 'bk-late', text: '판 날보다 늦게 보였어요. 값은 ' + md(day) + ' 마지막 값으로 셌어요.'}) : null,
    one ? h('p', {class: 'bk-names'}, rs.map((r, i) => [i ? h('span', {class: 'bk-dot', 'aria-hidden': 'true', text: '·'}) : null,
      h('span', {class: 'bk-nm1', 'data-code': r.code, 'data-place': String(r.place)}, h('b', {class: 'bk-pl', text: r.place + '등'}), h('span', {text: r.name}))]))
      : h('ol', {class: 'bk-rows'}, rs.map(r => h('li', {}, row(r, axis, R, qty)))),
    key ? h('p', {class: 'bk-key', text: '빈 점은 산 날, 찬 점은 마지막 값이에요. 점선은 산 값이에요.'}) : null);
}

/* ── 달력 — 한 줄(맨 끝 판 날까지 장이 서는 날 다섯 · 월 ~ 금) · 칸마다 요일 · 날 · 1 · 2 · 3등 차례 세 모양 · 누르면 그 판으로
   옆으로 넘기는 띠가 아님(마흔 날이 돼도 칸 다섯 · 숨는 날 0 — 토론 둘째 판 01 · 03 · 04 · 11 의 반대) · 판 없던 날은 빈 칸으로 남음(08) ── */
export function strip(last, n = 5) {
  const out = [];
  for (let d = last; out.length < n; d = plus(d, -1)) { const w = new Date(d + 'T00:00:00Z').getUTCDay(); if (w && w < 6) out.unshift(d); }
  return out;
}
function calendar(C, go) {
  const by = new Map(C.days.map(d => [d, C.rows.filter(r => r.day === d).sort((a, b) => a.place - b.place)]));
  const cells = strip(C.days[C.days.length - 1]).map(d => {
    const rs = by.get(d), top = [h('i', {class: 'bk-wd', text: wd(d)}), h('i', {class: 'bk-dn', text: String(+d.slice(8, 10))})];
    if (!rs) return h('span', {class: 'bk-d', 'aria-hidden': 'true'}, top);
    const b = h('button', {type: 'button', class: 'bk-d bk-pick', 'data-day': d, 'aria-label': md(d) + ' 판 — ' + rs.map(r => r.place + '등 ' + r.name + ' ' + SAID[r.st]).join(' · ') + ' · 누르면 그 판으로 가요'},
      top, h('span', {class: 'bk-3'}, rs.map(r => shapeOf(r.st))));
    b.addEventListener('click', () => go(d));
    return b;
  });
  return h('section', {class: 'bk-cal', 'aria-label': '달력 — 뽑힌 날을 누르면 그 판으로 가요'}, h('div', {class: 'bk-grid'}, cells));
}

/** 지난 달 판 — 접힌 칸(그 달 판 수 · 세 모양 수 같은 크기) · 열면 판마다 줄 셋 */
function monthFold(ym, days, C, R, secs) {
  const rs = C.rows.filter(r => days.includes(r.day)), k = {up: 0, dn: 0, eq: 0, one: 0};
  for (const r of rs) k[r.st]++;
  const axis = axisOf(rs), y = ym.slice(0, 4), lastY = (C.last ?? '').slice(0, 4);
  const inner = days.map(d => { const e = boardSec(d, rs.filter(r => r.day === d).sort((a, b) => a.place - b.place), axis, R, C.qty); secs.set(d, e); return e; });
  return h('details', {class: 'bk-old', 'data-month': ym},
    h('summary', {class: 'bk-olds'}, h('b', {text: (y !== lastY ? y + '년 ' : '') + +ym.slice(5, 7) + '월 판 ' + days.length + '일치'}),
      h('span', {class: 'bk-oldn'}, ['up', 'dn', 'eq', 'one'].filter(st => st !== 'one' || k.one).map(st => h('span', {class: 'bk-oc'}, shapeOf(st), h('span', {text: k[st] + '번'}))))),
    inner);
}

function ensureCss() { if (typeof document !== 'undefined' && !document.querySelector(`link[href="${CSS}"]`)) document.head.append(Object.assign(document.createElement('link'), {rel: 'stylesheet', href: CSS})); }

export async function vBook(X) {
  ensureCss();
  const T = '1 · 2 · 3등 달력';
  const [B, b] = await Promise.all([X.get('/su/data/su21-book.json').catch(() => null), X.base().catch(() => ({}))]);
  if (!B || !Array.isArray(B.days) || !B.days.length) return X.notFound('1 · 2 · 3등 장부를 받지 못했어요. 다시 열어 주세요.');
  const C = bookCalc(B), R = yRange(C), sw = swing(C);
  const desc = [...C.days].reverse(), recent = desc.slice(0, RECENT), older = desc.slice(RECENT);
  const rowsOf = d => C.rows.filter(r => r.day === d).sort((a, b) => a.place - b.place);
  const axis = axisOf(C.rows.filter(r => recent.includes(r.day))), secs = new Map();
  const firstLine = recent.find(d => rowsOf(d).some(r => !r.one)); // 점선 풀이는 선이 있는 첫 판 밑에 한 번
  const list = recent.map(d => { const e = boardSec(d, rowsOf(d), axis, R, C.qty, d === firstLine); secs.set(d, e); return e; });
  const byMon = new Map();
  for (const d of older) { const ym = d.slice(0, 7); if (!byMon.has(ym)) byMon.set(ym, []); byMon.get(ym).push(d); }
  const folds = [...byMon].map(([ym, ds]) => monthFold(ym, ds, C, R, secs));
  let cal = null;
  const go = d => { // 누른 날 판으로(접힌 달이면 엶) · 움직임 줄이기 설정이면 바로
    const e = secs.get(d); if (!e) return;
    const f = e.closest('details'); if (f) f.open = true;
    const still = typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches;
    e.scrollIntoView({block: 'start', behavior: still ? 'auto' : 'smooth'});
    for (const c of cal?.querySelectorAll('.bk-pick') ?? []) c.classList.toggle('bk-on', c.getAttribute('data-day') === d);
  };
  cal = calendar(C, go);
  const hero = h('div', {class: 'su-hero bk', 'data-g': 'su-book', 'data-days': String(C.days.length), 'data-n': String(C.rows.length), 'data-diff': String(Math.round(C.diff)),
    'data-up': String(C.n.up), 'data-dn': String(C.n.dn), 'data-eq': String(C.n.eq), 'data-one': String(C.n.one), 'data-y': String(R)},
    h('p', {class: 'bk-intro', text: '큐피트가 날마다 고른 1 · 2 · 3등을 가짜 돈으로 주식 10주씩 산 셈이에요.'}),
    h('section', {class: 'bk-sum', 'aria-label': '산 셈 모두'},
      h('div', {class: 'bk-tiles'}, tiles(C.n).map(t => h('div', {class: 'bk-tile bk-t' + t.st, 'data-st': t.st}, h('span', {class: 'bk-tv'}, shapeOf(t.st, 'big'), h('b', {class: 'bk-tn', text: t.k + '번'})), h('span', {class: 'bk-tl', text: t.label})))),
      h('p', {class: 'bk-tot', text: '모두 합치면 ' + r100(C.val, C.cost) + ' · ' + moved(C.diff)}),
      h('p', {class: 'bk-cap', text: '산 셈 ' + C.rows.length + '번 · 판 ' + C.days.length + '일치 · ' + md(C.last) + ' 값까지'}),
      h('details', {class: 'bk-split'}, h('summary', {class: 'bk-sps'}, h('b', {text: sw ? '합을 나눠 보면' : '산 값과 지금'}), sw ? h('span', {text: Math.abs(sw.d) > Math.abs(C.diff) ? '한 줄이 합보다 커요' : '한 줄이 합의 절반을 넘어요'}) : null),
        h('p', {class: 'bk-spl bk-tot2', text: '산 값 ' + won(C.cost) + ' → 지금 ' + won(C.val)}),
        sw ? h('p', {class: 'bk-spl', text: md(sw.r.day) + ' ' + sw.r.place + '등 ' + sw.r.name + ' 한 줄이 ' + moved(sw.d)}) : null,
        sw ? h('p', {class: 'bk-spl', text: '그 한 줄을 빼면 ' + moved(sw.rest)}) : null,
        h('p', {class: 'bk-spl', text: '10주씩 사면 값이 비싼 회사가 합을 크게 흔들어요.'}))),
    cal,
    h('div', {class: 'bk-list'}, list, folds));
  const how = h('details', {class: 'bk-how'}, h('summary', {class: 'bk-hs'}, h('b', {text: '이렇게 셌어요'}), h('span', {text: '진짜 돈이 아니에요'})),
    h('ul', {class: 'bk-ul'}, ['그 판 날 마지막 값으로 ' + C.qty + '주씩 산 셈이에요.', '산 뒤에는 팔지 않고 들고 있다고 쳐요.', '「100원이 ○원」은 산 값 100원어치가 지금 얼마인지예요.',
      '모든 선은 같은 눈금이에요. 점선이 산 값이에요.', '같은 회사가 또 뽑히면 따로 한 줄로 적어요.', '판은 장이 끝난 뒤에 나와요. 그 값에 실제로 살 수는 없었어요.',
      '판 날보다 늦게 보인 판도 판 날 값으로 셌어요.', '수수료와 세금은 빼지 않았어요.', '한 번 적은 날은 고치지 않아요.', '값은 네이버 증권 그날 마지막 값이에요.', '지난 기록이에요. 앞날을 맞히지 않아요.'].map(t => h('li', {text: t}))));
  // 탭 4 = 달력(주문 0040 — 이 쪽을 열면 아래 「달력」 탭이 켜짐)
  return {title: T, tab: 4, step: null, kick: C.qty + '주씩 산 셈 · 가짜 돈', h1: T, proper: false, hero, body: [how],
    next: {href: '#/r', label: '지난 기록 한곳'}, asOf: B.asOf ?? null, S: b?.S ?? null};
}
