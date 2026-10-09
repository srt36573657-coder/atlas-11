// 몬테카를로 엔진 fhs-crn-2(scripts/atlas11/mc/fhs_crn.py) — 사장님 2026-10-10 05:14(마카오) 승인 · 계획 docs/superpowers/plans/2026-10-10-atlas-phase1-engine.md Task 1
// 작은 수(두 판 합 73,000 · 기본 100)로 임시 뿌리(--out-root)에 돌려 모양 · 경로 셈 · 재현 · 성질을 본다 · 입력은 저장소에서 읽음
import test, {after} from 'node:test';
import assert from 'node:assert/strict';
import {spawnSync} from 'node:child_process';
import crypto from 'node:crypto';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

const root = process.cwd();
// 넘파이가 없는 기계(예: 파이썬을 따로 깔지 않은 작업 러너)에서는 이 묶음만 건너뜀 — 「없다」고 알림(조용히 통과로 치지 않음)
const NUMPY = spawnSync('python3', ['-c', 'import numpy'], {encoding: 'utf8'}).status === 0;
if (!NUMPY) { test('몬테카를로 엔진 시험 — 넘파이가 없어 건너뜀', {skip: 'python3 + numpy 없음'}, () => {}); }
const T = NUMPY ? test : test.skip;
const run = (args) => NUMPY ? spawnSync('python3', ['scripts/atlas11/mc/fhs_crn.py', ...args], {cwd: root, encoding: 'utf8', maxBuffer: 1e8}) : {status: null, stdout: '', stderr: 'numpy 없음'};
const temps = [];
const mkTmp = () => { const d = fs.mkdtempSync(path.join(os.tmpdir(), 'mc-')); temps.push(d); return d; };
after(() => { for (const d of temps) fs.rmSync(d, {recursive: true, force: true}); });
const lastLine = r => JSON.parse(r.stdout.trim().split('\n').at(-1));
const readRes = (dir, place, id) => JSON.parse(fs.readFileSync(path.join(dir, `public/data/atlas11/mc/${place}/${id}.json`), 'utf8'));
const sha = f => crypto.createHash('sha256').update(fs.readFileSync(path.join(root, f))).digest('hex');
const INPUT = {kr: 'public/data/input.json', us: 'public/data/atlas11/us/input.json'};
const ID = 'test-hand-00000000';
const tmp = mkTmp();
const r1 = run(['--run-id', ID, '--slot', 'hand', '--total', '73000', '--base', '100', '--out-root', tmp]);

T('엔진이 끝까지 돌고 회차 기록을 낸다', () => {
  assert.equal(r1.status, 0, r1.stderr);
  const rec = lastLine(r1);
  assert.equal(rec.schema, 'atlas11-round-1');
  assert.equal(rec.paths.target, 73000);
  assert.equal(rec.paths.done + rec.paths.nonfinite, 73000);
  assert.equal(rec.runId, ID); assert.equal(rec.slot, 'hand'); assert.equal(rec.paths.reproRuns, 0);
  assert.deepEqual(rec.verify.files, [`reports/atlas11/rounds/${ID}.verify-mc.json`, `reports/atlas11/rounds/${ID}.verify-elim-kr.json`, `reports/atlas11/rounds/${ID}.verify-elim-us.json`], '검사 결과는 따로 새 파일');
  assert.equal(rec.published, false);
  for (const k of ['sha256', 'python', 'numpy']) assert.ok(rec.engine[k], `실행 버전 ${k}`);
  assert.deepEqual(Object.keys(rec.boards), ['kr', 'us']);
  assert.equal(rec.boards.kr.paths.target + rec.boards.us.paths.target, 73000);
  for (const k of ['loadSec', 'simSec', 'peakRssMb', 'cpu']) assert.ok(Number.isFinite(rec.time[k]), k);
  assert.deepEqual(JSON.parse(fs.readFileSync(path.join(tmp, `reports/atlas11/rounds/${ID}.json`), 'utf8')), rec, '회차 기록 파일 = stdout 마지막 줄');
});

