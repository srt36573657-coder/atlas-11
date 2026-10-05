import test from 'node:test';
import assert from 'node:assert/strict';
import {
  compensatedSum, logSumExp, empiricalLogReturnMoments,
  exactPriceMoments, requiredPathsForRelativeMeanSE, eventSupportWeights,
} from '../lib/news-numerics-v7.mjs';

function close(actual, expected, relative = 2e-12, absolute = 1e-12) {
  assert.ok(Number.isFinite(actual) && Number.isFinite(expected));
  assert.ok(Math.abs(actual - expected) <= Math.max(absolute, relative * Math.abs(expected)),
    `${actual} differs from ${expected}`);
}

test('compensated sums and shifted log-sum-exp retain representable quantities', () => {
  assert.equal(compensatedSum([1e16, 1, -1e16]), 1);
  close(logSumExp([1000, 1000]), 1000 + Math.log(2));
  close(logSumExp([-1000, -1000]), -1000 + Math.log(2));
  assert.throws(() => logSumExp([0, NaN]));
  assert.throws(() => compensatedSum([Infinity]));
});

test('exact two-day moments match exhaustive model states and separate sampling error from skill', () => {
  const result = exactPriceMoments(100, [
    { date: '2026-09-18', values: [Math.log(0.7), Math.log(1.3)] },
    { date: '2026-09-21', values: [Math.log(0.5), Math.log(1.5)] },
  ], { originDate: '2026-09-17', paths: 10000 });
  const row = result.rows.at(-1);
  close(row.mean, 100);
  close(row.secondMoment, 13625);
  close(row.variance, 3625);
  close(row.standardDeviation, Math.sqrt(3625));
  close(row.monteCarloMeanSE, Math.sqrt(3625 / 10000));
  assert.equal(row.meanMonteCarloSE, 0);
  assert.equal(row.trustProbability, null);
  assert.equal(row.predictiveSkillVerified, false);
  const budget = requiredPathsForRelativeMeanSE(row, 0.01).paths;
  // Ceil may conservatively add one path at an integer boundary in binary arithmetic.
  assert.ok(budget >= 3625 && budget <= 3626);
  assert.ok(Math.sqrt(row.variance / budget) / row.mean <= 0.01);
});

test('near-constant distributions retain a small positive variance without subtracting large moments', () => {
  const moment = empiricalLogReturnMoments([-1e-12, 1e-12]);
  assert.ok(moment.logSecondToSquaredMean > 0);
  close(moment.logSecondToSquaredMean, 1e-24, 1e-10, 1e-35);
  const row = exactPriceMoments(1e9, [{ date: '2026-09-18', values: [-1e-12, 1e-12] }]).rows[1];
  close(row.variance, 1e-6, 1e-10, 1e-16);
});

test('all signed tails remain in model moments and numeric overflow is exposed', () => {
  const moment = empiricalLogReturnMoments([Math.log(0.4), Math.log(2)]);
  assert.equal(moment.count, 2);
  close(Math.exp(moment.logGrossMean), 1.2);
  assert.equal(moment.signedTailsRetained, true);
  const huge = exactPriceMoments(1, [{ date: '2026-09-18', values: [-1000, 1000] }]);
  assert.equal(huge.status, 'numeric_range_limit');
  assert.equal(huge.rows[1].mean, null);
  assert.ok(huge.rows[1].flags.includes('mean_overflow'));
  assert.equal(huge.rows[1].increment.count, 2);
  assert.equal(huge.rows[1].expectedLogPrice, 0);
  // A rare tail may have finite E[P] but unrepresentable E[P²]. Never erase or throw it away.
  const rare = empiricalLogReturnMoments([0, 1000], { weights: [1, 1e-320] });
  assert.ok(Number.isFinite(rare.logGrossSecondMoment));
  close(rare.logGrossSecondMoment, 2000 + Math.log(1e-320));
  const rareRow = exactPriceMoments(1, [{ date: '2026-09-18', values: [0, 1000], weights: [1, 1e-320] }]).rows[1];
  assert.ok(Number.isFinite(rareRow.mean));
  assert.equal(rareRow.secondMoment, null);
  assert.ok(rareRow.flags.includes('second_moment_overflow'));
});

test('weighted supports handle zero mass, reject invalid values, and do not assume dependence away', () => {
  const moment = empiricalLogReturnMoments([Math.log(0.5), Math.log(2), 10000], { weights: [3, 1, 0] });
  close(Math.exp(moment.logGrossMean), 0.875);
  close(moment.effectiveSupportSize, 1.6);
  assert.throws(() => empiricalLogReturnMoments([0], { weights: [0] }));
  assert.throws(() => empiricalLogReturnMoments([0, 1], { weights: [1, -1] }));
  assert.throws(() => exactPriceMoments(0, []));
  assert.throws(() => exactPriceMoments(1, [], { independentIncrements: false }));
  assert.throws(() => exactPriceMoments(1, [
    { date: '2026-09-18', values: [0] }, { date: '2026-09-18', values: [0] },
  ]));
  assert.throws(() => exactPriceMoments(1, [{ date: '2026-02-30', values: [0] }]));
  assert.throws(() => exactPriceMoments(1, [null]));
  assert.throws(() => exactPriceMoments(1, [], { originDate: 'tomorrow' }));
});

