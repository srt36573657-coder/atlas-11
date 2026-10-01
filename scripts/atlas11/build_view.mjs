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
import {decodeEntities} from '../../lib/atlas11/context.mjs';
import {buildTimeline} from '../../lib/atlas11/timeline.mjs';
import {recountTimeline, compareTimeline} from '../../lib/atlas11/timeline_check.mjs';

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
  const files = await buildViewFiles({now});
  const dir = path.join(root, 'public/data/atlas11/view');
  await fs.rm(dir + '.next', {recursive: true, force: true});
  await fs.mkdir(path.join(dir + '.next', 'stocks'), {recursive: true});
  for (const [name, value] of files) await fs.writeFile(path.join(dir + '.next', name), JSON.stringify(value));
  await fs.rm(dir, {recursive: true, force: true}); await fs.rename(dir + '.next', dir);
  const manifest = files.get('manifest.json');
  return {forecastId: manifest.forecastId, files: files.size, dir: path.relative(root, dir), scoreTargetDate: manifest.scoreTargetDate, firstScorableDate: manifest.firstScorableDate, scoredDates: manifest.scoredDates, bytes: [...files.values()].reduce((s, v) => s + Buffer.byteLength(JSON.stringify(v)), 0)};
}

/** 화면 묶음을 메모리에서만 만든다(파일에 쓰지 않음) — 대개선 검사(T4 · 두 번 만들기)도 이것을 쓴다 */
export async function buildViewFiles({now = new Date().toISOString()} = {}) {
  const [publication, input, calendar, publications, abLatest, factorStatus, operation] = await Promise.all([read('public/data/atlas11/forecast.json'), read('public/data/input.json'), read('public/data/rolling-calendar.json'), readAllPublications(root), read('reports/atlas11/ab/latest.json', null), read('public/data/factor36-status.json', null), read('reports/atlas11/operations/latest.json', null)]);
  validateForecast11(publication);
  const ab = abLatest ? await read('reports/atlas11/ab/' + abLatest.runId + '/result.json', null) : null;
  const previousCandidate = await read('reports/prediction-candidate/result.json', null);
  const abHistory = [previousCandidate ? {label: '이전 세션 실행(2026-09-28 10:47Z) · 이번 실행 아님', at: previousCandidate.at, A: previousCandidate.A, B: previousCandidate.B, numericalGate: previousCandidate.numericalGate, adopted: false} : null, ab ? {label: '이번 세션 실행', at: ab.finishedAt, A: ab.A, B: ab.B, numericalGate: ab.numericalGate, adopted: false, runId: ab.runId} : null].filter(Boolean);
  const archive = await loadArchiveReconstruction(input);
  let operations = [];
  try { const dir = path.join(root, 'reports/atlas11/operations'); const names = (await fs.readdir(dir)).filter(f => /^\d{4}-\d{2}-\d{2}T.*\.json$/.test(f)).sort().slice(-12).reverse(); for (const f of names) { const o = JSON.parse(await fs.readFile(path.join(dir, f), 'utf8')); operations.push({at: o.at, event: o.runtime?.event ?? (o.runtime?.host ?? null), runUrl: o.runtime?.runUrl ?? null, status: o.status, exitCode: o.exitCode, forecastId: o.forecastId ?? null, newForecast: o.newForecast ?? null, collectionAttempted: o.collection?.attempted ?? null, confirmedTodayStocks: o.confirmedTodayStocks ?? null, scoredDates: o.scoredDates ?? null, reason: o.forecastWithheldReason ?? o.error ?? null}); } } catch (e) { if (e.code !== 'ENOENT') throw e; }
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
  // 같은 날 여러 번 실행하면 요인 기록이 여러 벌 쌓인다(덮어쓰지 않음) — 현황표는 요인마다 그날 마지막 기록 하나
  if (evolve) { const lastByFactor = new Map(); for (const r of factorRecords.filter(r => r.body.day === lastFactorDay).sort((a, b) => String(a.at).localeCompare(String(b.at)))) lastByFactor.set(r.body.factorId, {...r.body, recordedAt: r.at, recordId: r.id}); evolve.factorTable = [...lastByFactor.values()].sort((a, b) => a.factorId.localeCompare(b.factorId)); evolve.factorTableNote = `${lastFactorDay} 기록 ${factorRecords.filter(r => r.body.day === lastFactorDay).length}건 중 요인마다 마지막 기록`; }
  const scoreLedger = currentRecords(await readRecords(root, 'score'));
  const scoreRecords = scoreLedger.map(r => r.body).filter(c => c.kind === 'live');
  const analysisRecords = currentRecords(await readRecords(root, 'analysis')).map(r => r.body).filter(a => a.kind === 'cell');
  const scoreHistory = {byCode: {}};
  for (const c of scoreRecords) { const an = analysisRecords.findLast(a => a.forecastId === c.forecastId && a.code === c.code && a.targetDate === c.targetDate); /* 같은 셀을 새 방법으로 다시 분석하면 기록이 덧붙는다 → 마지막(최신) 분석을 보인다 */ (scoreHistory.byCode[c.code] ??= []).push({forecastId: c.forecastId, modelVersion: c.modelVersion, originDate: c.originDate, targetDate: c.targetDate, horizon: c.horizon, p50: c.predicted.p50, p10: c.lower, p90: c.upper, actual: c.actual, ape: c.ape, priceError: c.priceError, predictedDirection: c.predictedDirection, actualDirection: c.actualDirection, directionCorrect: c.directionCorrect, priceHit: c.priceHit, covered: c.covered, class: c.class, classLabel: c.classLabel, brier: c.brier, causes: an?.causes ?? null, facts: an?.facts ?? null, hypotheses: an?.hypotheses ?? null, analysisVersion: an?.analysisVersion ?? null, evidence: an?.evidence ? {news: an.evidence.news, disclosures: {count: an.evidence.disclosures.count, corporateActions: an.evidence.disclosures.corporateActions}, flows: an.evidence.flows} : null}); }
  for (const k of Object.keys(scoreHistory.byCode)) scoreHistory.byCode[k].sort((a, b) => a.targetDate.localeCompare(b.targetDate) || a.horizon - b.horizon);
  const heartbeat = await read('reports/atlas11/operations/scheduler-heartbeat.json', null);
  let schedulerRuns = []; try { schedulerRuns = (await fs.readFile(path.join(root, 'reports/atlas11/operations/scheduler-runs.jsonl'), 'utf8')).split('\n').filter(Boolean).slice(-10).map(l => JSON.parse(l)); } catch (e) { if (e.code !== 'ENOENT') throw e; }
  // 예약 상태 — 기본 운영은 GitHub Actions(저장소의 .github/workflows/atlas11-daily.yml · 평일 07:00 UTC = 16:00 KST).
  //   「예약 연결」은 워크플로 파일에 cron 이 있다는 뜻이고, 「예약 실행 확인」은 러너가 schedule 이벤트로 시작한 실행 기록이 있다는 뜻이다. 둘을 섞지 않는다.
  let workflowText = null; try { workflowText = await fs.readFile(path.join(root, '.github/workflows/atlas11-daily.yml'), 'utf8'); } catch (e) { if (e.code !== 'ENOENT') throw e; }
  const crons = [...(workflowText ?? '').matchAll(/cron:\s*'([^']+)'/g)].map(m => m[1]), cron = crons[0] ?? null;
  const kst = c => { const [m, h, , , dow] = c.split(/\s+/); return `${dow === '1-5' ? '평일 ' : ''}${String((Number(h) + 9) % 24).padStart(2, '0')}:${String(m).padStart(2, '0')} KST`; };
  const cronText = crons.length ? kst(crons[0]) + (crons.length > 1 ? ` (예비 ${crons.slice(1).map(c => kst(c).replace('평일 ', '')).join(' · ')})` : '') : null;
  const ghRuns = []; try { const dir = path.join(root, 'reports/atlas11/operations'); for (const f of (await fs.readdir(dir)).filter(f => /^\d{4}-\d{2}-\d{2}T.*\.json$/.test(f)).sort()) { const o = JSON.parse(await fs.readFile(path.join(dir, f), 'utf8')); if (o.runtime?.host === 'github-actions') ghRuns.push({at: o.at, event: o.runtime.event, runUrl: o.runtime.runUrl ?? null, status: o.status, exitCode: o.exitCode, confirmedTodayStocks: o.confirmedTodayStocks ?? null, forecastId: o.forecastId ?? null}); } } catch (e) { if (e.code !== 'ENOENT') throw e; }
  const lastScheduled = ghRuns.filter(r => r.event === 'schedule').at(-1) ?? null, lastManual = ghRuns.filter(r => r.event !== 'schedule').at(-1) ?? null;
  const hbAge = heartbeat?.lastHeartbeat ? (Date.parse(now) - Date.parse(heartbeat.lastHeartbeat)) / 60000 : null;
  const alive = Boolean(heartbeat) && heartbeat.status !== 'stopped' && hbAge != null && hbAge <= 10;
  const schedule = {host: cron ? 'github-actions' : alive ? 'self-hosted' : null, cron, cronMeaning: cronText, crons, workflow: cron ? '.github/workflows/atlas11-daily.yml' : null, runTimeKST: evolveConfig?.schedule?.runTimeKST ?? '16:00', publishEnd: evolveConfig?.schedule?.publishEnd ?? null, installed: Boolean(cron) || alive, alive, heartbeat, heartbeatAgeMinutes: hbAge != null ? Math.round(hbAge) : null, recentRuns: schedulerRuns, githubRuns: ghRuns.slice(-12).reverse(), lastScheduledRun: lastScheduled, lastManualRun: lastManual,
    note: cron ? (lastScheduled ? `GitHub Actions 예약 실행 확인 · 마지막 예약 실행 ${lastScheduled.at} · ${lastScheduled.status}` : `예약 연결 완료(GitHub Actions ${cronText}) · 첫 예약 실행 확인 대기${lastManual ? ` · 손으로 시작한 실행 마지막 ${lastManual.at}` : ''} · 휴장일에는 「거래일 아님」으로 끝남 · GitHub 예약은 몇 분 늦게 시작할 수 있음`) : alive ? `예약기 살아 있음(heartbeat ${Math.round(hbAge)}분 전)` : '예약 연결 없음 — 워크플로 파일도, 살아 있는 예약기도 없음(deploy/README.md)'};
  // 사이트 배포 기록(Netlify) — 배포 단계가 남긴 파일만 믿는다
  const deploy = await read('reports/atlas11/operations/deploy-latest.json', null);
  // 관측 수집(시장·수급·뉴스·공시·거시) — 요약 + 종목별 최근 값
  const contextLatest = await read('reports/atlas11/context/latest.json', null);
  let contextByCode = null, marketIndex = null;
  if (contextLatest?.file) {
    const snap = await read(contextLatest.file, null);
    // 시장 띠(코스피·코스닥): 같은 수집 기록의 지수 원문 행 · 출처 주소·원문 해시 그대로
    // 값이 비거나 숫자가 아닌 지수는 싣지 않는다(시장 띠는 「미수집」으로 보이고 발행은 멈추지 않음)
    if (snap?.index?.length) marketIndex = {day: snap.day, fetchedAt: snap.fetchedAt, file: contextLatest.file, items: snap.index.filter(i => i.rows?.length).map(i => { const r = i.rows.find(x => x.date === snap.day) ?? i.rows.at(-1); return {symbol: i.symbol, name: i.symbol === 'KOSPI' ? '코스피' : i.symbol === 'KOSDAQ' ? '코스닥' : i.symbol, date: r.date, close: r.close, change: r.change ?? null, changePct: r.changePct, status: r.date === snap.day ? 'same_day' : 'earlier_day', sourceName: '네이버 증권 지수', sourceUrl: i.sourceUrl ?? null, rawSHA256: i.rawSHA256 ?? null}; }).filter(x => Number.isFinite(x.close) && Number.isFinite(x.changePct) && /^\d{4}-\d{2}-\d{2}$/.test(x.date ?? ''))};
    if (marketIndex && !marketIndex.items.length) marketIndex = null;
    if (snap) {
      contextByCode = {};
      for (const a of input.assets) {
        const fl = snap.flows.find(x => x.code === a.code), nw = snap.news.find(x => x.code === a.code), ds = snap.disclosures.find(x => x.code === a.code);
        contextByCode[a.code] = {day: snap.day, fetchedAt: snap.fetchedAt, flows: fl ? fl.rows.slice(-5) : [], flowsSourceUrl: fl?.sourceUrl ?? null, news: nw ? nw.items.filter(i => !i.duplicateOf).sort((x, y) => y.publishedAt.localeCompare(x.publishedAt)).slice(0, 6).map(({publishedAt, office, title, url}) => ({publishedAt, office, title: decodeEntities(title), url})) : [], newsRepublished: nw?.republished ?? 0, disclosures: ds ? ds.items.slice(-4).reverse().map(({publishedAt, title, corporateAction, actionWord}) => ({publishedAt, title: decodeEntities(title), corporateAction, actionWord})) : [], missing: [!fl && '수급', !nw && '뉴스', !ds && '공시'].filter(Boolean), usedInForecast: false};
      }
    }
  }
  // 진화 칸 — 질문 하나(「ATLAS는 시장의 답을 받아들여 나아졌는가?」)에 답하는 날짜별 사실표. 근거는 기록 장부 하나 · 평가 규칙은 읽기만.
  const current = async type => currentRecords(await readRecords(root, type));
  const timeline = evolveConfig ? buildTimeline({scores: (await current('score')).map(r => r.body), analyses: (await current('analysis')).map(r => r.body), experiments: await current('experiment'), operations: await current('operation'), models: await current('model'), config: evolveConfig, sessions: calendar?.sessions ?? [], actualAsOf: publication.actualAsOf, forecastId: publication.forecastId, issuedAt: publication.issuedAt, now}) : null;
  // 검산: timeline.mjs 를 쓰지 않는 따로 센 값과 맞대어 결과를 화면 자료에 붙인다(어긋나면 화면에 「검산 어긋남」으로 보인다)
  if (timeline) {
    const recount = recountTimeline({scoreBodies: (await current('score')).map(r => r.body), experimentRecords: await current('experiment'), operationRecords: await current('operation'), modelRecords: await current('model'), sessions: calendar?.sessions ?? [], actualAsOf: publication.actualAsOf, minScoredDates: evolveConfig.liveObservation?.minScoredDates ?? 10});
    const res = compareTimeline(timeline, recount);
    timeline.check = {ok: res.ok, checked: res.checked, mismatches: res.mismatches.slice(0, 20), method: 'lib/atlas11/timeline_check.mjs — timeline.mjs 를 쓰지 않고 장부 원본에서 다시 셈', at: now};
  }
  // 「왜 틀렸나」: 원인 분석 칸(장부)을 그대로 넘긴다 — 네 통 나누기는 lib/atlas11/misses.mjs(규칙은 결과 보기 전에 고정)
  const missCells = (await current('analysis')).filter(r => r.body?.kind === 'cell' && r.body?.horizon === 1);
  return buildViewBundle({publication, timeline, marketIndex, analysisRecords: missCells, scoreRecords: scoreLedger, input, calendar, publications, ab, abHistory, factorStatus, operations, scenarioStability, evolve, ledger, scoreHistory, dailyReport, schedule, deploy, context: contextLatest, contextByCode, archive: {id: archive.id, createdAt: archive.createdAt, createdDayKST: archive.createdDayKST, hashMatches: archive.hashMatches, comparedDatesAfterCreation: archive.comparedDatesAfterCreation, label: archive.label, file: '/data/atlas11/archive-fixed-20260917.json'}, operation: operation ? {at: operation.at, status: operation.status, exitCode: operation.exitCode, collection: operation.collection ?? null, forecastId: operation.forecastId ?? null, runtime: operation.runtime ?? null} : null, now});
}

if (process.argv[1] && path.resolve(process.argv[1]) === new URL(import.meta.url).pathname) {
  console.log(JSON.stringify(await buildAndWriteView({now: arg('--now') ?? new Date().toISOString()})));
}
