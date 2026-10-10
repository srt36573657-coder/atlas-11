// 「후보 7」 칸 그림 셈(site/app/tiles-model.js) — 사장님 2026-10-10 09:51 · 09:53(마카오) 「3d 영구 삭제해」 · 「모두다」(옛 입체 섬 island-model.js 를 바꿈)
//   칸 하나 = 회사 하나 · 묶음 셋(그물 안 = 판 읽기 flags 다섯째 · 그물 밖 · 1년 추세를 셀 수 없음) · 묶음 안은 1년 추세 큰 차례 · 한 줄 COLS 칸 · 20거래일 전 그물 안 = 그 날 기준선(grow.qp) 이상
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {tilesModel, COLS, tapStep, tapInfo, zoneOf, pctTxt, placeTxt} from '../../site/app/tiles-model.js';

/** 작은 판 — 업종 셋(가 · 나 · 다 · 다섯 곳씩) · m = [오늘 1년 추세, 20거래일 전] · f = flags(그날 종가 · 흑자 · 위험 공시 없음 · 추세 셈 · 그물 안 · 새로 듦) */
const ROWS = [
  ['a1', '가', [1.2, 0.9], '111111'], ['a2', '가', [0.9, 0.5], '111110'], ['a3', '가', [0.8, 0.2], '011111'], ['a4', '가', [0.1, 0.1], '111100'], ['a5', '가', [null, 0.3], '110000'],
  ['b1', '나', [0.7, 0.1], '111111'], ['b2', '나', [0.3, 0.6], '111100'], ['b3', '나', [0.2, 0.2], '111100'], ['b4', '나', [-0.1, 0.0], '111100'], ['b5', '나', [-0.3, -0.2], '111100'],
  ['c1', '다', [0.0, 0.4], '111100'], ['c2', '다', [-0.2, 0.0], '111100'], ['c3', '다', [-0.4, -0.1], '111100'], ['c4', '다', [-0.5, -0.5], '111100'], ['c5', '다', [-0.6, null], '111100']];
const stocks = ROWS.map(([code, g]) => ({code, name: '회사' + code, g, gl: '업종' + g}));
const C = {grow: {m: Object.fromEntries(ROWS.map(r => [r[0], r[2]])), qp: 45}, flags: Object.fromEntries(ROWS.map(r => [r[0], r[3]])),
  items: [{code: 'a1', rank: 1, status: 'met'}, {code: 'b1', rank: 2, status: 'met'}]};

test('묶음 셋 — 그물 안(flags 다섯째) · 그물 밖 · 셀 수 없음 · 초록 = 그물 안이면서 기준 셋을 넘은 곳', () => {
  const M = tilesModel(C, stocks), by = Object.fromEntries(M.cells.map(c => [c.code, c]));
  assert.equal(M.cells.length, 15);
  for (const c of M.cells) { const up = String(C.flags[c.code])[4] === '1' && C.grow.m[c.code][0] !== null; assert.equal(c.up, up, c.code); assert.equal(c.blk, C.grow.m[c.code][0] === null ? 2 : up ? 0 : 1, c.code); }
  assert.deepEqual(M.blocks, [4, 10, 1]); assert.equal(M.above, 4); assert.equal(M.none, 1);
  assert.equal(M.green, 3); // 그물 안 a1 a2 a3 b1 넷 · 초록 = 그 가운데 앞 셋이 111 인 a1 a2 b1 셋(a3 은 그날 종가 없음 '011')
  assert.equal(by.a5.blk, 2, '1년 추세를 셀 수 없으면 셋째 묶음(지어내지 않음)'); assert.equal(by.a5.m12, null);
  assert.equal(M.sectors, 3);
});

test('차례 = 묶음 ① → ② → ③ · 묶음 안은 1년 추세 큰 순 · 줄마다 COLS 칸 · 자리(row · col)가 겹치지 않음', () => {
  const M = tilesModel(C, stocks), codes = M.order.map(i => M.cells[i].code);
  assert.deepEqual(codes, ['a1', 'a2', 'a3', 'b1', 'b2', 'b3', 'a4', 'c1', 'b4', 'c2', 'b5', 'c3', 'c4', 'c5', 'a5']);
  for (const b of [0, 1, 2]) { const cs = M.order.map(i => M.cells[i]).filter(c => c.blk === b); cs.forEach((c, k) => { assert.equal(c.k, k); assert.equal(c.row, Math.floor(k / COLS)); assert.equal(c.col, k % COLS); }); }
  assert.equal(COLS, 20);
  const big = Array.from({length: 45}, (_, k) => ({code: 'x' + String(k).padStart(2, '0'), g: 'g' + (k % 4)})), CB = {grow: {m: Object.fromEntries(big.map((s, k) => [s.code, [1 - k / 50, 0]])), qp: 0}, flags: Object.fromEntries(big.map(s => [s.code, '111110']))};
  const MB = tilesModel(CB, big), last = MB.cells[MB.order.at(-1)];
  assert.deepEqual([last.row, last.col], [2, 4], '45곳 = 두 줄 반(20 · 20 · 5)');
  assert.equal(new Set(MB.cells.map(c => `${c.blk}:${c.row}:${c.col}`)).size, 45, '자리가 겹치지 않음');
});

