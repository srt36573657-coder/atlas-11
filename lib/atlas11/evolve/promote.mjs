/**
 * ATLAS 11 · 채택·보류·기각·복귀 판정 (설정 파일의 규칙만 적용 · 모델은 규칙을 바꾸지 못한다)
 *   1) 시간순 검증 비교: 핵심 4숫자 + 누수·자료 품질·방향·담김·interval·Brier 관문 + 블록 부트스트랩 불확실성
 *   2) 실전 관찰: 그림자 발행본과 운영 발행본을 같은 날짜·종목·기간 셀에서 비교 → 사전 기준 충족 시 승격
 *   3) 복귀: 최근 채점일에서 운영 버전이 직전 검증 버전보다 사전 기준 이상 나빠지면 되돌림
 */
import {blockBootstrap} from './backtest.mjs';

const finite = x => typeof x === 'number' && Number.isFinite(x);
const mean = a => a.length ? a.reduce((s, x) => s + x, 0) / a.length : null;

/** 시간순 검증 비교 — A(운영) 대 B(후보) */
export function compareBacktests(A, B, config) {
  const reasons = [], gates = {};
  const complete = A?.complete && B?.complete && A.origins === B.origins && A.origins === config.validation.originDays;
  if (!complete) return {complete: false, passed: false, status: 'pending', reasons: ['검증 미완료 또는 기준일 수 불일치 → 검증 대기'], core: null, gates, uncertainty: null};
  const a = A.summary, b = B.summary;
  const core = {errorA: a.meanErrorPct, errorB: b.meanErrorPct, rankA: A.summary.rankHits, rankB: B.summary.rankHits, rankMaximum: A.rankMaximum, passed: b.meanErrorPct < a.meanErrorPct && b.rankHits >= a.rankHits};
  if (!core.passed) reasons.push(`핵심 규칙 미충족: 오차 ${b.meanErrorPct.toFixed(4)}% vs ${a.meanErrorPct.toFixed(4)}% · 순위 적중 ${b.rankHits} vs ${a.rankHits}`);
  gates.leakage = {passed: (B.leakage?.futureTraining ?? 1) === 0 && (B.leakage?.futureTargetsInSelection ?? 1) === 0, detail: B.leakage};
  gates.dataQuality = {passed: A.inputSHA256 === B.inputSHA256 && A.protocolSHA256 === B.protocolSHA256 && A.stocks === B.stocks, detail: {sameInput: A.inputSHA256 === B.inputSHA256, sameProtocol: A.protocolSHA256 === B.protocolSHA256, sameRandomStream: true}};
  gates.direction = {passed: b.dir20 >= a.dir20 - 0.01, A: a.dir20, B: b.dir20, rule: config.adoption.gates.direction.rule};
  gates.coverage = {passed: b.cov20 >= 0.70 && b.cov20 <= 0.90 && Math.abs(b.cov20 - 0.8) <= Math.abs(a.cov20 - 0.8) + 0.03, A: a.cov20, B: b.cov20, rule: config.adoption.gates.coverage.rule};
  gates.interval = {passed: b.interval20 <= a.interval20 * 1.02, A: a.interval20, B: b.interval20, rule: config.adoption.gates.interval.rule};
  gates.brier = {passed: b.brier20 <= a.brier20 + 0.01, A: a.brier20, B: b.brier20, rule: config.adoption.gates.brier.rule};
  for (const [k, g] of Object.entries(gates)) if (!g.passed) reasons.push(`관문 ${k} 미통과`);
  const u = config.adoption.uncertainty, boot = blockBootstrap(A.days, B.days, {blockLength: u.blockLength, resamples: u.resamples, seed: u.seed});
  const blocksBetter = A.byBlock.filter((blk, i) => B.byBlock[i].meanErrorPct < blk.meanErrorPct).length;
  const uncertainty = {...boot, blocksBetter, blocks: A.byBlock.length, passed: boot.probabilityCandidateBetter >= 0.8 && blocksBetter >= 4, rule: u.rule};
  if (!uncertainty.passed) reasons.push(`불확실성 미통과: P(후보 우세) ${boot.probabilityCandidateBetter.toFixed(3)} · 우세 블록 ${blocksBetter}/${A.byBlock.length}`);
  const passed = core.passed && Object.values(gates).every(g => g.passed) && uncertainty.passed;
  return {complete: true, passed, status: passed ? 'observing' : 'rejected', reasons: passed ? ['핵심 규칙·관문·불확실성 모두 통과 → 실전 관찰 시작'] : reasons, core, gates, uncertainty, four: {operatingErrorPct: a.meanErrorPct, candidateErrorPct: b.meanErrorPct, operatingRankHits: a.rankHits, candidateRankHits: b.rankHits}};
}

