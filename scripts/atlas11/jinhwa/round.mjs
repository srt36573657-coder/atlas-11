#!/usr/bin/env node
// 진화 회차 — 사장님 2026-10-18(싱가포르) 16:39 「[꼴똘이 · 진화가 본질인 명령문]」 [8] 1 ~ 10 · [9] 8 · 9 · [10] 6 · 이름 = 골똘이(17:18)
//   예약 작업 「골똘이 진화 회차」(평일 09:30 · 11:30 · 13:30 · 17:30 서울)가 docs/design/kkolttori-2026-10-18/jinhwa-round.md 를 따라 이 도구를 차례로 부름
//   기계가 하는 일(되묻지 않음 · 닫힌 쪽으로 실패) — 사람(세 사람 토론 · 대안 고치기)이 하는 일은 지시문이 맡음
//
// 쓰는 법: node scripts/atlas11/jinhwa/round.mjs <명령> [옵션] — 결과는 표준 출력에 JSON 한 줄 · 진행 글은 표준 오류에 짧은 한국어
//   begin [--no-lock]                    회차 시작 — 본질 파일 읽기(해시 · 첫 줄) · 잠금 맞대기 · 회차 잠금 · 열쇠 없는 상태 읽기 · 할 일 셈(plan)
//   apply --id <번호>                    확인된 대안 하나 넣기 — plan 이 고른 번호만 · 넣기 직전 상태를 다시 봄(confirmed) · 가지 = 만든 그대로 · 지문 같음
//                                        · 다섯 파일 · 지킴 파일 0 · 본질 문(--diff) · 바뀐 쪽 검사 0 · 모든 쪽 미리 검사 0 · 다른 올리기를 기다림 · main 에 앞으로만
//   revert --id <번호>                   되돌리기 요청 하나 — 들어간 커밋을 git revert · 같은 검사 · main
//   fix-start / fix --kind <갈래> --what <글>   고장 고침 하나(깨진 길 · 날짜 「?」 · 오타 — 3파일 · 20줄 · 줄마다 작게 · css · 새 파일 0) — 넣거나 되돌린 회차에는 안 함
//   alt-start --n <1|2|3>                대안 일 폴더(main 그대로 · 가지 jinhwa/<회차>-<n>) — 그 폴더에서 고치고 커밋
//   alt --n <1|2|3> --route '#/…' [--seed k=v …]   대안 검사 — 다섯 · 지킴 · 잣대 신호 · 본질 문 · 큰 것 · 화면 글 낱말 · 지문 · 바뀐 쪽 검사 · 전후 그림 · 미리 검사 시작
//   cards --debate <파일>                토론 결과 → 카드(서로 다른 셋 · 1번 = 세 사람이 함께 고른 것 · 세 눈 · 섬기는 본질 줄 · 잣대 셋 · 낱말)
//   retest                               기다리는 대안을 지금 main 위에서 다시 시험(새로 안 만듦 · 지문 같음 · 빠른 검사 · 새 그림 · 미리 검사는 코드가 같으면 그대로)
//   finish [--wait <분>]                 미리 검사 결과 — 통과한 것만 기다리는 진화로 · 못 기다린 것은 다음 회차
//   score                                들어간 진화 채점(10거래일 뒤 · 열쇠 없는 합계 읽기 · 잣대 셋만)
//   record                               진화 칸 자료(site/next/data/jinhwa.json · 그림) · 기록 reports/atlas11/jinhwa/<회차>.json(새 파일만)을 main 에 · 사장님 세 줄 · 알림 한 줄
//   end                                  회차 잠금 풀기 · 일 폴더 지움
//   status                               열쇠 없는 상태 읽기만 · validate [파일] = 진화 칸 자료 꼴 검사 · empty [--write] = 정직한 빈 판(진화 0)
//   --selftest                           망 없이 자기 시험(가짜 git 원격 · 가짜 상태 · 가짜 검사로 begin → apply → record → revert 까지)
// 끝 코드: 0 = 했음 · 1 = 막음(까닭 why) · 2 = 잘못 부름 · 차례가 아님 · 3 = 바쁨(다른 회차 · 다른 올리기 — 다음 회차)
// 회차 상태: $JINHWA_RUN(없으면 <tmp>/jinhwa-run)/state.json · 일 폴더 wt/ · 그림 img/ · 지금 사이트 자료 live/
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {fileURLToPath, pathToFileURL} from 'node:url';
import * as L from './lib.mjs';
import * as G from './gh.mjs';

const HERE = path.dirname(fileURLToPath(import.meta.url));
export const ROOT = path.resolve(HERE, '../../..');
export const RUN_SCHEMA = 'kkolttori-jinhwa-run-1';
/** 회차 도구 · 본질 문 · 낱말 · 설정 — 회차를 연 폴더가 main 과 이것이 같아야 돎(가지 쪽 도구로 돌지 않음) */
export const TOOL_PATHS = Object.freeze(['scripts/atlas11/jinhwa', 'scripts/atlas11/next/essence_check.mjs', 'scripts/atlas11/next/wait_preview.mjs', 'site/next/words.js', 'site/next/brand.js', 'config/atlas11']);
export const CODE_PATHS = Object.freeze(['site', 'lib', 'scripts', 'functions', 'config', 'netlify', 'netlify.toml', 'package.json', 'package-lock.json', '.github/workflows/atlas11-next-full.yml']); // wait_preview CODE_PATHS 와 같음

class Stop extends Error { constructor(why, code = 1, extra = {}) { super(why); this.code = code; this.extra = extra; } }
const stop = (why, code = 1, extra) => { throw new Stop(why, code, extra); };
const readJson = f => { try { return JSON.parse(fs.readFileSync(f, 'utf8')); } catch { return null; } };

/** 진짜 손발(망 · git · 깃허브 · 브라우저) — 자기 시험은 이것을 갈음 */
export function realDeps({root = ROOT, run = process.env.JINHWA_RUN || path.join(os.tmpdir(), 'jinhwa-run')} = {}) {
  let lastWhy = '';
  return {
    root, run, now: () => new Date(), sleep: G.sleep, every: 30, waitDeploysMin: 20, previewMaxMin: 22,
    say: s => process.stderr.write(String(s) + '\n'),
    // 읽기 주소 — 늘 열쇠 없는 GET 둘뿐([9] 8) · 바로(curl) 못 닿으면 깃허브 작업 atlas11-jinhwa-read.yml 로 · JINHWA_SITE = 시험 서버로 바꿔 볼 때만(예 http://127.0.0.1:8826)
    //   못 읽은 까닭은 readWhy() 로 기록에 남김(2026-10-18 첫 회차 — 까닭이 「꼴을 모름」으로만 남아 묶음을 못 받은 것을 몰랐음)
    fetchStatus: async () => { const r = await G.readKeyless(root, {site: process.env.JINHWA_SITE || L.SITE, want: 'status', say: s => process.stderr.write(s + '\n')}); lastWhy = r.status ? '' : r.why; return r.status; },
    fetchTally: async days => { const r = await G.readKeyless(root, {site: process.env.JINHWA_SITE || L.SITE, want: 'tally', days, say: s => process.stderr.write(s + '\n')}); lastWhy = r.tally ? '' : r.why; return r.tally; },
    readWhy: () => lastWhy,
    ghRunner: G.gh,
    essenceDiff: (base, head) => G.essenceDiff(root, base, head),
    essenceStatic: siteDir => G.essenceStatic(root, siteDir),
    changedCheck: async (dir, files) => { const dev = await G.startDev(dir, {port: 8826}); if (!dev.ok) return {ok: false, fails: 1, tail: dev.why}; try { return G.changedCheck(dir, {files, base: dev.base, ownerKey: dev.ownerKey}); } finally { dev.stop(); } },
    quickCheck: async (dir, files) => { const dev = await G.startDev(dir, {port: 8827}); if (!dev.ok) return {ok: false, fails: 1, tail: dev.why}; try { return G.quickCheck(dir, {files, base: dev.base}); } finally { dev.stop(); } },
    previewStart: o => G.previewStart(root, o),
    previewResult: o => G.previewResult(root, {...o, codePaths: CODE_PATHS}),
    shoot: async o => (await import('./shots.mjs')).shoot(o),
    liveData: dir => G.liveData(dir, {top: true}),
  };
}

// ───────────── 상태 파일 ─────────────
const stateFile = run => path.join(run, 'state.json');
function load(D, {open = true} = {}) {
  const st = readJson(stateFile(D.run));
  if (!st || st.schema !== RUN_SCHEMA) stop('회차를 먼저 시작하세요(begin)', 2);
  if (open && st.ended) stop(`회차 ${st.id} 는 이미 끝남`, 2);
  return st;
}
const save = (D, st) => { fs.mkdirSync(D.run, {recursive: true}); fs.writeFileSync(stateFile(D.run), JSON.stringify(st, null, 1) + '\n'); };
const note = (st, s) => { st.log.push(`${L.isoKst(new Date())} ${s}`); };
const notDone = (st, s) => { if (!st.notDone.includes(s)) st.notDone.push(s); };

