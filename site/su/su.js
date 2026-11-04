/* 수르 새 판 — 주문 1238(사장님 2026-11-04 07:38(+04) 「aaa7377.com을 전면 개편한다」 · docs/design/su-new-2026-11-04/order-1238.txt)
   ① 움직이는 도식 ② 신문 차례(큰 값 → 중간 값 → 자세히 → 출처) ③ 물 흐르듯 일곱 걸음 ④ 글과 도식은 기승전결
   ⑤ 밑에서 도는 셈은 육하원칙(su-data.js w5hCo · w5hInd · w5hRec · say5 — 이름표는 화면에 안 씀) ⑥ 샘플 열하나 → 한 판(배운 것 docs/design/su-new-2026-11-04/learn11.md)
   ⑦ 탭은 유튜브처럼 아래 넷 · 기승전결 차례 ⑧ 첫 쪽부터 끝 쪽까지 한 틀 ⑨ 잡스가 만든다는 눈 — 한 쪽에 한 가지 · 군더더기 0
   일곱 걸음(탭) — 1 오늘 #/(기) → 2 꽃 #/b(승) → 3 회사 #/c/<번호>(승 · 셋째에 「왜 여기 있나」) → 4 조건 #/k/<번호>(전) → 5 업종 #/i/<업종>(전)
                   → 6 기록 #/r/<번호>(전) → 7 멈춤 #/p/<번호>(결) → 끝 단추 「왜 사?」 열한 질문(지금 수르 /next/#/why/<번호> — 답 · 기록 · 합계 셈은 그쪽)
   쪽마다 같은 틀(신문 한 면): 안전 문장 · 걸음 표시 · 머리 줄 · 큰 제목 · 큰 값 · 받은 때 띠 · 중간 값 · 움직이는 그림(네 박자) · 기승전결 네 줄 · 자세히 · 다음 걸음 단추 하나 · 출처
   앞 판: 수르 두 길(주문 2049) — 누르면 그 회사 · 그 업종으로 바로 가는 약속 · 본질 세 줄 · 안전 문장 · 가까운 곳 말은 그대로(검사 scripts/atlas11/next/check_su.mjs)
   보안 규칙(script-src 'self' · style-src 'self') — innerHTML 없음 · 글 속 style 없음 · 그림은 SVG 속성 · 움직임은 css 한 번(움직임 줄이기면 끝 모습) */
import {NAME, josa} from '/next/brand.js';
import {glossTree} from '/next/glossary.js'; // 낱말표 한 곳(몸값 → 회사 크기 …) — 지금 사이트와 같은 말 · 이름([data-proper])은 그대로
import {CODE, pct, moreLess, dateKo, bloomList, moneyList, reasonsFor, whyOf, idxLine, coLine, indRows, forwardTo, w5hCo, w5hInd, w5hRec, say5, jo} from '/su/su-data.js';
import {essenceData, essenceLines, kstText} from '/next/essence.js'; // 본질 세 줄(사장님 글자 그대로) · 받은 때 글
import {tally} from '/next/tally.js'; // 합계 칸 신호(① 멈춤) — 지금 수르 「왜 사?」와 같은 한 곳

const SVGNS = 'http://www.w3.org/2000/svg';
function h(tag, attrs = {}, ...kids) {
  const e = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs ?? {})) {
    if (v == null || v === false) continue;
    if (k === 'text') e.textContent = String(v);
    else if (k === 'class') e.className = v;
    else e.setAttribute(k, v === true ? '' : String(v));
  }
  for (const c of kids.flat(3)) if (c != null && c !== false) e.append(c instanceof Node ? c : String(c));
  return e;
}
const s = (tag, attrs = {}, ...kids) => { const e = document.createElementNS(SVGNS, tag); for (const [k, v] of Object.entries(attrs)) if (v != null) e.setAttribute(k, String(v)); for (const c of kids.flat(3)) if (c) e.append(c); return e; };

const cache = new Map();
const get = url => { if (!cache.has(url)) cache.set(url, fetch(url).then(r => (r.ok ? r.json() : null)).catch(() => null)); return cache.get(url); };
const D = {B: '/next/data/theme-bloom.json', TH: '/next/data/theme.json', W: '/next/data/flow-why.json', S: '/next/data/home-summary.json', H: '/atlas/data/home.json', M: '/atlas/data/mkt.json', co: c => '/atlas/data/co/' + c + '.json'};

const SAFE = '지난 기록만 보여 줘요. 앞날을 맞히지 않고 사고팔기를 권하지 않아요.';
const NOT_PICK = '조건에 다 맞지는 않아요. ' + josa(NAME, '가') + ' 고른 회사가 아니에요.';
const BLOOM = '꽃은 한 달 동안 시장보다 5% 넘게 더 오른 것이에요.';
const KN = ['영', '하나', '둘', '셋', '넷', '다섯', '여섯', '일곱', '여덟', '아홉', '열'];
const kn = n => KN[n] ?? String(n);
const num = n => (Number.isFinite(n) ? n.toLocaleString('ko-KR') : '?');
const numJo = t => (/[013678]$/.test(String(t)) ? '이' : '가'); // 숫자 끝 읽기(영 · 일 · 삼 · 육 · 칠 · 팔 = 받침 있음)
const coHref = code => '#/c/' + code;
const indHref = name => '#/i/' + encodeURIComponent(name);
const kHref = code => (code ? '#/k/' + code : '#/k');
const rHref = code => (code ? '#/r/' + code : '#/r');
const pHref = code => (code ? '#/p/' + code : '#/p');
const whyHref = code => '/next/#/why' + (code ? '/' + code : '');
const qHref = code => (code ? '#/q/' + code : '#/q'); // 새 판 「왜 사?」(주문 1506)

/* 「왜 사?」 열한 질문 — 지금 수르 site/next/p-why.js QS · GROUPS 글자 그대로(시험 tests/atlas11/su.test.mjs 가 맞댐) · 답하기와 기록은 지금 수르 쪽(합계 칸 ① 멈춤 · ② 약속 셈이 그쪽) */
export const WHY_QS = Object.freeze(['왜 사?', '공부했어?', '뭐가 좋아?', '얼마 넣어?', '흐름은?', '얼마나 올랐어?', '떨어지면?', '오르면?', '언제 쓸 돈?', '마음은?', '나눠 넣어?']);
export const WHY_GROUPS = Object.freeze([['이유', [1, 2, 3]], ['돈', [4, 9, 11]], ['때', [5, 6]], ['마음', [7, 8, 10]]]);
/* 「왜 사?」 답하기 — 새 판(주문 1506 · 사장님 2026-11-04 10:06(+04) 「어」 — 물음 「「왜 사?」 답하는 쪽도 새 판 모양으로 바꿀까요?」)
   답 셋 · 한마디 = p-why.js QS 의 a 글자 그대로(차례도 그대로) · 왜 묻나 = why-look.js LOOK 의 why 그대로 · 판정 이름 = why-look.js TYPE_OF 그대로(시험이 맞댐)
   판정 셈 = p-why.js judge 와 같음 · 기록 = 같은 열쇠 · 같은 꼴(매매일지 · 고도리 칸 · 한 달 약속이 지금 수르에서 그대로 이어짐) · 합계 칸 신호 = tally.js(stop · stop_rest) */
export const WHY_A = Object.freeze([
  [['r', '친구 말', '친구 말만 듣고 사면, 팔 때도 친구 말을 기다리게 돼.'], ['y', '뉴스', '뉴스는 모두가 같이 봐. 내 이유를 하나 더 찾아봐.'], ['g', '내가 따져 봄', '좋아! 내 이유가 있으면 흔들릴 때 버틸 수 있어.']],
  [['g', '했다', '좋아, 아는 만큼 덜 무서워.'], ['y', '조금', '조금 더 알아보자. 무엇을 파는 회사인지부터.'], ['r', '안 했다', '모르는 회사는 떨어질 때 더 무서워.']],
  [['g', '돈을 잘 번다', '돈을 잘 버는 회사는 오래 볼 힘이 있어.'], ['y', '클 일이 있다', '클 일이 정말 일어날지 날짜를 적어 두자.'], ['r', '그냥 오를 것 같다', '느낌은 이유가 아니야. 한 번 더 생각해 보자.']],
  [['g', '내 돈 열에 하나 이하', '좋아, 틀려도 다시 일어설 수 있어.'], ['y', '반쯤', '반은 많아. 조금 줄이면 마음이 편해.'], ['r', '거의 다·빌린 돈', '빌린 돈은 밤잠을 뺏어. 오늘은 줄이자.']],
  [['g', '조용히 조금씩 오름', '조용히 오를 때가 마음 편히 볼 때야.'], ['y', '떨어지는 중', '떨어지는 칼은 잡지 말자. 멈추는지 보자.'], ['r', '다들 떠들며 급등', '다들 떠들 때는 이미 늦었을 수 있어.']],
  [['g', '아직', '아직이면 서두를 까닭이 없어.'], ['y', '조금', '조금 올랐으면 어디까지 볼지 정해 두자.'], ['r', '벌써 두 배', '두 배 오른 뒤엔 내릴 길도 길어.']],
  [['g', '팔 곳 정함', '좋아, 정한 대로만 하면 돼.'], ['y', '생각만', '생각만 하면 그때 가서 흔들려. 숫자로 적어 둬.'], ['r', '안 정함', '사기 전에 팔 곳부터 정하자.']],
  [['g', '정함', '좋아, 욕심이 날 때 그 숫자를 보자.'], ['y', '모름', '오를 때 어디서 나눌지 미리 정해 두자.'], ['r', '끝까지 간다', '끝까지는 아무도 몰라. 나눠서 챙기자.']],
  [['g', '1년 넘게', '오래 둘 돈이면 기다릴 수 있어.'], ['y', '몇 달 안', '몇 달 안에 쓸 돈은 흔들리면 곤란해.'], ['r', '곧', '곧 쓸 돈은 주식에 넣지 말자.']],
  [['g', '차분', '차분하면 좋은 값을 기다릴 수 있어.'], ['r', '놓칠까 급함', '급하면 가장 비싼 값을 치르게 돼.'], ['r', '본전 생각', '본전 생각은 판단을 흐려. 오늘은 쉬자.']],
  [['g', '세 곳 이상', '좋아, 하나가 넘어져도 괜찮아.'], ['y', '두 곳', '한 곳 더 나눠 담으면 마음이 편해.'], ['r', '한 곳', '달걀을 한 바구니에 담지 말자.']],
]);
export const WHY_WHY = Object.freeze([
  '남의 말로 산 주식은 남의 말에 흔들리기 쉬워요. 내 이유가 있는지 확인해요.',
  '아는 만큼 덜 무서워요. 떨어질 때 버틸 힘이 돼요.',
  '느낌과 이유를 나눠 봐요. 이유가 있어야 오래 볼 수 있어요.',
  '틀려도 다시 일어설 수 있는 만큼만 넣어야 마음이 편해요.',
  '모두가 떠들 때 사면 비싸게 살 수 있어요. 지금 흐름을 봐요.',
  '많이 오른 뒤에는 내려갈 길도 길어요.',
  '사기 전에 팔 곳을 정해 두면 흔들릴 때 덜 무서워요.',
  '오를 때 욕심이 커져요. 미리 정한 숫자가 마음을 잡아 줘요.',
  '곧 쓸 돈은 값이 내려도 기다릴 수 없어요.',
  '급한 마음이 가장 비싼 값을 치르게 해요. 지금 마음은 충동 매매를 알아보는 데 중요한 요소예요.',
  '분산 투자는 위험을 줄이는 중요한 방법이에요. 하나가 넘어져도 다른 곳이 버텨 줘요.',
]);
export const WHY_TYPE = Object.freeze({go: ['신중한 준비형 투자자', '내 이유로 따져 보고, 정해 둔 대로 움직이는 편이에요.'], wait: ['반쯤 준비된 투자자', '이유는 있지만, 가끔 마음이 앞설 때가 있어요.'], rest: ['오늘은 쉬어 갈 투자자', '준비가 덜 된 곳이 많아요. 오늘은 하루 쉬어 가요.', '빌린 돈이나 곧 쓸 돈이라면, 오늘은 쉬어 가는 게 좋아요.']});
const WHY_PT = {g: 0, y: 1, r: 2}, WHY_MAX = WHY_QS.length * 2, WHY_KEY = 'atlas:godori-why';
const WHY_REST = [[3, WHY_A[3].findIndex(a => a[1] === '거의 다·빌린 돈')], [8, WHY_A[8].findIndex(a => a[1] === '곧')]];
const WHY_BIG = [2, WHY_A[2].findIndex(a => a[1] === '클 일이 있다')];
export const WHY_V = Object.freeze({'좋아, 정해 둔 대로만': 'go', '반만 준비됐어': 'wait', '오늘은 쉬어 가자': 'rest'});
/** 판정 — 점수 · 빨간 답 수 · 묶음 · 판정 글(p-why.js judge 와 같은 셈) */
export function judgeWhy(ans) {
  const pts = ans.map((k, i) => WHY_PT[WHY_A[i][k][0]]);
  const score = pts.reduce((s, x) => s + x, 0), reds = pts.filter(x => x === 2).length, stop = WHY_REST.some(([q, k]) => k >= 0 && ans[q] === k);
  const groups = Object.fromEntries(WHY_GROUPS.map(([n, qs]) => [n, qs.reduce((s, q) => s + pts[q - 1], 0)]));
  const verdict = stop || score >= 12 || reds >= 4 ? '오늘은 쉬어 가자' : score >= 6 ? '반만 준비됐어' : '좋아, 정해 둔 대로만';
  return {score, ready: WHY_MAX - score, reds, groups, verdict, stop};
}
/** 매매일지에 한 줄 더함(지금 수르 p-why.js save 와 같은 열쇠 · 같은 꼴 · 200줄까지) — 남겼나 */
function saveWhy(rec) {
  try {
    let all = []; try { const x = JSON.parse(localStorage.getItem(WHY_KEY) || '[]'); all = Array.isArray(x) ? x : []; } catch { all = []; }
    all.unshift(rec); localStorage.setItem(WHY_KEY, JSON.stringify(all.slice(0, 200))); return true;
  } catch { return false; }
}

