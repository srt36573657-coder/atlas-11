/* 큐피트 1 · 2 · 3등 달력(주문 0938 · 사장님 2026-11-10 09:38 「자 달력을 만들어 1.2.3달력을 그리고 찾아낸 그날부터해서 첫페이지처럼 표현햐서 추적해
   그리고 10주씩 무조건 매수해 그리고 나서 수익율률을 추적하기 해봐   잡스라면」)
   길 #/r/c — 모든 사람(주문 1513 · 사장님 2026-11-10 15:13 「모든사람 휴대폰에 열리게 해」) · 아래 탭 「달력」(주문 0040) · 기록 쪽 서랍 맨 앞
   다시 짬(주문 1111-0938 · 사장님 2026-11-11 09:38 「종목이 복이게 하고 그때부터 지금까지 그래프 보이개 하고 매매 결과 직거ㅏㄴ적으로 보이게 하고
   에이번트 11개 가동해서 가방 이상적인 시스템 토론해 잡스라면」) — 일꾼 열하나의 판 · 토론 두 판(docs/design/top3-cal-2026-11-11/debate.md)에서 모인 것:
   ① 맨 위 한 문장(무엇인가 · 가짜 돈) ② 같은 크기 세 칸(늘었어요 · 줄었어요 · 아직 하루치)이 합보다 먼저 ③ 합은 그 밑 작은 두 줄 · 한 줄이 합을 흔들면 접힌 「합을 나눠 보면」
   ④ 한 주 한 줄 달력(월 ~ 금 · 뽑힌 날 칸에 1 · 2 · 3등 차례 세 모양 · 누르면 그 판으로) ⑤ 판마다 「처음 보인 때」 ⑥ 막 뽑힌 판(아직 하루치)은 이름 한 줄
   ⑦ 앞 판은 줄마다 등수 · 이름 · 「100원이 ○원」 · 10주 늘고 준 돈 · 같은 눈금(산 값 = 100 · 점선) · 같은 날 축 꺾은선 ⑧ 최근 다섯 판만 펴고 그 앞은 달마다 접음
   셈(화면에서): 산 값 = 그 판 날 마지막 값 × 10주 · 지금 = 가장 늦은 값 × 10주 · 번 것과 잃은 것을 같은 크기로 · 차례는 판 날 · 등수(번 크기 차례 0) · 「%」 0
   돈 셈 한눈에(주문 1112-1304 · 사장님 2026-11-12 13:04 「지금까지 총 매수한 금액이 얼마고 그담에 날짜별로 매수한 금액이 얼마여 가지고 순실이나 수익이 어떻게 됐는지
   하늘이 알 수 있게끔 바보도 알 수 있게끔」 · docs/design/top3-cal-2026-11-12/order-1304.txt) — 맨 위 「지금까지」(산 돈 · 지금 · 늘었나 줄었나) → 「날짜마다」 표(고른 날 · 산 돈 ·
   늘었나 줄었나 · 그날 세 회사 · 맨 아래 「모두」 = 맨 위와 같은 수) → 판마다 「산 돈 → 지금」 → 줄마다 「10주 ○원어치」 · 줄어든 돈도 같은 크기 · 같은 굵기 · 모양 + 글(색만으로 뜻 0)
   글 바로잡기(사장님 2026-11-14 08:22 「글과 구성이 첫 글자부터 마지막 글자까지 앞뒤가 맞게」 · 점검 U14) — 맨 위 한 문장에 「사고팔기를 권하지 않아요」 · 아직 하루치를 뺀 100원이 ○원
   · 가장 크게 줄어든 줄을 먼저, 늘어난 줄을 다음에 · 옛 기준 · 새 기준을 한 합에 더했음을 밝힘 · 접힌 날 이름 · 「창의 몬테카를로 차례 첫 셋」 같은 속말 뺌
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
/** 접은 날의 처음 ~ 끝(새 날이 앞인 날 목록 — 「11월 3일 ~ 4일」 · 「11월 3일」처럼 하루로 읽히지 않게 · 하루면 그 날) */
const spanDays = ds => { const a = ds[ds.length - 1], b = ds[0]; return a === b ? md(a) : md(a) + ' ~ ' + +b.slice(8, 10) + '일'; };
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
/** 가장 크게 줄어든 줄 · 가장 크게 늘어난 줄(사장님 2026-11-14 08:22 · 본질 8 「손실 먼저」 · 점검 U14 — 합의 절반 문턱에 걸려 손실을 만든 줄이 안 보이지 않게)
 *  값이 나온 줄만 · 한 줄씩 견줌(늘고 준 크기 차례 0) · {lo, hi} — 없으면 null */
