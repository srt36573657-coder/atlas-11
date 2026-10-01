#!/usr/bin/env node
/**
 * W9 · 부품 ⑤ 모의 계산·방향 고르기 — 계획 plan.md ⑤ · 명령서 6판 24절 7·8줄 · T12 · T14
 *   node scripts/atlas11/overhaul/lane-b/w9.mjs [--retro-mean f --retro-median f --retro-symmetric f]
 * 쓰는 것: reports/atlas11/overhaul/part5.json
 */
import fs from 'node:fs';
import {simulateAtlas11} from '../../../../lib/atlas11/simulate.mjs';
import {simulateJointFactor36} from '../../../../lib/factor36-simulation.mjs';
import {quantile, mean as libMean} from '../../../../lib/factor36.mjs';
import {readJSON, writeJSON, r2, kstNow, gitHead, liveCells, pickDirection, bootstrapCompare, mean, sha256, ROOT} from './common.mjs';
import {rebuild, publishedDayOne, PUBS} from './pubmodel.mjs';
import {simulateAtlas11DayOne, shockTable, dayOneState, exactDayOne} from './simulate-variant.mjs';
import {perOrigin, summarize} from './metrics.mjs';

const arg = k => { const i = process.argv.indexOf(k); return i < 0 ? null : process.argv[i + 1]; };
const log = (...a) => console.error(new Date().toISOString().slice(11, 19), ...a);
const PRIMARY = '2026-09-29-atlas11-128de9174cfdfa1f';
const se = p => Math.sqrt((p.up + p.down - (p.down - p.up) ** 2) / 20000);
const tol = (p, n = 20000) => 3 * Math.sqrt(p * (1 - p) / n);
const live = liveCells();
const pubOut = {};

