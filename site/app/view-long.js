/* ATLAS 11 · 「500만 원을 오래 들고 있었다면」(#/long) — 사장님 2026-10-07 05:27
   「365개 회사가 10년후 20년후 30년후 장기보유 했을시 500만원이 얼마가 될지를 … 삼성전자 하이닉스 네이버 gst 그리고 수많은 성장 기업 독점 기업 그리고 고배당 주식이
    어떻게 되는지 과거 자료를 기초로 해서 매우 보수적인 입장으로 나타내라 부동산과 상대 비교를 하라」
   · 앞날을 맞히지 않는다(10/4 15:37) — 지난 기록에서 가장 나빴던 10 · 20 · 30년 묶음을 다시 겪는다고 친 셈(끝난 해만 · 해마다 말 값 · 세금 · 수수료 뺌)
   · 셈 · 출처: reports/atlas11/study/500만 원을 오래 들고 있었다면 — 셈.md · 숫자마다 단위 · 화면마다 기준일 */
import {h} from './util.js';
import {foot} from './parts.js';
import {state} from './store.js';

const START = 500, CAP = 2000; // 만 원 — 막대 끝 = 2,000만 원(처음 돈의 4배) · 넘으면 끝에 꺾쇠
const HINDSIGHT = '살아남은 회사를 고른 것 — 사라진 회사가 빠져 실제보다 좋게 보임'; // 「오늘」은 날짜가 없는 말이라 쓰지 않음(또렷함 검사 1번)
/** [갈래, 갈래 덧말 | null, [[이름, {10: [만 원, 시작 해, 끝 해, 묶음 수] | null, 20, 30}, 덧말?]…]] — 묶음 = 그 기록 안 10 · 20 · 30년 묶음 수(가장 나쁜 하나를 보임) */
export const LONG = [
  ['시장 전체', null, [
    ['코스피 · 배당 넣음(가정)', {10: [349, 1988, 1998, 36], 20: [785, 1988, 2008, 26], 30: [1604, 1988, 2018, 16]}],
    ['코스피 · 값만', {10: [310, 1988, 1998, 36], 20: [620, 1988, 2008, 26], 30: [1125, 1988, 2018, 16]}],
  ]],
  ['아파트', null, [
    ['서울 아파트 · 값만', {10: [493, 1990, 2000, 31], 20: [1098, 2003, 2023, 21], 30: [1760, 1990, 2020, 11]}],
    ['전국 아파트 · 값만', {10: [475, 1990, 2000, 31], 20: [925, 2005, 2025, 21], 30: [1303, 1990, 2020, 11]}],
  ]],
  ['성장 기업', null, [
    ['코스닥 · 값만', {10: [101, 1999, 2009, 17], 20: [129, 1999, 2019, 7], 30: null}, '30년은 한 번뿐: 1996년 7월 1일 ~ 2026년 10월 2일 447만 원'],
  ]],
  ['이름난 회사', HINDSIGHT, [
    ['삼성전자', {10: [908, 2012, 2022, 21], 20: [2952, 2004, 2024, 11], 30: [32778, 1995, 2025, 1]}],
    ['SK하이닉스', {10: [7, 1998, 2008, 19], 20: [67, 1998, 2018, 9], 30: null}],
    ['NAVER', {10: [698, 2014, 2024, 14], 20: [5158, 2005, 2025, 4], 30: null}],
    ['GST', {10: [910, 2006, 2016, 10], 20: null, 30: null}],
  ]],
  ['독점 기업', HINDSIGHT, [
    ['한국전력', {10: [235, 2014, 2024, 21], 20: [373, 2004, 2024, 11], 30: [780, 1995, 2025, 1]}, '전기를 사서 파는 일을 혼자 함'],
    ['강원랜드', {10: [247, 2015, 2025, 15], 20: [461, 2005, 2025, 5], 30: null}, '한국 사람이 들어가는 카지노는 이곳 하나'],
    ['한국가스공사', {10: [185, 2013, 2023, 17], 20: [516, 2003, 2023, 7], 30: null}, '도시가스용 천연가스 도매를 혼자 함'],
    ['KT&G', {10: [485, 2011, 2021, 17], 20: [1577, 2005, 2025, 7], 30: null}, '담배 제조 독점은 2001년에 끝남'],
  ]],
  ['고배당', null, [
    ['MSCI 한국 고배당 지수 · 배당 넣음', {10: [722, 2012, 2022, 5], 20: [4444, 1998, 2018, 1], 30: null}],
  ]],
];
/** 물가 — 처음 500만 원의 값을 지키려면 있어야 했던 돈(가장 늦은 묶음) */
const PRICE = {10: [618, 2015, 2025], 20: [783, 2005, 2025], 30: [1106, 1995, 2025]};
const YEARS = [10, 20, 30];
const SRC = [
  ['https://en.wikipedia.org/wiki/KOSPI', '코스피 해마다 말 값(한국거래소 값)'],
  ['https://www.kcmi.re.kr/kcmifile/report_data/1215/reportpdf_1215.pdf', '배당 가정(해마다 1.19% · 자본시장연구원 1990년~2019년)'],
  ['https://github.com/FinanceData/marcap', '한국거래소 회사별 하루 값(1995년부터) — 회사 · 코스닥'],
  ['https://encykorea.aks.ac.kr/Article/E0068518', '코스닥 공식 값(1996년 7월 1일 시작 · 2000년 말)'],
  ['https://github.com/sonosgg-debug/streamlit-16-RealEstate', 'KB 아파트 매매가격지수(1986년부터)'],
  ['https://www.msci.com/documents/10199/0921932f-e387-424c-b6e3-3f5d8be4cfaf', 'MSCI 한국 고배당 지수(원화 · 배당 넣음)'],
  ['https://fred.stlouisfed.org/data/FPCPITOTLZGKOR', '물가(세계은행 · 한국 소비자물가)'],
  ['https://news.mtn.co.kr/news-detail/2022042816184812584', '한국전력 — 전기 판매 독점'],
  ['https://mobile.newsis.com/view/NISX20260715_0003711054', '강원랜드 — 내국인 카지노 하나'],
  ['https://newstomato.com/ReadNews.aspx?no=395455', '한국가스공사 — 천연가스 도매 독점'],
  ['https://sateconomy.co.kr/news/view/179588021028947', 'KT&G — 담배 제조 독점 2001년에 끝남'],
];
const man = v => `${v.toLocaleString('en-US')}만 원`;
const host = u => { try { return new URL(u).hostname.replace(/^www\./, ''); } catch { return u; } };
const sized = (el, prop, v) => { el.style[prop] = `${Math.max(1.5, Math.min(100, v / CAP * 100))}%`; return el; }; // 글자 안 스타일은 막힘(CSP) — CSSOM 으로

