/* ATLAS 11 · 아래 탭 「돈 흐름」 첫 화면 「투자자 매매」(#/flow) — 「ATLAS 개편 실행 지시서」(사장님 2026-10-08 20:19 마카오 시각 첨부) 6
   · 공식 값 = 외국인 · 기관 · 개인 순매수 「주식 수」(네이버 증권 종목 투자자 동향) · 금액은 주식 수 × 그날 종가 = 「추정액」(공식 금액과 섞지 않음)
   · 1 · 5 · 10거래일 합 · 20거래일은 10거래일치만 모아 「계산 불가」 · 거래대금 대비 순매수 비율은 거래대금이 없어 「계산 불가」
   · 순매수 날 수 · 이어진 날 · 주체별 방향 차이 · 업종 · 종목 연결 · 가격과 방향이 같은지(5거래일)
   · 미국 판: 투자자별 매매를 날마다 공개하지 않음 — 만들어 넣지 않고 그렇다고 씀(업종 순환으로 가는 길)
   · 옛 「돈 흐름」(업종 순환 · 시가총액 비중 그림)은 「업종 순환」(#/flow/rotation)으로 옮김 — 지우지 않음 */
import {h, korDate, stamp, finite} from './util.js';
import {state, loadBoard, loadLens} from './store.js';
import {foot, segNav, MARKET_SEGS} from './parts.js';
import {flowWhoArt, quietArt} from './scenes.js';
import {pv, amt, sharesTxt, howBox, lensMissing, wonAmt} from './lensparts.js';

const WHO = [['foreign', '외국인'], ['institution', '기관'], ['individual', '개인']];
const persistTxt = p => (p ? `순매수 날 ${p.buyDays}/${p.days}일 · 순매도 날 ${p.sellDays}/${p.days}일 · 마지막 ${p.streak}일 ${p.streakSign > 0 ? '순매수' : p.streakSign < 0 ? '순매도' : '변화 없음'} 이어짐` : '계산 불가');
const coLink = x => h('a', {href: '#/stock/' + x.code, 'data-code': x.code}, h('span', {'data-ident': ''}, x.name));

function tableBox(F) {
  const M = F.market, cell = v => h('td', null, amt(v?.est), h('small', {class: 'muted'}, v?.estMissing ? ` · ${v.estMissing}곳 뺌` : ''));
  return h('section', {class: 'b-box fw-box', 'aria-label': '주체별 순매수'},
    h('h2', {class: 'b-box-h'}, '주체별 순매수 · 추정액', h('small', null, ` · ATLAS 선정 ${M.foreign.d1.of}곳 합 · 공식 금액 아님`)),
    h('div', {class: 'c-scroll', 'data-scroll': 'x'}, h('table', {class: 'c-table fw-t'},
      h('thead', null, h('tr', null, h('th', {scope: 'col'}, '주체'), h('th', {scope: 'col'}, '1거래일'), h('th', {scope: 'col'}, '5거래일'), h('th', {scope: 'col'}, '10거래일'), h('th', {scope: 'col'}, '20거래일'))),
      h('tbody', null, ...WHO.map(([k, label]) => h('tr', null, h('th', {scope: 'row'}, label), cell(M[k].d1), cell(M[k].d5), cell(M[k].d10), h('td', {class: 'muted'}, '계산 불가')))))),
    h('ul', {class: 'fw-p'}, ...WHO.map(([k, label]) => h('li', null, h('b', null, label), ` · 지난 ${M[k].persist.days}거래일: ${persistTxt(M[k].persist)}`))),
    h('p', {class: 'muted xs'}, F.d20.why, ' · ', F.ratio.why),
    F.provisional ? h('p', {class: 'b-note fw-prov'}, `${korDate(F.provisionalDay)} 값은 잠정(장 마감 뒤 다시 받아 바뀌면 고침)`) : null);
}
function dirLine(F) {
  const f = F.market.foreign.d5.est, i = F.market.institution.d5.est;
  if (!finite(f) || !finite(i)) return h('p', {class: 'mk-l'}, '주체별 방향: 계산 불가');
  const same = Math.sign(f) === Math.sign(i);
  return h('p', {class: 'mk-l'}, '5거래일 방향: 외국인 ', amt(f), ' · 기관 ', amt(i), ' — ', h('b', null, same ? '같은 방향' : '반대 방향'));
}
function groupsBox(F) {
  const gs = F.groups.filter(g => finite(g.fiEst5)), top = [...gs].sort((a, b) => b.fiEst5 - a.fiEst5).slice(0, 5), bot = [...gs].sort((a, b) => a.fiEst5 - b.fiEst5).slice(0, 5);
  const agreeTxt = {same: '가격과 같은 방향', diff: '가격과 반대 방향', na: '방향 비교 불가'};
  const row = g => h('li', {class: 'fw-g', 'data-group': g.id}, h('a', {href: '#/i/' + g.id}, g.label), ' ', amt(g.fiEst5), h('small', {class: 'muted'}, ' · 5거래일 가격 '), pv(g.r5), ' ', h('span', {class: 'lv-tag agr-' + g.agree}, agreeTxt[g.agree]));
  return h('section', {class: 'b-box', 'aria-label': '업종별 외국인 · 기관'},
    h('h2', {class: 'b-box-h'}, '업종별 외국인+기관 · 5거래일', h('small', null, ' · 추정액 · ATLAS 업종(5곳씩)')),
    h('h3', {class: 'ag-h'}, '순매수 큰 업종'), h('ol', {class: 'fw-list'}, ...top.map(row)),
    h('h3', {class: 'ag-h'}, '순매도 큰 업종'), h('ol', {class: 'fw-list'}, ...bot.map(row)),
    h('p', {class: 'muted xs'}, '가격과 같은 방향 = 5거래일 업종 평균 수익률과 외국인+기관 순매수 추정액의 부호가 같음 · 같은 돈이 다른 업종으로 옮겨 갔다는 뜻은 아님'));
}
function stocksBox(F) {
  const row = x => h('li', null, coLink(x), h('small', {class: 'muted'}, ` · ${x.gl ?? ''} · `), amt(x.est), h('small', {class: 'muted'}, ' · 5거래일 가격 '), pv(x.r5));
  const part = (title, xs) => [h('h3', {class: 'ag-h'}, title), xs.length ? h('ol', {class: 'fw-list'}, ...xs.map(row)) : h('p', {class: 'muted small'}, '없음')];
  return h('section', {class: 'b-box', 'aria-label': '종목별 순매수'},
    h('h2', {class: 'b-box-h'}, '종목별 · 5거래일', h('small', null, ' · 추정액 · 종목 화면에 날마다 주식 수(공식 값)')),
    ...part('외국인 순매수 큰 곳', F.top.foreignBuy), ...part('외국인 순매도 큰 곳', F.top.foreignSell),
    ...part('기관 순매수 큰 곳', F.top.instBuy), ...part('기관 순매도 큰 곳', F.top.instSell));
}

