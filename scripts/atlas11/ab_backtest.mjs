/**
 * ATLAS 11 · A/B 후향 비교 (120 기준일 · 6블록 · 52종목 · 20거래일 · 512경로 · 동일 난수)
 * A = 운영 가격요인 모형(F35·F11·F36). B = 같은 구조 + DFII10(F04)·DEXKOUS(F06), 7일 공개 지연 가정.
 * 이 실행은 후향 진단이다. 당시 빈티지·기업행위 검증이 없으므로 수치 조건을 통과해도 운영 채택하지 않는다.
 * 결과는 reports/atlas11/ab/<runId>/ 아래 불변 저장하며 운영 발행본을 건드리지 않는다.
 */
import fs from 'node:fs/promises';
import path from 'node:path';
import {createHash} from 'node:crypto';
import {pricePanel, examplesFor, fitFactorModel, FEATURE_FACTORS, mean} from '../../lib/factor36.mjs';
import {simulateJointFactor36} from '../../lib/factor36-simulation.mjs';
import {rollingBacktestPlan, truncateObservedPanel, rankingHits, adoptionDecision, ROLLING_AB_PROTOCOL} from '../../lib/rolling-backtest.mjs';
import {macroDesign, macroScenario} from '../../lib/macro-candidate.mjs';

const root = process.cwd();
const hash = x => createHash('sha256').update(x).digest('hex');
const started = new Date().toISOString();
const inputBytes = await fs.readFile(path.join(root, 'public/data/input.json'));
const input = JSON.parse(inputBytes);
const series = await Promise.all(['DFII10', 'DEXKOUS'].map(id => fs.readFile(path.join(root, `reports/completion/market-${id}.json`), 'utf8').then(JSON.parse)));
const paths = Number(process.env.ATLAS_AB_PATHS ?? ROLLING_AB_PROTOCOL.paths);
const protocol = {
  id: 'atlas11-ab-macro-1', createdAt: started, inputSHA256: hash(inputBytes), actualAsOf: input.actualAsOf,
  series: series.map(s => ({id: s.id, factorId: s.factorId, sha256: hash(JSON.stringify(s)), historyEnd: s.historyEnd, pointInTimeVerified: s.pointInTimeVerified === true})),
  originDays: 120, blocks: 6, blockDays: 20, horizon: 20, paths, seed: ROLLING_AB_PROTOCOL.seed, topK: 5, lagDays: 7,
  futureMacro: 'constant last observed lagged level (carry)',
  A: 'operating price-factor model (F35 own returns, F11 ATLAS52 proxy, F36 residual GARCH)',
  B: 'same architecture plus DFII10 and DEXKOUS levels; coefficients and factor acceptance chosen only on inner training dates before each block',
  training: 'refit and reselect before each 20-origin block; coefficients frozen within block',
  primaryError: 'mean over origin dates of mean over 52 stocks x 20 horizons of |p50 - actual| / actual x 100',
  rankHits: 'sum over origin dates of |top5 predicted 20-session return ∩ top5 actual|, max 600',
  rankTies: 'return descending then stock code ascending',
  adoption: 'B error < A error AND B rank hits >= A rank hits; and data-quality gate (point-in-time vintage, corporate actions) must also pass',
  independentStockTrials: false, overlappingHorizons: true, liveAdvantageProven: false, trustProbability: null,
};
const runId = 'ab-' + hash(JSON.stringify(protocol)).slice(0, 16);
const dir = path.join(root, 'reports/atlas11/ab', runId);
await fs.mkdir(dir, {recursive: true});
await fs.writeFile(path.join(dir, 'protocol.json'), JSON.stringify(protocol, null, 2));

