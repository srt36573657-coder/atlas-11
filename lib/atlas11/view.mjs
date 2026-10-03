/**
 * ATLAS 11 · 화면 묶음 — 모든 화면이 같은 발행본(forecastId)에 연결된다.
 * 큰 발행본을 화면별 작은 파일로 나누고, 화면 사이 수치가 일치하는지 검사한다.
 */
import {createHash} from 'node:crypto';
import {explainAsset, observedState, originInputs} from './explain.mjs';
import {buildRace} from './race.mjs';
import {buildScoreboard} from './score.mjs';
import {buildMisses} from './misses.mjs';
import {buildScoreCells, validateScoreCells} from './score_cells.mjs';
import {SIMULATION_POLICY} from './simulate.mjs';
import {buildNetwork, stockStats} from './network.mjs';
import {makeGroupOf} from './groups.mjs';
import {loadHorizon, offNote} from './horizon.mjs';

const sha = x => createHash('sha256').update(x).digest('hex');
const finite = x => typeof x === 'number' && Number.isFinite(x);
const round = (x, d = 6) => finite(x) ? Number(x.toFixed(d)) : null;

function slimRow(r) {
  return {date: r.date, p05: round(r.p05, 2), p10: round(r.p10, 2), p25: round(r.p25, 2), p50: round(r.p50, 2), p75: round(r.p75, 2), p90: round(r.p90, 2), p95: round(r.p95, 2), mean: round(r.mean, 2), return: round(r.return), dailyP50Change: round(r.dailyP50Change), lossPathShare: round(r.lossPathShare, 4), anchor: r.anchor === true, eventIds: r.eventIds ?? [],
    direction: r.direction ? {daily: dirSlim(r.direction.daily), cumulative: dirSlim(r.direction.cumulative)} : null,
    dailyMovement: r.dailyMovement ? {meanLogReturn: round(r.dailyMovement.meanLogReturn), returnP10: round(r.dailyMovement.returnP10), returnP50: round(r.dailyMovement.returnP50), returnP90: round(r.dailyMovement.returnP90)} : null,
    contributions: r.factor36 ? {intercept: round(r.factor36.intercept, 8), meanLogReturn: round(r.factor36.meanLogReturn, 8), byFactor: Object.fromEntries(Object.entries(r.factor36.contributions).map(([k, v]) => [k, round(v, 8)])), shares: Object.fromEntries(Object.entries(r.factor36.shares ?? {}).map(([k, v]) => [k, round(v, 2)]))} : null};
}
/** 통계적 동률: 1·2위 확률 차이가 두 확률의 몬테카를로 표준오차 합(2σ)보다 작으면 「모형 안에서도 못 가른다」 */
function statisticalTie(d, paths) { if (!d || !paths) return null; const p1 = d.probabilities[d.selected], p2 = d.probabilities[d.runnerUp ?? ['flat', 'up', 'down'].filter(k => k !== d.selected).sort((a, b) => d.probabilities[b] - d.probabilities[a])[0]]; const se = Math.sqrt(p1 * (1 - p1) / paths + p2 * (1 - p2) / paths); return (p1 - p2) < 2 * se; }
let CURRENT_PATHS = 20000;
function dirSlim(d) { return d ? {selected: d.selected, probabilities: {up: round(d.probabilities.up, 5), flat: round(d.probabilities.flat, 5), down: round(d.probabilities.down, 5)}, closeCall: d.closeCall === true, exactTie: d.exactTie === true, statisticalTie: statisticalTie(d, CURRENT_PATHS), runnerUpGap: round(d.runnerUpGap, 5), monteCarloSE: round(d.monteCarloSE, 6)} : null; }

/**
 * 「내일 하루만」(사장님 명령 2026-10-02 00:08 KST · config/atlas11/horizon.json futureDays 1)
 *   화면 묶음에 쓰는 발행본을 「출발 + 내일(= futureDates[0])」 한 칸으로 줄인다.
 *   옛 20거래일 발행본이면 첫 미래 거래일만 남기고, 새 1거래일 발행본(contract.md §1)이면 그대로다(같은 결과).
 *   지우지 않고 꺼 둔다 — 원본 발행본·CSV 는 그대로이며 futureDays 20 이면 이 함수를 쓰지 않는다.
 */
export function tomorrowPublication(p, h = {since: '2026-10-02', tomorrowOnly: true}) {
  const tomorrow = p.futureDates[0], note = offNote({...h, tomorrowOnly: true});
  const policy = {...p.policy, horizon: 1}; delete policy.scenario;
  return {...p, horizon: 1, futureDates: [tomorrow], policy,
    summary: {...p.summary, futurePointsPerStock: 1, afterIssuanceFuturePoints: p.summary?.afterIssuanceFuturePoints == null ? null : Math.min(1, p.summary.afterIssuanceFuturePoints), closeCallStocksDay20: null},
    assets: p.assets.map(a => ({...a, rows: a.rows.slice(0, 2), scenario: null, previous: null, previousReason: note,
      errors: {'1': a.errors?.['1'] ?? a.errors?.[1] ?? null},
      // 일정(뉴스)은 전망이 아니지만 내일 뒤 날짜는 화면에 내지 않는다
      news: (a.news ?? []).filter(n => !n.date || n.date <= tomorrow),
      // 여러 날 CSV 는 꺼 둠 — 1거래일 발행본(CSV 2행)일 때만 링크
      csvUrl: p.horizon === 1 && a.rows.length === 2 ? a.csvUrl : null}))};
}
const TESTS_OFF = since => `진화 후보의 지난날 20거래일 시험은 꺼 둠(${since ?? '2026-10-02'} 사장님 명령) — 시험 숫자는 화면에 내지 않음 · 지난 기록은 그대로`;
/** 진화 칸(timeline)을 1거래일 뒤 통계와 내일까지의 날짜로만 줄인다 */
function tomorrowTimeline(t, tomorrow, note, since) {
  const testsOff = TESTS_OFF(since);
  const days = (t.days ?? []).filter(d => d.date <= tomorrow).map(d => {
    if (!d.scored) return {...d, line: {...d.line, changed: /시험/.test(d.line?.changed ?? '') ? '시험 꺼 둠' : d.line?.changed}};
    const byDistance = d.byDistance?.[1] ? {1: d.byDistance[1]} : {};
    const changedText = d.changed?.adopted || d.changed?.rolledBack ? d.line?.changed : d.changed?.tested ? '안 바꿈 · 시험 숫자는 꺼 둠' : d.line?.changed;
    return {...d, evaluated: byDistance[1]?.n ?? 0, byDistance, changed: {...d.changed, candidates: [], nearMisses: [], testsOff}, line: {...d.line, changed: changedText}};
  });
  // 판정일이 내일 뒤면 날짜는 빼고 「채점 N일째부터」로만 말한다(날짜 달력은 자료 상태 화면에)
  const jd = t.chart?.judgementDate && t.chart.judgementDate > tomorrow ? t.chart.judgementDate : null;
  const kd = jd ? `${Number(jd.slice(5, 7))}월 ${Number(jd.slice(8, 10))}일(${['일', '월', '화', '수', '목', '금', '토'][new Date(jd + 'T00:00:00Z').getUTCDay()]})` : null;
  const scrub = x => typeof x === 'string' && kd ? x.split('째인 ' + kd + '부터').join('째부터') : x;
  const headline = t.headline ? {...t.headline, sentence: scrub(t.headline.sentence)} : t.headline;
  const blocker = t.blocker ? {...t.blocker, detail: (t.blocker.detail ?? []).filter(x => !kd || !String(x).includes(kd))} : t.blocker;
  const chart = t.chart ? {...t.chart, to: t.chart.to && t.chart.to > tomorrow ? tomorrow : t.chart.to, sessions: (t.chart.sessions ?? []).filter(s => s <= tomorrow), judgementDate: t.chart.judgementDate && t.chart.judgementDate > tomorrow ? null : t.chart.judgementDate, tests: []} : t.chart;
  return {...t, headline, blocker, days, chart, sample: t.sample ? {...t.sample, cellsAll: days.reduce((s, d) => s + (d.evaluated ?? 0), 0)} : t.sample, tomorrowOnly: {note, testsOff}};
}

