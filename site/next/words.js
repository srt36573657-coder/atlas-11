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
     (같이 막은 길 — 보이지 않는 채움 글자 「사ㅤ야」(U+3164) · 점자 빈칸 · 글자에 붙은 결합 글자 「사̸야」 · 보통 말 「불확실」 「호텔·레저」는 지남)
   · 2026-10-18 VL(법과 안전 따로 보기) 「45가지 중 22가지가 빠져나감」 — 더 막은 길(모두 사람이 쓴 글 hits · badWord · sendHits 에만 · 화면 셈 screenHits 는 그대로):
     ㉣ 글자에 붙은 기호(빗금 / · 쉼표 · 물결 · 별표 · 더하기 · 따옴표 · 괄호 · 그림 글자 …)는 띄어쓰기 없이 낱말 속에 낀 것만 지우고 봄 — 「추/천」 「사~야」 「추🔥천」 · 문장 끝 쉼표 · 마침표처럼 띄어쓰기 앞뒤에 선 기호는 지우지 않음(「시추, 천연가스」는 지남)
     ㉤ 닮은 글자(키릴 · 그리스 … 「t.mе」 「httр」 「ԝԝԝ」)는 보통 영어 글자로 바꿔 봄 · 숫자 닮은 글자(「O1O」 「0l0」)는 전화번호 꼴(열 · 열한 자리)일 때만 숫자로 봄
     ㉥ 낱자모(「ㅊㅜㅊㅓㄴ」 「ㅅ ㅏ ㅇ ㅑ」)는 띄어쓰기를 건너 글자로 붙이고 끝소리까지 합쳐 본 꼴을 하나 더 봄 · 악센트 글자(é → e)도 보통 글자로
     ㉦ 전화번호 꼴: 011 · 016 ~ 019 · 070(열 · 열한 자리일 때만 — 6자리 종목 번호 · 날짜 · 큰 금액은 지남) · 「+82 10 …」 「(82)10 …」 · ㉧ 「닷컴」 「dot com」 「open kakao」(「닷컴 버블」은 지남)
     지킴: 옛 거르기에 걸리던 글은 새 거르기에도 걸림(옛 꼴도 함께 봄 · 무작위 30만 글로 잼 — 잃은 것 0) · 뒤돌아보기 글꼴((?<=…) (?<!…))은 안 씀 — 옛 아이폰 사파리(16.3 아래)는 그 글꼴이 있으면 이 파일을 통째로 못 읽어 편지 · 소개 쪽 보내기 글상자가 죽음 */

/** 화면에 쓰지 않을 말(규칙 72 ⑥ · 명령문 [7] 6 · next_check 의 목록 + 「사라」 · 「팔아라」) — 「사라」, 「팔아라」 대신 「나라면 이렇게 하겠어」 */
export const SCREEN = Object.freeze(['추천', '매수', '매도', '팔라', '사세요', '파세요', '예측', '확률', '유망', '기회', '신호', '저평가', '1위', 'TOP', '사라', '팔아라']);

/** 막는 말을 품었지만 괜찮은 낱말 — 먼저 지우고 봄(「사라지다」 · 「사자성어」 등) */
export const OKW = Object.freeze(['사라지', '사라졌', '사라진', '사라질', '사라져', '사라짐', '사자성어', '사요나라',
  // 2026-10-18 [9] 6 새 낱말의 보통 말 — 「텔레」: 회사 이름(SK텔레콤 · 기산텔레콤 · 세종텔레콤 · 텔레칩스 — 회사 이름이 걸리면 편지 「무엇에 대해」가 막힘) · 텔레비전
  '텔레콤', '텔레칩스', '텔레필드', '텔레비전', '텔레비젼', '텔레파시', '호텔레저', // 호텔레저 = 업종 이름 「호텔·레저」(점 · 띄어쓰기를 지우면 「텔레」가 생김)
  // 「확실」: 「불확실」은 모른다고 말하는 정직한 말(고도리가 권하는 쪽) — 「확실한 종목」은 그대로 걸림
  '불확실',
  // 「닷컴」: 2000년 「닷컴 버블」은 보통 말(「네이버 닷컴」은 그대로 걸림)
  '닷컴버블', '닷컴거품', '닷컴붕괴', '닷컴시대', '닷컴시절', '닷컴열풍', '닷컴위기', '닷컴기업', '닷컴주', '닷컴쇼크',
  // 「담아」: 편지 맺음말(「마음을 담아」) — 「종목 담아」는 그대로 걸림
  '마음을담아', '마음담아', '정성을담아', '정성담아', '진심을담아', '진심담아', '사랑을담아', '사랑담아', '고마움을담아', '감사를담아', '감사함을담아']);

