import test from 'node:test';
import assert from 'node:assert/strict';
import { intervalScore, classifyDirection, scoreLine, scorePairedLines, summarizePairedRows } from '../lib/paired-score.mjs';
import { buildDailyStudyReport, appendStudyReports, latestStudyReports } from '../lib/daily-score-report.mjs';
import { sealStudy } from '../lib/sealed-manifest.mjs';

const origin = '2026-09-17', target = '2026-09-18', next = '2026-09-21';
const now = '2026-09-21T16:00:00+09:00';
const line = (center, width = .1) => ({ status: 'ESTIMATED', price: 100 * (1 + center), centerReturn: center, lowerReturn: center - width, upperReturn: center + width });
function fixture(count = 2) {
  const sessions = [origin, target, next];
  const input = { origin, end: '2026-10-30', actualAsOf: next, calendar: { sessions }, priceRevisions: [], assets: [] };
  const study = { schema: 1, id: 'study-test', createdAt: '2026-09-17T16:00:00+09:00', origin, end: '2026-10-30', informationCutoff: '2026-09-17T16:00:00+09:00',
    retrospective: true, sessions, policy: { scoring: { alpha: .2, directionFlatThresholdReturn: 0, magnitudeToleranceReturn: null } }, assets: [], recordCount: count * 2 };
  for (let i = 0; i < count; i++) {
    const code = String(i + 1).padStart(6, '0'), name = '종목' + i;
    input.assets.push({ code, name, priceSource: { provider: 'FIXTURE', basisId: 'same-basis', priceVintageVerified: true, corporateActionsChecked: true },
      prices: [{ date: origin, close: 100, observedAt: origin + 'T15:40:00+09:00' },
        { date: target, close: i % 2 ? 90 : 110, observedAt: target + 'T16:00:00+09:00' },
        { date: next, close: i % 2 ? 99 : 105, observedAt: next + 'T16:00:00+09:00' }] });
    study.assets.push({ code, name, sector: 'TEST', originPrice: 100, priceBasisId: 'same-basis', priceBasisStatus: 'VERIFIED',
      rows: sessions.map((date, index) => ({ date, widthReturn: .1, widthStatus: 'CALIBRATED', a: line(0), b: line(index === 0 ? 0 : i % 2 ? -.05 : .05) })) });
  }
  return { input, study: sealStudy(study) };
}
function reseal(study, edit) { const s = structuredClone(study); delete s.seal; edit(s); return sealStudy(s); }
const report = (f, opts = {}) => buildDailyStudyReport(f.study, f.input, { date: target, now, ...opts });
const branch = study => ({ schema: 1, studies: [study], reports: [], proofs: [{ id: 'kept-proof' }], errors: [] });
const near = (a, b) => assert.ok(Math.abs(a - b) < 1e-10, `${a} != ${b}`);

test('interval scoring punishes width and tail misses with strict inputs and finite extremes', () => {
  assert.equal(intervalScore(-.1, .1, 0), .2);
  near(intervalScore(-.1, .1, .2), 1.2);
  near(intervalScore(-.1, .1, -.2), 1.2);
  assert.equal(intervalScore(0, 0, -1e-308, 1e-308), 2);
  for (const x of [null, undefined, NaN, Infinity, '.1']) assert.equal(intervalScore(x, .1, 0), null);
  assert.equal(intervalScore(.1, -.1, 0), null);
  assert.equal(intervalScore(0, 1, 0, 1), null);
});

test('common realized KOSPI shift leaves errors inclusion and IS unchanged', () => {
  const market = .0544, actual = .131, a = line(0, .2), b = line(.1, .2);
  for (const l of [a, b]) {
    near((l.centerReturn - market) - (actual - market), l.centerReturn - actual);
    near(intervalScore(l.lowerReturn - market, l.upperReturn - market, actual - market), intervalScore(l.lowerReturn, l.upperReturn, actual));
    assert.equal(l.lowerReturn <= actual && actual <= l.upperReturn, l.lowerReturn - market <= actual - market && actual - market <= l.upperReturn - market);
  }
});

test('equal-width bands can tie while centers differ; magnitude is unestimated until policy set', () => {
  const p = scorePairedLines(line(0), line(.05), .06);
  near(p.intervalImprovementPP, 0);
  near(p.centerImprovementPP, 5);
  assert.equal(p.a.magnitudeHit, null);
  assert.equal(p.b.category, 'UNDETERMINED');
  assert.equal(scoreLine(line(.05), .06, { magnitudeTolerance: .02 }).category, 'BOTH');
});

