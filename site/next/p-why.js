/* 고도리 — 매매일지 「친구야, 왜 사?」(사장님 2026-10-17(싱가포르) 21:10 「하나로 묶은 명령문」 [3] 1 · 3 ~ 7 · 9 · [6] 1 열쇠 · 앞 판 17:54 「한 장 명령문」 명령 2 ~ 6 · 13)
   흐름(1분 안 · 큰 단추 · 누름 적게): ① 종목 고르기(찾기와 같은 잣대 NX.findReady → NX.findMatch · 회사 주식만 고름 · 펀드 · 우선주 …는 까닭 한 줄 · 엔터 = 맨 위 회사) → 그날 값(co/<번호>.json c.price · c.priceDate)
     ② 질문 열한 개(한 화면에 하나 · 답마다 고도리 한마디 한 줄 · 3번 「클 일이 있다」면 그 일이 있는 날짜)
     ③ 두 줄(① 1년 뒤 반토막 났다면 왜? ② 팔 약속 「만약 ~이면 ~한다」 — 팔 선 = 그날 값 × 0.9 · 절반 팔 선 = × 1.2 · 원 아래 버림 · gdr.json 과 같은 셈 · 고쳐도 됨)
     ④ 결과(점수 0 ~ 22 · 🔴 수 · 네 묶음 막대 · 판정) → 기록(atlas:godori-why · 이 기기에만 · 옛 기록도 그대로 읽음)
   내보냄: whyCard(G, {page, code, onDone}) · render(arg) = #/why · #/why/<번호> · records() · meRecords() · doneOnce() · QS · GROUPS · judge · sellOf · halfOf
   기록 한 줄: {at, asOf, code, name, price, day, answers, score, reds, verdict, groups, bigDay, why, promise: {sell, half, text}, picks} · 지우는 단추 없음(규칙 77 · 명령 13 「틀린 것도 지우지 마라」)
   질문 · 답 · 격언은 사장님 글 그대로(격언 = data-proper) · 회사 이름 · 내가 쓴 글도 남의 글(data-proper) · 이름은 brand.js 한 곳(규칙 76) · 글은 textContent 로만(보안 규칙) */
