/* 손자병법 길 — 첫 쪽 · 꾀 · 회사 · 정산은 손자병법 판(su-sonja*.js) · 「왜 사?」 · 매매일지만 옛 틀(page())
   주문 1115-2328(사장님 2026-11-15(마카오) 22:28 「어고쳐」 — 물음 「다른 쪽들도 병법 서른여섯 가지에 맞게 고칠까요?」의 답 · 앞 말씀 17:43 「… 기존애 돈모리는곳 불장 꽃은 다 삭제 하고 병법 36가지 만 표현 되개 해야 한다」
   · 2026-11-14 08:27 「… 과거 찌꺼기 버릴것은 버리고」 — 원문 docs/design/sonja-ink-2026-11-15/order-2328.txt)
   길 다섯 화면: 기 1 오늘 #/ → 승 2 꾀 #/k/g01 ~ g36 → 전 3 회사 #/c/<번호> → 결 4 「왜 사?」 #/q/<번호> → 결 5 내 매매일지 #/j
   탭 다섯: 오늘 #/ · 꾀 #/k(꾀 모음) · 멈춤 #/q · 일지 #/j · 정산 #/r/t(서른여섯 꾀 표만)
   지운 쪽(옛 고리로 오면 첫 쪽 · #/k/<번호> 는 그 회사 쪽): 옛 처음 #/b · 땅 지도 #/m · #/m/<땅> · 될 듯 21곳 #/n · 조용한 힘 #/s · 친구에게 #/f · 기록 #/r · 달마다 · 못 된 까닭 · 날마다 · 해마다 · 한국 시장 일곱 · 투자자 열하나 · 1 · 2 · 3등 달력 · 조용한 힘 달력 #/r/(m · w · d · y · k · i · c · s) · #/r/<번호> · 업종 #/i/<업종> · 회사 자세히 #/c/<번호>/more · 1 · 2 · 3등 회사 #/c/<번호>/t · 「왜?」 #/c/<번호>/y/<칸>
   보안 규칙: innerHTML 없음 · 글 속 style 없음 */
import {NAME} from '/next/brand.js';
import {glossTree} from '/next/glossary.js';
import {CODE, forwardTo} from '/su/su-data.js';
import {NEED, brand, holes, ymd} from '/su/su-six.js';
import {glossPage, hardLeft} from '/su/su-word.js';
import {halo, dress} from '/su/su-art.js';
import {kstText} from '/next/essence.js';
import {h, s, sixTiles, sixMap, dots6} from '/su/su-fig.js';
import {josa} from '/next/brand.js';
import {sonjaShell} from '/su/su-sonja-top.js'; // 머리 줄 · 표지(먼저 칠함) — 본문 su-sonja.js 는 첫 쪽을 열 때 받음(주문 1115-1836 · 느린 휴대폰 첫 화면)
let WHYM = null; const whyM = async () => (WHYM ??= await import('/su/su-why.js')); // 「왜 사?」 · 매매일지는 그 쪽에서 받음(첫 화면이 가볍게 — 주문 2044 느린 휴대폰)

brand(NAME);
const cache = new Map();
export const get = url => { if (!cache.has(url)) cache.set(url, fetch(url).then(r => (r.ok ? r.json() : null)).catch(() => null)); return cache.get(url); };
export const D = {S: '/next/data/home-summary.json', co: c => '/atlas/data/co/' + c + '.json'};
/** 쪽 바탕 자료 — 받은 때(home-summary) · 판 날(su21.json) · 옛 꽃 · 돈 자료는 받지 않음(주문 1115-2328) */
export async function base() {
  const [S, T] = await Promise.all([get(D.S), get('/su/data/su21.json')]);
  return {S, asOf: T?.asOf?.board ?? null};
}
export const SAFE = '지난 기록만 보여 줘요. 앞날을 맞히지 않고 사고팔기를 권하지 않아요.';
const PHASE = ['기', '승', '전', '결'];
export const STEPS = [null, ['오늘', 0], ['꾀', 1], ['회사', 2], ['「왜 사?」', 3], ['내 매매일지', 3]]; // 길 다섯 화면(주문 1115-2328 · 짝: su-sonja-top.js STEP5)
const NSTEP = STEPS.length - 1;
let lastCo = null;
export const cur = () => lastCo;
export const setCur = c => { lastCo = c; };
export const coHref = c => '#/c/' + c;
const TABS = () => [['오늘', '#/', 'M4 11l8-7 8 7v9h-5v-6h-6v6H4z'], ['꾀', '#/k', 'M5 4h14v16H5zM9 8h6M9 12h6M9 16h4'], // 탭 다섯(주문 1115-2328 · 짝: su-sonja-top.js TAB5)
  ['멈춤', lastCo?.code ? '#/q/' + lastCo.code : '#/q', 'M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18zM10 9v6M14 9v6'], ['일지', '#/j', 'M6 3h12v18H6zM9 7h6M9 11h6M9 15h4'],
  ['정산', '#/r/t', 'M6 3h12v18l-3-2-3 2-3-2-3 2zM9 8h6M9 12h6M9 16h4']];

