/* ATLAS 11 · 판 읽기(lens.json) 화면 부품 — 「ATLAS 개편 실행 지시서」(사장님 2026-10-08 20:19 마카오 시각 첨부)
   다섯 탭(시장 · 돈 흐름 · 종목 · 일정 · 검증)이 함께 쓰는 글 · 숫자 모양 · 규칙 글 · 출처 접힘
   · 숫자는 모두 % 단위 값(calc.js) · 보일 때만 한 자리 반올림 · 오름 = 빨강 · 내림 = 파랑 + 부호 + ▲▼(색 하나에만 기대지 않음)
   · 셀 수 없는 값은 「계산 불가」 · 모으지 않은 자료는 「자료 없음」 — 0 이나 옛 값으로 채우지 않음 */
import {h, korDate, stamp, finite, place} from './util.js';
import {fmtPct, fmtPp, CALC_VERSION} from './calc.js';

export const sc = v => (finite(v) ? (v > 0 ? 'up' : v < 0 ? 'down' : 'flat') : 'na');
const mark = v => (finite(v) ? (v > 0 ? '▲' : v < 0 ? '▼' : '—') : '');
/** % 값(이미 % 단위) — 「▲ +16.1%」 · 계산 불가 */
export const pv = (v, d = 1, cls = '') => h('b', {class: `lv-n ${sc(v)}${cls ? ' ' + cls : ''}`}, finite(v) ? `${mark(v)} ${fmtPct(v, d)}` : '계산 불가');
/** %p 격차 */
export const ppv = (v, d = 1) => h('b', {class: `lv-n ${sc(v)}`}, finite(v) ? fmtPp(v, d) : '계산 불가');
/** 원 금액(추정) — 조 · 억 · 만 원(부호 앞) */
export const wonAmt = v => { if (!finite(v)) return '계산 불가'; const s = v > 0 ? '+' : v < 0 ? '−' : '', a = Math.abs(v);
  return a >= 1e12 ? `${s}${(a / 1e12).toFixed(2)}조 원` : a >= 1e8 ? `${s}${Math.round(a / 1e8).toLocaleString('ko-KR')}억 원` : `${s}${Math.round(a / 1e4).toLocaleString('ko-KR')}만 원`; };
export const amt = v => h('b', {class: `lv-n ${sc(v)}`}, wonAmt(v));
/** 주식 수(공식 값) */
export const sharesTxt = v => (finite(v) ? `${v > 0 ? '+' : v < 0 ? '−' : ''}${Math.abs(v).toLocaleString('ko-KR')}주` : '계산 불가');
export const pctNum = v => (finite(v) ? `${Math.round(v)}%` : '계산 불가');

/* ── 업종 상태(실험 규칙 lens-rules-1) ── */
export const LEVEL = {broad: '동반 강세', narrow: '일부 종목 주도', mixed: '엇갈림', weak: '약세', na: '판단 보류'};
export const TREND = {spread: '강세 확산', fade: '강세 약화'};
export const RULE_LINES = [
  '동반 강세 = 20거래일 평균 > 0 · 중앙값 > 0 · 1위 제외 평균 > 0 · 상승 비율 60% 이상',
  '일부 종목 주도 = 평균 > 0 · 중앙값 0 이하 또는 1위 제외 평균 0 이하 또는 상승 비율 50% 미만',
  '엇갈림 = 평균 > 0 · 위 두 가지가 아님',
  '약세 = 평균 0 이하',
  '판단 보류 = 값이 있는 종목 3곳 미만',
  '강세 확산 = 20거래일 평균 > 0 · 5거래일 평균 > 0 · 5거래일 상승 비율이 20거래일보다 높음',
  '강세 약화 = 20거래일 평균 > 0 · 5거래일 평균 < 0 · 5거래일 상승 비율 50% 미만'];
export const tagEl = (id, map, cls) => (id && map[id] ? h('span', {class: `lv-tag ${cls}-${id}`}, map[id]) : null);

