/* ATLAS 11 · 아래 탭 「시장」 첫 화면(#/) — 2026-10-09 「ATLAS 업데이트 실행 프롬프트」(사장님 01:41 마카오 시각 첨부) 0-A · 5
   위에서 아래로(지시서 5 차례 그대로): ① 시장 · 분석 기간 · 기준일 · 자료 상태 → ② 관측 한 문장 → ③ 핵심 수치 셋 → ④ 핵심 차트 + 반대 근거 → ⑤ 다음 행동(「변화의 근거 보기」)
   · 관측 한 문장 · 반대 근거는 정해진 계산 결과에서 만든다(observe.js obs-rules-1 · 시험 tests/atlas11/observe.test.mjs) — 가격이 움직인 까닭은 말하지 않음
   · 뚜렷한 변화가 없으면 「뚜렷한 변화 없음」 · 값이 모자라면 「판단 보류」(0 으로 채우지 않음)
   · 그 아래: 앞 기록 이후 달라진 것(가격 변화 · 구성 변경 · 자료 정정 · 기간 이동 · 누락 해소 — 지시서 0-D) · 하루 변화 · 선정 표본 · 계산 · 출처
   넣으면서 뺀 것(규칙 1): 옛 ③ 업종 · 업종 진단 목록 · 공식 업종 목록 → 아래 탭 「업종」(#/sectors · view-sectors.js) · 옛 그림(구슬 두 그릇 · 하루) → 20거래일 분포 */
import {proFold} from './easy.js'; // 쉬운 말 화면에서 빽빽한 전문가 칸 접기(규칙 48)
import {h, korDate, stamp, kst, finite, place} from './util.js';
import {state, loadBoard, loadAgenda, loadLens} from './store.js';
import {foot, segNav, MARKET_SEGS} from './parts.js';
import {marketArt, quietArt} from './scenes.js';
import {pv, pctNum, sumLine, exclLine, howBox, lensMissing, idxName} from './lensparts.js';
import {fmtPct} from './calc.js';
import {marketObservation} from './observe.js';
import {groupByFamily} from './family.js';

/** 3단 클릭 길잡이(사장님 2026-10-09 21:33 마카오 「아틀란스를 3단 클릭구조로 만든다 모든곳에 하나도 빠짐없이」 · 21:37 「슬기롭게 해」 · 규칙 47)
 *  탐색 탭 첫 화면 = 모든 화면에서 한 번 — 여기에 갈래 12개 · 업종 73개를 모두 걸어 「어느 화면에서나 3번이면 회사」(탐색 → 업종 → 회사) · 갈래는 2번
 *  차례 = 판의 업종 차례로 묶은 갈래(family.js groupByFamily) · 섬의 3단 클릭(탑 → 회사 · 업종 → 화면)은 그림 길 · 이 칸은 글 길(가린 탑 · 화면 읽기 · 판 읽기를 못 읽은 날에도) */
export function mapIndex(board) {
  const fams = groupByFamily(board?.groups ?? []); if (!fams.length) return null;
  const nG = fams.reduce((t, f) => t + f.groups.length, 0);
  return h('section', {class: 'b-box mk-idx', 'aria-label': '3번이면 회사 — 갈래 · 업종 모두'},
    h('h2', {class: 'b-box-h'}, '3번이면 회사', h('small', null, ` · 갈래 ${fams.length}개 → 업종 ${nG}개 → 회사`)),
    ...fams.map(({fam, groups}) => h('p', {class: 'mk-f'}, h('a', {class: 'mk-fa', href: `#/map/f/${fam.id}`}, `${fam.label} ›`),
      ...groups.map(g => h('a', {class: 'mk-g', href: `#/i/${g.id}`}, g.label)))));
}

const NO = ['①', '②', '③', '④', '⑤'];
/** 판단 정보 칸 하나 — 칸 번호 · 이름 · 내용 */
export const blk = (n, title, ...kids) => h('section', {class: 'mk-b', 'data-first': String(n), 'aria-label': title},
  h('p', {class: 'mk-l'}, h('b', {class: 'mk-h'}, h('span', {class: 'mk-no', 'aria-hidden': 'true'}, NO[n - 1]), ' ', title)), ...kids);
