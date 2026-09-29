/**
 * ATLAS 11 · 진화 실험 — 후보 모형 명세(spec)와 적합
 *
 * 운영 A(baseline)는 lib/factor36.mjs 의 fitFactorModel 을 그대로 호출한다(숫자 보존).
 * 후보는 같은 골격(릿지 회귀 + 잔차 변동성 + 공유 날짜 잔차 부트스트랩)에서 「한 번에 한 변수」만 바꾼다:
 *   penalty    벌점 집합            (가중치)
 *   features   특징 마스크          (요인 선택)
 *   volatility 변동성 모형 고정      (변동성·범위)
 *   regime     기준일 시장 상태 고정 입력 (방정식 구조 · F11 52종목 20일 평균 / 20일 폭 평균)
 *   sector     기준일 묶음 5일 평균 고정 입력 (방정식 구조 · F11 묶음 확산)
 * 후보의 고정 입력(carry)은 기준일까지의 실제 가격만으로 계산하며(t−1 정보), 미래 구간에서는 기준일 값을 유지한다.
 * 어느 후보도 채점 규칙·원자료를 바꾸지 않는다. 채택은 promote.mjs 의 관문을 통과한 것만.
 */
import {createHash} from 'node:crypto';
import {FACTOR36_POLICY, fitRidge, components, fitVolatility, volatilityNext, distributionScore, fitFactorModel, mean, FEATURE_FACTORS, FEATURE_NAMES} from '../../factor36.mjs';
import {GROUPS} from '../network.mjs';

const finite = x => typeof x === 'number' && Number.isFinite(x);
const canonical = x => Array.isArray(x) ? x.map(canonical) : x && typeof x === 'object' ? Object.fromEntries(Object.keys(x).sort().filter(k => x[k] !== undefined).map(k => [k, canonical(x[k])])) : x;
const sha = x => createHash('sha256').update(JSON.stringify(canonical(x))).digest('hex');
const variance = a => mean(a.map(x => (x - mean(a)) ** 2));

export const CARRY_FEATURES = Object.freeze({
  basket20: {factorId: 'F11', name: 'F11 52종목 20일 평균 수익률(기준일 고정)', unit: 'log_return_mean_20d'},
  breadth20: {factorId: 'F11', name: 'F11 52종목 20일 폭 평균(기준일 고정)', unit: 'breadth_mean_20d'},
  group5: {factorId: 'F11', name: 'F11 묶음 5일 평균 수익률(기준일 고정)', unit: 'log_return_mean_5d'},
});

export function normalizeSpec(spec) {
  const s = {id: spec.id ?? null, family: spec.family ?? 'baseline', label: spec.label ?? '', penalties: spec.penalties ?? [1, 10], volatility: spec.volatility ?? 'free', featureMask: spec.featureMask ?? null, carry: spec.carry ?? []};
  if (!Array.isArray(s.penalties) || !s.penalties.every(p => finite(p) && p > 0)) throw Error('SPEC_PENALTIES');
  if (!['free', 'garch11', 'constant'].includes(s.volatility)) throw Error('SPEC_VOLATILITY');
  if (s.featureMask && (!Array.isArray(s.featureMask) || !s.featureMask.every(j => Number.isInteger(j) && j >= 0 && j < 7) || !s.featureMask.length)) throw Error('SPEC_MASK');
  if (!Array.isArray(s.carry) || s.carry.some(c => !CARRY_FEATURES[c])) throw Error('SPEC_CARRY');
  return s;
}
export function specId(spec) {
  const s = normalizeSpec(spec);
  if (s.family === 'baseline') return 'A';
  const {id, label, ...rest} = s;
  return 'cand-' + sha(rest).slice(0, 12);
}
export function isBaseline(spec) { return normalizeSpec(spec).family === 'baseline'; }

/** 설정의 후보 가족에서 「한 변수만 바꾼」 후보 명세를 만든다(결정적 순서) */
export function generateCandidates(config) {
  const base = normalizeSpec(config.operating.spec), out = [];
  for (const fam of config.candidateFamilies) {
    for (const value of fam.allowed) {
      const spec = {...base, id: null, family: fam.family};
      if (fam.family === 'penalty') { spec.penalties = value; spec.label = `벌점 [${value.join(',')}]`; }
      else if (fam.family === 'features') { spec.featureMask = value; spec.label = `특징 ${value.map(j => FEATURE_NAMES[j]).join('·')}만`; }
      else if (fam.family === 'volatility') { spec.volatility = value; spec.label = `변동성 ${value === 'garch11' ? 'GARCH 고정' : '상수 고정'}`; }
      else if (fam.family === 'regime') { spec.carry = [value]; spec.label = `시장 상태 고정 입력 ${value}`; }
      else if (fam.family === 'sector') { spec.carry = [value]; spec.label = `묶음 확산 고정 입력 ${value}`; }
      else throw Error('SPEC_FAMILY ' + fam.family);
      spec.id = specId(spec); out.push(normalizeSpec(spec));
    }
  }
  return out;
}

