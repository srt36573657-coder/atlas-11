import test from 'node:test';
import assert from 'node:assert/strict';
import {pricePanel, examplesFor, fitFactorModel, validateFactorRecords} from '../../lib/factor36.mjs';
import {externalDesign} from '../../lib/factor36-input.mjs';
import {simulateJointFactor36} from '../../lib/factor36-simulation.mjs';
import {rollingInput} from '../../lib/rolling-forecast.mjs';
import {simulateAtlas11, chooseDirection, directionOf, SIMULATION_POLICY} from '../../lib/atlas11/simulate.mjs';
import {realInputs, ISSUED} from './helpers.mjs';

async function fitted(paths) {
  const {input: source, calendar} = await realInputs();
  const {input, futureDates} = rollingInput({input: source}, {calendar, issuedAt: ISSUED});
  const records = validateFactorRecords({schema: 'atlas-factor36-records-1', records: []}, {codes: input.assets.map(a => a.code), cutoff: ISSUED});
  const panel = pricePanel(input), models = [], external = [];
  for (let i = 0; i < input.assets.length; i++) { const design = externalDesign(records, input.assets[i], panel, examplesFor(panel, i), ISSUED); const m = fitFactorModel(design.rows, {featureFactors: design.featureFactors}); assert.equal(m.status, 'research_estimate'); external.push(design); models.push(m); }
  return {input, futureDates, panel, models, external, paths};
}

test('새 모의 계산은 운영 엔진 A와 수치가 같다 (같은 시드 · 52종목 · 20거래일 · p10/p50/p90/mean/방향확률)', async () => {
  const f = await fitted(200);
  const old = simulateJointFactor36(f.models, f.panel, f.input.assets, f.futureDates, {paths: 200, seed: 20260917, external: f.external});
  const nw = simulateAtlas11(f.models, f.panel, f.input.assets, f.futureDates, {paths: 200, seed: 20260917, external: f.external});
  let compared = 0;
  for (let i = 0; i < 52; i++) for (let h = 0; h < 20; h++) {
    for (const k of ['p10', 'p50', 'p90', 'mean']) { assert.equal(nw.rows[i][h][k], old.rows[i][h][k]); compared++; }
    assert.deepEqual(nw.rows[i][h].wave.horizon.probabilities, old.rows[i][h].wave.horizon.probabilities);
    assert.equal(nw.rows[i][h].direction.cumulative.selected, old.rows[i][h].wave.horizon.selected);
  }
  assert.equal(compared, 4160);
  assert.equal(nw.audit.deletedForLoss, 0); assert.equal(nw.audit.invalidPaths, 0);
});

test('분위수 순서 · 확률 합 1 · 최댓값 선택 · 손실 경로 보존 · 시나리오 21점', async () => {
  const f = await fitted(150);
  const r = simulateAtlas11(f.models, f.panel, f.input.assets, f.futureDates, {paths: 150, seed: 7, external: f.external});
  for (let i = 0; i < 52; i++) {
    assert.equal(r.scenarios[i].prices.length, 20); assert.ok(r.scenarios[i].prices.every(v => Number.isFinite(v) && v > 0));
    assert.ok(r.audit.lossPathsRetained[i] >= 0 && r.audit.lossPathsRetained[i] <= 150);
    for (const row of r.rows[i]) {
      assert.ok(row.p05 <= row.p10 && row.p10 <= row.p25 && row.p25 <= row.p50 && row.p50 <= row.p75 && row.p75 <= row.p90 && row.p90 <= row.p95);
      for (const d of [row.direction.daily, row.direction.cumulative]) { const p = d.probabilities; assert.ok(Math.abs(p.up + p.flat + p.down - 1) < 1e-12); assert.ok(p[d.selected] >= Math.max(p.up, p.flat, p.down)); assert.equal(d.delta, 0.001); assert.equal(d.probabilityKind, 'model_frequency_uncalibrated'); }
    }
  }
});

test('재현성: 같은 시드는 같은 결과, 다른 시드는 다른 결과', async () => {
  const f = await fitted(120);
  const a = simulateAtlas11(f.models, f.panel, f.input.assets, f.futureDates, {paths: 120, seed: 1, external: f.external});
  const b = simulateAtlas11(f.models, f.panel, f.input.assets, f.futureDates, {paths: 120, seed: 1, external: f.external});
  const c = simulateAtlas11(f.models, f.panel, f.input.assets, f.futureDates, {paths: 120, seed: 2, external: f.external});
  assert.deepEqual(a.rows[0].map(r => r.p50), b.rows[0].map(r => r.p50));
  assert.deepEqual(a.scenarios[0].prices, b.scenarios[0].prices);
  assert.notDeepEqual(a.rows[0].map(r => r.p50), c.rows[0].map(r => r.p50));
});

test('방향 선택 규칙: 동률은 flat→up→down 순, 근소 차이 표시, 표준오차', () => {
  const tie = chooseDirection({up: 50, flat: 50, down: 0}, 100);
  assert.equal(tie.selected, 'flat'); assert.equal(tie.exactTie, true); assert.equal(tie.closeCall, true);
  const t2 = chooseDirection({up: 45, flat: 10, down: 45}, 100); assert.equal(t2.selected, 'up'); assert.equal(t2.runnerUp, 'down');
  const clear = chooseDirection({up: 70, flat: 5, down: 25}, 100); assert.equal(clear.selected, 'up'); assert.equal(clear.closeCall, false); assert.ok(Math.abs(clear.monteCarloSE - Math.sqrt(.7 * .3 / 100)) < 1e-12);
  assert.throws(() => chooseDirection({up: 50, flat: 10, down: 45}, 100), /CHOICE_COUNTS/);
  assert.equal(directionOf(0.0005), 'flat'); assert.equal(directionOf(0.002), 'up'); assert.equal(directionOf(-0.002), 'down');
  assert.equal(SIMULATION_POLICY.tieRule, 'flat_then_up_then_down');
});
