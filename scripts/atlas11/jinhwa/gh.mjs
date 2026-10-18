// 진화 회차 손발 — git · gh(깃허브 REST) · 망 · 시험 서버 · 바뀐 쪽 검사(사장님 2026-10-18(싱가포르) 16:39 [8] 2 · 7 · [9] 8)
//   셈은 lib.mjs · 차례는 round.mjs. 여기 것은 모두 「닫힌 쪽으로 실패」 — 못 읽으면 바쁨 · 실패로 돌려줌(넣지 않음)
//   깃허브 GraphQL 은 Claude 방에서 막힘 → gh run list · gh workflow run · gh api(REST)만 씀 · 사이트에 깃허브 열쇠 없음(상태는 열쇠 없는 읽기 주소)
//   밀어 넣기: main 은 앞으로만(강제 없음 · 밀어 넣기 문 hooks 그대로) · 회차가 쓰는 가지(jinhwa/ · jinhwa-try/ · jinhwa-fix/ · jinhwa-lock)는 --no-verify(문은 main 을 지킴)
import {spawn, spawnSync} from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import crypto from 'node:crypto';
import {pathToFileURL} from 'node:url';
import {REPO, SITE, LOCK_BRANCH, LOCK_STALE_MIN, DEPLOY_WORKFLOWS, DATA_FILE, IMG_DIR} from './lib.mjs';

export const sleepSync = ms => Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, Math.max(0, ms));
export const sleep = ms => new Promise(r => setTimeout(r, ms));
/** 명령 하나 — {ok, code, out, err} */
export function run(cmd, args, {cwd, timeout = 180e3, input, env} = {}) {
  const r = spawnSync(cmd, args, {cwd, encoding: 'utf8', timeout, input, maxBuffer: 256 << 20, env: {...process.env, GIT_TERMINAL_PROMPT: '0', ...env}});
  return {ok: r.status === 0, code: r.status ?? -1, out: String(r.stdout ?? '').replace(/\s+$/, ''), err: String(r.stderr ?? r.error?.message ?? '').trim()};
}
const ID_ENV = {GIT_AUTHOR_NAME: 'Claude', GIT_AUTHOR_EMAIL: 'noreply@anthropic.com', GIT_COMMITTER_NAME: 'Claude', GIT_COMMITTER_EMAIL: 'noreply@anthropic.com'};
export const git = (cwd, args, o = {}) => run('git', ['-c', 'gc.auto=0', '-c', 'maintenance.auto=false', '-c', 'core.quotepath=false', ...args], {cwd, ...o, env: {...ID_ENV, ...(o.env ?? {})}});
export const gh = (cwd, args, o = {}) => run('gh', args, {cwd, ...o});
export const short = (s, n = 160) => String(s ?? '').replace(/https?:\/\/\S+/g, '<주소>').replace(/\s+/g, ' ').slice(0, n);
/** 진화 칸 자료는 코드 맞대기에서 뺌(기록 단계가 씀 · 코드가 아님) — wait_preview CODE_PATHS 와 함께 씀 */
export const DATA_EXCLUDES = Object.freeze([`:(exclude)${DATA_FILE}`, `:(exclude)${IMG_DIR}`]);

