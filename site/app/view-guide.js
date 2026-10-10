/* ATLAS 11 · 한국 주식시장 안내(#/guide) — 사장님 2026-10-07 05:31 「외국인들 특히 한국에 상주하는 외국인들도 한국 주식시장을 제대로 알수 있게 하라」
   · 말 74개 언어판(2026-10-07 05:13)과 함께 — 어느 말로 보든 같은 줄을 그 말로(사전 i18n/<말>.json)
   · 줄마다 출처(공식 쪽 먼저: 한국거래소 · 금융감독원 DART · 넥스트레이드 · 정부 · 연구원 · 세금은 법무 · 회계법인 요약) · 기준 2026-10-07
   · 사실만 — 사라 · 팔라 · 앞날 말 없음 · 숫자마다 단위 · 조사 기록 reports/atlas11/study/한국 주식시장 안내 — 출처.md */
import {guideArt} from './scenes.js'; // 그림 한 장(해시계 · 규칙 33)
import {h} from './util.js';
import {foot} from './parts.js';
import {state} from './store.js';
import {playOnce} from './motion.js';

const AS_OF = '2026-10-07', AS_AT = '07:56'; // 조사를 마친 시각(reports/atlas11/study/한국 주식시장 안내 — 출처.md)
/** [제목, [줄, [출처 주소…]]…] — 줄은 짧게(휴대폰 한 줄 반 안쪽) */
export const GUIDE = [
  ['시장', [
    ['한국거래소(KRX)가 코스피 · 코스닥 · 코넥스 3개 시장을 운영합니다', ['https://global.krx.co.kr/contents/GLB/01/0109/0109000000/guide_to_trading_in_the_korean_stock_market.pdf']],
    ['2025년 말 상장회사: 코스피 847곳 · 코스닥 1,827곳 · 코넥스 115곳', ['https://resourcehub.bakermckenzie.com/en/resources/cross-border-listings-guide/asia-pacific/korea/topics/key-listing-venues']],
  ]],
  ['시간(한국 시각)', [
    ['정규장은 평일 오전 9시부터 오후 3시 30분까지', ['https://global.krx.co.kr/contents/GLB/01/0109/0109000000/guide_to_trading_in_the_korean_stock_market.pdf']],
    ['시작 값은 오전 8시 30분~9시, 마감 값은 오후 3시 20분~3시 30분 주문을 모아 한 값으로 정합니다', ['https://global.krx.co.kr/contents/GLB/06/0602/0602010201/GLB0602010201T6.jsp', 'https://securities.miraeasset.com/public/mw/guide/html/tradinghours.html']],
    ['2026년 9월 14일부터 오후 4시~8시 애프터마켓에서도 사고팝니다', ['https://biz.heraldcorp.com/article/10859829']],
    ['대체거래소 넥스트레이드(NXT · 2025년 3월 4일 개장)는 오전 8시~오후 8시에 엽니다', ['https://www.nextrade.co.kr/marketOverview/content.do']],
    ['새해 첫 거래일은 1시간 늦은 오전 10시에 시작합니다', ['https://magazine.hankyung.com/business/article/202512181165b']],
  ]],
  ['규칙', [
    ['하루 값은 전날 종가에서 위아래 30%까지만 움직입니다', ['https://global.krx.co.kr/contents/GLB/01/0109/0109000000/guide_to_trading_in_the_korean_stock_market.pdf']],
    ['주식과 돈은 거래일 2일 뒤(T+2)에 주고받습니다', ['https://global.krx.co.kr/contents/GLB/01/0109/0109000000/guide_to_trading_in_the_korean_stock_market.pdf']],
    ['화면 색은 오르면 빨강, 내리면 파랑 — 미국 · 유럽과 반대입니다', ['https://www.kcie.or.kr/mobile/guide/24/31/web_view?series_idx=&content_idx=1350']],
    ['값이 이상하게 뛴 종목은 투자주의 → 투자경고 → 투자위험 3단계로 지정됩니다', ['https://kbthink.com/stock/market-warning.html']],
    ['공매도는 2025년 3월 31일 모든 종목에서 다시 열렸습니다 · 개인은 사전교육 1시간과 모의거래를 먼저 마칩니다', ['https://www.kcmi.re.kr/common/downloadw?fid=27533&fgu=002001&fty=004003', 'https://www.kifin.or.kr/common/edu/6/detail.do']],
  ]],
  ['계좌', [
    ['한국에 사는 외국인은 외국인등록증(또는 여권)으로 증권사 계좌를 엽니다', ['https://open.shinhansec.com/phone/information/sim_if_024.jsp']],
    ['외국인 투자등록제는 2023년 12월 14일 없어져 미리 등록할 필요가 없습니다', ['https://www.clearstream.com/clearstream-en/res-library/market-coverage/investment-registration-certificate-abolished-in-south-korea']],
    ['한국에 살지 않는 개인은 여권번호로, 법인은 LEI로 계좌를 엽니다', ['https://www.koreaherald.com/article/3140383']],
  ]],
  ['세금(2026년)', [
    ['주식을 판 금액에 0.20%(코스피: 거래세 0.05% + 농특세 0.15% · 코스닥: 거래세 0.20%)', ['https://www.kimchang.com/ko/insights/detail.kc?sch_section=4&idx=34423']],
    ['배당은 한국 거주자 15.4%, 비거주자 22%를 떼고 받습니다(조세조약으로 낮아질 수 있음)', ['https://taxsummaries.pwc.com/republic-of-korea/individual/income-determination', 'https://taxsummaries.pwc.com/republic-of-korea/corporate/withholding-taxes']],
    ['장에서 판 상장주식 차익의 세금은 대주주만 냅니다(종목당 50억 원 이상 또는 지분 1% 이상 등)', ['https://eiec.kdi.re.kr/policy/materialView.do?num=255533&topic=']],
  ]],
  ['읽는 법', [
    ['회사 공시 원문은 DART(dart.fss.or.kr), 영어 공시는 englishdart.fss.or.kr에서 봅니다', ['https://dart.fss.or.kr/', 'https://englishdart.fss.or.kr/about/engAbout1.do']],
    ['화면의 숫자 단위', ['https://www.khan.co.kr/article/202004092049005'], [['만', '10,000'], ['억', '100,000,000'], ['조', '1,000,000,000,000']]], // 한국어 단위 글자(만 · 억 · 조)는 어느 말로 보든 그대로(lang="ko")
    ['쉬는 날: 토 · 일 · 공휴일 · 5월 1일 · 12월 31일', ['https://global.krx.co.kr/contents/GLB/01/0109/0109000000/guide_to_trading_in_the_korean_stock_market.pdf']],
    ['원 · 달러 외환시장은 2026년 7월 6일부터 하루 24시간(월 오전 6시~토 오전 6시) 열립니다', ['https://www.kcmi.re.kr/common/downloadw?fid=29090&fgu=002001&fty=004003']],
  ]],
];
const host = u => { try { return new URL(u).hostname.replace(/^www\./, ''); } catch { return u; } };

