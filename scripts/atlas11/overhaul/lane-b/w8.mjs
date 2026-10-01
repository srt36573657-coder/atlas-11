#!/usr/bin/env node
/**
 * W8 · 부품 ②③④ — 계획 plan.md ②③④ · 명령서 6판 24절 5·6줄 · T13
 *   node scripts/atlas11/overhaul/lane-b/w8.mjs --pooled <③ 후향 칸 자료(run-retro.mjs --model pooled)>
 * 읽는 것: part1-retro-A-cells.json(W7) · 발행본 두 개(되살린 입력·모델) · evolve/state.json
 * 쓰는 것: part2.json · part3.json · part3-retro-pooled-cells.json · part4.json
 */
import fs from 'node:fs';
import {components, quantile, rng} from '../../../../lib/factor36.mjs';
import {ROOT, readJSON, writeJSON, bootstrapCompare, r2, kstNow, gitHead, inputAt, sha256, liveCells, pickDirection} from './common.mjs';
import {perOrigin, summarize} from './metrics.mjs';
import {rebuild, publishedDayOne, PUBS} from './pubmodel.mjs';
import {dayOneState, shockTable, exactDayOne} from './simulate-variant.mjs';
import {closeMaps, ownInputs} from './inputs.mjs';

const arg = k => { const i = process.argv.indexOf(k); return i < 0 ? null : process.argv[i + 1]; };
const pooledFile = arg('--pooled');
if (!pooledFile) { console.error('--pooled 가 필요하다'); process.exit(2); }
const p = x => r2(x * 100);
const A = readJSON('reports/atlas11/overhaul/part1-retro-A-cells.json');
if (A.model !== 'A' || !A.reproduction?.identical) throw Error('A_CELLS_NOT_REPRODUCED');
const verdictOf = (b, causeIf) => (causeIf === 'cand' ? b.candBetter : b.refBetter) ? '원인이다' : (causeIf === 'cand' ? b.refBetter : b.candBetter) ? '아니다' : '모른다';
const groupSummary = s => ({cells: s.n, dir1selPct: p(s.dir1sel), dir1sel: s.dir1sel, right1: s.right1, errorRatePct: s.ape1, errorRateRounded: r2(s.ape1), closeAsIsErrorRatePct: s.ape1close, probabilityGapMeanPp: p(s.gap1), realizedDownMinusUpPp: p(s.realizedGap1), picks: {down: s.downPicks1, up: s.upPicks1, flat: s.flatPicks1}, dir20selPct: p(s.dir20sel), errorRate20Pct: s.ape20});
// 칸 수로 가중한 평균(기준일 평균과 함께 적는다)
const cellRate = (run, filter) => { const S = perOrigin(run, filter).filter(Boolean); const n = S.reduce((a, x) => a + x.n, 0); return {cells: n, right1: S.reduce((a, x) => a + x.right1, 0), dir1selCellPct: p(S.reduce((a, x) => a + x.right1, 0) / n)}; };

