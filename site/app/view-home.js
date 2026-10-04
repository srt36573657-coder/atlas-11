/* ATLAS 11 · 처음 화면(#/) — 예측 없음 · 업종으로 나눔 · 요즘 불장 업종 11개 · 다음 불장 후보 22곳
   2026-10-04 15:37 사장님 「이제 예측을 하지 않는다 예측에 관련된 모든 기능과 화면을 삭제하고. 표현하지 마라」
   2026-10-04 20:52 「대표 52개념도 삭제해 총 180개에서 섹타를 구분해」
   2026-10-04 21:04 「업종 36개에서 180개 회사를 찾아서 요즘 불장인 11개를 찾아내고 다음 불장이 예상되는 22개 회사도 찾아내 180개 회사내에서」
   맨 위: 시장 띠 · 바뀔 묶음 미리 보기(설정에 있을 때만) · 제목 · 요즘 불장 업종 11개 · 다음 불장 후보 22곳(둘 다 지난 20거래일 종가로 센 차례 · board.json hot/next)
   업종 칸: 지난 20거래일 오름이 큰 업종부터 · 접었다 펴는 칸(처음에는 첫 업종만) · 칸 안 카드는 펼칠 때 그린다 · 업종 안은 시가총액 큰 순
   회사 카드: 이름(누르면 회사 화면) · 우량/트렌드 표시 · 업종 · 지난 종가와 전날 대비 · 출목표 · 다가오는 일정·공시(★) 두 줄씩 */
import {h, korDate, pct, signCls, finite} from './util.js';
import {state, loadBoard, loadAgenda} from './store.js';
import {marketStrip} from './frame.js';
import {agendaBox, roadBox, marketBox, howBox, priceLine, nextBox, foot, kindBadge} from './parts.js';

/** 「업종 36개 · 우량주 114곳 · 시대 트렌드 51곳 · 흑자 11곳 · 채움 4곳」(없는 것은 빼고) */
export const kindsLine = (k, n) => [`업종 ${n}개`, `우량주 ${k.quality ?? 0}곳`, `시대 트렌드 ${k.trend ?? 0}곳`, k.profit ? `흑자 ${k.profit}곳` : null, k.size ? `채움 ${k.size}곳` : null].filter(Boolean).join(' · ');
const span = (from, to) => from && to ? `${korDate(from)}부터 ${korDate(to)}까지` : '';
const chg = v => h('b', {class: 'chg20 ' + signCls(v)}, finite(v) ? pct(v, 1) : '없음');

