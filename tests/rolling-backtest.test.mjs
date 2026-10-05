import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { createHash } from 'node:crypto';
import { gunzipSync } from 'node:zlib';
import { adoptionDecision, rankingHits, truncateObservedPanel, pairedEquivalentForecast, ROLLING_AB_PROTOCOL } from '../lib/rolling-backtest.mjs';

test('AB adoption requires both strict error improvement and nonworse rank', () => {
  assert.equal(adoptionDecision({ meanErrorPct: 2, rankHits: 10 }, { meanErrorPct: 1.9, rankHits: 10 }).selected, 'B');
  assert.equal(adoptionDecision({ meanErrorPct: 2, rankHits: 10 }, { meanErrorPct: 1.9, rankHits: 9 }).selected, 'A');
  assert.equal(adoptionDecision({ meanErrorPct: 2, rankHits: 10 }, { meanErrorPct: 2, rankHits: 10 }).reason, 'mathematically_identical_no_improvement');
  assert.equal(adoptionDecision({ meanErrorPct: 2, rankHits: 10 }, { meanErrorPct: 1.9, rankHits: 11 }, { complete: false }).selected, 'A');
  assert.equal(adoptionDecision({ meanErrorPct: 2, rankHits: 10 }, { meanErrorPct: null, rankHits: 11 }).selected, 'A');
});

test('ranking is exact top5 overlap with declared deterministic ties and same universe', () => {
  const predicted = { '000006': 0, '000005': 0, '000004': 0, '000003': 0, '000002': 0, '000001': 0 };
  const actual = { '000006': 6, '000005': 5, '000004': 4, '000003': 3, '000002': 2, '000001': 1 };
  const r = rankingHits(predicted, actual);
  assert.equal(r.hits, 4); assert.deepEqual(r.predictedTop, ['000001','000002','000003','000004','000005']);
  assert.throws(() => rankingHits(predicted, { ...actual, '000007': 7 }), /RANKING_INPUT/);
  assert.throws(() => rankingHits(predicted, { ...actual, '000001': null }), /RANKING_INPUT/);
});

test('historical panel physically excludes all future prices and cross-sectional features', () => {
  const dates = Array.from({ length: 80 }, (_, i) => `d${i}`), p = { dates, returns: [dates.map((_, i) => i)], breadth: dates.map((_, i) => i), basket: dates.map((_, i) => i) }, truncated = truncateObservedPanel(p, 65);
  assert.equal(truncated.dates.length, 66); assert.equal(truncated.returns[0].at(-1), 65); assert.equal(truncated.breadth.at(-1), 65); assert.equal(truncated.basket.at(-1), 65);
  assert.throws(() => truncateObservedPanel(p, 80), /PANEL_INDEX/);
});

test('paired forecast rejects future-trained models before simulation', () => {
  assert.throws(() => pairedEquivalentForecast([{ trainedThrough: '2026-03-04', shockDates: [] }], { dates: ['2026-03-03'] }, [], ['2026-03-04']), /FUTURE_TRAINING/);
  assert.equal(ROLLING_AB_PROTOCOL.originDays, 120); assert.equal(ROLLING_AB_PROTOCOL.blocks, 6); assert.equal(ROLLING_AB_PROTOCOL.paths, 512);
});

test('paired simulation preserves own-price anchors, cross-stock separation, and extreme losses', () => {
  const dates = Array.from({ length: 72 }, (_, i) => new Date(Date.UTC(2025, 0, 1 + i)).toISOString().slice(0, 10));
  const observed = { dates: dates.slice(0, 70), returns: [Array(70).fill(0), Array(70).fill(0)], breadth: Array(70).fill(0), basket: Array(70).fill(0) };
  const model = { status: 'research_estimate', trainedThrough: dates[69], shockDates: dates.slice(0, 60), shocks: Array.from({ length: 60 }, (_, i) => i === 0 ? -30 : 1), regression: { beta: Array(7).fill(0), center: Array(7).fill(0), scale: Array(7).fill(1), intercept: 0 }, volatility: { initial: .04, last: .04, omega: .04, a: 0, b: 0 }, featureFactors: ['F35','F35','F35','F35','F35','F11','F11'] };
  const assets = [{ code: '000001', prices: [{ date: dates[69], close: 100 }] }, { code: '000002', prices: [{ date: dates[69], close: 200 }] }];
  const result = pairedEquivalentForecast([model, structuredClone(model)], observed, assets, dates.slice(70), { paths: 100, seed: 20260917 });
  assert.deepEqual(result.A, result.B); assert.notEqual(result.A, result.B);
  result.B[0][0].p50 = -1; assert.ok(result.A[0][0].p50 > 0);
  assert.equal(result.audit.deletedForLoss, 0); assert.ok(result.audit.minLogReturn < Math.log(.7));
  const changed = structuredClone(assets); changed[0].prices[0].close = 150;
  const second = pairedEquivalentForecast([model, structuredClone(model)], observed, changed, dates.slice(70), { paths: 100, seed: 20260917 });
  assert.ok(Math.abs(second.A[0][0].p50 / result.A[0][0].p50 - 1.5) < 1e-12);
  assert.deepEqual(second.A[1], result.A[1]);
});

