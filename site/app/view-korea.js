/* ATLAS 11 · 「한국 주식시장은 몇 위인가」(#/korea) — 사장님 2026-10-07 05:29
   「대한민국이 다른 나라에 비해 얼마나 투자처로 우위인지 아니면 그러한지 등수와 논리와 자료로 제시하라」
   · 순위와 사실만(사라 · 팔라 · 앞날 말 없음) · MSCI 나라별 지수 안내서(2026-09-30 · 미국 달러 · 25개 시장) · 세계거래소연맹 · MSCI 시장 분류 · ACGA · 금융위원회
   · 조사 기록 reports/atlas11/study/한국 주식시장 몇 등 — 출처.md · 숫자마다 단위 · 화면마다 기준일 */
import {h} from './util.js';
import {foot} from './parts.js';
import {state} from './store.js';

/** [무엇, 한국 값, 순위, 견준 수, 1위(쪽 · 값), 출처 번호] — 순위는 글에 적은 쪽부터 셈(같은 값은 같은 순위) */
export const RANKS = [
  ['10년 수익(해마다 · 배당 넣음)', '15.74%', 2, 25, '높은 쪽부터 · 1위 대만 23.16%', 0],
  ['1년 수익', '151.66%', 1, 25, '높은 쪽부터 · 2위 대만 87.92%', 0],
  ['2000년 말부터 수익(해마다)', '13.70%', 1, 13, '높은 쪽부터 · 2위 대만 12.24%', 0],
  ['이익에 견준 값(PER)', '10.25배', 3, 25, '낮은 쪽부터 · 1위 브라질 9.66배', 0],
  ['장부에 견준 값(PBR)', '2.29배', 15, 25, '낮은 쪽부터 · 1위 홍콩 1.22배', 0],
  ['배당', '0.81%', 25, 25, '많은 쪽부터 · 1위 인도네시아 8.29%', 0],
  ['10년 오르내림 폭', '32.71%', 1, 25, '큰 쪽부터 · 가장 작은 곳 일본 14.27%', 0],
  ['오르내림에 견준 수익(10년 · 샤프 비율)', '0.53배', 8, 25, '높은 쪽부터 · 1위 대만 0.90배', 0],
  ['시장 크기(상장 회사 값 합)', '4.04조 달러', 8, 22, '큰 쪽부터 · 1위 미국 · 2026년 7월 말', 1],
  ['지배구조 점수', '57.1%', 8, 12, '높은 쪽부터 · 1위 호주 75.2% · 2023년 12월 13일', 3],
];
/** 논리 — 숫자를 함께 보면(사실만) */
const LOGIC = [
  ['수익은 앞쪽 · 흔들림은 가장 큼', '10년 수익 25곳 중 2위이지만 오르내림 폭이 가장 커서, 오르내림에 견준 수익은 8위'],
  ['값은 싼 쪽 · 배당은 가장 적음', '이익에 견준 값은 3번째로 낮고, 배당은 25곳 중 가장 적음(0.81%)'],
  ['두 회사 쏠림', '삼성전자 35.31% + SK하이닉스 27.58% = MSCI 한국 지수의 62.89%'],
  ['아직 신흥시장', 'MSCI 2026년 6월 23일 발표: 선진시장 관찰 대상에 넣지 않음 — 원화를 나라 밖에서 주고받지 못함 · 늘린 외환 시간의 거래가 적음'],
  ['코리아 디스카운트 숫자', '2023년 말 코스피 장부에 견준 값 1.05배 · 신흥국 10년 평균 1.58배 · 선진국 2.5배(금융위원회)'],
  ['바뀐 것(날짜)', '2024년 2월 26일 밸류업 · 2025년 7월 3일 · 2025년 8월 25일 · 2026년 2월 25일 상법 개정 · 지배구조 점수 2020년 52.9% → 2023년 57.1%'],
];
const SRC = [
  ['https://www.msci.com/documents/10199/255599/msci-korea-index-net.pdf', 'MSCI 한국 지수 안내서(2026년 9월 30일) — 수익 · 값 · 배당 · 오르내림 · 쏠림 · 다른 24개 시장도 같은 안내서'],
  ['https://focus.world-exchanges.org/issue/september-2026/market-statistics', '세계거래소연맹 시장 통계(2026년 7월 말)'],
  ['https://ir.msci.com/news-releases/news-release-details/msci-announces-results-msci-2026-market-classification-review', 'MSCI 2026년 시장 분류 발표(2026년 6월 23일)'],
  ['https://www.clsa.com/wp-content/uploads/2024/03/CG-Watch-2023-Overview-A-new-order_-Biggest-ranking-reshuffle-in-20-years-20231213.pdf', 'ACGA · CLSA 지배구조 평가 2023(12개 시장)'],
  ['https://www.kedglobal.com/korean-stock-market/newsView/ked202402260017', '금융위원회 숫자(2024년 2월 26일 보도)'],
  ['https://www.fsc.go.kr/eng/pr010101/81778', '금융위원회 밸류업 발표(2024년 2월 26일)'],
];
const host = u => { try { return new URL(u).hostname.replace(/^www\./, ''); } catch { return u; } };