// ================= ② 종목별 무게 =================
const W = perOrigin(A, c => !c.zero), Z = perOrigin(A, c => c.zero);
if (W.some(x => !x) || Z.some(x => !x)) throw Error('EMPTY_GROUP_AT_SOME_ORIGIN');
const b2 = bootstrapCompare(W.map(x => x.dir1sel), Z.map(x => x.dir1sel));
const b2err = {meanDifferenceErrorPct: summarize(W).ape1 - summarize(Z).ape1};
const v2 = verdictOf(b2, 'cand');
const part2 = {schema: 'atlas11-overhaul-part-2', part: '② 종목별 무게', work: 'W8', requirement: 'R8', label: '후향', plan: 'reports/atlas11/overhaul/plan.md ②', builtAt: kstNow(), builtOnCommit: gitHead(),
  oneThingChanged: '없음 — 같은 A 후향 실행(part1-retro-A-cells.json) 안에서 그 블록에 무게(절편·β 7개)가 모두 0인 종목의 칸과 아닌 칸으로 나눔',
  source: {file: 'reports/atlas11/overhaul/part1-retro-A-cells.json', sha256: sha256(fs.readFileSync(ROOT + '/reports/atlas11/overhaul/part1-retro-A-cells.json'))},
  zeroWeightStocksPerBlock: A.blocks.map(b => ({block: b.block, originFirst: b.originFirst, zero: b.zeroWeightStocks, weighted: 52 - b.zeroWeightStocks})),
  weighted: {...groupSummary(summarize(W)), ...cellRate(A, c => !c.zero)}, zeroWeight: {...groupSummary(summarize(Z)), ...cellRate(A, c => c.zero)},
  bootstrap: {...b2, note: 'cand = 무게 있는 칸, ref = 무게 0 칸 · 기준일마다 두 무리의 맞음률 차'}, errorRateDifferenceWeightedMinusZeroPct: b2err.meanDifferenceErrorPct,
  perOrigin: {dates: A.origins.map(o => o.date), weightedDir1sel: W.map(x => x.dir1sel), zeroDir1sel: Z.map(x => x.dir1sel), weightedN: W.map(x => x.n), zeroN: Z.map(x => x.n), weightedApe1: W.map(x => x.ape1), zeroApe1: Z.map(x => x.ape1), weightedGap1: W.map(x => x.gap1), zeroGap1: Z.map(x => x.gap1)},
  decision: {rule: '「무게 있는 칸이 낫다」(P ≥ 0.80 그리고 6블록 중 ≥ 4) → 원인이다 · 「무게 0 칸이 낫다」 → 아니다 · 그 밖 모른다', verdict: v2, thresholds: {p: 0.8, blocks: 4},
    codeLines: ['lib/factor36.mjs:61 fitRidge 절편 = λ가 무한대(zero)면 0', 'lib/factor36.mjs:62 λ = 무한대면 β 7개 모두 0', 'lib/factor36.mjs:92 candidatesFor: 벌점 [무한대(zero), 1, 10] × 변동폭 [상수, GARCH] 중 선택 구간 CRPS 가 가장 낮은 것']}};
const s2 = writeJSON('reports/atlas11/overhaul/part2.json', part2);

