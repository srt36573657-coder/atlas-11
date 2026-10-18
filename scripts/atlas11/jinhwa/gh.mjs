// 진화 회차 손발 — git · gh(깃허브 REST) · 망 · 시험 서버 · 바뀐 쪽 검사(사장님 2026-10-18(싱가포르) 16:39 [8] 2 · 7 · [9] 8)
//   셈은 lib.mjs · 순서는 round.mjs. 여기 것은 모두 「닫힌 쪽으로 실패」 — 못 읽으면 바쁨 · 실패로 돌려줌(넣지 않음)
//   깃허브 GraphQL 은 Claude 방에서 막힘 → gh run list · gh workflow run · gh api(REST)만 씀 · 사이트에 깃허브 열쇠 없음(상태는 열쇠 없는 읽기 주소)
import {spawn, spawnSync} from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import crypto from 'node:crypto';
import {pathToFileURL} from 'node:url';
import {REPO, SITE, LOCK_BRANCH, LOCK_STALE_MIN, DEPLOY_WORKFLOWS} from './lib.mjs';

export const sleepSync = ms => Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, Math.max(0, ms));
export const sleep = ms => new Promise(r => setTimeout(r, ms));
/** 명령 하나 — {ok, code, out, err} */
export function run(cmd, args, {cwd, timeout = 180e3, input, env} = {}) {
  const r = spawnSync(cmd, args, {cwd, encoding: 'utf8', timeout, input, maxBuffer: 256 << 20, env: {...process.env, GIT_TERMINAL_PROMPT: '0', ...env}});
  return {ok: r.status === 0, code: r.status ?? -1, out: String(r.stdout ?? '').replace(/\s+$/, ''), err: String(r.stderr ?? r.error?.message ?? '').trim()};
}
export const git = (cwd, args, o = {}) => run('git', ['-c', 'gc.auto=0', '-c', 'maintenance.auto=false', '-c', 'core.quotepath=false', ...args], {cwd, ...o});
export const gh = (cwd, args, o = {}) => run('gh', args, {cwd, ...o});
const short = (s, n = 160) => String(s ?? '').replace(/https?:\/\/\S+/g, '<주소>').replace(/\s+/g, ' ').slice(0, n);

// ───────────── 잠금(회차 하나씩) — 원격 가지 jinhwa-lock · 없을 때만 만들어짐(--force-with-lease=…:) ─────────────
export function lockTake(cwd, {by = 'jinhwa', now = new Date(), staleMin = LOCK_STALE_MIN, remote = 'origin'} = {}) {
  const tree = git(cwd, ['hash-object', '-t', 'tree', '-w', '--stdin'], {input: ''}).out;
  const c = git(cwd, ['commit-tree', tree, '-m', JSON.stringify({at: now.toISOString(), by})]);
  if (!c.ok) return {ok: false, why: '잠금 커밋을 못 만듦 ' + short(c.err)};
  const sha = c.out.trim();
  let r = git(cwd, ['push', '-q', `--force-with-lease=refs/heads/${LOCK_BRANCH}:`, remote, `${sha}:refs/heads/${LOCK_BRANCH}`]);
  if (r.ok) return {ok: true, sha};
  const old = git(cwd, ['ls-remote', remote, `refs/heads/${LOCK_BRANCH}`]).out.split(/\s+/)[0];
  if (!/^[0-9a-f]{40}$/.test(old || '')) return {ok: false, why: '잠금을 못 밂 ' + short(r.err)};
  git(cwd, ['fetch', '-q', '--no-tags', remote, `refs/heads/${LOCK_BRANCH}`]);
  let at = null; try { at = JSON.parse(git(cwd, ['log', '-1', '--format=%B', old]).out).at; } catch { /* 꼴 모름 = 묵은 것으로 봄 */ }
  const age = at ? (now - new Date(at)) / 60e3 : Infinity;
  if (age < staleMin) return {ok: false, busy: true, why: `다른 진화 회차가 돌고 있음 — ${Math.round(age)}분 전에 시작`};
  r = git(cwd, ['push', '-q', `--force-with-lease=refs/heads/${LOCK_BRANCH}:${old}`, remote, `${sha}:refs/heads/${LOCK_BRANCH}`]);
  return r.ok ? {ok: true, sha, stolen: old} : {ok: false, why: '묵은 잠금을 못 가져옴 ' + short(r.err)};
}
export function lockRelease(cwd, {sha, remote = 'origin'}) {
  const r = git(cwd, ['push', '-q', `--force-with-lease=refs/heads/${LOCK_BRANCH}:${sha}`, remote, `:refs/heads/${LOCK_BRANCH}`]);
  return {ok: r.ok, why: r.ok ? '' : short(r.err)};
}

