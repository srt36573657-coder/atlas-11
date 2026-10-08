/* ATLAS 11 · 업종 화면(#/i/<업종>) — 예측 없음
   2026-10-04 21:55 사장님 「자 이제 학습한것 이상으로 만들어」 — 36칸 판에서 칸 하나를 누르면 오는 곳(처음 화면 → 업종 → 회사, 두 번이면 어디든)
   맨 위: 업종 이름 · 불장 차례 · 지난 20거래일 평균 · 몇 곳이 올랐나
   「누가 끌었나」: 5곳의 지난 20거래일 변화를 가운데 0 에서 좌우로 뻗은 막대로 — 다섯이 함께 오른 업종인지, 한두 곳이 끌어올린 업종인지 한눈에
   22:51 「출목표만 있으면 않돼 그래프로 있어야 해 그리고 그 회사들 뉴스와 수급도」
   2026-10-05 02:44 「잡스였다면」 개혁 — 회사 카드 한 장에 넷만: 이름·20거래일 변화 · 선 그래프(5곳 같은 눈금) · 수급 한 줄 · 기사 한 줄
     (값 줄 · 출목표 · 일정·공시는 회사 화면에 그대로 — 지우지 않고 한 번 더 누른 곳으로 옮김 · 애플 WWDC20 「작은 칸엔 넷까지」 · 2008 HIG 「큰 그림 → 자세히」)
   2026-10-09 「ATLAS 업데이트 실행 프롬프트」 0-C · 6: 맨 위 그림 = 평균 펼치기(decomp.js) — 업종 평균 → 구성 종목마다 수익률 · 기여(%p)를 같은 축에 → 「상승 1위 제외」 → 앞뒤 평균 · 분모 → 「원래대로」
     · 값은 판 읽기(lens.json · 같은 20거래일 창 · 지연 · 기업행사 확인 종목은 분모에서 빼고 그 자리에 까닭) · 판 읽기를 못 읽은 날은 판 값 그림(scenes.js industryArt)
     넣으면서 뺀 것(규칙 1): 「누가 끌었나」 막대(같은 다섯 곳 · 같은 축 — 펼치기가 대신함) */