/** 후보의 고정 입력(carry) 값 — through 번째 날짜까지의 정보만 쓴다(그 날 종가 포함) */
export function carryAt(kind, panel, assetIndex, assets, through) {
  if (!Number.isInteger(through) || through < 0 || through >= panel.dates.length) return null;
  if (kind === 'basket20' || kind === 'breadth20') {
    if (through < 19) return null; const src = kind === 'basket20' ? panel.basket : panel.breadth, w = src.slice(through - 19, through + 1); return w.every(finite) ? mean(w) : null;
  }
  if (kind === 'group5') {
    if (through < 4) return null;
    const group = GROUPS.find(g => g.codes.includes(assets[assetIndex].code)), members = group ? assets.map((a, i) => group.codes.includes(a.code) ? i : -1).filter(i => i >= 0) : [assetIndex];
    const vals = []; for (let t = through - 4; t <= through; t++) { const x = members.map(i => panel.returns[i][t]); if (!x.every(finite)) return null; vals.push(mean(x)); } return mean(vals);
  }
  throw Error('CARRY_KIND');
}
/** 날짜 j 행의 값 = j−1 까지의 정보 (기본 특징과 같은 시점 규칙) */
export function carrySeries(kind, panel, assetIndex, assets) { return panel.dates.map((d, j) => j ? carryAt(kind, panel, assetIndex, assets, j - 1) : null); }

/** 후보 설계: 기본 7특징 행 + carry 특징을 붙인 rows 와 simulate 용 external 을 만든다 */
export function specDesign(spec, panel, assetIndex, assets, baseRows) {
  const s = normalizeSpec(spec);
  if (!s.carry.length) return {rows: baseRows, featureFactors: [...FEATURE_FACTORS], featureNames: [...FEATURE_NAMES], selected: [], rejected: []};
  const positions = new Map(panel.dates.map((d, j) => [d, j]));
  const series = s.carry.map(kind => ({kind, ...CARRY_FEATURES[kind], values: carrySeries(kind, panel, assetIndex, assets)}));
  let first = 0; for (let k = 0; k < baseRows.length; k++) { const j = positions.get(baseRows[k].date); if (series.some(x => !finite(x.values[j]))) first = k + 1; }
  const rows = baseRows.slice(first).map(r => { const j = positions.get(r.date); return {...r, x: [...r.x, ...series.map(x => x.values[j])]}; });
  const last = panel.dates.length - 1;
  const selected = series.map(x => ({factorId: x.factorId, kind: x.kind, current: {value: carryAt(x.kind, panel, assetIndex, assets, last), scenarioMode: 'carry', unit: x.unit, date: panel.dates[last]}, values: rows.map(r => x.values[positions.get(r.date)]), byTargetDate: Object.fromEntries(panel.dates.map((d, j) => [d, x.values[j]]))}));
  if (selected.some(x => !finite(x.current.value))) throw Error('CARRY_CURRENT_MISSING');
  return {rows, featureFactors: [...FEATURE_FACTORS, ...series.map(x => x.factorId)], featureNames: [...FEATURE_NAMES, ...series.map(x => x.name)], selected, rejected: []};
}

/* ---- factor36 의 fitted/evaluate 와 같은 식 (내부 함수라 여기 옮김) ---- */
function fitted(rows, lambda, volKind, mask) {
  const regression = fitRidge(rows, lambda, mask), errors = rows.map(r => r.y - components(regression, r.x).total), volatility = fitVolatility(errors, volKind);
  let h = volatility.initial; const raw = errors.map(e => { const z = e / Math.sqrt(h); h = volatilityNext(volatility, h, e); return z; });
  const c = mean(raw), sdev = Math.sqrt(variance(raw)) || 1;
  return {regression, volatility, shocks: raw.map(x => (x - c) / sdev), shockDates: rows.map(r => r.date), shockMeanRemoved: c, shockScale: sdev};
}
function evaluate(model, rows) { let h = model.volatility.last; return rows.map(r => { const mu = components(model.regression, r.x).total, score = distributionScore(model.shocks, mu, Math.sqrt(h), r.y); h = volatilityNext(model.volatility, h, r.y - mu); return {date: r.date, ...score, meanLogReturn: mu, actualLogReturn: r.y}; }); }

