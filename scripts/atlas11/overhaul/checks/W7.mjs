/**
 * W7 · 부품 ① 검사 — part1.json 의 핵심 숫자를 결과 파일과 기록 장부에서 다시 센다(갈래 나 코드를 불러오지 않는 따로 짠 셈)
 *   node scripts/atlas11/overhaul/check.mjs --step W7
 */
import fs from 'node:fs';
import path from 'node:path';

const mean = a => a.reduce((s, x) => s + x, 0) / a.length;
const dir = (r, d = 0.001) => r > d ? 'up' : r < -d ? 'down' : 'flat';
const top = p => ['flat', 'up', 'down'].reduce((b, c) => b === null || p[c] > p[b] ? c : b, null);
const near = (a, b, tol = 1e-12) => Math.abs(a - b) <= tol;

function boot(cand, ref) { // backtest.mjs:83-94 과 같은 뽑기 · 높을수록 좋음
  const diff = cand.map((c, k) => c - ref[k]), nb = Math.ceil(diff.length / 20); let s = 20260929 >>> 0, up = 0, down = 0;
  const rnd = () => { s = (Math.imul(1664525, s) + 1013904223) >>> 0; return s / 4294967296; };
  for (let r = 0; r < 2000; r++) { const picked = []; for (let b = 0; b < nb; b++) { const st = Math.floor(rnd() * nb) * 20; for (let j = st; j < Math.min(st + 20, diff.length); j++) picked.push(diff[j]); } const m = mean(picked); if (m > 0) up++; else if (m < 0) down++; }
  let bc = 0, br = 0; for (let b = 0; b < 6; b++) { const c = mean(cand.slice(b * 20, b * 20 + 20)), r = mean(ref.slice(b * 20, b * 20 + 20)); if (c > r) bc++; else if (r > c) br++; }
  return {pCand: up / 2000, pRef: down / 2000, bc, br};
}

export function recountRetro(run) {
  const c = Object.fromEntries(run.columns.map((n, j) => [n, j])), K = run.origins.length, by = Array.from({length: K}, () => []);
  for (const r of run.cells) by[r[c.k]].push(r);
  return by.map(rows => {
    const a1 = rows.map(r => dir(r[c.actual1] / r[c.anchor] - 1)), a20 = rows.map(r => dir(r[c.actual20] / r[c.anchor] - 1)), pv = rows.map(r => dir(r[c.anchor] / r[c.prevClose] - 1)), mk = dir(mean(rows.map(r => r[c.anchor] / r[c.prevClose] - 1)));
    const sel1 = rows.map(r => top({up: r[c.up1], flat: r[c.flat1], down: r[c.down1]}));
    return {sel1Consistent: sel1.every((s, j) => s === rows[j][c.sel1]), dir1sel: mean(rows.map((r, j) => r[c.sel1] === a1[j] ? 1 : 0)), up1: mean(a1.map(x => x === 'up' ? 1 : 0)), down1: mean(a1.map(x => x === 'down' ? 1 : 0)), prev1: mean(pv.map((p, j) => p === a1[j] ? 1 : 0)), market1: mean(a1.map(x => x === mk ? 1 : 0)), dir20sel: mean(rows.map((r, j) => r[c.sel20] === a20[j] ? 1 : 0)), ape1: mean(rows.map(r => Math.abs(r[c.p50_1] - r[c.actual1]) / r[c.actual1] * 100)), ape1close: mean(rows.map(r => Math.abs(r[c.anchor] - r[c.actual1]) / r[c.actual1] * 100))};
  });
}