/** 지금 보는 52종목이 어떤 묶음인가(첫 화면 한 줄 · 「어떻게 골랐나」) — 2026-10-04 사장님 「오를 수 있는 52개 우량 종목을 찾아 첫 화면에 배열」 */
export function universeSetOf(input) {
  const u = input?.universe;
  if (!u) return {id: 'u1-sector52', label: '업종 대표 52종목', selectedOn: '2026-09-17', how: ['업종마다 대표 1종목씩 52업종']};
  return {id: u.id, label: u.label ?? '튼튼한 회사 52곳', rules: u.rules ?? null, selectedOn: Number.isFinite(Date.parse(u.selectedAt)) ? new Date(Date.parse(u.selectedAt) + 9 * 3600000).toISOString().slice(0, 10) : null, how: Array.isArray(u.how) ? u.how : [], previous: u.previous ?? null};
}

/**
 * 바뀔 52곳 미리 보기(첫 화면 맨 위 · 바꾸기 전까지만) — 2026-10-04 07:40 사장님 「aaa7377에 올려」
 *   새 52곳의 오를까·내릴까는 바꾸는 날(config/atlas11/universe.json next.switchOn) 장 마감 뒤 실행부터 낸다
 *   (채점은 「장이 열린 날 마감 뒤에 낸 발행본」만 세므로 · lib/rolling-operation.mjs publicationCohort) → 그 전에는 이름만 먼저 보인다.
 *   from = 바꾸는 날 이후 거래일 가운데 아직 그날 마감(15:30) 전인 첫날(그날 실행에서 못 바꾸면 다음 실행 때 다음 거래일로 밀림) · firstTarget = 그다음 거래일
 *   이미 바꿨으면(input.universe.id === next.id) null — 그때부터는 universeSet 이 새 52곳을 가리킨다.
 */
