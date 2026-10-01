/**
 * W9 · 부품 ⑤ 검사 — part5.json 의 핵심 숫자를 결과 파일·발행본·기록 장부에서 다시 센다(갈래 나 코드를 불러오지 않음)
 *   node scripts/atlas11/overhaul/check.mjs --step W9
 */
import fs from 'node:fs';
import {execFileSync} from 'node:child_process';

const mean = a => a.reduce((s, x) => s + x, 0) / a.length;
const top = p => ['flat', 'up', 'down'].reduce((b, c) => b === null || p[c] > p[b] ? c : b, null);
const PUBFILE = {'2026-09-28-rolling20-13cd892134e517b4': [null, 'public/data/rolling-forecast.json'], '2026-09-29-atlas11-128de9174cfdfa1f': ['940698c', 'public/data/atlas11/forecast.json']};

export function tableFromCounts(counts, idx, N = 20000) {
  const P = idx.map(i => ({up: counts[i].up / N, flat: counts[i].flat / N, down: counts[i].down / N}));
  const ses = P.map(p => Math.sqrt((p.up + p.down - (p.down - p.up) ** 2) / N));
  return {meanGapPp: mean(P.map(p => (p.down - p.up) * 100)), seConservativePp: mean(ses) * 100, downChoices: P.filter(p => top(p) === 'down').length};
}

