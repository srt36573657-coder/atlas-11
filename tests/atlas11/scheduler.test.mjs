import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import {execFile} from 'node:child_process';
import {promisify} from 'node:util';
import {nextRunAt, nextRuns, classifyRun, runCommand, runWithRetries, acquireLock, releaseLock, makeClock, sleepUntil, readRunLines, dayAlreadySettled, commandFromEnv, DEFAULT_COMMAND, OPS_DIR, FILES} from '../../scripts/atlas11/scheduler.mjs';
import {realInputs, root, tempRoot} from './helpers.mjs';

const run = promisify(execFile);
const SCHEDULER = path.join(root, 'scripts/atlas11/scheduler.mjs');
const KST = (day, hhmm) => new Date(Date.parse(`${day}T${hhmm}:00+09:00`)).toISOString();

/** 가짜 하루치 실행기 — STUB_STATE 파일의 responses 를 차례로 돌려준다(마지막 것은 반복) · 받은 argv 를 기록 */
const STUB = `import fs from 'node:fs';
const f = process.env.STUB_STATE, s = JSON.parse(fs.readFileSync(f, 'utf8')), r = s.responses[Math.min(s.calls, s.responses.length - 1)];
s.calls++; s.argv = [...(s.argv ?? []), process.argv.slice(2)]; fs.writeFileSync(f, JSON.stringify(s));
if (r.crash) { console.error('stub crashed on purpose'); process.exit(r.exitCode ?? 1); }
console.log('noise line before json'); console.log(JSON.stringify(r.json)); process.exit(r.exitCode);
`;
async function stubRoot(responses) {
  const dir = await tempRoot();
  await fs.mkdir(path.join(dir, 'public/data'), {recursive: true}); await fs.copyFile(path.join(root, 'public/data/rolling-calendar.json'), path.join(dir, 'public/data/rolling-calendar.json'));
  const stub = path.join(dir, 'stub.mjs'), state = path.join(dir, 'stub-state.json');
  await fs.writeFile(stub, STUB); await fs.writeFile(state, JSON.stringify({calls: 0, responses}));
  return {dir, stub, state, opsDir: path.join(dir, OPS_DIR), env: {...process.env, STUB_STATE: state}, command: ['node', stub], readState: async () => JSON.parse(await fs.readFile(state, 'utf8'))};
}
const PARTIAL = {exitCode: 2, json: {status: 'partial', exitCode: 2, confirmedTodayStocks: 40, forecastId: 'prev-id', newForecast: false}};
const COMPLETE = {exitCode: 0, json: {status: 'complete', exitCode: 0, confirmedTodayStocks: 52, forecastId: 'new-id', newForecast: true}};

