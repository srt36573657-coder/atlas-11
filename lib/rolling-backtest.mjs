import { pricePanel, examplesFor, fitFactorModel, mean } from './factor36.mjs';
import { simulateJointFactor36 } from './factor36-simulation.mjs';

// Fixed before evaluation. This is a retrospective algorithm audit, not a live or
// verified point-in-time data experiment. A already uses actual-price anchors.
export const ROLLING_AB_PROTOCOL = Object.freeze({
  schema: 'atlas-rolling-ab-protocol-1',
  originDays: 120, blocks: 6, blockDays: 20, horizon: 20,
  paths: 512, seed: 20260917, topK: 5,
  modelA: 'existing_factor36_actual_anchor_and_observed_state',
  modelB: 'rolling_wrapper_same_factor36_actual_anchor_and_observed_state',
  training: 'fit_and_select_before_each_block_then_freeze_coefficients_within_20_origins',
  state: 'recompute_features_and_variance_from_observed_prices_at_each_origin',
  primaryError: 'mean_over_origin_dates_of_mean_over_same_stocks_and_20_horizons(abs(prediction-actual)/actual*100)',
  rankHits: 'sum_over_origin_dates_of_top5_predicted_20_session_return_intersection_top5_actual_20_session_return',
  rankTies: 'return_descending_then_stock_code_ascending',
  adoption: 'B_error_strictly_less_than_A_error_AND_B_rank_hits_at_least_A_rank_hits',
  equivalence: 'A_and_B_have_identical_math_inputs_and_random_stream; one_shared_calculation_is_paired_not_two_independent_experiments',
  priceVintageVerified: false, liveAdvantageProven: false, trustProbability: null,
});

const finite = Number.isFinite;
export function rollingBacktestPlan(input, protocol = ROLLING_AB_PROTOCOL) {
  const panel = pricePanel(input), n = panel.dates.length;
  if (protocol.originDays !== protocol.blocks * protocol.blockDays || protocol.horizon < 1) throw Error('AB_PROTOCOL_DIMENSIONS');
  if (n < protocol.originDays + protocol.horizon + 321) throw Error('AB_HISTORY_TOO_SHORT');
  const start = n - protocol.horizon - protocol.originDays;
  const origins = Array.from({ length: protocol.originDays }, (_, k) => ({
    date: panel.dates[start + k], panelIndex: start + k,
    block: Math.floor(k / protocol.blockDays) + 1,
    targets: panel.dates.slice(start + k + 1, start + k + protocol.horizon + 1),
  }));
  if (origins.some(o => o.targets.length !== protocol.horizon || o.targets[0] <= o.date)) throw Error('AB_TARGET_CALENDAR');
  return { panel, origins };
}

export function truncateObservedPanel(panel, index) {
  if (!Number.isInteger(index) || index < 60 || index >= panel.dates.length) throw Error('AB_PANEL_INDEX');
  return { dates: panel.dates.slice(0, index + 1), returns: panel.returns.map(r => r.slice(0, index + 1)), breadth: panel.breadth.slice(0, index + 1), basket: panel.basket.slice(0, index + 1) };
}

export function pairedEquivalentForecast(models, observedPanel, assets, targets, options = {}) {
  const origin = observedPanel.dates.at(-1);
  if (models.some(m => m.trainedThrough > origin || m.shockDates.some(d => d > origin))) throw Error('AB_FUTURE_TRAINING');
  if (targets.some(d => d <= origin)) throw Error('AB_FUTURE_TARGET_REQUIRED');
  const simulation = simulateJointFactor36(models, observedPanel, assets, targets, options);
  // Neither branch takes an earlier forecast as input. Immutable copies prevent
  // later display changes from being mistaken for different forecasts.
  return { A: simulation.rows, B: structuredClone(simulation.rows), audit: simulation.audit, equivalence: true };
}

export function rankingHits(predicted, actual, topK = 5) {
  const keys = Object.keys(predicted).sort();
  if (!keys.length || topK < 1 || keys.length < topK || keys.some(k => !finite(predicted[k]) || !finite(actual[k])) || Object.keys(actual).length !== keys.length) throw Error('AB_RANKING_INPUT');
  const rank = values => keys.slice().sort((a, b) => values[b] - values[a] || a.localeCompare(b)).slice(0, topK);
  const predictedTop = rank(predicted), actualTop = rank(actual), actualSet = new Set(actualTop);
  return { hits: predictedTop.filter(c => actualSet.has(c)).length, predictedTop, actualTop };
}

