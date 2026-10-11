// 새 ATLAS 날마다 굴리기 — 사장님 2026-10-11 09:37 「기준일을 항상 현재 날짜에서 지난 20일 거래로 하라 지금은 7월 6일이 기준이잖아
//   이기준을 현재에서 지난 20일로 변경한다 항상 그렇게 하라」
//   올리기 묶음(scripts/atlas11/package.mjs)이 site/ 를 dist/ 로 옮긴 바로 뒤에 부른다 — 평일 16:00 · 19:00 예약 올리기와 손 올리기가 모두 이 길을 지남
//   (예약 작업 파일 atlas11-daily.yml · atlas11-evening.yml 은 고치지 않음 — 규칙 7)
//   ① 깃허브 실행기면(GITHUB_ACTIONS=true · ATLAS_T365_FETCH 가 0 이 아니면) 365곳 종가를 이어 받는다(closes_fetch.mjs → reports/atlas11/t365/closes/*.json.gz 새 파일)
//   ② 이어 받은 종가 파일이 있으면 dump.mjs(universe.json 의 모음 · 기준) → site_build.py(ATLAS_T365_CLOSES) 로 다시 셈 — 기준일 = 새 마지막 종가 날의 20거래일 전
//      (사장님 2026-10-11 11:43 대세 365곳(d365-v1) — 고를 때 표 = 지금 표라 한 번만 풂 · 365곳은 universe.json 이 가리키는 판 그대로)
//   ③ 따로 세기 site_verify.mjs 가 같은 종가로 다시 세어 틀림 0 이고 마지막 종가 날이 저장된 자료보다 뒤일 때만 dist/atlas/data 를 바꿈
//   무엇이든 멈추면 저장된 자료(site/atlas/data) 그대로 올림 — 올리기는 멈추지 않음 · 까닭은 결과에 그대로 적음(통과로 적지 않음)
//   결과: 깃허브 실행기에서는 reports/atlas11/t365/roll-latest.json(덮어씀) + roll-log.jsonl(한 줄씩 더함) — 올리기 뒤 기록 커밋에 실림
import fs from 'node:fs/promises';
import fss from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {spawnSync} from 'node:child_process';

const ACT = JSON.parse(fss.readFileSync(new URL('./universe.json', import.meta.url), 'utf8'));
export const BUNDLE_NOW = [ACT.bundle, ACT.asOf]; // 고를 때 · 회사 이름 · 몸값 · 결산(모음 날 값) — 대세 365곳은 이 표로 고름

async function copyAll(from, to) {
  await fs.mkdir(to, {recursive: true});
  for (const e of await fs.readdir(from, {withFileTypes: true})) {
    const a = path.join(from, e.name), b = path.join(to, e.name);
    if (e.isDirectory()) await copyAll(a, b); else await fs.copyFile(a, b);
  }
}

export async function rollAtlas({root, dist, log = console.log, closesDir = null} = {}) {
  const ci = process.env.GITHUB_ACTIONS === 'true';
  const closes = closesDir ?? path.join(root, 'reports/atlas11/t365/closes');
  const rep = {schema: 'atlas-t365-roll-1', at: new Date().toISOString(), ci, fetch: null, files: 0, used: 'static', asOf: null, base: null, roll: null, provisional: null, build: null, verify: null, why: null};
  const tail = s => String(s ?? '').trim().split('\n').slice(-2).join(' | ').slice(0, 500);
  const run = (cmd, args, env = {}, timeout = 300000) => spawnSync(cmd, args, {cwd: root, env: {...process.env, ...env}, encoding: 'utf8', timeout, maxBuffer: 256 << 20});
  let tmp = null;
  try {
    if (ci && process.env.ATLAS_T365_FETCH !== '0' && !closesDir) {
      const r = run('node', ['scripts/atlas11/t365/closes_fetch.mjs'], {}, 420000);
      rep.fetch = {code: r.status, out: tail(r.stdout), err: tail(r.stderr)};
    }
    const files = fss.existsSync(closes) ? (await fs.readdir(closes)).filter(f => f.endsWith('.json.gz')) : [];
    rep.files = files.length;
    if (!files.length) { rep.why = '이어 받은 종가 파일 없음 — 저장된 자료 그대로'; return await done(); }
    tmp = await fs.mkdtemp(path.join(os.tmpdir(), 'atlas-roll-'));
    const now = path.join(tmp, 'now.json'), out = path.join(tmp, 'data');
    { const r = run('node', ['scripts/atlas11/t365/dump.mjs', BUNDLE_NOW[0], now, BUNDLE_NOW[1]]);
      if (r.status !== 0) throw Error('dump.mjs 멈춤: ' + tail(r.stderr || r.stdout)); }
    const env = {ATLAS_T365_CLOSES: closes};
    const bld = run('python3', ['scripts/atlas11/t365/site_build.py', now, out], env);
    rep.build = tail(bld.stdout || bld.stderr);
    if (bld.status !== 0) throw Error('site_build.py 멈춤: ' + tail(bld.stderr || bld.stdout));
    const ver = run('node', ['scripts/atlas11/t365/site_verify.mjs', out, path.join(tmp, 'verify.json')], env);
    rep.verify = tail(ver.stdout || ver.stderr);
    if (ver.status !== 0) throw Error('따로 세기에 틀림 있음 — 저장된 자료 그대로: ' + tail(ver.stdout || ver.stderr));
    const core = JSON.parse(await fs.readFile(path.join(out, 'core.json'), 'utf8'));
    const old = JSON.parse(await fs.readFile(path.join(dist, 'atlas/data/core.json'), 'utf8'));
    Object.assign(rep, {asOf: core.asOf, base: core.base, roll: core.roll, provisional: core.provisional});
    if (!(core.asOf > old.asOf)) { rep.why = `새 거래일 없음(마지막 종가 ${core.asOf} · 저장된 자료 ${old.asOf}) — 저장된 자료 그대로`; return await done(); }
    // 옮겨 놓고 한 번에 바꿈(반쯤 바뀐 자료가 올라가지 않게) — site_build 가 만들지 않는 파일(pick36.json)은 저장된 것 그대로
    const target = path.join(dist, 'atlas/data'), stage = target + '.roll';
    await fs.rm(stage, {recursive: true, force: true});
    await copyAll(target, stage); await copyAll(out, stage);
    await fs.rm(target, {recursive: true, force: true}); await fs.rename(stage, target);
    rep.used = 'rolled';
    return await done();
  } catch (e) { rep.why = String(e?.message ?? e).slice(0, 500); return await done(); }
  async function done() { // 기록을 못 남겨도 올리기는 멈추지 않음
    if (tmp) await fs.rm(tmp, {recursive: true, force: true}).catch(() => {});
    if (ci && !closesDir) {
      try {
        const dir = path.join(root, 'reports/atlas11/t365');
        await fs.mkdir(dir, {recursive: true});
        await fs.writeFile(path.join(dir, 'roll-latest.json'), JSON.stringify(rep, null, 1) + '\n');
        await fs.appendFile(path.join(dir, 'roll-log.jsonl'), JSON.stringify(rep) + '\n');
      } catch (e) { rep.why = (rep.why ? rep.why + ' · ' : '') + '굴리기 기록을 못 남김: ' + String(e?.message ?? e).slice(0, 120); }
    }
    try { log(`atlas roll: ${rep.used} · 마지막 종가 ${rep.asOf ?? '-'} · 기준일 ${rep.base ?? '-'} · 종가 파일 ${rep.files} · ${rep.why ?? '바꿈'}`); } catch { /* 로그 실패도 무시 */ }
    return rep;
  }
}
