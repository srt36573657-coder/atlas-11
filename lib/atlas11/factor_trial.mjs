/**
 * ATLAS 11 · 재료(요인) 시험 — 「매일 관측만 하고 예측에 안 쓰는 재료」를 하나씩 더하면 내일 방향 맞힘이 좋아지는가 (후향)
 *   2026-10-02 14:31 사장님 「일단 그렇게 해봐」(가: 13가지 모으기 → 시험 → 좋아진 것만 켜기)
 *
 * 운영 경로와 같은 식만 쓴다(새 수학 없음):
 *   기본 7특징(F35·F11) + 재료 1개 → fitFactorModel(종목마다 안쪽 40일 CRPS 로 그 재료를 받을지 스스로 정함)
 *   → simulateAtlas11(운영 모의 계산 · 내일 하루만 · 경로마다 난수 20개 · 같은 난수) · 미래 구간의 재료 값은 기준일 값 고정(carry)
 * 시점 규칙: 재료 값은 「그날 발행 시각(18:53 KST 무렵)에 실제로 받을 수 있었던 것」만 쓴다 — RELEASE_RULES
 *   2026-10-01 18:53 KST 실제 수집(reports/atlas11/context/2026-10-01)에서 본 최신 날짜와 맞는지 시험이 확인한다.
 * 결측은 0 으로 채우지 않는다. 운영 발행본·채점 규칙·진화 설정 파일은 읽기만 한다.
 */
import {createHash} from 'node:crypto';
import {fitFactorModel, FEATURE_FACTORS, mean} from '../factor36.mjs';
import {simulateAtlas11, directionOf} from './simulate.mjs';
import {truncateObservedPanel} from '../rolling-backtest.mjs';

const DAY = 86400000;
const finite = x => typeof x === 'number' && Number.isFinite(x);
export const addDays = (d, n) => new Date(Date.parse(d + 'T00:00:00Z') + n * DAY).toISOString().slice(0, 10);
const weekday = d => new Date(d + 'T00:00:00Z').getUTCDay();
const mondayOf = d => addDays(d, -((weekday(d) + 6) % 7));
const canonical = x => Array.isArray(x) ? x.map(canonical) : x && typeof x === 'object' ? Object.fromEntries(Object.keys(x).sort().filter(k => x[k] !== undefined).map(k => [k, canonical(x[k])])) : x;
export const sha = x => createHash('sha256').update(typeof x === 'string' || Buffer.isBuffer(x) ? x : JSON.stringify(canonical(x))).digest('hex');

/** 공개 규칙 — 관측일 t 의 값을 한국 날짜로 언제 발행부터 쓸 수 있나(그날 18:53 KST 발행 기준 · 늦게 잡는 쪽) */
export const RELEASE_RULES = Object.freeze({
  us_close_next_day: {label: '미국 장 마감 값 → 다음 날 한국 발행부터', usableFrom: t => addDays(t, 1)},
  fred_daily_2d: {label: 'FRED 일별(재무부·연준·EIA·Cboe 등) → 이틀 뒤 한국 발행부터', usableFrom: t => addDays(t, 2)},
  h10_weekly: {label: '연준 H.10 환율 → 다음 주 월요일 발표 · 하루 더 여유를 둬 다음 주 수요일 한국 발행부터', usableFrom: t => addDays(mondayOf(t), 9)},
  h41_weekly: {label: '연준 H.4.1 총자산(수요일 값) → 목요일 발표 · 하루 더 여유를 둬 토요일 뒤 한국 발행부터', usableFrom: t => addDays(t, 3)},
  krx_flows_next_day: {label: '종목별 투자자 수급(당일 값은 발행 시각에 없음·잠정) → 다음 날 발행부터', usableFrom: t => addDays(t, 1)},
  kr_market_next_day: {label: '국내 금리·지수(네이버 표기) → 다음 날 발행부터', usableFrom: t => addDays(t, 1)},
  // 2026-10-02 15:18 고침(2단계 결과 전): 수집 기록에서 EIA 유가가 FRED 에 주 1번(수요일)에 몰아서 올라오는 것을 확인 → 「이틀 뒤」 규칙은 너무 이름
  eia_weekly: {label: 'EIA 유가(FRED) → 매주 수요일에 몰아서 올라옴 · 하루 더 여유를 둬 관측일 다음 수요일 + 2일(금요일) 한국 발행부터', usableFrom: t => addDays(t, ((3 - weekday(t) + 7) % 7 || 7) + 2)},
});

