/* 큐피트 — 「왜 사?」 열한 질문(7) · 내 매매일지(8 · 끝) — 빈 파일에서 새로 쓴 쪽(주문 1616 · docs/design/su-full-2026-11-04/order-1616.txt)
   질문 · 답 · 한마디 · 왜 묻나 · 판정 셈 · 기록 열쇠와 꼴 · 한 달 뒤 셈은 예전 앱 /next/p-why.js · why-look.js 와 글자 그대로(시험 tests/atlas11/su.test.mjs 가 맞댐 — 바꾸면 안 되는 약속)
   화면(꽃잎 열하나 · 한 달 뒤 활 · 기록 시간 줄 · 판정 기둥)은 새로 씀(시안 11 「사기 전에 멈춤」) · 주문 1807: 값마다 「그래서」 뜻 줄 · 「전문가용 자세히」(점수 셈 · 판정 문턱 · 기록 줄) */
import {CODE, won100, dateKo} from '/su/su-data.js';
import {NEED, val, eQuizResult, eJournal} from '/su/su-six.js';
import {h, s, fig, bars, tally3} from '/su/su-fig.js';
import {tally} from '/next/tally.js'; // 합계 칸 신호(① 멈춤 · 약속) — 예전 앱 「왜 사?」와 같은 한 곳

const cache = new Map();
const get = url => { if (!cache.has(url)) cache.set(url, fetch(url).then(r => (r.ok ? r.json() : null)).catch(() => null)); return cache.get(url); };
const D = {H: '/atlas/data/home.json', co: c => '/atlas/data/co/' + c + '.json'};

/* 「왜 사?」 열한 질문 — 예전 앱 site/next/p-why.js QS · GROUPS 글자 그대로(시험 tests/atlas11/su.test.mjs 가 맞댐) · 답하기와 기록은 예전 앱 쪽과 같은 열쇠(합계 칸 ① 멈춤 · ② 약속 셈이 그쪽) */
export const WHY_QS = Object.freeze(['왜 사?', '공부했어?', '뭐가 좋아?', '얼마 넣어?', '흐름은?', '얼마나 올랐어?', '떨어지면?', '오르면?', '언제 쓸 돈?', '마음은?', '나눠 넣어?']);
export const WHY_GROUPS = Object.freeze([['이유', [1, 2, 3]], ['돈', [4, 9, 11]], ['때', [5, 6]], ['마음', [7, 8, 10]]]);
/* 「왜 사?」 답하기 — 새 판(주문 1506 · 사장님 2026-11-04 10:06(+04) 「어」 — 물음 「「왜 사?」 답하는 쪽도 새 판 모양으로 바꿀까요?」)
   답 셋 · 한마디 = p-why.js QS 의 a 글자 그대로(차례도 그대로) · 왜 묻나 = why-look.js LOOK 의 why 그대로 · 판정 이름 = why-look.js TYPE_OF 그대로(시험이 맞댐)
   판정 셈 = p-why.js judge 와 같음 · 기록 = 같은 열쇠 · 같은 꼴(매매일지 · 예전 앱 기록 칸 · 한 달 약속이 그대로 이어짐) · 합계 칸 신호 = tally.js(stop · stop_rest) */
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
export const WHY_TYPE = Object.freeze({go: ['신중한 준비형 투자자', '내 이유로 따져 보고, 정해 둔 대로 움직이는 편이에요.'], wait: ['반쯤 준비된 투자자', '이유는 있지만, 가끔 마음이 앞설 때가 있어요.'], rest: ['오늘은 쉬어 갈 투자자', '준비가 덜 된 곳이 많아요. 오늘은 하루 쉬어 가요.', '빌린 돈이나 곧 쓸 돈이라면, 오늘은 쉬어 가는 게 좋아요.', '팔 곳을 아직 정하지 않았어요. 오늘은 하루 쉬어 가요.']});
const WHY_PT = {g: 0, y: 1, r: 2}, WHY_MAX = WHY_QS.length * 2, WHY_KEY = 'atlas:godori-why';
/* 쉬어 가는 답(점수와 상관없이 「오늘은 쉬어 가자」 — p-why.js REST_MONEY · REST_SELL 과 같음 · 시험이 맞댐) — 돈 둘(4번 「거의 다·빌린 돈」 · 9번 「곧」)
   · 팔 곳 하나(7번 「떨어지면?」에 「안 정함」 — 주문 1114-1306 ④ 「떨어지면? 안 정함은 바로 쉬어」) · 질문 차례는 그대로(기록 열쇠 · 답 자리가 이어짐) */