/* 일곱 걸음 · 탭 넷(기승전결) — 걸음 → 탭: 1 기 · 2 ~ 3 승 · 4 ~ 6 전 · 7 결 */
export const STEPS = Object.freeze([['오늘', '기'], ['꽃', '승'], ['회사', '승'], ['조건', '전'], ['업종', '전'], ['기록', '전'], ['멈춤', '결']]);
const NTH = ['첫째', '둘째', '셋째', '넷째', '다섯째', '여섯째', '일곱째'];
export const TABS = Object.freeze([['기', '오늘', '#/'], ['승', '꽃', '#/b'], ['전', '까닭', '#/r'], ['결', '멈춤', '#/p']]);
let lastCo = null; // 보던 회사 — 일곱 걸음 끝까지 들고 감(화면 안에서만 · 남기지 않음)

/* ── 글씨 크게 · 읽어 주기(눈이 어두운 분 — 샘플 5 · 7 · 11) ── */
const store = {get: k => { try { return localStorage.getItem(k); } catch { return null; } }, set: (k, v) => { try { localStorage.setItem(k, v); } catch { /* 못 남겨도 그대로 */ } }};
const BIGK = 'su-big-text';
if (store.get(BIGK) === '1') document.documentElement.classList.add('su-lg');
const canSpeak = typeof speechSynthesis !== 'undefined' && typeof SpeechSynthesisUtterance === 'function';
const stopSpeak = () => { try { if (canSpeak) speechSynthesis.cancel(); } catch { /* 없음 */ } };
/** 읽을 글 — 큰 제목 · 큰 값 · 기승전결 네 줄(화면에 보이는 글 그대로) */
function readText() {
  const m = document.querySelector('#su main'); if (!m) return '';
  const pick = sel => [...m.querySelectorAll(sel)].map(e => e.textContent.replace(/\s+/g, ' ').trim()).filter(Boolean);
  return [...pick('h1'), ...pick('.su-big'), ...pick('.su-say li span')].map(t => (/[.?!]$/.test(t) ? t : t + '.')).join(' ');
}
function tools() {
  const lg = document.documentElement.classList.contains('su-lg');
  const big = h('button', {class: 'su-tool', type: 'button', 'aria-pressed': lg ? 'true' : 'false', text: '글씨 크게'});
  big.addEventListener('click', () => { const on = document.documentElement.classList.toggle('su-lg'); big.setAttribute('aria-pressed', on ? 'true' : 'false'); store.set(BIGK, on ? '1' : '0'); });
  if (!canSpeak) return h('div', {class: 'su-tools'}, big);
  const say = h('button', {class: 'su-tool', type: 'button', 'aria-pressed': 'false', text: '읽어 주기'});
  const off = () => { say.setAttribute('aria-pressed', 'false'); say.textContent = '읽어 주기'; };
  say.addEventListener('click', () => {
    if (say.getAttribute('aria-pressed') === 'true') { stopSpeak(); off(); return; }
    try {
      stopSpeak();
      const u = new SpeechSynthesisUtterance(readText()); u.lang = 'ko-KR'; u.rate = 0.9; u.onend = off; u.onerror = off;
      say.setAttribute('aria-pressed', 'true'); say.textContent = '그만 읽기';
      speechSynthesis.speak(u);
    } catch { off(); }
  });
  return h('div', {class: 'su-tools'}, big, say);
}

/* ── 한 면의 틀(쪽마다 같은 차례) ── */
const bar = () => h('header', {class: 'su-bar'},
  h('a', {class: 'su-logo', href: '#/', 'aria-label': NAME + ' 오늘로'}, h('img', {src: '/media/makbi-icon.svg', alt: '', width: 28, height: 28}), h('b', {text: NAME})),
  tools());
const safe = () => h('p', {class: 'su-safe', text: SAFE});
/** 걸음 표시 — 일곱 점 + 「3 / 7 · 회사」(서두르게 하지 않는 조용한 표시) */
const prog = n => h('p', {class: 'su-prog'},
  h('span', {class: 'su-dots', 'aria-hidden': 'true'}, STEPS.map((_, i) => h('i', {class: i < n - 1 ? 'on' : i === n - 1 ? 'now' : null}))),
  h('span', {class: 'su-progt', text: n + ' / 7 · ' + STEPS[n - 1][0]}));
const kicker = t => h('p', {class: 'su-kick', text: t});
const h1 = (t, proper = false) => h('h1', {class: 'su-h1', tabindex: '-1'}, proper ? h('span', {'data-proper': '', text: t}) : h('span', {text: t}));
/** 큰 값 — 그 쪽의 머리 값 하나(가장 큰 글씨) */
const big = (v, unit, sub) => h('div', {class: 'su-big'}, h('p', {class: 'su-bv'}, h('b', {text: v}), unit ? h('span', {text: unit}) : null), sub ? h('p', {class: 'su-bs', text: sub}) : null);
/** 받은 때 띠 — 큰 값 바로 밑(샘플 9) · 받은 때가 사흘 넘게 지났으면 「?」(본질 세 줄과 같은 셈) */
function got(S) {
  const e = essenceData({summary: S});
  return h('p', {class: 'su-got', text: '네이버 증권 · ' + (e.at ? (e.old ? '? ' : '') + kstText(e.at) + '에 받음' : '받은 때 ?')});
}
/** 중간 값 — 받치는 값 둘셋 */
const mids = items => h('ul', {class: 'su-mid'}, items.filter(Boolean).map(([k, v]) => h('li', {}, h('span', {class: 'su-mk', text: k}), h('b', {class: 'su-mv', text: v}))));
/** 기승전결 네 줄 — 그림과 같은 박자 · 셋째 줄은 「그런데」(정직한 반대 사실) · 넷째 줄은 「그래서」(다음 걸음) */
const BEAT = ['기', '승', '전', '결'];
const beats = lines => h('ol', {class: 'su-say'}, lines.slice(0, 4).map((t, i) => (t ? h('li', {class: 'b' + (i + 1)}, h('i', {'aria-hidden': 'true', text: BEAT[i]}), h('span', {text: t})) : null)));
/** 다음 걸음 — 쪽마다 하나(이름 = 가는 쪽 제목 · 샘플 2 · 3) · n = 이 쪽의 걸음 */
const next = (n, href, title) => h('a', {class: 'su-next', href},
  h('span', {class: 'su-nk', text: n < 7 ? NTH[n] + ' 걸음 · ' + STEPS[n][0] : '끝 · 내 이유 확인'}), h('span', {class: 'su-nt', text: title}), h('i', {'aria-hidden': 'true', text: '›'}));
/** 출처 — 맨 끝 · 가장 작은 글씨 */
const source = (asOf, S, ...extra) => h('footer', {class: 'su-src'}, h('div', {class: 'su-srcr'}, h('h2', {class: 'su-srch', text: '출처'}),
    S === false ? h('a', {class: 'su-full', href: '/next/'}, h('span', {text: '모든 기록'}), h('i', {'aria-hidden': 'true', text: '›'})) : null),
  h('p', {text: S === false ? dateKo(asOf) + ' 자료예요.' : '숫자는 네이버 증권에서 받아요. ' + dateKo(asOf) + ' 자료예요.' + (S?.fetchedAt ? ' 마지막으로 받은 때는 ' + kstText(S.fetchedAt) + '예요.' : '')}),
  extra.filter(Boolean).map(t => (typeof t === 'string' ? h('p', {text: t}) : t)));
const section = (label, title, ...kids) => h('section', {class: 'su-card', 'aria-label': label}, title ? h('h2', {class: 'su-ct', text: title}) : null, ...kids);
/** 아래 탭 넷 — 유튜브처럼 · 기승전결 차례 · 켜진 탭 = 위 막대 + 굵은 글 + 굵은 그림(색만이 아님) */
const ICON = {
  기: () => [s('rect', {x: 3.5, y: 4, width: 17, height: 16, rx: 3}), s('path', {d: 'M7 9h10M7 13h10M7 17h6'})],
  승: () => [s('circle', {cx: 12, cy: 7.5, r: 3}), s('circle', {cx: 7.5, cy: 11.5, r: 3}), s('circle', {cx: 16.5, cy: 11.5, r: 3}), s('circle', {cx: 9.5, cy: 16.5, r: 3}), s('circle', {cx: 14.5, cy: 16.5, r: 3})],
  전: () => [s('circle', {cx: 10.5, cy: 10.5, r: 6}), s('path', {d: 'M15 15l5 5'})],
  결: () => [s('circle', {cx: 12, cy: 12, r: 8.5}), s('path', {d: 'M10 8.5v7M14 8.5v7'})],
};
const tabs = active => h('nav', {class: 'su-tabs', 'aria-label': NAME + ' 탭'}, TABS.map(([b, label, href]) => h('a', {class: 'su-tab' + (b === active ? ' on' : ''), href, 'aria-current': b === active ? 'page' : null},
  s('svg', {viewBox: '0 0 24 24', class: 'su-ti', 'aria-hidden': 'true'}, ICON[b]()), h('span', {text: b + ' · ' + label}))));
/** 한 면 — 신문 차례 그대로 */
function paper({step, title, kick, head, value, S, mid, fig, say, body = [], go, src}) {
  return {title, beat: STEPS[step - 1][1], nodes: [bar(), h('main', {class: 'su-main'},
    safe(), prog(step), kicker(kick), head, value, got(S), mid, fig, beats(say), ...body.filter(Boolean), go, src)]};
}

/* ── 조건(맞은 것 먼저 · 못 맞은 것 뒤 — 그림 · 목록 · 문장이 같은 차례) ── */
const condsOf = bl => {
  const miss = bl.mode === 'near' && bl.miss ? bl.miss : null;
  return [...bl.say.filter(t => t !== miss).map(t => ({t, ok: true})), ...(miss ? [{t: miss, ok: false}] : [])];
};
const okNo = c => h('i', {class: c.ok ? 'su-mk-ok' : 'su-mk-no', 'aria-hidden': 'true', text: c.ok ? '✓' : '✕'});
const condList = cs => h('ol', {class: 'su-cond'}, cs.map((c, i) => h('li', {class: c.ok ? 'su-ok' : 'su-no'}, okNo(c),
  h('span', {class: 'su-cl'}, h('b', {class: 'su-cn', text: ((c.i ?? i) + 1) + ' · ' + (c.ok ? '맞음' : '안 맞음') + ' '}), h('span', {text: c.t})))));
/** 「셋 중 둘」 · 「셋 다」 · 「셋 중 하나도」 */
const matchWord = (n, ok) => (ok === n ? kn(n) + ' 다' : kn(n) + ' 중 ' + (ok ? kn(ok) : '하나도'));