T('판 결과 — 경로 셈 · 분위수 차례 · 기울기 0 표시', () => {
  for (const place of ['kr', 'us']) {
    const ptr = JSON.parse(fs.readFileSync(path.join(tmp, `public/data/atlas11/mc/${place}/latest.json`), 'utf8'));
    const res = JSON.parse(fs.readFileSync(path.join(tmp, ptr.file), 'utf8'));
    assert.equal(res.schema, 'atlas11-mc-2'); assert.equal(res.model.drift, 0); assert.equal(res.model.demean, true);
    assert.equal(res.rows.reduce((s, x) => s + x.n + x.nonfinite, 0), res.paths.target);
    for (const x of res.rows) {
      assert.equal(x.n + x.nonfinite, x.nBase + x.nExtra);
      assert.ok(x.q05 <= x.q10 && x.q10 <= x.median && x.median <= x.q90, x.code);
      assert.ok(x.cvar5 <= x.q05 + 1e-12, x.code);
      assert.ok(x.ploss >= 0 && x.ploss <= 1);
      for (const k of ['mean', 'median', 'ploss', 'q05', 'q10', 'q90', 'cvar5', 'volNow', 'vol2y']) assert.ok(Number.isFinite(x[k]), `${x.code} ${k}`);
      for (const k of ['mean', 'ploss', 'q05', 'cvar5']) assert.ok(Number.isFinite(x.se[k]) && x.se[k] >= 0, `${x.code} se.${k}`);
      assert.ok(x.clamped <= x.nBase + x.nExtra && x.extreme <= x.n);
    }
    assert.equal(res.model.limit, place === 'kr' ? 0.3 : null);
    assert.equal(res.model.id, 'fhs-crn-2'); assert.equal(res.model.H, 60); assert.equal(res.rng.bitGenerator, 'PCG64DXSM'); assert.equal(res.rng.stream, `board-${place}`);
    assert.deepEqual(res.rows.map(x => x.code), res.rows.map(x => x.code).sort(), '회사 차례 = 코드 차례');
    assert.equal(res.paths.done, res.rows.reduce((s, x) => s + x.n, 0));
    assert.equal(res.rows.reduce((s, x) => s + x.nExtra, 0), res.alloc.extraBoard);
    if (place === 'us') assert.equal(res.paths.clampedLimit, 0, '미국은 가격 제한이 없음');
    assert.equal(res.input.file, INPUT[place]); assert.equal(res.input.sha256, sha(INPUT[place]), '입력 지문 = 파일 바이트 sha256');
    assert.equal(res.input.stocks, res.rows.length); assert.equal(res.asOf, res.input.to);
    assert.deepEqual([ptr.schema, ptr.runId, ptr.asOf, ptr.inputSha256, ptr.made], ['atlas11-mc-latest-1', ID, res.asOf, res.input.sha256, res.made]);
  }
});

T('같은 회차 ID 면 결과가 똑같다(재현 — 새 경로로 세지 않음)', () => {
  const tmp2 = mkTmp();
  const r2 = run(['--run-id', 'test-hand-00000000', '--slot', 'hand', '--total', '73000', '--base', '100', '--out-root', tmp2]);
  assert.equal(r2.status, 0, r2.stderr);
  for (const place of ['kr', 'us']) {
    const a = JSON.parse(fs.readFileSync(path.join(tmp, `public/data/atlas11/mc/${place}/test-hand-00000000.json`), 'utf8'));
    const b = JSON.parse(fs.readFileSync(path.join(tmp2, `public/data/atlas11/mc/${place}/test-hand-00000000.json`), 'utf8'));
    assert.deepEqual(a.rows, b.rows);
  }
});