test('nextRunAt: 16:00 전 거래일=오늘 · 정각/이후=다음 거래일 · 주말 · 개천절 대체휴일(10/5) · 한글날(10/9) · 추석(9/24·25) · 시각 옵션 · 달력 끝', async () => {
  const {calendar} = await realInputs();
  assert.equal(calendar.holidays['2026-10-05'], '개천절 대체휴일'); assert.equal(calendar.holidays['2026-10-09'], '한글날'); assert.equal(calendar.holidays['2026-09-24'], '추석');
  assert.equal(nextRunAt('2026-10-02T02:00:00Z', calendar), KST('2026-10-02', '16:00'), '금요일 11:00 → 오늘 16:00');
  assert.equal(nextRunAt('2026-10-02T06:59:59Z', calendar), KST('2026-10-02', '16:00'), '15:59:59 → 오늘');
  assert.equal(nextRunAt('2026-10-02T07:00:00Z', calendar), KST('2026-10-06', '16:00'), '16:00 정각 → 주말·대체휴일 건너 화요일');
  assert.equal(nextRunAt('2026-10-03T03:00:00Z', calendar), KST('2026-10-06', '16:00'), '토요일 → 화요일(10/5 휴일)');
  assert.equal(nextRunAt('2026-10-04T23:30:00Z', calendar), KST('2026-10-06', '16:00'), 'KST 월요일 08:30 이지만 10/5 는 휴일');
  assert.equal(nextRunAt('2026-10-08T08:00:00Z', calendar), KST('2026-10-12', '16:00'), '목요일 17:00 → 한글날(금) 건너 월요일');
  assert.equal(nextRunAt('2026-09-23T07:30:00Z', calendar), KST('2026-09-28', '16:00'), '추석 연휴 건너뜀');
  assert.equal(nextRunAt('2026-09-24T02:00:00Z', calendar), KST('2026-09-28', '16:00'), '휴일 당일 낮 → 다음 거래일');
  assert.equal(nextRunAt('2026-10-02T02:00:00Z', calendar, {runTimeKST: '15:40'}), KST('2026-10-02', '15:40'));
  assert.equal(nextRunAt('2026-10-01T14:59:00Z', calendar), KST('2026-10-02', '16:00'), 'UTC 자정 전이지만 KST 는 이미 10/2 새벽');
  assert.throws(() => nextRunAt('2026-12-01T00:00:00Z', calendar), /CALENDAR_COVERAGE_EXHAUSTED/);
  assert.throws(() => nextRunAt('nonsense', calendar), /INVALID_CLOCK/);
  assert.throws(() => nextRunAt('2026-10-02T02:00:00Z', {sessions: ['2026-10-03']}), /ROLLING_CALENDAR_INVALID_SESSION/, '달력 검증(토요일)');
  assert.deepEqual(nextRuns('2026-10-01T00:00:00Z', calendar, 5).map(r => r.at), ['2026-10-01', '2026-10-02', '2026-10-06', '2026-10-07', '2026-10-08'].map(d => KST(d, '16:00')));
  assert.equal(nextRuns('2026-10-01T00:00:00Z', calendar, 1)[0].kst, '2026-10-01 16:00 KST');
  assert.equal(nextRuns('2026-11-27T00:00:00Z', calendar, 5).length, 2, '달력 끝(11/30)까지만: 11/27 · 11/30');
});

test('classifyRun: exit 0=complete · partial/52 미만=retry · 잠금 충돌·JSON 없음=재시도 대상 · failed_validation/failed=멈춤', () => {
  assert.equal(classifyRun({exitCode: 0, json: {status: 'complete'}}), 'complete');
  assert.equal(classifyRun({exitCode: 0, json: null}), 'complete');
  assert.equal(classifyRun({exitCode: 2, json: {status: 'partial', confirmedTodayStocks: 52, forecastId: 'x'}}), 'complete_with_warnings', '52 확정·발행됨·막지 않는 오류 → 다시 돌리지 않는다');
  assert.equal(classifyRun({exitCode: 2, json: {status: 'partial', confirmedTodayStocks: 52, forecastId: null}}), 'retry');
  assert.equal(classifyRun({exitCode: 2, json: {status: 'partial', confirmedTodayStocks: 40, forecastId: 'prev'}}), 'retry');
  assert.equal(classifyRun({exitCode: 2, json: {status: 'complete', confirmedTodayStocks: 51}}), 'retry');
  assert.equal(classifyRun({exitCode: 2, json: {status: 'already_running_or_unresolved_lock'}}), 'lock_conflict');
  assert.equal(classifyRun({exitCode: 2, json: {status: 'failed_validation', error: 'PRICE_SESSION_BASIS_CONFLICT'}}), 'failed');
  assert.equal(classifyRun({exitCode: 2, json: {status: 'failed'}}), 'failed');
  assert.equal(classifyRun({exitCode: 1, json: null}), 'crashed');
  assert.equal(classifyRun({exitCode: 2, json: {status: 'closed_session'}}), 'failed', '분류 밖은 재시도하지 않는다');
  assert.deepEqual(commandFromEnv({}), [...DEFAULT_COMMAND]); assert.deepEqual(commandFromEnv({ATLAS_DAILY_CMD: ' node  x.mjs --a b '}), ['node', 'x.mjs', '--a', 'b']);
});

