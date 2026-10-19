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
     [10] 글씨 = --fs-1 ~ --fs-5 · 간격 = --sp-1 ~ --sp-3(p-why.css) */
import {NAME, josa} from './brand.js';
import {tally} from './tally.js'; // 합계 칸 신호 셋(일꾼 KD · 2026-10-18 16:39 [10] 1) — 끝냄(stop · stop_rest) · 한 달 답(promise · promise_yes) · 보내고 기다리지 않음
import {shareButtons} from './share-btn.js'; // 카톡 단추 한 곳(KB1) — 기록 줄의 종목(일꾼 KB2)
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
const fmtN = n => Math.floor(n).toLocaleString('ko-KR');
/** 적은 값 → 원(쉼표 · 「원」 · 빈칸 뺌 · 「9만」 = 90,000 · 「1억 2000만」 = 120,000,000) · 못 읽으면 0 */
const toInt = s => {
  const t = String(s ?? '').replace(/[,\s원]/g, '');
  const m = /^(?:(\d+)억)?(?:(\d+)만)?(\d*)$/.exec(t), v = m && /[억만]/.test(t) ? (+m[1] || 0) * 1e8 + (+m[2] || 0) * 1e4 + (+m[3] || 0) : Number(t.replace(/[^0-9]/g, ''));
  return Number.isSafeInteger(v) && v > 0 ? v : 0;
};
const pad = n => String(n).padStart(2, '0');
const todayIso = () => { const d = new Date(); return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`; }; // 보는 기계 날짜(날짜 고르기 칸과 같은 자)
const ymd = s => { const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(s ?? '')); return m ? `${+m[1]}년 ${+m[2]}월 ${+m[3]}일` : '?'; };
const fmtDay = iso => { const d = new Date(iso); return isNaN(d) ? '?' : `${d.getFullYear()}년 ${d.getMonth() + 1}월 ${d.getDate()}일`; };
const later = (p, ms) => Promise.race([p, new Promise(r => setTimeout(() => r(null), ms))]);
const icon = n => h('img', {src: '/media/makbi-icon.svg', alt: '', width: n, height: n});
/** 색 점 — 읽어 주는 글을 함께([9] 8 · 🟢 좋음 · 🟡 주의 · 🔴 위험) · 고르기 전에는 빈 테두리(ring · 색 없음 — [5] 1) */
const TONE = {g: '좋음', y: '주의', r: '위험'};
const dot = c => h('span', {class: 'wy-dot wy-' + c}, h('span', {class: 'wy-sr', text: TONE[c]}));
const ring = () => h('span', {class: 'wy-dot wy-n', 'aria-hidden': 'true'});
/** 내가 쓴 글 — 남의 글(쓰지 않을 말 셈 밖 · 영어로 바꾸지 않음) */
const mine = t => h('q', {class: 'wy-mine', 'data-proper': '', lang: /[가-힣]/.test(t) ? 'ko' : null, text: t});
const VTONE = {'좋아, 정해 둔 대로만': 'g', '반만 준비됐어': 'y', '오늘은 쉬어 가자': 'r'};
/** 보이는 판정 글(사장님 2026-10-19 02:03 [화면] 4 「골똘이 말(… 판정 글)은 물음으로 끝내라」) — 기록에 적는 값 · V_CODE · VTONE · 신호(tally) 셈은 위 그대로 · 화면에만 이 글 */
const VSHOW = {'좋아, 정해 둔 대로만': '좋아, 정해 둔 대로만 할까?', '반만 준비됐어': '반만 준비됐을까?', '오늘은 쉬어 가자': '오늘은 쉬어 갈까?'};
const vShow = v => VSHOW[v] ?? String(v ?? '?');
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

const PICK = -1, LINES = QS.length, RES = QS.length + 1;
/** 매매일지 칸 — 종목 고르기 → 질문 열한 개 → 두 줄 → 결과 · code = 처음부터 고른 종목(#/why/<번호> · 친구가 연 보내기 쪽) · onDone(기록, 남겼나) = 결과를 보인 뒤 */
export function whyCard(G, {page = false, code = null, onDone = null} = {}) {
  const box = h('section', {class: 'wy' + (page ? ' page' : ''), 'aria-label': '친구야, 왜 사?'});
  const live = h('p', {class: 'wy-live', 'aria-live': 'polite'});
  const ans = new Array(QS.length).fill(null);
  const S = {code: null, name: null, co: false, price: null, day: null, wait: null, why: '', sell: '', half: '', touched: false, bigDay: '', q: '', note: null};
  const pre = normCode(code), badPre = code != null && String(code).trim() !== '' && !pre;
  let i = PICK, err = '', last = null, saved = false, focusSel = null, first = true, busy = false;

  const setStock = (c, n, co) => {
    Object.assign(S, {code: c, name: n, co, price: null, day: null, wait: null, note: null, touched: false, sell: '', half: ''});
    if (!co) return;
    const p = S.wait = later(priceOf(c).catch(() => null), 6000).then(x => {
      if (S.wait !== p) return; // 그새 다른 종목을 고름
      S.wait = null;
      if (x) { S.price = x.price; S.day = x.day; if (!S.name) S.name = x.name; }
      box.querySelector('.wy-stk')?.replaceWith(stockBar());
    });
  };
  const clearStock = () => Object.assign(S, {code: null, name: null, co: false, price: null, day: null, wait: null, touched: false, sell: '', half: ''});
  const start = () => {
    ans.fill(null); Object.assign(S, {why: '', bigDay: '', q: '', note: null}); err = ''; last = null; saved = false; live.textContent = '';
    clearStock();
    if (!pre) { i = PICK; if (badPre) S.note = {nf: true}; return; }
    const o = coOf(pre);
    if (o) { setStock(pre, o.n, true); i = 0; return; }
    const known = !!NX.ix?.(); // 사이트 자료가 왔는데 회사 주식에 없음 = 펀드 · 우선주 … 또는 없는 번호 → 질문 대신 종목 고르기(까닭은 찾으면 붙임)
    i = known ? PICK : 0; if (!known) S.code = pre; // 자료가 아직이면 1번을 「받는 중」으로 열어 두고 찾음
    const p = S.wait = lookup(pre).catch(() => null).then(r => {
      if (S.wait !== p) return; // 그새 다른 종목을 고름
      S.wait = null;
      if (r?.co) { setStock(r.c, r.n, true); if (i === 0) box.querySelector('.wy-stk')?.replaceWith(stockBar()); else { i = 0; focusSel = '.wy-opt'; draw(); } return; }
      clearStock(); i = PICK; S.note = r ? {n: r.n, w: r.w} : {nf: true}; focusSel = '.wy-find'; draw();
    });
  };

  const head = () => h('div', {class: 'wy-head'}, icon(40),
    h('div', {}, h('h2', {class: 'wy-h', text: '친구야, 왜 사?'}), h('p', {class: 'wy-sub', text: `사기 전에 ${josa(NAME, '랑')} 내 이유를 확인해요.`})));
  /** 고른 종목 한 줄 — 이름 · 그날 값 · 그 날짜(값을 받는 동안 · 못 받으면 「?」) */
  const stockBar = () => {
    if (!S.code) return h('p', {class: 'wy-stk', hidden: true});
    const v = S.price != null ? [h('b', {class: 'num', text: won(S.price)}), h('span', {text: ` · ${NX.md(S.day)} 종가`})]
      : [h('span', {class: 'wy-qm', text: S.wait ? '그날 값 받는 중…' : '? 그날 값 없음'})];
    return h('p', {class: 'wy-stk'}, h('span', {class: 'wy-stn', 'data-proper': '', text: S.name || S.code}), h('span', {class: 'wy-stv'}, ...v));
  };
  const btn = (cls, text, fn) => { const b = h('button', {class: cls, type: 'button', text}); b.addEventListener('click', fn); return b; };
  const BACK = '‹ 앞 질문'; // [5] 4 — 「앞으로」는 거꾸로 읽힘
  const goBack = () => { if (busy) return; i--; err = ''; live.textContent = ''; focusSel = i === PICK ? '.wy-find' : '.wy-opt.on'; draw(); if (i === PICK) keepTop(); else keepQ(); };
  const keepTop = () => { const r = box.getBoundingClientRect(); if (r.top < 0) window.scrollBy(0, r.top - 70); }; // 길게 내려 본 뒤 다음 화면이 위에서 시작하게
  /** 답 셋이 화면 안에 오게([5] 3 — 한 번 누르면 다음 질문 · 위 막대와 아래 단추 줄을 피함) · 맨 위(앞 답 한마디 · 없으면 칸 머리)는 위 막대 밑까지만 올림 */
  const keepQ = () => {
    const topY = Math.max(0, document.querySelector('header.top')?.getBoundingClientRect().bottom ?? 0) + 8;
    const botY = Math.min(window.innerHeight, document.querySelector('nav.tabs')?.getBoundingClientRect().top ?? window.innerHeight) - 8;
    const t = (box.querySelector('.wy-prev') ?? box).getBoundingClientRect().top, last = box.querySelector('.wy-opts > :last-child');
    if (t < topY) { window.scrollBy(0, t - topY); return; }
    const over = last ? last.getBoundingClientRect().bottom - botY : 0;
    if (over > 0) window.scrollBy(0, Math.min(over, t - topY));
  };

  /* ① 종목 고르기 */
  const ONLY_CO = '회사 주식만 매매일지에 적어요.';
  /** 찾은 줄 하나 — 회사 주식은 누르면 질문으로 · 펀드 · 우선주 …는 누르지 않고 까닭 한 줄(찾기와 같은 글 w) */
  const hitRow = x => {
    if (!isCo(x.c, x.k)) return h('div', {class: 'wy-xrow', 'data-code': x.c}, h('span', {class: 'nm', 'data-proper': '', text: x.n}), h('small', {text: x.w || ONLY_CO}));
    const o = coOf(x.c);
    const b = h('button', {class: 'wy-hit', type: 'button', 'data-code': x.c}, h('span', {class: 'nm', 'data-proper': '', text: x.n}), h('small', {text: `${o?.i || '?'} · ${x.c}`}));
    b.addEventListener('click', () => choose(x));
    return b;
  };
  const choose = x => { setStock(x.c, x.n, true); i = 0; err = ''; S.note = null; focusSel = '.wy-opt'; draw(); keepQ(); };
  const recent = () => {
    const X = NX.ix?.(), hist = (NX.store?.get('atlas:new:hist', []) ?? []).filter(c => typeof c === 'string' && X?.co?.[c]).slice(0, 3);
    if (!hist.length) return [h('p', {class: 'wy-note', text: '이름 한 글자부터 찾아요. 첫 글자(ㅅㅅㅈㅈ)와 번호도 돼요.'})];
    return [h('p', {class: 'wy-note', text: '최근 본 회사'}), ...hist.map(c => hitRow({c, n: X.co[c].n, k: 'c'}))];
  };
  const pickView = () => {
    const inp = h('input', {class: 'wy-find', type: 'search', value: S.q, placeholder: '회사 이름이나 번호', 'aria-label': '종목 찾기', autocomplete: 'off', enterkeyhint: 'go'});
    const hits = h('div', {class: 'wy-hits'});
    let seq = 0;
    const run = async () => {
      const q = inp.value.trim(), my = ++seq; S.q = inp.value;
      if (!q) { hits.replaceChildren(...recent()); hits.dataset.q = ''; return; }
      const all = await match(q); if (my !== seq) return;
      const top = all.slice(0, 6), xs = top.some(x => !isCo(x.c, x.k));
      hits.replaceChildren(...(top.length ? [...top.map(hitRow), ...(xs ? [h('p', {class: 'wy-note', text: ONLY_CO})] : [])] : [h('p', {class: 'wy-note', text: `「${q}」 — 찾는 종목이 없어요. 첫 글자(ㅅㅅㅈㅈ)나 번호로도 찾아보세요.`})]));
      hits.dataset.q = q; // 이 줄들이 어느 말로 찾은 것인지(늦게 온 앞 결과와 섞이지 않게)
    };
    inp.addEventListener('input', run);
    inp.addEventListener('keydown', async e => { // 엔터 = 맨 위 줄이 회사 주식이면 그 종목(누름 하나 줄임)
      if (e.key !== 'Enter' || e.isComposing) return;
      e.preventDefault(); const q = inp.value.trim(); if (!q) return;
      const top = (await match(q))[0]; if (top && isCo(top.c, top.k) && i === PICK) choose(top);
    });
    run();
    const note = S.note?.nf ? [h('p', {class: 'wy-err', role: 'alert', text: '? 이 번호의 종목을 찾지 못했어요. 이름으로 찾아 줘.'})]
      : S.note ? [h('p', {class: 'wy-err', role: 'alert'}, h('span', {text: '? '}), h('span', {class: 'nm', 'data-proper': '', text: S.note.n}), h('span', {text: ' — ' + ONLY_CO})), ...(S.note.w ? [h('p', {class: 'wy-note wy-xw', text: S.note.w})] : [])] : [];
    return [h('p', {class: 'wy-step', text: '종목 고르기'}), h('h3', {class: 'wy-q', text: '어떤 종목이야?'}), ...note, inp, hits];
  };

  /* ② 질문 하나 */
  const dateRow = () => {
    const d = h('input', {class: 'wy-date', type: 'date', min: todayIso(), value: S.bigDay, required: true});
    const set = () => { S.bigDay = d.value; if (err) { err = ''; box.querySelector('.wy-err')?.remove(); } };
    d.addEventListener('input', set); d.addEventListener('change', set);
    return h('label', {class: 'wy-dl'}, h('span', {text: '그 일이 언제야?'}), d);
  };
  /** 다음 장으로([5] 3 — 답 한 번이면 넘어감) · 마지막 답 뒤에는 「마지막 두 줄」(팔 선 기본값은 그날 값으로 — 값을 받는 중이면 기다림) */
  const advance = async () => {
    if (i === QS.length - 1 && S.wait) { busy = true; box.setAttribute('aria-busy', 'true'); try { await S.wait; } finally { busy = false; box.removeAttribute('aria-busy'); } }
    i++; err = '';
    if (i === LINES && !S.touched) { S.sell = S.price ? fmtN(sellOf(S.price)) : ''; S.half = S.price ? fmtN(halfOf(S.price)) : ''; }
    focusSel = i === LINES ? '.wy-why' : ans[i] != null ? '.wy-opt.on' : '.wy-opt';
    draw(); keepQ();
  };
  /** 3번 「클 일이 있다」의 다음 — 날짜를 받아야 넘어감([3] 3) */
  const onNext = async () => {
    if (busy) return;
    if (i === BIG_Q && ans[i] === BIG_A) {
      const v = S.bigDay;
      if (!/^\d{4}-\d{2}-\d{2}$/.test(v)) { err = '그 일이 언제인지 날짜를 적어 줘.'; focusSel = '.wy-date'; draw(); return; }
      if (v < todayIso()) { err = '오늘이나 그 뒤 날짜를 적어 줘.'; focusSel = '.wy-date'; draw(); return; }
    }
    await advance();
  };
  /** 답 하나를 누름 — 한마디는 읽어 주는 칸에 · 3번 「클 일이 있다」면 이 장에 남아 날짜 칸 · 그 밖은 바로 다음 장 */
  const pickAns = async k => {
    if (busy) return;
    const Q = QS[i]; ans[i] = k; err = ''; live.textContent = `${NAME}: ${Q.a[k][2]}`;
    if (i === BIG_Q && k === BIG_A) { focusSel = S.bigDay ? '.wy-next' : '.wy-date'; draw(); return; }
    await advance();
  };
  /** 고른 답의 한마디 — 고른 뒤라 색 점(+ 읽어 주는 글)을 보임 · 3번 「클 일이 있다」는 같은 장에서(날짜 칸 위) */
  const oneLine = (q, k) => h('p', {class: 'wy-one'}, icon(28), dot(QS[q].a[k][0]), h('span', {class: 'wy-onet', text: QS[q].a[k][2]}));
  /** 앞 답의 한마디 + 격언 — 다음 장 맨 위(머리 바로 밑 · [5] 3) · 머리에 그림이 있어 한 칸에 점 · 글만(좁은 화면에서 줄이 덜 늘게) */
  const prevBox = () => {
    const q = i - 1, k = q >= 0 ? ans[q] : null;
    if (k == null) return [];
    return [h('div', {class: 'wy-prev'}, h('p', {class: 'wy-one'}, dot(QS[q].a[k][0]), h('span', {class: 'wy-onet', text: QS[q].a[k][2]})),
      h('p', {class: 'wy-say'}, h('span', {class: 'wy-sayk', text: '격언 '}), h('q', {'data-proper': '', text: QS[q].say})))];
  };
  const qView = () => {
    const Q = QS[i], k0 = ans[i];
    const opts = h('div', {class: 'wy-opts', role: 'group', 'aria-label': Q.q});
    Q.a.forEach(([c, t], k) => { // [5] 1 — 고르기 전에는 색을 숨김(빈 테두리) · 고른 답(앞 질문으로 돌아왔을 때)만 색
      const b = h('button', {class: 'wy-opt' + (k0 === k ? ' on' : ''), type: 'button', 'aria-pressed': String(k0 === k)}, k0 === k ? dot(c) : ring(), h('span', {class: 'wy-ot', text: t}));
      b.addEventListener('click', () => pickAns(k));
      opts.append(b);
    });
    const big = i === BIG_Q && k0 === BIG_A;
    const nodes = [h('p', {class: 'wy-step num', text: `${i + 1} / ${QS.length}`}), h('h3', {class: 'wy-q', text: `${i + 1}. ${Q.q}`}), opts];
    if (big) nodes.push(oneLine(i, k0), dateRow());
    if (err) nodes.push(h('p', {class: 'wy-err', role: 'alert', text: err}));
    nodes.push(h('div', {class: 'wy-nav'}, btn('wy-back', BACK, goBack), big ? btn('wy-next', '다음 ›', onNext) : null));
    return nodes;
  };

  /* ③ 두 줄 — ① 1년 뒤 반토막 났다면 왜? ② 팔 약속(만약 ~이면 ~한다) */
  const quickWords = () => [['이익이 줄어서', '클 일이 안 일어나서', '그냥 산 거라서'][ans[BIG_Q]] ?? '이익이 줄어서', '업종이 식어서', '시장 전체가 내려서'];
  const submit = () => {
    const why = S.why.trim(), sell = toInt(S.sell), half = toInt(S.half);
    if (!why) { err = '① 한 줄만 적어 줘. 아래 말을 눌러도 돼.'; focusSel = '.wy-why'; draw(); return; }
    if (!sell || !half) { err = '② 팔 선 두 숫자를 적어 줘.'; focusSel = sell ? '.wy-half' : '.wy-sell'; draw(); return; }
    if (sell >= half) { err = '② 앞 숫자가 뒤 숫자보다 작아야 해.'; focusSel = '.wy-sell'; draw(); return; }
    finish(why, sell, half);
  };
  const linesView = () => {
    const why = h('input', {class: 'wy-why', type: 'text', value: S.why, maxlength: '60', placeholder: '한 줄로 적어 봐', 'aria-label': '1년 뒤 반토막 났다면 왜?', autocomplete: 'off', enterkeyhint: 'done'});
    why.addEventListener('input', () => { S.why = why.value; });
    why.addEventListener('keydown', e => { if (e.key === 'Enter' && !e.isComposing) { e.preventDefault(); submit(); } });
    const quick = h('div', {class: 'wy-quick'}, ...quickWords().map(t => btn('wy-chip', t, ev => { const v = ev.currentTarget.textContent || t; S.why = v; why.value = v; why.focus({preventScroll: true}); }))); // 보이는 글 그대로(영어로 볼 때는 영어)
    const num = (cls, key, label) => {
      const x = h('input', {class: 'wy-num num ' + cls, type: 'text', inputmode: 'numeric', maxlength: '13', value: S[key], autocomplete: 'off', 'aria-label': label});
      x.addEventListener('input', () => { S[key] = x.value; S.touched = true; });
      x.addEventListener('blur', () => { const v = toInt(x.value); if (v) { x.value = fmtN(v); S[key] = x.value; } });
      x.addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); submit(); } });
      return x;
    };
    return [h('p', {class: 'wy-step', text: '마지막 두 줄'}),
      h('h3', {class: 'wy-q', text: '① 1년 뒤 반토막 났다면 왜?'}), why, quick,
      h('h3', {class: 'wy-q', text: '② 팔 약속'}),
      h('p', {class: 'wy-pr'}, h('span', {class: 'wy-prn'}, h('span', {text: '만약'}), num('wy-sell', 'sell', '팔 선(원)'), h('span', {text: '원'})), h('span', {text: '아래로 가면 다 판다.'})),
      h('p', {class: 'wy-pr'}, h('span', {class: 'wy-prn'}, h('span', {text: '만약'}), num('wy-half', 'half', '절반 팔 선(원)'), h('span', {text: '원'})), h('span', {text: '위로 가면 절반 판다.'})),
      h('p', {class: 'wy-note', text: '틀린 것도 지우지 않아요. 한 달이 지나면 그날 정한 대로 했는지 먼저 묻고, 그 뒤 값을 같은 때 코스피와 모든 회사 가운데 값과 함께 붙여요.'}),
      h('p', {class: 'wy-note', text: S.price ? `그날 값 ${won(S.price)}에서 열에 하나 내린 값과 열에 둘 오른 값이에요. 고쳐도 돼.` : '? 그날 값이 없어요. 두 숫자를 직접 적어 줘.'}),
      ...(err ? [h('p', {class: 'wy-err', role: 'alert', text: err})] : []),
      h('div', {class: 'wy-nav'}, btn('wy-back', BACK, goBack), btn('wy-next', '결과 보기 ›', submit))];
  };

  /* ④ 결과 · 기록 */
  const finish = (why, sell, half) => {
    const J = judge(ans);
    last = {at: new Date().toISOString(), asOf: G?.asOf ?? null, code: S.code, name: S.name, price: S.price, day: S.day,
      answers: [...ans], score: J.score, reds: J.reds, verdict: J.verdict, groups: J.groups,
      bigDay: ans[BIG_Q] === BIG_A ? S.bigDay : null, why,
      promise: {sell, half, text: `만약 ${won(sell)} 아래로 가면 다 판다. 만약 ${won(half)} 위로 가면 절반 판다.`},
      picks: (G?.picks ?? []).map(p => ({code: p.code, name: p.name, price: p.price, w: p.w}))};
    saved = save(last); doneNow = true; lastRec = last;
    i = RES; err = ''; draw(); keepTop();
    if (typeof onDone === 'function') { try { onDone(last, saved); } catch (e) { console.error(e); } }
    offerOnce(); // [2] 7 — 결과가 처음 보인 뒤 한 번(일꾼 K2c 의 NX.kakao · 꺼져 있거나 없으면 아무 일 없음)
    tally(V_CODE[J.verdict] === 'rest' ? 'stop_rest' : 'stop'); // 합계 칸 ① 멈춤(KD · [10] 1) — 끝낸 순간 한 번 · 「오늘은 쉬어 가자」면 stop_rest(= 끝냄 + 쉬어 가자)
  };
  const resView = () => {
    const J = last, ready = readyOf(J), tone = VTONE[J.verdict];
    live.textContent = `${vShow(J.verdict)} · 준비 ${ready} / ${MAX}`;
    const tt = h('i', {class: 'wy-fill wy-' + tone}); tt.style.setProperty('width', Math.round(ready / MAX * 100) + '%');
    return h('div', {class: 'wy-res'}, // [5] 2 — 판정 글이 가장 큼 · 준비는 그 밑에 작게
      h('p', {class: 'wy-verdict wy-v' + tone}, icon(32), h('b', {text: `「${vShow(J.verdict)}」`})),
      ...(stopOf(J.answers) ? [h('p', {class: 'wy-stop', text: '빌린 돈이나 곧 쓸 돈이면 점수와 상관없이 쉬어 가요.'})] : []),
      h('p', {class: 'wy-score'}, h('span', {text: '준비 '}), h('b', {class: 'num', text: String(ready)}), h('span', {class: 'num', text: ` / ${MAX}`}),
        h('span', {class: 'wy-reds'}, h('span', {text: ' · '}), dot('r'), h('span', {class: 'num', text: ` ${J.reds}개`}))),
      h('span', {class: 'wy-track wy-tt', 'aria-hidden': 'true'}, tt),
      bars(J.groups),
      h('p', {class: 'wy-note', text: '막대가 짧은 묶음을 한 번 더 생각해 봐.'}),
      lines(J),
      h('p', {class: 'wy-note', text: saved ? (page ? '오늘 답을 아래 매매일지에 날짜와 함께 쌓았어요.' : '오늘 답을 매매일지에 날짜와 함께 쌓았어요.') : '이 기기는 기록을 남길 수 없어요. 답은 이 화면에만 있어요.'}),
      h('div', {class: 'wy-nav'}, btn('wy-next', '다시 하기', () => { start(); focusSel = i === PICK ? '.wy-find' : '.wy-opt'; draw(); keepTop(); }),
        page ? null : h('a', {class: 'wy-link', href: '#/why', text: '매매일지 보기 ›'})));
  };

  const draw = () => {
    const nodes = [head()];
    if (i === PICK) nodes.push(...pickView());
    else if (i < LINES) nodes.push(...prevBox(), stockBar(), ...qView()); // [5] 3 앞 답 한마디 = 머리 바로 밑(맨 위) · 읽어 주는 칸은 누른 때만 바꿈(앞 답 한마디가 다음 장에서도 읽히게)
    else if (i === LINES) nodes.push(...prevBox(), stockBar(), ...linesView());
    else nodes.push(stockBar(), resView());
    nodes.push(live);
    box.replaceChildren(...nodes);
    if (first) { first = false; if (page && i === PICK) setTimeout(() => box.querySelector('.wy-find')?.focus({preventScroll: true}), 60); } // 매매일지 화면은 찾기 칸에 바로 씀
    else if (focusSel) box.querySelector(focusSel)?.focus({preventScroll: true});
    focusSel = null;
  };
  start(); draw();
  return box;
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
    here = 매매일지 화면(위에 질문 칸이 있음) */
function recBox(here) {
  const list = records().filter(r => r && typeof r === 'object'), box = h('section', {class: 'wy-me', 'aria-label': '왜 사? 기록'}); // 깨진 줄은 그리기에서만 건너뜀(지우지 않음)
  box.append(h('h2', {class: 'sec', text: `왜 사? 기록 ${list.length}번`}));
  if (!list.length) { box.append(h('p', {class: 'note', text: here ? '아직 기록이 없어요. 위 질문에 답하면 날짜와 함께 여기 쌓여요.' : '아직 기록이 없어요. 매매일지에서 「친구야, 왜 사?」에 답하면 날짜와 함께 여기 쌓여요.'})); return box; }
  box.append(h('p', {class: 'note', text: '틀린 것도 지우지 않아요. 한 달이 지나면 그날 정한 대로 했는지 먼저 묻고, 그 뒤 값을 같은 때 코스피와 모든 회사 가운데 값과 함께 붙여요.'}));
  for (const r of list.slice(0, 30)) {
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
    box.append(row);
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
/** 한 달(장 스무 번) 지났나 — 날짜 줄(days.json)로 셈 · 날짜 줄을 못 받으면 달력 28일 · {due, W} */
async function dueOf(r) {
  let W = null; try { W = await windowOf(r); } catch (e) { console.error(e); }
  const calOld = Number.isFinite(Date.parse(r.at)) && (Date.now() - Date.parse(r.at)) / 864e5 >= 28;
  return {due: W ? !!W.e : calOld, W};
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
    vb.replaceChildren(...(vals ?? [h('p', {class: 'note', text: '? 날짜 줄을 못 받아 값을 셈하지 못했어요.'})]));
    busy(false);
  };
  if (r.kept?.a === 'yes' || r.kept?.a === 'no') { showVals(false); return; }
  const ask = yes => () => { keep(r, yes); tally(yes ? 'promise_yes' : 'promise'); showVals(true); }; // 합계 칸 ② 약속(KD · [10] 1) — 답한 순간 한 번 · 「했어」면 promise_yes(= 답함 + 했어)
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
  let list = recBox(true);
  const card = whyCard(G, {page: true, code: String(arg ?? '').trim() || null, onDone: () => { const nl = recBox(true); list.replaceWith(nl); list = nl; }});
  return {title: '매매일지', nodes: [h('h1', {class: 'h', text: '매매일지'}), card, list, h('p', {class: 'safe', text: josa(NAME, '는') + ' 지난 기록만 보여 줘요. 사고팔기를 권하지 않아요.'})]};
}
