// 출목표 모양(site/app/shapes.js) — 2026-10-05 13:53 사장님 「출목표를 보면 상승할 때에 묘한 공통점들이 있을 거 아냐 … 반짝반짝 해가지고 바보도 알 수 있게끔」
// 후보 모양 여덟을 만든 종가로 하나씩 시험하고, 지금 판에서 공통 모양 · 반짝 칸이 규칙대로 나오는지 본다(앞날 말 없음).
import test from 'node:test';
import assert from 'node:assert/strict';
import {SHAPES, SHAPE_PICS, shapeBoard, SHAPE_TOP} from '../../site/app/shapes.js';
import {roadOf} from '../../site/app/road.js';
import {PREDICTION_WORDS} from '../../lib/atlas11/board.mjs';
import {readJSON} from './helpers.mjs';

const board = await readJSON('public/data/atlas11/view/board.json');
/** 하루 변화(%) 목록 → 종가 21개(첫날 10,000) */
const closesOf = pcts => pcts.reduce((cs, p) => [...cs, cs.at(-1) * (1 + p / 100)], [10000]);
const has = (id, pcts) => SHAPES.find(s => s.id === id).test(roadOf(closesOf(pcts)));

test('모양: 긴 빨강 줄 — 빨강 6개 이상이 끊김 없이(작은 움직임은 줄을 끊지 않음)', () => {
  assert.equal(has('longRed', [2, 2, 2, ...Array(17).fill(-1)]), true);          // +2% 사흘 = 빨강 6개
  assert.equal(has('longRed', [2, 2, 0.2, 2, -1, -1, ...Array(14).fill(0)]), true); // 0.2% 는 동그라미 없음 → 줄이 안 끊김 · 2+2+2 = 6개
  assert.equal(has('longRed', [2, 2, 0.2, 1, -1, -1, ...Array(14).fill(0)]), false); // 2+2+1 = 5개
  assert.equal(has('longRed', [2, 2, -1, 2, ...Array(16).fill(0)]), false);       // 파랑이 끊음
});

test('모양: 하루 빨강 5개 · 끝 5일 빨강 · 끝 줄 빨강 · 빨강이 파랑의 2배', () => {
  assert.equal(has('bigRedDay', [5, ...Array(19).fill(-1)]), true);
  assert.equal(has('bigRedDay', [4, ...Array(19).fill(1)]), false);
  assert.equal(has('recentRed', [...Array(15).fill(-1), 1, 1, 1, -1, 1]), true);    // 끝 5일 빨강 4 · 파랑 1
  assert.equal(has('recentRed', [...Array(15).fill(1), 1, -1, 1, -1, 1]), false);   // 3 대 2 — 2개 이상 차이 아님
  assert.equal(has('lastRed', [...Array(19).fill(-1), 1]), true);
  assert.equal(has('lastRed', [...Array(19).fill(1), -1]), false);
  assert.equal(has('redTwice', [1, 1, -1, 1, 1, -1, ...Array(14).fill(0)]), true);  // 4 대 2
  assert.equal(has('redTwice', [1, 1, -1, 1, -1, -1, ...Array(14).fill(0)]), false);
});

test('모양: 이름 · 글 · 그림 — 여덟 모두 있고 앞날 말 없음', () => {
  assert.equal(SHAPES.length, 8);
  assert.equal(new Set(SHAPES.map(s => s.id)).size, 8);
  for (const s of SHAPES) {
    assert.ok(s.name && s.short && s.text, s.id);
    assert.ok(!PREDICTION_WORDS.test(s.name + s.text + s.short), s.id);
    assert.ok(SHAPE_PICS[s.id]?.cells.length > 0, s.id);
  }
});

test('반짝: 지금 판 — 위 20% · 공통 모양 규칙 · 반짝 칸은 공통 모양을 모두 가짐', () => {
  const r = shapeBoard(board.companies), N = board.companies.length;
  assert.equal(r.topN, Math.round(N * SHAPE_TOP)); assert.equal(r.topN + r.restN, N);
  assert.ok(r.common.length >= 3, `공통 모양 ${r.common.length}가지`);
  for (const t of r.traits) {
    assert.ok(t.top.yes <= t.top.n && t.rest.yes <= t.rest.n);
    if (t.common && r.traits.filter(x => x.topShare > 0.5 && x.gap > 0.1).length >= 3) assert.ok(t.topShare > 0.5 && t.gap > 0.1, t.id);
  }
  for (const c of board.companies) {
    const all = r.common.every(id => SHAPES.find(s => s.id === id).test(roadOf(c.c)));
    assert.equal(r.sparkle.has(c.code), all, c.name);
  }
  assert.ok(r.sparkle.size > 0 && r.sparkle.size < N);
});