test('runCommand: 마지막 JSON 줄을 읽고 --now 를 붙인다 · 죽으면 json=null · 없는 실행 파일', async () => {
  const s = await stubRoot([PARTIAL, {exitCode: 1, crash: true}]);
  const a = await runCommand(s.command, {cwd: s.dir, env: s.env, nowISO: '2026-10-01T07:00:00.000Z'});
  assert.equal(a.exitCode, 2); assert.equal(a.json.confirmedTodayStocks, 40); assert.deepEqual(a.command.slice(-2), ['--now', '2026-10-01T07:00:00.000Z']); assert.ok(a.command[0] === process.execPath);
  assert.deepEqual((await s.readState()).argv[0], ['--now', '2026-10-01T07:00:00.000Z']);
  const b = await runCommand(s.command, {cwd: s.dir, env: s.env, nowISO: '2026-10-01T07:00:00.000Z'});
  assert.equal(b.exitCode, 1); assert.equal(b.json, null); assert.match(b.stderr, /stub crashed/);
  const c = await runCommand(['node', s.stub, '--now', 'keep'], {cwd: s.dir, env: s.env, nowISO: 'x'}); assert.deepEqual((await s.readState()).argv[2], ['--now', 'keep'], '이미 --now 가 있으면 안 붙인다');
  const d = await runCommand(['/nonexistent/binary'], {cwd: s.dir, env: s.env}); assert.ok(d.exitCode !== 0 && d.json === null);
});

test('재시도 상태기계: partial(40/52) → 10분 뒤 재시도 → complete · 로그 두 줄 · 두 번째 --now 는 +10분', async () => {
  const s = await stubRoot([PARTIAL, COMPLETE]);
  const clock = makeClock({at: KST('2026-10-01', '16:00'), fast: true}), heartbeats = [];
  const r = await runWithRetries({plannedAt: KST('2026-10-01', '16:00'), command: s.command, clock, opsDir: s.opsDir, cwd: s.dir, env: s.env, heartbeat: {write: async p => { heartbeats.push(p); }}});
  assert.equal(r.outcome, 'complete'); assert.equal(r.attempts, 2);
  const lines = await readRunLines(s.opsDir); assert.equal(lines.length, 2);
  assert.deepEqual(lines.map(l => [l.attempt, l.exitCode, l.status, l.confirmedTodayStocks, l.forecastId, l.plannedAt]), [[1, 2, 'retry', 40, 'prev-id', KST('2026-10-01', '16:00')], [2, 0, 'complete', 52, 'new-id', KST('2026-10-01', '16:00')]]);
  assert.equal(lines[0].at, KST('2026-10-01', '16:00')); assert.equal(lines[1].at, KST('2026-10-01', '16:10'), '두 번째 시도는 10분 뒤');
  assert.ok(lines.every(l => Number.isFinite(l.durationMs) && typeof l.at === 'string'));
  const st = await s.readState(); assert.equal(st.calls, 2); assert.deepEqual(st.argv[1], ['--now', KST('2026-10-01', '16:10')]);
  assert.ok(heartbeats.some(h => h.retrying?.attempt === 2 && h.retrying.reason === 'retry'));
  assert.equal(dayAlreadySettled(lines, KST('2026-10-01', '16:00')), true); assert.equal(dayAlreadySettled(lines, KST('2026-10-02', '16:00')), false);
});

