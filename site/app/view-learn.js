/* ATLAS 11 · 읽는 법 연습 「같은 평균, 다른 구조」(#/learn · 위 막대 ⓘ 안내 안)
   2026-10-09 사장님 첨부 「ATLAS 업데이트 실행 프롬프트 — 직관적인 사용과 분석의 본질을 통합한 개정본」 0-E · 18-A
   · 연습용 세 묶음(실제 종목 · 실제 시장 값 아님) — 입력은 시험(tests/atlas11/calc.test.mjs · observe.test.mjs)과 같은 숫자 · 운영 화면에는 넣지 않음
   · 평균이 모두 +4% 인 세 묶음을 같은 부품(decomp.js)과 같은 관측 규칙(observe.js)으로 그림 — 묶음을 바꿔도 축 · 기간 · 비교 기준(가정한 시장 +5%)은 그대로
   · 앞날의 우열은 말하지 않음(이 숫자로 알 수 없음) */
import {h, korDate} from './util.js';
import {state} from './store.js';
import {foot} from './parts.js';
import {decompFig} from './decomp.js';
import {sectorObservation} from './observe.js';
import {median, fmtPct, fmtPp, poolMean, topIndex} from './calc.js';
import {axisOf} from './charts.js';

export const LEARN_SETS = [['A', [6, 5, 4, 3, 2]], ['B', [24, 1, 0, -2, -3]], ['C', [32, -2, -3, -3, -4]]];
export const LEARN_MARKET = 5; // 가정한 시장 수익률(%) — 같은 20거래일
const AX = axisOf([...LEARN_SETS.flatMap(x => x[1]), LEARN_MARKET]); // 세 묶음이 같은 축
const name = k => `${k + 1}번 종목`;
/** 관측 규칙(observe.js)이 읽는 모양 — 판 읽기와 같은 칸만 */
export function learnLens(vals) {
  const stocks = vals.map((v, k) => ({code: `L${k + 1}`, name: name(k), g: 'learn', r20: v, status: 'ok'}));
  return {stocks, sectors: [{id: 'learn', label: '연습 묶음', codes: stocks.map(s => s.code), d20: {median: median(vals)}}], market: {ref: {name: '시장(가정)', r20: LEARN_MARKET}}};
}
/** 한 묶음의 숫자(표 · 그림 · 검사기가 같이 씀) */
export function learnStats(vals) {
  const parts = vals.map(v => ({sum: v, count: 1})), m = poolMean(parts).mean, t = topIndex(vals), ex = poolMean(parts, new Set([t])).mean;
  return {mean: m, median: median(vals), up: vals.filter(v => v > 0).length, n: vals.length, top: t, topContrib: vals[t] / vals.length, restSum: m - vals[t] / vals.length, exTop: ex, gap: m - LEARN_MARKET};
}

function figOf(id) {
  const [, vals] = LEARN_SETS.find(x => x[0] === id), L = learnLens(vals), o = sectorObservation(L, 'learn'), st = learnStats(vals);
  const units = vals.map((v, k) => ({id: `L${k + 1}`, name: name(k), ident: false, href: null, rets: [v], caps: null, why: null}));
  return decompFig({key: 'learn', kind: 'stocks', units, label: `연습 ${id}`, kicker: `연습 ${id} · 실제 종목 아님`, when: '5곳 · 20거래일 수익률(연습용 숫자) · 시장 +5%는 가정',
    title: o.text, topBy: 'ret', topWord: '상승 1위 제외해 비교', axis: AX,
    refs: [{v: LEARN_MARKET, cls: 'idx'}], refKeys: [{cls: 'idx', label: `점 점선 = 시장(가정) ${fmtPct(LEARN_MARKET)}`}], ref: {name: '시장(가정)', v: LEARN_MARKET},
    counter: o.counter?.text ?? '반대 근거 없음',
    limits: ['연습용 숫자 — 실제 종목 · 실제 시장 아님', '평균이 같아도 그 뒤 수익률의 우열은 이 숫자로 알 수 없음'],
    nextLine: '위 단추로 묶음을 바꿔 평균 · 중앙값 · 오른 곳을 견줌', weighted: false,
    checkOf: () => ({set: id, n: st.n, mean: st.mean, median: st.median, up: st.up, exTop: st.exTop, gap: st.gap, kind: o.kind, u: 'pct'})});
}