/** 맨 위 그림 — 10 · 20 · 30년마다 주식(코스피 · 배당 넣음) · 서울 아파트 가로 막대 둘 · 점선 = 처음 500만 원
    가로 막대: 말 74개에서 돈 글이 길어져도(17,600,000 ₩) 옆 막대 글과 겹치지 않게 — 긴 막대는 글을 막대 안에 */
function hbar(v, cls) {
  const w = Math.max(1.5, Math.min(100, v / CAP * 100));
  const fill = h('span', {class: 'lt-hfill ' + cls}); fill.style.width = `${w}%`;
  const hb = h('span', {class: 'lt-hb', 'data-w': String(w)}, fill, h('b', {class: 'lt-bv'}, man(v)));
  place(hb, 'out'); return hb;
}
/** 글 자리 — out: 막대 끝 바로 뒤 · in: 막대 안 끝 · end: 칸 맨 끝(글 바탕을 깔아 막대와 겹쳐도 읽힘) */
function place(hb, how) {
  const lab = hb.querySelector('.lt-bv'), w = Number(hb.dataset.w);
  lab.classList.toggle('lt-in', how === 'in'); lab.classList.toggle('lt-end', how === 'end');
  lab.style.insetInlineStart = how === 'out' ? `${w}%` : ''; lab.style.insetInlineEnd = how === 'in' ? `${100 - w}%` : how === 'end' ? '0' : '';
}
/** 말 74개 · 가장 큰 글씨에서도 칸 밖으로 나가지 않게 — 그려진 뒤(번역 뒤) 재어서 자리를 고름 · 칸 크기가 바뀌면 다시 */
function fitLabels(root) {
  for (const hb of root.querySelectorAll('.lt-hb')) {
    const lab = hb.querySelector('.lt-bv'), fill = hb.querySelector('.lt-hfill');
    const rtl = getComputedStyle(hb).direction === 'rtl', fits = () => { const T = hb.getBoundingClientRect(), L = lab.getBoundingClientRect(); return rtl ? L.left >= T.left - 0.5 : L.right <= T.right + 0.5; };
    place(hb, 'out'); if (fits()) continue;
    if (lab.getBoundingClientRect().width <= fill.getBoundingClientRect().width - 2) { place(hb, 'in'); continue; }
    place(hb, 'end');
  }
}
function hero() {
  const stock = LONG[0][2][0][1], home = LONG[1][2][0][1];
  return h('figure', {class: 'lt-hero', role: 'img', 'aria-label': `가장 나빴던 때를 다시 겪으면 — ${YEARS.map(y => `${y}년: 주식 ${man(stock[y][0])}, 서울 아파트 ${man(home[y][0])}`).join(' · ')}`},
    ...YEARS.map(y => h('div', {class: 'lt-grp'}, h('span', {class: 'lt-yr'}, `${y}년 뒤`), hbar(stock[y][0], 'lt-stock'), hbar(home[y][0], 'lt-home'))),
    h('figcaption', {class: 'lt-key'},
      h('span', null, h('i', {class: 'lt-dot lt-stock', 'aria-hidden': 'true'}), '주식 — 코스피 · 배당 넣음(가정)'),
      h('span', null, h('i', {class: 'lt-dot lt-home', 'aria-hidden': 'true'}), '서울 아파트 — 값만'),
      h('span', null, h('i', {class: 'lt-dot lt-mark', 'aria-hidden': 'true'}), '점선 = 처음 500만 원')));
}

