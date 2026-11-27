/* 손자병법 판 머리 줄 · 표지 · 걸음 · 이야기 막대 · 탭 · 끝 줄(주문 1115-1706 · 빈 파일에서 새로 씀 · 짝 = 첫 쪽 본문 su-sonja.js · 다른 쪽 su-sonja-kkoe.js · 꾸밈 su-sonja.css)
   자료와 본문 코드를 기다리지 않고 먼저 칠함 — 느린 휴대폰(느린 4G · 처리 4배 느림)에서 가장 큰 그림(표지)이 먼저 보이게
   처음 열 때는 index.html 이 같은 머리 줄 · 표지를 글로 들고 있어 자바스크립트보다 먼저 보임(주문 1115-1836 「지금보다 속도 3배 빠르게」) — sonjaShell 이 그것을 그대로 이어 씀
   (index.html 의 글을 고치면 여기 topBar · cover 도 같이 고침 — 다른 쪽에서 첫 쪽으로 돌아올 때는 여기서 새로 그림)
   주문 1115-2328(사장님 2026-11-15(마카오) 22:28 「어고쳐」 — 「다른 쪽들도 병법 서른여섯 가지에 맞게 고칠까요?」의 답) — 모든 쪽이 같은 판
   · 길 다섯 화면: 오늘 → 꾀 → 회사 → 「왜 사?」 → 내 매매일지 · 탭 다섯: 오늘 · 꾀 · 멈춤 · 일지 · 정산(옛 지도 · 기록 · 달력은 지움)
   보안 규칙: innerHTML 없음 · 글 속 style 없음 · 다른 주소 스크립트 없음 */
import {h, s} from '/su/su-fig.js';
import {NAME, josa} from '/next/brand.js';
import {MEAN_TAG, PM} from '/su/su-sonja-mean.js';

export const ART = '/su/su-sonja-hero.svg';
/** 그림 뜻 한 줄(주문 1116-1313 — 그림마다 맨 위 · 작은 이름표 「그림 뜻」 + 큰 쉬운 글) · 그림 안 맨 위면 tag = 'figcaption' */
export const meanCap = (t, tag = 'p') => (t ? h(tag, {class: 'sj-pm'}, h('span', {class: 'sj-pmt', text: MEAN_TAG}), h('b', {class: 'sj-pmb', text: t})) : null);
/** 표지 화제(세로 글 두 줄 · 오른쪽 줄부터) — 주문 1115-1843 「병법으로 … 손실을 보지 않을 방법을 병법으로 풀어 내는 곳」 · 옛 「불장 · 꽃이 될 · 돈이 몰리는 곳을 찾아요」는 지움 */
export const HWA = [['시장을', '읽고'], ['덜', '잃는'], ['꾀를', '찾아요']]; // 세로 세 줄(오른쪽부터) · 낱말 사이 = 좁은 틈(i — 띄어쓰기 글자는 남김)
export const SAFE = '지난 기록만 보여 줘요. 앞날을 맞히지 않고 사고팔기를 권하지 않아요.';
/** 꼭 있어야 할 길 둘(개인정보 처리방침 · 고객센터) — 쪽마다 맨 아래 */
export const FOOT = Object.freeze([['/su/privacy.html', '개인정보 처리방침'], ['/next/?su=back#/help', '고객센터']]);
/** 길 다섯 화면(주문 1115-2328) — [이름, 기승전결] · 짝: su.js STEPS(옛 틀 「왜 사?」 · 매매일지) · 검사 check_su.mjs ⑨ */
export const STEP5 = Object.freeze([['오늘', '기'], ['꾀', '승'], ['회사', '전'], ['「왜 사?」', '결'], ['내 매매일지', '결']]);
/** 탭 다섯(주문 1115-2328) — 오늘 · 꾀 · 멈춤 · 일지 · 정산 · 짝: su.js TABS(옛 틀) */
export const TAB6 = Object.freeze([['오늘', '#/'], ['꾀', '#/k'], ['회사', '#/o'], ['멈춤', '#/q'], ['기록', '#/l/a']]); /* 기록 탭 = 한눈에부터(주문 1126-0229 「너 기록창을 이렇게 만들어」 · 본보기의 첫 탭 포트폴리오) */ // 탭 「분석」 = 내리는 시장 오름 날수(주문 1124-0432 · 사장님 2026-11-24(서울) 05:36 「분석이라는 탑을 만들라고」) // 탭 「장부」 = 가짜 돈으로 산 모든 회사 추적(주문 1120-1705) // 탭 「회사」 = 여러 꾀가 고른 회사(주문 1120-1220 · 사장님 2026-11-20(마카오) 12:20 「너가 이렇게 답변한것을 탭으로 만들어」 · 12:21 「맞아 탭을 만들라고 하는거야」)