export function adoptionDecision(A, B, { complete = true } = {}) {
  if (!complete || ![A?.meanErrorPct, B?.meanErrorPct, A?.rankHits, B?.rankHits].every(finite)) return { selected: 'A', adoptedB: false, reason: 'incomplete_comparison', liveAdvantageProven: false };
  const improved = B.meanErrorPct < A.meanErrorPct && B.rankHits >= A.rankHits;
  return { selected: improved ? 'B' : 'A', adoptedB: improved, reason: improved ? 'both_predeclared_conditions_met' : B.meanErrorPct === A.meanErrorPct && B.rankHits === A.rankHits ? 'mathematically_identical_no_improvement' : 'both_predeclared_conditions_not_met', liveAdvantageProven: false };
}

function pearson(x, y) {
  if (x.length < 3 || x.length !== y.length) return null;
  const mx = mean(x), my = mean(y), vx = x.reduce((s, v) => s + (v - mx) ** 2, 0), vy = y.reduce((s, v) => s + (v - my) ** 2, 0);
  return vx && vy ? x.reduce((s, v, i) => s + (v - mx) * (y[i] - my), 0) / Math.sqrt(vx * vy) : null;
}

export async function runRollingBacktest(input, { protocol = ROLLING_AB_PROTOCOL, onProgress = () => {}, onRows = () => {} } = {}) {
  const { panel, origins } = rollingBacktestPlan(input, protocol), assets = input.assets;
  if (new Set(assets.map(a => a.code)).size !== assets.length) throw Error('AB_DUPLICATE_STOCK');
  const examples = assets.map((a, i) => examplesFor(panel, i)), prices = assets.map(a => new Map(a.prices.map(p => [p.date, p.quality === 'conflict' ? null : p.close])));
  const byDate = [], blocks = [], failures = [], stockState = assets.map(a => ({ code: a.code, name: a.name, rows: 0, sumErrorA: 0, sumErrorB: 0, oneDayErrors: [], observedOriginCloseChecks: 0 }));
  let models = null, totalRows = 0, maxABDifference = 0, extremeLossPathsDeleted = 0;
  for (let k = 0; k < origins.length; k++) {
    const o = origins[k];
    if (k % protocol.blockDays === 0) {
      models = examples.map(rows => fitFactorModel(rows.filter(r => r.date <= o.date)));
      const insufficient = models.flatMap((m, i) => m.status === 'research_estimate' ? [] : [{ code: assets[i].code, reason: m.reason }]);
      blocks.push({ block: o.block, originFirst: o.date, originLast: origins[Math.min(origins.length - 1, k + protocol.blockDays - 1)].date, maximumTrainingDate: models.filter(m => m.trainedThrough).map(m => m.trainedThrough).sort().at(-1) ?? null, eligibleStocks: models.filter(m => m.status === 'research_estimate').length, insufficient, modelSelections: models.map((m, i) => ({ code: assets[i].code, model: m.selected?.id ?? null, trainedThrough: m.trainedThrough ?? null, trainCount: m.trainCount ?? null })) });
      if (insufficient.length) { failures.push({ block: o.block, reason: 'insufficient_training_history', stocks: insufficient }); models = null; }
    }
    if (!models) continue;
    const observed = truncateObservedPanel(panel, o.panelIndex), result = pairedEquivalentForecast(models, observed, assets, o.targets, { paths: protocol.paths, seed: protocol.seed });
    extremeLossPathsDeleted += result.audit.deletedForLoss;
    const rows = [], predictedA = {}, predictedB = {}, actualReturns = {}, horizonErrors = {};
    for (let i = 0; i < assets.length; i++) {
      const anchor = prices[i].get(o.date);
      if (!finite(anchor) || anchor <= 0) throw Error('AB_MISSING_ANCHOR');
      stockState[i].observedOriginCloseChecks++;
      for (let h = 0; h < protocol.horizon; h++) {
        const actual = prices[i].get(o.targets[h]), A = result.A[i][h].p50, B = result.B[i][h].p50;
        if (![actual, A, B].every(finite) || actual <= 0) throw Error('AB_MISSING_TARGET_PRICE');
        const errorA = Math.abs(A - actual) / actual * 100, errorB = Math.abs(B - actual) / actual * 100;
        maxABDifference = Math.max(maxABDifference, Math.abs(A - B));
        rows.push({ origin: o.date, block: o.block, code: assets[i].code, horizon: h + 1, target: o.targets[h], anchor, actual, A, B, errorA, errorB });
        stockState[i].rows++; stockState[i].sumErrorA += errorA; stockState[i].sumErrorB += errorB;
        (horizonErrors[h + 1] ??= []).push(errorA);
        if (h === 0) stockState[i].oneDayErrors.push({ date: o.targets[h], signedErrorPct: (A - actual) / actual * 100 });
        if (h === protocol.horizon - 1) { predictedA[assets[i].code] = A / anchor - 1; predictedB[assets[i].code] = B / anchor - 1; actualReturns[assets[i].code] = actual / anchor - 1; }
      }
    }
    const rankA = rankingHits(predictedA, actualReturns, protocol.topK), rankB = rankingHits(predictedB, actualReturns, protocol.topK);
    byDate.push({ origin: o.date, block: o.block, stocks: assets.length, targets: protocol.horizon, firstTarget: o.targets[0], lastTarget: o.targets.at(-1), meanErrorA: mean(rows.map(r => r.errorA)), meanErrorB: mean(rows.map(r => r.errorB)), horizonErrorPct: Object.fromEntries(Object.entries(horizonErrors).map(([h, values]) => [h, mean(values)])), rankA, rankB });
    totalRows += rows.length; await onRows(rows); await onProgress({ complete: k + 1, total: origins.length, origin: o.date, block: o.block });
  }
  const A = { meanErrorPct: byDate.length ? mean(byDate.map(d => d.meanErrorA)) : null, rankHits: byDate.reduce((s, d) => s + d.rankA.hits, 0) }, B = { meanErrorPct: byDate.length ? mean(byDate.map(d => d.meanErrorB)) : null, rankHits: byDate.reduce((s, d) => s + d.rankB.hits, 0) };
  const byStock = stockState.map(s => ({ code: s.code, name: s.name, rows: s.rows, meanErrorA: s.rows ? s.sumErrorA / s.rows : null, meanErrorB: s.rows ? s.sumErrorB / s.rows : null, observedOriginCloseChecks: s.observedOriginCloseChecks, signedOneDayErrorLag1Correlation: pearson(s.oneDayErrors.slice(0, -1).map(r => r.signedErrorPct), s.oneDayErrors.slice(1).map(r => r.signedErrorPct)), correlationIsCausal: false, predictionAsNextAnchor: false }));
  const complete = byDate.length === protocol.originDays && failures.length === 0;
  return { schema: 'atlas-rolling-ab-result-1', protocol, status: complete ? 'complete_retrospective_diagnostic' : 'partial', A, B, decision: adoptionDecision(A, B, { complete }), originDays: byDate.length, blocks: blocks.length, stocks: assets.length, stockTargetRows: totalRows, rankMaximum: byDate.length * protocol.topK, firstOrigin: origins[0].date, lastOrigin: origins.at(-1).date, lastTarget: origins.at(-1).targets.at(-1), maxABDifference, byDate, byStock, blockDetails: blocks, failures, audit: { futureDatedPriceRowsUsedInFeatures: 0, retrospectivelyRetrievedVintagesUsed: true, futureTargetsUsedInModelSelection: 0, anchorsFromPriorPredictions: 0, extremeLossPathsDeleted, sourcePriceVintageVerified: false, corporationActionsVerified: false, independentTrials: null, overlappingHorizons: true, stockRowsAreIndependentTrials: false, rawSource: 'stored_NAVER_single_provider_retrospective', liveAdvantageProven: false, productionPaths: 20000, diagnosticPaths: protocol.paths, productionPathCountPerformanceValidated: false, marketFactorDataIncluded: ['F11_ATLAS52_proxy', 'F35_own_returns', 'F36_residual_volatility'], externalFactorBacktestQualified: 0 } };
}
