// ATLAS 11 · 공통 계산(산식 calc-1 · site/app/calc.js) — 「ATLAS 개편 실행 지시서」 13. 반드시 통과할 검증 사례
// 고정 입력(2026-10-08 사이트 관찰값으로 만든 계산 시험 · 원시 시세 검증을 대신하지 않음 · 화면 운영값으로 쓰지 않음)
import test from 'node:test';
import assert from 'node:assert/strict';
import {summarize, mean, median, meanExTop, meanExSelf, pctRet, retN, gapPp, relPct, ratioPct, pathStats, stdev, fmtPct, fmtPp, CALC_VERSION} from '../../site/app/calc.js';

const close = (a, b, eps = 1e-9) => assert.ok(Math.abs(a - b) < eps, `${a} ≠ ${b}`);
const HLB = [69.9, 38.5, -2.9, -5.5, -19.7]; // HLB생명과학 · HLB · 바이오노트 · 티앤엘 · 파마리서치

test('HLB 다섯 곳 — 평균 16.06 · 중앙값 −2.9 · 상승 비율 40 · 1위 제외 2.6 · 상위 2개 제외 −9.3667', () => {
  const s = summarize(HLB);
  assert.equal(s.n, 5); assert.equal(s.excluded, 0);
  close(s.mean, 16.06); close(s.median, -2.9); close(s.upRatio, 40);
  close(s.exTop1, 2.6); close(s.exTop2, -28.1 / 3); assert.equal(s.exTop2.toFixed(4), '-9.3667');
  assert.equal(s.up, 2); assert.equal(s.down, 3); assert.equal(s.flat, 0);
  assert.equal(fmtPct(s.mean, 2), '+16.06%'); assert.equal(fmtPct(s.median), '−2.9%'); assert.equal(fmtPct(s.exTop1), '+2.6%');
  // 입력 차례가 바뀌어도 같은 값(중간 반올림 없음)
  const r = summarize([...HLB].reverse()); close(r.mean, s.mean); close(r.exTop1, s.exTop1); close(r.exTop2, s.exTop2);
});

test('빈 집합 · 1개 · 모두 보합 · 모두 하락 — 0 이 아니라 계산 불가(null)', () => {
  const e = summarize([]);
  assert.equal(e.n, 0); assert.equal(e.mean, null); assert.equal(e.median, null); assert.equal(e.upRatio, null); assert.equal(e.exTop1, null); assert.equal(e.max, null);
  assert.equal(fmtPct(e.mean), '계산 불가');
  const one = summarize([3.2]);
  assert.equal(one.mean, 3.2); assert.equal(one.median, 3.2); assert.equal(one.upRatio, 100); assert.equal(one.exTop1, null, '1개에서 1위를 빼면 남는 값이 없음'); assert.equal(one.exTop2, null);
  const flat = summarize([0, 0, 0]);
  assert.equal(flat.flat, 3); assert.equal(flat.up, 0); assert.equal(flat.upRatio, 0); assert.equal(flat.mean, 0); assert.equal(fmtPct(flat.mean), '0.0%');
  const down = summarize([-1, -2, -3, -4]);
  assert.equal(down.upRatio, 0); assert.equal(down.down, 4); close(down.median, -2.5); close(down.exTop1, -3); assert.equal(down.max, -1);
});

test('빈 값은 채우지 않고 뺀 수로 셈', () => {
  const s = summarize([10, null, NaN, undefined, -10, Infinity]);
  assert.equal(s.n, 2); assert.equal(s.excluded, 4); assert.equal(s.mean, 0); assert.equal(s.upRatio, 50);
});

test('수익률 · N거래일 수익률(종가 N+1 개) · 분모 0', () => {
  close(pctRet(110, 100), 10); assert.equal(pctRet(110, 0), null); assert.equal(pctRet(110, null), null); assert.equal(pctRet(0, 100), null);
  const c21 = Array.from({length: 21}, (_, i) => 100 + i);
  close(retN(c21, 20), 20); close(retN(c21, 5), (120 / 115 - 1) * 100);
  assert.equal(retN(c21.slice(1), 20), null, '종가 20개로는 20거래일 수익률을 셀 수 없음');
  assert.equal(retN([], 1), null);
});

test('격차(%p) · 상대 가격비(%) · 비율 · 자기 제외 평균 · 표준편차', () => {
  close(gapPp(16.06, -2.62), 18.68); assert.equal(gapPp(null, 1), null);
  close(relPct(10, 10), 0); close(relPct(21, 10), 10); assert.equal(relPct(5, -100), null);
  close(ratioPct(5, 200), 2.5); assert.equal(ratioPct(5, 0), null, '분모 0 → 계산 불가');
  close(meanExSelf(HLB, 0), 2.6); assert.equal(meanExSelf([4], 0), null);
  close(mean([1, 2, 3]), 2); close(median([4, 1, 3, 2]), 2.5); close(meanExTop([5, 1, 3], 1), 2);
  close(stdev([2, 4, 4, 4, 5, 5, 7, 9]), Math.sqrt(32 / 7)); assert.equal(stdev([1]), null);
  assert.equal(fmtPp(1.25, 1), '+1.3%p'); assert.equal(fmtPp(-0.04), '0.0%p'); assert.equal(fmtPp(null), '계산 불가');
});

test('최대 낙폭과 최저 수익률은 다른 값', () => {
  // 100 → 130 → 104 → 110: 최대 낙폭 = (130−104)/130 = 20% · 최저 수익률 = 기준가 100 대비 가장 낮은 +4%
  const p = pathStats([100, 130, 104, 110]);
  close(p.mdd, 20); close(p.minRet, 4); close(p.ret, 10);
  const q = pathStats([100, 90, 95]); close(q.mdd, 10); close(q.minRet, -10);
  assert.equal(pathStats([100]), null); assert.equal(pathStats([100, 0]), null);
  assert.equal(CALC_VERSION, 'calc-1');
});
