/**
 * ATLAS 11 · 한 회차 돌리기 — 몬테카를로(두 판 합 2,000만 경로) → 판 읽기(몬테카를로 · 소거 1판 붙임) → 따로 다시 세는 검사 둘 → 회차 요약
 *   사장님 2026-10-10 05:14(마카오) 승인 「1예측한다 2a안 3 너가 알아서 해 4번은 지켜 …」 · 계획 docs/superpowers/plans/2026-10-10-atlas-phase1-engine.md Task 5
 *   node scripts/atlas11/round.mjs --slot hand|08|12|16|21 [--total 20000000] [--base 20000]
 *   쓰는 것(모두 새 파일 · 고치지 않음): public/data/atlas11/mc/<판>/<회차 ID>.json · reports/atlas11/rounds/<회차 ID>.json(엔진)
 *     · reports/atlas11/rounds/<회차 ID>.verify-mc.json(mc_verify · L1 다시 뽑기 + 성질) · <회차 ID>.verify-elim-<판>.json(elim_verify · L1 원자료 다시 판정)
 *   바꿔 쓰는 것(가리키기만): public/data/atlas11/mc/<판>/latest.json(엔진) · reports/atlas11/rounds/latest.json(이 파일이 마지막에)
 *   검사가 하나라도 실패하면 끝 코드 1 — 회차 요약에 ok:false 로 남김(통과로 적지 않음)
 */
import fs from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';
import {spawnSync} from 'node:child_process';
import {lensFrom} from './lens/build.mjs';
import {lensJson} from '../../lib/atlas11/lens.mjs';

const root = process.cwd();
const arg = (k, d = null) => { const i = process.argv.indexOf(k); return i < 0 ? d : process.argv[i + 1]; };
const run = (cmd, args, label) => {
  const t0 = Date.now(), r = spawnSync(cmd, args, {cwd: root, encoding: 'utf8', maxBuffer: 1e9});
  const last = (r.stdout ?? '').trim().split('\n').at(-1) ?? '';
  let json = null; try { json = JSON.parse(last); } catch {}
  return {label, code: r.status, sec: Math.round((Date.now() - t0) / 100) / 10, json, err: (r.stderr ?? '').trim().split('\n').slice(-6).join('\n')};
};

export async function runRound({slot = 'hand', total = null, base = null} = {}) {
  const startedAt = new Date().toISOString();
  // ① 엔진 — 회차 ID 는 엔진이 서울 날짜 · slot · 두 입력 지문으로 만듦
  const eng = run('python3', ['scripts/atlas11/mc/fhs_crn.py', '--slot', slot, ...(total ? ['--total', String(total)] : []), ...(base ? ['--base', String(base)] : [])], 'engine');
  if (eng.code !== 0 || !eng.json?.runId) throw Error(`엔진 멈춤(끝 코드 ${eng.code}): ${eng.err}`);
  const rec = eng.json, runId = rec.runId, places = Object.keys(rec.boards);
  const dir = 'reports/atlas11/rounds';
  // ② 판 읽기 — 방금 결과가 붙는지(같은 기준일 · 같은 입력 지문) · 검사용 사본은 임시 폴더에만
  const tmp = await fs.mkdtemp(path.join(os.tmpdir(), 'round-'));
  const lens = {};
  for (const p of places) {
    const l = await lensFrom(root, p, {made: new Date().toISOString()});
    lens[p] = {file: path.join(tmp, `lens-${p}.json`), mc: l.mc?.none ? `없음 — ${l.mc.why}` : l.mc.runId, elim: l.elim?.counts ?? null, problems: l.problems ?? []};
    await fs.writeFile(lens[p].file, lensJson(l));
  }
  // ③ 따로 다시 세는 검사 둘(검사마다 새 파일)
  const checks = [run('node', ['scripts/atlas11/verify/mc_verify.mjs', '--run', `${dir}/${runId}.json`, '--out', `${dir}/${runId}.verify-mc.json`], 'mc_verify')];
  for (const p of places) checks.push(run('python3', ['-I', 'scripts/atlas11/verify/elim_verify.py', '--lens', lens[p].file, '--place', p, '--run-id', runId, '--out', `${dir}/${runId}.verify-elim-${p}.json`], `elim_verify-${p}`));
  await fs.rm(tmp, {recursive: true, force: true});
  const ok = checks.every(c => c.code === 0) && places.every(p => lens[p].mc === runId);
  const summary = {schema: 'atlas11-rounds-latest-1', runId, slot, date: rec.date, startedAt, endedAt: new Date().toISOString(), file: `${dir}/${runId}.json`,
    paths: rec.paths, time: rec.time, boards: Object.fromEntries(places.map(p => [p, {asOf: rec.boards[p].asOf, mc: lens[p].mc, elim: lens[p].elim}])),
    verify: checks.map(c => ({label: c.label, code: c.code, sec: c.sec, summary: c.json?.summary ?? null, out: c.json?.out ?? null, err: c.code === 0 ? null : c.err})),
    ok, published: false, note: '검사 수는 실제로 돈 검사만 셈(같은 비교를 되풀이해 채우지 않음) · 경로 수와 검사 수는 따로 셈'};
  const tmpL = path.join(root, dir, `.latest.${process.pid}.tmp`);
  await fs.writeFile(tmpL, JSON.stringify(summary, null, 1) + '\n'); await fs.rename(tmpL, path.join(root, dir, 'latest.json'));
  return summary;
}

if (process.argv[1] && path.resolve(process.argv[1]) === new URL(import.meta.url).pathname) {
  const s = await runRound({slot: arg('--slot', 'hand'), total: arg('--total') ? Number(arg('--total')) : null, base: arg('--base') ? Number(arg('--base')) : null});
  console.log(JSON.stringify(s));
  process.exit(s.ok ? 0 : 1);
}
