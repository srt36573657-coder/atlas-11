#!/usr/bin/env node
// 올리기 전 검사 기다리기 — 묶음은 먼저 만들고, 올리기는 같은 코드의 모든 쪽 검사가 실패 0 일 때만(2026-10-18 · brief5 길 4 「검사와 묶음 겹치기」 · O1 · O2 검토 반영)
//   atlas11-site.yml 에 preview_sha 를 넣으면 「화면 묶음 만들기」 뒤 · 「aaa7377.com 에 올리기」 앞에서 이 문을 돈다
//   (비우면 예전 그대로 — 예약 회차 · atlas11-world 가 부르는 올리기는 이 문을 거치지 않음)
//   ① 먼저 검사한 판과 올릴 판(HEAD)의 코드가 같은지 git diff 로 맞댐 — 다르면 기다리지 않고 바로 멈춤
//      CODE_PATHS = 화면 · 묶기 · 올리기 · 넷리파이 함수 · 설정 · 패키지 · 모든 쪽 검사 작업 파일(검사가 약해진 판을 막음)
//      reports · docs · public/data 는 안 봄 — 자료 · 기록은 올릴 때 새로 셈
//   ② 그다음 main 의 reports/atlas11/probe/next-preview/summary.json 기록에서 이 판의 결과를 찾음(atlas11-next-full.yml -f local=true 의 gather 가 올림)
//      · 결과로 치는 커밋 = gather 커밋만(쓴 이 atlas11-bot · 제목 「atlas11 probe next-preview <가지> <앞 7자> [skip ci]」) — 손 커밋 · 되돌리기 · 합치기는 안 침
//      · 일꾼 미리 검사가 같은 파일을 자주 덮어씀 → main 기록을 거슬러 찾고, 이 판의 가장 새 결과가 정함
//      · 제목이 이 판인데 파일이 깨졌거나 다른 판을 적었으면 멈춤
//      · 통과 = mode local · ok true · 쪽마다 code 0 · 모든 쪽이 이름 그대로 있음(check_*.mjs 에서 check_changed 빼고 + next + en — shard/plan.mjs pageNames 와 같은 셈)
//      · 일부 쪽만 돈 결과(-f pages=…)는 결정하지 않고 모든 쪽 결과를 기다림
//   얕은 사본(깃허브 실행기 · 깊이 1)에서는 main 을 --depth 로 받음 — 합친 가지의 옛 기록 전부(1.4GB)를 끌어오지 않게
//   쓰는 법: node scripts/atlas11/next/wait_preview.mjs --sha <검사한 커밋 40자> [--every 30] [--max-min 20] [--head HEAD] [--depth 80] [--dry]
//     --dry = 한 번만 보고 끝(기다리지 않음) · --paths 'site,lib' = 맞댈 곳 바꾸기 · --remote origin · --branch main · --file <결과 파일>
//   끝 코드: 0 통과 · 1 검사 실패 · 코드 다름 · 결과 꼴 이상 · 2 시간 넘음(결과 없음) · 3 잘못 넣음 — 0 이 아니면 올리기 단계가 돌지 않음(닫힌 쪽으로 실패)
//   찍는 것: 짧은 한국어 줄만 — 열쇠 · 사이트 번호 · 올림 번호 · 주소는 찍지 않음(밖에서 온 글은 주소 · 줄바꿈을 지우고 짧게)
//   시험: node --test tests/atlas11/wait-preview.test.mjs
import {spawnSync} from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

export const SUMMARY_FILE = 'reports/atlas11/probe/next-preview/summary.json';
/** 올리는 사이트를 바꾸는 코드 + 검사 자체 — 화면(site) · 묶기와 올리기(scripts · lib) · 넷리파이 함수(functions · 옛 netlify) · 설정(config) · 패키지 · 모든 쪽 검사 작업 파일 */
export const CODE_PATHS = Object.freeze(['site', 'lib', 'scripts', 'functions', 'config', 'netlify', 'netlify.toml', 'package.json', 'package-lock.json', '.github/workflows/atlas11-next-full.yml']);
/** gather 커밋 — atlas11-next-full.yml 「결과 올리기」가 쓰는 이름 · 제목(앞 7자 = 검사한 커밋) */
export const BOT = 'atlas11-bot';
export const GATHER_RE = /^atlas11 probe next-preview \S+ ([0-9a-f]{7}) \[skip ci\]$/;
const CHECK_DIR = 'scripts/atlas11/next/';
const EXIT = Object.freeze({pass: 0, fail: 1, timeout: 2, usage: 3});

/** 모든 쪽 이름 — shard/plan.mjs pageNames 와 같은 셈: check_<이름>.mjs(check_changed 는 도구라 뺌) + next + en */
export function expectedPages(fileNames) {
  const set = new Set(['next', 'en']);
  for (const f of fileNames) {
    const m = /^check_([a-z0-9]+)\.mjs$/.exec(path.posix.basename(String(f)));
    if (m && m[1] !== 'changed') set.add(m[1]);
  }
  return [...set].sort();
}

