/** Company observation calculations; never turns a calendar item into a price shock. */
const finite = x => typeof x === 'number' && Number.isFinite(x);
const dated = x => typeof x === 'string' && /^\d{4}-\d{2}-\d{2}T.*(?:Z|[+-]\d{2}:\d{2})$/.test(x) && Number.isFinite(Date.parse(x));
export function validateCompanyObservation(row, universe) {
  const errors = [];
  if (!universe.includes(row.code)) errors.push('unknown_company');
  if (!finite(row.value)) errors.push('missing_or_nonfinite_value');
  if (!row.unit || !row.metric || !row.period) errors.push('missing_metric_unit_period');
  if (!['actual', 'guidance', 'consensus', 'announcement'].includes(row.kind)) errors.push('unknown_observation_kind');
  if (!row.sourceBodyRead || !/^https:\/\//.test(row.sourceUrl || '') || !/^[a-f0-9]{64}$/.test(row.rawHash || '')) errors.push('unverified_source_body');
  if (!dated(row.observedAt)) errors.push('invalid_observed_at');
  if (row.publishedAt !== null && !dated(row.publishedAt)) errors.push('invalid_published_at');
  if (dated(row.publishedAt) && dated(row.observedAt) && Date.parse(row.publishedAt) > Date.parse(row.observedAt)) errors.push('publication_after_observation');
  return {valid: errors.length === 0, errors};
}

export function companySurprise(actual, expectation, {asOf, scale} = {}) {
  const blockers = [];
  if (!actual || !expectation) return {value: null, blockers: ['actual_or_preannouncement_expectation_missing']};
  if (actual.code !== expectation.code) blockers.push('company_mismatch');
  if (actual.period !== expectation.period || actual.metric !== expectation.metric || actual.unit !== expectation.unit) blockers.push('metric_period_unit_mismatch');
  if (actual.kind !== 'actual' || expectation.kind !== 'consensus') blockers.push('actual_consensus_required');
  if (!finite(actual.value) || !finite(expectation.value) || !finite(scale) || scale <= 0) blockers.push('nonfinite_value_or_missing_prespecified_scale');
  if (![actual.publishedAt, expectation.publishedAt, expectation.observedAt, actual.observedAt, asOf].every(dated)) blockers.push('exact_publication_or_observation_time_missing');
  else {
    if (Date.parse(expectation.publishedAt) >= Date.parse(actual.publishedAt) || Date.parse(expectation.observedAt) >= Date.parse(actual.publishedAt)) blockers.push('expectation_not_available_before_release');
    if (Date.parse(actual.publishedAt) > Date.parse(asOf) || Date.parse(actual.observedAt) > Date.parse(asOf)) blockers.push('future_actual');
  }
  if (!actual.pointInTimeVerified || !expectation.pointInTimeVerified) blockers.push('point_in_time_vintage_unverified');
  return {value: blockers.length ? null : (actual.value - expectation.value) / scale, blockers, unit: 'prespecified_scale_units', causal: false, priceImpact: null};
}

export function balanceSheetRatios({assets, liabilities, equity}) {
  if (![assets, liabilities, equity].every(finite)) return {debtToEquity: null, equityToAssets: null, status: 'missing'};
  if (assets <= 0 || equity <= 0 || liabilities < 0) return {debtToEquity: null, equityToAssets: null, status: 'invalid_denominator_or_balance'};
  const discrepancy = assets - liabilities - equity;
  // Do not silently adjust accounting values to force the identity to hold.
  if (Math.abs(discrepancy) > 1) return {debtToEquity: null, equityToAssets: null, status: 'balance_sheet_conflict', discrepancy};
  return {debtToEquity: liabilities / equity, equityToAssets: equity / assets, status: 'computed_accounting_ratio_not_price_signal', discrepancy};
}

export function commodityMonthlyChanges(rows) {
  const ordered = [...rows].sort((a, b) => a.period.localeCompare(b.period));
  const seen = new Set();
  return ordered.map((row, i) => {
    if (seen.has(row.period)) throw new Error('duplicate_commodity_month');
    seen.add(row.period);
    const previous = ordered[i - 1];
    const month = p => Number(p.slice(0,4)) * 12 + Number(p.slice(5,7));
    const adjacent = previous && month(row.period) - month(previous.period) === 1;
    const valid = adjacent && finite(previous.value) && finite(row.value) && previous.value > 0 && row.value > 0;
    return {...row, logChange: valid ? Math.log(row.value / previous.value) : null, changeStatus: valid ? 'monthly_change_current_vintage' : 'missing_adjacent_positive_observation', dailyShock: false, priceImpact: null};
  });
}