/** 사람이 쓴 글을 거르는 말 — [갈래, 낱말들] · 앞 갈래부터 봄(편지 쪽 옛 목록 여섯 갈래 그대로 + 사이트 말 한 갈래) */
export const BLOCK = Object.freeze([
  ['사고팔기 말', ['사라', '사요', '사세요', '사자', '매수', '매도', '팔아', '팔라', '팔자', '손절', '익절', '풀매수', '몰빵', '물타', '줍줍', '존버', '사야', '담아']],
  ['부추기는 말', ['가즈아', '상한가', '하한가', '떡상', '떡락', '폭등', '폭락', '대박', '텐배거', '목표가', '목표주가', '세력', '작전', '매집', '설거지', '무조건', '확실', '보장']],
  ['리딩방 말', ['리딩', '무료방', '추천주', '종목추천', '수익인증', '오픈채팅', '오픈톡', '카톡', '텔레그램', '단톡', '밴드', '추천', '수익', '텔레']],
  ['소문 말', ['지라시', '찌라시', '카더라', '인수설', '합병설', '상폐']],
  ['연락처', ['http', 'www', '.com', '.kr', '@', '010', 't.me', '닷컴', 'dotcom', 'openkakao', 'openchat']],
  ['거친 말', ['시발', '씨발', 'ㅅㅂ', '병신', '개새', '좆', '지랄']],
  ['사이트에서 쓰지 않는 말', SCREEN.map(w => w.toLowerCase())],
].map(([k, ws]) => Object.freeze([k, Object.freeze(ws)])));
/** 옛 이름(편지 쪽 · 서버가 쓰던 이름) — BLOCK 과 같은 것 */
export const BAD = BLOCK;

/** 앞뒤 자리를 보는 낱말 — [앞에 오면 안 되는 글자, 뒤에 오면 안 되는 글자] (null = 안 봄)
   · top: 앞뒤가 영어 글자가 아닐 때만(「stop」 · 「desktop」 은 안 걸림)
   · t.me · tme: 앞이 영어 글자 · 숫자 · 따옴표가 아닐 때만(「investment」 · 「don't meet」 은 안 걸림)
   · 010: 앞이 숫자가 아닐 때만(「2010년」 은 안 걸림 · 「연락 010」 · 「공일공」 은 걸림)
   · dotcom: 뒤가 영어 글자가 아닐 때만(「dot commerce」 · 「dot com bubble」 은 안 걸림 — 「abc dot com」 은 걸림) */
