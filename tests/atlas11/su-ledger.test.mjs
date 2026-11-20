// 장부 셈 시험(주문 1120-1705 · 사장님 2026-11-20(마카오) 17:05 「날짜별로 어떤종목을 … 얼마나 … 어떻게 됐는지 그래프와 데이타로 … 모든 거래내역 추적하고 기록」)
//   site/su/su-ledger-core.js ledgerOf — 날마다(같은 회사는 한 줄 · 주 수 더함 · 손실 먼저) · 회사마다(모든 날 더함 · 산 돈 차례) · 쌓인 산 돈 · 그 지금 값
import test from 'node:test';
import assert from 'node:assert/strict';
import {ledgerOf, LEDGER_RULE, ledFind, tradesOf} from '../../site/su/su-ledger-core.js';

const r = (day, k, code, buy, now, one = false) => ({day, k, code, name: '회사' + code, buy, now, nowDay: one ? day : '2026-11-20', cost: buy * 10, val: now * 10, one});
const rows = [r('2026-11-13', 'g01', '000001', 100, 90), r('2026-11-13', 'g02', '000001', 100, 90), r('2026-11-13', 'g03', '000002', 50, 60),
  r('2026-11-14', 'g01', '000002', 55, 60), r('2026-11-14', 'g04', '000003', 200, 200, true)];

test('날마다 — 같은 회사는 한 줄 · 주 수 더함 · 손실 먼저 · 쌓인 돈', () => {
  const L = ledgerOf(rows);
  assert.equal(L.rule, LEDGER_RULE);
  assert.deepEqual(L.days.map(d => [d.day, d.n, d.buys]), [['2026-11-13', 2, 3], ['2026-11-14', 2, 2]]);
  const d0 = L.days[0];
  assert.deepEqual(d0.cos.map(c => [c.code, c.qty, c.cost, c.val, c.ks.join(',')]), [['000001', 20, 2000, 1800, 'g01,g02'], ['000002', 10, 500, 600, 'g03']], '줄어든 회사가 먼저');
  assert.deepEqual([d0.cost, d0.val, d0.cumCost, d0.cumVal], [2500, 2400, 2500, 2400]);
  assert.deepEqual([L.days[1].cumCost, L.days[1].cumVal], [2500 + 550 + 2000, 2400 + 600 + 2000]);
  assert.equal(L.days[1].one, false, '하루치가 섞이면 하루치 아님');
});
test('회사마다 — 모든 날 더함 · 산 돈 차례(수익 차례 아님) · 모두', () => {
  const L = ledgerOf(rows);
  assert.deepEqual(L.cos.map(c => [c.code, c.times, c.qty, c.cost, c.val, c.days]), [['000001', 2, 20, 2000, 1800, 1], ['000003', 1, 10, 2000, 2000, 1], ['000002', 2, 20, 1050, 1200, 2]]);
  assert.deepEqual(L.T, {cost: 5050, val: 5000, buys: 5, cos: 3, days: 2, one: false});
});
test('빈 자료 · 틀린 줄', () => {
  assert.deepEqual(ledgerOf([]).T, {cost: 0, val: 0, buys: 0, cos: 0, days: 0, one: false});
  assert.equal(ledgerOf([null, {day: 1}, {...rows[0], cost: NaN}]).T.buys, 0);
  assert.equal(ledgerOf(rows, 20).cos[0].qty, 40, '주 수는 장부의 qty');
});
test('장부에서 회사 찾기 — 같음 → 앞이 같음 → 이름 속 · 산 돈 큰 곳 먼저 · 산 날 모두(오래된 날 먼저)', () => {
  const L = ledgerOf(rows);
  assert.deepEqual(ledFind(L, '회사000002').map(c => c.code), ['000002']);
  assert.deepEqual(ledFind(L, '회사').map(c => c.code), ['000001', '000003', '000002'], '앞이 같으면 산 돈 큰 곳 먼저');
  assert.deepEqual(ledFind(L, '000003').map(c => c.code), ['000003']);
  assert.deepEqual(ledFind(L, '없는'), []);
  assert.deepEqual(ledFind(L, ' '), []);
  assert.deepEqual(tradesOf(rows, '000002').map(r => [r.day, r.k]), [['2026-11-13', 'g03'], ['2026-11-14', 'g01']]);
  assert.deepEqual(tradesOf(null, '000002'), []);
});
