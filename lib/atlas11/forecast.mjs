/**
 * ATLAS 11 · 발행본 (변경 불가) — 실제 종가 출발 · 20거래일 · 방향 선택 · 대표 시나리오
 * 숫자 출발점은 관측된 실제 종가뿐이다. 이전 전망은 숫자 입력이 아니다.
 */
import fs from 'node:fs/promises';
import path from 'node:path';
import {createHash} from 'node:crypto';
import {FACTOR36_POLICY, pricePanel, examplesFor, fitFactorModel, validateFactorRecords} from '../factor36.mjs';
import {externalDesign} from '../factor36-input.mjs';
import {rollingInput, koreanDate} from '../rolling-forecast.mjs';
import {simulateAtlas11, SIMULATION_POLICY} from './simulate.mjs';
import {fitSpecModel, specDesign, normalizeSpec, specId} from './evolve/models.mjs';

export const FORECAST11_SCHEMA = 'atlas-forecast-11';
export const FORECAST11_POLICY = Object.freeze({id: 'atlas11-rolling20-A-1', modelVersion: 'atlas11-A-1', engine: FACTOR36_POLICY.id, simulation: SIMULATION_POLICY.id, horizon: 20, history: 60, method: 'A', calibration: 'existing_factor36_frozen_before_20260917', interval: 0.8, delta: SIMULATION_POLICY.delta, tieRule: SIMULATION_POLICY.tieRule, closeCallGap: SIMULATION_POLICY.closeCallGap, scenario: SIMULATION_POLICY.scenario, trustProbability: null});
export const IMPORTANT_EVENT_KINDS = Object.freeze(['FOMC', 'BOK', 'CPI', 'PPI', 'JOBS', 'JOLTS']);

const sha = x => createHash('sha256').update(x).digest('hex');
export const canonical = x => Array.isArray(x) ? x.map(canonical) : x && typeof x === 'object' ? Object.fromEntries(Object.keys(x).sort().filter(k => x[k] !== undefined).map(k => [k, canonical(x[k])])) : x;
export const digest = x => sha(JSON.stringify(canonical(x)));
const validDate = d => /^\d{4}-\d{2}-\d{2}$/.test(d ?? '') && Number.isFinite(Date.parse(d)) && new Date(d).toISOString().slice(0, 10) === d;
const finite = x => typeof x === 'number' && Number.isFinite(x);
const QUANTILES = ['p05', 'p10', 'p25', 'p50', 'p75', 'p90', 'p95'];

export function compactNews(newsAssets = []) {
  return newsAssets.map(a => ({code: a.code, news: (a.news ?? []).map(n => ({
    id: n.id, name: n.name, kind: n.kind, date: n.date ?? n.effectiveDate ?? null, scope: n.scope ?? null, route: n.route ?? null, channel: n.channel ?? null, status: n.status ?? null, publishedAt: n.publishedAt ?? null, phaseId: n.phaseId ?? null, economicEventId: n.economicEventId ?? null,
    sources: (n.sources ?? []).map(s => ({name: s.name ?? null, url: s.url ?? null, retrievedAt: s.retrievedAt ?? null})),
    important: IMPORTANT_EVENT_KINDS.includes(n.kind) || n.scope?.type === 'company',
    scheduleVerified: n.evidenceAssessment?.scheduleVerified ?? null,
    classification: n.evidenceAssessment?.classification ?? null,
    used: false, numericImpactAllowed: false, impact: null,
    reason: '확정 일정만 확인 · 기대 대비 결과·비교 가능한 과거 사건 표본이 없어 크기·시차·지속·반전 계수를 추정하지 못함 → 수치 미산출',
  }))}));
}

