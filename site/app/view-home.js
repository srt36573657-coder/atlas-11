/* ATLAS 11 · 처음 화면 「52곳」(#/) — 예측 없음
   2026-10-04 15:37 사장님 「이제 예측을 하지 않는다 예측에 관련된 모든 기능과 화면을 삭제하고. 표현하지 마라」
   회사마다: 이름(누르면 회사 화면) · 업종 · 지난 종가와 전날 대비 · 출목표(지난 20거래일) · 다가오는 일정·공시(★ 중요도) 두 줄씩
   맨 위: 시장 띠 · 바뀔 52곳 미리 보기(바꾸기 전까지만) · 시장 전체 일정 · 읽는 법. 차례는 고른 차례 그대로(정렬하지 않음). */
import {h, korDate} from './util.js';
import {state, loadBoard, loadAgenda} from './store.js';
import {marketStrip} from './frame.js';
import {agendaBox, roadBox, marketBox, howBox, priceLine, nextBox, foot} from './parts.js';

function setBox(set, board) {
  const how = set?.how ?? [];
  return h('details', {class: 'b-how'}, h('summary', null, '어떤 회사들인가'),
    h('ul', null, ...how.map(x => h('li', null, x)), set?.selectedOn ? h('li', null, `${korDate(set.selectedOn)}에 고름`) : null, h('li', null, `차례: ${board.order}`)));
}
function card(c, agenda) {
  return h('section', {class: 'b-card', 'data-code': c.code, 'aria-label': c.name},
    h('a', {class: 'b-name-row', href: '#/stock/' + c.code}, h('span', {class: 'b-name'}, c.name), h('span', {class: 'b-sector'}, c.sector ?? ''), h('span', {class: 'b-go', 'aria-hidden': 'true'}, '›')),
    priceLine(c),
    roadBox(c.c, {from: c.cFrom}),
    agendaBox(agenda?.byCode?.[c.code] ?? null, {max: 2, builtDay: agenda?.sources?.disclosures?.day ?? null, code: c.code}));
}

export async function renderHome(main, {manifest}) {
  const [board, agenda] = await Promise.all([loadBoard(), loadAgenda().catch(() => null)]);
  const set = manifest.universeSet ?? {}, late = board.late ?? [];
  state.summary = `${set.label ?? '52곳'}. ${korDate(board.asOf)} 종가 기준입니다.`;
  main.replaceChildren(h('div', {class: 'b-page'},
    marketStrip(manifest),
    nextBox(manifest.universeNext),
    h('header', {class: 'b-head'},
      h('h1', {class: 'b-title', 'data-speak': ''}, set.label ?? '52곳'),
      h('p', {class: 'b-when', 'data-speak': ''}, `${korDate(board.asOf)} 15:30 종가 · 한국거래소 정규장`),
      ...late.map(c => h('p', {class: 'b-late'}, `${c.name}: ${c.date ? korDate(c.date) + ' 종가' : '종가 없음'} · ${korDate(board.asOf)} 종가는 아직 받지 못함`)),
      h('p', {class: 'b-lead'}, '회사마다 지난 주가, 출목표(지난 20거래일 오르내림), 다가오는 일정과 공시(★ 중요도)를 모았습니다 · 이름을 누르면 회사 화면')),
    setBox(set, board),
    marketBox(agenda, {max: 4}),
    howBox(agenda),
    h('div', {class: 'b-list'}, ...board.companies.map(c => card(c, agenda))),
    foot(manifest)));
}
