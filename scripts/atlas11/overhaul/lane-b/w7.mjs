#!/usr/bin/env node
/**
 * W7 · 부품 ① 방정식 꼴 — 계획 plan.md ① · 명령서 6판 24절 3·4줄 · T11
 *   node scripts/atlas11/overhaul/lane-b/w7.mjs --retro <A 후향 칸 자료(run-retro.mjs --model A)>
 * 쓰는 파일: reports/atlas11/overhaul/part1.json · part1-retro-A-cells.json(후향 칸 자료 사본)
 */
import fs from 'node:fs';
import {ROOT, REP, PUB_0929, liveCells, gitShow, readJSON, writeJSON, sha256, mean, dirOf, bootstrapCompare, r2, kstNow, gitHead} from './common.mjs';
import {perOrigin, summarize} from './metrics.mjs';

const arg = k => { const i = process.argv.indexOf(k); return i < 0 ? null : process.argv[i + 1]; };
const retroFile = arg('--retro');
if (!retroFile) { console.error('--retro 가 필요하다'); process.exit(2); }

// ---------- 실전 104칸 ----------
const cells = liveCells();
const recount = readJSON('reports/atlas11/overhaul/recount-cells.json');
const recountDiff = [];
if (recount.length !== cells.length) recountDiff.push({what: 'length', mine: cells.length, recount: recount.length});
cells.forEach((c, j) => { const r = recount[j]; if (!r) return; for (const [a, b] of [['date', 'date'], ['code', 'code'], ['anchor', 'anchor'], ['actual', 'actual'], ['p50', 'p50'], ['predStored', 'predDir'], ['act', 'actDir'], ['dirOk', 'dirOk'], ['sizeOk', 'sizeOk'], ['scoreId', 'scoreId']]) if (c[a] !== r[b]) recountDiff.push({cell: `${c.date} ${c.code}`, field: a, mine: c[a], recount: r[b]}); if (c.pred !== c.predStored) recountDiff.push({cell: `${c.date} ${c.code}`, field: 'pred(rule) vs stored', mine: c.pred, stored: c.predStored}); });

// 전날 종가: 발행본의 actual60(발행 때 알던 값)
const pubs = {
  [REP['2026-09-29']]: (() => { const p = readJSON('public/data/rolling-forecast.json'); if (p.id !== REP['2026-09-29']) throw Error('ROLLING_PUB_ID ' + p.id); return {file: 'public/data/rolling-forecast.json', sha256: sha256(fs.readFileSync(ROOT + '/public/data/rolling-forecast.json')), pub: p}; })(),
  [REP['2026-09-30']]: (() => { const bytes = gitShow(PUB_0929.commit, PUB_0929.forecast), p = JSON.parse(bytes); if (p.forecastId !== REP['2026-09-30']) throw Error('ATLAS_PUB_ID ' + p.forecastId); return {file: `${PUB_0929.commit}:${PUB_0929.forecast}`, sha256: sha256(bytes), pub: p}; })(),
};
const prevOf = {};
for (const [fid, {pub}] of Object.entries(pubs)) for (const a of pub.assets) {
  const last = a.actual60.at(-1), prev = a.actual60.at(-2);
  if (last.date !== pub.actualAsOf || last.close !== a.anchor.close) throw Error('ACTUAL60_ANCHOR ' + a.code);
  prevOf[`${fid}|${a.code}`] = {date: prev.date, close: prev.close};
}
const marketPrev = {};
for (const fid of Object.values(REP)) { const rows = cells.filter(c => c.forecastId === fid); marketPrev[fid] = dirOf(mean(rows.map(c => c.anchor / prevOf[`${fid}|${c.code}`].close - 1))); }
for (const c of cells) { const p = prevOf[`${c.forecastId}|${c.code}`]; c.prevDate = p.date; c.prevClose = p.close; c.prevDir = dirOf(c.anchor / p.close - 1); c.marketPrevDir = marketPrev[c.forecastId]; }
const live = scope => {
  const rows = cells.filter(scope);
  return {cells: rows.length, model: rows.filter(c => c.dirOk).length, alwaysUp: rows.filter(c => c.act === 'up').length, alwaysDown: rows.filter(c => c.act === 'down').length, ownPrevDay: rows.filter(c => c.prevDir === c.act).length, marketPrevDay: rows.filter(c => c.marketPrevDir === c.act).length,
    actualUp: rows.filter(c => c.act === 'up').length, actualFlat: rows.filter(c => c.act === 'flat').length, actualDown: rows.filter(c => c.act === 'down').length, predictedDown: rows.filter(c => c.pred === 'down').length, predictedUp: rows.filter(c => c.pred === 'up').length, predictedFlat: rows.filter(c => c.pred === 'flat').length,
    errorRateMeanPct: {model: r2(mean(rows.map(c => c.ape)) * 100), closeAsIs: r2(mean(rows.map(c => c.baseApe)) * 100), modelExact: mean(rows.map(c => c.ape)) * 100, closeAsIsExact: mean(rows.map(c => c.baseApe)) * 100},
    sizeRight: {model: rows.filter(c => c.sizeOk).length, closeAsIs: rows.filter(c => c.baseApe <= 0.015).length},
    probabilityGapMeanPp: r2(mean(rows.map(c => (c.probabilities.down - c.probabilities.up) * 100)))};
};
const liveOut = {label: '실전(이틀치 · 판정에 쓰지 않음 · F8)', all: live(() => true), '2026-09-29': live(c => c.date === '2026-09-29'), '2026-09-30': live(c => c.date === '2026-09-30'), marketPrevDayDirection: {[REP['2026-09-29']]: marketPrev[REP['2026-09-29']], [REP['2026-09-30']]: marketPrev[REP['2026-09-30']]},
  sources: {ledger: 'reports/atlas11/ledger/{score,analysis}/*.jsonl(정정 안 된 것 · 1거래일 · 가장 나중 at)', previousClose: Object.fromEntries(Object.entries(pubs).map(([k, v]) => [k, {file: v.file, sha256: v.sha256, field: 'assets[].actual60 끝에서 둘째'}]))},
  crossCheckWithRecount: {file: 'reports/atlas11/overhaul/recount-cells.json', sameCells: recountDiff.length === 0, differences: recountDiff}};