// ───────────── 잠금(회차 하나씩) — 원격 가지 jinhwa-lock · 없을 때만 만들어짐(--force-with-lease=…:) ─────────────
export function lockTake(cwd, {by = 'jinhwa', now = new Date(), staleMin = LOCK_STALE_MIN, remote = 'origin'} = {}) {
  const tree = git(cwd, ['hash-object', '-t', 'tree', '-w', '--stdin'], {input: ''}).out;
  // 잠금 커밋마다 다른 값(nonce) — 같은 초 · 같은 글이면 같은 커밋이 되어 둘째 밀기가 「이미 같음」으로 지나가 버림(자기 시험 E2 가 잡음)
  const c = git(cwd, ['commit-tree', tree, '-m', JSON.stringify({at: now.toISOString(), by, nonce: crypto.randomBytes(8).toString('hex'), pid: process.pid})]);
  if (!c.ok) return {ok: false, why: '잠금 커밋을 못 만듦 ' + short(c.err)};
  const sha = c.out.trim();
  const mine = () => git(cwd, ['ls-remote', remote, `refs/heads/${LOCK_BRANCH}`]).out.split(/\s+/)[0] === sha; // 밀린 뒤 원격이 내 잠금인지 다시 읽어 봄
  let r = git(cwd, ['push', '-q', '--no-verify', `--force-with-lease=refs/heads/${LOCK_BRANCH}:`, remote, `${sha}:refs/heads/${LOCK_BRANCH}`]);
  if (r.ok && mine()) return {ok: true, sha};
  const old = git(cwd, ['ls-remote', remote, `refs/heads/${LOCK_BRANCH}`]).out.split(/\s+/)[0];
  if (!/^[0-9a-f]{40}$/.test(old || '')) return {ok: false, why: '잠금을 못 밂 ' + short(r.err)};
  git(cwd, ['fetch', '-q', '--no-tags', remote, `refs/heads/${LOCK_BRANCH}`]);
  let at = null; try { at = JSON.parse(git(cwd, ['log', '-1', '--format=%B', old]).out).at; } catch { /* 꼴 모름 = 묵은 것으로 봄 */ }
  const age = at ? (now - new Date(at)) / 60e3 : Infinity;
  if (age < staleMin) return {ok: false, busy: true, why: `다른 진화 회차가 돌고 있음 — ${Math.round(age)}분 전에 시작`};
  r = git(cwd, ['push', '-q', '--no-verify', `--force-with-lease=refs/heads/${LOCK_BRANCH}:${old}`, remote, `${sha}:refs/heads/${LOCK_BRANCH}`]);
  return r.ok && mine() ? {ok: true, sha, stolen: old} : {ok: false, busy: true, why: '묵은 잠금을 못 가져옴 ' + short(r.err)};
}
export function lockRelease(cwd, {sha, remote = 'origin'}) {
  const r = git(cwd, ['push', '-q', '--no-verify', `--force-with-lease=refs/heads/${LOCK_BRANCH}:${sha}`, remote, `:refs/heads/${LOCK_BRANCH}`]);
  return {ok: r.ok, why: r.ok ? '' : short(r.err)};
}

