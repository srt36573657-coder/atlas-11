/**
 * 후향 시험 사본 — lib/atlas11/evolve/backtest.mjs 의 runSpecBacktest 를 한 줄씩 따라 하되(같은 함수·같은 순서·같은 난수)
 * 칸(기준일×종목)마다 1일·20일 확률·고른 방향·p50·실제값·무게 0 여부를 함께 남긴다. 운영 코드는 고치지 않는다.
 *   fitBlock(designs, origin, spec) → models   : ③ 공통 식처럼 적합만 바꿀 때
 *   simulate(models, panel, assets, dates, opt) : ⑤ 변형처럼 모의 계산만 바꿀 때
 */
import {examplesFor, mean} from '../../../../lib/factor36.mjs';
import {simulateJointFactor36} from '../../../../lib/factor36-simulation.mjs';
import {rollingBacktestPlan, truncateObservedPanel, rankingHits} from '../../../../lib/rolling-backtest.mjs';
import {fitSpecModel, specDesign, normalizeSpec, carryAt} from '../../../../lib/atlas11/evolve/models.mjs';
import {protocolOf} from '../../../../lib/atlas11/evolve/backtest.mjs';

const finite = x => typeof x === 'number' && Number.isFinite(x);
const dirOf = (r, delta = 0.001) => r > delta ? 'up' : r < -delta ? 'down' : 'flat';
const brier = (p, actual) => ['up', 'flat', 'down'].reduce((s, c) => s + ((p?.[c] ?? 0) - (actual === c ? 1 : 0)) ** 2, 0);
export {protocolOf};

export function runRetro(input, spec, {protocol, fitBlock = null, simulate = simulateJointFactor36, onProgress = () => {}} = {}) {
  const s = normalizeSpec(spec);
  const {panel, origins} = rollingBacktestPlan(input, protocol);
  const assets = input.assets, base = assets.map((a, i) => examplesFor(panel, i));
  const designs = assets.map((a, i) => specDesign(s, panel, i, assets, base[i]));
  const prices = assets.map(a => new Map(a.prices.map(r => [r.date, r.quality === 'conflict' ? null : r.close])));
  const days = [], blocks = [], cells = [], leak = [];
  let models = null, blockInfo = null;
  for (let k = 0; k < origins.length; k++) {
    const o = origins[k];
    if (k % protocol.blockDays === 0) {
      models = fitBlock ? fitBlock(designs, o, s) : designs.map(d => fitSpecModel(d.rows.filter(r => r.date <= o.date), s, {featureFactors: d.featureFactors}));
      const bad = models.map((m, i) => m.status !== 'research_estimate' ? assets[i].code : null).filter(Boolean);
      if (bad.length) throw Error('EVOLVE_INSUFFICIENT_HISTORY block ' + o.block + ' ' + bad.join(','));
      const zero = models.map(m => m.selected?.lambda === 'zero');
      if (models.some((m, i) => zero[i] !== (m.regression.intercept === 0 && m.regression.beta.every(b => b === 0)))) throw Error('ZERO_FLAG_MISMATCH');
      blockInfo = {block: o.block, originFirst: o.date, maximumTrainingDate: models.map(m => m.trainedThrough).sort().at(-1), selectedKinds: models.reduce((acc, m) => { acc[m.selected.id] = (acc[m.selected.id] ?? 0) + 1; return acc; }, {}), zeroWeightStocks: zero.filter(Boolean).length, zero, selectedIds: models.map(m => m.selected.id), extra: models[0].poolInfo ?? null};
      blocks.push(blockInfo);
    }
    if (models.some(m => m.trainedThrough > o.date || m.shockDates.some(d => d > o.date))) throw Error('AB_FUTURE_TRAINING');
    const maxTrain = models.map(m => m.trainedThrough).sort().at(-1), maxShock = models.map(m => m.shockDates.at(-1)).sort().at(-1);
    leak.push({origin: o.date, maxTrainingEnd: maxTrain, maxShockDate: maxShock, firstTarget: o.targets[0], strictBefore: maxTrain < o.date, equal: maxTrain === o.date, after: maxTrain > o.date, noFuture: maxTrain <= o.date && maxShock <= o.date && o.targets[0] > o.date});
    const observed = truncateObservedPanel(panel, o.panelIndex);
    const external = designs.map((d, i) => ({selected: d.selected.map(x => ({...x, current: {...x.current, value: carryAt(x.kind, panel, i, assets, o.panelIndex), date: o.date}}))}));
    if (external.some(e => e.selected.some(x => !finite(x.current.value)))) throw Error('EVOLVE_CARRY_MISSING ' + o.date);
    const sim = simulate(models, observed, assets, o.targets, {paths: protocol.paths, seed: protocol.seed, external});
    const errs = [], byH = {1: [], 5: [], 10: [], 20: []}, pred20 = {}, actual20 = {}, d20 = [], c20 = [], i20 = [], b20 = [], d1 = [], c1 = [], b1 = [];
    const prevDate = panel.dates[o.panelIndex - 1];
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
      // 칸 기록(계산에는 쓰지 않는 사본 값)
      const r1 = sim.rows[i][0], r20 = sim.rows[i][protocol.horizon - 1], P = protocol.paths;
      const cnt = p => [Math.round(p.up * P), Math.round(p.flat * P), Math.round(p.down * P)];
      cells.push([k, i, ...cnt(r1.wave.daily.probabilities), r1.wave.daily.selected, r1.p50, prices[i].get(o.targets[0]), ...cnt(r20.wave.horizon.probabilities), r20.wave.horizon.selected, r20.p50, prices[i].get(o.targets[protocol.horizon - 1]), anchor, prices[i].get(prevDate), blockInfo.zero[i] ? 1 : 0]);
    }
    const rank = rankingHits(pred20, actual20, protocol.topK);
    days.push({date: o.date, block: o.block, meanErrorPct: mean(errs), ape1: mean(byH[1]), ape5: mean(byH[5]), ape10: mean(byH[10]), ape20: mean(byH[20]), rankHits: rank.hits, predictedTop: rank.predictedTop, actualTop: rank.actualTop, dir20: mean(d20), cov20: mean(c20), interval20: mean(i20), brier20: mean(b20), dir1: mean(d1), cov1: mean(c1), brier1: mean(b1)});
    onProgress(k + 1, origins.length, o.date);
  }
  const agg = key => mean(days.map(d => d[key]));
  const byBlock = Array.from({length: protocol.blocks}, (_, b) => { const rows = days.filter(d => d.block === b + 1); return {block: b + 1, days: rows.length, meanErrorPct: mean(rows.map(d => d.meanErrorPct)), rankHits: rows.reduce((s, d) => s + d.rankHits, 0), dir20: mean(rows.map(d => d.dir20)), cov20: mean(rows.map(d => d.cov20))}; });
  const summary = {meanErrorPct: agg('meanErrorPct'), rankHits: days.reduce((s, d) => s + d.rankHits, 0), ape1: agg('ape1'), ape5: agg('ape5'), ape10: agg('ape10'), ape20: agg('ape20'), dir20: agg('dir20'), cov20: agg('cov20'), interval20: agg('interval20'), brier20: agg('brier20'), dir1: agg('dir1'), cov1: agg('cov1'), brier1: agg('brier1')};
  const columns = ['k', 'i', 'up1', 'flat1', 'down1', 'sel1', 'p50_1', 'actual1', 'up20', 'flat20', 'down20', 'sel20', 'p50_20', 'actual20', 'anchor', 'prevClose', 'zero'];
  return {codes: assets.map(a => a.code), origins: origins.map(o => ({date: o.date, block: o.block, target1: o.targets[0], target20: o.targets.at(-1), prevDate: panel.dates[o.panelIndex - 1]})), summary, byBlock, blocks, days, columns, cells, leak};
}