/* ── 틀 ── */
function tools() {
  const big = h('button', {class: 'su-tool', type: 'button', 'aria-label': '글씨 크게', 'aria-pressed': String(document.documentElement.classList.contains('su-lg')), text: '글씨'});
  big.addEventListener('click', () => { const on = document.documentElement.classList.toggle('su-lg'); big.setAttribute('aria-pressed', String(on)); try { localStorage.setItem('su-big-text', on ? '1' : '0'); } catch { /* 저장 못 해도 됨 */ } });
  const gift = h('a', {id: 'giftBtn', class: 'su-tool su-gift', href: '#/gift', 'aria-label': '선물 받기 · 상품권', text: '선물'}); // 옛 기능 상품권 · 커피 쿠폰(주문 2044 — 옛 기능 하나도 빼지 않음)
  const find = h('a', {class: 'su-tool su-find', href: '/next/?su=guide#/find', 'aria-label': '종목 찾기', text: '찾기'}); // 종목 검색은 어느 화면에나(주문 0054 [4] 6) — 찾기 쪽은 수르 틀 안에서 열림
  return h('div', {class: 'su-tools'}, find, gift, big);
}
/** 듣기 — 큰 값 · 뜻 줄 · 네 줄 글(엄지 자리 · 다음 단추 옆) */
function sayBtn() {
  const b = h('button', {class: 'su-say', type: 'button', 'aria-label': '읽어 주기'}, s('svg', {class: 'su-ti', viewBox: '0 0 24 24', 'aria-hidden': 'true'}, s('path', {d: 'M4 9v6h4l5 4V5L8 9zM16 9a4 4 0 0 1 0 6M18.5 6.5a8 8 0 0 1 0 11'})), h('span', {text: '듣기'}));
  b.addEventListener('click', () => {
    try {
      const sy = window.speechSynthesis; if (!sy) return;
      if (sy.speaking) { sy.cancel(); return; }
      const t = [...document.querySelectorAll('#su h1, #su .su-head .su-big, #su main > .su-two p')].map(e => e.innerText.replace(/\s+/g, ' ')).join('. '); // 신문 짜임 — 큰 값 · 설명 두 줄(주문 1023)
      const u = new SpeechSynthesisUtterance(t); u.lang = 'ko-KR'; u.rate = 0.9; sy.speak(u);
    } catch { /* 읽어 주기가 없는 기기 */ }
  });
  return b;
}
const valText = (v, B = 'b', U = 'span') => (v.v == null ? h(B, {class: 'su-needv', text: NEED}) : [h(B, {text: v.v}), v.unit ? h(U, {text: v.unit}) : null,
  v.v2 != null ? [h('em', {text: '대'}), h(B, {text: v.v2}), v.unit ? h(U, {text: v.unit}) : null] : null]);