/** 낱말(words.js) · 이름(brand.js) — 회차를 연 폴더(main) 것 */
export async function loadWords(root) {
  const W = await import(pathToFileURL(path.join(root, 'site/next/words.js')).href);
  const B = await import(pathToFileURL(path.join(root, 'site/next/brand.js')).href);
  return {screenHits: W.screenHits, ruinHits: W.ruinHits ?? null, gainHits: W.gainHits ?? null, oldNames: B.BRAND.was.flatMap(x => [x.ko, x.en]).filter(Boolean), name: B.NAME};
}
const wordsOpt = w => ({screenHits: w.screenHits, ruinHits: w.ruinHits, gainHits: w.gainHits, oldNames: w.oldNames});
const metricsOf = root => readJson(path.join(root, L.METRICS_FILE));
/** main 커밋 글의 표시(「jinhwa: apply <번호>」 · 「jinhwa: revert <번호>」) — 기록 파일을 못 밀었어도 들어감 · 되돌림을 잃지 않게(기록 다음의 둘째 근거) */
export function marksOf(root, ref = 'origin/main') {
  const r = G.git(root, ['log', ref, '-n', '400', '-E', '--grep=^jinhwa: (apply|revert) ', '--format=%H%x1f%cI%x1f%B%x1e']);
  if (!r.ok) return [];
  const out = [];
  for (const chunk of r.out.split('\x1e')) {
    const [sha, at, body = ''] = chunk.trim().split('\x1f');
    if (!/^[0-9a-f]{40}$/.test(sha ?? '')) continue;
    for (const m of body.matchAll(/^jinhwa: (apply|revert) (\d{8}-\d{4}-[1-3])\b/gm)) out.push({kind: m[1], id: m[2], sha, at: L.isoKst(at)});
  }
  return out.reverse(); // 옛 것부터
}
/** 기록 + 커밋 표시 → memoryOf 가 읽는 꼴(표시는 기록 뒤에 덮음 — git 이 참) */
const recordsOf = st => [...L.readRecords(path.join(st.wt.main, L.REC_DIR)),
  ...(st.marks ?? []).map(m => ({schema: L.REC_SCHEMA, id: 'git', ...(m.kind === 'apply' ? {apply: {ok: true, id: m.id, merge: m.sha, at: m.at}} : {revert: {ok: true, id: m.id, commit: m.sha, at: m.at}})}))];
const emptyData = st => L.emptyJinhwa({essence: st.essence.first, now: new Date(st.start)});

// ───────────── begin ─────────────
export async function cmdBegin(a, D) {
  const old = readJson(stateFile(D.run));
  if (old?.schema === RUN_SCHEMA && !old.ended) stop(`회차 ${old.id} 가 아직 열려 있음 — end 를 먼저`, 2);
  if (old?.wt) for (const w of Object.values(old.wt)) if (typeof w === 'string') G.worktreeRemove(D.root, w);
  fs.rmSync(D.run, {recursive: true, force: true}); fs.mkdirSync(D.run, {recursive: true});
  const now = D.now(), id = L.roundId(now);
  const st = {schema: RUN_SCHEMA, id, start: L.isoKst(now), log: [], notDone: [], wt: {}, made: [], cards: [], retested: [], finished: [], dropped: [], fixed: [], scores: {}, newCards: [], retestedCards: {}};
  save(D, st);
  // ① 본질 먼저([8] 1 「맨 처음 본질 파일을 읽는다」) — 해시 · 첫 줄을 기록에 남김(읽었다는 증거)
  let ess; try { ess = L.readEssence(D.root); } catch { stop('본질 파일을 못 읽음 — 회차를 멈춤'); }
  st.essence = {file: ess.file, sha: ess.sha, first: ess.first};
  const lk = L.essenceLockCheck(D.root);
  if (!lk.ok) stop('본질 잠금이 맞지 않음 — 회차를 멈춤: ' + lk.why.join(' · '));
  // ② main · 회차 도구가 main 그대로인가
  if (!G.fetchMain(D.root).ok) stop('main 을 못 받음');
  st.main0 = G.revParse(D.root, 'origin/main');
  if (!st.main0) stop('main 을 못 찾음');
  if (!G.codeSame(D.root, 'HEAD', st.main0, TOOL_PATHS)) stop('회차 도구 · 본질 문 · 낱말이 main 과 다름 — main 을 받은 폴더에서 다시(git pull)', 2);
  // ③ 회차 잠금(한 번에 하나)
  if (!a['no-lock']) {
    const t = G.lockTake(D.root, {by: id, now});
    if (!t.ok) { st.ended = true; save(D, st); stop(t.why, t.busy ? 3 : 1); }
    st.lock = {sha: t.sha, stolen: t.stolen ?? null};
    save(D, st); // 아래에서 막혀도 end 가 잠금을 풀 수 있게
  }
  // ④ main 일 폴더 — 전 그림 · 기록 · 진화 칸 자료를 여기서 읽음
  st.wt.main = path.join(D.run, 'wt', 'main');
  const w = G.worktreeAdd(D.root, st.wt.main, st.main0);
  save(D, st);
  if (!w.ok) stop(w.why);
  const dataRaw = readJson(path.join(st.wt.main, L.DATA_FILE));
  if (dataRaw) {
    const v = L.validateJinhwa(dataRaw);
    if (!v.ok) stop('진화 칸 자료 꼴이 틀림 — 넣지 않고 멈춤: ' + v.errors.slice(0, 3).join(' · '));
  }
  st.data0 = dataRaw ?? emptyData(st);
  st.data0Missing = !dataRaw;
  // ⑤ 사실 잣대(지금 사이트 모든 쪽 검사 결과)
  const liveDir = path.join(st.wt.main, L.LIVE_DIR);
  const f = L.factsFrom(readJson(path.join(liveDir, 'summary.json')), name => readJson(path.join(liveDir, name + '.json')), now);
  st.facts = {mismatch: f.mismatch, at: f.at}; st.factsNote = f.note;
  st.marks = marksOf(D.root, st.main0);
  // ⑥ 열쇠 없는 상태 읽기([9] 8) → 할 일
  st.status = L.normalizeStatus(await D.fetchStatus());
  if (!st.status.ok && D.readWhy?.()) st.status.why += ` — ${G.short(D.readWhy(), 160)}`;
  st.cutoff = L.isoKst(L.roundCutoff(now));
  st.plan = L.planRound({data: st.data0, status: st.status, records: recordsOf(st), cutoff: st.cutoff});
  if (!st.status.ok) notDone(st, `확인 상태를 못 읽음(${st.status.why}) — 넣기 · 되돌리기 없음`);
  note(st, `시작 · 본질 ${ess.sha.slice(0, 8)} · main ${st.main0.slice(0, 7)} · 할 일 ${st.plan.change ? st.plan.change.kind + ' ' + st.plan.change.id : '넣기 없음'} → ${st.plan.next}`);
  save(D, st);
  return {id, essence: {file: ess.file, sha: ess.sha.slice(0, 8), first: ess.first}, main: st.main0.slice(0, 7), facts: st.facts,
    status: {ok: st.status.ok, items: st.status.items.length, why: st.status.why}, plan: st.plan};
}

// ───────────── 넣기 · 되돌리기 · 고장 고침 공통 ─────────────
/** 바뀐 것 문 — 다섯 · 지킴 · 잣대 신호 · 본질 문(--diff) · (expect 면) 지문 같음 */
function gate(D, {base, head, cwd, expectHash = null, allowDelete = false, max = L.MAX_FILES, onlyFiles = null}) {
  const d = G.diffInfo(cwd, base, head);
  const fc = L.fileCheck(d.files, {max, allowDelete, patch: d.patch});
  const why = [...fc.why];
  const ch = L.changeHash(d.patch);
  if (expectHash && ch !== expectHash) why.push('바뀐 내용이 사장님이 본 대안과 다름(지문이 다름)');
  if (onlyFiles) for (const f of d.files) if (!onlyFiles.includes(f.path)) why.push(`넣을 때 없던 파일 ${f.path}`);
  if (!why.length) { const e = D.essenceDiff(base, head); if (!e.ok) why.push(e.why); }
  return {ok: !why.length, why, files: d.files.map(f => f.path), d, changeHash: ch};
}
/** 본질 문 일곱 가지(정적) — 대안을 얹은 사이트가 지금 main 사이트보다 새로 걸리는 곳이 없어야 함(새로 걸리면 업데이트 올리기가 통째로 막힘 · KA 문)
 *  바탕(main) 결과는 회차에 한 번만 셈 · 문을 못 돌리면 막음(닫힌 쪽) */
