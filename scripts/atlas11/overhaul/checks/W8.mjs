/**
 * W8 · 부품 ②③④ 검사 — part2·part3·part4 의 핵심 숫자를 결과 파일·저장소 기록에서 다시 센다(갈래 나 코드를 불러오지 않음)
 *   node scripts/atlas11/overhaul/check.mjs --step W8
 */
import fs from 'node:fs';
import {execFileSync} from 'node:child_process';

const mean = a => a.reduce((s, x) => s + x, 0) / a.length;
const dir = (r, d = 0.001) => r > d ? 'up' : r < -d ? 'down' : 'flat';
function boot(cand, ref) {
  const diff = cand.map((c, k) => c - ref[k]), nb = Math.ceil(diff.length / 20); let s = 20260929 >>> 0, up = 0, down = 0;
  const rnd = () => { s = (Math.imul(1664525, s) + 1013904223) >>> 0; return s / 4294967296; };
  for (let r = 0; r < 2000; r++) { const picked = []; for (let b = 0; b < nb; b++) { const st = Math.floor(rnd() * nb) * 20; for (let j = st; j < Math.min(st + 20, diff.length); j++) picked.push(diff[j]); } const m = mean(picked); if (m > 0) up++; else if (m < 0) down++; }
  let bc = 0, br = 0; for (let b = 0; b < 6; b++) { const c = mean(cand.slice(b * 20, b * 20 + 20)), r = mean(ref.slice(b * 20, b * 20 + 20)); if (c > r) bc++; else if (r > c) br++; }
  const candBetter = up / 2000 >= 0.8 && bc >= 4, refBetter = down / 2000 >= 0.8 && br >= 4;
  return {pCand: up / 2000, pRef: down / 2000, bc, br, verdict: candBetter ? '원인이다' : refBetter ? '아니다' : '모른다'};
}
function dir1selBy(run, filter = () => true) {
  const c = Object.fromEntries(run.columns.map((n, j) => [n, j])), by = Array.from({length: run.origins.length}, () => []);
  for (const r of run.cells) if (filter(r, c)) by[r[c.k]].push(r);
  return by.map(rows => mean(rows.map(r => r[c.sel1] === dir(r[c.actual1] / r[c.anchor] - 1) ? 1 : 0)));
}