const EDGE = Object.freeze({top: [/[a-z]/, /[a-z]/], 't.me': [/[a-z0-9'’`]/, null], tme: [/[a-z0-9'’`]/, null], '010': [/[0-9]/, null], dotcom: [null, /[a-z]/]});
/** 보이지 않는 글자 — 조종 글자 · 숨은 하이픈 · 폭 없는 글자 · 방향 글자 · 한글 채움 글자(「ㅤ」 U+3164 · U+115F · U+1160 · U+FFA0 — 글 모양은 빈칸인데 띄어쓰기가 아님) · 점자 빈칸(U+2800) · 몽골 모음 가름(U+180E)
   (결합 글자 · 변형 선택자는 prep() 가 \p{M} 으로 따로 지움 — 2026-10-18 S7l: 「사ㅤ야」 「사̸야」 로 빠져나가는 길) */
const ZW = /[\u0000-\u001F\u007F-\u009F\u00AD\u115F\u1160\u180E\u200B-\u200F\u202A-\u202E\u2060-\u2069\u2800\u3164\uFEFF\uFFA0]/g;
/** 점 · 줄표 · 밑줄 · 가운뎃점(NFKC 뒤 꼴 포함 — ㆍ → ᆞ · ㅡ → ᅳ · 넓은 꼴 －＿． 은 NFKC 가 바꿈) */
const SEP = /[._\-·・･ㆍᆞ•∙⋅‧。｡‐‑‒–—―−⁃﹘﹣ㅡᅳ]/g;
const SEP0 = /^[._\-]/;
/** 한글 숫자 — 셋 넘게 이어진 줄만(보통 숫자와 섞여도) 보통 숫자로(「공일공」 → 010 · 「이사」 「영상」 같은 보통 말은 그대로) */
const KDIG = Object.freeze({공: '0', 영: '0', 빵: '0', 일: '1', 이: '2', 삼: '3', 사: '4', 오: '5', 육: '6', 륙: '6', 칠: '7', 팔: '8', 구: '9'});
const KRUN = /[0-9공영빵일이삼사오육륙칠팔구]{3,}/g, KD1 = /[공영빵일이삼사오육륙칠팔구]/;
const digits = t => t.replace(KRUN, run => (KD1.test(run) ? Array.from(run, c => KDIG[c] ?? c).join('') : run));
/** 닮은 글자 → 보통 영어 글자(2026-10-18 VL ㉤) — 키릴 「t.mе」 「httр」 「ԝԝԝ」 · 그리스 · 점 없는 i · 작은 대문자 「ᴛ.ᴍᴇ」. 코드 번호로 적음(눈으로 헷갈리지 않게) */
const LOOK = new Map([
  [0x430, 'a'], [0x435, 'e'], [0x43A, 'k'], [0x43C, 'm'], [0x43D, 'h'], [0x43E, 'o'], [0x440, 'p'], [0x441, 'c'], [0x442, 't'], [0x443, 'y'], [0x445, 'x'], // 키릴 а е к м н о р с т у х
  [0x455, 's'], [0x456, 'i'], [0x458, 'j'], [0x4BB, 'h'], [0x4CF, 'l'], [0x501, 'd'], [0x51B, 'q'], [0x51D, 'w'], // 키릴 ѕ і ј һ ӏ ԁ ԛ ԝ
  [0x3B1, 'a'], [0x3B5, 'e'], [0x3B9, 'i'], [0x3BA, 'k'], [0x3BD, 'v'], [0x3BF, 'o'], [0x3C1, 'p'], [0x3C4, 't'], [0x3C5, 'u'], [0x3C7, 'x'], [0x3C9, 'w'], [0x3F2, 'c'], [0x3F3, 'j'], // 그리스
  [0x131, 'i'], [0x261, 'g'], [0x1C0, 'l'], // 점 없는 i · 필기 g · 세로줄 글자
  [0x1D00, 'a'], [0x299, 'b'], [0x1D04, 'c'], [0x1D05, 'd'], [0x1D07, 'e'], [0xA730, 'f'], [0x262, 'g'], [0x29C, 'h'], [0x26A, 'i'], [0x1D0A, 'j'], [0x1D0B, 'k'], [0x29F, 'l'], [0x1D0D, 'm'],
  [0x274, 'n'], [0x1D0F, 'o'], [0x1D18, 'p'], [0x280, 'r'], [0xA731, 's'], [0x1D1B, 't'], [0x1D1C, 'u'], [0x1D20, 'v'], [0x1D21, 'w'], [0x28F, 'y'], [0x1D22, 'z'], // 작은 대문자
].map(([c, a]) => [String.fromCharCode(c), a]));
const LOOK_RE = new RegExp('[' + [...LOOK.keys()].join('') + ']', 'g');
/** 글 다듬기(띄어쓰기는 남김) — NFKD(넓은 글자 · 동그라미 · 꾸민 영어를 보통 글자로 · 악센트를 떼어 냄) → 작은 글자 → 줄바꿈은 띄어쓰기로 → 보이지 않는 글자 · 결합 글자 지움 → NFC(낱자모 「ㅅㅏ」가 붙음) → 닮은 글자 바꿈 */
const prep = s => String(s ?? '').normalize('NFKD').toLowerCase().replace(/[\t-\r\u0085\u2028\u2029]/g, ' ').replace(ZW, '').replace(/\p{M}/gu, '').normalize('NFC').replace(LOOK_RE, c => LOOK.get(c));
/** 띄어쓰기를 모두 지움(「。」 → 「.」) — 낱자모가 띄어쓰기 사이에 있었으면 여기서 글자로 붙음 */
const compact = t => t.replace(/\s+/g, '').replace(/[。｡]/g, '.').normalize('NFC');
/** 글자 사이에 띄어쓰기 없이 낀 기호(빗금 · 쉼표 · 물결 · 별표 · 더하기 · 따옴표 · 괄호 · 그림 글자 …) 지움 — ㉣ 「추/천」 「사~야」 「추🔥천」 「수/익」
   기호 앞이나 뒤가 띄어쓰기(문장 끝 쉼표 · 마침표)면 그대로 → 「시추, 천연가스」는 지남 · 숫자 사이 쉼표(「1,010,000」)도 그대로 */
const GLUE = /([^\s\p{P}\p{S}])([\p{P}\p{S}]+)(?=[^\s\p{P}\p{S}])/gu; // 앞 글자를 함께 잡음(뒤돌아보기 글꼴은 옛 사파리에서 쪽을 통째로 못 읽게 함 — 쓰지 않음)
const glue = t => t.replace(GLUE, (m, prev, run, i, str) => (run === ',' && /[0-9]/.test(prev) && /[0-9]/.test(str[i + m.length]) ? m : prev));
const base = s => compact(prep(s));
const strip = t => t.replace(SEP, '');
const dropOK = t => { for (const w of OKW) t = t.split(w).join(''); return t; };
/** 낱자모의 끝소리 — 받침 자리에 홀로 선 첫소리 글자(「천」을 「처ᄂ」)를 앞 글자 받침으로 붙임(받침이 없는 글자 뒤만) — ㉥ 「ㅊㅜㅊㅓㄴ」 */
const T_OF = Object.freeze({0x1100: 1, 0x1101: 2, 0x1102: 4, 0x1103: 7, 0x1105: 8, 0x1106: 16, 0x1107: 17, 0x1109: 19, 0x110A: 20, 0x110B: 21, 0x110C: 22, 0x110E: 23, 0x110F: 24, 0x1110: 25, 0x1111: 26, 0x1112: 27});
const TAIL1 = /[\uAC00-\uD7A3][\u1100-\u1112]/, TAIL = /[\uAC00-\uD7A3][\u1100-\u1112]/g;
const composeTail = t => t.replace(TAIL, m => { const c = m.charCodeAt(0) - 0xAC00, T = T_OF[m.charCodeAt(1)]; return c % 28 === 0 && T ? String.fromCharCode(0xAC00 + c + T) : m; });
/** 사람이 쓴 글의 꼴들 — A = 띄어쓰기만 지움 · B = 점 · 줄표와 낱말 속 기호도 지움 · C = B + 한글 숫자 → 보통 숫자 · J = B + 낱자모 끝소리 붙임(낱자모가 있을 때만) ·
   S = 점 · 줄표만 지움(「+」 「(」 는 남김 — 국제 전화) · P = 띄어쓰기를 남긴 글 + 한글 숫자(전화번호 꼴 보기). 괜찮은 낱말(OKW)은 꼴마다 지움 */
function formsOf(text) {
  const r = prep(text), a = compact(r), g = strip(compact(glue(r))), B = dropOK(g), a0 = r.replace(/\s+/g, '').replace(/[。｡]/g, '.'), B0 = dropOK(strip(a0));
  const A = dropOK(a), C = digits(B), J = TAIL1.test(g) ? dropOK(composeTail(g)) : null;
  // 견줄 꼴 모음 — 옛 꼴(a0 · B0 · digits(B0): 낱자모를 띄어쓰기 건너 붙이지 않고 기호를 지우지 않은 꼴)도 함께 봄 → 옛 거르기에 걸리던 글은 새 거르기에도 걸림
  return {A, B, C, J, S: strip(a), P: digits(r), as: [...new Set([A, dropOK(a0)])], bs: [...new Set([B, C, B0, digits(B0), J].filter(x => x != null))]};
}
/** 사람이 쓴 글의 세 꼴 — ㉠ 띄어쓰기만 지움 ㉡ 점 · 줄표 · 낱말 속 기호도 지움 ㉢ ㉡ + 한글 숫자 → 보통 숫자 (괜찮은 낱말은 꼴마다 지움) */
export function filterForms(text) { const {A, B, C} = formsOf(text); return [A, B, C]; }
/** 낱말마다 견줄 꼴 — a = ㉠ 에 · b = ㉡ ㉢ 에(「.com」 「.kr」 처럼 점으로 시작하거나 「@」 처럼 글자가 없는 낱말은 ㉠ 에만 — 점을 지우면 「com」 이 「comment」 를 거름) */
const WF = new Map();
for (const [, ws] of BLOCK) for (const w of ws) if (!WF.has(w)) { const a = base(w), b = strip(a); WF.set(w, {a, b: SEP0.test(a) || !/[\p{L}\p{N}]/u.test(b) ? null : b}); }
function has(t, w) {
  const e = EDGE[w]; if (!e) return t.includes(w);
  for (let i = t.indexOf(w); i >= 0; i = t.indexOf(w, i + 1)) {
    const p = t[i - 1], n = t[i + w.length];
    if ((!p || !e[0] || !e[0].test(p)) && (!e[1] || !n || !e[1].test(n))) return true;
  }
  return false;
}

/** 전화번호 꼴(㉦) — 낱말이 아니라 모양: 010 이 아닌 011 · 016 ~ 019 · 070(열 · 열한 자리) · 닮은 글자 「O1O」 「0l0」 · 국제 꼴 「+82 10 …」 「(82)10 …」 「+82 (0)10 …」 · 「00 82 10 …」
   · 6자리 종목 번호(011070 …)는 지남 — 무리 셋이 모두 구분 기호로 이어지거나(011-123-4567) 아니면 아예 안 끊긴 10 ~ 11자리(01112345678)일 때만 · 숫자 바로 앞뒤에 숫자가 붙어 있으면 지남 */
const SP = '[^\\p{L}\\p{N}]{1,3}', TAIL_NO = `(?:${SP}[0-9]{3,4}${SP}[0-9]{4}|[0-9]{7,8})(?![0-9])`;
const PH_NEW = new RegExp(`(?:^|[^0-9])(01[16789]|070)${TAIL_NO}`, 'u'); // 「숫자 바로 뒤가 아님」 = 앞 글자를 함께 잡아 봄(뒤돌아보기 안 씀)
const PH_LOOK = new RegExp(`(^|[^0-9])([0o][1il|][0o])${TAIL_NO}`, 'gu');
const PH_INTL = /(?:\+|\(|(?:^|[^0-9])00)82\)?\(?0?\)?1[016789],?[0-9]{3,4},?[0-9]{4}(?![0-9])/;
const PHONE_KIND = '연락처';
function phoneHit(F) {
  const m = PH_NEW.exec(F.P); if (m) return m[1];
  for (const x of F.P.matchAll(PH_LOOK)) if (/[01]/.test(x[2]) || !/[a-z]/.test(x[1])) return '010'; // 숫자 없는 「olo」 는 영어 낱말 끝(「polo」)이 아닐 때만
  if (PH_INTL.test(F.S)) return '+82';
  return null;
}

/** 사람이 쓴 글에서 걸린 것 모두 — [{kind, word}] · 갈래 차례 · 같은 낱말은 한 번 */
export function hits(text) {
  const F = formsOf(text), out = [], seen = new Set();
  for (const [kind, ws] of BLOCK) for (const word of ws) {
    if (seen.has(word)) continue;
    const f = WF.get(word);
    if (!(F.as.some(t => has(t, f.a)) || (f.b && F.bs.some(t => has(t, f.b))))) continue;
    seen.add(word);
    if (!out.some(x => x.word.includes(word) || word.includes(x.word))) out.push({kind, word}); // 「팔아」 · 「팔아라」는 하나로
  }
  if (!out.some(x => x.kind === PHONE_KIND)) { const w = phoneHit(F); if (w) out.push({kind: PHONE_KIND, word: w}); }
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
