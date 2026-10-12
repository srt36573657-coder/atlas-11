// 장부 문 시험(2026-10-13 「뭘걸거야?」) — 틀림 장부는 새 파일만: 더하기만 통과 · 고치기 · 지우기 · 옮기기는 막힘
import {test} from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {execFileSync, spawnSync} from 'node:child_process';

const GATE = path.resolve('scripts/atlas11/trust_gate.mjs');
function repo() {
  const d = fs.mkdtempSync(path.join(os.tmpdir(), 'trust-gate-'));
  const g = (...a) => execFileSync('git', a, {cwd: d, encoding: 'utf8'});
  g('init', '-q'); g('config', 'user.email', 't@t'); g('config', 'user.name', 't');
  fs.mkdirSync(path.join(d, 'reports/atlas11/trust'), {recursive: true});
  fs.writeFileSync(path.join(d, 'reports/atlas11/trust/misses-a.json'), '{"items":[{"n":1}]}');
  g('add', '-A'); g('commit', '-qm', 'a'); g('update-ref', 'refs/remotes/origin/main', 'HEAD');
  return {d, g, run: () => spawnSync('node', [GATE], {cwd: d, encoding: 'utf8'})};
}
test('새 장부 파일 더하기는 통과', () => {
  const {d, g, run} = repo();
  fs.writeFileSync(path.join(d, 'reports/atlas11/trust/misses-b.json'), '{"items":[{"n":2}]}'); g('add', '-A'); g('commit', '-qm', 'b');
  const r = run(); assert.equal(r.status, 0, r.stderr); assert.match(r.stdout, /새 장부 파일 1개/);
});
test('장부 고치기(건수 줄이기)는 막힘', () => {
  const {d, g, run} = repo();
  fs.writeFileSync(path.join(d, 'reports/atlas11/trust/misses-a.json'), '{"items":[]}'); g('add', '-A'); g('commit', '-qm', 'm');
  const r = run(); assert.equal(r.status, 1); assert.match(r.stderr, /장부 문 막힘/);
});
test('장부 지우기 · 옮기기는 막힘', () => {
  const a = repo(); a.g('rm', '-q', 'reports/atlas11/trust/misses-a.json'); a.g('commit', '-qm', 'd');
  assert.equal(a.run().status, 1);
  const b = repo(); b.g('mv', 'reports/atlas11/trust/misses-a.json', 'reports/atlas11/trust/misses-z.json'); b.g('commit', '-qm', 'r');
  assert.equal(b.run().status, 1);
});
test('장부 밖 파일 고치기는 상관없음', () => {
  const {d, g, run} = repo();
  fs.writeFileSync(path.join(d, 'other.txt'), 'x'); g('add', '-A'); g('commit', '-qm', 'o');
  assert.equal(run().status, 0);
});
test('올린 장부는 건수가 맞고 증거가 있음', () => {
  const dir = 'reports/atlas11/trust';
  let n = 0;
  for (const f of fs.readdirSync(dir).filter(f => f.endsWith('.json'))) {
    const j = JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8'));
    assert.equal(j.count, j.items.length, f);
    for (const it of j.items) { assert.ok(it.what && it.when && it.evidence?.length, `${f} ${it.n}`); }
    n += j.items.length;
  }
  assert.ok(n >= 11);
});
