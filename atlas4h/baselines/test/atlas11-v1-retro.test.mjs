// ATLAS 11 기준값(후향) 결과 파일 검사 — node --test atlas4h/baselines/test/
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import {execFileSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
import {planOrigins, QUANTILES} from '../atlas11-v1-retro.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..', '..');
const doc = JSON.parse(fs.readFileSync(path.join(ROOT, 'atlas4h/baselines/atlas11-v1-retro.json'), 'utf8'));
const KEYS = ['p05', 'p10', 'p25', 'p50', 'p75', 'p90', 'p95'];
const PATHS = 512;

// 결과가 쓴 입력(기록된 커밋의 public/data/input.json)을 바이트 그대로 읽는다 — 뒤에 입력이 늘어도 시험이 흔들리지 않게
const inputBytes = execFileSync('git', ['show', `${doc.input.commit}:${doc.input.path}`], {cwd: ROOT, maxBuffer: 512 << 20});
const input = JSON.parse(inputBytes);
const sessions = input.calendar.sessions;
const nextSession = d => sessions.find(s => s > d);

test('꼴: 스키마·후향 표시·키 이름', () => {
  assert.equal(doc.schema, 'atlas4h-atlas11-retro-1');
  assert.equal(doc.label, '후향');
  assert.deepEqual(Object.keys(doc), ['schema', 'label', 'status', 'reason', 'createdAt', 'method', 'input', 'reproduction', 'headVsOld', 'leak', 'rows']);
  assert.ok(['있음', '없음'].includes(doc.status));
  assert.match(doc.createdAt, /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\+09:00$/);
  assert.equal(doc.method.model, 'A');
  assert.equal(doc.method.paths, PATHS);
  assert.equal(doc.method.seed, 20260917);
  assert.deepEqual(QUANTILES.map(([k]) => k), KEYS);
});

test('입력 지문이 기록과 같다', () => {
  assert.equal(crypto.createHash('sha256').update(inputBytes).digest('hex'), doc.input.sha256);
});

test('없음이면 줄이 없고 까닭이 있다', {skip: doc.status !== '없음'}, () => {
  assert.equal(doc.rows.length, 0);
  assert.ok(typeof doc.reason === 'string' && doc.reason.length > 0);
});

test('1단계: 저장된 후향 칸과 한 자리도 같다', {skip: doc.status !== '있음'}, () => {
  const r = doc.reproduction;
  assert.equal(r.against, 'reports/atlas11/overhaul/part1-retro-A-cells.json');
  assert.equal(r.input, '30dcfb2');
  assert.equal(r.identical, true);
  assert.deepEqual(r.maxAbsDiff, {p50_1: 0, up1: 0, flat1: 0, down1: 0});
  assert.ok(r.origins >= 98, `견준 출발일 ${r.origins}`);
  assert.ok(r.overlapWithOutput >= 98);
  assert.equal(r.samePathsV1VsPublication.mismatchedHorizonCells, 0);
  assert.equal(doc.method.samePathsV1VsPublication.mismatchedHorizonCells, 0);
});

test('겹치는 출발일(2026-04-06 ~ 2026-08-27): 줄의 p50·방향 확률이 저장된 칸 p50_1·up1·flat1·down1 과 같다', {skip: doc.status !== '있음'}, () => {
  const stored = JSON.parse(fs.readFileSync(path.join(ROOT, doc.reproduction.against), 'utf8'));
  const col = Object.fromEntries(stored.columns.map((c, j) => [c, j]));
  const kOf = new Map(stored.origins.map((o, k) => [o.date, k])), iOf = new Map(stored.codes.map((c, i) => [c, i]));
  const cell = new Map(stored.cells.map(c => [`${c[col.k]}|${c[col.i]}`, c]));
  let n = 0;
  for (const r of doc.rows) {
    if (!kOf.has(r.origin)) continue;
    const c = cell.get(`${kOf.get(r.origin)}|${iOf.get(r.code)}`);
    assert.ok(c, `${r.origin} ${r.code}`);
    assert.equal(r.p50, c[col.p50_1]);
    assert.equal(r.up * PATHS, c[col.up1]);
    assert.equal(r.flat * PATHS, c[col.flat1]);
    assert.equal(r.down * PATHS, c[col.down1]);
    assert.equal(r.anchor, c[col.anchor]);
    assert.equal(r.target, stored.origins[kOf.get(r.origin)].target1);
    n++;
  }
  assert.equal(n, doc.reproduction.overlapWithOutput * 52);
});

test('줄 수: 출발일 120개 × 52종목, 2026-04-06 ~ 2026-09-30, 목표 2026-04-07 ~ 2026-10-01', {skip: doc.status !== '있음'}, () => {
  assert.equal(doc.rows.length, 120 * 52);
  const origins = [...new Set(doc.rows.map(r => r.origin))].sort();
  assert.equal(origins.length, 120);
  assert.equal(origins[0], '2026-04-06');
  assert.equal(origins.at(-1), '2026-09-30');
  const targets = [...new Set(doc.rows.map(r => r.target))].sort();
  assert.equal(targets[0], '2026-04-07');
  assert.equal(targets.at(-1), '2026-10-01');
  const codes = input.assets.map(a => a.code).sort();
  for (const o of origins) assert.deepEqual(doc.rows.filter(r => r.origin === o).map(r => r.code).sort(), codes, o);
  const seen = new Set();
  for (const r of doc.rows) { const k = r.origin + '|' + r.code; assert.ok(!seen.has(k), '겹친 칸 ' + k); seen.add(k); }
});

