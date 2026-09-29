/**
 * ATLAS 11 · 정답·오답 채점(모든 발행본 · 모든 목표일)과 원인 분석
 *  - 채점 정책은 config/atlas11/scoring-policy.v1.json 에 결과를 보기 전에 고정했다. 이 파일은 그 정책을 읽기만 한다.
 *  - 셀 = (발행본, 종목, 목표일). 실제 종가가 확정된 목표일만 채점하고, 목표일 전·미확정·자료 부족은 「평가 보류」로 센다.
 *  - 원인 분석은 「확인된 사실 / 모형 내부 기여 / 원인 가설 / 미확인」을 갈라 적는다. 인과 확정이 아니다.
 *    실제 움직임 = 시장 통로(β × 52종목 평균 누적수익률) + 고유 몫(나머지). 설명 못 한 몫은 미설명으로 남긴다.
 */
import {isLivePublication} from './score.mjs';

const finite = x => typeof x === 'number' && Number.isFinite(x);
const mean = a => a.length ? a.reduce((s, x) => s + x, 0) / a.length : null;
const iso = x => typeof x === 'string' && Number.isFinite(Date.parse(x));
const closeInstant = d => Date.parse(d + 'T15:30:00+09:00');
const deadline = d => Date.parse(d + 'T16:00:00+09:00');
export const koreaDay = at => new Date(Date.parse(at) + 9 * 3600000).toISOString().slice(0, 10);
const pct = (x, d = 2) => finite(x) ? (x > 0 ? '+' : '') + (x * 100).toFixed(d) + '%' : '미산출';
const won = x => finite(x) ? Math.round(x).toLocaleString('ko-KR') + '원' : '미산출';
const DIR_WORD = {up: '상승', flat: '보합', down: '하락'};