/** 시험할 재료 — 재료 하나 = 후보 하나(한 번에 한 가지만 바꾼다). 변환은 결과를 보기 전에 경제적 이유로 하나만 정했다. */
export const TRIAL_CANDIDATES = Object.freeze([
  {id: 'F02-DGS2', factorId: 'F02', name: '미국 정책금리·기대', label: '미국 2년 국채금리 5일 변화', series: 'DGS2', kind: 'macro', release: 'fred_daily_2d', transform: 'diff5', unit: 'percentage_points_change_5obs', maxAgeDays: 10, license: 'public_domain_citation_requested', stage: 1},
  {id: 'F04-DFII10', factorId: 'F04', name: '미국 실질금리', label: '미국 10년 실질금리 5일 변화', series: 'DFII10', kind: 'macro', release: 'fred_daily_2d', transform: 'diff5', unit: 'percentage_points_change_5obs', maxAgeDays: 10, license: 'public_domain_citation_requested', stage: 1},
  {id: 'F05-BAA10Y', factorId: 'F05', name: '신용 스프레드', label: '미국 Baa 회사채 − 국채10년 수준', series: 'BAA10Y', kind: 'macro', release: 'fred_daily_2d', transform: 'level', unit: 'percentage_points', maxAgeDays: 10, license: 'review_required', stage: 1},
  {id: 'F06-DEXKOUS', factorId: 'F06', name: '원/달러 환율', label: '원/달러 5일 변화율(로그)', series: 'DEXKOUS', kind: 'macro', release: 'h10_weekly', transform: 'logdiff5', unit: 'log_change_5obs', maxAgeDays: 21, license: 'public_domain_citation_requested', stage: 1},
  {id: 'F07-WALCL', factorId: 'F07', name: '통화·은행 유동성', label: '연준 총자산 4주 변화율(로그)', series: 'WALCL', kind: 'macro', release: 'h41_weekly', transform: 'logdiff4', unit: 'log_change_4obs', maxAgeDays: 21, license: 'public_domain_citation_requested', stage: 1},
  {id: 'F09-SP500', factorId: 'F09', name: '글로벌 주식시장 흐름', label: 'S&P 500 직전 하루 수익률(로그)', series: 'SP500', kind: 'macro', release: 'us_close_next_day', transform: 'logdiff1', unit: 'log_change_1obs', maxAgeDays: 7, license: 'preapproval_required', stage: 1},
  {id: 'F10-VIXCLS', factorId: 'F10', name: '위험 회피·시장 변동성', label: 'VIX 수준(로그)', series: 'VIXCLS', kind: 'macro', release: 'fred_daily_2d', transform: 'loglevel', unit: 'log_level', maxAgeDays: 10, license: 'review_required', stage: 1},
  // 2단계 — 3년 기록을 모은 뒤(atlas11-backfill) 시험한다. 지금 저장소에는 최근 며칠치만 있다.
  {id: 'F03-KR3YT', factorId: 'F03', name: '장단기 시장금리 곡선', label: '국고채 3년 5일 변화', series: 'KR3YT=RR', kind: 'macro', release: 'kr_market_next_day', transform: 'diff5', unit: 'percentage_points_change_5obs', maxAgeDays: 10, license: 'review_required', stage: 2},
  {id: 'F33-WTI', factorId: 'F33', name: '원자재·에너지 원가', label: 'WTI 5일 변화율(로그)', series: 'DCOILWTICO', kind: 'macro', release: 'eia_weekly', transform: 'logdiff5', unit: 'log_change_5obs', maxAgeDays: 14, license: 'public_domain_citation_requested', stage: 2},
  {id: 'F14-FOREIGN', factorId: 'F14', name: '외국인 현물 수급', label: '외국인 순매수 5일 합 ÷ 5일 거래량(종목별)', field: 'foreignNet', kind: 'flows', release: 'krx_flows_next_day', transform: 'flowShare5', unit: 'net_shares_over_volume_5d', maxAgeDays: 10, license: 'review_required', stage: 2},
  {id: 'F16-INSTITUTION', factorId: 'F16', name: '국내 기관 수급', label: '기관 순매수 5일 합 ÷ 5일 거래량(종목별 · 연기금 포함 합계)', field: 'institutionNet', kind: 'flows', release: 'krx_flows_next_day', transform: 'flowShare5', unit: 'net_shares_over_volume_5d', maxAgeDays: 10, license: 'review_required', stage: 2},
  {id: 'F19-INDIVIDUAL', factorId: 'F19', name: '개인 투자자 수급', label: '개인 순매수 5일 합 ÷ 5일 거래량(종목별)', field: 'individualNet', kind: 'flows', release: 'krx_flows_next_day', transform: 'flowShare5', unit: 'net_shares_over_volume_5d', maxAgeDays: 10, license: 'review_required', stage: 2},
]);
/** 13가지 중 시험 못 하는 것 — 이유를 남긴다 */
export const NOT_TESTABLE = Object.freeze([
  {factorId: 'F30', name: '자본조달·기업행위', reason: '공시 제목(낱말)뿐이라 숫자 재료가 아니고, 3년치 공시 목록은 열쇠가 필요한 출처(DART)에서만 받을 수 있음 → 이번 시험에서 빠짐(자료 없음)'},
]);

