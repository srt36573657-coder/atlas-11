/**
 * 3단계 「4시간 고리」 시험 — 가짜 저장소(fixture.mjs · 값은 [예시])로만 돈다. 진짜 atlas4h/ledger 는 건드리지 않는다.
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {execFileSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
import {runTurn, slotOf, planAt} from '../run.mjs';
import {runWatch, WATCH_BY, CANNOT} from '../watch.mjs';
import {CHECKS, STATUS_KEEP, STATUS_RESEAL, STATUS_SEALED, isBuilder} from '../../spec/checks.mjs';
import {buildInputs, buildBoard, engine} from '../../engine/board.mjs';
import {makeRepo, makeInput, snapshot, lastClose, readLines, GIT, CODES, sessionsBetween} from './fixture.mjs';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const REPO = path.resolve(HERE, '..', '..', '..');
const SESSIONS = sessionsBetween('2024-01-02', '2026-10-30');
const turn = (root, now, extra = {}) => runTurn({root, now, git: GIT, ...extra});
const closesOf = (input, date) => Object.fromEntries(CODES.map(c => [c, {date, value: lastClose(input, c, date)}]));

test('판 시각 고르기: auto = 지금보다 늦지 않은 가장 늦은 판 시각 · 숫자는 그 시각의 가장 늦은 때', () => {
  assert.deepEqual(slotOf(Date.parse('2026-10-02T13:59:00+09:00')), {slot: '12', slotDate: '2026-10-02', slotAt: '2026-10-02T12:00:00+09:00'});
  assert.equal(slotOf(Date.parse('2026-10-02T03:00:00+09:00')).slot, '00');
  assert.equal(slotOf(Date.parse('2026-10-02T23:59:00+09:00')).slot, '20');
  assert.deepEqual(slotOf(Date.parse('2026-10-02T10:00:00+09:00'), '20'), {slot: '20', slotDate: '2026-10-01', slotAt: '2026-10-01T20:00:00+09:00'});
  assert.throws(() => slotOf(Date.now(), '07'));
});

test('출발일·목표일 = 봉인 뒤 첫 종가 (12시는 그날 종가 · 휴장·주말은 다음 거래일)', () => {
  assert.deepEqual(planAt(SESSIONS, '2026-10-02T08:00:00+09:00'), {anchorDate: '2026-10-01', target: '2026-10-02'});
  assert.deepEqual(planAt(SESSIONS, '2026-10-02T12:00:00+09:00'), {anchorDate: '2026-10-01', target: '2026-10-02'});
  assert.deepEqual(planAt(SESSIONS, '2026-10-02T16:00:00+09:00'), {anchorDate: '2026-10-02', target: '2026-10-06'});
  assert.deepEqual(planAt(SESSIONS, '2026-10-03T16:00:00+09:00'), {anchorDate: '2026-10-02', target: '2026-10-06'});
});

test('늦으면 시간 초과 → 앞 판 유지 (새 계산 없음 · 고리 한 줄은 남김 · T9 통과)', () => {
  const {root, input} = makeRepo();
  snapshot(root, '2026-10-02T00:03:00+09:00', closesOf(input, '2026-10-01'));
  const a = turn(root, '2026-10-02T00:05:00+09:00');
  assert.equal(a.board.status, STATUS_SEALED);
  const b = turn(root, '2026-10-02T04:45:00+09:00');
  assert.equal(b.loop.status, '시간 초과');
  assert.equal(b.loop.lateMinutes, 45);
  assert.equal(b.board.status, STATUS_KEEP);
  assert.equal(b.board.keepOf, a.board.id);
  assert.deepEqual(b.board.stocks, a.board.stocks);
  assert.equal(b.baselines, null);
  assert.equal(readLines(root, 'loops').length, 2);
  // 40분 넘게 걸린 고리(시작 04:00 끝 04:45) — 판이 「앞 판 유지」라 T9 통과
  const loops = readLines(root, 'loops').map(l => ({...l, startedAt: l.slotAt}));
  assert.equal(CHECKS.T9({loops, boards: readLines(root, 'boards')}).pass, true);
  // 앞 판이 없으면 남길 판도 없다
  const {root: r2} = makeRepo();
  const c = turn(r2, '2026-10-02T08:50:00+09:00');
  assert.equal(c.loop.status, '시간 초과');
  assert.equal(c.board, null);
});

test('변수 그대로 → 계산 없이 앞 판 다시 봉인 (가벼운·무거운 모두) · 다시 돌려도 같은 값(T4)', () => {
  const {root, input} = makeRepo();
  snapshot(root, '2026-10-02T00:03:00+09:00', closesOf(input, '2026-10-01'));
  const a = turn(root, '2026-10-02T00:05:00+09:00');
  snapshot(root, '2026-10-02T04:02:00+09:00', closesOf(input, '2026-10-01'));
  const b = turn(root, '2026-10-02T04:05:00+09:00');
  snapshot(root, '2026-10-02T08:02:00+09:00', closesOf(input, '2026-10-01'));
  const c = turn(root, '2026-10-02T08:05:00+09:00');
  assert.equal(b.board.status, STATUS_RESEAL);
  assert.equal(c.board.status, STATUS_RESEAL);
  assert.equal(c.loop.kind, '무거운');
  assert.equal(b.board.resealOf, a.board.id);
  assert.deepEqual(b.board.stocks, a.board.stocks);
  assert.match(b.loop.steps['가운데·폭 엔진'], /계산 없음/);
  const state = {boards: readLines(root, 'boards'), seals: readLines(root, 'seals'), errors: []};
  assert.equal(CHECKS.T1(state).pass, true);
  assert.equal(CHECKS.T4(state, {engine}).pass, true);
  assert.equal(CHECKS.T21(state).pass, true);
  // 값 하나가 바뀌면(장의 종가가 input.json 과 다름 → 그 종목 「확인 중」 → 「없음」) 새로 셈한다
  const changed = closesOf(input, '2026-10-01');
  changed[CODES[0]] = {...changed[CODES[0]], value: changed[CODES[0]].value + 100};
  snapshot(root, '2026-10-02T12:02:00+09:00', changed);
  const d = turn(root, '2026-10-02T12:05:00+09:00');
  assert.equal(d.board.status, STATUS_SEALED);
  assert.equal(d.board.stocks.find(s => s.code === CODES[0]).center, null);
  assert.ok(d.loop.notes.some(n => n.includes('확인 중')));
});

test('16시 판 = 재현 방법의 판 (input.json 은 t−1 까지 · t 종가는 장에서) · 확인 중 종목은 「없음」', () => {
  const t = '2026-10-02';
  const full = makeInput(t);
  const {root} = makeRepo({lastDate: '2026-10-01'});
  const closes = closesOf(full, t);
  snapshot(root, `${t}T16:02:00+09:00`, closes);
  const live = turn(root, `${t}T16:05:00+09:00`);
  // 재현(retro/run.mjs)과 같은 셈: buildInputs(전체 자료, 출발일 t) → buildBoard
  const fullIn = {...full, assets: full.assets.map(a => ({...a, prices: a.prices.map(p => (p.date === t ? {...p, observedAt: `${t}T06:30:00Z`} : p))}))};
  const at = `${t}T16:00:00+09:00`;
  const inputs = buildInputs(fullIn, {asof: t, at, histories: {}});
  const retro = buildBoard({inputs, seed: 1, slot: '16', kind: '무거운', createdAt: at, sealedAt: at, target: '2026-10-06', commit: GIT.commit, dirty: false, files: ['x'], retro: true, slotDate: t});
  assert.equal(live.board.target.date, '2026-10-06');
  assert.deepEqual(live.board.stocks, retro.stocks);
  assert.deepEqual(live.board.inputs.constants.values, retro.inputs.constants.values);
  assert.ok(live.board.stocks.every(s => s.center !== null));
  // 한 종목이 「확인 중」이면 그 종목만 「없음」(짐작하지 않음)
  const {root: r2} = makeRepo({lastDate: '2026-10-01'});
  snapshot(r2, `${t}T16:02:00+09:00`, {...closes, [CODES[1]]: {...closes[CODES[1]], status: '확인 중'}});
  const live2 = turn(r2, `${t}T16:05:00+09:00`);
  const s1 = live2.board.stocks.find(s => s.code === CODES[1]);
  assert.equal(s1.center, null);
  assert.deepEqual(s1.status, ['없음']);
  assert.deepEqual(live2.board.stocks.find(s => s.code === CODES[0]), retro.stocks.find(s => s.code === CODES[0]));
});

function forecastDoc(issuedAt, actualAsOf, target, prev = null) {
  const rows = d => CODES.map(code => ({code, rows: [{date: actualAsOf, p10: 1, p50: 1, p90: 1, anchor: true}, {date: target, p10: 900, p50: 1000, p90: 1100}]}));
  return {
    forecastId: `fc-${issuedAt}`, issuedAt, actualAsOf,
    assets: rows().map(a => ({code: a.code, rows: a.rows, previous: prev ? {forecastId: `fc-${prev.issuedAt}`, issuedAt: prev.issuedAt, actualAsOf: prev.actualAsOf, rows: [{date: prev.target, p10: 800, p50: 850, p90: 950}]} : null})),
  };
}

test('기준값 봉인: ATLAS 11 은 봉인 전에 나온 발행본만 (뒤에 나온 것은 안 씀 · 없으면 「없음」) · 전이식은 08시만', () => {
  // 지금 발행본(10/02 18:53 KST)은 08시 봉인 뒤 → 그 안의 직전 발행본(10/01 18:50 KST · 목표 10/02)을 쓴다
  const fc = forecastDoc('2026-10-02T09:53:00Z', '2026-10-02', '2026-10-06', {issuedAt: '2026-10-01T09:50:00Z', actualAsOf: '2026-10-01', target: '2026-10-02'});
  const {root, input} = makeRepo({forecast: fc});
  snapshot(root, '2026-10-02T08:02:00+09:00', closesOf(input, '2026-10-01'));
  const r = turn(root, '2026-10-02T08:05:00+09:00');
  const u = r.baselines.units[CODES[0]];
  assert.equal(u['ATLAS 11'].issuedAt, '2026-10-01T09:50:00Z');
  assert.equal(u['ATLAS 11'].p90, 950);
  assert.ok(Array.isArray(u.무판.q19) && u.무판.q19.length === 19);
  assert.equal(u['단순 전이식'].none, true); // 반도체지수 지난 자료가 없는 저장소 → 「없음」 + 까닭
  assert.match(u['단순 전이식'].why, /sox|반도체지수/);
  // 봉인 전 발행본이 없으면 「없음」
  const fc2 = forecastDoc('2026-10-02T09:53:00Z', '2026-10-01', '2026-10-02');
  const {root: r2, input: in2} = makeRepo({forecast: fc2});
  snapshot(r2, '2026-10-02T08:02:00+09:00', closesOf(in2, '2026-10-01'));
  const r2b = turn(r2, '2026-10-02T08:05:00+09:00');
  assert.equal(r2b.baselines.units[CODES[0]]['ATLAS 11'].none, true);
  // 16시·20시 판의 전이식은 「없음」(judgment)
  snapshot(r2, '2026-10-02T20:02:00+09:00', closesOf(makeInput('2026-10-02'), '2026-10-02'));
  const r3 = turn(r2, '2026-10-02T20:05:00+09:00');
  assert.match(r3.baselines.units[CODES[0]]['단순 전이식'].why, /미국 장이 아직 없음/);
});

test('채점: 목표 종가가 15:30 뒤 장에 쓸 수 있는 상태로 나올 때만 · 한 번만', () => {
  const t = '2026-10-02';
  const full = makeInput(t);
  const {root} = makeRepo({lastDate: '2026-10-01'});
  snapshot(root, `${t}T08:02:00+09:00`, closesOf(full, '2026-10-01'));
  const a = turn(root, `${t}T08:05:00+09:00`);
  assert.equal(a.board.target.date, t);
  // 12시: 종가 전 → 채점 없음
  snapshot(root, `${t}T12:02:00+09:00`, closesOf(full, '2026-10-01'));
  assert.equal(turn(root, `${t}T12:05:00+09:00`).scores.length, 0);
  // 16시: 종목 0 은 「한 출처」, 종목 1 은 「확인 중」 → 0·2 만 채점
  const c16 = closesOf(full, t);
  c16[CODES[1]] = {...c16[CODES[1]], status: '확인 중'};
  snapshot(root, `${t}T16:02:00+09:00`, c16);
  const b = turn(root, `${t}T16:05:00+09:00`);
  const scored = new Set(b.scores.map(s => s.code));
  assert.ok(scored.has(CODES[0]) && scored.has(CODES[2]) && !scored.has(CODES[1]));
  const s0 = b.scores.find(s => s.code === CODES[0] && s.boardId === a.board.id);
  assert.equal(s0.actual.value, lastClose(full, CODES[0], t));
  assert.equal(s0.actual.asOf, `${t}T15:30:00+09:00`);
  assert.deepEqual(s0.baselines.map(x => x.id), ['무판', '단순 전이식', 'ATLAS 11']);
  assert.ok(Number.isFinite(s0.baselines[0].interval));
  assert.equal(s0.crisis, null); // 코스피 지난 자료 없음 → 위기 날을 못 셈
  // 20시: 종목 1 도 쓸 수 있게 됨 → 종목 1 만 새로 채점 (0·2 는 다시 안 함)
  snapshot(root, `${t}T20:02:00+09:00`, closesOf(full, t));
  const c = turn(root, `${t}T20:05:00+09:00`);
  const all = readLines(root, 'scores');
  const keys = all.map(s => `${s.boardId}|${s.code}`);
  assert.equal(new Set(keys).size, keys.length);
  assert.ok(c.scores.every(s => s.code === CODES[1]));
  assert.ok(c.scores.length >= 1);
});

test('멈춤 단추 → 그림자 운전 (stop.json · workflow 입력) · 화면 파일은 안 건드림', () => {
  const {root, input} = makeRepo();
  snapshot(root, '2026-10-02T00:03:00+09:00', closesOf(input, '2026-10-01'));
  fs.mkdirSync(path.join(root, 'atlas4h/harness'), {recursive: true});
  fs.writeFileSync(path.join(root, 'atlas4h/harness/stop.json'), JSON.stringify({stop: true, since: '2026-10-02T00:00:00+09:00', by: '사장님'}));
  const a = turn(root, '2026-10-02T00:05:00+09:00');
  assert.equal(a.loop.stop, true);
  assert.equal(a.loop.mode, '그림자');
  assert.equal(a.loop.stopBy, '사장님');
  const {root: r2, input: i2} = makeRepo();
  snapshot(r2, '2026-10-02T00:03:00+09:00', closesOf(i2, '2026-10-01'));
  const b = turn(r2, '2026-10-02T00:05:00+09:00', {stop: 'true'});
  assert.equal(b.loop.stop, true);
  assert.equal(b.loop.mode, '그림자');
  const c = turn(r2, '2026-10-02T04:05:00+09:00');
  assert.equal(c.loop.stop, false);
  assert.equal(c.loop.mode, '그림자'); // 6단계 전에는 늘 그림자
  assert.ok(!fs.existsSync(path.join(r2, 'public/data/atlas4h')));
  assert.ok(!fs.existsSync(path.join(r2, 'site')));
});

test('감시 한 줄: by = 감시 스크립트(짓는 일꾼 아님) · 판단 줄은 「잴 수 없음」(0 으로 꾸미지 않음)', () => {
  const {root, input} = makeRepo();
  snapshot(root, '2026-10-02T00:03:00+09:00', closesOf(input, '2026-10-01'));
  turn(root, '2026-10-02T00:05:00+09:00');
  const rows = runWatch({root, now: '2026-10-02T00:06:00+09:00'});
  assert.equal(rows.length, 1);
  const w = rows[0];
  assert.equal(w.by, WATCH_BY);
  assert.equal(isBuilder(w.by), false);
  for (const k of ['S1', 'S2', 'S4', 'S7']) assert.equal(w.S[k], 0, k);
  for (const k of ['S3', 'S5', 'S6', 'S8']) assert.equal(w.S[k], CANNOT, k);
  assert.equal(w.checks.sealMatches, true);
  assert.equal(w.checks.forbiddenWords, 0);
  assert.equal(runWatch({root, now: '2026-10-02T00:07:00+09:00'}).length, 0); // 같은 고리는 한 번만
  const t23 = CHECKS.T23({loops: readLines(root, 'loops'), watch: readLines(root, 'watch')});
  assert.equal(t23.pass, false); // 판단 줄이 숫자 0 이 아니라서 — 다른 에이전트 감시가 채워야 통과
  assert.match(t23.reason, /S3=잴 수 없음/);
});

test('워크플로: 예약 없음 · atlas4h 줄 공유 · 장부·원문만 올림 · 커밋 글에 무엇:/왜:', () => {
  const yml = fs.readFileSync(path.join(REPO, '.github/workflows/atlas4h-loop.yml'), 'utf8');
  assert.ok(!/^\s*schedule\s*:/m.test(yml), 'schedule 줄이 없어야 함(사장님이 직접 넣음)');
  assert.match(yml, /workflow_dispatch:/);
  assert.match(yml, /concurrency:\s*\n\s*group: atlas4h\s*\n\s*cancel-in-progress: false/);
  assert.match(yml, /permissions:\s*\n\s*contents: write/);
  assert.match(yml, /for p in atlas4h\/ledger atlas4h\/raw; do/);
  const adds = [...yml.matchAll(/git add[^\n]*/g)].map(m => m[0]);
  assert.deepEqual(adds, ['git add -- "$p"; fi']);
  for (const bad of ['site/', 'public/', 'reports/', 'dispatches', 'deploy', 'atlas11-site']) assert.ok(!yml.includes(bad), bad);
  assert.match(yml, /node atlas4h\/collect\/collect\.mjs --mode now/);
  assert.match(yml, /node atlas4h\/loop\/run\.mjs --slot "\$SLOT"/);
  assert.match(yml, /node atlas4h\/loop\/watch\.mjs/);
  // 커밋 글 덩어리를 bash 로 그대로 돌려 본다
  const block = yml.match(/(DONE=\$\([\s\S]*?\} > "\$RUNNER_TEMP\/atlas4h-commit-msg\.txt")/)[1].split('\n').map(l => l.replace(/^ {10}/, '')).join('\n');
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'atlas4h-wf-'));
  fs.writeFileSync(path.join(tmp, 'atlas4h-loop.txt'), 'loop-20261002-16 · 무거운 · 그림자 · ok\n');
  execFileSync('bash', ['-c', block], {env: {...process.env, SLOT: 'auto', GITHUB_RUN_ID: '123', RUNNER_TEMP: tmp}});
  const msg = fs.readFileSync(path.join(tmp, 'atlas4h-commit-msg.txt'), 'utf8').split('\n');
  assert.match(msg[0], /^atlas4h 고리 16시: \d{4}-\d{2}-\d{2} \d{2}:\d{2} KST \[skip ci\]$/);
  assert.equal(msg[1], '');
  assert.ok(msg.some(l => l.startsWith('무엇: ')));
  assert.ok(msg.some(l => l.startsWith('왜: ') && l.includes('123')));
  assert.ok(msg.includes('Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>'));
  assert.ok(msg.includes('Claude-Session: https://claude.ai/code/session_0136T4eo8jpTLMmK9LpiQk4A'));
  // 판 시각을 못 읽으면 입력값 그대로
  fs.writeFileSync(path.join(tmp, 'atlas4h-loop.txt'), '');
  execFileSync('bash', ['-c', block], {env: {...process.env, SLOT: '08', GITHUB_RUN_ID: '1', RUNNER_TEMP: tmp}});
  assert.match(fs.readFileSync(path.join(tmp, 'atlas4h-commit-msg.txt'), 'utf8'), /^atlas4h 고리 08시: /);
});
