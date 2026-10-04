// 출목표(바카라 표) — site/app/road.js · 2026-10-04 사장님 「바카라 그 표가 곳곳에」 · 15:37 「이제 예측을 하지 않는다」 뒤에도 지난 오르내림 표로 남음
//   (게임을 지웠으므로 게임 코드와 글자 대조는 없앴다 — 대신 52곳 실제 종가로 따로 센 값과 맞대어 본다)
import test from 'node:test';
import assert from 'node:assert/strict';
import {roadOf, roadLayout, roadStory, balance, STORY, WORD, ROAD_UNITS, ROAD_MAX_COLS, ROAD_RECENT} from '../../site/app/road.js';
import {companyOf} from '../../lib/atlas11/board.mjs';
import {readJSON, INPUT_928} from './helpers.mjs';

test('정한 값: 한 칸 1%·2%·3%·5% · 24줄 · 최근 5일 · 흐름 한 마디 아홉 칸 · 저울 낱말', () => {
  assert.deepEqual([ROAD_UNITS, ROAD_MAX_COLS, ROAD_RECENT], [[0.01, 0.02, 0.03, 0.05], 24, 5]);
  assert.deepEqual(Object.keys(STORY), ['up', 'flat', 'down']); assert.ok(Object.values(STORY).every(r => Object.keys(r).join() === 'up,flat,down'));
  assert.deepEqual(WORD, {up: '오름이 셈', down: '내림이 셈', flat: '비슷함', still: '잠잠함'});
});

test('52곳 실제 종가(9/28 입력 사본 · 판과 같은 21개)로: 동그라미 수 = 날마다 반올림(|등락| ÷ 한 칸)의 합 · 두 저울 · 흐름 한 마디가 따로 센 값과 같다', async () => {
  const input = await readJSON(INPUT_928);
  const TABLE = {up: {up: '계속 오르는 흐름', flat: '오르다가 요즘 쉬는 중', down: '오르다가 요즘 꺾임'}, flat: {up: '요즘은 오름 쪽', flat: '뚜렷한 쪽 없음', down: '요즘은 내림 쪽'}, down: {up: '내리다가 요즘 반등', flat: '내리다가 요즘 쉬는 중', down: '계속 내리는 흐름'}};
  for (const a of input.assets) {
    const st = companyOf(a, {limitDay: '2026-09-28'});
    assert.equal(st.c.length, 21, a.code + ' 종가 21개'); assert.equal(st.c.at(-1), st.close, a.code + ' 마지막 = 판의 종가');
    const road = roadOf(st.c), unit = road.unit, rets = st.c.slice(1).map((v, i) => v / st.c[i] - 1), n = r => Math.round(Math.abs(r) / unit), D = rets.length;
    const sum = (rs, sign) => rs.filter(r => sign > 0 ? r > 0 : r < 0).reduce((s, r) => s + n(r), 0);
    const bal = (u, d) => u + d <= 1 ? 'still' : Math.abs(u - d) <= Math.max(1, (u + d) * .1) ? 'flat' : u > d ? 'up' : 'down';
    const side = rs => { const o = {up: sum(rs, 1), down: sum(rs, -1)}; o.side = bal(o.up, o.down); return o; };
    const A = side(rets), E = side(rets.slice(0, Math.max(0, D - 5))), N = side(rets.slice(-5)), calm = x => x === 'still' ? 'flat' : x;
    assert.equal(road.cells.length, A.up + A.down, a.code); assert.equal(road.all.up, A.up); assert.equal(road.all.down, A.down);
    assert.deepEqual([road.before.up, road.before.down, road.before.side], [E.up, E.down, E.side], a.code + ' 처음');
    assert.deepEqual([road.now.up, road.now.down, road.now.side], [N.up, N.down, N.side], a.code + ' 최근');
    assert.equal(roadStory(road).text, E.side === 'still' && N.side === 'still' ? `${D}거래일 내내 거의 안 움직임` : TABLE[calm(E.side)][calm(N.side)], a.code + ' 흐름');
    assert.ok(road.cols <= ROAD_MAX_COLS || unit === ROAD_UNITS.at(-1), a.code + ' 24줄 안 또는 가장 큰 칸');
  }
});

test('빈 값·짧은 값도 깨지지 않는다 · 같은 쪽은 아래로, 바뀌면 새 줄', () => {
  assert.equal(roadOf([]).cells.length, 0); assert.equal(roadOf([100]).days, 0);
  const lay = roadLayout([0.021, 0.012, -0.03], 0.01); // 오름 2개 → 오름 1개(아래로) → 내림 3개(새 줄)
  assert.deepEqual(lay.cells.map(c => [c.col, c.row, c.side]), [[0, 0, 'up'], [0, 1, 'up'], [0, 2, 'up'], [1, 0, 'down'], [1, 1, 'down'], [1, 2, 'down']]);
  assert.equal(balance(1, 0).side, 'still'); assert.equal(balance(5, 5).side, 'flat'); assert.equal(balance(9, 2).side, 'up');
  assert.equal(WORD.flat, '비슷함'); assert.equal(STORY.down.up, '내리다가 요즘 반등');
});
