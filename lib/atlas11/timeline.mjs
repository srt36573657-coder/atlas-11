/**
 * ATLAS 11 · 「진화」 칸 자료 — 질문 하나에 답한다: 「ATLAS는 시장의 답을 받아들여 나아졌는가?」
 *
 * 근거는 기록 장부 하나(reports/atlas11/ledger). 평가 규칙·채택 문턱·후보 목록·검증 기간은 설정 파일에서 읽기만 한다.
 * 잣대(보여 주기용 — 채택 판정에는 쓰지 않는다): 같은 거리끼리(1일 뒤는 1일 뒤끼리)
 *   덜 틀린 정도(%) = (1 − ATLAS 평균 가격 오차율 ÷ 「오늘 값 그대로」 평균 가격 오차율) × 100
 *   「오늘 값 그대로」 = 예측을 낸 날의 종가(출발가)가 그대로 간다고 본 예측.
 *   가격 오차율 = |예측 − 실제| ÷ 실제 × 100 — ATLAS 채점(ape)과 같은 식이라 둘을 나란히 놓을 수 있다.
 * 진화 = 시장 결과로 식·요인·무게가 바뀐 것(모델 기록의 채택·되돌림). 공사 = 사람이 고친 장치(운영 기록 kind: construction). 둘을 섞지 않는다.
 * 대표 셀 = 같은 (종목·기간)은 가장 먼저 발행된 실시간 발행본 하나 — 성적 화면·일일 총괄과 같은 규칙(겹쳐 세지 않음).
 */
import {generateCandidates} from './evolve/models.mjs';

const finite = x => typeof x === 'number' && Number.isFinite(x);
const mean = xs => xs.length ? xs.reduce((s, x) => s + x, 0) / xs.length : null;
const rnd = (x, d = 4) => finite(x) ? Number(x.toFixed(d)) : null;
const korDate = d => `${Number(d.slice(5, 7))}월 ${Number(d.slice(8, 10))}일`;
const pp = (x, d = 2) => `${Math.abs(x).toFixed(d)}%p`;
/** 글 속 2026-09-17 꼴 날짜를 「9월 17일」로 — 화면 글은 쉬운 말로 */
const kdates = s => String(s ?? '').replace(/\b(\d{4})-(\d{2})-(\d{2})\b/g, (_, y, m, d) => `${Number(m)}월 ${Number(d)}일`);

export const TIMELINE_SCHEMA = 'atlas11-view-timeline-1';
export const CLASS_WORDS = {1: '둘 다 맞음', 2: '방향만 맞음', 3: '크기만 맞음', 4: '둘 다 틀림'};
export const CAUSE_WORDS = {'업종 변화': '업종 흐름', '변동성·범위': '흔들림이 범위를 넘음', '시장 상태': '시장 전체 분위기', '기업 사건': '기업 공시·사건', '수급': '큰손 매매(수급)', '자료 오류': '자료 오류', '미설명': '설명 못 함'};
export const GATE_WORDS = {leakage: '미래 자료 섞임 검사', dataQuality: '같은 자료로 비교했는지', direction: '20일 방향 정답률', coverage: '80% 범위 담김', interval: '범위 점수', brier: '확률 점수'};
export const FAMILY_WORDS = {penalty: '가중치 크기', features: '요인 고르기', volatility: '흔들림 계산', regime: '시장 상태 넣기', sector: '업종 흐름 넣기'};
// 관문 문턱 — lib/atlas11/evolve/promote.mjs compareBacktests 와 같은 값(설정 파일 adoption.gates 의 규칙 글). 여기서는 「얼마 모자랐나」를 보이는 데만 쓴다.
const GATE_LIMITS = {directionSlack: 0.01, coverageLow: 0.70, coverageHigh: 0.90, coverageSlack: 0.03, intervalRatio: 1.02, brierSlack: 0.01, probability: 0.8, blocks: 4};