/** 차례 번호(--i) — 막대가 위에서부터 차례로 자람(2026-10-07 18:31 「움직이는 도식화로」 · 10년 · 20년 · 30년을 바꾸면 다시 자람 · CSSOM) */
const order = (el, i) => { el.style.setProperty('--i', String(i)); return el; };
function rows(y) {
  return LONG.map(([title, warn, list]) => h('section', {class: 'lt-sec', 'aria-label': title},
    h('h2', {class: 'lt-h'}, title), warn ? h('p', {class: 'lt-warn'}, warn) : null,
    h('ul', {class: 'lt-list'}, ...list.map(([name, w, note], i) => {
      const r = w[y];
      return h('li', {class: 'lt-row'},
        h('span', {class: 'lt-top'}, h('span', {class: 'lt-name'}, name), r ? h('b', {class: 'lt-v ' + (r[0] < START ? 'lt-down' : 'lt-up')}, man(r[0])) : h('b', {class: 'lt-v lt-none'}, '기록이 짧아 셈하지 않음')),
        r ? h('span', {class: 'lt-track', 'aria-hidden': 'true'}, h('span', {class: 'lt-start'}), order(sized(h('span', {class: 'lt-fill ' + (r[0] < START ? 'lt-down' : 'lt-up') + (r[0] > CAP ? ' lt-over' : '')}), 'width', r[0]), i)) : null,
        r ? h('small', {class: 'lt-when'}, `${r[1]}년~${r[2]}년` + (r[3] > 1 ? ` · ${r[3]}번 가운데 가장 나쁨` : ' · 한 번뿐')) : null,
        note ? h('small', {class: 'lt-note'}, note) : null);
    }))));
}

