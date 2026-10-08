// ATLAS 11 · 관측 한 문장 규칙(obs-rules-1 · site/app/observe.js) — 2026-10-09 「ATLAS 업데이트 실행 프롬프트」 0-A · 5 · 18
// 가짜 판(시험 전용 · 운영 값 아님) — 같은 평균이라도 시장 폭이 다르면 다른 문장 · 원인을 붙이지 않음 · 뚜렷한 변화 없음 · 판단 보류
import test from 'node:test';
import assert from 'node:assert/strict';
import {marketObservation, sectorsObservation, sectorObservation, sectorParts} from '../../site/app/observe.js';
import {summarize} from '../../site/app/calc.js';

/** 업종 하나에 다섯 곳씩 — rets = [[업종1 다섯], [업종2 다섯] …] · 지수 r20 = I */
function fake(rets, I, extra = {}) {
  const sectors = rets.map((xs, k) => ({id: 'g' + k, label: '업종' + k, codes: xs.map((_, j) => `${k}-${j}`), level: summarize(xs).upRatio >= 60 && summarize(xs).median > 0 ? 'broad' : 'mixed', d20: summarize(xs)}));
  const stocks = rets.flatMap((xs, k) => xs.map((r, j) => ({code: `${k}-${j}`, name: `회사${k}-${j}`, g: 'g' + k, r20: r})));
  const all = rets.flat();
  return {market: {ref: {r20: I, name: '지수'}, sample: {d20: summarize(all)}}, sectors, stocks, ...extra};
}
const many = (v, k = 7) => Array.from({length: k}, () => [v, v, v, v, v]); // 35곳

