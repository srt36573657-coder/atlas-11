/* 회사 쪽 값과 실적 셈(주문 1120-1447) — 화면 없이 셀 수 있게 따로 둠(시험 tests/atlas11/su-find.test.mjs) · su-coval.js 가 씀 */
export const COVAL_RULE = 'coval-v1';
export const SPANS = Object.freeze([['1주', 5], ['1달', 20], ['3달', 60], ['1년', 250]]);
const NF = new Intl.NumberFormat('ko-KR');
const ok = v => typeof v === 'number' && Number.isFinite(v);
/** 억 원 → 「333.6조 원」 · 「4,360억 원」(부호는 이름 쪽에서) */
export const eok = v => { const a = Math.abs(v); return a >= 10000 ? (a / 10000).toFixed(1).replace(/\.0$/, '') + '조 원' : NF.format(Math.round(a)) + '억 원'; };
/** 장이 열린 날마다 값(맨 끝 = 지금) — 0 넘는 수만 */
export const closes = co => (Array.isArray(co?.close) ? co.close.filter(v => ok(v) && v > 0) : []);
/** 때마다 100원이 — [[이름, 비율]] · 그만큼 지난 값이 없으면 뺌 */
export function spans(cl) { const n = cl.length, now = cl[n - 1]; return SPANS.filter(([, d]) => n > d).map(([k, d]) => [k, now / cl[n - 1 - d] - 1]); }
/** 1년(또는 있는 만큼) 값 · 가장 크게 떨어진 때(그때까지 가장 높던 값에서 바닥까지) — {y, dd, pkI, loI, base, now, days} */
export function yearOf(cl) {
  const y = cl.slice(-Math.min(cl.length, 251)); if (y.length < 2) return null;
  let pk = y[0], pkAt = 0, dd = 0, pkI = 0, loI = 0;
  for (let i = 1; i < y.length; i++) { if (y[i] > pk) { pk = y[i]; pkAt = i; } const d = y[i] / pk - 1; if (d < dd) { dd = d; pkI = pkAt; loI = i; } }
  return {y, dd, pkI, loI, lo: y[loI], base: y[0], now: y[y.length - 1], days: y.length - 1};
}
