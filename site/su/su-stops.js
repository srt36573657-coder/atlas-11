/* 멈춘 날(주문 1128-1038 · 사장님 2026-11-28(서울) 10:38 「… 그 본질답게 개선하고 업그레이드해 혁신적이면서 직관적이면서 깊이가 있는 방법으로 해 에이전트 30개 공부시킨 이후 만들어봐」)
   「왜 사?」 질문 어디서든 「오늘은 안 사요」를 누른 날 — 이 휴대폰에만(밖으로 보내지 않음 · 신호도 안 보냄)
   본질: 사기 전에 한 번 멈추게 한다 · 안 산 날도 내 돈을 지킨 날 — 공부 서른(docs/design/jobs-2026-11-28/study30.md) 7 · 9 · 10 · 14 · 26
   세는 법: 날짜(서울)가 다른 날만 셈 · 이어진 날은 세지 않음 · 상 · 폭죽 없음(본질 — 연속 접속 보상 없음) */
export const STOP_KEY = 'su-stops-v1';
const MAX = 400;
/** 서울 날짜 YYYY-MM-DD(한국은 서머타임 없음) */
export const stopDay = (ms = Date.now()) => new Date(ms + 9 * 3600e3).toISOString().slice(0, 10);
/** 멈춘 기록 — 새것 먼저 · 기억 못 하는 기계면 null */
export function readStops() {
  try { const x = JSON.parse(localStorage.getItem(STOP_KEY) || '[]'); return Array.isArray(x) ? x.filter(r => r && typeof r === 'object' && /^\d{4}-\d{2}-\d{2}$/.test(String(r.day ?? ''))) : []; } catch { return null; }
}
/** 멈춘 기록 한 줄 남김 — q = 몇 번째 질문에서(끝 화면이면 12) · 남겼으면 true */
export function saveStop({code = null, name = null, q = null} = {}, ms = Date.now()) {
  try {
    const all = readStops(); if (all == null) return false;
    all.unshift({at: new Date(ms).toISOString(), day: stopDay(ms), code: typeof code === 'string' ? code : null, name: typeof name === 'string' ? name : null, q: Number.isInteger(q) ? q : null});
    localStorage.setItem(STOP_KEY, JSON.stringify(all.slice(0, MAX))); return true;
  } catch { return false; }
}
/** 멈춘 날 수 — 날짜가 다른 날만(같은 날 여러 번 눌러도 하루) */
export const stopDays = L => new Set((Array.isArray(L) ? L : []).map(r => r.day)).size;
