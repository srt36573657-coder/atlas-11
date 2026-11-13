/* 큐피트 정산(주문 1112-1728 · 사장님 2026-11-12 17:28 「정산 페이지를 하나 만들어 테이블 하나 더 만들어 그럼 탭이 여섯 개가 되겠지 그래가지고 말이야
   거기에 일 이 삼 등 매일 사 그담에 불 장인 것도 사고 모든 여덟 개를 종류별로 업종별로 다 사는거별로 분류 별별로」 · 17:30 「어」 — docs/design/settle-2026-11-12/order-1728.txt)
   주문 1112-2042 「자 정산을 오늘 부터 한다 그동안에 기록은 다 지운다」 — 11월 12일부터(order-2042.txt)
   주문 1113-1623(사장님 2026-11-13 16:23 「난 말이야 이렇게 세분화 할 필요 없이 큰값으로만 알고 싶어 불 장 불 장이 될 듯한 거 돈이 몰린 곳 돈이 몰릴 듯한 곳 꽃이 필 듯 …
   조용히 뭐 저기 하는 곳 이렇게 나는 큰 달 락으로 말하고 싶어」 · 16:26 「맞아」 — order-1623.txt) — 업종마다 · 회사마다 표를 뺌 · 묶음마다 큰 값만
   길 #/r/t · 아래 탭 여섯째 「정산」 · 자료 /su/data/su21-settle.json(scripts/atlas11/next/su21_settle.mjs — 여덟 묶음을 고른 날 마지막 값으로 10주씩 산 셈 · 가짜 돈)
   한 쪽: 맨 위 「지금까지」(산 돈 · 지금 · 늘었나 줄었나 — 달력과 같은 꼴) → 「묶음마다」 여덟 줄(1 · 2 · 3등 → 불장 → 불장이 될 듯 → 돈 → 돈이 몰릴 듯 → 꽃 → 꽃이 될 듯 → 조용한 힘
          — 사장님 말씀 차례 그대로 · 늘고 준 크기 차례 0) · 줄마다 이름 · 산 돈 · 늘었나 줄었나만 · 맨 아래 「모두」 = 맨 위와 같은 수
   늘어도 줄어도 같은 크기 · 같은 굵기 · 모양 + 글(색만으로 뜻 0) · 「%」 0 · 글은 textContent 로만 · 꾸밈은 클래스(보안 규칙 style-src 'self') */
import {h} from '/su/su-fig.js';
import {won, moved, r100, sumOf, resText, shapeOf} from '/su/su-book.js';

export const CSS = Object.freeze(['/su/su-book.css', '/su/su-settle.css']);
export const KIND_NAME = Object.freeze({top3: '1 · 2 · 3등', hot: '불장', bloom: '꽃이 될 곳', money: '돈이 몰리는 곳', quiet: '조용한데 힘이 모이는 곳', hotNext: '불장이 될 듯', bloomNext: '꽃이 될 듯', moneyNext: '돈이 몰릴 듯'});
/** 보이는 차례(주문 1113-1623 — 사장님 말씀 차례: 불장 · 불장이 될 듯 · 돈이 몰린 곳 · 돈이 몰릴 듯 · 꽃 · 꽃이 될 듯 · 조용한 힘 · 1 · 2 · 3등은 맨 위 그대로) */
export const SHOW = Object.freeze(['top3', 'hot', 'hotNext', 'money', 'moneyNext', 'bloom', 'bloomNext', 'quiet']);
const DAY = /^\d{4}-\d{2}-\d{2}$/;
const md = d => (DAY.test(d ?? '') ? +d.slice(5, 7) + '월 ' + +d.slice(8, 10) + '일' : '?');
const NF = new Intl.NumberFormat('ko-KR');

