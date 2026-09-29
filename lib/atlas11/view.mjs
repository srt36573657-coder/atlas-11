/**
 * ATLAS 11 · 화면 묶음 — 모든 화면이 같은 발행본(forecastId)에 연결된다.
 * 큰 발행본을 화면별 작은 파일로 나누고, 화면 사이 수치가 일치하는지 검사한다.
 */
import {createHash} from 'node:crypto';
import {explainAsset, observedState, originInputs} from './explain.mjs';
import {buildRace} from './race.mjs';
import {buildScoreboard} from './score.mjs';
import {buildNetwork, stockStats, groupOf} from './network.mjs';

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

export function buildViewBundle({publication, input, calendar, publications, ab = null, abHistory = [], factorStatus = null, archive = null, operation = null, operations = [], scenarioStability = null, evolve = null, ledger = null, scoreHistory = null, dailyReport = null, schedule = null, deploy = null, context = null, contextByCode = null, now = new Date().toISOString()}) {
  const p = publication, files = new Map();
  CURRENT_PATHS = p.paths ?? 20000;
  const scoreboard = buildScoreboard({publications, input, calendar, now});
  const race = buildRace(p);
  // 연쇄 지도(도미노)와 종목 정보 — 발행본과 같은 기준일의 실제 가격 이력에서 계산(전망 숫자에는 넣지 않음)
  const network = buildNetwork(input), nodeOf = code => network.nodes.find(x => x.code === code);
  const sessions = calendar?.sessions ?? input.calendar.sessions;
  const infoOf = code => { const a = input.assets.find(x => x.code === code); const st = stockStats(a, sessions, {asOf: p.actualAsOf}); const nd = nodeOf(code); return {...Object.fromEntries(Object.entries(st).map(([k, v])=> [k, finite(v) ? round(v, 6) : v])), beta: nd.beta, r2: nd.r2, idioShare: nd.idioShare, volAnnualLong: nd.volAnnual, group: nd.group, groupName: nd.groupName, topCorrelated: nd.topCorrelated, window: network.window}; };
  for (const s of race.stocks) s.group = groupOf(s.code)?.id ?? null;
  race.groups = network.groups.map(g => ({id: g.id, name: g.name, count: g.codes.length}));
  const missingFactors = (factorStatus?.summary?.missingFactorTypes ?? []).slice();
  const recentErrors = code => { const last = scoreboard.byDate.at(-1); const row = last?.rows.find(r => r.code === code); return row ? Object.fromEntries(Object.entries(row.horizons).map(([h, c]) => [h, c.status === 'evaluated' ? {ape: round(c.ape, 4), directionCorrect: c.directionCorrect, covered: c.covered, targetDate: c.targetDate, forecastId: c.forecastId} : {pending: true, reason: c.reason, targetDate: c.targetDate}])) : null; };
  // 카드 52장
  const cards = p.assets.map(a => {
    const r1 = a.rows[1], r5 = a.rows[5], r20 = a.rows[20], state = observedState(a), o = originInputs(a);
    return {code: a.code, name: a.name, sector: a.sector, close: a.anchor.close, anchorDate: a.anchor.date, finalClose: a.anchor.finalClose, dataStatus: p.dataStatus, change1: round(o.return1), state: state.label,
      day1: {date: r1.date, selected: r1.direction.daily.selected, probabilities: dirSlim(r1.direction.daily).probabilities, closeCall: r1.direction.daily.closeCall, exactTie: r1.direction.daily.exactTie === true, statisticalTie: dirSlim(r1.direction.daily).statisticalTie, monteCarloSE: round(r1.direction.daily.monteCarloSE, 6), p50: round(r1.p50, 2), return: round(r1.return)},
      day5: {date: r5.date, p50: round(r5.p50, 2), return: round(r5.return), selected: r5.direction.cumulative.selected, closeCall: r5.direction.cumulative.closeCall, statisticalTie: dirSlim(r5.direction.cumulative).statisticalTie},
      day20: {date: r20.date, p50: round(r20.p50, 2), p10: round(r20.p10, 2), p90: round(r20.p90, 2), return: round(r20.return), selected: r20.direction.cumulative.selected, probabilities: dirSlim(r20.direction.cumulative).probabilities, closeCall: r20.direction.cumulative.closeCall, statisticalTie: dirSlim(r20.direction.cumulative).statisticalTie},
      recentError: recentErrors(a.code), priceHeat: round(a.fomo?.priceHeat, 1), fullFomo: a.fomo?.fullFomoScore ?? null, newsCount: a.news.length, importantNewsCount: a.news.filter(n => n.important).length, previous: Boolean(a.previous),
      info: (() => { const i = infoOf(a.code); return {pos52: i.pos52, high52: i.high52, low52: i.low52, ret21: i.ret21, ret252: i.ret252, beta: i.beta, group: i.group, groupName: i.groupName, vol20Annual: i.vol20Annual}; })(),
      // 작은 그래프: 최근 20거래일 실제 + 전망 20일 중앙·띠 (카드에서 모양을 한눈에)
      spark: {actual: a.actual60.slice(-20).map(r => round(r.close, 2)), forecast: a.rows.slice(1).map(r => round(r.p50, 2)), low: a.rows.slice(1).map(r => round(r.p10, 2)), high: a.rows.slice(1).map(r => round(r.p90, 2))}};
  }).sort((x, y) => y.day20.return - x.day20.return || x.code.localeCompare(y.code));
  files.set('cards.json', {schema: 'atlas11-view-cards-1', forecastId: p.forecastId, issuedAt: p.issuedAt, actualAsOf: p.actualAsOf, sort: 'day20_model_return_desc_then_code', cards});
  // 종목 상세 52개
  for (const a of p.assets) {
    const explain = explainAsset(a, {missingFactors});
    const detail = {schema: 'atlas11-view-stock-1', forecastId: p.forecastId, issuedAt: p.issuedAt, actualAsOf: p.actualAsOf, currentDateKST: p.currentDateKST, dataStatus: p.dataStatus, publicationStatus: p.publicationStatus, futureDates: p.futureDates,
      code: a.code, name: a.name, sector: a.sector, anchor: a.anchor, state: explain.state, inputs: explain.inputs, actual60: a.actual60, rows: a.rows.map(slimRow), scenario: {...a.scenario, prices: a.scenario.prices.map(x => round(x, 2)), dailyLogReturns: a.scenario.dailyLogReturns?.map(x => round(x, 6))}, previous: a.previous, previousReason: a.previousReason, earlierToday: p.earlierToday, csvUrl: a.csvUrl,
      news: a.news, fomo: a.fomo, errors: recentErrors(a.code),
      model: {version: a.model.version, engine: a.model.id, selected: a.model.selected, featureNames: a.model.featureNames, beta: a.model.regression.beta.map(x => round(x, 8)), intercept: round(a.model.regression.intercept, 8), volatility: {kind: a.model.volatility.kind, a: a.model.volatility.a, b: a.model.volatility.b, omega: round(a.model.volatility.omega, 10)}, trainedThrough: a.model.trainedThrough, trainCount: a.model.trainCount, calibrationFrozenBefore: a.model.calibrationFrozenBefore, stateUpdatedThrough: a.model.stateUpdatedThrough, holdout: a.model.holdout, factors: a.model.factors, externalRejected: a.model.externalRejected, trustProbability: null},
      dataQuality: a.dataQuality, explain: explain.byDate, policy: p.policy, assumptions: p.assumptions, info: infoOf(a.code), modelVersion: p.modelVersion ?? null,
      scoreHistory: (scoreHistory?.byCode?.[a.code] ?? []).slice(-120), context: contextByCode?.[a.code] ?? null};
    files.set('stocks/' + a.code + '.json', detail);
  }
  files.set('race.json', race);
  files.set('scores.json', scoreboard);
  files.set('network.json', {...network, forecastId: p.forecastId, issuedAt: p.issuedAt});
  // 기록 장부 색인 · 일일 보고 (장부 원본은 reports/atlas11/ledger · 화면은 public/data/atlas11/ledger 의 복사본을 색인의 해시로 대조)
  files.set('ledger.json', {schema: 'atlas11-view-ledger-1', forecastId: p.forecastId, issuedAt: p.issuedAt, actualAsOf: p.actualAsOf, index: ledger ?? null, dailyReport: dailyReport ?? null, note: '기록은 덮어쓰지 않고 덧붙인다 · 정정은 supersedes 로 연결 · 종류별 CSV 는 /downloads/atlas11/ledger/'});
  // 진화
  const holdout = p.assets.map(a => a.model.holdout), avg = k => round(holdout.map(h => h[k]).filter(finite).reduce((s, x, _, arr) => s + x / arr.length, 0), 6);
  files.set('evolution.json', {schema: 'atlas11-view-evolution-1', forecastId: p.forecastId, issuedAt: p.issuedAt, actualAsOf: p.actualAsOf,
    operating: {modelVersion: p.modelVersion, engine: p.policy.engine, method: 'A', formula: ['r[i,t] = α_i + Σ_j β_ij · z(x_j[t−1]) + √v[i,t] · ε[i,pick(t)]', 'x: 자기 1·2·5·20·60일 수익률(F35), 52종목 상승·하락 폭·5일 평균(F11)', 'v[i,t+1] = ω + a·ε² + b·v (GARCH 1,1) — F36', 'P[i,D+h] = P_actual[i,D] · exp(Σ r)', 'pick(t): 52종목이 같은 과거 잔차 날짜를 뽑음(동조 보존)'], training: {frozenBefore: p.assets[0].model.calibrationFrozenBefore, minimumTrain: 160, innerSelection: 40, holdout: 60, maxTrain: 504, penalties: [1, 10], selection: 'inner CRPS forward selection (fixed factor order)'}, calibration: p.provenance.calibration, state: p.provenance.state, paths: p.paths, seed: p.seed, holdoutAverage: {crps: avg('crps'), baselineCRPS: avg('baselineCRPS'), directionAccuracy: avg('directionAccuracy'), baselineDirectionAccuracy: avg('baselineDirectionAccuracy'), coverage: avg('coverage'), baselineCoverage: avg('baselineCoverage'), absolutePriceError: avg('absolutePriceError'), baselineAbsolutePriceError: avg('baselineAbsolutePriceError'), note: '52종목 각자의 시간순 보류 60거래일 평균 · 후향 진단 · 실전 적중 인증 아님', first: p.assets[0].model.holdout.first, last: p.assets[0].model.holdout.last}},
    candidateB: ab ? {runId: ab.runId, protocol: ab.protocol, A: ab.A, B: ab.B, numericalGate: ab.numericalGate, dataQualityGate: ab.dataQualityGate, decision: ab.decision, byBlock: ab.byBlock, errorDifference: ab.errorDifferenceBminusA, origins: ab.origins, rows: ab.stockTargetRows, rankMaximum: ab.rankMaximum, startedAt: ab.startedAt, finishedAt: ab.finishedAt, changedInputs: ['+ F04 미국 실질금리 DFII10(수준, 7일 지연 가정)', '+ F06 원/달러 DEXKOUS(뉴욕 정오, 7일 지연 가정)'], changedFormula: 'μ_i 에 c_i·z(DFII10) + d_i·z(DEXKOUS) 항 추가 · 미래는 마지막 관측값 유지(carry)', unverified: ['당시 공개 빈티지(ALFRED) 미확보 — FRED_API_KEY 미설정', '가격 조정·기업행위 미검증', '단일 가격 제공자', '한국 장 마감 환율이 아닌 뉴욕 정오 환율']} : null,
    scenarioStability: scenarioStability ? {at: scenarioStability.at, paths: scenarioStability.paths, settings: scenarioStability.settings, summary: scenarioStability.summary, note: scenarioStability.note} : null,
    history: abHistory, archiveReconstruction: archive, separation: {live: '발행 뒤 실제 기록 = scores.json (실시간)', retrospective: '후향 실험 = candidateB · holdoutAverage · archiveReconstruction (실시간 성적 아님)'}, adoptionRule: 'B 오차 < A 오차 그리고 B 순위 적중 ≥ A 순위 적중, 그리고 자료 품질 관문 통과 — 하나라도 아니면 A 유지·기각 기록 보존',
    autoEvolution: evolve});
  // 자료 상태 52×36 + FOMO
  // 「연결」(수치 입력으로 들어감)과 「비영 계수」(내부 선택 뒤 실제로 0이 아닌 계수)를 구분한다. zero 모형(계수 전부 0)은 평균 성분만 쓴다.
  const nonZeroFor = (a, id) => a.model.featureFactors.some((f, j) => f === id && Math.abs(a.model.regression.beta[j] ?? 0) > 0);
  const factorRows = (p.assets[0].model.factors ?? []).map(f => { const per = p.assets.map(a => a.model.factors.find(x => x.id === f.id)); const nonZero = f.id === 'F36' ? p.assets.filter(a => a.model.volatility && a.model.volatility.kind).length : p.assets.filter(a => nonZeroFor(a, f.id)).length; return {id: f.id, name: f.name, role: f.role, used: per.filter(x => x.status !== 'missing').length, nonZeroCoefficient: nonZero, missing: per.filter(x => x.status === 'missing').length, reason: f.reason}; });
  for (const f of factorRows) { const ob = context?.factors?.[f.id]; f.observed = ob?.observed ? {latest: ob.latestObservation ?? null, stocks: ob.stocks ?? null, scope: ob.scope ?? 'stock', componentOnly: ob.componentOnly === true, label: ob.label ?? null, series: (ob.series ?? []).map(x => ({series: x.series, label: x.label, latest: x.latestObservation, value: x.value, unit: x.unit})), usedInForecast: false} : null; }
  const zeroModelStocks = p.assets.filter(a => a.model.regression.beta.every(b => b === 0)).length;
  files.set('status.json', {schema: 'atlas11-view-status-1', forecastId: p.forecastId, issuedAt: p.issuedAt, actualAsOf: p.actualAsOf, currentDateKST: p.currentDateKST, dataStatus: p.dataStatus, publicationStatus: p.publicationStatus,
    prices: {stocks: 52, finalClose: p.summary.finalCloseStocks, currentClose: p.summary.newCurrentCloseStocks, provider: '9/29 부터 매일: 한국거래소 정규장 종가 = 15:30 종가 단일가 분봉(네이버 증권 분봉 원문) · 실행마다 직전 확정 종가를 같은 방법으로 다시 받아 대조 · 9/28 까지: 과거 이력 네이버 차트 + 확정 종가 매일경제 시세판(일부 알파스퀘어) · 당일 종가는 한 출처(대조는 전날 값) · 시가·고가·저가·거래량은 비움(대체거래소 거래가 섞이지 않은 값을 얻지 못함) · 기업행위 조정 미검증', anchorObservedAt: p.assets.map(a => a.anchor.observedAt).sort().at(-1)},
    factors: {total: 36, usedNumerically: factorRows.filter(f => f.used > 0).length, rows: factorRows, missingTypes: missingFactors, zeroModelStocks, note: `F35·F11 은 52종목 모두 수치 입력으로 연결되지만, 내부 선택 결과 ${zeroModelStocks}종목은 계수가 전부 0(평균 성분만 쓰는 zero 모형)이고 비영 계수는 ${52 - zeroModelStocks}종목이다`},
    fomo: {full: p.summary.fullFomoStocks, priceHeat: p.summary.priceHeatStocks, missingComponents: [...new Set(p.assets.flatMap(a => a.fomo?.missing ?? []))], note: '종가만으로는 「가격 열기」 부분지표 · 전체 FOMO 는 검색 관심·거래량 비교·개인 수급·장중 추격 자료가 있어야 산출'},
    news: {events: p.summary.newsEvents, numeric: p.summary.newsNumericEvents, collected: context?.summary?.news ?? null, disclosures: context?.summary?.disclosures ?? null, reason: '확정 일정 + 매일 모은 종목 기사 제목(같은 기사·재게시 가림)과 공시 제목 · 기대 대비 결과·과거 사건 표본 없음 → 수치 미산출 · 전망 숫자에 넣지 않음'},
    context: context ? {day: context.day, fetchedAt: context.fetchedAt, summary: context.summary, factors: Object.values(context.factors ?? {}).map(f => ({factorId: f.factorId, observed: f.observed, stocks: f.stocks ?? null, scope: f.scope ?? 'stock', latest: f.latestObservation ?? null, componentOnly: f.componentOnly === true, label: f.label, note: f.note ?? null, series: (f.series ?? []).map(x => ({series: x.series, label: x.label, latest: x.latestObservation, value: x.value, unit: x.unit}))})), errors: context.errors ?? 0, usedInForecast: false, note: '시장 지수·종목별 수급·기사·공시·거시 시계열을 매일 기록 · 검증을 통과해 채택되기 전까지 전망 숫자에 들어가지 않음'} : null,
    calendar: {...p.provenance.calendar, upcomingSessions: (calendar?.sessions ?? []).filter(d => d > p.actualAsOf).slice(0, 12), holidays: Object.entries(calendar?.holidays ?? {}).filter(([d]) => d >= p.actualAsOf.slice(0, 4) + '-01-01').map(([date, name]) => ({date, name})), notices: calendar?.notices ?? [], coverageEnd: calendar?.coverageEnd ?? null, checkedAt: calendar?.checkedAt ?? null, regularClose: '15:30', timezone: 'Asia/Seoul'}, operation, operations, calendarVersion: p.calendarVersion,
    evidence: {browserReport: '/docs/evidence/browser-report.json', screenshots: '/docs/evidence/', tests: '/docs/evidence/tests.tap', independentCheck: '/docs/evidence/independent-check.md', note: '배포 묶음에 넣은 검사 기록 · 실제 크롬(헤드리스) PC·모바일 조작 검사 · 실기기 검증 아님'},
    integrity: {method: 'manifest.json 의 파일별 SHA-256 을 화면이 읽을 때 다시 계산해 대조 (보안 연결에서만 가능)', standard: 'FIPS 180-4 SHA-256'}, assumptions: p.assumptions, collector: {codeExists: true, collectorModule: 'scripts/atlas11/collect_krx_close.mjs', contextModule: 'scripts/atlas11/collect_context.mjs', schedulerModule: schedule?.workflow ?? 'scripts/atlas11/scheduler.mjs', serverInstalled: schedule?.host === 'github-actions' || schedule?.alive === true, serverKind: schedule?.host === 'github-actions' ? 'GitHub Actions 러너(ubuntu-latest)' : schedule?.alive ? '자체 서버 예약기' : null, scheduledRunInstalled: schedule?.installed === true, lastScheduledRun: schedule?.lastScheduledRun ?? null, siteDeployed: deploy?.state === 'ready', site: deploy ? {url: deploy.url ?? null, state: deploy.state ?? null, at: deploy.at ?? null, deployId: deploy.deployId ?? null} : null, lastCollection: operation?.collection ?? null, note: schedule?.host === 'github-actions' ? '수집·채점·발행·기록은 GitHub 저장소의 예약 실행(러너)에서 돈다 · 기록은 실행마다 저장소에 커밋되어 영구 보존' : '수집기·예약기 코드는 있으나 예약 연결이 확인되지 않음(deploy/ 설명서)'}, schedule: schedule ?? null});
  // manifest
  const manifest = {schema: 'atlas11-view-manifest-1', generatedAt: now, forecastId: p.forecastId, modelVersion: p.modelVersion, issuedAt: p.issuedAt, actualAsOf: p.actualAsOf, currentDateKST: p.currentDateKST, dataStatus: p.dataStatus, publicationStatus: p.publicationStatus, staleAnchor: p.staleAnchor, horizon: p.horizon, futureDates: p.futureDates, summary: p.summary, universe: p.universe, universeHash: p.universeHash, scoreTargetDate: scoreboard.targetDate, firstScorableDate: scoreboard.firstScorableDate, scoredDates: scoreboard.scoredDates, files: {}, csvManifest: '/downloads/atlas11/' + p.forecastId + '/manifest.json'};
  for (const [name, value] of files) manifest.files[name] = {sha256: sha(JSON.stringify(value)), bytes: Buffer.byteLength(JSON.stringify(value))};
  files.set('manifest.json', manifest);
  validateViewBundle(files, p);
  return files;
}