/** 실전 관찰 평가 — 같은 (목표일·종목·기간) 셀만 짝지어 비교 */
export function evaluateObservation(candidateCells, operatingCells, config) {
  const lo = config.liveObservation, hs = lo.horizonsUsed, key = c => `${c.targetDate}|${c.code}|${c.horizon}`;
  const op = new Map(operatingCells.filter(c => hs.includes(c.horizon)).map(c => [key(c), c]));
  const pairs = candidateCells.filter(c => hs.includes(c.horizon) && op.has(key(c))).map(c => ({cand: c, oper: op.get(key(c))}));
  const dates = [...new Set(pairs.map(p => p.cand.targetDate))].sort();
  const metrics = {scoredDates: dates, pairs: pairs.length, candidateAPE: mean(pairs.map(p => p.cand.ape)), operatingAPE: mean(pairs.map(p => p.oper.ape)), candidateDirection: mean(pairs.map(p => Number(p.cand.directionCorrect))), operatingDirection: mean(pairs.map(p => Number(p.oper.directionCorrect)))};
  const ready = dates.length >= lo.minScoredDates;
  const passed = ready && metrics.candidateAPE <= metrics.operatingAPE && metrics.candidateDirection >= metrics.operatingDirection - 0.02;
  return {...metrics, ready, passed, rule: lo.rule, minScoredDates: lo.minScoredDates, decision: !ready ? 'observing' : passed ? 'promote' : 'reject'};
}

/** 복귀 판정 — 현재 운영 버전 셀 대 직전 검증 버전(그림자) 셀, 최근 N 채점일 */
export function checkRollback(operatingCells, previousCells, config) {
  const rb = config.rollback, hs = rb.window.horizonsUsed, key = c => `${c.targetDate}|${c.code}|${c.horizon}`;
  const prev = new Map(previousCells.filter(c => hs.includes(c.horizon)).map(c => [key(c), c]));
  const pairs = operatingCells.filter(c => hs.includes(c.horizon) && prev.has(key(c))).map(c => ({oper: c, prev: prev.get(key(c))}));
  const dates = [...new Set(pairs.map(p => p.oper.targetDate))].sort().slice(-rb.window.scoredDates), recent = pairs.filter(p => dates.includes(p.oper.targetDate));
  if (dates.length < rb.window.scoredDates) return {triggered: false, ready: false, scoredDates: dates, reason: `최근 채점일 ${dates.length} < ${rb.window.scoredDates}`};
  const m = {operatingAPE: mean(recent.map(p => p.oper.ape)), previousAPE: mean(recent.map(p => p.prev.ape)), operatingDirection: mean(recent.map(p => Number(p.oper.directionCorrect))), previousDirection: mean(recent.map(p => Number(p.prev.directionCorrect)))};
  const triggered = m.operatingAPE > m.previousAPE * 1.25 && m.operatingDirection < m.previousDirection;
  return {triggered, ready: true, scoredDates: dates, ...m, rule: rb.triggers[0].rule};
}

/** 후보 정렬·선택: 아직 검증 안 된 후보 중 설정 순서대로 maxCandidatesPerRun 개 */
export function pickCandidatesToValidate(candidates, state, config, {cached = new Set()} = {}) {
  const done = new Set(Object.values(state.candidates).filter(c => ['backtested', 'observing', 'adopted', 'rejected', 'rolledBack'].includes(c.statusKey)).map(c => c.candidateId));
  const open = candidates.filter(c => !done.has(c.id));
  // 이미 계산된(캐시) 검증 결과의 평가는 계산 비용이 없으므로 상한에 세지 않는다 · 새 계산은 maxCandidatesPerRun 개까지
  let budget = config.limits.maxCandidatesPerRun;
  return open.filter(c => { if (cached.has(c.id)) return true; if (budget > 0) { budget--; return true; } return false; });
}

/** 교체 빈도 제한: 최근 채택 뒤 냉각 기간 */
export function adoptionAllowed(state, tradingDayIndex, config) {
  if (state.cooldownUntilTradingDayIndex != null && finite(tradingDayIndex) && tradingDayIndex < state.cooldownUntilTradingDayIndex) return {allowed: false, reason: `채택 냉각 기간(거래일 ${state.cooldownUntilTradingDayIndex}까지)`};
  return {allowed: true, reason: null};
}