/** 그래서 무슨 뜻 — 숫자마다 한 줄(학생 말) · 뜻이 없으면 「확인 필요」 */
const meanLine = (v, big = false) => h('p', {class: 'su-mean' + (big ? ' su-mean-big' : ''), 'aria-label': '그래서 무슨 뜻'}, h('i', {text: '그래서'}), h('span', {class: v.mean ? null : 'su-needt', text: v.mean ?? NEED}));
const bigVal = v => h('div', {class: 'su-big'}, h('p', {class: 'su-bv'}, valText(v), halo(v.six)), h('p', {class: 'su-bl', text: v.label}), meanLine(v, true)); // 여섯 꽃잎은 큰 값 옆(빈 칸 수는 아래 여섯 칸 판 제목)
/** 값의 여섯 칸 — 닫혀 있어도 꽃잎 여섯과 빈 칸 수가 보임 · 누르면 여섯 칸 판 */
export function sixBox(v) {
  const n = holes(v.six).length;
  return h('details', {class: 'su-sixd'}, h('summary', {class: 'su-sixs'}, dots6(v.six), h('span', {class: 'su-sixw', text: '어떻게 셌나'}), h('b', {class: n ? 'su-needt' : 'su-fullt', text: n ? NEED + ' ' + n + '곳' : '빈 곳 없음'})),
    sixTiles(v.six, {title: null, small: true, label: v.label + ' — 센 길'}));
}
export const midCard = v => h('div', {class: 'su-mid'}, h('p', {class: 'su-ml', text: v.label}), h('p', {class: 'su-mv'}, valText(v)), meanLine(v), sixBox(v));
function valRow(v) {
  const head = h('div', {class: 'su-vh'}, h('span', {class: 'su-vl', text: v.label}), h('span', {class: 'su-vv'}, valText(v, 'b', 'small')));
  return h('li', {class: 'su-vr' + (v.up === false && !v.open ? ' su-worse' : '') + (v.open ? ' su-openm' : '')}, v.href ? h('a', {class: 'su-vlink', href: v.href}, head) : head, meanLine(v), sixBox(v));
}
/** 전문가용 자세히 — 자료 숫자 모두 · 셈과 출처 · 눌러야 열림 */
export function proBox(pro, title = '전문가용 자세히') {
  if (!pro?.length) return null;
  const need = pro.filter(p => p.v === NEED).length; // 빠진 칸 수(시안 4 장점)
  return h('details', {class: 'su-pro'}, h('summary', {class: 'su-pros'}, h('b', {text: title}), h('span', {text: '숫자 ' + pro.length + '개 · ' + (need ? '확인 필요 ' + need + '칸' : '빠진 칸 0') + ' · 셈과 출처'})),
    h('ul', {class: 'su-prol'}, pro.map(p => h('li', {}, h('span', {class: 'su-prok', text: p.k}), h('b', {class: 'su-prov' + (p.v === NEED ? ' su-needt' : ''), text: p.v}), p.how ? h('span', {class: 'su-proh', text: p.how}) : null))));
}
/** 꼭 있어야 할 길 둘 — 옛 기능 쪽(#/g)에만 있던 것을 쪽마다 맨 아래로 옮김(주문 1114-1306 ⑧)
 *  개인정보 처리방침 = 큐피트 틀을 미리 입힌 짝 쪽(/su/privacy.html) · 고객센터 = 옛 앱 쪽을 큐피트 틀(?su=back)로 엶 */
export const FOOT = Object.freeze([['/su/privacy.html', '개인정보 처리방침'], ['/next/?su=back#/help', '고객센터']]);
export function source(asOf, S, note = null, kick = null, foot = true) { // foot = 맨 아래 두 길(회사 「왜?」 쪽은 넉 장 안이라 뺌 — 주문 0510 · 1114-1306)
  const got = S?.fetchedAt ? kstText(S.fetchedAt) : null;
  return h('footer', {class: 'su-src'}, kick ? h('p', {}, h('b', {text: '이 쪽 '}), kick) : null,
    h('p', {}, h('b', {text: '출처 '}), '네이버 증권 그날 마지막 값 · ' + josa(NAME, '가') + ' 센 지난 기록'),
    h('p', {}, h('b', {text: '조사 날짜 '}), '자료 ' + (ymd(asOf) ?? NEED) + (got ? ' · 받은 때 ' + got : '')),
    note ? h('p', {text: note}) : null,
    foot ? h('p', {class: 'su-srcl'}, FOOT.map(([href, t]) => h('a', {href}, h('span', {text: t}), h('i', {'aria-hidden': 'true', text: '›'})))) : null,
    h('p', {class: 'su-safe', text: SAFE})); // 안전 문장은 출처 칸 맨 아래(신문 짜임 — 주문 1023 [1] 2 「그림 밖 문장은 큰 값 · 설명 두 줄 · 출처뿐」)
}
/* ── 무하 그림(주문 1023 「머스크 판 4」 [3] 4 · [5] · [6] — 일꾼 열하나가 서로 모르게 만든 부품 · docs/design/su-musk-2026-11-05/pic-brief.md) ── */
const MODS = new Map();
/** 부품 꾸밈 파일 — 그 부품을 처음 쓸 때 받음(첫 화면은 index.html 이 미리 받음 · 느린 휴대폰 첫 그림 2.5초 — 주문 1023 [1] 6) · 다 받을 때까지(2.5초까지) 기다려 맨 그림이 보이지 않게 */
const cssOf = href => {
  if (!href || document.querySelector('link[rel="stylesheet"][href="' + href + '"]')) return Promise.resolve(); // 미리 받기(rel=preload)만 있으면 꾸밈으로 붙임(주문 1532 · 잡스 판 꾸밈을 일찍 받음)
  return new Promise(ok => { const l = document.createElement('link'); l.rel = 'stylesheet'; l.href = href; l.addEventListener('load', ok, {once: true}); l.addEventListener('error', ok, {once: true}); setTimeout(ok, 2500); document.head.append(l); });
};
const modOf = name => { if (!MODS.has(name)) MODS.set(name, import('/su/' + name + '.js').then(async M => { await cssOf(M.CSS); return M; })); return MODS.get(name); };
/** 부품 하나와 그 자료 — {M, d, name} · 못 받으면 null(옛 그림이 그 자리) */
export async function artMod(name, arg = null) { try { const M = await modOf(name); return {M, d: await M.load(get, arg), name}; } catch (e) { console.error(e); return null; } }
/** 큰 그림 칸 — data-g = 부품 이름(화면 넓이 셈) · 「왜 사?」처럼 누를 때마다 다시 그리는 쪽은 artMod 를 한 번 받고 이것만 부름 */
export function artFig(A, opt = {}) {
  if (!A) return null;
  try { const svg = A.M.picture(A.d, opt); return svg ? h('figure', {class: 'su-fig su-hero su-art4', 'data-g': A.name}, svg) : null; } catch (e) { console.error(e); return null; }
}
export const art = async (name, arg = null, opt = {}) => artFig(await artMod(name, arg), opt);
/** 새 그림이 나오면 큰 자리에 · 옛 그림은 「자세히」 서랍에(지우지 않음 — [2] 3 · 4) */
export const heroOf = (pic, old) => (pic ? {hero: pic, hero2: old ?? null} : {hero: old ?? null, hero2: null});
/** 큰 그림 자리를 바로 두고(같은 크기 · 글이 먼저 그려짐 — 느린 휴대폰 첫 그림 2.5초 [1] 6) 부품이 오면 채움 · 못 오면 옛 그림을 그 자리로(서랍에서 꺼냄)
 *  make = () => Promise<svg|null> · 검사는 data-wait 가 없어질 때까지 기다림 */