/** 화면 간 일치: 같은 forecastId, 카드·상세·1만원 비교의 숫자가 같은 발행본 값인지 검사 */
export function validateViewBundle(files, publication) {
  const manifest = files.get('manifest.json'), cards = files.get('cards.json'), race = files.get('race.json'), scores = files.get('scores.json'), evolution = files.get('evolution.json'), status = files.get('status.json'), network = files.get('network.json');
  const ids = new Set([manifest.forecastId, cards.forecastId, race.forecastId, evolution.forecastId, status.forecastId, network.forecastId, ...publication.assets.map(a => files.get('stocks/' + a.code + '.json').forecastId)]);
  if (network.nodes.length !== 52 || network.actualAsOf !== publication.actualAsOf || network.groups.reduce((s, g) => s + g.codes.length, 0) !== 52) throw Error('VIEW_NETWORK');
  if (ids.size !== 1 || !ids.has(publication.forecastId)) throw Error('VIEW_FORECAST_ID_MISMATCH');
  if (cards.cards.length !== 52 || new Set(cards.cards.map(c => c.code)).size !== 52 || race.stocks.length !== 52) throw Error('VIEW_52');
  for (const a of publication.assets) {
    const card = cards.cards.find(c => c.code === a.code), detail = files.get('stocks/' + a.code + '.json'), r = race.stocks.find(s => s.code === a.code);
    if (card.close !== a.anchor.close || detail.anchor.close !== a.anchor.close || detail.rows[0].p50 !== a.anchor.close || r.anchorClose !== a.anchor.close) throw Error('VIEW_ANCHOR ' + a.code);
    if (Math.abs(card.day20.p50 - a.rows[20].p50) > 0.01 || Math.abs(detail.rows[20].p50 - a.rows[20].p50) > 0.01 || Math.abs(r.fromToday[19].value - 10000 * a.rows[20].p50 / a.anchor.close) > 1e-6) throw Error('VIEW_DAY20 ' + a.code);
    if (card.day1.selected !== a.rows[1].direction.daily.selected || detail.rows[1].direction.daily.selected !== a.rows[1].direction.daily.selected) throw Error('VIEW_DIRECTION ' + a.code);
    if (Object.keys(detail.explain).length !== 80 || detail.rows.length !== 21 || detail.actual60.length !== 60) throw Error('VIEW_DETAIL_SHAPE ' + a.code);
    if (detail.info?.close !== a.anchor.close || !finite(detail.info.beta) || card.info?.beta !== detail.info.beta) throw Error('VIEW_INFO ' + a.code);
  }
  if (scores.actualAsOf !== publication.actualAsOf) throw Error('VIEW_SCORE_DATE');
  const texts = publication.assets.map(a => files.get('stocks/' + a.code + '.json').explain[publication.futureDates[0]].text);
  if (new Set(texts).size !== 52) throw Error('VIEW_EXPLANATION_DUPLICATED');
  return true;
}
