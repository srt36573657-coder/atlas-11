/**
 * ATLAS 11 · 매 거래일 실행기 (16:00 KST · 파일 기반 · 8단계 · 중복 실행 안전 · 이어서 실행 가능)
 *   ① 거래일 확인  ② 실제 시장 자료 수집  ③ 자료 검증·보관  ④ 오늘 답이 나온 과거 전망 채점
 *   ⑤ 정답·오답 원인 분석  ⑥ 오늘 실제값 기준 새 전망 발행(+그림자 발행)  ⑦ 개선 후보 생성·검증·승격·복귀  ⑧ 날짜별 보고서·기록 색인·화면 갱신
 * 모든 단계는 같은 입력이면 같은 결과를 내고(발행본 해시 재사용 · 기록 id 중복 방지 · 사건 중복 방지), 중단 뒤 다시 실행하면 이미 된 단계는 건너뛴 것과 같다.
 * 이 파일을 두는 것만으로 서버·예약이 생기지는 않는다(deploy/ 참조).
 */
import fs from 'node:fs/promises';
import path from 'node:path';
import {createHash} from 'node:crypto';
import {rollingOperationWindow, rollingHash, mergeRollingPrices, rollingScoreRecord, persistRollingScore} from '../rolling-operation.mjs';
import {readAllPublications} from './forecast.mjs';
import {isLivePublication} from './score.mjs';
import {scoreAllPublications, analyzeCells, aggregateAnalysis, sixSentences, summarizeCells} from './analysis.mjs';
import {appendRecord, readRecords, currentRecords, buildLedgerIndex, writeDailyReport} from './records.mjs';
import {GROUPS, groupOf} from './network.mjs';
import {generateCandidates, normalizeSpec, specId} from './evolve/models.mjs';
import {runSpecBacktest, protocolOf} from './evolve/backtest.mjs';
import {appendEvent, loadState, modelVersionFor} from './evolve/registry.mjs';
import {compareBacktests, evaluateObservation, checkRollback, pickCandidatesToValidate, adoptionAllowed} from './evolve/promote.mjs';

const read = async (file, otherwise) => { try { return JSON.parse(await fs.readFile(file, 'utf8')); } catch (e) { if (e.code === 'ENOENT' && otherwise !== undefined) return otherwise; throw e; } };
const atomicWrite = async (file, text) => { await fs.writeFile(file + '.next', text); await fs.rename(file + '.next', file); };
const finite = x => typeof x === 'number' && Number.isFinite(x);
const koreaDay = at => new Date(Date.parse(at) + 9 * 3600000).toISOString().slice(0, 10);
const sha = x => createHash('sha256').update(typeof x === 'string' || Buffer.isBuffer(x) ? x : JSON.stringify(x)).digest('hex');

/** 기본 수집기: 이 환경에서는 바깥 시세 서버에 닿지 못한다 → 시도하지 않고 실패로 기록. 실제 수집기는 collector 로 주입한다. */
export const offlineCollector = async () => ({attempted: false, provider: null, observations: [], errors: [{code: 'COLLECTOR_NOT_CONFIGURED', message: '수집기 미주입 · 네트워크 미시도 · 저장 자료만 사용'}]});

export const SHADOW_DIR = 'reports/atlas11/evolve/shadow';
const hostOf = u => { try { return new URL(u).hostname; } catch { return '출처 미상'; } };
/** 채점 정정 사유: 값·출처·가격 기준을 이전 기록과 나란히 적는다(덮어쓰지 않고 새 기록 + supersedes) */
export function correctionText(prev, next) {
  const a = prev.actualEvidence ?? {}, b = next.actualEvidence ?? {};
  return `실제 종가 정정 ${prev.actual} → ${next.actual} · 이전 출처 ${hostOf(a.sourceUrl)} → 새 출처 ${hostOf(b.sourceUrl)}${hostOf(a.sourceUrl) === 'fchart.stock.naver.com' ? ' · 사유: 네이버 일봉은 NXT(대체거래소) 거래가 섞인 통합가라 정규장(KRX 15:30) 종가가 아님 → 정규장 종가로 교체' : ''}`;
}
export async function readShadowPublications(rootDir) {
  const out = []; let dirs; try { dirs = await fs.readdir(path.join(rootDir, SHADOW_DIR)); } catch (e) { if (e.code === 'ENOENT') return out; throw e; }
  for (const d of dirs) { const files = (await fs.readdir(path.join(rootDir, SHADOW_DIR, d))).filter(f => f.endsWith('.json')).sort(); for (const f of files) out.push(JSON.parse(await fs.readFile(path.join(rootDir, SHADOW_DIR, d, f), 'utf8'))); }
  return out;
}