for (const id of Object.keys(PUBS)) {
  const t0 = Date.now(), R = rebuild(id), n = R.models.length, codes = R.input.assets.map(a => a.code);
  if (!R.inputDigestMatches || R.modelMismatches.length) throw Error('PUB_NOT_REPRODUCED ' + id);
  const zero = R.models.map(m => m.selected.lambda === 'zero'), zIdx = zero.map((z, i) => z ? i : -1).filter(i => i >= 0);
  const liveZero = live.filter(c => c.forecastId === id && c.zero).map(c => c.code).sort();
  const pubDay = codes.map((c, i) => publishedDayOne(R.pub, i));
  const paths = 20000, seed = 20260917;
  // (a) T12 — 운영 모의 계산 그대로 다시 돌림(52종목) · 무게 0 32종목만 넣어서도 돌림
  log(id, 'T12 full run');
  const sim = R.meta.kind === 'atlas11' ? simulateAtlas11(R.models, R.panel, R.input.assets, R.futureDates, {paths, seed, external: R.external}) : simulateJointFactor36(R.models, R.panel, R.input.assets, R.futureDates, {paths, seed, external: R.external});
  const rerunDay = i => { const row = sim.rows[i][0]; const d = row.direction?.daily ?? row.wave.daily; return {probabilities: d.probabilities, selected: d.selected, p50: row.p50}; };
  const diffs = codes.map((c, i) => { const a = rerunDay(i), b = pubDay[i]; return {code: c, zero: zero[i], maxAbsProbDiff: Math.max(...['up', 'flat', 'down'].map(k => Math.abs(a.probabilities[k] - b.probabilities[k]))), sameSelected: a.selected === b.selected, sameP50: a.p50 === b.p50}; });
  log(id, 'T12 32-only run');
  const sub = {dates: R.panel.dates, returns: zIdx.map(i => R.panel.returns[i]), breadth: R.panel.breadth, basket: R.panel.basket};
  const simZ = R.meta.kind === 'atlas11' ? simulateAtlas11(zIdx.map(i => R.models[i]), sub, zIdx.map(i => R.input.assets[i]), R.futureDates, {paths, seed, external: zIdx.map(i => R.external[i])}) : simulateJointFactor36(zIdx.map(i => R.models[i]), sub, zIdx.map(i => R.input.assets[i]), R.futureDates, {paths, seed, external: zIdx.map(i => R.external[i])});
  const diffsZ = zIdx.map((i, j) => { const row = simZ.rows[j][0], d = row.direction?.daily ?? row.wave.daily; return Math.max(...['up', 'flat', 'down'].map(k => Math.abs(d.probabilities[k] - pubDay[i].probabilities[k]))); });
  const T12 = {zeroWeightStocks: zIdx.length, sameZeroSetAsLedger: JSON.stringify(zIdx.map(i => codes[i]).sort()) === JSON.stringify(liveZero), maxAbsDiffZero32: Math.max(...diffs.filter(d => d.zero).map(d => d.maxAbsProbDiff)), maxAbsDiffAll52: Math.max(...diffs.map(d => d.maxAbsProbDiff)), sameSelectedAll52: diffs.filter(d => d.sameSelected).length, sameDayOneP50All52: diffs.filter(d => d.sameP50).length, onlyZero32Run: {maxAbsDiff: Math.max(...diffsZ), note: '무게 0 32종목만 넣고 운영 모의 계산을 돌려도 1일 확률이 같은가(F9: 같은 날짜 뽑기는 한 종목의 1일 확률을 바꾸지 못한다)'}, pass: null};
  T12.pass = T12.maxAbsDiffZero32 === 0 && T12.sameZeroSetAsLedger;
  // (b) T14 — 잔차 표로 직접 셈(모의 계산 없음) 대 발행
  const st = dayOneState(R.models, R.panel, R.input.assets, R.external), tab = {mean: shockTable(R.models, 'mean'), median: shockTable(R.models, 'median'), symmetric: shockTable(R.models, 'symmetric')};
  const t14 = codes.map((c, i) => { const e = exactDayOne(st.mu[i], st.h[i], tab.mean.table[i]), pp = pubDay[i].probabilities; const worst = Math.max(...['up', 'flat', 'down'].map(k => Math.abs(pp[k] - e.probabilities[k]) / Math.max(tol(e.probabilities[k]), 1e-12))); return {code: c, zero: zero[i], exact: e.probabilities, published: pp, worstRatioToTolerance: worst, within: worst <= 1, exactSelected: pickDirection(e.probabilities), publishedSelected: pubDay[i].selected}; });
  const T14 = {stocks: n, within: t14.filter(x => x.within).length, zeroWithin: t14.filter(x => x.zero && x.within).length, outside: t14.filter(x => !x.within).map(x => ({code: x.code, zero: x.zero, exact: x.exact, published: x.published, worstRatioToTolerance: x.worstRatioToTolerance, sameSelected: x.exactSelected === x.publishedSelected})), worstRatioToTolerance: Math.max(...t14.map(x => x.worstRatioToTolerance)), selectedSameAsExact: t14.filter(x => x.exactSelected === x.publishedSelected).length, tolerance: '|발행 − 직접| ≤ 3·√(p(1−p)/20000), p = 직접 센 값', pass: null, sharedResidualDates: tab.mean.sharedDates.length};
  T14.pass = T14.within === n;
  // 진단(보고만): 1일째 뽑힌 날짜 수의 고름(카이제곱) · 156개 확률 차이의 표준화 분포 — 몬테카를로 잡음인지 보는 숫자
  { const K = tab.mean.sharedDates.length, cnt = new Array(K).fill(0), rr = (await import('../../../../lib/factor36.mjs')).rng(seed); for (let b = 0; b < paths; b++) for (let d = 0; d < R.futureDates.length; d++) { const u = rr(); if (!d) cnt[Math.floor(u * K)]++; }
    const e = paths / K, chi2 = cnt.reduce((s, c) => s + (c - e) ** 2 / e, 0), devs = t14.flatMap(x => ['up', 'flat', 'down'].map(k => { const s = Math.sqrt(x.exact[k] * (1 - x.exact[k]) / paths); return s > 0 ? (x.published[k] - x.exact[k]) / s : 0; }));
    T14.diagnostic = {label: '보고만 · 판정 규칙 아님', pickUniformity: {dates: K, picks: paths, chi2, df: K - 1, zOfChi2: (chi2 - (K - 1)) / Math.sqrt(2 * (K - 1))}, standardizedDeviations: {count: devs.length, beyond2: devs.filter(d => Math.abs(d) > 2).length, beyond3: devs.filter(d => Math.abs(d) > 3).length, maxAbs: Math.max(...devs.map(Math.abs)), meanSquare: devs.reduce((s, d) => s + d * d, 0) / devs.length}}; }
  // (c) 잔차 모양(운영 표준화 잔차 z · 평균 0)
  // 상승 경계: μ + √h·z > log(1.001) · 하락 경계: μ + √h·z < log(0.999)  (expm1 기준 ±0.1%)
  const shape = codes.map((c, i) => { const z = tab.mean.table[i], s = [...z].sort((a, b) => a - b), sh = Math.sqrt(st.h[i]), upEdge = (Math.log1p(0.001) - st.mu[i]) / sh, downEdge = (Math.log1p(-0.001) - st.mu[i]) / sh; const m3 = libMean(z.map(v => v ** 3)); return {code: c, zero: zero[i], median: quantile(s, 0.5), shareBelowMean: z.filter(v => v < 0).length / z.length, shareBelowDownEdge: z.filter(v => v < downEdge).length / z.length, shareAboveUpEdge: z.filter(v => v > upEdge).length / z.length, skewness: m3, mu: st.mu[i], sqrtH: sh}; });
  const zs = shape.filter(x => x.zero);
  const residualShape = {zero32: {medianBelowZero: zs.filter(x => x.median < 0).length, of: zs.length, meanShareBelowMean: mean(zs.map(x => x.shareBelowMean)), meanMedian: mean(zs.map(x => x.median)), meanSkewness: mean(zs.map(x => x.skewness)), positiveSkew: zs.filter(x => x.skewness > 0).length}, all52: {medianBelowZero: shape.filter(x => x.median < 0).length, meanShareBelowMean: mean(shape.map(x => x.shareBelowMean))}, perStock: shape};
  // (d) 변형 — 시험 사본(평균 = 운영과 같아야 함) · A 중앙값 · B ± 대칭
  const variants = {};
  for (const center of ['mean', 'median', 'symmetric']) {
    log(id, 'variant', center);
    const v = simulateAtlas11DayOne(R.models, R.panel, R.input.assets, R.futureDates, {paths, seed, external: R.external, center});
    const rows = v.rows, ex = codes.map((c, i) => exactDayOne(st.mu[i], st.h[i], tab[center].table[i]));
    const sum = idx => { const P = idx.map(i => rows[i].direction.probabilities), E = idx.map(i => ex[i].probabilities); const ses = P.map(se); return {stocks: idx.length, meanGapPp: mean(P.map(p => (p.down - p.up) * 100)), exactMeanGapPp: mean(E.map(p => (p.down - p.up) * 100)), seConservativePp: mean(ses) * 100, seIndependentPp: Math.sqrt(ses.reduce((s, x) => s + x * x, 0)) / idx.length * 100, downChoices: idx.filter(i => rows[i].direction.selected === 'down').length, upChoices: idx.filter(i => rows[i].direction.selected === 'up').length, flatChoices: idx.filter(i => rows[i].direction.selected === 'flat').length, exactDownChoices: E.filter(p => pickDirection(p) === 'down').length}; };
    variants[center] = {zero32: sum(zIdx), all52: sum(codes.map((_, i) => i)), selected: rows.map(r => r.direction.selected), counts: rows.map(r => r.counts), pickCount: v.pickCount,
      // 발행본 1일 평균 로그수익률: atlas11 은 경로 순서로 더함(simulate.mjs:110) · rolling20 은 정렬한 뒤 더함(factor36-simulation.mjs:25)
      copyCheck: center === 'mean' ? {sameCountsAsPublished: rows.filter((r, i) => ['up', 'flat', 'down'].every(k => r.counts[k] / paths === pubDay[i].probabilities[k])).length, sameMeanLogReturnAsPublished: rows.filter((r, i) => pubDay[i].meanLogReturn === null || (R.meta.kind === 'atlas11' ? r.meanLogReturn : r.meanLogReturnSorted) === pubDay[i].meanLogReturn).length, of: n} : undefined};
  }
  // 변화 판정(32종목 · 확률 차 평균 · 3×SE · SE 는 원래와 변형 중 큰 것)
  const change = c => { const o = variants.mean.zero32, v = variants[c].zero32, s = Math.max(o.seConservativePp, v.seConservativePp); return {fromPp: o.meanGapPp, toPp: v.meanGapPp, changePp: v.meanGapPp - o.meanGapPp, threeSEPp: 3 * s, beyond3SE: Math.abs(v.meanGapPp - o.meanGapPp) > 3 * s, exactChangePp: v.exactMeanGapPp - o.exactMeanGapPp}; };
  // 실전 칸 영향(보고만): 그 목표일 무게 0 칸·전체 칸에서 방향 맞은 수
  const liveRows = live.filter(c => c.forecastId === id), right = (center, onlyZero) => liveRows.filter(c => !onlyZero || c.zero).filter(c => variants[center].selected[codes.indexOf(c.code)] === c.act).length;
  const liveImpact = {label: '보고만(판정 규칙 아님 · 이틀치 · F8)', target: PUBS[id].target, zeroCells: liveRows.filter(c => c.zero).length, rightZero: {published: liveRows.filter(c => c.zero && c.dirOk).length, mean: right('mean', true), median: right('median', true), symmetric: right('symmetric', true)}, rightAll: {published: liveRows.filter(c => c.dirOk).length, mean: right('mean', false), median: right('median', false), symmetric: right('symmetric', false)}, actual: {down: liveRows.filter(c => c.act === 'down').length, up: liveRows.filter(c => c.act === 'up').length, flat: liveRows.filter(c => c.act === 'flat').length}};
  pubOut[id] = {forecastId: id, kind: R.meta.kind, target: PUBS[id].target, primary: id === PRIMARY, input: {commit: R.meta.inputCommit, sha256: R.meta.inputSha256}, publicationSha256: R.pubSha256, zeroWeightCodes: zIdx.map(i => codes[i]), T12, T14, residualShape,
    variants: Object.fromEntries(Object.entries(variants).map(([k, v]) => [k, {zero32: v.zero32, all52: v.all52, pickCount: v.pickCount, copyCheck: v.copyCheck, perStockCounts: v.counts, perStockSelected: v.selected}])), change: {A_median: change('median'), B_symmetric: change('symmetric')}, liveImpact, perStockT14: t14, codes, zeroFlags: zero, elapsedMs: Date.now() - t0};
  log(id, 'done', Date.now() - t0);
}

