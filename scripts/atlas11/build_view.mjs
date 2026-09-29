/**
 * ATLAS 11 · 화면 묶음 만들기 — public/data/atlas11/view/ (모든 화면이 같은 forecastId)
 *   node scripts/atlas11/build_view.mjs [--now ISO]
 */
import fs from 'node:fs/promises';
import path from 'node:path';
import {createHash} from 'node:crypto';
import {readAllPublications, validateForecast11} from '../../lib/atlas11/forecast.mjs';
import {buildViewBundle} from '../../lib/atlas11/view.mjs';
import {readRecords, currentRecords} from '../../lib/atlas11/records.mjs';
import {loadState} from '../../lib/atlas11/evolve/registry.mjs';
import {generateCandidates} from '../../lib/atlas11/evolve/models.mjs';

const root = process.cwd();
const arg = name => { const i = process.argv.indexOf(name); return i < 0 ? null : process.argv[i + 1]; };
const read = async (file, otherwise) => { try { return JSON.parse(await fs.readFile(path.join(root, file), 'utf8')); } catch (e) { if (e.code === 'ENOENT' && otherwise !== undefined) return otherwise; throw e; } };

/** 9/24 재구성본(9/17 기준)을 작은 참고 파일로 뽑는다 — 실시간 발행 아님. 만들어진 뒤에 온 날짜만 대조한다. */
export async function loadArchiveReconstruction(input) {
  const cached = await read('public/data/atlas11/archive-fixed-20260917.json', null);
  if (cached) return cached;
  const raw = await fs.readFile(path.join(root, 'public/data/atlas.json'));
  const bundle = JSON.parse(raw), o = bundle.original;
  const originalSHA256 = createHash('sha256').update(JSON.stringify(o)).digest('hex');
  const createdDay = new Date(Date.parse(o.createdAt) + 9 * 3600000).toISOString().slice(0, 10);
  const stocks = o.assets.map(a => ({code: a.code, name: a.name, originPrice: a.originPrice, rows: a.rows.map(r => ({date: r.date, p10: r.p10, p50: r.p50, p90: r.p90}))}));
  const comparison = [];
  for (const s of stocks) {
    const prices = new Map(input.assets.find(a => a.code === s.code)?.prices.map(p => [p.date, p.close]) ?? []);
    for (const r of s.rows) { if (r.date <= createdDay || !prices.has(r.date)) continue; const actual = prices.get(r.date); comparison.push({code: s.code, date: r.date, p50: r.p50, actual, ape: Math.abs(r.p50 - actual) / actual * 100, covered: actual >= r.p10 && actual <= r.p90}); }
  }
  const dates = [...new Set(comparison.map(c => c.date))].sort();
  const archive = {schema: 'atlas11-archive-reconstruction-1', id: o.id, modelVersion: o.modelVersion, origin: o.origin, end: o.end, createdAt: o.createdAt, createdDayKST: createdDay, isRetrospectiveReconstruction: o.isRetrospectiveReconstruction === true, originalJSONStringifySHA256: originalSHA256, expectedSHA256: '1af446f745c88cfb308de348f238f2fa8d31265b5322e2f035f5aafb6d5833ca', hashMatches: originalSHA256 === '1af446f745c88cfb308de348f238f2fa8d31265b5322e2f035f5aafb6d5833ca', paths: o.paths, stocks, comparedDatesAfterCreation: dates.map(d => { const rows = comparison.filter(c => c.date === d); return {date: d, stocks: rows.length, meanAPE: rows.reduce((s, c) => s + c.ape, 0) / rows.length, coverage: rows.filter(c => c.covered).length / rows.length}; }), comparison, label: '9/24 에 만든 재구성본(9/17 출발) · 당시 발행 아님 · 만들어진 뒤 온 날짜만 참고 대조 · 실시간 성적 아님'};
  await fs.writeFile(path.join(root, 'public/data/atlas11/archive-fixed-20260917.json'), JSON.stringify(archive));
  return archive;
}