/** 밖에서 온 글(결과 파일의 쪽 이름 등)을 찍기 전에 — 주소 · 줄바꿈 · 조종 글자를 지우고 짧게 */
export const clean = (s, n = 60) => String(s ?? '').replace(/[a-z][a-z0-9+.-]*:\/\/\S+/gi, '<주소>').replace(/[\u0000-\u001f\u007f-\u009f]+/g, ' ').trim().slice(0, n);

const list = (xs, n = 8) => xs.slice(0, n).join(' · ') + (xs.length > n ? ` 외 ${xs.length - n}` : '');

/** 결과 한 판 판정 → {kind: pass | fail | partial(일부 쪽만 — 결정 안 함) | bad(꼴 이상), why} */
export function judge(rec, {sha, expected}) {
  if (!rec || typeof rec !== 'object' || Array.isArray(rec)) return {kind: 'bad', why: '결과 파일 꼴이 이상함'};
  if (typeof rec.schema !== 'string' || !rec.schema.startsWith('atlas11-next-full-')) return {kind: 'bad', why: '결과 파일 꼴을 모름'};
  if (String(rec.sha ?? '').toLowerCase() !== sha) return {kind: 'bad', why: '다른 판의 결과'};
  if (rec.mode !== 'local') return {kind: 'bad', why: '올리기 전 검사(local)가 아님'};
  const pages = rec.pages;
  if (!Array.isArray(pages) || !pages.length) return {kind: 'bad', why: '쪽 결과가 없음'};
  if (pages.some(p => !p || typeof p !== 'object' || typeof p.name !== 'string' || !p.name || !Number.isInteger(p.code))) return {kind: 'bad', why: '쪽 결과 꼴이 이상함'};
  const failed = pages.filter(p => p.code !== 0);
  if (failed.length) return {kind: 'fail', why: '실패한 쪽 ' + list(failed.map(p => `${clean(p.name, 20)}(${p.code})`))};
  if (rec.ok !== true) return {kind: 'fail', why: '결과가 통과로 적혀 있지 않음'};
  const odd = pages.filter(p => (p.sha != null && String(p.sha).toLowerCase() !== sha) || (p.mode != null && p.mode !== 'local'));
  if (odd.length) return {kind: 'bad', why: '쪽 결과의 판이 다름 ' + list(odd.map(p => clean(p.name, 20)), 5)};
  const names = pages.map(p => p.name);
  const missing = expected.filter(n => !names.includes(n)); // 이름 그대로만 — gather 가 몫(en3 · co2)을 한 줄로 합치고, 계획한 쪽이 빠지면 99 로 적음
  if (missing.length) return {kind: 'partial', why: '빠진 쪽 ' + list(missing.map(n => clean(n, 20))), missing};
  const data = rec.data && typeof rec.data === 'object' && rec.data.from ? clean(`${rec.data.from}${rec.data.asOf ? ' ' + rec.data.asOf : ''}`, 30) : null;
  return {kind: 'pass', why: `쪽 ${pages.length}개 실패 0`, run: Number.isSafeInteger(rec.run) ? rec.run : null, pages: pages.length, data};
}

function git(args, {cwd, timeout = 120e3} = {}) {
  const r = spawnSync('git', ['-c', 'gc.auto=0', '-c', 'maintenance.auto=false', ...args], {cwd, encoding: 'utf8', timeout, maxBuffer: 64 << 20, env: {...process.env, GIT_TERMINAL_PROMPT: '0'}});
  return {ok: r.status === 0, status: r.status ?? -1, out: r.stdout ?? '', err: r.stderr ?? ''};
}

const sleep = ms => new Promise(r => setTimeout(r, ms));
const mmss = ms => { const s = Math.max(0, Math.round(ms / 1000)); return s < 60 ? `${s}초` : `${Math.floor(s / 60)}분${s % 60 ? ` ${s % 60}초` : ''}`; };
const SAFE = /^[A-Za-z0-9][A-Za-z0-9._\/^~@{}-]*$/; // git 에 넘기는 이름 — 「-」로 시작하는 것(옵션으로 읽힘) 막음
const SAFE_PATH = /^[A-Za-z0-9._][A-Za-z0-9._\/-]*$/; // 맞댈 곳(-- 뒤) — 「.github/…」는 되고 「-」로 시작 · 「..」은 안 됨