/** 「글씨」 단추 — 누르면 한 단 크게(html.su-lg · 다음에 열어도 그대로) */
function bigText(big) {
  if (!big) return null;
  big.setAttribute('aria-pressed', String(document.documentElement.classList.contains('su-lg')));
  big.addEventListener('click', () => { const on = document.documentElement.classList.toggle('su-lg'); big.setAttribute('aria-pressed', String(on)); try { localStorage.setItem('su-big-text', on ? '1' : '0'); } catch { /* 저장 못 해도 됨 */ } });
  return big;
}
/** 머리 줄 듣기(주문 1119-2026 — 샘플 첫째 · 둘째 합친 판: 떠 있던 듣기 · 다음 막대를 없애고 듣기는 머리 줄로) — 쪽 끝 막대의 듣기를 대신 누름 */
export function sayTop() {
  const b = h('button', {class: 'sj-btn sj-saytop', type: 'button', 'aria-label': '읽어 주기', text: '듣기'});
  b.addEventListener('click', () => document.querySelector('#su .sj-dock .sj-listen')?.click());
  return b;
}
/** 머리 줄 — 띄어 쓴 명조 이름 · 선물 · 듣기 · 글씨(천사 · 찾기는 끝 줄로 · 주문 1119-2026) */
/** 맨 위 「찾기」 — 회사 탭(#/o) 맨 위 찾기 칸을 열고 글 칸에 커서(이미 그 쪽이면 곧바로) · 표지는 sessionStorage 한 줄(su-find.js 가 읽고 지움) */
function findTop() {
  const a = h('a', {class: 'sj-btn sj-find sj-findtop', href: '#/o', 'aria-label': '회사 찾기', text: '찾기'});
  a.addEventListener('click', e => {
    const i = document.querySelector('#su main.sj-page[data-page="picks"] input.sj-findi');
    if (i) { e.preventDefault(); i.scrollIntoView({block: 'center'}); i.focus({preventScroll: true}); return; }
    try { sessionStorage.setItem('su-find', '1'); } catch { /* 저장소 없음 — 찾기 칸까지만 감 */ }
  });
  return a;
}
export function topBar() {
  const big = bigText(h('button', {class: 'sj-btn sj-bigtext', type: 'button', 'aria-label': '글씨 크게', text: '글씨'}));
  return h('header', {class: 'sj-top'},
    h('a', {class: 'sj-brand', href: '#/', 'aria-label': NAME + ' 첫 쪽'}, h('img', {class: 'sj-brand-ic', src: '/su/su-icon.svg', alt: '', width: 32, height: 32, decoding: 'async'}), h('span', {class: 'sj-brand-t', text: NAME})), // 앱 얼굴 + 이름(주문 1124-1942 — 치지처럼 얼굴 하나 · 이름 하나)
    h('div', {class: 'sj-tools'},
      h('a', {class: 'sj-btn sj-angel', href: 'https://shin-yxy.gino.im/', target: '_blank', rel: 'noopener', 'aria-label': '천사 바로가기 · 새 창'}, h('b', {text: '천사'}), h('i', {'aria-hidden': 'true', text: '↗'})),
      findTop(), // 회사 찾기 — 선물 옆(주문 1120-1705 · 사장님 17:05 「종목 찾기를 선물 옆에 배치」) · 회사 탭 맨 위 찾기 칸으로
      h('a', {id: 'giftBtn', class: 'sj-btn sj-gift', href: '/next/?su=guide#/gift', 'aria-label': '선물 받기 · 상품권', text: '선물'}),
      sayTop(), big),
    langTabs()); // 「한국어 · 영어」 탭(주문 1127-2320) — 머리 줄 안 맨 아래 한 줄
}
/** 말 고르기 탭(주문 1127-2320 · 사장님 23:20 「영어 번역판으로도 상단에 탭을 만들어서」) — 고른 말은 이 휴대폰에 기억 · 누르면 다시 그림 */
const langNow = () => { try { if (localStorage.getItem('su-lang') === 'en') return 'en'; } catch { /* 저장소 없음 */ } return new URLSearchParams(location.search).get('lang') === 'en' ? 'en' : 'ko'; };
function langTabs() {
  const cur = langNow(), tab = (l, t) => { const b = h('button', {class: 'sj-langb', type: 'button', 'data-lang': l, 'aria-pressed': String(cur === l), text: t});
    b.addEventListener('click', () => { if (langNow() === l) return; let kept = false; try { localStorage.setItem('su-lang', l); kept = localStorage.getItem('su-lang') === l; } catch { /* 저장소 없음 */ }
      if (kept && !new URLSearchParams(location.search).get('lang')) location.reload(); else location.replace(location.pathname + '?lang=' + l + location.hash); });
    return b; };
  return h('div', {class: 'sj-lang', role: 'group', 'aria-label': '말 고르기 — 한국어 · 영어'}, tab('ko', '한국어'), tab('en', '영어'));
}

