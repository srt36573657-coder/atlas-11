// 「진화」 칸 사실표(timeline) · 따로 센 검산 · 일부러 틀린 숫자를 검산이 잡는지
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import {buildTimeline, headlineCells, distanceStats, thresholdGaps, recomputeGates, naiveAPE} from '../../lib/atlas11/timeline.mjs';
import {recountTimeline, compareTimeline} from '../../lib/atlas11/timeline_check.mjs';

const fx = JSON.parse(await fs.readFile(path.join(import.meta.dirname, 'fixtures/timeline/ledger-20260930.json'), 'utf8'));
const build = () => buildTimeline({scores: fx.scores, analyses: fx.analyses, experiments: fx.experiments, operations: fx.operations, models: fx.models, config: fx.config, sessions: fx.sessions, actualAsOf: fx.actualAsOf, forecastId: 'fx', issuedAt: '2026-09-30T08:22:04Z', now: '2026-09-30T15:00:00Z'});
const recount = () => recountTimeline({scoreBodies: fx.scores, experimentRecords: fx.experiments, operationRecords: fx.operations, modelRecords: fx.models, sessions: fx.sessions, actualAsOf: fx.actualAsOf, minScoredDates: fx.config.liveObservation.minScoredDates});

test('대표 셀: 같은 (종목·기간)은 가장 먼저 발행된 실시간 발행본 하나 · 참조 발행본은 빼고 · 「발행일 종가 그대로」 오차는 출발가 기준', () => {
  const cells = headlineCells(fx.scores, '2026-09-29');
  assert.equal(cells.length, 52, '9/29 는 1일 뒤 52칸(같은 날 세 발행본을 겹쳐 세지 않음)');
  assert.ok(cells.every(c => c.kind === 'live' && c.forecastId.startsWith('2026-09-28-rolling20')), '가장 먼저 발행된 것(09:39Z)');
  assert.equal(headlineCells(fx.scores, '2026-09-30').length, 104, '9/30 은 1일 뒤 52 + 2일 뒤 52');
  const c = {anchor: 100, actual: 104}; assert.equal(naiveAPE(c), 4 / 104 * 100);
});

test('잣대: 덜 틀린 정도 = (1 − ATLAS 평균 오차 ÷ 「발행일 종가 그대로」 평균 오차) × 100 — 손으로 푼 값과 같다', () => {
  const cells = [{ape: 1, anchor: 100, actual: 102, directionCorrect: true, covered: true}, {ape: 3, anchor: 100, actual: 96, directionCorrect: false, covered: false}];
  const s = distanceStats(cells); const naive = (2 / 102 * 100 + 4 / 96 * 100) / 2;
  assert.equal(s.lessWrongPct, Number(((1 - 2 / naive) * 100).toFixed(2)));
  assert.equal(s.directionHits, 1); assert.equal(s.coverage, 0.5); assert.equal(s.n, 2);
});