/** 기다리기 본체 — {code, why} 를 돌려줌(찍기는 say) */
export async function waitPreview(o) {
  const {sha, cwd, say} = o;
  const r = git(['rev-parse', '--verify', '--quiet', `${o.head}^{commit}`], {cwd});
  const headSha = r.out.trim();
  if (!r.ok || !/^[0-9a-f]{40}$/.test(headSha)) return {code: EXIT.usage, why: '올릴 판(HEAD)을 못 찾음'};
  const lt = git(['ls-tree', '--name-only', headSha, '--', CHECK_DIR], {cwd});
  if (!lt.ok) return {code: EXIT.fail, why: '검사 목록을 못 읽음'};
  const expected = expectedPages(lt.out.split('\n').filter(Boolean));
  const shallow = git(['rev-parse', '--is-shallow-repository'], {cwd}).out.trim() === 'true';
  const t0 = Date.now(), deadline = t0 + o.maxMin * 60e3;
  say(`올리기 전 검사 기다림 — 검사한 판 ${sha.slice(0, 7)} · 올릴 판 ${headSha.slice(0, 7)} · 모든 쪽 ${expected.length}개 · ` + (o.dry ? '한 번만 봄' : `${o.every}초마다 · 최대 ${o.maxMin}분`));
  // ① 코드 먼저(HEAD 와 검사한 판은 그대로라 한 번이면 됨) — 다르면 검사를 기다릴 까닭이 없음
  const diff = await codeDiff({o, sha, headSha, shallow, say});
  if (diff) return diff;
  // ② 검사 결과 기다리기
  const ref = `refs/wait-preview/${process.pid}-${Date.now().toString(36)}`;
  const seen = new Map(), told = new Set(), sha7 = sha.slice(0, 7);
  const once = (k, line) => { if (!told.has(k)) { told.add(k); say(line); } };
  let fetchFails = 0, lastBeat = t0;
  try {
    for (;;) {
      // main 받기(이 프로세스 몫 숨은 이름 — 다른 일꾼 · 다음 단계의 origin/main 은 건드리지 않음)
      const f = git(['fetch', '-q', '--no-tags', '--no-write-fetch-head', ...(shallow ? [`--depth=${o.depth}`] : []), o.remote, `+refs/heads/${o.branch}:${ref}`], {cwd, timeout: 180e3});
      let verdict = null;
      if (!f.ok) { fetchFails++; if (fetchFails <= 3 || fetchFails % 10 === 0) say(`main 을 못 받음 — 다시 봄(${fetchFails}번째)`); }
      else {
        // 결과 파일을 고친 커밋들(가장 새 것부터) — --full-history: 합친 가지 쪽도 빠뜨리지 않음 · --no-merges: 합치기는 결과가 아님
        const lg = git(['log', '--no-merges', '--full-history', '--format=%H%x1f%an%x1f%s', '-n', '400', ref, '--', o.file], {cwd});
        if (!lg.ok) say('main 기록을 못 읽음 — 다시 봄');
        else {
          for (const [c, an, subject = ''] of lg.out.split('\n').filter(Boolean).map(l => l.split('\x1f'))) {
            const m = GATHER_RE.exec(subject);
            if (an !== BOT || !m || m[1] !== sha7) continue; // gather 커밋 · 이 판 것만 결과로 침
            if (!seen.has(c)) {
              const b = git(['cat-file', 'blob', `${c}:${o.file}`], {cwd});
              let rec = null; if (b.ok) { try { rec = JSON.parse(b.out); } catch {} }
              seen.set(c, rec);
            }
            const rec = seen.get(c);
            if (!rec || typeof rec !== 'object' || Array.isArray(rec) || String(rec.sha ?? '').toLowerCase() !== sha) { verdict = {kind: 'bad', why: '이 판의 결과 파일이 깨졌거나 다른 판을 적음'}; break; }
            const j = judge(rec, {sha, expected});
            if (j.kind === 'partial') { once('p' + c, `이 판의 검사가 일부 쪽만 돎(${j.why}) — 모든 쪽 결과를 기다림`); continue; }
            verdict = j; break; // 이 판의 가장 새 결과가 정함
          }
        }
      }
      if (verdict && verdict.kind !== 'pass') return {code: EXIT.fail, why: verdict.kind === 'fail' ? `검사 실패 — ${verdict.why}` : `결과를 믿을 수 없음 — ${verdict.why}`};
      if (verdict) {
        say(`검사 통과 확인 — ${verdict.why}${verdict.run ? ` · 검사 실행 ${verdict.run}` : ''}${verdict.data ? ` · 자료 ${verdict.data}` : ''}`);
        return {code: EXIT.pass, why: '같은 코드 · 모든 쪽 실패 0'};
      }
      const left = deadline - Date.now();
      if (o.dry) return {code: EXIT.timeout, why: '한 번 봤는데 이 판의 모든 쪽 결과가 아직 없음'};
      if (left <= 0) return {code: EXIT.timeout, why: `${o.maxMin}분 동안 이 판의 모든 쪽 결과가 없음${fetchFails ? ` · main 못 받음 ${fetchFails}번` : ''}`};
      if (Date.now() - lastBeat >= 120e3) { lastBeat = Date.now(); say(`아직 결과 없음 — ${mmss(Date.now() - t0)} 지남 · 남은 ${mmss(left)}`); }
      await sleep(Math.min(o.every * 1000, left));
    }
  } finally {
    git(['update-ref', '-d', ref], {cwd});
  }
}

