// Append-only reports for the sealed A/B study. No paths, old reports or inputs
// are edited. Observed diagnostics never become formal results by relabeling.
import { sha256 } from './cycle-math.mjs';
import { pricesAsOf } from './evidence.mjs';
import { verifyStudySeal } from './sealed-manifest.mjs';
import { benchmarkScore } from './benchmark-score.mjs';
import { classifyDirection, scorePairedLines, summarizePairedRows } from './paired-score.mjs';

const finite = n => typeof n === 'number' && Number.isFinite(n);
const positive = n => finite(n) && n > 0;
const stamp = value => value instanceof Date ? value.getTime() : typeof value === 'string' && /T.*(?:Z|[+-]\d{2}:\d{2})$/.test(value) ? Date.parse(value) : NaN;
const closeTime = date => stamp(date + 'T15:30:00+09:00');
const dayStart = date => stamp(date + 'T00:00:00+09:00');
const unique = values => [...new Set(values)];
const clone = value => structuredClone(value);
const safeTime = value => { const n = stamp(value); if (!finite(n)) throw new TypeError('Explicit valid report observation time required'); return new Date(n).toISOString(); };
const isoDate = value => typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value) && finite(Date.parse(value)) && new Date(value + 'T00:00:00Z').toISOString().slice(0, 10) === value;

function invalidPrices(row) {
  if (!positive(row?.close) || ['conflict', 'invalid', 'held', 'suspect', 'missing'].includes(row?.quality) || row?.conflict === true) return true;
  if (row.volume != null && (!finite(row.volume) || row.volume < 0)) return true;
  for (const key of ['open', 'high', 'low']) if (row[key] != null && !positive(row[key])) return true;
  if (finite(row.high) && row.high < Math.max(row.close, row.open ?? row.close, row.low ?? row.close)) return true;
  if (finite(row.low) && row.low > Math.min(row.close, row.open ?? row.close, row.high ?? row.close)) return true;
  return false;
}

function priceAt(source, date, input, nowMs) {
  const reasons = [];
  if (!source) return { value: null, reasons: ['ASSET_SOURCE_MISSING'] };
  if (closeTime(date) > nowMs) return { value: null, reasons: ['SESSION_NOT_CLOSED'] };
  const matches = (source.prices ?? []).filter(p => p.date === date);
  if (matches.length !== 1) return { value: null, reasons: [matches.length ? 'ACTUAL_PRICE_CONFLICT' : 'ACTUAL_PRICE_MISSING'] };
  const p = matches[0];
  if (p.code != null && p.code !== source.code) return { value: null, reasons: ['ACTUAL_CODE_MISMATCH'] };
  if (invalidPrices(p)) return { value: null, reasons: ['ACTUAL_PRICE_INVALID'] };
  const revisions = (input.priceRevisions ?? []).map((r, index) => ({ ...r, index })).filter(r => r.code === source.code && r.date === date);
  if (revisions.some(r => !finite(stamp(r.at)))) return { value: null, reasons: ['PRICE_JOURNAL_TIME_UNKNOWN'] };
  if (revisions.some(r => stamp(r.at) > nowMs && !Object.hasOwn(r, 'beforeRow') && !Object.hasOwn(r, 'before')))
    return { value: null, reasons: ['FUTURE_PRICE_REVISION_CANNOT_BE_REPLAYED'] };
  const visible = revisions.filter(r => stamp(r.at) <= nowMs).sort((a, b) => stamp(a.at) - stamp(b.at) || a.index - b.index);
  const latest = visible.at(-1);
  if (latest && (latest.afterRow?.close ?? latest.after) !== p.close) return { value: null, reasons: ['PRICE_JOURNAL_CONFLICT'] };
  const observedAt = latest?.at ?? p.observedAt ?? p.retrievedAt ?? source.priceSource?.retrievedAt ?? null;
  const observedMs = stamp(observedAt);
  // A future explicit observation is not a present diagnostic, either.
  if (finite(observedMs) && observedMs > nowMs) return { value: null, reasons: ['ACTUAL_NOT_YET_OBSERVED'] };
  if (!finite(observedMs)) reasons.push('ACTUAL_OBSERVATION_TIME_UNKNOWN');
  else if (observedMs < closeTime(date)) reasons.push('ACTUAL_OBSERVED_BEFORE_CLOSE');
  const sourceMeta = source.priceSource ?? {};
  if (sourceMeta.priceVintageVerified !== true) reasons.push('ACTUAL_VINTAGE_UNVERIFIED');
  if (sourceMeta.corporateActionsChecked !== true) reasons.push('ACTUAL_ADJUSTMENT_UNVERIFIED');
  if (typeof sourceMeta.basisId !== 'string' || !sourceMeta.basisId) reasons.push('ACTUAL_BASIS_UNKNOWN');
  const material = visible.filter(r => r.before !== r.after || JSON.stringify(r.beforeRow) !== JSON.stringify(r.afterRow)).at(-1);
  const vintageId = sha256({ code: source.code, date, close: p.close, open: p.open ?? null, high: p.high ?? null, low: p.low ?? null,
    volume: p.volume ?? null, quality: p.quality ?? null, basisId: sourceMeta.basisId ?? null,
    provider: sourceMeta.provider ?? null, revisionAt: material?.at ?? null,
    priceVintageVerified: sourceMeta.priceVintageVerified === true, corporateActionsChecked: sourceMeta.corporateActionsChecked === true });
  return { value: { price: p.close, observedAt: finite(observedMs) ? new Date(observedMs).toISOString() : null,
    vintageId, basisId: sourceMeta.basisId ?? null }, reasons };
}