function liveRecount(ROOT) {
  const recs = []; const dirL = path.join(ROOT, 'reports/atlas11/ledger');
  for (const kind of ['score', 'analysis']) for (const f of fs.readdirSync(path.join(dirL, kind)).sort()) fs.readFileSync(path.join(dirL, kind, f), 'utf8').split('\n').forEach((l, i) => { if (l.trim()) recs.push({f, i, r: JSON.parse(l)}); });
  // supersedes 는 모든 종류의 기록에서 모은다
  const sup = new Set(); for (const kind of fs.readdirSync(dirL)) { const d = path.join(dirL, kind); if (!fs.statSync(d).isDirectory()) continue; for (const f of fs.readdirSync(d)) for (const l of fs.readFileSync(path.join(d, f), 'utf8').split('\n')) if (l.trim()) { const r = JSON.parse(l); if (r.supersedes) sup.add(r.supersedes); } }
  const rep = {'2026-09-29': '2026-09-28-rolling20-13cd892134e517b4', '2026-09-30': '2026-09-29-atlas11-128de9174cfdfa1f'}, best = new Map();
  for (const t of recs) { const r = t.r, b = r.body ?? {}; if (r.type !== 'score' || sup.has(r.id) || b.horizon !== 1 || rep[b.targetDate] !== b.forecastId) continue; const k = b.forecastId + b.code + b.targetDate, cur = best.get(k); if (!cur || (r.at ?? '') > (cur.at ?? '') || (r.at === cur.at)) best.set(k, r); }
  const cells = [...best.values()].map(r => { const b = r.body, act = dir(b.actual / b.anchor - 1), pred = top(b.probabilities); return {pred, act, ok: pred === act, ape: Math.abs(b.predicted.p50 - b.actual) / b.actual, base: Math.abs(b.anchor - b.actual) / b.actual}; });
  return {cells: cells.length, model: cells.filter(c => c.ok).length, alwaysUp: cells.filter(c => c.act === 'up').length, alwaysDown: cells.filter(c => c.act === 'down').length, predictedDown: cells.filter(c => c.pred === 'down').length, errModel: Math.round(mean(cells.map(c => c.ape)) * 10000) / 100, errClose: Math.round(mean(cells.map(c => c.base)) * 10000) / 100, sizeModel: cells.filter(c => c.ape <= 0.015).length, sizeClose: cells.filter(c => c.base <= 0.015).length};
}