export function renderLearn(main, {manifest}) {
  let pick = LEARN_SETS.some(x => x[0] === state.learn) ? state.learn : 'B'; // 처음엔 B(평균 +4% · 오른 곳 2곳 — 지시서의 화면 논리 예시)
  const slot = h('div', {class: 'lr-slot'});
  const btns = LEARN_SETS.map(([id]) => h('button', {type: 'button', class: 'dc-b lr-b', 'data-set': id, 'aria-pressed': String(id === pick), onclick: () => draw(id)}, `연습 ${id}`));
  function draw(id) {
    pick = id; state.learn = id;
    for (const b of btns) b.setAttribute('aria-pressed', String(b.dataset.set === id));
    const fig = figOf(id); fig.setAttribute('data-first', '4'); slot.replaceChildren(fig);
    state.summary = `읽는 법 연습. 같은 평균, 다른 구조. 연습 ${id}. ${fig.querySelector('.ra-t')?.textContent ?? ''}`;
  }
  const rows = LEARN_SETS.map(([id, vals]) => { const s = learnStats(vals);
    return h('tr', {'data-set': id}, h('th', {scope: 'row'}, `연습 ${id}`), h('td', null, vals.map(v => fmtPct(v)).join(' · ')), h('td', null, fmtPct(s.mean)), h('td', null, fmtPct(s.median)), h('td', null, `${s.up}/${s.n}곳`),
      h('td', null, `${fmtPp(s.topContrib)} · ${fmtPp(s.restSum)}`), h('td', null, fmtPct(s.exTop)), h('td', null, fmtPp(s.gap))); });
  main.replaceChildren(h('article', {class: 'b-page lr-page'},
    h('a', {class: 'c-back', href: '#/start'}, '‹ ', '처음'),
    h('header', {class: 'b-head', 'data-first': '1'},
      h('h1', {class: 'b-title', 'data-speak': ''}, '같은 평균, 다른 구조'),
      h('p', {class: 'b-when'}, '읽는 법 연습 · 연습용 숫자(실제 종목 · 실제 시장 아님) · 20거래일 수익률 · 시장 +5%는 가정', ...(manifest?.asOf ? [' · ', h('span', null, `${korDate(manifest.asOf)} 종가로 판을 만듦`)] : []))), // 다른 화면의 실제 자료 기준 시각(또렷함 3번 — 연습 숫자는 그 판 자료가 아님)
    h('p', {class: 'ob-say', 'data-first': '2'}, '세 묶음의 평균은 모두 +4.0%입니다 — 평균 하나만으로는 모두 고르게 올랐는지, 한 곳이 끌어올렸는지 알 수 없습니다'),
    h('div', {class: 'dc-tools lr-pick', role: 'group', 'aria-label': '연습 묶음 고르기', 'data-first': '3'}, ...btns),
    slot,
    h('section', {class: 'b-box lr-tbl', 'aria-label': '세 묶음 견주기', 'data-first': '5'},
      h('h2', {class: 'b-box-h'}, '세 묶음 견주기', h('small', null, ' · 같은 평균 · 같은 시장 · 다른 구조')),
      h('div', {class: 'c-scroll', 'data-scroll': 'x'}, h('table', {class: 'c-table'},
        h('thead', null, h('tr', null, ...['묶음', '5곳 수익률', '평균', '중앙값', '오른 곳', '1위 기여 · 나머지 합', '1위 제외 평균', '시장(가정) 대비'].map(x => h('th', {scope: 'col'}, x)))),
        h('tbody', null, ...rows))),
      h('p', {class: 'muted xs'}, '기여(%p) = 수익률 ÷ 5곳 · 모두 더하면 평균 · 1위 제외 평균 = 나머지 4곳 평균 · 시장 대비(%p) = 평균 − 시장(가정) · 셈은 calc.js(시험 tests/atlas11/calc.test.mjs)')),
    foot(manifest)));
  draw(pick);
}