test('direction threshold and daily vs cumulative anchors are separate', () => {
  assert.equal(classifyDirection(.001, .001), 'FLAT');
  assert.equal(classifyDirection(null), null);
  const s = scoreLine(line(.05), .03, { previousCenterReturn: .1, previousActualReturn: -.01 });
  assert.equal(s.direction.matched, true);
  assert.equal(s.dailyDirection.predicted, 'DOWN');
  assert.equal(s.dailyDirection.actual, 'UP');
  assert.equal(s.dailyDirection.matched, false);
});

test('unestimable B is never changed to zero or included in paired denominator', () => {
  const f = fixture();
  f.study = reseal(f.study, s => { s.assets[1].rows[1].b = { status: 'UNESTIMABLE', price: null, centerReturn: null, lowerReturn: null, upperReturn: null }; });
  const r = report(f);
  assert.equal(r.rows.length, 2);
  assert.equal(r.rows[1].b, null);
  assert.equal(r.summary.unestimableB, 1);
  assert.equal(r.summary.formalAAvailable, 2);
  assert.equal(r.summary.formal.a.count, 1);
  assert.equal(r.summary.formal.b.count, 1);
});

test('both interval summaries use common eligibility rather than asymmetric band denominators', () => {
  const good = scoreLine(line(0), .01), missing = { ...good, interval: null };
  const summary = summarizePairedRows([{ code: 'A', a: good, b: missing }, { code: 'B', a: good, b: good }]);
  assert.equal(summary.a.count, 2);
  assert.equal(summary.a.intervalCount, 1);
  assert.equal(summary.b.intervalCount, 1);
});

test('full daily report preserves 52 stocks including missing actuals and one date group', () => {
  const f = fixture(52); f.input.assets[0].prices = f.input.assets[0].prices.filter(p => p.date !== target);
  const r = report(f);
  assert.equal(r.rows.length, 52);
  assert.equal(r.summary.actualAvailable, 51);
  assert.equal(r.summary.formalPaired, 51);
  assert.equal(r.summary.completeness, 'PARTIAL_ACTUALS');
  assert.equal(r.summary.dateGroupCount, 1);
  assert.equal(r.summary.independentSampleSize, null);
  assert.equal(r.summary.coMovement.independentSampleSize, null);
  assert.equal(r.summary.coMovement.available, 51);
});

test('co-movement uses daily movements and describes concentration, not correlation', () => {
  const r = report(fixture(), { date: next });
  assert.equal(r.summary.coMovement.up, 1);
  assert.equal(r.summary.coMovement.down, 1);
  assert.equal(r.summary.coMovement.majorityShare, .5);
  assert.equal(r.summary.coMovement.meaning, 'same_day_direction_concentration');
});

test('missing immediately previous session never falls back to another older close', () => {
  const f = fixture(); f.input.assets[0].prices = f.input.assets[0].prices.filter(p => p.date !== target);
  const r = report(f, { date: next });
  assert.equal(r.rows[0].actual.dailyReturn, null);
  assert.equal(r.rows[0].observed.a.dailyDirection, null);
  assert.equal(r.rows[0].a.dailyDirection, null);
  assert.equal(r.summary.coMovement.available, 1);
});

test('unverified origin/current basis blocks formal scores but keeps labeled observed diagnostics', () => {
  const f = fixture(); delete f.input.assets[0].priceSource.corporateActionsChecked;
  f.study = reseal(f.study, s => { s.assets[1].priceBasisStatus = 'UNVERIFIED'; });
  const r = report(f);
  assert.equal(r.summary.formalPaired, 0);
  assert.equal(r.summary.observedPaired, 2);
  assert.equal(r.rows[0].a, null);
  assert.ok(r.rows[0].observed.a);
  assert.equal(r.rows[0].observed.causal, false);
  assert.ok(r.rows[0].blockers.includes('ACTUAL_ADJUSTMENT_UNVERIFIED'));
});

test('uncalibrated and below-zero-price bands are not formal interval scores', () => {
  const f = fixture();
  f.study = reseal(f.study, s => { s.assets[0].rows[1].widthStatus = 'EXPLORATORY'; s.assets[1].rows[1].widthReturn = 2; s.assets[1].rows[1].a = line(0, 2); s.assets[1].rows[1].b = line(.05, 2); });
  const r = report(f);
  assert.equal(r.rows[0].a.interval, null);
  assert.ok(r.rows[0].observed.a.interval);
  assert.equal(r.rows[1].observed.a.interval, null);
  assert.equal(r.summary.formal.a.intervalCount, 0);
});

test('seal tampering blocks scores while preserving error history', () => {
  const f = fixture(); f.study.assets[0].rows[1].a.centerReturn = .99;
  const b = appendStudyReports(branch(f.study), f.input, { now });
  assert.equal(b.reports[0].sealValid, false);
  assert.equal(b.reports[0].summary.formalPaired, 0);
  assert.equal(b.reports[0].summary.observedPaired, 0);
  assert.equal(b.errors.length, 1);
  assert.deepEqual(b.proofs, [{ id: 'kept-proof' }]);
});

