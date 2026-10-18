/* 낱말표 — 한 곳(사장님 2026-10-18 00:15 명령문 [10] 1 「만든 낱말은 흔한 말로 바꿔라. 낱말표 한 곳에서 바꾼다 … 영어 사전도 같이」 · [10] 2 「챕터 낱말은 빼라. 7단 구조와 이름은 그대로」 · 일꾼 S12x)
   갈래 → 큰 업종 · 몸값 → 회사 크기 · 한 회사 한 표 → 평균 · 큰 회사는 크게 → 큰 회사 기준 · 20거래일 → 한 달 · 다섯 문 → 조건 다섯 · 쉬는 돈 → 현금으로 둠 · 챕터 → 단
   · 한국어 화면: 그려진 글(글 · aria-label · title · placeholder · alt · 창 제목)을 이 표로 바꿈(app.js 그리는 곳 한 줄 + 뒤에 그려지는 칸은 바뀜 알림으로) — 화면 코드 · 자료 글은 그대로
   · 영어 화면: 한국어는 건드리지 않음 — 영어 엔진(i18n.js)이 옛 한국어 틀로 사전을 찾으므로 · 옛 뜻 영어는 사전 값(scripts/atlas11/next/i18n/en-src.json)에서 바꿨고
     「20거래일」만 숫자 틀({n}거래일)이라 영어 글에서 바꿈(20 trading days → one month · 영어 엔진이 바꾼 뒤에 — 바뀜 알림을 엔진보다 늦게 둠)
   · 바꾸지 않는 곳: [lang="ko"](사장님 글 · 기사 · 공시 원문) · [data-proper](이름) · 편지(.m4-letter) · 사람이 친 글(input · textarea)
   · 토씨는 받침에 맞춤(갈래가 → 큰 업종이 · 몸값을 → 회사 크기를 · 한 회사 한 표로 → 평균으로) · 120거래일 같은 다른 수는 그대로 · 시험 tests/atlas11/glossary.test.mjs */
const HAN = '[가-힣]';
/** 토씨 — 받침 없는 말 뒤 꼴 → 받침 있는 말 뒤 꼴(긴 것 먼저 · 한 글자 토씨 중 뜻이 갈릴 수 있는 것은 뒤에 한글이 오지 않을 때만) */
const V2C = [['예요', '이에요'], ['였', '이었'], ['여서', '이어서'], ['라서', '이라서'], ['라고', '이라고'], ['라는', '이라는'], ['라면', '이라면'], ['란', '이란'], ['지만', '이지만'], ['라(?!' + HAN + ')', '이라'], ['랑', '이랑'],
  ['든(?!' + HAN + ')', '이든'], ['야(?!' + HAN + ')', '이야'], ['나(?!' + HAN + ')', '이나'], ['면(?!' + HAN + ')', '이면'], ['고(?!' + HAN + ')', '이고'], ['다(?!' + HAN + ')', '이다'], ['로', '으로'], ['가', '이'], ['는', '은'], ['를', '을'], ['와', '과']];
/** 받침 있는 말 뒤 꼴 → 받침 없는 말 뒤 꼴 */
const C2V = [['이에요', '예요'], ['이었', '였'], ['이어서', '여서'], ['이라서', '라서'], ['이라고', '라고'], ['이라는', '라는'], ['이라면', '라면'], ['이란', '란'], ['이지만', '지만'], ['이므로', '므로'], ['이며', '며'], ['이니', '니'],
  ['이라(?!' + HAN + ')', '라'], ['이랑', '랑'], ['이든', '든'], ['이야', '야'], ['이나', '나'], ['이면', '면'], ['이고', '고'], ['이다(?!' + HAN + ')', '다'], ['으로', '로'], ['이(?!' + HAN + ')', '가'], ['은', '는'], ['을', '를'], ['과', '와']];