export function universeNextOf({config, nextInput, input, sessions = [], now = new Date().toISOString()}) {
  const n = config?.next;
  if (!n?.id || !n.switchOn || !nextInput?.assets?.length || !input?.assets?.length) return null;
  if ((input.universe?.id ?? 'u1-sector52') === n.id || nextInput.universe?.id !== n.id) return null;
  const t = Date.parse(now), day = new Date(t + 9 * 3600000).toISOString().slice(0, 10);
  const from = sessions.find(s => s >= n.switchOn && (s > day || (s === day && t < Date.parse(s + 'T15:30:00+09:00')))) ?? null;
  const firstTarget = from ? sessions[sessions.indexOf(from) + 1] ?? null : null;
  const have = new Set(input.assets.map(a => a.code)), next = new Set(nextInput.assets.map(a => a.code)), u = nextInput.universe;
  const companies = nextInput.assets.map(a => ({code: a.code, name: a.name, sector: a.sector ?? null, isNew: !have.has(a.code)}));
  return {id: n.id, label: u.label ?? n.label ?? '튼튼한 회사 52곳', rules: u.rules ?? n.rules ?? null, switchOn: n.switchOn, from, firstTarget,
    selectedOn: Number.isFinite(Date.parse(u.selectedAt)) ? new Date(Date.parse(u.selectedAt) + 9 * 3600000).toISOString().slice(0, 10) : null,
    how: Array.isArray(u.how) ? u.how : [], now: universeSetOf(input).label, companies,
    kept: companies.filter(c => !c.isNew).length, added: companies.filter(c => c.isNew).length,
    dropped: input.assets.filter(a => !next.has(a.code)).map(a => ({code: a.code, name: a.name})), proposal: n.proposal ?? null, inputSHA256: n.inputSHA256 ?? null};
}
export function buildViewBundle({publication, timeline = null, marketIndex = null, analysisRecords = [], scoreRecords = [], input, scoreInput = null, rowCodes = null, calendar, publications, ab = null, abHistory = [], factorStatus = null, archive = null, operation = null, operations = [], scenarioStability = null, evolve = null, ledger = null, scoreHistory = null, dailyReport = null, schedule = null, deploy = null, context = null, contextByCode = null, horizon = null, universeNext = null, now = new Date().toISOString()}) {
  // 「내일 하루만」 스위치(config/atlas11/horizon.json) — futureDays 1 이면 내일 하나의 전망만 묶음에 넣는다(화면에서 숨기는 것이 아님)
  const H = horizon ?? loadHorizon(), T = H.tomorrowOnly === true, OFF = T ? offNote(H) : null;
  const p = T ? tomorrowPublication(publication, H) : publication, files = new Map(), tomorrow = p.futureDates[0];
  CURRENT_PATHS = p.paths ?? 20000;
  // 채점판은 옛 발행본까지 — 종목을 바꾼 뒤에는 물러난 종목 가격이 합쳐진 scoreInput 으로(옛 숫자 그대로)
  const scoreboard = buildScoreboard({publications, input: scoreInput ?? input, calendar, now, rowCodes, ...(T ? {horizons: [1], until: tomorrow} : {})});
  // 「왜 틀렸나」(성적 화면): 틀린 1거래일 전망을 네 통으로 · 한꺼번에 민 까닭(「하락」 쏠림) — 장부의 채점·원인 분석에서만
  files.set('misses.json', buildMisses({scoreboard, analysisRecords, closeCallGap: SIMULATION_POLICY.closeCallGap, forecastId: p.forecastId}));
  // 「성적」 종목별 맞고 틀린 숫자(명령서 6판 R1·W3): 채점판이 고른 칸(대표 발행본)을 기록 장부 채점 기록의 숫자로 · 시각 없음
  files.set('score-cells.json', buildScoreCells({scoreboard, scoreRecords}));
  // 1만원 비교(여러 날 경주)는 내일만이면 꺼 둠 — 지우지 않고 「꺼 둠」 한 줄만 남긴다
  const race = T ? {schema: 'atlas11-race-off-1', status: '꺼 둠', note: OFF, forecastId: p.forecastId, issuedAt: p.issuedAt, actualAsOf: p.actualAsOf, tomorrow, stocks: []} : buildRace(p);
  // 연쇄 지도(도미노)와 종목 정보 — 발행본과 같은 기준일의 실제 가격 이력에서 계산(전망 숫자에는 넣지 않음)
  const network = buildNetwork(input), nodeOf = code => network.nodes.find(x => x.code === code);
  const sessions = calendar?.sessions ?? input.calendar.sessions;
  const infoOf = code => { const a = input.assets.find(x => x.code === code); const st = stockStats(a, sessions, {asOf: p.actualAsOf}); const nd = nodeOf(code); return {...Object.fromEntries(Object.entries(st).map(([k, v])=> [k, finite(v) ? round(v, 6) : v])), beta: nd.beta, r2: nd.r2, idioShare: nd.idioShare, volAnnualLong: nd.volAnnual, group: nd.group, groupName: nd.groupName, topCorrelated: nd.topCorrelated, window: network.window}; };
  if (!T) { const groupOf = makeGroupOf(input.assets); for (const s of race.stocks) s.group = groupOf(s.code)?.id ?? null;
    race.groups = network.groups.map(g => ({id: g.id, name: g.name, count: g.codes.length})); }
  const missingFactors = (factorStatus?.summary?.missingFactorTypes ?? []).slice();
  const recentErrors = code => { const last = scoreboard.byDate.at(-1); const row = last?.rows.find(r => r.code === code); return row ? Object.fromEntries(Object.entries(row.horizons).map(([h, c]) => [h, c.status === 'evaluated' ? {ape: round(c.ape, 4), directionCorrect: c.directionCorrect, covered: c.covered, targetDate: c.targetDate, forecastId: c.forecastId} : {pending: true, reason: c.reason, targetDate: c.targetDate}])) : null; };
  // 카드 52장 (내일만: 내일 하나 — day5·day20 없음 · 작은 그래프 = 실제 20거래일 + 내일 한 점과 그 80% 범위)
  const cards = p.assets.map(a => {
    const r1 = a.rows[1], r5 = T ? null : a.rows[5], r20 = T ? null : a.rows[20], state = observedState(a), o = originInputs(a);
    return {code: a.code, name: a.name, sector: a.sector, close: a.anchor.close, anchorDate: a.anchor.date, finalClose: a.anchor.finalClose, dataStatus: p.dataStatus, change1: round(o.return1), state: state.label,
      day1: {date: r1.date, selected: r1.direction.daily.selected, probabilities: dirSlim(r1.direction.daily).probabilities, closeCall: r1.direction.daily.closeCall, exactTie: r1.direction.daily.exactTie === true, statisticalTie: dirSlim(r1.direction.daily).statisticalTie, monteCarloSE: round(r1.direction.daily.monteCarloSE, 6), p50: round(r1.p50, 2), return: round(r1.return), ...(T ? {p10: round(r1.p10, 2), p90: round(r1.p90, 2)} : {})},
      ...(T ? {} : {day5: {date: r5.date, p50: round(r5.p50, 2), return: round(r5.return), selected: r5.direction.cumulative.selected, closeCall: r5.direction.cumulative.closeCall, statisticalTie: dirSlim(r5.direction.cumulative).statisticalTie},
        day20: {date: r20.date, p50: round(r20.p50, 2), p10: round(r20.p10, 2), p90: round(r20.p90, 2), return: round(r20.return), selected: r20.direction.cumulative.selected, probabilities: dirSlim(r20.direction.cumulative).probabilities, closeCall: r20.direction.cumulative.closeCall, statisticalTie: dirSlim(r20.direction.cumulative).statisticalTie}}),
      recentError: recentErrors(a.code), priceHeat: round(a.fomo?.priceHeat, 1), fullFomo: a.fomo?.fullFomoScore ?? null, newsCount: a.news.length, importantNewsCount: a.news.filter(n => n.important).length, previous: Boolean(a.previous),
      info: (() => { const i = infoOf(a.code); return {pos52: i.pos52, high52: i.high52, low52: i.low52, ret21: i.ret21, ret252: i.ret252, beta: i.beta, group: i.group, groupName: i.groupName, vol20Annual: i.vol20Annual}; })(),
      // 작은 그래프: 최근 20거래일 실제 + 전망 중앙·띠 (카드에서 모양을 한눈에) · 내일만이면 전망은 내일 한 점
      spark: T ? {actual: a.actual60.slice(-20).map(r => round(r.close, 2)), forecastDates: [r1.date], forecast: [round(r1.p50, 2)], low: [round(r1.p10, 2)], high: [round(r1.p90, 2)]}
        : {actual: a.actual60.slice(-20).map(r => round(r.close, 2)), forecast: a.rows.slice(1).map(r => round(r.p50, 2)), low: a.rows.slice(1).map(r => round(r.p10, 2)), high: a.rows.slice(1).map(r => round(r.p90, 2))}};
  }).sort(T ? (x, y) => y.day1.return - x.day1.return || x.code.localeCompare(y.code) : (x, y) => y.day20.return - x.day20.return || x.code.localeCompare(y.code));
  // 전망 화면의 증거 그래프: 목표일마다 「1일 뒤 상승 선택 종목 수」(그 날을 겨눈 첫 실시간 발행본 · 채점표와 같은 선택) + 실제로 오른 종목 수
  //   마지막 점 = 이번 발행본의 첫 미래 거래일(카드 52장의 day1.selected 로 센 값 = 전망 화면 헤드라인 숫자)
  const directionHistory = scoreboard.byDate.map(d => { const cells = d.rows.map(r => r.horizons?.['1']).filter(c => c && c.status === 'evaluated'); const n = (k, v) => cells.filter(c => c[k] === v).length;
    return {date: d.date, evaluated: cells.length, predictedUp: n('predictedDirection', 'up'), predictedFlat: n('predictedDirection', 'flat'), predictedDown: n('predictedDirection', 'down'), actualUp: n('observedDirection', 'up'), actualFlat: n('observedDirection', 'flat'), actualDown: n('observedDirection', 'down'), directionCorrect: cells.filter(c => c.directionCorrect === true).length, forecastIds: [...new Set(cells.map(c => c.forecastId))], source: 'scores.json byDate[].rows[].horizons[1] (첫 실시간 발행본)'}; })
    .filter(d => d.evaluated > 0 && d.date < p.futureDates[0]);
  directionHistory.push({date: p.futureDates[0], evaluated: 0, predictedUp: cards.filter(c => c.day1.selected === 'up').length, predictedFlat: cards.filter(c => c.day1.selected === 'flat').length, predictedDown: cards.filter(c => c.day1.selected === 'down').length, actualUp: null, actualFlat: null, actualDown: null, directionCorrect: null, forecastIds: [p.forecastId], source: 'cards.json cards[].day1.selected (이번 발행본)'});
  const day1Mean = cards.reduce((s, c) => s + c.day1.return, 0) / cards.length;
  files.set('cards.json', {schema: 'atlas11-view-cards-1', forecastId: p.forecastId, issuedAt: p.issuedAt, actualAsOf: p.actualAsOf, sort: T ? 'day1_model_return_desc_then_code' : 'day20_model_return_desc_then_code', ...(T ? {tomorrowOnly: {tomorrow, note: OFF}} : {}), cards, directionHistory, day1: {date: p.futureDates[0], up: directionHistory.at(-1).predictedUp, flat: directionHistory.at(-1).predictedFlat, down: directionHistory.at(-1).predictedDown, closeCall: cards.filter(c => c.day1.closeCall || c.day1.statisticalTie).length, meanReturn: round(day1Mean, 6), meanReturnBasis: '52종목 각각의 첫 거래일 중앙 전망 등락률(출발 종가 대비)을 단순 평균한 값'}});
  // 종목 상세 52개
  for (const a of p.assets) {
    const explain = explainAsset(a, {missingFactors});
    const detail = {schema: 'atlas11-view-stock-1', forecastId: p.forecastId, issuedAt: p.issuedAt, actualAsOf: p.actualAsOf, currentDateKST: p.currentDateKST, dataStatus: p.dataStatus, publicationStatus: p.publicationStatus, futureDates: p.futureDates,
      code: a.code, name: a.name, sector: a.sector, anchor: a.anchor, state: explain.state, inputs: explain.inputs, actual60: a.actual60, rows: a.rows.map(slimRow), scenario: a.scenario ? {...a.scenario, prices: a.scenario.prices.map(x => round(x, 2)), dailyLogReturns: a.scenario.dailyLogReturns?.map(x => round(x, 6))} : null, previous: a.previous, previousReason: a.previousReason, earlierToday: p.earlierToday, csvUrl: a.csvUrl,
      news: a.news, fomo: a.fomo, errors: recentErrors(a.code),
      model: {version: a.model.version, engine: a.model.id, selected: a.model.selected, featureNames: a.model.featureNames, beta: a.model.regression.beta.map(x => round(x, 8)), intercept: round(a.model.regression.intercept, 8), volatility: {kind: a.model.volatility.kind, a: a.model.volatility.a, b: a.model.volatility.b, omega: round(a.model.volatility.omega, 10)}, trainedThrough: a.model.trainedThrough, trainCount: a.model.trainCount, calibrationFrozenBefore: a.model.calibrationFrozenBefore, stateUpdatedThrough: a.model.stateUpdatedThrough, holdout: a.model.holdout, factors: a.model.factors, externalRejected: a.model.externalRejected, trustProbability: null},
      dataQuality: a.dataQuality, explain: explain.byDate, policy: p.policy, assumptions: p.assumptions, info: infoOf(a.code), modelVersion: p.modelVersion ?? null,
      scoreHistory: (scoreHistory?.byCode?.[a.code] ?? []).filter(c => !T || (Number(c.horizon) === 1 && c.targetDate <= tomorrow)).slice(-120), context: contextByCode?.[a.code] ?? null, ...(T ? {tomorrowOnly: {tomorrow, note: OFF}} : {})};
    files.set('stocks/' + a.code + '.json', detail);
  }
  files.set('race.json', race);
  files.set('scores.json', scoreboard);
  files.set('network.json', {...network, forecastId: p.forecastId, issuedAt: p.issuedAt});
  // 기록 장부 색인 · 일일 보고 (장부 원본은 reports/atlas11/ledger · 화면은 public/data/atlas11/ledger 의 복사본을 색인의 해시로 대조)
  files.set('ledger.json', {schema: 'atlas11-view-ledger-1', forecastId: p.forecastId, issuedAt: p.issuedAt, actualAsOf: p.actualAsOf, index: ledger ?? null, dailyReport: dailyReport ?? null, note: '기록은 덮어쓰지 않고 덧붙인다 · 정정은 supersedes 로 연결 · 종류별 CSV 는 /downloads/atlas11/ledger/'});
  // 진화
  const holdout = p.assets.map(a => a.model.holdout), avg = k => round(holdout.map(h => h[k]).filter(finite).reduce((s, x, _, arr) => s + x / arr.length, 0), 6);
  const evolution = {schema: 'atlas11-view-evolution-1', forecastId: p.forecastId, issuedAt: p.issuedAt, actualAsOf: p.actualAsOf,
    operating: {modelVersion: p.modelVersion, engine: p.policy.engine, method: 'A', formula: ['r[i,t] = α_i + Σ_j β_ij · z(x_j[t−1]) + √v[i,t] · ε[i,pick(t)]', 'x: 자기 1·2·5·20·60일 수익률(F35), 52종목 상승·하락 폭·5일 평균(F11)', 'v[i,t+1] = ω + a·ε² + b·v (GARCH 1,1) — F36', 'P[i,D+h] = P_actual[i,D] · exp(Σ r)', 'pick(t): 52종목이 같은 과거 잔차 날짜를 뽑음(동조 보존)'], training: {frozenBefore: p.assets[0].model.calibrationFrozenBefore, minimumTrain: 160, innerSelection: 40, holdout: 60, maxTrain: 504, penalties: [1, 10], selection: 'inner CRPS forward selection (fixed factor order)'}, calibration: p.provenance.calibration, state: p.provenance.state, paths: p.paths, seed: p.seed, holdoutAverage: {crps: avg('crps'), baselineCRPS: avg('baselineCRPS'), directionAccuracy: avg('directionAccuracy'), baselineDirectionAccuracy: avg('baselineDirectionAccuracy'), coverage: avg('coverage'), baselineCoverage: avg('baselineCoverage'), absolutePriceError: avg('absolutePriceError'), baselineAbsolutePriceError: avg('baselineAbsolutePriceError'), note: '52종목 각자의 시간순 보류 60거래일 평균 · 후향 진단 · 실전 적중 인증 아님', first: p.assets[0].model.holdout.first, last: p.assets[0].model.holdout.last}},
    candidateB: ab ? {runId: ab.runId, protocol: ab.protocol, A: ab.A, B: ab.B, numericalGate: ab.numericalGate, dataQualityGate: ab.dataQualityGate, decision: ab.decision, byBlock: ab.byBlock, errorDifference: ab.errorDifferenceBminusA, origins: ab.origins, rows: ab.stockTargetRows, rankMaximum: ab.rankMaximum, startedAt: ab.startedAt, finishedAt: ab.finishedAt, changedInputs: ['+ F04 미국 실질금리 DFII10(수준, 7일 지연 가정)', '+ F06 원/달러 DEXKOUS(뉴욕 정오, 7일 지연 가정)'], changedFormula: 'μ_i 에 c_i·z(DFII10) + d_i·z(DEXKOUS) 항 추가 · 미래는 마지막 관측값 유지(carry)', unverified: ['당시 공개 빈티지(ALFRED) 미확보 — FRED_API_KEY 미설정', '가격 조정·기업행위 미검증', '단일 가격 제공자', '한국 장 마감 환율이 아닌 뉴욕 정오 환율']} : null,
    scenarioStability: scenarioStability ? {at: scenarioStability.at, paths: scenarioStability.paths, settings: scenarioStability.settings, summary: scenarioStability.summary, note: scenarioStability.note} : null,
    history: abHistory, archiveReconstruction: archive, separation: {live: '발행 뒤 실제 기록 = scores.json (실시간)', retrospective: '후향 실험 = candidateB · holdoutAverage · archiveReconstruction (실시간 성적 아님)'}, adoptionRule: 'B 오차 < A 오차 그리고 B 순위 적중 ≥ A 순위 적중, 그리고 자료 품질 관문 통과 — 하나라도 아니면 A 유지·기각 기록 보존',
    autoEvolution: evolve};
  if (T) {
    // 내일만: 진화 후보의 지난날 20거래일 시험 숫자·표, 9/17 고정판 대조, 대표 시나리오 안정성, A/B 후향 비교는 꺼 둠(운영 모형 사실은 그대로)
    const testsOff = TESTS_OFF(H.since);
    evolution.candidateB = null; evolution.scenarioStability = null; evolution.history = []; delete evolution.archiveReconstruction;
    evolution.separation = {live: evolution.separation.live, retrospective: '후향 실험(20거래일 시험 · 9/17 고정판 대조)은 꺼 둠'};
    evolution.tomorrowOnly = {note: OFF, tests: testsOff, archiveReconstruction: `9/17 고정판 대조는 꺼 둠(${H.since ?? '2026-10-02'} 사장님 명령)`};
    if (evolution.autoEvolution) {
      const e = evolution.autoEvolution;
      evolution.autoEvolution = {...e, backtests: [], operatingBacktest: null, testsOff,
        candidates: (e.candidates ?? []).map(c => ({candidateId: c.candidateId, family: c.family, label: c.label, spec: c.spec, status: c.status, statusKey: c.statusKey, createdAt: c.createdAt, backtestedAt: c.backtestedAt, four: null, summary: null, gates: null, observation: c.observation, rejectReason: null, pendingReason: c.pendingReason, history: []}))};
    }
  }
  files.set('evolution.json', evolution);
  // 진화 칸(날짜별 사실표) — 같은 발행본에 묶는다
  if (timeline) files.set('timeline.json', {...(T ? tomorrowTimeline(timeline, tomorrow, OFF, H.since) : timeline), forecastId: p.forecastId, issuedAt: p.issuedAt, actualAsOf: p.actualAsOf});
  // 자료 상태 52×36 + FOMO
  // 「연결」(수치 입력으로 들어감)과 「비영 계수」(내부 선택 뒤 실제로 0이 아닌 계수)를 구분한다. zero 모형(계수 전부 0)은 평균 성분만 쓴다.
  const nonZeroFor = (a, id) => a.model.featureFactors.some((f, j) => f === id && Math.abs(a.model.regression.beta[j] ?? 0) > 0);
  const factorRows = (p.assets[0].model.factors ?? []).map(f => { const per = p.assets.map(a => a.model.factors.find(x => x.id === f.id)); const nonZero = f.id === 'F36' ? p.assets.filter(a => a.model.volatility && a.model.volatility.kind).length : p.assets.filter(a => nonZeroFor(a, f.id)).length; return {id: f.id, name: f.name, role: f.role, used: per.filter(x => x.status !== 'missing').length, nonZeroCoefficient: nonZero, missing: per.filter(x => x.status === 'missing').length, reason: f.reason}; });
  for (const f of factorRows) { const ob = context?.factors?.[f.id]; f.observed = ob?.observed ? {latest: ob.latestObservation ?? null, stocks: ob.stocks ?? null, scope: ob.scope ?? 'stock', componentOnly: ob.componentOnly === true, label: ob.label ?? null, series: (ob.series ?? []).map(x => ({series: x.series, label: x.label, latest: x.latestObservation, value: x.value, unit: x.unit})), usedInForecast: false} : null; }
  const zeroModelStocks = p.assets.filter(a => a.model.regression.beta.every(b => b === 0)).length;
  files.set('status.json', {schema: 'atlas11-view-status-1', forecastId: p.forecastId, issuedAt: p.issuedAt, actualAsOf: p.actualAsOf, currentDateKST: p.currentDateKST, dataStatus: p.dataStatus, publicationStatus: p.publicationStatus,
    prices: {stocks: 52, finalClose: p.summary.finalCloseStocks, currentClose: p.summary.newCurrentCloseStocks, provider: '9/29 부터 매일: 한국거래소 정규장 종가 = 15:30 종가 단일가 분봉(네이버 증권 분봉 원문) · 실행마다 직전 확정 종가를 같은 방법으로 다시 받아 대조 · 9/28 까지: 과거 이력 네이버 차트 + 확정 종가 매일경제 시세판(일부 알파스퀘어) · 당일 종가는 한 출처(대조는 전날 값) · 시가·고가·저가·거래량은 비움(대체거래소 거래가 섞이지 않은 값을 얻지 못함) · 기업행위 조정 미검증', anchorObservedAt: p.assets.map(a => a.anchor.observedAt).sort().at(-1)},
    factors: {total: 36, usedNumerically: factorRows.filter(f => f.used > 0).length, rows: factorRows, missingTypes: missingFactors, zeroModelStocks, note: `F35·F11 은 52종목 모두 수치 입력으로 연결되지만, 내부 선택 결과 ${zeroModelStocks}종목은 계수가 모두 영(평균 성분만 쓰는 모형)이고 영이 아닌 계수가 있는 종목은 ${52 - zeroModelStocks}종목입니다`},
    fomo: {full: p.summary.fullFomoStocks, priceHeat: p.summary.priceHeatStocks, missingComponents: [...new Set(p.assets.flatMap(a => a.fomo?.missing ?? []))], note: '종가만으로는 「가격 열기」 부분지표 · 전체 FOMO 는 검색 관심·거래량 비교·개인 수급·장중 추격 자료가 있어야 산출'},
    news: {events: p.summary.newsEvents, numeric: p.summary.newsNumericEvents, collected: context?.summary?.news ?? null, disclosures: context?.summary?.disclosures ?? null, reason: '확정 일정 + 매일 모은 종목 기사 제목(같은 기사·재게시 가림)과 공시 제목 · 기대 대비 결과·과거 사건 표본 없음 → 수치 미산출 · 전망 숫자에 넣지 않음'},
    context: context ? {day: context.day, fetchedAt: context.fetchedAt, summary: context.summary, factors: Object.values(context.factors ?? {}).map(f => ({factorId: f.factorId, observed: f.observed, stocks: f.stocks ?? null, scope: f.scope ?? 'stock', latest: f.latestObservation ?? null, componentOnly: f.componentOnly === true, label: f.label, note: f.note ?? null, series: (f.series ?? []).map(x => ({series: x.series, label: x.label, latest: x.latestObservation, value: x.value, unit: x.unit}))})), errors: context.errors ?? 0, usedInForecast: false, note: '시장 지수·종목별 수급·기사·공시·거시 시계열을 매일 기록 · 검증을 통과해 채택되기 전까지 전망 숫자에 들어가지 않음'} : null,
    calendar: {...(T ? {label: '거래일 달력(전망 아님)'} : {}), ...p.provenance.calendar, upcomingSessions: (calendar?.sessions ?? []).filter(d => d > p.actualAsOf).slice(0, 12), holidays: Object.entries(calendar?.holidays ?? {}).filter(([d]) => d >= p.actualAsOf.slice(0, 4) + '-01-01').map(([date, name]) => ({date, name})), notices: calendar?.notices ?? [], coverageEnd: calendar?.coverageEnd ?? null, checkedAt: calendar?.checkedAt ?? null, regularClose: '15:30', timezone: 'Asia/Seoul'}, operation, operations, calendarVersion: p.calendarVersion,
    evidence: {browserReport: '/docs/evidence/browser-report.json', screenshots: '/docs/evidence/', tests: '/docs/evidence/tests.tap', independentCheck: '/docs/evidence/independent-check.md', note: '배포 묶음에 넣은 검사 기록 · 실제 크롬(헤드리스) PC·모바일 조작 검사 · 실기기 검증 아님'},
    integrity: {method: 'manifest.json 의 파일별 SHA-256 을 화면이 읽을 때 다시 계산해 대조 (보안 연결에서만 가능)', standard: 'FIPS 180-4 SHA-256'}, assumptions: p.assumptions, collector: {codeExists: true, collectorModule: 'scripts/atlas11/collect_krx_close.mjs', contextModule: 'scripts/atlas11/collect_context.mjs', schedulerModule: schedule?.workflow ?? 'scripts/atlas11/scheduler.mjs', serverInstalled: schedule?.host === 'github-actions' || schedule?.alive === true, serverKind: schedule?.host === 'github-actions' ? 'GitHub Actions 러너(ubuntu-latest)' : schedule?.alive ? '자체 서버 예약기' : null, scheduledRunInstalled: schedule?.installed === true, lastScheduledRun: schedule?.lastScheduledRun ?? null, siteDeployed: deploy?.state === 'ready', site: deploy ? {url: deploy.url ?? null, state: deploy.state ?? null, at: deploy.at ?? null, deployId: deploy.deployId ?? null} : null, lastCollection: operation?.collection ?? null, note: schedule?.host === 'github-actions' ? '수집·채점·발행·기록은 GitHub 저장소의 예약 실행(러너)에서 돈다 · 기록은 실행마다 저장소에 커밋되어 영구 보존' : '수집기·예약기 코드는 있으나 예약 연결이 확인되지 않음(deploy/ 설명서)'}, schedule: schedule ?? null});
  // manifest
  const manifest = {schema: 'atlas11-view-manifest-1', generatedAt: now, forecastId: p.forecastId, modelVersion: p.modelVersion, issuedAt: p.issuedAt, actualAsOf: p.actualAsOf, currentDateKST: p.currentDateKST, dataStatus: p.dataStatus, publicationStatus: p.publicationStatus, staleAnchor: p.staleAnchor, horizon: p.horizon, futureDates: p.futureDates, ...(T ? {tomorrowOnly: {futureDays: 1, tomorrow, since: H.since ?? null, note: OFF, config: H.file ?? 'config/atlas11/horizon.json', configSHA256: H.configSHA256 ?? null, off: H.config?.off ?? null}} : {}), summary: p.summary, universe: p.universe, universeHash: p.universeHash, universeSet: universeSetOf(input), ...(universeNext ? {universeNext} : {}), scoreTargetDate: scoreboard.targetDate, firstScorableDate: scoreboard.firstScorableDate, scoredDates: scoreboard.scoredDates, files: {}, csvManifest: !T || p.assets.every(a => a.csvUrl) ? '/downloads/atlas11/' + p.forecastId + '/manifest.json' : null,
    market: marketIndex ? {day: marketIndex.day, fetchedAt: marketIndex.fetchedAt, record: marketIndex.file, items: marketIndex.items, closeTimeKST: '15:30', usedInForecast: false, note: '장 마감 뒤 수집한 지수 종가 · 전망 숫자에 넣지 않음'} : null};
  for (const [name, value] of files) manifest.files[name] = {sha256: sha(JSON.stringify(value)), bytes: Buffer.byteLength(JSON.stringify(value))};
  files.set('manifest.json', manifest);
  validateViewBundle(files, publication);
  return files;
}

