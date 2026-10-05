/* ATLAS 11 · 「불장 밖에서 많이 오른 22곳」(#/rise · 아래 탭 「22곳」) — 예측 없음
   2026-10-04 21:04 사장님 「… 다음 불장이 예상되는 22개 회사도 찾아내 180개 회사내에서」 → 10/5 02:44 「잡스였다면」 개혁에서 이름만 지난 일을 말하는 이름으로(셈법·22곳 그대로)
   2026-10-05 05:03 「불장 그리고 뭐뭐가 있잖아 그걸 탭 처리로 하지 지금은 밑으로 내려애ㅣㅑ 하잖아」 · 05:07 「해」 — 처음 화면 아래에 있던 목록을 자기 탭으로 옮김(내리지 않아도 보임)
   한 줄에 넷: 이름 · 업종 · 작은 선 그래프(22곳 같은 눈금) · ▲변화 · 누르면 회사 화면 */
import {h, korDate, pct, signCls} from './util.js';
import {state, loadBoard} from './store.js';
import {foot, sparkSvg, sparkScale} from './parts.js';
import {mode} from './view-home.js';

/** 22곳 목록 — 다른 화면도 같은 줄 모양을 쓴다 */
export function nextList(items, byCode) {
  if (!items.length) return h('p', {class: 'muted small'}, '불장 업종 밖에서 지난 20거래일 동안 오른 회사가 없습니다');
  const sc = sparkScale(items.map(x => byCode.get(x.code)).filter(Boolean));
  return h('ol', {class: 'nc-list'}, ...items.map(x => { const c = byCode.get(x.code);
    return h('li', null, h('a', {class: 'nc-row', href: '#/stock/' + x.code},
      h('span', {class: 'nc-mid'}, h('span', {class: 'nc-name'}, x.name), h('small', {class: 'nc-ind'}, x.groupLabel ?? '')),
      c ? sparkSvg(c, sc) : h('span', {class: 'sp-none'}, '선 그래프 없음'),
      h('b', {class: 'chg20 nc-chg ' + (signCls(x.change20) || 'flat')}, pct(x.change20, 1)))); }));
}
/** 저녁 7시 기록끼리 견준 22곳 들고 남 한 줄(기록이 둘 이상일 때만) */
function movesLine(mv) {
  if (!mv || mv.first) return null;
  const names = xs => xs.length ? xs.map(x => x.name).join(' · ') : '없음';
  return h('p', {class: 'r-moves small'}, h('b', null, `저녁 7시 기록 ${korDate(mv.from)} → ${korDate(mv.to)}`), ` · 새로 든 곳 ${mv.nextIn.length}곳(${names(mv.nextIn)}) · 빠진 곳 ${mv.nextOut.length}곳(${names(mv.nextOut)})`);
}

export async function renderRise(main, {manifest}) {
  const board = await loadBoard();
  const items = board.next?.items ?? [], n = items.length, byCode = new Map(board.companies.map(c => [c.code, c]));
  const from = mode(board.companies.map(c => c.cFrom)), to = mode(board.companies.map(c => c.date)) ?? board.asOf;
  state.summary = `${korDate(to)} 종가 기준. 불장 밖에서 많이 오른 ${n}곳. ${items.slice(0, 3).map((x, i) => `${i + 1}. ${x.name} ${pct(x.change20, 1)}`).join(', ')}.`;
  main.replaceChildren(h('div', {class: 'b-page r-page'},
    h('header', {class: 'b-head'},
      h('h1', {class: 'b-title', 'data-speak': ''}, `불장 밖에서 많이 오른 ${n}곳`),
      h('p', {class: 'b-when', 'data-speak': ''}, `불장 ${board.hot?.items?.length ?? 0}개 업종 밖 회사 가운데 지난 20거래일 동안 많이 오른 차례 · 한 업종 ${board.next?.perIndustry ?? 2}곳까지 · ${from ? korDate(from) + '부터 ' : ''}${korDate(to)} 15:30 종가까지`)),
    movesLine(board.moves),
    h('p', {class: 't-sub r-sub'}, `선 그래프는 ${n}곳이 같은 눈금(점선 = 첫날 종가) · 누르면 회사 화면`),
    nextList(items, byCode),
    foot(manifest)));
}
