/* 장부 셈(주문 1120-1705 · 사장님 2026-11-20(마카오) 17:05 「그동안 날짜별로 어떤종목을 … 얼마나 … 그래서 어떻게 됐는지 그래프와 데이타로 … 하단에 … 탭을 만들어서 한눈에 …
   이름이 너무 길어 그래서 적당한 이름 … 그동안 약 8억 정도를 … 모든 거래내역 추적하고 기록하는 것이다」) — 화면 없이 셀 수 있게 따로 둠(시험 tests/atlas11/su-ledger.test.mjs)
   들어오는 줄 = settleRows(정산 장부 su21-settle.json buys 한 줄마다 {day, k, code, name, buy, now, nowDay, cost, val, one}) — 정산 쪽과 같은 셈(가짜 돈 · 꾀마다 10주)
   날마다 = 그날 산 회사(같은 회사를 여러 꾀가 샀으면 한 줄 · 주 수를 더함) · 한 날 안 차례는 손실 먼저(줄어든 돈이 큰 곳부터) · 회사마다 = 모든 날을 더함 · 차례는 산 돈이 큰 곳부터(수익 차례 아님) */
export const LEDGER_RULE = 'ledger-v1';
const fin = v => typeof v === 'number' && Number.isFinite(v);
const byCode = (a, b) => (a.code < b.code ? -1 : a.code > b.code ? 1 : 0);
/** {rule, days: [{day, cos, n, buys, cost, val, one, cumCost, cumVal}], cos: [{code, name, times, qty, cost, val, now, nowDay, days, first, last}], T: {cost, val, buys, cos, days, one}} */
export function ledgerOf(rows, qty = 10) {
  const q = fin(qty) && qty > 0 ? qty : 10, byDay = new Map(), byCo = new Map();
  for (const r of Array.isArray(rows) ? rows : []) {
    if (!r || typeof r.day !== 'string' || typeof r.code !== 'string' || !fin(r.cost) || !fin(r.val)) continue;
    const d = byDay.get(r.day) ?? byDay.set(r.day, new Map()).get(r.day);
    const c = d.get(r.code) ?? d.set(r.code, {code: r.code, name: r.name ?? r.code, ks: [], qty: 0, cost: 0, val: 0, buy: r.buy, now: r.now, nowDay: r.nowDay, one: true}).get(r.code);
    c.ks.push(r.k); c.qty += q; c.cost += r.cost; c.val += r.val; c.one = c.one && !!r.one;
    const a = byCo.get(r.code) ?? byCo.set(r.code, {code: r.code, name: r.name ?? r.code, times: 0, qty: 0, cost: 0, val: 0, now: r.now, nowDay: r.nowDay, ds: new Set(), one: true}).get(r.code);
    a.times++; a.qty += q; a.cost += r.cost; a.val += r.val; a.ds.add(r.day); a.one = a.one && !!r.one;
  }
  let cc = 0, cv = 0;
  const days = [...byDay.keys()].sort().map(day => {
    const cos = [...byDay.get(day).values()].sort((a, b) => (a.val - a.cost) - (b.val - b.cost) || b.cost - a.cost || byCode(a, b));
    const cost = cos.reduce((s, c) => s + c.cost, 0), val = cos.reduce((s, c) => s + c.val, 0);
    cc += cost; cv += val;
    return {day, cos, n: cos.length, buys: cos.reduce((s, c) => s + c.ks.length, 0), cost, val, one: cos.every(c => c.one), cumCost: cc, cumVal: cv};
  });
  const cos = [...byCo.values()].map(a => { const ds = [...a.ds].sort(); return {code: a.code, name: a.name, times: a.times, qty: a.qty, cost: a.cost, val: a.val, now: a.now, nowDay: a.nowDay, one: a.one, days: ds.length, first: ds[0], last: ds[ds.length - 1]}; })
    .sort((a, b) => b.cost - a.cost || byCode(a, b));
  return {rule: LEDGER_RULE, days, cos, T: {cost: cc, val: cv, buys: days.reduce((s, d) => s + d.buys, 0), cos: cos.length, days: days.length, one: days.length > 0 && days.every(d => d.one)}};
}
const norm = t => String(t ?? '').normalize('NFC').toLowerCase().replace(/[\s·.\-()]/g, '');
/** 장부에서 회사 찾기(주문 1120-1804 · 사장님 18:04 「응」 — 「「장부」에서 날짜 대신 회사 이름으로도 찾게 할까요?」의 답) — L.cos 가운데 이름 · 번호가 맞는 곳
 *  차례 = 같음 → 앞이 같음 → 이름 속 · 같은 칸은 산 돈 큰 곳 먼저(수익 차례 아님) · 많아야 n */