export async function runDaily({now = new Date().toISOString(), rootDir = process.cwd(), collector = offlineCollector, build = null, buildView = null, forceForecast = false, runBacktests = true, backtestTimeBudgetMs = null, configFile = 'config/atlas11/evolution.v1.json', codeSHA256 = null, log = () => {}} = {}) {
  const opsDir = path.join(rootDir, 'reports/atlas11/operations'); await fs.mkdir(opsDir, {recursive: true});
  const result = {schema: 'atlas11-operation-2', at: now, dayKST: koreaDay(now), status: 'started', exitCode: 0, steps: [], serverInstalled: false, scheduledRunInstalled: false, warnings: []};
  const file = path.join(opsDir, now.replace(/[:.]/g, '-') + '.json');
  const save = async () => { result.finishedAt = new Date().toISOString(); await fs.writeFile(file, JSON.stringify(result, null, 2)); await atomicWrite(path.join(opsDir, 'latest.json'), JSON.stringify(result, null, 2)); };
  const step = async (name, fn) => { const t = Date.now(), entry = {step: name, startedAt: new Date().toISOString()}; result.steps.push(entry); try { const out = await fn(); Object.assign(entry, {status: 'ok', durationMs: Date.now() - t, ...(out ?? {})}); log(name, entry); return out; } catch (e) { Object.assign(entry, {status: 'failed', durationMs: Date.now() - t, error: String(e.message)}); result.exitCode = 2; result.warnings.push(`${name}: ${e.message}`); log(name, entry); throw e; } };
  let lock;
  try { lock = await fs.open(path.join(opsDir, 'run.lock'), 'wx'); await lock.writeFile(JSON.stringify({pid: process.pid, at: now})); }
  catch (e) { if (e.code !== 'EEXIST') throw e; result.status = 'already_running_or_unresolved_lock'; result.exitCode = 2; await save(); return result; }
  try {
    const config = await read(path.join(rootDir, configFile)), configSHA256 = sha(await fs.readFile(path.join(rootDir, configFile), 'utf8'));
    const policy = await read(path.join(rootDir, config.scoringPolicyFile)), policySHA256 = sha(await fs.readFile(path.join(rootDir, config.scoringPolicyFile), 'utf8'));
    Object.assign(result, {configVersion: config.version, configSHA256, scoringPolicyVersion: policy.version, scoringPolicySHA256: policySHA256});
    const rec = (type, body, extra = {}) => appendRecord(rootDir, {type, at: now, body, configSHA256, codeSHA256, ...extra});
    const inputPath = path.join(rootDir, 'public/data/input.json');
    let raw = await fs.readFile(inputPath, 'utf8'), input = JSON.parse(raw);
    const calendar = await read(path.join(rootDir, 'public/data/rolling-calendar.json'), input.calendar);
    const sessions = calendar.sessions;
    const previous = await read(path.join(rootDir, 'public/data/atlas11/forecast.json'), null);
    result.previousForecastId = previous?.forecastId ?? null;
    const state0 = await loadState(rootDir, config); result.operatingModel = state0.operating.modelVersion;
    // ① 거래일 확인
    const window = await step('1_calendar', async () => {
      const w = rollingOperationWindow(input, now, {calendar, runEndDate: null});
      Object.assign(result, {day: w.day, session: w.session, afterClose: w.afterClose, calendarGate: w.calendarGate, cutoff: w.cutoff, deadlineKST: w.deadlineKST, previousActualAsOf: input.actualAsOf, publishEnd: config.schedule.publishEnd, afterPublishEnd: w.day > config.schedule.publishEnd});
      return {session: w.session, afterClose: w.afterClose, day: w.day, cutoff: w.cutoff};
    });
    const canCollect = window.session && window.afterClose;
    // ② 수집 (거래일 마감 뒤에만 시도 · 실패는 기록)
    let collected = {attempted: false, observations: [], errors: [], provider: null};
    await step('2_collect', async () => {
      if (!canCollect) { result.forecastWithheldReason = !window.session ? '거래일이 아님' : '정규장 마감(15:30) 전 · 장중값으로 발행하지 않음'; return {skipped: true, reason: result.forecastWithheldReason}; }
      const started = Date.now();
      try { collected = await collector(input, window, {now, rootDir}); } catch (e) { collected = {attempted: true, observations: [], errors: [{code: 'COLLECTOR_THREW', message: String(e.message)}]}; }
      result.collection = {attempted: collected.attempted === true, provider: collected.provider ?? null, observations: collected.observations?.length ?? 0, errors: collected.errors ?? [], delayed: collected.delayed === true, stats: collected.stats ?? null, durationMs: Date.now() - started};
      if (!collected.attempted || (collected.errors ?? []).length || collected.delayed) result.exitCode = 2;
      const r = await rec('collection', {kind: 'daily_collection', day: window.day, attempted: collected.attempted === true, provider: collected.provider ?? null, delayed: collected.delayed === true, observations: (collected.observations ?? []).map(o => ({code: o.code, sourceUrl: o.sourceUrl, rawHash: o.rawHash, observedAt: o.observedAt, finalClose: o.finalClose === true, rows: o.rows?.length ?? 0, lastDate: o.rows?.at(-1)?.date ?? null})), marketObservations: (collected.marketObservations ?? []).map(o => ({symbol: o.symbol ?? o.code, rows: o.rows?.length ?? 0, lastDate: o.rows?.at(-1)?.date ?? null, sourceUrl: o.sourceUrl})), errors: collected.errors ?? [], stats: collected.stats ?? null, status: collected.attempted ? ((collected.errors ?? []).length ? 'partial' : 'ok') : 'not_attempted'});
      result.collectionRecordId = r.record.id;
      return {attempted: collected.attempted === true, observations: collected.observations?.length ?? 0, errors: (collected.errors ?? []).length, recordId: r.record.id};
    });
    // ③ 검증·보관 (원자료 저널 · 원자적 저장)
    let updated = {input, changed: false, freshCodes: [], confirmedTodayCodes: [], actualAsOf: input.actualAsOf, retainedStoredClose: true};
    await step('3_validate_store', async () => {
      if (!canCollect) return {skipped: true};
      updated = mergeRollingPrices(input, collected.observations ?? [], {now, expectedHash: rollingHash(input), calendar, runEndDate: null});
      if (updated.changed) {
        if (await fs.readFile(inputPath, 'utf8') !== raw) throw Error('CONCURRENT_INPUT_EDIT');
        await fs.writeFile(path.join(opsDir, 'input-before-' + rollingHash(raw) + '.json'), raw, {flag: 'wx'}).catch(e => { if (e.code !== 'EEXIST') throw e; });
        const text = JSON.stringify(updated.input); await atomicWrite(inputPath, text); raw = text; input = updated.input;
      }
      Object.assign(result, {inputChanged: updated.changed === true, actualAsOf: updated.actualAsOf, freshStocks: updated.freshCodes.length, confirmedTodayStocks: updated.confirmedTodayCodes.length, confirmedTodayCodes: updated.confirmedTodayCodes, retainedStoredClose: updated.retainedStoredClose, inputSnapshotSHA256: rollingHash(raw)});
      result.unconfirmedCodes = input.assets.map(a => a.code).filter(c => !updated.confirmedTodayCodes.includes(c));
      return {changed: updated.changed === true, confirmedToday: updated.confirmedTodayCodes.length, actualAsOf: updated.actualAsOf, inputSnapshotSHA256: result.inputSnapshotSHA256};
    }).catch(e => { result.status = 'failed_validation'; result.error = String(e.message); throw e; });
    result.inputSnapshotSHA256 ??= rollingHash(raw);
    // ④ 채점 — 모든 발행본(운영 + 그림자) · 실제값이 확정된 목표일만 · 기록 장부에 새 셀만 추가
    const publications = await readAllPublications(rootDir), shadows = await readShadowPublications(rootDir);
    let scored = null, newCells = [];
    await step('4_score', async () => {
      // 기존 채점판(화면용)도 유지
      const live = publications.filter(isLivePublication), prior = await read(path.join(rootDir, 'public/data/rolling-scores.json'), null);
      const record = rollingScoreRecord(live, input, {now, calendar, previousScoreId: prior?.scoreId ?? null}); const saved = await persistRollingScore(record, {rootDir}); result.scoreId = saved.scoreId; result.scoredDates = saved.record.independentDateCount;
      scored = scoreAllPublications([...publications, ...shadows], input, {calendar, now, policy, groupOf: c => groupOf(c)?.id ?? null});
      const existing = currentRecords(await readRecords(rootDir, 'score')), keyOf = c => `${c.forecastId}|${c.code}|${c.targetDate}`, byKey = new Map(existing.map(r => [keyOf(r.body), r]));
      let added = 0, duplicates = 0, corrected = 0;
      for (const c of scored.cells) {
        const prev = byKey.get(keyOf(c));
        if (prev && prev.body.actual === c.actual) { duplicates++; continue; } // 값이 같으면 출처 원문만 달라도 새 기록을 만들지 않는다
        const r = await rec('score', c, {links: {forecastId: c.forecastId, inputSnapshotSHA256: result.inputSnapshotSHA256, collectionRecordId: result.collectionRecordId ?? null}, supersedes: prev ? prev.id : null, correctionReason: prev ? correctionText(prev.body, c) : null});
        if (r.duplicate) duplicates++; else { added++; if (prev) corrected++; newCells.push(c); }
      }
      result.scoring = {evaluated: scored.cells.length, evaluatedLive: scored.counts.evaluatedLive, pending: scored.pending.length, uniqueTargetDates: scored.counts.uniqueTargetDates, byClass: scored.counts.byClass, exclusionReasons: scored.counts.exclusionReasons, newRecords: added, duplicates, corrected, cutoff: scored.cutoff, summary: summarizeCells(scored.cells, {policy})};
      return {evaluated: scored.cells.length, newRecords: added, duplicates, pending: scored.pending.length};
    });
    // ⑤ 원인 분석 — 새로 채점된 운영 셀(1·5·10·20일)만 · 날짜 총괄
    const network = await read(path.join(rootDir, 'public/data/atlas11/view/network.json'), null);
    let aggregate = null;
    await step('5_analyze', async () => {
      const analyses = analyzeCells(newCells, {publications: [...publications, ...shadows], input, calendar, network, delta: policy.flatDelta});
      let added = 0; for (const a of analyses) { const r = await rec('analysis', {...a, cellKind: a.kind, kind: 'cell'}, {links: {forecastId: a.forecastId, modelVersion: a.modelVersion}}); if (!r.duplicate) added++; }
      const dates = [...new Set(scored.cells.filter(c => c.kind === 'live').map(c => c.targetDate))].sort();
      const day = window.cutoff ?? dates.at(-1);
      if (day) { const allAnalyses = currentRecords(await readRecords(rootDir, 'analysis')).filter(r => r.body.kind === 'cell' || (r.body.decomposition && ['live', 'shadow', 'reference'].includes(r.body.kind))).map(r => r.body); aggregate = aggregateAnalysis(day, allAnalyses, scored.cells, {input, calendar, groups: GROUPS}); await rec('analysis', {kind: 'daily_aggregate', ...aggregate}, {links: {scoreCutoff: scored.cutoff}}); }
      result.analysis = {cellAnalyses: analyses.length, newRecords: added, aggregateDate: day ?? null};
      return {cells: analyses.length, newRecords: added, aggregateDate: day ?? null};
    });
    // ⑥ 발행 — 52종목 전부 오늘 확정 · 예약 기간 안 · 운영 모델 명세로. 계산 오류면 직전 검증 버전으로 복귀 후 재시도.
    let state = await loadState(rootDir, config), issued = null;
    await step('6_publish', async () => {
      const allConfirmed = updated.confirmedTodayCodes.length === 52 && updated.actualAsOf === window.day;
      if (result.afterPublishEnd) { result.forecastId = result.previousForecastId; result.newForecast = false; result.forecastWithheldReason = `예약 종료일(${config.schedule.publishEnd}) 뒤 · 새 발행 없음 · 잔여 목표일 채점만 계속`; result.exitCode = result.exitCode || 0; return {skipped: true, reason: result.forecastWithheldReason}; }
      if (!canCollect && !forceForecast) { result.forecastId = result.previousForecastId; result.newForecast = false; result.liveForecastStocks = 0; return {skipped: true, reason: result.forecastWithheldReason}; }
      if (!((allConfirmed || forceForecast) && build)) { result.forecastId = result.previousForecastId; result.newForecast = false; result.liveForecastStocks = 0; result.exitCode = 2; result.forecastWithheldReason ??= build ? `오늘(${window.day}) 확정 종가 확인 ${updated.confirmedTodayCodes.length}/52 · 52개 전부 확인될 때만 발행 · 이전 발행본 유지` : 'build 미주입'; return {skipped: true, reason: result.forecastWithheldReason}; }
      const attempt = async (spec, version) => build({issuedAt: now, modelSpec: spec, modelVersion: version});
      let out;
      try { out = await attempt(state.operating.spec, state.operating.modelVersion); }
      catch (e) {
        // 계산 오류 → 직전 검증 버전으로 자동 복귀(이후 발행본에 적용) → 그 버전으로 재시도
        const to = state.previousValidated ?? {modelVersion: config.operating.initialVersion, specId: 'A', spec: normalizeSpec(config.operating.spec)};
        if (to.modelVersion === state.operating.modelVersion) throw e;
        await appendEvent(rootDir, {at: now, type: 'rolled_back', candidateId: state.operating.specId === 'A' ? null : state.operating.specId, reason: 'computation_error: ' + String(e.message), to: {modelVersion: to.modelVersion, specId: to.specId, spec: to.spec}, appliesFrom: now, targetForecastId: null, configSHA256});
        await rec('model', {kind: 'rollback', reason: 'computation_error', error: String(e.message), from: state.operating.modelVersion, to: to.modelVersion, appliesFrom: now, status: '되돌림'});
        state = await loadState(rootDir, config); result.rollback = {reason: 'computation_error', to: to.modelVersion};
        out = await attempt(state.operating.spec, state.operating.modelVersion);
      }
      issued = out;
      result.forecastId = out.forecastId; result.newForecast = !out.reused && out.forecastId !== result.previousForecastId; result.reusedSameInput = out.reused === true; result.liveForecastStocks = 52;
      await rec('forecast', {kind: 'operating', forecastId: out.forecastId, modelVersion: state.operating.modelVersion, issuedAt: now, actualAsOf: out.actualAsOf, reused: out.reused === true, anchorMatches: out.summary?.anchorMatches ?? null, stocks: 52, futurePoints: 20, csvFiles: out.csvFiles ?? 52, implementationSHA256: out.implementationSHA256 ?? null, status: '발행'}, {links: {forecastId: out.forecastId, inputSnapshotSHA256: result.inputSnapshotSHA256, modelVersionId: state.operating.modelVersion}});
      // 그림자 발행: 실전 관찰 중 후보 + 직전 검증 버전(복귀 비교용)
      const shadowSpecs = Object.values(state.candidates).filter(c => c.statusKey === 'observing').map(c => ({candidateId: c.candidateId, spec: c.spec, version: 'shadow-' + c.candidateId}));
      if (state.previousValidated && state.previousValidated.modelVersion !== state.operating.modelVersion) shadowSpecs.push({candidateId: 'prev-' + state.previousValidated.specId, spec: state.previousValidated.spec, version: state.previousValidated.modelVersion});
      const shadowsBuilt = [];
      for (const s of shadowSpecs) {
        try { const sh = await build({issuedAt: now, modelSpec: s.spec, modelVersion: s.version, shadow: {candidateId: s.candidateId, shadowOf: out.forecastId}}); shadowsBuilt.push({candidateId: s.candidateId, forecastId: sh.forecastId, reused: sh.reused === true}); await rec('forecast', {kind: 'shadow', candidateId: s.candidateId, forecastId: sh.forecastId, shadowOf: out.forecastId, modelVersion: s.version, issuedAt: now, actualAsOf: sh.actualAsOf, status: '그림자 발행'}, {links: {forecastId: sh.forecastId, shadowOf: out.forecastId, candidateId: s.candidateId}}); }
        catch (e) { result.warnings.push(`shadow ${s.candidateId}: ${e.message}`); shadowsBuilt.push({candidateId: s.candidateId, error: String(e.message)}); }
      }
      result.shadows = shadowsBuilt;
      return {forecastId: out.forecastId, reused: out.reused === true, newForecast: result.newForecast, shadows: shadowsBuilt.length};
    });
    // ⑦ 진화 — 관찰 평가(승격/기각) → 복귀 검사 → 후보 검증(예산 안) → 요인 기록
    await step('7_evolve', async () => {
      const summary = {backtested: 0, adopted: 0, rejected: 0, observing: 0, rolledBack: 0, promoted: [], notes: []};
      const dayIndex = sessions.indexOf(window.cutoff ?? window.day);
      const scoreRecords = currentRecords(await readRecords(rootDir, 'score')).map(r => r.body);
      const operatingCells = scoreRecords.filter(c => c.kind === 'live' && c.modelVersion === state.operating.modelVersion);
      // (a) 실전 관찰 평가
      for (const c of Object.values(state.candidates).filter(c => c.statusKey === 'observing')) {
        const candCells = scoreRecords.filter(x => x.kind === 'shadow' && x.shadowOf != null && (x.modelVersion === 'shadow-' + c.candidateId));
        const ev = evaluateObservation(candCells, operatingCells, config);
        await appendEvent(rootDir, {at: now, type: 'observation_scored', candidateId: c.candidateId, evidence: ev, configSHA256});
        if (ev.decision === 'promote') {
          const allow = adoptionAllowed(state, dayIndex, config);
          if (!allow.allowed) { summary.notes.push(`${c.candidateId} 승격 조건 충족했으나 ${allow.reason}`); summary.observing++; continue; }
          const version = modelVersionFor(c.spec, state.sequence + 1);
          await appendEvent(rootDir, {at: now, type: 'adopted', candidateId: c.candidateId, modelVersion: version, evidence: {observation: ev, backtest: c.backtest, gates: c.gates}, appliesFrom: 'next_publication_after_' + now, tradingDay: window.day, cooldownUntilTradingDayIndex: dayIndex + config.limits.cooldownTradingDaysAfterAdoption, configSHA256});
          await rec('model', {kind: 'adoption', candidateId: c.candidateId, modelVersion: version, from: state.operating.modelVersion, evidence: {observation: ev, four: c.gates?.four ?? null}, appliesFrom: 'next_publication', status: '채택'}, {links: {candidateId: c.candidateId, modelVersionId: version}});
          summary.adopted++; summary.promoted.push(version);
        } else if (ev.decision === 'reject') { await appendEvent(rootDir, {at: now, type: 'rejected', candidateId: c.candidateId, reason: '실전 관찰 기준 미충족', evidence: ev, configSHA256}); await rec('model', {kind: 'rejection', candidateId: c.candidateId, reason: '실전 관찰 기준 미충족', evidence: ev, status: '기각'}); summary.rejected++; }
        else summary.observing++;
      }
      state = await loadState(rootDir, config);
      // (b) 복귀 검사 (운영 ≠ 초기 A 이고 직전 검증 버전 그림자가 있을 때)
      if (state.previousValidated) {
        const prevCells = scoreRecords.filter(x => x.kind === 'shadow' && x.modelVersion === state.previousValidated.modelVersion);
        const rb = checkRollback(operatingCells, prevCells, config);
        if (rb.triggered) { await appendEvent(rootDir, {at: now, type: 'rolled_back', candidateId: state.operating.specId === 'A' ? null : state.operating.specId, reason: 'live_degradation', evidence: rb, to: {modelVersion: state.previousValidated.modelVersion, specId: state.previousValidated.specId, spec: state.previousValidated.spec}, appliesFrom: 'next_publication_after_' + now, targetForecastId: result.forecastId ?? null, configSHA256}); await rec('model', {kind: 'rollback', reason: 'live_degradation', evidence: rb, from: state.operating.modelVersion, to: state.previousValidated.modelVersion, appliesFrom: 'next_publication', status: '되돌림'}); summary.rolledBack++; state = await loadState(rootDir, config); }
        summary.rollbackCheck = rb;
      }
      // (c) 후보 생성·시간순 검증 (예산 안 · 캐시 재사용)
      const candidates = generateCandidates(config);
      for (const c of candidates) if (!state.candidates[c.id]) await appendEvent(rootDir, {at: now, type: 'candidate_created', candidateId: c.id, spec: c, configSHA256});
      state = await loadState(rootDir, config);
      const protocol = protocolOf(config), cacheDir = path.join(rootDir, 'reports/atlas11/evolve/backtests'), inputSHA256 = sha(raw);
      const cached = new Set(); for (const c of candidates) { const f = await read(path.join(cacheDir, c.id + '.json'), null); if (f && f.complete && f.inputSHA256 === inputSHA256 && f.protocolSHA256 === sha(protocol).slice(0, 16)) cached.add(c.id); }
      const picks = runBacktests ? pickCandidatesToValidate(candidates, state, config, {cached}) : [];
      const budget = backtestTimeBudgetMs ?? config.limits.backtestTimeBudgetMinutes * 60000, t0 = Date.now();
      let A = null;
      for (const c of picks) {
        if (!cached.has(c.id) && Date.now() - t0 > budget) { await appendEvent(rootDir, {at: now, type: 'validation_pending', candidateId: c.id, reason: '검증 시간 예산 초과 → 다음 실행에 계속', configSHA256}); summary.notes.push(`${c.id} 검증 대기(예산)`); continue; }
        try {
          A ??= await runSpecBacktest(input, normalizeSpec(config.operating.spec), {protocol, cacheDir, inputSHA256});
          const B = await runSpecBacktest(input, c, {protocol, cacheDir, inputSHA256});
          const cmp = compareBacktests(A, B, config);
          await appendEvent(rootDir, {at: now, type: 'backtested', candidateId: c.id, evidence: {summary: B.summary, byBlock: B.byBlock, elapsedMs: B.elapsedMs, fromCache: B.fromCache === true, protocolSHA256: B.protocolSHA256, inputSHA256: B.inputSHA256}, configSHA256});
          await appendEvent(rootDir, {at: now, type: 'gate_decision', candidateId: c.id, evidence: cmp, configSHA256});
          await rec('experiment', {kind: 'backtest', candidateId: c.id, family: c.family, label: c.label, spec: {penalties: c.penalties, volatility: c.volatility, featureMask: c.featureMask, carry: c.carry}, before: {modelVersion: state.operating.modelVersion, ...A.summary}, after: B.summary, four: cmp.four, gates: cmp.gates ? Object.fromEntries(Object.entries(cmp.gates).map(([k, g]) => [k, g.passed])) : null, uncertainty: cmp.uncertainty ? {probabilityCandidateBetter: cmp.uncertainty.probabilityCandidateBetter, blocksBetter: cmp.uncertainty.blocksBetter, ci90: cmp.uncertainty.ci90} : null, decision: cmp.status, reasons: cmp.reasons, trainingWindow: {origins: protocol.originDays, blocks: protocol.blocks, paths: protocol.paths, seed: protocol.seed, trainingBefore: protocol.trainingBefore}, status: cmp.status === 'observing' ? '실전 관찰' : cmp.status === 'rejected' ? '기각' : '검증 대기'}, {links: {candidateId: c.id, backtestFile: `reports/atlas11/evolve/backtests/${c.id}.json`}});
          if (cmp.status === 'observing') { const nObs = Object.values(state.candidates).filter(x => x.statusKey === 'observing').length; if (nObs >= config.limits.maxLiveObservationCandidates) { await appendEvent(rootDir, {at: now, type: 'validation_pending', candidateId: c.id, reason: '실전 관찰 자리 부족 → 대기', configSHA256}); summary.notes.push(`${c.id} 관찰 대기(자리)`); } else { await appendEvent(rootDir, {at: now, type: 'observation_started', candidateId: c.id, tradingDay: window.day, configSHA256}); summary.observing++; } }
          else if (cmp.status === 'rejected') { await appendEvent(rootDir, {at: now, type: 'rejected', candidateId: c.id, reason: cmp.reasons.join(' · '), evidence: cmp.four, configSHA256}); summary.rejected++; }
          else await appendEvent(rootDir, {at: now, type: 'validation_pending', candidateId: c.id, reason: cmp.reasons.join(' · '), configSHA256});
          summary.backtested++;
          state = await loadState(rootDir, config);
        } catch (e) { result.warnings.push(`backtest ${c.id}: ${e.message}`); await appendEvent(rootDir, {at: now, type: 'validation_pending', candidateId: c.id, reason: '검증 실패: ' + String(e.message), configSHA256}); await rec('experiment', {kind: 'backtest_failed', candidateId: c.id, family: c.family, error: String(e.message), status: '검증 대기'}); }
      }
      if (!summary.adopted && !summary.rolledBack) await appendEvent(rootDir, {at: now, type: 'no_change', reason: summary.backtested ? '검증한 후보가 채택 조건을 못 넘음 또는 관찰 중' : '오늘 검증한 후보 없음', configSHA256});
      // (d) 요인 기록 (F01~F36: 확보·사용·가중치·기여)
      const pub = await read(path.join(rootDir, 'public/data/atlas11/forecast.json'), null), registry = await read(path.join(rootDir, 'public/data/factor36-registry.json'), null);
      if (pub && registry) {
        for (const f of registry.factors) {
          const rows = pub.assets.map(a => a.model.factors.find(x => x.id === f.id)), used = rows.filter(r => r && r.status !== 'missing').length;
          const weights = pub.assets.map(a => a.model.featureFactors.map((id, j) => id === f.id ? Math.abs(a.model.regression.beta[j] ?? 0) : 0).reduce((s, x) => s + x, 0)), contrib = pub.assets.map(a => a.rows[1]?.factor36?.contributions?.[f.id]).filter(finite);
          await rec('factor', {factorId: f.id, name: f.name, day: window.day, modelVersion: pub.modelVersion, forecastId: pub.forecastId, status: used ? (f.id === 'F36' ? '분산 모형' : '수치 입력') : '미확보', stocksUsing: used, stocksNonZero: pub.assets.filter(a => a.model.featureFactors.some((id, j) => id === f.id && Math.abs(a.model.regression.beta[j] ?? 0) > 0)).length, latestObservation: used ? pub.actualAsOf : null, freshness: used ? '기준일' : null, meanAbsWeight: used ? weights.reduce((s, x) => s + x, 0) / 52 : null, meanDailyContributionD1: contrib.length ? contrib.reduce((s, x) => s + x, 0) / contrib.length : null, reason: rows.find(r => r)?.reason ?? null, changeHistory: state.adoptions.map(a => a.modelVersion)}, {links: {forecastId: pub.forecastId, modelVersionId: pub.modelVersion}});
        }
      }
      result.evolution = {...summary, operatingModel: state.operating.modelVersion, candidatesTotal: candidates.length, states: Object.fromEntries(Object.values(state.candidates).map(c => [c.candidateId, c.status]))};
      return {backtested: summary.backtested, adopted: summary.adopted, rejected: summary.rejected, observing: summary.observing, rolledBack: summary.rolledBack, operatingModel: state.operating.modelVersion};
    });
    result.operatingModelAfter = state.operating.modelVersion;
    // ⑧ 날짜별 보고서 · 기록 색인 · 화면
    result.status = result.exitCode === 0 ? 'complete' : 'partial'; result.viewPending = true; await save();
    await step('8_report_view', async () => {
      const st = state, exp = {backtested: result.evolution.backtested, totalBacktested: Object.values(st.candidates).filter(c => c.backtest).length, adopted: result.evolution.adopted, rejected: Object.values(st.candidates).filter(c => c.statusKey === 'rejected').length, observing: Object.values(st.candidates).filter(c => c.statusKey === 'observing').length, rolledBack: st.rollbacks.length, operatingVersion: st.operating.modelVersion, changed: result.evolution.adopted > 0 || result.evolution.rolledBack > 0, note: result.evolution.notes?.join(' · ') || null};
      const upcoming = [];
      if (window.cutoff) { const i = sessions.indexOf(window.cutoff); const next = sessions[i + 1]; if (next) { const pend = scored.pending.filter(p => p.targetDate === next && p.kind === 'live'); if (pend.length) upcoming.push({date: next, count: pend.length, horizons: [...new Set(pend.map(p => p.horizon))].sort((a, b) => a - b), publications: new Set(pend.map(p => p.forecastId)).size}); } }
      // 종가를 못 받아 밀린 목표(목표일은 지났으나 실제값 미확보) — 종가가 들어오면 그때 채점한다
      const backlog = scored.pending.filter(p => p.kind === 'live' && window.cutoff && p.targetDate <= window.cutoff && /실제 종가|확정 증거/.test(p.reason));
      if (backlog.length) upcoming.push({date: null, backlog: true, count: backlog.length, dates: [...new Set(backlog.map(p => p.targetDate))].sort(), horizons: [...new Set(backlog.map(p => p.horizon))].sort((a, b) => a - b)});
      // 오늘 종가가 없으면 마지막 확정 거래일 기준으로 시장 변화를 적는다(날짜를 그대로 밝힌다)
      let sentenceAggregate = aggregate;
      if (!aggregate?.market && input.actualAsOf && input.actualAsOf < (window.cutoff ?? window.day)) { const allAnalyses = currentRecords(await readRecords(rootDir, 'analysis')).filter(r => r.body.kind === 'cell' || (r.body.decomposition && ['live', 'shadow', 'reference'].includes(r.body.kind))).map(r => r.body); sentenceAggregate = aggregateAnalysis(input.actualAsOf, allAnalyses, scored.cells, {input, calendar, groups: GROUPS}); }
      const sentences = sixSentences({date: window.day, aggregate: sentenceAggregate, counts: scored.counts, experiments: exp, nextTargets: upcoming, collection: result.collection ?? null, forecast: {forecastId: result.forecastId}, pendingReasons: scored.counts.exclusionReasons});
      const report = {schema: 'atlas11-daily-report-1', date: window.day, generatedAt: now, sentences, operation: {status: result.status, exitCode: result.exitCode, session: window.session, afterClose: window.afterClose, forecastId: result.forecastId ?? null, newForecast: result.newForecast === true, withheld: result.forecastWithheldReason ?? null, collection: result.collection ?? null, confirmedTodayStocks: result.confirmedTodayStocks ?? null}, scoring: result.scoring ?? null, aggregate, evolution: result.evolution ?? null, sections: [{title: '운영', lines: [`실행 ${now} (${window.day} KST) · 상태 ${result.status} · 종료코드 ${result.exitCode}`, `수집 ${result.collection ? (result.collection.attempted ? `시도 · 관측 ${result.collection.observations} · 오류 ${result.collection.errors.length}` : '시도 안 함') : '건너뜀'}`, `발행 ${result.forecastId ?? '없음'}${result.forecastWithheldReason ? ' · ' + result.forecastWithheldReason : ''}`, `운영 모델 ${st.operating.modelVersion}`]}]};
      const written = await writeDailyReport(rootDir, report);
      result.dailyReport = written;
      await rec('operation', {kind: 'daily_run', at: now, day: window.day, status: result.status, exitCode: result.exitCode, steps: result.steps.map(s => ({step: s.step, status: s.status, durationMs: s.durationMs, error: s.error ?? null})), forecastId: result.forecastId ?? null, newForecast: result.newForecast === true, confirmedTodayStocks: result.confirmedTodayStocks ?? null, collection: result.collection ? {attempted: result.collection.attempted, observations: result.collection.observations, errors: result.collection.errors.length, delayed: result.collection.delayed} : null, scoring: result.scoring ? {evaluated: result.scoring.evaluated, newRecords: result.scoring.newRecords} : null, evolution: result.evolution ? {backtested: result.evolution.backtested, adopted: result.evolution.adopted, rejected: result.evolution.rejected, observing: result.evolution.observing, rolledBack: result.evolution.rolledBack, operatingModel: result.evolution.operatingModel} : null, warnings: result.warnings, dailyReport: written.date, serverInstalled: false, scheduledRunInstalled: false});
      const index = await buildLedgerIndex(rootDir, {now}); result.ledger = {totals: index.totals, dates: index.dates.length};
      if (buildView) { const v = await buildView({now}); result.steps.at(-1).view = v; if (v.forecastId !== result.forecastId && result.forecastId) throw Error('VIEW_FORECAST_MISMATCH'); }
      return {dailyReport: written.date, ledgerTotals: index.totals};
    });
    result.viewPending = false;
    await save(); return result;
  } catch (e) {
    result.status = result.status === 'started' || result.status === 'complete' || result.status === 'partial' ? 'failed' : result.status; result.exitCode = 2; result.error = String(e.message); await save();
    try { await appendRecord(rootDir, {type: 'operation', at: now, body: {kind: 'daily_run_failed', at: now, day: result.day ?? koreaDay(now), status: result.status, error: String(e.message), steps: result.steps.map(s => ({step: s.step, status: s.status, error: s.error ?? null}))}}); } catch {}
    return result;
  } finally { await lock.close(); await fs.unlink(path.join(opsDir, 'run.lock')); }
}
