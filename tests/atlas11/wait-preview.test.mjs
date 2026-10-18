// 올리기 전 검사 기다리기 시험(2026-10-18 · brief5 길 4 「검사와 묶음 겹치기」 · O1 · O2 검토 반영)
//   가짜 저장소(맨 저장소 + 만드는 사본 + 올리기 사본)에 gather 처럼 summary.json 을 커밋해 scripts/atlas11/next/wait_preview.mjs 를 그대로 돌림
//   통과 0 · 실패 1 · 시간 넘음 2 · 잘못 넣음 3 · 코드 다름(먼저 · 바로) · 덮어쓴 결과 · 얕은 사본 · 늦게 온 결과 · 일부 쪽 · 깨진 결과
//   · gather 커밋만 믿음(손 커밋 · 되돌리기 · 합치기 안 침) · 쪽 이름 그대로 · shard/plan.mjs 와 같은 쪽 셈 · 작업 파일(atlas11-site.yml) 꼴 · 요약 칸 말
import {test, after} from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {execFileSync, spawn, spawnSync} from 'node:child_process';
import {judge, expectedPages, clean, SUMMARY_FILE, CODE_PATHS, GATHER_RE} from '../../scripts/atlas11/next/wait_preview.mjs';
import {summaryLines} from '../../scripts/atlas11/site_summary.mjs';

const SCRIPT = path.resolve('scripts/atlas11/next/wait_preview.mjs');
const WF = path.resolve('.github/workflows/atlas11-site.yml');
const GENV = {...process.env, GIT_AUTHOR_NAME: 't', GIT_AUTHOR_EMAIL: 't@t', GIT_COMMITTER_NAME: 't', GIT_COMMITTER_EMAIL: 't@t', GIT_TERMINAL_PROMPT: '0'};
delete GENV.GITHUB_STEP_SUMMARY; // 시험이 깃허브 요약 칸에 쓰지 않게
const BOTENV = {GIT_AUTHOR_NAME: 'atlas11-bot', GIT_AUTHOR_EMAIL: 'atlas11-bot@users.noreply.github.com', GIT_COMMITTER_NAME: 'atlas11-bot', GIT_COMMITTER_EMAIL: 'atlas11-bot@users.noreply.github.com'};
const PAGES = ['a', 'b', 'en', 'next']; // 가짜 저장소의 모든 쪽 = check_a · check_b(+ check_changed 는 뺌) + next + en

const git = (cwd, ...a) => execFileSync('git', a, {cwd, encoding: 'utf8', env: GENV, stdio: ['ignore', 'pipe', 'pipe']}).trim();
let tick = 1760000000; // 커밋마다 1초씩 늦은 때(실제 gather 처럼 차례가 분명하게 — 같은 초에 여럿이면 「가장 새 것」이 흐려짐)
const gitAt = (cwd, extra, ...a) => { const t = `${tick++} +0000`; return execFileSync('git', a, {cwd, encoding: 'utf8', env: {...GENV, ...extra, GIT_AUTHOR_DATE: t, GIT_COMMITTER_DATE: t}, stdio: ['ignore', 'pipe', 'pipe']}).trim(); };
const put = (dir, f, text) => { fs.mkdirSync(path.dirname(path.join(dir, f)), {recursive: true}); fs.writeFileSync(path.join(dir, f), text); };
const made = [];
after(() => { for (const d of made) fs.rmSync(d, {recursive: true, force: true}); }); // 가짜 저장소는 끝나면 지움

