// 오늘 살 회사 카톡(주문 1128-2342 · 1129-0018 「꾀를 고를 시각을 오후 1시로 … 매수할 종목 카톡은 2시에 … 당일 종가로 매수」) — scripts/atlas11/orders/buy_kakao.mjs
// 그날 오후 1시 꾀(장부 noon · 거래량 꾀 다섯 뺌)에서 꾀 다섯 이상이 고른 회사(사고팔 탭 살 차례와 같은 셈 · 장부는 그날 종가로 삼) · 한 통 200자 안
// 장이 쉬는 날 0통 · 오후 1시 꾀가 아직이면 기다림(0통) · 끝내 없으면 그렇다고 한 통 · 쓰지 않는 말 0
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {execFileSync} from 'node:child_process';
import {buyList, buildKakao, isSession, pack, mdw, hmSay, kstDay, MAX} from '../../scripts/atlas11/orders/buy_kakao.mjs';
import {screenHits} from '../../site/next/words.js';

const T = '2026-11-30', A = '000010', B2 = '000020', C = '000030';
const CAL = {coverageStart: '2026-11-01', coverageEnd: '2026-12-31', sessions: ['2026-11-27', T, '2026-12-01']};
const book = (hm = '13:03') => {
  const g = {};
  ['g01', 'g02', 'g03', 'g04', 'g05', 'g06'].forEach((k, i) => { g[k] = [A, ...(i < 5 ? [C] : []), ...(i < 4 ? [B2] : [])]; }); // A 꾀 여섯 · C 꾀 다섯 · B2 꾀 넷
  g.g07 = [A, A]; // 같은 꾀 안 겹침은 한 번
  return {s36: {}, noon: {[T]: {hm, at: null, g}}, co: {[A]: ['가회사', '갈래'], [C]: ['다회사', null]}}; // B2 · 이름 없음
};

test('오후 1시 꾀에서 꾀 다섯 이상이 고른 회사 — 고른 꾀가 많은 회사부터 · 꾀마다 한 번 · 이름이 없으면 번호', () => {
  const L = buyList(book(), book().noon[T]);
  assert.deepEqual(L.rows, [{code: A, name: '가회사', n: 7}, {code: C, name: '다회사', n: 5}]);
  assert.equal(L.lots, 12, '고른 꾀마다 10주 — 사는 번 수 = 꾀 수 합');
  assert.equal(L.kn, 7); assert.equal(buyList(book(), null), null, '그날 오후 1시 꾀가 없으면 null');
});

test('오후 2시 카톡 — 오후 1시 값으로 꾀 다섯 이상이 고른 회사 · 오늘 종가로 · 사는 번 수 · 거래량 꾀 뺌 · 가짜 돈 · 앞날 아님 · 200자 안 · 쓰지 않는 말 0', () => {
  const r = buildKakao({B: book(), day: T, cal: CAL});
  assert.equal(r.state, 'buy'); assert.equal(r.hm, '13:03'); assert.equal(r.n, 2); assert.equal(r.lots, 12);
  const all = r.messages.join('\n');
  assert.ok(r.messages[0].startsWith('📋 손자병법 오늘 살 회사 · 11/30 월'), r.messages[0]);
  assert.ok(all.includes('오후 1시 3분 값으로 꾀 다섯 이상이 함께 고른 회사 2곳이에요.') && all.includes('오늘 종가로, 고른 꾀마다 10주씩 사요.'));
  assert.ok(all.includes('1. 가회사 · 꾀 7') && all.includes('2. 다회사 · 꾀 5') && !all.includes(B2), '꾀 넷이 고른 회사는 없음');
  assert.ok(all.includes('모두 12번 사요.') && all.includes('거래량을 보는 꾀 다섯은 빼고, 꾀 7가지가 골랐어요.'));
  assert.ok(all.includes('가짜 돈 장부예요. 앞날을 맞히지 않고, 사고팔기를 권하지 않아요.') && all.includes('aaa7377.com/su/#/d'));
  assert.ok(r.messages.every(m => m.length <= MAX && !/\n$/.test(m)), '한 통 200자 안');
  assert.deepEqual(screenHits(all), [], '추천 · 매수 · 예측 같은 말 0');
  assert.ok(!/수익|%|프로/.test(all), '수익률 0(사장님 「수익률은 보내지 마라」)');
  assert.equal(hmSay('13:00'), '오후 1시'); assert.equal(hmSay('13:45'), '오후 1시 45분');
});

