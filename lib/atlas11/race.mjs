/**
 * ATLAS 11 · 1만원 비교 — 52종목이 같은 시작일에 1만원으로 출발한다.
 *   V[i,t] = 10000 × P[i,t] / P[i,start]      (실제 구간: 관측 종가, 전망 구간: 중앙 전망 p50)
 *   rank[i,t] = 값 내림차순, 동률은 종목코드 오름차순 (고정 규칙)
 * 「같은 시작일 1만원 수준 순위」와 「오늘부터 향후 수익률 순위」는 다른 지표이므로 이름을 나눈다.
 */
const finite = x => typeof x === 'number' && Number.isFinite(x);

export function buildRace(publication, {lookback = 20} = {}) {
  const anchorDate = publication.actualAsOf;
  const startIndex = 60 - 1 - lookback; // actual60 의 마지막이 anchor
  const stocks = publication.assets.map(a => {
    const actual = a.actual60.slice(startIndex), start = actual[0].close;
    if (!finite(start) || start <= 0 || actual.at(-1).date !== anchorDate) throw Error('RACE_START ' + a.code);
    return {code: a.code, name: a.name, sector: a.sector, startClose: start, anchorClose: a.anchor.close,
      actual: actual.map(r => ({date: r.date, value: 10000 * r.close / start})),
      forecast: a.rows.slice(1).map(r => ({date: r.date, value: 10000 * r.p50 / start, low: 10000 * r.p10 / start, high: 10000 * r.p90 / start})),
      fromToday: a.rows.slice(1).map(r => ({date: r.date, value: 10000 * r.p50 / a.anchor.close, return: r.return, selected: r.direction?.cumulative?.selected ?? null, closeCall: r.direction?.cumulative?.closeCall ?? null}))};
  });
  const actualDates = stocks[0].actual.map(r => r.date), futureDates = publication.futureDates, dates = [...actualDates, ...futureDates];
  if (stocks.some(s => s.actual.length !== actualDates.length || s.forecast.length !== 20)) throw Error('RACE_SHAPE');
  const rank = (values) => Object.keys(values).sort((a, b) => values[b] - values[a] || a.localeCompare(b));
  const levelRank = {}, futureReturnRank = {};
  for (let t = 0; t < dates.length; t++) {
    const values = {};
    for (const s of stocks) values[s.code] = t < actualDates.length ? s.actual[t].value : s.forecast[t - actualDates.length].value;
    levelRank[dates[t]] = rank(values);
  }
  for (let h = 0; h < futureDates.length; h++) { const values = {}; for (const s of stocks) values[s.code] = s.fromToday[h].return; futureReturnRank[futureDates[h]] = rank(values); }
  return {schema: 'atlas11-race-1', forecastId: publication.forecastId, issuedAt: publication.issuedAt, actualAsOf: anchorDate, startDate: actualDates[0], anchorDate, dates, actualDates, futureDates, basis: 'unadjusted_close_single_provider · 배당·기업행위 미조정', tieRule: 'value_desc_then_code_asc', stocks, levelRank, futureReturnRank, names: {level: '같은 시작일 1만원 수준 순위', futureReturn: '오늘부터 향후 수익률 순위(중앙 전망)'}};
}
