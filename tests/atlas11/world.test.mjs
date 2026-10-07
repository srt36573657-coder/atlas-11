// 중국 · 일본 · 베트남 판(2026-10-07 05:25 「자 중국 일본 베트남 주식도 넣어라 미국 장 처럼 말이다」) — 시장 값 · 종가 굳음 · 고르기 규칙
import test from 'node:test';
import assert from 'node:assert/strict';
import {WORLD, WORLD_IDS, worldOf, closeFinal, localTime, worldPlace, worldMarketOf} from '../../lib/atlas11/world/markets.mjs';
import {worldRules, selectWorld} from '../../lib/atlas11/world/universe.mjs';

test('시장 셋 — 거래소 이름(깃허브 시험에서 열린 것) · 그 나라 시각 · 돈 단위', () => {
  assert.deepEqual(WORLD_IDS, ['cn', 'jp', 'vn']);
  assert.deepEqual(WORLD.cn.exchanges, ['SHANGHAI', 'SHENZHEN']); assert.deepEqual(WORLD.jp.exchanges, ['TOKYO']); assert.deepEqual(WORLD.vn.exchanges, ['HOCHIMINH', 'HANOI']);
  assert.deepEqual(WORLD_IDS.map(id => WORLD[id].unit), ['위안', '엔', '동']);
  assert.deepEqual(WORLD_IDS.map(id => WORLD[id].close), ['15:00', '15:30', '15:00']);
  assert.throws(() => worldOf('xx'), /WORLD_MARKET/);
  assert.equal(WORLD.vn.yahoo('VNM.HM'), 'VNM.VN'); assert.equal(WORLD.vn.yahoo('SHS.HN'), 'SHS.VN'); assert.equal(WORLD.cn.yahoo('600519.SS'), '600519.SS');
});

test('종가 굳음 — 그 나라 마감 1시간 뒤부터(장중 값은 종가로 쓰지 않음)', () => {
  const jp = WORLD.jp; // 도쿄 = UTC+9 · 마감 15:30 · 16:30 부터 굳음
  assert.equal(localTime('Asia/Tokyo', '2026-10-07T06:00:00Z').hm, '15:00');
  assert.equal(closeFinal(jp, '2026-10-07', new Date('2026-10-07T06:00:00Z')), false); // 15:00 도쿄
  assert.equal(closeFinal(jp, '2026-10-07', new Date('2026-10-07T07:31:00Z')), true); // 16:31 도쿄
  assert.equal(closeFinal(jp, '2026-10-06', new Date('2026-10-07T00:00:00Z')), true); // 지난날
  const cn = WORLD.cn; // 상하이 = UTC+8 · 16:00 부터
  assert.equal(closeFinal(cn, '2026-10-07', new Date('2026-10-07T07:59:00Z')), false);
  assert.equal(closeFinal(cn, '2026-10-07', new Date('2026-10-07T08:00:00Z')), true);
});

test('화면 값 — 그 나라 돈 · 마감 시각 · 수급 없음 · 지수 띠', () => {
  const p = worldPlace(WORLD.vn, {news: '네이버 증권 해외주식 뉴스'});
  assert.equal(p.id, 'vn'); assert.equal(p.unit, '동'); assert.equal(p.digits, 0); assert.equal(p.flows, false);
  assert.equal(p.close, '15:00(호찌민)'); assert.equal(p.closeAt, '15:00 호찌민 시각'); assert.match(p.foot, /네이버 증권 해외주식 뉴스/);
  const mk = worldMarketOf(WORLD.jp, {day: '2026-10-07', index: [{symbol: '.N225', rows: [{date: '2026-10-06', close: 1, changePct: 0.5}]}, {symbol: '.TOPX', rows: []}]});
  assert.equal(mk.items.length, 1); assert.equal(mk.items[0].name, '닛케이 225'); assert.equal(mk.closeTime, '15:30 도쿄 시각');
});

test('고르기 — 미국 판 규칙 그대로 · 베트남은 5곳을 채운 업종 수만큼', () => {
  assert.equal(worldRules(WORLD.cn).count, 365); assert.equal(worldRules(WORLD.jp).industries, 73);
  // 업종 12개 × 6곳(모두 우량) — 베트남(flexible)은 12개 업종 · 60곳으로 · 중국(고정 73개)은 모자라 ok 아님
  const cands = [];
  for (let g = 0; g < 12; g++) for (let k = 0; k < 6; k++) cands.push({code: `C${g}${k}`, name: `회사${g}-${k}`, nameEn: `Co ${g} ${k}`, industry: `업종${g}`, capUsd: 1000 - g * 10 - k, capRank: g * 6 + k + 1,
    history: {rows: 260, ok: true}, metrics: {op: 1, opPrev: 1, net: 1, netPrev: 1, roe: 10, debt: 50}});
  const vn = selectWorld(cands, WORLD.vn), cn = selectWorld(cands, WORLD.cn);
  assert.equal(vn.ok, true); assert.equal(vn.rules.industries, 12); assert.equal(vn.picked.length, 60);
  assert.equal(cn.ok, false);
});
