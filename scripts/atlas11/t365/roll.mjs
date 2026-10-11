// 새 ATLAS 회차(하루 4번) — 사장님 2026-10-11 09:37 「기준일을 항상 현재 날짜에서 지난 20일 거래로 하라 … 항상 그렇게 하라」
//   12:41 「아니 내일이면 내일 다시 그다음날도 다시 기준은 항상 오늘날짜로 해야 하고 업데이트는 하루에 4번 해야 하고 업데이트 탭 만들어서 기록해놓아라」
//   올리기 묶음(scripts/atlas11/package.mjs)이 site/ 를 dist/ 로 옮긴 바로 뒤에 부른다 — 하루 4번(08:10 · 12:10 · 16:10 · 21:10 서울 · Claude 예약 작업이 「aaa7377.com 올리기」를 누름) ·
//   평일 16:47 · 19:00 예약 올리기 · 손 올리기가 모두 이 길을 지남(예약 작업 파일 atlas11-daily.yml · atlas11-evening.yml 은 고치지 않음 — 규칙 7)
//   ① 깃허브 실행기면 후보 1,378곳 일봉(종가 · 거래량)을 이어 받는다(closes_fetch.mjs → 임시 폴더 · 모음 뒤 날을 한 번에 받으므로 지난 파일이 필요 없음)
//   ② dump.mjs → daese.py --closes(그날까지 값으로 365곳을 다시 고름 · d365-v2) → organize.mjs → daese_verify.mjs(노드로 따로 · 틀림 0)
//   ③ site_build.py(ATLAS_T365_CLOSES · ATLAS_D365_DIR) → site_verify.mjs(틀림 0) → pick36.py(같은 값이면 지금 사이트의 36곳을 그대로 씀) → pick36_verify.mjs(틀림 0)
//   ④ 모두 통과하면 dist/atlas/data 를 바꿈 · 하나라도 멈추면 지금 사이트(aaa7377.com)의 자료를 그대로 받아 올림(옛 바탕으로 돌아가지 않게) · 그것도 못 하면 저장소 바탕 그대로
//   ⑤ 회차 기록: reports/atlas11/t365/updates/<받은 때 UTC>.json(새 파일 · 지우지 않음) + 화면 「업데이트」 탭 자료 dist/atlas/data/updates.json(마지막 60회차)
//   결과는 통과로 꾸미지 않음 — 「바꿈」 · 「그대로」(새 값 없음) · 「실패」(까닭) 가운데 하나
import fs from 'node:fs/promises';
import fss from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import crypto from 'node:crypto';
import {spawnSync} from 'node:child_process';

const ACT = JSON.parse(fss.readFileSync(new URL('./universe.json', import.meta.url), 'utf8'));
export const BUNDLE_NOW = [ACT.bundle, ACT.asOf]; // 고를 때 · 회사 이름 · 몸값 · 결산(모음 날 값)
export const UPDATES_DIR = 'reports/atlas11/t365/updates';
const SITE = process.env.ATLAS_SITE_URL || 'https://aaa7377.com';
const DATA_FILES = ['core.json', 'comp.json', 'lines.json', 'names.json', 'days.json', 'pick36.json'];
const OPT_FILES = ['time.json']; // 봉인 시간 자료(14:37 · 14:39 「3년후 5년후 10년후 이야기」) — 올리기 전 사이트엔 없을 수 있음 · 못 받으면 지금 묶음의 것을 그대로

async function copyAll(from, to) {
  await fs.mkdir(to, {recursive: true});
  for (const e of await fs.readdir(from, {withFileTypes: true})) {
    const a = path.join(from, e.name), b = path.join(to, e.name);
    if (e.isDirectory()) await copyAll(a, b); else await fs.copyFile(a, b);
  }
}
const kstOf = d => new Date(d.getTime() + 9 * 36e5).toISOString().replace('T', ' ').slice(0, 16); // 2026-10-12 16:10
/** 하루 4번 회차 이름(08:10 …) — 그 시각 5분 앞 ~ 50분 뒤에 시작했으면 그 회차 · 아니면 null(종가 올리기 · 손 올리기 등)
 *  (2026-10-11 15:52 손 올리기가 20분 앞이라 「16:10 회차」로 적힌 일 — 그 기록은 그대로 두고 창을 5분 앞으로 좁힘) */
export const slotOf = kst => { const m = +kst.slice(11, 13) * 60 + +kst.slice(14, 16); const s = (ACT.slots ?? []).map(x => [x, +x.slice(0, 2) * 60 + +x.slice(3, 5)]).find(([, t]) => m >= t - 5 && m <= t + 50); return s ? s[0] : null; };