/** 저장된 A.json 과 한 자리도 다르지 않은가(요약·블록·120일 행) */
export function sameAsStored(run, stored) {
  const diffs = [];
  const cmp = (p, a, b) => { if (typeof a === 'number' || typeof b === 'number') { if (!(a === b)) diffs.push({path: p, mine: a, stored: b}); } else if (Array.isArray(a) || Array.isArray(b)) { if (!Array.isArray(a) || !Array.isArray(b) || a.length !== b.length) diffs.push({path: p, mine: a, stored: b}); else a.forEach((x, i) => cmp(`${p}[${i}]`, x, b[i])); } else if (a && typeof a === 'object') { for (const k of new Set([...Object.keys(a), ...Object.keys(b ?? {})])) cmp(`${p}.${k}`, a[k], b?.[k]); } else if (a !== b) diffs.push({path: p, mine: a, stored: b}); };
  cmp('summary', run.summary, stored.summary);
  cmp('byBlock', run.byBlock, stored.byBlock);
  cmp('days', run.days, stored.days);
  run.blocks.forEach((b, i) => { cmp(`blocks[${i}].originFirst`, b.originFirst, stored.blocks[i].originFirst); cmp(`blocks[${i}].maximumTrainingDate`, b.maximumTrainingDate, stored.blocks[i].maximumTrainingDate); cmp(`blocks[${i}].selectedKinds`, b.selectedKinds, stored.blocks[i].selectedKinds); });
  return {identical: diffs.length === 0, compared: ['summary', 'byBlock', 'days(120)', 'blocks(originFirst·maximumTrainingDate·selectedKinds)'], diffs: diffs.slice(0, 20), diffCount: diffs.length};
}
