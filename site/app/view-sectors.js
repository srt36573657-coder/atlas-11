/* ATLAS 11 · 아래 탭 「업종」(#/sectors) — 2026-10-09 「ATLAS 업데이트 실행 프롬프트」(사장님 01:41 마카오 시각 첨부) 4 · 6 · 9
   메인 탭 다섯(시장 · 업종 · 종목 · 일정 · 검증)의 둘째 — 옛 탭 「돈 흐름」의 업종 순환 · 시장 안 불장 · 지도가 이 탭 안 보기로 옴(주소는 그대로)
   위에서 아래로: ① 기준 → ② 관측 한 문장(업종 폭) → ③ 핵심 수치 셋 → ④ 평균 펼치기(선정 표본 평균을 업종마다 기여로 · 「기여 1위 업종 제외」 · decomp.js) → ⑤ 다음 행동(기여 1위 업종의 구성 종목)
   그 아래: 업종 진단 목록(옛 시장 첫 화면에서 옮김 · 거르기 · 더 보기) · 공식 업종 · 규칙 · 계산 · 출처
   · ATLAS 업종(73개 · 5곳씩)과 공식 업종(네이버 업종)을 나눠 셈 · 실험 규칙(lens-rules-1 · obs-rules-1)은 검증 전이라고 적음 */
import {proFold} from './easy.js'; // 쉬운 말 화면에서 빽빽한 전문가 칸 접기(규칙 48)
import {h, korDate, place} from './util.js';
import {state, loadBoard, loadLens} from './store.js';
import {foot, segNav, SECTOR_SEGS} from './parts.js';
import {quietArt} from './scenes.js';
import {pv, ppv, sumLine, exclLine, howBox, lensMissing, LEVEL, TREND, RULE_LINES, tagEl, spanTxt, idxName} from './lensparts.js';
import {fmtPct, fmtPp, fin} from './calc.js';
import {sectorsObservation} from './observe.js';
import {decompFig, decompState} from './decomp.js';
import {blk, num, baseLine} from './view-market.js';

const line = (...kids) => h('p', {class: 'mk-l'}, ...kids);
/** 업종 카드 하나(기간 · 종목 수 · 평균 · 중앙값 · 오름/내림/보합 · 1위 제외 평균 · 5 · 20거래일 · 선정 vs 업종 전체 · 시가총액 커버리지) */
export function sectorCard(sc, lens) {
  return h('li', {class: 'sc-card', 'data-group': sc.id, 'data-level': sc.level, 'data-trend': sc.trend ?? ''},
    h('a', {class: 'sc-top', href: '#/i/' + sc.id},
      h('span', {class: 'sc-name'}, sc.label), h('span', {class: 'sc-tags'}, tagEl(sc.level, LEVEL, 'lvl'), tagEl(sc.trend, TREND, 'trd'), sc.hot ? h('span', {class: 'lv-tag hot'}, '불장') : null)),
    h('p', {class: 'sc-when muted xs'}, `${spanTxt(sc.from, sc.to, 20)} · 선정 ${sc.n}곳`, sc.official?.length ? ` · 공식 업종 ${sc.official.join(' · ')}` : ''),
    line('20거래일 ', sumLine(sc.d20)),
    line('5거래일 ', sumLine(sc.d5, {ex: false})),
    line(`${idxName(lens)} 대비 20거래일 `, ppv(sc.vs20), ' · 5거래일 ', ppv(sc.vs5)),
    h('p', {class: 'muted xs'}, '선정 5곳 vs 업종 전체: 자료 없음(선정 5곳만 모음) · 업종 시가총액 커버리지: 계산 불가(업종 전체 시가총액 없음)'),
    exclLine(sc.excluded));
}
/** 업종 진단 목록 — 거르기(동반 강세 · 일부 종목 주도 · 강세 확산 · 강세 약화 · 약세) · 처음 12개 · 더 보기 */
export function sectorList(lens, {first = 12} = {}) {
  const all = [...(lens.sectors ?? [])].sort((a, b) => (b.d20.mean ?? -Infinity) - (a.d20.mean ?? -Infinity));
  const F = [['all', '전체', () => true], ['broad', LEVEL.broad, s => s.level === 'broad'], ['narrow', LEVEL.narrow, s => s.level === 'narrow'], ['spread', TREND.spread, s => s.trend === 'spread'], ['fade', TREND.fade, s => s.trend === 'fade'], ['weak', LEVEL.weak, s => s.level === 'weak']];
  let cur = 'all', shown = first;
  const list = h('ol', {class: 'sc-list'}), more = h('button', {class: 'b-btn sc-more', type: 'button', onclick: () => { shown += 24; draw(); }}, '더 보기');
  const btns = F.map(([id, label, f]) => h('button', {class: 'f-seg-b sc-f', type: 'button', 'data-f': id, 'aria-pressed': String(id === cur), onclick: () => { cur = id; shown = first; draw(); }}, h('span', null, label), h('small', null, ` ${all.filter(f).length}개`)));
  function draw() {
    const xs = all.filter(F.find(x => x[0] === cur)[2]);
    list.replaceChildren(...xs.slice(0, shown).map(sc => sectorCard(sc, lens)));
    for (const b of btns) b.setAttribute('aria-pressed', String(b.dataset.f === cur));
    more.hidden = xs.length <= shown;
  }
  draw();
  return h('section', {class: 'b-box sc-box', id: 'mk-sectors', 'aria-label': '업종 진단'},
    h('h2', {class: 'b-box-h'}, '업종 진단', h('small', null, ` · ATLAS 업종 ${all.length}개 · 20거래일 평균이 큰 차례`)),
    h('div', {class: 'sc-fs', role: 'group', 'aria-label': '업종 거르기'}, ...btns),
    list, more,
    h('details', {class: 'b-how'}, h('summary', null, '규칙 · 실험 규칙(검증 전)'), h('ul', null, ...RULE_LINES.map(x => h('li', null, x)),
      h('li', null, '규칙 ', h('code', null, lens.rules?.id ?? '—'), ' · 기준 숫자는 ATLAS가 정함 · 맞는지 아직 검증하지 않음'))));
}

