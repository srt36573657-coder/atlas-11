// 주문 장부 시험(reports/atlas11/orders/ledger.json · scripts/atlas11/orders/kakao_digest.mjs)
//   사장님 2026-10-22 01:29 「이방애 주문 주었던 것을 내 카톡애 요약해서 다 보내고 글고 미완성 완성 성공에 값 해쓰느지 보고체게 시스템화 한다」
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {digest, when} from '../../scripts/atlas11/orders/kakao_digest.mjs';

const L = JSON.parse(fs.readFileSync(new URL('../../reports/atlas11/orders/ledger.json', import.meta.url), 'utf8'));

test('장부 꼴 — 주문마다 원문 · 때 · 상태(미완성 · 완성 · 성공) · 근거 · 짧은 글', () => {
  assert.equal(L.schema, 'atlas11-orders-1');
  assert.deepEqual(Object.keys(L.states), ['미완성', '완성', '성공']);
  const ids = new Set();
  for (const o of L.orders) {
    assert.ok(!ids.has(o.id), '번호 겹침 ' + o.id); ids.add(o.id);
    assert.match(o.at, /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}\+09:00$/, o.id);
    assert.ok(['미완성', '완성', '성공'].includes(o.state), o.id);
    for (const k of ['words', 'did', 'proof', 'short']) assert.ok(typeof o[k] === 'string' && o[k].trim(), o.id + ' ' + k);
    assert.ok(Array.from(o.short).length <= 60, o.id + ' 짧은 글 60자');
  }
});

test('걸린 시간(사장님 2026-11-16(마카오) 16:06 「작업 속도를 3배 빠르게 해봐」) — 성공 주문마다 분 · 바탕 스무 건 가운데 값 · 목표 = 셋으로 나눈 값(scripts/atlas11/orders/took.py)', () => {
  const T = L.took;
  assert.ok(T && T.src === 'scripts/atlas11/orders/took.py' && /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}\+09:00$/.test(T.since));
  assert.ok(T.base.n === 20 && Number.isInteger(T.base.median) && T.base.median > 0 && T.goal === Math.round(T.base.median / 3), JSON.stringify(T.base));
  for (const o of L.orders) if (o.took !== undefined) assert.ok(o.state === '성공' && Number.isInteger(o.took) && o.took >= 0, o.id);
  assert.ok(L.orders.filter(o => o.state === '성공' && Number.isInteger(o.took)).length >= 20, '성공 주문 스무 건 넘게 분이 적힘');
});

test('카톡 글 — 한 통 200자 안 · 첫 통은 수 · 모든 주문이 들어감 · 괄호 · 영어 낱말 없음', () => {
  const ms = digest(L);
  assert.ok(ms.length >= 2);
  for (const m of ms) assert.ok(m.length <= 200, m.length + ' ' + m.slice(0, 20));
  const n = s => L.orders.filter(o => o.state === s).length;
  assert.match(ms[0], new RegExp(`주문은 모두 ${L.orders.length}건이에요\\.\\n성공 ${n('성공')}건, 완성 ${n('완성')}건이에요\\. 미완성은 ${n('미완성')}건이에요\\.`));
  const all = ms.join('\n');
  for (const o of L.orders) assert.ok(all.includes(o.short), o.id);
  assert.doesNotMatch(all, /[()]/);
  assert.doesNotMatch(all.replace(/[가-힣\s\d.,?!「」·\-\[\]:]/g, ''), /[A-Za-z]{2,}/);
  assert.equal(when('2026-10-21T17:51+09:00'), '21일 오후 5시 51분');
  assert.equal(when('2026-10-22T01:00+09:00'), '22일 오전 1시');
  // 미완성이 하나라도 있으면 그 칸만 골라 보낼 수 있음(모두 끝났으면 고를 것이 없음 — 2026-10-22 10:2x 장부가 모두 완성 · 성공이 됨)
  const open = L.orders.some(o => o.state === '미완성');
  assert.equal(digest(L, {only: '미완성'}).join('').includes('[미완성]'), open);
});
