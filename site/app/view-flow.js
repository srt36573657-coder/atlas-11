/* ATLAS 11 · 아래 탭 「돈 흐름」 안 「업종 순환」(#/flow/rotation) — 옛 아래 탭 「돈 흐름」 첫 화면(2026-10-08 17:41 마카오 시각 「돈에 흐름과 불장을 분리한다 · 별도에 탭을하나더 만들어라」)
   2026-10-08 20:19 「ATLAS 개편 실행 지시서」 6: 「실제 매매와 상대 강도를 분리하라」
   · 첫 화면 「투자자 매매」(#/flow · view-flowwho.js) = 실제 매매(공식 = 주식 수) · 이 화면 = 상대 강도
   · 그림의 금액 = 「시장 대비 시가총액 변화」(업종 시가총액 변화 − 시장 전체와 같은 비율로 움직였을 때의 변화 · 업종 73개를 더하면 0) — 실제 투자금 유입액 아님
     · 이름도 그렇게: 옛 「빠지는 곳 · 들어가는 곳 · 돈의 파장」 → 「줄어든 곳 · 늘어난 곳 · 강세 파장」(rotation.js) · 물줄기(화살표) = 상대 강세 변화(같은 돈이 옮겨 갔다는 증거 아님)
   · 날짜 셋을 나눔: 추정 시작일(나중에 확인한 바닥) · 최초 포착(저녁 기록) · 마지막 확인(판 만든 때)
   · 업종 강도 표: 시장(지수) 대비 20 · 5거래일 격차(%p) · 상승 참여(5거래일 상승 비율 vs 20거래일) · 가격과 외국인+기관 방향 */
import {h, korDate, stamp, place, finite} from './util.js';
import {state, loadBoard, loadLens} from './store.js';
import {foot, segNav, SECTOR_SEGS} from './parts.js';
import {loadStory, storyBox, storySay, storyEnd} from './story.js';
import {rotationBox, rotationEnd, rotationSay} from './rotation.js';
import {quietArt} from './scenes.js';
import {ppv, pctNum, howBox, idxName} from './lensparts.js';

function strengthBox(lens) {
  const fl = new Map((lens.flows?.groups ?? []).map(g => [g.id, g])), agreeTxt = {same: '같은 방향', diff: '반대 방향', na: '비교 불가'};
  const rows = [...lens.sectors].filter(s => finite(s.vs20)).sort((a, b) => b.vs20 - a.vs20);
  const tr = s => { const g = fl.get(s.id), wide = finite(s.d5.upRatio) && finite(s.d20.upRatio) ? (s.d5.upRatio > s.d20.upRatio ? '확대' : s.d5.upRatio < s.d20.upRatio ? '축소' : '같음') : '계산 불가';
    return h('tr', {'data-group': s.id}, h('th', {scope: 'row'}, h('a', {href: '#/i/' + s.id}, s.label)), h('td', null, ppv(s.vs20)), h('td', null, ppv(s.vs5)),
      h('td', null, `${pctNum(s.d20.upRatio)} → ${pctNum(s.d5.upRatio)} · ${wide}`), h('td', null, g ? agreeTxt[g.agree] : '자료 없음')); };
  const body = h('tbody'), more = h('button', {class: 'b-btn', type: 'button', onclick: () => { body.replaceChildren(...rows.map(tr)); more.hidden = true; }}, `${rows.length}개 모두 보기`);
  body.replaceChildren(...rows.slice(0, 10).map(tr)); more.hidden = rows.length <= 10;
  return h('section', {class: 'b-box rs-tbl', 'aria-label': '업종 강도'},
    h('h2', {class: 'b-box-h'}, `${idxName(lens)} 대비 업종 강도`, h('small', null, ` · ATLAS 업종 · 20거래일 격차가 큰 차례 · ${korDate(lens.asOf)} 종가`)),
    h('div', {class: 'c-scroll', 'data-scroll': 'x'}, h('table', {class: 'c-table'},
      h('thead', null, h('tr', null, ...['업종', '20거래일 격차', '5거래일 격차', '상승 참여(20거래일 → 5거래일)', '가격 · 외국인+기관 방향'].map(x => h('th', {scope: 'col'}, x)))), body)),
    more,
    h('p', {class: 'muted xs'}, '격차(%p) = 업종 평균 수익률 − 같은 기간 지수 수익률 · 상승 참여 = 상승 비율이 5거래일에 늘었나(확대) 줄었나(축소) · 방향 = 5거래일 업종 평균과 외국인+기관 순매수 추정액의 부호'));
}
function datesBox(rot, lens, manifest) {
  const p = rot?.pair;
  return h('section', {class: 'b-box rs-dates', 'aria-label': '날짜 셋'},
    h('h2', {class: 'b-box-h'}, '날짜 셋'),
    h('ul', null,
      h('li', null, h('b', null, '추정 시작일'), ' · ', p ? `${korDate(p.start)} — 나중에 확인한 바닥(그때 시스템이 알던 날이 아님)` : '없음'),
      h('li', null, h('b', null, '최초 포착'), ' · ', '업종 순환은 아직 고정 기록에 남기지 않음 — 저녁 기록(선정 결과)은 「검증」 탭'),
      h('li', null, h('b', null, '마지막 확인'), ' · ', `판 만든 때 ${stamp(manifest.generatedAt)}`)),
    h('p', {class: 'muted xs'}, '금액 = 시장 대비 시가총액 변화(실제 투자금 유입액 아님) · 그림의 물줄기 = 상대 강세 변화(같은 돈이 옮겨 갔다는 증거 아님)'));
}

export async function renderFlow(main, {manifest}) {
  const [board, st, lens0] = await Promise.all([loadBoard(), loadStory(), loadLens().catch(() => null)]);
  const lens = lens0 && !lens0.none ? lens0 : null;
  const rot0 = place.id === 'kr' ? st?.rotation : st?.rotations?.[place.id], rot = rot0 && !rot0.none && rot0.pair ? rot0 : null; // 바깥 판은 /story.json rotations
  state.summary = `${rotationSay(rot)}${st ? storySay(st) : ''}`;
  main.replaceChildren(h('div', {class: 'b-page fl-page'},
    segNav(SECTOR_SEGS, 'rotation', '업종 보기 바꾸기'), // 2026-10-09 업종 순환(상대 강도)은 아래 탭 「업종」 안
    rot ? rotationBox(rot, board) : quietArt({key: 'flow', label: '업종 순환', when: `${korDate(board.asOf)} 종가`}),
    datesBox(rot, lens, manifest),
    lens ? strengthBox(lens) : null,
    st ? storyBox(st, {withPlayer: false, title: '기사로 본 돈 이야기', fold: true}) : null,
    lens ? howBox(lens, ['시장 대비 시가총액 변화 = 업종 시가총액 변화 − 시장 전체와 같은 비율로 움직였을 때의 변화(업종을 모두 더하면 0)']) : null,
    rot ? rotationEnd(rot) : st ? storyEnd(st) : null, // 결 — 맨 아래(맨 끝 줄 바로 위) 결론 한 번 더(2026-10-07 20:04 「기승전결」)
    foot(manifest)));
}
