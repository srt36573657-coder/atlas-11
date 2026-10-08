/* ATLAS 11 · 업종 화면(#/i/<업종>) — 예측 없음
   2026-10-04 21:55 사장님 「자 이제 학습한것 이상으로 만들어」 — 36칸 판에서 칸 하나를 누르면 오는 곳(처음 화면 → 업종 → 회사, 두 번이면 어디든)
   맨 위: 업종 이름 · 불장 차례 · 지난 20거래일 평균 · 몇 곳이 올랐나
   「누가 끌었나」: 5곳의 지난 20거래일 변화를 가운데 0 에서 좌우로 뻗은 막대로 — 다섯이 함께 오른 업종인지, 한두 곳이 끌어올린 업종인지 한눈에
   22:51 「출목표만 있으면 않돼 그래프로 있어야 해 그리고 그 회사들 뉴스와 수급도」
   2026-10-05 02:44 「잡스였다면」 개혁 — 회사 카드 한 장에 넷만: 이름·20거래일 변화 · 선 그래프(5곳 같은 눈금) · 수급 한 줄 · 기사 한 줄
     (값 줄 · 출목표 · 일정·공시는 회사 화면에 그대로 — 지우지 않고 한 번 더 누른 곳으로 옮김 · 애플 WWDC20 「작은 칸엔 넷까지」 · 2008 HIG 「큰 그림 → 자세히」) */
import {h, korDate, pct, finite, signCls, place} from './util.js';
import {state, loadBoard} from './store.js';
import {moverBars, foot, sparkSvg, sparkScale, scaleText, flowLine, newsLine, sunTag, sunNum} from './parts.js';
import {sunOf, sunCount} from './shapes.js';
import {upLine} from './view-home.js';
import {riseDesc, familyOf, FAMILIES, OTHER} from './family.js';
import {industryComment, commentSay} from './comment.js'; // 논평(2026-10-07 03:17)
import {industryArt, quietArt} from './scenes.js'; // 그림 한 장(방패연 · 규칙 33) · 값이 비는 날은 빈 하늘(2026-10-08 05:05)

/** 회사 카드 — sun = 태양 회사면 이름 곁 작은 해(2026-10-05 15:24 「잡스가 … 36가지」 B3 · 카드는 그대로 넷) */
function card(c, scale, sun = false) {
  return h('section', {class: 'b-card', 'data-code': c.code, 'aria-label': c.name + (sun ? ' · 태양' : '')},
    h('a', {class: 'b-name-row', href: '#/stock/' + c.code}, h('span', {class: 'b-name'}, c.name), sunTag(sun),
      h('b', {class: 'chg20 b-c20 ' + (signCls(c.change20) || 'flat')}, finite(c.change20) ? pct(c.change20, 1) : '없음'), h('span', {class: 'b-go', 'aria-hidden': 'true'}, '›')),
    sparkSvg(c, scale),
    h('div', {class: 'bf-box'}, flowLine(c.brief), newsLine(c.brief)));
}