export function edges(C) {
  const rs = (C?.rows ?? []).filter(r => !r.one), d = r => r.val - r.cost;
  return {lo: rs.reduce((a, r) => (Math.round(d(r)) < 0 && (!a || d(r) < d(a)) ? r : a), null), hi: rs.reduce((a, r) => (Math.round(d(r)) > 0 && (!a || d(r) > d(a)) ? r : a), null)};
}
/** 더함(주문 1112-1304) — 산 돈 · 지금 · 늘고 준 돈 · 모양(모두 아직 하루치면 one · 늘고 줆은 반올림한 원으로 — moved 와 같은 잣대) */
export function sumOf(rows) {
  const rs = Array.isArray(rows) ? rows : [], cost = rs.reduce((a, r) => a + r.cost, 0), val = rs.reduce((a, r) => a + r.val, 0), diff = val - cost, one = rs.length > 0 && rs.every(r => r.one);
  return {cost, val, diff, one, st: one ? 'one' : Math.round(diff) > 0 ? 'up' : Math.round(diff) < 0 ? 'dn' : 'eq'};
}
/** 날짜마다(주문 1112-1304) — 고른 날마다 그날 셋을 더함 · 날 차례(오래된 날이 앞 — 화면은 뒤집어 새 날이 위) · 늘고 준 크기 차례 0 */
export const dayCalc = C => (C?.days ?? []).map(d => { const rs = C.rows.filter(r => r.day === d).sort((a, b) => a.place - b.place); return {day: d, rows: rs, ...sumOf(rs)}; });
/** 그날 세 회사 이름 조각 — 「셀트리온 ·」 「한올바이오파마 ·」 「진에어」(조각마다 줄을 바꾸지 않음 — 줄은 조각 사이에서만 바뀜 · 「CJ ENM」이 갈라지거나 점이 줄 맨 앞에 오지 않음 · 글은 보통 띄어쓰기) */
export const nameBits = rs => rs.map((r, i) => String(r.name) + (i < rs.length - 1 ? ' ·' : ''));
/** 늘었나 줄었나 칸 글 — 「37만 5,100원」(모양이 늘고 줆을 말함 · 표 머리 「늘었나 줄었나」) · 그대로 · 아직 하루치 */
export const resText = x => (x.st === 'one' ? '아직 하루치' : x.st === 'eq' ? '그대로' : won(x.diff));
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
export const shapeOf = (st, size = '') => s('svg', {class: 'bk-sh bk-s' + st + (size ? ' bk-sh' + size : ''), viewBox: '0 0 20 20', 'aria-hidden': 'true', 'data-shape': SHAPE[st]},
  st === 'up' ? s('path', {d: 'M10 2.5 L18.5 17.5 L1.5 17.5 Z'}) : st === 'dn' ? s('path', {d: 'M1.5 2.5 L18.5 2.5 L10 17.5 Z'}) : st === 'eq' ? s('rect', {x: 1.5, y: 8, width: 17, height: 4, rx: 2}) : s('circle', {cx: 10, cy: 10, r: 6.5}));

