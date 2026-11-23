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
const mOk = r => fin(r.mv) && r.mv > 0; // 모든 회사와 견줄 줄(주문 1123-2358 · 1124-0336) — 오늘 산 것도 넣음(머리 「산 돈 → 지금」과 같은 셈) · 판 전체 길이 있는 줄만
function groupOf(rs, keyOf, nameOf) {
  const m = new Map();
  for (const r of rs) { const k = keyOf(r), g = m.get(k) ?? m.set(k, {key: k, name: nameOf(r), times: 0, cost: 0, val: 0, mc: 0, mval: 0, mv: 0, ds: new Set(), one: true, code: r.code, buy: r.buy, now: r.now, ks: []}).get(k);
    g.times++; g.cost += r.cost; g.val += r.val; g.ds.add(r.day); g.one = g.one && !!r.one; g.ks.push(r.k);
    if (mOk(r)) { g.mc += r.cost; g.mval += r.val; g.mv += r.mv; } }
  return [...m.values()].map(g => ({...g, days: g.ds.size, ds: undefined}));
}
/* ── 장부 맨 위 칸 「100원을 넣었다면」(주문 1123-2358 · 1124-0226 · 1124-0336 — 사장님 2026-11-24(서울) 03:35 「너 말이 글이 헷갈리게 어렵게 표현하고 있어 바보도 알수 있게 해」
   · 03:36 「그래 더 쉽게 해」) — 우리 장부는 지금 ○원 · 모든 회사에 나눠 넣었으면 ○원 · 우리가 ○원 더 많아요(더 적어요 · 거의 같아요)
   원 단위(소수 없음) · 차이 = 보이는 두 수의 차이 · 오늘 산 것도 넣음(머리 「산 돈 → 지금」과 같은 셈 · 가장 나빴던 날과도 같은 셈)
   모든 회사 = 같은 날 같은 돈을 우량주 판 전체에 고르게 나눠 산 셈(su21_settle.mjs mkLevels) · 「%」 0 · 앞날을 맞히지 않음 · 사고팔기를 권하지 않음 ── */
export const JUDGE_RULE = 'ledger-judge-v2';
/** 산 날이 이만큼 모이기 전에는 「아직 일러요」(장이 열린 날 스무 번 = 한 달) */
export const JUDGE_DAYS = 20;
/** 100원에 ○원 글(소수 첫째 자리 · .0 은 뺌) — 옛 셈과 시험이 씀 */
export const won100 = v => (Math.round(Math.abs(v) * 10) / 10).toFixed(1).replace(/\.0$/, '');
/** {rule, n, cost, val, mv | null, r(우리 100원이) | null, rm(모든 회사 100원이) | null, d(원 단위 차이 = 반올림한 r − 반올림한 rm) | null, st: more · same · less | null, deep: {day, r} | null, days, early}
 *  rows = settleRows(mv 붙은 줄 · 오늘 산 것 포함) · 모든 줄에 모든 회사 값이 있을 때만 견줌 · tt = 쌓인 장부 전체(날마다 100원이 ○원 × 10000) */
export function judgeOf(rows, tt) {
  const R = (Array.isArray(rows) ? rows : []).filter(r => r && typeof r.day === 'string' && fin(r.cost) && r.cost > 0 && fin(r.val)), ok = R.length > 0 && R.every(mOk);
  const cost = R.reduce((s, r) => s + r.cost, 0), val = R.reduce((s, r) => s + r.val, 0), mv = ok ? R.reduce((s, r) => s + r.mv, 0) : null;
  const r = cost > 0 ? 100 * val / cost : null, rm = ok && cost > 0 ? 100 * mv / cost : null, d = r !== null && rm !== null ? Math.round(r) - Math.round(rm) : null;
  let deep = null;
  const ds = Array.isArray(tt?.days) ? tt.days : [], ws = Array.isArray(tt?.w) ? tt.w : [];
  ds.forEach((day, i) => { const w = ws[i]; if (typeof day === 'string' && fin(w) && w > 0 && (!deep || w / 1e4 < deep.r)) deep = {day, r: w / 1e4}; });
  const days = new Set(R.map(x => x.day)).size;
  return {rule: JUDGE_RULE, n: R.length, cost, val, mv, r, rm, d, st: d === null ? null : d > 0 ? 'more' : d < 0 ? 'less' : 'same', deep, days, early: days < JUDGE_DAYS};
}
/** 맨 위 세 줄 — 우리 장부는 지금 ○원이에요 · 모든 회사에 나눠 넣었으면 ○원이에요 · 우리가 ○원 더 많아요(더 적어요 · 둘이 거의 같아요) */
export function judgeLines(J) {
  if (!J || J.r === null) return {ours: '', all: '', cmp: ''};
  return {ours: '우리 장부는 지금 ' + Math.round(J.r) + '원이에요.', all: J.rm === null ? '모든 회사 값은 아직 못 받았어요.' : '모든 회사에 나눠 넣었으면 ' + Math.round(J.rm) + '원이에요.',
    cmp: J.d === null ? '' : J.d > 0 ? '우리가 ' + J.d + '원 더 많아요.' : J.d < 0 ? '우리가 ' + -J.d + '원 더 적어요.' : '둘이 거의 같아요.'};
}
/** 사고 나서 며칠 뒤(주문 1124-0226 · 장부 잣대 2번 · 1124-0336 쉬운 말) — 하루 뒤 · 닷새 뒤 · 스무 날 뒤 */
export const SAME_KS = Object.freeze([[1, '하루 뒤'], [5, '닷새 뒤'], [20, '스무 날 뒤']]);
/** rows = settleRows(hz 붙은 줄) → 날수마다 {k, label, n(그 날수가 지난 산 셈), days(산 날 수), cost, val, r(우리 100원이), rm(모든 회사 100원이) | null}
 *  「지금」과 달리 모든 산 셈을 같은 날수 뒤 값으로 셈 — 오래 든 것만 손해처럼 보이지 않게 · 모든 회사도 같은 날수 뒤 */
