/* 쓰지 않을 말 · 거르는 말 — 한 곳(사장님 2026-10-17 21:10(싱가포르) 「고도리 · 하나로 묶은 명령문」 [4] 4 · 5)
   「letter.js 거르는 말과 next_check 쓰지 않을 말을 words.js 한 곳에 모아 같이 써라. 걸리면 고치게 하라.」 · 「수익률은 보내지 마라.」
   브라우저(/next/words.js — 보내기 글상자 p-share.js · 편지 letter.js)와 노드(서버 lib/atlas11/letter.mjs · 검사 next_check.mjs)가 같이 부른다.
   다른 파일을 부르지 않는다(넷리파이 함수 묶음 · 소개 쪽 · 편지 쪽이 앱 없이 그대로 부름) · 이름(내보내는 것)은 바꾸지 않는다.

   어디에 무엇을 쓰나
   · 사람이 쓴 글(편지 · 별명 · 한 줄 답 · 보내는 말) → hits(글) · badWord(글)  — BLOCK(갈래마다) · 띄어쓰기를 빼고 봄 · OKW 먼저 지움
   · 보내는 말(친구에게) → sendHits(글) = hits + gainHits(수익 숫자 · 자랑 말)
   · 화면 글(검사가 셈 · data-proper 뺀 글) → screenHits(글)  — SCREEN · 글자 그대로 · 「공매도」 · 「사라지다」 빼고
     (SCREEN 을 includes 로 바로 쓰면 「사라져요」 같은 보통 말이 걸린다 — screenHits 를 쓴다) */

/** 화면에 쓰지 않을 말(규칙 72 ⑥ · 명령문 [7] 6 · next_check 의 목록 + 「사라」 · 「팔아라」) — 「사라」, 「팔아라」 대신 「나라면 이렇게 하겠어」 */
export const SCREEN = Object.freeze(['추천', '매수', '매도', '팔라', '사세요', '파세요', '예측', '확률', '유망', '기회', '신호', '저평가', '1위', 'TOP', '사라', '팔아라']);

/** 막는 말을 품었지만 괜찮은 낱말 — 먼저 지우고 봄(「사라지다」 · 「사자성어」 등) */
export const OKW = Object.freeze(['사라지', '사라졌', '사라진', '사라질', '사라져', '사라짐', '사자성어', '사요나라']);

/** 사람이 쓴 글을 거르는 말 — [갈래, 낱말들] · 앞 갈래부터 봄(편지 쪽 옛 목록 여섯 갈래 그대로 + 사이트 말 한 갈래) */
export const BLOCK = Object.freeze([
  ['사고팔기 말', ['사라', '사요', '사세요', '사자', '매수', '매도', '팔아', '팔라', '팔자', '손절', '익절', '풀매수', '몰빵', '물타', '줍줍', '존버']],
  ['부추기는 말', ['가즈아', '상한가', '하한가', '떡상', '떡락', '폭등', '폭락', '대박', '텐배거', '목표가', '목표주가', '세력', '작전', '매집', '설거지']],
  ['리딩방 말', ['리딩', '무료방', '추천주', '종목추천', '수익인증', '오픈채팅', '오픈톡', '카톡', '텔레그램', '단톡', '밴드']],
  ['소문 말', ['지라시', '찌라시', '카더라', '인수설', '합병설', '상폐']],
  ['연락처', ['http', 'www', '.com', '.kr', '@', '010']],
  ['거친 말', ['시발', '씨발', 'ㅅㅂ', '병신', '개새', '좆', '지랄']],
  ['사이트에서 쓰지 않는 말', SCREEN.map(w => w.toLowerCase())],
].map(([k, ws]) => Object.freeze([k, Object.freeze(ws)])));
/** 옛 이름(편지 쪽 · 서버가 쓰던 이름) — BLOCK 과 같은 것 */
export const BAD = BLOCK;