function staticGate(D, st, dir) {
  if (!st.gateBase) { st.gateBase = D.essenceStatic(path.join(st.wt.main, 'site')); save(D, st); }
  if (!st.gateBase.ran) return {ok: false, why: '본질 문 일곱 가지를 못 돌림 — ' + st.gateBase.why};
  const a = D.essenceStatic(path.join(dir, 'site'));
  if (!a.ran) return {ok: false, why: '본질 문 일곱 가지를 못 돌림 — ' + a.why};
  const old = new Set(st.gateBase.fails), added = a.fails.filter(x => !old.has(x));
  return added.length ? {ok: false, why: `본질 문 일곱 가지에 새로 걸림 ${added.length}곳 — ${added.slice(0, 2).join(' · ')}`} : {ok: true, why: ''};
}
/** 미리 검사 — 검사한 판(checked) 가운데 코드가 같은 것이 있으면 그 결과 · 없으면 새로(try 가지) 돌리고 기다림 */
async function previewFor(D, {head, checked = [], branch, maxMin}) {
  for (const sha of [...checked].reverse()) {
    const r = await D.previewResult({sha, head, maxMin: 0});
    if (r.state === 'pass') return {state: 'pass', how: 'reuse', sha};
  }
  const ps = D.previewStart({sha: head, branch, expect: null});
  if (!ps.ok) return {state: 'fail', why: ps.why, how: 'new'};
  const r = await D.previewResult({sha: head, head, maxMin});
  return {...r, how: 'new', sha: head, run: ps.run ?? null};
}
/** main 에 앞으로만 — 그새 main 이 기록만 바뀌어 앞서 갔으면 새 main 위에 다시 얹어(코드가 같을 때만) 다시 밂 */
async function pushMainSafe(D, wt, {head, base, msg}) {
  const want = L.changeHash(G.diffInfo(wt, base, head).patch);
  for (let i = 0; i < 5; i++) {
    const p = G.pushMain(wt, head);
    if (p.ok) return {ok: true, sha: head};
    if (!p.rejected) return {ok: false, why: 'main 에 못 밂 ' + p.why};
    if (!G.fetchMain(D.root).ok) return {ok: false, why: 'main 을 못 받음'};
    const nb = G.revParse(D.root, 'origin/main');
    if (!G.codeSame(D.root, base, nb, CODE_PATHS)) return {ok: false, why: 'main 의 코드가 그새 바뀜 — 검사한 판과 달라 넣지 않음(다음 회차)'};
    const r = G.replayOnto(wt, head, nb, msg);
    if (!r.ok) return r;
    if (L.changeHash(G.diffInfo(wt, nb, r.sha).patch) !== want) return {ok: false, why: '다시 얹은 판의 바뀐 것이 달라짐'};
    base = nb; head = r.sha;
    await D.sleep(500);
  }
  return {ok: false, why: 'main 이 계속 앞서 감 — 다음 회차'};
}
/** 넣기 전 「다른 올리기」 기다림 */
async function deploysClear(D) {
  const wd = await G.waitDeploys(D.root, {maxMin: D.waitDeploysMin, every: D.every, say: D.say, runner: D.ghRunner});
  return wd;
}
const recentStatus = async (D, id) => { const s = L.normalizeStatus(await D.fetchStatus()); return {s, it: s.ok ? s.items.find(x => x.id === id) : null}; };

// ───────────── apply ─────────────
export async function cmdApply(a, D) {
  const st = load(D), id = String(a.id ?? '');
  const fail = (why, code = 1) => { st.apply = {ok: false, id, why}; notDone(st, `확인된 진화 ${id} 를 넣지 못함 — ${why}`); note(st, '넣기 막힘 ' + why); save(D, st); stop(why, code); };
  if (st.plan?.change?.kind !== 'apply' || st.plan.change.id !== id) stop('이번 회차에 넣을 번호가 아님 — plan 이 고른 확인된 것 하나만 넣음', 2);
  if (st.apply?.ok || st.revert?.ok) stop('이번 회차에 이미 넣음 — 한 번에 하나', 2);
  const {s, it} = await recentStatus(D, id);
  if (!it || it.state !== 'confirmed') fail(`넣기 직전 상태가 확인이 아님(${it?.state ?? (s.ok ? '없음' : s.why)})`);
  const g = L.memoryOf(recordsOf(st)).get(id), w = st.data0.waiting.find(x => x.id === id);
  if (!w || !g?.changeHash || !g?.commit) fail('기다리는 목록 · 지문 기록이 없음');
  if (!G.fetchBranch(D.root, L.branchOf(id)).ok) fail('대안 가지를 못 받음');
  const tip = G.revParse(D.root, `origin/${L.branchOf(id)}`);
  if (tip !== g.commit) fail('대안 가지가 만든 뒤 바뀜 — 사장님이 본 것과 다름');
  const wd = await deploysClear(D);
  if (!wd.clear) fail('다른 올리기가 아직 돎 — 다음 회차', 3);
  if (!G.fetchMain(D.root).ok) fail('main 을 못 받음');
  const base = G.revParse(D.root, 'origin/main');
  st.wt.apply = path.join(D.run, 'wt', 'apply');
  const wa = G.worktreeAdd(D.root, st.wt.apply, base); if (!wa.ok) fail(wa.why);
  const W = await loadWords(D.root);
  const msg = `${W.name} 진화 ${id} 들어감 — ${w.title}\n\n사장님 확인 ${it.at ?? '?'} · 진화 회차 ${st.id} · 가지 ${L.branchOf(id)} · 지문 ${g.changeHash}\n([8] 2 확인된 대안 하나 · 다섯 파일 안 · 바뀐 쪽 검사 · 모든 쪽 미리 검사 0)\n\njinhwa: apply ${id} ${g.changeHash}`;
  const ap = G.applyOnto(st.wt.apply, tip, base, msg);
  if (!ap.ok) fail(ap.why);
  const gt = gate(D, {base, head: ap.sha, cwd: st.wt.apply, expectHash: g.changeHash});
  if (!gt.ok) fail(gt.why.join(' · '));
  const sg = staticGate(D, st, st.wt.apply);
  if (!sg.ok) fail(sg.why);
  D.say(`넣기 — 바뀐 쪽 검사(${gt.files.join(', ')})`);
  const cc = await D.changedCheck(st.wt.apply, gt.files);
  if (cc.fails) fail(`바뀐 쪽 검사 실패 ${cc.fails}`);
  D.say('넣기 — 모든 쪽 미리 검사');
  const pv = await previewFor(D, {head: ap.sha, checked: g.checked, branch: L.tryBranchOf(id), maxMin: D.previewMaxMin});
  if (pv.state !== 'pass') fail(pv.state === 'running' ? '모든 쪽 미리 검사 결과를 못 기다림 — 다음 회차' : `모든 쪽 미리 검사 실패 — ${pv.why ?? ''}`, pv.state === 'running' ? 3 : 1);
  const wd2 = await deploysClear(D); // 검사를 기다리는 동안 업데이트가 시작됐을 수 있음 — 끝난 뒤에 밂([8] 2)
  if (!wd2.clear) fail('다른 올리기가 아직 돎 — 다음 회차', 3);
  const s2 = await recentStatus(D, id); // 밀기 바로 전 마지막으로 — 그새 거뒀으면 넣지 않음([9] 5)
  if (s2.it?.state !== 'confirmed') fail('밀기 직전에 확인이 거둬짐');
  const pm = await pushMainSafe(D, st.wt.apply, {head: ap.sha, base, msg});
  if (!pm.ok) fail(pm.why);
  const at = D.now();
  st.apply = {ok: true, id, at: L.isoKst(at), merge: pm.sha, carry: L.isoKst(L.carrySlot(at)), files: gt.files, changeHash: g.changeHash, confirmedAt: it.at, checks: {changed: 0, preview: 0}, preview: {how: pv.how, sha: pv.sha}};
  note(st, `넣음 ${id} → main ${pm.sha.slice(0, 7)} · ${L.sayKst(L.carrySlot(at))} 업데이트`);
  save(D, st);
  return st.apply;
}

// ───────────── revert ─────────────
export async function cmdRevert(a, D) {
  const st = load(D), id = String(a.id ?? '');
  const fail = (why, code = 1) => { st.revert = {ok: false, id, why}; notDone(st, `되돌리기 ${id} 를 못 함 — ${why}`); note(st, '되돌리기 막힘 ' + why); save(D, st); stop(why, code); };
  if (st.plan?.change?.kind !== 'revert' || st.plan.change.id !== id) stop('이번 회차에 되돌릴 번호가 아님', 2);
  if (st.apply?.ok || st.revert?.ok) stop('이번 회차에 이미 바꿈 — 한 번에 하나', 2);
  const {s, it} = await recentStatus(D, id);
  if (!it || it.state !== 'revert') fail(`되돌리기 직전 상태가 되돌리기 요청이 아님(${it?.state ?? (s.ok ? '없음' : s.why)})`);
  const g = L.memoryOf(recordsOf(st)).get(id);
  if (!g?.merge) fail('들어간 커밋 기록이 없음');
  const wd = await deploysClear(D);
  if (!wd.clear) fail('다른 올리기가 아직 돎 — 다음 회차', 3);
  if (!G.fetchMain(D.root).ok) fail('main 을 못 받음');
  const base = G.revParse(D.root, 'origin/main');
  if (!G.git(D.root, ['cat-file', '-e', g.merge + '^{commit}']).ok) G.git(D.root, ['fetch', '-q', '--no-tags', 'origin', g.merge]); // 얕은 사본이면 그 커밋만 받음
  if (!G.isAncestor(D.root, g.merge, base)) fail('들어간 커밋이 main 에 없음');
  st.wt.revert = path.join(D.run, 'wt', 'revert');
  const wa = G.worktreeAdd(D.root, st.wt.revert, base); if (!wa.ok) fail(wa.why);
  const W = await loadWords(D.root);
  const msg = `${W.name} 진화 ${id} 되돌림\n\n사장님 되돌리기 요청 ${it.at ?? '?'} · 진화 회차 ${st.id} · 되돌린 커밋 ${g.merge.slice(0, 12)}\n\njinhwa: revert ${id}`;
  const rv = G.git(st.wt.revert, ['revert', '--no-commit', g.merge]);
  if (!rv.ok) { G.git(st.wt.revert, ['revert', '--abort']); fail('되돌리면 부딪힘 — 손으로 봐야 함'); }
  const c = G.git(st.wt.revert, ['commit', '-q', '--no-verify', '-m', msg]);
  if (!c.ok) fail('되돌림 커밋을 못 만듦');
  const head = G.revParse(st.wt.revert, 'HEAD');
  const gt = gate(D, {base, head, cwd: st.wt.revert, allowDelete: true, onlyFiles: g.files ?? []});
  if (!gt.ok) fail(gt.why.join(' · '));
  const sg = staticGate(D, st, st.wt.revert);
  if (!sg.ok) fail(sg.why);
  const cc = await D.changedCheck(st.wt.revert, gt.files.filter(f => fs.existsSync(path.join(st.wt.revert, f))));
  if (cc.fails) fail(`바뀐 쪽 검사 실패 ${cc.fails}`);
  const pv = await previewFor(D, {head, checked: [], branch: L.tryBranchOf(id), maxMin: D.previewMaxMin});
  if (pv.state !== 'pass') fail(pv.state === 'running' ? '모든 쪽 미리 검사 결과를 못 기다림 — 다음 회차' : `모든 쪽 미리 검사 실패 — ${pv.why ?? ''}`, pv.state === 'running' ? 3 : 1);
  const wd2 = await deploysClear(D);
  if (!wd2.clear) fail('다른 올리기가 아직 돎 — 다음 회차', 3);
  const s2 = await recentStatus(D, id);
  if (s2.it?.state !== 'revert') fail('밀기 직전에 되돌리기 요청이 거둬짐');
  const pm = await pushMainSafe(D, st.wt.revert, {head, base, msg});
  if (!pm.ok) fail(pm.why);
  const at = D.now();
  st.revert = {ok: true, id, at: L.isoKst(at), commit: pm.sha, carry: L.isoKst(L.carrySlot(at)), files: gt.files};
  note(st, `되돌림 ${id} → main ${pm.sha.slice(0, 7)}`);
  save(D, st);
  return st.revert;
}

