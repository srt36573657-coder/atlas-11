import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import {toleranceFor, classify, scoreAllPublications, analyzeCells, aggregateAnalysis, sixSentences} from '../../lib/atlas11/analysis.mjs';
import {appendRecord, readRecords, currentRecords, buildLedgerIndex, recordsToCSV} from '../../lib/atlas11/records.mjs';
import {normalizeSpec, specId, generateCandidates, fitSpecModel, specDesign} from '../../lib/atlas11/evolve/models.mjs';
import {compareBacktests, evaluateObservation, checkRollback, pickCandidatesToValidate} from '../../lib/atlas11/evolve/promote.mjs';
import {replay, appendEvent, readEvents, modelVersionFor} from '../../lib/atlas11/evolve/registry.mjs';
import {buildForecast11} from '../../lib/atlas11/forecast.mjs';
import {pricePanel, examplesFor, fitFactorModel} from '../../lib/factor36.mjs';
import {realInputs, readJSON, root, tempRoot, ISSUED} from './helpers.mjs';

const policy = await readJSON('config/atlas11/scoring-policy.v1.json');
const config = await readJSON('config/atlas11/evolution.v1.json');

test('채점 정책: 결과 보기 전에 고정(첫 채점 전 시각) · 기간별 허용 오차와 보간 · 다섯 분류', () => {
  assert.equal(policy.version, 'v1'); assert.ok(Date.parse(policy.frozenAt) < Date.parse(policy.firstScorableClose), '고정 시각이 첫 채점 마감보다 앞선다');
  assert.deepEqual(policy.priceHitTolerancePct, {1: 1.5, 5: 3.5, 10: 5.5, 20: 8.0});
  assert.equal(toleranceFor(policy, 1), 1.5); assert.equal(toleranceFor(policy, 20), 8); assert.equal(toleranceFor(policy, 3), 1.5 + (3.5 - 1.5) * 2 / 4); assert.equal(toleranceFor(policy, 15), 5.5 + (8 - 5.5) * 5 / 10);
  assert.equal(classify({directionCorrect: true, priceHit: true, evaluable: true}).class, 1); assert.equal(classify({directionCorrect: true, priceHit: false, evaluable: true}).class, 2);
  assert.equal(classify({directionCorrect: false, priceHit: true, evaluable: true}).class, 3); assert.equal(classify({directionCorrect: false, priceHit: false, evaluable: true}).class, 4); assert.equal(classify({evaluable: false}).class, 5);
});

test('채점 셀: 발행 뒤 확정된 목표일만 · 오늘 종가는 확정 증거 있어야 · 정답/오답 양쪽 기록 · 미래 정보 차단', async () => {
  const {input, calendar} = await realInputs(); const p = await readJSON('reports/atlas11/versions/2026-09-28-atlas11-27e1f65cfc167be9.json');
  const before = scoreAllPublications([p], input, {calendar, now: '2026-09-29T02:00:00.000Z', policy});
  assert.equal(before.cells.length, 0); assert.equal(before.pending.length, 1040); assert.ok(before.pending.every(x => x.reason === '목표일 전'));
  // 9/29 종가를 가짜로 넣되(검사용 입력 · 실제 자료 아님) 확정 증거를 붙여 채점되는지 · 증거가 없으면 보류되는지
  const fake = structuredClone(input); const day = '2026-09-29';
  for (const a of fake.assets) { const last = a.prices.at(-1); a.prices.push({date: day, open: last.close, high: last.close * 1.02, low: last.close * 0.98, close: Math.round(last.close * 1.01), volume: 1000, quality: 'single_source', sourceUrl: 'https://fchart.stock.naver.com/test', rawHash: 'a'.repeat(64), observedAt: '2026-09-29T06:35:00.000Z', finalClose: true, finalizedAt: '2026-09-29T06:35:00.000Z', finalitySourceUrl: 'https://fchart.stock.naver.com/test', finalityBasis: 'test fixture'}); }
  fake.actualAsOf = day;
  const scored = scoreAllPublications([p], fake, {calendar, now: '2026-09-29T07:00:00.000Z', policy});
  assert.equal(scored.cells.length, 52, '52종목 D+1 만 채점'); assert.ok(scored.cells.every(c => c.horizon === 1 && c.targetDate === day && c.evaluable));
  const up = scored.cells.filter(c => c.actualDirection === 'up'); assert.equal(up.length, 52, '+1% 이면 전부 상승');
  assert.ok(scored.cells.some(c => c.directionCorrect) && scored.cells.some(c => !c.directionCorrect), '정답과 오답이 모두 기록된다');
  assert.ok(scored.cells.every(c => [1, 2, 3, 4].includes(c.class) && typeof c.ape === 'number' && c.covered !== undefined && c.brier != null && c.intervalScore != null && c.tolerancePct === 1.5));
  // 확정 증거 없이 16:00 전 관측이면 보류
  const noEvidence = structuredClone(fake); for (const a of noEvidence.assets) { const r = a.prices.at(-1); delete r.finalClose; delete r.finalizedAt; delete r.finalitySourceUrl; delete r.finalityBasis; }
  const held = scoreAllPublications([p], noEvidence, {calendar, now: '2026-09-29T06:50:00.000Z', policy});
  assert.equal(held.cells.length, 0); assert.ok(held.pending.filter(x => x.targetDate === day).every(x => x.reason === '오늘 종가 확정 증거 없음'));
  // 원인 분석과 총괄 · 여섯 문장
  const network = await readJSON('public/data/atlas11/view/network.json');
  const analyses = analyzeCells(scored.cells, {publications: [p], input: fake, calendar, network, delta: policy.flatDelta});
  assert.equal(analyses.length, 52); const an = analyses[0];
  assert.ok(Array.isArray(an.facts) && an.facts.length >= 3 && Array.isArray(an.modelContribution) && Array.isArray(an.hypotheses) && Array.isArray(an.unverified), '확인된 사실 / 모형 내부 기여 / 원인 가설 / 미확인');
  const agg = aggregateAnalysis(day, analyses, scored.cells, {input: fake, calendar});
  assert.equal(agg.evaluated, 52); assert.ok(agg.market && agg.byClass && agg.byHorizon[1]);
  const six = sixSentences({date: day, aggregate: agg, counts: scored.counts, experiments: {backtested: 0, operatingVersion: 'atlas11-A-1'}, nextTargets: [{date: '2026-09-30', count: 52, horizons: [1]}], forecast: {forecastId: p.forecastId}});
  assert.equal(Object.keys(six).length, 6); assert.match(six.didWell, /채점 52건/); assert.match(six.marketChange, /52종목 평균/);
});

