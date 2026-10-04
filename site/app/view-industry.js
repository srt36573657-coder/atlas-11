/* ATLAS 11 · 업종 화면(#/i/<업종>) — 예측 없음
   2026-10-04 21:55 사장님 「자 이제 학습한것 이상으로 만들어」 — 36칸 판에서 칸 하나를 누르면 오는 곳(처음 화면 → 업종 → 회사, 두 번이면 어디든)
   맨 위: 업종 이름 · 불장 차례 · 지난 20거래일 평균 · 몇 곳이 올랐나
   「누가 끌었나」: 5곳의 지난 20거래일 변화를 가운데 0 에서 좌우로 뻗은 막대로 — 다섯이 함께 오른 업종인지, 한두 곳이 끌어올린 업종인지 한눈에
   아래: 5곳 카드(시가총액 큰 순 · 이름을 누르면 회사 화면) — 종가 · 선 그래프 · 출목표 · 수급 · 이름이 든 최근 기사 · 일정·공시
   22:51 「출목표만 있으면 않돼 그래프로 있어야 해 그리고 그 회사들 뉴스와 수급도」 — 출목표 한 판 칸과 같은 그래프·수급·기사 */
import {h, korDate, pct, finite} from './util.js';
import {state, loadBoard, loadAgenda} from './store.js';
import {agendaBox, roadBox, priceLine, kindBadge, moverBars, howBox, foot, sparkSvg, sparkScale, scaleText, flowBars, newsLine} from './parts.js';
import {upLine} from './view-home.js';

function card(c, agenda, scale) {
  return h('section', {class: 'b-card', 'data-code': c.code, 'aria-label': c.name},
    h('a', {class: 'b-name-row', href: '#/stock/' + c.code}, h('span', {class: 'b-name'}, c.name), kindBadge(c.kind), h('span', {class: 'b-sector'}, c.sector ?? ''), h('span', {class: 'b-go', 'aria-hidden': 'true'}, '›')),
    priceLine(c),
    h('div', {class: 'gr-box'}, h('p', {class: 'gr-h'}, '선 그래프 · 지난 20거래일 종가', h('small', null, ' · 점선 = 첫날 종가 · 5곳 같은 눈금')), sparkSvg(c, scale)),
    roadBox(c.c, {from: c.cFrom, change: c.change20}),
    h('div', {class: 'bf-box'}, flowBars(c.brief), newsLine(c.brief)),
    agendaBox(agenda?.byCode?.[c.code] ?? null, {max: 2, builtDay: agenda?.sources?.disclosures?.day ?? null, code: c.code}));
}

export async function renderIndustry(main, {hash, manifest}) {
  const id = hash.replace(/^#\/i\//, '');
  const [board, agenda] = await Promise.all([loadBoard(), loadAgenda().catch(() => null)]);
  const k = (board.groups ?? []).findIndex(g => g.id === id), g = board.groups?.[k];
  if (!g) { main.replaceChildren(h('div', {class: 'b-page'}, h('a', {class: 'c-back', href: '#/'}, '‹ 처음 화면'), h('p', {class: 'b-note'}, '이 업종은 지금 판에 없습니다'))); return; }
  const byCode = new Map(board.companies.map(c => [c.code, c])), cs = g.codes.map(code => byCode.get(code)).filter(Boolean);
  const industries = [...new Set(cs.map(c => c.sector).filter(Boolean))];
  state.summary = `${g.label}. ${board.groups.length}칸 가운데 ${k + 1}위${g.hot ? ', 불장' : ''}. 지난 20거래일 평균 ${finite(g.change20) ? pct(g.change20, 1) : '없음'}. ${upLine(g)}.`;
  main.replaceChildren(h('article', {class: 'b-page i-page', 'data-group': g.id},
    h('a', {class: 'c-back', href: '#/'}, `‹ 요즘 불장 ${board.hot?.items?.length ?? 0}개`),
    h('header', {class: 'b-head'},
      h('p', {class: 'i-rank'}, `${board.groups.length}칸 가운데 ${k + 1}위`, g.hot ? h('span', {class: 't-fire'}, '불장') : null),
      h('h1', {class: 'b-title', 'data-speak': ''}, g.label),
      h('p', {class: 'b-when', 'data-speak': ''}, '지난 20거래일 평균 ', h('b', {class: 'chg20 ' + (g.change20 > 0 ? 'up' : g.change20 < 0 ? 'down' : 'flat')}, finite(g.change20) ? pct(g.change20, 1) : '없음'), ` · ${upLine(g)}`),
      h('p', {class: 'i-src muted small'}, `${g.from && g.to ? `${korDate(g.from)}부터 ${korDate(g.to)}까지 · ` : ''}네이버 증권 업종: ${industries.join(' · ')}`)),
    h('section', {class: 't-sec', 'aria-label': '누가 끌었나'},
      h('h2', {class: 't-h2'}, '누가 끌었나'),
      h('p', {class: 't-sub'}, `${cs.length}곳의 지난 20거래일 변화 · 가운데 줄이 0% · 오른쪽 빨강은 오름, 왼쪽 파랑은 내림`),
      moverBars(cs)),
    h('section', {class: 't-sec', 'aria-label': `${g.label} ${cs.length}곳`},
      h('h2', {class: 't-h2'}, `${cs.length}곳`, h('small', null, ' · 시가총액 큰 순 · 이름을 누르면 회사 화면')),
      h('p', {class: 't-sub'}, scaleText(sparkScale(cs))),
      h('div', {class: 'b-list'}, ...cs.map(c => card(c, agenda, sparkScale(cs))))),
    howBox(agenda),
    foot(manifest)));
}