/** 줄 하나 — 등수 · 이름 · (같은 회사 몇 번째) · 모양 + 100원이 ○원 · 10주 ○원어치(산 돈 · 주문 1112-1304) · 늘고 준 돈 · 그림 · 누르면 그 회사 쪽 */
export const monText = (r, qty) => [qty + '주 ' + won(r.cost) + '어치', r.one ? SAID.one : moved(r.val - r.cost)];
function row(r, axis, R, qty) {
  return h('a', {class: 'bk-row bk-' + r.st, href: '#/c/' + r.code, 'data-code': r.code, 'data-place': String(r.place), 'data-day': r.day, 'data-st': r.st},
    h('span', {class: 'bk-top'}, h('b', {class: 'bk-pl', text: r.place + '등'}), h('span', {class: 'bk-nm', text: r.name}),
      r.nth > 1 ? h('span', {class: 'bk-tag', text: '같은 회사 ' + nth(r.nth)}) : null, h('i', {class: 'bk-chev', 'aria-hidden': 'true', text: '›'})),
    h('span', {class: 'bk-res'}, shapeOf(r.st), h('span', {class: 'bk-r100', text: r100(r.now, r.buy)})),
    h('span', {class: 'bk-mon'}, monText(r, qty).map((t, i) => h('span', {class: 'bk-mon' + (i + 1), text: t}))),
    spark(r, axis, R));
}
/** 판의 돈 줄(주문 1112-1304) — 「산 돈 ○원 → 지금 ○원」 + 모양 · 늘고 준 돈 · 아직 하루치면 「산 돈 ○원」 + 「아직 하루치예요」 */
export const boardMoney = S => [S.one ? '산 돈 ' + won(S.cost) : '산 돈 ' + won(S.cost) + ' → 지금 ' + won(S.val), S.one ? SAID.one : moved(S.diff)];
/** 판 하나 — 머리(날 · 요일 · 처음 보인 때) · 그날 돈 줄 · 아직 하루치면 이름 한 줄 · 아니면 줄 셋 */
function boardSec(day, rs, axis, R, qty, key = false) {
  const one = rs.every(r => r.one), sn = seenKo(rs[0]?.seen), S = sumOf(rs), [m1, m2] = boardMoney(S);
  return h('section', {class: 'bk-board' + (one ? ' bk-oneday' : ''), 'data-day': day, 'aria-label': md(day) + '에 고른 셋'}, // 쉬운 판(주문 1112-0253) — 「판」 → 「고른 셋 · 고른 날」(일상 말)
    h('h2', {class: 'bk-bh', text: md(day) + ' (' + wd(day) + ')에 고른 셋' + (one ? ' · 아직 하루치' : '')}),
    sn ? h('p', {class: 'bk-seen', text: '처음 보인 때 ' + sn.text}) : null,
    sn && sn.day > day ? h('p', {class: 'bk-late', text: '고른 날보다 늦게 화면에 올라왔어요. 값은 ' + md(day) + ' 마지막 값으로 셌어요.'}) : null,
    h('p', {class: 'bk-bmon', 'data-st': S.st}, h('span', {class: 'bk-bm1', text: m1}), h('span', {class: 'bk-bm2'}, shapeOf(S.st), h('span', {text: m2}))),
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
    const b = h('button', {type: 'button', class: 'bk-d bk-pick', 'data-day': d, 'aria-label': md(d) + '에 고른 셋 — ' + rs.map(r => r.place + '등 ' + r.name + ' ' + SAID[r.st]).join(' · ') + ' · 누르면 그날로 가요'},
      top, h('span', {class: 'bk-3'}, rs.map(r => shapeOf(r.st))));
    b.addEventListener('click', () => go(d));
    return b;
  });
  return h('section', {class: 'bk-cal', 'aria-label': '달력 — 뽑힌 날을 누르면 그날로 가요'}, h('div', {class: 'bk-grid'}, cells));
}

