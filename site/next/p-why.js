/* 고도리 — 매매일지 「친구야, 왜 사?」(사장님 2026-10-17(싱가포르) 21:10 「하나로 묶은 명령문」 [3] 1 · 3 ~ 7 · 9 · [6] 1 열쇠 · 앞 판 17:54 「한 장 명령문」 명령 2 ~ 6 · 13)
   흐름(1분 안 · 큰 단추 · 누름 적게): ① 종목 고르기(찾기와 같은 잣대 NX.findReady → NX.findMatch · 회사 주식만 고름 · 펀드 · 우선주 …는 까닭 한 줄 · 엔터 = 맨 위 회사) → 그날 값(co/<번호>.json c.price · c.priceDate)
     ② 질문 열한 개(한 화면에 하나 · 답마다 고도리 한마디 한 줄 · 3번 「클 일이 있다」면 그 일이 있는 날짜)
     ③ 두 줄(① 1년 뒤 반토막 났다면 왜? ② 팔 약속 「만약 ~이면 ~한다」 — 팔 선 = 그날 값 × 0.9 · 절반 팔 선 = × 1.2 · 원 아래 버림 · gdr.json 과 같은 셈 · 고쳐도 됨)
     ④ 결과(점수 0 ~ 22 · 🔴 수 · 네 묶음 막대 · 판정) → 기록(atlas:godori-why · 이 기기에만 · 옛 기록도 그대로 읽음)
   내보냄: whyCard(G, {page, code, onDone}) · render(arg) = #/why · #/why/<번호> · records() · meRecords() · doneOnce() · QS · GROUPS · judge · sellOf · halfOf
   기록 한 줄: {at, asOf, code, name, price, day, answers, score, reds, verdict, groups, bigDay, why, promise: {sell, half, text}, picks} · 지우는 단추 없음(규칙 77 · 명령 13 「틀린 것도 지우지 마라」)
   질문 · 답 · 격언은 사장님 글 그대로(격언 = data-proper) · 회사 이름 · 내가 쓴 글도 남의 글(data-proper) · 이름은 brand.js 한 곳(규칙 76) · 글은 textContent 로만(보안 규칙)
   2026-10-18 「72개와 카톡 두 번 가입」 [5] 1 ~ 9 · [9] 8 · [2] 7(일꾼 S1 → S1c · 잣대 docs/design/godori-2026-10-18/accept/S1c.md · 검사 check_why.mjs --quick):
     ① 고르기 전에는 답 색을 숨김(빈 테두리) — 고른 뒤에만 색 · 한마디 ② 결과 = 판정 글이 가장 큼 · 「준비 n / 22」는 그 밑에 작게
     ③ 답 한 번 = 다음 질문(「다음」 단추 없음 · 앞 답 한마디 + 격언은 다음 장 맨 위(머리 바로 밑) · 3번 「클 일이 있다」만 날짜 칸 + 다음 · keepQ = 답 셋이 위 막대와 아래 단추 줄 사이에 오게) ④ 뒤로 = 「‹ 앞 질문」
     ⑤ 준비 = 22 − 옛 점수(기록은 옛 꼴 그대로 · 보일 때 바꿈) · 막대는 준비된 만큼 참 ⑥ 4번 「거의 다·빌린 돈」 · 9번 「곧」 = 점수와 상관없이 「오늘은 쉬어 가자」
     ⑦ todayResult() = 오늘(서울 날짜) 가장 새 기록 {at, code, verdict: go · wait · rest, ready, of: 22} 또는 null(일꾼 S9 고도리 칸)
     ⑧ 한 달(장 스무 번) 지난 기록 = 「그날 정한 대로 했어?」 먼저 · 답은 그 기록에 kept {a: yes · no, at} 로 남김(지우지 않음) · 값은 답한 뒤
     ⑨ 값 = 시작 날 종가 → 스무 번째 장 날 종가(날짜 박음 · co/<번호>.json close + k0 를 days.json 날짜 줄에 맞춤) · 같은 때 코스피(home.json) · 모든 회사 가운데 값(/next/data/median20.json) · 없으면 「?」
     [9] 8 색 점마다 읽어 주는 글(좋음 · 주의 · 위험) · [2] 7 결과가 처음 보인 뒤 NX.kakao.offer('journal') 한 번(offerOnce — 이 화면을 연 동안 한 번 · NX.kakao 가 없거나 꺼져 있으면 부르지 않음)
     [10] 글씨 = --fs-1 ~ --fs-5 · 간격 = --sp-1 ~ --sp-3(p-why.css)
   ★ 2026-10-28 그림 그대로 판(사장님 09:46 「360가지 분석해 먼저」 · 10:11 「어 그렇게 해」 — docs/design/why-mock-2026-10-28/brief.md): 위 흐름 가운데 ① 종목 고르기 · ③ 두 줄 · 앞 답 한마디 칸 · 「답 한 번 = 다음」 · 판정 물음 꼴은 풂
     지금 흐름 = 시작(그림 1) → 질문 열한 개(답을 고르고 「다음으로 ›」 · 11번 「‹ 이전」 + 「결과 보기 ›」 · 그림 2 · 3) → 결과(「당신은 / ○○ 투자자예요」 · 성향 넷 · 심리 상태 · 더 보기 · 그림 4 · 7) → 상세 분석(탭 넷 · 그림 5 · 6)
     #/why/<번호> 의 종목은 화면에 안 보이고 기록에만 남음(한 달 뒤 값) · 셈(judge) · 기록 꼴 · 한 달 뒤 · 카톡 권유 · 합계 신호는 그대로 */
