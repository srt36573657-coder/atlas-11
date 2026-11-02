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
// 줄기 번호 문(2026-11-02 주문 2249 · 틀림 장부 172) — main 으로 미는 판(--ref)을 지금 원격 main(--base)과 견줘 새로 막히는 줄만 막음
test('미는 판 — 바탕보다 새로 막히는 줄만(일 폴더 없이 git 판으로)', async () => {
  const {newBlocks} = await import('../../scripts/atlas11/changelog_commit_gate.mjs');
  const g = (args, input) => execFileSync('git', args, {cwd: ROOT, encoding: 'utf8', input, env: {...process.env, GIT_AUTHOR_NAME: 't', GIT_AUTHOR_EMAIL: 't@t', GIT_COMMITTER_NAME: 't', GIT_COMMITTER_EMAIL: 't@t'}}).trim();
  const head = g(['rev-parse', 'HEAD']);
  const entry = JSON.stringify({schema: 'atlas11-change-1', id: 'u-20991231T000000-ref', kind: 'update', place: 'all', made: '2099-12-31T00:00:00+09:00', title: '시험', what: ['시험 줄'], why: '시험', commits: ['deadbeef']});
  const blob = g(['hash-object', '-w', '--stdin'], entry);
  const idx = path.join(fs.mkdtempSync(path.join(os.tmpdir(), 'cgr-')), 'index');
  const env = {...process.env, GIT_INDEX_FILE: idx};
  execFileSync('git', ['read-tree', head], {cwd: ROOT, env});
  execFileSync('git', ['update-index', '--add', '--cacheinfo', `100644,${blob},reports/atlas11/changelog/updates/u-20991231T000000-ref.json`], {cwd: ROOT, env});
  const tree = execFileSync('git', ['write-tree'], {cwd: ROOT, env, encoding: 'utf8'}).trim();
  const bad = g(['commit-tree', tree, '-p', head], '시험 판');
  const r = await newBlocks(ROOT, bad, head);
  assert.ok(r.fresh.some(x => x.includes('deadbeef')), '새로 넣은 없는 번호는 막힘 ' + JSON.stringify(r.fresh));
  const same = await newBlocks(ROOT, head, head);
  assert.deepEqual(same.fresh, [], '바탕과 같은 판은 새로 막힘 0');
  const back = await newBlocks(ROOT, head, bad);
  assert.deepEqual(back.fresh, [], '막힌 줄을 빼는 밀기는 지나감');
  fs.rmSync(path.dirname(idx), {recursive: true, force: true});
});
