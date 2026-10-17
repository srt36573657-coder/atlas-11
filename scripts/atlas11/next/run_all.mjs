// 새 아틀란스 모든 쪽 검사 한 번에(사장님 2026-10-17 04:04 「첫화면 부터 마지막 페이지 까지 모두 바꿔」 · 04:23 「에이전트 총 동원해」 · 규칙 74)
//   쓰는 법: node scripts/atlas11/next/run_all.mjs --base http://127.0.0.1:8826 [--pw /tmp/pw/] [--out reports/atlas11/verify/next-all-latest.json] [--quick]
//   ① next_check.mjs(첫 화면 · 보는 화면 · 쇼츠 · 채널 · 구독 · 나 · 찾기 · 세 폭 · 큰 글씨 · 모든 회사)
//   ② 쪽 검사 check_<이름>.mjs — 지금 아틀란스(/atlas/)의 그 쪽과 새 쪽(/next/)을 같은 자료로 열어 숫자 · 글 · 고리를 맞댐(모든 회사 · 모든 칸)
//      옛 쪽 글은 이름만 새 이름으로 고쳐 맞댐(아틀란스 · ATLAS → 보드리 · rename.mjs — 2026-10-17 15:48 「아틀란스에서 보드리로 모두 변경해」)
//   ⓪ 먼저 소스 시험 tests/atlas11/next-modules.test.mjs(모듈 · 보안 · 입체 없음 · 옛 이름 없음 — 브라우저 없이 1초)
//   하나라도 실패(끝 코드 ≠ 0)면 끝 코드 1 · 결과 파일에 쪽마다 끝 코드 · 걸린 시간 · 마지막 줄
import {spawn} from 'node:child_process';
import fs from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../..');
const arg = (k, d) => { const i = process.argv.indexOf(k); return i > 0 ? process.argv[i + 1] : d; };
const base = arg('--base', 'http://127.0.0.1:8826'), pw = arg('--pw', null), quick = process.argv.includes('--quick');
const out = path.resolve(ROOT, arg('--out', 'reports/atlas11/verify/next-all-latest.json'));
const dir = path.join(ROOT, 'scripts/atlas11/next');
const files = (await fs.readdir(dir)).filter(f => /^check_[a-z0-9]+\.mjs$/.test(f) && f !== 'check_changed.mjs').sort(); // check_changed.mjs = 바뀐 쪽만 고르는 도구(쪽 검사 아님 — 여기서 부르면 검사를 두 번 돎)
const jobs = [['modules', ['--test', path.join(ROOT, 'tests/atlas11/next-modules.test.mjs')]], ['next_check', ['next_check.mjs', '--base', base, ...(pw ? ['--pw', pw] : []), '--out', path.join(path.dirname(out), 'next-check-latest.json'), ...(quick ? ['--limit', '40'] : [])]],
  ...files.map(f => [f.slice(6, -4), [f, '--base', base, ...(pw ? ['--pw', pw] : []), ...(quick ? ['--limit', '40'] : ['--all'])]])];
const run = (name, a) => new Promise(res => {
  const t0 = Date.now(), env = {...process.env, ...(pw ? {PW_DIR: pw} : {})};
  const p = spawn(process.execPath, a, {cwd: dir, env}); let tail = '';
  const keep = d => { tail = (tail + d.toString()).slice(-1500); };
  p.stdout.on('data', keep); p.stderr.on('data', keep);
  p.on('close', code => res({name, code, seconds: Math.round((Date.now() - t0) / 1000), last: tail.trim().split('\n').slice(-4).join('\n')}));
});
const res = [];
for (const [name, a] of jobs) { const r = await run(name, a); res.push(r); console.log((r.code === 0 ? 'ok  ' : 'FAIL') + ' ' + name + ' ' + r.seconds + '초'); if (r.code !== 0) console.log(r.last); }
const sum = {schema: 'atlas11-next-all-1', at: new Date().toISOString(), base, full: !quick, jobs: res, ok: res.every(r => r.code === 0)};
await fs.mkdir(path.dirname(out), {recursive: true});
await fs.writeFile(out, JSON.stringify(sum, null, 1) + '\n');
console.log(sum.ok ? '모두 통과' : '실패 ' + res.filter(r => r.code !== 0).map(r => r.name).join(' · '));
process.exit(sum.ok ? 0 : 1);