test('기록 장부: 덧붙이기만 · 같은 내용은 한 번 · 정정은 이전 ID 에 연결 · 색인·CSV', async () => {
  const dir = await tempRoot();
  const r1 = await appendRecord(dir, {type: 'score', at: '2026-09-29T07:00:00.000Z', body: {code: '005930', targetDate: '2026-09-29', horizon: 1, actual: 100, class: 1, classLabel: '방향·크기 모두 맞음'}, links: {forecastId: 'f1'}});
  const r2 = await appendRecord(dir, {type: 'score', at: '2026-09-29T07:05:00.000Z', body: {code: '005930', targetDate: '2026-09-29', horizon: 1, actual: 100, class: 1, classLabel: '방향·크기 모두 맞음'}, links: {forecastId: 'f1'}});
  assert.equal(r2.duplicate, true); assert.equal(r2.record.id, r1.record.id);
  await assert.rejects(appendRecord(dir, {type: 'score', at: '2026-09-29T08:00:00.000Z', body: {code: '005930', actual: 101}, supersedes: r1.record.id}), /CORRECTION/i);
  const r3 = await appendRecord(dir, {type: 'score', at: '2026-09-29T08:00:00.000Z', body: {code: '005930', targetDate: '2026-09-29', horizon: 1, actual: 101, class: 1, classLabel: '방향·크기 모두 맞음'}, links: {forecastId: 'f1'}, supersedes: r1.record.id, correctionReason: '실제 종가 정정(100 → 101)'});
  const all = await readRecords(dir, 'score'); assert.equal(all.length, 2, '이전 기록은 남고 정정본이 추가된다'); assert.equal(currentRecords(all).length, 1); assert.equal(currentRecords(all)[0].id, r3.record.id);
  await assert.rejects(appendRecord(dir, {type: 'unknown', body: {}}), /LEDGER_TYPE/);
  const index = await buildLedgerIndex(dir, {now: '2026-09-29T08:10:00.000Z'});
  assert.equal(index.totals.score, 2); assert.deepEqual(index.dates, ['2026-09-29']); assert.ok(index.files['score/2026-09-29.json'].sha256);
  const csv = recordsToCSV(all); assert.match(csv, /005930/); assert.ok(csv.split(/\r?\n/).length >= 3);
  assert.ok(await fs.stat(path.join(dir, 'public/downloads/atlas11/ledger/score-2026-09-29.csv')));
});