test('재시도 상태기계: 18:00 KST 까지만 — 17:45 시작 · 17:55 재시도 · 다음(18:05)은 넘기므로 given_up_for_day · 검증 실패는 즉시 멈춤 · 죽음도 재시도 대상 · 재시도 간격 설정', async () => {
  const s = await stubRoot([PARTIAL]);
  const clock = makeClock({at: KST('2026-10-01', '17:45'), fast: true});
  const r = await runWithRetries({plannedAt: KST('2026-10-01', '16:00'), command: s.command, clock, opsDir: s.opsDir, cwd: s.dir, env: s.env});
  assert.equal(r.outcome, 'given_up_for_day'); assert.equal(r.attempts, 2);
  const lines = await readRunLines(s.opsDir);
  assert.deepEqual(lines.map(l => [l.status, l.at]), [['retry', KST('2026-10-01', '17:45')], ['retry', KST('2026-10-01', '17:55')], ['given_up_for_day', KST('2026-10-01', '17:55')]]);
  assert.equal(lines[2].giveUpKST, '18:00'); assert.equal(lines[2].confirmedTodayStocks, 40); assert.equal(dayAlreadySettled(lines, KST('2026-10-01', '16:00')), true);
  const v = await stubRoot([{exitCode: 2, json: {status: 'failed_validation', error: 'PRICE_SESSION_BASIS_CONFLICT', confirmedTodayStocks: 0}}, COMPLETE]);
  const rv = await runWithRetries({plannedAt: KST('2026-10-01', '16:00'), command: v.command, clock: makeClock({at: KST('2026-10-01', '16:00'), fast: true}), opsDir: v.opsDir, cwd: v.dir, env: v.env});
  assert.equal(rv.outcome, 'failed'); assert.equal(rv.attempts, 1); assert.equal((await v.readState()).calls, 1, '검증 실패는 다시 돌리지 않는다');
  const c = await stubRoot([{exitCode: 1, crash: true}, COMPLETE]);
  const rc = await runWithRetries({plannedAt: KST('2026-10-01', '16:00'), command: c.command, clock: makeClock({at: KST('2026-10-01', '16:00'), fast: true}), opsDir: c.opsDir, cwd: c.dir, env: c.env, retryEveryMs: 60000});
  assert.equal(rc.outcome, 'complete'); assert.equal(rc.attempts, 2); const cl = await readRunLines(c.opsDir); assert.equal(cl[0].status, 'crashed'); assert.match(cl[0].stderr, /stub crashed/); assert.equal(cl[1].at, KST('2026-10-01', '16:01'));
  // 멈춤 신호가 오면 다음 재시도를 기다리지 않는다
  const st = await stubRoot([PARTIAL]); let stop = false;
  const rs = await runWithRetries({plannedAt: KST('2026-10-01', '16:00'), command: st.command, clock: makeClock({at: KST('2026-10-01', '16:00'), fast: true}), opsDir: st.opsDir, cwd: st.dir, env: st.env, stop: () => { stop = true; return true; }});
  assert.equal(rs.outcome, 'stopped'); assert.equal(rs.attempts, 1); assert.ok(stop);
});

test('시계·잠: --fast 는 실제로 자지 않고 시각만 건너뜀 · sleepUntil 은 ≤60초 조각으로 tick 을 부른다 · 흉내 시계는 실제 경과를 더한다 · wakeUp', async () => {
  const fast = makeClock({at: '2026-10-01T06:58:00.000Z', fast: true}); let ticks = 0; const t0 = Date.now();
  assert.equal(await sleepUntil(fast, Date.parse('2026-10-01T07:00:00.000Z'), {tick: () => { ticks++; }}), true);
  assert.equal(fast.nowISO(), '2026-10-01T07:00:00.000Z'); assert.equal(ticks, 2, '120초 = 60초 조각 둘'); assert.ok(Date.now() - t0 < 1000);
  const sim = makeClock({at: '2026-10-01T00:00:00.000Z'}); await new Promise(r => setTimeout(r, 30)); const drift = sim.now() - Date.parse('2026-10-01T00:00:00.000Z'); assert.ok(drift >= 25 && drift < 5000, String(drift));
  const real = makeClock(); let stopped = false; const p = sleepUntil(real, Date.now() + 60000, {chunkMs: 60000, stop: () => stopped}); setTimeout(() => { stopped = true; real.wakeUp(); }, 20); const started = Date.now(); assert.equal(await p, false); assert.ok(Date.now() - started < 5000, '멈춤 신호 + wakeUp 으로 일찍 깬다');
  assert.equal(await sleepUntil(fast, fast.now() + 5000, {stop: () => true}), false);
});

