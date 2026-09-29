// KOSPI is an observed comparison series, never an implicit forecast.
// All returns below share the study's origin and the requested target date.
export const validBenchmarkDate = d => typeof d === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(d) && Number.isFinite(Date.parse(d)) && new Date(d).toISOString().slice(0,10) === d;
const finite = n => typeof n === 'number' && Number.isFinite(n);
const positive = n => finite(n) && n > 0;
const instant = s => typeof s === 'string' && /T.*(?:Z|[+-]\d{2}:\d{2})$/.test(s) && Number.isFinite(Date.parse(s));
const closeTime = d => Date.parse(d + 'T15:30:00+09:00');
const direction = n => n > 0 ? 'UP' : n < 0 ? 'DOWN' : 'FLAT';
function sourceURL(row) {
  const raw = typeof row.source === 'string' ? row.source : row.source?.url ?? row.sourceUrl;
  try { const url = new URL(raw); return url.protocol === 'https:' && !url.username && !url.password ? raw : null; } catch { return null; }
}
function observedRow(benchmark,date,now) {
  const rows = benchmark.prices.filter(r => r?.date === date);
  if (!rows.length) return {reason:'BENCHMARK_DATE_MISSING'};
  if (rows.length !== 1) return {reason: new Set(rows.map(r=>r.close)).size > 1 ? 'BENCHMARK_DATE_CONFLICT' : 'BENCHMARK_DATE_DUPLICATE'};
  const row = rows[0];
  if (!positive(row.close) || row.quality === 'conflict') return {reason:'BENCHMARK_PRICE_INVALID'};
  if (row.code && row.code !== 'KOSPI') return {reason:'BENCHMARK_ROW_CODE_MISMATCH'};
  if (!sourceURL(row)) return {reason:'BENCHMARK_SOURCE_MISSING'};
  if (!instant(row.observedAt) || Date.parse(row.observedAt) > now || Date.parse(row.observedAt) < closeTime(date)) return {reason:'BENCHMARK_OBSERVATION_TIME_INVALID'};
  return {row};
}
/** Actual excess is descriptive beta=1 subtraction, not risk-adjusted alpha.
 * Forward scores need a separately frozen forecast inside the verified study.
 * Caller must verify study seal before treating any score as a sealed result.
 */
export function benchmarkScore({study,benchmark,date,actualReturn,predictedReturnA=null,predictedReturnB=null,now=new Date().toISOString()}) {
  const at = now instanceof Date ? now.toISOString() : now;
  const result = {code:'KOSPI',origin:study?.origin??null,target:date,date,status:'UNAVAILABLE',sourceStatus:'UNAVAILABLE',benchmarkReturn:null,actualExcessReturn:null,
    forwardExcessForecastStatus:'UNESTIMABLE',forward:null,comparisonMeaning:'beta_1_actual_return_difference_not_alpha',reasons:[]};
  const reject = reason => ({...result,reasons:[reason]});
  if (!validBenchmarkDate(study?.origin) || !validBenchmarkDate(study?.end) || !validBenchmarkDate(date) || date < study.origin || date > study.end || !instant(at)) return reject('BENCHMARK_DATE_CONTRACT_INVALID');
  if (!Array.isArray(study.sessions) || !study.sessions.includes(study.origin) || !study.sessions.includes(date)) return reject('BENCHMARK_NON_SESSION');
  if (closeTime(date) > Date.parse(at)) return reject('BENCHMARK_TARGET_NOT_CLOSED');
  if (!finite(actualReturn) || actualReturn <= -1) return reject('STOCK_RETURN_UNAVAILABLE');
  if (benchmark?.code !== 'KOSPI' || !Array.isArray(benchmark?.prices)) return reject('KOSPI_SERIES_UNAVAILABLE');
  if ((benchmark.conflicts??[]).some(c=>[study.origin,date].includes(c.date)&&c.resolved!==true)) return reject('BENCHMARK_UNRESOLVED_CONFLICT');
  const origin = observedRow(benchmark,study.origin,Date.parse(at)),target = observedRow(benchmark,date,Date.parse(at));
  if (!origin.row || !target.row) return {...result,reasons:[origin.reason,target.reason].filter(Boolean)};
  const marketReturn = target.row.close / origin.row.close - 1;
  if (!finite(marketReturn)) return reject('BENCHMARK_RETURN_OVERFLOW');
  result.status='OBSERVED_DIAGNOSTIC';result.sourceStatus='SINGLE_PROVIDER_UNVERIFIED_VINTAGE';
  result.benchmarkReturn=marketReturn;result.actualExcessReturn=actualReturn-marketReturn;
  if (!finite(result.actualExcessReturn)) return reject('EXCESS_RETURN_OVERFLOW');
  result.actualSource={origin:structuredClone(origin.row),target:structuredClone(target.row)};
  // Do not permit a realized benchmark or matching date alone to masquerade as
  // information available at the study cutoff. This object must be seal-bound.
  const frozen=study.benchmarkForecast;
  if (!frozen) {result.reasons.push('FROZEN_MARKET_FORECAST_MISSING');return result;}
  const cutoff = Date.parse(study.informationCutoff),created = Date.parse(study.createdAt);
  const hits=Array.isArray(frozen.rows)?frozen.rows.filter(r=>r.date===date):[];
  if (frozen.code!=='KOSPI'||frozen.sourceKind!=='FORECAST'||frozen.origin!==study.origin || !instant(frozen.informationCutoff)||!instant(frozen.createdAt)||!Number.isFinite(cutoff)||!Number.isFinite(created)
    || Date.parse(frozen.informationCutoff)>cutoff || Date.parse(frozen.createdAt)>created || Date.parse(frozen.informationCutoff)>Date.parse(frozen.createdAt)
    || hits.length!==1 || !finite(hits[0].predictedReturn) || hits[0].predictedReturn<=-1) {
    result.reasons.push('FROZEN_MARKET_FORECAST_INVALID');return result;
  }
  const estimate=predicted=> {
    if(!finite(predicted)||predicted<=-1)return null;
    const expected=predicted-hits[0].predictedReturn,error=expected-result.actualExcessReturn;
    if(!finite(expected)||!finite(error))return null;
    return {predictedExcessReturn:expected,actualExcessReturn:result.actualExcessReturn,errorReturn:error,directionMatched:direction(expected)===direction(result.actualExcessReturn),intervalScore:null,intervalStatus:'JOINT_ERROR_DISTRIBUTION_UNAVAILABLE'};
  };
  result.forward={a:estimate(predictedReturnA),b:estimate(predictedReturnB)};
  result.forwardExcessForecastStatus=(result.forward.a||result.forward.b)?'FROZEN_MODEL_DIAGNOSTIC':'UNESTIMABLE';
  result.reasons.push('MARKET_FORECAST_ERROR_INCLUDED','NO_JOINT_EXCESS_INTERVAL');
  return result;
}