const WHY_MONEY = [[3, WHY_A[3].findIndex(a => a[1] === '거의 다·빌린 돈')], [8, WHY_A[8].findIndex(a => a[1] === '곧')]];
const WHY_SELL = [6, WHY_A[6].findIndex(a => a[1] === '안 정함')];
const WHY_REST = [...WHY_MONEY, WHY_SELL];
const WHY_SELL_SAY = '팔 곳을 정하기 전에는 사지 않아요.'; // 결과 쪽 안내 한 줄(7번에 「안 정함」일 때 — 큰 값 밑 「그래서」 줄 · p-why.js SELL_SAY 와 같은 글)
const WHY_BIG = [2, WHY_A[2].findIndex(a => a[1] === '클 일이 있다')];
/* 판정 이름 셋(주문 1114-1306 ④ — 「좋아, 정해 둔 대로만」은 사도 된다는 말로 읽혀 「준비됐어, 정해 둔 대로만」으로 · 「반만 준비됐어」 · 「오늘은 쉬어 가자」 그대로)
   마지막 옛 이름은 이미 남은 기록을 읽을 때만(기록 열쇠 · 꼴은 그대로 — 화면에는 shownV 로 새 이름) */
export const WHY_V = Object.freeze({'준비됐어, 정해 둔 대로만': 'go', '반만 준비됐어': 'wait', '오늘은 쉬어 가자': 'rest', '좋아, 정해 둔 대로만': 'go'});
/** 판정 문턱 풀이 — judgeWhy 셈 그대로(「이상」 · 쉬어 가는 답 셋 — 질문 차례대로) · 판정 짧은 이름은 쉬어 · 반만 · 준비됨(손실 먼저 차례) */
const JUDGE_HOW = '「얼마 넣어?」에 거의 다·빌린 돈, 「떨어지면?」에 안 정함, 「언제 쓸 돈?」에 곧이라고 답하면 점수와 상관없이 쉬어 · 답 점수가 12 이상이거나 빨간 답이 넷 이상이면 쉬어 · 6 이상이면 반만 · 그보다 낮으면 준비됨';
const VSHORT = {rest: '쉬어', wait: '반만', go: '준비됨'};
/** 판정 — 점수 · 빨간 답 수 · 묶음 · 판정 글(p-why.js judge 와 같은 셈) · money = 돈 답으로 쉬어 · sell = 팔 곳을 안 정함 */
export function judgeWhy(ans) {
  const pts = ans.map((k, i) => WHY_PT[WHY_A[i][k][0]]);
  const score = pts.reduce((s, x) => s + x, 0), reds = pts.filter(x => x === 2).length, stop = WHY_REST.some(([q, k]) => k >= 0 && ans[q] === k);
  const groups = Object.fromEntries(WHY_GROUPS.map(([n, qs]) => [n, qs.reduce((s, q) => s + pts[q - 1], 0)]));
  const verdict = stop || score >= 12 || reds >= 4 ? '오늘은 쉬어 가자' : score >= 6 ? '반만 준비됐어' : '준비됐어, 정해 둔 대로만';
  return {score, ready: WHY_MAX - score, reds, groups, verdict, stop, money: WHY_MONEY.some(([q, k]) => k >= 0 && ans[q] === k), sell: WHY_SELL[1] >= 0 && ans[WHY_SELL[0]] === WHY_SELL[1]};
}
/** 매매일지에 한 줄 더함(예전 앱 p-why.js save 와 같은 열쇠 · 같은 꼴 · 200줄까지) — 남겼나 */
function saveWhy(rec) {
  try {
    let all = []; try { const x = JSON.parse(localStorage.getItem(WHY_KEY) || '[]'); all = Array.isArray(x) ? x : []; } catch { all = []; }
    all.unshift(rec); localStorage.setItem(WHY_KEY, JSON.stringify(all.slice(0, 200))); return true;
  } catch { return false; }
}

/* ── 매매일지 셈(예전 앱 p-why.js 와 같은 열쇠 · 같은 꼴 · 같은 셈 — 장 스무 번 = /atlas/data/days.json · 달력 서른 날) ── */
export const readWhy = () => { try { const x = JSON.parse(localStorage.getItem(WHY_KEY) || '[]'); return Array.isArray(x) ? x : []; } catch { return null; } }; // null = 기억 못 하는 기계
export const fullWhy = r => !!r && typeof r === 'object' && Array.isArray(r.answers) && r.answers.length === WHY_QS.length && r.answers.every((k, i) => Number.isInteger(k) && k >= 0 && k < WHY_A[i].length);
const readyOfRec = r => (Number.isFinite(r?.score) ? WHY_MAX - r.score : null);
export const seoulDay = ms => new Date(ms + 9 * 36e5).toISOString().slice(0, 10);
const dayOf = r => { const x = Date.parse(r?.at); return Number.isFinite(x) ? seoulDay(x) : null; };
const won = n => Math.floor(n).toLocaleString('ko-KR') + '원';
const toneOf = v => (v === 'go' ? 'g' : v === 'rest' ? 'r' : 'y');
const VNAME = {go: '준비됐어, 정해 둔 대로만', wait: '반만 준비됐어', rest: '오늘은 쉬어 가자'};
/** 기록의 판정 글을 화면에 — 옛 이름(「좋아, 정해 둔 대로만」)도 새 이름으로 보임(기록은 바꾸지 않음) · 모르는 글은 그대로 · 없으면 null */
const shownV = v => VNAME[WHY_V[v]] ?? (v == null ? null : String(v));
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

