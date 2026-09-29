// Exact conditional moments of the existing empirical independent-increment model.
// This module changes numerical evaluation, not the selected return distribution.
export const NUMERICS_VERSION = 'atlas-news-numerics-7.1.0';

function finiteVector(values, name = 'values') {
  if ((!Array.isArray(values) && !ArrayBuffer.isView(values)) || values.length === 0)
    throw new TypeError(`${name} must be a nonempty numeric array`);
  const result = Array.from(values);
  if (result.some(value => typeof value !== 'number' || !Number.isFinite(value)))
    throw new TypeError(`${name} must contain only finite numbers`);
  return result;
}

// Neumaier compensation also handles an addend larger than the running sum.
export function compensatedSum(values) {
  let sum = 0, correction = 0;
  for (const value of values) {
    if (!Number.isFinite(value)) throw new TypeError('Cannot sum a nonfinite value');
    const next = sum + value;
    if (!Number.isFinite(next)) throw new RangeError('Compensated sum overflow');
    correction += Math.abs(sum) >= Math.abs(value)
      ? (sum - next) + value : (value - next) + sum;
    sum = next;
  }
  const result = sum + correction;
  if (!Number.isFinite(result)) throw new RangeError('Compensated sum overflow');
  return result;
}

export function logSumExp(values) {
  values = finiteVector(values);
  const maximum = values.reduce((a, b) => Math.max(a, b), -Infinity);
  return maximum + Math.log(compensatedSum(values.map(value => Math.exp(value - maximum))));
}

function probabilityWeights(length, weights) {
  if (weights == null) return Array(length).fill(1 / length);
  weights = finiteVector(weights, 'weights');
  if (weights.length !== length || weights.some(weight => weight < 0))
    throw new RangeError('Weights must match values and be nonnegative');
  const maximum = weights.reduce((a, b) => Math.max(a, b), 0);
  if (maximum === 0) throw new RangeError('At least one weight must be positive');
  const scaled = weights.map(weight => weight / maximum);
  const total = compensatedSum(scaled);
  return scaled.map(weight => weight / total);
}

function logarithmOfExpm1(value) {
  if (value === 0) return -Infinity;
  if (value > 50) return value + Math.log1p(-Math.exp(-value));
  return Math.log(Math.expm1(value));
}

function representedExp(logValue, label, flags) {
  if (logValue === -Infinity) return 0;
  const value = Math.exp(logValue);
  if (!Number.isFinite(value) || value === 0) {
    flags.push(`${label}_${value === 0 ? 'underflow' : 'overflow'}`);
    return null;
  }
  return value;
}

function validCalendarDate(value) {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const parsed = Date.parse(`${value}T00:00:00Z`);
  return Number.isFinite(parsed) && new Date(parsed).toISOString().slice(0, 10) === value;
}