const line = (...kids) => h('p', {class: 'mk-l'}, ...kids);
/** 핵심 수치 하나(이름 · 값 · 덧말) */
export const num = (k, v, cls = '', sub = null) => h('p', {class: 'ob-num'}, h('span', {class: 'ob-nk'}, k), h('b', {class: `ob-nv ${cls}`}, v), sub ? h('span', {class: 'ob-ns'}, sub) : null);
const sideCls = v => (finite(v) ? (v > 0 ? 'up' : v < 0 ? 'down' : '') : '');
/** ① 기준 줄 — 시장 · 기준일 · 분석 기간 · 범위 · 자료 상태 */
export function baseLine(board, lens, manifest) {
  const W = lens?.when, S = lens?.market?.sample?.d20;
  const made = manifest?.generatedAt ? (kst(manifest.generatedAt).date === board.asOf ? `${kst(manifest.generatedAt).time} KST` : stamp(manifest.generatedAt)) : '없음';
  // 2026-10-10 18:22 다섯 팀 전체 검토(구글 · 잡스 · 삼성팀 — ① 기준 다섯 줄이 그림을 첫 화면 밖으로 밀어냄) — 보이는 줄은 날짜 · 몇 곳(시장 전체 아님) · 값 있는 곳 · 늦은 곳만 · 나머지(시각 · 장중 아님 · 기간 · 기업행사 · 만든 때)는 「기준 자세히」 접힘
  return [h('p', {class: 'ob-base'}, h('b', null, `${place.label} · ${korDate(board.asOf)} 종가`),
    W ? [` · ATLAS 선정 ${W.companies}곳(시장 전체 아님)`, S ? ` · 값이 있는 ${S.n}곳` : '', W.late + W.stale ? ` · 지연 ${W.late + W.stale}곳` : ''] : ''),
    h('details', {class: 'ob-more-d'}, h('summary', null, '기준 자세히'),
      h('p', {class: 'muted small'}, `${place.closeAt} · 장중 값 아님`, W ? [` · 분석 기간 최근 20거래일(${korDate(W.windows?.d20)}~${korDate(board.asOf)})`, W.ca ? ` · 기업행사 확인 ${W.ca}곳` : '', ` · 만든 때 ${made}`] : ` · 만든 때 ${made}`))];
}
/** 앞 기록 이후 달라진 것(지시서 0-D) — 저녁 기록(고치지 않음) 둘을 견줘 목록에 들고 난 까닭을 나눔(가격 변화 · 구성 변경 · 누락 해소 · 자료 지연) · 기간 이동 · 자료 정정(모으지 않음) */
export function changesBox(lens) {
  const C = lens?.changes;
  if (!C) return h('section', {class: 'b-box ch-box', 'aria-label': '앞 기록 이후 달라진 것'}, h('h2', {class: 'b-box-h'}, '앞 기록 이후 달라진 것'), h('p', {class: 'muted small'}, '견줄 앞 기록 없음'));
  const why = (lens.stocks ?? []).flatMap(s => (s.bucketWhy ?? []).filter(w => w.k === 'enter' || w.k === 'leave').map(w => ({...w, code: s.code})));
  const cnt = (cause, k) => why.filter(w => w.cause === cause && (!k || w.k === k)).length;
  const row = (k, v) => h('li', {class: 'ch-row'}, h('span', {class: 'ch-k'}, k), h('span', {class: 'ch-v'}, v));
  return h('section', {class: 'b-box ch-box', 'aria-label': '앞 기록 이후 달라진 것'},
    h('h2', {class: 'b-box-h'}, '앞 기록 이후 달라진 것', h('small', null, C.first ? ' · 처음 기록(견줄 앞 기록 없음)' : ` · ${korDate(C.from)} 기록 → ${korDate(C.to)} 기록`)),
    C.first ? null : h('ul', {class: 'ch-list'},
      row('가격 변화', `목록에 든 곳 ${cnt('price', 'enter')}곳 · 빠진 곳 ${cnt('price', 'leave')}곳 · 불장 업종 들어옴 ${C.hotIn.length}개 · 빠짐 ${C.hotOut.length}개`),
      row('구성 변경', `선정 묶음이 바뀌어 들고 난 곳 ${cnt('universe')}곳`),
      row('누락 해소', `앞 기록 때 늦게 들어온 종가가 채워져 든 곳 ${cnt('caught')}곳`),
      row('자료 지연', `그날 종가가 아직 없어 빠진 곳 ${cnt('late')}곳`),
      row('기간 이동', `20거래일 창이 ${korDate(C.from)} 종가에서 ${korDate(C.to)} 종가까지로 옮겨 감`),
      row('자료 정정', '정정 이력은 따로 모으지 않음'),
      row('새 공시', `${C.nDisclosures}건(★★★ ${C.nTop}건)`)),
    h('p', {class: 'muted xs'}, '저녁 기록은 고치지 않음 · 까닭은 계산으로 나눔(가격이 왜 움직였는지는 말하지 않음)'));
}

