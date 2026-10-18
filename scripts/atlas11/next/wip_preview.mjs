#!/usr/bin/env node
// 작업 사본 미리 검사(사장님 2026-10-18 00:35 「더 효율적인 방식 … 더 빠르개 더 정확하개」 · brief4 빠른 길 4)
//   일꾼들이 고치는 중인 작업 폴더를 그대로(커밋 · 가지 · 색인은 건드리지 않고) 임시 가지에 올려 깃허브 여러 대가 모든 쪽을 미리 검사
//   → 일꾼끼리 부딪힌 것을 올리기 전에 일찍 찾음 · 이 기계(CPU 2)는 쉬게 둠
//   쓰는 법: node scripts/atlas11/next/wip_preview.mjs [--branch wip-<날>] [--pages next,why,…] [--en-shards N] [--split co=2,past=3] [--dry]
//     --en-shards · --split = 몫 수를 손으로(워크플로 -f en_shards · -f split — 비우면 워크플로가 걸린 초로 셈 · scripts/atlas11/next/shard/plan.mjs)
//   결과: gh run 번호를 찍음 · 끝나면 main 의 reports/atlas11/probe/next-preview/summary.json(가지 이름 · sha 로 확인)
import {execFileSync} from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../..');
const arg = (k, d) => (process.argv.includes(k) ? process.argv[process.argv.indexOf(k) + 1] : d);
const kst = new Date(Date.now() + 9 * 36e5).toISOString().slice(0, 10).replace(/-/g, '');
const BRANCH = arg('--branch', 'wip-' + kst), PAGES = arg('--pages', ''), DRY = process.argv.includes('--dry');
const EN_SHARDS = arg('--en-shards', ''), SPLIT = arg('--split', '');
if (EN_SHARDS && !/^\d+$/.test(EN_SHARDS)) { console.error('--en-shards 는 숫자(1 ~ 20) — 받은 값 ' + EN_SHARDS); process.exit(2); }
if (SPLIT && !/^[a-z0-9]+=\d+(,[a-z0-9]+=\d+)*$/.test(SPLIT)) { console.error('--split 은 쪽=수,쪽=수 꼴(예 co=2,past=3) — 받은 값 ' + SPLIT); process.exit(2); }
const REPO = 'srt36573657-coder/atlas-11';
const idx = path.join(fs.mkdtempSync(path.join(os.tmpdir(), 'wip-idx-')), 'index');
const git = (a, env = {}) => execFileSync('git', a, {cwd: ROOT, encoding: 'utf8', env: {...process.env, ...env}}).trim();
const E = {GIT_INDEX_FILE: idx};
git(['read-tree', 'HEAD'], E);           // 지금 커밋에서 시작
git(['add', '-A', '--', '.'], E);         // 작업 폴더 그대로(.gitignore 지킴)
const tree = git(['write-tree'], E);
const head = git(['rev-parse', 'HEAD']);
if (tree === git(['rev-parse', 'HEAD^{tree}'])) console.log('작업 폴더가 HEAD 와 같음 — 그대로 올림');
const commit = git(['commit-tree', tree, '-p', head, '-m', `작업 사본 미리 검사 ${new Date().toISOString()} (커밋 아님 · ${BRANCH})`]);
console.log(`사본 ${commit.slice(0, 9)} (바탕 ${head.slice(0, 9)}) → ${BRANCH}`);
const wf = ['workflow', 'run', 'atlas11-next-full.yml', '-R', REPO, '--ref', BRANCH, '-f', 'local=true', ...(PAGES ? ['-f', 'pages=' + PAGES] : []),
  ...(EN_SHARDS ? ['-f', 'en_shards=' + EN_SHARDS] : []), ...(SPLIT ? ['-f', 'split=' + SPLIT] : [])];
if (DRY) { console.log('gh ' + wf.join(' ')); process.exit(0); }
execFileSync('git', ['push', '-q', '--force', 'origin', `${commit}:refs/heads/${BRANCH}`], {cwd: ROOT, stdio: 'inherit'});
execFileSync('gh', wf, {cwd: ROOT, stdio: 'inherit'});
console.log(`깃허브 검사 시작 — gh run list -R ${REPO} --branch ${BRANCH} --limit 1`);
