/**
 * ATLAS 11 · 예약 실행기(데몬 · 의존성 없음) — 거래일마다 16:00 KST 에 run_daily.mjs 를 돌린다
 *   node scripts/atlas11/scheduler.mjs                       # 데몬: 다음 거래일 16:00 까지 자고 → 실행 → 52 미확정이면 10분마다 18:00 까지 재시도
 *   node scripts/atlas11/scheduler.mjs --once                # 지금 바로 한 번 실행(재시도 없음) · 그 exit code 로 끝
 *   node scripts/atlas11/scheduler.mjs --today               # 오늘이 거래일이면 16:00 계획분을 재시도 규칙대로 돌리고 끝(타이머·cron 용) · complete 면 0, 아니면 2
 *   node scripts/atlas11/scheduler.mjs --dry-run [--at ISO]  # 다음 실행 시각 다섯 개만 출력하고 끝
 *   node scripts/atlas11/scheduler.mjs --at ISO [--fast] [--max-runs N] [--root dir]   # 시계 시작점 흉내(--fast: 실제로 자지 않음 · 검사용)
 * 환경변수: ATLAS_DAILY_CMD (기본 node scripts/atlas11/run_daily.mjs --collector scripts/atlas11/collect_naver.mjs · 실행 때 --now <시계> 를 붙인다)
 *          ATLAS_RUN_KST=16:00 · ATLAS_RETRY_MINUTES=10 · ATLAS_GIVE_UP_KST=18:00
 * 기록: reports/atlas11/operations/scheduler-runs.jsonl (실행마다 한 줄) · scheduler-heartbeat.json (60초마다) · scheduler.lock (한 번에 하나만)
 * 이 파일을 두는 것만으로는 아무것도 돌지 않는다 — deploy/ 의 설치(systemd · Docker · GitHub Actions) 중 하나가 필요하다.
 */
import fs from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';
import {spawn} from 'node:child_process';
import {validateRollingCalendar} from '../../lib/rolling-calendar.mjs';

export const DEFAULT_COMMAND = Object.freeze(['node', 'scripts/atlas11/run_daily.mjs', '--collector', 'scripts/atlas11/collect_naver.mjs']);
export const OPS_DIR = 'reports/atlas11/operations';
export const FILES = Object.freeze({runs: 'scheduler-runs.jsonl', heartbeat: 'scheduler-heartbeat.json', lock: 'scheduler.lock'});
const KST = 9 * 3600000;
export const kstDay = ms => new Date(ms + KST).toISOString().slice(0, 10);
export const kstDateTime = ms => new Date(ms + KST).toISOString().slice(0, 16).replace('T', ' ') + ' KST';
/** 'YYYY-MM-DD' + 'HH:MM' (KST) → epoch ms */
export const kstInstant = (day, hhmm) => { if (!/^\d{2}:\d{2}$/.test(hhmm)) throw Error('BAD_KST_TIME:' + hhmm); return Date.parse(`${day}T${hhmm}:00+09:00`); };
const iso = ms => new Date(ms).toISOString();
const parseISO = x => { const t = Date.parse(x); if (!Number.isFinite(t)) throw Error('INVALID_CLOCK:' + x); return t; };

/** 다음 실행 시각 — 오늘이 거래일이고 아직 16:00 전이면 오늘 16:00, 아니면 다음 거래일 16:00 (주말·휴일은 sessions 에 없으므로 자연히 건너뛴다) */
export function nextRunAt(nowISO, calendar, {runTimeKST = '16:00'} = {}) {
  validateRollingCalendar(calendar);
  const now = parseISO(nowISO), day = kstDay(now), sessions = calendar.sessions;
  if (sessions.includes(day) && now < kstInstant(day, runTimeKST)) return iso(kstInstant(day, runTimeKST));
  const next = sessions.find(d => d > day);
  if (!next) throw Error('CALENDAR_COVERAGE_EXHAUSTED:' + (calendar.coverageEnd ?? sessions.at(-1)));
  return iso(kstInstant(next, runTimeKST));
}
export function nextRuns(nowISO, calendar, count = 5, options = {}) {
  const out = []; let cursor = nowISO;
  for (let i = 0; i < count; i++) { let at; try { at = nextRunAt(cursor, calendar, options); } catch (e) { if (/COVERAGE_EXHAUSTED/.test(e.message)) break; throw e; } out.push({at, kst: kstDateTime(parseISO(at))}); cursor = at; }
  return out;
}