import {NAME, josa} from './brand.js';
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
/** 점수 · 🔴 수 · 묶음 · 판정(명령 6) — ans = 답 자리(0 ~ 2) 열한 개 */
export function judge(ans) {
  const pts = ans.map((k, i) => PT[QS[i].a[k][0]]);
  const score = pts.reduce((s, x) => s + x, 0), reds = pts.filter(x => x === 2).length;
  const groups = Object.fromEntries(GROUPS.map(([n, qs]) => [n, qs.reduce((s, q) => s + pts[q - 1], 0)]));
  const verdict = score >= 12 || reds >= 4 ? '오늘은 쉬어 가자' : score >= 6 ? '반만 준비됐어' : '좋아, 정해 둔 대로만';
  return {score, reds, groups, verdict};
}
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
/** 열한 질문을 끝낸 적이 있나 — 고도리 칸 문([6] 1 · 일꾼 D) */
export function doneOnce() { return doneNow || records().some(fullRec); }

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
const dot = c => h('span', {class: 'wy-dot wy-' + c, 'aria-hidden': 'true'});
/** 내가 쓴 글 — 남의 글(쓰지 않을 말 셈 밖 · 영어로 바꾸지 않음) */
const mine = t => h('q', {class: 'wy-mine', 'data-proper': '', lang: /[가-힣]/.test(t) ? 'ko' : null, text: t});
const VTONE = {'좋아, 정해 둔 대로만': 'g', '반만 준비됐어': 'y', '오늘은 쉬어 가자': 'r'};
/** 묶음 막대 넷 — 묶음 점수 ÷ 묶음 최대(점수가 낮을수록 준비된 것) */
function bars(groups, small) {
  return h('div', {class: 'wy-bars' + (small ? ' sm' : '')}, ...GROUPS.map(([n, qs]) => {
    const max = qs.length * 2, v = groups?.[n] ?? 0, fill = h('i', {class: 'wy-fill wy-' + (v === 0 ? 'g' : v * 2 >= max ? 'r' : 'y')});
    fill.style.setProperty('width', Math.round(v / max * 100) + '%');
    return h('div', {class: 'wy-bar'}, h('span', {class: 'wy-bn', text: n}), h('span', {class: 'wy-track', 'aria-hidden': 'true'}, fill), h('b', {class: 'num', text: `${v} / ${max}`}));
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
  let i = PICK, err = '', last = null, saved = false, focusSel = null, first = true;

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
  const goBack = () => { i--; err = ''; live.textContent = ''; focusSel = i === PICK ? '.wy-find' : '.wy-opt.on'; draw(); keepTop(); };
  const keepTop = () => { const r = box.getBoundingClientRect(); if (r.top < 0) window.scrollBy(0, r.top - 70); }; // 길게 내려 본 뒤 다음 화면이 위에서 시작하게

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
  const choose = x => { setStock(x.c, x.n, true); i = 0; err = ''; S.note = null; focusSel = '.wy-opt'; draw(); keepTop(); };
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
  const onNext = async ev => {
    if (i === BIG_Q && ans[i] === BIG_A) { // [3] 3 — 「클 일이 있다」면 날짜를 받아야 다음으로
      const v = S.bigDay;
      if (!/^\d{4}-\d{2}-\d{2}$/.test(v)) { err = '그 일이 언제인지 날짜를 적어 줘.'; focusSel = '.wy-date'; draw(); return; }
      if (v < todayIso()) { err = '오늘이나 그 뒤 날짜를 적어 줘.'; focusSel = '.wy-date'; draw(); return; }
    }
    if (i === QS.length - 1 && S.wait) { const b = ev.currentTarget; b.disabled = true; b.textContent = '값 받는 중…'; await S.wait; } // 팔 선 기본값은 그날 값으로
    i++; err = ''; live.textContent = '';
    if (i === LINES && !S.touched) { S.sell = S.price ? fmtN(sellOf(S.price)) : ''; S.half = S.price ? fmtN(halfOf(S.price)) : ''; }
    focusSel = i === LINES ? '.wy-why' : ans[i] != null ? '.wy-next' : '.wy-opt';
    draw(); keepTop();
  };
  const qView = () => {
    const Q = QS[i], k0 = ans[i];
    const opts = h('div', {class: 'wy-opts', role: 'group', 'aria-label': Q.q});
    Q.a.forEach(([c, t], k) => {
      const b = h('button', {class: 'wy-opt' + (k0 === k ? ' on' : ''), type: 'button', 'aria-pressed': String(k0 === k)}, dot(c), h('span', {text: t}));
      b.addEventListener('click', () => { ans[i] = k; err = ''; live.textContent = `${NAME}: ${Q.a[k][2]}`; focusSel = i === BIG_Q && k === BIG_A && !S.bigDay ? '.wy-date' : '.wy-next'; draw(); });
      opts.append(b);
    });
    const nodes = [h('p', {class: 'wy-step num', text: `${i + 1} / ${QS.length}`}), h('h3', {class: 'wy-q', text: `${i + 1}. ${Q.q}`}), opts];
    live.textContent = k0 != null ? `${NAME}: ${Q.a[k0][2]}` : ''; // 읽어 주는 칸 — 고른 답의 한마디(앞으로 돌아와도)
    if (k0 != null) {
      nodes.push(h('p', {class: 'wy-one'}, icon(28), h('span', {text: Q.a[k0][2]})),
        h('p', {class: 'wy-say'}, h('span', {class: 'wy-sayk', text: '격언 '}), h('q', {'data-proper': '', text: Q.say})));
      if (i === BIG_Q && k0 === BIG_A) nodes.push(dateRow());
    }
    if (err) nodes.push(h('p', {class: 'wy-err', role: 'alert', text: err}));
    nodes.push(h('div', {class: 'wy-nav'}, btn('wy-back', '‹ 앞으로', goBack), k0 != null ? btn('wy-next', '다음 ›', onNext) : null));
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
      h('p', {class: 'wy-note', text: S.price ? `그날 값 ${won(S.price)}에서 열에 하나 내린 값과 열에 둘 오른 값이에요. 고쳐도 돼.` : '? 그날 값이 없어요. 두 숫자를 직접 적어 줘.'}),
      ...(err ? [h('p', {class: 'wy-err', role: 'alert', text: err})] : []),
      h('div', {class: 'wy-nav'}, btn('wy-back', '‹ 앞으로', goBack), btn('wy-next', '결과 보기 ›', submit))];
  };

  /* ④ 결과 · 기록 */
  const finish = (why, sell, half) => {
    const J = judge(ans);
    last = {at: new Date().toISOString(), asOf: G?.asOf ?? null, code: S.code, name: S.name, price: S.price, day: S.day,
      answers: [...ans], score: J.score, reds: J.reds, verdict: J.verdict, groups: J.groups,
      bigDay: ans[BIG_Q] === BIG_A ? S.bigDay : null, why,
      promise: {sell, half, text: `만약 ${won(sell)} 아래로 가면 다 판다. 만약 ${won(half)} 위로 가면 절반 판다.`},
      picks: (G?.picks ?? []).map(p => ({code: p.code, name: p.name, price: p.price, w: p.w}))};
    saved = save(last); doneNow = true;
    i = RES; err = ''; draw(); keepTop();
    if (typeof onDone === 'function') { try { onDone(last, saved); } catch (e) { console.error(e); } }
  };
  const resView = () => {
    const J = last;
    live.textContent = `점수 ${J.score} / 22 · ${J.verdict}`;
    return h('div', {class: 'wy-res'},
      h('p', {class: 'wy-score'}, h('span', {text: '점수 '}), h('b', {class: 'num', text: String(J.score)}), h('span', {class: 'num', text: ' / 22'}), h('span', {class: 'wy-reds', text: ` · 🔴 ${J.reds}개`})),
      h('p', {class: 'wy-verdict wy-v' + VTONE[J.verdict]}, icon(32), h('b', {text: `「${J.verdict}」`})),
      bars(J.groups),
      h('p', {class: 'wy-note', text: '점수가 낮을수록 준비된 거예요. 막대가 길면 그 묶음을 한 번 더 생각해 봐.'}),
      lines(J),
      h('p', {class: 'wy-note', text: saved ? (page ? '오늘 답을 아래 매매일지에 날짜와 함께 쌓았어요.' : '오늘 답을 매매일지에 날짜와 함께 쌓았어요.') : '이 기기는 기록을 남길 수 없어요. 답은 이 화면에만 있어요.'}),
      h('div', {class: 'wy-nav'}, btn('wy-next', '다시 하기', () => { start(); focusSel = i === PICK ? '.wy-find' : '.wy-opt'; draw(); keepTop(); }),
        page ? null : h('a', {class: 'wy-link', href: '#/why', text: '매매일지 보기 ›'})));
  };

  const draw = () => {
    const nodes = [head()];
    if (i === PICK) nodes.push(...pickView());
    else if (i < LINES) nodes.push(stockBar(), ...qView());
    else if (i === LINES) nodes.push(stockBar(), ...linesView());
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

/** 쌓인 기록(새 것부터 · 서른 줄까지) — 종목 · 그날 값 · 두 줄 · 점수 · 막대 · 한 달 지난 기록은 그날 고도리 칸이 그 뒤 얼마나 움직였는지(같은 기간 코스피와 함께 — [6] 3) · 지우는 단추 없음
    here = 매매일지 화면(위에 질문 칸이 있음) */
function recBox(here) {
  const list = records().filter(r => r && typeof r === 'object'), box = h('section', {class: 'wy-me', 'aria-label': '왜 사? 기록'}); // 깨진 줄은 그리기에서만 건너뜀(지우지 않음)
  box.append(h('h2', {class: 'sec', text: `왜 사? 기록 ${list.length}번`}));
  if (!list.length) { box.append(h('p', {class: 'note', text: here ? '아직 기록이 없어요. 위 질문에 답하면 날짜와 함께 여기 쌓여요.' : '아직 기록이 없어요. 매매일지에서 「친구야, 왜 사?」에 답하면 날짜와 함께 여기 쌓여요.'})); return box; }
  box.append(h('p', {class: 'note', text: `틀린 것도 지우지 않아요. 한 달이 지나면 그날 ${NAME} 칸 회사들이 그 뒤 얼마나 움직였는지 같은 기간 코스피와 함께 붙여요.`}));
  for (const r of list.slice(0, 30)) {
    const row = h('div', {class: 'wy-rec'},
      h('p', {class: 'wy-rh'}, h('b', {text: fmtDay(r.at)}), h('span', {class: 'num', text: ` · 점수 ${r.score} / 22`}), h('span', {class: 'wy-v' + (VTONE[r.verdict] ?? 'y'), text: ` · ${r.verdict}`})));
    if (r.code || r.name) row.append(h('p', {class: 'wy-rs'}, h('span', {class: 'wy-stn', 'data-proper': '', text: String(r.name || r.code)}),
      h('span', {text: r.price > 0 ? ` · 그날 값 ${won(r.price)}` + (r.day ? ` · ${NX.md(r.day)} 종가` : '') : ' · 그날 값 ?'})));
    row.append(bars(r.groups, true));
    if (r.why || r.promise || r.bigDay) row.append(lines(r));
    const age = (Date.now() - Date.parse(r.at)) / 864e5;
    if (r.picks?.length) {
      if (age < 30) row.append(h('p', {class: 'note', text: `그날 ${NAME} 칸 ${r.picks.length}곳 · 한 달 뒤(${fmtDay(new Date(Date.parse(r.at) + 30 * 864e5).toISOString())})에 결과를 붙여요.`}));
      else { const out = h('p', {class: 'note', text: '한 달 뒤 결과를 셈하는 중…'}); row.append(out); monthLater(r, out); }
    }
    box.append(row);
  }
  return box;
}
/** 같은 기간 코스피(home.json 지수 줄 · 두 날이 다 있을 때만) — 없으면 null */
function kospi(from, to) {
  const rows = NX.D?.home?.idx?.KOSPI?.rows; if (!Array.isArray(rows) || !from || !to) return null;
  const a = rows.find(x => x[0] === from)?.[1], b = rows.find(x => x[0] === to)?.[1];
  return a > 0 && b > 0 ? (b / a - 1) * 100 : null;
}
async function monthLater(r, out) {
  const [got] = await Promise.all([Promise.all(r.picks.map(p => NX.getJson('co/' + p.code + '.json').then(j => ({p, now: j?.c?.price ?? null, day: j?.c?.priceDate ?? null})))), NX.need?.('home')]);
  const ok = got.filter(x => x.now > 0 && x.p.price > 0);
  if (!ok.length) { out.textContent = '? 지금 값을 못 받았어요.'; return; }
  const ws = ok.reduce((s, x) => s + x.p.w, 0), tot = ok.reduce((s, x) => s + x.p.w * (x.now / x.p.price - 1) * 100, 0) / ws;
  const to = ok.map(x => x.day).filter(d => typeof d === 'string').sort().pop() ?? null, k = kospi(r.asOf, to);
  out.replaceChildren(h('span', {text: `한 달 뒤 결과 · ${ok.length}곳 비중으로 묶은 합 `}), h('b', {class: 'num ' + NX.cls(tot), text: NX.pct(tot)}),
    ...(ok.length < r.picks.length ? [h('span', {text: ` · ? ${r.picks.length - ok.length}곳은 지금 값 없음`})] : []),
    h('span', {text: ' · 같은 기간 코스피 '}), k == null ? h('b', {class: 'wy-qm', text: '?'}) : h('b', {class: 'num ' + NX.cls(k), text: NX.pct(k)}));
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
