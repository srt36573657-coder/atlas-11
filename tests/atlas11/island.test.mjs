// 「후보 7」 섬 셈(site/app/island-model.js) — 사장님 2026-10-09 17:02 「잡스가 … 3d방식으로 입체감과 정적인 상태 … 상호 작용속에 유기적인 아틀란스」 · 17:36 「아주 색시한 전달력 있게 … 반영해」
//   물 위 = 그물 안(판 읽기 flags 다섯째) · 높이 = 같은 무리 안 1년 추세 차례 · 업종 = 십자 다섯 칸 구역(빈틈없이 · 겹치지 않음) · 센 업종이 가운데 · 20거래일 전 높이 = 그 날 기준선(grow.qp)으로
import test from 'node:test';
import assert from 'node:assert/strict';
import {islandModel, centersOf, ISL} from '../../site/app/island-model.js';

/** 작은 판 — 업종 셋(가 · 나 · 다 · 다섯 곳씩) · m = [오늘 1년 추세, 20거래일 전] · f = flags(그날 종가 · 흑자 · 위험 공시 없음 · 추세 셈 · 그물 안 · 새로 듦) */
const ROWS = [
  ['a1', '가', [1.2, 0.9], '111111'], ['a2', '가', [0.9, 0.5], '111110'], ['a3', '가', [0.8, 0.2], '011111'], ['a4', '가', [0.1, 0.1], '111100'], ['a5', '가', [null, 0.3], '110000'],
  ['b1', '나', [0.7, 0.1], '111111'], ['b2', '나', [0.3, 0.6], '111100'], ['b3', '나', [0.2, 0.2], '111100'], ['b4', '나', [-0.1, 0.0], '111100'], ['b5', '나', [-0.3, -0.2], '111100'],
  ['c1', '다', [0.0, 0.4], '111100'], ['c2', '다', [-0.2, 0.0], '111100'], ['c3', '다', [-0.4, -0.1], '111100'], ['c4', '다', [-0.5, -0.5], '111100'], ['c5', '다', [-0.6, null], '111100']];
const stocks = ROWS.map(([code, g]) => ({code, name: '회사' + code, g, gl: '업종' + g}));
const C = {grow: {m: Object.fromEntries(ROWS.map(r => [r[0], r[2]])), qp: 45}, flags: Object.fromEntries(ROWS.map(r => [r[0], r[3]])),
  items: [{code: 'a1', rank: 1, status: 'met'}, {code: 'b1', rank: 2, status: 'met'}]};

test('물 위 = 그물 안(flags 다섯째) · 초록 = 그 가운데 기준 셋을 넘은 곳 · 높이 = 같은 무리 안 차례 · 값 없음 = 바닥', () => {
  const M = islandModel(C, stocks), w = ISL.water, by = Object.fromEntries(M.cells.map(c => [c.code, c]));
  assert.equal(M.cells.length, 15);
  for (const c of M.cells) assert.equal(c.hN > w, String(C.flags[c.code])[4] === '1' && c.m12 !== null, c.code);
  assert.equal(M.above, 4); assert.equal(M.green, 3); // 물 위 = flags 다섯째가 1 인 a1 a2 a3 b1 넷 · 초록 = 그 가운데 앞 셋이 111 인 a1 a2 b1 셋(a3 은 그날 종가 없음 '011')
  assert.ok(by.a1.hN > by.a2.hN && by.a2.hN > by.a3.hN && by.a3.hN > by.b1.hN && by.b1.hN > w, '물 위는 1년 추세 큰 차례로 높음');
  assert.ok(by.b2.hN < w && by.b2.hN > by.b3.hN && by.b3.hN > by.c1.hN, '물 아래도 차례');
  assert.equal(by.a5.hN, 0, '1년 추세를 셀 수 없으면 바닥(지어내지 않음)');
  assert.ok(Math.abs(by.a1.hN - 1) < 1e-9, '물 위 가장 큰 곳 = 꼭대기');
});

test('20거래일 전 높이 — 그 날 기준선(grow.qp %) 이상이면 물 위 · 후보는 그때 물 아래(새로 듦)', () => {
  const M = islandModel(C, stocks), w = ISL.water, by = Object.fromEntries(M.cells.map(c => [c.code, c]));
  for (const c of M.cells) { const mp = C.grow.m[c.code][1]; assert.equal(c.hP > w, mp !== null && mp >= 0.45, c.code); }
  assert.ok(by.b1.hP < w && by.b1.hN > w, '후보 b1 은 20거래일 전 물 아래 → 오늘 물 위');
  assert.deepEqual(M.seven.map(i => M.cells[i].code), ['a1', 'b1']);
  assert.deepEqual(M.seven.map(i => M.cells[i].rank), [1, 2]);
});

test('업종 = 십자 다섯 칸 구역 — 겹치지 않음 · 센 업종이 가운데 · 구역 안은 높은 탑이 가운데 칸', () => {
  const M = islandModel(C, stocks), keys = new Set(M.cells.map(c => `${c.x},${c.y}`));
  assert.equal(keys.size, 15, '칸이 겹치지 않음');
  assert.equal(M.districts, 3); assert.equal(M.sectors, 3);
  const center = M.cells.filter(c => c.x === 0 && c.y === 0)[0];
  assert.equal(center.code, 'a1', '가장 센 업종(가)의 가장 높은 탑이 섬 한가운데');
  for (const d of [0, 1, 2]) { const cs = M.cells.filter(c => c.d === d), cx = cs.reduce((t, c) => t + c.x, 0) / 5, cy = cs.reduce((t, c) => t + c.y, 0) / 5; assert.ok(cs.every(c => Math.abs(c.x - cx) + Math.abs(c.y - cy) <= 1), '십자 모양'); }
  const cen = centersOf(40), all = new Set(); for (const [x, y] of cen) for (const [dx, dy] of ISL.arms) { const k = `${x + dx},${y + dy}`; assert.ok(!all.has(k), '격자 십자끼리 빈틈 · 겹침 없음'); all.add(k); }
});

test('값이 없으면 섬을 그리지 않음(지어내지 않음)', () => {
  assert.equal(islandModel(null, stocks), null);
  assert.equal(islandModel({grow: null}, stocks), null);
  assert.equal(islandModel(C, []), null);
});