test('20거래일 전 그물 안 — 그 날 기준선(grow.qp %) 이상 · 후보는 그때 그물 밖(새로 듦) · 7곳 = 순위 차례', () => {
  const M = tilesModel(C, stocks), by = Object.fromEntries(M.cells.map(c => [c.code, c]));
  for (const c of M.cells) { const mp = C.grow.m[c.code][1]; assert.equal(c.upP, mp !== null && mp >= 0.45, c.code); }
  assert.ok(!by.b1.upP && by.b1.up, '후보 b1 은 20거래일 전 그물 밖 → 오늘 그물 안');
  assert.deepEqual(M.seven.map(i => M.cells[i].code), ['a1', 'b1']); assert.deepEqual(M.seven.map(i => M.cells[i].rank), [1, 2]);
  assert.equal(by.b1.m12, 70); assert.equal(by.b1.m12p, 10);
});

test('값이 없으면 칸 그림을 그리지 않음(지어내지 않음) · 이름표 글', () => {
  assert.equal(tilesModel(null, stocks), null); assert.equal(tilesModel({grow: null}, stocks), null); assert.equal(tilesModel(C, []), null);
  const by = Object.fromEntries(tilesModel(C, stocks).cells.map(c => [c.code, c]));
  assert.equal(placeTxt(by.a1), '그물 안'); assert.equal(placeTxt(by.a3), '그물 안 · 기준 못 넘음'); assert.equal(placeTxt(by.b2), '그물 밖'); assert.equal(placeTxt(by.a5), '1년 추세 셀 수 없음');
  assert.equal(pctTxt(70), '+70.0%'); assert.equal(pctTxt(-0.04), '0.0%'); assert.equal(pctTxt(null), '셀 수 없음');
});

test('3단 클릭(2026-10-09 21:33) — 칸을 누르면 그 회사 · 그 업종(같은 g 다섯 곳 · 1년 추세 큰 순 · 누른 회사 표시) · 같은 칸 · 빈 곳 = 닫힘 · 고리 #/stock · #/i', () => {
  const cells = tilesModel(C, stocks).cells, j = cells.findIndex(c => c.code === 'b2'), s1 = tapStep(cells, null, j), info = tapInfo(cells, s1);
  assert.equal(s1.i, j); assert.equal(s1.z, zoneOf(cells[j])); assert.equal(info.co.href, '#/stock/b2'); assert.equal(info.zone.href, '#/i/나'); assert.equal(info.zone.label, '업종나');
  assert.deepEqual(info.zone.cos.map(x => x.code), ['b1', 'b2', 'b3', 'b4', 'b5']);
  assert.equal(info.zone.cos.filter(x => x.on).map(x => x.code).join(), 'b2');
  assert.deepEqual(tapStep(cells, s1, j), {z: null, i: -1}); assert.equal(tapInfo(cells, tapStep(cells, s1, j)), null);
  const k = cells.findIndex(c => c.code === 'c1'); assert.equal(tapStep(cells, s1, k).i, k); assert.notEqual(tapStep(cells, s1, k).z, s1.z);
  assert.deepEqual(tapStep(cells, s1, -1), {z: null, i: -1});
  const a = tapInfo(cells, tapStep(cells, null, cells.findIndex(c => c.code === 'a4'))); assert.deepEqual(a.zone.cos.map(x => x.code), ['a1', 'a2', 'a3', 'a4', 'a5'], '셀 수 없는 곳은 뒤');
});

test('입체 없음 — ATLAS 화면 코드(site/app · 초대장 사진 · 소개 영상 빼고)에 입체 섬 · 지도 섬 · 입체 막대 · 원근이 없음(2026-10-10 「3d 영구 삭제해」 · 「가 나 는 지우지마」)', () => {
  const dir = path.resolve(import.meta.dirname, '../../site/app'), KEEP = new Set(['invite.js', 'invite-photo.js', 'invite.css', 'hello.js', 'hello.css', 'hello-page.js', 'hello-share.js']); // 가(초대장 사진) · 나(공주님 영상)는 사장님 10:00 「가 나 는 지우지마」
  const BAD = /perspective\s*:|preserve-3d|rotate[XY]\(|rotate3d\(|translate3d\(|translateZ\(|matrix3d\(|getContext\(\s*['"]webgl|skew[XY]\(|--d3\b|drop-shadow\(|from '\.\/island|islandmap|candIsland/;
  const hits = [];
  for (const f of fs.readdirSync(dir)) { if (KEEP.has(f) || !/\.(js|css)$/.test(f)) continue; const t = fs.readFileSync(path.join(dir, f), 'utf8'); t.split('\n').forEach((l, n) => { if (BAD.test(l)) hits.push(`${f}:${n + 1}`); }); }
  assert.deepEqual(hits, []);
  for (const f of ['island.js', 'island-model.js', 'islandmap.js']) assert.ok(!fs.existsSync(path.join(dir, f)), `${f} 이 남아 있음`);
  assert.ok(!/<canvas/i.test(fs.readFileSync(path.resolve(dir, '../index.html'), 'utf8')));
});