export default async function W7({report, sha, rel, ROOT}) {
  const part = JSON.parse(fs.readFileSync(rel('reports/atlas11/overhaul/part1.json'), 'utf8'));
  const cellsFile = 'reports/atlas11/overhaul/part1-retro-A-cells.json', buf = fs.readFileSync(rel(cellsFile));
  report('W7:파일지문', sha(buf) === part.files[cellsFile], {file: cellsFile});
  const run = JSON.parse(buf.toString('utf8'));
  // 재현: 저장된 A.json 요약·120일 행과 같은가
  const stored = JSON.parse(fs.readFileSync(rel('reports/atlas11/evolve/backtests/A.json'), 'utf8'));
  const sameSummary = Object.keys(stored.summary).every(k => run.summary[k] === stored.summary[k]) && run.days.every((d, k) => ['ape1', 'ape20', 'dir1', 'dir20', 'meanErrorPct'].every(f => d[f] === stored.days[k][f]));
  report('W7:후향재현(R8·T21)', sameSummary && run.reproduction?.identical === true && run.protocol.paths === 512 && run.protocol.seed === 20260917 && run.origins.length === 120, {dir1P50: stored.summary.dir1, ape1: stored.summary.ape1, dir20: stored.summary.dir20});
  // T11: 실전 정의로 다시 셈
  const rc = recountRetro(run), R = part.retro;
  const m = k => mean(rc.map(x => x[k]));
  const okSel = rc.every(x => x.sel1Consistent);
  const same1 = near(m('dir1sel'), R.oneDay.dir1selExact.model) && near(m('up1'), R.oneDay.dir1selExact.alwaysUp) && near(m('down1'), R.oneDay.dir1selExact.alwaysDown) && near(m('prev1'), R.oneDay.dir1selExact.ownPrevDay) && near(m('market1'), R.oneDay.dir1selExact.marketPrevDay) && near(m('dir20sel'), R.twentyDays.dir20selExact.model) && near(m('ape1'), R.oneDay.errorRatePct.model) && near(m('ape1close'), R.oneDay.errorRatePct.closeAsIs);
  report('T11', okSel && same1 && near(m('dir1sel'), R.oneDay.dir1selExact.model), {dir1selPct: Math.round(m('dir1sel') * 10000) / 100, storedDir1P50Pct: Math.round(stored.summary.dir1 * 10000) / 100, selectedEqualsHighestProbability: okSel});
  // 부트스트랩 다시 셈
  const po = R.perOrigin, pairs = {alwaysUp: 'alwaysUp1', alwaysDown: 'alwaysDown1', ownPrevDay: 'ownPrev1', marketPrevDay: 'marketPrev1'};
  const seriesSame = rc.every((x, k) => x.dir1sel === po.dir1sel[k] && x.up1 === po.alwaysUp1[k] && x.down1 === po.alwaysDown1[k] && x.prev1 === po.ownPrev1[k] && x.market1 === po.marketPrev1[k]);
  let bootSame = seriesSame;
  const outcomes = {};
  for (const [name, key] of Object.entries(pairs)) { const b = boot(po[key], po.dir1sel), s = R.oneDay.bootstrap[name]; bootSame &&= b.pCand === s.pCandBetter && b.pRef === s.pRefBetter && b.bc === s.blocksCandBetter && b.br === s.blocksRefBetter; outcomes[name] = {ruleBetter: b.pCand >= 0.8 && b.bc >= 4, modelBetter: b.pRef >= 0.8 && b.br >= 4, p: [b.pCand, b.pRef], blocks: [b.bc, b.br]}; }
  const verdict = Object.values(outcomes).some(o => o.ruleBetter) ? '원인이다' : Object.values(outcomes).every(o => o.modelBetter) ? '아니다' : '모른다';
  report('W7:부트스트랩·판정', bootSame && verdict === part.decision.verdict, {verdict, outcomes});
  // 실전 104칸: 기록 장부에서 다시 셈 + 정답표와 겹치는 값
  const lv = liveRecount(ROOT), L = part.live.all, ex = JSON.parse(fs.readFileSync(rel('reports/atlas11/overhaul/expected.json'), 'utf8'));
  const liveSame = lv.cells === 104 && lv.model === L.model && lv.alwaysUp === L.alwaysUp && lv.alwaysDown === L.alwaysDown && lv.predictedDown === L.predictedDown && lv.errModel === L.errorRateMeanPct.model && lv.errClose === L.errorRateMeanPct.closeAsIs && lv.sizeModel === L.sizeRight.model && lv.sizeClose === L.sizeRight.closeAsIs;
  const answerSame = L.model === ex['방향맞음'] && L.predictedDown === ex['예측하락'] && L.actualDown === ex['실제하락'] && L.alwaysDown === ex['늘하락맞음'] && L.errorRateMeanPct.model === ex['오차율평균']['모델'] && L.errorRateMeanPct.closeAsIs === ex['오차율평균']['종가그대로'] && L.sizeRight.model === ex['폭맞음']['모델'] && L.sizeRight.closeAsIs === ex['폭맞음']['종가그대로'];
  report('W7:실전104칸', liveSame && answerSame && part.live.crossCheckWithRecount.sameCells === true, {model: L.model, alwaysUp: L.alwaysUp, alwaysDown: L.alwaysDown, ownPrevDay: L.ownPrevDay, marketPrevDay: L.marketPrevDay, errorRate: L.errorRateMeanPct, sizeRight: L.sizeRight});
  // 결함 심기(10절): 칸 하나의 고른 방향을 바꾼 사본 → dir1sel 이 달라져 막혀야 한다
  const bad = structuredClone(run), c = Object.fromEntries(bad.columns.map((n, j) => [n, j])), row = bad.cells[0];
  row[c.sel1] = row[c.sel1] === 'up' ? 'down' : 'up';
  const caught = !near(mean(recountRetro(bad).map(x => x.dir1sel)), R.oneDay.dir1selExact.model) || !recountRetro(bad).every(x => x.sel1Consistent);
  report('inject:W7', caught, {planted: '후향 칸 하나의 고른 방향 뒤집기(사본)', caught});
}
