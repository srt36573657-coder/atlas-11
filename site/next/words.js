/* 쓰지 않을 말 · 거르는 말 — 한 곳(사장님 2026-10-17 21:10(싱가포르) 「고도리 · 하나로 묶은 명령문」 [4] 4 · 5)
   「letter.js 거르는 말과 next_check 쓰지 않을 말을 words.js 한 곳에 모아 같이 써라. 걸리면 고치게 하라.」 · 「수익률은 보내지 마라.」
   브라우저(/next/words.js — 보내기 글상자 p-share.js · 편지 letter.js)와 노드(서버 lib/atlas11/letter.mjs · 검사 next_check.mjs)가 같이 부른다.
   다른 파일을 부르지 않는다(넷리파이 함수 묶음 · 소개 쪽 · 편지 쪽이 앱 없이 그대로 부름) · 이름(내보내는 것)은 바꾸지 않는다.

   어디에 무엇을 쓰나
   · 사람이 쓴 글(편지 · 별명 · 한 줄 답 · 보내는 말) → hits(글) · badWord(글)  — BLOCK(갈래마다) · 띄어쓰기를 빼고 봄 · OKW 먼저 지움
   · 보내는 말(친구에게) → sendHits(글) = hits + gainHits(수익 숫자 · 자랑 말)
   · 화면 글(검사가 셈 · data-proper 뺀 글) → screenHits(글)  — SCREEN · 글자 그대로 · 「공매도」 · 「사라지다」 빼고
     (SCREEN 을 includes 로 바로 쓰면 「사라져요」 같은 보통 말이 걸린다 — screenHits 를 쓴다)
   · 2026-10-18 [9] 6 「거르는 말 빈틈을 막아라. 점과 줄표를 지운 뒤 거르고, 넓은 숫자와 「공일공」 같은 한글 숫자는 보통 숫자로 바꿔 걸러라.
     「사야, 담아, 추천, 무조건, 확실, 보장, 수익, t.me, 텔레」를 words.js에 더하라.」 — 사람이 쓴 글(hits · badWord · sendHits)에만 · 화면 셈(screenHits)은 그대로
     세 꼴로 봄: ㉠ 띄어쓰기만 지운 꼴(「.com」 · 「t.me」) ㉡ 점 · 줄표 · 밑줄 · 가운뎃점도 지운 꼴(「사.야」 「사-야」 「사_야」 「사·야」)
     ㉢ ㉡ 에서 한글 숫자 줄(셋 넘게 · 「공일공」 「영일영」 「빵일빵」 · 숫자와 섞여도)을 보통 숫자로 바꾼 꼴 · 넓은 숫자(０１０ · ①)는 NFKC 로 보통 숫자
     (같이 막은 길 — 보이지 않는 채움 글자 「사ㅤ야」(U+3164) · 점자 빈칸 · 글자에 붙은 결합 글자 「사̸야」 · 보통 말 「불확실」 「호텔·레저」는 지남) */

/** 화면에 쓰지 않을 말(규칙 72 ⑥ · 명령문 [7] 6 · next_check 의 목록 + 「사라」 · 「팔아라」) — 「사라」, 「팔아라」 대신 「나라면 이렇게 하겠어」 */
export const SCREEN = Object.freeze(['추천', '매수', '매도', '팔라', '사세요', '파세요', '예측', '확률', '유망', '기회', '신호', '저평가', '1위', 'TOP', '사라', '팔아라']);

/** 막는 말을 품었지만 괜찮은 낱말 — 먼저 지우고 봄(「사라지다」 · 「사자성어」 등) */
export const OKW = Object.freeze(['사라지', '사라졌', '사라진', '사라질', '사라져', '사라짐', '사자성어', '사요나라',
  // 2026-10-18 [9] 6 새 낱말의 보통 말 — 「텔레」: 회사 이름(SK텔레콤 · 기산텔레콤 · 세종텔레콤 · 텔레칩스 — 회사 이름이 걸리면 편지 「무엇에 대해」가 막힘) · 텔레비전
  '텔레콤', '텔레칩스', '텔레필드', '텔레비전', '텔레비젼', '텔레파시', '호텔레저', // 호텔레저 = 업종 이름 「호텔·레저」(점 · 띄어쓰기를 지우면 「텔레」가 생김)
  // 「확실」: 「불확실」은 모른다고 말하는 정직한 말(고도리가 권하는 쪽) — 「확실한 종목」은 그대로 걸림
  '불확실',
  // 「담아」: 편지 맺음말(「마음을 담아」) — 「종목 담아」는 그대로 걸림
  '마음을담아', '마음담아', '정성을담아', '정성담아', '진심을담아', '진심담아', '사랑을담아', '사랑담아', '고마움을담아', '감사를담아', '감사함을담아']);