/** 맨 저장소(remote) + 만드는 사본(src) — main 에 코드 커밋 X 하나 */
function world() {
  const d = fs.mkdtempSync(path.join(os.tmpdir(), 'wait-preview-')); made.push(d);
  const remote = path.join(d, 'remote.git'), src = path.join(d, 'src');
  git(d, 'init', '-q', '--bare', '-b', 'main', remote);
  git(remote, 'config', 'uploadpack.allowAnySHA1InWant', 'true'); // 깃허브처럼 커밋 번호로 받기 허용
  git(d, 'init', '-q', '-b', 'main', src);
  git(src, 'remote', 'add', 'origin', 'file://' + remote);
  put(src, 'site/a.txt', 'a1\n'); put(src, 'lib/l.mjs', 'export {};\n'); put(src, 'reports/r.txt', 'r1\n'); put(src, '.github/workflows/atlas11-next-full.yml', 'name: x\n');
  for (const n of ['check_a.mjs', 'check_b.mjs', 'check_changed.mjs', 'next_check.mjs']) put(src, 'scripts/atlas11/next/' + n, '//\n');
  const X = commit(src, 'code X');
  git(src, 'push', '-q', 'origin', 'main');
  return {d, remote, src, X};
}
function commit(src, msg, extra = {}) { git(src, 'add', '-A'); gitAt(src, extra, 'commit', '-q', '-m', msg); return git(src, 'rev-parse', 'HEAD'); }
const push = w => git(w.src, 'push', '-q', 'origin', 'main');
function summary(sha, {pages = PAGES, codes = {}, mode = 'local', ok, extra = {}} = {}) {
  const ps = pages.map(n => ({name: n, code: codes[n] ?? 0, seconds: 1, mode, sha}));
  return {schema: 'atlas11-next-full-1', at: new Date().toISOString(), base: 'http://127.0.0.1:8826', mode, ref: 'br', sha, run: 4242, wallSeconds: 1,
    data: {from: 'live', asOf: '2026-10-16'}, pages: ps, ok: ok ?? ps.every(p => p.code === 0), ...extra};
}
/** gather 처럼 summary.json 을 main 에 커밋해 밀어 넣음(쓴 이 atlas11-bot · 제목에 판 번호 앞 7자) · bot:false · subject 로 가짜 커밋 */
function addSummary(w, rec, {forSha, bot = true, subject} = {}) {
  put(w.src, SUMMARY_FILE, typeof rec === 'string' ? rec : JSON.stringify(rec, null, 1) + '\n');
  const c = commit(w.src, subject ?? `atlas11 probe next-preview br ${(forSha ?? rec.sha).slice(0, 7)} [skip ci]`, bot ? BOTENV : {});
  push(w);
  return c;
}
/** 올리기 사본(깃허브 실행기처럼 main 하나 · 얕게는 깊이 1) */
function work(w, {shallow = false} = {}) {
  const dir = path.join(w.d, 'work-' + Math.random().toString(36).slice(2, 8));
  git(w.d, 'clone', '-q', '--single-branch', '--branch', 'main', ...(shallow ? ['--depth', '1'] : []), 'file://' + w.remote, dir);
  return dir;
}
function run(cwd, args) {
  const t = Date.now(), r = spawnSync(process.execPath, [SCRIPT, ...args], {cwd, encoding: 'utf8', env: GENV, timeout: 60e3});
  return {code: r.status, out: (r.stdout ?? '') + (r.stderr ?? ''), ms: Date.now() - t};
}
const FAST = ['--every', '0.2', '--max-min', '0.03']; // 0.2초마다 · 1.8초까지

test('통과 — 코드 같음 · 이 판의 모든 쪽 실패 0 → 0', () => {
  const w = world(); addSummary(w, summary(w.X));
  const r = run(work(w), ['--sha', w.X, ...FAST]);
  assert.equal(r.code, 0, r.out);
  assert.match(r.out, /코드 같음[\s\S]*검사 통과 확인 — 쪽 4개 실패 0 · 검사 실행 4242/);
  assert.match(r.out, /통과 — 올립니다/);
});

test('실패 — 가장 새 결과에 실패한 쪽 → 기다리지 않고 1', () => {
  const w = world(); addSummary(w, summary(w.X, {codes: {en: 1, b: 99}}));
  const r = run(work(w), ['--sha', w.X, '--every', '0.2', '--max-min', '1']);
  assert.equal(r.code, 1, r.out);
  assert.match(r.out, /검사 실패 — 실패한 쪽 b\(99\) · en\(1\)/);
  assert.ok(r.ms < 20e3, '바로 멈춤 ' + r.ms);
});

test('시간 넘음 — 이 판의 결과가 없으면 2(다른 판 결과는 안 봄)', () => {
  const w = world(); addSummary(w, summary('f'.repeat(40)));
  const r = run(work(w), ['--sha', w.X, ...FAST]);
  assert.equal(r.code, 2, r.out);
  assert.match(r.out, /모든 쪽 결과가 없음/);
  assert.ok(r.ms >= 1700, '마감까지 기다림 ' + r.ms);
});

test('코드 다름 — 검사 뒤 site 가 바뀐 판이면 결과를 기다리지 않고 바로 1(결과가 있어도 · 없어도)', () => {
  for (const withResult of [true, false]) {
    const w = world(); if (withResult) addSummary(w, summary(w.X));
    put(w.src, 'site/a.txt', 'a2\n'); commit(w.src, 'site change'); push(w);
    const r = run(work(w), ['--sha', w.X, '--every', '0.2', '--max-min', '1']);
    assert.equal(r.code, 1, r.out);
    assert.match(r.out, /코드가 다름 — 바뀐 파일 1개\(site\/a\.txt\)/);
    assert.doesNotMatch(r.out, /검사 통과 확인/);
    assert.ok(r.ms < 20e3, '기다리지 않음 ' + r.ms);
  }
});

