/**
 * ATLAS 11 · 매 거래일 실행기 — 예측 없음
 *   2026-10-04 15:37 사장님 「이제 예측을 하지 않는다 · 예측에 관련된 모든 기능과 화면을 삭제하고 · 표현하지 마라」
 *   ① 거래일 확인  ② 실제 종가 수집(정규장 15:30 종가 · 바꿀 새 묶음도)  ③ 검증·보관  ④ 종목 바꾸기(새 묶음 종가가 모두 확정일 때만)  ⑤ 기록 · 판 화면
 *   곳 수는 묶음마다 다르다(52곳 → 2026-10-04 18:24 「알아서 해」 뒤 180곳) — 「다 모였나」는 늘 그 묶음의 곳 수로 센다
 *   예측 만들기 · 채점 · 원인 분석 · 진화 단계는 지웠다(지난 예측 기록 파일은 저장소에 보관만 · 화면에는 내지 않음).
 * 같은 입력이면 같은 결과 · 다시 돌려도 기록이 겹치지 않는다(기록 id 중복 방지) · 중단 뒤 다시 실행하면 이미 된 단계는 건너뛴 것과 같다.
 */
import fs from 'node:fs/promises';
import path from 'node:path';
import {rollingOperationWindow, rollingHash, mergeRollingPrices} from '../rolling-operation.mjs';
import {appendRecord} from './records.mjs';
import {loadUniverseConfig, switchDue, loadNextInput, saveWorkingNext, applySwitch, universeIdOf} from './universe-switch.mjs';

const read = async (file, otherwise) => { try { return JSON.parse(await fs.readFile(file, 'utf8')); } catch (e) { if (e.code === 'ENOENT' && otherwise !== undefined) return otherwise; throw e; } };
const atomicWrite = async (file, text) => { await fs.writeFile(file + '.next', text); await fs.rename(file + '.next', file); };
const koreaDay = at => new Date(Date.parse(at) + 9 * 3600000).toISOString().slice(0, 10);

/** 기본 수집기: 이 환경에서는 바깥 시세 서버에 닿지 못한다 → 시도하지 않고 실패로 기록. 실제 수집기는 collector 로 주입한다. */
export const offlineCollector = async () => ({attempted: false, provider: null, observations: [], errors: [{code: 'COLLECTOR_NOT_CONFIGURED', message: '수집기 미주입 · 네트워크 미시도 · 저장 자료만 사용'}]});

/** 실행 환경 증거 — GitHub Actions 변수는 러너가 넣는 값이며 추정하지 않는다 · 손으로 누른 실행(workflow_dispatch)은 예약 실행이 아니다 */
export function runtimeInfo(env = process.env) {
  if (env.GITHUB_ACTIONS === 'true') {
    const repo = env.GITHUB_REPOSITORY ?? null, runId = env.GITHUB_RUN_ID ?? null, server = env.GITHUB_SERVER_URL ?? 'https://github.com';
    return {host: 'github-actions', runner: [env.RUNNER_OS, env.ImageOS].filter(Boolean).join(' ') || null, event: env.GITHUB_EVENT_NAME ?? null, workflow: env.GITHUB_WORKFLOW ?? null, repository: repo, runId, runAttempt: env.GITHUB_RUN_ATTEMPT ?? null, runUrl: repo && runId ? `${server}/${repo}/actions/runs/${runId}` : null, commit: env.GITHUB_SHA ?? null, serverInstalled: true, scheduledRun: env.GITHUB_EVENT_NAME === 'schedule'};
  }
  return {host: env.ATLAS11_HOST || 'local', event: env.ATLAS11_TRIGGER || 'manual', serverInstalled: Boolean(env.ATLAS11_HOST), scheduledRun: env.ATLAS11_TRIGGER === 'schedule'};
}