/** 산 셈 줄 — [날, 묶음 차례, 번호, 산 값] → {day, k, code, name, ind, buy, now, nowDay, cost, val, one}(지금 = 그 회사 가장 늦은 값 · 산 날 뒤 값이 없으면 아직 하루치) */
export function settleRows(D) {
  const q = Number.isFinite(D?.qty) ? D.qty : 10;
  return (D?.buys ?? []).map(([day, ki, code, buy]) => {
    const [now, nowDay] = D.now?.[code] ?? [buy, day], [name, ind] = D.co?.[code] ?? [code, null];
    return {day, k: D.kinds[ki], code, name: name ?? code, ind: ind ?? '업종 모름', buy, now, nowDay, cost: buy * q, val: now * q, one: !(nowDay > day)};
  });
}
/** 묶어 더함 — 열쇠마다 산 돈 · 지금 · 늘고 준 돈(sumOf) · 산 셈 수 · 고른 날 수 · 첫날 · 회사 수(나온 차례 그대로) */
export function groupBy(rows, key) {
  const m = new Map();
  for (const r of rows) { const k = key(r); if (!m.has(k)) m.set(k, []); m.get(k).push(r); }
  return [...m].map(([k, rs]) => ({key: k, rows: rs, n: rs.length, days: new Set(rs.map(r => r.day)).size, cos: new Set(rs.map(r => r.code)).size, first: rs.map(r => r.day).sort()[0], ...sumOf(rs)}));
}
/** 오늘 판 날보다 앞 날 값으로 센 회사 — 그 날(아니면 null) */
export const lateOf = (r, asOf) => (DAY.test(asOf ?? '') && DAY.test(r?.nowDay ?? '') && r.nowDay < asOf ? r.nowDay : null);
/** 맨 위 작은 한 줄 — 첫날 · 산 셈 수 · 고른 날 수 · 못 센 수 · 앞 날 값으로 센 회사 수(숨기지 않음) */
export const capText = (rows, miss = 0, late = 0) => { const first0 = rows.map(r => r.day).sort()[0] ?? null;
  return (first0 ? md(first0) + '부터 · ' : '') + '산 셈 ' + NF.format(rows.length) + '번 · 고른 날 ' + NF.format(new Set(rows.map(r => r.day)).size) + '일'
    + (miss ? ' · 값이 없어 못 센 ' + NF.format(miss) + '번' : '') + (late ? ' · 앞 날 값으로 센 회사 ' + NF.format(late) + '곳' : ''); };
const none = k => ({key: k, rows: [], n: 0, days: 0, cos: 0, first: null, ...sumOf([])});
/** 묶음마다 — 보이는 차례(SHOW) 그대로 여덟 줄(산 셈이 없는 묶음도 한 줄 · 자료에 없는 묶음은 뺌) */
export const byKind = (D, rows) => SHOW.filter(k => D.kinds.includes(k)).map(k => groupBy(rows.filter(r => r.k === k), () => k)[0] ?? none(k));
/** 늘었나 줄었나 칸 — 산 셈이 없으면 「아직 없음」 */
const diffCell = g => h('span', {class: 'bk-ddiff', 'data-st': g.n ? g.st : 'none'}, g.n ? [shapeOf(g.st), h('span', {class: 'bk-dv', text: resText(g)})] : h('span', {class: 'bk-dv', text: '아직 없음'}));
/** 줄 하나 — 묶음 이름 · 산 돈 · 늘었나 줄었나만(주문 1113-1623 「큰값으로만」) */
const row = (g, name) => h('div', {class: 'bk-drow st-row', 'data-key': String(g.key), 'data-st': g.n ? g.st : 'none'},
  h('span', {class: 'bk-dday', text: name}), h('span', {class: 'bk-dcost', text: won(g.cost)}), diffCell(g));
/** 표 — 이름 · 머리 · 줄 · 맨 아래 모두(= 맨 위) */
function table(cls, title, head, rows, T) {
  return h('section', {class: 'bk-days st-tab ' + cls, 'aria-label': title},
    h('h2', {class: 'bk-dh', text: title}),
    h('div', {class: 'bk-dhead', 'aria-hidden': 'true'}, h('span', {class: 'bk-hd', text: head}), h('span', {class: 'bk-hc', text: '산 돈'}), h('span', {class: 'bk-hr', text: '늘었나 줄었나'})),
    h('div', {class: 'bk-drows'}, rows),
    h('div', {class: 'bk-dtot', 'data-st': T.st}, h('span', {class: 'bk-dday', text: '모두'}), h('span', {class: 'bk-dcost', text: won(T.cost)}), diffCell({...T, n: 1})));
}
function moneyCard(T, asOf) {
  return h('section', {class: 'bk-money st-money', 'aria-label': '지금까지 산 돈과 지금', 'data-st': T.st},
    h('p', {class: 'bk-mh'}, h('b', {text: '지금까지'}), h('span', {text: md(asOf) + ' 값까지'})),
    h('p', {class: 'bk-ml bk-mcost'}, h('span', {text: '산 돈'}), h('b', {text: won(T.cost)})),
    h('p', {class: 'bk-ml bk-mval'}, h('span', {text: '지금'}), h('b', {text: won(T.val)})),
    h('p', {class: 'bk-mres'}, shapeOf(T.st, 'big'), h('span', {text: T.one ? '아직 하루치예요' : moved(T.diff)})),
    T.one ? null : h('p', {class: 'bk-m100', text: '모두 합치면 ' + r100(T.val, T.cost)}));
}
function ensureCss() {
  if (typeof document === 'undefined') return;
  for (const f of CSS) if (!document.querySelector(`link[href="${f}"]`)) document.head.append(Object.assign(document.createElement('link'), {rel: 'stylesheet', href: f}));
}