/** 실행 결과 분류 — retry 는 「수집 지연」(52 미확정 · 잠금 충돌 · JSON 없이 죽음)만. 52 확정에 발행까지 됐는데 exit 2 면(막지 않는 오류) 다시 돌려도 같으므로 complete_with_warnings 로 끝낸다. 검증 실패·실행기 오류도 멈춘다 */
export function classifyRun({exitCode, json}) {
  if (exitCode === 0) return 'complete';
  if (!json) return 'crashed';
  if (json.status === 'already_running_or_unresolved_lock') return 'lock_conflict';
  if (json.status === 'failed_validation' || json.status === 'failed') return 'failed';
  const confirmed = Number.isFinite(json.confirmedTodayStocks) ? json.confirmedTodayStocks : null;
  if (exitCode === 2 && json.status === 'partial') return confirmed !== null && confirmed >= 52 && json.forecastId ? 'complete_with_warnings' : 'retry';
  if (confirmed !== null && confirmed < 52) return 'retry';
  return 'failed';
}
export const RETRYABLE = Object.freeze(['retry', 'lock_conflict', 'crashed']);
export const SETTLED = Object.freeze(['complete', 'complete_with_warnings', 'given_up_for_day', 'failed']);

export function commandFromEnv(env = process.env) {
  const raw = env.ATLAS_DAILY_CMD?.trim();
  return raw ? raw.split(/\s+/) : [...DEFAULT_COMMAND];
}
/** 실행기 한 번 — stdout 마지막 JSON 줄을 결과로 읽는다. --now 가 없으면 시계값을 붙인다(수집기 관측 시각 도장 · collect_naver.mjs 머리말 참고) */
export function runCommand(command, {cwd = process.cwd(), env = process.env, nowISO = new Date().toISOString(), appendNow = true, onChild = null, spawnFn = spawn} = {}) {
  const [bin, ...args] = command, exe = bin === 'node' ? process.execPath : bin, argv = appendNow && !args.includes('--now') ? [...args, '--now', nowISO] : args, startedAt = new Date().toISOString(), t0 = Date.now();
  return new Promise(resolve => {
    let stdout = '', stderr = '';
    const cap = (s, chunk) => (s + chunk).slice(-1e6);
    let child;
    try { child = spawnFn(exe, argv, {cwd, env, stdio: ['ignore', 'pipe', 'pipe']}); }
    catch (e) { return resolve({exitCode: 127, json: null, stdout: '', stderr: String(e.message), startedAt, durationMs: 0, command: [exe, ...argv]}); }
    onChild?.(child);
    child.stdout.on('data', d => { stdout = cap(stdout, d); }); child.stderr.on('data', d => { stderr = cap(stderr, d); });
    child.on('error', e => { stderr = cap(stderr, '\n' + e.message); });
    child.on('close', (code, signal) => {
      let json = null;
      for (const line of stdout.trim().split('\n').reverse()) { try { const v = JSON.parse(line); if (v && typeof v === 'object') { json = v; break; } } catch {} }
      resolve({exitCode: code ?? 1, signal: signal ?? null, json, stdout: stdout.slice(-4000), stderr: stderr.slice(-4000), startedAt, durationMs: Date.now() - t0, command: [exe, ...argv]});
    });
  });
}

