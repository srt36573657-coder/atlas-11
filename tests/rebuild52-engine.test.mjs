import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { forecast, sourceDataDigest, reactionSample } from '../lib/news-engine.mjs';
import { compensatedSum } from '../lib/news-numerics-v7.mjs';

const fixture = JSON.parse(fs.readFileSync(new URL('./fixtures/input-v3.json', import.meta.url), 'utf8'));
const cutoff = fixture.informationAsOf;
const options = { paths: 2000, seed: 1717, informationCutoff: cutoff, createdAt: '2026-09-26T00:00:00Z' };
let cachedBaseline;
const captured = new Map();
function baseline() {
  if (!cachedBaseline) cachedBaseline = forecast(fixture, { ...options, onDistribution: distribution => {
    captured.set(`${distribution.code}:${distribution.date}`, {
      mean: compensatedSum(Array.from(distribution.sorted, value => value / options.paths)),
      minimum: distribution.sorted[0], maximum: distribution.sorted.at(-1),
      count: distribution.sorted.length,
    });
  } });
  return cachedBaseline;
}
function near(actual, expected, tolerance = 2e-12) {
  assert.ok(Number.isFinite(actual) && Number.isFinite(expected));
  assert.ok(Math.abs(actual - expected) <= Math.max(1e-9, Math.abs(expected) * tolerance), `${actual} != ${expected}`);
}
// Reserved-domain synthetic evidence is only a test fixture, never installed as real news.
function companyEvent({ kind = 'COMPANY_IR', targetDate, verified = true, id = 'TEST:v7:company' }) {
  return { id, kind, name: 'TEST ONLY issuer calendar', announcementDate: targetDate, targetDate,
    availableAt: '2026-09-01T00:00:00Z', status: 'scheduled', scope: { type: 'company', codes: [fixture.assets[0].code] },
    sources: [{ url: 'https://test-issuer.example/ir/primary-fixture', publisherRole: 'issuer',
      primaryPublisherVerified: verified, sourceBodyRead: verified, attestedAt: '2026-09-01T00:00:00Z' }] };
}

test('v7 exact conditional means are seed independent across all 52 stocks; sampled distribution remains auditable', () => {
  const first = baseline(), second = forecast(fixture, { ...options, seed: 7171 });
  assert.equal(first.assets.length, 52);
  assert.equal(second.assets.length, 52);
  assert.equal(first.trustProbability, null);
  let changedMonteCarloMeans = 0;
  for (const a of first.assets) {
    const b = second.assets.find(asset => asset.code === a.code);
    assert.ok(b);
    assert.equal(a.rows[1].distributionMethod,'exact_one_step_empirical_distribution');
    assert.equal(a.rows[1].p50,b.rows[1].p50);
    assert.equal(a.rows[1].rawProbUp,b.rows[1].rawProbUp);
    assert.equal(a.rows[1].probabilityMonteCarloSE,0);
    assert.equal(a.rows.at(-1).numericalPrecision.method,'fixed_n_dkw_massart');
    assert.equal(a.rows.at(-1).numericalPrecision.familySize,52*(a.rows.length-1));
    for (const [index, row] of a.rows.entries()) {
      assert.equal(row.mean, b.rows[index].mean);
      assert.equal(row.exactVariance, b.rows[index].exactVariance);
      assert.equal(row.meanMonteCarloSE, 0);
      assert.equal(row.numericStatus, 'finite');
      near(row.sampledMeanMonteCarloSE, Math.sqrt(row.exactVariance / options.paths));
      if (!index) continue;
      const observed = captured.get(`${a.code}:${row.date}`);
      assert.equal(observed.count, options.paths);
      near(row.monteCarloMean, observed.mean);
      assert.ok(row.p10 <= row.p50 && row.p50 <= row.p90);
      assert.ok(row.monteCarloMean >= observed.minimum && row.monteCarloMean <= observed.maximum);
      if (row.monteCarloMean !== b.rows[index].monteCarloMean) changedMonteCarloMeans++;
    }
  }
  assert.ok(changedMonteCarloMeans > 0, 'Only the analytic mean must be seed independent, not randomized path estimates');
});

test('origin close cannot be used with a cutoff before the Korean market close', () => {
  assert.throws(() => forecast(fixture, { ...options,
    informationCutoff: `${fixture.origin}T15:29:59+09:00` }), /기준 시각/);
  assert.throws(() => forecast(fixture, { ...options,
    informationCutoff: `${fixture.origin}T06:29:59Z` }), /기준 시각/);
});

test('confirmed context on a macro day adds explanation without forcing a price move or blocking that macro', () => {
  const before = baseline(), code = fixture.assets[0].code;
  const existing = before.assets.find(a => a.code === code).news.find(profile => profile.used);
  assert.ok(existing, 'Fixture must have an active macro distribution to exercise the non-veto rule');
  const context = companyEvent({ targetDate: existing.date });
  const after = forecast({ ...fixture, events: [...fixture.events, context] }, options);
  const target = after.assets.find(a => a.code === code);
  const explanation = target.news.find(p => p.id === context.id);
  assert.equal(explanation.evidenceAssessment.classification, 'context_only');
  assert.equal(explanation.used, false);
  assert.equal(target.news.find(p => p.id === existing.id).used, true);
  assert.ok(target.news.find(p => p.id === existing.id).sameDayEvidence.contextWarnings.some(w => w.id === context.id));
  for (const asset of after.assets) assert.deepEqual(asset.rows, before.assets.find(a => a.code === asset.code).rows);
});

