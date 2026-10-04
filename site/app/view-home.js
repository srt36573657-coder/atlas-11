/* ATLAS 11 · 처음 화면(#/) — 예측 없음 · 「36칸 판」
   2026-10-04 21:04 사장님 「업종 36개에서 180개 회사를 찾아서 요즘 불장인 11개를 찾아내고 다음 불장이 예상되는 22개 회사도 찾아내 180개 회사내에서」
   2026-10-04 21:55 「자 이제 학습한것 이상으로 만들어」 — 잡스·애플에서 배운 것(집중은 아니오 · 세 번 안에 닿게 · 꾸밈 대신 배치로 위계 · 시안 10→3→1)을 넘어서:
     · 덩어리 열 개를 둘로 — ① 36칸 판(업종 36개를 지난 20거래일 변화 색으로 한 판에 · 1~11위는 「불장」) ② 다음 불장 후보 22곳
     · 칸을 누르면 그 업종 5곳(#/i/<업종>) → 회사를 누르면 회사 화면 — 두 번이면 어디든
     · 상자를 덧대지 않는다 — 큰 굵은 제목 · 간격 · 칸 색으로 무엇이 중요한지 보인다
   칸 색은 크기(지난 20거래일 평균 변화), 「불장」 글자는 차례(오른 업종 가운데 1~11위) — 색만으로 뜻을 전하지 않는다(글자 · 부호 · 차례 번호) */
import {h, korDate, pct, finite} from './util.js';
import {state, loadBoard} from './store.js';
import {marketStrip} from './frame.js';
import {nextBox, foot, kindBadge, heatOf, heatLegend, HEAT_KEY} from './parts.js';

const span = (from, to) => from && to ? `${korDate(from)}부터 ${korDate(to)}까지` : '';
/** 가장 많은 값(같으면 늦은 날) — 한 회사 종가가 늦어도 판 전체의 기간 글이 흔들리지 않게 */
const mode = xs => { const n = new Map(); for (const x of xs) if (x) n.set(x, (n.get(x) ?? 0) + 1); return [...n].sort((a, b) => b[1] - a[1] || (a[0] < b[0] ? 1 : -1))[0]?.[0] ?? null; };
/** 「업종 36개 · 우량주 114곳 · 시대 트렌드 51곳 · 흑자 11곳 · 채움 4곳」(없는 것은 빼고) */
export const kindsLine = (k, n) => [`업종 ${n}개`, `우량주 ${k.quality ?? 0}곳`, `시대 트렌드 ${k.trend ?? 0}곳`, k.profit ? `흑자 ${k.profit}곳` : null, k.size ? `채움 ${k.size}곳` : null].filter(Boolean).join(' · ');
export const upLine = g => g.measured ? (g.up === g.measured ? `${g.measured}곳 모두 오름` : g.up === 0 ? '오른 곳 없음' : `${g.measured}곳 중 ${g.up}곳 오름`) : '변화 없음';