export function ledFind(L, q, n = 5) {
  const Q = norm(q); if (!Q) return [];
  const out = [];
  for (const c of Array.isArray(L?.cos) ? L.cos : []) {
    const nm = norm(c.name), cd = String(c.code ?? '').toLowerCase();
    const r = nm === Q || cd === Q ? 0 : nm.startsWith(Q) || cd.startsWith(Q) ? 1 : nm.includes(Q) ? 2 : -1;
    if (r >= 0) out.push([r, c]);
  }
  out.sort((a, b) => a[0] - b[0] || b[1].cost - a[1].cost || byCode(a[1], b[1]));
  return out.slice(0, n).map(x => x[1]);
}
/** 한 회사의 모든 산 셈 — 오래된 날 먼저 · 같은 날은 꾀 차례 */
export function tradesOf(rows, code) {
  return (Array.isArray(rows) ? rows : []).filter(r => r && r.code === code).sort((a, b) => (a.day < b.day ? -1 : a.day > b.day ? 1 : String(a.k) < String(b.k) ? -1 : String(a.k) > String(b.k) ? 1 : 0));
}
/* ── 거르개 열여덟(주문 1120-1817 · 사장님 2026-11-20(마카오) 18:17 「지금 장부를 보면 정리 정돈이 되어 있질 않아 날짜별 이익별 꾀별 많은순 수익율 필터를 18가지로 만들어 잡스라면 어떻게 만들거야」)
   잡스처럼 한 화면 · 묶음 넷(보기 셋 · 기간 여섯 · 결과 셋 · 차례 여섯 = 열여덟) · 처음은 날짜별 · 모두 · 모두 · 줄어든 돈 먼저(손실 먼저 — 본질 8)
   수익 차례(늘어난 돈 먼저 · 100원이 많이 된 차례)는 본질 8 「정산 표는 날마다 수익이 높은 차례로 놓되 줄어든 묶음도 숨기지 않는다」 안에서 — 줄어든 것을 숨기지 않고 「%」 대신 「100원이 ○원」 */