/* ── 돈 셈 한눈에(주문 1112-1304) — 맨 위 「지금까지」 → 「날짜마다」 표(맨 아래 「모두」 = 맨 위와 같은 수 · 영수증 합계처럼) ── */
/** 지금까지 — 산 돈 · 지금 · 늘었나 줄었나(모양 + 글 · 늘어도 줄어도 같은 크기) · 모두 합치면 100원이 ○원 · ○월 ○일 값까지
 *  · 아직 하루치가 섞이면 그것을 뺀 100원이 ○원도 한 줄(사장님 2026-11-14 08:22 「앞뒤가 맞게」 · 점검 U14 — 늘고 줄지 않은 돈이 섞여 줄어든 몫이 작아 보이지 않게) */
function moneyCard(C) {
  const T = sumOf(C.rows), done = C.rows.filter(r => !r.one), D = sumOf(done);
  return h('section', {class: 'bk-money', 'aria-label': '지금까지 산 돈과 지금', 'data-st': T.st},
    h('p', {class: 'bk-mh'}, h('b', {text: '지금까지'}), h('span', {text: md(C.last) + ' 값까지'})),
    h('p', {class: 'bk-ml bk-mcost'}, h('span', {text: '산 돈'}), h('b', {text: won(T.cost)})),
    h('p', {class: 'bk-ml bk-mval'}, h('span', {text: '지금'}), h('b', {text: won(T.val)})),
    h('p', {class: 'bk-mres'}, shapeOf(T.st, 'big'), h('span', {text: T.one ? SAID.one : moved(T.diff)})),
    T.one ? null : h('p', {class: 'bk-m100', text: '모두 합치면 ' + r100(T.val, T.cost)}),
    done.length > 0 && done.length < C.rows.length ? h('p', {class: 'bk-m100', 'data-cut': 'one', text: '아직 하루치를 빼면 ' + r100(D.val, D.cost) + '이에요.'}) : null);
}
/** 날짜마다 — 표 한 장(왼쪽 고른 날 · 그날 세 회사 / 오른쪽 위 산 돈 · 아래 늘었나 줄었나 — 은행 앱 거래 내역처럼 돈은 오른쪽 끝에 맞춤)
 *  새 날이 위 · 다섯 날만 펴고 그 앞은 달마다 접음(판 목록과 같은 셈) · 줄을 누르면 그날 판으로 */
function ledger(C, go) {
  const D = dayCalc(C), desc = [...D].reverse(), recent = desc.slice(0, RECENT), older = desc.slice(RECENT), T = sumOf(C.rows);
  const cells = (a, x) => [h('span', {class: 'bk-dday', text: a}), h('span', {class: 'bk-dcost', text: won(x.cost)}), h('span', {class: 'bk-ddiff', 'data-st': x.st}, shapeOf(x.st), h('span', {class: 'bk-dv', text: resText(x)}))];
  const dayRow = x => {
    const b = h('button', {type: 'button', class: 'bk-drow', 'data-day': x.day, 'data-st': x.st,
      'aria-label': md(x.day) + '에 고른 셋 — 산 돈 ' + won(x.cost) + ' · ' + (x.one ? SAID.one : moved(x.diff)) + ' · 누르면 그날로 가요'},
      cells(md(x.day) + ' (' + wd(x.day) + ')', x), h('span', {class: 'bk-dnm'}, nameBits(x.rows).map((t, i) => [i ? ' ' : null, h('span', {class: 'bk-dn1', text: t})])), h('i', {class: 'bk-dk', 'aria-hidden': 'true', text: '›'}));
    b.addEventListener('click', () => go(x.day));
    return b;
  };
  const byMon = new Map();
  for (const x of older) { const ym = x.day.slice(0, 7); if (!byMon.has(ym)) byMon.set(ym, []); byMon.get(ym).push(x); }
  const lastY = (C.last ?? '').slice(0, 4);
  // 달 줄 이름 = 그 달 접은 날의 처음 ~ 끝(spanDays) · 글 — 여러 날이면 「고른 날 ○일을 한 줄로 모았어요」 · 하루면 「1일을 더했어요」 대신 접어 둔 까닭(점검 U14 · 묶음 꼴은 검사 ㉑ 그대로)
  const mons = [...byMon].map(([ym, xs]) => {
    const S = sumOf(xs.flatMap(x => x.rows)), y = ym.slice(0, 4);
    return h('details', {class: 'bk-dmon', 'data-month': ym},
      h('summary', {class: 'bk-drow bk-dsum', 'data-st': S.st}, cells((y !== lastY ? y + '년 ' : '') + spanDays(xs.map(x => x.day)), S),
        h('span', {class: 'bk-dnm', text: xs.length > 1 ? '고른 날 ' + xs.length + '일을 한 줄로 모았어요 · 눌러서 펴 보세요' : '지난 날이라 접어 뒀어요 · 눌러서 펴 보세요'}), h('i', {class: 'bk-dk', 'aria-hidden': 'true', text: '›'})),
      xs.map(dayRow));
  });
  return h('section', {class: 'bk-days', 'aria-label': '날짜마다 산 돈'},
    h('h2', {class: 'bk-dh', text: '날짜마다'}),
    h('div', {class: 'bk-dhead', 'aria-hidden': 'true'}, h('span', {class: 'bk-hd', text: '고른 날 · 고른 셋'}), h('span', {class: 'bk-hc', text: '산 돈'}), h('span', {class: 'bk-hr', text: '늘었나 줄었나'})),
    h('div', {class: 'bk-drows'}, recent.map(dayRow), mons),
    h('div', {class: 'bk-dtot', 'data-st': T.st}, cells('모두', T)));
}