/** 36칸 판의 칸 하나 — 누르면 그 업종 화면 */
function tile(g, i) {
  const heat = heatOf(g.change20);
  return h('a', {class: `t-tile heat-${heat}${g.hot ? ' t-hot' : ''}`, href: '#/i/' + g.id, 'data-group': g.id, 'aria-label': `${i + 1}위 ${g.label} · 지난 20거래일 ${finite(g.change20) ? pct(g.change20, 1) : '없음'} · ${upLine(g)}${g.hot ? ' · 불장' : ''}`},
    h('span', {class: 't-top'}, h('span', {class: 't-rank'}, `${i + 1}위`), g.hot ? h('span', {class: 't-fire'}, '불장') : null),
    h('span', {class: 't-name'}, g.label),
    h('span', {class: 't-chg'}, finite(g.change20) ? pct(g.change20, 1) : '없음'),
    h('span', {class: 't-up'}, upLine(g)));
}
/** 다음 불장 후보 — 불장 업종 밖에서 지난 20거래일 동안 많이 오른 회사(한 업종 2곳까지) */
function nextList(next) {
  const items = next?.items ?? [];
  if (!items.length) return h('p', {class: 'muted small'}, '불장 업종 밖에서 지난 20거래일 동안 오른 회사가 없습니다');
  return h('ol', {class: 'nc-list'}, ...items.map((x, i) => h('li', null,
    h('a', {class: 'nc-row', href: '#/stock/' + x.code},
      h('span', {class: 'hot-n'}, `${i + 1}위`),
      h('span', {class: 'nc-mid'}, h('span', {class: 'nc-name'}, x.name), h('span', {class: 'nc-sub'}, h('small', {class: 'nc-ind'}, x.groupLabel ?? ''), kindBadge(x.kind))),
      h('b', {class: 'chg20 nc-chg ' + (x.change20 > 0 ? 'up' : x.change20 < 0 ? 'down' : 'flat')}, pct(x.change20, 1))))));
}
function setBox(set, board, groups) {
  const how = set?.how ?? [];
  return h('details', {class: 'b-how'}, h('summary', null, '어떤 회사들인가 · 어떻게 셌나'),
    h('ul', null, ...how.map(x => h('li', null, x)), set?.selectedOn ? h('li', null, `${korDate(set.selectedOn)}에 고름`) : null,
      h('li', null, `업종 ${groups.length}개: 네이버 증권 업종 이름(화면에는 짧게 줄인 이름 · 업종 화면에 원래 이름) · 작은 업종 몇 개는 합침(보험 · 자동차·부품 · 인터넷·IT서비스 · 식품·담배 · 은행·카드 · 유통 · 운송 · 철강·금속 · 통신 · 전력·가스)`),
      h('li', null, '표시: 우량 = 우량 네 조건을 모두 넘음 · 트렌드 = 시대 트렌드 업종 · 흑자 = 둘 다 아니지만 최근 결산 흑자(업종 5곳을 채우려고 넣음) · 채움 = 업종 5곳을 채우려고 넣은 그 업종 큰 회사'),
      h('li', null, `칸 차례: ${board.order}`),
      h('li', null, '요즘 불장: 지난 20거래일 동안 업종 5곳 종가가 평균 많이 오른 업종(오른 업종만 · 11개까지) · 다음 불장 후보: 불장 업종 밖 회사 가운데 지난 20거래일 동안 많이 오른 회사(한 업종 2곳까지 · 22곳까지)'),
      h('li', null, `칸 색: ${HEAT_KEY}`),
      h('li', null, '둘 다 지난 종가로 센 차례입니다 · 앞날 값은 셈하지 않습니다')));
}

export async function renderHome(main, {manifest}) {
  const board = await loadBoard();
  const set = manifest.universeSet ?? {}, late = board.late ?? [], n = board.companies.length;
  const groups = board.groups?.length ? board.groups : [];
  const sizes = new Set(groups.map(g => g.codes.length)), per = sizes.size === 1 ? [...sizes][0] : null;
  const hot = board.hot?.items ?? [], from = mode(board.companies.map(c => c.cFrom)), to = mode(board.companies.map(c => c.date)) ?? board.asOf;
  state.summary = `요즘 불장 ${hot.length}개. ${hot.slice(0, 3).map((x, i) => `${i + 1}위 ${x.label} ${pct(x.change20, 1)}`).join(', ')}. ${korDate(board.asOf)} 종가 기준. 다음 불장 후보 ${board.next?.items?.length ?? 0}곳.`;
  main.replaceChildren(h('div', {class: 'b-page t-page'},
    marketStrip(manifest),
    nextBox(manifest.universeNext),
    h('header', {class: 'b-head'},
      h('h1', {class: 'b-title', 'data-speak': ''}, `요즘 불장 ${hot.length}개`),
      h('p', {class: 'b-when', 'data-speak': ''}, `${set.label ?? `${n}곳`} 가운데 · 지난 20거래일 · ${span(from, to)}`),
      ...late.map(c => h('p', {class: 'b-late'}, `${c.name}: ${c.date ? korDate(c.date) + ' 종가' : '종가 없음'} · ${korDate(board.asOf)} 종가는 아직 받지 못함`))),
    hot.length ? null : h('p', {class: 'b-note'}, '지난 20거래일 동안 평균이 오른 업종이 없습니다'),
    h('nav', {class: 't-grid', 'aria-label': `업종 ${groups.length}개 · 지난 20거래일 변화가 큰 차례`}, ...groups.map(tile)),
    heatLegend(),
    h('p', {class: 't-key muted xs'}, `칸 하나 = 업종 하나${per ? `(${per}곳)` : ''} · 누르면 그 업종 · 색 = 지난 20거래일 평균 변화 · 지난 종가로 센 차례(앞날 값 없음) · ${korDate(board.asOf)} 15:30 종가`),
    h('section', {class: 't-sec', 'aria-label': '다음 불장 후보'},
      h('h2', {class: 't-h2', 'data-speak': ''}, `다음 불장 후보 ${board.next?.items?.length ?? 0}곳`),
      h('p', {class: 't-sub'}, `불장 업종 밖에서 지난 20거래일 동안 많이 오른 회사 · 한 업종 ${board.next?.perIndustry ?? 2}곳까지 · 누르면 회사 화면`),
      nextList(board.next)),
    h('p', {class: 'b-kinds'}, board.kinds ? kindsLine(board.kinds, groups.length) : `${n}곳`),
    setBox(set, board, groups),
    foot(manifest)));
}