test('후보 명세: 설정에서 한 변수만 바꾼 11개 · 결정적 ID · 운영 A 는 fitFactorModel 과 숫자가 같다 · 후보는 다르다', async () => {
  const cands = generateCandidates(config); assert.equal(cands.length, 11); assert.equal(new Set(cands.map(c => c.id)).size, 11);
  for (const c of cands) { const changed = ['penalties', 'volatility', 'featureMask', 'carry'].filter(k => JSON.stringify(c[k]) !== JSON.stringify(normalizeSpec(config.operating.spec)[k])); assert.equal(changed.length, 1, c.label + ' 한 변수만'); }
  assert.equal(specId({family: 'baseline'}), 'A'); assert.equal(specId({family: 'penalty', penalties: [3, 30]}), 'cand-94bdc0454e5e');
  const {input} = await realInputs(); const panel = pricePanel(input), rows = examplesFor(panel, 0);
  const A = fitSpecModel(rows, normalizeSpec(config.operating.spec)), ref = fitFactorModel(rows);
  assert.deepEqual(A.regression.beta, ref.regression.beta); assert.equal(A.selected.id, ref.selected.id);
  const B = fitSpecModel(rows, normalizeSpec({family: 'penalty', penalties: [3, 30]})); assert.notDeepEqual(B.regression.beta, ref.regression.beta); assert.ok([3, 30, 'zero'].includes(B.selected.lambda));
  const d = specDesign(normalizeSpec({family: 'regime', carry: ['basket20']}), panel, 0, input.assets, rows); assert.equal(d.featureFactors.length, 8); assert.ok(d.rows.every(r => r.x.length === 8)); assert.equal(d.selected[0].current.scenarioMode, 'carry');
});

test('채택 판정: 실제 검증 결과(운영 A vs 11 후보) — 네 숫자·관문·블록 불확실성 · 벌점[3,30]은 네 숫자 통과 뒤 방향 관문에서 기각 · 실전 관찰·복귀 규칙', async () => {
  const A = await readJSON('reports/atlas11/evolve/backtests/A.json'), B = await readJSON('reports/atlas11/evolve/backtests/cand-94bdc0454e5e.json');
  assert.equal(A.summary.meanErrorPct.toFixed(6), '9.310358'); assert.equal(A.summary.rankHits, 86, '앞선 A/B 실행과 같은 숫자(재현)');
  const cmp = compareBacktests(A, B, config);
  assert.equal(cmp.core.passed, true); assert.equal(cmp.gates.direction.passed, false); assert.equal(cmp.status, 'rejected'); assert.ok(cmp.uncertainty.probabilityCandidateBetter > 0.8 && cmp.uncertainty.blocksBetter >= 4);
  const incomplete = compareBacktests(A, {...B, complete: false}, config); assert.equal(incomplete.status, 'pending');
  // 관문을 전부 통과하는 가상의 후보(검사용 · 실제 아님): 오차 −0.2%p · 순위 +5 · 방향·담김·구간·Brier 같거나 나음
  const better = structuredClone(B); better.summary = {...A.summary, meanErrorPct: A.summary.meanErrorPct - 0.2, rankHits: A.summary.rankHits + 5}; better.days = A.days.map(d => ({...d, meanErrorPct: d.meanErrorPct - 0.2})); better.byBlock = A.byBlock.map(b => ({...b, meanErrorPct: b.meanErrorPct - 0.2}));
  const ok = compareBacktests(A, better, config); assert.equal(ok.status, 'observing'); assert.equal(ok.passed, true);
  // 실전 관찰: 같은 셀 짝 · 최소 채점일 전에는 관찰 계속 · 충족하면 승격/기각
  const cell = (d, code, ape, ok2, kind) => ({targetDate: d, code, horizon: 1, ape, directionCorrect: ok2, kind});
  const dates = Array.from({length: 10}, (_, i) => `2026-10-${String(i + 1).padStart(2, '0')}`);
  const oper = dates.flatMap(d => [cell(d, '005930', 2.0, false), cell(d, '000660', 1.0, true)]), cand = dates.flatMap(d => [cell(d, '005930', 1.5, true), cell(d, '000660', 1.0, true)]);
  assert.equal(evaluateObservation(cand.slice(0, 6), oper, config).decision, 'observing');
  assert.equal(evaluateObservation(cand, oper, config).decision, 'promote'); assert.equal(evaluateObservation(oper, cand, config).decision, 'reject');
  // 복귀: 최근 5 채점일에서 현재가 이전보다 1.25배 나쁘고 방향도 낮으면
  const worse = dates.flatMap(d => [cell(d, '005930', 3.0, false), cell(d, '000660', 2.6, false)]);
  assert.equal(checkRollback(worse, cand, config).triggered, true); assert.equal(checkRollback(cand, worse, config).triggered, false); assert.equal(checkRollback(worse.slice(0, 4), cand, config).ready, false);
});

