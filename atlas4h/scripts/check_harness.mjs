#!/usr/bin/env node
/**
 * ATLAS 4시간 엔진 · 하네스 검사 (시작 스크립트가 맨 먼저 돌린다)
 *   node atlas4h/scripts/check_harness.mjs
 *
 *   H1 명령문 잠금: 칸 파일을 이어 붙이면 원문과 같다(check_command.mjs)
 *   H2 통과 목록 꼴: T1~T23·K1~K7 서른 줄 · 글이 명령문 사양·극한 줄과 같다 · 상태는 「안 통과」「통과」 둘뿐
 *   H3 통과 표시는 평가 일꾼만: 「통과」 줄은 changedBy=평가 일꾼 · evaluatorCommit 의 제목이 「atlas4h EVAL:」 · evidence 있음
 *       + 깃 기록에서 상태가 바뀐 커밋은 모두 「atlas4h EVAL:」 커밋
 *   H4 시험은 고치지 않는다: tests.lock.json 에 적힌 시험 파일(시험 코드·사양 검사·시험 자료·검사 스크립트)이 그대로(더하기·빼기·고치기 0) ·
 *       잠금 파일을 바꾼 커밋은 첫 잠금 뒤로는 모두 「atlas4h LOCK:」 커밋(사장님이 승인한 변경 요청서를 적음)
 *   H5 깃 기록: atlas4h 커밋(합치기 빼고)마다 「무엇:」「왜:」가 있다
 *   H6 장부·쪽지: progress.json·handoff.md 가 있고 읽힌다
 * 하나라도 어긋나면 종료코드 1.
 */
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import {execFileSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
import {checkCommand} from './check_command.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const BASE = 'a9187c6';
const sha = buf => crypto.createHash('sha256').update(buf).digest('hex');
const git = (args, root = ROOT) => { try { return execFileSync('git', args, {cwd: root, encoding: 'utf8', maxBuffer: 64 << 20, stdio: ['ignore', 'pipe', 'ignore']}); } catch { return null; } };

/** 명령문 사양·극한 줄 → [{id, text, how}] (통과 목록 글과 견줄 정답) */
export function specLines(root = ROOT) {
  const read = f => fs.readFileSync(path.join(root, 'atlas4h/command', f), 'utf8').replace(/\r\n/g, '\n');
  const out = [];
  for (const line of read('10-spec.txt').split('\n')) { const m = /^(T\d+) (.+?)(?: \((.+)\))?$/.exec(line.trim()); if (m) out.push({id: m[1], text: m[2], how: m[3] ?? ''}); }
  for (const line of read('11-extremes.txt').split('\n')) { const m = /^(K\d+) (.+)$/.exec(line.trim()); if (m) out.push({id: m[1], text: m[2], how: '실행 · 깨짐 0·숫자 맞음'}); }
  return out;
}

/** H2·H3 — 통과 목록 하나를 본다(순수 함수: 깃 조회는 subjectOf 로 받는다) */
export function checkPasslist(doc, spec, subjectOf = () => null) {
  const problems = [];
  const items = doc?.items ?? [];
  const ids = items.map(i => i.id).join(',');
  if (ids !== spec.map(s => s.id).join(',')) problems.push(`H2 줄 번호가 사양과 다름: ${ids}`);
  for (const s of spec) {
    const it = items.find(i => i.id === s.id);
    if (!it) continue;
    if (it.text !== s.text || it.how !== s.how) problems.push(`H2 ${s.id} 글이 명령문과 다름`);
    if (!['안 통과', '통과'].includes(it.status)) problems.push(`H2 ${s.id} 상태가 이상함: ${it.status}`);
    if (it.status === '통과') {
      if (it.changedBy !== '평가 일꾼') problems.push(`H3 ${s.id} 통과를 평가 일꾼이 아닌 이가 표시함`);
      const subj = it.evaluatorCommit ? subjectOf(it.evaluatorCommit) : null;
      if (!subj || !subj.startsWith('atlas4h EVAL:')) problems.push(`H3 ${s.id} 통과 표시 커밋이 평가 일꾼 커밋이 아님`);
      if (!it.evidence) problems.push(`H3 ${s.id} 통과 근거 없음`);
    }
  }
  return problems;
}

/** H3 — 깃 기록에서 상태가 바뀐 커밋을 찾는다: [{commit, subject, changed:[id]}] */
export function statusChanges(root = ROOT, file = 'atlas4h/harness/passlist.json') {
  const log = git(['log', '--format=%H%x09%s', '--', file], root);
  if (log == null) return null;
  const statuses = text => { try { return Object.fromEntries(JSON.parse(text).items.map(i => [i.id, i.status])); } catch { return null; } };
  const out = [];
  for (const line of log.trim().split('\n').filter(Boolean)) {
    const [commit, subject] = line.split('\t');
    const now = statuses(git(['show', `${commit}:${file}`], root) ?? '');
    const before = statuses(git(['show', `${commit}^:${file}`], root) ?? '') ?? {};
    if (!now) continue;
    const changed = Object.keys(now).filter(id => before[id] !== undefined && before[id] !== now[id]);
    const fresh = Object.keys(before).length === 0 ? Object.keys(now).filter(id => now[id] !== '안 통과') : [];
    if (changed.length || fresh.length) out.push({commit: commit.slice(0, 7), subject, changed: [...changed, ...fresh]});
  }
  return out;
}

/** H4 — 잠금 파일과 지금 시험 파일을 견준다(순수 함수) */
export function checkLock(lock, current) {
  const problems = [];
  const want = lock?.files ?? {};
  for (const [p, h] of Object.entries(want)) {
    if (!(p in current)) problems.push(`H4 시험 파일이 없어짐: ${p}`);
    else if (current[p] !== h) problems.push(`H4 시험 파일이 바뀜: ${p}`);
  }
  for (const p of Object.keys(current)) if (!(p in want)) problems.push(`H4 잠금에 없는 시험 파일이 생김: ${p}`);
  return problems;
}

/** 지금 시험 파일들의 sha256 (잠금 대상: 시험 코드·사양 검사 코드·시험 자료) */
export function testFiles(root = ROOT) {
  const out = {};
  const walk = rel => {
    const abs = path.join(root, rel);
    if (!fs.existsSync(abs)) return;
    for (const e of fs.readdirSync(abs, {withFileTypes: true})) {
      const r = path.posix.join(rel, e.name);
      if (e.isDirectory()) walk(r);
      else out[r] = sha(fs.readFileSync(path.join(root, r)));
    }
  };
  for (const f of fs.existsSync(path.join(root, 'atlas4h/tests')) ? fs.readdirSync(path.join(root, 'atlas4h/tests')) : []) if (f.endsWith('.test.mjs')) out[`atlas4h/tests/${f}`] = sha(fs.readFileSync(path.join(root, 'atlas4h/tests', f)));
  for (const f of ['atlas4h/spec/checks.mjs', 'atlas4h/spec/stats.mjs', 'atlas4h/scripts/check_command.mjs', 'atlas4h/scripts/check_harness.mjs', 'atlas4h/scripts/run_spec.mjs']) if (fs.existsSync(path.join(root, f))) out[f] = sha(fs.readFileSync(path.join(root, f)));
  walk('atlas4h/spec/fixtures');
  return out;
}

/** H5 — atlas4h 커밋마다 「무엇:」「왜:」 */
export function commitNotes(root = ROOT) {
  const log = git(['log', '--no-merges', '--format=%h%x1f%s%x1f%b%x1e', `${BASE}..HEAD`, '--', 'atlas4h'], root);
  if (log == null) return null;
  return log.split('\x1e').map(s => s.trim()).filter(Boolean).map(rec => { const [h, s, b] = rec.split('\x1f'); const all = `${s}\n${b ?? ''}`; return {commit: h, subject: s, ok: all.includes('무엇:') && all.includes('왜:')}; });
}

export function checkHarness(root = ROOT) {
  const checks = [];
  const add = (id, ok, detail) => checks.push({id, ok, ...detail});
  // H1
  const cmd = checkCommand(path.join(root, 'atlas4h/command'));
  add('H1', cmd.ok, {problems: cmd.problems});
  // H2·H3
  const passFile = path.join(root, 'atlas4h/harness/passlist.json');
  let doc = null; try { doc = JSON.parse(fs.readFileSync(passFile, 'utf8')); } catch {}
  const subjectOf = c => (git(['log', '-1', '--format=%s', c], root) ?? '').trim() || null;
  const pl = doc ? checkPasslist(doc, specLines(root), subjectOf) : ['H2 통과 목록을 못 읽음'];
  const changes = statusChanges(root) ?? [];
  const byNonEval = changes.filter(c => !c.subject.startsWith('atlas4h EVAL:'));
  for (const c of byNonEval) pl.push(`H3 평가 일꾼 아닌 커밋 ${c.commit} 이 상태를 바꿈: ${c.changed.join(',')}`);
  const counts = doc ? doc.items.reduce((a, i) => (a[i.status] = (a[i.status] ?? 0) + 1, a), {}) : {};
  add('H2·H3', pl.length === 0, {problems: pl, counts, statusCommits: changes.length});
  // H4
  const lockFile = path.join(root, 'atlas4h/harness/tests.lock.json');
  let lock = null; try { lock = JSON.parse(fs.readFileSync(lockFile, 'utf8')); } catch {}
  const lp = lock ? checkLock(lock, testFiles(root)) : ['H4 잠금 파일 없음'];
  const lockLog = (git(['log', '--format=%h%x09%s', '--', 'atlas4h/harness/tests.lock.json'], root) ?? '').trim().split('\n').filter(Boolean).map(l => l.split('\t'));
  for (const [h, s] of lockLog.slice(0, -1)) if (!s.startsWith('atlas4h LOCK:')) lp.push(`H4 첫 잠금 뒤 잠금을 바꾼 커밋 ${h} 이 「atlas4h LOCK:」 커밋이 아님`);
  add('H4', lp.length === 0, {problems: lp, files: Object.keys(lock?.files ?? {}).length});
  // H5
  const notes = commitNotes(root) ?? [];
  const missing = notes.filter(n => !n.ok);
  add('H5', missing.length === 0, {problems: missing.map(n => `H5 ${n.commit} 「무엇:」「왜:」 없음`), commits: notes.length});
  // H6
  const hp = [];
  try { const p = JSON.parse(fs.readFileSync(path.join(root, 'atlas4h/harness/progress.json'), 'utf8')); if (!Array.isArray(p.done) || !Array.isArray(p.next) || !Array.isArray(p.blocked)) hp.push('H6 진행 장부에 한 일·다음 일·막힌 일 칸이 없음'); } catch { hp.push('H6 진행 장부를 못 읽음'); }
  if (!fs.existsSync(path.join(root, 'atlas4h/harness/handoff.md'))) hp.push('H6 넘겨주기 쪽지 없음');
  add('H6', hp.length === 0, {problems: hp});
  return {ok: checks.every(c => c.ok), checks};
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const r = checkHarness();
  for (const c of r.checks) console.log(`${c.ok ? '통과' : '어긋남'}  ${c.id}${c.problems?.length ? '  ' + c.problems.slice(0, 5).join(' · ') : ''}`);
  console.log(JSON.stringify({ok: r.ok}));
  process.exit(r.ok ? 0 : 1);
}