function slot(name, make, old, arg = null) {
  const fig = h('figure', {class: 'su-fig su-hero su-art4 su-wait', 'data-g': name, 'data-wait': '', ...(typeof arg === 'string' && /^[a-z]+$/.test(arg) ? {'data-a': arg} : {})}); // data-a = 부품 갈래(기다리는 자리 비율 — su-news.css)
  const back = () => { if (old) fig.replaceWith(old); else fig.remove(); };
  make().then(svg => { if (svg) { fig.replaceChildren(svg); fig.removeAttribute('data-wait'); fig.classList.remove('su-wait'); } else back(); }).catch(e => { console.error(e); back(); });
  return {hero: fig, hero2: old ?? null};
}
/** 부품 그림 — {hero, hero2} */
export const artHero = (name, arg, old, opt = {}) => slot(name, async () => { const A = await artMod(name, arg); return A ? A.M.picture(A.d, opt) : null; }, old, arg);
/** 무하 틀 그림 — {hero, hero2} */
function dock(nx, step) {
  if (!nx) return null;
  return h('nav', {class: 'su-dock', 'aria-label': '다음 화면'},
    step ? h('ol', {class: 'su-prog', 'aria-label': '다섯 화면 가운데 ' + step + '번째'}, STEPS.slice(1).map((x, i) => h('li', {class: i + 1 < step ? 'su-pd' : i + 1 === step ? 'su-pc' : ''}))) : null,
    h('div', {class: 'su-dk'}, sayBtn(), h('a', {class: 'su-next', href: nx.href}, h('img', {class: 'su-parrot', src: '/media/su-parrot.svg', alt: '', 'aria-hidden': 'true', width: '34', height: '34'}), h('span', {class: 'su-nk', text: nx.k ?? (nx.step ? nx.step + ' / ' + NSTEP : '다음')}), h('b', {text: nx.label}), h('i', {'aria-hidden': 'true', text: '›'}))));
}
/** 탭이 보이는 차례 — 중요한 차례(주문 1023 [4] · 에이전트 열하나가 따로 매긴 차례를 보르다로 셈 44 · 32 · 20 · 13 · 반대편 셋이 못 깸 · tabs-11.md): 오늘 · 지도 · 멈춤 · 기록
 *  쪽마다 tab 값은 그대로(0 오늘 · 1 지도 · 2 기록 · 3 멈춤 · 4 달력 = TABS 차례) — 보이는 차례만 바꿈 · 「탭 차례는 기승전결보다 중요순이 앞선다」([4] 6)
 *  달력(주문 0040)은 있던 넷의 자리를 옮기지 않고 맨 끝에 붙임 */
