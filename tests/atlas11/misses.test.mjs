/* ATLAS 11 · 「왜 틀렸나」 네 통 나누기(lib/atlas11/misses.mjs) — 규칙마다 한 칸씩 만들어 통이 맞게 나뉘는지 */
import test from 'node:test';
import assert from 'node:assert/strict';
import {buildMisses, latestCells, MISS_BINS} from '../../lib/atlas11/misses.mjs';

const F = 'F1', D = '2026-09-30';
const row = (code, {pred, obs, p, ok, ret}) => ({code, name: '종목' + code, horizons: {1: {status: 'evaluated', forecastId: F, predictedDirection: pred, observedDirection: obs, probabilities: p, directionCorrect: ok, actualReturn: ret}}});
const cell = (code, {real, mkt, res, share, hyps = [], expected = '0.00', band = '6.0', at = '2026-09-30T08:00:00Z', basket = -0.002}) => ({id: 'a-' + code + at, at, body: {kind: 'cell', horizon: 1, forecastId: F, code, targetDate: D,
  decomposition: {realizedLog: real, marketPartLog: mkt, residualPartLog: res, marketShare: share, basketCumLog: basket}, hypotheses: hyps,
  modelContribution: [`선택 모형의 기대 누적 ${expected}% = 절편 0.00%`], facts: [`방향: … · 80% 띠 담김(폭 ${band}%)`], evidence: {news: {count: 2}, disclosures: {items: []}}}});

test('네 통: 반반 → 시장·업종 흐름 → 놓친 것 → 까닭 모름 순서로 한 통에만', () => {
  const rows = [
    row('A', {pred: 'down', obs: 'up', p: {up: 0.48, flat: 0.03, down: 0.49}, ok: false, ret: 0.01}),     // 반반(차 1%p)
    row('B', {pred: 'up', obs: 'down', p: {up: 0.56, flat: 0.04, down: 0.40}, ok: false, ret: -0.02}),    // 시장 몫 60% 같은 쪽 → 흐름
    row('C', {pred: 'down', obs: 'up', p: {up: 0.40, flat: 0.04, down: 0.56}, ok: false, ret: 0.02}),     // 업종 같은 쪽 → 흐름
    row('D', {pred: 'down', obs: 'up', p: {up: 0.40, flat: 0.04, down: 0.56}, ok: false, ret: 0.01}),     // 기업 일정 + 대조 통과 → 놓친 것
    row('E', {pred: 'down', obs: 'up', p: {up: 0.40, flat: 0.04, down: 0.56}, ok: false, ret: 0.01}),     // 까닭 모름
    row('G', {pred: 'down', obs: 'down', p: {up: 0.40, flat: 0.04, down: 0.56}, ok: true, ret: -0.01}),   // 맞힘(일정 없음)
    row('H', {pred: 'up', obs: 'up', p: {up: 0.56, flat: 0.04, down: 0.40}, ok: true, ret: 0.01}),        // 맞힘(일정 없음)
  ];
  const scoreboard = {byDate: [{date: D, rows}]};
  const recs = [
    cell('A', {real: 0.01, mkt: -0.002, res: 0.012, share: 0.14}),
    cell('B', {real: -0.02, mkt: -0.012, res: -0.008, share: 0.6, expected: '+0.30'}),
    cell('C', {real: 0.02, mkt: -0.002, res: 0.022, share: 0.08, hyps: [{category: '업종 변화', strength: '중', evidence: '같은 묶음 6종목의 고유 몫 평균 +1.50%(같은 부호 6/6)'}]}),
    cell('D', {real: 0.01, mkt: -0.001, res: 0.011, share: 0.08, hyps: [{category: '기업 사건', strength: '약', evidence: '기간 안 기업 일정 D 기업설명회'}]}),
    cell('E', {real: 0.01, mkt: -0.001, res: 0.011, share: 0.08, hyps: [{category: '미설명', strength: '강', evidence: '…'}]}),
    cell('G', {real: -0.01, mkt: -0.002, res: -0.008, share: 0.2}),
    cell('H', {real: 0.01, mkt: -0.002, res: 0.012, share: 0.14, expected: '+0.20'}),
    // 같은 칸을 나중에 다시 분석한 판이 있으면 늦은 판을 쓴다(앞 판의 「기업 일정」은 버려짐)
    cell('E', {real: 0.01, mkt: -0.001, res: 0.011, share: 0.08, hyps: [{category: '기업 사건', strength: '약', evidence: '기간 안 기업 일정 옛 판'}], at: '2026-09-30T07:00:00Z'}),
  ];
  const m = buildMisses({scoreboard, analysisRecords: recs, closeCallGap: 0.05, forecastId: 'X'});
  const bin = code => m.list.find(x => x.code === code)?.bin;
  assert.equal(m.counts.wrong, 5); assert.equal(m.counts.right, 2);
  assert.equal(bin('A'), 'close'); assert.equal(bin('B'), 'flow'); assert.equal(bin('C'), 'flow'); assert.equal(bin('D'), 'missed'); assert.equal(bin('E'), 'unknown');
  assert.deepEqual(m.binTotals, {close: 1, flow: 2, missed: 1, unknown: 1});
  assert.equal(Object.values(m.binTotals).reduce((s, x) => s + x, 0), m.counts.wrong);
  assert.equal(m.bins.length, MISS_BINS.length);
  assert.match(m.list.find(x => x.code === 'C').why, /6종목이 모두 같은 쪽\(오름\)/);
  assert.equal(m.lean.predictedDown, 5); assert.equal(m.lean.wrongFromDown, 4); assert.equal(m.lean.wrongFromUp, 1);
  assert.equal(m.noSignal.cells, 5); assert.equal(m.signal.cells, 2);
  assert.equal(latestCells(recs).get(`${F}|E|${D}`).at, '2026-09-30T08:00:00Z');
});

test('대조 시험: 기업 일정이 맞힌 쪽에 같거나 더 많으면 「놓친 것」으로 세지 않는다', () => {
  const rows = [row('D', {pred: 'down', obs: 'up', p: {up: 0.40, flat: 0.04, down: 0.56}, ok: false, ret: 0.01}), row('G', {pred: 'down', obs: 'down', p: {up: 0.40, flat: 0.04, down: 0.56}, ok: true, ret: -0.01})];
  const sched = [{category: '기업 사건', strength: '약', evidence: '기간 안 기업 일정 X'}];
  const recs = [cell('D', {real: 0.01, mkt: -0.001, res: 0.011, share: 0.08, hyps: sched}), cell('G', {real: -0.01, mkt: -0.002, res: -0.008, share: 0.2, hyps: sched})];
  const m = buildMisses({scoreboard: {byDate: [{date: D, rows}]}, analysisRecords: recs});
  assert.equal(m.list[0].bin, 'unknown');
  assert.equal(m.contrast.find(c => c.key === 'schedule').passes, false);
});