export function sameAgeOf(rows) {
  const R0 = (Array.isArray(rows) ? rows : []).filter(r => r && typeof r.day === 'string' && fin(r.cost) && r.cost > 0 && Array.isArray(r.hz));
  return SAME_KS.map(([k, label], j) => {
    const R = R0.filter(r => r.hz[j] && fin(r.hz[j].val)), M = R.filter(r => fin(r.hz[j].mv) && r.hz[j].mv > 0);
    const cost = R.reduce((s, r) => s + r.cost, 0), val = R.reduce((s, r) => s + r.hz[j].val, 0), mc = M.reduce((s, r) => s + r.cost, 0), mv = M.reduce((s, r) => s + r.hz[j].mv, 0);
    return {k, label, n: R.length, days: new Set(R.map(r => r.day)).size, cost, val, r: cost > 0 ? 100 * val / cost : null, rm: mc > 0 && M.length === R.length ? 100 * mv / mc : null};
  });
}
/** 한 줄 글 — 「하루 뒤에는 우리 99원, 모든 회사 99원이에요.」 · 아직 그 날수가 지난 산 셈이 없으면 「스무 날 뒤는 아직 몰라요.」 */
export const sameText = x => (x.n ? x.label + '에는 우리 ' + Math.round(x.r) + '원' + (x.rm === null ? '이에요.' : ', 모든 회사 ' + Math.round(x.rm) + '원이에요.') : x.label + '는 아직 몰라요.');
/** 거르개를 고를 때마다 한 줄(11번 · 1124-0336 쉬운 말) — 「100원이면 우리 97원, 모든 회사 95원이에요.」 · 견줄 줄이 없으면 '' */
export function judgeTail(T) {
  if (!T || !(T.mc > 0) || !fin(T.mv) || !fin(T.mval)) return '';
  return '100원이면 우리 ' + Math.round(100 * T.mval / T.mc) + '원, 모든 회사 ' + Math.round(100 * T.mv / T.mc) + '원이에요.';
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
  const sum = (xs, k) => xs.reduce((s, x) => s + (fin(x[k]) ? x[k] : 0), 0);
  const tot = xs => ({n: xs.length, times: sum(xs, 'times'), cost: sum(xs, 'cost'), val: sum(xs, 'val'), mc: sum(xs, 'mc'), mval: sum(xs, 'mval'), mv: sum(xs, 'mv')});
  if (P.view === 'day') {
    const groups = [...days].reverse().map(day => { const items = groupOf(rs.filter(r => r.day === day), r => r.code, name).filter(x => keep(P.res, x)).sort(cmp); return {day, items, ...tot(items)}; }).filter(g => g.items.length);
    const T = groups.reduce((a, g) => ({n: a.n + g.n, times: a.times + g.times, cost: a.cost + g.cost, val: a.val + g.val, mc: a.mc + g.mc, mval: a.mval + g.mval, mv: a.mv + g.mv}), {n: 0, times: 0, cost: 0, val: 0, mc: 0, mval: 0, mv: 0});
    return {pick: P, days, groups, T};
  }
  const items = groupOf(rs, P.view === 'k' ? r => r.k : r => r.code, P.view === 'k' ? r => r.k : name).filter(x => keep(P.res, x)).sort(cmp);
  return {pick: P, days, items, T: tot(items)};
}