export default async function W8({report, sha, rel, ROOT}) {
  const read = f => JSON.parse(fs.readFileSync(rel(f), 'utf8'));
  const A = read('reports/atlas11/overhaul/part1-retro-A-cells.json');
  // ② 무게 0 · 있음
  const p2 = read('reports/atlas11/overhaul/part2.json');
  const w = dir1selBy(A, (r, c) => r[c.zero] === 0), z = dir1selBy(A, (r, c) => r[c.zero] === 1);
  const zeroCounts = A.blocks.map(b => b.zero.filter(Boolean).length);
  const same2 = w.every((v, k) => v === p2.perOrigin.weightedDir1sel[k]) && z.every((v, k) => v === p2.perOrigin.zeroDir1sel[k]) && zeroCounts.every((v, b) => v === p2.zeroWeightStocksPerBlock[b].zero);
  const b2 = boot(w, z);
  report('W8:②', same2 && b2.verdict === p2.decision.verdict && b2.pCand === p2.bootstrap.pCandBetter && b2.bc === p2.bootstrap.blocksCandBetter, {weightedPct: Math.round(mean(w) * 10000) / 100, zeroPct: Math.round(mean(z) * 10000) / 100, p: [b2.pCand, b2.pRef], blocks: [b2.bc, b2.br], verdict: b2.verdict, zeroStocksPerBlock: zeroCounts});
  // ③ 공통 식
  const p3 = read('reports/atlas11/overhaul/part3.json'), cf = 'reports/atlas11/overhaul/part3-retro-pooled-cells.json', cbuf = fs.readFileSync(rel(cf)), C = JSON.parse(cbuf.toString('utf8'));
  const sameProto = C.input.sha256 === A.input.sha256 && C.protocol.paths === 512 && C.protocol.seed === 20260917 && JSON.stringify(C.protocol) === JSON.stringify(A.protocol) && C.origins.every((o, k) => o.date === A.origins[k].date);
  const a1 = dir1selBy(A), c1 = dir1selBy(C), b3 = boot(c1, a1);
  report('W8:③', sha(cbuf) === p3.files[cf] && sameProto && a1.every((v, k) => v === p3.perOrigin.dir1selA[k]) && c1.every((v, k) => v === p3.perOrigin.dir1selC[k]) && b3.verdict === p3.decision.verdict && b3.pCand === p3.bootstrap.pCandBetter, {APct: Math.round(mean(a1) * 10000) / 100, CPct: Math.round(mean(c1) * 10000) / 100, p: [b3.pCand, b3.pRef], blocks: [b3.bc, b3.br], verdict: b3.verdict, sameProtocol: sameProto, chosenPenalties: p3.blocks.map(b => b.chosenPenalty)});
  // ④ 입력값: 자료판 차이를 저장소 기록에서 따로 센다(30dcfb2 대 HEAD 입력의 같은 날짜 종가)
  const p4 = read('reports/atlas11/overhaul/part4.json');
  const show = (c, f) => JSON.parse(execFileSync('git', ['show', `${c}:${f}`], {cwd: ROOT, maxBuffer: 1 << 29}));
  const counts = {};
  for (const pub of p4.publications) {
    const used = show(pub.input.commit, 'public/data/input.json'), head = show('HEAD', 'public/data/input.json'); let n = 0;
    for (const a of used.assets) { const hm = new Map(head.assets.find(x => x.code === a.code).prices.map(q => [q.date, q.close])); for (const q of a.prices) if (q.date >= pub.latestVintageVsUsed.windowFrom && q.date <= pub.origin && hm.get(q.date) !== q.close) n++; }
    counts[pub.forecastId] = n;
  }
  const same4 = p4.publications.every(pub => counts[pub.forecastId] === pub.latestVintageVsUsed.changedClosesInWindow && pub.inputDigestMatchesPublication && pub.modelParamsIdenticalToPublication && pub.usedValuesMatchPublication.dayOneP50 === 52 && pub.usedValuesMatchPublication.contributionsF35F11 === 52);
  const maxAll = Math.max(...p4.publications.flatMap(pub => [pub.ownRecomputeVsUsed.maxAbsFeature, pub.ownRecomputeVsUsed.maxRelVariance, pub.ownRecomputeVsUsed.maxAbsContributionVsPublished, pub.latestVintageVsUsed.maxAbsFeature, pub.latestVintageVsUsed.maxRelVariance, pub.latestVintageVsUsed.maxAbsContributionVsPublished]));
  const v4 = maxAll > 1e-9 ? '원인이다' : '아니다';
  report('W8:④', same4 && maxAll === p4.maxDifferenceAll && v4 === p4.decision.verdict, {changedClosesInWindow: counts, verdict: v4, maxAll, ownMaxFeature: p4.publications.map(pub => pub.ownRecomputeVsUsed.maxAbsFeature), flips: p4.publications.map(pub => pub.impactOnDayOneDirection.flipCount)});
  // v1 features 후보 기각 사유가 state.json 원문 그대로인가
  const st = read('reports/atlas11/evolve/state.json');
  const quoted = p4.v1FeatureCandidates.candidates.length === 3 && p4.v1FeatureCandidates.candidates.every(c => st.candidates[c.candidateId]?.history.find(h => h.type === 'rejected')?.reason === c.rejectedReason);
  report('W8:④기각사유', quoted, {candidates: p4.v1FeatureCandidates.candidates.map(c => c.candidateId)});
  // T13: 결과 파일의 기준일별 학습 끝으로 다시 셈 — 글자 그대로(<)와 미래 자료 없음을 따로
  const t13 = run => ({strict: run.leak.filter(l => l.maxTrainingEnd < l.origin).length, equal: run.leak.filter(l => l.maxTrainingEnd === l.origin).length, after: run.leak.filter(l => l.maxTrainingEnd > l.origin).length, noFuture: run.leak.filter(l => l.maxTrainingEnd <= l.origin && l.maxShockDate <= l.origin && l.firstTarget > l.origin).length});
  const tA = t13(A), tC = t13(C);
  report('T13', tA.equal + tA.after === 0 && tC.equal + tC.after === 0, {literal: '학습 끝 < 기준일', A: tA, C: tC, noFutureDataAll: tA.noFuture === 120 && tC.noFuture === 120, note: '블록 첫 기준일 6개는 학습 끝 = 기준일(그날 종가까지의 수익률 · 미래 자료 아님) — 글자 그대로는 실패'});
  // 계획 밖 민감도: 학습을 기준일 「전」까지만 한 판 — T13 글자 그대로 통과 · ①②③ 판정이 v1 판과 같은가(기준일별 값으로 부트스트랩 다시 셈)
  const ss = p4.T13.strictSensitivity;
  if (ss) {
    const po = ss.perOrigin, b1 = Object.fromEntries([['alwaysUp', 'alwaysUp1'], ['alwaysDown', 'alwaysDown1'], ['ownPrevDay', 'ownPrev1'], ['marketPrevDay', 'marketPrev1']].map(([k, key]) => [k, boot(po[key], po.dir1selA)]));
    const v1 = Object.values(b1).some(b => b.verdict === '원인이다') ? '원인이다' : Object.values(b1).every(b => b.verdict === '아니다') ? '아니다' : '모른다';
    const v2 = boot(po.weighted, po.zero).verdict, v3 = boot(po.dir1selC, po.dir1selA).verdict, p1 = read('reports/atlas11/overhaul/part1.json');
    const ok = ss.T13.A.equalToOrigin + ss.T13.A.afterOrigin + ss.T13.C.equalToOrigin + ss.T13.C.afterOrigin === 0 && v1 === ss.verdicts['①'] && v2 === ss.verdicts['②'] && v3 === ss.verdicts['③'] && v1 === p1.decision.verdict && v2 === p2.decision.verdict && v3 === p3.decision.verdict;
    report('T13:민감도', ok, {label: '계획 밖 · 학습 r.date < 기준일', strictBefore: [ss.T13.A.strictTrainingEndBeforeOrigin, ss.T13.C.strictTrainingEndBeforeOrigin], verdicts: {'①': v1, '②': v2, '③': v3}, sameAsV1: ok, dir1selPct: ss.dir1selPct});
  }
  // 계획 밖 · 결과를 본 뒤: ④ 발행 방식 영향(정정 종가 24개만 바꿔 운영 모의 계산으로 다시 돌림)
  const ip = p4.posthoc?.impactPublishedMethod;
  if (ip) {
    const f = ip.flips.find(x => x.code === '035250');
    const ok = ip.swappedCloses === 24 && ip.modelsIdenticalAfterSwap === true && ip.flipsPublishedMethod === 1 && ip.flipsExact === 0 && f && f.published.selected === 'up' && f.correctedPublishedMethod.selected === 'down' && f.exactCorrected.tie === true && f.actual === 'down' && ip.wrongCellsChanged <= 1 && p4.decision.reportText === '규칙상 원인이다 = 값 다름 · 발행 방식으로 1칸(035250) 바뀜, 정확 셈으로는 동률 · 오답 42칸 중 바뀌는 칸 ≤ 1 · 9/30 목표 0';
    report('W8:④발행방식영향', ok, {label: ip.label, flipsPublished: ip.flipsPublishedMethod, flipsExact: ip.flipsExact, cell: f && {code: f.code, published: f.published, corrected: f.correctedPublishedMethod, exactTie: f.exactCorrected.up}});
  }
  // 결함 심기(10절): 무게 0 표시 하나를 바꾼 사본 → ② 기준일 값이 달라져 막혀야 한다
  const bad = structuredClone(A), c = Object.fromEntries(bad.columns.map((n, j) => [n, j])); bad.cells[0][c.zero] = 1 - bad.cells[0][c.zero];
  const w2 = dir1selBy(bad, (r, cc) => r[cc.zero] === 0);
  report('inject:W8', !w2.every((v, k) => v === p2.perOrigin.weightedDir1sel[k]), {planted: '후향 칸 하나의 무게 0 표시 뒤집기(사본)'});
}