/** 재료 값 하나: 발행일 D 에 받을 수 있던 관측만으로 변환값을 만든다(없으면 null) */
export function featureAt(rows, candidate, issueDate) {
  const rule = RELEASE_RULES[candidate.release];
  if (!rule) throw Error('TRIAL_RELEASE_RULE ' + candidate.release);
  let k = -1;
  for (let i = 0; i < rows.length; i++) { if (rule.usableFrom(rows[i].date) <= issueDate) k = i; else if (rows[i].date > issueDate) break; }
  if (k < 0) return null;
  const last = rows[k];
  if ((Date.parse(issueDate) - Date.parse(last.date)) / DAY > candidate.maxAgeDays) return null;
  const back = n => k - n >= 0 ? rows[k - n] : null;
  const t = candidate.transform;
  if (t === 'level') return finite(last.value) ? last.value : null;
  if (t === 'loglevel') return finite(last.value) && last.value > 0 ? Math.log(last.value) : null;
  let m = /^diff(\d+)$/.exec(t);
  if (m) { const b = back(+m[1]); return b && finite(b.value) && finite(last.value) ? last.value - b.value : null; }
  m = /^logdiff(\d+)$/.exec(t);
  if (m) { const b = back(+m[1]); return b && b.value > 0 && last.value > 0 ? Math.log(last.value / b.value) : null; }
  if (t === 'flowShare5') {
    if (k < 4) return null;
    let net = 0, vol = 0;
    for (let i = k - 4; i <= k; i++) { const r = rows[i], x = r[candidate.field]; if (!finite(x) || !finite(r.volume) || r.volume <= 0) return null; net += x; vol += r.volume; }
    return vol > 0 ? net / vol : null;
  }
  throw Error('TRIAL_TRANSFORM ' + t);
}

/** 발행일(패널 날짜)마다 재료 값 — Map(issueDate → value|null) */
export function featureByIssueDate(rows, candidate, dates) {
  const sorted = [...rows].sort((a, b) => a.date.localeCompare(b.date));
  return new Map(dates.map(d => [d, featureAt(sorted, candidate, d)]));
}

/** 시점 규칙 점검: 실제 수집 묶음(한국 날짜 C)에서 본 최신 관측일 L 다음 관측일 t' 를 규칙이 C 이전에 「쓸 수 있다」고 하면 규칙이 너무 이르다(위반).
    L 자체를 규칙이 C 보다 늦게 허락하면 그만큼 보수적(정보를 덜 씀)이다. */
export function checkReleaseRule(candidate, observedLatestDate, collectionDayKST) {
  const rule = RELEASE_RULES[candidate.release], weekly = candidate.release === 'h41_weekly'; // H.4.1 은 수요일 값만 · 나머지는 평일마다 값
  let next = addDays(observedLatestDate, weekly ? 7 : 1); while (!weekly && [0, 6].includes(weekday(next))) next = addDays(next, 1);
  const usableNext = rule.usableFrom(next), usableLatest = rule.usableFrom(observedLatestDate);
  return {series: candidate.series ?? candidate.field, release: candidate.release, collectionDayKST, observedLatestDate, usableFromObserved: usableLatest, nextObservation: next, usableFromNext: usableNext, ruleIsConservative: usableNext > collectionDayKST, lateByDays: Math.max(0, (Date.parse(usableLatest) - Date.parse(collectionDayKST)) / DAY)};
}

/** 시험 설계: 기본 행(목표일 j 의 특징 = j−1 까지의 수익률) + 재료(발행일 = j−1 에 받을 수 있던 값). 빠진 값이 있으면 그 앞 행을 버린다(운영 externalDesign 과 같은 규칙) */
export function trialDesign(baseRows, panel, valueOn) {
  const pos = new Map(panel.dates.map((d, j) => [d, j]));
  const vals = baseRows.map(r => { const j = pos.get(r.date), issue = j > 0 ? panel.dates[j - 1] : null; return issue ? valueOn.get(issue) ?? null : null; });
  let first = 0; vals.forEach((v, k) => { if (!finite(v)) first = k + 1; });
  const rows = baseRows.slice(first).map((r, k) => ({...r, x: [...r.x, vals[first + k]]}));
  const byTargetDate = {}; panel.dates.forEach((d, j) => { if (j > 0) byTargetDate[d] = valueOn.get(panel.dates[j - 1]) ?? null; });
  return {rows, removedPrefixRows: first, byTargetDate};
}

