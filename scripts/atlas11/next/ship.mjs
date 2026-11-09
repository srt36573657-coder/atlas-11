#!/usr/bin/env node
// 수르 공장 — 올리기 길 한 줄(사장님 2026-11-05 04:17(+03) 「만드는 속도를 5배 빠르게 한 뒤 작업하라」 · 주문 1023 「머스크 판 4」 [0] 1 ~ 8)
//   옛 길(지난 주문 셋): 갈래 전체 검사 → (실패면 고치고 또) → 통과 뒤 올리기 시작 → 올린 뒤 진짜 사이트 전체 검사(30분) — 기다리는 걸음이 하나씩 이어짐
//   새 길: 바뀐 쪽 검사(check_changed)로 먼저 거른 뒤 ① 갈래를 main 에 그대로 얹고 ② 전체 검사(full_run · 이 판 한 번)와
//          ③ 올리기(atlas11-site.yml · preview_sha = 이 판)를 함께 부름 — 올리기는 묶음을 먼저 만들고, 같은 코드의 전체 검사가 실패 0 일 때만 올림
//          (scripts/atlas11/next/wait_preview.mjs 문 · 실패면 올리지 않고 기록도 남기지 않음 · 닫힌 쪽으로 실패)
//   걸린 때는 reports/atlas11/speed/ship-<일>.jsonl 에 한 줄(받은 때 · 부른 때 · 검사 끝 · 올림 끝 · 분)
//   쓰는 법: node scripts/atlas11/next/ship.mjs --work <일 이름> --branch <가지> --since <받은 때 ISO> --why "<까닭>" --reason "<올리기 까닭>" [--dry]
//     · 가지는 origin/main 위에 다시 쌓여 있어야 함(앞서감만 · 아니면 멈춤) · 비밀 값 · 사이트 번호는 찍지 않음
//     · 전체 검사가 실패면: 올리기는 문에서 멈춤 · 이 스크립트가 main 을 검사 전 판으로 되돌리는 되돌림 커밋을 만듦(고친 뒤 다시 부름)
import fs from 'node:fs';
import path from 'node:path';
import {execFileSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../..');
const REPO = 'srt36573657-coder/atlas-11', SITE_WF = 'atlas11-site.yml', FULL_WF = 'atlas11-next-full.yml';
const argv = process.argv.slice(2), arg = (k, d = null) => { const i = argv.indexOf(k); return i >= 0 ? argv[i + 1] : d; }, has = k => argv.includes(k);
const sh = (cmd, a, o = {}) => execFileSync(cmd, a, {cwd: ROOT, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'], ...o}).trim();
const sleep = ms => execFileSync('sleep', [String(ms / 1000)]);
const now = () => new Date().toISOString();
const min = (a, b) => (a && b ? Math.round((Date.parse(b) - Date.parse(a)) / 6000) / 10 : null);

const work = arg('--work'), branch = arg('--branch'), since = arg('--since'), why = arg('--why', ''), reason = arg('--reason', '');
if (!work || !branch || !since || Number.isNaN(Date.parse(since))) { console.error('--work · --branch · --since(받은 때 ISO) 이 필요함'); process.exit(2); }
const T = {work, branch, since, start: now()};

// ① 가지가 origin/main 위에 있는지(앞서감만)
sh('git', ['fetch', '-q', 'origin']);
const sha = sh('git', ['rev-parse', branch]), base = sh('git', ['merge-base', branch, 'origin/main']), main = sh('git', ['rev-parse', 'origin/main']);
if (base !== main) { console.error('가지가 origin/main 위에 있지 않음 — git rebase origin/main 뒤 다시'); process.exit(3); }
T.sha = sha;
if (has('--dry')) { console.log(JSON.stringify({...T, dry: true})); process.exit(0); }

// ② 가지 · main 에 얹기(같은 코드 — 문이 맞댈 판)
sh('git', ['push', '-q', '-f', 'origin', `${branch}:${branch}`]);
sh('git', ['push', '-q', 'origin', `${branch}:main`]);
T.pushed = now();

// ③ 전체 검사(셈을 남기는 full_run 으로 — 이 판 한 번) · ④ 올리기(문 = 이 판) — 함께
const fr = sh('node', ['scripts/atlas11/next/full_run.mjs', '--work', work, '--ref', branch, '--local', '--why', why || '수르 공장 — 올리기 직전 한 번']);
const fullRun = (/actions\/runs\/(\d+)/.exec(fr) ?? [])[1] ?? null;
T.full = {run: fullRun, called: now(), line: fr.split('\n').pop()};
const t0 = new Date(Date.now() - 5000).toISOString();
sh('gh', ['workflow', 'run', SITE_WF, '-R', REPO, '--ref', 'main', '-f', `reason=${reason || why || '수르 공장'}`, '-f', `preview_sha=${sha}`]);
let siteRun = null;
for (let k = 0; k < 20 && !siteRun; k++) {
  try { const rows = JSON.parse(sh('gh', ['run', 'list', '-R', REPO, '--workflow', SITE_WF, '--limit', '5', '--json', 'databaseId,createdAt'])); siteRun = rows.filter(r => r.createdAt >= t0).sort((a, b) => b.createdAt.localeCompare(a.createdAt))[0]?.databaseId ?? null; } catch { /* 다시 */ }
  if (!siteRun) sleep(3000);
}
T.site = {run: siteRun, called: now()};
console.log(`수르 공장 — 전체 검사 ${fullRun ?? '?'} · 올리기 ${siteRun ?? '?'} 함께 부름(${T.full.line})`);

// ⑤ 둘 다 끝날 때까지(20초마다) — 검사 끝 = gather 의 「결과 올리기」 끝
const view = (id, q) => { try { return sh('gh', ['run', 'view', String(id), '-R', REPO, '--json', 'status,conclusion,jobs,updatedAt', '-q', q]); } catch { return ''; } };
for (let k = 0; k < 120; k++) {
  if (fullRun && !T.full.ended) { const s = view(fullRun, '[.status, (.jobs[]|select(.name=="gather")|.steps[]|select(.name=="결과 올리기")|.status)] | join(" ")'); if (/completed completed/.test(s) || /^completed/.test(s)) T.full.ended = now(); }
  if (siteRun && !T.site.ended) { const s = view(siteRun, '.status + " " + .conclusion'); if (/^completed/.test(s)) { T.site.ended = now(); T.site.conclusion = s.split(' ')[1] ?? ''; } }
  if ((!fullRun || T.full.ended) && (!siteRun || T.site.ended)) break;
  sleep(20000);
}
// ⑥ 검사 결과(main 의 next-preview summary — 이 판)
try {
  sh('git', ['fetch', '-q', 'origin']);
  const S = JSON.parse(sh('git', ['show', 'origin/main:reports/atlas11/probe/next-preview/summary.json']));
  T.full.sha = S.sha; T.full.ok = S.sha === sha && S.ok === true; T.full.fails = (S.pages ?? []).filter(p => p.code !== 0).map(p => p.name); T.full.parts = (S.pages ?? []).length;
} catch (e) { T.full.ok = false; T.full.err = String(e.message).slice(0, 120); }
T.deployed = T.site.conclusion === 'success' && T.full.ok;
T.minutes = {total: min(since, T.site.ended), fromPush: min(T.pushed, T.site.ended), full: min(T.full.called, T.full.ended), site: min(T.site.called, T.site.ended)};
// ⑦ 검사 실패면 main 을 되돌림(올리기는 문이 이미 막음 · 예약 회차가 실패 판을 싣지 않게)
if (!T.full.ok) {
  // 묶음(merge) 줄은 건너뜀 — 가지가 main 의 새 줄을 받아 온 묶음을 되돌리면 main 의 일을 지우거나(-m) 멈춤(2026-11-09 09:19 실제로 멈춰 되돌리지 못함 · 일하던 곳도 ship-revert 에 남음)
  //   가지의 제 줄만 새것부터 하나씩 되돌림 · 끝나면(되든 안 되든) 부른 가지로 돌아오고 ship-revert 를 지움
  const back = (() => { try { return sh('git', ['branch', '--show-current']); } catch { return ''; } })();
  try {
    sh('git', ['fetch', '-q', 'origin']); sh('git', ['checkout', '-q', '-B', 'ship-revert', 'origin/main']);
    for (const c of sh('git', ['rev-list', '--no-merges', `${base}..${sha}`]).split('\n').filter(Boolean)) sh('git', ['revert', '--no-edit', c]);
    sh('git', ['push', '-q', 'origin', 'ship-revert:main']); T.reverted = now();
  } catch (e) { T.revertErr = String(e.message).slice(0, 160); try { sh('git', ['revert', '--quit']); } catch { /* 되돌리는 중이 아님 */ } }
  finally { try { if (back && back !== 'ship-revert') sh('git', ['checkout', '-q', back]); sh('git', ['branch', '-D', 'ship-revert']); } catch { /* 그대로 둠 */ } }
}
const dir = path.join(ROOT, 'reports/atlas11/speed'); fs.mkdirSync(dir, {recursive: true});
fs.appendFileSync(path.join(dir, `ship-${work}.jsonl`), JSON.stringify(T) + '\n');
console.log(`수르 공장 끝 — 검사 ${T.full.ok ? '실패 0' : '실패 ' + (T.full.fails ?? []).join(' · ')}(${T.full.parts ?? '?'}쪽) · 올리기 ${T.deployed ? '올라감' : '안 올라감'} · 받은 때부터 ${T.minutes.total}분 · 얹은 때부터 ${T.minutes.fromPush}분`);
process.exit(T.deployed ? 0 : 1);