// (보조) 후향 v1 방법으로 변형 A·B 를 돌린 칸 자료가 있으면 dir1sel 을 같은 규칙으로 견준다 — 판정에 쓰지 않는다
let retroAux = null;
if (arg('--retro-median') && arg('--retro-symmetric')) {
  const A = readJSON('reports/atlas11/overhaul/part1-retro-A-cells.json'), load = f => JSON.parse(fs.readFileSync(f, 'utf8'));
  const M = load(arg('--retro-median')), Y = load(arg('--retro-symmetric')), Mean = arg('--retro-mean') ? load(arg('--retro-mean')) : null;
  const sA = perOrigin(A), sM = perOrigin(M), sY = perOrigin(Y);
  const copy = Mean ? {sameSummaryAsA: Object.keys(A.summary).every(k => Mean.summary[k] === A.summary[k]), sameCells: Mean.cells.length === A.cells.length && Mean.cells.every((r, j) => JSON.stringify(r) === JSON.stringify(A.cells[j]))} : null;
  const row = (S, run) => { const s = summarize(S); return {dir1selPct: r2(s.dir1sel * 100), dir1sel: s.dir1sel, errorRatePct: s.ape1, probabilityGapMeanPp: r2(s.gap1 * 100), realizedDownMinusUpPp: r2(s.realizedGap1 * 100), picks: {down: s.downPicks1, up: s.upPicks1, flat: s.flatPicks1}, dir20selPct: r2(s.dir20sel * 100), meanErrorPct: run.summary.meanErrorPct, rankHits: run.summary.rankHits}; };
  retroAux = {label: '후향 · 보조(계획에 「판정에 안 씀」으로 적음)', copyCheckMeanEqualsA: copy, original: row(sA, A), A_median: row(sM, M), B_symmetric: row(sY, Y),
    bootstrap: {A_median_vs_original: bootstrapCompare(sM.map(x => x.dir1sel), sA.map(x => x.dir1sel)), B_symmetric_vs_original: bootstrapCompare(sY.map(x => x.dir1sel), sA.map(x => x.dir1sel))},
    perOrigin: {dir1selOriginal: sA.map(x => x.dir1sel), dir1selMedian: sM.map(x => x.dir1sel), dir1selSymmetric: sY.map(x => x.dir1sel)},
    zeroWeightCells: {original: row(perOrigin(A, c => c.zero), A), A_median: row(perOrigin(M, c => c.zero), M), B_symmetric: row(perOrigin(Y, c => c.zero), Y), note: '무게 0 칸만 · meanErrorPct·rankHits 는 전체 값'},
    files: {median: {path: arg('--retro-median'), sha256: sha256(fs.readFileSync(arg('--retro-median')))}, symmetric: {path: arg('--retro-symmetric'), sha256: sha256(fs.readFileSync(arg('--retro-symmetric')))}}};
}