// ───────────── 고장 고침([8] 9) ─────────────
export async function cmdFixStart(a, D) {
  const st = load(D);
  if (st.apply?.ok || st.revert?.ok) stop('넣거나 되돌린 회차 — 고장 고침은 다음 회차', 2);
  if (st.fixed.length >= L.FIX_MAX_PER_ROUND || st.fixing) stop(`고장 고침은 회차마다 ${L.FIX_MAX_PER_ROUND}개`, 2);
  const id = `${st.id}-f1`, dir = path.join(D.run, 'wt', 'fix');
  const w = G.worktreeAdd(D.root, dir, st.main0, {branch: L.fixBranchOf(id)});
  if (!w.ok) stop(w.why);
  st.fixing = {id, dir}; st.wt.fix = dir; save(D, st);
  return {id, dir, branch: L.fixBranchOf(id), base: st.main0.slice(0, 7)};
}
export async function cmdFix(a, D) {
  const st = load(D);
  if (!st.fixing) stop('fix-start 를 먼저', 2);
  const {id, dir} = st.fixing, kind = String(a.kind ?? ''), what = String(a.what ?? '').trim();
  const W = await loadWords(D.root);
  const fail = why => { st.fixing.fail = why; notDone(st, `고장 고침 못 함 — ${why}`); save(D, st); stop(why); };
  const head = G.revParse(dir, 'HEAD');
  if (!head || head === st.main0 || !G.isAncestor(D.root, st.main0, head)) fail('고친 커밋이 없음(main 위에서 커밋)');
  const d = G.diffInfo(D.root, st.main0, head);
  const fc = L.fixCheck(d.files, d.numstat, kind, d.patch);
  const why = [...fc.why];
  if (!what || what.length > L.LIM.what) why.push(`고친 것 글은 1 ~ ${L.LIM.what}자`);
  for (const h of L.textHits(what, wordsOpt(W))) why.push('고친 것 글 — ' + h);
  for (const t of L.addedKoreanStrings(d.patch)) for (const h of L.textHits(t, wordsOpt(W))) why.push(`더한 글 「${t.slice(0, 20)}」 — ${h}`);
  if (!why.length) { const e = D.essenceDiff(st.main0, head); if (!e.ok) why.push(e.why); }
  if (!why.length) { const sg = staticGate(D, st, dir); if (!sg.ok) why.push(sg.why); }
  if (why.length) fail(why.join(' · '));
  const files = d.files.map(f => f.path);
  const cc = await D.changedCheck(dir, files);
  if (cc.fails) fail(`바뀐 쪽 검사 실패 ${cc.fails}`);
  const pv = await previewFor(D, {head, checked: [], branch: L.fixBranchOf(id), maxMin: D.previewMaxMin});
  if (pv.state !== 'pass') fail(pv.state === 'running' ? '모든 쪽 미리 검사 결과를 못 기다림' : `모든 쪽 미리 검사 실패 — ${pv.why ?? ''}`);
  const wd = await deploysClear(D);
  if (!wd.clear) fail('다른 올리기가 아직 돎');
  if (!G.fetchMain(D.root).ok) fail('main 을 못 받음');
  const base = G.revParse(D.root, 'origin/main');
  const wt = path.join(D.run, 'wt', 'fixmain'); st.wt.fixmain = wt;
  if (!G.worktreeAdd(D.root, wt, base).ok) fail('일 폴더를 못 만듦');
  const msg = `${W.name} 고친 고장(${kind}) — ${what}\n\n진화 회차 ${st.id} · 진화 아님([8] 9) · ${files.length}파일 · ${fc.lines}줄\n\njinhwa: fix ${id}`;
  const ap = G.applyOnto(wt, head, base, msg);
  if (!ap.ok) fail(ap.why);
  if (!G.codeSame(D.root, ap.sha, head, CODE_PATHS)) fail('main 의 코드가 그새 바뀜 — 검사한 판과 달라 넣지 않음(다음 회차)');
  const pm = await pushMainSafe(D, wt, {head: ap.sha, base, msg});
  if (!pm.ok) fail(pm.why);
  const at = L.isoKst(D.now());
  st.fixed.push({id, at, what, kind, commit: pm.sha, files, lines: fc.lines});
  delete st.fixing; note(st, `고친 고장 ${id} → main ${pm.sha.slice(0, 7)}`); save(D, st);
  return st.fixed[st.fixed.length - 1];
}

