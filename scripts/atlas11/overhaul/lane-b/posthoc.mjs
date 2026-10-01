#!/usr/bin/env node
/**
 * 계획 밖 · 결과를 본 뒤 — 따지는 이(검토) 지적에 따라 더한 계산. 판정 규칙(plan.md)은 바꾸지 않는다.
 *   node scripts/atlas11/overhaul/lane-b/posthoc.mjs --strict-A <A-strict 칸 자료>
 * 고치는 파일: part4.json · part5.json 에 「posthoc」 칸을 더한다(원래 숫자는 그대로 둔다).
 *   ④ 발행 방식(운영 simulateJointFactor36 · 경로 20,000 · 난수 20260917)으로 나중 정정 종가 24개만 바꿔 다시 돌린 1일 방향
 *   T14 진단: 실제 1일 뽑기 횟수로 가중한 직접 셈 = 발행 확률(156개) · 156개 비교에서 최대 |Z| 가 3·4 를 넘을 확률(뽑기만 다시 해 본 모의)
 *   민감도 움직임: 블록마다 고른 모형이 바뀐 종목 수 · 판정 숫자 변화
 *   검정력: 기준일 부트스트랩 평균 차의 흩어짐(표준편차)으로 본 「가려낼 수 있는 차이」
 *   같은 난수가 매일 같은 동률 근처 판정을 되풀이하는 종목
 */
import fs from 'node:fs';
import {pricePanel, examplesFor, fitFactorModel, validateFactorRecords, rng, mean as libMean} from '../../../../lib/factor36.mjs';
import {externalDesign} from '../../../../lib/factor36-input.mjs';
import {rollingInput} from '../../../../lib/rolling-forecast.mjs';
import {simulateJointFactor36} from '../../../../lib/factor36-simulation.mjs';
import {readJSON, writeJSON, liveCells, pickDirection, mean, kstNow, gitHead, gitShow, sha256, r2} from './common.mjs';
import {rebuild, publishedDayOne, PUBS} from './pubmodel.mjs';
import {dayOneState, shockTable, exactDayOne} from './simulate-variant.mjs';

const arg = k => { const i = process.argv.indexOf(k); return i < 0 ? null : process.argv[i + 1]; };
const log = (...a) => console.error(new Date().toISOString().slice(11, 19), ...a);
const LABEL = '계획 밖 · 결과를 본 뒤';
const N = 20000, SEED = 20260917, ROLL = '2026-09-28-rolling20-13cd892134e517b4', ATL = '2026-09-29-atlas11-128de9174cfdfa1f';
const part4 = readJSON('reports/atlas11/overhaul/part4.json'), part5 = readJSON('reports/atlas11/overhaul/part5.json');
const live = liveCells();