test('회사가 많으면 여러 통으로 — 둘째 통부터 「📋 이어서」 · 줄을 자르지 않음', () => {
  const g = {}, co = {};
  for (let i = 0; i < 11; i++) { const c = String(100000 + i); co[c] = ['아주긴이름의회사' + i, null]; for (let j = 1; j <= 6; j++) (g['g0' + j] ??= []).push(c); }
  const r = buildKakao({B: {s36: {}, noon: {[T]: {hm: '13:03', g}}, co}, day: T, cal: CAL});
  assert.equal(r.n, 11); assert.ok(r.messages.length >= 2);
  assert.ok(r.messages.slice(1).every(m => m.startsWith('📋 이어서')) && r.messages.every(m => m.length <= MAX));
  assert.equal(r.messages.join('\n').match(/^\d+\. /gm).length, 11, '회사 줄 열하나 모두');
  assert.deepEqual(pack(['가나다', '', '라마'], 4), ['가나다', '📋 이어서\n라마'], '빈 줄로 끝나지 않음 · 이어서 머리');
});

test('장이 쉬는 날 0통 · 오후 1시 꾀가 아직이면 기다림(0통) · 끝내 없으면 한 통 · 꾀 다섯이 없는 날은 그렇다고 한 통', () => {
  assert.equal(isSession('2026-11-28', {cal: CAL}), false, '토요일');
  assert.equal(isSession('2026-12-02', {cal: CAL}), false, '달력이 덮는데 장이 없는 날');
  assert.equal(isSession(T, {cal: CAL}), true);
  assert.equal(isSession('2027-01-05', {cal: CAL}), null, '달력 밖 · 기록 없음 = 모름');
  assert.equal(isSession('2027-01-05', {cal: CAL, ops: {dayKST: '2027-01-05', steps: [{step: '1_calendar', session: false, day: '2027-01-05'}]}}), false, '매일 작업 기록의 달력');
  const h = buildKakao({B: book(), day: '2026-12-02', cal: CAL});
  assert.equal(h.state, 'holiday'); assert.equal(h.messages.length, 0);
  const w = buildKakao({B: book(), day: '2026-12-01', cal: CAL});
  assert.equal(w.state, 'wait'); assert.equal(w.messages.length, 0);
  const m = buildKakao({B: book(), day: '2026-12-01', cal: CAL, final: true});
  assert.equal(m.state, 'miss'); assert.equal(m.messages.length, 1);
  assert.ok(m.messages[0].includes('오늘 오후 1시 꾀가 아직 장부에 오지 않아서 살 회사를 못 셌어요.'));
  const none = buildKakao({B: {s36: {}, noon: {[T]: {hm: '13:03', g: {g01: [A], g02: [A]}}}, co: {}}, day: T, cal: CAL});
  assert.equal(none.state, 'none'); assert.equal(none.messages.length, 1);
  assert.ok(none.messages[0].includes('오후 1시 3분 값으로 꾀 다섯 이상이 함께 고른 회사가 없어요. 그래서 오늘은 사지 않아요.'));
});

test('[보기] · 날 셈', () => {
  const r = buildKakao({B: book(), day: T, cal: CAL, sample: true});
  assert.ok(r.messages[0].startsWith('📋 손자병법 오늘 살 회사 [보기] · 11/30 월'));
  assert.equal(mdw('2026-12-01'), '12/1 화'); assert.equal(kstDay(Date.UTC(2026, 10, 28, 15, 1)), '2026-11-29');
});

test('쓰는 법 — 파일을 받아 JSON 한 줄', () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'buyk-')), f = path.join(dir, 'settle.json'), c = path.join(dir, 'cal.json');
  fs.writeFileSync(f, JSON.stringify(book())); fs.writeFileSync(c, JSON.stringify(CAL));
  const cli = (...x) => JSON.parse(execFileSync(process.execPath, [new URL('../../scripts/atlas11/orders/buy_kakao.mjs', import.meta.url).pathname, '--ledger', f, '--cal', c, '--ops', path.join(dir, 'none.json'), ...x], {encoding: 'utf8'}));
  const out = cli('--day', T);
  assert.equal(out.ok, true); assert.equal(out.state, 'buy'); assert.equal(out.n, 2);
  assert.equal(cli('--day', '2026-12-01').state, 'wait'); assert.equal(cli('--day', '2026-12-01', '--final').state, 'miss');
  fs.rmSync(dir, {recursive: true, force: true});
});