/* ── 움직이는 그림(기승전결 네 박자 — .b1 틀 · .b2 값 · .b3 바뀜 · .b4 맺음 = 그 쪽의 큰 값) ── */
const fig = (label, cls, ...kids) => h('figure', {class: 'su-fig ' + cls, 'aria-label': label}, ...kids);
/** 오늘 — 회사 × 조건 판(맞음 ✓ 동그라미 · 안 맞음 ✕ 네모 · 맺음 「조건에 다 맞은 곳 n곳」) */
function figMatrix(bl) {
  const rows = bl.rows.slice(0, 3), cs = condsOf(bl);
  if (!rows.length || !cs.length) return null;
  const all = bl.mode === 'pick' ? bl.rows.length : 0, ok = cs.filter(c => c.ok).length;
  return fig('회사와 조건 판', 'su-mx',
    h('div', {class: 'su-mxg', role: 'img', 'aria-label': `${rows.length}곳이 조건 ${kn(cs.length)} 가운데 ${kn(ok)}에 맞았어요`},
      h('span', {class: 'su-mxh b1'}), cs.map((c, j) => h('span', {class: 'su-mxh b1', text: String(j + 1)})),
      rows.map(r => [h('span', {class: 'su-mxn b1', 'data-proper': '', text: r.name}),
        cs.map(c => h('span', {class: 'su-mxc ' + (c.ok ? 'ok b2' : 'no b3')}, okNo(c)))])),
    h('p', {class: 'su-mxr b4'}, h('span', {text: '조건에 다 맞은 곳'}), h('b', {text: all + '곳'})),
    h('figcaption', {class: 'su-cap'}, condList(cs.length > 2 && cs.some(c => !c.ok) ? cs.map((c, i) => ({...c, i})).filter(c => !c.ok) : cs),
      cs.some(c => !c.ok) && cs.length > 2 ? h('p', {class: 'su-capn', text: cs.map((c, i) => (c.ok ? i + 1 : null)).filter(Boolean).join(' · ') + '번 조건은 맞았어요.'}) : null));
}
/** 꽃 — 2,557곳에서 오늘 볼 회사까지 깔때기(샘플 3 · 6 · 11) */
function figFunnel(S, bl, mo) {
  const near = bl.mode === 'near', nb = bl.rows.length, nm = mo.length;
  return fig('오늘 볼 회사가 나온 길', 'su-fn',
    h('p', {class: 'su-fn0 b1'}, h('span', {text: '코스피 · 코스닥 회사'}), h('b', {text: num(S?.coN) + '곳'})),
    h('div', {class: 'su-fn2 b2'}, h('p', {class: 'bl', text: '꽃 조건 ' + kn(bl.say.length)}), h('p', {class: 'mo', text: '한 달 많이 오른 업종 ' + kn(nm)})),
    h('div', {class: 'su-fn2 b3'}, h('p', {class: near ? 'bl no' : 'bl', text: near ? '다 맞은 곳 없음 · 가장 가까운 곳' : bl.mode === 'pick' ? '조건에 다 맞은 곳' : '가까운 곳도 없음'}), h('p', {class: 'mo', text: '업종마다 대장 회사'})),
    h('div', {class: 'su-fn2 b4'}, h('p', {class: 'bl'}, h('i', {'aria-hidden': 'true', text: '●'.repeat(Math.min(nb, 5))}), h('b', {text: nb + '곳'})), h('p', {class: 'mo'}, h('i', {'aria-hidden': 'true', text: '■'.repeat(Math.min(nm, 5))}), h('b', {text: nm + '곳'}))),
    h('p', {class: 'su-mxr b4'}, h('span', {text: '오늘 볼 회사'}), h('b', {text: (nb + nm) + '곳'})));
}
/** 회사 — 싹에서 꽃까지 문 셋(샘플 1) · 맞은 문을 지나 못 맞은 문 앞에서 섬 */
function figPath(cs, name) {
  const n = cs.length, ok = cs.filter(c => c.ok).length, W = 340, Y = 30, x = i => 34 + (W - 68) * i / (n + 1); // 0 = 싹 · 1..n = 문 · n+1 = 꽃
  const reach = ok === n ? x(n + 1) : x(ok) + (x(ok + 1) - x(ok)) * 0.55;
  const g = s('svg', {viewBox: `0 0 ${W} 66`, class: 'su-svg su-path', role: 'img', 'aria-label': `${name} — 꽃 조건 ${matchWord(n, ok)}`});
  g.append(s('g', {class: 'b1'}, s('line', {x1: x(0), x2: x(n + 1), y1: Y, y2: Y, class: 'su-road'}),
    s('path', {d: `M${x(0)} ${Y + 12}V${Y - 2}M${x(0)} ${Y - 2}c-9 0-13-7-13-13c8 0 13 4 13 13M${x(0)} ${Y - 2}c0-9 5-13 13-13c0 6-4 13-13 13`, class: 'su-sprout'}),
    [0, 72, 144, 216, 288].map(a => s('circle', {cx: (x(n + 1) + 9 * Math.cos(a * Math.PI / 180)).toFixed(1), cy: (Y + 9 * Math.sin(a * Math.PI / 180)).toFixed(1), r: 6, class: ok === n ? 'su-petal on' : 'su-petal'})),
    s('circle', {cx: x(n + 1), cy: Y, r: 4, class: 'su-fc'})));
  g.append(s('g', {class: 'b2'}, s('line', {x1: x(0), x2: reach.toFixed(1), y1: Y, y2: Y, class: 'su-walk su-draw', pathLength: 1}),
    cs.map((c, i) => (c.ok ? s('circle', {cx: x(i + 1), cy: Y, r: 15, class: 'su-gate ok'}) : null)),
    cs.map((c, i) => (c.ok ? s('path', {d: `M${x(i + 1) - 6} ${Y}l4.5 4.5l8-9`, class: 'su-tick'}) : null))));
  g.append(s('g', {class: 'b3'}, cs.map((c, i) => (c.ok ? null : s('rect', {x: x(i + 1) - 14, y: Y - 14, width: 28, height: 28, rx: 4, class: 'su-gate no'}))),
    cs.map((c, i) => (c.ok ? null : s('path', {d: `M${x(i + 1) - 6} ${Y - 6}l12 12M${x(i + 1) + 6} ${Y - 6}l-12 12`, class: 'su-cross'}))),
    s('circle', {cx: reach.toFixed(1), cy: Y, r: 6, class: 'su-walker'})));
  g.append(s('g', {class: 'b4'}, ok ? s('path', {d: `M${x(1) - 16} ${Y + 22}v6H${x(ok) + 16}v-6`, class: 'su-brace'}) : null));
  return fig('싹에서 꽃까지', 'su-pathf', g,
    h('ol', {class: 'su-pathl', 'aria-hidden': 'true'}, h('li', {text: '싹'}), cs.map((c, i) => h('li', {class: c.ok ? 'ok' : 'no', text: String(i + 1)})), h('li', {text: '꽃'})),
    h('p', {class: 'su-mxr b4'}, h('span', {text: '꽃 조건'}), h('b', {text: matchWord(n, ok)})));
}
/** 회사 — 한 달 줄(회사 실선 · 끝 ● / 지수 점선 · 끝 ■ / 기준 100 / 빗금 = 앞날, 그리지 않음 — 샘플 7 · 9) */
let uid = 0;
function figLine(name, cl, il) {
  if (!cl) return null;
  const all = [...cl, ...(il?.line ?? [])], lo = Math.min(...all, 100), hi = Math.max(...all, 100), pad = Math.max(2, (hi - lo) * 0.12), y0 = lo - pad, y1 = hi + pad;
  const W = 340, H = 190, R = 292, X = (i, n) => 10 + (R - 20) * i / Math.max(1, n - 1), Y = v => 10 + (H - 20) * (1 - (v - y0) / (y1 - y0));
  const pts = l => l.map((v, i) => X(i, l.length).toFixed(1) + ',' + Y(v).toFixed(1)).join(' ');
  const last = cl.length - 1, cp = pct(cl[last] - 100), ip = il ? pct(il.line[il.line.length - 1] - 100) : null, id = 'su-hatch-' + (++uid), ie = il ? il.line.length - 1 : 0;
  const g = s('svg', {viewBox: `0 0 ${W} ${H}`, class: 'su-svg su-ln', role: 'img', 'aria-label': name + ' 한 달 ' + cp + (il ? ' · ' + il.name + ' 한 달 ' + ip : '')},
    s('defs', {}, s('pattern', {id, width: 8, height: 8, patternUnits: 'userSpaceOnUse', patternTransform: 'rotate(45)'}, s('line', {x1: 0, y1: 0, x2: 0, y2: 8, class: 'su-hl'}))));
  g.append(s('g', {class: 'b1'}, s('line', {x1: 10, x2: R, y1: Y(100).toFixed(1), y2: Y(100).toFixed(1), class: 'su-base'}),
    s('rect', {x: R + 6, y: 4, width: W - R - 10, height: H - 8, rx: 6, fill: `url(#${id})`, class: 'su-future'})));
  g.append(s('g', {class: 'b2'}, s('polyline', {points: pts(cl), class: 'su-lc su-draw', pathLength: 1})));
  g.append(s('g', {class: 'b3'}, il ? s('polyline', {points: pts(il.line), class: 'su-li su-draw', pathLength: 1}) : null));
  g.append(s('g', {class: 'b4'}, s('circle', {cx: X(last, cl.length).toFixed(1), cy: Y(cl[last]).toFixed(1), r: 7, class: 'su-dotc'}),
    il ? s('rect', {x: (X(ie, il.line.length) - 6).toFixed(1), y: (Y(il.line[ie]) - 6).toFixed(1), width: 12, height: 12, class: 'su-dotq'}) : null));
  return fig('한 달 그림', 'su-lnf', g, h('figcaption', {class: 'su-cap'},
    h('ul', {class: 'su-legend'},
      h('li', {class: 'su-lg-c'}, h('i', {'aria-hidden': 'true'}), h('span', {'data-proper': '', text: name}), h('b', {text: cp})),
      il ? h('li', {class: 'su-lg-i'}, h('i', {'aria-hidden': 'true'}), h('span', {text: il.name}), h('b', {text: ip})) : null),
    h('p', {class: 'su-capn', text: (il ? dateKo(il.from) + '부터 ' + dateKo(il.to) + '까지예요. ' : '') + '처음 날을 100으로 놓았어요. 끝에 ' + cl[last].toFixed(1) + numJo(cl[last].toFixed(1)) + ' 됐어요.'}),
    h('p', {class: 'su-capn', text: '빗금 칸은 앞날이에요. 그리지 않아요.'})));
}
/** 조건 · 까닭 — 업종마다 시장보다 더 오른 만큼 막대 · 꽃 조건 선(점선 · min) · 맺음 ✓ 넘음 / ✕ 못 미침(샘플 1 · 4) */
function figInds(items, min, cur) {
  const list = items.filter(x => Number.isFinite(x.x)).slice(0, 6);
  if (!list.length) return null;
  const top = Math.max(...list.map(x => x.x), min ?? 0, 1) * 1.15, W = 300, X = v => 4 + (W - 8) * Math.max(0, v) / top;
  return fig('업종 막대', 'su-hb', h('ul', {class: 'su-hbl'}, list.map(x => {
    const pass = min != null ? x.x > min : null;
    return h('li', {class: 'su-hbr b1' + (x.n === cur ? ' cur' : '')},
      h('p', {}, h('span', {class: 'su-hbn', text: x.n + (x.n === cur ? ' · 이 회사 업종' : '')}), h('b', {class: 'su-hbv', text: moreLess(x.x)}),
        pass == null ? null : h('i', {class: 'b4 ' + (pass ? 'su-mk-ok' : 'su-mk-no'), 'aria-hidden': 'true', text: pass ? '✓' : '✕'})),
      s('svg', {viewBox: `0 0 ${W} 20`, class: 'su-svg su-hbs', 'aria-hidden': 'true'},
        s('rect', {x: 4, y: 3, width: W - 8, height: 14, rx: 7, class: 'su-track'}),
        s('rect', {x: 4, y: 3, width: Math.max(3, X(x.x) - 4).toFixed(1), height: 14, rx: 7, class: 'b2 su-grow ' + (x.kind === 'mo' ? 'su-bmo' : 'su-bbl')}),
        min != null ? s('line', {x1: X(min).toFixed(1), x2: X(min).toFixed(1), y1: 0, y2: 20, class: 'b3 su-cond-line'}) : null));
  })), min != null ? h('p', {class: 'su-capn b3', text: '점선은 꽃 조건 선 ' + min + '%예요. 선을 넘어야 조건에 맞아요.'}) : null);
}
/** 업종 — 회사마다 한 달 오르내림 막대(가운데 0) · 줄을 누르면 그 회사(샘플 3 · 5) · 보던 회사는 열둘 밖이어도 표시(샘플 2) */
function barRows(rows, cur, cls = '') {
  const m = Math.max(...rows.map(r => Math.abs(r.c ?? 0)), 1), W = 300, Z = W / 2, X = v => Z + (Z - 4) * v / m;
  return h('ul', {class: 'su-rows su-cbars ' + cls}, rows.map(r => h('li', {class: r.code === cur ? 'cur' : null},
    h('a', {class: 'su-row', href: coHref(r.code)},
      h('span', {class: 'su-rt'},
        h('span', {class: 'su-rn'}, h('b', {'data-proper': '', text: r.name}), r.code === cur ? h('span', {class: 'su-chip', text: '보던 회사'}) : null),
        s('svg', {viewBox: `0 0 ${W} 16`, class: 'su-svg su-cbs', 'aria-hidden': 'true'},
          s('line', {x1: Z, x2: Z, y1: 0, y2: 16, class: 'su-axis'}),
          Number.isFinite(r.c) ? s('rect', {x: Math.min(Z, X(r.c)).toFixed(1), y: 3, width: Math.max(2, Math.abs(X(r.c) - Z)).toFixed(1), height: 10, rx: 3, class: 'b2 su-grow ' + (r.c >= 0 ? 'su-up' : 'su-dn su-growl')}) : null)),
      h('b', {class: 'su-rv' + (Number.isFinite(r.c) && r.c < 0 ? ' dn' : ''), text: (Number.isFinite(r.c) && pct(r.c) !== '0.0%' ? (r.c > 0 ? '▲ ' : '▼ ') : '') + pct(r.c)})))));
}
/** 기록 — 100칸 판 둘(가까웠던 회사 ● · 아무 회사 ■ · 같은 크기 — 샘플 1 · 7 · 9) */
function figDots(rec, who) {
  if (!rec) return null;
  const W = 340, H = 160, c = (b, i) => [b + 8 + (i % 10) * 15, 8 + Math.floor(i / 10) * 15];
  const g = s('svg', {viewBox: `0 0 ${W} ${H}`, class: 'su-svg su-dt', role: 'img', 'aria-label': `100번에 ${rec.rate}번 · 아무 회사 100번에 ${rec.base}번`});
  g.append(s('g', {class: 'b1'}, [0, 180].map(b => Array.from({length: 100}, (_, i) => s('circle', {cx: c(b, i)[0], cy: c(b, i)[1], r: 4.5, class: 'su-d0'})))));
  g.append(s('g', {class: 'b2'}, Array.from({length: rec.rate}, (_, i) => s('circle', {cx: c(0, i)[0], cy: c(0, i)[1], r: 6, class: 'su-d1'}))));
  g.append(s('g', {class: 'b3'}, Array.from({length: rec.base}, (_, i) => s('rect', {x: c(180, i)[0] - 5.5, y: c(180, i)[1] - 5.5, width: 11, height: 11, class: 'su-d2'}))));
  g.append(s('g', {class: 'b4'}, s('rect', {x: 1, y: 1, width: 156, height: 154, rx: 8, class: 'su-frame'}), s('rect', {x: 181, y: 1, width: 156, height: 154, rx: 8, class: 'su-frame'})));
  return fig('100번 판 둘', 'su-dtf', g, h('figcaption', {class: 'su-cap'},
    h('ul', {class: 'su-dtl'},
      h('li', {class: 'd1'}, h('i', {'aria-hidden': 'true', text: '●'}), h('span', {text: who}), h('b', {text: rec.rate + '번'})),
      h('li', {class: 'd2'}, h('i', {'aria-hidden': 'true', text: '■'}), h('span', {text: '아무 회사'}), h('b', {text: rec.base + '번'}))),
    h('p', {class: 'su-mxr b4'}, h('span', {text: '100번에 꽃이 된 횟수'}), h('b', {text: rec.rate + ' 대 ' + rec.base}))));
}
/** 멈춤 — 열한 질문 네 묶음(이유 · 돈 · 때 · 마음 = 기승전결 네 박자) */
const figQs = () => fig('열한 질문 네 묶음', 'su-qf', h('ol', {class: 'su-qg'}, WHY_GROUPS.map(([name, qs], k) => h('li', {class: 'b' + (k + 1)},
  h('i', {'aria-hidden': 'true', text: BEAT[k]}), h('b', {text: name}), h('span', {class: 'su-qd', 'aria-hidden': 'true', text: '●'.repeat(qs.length)}), h('span', {text: qs.length + '가지'})))),
h('p', {class: 'su-mxr b4'}, h('span', {text: '사기 전에 묻는 것'}), h('b', {text: WHY_QS.length + '가지'})));

