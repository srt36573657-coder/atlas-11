// 세 태세 시험(주문 1120-0728 · 사장님 2026-11-20(마카오) 07:28 「… 공격형 지략 그리고 보편적 지략 그리고 수비형 지략을 전술화하여 …」 · 07:32 「맞아」)
//   site/su/su-stance.js — 지난 같은 땅 기록(sun.rank)으로만 고름 · 한 꾀는 한 태세에만 · 맞는 꾀가 없으면 비움(억지로 채우지 않음)
import test from 'node:test';
import assert from 'node:assert/strict';
import {stance3, okRow, won100, lostOf100, STANCES, STANCE_RULE} from '../../site/su/su-stance.js';

const row = (k, n, lose, avg, worst, exp = 20) => ({k, n, lose, avg, worst, avgLoss: -0.02, exp, tail: -0.06, tail7: -0.09});
const sun = (rank, ks = [], minN = 20) => ({rule: 'sun-v1', minN, rank, win3: {rule: 'win3-v1', minN, ks}});

test('줄 차례는 늘 수비 → 보편 → 공격', () => {
  assert.deepEqual(STANCES.map(d => d.st), ['def', 'mid', 'att']);
  assert.deepEqual(STANCES.map(d => d.tag), ['수비형', '보편형', '공격형']);
  assert.equal(STANCE_RULE, 'stance3-v1');
});

test('수비형 = win3 첫째 · 공격형 = 남은 꾀 가운데 평균이 가장 높은 꾀 · 보편형 = 잃은 몫 차례 + 평균 차례가 가장 고른 꾀', () => {
  const S = sun([row('g01', 40, 8, 0.004, -0.08), row('g02', 40, 9, 0.012, -0.09), row('g03', 40, 10, 0.020, -0.15), row('g04', 40, 11, 0.009, -0.10), row('g05', 40, 12, 0.001, -0.07)], ['g01', 'g02']);
  const r = stance3(S);
  assert.equal(r.def.k, 'g01');
  assert.equal(r.att.k, 'g03'); // 평균 0.020
  assert.equal(r.mid.k, 'g02'); // 남은 g02 · g04 · g05 가운데 잃은 몫 차례 0 + 평균 차례 0
  assert.equal(new Set([r.def.k, r.mid.k, r.att.k]).size, 3);
});

test('win3 이 비면 덜 잃은 차례 맨 위가 수비형', () => {
  const S = sun([row('g07', 40, 8, -0.001, -0.06), row('g01', 40, 9, 0.003, -0.07)], []);
  assert.equal(stance3(S).def.k, 'g07');
});

test('평균이 0 넘는 꾀가 없으면 공격형은 비움(억지로 채우지 않음)', () => {
  const S = sun([row('g01', 40, 8, -0.001, -0.06), row('g02', 40, 9, -0.002, -0.07), row('g03', 40, 10, -0.004, -0.09)], ['g01']);
  const r = stance3(S);
  assert.equal(r.att, null);
  assert.equal(r.def.k, 'g01');
  assert.ok(r.mid && r.mid.k !== 'g01');
});

test('아무렇게나 고른 일곱보다 더 자주 잃은 꾀는 공격형 · 보편형에 들지 않음', () => {
  const S = sun([row('g01', 40, 8, 0.001, -0.06), row('g02', 40, 25, 0.050, -0.20, 18), row('g03', 40, 12, 0.010, -0.09, 18)], ['g01']);
  const r = stance3(S);
  assert.equal(r.att.k, 'g03');
  assert.equal(r.mid, null); // 남은 g02 는 잃은 날 25 > 아무렇게나 18
});

test('센 날이 minN 아래인 꾀는 쓰지 않음 · 모두 모자라면 셋 다 비움', () => {
  const S = sun([row('g01', 12, 2, 0.01, -0.05), row('g02', 19, 3, 0.02, -0.06)], ['g01']);
  const r = stance3(S);
  assert.deepEqual([r.def, r.mid, r.att], [null, null, null]);
  assert.equal(okRow(row('g01', 20, 2, 0.01, -0.05), 20), true);
  assert.equal(okRow({k: 'g01', n: 30, lose: 31, avg: 0, worst: -0.1}, 20), false); // 잃은 날이 센 날보다 많음
  assert.equal(okRow({k: 'g01', n: 30, lose: 3, avg: 0.01}, 20), false); // 가장 나쁜 날 없음
});

test('자료가 없거나 깨져도 멈추지 않음', () => {
  for (const S of [null, {}, {rank: null}, {rank: [null, 3, 'x']}]) assert.deepEqual([stance3(S).def, stance3(S).mid, stance3(S).att], [null, null, null]);
});

test('100원 꼴 — 「%」 없이 원으로', () => {
  assert.equal(won100(-0.071), '92.9원');
  assert.equal(won100(0.031), '103.1원');
  assert.equal(won100(-0.09), '91원');
  assert.equal(won100(NaN), null);
  assert.equal(lostOf100({worst: -0.1234}), 12.3);
  assert.equal(lostOf100({worst: 0.01}), 0);
});