/** Uniform empirical support by default. Optional weights must describe that model. */
export function empiricalLogReturnMoments(values, { weights } = {}) {
  values = finiteVector(values);
  const probabilities = probabilityWeights(values.length, weights);
  const active = values.map((value, index) => ({ value, probability: probabilities[index] }))
    .filter(point => point.probability > 0);
  const maximum = active.reduce((a, b) => Math.max(a, b.value), -Infinity);
  const minimum = active.reduce((a, b) => Math.min(a, b.value), Infinity);
  const logMean = compensatedSum(active.map(point => point.value * point.probability));
  const logVariance = compensatedSum(active.map(point => {
    const delta = point.value - logMean;
    return delta * delta * point.probability;
  }));
  const shifted = active.map(point => ({
    value: Math.exp(point.value - maximum), probability: point.probability,
  }));
  const shiftedMean = compensatedSum(shifted.map(point => point.value * point.probability));
  // Center before squaring. E[X²] - E[X]² loses the variance of near-constant X.
  const offsets = active.map(point => ({
    value: Math.expm1(point.value - maximum), probability: point.probability,
  }));
  const offsetMean = compensatedSum(offsets.map(point => point.value * point.probability));
  const shiftedVariance = compensatedSum(offsets.map(point =>
    point.probability * (point.value - offsetMean) ** 2));
  const varianceLogTerms = offsets.filter(point => point.value !== offsetMean)
    .map(point => Math.log(point.probability) + 2 * Math.log(Math.abs(point.value - offsetMean)));
  const logShiftedVariance = shiftedVariance > 0 ? Math.log(shiftedVariance)
    : varianceLogTerms.length ? logSumExp(varianceLogTerms) : -Infinity;
  const logRelativeVariance = logShiftedVariance - 2 * Math.log(shiftedMean);
  // Stable softplus retains tiny variance and avoids overflow for rare, very large tails.
  const logSecondToSquaredMean = logRelativeVariance > 0
    ? logRelativeVariance + Math.log1p(Math.exp(-logRelativeVariance))
    : Math.log1p(Math.exp(logRelativeVariance));
  // expm1/log1p preserves tiny drifts near zero; the shifted formula prevents overflow.
  const nearZero = Math.max(Math.abs(minimum), Math.abs(maximum)) < 0.5;
  const logGrossMean = nearZero
    ? Math.log1p(compensatedSum(active.map(point => point.probability * Math.expm1(point.value))))
    : maximum + Math.log(shiftedMean);
  return {
    count: values.length,
    effectiveSupportSize: 1 / compensatedSum(probabilities.map(weight => weight * weight)),
    logReturnMean: logMean,
    logReturnVariance: logVariance,
    logGrossMean,
    logGrossSecondMoment: 2 * logGrossMean + logSecondToSquaredMean,
    logSecondToSquaredMean,
    minimum, maximum,
    signedTailsRetained: true,
  };
}

/** Exact marginal weights of v6/v7 shared-event-date sampling plus local fallback. */
export function eventSupportWeights(profile) {
  if (!Array.isArray(profile?.samples) || !profile.samples.length || !Array.isArray(profile.sharedDates))
    throw new TypeError('Event sampling requires samples and sharedDates');
  const dates = profile.samples.map(sample => sample.date), shared = new Set(profile.sharedDates);
  if (new Set(dates).size !== dates.length || shared.size !== profile.sharedDates.length)
    throw new RangeError('Event sample and shared dates must each be unique');
  if (dates.some(date => !validCalendarDate(date)) || [...shared].some(date => !validCalendarDate(date)))
    throw new RangeError('Event sample dates must be valid calendar dates');
  const count = dates.length;
  if (shared.size === 0) return Array(count).fill(1 / count);
  const directCount = dates.filter(date => shared.has(date)).length;
  const fallbackMass = (shared.size - directCount) / shared.size;
  return dates.map(date => (shared.has(date) ? 1 / shared.size : 0) + fallbackMass / count);
}

/**
 * daySupports: [{ date: 'YYYY-MM-DD', values: [log-return, ...], weights?: [...] }]
 * Only FUTURE daily supports: the returned first row is the origin/anchor.
 * Independent increments are an explicit assumption of the existing model;
 * correlated stocks on the same day do not invalidate these marginal moments.
 */