export default async function W9({report, rel, ROOT}) {
  const part = JSON.parse(fs.readFileSync(rel('reports/atlas11/overhaul/part5.json'), 'utf8'));
  const show = (c, f) => JSON.parse(c ? execFileSync('git', ['show', `${c}:${f}`], {cwd: ROOT, maxBuffer: 1 << 29}) : fs.readFileSync(rel(f), 'utf8'));
  for (const [id, P] of Object.entries(part.publications)) {
    const pub = show(...PUBFILE[id]), idx = P.zeroFlags.map((z, i) => z ? i : -1).filter(i => i >= 0);
    // 발행본 1일 확률(파일에서 직접)
    const pubP = pub.assets.map(a => { const r = a.rows.find(x => !x.anchor && x.date === pub.futureDates[0]); return (r.direction?.daily ?? r.wave.daily).probabilities; });
    const codesSame = pub.assets.every((a, i) => a.code === P.codes[i]);
    const zeroByModel = pub.assets.map(a => a.model.selected.lambda === 'zero');
    // 사본(평균 중심) 칸 수 = 발행본 확률 × 20,000
    const copy = P.variants.mean.perStockCounts.every((c, i) => ['up', 'flat', 'down'].every(k => c[k] / 20000 === pubP[i][k]));
    report(`W9:${P.kind}:사본=발행`, codesSame && copy && zeroByModel.every((z, i) => z === P.zeroFlags[i]) && idx.length === 32, {zeroWeight: idx.length, copyEqualsPublished: copy});
    // T14: 직접 센 값 대 발행본(파일에서 읽은 값) 공차
    const t14 = P.perStockT14.map((r, i) => Math.max(...['up', 'flat', 'down'].map(k => Math.abs(pubP[i][k] - r.exact[k]) - 3 * Math.sqrt(r.exact[k] * (1 - r.exact[k]) / 20000))));
    const within = t14.filter(x => x <= 1e-15).length;
    report(`T14:${P.kind}`, within === 52 && within === P.T14.within, {within, of: 52, worstRatio: P.T14.worstRatioToTolerance});
    // T12: 재현 숫자(결과 파일에 적힌 다시 돌린 차이)
    report(`T12:${P.kind}`, P.T12.maxAbsDiffZero32 === 0 && P.T12.maxAbsDiffAll52 === 0 && P.T12.sameZeroSetAsLedger && P.T12.onlyZero32Run.maxAbsDiff === 0, {maxAbsDiffZero32: P.T12.maxAbsDiffZero32, maxAbsDiffAll52: P.T12.maxAbsDiffAll52, onlyZero32Run: P.T12.onlyZero32Run.maxAbsDiff});
    // 변형 표: 칸 수에서 다시 셈
    const tab = Object.fromEntries(['mean', 'median', 'symmetric'].map(c => [c, tableFromCounts(P.variants[c].perStockCounts, idx)]));
    const sameTab = ['mean', 'median', 'symmetric'].every(c => Math.abs(tab[c].meanGapPp - P.variants[c].zero32.meanGapPp) < 1e-9 && Math.abs(tab[c].seConservativePp - P.variants[c].zero32.seConservativePp) < 1e-9 && tab[c].downChoices === P.variants[c].zero32.downChoices);
    const beyond = c => Math.abs(tab[c].meanGapPp - tab.mean.meanGapPp) > 3 * Math.max(tab.mean.seConservativePp, tab[c].seConservativePp);
    report(`W9:${P.kind}:변형표`, sameTab && beyond('median') === P.change.A_median.beyond3SE && beyond('symmetric') === P.change.B_symmetric.beyond3SE, {original: tab.mean, A_median: tab.median, B_symmetric: tab.symmetric});
  }
  // 판정 다시 셈(1차 = 9/29 atlas11)
  const Pm = part.publications[part.decision.primary];
  const v = !(Pm.T12.pass && Pm.T14.pass) ? '모른다' : (Pm.change.A_median.beyond3SE || Pm.change.B_symmetric.beyond3SE) ? '원인이다' : '아니다';
  report('W9:판정', v === part.decision.verdict, {verdict: v, change: {A: Pm.change.A_median.changePp, B: Pm.change.B_symmetric.changePp, threeSE: [Pm.change.A_median.threeSEPp, Pm.change.B_symmetric.threeSEPp]}});
  // 실전 무게 0 칸 수: 기록 장부(원인 분석 첫 줄 세 항 0.00%) 대 결과 파일
  const ex = JSON.parse(fs.readFileSync(rel('reports/atlas11/overhaul/expected.json'), 'utf8'));
  const zc = Object.values(part.publications).reduce((s, P) => s + P.liveImpact.zeroCells, 0);
  const zDown = Object.values(part.publications).reduce((s, P) => s + P.variants.mean.perStockSelected.filter((d, i) => P.zeroFlags[i] && d === 'down').length, 0);
  report('W9:정답표대조', zc === ex['무게0칸']['합'] && zDown === ex['무게0하락'], {zeroCells: zc, zeroDown: zDown, expected: [ex['무게0칸']['합'], ex['무게0하락']]});
  // 보조(후향 · 판정에 안 씀): 시험 사본이 평균 중심일 때 운영 A 와 같은가 · 변형 A·B 대 원래 부트스트랩 다시 셈
  const ra = part.retroAux;
  if (ra) {
    const boot = (cand, ref) => { const diff = cand.map((c, k) => c - ref[k]); let s = 20260929 >>> 0, up = 0, down = 0; const rnd = () => { s = (Math.imul(1664525, s) + 1013904223) >>> 0; return s / 4294967296; }; for (let r = 0; r < 2000; r++) { const pk = []; for (let b = 0; b < 6; b++) { const st = Math.floor(rnd() * 6) * 20; for (let j = st; j < st + 20; j++) pk.push(diff[j]); } const m = mean(pk); if (m > 0) up++; else if (m < 0) down++; } let bc = 0, br = 0; for (let b = 0; b < 6; b++) { const c = mean(cand.slice(b * 20, b * 20 + 20)), r = mean(ref.slice(b * 20, b * 20 + 20)); if (c > r) bc++; else if (r > c) br++; } return {pCand: up / 2000, pRef: down / 2000, bc, br}; };
    const A1 = JSON.parse(fs.readFileSync(rel('reports/atlas11/overhaul/part1.json'), 'utf8')).retro.perOrigin.dir1sel;
    const po = ra.perOrigin, bm = boot(po.dir1selMedian, po.dir1selOriginal), bs = boot(po.dir1selSymmetric, po.dir1selOriginal);
    const ok = ra.copyCheckMeanEqualsA?.sameSummaryAsA === true && ra.copyCheckMeanEqualsA?.sameCells === true && po.dir1selOriginal.every((v, k) => v === A1[k]) && bm.pCand === ra.bootstrap.A_median_vs_original.pCandBetter && bm.pRef === ra.bootstrap.A_median_vs_original.pRefBetter && bs.pCand === ra.bootstrap.B_symmetric_vs_original.pCandBetter && bs.pRef === ra.bootstrap.B_symmetric_vs_original.pRefBetter && bm.bc === ra.bootstrap.A_median_vs_original.blocksCandBetter && bs.br === ra.bootstrap.B_symmetric_vs_original.blocksRefBetter;
    report('W9:보조후향', ok, {label: '후향 · 판정에 안 씀', dir1selPct: {original: ra.original.dir1selPct, A_median: ra.A_median.dir1selPct, B_symmetric: ra.B_symmetric.dir1selPct}, A_median: {pBetter: bm.pCand, pWorse: bm.pRef, blocks: [bm.bc, bm.br]}, B_symmetric: {pBetter: bs.pCand, pWorse: bs.pRef, blocks: [bs.bc, bs.br]}});
  }
  // 계획 밖 · 결과를 본 뒤: T14 정확 재현(실제 뽑기 횟수로 가중한 직접 셈 = 발행 156/156) · 두 발행본 같은 뽑기
  const ph = part.posthoc;
  if (ph) {
    const rec = Object.values(ph.T14ExactReconstruction), fw = Object.values(ph.familyWiseMaxZ);
    report('W9:T14정확재현', rec.length === 2 && rec.every(r => r.reproducedExactly === 156 && r.comparisons === 156) && ph.samePicksInBothPublications === true && fw.every(f => f.shareMaxAbsZOver3 > 0 && f.shareMaxAbsZOver3 < 1 && f.shareMaxAbsZOver4 < f.shareMaxAbsZOver3), {label: ph.label, reproduced: rec.map(r => r.reproducedExactly), samePicks: ph.samePicksInBothPublications, over3: fw.map(f => f.shareMaxAbsZOver3), over4: fw.map(f => f.shareMaxAbsZOver4)});
  }
  // 결함 심기(10절): 칸 수 하나를 바꾼 사본 → 변형 표가 달라져 막혀야 한다
  const P0 = part.publications[part.decision.primary], idx0 = P0.zeroFlags.map((z, i) => z ? i : -1).filter(i => i >= 0), bad = structuredClone(P0.variants.median.perStockCounts);
  bad[idx0[0]].down += 400; bad[idx0[0]].up -= 400;
  report('inject:W9', Math.abs(tableFromCounts(bad, idx0).meanGapPp - P0.variants.median.zero32.meanGapPp) > 1e-9, {planted: '변형 A 칸 수 하나 바꾸기(사본)'});
}
