// 지금 시장 한 줄(주문 1125-1359 · 사장님 2026-11-25 13:59 「어 해!」 — 「오늘」 화면 맨 위) — 한국 시각 장 상태 넷 · 다음 장날 · 휴장일 · 해 첫 장날 오전 10시
import test from 'node:test';
import assert from 'node:assert/strict';
import {mktNow, mktWords, kst, isTradeDay, nextTradeDay, openMin, KRX_REST, hmText, dayText} from '../../site/su/su-mkt.js';

const at = s => mktNow(Date.parse(s));
test('평일 — 열리기 전 · 열려 있음(9시 ~ 3시 29분) · 닫힘(3시 30분부터) · 다음 장날', () => {
  assert.deepEqual(at('2026-11-25T08:59:00+09:00'), {st: 'pre', day: '2026-11-25', at: 540});
  assert.deepEqual(at('2026-11-25T09:00:00+09:00'), {st: 'open', day: '2026-11-25', at: 930});
  assert.equal(at('2026-11-25T15:29:59+09:00').st, 'open');
  assert.deepEqual(at('2026-11-25T15:30:00+09:00'), {st: 'closed', day: '2026-11-25', next: '2026-11-26'});
  assert.deepEqual(mktWords(at('2026-11-25T08:30:00+09:00')), {t: '장 열리기 전이에요', s: '오늘 오전 9시에 열려요'});
  assert.deepEqual(mktWords(at('2026-11-25T10:00:00+09:00')), {t: '장이 열려 있어요', s: '오후 3시 30분에 닫혀요'});
  assert.deepEqual(mktWords(at('2026-11-27T16:00:00+09:00')), {t: '오늘 장은 닫혔어요', s: '다음 장날은 11월 30일 월요일 오전 9시예요'});
});
test('쉬는 날 — 토 · 일 · 휴장일(성탄절 · 연말) · 다음 장날 · 해 첫 장날 오전 10시', () => {
  assert.deepEqual(mktWords(at('2026-11-28T11:00:00+09:00')), {t: '오늘은 장이 쉬는 날이에요', s: '다음 장날은 11월 30일 월요일 오전 9시예요'});
  assert.equal(at('2026-12-25T10:00:00+09:00').st, 'rest');
  assert.equal(at('2026-12-25T10:00:00+09:00').next, '2026-12-28');
  assert.equal(at('2026-12-31T10:00:00+09:00').st, 'rest');
  assert.deepEqual(mktWords(at('2026-12-30T16:00:00+09:00')), {t: '오늘 장은 닫혔어요', s: '다음 장날은 1월 4일 월요일 오전 10시예요'});
  assert.deepEqual(mktWords(at('2027-01-04T09:30:00+09:00')), {t: '장 열리기 전이에요', s: '오늘 오전 10시에 열려요'});
  assert.equal(at('2027-01-04T10:00:00+09:00').st, 'open');
  assert.equal(nextTradeDay('2027-02-05'), '2027-02-10'); // 설날 연휴 · 대체 휴일
  assert.equal(nextTradeDay('2027-09-13'), '2027-09-17'); // 추석 연휴
});
test('한국 시각 — 세계 시각 밤 3시 = 한국 낮 12시 · 날짜 넘김', () => {
  assert.deepEqual(kst(Date.parse('2026-11-25T03:00:00Z')), {day: '2026-11-25', min: 720});
  assert.deepEqual(kst(Date.parse('2026-11-24T15:30:00Z')), {day: '2026-11-25', min: 30});
  assert.equal(isTradeDay('2026-11-29'), false); assert.equal(isTradeDay('2026-11-30'), true);
  assert.equal(openMin('2026-11-30'), 540); assert.equal(hmText(930), '오후 3시 30분'); assert.equal(hmText(720), '오후 12시'); assert.equal(dayText('2026-12-28'), '12월 28일 월요일');
  for (const d of Object.keys(KRX_REST)) assert.match(d, /^202[67]-\d{2}-\d{2}$/);
});