/** 지난 회차 기록(새 파일만 쌓임) — 이름 차례 */
export function readRecords(root) {
  const dir = path.join(root, UPDATES_DIR);
  if (!fss.existsSync(dir)) return [];
  return fss.readdirSync(dir).filter(f => /^\d{8}T\d{6}Z\.json$/.test(f)).sort().map(f => { try { return JSON.parse(fss.readFileSync(path.join(dir, f), 'utf8')); } catch { return null; } }).filter(Boolean);
}
/** 화면 「업데이트」 탭 자료 — 새 회차가 위 · 365곳 목록은 빼고 들고 난 이름만 */
export function tabData(records) {
  const rows = records.slice(-60).reverse().map(r => ({at: r.at, kst: r.kst, slot: r.slot, reason: r.reason || null, result: r.result, why: r.why || null,
    asOf: r.asOf, base: r.base, provisional: r.provisional, version: r.version, in: r.in ?? [], out: r.out ?? [], tiers: r.tiers ?? null, all: r.all ?? null, top: r.top ?? null,
    pick36: r.pick36 ? {first: r.pick36.first, reused: r.pick36.reused, test: r.pick36.test} : null, served: r.served}));
  return {schema: 'atlas-new-updates-1', made: new Date().toISOString(), slots: ACT.slots ?? [], n: records.length, records: rows};
}
async function getLive(file) { // 지금 사이트의 자료 한 벌(회차가 막혔을 때 옛 바탕으로 돌아가지 않게)
  const ac = new AbortController(), t = setTimeout(() => ac.abort(), 20000);
  try { const r = await fetch(`${SITE}/atlas/data/${file}`, {signal: ac.signal, headers: {'cache-control': 'no-cache'}}); if (!r.ok) throw Error(`${file} ${r.status}`); return Buffer.from(await r.arrayBuffer()); } finally { clearTimeout(t); }
}
async function mirrorLive(target) {
  const stage = target + '.live';
  await fs.rm(stage, {recursive: true, force: true}); await fs.mkdir(path.join(stage, 'co'), {recursive: true});
  for (const f of DATA_FILES) await fs.writeFile(path.join(stage, f), await getLive(f));
  for (const f of OPT_FILES) { try { await fs.writeFile(path.join(stage, f), await getLive(f)); } catch { try { await fs.copyFile(path.join(target, f), path.join(stage, f)); } catch { /* 없으면 없음 */ } } }
  const comp = JSON.parse(await fs.readFile(path.join(stage, 'comp.json'), 'utf8')).companies, codes = Object.keys(comp);
  let next = 0; const work = async () => { while (next < codes.length) { const c = codes[next++]; await fs.writeFile(path.join(stage, 'co', c + '.json'), await getLive(`co/${c}.json`)); } };
  await Promise.all([work(), work(), work(), work(), work(), work()]);
  await fs.rm(target, {recursive: true, force: true}); await fs.rename(stage, target);
}