// ---------- ④ 발행 방식으로 다시 돌림(정정 종가 24개만 바꿈) ----------
const R = rebuild(ROLL), pub4 = part4.publications.find(p => p.forecastId === ROLL), changes = pub4.latestVintageVsUsed.changedCloses;
const LATEST = {commit: '903ba64', sha256: pub4.latestVintageVsUsed.headInputSha256};
const latestInput = JSON.parse(gitShow(LATEST.commit, 'public/data/input.json'));
if (sha256(gitShow(LATEST.commit, 'public/data/input.json')) !== LATEST.sha256) throw Error('LATEST_INPUT_SHA');
const corrected = structuredClone(R.source);
let swapped = 0;
for (const c of changes) { const a = corrected.assets.find(x => x.code === c.code), row = a.prices.find(p => p.date === c.date), want = latestInput.assets.find(x => x.code === c.code).prices.find(p => p.date === c.date).close; if (row.close !== c.used || want !== c.latest) throw Error('SWAP_MISMATCH ' + c.code + ' ' + c.date); row.close = want; swapped++; }
const {input: cin, futureDates} = rollingInput({input: corrected}, {calendar: R.calendar, issuedAt: R.issuedAt});
const records = validateFactorRecords(R.recordsPayload, {codes: cin.assets.map(a => a.code), cutoff: R.issuedAt});
const cpanel = pricePanel(cin), cmodels = [], cexternal = [];
for (let i = 0; i < cin.assets.length; i++) { const d = externalDesign(records, cin.assets[i], cpanel, examplesFor(cpanel, i), R.issuedAt); cmodels.push(fitFactorModel(d.rows, {featureFactors: d.featureFactors})); cexternal.push(d); }
const sameModels = cmodels.every((m, i) => m.selected.id === R.models[i].selected.id && m.regression.intercept === R.models[i].regression.intercept && m.regression.beta.every((b, j) => b === R.models[i].regression.beta[j]) && m.volatility.last === R.models[i].volatility.last && m.shocks.every((z, j) => z === R.models[i].shocks[j]));
log('④ corrected run (operating simulateJointFactor36)');
const csim = simulateJointFactor36(cmodels, cpanel, cin.assets, futureDates, {paths: N, seed: SEED, external: cexternal});
const cst = dayOneState(cmodels, cpanel, cin.assets, cexternal), ust = dayOneState(R.models, R.panel, R.input.assets, R.external), ztab = shockTable(R.models, 'mean').table;
const flips = [];
cin.assets.forEach((a, i) => {
  const pubD = publishedDayOne(R.pub, i), cD = csim.rows[i][0].wave.daily, cell = live.find(c => c.forecastId === ROLL && c.code === a.code);
  const exU = exactDayOne(ust.mu[i], ust.h[i], ztab[i]).probabilities, exC = exactDayOne(cst.mu[i], cst.h[i], ztab[i]).probabilities;
  if (pubD.selected !== cD.selected || pickDirection(exU) !== pickDirection(exC)) flips.push({code: a.code, name: cell.name, actual: cell.act, published: {selected: pubD.selected, up: pubD.probabilities.up, down: pubD.probabilities.down}, correctedPublishedMethod: {selected: cD.selected, up: cD.probabilities.up, down: cD.probabilities.down}, exactUsed: {selected: pickDirection(exU), up: exU.up, down: exU.down}, exactCorrected: {selected: pickDirection(exC), up: exC.up, down: exC.down, tie: exC.up === exC.down}, publishedWasRight: pubD.selected === cell.act, correctedRight: cD.selected === cell.act});
});
const pubFlips = flips.filter(f => f.published.selected !== f.correctedPublishedMethod.selected);
const wrong42 = live.filter(c => !c.dirOk);
const impactPublished = {label: LABEL, method: '운영 lib/factor36-simulation.mjs simulateJointFactor36 · 경로 20,000 · 난수 20260917 · 목표일 20개 · 입력 input.json@30dcfb2 에서 정정된 종가 24개(9/21~9/23 · 12종목)의 close 만 input.json@903ba64 값으로 바꿈', swappedCloses: swapped, modelsIdenticalAfterSwap: sameModels,
  flipsPublishedMethod: pubFlips.length, flipsExact: flips.filter(f => f.exactUsed.selected !== f.exactCorrected.selected).length, flips,
  wrongCellsChanged: pubFlips.filter(f => wrong42.some(c => c.forecastId === ROLL && c.code === f.code)).length, wrongCellsBecomeRight: pubFlips.filter(f => !f.publishedWasRight && f.correctedRight).length, rightCellsBecomeWrong: pubFlips.filter(f => f.publishedWasRight && !f.correctedRight).length,
  target0930: '0 — 9/29 atlas11 발행본의 입력에는 다른 값이 없다(정정 종가 0개)', report: '규칙상 원인이다 = 값 다름 · 발행 방식으로 1칸(035250) 바뀜, 정확 셈으로는 동률 · 오답 42칸 중 바뀌는 칸 ≤ 1 · 9/30 목표 0'};