function previousFor(code, priorPublications, issuedAt, sessions) {
  const previousDay = sessions.filter(d => d < koreanDate(issuedAt)).at(-1);
  const prior = priorPublications.filter(p => (p.schema === FORECAST11_SCHEMA || p.schema === 'atlas-rolling-forecast-1') && (p.forecastId ?? p.id) && Date.parse(p.issuedAt) < Date.parse(issuedAt) && koreanDate(p.issuedAt) === previousDay).sort((a, b) => a.issuedAt.localeCompare(b.issuedAt)).at(-1);
  const a = prior?.assets.find(a => a.code === code);
  return a ? {forecastId: prior.forecastId ?? prior.id, schema: prior.schema, issuedAt: prior.issuedAt, actualAsOf: prior.actualAsOf, rows: a.rows.map(r => ({date: r.date, p10: r.p10, p50: r.p50, p90: r.p90})), source: 'immutable_published_forecast'} : null;
}

/** 운영 A의 방정식을 그대로 다시 적합(동결 구간)하고, 관측된 모든 실제 종가로 상태를 갱신해 새 발행본을 만든다. */
export function buildForecast11({input: source, recordsPayload = {schema: 'atlas-factor36-records-1', records: []}, registry, calendar, issuedAt = new Date().toISOString(), paths = FACTOR36_POLICY.paths, seed = FACTOR36_POLICY.seed, implementationSHA256 = 'unrecorded', priorPublications = [], newsAssets = [], fomo = null, existing = null, modelSpec = null, modelVersion = null, shadow = null}) {
  // 운영 모델 명세(진화 등록부가 정함). 없으면 운영 A. 후보의 고정 입력(carry)은 기준일까지의 가격에서만 계산한다.
  const spec = normalizeSpec(modelSpec ?? {family: 'baseline'}), version = modelVersion ?? (specId(spec) === 'A' ? FORECAST11_POLICY.modelVersion : 'atlas11-' + specId(spec));
  const policyUsed = {...FORECAST11_POLICY, modelVersion: version, modelSpec: {id: specId(spec), family: spec.family, penalties: spec.penalties, volatility: spec.volatility, featureMask: spec.featureMask, carry: spec.carry}, calibration: specId(spec) === 'A' ? FORECAST11_POLICY.calibration : 'candidate_refit_same_frozen_window_before_20260917'};
  const {input, futureDates, historyDates, currentDateKST} = rollingInput({input: source}, {calendar: calendar ?? source.calendar, issuedAt});
  if (registry?.factors?.length !== 36) throw Error('FORECAST11_FACTOR_REGISTRY');
  const records = validateFactorRecords(recordsPayload, {codes: input.assets.map(a => a.code), cutoff: issuedAt});
  const panel = pricePanel(input), models = [], external = [];
  for (let i = 0; i < input.assets.length; i++) {
    const base = externalDesign(records, input.assets[i], panel, examplesFor(panel, i), issuedAt);
    const sd = specDesign(spec, panel, i, input.assets, base.rows);
    const design = {...base, rows: sd.rows, featureFactors: [...base.featureFactors, ...sd.featureFactors.slice(7)], featureNames: [...base.featureNames, ...sd.featureNames.slice(7)], selected: [...base.selected, ...sd.selected]};
    const model = specId(spec) === 'A' ? fitFactorModel(design.rows, {featureFactors: design.featureFactors}) : fitSpecModel(design.rows, spec, {featureFactors: design.featureFactors});
    if (model.status !== 'research_estimate') throw Error('FORECAST11_MODEL_HISTORY ' + input.assets[i].code + ' ' + model.reason);
    external.push(design); models.push(model);
  }
  const news = compactNews(newsAssets);
  const calendarVersion = {checkedAt: input.calendar.checkedAt ?? null, coverageEnd: input.calendar.coverageEnd ?? input.calendar.sessions.at(-1), sessionsSHA256: sha(JSON.stringify(input.calendar.sessions)), status: input.calendar.status};
  const universe = input.assets.map(a => a.code), universeHash = sha(universe.join(','));
  const semantic = {policy: specId(spec) === 'A' && !shadow ? FORECAST11_POLICY : policyUsed, shadow: shadow ? {candidateId: shadow.candidateId} : undefined, implementationSHA256, paths, seed, origin: input.actualAsOf, futureDates, historyCalendar: panel.dates, assets: input.assets.map(a => ({code: a.code, sector: a.sector, prices: a.prices.map(p => ({date: p.date, close: p.close, quality: p.quality ?? null}))})), records, news: news.map(a => ({code: a.code, news: a.news.map(n => ({id: n.id, date: n.date, status: n.status, publishedAt: n.publishedAt, phaseId: n.phaseId}))}))};
  const semanticSHA256 = digest(semantic), forecastId = input.actualAsOf + '-atlas11-' + semanticSHA256.slice(0, 16), csvDate = koreanDate(issuedAt).replaceAll('-', '');
  // 같은 semantic 입력의 발행본이 이미 있으면 모의 계산을 다시 하지 않는다 (같은 입력 재사용 · 원래 시각·파일 유지)
  if (existing && existing(forecastId)) return existing(forecastId);
  const simulation = simulateAtlas11(models, panel, input.assets, futureDates, {paths, seed, external});
  const sessions = calendar?.sessions ?? source.calendar.sessions;
  const earlierToday = priorPublications.filter(p => koreanDate(p.issuedAt) === koreanDate(issuedAt) && Date.parse(p.issuedAt) < Date.parse(issuedAt)).map(p => ({forecastId: p.forecastId ?? p.id, schema: p.schema, issuedAt: p.issuedAt, actualAsOf: p.actualAsOf}));
  const assets = input.assets.map((a, i) => {
    const m = models[i], actual = a.prices.find(p => p.date === input.actualAsOf), rows = simulation.rows[i];
    const anchor = {date: input.actualAsOf, close: actual.close, sourceUrl: actual.sourceUrl ?? a.priceSource?.url ?? null, observedAt: actual.observedAt ?? null, finalClose: actual.finalClose === true, priceBasis: actual.priceBasis ?? null, quality: actual.quality ?? null, adjustmentsVerified: actual.adjustmentsVerified === true};
    const anchorRow = {date: anchor.date, p05: anchor.close, p10: anchor.close, p25: anchor.close, p50: anchor.close, p75: anchor.close, p90: anchor.close, p95: anchor.close, mean: anchor.close, return: 0, anchor: true, eventIds: []};
    const stockNews = news.find(x => x.code === a.code)?.news ?? [];
    const futureRows = rows.map((r, h) => {
      const previousP50 = h === 0 ? anchor.close : rows[h - 1].p50;
      const eventIds = stockNews.filter(n => n.date === r.date).map(n => n.id);
      return {...r, dailyP50Change: r.p50 / previousP50 - 1, eventIds, targetCompletedBeforeIssue: Date.parse(r.date + 'T15:30:00+09:00') <= Date.parse(issuedAt)};
    });
    const factors = registry.factors.map(f => { const used = m.featureFactors.some((id, j) => id === f.id && (m.factorSelection?.acceptedFeatureIndices ?? []).includes(j)) || f.id === 'F36', ext = external[i].selected.find(s => s.factorId === f.id); return {id: f.id, name: f.name ?? f.label ?? f.id, status: used ? (f.id === 'F11' ? 'measured_universe_proxy' : 'measured_research') : 'missing', role: f.id === 'F36' ? 'variance' : used ? 'conditional_mean' : 'not_used', reason: f.id === 'F11' ? 'ATLAS52 가격 폭·평균 대용값 · KOSPI나 공식 업종지수가 아님' : f.id === 'F35' ? '자기 종목 실제 1·2·5·20·60거래일 수익률' : f.id === 'F36' ? '자기 잔차 변동폭(GARCH)' : ext ? '시점·대상 검증 이력' : '검증된 시점별 입력 미확보 → 계수 0', sourceUrl: ext?.current.sourceUrl ?? (used ? a.priceSource?.url ?? null : null)}; });
    const fomoRow = fomo?.stocks52?.find(x => x.code === a.code) ?? null;
    return {code: a.code, name: a.name, sector: a.sector, anchor,
      actual60: historyDates.map(date => { const p = a.prices.find(p => p.date === date); return {date, close: p.close}; }),
      rows: [anchorRow, ...futureRows],
      scenario: {...simulation.scenarios[i], prices: [anchor.close, ...simulation.scenarios[i].prices]},
      previous: previousFor(a.code, priorPublications, issuedAt, sessions), previousReason: '직전 거래일에 실제 발행한 전망이 없으면 표시하지 않습니다.',
      csvUrl: '/downloads/atlas11/' + forecastId + '/ATLAS_' + a.code + '_' + csvDate + '.csv',
      news: stockNews,
      fomo: fomoRow ? {fullFomoScore: fomoRow.fullFomoScore ?? null, priceHeat: fomoRow.priceHeat ?? null, label: fomoRow.partialPriceHeatLabel ?? '종가 기반 가격 열기 · FOMO 전체 점수 아님', coreCoverage: fomoRow.coreCoverage ?? 0, coreTotal: fomoRow.coreTotal ?? 6, missing: fomoRow.missing ?? [], asOf: fomoRow.asOf ?? null, usedInForecast: false} : {fullFomoScore: null, priceHeat: null, label: '미확보', coreCoverage: 0, coreTotal: 6, missing: [], asOf: null, usedInForecast: false},
      model: {id: FACTOR36_POLICY.id, version: version, spec: policyUsed.modelSpec, selected: m.selected, regression: {intercept: m.regression.intercept, beta: m.regression.beta, center: m.regression.center, scale: m.regression.scale, lambda: m.regression.lambda, n: m.regression.n}, volatility: m.volatility, featureNames: external[i].featureNames, featureFactors: m.featureFactors, factors, factorSelection: m.factorSelection, trainedThrough: m.trainedThrough, trainCount: m.trainCount, holdout: {first: m.validation.first, last: m.validation.last, days: m.validation.days, crps: m.validation.crps, baselineCRPS: m.validation.baselineCRPS, directionAccuracy: m.validation.directionAccuracy, baselineDirectionAccuracy: m.validation.baselineDirectionAccuracy, coverage: m.validation.coverage, baselineCoverage: m.validation.baselineCoverage, absolutePriceError: m.validation.absolutePriceError, baselineAbsolutePriceError: m.validation.baselineAbsolutePriceError}, sourceStatus: 'retrospective_single_provider_unadjusted', calibrationFrozenBefore: FACTOR36_POLICY.trainingBefore, stateUpdatedThrough: input.actualAsOf, externalRejected: external[i].rejected, trustProbability: null},
      dataQuality: {priceRows: a.prices.length, history60Complete: true, anchorFinalClose: actual.finalClose === true, anchorObservedAt: actual.observedAt ?? null, priceProvider: a.priceSource?.provider ?? null, adjustmentsVerified: actual.adjustmentsVerified === true, quality: actual.quality ?? null},
      errors: {1: null, 5: null, 10: null, 20: null}};
  });
  const fresh = input.actualAsOf === currentDateKST;
  const publication = {schema: FORECAST11_SCHEMA, forecastId, id: forecastId, modelVersion: version, issuedAt, actualAsOf: input.actualAsOf, currentDateKST, informationCutoff: issuedAt, inputHash: digest(input), calendarVersion, seed, paths, universeHash, universe,
    assumptions: ['출발점은 각 종목의 확인된 실제 종가(0번째 점)이며 이전 전망은 숫자 입력이 아니다', '미래 요인 경로: 외부 검증 요인 없음(F35·F11 은 경로 안에서 갱신, F36 은 GARCH 상태)', '뉴스·전체 FOMO 는 수치 반영 없음(미산출) · 일정만 설명 자료로 연결', '보합 경계 ±0.1% · 동률 규칙 flat→up→down · 확률은 모형 빈도이며 실제 적중률이 아님', '가격 조정(기업행위) 미검증 단일 제공자 이력'],
    dataStatus: fresh ? 'current_close' : 'stored_close', publicationStatus: shadow ? 'shadow_forecast' : fresh ? 'live_research_forecast' : 'stored_close_reference', staleAnchor: !fresh, horizon: 20, futureDates, historyDates,
    policy: {...policyUsed, paths, seed}, shadowOf: shadow?.shadowOf ?? null, candidateId: shadow?.candidateId ?? null, earlierToday, assets,
    summary: {stocks: 52, anchorMatches: assets.filter(a => a.rows[0].p50 === a.anchor.close).length, futurePointsPerStock: 20, afterIssuanceFuturePoints: futureDates.filter(d => Date.parse(d + 'T15:30:00+09:00') > Date.parse(issuedAt)).length, csvFiles: 52, chosenMethod: 'A', methodReason: 'B(실질금리·환율)는 후향 비교에서 오차가 나빠 기각 · A 유지', newCurrentCloseStocks: fresh ? 52 : 0, finalCloseStocks: assets.filter(a => a.anchor.finalClose).length, previousForecastStocks: assets.filter(a => a.previous).length, closeCallStocksDay1: assets.filter(a => a.rows[1].direction.daily.closeCall).length, closeCallStocksDay20: assets.filter(a => a.rows[20].direction.cumulative.closeCall).length, newsEvents: assets.reduce((s, a) => s + a.news.length, 0), newsNumericEvents: 0, fullFomoStocks: assets.filter(a => finite(a.fomo.fullFomoScore)).length, priceHeatStocks: assets.filter(a => finite(a.fomo.priceHeat)).length, trustProbability: null, liveAdvantageProven: false},
    provenance: {semanticSHA256, implementationSHA256, inputSHA256: digest(input), anchorSource: 'observed_close_only', priorForecastUsedAsNumericInput: false, calibration: policyUsed.calibration, modelVersion: version, state: 'own_observed_returns_and_variance_recomputed', priceAdjustmentStatus: 'unverified', backdatedIssuance: false, calendar: {status: input.calendar.status, sources: input.calendar.sources, verifiedThrough: input.calendar.coverageEnd ?? input.calendar.sessions.at(-1)}},
    audit: simulation.audit};
  validateForecast11(publication);
  return publication;
}