// ================= ③ 52종목 공통 식 =================
const C = JSON.parse(fs.readFileSync(pooledFile, 'utf8'));
if (C.model !== 'pooled' || C.center !== 'mean' || C.input.sha256 !== A.input.sha256 || C.protocolSHA256 !== A.protocolSHA256 || C.origins.length !== 120) throw Error('POOLED_RUN_NOT_COMPARABLE');
const SA = perOrigin(A), SC = perOrigin(C);
const b3 = bootstrapCompare(SC.map(x => x.dir1sel), SA.map(x => x.dir1sel)), b3_20 = bootstrapCompare(SC.map(x => x.dir20sel), SA.map(x => x.dir20sel));
const v3 = verdictOf(b3, 'cand');
const pooledCopy = 'reports/atlas11/overhaul/part3-retro-pooled-cells.json', pooledSha = writeJSON(pooledCopy, C);
const part3 = {schema: 'atlas11-overhaul-part-3', part: '③ 52종목 공통 식(무게 한 벌)', work: 'W8', requirement: 'R8', label: '후향', plan: 'reports/atlas11/overhaul/plan.md ③', builtAt: kstNow(), builtOnCommit: gitHead(),
  oneThingChanged: '평균 식 계수(절편 + β 7개)를 52종목이 함께 쓰는 한 벌로(쌓은 학습 행에 같은 fitRidge · 같은 벌점 목록 {zero,1,10} · 벌점은 52종목 평균 선택 구간 CRPS 로 하나) · 변동폭 종류·잔차는 종목별 그대로 · 기준일·난수·경로 같음',
  code: 'scripts/atlas11/overhaul/lane-b/pooled.mjs', sameProtocol: {input: C.input.sha256 === A.input.sha256, protocolSHA256: C.protocolSHA256, paths: C.protocol.paths, seed: C.protocol.seed},
  blocks: C.blocks.map(b => ({block: b.block, originFirst: b.originFirst, chosenPenalty: b.extra?.chosenLambda, pooledInnerCRPS: b.extra?.pooledInnerLoss, volatilityKinds: b.extra?.kinds, intercept: b.extra?.intercept, beta: b.extra?.beta, zeroWeightStocks: b.zeroWeightStocks})),
  A: {...groupSummary(summarize(SA)), meanErrorPct: A.summary.meanErrorPct, rankHits: A.summary.rankHits}, C: {...groupSummary(summarize(SC)), meanErrorPct: C.summary.meanErrorPct, rankHits: C.summary.rankHits},
  bootstrap: {...b3, note: 'cand = C(공통 식), ref = A'}, bootstrap20: {...b3_20, note: '20거래일 · 보고만'},
  perOrigin: {dates: A.origins.map(o => o.date), dir1selA: SA.map(x => x.dir1sel), dir1selC: SC.map(x => x.dir1sel), ape1A: SA.map(x => x.ape1), ape1C: SC.map(x => x.ape1), dir20selA: SA.map(x => x.dir20sel), dir20selC: SC.map(x => x.dir20sel)},
  decision: {rule: '「C가 낫다」(P ≥ 0.80 그리고 6블록 중 ≥ 4) → 원인이다(결정표 후보 C) · 「A가 낫다」 → 아니다 · 그 밖 모른다', verdict: v3, thresholds: {p: 0.8, blocks: 4},
    codeLines: ['lib/factor36.mjs:86-100 fitFactorModel(종목마다 따로 적합 · 운영 A)', 'lib/atlas11/evolve/backtest.mjs:41 블록 앞에서 종목마다 fitSpecModel', 'scripts/atlas11/overhaul/lane-b/pooled.mjs pooledFit(시험 사본 · 쌓은 행 한 번 적합)']},
  files: {[pooledCopy]: pooledSha}};
const s3 = writeJSON('reports/atlas11/overhaul/part3.json', part3);

