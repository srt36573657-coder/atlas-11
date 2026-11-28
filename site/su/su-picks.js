/* 여러 꾀가 고른 회사(주문 1120-0950 · 사장님 2026-11-20(마카오) 09:50 「36가지 종목 중 많이 추천된 순서대로 정리 … 별도의 분석 페이지 … 데이터 추적 시스템 … 꺾은선 그래프」)
   「추천 횟수」 = 그날 서른여섯 꾀 가운데 그 회사를 고른 꾀의 수(화면 글은 「꾀 ○가지가 골랐어요」 — 「추천」이라는 말을 쓰지 않음)
   날마다 기록 = 정산 장부(su21-settle.json buys — 올리기 작업이 장이 끝난 날마다 꾀마다 그날 고른 곳을 한 번 적고 고치지 않음) · 오늘 = 꾀 칸 자료(su21-s36.json lists)
   11월 30일 판부터는 산 셈(buys)이 꾀 다섯 이상이 고른 곳만이라(주문 1128-2046) 그날들은 고른 곳(su21-settle.json pk — 꾀마다 그날 고른 곳 모두)으로 셈
   차례 = 오늘 고른 꾀 수가 많은 차례(같으면 지난 날들 합 · 이름) — 수익 차례가 아님 · 앞날을 맞히지 않음 · 사고팔기를 권하지 않음
   이 파일은 다른 파일을 부르지 않음(시험 tests/atlas11/su-picks.test.mjs 가 바로 읽음) */
export const PICKS_RULE = 'picks-v1';
const KK = /^g(0[1-9]|[12]\d|3[0-6])$/, CODE = /^[0-9A-Z]{6}$/, DAY = /^\d{4}-\d{2}-\d{2}$/;
/** 날마다 회사마다 고른 꾀 수 — {days, cnt: Map(day → Map(code → 꾀 수)), names: {code: [이름, 갈래]}} */
export function dayCounts(D, g) {
  const kinds = Array.isArray(D?.kinds) ? D.kinds : [], seen = new Map(), names = {}, add = (d, c, k) => { const m = seen.get(d) ?? new Map(); seen.set(d, m); (m.get(c) ?? m.set(c, new Set()).get(c)).add(k); };
  const pk = D?.pk && typeof D.pk === 'object' && !Array.isArray(D.pk) ? D.pk : {}; // 고른 곳(11월 30일 판부터 · 주문 1128-2046) — 그날은 산 셈 대신 이것
  for (const b of Array.isArray(D?.buys) ? D.buys : []) {
    if (!Array.isArray(b) || !DAY.test(String(b[0])) || !KK.test(String(kinds[b[1]])) || !CODE.test(String(b[2])) || pk[b[0]]) continue;
    add(b[0], b[2], kinds[b[1]]);
  }
  for (const [d, x] of Object.entries(pk)) if (DAY.test(d) && x && typeof x === 'object') for (const [k, L] of Object.entries(x)) if (KK.test(k) && Array.isArray(L)) for (const c of L) if (CODE.test(String(c))) add(d, String(c), k);
  for (const [c, v] of Object.entries(D?.co ?? {})) if (Array.isArray(v) && typeof v[0] === 'string') names[c] = [v[0], typeof v[1] === 'string' ? v[1] : null];
  const td = typeof g?.asOf?.board === 'string' && DAY.test(g.asOf.board) ? g.asOf.board : null;
  if (td && g?.lists && typeof g.lists === 'object' && ![...seen.keys()].some(d => d > td)) { // 오늘 꾀 칸 자료(장부보다 늦거나 같은 날이면 그날 목록을 그대로)
    const m = new Map();
    for (const [k, L] of Object.entries(g.lists)) if (KK.test(k) && Array.isArray(L)) for (const c of L) { const code = String(c?.code ?? '');
      if (!CODE.test(code)) continue; (m.get(code) ?? m.set(code, new Set()).get(code)).add(k); if (!names[code] && typeof c?.name === 'string') names[code] = [c.name, null]; }
    if (m.size) seen.set(td, m);
  }
  const days = [...seen.keys()].sort(), cnt = new Map(days.map(d => [d, new Map([...seen.get(d)].map(([c, S]) => [c, S.size]))]));
  return {days, cnt, names};
}
/** 여러 꾀가 고른 회사 — {rule, days, from, to, rows: [{code, name, sec, now, n: [날마다 꾀 수], total}]} · 오늘 두 꾀 넘게 고른 곳만 · top 까지 */
export function picksOf(D, g, {min = 2, top = 20} = {}) {
  const {days, cnt, names} = dayCounts(D, g);
  if (!days.length) return {rule: PICKS_RULE, days, from: null, to: null, rows: []};
  const last = cnt.get(days[days.length - 1]), rows = [];
  for (const [code, now] of last) {
    if (now < min) continue;
    const n = days.map(d => cnt.get(d).get(code) ?? 0);
    rows.push({code, name: names[code]?.[0] ?? code, sec: names[code]?.[1] ?? null, now, n, total: n.reduce((a, v) => a + v, 0)});
  }
  rows.sort((a, b) => b.now - a.now || b.total - a.total || a.name.localeCompare(b.name, 'ko') || a.code.localeCompare(b.code));
  return {rule: PICKS_RULE, days, from: days[0], to: days[days.length - 1], rows: rows.slice(0, top)};
}
/** 한 달 값 21개 → 손실 먼저 두 값(가장 낮을 때 · 지금 — 한 달 전 100원 기준) */
export const monthLow = sp => (Array.isArray(sp) && sp.length > 1 && sp.every(v => typeof v === 'number' && Number.isFinite(v) && v > 0)
  ? {low: Math.min(...sp) / sp[0] - 1, now: sp[sp.length - 1] / sp[0] - 1} : null);