/* 하루 시간 띠(2026-10-07 18:27 사장님 「지금 글로 되어 있다 움직이는 도식화로 만들어라」 · 18:31 「과감하게 알틀란스를 전면 혁신하라」) — 갈래 「시간」 맨 위
   · 한국 시각 08:00 ~ 20:00 위에 막대 다섯 = 바로 아래 글 줄과 같은 사실(출처도 그 줄) — 넥스트레이드 · 시작 값 · 정규장 · 마감 값 · 애프터마켓
   · 보일 때 위에서부터 차례로 자람(motion.js · 처음 한 번) · 그림은 화면 읽기 프로그램에서 건너뜀(같은 사실을 아래 글 줄이 읽음) */
const DAY = [8, 20];
export const DAY_BARS = [['넥스트레이드', 8, 20, 'nxt'], ['시작 값', 8.5, 9, 'auc'], ['정규장', 9, 15.5, 'reg'], ['마감 값', 15 + 20 / 60, 15.5, 'auc'], ['애프터마켓', 16, 20, 'aft']]; // 옛 「NXT」(영어 약자가 두 번 · 2026-10-10 18:22 다섯 팀 전체 검토 — 구글 · 클로드팀) — 줄 글 「대체거래소 넥스트레이드(NXT · …)」에서 한 번 풂
const hm = x => `${String(Math.floor(x)).padStart(2, '0')}:${String(Math.round((x % 1) * 60)).padStart(2, '0')}`;
const at = x => `${((x - DAY[0]) / (DAY[1] - DAY[0]) * 100).toFixed(3)}%`;
function dayLine() {
  const rows = DAY_BARS.map(([label, a, b, kind], i) => {
    const bar = h('i', {class: 'gd-tb gd-' + kind}); bar.style.setProperty('--a', at(a)); bar.style.setProperty('--w', at(DAY[0] + b - a)); bar.style.setProperty('--i', String(i)); // 자리 · 길이 · 차례만 CSSOM
    return h('li', {class: 'gd-tr', 'data-kind': kind}, h('span', {class: 'gd-tl'}, h('b', kind === 'nxt' ? {'data-ident': ''} : null, label), ' ', h('span', {class: 'gd-tt'}, `${hm(a)}~${hm(b)}`)), h('span', {class: 'gd-tw'}, bar));
  });
  const ticks = [8, 14, 20].map(x => { const t = h('span', {class: 'gd-tk'}, hm(x)); t.style.setProperty('--a', at(x)); return t; });
  // 눈금 셋(08:00 · 14:00 · 20:00) — 글씨 200% · 360px 에서도 겹치지 않게
  const el = h('div', {class: 'gd-day', 'aria-hidden': 'true'}, h('ul', {class: 'gd-trs'}, ...rows), h('span', {class: 'gd-tks'}, ...ticks));
  playOnce('guide-day', el, {dur: 120 + DAY_BARS.length * 500}); // 막대 다섯이 하나씩(2026-10-07 19:40 「하나하나」)
  return el;
}