// ================= ④ 세 요인 입력값 =================
const head = inputAt('HEAD', 'public/data/input.json', null);
const pubResults = [];
let maxAll = 0;
for (const id of Object.keys(PUBS)) {
  const R = rebuild(id), n = R.models.length, origin = R.panel.dates.at(-1);
  if (!R.inputDigestMatches || R.modelMismatches.length) throw Error('PUB_NOT_REPRODUCED ' + id);
  // 운영이 쓴 값: lib 함수로 운영과 같은 순서(simulate.mjs:53-57 · 61-67)
  const used = dayOneState(R.models, R.panel, R.input.assets, R.external);
  // 발행본과 대조: 1일째 기여 누적(20,000번 더한 뒤 나눔) · 1일째 p50(같은 난수로 뽑은 날짜)
  const paths = R.pub.paths ?? R.pub.policy?.paths ?? 20000, seed = R.pub.seed ?? R.pub.policy?.seed ?? 20260917, H = R.futureDates.length;
  const {table} = shockTable(R.models, 'mean'), rnd = rng(seed), picks = new Int32Array(paths);
  for (let b = 0; b < paths; b++) for (let d = 0; d < H; d++) { const u = rnd(); if (d === 0) picks[b] = Math.floor(u * table[0].length); }
  const verify = [];
  for (let i = 0; i < n; i++) {
    const pd = publishedDayOne(R.pub, i), c = components(R.models[i].regression, used.x[i]), sums = Array(c.values.length).fill(0); let sumMu = 0;
    for (let b = 0; b < paths; b++) { sumMu += c.total; for (let j = 0; j < c.values.length; j++) sums[j] += c.values[j]; }
    const cs = {}; R.models[i].featureFactors.forEach((f, j) => cs[f] = (cs[f] ?? 0) + sums[j] / paths);
    const anchor = R.input.assets[i].prices.find(q => q.date === origin).close, lo = Math.log(anchor), prices = new Float64Array(paths);
    for (let b = 0; b < paths; b++) prices[b] = Math.exp(lo + (c.total + Math.sqrt(used.h[i]) * table[i][picks[b]]));
    prices.sort();
    verify.push({code: R.input.assets[i].code, contributionsSame: cs.F35 === pd.contributions.F35 && cs.F11 === pd.contributions.F11, meanSame: sumMu / paths === pd.factorMeanLogReturn, p50Same: quantile(prices, 0.5) === pd.p50});
  }
  // 내 코드(운영 코드 안 씀): 같은 입력의 원 종가에서
  const sessions = R.calendar.sessions.filter(d => d <= origin);
  const own = ownInputs({sessions, closes: closeMaps(R.source.assets, origin), models: R.pub.assets.map(a => a.model), origin});
  // 가장 나중 자료판(HEAD input.json)의 같은 날짜 종가로
  const headAssets = R.source.assets.map(a => head.input.assets.find(x => x.code === a.code));
  const late = ownInputs({sessions, closes: closeMaps(headAssets, origin), models: R.pub.assets.map(a => a.model), origin});
  const windowStart = sessions[Math.max(0, sessions.indexOf(R.models[0].trainedThrough) - 66)];
  let changedCloses = []; R.source.assets.forEach((a, i) => { const m0 = closeMaps([a], origin)[0], m1 = closeMaps([headAssets[i]], origin)[0]; for (const d of sessions.filter(d => d >= windowStart)) if (m0.get(d) !== m1.get(d)) changedCloses.push({code: a.code, date: d, used: m0.get(d), latest: m1.get(d)}); });
  const diff = (o) => { let fx = 0, fh = 0, fc = 0, where = null; for (let i = 0; i < n; i++) { for (let k = 0; k < 7; k++) { const d = Math.abs(o.out[i].x[k] - used.x[i][k]); if (d > fx) { fx = d; where = {code: R.input.assets[i].code, feature: k}; } } fh = Math.max(fh, Math.abs(o.out[i].h - used.h[i]) / used.h[i]); const pd = publishedDayOne(R.pub, i); fc = Math.max(fc, Math.abs(o.out[i].F35 - pd.contributions.F35), Math.abs(o.out[i].F11 - pd.contributions.F11)); } return {maxAbsFeature: fx, maxAbsFeatureAt: where, maxRelVariance: fh, maxAbsContributionVsPublished: fc}; };
  const dOwn = diff(own), dLate = diff(late);
  maxAll = Math.max(maxAll, dOwn.maxAbsFeature, dOwn.maxRelVariance, dOwn.maxAbsContributionVsPublished, dLate.maxAbsFeature, dLate.maxRelVariance, dLate.maxAbsContributionVsPublished);
  const notUsed = R.pub.assets[0].model.factors ? R.pub.assets.map(a => a.model.factors.filter(f => f.role === 'not_used').length) : null;
  // 영향(보고만 · 판정 규칙 아님): 잔차 표로 직접 센 1일 방향 — 쓴 값 대 나중 자료판 값
  const live = liveCells().filter(c => c.forecastId === id), impact = {flips: [], gapUsedPp: 0, gapLatestPp: 0};
  for (let i = 0; i < n; i++) {
    const cu = components(R.models[i].regression, used.x[i]).total, eu = exactDayOne(cu, used.h[i], table[i]), el = exactDayOne(late.out[i].mu, late.out[i].h, table[i]);
    const du = pickDirection(eu.probabilities), dl = pickDirection(el.probabilities), cell = live.find(c => c.code === R.input.assets[i].code);
    impact.gapUsedPp += (eu.probabilities.down - eu.probabilities.up) * 100 / n; impact.gapLatestPp += (el.probabilities.down - el.probabilities.up) * 100 / n;
    if (du !== dl) impact.flips.push({code: cell.code, name: cell.name, used: du, latest: dl, actual: cell.act, usedRight: du === cell.act, latestRight: dl === cell.act});
  }
  impact.flipCount = impact.flips.length; impact.rightWithUsed = impact.flips.filter(f => f.usedRight).length; impact.rightWithLatest = impact.flips.filter(f => f.latestRight).length;
  pubResults.push({forecastId: id, target: PUBS[id].target, origin, inputDigestMatchesPublication: R.inputDigestMatches, modelParamsIdenticalToPublication: R.modelMismatches.length === 0, input: {commit: PUBS[id].inputCommit, sha256: PUBS[id].inputSha256, calendarSha256: R.calendarSha256},
    usedValuesMatchPublication: {contributionsF35F11: verify.filter(v => v.contributionsSame).length, meanLogReturn: verify.filter(v => v.meanSame).length, dayOneP50: verify.filter(v => v.p50Same).length, of: n, mismatched: verify.filter(v => !(v.contributionsSame && v.meanSame && v.p50Same)).map(v => v.code)},
    ownRecomputeVsUsed: dOwn, latestVintageVsUsed: {...dLate, headInputSha256: head.sha256, changedClosesInWindow: changedCloses.length, changedStocks: [...new Set(changedCloses.map(c => c.code))].length, changedCloses, windowFrom: windowStart},
    impactOnDayOneDirection: {label: '보고만(판정 규칙 아님) · 잔차 표로 직접 셈 · 같은 계수·같은 잔차 표', ...impact},
    garchUpdatesSinceTraining: own.out[0].updates, unusedFactorCountPerStock: notUsed ? [...new Set(notUsed)] : null});
}
const tol = 1e-9, v4 = maxAll > tol ? '원인이다' : '아니다';
const state = readJSON('reports/atlas11/evolve/state.json');
const featureCands = Object.values(state.candidates).filter(c => c.family === 'features').map(c => ({candidateId: c.candidateId, label: c.label, featureMask: c.spec.featureMask, status: c.status, rejectedReason: c.history.find(h => h.type === 'rejected')?.reason ?? null, gateReasons: c.gates?.reasons ?? null}));
const leak = run => ({origins: run.leak.length, strictTrainingEndBeforeOrigin: run.leak.filter(l => l.strictBefore).length, equalToOrigin: run.leak.filter(l => l.equal).length, afterOrigin: run.leak.filter(l => l.after).length, noFutureData: run.leak.filter(l => l.noFuture).length, equalOrigins: run.leak.filter(l => l.equal).map(l => l.origin)});
const t13A = leak(A), t13C = leak(C);
// 계획 밖 민감도(판정을 바꾸지 않음): 블록 첫날 행을 학습에서 뺀 판(--strict)으로 ①②③ 판정이 같은지
let strictSensitivity = null;
if (arg('--strict-A') && arg('--strict-pooled')) {
  const As = JSON.parse(fs.readFileSync(arg('--strict-A'), 'utf8')), Cs = JSON.parse(fs.readFileSync(arg('--strict-pooled'), 'utf8'));
  if (!As.strictTrainingBeforeOrigin || !Cs.strictTrainingBeforeOrigin || As.model !== 'A' || Cs.model !== 'pooled' || As.input.sha256 !== A.input.sha256 || As.protocolSHA256 !== A.protocolSHA256) throw Error('STRICT_RUNS_NOT_COMPARABLE');
  const sA = perOrigin(As), sC = perOrigin(Cs), Ws = perOrigin(As, c => !c.zero), Zs = perOrigin(As, c => c.zero);
  const rules1 = {alwaysUp: 'up1', alwaysDown: 'down1', ownPrevDay: 'prev1', marketPrevDay: 'market1'};
  const one = Object.fromEntries(Object.entries(rules1).map(([name, key]) => [name, bootstrapCompare(sA.map(x => x[key]), sA.map(x => x.dir1sel))]));
  const v1s = Object.values(one).some(b => b.candBetter) ? '원인이다' : Object.values(one).every(b => b.refBetter) ? '아니다' : '모른다';
  const b2s = bootstrapCompare(Ws.map(x => x.dir1sel), Zs.map(x => x.dir1sel)), b3s = bootstrapCompare(sC.map(x => x.dir1sel), sA.map(x => x.dir1sel));
  const part1 = readJSON('reports/atlas11/overhaul/part1.json');
  const verdicts = {'①': v1s, '②': verdictOf(b2s, 'cand'), '③': verdictOf(b3s, 'cand')};
  strictSensitivity = {label: '후향 · 계획 밖 민감도(판정을 바꾸지 않음) — 학습 행을 기준일 「전」까지만(r.date < o.date)', T13: {A: leak(As), C: leak(Cs)},
    dir1selPct: {A: p(summarize(sA).dir1sel), C: p(summarize(sC).dir1sel), weighted: p(summarize(Ws).dir1sel), zero: p(summarize(Zs).dir1sel), alwaysUp: p(summarize(sA).up1), alwaysDown: p(summarize(sA).down1)},
    bootstrap: {'①': Object.fromEntries(Object.entries(one).map(([k, b]) => [k, {pRuleBetter: b.pCandBetter, pModelBetter: b.pRefBetter, blocksRule: b.blocksCandBetter, blocksModel: b.blocksRefBetter, outcome: b.outcome}])), '②': {pWeightedBetter: b2s.pCandBetter, pZeroBetter: b2s.pRefBetter, blocks: [b2s.blocksCandBetter, b2s.blocksRefBetter], outcome: b2s.outcome}, '③': {pCBetter: b3s.pCandBetter, pABetter: b3s.pRefBetter, blocks: [b3s.blocksCandBetter, b3s.blocksRefBetter], outcome: b3s.outcome}},
    verdicts, sameVerdictsAsV1Runs: verdicts['①'] === part1.decision.verdict && verdicts['②'] === v2 && verdicts['③'] === v3,
    perOrigin: {dir1selA: sA.map(x => x.dir1sel), dir1selC: sC.map(x => x.dir1sel), weighted: Ws.map(x => x.dir1sel), zero: Zs.map(x => x.dir1sel), alwaysUp1: sA.map(x => x.up1), alwaysDown1: sA.map(x => x.down1), ownPrev1: sA.map(x => x.prev1), marketPrev1: sA.map(x => x.market1)},
    files: {A: {path: arg('--strict-A'), sha256: sha256(fs.readFileSync(arg('--strict-A')))}, pooled: {path: arg('--strict-pooled'), sha256: sha256(fs.readFileSync(arg('--strict-pooled')))}, note: '칸 자료는 만드는 이 작업 폴더에만 · 기준일별 값은 여기 perOrigin'}};
}
const part4 = {schema: 'atlas11-overhaul-part-4', part: '④ 세 요인의 입력값(F35·F11·F36)', work: 'W8', requirement: 'R8', tests: ['T13'], plan: 'reports/atlas11/overhaul/plan.md ④', builtAt: kstNow(), builtOnCommit: gitHead(),
  oneThingChanged: '입력값을 운영 코드를 쓰지 않는 내 코드(scripts/atlas11/overhaul/lane-b/inputs.mjs)로 원 종가에서 다시 셈 · 그리고 가장 나중 자료판 종가로 다시 셈',
  usedValuesHow: '운영이 쓴 값 = 되살린 입력·모델(발행본과 입력 지문·계수 모두 같음)에 lib 함수를 운영과 같은 순서로 적용(simulate.mjs:53-57) · 발행본 1일째 기여(F35·F11)·평균·p50 과 한 자리까지 같은지 확인',
  publications: pubResults, threshold: tol, maxDifferenceAll: maxAll,
  notUsedFactors: {statement: '36요인 중 숫자로 계산에 들어가는 것은 F35(자기 1·2·5·20·60일 평균)·F11(52종목 폭·5일 평균) 평균 식과 F36(잔차 변동폭) 분산뿐이다. 나머지 33개는 계수가 없고 모의 계산에 들어가지 않으므로, 「틀린 입력값」이라는 뜻에서 이 1거래일 오답의 원인이 될 수 없다(빠진 요인이라는 뜻에서는 이 진단이 따지지 않았다).', codeLines: ['lib/factor36.mjs:55 FEATURE_FACTORS = F35×5, F11×2', 'lib/factor36.mjs:68 fitVolatility(F36 = 잔차 분산 · 상수/GARCH)', 'lib/factor36-input.mjs:6 기록(records)에 있는 요인만 더 붙을 수 있음', 'public/data/factor36-records.json records 0개', 'lib/atlas11/forecast.mjs:81 나머지 요인 status missing · role not_used · 「검증된 시점별 입력 미확보 → 계수 0」']},
  v1FeatureCandidates: {source: 'reports/atlas11/evolve/state.json', candidates: featureCands},
  T13: {rule: '모든 후향 기준일에서 학습 끝 < 기준일', A: t13A, C: t13C, literalPass: t13A.equalToOrigin === 0 && t13A.afterOrigin === 0 && t13C.equalToOrigin === 0 && t13C.afterOrigin === 0, noFutureDataPass: t13A.noFutureData === 120 && t13C.noFutureData === 120,
    note: '블록 첫 기준일(6개)은 학습 끝 = 기준일이다(lib/atlas11/evolve/backtest.mjs:41 r.date <= o.date · :47 은 > 일 때만 멈춤). 그 행의 실제값은 기준일 종가까지의 수익률이라 발행 시점에 이미 알려진 값이고, 첫 목표일은 모두 기준일보다 뒤다. 글자 그대로(<)는 실패, 미래 자료 없음은 통과 — 판단은 따지는 이에게.',
    strictSensitivity},
  decision: {rule: '특징값·기여의 절대 차이 또는 분산의 상대 차이가 1e-9 를 넘는 칸이 있으면 원인이다(결정표: 후보 아님 · 자료 정정 기록 + 보고) · 모두 1e-9 이하면 아니다 · 입력을 되살리지 못하면 모른다', verdict: v4, threshold: tol,
    codeLines: ['lib/factor36.mjs:47-51 pricePanel(로그수익률·폭·평균)', 'lib/factor36.mjs:53 features', 'lib/atlas11/simulate.mjs:57 1일째 분산(GARCH 갱신)', 'lib/factor36-simulation.mjs:10 같은 계산(rolling20)']}};