const P = pubOut[PRIMARY], ch = P.change;
const stop = !P.T12.pass || !P.T14.pass;
const verdict = stop ? '모른다' : (ch.A_median.beyond3SE || ch.B_symmetric.beyond3SE) ? '원인이다' : '아니다';
const out = {schema: 'atlas11-overhaul-part-5', part: '⑤ 모의 계산·방향 고르기', work: 'W9', requirement: 'R8', tests: ['T12', 'T14'], plan: 'reports/atlas11/overhaul/plan.md ⑤', builtAt: kstNow(), builtOnCommit: gitHead(),
  oneThingChanged: '잔차 표의 중심 하나: 변형 A = 중앙값을 뺌(척도 그대로) · 변형 B = z 와 −z 를 모두 넣은 대칭 표 · 나머지(입력·계수·분산·난수 20260917·경로 20,000·목표일 20개)는 같음 · 시험 사본 scripts/atlas11/overhaul/lane-b/simulate-variant.mjs(운영 simulate.mjs 는 그대로)',
  notTested: 'F9 — 52종목이 같은 날짜를 뽑는 것은 1거래일 원인으로 시험하지 않음(한 종목의 1일 확률은 자기 잔차 표의 고른 뽑기로만 정해짐 · T12 의 무게 0 32종목만 돌린 판이 그 확인)',
  publications: pubOut, retroAux,
  decision: {primary: PRIMARY, rule: '9/29 atlas11 무게 0 32종목의 확률 차 평균을 변형 A 또는 B 가 3×SE(보수적: 종목별 SE 평균, 원래·변형 중 큰 것) 넘게 바꾸면 원인이다 · 둘 다 3×SE 이하면 아니다 · T12 또는 T14 실패면 모른다', verdict, T12: P.T12.pass, T14: P.T14.pass, change: ch,
    codeLines: ['lib/factor36.mjs:84 fitted(): 잔차 z = e/√h 를 평균을 빼고 표준편차로 나눔(무게 0 종목은 e = 실제 수익률 그대로)', 'lib/atlas11/simulate.mjs:52 공유 날짜 잔차를 다시 평균 빼고 표준편차로 나눔', 'lib/atlas11/simulate.mjs:64-67 r = μ + √h·z[뽑은 날짜]', 'lib/atlas11/simulate.mjs:103 1일 방향 = expm1(r) 가 ±0.1% 밖인지', 'lib/atlas11/simulate.mjs:32-38 가장 높은 확률 · 같으면 보합→상승→하락', 'lib/factor36.mjs:61-62 무게 0 이면 절편·β 모두 0 → μ = 0']}};