// ---------- 후향(v1 방법) ----------
const run = JSON.parse(fs.readFileSync(retroFile, 'utf8'));
if (run.model !== 'A' || run.center !== 'mean' || !run.reproduction?.identical) throw Error('RETRO_A_NOT_REPRODUCED');
const series = perOrigin(run), S = summarize(series), pick = key => series.map(x => x[key]);
// 저장 요약과 같은 값인가(기준일별 ape1·ape20 은 저장된 days 와 같은 식)
const consistency = {ape1SameAsStoredDays: series.every((x, k) => x.ape1 === run.days[k].ape1), ape20SameAsStoredDays: series.every((x, k) => x.ape20 === run.days[k].ape20), dir20selSameAsStoredDir20: series.every((x, k) => x.dir20sel === run.days[k].dir20)};
const rules = [['alwaysUp', 'up'], ['alwaysDown', 'down'], ['ownPrevDay', 'prev'], ['marketPrevDay', 'market']];
const compare = h => Object.fromEntries(rules.map(([name, key]) => { const b = bootstrapCompare(pick(key + h), pick(h === 1 ? 'dir1sel' : 'dir20sel')); return [name, {...b, ruleBetter: b.candBetter, modelBetter: b.refBetter, note: 'cand = 규칙, ref = 모델'}]; }));
const cmp1 = compare(1), cmp20 = compare(20);
const anyRuleBetter = Object.values(cmp1).some(b => b.ruleBetter), modelBeatsAll = Object.values(cmp1).every(b => b.modelBetter);
const verdict = anyRuleBetter ? '원인이다' : modelBeatsAll ? '아니다' : '모른다';
const p = x => r2(x * 100);
const retroOut = {label: '후향', protocol: run.protocol, input: run.input, reproductionOfStoredA: run.reproduction, consistency,
  oneDay: {cells: S.n, origins: S.origins, dir1selPct: {model: p(S.dir1sel), alwaysUp: p(S.up1), alwaysDown: p(S.down1), ownPrevDay: p(S.prev1), marketPrevDay: p(S.market1)}, dir1selExact: {model: S.dir1sel, alwaysUp: S.up1, alwaysDown: S.down1, ownPrevDay: S.prev1, marketPrevDay: S.market1}, rightCount: {model: S.right1},
    storedDir1P50DefinitionPct: p(run.summary.dir1), errorRatePct: {model: S.ape1, closeAsIs: S.ape1close, modelRounded: r2(S.ape1), closeAsIsRounded: r2(S.ape1close)}, sizeRight: {model: S.size1, closeAsIs: S.size1close, tolerancePct: 1.5},
    picks: {down: S.downPicks1, up: S.upPicks1, flat: S.flatPicks1}, probabilityGapMeanPp: p(S.gap1), realizedDownMinusUpPp: p(S.realizedGap1), bootstrap: cmp1},
  twentyDays: {cells: S.n, dir20selPct: {model: p(S.dir20sel), alwaysUp: p(S.up20), alwaysDown: p(S.down20), ownPrevDay: p(S.prev20), marketPrevDay: p(S.market20)}, dir20selExact: {model: S.dir20sel, alwaysUp: S.up20, alwaysDown: S.down20, ownPrevDay: S.prev20, marketPrevDay: S.market20}, rightCount: {model: S.right20},
    errorRatePct: {model: S.ape20, closeAsIs: S.ape20close, modelRounded: r2(S.ape20), closeAsIsRounded: r2(S.ape20close)}, sizeRight: {model: S.size20, closeAsIs: S.size20close, tolerancePct: 8}, bootstrap: cmp20, note: '20거래일은 보고만(판정은 1거래일)'},
  perOrigin: {dates: run.origins.map(o => o.date), dir1sel: pick('dir1sel'), alwaysUp1: pick('up1'), alwaysDown1: pick('down1'), ownPrev1: pick('prev1'), marketPrev1: pick('market1'), dir20sel: pick('dir20sel'), alwaysUp20: pick('up20'), alwaysDown20: pick('down20'), ownPrev20: pick('prev20'), marketPrev20: pick('market20'), ape1: pick('ape1'), ape1close: pick('ape1close'), ape20: pick('ape20'), ape20close: pick('ape20close')}};