export const naiveAPE = c => Math.abs(c.anchor - c.actual) / c.actual * 100;
const usable = c => c.kind === 'live' && c.evaluable !== false && finite(c.ape) && finite(c.anchor) && finite(c.actual) && c.actual > 0;

/** 대표 셀: 목표일이 date 인 실시간 셀 가운데 (종목·기간)마다 가장 먼저 발행된 것 하나 */
export function headlineCells(cells, date) {
  const first = new Map();
  for (const c of cells.filter(c => usable(c) && c.targetDate === date).sort((x, y) => Date.parse(x.issuedAt) - Date.parse(y.issuedAt) || String(x.forecastId).localeCompare(String(y.forecastId)))) {
    const k = c.code + '|' + c.horizon; if (!first.has(k)) first.set(k, c);
  }
  return [...first.values()];
}

/** 같은 거리 셀 묶음의 세 숫자와 잣대 */
export function distanceStats(cells) {
  if (!cells.length) return null;
  const atlas = mean(cells.map(c => c.ape)), naive = mean(cells.map(naiveAPE));
  const hits = cells.filter(c => c.directionCorrect === true).length, band = cells.filter(c => typeof c.covered === 'boolean'), covered = band.filter(c => c.covered).length;
  return {n: cells.length, atlasAPE: rnd(atlas), naiveAPE: rnd(naive), lessWrongPct: naive > 0 ? rnd((1 - atlas / naive) * 100, 2) : null,
    directionHits: hits, directionRate: rnd(hits / cells.length), coinFlip: 0.5, coverage: band.length ? rnd(covered / band.length) : null, coverageTarget: 0.8};
}

/** 떨어진 후보가 문턱까지 얼마 모자랐나 — 기록된 관문 결과(참·거짓)가 기준이고, 숫자는 모자란 크기를 보이는 데만 쓴다 */
export function thresholdGaps(exp) {
  const b = exp.before ?? {}, a = exp.after ?? {}, f = exp.four ?? {}, u = exp.uncertainty ?? null, g = exp.gates ?? {}, L = GATE_LIMITS, out = [];
  if (finite(f.candidateErrorPct) && !(f.candidateErrorPct < f.operatingErrorPct)) out.push({key: 'error', text: `평균 가격 오차가 지금보다 ${pp(f.candidateErrorPct - f.operatingErrorPct, 3)} 큼(작아야 함)`});
  if (finite(f.candidateRankHits) && !(f.candidateRankHits >= f.operatingRankHits)) out.push({key: 'rank', text: `20일 뒤 상위 5 맞힘이 ${f.operatingRankHits - f.candidateRankHits}개 모자람(${f.candidateRankHits} < ${f.operatingRankHits})`});
  for (const [k, passed] of Object.entries(g)) {
    if (passed !== false) continue;
    let text = `${GATE_WORDS[k] ?? k} 통과 못 함`;
    if (k === 'direction' && finite(a.dir20) && finite(b.dir20)) text = `20일 방향 정답률이 문턱보다 ${pp((b.dir20 - L.directionSlack - a.dir20) * 100)} 모자람(${(a.dir20 * 100).toFixed(2)}% < ${((b.dir20 - L.directionSlack) * 100).toFixed(2)}%)`;
    else if (k === 'coverage' && finite(a.cov20)) text = `80% 범위 담김 ${(a.cov20 * 100).toFixed(1)}%가 기준(70~90%, 지금보다 80%에서 멀어지지 않기) 밖`;
    else if (k === 'interval' && finite(a.interval20) && finite(b.interval20)) text = `범위 점수가 문턱보다 ${((a.interval20 / (b.interval20 * L.intervalRatio) - 1) * 100).toFixed(1)}% 큼`;
    else if (k === 'brier' && finite(a.brier20) && finite(b.brier20)) text = `확률 점수가 문턱보다 ${(a.brier20 - b.brier20 - L.brierSlack).toFixed(4)} 큼`;
    out.push({key: k, text});
  }
  if (u && finite(u.probabilityCandidateBetter) && !(u.probabilityCandidateBetter >= L.probability && u.blocksBetter >= L.blocks)) {
    const parts = []; if (u.probabilityCandidateBetter < L.probability) parts.push(`더 낫다는 확률 ${Math.round(u.probabilityCandidateBetter * 100)}%(필요 ${L.probability * 100}%)`); if (u.blocksBetter < L.blocks) parts.push(`나은 구간 ${u.blocksBetter}/6(필요 ${L.blocks})`);
    out.push({key: 'uncertainty', text: parts.join(' · ')});
  }
  return out;
}