function setBox(set, board, groups) {
  const how = set?.how ?? [];
  return h('details', {class: 'b-how'}, h('summary', null, '어떤 회사들인가'),
    h('ul', null, ...how.map(x => h('li', null, x)), set?.selectedOn ? h('li', null, `${korDate(set.selectedOn)}에 고름`) : null,
      h('li', null, `업종 ${groups.length}개: 네이버 증권 업종 이름(화면에는 짧게 줄인 이름 · 회사 카드에 원래 이름) · 작은 업종 몇 개는 합침(보험 · 자동차·부품 · 인터넷·IT서비스 · 식품·담배 · 은행·카드 · 유통 · 운송 · 철강·금속 · 통신 · 전력·가스)`),
      h('li', null, '표시: 우량 = 우량 네 조건을 모두 넘음 · 트렌드 = 시대 트렌드 업종 · 흑자 = 둘 다 아니지만 최근 결산 흑자(업종 5곳을 채우려고 넣음) · 채움 = 업종 5곳을 채우려고 넣은 그 업종 큰 회사'),
      h('li', null, `차례: ${board.order}`),
      h('li', null, '요즘 불장 업종: 지난 20거래일 동안 업종 회사들의 종가가 평균 많이 오른 업종(오른 업종만 · 11개까지)'),
      h('li', null, '다음 불장 후보: 불장 업종 밖 회사 가운데 지난 20거래일 동안 많이 오른 회사(한 업종 2곳까지 · 22곳까지)'),
      h('li', null, '둘 다 지난 종가로 센 차례입니다 · 앞날 값은 셈하지 않습니다')));
}
function card(c, agenda) {
  return h('section', {class: 'b-card', 'data-code': c.code, 'aria-label': c.name},
    h('a', {class: 'b-name-row', href: '#/stock/' + c.code}, h('span', {class: 'b-name'}, c.name), kindBadge(c.kind), h('span', {class: 'b-sector'}, c.sector ?? ''), h('span', {class: 'b-go', 'aria-hidden': 'true'}, '›')),
    priceLine(c),
    roadBox(c.c, {from: c.cFrom, change: c.change20}),
    agendaBox(agenda?.byCode?.[c.code] ?? null, {max: 2, builtDay: agenda?.sources?.disclosures?.day ?? null, code: c.code}));
}
/** 업종 칸 하나 — 펼칠 때 카드를 그린다 */
function groupSection(g, byCode, agenda, open) {
  const list = h('div', {class: 'b-list'});
  const fill = () => { if (!list.childElementCount) list.append(...g.codes.map(code => byCode.get(code)).filter(Boolean).map(c => card(c, agenda))); };
  const kinds = [g.quality ? `우량 ${g.quality}곳` : null, g.trend ? `트렌드 ${g.trend}곳` : null, g.profit ? `흑자 ${g.profit}곳` : null, g.size ? `채움 ${g.size}곳` : null].filter(Boolean).join(' · ');
  const det = h('details', {class: 'g-sec', id: 'g-' + g.id, 'data-group': g.id},
    h('summary', {class: 'g-sum'}, g.hot ? h('span', {class: 'g-hot'}, '불장') : null, h('span', {class: 'g-label'}, g.label), h('b', {class: 'g-count'}, `${g.count}곳`),
      h('span', {class: 'g-chg'}, '20거래일 ', chg(g.change20)), kinds ? h('small', {class: 'g-kinds'}, kinds) : null),
    list);
  det.addEventListener('toggle', () => { if (det.open) fill(); });
  if (open) { fill(); det.open = true; }
  return {det, fill};
}
/** 요즘 불장 업종 — 지난 20거래일 평균 종가 변화가 큰 업종(오른 업종만) */
function hotBox(hot, go) {
  const items = hot?.items ?? [];
  const from = items.map(x => x.from).filter(Boolean).sort()[0], to = items.map(x => x.to).filter(Boolean).sort().at(-1);
  return h('section', {class: 'b-box hot', 'aria-label': '요즘 불장 업종'},
    h('h2', {class: 'b-box-h', 'data-speak': ''}, `요즘 불장 업종 ${items.length}개`, h('small', null, ` · 지난 20거래일 평균 · ${span(from, to)}`)),
    items.length ? h('ol', {class: 'hot-list'}, ...items.map((x, i) => h('li', null,
      h('button', {class: 'hot-row', type: 'button', 'data-group': x.id, onclick: () => go(x.id)},
        h('span', {class: 'hot-n'}, `${i + 1}위`), h('span', {class: 'hot-l'}, x.label), chg(x.change20),
        h('small', {class: 'hot-up'}, x.up === x.measured ? `${x.measured}곳 모두 오름` : `${x.measured}곳 중 ${x.up}곳 오름`))))) : h('p', {class: 'muted small'}, '지난 20거래일 동안 오른 업종이 없습니다'),
    h('p', {class: 'muted xs'}, '지난 종가로 센 차례입니다 · 앞날을 말하지 않습니다'));
}
/** 다음 불장 후보 — 불장 업종 밖에서 지난 20거래일 동안 많이 오른 회사(한 업종 2곳까지) */
function nextList(next) {
  const items = next?.items ?? [];
  return h('section', {class: 'b-box nextc', 'aria-label': '다음 불장 후보'},
    h('h2', {class: 'b-box-h', 'data-speak': ''}, `다음 불장 후보 ${items.length}곳`, h('small', null, ` · 불장 업종 밖에서 지난 20거래일 동안 많이 오른 회사 · 한 업종 ${next?.perIndustry ?? 2}곳까지`)),
    items.length ? h('ol', {class: 'nc-list'}, ...items.map((x, i) => h('li', null,
      h('a', {class: 'nc-row', href: '#/stock/' + x.code},
        h('span', {class: 'hot-n'}, `${i + 1}위`), h('span', {class: 'nc-name'}, x.name), kindBadge(x.kind), chg(x.change20), h('small', {class: 'nc-ind'}, x.groupLabel ?? ''))))) : h('p', {class: 'muted small'}, '불장 업종 밖에서 지난 20거래일 동안 오른 회사가 없습니다'),
    h('p', {class: 'muted xs'}, '「후보」는 지난 종가로 고른 이름입니다 · 앞날 값은 셈하지 않습니다'));
}