test('reports do not count origin, holidays, open or future sessions', () => {
  const f = fixture();
  for (const date of [origin, '2026-09-19', '2026-10-31', '2026-99-99']) assert.equal(report(f, { date }), null);
  assert.equal(report(f, { now: target + 'T15:29:00+09:00' }), null);
  const b = appendStudyReports(branch(f.study), f.input, { now: target + 'T16:00:00+09:00' });
  assert.equal(b.reports.length, 1);
});

test('same material input is idempotent, with no mutation or timestamp-only revisions', () => {
  const f = fixture(), before = JSON.stringify(f);
  const first = appendStudyReports(branch(f.study), f.input, { now });
  const second = appendStudyReports(first, f.input, { now: '2026-09-22T16:00:00+09:00' });
  assert.deepEqual(second, first);
  assert.equal(JSON.stringify(f), before);
  assert.equal(first.reports.length, 2);
  assert.equal(first.reports[0].temporalProof, 'LOCAL_DECLARED_TIME_ONLY');
  assert.equal(first.reports[0].externallyProven, false);
});

test('actual corrections add revisions and preserve frozen reports, including correction reversal', () => {
  const f = fixture(), first = appendStudyReports(branch(f.study), f.input, { now }), snapshot = JSON.stringify(first);
  const p = f.input.assets[0].prices.find(p => p.date === target);
  p.close = 115;
  const second = appendStudyReports(first, f.input, { now });
  assert.equal(JSON.stringify(first), snapshot);
  assert.equal(second.reports.length, first.reports.length + 2); // target cumulative and next-day daily anchor
  assert.equal(latestStudyReports(second, f.study.id).find(r => r.date === target).revision, 2);
  p.close = 110;
  const third = appendStudyReports(second, f.input, { now });
  assert.equal(latestStudyReports(third, f.study.id).find(r => r.date === target).revision, 3);
  assert.equal(new Set(third.reports.map(r => r.id)).size, third.reports.length);
  assert.deepEqual(appendStudyReports(third, f.input, { now }), third);
});

test('recorded future revisions are reversed before scoring and input is preserved', () => {
  const f = fixture(), p = f.input.assets[0].prices.find(p => p.date === target), original = structuredClone(p);
  p.close = 199;
  f.input.priceRevisions.push({ code: '000001', date: target, at: '2026-09-22T16:00:00+09:00', beforeRow: original, afterRow: structuredClone(p) });
  const snapshot = JSON.stringify(f.input), r = report(f);
  assert.equal(r.rows[0].actual.price, 110);
  assert.equal(JSON.stringify(f.input), snapshot);
});

test('future observed prices, duplicates, and malformed OHLC are withheld', () => {
  const f = fixture(3);
  f.input.assets[0].prices[1].observedAt = '2026-09-22T16:00:00+09:00';
  f.input.assets[1].prices.push(structuredClone(f.input.assets[1].prices[1]));
  f.input.assets[2].prices[1].high = 50;
  const r = report(f);
  assert.equal(r.summary.actualAvailable, 0);
  assert.equal(r.summary.formalPaired, 0);
});

test('partial observations beyond common date create reports without claiming all52 complete', () => {
  const f = fixture(); f.input.actualAsOf = origin;
  f.input.assets[1].prices = f.input.assets[1].prices.filter(p => p.date === origin);
  const b = appendStudyReports(branch(f.study), f.input, { now });
  assert.equal(b.reports.length, 2);
  assert.equal(b.reports[0].summary.completeness, 'PARTIAL_ACTUALS');
  assert.equal(b.reports[0].summary.total, 2);
});

test('no actuals beyond common date are not promoted into evaluation days', () => {
  const f = fixture(); f.input.actualAsOf = origin;
  for (const a of f.input.assets) a.prices = a.prices.filter(p => p.date === origin);
  assert.equal(appendStudyReports(branch(f.study), f.input, { now }).reports.length, 0);
});

test('actual KOSPI comparison is a separately labeled diagnostic, never an inferred forecast', () => {
  const f = fixture();
  const benchmark = { code: 'KOSPI', prices: [{ date: origin, close: 100, observedAt: origin + 'T16:00:00+09:00', source: 'https://example.com/kospi' },
    { date: target, close: 105, observedAt: target + 'T16:00:00+09:00', source: 'https://example.com/kospi' }] };
  const r = report(f, { benchmark });
  near(r.rows[0].benchmark.actualExcessReturn, .05);
  assert.equal(r.rows[0].benchmark.forwardExcessForecastStatus, 'UNESTIMABLE');
  assert.equal(r.rows[0].benchmark.forward, null);
});
