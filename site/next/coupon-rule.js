/* 커피 쿠폰 셈(화면 사본 · 서버 lib/atlas11/coupon.mjs 와 같은 셈 — 시험 tests/atlas11/coupon.test.mjs 가 맞댐 · 사장님 2026-10-19 13:54 · 13:58)
   열한 질문을 끝까지 = 1점 · 하루(서울 날짜) 1점까지 · 10점 = 쿠폰 1장 · 한 사람에 한 달 1장 · 다른 파일을 부르지 않음(노드 시험에서도 읽힘) */
export const RULE = Object.freeze({need: 10, perDay: 1, perMonth: 1, answers: 11});
const KST = 9 * 3600e3;
export const seoulDay = t => { const ms = typeof t === 'number' ? t : Date.parse(t); return Number.isFinite(ms) ? new Date(ms + KST).toISOString().slice(0, 10) : null; };
const fullRecord = r => !!r && typeof r === 'object' && Array.isArray(r.answers) && r.answers.length === RULE.answers && r.answers.every(k => Number.isInteger(k) && k >= 0 && k <= 2);
/** 기록 → 점수 난 날(서울 날짜 · 하루 1점) — 서버 pointDays 와 같은 셈 */
export function pointDays(records, {since = null, now = Date.now()} = {}) {
  const today = seoulDay(now), days = new Set();
  for (const r of Array.isArray(records) ? records : []) {
    if (!fullRecord(r)) continue;
    const d = seoulDay(r.at);
    if (!d || d > today || (since && d <= since)) continue;
    days.add(d);
  }
  return [...days].sort();
}
