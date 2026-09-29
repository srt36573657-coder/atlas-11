/**
 * ATLAS 11 · 종목별 20거래일 분포 계산 (운영 모델 A의 수학을 그대로 재현 + 방향 선택·대표 시나리오·분위수 확장)
 *
 * 수학 (변경 없음 — lib/factor36-simulation.mjs 와 같은 난수 순서·같은 식):
 *   r[i,t,m]   = mu_i(x[i,t-1,m]) + sqrt(v[i,t,m]) · z[i,pick(t,m)]
 *   P[i,D+h,m] = P_actual[i,D] · exp( Σ_{k=1..h} r[i,D+k,m] )
 *   pick(t,m)  : 모든 종목이 같은 과거 잔차 날짜를 뽑는다 (시장 동조 보존)
 *   v[i,t+1,m] = omega + a·shock² + b·v[i,t,m]   (GARCH(1,1), 학습 구간에서 적합)
 *
 * 새로 붙은 것 (모형 정확도 개선이 아니라 표현·선택 규칙):
 *   - 방향 확률 p_up/p_flat/p_down 는 delta(보합 경계) 로 계산하고, 동률 규칙·근소 차이(closeCall)·몬테카를로 표준오차를 함께 기록한다
 *   - 분위수 p05/p10/p25/p50/p75/p90/p95 와 평균, 손실 경로 비율(P < 출발가)을 보존한다 (경로 삭제 없음)
 *   - 대표 시나리오: 표준화 누적 로그수익률 경로의 근사 medoid 에 가장 가까운 실제 모의 경로 하나 (요란한 경로 선택 금지)
 */
import {mean, features, components, volatilityNext, quantile, rng} from '../factor36.mjs';

export const SIMULATION_POLICY = Object.freeze({
  id: 'atlas11-simulate-1',
  delta: 0.001,                       // 보합 경계 ±0.1% (기존 flatRate 유지 · 실험 전 고정)
  tieRule: 'flat_then_up_then_down',  // 확률이 완전히 같으면 이 순서로 결정
  closeCallGap: 0.05,                 // 1·2위 확률 차이가 5%p 미만이면 「확률 비슷함」 표시
  scenario: Object.freeze({method: 'approximate_medoid', distance: 'euclidean_on_horizon_standardized_cumulative_log_return', candidatePaths: 256, referencePaths: 512, referenceSelection: 'fixed_stride_over_all_paths'}),
  centralStatistic: 'p50_of_simulated_prices',
  intervalNominal: 0.8,
});

export function directionOf(returnValue, delta = SIMULATION_POLICY.delta) {
  return returnValue > delta ? 'up' : returnValue < -delta ? 'down' : 'flat';
}

/** 확률 최댓값 선택 + 동률 규칙 + 근소 차이 표시 + 표준오차. 확률 합은 정확히 1이어야 한다. */
export function chooseDirection(counts, n, policy = SIMULATION_POLICY) {
  if (!Number.isInteger(n) || n <= 0 || ['up', 'flat', 'down'].some(k => !Number.isInteger(counts[k]) || counts[k] < 0) || counts.up + counts.flat + counts.down !== n) throw Error('CHOICE_COUNTS');
  const probabilities = {up: counts.up / n, flat: counts.flat / n, down: counts.down / n};
  const order = ['flat', 'up', 'down'].sort((a, b) => probabilities[b] - probabilities[a]); // stable sort → 동률이면 flat, up, down 순
  const selected = order[0], runnerUp = order[1], gap = probabilities[selected] - probabilities[runnerUp];
  const p = probabilities[selected];
  return {selected, probabilities, modelProbability: p, runnerUp, runnerUpGap: gap, exactTie: gap === 0, closeCall: gap < policy.closeCallGap, monteCarloSE: Math.sqrt(p * (1 - p) / n), delta: policy.delta, tieRule: policy.tieRule, probabilityKind: 'model_frequency_uncalibrated', trustProbability: null};
}