export async function renderMarket(main, {manifest}) {
  const [board, lens0, agenda] = await Promise.all([loadBoard(), loadLens().catch(() => null), loadAgenda().catch(() => null)]);
  const lens = lens0 && !lens0.none ? lens0 : null;
  const nav = segNav(MARKET_SEGS, 'market', '시장 보기 바꾸기');
  const nextEv = (agenda?.market ?? []).find(e => e.date >= board.asOf) ?? null;
  const more = h('p', {class: 'ob-more'}, h('a', {href: '#/flow'}, '투자자 매매 ›'), h('a', {href: '#/agenda'}, nextEv ? [`일정 ${korDate(nextEv.date)} `, h('span', {'data-ident': ''}, nextEv.name), ' ›'] : '다가오는 일정 ›'),
    h('a', {href: '#/stocks'}, lens?.changes ? `종목 변화 ${lens.buckets.new + lens.buckets.up + lens.buckets.down}곳 ›` : '종목 ›'), h('a', {href: '#/check'}, '선정 당시 근거와 이후 결과 ›')); // 단추 이름 = 누르면 보는 것(셋째 개정본 0-D)
  const ixs = lens?.market?.index?.length ? lens.market.index : (manifest.market?.items ?? []);
  const today = h('section', {class: 'b-box mk-today', 'aria-label': '하루 변화'}, h('h2', {class: 'b-box-h'}, '하루 변화', h('small', null, ` · ${korDate(board.asOf)} 종가`)),
    line(...ixs.flatMap((x, k) => [k ? ' · ' : null, h('span', {'data-ident': ''}, x.name), ' ', finite(x.changePct) ? pv(x.changePct, 2) : '없음'])),
    lens ? line(`ATLAS 선정 ${lens.market.sample.n}곳 하루: `, h('span', {class: 'up'}, `오름 ${lens.market.sample.d1.up}곳`), ' · ', h('span', {class: 'down'}, `내림 ${lens.market.sample.d1.down}곳`), ` · 보합 ${lens.market.sample.d1.flat}곳`) : null);
  if (!lens) { // 판 읽기를 못 읽은 날 — 다섯 칸은 그대로 · 판단 보류(숫자를 지어내지 않음)
    state.summary = `${korDate(board.asOf)} 종가 · 판단 보류`;
    main.replaceChildren(h('div', {class: 'b-page mk-page'}, nav,
      blk(1, '기준', baseLine(board, null, manifest), lensMissing(lens0)),
      blk(2, '관측', h('p', {class: 'ob-say'}, '판단 보류 — 판 읽기 파일을 읽지 못했습니다')),
      blk(3, '핵심 수치', h('div', {class: 'ob-nums'}, ...ixs.slice(0, 1).map(x => num(`${x.name} 하루`, finite(x.changePct) ? fmtPct(x.changePct, 2) : '없음', sideCls(x.changePct))), num('최근 20거래일', '계산 불가'), num('오른 곳', '계산 불가'))),
      quietArt({key: 'market', label: '시장', when: `${korDate(board.asOf)} 종가`}),
      blk(5, '이어서 보기', h('div', {class: 'ob-next'}, h('a', {class: 'ob-go', href: '#/sectors'}, '변화의 근거 보기 ›')), more),
      today, mapIndex(board), foot(manifest)));
    main.querySelector('section[data-art]')?.setAttribute('data-first', '4');
    return;
  }
  const o = marketObservation(lens), S = lens.market.sample.d20, R = lens.market.ref ?? {};
  state.summary = [o.text, o.counter?.text, `${idxName(lens)} 20거래일 ${fmtPct(R.r20)}`, `중앙값 ${fmtPct(S.median)}`, `오른 곳 ${S.up}곳`].filter(Boolean).join(' · ');
  main.replaceChildren(h('div', {class: 'b-page mk-page'}, nav,
    blk(1, '기준', baseLine(board, lens, manifest)),
    blk(2, '관측', h('p', {class: 'ob-say', 'data-speak': ''}, o.text)),
    blk(3, '핵심 수치', h('div', {class: 'ob-nums'},
      num(`${idxName(lens)} 20거래일`, fmtPct(R.r20), sideCls(R.r20), '공식 지수'),
      num(`선정 ${S.n}곳 중앙값`, fmtPct(S.median), sideCls(S.median), `평균 ${fmtPct(S.mean)}`),
      num('오른 곳', `${S.up}/${S.n}곳`, '', `상승 비율 ${pctNum(S.upRatio)}`))),
    marketArt(lens, o) ?? quietArt({key: 'market', label: '시장', when: `${korDate(board.asOf)} 종가`}),
    blk(5, '이어서 보기', h('div', {class: 'ob-next'}, h('a', {class: 'ob-go', href: '#/sectors'}, '변화의 근거 보기 ›')), more),
    proFold('전문가용 자세히 — 달라진 것 · 하루 변화 · 고른 곳 숫자', changesBox(lens), // 쉬운 말 화면에서는 세 칸을 한 칸에 접음(전문가 말 화면은 그대로 · 규칙 48) · 「3번이면 회사」는 접지 않음(3단 클릭 보장)
    today,
    h('section', {class: 'b-box mk-sample', 'aria-label': 'ATLAS 선정 표본'}, h('h2', {class: 'b-box-h'}, `ATLAS 선정 ${lens.market.sample.n}곳`, h('small', null, ' · 시장 전체 아님 · 같은 기간 같은 종가')),
      line('하루 ', sumLine(lens.market.sample.d1, {ex: false})), line('5거래일 ', sumLine(lens.market.sample.d5, {ex: false})), line('20거래일 ', sumLine(S)),
      line(`${idxName(lens)} 5거래일 `, pv(R.r5), ' · 20거래일 ', pv(R.r20)),
      exclLine(lens.market.sample.excluded, 0))),
    howBox(lens, ['관측 한 문장 · 반대 근거 = 정해진 규칙(obs-rules-1 · 실험 규칙 · 검증 전): 지수와 중앙값이 모두 ±1% 안이면 「뚜렷한 변화 없음」 · 표본이 30곳보다 적으면 판단 보류', '공식 지수: 네이버 증권 지수 · 변동성: 저장소 지수 종가(seed + 판마다 이어 붙임)', '시장 전체 오름/내림 수 · 거래대금: 모으지 않음']),
    mapIndex(board), // 3단 클릭 길잡이 — 갈래 · 업종 모두(어느 화면에서나 탐색 → 업종 → 회사) · 시장 글 다음 맨 아래
    foot(manifest)));
  main.querySelector('section[data-art]')?.setAttribute('data-first', '4'); // ④ 핵심 차트 + 반대 근거(빈 축이어도 같은 자리)
}
