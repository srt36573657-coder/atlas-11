import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import assert from 'node:assert/strict';
import { fileURLToPath } from 'node:url';
import {
  NUMERICS_VERSION, exactPriceMoments, empiricalLogReturnMoments, eventSupportWeights,
} from '../lib/news-numerics-v7.mjs';

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const reportDirectory = path.join(root, 'reports');
const startedAt = new Date().toISOString();
const initialSeed = 0x7126a9;
const caseCount = 10000;
const moduleFile = path.join(root, 'lib/news-numerics-v7.mjs');
const sha256 = value => crypto.createHash('sha256').update(value).digest('hex');
const hashFile = file => sha256(fs.readFileSync(file));
let state = initialSeed;
const random = () => { state = (Math.imul(state, 1664525) + 1013904223) >>> 0; return state / 2 ** 32; };
const dates = ['2026-09-18', '2026-09-21', '2026-09-22', '2026-09-23'];
const failures = [], edgeChecks = [];
const sequenceHash = crypto.createHash('sha256');
let passed = 0, failed = 0, enumeratedPathStates = 0;
let maximumRelativeMeanError = 0, maximumRelativeVarianceError = 0;
function close(actual, expected, relative = 2e-12, absolute = 1e-12) {
  assert.ok(Number.isFinite(actual) && Number.isFinite(expected), 'Nonfinite oracle comparison');
  assert.ok(Math.abs(actual - expected) <= Math.max(absolute, relative * Math.abs(expected)),
    `${actual} differs from ${expected}`);
}

for (let caseIndex = 0; caseIndex < caseCount; caseIndex++) {
  const startPrice = 10 ** (-3 + 9 * random());
  const horizon = 1 + Math.floor(random() * 4);
  const supports = Array.from({ length: horizon }, (_, index) => ({
    date: dates[index],
    values: Array.from({ length: 1 + Math.floor(random() * 3) }, () => (random() - 0.5) * 1.4),
  }));
  const scale = 0.25 + 4 * random();
  sequenceHash.update(JSON.stringify({ caseIndex, startPrice, supports, scale }));
  try {
    // This oracle enumerates ALL finite-support states, independently of moment formulas.
    let states = [{ price: startPrice, mass: 1 }];
    for (const support of supports) states = states.flatMap(state => support.values.map(value => ({
      price: state.price * Math.exp(value), mass: state.mass / support.values.length,
    })));
    enumeratedPathStates += states.length;
    const expectedMean = states.reduce((sum, point) => sum + point.price * point.mass, 0);
    const expectedSecond = states.reduce((sum, point) => sum + point.price ** 2 * point.mass, 0);
    const expectedVariance = states.reduce((sum, point) => sum + (point.price - expectedMean) ** 2 * point.mass, 0);
    const expectedLog = states.reduce((sum, point) => sum + Math.log(point.price) * point.mass, 0);
    const row = exactPriceMoments(startPrice, supports, { paths: 10000 }).rows.at(-1);
    close(row.mean, expectedMean);
    close(row.secondMoment, expectedSecond, 5e-12);
    close(row.variance, expectedVariance, 5e-11, 1e-10);
    close(row.expectedLogPrice, expectedLog);
    close(row.monteCarloMeanSE, Math.sqrt(expectedVariance / 10000), 5e-11, 1e-10);
    assert.ok(row.variance >= 0);
    assert.equal(row.trustProbability, null);
    assert.equal(row.predictiveSkillVerified, false);
    const scaled = exactPriceMoments(startPrice * scale, supports).rows.at(-1);
    close(scaled.mean, row.mean * scale);
    close(scaled.variance, row.variance * scale ** 2, 5e-11, 1e-10);
    const reversed = supports.map(support => ({ ...support, values: [...support.values].reverse() }));
    close(exactPriceMoments(startPrice, reversed).rows.at(-1).mean, row.mean);
    maximumRelativeMeanError = Math.max(maximumRelativeMeanError, Math.abs(row.mean - expectedMean) / expectedMean);
    if (expectedVariance > 1e-16 * expectedMean ** 2)
      maximumRelativeVarianceError = Math.max(maximumRelativeVarianceError, Math.abs(row.variance - expectedVariance) / expectedVariance);
    passed++;
  } catch (error) {
    failed++;
    if (failures.length < 50) failures.push({ caseIndex, startPrice, supports, scale, message: error.message });
  }
}