/* ── 줄(오늘 쪽 · 회사로 바로 · 업종 이름은 따로 업종으로 — 샘플 2 · 3) ── */
function rowsOf(rows) {
  return h('ul', {class: 'su-rows'}, rows.map(r => h('li', {class: 'su-rli'},
    h('a', {class: 'su-row', href: r.href},
      h('span', {class: 'su-rt'},
        h('span', {class: 'su-rn'}, h('b', {'data-proper': '', text: r.name}), r.tag ? h('span', {class: 'su-chip', text: r.tag}) : null),
        r.sub ? h('span', {class: 'su-rs', text: r.sub}) : null),
      h('i', {class: 'su-go', 'aria-hidden': 'true', text: '›'})),
    r.ind ? h('a', {class: 'su-ichip', href: indHref(r.ind), 'aria-label': r.ind + ' 업종으로'}, h('span', {text: r.ind})) : null)));
}
/** 유튜브 첫 화면처럼 — 큰 그림(한 달 줄 · 빗금 앞날) + 이름 + 한 줄 까닭 */
function vidOf(r, cl, il) {
  const W = 320, H = 150, R = 280, all = cl ? [...cl, ...(il?.line ?? [])] : [100], lo = Math.min(...all, 100), hi = Math.max(...all, 100), pad = Math.max(2, (hi - lo) * 0.1);
  const X = (i, n) => 8 + (R - 16) * i / Math.max(1, n - 1), Y = v => 8 + (H - 16) * (1 - (v - lo + pad) / (hi - lo + 2 * pad));
  const pts = l => l.map((v, i) => X(i, l.length).toFixed(1) + ',' + Y(v).toFixed(1)).join(' ');
  return h('li', {class: 'su-vli'},
    h('a', {class: 'su-row su-vid', href: coHref(r.code)},
      h('span', {class: 'su-vt'},
        s('svg', {viewBox: `0 0 ${W} ${H}`, class: 'su-svg', 'aria-hidden': 'true'},
          s('line', {x1: 8, x2: R, y1: Y(100).toFixed(1), y2: Y(100).toFixed(1), class: 'su-base'}),
          s('rect', {x: R + 6, y: 6, width: W - R - 12, height: H - 12, rx: 6, class: 'su-future2'}),
          il ? s('polyline', {points: pts(il.line), class: 'su-li su-draw', pathLength: 1}) : null,
          cl ? s('polyline', {points: pts(cl), class: 'su-lc su-draw', pathLength: 1}) : null),
        cl ? h('span', {class: 'su-vbadge', text: '한 달 ' + pct(cl[cl.length - 1] - 100)}) : null),
      h('span', {class: 'su-rt'},
        h('span', {class: 'su-rn'}, h('b', {'data-proper': '', text: r.name}), r.tag ? h('span', {class: 'su-chip', text: r.tag}) : null),
        h('span', {class: 'su-rs', text: r.sub}))),
    r.ind ? h('a', {class: 'su-ichip', href: indHref(r.ind), 'aria-label': r.ind + ' 업종으로'}, h('span', {text: r.ind})) : null);
}

/* ── 쪽 ── */
async function base() {
  const [B, TH, W, S] = await Promise.all([get(D.B), get(D.TH), get(D.W), get(D.S)]);
  const bl = bloomList(B), mo = moneyList(TH, W);
  return {B, TH, W, S, bl, mo, asOf: B?.asOf ?? TH?.asOf ?? W?.asOf ?? null};
}
const bloomSub = bl => (bl.mode === 'near' ? '꽃 조건 ' + matchWord(bl.say.length, condsOf(bl).filter(c => c.ok).length) + ' 맞음' : '꽃 조건에 모두 맞음'); // 업종 이름은 옆 업종 단추가 말함
const moneySub = r => '업종이 시장보다 ' + moreLess(r.x);

/** 첫째 걸음 · 오늘(기) — 신문 첫 면: 꽃 조건에 다 맞은 회사 수가 머리 값(없는 날은 0곳 — 서두를 까닭이 없음 · 샘플 9 · 10) */
async function vHome() {
  const {S, bl, mo, asOf} = await base();
  const near = bl.mode === 'near', pick = bl.mode === 'pick', rec = bl.rec, cs = condsOf(bl), ok = cs.filter(c => c.ok).length;
  const n = pick ? bl.rows.length : 0;
  const say = [
    josa(NAME, '는') + ' 회사 ' + num(S?.coN) + '곳에서 꽃 조건에 맞는 회사를 찾아요.',
    near ? '오늘 가장 가까운 ' + bl.rows.length + '곳은 조건 ' + kn(cs.length) + ' 가운데 ' + kn(ok) + '에 맞았어요.' : pick ? '오늘 ' + n + '곳이 조건 ' + kn(cs.length) + '에 모두 맞았어요.' : '오늘은 꽃 조건에 가까운 회사가 없어요.',
    near ? '그런데 조건에 다 맞은 회사는 오늘 없어요.' : rec ? '그런데 지난 기록에서 이런 회사는 100번에 ' + rec.rate + '번 꽃이 됐어요.' : '그런데 돈이 몰린 업종은 있어요.',
    '그래서 서두르지 않고 한 곳씩 까닭을 봐요.'];
  return paper({step: 1, title: null, kick: dateKo(asOf) + ' 자료 · 이달 꽃 조건 ' + kn(bl.say.length),
    head: h1('꽃 조건에 다 맞은 회사'),
    value: big(String(n), '곳', near ? '가장 가까운 ' + bl.rows.length + '곳을 따로 보여 드려요.' : pick ? '이달 꽃 조건에 모두 맞았어요.' : '오늘은 가까운 회사도 없어요.'),
    S, mid: mids([near ? ['가장 가까운 곳', bl.rows.length + '곳'] : pick ? ['꽃이 될 회사', n + '곳'] : null, ['돈이 몰린 회사', mo.length + '곳']]),
    fig: figMatrix(bl) ?? figInds(mo.map(r => ({n: r.ind, x: r.x, kind: 'mo'})), null, null), say,
    body: [
      section('꽃이 될 회사', near ? '꽃이 될 회사 · 가까운 곳' : '꽃이 될 회사',
        bl.rows.length ? rowsOf(bl.rows.map(r => ({href: coHref(r.code), name: r.name, tag: near ? '가까운 곳' : null, sub: near ? null : bloomSub(bl), ind: r.ind || null}))) : h('p', {class: 'su-note', text: '오늘은 없어요.'}),
        near ? h('p', {class: 'su-note su-notp', text: NOT_PICK}) : null),
      section('돈이 몰린 회사', '돈이 몰린 회사',
        mo.length ? rowsOf(mo.map(r => ({href: coHref(r.code), name: r.name, sub: moneySub(r), ind: r.ind}))) : h('p', {class: 'su-note', text: '? 아직 못 셌어요.'}))],
    go: next(1, '#/b', '오늘 볼 회사 ' + (bl.rows.length + mo.length) + '곳 한눈에'),
    src: source(asOf, false, essBox(S))});
}

/** 둘째 걸음 · 꽃(승) — 유튜브 첫 화면처럼 카드 줄 · 머리 값 = 오늘 볼 회사 수 */
async function vBloom() {
  const [{S, bl, mo, asOf}, H] = await Promise.all([base(), get(D.H)]);
  const codes = [...new Set([...bl.rows.map(r => r.code), ...mo.map(r => r.code)])];
  const cos = Object.fromEntries(await Promise.all(codes.map(async c => [c, await get(D.co(c))])));
  const lineOf = c => coLine(cos[c]), idxOf = c => idxLine(H, cos[c]?.c?.market, H?.base, H?.asOf);
  const first = bl.rows[0] ?? mo[0] ?? null, near = bl.mode === 'near', top = mo[0];
  const say = [
    '꽃 조건으로 ' + bl.rows.length + '곳, 돈의 흐름으로 ' + mo.length + '곳을 골랐어요.',
    top ? '돈이 가장 많이 몰린 업종은 ' + jo(top.ind, '이에요') + '. 한 달 동안 시장보다 ' + moreLess(top.x) + ' 올랐어요.' : null,
    near && bl.min != null ? '그런데 꽃에 가까운 회사의 업종은 꽃 조건 선 ' + bl.min + '%에 못 닿았어요.' : '그런데 지난 기록이 앞날을 정해 주지는 않아요.',
    '그래서 회사 한 곳을 눌러 까닭부터 봐요.'];
  return paper({step: 2, title: '꽃', kick: dateKo(asOf) + ' 자료 · 오늘 볼 회사',
    head: h1('꽃이 될 회사와 돈이 몰린 회사'),
    value: big(String(bl.rows.length + mo.length), '곳', '회사 ' + num(S?.coN) + '곳 가운데 오늘 볼 회사예요.'),
    S, mid: mids([[near ? '꽃에 가까운 곳' : '꽃이 될 회사', bl.rows.length + '곳'], ['돈이 몰린 곳', mo.length + '곳']]),
    fig: figFunnel(S, bl, mo), say,
    body: [
      section('꽃이 될 회사', near ? '꽃에 가까운 회사' : '꽃이 될 회사',
        near ? h('p', {class: 'su-note su-notp', text: NOT_PICK}) : null,
        h('ul', {class: 'su-vids'}, bl.rows.map(r => vidOf({code: r.code, name: r.name, tag: near ? '가까운 곳' : null, sub: bloomSub(bl), ind: r.ind || null}, lineOf(r.code), idxOf(r.code))))),
      section('돈이 몰린 회사', '돈이 몰린 회사',
        h('ul', {class: 'su-vids'}, mo.map(r => vidOf({code: r.code, name: r.name, sub: moneySub(r), ind: r.ind}, lineOf(r.code), idxOf(r.code)))))],
    go: first ? next(2, coHref(first.code), first.name + ' · 왜 여기 있나') : next(5, rHref(null), '지난 기록'),
    src: source(asOf, S, BLOOM)});
}

