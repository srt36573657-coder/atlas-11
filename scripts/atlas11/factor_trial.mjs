#!/usr/bin/env node
/**
 * ATLAS 11 · 재료 시험 실행기 (후향) — 미리 등록한 규칙(config/atlas11/factor-trial.v1.json) 그대로 돌린다.
 *   node scripts/atlas11/factor_trial.mjs --stage 1 [--only A,F09-SP500] [--summarize]
 *   시험용 축소 실행(규칙 확인용 · 결과 아님): --smoke --as-of 2025-12-30 --origins 2 --paths 400
 * 쓰는 것: reports/atlas11/factor-trial/<runId>/sides/<후보>.json · result.json · days.csv · latest.json · registry.jsonl(덧붙이기만)
 * 운영 발행본·채점 규칙·진화 설정은 읽기만 한다. 결측은 0 으로 채우지 않는다.
 */
import fs from 'node:fs/promises';
import path from 'node:path';
import {examplesFor} from '../../lib/factor36.mjs';
import {rollingBacktestPlan} from '../../lib/rolling-backtest.mjs';
import {TRIAL_CANDIDATES, NOT_TESTABLE, RELEASE_RULES, featureByIssueDate, trialDesign, runTrialSide, judge, blockSummary, summarizeDays, checkReleaseRule, sha} from '../../lib/atlas11/factor_trial.mjs';

const arg = name => { const i = process.argv.indexOf(name); return i < 0 ? null : process.argv[i + 1]; };
const flag = name => process.argv.includes(name);
const root = arg('--root') ?? process.cwd();
const readJSON = async (file, otherwise) => { try { return JSON.parse(await fs.readFile(path.join(root, file), 'utf8')); } catch (e) { if (e.code === 'ENOENT' && otherwise !== undefined) return otherwise; throw e; } };
const listDir = async dir => { try { return (await fs.readdir(path.join(root, dir))).sort(); } catch (e) { if (e.code === 'ENOENT') return []; throw e; } };
const log = x => console.log(JSON.stringify({at: new Date().toISOString(), ...x}));

const protocolBytes = await fs.readFile(path.join(root, 'config/atlas11/factor-trial.v1.json'));
const protocol = JSON.parse(protocolBytes), protocolSHA256 = sha(protocolBytes);
const libSHA256 = sha(await fs.readFile(path.join(root, 'lib/atlas11/factor_trial.mjs')));
// 등록한 후보 정의와 지금 코드의 후보 정의가 같아야 한다(다르면 중단)
if (JSON.stringify(protocol.candidates) !== JSON.stringify(TRIAL_CANDIDATES)) throw Error('TRIAL_CANDIDATES_CHANGED_SINCE_REGISTRATION');
if (JSON.stringify(protocol.releaseRules) !== JSON.stringify(Object.fromEntries(Object.entries(RELEASE_RULES).map(([k, v]) => [k, v.label])))) throw Error('TRIAL_RELEASE_RULES_CHANGED_SINCE_REGISTRATION');

const smoke = flag('--smoke');
const stage = Number(arg('--stage') ?? 1);
const paths = smoke ? Number(arg('--paths') ?? 400) : protocol.simulation.paths;
const smokeOrigins = Number(arg('--origins') ?? 2);
const win = smoke ? {...protocol.window, originDays: smokeOrigins, blocks: 1, blockDays: smokeOrigins} : protocol.window;
const run = {...protocol, simulation: {...protocol.simulation, paths}, window: win};

// ── 가격 입력 ───────────────────────────────────────────────────────────────
const inputBytes = await fs.readFile(path.join(root, 'public/data/input.json'));
let input = JSON.parse(inputBytes);
if (smoke) { const asOf = arg('--as-of') ?? '2025-12-30'; input = {...input, actualAsOf: asOf, assets: input.assets.map(a => ({...a, prices: a.prices.filter(p => p.date <= asOf)}))}; }
const inputSHA256 = sha(inputBytes);

