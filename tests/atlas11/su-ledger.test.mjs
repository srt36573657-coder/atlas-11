// 장부 셈 시험(주문 1120-1705 · 사장님 2026-11-20(마카오) 17:05 「날짜별로 어떤종목을 … 얼마나 … 어떻게 됐는지 그래프와 데이타로 … 모든 거래내역 추적하고 기록」)
//   site/su/su-ledger-core.js ledgerOf — 날마다(같은 회사는 한 줄 · 주 수 더함 · 손실 먼저) · 회사마다(모든 날 더함 · 산 돈 차례) · 쌓인 산 돈 · 그 지금 값
import test from 'node:test';
import assert from 'node:assert/strict';
import {ledgerOf, LEDGER_RULE, ledFind, tradesOf, ledgerView, LEDGER_VIEWS, LEDGER_SPANS, LEDGER_RES, LEDGER_SORTS, LEDGER_PICK0, judgeOf, judgeText, judgeTail, won100, JUDGE_RULE, JUDGE_BAND, JUDGE_DAYS, sameAgeOf, sameText, SAME_KS} from '../../site/su/su-ledger-core.js';

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
  assert.deepEqual(V.T, {n: 4, times: 5, cost: 5050, val: 5000, mc: 0, mval: 0, mv: 0}, '시장 길이 없는 줄은 시장 견줌 0(주문 1123-2358)');
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

// 판정 한 줄(주문 1123-2358 · 사장님 2026-11-23(서울) 23:58 「너 맘대로 해」 — 23:48 「… 판단하는 잣대를 … 11가지를 제시해봐」의 제안 1 · 3 · 8 · 11번)
const rm = (day, k, code, buy, now, mvNow, one = false) => ({...r(day, k, code, buy, now, one), mv: mvNow === null ? null : mvNow * 10});
test('판정 한 줄 — 시장과 나란히(하루치 · 시장 길 없는 줄 뺌) · 1원 안쪽은 비슷해요 · 덜 잃음 · 더 잃음 · 더 늘음 · 덜 늘음', () => {
  assert.equal(JUDGE_RULE, 'ledger-judge-v1'); assert.equal(JUDGE_BAND, 1); assert.equal(JUDGE_DAYS, 20);
  const R = [rm('2026-11-13', 'g01', '000001', 100, 96, 94), rm('2026-11-13', 'g02', '000002', 100, 97, 95), rm('2026-11-14', 'g01', '000003', 100, 90, null), rm('2026-11-20', 'g03', '000004', 100, 100, 100, true)];
  const J = judgeOf(R, {days: ['2026-11-13', '2026-11-14', '2026-11-20'], w: [1000000, 985000, 966000]});
  assert.equal(J.n, 2, '시장 길이 없는 줄 · 하루치는 뺌');
  assert.deepEqual([J.cost, J.val, J.mv, J.d, J.st, J.loss], [2000, 1930, 1890, 2, 'better', true]);
  assert.equal(Math.round(J.r * 10), 965); assert.equal(Math.round(J.rm * 10), 945);
  assert.deepEqual(J.deep, {day: '2026-11-20', r: 96.6}, '가장 깊이 빠진 날 = 쌓인 장부가 가장 낮은 날');
  assert.equal(J.days, 2, '산 날 = 하루치가 아닌 날 수'); assert.equal(J.early, true);
  assert.equal(judgeText(J), '시장보다 100원에 2원 덜 잃었어요.');
  assert.equal(judgeText({...J, d: -1.94, st: 'worse'}), '시장보다 100원에 1.9원 더 잃었어요.');
  assert.equal(judgeText({...J, val: 2100, loss: false}), '시장보다 100원에 2원 더 늘었어요.');
  assert.equal(judgeText({...J, val: 2100, loss: false, d: -3, st: 'worse'}), '시장보다 100원에 3원 덜 늘었어요.');
  assert.equal(judgeText({...J, d: 0.4, st: 'same'}), '시장과 비슷해요. 100원에 1원 안쪽이에요.');
  assert.equal(judgeText({...J, d: null, st: null}), '', '시장 길이 없으면 빈 글');
  assert.equal(won100(1.25), '1.3'); assert.equal(won100(-2), '2'); assert.equal(won100(0.04), '0');
  const E = judgeOf([], null);
  assert.deepEqual([E.n, E.d, E.st, E.deep, E.days, E.early], [0, null, null, null, 0, true], '빈 장부');
  const many = Array.from({length: 20}, (_, i) => rm('2026-10-' + String(i + 1).padStart(2, '0'), 'g01', '000001', 100, 100, 100));
  assert.equal(judgeOf(many, null).early, false, '산 날 스무 번이 차면 아직 일러요가 아님');
  for (const t of [judgeText(J), judgeText({...J, d: -3, st: 'worse'}), judgeText({...J, d: 0, st: 'same'})]) assert.ok(!/%|매수|매도|수익률|추천|예측|확률|기회/.test(t), t);
});
test('거르개를 고를 때마다 시장 견줌(11번) — 묶음마다 시장 길이 있는 줄만 더함 · 하루치 뺌', () => {
  const R = [rm('2026-11-13', 'g01', '000001', 100, 96, 94), rm('2026-11-13', 'g02', '000001', 100, 96, 94), rm('2026-11-14', 'g01', '000002', 100, 90, 92), rm('2026-11-20', 'g03', '000004', 100, 100, 100, true)];
  const V = ledgerView(R);
  assert.deepEqual([V.T.mc, V.T.mval, V.T.mv], [3000, 2820, 2800]);
  assert.equal(judgeTail(V.T), '시장과 비슷함', '100원에 0.7원 — 1원 안쪽');
  const K = ledgerView(R, {view: 'co', sort: 'cost'});
  assert.deepEqual(K.items.map(x => [x.key, x.mc, x.mval, x.mv]), [['000001', 2000, 1920, 1880], ['000002', 1000, 900, 920], ['000004', 0, 0, 0]]);
  assert.equal(judgeTail(K.items[0]), '시장보다 100원에 2원 나음'); assert.equal(judgeTail(K.items[1]), '시장보다 100원에 2원 못함'); assert.equal(judgeTail(K.items[2]), '');
});