export function simulateAtlas11(models, panel, assets, dates, {paths = 20000, seed = 20260917, external = [], policy = SIMULATION_POLICY} = {}) {
  if (!Number.isInteger(paths) || paths < 100 || paths > 100000 || models.length !== assets.length || !assets.length || models.some(m => m.status !== 'research_estimate') || dates.some((d, i) => d <= panel.dates.at(-1) || i && d <= dates[i - 1]) || panel.returns.length !== assets.length) throw Error('JOINT_CONTRACT');
  if (models.some(m => !panel.dates.includes(m.trainedThrough) || m.shockDates.length !== m.shocks.length || new Set(m.shockDates).size !== m.shockDates.length || m.shocks.some(x => !Number.isFinite(x)))) throw Error('JOINT_HISTORY_CONTRACT');
  const n = assets.length, H = dates.length;
  const cols = assets.map(() => dates.map(() => new Float64Array(paths)));
  const increments = assets.map(() => dates.map(() => new Float64Array(paths)));
  const sumComponents = assets.map((a, i) => dates.map(() => Array(models[i].regression.beta.length).fill(0)));
  const sumMu = assets.map(() => dates.map(() => 0));
  const sharedDates = models[0].shockDates.filter(d => models.every(m => m.shockDates.includes(d)));
  if (sharedDates.length < 60) throw Error('JOINT_HISTORY_SHORT');
  const shockStandardization = [];
  const shocks = models.map(m => { const idx = new Map(m.shockDates.map((d, i) => [d, i])), raw = sharedDates.map(d => m.shocks[idx.get(d)]), center = mean(raw), scale = Math.sqrt(mean(raw.map(z => (z - center) ** 2))); shockStandardization.push({centerRemoved: center, scale: scale || 1, zeroResidualVariance: scale === 0}); return raw.map(z => (z - center) / (scale || 1)); });
  const random = rng(seed), originPrices = assets.map(a => a.prices.find(p => p.date === panel.dates.at(-1))?.close);
  if (originPrices.some(x => !Number.isFinite(x) || x <= 0)) throw Error('ORIGIN_PRICE');
  const baseHistory = panel.returns.map(r => r.slice(-60));
  if (baseHistory.some(r => r.length !== 60 || r.some(x => !Number.isFinite(x)))) throw Error('RECENT_PRICE_GAP');
  const initVariance = models.map((m, i) => { let h = m.volatility.last; for (let j = panel.dates.indexOf(m.trainedThrough) + 1; j < panel.dates.length; j++) { const x = features(panel.returns[i].slice(Math.max(0, j - 60), j), panel.breadth[j - 1], panel.basket.slice(Math.max(0, j - 5), j)); if (!x || !Number.isFinite(panel.returns[i][j])) throw Error('RECENT_STATE_INPUT_GAP'); const extra = (external[i]?.selected ?? []).map(s => s.byTargetDate[panel.dates[j]]); if (extra.some(x => !Number.isFinite(x))) throw Error('EXTERNAL_RECENT_INPUT_MISSING'); const err = panel.returns[i][j] - components(m.regression, [...x, ...extra]).total; h = volatilityNext(m.volatility, h, err); } return h; });
  let minReturn = Infinity, maxReturn = -Infinity;
  const lossPaths = Array(n).fill(0);
  for (let b = 0; b < paths; b++) {
    const history = baseHistory.map(r => [...r]), basket = [...panel.basket.slice(-5)], logp = originPrices.map(Math.log), varState = [...initVariance];
    let breadth = panel.breadth.at(-1);
    for (let d = 0; d < H; d++) {
      const pick = Math.floor(random() * sharedDates.length), ret = [];
      for (let i = 0; i < n; i++) {
        const extras = (external[i]?.selected ?? []).map(s => s.current.scenarioMode === 'carry' ? s.current.value : s.byTargetDate[sharedDates[pick]]);
        const x = [...features(history[i], breadth, basket), ...extras], c = components(models[i].regression, x), shock = Math.sqrt(varState[i]) * shocks[i][pick], r = c.total + shock;
        logp[i] += r; const price = Math.exp(logp[i]);
        if (!Number.isFinite(price) || price <= 0 || !Number.isFinite(r)) throw Error('NUMERIC_RANGE_EXCEEDED_NO_PATHS_DISCARDED');
        cols[i][d][b] = price; increments[i][d][b] = r; ret.push(r); sumMu[i][d] += c.total;
        for (let j = 0; j < c.values.length; j++) sumComponents[i][d][j] += c.values[j];
        varState[i] = volatilityNext(models[i].volatility, varState[i], shock);
        history[i].push(r); if (history[i].length > 60) history[i].shift();
        minReturn = Math.min(minReturn, r); maxReturn = Math.max(maxReturn, r);
      }
      breadth = mean(ret.map(r => r > 0 ? 1 : r < 0 ? -1 : 0)); basket.push(mean(ret)); if (basket.length > 5) basket.shift();
    }
    for (let i = 0; i < n; i++) if (logp[i] < Math.log(originPrices[i])) lossPaths[i]++;
  }
  // ---- 통계·방향·시나리오 (경로는 삭제하지 않는다) ----
  const rows = [], scenarios = [];
  for (let i = 0; i < n; i++) {
    const origin = originPrices[i];
    // 대표 시나리오: 정렬 전에 경로 단위 누적 로그수익률을 읽어 둔다
    const cumulative = h => b => Math.log(cols[i][h][b] / origin);
    const sdByHorizon = dates.map((_, h) => { const f = cumulative(h); let s = 0, s2 = 0; for (let b = 0; b < paths; b++) { const v = f(b); s += v; s2 += v * v; } const m = s / paths; return Math.sqrt(Math.max(1e-16, s2 / paths - m * m)); });
    const candidateCount = Math.min(policy.scenario.candidatePaths, paths), referenceCount = Math.min(policy.scenario.referencePaths, paths), stride = Math.max(1, Math.floor(paths / referenceCount));
    const references = Array.from({length: referenceCount}, (_, k) => k * stride).filter(b => b < paths);
    const refVectors = references.map(b => dates.map((_, h) => Math.log(cols[i][h][b] / origin) / sdByHorizon[h]));
    let bestPath = 0, bestDistance = Infinity;
    for (let c = 0; c < candidateCount; c++) {
      const v = dates.map((_, h) => Math.log(cols[i][h][c] / origin) / sdByHorizon[h]);
      let total = 0;
      for (const ref of refVectors) { let s = 0; for (let h = 0; h < H; h++) { const t = v[h] - ref[h]; s += t * t; } total += Math.sqrt(s); if (total >= bestDistance) break; }
      if (total < bestDistance) { bestDistance = total; bestPath = c; }
    }
    const scenarioPrices = dates.map((_, h) => cols[i][h][bestPath]), scenarioReturns = dates.map((_, h) => increments[i][h][bestPath]);
    scenarios.push({method: policy.scenario.method, distance: policy.scenario.distance, pathIndex: bestPath, candidatePaths: candidateCount, referencePaths: references.length, meanDistanceToReferences: bestDistance / references.length, prices: scenarioPrices, dailyLogReturns: scenarioReturns, note: '분포의 중심에 가까운 실제 모의 경로 하나 · 경로 전체가 일어날 확률은 방향 확률과 다르며 표시하지 않는다'});
    // 날짜별 통계
    rows.push(dates.map((date, d) => {
      const prices = cols[i][d], rs = increments[i][d], daily = {up: 0, flat: 0, down: 0}, horizon = {up: 0, flat: 0, down: 0};
      let total = 0, below = 0;
      for (let b = 0; b < paths; b++) { daily[directionOf(Math.expm1(rs[b]), policy.delta)]++; horizon[directionOf(prices[b] / origin - 1, policy.delta)]++; total += (prices[b] - total) / (b + 1); if (prices[b] < origin) below++; }
      const sortedPrices = Float64Array.from(prices).sort(), sortedR = Float64Array.from(rs).sort();
      const q = p => quantile(sortedPrices, p);
      const cs = {}; models[i].featureFactors.forEach((f, j) => cs[f] = (cs[f] ?? 0) + sumComponents[i][d][j] / paths);
      const den = Object.values(cs).reduce((s, v) => s + Math.abs(v), 0), p50 = q(.5);
      return {date, p05: q(.05), p10: q(.1), p25: q(.25), p50, p75: q(.75), p90: q(.9), p95: q(.95), mean: total, return: p50 / origin - 1, lossPathShare: below / paths, anchor: false, eventIds: [], numericStatus: 'finite', probabilityStatus: 'model_frequency_uncalibrated',
        direction: {daily: chooseDirection(daily, paths, policy), cumulative: chooseDirection(horizon, paths, policy)},
        dailyMovement: {meanLogReturn: mean(Array.from(rs)), returnP10: Math.expm1(quantile(sortedR, .1)), returnP50: Math.expm1(quantile(sortedR, .5)), returnP90: Math.expm1(quantile(sortedR, .9)), upModelShare: daily.up / paths, downModelShare: daily.down / paths},
        factor36: {contributions: cs, shares: Object.fromEntries(Object.entries(cs).map(([k, v]) => [k, den ? Math.abs(v) / den * 100 : null])), intercept: models[i].regression.intercept, meanLogReturn: sumMu[i][d] / paths, newsMeanLogReturn: null, fomoMeanLogReturn: cs.FOMO ?? null, causal: false},
        // 기존 화면·채점기와의 호환 (wave.horizon 은 누적 방향)
        wave: {daily: {selected: chooseDirection(daily, paths, policy).selected, probabilities: {up: daily.up / paths, flat: daily.flat / paths, down: daily.down / paths}}, horizon: {selected: chooseDirection(horizon, paths, policy).selected, probabilities: {up: horizon.up / paths, flat: horizon.flat / paths, down: horizon.down / paths}}}};
    }));
  }
  return {rows, scenarios, audit: {policy: SIMULATION_POLICY.id, jointPaths: paths, assetPaths: paths * n, sharedResidualDates: sharedDates.length, shockStandardization, dependence: 'same_historical_residual_date_for_all_52', minLogReturn: minReturn, maxLogReturn: maxReturn, lossPathsRetained: lossPaths, deletedForLoss: 0, invalidPaths: 0, independentAccuracyTests: 0, trustProbability: null, seed, delta: policy.delta, tieRule: policy.tieRule}};
}
