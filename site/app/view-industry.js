/* ATLAS 11 · 업종 화면(#/i/<업종>) — 예측 없음
   2026-10-04 21:55 사장님 「자 이제 학습한것 이상으로 만들어」 — 36칸 판에서 칸 하나를 누르면 오는 곳(처음 화면 → 업종 → 회사, 두 번이면 어디든)
   맨 위: 업종 이름 · 불장 차례 · 지난 20거래일 평균 · 몇 곳이 올랐나
   「누가 끌었나」: 5곳의 지난 20거래일 변화를 가운데 0 에서 좌우로 뻗은 막대로 — 다섯이 함께 오른 업종인지, 한두 곳이 끌어올린 업종인지 한눈에
   22:51 「출목표만 있으면 않돼 그래프로 있어야 해 그리고 그 회사들 뉴스와 수급도」
   2026-10-05 02:44 「잡스였다면」 개혁 — 회사 카드 한 장에 넷만: 이름·20거래일 변화 · 선 그래프(5곳 같은 눈금) · 수급 한 줄 · 기사 한 줄
     (값 줄 · 출목표 · 일정·공시는 회사 화면에 그대로 — 지우지 않고 한 번 더 누른 곳으로 옮김 · 애플 WWDC20 「작은 칸엔 넷까지」 · 2008 HIG 「큰 그림 → 자세히」) */
import {h, korDate, pct, finite, signCls} from './util.js';
import {state, loadBoard} from './store.js';
import {moverBars, foot, sparkSvg, sparkScale, scaleText, flowLine, newsLine} from './parts.js';
import {upLine} from './view-home.js';

function card(c, scale) {
  return h('section', {class: 'b-card', 'data-code': c.code, 'aria-label': c.name},
    h('a', {class: 'b-name-row', href: '#/stock/' + c.code}, h('span', {class: 'b-name'}, c.name),
      h('b', {class: 'chg20 b-c20 ' + (signCls(c.change20) || 'flat')}, finite(c.change20) ? pct(c.change20, 1) : '없음'), h('span', {class: 'b-go', 'aria-hidden': 'true'}, '›')),
    sparkSvg(c, scale),
    h('div', {class: 'bf-box'}, flowLine(c.brief), newsLine(c.brief)));
}

export async function renderIndustry(main, {hash, manifest}) {
  const id = hash.replace(/^#\/i\//, '');
  const board = await loadBoard();
  const k = (board.groups ?? []).findIndex(g => g.id === id), g = board.groups?.[k];
  if (!g) { main.replaceChildren(h('div', {class: 'b-page'}, h('a', {class: 'c-back', href: '#/'}, '‹ 처음 화면'), h('p', {class: 'b-note'}, '이 업종은 지금 판에 없습니다'))); return; }
  const byCode = new Map(board.companies.map(c => [c.code, c])), cs = g.codes.map(code => byCode.get(code)).filter(Boolean);
  const industries = [...new Set(cs.map(c => c.sector).filter(Boolean))], ksics = [...new Set(cs.map(c => c.ksic).filter(Boolean))], sc = sparkScale(cs), fday = cs.map(c => c.brief?.flows?.to).filter(Boolean).sort().at(-1) ?? null;
  state.summary = `${g.label}. ${g.from && g.to ? `${korDate(g.from)}부터 ${korDate(g.to)}까지. ` : ''}${board.groups.length}칸 가운데 ${k + 1}위${g.hot ? ', 불장' : ''}. 지난 20거래일 평균 ${finite(g.change20) ? pct(g.change20, 1) : '없음'}. ${upLine(g)}.`;
  main.replaceChildren(h('article', {class: 'b-page i-page', 'data-group': g.id},
    h('a', {class: 'c-back', href: '#/'}, `‹ 불장 ${board.hot?.items?.length ?? 0}개`),
    h('header', {class: 'b-head'},
      h('p', {class: 'i-rank'}, `${board.groups.length}칸 가운데 ${k + 1}위`, g.hot ? h('span', {class: 't-fire'}, '불장') : null),
      h('h1', {class: 'b-title', 'data-speak': ''}, g.label),
      h('p', {class: 'b-when', 'data-speak': ''}, '지난 20거래일 평균 ', h('b', {class: 'chg20 ' + (g.change20 > 0 ? 'up' : g.change20 < 0 ? 'down' : 'flat')}, finite(g.change20) ? pct(g.change20, 1) : '없음'), ` · ${upLine(g)}`),
      // 업종 이름 출처: 한국거래소 업종(한국표준산업분류 · 365곳 묶음부터) — 같은 칸 회사들의 네이버 증권 업종도 함께
      h('p', {class: 'i-src muted small'}, `${g.from && g.to ? `${korDate(g.from)}부터 ${korDate(g.to)}까지 · ` : ''}${ksics.length ? `한국거래소 업종: ${ksics.join(' · ')} · ` : ''}네이버 증권 업종: ${industries.join(' · ')}`)),
    h('section', {class: 't-sec', 'aria-label': '누가 끌었나'},
      h('h2', {class: 't-h2'}, '누가 끌었나'),
      h('p', {class: 't-sub'}, `${cs.length}곳의 지난 20거래일 변화 · 가운데 줄이 0% · 오른쪽 빨강은 오름, 왼쪽 파랑은 내림`),
      moverBars(cs)),
    h('section', {class: 't-sec', 'aria-label': `${g.label} ${cs.length}곳`},
      h('h2', {class: 't-h2'}, `${cs.length}곳`, h('small', null, ' · 시가총액 큰 순 · 누르면 회사 화면(출목표 · 일정 · 공시)')),
      h('p', {class: 't-sub'}, `${scaleText(sc)}${fday ? ` · 수급: ${korDate(fday)}까지 5거래일 합(외국인·기관 순매수)` : ''}`),
      h('div', {class: 'b-list'}, ...cs.map(c => card(c, sc)))),
    foot(manifest)));
}