/** 기록된 관문 결과가 숫자와 맞는지(검사용) — 숫자로 다시 판정해 기록과 같은지 본다 */
export function recomputeGates(exp) {
  const b = exp.before ?? {}, a = exp.after ?? {}, L = GATE_LIMITS;
  return {direction: a.dir20 >= b.dir20 - L.directionSlack, coverage: a.cov20 >= L.coverageLow && a.cov20 <= L.coverageHigh && Math.abs(a.cov20 - 0.8) <= Math.abs(b.cov20 - 0.8) + L.coverageSlack, interval: a.interval20 <= b.interval20 * L.intervalRatio, brier: a.brier20 <= b.brier20 + L.brierSlack};
}

const causeWord = c => CAUSE_WORDS[c] ?? c;

/**
 * @param scores 채점 기록 본문(현재 것) · analyses 원인 분석 기록 본문 · experiments/operations/models 기록(현재 것, at·dateKST 포함)
 * @param config 진화 설정(config/atlas11/evolution.v1.json) · sessions 거래일 달력 · actualAsOf 자료 기준일
 */
export function buildTimeline({scores = [], analyses = [], experiments = [], operations = [], models = [], config, sessions = [], actualAsOf, forecastId = null, issuedAt = null, now = new Date().toISOString()}) {
  const required = config?.liveObservation?.minScoredDates ?? 10;
  const publishEnd = config?.schedule?.publishEnd ?? null, trainingBefore = config?.validation?.trainingBefore ?? null;
  const scoredDates = [...new Set(scores.filter(usable).map(c => c.targetDate))].filter(d => !actualAsOf || d <= actualAsOf).sort();
  const firstScored = scoredDates[0] ?? null;
  // 첫 채점일부터 기준일까지의 거래일은 하루도 빼지 않는다(채점 기록이 없으면 「기록 없음」으로)
  const daySpan = firstScored ? sessions.filter(s => s >= firstScored && s <= (actualAsOf ?? scoredDates.at(-1))) : [];
  const constructions = operations.filter(r => r.body?.kind === 'construction').map(r => ({id: r.id, date: r.body.date ?? r.dateKST, title: r.body.title, heard: r.body.heard, sources: r.body.sources ?? {}, recordedAt: r.at, recordedLater: r.body.recordedLater === true})).sort((x, y) => x.date.localeCompare(y.date) || String(x.recordedAt).localeCompare(String(y.recordedAt)));
  const aggregateFor = date => analyses.filter(a => a.kind === 'daily_aggregate' && a.date === date).at(-1) ?? null;
  const expOn = date => experiments.filter(r => r.dateKST === date).map(r => r.body);
  const modelOn = date => models.filter(r => r.dateKST === date).map(r => r.body);
  const allCandidates = config ? generateCandidates(config) : [];
  const days = [], h1All = [];
  for (const date of daySpan) {
    const cells = headlineCells(scores, date);
    const exps = expOn(date), backtests = exps.filter(e => e.kind === 'backtest'), noTest = exps.find(e => e.kind === 'no_test') ?? null, failed = exps.filter(e => e.kind === 'backtest_failed');
    const mods = modelOn(date), adoptions = mods.filter(m => m.kind === 'adoption'), rollbacks = mods.filter(m => m.kind === 'rollback');
    const run = operations.filter(r => r.dateKST === date && r.body?.kind === 'daily_run').at(-1)?.body ?? null;
    const built = constructions.filter(c => c.date === date).map(c => c.id);
    if (!cells.length) { days.push({date, scored: false, line: {answer: '그날 채점 기록 없음', learned: '—', changed: backtests.length ? `시험 ${backtests.length}개` : '—'}, constructions: built}); continue; }
    const byDistance = {}; for (const k of [...new Set(cells.map(c => c.horizon))].sort((a, b) => a - b)) byDistance[k] = distanceStats(cells.filter(c => c.horizon === k));
    h1All.push(...cells.filter(c => c.horizon === 1));
    const classes = {1: 0, 2: 0, 3: 0, 4: 0}; for (const c of cells) if (classes[c.class] != null) classes[c.class]++;
    // 배운 것 — 원인 분석 총괄(가설과 사실을 가른다)
    const ag = aggregateFor(date), causes = Object.entries(ag?.causeCounts ?? {}).filter(([k]) => k !== '미설명').sort((a, b) => b[1] - a[1]).map(([cause, n]) => ({cause, word: causeWord(cause), cells: n}));
    const unexplainedCells = ag?.causeCounts?.['미설명'] ?? 0;
    const market = ag?.market ? {avgChangePct: rnd(ag.market.basketReturn * 100, 2), up: ag.market.up, down: ag.market.down, flat: ag.market.flat} : null;
    const facts = []; if (market) facts.push(`그날 52종목 평균 ${market.avgChangePct > 0 ? '+' : ''}${market.avgChangePct.toFixed(2)}% · 오른 종목 ${market.up} · 내린 종목 ${market.down}`);
    if (ag?.topMovers?.length) facts.push('가장 크게 움직인 종목: ' + ag.topMovers.slice(0, 3).map(m => `${m.name} ${m.change > 0 ? '+' : ''}${(m.change * 100).toFixed(1)}%`).join(' · '));
    // 바꾼 것 — 시험·채택·되돌림
    const rejected = backtests.filter(e => e.decision === 'rejected'), observing = backtests.filter(e => e.decision === 'observing');
    const candidates = backtests.map(e => ({candidateId: e.candidateId, label: e.label, family: e.family, familyWord: FAMILY_WORDS[e.family] ?? e.family, decision: e.decision, status: e.status, errorPct: rnd(e.four?.candidateErrorPct), operatingErrorPct: rnd(e.four?.operatingErrorPct), rankHits: e.four?.candidateRankHits ?? null, operatingRankHits: e.four?.operatingRankHits ?? null, probabilityBetter: e.uncertainty?.probabilityCandidateBetter ?? null, blocksBetter: e.uncertainty?.blocksBetter ?? null, unmet: e.decision === 'rejected' ? thresholdGaps(e) : []}));
    const fewest = candidates.filter(c => c.decision === 'rejected').reduce((m, c) => Math.min(m, c.unmet.length), Infinity);
    const nearMisses = candidates.filter(c => c.decision === 'rejected' && c.unmet.length === fewest).sort((x, y) => x.errorPct - y.errorPct);
    let noTestReason = null;
    if (!backtests.length && !adoptions.length && !rollbacks.length) {
      if (noTest) noTestReason = kdates(noTest.reason);
      else {
        // 장부에 「시험 없음」 줄이 없던 날(2026-09-30 이전 방식): 그날 전까지 판정된 후보 수로 까닭을 되짚는다
        const decidedBefore = new Set(experiments.filter(r => r.dateKST < date && r.body?.kind === 'backtest' && ['rejected', 'observing'].includes(r.body.decision)).map(r => r.body.candidateId));
        const open = allCandidates.filter(c => !decidedBefore.has(c.id)).length;
        noTestReason = run?.evolution?.backtested === 0 && open === 0 ? `새로 시험할 후보 없음 — 후보 ${allCandidates.length}개가 그 전에 모두 판정됨 · 검증 기간은 ${kdates(trainingBefore)} 이전으로 고정(실행 기록의 「검증 0」과 실험 장부로 되짚음)` : run ? `그날 실행에서 검증한 후보 없음(실행 기록: 검증 ${run.evolution?.backtested ?? '—'})` : '그날 실행 기록 없음';
      }
    }
    const h1 = byDistance[1] ?? Object.values(byDistance)[0];
    const lw = h1?.lessWrongPct;
    const changedText = adoptions.length ? `바꿈 · 채택 ${adoptions.length}` : rollbacks.length ? `되돌림 ${rollbacks.length}` : backtests.length ? `안 바꿈 · ${backtests.length}개 시험, ${rejected.length === backtests.length ? '모두 떨어짐' : `떨어짐 ${rejected.length} · 관찰 ${observing.length}`}` : '안 바꿈 · 시험할 것 없음';
    days.push({date, scored: true, evaluated: cells.length, classes, byDistance,
      answer: {facts, market},
      learned: {hypotheses: causes, unexplainedCells, unexplainedMeanShare: rnd(ag?.unexplainedMeanShare ?? null), note: '원인 판정이 아니라 가설이다 — 같은 기간의 사실(시장·업종·공시·수급)과 오차를 나란히 놓은 것', analysisRecorded: Boolean(ag)},
      changed: {tested: backtests.length, rejected: rejected.length, observing: observing.length, failed: failed.length, adopted: adoptions.length, rolledBack: rollbacks.length, candidates, nearMisses: nearMisses.map(c => ({label: c.label, familyWord: c.familyWord, unmet: c.unmet})), noTestReason, adoptionsDetail: adoptions.map(a => ({modelVersion: a.modelVersion, from: a.from, candidateId: a.candidateId})), rollbacksDetail: rollbacks.map(x => ({from: x.from, to: x.to, reason: x.reason}))},
      constructions: built,
      line: {
        answer: h1 ? `${h1 === byDistance[1] ? '1일 뒤' : '가장 가까운 거리'} ${h1.n}종목 · 방향 ${h1.directionHits}개 맞힘 · 「오늘 값 그대로」보다 ${finite(lw) ? `${Math.abs(lw).toFixed(1)}% ${lw >= 0 ? '덜' : '더'} 틀림` : '비교 불가'}` : '채점 없음',
        learned: ag ? [...causes.slice(0, 2).map(c => `${c.word} ${c.cells}칸`), `설명 못 함 ${unexplainedCells}칸`].join(' · ') : '원인 분석 기록 없음',
        changed: changedText}});
  }
  // 판정 — 1일 뒤 채점일이 설정의 최소 채점일(실전 관찰 기준) 이상일 때만
  const h1Days = days.filter(d => d.scored && d.byDistance?.[1]);
  const pooled = distanceStats(h1All);
  const firstJudgementDate = firstScored ? sessions.filter(s => s >= firstScored)[required - 1] ?? null : null;
  const daily = h1Days.map(d => d.byDistance[1].lessWrongPct).filter(finite);
  let verdict;
  if (h1Days.length < required) verdict = {key: 'too_early', word: '아직 모름', rule: `1일 뒤 채점 ${required}일부터 판정(설정 파일의 실전 관찰 최소 채점일)`};
  else {
    const m = mean(daily), sd = Math.sqrt(daily.reduce((s, x) => s + (x - m) ** 2, 0) / Math.max(1, daily.length - 1)), t = sd > 0 ? m / (sd / Math.sqrt(daily.length)) : 0;
    verdict = {key: t >= 2 ? 'better' : t <= -2 ? 'worse' : 'same', word: t >= 2 ? '「오늘 값 그대로」보다 낫다' : t <= -2 ? '「오늘 값 그대로」보다 못하다' : '차이를 가를 수 없다', meanDailyPct: rnd(m, 2), t: rnd(t, 2), rule: '날마다의 「덜 틀린 정도」 평균이 날마다 흔들리는 폭의 2배(평균의 표준오차 ×2)를 넘을 때만 낫다·못하다 — 보여 주기용 규칙'};
  }
  const adoptedTotal = models.filter(r => r.body?.kind === 'adoption').length, rolledTotal = models.filter(r => r.body?.kind === 'rollback').length;
  const testedIds = new Set(experiments.filter(r => r.body?.kind === 'backtest').map(r => r.body.candidateId));
  const decided = new Map(); for (const r of experiments.filter(r => r.body?.kind === 'backtest').sort((x, y) => String(x.at).localeCompare(String(y.at)))) decided.set(r.body.candidateId, {decision: r.body.decision, date: r.dateKST});
  const rejectedTotal = [...decided.values()].filter(x => x.decision === 'rejected').length, observingNow = [...decided.values()].filter(x => x.decision === 'observing').length;
  const openCandidates = allCandidates.filter(c => !decided.has(c.id)).length;
  const lastDecision = [...decided.values()].map(x => x.date).sort().at(-1) ?? null;
  const changesTotal = adoptedTotal + rolledTotal;
  // 결론 한 문장 · 표본 · 막힘 한 가지
  const lwAll = pooled?.lessWrongPct;
  const skillLine = pooled ? `지금까지 ${h1Days.length}일을 합치면 1일 뒤 예측은 「오늘 값 그대로」보다 ${Math.abs(lwAll).toFixed(1)}% ${lwAll >= 0 ? '덜' : '더'} 틀렸습니다${verdict.key === 'too_early' ? ` — ${h1Days.length}일치라 아직 좋다 나쁘다 말할 수 없습니다` : ''}` : '아직 채점한 날이 없습니다';
  const judgeText = verdict.key === 'too_early' ? `예측 실력 판정은 채점 ${required}일째인 ${firstJudgementDate ? korDate(firstJudgementDate) : '—'}부터입니다` : `예측 실력 판정: ${verdict.word}`;
  // 결론은 짧게: 바뀐 것(진화)과 실력 판정 두 가지만 — 숫자 덩어리는 그림 쪽으로
  const headline = changesTotal === 0
    ? {word: '아직입니다', sentence: `시장의 답으로 바뀐 것은 0건입니다. ${judgeText}.`, skillLine}
    : {word: `${changesTotal}번 바뀌었습니다`, sentence: `시장의 답으로 채택 ${adoptedTotal}건 · 되돌림 ${rolledTotal}건이 있었습니다. ${judgeText}.`, skillLine};
  const sample = {scoredDays: h1Days.length, requiredDays: required, cellsDistance1: pooled?.n ?? 0, cellsAll: days.reduce((s, d) => s + (d.evaluated ?? 0), 0), note: '52종목은 같은 시장 안에서 함께 움직여 독립된 시험 52번이 아니다 — 그래서 판정은 종목 수가 아니라 날짜 수로 센다'};
  let blocker = null;
  if (config && openCandidates === 0 && observingNow === 0 && changesTotal === 0) blocker = {key: 'no_candidates', line: '새로 시험할 고칠 거리가 없습니다',
    detail: [`고칠 거리 ${allCandidates.length}개가 ${lastDecision ? korDate(lastDecision) : '이미'} 모두 판정됐습니다(떨어짐 ${rejectedTotal} · 실전 관찰 ${observingNow}).`, `시험 기간이 ${kdates(trainingBefore)} 이전으로 묶여 있어, 그 뒤에 온 시장의 답은 시험에 들어가지 않습니다.`, '그래서 지금 구조로는 날짜가 지나도 바뀔 것이 없습니다.', '풀려면 설정 새 판(시험 기간을 앞으로 옮기거나 새 고칠 거리를 더함)이 필요합니다. 평가 규칙을 바꾸는 일이라 사장님 결정이 필요합니다.'], needsOwnerDecision: true};
  else if (h1Days.length < required) blocker = {key: 'too_few_days', line: `채점한 날이 모자랍니다(${h1Days.length}/${required}일)`, detail: [firstJudgementDate ? `판정일: ${korDate(firstJudgementDate)}(1일 뒤 채점 ${required}일째)` : `판정: 1일 뒤 채점 ${required}일부터`], needsOwnerDecision: false};
  // 그림 — 첫 공사일(또는 첫 채점일)부터 발행 종료일까지의 거래일 축
  const from = [constructions[0]?.date, firstScored].filter(Boolean).sort()[0] ?? actualAsOf;
  const to = publishEnd && publishEnd > (actualAsOf ?? '') ? publishEnd : actualAsOf;
  const axis = sessions.filter(s => s >= from && s <= to);
  // 지금까지 합친 값 — 첫날부터 그날까지의 1일 뒤 대표 셀을 모두 합쳐 낸 덜 틀린 정도(결론 문장의 숫자와 같은 식 · 마지막 점 = 결론 숫자)
  const cumulative = []; { let sa = 0, sn = 0, n = 0; for (const d of h1Days) { const cells = h1All.filter(c => c.targetDate === d.date); for (const c of cells) { sa += c.ape; sn += naiveAPE(c); n++; } cumulative.push({date: d.date, lessWrongPct: sn > 0 ? rnd((1 - sa / sn) * 100, 2) : null, n}); } }
  const chart = {from, to, sessions: axis, today: actualAsOf, judgementDate: firstJudgementDate, distance: 1,
    points: h1Days.map(d => ({date: d.date, lessWrongPct: d.byDistance[1].lessWrongPct, n: d.byDistance[1].n})), cumulative,
    tests: days.filter(d => d.scored && d.changed.tested > 0 && d.changed.adopted === 0 && d.changed.rolledBack === 0).map(d => ({date: d.date, tested: d.changed.tested, rejected: d.changed.rejected})),
    changes: days.filter(d => d.scored && (d.changed.adopted || d.changed.rolledBack)).map(d => ({date: d.date, adopted: d.changed.adopted, rolledBack: d.changed.rolledBack})),
    constructions: [...new Set(constructions.map(c => c.date))].map(date => ({date, count: constructions.filter(c => c.date === date).length}))};
  return {schema: TIMELINE_SCHEMA, forecastId, issuedAt, actualAsOf, generatedAt: now,
    question: 'ATLAS는 시장의 답을 받아들여 나아졌는가?', promise: '처음 보는 사람도 5초 안에 그 답을 안다',
    headline, sample, blocker, verdict,
    metric: {name: '「오늘 값 그대로」보다 덜 틀린 정도', distance: '같은 거리끼리(그림은 1일 뒤)', formula: '(1 − ATLAS 평균 가격 오차율 ÷ 「오늘 값 그대로」 평균 가격 오차율) × 100', naive: '예측을 낸 날의 종가가 그대로 간다고 본 예측', use: '보여 주기용 — 채택 판정에는 쓰지 않는다(채택은 고정된 규칙으로만)', pooled},
    changes: {adopted: adoptedTotal, rolledBack: rolledTotal, tested: testedIds.size, rejected: rejectedTotal, observing: observingNow, openCandidates, candidatesTotal: allCandidates.length, trainingBefore},
    chart, days: days.slice().reverse(), constructions,
    sources: {ledger: 'reports/atlas11/ledger/{score,analysis,experiment,model,operation}/*.jsonl', config: 'config/atlas11/evolution.v1.json', headlineRule: '같은 종목·목표일·기간은 가장 먼저 발행된 실시간 발행본 하나'}};
}