// ── 재료 기록: 저장된 3년 기록(completion) → 매일 수집 묶음(context) → 모으기 결과(backfill) 순서 · 같은 날짜 값이 다르면 먼저 받은 값을 쓰고 셈 ──
async function macroRows(id) {
  const out = new Map(), conflicts = [], sources = [];
  const add = (rows, source) => { let n = 0; for (const r of rows ?? []) { if (!/^\d{4}-\d{2}-\d{2}$/.test(r?.date ?? '') || typeof r.value !== 'number' || !Number.isFinite(r.value)) continue; const prev = out.get(r.date); if (prev) { if (Math.abs(prev.value - r.value) > 1e-9) conflicts.push({date: r.date, kept: prev.value, keptFrom: prev.source, other: r.value, otherFrom: source}); continue; } out.set(r.date, {date: r.date, value: r.value, source}); n++; } if (n) sources.push({source, added: n}); };
  const completion = await readJSON(`reports/completion/market-${id}.json`, null);
  if (completion) add(completion.rows, `reports/completion/market-${id}.json`);
  for (const day of await listDir('reports/atlas11/context')) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(day)) continue;
    for (const f of await listDir(`reports/atlas11/context/${day}`)) { const c = await readJSON(`reports/atlas11/context/${day}/${f}`); const m = (c.macro ?? []).find(x => x.id === id); if (m) add(m.rows, `reports/atlas11/context/${day}/${f}`); }
  }
  const backfill = await readJSON('reports/atlas11/backfill/latest.json', null);
  const bf = backfill?.macro?.find(x => x.id === id);
  if (bf?.file) { const b = await readJSON(bf.file, null); if (b) add(b.rows, bf.file); }
  return {rows: [...out.values()].sort((a, b) => a.date.localeCompare(b.date)), conflicts, sources};
}
async function flowRows(code) {
  const backfill = await readJSON('reports/atlas11/backfill/latest.json', null);
  const f = backfill?.flows?.find(x => x.code === code);
  if (!f?.file) return {rows: [], sources: [], conflicts: []};
  const b = await readJSON(f.file, null);
  return {rows: (b?.rows ?? []).filter(r => /^\d{4}-\d{2}-\d{2}$/.test(r.date)).sort((x, y) => x.date.localeCompare(y.date)), sources: [{source: f.file, added: b?.rows?.length ?? 0}], conflicts: []};
}

// ── 시점 규칙 점검: 2026-10-01 18:53 KST 실제 수집에서 본 최신 관측일 ──
async function releaseChecks() {
  const out = [];
  for (const day of await listDir('reports/atlas11/context')) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(day)) continue;
    for (const f of await listDir(`reports/atlas11/context/${day}`)) {
      const c = await readJSON(`reports/atlas11/context/${day}/${f}`);
      const kstISO = new Date(Date.parse(c.fetchedAt) + 9 * 3600000).toISOString(), kst = kstISO.slice(0, 10);
      if (kstISO.slice(11, 16) < '16:00') continue; // 발행 시각대(16:00 KST 이후 매일 수집)만 본다 — 아침 수동 수집은 발행 때 받을 수 있던 값을 대표하지 않음
      for (const cand of TRIAL_CANDIDATES.filter(x => x.kind === 'macro')) { const m = (c.macro ?? []).find(x => x.id === cand.series); if (m?.rows?.length) out.push({candidate: cand.id, fetchedAt: c.fetchedAt, ...checkReleaseRule(cand, m.rows.at(-1).date, kst)}); }
    }
  }
  return out;
}

const runId = 'ft-' + sha({protocolSHA256, libSHA256, inputSHA256, stage, paths, smoke, asOf: input.actualAsOf, origins: run.window.originDays}).slice(0, 16);
const dir = path.join(root, 'reports/atlas11/factor-trial', smoke ? 'smoke' : '', runId);
await fs.mkdir(path.join(dir, 'sides'), {recursive: true});

const {panel, origins} = rollingBacktestPlan(input, {originDays: win.originDays, blocks: win.blocks, blockDays: win.blockDays, horizon: win.horizon});
const base = input.assets.map((a, i) => examplesFor(panel, i));
const stageCandidates = TRIAL_CANDIDATES.filter(c => c.stage <= stage);
const only = arg('--only')?.split(',') ?? null;

