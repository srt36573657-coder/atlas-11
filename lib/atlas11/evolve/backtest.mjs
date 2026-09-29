/**
 * ATLAS 11 · 진화 실험 — 시간순 검증(120 기준일 · 6블록 · 20거래일 · 같은 난수)
 * 운영과 후보를 같은 입력 자격·같은 종목·같은 목표일·같은 난수 흐름으로 비교한다.
 *   과거 학습 → 내부 후보 선택(inner) → 아직 보지 않은 이후 구간 평가. 블록 앞에서 재적합·선택, 블록 안 계수 동결.
 *   학습 종료일 < 기준일(AB_FUTURE_TRAINING 검사) · 목표일 실제값은 선택에 쓰지 않는다.
 * 기록: 기준일별 오차·순위 적중·방향·담김·interval·Brier(D+1·D+20) · 블록별 요약 · 실패 횟수.
 */
import fs from 'node:fs/promises';
import path from 'node:path';
import {createHash} from 'node:crypto';
import {pricePanel, examplesFor, mean} from '../../factor36.mjs';
import {simulateJointFactor36} from '../../factor36-simulation.mjs';
import {rollingBacktestPlan, truncateObservedPanel, rankingHits} from '../../rolling-backtest.mjs';
import {fitSpecModel, specDesign, specId, normalizeSpec, carryAt} from './models.mjs';

const finite = x => typeof x === 'number' && Number.isFinite(x);
const sha = x => createHash('sha256').update(typeof x === 'string' || Buffer.isBuffer(x) ? x : JSON.stringify(x)).digest('hex');
const dirOf = (r, delta = 0.001) => r > delta ? 'up' : r < -delta ? 'down' : 'flat';
const brier = (p, actual) => ['up', 'flat', 'down'].reduce((s, c) => s + ((p?.[c] ?? 0) - (actual === c ? 1 : 0)) ** 2, 0);

export function protocolOf(config, overrides = {}) {
  const v = config.validation;
  return {schema: 'atlas11-evolve-protocol-1', originDays: v.originDays, blocks: v.blocks, blockDays: v.blockDays, horizon: v.horizon, paths: v.paths, seed: v.seed, topK: v.topK, trainingBefore: v.trainingBefore, order: v.order, leakageChecks: v.leakageChecks, ...overrides};
}