// ───────────── 다른 올리기가 도나([8] 2 「다른 올리기가 돌고 있으면 끝날 때까지 기다려라」) ─────────────
/** 올리기 작업(atlas11-site · daily · evening)의 끝나지 않은 실행 — 못 읽으면 ok false(바쁜 것으로 침) */
export function deploysRunning(cwd, {runner = gh} = {}) {
  const running = [];
  for (const wf of DEPLOY_WORKFLOWS) {
    const r = runner(cwd, ['run', 'list', '-R', REPO, '--workflow', wf, '--limit', '10', '--json', 'databaseId,status,createdAt']);
    if (!r.ok) return {ok: false, why: `${wf} 실행 목록을 못 읽음`, running};
    let rows; try { rows = JSON.parse(r.out || '[]'); } catch { return {ok: false, why: `${wf} 실행 목록 꼴`, running}; }
    if (!Array.isArray(rows)) return {ok: false, why: `${wf} 실행 목록 꼴`, running};
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
/** curl 로 JSON 하나(길잡이 proxy 를 따름 — 노드 fetch 는 HTTPS_PROXY 를 안 봄) — {ok, http, json, why, blocked(닿지 못함)} */
export function curlJson(url, {timeoutS = 20} = {}) {
  const r = run('curl', ['-sS', '-m', String(timeoutS), '--retry', '2', '--retry-delay', '2', '-H', 'accept: application/json', '-w', '\n%{http_code}', url], {timeout: (timeoutS * 3 + 10) * 1000});
  const lines = r.out.split('\n'), http = Number(lines.pop()) || 0, body = lines.join('\n');
  if (http === 200) { try { return {ok: true, http, json: JSON.parse(body)}; } catch { return {ok: false, http, why: '글이 JSON 이 아님'}; } }
  return {ok: false, http, blocked: http === 0, why: http ? 'HTTP ' + http : short(r.err || '닿지 못함', 80)};
}
export const READ_WORKFLOW = 'atlas11-jinhwa-read.yml';
/** 깃허브 작업으로 읽기(이 방의 바깥 길이 aaa7377.com 을 막을 때) — 작업이 main 에 있어야 함 · {ok, status, tally, run, why} */
export async function readViaActions(cwd, {days = 200, maxMin = 5, say = () => {}} = {}) {
  if (!git(cwd, ['cat-file', '-e', `origin/main:.github/workflows/${READ_WORKFLOW}`]).ok) return {ok: false, why: `읽기 작업(${READ_WORKFLOW})이 main 에 없음`};
  const t0 = Date.now() - 15e3;
  const w = gh(cwd, ['workflow', 'run', READ_WORKFLOW, '-R', REPO, '--ref', 'main', '-f', `days=${days}`]);
  if (!w.ok) return {ok: false, why: '읽기 작업을 못 시작함 ' + short(w.err)};
  say('열쇠 없는 읽기 — 깃허브 작업으로');
  let id = null;
  for (let i = 0; i < 24 && !id; i++) {
    await sleep(5000);
    const l = gh(cwd, ['run', 'list', '-R', REPO, '--workflow', READ_WORKFLOW, '--limit', '5', '--json', 'databaseId,createdAt']);
    try { id = JSON.parse(l.out || '[]').filter(x => Date.parse(x.createdAt) >= t0).sort((a, b) => Date.parse(a.createdAt) - Date.parse(b.createdAt))[0]?.databaseId ?? null; } catch { /* 다시 */ }
  }
  if (!id) return {ok: false, why: '읽기 작업 실행을 못 찾음'};
  const wch = gh(cwd, ['run', 'watch', String(id), '-R', REPO, '--exit-status', '--interval', '10'], {timeout: maxMin * 60e3});
  if (!wch.ok) return {ok: false, run: id, why: '읽기 작업이 끝나지 못함'};
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'jinhwa-read-'));
  try {
    const dl = gh(cwd, ['run', 'download', String(id), '-R', REPO, '-n', 'jinhwa-read', '-D', dir]);
    if (!dl.ok) return {ok: false, run: id, why: '읽은 것을 못 받음 ' + short(dl.err)};
    const j = JSON.parse(fs.readFileSync(path.join(dir, 'jinhwa-read.json'), 'utf8'));
    if (j?.schema !== 'kkolttori-jinhwa-read-1' || !(Date.parse(j.at) >= t0)) return {ok: false, run: id, why: '읽은 것 꼴 · 때가 맞지 않음'};
    return {ok: true, via: 'actions', run: id, status: j.status?.ok ? j.status.json : null, tally: j.tally?.ok ? j.tally.json : null, why: [j.status?.ok ? '' : '상태 ' + j.status?.why, j.tally?.ok ? '' : '합계 ' + j.tally?.why].filter(Boolean).join(' · ')};
  } catch (e) { return {ok: false, run: id, why: '읽은 것을 못 읽음 ' + short(e?.message ?? e)}; }
  finally { fs.rmSync(dir, {recursive: true, force: true}); }
}
/** 열쇠 없는 읽기 — 먼저 바로(curl) · 닿지 못하면(바깥 길이 막힘) 깃허브 작업으로 · {status, tally, via, why} · 꼴은 lib normalizeStatus · normalizeTally 가 봄 */
export async function readKeyless(cwd, {site = SITE, days = 200, want = 'status', say = () => {}} = {}) {
  const url = want === 'tally' ? `${site}/api/tally/sum?days=${days}` : `${site}/api/jinhwa/status`;
  const d = curlJson(url);
  if (d.ok) return {[want]: d.json, via: 'direct', why: ''};
  if (!d.blocked || /^http:\/\/127\./.test(site)) return {[want]: null, via: 'direct', why: d.why};
  const a = await readViaActions(cwd, {days, say});
  return a.ok ? {[want]: a[want], via: 'actions', run: a.run, why: a.why} : {[want]: null, via: 'actions', why: `바로 못 닿음(${d.why}) · ${a.why}`};
}
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