export function directionOf(r, delta) { return r > delta ? 'up' : r < -delta ? 'down' : 'flat'; }
export function toleranceFor(policy, horizon) {
  const t = policy.priceHitTolerancePct, keys = [1, 5, 10, 20];
  if (t[String(horizon)] != null) return t[String(horizon)];
  const lo = keys.filter(k => k < horizon).at(-1), hi = keys.find(k => k > horizon);
  if (lo == null) return t['1']; if (hi == null) return t['20'];
  return t[String(lo)] + (t[String(hi)] - t[String(lo)]) * (horizon - lo) / (hi - lo);
}
export function classify({directionCorrect, priceHit, evaluable}) {
  if (!evaluable) return {class: 5, classLabel: '평가 보류'};
  if (directionCorrect && priceHit) return {class: 1, classLabel: '방향·크기 모두 맞음'};
  if (directionCorrect) return {class: 2, classLabel: '방향 맞고 크기 틀림'};
  if (priceHit) return {class: 3, classLabel: '크기 허용·방향 틀림'};
  return {class: 4, classLabel: '방향·크기 모두 틀림'};
}
function explicitFinality(row, date) { return row.finalClose === true && iso(row.finalizedAt) && Date.parse(row.finalizedAt) >= closeInstant(date) && Date.parse(row.finalizedAt) <= Date.parse(row.observedAt) && /^https:\/\//.test(row.finalitySourceUrl ?? '') && typeof row.finalityBasis === 'string' && row.finalityBasis.trim().length > 0; }
function rowDirection(r) { return r.direction?.cumulative ?? r.wave?.horizon ?? null; }

/** 모든 발행본의 모든 목표일을 채점한다. publications 에는 그림자 발행본(publicationStatus 'shadow_forecast')도 넣을 수 있다. */
export function scoreAllPublications(publications, input, {calendar, now = new Date().toISOString(), policy, groupOf = () => null}) {
  const sessions = calendar?.sessions ?? input.calendar.sessions, today = koreaDay(now), delta = policy.flatDelta;
  const cutoff = sessions.filter(d => d < today || (d === today && Date.parse(now) >= closeInstant(d))).at(-1) ?? null;
  const cells = [], pending = [];
  for (const p of publications) {
    if (!p?.assets || !iso(p.issuedAt) || Date.parse(p.issuedAt) > Date.parse(now) || p.status === 'discarded') continue;
    const shadow = p.publicationStatus === 'shadow_forecast', live = shadow || isLivePublication(p);
    const forecastId = p.forecastId ?? p.id, modelVersion = p.modelVersion ?? 'atlas-rolling20-A', kind = shadow ? 'shadow' : live ? 'live' : 'reference';
    for (const a of p.assets) {
      const asset = input.assets.find(x => x.code === a.code); if (!asset) continue;
      const anchorClose = a.anchor?.close ?? a.rows?.[0]?.p50; if (!finite(anchorClose)) continue;
      const rows = (a.rows ?? []).filter(r => !r.anchor && r.date > p.actualAsOf);
      rows.forEach((r, k) => {
        const horizon = k + 1, targetDate = r.date, base = {forecastId, modelVersion, kind, shadowOf: p.shadowOf ?? null, issuedAt: p.issuedAt, originDate: p.actualAsOf, anchor: anchorClose, code: a.code, name: a.name ?? asset.name, group: groupOf(a.code), targetDate, horizon};
        if (!cutoff || targetDate > cutoff) { pending.push({...base, reason: '목표일 전'}); return; }
        if (Date.parse(p.issuedAt) >= closeInstant(targetDate)) { pending.push({...base, reason: '발행 뒤 목표만 채점(목표일 마감 후 발행)'}); return; }
        const actualRow = asset.prices.find(x => x.date === targetDate), actual = actualRow?.close;
        if (!finite(actual) || actual <= 0 || actualRow.quality === 'conflict') { pending.push({...base, reason: '실제 종가 미확보'}); return; }
        if (iso(actualRow.observedAt) && Date.parse(actualRow.observedAt) > Date.parse(now)) { pending.push({...base, reason: '실제값 관측 시각이 미래'}); return; }
        if (targetDate === today && (!iso(actualRow.observedAt) || Date.parse(actualRow.observedAt) < closeInstant(targetDate) || (Date.parse(actualRow.observedAt) < deadline(targetDate) && !explicitFinality(actualRow, targetDate)))) { pending.push({...base, reason: '오늘 종가 확정 증거 없음'}); return; }
        const p50 = r.p50 ?? r.forecast ?? r.value, lower = r.lower ?? r.p10, upper = r.upper ?? r.p90;
        if (!finite(p50) || p50 <= 0) { pending.push({...base, reason: '예측값 없음'}); return; }
        const actualReturn = actual / anchorClose - 1, predictedReturn = p50 / anchorClose - 1, d = rowDirection(r);
        const predictedDirection = d?.selected ?? directionOf(predictedReturn, delta), actualDirection = directionOf(actualReturn, delta), probabilities = d?.probabilities ?? null;
        const ape = Math.abs(p50 - actual) / actual * 100, tolerancePct = toleranceFor(policy, horizon), priceHit = ape <= tolerancePct;
        const bandValid = finite(lower) && finite(upper) && lower <= upper, covered = bandValid ? actual >= lower && actual <= upper : null;
        const alpha = policy.interval.alpha, intervalScore = bandValid ? (upper - lower) + (actual < lower ? 2 / alpha * (lower - actual) : 0) + (actual > upper ? 2 / alpha * (actual - upper) : 0) : null;
        const brier = probabilities ? ['up', 'flat', 'down'].reduce((s, c) => s + ((probabilities[c] ?? 0) - (actualDirection === c ? 1 : 0)) ** 2, 0) : null;
        const cls = classify({directionCorrect: predictedDirection === actualDirection, priceHit, evaluable: true});
        cells.push({...base, evaluable: true, predicted: {p05: r.p05 ?? null, p10: lower, p25: r.p25 ?? null, p50, p75: r.p75 ?? null, p90: upper, p95: r.p95 ?? null}, actual, priceError: p50 - actual, ape, tolerancePct, priceHit, predictedReturn, actualReturn, predictedDirection, actualDirection, directionCorrect: predictedDirection === actualDirection, lower: bandValid ? lower : null, upper: bandValid ? upper : null, covered, bandWidthPct: bandValid ? (upper - lower) / anchorClose * 100 : null, intervalScore, intervalScoreRel: intervalScore != null ? intervalScore / anchorClose : null, probabilities, brier, ...cls, closeCall: d?.closeCall ?? null, actualEvidence: {sourceUrl: actualRow.sourceUrl ?? null, rawHash: actualRow.rawHash ?? null, observedAt: actualRow.observedAt ?? null, finalClose: actualRow.finalClose === true}, revisions: (input.priceRevisions ?? []).filter(x => x.code === a.code && x.date === targetDate).length, scoredAt: now, policyVersion: policy.version});
      });
    }
  }
  return {cutoff, cells, pending, counts: summarizeCounts(cells, pending)};
}

export function summarizeCounts(cells, pending) {
  const byClass = {}; for (const c of cells) byClass[c.classLabel] = (byClass[c.classLabel] ?? 0) + 1;
  const reasons = {}; for (const p of pending) reasons[p.reason] = (reasons[p.reason] ?? 0) + 1;
  const live = cells.filter(c => c.kind === 'live');
  return {evaluated: cells.length, evaluatedLive: live.length, pending: pending.length, uniqueTargetDates: new Set(live.map(c => c.targetDate)).size, uniqueOriginDates: new Set(live.map(c => c.originDate)).size, byClass, exclusionReasons: reasons, independentTrials: false, note: '52종목×20일은 독립 시험이 아니다 · 고유 거래일 수를 함께 본다'};
}

/** 요약 성적표(발행본 종류·기간별) */
export function summarizeCells(cells, {policy}) {
  const out = {};
  for (const kind of ['live', 'shadow', 'reference']) {
    const set = cells.filter(c => c.kind === kind); if (!set.length) continue;
    out[kind] = {n: set.length, byHorizon: {}};
    for (const h of [1, 5, 10, 20]) { const s = set.filter(c => c.horizon === h); if (!s.length) continue; out[kind].byHorizon[h] = {n: s.length, uniqueDates: new Set(s.map(c => c.targetDate)).size, meanAPE: mean(s.map(c => c.ape)), directionAccuracy: mean(s.map(c => Number(c.directionCorrect))), priceHitRate: mean(s.map(c => Number(c.priceHit))), coverage80: mean(s.filter(c => c.covered != null).map(c => Number(c.covered))), meanIntervalScoreRel: mean(s.map(c => c.intervalScoreRel).filter(finite)), meanBrier: mean(s.map(c => c.brier).filter(finite)), meanBandWidthPct: mean(s.map(c => c.bandWidthPct).filter(finite)), byClass: Object.fromEntries(policy.classes.map(k => [k.label, s.filter(c => c.classLabel === k.label).length]))}; }
  }
  return out;
}

/* ---------------- 원인 분석 ---------------- */
function basketLogByDate(input, sessions) {
  const maps = input.assets.map(a => new Map(a.prices.map(p => [p.date, p.quality === 'conflict' ? null : p.close])));
  const out = new Map(); for (let j = 1; j < sessions.length; j++) { const rs = maps.map(m => { const a = m.get(sessions[j]), b = m.get(sessions[j - 1]); return finite(a) && finite(b) && a > 0 && b > 0 ? Math.log(a / b) : null; }); out.set(sessions[j], rs.every(finite) ? {basket: mean(rs), breadth: mean(rs.map(r => r > 0 ? 1 : r < 0 ? -1 : 0)), up: rs.filter(r => r > 0).length, down: rs.filter(r => r < 0).length} : null); }
  return out;
}
function cumulativeExpected(asset, horizon) {
  const rows = (asset.rows ?? []).filter(r => !r.anchor).slice(0, horizon), contrib = {}; let mu = 0, intercept = 0, have = false;
  for (const r of rows) { const f = r.factor36; if (!f) continue; have = true; mu += f.meanLogReturn ?? 0; intercept += f.intercept ?? 0; for (const [k, v] of Object.entries(f.contributions ?? {})) contrib[k] = (contrib[k] ?? 0) + (v ?? 0); }
  return have ? {mu, intercept, contrib} : null;
}

/** 셀 하나의 원인 분석. ctx: {publication(asset 포함), input, sessions, basketLog, network, groupResidual, delta} */
export function analyzeCell(cell, ctx) {
  const {input, sessions, basketLog, network, delta} = ctx, pub = ctx.publicationsById.get(cell.forecastId), asset = pub?.assets?.find(a => a.code === cell.code);
  const i0 = sessions.indexOf(cell.originDate), i1 = sessions.indexOf(cell.targetDate), window = i0 >= 0 && i1 > i0 ? sessions.slice(i0 + 1, i1 + 1) : [];
  const basketCum = window.length && window.every(d => basketLog.get(d)) ? window.reduce((s, d) => s + basketLog.get(d).basket, 0) : null;
  const node = network?.nodes?.find(n => n.code === cell.code), beta = node?.beta ?? null;
  const R = Math.log(cell.actual / cell.anchor), M = Math.log(cell.predicted.p50 / cell.anchor), E = M - R;
  const marketPart = finite(basketCum) && finite(beta) ? beta * basketCum : null, residualPart = finite(marketPart) ? R - marketPart : null;
  const marketShare = finite(marketPart) ? Math.abs(marketPart) / (Math.abs(marketPart) + Math.abs(residualPart) || 1) : null;
  const exp = asset ? cumulativeExpected(asset, cell.horizon) : null;
  const events = (asset?.news ?? []).filter(n => n.date > cell.originDate && n.date <= cell.targetDate);
  const companyEvents = events.filter(n => n.scope?.type === 'company'), importantEvents = events.filter(n => n.important);
  const facts = [`출발가 ${won(cell.anchor)}(${cell.originDate}) → 실제 ${won(cell.actual)}(${cell.targetDate}, ${cell.horizon}거래일) ${pct(cell.actualReturn)} · 예측 중앙 ${won(cell.predicted.p50)} ${pct(cell.predictedReturn)} · 오차 ${pct(Math.expm1(E))}(절대 오차율 ${cell.ape.toFixed(2)}%, 허용 ${cell.tolerancePct}%)`,
    `방향: 예측 ${DIR_WORD[cell.predictedDirection]}${cell.probabilities ? `(${(cell.probabilities[cell.predictedDirection] * 100).toFixed(0)}%)` : ''} · 실제 ${DIR_WORD[cell.actualDirection]} → ${cell.directionCorrect ? '정답' : '오답'} · 80% 띠 ${cell.covered == null ? '없음' : cell.covered ? '담김' : '벗어남'}(폭 ${cell.bandWidthPct?.toFixed(1)}%)`];
  if (finite(basketCum)) facts.push(`같은 기간 52종목 평균 ${pct(Math.expm1(basketCum))} · 이 종목 시장 베타 ${beta.toFixed(2)} → 시장 통로 몫 ${pct(Math.expm1(marketPart))}, 고유 몫 ${pct(Math.expm1(residualPart))}`);
  if (events.length) facts.push(`기간 안 확인된 일정 ${events.length}건(기업 ${companyEvents.length} · 중요 ${importantEvents.length}): ${events.slice(0, 3).map(e => e.name).join(', ')}${events.length > 3 ? ' …' : ''} — 수치 영향은 미산출`);
  if (cell.revisions) facts.push(`실제값 정정 이력 ${cell.revisions}건`);
  if (cell.actualEvidence?.observedAt && Date.parse(cell.actualEvidence.observedAt) > deadline(cell.targetDate)) facts.push(`실제 종가 관측 시각 ${cell.actualEvidence.observedAt}(16:00 KST 이후 · 지연 관측)`);
  const modelContribution = [];
  if (exp) { const parts = Object.entries(exp.contrib).map(([k, v]) => `${k === 'F35' ? '자기 추세' : k === 'F11' ? '52종목 폭·평균' : k} ${pct(Math.expm1(v))}`); modelContribution.push(`선택 모형의 기대 누적 ${pct(Math.expm1(exp.mu))} = 절편 ${pct(Math.expm1(exp.intercept))}${parts.length ? ' + ' + parts.join(' + ') : ''} · 실제 ${pct(Math.expm1(R))}`); const wrong = Object.entries(exp.contrib).filter(([, v]) => Math.abs(v) > 1e-6 && Math.sign(v) !== Math.sign(R - exp.intercept)); if (wrong.length) modelContribution.push(`실제 방향과 반대로 기여한 항: ${wrong.map(([k]) => k).join(', ')} (모형 내부 설명 · 인과 아님)`); }
  else modelContribution.push('모형 기여 분해 없음(발행본에 기여 항목 없음)');
  const hypotheses = [], causes = [];
  const push = (category, evidence, counterEvidence, strength) => { hypotheses.push({category, evidence, counterEvidence, strength}); if (!causes.includes(category)) causes.push(category); };
  if (!cell.directionCorrect || !cell.priceHit) {
    if (finite(marketPart) && marketShare >= 0.5 && Math.sign(marketPart) === Math.sign(R) && Math.sign(R) !== Math.sign(M - 0)) push('시장 상태', `실제 움직임의 ${(marketShare * 100).toFixed(0)}%가 시장 통로(52종목 평균 ${pct(Math.expm1(basketCum))} × β ${beta.toFixed(2)})`, '시장 = 52종목 평균이지 코스피가 아님 · 방향 확률은 모형 빈도', marketShare >= 0.7 ? '강' : '중');
    const g = ctx.groupResidual.get(`${cell.originDate}|${cell.targetDate}|${cell.group}`);
    if (g && g.n >= 3 && finite(residualPart) && Math.abs(g.mean) > 0.01 && Math.sign(g.mean) === Math.sign(residualPart)) push('업종 변화', `같은 묶음 ${g.n}종목의 고유 몫 평균 ${pct(Math.expm1(g.mean))}(같은 부호 ${g.sameSign}/${g.n})`, '묶음은 편집 분류 · 공식 업종지수 아님', g.sameSign / g.n >= 0.7 ? '중' : '약');
    if (companyEvents.length) push('기업 사건', `기간 안 기업 일정 ${companyEvents.map(e => e.name).join(', ')}`, '일정 확인만 · 결과·가격 반응·수치 영향 미산출 → 인과 단정 불가', '약');
    if (cell.covered === false) push('변동성·범위', `실제값이 80% 띠 밖(폭 ${cell.bandWidthPct?.toFixed(1)}% · 실제 이동 ${pct(cell.actualReturn)})`, '80% 띠는 명목이며 개별 셀의 벗어남은 정상 범위일 수 있음(담김률로 판단)', '중');
    if (cell.revisions) push('자료 오류', `실제값 정정 ${cell.revisions}건`, '정정 뒤 값으로 채점됨', '약');
    if (finite(marketPart) && marketShare < 0.5 && Math.abs(residualPart) > Math.abs(E) * 0.5) push('미설명', `고유 몫 ${pct(Math.expm1(residualPart))}이 오차의 대부분 · 가격 자료만으로 원인 특정 불가`, '수급·심리·공시 자료 미확보', '강');
    if (!hypotheses.length) push('미설명', '가격·일정 자료로 설명되는 원인 후보 없음', '수급·심리·과열 자료 미확보', '강');
  }
  const unverified = ['수급(외국인·기관·개인)·심리·과열·영향 시차·요인 중복·가중치는 이 셀에서 검증 자료 없음(실험 기록·시간순 검증에서만 판단)'];
  if (!finite(beta)) unverified.unshift('시장 베타 없음 → 시장/고유 몫 분해 미실시');
  const lucky = cell.directionCorrect && finite(marketPart) && marketShare >= 0.7 && Math.sign(residualPart) !== Math.sign(R);
  const reasonable = !cell.directionCorrect && cell.covered === true;
  return {code: cell.code, name: cell.name, group: cell.group, forecastId: cell.forecastId, modelVersion: cell.modelVersion, kind: cell.kind, originDate: cell.originDate, targetDate: cell.targetDate, horizon: cell.horizon, class: cell.class, classLabel: cell.classLabel, directionCorrect: cell.directionCorrect, priceHit: cell.priceHit, covered: cell.covered, ape: cell.ape,
    decomposition: {realizedLog: R, predictedLog: M, errorLog: E, basketCumLog: basketCum, beta, marketPartLog: marketPart, residualPartLog: residualPart, marketShare, unexplainedShare: finite(marketShare) ? 1 - marketShare : null},
    facts, modelContribution, hypotheses, unverified, causes: causes.length ? causes : (cell.class === 1 ? [] : ['미설명']),
    flags: {luckySuspect: lucky, reasonableProcess: reasonable, luckyNote: lucky ? '방향은 맞았지만 시장 통로 몫이 크고 고유 몫은 반대 방향 → 상쇄·우연 가능성' : null, reasonableNote: reasonable ? '방향은 틀렸지만 실제값이 모형 80% 띠 안 → 판단 과정은 분포 안' : null},
    labels: {confirmedFacts: facts, modelInternal: modelContribution, causeHypotheses: hypotheses.map(h => h.category), unverified}};
}

/** 셀 묶음 분석: 그룹 잔차 평균 등 상호 참조를 먼저 만들고 셀별 분석 + 날짜 총괄 */
export function analyzeCells(cells, {publications, input, calendar, network = null, delta = 0.001, horizons = [1, 5, 10, 20]}) {
  const sessions = calendar?.sessions ?? input.calendar.sessions, basketLog = basketLogByDate(input, sessions);
  const publicationsById = new Map(publications.map(p => [p.forecastId ?? p.id, p]));
  const live = cells.filter(c => c.kind === 'live' && horizons.includes(c.horizon));
  // 묶음별 고유 몫 평균(같은 기준일·목표일)
  const groupResidual = new Map();
  for (const c of live) {
    const node = network?.nodes?.find(n => n.code === c.code), i0 = sessions.indexOf(c.originDate), i1 = sessions.indexOf(c.targetDate), w = i0 >= 0 && i1 > i0 ? sessions.slice(i0 + 1, i1 + 1) : [];
    const b = w.length && w.every(d => basketLog.get(d)) ? w.reduce((s, d) => s + basketLog.get(d).basket, 0) : null;
    if (!finite(b) || !finite(node?.beta)) continue;
    const key = `${c.originDate}|${c.targetDate}|${c.group}`, res = Math.log(c.actual / c.anchor) - node.beta * b;
    const g = groupResidual.get(key) ?? {n: 0, sum: 0, sameSign: 0, vals: []}; g.n++; g.sum += res; g.vals.push(res); groupResidual.set(key, g);
  }
  for (const g of groupResidual.values()) { g.mean = g.sum / g.n; g.sameSign = g.vals.filter(v => Math.sign(v) === Math.sign(g.mean)).length; }
  const ctx = {input, sessions, basketLog, network, groupResidual, delta, publicationsById};
  return live.map(c => analyzeCell(c, ctx));
}

/** 날짜 총괄(종목·묶음·시장) */
export function aggregateAnalysis(date, cellAnalyses, cells, {input, calendar, groups = []}) {
  const sessions = calendar?.sessions ?? input.calendar.sessions, basketLog = basketLogByDate(input, sessions), m = basketLog.get(date);
  // 대표 성적: 같은 (종목·목표일·기간)은 가장 먼저 발행된 실시간 발행본 하나만 센다 — 같은 날 여러 발행본을 겹쳐 세지 않는다
  const firstByKey = new Map();
  for (const c of cells.filter(c => c.kind === 'live' && c.targetDate === date).sort((x, y) => Date.parse(x.issuedAt) - Date.parse(y.issuedAt) || String(x.forecastId).localeCompare(String(y.forecastId)))) { const k = c.code + '|' + c.horizon; if (!firstByKey.has(k)) firstByKey.set(k, c); }
  const live = [...firstByKey.values()], headlineIds = new Set(live.map(c => c.forecastId));
  const an = cellAnalyses.filter(a => a.targetDate === date && (a.cellKind ?? a.kind) === 'live' && headlineIds.has(a.forecastId) && live.some(c => c.code === a.code && c.horizon === a.horizon && c.forecastId === a.forecastId));
  const byClass = {}; for (const c of live) byClass[c.classLabel] = (byClass[c.classLabel] ?? 0) + 1;
  const causeCounts = {}; for (const a of an) for (const c of a.causes) causeCounts[c] = (causeCounts[c] ?? 0) + 1;
  const byGroup = groups.map(g => { const s = live.filter(c => c.group === g.id); return s.length ? {group: g.id, groupName: g.name, n: s.length, directionAccuracy: mean(s.map(c => Number(c.directionCorrect))), meanAPE: mean(s.map(c => c.ape)), meanSignedErrorPct: mean(s.map(c => (c.predicted.p50 / c.actual - 1) * 100))} : null; }).filter(Boolean);
  const byHorizon = Object.fromEntries([1, 5, 10, 20].map(h => { const s = live.filter(c => c.horizon === h); return [h, s.length ? {n: s.length, directionAccuracy: mean(s.map(c => Number(c.directionCorrect))), priceHitRate: mean(s.map(c => Number(c.priceHit))), meanAPE: mean(s.map(c => c.ape)), coverage80: mean(s.filter(c => c.covered != null).map(c => Number(c.covered))), meanBrier: mean(s.map(c => c.brier).filter(finite))} : null]; }));
  const movers = input.assets.map(a => { const i = sessions.indexOf(date); const p = a.prices.find(x => x.date === date)?.close, q = i > 0 ? a.prices.find(x => x.date === sessions[i - 1])?.close : null; return finite(p) && finite(q) ? {code: a.code, name: a.name, change: p / q - 1} : null; }).filter(Boolean).sort((x, y) => Math.abs(y.change) - Math.abs(x.change));
  const unexplained = an.map(a => a.decomposition.unexplainedShare).filter(finite);
  const publicationsScored = [...new Set(cells.filter(c => c.kind === 'live' && c.targetDate === date).map(c => c.forecastId))];
  return {date, headlineRule: '같은 종목·목표일·기간은 가장 먼저 발행된 실시간 발행본 하나만 · 52종목은 독립 시험이 아님', headlinePublications: [...headlineIds], publicationsScored, uniqueStocks: new Set(live.map(c => c.code)).size, market: m ? {basketReturn: Math.expm1(m.basket), breadth: m.breadth, up: m.up, down: m.down, flat: 52 - m.up - m.down} : null, topMovers: movers.slice(0, 5), evaluated: live.length, byClass, byHorizon, byGroup, causeCounts,
    right: live.filter(c => c.class === 1).map(c => ({code: c.code, name: c.name, horizon: c.horizon, ape: c.ape})).sort((a, b) => a.ape - b.ape).slice(0, 5),
    wrong: live.filter(c => c.class === 4).map(c => ({code: c.code, name: c.name, horizon: c.horizon, ape: c.ape, causes: an.find(a => a.code === c.code && a.horizon === c.horizon)?.causes ?? []})).sort((a, b) => b.ape - a.ape).slice(0, 5),
    unexplainedMeanShare: unexplained.length ? mean(unexplained) : null, luckySuspects: an.filter(a => a.flags.luckySuspect).length, reasonableMisses: an.filter(a => a.flags.reasonableProcess).length};
}

/** 일일 보고 여섯 문장 — 숫자는 단위와 함께, 없는 것은 「없음」 */
export function sixSentences({date, aggregate, counts, experiments = {}, nextTargets = [], collection = null, forecast = null, pendingReasons = {}}) {
  const a = aggregate, m = a?.market;
  const marketDate = a?.date ?? date, stale = marketDate !== date;
  const market = m ? `${kdate(marketDate)}${stale ? '(마지막 확정 거래일)' : ''} 52종목 평균 ${pct(m.basketReturn)}, 상승 ${m.up}·하락 ${m.down}·보합 ${m.flat}종목. 가장 크게 움직인 종목 ${a.topMovers.slice(0, 3).map(x => `${x.name} ${pct(x.change)}`).join(', ')}.${stale ? ` 오늘(${kdate(date)}) 종가는 ${collection ? (collection.attempted ? `수집을 시도했으나 ${collection.errors?.length ?? 0}건 오류로` : '수집기가 닿지 못해') : '마감 전이라'} 아직 미확정.` : ''}` : `${kdate(date)} 52종목 종가가 아직 확정되지 않아 시장 변화를 적지 못했습니다${collection?.delayed ? '(수집 지연)' : ''}.`;
  const h1 = a?.byHorizon?.[1], h5 = a?.byHorizon?.[5];
  const didWell = a?.evaluated ? `채점 ${a.evaluated}건(대표 발행본 ${a.headlinePublications?.length ?? 1}개 기준 · 같은 날 다른 발행본 ${Math.max(0, (a.publicationsScored?.length ?? 1) - (a.headlinePublications?.length ?? 1))}개는 겹쳐 세지 않음) 중 방향·크기 모두 맞음 ${a.byClass['방향·크기 모두 맞음'] ?? 0}건, 방향만 맞음 ${a.byClass['방향 맞고 크기 틀림'] ?? 0}건${h1 ? ` · 1일 전망 방향 정답률 ${(h1.directionAccuracy * 100).toFixed(0)}%(${h1.n}종목 · 하루치라 우연 폭이 큼), 평균 오차 ${h1.meanAPE.toFixed(2)}%` : ''}${h5 ? ` · 5일 ${(h5.directionAccuracy * 100).toFixed(0)}%` : ''}. 잘 맞은 예: ${a.right.slice(0, 3).map(r => `${r.name} ${r.horizon}일 오차 ${r.ape.toFixed(2)}%`).join(', ') || '없음'}.` : `오늘 채점된 전망이 없습니다(${Object.entries(pendingReasons).map(([k, v]) => `${k} ${v}건`).join(', ') || '목표일 전'}). 첫 채점은 발행 다음 거래일 종가부터입니다.`;
  const didWrong = a?.evaluated ? `방향·크기 모두 틀림 ${a.byClass['방향·크기 모두 틀림'] ?? 0}건, 크기만 틀림 ${a.byClass['크기 허용·방향 틀림'] ?? 0}건. 원인 가설 상위: ${Object.entries(a.causeCounts).sort((x, y) => y[1] - x[1]).slice(0, 3).map(([k, v]) => `${k} ${v}건`).join(', ') || '없음'}. 크게 틀린 예: ${a.wrong.slice(0, 3).map(w => `${w.name} ${w.horizon}일 오차 ${w.ape.toFixed(2)}%(${w.causes.join('·') || '미설명'})`).join(', ') || '없음'}.` : '틀린 판단도 아직 없습니다(채점 전).';
  const unexplained = a?.evaluated ? `실제 움직임 중 시장 통로(52종목 평균×베타)로 설명되지 않는 고유 몫이 평균 ${a.unexplainedMeanShare != null ? (a.unexplainedMeanShare * 100).toFixed(0) + '%' : '미산출'}이며, 이 몫의 원인(수급·심리·공시 결과)은 자료가 없어 미설명으로 남깁니다. 우연 의심(시장 통로로만 맞음) ${a.luckySuspects}건, 틀렸지만 띠 안 ${a.reasonableMisses}건.` : '설명할 대상(채점 결과)이 아직 없습니다.';
  const exp = experiments;
  const experimentsLine = `시간순 검증 완료 후보 ${exp.backtested ?? 0}개(누적 ${exp.totalBacktested ?? 0}) · 채택 ${exp.adopted ?? 0} · 기각 ${exp.rejected ?? 0} · 실전 관찰 중 ${exp.observing ?? 0} · 복귀 ${exp.rolledBack ?? 0}${exp.note ? ' · ' + exp.note : ''}. 운영 모델 ${exp.operatingVersion ?? '미기록'}${exp.changed ? '(오늘 교체)' : '(변경 없음)'}.`;
  const due = nextTargets.filter(t => !t.backlog), backlog = nextTargets.find(t => t.backlog);
  const next = (due.length ? `${due[0].date === date ? '오늘' : '다음 거래일'} ${kdate(due[0].date)} 종가로 ${due.map(t => `${t.count}건(${t.horizons.join('·')}일 목표${t.publications ? ` · 발행본 ${t.publications}개` : ''})`).join(', ')} 채점 예정${forecast?.forecastId ? ` · 최근 발행본 ${forecast.forecastId.slice(0, 26)}…의 D+1 확인` : ''}${exp.observing ? ' · 그림자 후보 성적 비교' : ''}.` : '다음 거래일 채점 예정 목표가 없습니다.') + (backlog ? ` 종가를 못 받아 밀린 ${backlog.count}건(${backlog.dates.map(kdate).join('·')} · ${backlog.horizons.join('·')}일)은 종가가 들어오면 그때 채점.` : '');
  return {marketChange: market, didWell, didWrong, unexplained, experiments: experimentsLine, nextCheck: next};
}

const kdate = d => { const [y, m, dd] = String(d).split('-'); return dd ? `${Number(m)}월 ${Number(dd)}일` : d; };