test('잠금: 살아 있는 pid 는 LOCK_HELD · 죽은 pid 는 교체(holder_not_running) · 24시간 지난 잠금은 교체(stale_24h · 메모 남김) · 남의 잠금은 풀지 않음', async () => {
  const dir = await tempRoot(), file = path.join(dir, OPS_DIR, FILES.lock);
  await fs.mkdir(path.dirname(file), {recursive: true});
  await fs.writeFile(file, JSON.stringify({pid: process.pid, startedAt: new Date().toISOString()}));
  await assert.rejects(acquireLock(file, {pid: 424242}), e => e.code === 'LOCK_HELD' && /LOCK_HELD/.test(e.message));
  await fs.writeFile(file, JSON.stringify({pid: 2147483000, startedAt: '2026-10-01T00:00:00.000Z'}));
  const a = await acquireLock(file, {pid: 424242}); assert.equal(a.replaced.reason, 'holder_not_running'); assert.equal(a.replaced.previousPid, 2147483000);
  assert.equal(JSON.parse(await fs.readFile(file, 'utf8')).pid, 424242);
  await fs.writeFile(file, JSON.stringify({pid: process.pid, startedAt: '2026-09-01T00:00:00.000Z'}));
  const old = Date.now() - 25 * 3600000; await fs.utimes(file, old / 1000, old / 1000);
  const b = await acquireLock(file, {pid: 424243}); assert.equal(b.replaced.reason, 'stale_24h'); assert.ok(b.replaced.lockAgeMs > 24 * 3600000);
  const written = JSON.parse(await fs.readFile(file, 'utf8')); assert.equal(written.pid, 424243); assert.equal(written.replaced.previousPid, process.pid);
  await releaseLock(file, 1); assert.ok(await fs.stat(file), '남의 pid 로는 안 지운다');
  await releaseLock(file, 424243); await assert.rejects(fs.stat(file));
  assert.deepEqual(await acquireLock(file, {pid: 1}), {acquired: true, replaced: null});
});

test('CLI --dry-run: 다음 실행 다섯 개 출력(마지막 줄 JSON) · 아무것도 실행하지 않음', async () => {
  const {stdout} = await run(process.execPath, [SCHEDULER, '--dry-run', '--at', '2026-10-01T00:00:00Z'], {cwd: root});
  const lines = stdout.trim().split('\n'), json = JSON.parse(lines.at(-1));
  assert.equal(json.mode, 'dry-run'); assert.equal(json.next.length, 5); assert.equal(json.next[0].at, KST('2026-10-01', '16:00')); assert.equal(json.next[2].at, KST('2026-10-06', '16:00'));
  assert.match(lines[0], /^1\. 2026-10-01 16:00 KST/); assert.deepEqual(json.command, [...DEFAULT_COMMAND]); assert.equal(json.runTimeKST, '16:00');
  await assert.rejects(fs.stat(path.join(root, OPS_DIR, FILES.lock)), '잠금을 만들지 않는다');
});

test('CLI --once: 하루치 명령을 바로 한 번(재시도 없음) · 그 exit code 로 끝 · 로그 한 줄 · 명령은 ATLAS_DAILY_CMD', async () => {
  const s = await stubRoot([PARTIAL, COMPLETE]);
  const env = {...s.env, ATLAS_DAILY_CMD: `node ${s.stub}`};
  await assert.rejects(run(process.execPath, [SCHEDULER, '--once', '--root', s.dir, '--at', '2026-10-01T07:00:00Z'], {cwd: root, env}), e => { const j = JSON.parse(e.stdout.trim().split('\n').at(-1)); return e.code === 2 && j.mode === 'once' && j.status === 'retry' && j.confirmedTodayStocks === 40 && j.result.status === 'partial'; });
  const lines = await readRunLines(s.opsDir); assert.equal(lines.length, 1); assert.equal(lines[0].mode, 'once'); assert.equal(lines[0].exitCode, 2);
  assert.equal((await s.readState()).calls, 1, '--once 는 재시도하지 않는다');
  const ok = await run(process.execPath, [SCHEDULER, '--once', '--root', s.dir], {cwd: root, env}); assert.equal(JSON.parse(ok.stdout.trim().split('\n').at(-1)).status, 'complete');
});