/* ── 새로 쓴 화면 — 7 「왜 사?」(결) · 8 내 매매일지(결 · 끝) ──
   질문 쪽: 큰 값 = 몇 번째 질문 · 큰 그림 = 꽃잎 열하나(답한 잎은 답 색 · 지금 잎은 굵은 테 · 시안 11) · 답 셋(● ▲ ■ 모양과 글) · 한마디 · 다음 질문
   결과 쪽: 큰 값 = 준비 점수 · 큰 그림 = 내 답 꽃잎 열하나 + 오늘에서 한 달 뒤로 가는 활(「그날 정한 대로 했어?」를 물을 날 · 시안 11) · 네 묶음 막대
   매매일지: 큰 값 = 멈춘 횟수 · 큰 그림 = 기록 시간 줄(한 달 뒤 동그라미) · 판정 기둥 셋 · 네 묶음 평균 · 한 달 전 약속 · 쌓인 기록 */
const SHAPE = {g: '●', y: '▲', r: '■'}, TONE_W = {g: '좋아요', y: '한 번 더 생각', r: '멈춰요'};
const PETAL = 'M0 0 C 10 -14, 10 -40, 0 -58 C -10 -40, -10 -14, 0 0 Z';
/** 꽃잎 열하나 — tones[k] = 'g' | 'y' | 'r' | null · cur = 지금 질문 */
function petals(tones, {cur = null, label = '열한 질문 꽃잎', hero = false, cap = null, arc = null, title = null} = {}) {
  const W = 390, H = arc ? 540 : 460, cx = W / 2, cy = 228, n = WHY_QS.length, RN = 152; // 번호는 꽃잎 밖(크기를 바꾸지 않은 칸 · 글 21)
  const R = 2.2; // 꽃잎 크기(그림이 주인)
  const leaves = tones.map((t, k) => s('g', {transform: `translate(${cx} ${cy}) rotate(${k * 360 / n}) scale(${R})`}, // 움직임은 안쪽 칸에만(밖 칸의 자리 · 돌림을 css 가 덮지 않게)
    s('g', {class: (t ? (t === 'g' ? 'b2' : 'b3') : 'b1') + ' a-pop'}, s('path', {d: PETAL, class: t ? 'g-pt-' + t : k === cur ? 'g-pt-cur' : 'g-pt-0'}))));
  const nums = tones.map((t, k) => { const a = k * 2 * Math.PI / n; return s('text', {x: (cx + RN * Math.sin(a)).toFixed(1), y: (cy - RN * Math.cos(a) + 8).toFixed(1), class: 'g-tx b1 a-fade' + (k === cur ? ' g-on' : ''), 'text-anchor': 'middle', text: String(k + 1)}); });
  const core = s('g', {class: 'b4 a-pop'}, s('circle', {cx, cy, r: 40, class: 'g-pc2'}), s('text', {x: cx, y: cy + 9, class: 'g-tk', 'text-anchor': 'middle', text: tones.filter(Boolean).length + '/' + n}));
  const bow = arc ? s('g', {class: 'b4 a-up'},
    s('path', {d: `M 40 ${H - 40} Q ${cx} ${H - 110} ${W - 40} ${H - 40}`, class: 'g-arc', pathLength: 1}),
    s('circle', {cx: 40, cy: H - 40, r: 9, class: 'g-ok'}), s('circle', {cx: W - 40, cy: H - 40, r: 9, class: 'g-cur'}),
    s('text', {x: 40, y: H - 10, class: 'g-tx', 'text-anchor': 'start', text: '오늘'}), s('text', {x: W - 40, y: H - 10, class: 'g-tx', 'text-anchor': 'end', text: arc})) : null;
  return fig('petals', label, s('svg', {class: 'su-svg', viewBox: `0 0 ${W} ${H}`, role: 'img', 'aria-label': label}, leaves, nums, core, bow), {hero, cap, title});
}
/** 네 묶음 막대 — 준비된 만큼(높을수록 좋음) */
const groupBars = (rows, title) => bars(rows.map(r => ({name: r.n, v: r.ready, v2: null, key: r.n, cls: 'g-tone-' + r.tone, t: r.ready + ' / ' + r.max})), {label: '네 묶음 · 준비된 만큼', title, max: Math.max(...rows.map(r => r.max))});
const groupRowsOf = groups => WHY_GROUPS.map(([n, qs]) => { const max = qs.length * 2, v = groups?.[n]; const val = Number.isFinite(v) ? v : null; return {n, max, ready: val == null ? null : Math.round((max - val) * 10) / 10, tone: val == null ? 'y' : val === 0 ? 'g' : val * 2 >= max ? 'r' : 'y'}; });