export function exactPriceMoments(startPrice, daySupports, {
  paths = 10000, originDate = null, independentIncrements = true,
} = {}) {
  if (!Number.isFinite(startPrice) || startPrice <= 0)
    throw new RangeError('Start price must be positive and finite');
  if (!Array.isArray(daySupports)) throw new TypeError('Daily supports must be an array');
  if (originDate !== null && !validCalendarDate(originDate)) throw new RangeError('Invalid origin calendar date');
  if (!Number.isSafeInteger(paths) || paths < 1) throw new RangeError('Path count must be positive');
  if (independentIncrements !== true)
    throw new RangeError('Dependent increments require a joint distribution, not products of marginal moments');
  const logStart = Math.log(startPrice), rows = [];
  const firstMomentTerms = [], relativeSecondTerms = [], logMeanTerms = [], logVarianceTerms = [];
  let priorDate = originDate;
  const dates = new Set();
  for (let horizon = 0; horizon <= daySupports.length; horizon++) {
    const support = horizon ? daySupports[horizon - 1] : null;
    let increment = null;
    if (horizon && (support === null || typeof support !== 'object'))
      throw new TypeError('Each daily support must be an object with date and values');
    if (support) {
      if (!validCalendarDate(support.date)
        || dates.has(support.date) || (priorDate && support.date <= priorDate))
        throw new RangeError('Daily support dates must be unique valid ISO calendar dates in increasing order');
      dates.add(support.date); priorDate = support.date;
      increment = empiricalLogReturnMoments(support.values, { weights: support.weights });
      firstMomentTerms.push(increment.logGrossMean);
      relativeSecondTerms.push(increment.logSecondToSquaredMean);
      logMeanTerms.push(increment.logReturnMean);
      logVarianceTerms.push(increment.logReturnVariance);
    }
    const logPriceMean = logStart + compensatedSum(firstMomentTerms);
    const logRelativeSecond = compensatedSum(relativeSecondTerms);
    const logVariance = 2 * logPriceMean + logarithmOfExpm1(logRelativeSecond);
    const flags = [];
    const mean = horizon ? representedExp(logPriceMean, 'mean', flags) : startPrice;
    const secondMoment = representedExp(2 * logPriceMean + logRelativeSecond, 'second_moment', flags);
    const variance = logRelativeSecond === 0 ? 0 : representedExp(logVariance, 'variance', flags);
    const standardDeviation = logRelativeSecond === 0 ? 0 : representedExp(logVariance / 2, 'standard_deviation', flags);
    const monteCarloMeanSE = logRelativeSecond === 0 ? 0
      : representedExp((logVariance - Math.log(paths)) / 2, 'mc_mean_se', flags);
    rows.push({
      date: support?.date ?? originDate, horizon,
      mean, secondMoment, variance, standardDeviation,
      expectedLogPrice: logStart + compensatedSum(logMeanTerms),
      logPriceVariance: compensatedSum(logVarianceTerms),
      logPriceMean, logSecondMoment: 2 * logPriceMean + logRelativeSecond,
      logPriceDistributionVariance: logRelativeSecond === 0 ? null : logVariance,
      monteCarloMeanSE,
      meanMonteCarloSE: 0,
      meanMethod: 'analytic_conditional_empirical_moments',
      modelAssumption: 'independent_increments_conditional_on_frozen_inputs',
      pathsForMonteCarloComparison: paths,
      trustProbability: null,
      predictiveSkillVerified: false,
      numericStatus: flags.length ? 'not_fully_representable' : 'finite',
      flags, increment,
    });
  }
  return {
    version: NUMERICS_VERSION, rows,
    status: rows.some(row => row.flags.length) ? 'numeric_range_limit' : 'ok',
    precisionMeaning: 'conditional_model_arithmetic_only_not_prediction_accuracy',
    trustProbability: null,
  };
}

/** Deterministic precision budget for a MONTE CARLO mean, not a market forecast. */
export function requiredPathsForRelativeMeanSE(moment, relativeStandardError) {
  if (!Number.isFinite(relativeStandardError) || relativeStandardError <= 0)
    throw new RangeError('Relative standard error must be positive');
  if (!Number.isFinite(moment.mean) || moment.mean <= 0 || !Number.isFinite(moment.variance) || moment.variance < 0)
    return { paths: null, status: 'numeric_range_limit', trustProbability: null };
  const required = Math.ceil((Math.sqrt(moment.variance) / moment.mean / relativeStandardError) ** 2);
  return {
    paths: Number.isSafeInteger(required) ? Math.max(1, required) : null,
    status: Number.isSafeInteger(required) ? 'model_sampling_error_only' : 'numeric_range_limit',
    trustProbability: null,
  };
}

/** Enumerate the one-step marginal, including nonuniform event/fallback weights.
 * Exact means no Monte Carlo error; floating-point rounding and model error remain.
 */