test('줄 꼴: 키 이름 그대로', {skip: doc.status !== '있음'}, () => {
  for (const r of doc.rows) assert.deepEqual(Object.keys(r), ['origin', 'target', 'code', 'anchor', ...KEYS, 'up', 'flat', 'down', 'block']);
});

test('분위수는 오름차순이고 모두 양수', {skip: doc.status !== '있음'}, () => {
  for (const r of doc.rows) {
    for (const k of KEYS) assert.ok(Number.isFinite(r[k]) && r[k] > 0, `${r.origin} ${r.code} ${k}`);
    for (let j = 1; j < KEYS.length; j++) assert.ok(r[KEYS[j - 1]] <= r[KEYS[j]], `${r.origin} ${r.code} ${KEYS[j - 1]} > ${KEYS[j]}`);
  }
});

test('방향 확률: 상승+보합+하락 = 1, 각각 512 경로 중 횟수', {skip: doc.status !== '있음'}, () => {
  for (const r of doc.rows) {
    for (const k of ['up', 'flat', 'down']) { assert.ok(r[k] >= 0 && r[k] <= 1); assert.ok(Number.isInteger(r[k] * PATHS), `${r.origin} ${r.code} ${k}`); }
    assert.ok(Math.abs(r.up + r.flat + r.down - 1) < 1e-12, `${r.origin} ${r.code}`);
  }
});

test('거래소 달력: 10/5·10/9 휴장, 목표일 = 출발일 다음 거래일', {skip: doc.status !== '있음'}, () => {
  assert.ok(!sessions.includes('2026-10-05'));
  assert.ok(!sessions.includes('2026-10-09'));
  assert.equal(nextSession('2026-10-02'), '2026-10-06');
  assert.equal(nextSession('2026-10-08'), '2026-10-12');
  assert.equal(nextSession('2026-09-23'), '2026-09-28');
  for (const r of doc.rows) {
    assert.ok(sessions.includes(r.origin), '출발일이 거래일 아님 ' + r.origin);
    assert.equal(r.target, nextSession(r.origin), `${r.origin} → ${r.target}`);
    assert.ok(r.origin < r.target);
  }
});

test('출발값 = 입력의 출발일 종가', {skip: doc.status !== '있음'}, () => {
  const close = new Map(input.assets.map(a => [a.code, new Map(a.prices.map(p => [p.date, p.quality === 'conflict' ? null : p.close]))]));
  for (const r of doc.rows) assert.equal(r.anchor, close.get(r.code).get(r.origin), `${r.origin} ${r.code}`);
});

test('블록: 2026-04-06 은 블록 2, 2026-09-29·30 은 블록 8, 한 블록은 출발일 20개 이하', {skip: doc.status !== '있음'}, () => {
  const blockOf = new Map(doc.rows.map(r => [r.origin, r.block]));
  assert.equal(blockOf.get('2026-04-06'), 2);
  assert.equal(blockOf.get('2026-09-29'), 8);
  assert.equal(blockOf.get('2026-09-30'), 8);
  const per = {};
  for (const [, b] of blockOf) per[b] = (per[b] ?? 0) + 1;
  for (const n of Object.values(per)) assert.ok(n <= 20);
});

test('누수: 출발일마다 학습 끝·자료 끝 ≤ 출발일', {skip: doc.status !== '있음'}, () => {
  assert.equal(doc.leak.length, 120);
  const origins = new Set(doc.rows.map(r => r.origin));
  for (const l of doc.leak) {
    assert.ok(origins.has(l.origin));
    assert.equal(l.noFuture, true, l.origin);
    assert.ok(l.maxTrainingEnd <= l.origin, l.origin);
    assert.ok(l.maxDataDate <= l.origin, l.origin);
  }
});

test('planOrigins: 블록 번호와 달력 이름표(자료판 끝 너머)', () => {
  const panel = {dates: ['2026-01-02', '2026-01-05', '2026-01-06', '2026-01-07']};
  const cal = ['2026-01-02', '2026-01-05', '2026-01-06', '2026-01-07', '2026-01-08', '2026-01-12'];
  const plan = planOrigins(panel, cal, {first: '2026-01-05', last: '2026-01-07', blockDays: 2, horizon: 2});
  assert.deepEqual(plan.map(o => [o.date, o.block, o.blockStart, o.targets.join(',')]), [
    ['2026-01-05', 1, true, '2026-01-06,2026-01-07'],
    ['2026-01-06', 1, false, '2026-01-07,2026-01-08'],
    ['2026-01-07', 2, true, '2026-01-08,2026-01-12'],
  ]);
});
