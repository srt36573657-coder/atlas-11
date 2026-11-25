/** 지금 시장 한 줄(주문 1125-1359 · 사장님 2026-11-25(서울) 13:59 「어 해!」 — 12:34 보고 「다음은 「오늘」 화면 맨 위에 「지금 시장」 한 줄을 넣을까요?」의 답
 *    · 치지 짜임 1000가지(주문 1124-1942) 「오늘 탭 맨 위 지금 시장 상태 한 줄 · 열리기 전 · 열림 · 닫힘 · 기준 시각」)
 *  한국 시각으로 장 상태 넷 — 쉬는 날(토 · 일 · 휴장일) · 열리기 전 · 열려 있음(오전 9시 ~ 오후 3시 30분) · 닫힘 · 다음 장날과 여는 때 · 닫는 때 · DOM 없음(시험이 바로 부름)
 *  휴장일 = 공휴일 · 대체 공휴일 · 연말(12월 31일) — 2026 남은 날 · 2027(정부 공휴일 표 · 한국거래소가 해마다 12월에 알리는 휴장일과 맞대어 고칠 것) · 늦게 여는 날 = 해 첫 장날 오전 10시 */
export const KRX_REST = Object.freeze({
  '2026-12-25': '성탄절', '2026-12-31': '연말 휴장',
  '2027-01-01': '신정', '2027-02-08': '설날 연휴', '2027-02-09': '설날 대체 휴일', '2027-03-01': '삼일절', '2027-05-03': '근로자의 날 대체 휴일', '2027-05-05': '어린이날', '2027-05-13': '부처님 오신 날',
  '2027-07-19': '제헌절 대체 휴일', '2027-08-16': '광복절 대체 휴일', '2027-09-14': '추석 연휴', '2027-09-15': '추석', '2027-09-16': '추석 연휴', '2027-10-04': '개천절 대체 휴일', '2027-10-11': '한글날 대체 휴일',
  '2027-12-27': '성탄절 대체 휴일', '2027-12-31': '연말 휴장'});
export const OPEN_LATE = Object.freeze({'2027-01-04': 600}); // 해 첫 장날 = 오전 10시(분)
export const OPEN_MIN = 540, CLOSE_MIN = 930; // 오전 9시 · 오후 3시 30분(분)
const pad = n => String(n).padStart(2, '0');
const WD = ['일요일', '월요일', '화요일', '수요일', '목요일', '금요일', '토요일'];
/** 한국 시각 — {day: 'YYYY-MM-DD', min: 0 ~ 1439} */
export const kst = ms => { const k = new Date(ms + 9 * 3600e3); return {day: k.getUTCFullYear() + '-' + pad(k.getUTCMonth() + 1) + '-' + pad(k.getUTCDate()), min: k.getUTCHours() * 60 + k.getUTCMinutes()}; };
export const isTradeDay = day => { const wd = new Date(day + 'T00:00:00Z').getUTCDay(); return wd !== 0 && wd !== 6 && !(day in KRX_REST); };
export const nextTradeDay = day => { const d = new Date(day + 'T00:00:00Z'); for (let i = 0; i < 30; i++) { d.setUTCDate(d.getUTCDate() + 1); const s = d.toISOString().slice(0, 10); if (isTradeDay(s)) return s; } return null; };
export const openMin = day => OPEN_LATE[day] ?? OPEN_MIN;
/** 지금 장 상태 — {st: 'rest' | 'pre' | 'open' | 'closed', day, at(오늘 여는 · 닫는 때 분), next(다음 장날)} */
export function mktNow(ms) {
  const {day, min} = kst(ms);
  if (!isTradeDay(day)) return {st: 'rest', day, next: nextTradeDay(day), why: KRX_REST[day] ?? null};
  const o = openMin(day);
  if (min < o) return {st: 'pre', day, at: o};
  if (min < CLOSE_MIN) return {st: 'open', day, at: CLOSE_MIN};
  return {st: 'closed', day, next: nextTradeDay(day)};
}
export const hmText = m => { const H = Math.floor(m / 60), M = m % 60; return (H < 12 ? '오전 ' : '오후 ') + (H % 12 === 0 ? 12 : H % 12) + '시' + (M ? ' ' + M + '분' : ''); };
export const dayText = day => { const d = new Date(day + 'T00:00:00Z'); return (d.getUTCMonth() + 1) + '월 ' + d.getUTCDate() + '일 ' + WD[d.getUTCDay()]; };
/** 말 — {t: 큰 말, s: 다음 일} */
export function mktWords(m) {
  const nx = m.next ? '다음 장날은 ' + dayText(m.next) + ' ' + hmText(openMin(m.next)) + '예요' : '';
  if (m.st === 'rest') return {t: '오늘은 장이 쉬는 날이에요', s: nx};
  if (m.st === 'pre') return {t: '장 열리기 전이에요', s: '오늘 ' + hmText(m.at) + '에 열려요'};
  if (m.st === 'open') return {t: '장이 열려 있어요', s: hmText(m.at) + '에 닫혀요'};
  return {t: '오늘 장은 닫혔어요', s: nx};
}
