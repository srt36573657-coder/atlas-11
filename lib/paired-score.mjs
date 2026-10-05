// Pure scores in simple-return space. Fractions are never hit probabilities.
const finite = n => typeof n === 'number' && Number.isFinite(n);
const positive = n => finite(n) && n > 0;
const nullable = n => finite(n) ? n : null;
const mean = values => values.length ? nullable(values.reduce((sum, value) => sum + value, 0) / values.length) : null;

export function classifyDirection(value, tolerance = 0) {
  if (!finite(value) || !finite(tolerance) || tolerance < 0) return null;
  return value > tolerance ? 'UP' : value < -tolerance ? 'DOWN' : 'FLAT';
}

// Gneiting & Raftery (2007), interval score. Inputs/output have the same unit.
// This function is mathematical: the caller separately checks price boundaries.
export function intervalScore(lower, upper, actual, alpha = 0.2) {
  if (![lower, upper, actual, alpha].every(finite) || upper < lower || alpha <= 0 || alpha >= 1) return null;
  // Divide the distance first: 2 / tiny alpha may overflow even when the
  // final penalty (for a correspondingly tiny miss) remains representable.
  return nullable(upper - lower + (actual < lower ? (lower - actual) / alpha * 2 : actual > upper ? (actual - upper) / alpha * 2 : 0));
}

export function scoreLine(line, actualReturn, {
  originPrice = 1, alpha = 0.2, flatThreshold = 0, magnitudeTolerance = null,
  previousCenterReturn = null, previousActualReturn = null,
} = {}) {
  if (line?.status !== 'ESTIMATED' || !finite(line.centerReturn) || line.centerReturn <= -1 ||
      !positive(line.price) || !positive(originPrice) || !finite(actualReturn) || actualReturn <= -1 ||
      !finite(alpha) || alpha <= 0 || alpha >= 1 || !finite(flatThreshold) || flatThreshold < 0 ||
      (magnitudeTolerance !== null && (!finite(magnitudeTolerance) || magnitudeTolerance < 0))) return null;
  const signedErrorPP = 100 * (line.centerReturn - actualReturn);
  if (!finite(signedErrorPP)) return null;
  const predicted = classifyDirection(line.centerReturn, flatThreshold), actual = classifyDirection(actualReturn, flatThreshold);
  const absoluteErrorPP = Math.abs(signedErrorPP);
  const magnitudeHit = magnitudeTolerance === null ? null : Math.abs(line.centerReturn - actualReturn) <= magnitudeTolerance;
  const directionMatched = predicted === actual;
  const category = magnitudeHit === null ? 'UNDETERMINED' :
    directionMatched ? (magnitudeHit ? 'BOTH' : 'DIRECTION_ONLY') : (magnitudeHit ? 'MAGNITUDE_ONLY' : 'NEITHER');
  const score = intervalScore(line.lowerReturn, line.upperReturn, actualReturn, alpha);
  const bandValid = finite(score) && line.lowerReturn >= -1 && line.lowerReturn <= line.centerReturn && line.centerReturn <= line.upperReturn;
  const predictedDaily = finite(previousCenterReturn) && previousCenterReturn > -1 ? (1 + line.centerReturn) / (1 + previousCenterReturn) - 1 : null;
  const actualDaily = finite(previousActualReturn) && previousActualReturn > -1 ? (1 + actualReturn) / (1 + previousActualReturn) - 1 : null;
  const dailyPredictedDirection = classifyDirection(predictedDaily, flatThreshold), dailyActualDirection = classifyDirection(actualDaily, flatThreshold);
  return {
    price: line.price, centerReturn: line.centerReturn,
    signedErrorPP, absoluteErrorPP, errorWon: nullable(originPrice * (line.centerReturn - actualReturn)),
    direction: { predicted, actual, matched: directionMatched, anchor: 'SEALED_ORIGIN' },
    dailyDirection: dailyPredictedDirection && dailyActualDirection ? {
      predicted: dailyPredictedDirection, actual: dailyActualDirection,
      matched: dailyPredictedDirection === dailyActualDirection,
      predictedReturn: predictedDaily, actualReturn: actualDaily, anchor: 'PREVIOUS_SESSION',
    } : null,
    magnitudeHit, magnitudeToleranceReturn: magnitudeTolerance, category,
    interval: bandValid && finite(score * 100) ? {
      lowerReturn: line.lowerReturn, upperReturn: line.upperReturn,
      widthPP: (line.upperReturn - line.lowerReturn) * 100,
      inside: line.lowerReturn <= actualReturn && actualReturn <= line.upperReturn,
      scorePP: score * 100, alpha, nominalCoverage: 1 - alpha,
    } : null,
  };
}