test('모든 쪽 검사 작업 파일만 바뀌어도 코드 다름 → 1(검사가 약해진 판을 막음)', () => {
  assert.ok(CODE_PATHS.includes('.github/workflows/atlas11-next-full.yml'));
  const w = world(); addSummary(w, summary(w.X));
  put(w.src, '.github/workflows/atlas11-next-full.yml', 'name: weaker\n'); commit(w.src, 'check change'); push(w);
  const r = run(work(w), ['--sha', w.X, ...FAST]);
  assert.equal(r.code, 1, r.out); assert.match(r.out, /\.github\/workflows\/atlas11-next-full\.yml/);
});

test('기록 · 문서만 다르면 같은 코드 → 0', () => {
  const w = world(); addSummary(w, summary(w.X));
  put(w.src, 'reports/r.txt', 'r2\n'); put(w.src, 'docs/d.md', '#\n'); commit(w.src, 'records'); push(w);
  assert.equal(run(work(w), ['--sha', w.X, ...FAST]).code, 0);
});

test('늦게 온 결과 — 기다리는 중에 main 에 들어오면 0', async () => {
  const w = world(); const dir = work(w);
  const p = spawn(process.execPath, [SCRIPT, '--sha', w.X, '--every', '0.2', '--max-min', '0.5'], {cwd: dir, env: GENV});
  let out = ''; p.stdout.on('data', b => { out += b; }); p.stderr.on('data', b => { out += b; });
  const done = new Promise(res => p.on('close', res));
  await new Promise(r => setTimeout(r, 1200));
  addSummary(w, summary(w.X));
  const code = await done;
  assert.equal(code, 0, out);
  assert.match(out, /검사 통과 확인/);
});

test('덮어쓴 결과 · 얕은 사본 — 다른 미리 검사가 뒤에 덮어써도 main 기록에서 찾음 → 0', () => {
  const w = world(); addSummary(w, summary(w.X));
  addSummary(w, summary('e'.repeat(40), {codes: {a: 1}}));
  addSummary(w, summary('d'.repeat(40), {pages: ['a']}));
  const dir = work(w, {shallow: true});
  assert.equal(git(dir, 'rev-parse', '--is-shallow-repository'), 'true');
  const r = run(dir, ['--sha', w.X, ...FAST]);
  assert.equal(r.code, 0, r.out);
  assert.equal(git(dir, 'for-each-ref', 'refs/wait-preview/'), '', '숨은 이름은 끝나면 지움');
});

test('일부 쪽만 돈 결과는 결정하지 않음 — 모든 쪽을 기다리다 2', () => {
  const w = world(); addSummary(w, summary(w.X, {pages: ['a', 'next', 'en']}));
  const r = run(work(w), ['--sha', w.X, ...FAST]);
  assert.equal(r.code, 2, r.out);
  assert.match(r.out, /일부 쪽만 돎\(빠진 쪽 b\)/);
});

test('쪽 이름은 그대로만 — 몫 이름(b1 · en1)만 있으면 그 쪽이 빠진 것 → 2', () => {
  const w = world(); addSummary(w, summary(w.X, {pages: ['a', 'b1', 'b2', 'next', 'en1', 'en2']}));
  const r = run(work(w), ['--sha', w.X, ...FAST]);
  assert.equal(r.code, 2, r.out); assert.match(r.out, /빠진 쪽 b · en/);
});

test('가장 새 결과가 정함 — 통과 뒤 실패면 1 · 실패 뒤 통과면 0 · 통과 뒤 일부 쪽 통과면 0', () => {
  let w = world(); addSummary(w, summary(w.X)); addSummary(w, summary(w.X, {codes: {next: 1}}));
  assert.equal(run(work(w), ['--sha', w.X, ...FAST]).code, 1);
  w = world(); addSummary(w, summary(w.X, {codes: {next: 1}})); addSummary(w, summary(w.X));
  assert.equal(run(work(w), ['--sha', w.X, ...FAST]).code, 0);
  w = world(); addSummary(w, summary(w.X)); addSummary(w, summary(w.X, {pages: ['a']}));
  assert.equal(run(work(w), ['--sha', w.X, ...FAST]).code, 0);
});