test('changing path count changes only Monte Carlo comparison precision', () => {
  const supports = [{ date: '2026-09-18', values: [-0.2, 0.1, 0.3] }];
  const low = exactPriceMoments(100, supports, { paths: 2000 }).rows[1];
  const high = exactPriceMoments(100, supports, { paths: 20000 }).rows[1];
  assert.equal(low.mean, high.mean);
  assert.equal(low.variance, high.variance);
  close(low.monteCarloMeanSE / high.monteCarloMeanSE, Math.sqrt(10));
});

test('event marginal weights reproduce exact shared-date and missing-date fallback choices', () => {
  const samples = [{ date: '2026-08-03' }, { date: '2026-08-05' }];
  // First sample is directly selectable and also receives fallback mass; second only fallback.
  const weights = eventSupportWeights({ samples, sharedDates: ['2026-08-03', '2026-08-04'] });
  assert.deepEqual(weights, [0.75, 0.25]);
  close(Math.exp(empiricalLogReturnMoments([Math.log(0.5), Math.log(2)], { weights }).logGrossMean), 0.875);
  assert.deepEqual(eventSupportWeights({ samples, sharedDates: [] }), [0.5, 0.5]);
  assert.deepEqual(eventSupportWeights({ samples, sharedDates: ['2026-08-03', '2026-08-04', '2026-08-05'] }), [0.5, 0.5]);
  assert.throws(() => eventSupportWeights({ samples: [samples[0], samples[0]], sharedDates: [] }));
});

test('10,000 deterministic synthetic cases match exhaustive enumeration and invariants; not cross-validation', t => {
  let seed = 0x7126a9;
  const random = () => { seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0; return seed / 2 ** 32; };
  const dates = ['2026-09-18', '2026-09-21', '2026-09-22', '2026-09-23'];
  let maximumRelativeMeanError = 0, maximumRelativeVarianceError = 0;
  for (let caseIndex = 0; caseIndex < 10000; caseIndex++) {
    const start = 10 ** (-3 + 9 * random());
    const horizon = 1 + Math.floor(random() * 4);
    const supports = Array.from({ length: horizon }, (_, index) => ({
      date: dates[index],
      values: Array.from({ length: 1 + Math.floor(random() * 3) }, () => (random() - 0.5) * 1.4),
    }));
    let states = [{ price: start, mass: 1 }];
    for (const support of supports) states = states.flatMap(state => support.values.map(value => ({
      price: state.price * Math.exp(value), mass: state.mass / support.values.length,
    })));
    // Independent oracle enumerates every possible finite-model path; no RNG forecast is used.
    const expectedMean = states.reduce((sum, state) => sum + state.price * state.mass, 0);
    const expectedSecond = states.reduce((sum, state) => sum + state.price ** 2 * state.mass, 0);
    const expectedVariance = states.reduce((sum, state) => sum + (state.price - expectedMean) ** 2 * state.mass, 0);
    const expectedLog = states.reduce((sum, state) => sum + Math.log(state.price) * state.mass, 0);
    const actual = exactPriceMoments(start, supports).rows.at(-1);
    close(actual.mean, expectedMean);
    close(actual.secondMoment, expectedSecond, 5e-12);
    close(actual.variance, expectedVariance, 5e-11, 1e-10);
    close(actual.expectedLogPrice, expectedLog);
    assert.ok(actual.variance >= 0);
    assert.equal(actual.trustProbability, null);
    const scale = 0.25 + 4 * random();
    const scaled = exactPriceMoments(start * scale, supports).rows.at(-1);
    close(scaled.mean, actual.mean * scale);
    close(scaled.variance, actual.variance * scale ** 2, 5e-11, 1e-10);
    const reversed = supports.map(support => ({ ...support, values: [...support.values].reverse() }));
    close(exactPriceMoments(start, reversed).rows.at(-1).mean, actual.mean);
    maximumRelativeMeanError = Math.max(maximumRelativeMeanError, Math.abs(actual.mean - expectedMean) / expectedMean);
    if (expectedVariance > 1e-16 * expectedMean ** 2)
      maximumRelativeVarianceError = Math.max(maximumRelativeVarianceError, Math.abs(actual.variance - expectedVariance) / expectedVariance);
  }
  t.diagnostic(JSON.stringify({
    syntheticCases: 10000, passedCases: 10000, failedCases: 0,
    independentMarketCrossValidations: 0,
    oracle: 'exhaustive_finite_support_path_enumeration',
    maximumRelativeMeanError, maximumRelativeVarianceError,
    predictiveAccuracyCertified: false,
  }));
});