// ───────────── 다른 올리기가 도나([8] 2 「다른 올리기가 돌고 있으면 끝날 때까지 기다려라」) ─────────────
/** 올리기 작업(atlas11-site · daily · evening — 같은 줄 atlas11-daily)의 끝나지 않은 실행 — 못 읽으면 ok false(바쁜 것으로 침) */
export function deploysRunning(cwd, {runner = gh} = {}) {
  const running = [];
  for (const wf of DEPLOY_WORKFLOWS) {
    const r = runner(cwd, ['run', 'list', '-R', REPO, '--workflow', wf, '--limit', '10', '--json', 'databaseId,status,createdAt']);
    if (!r.ok) return {ok: false, why: `${wf} 실행 목록을 못 읽음`, running};
    let rows; try { rows = JSON.parse(r.out || '[]'); } catch { return {ok: false, why: `${wf} 실행 목록 꼴`, running}; }
    for (const x of rows) if (x.status !== 'completed') running.push({wf, id: x.databaseId, status: x.status, created: x.createdAt});
  }
  return {ok: true, running};
}
/** 바쁘지 않을 때까지(최대 maxMin 분) — {clear, running, why} */
export async function waitDeploys(cwd, {maxMin = 8, every = 30, say = () => {}, runner} = {}) {
  const end = Date.now() + maxMin * 60e3;
  for (;;) {
    const r = deploysRunning(cwd, {runner});
    if (r.ok && !r.running.length) return {clear: true, running: []};
    say(r.ok ? `올리기가 돌고 있음 — ${r.running.map(x => `${x.wf} ${x.status}`).join(' · ')} · 기다림` : `${r.why} — 바쁜 것으로 보고 기다림`);
    if (Date.now() + every * 1000 > end) return {clear: false, running: r.running, why: r.ok ? '올리기가 아직 돎' : r.why};
    await sleep(every * 1000);
  }
}

// ───────────── 열쇠 없는 읽기(상태 · 합계) ─────────────
export async function fetchJson(url, {timeoutMs = 15000, tries = 3} = {}) {
  let last = '';
  for (let i = 0; i < tries; i++) {
    try {
      const r = await fetch(url, {signal: AbortSignal.timeout(timeoutMs), headers: {accept: 'application/json'}, cache: 'no-store'});
      if (r.ok) return {ok: true, json: await r.json()};
      last = 'HTTP ' + r.status; if (r.status === 404) break;
    } catch (e) { last = short(e?.cause?.code || e?.name || e?.message || e, 60); }
    await sleep(1500 * (i + 1));
  }
  return {ok: false, why: last};
}

// ───────────── 일 폴더(git worktree) · 바뀐 것 ─────────────
export function fetchMain(cwd) { return git(cwd, ['fetch', '-q', '--no-tags', 'origin', '+refs/heads/main:refs/remotes/origin/main'], {timeout: 300e3}); }
export function fetchBranch(cwd, b) { return git(cwd, ['fetch', '-q', '--no-tags', 'origin', `+refs/heads/${b}:refs/remotes/origin/${b}`], {timeout: 300e3}); }
export const revParse = (cwd, ref) => { const r = git(cwd, ['rev-parse', '--verify', '--quiet', ref + '^{commit}']); return r.ok ? r.out.trim() : null; };
export function worktreeAdd(cwd, dir, ref, {branch} = {}) {
  git(cwd, ['worktree', 'remove', '--force', dir]); fs.rmSync(dir, {recursive: true, force: true}); git(cwd, ['worktree', 'prune']);
  const r = git(cwd, ['worktree', 'add', '-q', ...(branch ? ['-B', branch] : ['--detach']), dir, ref], {timeout: 600e3});
  if (!r.ok) return {ok: false, why: '일 폴더를 못 만듦 ' + short(r.err)};
  const nm = path.join(cwd, 'node_modules'), to = path.join(dir, 'node_modules');
  if (fs.existsSync(nm) && !fs.existsSync(to)) { try { fs.symlinkSync(nm, to, 'dir'); } catch { /* 없어도 git 셈은 됨 */ } }
  return {ok: true};
}
export function worktreeRemove(cwd, dir) { git(cwd, ['worktree', 'remove', '--force', dir]); fs.rmSync(dir, {recursive: true, force: true}); git(cwd, ['worktree', 'prune']); }
/** base..head 바뀐 것 — {files: [{path, status}], numstat: [{path, add, del}], patch(-U0)} */
export function diffInfo(cwd, base, head) {
  const files = git(cwd, ['diff', '--no-renames', '--name-status', base, head]).out.split('\n').filter(Boolean).map(l => { const [st, ...p] = l.split('\t'); return {status: st[0], path: p.join('\t')}; });
  const numstat = git(cwd, ['diff', '--no-renames', '--numstat', base, head]).out.split('\n').filter(Boolean).map(l => { const [add, del, ...p] = l.split('\t'); return {add, del, path: p.join('\t')}; });
  const patch = git(cwd, ['diff', '--no-renames', '--no-color', '--no-ext-diff', '--binary', '-U0', base, head]).out;
  return {files, numstat, patch};
}