test('데몬(--fast · --max-runs 1): 15:59:30 에 켜져 16:00 실행 → 로그·heartbeat(stoppedAt)·잠금 해제 · 이미 돌고 있으면 exit 3 · 16:00 뒤에 켜지면 따라잡기', async () => {
  const s = await stubRoot([COMPLETE]);
  const env = {...s.env, ATLAS_DAILY_CMD: `node ${s.stub}`};
  const {stdout} = await run(process.execPath, [SCHEDULER, '--at', '2026-10-01T06:59:30Z', '--fast', '--max-runs', '1', '--root', s.dir], {cwd: root, env});
  const out = JSON.parse(stdout.trim().split('\n').at(-1)); assert.equal(out.mode, 'daemon'); assert.equal(out.runs, 1); assert.equal(out.outcome, 'complete');
  const lines = await readRunLines(s.opsDir); assert.equal(lines.length, 1); assert.equal(lines[0].plannedAt, KST('2026-10-01', '16:00')); assert.equal(lines[0].at, KST('2026-10-01', '16:00')); assert.equal(lines[0].status, 'complete');
  const hb = JSON.parse(await fs.readFile(path.join(s.opsDir, FILES.heartbeat), 'utf8'));
  assert.equal(hb.status, 'stopped'); assert.ok(hb.stoppedAt && hb.lastHeartbeat && hb.startedAt); assert.equal(hb.pid > 0, true); assert.equal(hb.lastRun.status, 'complete'); assert.equal(hb.nextRunAt, KST('2026-10-01', '16:00')); assert.equal(hb.mode, 'daemon_fast');
  await assert.rejects(fs.stat(path.join(s.opsDir, FILES.lock)), '끝나면 잠금을 푼다');
  // 이미 돌고 있는 잠금(이 검사 프로세스 pid) → exit 3
  await fs.writeFile(path.join(s.opsDir, FILES.lock), JSON.stringify({pid: process.pid, startedAt: new Date().toISOString()}));
  await assert.rejects(run(process.execPath, [SCHEDULER, '--at', '2026-10-01T06:59:30Z', '--fast', '--max-runs', '1', '--root', s.dir], {cwd: root, env}), e => e.code === 3 && /이미 돌고 있음/.test(e.stderr));
  await fs.unlink(path.join(s.opsDir, FILES.lock));
  // 16:20 에 켜졌고 그날 마무리 줄이 없으면 바로 따라잡는다 (새 임시 폴더)
  const c = await stubRoot([COMPLETE]); const envC = {...c.env, ATLAS_DAILY_CMD: `node ${c.stub}`};
  const r2 = await run(process.execPath, [SCHEDULER, '--at', '2026-10-01T07:20:00Z', '--fast', '--max-runs', '1', '--root', c.dir], {cwd: root, env: envC});
  const l2 = await readRunLines(c.opsDir); assert.equal(l2.length, 1); assert.equal(l2[0].plannedAt, KST('2026-10-01', '16:00')); assert.equal(l2[0].at, KST('2026-10-01', '16:20')); assert.match(r2.stderr, /따라잡습니다/);
  // 이미 마무리된 날은 따라잡지 않고 다음 거래일로 간다
  const r3 = await run(process.execPath, [SCHEDULER, '--at', '2026-10-01T07:30:00Z', '--fast', '--max-runs', '1', '--root', c.dir], {cwd: root, env: envC});
  const l3 = await readRunLines(c.opsDir); assert.equal(l3.length, 2); assert.equal(l3[1].plannedAt, KST('2026-10-02', '16:00')); assert.match(r3.stderr, /다음 실행 2026-10-02 16:00 KST/);
});