const sha = writeJSON('reports/atlas11/overhaul/part5.json', out);
console.log(JSON.stringify({sha, verdict, primary: {T12: P.T12, T14: {within: P.T14.within, zeroWithin: P.T14.zeroWithin, worst: P.T14.worstRatioToTolerance}, shape: P.residualShape.zero32, table: Object.fromEntries(Object.entries(P.variants).map(([k, v]) => [k, v.zero32])), change: ch, copy: P.variants.mean.copyCheck, live: P.liveImpact},
  other: Object.values(pubOut).filter(x => !x.primary).map(x => ({id: x.forecastId, T12: x.T12, T14: {within: x.T14.within, worst: x.T14.worstRatioToTolerance}, shape: x.residualShape.zero32, table: Object.fromEntries(Object.entries(x.variants).map(([k, v]) => [k, v.zero32])), change: x.change, copy: x.variants.mean.copyCheck, live: x.liveImpact})), retroAux: retroAux && {copy: retroAux.copyCheckMeanEqualsA, o: retroAux.original, A: retroAux.A_median, B: retroAux.B_symmetric, bA: [retroAux.bootstrap.A_median_vs_original.pCandBetter, retroAux.bootstrap.A_median_vs_original.blocksCandBetter, retroAux.bootstrap.A_median_vs_original.outcome], bB: [retroAux.bootstrap.B_symmetric_vs_original.pCandBetter, retroAux.bootstrap.B_symmetric_vs_original.blocksCandBetter, retroAux.bootstrap.B_symmetric_vs_original.outcome]}}, null, 1));
