#!/usr/bin/env node
// 커밋 번호 문(2026-10-13 12:3x) — 기록 탭(reports/atlas11/changelog)의 커밋 번호가 지금 저장소 줄기(HEAD)에 있는지 봄
//   까닭: 08:25 「36곳 지움」 줄이 밀어 넣기 직전 다시 쌓기(rebase)로 바뀌기 전 번호를 적어 기록 탭에 없는 번호가 보임(틀림 장부 19번)
//   고침 줄(fixes)을 입힌 뒤의 번호로 셈 · 2026-10-13 12:00 뒤에 만든 줄만 막음(그 전 옛 줄 11개는 따로 고칠 일 — 수만 알림)
//   쓰는 법: node scripts/atlas11/changelog_commit_gate.mjs [--all]  → 막힐 줄이 있으면 1
import {execFileSync} from 'node:child_process';
import {readSiteLog} from '../../lib/atlas11/changelog.mjs';

export const SINCE = '2026-10-13T12:00:00+09:00';
export async function commitGate(root = '.', {all = false} = {}) {
  const log = await readSiteLog(root, {now: new Date().toISOString()});
  const full = execFileSync('git', ['rev-list', 'HEAD'], {cwd: root, encoding: 'utf8', maxBuffer: 64 << 20}).split('\n').filter(Boolean);
  const has = id => full.some(h => h.startsWith(String(id).toLowerCase()));
  const block = [], old = [];
  for (const e of log.entries) for (const c of e.commits ?? []) if (!has(c)) (all || e.made >= SINCE ? block : old).push(`${e.id} ${c}`);
  return {block, old, problems: log.problems};
}
if (import.meta.url === `file://${process.argv[1]}`) {
  const r = await commitGate('.', {all: process.argv.includes('--all')});
  if (r.block.length) { console.log('커밋 번호 문 막힘 — 기록 탭 줄의 커밋 번호가 저장소에 없음: ' + r.block.join(' · ') + ' — 다시 쌓은 뒤 바뀐 번호로 고침 줄을 만드세요'); process.exit(1); }
  console.log(`커밋 번호 문 통과 — 새 줄 번호 모두 저장소에 있음${r.old.length ? ` · 옛 줄 ${r.old.length}개는 따로 고칠 일` : ''}`);
}
