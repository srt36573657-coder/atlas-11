/* ATLAS 11 · 공용 도우미 (형식·날짜·문장)
   v9 모양은 하나씩: 글 날짜 「10월 1일(목)」 · 그래프 눈금 「10/01」 · 시각 「16:01 KST」
   숫자: 값은 단위(원·%·%p·포인트·종목·일) · 변화는 부호(+/−) · 소수 자리 고정(가격 0 · 수익률·오차 2 · 확률 0 · 지수 2) */
export const finite = v => typeof v === 'number' && Number.isFinite(v);
export const won = v => finite(v) ? Math.round(v).toLocaleString('ko-KR') + '원' : '미산출';
export const num = (v, d = 0) => finite(v) ? v.toLocaleString('ko-KR', {minimumFractionDigits: d, maximumFractionDigits: d}) : '미산출';
export const pct = (v, d = 2) => finite(v) ? (v > 0 ? '+' : v < 0 ? '−' : '') + (Math.abs(v) * 100).toFixed(d) + '%' : '미산출';
export const pctPoint = (v, d = 1) => finite(v) ? (v * 100).toFixed(d) + '%' : '미산출';
/** 확률(0~1) → 「57%」 (소수 없음 · 부호 없음: 수준이지 변화가 아님) */
export const prob = v => finite(v) ? Math.round(v * 100) + '%' : '미산출';
/** 이미 % 단위인 값(예: 오차 1.54) → 「1.54%」 · 부호가 필요하면 signed */
export const pctRaw = (v, d = 2, signed = false) => finite(v) ? (signed ? (v > 0 ? '+' : v < 0 ? '−' : '') : v < 0 ? '−' : '') + Math.abs(v).toFixed(d) + '%' : '미산출';
/** 지수 값 → 「6,838.04포인트」 */
export const pts = v => finite(v) ? v.toLocaleString('ko-KR', {minimumFractionDigits: 2, maximumFractionDigits: 2}) + '포인트' : '미산출';
export const signCls = v => finite(v) ? (v > 0 ? 'up' : v < 0 ? 'down' : 'flat') : '';
export const shortDate = d => d ? d.slice(5, 10).replace('-', '/') : '—';
export const weekday = d => d ? ['일', '월', '화', '수', '목', '금', '토'][new Date(d.slice(0, 10) + 'T00:00:00Z').getUTCDay()] : '';
export const korDate = d => d ? `${Number(d.slice(5, 7))}월 ${Number(d.slice(8, 10))}일(${weekday(d)})` : '—';
/** 「내일 하루만」(2026-10-02 사장님 명령) 화면 말: 「내일(10월 2일 금)」 */
export const tomorrowWord = d => d ? `내일(${Number(d.slice(5, 7))}월 ${Number(d.slice(8, 10))}일 ${weekday(d)})` : '내일';
/** ISO 시각 → 한국 날짜·시각 */
export const kst = iso => { const t = new Date(Date.parse(iso) + 9 * 3600000).toISOString(); return {date: t.slice(0, 10), time: t.slice(11, 16)}; };
export const stamp = iso => iso && Number.isFinite(Date.parse(iso)) ? `${korDate(kst(iso).date)} ${kst(iso).time} KST` : '미확보';
export const DIR = {up: {word: '상승', mark: '▲', cls: 'up'}, flat: {word: '보합', mark: '—', cls: 'flat'}, down: {word: '하락', mark: '▼', cls: 'down'}};
export const dirWord = k => DIR[k]?.word ?? '미산출';
export const dirMark = k => DIR[k]?.mark ?? '';
export const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'}[c]));
export const h = (tag, attrs = {}, ...children) => {
  const el = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs ?? {})) {
    if (v == null || v === false) continue;
    if (k === 'class') el.className = v; else if (k === 'html') el.innerHTML = v; else if (k.startsWith('on') && typeof v === 'function') el.addEventListener(k.slice(2), v); else if (k === 'dataset') Object.assign(el.dataset, v); else el.setAttribute(k, v === true ? '' : v);
  }
  for (const c of children.flat()) if (c != null && c !== false) el.append(c instanceof Node ? c : document.createTextNode(String(c)));
  return el;
};
export const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
export const reducedMotion = () => window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
export const download = (name, text, type = 'text/csv;charset=utf-8') => {
  const url = URL.createObjectURL(new Blob([type.startsWith('text/csv') ? '﻿' + text : text], {type}));
  const a = document.createElement('a'); a.href = url; a.download = name; document.body.append(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(url), 1500);
};
export const csvCell = v => `"${String(v ?? '').replaceAll('"', '""')}"`;
/** 소리로 읽기(ko-KR · 빠르기 0.9) · onend: 다 읽었거나 멈췄을 때 부른다(3차 「내일」 이야기는 장면이 말 끝을 기다린다) */
export function speak(text, {onend = null} = {}) {
  try {
    if (!('speechSynthesis' in window)) return false;
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text); u.lang = 'ko-KR'; u.rate = 0.9; u.pitch = 1.0; u.volume = 0.96;
    if (onend) { u.onend = () => onend(); u.onerror = () => onend(); }
    const voice = window.speechSynthesis.getVoices().find(v => v.lang && v.lang.startsWith('ko')); if (voice) u.voice = voice;
    window.speechSynthesis.speak(u); return true;
  } catch { return false; }
}
/** 화면 글자 그대로 읽기: data-speak 가 붙은 요소를 화면 순서대로 읽는다 (요약이 없으면 제목·핵심 숫자) */
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
export const wonShort = v => { if (!finite(v)) return '미산출'; const a = Math.abs(v); if (a >= 1e8) return (v / 1e8).toFixed(a >= 1e9 ? 0 : 1) + '억원'; if (a >= 1e4) return (v / 1e4).toLocaleString('ko-KR', {minimumFractionDigits: 1, maximumFractionDigits: 1}) + '만원'; return Math.round(v).toLocaleString('ko-KR') + '원'; };
/** 그래프 글씨 배율: 글씨 크게(A+)를 누르면 그래프 글자·여백도 같이 커진다(좁은 화면은 그래프 폭이 모자라 1배 유지) */
export const chartScale = width => { const root = (typeof document !== 'undefined' && parseFloat(getComputedStyle(document.documentElement).fontSize)) || 16; return Math.min(root / 16, Math.max(1, width / 520)); };
export const todayKST = () => new Date(Date.now() + 9 * 3600000).toISOString().slice(0, 10);
export const nowKSTClock = () => new Date(Date.now() + 9 * 3600000).toISOString().slice(11, 16);