export const TAB_ORDER = Object.freeze([0, 1, 2, 3, 4]); // 탭 다섯 차례 그대로(주문 1115-2328 — 오늘 · 꾀 · 멈춤 · 일지 · 정산) // 정산(주문 1112-1728)도 있던 다섯의 자리를 옮기지 않고 맨 끝에
function tabs(active) {
  const T = TABS();
  return h('nav', {class: 'su-tabs', 'aria-label': '탭 — 오늘 · 꾀 · 멈춤 · 일지 · 정산'}, TAB_ORDER.map((i, k) => { const [t, href, d] = T[i];
    return h('a', {class: 'su-tab' + (i === active ? ' su-on' : ''), href, 'aria-current': i === active ? 'page' : null, 'aria-label': (k + 1) + '번째 · ' + t},
      s('svg', {class: 'su-ti', viewBox: '0 0 24 24', 'aria-hidden': 'true'}, s('path', {d})), h('span', {text: t})); }));
}
/** 쪽 하나 — 신문 1면(주문 1023 「머스크 판 4」 [목표] 「큰 값 한 줄 → 움직이는 그림 70% → 설명 두 줄 → 출처」)
 *  머리 줄(수르 · 만수르 바로가기 — 첫 화면 [2] 1 · 걸음 · 찾기 · 선물 · 글씨) → 이름과 큰 값 한 줄 → 그림(390 폭에서 높이 620 = 화면의 73%)
 *  → 설명 두 줄(무엇을 셌나 · 그래서) → 「자세히」(닫힘 — 지운 것 없이 모두: 왜 여기 있나 · 옛 그림 · 중간 값 · 여섯 칸 · 네 칸 · 그림 · 목록 · 자세한 값 · 지도 · 전문가 · 본질 · 지킴이) → 출처 · 조사 날짜 · 안전 문장
 *  가장 좋은 글은 없는 글이다 — 그림 밖 문장은 큰 값 · 설명 두 줄 · 출처뿐([1] 2) · 이름과 숫자는 그림 안 이름표([1] 3) · 기능은 하나도 빼지 않고 서랍으로([2] 3 · 4) */