/** 평균 펼치기 재료(시장 → 업종) — 업종마다 값이 있는 종목 수익률 · 시가총액(억 원 · 선정 때) · 기여가 큰 차례(값이 없는 업종은 맨 뒤) */
export function sectorUnits(lens) {
  const by = new Map((lens?.stocks ?? []).map(s => [s.code, s]));
  const us = (lens?.sectors ?? []).map(sc => {
    const ms = (sc.codes ?? []).map(c => by.get(c)).filter(Boolean), ok = ms.filter(s => fin(s.r20));
    const caps = ok.map(s => s.fund?.cap ?? null);
    return {id: sc.id, name: sc.label, href: '#/i/' + sc.id, rets: ok.map(s => s.r20), caps: caps.every(c => fin(c) && c > 0) ? caps : null, total: ms.length};
  });
  const sumOf = u => (u.rets.length ? u.rets.reduce((t, r) => t + r, 0) : -Infinity);
  return us.sort((a, b) => sumOf(b) - sumOf(a) || a.id.localeCompare(b.id));
}

export async function renderSectors(main, {manifest}) {
  const [board, lens0] = await Promise.all([loadBoard(), loadLens().catch(() => null)]);
  const lens = lens0 && !lens0.none ? lens0 : null;
  const nav = segNav(SECTOR_SEGS, 'sectors', '업종 보기 바꾸기');
  if (!lens) {
    state.summary = `${korDate(board.asOf)} 종가 · 판단 보류`;
    main.replaceChildren(h('div', {class: 'b-page sx-page'}, nav,
      blk(1, '기준', baseLine(board, null, manifest), lensMissing(lens0)),
      blk(2, '관측', h('p', {class: 'ob-say'}, '판단 보류 — 판 읽기 파일을 읽지 못했습니다')),
      blk(3, '핵심 수치', h('div', {class: 'ob-nums'}, num('평균이 오른 업종', '계산 불가'), num('동반 강세', '계산 불가'), num('기여 1위', '계산 불가'))),
      quietArt({key: 'sectors', label: '업종', when: `${korDate(board.asOf)} 종가`}),
      blk(5, '이어서 보기', h('p', {class: 'ob-more'}, h('a', {href: '#/hot'}, '불장 ›'), h('a', {href: '#/map'}, '지도 ›'), h('a', {href: '#/flow/rotation'}, '업종 순환 ›'))),
      foot(manifest)));
    main.querySelector('section[data-art]')?.setAttribute('data-first', '4');
    return;
  }
  const o = sectorsObservation(lens), units = sectorUnits(lens), capDay = lens.stocks.find(s => s.fund?.capDay)?.fund.capDay ?? null;
  const top = o.top;
  const fig = decompFig({key: 'sectors', kind: 'sectors', units, label: '평균 펼치기', kicker: [h('span', {class: 'mk-no', 'aria-hidden': 'true'}, '④'), ' 평균 펼치기 · 업종마다 기여'], when: `ATLAS 선정 ${o.n}곳 · 최근 20거래일 · ${korDate(lens.asOf)} 종가`,
    title: `선정 평균 ${fmtPct(o.M)} = 업종마다 기여(%p)를 더한 값`, topBy: 'contrib', topWord: '기여 1위 업종 제외해 비교', show: [5, 3], counter: o.counter?.text ?? '반대 근거 없음', limits: ['기여는 산술 몫 — 업종이 오르내린 까닭은 따로 확인', `ATLAS 선정 ${o.n}곳 기준 · 시장 전체 아님`, ...(lens.stocks.some(x => !fin(x.r20)) ? [`값 없는 종목 ${lens.stocks.filter(x => !fin(x.r20)).length}곳은 평균에서 뺌`] : [])], ref: {name: idxName(lens), v: lens.market?.ref?.r20 ?? null},
    nextLine: '업종을 누르면 구성 종목의 수익률 · 기여', capDay, first: 4,
    checkOf: ({base, top: k}) => ({G: units.length, n: base.n, mean: base.mean, median: base.median, up: base.up, top: k >= 0 ? units[k].id : null, exTop: k >= 0 ? decompState(units, new Set([k])).mean : null, wMean: base.wMean, u: 'pct'})});
  state.summary = [o.text, o.counter?.text].filter(Boolean).join(' · ');
  main.replaceChildren(h('div', {class: 'b-page sx-page'}, nav,
    blk(1, '기준', baseLine(board, lens, manifest)),
    blk(2, '관측', h('p', {class: 'ob-say', 'data-speak': ''}, o.text)),
    blk(3, '핵심 수치', h('div', {class: 'ob-nums'},
      num('평균이 오른 업종', `${o.up}/${o.G}개`),
      num(LEVEL.broad, `${o.broad}개`, '', '실험 규칙'),
      num('기여 1위', top ? fmtPp(top.contrib) : '계산 불가', top && top.contrib > 0 ? 'up' : top && top.contrib < 0 ? 'down' : '', top ? top.label : null))),
    fig,
    blk(5, '이어서 보기', h('div', {class: 'ob-next'}, top ? h('a', {class: 'ob-go', href: '#/i/' + top.id}, `${top.label} 구성 종목 보기 ›`) : null),
      h('p', {class: 'ob-more'}, h('a', {href: '#/flow/rotation'}, '업종 순환 ›'), h('a', {href: '#/hot'}, '불장 ›'), h('a', {href: '#/map'}, '지도 ›'), h('a', {href: '#mk-sectors', onclick: e => { e.preventDefault(); document.getElementById('mk-sectors')?.scrollIntoView({behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth'}); }}, '업종 진단 목록 ›'))),
    sectorList(lens),
    proFold('전문가용 자세히 — 공식 업종 목록', h('section', {class: 'b-box', 'aria-label': '공식 업종'}, h('h2', {class: 'b-box-h'}, `공식 업종 ${lens.official.length}개`, h('small', null, place.id === 'us' ? ' · 판의 업종 이름 · 업종마다 한 번' : ' · 네이버 증권 업종 · 업종마다 한 번')),
      h('ol', {class: 'of-list'}, ...lens.official.map(x => h('li', null, h('span', {class: 'of-n'}, x.name), ' ', tagEl(x.level, LEVEL, 'lvl'), ' ', h('small', {class: 'muted'}, `${x.n}곳 · 평균 `), pv(x.d20.mean), h('small', {class: 'muted'}, ' · 중앙값 '), pv(x.d20.median)))))), // 쉬운 말 화면에서는 접음(규칙 48)
    howBox(lens, ['기여(%p) = 그 업종 값이 있는 종목 수익률의 합 ÷ 선정 표본 전체 값이 있는 종목 수 · 업종 기여를 모두 더하면 선정 평균', '업종 제외 = 그 업종 종목의 합 · 수를 빼고 다시 나눔(분모가 줄어듦) · 시가총액 가중 = 남은 종목 시가총액으로 다시 나눔(합 100%)', `업종 상태 규칙 ${lens.rules?.id ?? '—'} · 관측 규칙 obs-rules-1 — 실험 규칙 · 검증 전`]),
    foot(manifest)));
  void fmtPp;
}