import {NAME, josa} from './brand.js';
import {tally} from './tally.js'; // 합계 칸 신호 셋(일꾼 KD · 2026-10-18 16:39 [10] 1) — 끝냄(stop · stop_rest) · 한 달 답(promise · promise_yes) · 보내고 기다리지 않음
import {shareButtons} from './share-btn.js';
import {LOOK, ACT_MORE, MOODS, TYPE_OF, MIND_OF, lookIcon, faceIcon, sceneNodes} from './why-look.js'; // 그림 판(사장님 2026-10-27 22:09 · 22:16 「이시안 화법으로만들어줘」) — 풀이 글 · 그림만(질문 · 답 · 격언은 QS 그대로) // 카톡 단추 한 곳(KB1) — 기록 줄의 종목(일꾼 KB2)
const NX = globalThis.NX;
const {h} = NX;
const PT = {g: 0, y: 1, r: 2};
/** 질문 열한 개 — 답은 사장님 글의 차례 그대로 · one = 그 답에 고도리 한마디 */
export const QS = [
  {q: '왜 사?', a: [['r', '친구 말', '친구 말만 듣고 사면, 팔 때도 친구 말을 기다리게 돼.'], ['y', '뉴스', '뉴스는 모두가 같이 봐. 내 이유를 하나 더 찾아봐.'], ['g', '내가 따져 봄', '좋아! 내 이유가 있으면 흔들릴 때 버틸 수 있어.']], say: '남의 말로 산 주식은 남의 말에 판다'},
  {q: '공부했어?', a: [['g', '했다', '좋아, 아는 만큼 덜 무서워.'], ['y', '조금', '조금 더 알아보자. 무엇을 파는 회사인지부터.'], ['r', '안 했다', '모르는 회사는 떨어질 때 더 무서워.']], say: '모르는 주식은 사지 마라'},
  {q: '뭐가 좋아?', a: [['g', '돈을 잘 번다', '돈을 잘 버는 회사는 오래 볼 힘이 있어.'], ['y', '클 일이 있다', '클 일이 정말 일어날지 날짜를 적어 두자.'], ['r', '그냥 오를 것 같다', '느낌은 이유가 아니야. 한 번 더 생각해 보자.']], say: '느낌은 이유가 아니다'},
  {q: '얼마 넣어?', a: [['g', '내 돈 열에 하나 이하', '좋아, 틀려도 다시 일어설 수 있어.'], ['y', '반쯤', '반은 많아. 조금 줄이면 마음이 편해.'], ['r', '거의 다·빌린 돈', '빌린 돈은 밤잠을 뺏어. 오늘은 줄이자.']], say: '빚으로 산 주식은 잠을 뺏는다'},
  {q: '흐름은?', a: [['g', '조용히 조금씩 오름', '조용히 오를 때가 마음 편히 볼 때야.'], ['y', '떨어지는 중', '떨어지는 칼은 잡지 말자. 멈추는지 보자.'], ['r', '다들 떠들며 급등', '다들 떠들 때는 이미 늦었을 수 있어.']], say: '소문에 팔고 조용할 때 사라'},
  {q: '얼마나 올랐어?', a: [['g', '아직', '아직이면 서두를 까닭이 없어.'], ['y', '조금', '조금 올랐으면 어디까지 볼지 정해 두자.'], ['r', '벌써 두 배', '두 배 오른 뒤엔 내릴 길도 길어.']], say: '무릎에 사서 어깨에 팔아라'},
  {q: '떨어지면?', a: [['g', '팔 곳 정함', '좋아, 정한 대로만 하면 돼.'], ['y', '생각만', '생각만 하면 그때 가서 흔들려. 숫자로 적어 둬.'], ['r', '안 정함', '사기 전에 팔 곳부터 정하자.']], say: '사기 전에 팔 곳부터 정해라'},
  {q: '오르면?', a: [['g', '정함', '좋아, 욕심이 날 때 그 숫자를 보자.'], ['y', '모름', '오를 때 어디서 나눌지 미리 정해 두자.'], ['r', '끝까지 간다', '끝까지는 아무도 몰라. 나눠서 챙기자.']], say: '손해는 짧게 이익은 길게'},
  {q: '언제 쓸 돈?', a: [['g', '1년 넘게', '오래 둘 돈이면 기다릴 수 있어.'], ['y', '몇 달 안', '몇 달 안에 쓸 돈은 흔들리면 곤란해.'], ['r', '곧', '곧 쓸 돈은 주식에 넣지 말자.']], say: '급한 돈은 주식에 넣지 마라'},
  {q: '마음은?', a: [['g', '차분', '차분하면 좋은 값을 기다릴 수 있어.'], ['r', '놓칠까 급함', '급하면 가장 비싼 값을 치르게 돼.'], ['r', '본전 생각', '본전 생각은 판단을 흐려. 오늘은 쉬자.']], say: '급한 마음이 가장 비싼 값을 치른다'},
  {q: '나눠 넣어?', a: [['g', '세 곳 이상', '좋아, 하나가 넘어져도 괜찮아.'], ['y', '두 곳', '한 곳 더 나눠 담으면 마음이 편해.'], ['r', '한 곳', '달걀을 한 바구니에 담지 말자.']], say: '달걀을 한 바구니에 담지 마라'},
];
/** 네 묶음(명령 5) — 질문 번호(1부터) */
export const GROUPS = [['이유', [1, 2, 3]], ['돈', [4, 9, 11]], ['때', [5, 6]], ['마음', [7, 8, 10]]];
/** 가장 큰 점수(질문 열한 개 × 2) — 준비 = MAX − 점수([5] 5 · 높을수록 좋음) */
export const MAX = QS.length * 2;
/** 쉬어 가는 답([5] 6) — [질문 자리, 답 자리] · 4번 「거의 다·빌린 돈」 · 9번 「곧」 */
export const REST_AT = [[3, QS[3].a.findIndex(a => a[1] === '거의 다·빌린 돈')], [8, QS[8].a.findIndex(a => a[1] === '곧')]];
const stopOf = ans => REST_AT.some(([q, k]) => k >= 0 && ans?.[q] === k);
/** 점수 · 🔴 수 · 묶음 · 판정(명령 6 · [5] 6) — ans = 답 자리(0 ~ 2) 열한 개 · ready = 준비(높을수록 좋음) · stop = 쉬어 가는 답을 고름 */
export function judge(ans) {
  const pts = ans.map((k, i) => PT[QS[i].a[k][0]]);
  const score = pts.reduce((s, x) => s + x, 0), reds = pts.filter(x => x === 2).length, stop = stopOf(ans);
  const groups = Object.fromEntries(GROUPS.map(([n, qs]) => [n, qs.reduce((s, q) => s + pts[q - 1], 0)]));
  const verdict = stop || score >= 12 || reds >= 4 ? '오늘은 쉬어 가자' : score >= 6 ? '반만 준비됐어' : '좋아, 정해 둔 대로만';
  return {score, ready: MAX - score, reds, groups, verdict, stop};
}
/** 기록의 준비 수(옛 기록은 점수만 있음 — 보일 때 바꿈) · 못 읽으면 null */
const readyOf = r => (Number.isFinite(r?.score) ? MAX - r.score : null);
/** 3번 「뭐가 좋아?」의 「클 일이 있다」 — 이 답이면 그 일이 있는 날짜를 받음([3] 3) */
const BIG_Q = 2, BIG_A = QS[BIG_Q].a.findIndex(a => a[1] === '클 일이 있다');
/** 팔 약속 기본값([3] 5 — gdr.json pick.mjs 와 같은 셈: 원 아래 버림) */
export const sellOf = p => Math.floor(p * 9 / 10), halfOf = p => Math.floor(p * 12 / 10);
const KEY = 'atlas:godori-why';
export function records() { try { const x = JSON.parse(localStorage.getItem(KEY) || '[]'); return Array.isArray(x) ? x : []; } catch { return []; } }
function save(rec) { try { const all = records(); all.unshift(rec); localStorage.setItem(KEY, JSON.stringify(all.slice(0, 200))); return true; } catch { return false; } }
/** 답 열한 개를 다 고른 기록인가(옛 기록 포함) */
const fullRec = r => !!r && typeof r === 'object' && Array.isArray(r.answers) && r.answers.length === QS.length && r.answers.every((k, i) => Number.isInteger(k) && k >= 0 && k < QS[i].a.length);
let doneNow = false; // 이 화면에서 방금 끝냄 — 기억 못 하는 기계(localStorage 막힘)에서도 고도리 칸이 열리게
let lastRec = null; // 방금 끝낸 기록(기억 못 하는 기계에서도 오늘 판정을 알게)
let offered = false; // [2] 7 — 카톡 권유는 이 화면을 연 동안 한 번(다시 그림 · 다시 하기 · 두 번째로 끝냄 · 다른 화면 갔다 옴에도 더 안 부름)
/** 매매일지를 끝낸 순간 카톡 권유 한 번 — NX.kakao 가 없거나 offer 가 없으면(꺼짐) 부르지 않고 다음 끝냄에 다시 봄 */
function offerOnce() {
  if (offered) return;
  const K = globalThis.NX?.kakao;
  if (typeof K?.offer !== 'function') return;
  offered = true;
  try { K.offer('journal'); } catch (e) { console.error(e); }
}
/** 열한 질문을 끝낸 적이 있나 — 고도리 칸 문([6] 1 · 일꾼 D) */
export function doneOnce() { return doneNow || records().some(fullRec); }
const seoulDay = ms => new Date(ms + 9 * 36e5).toISOString().slice(0, 10); // 서울 날짜(보는 기계 시간대와 상관없이)
const V_CODE = {'좋아, 정해 둔 대로만': 'go', '반만 준비됐어': 'wait', '오늘은 쉬어 가자': 'rest'};
/** 오늘(서울 날짜) 끝낸 가장 새 기록의 판정([5] 7 · 일꾼 S9 이 'rest' 면 고도리 칸을 닫음) — {at, code, verdict: 'go' | 'wait' | 'rest', ready, of: 22} · 없으면 null */
export function todayResult() {
  const today = seoulDay(Date.now());
  let best = null;
  for (const r of [lastRec, ...records()]) {
    const t = fullRec(r) && typeof r.at === 'string' ? Date.parse(r.at) : NaN;
    if (!Number.isFinite(t) || seoulDay(t) !== today || !V_CODE[r.verdict]) continue;
    if (!best || t > Date.parse(best.at)) best = r;
  }
  return best ? {at: best.at, code: typeof best.code === 'string' ? best.code : null, verdict: V_CODE[best.verdict], ready: readyOf(best), of: MAX} : null;
}