test('합치기 커밋이 옛 결과(통과)를 되살려도 더 새 검사 결과(실패)가 정함 → 1', () => {
  const w = world(); const G1 = addSummary(w, summary(w.X));
  addSummary(w, summary(w.X, {codes: {a: 1}})); // 더 새 검사 = 실패
  git(w.src, 'checkout', '-q', '-b', 'side', G1); put(w.src, 'docs/d.md', '#\n'); commit(w.src, 'docs only');
  gitAt(w.src, {}, 'merge', '-q', '-s', 'ours', '-m', 'merge main keeping side tree', 'main'); // 합친 판의 summary.json = 옛 통과 결과
  git(w.src, 'push', '-q', 'origin', 'HEAD:main');
  const dir = work(w);
  assert.equal(JSON.parse(fs.readFileSync(path.join(dir, SUMMARY_FILE), 'utf8')).ok, true, 'main 맨 끝 파일은 옛 통과');
  const r = run(dir, ['--sha', w.X, ...FAST]);
  assert.equal(r.code, 1, r.out); assert.match(r.out, /실패한 쪽 a\(1\)/);
});

test('gather 커밋만 믿음 — 손 커밋 · 다른 제목의 통과 결과는 안 침 → 2 · 실패 gather 를 되돌려도 → 1', () => {
  let w = world(); addSummary(w, summary(w.X), {bot: false}); // 쓴 이가 atlas11-bot 이 아님
  assert.equal(run(work(w), ['--sha', w.X, ...FAST]).code, 2);
  w = world(); addSummary(w, summary(w.X), {subject: 'update summary by hand'}); // 쓴 이는 맞지만 제목이 gather 꼴이 아님
  assert.equal(run(work(w), ['--sha', w.X, ...FAST]).code, 2);
  w = world(); addSummary(w, summary(w.X)); const bad = addSummary(w, summary(w.X, {codes: {b: 1}}));
  gitAt(w.src, {}, 'revert', '--no-edit', bad); push(w); // 실패 결과를 되돌려 옛 통과를 되살림
  assert.equal(JSON.parse(fs.readFileSync(path.join(w.src, SUMMARY_FILE), 'utf8')).ok, true);
  const r = run(work(w), ['--sha', w.X, ...FAST]);
  assert.equal(r.code, 1, r.out); assert.match(r.out, /실패한 쪽 b\(1\)/);
});

test('제목은 이 판인데 파일이 깨졌거나 · 판이 없거나 · 다른 판이면 멈춤 → 1 · 다른 판의 깨진 결과는 건너뜀 → 0', () => {
  const cases = [['not json', '깨짐'], [JSON.stringify({...summary('a'.repeat(40)), sha: undefined}), '판 없음'], [JSON.stringify(summary('f'.repeat(40))), '다른 판']];
  for (const [text, label] of cases) {
    const w = world(); addSummary(w, summary(w.X)); addSummary(w, text, {forSha: w.X});
    const r = run(work(w), ['--sha', w.X, ...FAST]);
    assert.equal(r.code, 1, label + ' ' + r.out); assert.match(r.out, /이 판의 결과 파일이 깨졌거나 다른 판을 적음/);
  }
  const w = world(); addSummary(w, summary(w.X)); addSummary(w, '{"schema": ', {forSha: 'c'.repeat(40)});
  assert.equal(run(work(w), ['--sha', w.X, ...FAST]).code, 0);
});

test('올리기 전 검사(local)가 아닌 결과는 믿지 않음 → 1', () => {
  const w = world(); addSummary(w, summary(w.X, {mode: 'live'}));
  const r = run(work(w), ['--sha', w.X, ...FAST]);
  assert.equal(r.code, 1, r.out); assert.match(r.out, /local\)가 아님/);
});

test('검사한 판이 main 에 없으면(가지에만) 그 커밋만 받아 맞댐 — 얕은 사본 · 온전한 사본 모두 0', () => {
  const w = world();
  git(w.src, 'checkout', '-q', '-b', 'wip'); put(w.src, 'site/a.txt', 'a3\n'); const X2 = commit(w.src, 'wip change'); git(w.src, 'push', '-q', 'origin', 'wip');
  git(w.src, 'checkout', '-q', 'main'); put(w.src, 'site/a.txt', 'a3\n'); commit(w.src, 'same change on main'); push(w);
  addSummary(w, summary(X2));
  for (const shallow of [true, false]) {
    const dir = work(w, {shallow});
    assert.throws(() => git(dir, 'cat-file', '-e', X2 + '^{commit}'), undefined, '처음에는 없음');
    const r = run(dir, ['--sha', X2, ...FAST]);
    assert.equal(r.code, 0, `shallow=${shallow} ` + r.out);
  }
});