/** 셋째 걸음 · 회사(승) — 왜 여기 있나가 머리 값(「셋 중 둘」 · 돈이 몰린 회사는 업종이 더 오른 만큼) */
async function vCo(code) {
  if (!CODE.test(code ?? '')) return notFound('이 회사를 찾지 못했어요.');
  const [{TH, S, bl, mo, asOf}, H, co] = await Promise.all([base(), get(D.H), get(D.co(code))]);
  const c = co?.c; if (!c || typeof c.name !== 'string') return notFound('이 회사를 찾지 못했어요.');
  const ind = typeof c.i === 'string' ? c.i : null;
  lastCo = {code, name: c.name, ind};
  const rs = reasonsFor(code, bl, mo), r0 = rs[0] ?? null, cl = coLine(co), il = idxLine(H, c.market, H?.base, H?.asOf);
  const t = say5(w5hCo({co: {code, name: c.name, ind, market: c.market}, reasons: rs, line: cl, index: il, asOf: H?.asOf ?? asOf}));
  const cs = condsOf(bl), ok = cs.filter(x => x.ok).length, bloomKind = r0?.kind === 'near' || r0?.kind === 'pick', money = r0?.kind === 'money';
  const tx = ind ? (TH?.inds ?? []).find(i => i?.n === ind)?.x : null;
  const value = bloomKind ? big(matchWord(cs.length, r0.kind === 'pick' ? cs.length : ok), null, '꽃 조건 ' + kn(cs.length) + ' 가운데 ' + (r0.kind === 'pick' ? '모두' : kn(ok) + '에') + ' 맞았어요.')
    : money ? big(moreLess(r0.x).replace(/ (더|덜)$/, ''), r0.x >= 0 ? '더' : '덜', r0.ind + ' 업종이 한 달 동안 시장보다 이만큼 ' + (r0.x >= 0 ? '더' : '덜') + ' 올랐어요.')
    : big(cl ? pct(cl[cl.length - 1] - 100) : '?', null, '한 달 동안 움직인 만큼이에요. 오늘 두 목록에는 없는 회사예요.');
  const say = money
    ? [t[0], r0.why?.line ? '까닭은 이래요. ' + r0.why.line : t[1], '그런데 돈이 몰린 업종이라고 꽃이 된다는 뜻은 아니에요.', '그래서 돈이 몰린 까닭을 자세히 봐요.']
    : bloomKind ? [t[0], t[1], r0.kind === 'near' && r0.no.length ? '그런데 「' + r0.no[0] + '」 조건 하나만 못 맞았어요.' : (bl.rec ? '그런데 지난 기록에서 이런 회사는 100번에 ' + bl.rec.rate + '번 꽃이 됐어요.' : null), r0.kind === 'near' ? '그래서 못 맞은 조건을 자세히 봐요.' : '그래서 조건을 하나씩 자세히 봐요.']
    : [josa(c.name, '는') + ' 오늘 두 목록에 없는 회사예요.', t[0] ?? null, '그런데 한 달 움직임만으로는 까닭을 알 수 없어요.', '그래서 업종을 함께 봐요.'];
  const go = bloomKind || money ? next(3, kHref(code), money ? '돈이 몰린 까닭' : r0.kind === 'near' ? '못 맞은 조건' : '맞은 조건 ' + kn(cs.length))
    : ind ? next(4, indHref(ind), ind + ' 업종') : next(5, rHref(code), '지난 기록');
  return paper({step: 3, title: c.name, kick: [c.market === 'KOSDAQ' ? '코스닥' : '코스피', ind ? ind + ' 업종' : null].filter(Boolean).join(' · '),
    head: h1(c.name, true), value, S,
    mid: mids([cl ? ['이 회사 한 달', pct(cl[cl.length - 1] - 100)] : null, il ? [il.name + ' 한 달', pct(il.line[il.line.length - 1] - 100)] : null,
      bloomKind && Number.isFinite(tx) ? ['업종 · 시장보다', moreLess(tx)] : money ? ['켜진 까닭', (r0.why?.items?.length ?? 0) + '가지'] : null]),
    fig: bloomKind ? figPath(r0.kind === 'pick' ? cs.map(x => ({...x, ok: true})) : cs, c.name) : figLine(c.name, cl, il), say,
    body: [
      ...rs.map(reasonCard),
      bloomKind ? figLine(c.name, cl, il) : null,
      ind ? h('a', {class: 'su-ind', href: indHref(ind)}, h('span', {text: ind + ' 업종'}), h('i', {'aria-hidden': 'true', text: '›'})) : null,
      h('a', {class: 'su-ask', href: qHref(code)}, h('span', {class: 'su-ask-a', text: '사기 전에 한 번 멈춰요'}), h('span', {class: 'su-ask-b', text: '「왜 사?」 열한 질문으로 내 이유부터 확인해요.'}))],
    go, src: source(H?.asOf ?? asOf, S, rs.length ? null : '이 회사는 오늘 두 목록에 없어요. 지난 한 달만 보여 드려요.')});
}
/** 왜 여기 있나 — 칸 하나에 까닭 하나(검사 글: 「조건에 가장 가까운 회사예요」 · 「맞은 조건」 · 「안 맞은 조건」 · 「돈이 몰린 회사예요」 · 「꽃이 될 회사예요」) */
function reasonCard(r) {
  const okList = list => h('ul', {class: 'su-cond'}, list.map(t => h('li', {class: 'su-ok'}, okNo({ok: true}), h('span', {text: t}))));
  if (r.kind === 'pick') return h('section', {class: 'su-card su-why', 'aria-label': '꽃이 될 회사예요'}, h('h2', {class: 'su-ct', text: '꽃이 될 회사예요'}),
    h('p', {class: 'su-lead', text: '오늘 조건 ' + kn(r.ok.length) + '에 모두 맞았어요.'}), okList(r.ok));
  if (r.kind === 'near') return h('section', {class: 'su-card su-why', 'aria-label': '조건에 가장 가까운 회사예요'}, h('h2', {class: 'su-ct', text: '조건에 가장 가까운 회사예요'}),
    h('p', {class: 'su-note su-notp', text: NOT_PICK}),
    h('h3', {class: 'su-h3', text: '맞은 조건'}), okList(r.ok),
    h('h3', {class: 'su-h3', text: '안 맞은 조건'}),
    h('ul', {class: 'su-cond'}, r.no.map(t => h('li', {class: 'su-no'}, okNo({ok: false}), h('span', {text: t})))));
  if (r.kind === 'money') return h('section', {class: 'su-card su-why', 'aria-label': '돈이 몰린 회사예요'}, h('h2', {class: 'su-ct', text: '돈이 몰린 회사예요'}),
    h('p', {class: 'su-lead', text: r.ind + ' 업종이 한 달 동안 시장보다 ' + moreLess(r.x) + ' 올랐어요.'}),
    r.why?.line ? h('p', {class: 'su-lead2', text: r.why.line}) : null);
  return null;
}

/** 넷째 걸음 · 조건(전) — 못 맞은 조건 · 맞은 조건 · 돈이 몰린 까닭(그런데 — 무엇이 모자랐나) */
async function vCond(code0) {
  const {TH, S, bl, mo, asOf} = await base();
  const code = code0 ?? lastCo?.code ?? bl.rows[0]?.code ?? mo[0]?.code ?? null;
  if (!CODE.test(code ?? '')) return notFound('이 회사를 찾지 못했어요.');
  const co = await get(D.co(code)), c = co?.c; if (!c || typeof c.name !== 'string') return notFound('이 회사를 찾지 못했어요.');
  const ind = typeof c.i === 'string' ? c.i : null; lastCo = {code, name: c.name, ind};
  const rs = reasonsFor(code, bl, mo), r0 = rs[0] ?? null, cs = condsOf(bl), ok = cs.filter(x => x.ok).length;
  const near = r0?.kind === 'near', pick = r0?.kind === 'pick', money = r0?.kind === 'money';
  const indX = n => (TH?.inds ?? []).find(i => i?.n === n)?.x;
  const inds = [...bl.rows.map(r => ({n: r.ind, x: indX(r.ind), kind: 'bl'})), ...mo.map(r => ({n: r.ind, x: r.x, kind: 'mo'}))]
    .filter((x, i, a) => x.n && Number.isFinite(x.x) && a.findIndex(y => y.n === x.n) === i).sort((a, b) => b.x - a.x);
  const pctRule = near && bl.min != null && /%/.test(bl.miss ?? '') && Number.isFinite(r0.ix);
  const goInd = ind ? next(4, indHref(ind), ind + ' 업종') : next(5, rHref(code), '지난 기록');
  if (money) {
    const items = r0.why?.items ?? [];
    return paper({step: 4, title: '돈이 몰린 까닭', kick: c.name + ' · ' + r0.ind + ' 업종',
      head: h1('돈이 몰린 까닭'), value: big(String(items.length), '가지', '지난 한 달 동안 ' + r0.ind + ' 업종에 있었던 일이에요.'), S,
      mid: mids([['업종 · 시장보다', moreLess(r0.x)], ['이 회사', '업종의 대장']]),
      fig: figInds(inds, null, r0.ind),
      say: [josa(c.name, '는') + ' ' + r0.ind + ' 업종의 대장이에요.', r0.why?.line ?? null, '그런데 돈이 몰린 것은 지난 한 달의 일이에요. 앞날을 말해 주지 않아요.', '그래서 ' + r0.ind + ' 업종을 함께 봐요.'],
      body: [items.length ? section('켜진 까닭', '켜진 까닭 ' + items.length + '가지', h('ol', {class: 'su-items'}, items.slice(0, 6).map(it => h('li', {}, h('b', {text: it.t}), it.sub ? h('span', {text: it.sub}) : null)))) : null],
      go: goInd, src: source(asOf, S)});
  }
  const csv = pick ? cs.map(x => ({...x, ok: true})) : cs;
  return paper({step: 4, title: '조건', kick: c.name + ' · 이달 꽃 조건 ' + kn(cs.length),
    head: h1(near ? '못 맞은 조건' : pick ? '맞은 조건 ' + kn(cs.length) : '이달 꽃 조건'),
    value: pctRule ? big(String(bl.min), '%', '꽃 조건 선이에요. 업종이 한 달 동안 시장보다 이만큼 넘게 더 올라야 해요.')
      : big(near ? '하나' : pick ? kn(cs.length) + ' 다' : kn(cs.length), null, near ? '못 맞은 조건이 하나예요.' : pick ? '조건에 모두 맞았어요.' : '이달 꽃 조건이에요.'),
    S, mid: mids([pctRule && ind ? [ind + ' 업종', moreLess(r0.ix)] : null, ['맞은 조건', (pick ? cs.length : ok) + '가지'], ['못 맞은 조건', (pick ? 0 : cs.length - ok) + '가지']]),
    fig: pctRule ? figInds(inds, bl.min, ind) : figPath(csv, c.name),
    say: [
      '이달 꽃 조건은 ' + kn(cs.length) + '예요.',
      near || pick ? josa(c.name, '는') + ' ' + (pick ? '모두' : kn(ok) + '에') + ' 맞았어요.' : josa(c.name, '는') + ' 오늘 꽃 조건 목록에 없어요.',
      pctRule ? '그런데 업종 조건에는 못 닿았어요. ' + ind + ' 업종은 시장보다 ' + moreLess(r0.ix) + '였어요.' : near ? '그런데 「' + r0.no[0] + '」 조건은 못 맞았어요.' : bl.rec ? '그런데 지난 기록에서 이런 회사는 100번에 ' + bl.rec.rate + '번 꽃이 됐어요.' : null,
      '그래서 ' + (ind ? ind + ' 업종의 돈 흐름을 봐요.' : '지난 기록을 봐요.')],
    body: [section('이달 꽃 조건', '이달 꽃 조건 ' + kn(cs.length), condList(csv), h('p', {class: 'su-lead2', text: BLOOM}))],
    go: goInd, src: source(asOf, S)});
}

/** 다섯째 걸음 · 업종(전) — 돈의 흐름 · 회사 막대(누르면 그 회사) */
async function vInd(name) {
  const [{TH, W, S}, M] = await Promise.all([base(), get(D.M)]);
  const rows = indRows(M, name); if (!rows.length) return notFound('이 업종을 찾지 못했어요.');
  const t = (Array.isArray(TH?.inds) ? TH.inds : []).find(i => i?.n === name), wy = whyOf(W, name), x = Number.isFinite(t?.x) ? t.x : null;
  const tt = say5(w5hInd({name, x, why: wy, rows, count: rows.length, asOf: M?.asOf}));
  const cur = lastCo?.ind === name ? rows.find(r => r.code === lastCo.code) ?? null : null;
  const known = rows.filter(r => Number.isFinite(r.c)), up = known.filter(r => r.c > 0).length;
  const top = rows.slice(0, 12), outside = cur && !top.some(r => r.code === cur.code);
  const say = [tt[0] ?? name + ' 업종 회사 ' + rows.length + '곳이에요.', tt[1] ?? null,
    cur && Number.isFinite(cur.c) ? '그런데 ' + josa(cur.name, '는') + ' 한 달 동안 ' + pct(cur.c) + ' 움직였어요.' : known.length - up > 0 ? '그런데 ' + (known.length - up) + '곳은 오르지 못했어요.' : null,
    '그래서 지난 기록을 함께 봐요.'];
  return paper({step: 5, title: name + ' 업종', kick: '돈의 흐름 · ' + dateKo(M?.asOf) + '까지 한 달',
    head: h1(name + ' 업종'),
    value: x != null ? big(moreLess(x).replace(/ (더|덜)$/, ''), x >= 0 ? '더' : '덜', '한 달 동안 시장보다 이만큼 ' + (x >= 0 ? '더' : '덜') + ' 올랐어요.') : big(String(rows.length), '곳', '이 업종 회사예요.'),
    S, mid: mids([['이 업종 회사', rows.length + '곳'], known.length ? ['한 달 동안 오른 곳', up + '곳'] : null, cur ? ['보던 회사', pct(cur.c)] : null]),
    fig: fig('회사 막대', 'su-cb',
      h('p', {class: 'su-capn b1', text: '한 달 동안 많이 오른 차례예요. 줄을 누르면 그 회사로 가요.'}),
      barRows(outside ? [...top, cur] : top, cur?.code),
      outside ? h('p', {class: 'su-capn b4', text: josa(cur.name, '는') + ' 위 12곳 밖에 있어요. 맨 아래에 따로 놓았어요.'}) : null,
      rows.length > 12 ? moreRows(rows.slice(12).filter(r => r.code !== cur?.code)) : null),
    say,
    body: [wy?.items?.length ? section('돈이 몰린 까닭', '돈이 몰린 까닭', wy.line ? h('p', {class: 'su-lead', text: wy.line}) : null,
      h('ol', {class: 'su-items'}, wy.items.slice(0, 4).map(it => h('li', {}, h('b', {text: it.t}), it.sub ? h('span', {text: it.sub}) : null)))) : null],
    go: next(5, rHref(cur?.code ?? lastCo?.code ?? null), '지난 기록 · 싹이 꽃이 된 횟수'),
    src: source(M?.asOf, S)});
}
/** 나머지 회사 — 단추를 누르면 펼침(한 쪽 길이를 지킴) */
function moreRows(rest) {
  if (!rest.length) return null;
  const box = h('div', {class: 'su-more'});
  const btn = h('button', {class: 'su-morebtn', type: 'button', text: '나머지 ' + rest.length + '곳도 보기'});
  btn.addEventListener('click', () => { box.replaceChildren(barRows(rest, null, 'su-rest')); glossTree(box); });
  box.append(btn);
  return box;
}

