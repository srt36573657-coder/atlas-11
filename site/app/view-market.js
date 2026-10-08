/* ATLAS 11 · 아래 탭 「시장」 첫 화면(#/) — 「ATLAS 개편 실행 지시서」(사장님 2026-10-08 20:19 마카오 시각 첨부) 4 · 5
   위에서 아래로: ① 언제 → ② 시장 → ③ 업종 → ④ 변화 → ⑤ 다음 확인 — 그림(구슬 두 그릇)은 그 아래(판단 정보가 그림에 밀리지 않게 · 재생을 기다리지 않게)
   · 문장마다 분석 범위: 「ATLAS 선정 365곳(시장 전체 아님)」 · 공식 지수 · 시장 전체(모으지 않음)를 나눠 씀
   · 「불장 11개」처럼 개수 상한이 있는 숫자는 시장 열기 지표로 쓰지 않음 — 업종 판단은 실험 규칙(lens-rules-1)과 실제 숫자
   · 공식 업종(네이버 업종 · 업종마다 한 번)과 ATLAS 업종(73개 · 5곳씩)을 나눠 셈 — 잘게 나눈 산업이 개수 때문에 무게가 커지지 않게
   · 넣으면서 뺀 것(규칙 1): 옛 첫 화면(불장 큰 흐름 · 봉화대 그림)은 시장 안 「불장」(#/hot)으로 옮김 — 지우지 않음 */
import {h, korDate, stamp, kst, finite, place} from './util.js';
import {state, loadBoard, loadAgenda, loadLens} from './store.js';
import {foot, segNav, MARKET_SEGS} from './parts.js';
import {marketArt, quietArt} from './scenes.js';
import {pv, ppv, pctNum, sumLine, exclLine, howBox, lensMissing, LEVEL, TREND, RULE_LINES, tagEl, spanTxt, idxName} from './lensparts.js';
import {fmtPct} from './calc.js';

/** 첫 화면 칸 하나 — 제목(① 언제 …)은 첫 줄 앞에 붙여 한 줄을 아낌(① ~ ⑤ 가 360×640 한 화면에 가깝게) */
const blk = (n, title, first, ...kids) => h('section', {class: 'mk-b', 'data-first': String(n), 'aria-label': title},
  h('p', {class: 'mk-l'}, h('b', {class: 'mk-h'}, h('span', {class: 'mk-no', 'aria-hidden': 'true'}, ['①', '②', '③', '④', '⑤'][n - 1]), ' ', title), ' ', ...[].concat(first)), ...kids);
const line = (...kids) => h('p', {class: 'mk-l'}, ...kids);
const levelLine = (t, n) => ['broad', 'narrow', 'mixed', 'weak', 'na'].filter(k => t?.[k]).map(k => `${LEVEL[k]} ${t[k]}개`).join(' · ') || `${n}개 모두 판단 보류`;

/** 업종 카드 하나(지시서 5: 기간 · 종목 수 · 평균 · 중앙값 · 오름/내림/보합 · 1위 제외 평균 · 5 · 20거래일 · 선정 vs 업종 전체 · 시가총액 커버리지) */
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