/** 묶음 요약 한 줄(평균 · 중앙값 · 오름 · 내림 · 보합 · 상승 비율) */
export function sumLine(s, {ex = true} = {}) {
  if (!s || !s.n) return h('p', {class: 'lv-sum muted'}, '값이 있는 종목 0곳 · 계산 불가');
  return h('p', {class: 'lv-sum'},
    '평균 ', pv(s.mean), ' · 중앙값 ', pv(s.median), ' · ',
    h('span', {class: 'up'}, `오름 ${s.up}곳`), ' · ', h('span', {class: 'down'}, `내림 ${s.down}곳`), ' · ', `보합 ${s.flat}곳`, ' · ', `상승 비율 ${pctNum(s.upRatio)}`,
    ex ? [' · 1위 제외 평균 ', pv(s.exTop1)] : null);
}
/** 뺀 종목 수와 사유 */
export function exclLine(e, n = null) {
  const parts = [e?.late ? `지연 ${e.late}곳(앞 거래일 종가)` : null, e?.stale ? `오래된 종가 ${e.stale}곳(거래정지 여부 확인 필요)` : null, e?.ca ? `기업행사 확인 필요 ${e.ca}곳` : null, e?.missing ? `종가 없음 ${e.missing}곳` : null].filter(Boolean);
  return parts.length ? h('p', {class: 'lv-ex muted xs'}, `계산에서 뺀 곳: ${parts.join(' · ')}`) : n != null ? h('p', {class: 'lv-ex muted xs'}, '계산에서 뺀 곳 없음') : null;
}
/** 계산 · 출처(접힘) — 산식 · 자료 · 판 · 버전 */
export function howBox(lens, extra = []) {
  return h('details', {class: 'b-how lv-how'}, h('summary', null, '계산 · 출처 자세히'),
    h('ul', {class: 'lv-how-l'},
      h('li', null, 'N거래일 수익률(%) = (끝 종가 ÷ N거래일 전 종가 − 1) × 100 · 20거래일 = 종가 21개'),
      h('li', null, '평균 = 값이 있는 종목 수익률의 합 ÷ 종목 수 · 상승 비율 = 0보다 큰 종목 수 ÷ 종목 수 × 100'),
      h('li', null, '시장 대비 격차(%p) = 종목 수익률(%) − 같은 기간 지수 수익률(%)'),
      h('li', null, '중앙값 · 1위 제외 평균 · 자기 제외 평균은 값이 있는 종목만 · 분모가 0이면 계산 불가'),
      h('li', null, '가격수익률(배당 빼고) · 수정주가 여부는 확인 안 됨 · 하루 변화가 가격 제한폭을 넘은 종목은 기업행사 확인 필요로 뺌'),
      ...extra.map(x => h('li', null, x)),
      h('li', null, `산식 `, h('code', null, CALC_VERSION), ` · 규칙 `, h('code', null, lens?.rules?.id ?? '—'), ` · 판 `, h('code', null, lens?.boardId ?? '—'), ` · 묶음 `, h('code', null, lens?.universe?.id ?? '—')),
      h('li', null, `만든 때 ${stamp(lens?.made)} · 종가 기준일 ${korDate(lens?.asOf)}`)));
}
/** 판 읽기를 못 한 날 — 까닭 한 줄(숫자를 지어내지 않음) */
export const lensMissing = lens => h('p', {class: 'b-note lv-none', role: 'status'}, lens?.none ? '판 읽기 계산이 멈춰 이 칸은 비어 있습니다' : '판 읽기 파일을 읽지 못했습니다');
/** 판의 종목 찾기 */
export const stockOf = (lens, code) => lens?.stocks?.find(s => s.code === code) ?? null;
/** 기간 글 「9월 7일(월)~10월 8일(목) · 20거래일」 */
export const spanTxt = (from, to, n) => (from && to ? `${korDate(from)}~${korDate(to)} · ${n}거래일` : `${n}거래일`);
/** 판마다 지수 이름(한국 코스피 · 미국 S&P 500) */
export const idxName = lens => lens?.market?.ref?.name ?? (place.id === 'us' ? 'S&P 500' : '코스피');
