// 출목표(바카라 표) — 사이트(site/app/road.js)와 게임(site/game/game.js)이 같은 규칙인가 · 2026-10-04 사장님 「바카라 그 표가 곳곳에」
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import {roadOf, roadLayout, roadStory, balance, STORY, WORD, ROAD_UNITS, ROAD_MAX_COLS, ROAD_RECENT} from '../../site/app/road.js';
import {root, readJSON} from './helpers.mjs';

const squash = t => t.replace(/\s+/g, ' ').trim();
const grab = (src, start, endMark) => { const i = src.indexOf(start); assert.ok(i >= 0, start); const j = src.indexOf(endMark, i); return squash(src.slice(i, j)); };

test('같은 규칙: 표 쌓는 법(roadLayout) · 저울(balance) · 흐름 한 마디 표 · 저울 낱말 · 단위·칸 수가 게임과 글자까지 같다', async () => {
  const game = await fs.readFile(path.join(root, 'site/game/game.js'), 'utf8'), site = await fs.readFile(path.join(root, 'site/app/road.js'), 'utf8');
  assert.equal(grab(site, 'function roadLayout(rets, unit) {', '\n}\n'), grab(game, 'function roadLayout(rets, unit) {', '\n}\n'));
  assert.equal(grab(site, 'const balance = ', ';\n'), grab(game, 'const balance = ', ';\n'));
  assert.equal(grab(site, 'const STORY = {', '};'), grab(game, 'const STORY = {', '};'));
  assert.equal(grab(site, "const WORD = {", '};'), grab(game, "const WORD = {", '};'));
  assert.match(game, /const ROAD_UNITS = \[0\.01, 0\.02, 0\.03, 0\.05\], ROAD_MAX_COLS = 24, ROAD_RECENT = 5;/);
  assert.deepEqual([ROAD_UNITS, ROAD_MAX_COLS, ROAD_RECENT], [[0.01, 0.02, 0.03, 0.05], 24, 5]);
});

test('게임 카드 52장의 실제 종가로: 동그라미 수 = 날마다 반올림(|등락| ÷ 한 칸)의 합 · 두 저울 · 흐름 한 마디가 화면 검사(browser_check)의 셈과 같다', async () => {
  const game = await readJSON('public/data/atlas11/view/game.json');
  const TABLE = {up: {up: '계속 오르는 흐름', flat: '오르다가 요즘 쉬는 중', down: '오르다가 요즘 꺾임'}, flat: {up: '요즘은 오름 쪽', flat: '뚜렷한 쪽 없음', down: '요즘은 내림 쪽'}, down: {up: '내리다가 요즘 반등', flat: '내리다가 요즘 쉬는 중', down: '계속 내리는 흐름'}};
  for (const st of game.live.stocks) {
    const road = roadOf(st.c), unit = road.unit, rets = st.c.slice(1).map((v, i) => v / st.c[i] - 1), n = r => Math.round(Math.abs(r) / unit), D = rets.length;
    const sum = (rs, sign) => rs.filter(r => sign > 0 ? r > 0 : r < 0).reduce((a, r) => a + n(r), 0);
    const bal = (u, d) => u + d <= 1 ? 'still' : Math.abs(u - d) <= Math.max(1, (u + d) * .1) ? 'flat' : u > d ? 'up' : 'down';
    const side = rs => { const o = {up: sum(rs, 1), down: sum(rs, -1)}; o.side = bal(o.up, o.down); return o; };
    const A = side(rets), E = side(rets.slice(0, Math.max(0, D - 5))), N = side(rets.slice(-5)), calm = x => x === 'still' ? 'flat' : x;
    assert.equal(road.cells.length, A.up + A.down, st.code); assert.equal(road.all.up, A.up); assert.equal(road.all.down, A.down);
    assert.deepEqual([road.before.up, road.before.down, road.before.side], [E.up, E.down, E.side], st.code + ' 처음');
    assert.deepEqual([road.now.up, road.now.down, road.now.side], [N.up, N.down, N.side], st.code + ' 최근');
    assert.equal(roadStory(road).text, E.side === 'still' && N.side === 'still' ? `${D}거래일 내내 거의 안 움직임` : TABLE[calm(E.side)][calm(N.side)], st.code + ' 흐름');
    assert.ok(road.cols <= ROAD_MAX_COLS || unit === ROAD_UNITS.at(-1), st.code + ' 24줄 안 또는 가장 큰 칸');
  }
});

test('빈 값·짧은 값도 깨지지 않는다 · 같은 쪽은 아래로, 바뀌면 새 줄', () => {
  assert.equal(roadOf([]).cells.length, 0); assert.equal(roadOf([100]).days, 0);
  const lay = roadLayout([0.021, 0.012, -0.03], 0.01); // 오름 2개 → 오름 1개(아래로) → 내림 3개(새 줄)
  assert.deepEqual(lay.cells.map(c => [c.col, c.row, c.side]), [[0, 0, 'up'], [0, 1, 'up'], [0, 2, 'up'], [1, 0, 'down'], [1, 1, 'down'], [1, 2, 'down']]);
  assert.equal(balance(1, 0).side, 'still'); assert.equal(balance(5, 5).side, 'flat'); assert.equal(balance(9, 2).side, 'up');
  assert.equal(WORD.flat, '비슷함'); assert.equal(STORY.down.up, '내리다가 요즘 반등');
});