export function validateForecast11(p) {
  if (p?.schema !== FORECAST11_SCHEMA || !/^\d{4}-\d{2}-\d{2}-atlas11-[a-f0-9]{16}$/.test(p.forecastId ?? '') || p.id !== p.forecastId || p.assets?.length !== 52 || new Set(p.assets.map(a => a.code)).size !== 52 || p.futureDates?.length !== 20 || p.horizon !== 20 || !Number.isFinite(Date.parse(p.issuedAt)) || !validDate(p.actualAsOf) || p.universe?.length !== 52) throw Error('FORECAST11_CONTRACT');
  if (p.futureDates.some((d, i) => !validDate(d) || d <= p.actualAsOf || [0, 6].includes(new Date(d).getUTCDay()) || i && d <= p.futureDates[i - 1])) throw Error('FORECAST11_FUTURE_SESSIONS');
  for (const a of p.assets) {
    if (!/^\d{6}$/.test(a.code) || a.anchor?.date !== p.actualAsOf || !finite(a.anchor.close) || a.anchor.close <= 0 || a.rows?.length !== 21 || a.actual60?.length !== 60 || a.scenario?.prices?.length !== 21) throw Error('FORECAST11_ASSET_CONTRACT ' + a.code);
    const r = a.rows[0], last = a.actual60.at(-1);
    if (r.date !== p.actualAsOf || !r.anchor || QUANTILES.some(q => r[q] !== a.anchor.close) || last.date !== p.actualAsOf || last.close !== a.anchor.close || a.scenario.prices[0] !== a.anchor.close) throw Error('FORECAST11_ANCHOR_DIFFERENCE ' + a.code);
    for (let j = 1; j < 21; j++) {
      const row = a.rows[j];
      if (row.date !== p.futureDates[j - 1] || QUANTILES.some(q => !finite(row[q]) || row[q] <= 0) || QUANTILES.some((q, k) => k && row[q] < row[QUANTILES[k - 1]])) throw Error('FORECAST11_ROW_CONTRACT ' + a.code + ' ' + row.date);
      for (const kind of ['daily', 'cumulative']) { const d = row.direction?.[kind]; const sum = d ? d.probabilities.up + d.probabilities.flat + d.probabilities.down : NaN; if (!d || Math.abs(sum - 1) > 1e-9 || !['up', 'flat', 'down'].includes(d.selected) || Object.values(d.probabilities).some(v => v > d.probabilities[d.selected])) throw Error('FORECAST11_DIRECTION ' + a.code + ' ' + row.date); }
      if (!finite(a.scenario.prices[j]) || a.scenario.prices[j] <= 0) throw Error('FORECAST11_SCENARIO ' + a.code);
    }
    if (a.previous && ((a.previous.forecastId === p.forecastId) || Date.parse(a.previous.issuedAt) >= Date.parse(p.issuedAt) || a.previous.source !== 'immutable_published_forecast')) throw Error('FORECAST11_PREVIOUS_NOT_PRIOR');
  }
  return true;
}