/** 걸음 표시 「1 / 5 · 오늘」(n = 1 ~ 5 · dd = 「11월 13일」 같은 자료 날 · 없으면 뒤에 붙임)
 *  주문 1120-0001(참모 서른여섯 m02 「묻고 지운 판」 — 다섯 걸음에 기 · 승 · 전 · 결 넷이라 「결」이 두 번 보임 → 동그라미 글자를 지움 · 숫자와 이름만) */
export function stepTag(n, dd = null) {
  const [name] = STEP5[n - 1] ?? STEP5[0], t = n + ' / ' + STEP5.length + ' · ' + name;
  return h('p', {class: 'sj-step', 'aria-label': t}, h('span', {text: t}), dd ? stepDay(dd) : null);
}
/** 오늘 한 장 자리(주문 1120-0001 · 참모 서른여섯 2차 표 m08 「깃털 한 장」 — 첫 화면 맨 위에 오늘 시장 · 덜 잃은 꾀 · 사기 전 멈춤)
 *  자료가 오기 전에는 자리만(높이를 미리 잡아 그림이 밀리지 않게) · su-sonja.js todayCard 가 채움 · 표지 안 맨 뒤에 두고 꾸밈이 맨 위로 올림(그림 뜻 줄이 그림 바로 위 그대로) */
export const todayWait = () => h('div', {class: 'sj-tc sj-tc0', 'aria-busy': 'true'}, h('p', {class: 'sj-tck', text: '오늘 시장'}), h('p', {class: 'sj-tcw', text: '오늘 자료를 읽고 있어요.'}));
/** 표지 — 큰 붓 글씨 그림 한 장 · 걸음 「1 / 5 · 오늘」 · 오늘 한 장(맨 위로 보임) */
export function cover(dd = null) {
  return h('section', {class: 'sj-cover', 'aria-label': NAME + ' 표지'},
    meanCap(PM.cover), // 그림 뜻(주문 1116-1313 · index.html 첫 칠함 판도 같은 글)
    h('div', {class: 'sj-artw'},
      h('img', {class: 'sj-art', src: ART, width: '390', height: '470', alt: '붓 글씨 「' + NAME + '」 · 먼 산과 붓 한 획', decoding: 'async', fetchpriority: 'high'}),
      h('p', {class: 'sj-hwa'}, ...HWA.map(([w1, w2]) => h('span', {}, w1, h('i', {text: ' '}), w2)))),
    stepTag(1, dd)); // 오늘 한 장 자리(todayWait)는 지움 — 주문 1126-1748 「지금 첫번째 구역은 헷갈린다 삭제 하라」
}
/** 걸음 줄 끝의 자료 날 */
export const stepDay = dd => h('span', {class: 'sj-stepd', text: dd + ' 자료'});

/* 손자병법 한 폭(주문 1119-1648 — SCROLL · SCROLLK · scrollFig)은 지움(주문 1120-2116 · 사장님 2026-11-21(마카오) 00:24 「뒤에 있는 배경은 그대로 두고 첫 화면 중간에 있는 그림 지우면 돼」)
   그림 파일 su-sonja-scroll.svg 는 뒤 배경(su-bg.svg)을 만드는 바탕이라 그대로(scripts/atlas11/next/su_bg.py) */

/** 먼저 칠하는 판 — 머리 줄과 표지만 든 main(data-wait — 본문을 다 붙이고 채우면 뗌 · 검사가 기다림)
 *  root 에 index.html 이 든 판(.sj-pre)이 있으면 그것을 그대로 씀(pre = true · 다시 그리지 않음 — 첫 칠함 그대로) */
