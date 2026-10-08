/* ATLAS 11 · 아래 탭 「돈 흐름」(#/flow) — 다섯 나라
   사장님 2026-10-08 17:41(마카오 시각) 「돈에 흐름과 불장을 분리한다 그리고 돈에 흐름에 관련된 종목들을 표기하라」 · 「별도에 탭을하나더 만들어라」
   · 탭 「불장」(#/) 맨 위에 있던 돈의 흐름을 이 탭으로 옮김 — 그림 한 장(빠지는 곳 · 들어가는 곳 1위~3위 · 기간 · 포모값 · 파장 · 낙관) · 기사로 본 돈 이야기(접힘) · 맨 아래 결
   · 새로 넣은 것: 1위~3위 업종마다 그 업종 회사(rotation.js rotationCos — 이름 · 지난 20거래일 종가 변화 · 오른 순 · 누르면 회사 화면)
   · 넣으면서 뺀 것(규칙 1): 탭 「불장」의 돈의 흐름 그림 · 기사로 본 돈 이야기 · 결(불장 탭은 불장만 — 맨 위는 불장 그림 한 장 scenes.js hotArt)
   · 돈의 흐름이 없는 날(거래일이 모자람 · /story.json 을 못 읽음)은 빈 하늘(규칙 33) */
import {h, korDate, place} from './util.js';
import {state, loadBoard} from './store.js';
import {foot} from './parts.js';
import {loadStory, storyBox, storySay, storyEnd} from './story.js';
import {rotationBox, rotationEnd, rotationSay} from './rotation.js';
import {quietArt} from './scenes.js';

export async function renderFlow(main, {manifest}) {
  const board = await loadBoard(), st = await loadStory();
  const rot0 = place.id === 'kr' ? st?.rotation : st?.rotations?.[place.id], rot = rot0 && !rot0.none && rot0.pair ? rot0 : null; // 바깥 판은 /story.json rotations
  state.summary = `${rotationSay(rot)}${st ? storySay(st) : ''}`;
  main.replaceChildren(h('div', {class: 'b-page fl-page'},
    rot ? rotationBox(rot, board) : quietArt({key: 'flow', label: '돈 흐름', when: `${korDate(board.asOf)} 종가`}),
    st ? storyBox(st, {withPlayer: false, title: '기사로 본 돈 이야기', fold: true}) : null,
    rot ? rotationEnd(rot) : st ? storyEnd(st) : null, // 결 — 맨 아래 결론 한 번 더(2026-10-07 20:04 「기승전결」)
    foot(manifest)));
}