export function scorePairedLines(a, b, actualReturn, options = {}) {
  const scoredA = scoreLine(a, actualReturn, { ...options, previousCenterReturn: options.previousAReturn ?? options.previousCenterReturn ?? null });
  const scoredB = scoreLine(b, actualReturn, { ...options, previousCenterReturn: options.previousBReturn ?? options.previousCenterReturn ?? null });
  const paired = !!scoredA && !!scoredB;
  return {
    a: scoredA, b: scoredB, paired,
    centerImprovementPP: paired ? scoredA.absoluteErrorPP - scoredB.absoluteErrorPP : null,
    intervalImprovementPP: paired && scoredA.interval && scoredB.interval ? scoredA.interval.scorePP - scoredB.interval.scorePP : null,
  };
}

function aggregate(scores) {
  const bands = scores.filter(s => s.interval), magnitude = scores.filter(s => s.magnitudeHit !== null);
  const daily = scores.filter(s => s.dailyDirection);
  return {
    count: scores.length,
    directionCorrect: scores.filter(s => s.direction.matched).length,
    directionRate: scores.length ? scores.filter(s => s.direction.matched).length / scores.length : null,
    dailyDirectionCount: daily.length, dailyDirectionCorrect: daily.filter(s => s.dailyDirection.matched).length,
    dailyDirectionRate: daily.length ? daily.filter(s => s.dailyDirection.matched).length / daily.length : null,
    meanAbsoluteErrorPP: mean(scores.map(s => s.absoluteErrorPP)),
    maxAbsoluteErrorPP: scores.length ? Math.max(...scores.map(s => s.absoluteErrorPP)) : null,
    intervalCount: bands.length, insideCount: bands.filter(s => s.interval.inside).length,
    coverage: bands.length ? bands.filter(s => s.interval.inside).length / bands.length : null,
    meanIntervalScorePP: mean(bands.map(s => s.interval.scorePP)),
    magnitudeCount: magnitude.length, magnitudeCorrect: magnitude.filter(s => s.magnitudeHit).length,
    magnitudeRate: magnitude.length ? magnitude.filter(s => s.magnitudeHit).length / magnitude.length : null,
    categories: Object.fromEntries(['BOTH', 'DIRECTION_ONLY', 'MAGNITUDE_ONLY', 'NEITHER', 'UNDETERMINED'].map(k => [k, scores.filter(s => s.category === k).length])),
  };
}

// A and B are always summarized on the same issuer set. Partial B eligibility
// cannot silently improve either side's denominator.
export function summarizePairedRows(rows, { observed = false } = {}) {
  const paired = rows.map(r => observed ? r.observed : r).filter(r => r?.a && r?.b);
  const intervalPairs = paired.filter(r => r.a.interval && r.b.interval);
  return {
    codes: rows.filter(r => observed ? r.observed?.a && r.observed?.b : r.a && r.b).map(r => r.code),
    count: paired.length,
    a: aggregate(paired.map(r => r.a.interval && r.b.interval ? r.a : { ...r.a, interval: null })),
    b: aggregate(paired.map(r => r.a.interval && r.b.interval ? r.b : { ...r.b, interval: null })),
    centerImprovementPP: mean(paired.map(r => r.a.absoluteErrorPP - r.b.absoluteErrorPP)),
    intervalPairedCount: intervalPairs.length,
    intervalImprovementPP: mean(intervalPairs.map(r => r.a.interval.scorePP - r.b.interval.scorePP)),
    unit: 'PERCENTAGE_POINTS', weighting: 'EQUAL_ISSUER_WITHIN_DATE', independentSampleSize: null,
  };
}
