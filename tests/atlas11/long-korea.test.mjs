// 500만 원을 오래 들고 있었다면(#/long · 2026-10-07 05:27) · 한국 주식시장은 몇 위인가(#/korea · 05:29) — 화면 숫자가 조사 기록과 같은가 · 앞날 말이 없는가
import test from 'node:test';
import assert from 'node:assert/strict';
// 화면 모듈은 브라우저 주소(location)를 읽으므로 빈 주소를 먼저 둔다(시험 i18n.test.mjs 와 같은 방법)
globalThis.location ??= {pathname: '/', search: '', hash: '', href: 'http://localhost/'};
const {LONG} = await import('../../site/app/view-long.js');
const {RANKS} = await import('../../site/app/view-korea.js');
import {PREDICTION_WORDS} from '../../lib/atlas11/board.mjs';

const rowsOf = () => LONG.flatMap(([, , list]) => list);

test('500만 원: 갈래 여섯 · 줄 14개 · 묶음은 끝 해 - 시작 해 = 10 · 20 · 30년', () => {
  assert.deepEqual(LONG.map(g => g[0]), ['시장 전체', '아파트', '성장 기업', '이름난 회사', '독점 기업', '고배당']);
  assert.equal(rowsOf().length, 14);
  for (const [name, w] of rowsOf()) for (const y of [10, 20, 30]) {
    const r = w[y]; if (r == null) continue;
    assert.equal(r.length, 4, name);
    const [won, from, to, n] = r;
    assert.ok(Number.isInteger(won) && won > 0, `${name} ${y}년 돈`);
    assert.equal(to - from, y, `${name} ${y}년 묶음 ${from}~${to}`);
    assert.ok(to <= 2025, `${name} 끝난 해만(${to})`);
    assert.ok(Number.isInteger(n) && n >= 1, `${name} 묶음 수`);
  }
});

test('500만 원: 맨 위 그림 숫자 = 조사 기록(가장 나빴던 묶음) · 갈래마다 경고는 회사 갈래 둘만', () => {
  const kospi = LONG[0][2][0][1], seoul = LONG[1][2][0][1];
  assert.deepEqual([10, 20, 30].map(y => kospi[y][0]), [349, 785, 1604]);
  assert.deepEqual([10, 20, 30].map(y => seoul[y][0]), [493, 1098, 1760]);
  assert.deepEqual([10, 20, 30].map(y => kospi[y].slice(1, 3)), [[1988, 1998], [1988, 2008], [1988, 2018]]);
  assert.deepEqual(LONG.map(g => !!g[1]), [false, false, false, true, true, false]);
});

test('몇 위: 순위 10가지 · 순위는 1~견준 수 안', () => {
  assert.equal(RANKS.length, 10);
  for (const [what, v, r, n] of RANKS) { assert.ok(Number.isInteger(r) && r >= 1 && r <= n, `${what} ${r}/${n}`); assert.ok(/\d/.test(v), what); }
  assert.deepEqual(RANKS.map(x => [x[2], x[3]]), [[2, 25], [1, 25], [1, 13], [3, 25], [15, 25], [25, 25], [1, 25], [8, 25], [8, 22], [8, 12]]);
});

test('두 화면 글에 앞날 말 · 사라 팔라 말이 없음', () => {
  const texts = [...LONG.flatMap(([t, w, list]) => [t, w ?? '', ...list.flatMap(([name, , note]) => [name, note ?? ''])]), ...RANKS.flatMap(x => [x[0], x[1], x[4]])];
  for (const s of texts) assert.ok(!PREDICTION_WORDS.test(s), s);
});