test('등록부: 사건 장부 재생으로 상태 · 채택은 operating 을 바꾸고 이전 버전을 남긴다 · 복귀는 직전 검증 버전으로 · 사건 중복 없음', async () => {
  const dir = await tempRoot();
  const spec = normalizeSpec({family: 'penalty', penalties: [3, 30], label: 't'}), id = specId(spec);
  await appendEvent(dir, {at: '2026-09-29T07:00:00.000Z', type: 'candidate_created', candidateId: id, spec});
  await appendEvent(dir, {at: '2026-09-29T07:01:00.000Z', type: 'backtested', candidateId: id, evidence: {summary: {meanErrorPct: 9.2}}});
  await appendEvent(dir, {at: '2026-09-29T07:02:00.000Z', type: 'observation_started', candidateId: id});
  const dup = await appendEvent(dir, {at: '2026-09-29T07:02:00.000Z', type: 'observation_started', candidateId: id}); assert.equal(dup.duplicate, true);
  let state = replay(await readEvents(dir), config); assert.equal(state.candidates[id].statusKey, 'observing'); assert.equal(state.operating.modelVersion, 'atlas11-A-1');
  const version = modelVersionFor(spec, 2); await appendEvent(dir, {at: '2026-10-15T07:00:00.000Z', type: 'adopted', candidateId: id, modelVersion: version, cooldownUntilTradingDayIndex: 900});
  state = replay(await readEvents(dir), config); assert.equal(state.operating.modelVersion, version); assert.equal(state.previousValidated.modelVersion, 'atlas11-A-1'); assert.equal(state.adoptions.length, 1);
  await appendEvent(dir, {at: '2026-10-22T07:00:00.000Z', type: 'rolled_back', candidateId: id, reason: 'live_degradation', to: {modelVersion: 'atlas11-A-1', specId: 'A', spec: normalizeSpec(config.operating.spec)}});
  state = replay(await readEvents(dir), config); assert.equal(state.operating.modelVersion, 'atlas11-A-1'); assert.equal(state.rollbacks.length, 1); assert.equal(state.candidates[id].statusKey, 'rolledBack');
  const picks = pickCandidatesToValidate(generateCandidates(config), state, config); assert.equal(picks.length, config.limits.maxCandidatesPerRun); assert.ok(!picks.some(c => c.id === id));
});

test('발행본과 모델 명세: 운영 A 명세는 forecastId 를 바꾸지 않는다 · 후보 명세는 다른 ID·모델 버전 · 그림자 발행은 공개 상태가 아니다', async () => {
  const {input, calendar, registry, records} = await realInputs(); const news = await readJSON('public/data/atlas11/news-events.json');
  const base = buildForecast11({input, recordsPayload: records, registry, calendar, issuedAt: ISSUED, paths: 120, implementationSHA256: 'test', futureDays: 20, newsAssets: news.assets});
  const same = buildForecast11({input, recordsPayload: records, registry, calendar, issuedAt: ISSUED, paths: 120, implementationSHA256: 'test', futureDays: 20, newsAssets: news.assets, modelSpec: config.operating.spec, modelVersion: 'atlas11-A-1'});
  assert.equal(same.forecastId, base.forecastId); assert.equal(same.modelVersion, 'atlas11-A-1'); assert.deepEqual(same.assets[0].rows[20].p50, base.assets[0].rows[20].p50);
  const cand = buildForecast11({input, recordsPayload: records, registry, calendar, issuedAt: ISSUED, paths: 120, implementationSHA256: 'test', futureDays: 20, newsAssets: news.assets, modelSpec: {family: 'penalty', penalties: [3, 30]}, modelVersion: 'atlas11-cand-94bdc0454e5e-2'});
  assert.notEqual(cand.forecastId, base.forecastId); assert.equal(cand.modelVersion, 'atlas11-cand-94bdc0454e5e-2'); assert.equal(cand.publicationStatus, 'live_research_forecast'); assert.equal(cand.summary.anchorMatches, 52);
  const shadow = buildForecast11({input, recordsPayload: records, registry, calendar, issuedAt: ISSUED, paths: 120, implementationSHA256: 'test', futureDays: 20, newsAssets: news.assets, modelSpec: {family: 'penalty', penalties: [3, 30]}, modelVersion: 'shadow-cand-94bdc0454e5e', shadow: {candidateId: 'cand-94bdc0454e5e', shadowOf: base.forecastId}});
  assert.equal(shadow.publicationStatus, 'shadow_forecast'); assert.equal(shadow.shadowOf, base.forecastId); assert.notEqual(shadow.forecastId, cand.forecastId);
});