export function page(m) {
  document.title = (m.title ? m.title + ' · ' : '') + NAME;
  const st = m.step ? STEPS[m.step] : null, hk = location.hash;
  const man = m.mansour ? h('a', {class: 'su-mansour', href: 'https://shin-yxy.gino.im/', target: '_blank', rel: 'noopener', 'aria-label': '천사 바로가기 · 새 창'}, h('b', {text: '천사'}), h('i', {'aria-hidden': 'true', text: '↗'})) : null; // 만수르는 첫 화면 맨 위 머리 줄에(사장님 2026-11-05 04:14(+03) · [2] 1 — 누르면 새 창)
  const step = st ? h('span', {class: 'su-step', 'aria-label': m.step + ' / ' + NSTEP + ' · ' + st[0]}, h('i', {text: PHASE[st[1]]}), h('span', {text: m.step + ' / ' + NSTEP})) : null; // 걸음 표시는 숫자만(이름은 큰 제목과 겹치고 머리 줄에서 「회사…」 「「왜…」처럼 잘림 — 심사 4 · 6회) · 읽어 주기에는 이름까지
  const head = h('header', {class: 'su-top top'}, h('a', {class: 'su-brand', href: '#/', text: NAME}), man ?? step, tools()); // 첫 화면은 걸음 표시가 큰 값 줄로(머리 줄에 만수르)
  const h1 = h('h1', {class: 'su-h1', text: m.h1 ?? m.title});
  if (m.proper) h1.setAttribute('data-proper', '');
  const top = h('section', {class: 'su-head su-head1', 'aria-label': '큰 값'}, h1, man ? step : null, m.big ? h('div', {class: 'su-big su-big1'}, h('p', {class: 'su-bv'}, valText(m.big))) : null);
  const two = m.big ? h('div', {class: 'su-two', 'aria-label': '설명 두 줄'}, h('p', {class: 'su-bl', text: m.big.label}), meanLine(m.big, true)) : null;
  const more = h('details', {class: 'su-more'}, h('summary', {class: 'su-mores'}, h('b', {text: '자세히'}), h('span', {text: '값 · 그림 · 목록 · 셈 모두'})),
    m.kick ? h('p', {class: 'su-kick'}, h('b', {text: '이 쪽 '}), m.kick) : null,
    m.lead ?? null, // 「왜 여기 있나」(주문 0054 [2] 4 — 이제 그림 안 길이 먼저 · 글은 서랍에)
    m.big ? sixTiles(m.big.six, {label: '큰 값을 센 길'}) : null, // 큰 값의 여섯 칸 — 서랍 맨 앞(검사: details.su-more > figure.su-six)
    m.hero2 ?? null, // 옛 큰 그림(값 그래프 그대로 · 네 줄 글과 함께)
    m.mids?.length ? h('section', {class: 'su-mids n' + m.mids.length, 'aria-label': '중간 값'}, m.mids.map(midCard)) : null,
    m.honest ?? null,
    ...(m.figs ?? []),
    ...(m.body ?? []),
    m.rows?.length ? h('section', {class: 'su-rows', 'aria-label': m.rowsTitle ?? '자세한 값'}, h('h2', {class: 'su-ft', text: m.rowsTitle ?? '자세한 값'}), h('ol', {class: 'su-vlist'}, m.rows.map(valRow))) : null,
    m.big ? sixMap([m.big, ...(m.mids ?? []), ...(m.rows ?? [])]) : null,
    proBox(m.pro),
    ...(m.after ?? []),
    m.note ? h('p', {class: 'su-note', text: m.note}) : null);
  const act = m.act?.filter(Boolean).length ? h('div', {class: 'su-act', 'aria-label': '누르는 곳'}, m.act.filter(Boolean)) : null; // 「왜 사?」 답 단추처럼 기능에 꼭 있는 누르는 곳(지우지 않음 — [2] 3)
  const main = h('main', {class: 'su-page su-news'}, top, m.hero ?? null, act, two, more, source(m.asOf, m.S, null, null, m.foot !== false));
  return [head, main, dock(m.next, m.step), tabs(m.tab ?? 0)];
}
/** 그린 뒤 — 낱말 풀이를 붙이고 풀이 없이 남은 어려운 낱말을 셈(main data-hard · data-hard-words · data-glossed) */
export function afterPaint(root) {
  const main = root.querySelector('main'); if (!main) return;
  glossTree(main);
  const glossed = glossPage(main);
  const c = main.cloneNode(true); for (const e of c.querySelectorAll('.su-pro, .su-gl, .su-wc, svg, [data-proper]')) e.remove();
  const left = hardLeft(c.textContent ?? '', glossed);
  main.dataset.glossed = glossed.join(',');
  main.dataset.hard = String(left.length);
  main.dataset.hardWords = left.join(',');
  // 신문 짜임(주문 1023 [1] 2 「그림 밖 문장은 큰 값 · 설명 두 줄 · 출처뿐」) — 낱말 풀이와 쉬운 말 셈은 지우지 않고 「자세히」 서랍 맨 앞으로(앞 주문 1807 과 부딪힘 → [2] 5 로 이 주문을 따름)
  // 기계가 센 「쉬운 말 · 풀이 붙인 낱말 ○개 · 풀이 없이 남은 어려운 낱말 ○개」 줄은 화면에 붙이지 않음 — 셈은 위 main data-hard · data-hard-words · data-glossed 에만(점검 장부가 손님 화면에 나오던 것 · DISCARD 10 · 주문 1114-0922 「과거 찌꺼기 버릴것은 버리고」)
  const more = main.querySelector(':scope > details.su-more');
  for (const e of main.querySelectorAll('.su-wc')) e.remove();
  if (more) {
    more.querySelector('.su-glbox')?.remove();
    const out = [...main.querySelectorAll('.su-gl')].filter(g => !g.closest('details.su-more'));
    if (out.length) more.querySelector(':scope > summary')?.after(h('section', {class: 'su-glbox', 'aria-label': '낱말 풀이'}, h('h2', {class: 'su-ft', text: '낱말 풀이'}), ...out)); // 풀이가 없으면 빈 칸을 두지 않음
  }
  requestAnimationFrame(() => setTimeout(() => dress(root), 0)); // 무하처럼 — 어깨 덩굴 · 꽃 띠 · 네 모서리 꽃 · 글과 겹치면 숨김(주문 1833) · 첫 그림이 뜬 뒤에(느린 휴대폰에서 첫 화면을 늦추지 않게)
}
export function notFound(t) { return {title: '찾지 못했어요', h1: '찾지 못했어요', tab: 0, body: [h('p', {class: 'su-lead', text: t}), h('a', {class: 'su-ask', href: '#/'}, h('b', {text: '처음으로'}))]}; } // 글 앞 「?」는 뺌 — 빈 값 표시로 읽힘(버린 쪽 #/r/n 옛 고리도 여기로 · 주문 1114-1306)
const ctx = {base, get, D, page, notFound, source, midCard, sixBox, proBox, cur, setCur, STEPS, afterPaint, art, artMod, artFig, heroOf, artHero};
/** 손자병법 판 쪽(첫 쪽 · 꾀 · 회사 · 정산)에 건네는 것 — 받은 때(home-summary)만 · 마지막에 본 회사(멈춤 탭) */
const XS = {base: async () => ({S: await get(D.S)}), get, cur, setCur};
let skyOld = false, skyLoaded = false, skyGo = false;
/** 하늘(주문 0054 [6] 8 · 9) — 옛 쪽을 볼 때만 모양 · 그림을 받음(손자병법 첫 쪽에는 옛 꾸밈을 하나도 붙이지 않음 — 주문 1115-1706 「기존에 있던것 단 한나도 디자임 사용하지말고」) */
function sky() {
  if (skyGo || !skyLoaded || !skyOld) return; skyGo = true;
  const l = document.createElement('link'); l.rel = 'stylesheet'; l.href = '/su/su-sky.css'; document.head.append(l);
  import('/su/su-sky.js').then(m => m.startSky()).catch(e => console.error(e));
}
/** 손자병법 첫 쪽 판 켜기 · 끄기 — html.sj-on(한지 바탕 · su-sonja.css) · 휴대폰 맨 위 띠 색(첫 쪽 = 한지 #F1E3D3 · 다른 쪽 = 흰색 그대로) */
const SJ_TC = '#F1E3D3', OLD_TC = '#FFFFFF';
/** 옛 쪽 꾸밈 파일 켜기 · 끄기 — link[data-old-css](index.html 이 media="print" 로 받기만 함 · 주문 1115-1836) · 첫 쪽 손자병법 판은 하나도 쓰지 않음(주문 1115-1706)
 *  켤 때는 다 받을 때까지 기다림(옛 쪽이 꾸밈 없이 칠해지지 않게 · 6초 넘으면 그냥 감) */