// ───────────── 대안 만들기([8] 3 ~ 8) ─────────────
const altId = (st, n) => `${st.id}-${n}`;
export async function cmdAltStart(a, D) {
  const st = load(D), n = Number(a.n);
  if (st.plan?.next !== 'make') stop(`이번 회차는 새 대안을 만들지 않음(할 일 ${st.plan?.next}) — 기다리는 대안이 있으면 다시 시험만([8] 3)`, 2);
  if (![1, 2, 3].includes(n)) stop('--n 은 1 · 2 · 3', 2);
  const id = altId(st, n), dir = path.join(D.run, 'wt', 'alt-' + n);
  const w = G.worktreeAdd(D.root, dir, st.main0, {branch: L.branchOf(id)});
  if (!w.ok) stop(w.why);
  st.wt['alt' + n] = dir; save(D, st);
  return {id, dir, branch: L.branchOf(id), base: st.main0.slice(0, 7), max: L.MAX_FILES};
}
export async function cmdAlt(a, D) {
  const st = load(D), n = Number(a.n), route = String(a.route ?? '#/');
  if (st.plan?.next !== 'make') stop('이번 회차는 새 대안을 만들지 않음', 2);
  const id = altId(st, n), dir = st.wt['alt' + n];
  if (!dir || !fs.existsSync(dir)) stop('alt-start 를 먼저', 2);
  const prev = st.made.find(m => m.n === n);
  if (prev?.preview?.run || prev?.preview?.state === 'running') stop('이 대안은 이미 미리 검사를 시작함 — 고치려면 다른 번호로', 2);
  st.made = st.made.filter(m => m.n !== n);
  const W = await loadWords(D.root);
  const head = G.revParse(dir, 'HEAD');
  const made = {n, id, ok: false, route, seed: a.seed ?? {}, commit: head, base: st.main0, why: []};
  const done = () => { st.made.push(made); save(D, st); if (!made.ok) stop(made.why.join(' · ')); return made; };
  if (!head || head === st.main0 || !G.isAncestor(D.root, st.main0, head)) { made.why.push('고친 커밋이 없음(alt-start 폴더에서 커밋)'); return done(); }
  const d = G.diffInfo(D.root, st.main0, head);
  const fc = L.fileCheck(d.files, {patch: d.patch});
  made.files = d.files.map(f => f.path); made.changeHash = L.changeHash(d.patch);
  const tp = dropBuilt(d.patch); // 영어 사전(빌드한 한 줄짜리 큰 JSON · 원본의 쉼표 붙은 옛 줄)은 낱말 · 큰 것 셈에서 뺌 — 그 안의 옛 글이 「더한 글」로 잡히지 않게
  made.big = L.bigReasons(d.files, L.addedText(tp));
  made.why.push(...fc.why);
  for (const t of L.addedKoreanStrings(tp)) for (const h of L.textHits(t, wordsOpt(W))) made.why.push(`더한 글 「${t.slice(0, 20)}」 — ${h}`);
  for (const o of st.made) if (o.ok && o.changeHash === made.changeHash) made.why.push(`대안 ${o.n} 과 같은 고침 — 서로 달라야 함`);
  const en = await enGaps(D.root, dir, d.patch); // 영어 없는 새 화면 글 — 미리 검사를 쓰기 전에 막음(첫 회차 대안 셋이 en 에서 떨어짐)
  if (!en.ok) { made.why.push(en.why); made.en = {gaps: en.gaps.slice(0, 5), stale: en.stale.slice(0, 5)}; }
  if (!made.why.length) { const e = D.essenceDiff(st.main0, head); if (!e.ok) made.why.push(e.why); }
  if (!made.why.length) { const sg = staticGate(D, st, dir); if (!sg.ok) made.why.push(sg.why); }
  if (made.why.length) return done();
  D.say(`대안 ${n} — 바뀐 쪽 검사(${made.files.join(', ')})`);
  const cc = await D.changedCheck(dir, made.files);
  made.changed = {fails: cc.fails, tail: cc.ok ? '' : cc.tail};
  if (cc.fails) { made.why.push(`바뀐 쪽 검사 실패 ${cc.fails}`); return done(); }
  const live = await liveOnce(D, st);
  const sh = await D.shoot({id, route, before: st.wt.main, after: dir, out: path.join(D.run, 'img'), seed: a.seed ?? {}, live});
  if (!sh.ok) { made.why.push('전후 그림을 못 찍음 — ' + (sh.why ?? '')); return done(); }
  const ps = D.previewStart({sha: head, branch: L.branchOf(id), expect: ''});
  if (!ps.ok) { made.why.push('모든 쪽 미리 검사를 못 시작함 — ' + ps.why); return done(); }
  made.preview = {state: 'running', run: ps.run ?? null, sha: head, at: L.isoKst(D.now())};
  made.ok = true; made.why = [];
  note(st, `대안 ${n} 검사 지남 · 미리 검사 시작 ${ps.run ?? '?'}`);
  return done();
}
/** 바뀐 것에서 영어 사전(site/next/i18n/ — i18n_build.mjs 가 만든 한 줄짜리 · 원본 scripts/atlas11/next/i18n/ — 쉼표만 붙은 옛 줄)을 뺀 것 — 화면 글은 화면 파일 쪽에서 봄 */
export function dropBuilt(patch) {
  let on = true; const out = [];
  for (const l of String(patch).split('\n')) { if (l.startsWith('diff --git ')) on = !/ b\/(site\/next\/i18n\/|scripts\/atlas11\/next\/i18n\/)/.test(l); if (on) out.push(l); }
  return out.join('\n');
}
/** 영어 사전에 없는 화면 글 — 2026-10-18 20:20 첫 회차: 대안 셋이 p-why.js 에 영어 없는 한국어 글을 넣어 모든 쪽 미리 검사(en · share · past)에서 모두 떨어짐
 *  → 미리 검사(약 20분) 전에 여기서 막음. 엔진 = 회차를 연 폴더(main)의 site/next/i18n.js 그대로(틀 {n} {q} {e} {d} 나누기 · 「 · 」 쪼개기 — 새 셈을 만들지 않음)
 *  사전 = 대안 폴더의 site/next/i18n/en.json(사이트가 실제로 읽는 것) · en-names.json · 원본 en-src.json 에만 있으면 「i18n_build 를 안 돌림」
 *  보는 글 = 더한 줄의 따옴표 안 한글(L.addedKoreanStrings) — site/next 의 .js · .html 만 · 사전 · 자료 파일 · lang="ko" 원문 줄은 뺌 · ${…} 는 숫자 · 빈칸 · 이름으로 넣고 앞뒤에 이름 · 숫자를 붙여 봐서 하나라도 영어가 되면 지남(잘못 막지 않는 쪽)
 *  돌려줌 {ok, gaps: [{text, keys}], stale(원본엔 있으나 사전에 없음), why} · 엔진 · 사전을 못 읽으면 ok false(닫힌 쪽) */
