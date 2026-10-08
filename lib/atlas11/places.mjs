/* ATLAS 11 · 사이트에 싣는 판(시장) — 한 곳에서 정함(묶기 package.mjs · 돈 이야기 story/build.mjs · 빠짐없이 도는 검사 full_check.mjs · 올리기 문 art_gate.mjs · 바깥 판 받기 world/*.mjs)
   2026-10-05 18:02 미국(「이제는 미국 주식도 같은 개념으로」) · 2026-10-07 05:25 중국 · 일본 · 베트남(「미국 장 처럼」)
   → 2026-10-08 18:33(마카오 시각) 사장님 「한국 미국장만 두고 남머지 장은 삭제해」:
     · 사이트 · 검사 · 돈 이야기 · 돈 흐름은 한국 · 미국 둘만
     · 중국 · 일본 · 베트남은 내림(RETIRED) — 사이트에서 빼고 다시 받지 않음 · 받아 둔 자료(public/data/atlas11/<시장> · reports/atlas11/<시장>)는 지우지 않고 그대로 보관(규칙 8)
     · 옛 주소(/cn/ · /jp/ · /vn/)는 한국 판 첫 화면으로(package.mjs _redirects) */
/** 바깥 판 — [id, 이름] · 차례 = 위 막대 시장 단추 차례 */
export const ABROAD = Object.freeze([['us', '미국']]);
/** 사이트에 싣는 판 모두(한국 판이 맨 앞) */
export const SITE_BOARDS = Object.freeze(['kr', ...ABROAD.map(x => x[0])]);
/** 내린 판 — id → 내린 날(한국 시각) */
export const RETIRED = Object.freeze({cn: '2026-10-08', jp: '2026-10-08', vn: '2026-10-08'});