export async function renderIndustry(main, {hash, manifest}) {
  const id = hash.replace(/^#\/i\//, '');
  const board = await loadBoard();
  const k = (board.groups ?? []).findIndex(g => g.id === id), g = board.groups?.[k];
  // 들어온 탭으로(2026-10-05 「잡스라면」 17번) · 출목표 탭에서 회사 화면을 거쳐 왔으면 「‹ 출목표」(「잡스가 … 36가지」 E6 — 아래 탭과 되돌아가기가 같은 곳)
  // 지도의 갈래 화면(#/map/f/…)에서 왔으면 그 갈래로(2026-10-06 07:03 「3단 클릭」 — 땅 → 업종 → 회사를 거꾸로 되짚음)
  const from = state.origin; // 업종 · 회사 화면을 거쳐 오기 전 마지막 탭 화면(app.js — 회사 화면에 갔다 와도 그대로)
  const land = from === 'land' && state.land ? [...FAMILIES, OTHER].find(f => f.id === state.land) : null;
  // 되돌아가기 = 이 업종 화면에 들어온 화면(2026-10-08 20:19 「ATLAS 개편 실행 지시서」 — 아래 탭 다섯 · 탭 안 화면마다)
  const BACK = {map: ['#/map', '지도'], hot: ['#/hot', '불장'], road: ['#/road', '출목표'], stocks: ['#/stocks', '종목'], rotation: ['#/flow/rotation', '업종 순환'], flow: ['#/flow', '투자자 매매'], home: ['#/', '시장'], similar: ['#/similar', '예비'], rise: ['#/rise', '오름 상위'],
    agenda: ['#/agenda', '일정'], check: ['#/check', '선정 결과'], log: ['#/log', '운영 기록'], watch: ['#/watch', '관심종목']};
  const bk = BACK[from] ?? BACK.home;
  const back = land ? h('a', {class: 'c-back', href: '#/map/f/' + land.id}, '‹ ' + land.label) : h('a', {class: 'c-back', href: bk[0]}, '‹ ', bk[1]);
  if (!g) { main.replaceChildren(h('div', {class: 'b-page'}, back, quietArt({key: 'industry', label: '업종', tagText: '이 업종은 지금 판에 없습니다'}))); return; } // 없는 업종 주소도 그림 한 장(빈 하늘 · 알림 줄을 그림 이름표로 — 규칙 1)
  const byCode = new Map(board.companies.map(c => [c.code, c])), cs = g.codes.map(code => byCode.get(code)).filter(Boolean).sort(riseDesc); // 가장 많이 오른 곳부터(2026-10-05 11:36)
  const shp = sunOf(board), nSun = sunCount(shp, cs.map(c => c.code));
  const industries = [...new Set(cs.map(c => c.sector).filter(Boolean))], ksics = [...new Set(cs.map(c => c.ksic).filter(Boolean))], sc = sparkScale(cs), fday = cs.map(c => c.brief?.flows?.to).filter(Boolean).sort().at(-1) ?? null;
  // 「73칸 가운데」 → 「업종 73개 가운데」(2026-10-05 15:24 「잡스가 … 36가지」 C2 — 탭 「업종」 제목 「업종 73개」와 같은 말)
  const cm = industryComment(board, g);
  state.summary = `${commentSay(cm)}${g.label}. ${g.from && g.to ? `${korDate(g.from)}부터 ${korDate(g.to)}까지. ` : ''}업종 ${board.groups.length}개 가운데 ${k + 1}위${g.hot ? ', 불장' : ''}. 지난 20거래일 평균 ${finite(g.change20) ? pct(g.change20, 1) : '없음'}. ${upLine(g)}.${nSun ? ` 태양 ${nSun}곳.` : ''}`;
  main.replaceChildren(h('article', {class: 'b-page i-page', 'data-group': g.id},
    back,
    industryArt(board, g, upLine(g)) ?? quietArt({key: 'industry', label: g.label, tagText: '지난 20거래일', when: `${korDate(board.asOf)} 종가`}), // 그림 한 장(방패연 다섯 · 규칙 33 · 20거래일 값이 있는 회사가 없는 날은 빈 하늘) — 넣으면서 뺀 것: 논평 무대
    h('header', {class: 'b-head'},
      h('p', {class: 'i-rank'}, `업종 ${board.groups.length}개 가운데 ${k + 1}위`, g.hot ? h('span', {class: 't-fire'}, '불장') : null, sunNum(nSun, 'sun-n i-sun')),
      h('h1', {class: 'b-title', 'data-speak': ''}, g.label),
      h('p', {class: 'b-when', 'data-speak': ''}, '지난 20거래일 평균 ', h('b', {class: 'chg20 ' + (g.change20 > 0 ? 'up' : g.change20 < 0 ? 'down' : 'flat')}, finite(g.change20) ? pct(g.change20, 1) : '없음'), ` · ${upLine(g)}`),
      // 업종 이름 출처: 한국거래소 업종(한국표준산업분류 · 365곳 묶음부터) — 같은 칸 회사들의 네이버 증권 업종도 함께
      //   2026-10-05 15:24 「잡스가 … 36가지」 A4: 출처 이름 두세 줄은 접어 두고 기간 한 줄만 — 「누가 끌었나」가 첫 화면에
      g.from && g.to ? h('p', {class: 'i-src muted small'}, `${korDate(g.from)}부터 ${korDate(g.to)} ${place.close} 종가까지`) : null,
      h('details', {class: 'i-names'}, h('summary', null, '업종 이름 출처'),
        h('p', {class: 'muted small'}, place.industrySource ? `${place.industrySource}: ${industries.join(' · ')}` : `${ksics.length ? `한국거래소 업종: ${ksics.join(' · ')} · ` : ''}네이버 증권 업종: ${industries.join(' · ')}`))),
    h('section', {class: 't-sec', 'aria-label': '누가 끌었나'},
      h('h2', {class: 't-h2'}, '누가 끌었나'),
      h('p', {class: 't-sub'}, `${cs.length}곳의 지난 20거래일 변화 · 가운데 줄이 0% · 오른쪽 빨강은 오름, 왼쪽 파랑은 내림`),
      moverBars(cs)),
    h('section', {class: 't-sec', 'aria-label': `${g.label} ${cs.length}곳`},
      h('h2', {class: 't-h2'}, `${cs.length}곳`, h('small', null, ' · 지난 20거래일 많이 오른 순 · 누르면 회사 화면(출목표 · 일정 · 공시)')),
      h('p', {class: 't-sub'}, `${scaleText(sc)}${fday ? ` · 수급: ${korDate(fday)}까지 5거래일 합(외국인·기관 순매수)` : ''}`),
      h('div', {class: 'b-list'}, ...cs.map(c => card(c, sc, shp.sparkle.has(c.code)))),
      // 출목표의 그 업종 묶음으로(「잡스가 … 36가지」 E5) — 같은 큰 갈래 업종들의 출목표를 한 화면에서 견줌
      h('p', {class: 'i-road'}, h('a', {href: '#/road/g/' + g.id}, `출목표에서 「${familyOf(g.label).label}」 갈래와 함께 보기 ›`))),
    foot(manifest)));
}