// 추가 몫이 큰 판(두 판 합 400,000 · 기본 100 → 한 곳 추가 위 끝 1,000 에 닿는 곳이 생김) — 아래 두 시험이 함께 씀
//   수렴 바닥은 끔(--se-target 1) — 기본 100개는 오차가 커서 바닥이 추가 몫을 다 가져가 무게 셈을 볼 수 없음(바닥은 아래 따로 봄)
const tmp3 = mkTmp();
const r3 = run(['--run-id', ID, '--slot', 'hand', '--total', '400000', '--base', '100', '--se-target', '1', '--out-root', tmp3]);
const tmp4 = mkTmp();
const r4 = run(['--run-id', ID, '--slot', 'hand', '--total', '400000', '--base', '100', '--out-root', tmp4]);

T('수렴 바닥 — 기본 몫 오차가 기준을 넘는 곳이 추가를 먼저 받고 합은 그대로', () => {
  assert.equal(r4.status, 0, r4.stderr);
  for (const place of ['kr', 'us']) {
    const x = readRes(tmp4, place, ID);
    assert.equal(x.alloc.floor.target, 0.0045);
    assert.ok(x.alloc.floor.stocks > 0 && x.alloc.floor.paths > 0, '기본 100개면 바닥이 걸림');
    assert.ok(x.alloc.floor.paths <= x.alloc.extraBoard);
    assert.equal(x.rows.reduce((s, y) => s + y.nExtra, 0), x.alloc.extraBoard);
    assert.ok(x.rows.every(y => y.nExtra <= x.alloc.cap));
  }
});

T('추가 몫 — 판마다 회사 수 비례 · 무게대로 · 한 곳 위 끝 · 합이 정확히 맞음', () => {
  assert.equal(r3.status, 0, r3.stderr);
  const rec = lastLine(r3);
  assert.equal(rec.paths.target, 400000); assert.equal(rec.paths.done + rec.paths.nonfinite, 400000);
  const res = {kr: readRes(tmp3, 'kr', ID), us: readRes(tmp3, 'us', ID)};
  const N = res.kr.rows.length + res.us.rows.length;
  for (const place of ['kr', 'us']) {
    const x = res[place];
    assert.deepEqual([x.alloc.base, x.alloc.cap, x.alloc.extra, x.alloc.threshold], [100, 1000, 400000 - 100 * N, -0.5]);
    assert.equal(x.paths.target, 100 * x.rows.length + x.alloc.extraBoard);
    assert.equal(x.rows.reduce((s, y) => s + y.nExtra, 0), x.alloc.extraBoard);
    assert.equal(x.rows.reduce((s, y) => s + y.n + y.nonfinite, 0), x.paths.target);
    assert.ok(x.rows.every(y => y.nBase === 100 && Number.isInteger(y.nExtra) && y.nExtra >= 0 && y.nExtra <= 1000), '한 곳 추가 위 끝 1,000');
    assert.ok(x.rows.some(y => y.nExtra === 1000), '위 끝에 닿은 곳이 있음');
    assert.ok(new Set(x.rows.map(y => y.nExtra)).size > 2, '무게대로 — 고르게 나누지 않음');
  }
  assert.equal(res.kr.alloc.extraBoard + res.us.alloc.extraBoard, res.kr.alloc.extra, '두 판 추가 합 = total − base × 회사 수');
  assert.ok(Math.abs(res.kr.alloc.extraBoard / res.kr.rows.length - res.us.alloc.extraBoard / res.us.rows.length) < 1, '회사 수 비례');
});

