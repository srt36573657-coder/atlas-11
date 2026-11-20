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
