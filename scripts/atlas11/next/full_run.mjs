#!/usr/bin/env node
// 전체 검사 돌리기 — 새로 만든 것 하나에 11번까지
//   사장님 2026-10-19(싱가포르) 22:33 「전체 검사 11번만해 영구 세팅해」 · 22:49 「아니야 뭘 새롭게 만들고 나서 전체검사를 하잖아 그때 11번만 하라고 한거야」(원칙 87)
//   셈 = reports/atlas11/full-runs/<일 이름>.jsonl 의 줄 수 — 깃허브 전체 검사(atlas11-next-full.yml)를 한 번 부를 때마다 한 줄(이 방 자료로 묶어 띄우는 쪽 · 실제 사이트 쪽 · 멈춘 것 모두 셈)
//   11번을 다 썼으면 부르지 않고 끝 코드 3 — 멈추고 사장님께 쉽게 보고한 뒤 새 말씀을 기다림(새로 만든 것이 아니면 셈을 새로 열지 않음)
//   바로 `gh workflow run atlas11-next-full.yml` 을 치면 .claude/hooks/full-run-guard.sh 가 막음(이 파일로만 셈이 남음)
//   쓰는 법: node scripts/atlas11/next/full_run.mjs --work <일 이름> [--ref <가지>] [--local] [--why "까닭"] [--dry]
//     --work  새로 만든 것 하나의 이름(영문 소문자 · 숫자 · - 만 · 예: dahae-2026-10-19) — 같은 일은 같은 이름
//     --ref   부를 가지(기본 = 지금 가지) · --local = 이 방 자료로 묶어 띄우는 쪽(-f local=true) · 빼면 실제 사이트 쪽
//     --dry   부르지 않고 지금 셈만 보임
import fs from 'node:fs';
import path from 'node:path';
import {execFileSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';

export const MAX = 11;
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../..');
const REPO = 'srt36573657-coder/atlas-11', WF = 'atlas11-next-full.yml';
const arg = (k, d = null) => (process.argv.includes(k) ? process.argv[process.argv.indexOf(k) + 1] : d);
const has = k => process.argv.includes(k);
const sh = (cmd, a) => execFileSync(cmd, a, {cwd: ROOT, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe']}).trim();

/** 이 일의 기록 줄(없으면 빈 목록) */
export function runsOf(work) {
  const f = path.join(ROOT, 'reports/atlas11/full-runs', work + '.jsonl');
  if (!fs.existsSync(f)) return [];
  return fs.readFileSync(f, 'utf8').split('\n').filter(l => l.trim()).map(l => { try { return JSON.parse(l); } catch { return {bad: l}; } });
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const work = arg('--work');
  if (!work || !/^[a-z0-9][a-z0-9-]{2,60}$/.test(work)) { console.error('--work <일 이름> 이 필요함(영문 소문자 · 숫자 · - · 예: dahae-2026-10-19)'); process.exit(2); }
  const ref = arg('--ref') || sh('git', ['rev-parse', '--abbrev-ref', 'HEAD']), local = has('--local');
  const done = runsOf(work), n = done.length;
  if (has('--dry')) { console.log(`전체 검사 ${n}/${MAX} — 「${work}」`); process.exit(0); }
  if (n >= MAX) {
    console.error(`전체 검사 ${MAX}번을 다 썼어요 — 「${work}」 · 부르지 않음. 멈추고 사장님께 쉽게 보고하세요(원칙 87).`);
    process.exit(3);
  }
  const t0 = new Date(Date.now() - 5000).toISOString();
  sh('gh', ['workflow', 'run', WF, '-R', REPO, '--ref', ref, ...(local ? ['-f', 'local=true'] : [])]);
  let run = null;
  for (let k = 0; k < 20 && !run; k++) { // 막 부른 것 찾기(가지 · 부른 때 뒤 · 가장 새것)
    try {
      const rows = JSON.parse(sh('gh', ['run', 'list', '-R', REPO, '--workflow', WF, '--branch', ref, '--limit', '5', '--json', 'databaseId,createdAt,headSha,url']));
      run = rows.filter(r => r.createdAt >= t0).sort((a, b) => b.createdAt.localeCompare(a.createdAt))[0] ?? null;
    } catch { /* 다시 */ }
    if (!run) execFileSync('sleep', ['3']);
  }
  const line = {n: n + 1, work, ref, local, sha: run?.headSha ?? null, run: run?.databaseId ?? null, url: run?.url ?? null, at: new Date().toISOString(), why: arg('--why')};
  const dir = path.join(ROOT, 'reports/atlas11/full-runs'); fs.mkdirSync(dir, {recursive: true});
  fs.appendFileSync(path.join(dir, work + '.jsonl'), JSON.stringify(line) + '\n');
  console.log(`전체 검사 ${n + 1}/${MAX} — 「${work}」 ${line.url ?? '(번호 못 찾음 — gh run list 로 확인)'}`);
}