export async function renderHome(main, {manifest}) {
  const [board, agenda] = await Promise.all([loadBoard(), loadAgenda().catch(() => null)]);
  const set = manifest.universeSet ?? {}, late = board.late ?? [], n = board.companies.length;
  const byCode = new Map(board.companies.map(c => [c.code, c]));
  const groups = board.groups?.length ? board.groups : [{id: 'all', label: '모든 회사', count: n, quality: 0, trend: 0, codes: board.companies.map(c => c.code)}];
  const hotN = board.hot?.items?.length ?? 0, nextN = board.next?.items?.length ?? 0;
  state.summary = `${set.label ?? n + '곳'}. ${korDate(board.asOf)} 종가 기준입니다. 업종 ${groups.length}개로 나눴습니다. 요즘 불장 업종 ${hotN}개, 다음 불장 후보 ${nextN}곳.`;
  const sections = groups.map((g, i) => groupSection(g, byCode, agenda, i === 0));
  const go = id => { const k = groups.findIndex(g => g.id === id); if (k < 0) return; const {det, fill} = sections[k]; fill(); det.open = true; det.scrollIntoView({block: 'start'}); };
  // 업종 바로 가기(접어 둠) — 단추: 카드를 먼저 그리고(펼침 알림은 나중에 오므로) 펼친 뒤 그 업종을 화면 위로
  const jump = h('details', {class: 'b-how g-index'}, h('summary', null, `업종 ${groups.length}개 바로 가기`),
    h('nav', {class: 'g-jump', 'aria-label': '업종으로 가기'}, ...groups.map(g => h('button', {class: 'g-chip', type: 'button', 'data-group': g.id, onclick: () => go(g.id)}, h('span', null, g.label), h('b', null, `${g.count}곳`)))));
  main.replaceChildren(h('div', {class: 'b-page'},
    marketStrip(manifest),
    nextBox(manifest.universeNext),
    h('header', {class: 'b-head'},
      h('h1', {class: 'b-title', 'data-speak': ''}, set.label ?? `${n}곳`),
      h('p', {class: 'b-when', 'data-speak': ''}, `${korDate(board.asOf)} 15:30 종가 · 한국거래소 정규장`),
      board.kinds ? h('p', {class: 'b-kinds'}, kindsLine(board.kinds, groups.length)) : null,
      ...late.map(c => h('p', {class: 'b-late'}, `${c.name}: ${c.date ? korDate(c.date) + ' 종가' : '종가 없음'} · ${korDate(board.asOf)} 종가는 아직 받지 못함`)),
      h('p', {class: 'b-lead'}, `회사마다 지난 주가, 출목표(지난 20거래일 오르내림), 다가오는 일정과 공시(★ 중요도) · 업종을 누르면 펼쳐지고, 이름을 누르면 회사 화면`)),
    board.hot ? hotBox(board.hot, go) : null,
    board.next ? nextList(board.next) : null,
    jump,
    setBox(set, board, groups),
    marketBox(agenda, {max: 4}),
    howBox(agenda),
    h('div', {class: 'g-list'}, ...sections.map(x => x.det)),
    foot(manifest)));
}