/** 「내일만」 묶음에서 내일 뒤 날짜를 찾는다 — 거래일 달력(status.calendar)·발행 끝날 설정(status.schedule.publishEnd)만 예외(전망이 아님) */
// 「(2026-10-02 사장님 명령 …)」처럼 명령 날짜를 적은 글은 전망 날짜가 아니므로 세지 않는다
const ISO_DAY = /\b(20\d\d-\d\d-\d\d)\b(?! 사장님 명령)/g;
export function datesAfter(value, tomorrow, path = '', out = []) {
  if (value == null) return out;
  if (typeof value === 'string') { for (const m of value.matchAll(ISO_DAY)) if (m[1] > tomorrow) out.push({path, date: m[1]}); return out; }
  if (Array.isArray(value)) { value.forEach((x, i) => datesAfter(x, tomorrow, path + '[' + i + ']', out)); return out; }
  if (typeof value === 'object') for (const [k, v] of Object.entries(value)) datesAfter(v, tomorrow, path ? path + '.' + k : k, out);
  return out;
}
// 바뀔 52곳 미리 보기의 날짜(바꾸는 날 · 첫 예측을 내는 날 · 그 예측의 목표일)는 거래일 달력에서 고른 일정이다 — 전망 값이 아님(2026-10-04 「aaa7377에 올려」)
const CALENDAR_PATHS = [/^manifest\.json:tomorrowOnly\.since$/, /^manifest\.json:universeNext\.(switchOn|from|firstTarget)$/, /^status\.json:calendar\./, /^status\.json:calendarVersion\./, /:autoEvolution\.config\.schedule\.publishEnd$/, /^status\.json:schedule\.publishEnd$/, /^status\.json:collector\./, /^manifest\.json:generatedAt$/, /^[^:]+:generatedAt$/];