/** 앞뒤가 영어 글자가 아닐 때만 걸리는 낱말(「stop」 · 「desktop」 의 top 은 안 걸림) */
const WHOLE = new Set(['top']);
const ZW = /[\u0000-\u001F\u007F-\u009F­​-‏‪-‮⁠-⁩﻿]/g;
/** 견줄 꼴 — 한글 모아 쓰기(NFC) · 작은 글자 · 보이지 않는 글자와 띄어쓰기 지움 · 괜찮은 낱말 지움 */
function flat(s) {
  let t = String(s ?? '').normalize('NFC').toLowerCase().replace(ZW, '').replace(/\s+/g, '');
  for (const w of OKW) t = t.split(w).join('');
  return t;
}
const has = (t, w) => (WHOLE.has(w) ? new RegExp('(^|[^a-z])' + w + '($|[^a-z])').test(t) : t.includes(w));

/** 사람이 쓴 글에서 걸린 것 모두 — [{kind, word}] · 갈래 차례 · 같은 낱말은 한 번 */
export function hits(text) {
  const t = flat(text), out = [], seen = new Set();
  for (const [kind, ws] of BLOCK) for (const word of ws) {
    if (seen.has(word) || !has(t, word)) continue;
    seen.add(word);
    if (!out.some(x => x.word.includes(word) || word.includes(x.word))) out.push({kind, word}); // 「팔아」 · 「팔아라」는 하나로
  }
  return out;
}
/** 처음 걸린 하나 — [갈래, 낱말] · 아니면 null(편지 쪽 · 서버가 쓰던 꼴 그대로) */
export function badWord(text) { const x = hits(text)[0]; return x ? [x.kind, x.word] : null; }

/** 수익 숫자 · 자랑 말(명령문 [4] 5 「수익률은 보내지 마라. 자랑이 퍼지면 남이 따라 산다.」) — 보내는 말에만 씀 */
export const GAIN_KIND = '수익 자랑';
export const GAIN_WORDS = Object.freeze(['수익률', '수익금', '수익냈', '수익났', '수익봤', '수익남', '벌었', '벌엇', '먹었', '먹엇', '평가익', '손익', '이득봤', '익절']);
const GAIN_RE = [
  /[0-9０-９][0-9０-９.,]*\s*(?:%|％|퍼센트|프로|퍼)/, // 30% · 30 퍼센트 · 30프로 · 30퍼
  /[+＋▲↑]\s*[0-9０-９][0-9０-９.,]*/, // +30 · ▲12
  /(?:[0-9０-９]+(?:[.,][0-9]+)?|두|세|네|다섯|여섯|일곱|여덟|아홉|열)\s*배.{0,6}?(?:올|뛰|먹|벌|됐|튀|상승|수익|불|남)/, // 2배 올랐어 · 두 배 먹었어
];
/** 보내는 말의 수익 숫자 · 자랑 말 — [{kind: '수익 자랑', word}] */
export function gainHits(text) {
  const raw = String(text ?? '').normalize('NFC').toLowerCase().replace(ZW, ''), t = raw.replace(/\s+/g, ''), out = [], seen = new Set();
  const add = w => { if (w && !seen.has(w) && !out.some(x => x.word.includes(w) || w.includes(x.word))) { seen.add(w); out.push({kind: GAIN_KIND, word: w}); } };
  for (const re of GAIN_RE) { const m = re.exec(raw); if (m) add(m[0].trim()); }
  for (const w of GAIN_WORDS) if (t.includes(w)) add(w);
  return out;
}
/** 친구에게 보내는 말 — 거르는 말 + 수익 숫자 · 자랑 말 */
export function sendHits(text) { return [...hits(text), ...gainHits(text)]; }

/** 화면 글(검사가 셈 · 이름 · 남의 글 data-proper 는 미리 뺌)에 남은 쓰지 않을 말 — 낱말 목록 · 글자 그대로(「TOP」 은 앞뒤가 영어 글자가 아닐 때만) */
export const SCREEN_OK = Object.freeze(['공매도', ...OKW]); // 「공매도」 = 빌려 판 주식(사실 말 · 권하는 말 아님)
export function screenHits(text) {
  let t = String(text ?? '');
  for (const w of SCREEN_OK) t = t.split(w).join('');
  return SCREEN.filter(w => (w === 'TOP' ? /(^|[^A-Za-z])TOP($|[^A-Za-z])/.test(t) : t.includes(w)));
}
