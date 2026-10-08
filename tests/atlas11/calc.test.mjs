// ATLAS 11 · 공통 계산(산식 calc-1 · site/app/calc.js) — 「ATLAS 개편 실행 지시서」 13. 반드시 통과할 검증 사례
// 고정 입력(2026-10-08 사이트 관찰값으로 만든 계산 시험 · 원시 시세 검증을 대신하지 않음 · 화면 운영값으로 쓰지 않음)
import test from 'node:test';
import assert from 'node:assert/strict';
import {summarize, mean, median, meanExTop, meanExSelf, pctRet, retN, gapPp, relPct, ratioPct, pathStats, stdev, fmtPct, fmtPp, CALC_VERSION,
  poolMean, contribs, weightedMean, topIndex, drawdowns, krwReturn, eps, priceAt, epsNeeded} from '../../site/app/calc.js';

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
  assert.equal(CALC_VERSION, 'calc-2');
});

/* ── 2026-10-09 「ATLAS 업데이트 실행 프롬프트」 18. 고정 예제 A~I(시험 전용 · 운영 값 아님 · 중간 반올림 없음) ── */
const parts = xs => xs.map(v => ({sum: v, count: 1}));
test('A. 같은 평균 4%, 다른 시장 폭 — 중앙값 · 상승 수 · 최고 제외가 다르다', () => {
  const a = summarize([6, 5, 4, 3, 2]), b = summarize([24, 1, 0, -2, -3]), c = summarize([32, -2, -3, -3, -4]);
  for (const x of [a, b, c]) close(x.mean, 4);
  close(a.median, 4); assert.equal(a.up, 5); close(a.exTop1, 3.5);
  close(b.median, 0); assert.equal(b.up, 2); assert.equal(b.flat, 1); close(b.exTop1, -1);
  close(c.median, -3); assert.equal(c.up, 1); close(c.exTop1, -3);
  // 둘째 사례 · 시장 +5% — 격차 −1%p · 1위(24%) 기여 +4.8%p · 나머지 합 −0.8%p · 기여 합 = 평균
  close(gapPp(b.mean, 5), -1);
  const cb = contribs(parts([24, 1, 0, -2, -3]));
  close(cb[0], 4.8); close(cb.slice(1).reduce((t, v) => t + v, 0), -0.8); close(cb.reduce((t, v) => t + v, 0), 4);
  // 1위 제외 = 분모 5 → 4 · 평균 4 → −1 · 원래대로(제외 없음)
  const top = topIndex([24, 1, 0, -2, -3]); assert.equal(top, 0);
  const before = poolMean(parts([24, 1, 0, -2, -3])), after = poolMean(parts([24, 1, 0, -2, -3]), new Set([top]));
  assert.equal(before.n, 5); assert.equal(after.n, 4); close(before.mean, 4); close(after.mean, -1);
  const cAfter = contribs(parts([24, 1, 0, -2, -3]), new Set([top])); assert.equal(cAfter[0], null); close(cAfter.slice(1).reduce((t, v) => t + v, 0), -1);
});
test('평균 펼치기 — 업종 묶음(sum · count) · 가중 평균 재정규화 · 값 없는 칸', () => {
  const g = [{sum: 30, count: 3}, {sum: -4, count: 2}, {sum: null, count: 0}]; // 셋째 칸 = 값 없음(빼고 셈)
  const m = poolMean(g); assert.equal(m.n, 5); close(m.mean, 26 / 5);
  const cs = contribs(g); close(cs[0], 6); close(cs[1], -0.8); assert.equal(cs[2], null);
  const ex = poolMean(g, new Set([0])); assert.equal(ex.n, 2); close(ex.mean, -2);
  // 가중: 수익률 [10, −5, 2] · 시가총액 [3, 1, 0(없음)] → (30 − 5) ÷ 4 = 6.25 · 1위 제외하면 남은 가중치 1 → −5
  close(weightedMean([10, -5, 2], [3, 1, 0]), 6.25); close(weightedMean([10, -5, 2], [3, 1, 0], new Set([0])), -5);
  assert.equal(weightedMean([1, 2], [null, null]), null, '가중치가 없으면 계산 불가');
  assert.equal(poolMean([]).mean, null); assert.equal(topIndex([null, null]), -1); assert.equal(topIndex([1, 3, 3]), 1, '같으면 앞 칸');
});
test('B. 앞선 사이트 값 산식 — HLB 다섯 곳(위 시험과 같은 값 · 기여 합 = 평균)', () => {
  const c = contribs(parts(HLB)); close(c.reduce((t, v) => t + v, 0), 16.06); close(c[0], 69.9 / 5);
  close(poolMean(parts(HLB), new Set([topIndex(HLB)])).mean, 2.6);
});
test('C. 실적과 기대 — 전년 대비와 예상 대비는 다르다 · 같은 계절 기저효과', () => {
  close(pctRet(130, 100), 30); close(pctRet(130, 150), -13.333333333333334, 1e-9);
  close(pctRet(80, 20), 300); close(pctRet(80, 100), -20);
});
test('D. 이익과 EPS — 이익 +20% · EPS −20%(가중평균 주식 수가 늘어남)', () => {
  const e1 = eps(100e8, 1000e4), e2 = eps(120e8, 1500e4); close(e1, 1000); close(e2, 800);
  close(pctRet(120e8, 100e8), 20); close(pctRet(e2, e1), -20); assert.equal(eps(1, 0), null);
});
test('E. 환율 — 현지 +10% · 원화 기준 외화 가치 −5% → 원화 수익률 +4.5%(입력은 소수)', () => {
  close(krwReturn(0.10, -0.05), 0.045, 1e-12); assert.equal(krwReturn(null, 0.1), null);
});
test('F. 조건부 가치 — 60,000원 = 3,000원 × 20배 · 3,600 × 16 = 57,600(−4%) · 16배에서 60,000원이려면 EPS 3,750(+25%)', () => {
  close(priceAt(3000, 20), 60000); close(priceAt(3600, 16), 57600); close(pctRet(57600, 60000), -4);
  close(epsNeeded(60000, 16), 3750); close(pctRet(3750, 3000), 25); assert.equal(epsNeeded(1, 0), null);
});
test('G. 컨센서스 구성 — 첫 기관만 빠지면 평균 3,000 → 3,500(+16.667%) · 남은 기관은 올리지 않았다', () => {
  close(mean([2000, 3000, 4000]), 3000); close(mean([3000, 4000]), 3500); close(pctRet(3500, 3000), 16.666666666666664, 1e-9);
});
test('H. 수익과 낙폭 — 둘 다 +10% · B 최대 낙폭 −28.571% · 현재 낙폭 −21.429% · 최고점 회복 +27.273%', () => {
  const a = drawdowns([100, 102, 104, 106, 108, 110]), b = drawdowns([100, 120, 140, 100, 105, 110]);
  close(a.ret, 10, 1e-9); close(b.ret, 10, 1e-9); close(a.maxDD, 0); close(a.curDD, 0);
  assert.equal(b.maxDD.toFixed(3), '-28.571'); assert.equal(b.curDD.toFixed(3), '-21.429'); assert.equal(b.toPeak.toFixed(3), '27.273');
  // 옛 pathStats(떨어진 폭 · 양수)와 같은 크기
  close(pathStats([100, 120, 140, 100, 105, 110]).mdd, -b.maxDD, 1e-9);
});
test('I. 분할 — 10,000원 × 100주 = 5,000원 × 200주(가치 같음) · 빈 집합 · 1종목 · 분모 0 · 기간 부족', () => {
  assert.equal(10000 * 100, 5000 * 200);
  assert.equal(drawdowns([100]), null); assert.equal(drawdowns([100, 0]), null); assert.equal(retN([1, 2], 2), null, '종가 N+1 개가 없으면 계산 불가');
  assert.equal(poolMean([{sum: 5, count: 1}], new Set([0])).mean, null, '하나뿐인 칸을 빼면 계산 불가');
});