export async function renderFlowWho(main, {manifest}) {
  const [board, lens0] = await Promise.all([loadBoard(), loadLens().catch(() => null)]);
  const lens = lens0 && !lens0.none ? lens0 : null, F = lens?.flows;
  const nav = segNav(MARKET_SEGS, 'who', '시장 보기 바꾸기'); // 2026-10-09 투자자 매매(실제 매매)는 아래 탭 「시장」 안
  if (!F?.available) {
    state.summary = `투자자 매매 · ${F?.reason ?? '자료 없음'}`;
    main.replaceChildren(h('div', {class: 'b-page fw-page'},
      h('section', {class: 'mk-b', 'data-first': '1', 'aria-label': '투자자 매매'}, h('h2', {class: 'mk-h'}, '투자자 매매'),
        h('p', {class: 'mk-l'}, lens ? (F?.reason ?? '투자자별 매매 자료 없음') : lensMissing(lens0)), h('p', {class: 'mk-l'}, '값을 만들어 넣지 않습니다 · ', h('a', {href: '#/flow/rotation'}, '업종 순환 보기 ›'))),
      nav, quietArt({key: 'flowwho', label: '투자자 매매', when: `${korDate(board.asOf)} 종가`}), foot(manifest)));
    return;
  }
  const M = F.market;
  state.summary = `투자자 매매 · ${korDate(F.dates.at(-1))}까지 5거래일 추정액 · 외국인 ${wonAmt(M.foreign.d5.est)} · 기관 ${wonAmt(M.institution.d5.est)} · 개인 ${wonAmt(M.individual.d5.est)} · 공식 값 = 순매수 주식 수`;
  main.replaceChildren(h('div', {class: 'b-page fw-page'},
    h('section', {class: 'mk-b', 'data-first': '1', 'aria-label': '언제 · 무엇'}, h('h2', {class: 'mk-h'}, '투자자 매매'),
      h('p', {class: 'mk-l'}, h('b', null, `${korDate(F.dates[0])}~${korDate(F.dates.at(-1))} · ${F.dates.length}거래일`), ` · 모은 때 ${stamp(F.fetchedAt)}`),
      h('p', {class: 'mk-l'}, '공식 값 = 순매수 주식 수 · 금액 = 추정(주식 수 × 그날 종가) · 공식 순매매 금액은 모으지 않음'),
      dirLine(F)),
    nav,
    flowWhoArt(lens) ?? quietArt({key: 'flowwho', label: '투자자 매매', when: `${korDate(board.asOf)} 종가`}),
    tableBox(F), groupsBox(F), stocksBox(F),
    howBox(lens, ['추정액 = 날마다 순매수 주식 수 × 그날 종가의 합(공식 금액 아님) · 그날 종가가 없는 곳은 빼고 그 수를 적음', '기관은 연기금 포함 합계 · 출처: 네이버 증권 종목 투자자 동향', '거래대금 대비 순매수 비율 · 20거래일 누적: 자료가 없어 계산 불가']),
    foot(manifest)));
}