test('saved 120-day evidence preserves original numbers and explicitly corrects unmeasured anchor metadata', () => {
  const read = f => JSON.parse(fs.readFileSync(f, 'utf8')), sha = bytes => createHash('sha256').update(bytes).digest('hex');
  const latest = read('reports/rolling/ab-latest.json'), correction = read('reports/rolling/ab-metadata-correction.json'), resultBytes = fs.readFileSync(correction.resultFile), result = JSON.parse(resultBytes), protocol = read(correction.resultFile.replace('result.json', 'protocol.json'));
  assert.equal(sha(resultBytes), correction.resultSHA256);
  assert.ok(Date.parse(protocol.declaredAt) <= Date.parse(result.startedAt));
  assert.deepEqual(result.A, correction.metricsUnchanged.A); assert.deepEqual(result.B, correction.metricsUnchanged.B);
  if (latest.runId === result.runId) assert.equal(latest.metadataCorrection, 'reports/rolling/ab-metadata-correction.json');
  assert.equal(result.originDays, 120); assert.equal(result.blocks, 6); assert.equal(result.stocks, 52); assert.equal(result.stockTargetRows, 124800);
  for (const block of result.blockDetails) { assert.ok(block.maximumTrainingDate <= block.originFirst); assert.equal(block.eligibleStocks, 52); }
  assert.equal(correction.correctedInterpretation.numericallyMeasuredAnchorOutputDifference, null);
  const audit = read('reports/rolling/ab-error-propagation.json');
  assert.equal(audit.result.sourcePriceAnchorDifference, undefined); assert.equal(audit.result.numericallyMeasuredAnchorOutputDifference, null);
  const reproduction = read(correction.resultFile.replace('result.json', 'reproduction.json')), inputBytes = gunzipSync(fs.readFileSync(reproduction.inputSnapshotFile));
  assert.equal(sha(inputBytes), reproduction.inputSnapshotSHA256);
  const source = JSON.parse(inputBytes), prices = new Map(source.assets.map(a => [a.code, new Map(a.prices.map(p => [p.date, p.close]))]));
  const ledger = gunzipSync(fs.readFileSync(result.ledger.file)); assert.equal(sha(ledger), result.ledger.uncompressedSHA256);
  const rows = ledger.toString().trim().split('\n').slice(1), byDate = new Map();
  for (const line of rows) {
    const [origin,, code,, target, anchor, actual, A, B, ea, eb] = line.split(','), observed = prices.get(code);
    assert.equal(Number(actual), observed.get(target)); assert.equal(Number(anchor), observed.get(origin)); assert.ok(target > origin);
    assert.ok(Math.abs(Math.abs(Number(A) - Number(actual)) / Number(actual) * 100 - Number(ea)) < 1e-10);
    assert.equal(A, B); assert.equal(ea, eb);
    const acc = byDate.get(origin) ?? { sum: 0, n: 0 }; acc.sum += Number(ea); acc.n++; byDate.set(origin, acc);
  }
  assert.equal(rows.length, 124800); assert.equal(byDate.size, 120);
  const independentErrorCheck = [...byDate.values()].reduce((sum, r) => sum + r.sum / r.n, 0) / byDate.size;
  assert.ok(Math.abs(independentErrorCheck - result.A.meanErrorPct) < 1e-10);
});
