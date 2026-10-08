/* ATLAS 11 · 「불장 밖에서 많이 오른 22곳」(#/rise · 아래 탭 「22곳」) — 예측 없음
   2026-10-04 21:04 사장님 「… 다음 불장이 예상되는 22개 회사도 찾아내 180개 회사내에서」 → 10/5 02:44 「잡스였다면」 개혁에서 이름만 지난 일을 말하는 이름으로(셈법·22곳 그대로)
   2026-10-05 05:03 「불장 그리고 뭐뭐가 있잖아 그걸 탭 처리로 하지 지금은 밑으로 내려애ㅣㅑ 하잖아」 · 05:07 「해」 — 처음 화면 아래에 있던 목록을 자기 탭으로 옮김(내리지 않아도 보임)
   한 줄에 넷: 이름 · 업종 · 작은 선 그래프(22곳 같은 눈금) · ▲변화 · 누르면 회사 화면 */
import {riseArt, quietArt} from './scenes.js'; // 그림 한 장(풍등 · 규칙 33) · 0곳인 날은 빈 하늘(2026-10-08 05:05 빈 날 막기)
import {h, korDate, pct, signCls, place} from './util.js';
import {state, loadBoard} from './store.js';
import {foot, sparkSvg, sparkScale, segNav, STOCK_SEGS, movesBox, sunTag} from './parts.js';
import {sunOf} from './shapes.js';
import {mode} from './view-home.js';

/** 22곳 목록 — 다른 화면도 같은 줄 모양을 쓴다 */
export function nextList(items, byCode, shp = null) {
  if (!items.length) return h('p', {class: 'muted small'}, '불장 업종 밖에서 지난 20거래일 동안 오른 회사가 없습니다');
  const sc = sparkScale(items.map(x => byCode.get(x.code)).filter(Boolean));
  return h('ol', {class: 'nc-list'}, ...items.map(x => { const c = byCode.get(x.code);
    return h('li', null, h('a', {class: 'nc-row', href: '#/stock/' + x.code},
      h('span', {class: 'nc-mid'}, h('span', {class: 'nc-name'}, x.name, sunTag(shp?.sparkle.has(x.code))), h('small', {class: 'nc-ind'}, x.groupLabel ?? '')), // 태양 회사면 이름 곁 작은 해(「잡스가 … 36가지」 B3)
      c ? sparkSvg(c, sc) : h('span', {class: 'sp-none'}, '선 그래프 없음'),
      h('b', {class: 'chg20 nc-chg ' + (signCls(x.change20) || 'flat')}, pct(x.change20, 1)))); }));
}
export async function renderRise(main, {manifest}) {
  const board = await loadBoard();
  const items = board.next?.items ?? [], n = items.length, byCode = new Map(board.companies.map(c => [c.code, c]));
  const from = mode(board.companies.map(c => c.cFrom)), to = mode(board.companies.map(c => c.date)) ?? board.asOf;
  state.summary = `${korDate(to)} 종가 기준. 불장 밖에서 많이 오른 ${n}곳. ${items.slice(0, 3).map((x, i) => `${i + 1}. ${x.name} ${pct(x.change20, 1)}`).join(', ')}.`;
  main.replaceChildren(h('div', {class: 'b-page r-page'},
    segNav(STOCK_SEGS, 'rise', '종목 보기 바꾸기'), // 「ATLAS 개편 실행 지시서」(2026-10-08 20:19) — 예비 · 오름 상위는 아래 탭 「종목」 안
    riseArt(board) ?? quietArt({key: 'rise', label: '오름 상위', word: '0곳', when: `${korDate(board.asOf)} 종가`}), // 그림 한 장(풍등 · 규칙 33 · 0곳인 날은 빈 하늘) — 넣으면서 뺀 것: 아래 긴 설명 두 줄(「어떻게 셌나」로 접음)
    movesBox(board.moves), // 저녁 7시 들고 남 — 세 화면 같은 자리(옛 한 줄은 지움)
    h('header', {class: 'b-head'},
      h('h1', {class: 'b-title', 'data-speak': ''}, '오름 상위 ', h('span', {class: 'b-count'}, `${n}곳`)),
      h('details', {class: 'b-how ak-more'}, h('summary', null, '어떻게 셌나'), h('p', {class: 'b-when', 'data-speak': ''}, `불장 ${board.hot?.items?.length ?? 0}개 업종 밖 회사 ${n}곳 — 지난 20거래일 동안 많이 오른 차례 · 한 업종 ${board.next?.perIndustry ?? 2}곳까지 · ${from ? korDate(from) + '부터 ' : ''}${korDate(to)} ${place.close} 종가까지`),
        h('p', {class: 't-sub r-sub'}, `선 그래프는 ${n}곳이 같은 눈금(점선 = 첫날 종가) · 누르면 회사 화면`))),
    nextList(items, byCode, sunOf(board)),
    foot(manifest)));
}