/** 7 「왜 사?」 — 질문 하나씩 · 다 답하면 결과(같은 쪽에서 다시 그림) */
export async function vQuiz(code0, X) {
  const {asOf, S} = await X.base();
  const code = code0 && CODE.test(code0) ? code0 : null;
  const co = code ? await get(D.co(code)) : null, c = co?.c ?? null, name = typeof c?.name === 'string' ? c.name : null;
  if (code && name) X.setCur({code, name, ind: typeof c.i === 'string' ? c.i : null});
  const Q = {i: 0, ans: new Array(WHY_QS.length).fill(null), J: null, saved: false};
  const ART = await X.artMod?.('su-stop-jobs', 'quiz'); // 무하 「달과 별」 — 모래시계를 든 여인 · 열한 질문 별자리(주문 1023) · 누를 때마다 다시 그리므로 한 번만 받음
  const pic = (cur, done, old) => X.heroOf(X.artFig?.(ART, {cur, done}) ?? null, old);
  const tonesNow = () => Q.ans.map((k, i) => (k == null ? null : WHY_A[i][k][0]));
  const btn = (cls, kids, on) => { const b = h('button', {class: cls, type: 'button'}, kids); b.addEventListener('click', on); return b; };
  const redraw = (keep = false) => {
    const root = document.getElementById('su'), y = window.scrollY;
    root.replaceChildren(...X.page(model()).filter(Boolean));
    X.afterPaint?.(root);
    if (keep) { window.scrollTo(0, y); root.querySelector('.su-qnext')?.scrollIntoView?.({block: 'nearest'}); } else window.scrollTo(0, 0);
  };
  const finish = () => {
    const J = judgeWhy(Q.ans), v = WHY_V[J.verdict], ok = Number.isFinite(c?.price) && c.price > 0;
    Q.J = J;
    Q.saved = saveWhy({at: new Date().toISOString(), asOf: asOf ?? null, code, name, price: ok ? c.price : null, day: ok && typeof c.priceDate === 'string' ? c.priceDate : null,
      answers: [...Q.ans], score: J.score, reds: J.reds, verdict: J.verdict, groups: J.groups, bigDay: Q.ans[WHY_BIG[0]] === WHY_BIG[1] ? '' : null, why: null, promise: null, picks: []});
    tally(v === 'rest' ? 'stop_rest' : 'stop'); // 합계 칸 ① 멈춤 — 지금 수르 「왜 사?」 끝냄과 같은 신호
    Q.i = 'res'; redraw();
  };
  const ask = () => {
    const i = Q.i, a = Q.ans[i], gi = WHY_GROUPS.findIndex(([, qs]) => qs.includes(i + 1)), last = i === WHY_QS.length - 1, ch = a != null ? WHY_A[i][a] : null;
    const nDone = Q.ans.filter(x => x != null).length;
    const big = val((i + 1) + ' / ' + WHY_QS.length, '', '질문 · ' + WHY_GROUPS[gi][0] + ' 묶음', {누가: '내가 고른 답', 언제: '오늘', 어디서: '이 휴대폰', 무엇을: (name ? name + ' · ' : '') + WHY_QS[i], 어떻게: '답 셋 가운데 하나를 골라요', 왜: WHY_WHY[i]},
      {mean: '지금 ' + (i + 1) + '번째 질문이에요. ' + (nDone ? '답한 질문은 ' + nDone + '개예요.' : '답은 아직 0개예요.')});
    return {title: '왜 사?', tab: 3, step: 6, kick: '사기 전에' + (name ? ' · ' + name : '') + ' · ' + WHY_GROUPS[gi][0] + ' 묶음', h1: WHY_QS[i], big,
      pro: [{k: '질문 수', v: WHY_QS.length + '개', how: '네 묶음 · ' + WHY_GROUPS.map(([n, q]) => n + ' ' + q.length).join(' · ')}, {k: '지금 질문', v: (i + 1) + ' / ' + WHY_QS.length, how: WHY_GROUPS[gi][0] + ' 묶음'},
        {k: '답 셋의 점수', v: '● 0 · ▲ 1 · ■ 2', how: '■ 은 빨간 답 · 답 점수는 답마다 이 점수를 더한 값이라 낮을수록 준비됨 · 준비 점수는 ' + WHY_MAX + '에서 답 점수를 뺀 값이라 높을수록 준비됨'},
        {k: '판정 문턱', v: '쉬어 · 반만 · 준비됨', how: JUDGE_HOW},
        {k: '답한 질문', v: Q.ans.filter(x => x != null).length + ' / ' + WHY_QS.length, how: '이 휴대폰에서 지금 답한 수'}],
      ...pic(i + 1, Q.ans.filter(x => x != null).length, petals(tonesNow(), {cur: i, label: '열한 질문 꽃잎', hero: true, cap: ['사기 전에 열한 가지를 물어요.', (i + 1) + '번째 질문이에요. 답한 잎에 색이 들어요.', '그런데 맞히는 시험이 아니에요.', '그래서 내 마음 그대로 답해요.']})),
      act: [h('ul', {class: 'su-ans', 'aria-label': '답 셋'}, WHY_A[i].map(([tone, label], k) => h('li', {}, // 누르는 곳은 그림 바로 아래(신문 짜임에서도 기능은 그대로 — 주문 1023 [2] 3)
          btn('su-a' + (a === k ? ' on' : ''), [h('i', {class: 'su-shape ' + tone, 'aria-hidden': 'true', text: SHAPE[tone]}), h('span', {text: label})], () => { Q.ans[i] = k; redraw(true); })))),
        ch ? btn('su-big-btn su-qnext', [h('span', {class: 'su-nk', text: last ? '끝 · 결과' : (i + 2) + ' / ' + WHY_QS.length}), h('b', {text: last ? '결과 보기' : '다음 질문'}), h('i', {'aria-hidden': 'true', text: '›'})], () => { if (last) finish(); else { Q.i = i + 1; redraw(); } }) : null,
        i > 0 ? btn('su-qback', [h('i', {'aria-hidden': 'true', text: '‹'}), h('span', {text: '앞 질문'})], () => { Q.i = i - 1; redraw(); }) : null],
      body: [h('p', {class: 'su-qwhy', text: WHY_WHY[i]}),
        ch ? h('div', {class: 'su-reply ' + ch[0], role: 'status'}, h('p', {class: 'su-rk'}, h('i', {'aria-hidden': 'true', text: SHAPE[ch[0]]}), h('b', {text: TONE_W[ch[0]]})), h('p', {class: 'su-rt2', text: ch[2]})) : h('p', {class: 'su-note', text: '답 하나를 눌러요.'})],
      next: {href: '#/j', label: '내 기록은 몇 번?', step: 7}, asOf, S, note: '답은 이 휴대폰에만 남아요.'};
  };
  const result = () => {
    const J = Q.J, v = WHY_V[J.verdict], T = WHY_TYPE[v], rows = groupRowsOf(J.groups);
    const weak = rows.filter(r => r.ready < r.max).sort((a, b) => a.ready / a.max - b.ready / b.max)[0] ?? null;
    const e = eQuizResult({score: J.ready, max: WHY_MAX, verdict: J.verdict, reds: J.reds, type: T[0], day: seoulDay(Date.now()), name});
    const big = J.sell ? Object.freeze({...e.big, mean: WHY_SELL_SAY}) : e.big; // 7번 「안 정함」 — 큰 값 밑 「그래서」 줄(그림 밖에 보이는 설명 두 줄)이 안내 한 줄(주문 1114-1306 ④)
    return {title: '왜 사? 결과', tab: 3, step: 6, kick: '사기 전에' + (name ? ' · ' + name : '') + ' · 결과', h1: J.verdict, big,
      ...pic(WHY_QS.length, WHY_QS.length, petals(tonesNow(), {label: '내 답 꽃잎 열하나와 한 달 뒤', hero: true, arc: '한 달 뒤 · 장 스무 번',
        cap: ['질문 열한 개에 모두 답했어요.', '준비는 ' + WHY_MAX + '점 가운데 ' + J.ready + '점이에요.',
          J.money && J.sell ? '그런데 빌린 돈이나 곧 쓸 돈이고, 팔 곳도 안 정했어요.' : J.money ? '그런데 내 돈 거의 다나 빌린 돈, 곧 쓸 돈이라고 답했어요.' : J.sell ? '그런데 떨어질 때 팔 곳을 안 정했다고 답했어요.'
            : weak ? '그런데 ' + weak.n + ' 묶음이 가장 덜 준비됐어요.' : '그런데 답은 오늘 마음일 뿐이에요.',
          v === 'go' ? '그래서 정해 둔 대로만 해요.' : v === 'wait' ? '그래서 덜 된 묶음부터 채워요.' : '그래서 오늘은 하루 쉬어 가요.']})),
      mids: e.mids,
      figs: [groupBars(rows, '네 묶음 · 준비된 만큼')],
      pro: [{k: '준비 점수', v: J.ready + ' / ' + WHY_MAX, how: '답마다 ● 0 · ▲ 1 · ■ 2 를 더한 값을 ' + WHY_MAX + '에서 뺌'}, {k: '빨간 답', v: J.reds + '개', how: '■ 멈춰요 쪽 답'},
        ...WHY_GROUPS.map(([g, qs]) => ({k: g + ' 묶음 점수', v: (J.groups[g] ?? 0) + ' / ' + qs.length * 2, how: '질문 ' + qs.join(' · ') + '번 · 낮을수록 준비됨'})),
        {k: '판정 문턱', v: '쉬어 · 반만 · 준비됨', how: JUDGE_HOW}],
      body: [h('p', {class: 'su-quote', text: '“' + (v === 'rest' && J.money ? T[2] : v === 'rest' && J.sell ? T[3] : T[1]) + '”'}), // 쉬어 가는 까닭 — 돈 답 · 팔 곳 안 정함 · 그 밖(점수 · 빨간 답)
        h('p', {class: 'su-note', text: '이 판정은 사도 된다는 뜻이 아니에요. 내 마음이 준비됐는지만 봐요.'}),
        h('section', {class: 'su-why', 'aria-label': '내 답'}, h('h2', {class: 'su-ft', text: '내 답 열한 개'}), h('ol', {class: 'su-myans'}, WHY_QS.map((q, k) => { const [tone, label] = WHY_A[k][Q.ans[k]];
          return h('li', {}, h('span', {class: 'su-mq', text: (k + 1) + ' · ' + q}), h('b', {class: 'su-ma ' + tone}, h('i', {'aria-hidden': 'true', text: SHAPE[tone]}), h('span', {text: label}))); }))),
        h('p', {class: 'su-note', text: Q.saved ? '오늘 답을 매매일지에 날짜와 함께 쌓았어요. 한 달 뒤에 「그날 정한 대로 했어?」를 물어요.' : '이 기기는 기록을 남길 수 없어요. 답은 이 화면에만 있어요.'}),
        h('a', {class: 'su-ask', href: '#/j'}, h('b', {text: '내 매매일지 보기'}), h('span', {text: '쌓인 답과 한 달 뒤 약속이 한곳에 있어요.'})),
        btn('su-qback su-again', [h('i', {'aria-hidden': 'true', text: '↺'}), h('span', {text: '다시 하기'})], () => { Q.i = 0; Q.ans.fill(null); Q.J = null; redraw(); })],
      act: [h('a', {class: 'su-ask su-ask1', href: '#/j'}, h('b', {text: '내 매매일지 보기'}))], // 누르는 곳 하나는 그림 바로 아래
      next: {href: '#/j', label: '내 기록은 몇 번?', step: 7}, asOf, S, note: '답과 기록은 이 휴대폰에만 남아요.'};
  };
  const model = () => (Q.i === 'res' ? result() : ask());
  return model();
}