// ---------- 기록 ----------
const atomicWrite = async (file, text) => { await fs.mkdir(path.dirname(file), {recursive: true}); await fs.writeFile(file + '.next', text); await fs.rename(file + '.next', file); };
export async function appendRunLine(opsDir, line) { await fs.mkdir(opsDir, {recursive: true}); await fs.appendFile(path.join(opsDir, FILES.runs), JSON.stringify(line) + '\n'); }
export async function readRunLines(opsDir) { try { return (await fs.readFile(path.join(opsDir, FILES.runs), 'utf8')).split('\n').filter(Boolean).map(l => { try { return JSON.parse(l); } catch { return null; } }).filter(Boolean); } catch (e) { if (e.code === 'ENOENT') return []; throw e; } }
export function makeHeartbeat(opsDir, base) {
  const state = {pid: process.pid, host: os.hostname(), startedAt: new Date().toISOString(), lastHeartbeat: null, nextRunAt: null, lastRun: null, ...base};
  return {state, write: async patch => { Object.assign(state, patch, {lastHeartbeat: new Date().toISOString()}); await atomicWrite(path.join(opsDir, FILES.heartbeat), JSON.stringify(state, null, 2)); return state; }};
}

// ---------- 잠금 (한 번에 하나) ----------
const pidAlive = pid => { if (!Number.isInteger(pid) || pid <= 0) return false; try { process.kill(pid, 0); return true; } catch (e) { return e.code === 'EPERM'; } };
export async function acquireLock(file, {pid = process.pid, staleMs = 24 * 3600000, now = Date.now()} = {}) {
  await fs.mkdir(path.dirname(file), {recursive: true});
  const body = note => JSON.stringify({pid, startedAt: iso(now), host: os.hostname(), ...(note ? {replaced: note} : {})}, null, 2);
  try { await fs.writeFile(file, body(null), {flag: 'wx'}); return {acquired: true, replaced: null}; }
  catch (e) {
    if (e.code !== 'EEXIST') throw e;
    let previous = {}; try { previous = JSON.parse(await fs.readFile(file, 'utf8')); } catch {}
    const st = await fs.stat(file), ageMs = now - st.mtimeMs, alive = pidAlive(previous.pid);
    const reason = ageMs > staleMs ? 'stale_24h' : !alive ? 'holder_not_running' : null;
    if (!reason) { const err = Error(`LOCK_HELD: pid ${previous.pid} since ${previous.startedAt ?? iso(st.mtimeMs)} (${file})`); err.code = 'LOCK_HELD'; throw err; }
    const note = {previousPid: previous.pid ?? null, previousStartedAt: previous.startedAt ?? null, lockAgeMs: Math.round(ageMs), reason, replacedAt: iso(now)};
    await fs.writeFile(file, body(note)); return {acquired: true, replaced: note};
  }
}
export async function releaseLock(file, pid = process.pid) { try { const cur = JSON.parse(await fs.readFile(file, 'utf8')); if (cur.pid === pid) await fs.unlink(file); } catch (e) { if (e.code !== 'ENOENT') throw e; } }

// ---------- 시계 (실제 · --at 흉내 · --fast 가상) ----------
export function makeClock({at = null, fast = false} = {}) {
  const realStart = Date.now(); let virtual = at != null ? parseISO(at) : realStart; let wake = null;
  const clock = {
    fast, now: () => (fast ? virtual : at != null ? virtual + (Date.now() - realStart) : Date.now()), nowISO: () => iso(clock.now()),
    /** ms 만큼 잔다(가상 시계면 바로 건너뜀) · wakeUp() 으로 일찍 깰 수 있다 */
    sleep: ms => { if (fast) { virtual += ms; return Promise.resolve(); } return new Promise(r => { const t = setTimeout(() => { wake = null; r(); }, ms); wake = () => { clearTimeout(t); wake = null; r(); }; }); },
    wakeUp: () => wake?.()};
  return clock;
}
/** target(ms)까지 ≤ chunkMs 씩 잔다 — 사이마다 tick(heartbeat) · stop() 이 true 면 그만 */
export async function sleepUntil(clock, target, {chunkMs = 60000, tick = null, stop = () => false} = {}) {
  while (!stop()) { const remaining = target - clock.now(); if (remaining <= 0) return true; await clock.sleep(Math.min(chunkMs, remaining)); await tick?.(); }
  return false;
}

