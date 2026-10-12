// 얼굴 문 시험(2026-10-13 03:38 「모든 흔적 다 지워」) — 지운 옛 그림 번호가 다시 들어오면 막고 · 지금 저장소는 통과
import {test} from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {execFileSync, spawnSync} from 'node:child_process';
const GATE = path.resolve('scripts/atlas11/face_gate.mjs');
test('지금 저장소에는 지운 옛 그림이 없음', () => { const r = spawnSync('node', [GATE], {encoding: 'utf8'}); assert.equal(r.status, 0, r.stderr); assert.match(r.stdout, /지운 옛 그림 0개/); });
test('목록에 있는 그림이 다시 들어오면 막힘', () => {
  const d = fs.mkdtempSync(path.join(os.tmpdir(), 'face-gate-')); const g = (...a) => execFileSync('git', a, {cwd: d, encoding: 'utf8'}).trim();
  g('init', '-q'); g('config', 'user.email', 't@t'); g('config', 'user.name', 't');
  fs.writeFileSync(path.join(d, 'a.jpg'), 'pretend-old-picture'); g('add', '-A'); g('commit', '-qm', 'a');
  const id = g('rev-parse', 'HEAD:a.jpg'); fs.writeFileSync(path.join(d, 'list.txt'), id + '\n');
  const r = spawnSync('node', [GATE], {cwd: d, encoding: 'utf8', env: {...process.env, FACE_LIST: path.join(d, 'list.txt')}});
  assert.equal(r.status, 1); assert.match(r.stderr, /얼굴 문 막힘/);
});
test('목록을 못 읽으면 막힘(조용히 통과하지 않음)', () => {
  const r = spawnSync('node', [GATE], {encoding: 'utf8', env: {...process.env, FACE_LIST: '/nonexistent/list.txt'}}); assert.equal(r.status, 1);
});
test('사이트 코드에 옛 그림 이름 · 공주님 글이 없음', () => {
  const files = execFileSync('git', ['ls-files', 'site'], {encoding: 'utf8'}).split('\n').filter(f => /\.(js|css|html|json)$/.test(f) && !f.startsWith('site/atlas/data/') && !f.startsWith('site/data/'));
  for (const f of files) { const t = fs.readFileSync(f, 'utf8'); assert.ok(!/atlas-moon-face|atlas-hello(-wide|-132|-face)?\.(jpg|mp4|webm)|og-hello\.jpg|공주님/.test(t), f); }
});
