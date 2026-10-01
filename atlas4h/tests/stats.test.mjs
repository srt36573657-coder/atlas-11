/**
 * 채점 셈(atlas4h/spec/stats.mjs)을 손으로 센 값과 맞대어 본다
 *   node --test atlas4h/tests/
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import {crpsFromSamples, intervalScore, brierScore, erfc, normalCdf, normalSf, chi2Sf1, dmTest, kupiecLR, mean} from '../spec/stats.mjs';

const close = (a, b, tol, what) => assert.ok(Math.abs(a - b) <= tol, `${what ?? ''} ${a} ≠ ${b} (허용 ${tol})`);

test('CRPS: 표본 [1,2,3]·실제 2 → 2/3 − 8/18 = 2/9', () => {
  close(crpsFromSamples([1, 2, 3], 2), 2 / 9, 1e-15);
  close(crpsFromSamples([3, 1, 2], 2), 2 / 9, 1e-15, '순서가 달라도 같다');
});

test('CRPS: 값 하나면 절대 오차와 같다 (원문 p.367)', () => {
  assert.equal(crpsFromSamples([5], 2), 3);
  assert.equal(crpsFromSamples([2650], 2661.5), 11.5);
});

test('CRPS: 정렬 셈 = 두 겹 합을 그대로 센 값', () => {
  const xs = [2611, 2633, 2652, 2670, 2690, 2602.5, 2688.25];
  const y = 2661.3;
  let a = 0;
  let b = 0;
  for (const x of xs) a += Math.abs(x - y);
  for (const x of xs) for (const z of xs) b += Math.abs(x - z);
  close(crpsFromSamples(xs, y), a / xs.length - b / (2 * xs.length ** 2), 1e-9);
});

test('CRPS: 빈 표본·NaN 은 NaN', () => {
  assert.ok(Number.isNaN(crpsFromSamples([], 1)));
  assert.ok(Number.isNaN(crpsFromSamples([1, NaN], 1)));
});

test('구간 점수: 안이면 폭, 밖이면 벗어난 거리 1당 2/α (α 0.2 → 10)', () => {
  assert.equal(intervalScore(10, 20, 15, 0.2), 10);
  assert.equal(intervalScore(10, 20, 25, 0.2), 60);
  assert.equal(intervalScore(10, 20, 5, 0.2), 60);
  assert.equal(intervalScore(2611, 2690, 2661.3, 0.2), 79);
  close(intervalScore(2611, 2690, 2700, 0.2), 79 + 100, 1e-9);
  assert.throws(() => intervalScore(1, 2, 3, 0));
});

test('브라이어: (p − o)² — 보기 0.41·1 → 0.3481', () => {
  close(brierScore(0.41, 1), 0.3481, 1e-12);
  close(brierScore(0.41, 0), 0.1681, 1e-12);
  assert.ok(Number.isNaN(brierScore(0.5, 2)));
});

test('erfc·Φ·χ²: 알려진 값', () => {
  close(erfc(0), 1, 1e-15);
  close(erfc(0.5), 0.4795001221869535, 1e-14);
  close(erfc(1), 0.15729920705028513, 1e-14);
  close(erfc(3), 2.209049699858544e-5, 1e-17);
  close(erfc(5), 1.5374597944280349e-12, 1e-22);
  close(erfc(-1), 1.8427007929497148, 1e-14);
  close(normalCdf(1.959963984540054), 0.975, 1e-12);
  close(normalCdf(0), 0.5, 1e-15);
  close(normalSf(1.6448536269514722), 0.05, 1e-12);
  close(chi2Sf1(3.841458820694124), 0.05, 1e-12);
});

test('DM: d = [1,2,3,4], 늦춤 0 → γ0 = 1.25 · DM = √20', () => {
  const r = dmTest([1, 2, 3, 4], [0, 0, 0, 0], {lag: 0});
  assert.equal(r.T, 4);
  assert.equal(r.mean, 2.5);
  close(r.longRunVariance, 1.25, 1e-15);
  close(r.stat, Math.sqrt(20), 1e-12);
  close(r.p, normalSf(Math.sqrt(20)), 1e-15);
});

test('DM: 늦춤 1 (Newey–West) → γ1 = 0.3125 · ĝ(0) = 1.5625 · DM = 4', () => {
  const r = dmTest([1, 2, 3, 4], [0, 0, 0, 0], {lag: 1});
  close(r.longRunVariance, 1.5625, 1e-15);
  close(r.stat, 4, 1e-12);
  close(r.p, 3.167124183311992e-5, 1e-12);
});

test('DM: 엔진과 기준이 번갈아 이기면 DM 0 · p 0.5', () => {
  const r = dmTest([2, 1, 2, 1], [1, 2, 1, 2]);
  assert.equal(r.stat, 0);
  close(r.p, 0.5, 1e-15);
});

test('DM: 차이가 모두 같으면 분산 0 → p 없음 (통과로 치지 않음)', () => {
  const r = dmTest([3, 3, 3], [1, 1, 1]);
  assert.equal(r.p, null);
  assert.equal(r.note, '분산 0');
});

test('DM: 늦춤은 0 아래·표본 넘게 주어도 안전하게 자른다', () => {
  assert.equal(dmTest([1, 2, 3], [0, 0, 0], {lag: -2}).lag, 0);
  assert.equal(dmTest([1, 2, 3], [0, 0, 0], {lag: 9}).lag, 2);
  assert.throws(() => dmTest([1], [1, 2]));
});

test('Kupiec: 손으로 센 값 — x = np 이면 0, x = 0·n = 10 이면 −20·ln 0.8', () => {
  close(kupiecLR(6, 30, 0.2).lr, 0, 1e-12);
  close(kupiecLR(0, 10, 0.2).lr, -20 * Math.log(0.8), 1e-12);
  close(kupiecLR(0, 10, 0.2).p, chi2Sf1(-20 * Math.log(0.8)), 1e-15);
});

test('Kupiec: 「틀렸다고 못 하는」 빗나감 수가 part-engine.md 표와 같다', () => {
  const table = [[30, 3, 10], [60, 7, 18], [120, 16, 32], [250, 39, 62]];
  for (const [n, lo, hi] of table) {
    assert.ok(kupiecLR(lo - 1, n).lr > 3.841, `n=${n} x=${lo - 1}`);
    assert.ok(kupiecLR(lo, n).lr < 3.841, `n=${n} x=${lo}`);
    assert.ok(kupiecLR(hi, n).lr < 3.841, `n=${n} x=${hi}`);
    assert.ok(kupiecLR(hi + 1, n).lr > 3.841, `n=${n} x=${hi + 1}`);
  }
});

test('mean: 빈 목록은 NaN', () => {
  assert.ok(Number.isNaN(mean([])));
  assert.equal(mean([1, 2, 3]), 2);
});