export async function rollAtlas({root, dist, log = console.log, closesDir = null, recordDir = undefined, reason = process.env.ATLAS_UPDATE_REASON || '', liveFallback = undefined, now = new Date(), pick36Quick = false} = {}) {
  const ci = process.env.GITHUB_ACTIONS === 'true';
  const recDir = recordDir === undefined ? (ci && !closesDir ? path.join(root, UPDATES_DIR) : null) : recordDir;
  const useLive = liveFallback === undefined ? (ci && !closesDir) : liveFallback;
  const kst = kstOf(now);
  const rep = {schema: 'atlas-t365-update-1', at: now.toISOString(), kst, slot: slotOf(kst), reason, ci, version: ACT.version, result: null, served: 'stored', why: null,
    fetch: null, asOf: null, base: null, provisional: null, roll: null, digest: null, members: null, in: null, out: null, counts: null, tiers: null, all: null, top: null, pick36: null, verify: {}, steps: []};
  const tail = s => String(s ?? '').trim().split('\n').slice(-2).join(' | ').slice(0, 500);
  const run = (name, cmd, args, env = {}, timeout = 600000) => {
    const t0 = Date.now(), r = spawnSync(cmd, args, {cwd: root, env: {...process.env, ...env}, encoding: 'utf8', timeout, maxBuffer: 256 << 20});
    rep.steps.push({name, code: r.status, sec: Math.round((Date.now() - t0) / 100) / 10});
    if (r.status !== 0) throw Error(`${name} 멈춤: ` + tail(r.stderr || r.stdout || r.error?.message));
    return r;
  };
  const target = path.join(dist, 'atlas/data');
  const prevAll = readRecords(root), prev = [...prevAll].reverse().find(r => r.members?.length && r.result !== '실패') ?? null;
  let tmp = null;
  try {
    tmp = await fs.mkdtemp(path.join(os.tmpdir(), 'atlas-roll-'));
    let closes = closesDir;
    if (!closes && ci && process.env.ATLAS_T365_FETCH !== '0') {
      closes = path.join(tmp, 'closes');
      const t0 = Date.now(), r = spawnSync('node', ['scripts/atlas11/t365/closes_fetch.mjs', '--out', closes], {cwd: root, encoding: 'utf8', timeout: 540000, maxBuffer: 64 << 20});
      rep.steps.push({name: '일봉 받기', code: r.status, sec: Math.round((Date.now() - t0) / 100) / 10});
      try { rep.fetch = JSON.parse(String(r.stdout).trim().split('\n').at(-1)); } catch { rep.fetch = {code: r.status, err: tail(r.stderr)}; }
      if (r.status !== 0) throw Error('일봉을 한 곳도 못 받음: ' + tail(r.stderr || r.stdout));
    }
    if (!closes || !fss.existsSync(closes) || !fss.readdirSync(closes).some(f => f.endsWith('.json.gz'))) { rep.result = '그대로'; rep.why = '이어 받은 일봉 없음 — 저장된 자료 그대로'; return await done(); }
    const env = {ATLAS_T365_CLOSES: closes};
    const now0 = path.join(tmp, 'now.json'), upd = path.join(tmp, 'd365'), out = path.join(tmp, 'data');
    run('후보 표', 'node', ['scripts/atlas11/t365/dump.mjs', BUNDLE_NOW[0], now0, BUNDLE_NOW[1]]);
    await fs.mkdir(upd, {recursive: true});
    run('365곳 다시 고르기', 'python3', ['scripts/atlas11/t365/daese.py', now0, upd, '--closes', closes]);
    run('업종 정리', 'node', ['scripts/atlas11/t365/organize.mjs', now0, path.join(upd, 'proposal.json'), upd]);
    const dv = run('고르기 따로 세기', 'node', ['scripts/atlas11/t365/daese_verify.mjs', now0, path.join(upd, 'proposal.json'), path.join(tmp, 'dv.json')], env);
    rep.verify.daese = tail(dv.stdout);
    const env2 = {...env, ATLAS_D365_DIR: upd};
    run('사이트 자료', 'python3', ['scripts/atlas11/t365/site_build.py', now0, out], env2);
    const sv = run('사이트 자료 따로 세기', 'node', ['scripts/atlas11/t365/site_verify.mjs', out, path.join(tmp, 'sv.json')], env2);
    rep.verify.site = tail(sv.stdout);
    // 36곳 — 같은 회사 · 같은 값이면 지금 사이트의 36곳을 그대로(셈 시간 아낌 · pick36.py 가 판단) · numpy 가 없으면 깃허브 실행기에서 한 번 깔아 봄
    if (ci && spawnSync('python3', ['-c', 'import numpy'], {encoding: 'utf8'}).status !== 0) spawnSync('python3', ['-m', 'pip', 'install', '--user', '--break-system-packages', '-q', 'numpy'], {encoding: 'utf8', timeout: 240000});
    const p36args = ['scripts/atlas11/t365/pick36.py', '--out', out, '--no-record', ...(pick36Quick ? ['--quick'] : [])]; // 빠른 셈은 시험에서만
    if (useLive) { try { await fs.writeFile(path.join(tmp, 'pick36-live.json'), await getLive('pick36.json')); p36args.push('--reuse', path.join(tmp, 'pick36-live.json')); } catch { /* 없으면 새로 셈 */ } }
    const p36 = run('36곳 셈', 'python3', p36args, env2, 900000);
    const pv = run('36곳 따로 세기', 'node', ['scripts/atlas11/t365/pick36_verify.mjs', path.join(out, 'pick36.json'), path.join(tmp, 'pv.json'), ...(pick36Quick ? ['--allow-quick'] : [])], env2);
    rep.verify.pick36 = tail(pv.stdout);
    // 회차 기록 — 고른 날 · 기준일 · 365곳 · 들고 난 곳 · 층 · 1등 갈래
    const pro = JSON.parse(await fs.readFile(path.join(upd, 'proposal.json'), 'utf8'));
    const core = JSON.parse(await fs.readFile(path.join(out, 'core.json'), 'utf8'));
    const pk = JSON.parse(await fs.readFile(path.join(out, 'pick36.json'), 'utf8'));
    const members = pro.picked.map(p => p.code), names = Object.fromEntries([...pro.picked, ...pro.outside].map(x => [x.code, x.name]));
    const before = prev?.members ?? Object.keys(JSON.parse(await fs.readFile(path.join(target, 'comp.json'), 'utf8')).companies);
    const bset = new Set(before), mset = new Set(members);
    Object.assign(rep, {asOf: core.asOf, base: core.base, provisional: core.provisional, roll: core.roll, members,
      in: members.filter(c => !bset.has(c)).map(c => ({c, n: names[c]})), out: before.filter(c => !mset.has(c)).map(c => ({c, n: names[c] ?? c})),
      counts: {gate: pro.counts.gate, ranked: pro.counts.rankedCompanies, picked: pro.counts.picked}, tiers: [pro.counts.tier1, pro.counts.tier2, pro.counts.tier3],
      all: {chg: core.all.chg, up: core.all.up, down: core.all.down}, top: {short: core.groups[0]?.short, chg: core.groups[0]?.chg},
      pick36: {first: pk.picks.slice(0, 3).map(p => p.name), reused: /reused/.test(p36.stdout), test: pk.backtest ? {n: pk.backtest.n, wins: pk.backtest.wins} : null}});
    // 값 지문 — 고른 날 · 이어 붙인 값 수 · 365곳 · 365곳 지수 · 아직 바뀜 여부 · 같으면 「그대로」(새 값 없음)
    rep.digest = crypto.createHash('sha256').update(JSON.stringify([pro.asOf, pro.from?.closes?.added, members, core.all.v, core.provisional])).digest('hex').slice(0, 16);
    rep.result = prev && prev.digest === rep.digest ? '그대로' : '바꿈';
    if (rep.result === '그대로') rep.why = '새 값 없음 — 앞 회차와 같은 값으로 다시 만듦';
    // 옮겨 놓고 한 번에 바꿈(반쯤 바뀐 자료가 올라가지 않게)
    const stage = target + '.roll';
    await fs.rm(stage, {recursive: true, force: true});
    await copyAll(out, stage);
    await fs.rm(target, {recursive: true, force: true}); await fs.rename(stage, target);
    rep.served = 'rolled';
    return await done();
  } catch (e) {
    rep.result = '실패'; rep.why = String(e?.message ?? e).slice(0, 500);
    if (useLive) { try { await mirrorLive(target); rep.served = 'live'; rep.why += ' — 지금 사이트 자료 그대로 다시 올림'; } catch (e2) { rep.why += ' — 지금 사이트 자료도 못 받아 저장소 바탕 그대로: ' + String(e2?.message ?? e2).slice(0, 120); } }
    return await done();
  }
  async function done() { // 기록을 못 남겨도 올리기는 멈추지 않음
    if (tmp) await fs.rm(tmp, {recursive: true, force: true}).catch(() => {});
    try { // 「업데이트」 탭 자료 — 이번 회차까지
      await fs.mkdir(target, {recursive: true});
      await fs.writeFile(path.join(target, 'updates.json'), JSON.stringify(tabData([...prevAll, rep])) + '\n');
    } catch (e) { rep.why = (rep.why ? rep.why + ' · ' : '') + '업데이트 탭 자료를 못 씀: ' + String(e?.message ?? e).slice(0, 120); }
    if (recDir) {
      try {
        await fs.mkdir(recDir, {recursive: true});
        const name = rep.at.replace(/[-:]/g, '').replace(/\.\d+Z$/, 'Z') + '.json';
        await fs.writeFile(path.join(recDir, name), JSON.stringify(rep, null, 1) + '\n', {flag: 'wx'});
        const dir = path.dirname(recDir); // 깃허브 실행기 = reports/atlas11/t365 · 시험 = 임시 폴더(저장소 기록을 건드리지 않음)
        await fs.writeFile(path.join(dir, 'roll-latest.json'), JSON.stringify({...rep, members: undefined}, null, 1) + '\n');
        await fs.appendFile(path.join(dir, 'roll-log.jsonl'), JSON.stringify({at: rep.at, kst: rep.kst, slot: rep.slot, result: rep.result, served: rep.served, asOf: rep.asOf, base: rep.base, in: rep.in?.length ?? null, out: rep.out?.length ?? null, why: rep.why}) + '\n');
      } catch (e) { rep.why = (rep.why ? rep.why + ' · ' : '') + '회차 기록을 못 남김: ' + String(e?.message ?? e).slice(0, 120); }
    }
    try { log(`atlas 회차: ${rep.result} · ${rep.kst}(${rep.slot ?? '회차 밖'}) · 고른 날 ${rep.asOf ?? '-'} · 기준일 ${rep.base ?? '-'} · 들어옴 ${rep.in?.length ?? '-'} · 빠짐 ${rep.out?.length ?? '-'} · ${rep.why ?? ''}`); } catch { /* 로그 실패도 무시 */ }
    return rep;
  }
}
