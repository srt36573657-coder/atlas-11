/* ATLAS 11 · 공용 도우미 (형식·날짜·문장) */
export const finite = v => typeof v === 'number' && Number.isFinite(v);
export const won = v => finite(v) ? Math.round(v).toLocaleString('ko-KR') + '원' : '미산출';
export const num = (v, d = 0) => finite(v) ? v.toLocaleString('ko-KR', {minimumFractionDigits: d, maximumFractionDigits: d}) : '미산출';
export const pct = (v, d = 2) => finite(v) ? (v > 0 ? '+' : v < 0 ? '−' : '') + (Math.abs(v) * 100).toFixed(d) + '%' : '미산출';
export const pctPoint = (v, d = 1) => finite(v) ? (v * 100).toFixed(d) + '%' : '미산출';
export const shortDate = d => d ? d.slice(5).replace('-', '/') : '—';
export const korDate = d => d ? `${Number(d.slice(5, 7))}월 ${Number(d.slice(8, 10))}일` : '—';
export const weekday = d => d ? ['일', '월', '화', '수', '목', '금', '토'][new Date(d + 'T00:00:00Z').getUTCDay()] : '';
export const stamp = iso => iso ? new Date(iso).toLocaleString('ko-KR', {timeZone: 'Asia/Seoul', hour12: false, month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit'}) : '미확보';
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
export function speak(text) {
  try {
    if (!('speechSynthesis' in window)) return false;
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text); u.lang = 'ko-KR'; u.rate = 0.9; u.pitch = 1.0; u.volume = 0.96;
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
export const wonShort = v => { if (!finite(v)) return '미산출'; const a = Math.abs(v); if (a >= 1e8) return (v / 1e8).toFixed(a >= 1e9 ? 0 : 1) + '억'; if (a >= 1e4) return (v / 1e4).toLocaleString('ko-KR', {minimumFractionDigits: 1, maximumFractionDigits: 1}) + '만'; return Math.round(v).toLocaleString('ko-KR'); };
export const todayKST = () => new Date(Date.now() + 9 * 3600000).toISOString().slice(0, 10);
export const nowKSTClock = () => new Date(Date.now() + 9 * 3600000).toISOString().slice(11, 16);
