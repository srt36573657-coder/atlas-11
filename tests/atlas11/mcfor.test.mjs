// 판 읽기에 몬테카를로 결과를 붙이는 조건(scripts/atlas11/lens/build.mjs mcFor) — 같은 기준일 · 같은 입력 지문일 때만 · 아니면 까닭과 함께 「없음」
//   사장님 2026-10-10 05:14(마카오) 승인 · 계획 docs/superpowers/plans/2026-10-10-atlas-phase1-engine.md Task 3
import test from 'node:test';
import assert from 'node:assert/strict';
import {mcFor} from '../../scripts/atlas11/lens/build.mjs';

const latest = {schema: 'atlas11-mc-latest-1', runId: '20261010-hand-1a2b3c4d', file: 'public/data/atlas11/mc/kr/20261010-hand-1a2b3c4d.json', asOf: '2026-10-08', inputSha256: 'abc', made: 'x'};
const result = {schema: 'atlas11-mc-2', runId: latest.runId, asOf: '2026-10-08', made: 'x', model: {id: 'fhs-crn-2', drift: 0}, alloc: {base: 20000, extra: 5400000, extraBoard: 2700000, cap: 200000, threshold: -0.5, floor: {stocks: 3, paths: 9000, target: 0.0045}},
  paths: {target: 10000000, done: 10000000, nonfinite: 0}, input: {file: 'public/data/input.json', sha256: 'abc', days: 500, from: 'a', to: '2026-10-08'},
  rows: [{code: 'A', n: 27000, nBase: 20000, nExtra: 7000, nonfinite: 0, extreme: 1, clamped: 9, mean: 0.1, median: -0.01, ploss: 0.52, q05: -0.4, q10: -0.3, q90: 0.5, cvar5: -0.5, se: {mean: 0.002, ploss: 0.003, q05: 0.002, cvar5: 0.003}, volNow: 0.6, vol2y: 0.5}]};

test('같은 기준일 · 같은 입력 지문이면 붙이고, 화면이 쓰는 칸만 싣는다', () => {
  const m = mcFor({latest, result, asOf: '2026-10-08', inputSha: 'abc'});
  assert.equal(m.none, undefined); assert.equal(m.runId, latest.runId); assert.equal(m.rows.length, 1);
  assert.equal(m.rows[0].clamped, undefined, '싣지 않는 칸'); assert.equal(m.rows[0].vol2y, undefined);
  assert.equal(m.rows[0].cvar5, -0.5); assert.deepEqual(m.alloc.floor, {stocks: 3, paths: 9000, target: 0.0045});
});
test('기준일이 다르거나 · 입력 지문이 다르거나 · 결과가 가리키는 것과 다르면 「없음」과 까닭', () => {
  assert.match(mcFor({latest, result, asOf: '2026-10-09', inputSha: 'abc'}).why, /기준일/);
  assert.match(mcFor({latest, result, asOf: '2026-10-08', inputSha: 'zzz'}).why, /입력 지문/);
  assert.match(mcFor({latest, result: {...result, runId: 'other'}, asOf: '2026-10-08', inputSha: 'abc'}).why, /결과 파일/);
  assert.match(mcFor({latest: null, result, asOf: '2026-10-08', inputSha: 'abc'}).why, /결과 없음/);
  assert.match(mcFor({latest: {...latest, schema: 'x'}, result, asOf: '2026-10-08', inputSha: 'abc'}).why, /모양/);
  for (const x of [mcFor({latest, result, asOf: '2026-10-09', inputSha: 'abc'})]) assert.equal(x.none, true);
});
test('범위 띠 — 엔진이 따라간 회사(track.codes)만 싣고, 띠가 없는 회차는 null', () => {
  const band = {n: 27000, q: [[0, 0, 0, 0, 0], [-0.4, -0.2, -0.01, 0.2, 0.5]], rep: [{f: 0.1, idx: 3, end: -0.4, path: [0, -0.4]}]};
  const withB = {...result, track: {codes: ['A'], missing: ['Z'], days: [0, 60], q: [0.1, 0.25, 0.5, 0.75, 0.9], rep: [0.1, 0.5, 0.9], from: 'lens.cand.items', note: 'x'}, bands: {A: band, B: band}};
  const m = mcFor({latest, result: withB, asOf: '2026-10-08', inputSha: 'abc'});
  assert.deepEqual(m.track, {codes: ['A'], missing: ['Z'], days: [0, 60], q: [0.1, 0.25, 0.5, 0.75, 0.9], rep: [0.1, 0.5, 0.9], from: 'lens.cand.items'});
  assert.deepEqual(Object.keys(m.bands), ['A'], 'track.codes 밖(B)은 싣지 않음'); assert.deepEqual(m.bands.A, band);
  const old = mcFor({latest, result, asOf: '2026-10-08', inputSha: 'abc'});
  assert.equal(old.track, null); assert.equal(old.bands, null);
});
test('사이트 판 읽기(siteLens) — 후보는 몬테카를로 · 소거 행 전부 · 나머지는 줄이고, 들어온 판 읽기는 바꾸지 않음', async () => {
  const {siteLens} = await import('../../scripts/atlas11/lens/build.mjs');
  const full = {code: 'B', n: 1, nBase: 1, nExtra: 0, nonfinite: 0, extreme: 0, mean: 0.1, median: 0, ploss: 0.5, q05: -0.4, q10: -0.3, q90: 0.5, cvar5: -0.5, se: {mean: 0.1}, volNow: 0.5};
  const l = {cand: {ready: true, items: [{code: 'A'}]}, mc: {runId: 'r', rows: [{...full, code: 'A'}, full]}, elim: {counts: {pass: 1}, rows: [{code: 'A', state: 'pass', first: null, checks: [{id: 'close'}]}, {code: 'B', state: 'hold', first: 'risk', flags: [], checks: [{id: 'close'}]}]}};
  const before = JSON.stringify(l), s = siteLens(l);
  assert.equal(JSON.stringify(l), before, '들어온 판 읽기는 그대로');
  assert.deepEqual(s.mc.rows[0], {...full, code: 'A'}); assert.deepEqual(Object.keys(s.mc.rows[1]), ['code', 'n', 'median', 'ploss', 'q05', 'q10', 'q90', 'cvar5']);
  assert.deepEqual(s.elim.rows[1], {code: 'B', state: 'hold', first: 'risk'}); assert.equal(s.elim.rows[0].checks.length, 1); assert.deepEqual(s.elim.counts, {pass: 1});
  assert.deepEqual(siteLens({none: true}), {none: true});
});
