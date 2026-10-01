/**
 * ⑤ 시험 사본 — 잔차 표의 중심만 바꾼 모의 계산. 운영 lib/atlas11/simulate.mjs · lib/factor36-simulation.mjs 는 고치지 않는다.
 *   center = 'mean'      : 운영과 같음(평균을 빼고 표준편차로 나눔 · simulate.mjs:52) — 사본 검증용, 운영 결과와 한 자리도 달라선 안 된다
 *   center = 'median'    : 변형 A — 중앙값을 뺌(척도는 운영과 같은 평균 기준 표준편차)
 *   center = 'symmetric' : 변형 B — 운영 표준화 잔차 z 와 −z 를 모두 넣은 2K 표(52종목이 같은 날짜·같은 부호)
 * 그 밖의 식·난수 순서·통계는 원본 줄을 그대로 옮겼다.
 */
import {mean, features, components, volatilityNext, quantile, rng, forecastChoice, direction} from '../../../../lib/factor36.mjs';
import {SIMULATION_POLICY, directionOf, chooseDirection} from '../../../../lib/atlas11/simulate.mjs';

/** 공유 날짜 잔차 표를 만든다(운영 52번째 줄과 같은 자리) */
export function shockTable(models, center = 'mean') {
  const sharedDates = models[0].shockDates.filter(d => models.every(m => m.shockDates.includes(d)));
  const standardization = [];
  const table = models.map(m => {
    const idx = new Map(m.shockDates.map((d, i) => [d, i])), raw = sharedDates.map(d => m.shocks[idx.get(d)]), c = mean(raw), scale = Math.sqrt(mean(raw.map(z => (z - c) ** 2)));
    if (center === 'mean') { standardization.push({centerRemoved: c, scale: scale || 1, zeroResidualVariance: scale === 0}); return raw.map(z => (z - c) / (scale || 1)); }
    if (center === 'median') { const med = quantile([...raw].sort((a, b) => a - b), 0.5); standardization.push({centerRemoved: med, meanWouldBe: c, scale: scale || 1}); return raw.map(z => (z - med) / (scale || 1)); }
    if (center === 'symmetric') { const z = raw.map(v => (v - c) / (scale || 1)); standardization.push({centerRemoved: c, scale: scale || 1, symmetric: true}); return [...z, ...z.map(v => -v)]; }
    throw Error('CENTER_KIND');
  });
  const pickDates = center === 'symmetric' ? [...sharedDates, ...sharedDates] : sharedDates;
  return {sharedDates, pickDates, table, standardization};
}

/** 1일째 평균(μ)과 분산(h): 운영 53~57·61~67줄과 같은 계산 — 모의 계산 없이 잔차 표로 직접 셀 때 쓴다 */
export function dayOneState(models, panel, assets, external = []) {
  const baseHistory = panel.returns.map(r => r.slice(-60)), basket = [...panel.basket.slice(-5)], breadth = panel.breadth.at(-1);
  const h = models.map((m, i) => { let v = m.volatility.last; for (let j = panel.dates.indexOf(m.trainedThrough) + 1; j < panel.dates.length; j++) { const x = features(panel.returns[i].slice(Math.max(0, j - 60), j), panel.breadth[j - 1], panel.basket.slice(Math.max(0, j - 5), j)); if (!x || !Number.isFinite(panel.returns[i][j])) throw Error('RECENT_STATE_INPUT_GAP'); const extra = (external[i]?.selected ?? []).map(s => s.byTargetDate[panel.dates[j]]); const err = panel.returns[i][j] - components(m.regression, [...x, ...extra]).total; v = volatilityNext(m.volatility, v, err); } return v; });
  const x = models.map((m, i) => features(baseHistory[i], breadth, basket));
  const mu = models.map((m, i) => components(m.regression, x[i]));
  return {h, x, mu: mu.map(c => c.total), components: mu};
}

/** 잔차 표로 1일 방향 확률을 정확히 센다(모의 계산 없음) */
export function exactDayOne(mu, h, z, delta = SIMULATION_POLICY.delta) {
  const c = {up: 0, flat: 0, down: 0};
  for (const v of z) c[directionOf(Math.expm1(mu + Math.sqrt(h) * v), delta)]++;
  return {counts: c, n: z.length, probabilities: {up: c.up / z.length, flat: c.flat / z.length, down: c.down / z.length}};
}

/**
 * lib/atlas11/simulate.mjs simulateAtlas11 의 1일째 계산 사본. 1일째 값은 출발 상태(실제 가격으로 정해진 μ·h)와 그 경로의 첫 뽑기로만 정해지고
 * 2~20일 계산은 1일째에 닿지 않으므로, 난수는 경로마다 H 개를 운영과 같은 순서로 소비하되 1일째만 센다.
 * 식은 운영 64~67·103줄과 같다: r = c.total + √h·z[pick] · 방향 = expm1(r) 가 ±δ 밖인지. 평균 중심이면 발행본 1일 확률과 한 자리도 같아야 한다(검증).
 */