/** 여섯째 걸음 · 기록(전) — 그런데, 지난 기록(16 대 26 · 같은 크기 · 센 횟수 그대로) */
async function vRec(code) {
  const {S, bl, asOf} = await base();
  const co = code && CODE.test(code) ? await get(D.co(code)) : null, name = co?.c?.name ?? null;
  if (code && name) lastCo = {code, name, ind: typeof co.c.i === 'string' ? co.c.i : null};
  const pick = bl.mode === 'pick', rec = bl.rec, t = say5(w5hRec(rec, pick ? 'pick' : 'near')), who = pick ? '조건에 맞았던 회사' : '조건에 가까웠던 회사';
  const say = [t[0] ?? '지난 기록을 세었어요.', t[1] ?? null,
    rec ? (rec.rate < rec.base ? '그런데 ' + who + '가 아무 회사보다 꽃이 된 적이 적었어요.' : '그런데 지난 기록이 앞날을 정해 주지는 않아요.') : null,
    '그래서 사기 전에 내 이유부터 확인해요.'];
  return paper({step: 6, title: '기록', kick: (name ? name + ' · ' : '') + '지난 기록',
    head: h1(who + '의 지난 기록'),
    value: rec ? h('div', {class: 'su-big su-pair'}, h('p', {class: 'su-bv'}, h('b', {text: String(rec.rate)}), h('span', {text: '번'}), h('em', {text: '대'}), h('b', {text: String(rec.base)}), h('span', {text: '번'})),
      h('p', {class: 'su-bs', text: '100번에 꽃이 된 횟수예요. 앞은 ' + who + ', 뒤는 아무 회사예요.'})) : big('?', null, '지난 기록을 아직 못 셌어요.'),
    S, mid: rec ? mids([[pick ? '맞았던 회사' : '가까웠던 회사', '100번에 ' + rec.rate + '번'], ['아무 회사', '100번에 ' + rec.base + '번'], rec.n != null && rec.hits != null ? ['센 횟수', rec.n + '번 가운데 ' + rec.hits + '번'] : null]) : null,
    fig: figDots(rec, who), say,
    body: [section('어떻게 세었나', '어떻게 세었나',
      rec && rec.n != null && rec.hits != null ? h('p', {class: 'su-lead2', text: (pick ? '조건에 다 맞았던 지난날의 회사' : '조건에 다 맞은 회사가 없던 지난날, 가장 가까운 회사') + '를 ' + rec.n + '번 세었어요. 그 가운데 ' + rec.hits + '번 꽃이 됐어요.'}) : null,
      h('p', {class: 'su-lead2', text: BLOOM}),
      condList(condsOf(bl)))],
    go: next(6, pHref(name ? code : null), '사기 전에 한 번 멈춰요'),
    src: source(asOf, S, '지난 기록은 같은 조건을 지난날에 대어 센 것이에요.')});
}

/** 일곱째 걸음 · 멈춤(결) — 열한 질문 네 묶음 · 끝 단추 = 새 판 「왜 사?」 답하기(#/q · 주문 1506 — 기록 · 합계 셈은 지금 수르와 같은 곳) */
async function vPause(code) {
  const {S, asOf} = await base();
  const co = code && CODE.test(code) ? await get(D.co(code)) : null, name = co?.c?.name ?? null;
  return paper({step: 7, title: '멈춤', kick: '사기 전에' + (name ? ' · ' + name : ''),
    head: h1('한 번 멈춰요'),
    value: big(String(WHY_QS.length), '가지', '「왜 사?」 열한 질문으로 내 이유부터 확인해요.'), S,
    mid: mids(WHY_GROUPS.map(([g, q]) => [g, q.length + '가지'])),
    fig: figQs(),
    say: ['주식을 사기 전에 내 이유부터 물어요.', '질문은 열한 가지예요. 이유와 돈, 때와 마음 네 묶음이에요.', '그런데 답을 맞히는 시험이 아니에요.', '그래서 천천히 하나씩 답해요.'],
    body: [h('a', {class: 'su-ask', href: '#/j'}, h('span', {class: 'su-ask-a', text: '내 매매일지 ' + ((readWhy() ?? []).filter(fullWhy).length) + '번'}), h('span', {class: 'su-ask-b', text: '멈춘 기록과 한 달 뒤 약속을 봐요.'})),
      ...WHY_GROUPS.map(([g, qs], k) => section(g + ' 질문', BEAT[k] + ' · ' + g, h('ol', {class: 'su-qlist'}, qs.map(i => h('li', {}, h('i', {'aria-hidden': 'true', text: String(i)}), h('span', {text: WHY_QS[i - 1]}))))))],
    go: next(7, qHref(name ? code : null), (name ? name + ' — ' : '') + '「왜 사?」 열한 질문 하기'),
    src: source(asOf, S, '답과 기록은 내 휴대폰에만 남아요.')});
}

/** 「왜 사?」 답하기(결 · 주문 1506) — 한 번에 질문 하나(큰 글) · 답 셋(● 좋아요 · ▲ 한 번 더 생각 · ■ 멈춰요 — 모양과 글로) · 답하면 한마디 · 열한 개 뒤 결과(네 묶음 막대 · 기승전결)
    기록은 지금 수르 매매일지와 같은 곳에 남기고 합계 칸에 「멈춤」 신호 한 번(지금 수르와 같음) · 쿠폰 · 가입 · 선물 단추는 이 쪽에 두지 않음(매매일지 쪽은 그대로) */
const SHAPE = {g: '●', y: '▲', r: '■'}, TONE_W = {g: '좋아요', y: '한 번 더 생각', r: '멈춰요'};
async function vQuiz(code0) {
  const {asOf} = await base();
  const code = code0 && CODE.test(code0) ? code0 : null;
  const co = code ? await get(D.co(code)) : null, c = co?.c ?? null, name = typeof c?.name === 'string' ? c.name : null;
  if (code && name) lastCo = {code, name, ind: typeof c.i === 'string' ? c.i : null};
  const Q = {i: 0, ans: new Array(WHY_QS.length).fill(null), J: null, saved: false};
  let cur = null;
  const btn = (cls, kids, on) => { const b = h('button', {class: cls, type: 'button'}, kids); b.addEventListener('click', on); return b; };
  const dots = n => h('span', {class: 'su-dots su-qdots', 'aria-hidden': 'true'}, WHY_QS.map((_, k) => h('i', {class: k < n || Q.i === 'res' ? 'on' : k === n ? 'now' : null})));
  const foot = () => h('footer', {class: 'su-src'}, h('div', {class: 'su-srcr'}, h('h2', {class: 'su-srch', text: '출처'})),
    h('p', {text: '질문과 한마디는 지금 ' + NAME + ' 「왜 사?」와 같아요. 답은 이 휴대폰에만 남아요.'}));
  /** 다시 그림 — 새 질문 · 결과면 맨 위로(큰 제목에 초점) · 답만 고른 것이면 그 자리에서 한마디와 다음 단추가 보이게(엄지가 그대로 머묾) */
  const draw = (picked = false) => {
    const nm = Q.i === 'res' ? result() : ask();
    if (cur) {
      cur.replaceWith(nm); try { glossTree(nm); } catch (e) { console.error(e); }
      if (picked) { const y = window.scrollY; nm.querySelector('.su-a.on')?.focus?.({preventScroll: true}); window.scrollTo(0, y); nm.querySelector('.su-qnext')?.scrollIntoView?.({block: 'nearest'}); }
      else { window.scrollTo(0, 0); nm.querySelector('h1')?.focus?.({preventScroll: true}); }
    }
    cur = nm; return nm;
  };
  const finish = () => {
    const J = judgeWhy(Q.ans), v = WHY_V[J.verdict], ok = Number.isFinite(c?.price) && c.price > 0;
    Q.J = J;
    Q.saved = saveWhy({at: new Date().toISOString(), asOf: asOf ?? null, code, name, price: ok ? c.price : null, day: ok && typeof c.priceDate === 'string' ? c.priceDate : null,
      answers: [...Q.ans], score: J.score, reds: J.reds, verdict: J.verdict, groups: J.groups, bigDay: Q.ans[WHY_BIG[0]] === WHY_BIG[1] ? '' : null, why: null, promise: null, picks: []});
    tally(v === 'rest' ? 'stop_rest' : 'stop'); // 합계 칸 ① 멈춤 — 지금 수르 「왜 사?」 끝냄과 같은 신호
    Q.i = 'res'; draw();
  };
  const ask = () => {
    const i = Q.i, a = Q.ans[i], gi = WHY_GROUPS.findIndex(([, qs]) => qs.includes(i + 1)), last = i === WHY_QS.length - 1, ch = a != null ? WHY_A[i][a] : null;
    return h('main', {class: 'su-main su-quiz'},
      safe(),
      h('p', {class: 'su-prog'}, dots(i), h('span', {class: 'su-progt', text: (i + 1) + ' / ' + WHY_QS.length + ' · ' + WHY_GROUPS[gi][0]})),
      kicker('사기 전에' + (name ? ' · ' + name : '') + ' · ' + BEAT[gi] + ' 묶음'),
      h('h1', {class: 'su-h1 su-qh', tabindex: '-1'}, h('span', {text: WHY_QS[i]})),
      h('p', {class: 'su-qwhy', text: WHY_WHY[i]}),
      h('ul', {class: 'su-ans', 'aria-label': '답 셋'}, WHY_A[i].map(([tone, label], k) => h('li', {},
        btn('su-a' + (a === k ? ' on' : ''), [h('i', {class: 'su-shape ' + tone, 'aria-hidden': 'true', text: SHAPE[tone]}), h('span', {text: label})], () => { Q.ans[i] = k; draw(true); })))),
      ch ? h('div', {class: 'su-reply ' + ch[0], role: 'status'}, h('p', {class: 'su-rk'}, h('i', {'aria-hidden': 'true', text: SHAPE[ch[0]]}), h('b', {text: TONE_W[ch[0]]})), h('p', {class: 'su-rt2', text: ch[2]})) : h('p', {class: 'su-note su-qhint', text: '답 하나를 눌러요.'}),
      ch ? btn('su-next su-qnext', [h('span', {class: 'su-nk', text: last ? '끝 · 결과' : (i + 2) + ' / ' + WHY_QS.length}), h('span', {class: 'su-nt', text: last ? '결과 보기' : '다음 질문'}), h('i', {'aria-hidden': 'true', text: '›'})],
        () => { if (last) finish(); else { Q.i = i + 1; draw(); } }) : null,
      i > 0 ? btn('su-qback', [h('i', {'aria-hidden': 'true', text: '‹'}), h('span', {text: '앞 질문'})], () => { Q.i = i - 1; draw(); }) : null,
      foot());
  };
  const result = () => {
    const J = Q.J, v = WHY_V[J.verdict], T = WHY_TYPE[v], W = 300;
    const rows = WHY_GROUPS.map(([n, qs], k) => { const max = qs.length * 2, val = J.groups[n] ?? 0; return {n, k, max, ready: max - val, tone: val === 0 ? 'g' : val * 2 >= max ? 'r' : 'y'}; });
    const weak = rows.filter(r => r.ready < r.max).sort((a, b) => a.ready / a.max - b.ready / b.max)[0] ?? null;
    return h('main', {class: 'su-main su-quiz'},
      safe(),
      h('p', {class: 'su-prog'}, dots(WHY_QS.length), h('span', {class: 'su-progt', text: WHY_QS.length + ' / ' + WHY_QS.length + ' · 결과'})),
      kicker('사기 전에' + (name ? ' · ' + name : '') + ' · 결과'),
      h('h1', {class: 'su-h1', tabindex: '-1'}, h('span', {text: J.verdict})),
      big(String(J.ready), '/ ' + WHY_MAX, '준비된 만큼이에요. 높을수록 좋아요.'),
      mids([['당신은', T[0]], ['빨간 답', J.reds + '개']]),
      groupFig(rows, '네 묶음 막대', '당신은', T[0]),
      beats(['질문 열한 개에 모두 답했어요.', '준비는 ' + WHY_MAX + '점 가운데 ' + J.ready + '점이에요.',
        J.stop ? '그런데 빌린 돈이나 곧 쓸 돈이라고 답했어요.' : weak ? '그런데 ' + weak.n + ' 묶음이 가장 덜 준비됐어요.' : '그런데 답은 오늘 마음일 뿐이에요.',
        v === 'go' ? '그래서 정해 둔 대로만 해요.' : v === 'wait' ? '그래서 덜 된 묶음부터 채워요.' : '그래서 오늘은 하루 쉬어 가요.']),
      h('p', {class: 'su-lead2 su-quote', text: '“' + (v === 'rest' && J.stop ? T[2] : T[1]) + '”'}),
      section('내 답', '내 답 열한 개', h('ol', {class: 'su-myans'}, WHY_QS.map((q, k) => { const [tone, label] = WHY_A[k][Q.ans[k]];
        return h('li', {}, h('span', {class: 'su-mq', text: (k + 1) + ' · ' + q}), h('b', {class: 'su-ma ' + tone}, h('i', {'aria-hidden': 'true', text: SHAPE[tone]}), h('span', {text: label}))); }))),
      h('p', {class: 'su-note su-notp', text: Q.saved ? '오늘 답을 매매일지에 날짜와 함께 쌓았어요.' : '이 기기는 기록을 남길 수 없어요. 답은 이 화면에만 있어요.'}),
      h('a', {class: 'su-ask', href: '#/j'}, h('span', {class: 'su-ask-a', text: '내 매매일지 보기'}), h('span', {class: 'su-ask-b', text: '쌓인 답과 한 달 뒤 약속이 한 곳에 있어요.'})),
      btn('su-qback su-again', [h('i', {'aria-hidden': 'true', text: '↺'}), h('span', {text: '다시 하기'})], () => { Q.i = 0; Q.ans.fill(null); Q.J = null; draw(); }),
      h('a', {class: 'su-next', href: '#/'}, h('span', {class: 'su-nk', text: '처음으로'}), h('span', {class: 'su-nt', text: '오늘로 가기'}), h('i', {'aria-hidden': 'true', text: '›'})),
      foot());
  };
  return {title: '왜 사?', beat: '결', nodes: [bar(), draw()]};
}