log('④ flips', pubFlips.map(f => f.code).join(','));

// ---------- T14 진단: 실제 뽑기 횟수로 가중한 직접 셈 ----------
const t14Recon = {}, fam = {};
const pickCounts = (K, H, seed) => { const r = rng(seed), cnt = new Int32Array(K); for (let b = 0; b < N; b++) for (let d = 0; d < H; d++) { const u = r(); if (!d) cnt[Math.floor(u * K)]++; } return cnt; };
for (const id of [ROLL, ATL]) {
  const B = id === ROLL ? R : rebuild(id), st = dayOneState(B.models, B.panel, B.input.assets, B.external), tab = shockTable(B.models, 'mean').table, K = tab[0].length;
  const cnt = pickCounts(K, B.futureDates.length, SEED);
  let same = 0; const ind = [];
  B.input.assets.forEach((a, i) => {
    const dirs = tab[i].map(z => { const x = Math.expm1(st.mu[i] + Math.sqrt(st.h[i]) * z); return x > 0.001 ? 'up' : x < -0.001 ? 'down' : 'flat'; });
    ind.push(dirs);
    const c = {up: 0, flat: 0, down: 0}; dirs.forEach((d, k) => c[d] += cnt[k]);
    const p = publishedDayOne(B.pub, i).probabilities;
    for (const k of ['up', 'flat', 'down']) if (c[k] / N === p[k]) same++;
  });
  t14Recon[id] = {label: LABEL, comparisons: B.input.assets.length * 3, reproducedExactly: same, picksFrom: 'rng(20260917) 경로마다 20개 중 첫째 → 공유 날짜 504개 중 하나', pickCountsSha256: sha256(Buffer.from(cnt.buffer))};
  // 같은 직접 셈 표에서 뽑기만 다시 해 본 모의(2,000번 · 다른 난수 줄): 156개 비교의 최대 |Z| 가 3·4 를 넘는 비율
  const exact = ind.map(dirs => { const c = {up: 0, flat: 0, down: 0}; dirs.forEach(d => c[d]++); return {up: c.up / K, flat: c.flat / K, down: c.down / K}; });
  let over3 = 0, over4 = 0; const REPS = 2000;
  for (let rep = 0; rep < REPS; rep++) {
    const r = rng(1000003 + rep), c2 = new Int32Array(K); for (let b = 0; b < N; b++) c2[Math.floor(r() * K)]++;
    let mx = 0;
    for (let i = 0; i < ind.length; i++) { const c = {up: 0, flat: 0, down: 0}; ind[i].forEach((d, k) => c[d] += c2[k]); for (const k of ['up', 'flat', 'down']) { const p = exact[i][k], s = Math.sqrt(p * (1 - p) / N); if (s > 0) mx = Math.max(mx, Math.abs(c[k] / N - p) / s); } }
    if (mx > 3) over3++; if (mx > 4) over4++;
  }
  fam[id] = {label: LABEL, replications: REPS, rngSeeds: '1000003 + 반복 번호(lib rng)', shareMaxAbsZOver3: over3 / REPS, shareMaxAbsZOver4: over4 / REPS};
  log('T14 recon', id, same, fam[id].shareMaxAbsZOver3, fam[id].shareMaxAbsZOver4);
}
const samePicks = t14Recon[ROLL].pickCountsSha256 === t14Recon[ATL].pickCountsSha256;