export function renderGuide(main, {manifest}) {
  state.summary = `한국 주식시장 안내. 기준 ${AS_OF.slice(0, 4)}년 ${Number(AS_OF.slice(5, 7))}월 ${Number(AS_OF.slice(8, 10))}일. ${GUIDE.map(([t, xs]) => `${t}: ${xs.map(x => x[0]).join(', ')}`).join('. ')}.`;
  main.replaceChildren(h('article', {class: 'b-page gd-page'},
    h('a', {class: 'c-back', href: '#/start'}, '‹ ', '처음'),
    guideArt(DAY_BARS, hm), // 그림 한 장(해시계 · 규칙 33) — 넣으면서 뺀 것: 갈래 여섯의 펼친 글(제목만 · 누르면 펼침 · 규칙 13)
    h('header', {class: 'b-head'},
      h('h1', {class: 'b-title', 'data-speak': ''}, '한국 주식시장 안내'),
      h('p', {class: 'b-when', 'data-speak': ''}, `한국에 사는 외국인도 바로 알 수 있게 · 기준 ${AS_OF.slice(0, 4)}년 ${Number(AS_OF.slice(5, 7))}월 ${Number(AS_OF.slice(8, 10))}일(수) ${AS_AT} KST · 줄마다 출처`)),
    ...GUIDE.map(([title, rows], i) => h('details', {class: 'gd-sec', 'aria-label': title},
      h('summary', {class: 'gd-h'}, h('span', {class: 'gd-n', 'aria-hidden': 'true'}), title), // 번호는 CSS 셈(counter) — 글로 넣으면 또렷함 검사가 단위 없는 숫자로 셈(2026-10-07 10:41) · 2026-10-08 갈래마다 접음(제목만 · 누르면 펼침)
      i === 1 ? dayLine() : null, // 갈래 「시간」 — 하루 시간 띠
      h('ul', {class: 'gd-list'}, ...rows.map(([t, src, units]) => h('li', {class: 'gd-row'},
        h('p', {class: 'gd-t', 'data-speak': ''}, t, units ? [': ', ...units.flatMap(([u, v], k) => [k ? ' · ' : '', h('b', {lang: 'ko', 'data-ident': ''}, u), ' = ', h('span', {'data-ident': ''}, v)])] : null),
        h('p', {class: 'gd-src'}, ...src.flatMap((u, k) => [k ? ' · ' : '', h('a', {href: u, target: '_blank', rel: 'noopener noreferrer', 'data-ident': ''}, host(u))]))))))),
    foot(manifest)));
}
