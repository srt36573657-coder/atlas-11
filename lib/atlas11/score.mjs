/**
 * ATLAS 11 · 성적 — 발행 뒤에 실제로 온 종가만 채점한다. 실현값이 없는 목표일은 채점하지 않는다.
 * APE = |예측−실제|/실제×100 · 담김 = p10≤실제≤p90 · IntervalScore(alpha=0.2) · 다항 Brier = Σ(p_c − 1[c 실제])²
 * 방향 정답은 같은 기준일의 실제 출발가와 같은 보합 경계(±0.1%)로 비교한다.
 */
import {rollingScoreRecord, ROLLING_HORIZONS} from '../rolling-operation.mjs';
import {directionOf} from './simulate.mjs';

const finite = x => typeof x === 'number' && Number.isFinite(x);
const mean = a => a.length ? a.reduce((s, x) => s + x, 0) / a.length : null;

export function isLivePublication(p) {
  return (p.publicationStatus === 'live_research_forecast') && p.dataStatus === 'current_close' && p.staleAnchor !== true;
}

function probabilitiesFor(publication, code, targetDate) {
  const a = publication.assets.find(a => a.code === code), r = a?.rows?.find(r => r.date === targetDate);
  return r?.direction?.cumulative?.probabilities ?? r?.wave?.horizon?.probabilities ?? null;
}

export function brierFor(probabilities, actualReturn, delta = 0.001) {
  if (!probabilities || !finite(actualReturn)) return null;
  const observed = directionOf(actualReturn, delta);
  return ['up', 'flat', 'down'].reduce((s, c) => s + ((probabilities[c] ?? 0) - (observed === c ? 1 : 0)) ** 2, 0);
}

/**
 * 채점판 — 실시간 발행본만 기본 성적에 넣고, 보관 종가 참조본은 제외 목록에 남긴다.
 *   horizons: 화면에 남길 거리(내일만 = [1] · 사장님 명령 2026-10-02) — 채점 계산은 그대로 두고 화면 묶음에서 거른다(지난 기록은 그대로)
 *   until: 채점 예정표에서 이 날 뒤 목표일은 뺀다(내일만 = 내일)
 */
export function buildScoreboard({publications, input, calendar, now = new Date().toISOString(), delta = 0.001, horizons = null, until = null}) {
  const H = horizons ? ROLLING_HORIZONS.filter(h => horizons.map(Number).includes(h)) : [...ROLLING_HORIZONS];
  const live = publications.filter(isLivePublication), excluded = publications.filter(p => !isLivePublication(p)).map(p => ({forecastId: p.forecastId ?? p.id, issuedAt: p.issuedAt, actualAsOf: p.actualAsOf, reason: p.publicationStatus === 'stored_close_reference' ? '보관 종가 참조본 · 실시간 발행 아님 → 기본 성적 제외(감사 보관)' : '실시간 발행 조건 미충족'}));
  const record = rollingScoreRecord(live, input, {now, calendar});
  const byId = new Map(live.map(p => [p.forecastId ?? p.id, p]));
  const enrich = cell => {
    if (cell.status !== 'evaluated') return cell;
    const p = byId.get(cell.forecastId), probabilities = p ? probabilitiesFor(p, cell.code, cell.targetDate) : null;
    const observed = directionOf(cell.actualReturn, delta), predicted = probabilities ? ['flat', 'up', 'down'].sort((a, b) => probabilities[b] - probabilities[a])[0] : directionOf(cell.predictedReturn, delta);
    return {...cell, observedDirection: observed, predictedDirection: predicted, directionCorrect: observed === predicted, probabilities, brier: brierFor(probabilities, cell.actualReturn, delta), delta};
  };
  const byDate = record.byDate.map(d => {
    const rows = d.rows.map(r => ({code: r.code, name: input.assets.find(a => a.code === r.code)?.name ?? r.code, horizons: Object.fromEntries(H.map(h => [h, enrich({...r.horizons[h], code: r.code})]))}));
    const horizonSummary = Object.fromEntries(H.map(h => {
      const cells = rows.map(r => r.horizons[h]), ev = cells.filter(c => c.status === 'evaluated');
      return [h, {evaluated: ev.length, pending: cells.length - ev.length, meanAPE: mean(ev.map(c => c.ape)), correct: ev.filter(c => c.directionCorrect === true).length, wrong: ev.filter(c => c.directionCorrect === false).length, flatActual: ev.filter(c => c.observedDirection === 'flat').length, coverage: mean(ev.filter(c => c.covered != null).map(c => Number(c.covered))), meanIntervalScore: mean(ev.map(c => c.intervalScore).filter(finite)), meanBandWidthPct: mean(ev.filter(c => finite(c.lower) && finite(c.upper)).map(c => (c.upper - c.lower) / c.actual * 100)), meanBrier: mean(ev.map(c => c.brier).filter(finite)), lists: {correct: ev.filter(c => c.directionCorrect === true).map(c => c.code), wrong: ev.filter(c => c.directionCorrect === false).map(c => c.code), flat: ev.filter(c => c.observedDirection === 'flat').map(c => c.code), unevaluable: cells.filter(c => c.status !== 'evaluated').map(c => ({code: c.code, reason: c.reason}))}}];
    }));
    return {date: d.date, rows, horizonSummary};
  });
  const firstLive = live.map(p => p.futureDates?.[0]).filter(Boolean).sort()[0] ?? null;
  // 채점 예정표: 실시간 발행본의 발행 세션(코호트)에서 1·5·10·20거래일 뒤 목표일 — 같은 코호트는 먼저 발행한 것을 쓴다
  const sessions = (calendar ?? input.calendar).sessions, closeInstant = d => Date.parse(d + 'T15:30:00+09:00');
  const cohortOf = p => { const at = p.issuedAt, day = new Date(Date.parse(at) + 9 * 3600000).toISOString().slice(0, 10); return sessions.includes(day) && Date.parse(at) >= closeInstant(day) ? day : null; };
  const firstByCohort = new Map();
  for (const p of [...live].sort((a, b) => Date.parse(a.issuedAt) - Date.parse(b.issuedAt))) { const c = cohortOf(p); if (c && !firstByCohort.has(c)) firstByCohort.set(c, p); }
  const schedule = [];
  for (const [cohort, p] of firstByCohort) { const i = sessions.indexOf(cohort); for (const h of H) { const target = sessions[i + h]; if (!target || (until && target > until)) continue; schedule.push({targetDate: target, horizon: h, originDate: cohort, forecastId: p.forecastId ?? p.id, status: target <= record.targetDate ? 'due' : 'pending'}); } }
  schedule.sort((a, b) => a.targetDate.localeCompare(b.targetDate) || a.horizon - b.horizon);
  return {schema: 'atlas11-scoreboard-1', generatedAt: now, actualAsOf: input.actualAsOf, targetDate: record.targetDate, delta, intervalNominalCoverage: 0.8, livePublications: live.map(p => ({forecastId: p.forecastId ?? p.id, schema: p.schema, issuedAt: p.issuedAt, actualAsOf: p.actualAsOf, firstTarget: p.futureDates?.[0] ?? null})).filter(x => !until || !x.firstTarget || x.firstTarget <= until), excluded, firstScorableDate: firstLive, schedule, scoredDates: byDate.filter(d => Object.values(d.horizonSummary).some(h => h.evaluated > 0)).length, byDate, horizons: [...H], stockRowsAreIndependent: false, cohortBasis: record.cohortBasis, selection: record.selection, sourceScoreId: record.scoreId};
}