/** 화면 간 일치: 같은 forecastId, 카드·상세·1만원 비교의 숫자가 같은 발행본 값인지 검사 · 내일만이면 내일 말고의 전망이 묶음 어디에도 없는지 */
export function validateViewBundle(files, publication) {
  const manifest = files.get('manifest.json'), cards = files.get('cards.json'), race = files.get('race.json'), scores = files.get('scores.json'), evolution = files.get('evolution.json'), status = files.get('status.json'), network = files.get('network.json');
  const T = Boolean(manifest.tomorrowOnly), pub = T ? tomorrowPublication(publication) : publication, tomorrow = publication.futureDates[0];
  const ids = new Set([manifest.forecastId, cards.forecastId, race.forecastId, evolution.forecastId, status.forecastId, network.forecastId, ...pub.assets.map(a => files.get('stocks/' + a.code + '.json').forecastId)]);
  if (network.nodes.length !== 52 || network.actualAsOf !== pub.actualAsOf || network.groups.reduce((s, g) => s + g.codes.length, 0) !== 52) throw Error('VIEW_NETWORK');
  if (ids.size !== 1 || !ids.has(pub.forecastId)) throw Error('VIEW_FORECAST_ID_MISMATCH');
  if (cards.cards.length !== 52 || new Set(cards.cards.map(c => c.code)).size !== 52 || (!T && race.stocks.length !== 52)) throw Error('VIEW_52');
  for (const a of pub.assets) {
    const card = cards.cards.find(c => c.code === a.code), detail = files.get('stocks/' + a.code + '.json'), r = T ? null : race.stocks.find(s => s.code === a.code);
    if (card.close !== a.anchor.close || detail.anchor.close !== a.anchor.close || detail.rows[0].p50 !== a.anchor.close || (!T && r.anchorClose !== a.anchor.close)) throw Error('VIEW_ANCHOR ' + a.code);
    if (T) { if (Math.abs(card.day1.p50 - a.rows[1].p50) > 0.01 || Math.abs(detail.rows[1].p50 - a.rows[1].p50) > 0.01) throw Error('VIEW_DAY1 ' + a.code); }
    else if (Math.abs(card.day20.p50 - a.rows[20].p50) > 0.01 || Math.abs(detail.rows[20].p50 - a.rows[20].p50) > 0.01 || Math.abs(r.fromToday[19].value - 10000 * a.rows[20].p50 / a.anchor.close) > 1e-6) throw Error('VIEW_DAY20 ' + a.code);
    if (card.day1.selected !== a.rows[1].direction.daily.selected || detail.rows[1].direction.daily.selected !== a.rows[1].direction.daily.selected) throw Error('VIEW_DIRECTION ' + a.code);
    // 상세 모양: 옛 모드 = 실제 60 + 전망 20(설명 80칸 · 행 21) · 내일만 = 실제 60 + 내일 1(설명 61칸 · 행 2)
    if (Object.keys(detail.explain).length !== (T ? 61 : 80) || detail.rows.length !== (T ? 2 : 21) || detail.actual60.length !== 60) throw Error('VIEW_DETAIL_SHAPE ' + a.code);
    if (detail.info?.close !== a.anchor.close || !finite(detail.info.beta) || card.info?.beta !== detail.info.beta) throw Error('VIEW_INFO ' + a.code);
    if (T) {
      // 내일 말고의 전망이 없어야 한다(숨김이 아니라 묶음에 없음)
      if (card.day5 || card.day20 || card.spark.forecast.length !== 1 || card.spark.forecastDates?.[0] !== tomorrow || card.day1.date !== tomorrow) throw Error('VIEW_TOMORROW_CARD ' + a.code);
      if (detail.rows[1].date !== tomorrow || detail.scenario !== null || detail.previous !== null || detail.futureDates.length !== 1 || detail.futureDates[0] !== tomorrow) throw Error('VIEW_TOMORROW_DETAIL ' + a.code);
      if (Object.values(detail.explain).some(x => x.kind === 'forecast' && x.date !== tomorrow) || Object.keys(detail.errors ?? {}).some(k => k !== '1')) throw Error('VIEW_TOMORROW_EXPLAIN ' + a.code);
      if ((detail.scoreHistory ?? []).some(c => Number(c.horizon) !== 1)) throw Error('VIEW_TOMORROW_SCORE_HISTORY ' + a.code);
      if (detail.csvUrl && publication.horizon !== 1) throw Error('VIEW_TOMORROW_CSV ' + a.code);
    }
  }
  if (scores.actualAsOf !== pub.actualAsOf) throw Error('VIEW_SCORE_DATE');
  // 전망 화면: 헤드라인 숫자(상승 선택 종목 수) = 증거 그래프의 마지막 값 = 카드 52장에서 센 값
  const upNow = pub.assets.filter(a => a.rows[1].direction.daily.selected === 'up').length, dh = cards.directionHistory ?? [];
  if (!dh.length || dh.at(-1).date !== pub.futureDates[0] || dh.at(-1).predictedUp !== upNow || cards.day1?.up !== upNow) throw Error('VIEW_HEADLINE_FORECAST');
  if (manifest.market && !(manifest.market.items ?? []).every(i => finite(i.close) && finite(i.changePct) && /^\d{4}-\d{2}-\d{2}$/.test(i.date))) throw Error('VIEW_MARKET');
  // 「왜 틀렸나」: 틀린 수 = 채점의 방향 틀림 수 · 네 통의 합 = 틀린 수 · 목록 줄 수 = 틀린 수
  const misses = files.get('misses.json'), sc = files.get('scores.json');
  if (misses) {
    const wrongNow = (sc?.byDate ?? []).reduce((s, d) => s + (d.rows ?? []).filter(r => r.horizons?.['1']?.status === 'evaluated' && r.horizons['1'].directionCorrect === false).length, 0);
    const binSum = Object.values(misses.binTotals ?? {}).reduce((s, x) => s + x, 0);
    if (misses.counts.wrong !== wrongNow || binSum !== wrongNow || misses.list.length !== wrongNow) throw Error('VIEW_MISSES');
  }
  // 종목별 채점 칸: 날짜마다 줄 수 = 채점 수 · 자기 값끼리 맞음 · 채점판(scores.json)의 같은 칸과 같음(1원만 달라도 실패)
  validateScoreCells(files.get('score-cells.json'), sc);
  const timeline = files.get('timeline.json');
  if (timeline && (timeline.schema !== 'atlas11-view-timeline-1' || timeline.forecastId !== pub.forecastId || !timeline.headline?.sentence || !Array.isArray(timeline.days))) throw Error('VIEW_TIMELINE');
  const texts = pub.assets.map(a => files.get('stocks/' + a.code + '.json').explain[pub.futureDates[0]].text);
  if (new Set(texts).size !== 52) throw Error('VIEW_EXPLANATION_DUPLICATED');
  if (T) {
    if (manifest.horizon !== 1 || manifest.futureDates.length !== 1 || manifest.futureDates[0] !== tomorrow || !manifest.tomorrowOnly?.note) throw Error('VIEW_TOMORROW_MANIFEST');
    if (race.status !== '꺼 둠' || race.stocks.length) throw Error('VIEW_TOMORROW_RACE');
    if (scores.horizons.join() !== '1' || scores.byDate.some(d => d.rows.some(r => Object.keys(r.horizons).join() !== '1') || Object.keys(d.horizonSummary).join() !== '1') || scores.schedule.some(x => x.horizon !== 1 || x.targetDate > tomorrow)) throw Error('VIEW_TOMORROW_SCORES');
    if ('archiveReconstruction' in evolution || evolution.autoEvolution?.backtests?.length || evolution.autoEvolution?.operatingBacktest || evolution.candidateB || evolution.scenarioStability) throw Error('VIEW_TOMORROW_EVOLUTION');
    if (timeline && timeline.days.some(d => Object.keys(d.byDistance ?? {}).some(k => k !== '1') || d.date > tomorrow)) throw Error('VIEW_TOMORROW_TIMELINE');
    // 묶음 전체: 내일 뒤 날짜는 거래일 달력(전망 아님)에만 있어야 한다
    // 2026-10-03 고침(사장님 「고쳐」): 발행이 멈춰 발행본이 묵으면(내일 < 묶음 만든 날) 그 사이 기록 날짜(장부·하루 보고)는 전망이 아니다
    //   → 기준은 「내일」과 「묶음 만든 날(한국 날짜)」 중 늦은 날. 10/2 23:04 실행이 자정을 넘겨 10/3 기록을 쓰자 여기서 멈춰 그 실행의 기록이 저장되지 못했다.
    const builtDay = typeof manifest.generatedAt === 'string' && Number.isFinite(Date.parse(manifest.generatedAt)) ? new Date(Date.parse(manifest.generatedAt) + 9 * 3600000).toISOString().slice(0, 10) : null;
    const limit = builtDay && builtDay > tomorrow ? builtDay : tomorrow;
    const found = []; for (const [name, value] of files) for (const x of datesAfter(value, limit)) { const at = name + ':' + x.path; if (!CALENDAR_PATHS.some(re => re.test(at))) found.push(at + '=' + x.date); }
    if (found.length) throw Error('VIEW_TOMORROW_DATES_AFTER ' + found.slice(0, 8).join(' | ') + (found.length > 8 ? ` …(${found.length})` : ''));
  }
  return true;
}
