/* 가짜 돈 연습 셈(사장님 2026-10-19(싱가포르) 15:02 「회원 가입 한 사람에게 가상머니 10억씩을 준다 그래서 30억을 만들면 스타벅스 상품권 10만원짜리 10장 준다 기간은 상관없가 등수도 개의치 않는다 조건은 간단하다」 · 15:04 「일단해」)
   화면(site/next/p-game.js)과 서버(lib/atlas11/game.mjs)가 같이 부름 — 다른 파일을 부르지 않음(노드 시험에서도 읽힘 · tests/atlas11/game.test.mjs)
   계좌 = {schema, start, cash, pos: {번호: {q 주 수, cost 산 돈 합}}, log: [{t, c 번호, s 'b' 산 · 's' 판, q, px}]} · 수수료 · 세금 없음 · 값 = 사이트가 받은 마지막 값(회사 파일 c.price)
   목표 = 합계(현금 + 주 수 × 지금 값)가 30억 원 이상 · 기간 · 순위 없음 · 한 사람에 한 번 */
export const GAME = Object.freeze({schema: 'dori-game-1', start: 1_000_000_000, goal: 3_000_000_000, prize: Object.freeze({count: 10, each: 100_000}), log: 200, maxQ: 10_000_000});
export const CODE_RE = /^[0-9A-Z]{6}$/;
export const newAccount = () => ({schema: GAME.schema, start: GAME.start, cash: GAME.start, pos: {}, log: []});
const okPx = px => Number.isFinite(px) && px > 0 && px < 1e9;
const okQ = q => Number.isInteger(q) && q >= 1 && q <= GAME.maxQ;
/** 계좌가 망가지지 않았나(서버가 받은 값 · 기기 기억을 쓰기 전에) */
export function okAccount(a) {
  if (!a || typeof a !== 'object' || a.schema !== GAME.schema || !Number.isFinite(a.cash) || a.cash < 0 || !a.pos || typeof a.pos !== 'object' || !Array.isArray(a.log)) return false;
  return Object.entries(a.pos).every(([c, p]) => CODE_RE.test(c) && p && okQ(p.q) && Number.isFinite(p.cost) && p.cost >= 0);
}
/** 사기 · 팔기 하나 → {ok, acc(새 계좌) | why} — 계좌를 고치지 않고 새 것을 돌려줌 */
export function trade(acc, {code, side, q, px, t = Date.now()}) {
  if (!okAccount(acc)) return {ok: false, why: 'account'};
  if (!CODE_RE.test(code ?? '')) return {ok: false, why: 'code'};
  if (!okQ(q)) return {ok: false, why: 'qty'};
  if (!okPx(px)) return {ok: false, why: 'price'};
  const pos = {...acc.pos}, cur = pos[code] ? {...pos[code]} : {q: 0, cost: 0};
  let cash = acc.cash;
  if (side === 'b') {
    const pay = q * px; if (pay > cash) return {ok: false, why: 'cash'};
    cash -= pay; cur.q += q; cur.cost += pay;
  } else if (side === 's') {
    if (q > cur.q) return {ok: false, why: 'hold'};
    const avg = cur.cost / cur.q; cash += q * px; cur.cost -= avg * q; cur.q -= q;
  } else return {ok: false, why: 'side'};
  if (cur.q > 0) pos[code] = {q: cur.q, cost: Math.round(cur.cost)}; else delete pos[code];
  const log = [...acc.log, {t, c: code, s: side, q, px}].slice(-GAME.log);
  return {ok: true, acc: {...acc, cash: Math.round(cash), pos, log}};
}
/** 합계 — prices = {번호: 지금 값} · 값을 모르는 종목은 산 돈으로 셈(unknown 에 번호) */
export function valueOf(acc, prices = {}) {
  let stock = 0; const unknown = [];
  for (const [c, p] of Object.entries(acc?.pos ?? {})) { const px = prices[c]; if (okPx(px)) stock += p.q * px; else { stock += p.cost; unknown.push(c); } }
  const total = (acc?.cash ?? 0) + stock;
  return {cash: acc?.cash ?? 0, stock, total, won: unknown.length === 0 && total >= GAME.goal, left: Math.max(0, GAME.goal - total), unknown};
}
/** 원 → 「12억 3,456만 원」(만 원 아래는 버림 · 0 이면 「0원」) */
export function eok(v) {
  const n = Math.max(0, Math.floor(Number(v) || 0)), e = Math.floor(n / 1e8), m = Math.floor((n % 1e8) / 1e4);
  if (!e && !m) return n ? n.toLocaleString('ko-KR') + '원' : '0원';
  return (e ? e.toLocaleString('ko-KR') + '억' : '') + (e && m ? ' ' : '') + (m ? m.toLocaleString('ko-KR') + '만' : '') + ' 원';
}