/** 지난 달 판 — 접힌 칸(그 달 판 수 · 세 모양 수 같은 크기) · 열면 판마다 줄 셋 */
function monthFold(ym, days, C, R, secs) {
  const rs = C.rows.filter(r => days.includes(r.day)), k = {up: 0, dn: 0, eq: 0, one: 0};
  for (const r of rs) k[r.st]++;
  const axis = axisOf(rs), y = ym.slice(0, 4), lastY = (C.last ?? '').slice(0, 4);
  const inner = days.map(d => { const e = boardSec(d, rs.filter(r => r.day === d).sort((a, b) => a.place - b.place), axis, R, C.qty); secs.set(d, e); return e; });
  return h('details', {class: 'bk-old', 'data-month': ym},
    h('summary', {class: 'bk-olds'}, h('b', {text: (y !== lastY ? y + '년 ' : '') + (days.length > 1 ? spanDays(days) + ' · 고른 날 ' + days.length + '일' : md(days[0]) + '에 고른 셋')}), // 「11월 · 고른 날 1일」이 11월 전체가 하루로 읽히지 않게(점검 U14)
      h('span', {class: 'bk-oldn'}, ['up', 'dn', 'eq', 'one'].filter(st => st !== 'one' || k.one).map(st => h('span', {class: 'bk-oc'}, shapeOf(st), h('span', {text: k[st] + '번'}))))),
    inner);
}

function ensureCss() { if (typeof document !== 'undefined' && !document.querySelector(`link[href="${CSS}"]`)) document.head.append(Object.assign(document.createElement('link'), {rel: 'stylesheet', href: CSS})); }

/** 달력 둘 — top3 = 1 · 2 · 3등 달력(42칸 1억 번 셈 · #/r/c) · quiet = 조용한 힘 달력(넷째 창 「조용한데 힘이 모이는」 몬테카를로 차례 첫 셋 · #/r/s
 *  주문 1111-1334 · 사장님 2026-11-11 13:34 「… 이것을 ㅊ 적하는 별도에 달력을 만들어라 잡스라면」) — 쪽 꼴 · 셈은 같고 자료 · 글만 다름 */