export const LEDGER_VIEWS = Object.freeze([['day', '날짜별'], ['co', '회사별'], ['k', '꾀별']]);
export const LEDGER_SPANS = Object.freeze([['all', '모두', 0], ['d1', '마지막 날', 1], ['d3', '사흘', 3], ['w1', '1주', 5], ['w2', '2주', 10], ['m1', '1달', 20]]); // 장이 열린 날 수(한 달 = 스무 번)
export const LEDGER_RES = Object.freeze([['all', '모두'], ['up', '늘어난 것'], ['dn', '줄어든 것']]);
export const LEDGER_SORTS = Object.freeze([['loss', '줄어든 돈 먼저'], ['gain', '늘어난 돈 먼저'], ['low', '100원이 적게 된 차례'], ['high', '100원이 많이 된 차례'], ['cost', '산 돈 많은 차례'], ['times', '산 횟수 많은 차례']]);
export const LEDGER_PICK0 = Object.freeze({view: 'day', span: 'all', res: 'all', sort: 'loss'});
const stOf = x => (x.one ? 'one' : Math.round(x.val - x.cost) > 0 ? 'up' : Math.round(x.val - x.cost) < 0 ? 'dn' : 'eq');
const keep = (res, x) => res === 'all' || stOf(x) === res;
const CMP = {loss: (a, b) => (a.val - a.cost) - (b.val - b.cost), gain: (a, b) => (b.val - b.cost) - (a.val - a.cost), low: (a, b) => a.val / a.cost - b.val / b.cost, high: (a, b) => b.val / b.cost - a.val / a.cost, cost: (a, b) => b.cost - a.cost, times: (a, b) => b.times - a.times};
const cmpOf = sort => (a, b) => (CMP[sort] ?? CMP.loss)(a, b) || b.cost - a.cost || (a.key < b.key ? -1 : a.key > b.key ? 1 : 0);
function groupOf(rs, keyOf, nameOf) {
  const m = new Map();
  for (const r of rs) { const k = keyOf(r), g = m.get(k) ?? m.set(k, {key: k, name: nameOf(r), times: 0, cost: 0, val: 0, ds: new Set(), one: true, code: r.code, buy: r.buy, now: r.now, ks: []}).get(k);
    g.times++; g.cost += r.cost; g.val += r.val; g.ds.add(r.day); g.one = g.one && !!r.one; g.ks.push(r.k); }
  return [...m.values()].map(g => ({...g, days: g.ds.size, ds: undefined}));
}
/** 거른 장부 — {pick, days(기간 안 장날 · 오래된 날 먼저), groups(날짜별: [{day, items, cost, val, times}] 새 날 먼저 · 빈 날 뺌) | items(회사별 · 꾀별), T: {n, times, cost, val}} */
export function ledgerView(rows, pick = {}) {
  const P = {...LEDGER_PICK0, ...Object.fromEntries(Object.entries(pick ?? {}).filter(([, v]) => typeof v === 'string'))};
  if (!LEDGER_VIEWS.some(x => x[0] === P.view)) P.view = 'day';
  if (!LEDGER_SPANS.some(x => x[0] === P.span)) P.span = 'all';
  if (!LEDGER_RES.some(x => x[0] === P.res)) P.res = 'all';
  if (!CMP[P.sort]) P.sort = 'loss';
  const R = (Array.isArray(rows) ? rows : []).filter(r => r && typeof r.day === 'string' && typeof r.code === 'string' && fin(r.cost) && r.cost > 0 && fin(r.val));
  const all = [...new Set(R.map(r => r.day))].sort(), N = LEDGER_SPANS.find(x => x[0] === P.span)[2], days = N ? all.slice(-N) : all, inDay = new Set(days);
  const rs = R.filter(r => inDay.has(r.day)), cmp = cmpOf(P.sort), name = r => r.name ?? r.code;
  const tot = xs => ({n: xs.length, times: xs.reduce((s, x) => s + x.times, 0), cost: xs.reduce((s, x) => s + x.cost, 0), val: xs.reduce((s, x) => s + x.val, 0)});
  if (P.view === 'day') {
    const groups = [...days].reverse().map(day => { const items = groupOf(rs.filter(r => r.day === day), r => r.code, name).filter(x => keep(P.res, x)).sort(cmp); return {day, items, ...tot(items)}; }).filter(g => g.items.length);
    const T = groups.reduce((a, g) => ({n: a.n + g.n, times: a.times + g.times, cost: a.cost + g.cost, val: a.val + g.val}), {n: 0, times: 0, cost: 0, val: 0});
    return {pick: P, days, groups, T};
  }
  const items = groupOf(rs, P.view === 'k' ? r => r.k : r => r.code, P.view === 'k' ? r => r.k : name).filter(x => keep(P.res, x)).sort(cmp);
  return {pick: P, days, items, T: tot(items)};
}