/** 검사한 판과 올릴 판의 코드가 같은가 — 같으면 null · 아니면 멈춤 결과 · 검사한 판이 없으면 그 커밋 하나만 받음(망이 끊기면 세 번까지) */
async function codeDiff({o, sha, headSha, shallow, say}) {
  const has = () => git(['cat-file', '-e', `${sha}^{commit}`], {cwd: o.cwd}).ok;
  for (let i = 1; i <= 3 && !has(); i++) {
    if (i > 1) await sleep(Math.min(5e3, o.every * 1000));
    git(['fetch', '-q', '--no-tags', '--no-write-fetch-head', ...(shallow ? ['--depth=1'] : []), o.remote, sha], {cwd: o.cwd, timeout: 180e3});
  }
  if (!has()) return {code: EXIT.fail, why: '검사한 판을 못 받아 코드를 맞대지 못함'};
  const d = git(['diff', '--quiet', '--no-ext-diff', '--no-textconv', '--no-renames', sha, headSha, '--', ...o.paths], {cwd: o.cwd});
  if (d.status === 0) { say(`코드 같음 — 검사한 판과 올릴 판(${o.paths.length}곳 맞댐)`); return null; }
  if (d.status !== 1) return {code: EXIT.fail, why: '코드를 맞대지 못함(git diff 오류)'};
  const names = git(['diff', '--name-only', '-z', '--no-renames', sha, headSha, '--', ...o.paths], {cwd: o.cwd}).out.split('\0').filter(Boolean);
  return {code: EXIT.fail, why: `코드가 다름 — 바뀐 파일 ${names.length}개(${list(names.map(n => clean(n, 70)), 5)})`};
}

function parseArgs(argv) {
  const arg = (k, d) => { const i = argv.indexOf(k); return i >= 0 && i + 1 < argv.length ? argv[i + 1] : d; };
  const o = {
    sha: String(arg('--sha', process.env.PREVIEW_SHA ?? '')).trim().toLowerCase(),
    every: Number(arg('--every', '30')), maxMin: Number(arg('--max-min', '20')), depth: Number(arg('--depth', '80')),
    head: arg('--head', 'HEAD'), remote: arg('--remote', 'origin'), branch: arg('--branch', 'main'), file: arg('--file', SUMMARY_FILE),
    paths: arg('--paths') ? arg('--paths').split(/[\s,]+/).filter(Boolean) : [...CODE_PATHS], dry: argv.includes('--dry'), cwd: process.cwd(),
  };
  const bad = [];
  if (!/^[0-9a-f]{40}$/.test(o.sha)) bad.push('검사한 커밋 번호는 40자(0-9 a-f)');
  if (!(o.every > 0 && o.every <= 600)) bad.push('--every 는 0 초과 600 이하');
  if (!(o.maxMin > 0 && o.maxMin <= 240)) bad.push('--max-min 은 0 초과 240 이하');
  if (!(Number.isInteger(o.depth) && o.depth >= 1 && o.depth <= 5000)) bad.push('--depth 는 1 ~ 5000');
  for (const [k, v] of [['--head', o.head], ['--remote', o.remote], ['--branch', o.branch], ['--file', o.file]]) if (!SAFE.test(String(v)) || String(v).includes('..')) bad.push(`${k} 값이 이상함`);
  if (!o.paths.length || o.paths.some(p => !SAFE_PATH.test(p) || p.includes('..'))) bad.push('--paths 값이 이상함');
  return {o, bad};
}

export async function main(argv = process.argv.slice(2)) {
  const say = line => console.log(line);
  const {o, bad} = parseArgs(argv);
  let res;
  try { res = bad.length ? {code: EXIT.usage, why: '잘못 넣음 — ' + bad.join(' · ')} : await waitPreview({...o, say}); }
  catch (e) { res = {code: EXIT.fail, why: '기다리기 중 오류 ' + clean(e?.message ?? e, 80)}; } // 뜻밖의 오류도 닫힌 쪽으로
  const t = res.code === EXIT.pass ? '통과 — 올립니다' : `막힘 — ${res.why} — 올리지 않습니다`;
  say(t);
  try { if (process.env.GITHUB_STEP_SUMMARY) fs.appendFileSync(process.env.GITHUB_STEP_SUMMARY, `### 올리기 전 검사: ${res.code === EXIT.pass ? `통과 — ${res.why}` : t}\n\n`); } catch {}
  return res.code;
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  process.exitCode = await main();
}