/* ── 매매일지(주문 1519 · 사장님 2026-11-04 10:19(+04) 「지금 만든 것과 모든기록을 통합한다 · 기준은 이전 명령서와 같다 · 그림이 많아야 · 그림이 움직여야 · 5배 빠르게」) ──
   지금 수르 p-why.js 의 쌓인 기록 · 한 달 전 약속(「그날 정한 대로 했어?」 — 했어 · 안 했어 → 그 기록에 kept · 합계 칸 promise · promise_yes) · 한 달 뒤 값(장 스무 번 — 그 회사 · 같은 때 코스피 · 모든 회사 가운데 값)을 새 판 한 쪽(#/j)으로
   같은 열쇠 · 같은 꼴 · 같은 셈(장 스무 번 = /atlas/data/days.json · 달력 서른 날) · 틀린 것도 지우지 않음 · 그림 넷(판정 기둥 · 준비 점수 길 · 네 묶음 막대 · 기록마다 작은 막대) */
const readWhy = () => { try { const x = JSON.parse(localStorage.getItem(WHY_KEY) || '[]'); return Array.isArray(x) ? x : []; } catch { return null; } }; // null = 기억 못 하는 기계
const fullWhy = r => !!r && typeof r === 'object' && Array.isArray(r.answers) && r.answers.length === WHY_QS.length && r.answers.every((k, i) => Number.isInteger(k) && k >= 0 && k < WHY_A[i].length);
const readyOfRec = r => (Number.isFinite(r?.score) ? WHY_MAX - r.score : null);
const seoulDay = ms => new Date(ms + 9 * 36e5).toISOString().slice(0, 10);
const dayOf = r => { const x = Date.parse(r?.at); return Number.isFinite(x) ? seoulDay(x) : null; };
const won = n => Math.floor(n).toLocaleString('ko-KR') + '원';
const toneOf = v => (v === 'go' ? 'g' : v === 'rest' ? 'r' : 'y');
const VNAME = {go: '좋아, 정해 둔 대로만', wait: '반만 준비됐어', rest: '오늘은 쉬어 가자'};
/** 그날 정한 대로 했나 — 그 기록에만 남김(지우지 않음 · p-why.js keep 과 같은 꼴) · 남겼나 */
function keepWhy(r, yes) {
  const v = {a: yes ? 'yes' : 'no', at: new Date().toISOString()};
  r.kept = v;
  try {
    const all = readWhy() ?? [], k = all.findIndex(x => x && typeof x === 'object' && x.at === r.at && (x.code ?? null) === (r.code ?? null));
    if (k < 0) return false;
    all[k] = {...all[k], kept: v}; localStorage.setItem(WHY_KEY, JSON.stringify(all)); return true;
  } catch { return false; }
}
const LATER = 20; // 한 달 = 장 스무 번(p-why.js 와 같음)
/** 기록의 한 달 칸 — 시작 날(그날 값 날짜 · 자료 날 · 기록한 서울 날짜 · 그날이나 그 앞 마지막 장 날) → 스무 번째 장 날(아직이면 null) */
async function windowOfRec(r) {
  const days = await get('/atlas/data/days.json'), DD = Array.isArray(days?.dates) && days.dates.length ? days.dates : null;
  if (!DD) return null;
  const okD = x => typeof x === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(x);
  const t0 = okD(r.day) ? r.day : okD(r.asOf) ? r.asOf : dayOf(r);
  if (!t0 || t0 > DD[DD.length - 1]) return {k: -1, s: t0, e: null};
  let k = -1; for (let j = DD.length - 1; j >= 0; j--) if (DD[j] <= t0) { k = j; break; }
  return k < 0 ? {k, s: null, e: null} : {k, s: DD[k], e: DD[k + LATER] ?? null};
}
/** 한 달 지났나 — 장 스무 번이 지났거나 달력으로 서른 날(사이트 자료가 멈춰도 물음은 옴) */
async function dueOfRec(r) {
  let W = null; try { W = await windowOfRec(r); } catch (e) { console.error(e); }
  const cal = Number.isFinite(Date.parse(r.at)) && (Date.now() - Date.parse(r.at)) / 864e5 >= 30;
  return {due: W?.e ? true : cal, W};
}
const pctOf = (a, b) => (a > 0 && b > 0 ? (b / a - 1) * 100 : null);
/** 한 달 뒤 값 셋 — 그 회사 시작 날 종가 → 스무 번째 장 날 종가 · 같은 때 코스피 · 같은 때 모든 회사 가운데 값(/next/data/median20.json) · 못 찾으면 null */
async function laterOf(r, W) {
  if (!W?.e) return null;
  const [co, H, M] = await Promise.all([r.code && CODE.test(r.code) ? get(D.co(r.code)) : null, get(D.H), get('/next/data/median20.json')]);
  const cl = Array.isArray(co?.close) ? co.close : null, k0 = Number.isInteger(co?.k0) ? co.k0 : 0;
  const K = H?.idx?.KOSPI, kr = new Map(Array.isArray(K?.rows) ? K.rows.filter(x => Array.isArray(x)).map(x => [x[0], x[1]]) : []);
  if (typeof K?.date === 'string' && K.close > 0 && !kr.has(K.date)) kr.set(K.date, K.close);
  const mr = Array.isArray(M?.rows) ? M.rows.find(x => Array.isArray(x) && x[0] === W.s && x[1] === W.e) : null;
  return {s: W.s, e: W.e, co: cl ? pctOf(cl[W.k - k0], cl[W.k + LATER - k0]) : null, kospi: pctOf(kr.get(W.s), kr.get(W.e)), med: mr && Number.isFinite(mr[2]) ? mr[2] : null};
}
/** 판정 기둥 셋(● 좋아 · ▲ 반만 · ■ 쉬어) — 기 땅 → 승 좋아 기둥 → 전 반만 · 쉬어 기둥 → 결 멈춘 횟수 */
function figVerdicts(vc, total) {
  const cols = [['go', '좋아', 'g'], ['wait', '반만', 'y'], ['rest', '쉬어', 'r']], max = Math.max(1, ...cols.map(([k]) => vc[k])), W = 300, H = 120;
  const g = s('svg', {viewBox: `0 0 ${W} ${H}`, class: 'su-svg su-vc', role: 'img', 'aria-label': `좋아 ${vc.go}번 · 반만 ${vc.wait}번 · 쉬어 ${vc.rest}번`});
  g.append(s('g', {class: 'b1'}, s('line', {x1: 8, x2: W - 8, y1: H - 4, y2: H - 4, class: 'su-axis'})));
  cols.forEach(([k, , tone], j) => { const hh = vc[k] ? Math.max(8, (H - 16) * vc[k] / max) : 3; g.append(s('g', {class: j ? 'b3' : 'b2'}, s('rect', {x: 25 + j * 95, y: (H - 4 - hh).toFixed(1), width: 60, height: hh.toFixed(1), rx: 8, class: 'su-vgrow su-tone-' + tone}))); });
  return fig('판정 기둥 셋', 'su-vcf', g,
    h('ul', {class: 'su-vcl'}, cols.map(([k, label, tone]) => h('li', {}, h('i', {class: 'su-shape ' + tone, 'aria-hidden': 'true', text: SHAPE[tone]}), h('span', {text: label}), h('b', {text: vc[k] + '번'})))),
    h('p', {class: 'su-mxr b4'}, h('span', {text: '멈춘 횟수'}), h('b', {text: total + '번'})));
}
/** 준비 점수 길 — 왼쪽이 오래된 기록 · 오른쪽이 새 기록(서른 번까지) · 띠 셋 = 판정 셈의 문턱(17 넘게 좋아 · 11 ~ 16 반만 · 10 아래 쉬어) · 점은 모양으로 */
function figReady(full) {
  const L = full.slice(0, 30).reverse(), n = L.length; if (!n) return null;
  const W = 340, H = 170, X = i => 16 + (W - 32) * (n === 1 ? 0.5 : i / (n - 1)), Y = v => 8 + (H - 16) * (1 - v / WHY_MAX);
  const pts = L.map((r, i) => [X(i), Y(readyOfRec(r) ?? 0), toneOf(WHY_V[r.verdict])]);
  const mark = ([x, y, tone], big) => (tone === 'g' ? s('circle', {cx: x.toFixed(1), cy: y.toFixed(1), r: big ? 8 : 5.5, class: 'su-tone-' + tone + ' su-pt'})
    : tone === 'r' ? s('rect', {x: (x - (big ? 7 : 5)).toFixed(1), y: (y - (big ? 7 : 5)).toFixed(1), width: big ? 14 : 10, height: big ? 14 : 10, class: 'su-tone-' + tone + ' su-pt'})
    : s('path', {d: `M${x.toFixed(1)} ${(y - (big ? 8 : 6)).toFixed(1)}l${big ? 8 : 6} ${big ? 13 : 10}h-${big ? 16 : 12}z`, class: 'su-tone-' + tone + ' su-pt'}));
  const g = s('svg', {viewBox: `0 0 ${W} ${H}`, class: 'su-svg su-rd', role: 'img', 'aria-label': `준비 점수 ${n}번 — 마지막 ${readyOfRec(L[n - 1]) ?? '?'}점`});
  g.append(s('g', {class: 'b1'}, s('rect', {x: 4, y: Y(22), width: W - 8, height: (Y(16.5) - Y(22)).toFixed(1), class: 'su-zg'}), s('rect', {x: 4, y: Y(16.5).toFixed(1), width: W - 8, height: (Y(10.5) - Y(16.5)).toFixed(1), class: 'su-zy'}),
    s('rect', {x: 4, y: Y(10.5).toFixed(1), width: W - 8, height: (Y(0) - Y(10.5)).toFixed(1), class: 'su-zr'})));
  g.append(s('g', {class: 'b2'}, n > 1 ? s('polyline', {points: pts.map(([x, y]) => x.toFixed(1) + ',' + y.toFixed(1)).join(' '), class: 'su-rdl su-draw', pathLength: 1}) : null));
  g.append(s('g', {class: 'b3'}, pts.map(p => mark(p, false))));
  g.append(s('g', {class: 'b4'}, mark(pts[n - 1], true)));
  return fig('준비 점수 길', 'su-rdf', g, h('figcaption', {class: 'su-cap'},
    h('ul', {class: 'su-vcl'}, [['g', '위 띠 좋아'], ['y', '가운데 반만'], ['r', '아래 띠 쉬어']].map(([tone, txt]) => h('li', {}, h('i', {class: 'su-shape ' + tone, 'aria-hidden': 'true', text: SHAPE[tone]}), h('span', {text: txt})))),
    h('p', {class: 'su-capn', text: '왼쪽이 오래된 기록, 오른쪽이 새 기록이에요. 높을수록 준비가 된 것이에요.'})),
    h('p', {class: 'su-mxr b4'}, h('span', {text: '마지막 준비 점수'}), h('b', {text: (readyOfRec(L[n - 1]) ?? '?') + ' / ' + WHY_MAX})));
}
/** 네 묶음 막대(기 이유 · 승 돈 · 전 때 · 결 마음) — 묶음마다 준비된 만큼(rows = {n, k, max, ready, tone}) · 「왜 사?」 결과와 매매일지가 함께 씀 */
function groupFig(rows, label, endK, endV) {
  const W = 300;
  return fig(label, 'su-hb su-gb', h('ul', {class: 'su-hbl'}, rows.map(r => h('li', {class: 'su-hbr b' + (r.k + 1)},
    h('p', {}, h('span', {class: 'su-hbn', text: BEAT[r.k] + ' · ' + r.n}), h('b', {class: 'su-hbv', text: r.ready == null ? '?' : (Number.isInteger(r.ready) ? r.ready : r.ready.toFixed(1)) + ' / ' + r.max}), h('i', {class: 'su-shape ' + r.tone, 'aria-hidden': 'true', text: SHAPE[r.tone]})),
    s('svg', {viewBox: `0 0 ${W} 20`, class: 'su-svg su-hbs', 'aria-hidden': 'true'}, s('rect', {x: 4, y: 3, width: W - 8, height: 14, rx: 7, class: 'su-track'}),
      s('rect', {x: 4, y: 3, width: Math.max(3, (W - 8) * (r.ready ?? 0) / r.max).toFixed(1), height: 14, rx: 7, class: 'su-grow su-tone-' + r.tone}))))),
    h('p', {class: 'su-mxr b4'}, h('span', {text: endK}), h('b', {text: endV})));
}
const groupRows = groups => WHY_GROUPS.map(([n, qs], k) => { const max = qs.length * 2, val = Number.isFinite(groups?.[n]) ? groups[n] : null;
  return {n, k, max, ready: val == null ? null : max - val, tone: val == null ? 'y' : val === 0 ? 'g' : val * 2 >= max ? 'r' : 'y'}; });