test('9/30 밤 실제 장부: 결론 「아직입니다」 · 바뀐 것 0 · 1일 뒤 +4.31%(9/29)·−0.58%(9/30) · 판정일 10/14 · 막힘 = 새로 시험할 후보 없음', () => {
  const t = build();
  assert.equal(t.headline.word, '아직입니다'); assert.equal(t.headline.sentence, '시장의 답으로 바뀐 것은 0건입니다. 예측 실력 판정은 채점 10일째인 10월 14일(수)부터입니다.');
  assert.equal(t.sample.scoredDays, 2); assert.equal(t.sample.requiredDays, 10); assert.equal(t.chart.judgementDate, '2026-10-14');
  const d29 = t.days.find(d => d.date === '2026-09-29'), d30 = t.days.find(d => d.date === '2026-09-30');
  assert.equal(d29.byDistance[1].lessWrongPct, 4.31); assert.equal(d30.byDistance[1].lessWrongPct, -0.58); assert.equal(d30.byDistance[2].lessWrongPct, 2.92);
  assert.equal(t.metric.pooled.lessWrongPct, 2.13);
  assert.deepEqual(t.chart.cumulative.map(p => p.lessWrongPct), [4.31, 2.13], '그림의 선 = 첫날부터 그날까지 합친 값 · 마지막 점 = 결론 숫자');
  assert.equal(t.headline.skillLine, '지금까지 2일을 합치면 1일 뒤 예측은 「발행일 종가 그대로」보다 2.13% 덜 틀렸습니다 — 2일치라 아직 좋다 나쁘다 말할 수 없습니다');
  assert.deepEqual([d29.classes[1], d29.classes[2], d29.classes[3], d29.classes[4]], [19, 16, 11, 6], '일일 총괄의 네 갈래와 같다');
  assert.equal(d29.changed.tested, 11); assert.equal(d29.changed.rejected, 11); assert.equal(d30.changed.tested, 0);
  assert.match(d30.changed.noTestReason, /새로 시험할 후보 없음 — 후보 11개가 그 전에 모두 판정됨/);
  assert.equal(t.blocker.key, 'no_candidates'); assert.equal(t.blocker.needsOwnerDecision, true); assert.match(t.blocker.detail.join(' '), /9월 17일\(목\) 이전/);
  assert.equal(t.verdict.key, 'too_early'); assert.equal(t.changes.adopted + t.changes.rolledBack, 0);
  assert.equal(t.constructions.length, 7); assert.ok(t.chart.constructions.some(c => c.date === '2026-09-28'));
  assert.deepEqual(t.days.map(d => d.date), ['2026-09-30', '2026-09-29'], '최근 날짜가 위 · 채점 거래일은 하루도 빼지 않음');
});

test('떨어진 후보가 문턱까지 얼마 모자랐나: 벌점[3,30] 은 20일 방향 정답률 0.11%p · basket20 은 확률 54%(필요 80%) — 기록된 관문 결과와 다시 판정한 결과가 44곳 모두 같다', () => {
  const exps = fx.experiments.filter(r => r.body.kind === 'backtest').map(r => r.body);
  const p330 = thresholdGaps(exps.find(e => e.label === '벌점 [3,30]'));
  assert.equal(p330.length, 1); assert.equal(p330[0].key, 'direction'); assert.match(p330[0].text, /0\.11%p 모자람/);
  const b20 = thresholdGaps(exps.find(e => e.label === '시장 상태 고정 입력 basket20'));
  assert.equal(b20.length, 1); assert.match(b20[0].text, /확률 54%\(필요 80%\)/);
  let same = 0; for (const e of exps) { const g = recomputeGates(e); for (const k of Object.keys(g)) { assert.equal(g[k], e.gates[k], `${e.label} ${k}`); same++; } }
  assert.equal(same, 44);
  const near = build().days.find(d => d.date === '2026-09-29').changed.nearMisses.map(n => n.label).sort();
  assert.deepEqual(near, ['벌점 [3,30]', '시장 상태 고정 입력 basket20']);
});

test('검산: 따로 센 값과 화면 자료가 모두 같다 — 일부러 틀린 숫자 하나를 넣으면 검산이 잡는다', () => {
  const t = build(), rc = recount();
  const ok = compareTimeline(t, rc);
  assert.equal(ok.ok, true, JSON.stringify(ok.mismatches)); assert.ok(ok.checked >= 30);
  // 일부러 틀린 숫자: 9/30 1일 뒤 덜 틀린 정도를 −0.58 → +0.58 로 바꾼다(화면의 점은 그대로)
  const bad = structuredClone(t); bad.days.find(d => d.date === '2026-09-30').byDistance[1].lessWrongPct = 0.58;
  const caught = compareTimeline(bad, rc);
  assert.equal(caught.ok, false); assert.deepEqual(caught.mismatches.map(m => m.field), ['2026-09-30 덜 틀린 정도']);
  // 그림의 점만 틀려도 잡는다
  const bad2 = structuredClone(t); bad2.chart.points[0].lessWrongPct += 1;
  assert.deepEqual(compareTimeline(bad2, rc).mismatches.map(m => m.field), ['2026-09-29 그림의 점']);
  const bad3 = structuredClone(t); bad3.chart.cumulative.at(-1).lessWrongPct = 1.85;
  assert.deepEqual(compareTimeline(bad3, rc).mismatches.map(m => m.field), ['2026-09-30 지금까지 합친 값'], '합친 값을 단순 평균(1.85)으로 잘못 적어도 잡는다');
});