/** CSV: 출발행(실제) 1 + 전망 20 = 21행. 열: 날짜,구분,예측값,상단,하단 */
export function forecastCSV(asset) {
  if (asset.rows?.length !== 21) throw Error('FORECAST11_CSV_ROWS');
  return '﻿날짜,구분,예측값,상단,하단\r\n' + asset.rows.map((r, j) => [r.date, j ? '전망' : '실제출발', Math.round(r.p50), Math.round(r.p90), Math.round(r.p10)].join(',')).join('\r\n') + '\r\n';
}

async function readJSON(file) { try { return JSON.parse(await fs.readFile(file, 'utf8')); } catch (e) { if (e.code === 'ENOENT') return null; throw e; } }
async function immutable(file, bytes) { try { await fs.writeFile(file, bytes, {flag: 'wx'}); } catch (e) { if (e.code !== 'EEXIST') throw e; const old = await fs.readFile(file); if (!old.equals(Buffer.from(bytes))) throw Error('FORECAST11_IMMUTABLE_CONFLICT ' + file); } }
async function atomic(file, bytes) { const tmp = file + '.' + process.pid + '.tmp'; try { await fs.writeFile(tmp, bytes, {flag: 'wx'}); await fs.rename(tmp, file); } finally { await fs.rm(tmp, {force: true}); } }