test('unresolved potentially material same-day company evidence blocks only that company macro attribution', () => {
  const before = baseline(), code = fixture.assets[0].code;
  const existing = before.assets.find(a => a.code === code).news.find(profile => profile.used);
  assert.ok(existing);
  const uncertain = companyEvent({ kind: 'COMPANY_GUIDANCE', targetDate: existing.date,
    verified: false, id: 'TEST:v7:uncertain-guidance' });
  const after = forecast({ ...fixture, events: [...fixture.events, uncertain] }, options);
  const target = after.assets.find(a => a.code === code);
  assert.equal(target.news.find(p => p.id === uncertain.id).evidenceAssessment.classification, 'abstain');
  assert.equal(target.news.find(p => p.id === existing.id).used, false);
  assert.ok(target.news.find(p => p.id === existing.id).sameDayEvidence.blocking.some(b => b.id === uncertain.id));
  assert.notDeepEqual(target.rows, before.assets.find(a => a.code === code).rows);
  for (const asset of after.assets.filter(a => a.code !== code))
    assert.deepEqual(asset.rows, before.assets.find(a => a.code === asset.code).rows);
});

test('primary-body evidence changes invalidate the information digest; a fetch timestamp alone does not', () => {
  const event = companyEvent({ targetDate: '2026-10-01', verified: false });
  const unverified = { ...fixture, events: [...fixture.events, event] };
  const verified = structuredClone(unverified);
  verified.events.at(-1).sources[0].sourceBodyRead = true;
  verified.events.at(-1).sources[0].primaryPublisherVerified = true;
  assert.notEqual(sourceDataDigest(unverified, fixture.origin, cutoff), sourceDataDigest(verified, fixture.origin, cutoff));
  const refetched = structuredClone(verified);
  refetched.events.at(-1).sources[0].retrievedAt = '2026-09-26T00:00:00Z';
  assert.equal(sourceDataDigest(verified, fixture.origin, cutoff), sourceDataDigest(refetched, fixture.origin, cutoff));
});

test('historical confirmed context preserves all 52 price rows and honest reaction metadata', () => {
  const before = baseline(), code = fixture.assets[0].code;
  const macroProfile = before.assets.find(asset => asset.code === code).news.find(profile => profile.used && profile.samples.length >= 2);
  assert.ok(macroProfile, 'Require actual retained macro reactions to exercise historical overlap policy');
  const sampleDate = macroProfile.samples.at(-1).date;
  const context = companyEvent({ targetDate: sampleDate, id: 'TEST:v7:historical-confirmed-context' });
  const after = forecast({ ...fixture, events: [...fixture.events, context] }, options);
  for (const asset of after.assets)
    assert.deepEqual(asset.rows, before.assets.find(previous => previous.code === asset.code).rows);
  const retained = after.assets.find(asset => asset.code === code).news.find(profile => profile.id === macroProfile.id);
  assert.deepEqual(retained.samples, macroProfile.samples);
  assert.ok(retained.samples.some(sample => sample.date === sampleDate));
  for (const sample of retained.samples) {
    const sourceEvent = fixture.events.find(event => event.id === sample.id);
    assert.ok(sourceEvent);
    assert.equal(sample.code, code);
    assert.equal(sample.kind, macroProfile.kind);
    assert.equal(sample.availableAt, sourceEvent.availableAt);
    assert.equal(sample.baselineContinuous, true);
    assert.equal(sample.baselineSessions, 20);
    assert.equal(sample.priceVintageVerified, false);
    assert.equal(sample.corporateActionsChecked, false);
    const price = fixture.assets[0].prices.find(row => row.date === sample.date);
    assert.equal(sample.responseAvailableAt, price?.observedAt ?? price?.retrievedAt ?? null);
  }
});

test('nonmatching historical event phase cannot enter a same-company same-kind reaction distribution', () => {
  const asset = fixture.assets[0];
  const macroProfile = baseline().assets.find(a => a.code === asset.code).news.find(profile => profile.used && profile.samples.length >= 2);
  assert.ok(macroProfile);
  const [matchingDate, differentDate] = macroProfile.samples.slice(-2).map(sample => sample.date);
  const future = { ...companyEvent({ kind: 'COMPANY_EARNINGS', targetDate: '2026-10-01' }), phaseId: 'earnings_release' };
  const matching = { ...future, id: 'TEST:v7:matching-phase', announcementDate: matchingDate,
    targetDate: matchingDate, availableAt: matchingDate + 'T00:00:00Z' };
  const different = { ...future, id: 'TEST:v7:different-phase', announcementDate: differentDate,
    targetDate: differentDate, availableAt: differentDate + 'T00:00:00Z', phaseId: 'conference_call' };
  const result = reactionSample(asset, future, [different, matching], fixture.calendar.sessions, fixture.origin,
    { cutoff, assets: fixture.assets, sessions: fixture.calendar.sessions });
  assert.deepEqual(result.samples.map(sample => sample.id), [matching.id]);
  assert.equal(result.samples[0].code, asset.code);
  assert.equal(result.samples[0].kind, future.kind);
  assert.equal(result.samples[0].priceVintageVerified, false);
  assert.equal(result.samples[0].baselineSessions, 20);
});