import {h, korDate, pct, finite, signCls, place} from './util.js';
import {state, loadBoard, loadLens} from './store.js';
import {foot, sparkSvg, sparkScale, scaleText, flowLine, newsLine, sunTag, sunNum} from './parts.js';
import {sunOf, sunCount} from './shapes.js';
import {upLine} from './view-home.js';
import {riseDesc, familyOf, FAMILIES, OTHER} from './family.js';
import {industryComment, commentSay} from './comment.js'; // 논평(2026-10-07 03:17) — 판 읽기를 못 읽은 날의 소리 요약
import {industryArt, quietArt} from './scenes.js'; // 판 읽기를 못 읽은 날의 대신 그림(판 값) · 값이 비는 날은 빈 축
import {decompFig, decompState, DECOMP_STATUS} from './decomp.js'; // 평균 펼치기(2026-10-09 「ATLAS 업데이트 실행 프롬프트」 0-C · 6 — 대표 조작)
import {sectorObservation} from './observe.js';
import {fmtPct, fmtPp, fin} from './calc.js';
import {idxName} from './lensparts.js';

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
  const [board, lens0] = await Promise.all([loadBoard(), loadLens().catch(() => null)]);
  const lens = lens0 && !lens0.none ? lens0 : null;
  const k = (board.groups ?? []).findIndex(g => g.id === id), g = board.groups?.[k];
  // 들어온 탭으로(2026-10-05 「잡스라면」 17번) · 출목표 탭에서 회사 화면을 거쳐 왔으면 「‹ 출목표」(「잡스가 … 36가지」 E6 — 아래 탭과 되돌아가기가 같은 곳)
  // 지도의 갈래 화면(#/map/f/…)에서 왔으면 그 갈래로(2026-10-06 07:03 「3단 클릭」 — 땅 → 업종 → 회사를 거꾸로 되짚음)
  const from = state.origin; // 업종 · 회사 화면을 거쳐 오기 전 마지막 탭 화면(app.js — 회사 화면에 갔다 와도 그대로)
  const land = from === 'land' && state.land ? [...FAMILIES, OTHER].find(f => f.id === state.land) : null;
  // 되돌아가기 = 이 업종 화면에 들어온 화면(2026-10-09 메인 탭 다섯: 시장 · 업종 · 종목 · 일정 · 검증 — 탭 안 화면마다)
  const BACK = {sectors: ['#/sectors', '업종 진단'], map: ['#/map', '지도'], hot: ['#/hot', '불장'], road: ['#/road', '출목표'], stocks: ['#/stocks', '종목'], rotation: ['#/flow/rotation', '업종 순환'], flow: ['#/flow', '투자자 매매'], market: ['#/market', '시장'], similar: ['#/similar', '예비'], rise: ['#/rise', '오름 상위'],
    agenda: ['#/agenda', '일정'], check: ['#/check', '선정 결과'], log: ['#/log', '운영 기록'], watch: ['#/watch', '관심'], cand: ['#/', '후보 7곳'], compare: ['#/compare', '다른 후보와 비교']}; // 2026-10-09 아래 탭 넷(후보 7 · 관심 · 검증 · 탐색)
  const bk = BACK[from] ?? BACK.cand;
  const back = land ? h('a', {class: 'c-back', href: '#/map/f/' + land.id}, '‹ ' + land.label) : h('a', {class: 'c-back', href: bk[0]}, '‹ ', bk[1]);
  if (!g) { main.replaceChildren(h('div', {class: 'b-page'}, back, quietArt({key: 'industry', label: '업종', tagText: '이 업종은 지금 판에 없습니다'}))); return; } // 없는 업종 주소도 그림 한 장(빈 축 · 알림 줄을 그림 이름표로 — 규칙 1)
  const byCode = new Map(board.companies.map(c => [c.code, c])), cs = g.codes.map(code => byCode.get(code)).filter(Boolean).sort(riseDesc); // 가장 많이 오른 곳부터(2026-10-05 11:36)
  const shp = sunOf(board), nSun = sunCount(shp, cs.map(c => c.code));
  const industries = [...new Set(cs.map(c => c.sector).filter(Boolean))], ksics = [...new Set(cs.map(c => c.ksic).filter(Boolean))], sc = sparkScale(cs), fday = cs.map(c => c.brief?.flows?.to).filter(Boolean).sort().at(-1) ?? null;
  // 평균 펼치기(판 읽기) — 값이 있는 종목은 수익률 큰 차례 · 값이 없는 종목은 맨 뒤(까닭)
  const lsc = lens?.sectors?.find(x => x.id === id) ?? null, o = lsc ? sectorObservation(lens, id) : null;
  let fig = null, head = null;
  if (lsc && o.n > 0) {
    const by = new Map(lens.stocks.map(x => [x.code, x])), ms = lsc.codes.map(c => by.get(c)).filter(Boolean);
    const valid = ms.filter(x => fin(x.r20)).sort((a, b) => b.r20 - a.r20 || a.code.localeCompare(b.code)), bad = ms.filter(x => !fin(x.r20));
    const unit = x => ({id: x.code, name: x.name, ident: true, href: '#/stock/' + encodeURIComponent(x.code), rets: fin(x.r20) ? [x.r20] : [], caps: fin(x.fund?.cap) && x.fund.cap > 0 ? [x.fund.cap] : null, why: fin(x.r20) ? null : `${DECOMP_STATUS[x.status] ?? '값 없음'} — 평균에서 뺌`});
    const units = [...valid.map(unit), ...bad.map(unit)], I = lens.market?.ref?.r20 ?? null;
    const capDay = valid.find(x => x.fund?.capDay)?.fund.capDay ?? null;
    fig = decompFig({key: 'ind-' + id, kind: 'stocks', units, label: g.label, kicker: g.label, when: `${ms.length}곳 · 최근 20거래일 · ${korDate(lens.asOf)} 종가`, title: o.text, topBy: 'ret', topWord: '상승 1위 제외해 비교', // 단추 이름 = 누르면 일어나는 일(셋째 개정본 0-D)
      refs: [{v: I, cls: 'idx'}], refKeys: [{cls: 'idx', label: `점 점선 = ${idxName(lens)} ${fmtPct(I)}`}], ref: {name: idxName(lens), v: I}, // 지수 대비 격차는 요약 칸에(같은 숫자를 두 번 적지 않음)
      counter: o.counter?.text ?? '반대 근거 없음',
      limits: ['오르내린 까닭은 이 계산으로 알 수 없음 — 공시 · 기사로 따로 확인', bad.length ? `값 없는 ${bad.length}곳(${[...new Set(bad.map(x => DECOMP_STATUS[x.status] ?? '값 없음'))].join(' · ')})은 평균에서 뺌` : null].filter(Boolean), // 아직 모르는 것(셋째 개정본 0-A ④ · 「원인」과 「구조」를 가름)
      nextLine: o.top ? [h('a', {class: 'dc-go', href: '#/stock/' + encodeURIComponent(o.top.code)}, h('span', {'data-ident': ''}, o.top.name), ' 회사 화면 · 근거와 일정 ›'), '종목을 누르면 그 회사 화면'] : '종목을 누르면 그 회사 화면 — 실적 · 재무 · 일정', capDay, // 다음 행동 = 상승 1위 종목의 근거 · 일정(통합본 0-E 「종목 · 사건 확인」)
      checkOf: ({base, top}) => ({id, n: base.n, total: units.length, mean: base.mean, median: base.median, up: base.up, lead: top >= 0 ? units[top].id : null, r0: top >= 0 ? units[top].rets[0] : null, exTop: top >= 0 ? decompState(units, new Set([top])).mean : null, wMean: base.wMean, u: 'pct'})});
    head = h('p', {class: 'b-when', 'data-speak': ''}, '최근 20거래일 평균 ', h('b', {class: 'chg20 ' + (o.m > 0 ? 'up' : o.m < 0 ? 'down' : 'flat')}, fmtPct(o.m)), ` · 값이 있는 ${o.n}곳 / 선정 ${o.total}곳 · 오른 곳 ${o.u}곳`);
  }
  if (!fig && lsc) fig = quietArt({key: 'industry', label: g.label, tagText: '값이 있는 종목이 없습니다', when: `${korDate(lens.asOf)} 종가`}); // 판 읽기는 있는데 값이 있는 종목이 0곳 — 빈 축(판 값으로 채우지 않음)
  fig ??= industryArt(board, g, upLine(g)) ?? quietArt({key: 'industry', label: g.label, tagText: '지난 20거래일', when: `${korDate(board.asOf)} 종가`}); // 판 읽기를 못 읽은 날 — 판 값 그림 · 값이 없는 날 — 빈 축
  head ??= h('p', {class: 'b-when', 'data-speak': ''}, '지난 20거래일 평균 ', h('b', {class: 'chg20 ' + (g.change20 > 0 ? 'up' : g.change20 < 0 ? 'down' : 'flat')}, finite(g.change20) ? pct(g.change20, 1) : '없음'), ` · ${upLine(g)}`);
  const cm = industryComment(board, g);
  state.summary = o ? `${o.text}. ${o.counter?.text ?? ''}. 업종 ${board.groups.length}개 가운데 ${k + 1}위${g.hot ? ', 불장' : ''}.` : `${commentSay(cm)}${g.label}. 업종 ${board.groups.length}개 가운데 ${k + 1}위${g.hot ? ', 불장' : ''}. 지난 20거래일 평균 ${finite(g.change20) ? pct(g.change20, 1) : '없음'}. ${upLine(g)}.${nSun ? ` 태양 ${nSun}곳.` : ''}`;
  main.replaceChildren(h('article', {class: 'b-page i-page', 'data-group': g.id},
    back,
    fig,
    h('header', {class: 'b-head'},
      h('p', {class: 'i-rank'}, `업종 ${board.groups.length}개 가운데 ${k + 1}위`, g.hot ? h('span', {class: 't-fire'}, '불장') : null, sunNum(nSun, 'sun-n i-sun')),
      h('h1', {class: 'b-title', 'data-speak': ''}, g.label),
      head,
      // 업종 이름 출처: 한국거래소 업종(한국표준산업분류 · 365곳 묶음부터) — 같은 칸 회사들의 네이버 증권 업종도 함께
      g.from && g.to ? h('p', {class: 'i-src muted small'}, `${korDate(g.from)}부터 ${korDate(g.to)} ${place.close} 종가까지 · 업종 차례는 판 값(종목마다 자기 마지막 21개 종가)`) : null,
      h('details', {class: 'i-names'}, h('summary', null, '업종 이름 출처'),
        h('p', {class: 'muted small'}, place.industrySource ? `${place.industrySource}: ${industries.join(' · ')}` : `${ksics.length ? `한국거래소 업종: ${ksics.join(' · ')} · ` : ''}네이버 증권 업종: ${industries.join(' · ')}`))),
    h('section', {class: 't-sec', 'aria-label': `${g.label} ${cs.length}곳`},
      h('h2', {class: 't-h2'}, `${cs.length}곳`, h('small', null, ' · 지난 20거래일 많이 오른 순 · 누르면 회사 화면(출목표 · 일정 · 공시)')),
      h('p', {class: 't-sub'}, `${scaleText(sc)}${fday ? ` · 수급: ${korDate(fday)}까지 5거래일 합(외국인·기관 순매수)` : ''}`),
      h('div', {class: 'b-list'}, ...cs.map(c => card(c, sc, shp.sparkle.has(c.code)))),
      // 출목표의 그 업종 묶음으로(「잡스가 … 36가지」 E5) — 같은 큰 갈래 업종들의 출목표를 한 화면에서 견줌
      h('p', {class: 'i-road'}, h('a', {href: '#/road/g/' + g.id}, `출목표에서 「${familyOf(g.label).label}」 갈래와 함께 보기 ›`))),
    foot(manifest)));
}