const cellsCopy = 'reports/atlas11/overhaul/part1-retro-A-cells.json';
const cellsSha = writeJSON(cellsCopy, run);
const out = {schema: 'atlas11-overhaul-part-1', part: '① 방정식 꼴(기본값 + F35 + F11, 직선 릿지)', work: 'W7', requirement: 'R8', tests: ['T11'], plan: 'reports/atlas11/overhaul/plan.md ①', builtAt: kstNow(), builtOnCommit: gitHead(),
  oneThingChanged: '모델의 방향(가격) 대신 식이 없는 규칙: 늘 상승 · 늘 하락 · 종목 어제 방향 · 시장 어제 방향(52종목 단순 수익률 평균 ±0.1%) · 가격은 종가 그대로',
  definitions: {liveDirection: '가장 높은 확률(같으면 보합→상승→하락)', actualDirection: '출발 종가 대비 ±0.1%', errorRate: '|p50 − 실제| ÷ 실제', sizeRight: '1거래일 ≤ 1.5% · 20거래일 ≤ 8%', dir1sel: '기준일마다 52종목 맞음 비율 → 120개 평균(저장된 dir1 은 p50 방향이라 쓰지 않음: lib/atlas11/evolve/backtest.mjs:62)', previousDay: '출발일 직전 거래일 종가 대비 출발 종가'},
  live: liveOut, retro: retroOut,
  decision: {rule: '1거래일 dir1sel · 블록 부트스트랩(20일 블록·2,000번·난수 20260929) · 「낫다」 = P ≥ 0.80 그리고 6블록 중 ≥ 4', anyRuleBetter, modelBeatsAllRules: modelBeatsAll, verdict, thresholds: {p: 0.8, blocks: 4},
    codeLines: ['lib/factor36.mjs:53 features(자체 1·2·5·20·60일 평균 · 52종목 폭 · 5일 평균)', 'lib/factor36.mjs:57-66 fitRidge(절편 = Σy/(n+252), 릿지 β)', 'lib/factor36.mjs:67 components(절편 + Σβ(x−중심)/척도)', 'lib/factor36.mjs:92 candidatesFor(벌점 {zero,1,10} × 변동폭 {상수,GARCH})']},
  files: {[cellsCopy]: cellsSha}};
const sha = writeJSON('reports/atlas11/overhaul/part1.json', out);
console.log(JSON.stringify({part1: sha, cells: cellsSha, verdict, live: liveOut.all, oneDay: retroOut.oneDay.dir1selPct, p: Object.fromEntries(Object.entries(cmp1).map(([k, b]) => [k, [b.pCandBetter, b.blocksCandBetter, b.pRefBetter, b.blocksRefBetter, b.outcome]])), twenty: retroOut.twentyDays.dir20selPct, recountSame: liveOut.crossCheckWithRecount.sameCells, consistency}, null, 1));