const s4 = writeJSON('reports/atlas11/overhaul/part4.json', part4);
console.log(JSON.stringify({part2: {sha: s2, verdict: v2, weighted: part2.weighted.dir1selPct, zero: part2.zeroWeight.dir1selPct, p: [b2.pCandBetter, b2.blocksCandBetter, b2.pRefBetter, b2.blocksRefBetter], gapW: part2.weighted.probabilityGapMeanPp, gapZ: part2.zeroWeight.probabilityGapMeanPp},
  part3: {sha: s3, verdict: v3, A: part3.A.dir1selPct, C: part3.C.dir1selPct, p: [b3.pCandBetter, b3.blocksCandBetter, b3.pRefBetter, b3.blocksRefBetter], penalties: part3.blocks.map(b => b.chosenPenalty)},
  part4: {sha: s4, verdict: v4, maxAll, pubs: pubResults.map(r => ({id: r.forecastId, used: r.usedValuesMatchPublication, own: r.ownRecomputeVsUsed, late: {f: r.latestVintageVsUsed.maxAbsFeature, h: r.latestVintageVsUsed.maxRelVariance, changed: r.latestVintageVsUsed.changedClosesInWindow}})), T13: {A: t13A, literal: part4.T13.literalPass, noFuture: part4.T13.noFutureDataPass}}}, null, 1));