// ---------- 민감도 움직임(학습을 기준일 전까지만) ----------
const A = readJSON('reports/atlas11/overhaul/part1-retro-A-cells.json'), As = JSON.parse(fs.readFileSync(arg('--strict-A'), 'utf8'));
const changedPerBlock = A.blocks.map((b, j) => b.selectedIds.filter((s, i) => s !== As.blocks[j].selectedIds[i]).length);
const ss = part4.T13.strictSensitivity, p1 = readJSON('reports/atlas11/overhaul/part1.json'), p2 = readJSON('reports/atlas11/overhaul/part2.json'), p3 = readJSON('reports/atlas11/overhaul/part3.json');
const movement = {label: LABEL, selectedModelChangedStocksPerBlock: changedPerBlock, of: 52,
  dir1selModelPct: [p1.retro.oneDay.dir1selPct.model, ss.dir1selPct.A], modelMinusAlwaysDownPp: [r2(p1.retro.oneDay.dir1selPct.model - p1.retro.oneDay.dir1selPct.alwaysDown), r2(ss.dir1selPct.A - ss.dir1selPct.alwaysDown)], pModelBetterThanAlwaysDown: [p1.retro.oneDay.bootstrap.alwaysDown.pRefBetter, ss.bootstrap['①'].alwaysDown.pModelBetter],
  pWeightedBetter: [p2.bootstrap.pCandBetter, ss.bootstrap['②'].pWeightedBetter], pCBetter: [p3.bootstrap.pCandBetter, ss.bootstrap['③'].pCBetter],
  note: '학습 행 하루(블록 첫날)만 빼도 모델 dir1sel 이 0.91%p 움직이고 P 가 크게 바뀐다 · 1%p 안쪽 차이는 이 흔들림 안이다 · ②는 무게를 시험한 것이 아니라 두 무리(다른 종목들)를 견준 것이다'};

// ---------- 검정력: 부트스트랩 평균 차의 표준편차 ----------
function bootSD(cand, ref) { const diff = cand.map((c, k) => c - ref[k]), nb = 6; let s = 20260929 >>> 0; const rnd = () => { s = (Math.imul(1664525, s) + 1013904223) >>> 0; return s / 4294967296; }; const ms = []; for (let r = 0; r < 2000; r++) { const pk = []; for (let b = 0; b < nb; b++) { const st = Math.floor(rnd() * nb) * 20; for (let j = st; j < st + 20; j++) pk.push(diff[j]); } ms.push(libMean(pk)); } const m = libMean(ms); return Math.sqrt(libMean(ms.map(x => (x - m) ** 2))); }
const po1 = p1.retro.perOrigin, sds = {
  '① 모델 대 늘 상승': bootSD(po1.alwaysUp1, po1.dir1sel), '① 모델 대 늘 하락': bootSD(po1.alwaysDown1, po1.dir1sel), '① 모델 대 종목 어제': bootSD(po1.ownPrev1, po1.dir1sel), '① 모델 대 시장 어제': bootSD(po1.marketPrev1, po1.dir1sel),
  '② 무게 있음 대 0': bootSD(p2.perOrigin.weightedDir1sel, p2.perOrigin.zeroDir1sel), '③ C 대 A': bootSD(p3.perOrigin.dir1selC, p3.perOrigin.dir1selA)};
const power = {label: LABEL, method: '기준일 블록 부트스트랩(20일 블록·2,000번·난수 20260929)으로 뽑은 평균 차의 표준편차 sd · P ≥ 0.80 에 대략 필요한 평균 차 ≈ 0.84·sd · 90% 구간 반폭 ≈ 1.645·sd', sdPp: Object.fromEntries(Object.entries(sds).map(([k, v]) => [k, r2(v * 100)])), needForP80Pp: Object.fromEntries(Object.entries(sds).map(([k, v]) => [k, r2(0.84 * v * 100)])), halfWidth90Pp: Object.fromEntries(Object.entries(sds).map(([k, v]) => [k, r2(1.645 * v * 100)]))};