async function sideFile(id) { try { return JSON.parse(await fs.readFile(path.join(dir, 'sides', id + '.json'), 'utf8')); } catch (e) { if (e.code === 'ENOENT') return null; throw e; } }
async function runSide(cand) {
  const id = cand?.id ?? 'A';
  const done = await sideFile(id); if (done?.complete) { log({side: id, cached: true}); return done; }
  let designs = null, data = null;
  if (cand) {
    if (cand.kind === 'macro') {
      data = await macroRows(cand.series);
      const valueOn = featureByIssueDate(data.rows, cand, panel.dates);
      designs = input.assets.map((a, i) => ({...trialDesign(base[i], panel, valueOn), valueOn}));
    } else {
      designs = [];
      data = {rows: null, conflicts: [], sources: []};
      for (let i = 0; i < input.assets.length; i++) { const fr = await flowRows(input.assets[i].code); data.sources.push(...fr.sources); const valueOn = featureByIssueDate(fr.rows.map(r => ({...r, value: r[cand.field]})), cand, panel.dates); designs.push({...trialDesign(base[i], panel, valueOn), valueOn}); }
    }
    // 기록이 짧으면(첫 기준일 전 학습160+선택40+평가60 = 260행 미만) 시험 못 함 — 0 으로 채우거나 늘리지 않는다
    const short = designs.map((d, i) => ({code: input.assets[i].code, rows: d.rows.filter(r => r.date <= origins[0].date && r.date < '2026-09-17').length})).filter(x => x.rows < 260);
    if (short.length) { const out = {complete: false, id, candidate: cand, status: 'data_short', reason: `첫 기준일 전 기록이 260거래일보다 짧은 종목 ${short.length}곳 → 시험 못 함`, short: short.slice(0, 10), sources: data.sources}; await fs.writeFile(path.join(dir, 'sides', id + '.json'), JSON.stringify(out)); log({side: id, status: 'data_short', stocks: short.length}); return out; }
    const missingAtOrigins = origins.filter(o => designs.some(d => !Number.isFinite(d.valueOn.get(o.date)))).map(o => o.date);
    if (missingAtOrigins.length) { const out = {complete: false, id, candidate: cand, status: 'data_missing', reason: '기준일에 재료 값이 없음(기록 부족) → 시험 못 함', missingOrigins: missingAtOrigins.length, firstMissing: missingAtOrigins[0], sources: data.sources}; await fs.writeFile(path.join(dir, 'sides', id + '.json'), JSON.stringify(out)); log({side: id, status: 'data_missing', missing: missingAtOrigins.length}); return out; }
  }
  const t0 = Date.now();
  log({side: id, start: true, origins: origins.length, paths});
  const res = runTrialSide({input, panel, origins, base, protocol: run, candidate: cand, designs, onProgress: (k, n, date) => { if (k % 20 === 0 || k === n) log({side: id, done: k, of: n, origin: date, elapsedMs: Date.now() - t0}); }});
  const out = {complete: true, id, candidate: cand ?? null, elapsedMs: Date.now() - t0, data: data ? {rows: data.rows?.length ?? null, first: data.rows?.[0]?.date ?? null, last: data.rows?.at(-1)?.date ?? null, conflicts: data.conflicts, sources: data.sources} : null, removedPrefixRows: designs ? designs.map(d => d.removedPrefixRows) : null, ...res, byBlock: blockSummary(res.days, win.blocks)};
  await fs.writeFile(path.join(dir, 'sides', id + '.json'), JSON.stringify(out));
  log({side: id, finished: true, elapsedMs: out.elapsedMs});
  return out;
}

if (!flag('--summarize')) {
  const sides = [null, ...stageCandidates].filter(c => !only || only.includes(c?.id ?? 'A'));
  for (const c of sides) await runSide(c);
}

