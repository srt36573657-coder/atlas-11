/* ATLAS 11 · 공용 도우미 (형식·날짜·문장) — 예측 없음(2026-10-04 15:37 사장님 「이제 예측을 하지 않는다」)
   글 날짜 「10월 2일(금)」 · 그래프 눈금 「10/02」 · 시각 「16:01 KST」
   숫자: 값은 단위(원·%·포인트) · 변화는 부호(+/−) · 소수 자리 고정(가격 0 · 등락 2 · 지수 2) */
import {t, LANG, LOCALE} from './i18n.js';
export const finite = v => typeof v === 'number' && Number.isFinite(v);
/** 시장 — 2026-10-05 18:02 사장님 「이제는 미국 주식도 같은 개념으로 365개를 만들어라」
   같은 화면 코드를 한국 판(/)과 미국 판(/us/)이 함께 쓴다 · 판 목록(manifest.place)을 따르고 없으면 한국 값(app.js 가 처음에 setPlace)
   close = 값 줄 「n월 n일(요일) 15:30 종가」 · closeAt = 시장 띠 「… 15:30 KST 종가」 · exchange = 「마지막 종가: 한국거래소 정규장 15:30 종가」 */
export const place = {id: 'kr', label: '한국', unit: '원', digits: 0, close: '15:30', closeAt: '15:30 KST', exchange: '한국거래소 정규장',
  flows: true, foot: '종가: 한국거래소 정규장 15:30 종가(네이버 증권) · 수급·기사·공시: 네이버 증권 · 일정: 공식 발표처 · 거래일 16:00에 새로 올림',
  notDo: '지난 기록만 보여 줍니다(거래일 15:30 종가 · 16:00에 올림)', contextSource: '출처: 네이버 증권(종목 투자자 동향 · 뉴스 · 공시) · 기사는 제목만 저장(본문 없음)'};
export function setPlace(p) { if (p && typeof p === 'object') Object.assign(place, p); }
/** 값(한국 = 원 · 정수 / 미국 = 달러 · 소수 둘째 자리) — 이름은 옛 그대로 won */
export const won = v => finite(v) ? (place.digits ? v.toLocaleString('ko-KR', {minimumFractionDigits: place.digits, maximumFractionDigits: place.digits}) : Math.round(v).toLocaleString('ko-KR')) + place.unit : '없음';
export const num = (v, d = 0) => finite(v) ? v.toLocaleString('ko-KR', {minimumFractionDigits: d, maximumFractionDigits: d}) : '없음';
export const pct = (v, d = 2) => finite(v) ? (v > 0 ? '+' : v < 0 ? '−' : '') + (Math.abs(v) * 100).toFixed(d) + '%' : '없음';
/** 이미 % 단위인 값(예: 지수 등락 0.46) → 「+0.46%」 */
export const pctRaw = (v, d = 2, signed = false) => finite(v) ? (signed ? (v > 0 ? '+' : v < 0 ? '−' : '') : v < 0 ? '−' : '') + Math.abs(v).toFixed(d) + '%' : '없음';
export const pts = v => finite(v) ? v.toLocaleString('ko-KR', {minimumFractionDigits: 2, maximumFractionDigits: 2}) + '포인트' : '없음';
export const signCls = v => finite(v) ? (v > 0 ? 'up' : v < 0 ? 'down' : 'flat') : '';
/** 지난 등락 표시(색 하나에만 기대지 않게 ▲▼ 를 함께) */
export const signMark = v => finite(v) ? (v > 0 ? '▲' : v < 0 ? '▼' : '—') : '';
export const shortDate = d => d ? d.slice(5, 10).replace('-', '/') : '—';
export const weekday = d => d ? ['일', '월', '화', '수', '목', '금', '토'][new Date(d.slice(0, 10) + 'T00:00:00Z').getUTCDay()] : '';
export const korDate = d => d ? `${Number(d.slice(5, 7))}월 ${Number(d.slice(8, 10))}일(${weekday(d)})` : '—';
export const md = d => d ? `${Number(d.slice(5, 7))}월 ${Number(d.slice(8, 10))}일` : '';
/** ISO 시각 → 한국 날짜·시각 */
export const kst = iso => { const t = new Date(Date.parse(iso) + 9 * 3600000).toISOString(); return {date: t.slice(0, 10), time: t.slice(11, 16)}; };
export const stamp = iso => iso && Number.isFinite(Date.parse(iso)) ? `${korDate(kst(iso).date)} ${kst(iso).time} KST` : '없음';
export const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'}[c]));
export const h = (tag, attrs = {}, ...children) => {
  const el = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs ?? {})) {
    if (v == null || v === false) continue;
    if (k === 'class') el.className = v; else if (k === 'html') el.innerHTML = v; else if (k.startsWith('on') && typeof v === 'function') el.addEventListener(k.slice(2), v); else if (k === 'dataset') Object.assign(el.dataset, v); else el.setAttribute(k, v === true ? '' : v);
  }
  for (const c of children.flat(Infinity)) if (c != null && c !== false) el.append(c instanceof Node ? c : document.createTextNode(String(c))); // 겹친 배열도 펼침(2026-10-09 — 배열 안 배열이 「[object HTMLElement]」 글로 나오던 것)
  return el;
};
export const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
/** 소리로 읽기(ko-KR · 빠르기 0.9) */
export function speak(text) {
  try {
    if (!('speechSynthesis' in window)) return false;
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(t(text)); u.lang = LOCALE; u.rate = 0.9; u.pitch = 1.0; u.volume = 0.96; // 언어판이면 그 말로(i18n.js)
    const voice = window.speechSynthesis.getVoices().find(v => v.lang && v.lang.startsWith(LANG)); if (voice) u.voice = voice;
    window.speechSynthesis.speak(u); return true;
  } catch { return false; }
}
/** 화면 글자 그대로 읽기: data-speak 가 붙은 요소를 화면 순서대로 읽는다 */
export function speakScreen(fallback = '') {
  const parts = [...document.querySelectorAll('[data-speak]')].filter(el => el.offsetParent !== null || el.getClientRects().length).map(el => (el.dataset.speak || el.textContent || '').replace(/\s+/g, ' ').trim()).filter(Boolean);
  return speak(parts.length ? parts.join('. ') : fallback);
}
export const stopSpeak = () => { try { window.speechSynthesis?.cancel(); } catch {} };
/** 보기 좋은 눈금: 1·2·2.5·5 배수 */
export function niceTicks(min, max, count = 4) {
  const span = Math.max(1e-9, max - min), raw = span / count, mag = Math.pow(10, Math.floor(Math.log10(raw))), norm = raw / mag;
  const step = (norm <= 1 ? 1 : norm <= 2 ? 2 : norm <= 2.5 ? 2.5 : norm <= 5 ? 5 : 10) * mag;
  const start = Math.ceil(min / step) * step, ticks = [];
  for (let v = start; v <= max + 1e-9; v += step) ticks.push(Number(v.toFixed(10)));
  return ticks;
}
/** 그래프 글씨 배율: 글씨 크게를 누르면 그래프 글자·여백도 같이 커진다(좁은 화면은 1배 유지) */
export const chartScale = width => { const root = (typeof document !== 'undefined' && parseFloat(getComputedStyle(document.documentElement).fontSize)) || 16; return Math.min(root / 16, Math.max(1, width / 520)); };
export const todayKST = () => new Date(Date.now() + 9 * 3600000).toISOString().slice(0, 10);