function sameBands(row) {
  if (!row || !finite(row.widthReturn) || row.widthReturn < 0) return false;
  for (const line of [row.a, row.b]) {
    if (line?.status !== 'ESTIMATED') continue;
    if (![line.centerReturn, line.lowerReturn, line.upperReturn].every(finite)) return false;
    const epsilon = 1e-12 * Math.max(1, Math.abs(line.centerReturn), row.widthReturn);
    if (Math.abs(line.centerReturn - line.lowerReturn - row.widthReturn) > epsilon ||
        Math.abs(line.upperReturn - line.centerReturn - row.widthReturn) > epsilon || line.lowerReturn < -1) return false;
  }
  return true;
}

function noMetrics() { return { a: null, b: null, paired: false, centerImprovementPP: null, intervalImprovementPP: null }; }

function consistentLine(line, originPrice, baseline = false) {
  if (line?.status !== 'ESTIMATED') return line;
  if (!positive(originPrice) || !positive(line.price) || !finite(line.centerReturn) || line.centerReturn <= -1) return null;
  const expected = originPrice * (1 + line.centerReturn);
  if (!positive(expected) || Math.abs(line.price - expected) > 1e-12 * Math.max(1, line.price, expected)) return null;
  if (baseline && (line.centerReturn !== 0 || line.price !== originPrice)) return null;
  return line;
}

function semanticReport(value) {
  if (Array.isArray(value)) return value.map(semanticReport);
  if (value && typeof value === 'object') return Object.fromEntries(Object.entries(value)
    .filter(([key]) => !['createdAt', 'observedAt', 'revision', 'supersedesId', 'id', 'contentDigest'].includes(key))
    .map(([key, v]) => [key, semanticReport(v)]));
  return value;
}