const CODE = /^[0-9][0-9A-Z]{5}$/;
const normCode = a => { const s = String(a ?? '').trim().toUpperCase(); return CODE.test(s) ? s : null; };
const won = n => Math.floor(n).toLocaleString('ko-KR') + '원';
const pad = n => String(n).padStart(2, '0');
const todayIso = () => { const d = new Date(); return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`; }; // 보는 기계 날짜(날짜 고르기 칸과 같은 자)
const ymd = s => { const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(s ?? '')); return m ? `${+m[1]}년 ${+m[2]}월 ${+m[3]}일` : '?'; };
const fmtDay = iso => { const d = new Date(iso); return isNaN(d) ? '?' : `${d.getFullYear()}년 ${d.getMonth() + 1}월 ${d.getDate()}일`; };
const later = (p, ms) => Promise.race([p, new Promise(r => setTimeout(() => r(null), ms))]);
/** 색 점 — 읽어 주는 글을 함께([9] 8 · 🟢 좋음 · 🟡 주의 · 🔴 위험) · 고르기 전에는 빈 테두리(ring · 색 없음 — [5] 1) */
const TONE = {g: '좋음', y: '주의', r: '위험'};
const dot = c => h('span', {class: 'wy-dot wy-' + c}, h('span', {class: 'wy-sr', text: TONE[c]}));
/** 내가 쓴 글 — 남의 글(쓰지 않을 말 셈 밖 · 영어로 바꾸지 않음) */
const mine = t => h('q', {class: 'wy-mine', 'data-proper': '', lang: /[가-힣]/.test(t) ? 'ko' : null, text: t});
const VTONE = {'좋아, 정해 둔 대로만': 'g', '반만 준비됐어': 'y', '오늘은 쉬어 가자': 'r'};
/** 보이는 판정 글 — 2026-10-28 10:11 「어 그렇게 해」(docs/design/why-mock-2026-10-28/order-1011.txt 5)로 그림처럼 단정 · 사장님 판정 글 그대로(옛 10-19 [화면] 4 물음 꼴은 이 칸에서 풂) */
const vShow = v => String(v ?? '?');
/** 묶음 막대 넷 — 묶음 준비 ÷ 묶음 최대([5] 5 · 준비된 만큼 참 · 색은 그 묶음 점수로) */
function bars(groups, small) {
  return h('div', {class: 'wy-bars' + (small ? ' sm' : '')}, ...GROUPS.map(([n, qs]) => {
    const max = qs.length * 2, v = Number.isFinite(groups?.[n]) ? groups[n] : 0, c = v === 0 ? 'g' : v * 2 >= max ? 'r' : 'y', fill = h('i', {class: 'wy-fill wy-' + c});
    fill.style.setProperty('width', Math.round((max - v) / max * 100) + '%');
    return h('div', {class: 'wy-bar'}, h('span', {class: 'wy-bn', text: n}), h('span', {class: 'wy-track', 'aria-hidden': 'true'}, fill), h('b', {class: 'num', text: `${max - v} / ${max}`}), h('span', {class: 'wy-sr', text: TONE[c]}));
  }));
}

/* 종목 찾기 — 찾기(#/find)와 같은 잣대: 일꾼 A 의 NX.findReady()(펀드 · 우선주까지 목록이 옴) → NX.findMatch(q) = [{c, n, k, w?}] 찾기 화면과 같은 차례
   k = 'c' 회사 주식(매매일지에 적음) · 'x' 펀드 · 우선주 …(적지 않고 까닭 w 한 줄을 보임) · 'i' · 'g' 업종 · 갈래(빼고 봄) */
const coOf = c => NX.ix?.()?.co?.[c] ?? null;
const isCo = (c, k) => (NX.ix?.() ? !!coOf(c) : k === 'c'); // 회사 주식(그날 값 파일이 있음) · 자료를 못 받았으면 찾기가 준 종류로
async function match(q) {
  if (typeof NX.findMatch !== 'function') return [];
  try {
    if (typeof NX.findReady === 'function') await NX.findReady();
    const r = await NX.findMatch(q);
    return Array.isArray(r) ? r.filter(x => x && (x.k === 'c' || x.k === 'x') && CODE.test(String(x.c ?? ''))).map(x => ({c: String(x.c), n: String(x.n ?? x.c), k: x.k, w: x.w ?? null})) : [];
  } catch (e) { console.error(e); return []; }
}
/** 번호 하나 → 종목(회사 주식이면 사이트 자료에서 바로 · 그 밖은 찾기 목록에서 이름 · 까닭) · 없으면 null */
async function lookup(code) {
  await Promise.all([NX.need?.('core'), NX.need?.('mkt')]);
  const o = coOf(code); if (o) return {c: code, n: o.n, co: true, w: null};
  const hit = (await match(code)).find(x => x.c === code);
  return hit ? {c: code, n: hit.n, co: isCo(hit.c, hit.k), w: hit.w} : null;
}
/** 그날 값 — 회사 파일의 마지막 종가(c.price · c.priceDate) · 못 받으면 null */
async function priceOf(code) {
  const j = await NX.getJson('co/' + code + '.json'), c = j?.c;
  return c && Number.isFinite(c.price) && c.price > 0 ? {price: c.price, day: typeof c.priceDate === 'string' ? c.priceDate : null, name: typeof c.name === 'string' ? c.name : null} : null;
}

const START = -1, RES = QS.length, DET = QS.length + 1;
/** 매매일지 칸(2026-10-28 그림 그대로 · docs/design/why-mock-2026-10-28/brief.md) — 시작 → 질문 열한 개(고르고 「다음으로 ›」) → 결과 → 상세 분석
    code = 처음부터 정한 종목(#/why/<번호> · 보내기 쪽) — 화면엔 안 보이고 기록에만(이름 · 그날 값 · 날짜 → 한 달 뒤 값) · onDone(기록, 남겼나) = 결과를 보인 뒤
    autoFocus = 옛 찾기 칸 자리(이제 쓰지 않음 · 부르는 쪽 그대로 받음) · onAgain = 「다시 하기」를 누름(목록 접은 줄을 풂 · B15) */
export function whyCard(G, {page = false, code = null, onDone = null, autoFocus = true, onAgain = null} = {}) { // eslint-disable-line no-unused-vars
  const box = h('section', {class: 'wy' + (page ? ' page' : ''), 'aria-label': '친구야, 왜 사?'});
  const live = h('p', {class: 'wy-live', 'aria-live': 'polite'});
  const ans = new Array(QS.length).fill(null);
  const S = {code: null, name: null, price: null, day: null, wait: null, bigDay: ''};
  const pre = normCode(code);
  let i = START, err = '', last = null, saved = false, focusSel = null, busy = false, tab = 'all';

  /** 정한 종목을 조용히 기억(그날 값은 뒤에서 받음 · 못 받으면 null) */
  const setStock = (c, n) => {
    Object.assign(S, {code: c, name: n, price: null, day: null});
    const p = S.wait = later(priceOf(c).catch(() => null), 6000).then(x => {
      if (S.wait !== p) return;
      S.wait = null;
      if (x) { S.price = x.price; S.day = x.day; if (!S.name) S.name = x.name; }
    });
  };
  const start = () => {
    ans.fill(null); S.bigDay = ''; err = ''; last = null; saved = false; live.textContent = ''; i = START; tab = 'all';
    if (!pre || S.code === pre) return; // 다시 하기 — 정한 종목 그대로
    const o = coOf(pre);
    if (o) { setStock(pre, o.n); return; }
    lookup(pre).catch(() => null).then(r => { if (r?.co && !S.code) setStock(r.c, r.n); }); // 회사 주식이 아니거나 없는 번호 — 조용히 빼고 감
  };

  const btn = (cls, text, fn) => { const b = h('button', {class: cls, type: 'button', text}); b.addEventListener('click', fn); return b; };
  const upBtn = (label, fn) => { const b = h('button', {class: 'wy-up', type: 'button', 'aria-label': label}, lookIcon('back', 24)); b.addEventListener('click', fn); return b; };
  /** 칸 맨 위를 위 막대 바로 밑으로(장이 바뀔 때 — 한 화면에 한 가지) */
  const keepTop = () => {
    const topY = Math.max(0, document.querySelector('header.top')?.getBoundingClientRect().bottom ?? 0), r = box.getBoundingClientRect();
    if (Math.abs(r.top - topY) > 1) window.scrollBy(0, r.top - topY);
  };
  const goBack = () => {
    if (busy) return;
    err = ''; live.textContent = '';
    if (i === DET) { i = RES; focusSel = '.wy-detb'; } else { i--; focusSel = i === START ? '.wy-go' : '.wy-q'; }
    draw(); keepTop();
  };

  /* ① 시작(그림 1) */
  const startView = () => [h('div', {class: 'wy-head wy-hero'},
    page ? h('a', {class: 'wy-up', href: '#/', 'aria-label': '첫 화면으로'}, lookIcon('back', 24)) : null,
    h('h2', {class: 'wy-h'}, h('span', {text: '나의 투자 성향,'}), h('br'), h('em', {text: '지금은'}), h('span', {text: ' '}), h('span', {text: '어떤 상태일까?'})),
    h('p', {class: 'wy-sub'}, h('span', {text: '투자 심리와 실제 매매 습관을 함께 분석해'}), h('span', {text: ' '}), h('span', {text: '나에게 맞는 투자 가이드를 드려요.'})), // 두 줄(좁으면 고르게 나눔)
    sceneArt(),
    h('ul', {class: 'wy-hl'}, ...['11개의 질문으로 간단하게', '투자 심리 + 실제 매매 습관 분석', '나에게 맞는 행동 가이드 제공'].map(t => h('li', {}, lookIcon('check', 18), h('span', {text: t}))))),
    btn('wy-go', '시작하기 ›', () => { if (busy) return; i = 0; err = ''; focusSel = '.wy-q'; draw(); keepTop(); }),
    h('p', {class: 'wy-time', text: '약 2분 소요 · 기록은 이 기기에만 남아요'})];

  /* ② 질문 하나(그림 2 · 3) — 답 누름 = 고르기만 · 「다음으로 ›」 = 다음(order-1011 3) */
  const dateRow = () => {
    const d = h('input', {class: 'wy-date', type: 'date', min: todayIso(), value: S.bigDay, required: true});
    const set = () => { S.bigDay = d.value; if (err) { err = ''; box.querySelector('.wy-err')?.remove(); } };
    d.addEventListener('input', set); d.addEventListener('change', set);
    return h('label', {class: 'wy-dl'}, h('span', {text: '그 일이 언제야?'}), d);
  };
  const pickAns = k => {
    if (busy) return;
    ans[i] = k; err = ''; live.textContent = `${NAME}: ${QS[i].a[k][2]}`; // 한마디는 읽어 주는 칸에(order-1011 4)
    focusSel = i === BIG_Q && k === BIG_A && !S.bigDay ? '.wy-date' : '.wy-opt.on';
    draw();
    if (i === BIG_Q && k === BIG_A) keepIn('.wy-dl');
  };
  /** 한 칸이 위 막대와 아래 단추 줄 사이에 보이게(질문 머리 위로는 안 올림) */
  const keepIn = sel => {
    const e = box.querySelector(sel); if (!e) return;
    const topY = Math.max(0, document.querySelector('header.top')?.getBoundingClientRect().bottom ?? 0) + 8;
    const botY = Math.min(window.innerHeight, document.querySelector('nav.tabs')?.getBoundingClientRect().top ?? window.innerHeight) - 88; // 붙어 있는 「다음으로」 자리
    const r = e.getBoundingClientRect(), q = box.querySelector('.wy-q')?.getBoundingClientRect().top ?? topY;
    if (r.bottom > botY) window.scrollBy(0, Math.min(r.bottom - botY, Math.max(0, q - topY)));
  };
  const onNext = async () => {
    if (busy) return;
    if (ans[i] == null) { err = '답을 하나 골라 줘.'; focusSel = '.wy-opt'; draw(); return; }
    if (i === BIG_Q && ans[i] === BIG_A) { // 3번 「클 일이 있다」 — 날짜를 받아야 넘어감([3] 3)
      const v = S.bigDay;
      if (!/^\d{4}-\d{2}-\d{2}$/.test(v)) { err = '그 일이 언제인지 날짜를 적어 줘.'; focusSel = '.wy-date'; draw(); return; }
      if (v < todayIso()) { err = '오늘이나 그 뒤 날짜를 적어 줘.'; focusSel = '.wy-date'; draw(); return; }
    }
    if (i === QS.length - 1) {
      if (S.wait) { busy = true; box.setAttribute('aria-busy', 'true'); try { await S.wait; } finally { busy = false; box.removeAttribute('aria-busy'); } } // 정한 종목의 그날 값을 받는 중이면 기다림
      finish(); return;
    }
    i++; err = ''; focusSel = '.wy-q'; draw(); keepTop();
  };
  const qView = () => {
    const Q = QS[i], L = LOOK[i] ?? {}, k0 = ans[i], lastQ = i === QS.length - 1;
    const prog = h('span', {class: 'wy-prog', 'aria-hidden': 'true'}, h('i')); prog.firstChild.style.setProperty('width', Math.round((i + 1) / QS.length * 100) + '%');
    const opts = h('div', {class: 'wy-opts', role: 'group', 'aria-label': Q.q}); // 사장님 질문 글 그대로(읽어 주는 이름)
    Q.a.forEach(([, t], k) => {
      const on = k0 === k, b = h('button', {class: 'wy-opt' + (on ? ' on' : ''), type: 'button', 'aria-pressed': String(on)},
        h('span', {class: 'wy-oi'}, lookIcon(L.ic?.[k] ?? 'ask', 24)),
        h('span', {class: 'wy-ob'}, h('span', {class: 'wy-ot', text: t}), L.sub?.[k] ? h('small', {class: 'wy-os', text: L.sub[k]}) : null),
        h('span', {class: 'wy-radio', 'aria-hidden': 'true'}));
      b.addEventListener('click', () => pickAns(k));
      opts.append(b);
    });
    return [h('div', {class: 'wy-head wy-pg'}, upBtn(i === 0 ? '처음으로' : '앞 질문', goBack), prog, h('p', {class: 'wy-step num', text: `${i + 1} / ${QS.length}`})),
      h('h3', {class: 'wy-q', tabindex: '-1', text: L.lead ?? Q.q}),
      L.hint ? h('p', {class: 'wy-hint', text: L.hint}) : null,
      opts,
      i === BIG_Q && k0 === BIG_A ? dateRow() : null,
      h('div', {class: 'wy-whyq'}, h('p', {class: 'wy-whyk'}, lookIcon('bulb', 22), h('b', {text: lastQ ? '이런 점을 확인해요' : '왜 이런 질문을 하나요?'})),
        L.why ? h('p', {class: 'wy-whyt', text: L.why}) : null,
        h('p', {class: 'wy-say'}, h('span', {class: 'wy-sayk', text: '격언 '}), h('q', {'data-proper': '', text: Q.say}))), // 격언은 노란 칸 맨 아래 한 줄(order-1011 4)
      err ? h('p', {class: 'wy-err', role: 'alert', text: err}) : null,
      h('div', {class: 'wy-nav'}, lastQ ? btn('wy-back', '‹ 이전', goBack) : null, btn('wy-next', lastQ ? '결과 보기 ›' : '다음으로 ›', onNext))].filter(Boolean);
  };

  /* ③ 결과(그림 4 + 그림 7) */
  const finish = () => {
    const J = judge(ans);
    last = {at: new Date().toISOString(), asOf: G?.asOf ?? null, code: S.code, name: S.name, price: S.price, day: S.day,
      answers: [...ans], score: J.score, reds: J.reds, verdict: J.verdict, groups: J.groups,
      bigDay: ans[BIG_Q] === BIG_A ? S.bigDay : null, why: null, promise: null, // 마지막 두 줄은 그림에 없어 뺌(order-1011 6) — 열쇠는 그대로
      picks: (G?.picks ?? []).map(p => ({code: p.code, name: p.name, price: p.price, w: p.w}))};
    saved = save(last); doneNow = true; lastRec = last;
    i = RES; err = ''; focusSel = '.wy-verdict'; draw(); keepTop();
    if (typeof onDone === 'function') { try { onDone(last, saved); } catch (e) { console.error(e); } }
    offerOnce(); // [2] 7 — 결과가 처음 보인 뒤 한 번
    tally(V_CODE[J.verdict] === 'rest' ? 'stop_rest' : 'stop'); // 합계 칸 ① 멈춤(KD · [10] 1)
  };
  const resView = () => {
    const J = last, v = V_CODE[J.verdict] ?? 'wait', T = TYPE_OF[v], quote = v === 'rest' && stopOf(J.answers) ? T.stopQ : T.q;
    live.textContent = vShow(J.verdict);
    const share = h('button', {class: 'wy-share', type: 'button'}, lookIcon('share', 20), h('span', {text: '공유하기'}));
    share.addEventListener('click', () => shareRes(share, T.name, quote));
    const detb = btn('wy-detb', '내 분석 자세히 보기 ›', () => { i = DET; tab = 'all'; focusSel = '.wy-dtitle'; draw(); keepTop(); });
    const again = btn('wy-again', '다시 하기', () => { start(); focusSel = '.wy-go'; draw(); keepTop(); try { onAgain?.(); } catch (e) { console.error(e); } });
    return h('div', {class: 'wy-res'},
      h('div', {class: 'wy-rhead'}, share,
        h('p', {class: 'wy-verdict', 'data-v': v, tabindex: '-1'}, h('span', {class: 'wy-vk', text: '당신은'}), h('b', {}, h('span', {class: 'wy-vt', text: T.name}), h('span', {class: 'wy-ve', text: '예요'}))), // 화면에서 가장 큰 글([5] 2)
        h('p', {class: 'wy-type'}, h('span', {text: '“'}), h('span', {text: quote}), h('span', {text: '”'})),
        sceneArt(true)),
      h('div', {class: 'wy-sheet'}, tendCard(J), mindCard(J), detb, ...hubNodes(page),
        h('p', {class: 'wy-note', text: saved ? (page ? '오늘 답을 아래 매매일지에 날짜와 함께 쌓았어요.' : '오늘 답을 매매일지에 날짜와 함께 쌓았어요.') : '이 기기는 기록을 남길 수 없어요. 답은 이 화면에만 있어요.'}),
        h('div', {class: 'wy-nav'}, again, page ? null : h('a', {class: 'wy-link', href: '#/why', text: '매매일지 보기 ›'}))));
  };

  /* ④ 상세 분석(그림 5 · 6) — 탭 넷 한 줄 · 맞춤 가이드 탭이면 머리 글도 「맞춤 가이드」 */
  const detView = () => {
    const D = detailParts(last), tabs = h('div', {class: 'wy-tabs', role: 'tablist', 'aria-label': '상세 분석'});
    for (const [k, t] of DET_TABS) {
      const on = k === tab, b = h('button', {class: 'wy-tab' + (on ? ' on' : ''), type: 'button', role: 'tab', 'data-k': k, 'aria-selected': String(on), text: t});
      b.addEventListener('click', () => { if (tab === k) return; tab = k; focusSel = `.wy-tab[data-k="${k}"]`; draw(); });
      tabs.append(b);
    }
    return [h('div', {class: 'wy-head wy-dtop'}, upBtn('결과로', goBack), h('h3', {class: 'wy-dtitle', tabindex: '-1', text: tab === 'guide' ? '맞춤 가이드' : '상세 분석 결과'})),
      tabs, h('div', {class: 'wy-dbody', role: 'tabpanel'}, ...D[tab])];
  };

  const draw = () => {
    box.dataset.step = i === START ? 'start' : i < RES ? 'q' : i === RES ? 'res' : 'det';
    const nodes = i === START ? startView() : i < RES ? qView() : i === RES ? [resView()] : detView();
    box.replaceChildren(...nodes, live);
    if (focusSel) box.querySelector(focusSel)?.focus({preventScroll: true});
    focusSel = null;
  };
  start(); draw();
  return box;
}
/** 장면 그림(그림 1 · 4) — 뒤 화면 · 나무 그림자 + 둘이(+ 시작은 책상 · 태블릿 · 커피) */
function sceneArt(res = false) {
  const [bg, fg] = sceneNodes(res);
  return h('div', {class: 'wy-scene' + (res ? ' res' : ''), 'aria-hidden': 'true'}, bg, h('img', {class: 'wy-scch', src: '/media/makbi-hello.svg', alt: '', width: 120, height: 150}), fg ?? null);
}
/** 그림 4 「투자 성향 요약」 — 답으로 셈한 100점 넷(신중함 · 감정적 매매 · 위험 선호도 · 장기 투자 성향) · 초록 답일수록 신중 · 장기 높음 · 빨강 답일수록 감정 · 위험 높음 */
export function tendOf(answers) {
  const pt = (q, k) => ({g: 2, y: 1, r: 0})[QS[q]?.a[k]?.[0]] ?? 0;
  const avg = (qs, inv) => { let a = 0, n = 0; for (const q of qs) { const k = answers?.[q]; if (!Number.isInteger(k) || !QS[q]?.a[k]) continue; const v = pt(q, k); a += inv ? 2 - v : v; n += 2; } return n ? Math.round(a / n * 100) : 0; };
  return [['신중함', avg([1, 2, 6, 7])], ['감정적 매매', avg([0, 4, 9], true)], ['위험 선호도', avg([3, 5, 10], true)], ['장기 투자 성향', avg([8, 2])]];
}
function tendCard(J) {
  const rows = tendOf(J?.answers).map(([n, v], k) => { const f = h('i', {class: 'wy-tf t' + k}); f.style.setProperty('width', v + '%');
    return h('div', {class: 'wy-trow'}, h('span', {class: 'wy-tn', text: n}), h('span', {class: 'wy-tt2', 'aria-hidden': 'true'}, f), h('b', {class: 'num', text: String(v)})); });
  return h('div', {class: 'wy-card wy-tend'}, h('p', {class: 'wy-ck', text: '투자 성향 요약'}), ...rows);
}
/** 그림 4 「현재 심리 상태」 — 10번 「마음은?」 답으로(차분 · 놓칠까 급함 · 본전 생각) */
function mindCard(J) {
  const k = J?.answers?.[9], m = Number.isInteger(k) ? MIND_OF[k] : null;
  if (!m) return null;
  return h('div', {class: 'wy-card wy-mind'}, h('span', {class: 'wy-mi'}, faceIcon(['calm', 'rush', 'worry'][k] ?? 'soso', 40)),
    h('div', {class: 'wy-mb'}, h('p', {class: 'wy-ck', text: '현재 심리 상태'}), h('p', {class: 'wy-mv', text: m[0]}), h('p', {class: 'wy-mt', text: m[1]})));
}
/** 결과 보내기(그림 4 「공유하기」) — 휴대폰 보내기 창 · 없으면 글 복사(가입 · 모음 없음) */
function shareRes(b, name, quote) {
  const say = t => { const s = b.querySelector('span'); if (s) s.textContent = t; };
  const text = `「친구야, 왜 사?」 결과 — 나는 「${name}」래요. ${quote}`, url = location.origin + '/next/#/why';
  try { if (typeof navigator.share === 'function') { navigator.share({title: '친구야, 왜 사?', text, url}).catch(() => {}); return; } } catch { /* 아래 복사로 */ }
  try { const p = navigator.clipboard?.writeText(`${text} ${url}`); if (p) p.then(() => say('복사했어요'), () => say('복사하지 못했어요')); else say('복사하지 못했어요'); } catch { say('복사하지 못했어요'); }
}
const DET_TABS = [['all', '종합 분석'], ['mind', '심리 분석'], ['habit', '매매 습관'], ['guide', '맞춤 가이드']]; // 그림 5 탭 넷 한 줄
/** 그림 5 · 6 — 상세 분석 탭마다 그릴 것(종합 분석 · 심리 분석 · 매매 습관 · 맞춤 가이드) */
function detailParts(J) {
  const ans = J?.answers ?? [];
  const row = q => { const k = ans[q]; if (!Number.isInteger(k) || !QS[q]?.a[k]) return null; const [c, t, one] = QS[q].a[k];
    return h('li', {class: 'wy-dr'}, dot(c), h('div', {}, h('p', {class: 'wy-drq'}, h('span', {class: 'num', text: `${q + 1}. `}), h('span', {text: QS[q].q}), h('span', {text: ' '}), h('b', {text: t})), h('p', {class: 'wy-dro', text: one}))); };
  const byC = c => ans.map((k, q) => [q, k]).filter(([q, k]) => Number.isInteger(k) && QS[q]?.a[k]?.[0] === c);
  const good = byC('g').slice(0, 3), bad = byC('r').slice(0, 3);
  const mind = J?.groups?.['마음'] ?? 0;
  const mindT = mind <= 1 ? '값이 흔들려도 정해 둔 대로 하려는 편이에요.' : mind <= 3 ? '차분하지만 가끔 마음이 앞설 때가 있어요.' : '마음이 급해지기 쉬운 때예요. 숨을 고르고 봐요.'; // 단정(order-1011 5)
  const weak = GROUPS.filter(([n]) => n !== '마음').map(([n, qs]) => [n, (J?.groups?.[n] ?? 0) / (qs.length * 2)]).sort((a, b) => b[1] - a[1])[0];
  const habitT = weak && weak[1] > 0 ? [h('span', {text: '가장 덜 준비된 곳은'}), h('span', {text: ' '}), h('b', {text: weak[0]}), h('span', {text: ' '}), h('span', {text: '묶음이에요.'})] : [h('span', {text: '이유, 돈, 때가 모두 잘 준비된 편이에요.'})];
  const card = (cls, ic, title, items, empty) => h('div', {class: 'wy-pc ' + cls}, h('p', {class: 'wy-pk'}, h('span', {class: 'wy-pki'}, lookIcon(ic, 22)), h('b', {text: title})),
    items.length ? h('ul', {}, ...items.map(([q, k]) => h('li', {}, h('span', {class: 'num', text: `${q + 1}. `}), h('span', {text: QS[q].a[k][1]})))) : h('p', {class: 'wy-pe', text: empty}));
  const acts = [];
  for (const [q] of [...byC('r'), ...byC('y')]) { const a = LOOK[q]?.act; if (a && !acts.some(x => x[0] === a[0])) acts.push(a); }
  for (const a of ACT_MORE) if (acts.length < 3 && !acts.some(x => x[0] === a[0])) acts.push(a);
  const three = acts.slice(0, 3);
  const dcard = (ic, title, ...kids) => h('div', {class: 'wy-card wy-dcard'}, h('div', {class: 'wy-dch'}, h('span', {class: 'wy-dci ic-' + ic}, lookIcon(ic, 26)), h('h4', {class: 'wy-dh', text: title})), ...kids); // 그림 5 — 카드 둘 · 제목 왼쪽 그림
  return {
    all: [dcard('brain', '1. 나의 투자 심리', h('p', {class: 'wy-dp', text: mindT}),
      h('div', {class: 'wy-pcs'}, card('good', 'thumb', '강점', good, '초록 답이 아직 없어요.'), card('warn', 'warn', '주의할 점', bad, '빨간 답이 없어요.'))),
      dcard('bars', '2. 나의 매매 습관', h('p', {class: 'wy-dp'}, ...habitT))],
    mind: [h('ul', {class: 'wy-card wy-dl2'}, ...[6, 7, 9].map(row).filter(Boolean))],
    habit: [h('ul', {class: 'wy-card wy-dl2'}, ...[0, 1, 2, 3, 4, 5, 8, 10].map(row).filter(Boolean))],
    guide: [h('h4', {class: 'wy-dh wy-gh', text: '지금 나에게 필요한 3가지'}),
      h('ol', {class: 'wy-card wy-gl'}, ...three.map(([t, d], n) => h('li', {}, h('b', {class: 'wy-gn num', text: String(n + 1)}), h('div', {class: 'wy-gb'}, h('p', {class: 'wy-gt', text: t}), h('p', {class: 'wy-gd', text: d})), h('span', {class: 'wy-gi'}, lookIcon(['clip', 'pie', 'memo'][n] ?? 'note', 28))))), // 그림 6 — 오른쪽 흐린 그림
      copyBtn(three)],
  };
}
/** 그림 6 「나만의 투자 체크리스트 받기」 — 글로 복사(파일을 만들지 않음) */
function copyBtn(three) {
  const txt = ['나만의 투자 체크리스트', ...three.map(([t, d], n) => `${n + 1}. ${t}: ${d}`)].join('\n');
  const b = h('button', {class: 'wy-copy', type: 'button'}, h('span', {text: '나만의 투자 체크리스트 받기'}), lookIcon('down2', 22));
  const say = t => { const s = b.querySelector('span'); if (s) s.textContent = t; };
  b.addEventListener('click', () => { try { const p = navigator.clipboard?.writeText(txt); if (p) p.then(() => say('복사했어요'), () => say('복사하지 못했어요')); else say('복사하지 못했어요'); } catch { say('복사하지 못했어요'); } });
  return b;
}
/** 그림 7 더 보기 — 인사 줄 · 감정 상태 체크(이 기기에만) · 투자 일지(아래 기록) · 나의 성장 리포트(한 달 뒤) */
const MOOD_KEY = 'atlas:why-mood';
function hubNodes(page) {
  const said = h('p', {class: 'wy-note wy-said', 'aria-live': 'polite'});
  const row = h('div', {class: 'wy-moods', role: 'group', 'aria-label': '지금 내 투자 심리는 어떤가요?'});
  for (const [k, t] of MOODS) {
    const b = h('button', {class: 'wy-mood', type: 'button', 'data-m': k, 'aria-pressed': 'false'}, faceIcon(k, 40), h('span', {text: t})); // 그림 7 — 채운 얼굴
    b.addEventListener('click', () => {
      try { const all = JSON.parse(localStorage.getItem(MOOD_KEY) || '[]'); all.unshift({at: new Date().toISOString(), m: k}); localStorage.setItem(MOOD_KEY, JSON.stringify(all.slice(0, 100))); said.textContent = '오늘 마음을 이 기기에 적었어요.'; } catch { said.textContent = '이 기기는 적을 수 없어요.'; }
      for (const x of row.children) { const on = x === b; x.classList.toggle('on', on); x.setAttribute('aria-pressed', String(on)); }
    });
    row.append(b);
  }
  const rowIn = (ic, t, s) => [h('span', {class: 'wy-rti ic-' + ic}, lookIcon(ic, 26)), h('span', {class: 'wy-rowt'}, h('b', {text: t}), h('small', {text: s})), h('i', {'aria-hidden': 'true', text: '›'})];
  const log = h('button', {class: 'wy-row', type: 'button', 'data-go': 'log'}, ...rowIn('note', '투자 일지', '오늘의 매매를 기록해보세요.'));
  log.addEventListener('click', () => { const L = page ? document.querySelector('#view section.wy-me') : null; if (L) L.scrollIntoView({behavior: 'smooth', block: 'start'}); else location.hash = '#/why/later'; }); // 기록 목록이 없는 칸(보내기 쪽)은 한 달 뒤 쪽 목록으로(brief ③)
  return [h('div', {class: 'wy-card wy-hi'}, h('img', {src: '/media/makbi-icon.svg', alt: '', width: 56, height: 56}), h('p', {class: 'wy-hit2', text: '오늘도 좋은 투자 하세요!'})), // 그림 7 맨 위 인사 줄
    h('div', {class: 'wy-card wy-moodc'}, h('div', {class: 'wy-mh'}, h('span', {class: 'wy-mhi'}, lookIcon('loop', 26)), h('div', {}, h('p', {class: 'wy-ck', text: '감정 상태 체크'}), h('p', {class: 'wy-mq', text: '지금 내 투자 심리는 어떤가요?'}))), row, said),
    h('div', {class: 'wy-card wy-rowc'}, log),
    h('div', {class: 'wy-card wy-rowc'}, h('a', {class: 'wy-row', href: '#/why/later'}, ...rowIn('grow', '나의 성장 리포트', '한 달 후 다시 점검해보세요.')))];
}
/** 결과 · 기록의 두 줄(반토막 난다면 · 팔 약속 · 클 일 날짜) */
function lines(r) {
  return h('div', {class: 'wy-lines'},
    r.why ? h('p', {}, h('span', {class: 'wy-lk', text: '반토막 난다면 '}), mine(String(r.why))) : null,
    typeof r.promise?.text === 'string' ? h('p', {}, h('span', {class: 'wy-lk', text: '팔 약속 '}), h('span', {text: r.promise.text})) : null,
    r.bigDay ? h('p', {}, h('span', {class: 'wy-lk', text: '클 일 '}), h('span', {text: ymd(r.bigDay)})) : null);
}

/** 쌓인 기록(새 것부터 · 서른 줄까지) — 종목 · 그날 값 · 두 줄 · 준비 · 막대 · 지우는 단추 없음
    한 달(장 스무 번) 지난 기록 = 「그날 정한 대로 했어?」 먼저([5] 8) → 답한 뒤 값([5] 9 — 시작 날 종가 → 스무 번째 장 날 종가 · 같은 때 코스피 · 모든 회사 가운데 값)
    here = 매매일지 화면(위에 질문 칸이 있음) · fold = 방금 끝낸 기록(위 결과와 같은 첫 줄은 한 줄로 접음 — 지우지 않음 · 누르면 펼침 · B15 · 2026-10-22 총정리) */
function recBox(here, fold = null) {
  const list = records().filter(r => r && typeof r === 'object'), box = h('section', {class: 'wy-me', 'aria-label': '왜 사? 기록'}); // 깨진 줄은 그리기에서만 건너뜀(지우지 않음)
  box.append(h('h2', {class: 'sec', text: `왜 사? 기록 ${list.length}번`}));
  if (!list.length) { box.append(h('p', {class: 'note', text: here ? '아직 기록이 없어요. 위 질문에 답하면 날짜와 함께 여기 쌓여요.' : '아직 기록이 없어요. 매매일지에서 「친구야, 왜 사?」에 답하면 날짜와 함께 여기 쌓여요.'})); return box; }
  box.append(h('p', {class: 'note', text: '틀린 것도 지우지 않아요. 한 달이 지나면 그날 정한 대로 했는지 먼저 묻고, 그 뒤 값을 같은 때 코스피와 모든 회사 가운데 값과 함께 붙여요.'}));
  for (const [n, r] of list.slice(0, 30).entries()) {
    const rd = readyOf(r);
    const row = h('div', {class: 'wy-rec'},
      h('p', {class: 'wy-rh'}, h('b', {text: fmtDay(r.at)}), h('span', {text: ' · '}), h('span', {class: 'num', text: rd == null ? '준비 ?' : `준비 ${rd} / ${MAX}`}), h('span', {class: 'wy-v' + (VTONE[r.verdict] ?? 'y'), text: ` · ${vShow(r.verdict)}`})));
    const rs = r.code || r.name ? h('p', {class: 'wy-rs'}, h('span', {class: 'wy-stn', 'data-proper': '', text: String(r.name || r.code)}),
      h('span', {text: r.price > 0 ? ` · 그날 값 ${won(r.price)}` + (r.day ? ` · ${NX.md(r.day)} 종가` : '') : ' · 그날 값 ?'})) : null;
    // 카톡 단추(사장님 2026-10-18 16:39 [6] 1 · 3 · 일꾼 KB2) — 회사 주식 기록만 · 종목 줄 오른쪽 끝 · 값은 글상자가 오늘 값으로 채움([6] 3 「오늘 값」 — 그날 값 · 답 · 준비 점수는 담지 않음)
    const kb = rs && coOf(normCode(r.code)) ? shareButtons({code: normCode(r.code), name: coOf(normCode(r.code)).n, kind: 'share'}, {kakao: true}) : null;
    if (kb) { row.setAttribute('data-kkrow', 'why.rec'); row.append(h('div', {class: 'wy-kr'}, rs, kb)); } else if (rs) row.append(rs);
    row.append(bars(r.groups, true));
    if (r.why || r.promise || r.bigDay) row.append(lines(r));
    const out = h('div', {class: 'wy-later'}); row.append(out); laterBox(r, out);
    const t = Date.parse(r.at);
    if (n === 0 && here && fold && r.at === fold.at && (r.code ?? null) === (fold.code ?? null)) box.append(h('details', {class: 'wy-fold'},
      h('summary', {class: 'wy-fs'}, h('span', {}, h('span', {text: '방금 적음'}), h('span', {text: ' · '}), h('span', {text: Number.isFinite(t) ? NX.md(seoulDay(t)) : '?'}), h('span', {text: ' · '}), h('span', {text: vShow(r.verdict)}), h('span', {text: ' — '}), h('span', {text: '위 결과와 같아요'}))), row));
    else box.append(row);
  }
  return box;
}
const LATER = 20; // 한 달 = 장 스무 번
/** 기록의 한 달 칸 — s = 시작 날(그날 값 날짜 · 없으면 고도리 칸 날짜 · 없으면 기록한 서울 날짜 · 그날이나 그 앞 마지막 장 날) · e = 스무 번째 장 날(아직이면 null)
    D = days.json 날짜 줄(사이트 회사 선과 같은 줄 — co/<번호>.json close[j] = D[j + k0] 의 종가) · 날짜 줄을 못 받으면 null */
async function windowOf(r) {
  const days = await NX.getJson('days.json'), D = Array.isArray(days?.dates) && days.dates.length ? days.dates : null;
  if (!D) return null;
  const okD = s => typeof s === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(s);
  const t = okD(r.day) ? r.day : okD(r.asOf) ? r.asOf : Number.isFinite(Date.parse(r.at)) ? seoulDay(Date.parse(r.at)) : null;
  if (!t || t > D[D.length - 1]) return {D, k: -1, s: t, e: null}; // 날짜 줄이 아직 그날까지 오지 않음
  let k = -1; for (let j = D.length - 1; j >= 0; j--) if (D[j] <= t) { k = j; break; }
  return k < 0 ? {D, k, s: null, e: null} : {D, k, s: D[k], e: D[k + LATER] ?? null};
}
let MEDP = null, medFail = 0;
/** 모든 회사 가운데 값(/next/data/median20.json · 만드는 셈 scripts/atlas11/next/build/median20.mjs) — 못 받으면 null(15초 뒤 다시) */
function median20() {
  if (MEDP && !(medFail && Date.now() - medFail > 15000)) return MEDP;
  medFail = 0;
  MEDP = fetch('/next/data/median20.json', {cache: 'no-cache'}).then(x => (x.ok ? x.json() : null)).catch(() => null).then(j => { if (!Array.isArray(j?.rows)) { medFail = Date.now(); return null; } return j; });
  return MEDP;
}
const numB = (v, f) => (v == null ? h('b', {class: 'wy-qm', text: '?'}) : h('b', {class: 'num', text: f(v)}));
const pctB = x => (x == null || !Number.isFinite(x) ? h('b', {class: 'wy-qm', text: '?'}) : h('b', {class: 'num ' + NX.cls(x), text: NX.pct(x)}));
/** 한 달 뒤 값 셋([5] 9) — 날짜를 박아 셈 · 못 찾으면 「?」 */
async function laterVals(r, W) {
  const [co, home, M] = await Promise.all([r.code ? NX.getJson('co/' + r.code + '.json') : null, NX.need?.('home'), median20()]);
  const nodes = [];
  if (r.code) {
    const cl = Array.isArray(co?.close) ? co.close : null, k0 = Number.isInteger(co?.k0) ? co.k0 : 0;
    const a = cl?.[W.k - k0], b = cl?.[W.k + LATER - k0], A = a > 0 ? a : null, B = b > 0 ? b : null;
    nodes.push(h('p', {class: 'wy-lv'}, h('span', {class: 'wy-stn', 'data-proper': '', text: String(r.name || r.code)}), h('span', {text: ` ${NX.md(W.s)} 종가 `}), numB(A, won), h('span', {text: ' → '}),
      h('span', {text: `${NX.md(W.e)} 종가 `}), numB(B, won), h('span', {text: ' · '}), pctB(A && B ? (B / A - 1) * 100 : null)));
  }
  const K = home?.idx?.KOSPI, kr = new Map(Array.isArray(K?.rows) ? K.rows.filter(x => Array.isArray(x)).map(x => [x[0], x[1]]) : []);
  if (typeof K?.date === 'string' && K.close > 0 && !kr.has(K.date)) kr.set(K.date, K.close);
  const ka = kr.get(W.s), kb = kr.get(W.e);
  nodes.push(h('p', {class: 'wy-lv'}, h('span', {text: '같은 때 코스피 '}), pctB(ka > 0 && kb > 0 ? (kb / ka - 1) * 100 : null)));
  const mr = Array.isArray(M?.rows) ? M.rows.find(x => Array.isArray(x) && x[0] === W.s && x[1] === W.e) : null;
  nodes.push(h('p', {class: 'wy-lv'}, h('span', {text: '같은 때 모든 회사 가운데 값 '}), pctB(mr && Number.isFinite(mr[2]) ? mr[2] : null),
    ...(mr && mr[3] > 0 ? [h('span', {text: ' · '}), h('span', {class: 'num', text: `${Number(mr[3]).toLocaleString('ko-KR')}곳`})] : [])));
  return nodes;
}
/** 그날 정한 대로 했나 — 그 기록에 남김(지우지 않음 · 다른 기록은 그대로) · 남겼나 */
function keep(r, yes) {
  const v = {a: yes ? 'yes' : 'no', at: new Date().toISOString()};
  r.kept = v;
  try {
    const all = records(), k = all.findIndex(x => x && typeof x === 'object' && x.at === r.at && (x.code ?? null) === (r.code ?? null));
    if (k < 0) return false;
    all[k] = {...all[k], kept: v}; localStorage.setItem(KEY, JSON.stringify(all)); return true;
  } catch { return false; }
}
/** 한 달 지났나 — 날짜 줄(days.json)로 장 스무 번이 지났거나, 달력으로 서른 날이 지났으면(B20 · 2026-10-22 총정리: 사이트 자료가 멈춰도 물음은 옴 · 값은 자료가 오면 붙임) · {due, W} */
async function dueOf(r) {
  let W = null; try { W = await windowOf(r); } catch (e) { console.error(e); }
  const cal = Number.isFinite(Date.parse(r.at)) && (Date.now() - Date.parse(r.at)) / 864e5 >= 30;
  return {due: W?.e ? true : cal, W};
}
let keptHook = null; // 매매일지 화면 맨 위 「한 달 전 약속」 칸 — 기록 줄에서 답해도 그 칸을 다시 셈(두 번 묻지 않게 · B17)
/** 한 달 지났고 아직 답하지 않은 기록(모든 기록 — 서른 줄 밖도 · 가장 오래된 것부터 · B17 + B18) */
async function dueList() {
  const out = [];
  for (const r of records()) {
    if (!fullRec(r) || r.kept?.a === 'yes' || r.kept?.a === 'no') continue;
    try { if ((await dueOf(r)).due) out.push(r); } catch (e) { console.error(e); }
  }
  return out.sort((a, b) => (Date.parse(a.at) || 0) - (Date.parse(b.at) || 0));
}
/** 매매일지 맨 위 「한 달 전 약속」 칸(B17 · 2026-10-22 총정리 · 본질 ③) — 결: 머리(그날 · 종목) → 기: 그 기록의 두 줄 + 「그날 정한 대로 했어?」 → 승: 답하면 다음 약속 · 다 하면 한 줄 → 전: 남은 약속 수
    답은 기록 줄과 같은 keep() · tally()(두 번 세지 않음) · 값은 아래 기록 줄에서(「먼저 묻고 값은 뒤」 그대로) · onKept = 답한 뒤(아래 목록을 다시 그림) */
function dueSection(list0, onKept) {
  const box = h('section', {class: 'wy-due', 'aria-label': '한 달 전 약속'});
  let did = 0;
  const paint = (L, focus) => {
    if (!L.length) {
      if (!did) { box.hidden = true; box.replaceChildren(); return; }
      const done = h('p', {class: 'wy-kd', tabindex: '-1', text: '적었어요. 아래 기록에서 한 달 뒤 값을 봐요.'});
      box.hidden = false; box.replaceChildren(done); if (focus) done.focus({preventScroll: true});
      return;
    }
    const r = L[0], t = Date.parse(r.at), nm = r.name || r.code;
    const b1 = h('button', {class: 'wy-kb', type: 'button', text: '했어'}), b2 = h('button', {class: 'wy-kb', type: 'button', text: '안 했어'});
    const ask = yes => async () => {
      if (b1.disabled) return; b1.disabled = b2.disabled = true; // 두 번 누름 — 한 번만 셈
      keep(r, yes); tally(yes ? 'promise_yes' : 'promise'); did++;
      await refresh(true);
      try { onKept?.(); } catch (e) { console.error(e); }
    };
    b1.addEventListener('click', ask(true)); b2.addEventListener('click', ask(false));
    box.hidden = false;
    box.replaceChildren(
      h('h2', {class: 'wy-dh'}, h('span', {text: '한 달 전 약속'}), h('span', {text: ' · '}), h('span', {text: Number.isFinite(t) ? NX.md(seoulDay(t)) : '?'}), ...(nm ? [h('span', {text: ' '}), h('span', {class: 'wy-stn', 'data-proper': '', text: String(nm)})] : [])),
      ...(r.why || r.promise || r.bigDay ? [lines(r)] : []),
      h('p', {class: 'wy-kq', text: '그날 정한 대로 했어?'}),
      h('div', {class: 'wy-kbs', role: 'group', 'aria-label': '그날 정한 대로 했어?'}, b1, b2),
      ...(L.length > 1 ? [h('p', {class: 'wy-note', text: `한 달 지난 약속이 ${L.length - 1}개 더 있어요.`})] : []));
    if (focus) b1.focus({preventScroll: true});
  };
  const refresh = async focus => { let L = []; try { L = await dueList(); } catch (e) { console.error(e); } paint(L, focus && box.isConnected); };
  paint(list0, false);
  return {box, refresh};
}
/** 첫 화면 금빛 한 줄 「그날 정한 대로 했어?」(사장님 2026-10-19 02:03 [화면] 3) — 한 달 지났는데 아직 답하지 않은 기록이 하나라도 있나 · 셈은 매매일지 한 달 칸(laterBox)과 같음 */
export async function monthDue() {
  for (const r of records()) {
    if (!fullRec(r) || r.kept?.a === 'yes' || r.kept?.a === 'no') continue;
    if ((await dueOf(r)).due) return true;
  }
  return false;
}
/** 한 달 칸 — 아직이면 한 줄 · 지났으면 「그날 정한 대로 했어?」([5] 8) → 답한 뒤 값([5] 9) */
async function laterBox(r, out) {
  const busy = on => (on ? out.setAttribute('aria-busy', 'true') : out.removeAttribute('aria-busy')); // 셈하는 동안만 aria-busy(읽기 프로그램 · 검사가 끝난 때를 앎)
  busy(true); out.replaceChildren(h('p', {class: 'note', text: '한 달 뒤 결과를 셈하는 중…'}));
  const {due, W} = await dueOf(r);
  if (!due) { out.replaceChildren(h('p', {class: 'note', text: '한 달 뒤에 그날 정한 대로 했는지 물어요.'})); busy(false); return; }
  const showVals = async focus => {
    busy(true);
    const kd = h('p', {class: 'wy-kd', tabindex: '-1', text: r.kept?.a === 'yes' ? '그날 정한 대로 했어요.' : '그날 정한 대로 하지 않았어요.'});
    const vb = h('div', {class: 'wy-lvs'}, h('p', {class: 'note', text: '한 달 뒤 결과를 셈하는 중…'}));
    out.replaceChildren(kd, vb);
    if (focus) kd.focus({preventScroll: true}); // 누른 단추가 사라져도 읽는 자리가 이어지게
    let vals = null; try { vals = W?.e ? await laterVals(r, W) : null; } catch (e) { console.error(e); }
    const wait = W && !W.e && Array.isArray(W.D) && W.D.length && !(W.k < 0 && W.s == null) ? `? 값은 자료가 오면 붙여요(지금 ${NX.md(W.D[W.D.length - 1])}까지 받음)` : null; // 달력으로 한 달 · 날짜 줄은 아직(B20)
    vb.replaceChildren(...(vals ?? [h('p', {class: 'note', text: wait ?? '? 날짜 줄을 못 받아 값을 셈하지 못했어요.'})]));
    busy(false);
  };
  if (r.kept?.a === 'yes' || r.kept?.a === 'no') { showVals(false); return; }
  const ask = yes => () => { keep(r, yes); tally(yes ? 'promise_yes' : 'promise'); showVals(true); try { keptHook?.(); } catch (e) { console.error(e); } }; // 합계 칸 ② 약속(KD · [10] 1) — 답한 순간 한 번 · 「했어」면 promise_yes(= 답함 + 했어) · 맨 위 약속 칸도 다시 셈(B17)
  const b1 = h('button', {class: 'wy-kb', type: 'button', text: '했어'}), b2 = h('button', {class: 'wy-kb', type: 'button', text: '안 했어'});
  b1.addEventListener('click', ask(true)); b2.addEventListener('click', ask(false));
  out.replaceChildren(h('p', {class: 'wy-kq', text: '그날 정한 대로 했어?'}), h('div', {class: 'wy-kbs', role: 'group', 'aria-label': '그날 정한 대로 했어?'}, b1, b2));
  busy(false);
}
/** 「나」 칸 등 다른 화면에 붙일 기록(매매일지 화면 아래와 같은 줄) */
export function meRecords() { return recBox(false); }

export async function render(arg) {
  await Promise.all([NX.need?.('core'), NX.need?.('mkt')]); // 회사 이름 · 업종(종목 고르기 · 그날 값)
  const G = NX.gdr ? await NX.gdr() : null; // 고도리 칸 자료(/next/data/gdr.json) — 못 받으면 null
  let due0 = []; try { due0 = await dueList(); } catch (e) { console.error(e); } // 한 달 지난 약속(B17 — 모든 기록)
  let list = recBox(true), fold = null;
  const swap = f => { fold = f; const nl = recBox(true, fold); list.replaceWith(nl); list = nl; }; // 목록 다시 그림(f = 방금 끝낸 기록 — 첫 줄을 접음 · B15)
  const due = dueSection(due0, () => swap(fold));
  keptHook = () => { if (due.box.isConnected) due.refresh(false); };
  if (String(arg ?? '').trim() === 'later') // 한 달 뒤(아래 단추 둘째 · 사장님 2026-10-26 14:40 「어 넣어」 · 돌 시계 판) — 한 달 지난 약속 「그날 정한 대로 했어?」 + 지난 기록 · 질문 칸은 「왜 사?」 단추 쪽
    return {title: '한 달 뒤', nodes: [h('h1', {class: 'h', text: '한 달 뒤'}), due0.length ? due.box : h('p', {class: 'empty', text: '아직 한 달 지난 기록이 없어요.'}), list, h('p', {class: 'safe', text: josa(NAME, '는') + ' 지난 기록만 보여 줘요. 사고팔기를 권하지 않아요.'})]};
  const card = whyCard(G, {page: true, code: String(arg ?? '').trim() || null, autoFocus: !due0.length, onDone: rec => swap(rec), onAgain: () => { if (fold) swap(null); }});
  // 차례: 제목 → 한 달 전 약속(있을 때만 · 결) → 질문 칸 → 기록 → 안전 문장
  return {title: '매매일지', nodes: [h('h1', {class: 'h', text: '매매일지'}), due.box, card, list, h('p', {class: 'safe', text: josa(NAME, '는') + ' 지난 기록만 보여 줘요. 사고팔기를 권하지 않아요.'})]};
}