function edge(name, execute) {
  try { edgeChecks.push({ name, status: 'PASS', observed: execute() }); }
  catch (error) { edgeChecks.push({ name, status: 'FAIL', message: error.message }); }
}
edge('positive_and_negative_extremes_retained', () => {
  const values = [Math.log(0.4), Math.log(2)];
  const moment = empiricalLogReturnMoments(values);
  close(Math.exp(moment.logGrossMean), 1.2);
  assert.equal(moment.count, 2);
  return { retained: moment.count, grossMean: Math.exp(moment.logGrossMean) };
});
edge('tiny_variance_without_catastrophic_cancellation', () => {
  const row = exactPriceMoments(1e9, [{ date: dates[0], values: [-1e-12, 1e-12] }]).rows[1];
  close(row.variance, 1e-6, 1e-10, 1e-16);
  return { modelVariance: row.variance, expectedVarianceApproximation: 1e-6 };
});
edge('rare_huge_weighted_tail_not_discarded', () => {
  const row = exactPriceMoments(1, [{ date: dates[0], values: [0, 1000], weights: [1, 1e-320] }]).rows[1];
  close(row.logSecondMoment, 2000 + Math.log(1e-320));
  assert.ok(Number.isFinite(row.mean));
  assert.equal(row.secondMoment, null);
  assert.ok(row.flags.includes('second_moment_overflow'));
  return { mean: row.mean, logSecondMoment: row.logSecondMoment, secondMoment: row.secondMoment, flags: row.flags };
});
edge('shared_date_fallback_requires_nonuniform_event_weights', () => {
  const weights = eventSupportWeights({
    samples: [{ date: '2026-08-03' }, { date: '2026-08-05' }],
    sharedDates: ['2026-08-03', '2026-08-04'],
  });
  assert.deepEqual(weights, [0.75, 0.25]);
  close(Math.exp(empiricalLogReturnMoments([Math.log(0.5), Math.log(2)], { weights }).logGrossMean), 0.875);
  return { weights, expectedGrossMean: 0.875 };
});
edge('model_increments_dependency_rejected', () => {
  assert.throws(() => exactPriceMoments(100, [], { independentIncrements: false }));
  return { dependentIncrementsAccepted: false };
});

const report = {
  schema: 1, status: failed || edgeChecks.some(check => check.status === 'FAIL') ? 'FAIL' : 'PASS',
  startedAt, completedAt: new Date().toISOString(),
  numericalVersion: NUMERICS_VERSION,
  sourceHashes: { module: hashFile(moduleFile), runner: hashFile(fileURLToPath(import.meta.url)) },
  design: {
    syntheticCases: caseCount, initialSeed, randomGenerator: 'LCG32(1664525,1013904223)',
    inputCaseSequenceSHA256: sequenceHash.digest('hex'),
    priceRange: '[10^-3,10^6)', horizons: '1..4', supportSize: '1..3',
    logReturnRange: '[-0.7,0.7)', scaleRange: '[0.25,4.25)',
    oracle: 'exhaustive_finite_support_path_enumeration',
    enumeratedPathStates,
    assertions: ['mean', 'second_moment', 'variance', 'expected_log_price', 'MC_mean_SE',
      'nonnegative_variance', 'null_trust_probability', 'uncertified_skill', 'scale_invariance', 'support_order_invariance'],
    relativeVarianceErrorReportedOnlyWhen: 'oracle_variance > 1e-16 * oracle_mean^2',
    additionalEdgeChecks: edgeChecks.length,
  },
  result: { passedCases: passed, failedCases: failed, maximumRelativeMeanError, maximumRelativeVarianceError },
  edgeChecks, failures, failuresShownLimit: 50,
  interpretation: {
    independentMarketCrossValidations: 0, predictiveAccuracyCertified: false,
    sameSyntheticSetAsUnitTest: true,
    repeatExecutionDoesNotIncreaseIndependentEvidence: true,
    sourceOrHistoricalVintageCertified: false,
    explanation: 'Finite-model arithmetic checks only; not real-market forecast validation or 10,000 independent investigations.',
  },
};
fs.mkdirSync(reportDirectory, { recursive: true });
const historyDirectory = path.join(reportDirectory, 'numerics-10000-history');
fs.mkdirSync(historyDirectory, { recursive: true });
const runId = `${startedAt.replace(/[:.]/g, '-')}-${report.sourceHashes.module.slice(0, 8)}`;
const serialized = JSON.stringify(report, null, 2) + '\n';
fs.writeFileSync(path.join(historyDirectory, `${runId}.json`), serialized, { flag: 'wx' });
fs.writeFileSync(path.join(reportDirectory, 'numerics-10000.json'), serialized);
fs.writeFileSync(path.join(reportDirectory, 'numerics-10000.md'), `# 수치 계산 10,000개 합성 사례 검사\n\n`
  + `- 실행: ${report.completedAt}\n- 결과: ${report.status} — ${passed.toLocaleString('en-US')} 통과 / ${failed} 실패\n`
  + `- 모듈: ${NUMERICS_VERSION}\n- 모듈 SHA256: \`${report.sourceHashes.module}\`\n`
  + `- 시드: ${initialSeed}; 1~4거래일, 일별 1~3개 지지값의 모든 경로 열거\n`
  + `- 최대 상대 평균 오차: ${maximumRelativeMeanError}\n- 최대 상대 분산 오차: ${maximumRelativeVarianceError}\n`
  + `- 추가 극값·가중치·의존성 검사: ${edgeChecks.filter(check => check.status === 'PASS').length}/${edgeChecks.length}\n\n`
  + `단위 검사와 같은 합성 집합을 다시 실행한 결과입니다. 독립 시장 교차검증은 **0회**이며, 실제 주가 정확도·뉴스 원문·과거 빈티지를 인증하지 않습니다. 실행마다 새로운 독립 증거가 추가됐다고 세지 않습니다.\n\n`
  + `세부 사례 설계, 입력 시퀀스 해시, 오류, 극값 결과는 [numerics-10000.json](numerics-10000.json)에 기록했습니다. 이전 실행의 JSON도 이력 폴더에 보존합니다.\n`);
console.log(JSON.stringify({ status: report.status, cases: caseCount, passed, failed,
  edgeChecksPassed: edgeChecks.filter(check => check.status === 'PASS').length,
  moduleSHA256: report.sourceHashes.module, report: 'reports/numerics-10000.json' }));
if (report.status !== 'PASS') process.exitCode = 1;
