/**
 * ATLAS 4시간 엔진 · 시각 셈 (한국 시각 · 미국 장 마감 · 판 시각별 출발일·목표일)
 *
 *   usCloseUtcMs(date)        미국 장(뉴욕) 그날 16:00 마감의 UTC 밀리초 — 서머타임 규칙을 셈한다(고정 05:00 아님)
 *   slotPlan(sessions, slot, date)  판 시각(slot)·판 날짜(date, 한국) → 출발일(마지막 종가 날) · 목표일 · 흉내 봉인 시각
 *
 * 미국 동부 서머타임(2007년부터, 미국 연방법 15 U.S.C. §260a): 3월 둘째 일요일 02:00 시작 · 11월 첫째 일요일 02:00 끝.
 *   16:00 EDT(UTC−4) = 20:00 UTC = 다음 날 05:00 KST · 16:00 EST(UTC−5) = 21:00 UTC = 다음 날 06:00 KST.
 *   시작·끝 일요일 16:00 은 이미 바뀐 뒤(02:00 에 바뀜)다.
 */

export const KST = '+09:00';

export function isoKst(ms) {
  const d = new Date(ms + 9 * 3600e3);
  return `${d.toISOString().slice(0, 19)}${KST}`;
}

/** 그해 그달(0부터)의 n째 일요일 날짜(1~31) */
export function nthSunday(year, month0, n) {
  const first = new Date(Date.UTC(year, month0, 1)).getUTCDay(); // 0 = 일요일
  return 1 + ((7 - first) % 7) + (n - 1) * 7;
}

/** 'YYYY-MM-DD' 그날 16:00(뉴욕)에 서머타임인가 */
export function usEasternDst(date) {
  const y = Number(date.slice(0, 4));
  const m = Number(date.slice(5, 7));
  const d = Number(date.slice(8, 10));
  if (m < 3 || m > 11) return false;
  if (m > 3 && m < 11) return true;
  if (m === 3) return d >= nthSunday(y, 2, 2);
  return d < nthSunday(y, 10, 1);
}

/** 미국 장 마감(뉴욕 16:00) — UTC 밀리초 */
export function usCloseUtcMs(date) {
  const y = Number(date.slice(0, 4));
  const m = Number(date.slice(5, 7));
  const d = Number(date.slice(8, 10));
  const offset = usEasternDst(date) ? 4 : 5;
  return Date.UTC(y, m - 1, d, 16 + offset, 0, 0);
}

/** 한국 장 마감(15:30 KST) — UTC 밀리초 */
export function krxCloseUtcMs(date) {
  return Date.parse(`${date}T15:30:00${KST}`);
}

/** 거래일 목록에서 date 다음 거래일 */
export function nextSession(sessions, date) {
  return sessions.find(s => s > date) ?? null;
}

/** 거래일 목록에서 date 앞 거래일 */
export function prevSession(sessions, date) {
  let p = null;
  for (const s of sessions) {
    if (s >= date) break;
    p = s;
  }
  return p;
}

/**
 * 판 시각·판 날짜(한국) → 출발일·목표일
 *   16·20시 판(장 뒤): 출발일 = 그날(거래일이어야 함) · 목표일 = 다음 거래일
 *   00·04·08시 판(장 앞): 출발일 = 그날 앞 거래일 · 목표일 = 그날부터 첫 거래일(그날이 쉬는 날이면 다음 거래일)
 *   12시 판: 앞 판(0판)과 같이 출발일 = 그날 · 목표일 = 다음 거래일 [미결: 장중 값이 없어 12시 판은 아직 장중 출발값을 못 씀]
 * 돌려줌 {anchorDate, target, sealAt(흉내 봉인 시각 ISO KST)} · 맞는 날이 없으면 null 칸
 */
export function slotPlan(sessions, slot, date) {
  const sealAt = `${date}T${slot}:00:00${KST}`;
  if (['00', '04', '08'].includes(slot)) {
    const anchorDate = prevSession(sessions, date);
    const target = sessions.find(s => s >= date) ?? null;
    return {anchorDate, target, sealAt};
  }
  return {anchorDate: sessions.includes(date) ? date : null, target: nextSession(sessions, date), sealAt};
}