/** 사람이 쓴 글을 거르는 말 — [갈래, 낱말들] · 앞 갈래부터 봄(편지 쪽 옛 목록 여섯 갈래 그대로 + 사이트 말 한 갈래) */
export const BLOCK = Object.freeze([
  ['사고팔기 말', ['사라', '사요', '사세요', '사자', '매수', '매도', '팔아', '팔라', '팔자', '손절', '익절', '풀매수', '몰빵', '물타', '줍줍', '존버', '사야', '담아']],
  ['부추기는 말', ['가즈아', '상한가', '하한가', '떡상', '떡락', '폭등', '폭락', '대박', '텐배거', '목표가', '목표주가', '세력', '작전', '매집', '설거지', '무조건', '확실', '보장']],
  ['리딩방 말', ['리딩', '무료방', '추천주', '종목추천', '수익인증', '오픈채팅', '오픈톡', '카톡', '텔레그램', '단톡', '밴드', '추천', '수익', '텔레']],
  ['소문 말', ['지라시', '찌라시', '카더라', '인수설', '합병설', '상폐']],
  ['연락처', ['http', 'www', '.com', '.kr', '@', '010', 't.me']],
  ['거친 말', ['시발', '씨발', 'ㅅㅂ', '병신', '개새', '좆', '지랄']],
  ['사이트에서 쓰지 않는 말', SCREEN.map(w => w.toLowerCase())],
].map(([k, ws]) => Object.freeze([k, Object.freeze(ws)])));
/** 옛 이름(편지 쪽 · 서버가 쓰던 이름) — BLOCK 과 같은 것 */
export const BAD = BLOCK;

/** 앞뒤 자리를 보는 낱말 — [앞에 오면 안 되는 글자, 뒤에 오면 안 되는 글자]
   · top: 앞뒤가 영어 글자가 아닐 때만(「stop」 · 「desktop」 은 안 걸림)
   · t.me · tme: 앞이 영어 글자 · 숫자 · 따옴표가 아닐 때만(「investment」 · 「don't meet」 은 안 걸림)
   · 010: 앞이 숫자가 아닐 때만(「2010년」 은 안 걸림 · 「연락 010」 · 「공일공」 은 걸림) */