const brier = (p, actual) => ['up', 'flat', 'down'].reduce((s, c) => s + ((p?.[c] ?? 0) - (actual === c ? 1 : 0)) ** 2, 0);

/**
 * 한 쪽(A = 운영 그대로, B = 재료 1개 더함) 계산. 같은 기준일·종목·난수.
 * designs: null(A) 또는 종목별 {rows, valueOn: Map, byTargetDate}
 */
export function runTrialSide({input, panel, origins, base, protocol, candidate = null, designs = null, onProgress = () => {}}) {
  const assets = input.assets, prices = assets.map(a => new Map(a.prices.map(r => [r.date, r.quality === 'conflict' ? null : r.close])));
  const featureFactors = candidate ? [...FEATURE_FACTORS, candidate.factorId] : [...FEATURE_FACTORS];
  const days = [], blocks = [];
  let models = null;
  for (let k = 0; k < origins.length; k++) {
    const o = origins[k];
    if (k % protocol.window.blockDays === 0) {
      models = assets.map((a, i) => fitFactorModel((designs ? designs[i].rows : base[i]).filter(r => r.date <= o.date), {featureFactors}));
      const bad = models.map((m, i) => m.status !== 'research_estimate' ? assets[i].code : null).filter(Boolean);
      if (bad.length) throw Error('TRIAL_INSUFFICIENT_HISTORY block ' + o.block + ' ' + bad.join(','));
      const accepted = candidate ? models.map((m, i) => m.factorSelection.decisions.some(d => d.factorId === candidate.factorId && d.accepted) ? assets[i].code : null).filter(Boolean) : [];
      blocks.push({block: o.block, originFirst: o.date, trainedThroughMax: models.map(m => m.trainedThrough).sort().at(-1), acceptedStocks: accepted.length, acceptedCodes: accepted});
    }
    if (models.some(m => m.trainedThrough > o.date || m.shockDates.some(d => d > o.date))) throw Error('TRIAL_FUTURE_TRAINING ' + o.date);
    const observed = truncateObservedPanel(panel, o.panelIndex);
    const external = designs ? designs.map(d => { const v = d.valueOn.get(o.date); if (!finite(v)) throw Error('TRIAL_CURRENT_VALUE_MISSING ' + o.date); return {selected: [{factorId: candidate.factorId, current: {value: v, scenarioMode: 'carry', date: o.date}, byTargetDate: d.byTargetDate}]}; }) : [];
    const sim = simulateAtlas11(models, observed, assets, o.targets, {paths: protocol.simulation.paths, seed: protocol.simulation.seed, external, rngStepsPerPath: protocol.simulation.rngStepsPerPath});
    const cells = [];
    for (let i = 0; i < assets.length; i++) {
      const anchor = prices[i].get(o.date), v = prices[i].get(o.targets[0]), row = sim.rows[i][0];
      if (!finite(anchor) || anchor <= 0 || !finite(v) || v <= 0) throw Error('TRIAL_PRICE_MISSING ' + assets[i].code + ' ' + o.date);
      const actual = directionOf(v / anchor - 1), predicted = row.direction.daily.selected;
      cells.push({code: assets[i].code, predicted, actual, ape: Math.abs(row.p50 - v) / v * 100, brier: brier(row.direction.daily.probabilities, actual), covered: v >= row.p10 && v <= row.p90 ? 1 : 0, up: row.direction.daily.probabilities.up, down: row.direction.daily.probabilities.down});
    }
    const right = cells.filter(c => c.actual !== 'flat' && c.predicted === c.actual).length, wrong = cells.filter(c => c.actual !== 'flat' && c.predicted !== c.actual).length;
    days.push({date: o.date, target: o.targets[0], block: o.block, right, wrong, flatActual: cells.length - right - wrong, ape: mean(cells.map(c => c.ape)), brier: mean(cells.map(c => c.brier)), coverage: mean(cells.map(c => c.covered)), cells: cells.map(c => [c.code, c.predicted, c.actual, +c.ape.toFixed(4), +c.up.toFixed(4), +c.down.toFixed(4)])});
    onProgress(k + 1, origins.length, o.date);
  }
  return {days, blocks, summary: summarizeDays(days)};
}