// ───────────── 본질 문(KA · scripts/atlas11/next/essence_check.mjs) — 없으면 실패(닫힌 쪽) ─────────────
/** 지킬 파일 맞대기 — essence_check.mjs --files a,b(KA protectedTouched) · 끝 코드 0 = 지남 */
export function essenceFiles(dir, files) {
  const f = path.join(dir, 'scripts/atlas11/next/essence_check.mjs');
  if (!fs.existsSync(f)) return {ok: false, why: '본질 문(essence_check.mjs)이 없음 — 넣지 않음'};
  const r = run('node', [f, '--files', files.join(',')], {cwd: dir, timeout: 120e3});
  return {ok: r.ok, why: r.ok ? '' : '본질 문이 막음 — ' + short(r.out.split('\n').slice(-3).join(' ') || r.err, 200)};
}
/** 본질 문 일곱 가지(그 폴더 그대로) — 끝 코드 0 = 지남 */
export function essenceFull(dir) {
  const f = path.join(dir, 'scripts/atlas11/next/essence_check.mjs');
  if (!fs.existsSync(f)) return {ok: false, why: '본질 문(essence_check.mjs)이 없음 — 넣지 않음'};
  const r = run('node', [f], {cwd: dir, timeout: 300e3});
  return {ok: r.ok, why: r.ok ? '' : '본질 문이 막음 — ' + short(r.out.split('\n').slice(-4).join(' ') || r.err, 240)};
}

// ───────────── 지금 사이트 자료(atlas/data) — 깃허브 검사와 같은 판(dist-manifest sha256) ─────────────
export async function liveData(siteDir, {base = SITE, budgetMs = 180e3, conc = 8} = {}) {
  const T0 = Date.now(), sha = b => crypto.createHash('sha256').update(b).digest('hex');
  const get = async (f, want) => {
    for (let i = 0; i < 5; i++) {
      if (Date.now() - T0 > budgetMs) throw Error('시간 넘음');
      try { const r = await fetch(`${base}/${f}`, {signal: AbortSignal.timeout(20000)}); if (r.ok) { const b = Buffer.from(await r.arrayBuffer()); if (!want || sha(b) === want) return b; } } catch { /* 다시 */ }
      await sleep(400 * (i + 1));
    }
    throw Error('못 받음 ' + f);
  };
  try {
    const man = JSON.parse((await get('dist-manifest.json')).toString('utf8'));
    const files = Object.keys(man.hashes ?? {}).filter(f => f.startsWith('atlas/data/')).sort();
    if (!files.includes('atlas/data/mkt.json')) throw Error('dist-manifest 에 atlas/data 가 없음');
    let i = 0;
    await Promise.all(Array.from({length: conc}, async () => { while (i < files.length) { const f = files[i++]; const b = await get(f, man.hashes[f]); const to = path.join(siteDir, f); fs.mkdirSync(path.dirname(to), {recursive: true}); fs.writeFileSync(to, b); } }));
    return {ok: true, files: files.length, seconds: Math.round((Date.now() - T0) / 1000)};
  } catch (e) { return {ok: false, why: short(e?.message ?? e, 100)}; }
}

