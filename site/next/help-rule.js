/* 고객센터 규칙 한 곳 — 화면(site/next/p-help.js)과 서버(lib/atlas11/help.mjs)가 같이 부름 · 다른 파일을 부르지 않음(넷리파이 함수 묶음에 그대로 들어감)
   사장님 2026-10-21 22:54 · 22:55 「피드백 남기는 공간이랑 QA남기는공간 고객센터 안내 공간이 있으면 좋울것 같아 … 구글과잡스라면 그리고 나라면 아름답게 … 섹시하게 만들어」
   · 23:05 말투 둘(아이도 편한 쉬운 말 · 아는 사람이 바로 보는 곧은 말) · 23:09 「아 해 섹시하게」(지인 말 「간결하게」 뒤 차례 ③ 고객센터)
   본질 「망치는 길: 동의 없는 수집」 — 받는 것은 보낸 사람이 직접 쓴 글 · 고른 갈래 · 보던 화면 이름 · 때만 · 이름 · 전화번호 · 이메일은 받지 않음(연락처 꼴이면 빼고 보내 달라고 함)
   뒤돌아보기 글꼴((?<=…) (?<!…))은 쓰지 않음 — 옛 아이폰 사파리(16.3 아래)가 이 파일을 통째로 못 읽음(words.js 와 같은 까닭) */
export const LIM = Object.freeze({text: 500, min: 2, lines: 12, page: 12});
/** 갈래 — note = 한마디(좋았어요 · 바라요 · 안 돼요) · ask = 물음 */
export const KINDS = Object.freeze(['note', 'ask']);
export const TONES = Object.freeze(['good', 'want', 'broken']);
/** 말투 — easy = 쉬운 말(주식을 모르는 아이도 편한) · direct = 곧은 말(주식을 아는 사람이 바로 보는) — 사장님 2026-10-21 23:05 */
export const VOICES = Object.freeze(['easy', 'direct']);
/** 이 기기 고객센터 열쇠(무작위 32바이트 · 43자) — 서버에는 SHA-256 만 둠 */
export const DEV_RE = /^[A-Za-z0-9_-]{43}$/;
/** 글 번호 — 때(36진 9자) · 무작위 12자 */
export const ID_RE = /^[0-9a-z]{9}-[A-Za-z0-9_-]{12}$/;

const INVIS = /[\u0000-\u0009\u000B-\u001F\u007F-\u009F­ᅟᅠ᠎​-‏‪-‮⁠-⁩⠀ㅤ﻿ﾠ]/g;
/** 글 다듬기 — NFC · 보이지 않는 글자 빼기 · 줄 바꿈은 12줄까지 · 빈 줄은 하나로 · 앞뒤 빈칸 · n 글자까지 */
export function cleanText(v, n = LIM.text) {
  if (typeof v !== 'string') return '';
  const lines = v.normalize('NFC').replace(/\r\n?/g, '\n').replace(INVIS, '').split('\n').map(l => l.replace(/[ \t]+/g, ' ').trim());
  const out = [];
  for (const l of lines) { if (!l && (!out.length || !out[out.length - 1])) continue; out.push(l); }
  while (out.length && !out[out.length - 1]) out.pop();
  return Array.from(out.slice(0, LIM.lines).join('\n')).slice(0, n).join('').trim();
}

/** 연락처 꼴 — 'phone'(휴대폰 · 집 전화 · +82) · 'email' · 없으면 null
 *  넓은 숫자 · 넓은 @ 는 NFKC 로 보통 글자로 · 숫자 사이 빈칸 · 점 · 줄표 · 괄호는 건너 봄 · 6자리 종목 번호 · 날짜(2026-10-21) · 큰 금액은 지남 */
export function contactOf(text) {
  if (typeof text !== 'string' || !text) return null;
  const s = text.normalize('NFKC');
  if (/[A-Za-z0-9._%+-]+\s*@\s*[A-Za-z0-9-]+(\s*\.\s*[A-Za-z0-9-]+)+/.test(s)) return 'email';
  const sep = '[\\s.)(\\-]*';
  const mobile = new RegExp('(^|[^0-9])(\\+?82' + sep + ')?0?1[016789]' + sep + '[0-9]{3,4}' + sep + '[0-9]{4}([^0-9]|$)');
  const land = new RegExp('(^|[^0-9])0[2-6][0-9]?' + sep + '[0-9]{3,4}' + sep + '[0-9]{4}([^0-9]|$)');
  if (mobile.test(s) || land.test(s)) return 'phone';
  return null;
}

/** 보던 화면 이름 — 길의 첫 마디만(회사 번호 · 글 번호는 버림) · 영어 소문자 12자까지 · 아니면 '' */
export const pageOf = v => (typeof v === 'string' && /^[a-z]{1,12}$/.test(v) ? v : '');