const bare = s => s.replace(/\(\?!.*\)$/, ''); // 토씨 꼴에서 뒤 살핌 떼기
/** 낱말표 — [옛 말(정규식 글), 새 말, 토씨 바꿈('v' = 옛 말 끝 받침 없음 → 새 말 끝 받침 있음 · 'c' = 반대 · 없으면 그대로)] · 위에서부터 차례로 */
export const GLOSSARY = Object.freeze([
  ['챕터 일곱', '7단'],
  ['다음 챕터', '다음 단'],
  ['챕터', '단', 'v'],
  ['한 회사 한 표로 평균', '평균'], // 「… 오른 비율을 한 회사 한 표로 평균했어요」 → 「… 평균했어요」
  ['한 회사 한 표', '평균', 'v'],
  ['큰 회사는 크게 치면', '큰 회사 기준으로 치면'],
  ['큰 회사는 크게', '큰 회사 기준', 'v'],
  ['몸값(?:이)? 큰 회사일수록', '큰 회사일수록'], // 「몸값이 큰 회사일수록 크게 쳐서」 → 「큰 회사일수록 크게 쳐서」
  ['몸값 큰', '회사 크기가 큰'],
  ['몸값', '회사 크기', 'c'],
  ['(?<![\\d.,])20\\s?거래일\\s?\\(약 한 달\\)', '한 달'], // 「20거래일(약 한 달)」 — 겹말 없이
  ['(?<![\\d.,])20\\s?거래일', '한 달'], // 일 · 달 모두 ㄹ 받침 — 토씨 그대로 · 120거래일 · 2.20거래일은 그대로
  ['다섯 문(?=$|[^가-힣]|[은이을의에과도만까마부으])', '조건 다섯'], // 문 · 섯 모두 받침 — 토씨 그대로 · 다섯 문장 · 다섯 문제는 그대로
  ['쉬는 돈이에요', '현금으로 둬요'],
  ['쉬는 돈(?=$|[^가-힣]|[은이을의에과도만으])', '현금으로 둠'],
  ['(멍거|린치) 갈래', '$1 조건', 'v'], // 고르는 잣대 두 갈래(멍거 · 린치) — 업종 뜻이 아님
  ['갈래(?=[가는]\\s(?:아주\\s)?(?:넓|좁))', '범위'], // 「몇 해 뒤 갈래가 넓은 쪽」(앞으로 클까? — 결과의 폭) · 래 · 위 모두 받침 없음
  ['한 갈래는 함께', '같은 큰 업종은 함께'], // 「한 갈래는 함께 움직이기 쉽습니다」
  ['(두|세|네|다섯|여섯|일곱|여덟|아홉|열|여러) 갈래', '$1 가지'], // 「깔때기 두 갈래」 · 「여러 갈래로 나뉜 사업」 — 셈 뜻 · 래 · 지 모두 받침 없음
  ['큰 갈래', '큰 업종', 'v'],
  ['갈래', '큰 업종', 'v']
]);
const RULES = GLOSSARY.map(([o, n, j]) => {
  const parts = j === 'v' ? V2C : j === 'c' ? C2V : null;
  const alt = parts ? '(' + parts.map(p => p[0]).join('|') + ')?' : '';
  const map = parts ? new Map(parts.map(([a, b]) => [bare(a), b])) : null;
  return {re: new RegExp(o + alt, 'g'), n, map, groups: (o.match(/(?<!\\)\((?!\?)/g) || []).length}; // 잡는 묶음 수(\( · (?: · (?= · (?<! 은 안 셈)
});
const QUICK = /갈래|몸값|한 회사 한 표|큰 회사는 크게|거래일|다섯 문|쉬는 돈|챕터/;
/** 글 하나를 낱말표로(한국어) — 바뀔 것이 없으면 그대로 */
export function gloss(s) {
  if (s == null) return s;
  let x = String(s); if (!QUICK.test(x)) return x;
  for (const {re, n, map, groups} of RULES) {
    x = x.replace(re, (...a) => {
      const g = a.slice(1, 1 + groups), jo = map ? a[1 + groups] : undefined;
      const word = n.replace(/\$(\d)/g, (_, i) => g[Number(i) - 1] ?? '');
      return word + (jo ? map.get(jo) ?? jo : '');
    });
  }
  return x;
}

/* ---- 영어 화면 — 20거래일만(숫자 틀이라 사전 값으로는 못 바꿈) ---- */
const EN_FIX = [
  [/\b20 trading days \(about a month\)/g, 'one month'],
  [/\b([Tt]he )?(past|last) 20 trading days\b/g, (m, the, w) => (the || '') + w + ' month'],
  [/\b([Tt])he 20 trading days\b/g, (m, t) => t + 'he month'],
  [/\b20[- ]trading[- ]day\b(?=[- ][a-z])/g, 'one-month'],
  [/\b20 trading days?\b/g, 'one month'],
  [/\b20-trading-day\b/g, 'one-month']
];
const EN_QUICK = /\b20[- ]trading/;
/** 영어 글 하나 — 「20 trading days」 → 「one month」 */
export function glossEn(s) {
  if (s == null) return s;
  let x = String(s); if (!EN_QUICK.test(x)) return x;
  for (const [re, to] of EN_FIX) x = x.replace(re, to);
  return x;
}

/* ---- 화면 바꾸기 ---- */
const ATTRS = ['aria-label', 'title', 'placeholder', 'alt'];
const keep = el => { const k = el?.closest?.('[lang="ko"], [data-proper], .m4-letter, script, style, textarea, input'); return !!k && k !== document.documentElement && k !== document.body; };
let EN = null; // 화면 말(첫 부름에서 html lang 으로 정함 — 영어 엔진이 html lang 을 en 으로 바꾼 뒤)
const isEn = () => (EN ??= document.documentElement.lang === 'en' || document.documentElement.classList.contains('en'));
const fix = s => (isEn() ? glossEn(s) : gloss(s));
function doText(n) { const p = n.parentElement; if (!p || keep(p)) return; const s = n.nodeValue; if (!s) return; const o = fix(s); if (o !== s) n.nodeValue = o; }
function doEl(el) { if (keep(el)) return; for (const a of ATTRS) { const s = el.getAttribute?.(a); if (!s) continue; const o = fix(s); if (o !== s) el.setAttribute(a, o); } }
/** 칸 하나와 그 안 모두 */
export function glossTree(root) {
  if (!root) return;
  if (root.nodeType === 3) { doText(root); return; }
  if (root.nodeType !== 1 && root.nodeType !== 11) return;
  if (root.nodeType === 1) doEl(root);
  const w = document.createTreeWalker(root, NodeFilter.SHOW_TEXT | NodeFilter.SHOW_ELEMENT);
  for (let n = w.nextNode(); n; n = w.nextNode()) { if (n.nodeType === 3) doText(n); else doEl(n); }
}
let obs = null;
/** 그리는 곳 한 줄(app.js route) — 한국어면 지금 화면 · 창 제목을 바꾸고, 처음 한 번 뒤에 그려지는 칸도 바꾸게 바뀜 알림을 켬
    영어면 지금 화면은 영어 엔진이 아직 안 바꾼 한국어라 건드리지 않음 — 창 제목(이미 영어)만 · 바뀜 알림이 엔진이 바꾼 영어 글을 고침(알림 차례 = 켠 차례 · 엔진이 먼저 켬) */
export function glossView(root) {
  try {
    if (!isEn()) glossTree(root);
    const t = document.title, o = fix(t); if (o !== t) document.title = o;
    if (!obs && typeof MutationObserver === 'function' && document.body) {
      obs = new MutationObserver(list => {
        for (const m of list) {
          if (m.type === 'characterData') doText(m.target);
          else if (m.type === 'attributes') doEl(m.target);
          else for (const n of m.addedNodes) glossTree(n);
        }
      });
      obs.observe(document.body, {subtree: true, childList: true, characterData: true, attributes: true, attributeFilter: ATTRS});
    }
  } catch (e) { console.error(e); } // 낱말표가 깨져도 화면은 그대로
}