// ───────────── 시험 서버(invite_dev) · 바뀐 쪽 검사(check_changed) ─────────────
export async function startDev(dir, {port = 8826, key} = {}) {
  const ownerKey = key || crypto.randomBytes(24).toString('base64url');
  const log = fs.openSync(path.join(os.tmpdir(), `jinhwa-dev-${port}.log`), 'w');
  const p = spawn('node', ['scripts/atlas11/invite_dev.mjs', '--dir', 'site', '--port', String(port), '--owner-key', ownerKey], {cwd: dir, stdio: ['ignore', log, log], detached: true});
  const base = `http://127.0.0.1:${port}`;
  for (let i = 0; i < 90; i++) {
    try { const a = await fetch(base + '/next/', {signal: AbortSignal.timeout(3000)}); const b = await fetch(base + '/atlas/data/core.json', {signal: AbortSignal.timeout(3000)}); if (a.ok && b.ok) return {ok: true, base, ownerKey, stop: () => { try { process.kill(-p.pid); } catch { try { p.kill(); } catch { /* 이미 끝남 */ } } }}; } catch { /* 아직 */ }
    if (p.exitCode != null) break;
    await sleep(1000);
  }
  try { process.kill(-p.pid); } catch { /* 이미 끝남 */ }
  return {ok: false, why: '시험 서버가 안 뜸(90초)'};
}
/** 바뀐 쪽 검사 — {ok, fails, tail} · 끝 코드 0 만 지남 */
export function changedCheck(dir, {since, files, base, ownerKey}) {
  const r = run('node', ['scripts/atlas11/next/check_changed.mjs', '--since', since, '--files', files.join(','), '--base', base], {cwd: dir, timeout: 40 * 60e3, env: {ATLAS_DEV_OWNER_KEY: ownerKey}});
  const m = /실패\s*(\d+)\s*$/m.exec(r.out);
  const fails = r.ok ? 0 : (m ? Number(m[1]) || 1 : 1);
  return {ok: r.ok, fails, tail: short(r.out.split('\n').slice(-6).join(' / ') + ' ' + r.err, 600)};
}

// ───────────── 모든 쪽 미리 검사(깃허브 atlas11-next-full.yml -f local=true) ─────────────
/** 가지를 밀고 검사를 시작 — {ok, run, branch, sha} · lease = 그 가지의 앞 커밋(없으면 새로 만듦만 · null 이면 강제) */
export function previewStart(cwd, {sha, branch, lease = undefined}) {
  const leaseArg = lease === undefined ? '--force' : `--force-with-lease=refs/heads/${branch}:${lease ?? ''}`;
  const p = git(cwd, ['push', '-q', leaseArg, 'origin', `${sha}:refs/heads/${branch}`], {timeout: 300e3});
  if (!p.ok) return {ok: false, why: '가지를 못 밂 ' + short(p.err)};
  const t0 = Date.now() - 10e3;
  const w = gh(cwd, ['workflow', 'run', 'atlas11-next-full.yml', '-R', REPO, '--ref', branch, '-f', 'local=true']);
  if (!w.ok) return {ok: false, why: '모든 쪽 검사를 못 시작함 ' + short(w.err)};
  let runId = null;
  for (let i = 0; i < 12 && !runId; i++) {
    sleepSync(5000);
    const l = gh(cwd, ['run', 'list', '-R', REPO, '--workflow', 'atlas11-next-full.yml', '--branch', branch, '--limit', '5', '--json', 'databaseId,headSha,createdAt']);
    try { runId = JSON.parse(l.out || '[]').find(x => x.headSha === sha && Date.parse(x.createdAt) >= t0)?.databaseId ?? null; } catch { /* 다시 */ }
  }
  return {ok: true, run: runId, branch, sha, at: new Date().toISOString()};
}
export function previewCancel(cwd, runId) { if (runId) gh(cwd, ['run', 'cancel', String(runId), '-R', REPO]); }
/** 결과 기다리기 — wait_preview.mjs(올리기 문과 같은 판정 · 코드 같음 + 모든 쪽 실패 0) · 진화 칸 자료(jinhwa.json · 그림)는 코드에서 뺌 */
export async function previewWait(cwd, {sha, head, maxMin = 8, every = 30, say = () => {}}) {
  const W = await import(pathToFileURL(path.join(cwd, 'scripts/atlas11/next/wait_preview.mjs')).href);
  const paths = [...W.CODE_PATHS, ':(exclude)site/next/data/jinhwa.json', ':(exclude)site/next/data/jinhwa'];
  try { return await W.waitPreview({sha, head, cwd, say, maxMin, every, depth: 80, remote: 'origin', branch: 'main', file: W.SUMMARY_FILE, paths, dry: false}); }
  catch (e) { return {code: 1, why: '기다리기 오류 ' + short(e?.message ?? e)}; }
}
export function deleteRemoteBranch(cwd, b) { return git(cwd, ['push', '-q', 'origin', '--delete', b]); }