export function renderLong(main, {manifest}) {
  let y = 10;
  const pick = h('div', {class: 'lt-seg', role: 'group', 'aria-label': '들고 있은 해'});
  const body = h('div', {class: 'lt-body'});
  const draw = () => {
    for (const b of pick.children) b.setAttribute('aria-pressed', String(Number(b.dataset.y) === y));
    body.replaceChildren(
      h('p', {class: 'lt-price'}, `물가: 처음 500만 원의 값을 지키려면 ${man(PRICE[y][0])}(${PRICE[y][1]}년~${PRICE[y][2]}년)`),
      ...rows(y));
  };
  for (const v of YEARS) { const b = h('button', {type: 'button', 'data-y': String(v)}, `${v}년 뒤`); b.addEventListener('click', () => { y = v; draw(); }); pick.append(b); }
  const stock = LONG[0][2][0][1], home = LONG[1][2][0][1];
  state.summary = `500만 원을 오래 들고 있었다면. 지난 기록에서 가장 나빴던 때를 다시 겪는다고 친 셈이고 앞날 값이 아닙니다. 2025년 12월 30일 종가까지 끝난 해만 셈했습니다. ${YEARS.map(v => `${v}년: 주식 ${man(stock[v][0])}, 서울 아파트 ${man(home[v][0])}`).join('. ')}.`;
  main.replaceChildren(h('article', {class: 'b-page lt-page'},
    h('a', {class: 'c-back', href: '#/start'}, '‹ ', '처음'),
    h('header', {class: 'b-head'},
      h('h1', {class: 'b-title', 'data-speak': ''}, '500만 원을 오래 들고 있었다면'),
      h('p', {class: 'b-when', 'data-speak': ''}, '지난 기록에서 가장 나빴던 때를 다시 겪는다고 친 셈 · 앞날 값이 아닙니다 · 2025년 12월 30일(화) 종가까지 끝난 해만')),
    hero(),
    h('ul', {class: 'lt-read'},
      h('li', {'data-speak': ''}, '가장 나빴던 때 = 그 기록의 10년 · 20년 · 30년 묶음 가운데 끝 돈이 가장 적은 묶음'),
      h('li', {'data-speak': ''}, '회사 이름은 살아남은 곳을 고른 것 — 사라진 회사가 빠져 있어 실제보다 좋게 보임'),
      h('li', {'data-speak': ''}, '아파트는 값만 — 월세 · 전세 돈과 세금 · 관리비는 뺌')),
    pick, body,
    h('details', {class: 'b-how lt-more'}, h('summary', null, '기준 · 숫자 자세히'),
      h('p', null, '해마다 12월 말 값으로 셈 · 2026년은 넣지 않음(끝난 해만) · 세금 · 수수료 뺌 · 돈 값은 그해 돈 그대로(물가를 빼지 않음)'),
      h('p', null, '주식은 값만(배당 뺌) — 코스피 한 줄만 배당을 해마다 1.19% 더한 가정 · 고배당 지수는 배당을 넣은 값'),
      h('p', null, '코스닥 2001년~2024년 말 값은 한국거래소 회사별 값으로 다시 셈한 값(공식 값과 2000년 · 2025년 말을 맞춤)'),
      h('p', null, '고배당 지수: 해마다 값은 2012년부터 · 1998년 말 값은 「1998년 말부터 해마다 13.88%」로 거꾸로 셈 · 2013년 전은 MSCI 가 나중에 셈한 값'),
      h('p', null, '찾지 못한 것: 코스피 고배당 50 지수의 해마다 값 · 아파트 월세 수익 · 회사마다 해마다 배당'),
      h('ul', {class: 'lt-src'}, ...SRC.map(([u, what]) => h('li', null, what, ' — ', h('a', {href: u, target: '_blank', rel: 'noopener noreferrer', 'data-ident': ''}, host(u)))))),
    foot(manifest)));
  draw();
  const fig = main.querySelector('.lt-hero');
  if (fig) { requestAnimationFrame(() => requestAnimationFrame(() => fitLabels(fig))); if (typeof ResizeObserver === 'function') new ResizeObserver(() => fitLabels(fig)).observe(fig); }
}