// ---------- 하루치 실행 + 재시도 상태기계 ----------
/**
 * runWithRetries({plannedAt, command, clock, opsDir, cwd, env, retryEveryMs=600000, giveUpKST='18:00', onChild, stop})
 *   실행 → complete 면 끝 · 재시도 대상(52 미확정 등)이면 10분 뒤 다시 · 다음 시도가 그날 18:00 을 넘기면 given_up_for_day
 */
export async function runWithRetries({plannedAt, command, clock, opsDir, cwd = process.cwd(), env = process.env, retryEveryMs = 600000, giveUpKST = '18:00', onChild = null, stop = () => false, heartbeat = null, appendNow = true}) {
  const plannedMs = parseISO(plannedAt), giveUpAt = kstInstant(kstDay(plannedMs), giveUpKST), lines = [];
  for (let attempt = 1; ; attempt++) {
    const nowISO = clock.nowISO(), res = await runCommand(command, {cwd, env, nowISO, onChild, appendNow}), status = classifyRun(res);
    const line = {at: nowISO, plannedAt, attempt, exitCode: res.exitCode, status, runStatus: res.json?.status ?? null, confirmedTodayStocks: res.json?.confirmedTodayStocks ?? null, forecastId: res.json?.forecastId ?? null, newForecast: res.json?.newForecast ?? null, durationMs: res.durationMs, ...(status === 'crashed' ? {stderr: res.stderr.slice(-800)} : {})};
    await appendRunLine(opsDir, line); lines.push(line); await heartbeat?.write({lastRun: line});
    if (status === 'complete' || status === 'complete_with_warnings') return {outcome: status, attempts: attempt, lines};
    if (!RETRYABLE.includes(status)) return {outcome: status, attempts: attempt, lines};
    const nextTry = clock.now() + retryEveryMs;
    if (nextTry >= giveUpAt) { const g = {at: clock.nowISO(), plannedAt, attempt, exitCode: null, status: 'given_up_for_day', giveUpKST, lastStatus: status, confirmedTodayStocks: line.confirmedTodayStocks, forecastId: line.forecastId}; await appendRunLine(opsDir, g); lines.push(g); await heartbeat?.write({lastRun: g}); return {outcome: 'given_up_for_day', attempts: attempt, lines}; }
    if (stop()) return {outcome: 'stopped', attempts: attempt, lines};
    await heartbeat?.write({nextRunAt: iso(nextTry), retrying: {attempt: attempt + 1, reason: status}});
    if (!await sleepUntil(clock, nextTry, {tick: () => heartbeat?.write({}), stop})) return {outcome: 'stopped', attempts: attempt, lines};
  }
}
/** 오늘 계획된 실행이 이미 끝났는가(로그에 마무리 줄이 있는가) — 데몬이 16:00 뒤에 켜졌을 때 따라잡기 판단 */
export function dayAlreadySettled(lines, plannedAt) { return lines.some(l => l.plannedAt === plannedAt && SETTLED.includes(l.status)); }