export async function vSettle(X) {
  ensureCss();
  const [D, b] = await Promise.all([X.get('/su/data/su21-settle.json').catch(() => null), X.base().catch(() => ({}))]);
  if (!D || D.schema !== 'su21-settle-1' || !Array.isArray(D.buys) || !Array.isArray(D.kinds)) return X.notFound('정산 장부를 받지 못했어요. 다시 열어 주세요.');
  const rows = settleRows(D), T = sumOf(rows), K = byKind(D, rows);
  const miss = Object.values(D.miss ?? {}).reduce((a, x) => a + (Number.isFinite(x) ? x : 0), 0);
  const late = new Set(rows.filter(r => lateOf(r, D.asOf)).map(r => r.code)).size;
  const hero = h('div', {class: 'su-hero bk st', 'data-g': 'su-settle', 'data-n': String(rows.length), 'data-days': String(new Set(rows.map(r => r.day)).size), 'data-miss': String(miss)},
    h('p', {class: 'bk-intro', text: '큐피트가 날마다 고른 여덟 묶음을 가짜 돈으로 주식 10주씩 산 셈이에요.'}),
    D.start ? h('p', {class: 'bk-intro st-replay st-start', text: md(D.start) + '부터 센 정산이에요.'}) : null, // 주문 1112-2042 「정산을 오늘 부터 한다 그동안에 기록은 다 지운다」
    D.replayTo ? h('p', {class: 'bk-intro st-replay', text: md(D.replayTo) + '까지는 지금 고르는 법으로 지난 날을 다시 센 기록이에요.'}) : null,
    moneyCard(T, D.asOf),
    h('p', {class: 'bk-cap st-cap', text: capText(rows, miss, late)}),
    table('st-kinds', '묶음마다', '묶음', K.map(g => row(g, KIND_NAME[g.key] ?? g.key)), T));
  const how = h('details', {class: 'bk-how'}, h('summary', {class: 'bk-hs'}, h('b', {text: '이렇게 셌어요'}), h('span', {text: '진짜 돈이 아니에요'})),
    h('ul', {class: 'bk-ul'}, ['여덟 묶음은 1 · 2 · 3등, 불장, 불장이 될 듯, 돈이 몰리는 곳, 돈이 몰릴 듯, 꽃이 될 곳, 꽃이 될 듯, 조용한데 힘이 모이는 곳이에요.',
      '묶음마다 고른 회사를 고른 날 마지막 값으로 ' + (D.qty ?? 10) + '주씩 산 셈이에요.', '산 돈은 산 날 값에 ' + (D.qty ?? 10) + '주를 곱한 돈이에요. 지금은 가장 늦은 마지막 값에 ' + (D.qty ?? 10) + '주를 곱해요.',
      '같은 회사가 여러 묶음이나 여러 날에 들면 그때마다 따로 산 셈이에요.', '산 뒤에는 팔지 않고 들고 있다고 쳐요.',
      D.start ? '정산은 ' + md(D.start) + '부터 셌어요. 그 전 날은 세지 않아요.' : null,
      '1 · 2 · 3등은 달력과 같은 날 · 같은 값이에요.', D.replayTo ? md(D.replayTo) + '까지 날은 지금 고르는 법으로 지난 판을 다시 센 기록이에요. 그 뒤는 그날 적은 기록이에요.' : null,
      D.from?.quiet ? (D.from.quiet !== D.start ? '조용한데 힘이 모이는 곳은 ' + md(D.from.quiet) + '부터 적었어요.' : null) : '조용한데 힘이 모이는 곳은 아직 적은 날이 없어요.',
      miss ? '그날 값을 찾지 못한 산 셈 ' + NF.format(miss) + '번은 세지 않았어요.' : null,
      late ? '오늘 판에 없는 회사 ' + NF.format(late) + '곳은 가장 늦게 찾은 날 값으로 셌어요.' : null,
      '묶음은 늘 같은 차례예요. 늘고 준 크기 차례가 아니에요.', '셋은 장이 끝난 뒤에 골라요. 그 값에 실제로 살 수는 없었어요.', '수수료와 세금은 빼지 않았어요.',
      '값은 네이버 증권 그날 마지막 값이에요.', '지난 기록이에요. 앞날을 맞히지 않아요.'].filter(Boolean).map(t => h('li', {text: t}))));
  // 탭 5 = 정산(주문 1112-1728 — 이 쪽을 열면 아래 「정산」 탭이 켜짐)
  return {title: '정산', tab: 5, step: null, kick: '여덟 묶음 · 10주씩 산 셈 · 가짜 돈', h1: '정산', proper: false, hero, body: [how],
    next: {href: '#/r/c', label: '1 · 2 · 3등 달력'}, asOf: D.asOf ?? null, S: b?.S ?? null};
}