export const BOOKS = Object.freeze({
  top3: {src: '/su/data/su21-book.json', title: '1 · 2 · 3등 달력', intro: '날마다 고른 1 · 2 · 3등을 10주씩 샀다고 쳐 본 기록이에요. 사고팔기를 권하지 않아요.',
    miss: '1 · 2 · 3등 장부를 받지 못했어요. 다시 열어 주세요.', buy: '고른 날 마지막 값으로', next: {href: '#/r', label: '지난 기록 한곳'}},
  quiet: {src: '/su/data/su21-qbook.json', title: '조용한 힘 달력', intro: '조용한데 힘이 모이는 창의 1 · 2 · 3등을 10주씩 샀다고 쳐 본 기록이에요. 사고팔기를 권하지 않아요.',
    miss: '조용한 힘 장부를 받지 못했어요. 다시 열어 주세요.', buy: '조용한데 힘이 모이는 곳 가운데 지금처럼 조용하기가 가장 드문 세 곳을 고른 날 마지막 값으로', next: {href: '#/s', label: '조용한데 힘이 모이는 7곳'}}});
/** 새 잣대(주문 1111-1857 · 'up3-v1')로 고른 첫 판 날 — 없으면 null */
export const up3From = B => (Array.isArray(B?.days) ? B.days.filter(d => d?.rule === 'up3-v1').map(d => d.board).sort()[0] ?? null : null);
export async function vBook(X, which = 'top3') {
  ensureCss();
  const K = BOOKS[which] ?? BOOKS.top3, T = K.title;
  const [B, b] = await Promise.all([X.get(K.src).catch(() => null), X.base().catch(() => ({}))]);
  if (!B || !Array.isArray(B.days) || !B.days.length) return X.notFound(K.miss);
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
  // 표 밑 두 조각(사장님 2026-11-14 08:22 「앞뒤가 맞게」 · 점검 U14) — 옛 기준 · 새 기준을 한 합에 더했음을 밝힘 · 가장 크게 줄어든 줄을 먼저, 늘어난 줄을 다음에(합을 흔든 한 줄과 같으면 그 칸에만)
  const from = which === 'top3' ? up3From(B) : null, before = from ? C.days.filter(d => d < from) : [];
  // 새 기준 풀이도 이 한 칸에(맨 위에 두면 「지금까지」와 첫 회사 이름이 첫 화면 아래로 밀림 — 주문 1111-0938 「종목이 보이게」 · 검사 ㉑)
  const ruleNew = '새 기준은 우량주 365곳 가운데 1년 오르다 요즘 쉬거나 내린 곳이에요. 크게 내린 곳도 숨기지 않아요.';
  const oldNote = from ? h('p', {class: 'bk-key', 'data-from': from, text: (before.length ? md(before[before.length - 1]) + '까지는 옛 기준, ' + md(from) + '부터는 새 기준으로 골랐어요. ' : md(from) + '부터는 새 기준으로 골라요. ') + ruleNew
    + (before.length ? ' 「지금까지」와 「모두」는 둘을 함께 더한 값이에요.' : '')}) : null;
  const E = edges(C), edgeLines = [['lo', '줄어든'], ['hi', '늘어난']].map(([k, what]) => { const r = E[k];
    return r && r !== sw?.r ? h('p', {class: 'bk-spl', 'data-edge': k, 'data-st': r.st, text: '가장 크게 ' + what + ' 것은 ' + md(r.day) + ' ' + r.place + '등 ' + r.name + ' ' + C.qty + '주예요. ' + moved(r.val - r.cost) + '.'}) : null; });
  const hero = h('div', {class: 'su-hero bk', 'data-g': 'su-book', 'data-book': which === 'quiet' ? 'quiet' : 'top3', 'data-days': String(C.days.length), 'data-n': String(C.rows.length), 'data-diff': String(Math.round(C.diff)),
    'data-up': String(C.n.up), 'data-dn': String(C.n.dn), 'data-eq': String(C.n.eq), 'data-one': String(C.n.one), 'data-y': String(R)},
    h('p', {class: 'bk-intro', text: K.intro}), // 새 기준 풀이(주문 1111-1857)는 표 밑 bk-key 한 칸에
    moneyCard(C), // 주문 1112-1304 — 맨 위 「지금까지」 → 「날짜마다」 → 합을 흔든 한 줄 → 산 셈 하나씩(세 칸) → 달력 → 판
    ledger(C, go),
    oldNote,
    edgeLines,
    sw ? h('details', {class: 'bk-split'}, h('summary', {class: 'bk-sps'}, h('b', {text: '합을 나눠 보면'}), h('span', {text: Math.abs(sw.d) > Math.abs(C.diff) ? '한 줄이 합보다 커요' : '한 줄이 합의 절반을 넘어요'})),
      h('p', {class: 'bk-spl', text: md(sw.r.day) + ' ' + sw.r.place + '등 ' + sw.r.name + ' 한 줄이 ' + moved(sw.d)}),
      h('p', {class: 'bk-spl', text: '그 한 줄을 빼면 ' + moved(sw.rest)}),
      h('p', {class: 'bk-spl', text: '10주씩 사면 값이 비싼 회사가 합을 크게 흔들어요.'})) : null,
    h('section', {class: 'bk-sum', 'aria-label': '산 셈 하나씩'},
      h('p', {class: 'bk-cap', text: '산 셈 ' + C.rows.length + '번 · 고른 날 ' + C.days.length + '일'}),
      h('div', {class: 'bk-tiles'}, tiles(C.n).map(t => h('div', {class: 'bk-tile bk-t' + t.st, 'data-st': t.st}, h('span', {class: 'bk-tv'}, shapeOf(t.st, 'big'), h('b', {class: 'bk-tn', text: t.k + '번'})), h('span', {class: 'bk-tl', text: t.label}))))),
    cal,
    h('div', {class: 'bk-list'}, list, folds));
  const how = h('details', {class: 'bk-how'}, h('summary', {class: 'bk-hs'}, h('b', {text: '이렇게 셌어요'}), h('span', {text: '진짜 돈이 아니에요'})),
    // 「비싼 회사가 합을 흔들어요」는 한 쪽에 한 번만 — 합을 나눠 보면 칸이 있으면 그 칸에만(점검 U14)
    h('ul', {class: 'bk-ul'}, [K.buy + ' ' + C.qty + '주씩 산 셈이에요.', '1 · 2 · 3등은 고른 날 정한 차례예요. 그 뒤에 늘었는지 줄었는지와는 상관없어요.', '산 돈은 산 날 마지막 값에 ' + C.qty + '주를 곱한 돈이에요. 지금은 가장 늦은 마지막 값에 ' + C.qty + '주를 곱해요.', '산 뒤에는 팔지 않고 들고 있다고 쳐요.', '「100원이 ○원」은 산 값 100원어치가 지금 얼마인지예요.', sw ? null : '10주씩 사면 값이 비싼 회사가 합을 크게 흔들어요.',
      '모든 선은 같은 눈금이에요. 점선이 산 값이에요.', '같은 회사가 또 뽑히면 따로 한 줄로 적어요.', '고르는 일은 모두 장이 끝난 뒤에 해요. 그래서 그날 마지막 값에 실제로 살 수는 없었어요.',
      '고른 날보다 늦게 화면에 올라와도 고른 날 값으로 셌어요.', '수수료와 세금은 빼지 않았어요.', '한 번 적은 날은 고치지 않아요.', '값은 네이버 증권 그날 마지막 값이에요.', '지난 기록이에요. 앞날을 맞히지 않아요.'].filter(Boolean).map(t => h('li', {text: t}))));
  // 탭 4 = 달력(주문 0040 — 이 쪽을 열면 아래 「달력」 탭이 켜짐)
  return {title: T, tab: 4, step: null, kick: C.qty + '주씩 산 셈 · 가짜 돈', h1: T, proper: false, hero, body: [how],
    next: K.next, asOf: B.asOf ?? null, S: b?.S ?? null};
}
