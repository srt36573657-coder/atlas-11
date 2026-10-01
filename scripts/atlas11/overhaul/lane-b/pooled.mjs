/**
 * ③ 시험 사본 — 52종목 무게 한 벌(공통 식). 계획 plan.md ③ 그대로, 바꾸는 것은 평균 식 계수(절편 + β 7개)를 52종목이 함께 쓰는 것 하나.
 *   같은 것: 특징 7개 · 벌점 목록 {0(zero), 1, 10} · 종목별 학습/선택/평가 구간(lib/factor36.mjs fitFactorModel 과 같은 자름)
 *            · 종목별 변동폭 종류(상수/GARCH, 자기 선택 구간 CRPS) · 종목별 잔차 표 · 모의 계산 · 난수 · 경로
 *   적합: 각 종목 학습 행을 쌓아 fitRidge 한 번(같은 함수) · 벌점은 52종목 평균 선택 구간 CRPS 가 가장 낮은 하나
 *   최종: 각 종목 마지막 504행을 쌓아 같은 벌점으로 다시 적합 · 종목별 변동폭·잔차는 자기 잔차로
 */
import {FACTOR36_POLICY, fitRidge, components, fitVolatility, volatilityNext, distributionScore, mean} from '../../../../lib/factor36.mjs';

const finite = x => typeof x === 'number' && Number.isFinite(x);
const variance = a => mean(a.map(x => (x - mean(a)) ** 2));
const validDate = x => typeof x === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(x);
const lamName = l => l === Infinity ? 'zero' : 'ridge' + l;

// lib/factor36.mjs:84 fitted() 와 같은 식(회귀만 밖에서 받음)
function withRegression(regression, rows, kind) {
  const errors = rows.map(r => r.y - components(regression, r.x).total), volatility = fitVolatility(errors, kind);
  let h = volatility.initial; const raw = errors.map(e => { const z = e / Math.sqrt(h); h = volatilityNext(volatility, h, e); return z; });
  const c = mean(raw), s = Math.sqrt(variance(raw)) || 1;
  return {regression, volatility, shocks: raw.map(x => (x - c) / s), shockDates: rows.map(r => r.date), shockMeanRemoved: c, shockScale: s};
}
// lib/factor36.mjs:85 evaluate() 와 같은 식
function innerLoss(model, rows) { let h = model.volatility.last; return mean(rows.map(r => { const mu = components(model.regression, r.x).total, score = distributionScore(model.shocks, mu, Math.sqrt(h), r.y); h = volatilityNext(model.volatility, h, r.y - mu); return score.crps; })); }

export function pooledFit(rowsByStock, {penalties = [1, 10], kinds = ['constant', 'garch11']} = {}) {
  const policy = FACTOR36_POLICY;
  const win = rowsByStock.map(rows => {
    const all = rows.filter(r => r.date < policy.trainingBefore).slice().sort((a, b) => a.date.localeCompare(b.date));
    if (all.some((r, j) => !validDate(r.date) || j && r.date === all[j - 1].date || r.x.length !== 7 || r.x.some(v => !finite(v)) || !finite(r.y))) throw Error('TRAINING_CHRONOLOGY_OR_VALUES');
    const end = all.length - policy.holdoutDays, innerStart = end - policy.innerDays;
    if (innerStart < policy.minimumTrain) throw Error('POOLED_INSUFFICIENT_HISTORY');
    return {all, train: all.slice(Math.max(0, innerStart - policy.maxTrain), innerStart), inner: all.slice(innerStart, end), final: all.slice(-policy.maxTrain)};
  });
  const pooledTrain = win.flatMap(w => w.train), lambdas = [Infinity, ...penalties], perLambda = [];
  for (const lambda of lambdas) {
    const reg = fitRidge(pooledTrain, lambda);
    const stocks = win.map(w => kinds.map(kind => ({id: lamName(lambda) + '-' + kind, kind, loss: innerLoss(withRegression(reg, w.train, kind), w.inner)})).sort((a, b) => a.loss - b.loss || a.id.localeCompare(b.id))[0]);
    perLambda.push({id: lamName(lambda), lambda, loss: mean(stocks.map(s => s.loss)), stocks});
  }
  const chosen = perLambda.slice().sort((a, b) => a.loss - b.loss || a.id.localeCompare(b.id))[0];
  const reg = fitRidge(win.flatMap(w => w.final), chosen.lambda);
  const models = win.map((w, i) => {
    const pick = chosen.stocks[i], fit = withRegression(reg, w.final, pick.kind);
    return {status: 'research_estimate', ...fit, featureFactors: ['F35', 'F35', 'F35', 'F35', 'F35', 'F11', 'F11'], selected: {id: pick.id, lambda: chosen.lambda === Infinity ? 'zero' : chosen.lambda, kind: pick.kind, loss: pick.loss}, trainedThrough: w.all.at(-1).date, trainCount: w.all.length, pooled: true};
  });
  const poolInfo = {chosenLambda: chosen.id, pooledInnerLoss: Object.fromEntries(perLambda.map(p => [p.id, p.loss])), kinds: chosen.stocks.reduce((a, s) => { a[s.kind] = (a[s.kind] ?? 0) + 1; return a; }, {}), intercept: reg.intercept, beta: reg.beta, center: reg.center, scale: reg.scale, rows: reg.n};
  models[0].poolInfo = poolInfo;
  return models;
}

/** run-retro.mjs 의 fitBlock 자리: 기준일까지의 행만 쓴다(A 와 같은 r.date <= o.date) */
export function pooledFitBlock(designs, o, spec) {
  if (designs.some(d => d.featureFactors.length !== 7)) throw Error('POOLED_FEATURES_7_ONLY');
  return pooledFit(designs.map(d => d.rows.filter(r => r.date <= o.date)), {penalties: spec.penalties});
}