export async function buildAndWriteView({now = new Date().toISOString()} = {}) {
  const [publication, input, calendar, publications, abLatest, factorStatus, operation] = await Promise.all([read('public/data/atlas11/forecast.json'), read('public/data/input.json'), read('public/data/rolling-calendar.json'), readAllPublications(root), read('reports/atlas11/ab/latest.json', null), read('public/data/factor36-status.json', null), read('reports/atlas11/operations/latest.json', null)]);
  validateForecast11(publication);
  const ab = abLatest ? await read('reports/atlas11/ab/' + abLatest.runId + '/result.json', null) : null;
  const previousCandidate = await read('reports/prediction-candidate/result.json', null);
  const abHistory = [previousCandidate ? {label: '이전 세션 실행(2026-09-28 10:47Z) · 이번 실행 아님', at: previousCandidate.at, A: previousCandidate.A, B: previousCandidate.B, numericalGate: previousCandidate.numericalGate, adopted: false} : null, ab ? {label: '이번 세션 실행', at: ab.finishedAt, A: ab.A, B: ab.B, numericalGate: ab.numericalGate, adopted: false, runId: ab.runId} : null].filter(Boolean);
  const archive = await loadArchiveReconstruction(input);
  let operations = [];
  try { const dir = path.join(root, 'reports/atlas11/operations'); const names = (await fs.readdir(dir)).filter(f => /^\d{4}-\d{2}-\d{2}T.*\.json$/.test(f)).sort().slice(-12).reverse(); for (const f of names) { const o = JSON.parse(await fs.readFile(path.join(dir, f), 'utf8')); operations.push({at: o.at, status: o.status, exitCode: o.exitCode, forecastId: o.forecastId ?? null, newForecast: o.newForecast ?? null, collectionAttempted: o.collection?.attempted ?? null, confirmedTodayStocks: o.confirmedTodayStocks ?? null, scoredDates: o.scoredDates ?? null, reason: o.forecastWithheldReason ?? o.error ?? null}); } } catch (e) { if (e.code !== 'ENOENT') throw e; }
  const scenarioStability = await read('reports/atlas11/scenario-stability.json', null);
  // 자동 진화: 등록부 상태 · 후보 검증 결과(네 숫자·관문) · 설정 요약 · 요인 관리표 · 기록 색인 · 일일 보고 · 예약 상태
  const evolveConfig = await read('config/atlas11/evolution.v1.json', null), scoringPolicy = await read('config/atlas11/scoring-policy.v1.json', null);
  let evolve = null;
  if (evolveConfig) {
    const state = await loadState(root, evolveConfig), candidates = generateCandidates(evolveConfig);
    const backtests = [];
    for (const id of ['A', ...candidates.map(c => c.id)]) { const b = await read('reports/atlas11/evolve/backtests/' + id + '.json', null); if (b) backtests.push({specId: id, label: id === 'A' ? '운영 A' : candidates.find(c => c.id === id)?.label, family: b.spec.family, complete: b.complete, origins: b.origins, summary: b.summary, byBlock: b.byBlock.map(x => ({block: x.block, meanErrorPct: x.meanErrorPct, rankHits: x.rankHits})), elapsedMs: b.elapsedMs, finishedAt: b.finishedAt}); }
    const A = backtests.find(b => b.specId === 'A');
    evolve = {config: {version: evolveConfig.version, limits: evolveConfig.limits, validation: evolveConfig.validation, adoption: {coreRule: evolveConfig.adoption.coreRule, gates: Object.fromEntries(Object.entries(evolveConfig.adoption.gates).map(([k, g]) => [k, g.rule])), uncertainty: evolveConfig.adoption.uncertainty.rule}, liveObservation: evolveConfig.liveObservation, rollback: evolveConfig.rollback, schedule: evolveConfig.schedule, states: evolveConfig.states, families: evolveConfig.candidateFamilies.map(f => ({family: f.family, variable: f.variable, note: f.note, count: f.allowed.length}))},
      scoringPolicy: scoringPolicy ? {version: scoringPolicy.version, frozenAt: scoringPolicy.frozenAt, firstScorableClose: scoringPolicy.firstScorableClose, flatDelta: scoringPolicy.flatDelta, priceHitTolerancePct: scoringPolicy.priceHitTolerancePct, priceHitBasis: scoringPolicy.priceHitBasis, classes: scoringPolicy.classes, causeCategories: scoringPolicy.causeCategories, evidenceLabels: scoringPolicy.evidenceLabels} : null,
      operating: state.operating, previousValidated: state.previousValidated, adoptions: state.adoptions, rollbacks: state.rollbacks, lastNoChange: state.lastNoChange ?? null, events: state.events,
      candidates: candidates.map(c => { const st = state.candidates[c.id] ?? null, bt = backtests.find(b => b.specId === c.id); return {candidateId: c.id, family: c.family, label: c.label, spec: {penalties: c.penalties, volatility: c.volatility, featureMask: c.featureMask, carry: c.carry}, status: st?.status ?? '후보 생성', statusKey: st?.statusKey ?? 'created', createdAt: st?.createdAt ?? null, backtestedAt: st?.backtestedAt ?? null, four: bt && A ? {operatingErrorPct: A.summary.meanErrorPct, candidateErrorPct: bt.summary.meanErrorPct, operatingRankHits: A.summary.rankHits, candidateRankHits: bt.summary.rankHits, rankMaximum: A.origins * 5} : null, summary: bt?.summary ?? null, gates: st?.gates ? {passed: st.gates.passed, status: st.gates.status, reasons: st.gates.reasons, gates: Object.fromEntries(Object.entries(st.gates.gates ?? {}).map(([k, g]) => [k, {passed: g.passed, A: g.A ?? null, B: g.B ?? null}])), uncertainty: st.gates.uncertainty ? {probabilityCandidateBetter: st.gates.uncertainty.probabilityCandidateBetter, blocksBetter: st.gates.uncertainty.blocksBetter, blocks: st.gates.uncertainty.blocks, ci90: st.gates.uncertainty.ci90} : null} : null, observation: st?.observation ?? null, rejectReason: st?.rejectReason ?? null, pendingReason: st?.pendingReason ?? null, history: st?.history ?? []}; }),
      backtests, operatingBacktest: A ?? null};
  }
  let ledger = await read('public/data/atlas11/ledger/index.json', null);
  const dailyIndex = await read('public/data/atlas11/daily/index.json', null), dailyReport = dailyIndex?.latest ? await read('public/data/atlas11/daily/' + dailyIndex.latest + '.json', null) : null;
  if (ledger && dailyIndex) ledger = {...ledger, dailyReports: dailyIndex};
  const factorRecords = currentRecords(await readRecords(root, 'factor')), lastFactorDay = factorRecords.map(r => r.body.day).sort().at(-1);
  if (evolve) evolve.factorTable = factorRecords.filter(r => r.body.day === lastFactorDay).map(r => r.body).sort((a, b) => a.factorId.localeCompare(b.factorId));
  const scoreRecords = currentRecords(await readRecords(root, 'score')).map(r => r.body).filter(c => c.kind === 'live');
  const analysisRecords = currentRecords(await readRecords(root, 'analysis')).map(r => r.body).filter(a => a.kind === 'cell');
  const scoreHistory = {byCode: {}};
  for (const c of scoreRecords) { const an = analysisRecords.find(a => a.forecastId === c.forecastId && a.code === c.code && a.targetDate === c.targetDate); (scoreHistory.byCode[c.code] ??= []).push({forecastId: c.forecastId, modelVersion: c.modelVersion, originDate: c.originDate, targetDate: c.targetDate, horizon: c.horizon, p50: c.predicted.p50, p10: c.lower, p90: c.upper, actual: c.actual, ape: c.ape, priceError: c.priceError, predictedDirection: c.predictedDirection, actualDirection: c.actualDirection, directionCorrect: c.directionCorrect, priceHit: c.priceHit, covered: c.covered, class: c.class, classLabel: c.classLabel, brier: c.brier, causes: an?.causes ?? null, facts: an?.facts ?? null, hypotheses: an?.hypotheses ?? null}); }
  for (const k of Object.keys(scoreHistory.byCode)) scoreHistory.byCode[k].sort((a, b) => a.targetDate.localeCompare(b.targetDate) || a.horizon - b.horizon);
  const heartbeat = await read('reports/atlas11/operations/scheduler-heartbeat.json', null);
  let schedulerRuns = []; try { schedulerRuns = (await fs.readFile(path.join(root, 'reports/atlas11/operations/scheduler-runs.jsonl'), 'utf8')).split('\n').filter(Boolean).slice(-10).map(l => JSON.parse(l)); } catch (e) { if (e.code !== 'ENOENT') throw e; }
  // 살아 있는 예약기 = heartbeat 가 있고 멈춤 표시가 없고 10분 안에 갱신된 것. 멈춘 heartbeat 는 「설치됨」이 아니다.
  const hbAge = heartbeat?.lastHeartbeat ? (Date.parse(now) - Date.parse(heartbeat.lastHeartbeat)) / 60000 : null;
  const alive = Boolean(heartbeat) && heartbeat.status !== 'stopped' && hbAge != null && hbAge <= 10;
  const schedule = {runTimeKST: evolveConfig?.schedule?.runTimeKST ?? '16:00', publishEnd: evolveConfig?.schedule?.publishEnd ?? null, installed: alive, alive, heartbeat, heartbeatAgeMinutes: hbAge != null ? Math.round(hbAge) : null, recentRuns: schedulerRuns, note: alive ? `예약기 살아 있음(heartbeat ${Math.round(hbAge)}분 전)` : heartbeat ? `예약기 멈춤(마지막 heartbeat ${heartbeat.lastHeartbeat}, 상태 ${heartbeat.status ?? '미상'}) — 지금 실행 중 아님 · 서버·예약이 설치되지 않음(deploy/README.md)` : '예약기 heartbeat 없음 — 이 환경에는 서버·예약이 설치되지 않음(deploy/README.md)'};
  const files = buildViewBundle({publication, input, calendar, publications, ab, abHistory, factorStatus, operations, scenarioStability, evolve, ledger, scoreHistory, dailyReport, schedule, archive: {id: archive.id, createdAt: archive.createdAt, createdDayKST: archive.createdDayKST, hashMatches: archive.hashMatches, comparedDatesAfterCreation: archive.comparedDatesAfterCreation, label: archive.label, file: '/data/atlas11/archive-fixed-20260917.json'}, operation: operation ? {at: operation.at, status: operation.status, exitCode: operation.exitCode, collection: operation.collection ?? null, forecastId: operation.forecastId ?? null} : null, now});
  const dir = path.join(root, 'public/data/atlas11/view');
  await fs.rm(dir + '.next', {recursive: true, force: true});
  await fs.mkdir(path.join(dir + '.next', 'stocks'), {recursive: true});
  for (const [name, value] of files) await fs.writeFile(path.join(dir + '.next', name), JSON.stringify(value));
  await fs.rm(dir, {recursive: true, force: true}); await fs.rename(dir + '.next', dir);
  const manifest = files.get('manifest.json');
  return {forecastId: manifest.forecastId, files: files.size, dir: path.relative(root, dir), scoreTargetDate: manifest.scoreTargetDate, firstScorableDate: manifest.firstScorableDate, scoredDates: manifest.scoredDates, bytes: [...files.values()].reduce((s, v) => s + Buffer.byteLength(JSON.stringify(v)), 0)};
}

if (process.argv[1] && path.resolve(process.argv[1]) === new URL(import.meta.url).pathname) {
  console.log(JSON.stringify(await buildAndWriteView({now: arg('--now') ?? new Date().toISOString()})));
}
