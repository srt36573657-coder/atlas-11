/* ATLAS 11 · 아래 탭 「검증」 첫 화면 「선정 결과」(#/check) — 「ATLAS 개편 실행 지시서」(사장님 2026-10-08 20:19 마카오 시각 첨부) 9
   · 선정 = 저녁 기록(그 날 저녁 7시 뒤 한 번 · public/data/atlas11/evening · 고치지 않음 — 정정은 새 기록) · 후보군 · 기록한 때 · 판 이름 · 묶음 버전이 함께
   · 선정 뒤 5 · 10 · 20거래일: 수익률 · 시장(지수) 대비 · 업종(같은 업종 다른 곳) 대비 · 평균 · 중앙값 · 손실 수 · 최대 낙폭과 최저 수익률(다른 값) · 성공 정의 · 비율 · 표본 수
   · 평가일이 오지 않았으면 「평가 대기」 · 선정 횟수 · 고유 종목 수 · 겹치는 구간을 나눠 셈(같은 종목 반복을 독립 성공으로 세지 않음 — 표본 수 옆에 고유 수)
   · 비교 기준: 시장(지수) · 업종 비교군 · 같은 날 단순 최근 20거래일 상승률 상위(그날까지 종가만 · 미래 자료 없음)
   · 기록 기능을 만든 것과 투자 성능을 입증한 것은 다름 — 결과가 쌓이기 전에는 「검증 전」
   · 「운영 기록」(옛 아래 탭 「기록」 · #/log)은 위 「보기 바꾸기」 */
import {h, korDate, stamp, finite} from './util.js';
import {state, loadBoard, loadLens} from './store.js';
import {foot, segNav, CHECK_SEGS} from './parts.js';
import {checkArt, quietArt} from './scenes.js';
import {pv, ppv, pctNum, howBox, lensMissing, idxName} from './lensparts.js';

const LIST_NAME = {cand: '매수 검토 후보', next: '오름 상위 22곳', similar: '예비 7곳', hot: '불장 업종 회사'}; // cand = 2026-10-09 03:09 「ATLAS 제품 재설계 명령」 13 — 그날 처음 남은 후보 목록(저녁 기록 · 후보 발행본)
const KEYS = ['cand', 'next', 'similar', 'hot'];
function evalCell(e, lens) {
  if (e.status === 'pending') return h('td', {class: 'ck-wait'}, h('b', null, '평가 대기'), h('small', {class: 'muted'}, ` · ${korDate(e.due)}`));
  if (e.status !== 'done') return h('td', {class: 'muted'}, '평가일 모름(달력 밖)');
  return h('td', {class: 'ck-done'}, '평균 ', pv(e.ret.mean), ' · 중앙값 ', pv(e.ret.median), h('br'), `${idxName(lens)} 대비 `, ppv(e.vsMarket.mean), ' · 업종 대비 ', ppv(e.vsGroup.mean), h('br'),
    `손실 ${e.losses}곳/${e.n}곳 · 최대 낙폭 평균 ${finite(e.mdd.mean) ? e.mdd.mean.toFixed(1) + '%' : '계산 불가'} · 최저 수익률 평균 `, pv(e.minRet.mean), h('br'),
    `성공 ${e.success.hit}곳/${e.success.n}곳`, e.excluded ? ` · 뺀 곳 ${e.excluded}` : '');
}
function recordTable(lens) {
  const recs = [...lens.verify.records].reverse();
  return h('section', {class: 'b-box ck-box', 'aria-label': '평가 일정과 결과'},
    h('h2', {class: 'b-box-h'}, '평가 일정과 결과', h('small', null, ' · 기록마다 5거래일 · 10거래일 · 20거래일 뒤')),
    ...recs.map(r => h('div', {class: 'ck-rec', 'data-asof': r.asOf},
      h('h3', {class: 'ag-h'}, `${korDate(r.asOf)} 기록`, h('small', null, ` · 남긴 때 ${stamp(r.recordedAt)}`, r.cand ? ` · 후보 목록 남긴 때 ${stamp(r.cand.recordedAt)}(${r.cand.src === 'pub' ? '후보 발행본' : '저녁 기록'} · 규칙 ${r.cand.rules ?? '표시 없음'})` : '')),
      h('div', {class: 'c-scroll', 'data-scroll': 'x'}, h('table', {class: 'c-table ck-t'},
        h('thead', null, h('tr', null, h('th', {scope: 'col'}, '목록'), h('th', {scope: 'col'}, '5거래일'), h('th', {scope: 'col'}, '10거래일'), h('th', {scope: 'col'}, '20거래일'))),
        h('tbody', null,
          ...KEYS.filter(k => r.evals?.[k]).map(k => h('tr', {class: k === 'cand' ? 'ck-cand' : null}, h('th', {scope: 'row'}, LIST_NAME[k], h('small', {class: 'muted'}, ` ${k === 'hot' ? r.sizes.hotCodes : r.sizes[k]}곳`)), ...r.evals[k].map(e => evalCell(e, lens)))),
          ...['cand', 'next'].filter(k => r.baseline?.[k]).map(k => h('tr', {class: 'ck-base'}, h('th', {scope: 'row'}, `비교 기준: 단순 20거래일 상승률 상위(${LIST_NAME[k]}와 같은 수)`, h('small', {class: 'muted'}, ` ${r.sizes[k]}곳`)), ...r.baseline[k].map(e => evalCell(e, lens))))))))),
    h('p', {class: 'muted xs'}, `성공 = ${lens.verify.success.replace(/^성공 = /, '')} · 손실 = 수익률이 0% 보다 낮은 곳 · 최대 낙폭 = 구간 안 가장 높던 종가 대비 가장 크게 떨어진 폭 · 최저 수익률 = 기준가 대비 가장 낮던 수익률`));
}
function turnoverBox(v) {
  if (!v.turnover.length) return null;
  return h('section', {class: 'b-box', 'aria-label': '교체 빈도'},
    h('h2', {class: 'b-box-h'}, '교체 빈도', h('small', null, ' · 앞 기록 대비 들어옴 · 빠짐')),
    h('ul', {class: 'ck-to'}, ...[...v.turnover].reverse().map(t => h('li', null, h('b', null, `${korDate(t.from)} → ${korDate(t.to)}`),
      ` · 오름 상위 22곳 들어옴 ${t.next.in}곳 · 빠짐 ${t.next.out}곳 · 예비 7곳 들어옴 ${t.similar.in}곳 · 빠짐 ${t.similar.out}곳 · 불장 업종 들어옴 ${t.hot.in}개 · 빠짐 ${t.hot.out}개`))),
    h('p', {class: 'muted xs'}, `선정 횟수 ≠ 고유 종목 수 · 오름 상위 22곳: 선정 ${v.picks.next}번 · 고유 ${v.unique.next}곳 · 예비 7곳: 선정 ${v.picks.similar}번 · 고유 ${v.unique.similar}곳 · 불장 업종: 선정 ${v.picks.hot}번 · 고유 ${v.unique.hot}개 — 기록이 이어지면 평가 구간이 겹침(같은 종목 반복을 독립 성공으로 세지 않음)`));
}

