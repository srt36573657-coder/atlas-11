import test from 'node:test';
import assert from 'node:assert/strict';
import {buildNetwork, propagate, stockStats, GROUPS, groupOf} from '../../lib/atlas11/network.mjs';
import {realInputs} from './helpers.mjs';

const finite = x => typeof x === 'number' && Number.isFinite(x);

test('연쇄 지도: 52노드 · 묶음 합 52 · 종목당 이웃 ≤5 · 값 전부 유한 · 시장 통로+직접 통로 = 전체 베타×Δ (항등식)', async () => {
  const {input} = await realInputs();
  const net = buildNetwork(input);
  assert.equal(net.nodes.length, 52); assert.equal(new Set(net.nodes.map(n => n.code)).size, 52);
  assert.equal(GROUPS.reduce((s, g) => s + g.codes.length, 0), 52); assert.equal(new Set(GROUPS.flatMap(g => g.codes)).size, 52);
  assert.ok(input.assets.every(a => groupOf(a.code)), '52종목 모두 묶음이 있어야 함');
  const perSource = new Map(); for (const e of net.edges) perSource.set(e.from, (perSource.get(e.from) ?? 0) + 1);
  assert.ok([...perSource.values()].every(k => k <= 5)); assert.ok(net.edges.every(e => Math.abs(e.rho) >= 0.15 && finite(e.w)));
  for (const n of net.nodes) { assert.ok(finite(n.beta) && finite(n.r2) && n.r2 >= 0 && n.r2 <= 1 && finite(n.marketResponse) && finite(n.volAnnual)); assert.equal(n.topCorrelated.length, 5); assert.ok(n.topCorrelated.every(t => t.code !== n.code)); }
  // 항등식: 2차 효과의 (시장+직접) = cov(r_j,r_i)/var(r_i)·Δ — 관계망에 간선이 있는 j 에서
  const src = '005930', delta = -0.05, p = propagate(net, src, delta);
  assert.equal(p.levels.length, 5); assert.equal(p.levels[0].effects[0].code, src); assert.equal(p.levels[0].effects[0].total, delta);
  const n0 = net.nodes.find(n => n.code === src);
  for (const t of n0.topCorrelated) { const e = p.levels[1].effects.find(x => x.code === t.code); const hasEdge = net.edges.some(x => x.from === src && x.to === t.code); if (hasEdge) assert.ok(Math.abs(e.total - t.beta * delta) < 2e-3, `${t.code} ${e.total} vs ${t.beta * delta}`); assert.ok(Math.abs(e.market + e.direct - e.total) < 1e-12); }
  assert.ok(p.levels.every(l => l.effects.every(x => finite(x.total))));
  assert.ok(p.cumulative.length === 51 && p.cumulative.every(x => finite(x.total)));
  // Δ=0 → 전부 0 · Δ 부호 뒤집으면 효과 부호 뒤집힘(선형)
  const z = propagate(net, src, 0); assert.ok(z.levels.every(l => l.effects.every(x => x.total === 0)));
  const q = propagate(net, src, 0.05); for (let k = 0; k < 5; k++) { const a = Object.fromEntries(p.levels[k].effects.map(x => [x.code, x.total])); for (const x of q.levels[k].effects) assert.ok(Math.abs(x.total + a[x.code]) < 1e-12); }
  // 3~5차는 감쇠로 작아짐(최댓값 기준)
  const maxAbs = l => Math.max(...l.effects.map(x => Math.abs(x.total)));
  assert.ok(maxAbs(p.levels[2]) < maxAbs(p.levels[1]) && maxAbs(p.levels[4]) <= maxAbs(p.levels[2]) * 1.0001);
  assert.throws(() => propagate(net, '000000', 0.1), /NETWORK_CODE/);
});

test('종목 정보: 1년 최고·최저 사이의 위치 · 수익률 · 이동평균 · 낙폭이 실제 가격에서 계산됨', async () => {
  const {input} = await realInputs();
  const a = input.assets.find(x => x.code === '005930'), sessions = input.calendar.sessions;
  const st = stockStats(a, sessions, {asOf: input.actualAsOf});
  const closes = sessions.filter(d => d <= input.actualAsOf).map(d => a.prices.find(p => p.date === d)?.close).filter(finite);
  assert.equal(st.close, closes.at(-1)); assert.equal(st.high52, Math.max(...closes.slice(-252))); assert.equal(st.low52, Math.min(...closes.slice(-252)));
  assert.ok(st.pos52 >= 0 && st.pos52 <= 1); assert.ok(Math.abs(st.ret21 - (closes.at(-1) / closes.at(-22) - 1)) < 1e-12);
  assert.ok(Math.abs(st.ma20 - closes.slice(-20).reduce((s, x) => s + x, 0) / 20) < 1e-9);
  assert.ok(st.mdd60 <= 0 && st.mdd252 <= st.mdd60 + 1e-12 && st.vol20Annual > 0);
  // 기준일 이후 가격은 쓰지 않음
  const future = {...a, prices: [...a.prices, {date: '2099-01-01', close: 1e9, volume: 1}]};
  assert.deepEqual(stockStats(future, sessions, {asOf: input.actualAsOf}), st);
});