const EDGE = Object.freeze({top: [/[a-z]/, /[a-z]/], 't.me': [/[a-z0-9'’`]/, null], tme: [/[a-z0-9'’`]/, null], '010': [/[0-9]/, null]});
/** 보이지 않는 글자 — 조종 글자 · 숨은 하이픈 · 폭 없는 글자 · 방향 글자 · 한글 채움 글자(「ㅤ」 U+3164 · U+115F · U+1160 · U+FFA0 — 글 모양은 빈칸인데 띄어쓰기가 아님) · 점자 빈칸(U+2800) · 몽골 모음 가름(U+180E)
   (결합 글자 · 변형 선택자는 base() 가 \p{M} 으로 따로 지움 — 2026-10-18 S7l: 「사ㅤ야」 「사̸야」 로 빠져나가는 길) */
const ZW = /[\u0000-\u001F\u007F-\u009F\u00AD\u115F\u1160\u180E\u200B-\u200F\u202A-\u202E\u2060-\u2069\u2800\u3164\uFEFF\uFFA0]/g;
/** 점 · 줄표 · 밑줄 · 가운뎃점(NFKC 뒤 꼴 포함 — ㆍ → ᆞ · ㅡ → ᅳ · 넓은 꼴 －＿． 은 NFKC 가 바꿈) */
const SEP = /[._\-·・･ㆍᆞ•∙⋅‧。｡‐‑‒–—―−⁃﹘﹣ㅡᅳ]/g;
const SEP0 = /^[._\-]/;
/** 한글 숫자 — 셋 넘게 이어진 줄만(보통 숫자와 섞여도) 보통 숫자로(「공일공」 → 010 · 「이사」 「영상」 같은 보통 말은 그대로) */
const KDIG = Object.freeze({공: '0', 영: '0', 빵: '0', 일: '1', 이: '2', 삼: '3', 사: '4', 오: '5', 육: '6', 륙: '6', 칠: '7', 팔: '8', 구: '9'});
const KRUN = /[0-9공영빵일이삼사오육륙칠팔구]{3,}/g, KD1 = /[공영빵일이삼사오육륙칠팔구]/;
const digits = t => t.replace(KRUN, run => (KD1.test(run) ? Array.from(run, c => KDIG[c] ?? c).join('') : run));
/** 견줄 꼴 바탕 — NFKC(넓은 숫자 · 넓은 영어 · 동그라미 숫자 → 보통 글자) · 작은 글자 · 보이지 않는 글자와 띄어쓰기 지움 · 「。」 → 「.」 */
const base = s => String(s ?? '').normalize('NFKC').toLowerCase().replace(ZW, '').replace(/\p{M}/gu, '').replace(/\s+/g, '').replace(/[。｡]/g, '.');
const strip = t => t.replace(SEP, '');
const dropOK = t => { for (const w of OKW) t = t.split(w).join(''); return t; };
/** 사람이 쓴 글의 세 꼴 — ㉠ 띄어쓰기만 지움 ㉡ 점 · 줄표도 지움 ㉢ ㉡ + 한글 숫자 → 보통 숫자 (괜찮은 낱말은 꼴마다 지움) */
export function filterForms(text) { const a = base(text), b = dropOK(strip(a)); return [dropOK(a), b, digits(b)]; }
/** 낱말마다 견줄 꼴 — a = ㉠ 에 · b = ㉡ ㉢ 에(「.com」 「.kr」 처럼 점으로 시작하는 낱말은 ㉠ 에만 — 점을 지우면 「com」 이 「comment」 를 거름) */
const WF = new Map();
for (const [, ws] of BLOCK) for (const w of ws) if (!WF.has(w)) { const a = base(w); WF.set(w, {a, b: SEP0.test(a) ? null : strip(a)}); }
function has(t, w) {
  const e = EDGE[w]; if (!e) return t.includes(w);
  for (let i = t.indexOf(w); i >= 0; i = t.indexOf(w, i + 1)) {
    const p = t[i - 1], n = t[i + w.length];
    if ((!p || !e[0].test(p)) && (!e[1] || !n || !e[1].test(n))) return true;
  }
  return false;
}

/** 사람이 쓴 글에서 걸린 것 모두 — [{kind, word}] · 갈래 차례 · 같은 낱말은 한 번 */
export function hits(text) {
  const [A, B, C] = filterForms(text), out = [], seen = new Set();
  for (const [kind, ws] of BLOCK) for (const word of ws) {
    if (seen.has(word)) continue;
    const f = WF.get(word);
    if (!(has(A, f.a) || (f.b && (has(B, f.b) || has(C, f.b))))) continue;
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
  const raw = String(text ?? '').normalize('NFKC').toLowerCase().replace(ZW, '').replace(/\p{M}/gu, ''), t = raw.replace(/\s+/g, ''), tb = strip(t), out = [], seen = new Set();
  const add = w => { if (w && !seen.has(w) && !out.some(x => x.word.includes(w) || w.includes(x.word))) { seen.add(w); out.push({kind: GAIN_KIND, word: w}); } };
  for (const re of GAIN_RE) { const m = re.exec(raw); if (m) add(m[0].trim()); }
  if (!out.length) { const alt = digits(tb); for (const re of GAIN_RE) { const m = re.exec(alt); if (m) add(m[0].trim()); } } // 「3-0%」 · 「일공공%」 — 점 · 줄표를 지우고 한글 숫자를 바꾼 꼴로 한 번 더
  for (const w of GAIN_WORDS) if (t.includes(w) || tb.includes(w)) add(w);
  return out;
}
/** 친구에게 보내는 말 — 거르는 말 + 수익 숫자 · 자랑 말 */
export function sendHits(text) { const a = hits(text); return [...a, ...gainHits(text).filter(g => !a.some(x => x.word.includes(g.word) || g.word.includes(x.word)))]; } // 「수익」 · 「수익률」 은 하나로

/** 화면 글(검사가 셈 · 이름 · 남의 글 data-proper 는 미리 뺌)에 남은 쓰지 않을 말 — 낱말 목록 · 글자 그대로(「TOP」 은 앞뒤가 영어 글자가 아닐 때만) */
export const SCREEN_OK = Object.freeze(['공매도', ...OKW]); // 「공매도」 = 빌려 판 주식(사실 말 · 권하는 말 아님)
export function screenHits(text) {
  let t = String(text ?? '');
  for (const w of SCREEN_OK) t = t.split(w).join('');
  return SCREEN.filter(w => (w === 'TOP' ? /(^|[^A-Za-z])TOP($|[^A-Za-z])/.test(t) : t.includes(w)));
}
