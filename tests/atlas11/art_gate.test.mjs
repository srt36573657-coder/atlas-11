// 올리기 문 · 다섯 나라 돈의 이동(규칙 33 · 34) — 사장님 2026-10-08 01:27 「다해 전나라」 · 01:31 「너 시스템으로 그짓 못하게 해」
import test from 'node:test';
import assert from 'node:assert/strict';
import {codePrint, dictParity, reportProblems} from '../../scripts/atlas11/art_gate.mjs';
import {rotationOf, capEokOf, ROT_PLACES} from '../../scripts/atlas11/story/build.mjs';
import {expectOf, compare} from '../../scripts/atlas11/art_expect.mjs';

const root = process.cwd();

test('화면 코드 지문은 같은 코드면 같은 값(16자) — 올리기 문이 검사 결과와 맞댐', async () => {
  const a = await codePrint(root), b = await codePrint(root);
  assert.match(a, /^[0-9a-f]{16}$/); assert.equal(a, b);
});

test('말 사전 73개가 같은 열쇠를 다 가짐(만 · 억을 쓰는 말 셋은 중국어와) — 영어로 다 돈 검사가 다른 말에서도 통하게', async () => {
  assert.deepEqual(await dictParity(root), []);
});

test('바깥 판 시가총액 = 천 단위 그 나라 돈 → 억(÷ 100,000) · 한국은 marketCapEok 그대로', () => {
  assert.equal(capEokOf('kr', {marketCapEok: 12345}), 12345);
  assert.equal(capEokOf('us', {capUsd: 5638195000}), 56381.95); // 엔비디아 5조 6,382억 달러
  assert.equal(capEokOf('jp', {cap: 43281541725}), 432815.41725);
  assert.equal(capEokOf('cn', {}), null);
});

test('돈의 이동 — 다섯 나라 모두 셈(빠지는 곳 < 0 · 들어가는 곳 > 0 · 판 이름 · 순매매는 한국만)', async () => {
  for (const [place] of ROT_PLACES) {
    const r = await rotationOf(root, place);
    assert.equal(r.none, false, `${place}: ${r.reason}`);
    assert.equal(r.place, place);
    assert.ok(r.out.every(x => x.amount < 0) && r.in.every(x => x.amount > 0), place);
    assert.ok(r.pair.days >= 1 && r.fomo.to >= 0 && r.fomo.to <= 100, place);
    assert.equal(!!r.flows, place === 'kr', place);
  }
});

test('그림 숫자 맞대기 — 기대값과 다르면 알리고 같으면 조용(숫자 · 글 · 배열)', () => {
  const miss = [];
  assert.equal(compare({a: 0.1234561, b: 'x', c: [1, 2]}, {a: 0.123456, b: 'x', c: [1, 2]}, w => miss.push(w)), 4);
  assert.deepEqual(miss, []);
  compare({a: 0.2}, {a: 0.1}, w => miss.push(w)); assert.equal(miss.length, 1);
  const E = expectOf('kr', {companies: [{code: 'A', change20: 0.1, group: {id: 'g'}}, {code: 'B', change20: -0.2, group: {id: 'g'}}], groups: [{id: 'g', label: '반도체', codes: ['A', 'B'], change20: -0.05}]}, null, null, null, [{id: 'kr', n: 2}]);
  assert.deepEqual(E.road, {up: 1, down: 1, N: 2, lead: 'A', v0: 0.1});
  assert.equal(E.ind.g.lead, 'A'); assert.equal(E.map.top, 'semi');
});

test('올리기 문 — 두 말(영어 · 한국어) · 빈 날 길 · 다섯 나라 · 실패 0 · 같은 지문이어야 지나감(2026-10-08 05:05)', () => {
  const ok = {code: 'c', quick: false, boards: ['kr', 'us', 'cn', 'jp', 'vn'], langs: ['en', 'ko'], edge: 60, failed: 0, ok: true};
  assert.deepEqual(reportProblems(ok, 'c'), []);
  assert.equal(reportProblems({...ok, langs: undefined}, 'c').length, 1); // 옛 결과(영어만) — 막힘
  assert.equal(reportProblems({...ok, langs: ['en']}, 'c').length, 1);
  assert.equal(reportProblems({...ok, edge: 0}, 'c').length, 1); // 빈 날 길 없음 — 막힘
  assert.equal(reportProblems({...ok, failed: 1, ok: false}, 'c').length, 1);
  assert.equal(reportProblems(ok, 'd').length, 1); // 화면 코드가 검사 뒤에 바뀜
  assert.equal(reportProblems({...ok, boards: ['kr']}, 'c').length, 1);
});

test('빈 날 기대값 — 그릴 값이 없으면 빈 하늘(숫자를 지어내지 않음) · 못 읽은 일정은 오류 화면 · 20거래일 값이 없는 회사도 그림', () => {
  const board = {companies: [{code: 'A', change20: null, group: {id: 'g'}}, {code: 'B', change20: null, group: {id: 'g'}}], groups: [{id: 'g', label: '반도체', codes: ['A', 'B'], change20: null}], similar: {items: []}, next: {items: []}, start: null};
  const E = expectOf('kr', board, null, null, null, [{id: 'kr', n: 2}]);
  assert.deepEqual([E.map, E.ind.g, E.similar, E.rise, E.road, E.start, E.log, E.home, E.agenda], [{quiet: 'map'}, {quiet: 'industry'}, {quiet: 'similar'}, {quiet: 'rise'}, {quiet: 'road'}, {quiet: 'start'}, {quiet: 'log'}, {quiet: 'home'}, {quiet: 'fail'}]);
  assert.deepEqual(E.land.semi, {quiet: 'land'});
  assert.deepEqual(E.co.A, {code: 'A', v: null, avg: null, peers: 1});
  assert.equal(E.find.N, 2);
});