export async function runDaily({now = new Date().toISOString(), rootDir = process.cwd(), collector = offlineCollector, buildView = null, codeSHA256 = null, log = () => {}, env = process.env} = {}) {
  const opsDir = path.join(rootDir, 'reports/atlas11/operations'); await fs.mkdir(opsDir, {recursive: true});
  const runtime = runtimeInfo(env);
  const result = {schema: 'atlas11-operation-3', at: now, dayKST: koreaDay(now), status: 'started', exitCode: 0, steps: [], runtime, serverInstalled: runtime.serverInstalled, scheduledRunInstalled: runtime.scheduledRun, prediction: 'off', warnings: []};
  const file = path.join(opsDir, now.replace(/[:.]/g, '-') + '.json');
  const save = async () => { result.finishedAt = new Date().toISOString(); await fs.writeFile(file, JSON.stringify(result, null, 2)); await atomicWrite(path.join(opsDir, 'latest.json'), JSON.stringify(result, null, 2)); };
  const step = async (name, fn) => { const t = Date.now(), entry = {step: name, startedAt: new Date().toISOString()}; result.steps.push(entry); try { const out = await fn(); Object.assign(entry, {status: 'ok', durationMs: Date.now() - t, ...(out ?? {})}); log(name, entry); return out; } catch (e) { Object.assign(entry, {status: 'failed', durationMs: Date.now() - t, error: String(e.message)}); result.exitCode = 2; result.warnings.push(`${name}: ${e.message}`); log(name, entry); throw e; } };
  let lock;
  try { lock = await fs.open(path.join(opsDir, 'run.lock'), 'wx'); await lock.writeFile(JSON.stringify({pid: process.pid, at: now})); }
  catch (e) { if (e.code !== 'EEXIST') throw e; result.status = 'already_running_or_unresolved_lock'; result.exitCode = 2; await save(); return result; }
  try {
    const rec = (type, body, extra = {}) => appendRecord(rootDir, {type, at: now, body, codeSHA256, ...extra});
    const inputPath = path.join(rootDir, 'public/data/input.json');
    let raw = await fs.readFile(inputPath, 'utf8'), input = JSON.parse(raw);
    const calendar = await read(path.join(rootDir, 'public/data/rolling-calendar.json'), input.calendar);
    const uniConfig = await loadUniverseConfig(rootDir);
    result.universeId = universeIdOf(input);
    // ① 거래일 확인
    const window = await step('1_calendar', async () => {
      const w = rollingOperationWindow(input, now, {calendar, runEndDate: null});
      Object.assign(result, {day: w.day, session: w.session, afterClose: w.afterClose, calendarGate: w.calendarGate, cutoff: w.cutoff, deadlineKST: w.deadlineKST, previousActualAsOf: input.actualAsOf});
      return {session: w.session, afterClose: w.afterClose, day: w.day, cutoff: w.cutoff};
    });
    const canCollect = window.session && window.afterClose;
    // 오늘이 종목을 바꾸는 날이면 새 묶음 입력(작업본 또는 제안 파일)을 읽어 둔다 — 실제로 바꾸는 것은 ④(새 묶음 오늘 종가가 모두 확정일 때만)
    let next = null;
    if (canCollect && switchDue(uniConfig, input, window.day)) {
      try { next = await loadNextInput(rootDir, uniConfig.next); result.universe = {pending: uniConfig.next.id, switchOn: uniConfig.next.switchOn, nextFrom: next.from, switched: false}; }
      catch (e) { result.warnings.push('universe next: ' + e.message); result.universe = {pending: uniConfig.next.id, switchOn: uniConfig.next.switchOn, switched: false, error: String(e.message)}; }
    }
    // ② 수집(거래일 마감 뒤에만 시도 · 실패는 기록)
    let collected = {attempted: false, observations: [], errors: [], provider: null};
    await step('2_collect', async () => {
      if (!canCollect) { result.skippedReason = !window.session ? '거래일이 아님' : '정규장 마감(15:30) 전 · 장중값은 받지 않음'; return {skipped: true, reason: result.skippedReason}; }
      const started = Date.now();
      try { collected = await collector(input, window, {now, rootDir}); } catch (e) { collected = {attempted: true, observations: [], errors: [{code: 'COLLECTOR_THREW', message: String(e.message)}]}; }
      result.collection = {attempted: collected.attempted === true, provider: collected.provider ?? null, observations: collected.observations?.length ?? 0, errors: collected.errors ?? [], delayed: collected.delayed === true, stats: collected.stats ?? null, durationMs: Date.now() - started};
      const r = await rec('collection', {kind: 'daily_collection', day: window.day, attempted: collected.attempted === true, provider: collected.provider ?? null, delayed: collected.delayed === true, observations: (collected.observations ?? []).map(o => ({code: o.code, sourceUrl: o.sourceUrl, rawHash: o.rawHash, observedAt: o.observedAt, finalClose: o.finalClose === true, rows: o.rows?.length ?? 0, lastDate: o.rows?.at(-1)?.date ?? null})), errors: collected.errors ?? [], stats: collected.stats ?? null, status: collected.attempted ? ((collected.errors ?? []).length ? 'partial' : 'ok') : 'not_attempted'});
      result.collectionRecordId = r.record.id;
      // 바꿀 새 묶음도 오늘 종가를 받는다(같은 수집기 · 실패해도 지금 종목에는 번지지 않음 — 그날은 바꾸지 않을 뿐)
      if (next) {
        try { next.collected = await collector(next.input, window, {now, rootDir}); } catch (e) { next.collected = {attempted: true, observations: [], errors: [{code: 'COLLECTOR_THREW', message: String(e.message)}]}; }
        const cn = next.collected; result.universe.collection = {attempted: cn.attempted === true, observations: cn.observations?.length ?? 0, errors: (cn.errors ?? []).length, stats: cn.stats ?? null};
        await rec('collection', {kind: 'universe_next_collection', day: window.day, universe: uniConfig.next.id, attempted: cn.attempted === true, provider: cn.provider ?? null, observations: (cn.observations ?? []).map(o => ({code: o.code, sourceUrl: o.sourceUrl, rawHash: o.rawHash, observedAt: o.observedAt, finalClose: o.finalClose === true, rows: o.rows?.length ?? 0, lastDate: o.rows?.at(-1)?.date ?? null})), errors: cn.errors ?? [], stats: cn.stats ?? null, status: cn.attempted ? ((cn.errors ?? []).length ? 'partial' : 'ok') : 'not_attempted'});
      }
      return {attempted: collected.attempted === true, observations: collected.observations?.length ?? 0, errors: (collected.errors ?? []).length, recordId: r.record.id};
    });
    // ③ 검증·보관(원자료 저널 · 원자적 저장)
    let updated = {input, changed: false, freshCodes: [], confirmedTodayCodes: [], actualAsOf: input.actualAsOf};
    await step('3_validate_store', async () => {
      if (!canCollect) return {skipped: true};
      updated = mergeRollingPrices(input, collected.observations ?? [], {now, expectedHash: rollingHash(input), calendar, runEndDate: null});
      if (updated.changed) {
        if (await fs.readFile(inputPath, 'utf8') !== raw) throw Error('CONCURRENT_INPUT_EDIT');
        await fs.writeFile(path.join(opsDir, 'input-before-' + rollingHash(raw) + '.json'), raw, {flag: 'wx'}).catch(e => { if (e.code !== 'EEXIST') throw e; });
        const text = JSON.stringify(updated.input); await atomicWrite(inputPath, text); raw = text; input = updated.input;
      }
      Object.assign(result, {inputChanged: updated.changed === true, actualAsOf: updated.actualAsOf, freshStocks: updated.freshCodes.length, confirmedTodayStocks: updated.confirmedTodayCodes.length, confirmedTodayCodes: updated.confirmedTodayCodes, inputSnapshotSHA256: rollingHash(raw)});
      result.unconfirmedCodes = input.assets.map(a => a.code).filter(c => !updated.confirmedTodayCodes.includes(c));
      // 새 묶음: 받은 종가를 검증해 작업본에 이어 붙인다(바꾸기 전까지 매 실행 · 실패하면 그날은 바꾸지 않음)
      if (next?.collected) {
        try { next.updated = mergeRollingPrices(next.input, next.collected.observations ?? [], {now, expectedHash: rollingHash(next.input), calendar, runEndDate: null}); if (next.updated.changed) { next.input = next.updated.input; result.universe.workingSHA256 = await saveWorkingNext(rootDir, next.input); } result.universe.confirmedToday = next.updated.confirmedTodayCodes.length; result.universe.actualAsOf = next.updated.actualAsOf; }
        catch (e) { next.updated = null; result.warnings.push('universe next validate: ' + e.message); result.universe.error = String(e.message); }
      }
      return {changed: updated.changed === true, confirmedToday: updated.confirmedTodayCodes.length, actualAsOf: updated.actualAsOf, inputSnapshotSHA256: result.inputSnapshotSHA256};
    }).catch(e => { result.status = 'failed_validation'; result.error = String(e.message); throw e; });
    result.inputSnapshotSHA256 ??= rollingHash(raw);
    // ④ 종목 바꾸기 — 새 묶음 오늘 종가가 모두 확정일 때만 · 지금 입력은 보관본으로(지우지 않음)
    if (next) await step('4_universe', async () => {
      const want = next.input.assets.length;
      const ready = next.updated && next.updated.confirmedTodayCodes.length === want && next.updated.actualAsOf === window.day;
      if (!ready) { result.universe.reason = `새 ${want}곳 오늘(${window.day}) 확정 종가 ${next.updated?.confirmedTodayCodes.length ?? 0}/${want} · ${want}곳 모두 확인될 때만 바꿈 · 오늘은 지금 종목으로 계속`; result.warnings.push('universe: ' + result.universe.reason); return {switched: false, reason: result.universe.reason}; }
      const before = result.inputSnapshotSHA256, sw = await applySwitch(rootDir, {current: input, next: next.input, now, day: window.day});
      raw = await fs.readFile(inputPath, 'utf8'); input = JSON.parse(raw); updated = next.updated;
      Object.assign(result, {inputSnapshotBeforeSwitch: before, inputSnapshotSHA256: rollingHash(raw), actualAsOf: updated.actualAsOf, confirmedTodayStocks: updated.confirmedTodayCodes.length, confirmedTodayCodes: updated.confirmedTodayCodes, unconfirmedCodes: input.assets.map(a => a.code).filter(c => !updated.confirmedTodayCodes.includes(c)), universeId: sw.to});
      Object.assign(result.universe, {switched: true, from: sw.from, to: sw.to, retiredFile: sw.retiredFile, kept: sw.codesTo.filter(c => sw.codesFrom.includes(c)).length, added: sw.codesTo.filter(c => !sw.codesFrom.includes(c)).length});
      await rec('operation', {kind: 'universe_switch', day: window.day, from: sw.from, to: sw.to, proposal: uniConfig.next.proposal ?? null, order: uniConfig.order ?? null, codesFrom: sw.codesFrom, codesTo: sw.codesTo, retiredFile: sw.retiredFile, inputSHA256: sw.inputSHA256, inputSnapshotBeforeSwitch: before, status: '종목 바꿈'}, {links: {inputSnapshotSHA256: result.inputSnapshotSHA256}});
      return {switched: true, from: sw.from, to: sw.to};
    });
    // 거래일 마감 뒤인데 지금 묶음 종가가 다 모이지 않으면 종료코드 2(매일 워크플로가 다시 시도)
    result.expectedStocks = input.assets.length;
    if (canCollect) {
      const complete = (result.confirmedTodayStocks ?? 0) === input.assets.length && result.actualAsOf === window.day;
      if (!collected.attempted || (collected.errors ?? []).length || collected.delayed || !complete) result.exitCode = 2;
      if (!complete) result.incompleteReason = `오늘(${window.day}) 확정 종가 ${result.confirmedTodayStocks ?? 0}/${input.assets.length} · 다음 시도에서 다시 받음`;
    }
    result.status = result.exitCode === 0 ? 'complete' : 'partial'; await save();
    // ⑤ 기록 · 판 화면
    await step('5_record_view', async () => {
      await rec('operation', {kind: 'daily_run', at: now, day: window.day, prediction: 'off', status: result.status, exitCode: result.exitCode, steps: result.steps.map(s => ({step: s.step, status: s.status, durationMs: s.durationMs, error: s.error ?? null})), confirmedTodayStocks: result.confirmedTodayStocks ?? null, expectedStocks: result.expectedStocks ?? null, collection: result.collection ? {attempted: result.collection.attempted, observations: result.collection.observations, errors: result.collection.errors.length, delayed: result.collection.delayed} : null, universe: result.universe ?? null, warnings: result.warnings, runtime, scheduledRunInstalled: runtime.scheduledRun});
      if (buildView) { const v = await buildView({now}); result.steps.at(-1).view = v; }
      return {};
    });
    await save(); return result;
  } catch (e) {
    result.status = ['started', 'complete', 'partial'].includes(result.status) ? 'failed' : result.status; result.exitCode = 2; result.error = String(e.message); await save();
    try { await appendRecord(rootDir, {type: 'operation', at: now, body: {kind: 'daily_run_failed', at: now, day: result.day ?? koreaDay(now), status: result.status, error: String(e.message), steps: result.steps.map(s => ({step: s.step, status: s.status, error: s.error ?? null}))}}); } catch {}
    return result;
  } finally { await lock.close(); await fs.unlink(path.join(opsDir, 'run.lock')); }
}
