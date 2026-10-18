#!/usr/bin/env node
// 바뀐 쪽만 검사(사장님 2026-10-17 21시 「고도리 · 하나로 묶은 명령문」 [1] 5 · 6 · 10 · 규칙 76 ④ · 78)
//   바뀐 파일(기준 가지와 다른 것 + 아직 안 올린 새 파일)마다 짝 검사만 돌림 — 이 기계(CPU 2)에서 run_all 전체(한 대씩 약 31분)를 돌리지 않으려고
//   예) site/next/p-why.js 바뀜 → check_why · next_check(--limit 40) · next-modules 시험
//   걸린 초는 reports/atlas11/speed/<날>.jsonl 에 한 줄(다음 일은 이 숫자와 견줌)
//   쓰는 법: node scripts/atlas11/next/check_changed.mjs [--since origin/main] [--files a,b] [--base http://127.0.0.1:8826] [--limit 40] [--dry]
//   모두는 올리기 직전 깃허브에서 한 번: gh workflow run atlas11-next-full.yml --ref <가지> -f local=true
import fs from 'node:fs';
import path from 'node:path';
import {spawnSync, execFileSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../..');
const arg = (k, d) => (process.argv.includes(k) ? process.argv[process.argv.indexOf(k) + 1] : d);
const SINCE = arg('--since', 'origin/main'), BASE = arg('--base', 'http://127.0.0.1:8826'), LIMIT = arg('--limit', '40'), DRY = process.argv.includes('--dry');
const git = a => { try { return execFileSync('git', a, {cwd: ROOT, encoding: 'utf8'}); } catch { return ''; } };

/** 바뀐 파일 — 기준과 다른 것 + 고쳤는데 아직 안 묶은 것 + 새 파일 */
export function changedFiles() {
  const s = new Set();
  for (const l of git(['diff', '--name-only', SINCE]).split('\n')) if (l) s.add(l);
  for (const l of git(['status', '--porcelain']).split('\n')) { const f = l.slice(3).trim(); if (f) s.add(f.replace(/^"|"$/g, '')); }
  return [...s].sort();
}
const MISC = new Set(['up', 'time', 'info', 'x', 'talk']);
/** 파일 하나 → 짝 검사들(이름 · 명령) */
export function checksFor(f) {
  const out = [], page = n => out.push(MISC.has(n) ? 'check_misc' : 'check_' + n);
  let m;
  if ((m = /^site\/next\/p-([a-z]+)\.(js|css)$/.exec(f))) { page(m[1]); out.push('next_check', 'modules', 'check_kakao'); } // 카톡 줄(사장님 2026-10-18 16:39 [6] 1 — 종목 줄마다 같은 단추 · 일꾼 KB2)
  else if (/^site\/next\/(app\.js|app\.css|index\.html|brand\.js|words\.js)$/.test(f)) out.push('next_check', 'modules', 'check_why', 'check_gdr', 'check_hold', 'check_share', 'check_kakao');
  else if (/^site\/next\/(i18n\.js|i18n\/|en\.css)/.test(f) || /^scripts\/atlas11\/next\/(i18n\/|i18n_build\.mjs)/.test(f)) out.push('en');
  else if (/^site\/next\/data\/|^scripts\/atlas11\/next\/gdr\//.test(f)) out.push('verify', 'check_gdr', 'check_hold');
  else if (/^site\/(letter|invite)\.|^lib\/atlas11\/(letter|invite)\.mjs$|^functions\/atlas11\//.test(f)) out.push('letter-tests');
  else if (/^site\/hello/.test(f)) out.push('check_share', 'letter-tests');
  else if (/^site\/next\/(kakao|share-btn)\.js$|^tests\/atlas11\/kakao-client\.test\.mjs$/.test(f)) out.push('kakao-client', 'check_share', 'check_kakao', 'modules'); // 카톡 화면 쪽(K2c 알림 · 2026-10-18)
  else if (/^site\/next\/(glossary|warn)\.js$/.test(f)) out.push('next_check', 'modules', 'en'); // 낱말 바꾸기 · 금빛 두 줄 — 모든 쪽에 걸림
  else if ((m = /^scripts\/atlas11\/next\/(check_[a-z]+|next_check|next_en_check)\.mjs$/.exec(f)) && m[1] !== 'check_changed') out.push(m[1] === 'next_en_check' ? 'en' : m[1]);
  else if (/^scripts\/atlas11\/next\/(rename|brand_apply)\.mjs$|^tests\/atlas11\/next-modules/.test(f)) out.push('modules');
  return out;
}
const CMD = {
  next_check: () => ['node', ['scripts/atlas11/next/next_check.mjs', '--base', BASE, '--limit', LIMIT, '--out', path.join(TMP, 'next_check.json')]],
  en: () => ['node', ['scripts/atlas11/next/next_en_check.mjs', '--base', BASE, '--modules', '--dev', '0', '--out', path.join(TMP, 'en.json')]],
  modules: () => ['node', ['--test', 'tests/atlas11/next-modules.test.mjs']],
  'letter-tests': () => ['node', ['--test', 'tests/atlas11/letter.test.mjs', 'tests/atlas11/invite.test.mjs']],
  'kakao-client': () => ['node', ['--test', 'tests/atlas11/kakao-client.test.mjs']],
  // 고도리 칸 셈 v2 따로 세기(2026-10-18 · G4x) — 끝 코드 4 = 이 기계에 없는 입력으로 만든 파일이라 셀 수 없음 → 건너뜀(실패 아님)
  verify: () => ['python3', ['-I', 'scripts/atlas11/next/gdr/verify2.py', '--quiet', '--out', path.join(TMP, 'verify2.json')]],
};
const TMP = fs.mkdtempSync(path.join(process.env.TMPDIR || '/tmp', 'check-changed-'));
const cmdOf = k => (CMD[k] ? CMD[k]() : ['node', ['scripts/atlas11/next/' + k + '.mjs', '--base', BASE, '--out', path.join(TMP, k + '.json')]]);

if (import.meta.url === `file://${process.argv[1]}`) {
  const files = arg('--files', null)?.split(',').filter(Boolean) ?? changedFiles();
  const want = [...new Set(files.flatMap(checksFor))].filter(k => CMD[k] || fs.existsSync(path.join(ROOT, 'scripts/atlas11/next', k + '.mjs')));
  const order = ['modules', 'verify', 'letter-tests', 'kakao-client', ...want.filter(k => /^check_/.test(k)).sort(), 'next_check', 'en'].filter(k => want.includes(k));
  console.log(`바뀐 파일 ${files.length}개 → 짝 검사 ${order.length}개: ${order.join(' · ') || '없음'}`);
  if (DRY || !order.length) process.exit(0);
  const t0 = Date.now(), rows = [];
  for (const k of order) {
    const [bin, args] = cmdOf(k), s = Date.now();
    const r = spawnSync(bin, args, {cwd: ROOT, encoding: 'utf8', timeout: 20 * 60e3, maxBuffer: 64 << 20});
    const sec = Math.round((Date.now() - s) / 100) / 10, skip = k === 'verify' && r.status === 4, ok = r.status === 0 || skip;
    rows.push({k, ok, sec});
    console.log(`${skip ? '건너뜀(셀 입력 없음)' : ok ? '통과' : '실패'} ${k} · ${sec}초${ok ? '' : '\n' + String(r.stdout || '').slice(-1200) + String(r.stderr || '').slice(-600)}`);
  }
  const sec = Math.round((Date.now() - t0) / 100) / 10, fails = rows.filter(r => !r.ok).length;
  const day = new Date(Date.now() + 8 * 36e5).toISOString().slice(0, 10), dir = path.join(ROOT, 'reports/atlas11/speed');
  fs.mkdirSync(dir, {recursive: true});
  fs.appendFileSync(path.join(dir, day + '.jsonl'), JSON.stringify({job: 'check_changed', start: new Date(t0).toISOString(), end: new Date().toISOString(), seconds: sec, files: files.length, checks: rows, fails}) + '\n');
  console.log(`끝 · ${sec}초 · 실패 ${fails}`);
  process.exit(fails ? 1 : 0);
}