export function exactOneStepDistribution(startPrice, values, { weights } = {}) {
  if (!Number.isFinite(startPrice) || startPrice <= 0) throw new RangeError('Invalid start price');
  values = finiteVector(values);
  const probabilities = probabilityWeights(values.length, weights);
  const states = values.map((value, i) => {
    // Preserve ordinary arithmetic, but avoid an overflowing/underflowing exp intermediate
    // when the final price is still representable. Never clip the log-return tail.
    const direct = startPrice * Math.exp(value);
    const price = Number.isFinite(direct) && direct > 0 ? direct : Math.exp(Math.log(startPrice) + value);
    return { price, weight: probabilities[i] };
  })
    .filter(s => s.weight > 0).sort((a, b) => a.price - b.price);
  if (states.some(s => !Number.isFinite(s.price) || s.price <= 0)) throw new RangeError('One-step price range limit');
  const cumulative = [];
  let sum = 0, correction = 0;
  for (const s of states) {
    const y = s.weight - correction, next = sum + y;
    correction = (next - sum) - y; sum = next; cumulative.push(sum);
  }
  const quantile = p => states[Math.max(0, cumulative.findIndex(v => v >= p))]?.price;
  // The final cumulative mass can differ from one by machine rounding.
  const q = p => cumulative.at(-1) < p ? states.at(-1).price : quantile(p);
  return { method: 'exact_one_step_empirical_distribution', p10: q(.1), p50: q(.5), p90: q(.9),
    probUp: Math.min(1, Math.max(0, compensatedSum(states.filter(s => s.price > startPrice).map(s => s.weight)))),
    supportSize: states.length, monteCarloError: 0, trustProbability: null };
}

/** Fixed-N DKW-Massart band. No optional stopping or real-market coverage claim.
 * Family-wise protection uses the union bound; stocks/dates need not be independent.
 * Each marginal's simulated paths must be iid under the frozen empirical model.
 * Reference: https://arxiv.org/pdf/2509.11859, sections 3.1 and 3.2.
 */
export function monteCarloPrecision(sorted, { positiveCount, confidence = .95, familySize = 1 } = {}) {
  if ((!Array.isArray(sorted) && !ArrayBuffer.isView(sorted)) || !sorted.length)
    throw new TypeError('A nonempty sorted sample is required');
  for (let i = 0; i < sorted.length; i++) if (!Number.isFinite(sorted[i]) || sorted[i] <= 0 || (i && sorted[i] < sorted[i - 1]))
    throw new RangeError('Prices must be positive, finite and sorted');
  const n = sorted.length;
  if (!Number.isSafeInteger(positiveCount) || positiveCount < 0 || positiveCount > n
    || !Number.isFinite(confidence) || confidence <= 0 || confidence >= 1
    || !Number.isSafeInteger(familySize) || familySize < 1) throw new RangeError('Invalid precision parameters');
  const alpha = 1 - confidence;
  const margin = size => Math.min(1, Math.sqrt((Math.log(2) + Math.log(size) - Math.log(alpha)) / (2 * n)));
  const inverse = p => sorted[Math.min(n - 1, Math.max(0, Math.ceil(n * p) - 1))];
  const quantileBand = (p, epsilon) => ({
    lower: p - epsilon <= 0 ? 0 : inverse(p - epsilon),
    upper: p + epsilon > 1 ? null : inverse(p + epsilon),
    upperUnbounded: p + epsilon > 1,
  });
  const estimate = positiveCount / n;
  const band = size => {
    const epsilon = margin(size);
    return { cdfErrorBound: epsilon, probability: [Math.max(0, estimate - epsilon), Math.min(1, estimate + epsilon)],
      p10: quantileBand(.1, epsilon), p50: quantileBand(.5, epsilon), p90: quantileBand(.9, epsilon) };
  };
  return { method: 'fixed_n_dkw_massart', paths: n, confidence, familySize,
    singleDistribution: band(1), wholeForecast: band(familySize),
    assumptions: 'iid_paths_from_frozen_model_fixed_sample_size',
    meaning: 'model_sampling_error_only_not_market_prediction_interval', trustProbability: null };
}