test('검사한 판을 어디서도 못 받으면 코드를 맞대지 못함 → 1', () => {
  const w = world(), ghost = '0123456789abcdef0123456789abcdef01234567'; addSummary(w, summary(ghost));
  const r = run(work(w), ['--sha', ghost, ...FAST]);
  assert.equal(r.code, 1, r.out); assert.match(r.out, /검사한 판을 못 받아/);
});

test('마른 돌기 --dry — 한 번만 보고 끝', () => {
  const w = world();
  const r = run(work(w), ['--sha', w.X, '--dry']);
  assert.equal(r.code, 2, r.out); assert.match(r.out, /한 번만 봄/); assert.ok(r.ms < 20e3);
});

test('잘못 넣음 → 3', () => {
  const w = world(), dir = work(w);
  for (const a of [['--sha', 'abc'], [], ['--sha', w.X, '--remote', '--upload-pack=x'], ['--sha', w.X, '--every', '0'], ['--sha', w.X, '--paths', '../x'], ['--sha', w.X, '--paths', '-x'], ['--sha', w.X, '--head', 'nope']]) {
    const r = run(dir, a);
    assert.equal(r.code, 3, JSON.stringify(a) + ' ' + r.out);
  }
});

test('찍는 줄 — 주소 · 줄바꿈을 지움(밖에서 온 쪽 이름)', () => {
  assert.equal(clean('x https://a.b/c?t=1 y\n::warning::z'), 'x <주소> y ::warning::z');
  const w = world(); addSummary(w, summary(w.X, {pages: [...PAGES, 'evil\nhttps://deploy.example/1'], codes: {'evil\nhttps://deploy.example/1': 1}}));
  const r = run(work(w), ['--sha', w.X, ...FAST]);
  assert.equal(r.code, 1);
  assert.doesNotMatch(r.out, /https?:\/\//); assert.doesNotMatch(r.out, /\n(::|https)/);
});

test('판정 · 모든 쪽 셈 · gather 제목(단위)', () => {
  assert.deepEqual(expectedPages(['scripts/atlas11/next/check_a.mjs', 'scripts/atlas11/next/check_changed.mjs', 'scripts/atlas11/next/next_check.mjs', 'scripts/atlas11/next/check_B.mjs', 'scripts/atlas11/next/check_z9.mjs']), ['a', 'en', 'next', 'z9']);
  const sha = 'a'.repeat(40), expected = PAGES;
  assert.equal(judge(summary(sha), {sha, expected}).kind, 'pass');
  assert.equal(judge(summary(sha, {ok: false}), {sha, expected}).kind, 'fail');
  assert.equal(judge({...summary(sha), schema: 'other-1'}, {sha, expected}).kind, 'bad');
  assert.equal(judge({...summary(sha), pages: []}, {sha, expected}).kind, 'bad');
  assert.equal(judge({...summary(sha), pages: [{name: 'a', code: '0'}]}, {sha, expected}).kind, 'bad');
  const r = summary(sha); r.pages[0].sha = 'b'.repeat(40);
  assert.equal(judge(r, {sha, expected}).kind, 'bad');
  assert.equal(judge(summary(sha, {pages: ['a', 'cond', 'next', 'en']}), {sha, expected: ['a', 'co', 'en', 'next']}).kind, 'partial', 'cond 는 co 가 아님');
  assert.equal(judge(summary(sha, {pages: ['a', 'b1', 'next', 'en']}), {sha, expected}).kind, 'partial', 'b1 은 b 가 아님');
  assert.equal(judge(null, {sha, expected}).kind, 'bad');
  assert.equal(GATHER_RE.exec('atlas11 probe next-preview wip-l01 0941de7 [skip ci]')?.[1], '0941de7');
  for (const s of ['Revert "atlas11 probe next-preview br 0941de7 [skip ci]"', 'atlas11 probe next-full [skip ci]', 'atlas11 probe next-preview br 0941de7', 'atlas11 probe next-preview br 0941DE7 [skip ci]']) assert.equal(GATHER_RE.exec(s), null, s);
});

test('모든 쪽 셈 = 모든 쪽 검사의 일 나누기(shard/plan.mjs pageNames)와 같음', async t => {
  const plan = path.resolve('scripts/atlas11/next/shard/plan.mjs');
  if (!fs.existsSync(plan)) { t.skip('shard/plan.mjs 없음'); return; }
  const {pageNames} = await import(plan);
  const real = path.resolve('scripts/atlas11/next');
  assert.deepEqual(expectedPages(fs.readdirSync(real)), [...pageNames(real)].sort(), '지금 검사 폴더');
  const d = fs.mkdtempSync(path.join(os.tmpdir(), 'wait-preview-')); made.push(d);
  for (const f of ['check_a.mjs', 'check_changed.mjs', 'check_B.mjs', 'check_z9.mjs', 'next_check.mjs', 'check_x.js', 'check_.mjs']) fs.writeFileSync(path.join(d, f), '//\n');
  assert.deepEqual(expectedPages(fs.readdirSync(d)), [...pageNames(d)].sort(), '이름 꼴 모음');
});

test('작업 파일 atlas11-site.yml — 비우면 예전 그대로 · 넣으면 묶은 뒤 · 올리기 앞에서 기다리고 막히면 기록도 안 남김', t => {
  const py = spawnSync('python3', ['-c', 'import json,sys,yaml; d=yaml.safe_load(open(sys.argv[1])); d["on"]=d.get("on", d.get(True)); d.pop(True, None); print(json.dumps(d))', WF], {encoding: 'utf8'});
  if (py.status !== 0) { t.skip('python3 yaml 없음'); return; }
  const wf = JSON.parse(py.stdout), inputs = wf.on.workflow_dispatch.inputs, job = wf.jobs.site, steps = job.steps.map(s => s.name ?? s.uses);
  assert.equal(inputs.preview_sha.default, ''); assert.equal(inputs.preview_sha.required, false);
  assert.equal(inputs.reason.default, ''); // 예약 작업이 넣는 까닭 그대로
  assert.equal(job['timeout-minutes'], "${{ inputs.preview_sha != '' && 60 || 30 }}");
  assert.deepEqual(steps, ['시작 시각 적기', '저장소 받기', '노드 준비', '준비물 설치', '파이썬 준비(36곳 셈 numpy)', '화면 묶음 만들기', '올리기 전 검사 기다리기', 'aaa7377.com 에 올리기', '열렸는지 확인', '열쇠 없음', '결과 한 줄(요약 칸)', '기록 남기기']);
  const by = n => job.steps.find(s => s.name === n), gate = by('올리기 전 검사 기다리기'), up = by('aaa7377.com 에 올리기');
  assert.equal(gate.id, 'gate'); assert.equal(gate.if, "${{ inputs.preview_sha != '' }}"); assert.equal(gate['timeout-minutes'], 25);
  assert.equal(gate.env.NETLIFY_AUTH_TOKEN, ''); assert.equal(gate.env.NETLIFY_SITE_ID, '');
  assert.equal(gate.env.PREVIEW_SHA, '${{ inputs.preview_sha }}');
  assert.match(gate.run, /wait_preview\.mjs --sha "\$PREVIEW_SHA" --every 30 --max-min 20/);
  assert.doesNotMatch(String(up.if), /always\(\)|failure\(\)|cancelled\(\)/, '기다리기가 실패하면 올리기는 건너뜀');
  assert.equal(by('기록 남기기').if, "${{ always() && (inputs.preview_sha == '' || steps.gate.outcome == 'success') }}");
  assert.match(by('결과 한 줄(요약 칸)').run, /--deploy "\$\{\{ \(steps\.gate\.outcome == 'failure' \|\| steps\.gate\.outcome == 'cancelled'\) && 'gate' \|\| steps\.deploy\.outcome \}\}"/);
  assert.equal(job.concurrency, undefined); assert.equal(wf.concurrency.group, 'atlas11-daily');
  const al = spawnSync('actionlint', ['-no-color', WF], {encoding: 'utf8'});
  if (!al.error) assert.equal(al.status, 0, al.stdout + al.stderr);
});

test('요약 칸 — 검사 기다림이 막으면 「올리기 전 검사에서 막혔습니다」 · 아니면 예전 말 그대로', () => {
  const base = {dep: null, st: null, man: null, since: 0, token: true};
  assert.match(summaryLines({...base, deployOutcome: 'gate'}).join('\n'), /까닭: 올리기 전 검사에서 막혔습니다/);
  assert.match(summaryLines({...base, deployOutcome: 'skipped'}).join('\n'), /까닭: 올리기 단계가 끝나지 못했습니다/);
});