// ---------- 같은 난수 → 매일 같은 동률 근처 판정 ----------
const near = [];
for (const code of ['029780', '002380', '034220']) {
  const rows = [ROLL, ATL].map(id => { const P = id === ROLL ? R : null; const pub = id === ROLL ? R.pub : JSON.parse(gitShow('940698c', 'public/data/atlas11/forecast.json')); const i = pub.assets.findIndex(a => a.code === code), d = publishedDayOne(pub, i), pr = d.probabilities, s = ['up', 'flat', 'down'].map(k => pr[k]).sort((a, b) => b - a), cell = live.find(c => c.forecastId === id && c.code === code); return {forecastId: id, selected: d.selected, up: pr.up, down: pr.down, gapTop2Pp: r2((s[0] - s[1]) * 100), actual: cell?.act ?? null, right: cell ? cell.dirOk : null}; });
  near.push({code, name: live.find(c => c.code === code)?.name ?? null, days: rows});
}

part4.posthoc = {label: LABEL, impactPublishedMethod: impactPublished, strictMovement: movement, power, nearTieRepeats: {label: LABEL, note: '난수 20260917 이 매일 같은 뽑기 순서를 써서, 상승·하락 확률이 거의 같은 종목은 날마다 같은 쪽으로 기운다(무게 0 종목은 날마다 μ = 0 · 잔차 표도 같음)', stocks: near}, builtAt: kstNow(), builtOnCommit: gitHead()};
part4.decision.reportText = impactPublished.report;
part4.decision.impactCorrection = '앞서 적은 「1일 방향 바뀐 칸 0/52」는 정확 셈(동률이면 상승)에서 나온 값이다. 발행 방식(모의 계산)으로는 035250 한 칸이 상승→하락으로 바뀐다(정확 셈으로는 상승·하락이 같은 동률).';
part5.posthoc = {label: LABEL, T14ExactReconstruction: t14Recon, samePicksInBothPublications: samePicks, familyWiseMaxZ: fam,
  note: '두 발행본은 같은 난수·같은 공유 날짜 수(504)라 1일 뽑기 횟수가 똑같다 → 032830 의 차이는 한 사건이다. 실제 뽑기 횟수로 가중한 직접 셈은 156개 확률을 모두 그대로 낸다 → 계산은 맞고, 차이는 뽑기 횟수의 우연이다. T14 는 글자대로 실패로 둔다.',
  tiltNotMisses: '⑤ 는 하락 쏠림(예측 하락 86 대 실제 하락 69)을 설명한다. 오답을 설명하지는 않는다 — A·B 는 후향 정답률을 올리지 못했다(A 49.86% 대 50.53% · P 0.29 · B 48.01% · 원래가 나음 P 0.88 · 5/6 블록). 결정표대로 W11 후보로 보내지 않는다.',
  exactVsSimulatedZero32: Object.fromEntries(Object.entries(part5.publications).map(([id, P]) => [id, Object.fromEntries(Object.entries(P.variants).map(([k, v]) => [k, {simulatedGapPp: r2(v.zero32.meanGapPp), exactGapPp: r2(v.zero32.exactMeanGapPp), simulatedDown: v.zero32.downChoices, exactDown: v.zero32.exactDownChoices}]))])),
  builtAt: kstNow(), builtOnCommit: gitHead()};
part5.decision.reportText = '규칙상 모른다(T14 글자대로 51/52 · eco/03 판단 기다림) · ⑤ 는 하락 쏠림의 원인이지 오답의 원인이 아니다 · A·B 는 후향 이득 없음 → W11 후보 아님';
const s4 = writeJSON('reports/atlas11/overhaul/part4.json', part4), s5 = writeJSON('reports/atlas11/overhaul/part5.json', part5);
console.log(JSON.stringify({s4, s5, impact: {flipsPublished: impactPublished.flipsPublishedMethod, flipsExact: impactPublished.flipsExact, wrongChanged: impactPublished.wrongCellsChanged, becomeRight: impactPublished.wrongCellsBecomeRight, flips: flips.map(f => [f.code, f.published, f.correctedPublishedMethod, f.exactCorrected])}, t14Recon, samePicks, fam, movement, power, near}, null, 1));