if (flag('--summarize') || !only) {
  const A = await sideFile('A');
  if (!A?.complete) throw Error('TRIAL_A_MISSING');
  const results = [];
  for (const c of stageCandidates) {
    const B = await sideFile(c.id);
    if (!B) { results.push({id: c.id, factorId: c.factorId, label: c.label, status: 'not_run'}); continue; }
    if (!B.complete) { results.push({id: c.id, factorId: c.factorId, label: c.label, status: B.status, reason: B.reason}); continue; }
    const j = smoke ? null : judge(A, B, run);
    const accepted = B.blocks.map(b => b.acceptedStocks);
    results.push({id: c.id, factorId: c.factorId, name: c.name, label: c.label, license: c.license, status: 'tested', A: A.summary, B: B.summary, hitDiffPctPoints: (B.summary.hitRate - A.summary.hitRate) * 100, acceptedStocksByBlock: accepted, judge: j, data: B.data});
  }
  const releaseRuleChecks = await releaseChecks();
  const passed = results.filter(r => r.judge?.passed);
  const result = {schema: 'atlas11-factor-trial-result-1', runId, smoke, stage, protocolId: protocol.id, protocolSHA256, libSHA256, libraryChangedSinceRegistration: libSHA256 !== (protocol.library.sha256Current ?? protocol.library.sha256AtRegistration), amendments: (protocol.amendments ?? []).map(a => ({n: a.n, at: a.at, change: a.change})), registeredAt: protocol.registeredAt, inputSHA256, actualAsOf: input.actualAsOf, finishedAt: new Date().toISOString(), paths, origins: origins.length, firstOrigin: origins[0].date, lastOrigin: origins.at(-1).date, lastTarget: origins.at(-1).targets[0], stocks: input.assets.length, cells: origins.length * input.assets.length,
    A: {summary: A.summary, byBlock: A.byBlock}, results, passed: passed.map(r => r.id), combinedNeeded: passed.length >= 2, notTestable: NOT_TESTABLE, releaseRuleChecks, releaseRuleViolations: releaseRuleChecks.filter(x => !x.ruleIsConservative).length,
    note: '후향 시험 · 가격 이력 단일 제공자 · 거시 값은 지금 받은 값(당시 빈티지 아님)에 공개 시각 규칙 적용 · 6,240칸은 서로 독립 시험이 아님 · 통과해도 그림자 10채점일 뒤에 켬', trustProbability: null, liveAdvantageProven: false};
  await fs.writeFile(path.join(dir, 'result.json'), JSON.stringify(result, null, 1));
  // 칸별 기록(종목·날짜마다 A 와 후보들의 예측 방향 · 실제 방향)
  const sideList = [A, ...await Promise.all(stageCandidates.map(c => sideFile(c.id)))].filter(s => s?.complete);
  const header = ['origin', 'target', 'code', 'actual', ...sideList.map(s => s.id)];
  const lines = [header.join(',')];
  A.days.forEach((d, k) => d.cells.forEach((cell, i) => lines.push([d.date, d.target, cell[0], cell[2], ...sideList.map(s => s.days[k].cells[i][1])].join(','))));
  await fs.writeFile(path.join(dir, 'days.csv'), lines.join('\n') + '\n');
  if (!smoke) {
    await fs.writeFile(path.join(root, 'reports/atlas11/factor-trial/latest.json'), JSON.stringify({runId, stage, finishedAt: result.finishedAt, actualAsOf: result.actualAsOf, firstOrigin: result.firstOrigin, lastOrigin: result.lastOrigin, A: A.summary, results: results.map(r => ({id: r.id, factorId: r.factorId, label: r.label, status: r.status, hitRateA: r.A?.hitRate ?? null, hitRateB: r.B?.hitRate ?? null, passed: r.judge?.passed ?? null, failed: r.judge?.failed ?? null})), passed: result.passed, file: path.relative(root, path.join(dir, 'result.json'))}, null, 1));
    const reg = path.join(root, 'reports/atlas11/factor-trial/registry.jsonl');
    for (const r of results) await fs.appendFile(reg, JSON.stringify({at: result.finishedAt, type: 'result', runId, stage, candidateId: r.id, status: r.status, hitRateA: r.A?.hitRate ?? null, hitRateB: r.B?.hitRate ?? null, passed: r.judge?.passed ?? null, failed: r.judge?.failed ?? null, decision: r.judge?.decision ?? null}) + '\n');
  }
  log({runId, smoke, A: A.summary, results: results.map(r => ({id: r.id, status: r.status, hitA: r.A?.hitRate, hitB: r.B?.hitRate, passed: r.judge?.passed ?? null}))});
}