test('뚜렷한 변화 없음 — 지수 · 중앙값 모두 ±1% 안', () => {
  const o = marketObservation(fake(many(0.4), 0.3));
  assert.equal(o.kind, 'flat'); assert.match(o.text, /뚜렷한 변화 없음/); assert.match(o.text, /지수 \+0\.3%/);
});
test('지수는 올랐지만 오른 종목은 절반이 안 됨(divUp) · 반대 근거 = 가장 많이 오른 업종', () => {
  const rets = [...many(-2, 6), [12, 10, 8, -1, -1]]; // 평균 −0.9%(마이너스) — 쏠림이 아니라 가장 많이 오른 업종을 반대 근거로
  const o = marketObservation(fake(rets, 3));
  assert.equal(o.kind, 'divUp'); assert.match(o.text, /지수는 \+3\.0% 올랐지만, 선정 35곳 가운데 오른 곳은 3곳\(9%\)입니다/);
  assert.equal(o.counter.kind, 'strong'); assert.match(o.counter.text, /업종6 평균 \+5\.6%\(5곳 중 3곳 상승\)/);
  const sk = marketObservation(fake([...many(-2, 6), [30, 25, 20, -1, -1]], 3)); assert.equal(sk.counter.kind, 'skew', '평균이 플러스면(몇 곳이 끌어올림) 쏠림');
});
test('지수는 내렸지만 오른 종목이 절반이 넘음(divDown) · 반대 근거 = 쏠림 또는 1위 업종', () => {
  const o = marketObservation(fake(many(2), -2));
  assert.equal(o.kind, 'divDown'); assert.match(o.text, /오른 곳이 35곳\(100%\)/);
  assert.equal(o.counter.kind, 'even', '모두 같은 값이면 쏠림 작음');
});
test('같은 방향(오름) — 평균이 중앙값보다 크게 높으면 쏠림을 반대 근거로', () => {
  const rets = [...many(1, 6), [60, 2, 1, 1, 1]];
  const o = marketObservation(fake(rets, 2));
  assert.equal(o.kind, 'agreeUp'); assert.equal(o.counter.kind, 'skew'); assert.match(o.counter.text, /중앙값은 \+1\.0%/);
});
test('같은 방향(내림) — 평균은 플러스(몇 곳이 끌어올림) · 중앙값을 함께', () => {
  const rets = [...many(-2, 6), [80, 1, -1, -1, -1]];
  const o = marketObservation(fake(rets, -4));
  assert.equal(o.kind, 'agreeDown'); assert.match(o.text, /내렸습니다/); assert.equal(o.counter.kind, 'skew'); assert.match(o.counter.text, /그래도 평균은/);
});
test('판단 보류 — 표본이 30곳보다 적거나 지수가 없음(0 으로 채우지 않음)', () => {
  assert.equal(marketObservation(fake([[1, 2, 3, 4, 5]], 1)).kind, 'na');
  assert.equal(marketObservation(fake(many(1), null)).kind, 'na');
});
test('업종 탭 — 오른 업종 수 · 동반 강세 수 · 기여 1위를 빼면 평균이 얼마인가', () => {
  const rets = [[10, 10, 10, 10, 10], [-1, -1, -1, -1, -1], [2, 2, 2, 2, 2]];
  const o = sectorsObservation(fake(rets, 1));
  assert.equal(o.G, 3); assert.equal(o.up, 2); assert.equal(o.top.id, 'g0');
  assert.match(o.counter.text, /업종0 5곳을 빼면 선정 평균 \+3\.7% → \+0\.5%/);
  const parts = sectorParts(fake(rets, 1)); assert.equal(parts[0].count, 5); assert.equal(parts[0].sum, 50);
});
test('업종 화면 — 지시서 예시: 평균 +4% 인데 오른 곳 5곳 중 2곳 · 1위 제외 −1% · 시장 +5% 면 격차 −1%p', () => {
  const l = fake([[24, 1, 0, -2, -3]], 5), o = sectorObservation(l, 'g0');
  assert.equal(o.kind, 'concentrated'); assert.match(o.text, /업종0 평균은 \+4\.0% 올랐지만, 상승 1위를 빼면 −1\.0%입니다\(5곳 중 2곳 오름\)/);
  assert.equal(o.counter.kind, 'median'); assert.match(o.counter.text, /^중앙값 0\.0% · 오른 곳 2\/5곳$/); assert.ok(Math.abs(o.exTop - -1) < 1e-9); assert.ok(Math.abs(o.gap - -1) < 1e-9);
  const b = sectorObservation(fake([[6, 5, 4, 3, 2]], 5), 'g0'); assert.equal(b.kind, 'up'); assert.match(b.text, /5곳 중 5곳이 올랐습니다/);
  const c = sectorObservation(fake([[1, null, null, 2, 3]], 5), 'g0'); assert.equal(c.n, 3, '값이 없는 곳은 빼고 셈'); assert.equal(c.total, 5);
  assert.equal(sectorObservation(fake([[1, null, null, null, 3]], 5), 'g0').kind, 'na');
  const d = sectorObservation(fake([[3, 2, -0.5, 1, 4]], 5), 'g0'); assert.equal(d.kind, 'up'); assert.equal(d.counter.kind, 'exTop', '1위를 빼도 플러스면 「쏠림」 아님');
  const f = sectorObservation(fake([[0.5, -0.4, 0.3, 0.2, -0.1]], 5), 'g0'); assert.equal(f.kind, 'flat', '평균 ±1% 안 = 뚜렷한 변화 없음'); assert.match(f.text, /업종0 평균 \+0\.1% — 뚜렷한 변화 없음\(5곳 중 3곳 오름\)/);
});

test('같은 평균 · 다른 구조(셋째 개정본 0-E · 18-A) — 평균이 모두 +4% 인 세 묶음에 같은 요약을 붙이지 않음', () => {
  const sets = [[6, 5, 4, 3, 2], [24, 1, 0, -2, -3], [32, -2, -3, -3, -4]].map(v => sectorObservation(fake([v], 5), 'g0'));
  assert.deepEqual(sets.map(o => Math.round(o.m * 1e9) / 1e9), [4, 4, 4]);
  assert.deepEqual(sets.map(o => o.kind), ['up', 'concentrated', 'concentrated']);
  assert.equal(new Set(sets.map(o => o.text)).size, 3, '요약 문장 셋이 서로 다름');
  assert.deepEqual(sets.map(o => o.u), [5, 2, 1]);
  assert.deepEqual(sets.map(o => Math.round(o.exTop * 1e9) / 1e9), [3.5, -1, -3]);
  assert.match(sets[2].counter.text, /^중앙값 −3\.0% · 오른 곳 1\/5곳$/);
  for (const o of sets) assert.doesNotMatch(o.text + (o.counter?.text ?? ''), /오를|내릴|전망|예상|확률|좋은 업종/, '앞날 · 좋다 나쁘다 말 없음');
});