export function sonjaShell(root = null) {
  const top = root?.querySelector(':scope > header.sj-top.sj-pre'), main = root?.querySelector(':scope > main.sj-page.sj-pre');
  if (top && main && main.querySelector(':scope > .sj-cover img.sj-art')) {
    top.classList.remove('sj-pre'); main.classList.remove('sj-pre'); main.setAttribute('data-wait', '');
    bigText(top.querySelector('button.sj-bigtext'));
    const tools = top.querySelector('.sj-tools'); if (tools && !tools.querySelector('.sj-saytop')) tools.insertBefore(sayTop(), tools.querySelector('.sj-bigtext'));
    return {top, main, pre: true};
  }
  return {top: topBar(), main: h('main', {class: 'sj-page', 'data-page': 'sonja', 'data-wait': ''}, cover(null)), pre: false};
}

/* ── 쪽마다 같은 아래 판(주문 1115-2328) ── */
/** 끝 줄 — 사기 전에 멈춤 한 줄 · 출처 · 조사 날짜 · 꼭 있어야 할 길 둘 · 안전 문장(쪽마다 맨 아래) */
export function endSec(day, got = null, more = null) {
  return h('footer', {class: 'sj-end'},
    h('p', {class: 'sj-enough', text: '사기 전에 한 번 멈춰요.'}),
    h('p', {}, h('b', {text: '출처 '}), '네이버 증권 그날 마지막 값 · ' + josa(NAME, '가') + ' 센 지난 기록'),
    h('p', {}, h('b', {text: '조사 날짜 '}), '자료 ' + day + (got ? ' · 받은 때 ' + got : '')),
    more ? h('p', {text: more}) : null,
    h('p', {class: 'sj-links'}, ...FOOT.map(([href, t]) => h('a', {href}, h('span', {text: t}), h('i', {'aria-hidden': 'true', text: '›'})))),
    h('p', {class: 'sj-flinks', 'aria-label': '다른 길'}, // 천사 — 머리 줄에서 끝 줄로(주문 1119-2026 · 선물은 머리 줄에 그대로) · 찾기는 지움(주문 1120-0001 — 옛 화면으로 나가 「%」 붙은 결과가 보였음 · 참모 m02)
      h('a', {class: 'sj-fl', href: 'https://shin-yxy.gino.im/', target: '_blank', rel: 'noopener', 'aria-label': '천사 바로가기 · 새 창', text: '천사 ↗'})),
    h('p', {class: 'sj-safe sj-safe-end', text: SAFE}));
}
/** 듣기 — 쪽의 큰 제목과 [data-say] 줄을 차례로 읽음(다시 누르면 멈춤) */
function sayBtn() {
  const say = h('button', {class: 'sj-listen', type: 'button', 'aria-label': '읽어 주기', text: '듣기'});
  say.addEventListener('click', () => {
    try {
      const sy = window.speechSynthesis; if (!sy) return;
      if (sy.speaking) { sy.cancel(); return; }
      const t = [...document.querySelectorAll('#su .sj-h1, #su [data-say]')].map(e => e.innerText.replace(/\s+/g, ' ').trim()).filter(Boolean).join('. ');
      const u = new SpeechSynthesisUtterance(t); u.lang = 'ko-KR'; u.rate = 0.9; sy.speak(u);
    } catch { /* 읽어 주기가 없는 기기 */ }
  });
  return say;
}
/** 이야기 막대 — 다섯 화면 가운데 몇 번째(step · 길 밖 쪽은 null) · 듣기 · 다음 단추(nx = {href, label, k}) */
export function dockNav(step, nx) {
  return h('nav', {class: 'sj-dock', 'aria-label': '다음 화면'},
    step ? h('ol', {class: 'sj-prog', 'aria-label': '다섯 화면 가운데 ' + step + '번째'}, ...STEP5.map((x, i) => h('li', {class: i + 1 === step ? 'sj-pcur' : i + 1 < step ? 'sj-pdone' : '', 'aria-hidden': 'true'}))) : null,
    h('div', {class: 'sj-dk' + (nx ? '' : ' sj-dk1')}, sayBtn(),
      nx ? h('a', {class: 'sj-next', href: nx.href}, nx.k ? h('span', {class: 'sj-nk', text: nx.k}) : null, h('b', {text: nx.label}), h('i', {'aria-hidden': 'true', text: '›'})) : null));
}
/** 기록 갈래(주문 1124-1942 · 치지 짜임 1000가지 — 아래 탭 여덟을 다섯으로 · 장부 · 정산 · 분석 · 일지는 「기록」 탭 하나에 모으고 맨 위 갈래 단추로 나눔) */
export const REC4 = Object.freeze([['한눈에', '#/l/a'], ['장부', '#/l'], ['정산', '#/r/t'], ['분석', '#/l/d'], ['일지', '#/j'], ['산 회사', '#/l/b'], ['판 회사', '#/l/s']]); // 주문 1125-1144 「기록 탭에 … 탭을 두개 만들어줘 매수한종목 매동한 종목」 — 갈래 여섯(세 칸 두 줄)
/** 기록 갈래 줄 — cur = 켜진 갈래 차례(0 한눈에(주문 1125-2101) · 1 장부 · 2 정산 · 3 분석 · 4 일지 · 5 산 회사 · 6 판 회사) */
export function recNav(cur = 0) {
  const nav = h('nav', {class: 'sj-rec', 'aria-label': '기록 갈래 — ' + REC4.map(x => x[0]).join(' · ')}, REC4.map(([t, href], i) =>
    h('a', {class: 'sj-recb' + (i === cur ? ' sj-recon' : ''), href, 'aria-current': i === cur ? 'page' : null, text: t})));
  // 글자 탭 한 줄(주문 1126-0229) — 켜진 탭이 옆으로 밀려 안 보이면 가운데로 끌어옴
  const show = () => { const a = nav.querySelector('a.sj-recon'); if (a && nav.isConnected && nav.scrollWidth > nav.clientWidth + 1) nav.scrollLeft = Math.max(0, a.offsetLeft - (nav.clientWidth - a.offsetWidth) / 2); };
  requestAnimationFrame(() => requestAnimationFrame(show));
  return nav;
}
/** 탭 그림(주문 1117-1049 · 샘플 다) — 붓선 기호 다섯: 오늘 = 해 · 꾀 = 붓 · 멈춤 = 손바닥 · 일지 = 책 · 정산 = 엽전(글자는 그대로 · 그림은 읽지 않음) */
const TABP = Object.freeze([
  ['M12 4v2M12 18v2M4 12h2M18 12h2M6.3 6.3l1.4 1.4M16.3 16.3l1.4 1.4M6.3 17.7l1.4-1.4M16.3 7.7l1.4-1.4', 'c'],
  ['M5 19c2-1 3-3 4-5l7-9c1-1 3 0 2 2l-7 9c-2 2-4 3-6 3z', ''],
  ['M4 20V9l5-3v14M9 20V7l6-3v16M15 20v-9l5-2v11M3 20h18', ''], // 회사(주문 1120-1220)
  ['M8 12V6.5a1.5 1.5 0 0 1 3 0V11M11 10V5a1.5 1.5 0 0 1 3 0v5M14 10V6.5a1.5 1.5 0 0 1 3 0V14c0 3.5-2.5 6-6 6s-5-2-6-4l-1.5-3a1.5 1.5 0 0 1 2.6-1.5L8 13', ''],
  ['M6 3h10l3 3v15H6zM9 8h7M9 12h7M9 16h4', '']]); // 기록(주문 1124-1942 — 장부 · 정산 · 분석 · 일지를 한 탭에) — 줄 친 장부 한 권 // 분석(주문 1124-0432) — 막대 셋
const tabIco = i => { const [d, c] = TABP[i] ?? TABP[0]; return s('svg', {viewBox: '0 0 24 24', 'aria-hidden': 'true', focusable: 'false'}, c ? s('circle', {cx: 12, cy: 12, r: 3.6}) : null, s('path', {d})); };
/** 탭 다섯 — cur = 켜진 탭 차례(0 오늘 · 1 꾀 · 2 회사 · 3 멈춤 · 4 기록(장부 · 정산 · 분석 · 일지) · 탭 밖 쪽은 -1) · lc = 마지막에 본 회사 번호(멈춤 탭이 그 회사로) */
export function tabNav(cur = 0, lc = null) {
  return h('nav', {class: 'sj-tabs', 'aria-label': '탭 — ' + TAB6.map(x => x[0]).join(' · ')}, TAB6.map(([t, href], i) =>
    h('a', {class: 'sj-tab' + (i === cur ? ' sj-cur' : ''), href: i === 3 && lc ? '#/q/' + lc : href, 'aria-current': i === cur ? 'page' : null, 'aria-label': (i + 1) + '번째 · ' + t}, tabIco(i), h('span', {text: t}))));
}