export async function renderCheck(main, {manifest}) {
  const [board, lens0] = await Promise.all([loadBoard(), loadLens().catch(() => null)]);
  const lens = lens0 && !lens0.none ? lens0 : null, v = lens?.verify, recs = v?.records ?? [];
  const pending = recs.flatMap(r => Object.values(r.evals).flat()).filter(e => e.status === 'pending').length;
  state.summary = recs.length ? `선정 결과 · 고정 기록 ${recs.length}장 · 평가 끝 ${v.done}건 · 평가 대기 ${pending}건 · 첫 평가일 ${korDate(v.firstDue)} · 검증 전` : '선정 결과 · 고정 기록 없음 · 검증 전';
  main.replaceChildren(h('div', {class: 'b-page ck-page'},
    h('section', {class: 'mk-b', 'data-first': '1', 'aria-label': '선정 결과'}, h('h2', {class: 'mk-h'}, '선정 결과'),
      lens ? (recs.length
        ? [h('p', {class: 'mk-l'}, h('b', null, `고정 기록 ${recs.length}장`), ` · ${korDate(recs[0].asOf)}~${korDate(recs.at(-1).asOf)} · 평가 끝 ${v.done}건 · 평가 대기 ${pending}건`),
          h('p', {class: 'mk-l'}, v.done ? '결과가 쌓이는 중 · 아직 투자 성능을 입증한 것이 아님' : h('b', null, '검증 전'), v.firstDue ? ` · 첫 평가일 ${korDate(v.firstDue)}(5거래일)` : '')]
        : h('p', {class: 'mk-l'}, '이 판은 아직 고정 기록이 없음 · 검증 전')) : lensMissing(lens0)),
    segNav(CHECK_SEGS, 'picks', '검증 보기 바꾸기'),
    (lens ? checkArt(lens) : null) ?? quietArt({key: 'check', label: '검증', word: '기록 0장', when: `${korDate(board.asOf)} 종가`}),
    lens && recs.length ? recordTable(lens) : null,
    lens && v ? turnoverBox(v) : null,
    lens ? h('section', {class: 'b-box', 'aria-label': '기록 규칙'}, h('h2', {class: 'b-box-h'}, '기록 규칙'),
      h('ul', null,
        h('li', null, '선정 = 저녁 기록 — 그 날 저녁 7시 뒤 한 번 남기고 고치지 않음(정정은 새 기록) · 기록마다 남긴 때 · 판 이름 · 묶음 버전'),
        h('li', null, `비교 기준 = ${idxName(lens)} · 같은 업종 다른 곳 평균 · 같은 날 단순 최근 20거래일 상승률 상위 — 같은 날 · 같은 기간`),
        h('li', null, '매수 검토 후보 = 그날 처음 남은 후보 목록(저녁 기록 · 후보 발행본 가운데 먼저 남은 것 · 고치지 않음) · 비교: 시장(지수) · 같은 후보군의 단순 선정(20거래일 상승률 상위 같은 수) · 기존 ATLAS 목록(오름 상위 · 예비 · 불장)'),
        h('li', null, '후보 관측 성과 ≠ 실제 매매 성과 — 진입 · 청산 · 비중 · 비용 · 슬리피지 규칙이 없음 · 규칙을 바꾸면 새 버전으로 따로 평가(지난 자료에 맞는다는 까닭만으로 바꾸지 않음)'),
        h('li', null, '그날까지의 종가만 씀(미래 자료 없음) · 가격수익률(배당 빼고) · 실제 매매 성과가 아님(비용 · 슬리피지 없음)'),
        h('li', null, `묶음(365곳)은 ${korDate(lens.universe?.selectedOn)}에 고름 — 그 앞 날짜 기록은 고른 뒤의 묶음으로 본 것`),
        h('li', null, '가중치를 저절로 바꾸지 않음 · 새 조건은 따로 검증하고 버전을 남긴 뒤에만 씀'))) : null,
    lens ? howBox(lens, ['평가 = 기록한 날 종가에서 5 · 10 · 20번째 거래일 종가까지(거래일 달력 · 임시 휴장은 바뀔 수 있음)']) : null,
    foot(manifest)));
}
