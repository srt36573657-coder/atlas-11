// 큰 갈래(site/app/family.js) — 2026-10-05 10:24 사장님 「잡스라면 … 36가지」 → 「나 여기서 클릭하면 업로드되게 만들어 줘」
// 19번(업종 탭 맨 위 큰 갈래 단추) · 20번(불장 업종을 큰 흐름으로) — 화면에서만 묶는 표라 판 자료는 그대로다.
// 지금 판(public/data/atlas11/view/board.json)의 업종이 모두 갈래를 찾는지 본다 — 새 업종 이름이 생기면 여기서 먼저 걸린다.
import test from 'node:test';
import assert from 'node:assert/strict';
import {FAMILIES, OTHER, familyOf, groupByFamily} from '../../site/app/family.js';
import {readJSON} from './helpers.mjs';

const board = await readJSON('public/data/atlas11/view/board.json');

test('큰 갈래: 지금 판의 업종이 모두 갈래를 찾는다(「그 밖」 0)', () => {
  const miss = board.groups.filter(g => familyOf(g.label).id === OTHER.id).map(g => g.label);
  assert.deepEqual(miss, [], `갈래를 못 찾은 업종: ${miss.join(' · ')}`);
});

test('큰 갈래: 한 이름이 두 갈래에 들지 않고, 비슷한 이름을 섞지 않는다', () => {
  const all = FAMILIES.flatMap(f => f.names);
  assert.equal(new Set(all).size, all.length);
  assert.equal(familyOf('통신').id, 'media'); assert.equal(familyOf('통신장비').id, 'elec');
  assert.equal(familyOf('항공').id, 'auto'); assert.equal(familyOf('항공·우주').id, 'mach');
  assert.equal(familyOf('디스플레이').id, 'elec'); assert.equal(familyOf('반도체 검사·측정').id, 'semi');
  assert.equal(familyOf('  반도체  ').id, 'semi'); assert.equal(familyOf('처음 보는 업종').id, OTHER.id);
});

test('큰 갈래: 묶어도 업종을 빠뜨리거나 차례를 바꾸지 않는다', () => {
  const flows = groupByFamily(board.groups);
  assert.equal(flows.reduce((s, f) => s + f.groups.length, 0), board.groups.length);
  for (const f of flows) for (let i = 1; i < f.groups.length; i++) assert.ok(board.groups.indexOf(f.groups[i - 1]) < board.groups.indexOf(f.groups[i]));
  const firsts = flows.map(f => board.groups.indexOf(f.groups[0]));
  assert.deepEqual(firsts, [...firsts].sort((a, b) => a - b));
});

test('큰 갈래: 지금 판 불장 업종의 큰 흐름 — 갈래마다 업종 수 합 = 불장 수', () => {
  const hot = board.groups.filter(g => g.hot), flows = groupByFamily(hot);
  assert.equal(flows.reduce((s, f) => s + f.groups.length, 0), hot.length);
  assert.ok(flows.length >= 1 && flows.length <= hot.length);
});
