/* 테마 시계 잣대 · 글 꼴 — 화면이 쓰는 작은 조각(사장님 2026-10-19 16:54 · 결정표 docs/design/theme-2026-10-19/theme-engine.md)
   theme-engine.js(올릴 때 셈)가 이 파일을 불러 그대로 내보냄 · 첫 화면(theme-home.js)은 이 파일만 받음(느린 4G 첫 그림 — 셈 코드는 안 받음)
   다른 파일을 부르지 않음 · 화면(DOM)을 만지지 않음 */

export const THEME_SCHEMA = 'dori-theme-1';
/** 잣대(결정표 2 · 3 · 6) — 바꾸면 결정표 · 따로 세기도 함께 */
export const RULE = Object.freeze({minN: 5, jump: 0.35, bloomX: 5, powerY: 2, spreadUp: 0.02, bigUp: 0.01, bigRanks: 3, win: 20, near: 5, back: 10, tail: 6, recFrom: 40, recAhead: 20, barSpan: 10, top: 8});
/** 자리 — 결정표 2 (x = 한 달 동안 시장보다 더 오른 %p · y = 지난 닷새 동안 더 오른 %p) */
export const ZONES = Object.freeze({B: '꽃', W: '시듦', S: '싹', Q: '잠잠'});
export function zoneOf(x, y) {
  if (!Number.isFinite(x) || !Number.isFinite(y)) return null;
  return x >= RULE.bloomX ? (y >= 0 ? 'B' : 'W') : (y >= 0 ? 'S' : 'Q');
}
/* ── 화면 글 틀(p-theme.js · 첫 화면이 같이 씀 · 숫자 꼴은 이 아래 한 곳) ── */
/** %p 한 자리(+1.2 · −0.4) — 사이트 숫자 꼴(app.js pct 와 같은 반올림 · 부호 − ) */
export function pp(v) {
  if (!Number.isFinite(v)) return '?';
  const a = Math.sign(v) * Math.floor(Math.abs(v) * 10 + 0.5 + 1e-7) / 10;
  return (a > 0 ? '+' : a < 0 ? '−' : '') + Math.abs(a).toFixed(1);
}
/** 꽃까지 막대(0 ~ 1) */
export const nearBar = x => (Number.isFinite(x) ? Math.max(0, Math.min(1, 1 - (RULE.bloomX - x) / RULE.barSpan)) : 0);
/** 점 넷 글(결정표 3 화면 글) */
export const DOT_TEXT = Object.freeze(['시장보다 힘이 붙어요', '오른 회사가 늘어요', '큰 회사도 움직여요', '값이 진짜로 올라요']);
