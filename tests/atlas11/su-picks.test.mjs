// 여러 꾀가 고른 회사 시험(주문 1120-0950 · 사장님 2026-11-20(마카오) 09:50 「많이 추천된 순서 … 추천 횟수 … 추적 … 꺾은선」)
//   site/su/su-picks.js — 날마다 회사마다 고른 꾀 수(정산 장부 buys + 오늘 꾀 칸 자료) · 오늘 두 꾀 넘게 고른 곳 · 많이 고른 차례
import test from 'node:test';
import assert from 'node:assert/strict';
import {dayCounts, picksOf, monthLow, PICKS_RULE} from '../../site/su/su-picks.js';

const kinds = ['top3', 'quiet', ...Array.from({length: 36}, (_, i) => 'g' + String(i + 1).padStart(2, '0')), 'ovl'];
const ki = k => kinds.indexOf(k);
const D = {kinds, co: {'000001': ['가나', '반도체'], '000002': ['다라', '은행'], '000003': ['마바', '화학']},
  buys: [['2026-11-13', ki('g01'), '000001', 100], ['2026-11-13', ki('g02'), '000001', 100], ['2026-11-13', ki('g03'), '000002', 50],
    ['2026-11-16', ki('g01'), '000001', 101], ['2026-11-16', ki('g05'), '000002', 51], ['2026-11-16', ki('g06'), '000002', 51], ['2026-11-16', ki('g07'), '000002', 51],
    ['2026-11-16', ki('top3'), '000003', 9], ['2026-11-16', ki('ovl'), '000003', 9], ['2026-11-16', ki('g01'), '000001', 101]]}; // 꾀가 아닌 묶음(top3 · ovl)은 세지 않음 · 같은 꾀가 같은 날 두 번은 한 번

test('날마다 회사마다 고른 꾀 수 — 꾀(g01~g36)만 · 같은 꾀는 한 번', () => {
  const {days, cnt} = dayCounts(D, null);
  assert.deepEqual(days, ['2026-11-13', '2026-11-16']);
  assert.equal(cnt.get('2026-11-13').get('000001'), 2);
  assert.equal(cnt.get('2026-11-16').get('000001'), 1);
  assert.equal(cnt.get('2026-11-16').get('000002'), 3);
  assert.equal(cnt.get('2026-11-16').has('000003'), false);
});

test('많이 고른 차례 · 오늘 두 꾀 넘게 고른 곳만 · 날마다 꾀 수 줄', () => {
  const P = picksOf(D, null);
  assert.equal(P.rule, PICKS_RULE);
  assert.deepEqual(P.rows.map(r => [r.code, r.now, r.n, r.total]), [['000002', 3, [1, 3], 4]]);
  assert.equal(P.rows[0].name, '다라');
  assert.equal(P.rows[0].sec, '은행');
});

test('오늘 꾀 칸 자료가 장부보다 늦으면 오늘 목록을 하루 더 붙임', () => {
  const g = {asOf: {board: '2026-11-17'}, lists: {g01: [{code: '000001', name: '가나'}], g02: [{code: '000001', name: '가나'}], g09: [{code: '000009', name: '새회사'}], g10: [{code: '000009', name: '새회사'}]}};
  const P = picksOf(D, g);
  assert.deepEqual(P.days, ['2026-11-13', '2026-11-16', '2026-11-17']);
  assert.deepEqual(P.rows.map(r => [r.code, r.now, r.n]), [['000001', 2, [2, 1, 2]], ['000009', 2, [0, 0, 2]]]);
  assert.equal(P.rows[1].name, '새회사');
});

test('자료가 없으면 빈 줄(멈추지 않음)', () => {
  for (const x of [null, {}, {buys: 'x'}, {kinds: [], buys: [[1, 2, 3]]}]) assert.deepEqual(picksOf(x, null).rows, []);
});

test('한 달 값 — 손실 먼저(가장 낮을 때 → 지금)', () => {
  const m = monthLow([100, 90, 80, 95, 110]);
  assert.ok(Math.abs(m.low + 0.2) < 1e-9);
  assert.ok(Math.abs(m.now - 0.1) < 1e-9);
  assert.equal(monthLow([100]), null);
  assert.equal(monthLow([100, 0]), null);
});