/** 기록마다 작은 막대 넷(기록 줄 안 · 네 묶음 준비) */
function miniBars(groups) {
  const rows = groupRows(groups), W = 120, H = 30;
  return s('svg', {viewBox: `0 0 ${W} ${H}`, class: 'su-svg su-mini', 'aria-hidden': 'true'}, rows.map((r, j) => {
    const hh = Math.max(2, (H - 4) * (r.ready ?? 0) / r.max);
    return [s('rect', {x: 4 + j * 29, y: 2, width: 22, height: H - 4, rx: 4, class: 'su-track'}), s('rect', {x: 4 + j * 29, y: (H - 2 - hh).toFixed(1), width: 22, height: hh.toFixed(1), rx: 4, class: 'su-vgrow su-tone-' + r.tone})];
  }));
}
/** 한 달 전 약속 — 가장 오래된 것부터 하나씩(「그날 정한 대로 했어?」 · 했어 · 안 했어) · 답하면 그 기록에 남기고 합계 칸 신호 한 번 · 다시 그림 */
function dueBox(dues) {
  const r = dues[0], b1 = h('button', {class: 'su-kb', type: 'button', text: '했어'}), b2 = h('button', {class: 'su-kb', type: 'button', text: '안 했어'});
  const ask = yes => () => { if (b1.disabled) return; b1.disabled = b2.disabled = true; keepWhy(r, yes); tally(yes ? 'promise_yes' : 'promise'); route(); };
  b1.addEventListener('click', ask(true)); b2.addEventListener('click', ask(false));
  const rd = readyOfRec(r);
  return h('section', {class: 'su-card su-due', 'aria-label': '한 달 전 약속'}, h('h2', {class: 'su-ct', text: '한 달 전 약속'}),
    h('p', {class: 'su-lead2'}, h('b', {text: dateKo(dayOf(r))}), r.name || r.code ? h('span', {text: ' · '}) : null, r.name || r.code ? h('span', {'data-proper': '', text: String(r.name || r.code)}) : null,
      h('span', {text: ' · 준비 ' + (rd ?? '?') + ' / ' + WHY_MAX + ' · ' + (r.verdict ?? '?')})),
    h('p', {class: 'su-kq', text: '그날 정한 대로 했어?'}),
    h('div', {class: 'su-kbs', role: 'group', 'aria-label': '그날 정한 대로 했어?'}, b1, b2),
    dues.length > 1 ? h('p', {class: 'su-note', text: '한 달 지난 약속이 ' + (dues.length - 1) + '개 더 있어요.'}) : null);
}
const pctSpan = x => h('b', {class: 'su-lv' + (x != null && x < 0 ? ' dn' : ''), text: x == null ? '?' : pct(x)});
/** 기록 줄 하나 — 날짜 · 판정(모양과 글) · 준비 · 회사와 그날 값 · 작은 막대 넷 · 한 달 뒤(했어 · 안 했어 · 값 셋) */
function recCard(r, W, L) {
  const rd = readyOfRec(r), tone = toneOf(WHY_V[r.verdict]);
  return h('li', {class: 'su-jr'},
    h('div', {class: 'su-jrt'},
      h('div', {class: 'su-jri'},
        h('p', {class: 'su-jrh'}, h('b', {text: dateKo(dayOf(r))}), h('span', {class: 'su-ma ' + tone}, h('i', {'aria-hidden': 'true', text: SHAPE[tone]}), h('span', {text: r.verdict ?? '?'}))),
        h('p', {class: 'su-jrs'}, h('span', {text: '준비 ' + (rd ?? '?') + ' / ' + WHY_MAX}),
          r.code || r.name ? h('span', {text: ' · '}) : null, r.code || r.name ? h('span', {'data-proper': '', text: String(r.name || r.code)}) : null,
          r.code || r.name ? h('span', {text: r.price > 0 ? ' · 그날 값 ' + won(r.price) : ' · 그날 값 ?'}) : null)),
      miniBars(r.groups)),
    r.kept ? h('p', {class: 'su-jrk ' + (r.kept.a === 'yes' ? 'g' : 'r')}, h('i', {'aria-hidden': 'true', text: r.kept.a === 'yes' ? SHAPE.g : SHAPE.r}), h('span', {text: r.kept.a === 'yes' ? '한 달 뒤 — 정한 대로 했어요.' : '한 달 뒤 — 정한 대로 못 했어요.'})) : null,
    r.kept && L ? h('p', {class: 'su-jrv'}, h('span', {text: dateKo(L.s) + ' → ' + dateKo(L.e) + ' · '}), r.code || r.name ? h('span', {text: '이 회사 '}) : null, r.code || r.name ? pctSpan(L.co) : null,
      h('span', {text: ' · 코스피 '}), pctSpan(L.kospi), h('span', {text: ' · 모든 회사 가운데 값 '}), pctSpan(L.med)) : null,
    !r.kept && !W?.e ? h('p', {class: 'su-note', text: '한 달이 지나면 그날 정한 대로 했는지 먼저 물어요.'}) : null);
}

/** 매매일지 쪽(결 · #/j) — 큰 값 = 멈춘 횟수 · 중간 값 = 정한 대로 한 수 · 한 달 지난 약속 · 마지막 기록 · 그림 넷 · 기승전결 · 한 달 전 약속 · 쌓인 기록 */
async function vJournal() {
  const {S, asOf} = await base();
  const raw = readWhy(), can = raw != null, full = (raw ?? []).filter(fullWhy);
  const metas = await Promise.all(full.map(async r => ({r, ...(await dueOfRec(r))})));
  const dues = metas.filter(m => m.due && !(m.r.kept?.a === 'yes' || m.r.kept?.a === 'no')).map(m => m.r).sort((a, b) => (Date.parse(a.at) || 0) - (Date.parse(b.at) || 0));
  const shown = metas.slice(0, 30), laters = await Promise.all(shown.map(m => (m.r.kept && m.W?.e ? laterOf(m.r, m.W).catch(() => null) : null)));
  const vc = {go: 0, wait: 0, rest: 0}; full.forEach(r => { const v = WHY_V[r.verdict]; if (v) vc[v]++; });
  const kept = full.filter(r => r.kept?.a === 'yes').length, top = Object.entries(vc).sort((a, b) => b[1] - a[1])[0];
  const avg = {}; for (const [n] of WHY_GROUPS) { const v = full.map(r => r.groups?.[n]).filter(Number.isFinite); avg[n] = v.length ? v.reduce((a, b) => a + b, 0) / v.length : null; }
  const say = full.length ? ['이 휴대폰에서 「왜 사?」에 ' + full.length + '번 답했어요.', '가장 많은 판정은 「' + VNAME[top[0]] + '」' + jo(VNAME[top[0]], '이에요').slice(VNAME[top[0]].length) + '.',
    dues.length ? '그런데 한 달 지난 약속 ' + dues.length + '개에 아직 답하지 않았어요.' : '그런데 기록은 이 휴대폰에만 있어요.',
    dues.length ? '그래서 한 달 전 약속부터 답해요.' : '그래서 사기 전에 또 한 번 멈춰요.']
    : ['아직 「왜 사?」 기록이 없어요.', '열한 질문에 답하면 날짜와 함께 여기 쌓여요.', '그런데 기록은 이 휴대폰에만 남아요.', '그래서 오늘 첫 기록을 남겨 봐요.'];
  return paper({step: 7, title: '매매일지', kick: '내 기록 · 이 휴대폰에만',
    head: h1('내 매매일지'), value: big(String(full.length), '번', '사기 전에 멈춰 「왜 사?」에 답한 횟수예요.'), S,
    mid: mids([['정한 대로 했어요', kept + '번'], ['한 달 지난 약속', dues.length + '개'], full[0] ? ['마지막 기록', dateKo(dayOf(full[0]))] : null]),
    fig: full.length ? figVerdicts(vc, full.length) : figQs(), say,
    body: [
      dues.length ? dueBox(dues) : null,
      full.length ? figReady(full) : null,
      full.length ? groupFig(groupRows(avg), '네 묶음 평균', '기록', full.length + '번의 평균') : null,
      full.length ? section('쌓인 기록', '쌓인 기록 ' + full.length + '번',
        h('p', {class: 'su-note', text: '틀린 것도 지우지 않아요. 한 달이 지나면 그날 정한 대로 했는지 먼저 묻고, 그 뒤 값을 같은 때 코스피와 모든 회사 가운데 값과 함께 붙여요.'}),
        h('ol', {class: 'su-jl'}, shown.map((m, i) => recCard(m.r, m.W, laters[i]))),
        full.length > 30 ? h('p', {class: 'su-note', text: '새 기록 서른 줄만 보여요. 나머지 ' + (full.length - 30) + '줄도 지우지 않고 그대로 있어요.'}) : null) : null,
      can ? null : h('p', {class: 'su-note su-notp', text: '이 기기는 기록을 남길 수 없어요.'})],
    go: next(7, qHref(lastCo?.code ?? null), '「왜 사?」 열한 질문 하기'),
    src: source(asOf, S, '기록은 이 휴대폰에만 있어요. 이름도 열쇠도 받지 않아요.')});
}

function notFound(msg) {
  return {title: '?', beat: null, nodes: [bar(), h('main', {class: 'su-main'}, safe(), h('p', {class: 'su-lead su-none', text: '? ' + msg}),
    h('a', {class: 'su-next', href: '#/'}, h('span', {class: 'su-nk', text: '처음으로'}), h('span', {class: 'su-nt', text: '오늘로 가기'}), h('i', {'aria-hidden': 'true', text: '›'})))]};
}

/** 본질 세 줄 — essence.js 그대로(회사 수 · 받은 때 = home-summary.json · 못 읽으면 「?」) */
function essBox(S) {
  const lines = essenceLines(essenceData({summary: S}));
  return h('section', {class: 'su-ess', 'aria-label': NAME + ' 세 줄'}, lines.map((t, i) => h('p', {'data-ess': String(i + 1), text: t})));
}

let seq = 0;
const scrollMemo = new Map();
async function route() {
  const fw = forwardTo(location.search, location.hash); // 지금 수르 고리(#/w/ · #/s/ · ?lang= …)는 그쪽으로 그대로
  if (fw) { location.replace(fw); return; }
  stopSpeak();
  const hh = location.hash || '#/';
  const m = /^#\/(c|i|k|r|p|q)\/(.+)$/.exec(hh), t = /^#\/([bkrpqj])$/.exec(hh);
  let a = null; if (m) { try { a = decodeURIComponent(m[2]); } catch { a = m[2]; } }
  const my = ++seq, root = document.getElementById('su');
  let out;
  try {
    out = m ? (m[1] === 'c' ? await vCo(a) : m[1] === 'i' ? await vInd(a) : m[1] === 'k' ? await vCond(a) : m[1] === 'r' ? await vRec(a) : m[1] === 'q' ? await vQuiz(a) : await vPause(a))
      : t ? (t[1] === 'b' ? await vBloom() : t[1] === 'k' ? await vCond(null) : t[1] === 'r' ? await vRec(null) : t[1] === 'q' ? await vQuiz(null) : t[1] === 'j' ? await vJournal() : await vPause(null)) : await vHome();
  } catch (e) { console.error(e); out = notFound('화면을 그리지 못했어요. 잠시 뒤 다시 열어 주세요.'); }
  if (my !== seq) return;
  root.replaceChildren(...out.nodes.filter(Boolean), tabs(out.beat));
  try { glossTree(root.querySelector('main')); } catch (e) { console.error(e); }
  document.title = (out.title ? out.title + ' · ' : '') + NAME;
  window.scrollTo(0, hh === '#/' && scrollMemo.has(hh) ? scrollMemo.get(hh) : 0);
  root.querySelector('h1')?.focus?.({preventScroll: true});
}
window.addEventListener('hashchange', e => { try { const u = new URL(e.oldURL); scrollMemo.set(u.hash || '#/', window.scrollY); } catch { /* 그대로 */ } route(); });
route();
