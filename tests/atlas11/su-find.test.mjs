// 회사 찾기 · 회사 쪽 값과 실적 시험(주문 1120-1447 · 사장님 2026-11-20(마카오) 14:47 「종목 검색 기능 … 검색한 기업의 상세 정보를 한눈에 …」)
//   site/su/su-find.js findCo — 이름 · 번호가 같음 → 앞이 같음 → 이름 속 → 업종 속 · 같은 칸은 짧은 이름 먼저 · 많아야 여덟
//   site/su/su-coval.js — 1년 사이 가장 크게 떨어진 때(그때까지 가장 높던 값에서) · 1주 · 1달 · 3달 · 1년 100원이 · 억 원 → 조 원
import test from 'node:test';
import assert from 'node:assert/strict';

import {findCo, FIND_MAX} from '../../site/su/su-find-core.js';
import {yearOf, spans, eok, SPANS} from '../../site/su/su-coval-core.js';

const M = {companies: {'005930': {n: '삼성전자', i: '반도체'}, '005935': {n: '삼성전자우', i: '반도체'}, '000660': {n: 'SK하이닉스', i: '반도체'}, '028260': {n: '삼성물산', i: '복합기업'}, '035720': {n: '카카오', i: '인터넷'}, BAD: {n: '틀린 번호'}, '123456': {i: '이름 없음'}}};

test('이름 그대로 → 그 회사 맨 위 · 앞이 같은 곳 → 이름 속 → 업종 속', () => {
  assert.deepEqual(findCo(M, '삼성전자').map(x => x.code), ['005930', '005935']);
  assert.deepEqual(findCo(M, '삼성').map(x => x.code), ['028260', '005930', '005935']);
  assert.deepEqual(findCo(M, '전자').map(x => x.code), ['005930', '005935']);
  assert.deepEqual(findCo(M, '반도체').map(x => x.code), ['005930', '005935', '000660'], '업종 속 — 짧은 이름 먼저');
});
test('번호 · 띄어쓰기 · 큰 글자 작은 글자 · 없는 이름 · 틀린 자료', () => {
  assert.equal(findCo(M, '005930')[0].code, '005930');
  assert.equal(findCo(M, '0059').length, 2);
  assert.equal(findCo(M, 'sk 하이')[0].code, '000660');
  assert.deepEqual(findCo(M, '없는회사'), []);
  assert.deepEqual(findCo(M, '  '), []);
  assert.deepEqual(findCo(null, '삼성'), []);
  assert.ok(!findCo(M, '틀린').length && !findCo(M, '이름').length, '번호가 틀리거나 이름이 없는 줄은 뺌');
  const many = {companies: Object.fromEntries(Array.from({length: 30}, (_, i) => [String(100000 + i), {n: '가나' + i}]))};
  assert.equal(findCo(many, '가나').length, FIND_MAX);
});
test('1년 사이 가장 크게 떨어진 때 · 때마다 100원이', () => {
  const cl = [100, 120, 90, 150, 120, 130];
  const Y = yearOf(cl);
  assert.equal(Y.pkI, 1); assert.equal(Y.loI, 2); assert.equal(Math.round(Y.dd * 1000) / 1000, -0.25); // 120 → 90 이 150 → 120 보다 깊음
  assert.deepEqual(yearOf([100, 101, 102]).dd, 0);
  assert.equal(yearOf([5]), null);
  const long = Array.from({length: 300}, (_, i) => 100 + i);
  assert.deepEqual(spans(long).map(x => x[0]), SPANS.map(x => x[0]));
  assert.equal(spans(long)[0][1], 399 / 394 - 1);
  assert.deepEqual(spans([1, 2, 3]).map(x => x[0]), [], '그만큼 지난 값이 없으면 뺌');
});
test('억 원 → 조 원 · 부호는 이름이 맡음', () => {
  assert.equal(eok(3336059), '333.6조 원');
  assert.equal(eok(10000), '1조 원');
  assert.equal(eok(4360), '4,360억 원');
  assert.equal(eok(-1234), '1,234억 원');
});