test('데몬 SIGTERM: 실제로 자는 중에 신호를 받으면 곧 멈추고 heartbeat 에 stoppedAt · 잠금 해제 · exit 0', async () => {
  const {spawn} = await import('node:child_process');
  const s = await stubRoot([COMPLETE]), env = {...s.env, ATLAS_DAILY_CMD: `node ${s.stub}`};
  const child = spawn(process.execPath, [SCHEDULER, '--at', '2026-10-01T01:00:00Z', '--root', s.dir], {cwd: root, env, stdio: ['ignore', 'pipe', 'pipe']});
  let stderr = ''; child.stderr.on('data', d => { stderr += d; });
  const t0 = Date.now();
  await new Promise(r => { const poll = () => { if (/다음 실행/.test(stderr)) r(); else if (Date.now() - t0 > 15000) r(); else setTimeout(poll, 25); }; poll(); });
  child.kill('SIGTERM');
  const code = await new Promise(r => child.on('close', r));
  assert.equal(code, 0); assert.ok(Date.now() - t0 < 15000, '60초 조각 안에서 바로 깬다'); assert.match(stderr, /SIGTERM/);
  const hb = JSON.parse(await fs.readFile(path.join(s.opsDir, FILES.heartbeat), 'utf8'));
  assert.equal(hb.status, 'stopped'); assert.ok(hb.stoppedAt); assert.equal(hb.runs, 0); assert.equal(hb.nextRunAt, KST('2026-10-01', '16:00'));
  await assert.rejects(fs.stat(path.join(s.opsDir, FILES.lock)));
  assert.deepEqual(await readRunLines(s.opsDir), [], '실행 전에 멈췄으므로 하루치는 돌지 않았다');
});

test('CLI --today: 거래일이면 16:00 계획분을 재시도 규칙대로(partial→complete · exit 0) · 휴일(한글날)이면 실행 없이 exit 0 · 전부 partial 이면 given_up_for_day · exit 2', async () => {
  const s = await stubRoot([PARTIAL, COMPLETE]), env = {...s.env, ATLAS_DAILY_CMD: `node ${s.stub}`};
  const ok = await run(process.execPath, [SCHEDULER, '--today', '--at', '2026-10-01T06:59:00Z', '--fast', '--root', s.dir], {cwd: root, env});
  const j = JSON.parse(ok.stdout.trim().split('\n').at(-1)); assert.equal(j.outcome, 'complete'); assert.equal(j.attempts, 2); assert.equal(j.plannedAt, KST('2026-10-01', '16:00'));
  const lines = await readRunLines(s.opsDir); assert.deepEqual(lines.map(l => [l.status, l.at]), [['retry', KST('2026-10-01', '16:00')], ['complete', KST('2026-10-01', '16:10')]]);
  const h = await run(process.execPath, [SCHEDULER, '--today', '--at', '2026-10-09T07:00:00Z', '--fast', '--root', s.dir], {cwd: root, env});
  assert.equal(JSON.parse(h.stdout.trim().split('\n').at(-1)).outcome, 'not_a_session'); assert.equal((await s.readState()).calls, 2, '휴일에는 명령을 부르지 않는다');
  const g = await stubRoot([PARTIAL]), envG = {...g.env, ATLAS_DAILY_CMD: `node ${g.stub}`};
  await assert.rejects(run(process.execPath, [SCHEDULER, '--today', '--at', '2026-10-01T08:55:00Z', '--fast', '--root', g.dir], {cwd: root, env: envG}), e => e.code === 2 && JSON.parse(e.stdout.trim().split('\n').at(-1)).outcome === 'given_up_for_day');
  assert.equal((await readRunLines(g.opsDir)).length, 2, '17:55 한 번 + given_up 줄');
});