const {panel, origins} = rollingBacktestPlan(input, {...ROLLING_AB_PROTOCOL, paths});
const base = input.assets.map((a, i) => examplesFor(panel, i));
const expanded = base.map(x => macroDesign(x, series));
const prices = input.assets.map(a => new Map(a.prices.map(r => [r.date, r.quality === 'conflict' ? null : r.close])));
const featureFactorsB = [...FEATURE_FACTORS, ...series.map(s => s.factorId)];
const days = [], blocks = [], ledger = ['origin,block,code,horizon,target,anchor,actual,A,B,errorA,errorB'];
let A = null, B = null, acceptedB = null;
for (let k = 0; k < origins.length; k++) {
  const o = origins[k];
  if (k % 20 === 0) {
    A = base.map(x => fitFactorModel(x.filter(r => r.date <= o.date)));
    B = expanded.map(x => fitFactorModel(x.filter(r => r.date <= o.date), {featureFactors: featureFactorsB}));
    if ([...A, ...B].some(m => m.status !== 'research_estimate')) throw Error('AB_INSUFFICIENT_HISTORY block ' + o.block);
    acceptedB = B.map((m, i) => ({code: input.assets[i].code, accepted: m.factorSelection.decisions.filter(d => d.accepted).map(d => d.factorId)}));
    blocks.push({block: o.block, originFirst: o.date, maximumTrainingDate: A.map(m => m.trainedThrough).sort().at(-1), acceptedMacroByStock: acceptedB, acceptedF04: acceptedB.filter(x => x.accepted.includes('F04')).length, acceptedF06: acceptedB.filter(x => x.accepted.includes('F06')).length});
  }
  if (A.some(m => m.trainedThrough > o.date) || B.some(m => m.trainedThrough > o.date)) throw Error('AB_FUTURE_TRAINING');
  const observed = truncateObservedPanel(panel, o.panelIndex), external = base.map(x => macroScenario(x, series, o.date));
  const a = simulateJointFactor36(A, observed, input.assets, o.targets, {paths, seed: protocol.seed});
  const b = simulateJointFactor36(B, observed, input.assets, o.targets, {paths, seed: protocol.seed, external});
  const ea = [], eb = [], pa = {}, pb = {}, actual = {};
  for (let i = 0; i < input.assets.length; i++) {
    const code = input.assets[i].code, anchor = prices[i].get(o.date);
    if (!Number.isFinite(anchor) || anchor <= 0) throw Error('AB_MISSING_ANCHOR ' + code + ' ' + o.date);
    for (let h = 0; h < 20; h++) {
      const target = o.targets[h], v = prices[i].get(target), av = a.rows[i][h].p50, bv = b.rows[i][h].p50;
      if (![v, av, bv].every(Number.isFinite) || v <= 0) throw Error('AB_INVALID_PAIR ' + code + ' ' + target);
      const errorA = Math.abs(av - v) / v * 100, errorB = Math.abs(bv - v) / v * 100;
      ea.push(errorA); eb.push(errorB);
      ledger.push([o.date, o.block, code, h + 1, target, anchor, v, av.toFixed(4), bv.toFixed(4), errorA.toFixed(6), errorB.toFixed(6)].join(','));
      if (h === 19) { pa[code] = av / anchor - 1; pb[code] = bv / anchor - 1; actual[code] = v / anchor - 1; }
    }
  }
  const rankA = rankingHits(pa, actual, 5), rankB = rankingHits(pb, actual, 5);
  days.push({date: o.date, block: o.block, errorA: mean(ea), errorB: mean(eb), rankA: rankA.hits, rankB: rankB.hits, predictedTopA: rankA.predictedTop, predictedTopB: rankB.predictedTop, actualTop: rankA.actualTop});
  if (k % 10 === 9) console.log(JSON.stringify({completed: k + 1, total: origins.length, origin: o.date, elapsedMs: Date.now() - Date.parse(started)}));
}
const summary = side => ({meanErrorPct: mean(days.map(d => d['error' + side])), rankHits: days.reduce((s, d) => s + d['rank' + side], 0)});
const resultA = summary('A'), resultB = summary('B');
const byBlock = [1, 2, 3, 4, 5, 6].map(bk => { const rows = days.filter(d => d.block === bk); return {block: bk, days: rows.length, errorA: mean(rows.map(d => d.errorA)), errorB: mean(rows.map(d => d.errorB)), rankA: rows.reduce((s, d) => s + d.rankA, 0), rankB: rows.reduce((s, d) => s + d.rankB, 0)}; });
const diff = days.map(d => d.errorB - d.errorA), sd = Math.sqrt(mean(diff.map(x => (x - mean(diff)) ** 2)) * days.length / Math.max(1, days.length - 1));
const decision = adoptionDecision(resultA, resultB, {complete: days.length === 120});
const result = {schema: 'atlas11-ab-result-1', runId, protocol, startedAt: started, finishedAt: new Date().toISOString(), stocks: 52, origins: days.length, blocks: blocks.length, stockTargetRows: ledger.length - 1, rankMaximum: days.length * 5,
  A: resultA, B: resultB, numericalGate: resultB.meanErrorPct < resultA.meanErrorPct && resultB.rankHits >= resultA.rankHits,
  dataQualityGate: {passed: false, reasons: ['macro series are current-vintage retrievals; 7-day publication lag is an assumption', 'price adjustments and corporate actions unverified', 'single price provider']},
  decision: {...decision, adoptedB: false, selected: 'A', reason: decision.adoptedB ? 'numerical_gate_passed_but_data_quality_gate_failed' : decision.reason},
  errorDifferenceBminusA: {mean: mean(diff), sdAcrossOriginDays: sd, blockMeans: byBlock.map(b => b.errorB - b.errorA), note: 'origin days overlap in target windows; sd is descriptive, not an independent-sample standard error'},
  byBlock, days, blockDetails: blocks,
  audit: {anchorsFromPriorPredictions: 0, futureTargetsUsedInModelSelection: 0, extremeLossPathsDeleted: 0, pathsPerModelPerOrigin: paths, sameRandomStream: true, sourcePriceVintageVerified: false, corporateActionsVerified: false, independentTrials: null, productionPaths: 20000, note: 'previous session result (A 9.310358 / B 9.385398 / 86 / 100) is not reused; this file is this run\'s own numbers'}};
await fs.writeFile(path.join(dir, 'result.json'), JSON.stringify(result, null, 2));
await fs.writeFile(path.join(dir, 'paired.csv'), ledger.join('\n'));
await fs.writeFile(path.join(root, 'reports/atlas11/ab/latest.json'), JSON.stringify({runId, finishedAt: result.finishedAt, A: resultA, B: resultB, numericalGate: result.numericalGate, decision: result.decision, origins: days.length, stockTargetRows: result.stockTargetRows}, null, 2));
console.log(JSON.stringify({runId, A: resultA, B: resultB, numericalGate: result.numericalGate, decision: result.decision}));
