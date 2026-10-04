/* ATLAS 11 · 처음 화면(#/) — 예측 없음 · 갈래로 묶음
   2026-10-04 15:37 사장님 「이제 예측을 하지 않는다 예측에 관련된 모든 기능과 화면을 삭제하고. 표현하지 마라」
   2026-10-04 18:24 「알아서 해」(180곳 · 「우량주 그리고 시대 트랜드 주식만」): 회사를 시대 트렌드 8갈래 + 그 밖으로 묶는다
   맨 위: 시장 띠 · 바뀔 묶음 미리 보기(바꾸기 전까지만) · 제목 · 갈래 단추(누르면 그 갈래가 펼쳐지고 그 자리로 감)
   갈래 칸: 접었다 펴는 칸 — 처음에는 첫 갈래만 펴 둔다 · 칸 안 카드는 펼칠 때 그린다(180곳을 한꺼번에 그리지 않게) · 차례는 고른 차례 그대로
   회사 카드: 이름(누르면 회사 화면) · 우량/트렌드 표시 · 업종 · 지난 종가와 전날 대비 · 출목표 · 다가오는 일정·공시(★) 두 줄씩 */
import {h, korDate} from './util.js';
import {state, loadBoard, loadAgenda} from './store.js';
import {marketStrip} from './frame.js';
import {agendaBox, roadBox, marketBox, howBox, priceLine, nextBox, foot, kindBadge} from './parts.js';

function setBox(set, board) {
  const how = set?.how ?? [];
  return h('details', {class: 'b-how'}, h('summary', null, '어떤 회사들인가'),
    h('ul', null, ...how.map(x => h('li', null, x)), set?.selectedOn ? h('li', null, `${korDate(set.selectedOn)}에 고름`) : null, h('li', null, `차례: ${board.order}`),
      h('li', null, '갈래: 업종 이름으로 나눈 시대 트렌드 8갈래와 그 밖 — 어느 업종을 트렌드로 볼지는 ATLAS 가 정한 것')));
}
function card(c, agenda) {
  return h('section', {class: 'b-card', 'data-code': c.code, 'aria-label': c.name},
    h('a', {class: 'b-name-row', href: '#/stock/' + c.code}, h('span', {class: 'b-name'}, c.name), kindBadge(c.kind), h('span', {class: 'b-sector'}, c.sector ?? ''), h('span', {class: 'b-go', 'aria-hidden': 'true'}, '›')),
    priceLine(c),
    roadBox(c.c, {from: c.cFrom}),
    agendaBox(agenda?.byCode?.[c.code] ?? null, {max: 2, builtDay: agenda?.sources?.disclosures?.day ?? null, code: c.code}));
}
/** 갈래 칸 하나 — 펼칠 때 카드를 그린다 */
function groupSection(g, byCode, agenda, open) {
  const list = h('div', {class: 'b-list'});
  const fill = () => { if (!list.childElementCount) list.append(...g.codes.map(code => byCode.get(code)).filter(Boolean).map(c => card(c, agenda))); };
  const kinds = [g.quality ? `우량 ${g.quality}곳` : null, g.trend ? `트렌드 ${g.trend}곳` : null].filter(Boolean).join(' · ');
  const det = h('details', {class: 'g-sec', id: 'g-' + g.id, 'data-group': g.id},
    h('summary', {class: 'g-sum'}, h('span', {class: 'g-label'}, g.label), h('b', {class: 'g-count'}, `${g.count}곳`), kinds ? h('small', {class: 'g-kinds'}, kinds) : null),
    list);
  det.addEventListener('toggle', () => { if (det.open) fill(); });
  if (open) { fill(); det.open = true; }
  return {det, fill};
}

export async function renderHome(main, {manifest}) {
  const [board, agenda] = await Promise.all([loadBoard(), loadAgenda().catch(() => null)]);
  const set = manifest.universeSet ?? {}, late = board.late ?? [], n = board.companies.length;
  const byCode = new Map(board.companies.map(c => [c.code, c]));
  const groups = board.groups?.length ? board.groups : [{id: 'all', label: '모든 회사', count: n, quality: 0, trend: 0, codes: board.companies.map(c => c.code)}];
  state.summary = `${set.label ?? n + '곳'}. ${korDate(board.asOf)} 종가 기준입니다. 갈래 ${groups.length}개로 묶었습니다.`;
  const sections = groups.map((g, i) => groupSection(g, byCode, agenda, i === 0));
  // 단추: 카드를 먼저 그리고(펼침 알림은 나중에 오므로) 펼친 뒤 그 갈래를 화면 위로
  const jump = h('nav', {class: 'g-jump', 'aria-label': '갈래로 가기'},
    ...groups.map((g, i) => h('button', {class: 'g-chip', type: 'button', 'data-group': g.id, onclick: () => { const {det, fill} = sections[i]; fill(); det.open = true; det.scrollIntoView({block: 'start'}); }}, h('span', null, g.label), h('b', null, `${g.count}곳`))));
  main.replaceChildren(h('div', {class: 'b-page'},
    marketStrip(manifest),
    nextBox(manifest.universeNext),
    h('header', {class: 'b-head'},
      h('h1', {class: 'b-title', 'data-speak': ''}, set.label ?? `${n}곳`),
      h('p', {class: 'b-when', 'data-speak': ''}, `${korDate(board.asOf)} 15:30 종가 · 한국거래소 정규장`),
      board.kinds ? h('p', {class: 'b-kinds'}, `우량주 ${board.kinds.quality}곳 · 시대 트렌드 ${board.kinds.trend}곳`) : null,
      ...late.map(c => h('p', {class: 'b-late'}, `${c.name}: ${c.date ? korDate(c.date) + ' 종가' : '종가 없음'} · ${korDate(board.asOf)} 종가는 아직 받지 못함`)),
      h('p', {class: 'b-lead'}, '회사마다 지난 주가, 출목표(지난 20거래일 오르내림), 다가오는 일정과 공시(★ 중요도)를 모았습니다 · 갈래를 누르면 펼쳐지고, 이름을 누르면 회사 화면')),
    jump,
    setBox(set, board),
    marketBox(agenda, {max: 4}),
    howBox(agenda),
    h('div', {class: 'g-list'}, ...sections.map(x => x.det)),
    foot(manifest)));
}