// ---------- 데몬 ----------
export async function daemon({rootDir = process.cwd(), calendarPath = 'public/data/rolling-calendar.json', command = commandFromEnv(), clock = makeClock(), runTimeKST = process.env.ATLAS_RUN_KST || '16:00', retryEveryMs = Number(process.env.ATLAS_RETRY_MINUTES || 10) * 60000, giveUpKST = process.env.ATLAS_GIVE_UP_KST || '18:00', maxRuns = Infinity, chunkMs = 60000, env = process.env, log = m => console.error(m)} = {}) {
  const opsDir = path.join(rootDir, OPS_DIR), lockFile = path.join(opsDir, FILES.lock);
  const lock = await acquireLock(lockFile);
  const heartbeat = makeHeartbeat(opsDir, {mode: clock.fast ? 'daemon_fast' : 'daemon', command, runTimeKST, retryEveryMs, giveUpKST, lockReplaced: lock.replaced});
  let stopping = false, child = null, signals = 0;
  const onSignal = sig => { signals++; stopping = true; log(`[scheduler] ${sig} — 멈춥니다${child ? ' (실행 중인 하루치가 끝나기를 기다림 · 한 번 더 보내면 강제 종료)' : ''}`); clock.wakeUp(); if (signals >= 2 && child) child.kill('SIGTERM'); };
  process.on('SIGTERM', onSignal); process.on('SIGINT', onSignal);
  const readCalendar = async () => validateRollingCalendar(JSON.parse(await fs.readFile(path.join(rootDir, calendarPath), 'utf8')));
  let runs = 0, outcome = null;
  try {
    await heartbeat.write({status: 'started'});
    while (!stopping && runs < maxRuns) {
      let calendar; try { calendar = await readCalendar(); } catch (e) { log('[scheduler] 달력 읽기 실패: ' + e.message + ' · 1시간 뒤 다시'); await heartbeat.write({status: 'calendar_unreadable', error: e.message}); await sleepUntil(clock, clock.now() + 3600000, {chunkMs, tick: () => heartbeat.write({}), stop: () => stopping}); continue; }
      // 따라잡기: 오늘 거래일 16:00~18:00 사이에 켜졌고 오늘치 마무리 줄이 없으면 지금 돌린다
      const today = kstDay(clock.now()), todayRun = iso(kstInstant(today, runTimeKST));
      let plannedAt;
      if (calendar.sessions.includes(today) && clock.now() >= parseISO(todayRun) && clock.now() < kstInstant(today, giveUpKST) && !dayAlreadySettled(await readRunLines(opsDir), todayRun)) { plannedAt = todayRun; log(`[scheduler] 오늘(${today}) 16:00 실행 기록이 없어 지금 따라잡습니다`); }
      else {
        try { plannedAt = nextRunAt(clock.nowISO(), calendar, {runTimeKST}); }
        catch (e) { log('[scheduler] ' + e.message + ' · 달력 검토 필요 · 1시간 뒤 다시'); await heartbeat.write({status: 'calendar_review_required', error: e.message, nextRunAt: null}); await sleepUntil(clock, clock.now() + 3600000, {chunkMs, tick: () => heartbeat.write({}), stop: () => stopping}); continue; }
        log(`[scheduler] 다음 실행 ${kstDateTime(parseISO(plannedAt))} (${plannedAt})`);
        await heartbeat.write({status: 'sleeping', nextRunAt: plannedAt});
        const reached = await sleepUntil(clock, parseISO(plannedAt), {chunkMs, tick: () => heartbeat.write({}), stop: () => stopping});
        if (!reached) break;
      }
      await heartbeat.write({status: 'running', nextRunAt: plannedAt, retrying: null});
      const result = await runWithRetries({plannedAt, command, clock, opsDir, cwd: rootDir, env, retryEveryMs, giveUpKST, heartbeat, onChild: c => { child = c; c.on('close', () => { child = null; }); }, stop: () => stopping});
      runs++; outcome = result.outcome; log(`[scheduler] ${kstDateTime(parseISO(plannedAt))} 결과 ${result.outcome} · 시도 ${result.attempts}`);
      await heartbeat.write({status: 'idle', retrying: null, lastOutcome: result.outcome});
    }
  } finally {
    await heartbeat.write({status: 'stopped', stoppedAt: new Date().toISOString(), runs, lastOutcome: outcome});
    await releaseLock(lockFile);
    process.off('SIGTERM', onSignal); process.off('SIGINT', onSignal);
  }
  return {runs, outcome, stopped: stopping};
}