// 같은 날수로(주문 1124-0226 · 사장님 2026-11-24(서울) 02:26 「어 1시간 이내에 작업 해봐」 — 장부 잣대 2번)
test('같은 날수로 — 산 뒤 하루 · 닷새 · 스무 날 · 그 날수가 지난 산 셈만 · 산 돈 무게 · 시장은 같은 날수 뒤 판 전체 · 아직이면 「아직 없어요」', () => {
  assert.deepEqual(SAME_KS.map(x => x[0]), [1, 5, 20]);
  const hz = (a, b, c) => [a, b, c].map(x => (x === null ? null : {t: 'x', val: x[0] * 10, mv: x[1] === null ? null : x[1] * 10}));
  const R = [{...r('2026-11-13', 'g01', '000001', 100, 90), hz: hz([98, 97], [95, 93], null)}, {...r('2026-11-13', 'g02', '000002', 200, 200), hz: hz([204, 202], null, null)},
    {...r('2026-11-20', 'g01', '000003', 100, 100, true), hz: hz(null, null, null)}, {...r('2026-11-14', 'g03', '000004', 50, 50), hz: null}];
  const [d1, d5, d20] = sameAgeOf(R);
  assert.deepEqual([d1.k, d1.n, d1.days, d1.cost, d1.val], [1, 2, 1, 3000, 3020]);
  assert.equal(Math.round(d1.r * 10), 1007); assert.equal(Math.round(d1.rm * 10), 997);
  assert.deepEqual([d5.n, d5.cost, d5.val, Math.round(d5.r), Math.round(d5.rm)], [1, 1000, 950, 95, 93]);
  assert.deepEqual([d20.n, d20.r, d20.rm], [0, null, null]);
  assert.equal(sameText(d1), '산 뒤 하루 — 장부 100원이 100.7원 · 시장 99.7원 · 산 날 1번');
  assert.equal(sameText(d5), '산 뒤 닷새 — 장부 100원이 95원 · 시장 93원 · 산 날 1번');
  assert.equal(sameText(d20), '산 뒤 스무 날 — 아직 없어요');
  const noM = sameAgeOf([{...r('2026-11-13', 'g01', '000001', 100, 90), hz: hz([98, null], null, null)}])[0];
  assert.equal(noM.rm, null); assert.equal(sameText(noM), '산 뒤 하루 — 장부 100원이 98원 · 산 날 1번', '시장 길이 없으면 시장 글을 뺌');
  assert.deepEqual(sameAgeOf(null).map(x => x.n), [0, 0, 0]);
});