/** 한 명세의 시간순 검증. onProgress(k, total) · 결과는 캐시 파일(입력 해시·프로토콜 해시가 같을 때만 재사용). */
export async function runSpecBacktest(input, spec, {protocol, cacheDir = null, onProgress = () => {}, inputSHA256 = null} = {}) {
  const s = normalizeSpec(spec), id = specId(s), protoHash = sha(protocol).slice(0, 16), inputHash = inputSHA256 ?? sha(JSON.stringify(input));
  const cacheFile = cacheDir ? path.join(cacheDir, `${id}.json`) : null;
  if (cacheFile) { try { const cached = JSON.parse(await fs.readFile(cacheFile, 'utf8')); if (cached.inputSHA256 === inputHash && cached.protocolSHA256 === protoHash && cached.complete) return {...cached, fromCache: true}; } catch (e) { if (e.code !== 'ENOENT') throw e; } }
  const started = new Date().toISOString(), t0 = Date.now();
  const {panel, origins} = rollingBacktestPlan(input, protocol);
  const assets = input.assets, base = assets.map((a, i) => examplesFor(panel, i));
  const designs = assets.map((a, i) => specDesign(s, panel, i, assets, base[i]));
  const prices = assets.map(a => new Map(a.prices.map(r => [r.date, r.quality === 'conflict' ? null : r.close])));
  const days = [], blocks = [], failures = [];
  let models = null, blockAcceptance = null;
  for (let k = 0; k < origins.length; k++) {
    const o = origins[k];
    if (k % protocol.blockDays === 0) {
      models = designs.map(d => fitSpecModel(d.rows.filter(r => r.date <= o.date), s, {featureFactors: d.featureFactors}));
      const bad = models.map((m, i) => m.status !== 'research_estimate' ? assets[i].code : null).filter(Boolean);
      if (bad.length) throw Error('EVOLVE_INSUFFICIENT_HISTORY block ' + o.block + ' ' + bad.join(','));
      blockAcceptance = {block: o.block, originFirst: o.date, maximumTrainingDate: models.map(m => m.trainedThrough).sort().at(-1), selectedKinds: models.reduce((acc, m) => { acc[m.selected.id] = (acc[m.selected.id] ?? 0) + 1; return acc; }, {})};
      blocks.push(blockAcceptance);
    }
    if (models.some(m => m.trainedThrough > o.date || m.shockDates.some(d => d > o.date))) throw Error('AB_FUTURE_TRAINING');
    const observed = truncateObservedPanel(panel, o.panelIndex);
    // carry 입력: 기준일 값으로 고정(미래 경로에서 갱신하지 않음) · 기준일까지의 값만 사용
    const external = designs.map((d, i) => ({selected: d.selected.map(x => ({...x, current: {...x.current, value: carryAt(x.kind, panel, i, assets, o.panelIndex), date: o.date}}))}));
    if (external.some(e => e.selected.some(x => !finite(x.current.value)))) throw Error('EVOLVE_CARRY_MISSING ' + o.date);
    const sim = simulateJointFactor36(models, observed, assets, o.targets, {paths: protocol.paths, seed: protocol.seed, external});
    const errs = [], byH = {1: [], 5: [], 10: [], 20: []}, pred20 = {}, actual20 = {}, d20 = [], c20 = [], i20 = [], b20 = [], d1 = [], c1 = [], b1 = [];
    for (let i = 0; i < assets.length; i++) {
      const code = assets[i].code, anchor = prices[i].get(o.date);
      if (!finite(anchor) || anchor <= 0) throw Error('AB_MISSING_ANCHOR ' + code + ' ' + o.date);
      for (let h = 0; h < protocol.horizon; h++) {
        const target = o.targets[h], v = prices[i].get(target), row = sim.rows[i][h];
        if (!finite(v) || v <= 0 || !finite(row.p50)) throw Error('AB_INVALID_PAIR ' + code + ' ' + target);
        const ape = Math.abs(row.p50 - v) / v * 100; errs.push(ape); if (byH[h + 1]) byH[h + 1].push(ape);
        const ar = v / anchor - 1, pr = row.p50 / anchor - 1, covered = v >= row.p10 && v <= row.p90, interval = ((row.p90 - row.p10) + (v < row.p10 ? 10 * (row.p10 - v) : 0) + (v > row.p90 ? 10 * (v - row.p90) : 0)) / anchor;
        if (h === 0) { d1.push(dirOf(ar) === dirOf(pr) ? 1 : 0); c1.push(covered ? 1 : 0); b1.push(brier(row.wave?.daily?.probabilities, dirOf(ar))); }
        if (h === protocol.horizon - 1) { pred20[code] = pr; actual20[code] = ar; d20.push(dirOf(ar) === (row.wave?.horizon?.selected ?? dirOf(pr)) ? 1 : 0); c20.push(covered ? 1 : 0); i20.push(interval); b20.push(brier(row.wave?.horizon?.probabilities, dirOf(ar))); }
      }
    }
    const rank = rankingHits(pred20, actual20, protocol.topK);
    days.push({date: o.date, block: o.block, meanErrorPct: mean(errs), ape1: mean(byH[1]), ape5: mean(byH[5]), ape10: mean(byH[10]), ape20: mean(byH[20]), rankHits: rank.hits, predictedTop: rank.predictedTop, actualTop: rank.actualTop, dir20: mean(d20), cov20: mean(c20), interval20: mean(i20), brier20: mean(b20), dir1: mean(d1), cov1: mean(c1), brier1: mean(b1)});
    onProgress(k + 1, origins.length, o.date);
  }
  const agg = key => mean(days.map(d => d[key]));
  const byBlock = Array.from({length: protocol.blocks}, (_, b) => { const rows = days.filter(d => d.block === b + 1); return {block: b + 1, days: rows.length, meanErrorPct: mean(rows.map(d => d.meanErrorPct)), rankHits: rows.reduce((s, d) => s + d.rankHits, 0), dir20: mean(rows.map(d => d.dir20)), cov20: mean(rows.map(d => d.cov20))}; });
  const result = {schema: 'atlas11-evolve-backtest-1', specId: id, spec: s, protocol, protocolSHA256: protoHash, inputSHA256: inputHash, actualAsOf: input.actualAsOf, startedAt: started, finishedAt: new Date().toISOString(), elapsedMs: Date.now() - t0,
    complete: days.length === protocol.originDays, origins: days.length, stocks: assets.length, rankMaximum: days.length * protocol.topK,
    summary: {meanErrorPct: agg('meanErrorPct'), rankHits: days.reduce((s, d) => s + d.rankHits, 0), ape1: agg('ape1'), ape5: agg('ape5'), ape10: agg('ape10'), ape20: agg('ape20'), dir20: agg('dir20'), cov20: agg('cov20'), interval20: agg('interval20'), brier20: agg('brier20'), dir1: agg('dir1'), cov1: agg('cov1'), brier1: agg('brier1')},
    byBlock, blocks, days, failures,
    leakage: {futureTraining: 0, futureTargetsInSelection: 0, trainingBefore: protocol.trainingBefore, note: '학습 종료일 < 기준일 검사 통과(위반 시 예외로 중단) · 선택(inner)에 목표일 실제값 미사용'},
    audit: {sameRandomStream: true, pathsPerModelPerOrigin: protocol.paths, independentStockTrials: false, overlappingHorizons: true, priceVintageVerified: false, corporateActionsVerified: false, trustProbability: null}};
  if (cacheFile) { await fs.mkdir(cacheDir, {recursive: true}); await fs.writeFile(cacheFile + '.tmp', JSON.stringify(result)); await fs.rename(cacheFile + '.tmp', cacheFile); }
  return result;
}