function oldCss(on) {
  const ls = [...document.querySelectorAll('link[data-old-css]')], md = on ? 'all' : 'print';
  for (const l of ls) if (l.media !== md) l.media = md;
  if (!on) return Promise.resolve();
  return Promise.all(ls.map(l => (l.sheet ? null : new Promise(res => { l.addEventListener('load', res, {once: true}); l.addEventListener('error', res, {once: true}); setTimeout(res, 6000); }))));
}
function sonjaOn(on) {
  document.documentElement.classList.toggle('sj-on', on); document.documentElement.classList.remove('sj-sub'); // 표지 숨김(sj-sub)은 첫 칠함에만(su-boot.js)
  if (on) oldCss(false);
  for (const m of document.querySelectorAll('meta[name="theme-color"]')) m.setAttribute('content', on ? SJ_TC : OLD_TC);
  skyOld = !on; if (!on) sky();
}
/** 지운 쪽(주문 1115-2328) — 옛 고리로 오면 첫 쪽(주소도 #/ 로 바꿈) · 옛 회사 고리 #/k/<번호> 는 그 회사 쪽 */
const GONE_T = /^#\/(b|m|n|s|f|r|g)$/, GONE_M = /^#\/(m|i|r|g)\/.+$|^#\/c\/[0-9A-Z]{6}\/.+$/; // #/g · #/g/<묶음> = 옛 기능 쪽(주문 1114-1306 에서 버림)
/** 손자병법 판 쪽 그리기 — 머리 줄 · main · 이야기 막대 · 탭(옛 page() · afterPaint() 를 거치지 않음) */
async function paintSj(hh, root, make) {
  const v = await make(); if (hh !== (location.hash || '#/')) return;
  sonjaOn(true); document.title = v.title + ' · ' + NAME; root.replaceChildren(...v.dom); window.scrollTo(0, 0);
}
let KM = null; const kkoeM = async () => (KM ??= await import('/su/su-sonja-kkoe.js')); // 꾀 · 회사 · 정산 쪽은 그 쪽을 열 때 받음(첫 화면이 가볍게)
async function route() {
  let hh = location.hash || '#/';
  const fw = forwardTo(location.search, hh);
  if (fw) { location.replace(fw); return; }
  const old = /^#\/k\/([0-9A-Z]{6})$/.exec(hh);
  if (old) { history.replaceState(null, '', '#/c/' + old[1]); hh = '#/c/' + old[1]; }
  else if (GONE_T.test(hh) && hh !== '#/r/t' || GONE_M.test(hh) && hh !== '#/r/t') { history.replaceState(null, '', location.pathname + location.search + '#/'); hh = '#/'; }
  const root = document.getElementById('su');
  try {
    const kk = /^#\/k(?:\/(.+))?$/.exec(hh), co = /^#\/c\/([0-9A-Z]{6})$/.exec(hh), q = /^#\/(q|p)(?:\/(.+))?$/.exec(hh);
    if (kk) { const M = await kkoeM(); return await paintSj(hh, root, () => (kk[1] ? M.vKkoe(XS, kk[1]) : M.vKkoeAll(XS))); }
    if (co) { const M = await kkoeM(); return await paintSj(hh, root, () => M.vCo36(XS, co[1])); }
    if (hh === '#/r/t') { const M = await kkoeM(); return await paintSj(hh, root, () => M.vSettle36(XS)); }
    if (q || hh === '#/j') { // 「왜 사?」 · 매매일지 — 옛 틀(page()) 그대로 · 걸음 4 / 5 · 5 / 5
      let v;
      if (hh === '#/j') v = await (await whyM()).vJournal(ctx);
      else { let a = q[2] ?? null; try { a = a == null ? null : decodeURIComponent(a); } catch { /* 그대로 */ }
        v = a == null ? await (await whyM()).vQuiz(lastCo?.code ?? null, ctx) : CODE.test(a) ? await (await whyM()).vQuiz(a, ctx) : notFound('이 회사를 찾지 못했어요.'); }
      if (hh !== (location.hash || '#/')) return;
      await oldCss(true); // 옛 쪽 꾸밈을 다 받은 뒤에 그림(주문 1115-1836)
      if (hh !== (location.hash || '#/')) return;
      sonjaOn(false);
      root.replaceChildren(...page(v).filter(Boolean));
      afterPaint(root);
      window.scrollTo(0, 0);
      if (typeof v.later === 'function') v.later().catch(e => console.error(e));
      return;
    }
    // 손자병법 첫 쪽(주문 1115-1706) — 머리 · 본문 · 이야기 막대 · 탭을 새 판이 모두 그림 · 알 수 없는 고리도 첫 쪽
    // 주문 1115-1836 — 머리 줄 · 표지를 자료 · 본문 코드보다 먼저(처음 열 때는 index.html 이 든 것을 그대로 · 다른 쪽에서 오면 새로 그림) → 본문은 받은 뒤 같은 main 에 이어 붙임
    const sh = sonjaShell(root); sonjaOn(true);
    if (sh.pre) { for (const c of [...root.children]) if (c !== sh.top && c !== sh.main) c.remove(); } else { root.replaceChildren(sh.top, sh.main); window.scrollTo(0, 0); }
    const sj = await (await import('/su/su-sonja.js')).vSonja(XS, sh);
    if (hh !== (location.hash || '#/')) return;
    if (sj) { document.title = sj.title + ' · ' + NAME; if (sj.keep) root.append(...sj.rest); else root.replaceChildren(...sj.dom); sj.after().catch(e => console.error(e)); return; }
    sh.main.removeAttribute('data-wait'); sh.main.append(h('section', {class: 'sj-sec'}, h('p', {class: 'sj-lead', text: '오늘 자료를 받지 못했어요. 잠시 뒤 다시 열어 주세요.'}), h('p', {class: 'sj-safe', text: SAFE})));
  } catch (e) {
    console.error(e);
    if (hh !== (location.hash || '#/')) return;
    await oldCss(true); sonjaOn(false);
    root.replaceChildren(...page(notFound('화면을 그리다 멈췄어요. 다시 열어 주세요.')).filter(Boolean)); afterPaint(root);
  }
}
try { if (localStorage.getItem('su-big-text') === '1') document.documentElement.classList.add('su-lg'); } catch { /* 저장소 없음 */ }
window.addEventListener('hashchange', route);
route();
window.addEventListener('load', () => setTimeout(() => { skyLoaded = true; sky(); }, 1500), {once: true}); // 하늘 — 첫 그림을 막지 않게 창이 다 열린 뒤(옛 쪽을 볼 때만 · 위 sky())
/* 새 판이 올라가면 스스로 새로 고침(주문 1708 · 사장님 2026-11-08 17:08 「왜? 이 디자인이 남아 있어!」 — 휴대폰이 전에 열어 둔 화면을 새로 받지 않고 그대로 보여 줌)
   판 표 /su/version.json = 올릴 때마다 새 표(scripts/atlas11/package.mjs 가 씀 · 저장소에는 「dev」) · 처음 연 때의 표를 기억
   화면이 다시 보일 때(다른 앱에서 돌아옴 · 뒤로 가기로 저장된 화면이 다시 뜸) 표를 새로 받아 바뀌었으면 한 번 새로 고침 · 같거나 못 받으면 그대로(읽는 중에는 바꾸지 않음) */
const VER = '/su/version.json';
const verNow = () => fetch(VER + '?t=' + Date.now(), {cache: 'no-store'}).then(r => (r.ok ? r.json() : null)).then(j => (j && typeof j.v === 'string' && j.v ? j.v : null)).catch(() => null);
let ver0 = null;
verNow().then(v => { if (v && !ver0) ver0 = v; });
async function fresh() {
  if (document.visibilityState !== 'visible') return;
  const v = await verNow(); if (!v) return;
  if (!ver0) { ver0 = v; return; }
  if (v !== ver0) { ver0 = v; location.reload(); }
}
document.addEventListener('visibilitychange', fresh);
window.addEventListener('pageshow', e => { if (e.persisted) fresh(); });