// ---------- CLI ----------
if (process.argv[1] && path.resolve(process.argv[1]) === new URL(import.meta.url).pathname) {
  const argv = process.argv.slice(2), arg = name => { const i = argv.indexOf(name); return i < 0 ? null : argv[i + 1]; }, has = name => argv.includes(name);
  const rootDir = path.resolve(arg('--root') ?? process.cwd()), clock = makeClock({at: arg('--at'), fast: has('--fast')}), command = commandFromEnv();
  const runTimeKST = process.env.ATLAS_RUN_KST || '16:00';
  if (has('--dry-run')) {
    const calendar = validateRollingCalendar(JSON.parse(await fs.readFile(path.join(rootDir, 'public/data/rolling-calendar.json'), 'utf8')));
    const next = nextRuns(clock.nowISO(), calendar, 5, {runTimeKST});
    for (const [i, r] of next.entries()) console.log(`${i + 1}. ${r.kst}  (${r.at})`);
    console.log(JSON.stringify({mode: 'dry-run', now: clock.nowISO(), runTimeKST, command, next, coverageEnd: calendar.coverageEnd ?? null, note: '출력만 · 아무것도 실행하지 않음'}));
  } else if (has('--today')) {
    const opsDir = path.join(rootDir, OPS_DIR), calendar = validateRollingCalendar(JSON.parse(await fs.readFile(path.join(rootDir, 'public/data/rolling-calendar.json'), 'utf8')));
    const today = kstDay(clock.now()), plannedAt = iso(kstInstant(today, runTimeKST)), giveUpKST = process.env.ATLAS_GIVE_UP_KST || '18:00';
    if (!calendar.sessions.includes(today)) { console.log(JSON.stringify({mode: 'today', day: today, outcome: 'not_a_session', note: '거래일이 아니므로 실행하지 않음'})); }
    else {
      if (clock.now() < parseISO(plannedAt)) { console.error(`[scheduler] ${kstDateTime(parseISO(plannedAt))} 까지 기다립니다`); await sleepUntil(clock, parseISO(plannedAt)); }
      const heartbeat = makeHeartbeat(opsDir, {mode: 'today', command, runTimeKST, giveUpKST});
      const r = await runWithRetries({plannedAt, command, clock, opsDir, cwd: rootDir, retryEveryMs: Number(process.env.ATLAS_RETRY_MINUTES || 10) * 60000, giveUpKST, heartbeat});
      await heartbeat.write({status: 'stopped', stoppedAt: new Date().toISOString(), lastOutcome: r.outcome});
      console.log(JSON.stringify({mode: 'today', day: today, plannedAt, outcome: r.outcome, attempts: r.attempts, lastRun: r.lines.at(-1)}));
      process.exitCode = r.outcome === 'complete' ? 0 : 2;   // complete_with_warnings 도 2 — latest.json 의 collection.errors 를 보라는 뜻
    }
  } else if (has('--once')) {
    const opsDir = path.join(rootDir, OPS_DIR), nowISO = clock.nowISO(), res = await runCommand(command, {cwd: rootDir, nowISO}), status = classifyRun(res);
    const line = {at: nowISO, plannedAt: nowISO, attempt: 1, exitCode: res.exitCode, status, runStatus: res.json?.status ?? null, confirmedTodayStocks: res.json?.confirmedTodayStocks ?? null, forecastId: res.json?.forecastId ?? null, durationMs: res.durationMs, mode: 'once'};
    await appendRunLine(opsDir, line);
    if (res.stderr) process.stderr.write(res.stderr);
    console.log(JSON.stringify({mode: 'once', ...line, command: res.command, result: res.json}));
    process.exitCode = res.exitCode;
  } else {
    const maxRuns = arg('--max-runs') != null ? Number(arg('--max-runs')) : Infinity;
    try { const r = await daemon({rootDir, command, clock, maxRuns, runTimeKST}); console.log(JSON.stringify({mode: 'daemon', ...r})); }
    catch (e) { if (e.code === 'LOCK_HELD') { console.error('[scheduler] 이미 돌고 있음 · ' + e.message); process.exitCode = 3; } else throw e; }
  }
}