/** 순위 띠 — 칸 n개 · 한국 칸만 칠함(1위가 왼쪽) */
function strip(rank, n) {
  const cells = [];
  for (let i = 1; i <= n; i++) { const c = h('i', {class: 'kr-c' + (i === rank ? ' kr-me' : '')}); c.style.setProperty('--i', String(i - 1)); cells.push(c); } // 차례 번호 — 칸이 1위부터 차례로 켜지고 한국 칸이 솟음(2026-10-07 18:31 「움직이는 도식화로」 · CSSOM)
  return h('span', {class: 'kr-strip', 'aria-hidden': 'true'}, ...cells);
}

export function renderKorea(main, {manifest}) {
  state.summary = `한국 주식시장은 몇 위인가. MSCI 나라별 지수, 미국 달러, 2026년 9월 30일 종가 기준. ${RANKS.map(([w, v, r, n]) => `${w} ${v}, ${n}곳 중 ${r}위`).join('. ')}.`;
  main.replaceChildren(h('article', {class: 'b-page kr-page'},
    h('a', {class: 'c-back', href: '#/start'}, '‹ ', '처음'),
    h('header', {class: 'b-head'},
      h('h1', {class: 'b-title', 'data-speak': ''}, '한국 주식시장은 몇 위인가'),
      h('p', {class: 'b-when', 'data-speak': ''}, 'MSCI 나라별 지수 25개 시장 · 미국 달러 · 2026년 9월 30일(수) 종가 기준 · 순위와 사실만')),
    h('ol', {class: 'kr-list'}, ...RANKS.map(([what, v, r, n, how]) => h('li', {class: 'kr-row'},
      h('span', {class: 'kr-top'}, h('span', {class: 'kr-w'}, what), h('b', {class: 'kr-v'}, v)),
      h('span', {class: 'kr-rank'}, h('b', null, `${n}곳 중 ${r}위`), h('small', null, how)),
      strip(r, n)))),
    h('section', {class: 'kr-logic', 'aria-label': '논리'},
      h('h2', {class: 'kr-h'}, '숫자를 함께 보면'),
      h('ul', null, ...LOGIC.map(([k, t]) => h('li', {'data-speak': ''}, h('b', null, k), h('span', null, t))))),
    h('details', {class: 'b-how kr-more'}, h('summary', null, '기준 · 출처 자세히'),
      h('p', null, '25개 시장: 미국 · 일본 · 중국 · 홍콩 · 대만 · 인도 · 한국 · 영국 · 독일 · 프랑스 · 스위스 · 캐나다 · 호주 · 브라질 · 멕시코 · 인도네시아 · 베트남 · 사우디 · 남아공 · 싱가포르 · 네덜란드 · 태국 · 말레이시아 · 필리핀 · 그리스'),
      h('p', null, '수익은 미국 달러 · 배당을 넣은 값 · 2000년 말부터는 같은 날 시작하는 13개 시장만 · 시장 크기는 영국 · 프랑스 · 네덜란드를 뺀 22개 나라'),
      h('p', null, '찾지 못한 것: 20년 수익(MSCI 안내서에 없음) · 영국 · 프랑스 · 네덜란드의 나라 단위 시장 크기'),
      h('ul', {class: 'kr-src'}, ...SRC.map(([u, what]) => h('li', null, what, ' — ', h('a', {href: u, target: '_blank', rel: 'noopener noreferrer', 'data-ident': ''}, host(u)))))),
    foot(manifest)));
}