export async function renderMarket(main, {manifest}) {
  const [board, lens0, agenda] = await Promise.all([loadBoard(), loadLens().catch(() => null), loadAgenda().catch(() => null)]);
  const lens = lens0 && !lens0.none ? lens0 : null;
  const W = lens?.when, M = lens?.market, B = lens?.breadth, C = lens?.changes;
  // ① 언제
  const b1 = blk(1, '언제', [h('b', null, `${korDate(board.asOf)} 종가`), ` · ${place.closeAt} · 장중 값 아님`],
    W ? line(`자료: ${W.companies}곳 중 ${W.current}곳 그날 종가`, W.late + W.stale ? ` · 지연 ${W.late + W.stale}곳` : '', W.ca ? ` · 기업행사 확인 ${W.ca}곳` : '', ` · 만든 때 ${kst(manifest.generatedAt ?? '').date === board.asOf ? kst(manifest.generatedAt).time + ' KST' : stamp(manifest.generatedAt)}`) : lensMissing(lens0));
  // ② 시장 — 공식 지수 · ATLAS 선정 표본(시장 전체 아님) · 변동성 · 거래대금(모으지 않음)
  const ixs = M?.index?.length ? M.index : (manifest.market?.items ?? []);
  const b2 = blk(2, '시장', ixs.flatMap((x, k) => [k ? ' · ' : null, h('span', {'data-ident': ''}, x.name), ' ', finite(x.changePct) ? pv(x.changePct, 2) : '없음']),
    M ? line(`ATLAS 선정 ${M.sample.n}곳(시장 전체 아님) 하루: `, h('span', {class: 'up'}, `오름 ${M.sample.d1.up}곳`), ' · ', h('span', {class: 'down'}, `내림 ${M.sample.d1.down}곳`), ` · 보합 ${M.sample.d1.flat}곳 · 상승 비율 ${pctNum(M.sample.d1.upRatio)}`) : null,
    M ? line(`변동성 `, h('b', null, finite(M.ref?.vol20) ? `${M.ref.vol20.toFixed(2)}%` : '계산 불가'), `(${idxName(lens)} 20거래일 하루 변화 표준편차) · 거래대금: 자료 없음`) : null);
  // ③ 업종 — 공식 업종(업종마다 한 번) · ATLAS 업종(73개)
  const b3 = blk(3, '업종', B ? [`공식 업종 ${B.official.n}개 20거래일: `, h('b', null, levelLine(B.official.level, B.official.n))] : '계산 불가',
    B ? line(`ATLAS 업종 ${B.atlas.n}개(5곳씩): `, levelLine(B.atlas.level, B.atlas.n), ' · 실험 규칙 · ', h('a', {href: '#/', onclick: e => { e.preventDefault(); document.getElementById('mk-sectors')?.scrollIntoView({behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth'}); }}, '업종 진단 ›')) : null);
  // ④ 변화 — 앞 기록(저녁 기록 · 고치지 않음) 이후
  const b4 = blk(4, '변화', C ? [h('b', null, `${korDate(C.from)} 기록 이후`), ` · 새 공시 ${C.nDisclosures}건(★★★ ${C.nTop}건)`] : '견줄 앞 기록 없음',
    C ? line(`불장 업종 들어옴 ${C.hotIn.length}개 · 빠짐 ${C.hotOut.length}개`, C.hotIn.length ? [' (', ...C.hotIn.flatMap((x, k) => [k ? ' · ' : null, h('a', {href: '#/i/' + x.id}, x.label)]), ')'] : '',
      ` · 오름 상위 22곳 들어옴 ${C.nextIn.length}곳 · 빠짐 ${C.nextOut.length}곳`) : null);
  // ⑤ 다음 확인
  const nextEv = (agenda?.market ?? []).find(e => e.date >= board.asOf) ?? null;
  const b5 = blk(5, '다음 확인', lens ? h('a', {href: '#/stocks'}, `새로 발견 ${lens.buckets.new}곳 · 근거 강화 ${lens.buckets.up}곳 · 근거 약화 ${lens.buckets.down}곳 ›`) : h('a', {href: '#/stocks'}, '종목 ›'),
    h('p', {class: 'mk-l mk-go'}, h('a', {href: '#/agenda'}, nextEv ? [`일정 ${korDate(nextEv.date)} `, h('span', {'data-ident': ''}, nextEv.name), ' ›'] : '다가오는 일정 ›'), ' · ', h('a', {href: '#/flow'}, '투자자 매매 ›'), ' · ', h('a', {href: '#/check'}, '선정 결과 ›')));
  state.summary = [`${korDate(board.asOf)} 종가`, ...ixs.map(x => `${x.name} ${finite(x.changePct) ? fmtPct(x.changePct, 2) : '없음'}`), ...(lens ? [`ATLAS 선정 ${M.sample.n}곳 하루: 오름 ${M.sample.d1.up}곳`, `내림 ${M.sample.d1.down}곳`, `보합 ${M.sample.d1.flat}곳`, `공식 업종 ${B.official.n}개 20거래일: ${levelLine(B.official.level, B.official.n)}`] : [])].join(' · ');
  main.replaceChildren(h('div', {class: 'b-page mk-page'},
    h('div', {class: 'mk-first'}, b1, b2, b3, b4, b5),
    segNav(MARKET_SEGS, 'market', '시장 보기 바꾸기'),
    (lens ? marketArt(lens) : null) ?? quietArt({key: 'market', label: '시장', when: `${korDate(board.asOf)} 종가`}),
    lens ? h('section', {class: 'b-box mk-sample', 'aria-label': 'ATLAS 선정 표본'}, h('h2', {class: 'b-box-h'}, `ATLAS 선정 ${M.sample.n}곳`, h('small', null, ' · 시장 전체 아님 · 같은 기간 같은 종가')),
      line('하루 ', sumLine(M.sample.d1, {ex: false})), line('5거래일 ', sumLine(M.sample.d5, {ex: false})), line('20거래일 ', sumLine(M.sample.d20)),
      line(`${idxName(lens)} 5거래일 `, pv(M.ref?.r5), ' · 20거래일 ', pv(M.ref?.r20)),
      exclLine(M.sample.excluded, 0)) : null,
    lens ? sectorList(lens) : null,
    lens ? h('section', {class: 'b-box', 'aria-label': '공식 업종'}, h('h2', {class: 'b-box-h'}, `공식 업종 ${lens.official.length}개`, h('small', null, ' · 네이버 증권 업종 · 업종마다 한 번')),
      h('ol', {class: 'of-list'}, ...lens.official.map(o => h('li', null, h('span', {class: 'of-n'}, o.name), ' ', tagEl(o.level, LEVEL, 'lvl'), ' ', h('small', {class: 'muted'}, `${o.n}곳 · 평균 `), pv(o.d20.mean), h('small', {class: 'muted'}, ' · 중앙값 '), pv(o.d20.median))))) : null,
    lens ? howBox(lens, ['공식 지수: 네이버 증권 지수 · 변동성: 저장소 지수 종가(seed + 판마다 이어 붙임)', '시장 전체 오름/내림 수 · 거래대금: 모으지 않음']) : null,
    foot(manifest)));
}