export function simulateAtlas11DayOne(models, panel, assets, dates, {paths = 20000, seed = 20260917, external = [], center = 'mean', policy = SIMULATION_POLICY} = {}) {
  if (!Number.isInteger(paths) || paths < 100 || paths > 100000 || models.length !== assets.length || !assets.length || models.some(m => m.status !== 'research_estimate') || dates.some((d, i) => d <= panel.dates.at(-1) || i && d <= dates[i - 1]) || panel.returns.length !== assets.length) throw Error('JOINT_CONTRACT');
  const n = assets.length, H = dates.length;
  const {pickDates, table: shocks, standardization} = shockTable(models, center);
  if (pickDates.length < 60) throw Error('JOINT_HISTORY_SHORT');
  const random = rng(seed);
  const baseHistory = panel.returns.map(r => r.slice(-60)), basket = [...panel.basket.slice(-5)], breadth = panel.breadth.at(-1);
  const {h: initVariance} = dayOneState(models, panel, assets, external);
  const c0 = models.map((m, i) => components(m.regression, [...features(baseHistory[i], breadth, basket), ...(external[i]?.selected ?? []).map(s => s.current.value)]));
  if ((external ?? []).some(e => (e?.selected ?? []).some(s => s.current.scenarioMode !== 'carry'))) throw Error('DAY_ONE_COPY_CARRY_ONLY');
  const daily = assets.map(() => ({up: 0, flat: 0, down: 0})), increments = assets.map(() => new Float64Array(paths));
  for (let b = 0; b < paths; b++) {
    let pick = -1;
    for (let d = 0; d < H; d++) { const u = random(); if (d === 0) pick = Math.floor(u * pickDates.length); }
    for (let i = 0; i < n; i++) { const shock = Math.sqrt(initVariance[i]) * shocks[i][pick], r = c0[i].total + shock; daily[i][directionOf(Math.expm1(r), policy.delta)]++; increments[i][b] = r; }
  }
  return {center, rows: daily.map((c, i) => ({direction: chooseDirection(c, paths, policy), counts: c, meanLogReturn: mean(Array.from(increments[i])), meanLogReturnSorted: mean(Array.from(Float64Array.from(increments[i]).sort()))})), standardization, pickCount: pickDates.length, paths, seed};
}

/** lib/factor36-simulation.mjs simulateJointFactor36 의 사본(후향 보조용 · center 만 다름) */
export function simulateJointVariant(models, panel, assets, dates, {paths = 20000, seed = 20260917, external = [], center = 'mean'} = {}) {
  if (!Number.isInteger(paths) || paths < 100 || paths > 100000 || models.length !== assets.length || !assets.length || models.some(m => m.status !== 'research_estimate') || dates.some((d, i) => d <= panel.dates.at(-1) || i && d <= dates[i - 1]) || panel.returns.length !== assets.length) throw Error('JOINT_CONTRACT');
  if (models.some(m => !panel.dates.includes(m.trainedThrough) || m.shockDates.length !== m.shocks.length || new Set(m.shockDates).size !== m.shockDates.length || m.shocks.some(x => !Number.isFinite(x)))) throw Error('JOINT_HISTORY_CONTRACT');
  const n = assets.length, H = dates.length, cols = assets.map(() => dates.map(() => new Float64Array(paths))), increments = assets.map(() => dates.map(() => new Float64Array(paths)));
  const {pickDates, table: shocks} = shockTable(models, center); if (pickDates.length < 60) throw Error('JOINT_HISTORY_SHORT');
  const random = rng(seed), originPrices = assets.map(a => a.prices.find(p => p.date === panel.dates.at(-1))?.close); if (originPrices.some(x => !Number.isFinite(x) || x <= 0)) throw Error('ORIGIN_PRICE');
  const baseHistory = panel.returns.map(r => r.slice(-60)); if (baseHistory.some(r => r.length !== 60 || r.some(x => !Number.isFinite(x)))) throw Error('RECENT_PRICE_GAP');
  const {h: initVariance} = dayOneState(models, panel, assets, external);
  for (let b = 0; b < paths; b++) {
    const history = baseHistory.map(r => [...r]), basket = [...panel.basket.slice(-5)], logp = originPrices.map(Math.log), varState = [...initVariance]; let breadth = panel.breadth.at(-1);
    for (let d = 0; d < H; d++) {
      const pick = Math.floor(random() * pickDates.length), ret = [];
      for (let i = 0; i < n; i++) {
        const extras = (external[i]?.selected ?? []).map(s => s.current.scenarioMode === 'carry' ? s.current.value : s.byTargetDate[pickDates[pick]]);
        const x = [...features(history[i], breadth, basket), ...extras], c = components(models[i].regression, x), shock = Math.sqrt(varState[i]) * shocks[i][pick], r = c.total + shock;
        logp[i] += r; const price = Math.exp(logp[i]); if (!Number.isFinite(price) || price <= 0 || !Number.isFinite(r)) throw Error('NUMERIC_RANGE_EXCEEDED_NO_PATHS_DISCARDED'); cols[i][d][b] = price; increments[i][d][b] = r;
        varState[i] = volatilityNext(models[i].volatility, varState[i], shock); history[i].push(r); if (history[i].length > 60) history[i].shift(); ret.push(r);
      }
      breadth = mean(ret.map(r => r > 0 ? 1 : r < 0 ? -1 : 0)); basket.push(mean(ret)); if (basket.length > 5) basket.shift();
    }
  }
  const rows = assets.map((a, i) => dates.map((date, d) => { const prices = cols[i][d], rs = increments[i][d], daily = {up: 0, flat: 0, down: 0}, horizon = {up: 0, flat: 0, down: 0}; for (let b = 0; b < paths; b++) { daily[direction(Math.expm1(rs[b]))]++; horizon[direction(prices[b] / originPrices[i] - 1)]++; } prices.sort(); return {date, p10: quantile(prices, .1), p50: quantile(prices, .5), p90: quantile(prices, .9), wave: {daily: forecastChoice(daily, paths), horizon: forecastChoice(horizon, paths)}}; }));
  return {rows, audit: {center, pickCount: pickDates.length}};
}