export function summarizeDays(days) {
  const right = days.reduce((s, d) => s + d.right, 0), wrong = days.reduce((s, d) => s + d.wrong, 0), flatActual = days.reduce((s, d) => s + d.flatActual, 0);
  return {right, wrong, flatActual, hitRate: right + wrong ? right / (right + wrong) : null, ape1: mean(days.map(d => d.ape)), brier1: mean(days.map(d => d.brier)), coverage1: mean(days.map(d => d.coverage)), origins: days.length};
}

/** 블록 부트스트랩: 기준일 블록(20일)을 복원 추출해 「B 맞힘률 − A 맞힘률」 분포를 본다 */
export function bootstrapHitDiff(daysA, daysB, {blockLength = 20, resamples = 2000, seed = 20260929} = {}) {
  if (daysA.length !== daysB.length || !daysA.length || daysA.some((d, k) => d.date !== daysB[k].date)) throw Error('TRIAL_BOOTSTRAP_INPUT');
  const nb = Math.ceil(daysA.length / blockLength);
  let s = seed >>> 0; const rnd = () => { s = (Math.imul(1664525, s) + 1013904223) >>> 0; return s / 4294967296; };
  const rate = (days, idx) => { let r = 0, w = 0; for (const j of idx) { r += days[j].right; w += days[j].wrong; } return r + w ? r / (r + w) : 0; };
  let better = 0; const diffs = [];
  for (let k = 0; k < resamples; k++) {
    const idx = []; for (let b = 0; b < nb; b++) { const start = Math.floor(rnd() * nb) * blockLength; for (let j = start; j < Math.min(start + blockLength, daysA.length); j++) idx.push(j); }
    const d = rate(daysB, idx) - rate(daysA, idx); diffs.push(d); if (d > 0) better++;
  }
  diffs.sort((a, b) => a - b);
  return {method: 'block_bootstrap_over_origin_days', blockLength, resamples, seed, probabilityBBetter: better / resamples, ci90: [diffs[Math.floor(resamples * 0.05)], diffs[Math.floor(resamples * 0.95)]]};
}

/** 미리 정한 통과 규칙(protocol.adoption)을 그대로 적용한다 — 숫자만 넣으면 결과가 정해진다 */
export function judge(A, B, protocol) {
  const rule = protocol.adoption, a = A.summary, b = B.summary, reasons = [];
  const byBlock = A.byBlock.map((x, i) => ({block: x.block, hitA: x.hitRate, hitB: B.byBlock[i].hitRate, better: B.byBlock[i].hitRate > x.hitRate}));
  const boot = bootstrapHitDiff(A.days, B.days, rule.uncertainty);
  const gates = {
    hitRate: {passed: b.hitRate > a.hitRate, A: a.hitRate, B: b.hitRate, rule: rule.primary},
    blocks: {passed: byBlock.filter(x => x.better).length >= rule.uncertainty.minBetterBlocks, better: byBlock.filter(x => x.better).length, of: byBlock.length, rule: `6블록 중 B 가 더 나은 블록 ≥ ${rule.uncertainty.minBetterBlocks}`},
    bootstrap: {passed: boot.probabilityBBetter >= rule.uncertainty.minProbability, ...boot, rule: `P(B 맞힘률 > A) ≥ ${rule.uncertainty.minProbability}`},
    priceError: {passed: b.ape1 <= a.ape1, A: a.ape1, B: b.ape1, rule: rule.guards.priceError},
    brier: {passed: b.brier1 <= a.brier1 + rule.guards.brierTolerance, A: a.brier1, B: b.brier1, rule: rule.guards.brier},
    coverage: {passed: (b.coverage1 >= 0.70 && b.coverage1 <= 0.90) || Math.abs(b.coverage1 - 0.8) <= Math.abs(a.coverage1 - 0.8) + 0.03, A: a.coverage1, B: b.coverage1, rule: rule.guards.coverage},
  };
  for (const [k, g] of Object.entries(gates)) if (!g.passed) reasons.push(k);
  const passed = reasons.length === 0;
  return {passed, decision: passed ? 'shadow_observation' : 'not_adopted', failed: reasons, gates, byBlock};
}

export function blockSummary(days, blocks = 6) {
  return Array.from({length: blocks}, (_, k) => { const rows = days.filter(d => d.block === k + 1), s = summarizeDays(rows); return {block: k + 1, first: rows[0]?.date ?? null, last: rows.at(-1)?.date ?? null, ...s}; });
}