export function buildDailyStudyReport(study, input, { date, now = new Date().toISOString(), benchmark = null } = {}) {
  const createdAt = safeTime(now), nowMs = stamp(createdAt);
  if (!isoDate(date) || date <= study.origin || date > study.end || !(study.sessions ?? []).includes(date) ||
      !(input.calendar?.sessions ?? []).includes(date) || closeTime(date) > nowMs || stamp(study.createdAt) > nowMs) return null;
  const seal = verifyStudySeal(study);
  const assets = pricesAsOf(input, createdAt), sourceGroups = new Map();
  for (const source of assets) { const group = sourceGroups.get(source.code) ?? []; group.push(source); sourceGroups.set(source.code, group); }
  const previousDate = study.sessions.filter(d => d < date).at(-1) ?? null;
  const policy = study.policy?.scoring ?? {}, options = {
    alpha: policy.alpha ?? 0.2, flatThreshold: policy.directionFlatThresholdReturn ?? 0,
    magnitudeTolerance: policy.magnitudeToleranceReturn ?? null,
  };
  const issuedBeforeTarget = finite(stamp(study.createdAt)) && stamp(study.createdAt) < dayStart(date) && stamp(study.createdAt) <= nowMs;
  const evaluationKind = issuedBeforeTarget ? 'POST_SEAL_RESEARCH' : 'RETROSPECTIVE_RECONSTRUCTION';
  const rows = study.assets.map(asset => {
    const sourceGroup = sourceGroups.get(asset.code) ?? [], source = sourceGroup.length === 1 ? sourceGroup[0] : null;
    const pathRow = asset.rows.find(r => r.date === date), previousPath = asset.rows.find(r => r.date === previousDate);
    const actual = priceAt(source, date, input, nowMs);
    if (sourceGroup.length > 1) actual.reasons.push('ASSET_SOURCE_CONFLICT');
    const prior = previousDate ? priceAt(source, previousDate, input, nowMs) : { value: null, reasons: ['PREVIOUS_SESSION_MISSING'] };
    const blockers = [...actual.reasons];
    if (!seal.valid) blockers.push('SEAL_INVALID');
    if (stamp(study.createdAt) > nowMs) blockers.push('STUDY_NOT_YET_CREATED');
    if (asset.priceBasisStatus !== 'VERIFIED') blockers.push('ORIGIN_PRICE_BASIS_UNVERIFIED');
    if (!positive(asset.originPrice)) blockers.push('ORIGIN_PRICE_MISSING');
    if (asset.priceBasisId == null || asset.priceBasisId !== actual.value?.basisId) blockers.push('PRICE_BASIS_MISMATCH');
    const currentOrigins = (source?.prices ?? []).filter(p => p.date === study.origin);
    if (currentOrigins.length !== 1 || currentOrigins[0].close !== asset.originPrice) blockers.push('SEALED_ORIGIN_PRICE_CHANGED_OR_MISSING');
    if (!pathRow) blockers.push('SEALED_PATH_MISSING');
    const aLine = consistentLine(pathRow?.a, asset.originPrice, true), bLine = consistentLine(pathRow?.b, asset.originPrice);
    if (pathRow?.a?.status === 'ESTIMATED' && !aLine) blockers.push('A_PRICE_RETURN_OR_BASELINE_INCONSISTENT');
    if (pathRow?.b?.status === 'ESTIMATED' && !bLine) blockers.push('B_PRICE_RETURN_INCONSISTENT');
    const actualReturn = actual.value && positive(asset.originPrice) ? actual.value.price / asset.originPrice - 1 : null;
    const previousActualReturn = prior.value && positive(asset.originPrice) ? prior.value.price / asset.originPrice - 1 : null;
    const numerical = seal.valid && stamp(study.createdAt) <= nowMs && finite(actualReturn) && pathRow ? scorePairedLines(aLine, bLine, actualReturn, {
      ...options, originPrice: asset.originPrice, previousActualReturn,
      previousAReturn: previousPath?.a?.status === 'ESTIMATED' ? previousPath.a.centerReturn : null,
      previousBReturn: previousPath?.b?.status === 'ESTIMATED' ? previousPath.b.centerReturn : null,
    }) : noMetrics();
    const intervalBlockers = [];
    if (!sameBands(pathRow)) intervalBlockers.push('SYMMETRIC_COMMON_BAND_INVALID');
    if (pathRow?.widthStatus !== 'CALIBRATED') intervalBlockers.push('BAND_CALIBRATION_UNVERIFIED');
    if (intervalBlockers.includes('SYMMETRIC_COMMON_BAND_INVALID')) {
      if (numerical.a) numerical.a.interval = null;
      if (numerical.b) numerical.b.interval = null;
      numerical.intervalImprovementPP = null;
    }
    const formal = blockers.length ? noMetrics() : clone(numerical);
    if (intervalBlockers.length) {
      if (formal.a) formal.a.interval = null;
      if (formal.b) formal.b.interval = null;
      formal.intervalImprovementPP = null;
    }
    // Daily formal direction also requires the immediately preceding session's
    // vintage/basis, not whichever old stored close happens to be present.
    if (prior.reasons.length || prior.value?.basisId !== asset.priceBasisId) {
      if (formal.a) formal.a.dailyDirection = null;
      if (formal.b) formal.b.dailyDirection = null;
    }
    const data = actual.value && finite(actualReturn) ? { ...actual.value, return: actualReturn,
      dailyReturn: prior.value ? actual.value.price / prior.value.price - 1 : null,
      previousDate, previousVintageId: prior.value?.vintageId ?? null, dailyBlockers: prior.reasons } : null;
    return {
      code: asset.code, name: asset.name, sector: asset.sector ?? null,
      status: !seal.valid ? 'INVALID_SEAL' : !data ? 'ACTUAL_UNAVAILABLE' : blockers.length ? 'OBSERVED_ONLY' : formal.b ? 'FORMAL' : 'B_UNESTIMABLE',
      blockers: unique(blockers), intervalBlockers, actual: data,
      a: formal.a, b: formal.b,
      observed: { a: numerical.a, b: numerical.b, meaning: 'OBSERVED_UNVERIFIED_DIAGNOSTIC', causal: false },
      paired: { eligible: formal.paired, observedEligible: numerical.paired,
        centerImprovementPP: formal.centerImprovementPP, intervalImprovementPP: formal.intervalImprovementPP,
        observedCenterImprovementPP: numerical.centerImprovementPP, observedIntervalImprovementPP: numerical.intervalImprovementPP },
      bStatus: pathRow?.b?.status ?? 'UNESTIMABLE',
      benchmark: seal.valid ? benchmarkScore({ study, benchmark, date, actualReturn: data?.return ?? null,
        predictedReturnA: seal.valid && pathRow?.a?.status === 'ESTIMATED' ? pathRow.a.centerReturn : null,
        predictedReturnB: seal.valid && pathRow?.b?.status === 'ESTIMATED' ? pathRow.b.centerReturn : null, now: createdAt }) : {
          status: 'UNAVAILABLE', actualExcessReturn: null, benchmarkReturn: null,
          forwardExcessForecastStatus: 'UNESTIMABLE', forward: null, reasons: ['SEAL_INVALID'],
        },
      diagnosis: [
        { status: 'CONFIRMED', kind: 'SEALED_POLICY', detail: '봉인된 A/B는 실제 결과에 맞춰 수정하지 않음' },
        { status: 'UNKNOWN', kind: 'CAUSAL_EXPLANATION', detail: '가격 차이만으로 특정 뉴스나 방정식 항을 원인으로 확정할 수 없음' },
      ],
    };
  });
  const formal = summarizePairedRows(rows), observed = summarizePairedRows(rows, { observed: true });
  const movements = rows.filter(r => finite(r.actual?.dailyReturn)).map(r => classifyDirection(r.actual.dailyReturn, options.flatThreshold));
  const up = movements.filter(d => d === 'UP').length, down = movements.filter(d => d === 'DOWN').length, flat = movements.filter(d => d === 'FLAT').length;
  const summary = {
    total: rows.length, actualAvailable: rows.filter(r => r.actual).length, missingActual: rows.filter(r => !r.actual).length,
    formalPaired: formal.count, observedPaired: observed.count, unestimableB: rows.filter(r => r.bStatus !== 'ESTIMATED').length,
    formalAAvailable: rows.filter(r => r.a).length, formalBAvailable: rows.filter(r => r.b).length,
    observedAAvailable: rows.filter(r => r.observed.a).length, observedBAvailable: rows.filter(r => r.observed.b).length,
    formal, observed,
    coMovement: { available: movements.length, up, down, flat,
      majorityShare: movements.length ? Math.max(up, down, flat) / movements.length : null,
      meaning: 'same_day_direction_concentration', independentSampleSize: null },
    prospective: issuedBeforeTarget && seal.valid, dateGroupCount: 1,
    eligibleEvaluationDateCount: formal.count > 0 ? 1 : 0,
    completeness: rows.every(r => r.actual) ? 'ALL_ACTUALS_OBSERVED' : rows.some(r => r.actual) ? 'PARTIAL_ACTUALS' : 'NO_ACTUALS',
    superiority: 'NOT_ESTABLISHED', independentSampleSize: null, trustProbability: null,
  };
  const report = {
    schema: 1, id: null, studyId: study.id, date, createdAt, revision: 1, supersedesId: null,
    sealValid: seal.valid, sealDigest: seal.digest ?? null, sealReason: seal.reason ?? null,
    evaluationKind, studyReconstructedRetrospectively: study.retrospective === true,
    temporalProof: 'LOCAL_DECLARED_TIME_ONLY', externallyProven: false,
    rows, summary, scoringPolicy: clone(options), benchmarkStatus: benchmark?.status ?? 'UNAVAILABLE',
    externalTimestampRequiredForTemporalProof: true,
  };
  report.contentDigest = sha256(semanticReport(report));
  report.id = 'sealed-report-' + report.contentDigest;
  return report;
}

