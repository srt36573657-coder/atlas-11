// 장부 셈 시험(주문 1120-1705 · 사장님 2026-11-20(마카오) 17:05 「날짜별로 어떤종목을 … 얼마나 … 어떻게 됐는지 그래프와 데이타로 … 모든 거래내역 추적하고 기록」)
//   site/su/su-ledger-core.js ledgerOf — 날마다(같은 회사는 한 줄 · 주 수 더함 · 손실 먼저) · 회사마다(모든 날 더함 · 산 돈 차례) · 쌓인 산 돈 · 그 지금 값
import test from 'node:test';
import assert from 'node:assert/strict';
import {ledgerOf, LEDGER_RULE, ledFind, tradesOf, ledgerView, LEDGER_VIEWS, LEDGER_SPANS, LEDGER_RES, LEDGER_SORTS, LEDGER_PICK0} from '../../site/su/su-ledger-core.js';

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
test('거르개 열여덟 — 묶음 넷 3 · 6 · 3 · 6 · 처음은 날짜별 · 모두 · 모두 · 줄어든 돈 먼저', () => {
  assert.equal(LEDGER_VIEWS.length + LEDGER_SPANS.length + LEDGER_RES.length + LEDGER_SORTS.length, 18);
  assert.deepEqual([LEDGER_VIEWS.length, LEDGER_SPANS.length, LEDGER_RES.length, LEDGER_SORTS.length], [3, 6, 3, 6]);
  assert.deepEqual({...LEDGER_PICK0}, {view: 'day', span: 'all', res: 'all', sort: 'loss'});
  const all = [...LEDGER_VIEWS, ...LEDGER_SPANS, ...LEDGER_RES, ...LEDGER_SORTS].map(x => x[1]).join(' ');
  assert.ok(!/%|매수|매도|수익률|추천|1위|1등/.test(all), all);
});
test('날짜별 — 새 날 먼저 · 한 날 안은 줄어든 돈 먼저 · 결과로 거르면 빈 날은 뺌', () => {
  const V = ledgerView(rows);
  assert.deepEqual(V.groups.map(g => [g.day, g.items.map(x => x.key)]), [['2026-11-14', ['000003', '000002']], ['2026-11-13', ['000001', '000002']]]);
  assert.deepEqual(V.T, {n: 4, times: 5, cost: 5050, val: 5000});
  const D = ledgerView(rows, {res: 'dn'});
  assert.deepEqual(D.groups.map(g => [g.day, g.items.map(x => x.key)]), [['2026-11-13', ['000001']]], '11월 14일은 줄어든 회사가 없어 뺌');
  assert.deepEqual(ledgerView(rows, {span: 'd1'}).groups.map(g => g.day), ['2026-11-14'], '마지막 날만');
});
test('회사별 · 꾀별 — 차례 여섯 · 하루치는 늘어남 · 줄어듦에서 뺌', () => {
  const by = sort => ledgerView(rows, {view: 'co', sort}).items.map(x => x.key);
  assert.deepEqual(by('loss'), ['000001', '000003', '000002']);
  assert.deepEqual(by('gain'), ['000002', '000003', '000001']);
  assert.deepEqual(by('high'), ['000002', '000003', '000001']);
  assert.deepEqual(by('low'), ['000001', '000003', '000002']);
  assert.deepEqual(by('cost'), ['000001', '000003', '000002']);
  assert.deepEqual(by('times'), ['000001', '000002', '000003']);
  assert.deepEqual(ledgerView(rows, {view: 'co', res: 'up'}).items.map(x => x.key), ['000002'], '000003 은 하루치라 늘어난 것에 안 듦');
  assert.deepEqual(ledgerView(rows, {view: 'k', res: 'dn'}).items.map(x => x.key), ['g02', 'g01'], '꾀별 줄어든 것 — g02 −100 · g01 −50');
  const K = ledgerView(rows, {view: 'k'}).items;
  assert.deepEqual(K.map(x => [x.key, x.cost, x.val]), [['g02', 1000, 900], ['g01', 1550, 1500], ['g04', 2000, 2000], ['g03', 500, 600]], '꾀별 줄어든 돈 먼저 — g02 −100 · g01 −50 · g04 0 · g03 +100');
  assert.deepEqual(ledgerView(rows, {view: 'nope', span: 'x', res: 'y', sort: 'z'}).pick, {view: 'day', span: 'all', res: 'all', sort: 'loss'}, '모르는 값은 처음 값으로');
});
