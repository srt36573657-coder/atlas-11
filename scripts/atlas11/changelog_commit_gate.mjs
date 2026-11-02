#!/usr/bin/env node
// 커밋 번호 문(2026-10-13 12:3x) — 기록 탭(reports/atlas11/changelog)의 커밋 번호가 지금 저장소 줄기(HEAD)에 있는지 봄
//   까닭: 08:25 「36곳 지움」 줄이 밀어 넣기 직전 다시 쌓기(rebase)로 바뀌기 전 번호를 적어 기록 탭에 없는 번호가 보임(틀림 장부 19번)
//   고침 줄(fixes)을 입힌 뒤의 번호로 셈 · 2026-10-13 12:00 뒤에 만든 줄만 막음(그 전 옛 줄 11개는 따로 고칠 일 — 수만 알림)
//   쓰는 법: node scripts/atlas11/changelog_commit_gate.mjs [--all] [--ref <커밋> [--base <커밋>]]  → 막힐 줄이 있으면 1(--base 를 주면 바탕보다 새로 막히는 줄만)
//   --ref(2026-11-02 주문 2249 「응 철저하게 해」): 그 커밋 판의 기록 탭 줄을 그 커밋 줄기에 맞대 봄(일 폴더 없이 · git archive)
//     까닭: 갈래(wip)에서 main 으로 파일만 옮겨 밀 때 이 문은 갈래 HEAD 를 보아 통과했지만, main 판에서는 갈래 번호가 줄기에 없어
//     main 을 받은 곳(진화 예약 방)의 밀어 넣기가 모두 막힘 → 진화 회차가 기록을 못 올리고 소리 없이 끝남(10-30 ~ 11-02 · 틀림 장부 172)
//     그래서 밀어 넣기 문이 main 으로 미는 판을 --ref 로 봄
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {execFileSync} from 'node:child_process';
import {readSiteLog, CHANGELOG} from '../../lib/atlas11/changelog.mjs';

export const SINCE = '2026-10-13T12:00:00+09:00';
const HEX = /^[0-9a-f]{7,40}$/i;
export async function commitGate(root = '.', {all = false, ref = null} = {}) {
  let dir = root, tmp = null;
  if (ref) {
    if (!HEX.test(ref) && !/^[\w./-]+$/.test(ref)) throw Error('--ref 꼴이 틀림');
    const sha = execFileSync('git', ['rev-parse', '--verify', ref + '^{commit}'], {cwd: root, encoding: 'utf8'}).trim();
    tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'cgate-'));
    const have = execFileSync('git', ['ls-tree', '-d', '--name-only', sha, '--', ...Object.values(CHANGELOG.dirs)], {cwd: root, encoding: 'utf8'}).split('\n').filter(Boolean);
    if (have.length) execFileSync('sh', ['-c', `git archive ${sha} -- ${have.map(p => `'${p}'`).join(' ')} | tar -x -C '${tmp}'`], {cwd: root, maxBuffer: 64 << 20});
    dir = tmp; ref = sha;
  }
  try {
    const log = await readSiteLog(dir, {now: new Date().toISOString()});
    const full = execFileSync('git', ['rev-list', ref ?? 'HEAD'], {cwd: root, encoding: 'utf8', maxBuffer: 64 << 20}).split('\n').filter(Boolean);
    const has = id => full.some(h => h.startsWith(String(id).toLowerCase()));
    const block = [], old = [];
    for (const e of log.entries) for (const c of e.commits ?? []) if (!has(c)) (all || e.made >= SINCE ? block : old).push(`${e.id} ${c}`);
    return {block, old, problems: log.problems, ref};
  } finally { if (tmp) fs.rmSync(tmp, {recursive: true, force: true}); }
}
/** 미는 판(ref)이 바탕(base · 지금 원격 main)보다 새로 막히는 줄 — 바탕에서 이미 막힌 줄은 빼고 셈(나빠지지 않게만 막는 문) */
export async function newBlocks(root, ref, base) {
  const r = await commitGate(root, {ref});
  if (!base) return {...r, fresh: r.block, baseBlock: []};
  let b; try { b = await commitGate(root, {ref: base}); } catch { return {...r, fresh: r.block, baseBlock: []}; } // 바탕을 못 읽으면 엄하게
  const had = new Set(b.block);
  return {...r, fresh: r.block.filter(x => !had.has(x)), baseBlock: b.block};
}
if (import.meta.url === `file://${process.argv[1]}`) {
  const arg = k => { const i = process.argv.indexOf(k); return i > 0 ? process.argv[i + 1] : null; };
  const ref = arg('--ref'), base = arg('--base');
  if (ref && base) {
    const r = await newBlocks('.', ref, base);
    const at = ` (${String(r.ref).slice(0, 9)} 판 · 바탕 ${String(base).slice(0, 9)})`;
    if (r.fresh.length) { console.log(`커밋 번호 문 막힘${at} — 새로 넣는 기록 탭 줄의 커밋 번호가 줄기에 없음: ` + r.fresh.join(' · ') + ' — 갈래 번호 대신 줄기 번호로 적거나 고침 줄을 더하세요'); process.exit(1); }
    console.log(`커밋 번호 문 통과${at} — 새로 막히는 줄 0${r.baseBlock.length ? ` · 바탕에서 이미 막힌 줄 ${r.baseBlock.length}개 · 이 판 ${r.block.length}개(나빠지지 않음)` : ''}`);
  } else {
    const r = await commitGate('.', {all: process.argv.includes('--all'), ref});
    const at = ref ? ` (${String(r.ref).slice(0, 9)} 판)` : '';
    if (r.block.length) { console.log(`커밋 번호 문 막힘${at} — 기록 탭 줄의 커밋 번호가 저장소에 없음: ` + r.block.join(' · ') + ' — 다시 쌓은 뒤 바뀐 번호로 고침 줄을 만드세요'); process.exit(1); }
    console.log(`커밋 번호 문 통과${at} — 새 줄 번호 모두 저장소에 있음${r.old.length ? ` · 옛 줄 ${r.old.length}개는 따로 고칠 일` : ''}`);
  }
}
