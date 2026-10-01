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

test('내일 하루만(rngStepsPerPath 20 · 걸음 1): 내일 행이 20거래일 계산 1일째 행과 모든 숫자가 같다 · 시나리오 꺼 둠 · 기본값은 옛 호출 그대로', async () => {
  const f = await fitted(400);
  const twenty = simulateAtlas11(f.models, f.panel, f.input.assets, f.futureDates, {paths: 400, seed: 20260917, external: f.external});
  const one = simulateAtlas11(f.models, f.panel, f.input.assets, f.futureDates.slice(0, 1), {paths: 400, seed: 20260917, external: f.external, rngStepsPerPath: 20});
  for (let i = 0; i < 52; i++) {
    assert.equal(one.rows[i].length, 1); assert.equal(one.scenarios[i], null, '여러 날 경로(대표 시나리오)는 계산하지 않는다');
    const a = one.rows[i][0], b = twenty.rows[i][0];
    for (const k of ['p05', 'p10', 'p25', 'p50', 'p75', 'p90', 'p95', 'mean', 'return', 'lossPathShare']) assert.equal(a[k], b[k], `${i} ${k}`);
    assert.deepStrictEqual(a, b, '행 전체(방향 확률·선택·하루 움직임·요인 기여)가 같다');
  }
  assert.equal(one.audit.computedSteps, 1); assert.equal(one.audit.rngStepsPerPath, 20); assert.equal(one.audit.skippedDrawsPerPath, 19); assert.equal(twenty.audit.computedSteps, undefined, '옛 호출의 감사 기록은 그대로');
  // 버리는 난수를 건너뛰지 않으면(경로마다 1개) 다른 경로가 된다 — 순서를 지키는 것이 같은 숫자의 조건
  const naive = simulateAtlas11(f.models, f.panel, f.input.assets, f.futureDates.slice(0, 1), {paths: 400, seed: 20260917, external: f.external});
  assert.notDeepEqual(naive.rows.map(r => r[0].p50), twenty.rows.map(r => r[0].p50));
  assert.throws(() => simulateAtlas11(f.models, f.panel, f.input.assets, f.futureDates, {paths: 400, external: f.external, rngStepsPerPath: 5}), /JOINT_RNG_STEPS/);
});