/** 후보 적합 — 운영 A 는 원본 함수 그대로. 결과 모양은 fitFactorModel 과 같아 simulate 에 그대로 들어간다. */
export function fitSpecModel(rows, spec, {featureFactors = FEATURE_FACTORS} = {}) {
  const s = normalizeSpec(spec);
  if (s.family === 'baseline') return fitFactorModel(rows, {featureFactors});
  const policy = FACTOR36_POLICY, all = rows.filter(r => r.date < policy.trainingBefore).slice().sort((a, b) => a.date.localeCompare(b.date));
  if (all.some((r, j) => j && r.date === all[j - 1].date || r.x.length !== featureFactors.length || r.x.some(v => !finite(v)) || !finite(r.y))) throw Error('TRAINING_CHRONOLOGY_OR_VALUES');
  const end = all.length - policy.holdoutDays, innerStart = end - policy.innerDays;
  if (innerStart < policy.minimumTrain) return {status: 'insufficient_history', reason: '최소 학습160 + 선택40 + 별도 평가60 거래일 미충족'};
  const train = all.slice(Math.max(0, innerStart - policy.maxTrain), innerStart), inner = all.slice(innerStart, end), holdout = all.slice(end);
  const kinds = s.volatility === 'free' ? ['constant', 'garch11'] : [s.volatility];
  // 마스크: 기본 7특징 중 spec.featureMask 만 + carry 특징(F11 태그 · 강제 포함)
  const baseKeep = s.featureMask ?? [0, 1, 2, 3, 4, 5, 6];
  const mask = featureFactors.map((f, j) => j < 7 ? (baseKeep.includes(j) ? j : -1) : j).filter(j => j >= 0);
  const candidatesFor = m => { const out = []; for (const lambda of [Infinity, ...s.penalties]) for (const kind of kinds) { const model = fitted(train, lambda, kind, m), score = evaluate(model, inner); out.push({id: (lambda === Infinity ? 'zero' : 'ridge' + lambda) + '-' + kind, lambda: lambda === Infinity ? 'zero' : lambda, kind, loss: mean(score.map(x => x.crps))}); } return out.sort((a, b) => a.loss - b.loss || a.id.localeCompare(b.id)); };
  const candidates = candidatesFor(mask), selected = candidates[0], lambda = selected.lambda === 'zero' ? Infinity : selected.lambda;
  const pre = all.slice(Math.max(0, end - policy.maxTrain), end), outerModel = fitted(pre, lambda, selected.kind, mask), outer = evaluate(outerModel, holdout), baseline = evaluate(fitted(pre, Infinity, 'constant'), holdout);
  const final = fitted(all.slice(-policy.maxTrain), lambda, selected.kind, mask);
  return {status: 'research_estimate', ...final, featureFactors, selected, candidates, ablations: [], spec: s, specId: specId(s),
    factorSelection: {method: 'spec_fixed_mask_inner_crps_penalty_and_volatility_choice', first: inner[0].date, last: inner.at(-1).date, holdoutUsed: false, decisions: [], acceptedFeatureIndices: mask, liveAdvantageProven: false},
    trainedThrough: all.at(-1).date, trainCount: all.length,
    validation: {kind: 'chronological_holdout_retrospective_prices', strictPointInTime: false, priceAdjustmentsVerified: false, usedForSelection: false, first: holdout[0].date, last: holdout.at(-1).date, days: holdout.length,
      crps: mean(outer.map(x => x.crps)), baselineCRPS: mean(baseline.map(x => x.crps)), brier: mean(outer.map(x => x.brier)), baselineBrier: mean(baseline.map(x => x.brier)), interval: mean(outer.map(x => x.interval)), baselineInterval: mean(baseline.map(x => x.interval)),
      directionAccuracy: mean(outer.map(x => Number(x.directionCorrect))), baselineDirectionAccuracy: mean(baseline.map(x => Number(x.directionCorrect))), coverage: mean(outer.map(x => Number(x.covered))), baselineCoverage: mean(baseline.map(x => Number(x.covered))),
      absolutePriceError: mean(outer.map(x => x.absolutePriceError).filter(finite)), baselineAbsolutePriceError: mean(baseline.map(x => x.absolutePriceError).filter(finite)), liveAdvantageProven: false},
    trustProbability: null};
}