/** 기록 시간 줄 — 기록마다 점(판정 색) · 한 달 뒤 동그라미(지났으면 채움) */
function timeline(metas, {label = '내 기록 시간 줄', hero = false, cap = null} = {}) {
  const W = 390, H = 440, L = 24, R = 24, ts = metas.map(m => Date.parse(m.r.at)).filter(Number.isFinite), now = Date.now();
  const t0 = ts.length ? Math.min(...ts) : now - 30 * 864e5, t1 = Math.max(now, ...ts.map(t => t + 30 * 864e5));
  const x = t => L + (W - L - R) * ((t - t0) / Math.max(1, t1 - t0));
  const g = metas.slice(0, 40).map((m, i) => { const t = Date.parse(m.r.at); if (!Number.isFinite(t)) return null; const y = 70 + (i % 5) * 34, tone = toneOf(WHY_V[m.r.verdict]);
    return s('g', {}, s('line', {x1: x(t), y1: y, x2: x(t + 30 * 864e5), y2: y, class: 'g-grid b2 a-fade'}), s('circle', {cx: x(t), cy: y, r: 10, class: 'g-pt-' + tone + ' b2 a-pop'}),
      s('circle', {cx: x(t + 30 * 864e5), cy: y, r: 10, class: (m.due ? 'g-cur' : 'g-empty') + ' b3 a-pop'})); });
  return fig('timeline', label, s('svg', {class: 'su-svg', viewBox: `0 0 ${W} ${H}`, role: 'img', 'aria-label': label},
    s('text', {x: L, y: 36, class: 'g-tx b1 a-fade', text: '● 답한 날 · ○ 한 달 뒤 묻는 날'}),
    s('line', {x1: L, y1: 390, x2: W - R, y2: 390, class: 'g-axis b1 a-fade'}), s('line', {x1: x(now), y1: 56, x2: x(now), y2: 396, class: 'g-baseline b4 a-fade'}),
    s('text', {x: Math.min(W - R, Math.max(L, x(now))), y: 424, class: 'g-tx b4 a-fade', 'text-anchor': 'middle', text: '오늘'}), g,
    metas.length ? null : s('g', {class: 'b2 a-fade'}, s('text', {x: W / 2, y: 200, class: 'g-t', 'text-anchor': 'middle', text: '아직 기록이 없어요'}), s('text', {x: W / 2, y: 236, class: 'g-tx', 'text-anchor': 'middle', text: '「왜 사?」에 답하면 여기 점이 생겨요'}))), {hero, cap});
}
function dueBox(dues, X) {
  const r = dues[0], b1 = h('button', {class: 'su-kb', type: 'button', text: '했어'}), b2 = h('button', {class: 'su-kb', type: 'button', text: '안 했어'});
  const ask = yes => () => { if (b1.disabled) return; b1.disabled = b2.disabled = true; keepWhy(r, yes); tally(yes ? 'promise_yes' : 'promise'); window.dispatchEvent(new HashChangeEvent('hashchange')); };
  b1.addEventListener('click', ask(true)); b2.addEventListener('click', ask(false));
  const rd = readyOfRec(r);
  return h('section', {class: 'su-why su-due', 'aria-label': '한 달 전 약속'}, h('h2', {class: 'su-ft', text: '한 달 전 약속'}),
    h('p', {class: 'su-lead'}, h('b', {text: dateKo(dayOf(r))}), r.name || r.code ? h('span', {text: ' · '}) : null, r.name || r.code ? h('span', {'data-proper': '', text: String(r.name || r.code)}) : null,
      h('span', {text: ' · 준비 ' + (rd ?? '?') + ' / ' + WHY_MAX + ' · ' + (shownV(r.verdict) ?? '?')})),
    h('p', {class: 'su-kq', text: '그날 정한 대로 했어?'}), h('div', {class: 'su-kbs', role: 'group', 'aria-label': '그날 정한 대로 했어?'}, b1, b2),
    dues.length > 1 ? h('p', {class: 'su-note', text: '한 달 지난 약속이 ' + (dues.length - 1) + '개 더 있어요.'}) : null);
}
/** 한 달 뒤 값 — 「100원이 ○원」(주문 1114-1306 ① · su-data.js won100 한 곳 · 쪽마다 같은 말) · 줄었으면 dn · 못 찾으면 「확인 필요」 */
const wonSpan = x => h('b', {class: 'su-lv' + (x != null && x < 0 ? ' dn' : ''), text: x == null ? NEED : won100(x)});
function recCard(r, W, L) {
  const rd = readyOfRec(r), tone = toneOf(WHY_V[r.verdict]);
  return h('li', {class: 'su-jr'},
    h('p', {class: 'su-jrh'}, h('b', {text: dateKo(dayOf(r))}), h('span', {class: 'su-ma ' + tone}, h('i', {'aria-hidden': 'true', text: SHAPE[tone]}), h('span', {text: shownV(r.verdict) ?? '?'}))),
    h('p', {class: 'su-jrs'}, h('span', {text: '준비 ' + (rd ?? '?') + ' / ' + WHY_MAX}), r.code || r.name ? h('span', {text: ' · '}) : null, r.code || r.name ? h('span', {'data-proper': '', text: String(r.name || r.code)}) : null,
      r.code || r.name ? h('span', {text: r.price > 0 ? ' · 그날 값 ' + won(r.price) : ' · 그날 값 ' + NEED}) : null),
    r.kept ? h('p', {class: 'su-jrk ' + (r.kept.a === 'yes' ? 'g' : 'r')}, h('i', {'aria-hidden': 'true', text: r.kept.a === 'yes' ? SHAPE.g : SHAPE.r}), h('span', {text: r.kept.a === 'yes' ? '한 달 뒤 — 정한 대로 했어요.' : '한 달 뒤 — 정한 대로 못 했어요.'})) : null,
    r.kept && L ? h('p', {class: 'su-jrv'}, h('span', {text: dateKo(L.s) + ' → ' + dateKo(L.e) + ' · '}), r.code || r.name ? h('span', {text: '이 회사 '}) : null, r.code || r.name ? wonSpan(L.co) : null,
      h('span', {text: ' · 코스피 '}), wonSpan(L.kospi), h('span', {text: ' · 모든 회사 가운데 값 '}), wonSpan(L.med)) : null,
    !r.kept && !W?.e ? h('p', {class: 'su-note', text: '한 달이 지나면 그날 정한 대로 했는지 먼저 물어요.'}) : null);
}
/** 8 내 매매일지(결 · 끝) */
export async function vJournal(X) {
  const {S, asOf} = await X.base();
  const raw = readWhy(), can = raw != null, full = (raw ?? []).filter(fullWhy);
  const metas = await Promise.all(full.map(async r => ({r, ...(await dueOfRec(r))})));
  const dues = metas.filter(m => m.due && !(m.r.kept?.a === 'yes' || m.r.kept?.a === 'no')).map(m => m.r).sort((a, b) => (Date.parse(a.at) || 0) - (Date.parse(b.at) || 0));
  const shown = metas.slice(0, 30), laters = await Promise.all(shown.map(m => (m.r.kept && m.W?.e ? laterOf(m.r, m.W).catch(() => null) : null)));
  const vc = {go: 0, wait: 0, rest: 0}; full.forEach(r => { const v = WHY_V[r.verdict]; if (v) vc[v]++; });
  const kept = full.filter(r => r.kept?.a === 'yes').length, asked = full.filter(r => r.kept?.a === 'yes' || r.kept?.a === 'no').length;
  const avg = {}; for (const [n] of WHY_GROUPS) { const v = full.map(r => r.groups?.[n]).filter(Number.isFinite); avg[n] = v.length ? v.reduce((a, b) => a + b, 0) / v.length : null; }
  const e = eJournal({recs: full, due: dues.length, kept, asked, lastDay: full[0] ? dayOf(full[0]) : null});
  return {title: '매매일지', tab: 3, step: 7, kick: '내 기록 · 이 휴대폰에만', h1: '내 매매일지', big: e.big,
    ...X.artHero('su-stop-jobs', 'journal', timeline(metas, {label: '내 기록 시간 줄 · 한 달 뒤 동그라미', hero: true, cap: e.say})),
    mids: e.mids,
    figs: full.length ? [tally3([{name: VSHORT.rest, v: vc.rest, cls: 'g-pt-r'}, {name: VSHORT.wait, v: vc.wait, cls: 'g-pt-y'}, {name: VSHORT.go, v: vc.go, cls: 'g-pt-g'}], {label: '판정 셋', title: '판정 · 쉬어 · 반만 · 준비됨'}),
      groupBars(groupRowsOf(avg), '네 묶음 평균 · 준비된 만큼')] : [petals(new Array(WHY_QS.length).fill(null), {label: '열한 질문 꽃잎', title: '열한 질문 · 아직 빈 꽃잎'})], // 기록이 없으면 0 칸 기둥 대신 빈 꽃잎 하나(판정 칸은 첫 기록 뒤에)
    act: dues.length ? [dueBox(dues, X)] : null, // 한 달 전 약속 — 답할 것이 있을 때만 그림 바로 아래(누르는 곳 · 주문 1023 [2] 3)
    body: [
      full.length ? h('section', {class: 'su-why', 'aria-label': '쌓인 기록'}, h('h2', {class: 'su-ft', text: '쌓인 기록 ' + full.length + '번'}),
        h('p', {class: 'su-note', text: '틀린 것도 지우지 않아요. 한 달이 지나면 그날 정한 대로 했는지 먼저 묻고, 그 뒤 값을 같은 때 코스피와 모든 회사 가운데 값과 함께 붙여요.'}),
        h('ol', {class: 'su-jl'}, shown.map((m, i) => recCard(m.r, m.W, laters[i]))),
        h('p', {class: 'su-note', text: '한 달 뒤 값은 맞고 틀림을 가르는 표가 아니에요. 그날 정한 대로 했는지만 봐요.'}),
        full.length > 30 ? h('p', {class: 'su-note', text: '새 기록 서른 줄만 보여요. 나머지 ' + (full.length - 30) + '줄도 지우지 않고 그대로 있어요.'}) : null) : null,
      full.length ? h('a', {class: 'su-ask', href: '#/r'}, h('b', {text: '꽃 지난 기록과 함께 보기'}), h('span', {text: '한 달 뒤 값을 기록 탭의 꽃 · 시장 기록과 견줘 봐요.'})) : null,
      can ? null : h('p', {class: 'su-note', text: '이 기기는 기록을 남길 수 없어요.'})],
    pro: [{k: '쌓인 기록', v: full.length + '번', how: '이 휴대폰에만 · 틀린 것도 지우지 않음 · 최근 200줄까지 남고 저장 공간을 비우면 사라짐'}, {k: '판정 · 쉬어 · 반만 · 준비됨', v: vc.rest + ' · ' + vc.wait + ' · ' + vc.go, how: '「왜 사?」 결과 판정을 센 값 · 쉬어 간 날은 싸우지 않고 지킨 날이에요'},
      {k: '한 달 뒤 물은 기록 · 못 한 기록 · 한 기록', v: asked + ' · ' + (asked - kept) + ' · ' + kept, how: '한 달 = 장이 열린 날 스무 번(달력으로 서른 날이 먼저 지나면 그날) · 한 달이 지난 기록에만 물어요 · 지금 물을 기록 ' + dues.length + '번'},
      ...WHY_GROUPS.map(([n]) => ({k: n + ' 묶음 평균', v: Number.isFinite(avg[n]) ? String(Math.round(avg[n] * 10) / 10) : NEED, how: '기록마다 묶음 점수의 평균 · 준비된 만큼'})),
      ...full.slice(0, 30).map(r => ({k: (dayOf(r) ?? NEED) + (r.name ? ' · ' + r.name : ''), v: (readyOfRec(r) ?? NEED) + ' / ' + WHY_MAX + ' · ' + (shownV(r.verdict) ?? NEED), how: '그날 값 ' + (r.price > 0 ? won(r.price) : NEED) + ' · 빨간 답 ' + (Number.isFinite(r.reds) ? r.reds : NEED) + ' · 한 달 뒤 ' + (r.kept ? (r.kept.a === 'yes' ? '정한 대로 함' : '못 함') : '아직')}))],
    next: {href: '#/f', label: '친구에게 건네기', step: 8}, asOf, S, note: '기록은 이 휴대폰에만 있어요. 이름도 열쇠도 받지 않아요. 친구에게 건넬 때도 내 기록은 보내지 않아요.'};
}