// ───────────── 일 폴더(git worktree) · 바뀐 것 · 얹기 · 밀어 넣기 ─────────────
export function fetchMain(cwd) { return git(cwd, ['fetch', '-q', '--no-tags', 'origin', '+refs/heads/main:refs/remotes/origin/main'], {timeout: 300e3}); }
export function fetchBranch(cwd, b) { return git(cwd, ['fetch', '-q', '--no-tags', 'origin', `+refs/heads/${b}:refs/remotes/origin/${b}`], {timeout: 300e3}); }
export const revParse = (cwd, ref) => { const r = git(cwd, ['rev-parse', '--verify', '--quiet', ref + '^{commit}']); return r.ok ? r.out.trim() : null; };
export const isAncestor = (cwd, a, b) => git(cwd, ['merge-base', '--is-ancestor', a, b]).ok;
export function worktreeAdd(cwd, dir, ref, {branch} = {}) {
  git(cwd, ['worktree', 'remove', '--force', dir]); fs.rmSync(dir, {recursive: true, force: true}); git(cwd, ['worktree', 'prune']);
  fs.mkdirSync(path.dirname(dir), {recursive: true});
  const r = git(cwd, ['worktree', 'add', '-q', ...(branch ? ['-B', branch] : ['--detach']), dir, ref], {timeout: 600e3});
  if (!r.ok) return {ok: false, why: '일 폴더를 못 만듦 ' + short(r.err)};
  const nm = path.join(cwd, 'node_modules'), to = path.join(dir, 'node_modules');
  if (fs.existsSync(nm) && !fs.existsSync(to)) { try { fs.symlinkSync(fs.realpathSync(nm), to, 'dir'); } catch { /* 없어도 git 셈은 됨 */ } }
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
/** 가지(ref)가 그 바탕(merge-base)에서 바꾼 것을 지금 일 폴더(wt — 바탕 커밋에 있음)에 얹고 한 커밋으로 — {ok, sha, why} · 부딪히면 그대로 멈춤(고치지 않음) */
export function applyOnto(wt, ref, onto, message) {
  const mb = git(wt, ['merge-base', onto, ref]).out.trim();
  if (!/^[0-9a-f]{40}$/.test(mb)) return {ok: false, why: '가지와 main 의 바탕을 못 찾음'};
  const patch = git(wt, ['diff', '--no-renames', '--binary', '--full-index', mb, ref]);
  if (!patch.ok || !patch.out.trim()) return {ok: false, why: '가지에 바뀐 것이 없음'};
  const a = git(wt, ['apply', '--3way', '--index', '--whitespace=nowarn'], {input: patch.out + '\n'});
  if (!a.ok) { git(wt, ['reset', '-q', '--hard', onto]); return {ok: false, why: '지금 main 위에 얹으면 부딪힘 ' + short(a.err, 120)}; }
  if (git(wt, ['diff', '--cached', '--name-only', '--diff-filter=U']).out.trim()) { git(wt, ['reset', '-q', '--hard', onto]); return {ok: false, why: '지금 main 위에 얹으면 부딪힘'}; }
  const c = git(wt, ['commit', '-q', '--no-verify', '-m', message]);
  if (!c.ok) return {ok: false, why: '커밋을 못 만듦 ' + short(c.err)};
  return {ok: true, sha: revParse(wt, 'HEAD'), base: mb};
}
/** 커밋 하나를 다른 바탕 위로(main 이 기록만 바뀌어 앞서 갔을 때) — {ok, sha} */
export function replayOnto(wt, commit, onto, message) {
  git(wt, ['reset', '-q', '--hard', onto]);
  const p = git(wt, ['cherry-pick', '--no-commit', commit]);
  if (!p.ok) { git(wt, ['cherry-pick', '--abort']); git(wt, ['reset', '-q', '--hard', onto]); return {ok: false, why: '새 main 위에 다시 얹으면 부딪힘'}; }
  const c = git(wt, ['commit', '-q', '--no-verify', '-m', message]);
  return c.ok ? {ok: true, sha: revParse(wt, 'HEAD')} : {ok: false, why: '커밋을 못 만듦 ' + short(c.err)};
}
/** 코드가 같은가(화면 · 묶기 · 함수 · 설정 · 패키지 · 검사 작업 — 진화 칸 자료는 뺌) — wait_preview 의 코드 맞대기와 같은 곳 */
export function codeSame(cwd, a, b, codePaths) {
  const d = git(cwd, ['diff', '--quiet', '--no-ext-diff', '--no-textconv', '--no-renames', a, b, '--', ...codePaths, ...DATA_EXCLUDES]);
  return d.code === 0;
}
/** 회차 가지 밀기 — 강제는 lease 로만(앞 값 = expect · '' = 없을 때만) · 밀어 넣기 문 없이(문은 main 을 지킴) */
export function pushBranch(cwd, sha, branch, {expect = null} = {}) {
  const lease = expect === null ? '--force' : `--force-with-lease=refs/heads/${branch}:${expect}`;
  const r = git(cwd, ['push', '-q', '--no-verify', lease, 'origin', `${sha}:refs/heads/${branch}`], {timeout: 300e3});
  return {ok: r.ok, why: r.ok ? '' : '가지를 못 밂 ' + short(r.err)};
}
/** main 에 앞으로만 밀기(강제 없음 · 밀어 넣기 문 그대로) — 앞서 갔으면 rejected */
export function pushMain(cwd, sha) {
  const r = git(cwd, ['push', '-q', 'origin', `${sha}:refs/heads/main`], {timeout: 300e3});
  return {ok: r.ok, rejected: /rejected|non-fast-forward|fetch first|stale info/i.test(r.err), why: r.ok ? '' : short(r.err, 200)};
}
export function deleteRemoteBranch(cwd, b) { return git(cwd, ['push', '-q', '--no-verify', 'origin', '--delete', b]); }

// ───────────── 본질 문(KA · scripts/atlas11/next/essence_check.mjs) — 없으면 실패(닫힌 쪽) ─────────────
/** 진화 가지 지킴 — 회차를 연 저장소(main) 의 문으로 base..head 를 봄(가지 쪽 문을 쓰지 않음) · 끝 코드 0 = 지남 */
export function essenceDiff(root, base, head) {
  const f = path.join(root, 'scripts/atlas11/next/essence_check.mjs');
  if (!fs.existsSync(f)) return {ok: false, why: '본질 문(essence_check.mjs)이 없음 — 넣지 않음'};
  const r = run('node', [f, '--diff', `${base}..${head}`], {cwd: root, timeout: 120e3});
  return {ok: r.ok, why: r.ok ? '' : '본질 문이 막음 — ' + short(r.out.split('\n').slice(-3).join(' ') || r.err, 200)};
}

/** 본질 문 일곱 가지(정적 · 브라우저 없이 · 약 3초) — 회차를 연 저장소(main)의 문으로 그 사이트 폴더를 봄
 *  돌려줌 {ran, code, fails: ['번호:상태:까닭'](줄 번호는 지움 — 위 줄이 늘어도 같은 까닭은 같게)} · 못 돌면 ran false(닫힌 쪽) */
export function essenceStatic(root, siteDir) {
  const f = path.join(root, 'scripts/atlas11/next/essence_check.mjs');
  if (!fs.existsSync(f)) return {ran: false, why: '본질 문(essence_check.mjs)이 없음'};
  const r = run('node', [f, '--dist', siteDir, '--json'], {cwd: root, timeout: 300e3});
  let j = null; try { j = JSON.parse(r.out.slice(r.out.indexOf('{'))); } catch { /* 아래 */ }
  if (!j || !Array.isArray(j.checks)) return {ran: false, why: '본질 문 결과를 못 읽음 ' + short(r.err || r.out, 120)};
  const fails = [];
  for (const c of j.checks) if (c.status !== 'pass') for (const why of (c.reasons?.length ? c.reasons : ['(까닭 없음)'])) fails.push(`${c.no}:${c.status}:${String(why).replace(/\d+번째 줄/g, 'n번째 줄')}`);
  return {ran: true, code: j.code ?? r.code, fails};
}

// ───────────── 지금 사이트 자료(atlas/data) — 깃허브 검사와 같은 판(dist-manifest sha256) ─────────────
/** top = 맨 위 자료 파일만(약 16개 · 회사 파일 2,500여 개는 저장소 것) — 전후 그림용(빠르게) */
export async function liveData(siteDir, {base = SITE, budgetMs = 180e3, conc = 8, top = false} = {}) {
  const T0 = Date.now(), sha = b => crypto.createHash('sha256').update(b).digest('hex');
  const get = async (f, want) => {
    for (let i = 0; i < 5; i++) {
      if (Date.now() - T0 > budgetMs) throw Error('시간 넘음');
      const r = spawnSync('curl', ['-sS', '-m', '20', '--fail', `${base}/${f}`], {maxBuffer: 256 << 20, timeout: 30000}); // curl = 길잡이 proxy 를 따름
      if (r.status === 0 && r.stdout?.length) { const b = Buffer.from(r.stdout); if (!want || sha(b) === want) return b; }
      if (r.status === 7 || r.status === 56) throw Error('닿지 못함(바깥 길이 막힘)');
      await sleep(400 * (i + 1));
    }
    throw Error('못 받음 ' + f);
  };
  try {
    const man = JSON.parse((await get('dist-manifest.json')).toString('utf8'));
    const files = Object.keys(man.hashes ?? {}).filter(f => (top ? /^atlas\/data\/[^/]+$/.test(f) : f.startsWith('atlas/data/'))).sort();
    if (!files.includes('atlas/data/mkt.json')) throw Error('dist-manifest 에 atlas/data 가 없음');
    let i = 0;
    await Promise.all(Array.from({length: conc}, async () => { while (i < files.length) { const f = files[i++]; const b = await get(f, man.hashes[f]); const to = path.join(siteDir, f); fs.mkdirSync(path.dirname(to), {recursive: true}); fs.writeFileSync(to, b); } }));
    return {ok: true, files: files.length, seconds: Math.round((Date.now() - T0) / 1000)};
  } catch (e) { return {ok: false, why: short(e?.message ?? e, 100)}; }
}

// ───────────── 시험 서버(invite_dev) · 바뀐 쪽 검사(check_changed) · 빠른 검사(quick) ─────────────
export async function startDev(dir, {port = 8826, key} = {}) {
  const ownerKey = key || crypto.randomBytes(24).toString('base64url');
  const log = fs.openSync(path.join(os.tmpdir(), `jinhwa-dev-${port}.log`), 'w');
  const p = spawn('node', ['scripts/atlas11/invite_dev.mjs', '--dir', 'site', '--port', String(port), '--owner-key', ownerKey], {cwd: dir, stdio: ['ignore', log, log], detached: true});
  const base = `http://127.0.0.1:${port}`;
  const stop = () => { try { process.kill(-p.pid); } catch { try { p.kill(); } catch { /* 이미 끝남 */ } } };
  for (let i = 0; i < 90; i++) {
    try { const a = await fetch(base + '/next/', {signal: AbortSignal.timeout(3000)}); const b = await fetch(base + '/atlas/data/core.json', {signal: AbortSignal.timeout(3000)}); if (a.ok && b.ok) return {ok: true, base, ownerKey, stop}; } catch { /* 아직 */ }
    if (p.exitCode != null) break;
    await sleep(1000);
  }
  stop();
  return {ok: false, why: '시험 서버가 안 뜸(90초)'};
}
/** 바뀐 쪽 검사 — {ok, fails, tail} · 끝 코드 0 만 지남 */
export function changedCheck(dir, {files, base, ownerKey}) {
  const r = run('node', ['scripts/atlas11/next/check_changed.mjs', '--since', 'HEAD', '--files', files.join(','), '--base', base], {cwd: dir, timeout: 40 * 60e3, env: {ATLAS_DEV_OWNER_KEY: ownerKey}});
  const m = /실패\s*(\d+)\s*$/m.exec(r.out);
  const fails = r.ok ? 0 : (m ? Number(m[1]) || 1 : 1);
  return {ok: r.ok, fails, tail: short(r.out.split('\n').slice(-6).join(' / ') + ' ' + r.err, 600)};
}
/** 빠른 검사(quick.mjs --for 파일) — 다시 시험에서 씀 · {ok, fails, tail} */
export function quickCheck(dir, {files, base}) {
  const r = run('node', ['scripts/atlas11/next/quick.mjs', '--for', files.join(','), '--base', base, '--json'], {cwd: dir, timeout: 10 * 60e3, env: {QUICK_STATE: path.join(os.tmpdir(), 'jinhwa-quick')}});
  return {ok: r.ok, fails: r.ok ? 0 : 1, tail: short(r.out.split('\n').slice(-4).join(' / ') + ' ' + r.err, 400)};
}

// ───────────── 모든 쪽 미리 검사(깃허브 atlas11-next-full.yml -f local=true) ─────────────
/** 가지를 밀고 검사를 시작 — {ok, run, branch, sha} · expect = 그 가지의 앞 커밋(''= 새 가지만 · null = 강제) */
export function previewStart(cwd, {sha, branch, expect = ''}) {
  const p = pushBranch(cwd, sha, branch, {expect});
  if (!p.ok) return {ok: false, why: p.why};
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
/** 결과 보기 — wait_preview.mjs(올리기 문과 같은 판정: 코드 같음 + 모든 쪽 실패 0) · sha = 검사한 커밋 · head = 넣을 커밋 · maxMin 0 이면 한 번만 봄
 *  돌려줌 {state: 'pass' | 'fail' | 'running', why} */
export async function previewResult(cwd, {sha, head, maxMin = 0, every = 30, say = () => {}, codePaths = null}) {
  let W;
  try { W = await import(pathToFileURL(path.join(cwd, 'scripts/atlas11/next/wait_preview.mjs')).href); } catch (e) { return {state: 'fail', why: '기다리기 도구를 못 읽음 ' + short(e?.message ?? e)}; }
  const paths = [...(codePaths ?? W.CODE_PATHS), ...DATA_EXCLUDES];
  try {
    const r = await W.waitPreview({sha, head: head ?? sha, cwd, say, maxMin: Math.max(maxMin, 0.05), every, depth: 80, remote: 'origin', branch: 'main', file: W.SUMMARY_FILE, paths, dry: !(maxMin > 0)});
    return r.code === 0 ? {state: 'pass', why: r.why} : r.code === 2 ? {state: 'running', why: r.why} : {state: 'fail', why: r.why};
  } catch (e) { return {state: 'fail', why: '기다리기 오류 ' + short(e?.message ?? e)}; }
}
export function previewCancel(cwd, runId) { if (runId) gh(cwd, ['run', 'cancel', String(runId), '-R', REPO]); }
