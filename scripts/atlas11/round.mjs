/**
 * ATLAS 11 · 한 회차 돌리기 — 후보(범위 띠를 낼 회사) → 몬테카를로(두 판 합 2,000만 경로 · 후보는 날마다 범위 띠) → 판 읽기(몬테카를로 · 소거 1판 붙임) → 따로 다시 세는 검사 둘 → 회차 요약
 *   사장님 2026-10-10 05:14(마카오) 승인 「1예측한다 2a안 3 너가 알아서 해 4번은 지켜 …」 · 계획 docs/superpowers/plans/2026-10-10-atlas-phase1-engine.md Task 5
 *   node scripts/atlas11/round.mjs --slot hand|08|12|16|21 [--total 20000000] [--base 20000] [--run-id ID(같은 날 같은 입력 손 회차를 또 돌릴 때만)]
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

/** 범위 띠를 낼 회사 — 판마다 판 읽기 후보(cand.items · 최대 7곳) · 엔진보다 먼저 셈(후보 셈은 몬테카를로와 상관없음) · 못 세면 그 판은 띠 없이(까닭을 남김) */
export async function trackOf(root) {
  const parts = [], why = [];
  for (const p of ['kr', 'us']) {
    try { const l = await lensFrom(root, p, {made: new Date().toISOString()}); const codes = l.cand?.ready ? l.cand.items.map(x => String(x.code)) : []; if (codes.length) parts.push(`${p}:${codes.join(',')}`); else why.push(`${p}: 후보 없음(${l.cand?.why ?? '판 읽기 후보 준비 안 됨'})`); }
    catch (e) { why.push(`${p}: 판 읽기 멈춤 — ${e.message}`); }
  }
  return {arg: parts.join(';'), why};
}

export async function runRound({slot = 'hand', total = null, base = null, wantId = null} = {}) { // runId = 같은 날 같은 입력으로 손 회차를 또 돌릴 때만(기본 ID 가 이미 있으면 엔진이 멈춤 · 규칙 8)
  const startedAt = new Date().toISOString();
  // ⓪ 범위 띠를 낼 회사(첫 화면 둘러보기 「시뮬레이션 요약」 · 2026-10-10 2단계)
  const track = await trackOf(root);
  // ① 엔진 — 회차 ID 는 엔진이 서울 날짜 · slot · 두 입력 지문으로 만듦
  const eng = run('python3', ['scripts/atlas11/mc/fhs_crn.py', '--slot', slot, ...(wantId ? ['--run-id', wantId] : []), ...(total ? ['--total', String(total)] : []), ...(base ? ['--base', String(base)] : []),
    '--track', track.arg, '--track-from', 'lens.cand.items(회차 앞 판 읽기 · 판마다 후보 최대 7곳)'], 'engine');
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
    paths: rec.paths, time: rec.time, boards: Object.fromEntries(places.map(p => [p, {asOf: rec.boards[p].asOf, mc: lens[p].mc, elim: lens[p].elim, track: rec.track?.[p]?.codes ?? []}])), trackWhy: track.why,
    verify: checks.map(c => ({label: c.label, code: c.code, sec: c.sec, summary: c.json?.summary ?? null, out: c.json?.out ?? null, err: c.code === 0 ? null : c.err})),
    ok, published: false, note: '검사 수는 실제로 돈 검사만 셈(같은 비교를 되풀이해 채우지 않음) · 경로 수와 검사 수는 따로 셈'};
  const tmpL = path.join(root, dir, `.latest.${process.pid}.tmp`);
  await fs.writeFile(tmpL, JSON.stringify(summary, null, 1) + '\n'); await fs.rename(tmpL, path.join(root, dir, 'latest.json'));
  return summary;
}

if (process.argv[1] && path.resolve(process.argv[1]) === new URL(import.meta.url).pathname) {
  const s = await runRound({slot: arg('--slot', 'hand'), total: arg('--total') ? Number(arg('--total')) : null, base: arg('--base') ? Number(arg('--base')) : null, wantId: arg('--run-id')});
  console.log(JSON.stringify(s));
  process.exit(s.ok ? 0 : 1);
}