export async function enGaps(root, dir, patch) {
  const keep = [], cur = {on: false};
  for (const l of String(patch).split('\n')) {
    if (l.startsWith('diff --git ')) { const f = / b\/(.+)$/.exec(l)?.[1] ?? ''; cur.on = /^site\/next\/(?!data\/|i18n\/)[^]*\.(js|html)$/.test(f); cur.js = /\.js$/.test(f); }
    if (!cur.on || /lang\s*[:=]\s*\\?['"]ko\\?['"]/.test(l) || /^\+\s*(\*|\/\*|\/\/)/.test(l)) continue; // 원문 줄 · 주석 줄은 화면 글이 아님
    if (cur.js && l.startsWith('+') && !/['"`]/.test(l)) continue; // .js 의 따옴표 없는 줄 = 여러 줄 주석 속(화면 글은 따옴표 안에만)
    keep.push(l);
  }
  const texts = [...new Set(L.addedKoreanStrings(keep.join('\n')))];
  if (!texts.length) return {ok: true, gaps: [], stale: [], why: ''};
  const J = f => JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8'));
  const engine = async (dict, names) => { // 한 번 쓰는 엔진 — 주소 꼬리로 따로 읽어 사전 · 캐시가 섞이지 않음 · 영어로 켜려고 잠깐 location 을 둠
    const had = Object.prototype.hasOwnProperty.call(globalThis, 'location'), old = globalThis.location;
    globalThis.location = {pathname: '/next/', search: '?lang=en', hash: ''};
    try { const m = await import(pathToFileURL(path.join(root, 'site/next/i18n.js')).href + '?jinhwa-en-' + Math.random().toString(36).slice(2)); m.useDict(dict, names?.names ?? null, names?.latin ?? null); return m; }
    finally { if (had) globalThis.location = old; else delete globalThis.location; }
  };
  let site, src, names;
  try {
    names = J('site/next/i18n/en-names.json');
    site = await engine(J('site/next/i18n/en.json'), names);
    const S = J('scripts/atlas11/next/i18n/en-src.json'); src = await engine({templates: S.templates, entities: S.entities}, names);
  } catch (e) { return {ok: false, gaps: [], stale: [], why: '영어 사전 · 엔진을 못 읽음 — ' + G.short(e?.message ?? e, 80)}; }
  if (!site.ON) return {ok: false, gaps: [], stale: [], why: '영어 엔진이 영어로 켜지지 않음'};
  const HAN = /[가-힣]/;
  // 코드 조각(정규식 · 이어 붙인 식)과 한 글자 단위(조 · 억 · 원)는 화면 글이 아님 — 따옴표만으로 JS 를 다 가를 수 없어 이 둘은 뺌
  const segs = t => String(t).replace(/\\n/g, ' ').replace(/\\(['"`\\])/g, '$1').split(/<[^>]*>/).map(x => x.trim())
    .filter(x => HAN.test(x) && (x.match(/[가-힣]/g) ?? []).length >= 2 && !/[\[\]\\|^]|\)\.|=>|\.(replace|match|test|split)\(/.test(x));
  // ${…} 는 숫자 · 빈칸 · 이름으로, 앞뒤에 이어 붙는 값(이름 + ' 관심에 담았어요')은 이름 · 숫자로 붙여 봄 — 하나라도 한글 없이 바뀌면 지남
  const ent = Object.keys(names?.names ?? {}).find(k => HAN.test(k)) ?? '반도체';
  const variants = x => (x.includes('${') ? ['7', '', ent] : ['']).map(v => x.replace(/\$\{[^}]*\}/g, v).replace(/\s{2,}/g, ' ').trim()).filter(Boolean)
    .flatMap(v => [v, `${ent} ${v}`, `${ent}${v}`, `${v} ${ent}`, `7${v}`, `${v} 7`]);
  const passes = (m, x) => variants(x).some(v => !HAN.test(m.t(v)));
  const gaps = [], stale = [];
  for (const t of texts) for (const x of segs(t)) {
    if (passes(site, x)) continue;
    const before = new Set(src.missing().map(k => k.key)), base = variants(x)[0] ?? x; // 빠진 틀 = 원본 사전으로도 못 바꾼 조각(엔진 missing · 「…」 안 글 포함)
    if (passes(src, x)) { stale.push(x); continue; }
    gaps.push({text: x, keys: [...new Set([...src.missing().map(k => k.key).filter(k => !before.has(k)), src.templateOf(base).key])].slice(0, 3)});
  }
  const why = [];
  if (gaps.length) why.push(`영어 사전에 없는 화면 글 ${gaps.length}개(${[...new Set(gaps.flatMap(g => (g.keys.length ? g.keys : [g.text])))].slice(0, 3).map(k => `「${k.slice(0, 40)}」`).join(' · ')}) — 같은 가지에서 node scripts/atlas11/next/i18n/add.mjs "<한국어 틀>" "<영어>" → node scripts/atlas11/next/i18n_build.mjs 를 돌려 함께 커밋(두 파일도 다섯에 듦 · 틀의 {n} {q} {e} 는 그대로)`);
  if (stale.length) why.push(`영어 원본(en-src.json)에는 있으나 사이트 사전(site/next/i18n/en.json)에 없는 글 ${stale.length}개(「${stale[0].slice(0, 30)}」) — node scripts/atlas11/next/i18n_build.mjs 를 돌려 함께 커밋`);
  return {ok: !why.length, gaps, stale, why: why.join(' · ')};
}
/** 지금 사이트 자료 — 회차에 한 번만(전후 그림이 같은 자료를 씀 · 못 받으면 저장소 자료 그대로 · 기록에 적음) */
async function liveOnce(D, st) {
  if (st.live === undefined) {
    const dir = path.join(D.run, 'live');
    const r = await D.liveData(dir);
    st.live = r.ok ? dir : null;
    if (!r.ok) notDone(st, `전후 그림에 지금 사이트 자료를 못 씀(${r.why}) — 저장소 자료로 찍음`);
    save(D, st);
  }
  return st.live;
}

// ───────────── 카드(토론 결과) ─────────────
export async function cmdCards(a, D) {
  const st = load(D);
  if (st.plan?.next !== 'make') stop('이번 회차는 새 대안을 만들지 않음', 2);
  const debate = readJson(String(a.debate ?? ''));
  if (!debate || !Array.isArray(debate.alts)) stop('--debate 파일을 못 읽음(alts 목록)', 2);
  const W = await loadWords(D.root), metrics = metricsOf(D.root), ess = L.readEssence(D.root), units = L.essenceUnits(ess.lines);
  if (!metrics) stop('잣대 파일을 못 읽음');
  const why = [];
  const alts = debate.alts.map(x => { const m = st.made.find(y => y.n === x.n && y.ok); if (!m) why.push(`대안 ${x.n} — 검사를 지난 가지가 없음`); return {...x, changeHash: m?.changeHash, files: m?.files ?? []}; });
  const pc = L.pickCheck({top: debate.top, alts});
  why.push(...pc.why);
  const cards = [];
  if (pc.ok) for (const n of pc.order) {
    const x = alts.find(y => y.n === n), m = st.made.find(y => y.n === n);
    const c = L.cardFrom(x, {id: m.id, pick: n === pc.order[0], files: m.files, units, metrics, big: m.big ?? [], words: wordsOpt(W)});
    if (!c.ok) why.push(`대안 ${n}: ${c.why.join(' · ')}`);
    cards.push({n, id: m.id, ok: c.ok, rule: c.rule, card: c.card});
  }
  const people = debate.people && typeof debate.people === 'object' ? Object.fromEntries(L.PEOPLE.map(p => [p, String(debate.people[p] ?? '').slice(0, 400)])) : null;
  st.debate = {mode: ['subagents', 'single'].includes(debate.mode) ? debate.mode : '?', top: debate.top ?? null, order: pc.order, people, at: L.isoKst(D.now()), ok: !why.length, why};
  st.cards = why.length ? [] : cards;
  save(D, st);
  if (why.length) stop(why.join(' / '));
  return {order: pc.order, cards: cards.map(c => ({n: c.n, id: c.id, title: c.card.title, pick: c.card.pick, big: c.card.big, measure: c.card.predict.measure}))};
}

// ───────────── 미리 검사 결과(finish) ─────────────
export async function cmdFinish(a, D) {
  const st = load(D), waitMin = Number(a.wait ?? 0);
  const mem = L.memoryOf(recordsOf(st));
  const todo = [];
  for (const m of st.made) if (m.ok && m.preview?.state === 'running' && !st.finished.some(f => f.id === m.id)) todo.push({id: m.id, kind: 'made', sha: m.commit, round: st.id});
  for (const r of st.retested) if (r.ok && r.preview?.state === 'running' && !st.finished.some(f => f.id === r.id)) todo.push({id: r.id, kind: 'retest', sha: r.sha, round: st.id});
  for (const id of st.plan?.pending ?? []) { const g = mem.get(id); if (g?.pending && !todo.some(t => t.id === id) && !st.finished.some(f => f.id === id)) todo.push({id, kind: g.pending.kind, sha: g.pending.sha, round: g.pending.round}); }
  const end = Date.now() + waitMin * 60e3, res = new Map();
  for (;;) {
    for (const t of todo) {
      if (res.has(t.id)) continue;
      const r = await D.previewResult({sha: t.sha, head: t.sha, maxMin: 0});
      if (r.state !== 'running') res.set(t.id, {...t, state: r.state, why: r.why ?? ''});
    }
    if (res.size === todo.length || Date.now() >= end) break;
    await D.sleep(D.every * 1000);
  }
  for (const t of todo) {
    const r = res.get(t.id);
    if (!r) continue; // 아직 — 다음 회차가 이어서 봄(pending)
    st.finished.push({id: t.id, kind: t.kind, state: r.state, sha: t.sha, round: t.round, why: r.state === 'fail' ? r.why : ''});
    if (r.state === 'fail') { st.dropped.push({id: t.id, why: '모든 쪽 미리 검사 실패'}); if (t.kind === 'made') { const m = st.made.find(x => x.id === t.id); if (m) m.preview.state = 'fail'; } }
    else if (t.kind === 'made') { const m = st.made.find(x => x.id === t.id); if (m) m.preview.state = 'pass'; }
    else if (t.kind === 'retest') { const r2 = st.retested.find(x => x.id === t.id); if (r2) r2.preview.state = 'pass'; }
  }
  // 새 카드 — 한 회차에 만든 대안이 모두 끝났을 때만(1번이 늦으면 셋 모두 기다림 — 1번 없이 2 · 3번만 먼저 올리지 않음)
  const groups = new Map();
  for (const t of todo.filter(x => x.kind === 'made')) { if (!groups.has(t.round)) groups.set(t.round, []); groups.get(t.round).push(t.id); }
  for (const [round, ids] of groups) {
    if (!ids.every(id => res.has(id))) continue;
    const cardsOf = round === st.id ? st.cards : (L.readRecords(path.join(st.wt.main, L.REC_DIR)).find(r => r.id === round)?.cards ?? []);
    const pass = new Set(ids.filter(id => res.get(id).state === 'pass'));
    st.newCards = cardsOf.filter(c => c.ok && pass.has(c.id)).map(c => c.card);
  }
  save(D, st);
  const left = todo.filter(t => !res.has(t.id)).map(t => t.id);
  return {done: [...res.values()].map(r => ({id: r.id, state: r.state})), left, newCards: st.newCards.map(c => c.id)};
}

// ───────────── 다시 시험([8] 3) ─────────────
export async function cmdRetest(a, D) {
  const st = load(D);
  if (st.plan?.next !== 'retest') stop(`이번 회차의 할 일은 다시 시험이 아님(${st.plan?.next})`, 2);
  const mem = L.memoryOf(recordsOf(st));
  const out = [];
  for (const [i, id] of st.plan.retest.entries()) {
    const g = mem.get(id), w = st.data0.waiting.find(x => x.id === id);
    const r = {id, ok: false, why: []};
    const drop = why => { r.why.push(why); st.dropped.push({id, why}); };
    if (!g?.commit || !w) { drop('기록에 대안 가지가 없음'); st.retested.push(r); out.push(r); continue; }
    if (!G.fetchBranch(D.root, L.branchOf(id)).ok || G.revParse(D.root, `origin/${L.branchOf(id)}`) !== g.commit) { drop('대안 가지가 없거나 만든 뒤 바뀜'); st.retested.push(r); out.push(r); continue; }
    const dir = path.join(D.run, 'wt', 're-' + (i + 1)); st.wt['re' + (i + 1)] = dir;
    if (!G.worktreeAdd(D.root, dir, st.main0).ok) { r.why.push('일 폴더를 못 만듦'); notDone(st, `다시 시험 ${id} — 일 폴더를 못 만듦`); st.retested.push(r); out.push(r); continue; }
    const ap = G.applyOnto(dir, g.commit, st.main0, `진화 대안 ${id} 다시 시험(회차 ${st.id})`);
    if (!ap.ok) { drop(ap.why); st.retested.push(r); out.push(r); continue; }
    const gt = gate(D, {base: st.main0, head: ap.sha, cwd: D.root, expectHash: g.changeHash});
    if (!gt.ok) { drop(gt.why.join(' · ')); st.retested.push(r); out.push(r); continue; }
    const sg = staticGate(D, st, dir);
    if (!sg.ok) { drop(sg.why); st.retested.push(r); out.push(r); continue; }
    r.sha = ap.sha;
    const qc = await D.quickCheck(dir, gt.files);
    r.quick = {fails: qc.fails};
    if (qc.fails) { drop(`새 자료로 빠른 검사 실패 ${qc.fails}`); st.retested.push(r); out.push(r); continue; }
    const live = await liveOnce(D, st);
    const route = L.readRecords(path.join(st.wt.main, L.REC_DIR)).flatMap(x => x.made ?? []).find(m => m.id === id)?.route ?? '#/';
    const seed = L.readRecords(path.join(st.wt.main, L.REC_DIR)).flatMap(x => x.made ?? []).find(m => m.id === id)?.seed ?? {};
    const sh = await D.shoot({id, route, before: st.wt.main, after: dir, out: path.join(D.run, 'img'), seed, live});
    r.images = !!sh.ok;
    if (!sh.ok) notDone(st, `다시 시험 ${id} — 새 그림을 못 찍음(옛 그림 그대로)`);
    let pv = null;
    for (const sha of [...g.checked].reverse()) { const x = await D.previewResult({sha, head: ap.sha, maxMin: 0}); if (x.state === 'pass') { pv = {state: 'pass', reuse: sha}; break; } }
    if (!pv) {
      const ps = D.previewStart({sha: ap.sha, branch: L.tryBranchOf(id), expect: null});
      pv = ps.ok ? {state: 'running', run: ps.run ?? null} : {state: 'fail', why: ps.why};
      if (!ps.ok) notDone(st, `다시 시험 ${id} — 모든 쪽 미리 검사를 못 시작함`);
    }
    r.preview = pv; r.ok = pv.state !== 'fail';
    if (r.ok) st.retestedCards[id] = {checks: {changed: 0, preview: 0}};
    st.retested.push(r); out.push(r);
  }
  save(D, st);
  return {retested: out.map(r => ({id: r.id, ok: r.ok, preview: r.preview?.state ?? null, why: r.why}))};
}

// ───────────── 채점([10] 6) ─────────────
export async function cmdScore(a, D) {
  const st = load(D);
  const recs = recordsOf(st), mem = L.memoryOf(recs);
  const cal = readJson(path.join(st.wt.main, L.CAL_FILE));
  const fresh = L.normalizeTally(await D.fetchTally(200)); // 합계 칸 읽기는 200일까지(KD) — 앞 칸 · 뒤 칸 60거래일씩도 한 번에
  if (!fresh.ok && D.readWhy?.()) fresh.why += ` — ${G.short(D.readWhy(), 160)}`;
  st.tally = fresh.ok ? Object.fromEntries(Object.entries(fresh.days).sort().slice(-14)) : null; // 기록에는 지난 14일만(앞날은 앞 기록에 · 읽기 창 200일 밖을 이어 붙일 때만 씀)
  if (!fresh.ok) notDone(st, `합계 칸을 못 읽음(${fresh.why}) — 채점 미룸`);
  const tally = L.mergeTally(...recs.map(r => (r.tally ? {ok: true, days: r.tally} : null)), fresh);
  const rounds = [...recs.map(r => ({date: r.facts?.at ? L.kst(r.facts.at).date : null, mismatch: r.facts?.mismatch})), {date: st.facts?.at ? L.kst(st.facts.at).date : null, mismatch: st.facts?.mismatch}].filter(x => x.date);
  const today = L.kst(D.now()).date, out = [];
  for (const ap of st.data0.applied) {
    if (ap.score?.at) continue; // 이미 매김
    let sc;
    if (ap.revertedAt) sc = {done: true, ok: null, text: '되돌려서 채점하지 않아요'};
    else sc = L.scoreApplied({rule: mem.get(ap.id)?.rule, at: ap.at, today, cal, tally, rounds, minSample: metricsOf(D.root)?.judge?.minSample ?? L.MIN_SAMPLE});
    const score = {at: sc.done ? L.isoKst(D.now()) : null, ok: sc.done ? sc.ok : null, text: sc.text};
    if (JSON.stringify(score) !== JSON.stringify(ap.score)) st.scores[ap.id] = score;
    out.push({id: ap.id, ...score});
  }
  save(D, st);
  return {scored: out, tally: fresh.ok};
}

// ───────────── 기록 ─────────────
export async function cmdRecord(a, D) {
  const st = load(D);
  if (st.recorded) stop('이번 회차는 이미 기록함', 2);
  const W = await loadWords(D.root), metrics = metricsOf(D.root), ess = L.readEssence(D.root);
  const now = D.now();
  // 이번 회차에 만든 대안 — 카드 검사를 못 지났으면 내림(미리 검사가 돌아도 진화 칸에 오르지 않음)
  const madeOk = st.made.filter(m => m.ok);
  if (st.plan?.next === 'make' && madeOk.length && !st.cards.length) for (const m of madeOk) if (!st.dropped.some(x => x.id === m.id)) st.dropped.push({id: m.id, why: '카드 검사를 지나지 못함'});
  const dropped = [...new Set(st.dropped.map(x => x.id))];
  const pending = madeOk.filter(m => m.preview?.state === 'running' && !dropped.includes(m.id)).map(m => m.id).concat(st.retested.filter(r => r.preview?.state === 'running').map(r => r.id));
  const mem = L.memoryOf(recordsOf(st));
  const applies = st.data0.waiting.filter(w => mem.get(w.id)?.merge).map(w => ({id: w.id, at: mem.get(w.id).appliedAt ?? st.start}));
  const reverts = st.data0.applied.filter(x => !x.revertedAt && mem.get(x.id)?.reverted).map(x => ({id: x.id, at: mem.get(x.id).reverted}));
  if (applies.length || reverts.length) note(st, `지난 회차 맞춤 — 들어감 ${applies.map(x => x.id).join(',') || '0'} · 되돌림 ${reverts.map(x => x.id).join(',') || '0'}`);
  const next = L.nextJinhwa(st.data0, {now, essence: st.essence.first, facts: st.facts, apply: st.apply?.ok ? {id: st.apply.id, at: st.apply.at} : null,
    revert: st.revert?.ok ? {id: st.revert.id, at: st.revert.at} : null, applies, reverts, dropped, newCards: st.newCards, retestedCards: st.retestedCards,
    fixed: st.fixed.map(f => ({at: f.at, what: f.what})), scores: st.scores});
  // 일 폴더(지금 main) — 자료 · 그림 · 기록
  if (!G.fetchMain(D.root).ok) stop('main 을 못 받음');
  let base = G.revParse(D.root, 'origin/main');
  const wt = path.join(D.run, 'wt', 'rec'); st.wt.rec = wt;
  if (!G.worktreeAdd(D.root, wt, base).ok) stop('일 폴더를 못 만듦');
  const live = readJson(path.join(wt, L.DATA_FILE));
  const moved = JSON.stringify(live) !== JSON.stringify(readJson(path.join(st.wt.main, L.DATA_FILE)));
  if (moved) notDone(st, '진화 칸 자료가 회차 동안 main 에서 바뀜 — 덮어쓰지 않고 기록만 남김(다음 회차가 맞춤)');
  const imgDir = path.join(wt, L.IMG_DIR); fs.mkdirSync(imgDir, {recursive: true});
  // 그림 — 새로 오르는 카드 · 다시 찍은 것 · 아직 미리 검사를 기다리는 대안(다음 회차는 새 방이라 이 방 그림 폴더가 없음 → main 에 먼저 둠)
  const shot = new Set([...st.newCards.map(c => c.id), ...st.retested.filter(r => r.ok && r.images).map(r => r.id), ...pending]);
  for (const id of shot) for (const k of ['before', 'after']) { const src = path.join(D.run, 'img', `${id}-${k}.png`); if (fs.existsSync(src)) fs.copyFileSync(src, path.join(wt, L.imgFileOf(id, k))); }
  const v0 = L.validateJinhwa(next, {measures: metrics ? L.measureTexts(metrics) : null, units: L.essenceUnits(ess.lines), words: wordsOpt(W), exists: f => fs.existsSync(path.join(wt, f))});
  const v = moved ? {ok: false, errors: ['회차 동안 main 에서 바뀜']} : v0;
  const dataChanged = JSON.stringify(next) !== JSON.stringify(st.data0);
  if (!v0.ok) notDone(st, '진화 칸 자료가 꼴 검사에 걸려 그대로 둠 — ' + v0.errors.slice(0, 2).join(' · '));
  else fs.writeFileSync(path.join(wt, L.DATA_FILE), JSON.stringify(next, null, 1) + '\n');
  // 아무 데서도 안 쓰는 그림만 치움(지금 남는 판 기준 — 꼴 검사에 걸려 옛 판이 남으면 옛 판 그림을 지킴)
  const kept = v.ok ? next : (live ?? st.data0);
  const waitIds = [...mem.values()].filter(x => x.pending && !x.dropped && !x.merge && !st.finished.some(f => f.id === x.id)).map(x => x.id); // 지난 회차부터 기다리는 미리 검사
  const keep = new Set([...kept.waiting.map(x => x.id), ...kept.applied.map(x => x.id), ...pending, ...waitIds].flatMap(id => [L.imgFileOf(id, 'before'), L.imgFileOf(id, 'after')]));
  for (const n of fs.readdirSync(imgDir)) { const rel = `${L.IMG_DIR}/${n}`; if (/\.png$/.test(n) && !keep.has(rel)) fs.rmSync(path.join(wt, rel), {force: true}); }
  const carry = L.carrySlot(now);
  const newN = v.ok ? st.newCards.length : 0;
  const owner = L.ownerLines({applied: !!st.apply?.ok, reverted: !!st.revert?.ok, fixed: st.fixed.length, made: newN, retested: st.retested.filter(r => r.ok).length,
    failed: st.apply && !st.apply.ok ? (/확인이 아님|거둬짐/.test(st.apply.why) ? '확인을 거두셔서 넣지 않았어요.' : '확인하신 진화를 이번에는 넣지 않았어요. 다음 회차가 다시 봐요.')
      : st.revert && !st.revert.ok ? (/요청이 아님|거둬짐/.test(st.revert.why) ? '되돌리기를 거두셔서 그대로 뒀어요.' : '되돌리기를 이번에는 하지 않았어요. 다음 회차가 다시 봐요.') : '',
    waiting: v.ok ? next.waiting.length : st.data0.waiting.length, carry: st.apply?.ok ? new Date(st.apply.carry) : st.revert?.ok ? new Date(st.revert.carry) : carry, notDone: st.notDone.length});
  const notice = newN ? L.noticeLine(newN, carry, W.name) : '';
  const rec = {schema: L.REC_SCHEMA, id: st.id, start: st.start, end: L.isoKst(now), essence: {file: st.essence.file, sha256: st.essence.sha, first: st.essence.first},
    main: st.main0, cutoff: st.cutoff, status: {ok: st.status.ok, why: st.status.why, items: st.status.items, unknown: st.status.unknown}, plan: st.plan,
    apply: st.apply ?? null, revert: st.revert ?? null, fixed: st.fixed, made: st.made.map(({seed, ...m}) => ({...m, seed: seed ?? {}})), debate: st.debate ?? null, cards: st.cards,
    retested: st.retested, finished: st.finished, dropped: st.dropped, pending, scores: st.scores, facts: st.facts, factsNote: st.factsNote ?? '', tally: st.tally ?? null,
    data: {changed: v.ok && dataChanged, ok: v.ok, n: v.ok ? next.n : st.data0.n, waiting: (v.ok ? next.waiting : st.data0.waiting).map(w => w.id), errors: v.ok ? [] : v.errors.slice(0, 5)},
    owner, notice, notDone: st.notDone, confirmOnly: {appliedWithoutConfirm: 0, rule: '열쇠 없는 상태 confirmed + 회차 때 전 + 기다림에 있음 + 지문 같음 + 넣기 직전 · 밀기 직전 다시 봄'}, log: st.log};
  let file;
  try { file = L.writeRecord(path.join(wt, L.REC_DIR), rec); } catch (e) { stop(e.code === 'EEXIST' ? '같은 이름의 기록이 이미 있음 — 쓰지 않음(새 파일만)' : '기록을 못 씀 ' + e.message); }
  G.git(wt, ['add', '-A', '--', L.DATA_FILE, L.IMG_DIR, L.REC_DIR]);
  const msg = `${W.name} 진화 회차 ${st.id} 기록 — ${owner[0]}\n\n본질 ${st.essence.sha.slice(0, 8)} · 기다리는 대안 ${rec.data.waiting.length} · 진화 ${rec.data.n}번째 · 못 한 것 ${st.notDone.length}가지 · 새 파일 ${path.relative(wt, file)}`;
  const c = G.git(wt, ['commit', '-q', '--no-verify', '-m', msg]);
  if (!c.ok) stop('기록 커밋을 못 만듦 ' + G.short(c.err));
  let head = G.revParse(wt, 'HEAD'), pushed = null;
  for (let i = 0; i < 5 && !pushed; i++) {
    const p = G.pushMain(wt, head);
    if (p.ok) { pushed = head; break; }
    if (!p.rejected) stop('기록을 main 에 못 밂 ' + p.why);
    if (!G.fetchMain(D.root).ok) stop('main 을 못 받음');
    const nb = G.revParse(D.root, 'origin/main');
    const r = G.replayOnto(wt, head, nb, msg);
    if (!r.ok) stop('기록을 새 main 위에 못 얹음 — ' + r.why);
    head = r.sha; base = nb;
    await D.sleep(500);
  }
  if (!pushed) stop('main 이 계속 앞서 감 — 기록을 못 밂');
  // 회차 가지 치우기 — 기다림에서 나간(들어감 · 내려감) 번호의 시험 가지 · 대안 가지(기록에 커밋 번호가 남음)
  const still = new Set([...(v.ok ? next.waiting : st.data0.waiting).map(w => w.id), ...pending, ...waitIds]);
  for (const id of new Set([...dropped, ...(st.apply?.ok ? [st.apply.id] : []), ...madeOk.map(m => m.id)])) if (!still.has(id)) { G.deleteRemoteBranch(D.root, L.tryBranchOf(id)); G.deleteRemoteBranch(D.root, L.branchOf(id)); }
  st.recorded = {file: path.relative(wt, file), commit: pushed, at: L.isoKst(D.now())};
  save(D, st);
  return {file: st.recorded.file, commit: pushed.slice(0, 7), data: rec.data, owner, notice, notDone: st.notDone};
}

// ───────────── end · status · validate · empty ─────────────
export async function cmdEnd(a, D) {
  const st = load(D, {open: false});
  if (st.lock?.sha) { const r = G.lockRelease(D.root, {sha: st.lock.sha, now: D.now()}); st.lockReleased = r.ok ? r.how : null; if (!r.ok) notDone(st, `회차 잠금을 못 풂(${r.why}) — 100분 뒤 다음 회차가 묵은 잠금으로 가져감`); }
  for (const w of Object.values(st.wt ?? {})) if (typeof w === 'string') G.worktreeRemove(D.root, w);
  for (const b of Object.keys(st.wt ?? {}).filter(k => /^alt\d$/.test(k))) G.git(D.root, ['branch', '-D', L.branchOf(`${st.id}-${b.slice(3)}`)]); // 이 기계의 가지만(원격 가지는 기록 단계가 정리)
  if (st.fixing) G.git(D.root, ['branch', '-D', L.fixBranchOf(st.fixing.id)]);
  st.ended = L.isoKst(D.now()); save(D, st);
  return {id: st.id, ended: st.ended, recorded: !!st.recorded, lock: st.lock?.sha ? (st.lockReleased ?? 'not released') : 'none', notDone: st.notDone};
}
export async function cmdStatus(a, D) { const raw = await D.fetchStatus(); return L.normalizeStatus(raw); }
export async function cmdValidate(a, D) {
  const file = a._[1] ?? path.join(D.root, L.DATA_FILE);
  const d = readJson(file);
  const metrics = metricsOf(D.root), ess = L.readEssence(D.root), W = await loadWords(D.root);
  const v = L.validateJinhwa(d, {measures: metrics ? L.measureTexts(metrics) : null, units: L.essenceUnits(ess.lines), words: wordsOpt(W), exists: f => fs.existsSync(path.join(D.root, f))});
  if (!v.ok) stop(v.errors.join(' · '));
  return {ok: true, file: path.relative(D.root, file), n: d.n, waiting: d.waiting.length, applied: d.applied.length, fixed: d.fixed.length, facts: d.facts};
}
export async function cmdEmpty(a, D) {
  const ess = L.readEssence(D.root), now = D.now();
  const liveDir = path.join(D.root, L.LIVE_DIR);
  const f = L.factsFrom(readJson(path.join(liveDir, 'summary.json')), name => readJson(path.join(liveDir, name + '.json')), now);
  const d = L.emptyJinhwa({essence: ess.first, now, facts: {mismatch: f.mismatch, at: f.at}});
  const v = L.validateJinhwa(d); if (!v.ok) stop(v.errors.join(' · '));
  if (a.write) { const to = path.join(D.root, L.DATA_FILE); fs.mkdirSync(path.dirname(to), {recursive: true}); fs.writeFileSync(to, JSON.stringify(d, null, 1) + '\n'); }
  return {data: d, factsNote: f.note, written: !!a.write};
}

export const COMMANDS = {begin: cmdBegin, apply: cmdApply, revert: cmdRevert, 'fix-start': cmdFixStart, fix: cmdFix, 'alt-start': cmdAltStart, alt: cmdAlt, cards: cmdCards,
  finish: cmdFinish, retest: cmdRetest, score: cmdScore, record: cmdRecord, end: cmdEnd, status: cmdStatus, validate: cmdValidate, empty: cmdEmpty};

/** 옵션 읽기 — --k v · --flag · --seed k=v(여럿) */
export function parseArgs(argv) {
  const a = {_: [], seed: {}};
  for (let i = 0; i < argv.length; i++) {
    const x = argv[i];
    if (x === '--seed' && argv[i + 1]) { const s = argv[++i], j = s.indexOf('='); if (j > 0) { const v = s.slice(j + 1); a.seed[s.slice(0, j)] = v.startsWith('@') ? fs.readFileSync(v.slice(1), 'utf8') : v; } continue; }
    if (x.startsWith('--')) { const k = x.slice(2); if (argv[i + 1] !== undefined && !argv[i + 1].startsWith('--')) a[k] = argv[++i]; else a[k] = true; continue; }
    a._.push(x);
  }
  return a;
}
/** 명령 하나 돌리기 — {code, out} (CLI · 자기 시험이 함께 씀) */
export async function runCommand(argv, D) {
  const a = parseArgs(argv), name = a._[0], fn = COMMANDS[name];
  if (!fn) return {code: 2, out: {ok: false, why: `모르는 명령 ${name ?? ''} — ${Object.keys(COMMANDS).join(' · ')} · --selftest`}};
  try { const r = await fn(a, D); return {code: 0, out: {ok: true, cmd: name, ...r}}; }
  catch (e) { if (e instanceof Stop) return {code: e.code, out: {ok: false, cmd: name, why: e.message, ...e.extra}}; return {code: 1, out: {ok: false, cmd: name, why: '오류 ' + G.short(e?.stack ?? e, 400)}}; }
}

// 맨 위 await 를 쓰지 않음 — 자기 시험(selftest.mjs)이 이 파일을 다시 불러 쓰므로 이 파일이 먼저 다 읽혀야 함
if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  (async () => {
    const argv = process.argv.slice(2);
    if (argv.includes('--selftest')) {
      const {selftest} = await import('./selftest.mjs');
      const r = await selftest({verbose: argv.includes('--verbose')});
      process.exit(r.fail ? 1 : 0);
    }
    const {code, out} = await runCommand(argv, realDeps());
    process.stdout.write(JSON.stringify(out) + '\n', () => process.exit(code));
  })().catch(e => { process.stderr.write('오류 ' + String(e?.stack ?? e).slice(0, 400) + '\n'); process.exit(1); });
}