export const FORECAST11_PATHS = Object.freeze({versions: 'reports/atlas11/versions', latest: 'public/data/atlas11/forecast.json', latestReport: 'reports/atlas11/latest.json', csv: 'public/downloads/atlas11', lock: 'reports/atlas11/publish.lock'});

/** 같은 semantic 입력이면 기존 발행본을 재사용한다. 모든 파일이 보이고 나서 latest 포인터를 원자적으로 바꾼다. */
export async function persistForecast11(publication, {rootDir = '.', expectedLatestId = null} = {}) {
  validateForecast11(publication);
  const versions = path.join(rootDir, FORECAST11_PATHS.versions), latestFile = path.join(rootDir, FORECAST11_PATHS.latest), reports = path.join(rootDir, 'reports/atlas11');
  await fs.mkdir(versions, {recursive: true}); await fs.mkdir(path.dirname(latestFile), {recursive: true});
  const lock = await fs.open(path.join(rootDir, FORECAST11_PATHS.lock), 'wx');
  try {
    const latest = await readJSON(latestFile); if (latest) validateForecast11(latest);
    if ((latest?.forecastId ?? null) !== expectedLatestId) throw Error('FORECAST11_LATEST_CONFLICT');
    const versionFile = path.join(versions, publication.forecastId + '.json'), existing = await readJSON(versionFile);
    if (existing && (existing.provenance?.semanticSHA256 !== publication.provenance?.semanticSHA256 || existing.provenance?.implementationSHA256 !== publication.provenance?.implementationSHA256)) throw Error('FORECAST11_ID_COLLISION');
    const chosen = existing ?? publication; validateForecast11(chosen);
    const csvDir = path.join(rootDir, FORECAST11_PATHS.csv, chosen.forecastId); await fs.mkdir(csvDir, {recursive: true});
    const csvFiles = [];
    for (const a of chosen.assets) {
      const basename = 'ATLAS_' + a.code + '_' + koreanDate(chosen.issuedAt).replaceAll('-', '') + '.csv';
      if (a.csvUrl !== '/downloads/atlas11/' + chosen.forecastId + '/' + basename) throw Error('FORECAST11_CSV_PATH_CONTRACT');
      const bytes = forecastCSV(a); await immutable(path.join(csvDir, basename), bytes); csvFiles.push({code: a.code, file: basename, sha256: sha(bytes), anchor: a.anchor.close, anchorDate: a.anchor.date, rows: 21, anchorRowIncluded: true, futurePoints: 20});
    }
    await immutable(path.join(csvDir, 'manifest.json'), JSON.stringify({schema: 'atlas11-csv-manifest-1', forecastId: chosen.forecastId, issuedAt: chosen.issuedAt, actualAsOf: chosen.actualAsOf, dataStatus: chosen.dataStatus, columns: ['날짜', '구분', '예측값', '상단', '하단'], rowsPerFile: 21, anchorRowIncluded: true, files: csvFiles}, null, 2));
    const bytes = JSON.stringify(chosen);
    await immutable(versionFile, bytes);
    if (latest?.forecastId !== chosen.forecastId) await atomic(latestFile, bytes);
    const result = {forecastId: chosen.forecastId, issuedAt: chosen.issuedAt, actualAsOf: chosen.actualAsOf, reused: Boolean(existing), createdForecastFiles: existing ? 0 : 52, csvFiles: 52, archive: path.relative(rootDir, versionFile), publicationSHA256: sha(bytes), publication: chosen};
    await atomic(path.join(reports, 'latest.json'), JSON.stringify({...result, publication: undefined, summary: chosen.summary}, null, 2));
    return result;
  } finally { await lock.close(); await fs.unlink(path.join(rootDir, FORECAST11_PATHS.lock)); }
}

/** 옛 발행본(atlas-rolling-forecast-1)과 새 발행본을 모두 읽는다. 각각 자기 검사기를 통과해야 한다. */
export async function readAllPublications(rootDir = '.') {
  const {validateRollingPublication} = await import('../rolling-forecast.mjs');
  const out = [];
  for (const [dir, validate] of [['reports/rolling/versions', validateRollingPublication], [FORECAST11_PATHS.versions, validateForecast11]]) {
    let files; try { files = await fs.readdir(path.join(rootDir, dir)); } catch (e) { if (e.code === 'ENOENT') continue; throw e; }
    for (const file of files.filter(f => f.endsWith('.json')).sort()) { const p = JSON.parse(await fs.readFile(path.join(rootDir, dir, file), 'utf8')); validate(p); out.push(p); }
  }
  return out.sort((a, b) => Date.parse(a.issuedAt) - Date.parse(b.issuedAt));
}