T('재현(--codes) — 그 회사만 다시 세어 판 결과와 똑같고 파일을 쓰지 않음', () => {
  const pick = place => readRes(tmp3, place, ID).rows.reduce((a, b) => (b.nExtra > a.nExtra ? b : a));
  const want = {kr: pick('kr'), us: pick('us')};
  assert.ok(want.kr.nExtra > 0 && want.us.nExtra > 0);
  const empty = mkTmp();
  const files = ['kr', 'us'].map(p => path.join(tmp3, `public/data/atlas11/mc/${p}/${ID}.json`)).join(',');
  const r = run(['--codes', `kr:${want.kr.code},us:${want.us.code}`, '--alloc-from', files, '--out-root', empty]);
  assert.equal(r.status, 0, r.stderr);
  const out = lastLine(r);
  assert.deepEqual(out.repro, [want.kr, want.us]);
  assert.equal(out.runId, ID);
  assert.deepEqual(out.same, {[`kr:${want.kr.code}`]: true, [`us:${want.us.code}`]: true});
  assert.deepEqual(out.inputSame, {kr: true, us: true});
  assert.deepEqual(fs.readdirSync(empty), [], '재현은 파일을 쓰지 않음');
});

T('한 판만 돌려도 흐름 · 몫이 같고 추가가 없는 회사는 기본 결과 그대로(--places 와 상관없음 · 같은 날짜 줄 앞 번호)', () => {
  const tmp4 = mkTmp();
  const r = run(['--run-id', ID, '--slot', 'hand', '--total', '73010', '--base', '100', '--places', 'kr', '--out-root', tmp4]);
  assert.equal(r.status, 0, r.stderr);
  const rec = lastLine(r), x = readRes(tmp4, 'kr', ID), r0 = {kr: readRes(tmp, 'kr', ID), us: readRes(tmp, 'us', ID)};
  const nk = r0.kr.rows.length, nu = r0.us.rows.length, N = nk + nu, E = 73010 - 100 * N;
  const left = E - Math.floor(E * nk / N) - Math.floor(E * nu / N);
  const share = Math.floor(E * nk / N) + (left > 0 && (E * nk) % N >= (E * nu) % N ? 1 : 0); // 큰 나머지 · 같으면 한국 먼저
  assert.deepEqual(Object.keys(rec.boards), ['kr']);
  assert.equal(x.alloc.extraBoard, share, '몫은 두 판 회사 수로 나눔');
  assert.equal(rec.paths.target, 100 * nk + share);
  assert.equal(x.rows.reduce((s, y) => s + y.nExtra, 0), share);
  const before = new Map(r0.kr.rows.map(y => [y.code, y]));
  const kept = x.rows.filter(y => y.nExtra === 0 && before.get(y.code).nExtra === 0);
  assert.ok(kept.length >= nk - share - r0.kr.rows.filter(y => y.nExtra > 0).length);
  for (const y of kept) assert.deepEqual(y, before.get(y.code), y.code);
  assert.equal(fs.existsSync(path.join(tmp4, 'public/data/atlas11/mc/us')), false);
});

T('회차 ID 를 안 주면 runIdOf(서울 날짜 · slot · 두 입력 지문)로 만든다', () => {
  const tmp5 = mkTmp();
  const r = run(['--slot', 'hand', '--total', '73000', '--base', '100', '--places', 'us', '--out-root', tmp5]);
  assert.equal(r.status, 0, r.stderr);
  const date = new Date(Date.now() + 9 * 3600e3).toISOString().slice(0, 10);
  const id = `${date.replace(/-/g, '')}-hand-${crypto.createHash('sha256').update(sha(INPUT.kr) + sha(INPUT.us) + 'hand' + date).digest('hex').slice(0, 8)}`;
  const rec = lastLine(r);
  assert.equal(rec.runId, id); assert.equal(rec.date, date);
  assert.equal(readRes(tmp5, 'us', id).rng.seedHex, crypto.createHash('sha256').update(id).digest('hex').slice(0, 16));
});

T('있는 결과는 덮어쓰지 않는다(규칙 8)', () => {
  const f = path.join(tmp, `public/data/atlas11/mc/kr/${ID}.json`), before = fs.readFileSync(f, 'utf8');
  const r = run(['--run-id', ID, '--slot', 'hand', '--total', '73000', '--base', '100', '--out-root', tmp]);
  assert.notEqual(r.status, 0);
  assert.match(r.stderr, /덮어쓰지 않음/);
  assert.equal(fs.readFileSync(f, 'utf8'), before);
});