export function latestStudyReports(branch, studyId) {
  const dates = new Map();
  for (const report of branch?.reports ?? []) {
    if (studyId && report.studyId !== studyId) continue;
    const key = report.studyId + ':' + report.date, previous = dates.get(key);
    if (!previous || report.revision > previous.revision || report.revision === previous.revision && stamp(report.createdAt) > stamp(previous.createdAt)) dates.set(key, report);
  }
  return [...dates.values()].sort((a, b) => a.date.localeCompare(b.date) || a.studyId.localeCompare(b.studyId));
}

export function appendStudyReports(branch, input, { now = new Date().toISOString(), benchmark = null } = {}) {
  if (!branch || branch.schema !== 1 || !['studies', 'reports', 'proofs', 'errors'].every(k => Array.isArray(branch[k]))) throw new TypeError('Invalid sealed-study branch; preserve history before migration');
  const createdAt = safeTime(now), nowMs = stamp(createdAt), result = clone(branch);
  const ids = new Set(result.reports.map(r => r.id));
  for (const study of result.studies) {
    for (const date of study.sessions ?? []) {
      if (date <= study.origin || date > study.end || closeTime(date) > nowMs) continue;
      const report = buildDailyStudyReport(study, input, { date, now: createdAt, benchmark });
      if (!report || report.summary.actualAvailable === 0 && date > (input.actualAsOf ?? study.origin)) continue;
      const history = result.reports.filter(r => r.studyId === study.id && r.date === date);
      const previous = history.slice().sort((a, b) => b.revision - a.revision || stamp(b.createdAt) - stamp(a.createdAt))[0];
      if (previous?.contentDigest === report.contentDigest) continue;
      report.revision = previous ? previous.revision + 1 : 1;
      report.supersedesId = previous?.id ?? null;
      // A correction may restore a previously seen value. Preserve that new
      // transition rather than silently resurrecting an old report identity.
      if (ids.has(report.id)) report.id = 'sealed-report-' + sha256({ contentDigest: report.contentDigest, previousId: previous?.id ?? null, revision: report.revision });
      result.reports.push(report); ids.add(report.id);
      if (!report.sealValid) {
        const id = 'seal-report-error-' + sha256({ studyId: study.id, digest: report.sealDigest, reason: report.sealReason });
        if (!result.errors.some(e => e.id === id)) result.errors.push({ id, at: createdAt, studyId: study.id, kind: 'SEAL_INVALID', reason: report.sealReason });
      }
    }
  }
  return result;
}
