// 커밋 번호 문 — 지금 저장소에서 새 줄(12:00 뒤)은 번호가 모두 줄기에 있음 · 없는 번호를 적은 줄은 막힘
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {execFileSync} from 'node:child_process';
import {commitGate} from '../../scripts/atlas11/changelog_commit_gate.mjs';

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), '../..');
test('지금 저장소 — 막힐 새 줄 없음', async () => { const r = await commitGate(ROOT); assert.deepEqual(r.block, []); });
test('없는 커밋 번호를 적은 새 줄은 막힘', async () => {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'cg-'));
  execFileSync('git', ['clone', '-q', '--depth', '50', 'file://' + ROOT, tmp]);
  const dir = path.join(tmp, 'reports/atlas11/changelog/updates'); fs.mkdirSync(dir, {recursive: true});
  fs.writeFileSync(path.join(dir, 'u-20991231T000000-test.json'), JSON.stringify({schema: 'atlas11-change-1', id: 'u-20991231T000000-test', kind: 'update', place: 'all', made: '2099-12-31T00:00:00+09:00', title: '시험 줄', what: ['시험'], why: '시험', commits: ['deadbeef']}));
  const r = await commitGate(tmp); assert.ok(r.block.some(x => x.includes('deadbeef')), JSON.stringify(r.block));
  fs.rmSync(tmp, {recursive: true, force: true});
});