/** 블록 부트스트랩: 기준일 블록(20일)을 복원 추출해 「후보 오차 − 운영 오차」 평균의 분포를 본다 */
export function blockBootstrap(daysA, daysB, {blockLength = 20, resamples = 2000, seed = 20260929} = {}) {
  if (daysA.length !== daysB.length || !daysA.length) throw Error('BOOTSTRAP_INPUT');
  const diff = daysA.map((d, k) => daysB[k].meanErrorPct - d.meanErrorPct), nb = Math.ceil(diff.length / blockLength);
  let s = seed >>> 0; const rnd = () => { s = (Math.imul(1664525, s) + 1013904223) >>> 0; return s / 4294967296; };
  let better = 0; const means = [];
  for (let r = 0; r < resamples; r++) {
    const picked = []; for (let b = 0; b < nb; b++) { const start = Math.floor(rnd() * nb) * blockLength; for (let j = start; j < Math.min(start + blockLength, diff.length); j++) picked.push(diff[j]); }
    const m = mean(picked); means.push(m); if (m < 0) better++;
  }
  means.sort((a, b) => a - b);
  return {method: 'block_bootstrap_over_origin_days', blockLength, resamples, seed, meanDifference: mean(diff), probabilityCandidateBetter: better / resamples, ci90: [means[Math.floor(resamples * 0.05)], means[Math.floor(resamples * 0.95)]], note: '기준일은 목표 구간이 겹치므로 독립 표본이 아니다 · 블록 단위 재추출로 날짜 의존을 반영한 서술 통계'};
}
