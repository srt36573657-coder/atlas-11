// 멈춘 날(주문 1128-1038 · 「왜 사?」 「오늘은 안 사요」) — 이 휴대폰에만 · 날짜가 다른 날만 셈 · 이어진 날은 안 셈 · 첫 화면 셈(su-sonja.js stopN)과 같은 열쇠 · 같은 셈
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const mem = new Map();
globalThis.localStorage = {getItem: k => (mem.has(k) ? mem.get(k) : null), setItem: (k, v) => mem.set(k, String(v)), removeItem: k => mem.delete(k)};
const {STOP_KEY, stopDay, readStops, saveStop, stopDays} = await import('../../site/su/su-stops.js');

test('멈춘 날 — 같은 날 여러 번은 하루 · 날짜가 다르면 하나 더 · 새것 먼저 · 이 휴대폰 열쇠 하나', () => {
  mem.clear();
  assert.deepEqual(readStops(), []);
  const d1 = Date.UTC(2026, 10, 28, 1, 0), d2 = Date.UTC(2026, 10, 28, 14, 59), d3 = Date.UTC(2026, 10, 28, 15, 1); // 서울 28일 10:00 · 28일 23:59 · 29일 00:01
  assert.equal(stopDay(d1), '2026-11-28'); assert.equal(stopDay(d2), '2026-11-28'); assert.equal(stopDay(d3), '2026-11-29');
  assert.ok(saveStop({code: '005930', name: '삼성전자', q: 1}, d1));
  assert.ok(saveStop({code: null, name: null, q: 12}, d2));
  assert.equal(stopDays(readStops()), 1, '같은 날 두 번 = 하루');
  assert.ok(saveStop({q: 3}, d3));
  const L = readStops();
  assert.equal(stopDays(L), 2, '다음 날 = 이틀');
  assert.equal(L.length, 3); assert.equal(L[0].day, '2026-11-29'); assert.equal(L[2].code, '005930'); assert.equal(L[2].q, 1);
  assert.deepEqual(Object.keys(L[0]).sort(), ['at', 'code', 'day', 'name', 'q'], '이름 · 기기 번호 · 답 · 값 없음');
  assert.equal(STOP_KEY, 'su-stops-v1');
});

test('망가진 기록 · 저장소 없음 — 화면이 멈추지 않음', () => {
  mem.clear(); mem.set('su-stops-v1', '{망가짐');
  assert.equal(readStops(), null);
  assert.equal(saveStop({q: 1}), false);
  mem.set('su-stops-v1', JSON.stringify([{day: '2026-11-28'}, {day: 'x'}, null, 3]));
  assert.equal(stopDays(readStops()), 1, '날짜 꼴이 아닌 줄은 뺌');
});

test('첫 화면 셈(su-sonja.js stopN)과 같은 열쇠 · 같은 거름', () => {
  const src = fs.readFileSync(new URL('../../site/su/su-sonja.js', import.meta.url), 'utf8');
  assert.ok(src.includes("export const STOP_KEY1 = 'su-stops-v1';"), '같은 열쇠');
  assert.ok(/stopN = \(\) => \{ try \{ const x = JSON\.parse\(localStorage\.getItem\(STOP_KEY1\)/.test(src) && src.includes('new Set(x.filter(r => r && /^\\d{4}-\\d{2}-\\d{2}$/.test(String(r.day ?? \'\'))).map(r => r.day)).size'), '같은 셈(날짜 꼴 · 다른 날만)');
  assert.ok(!/import \{[^}]*\} from '\/su\/su-stops\.js'/.test(src) && !/from '\/su\/su-find-core\.js'/.test(src), '첫 화면은 파일 둘을 더 받지 않음(찾기 셈은 칸을 누를 때)');
  const why = fs.readFileSync(new URL('../../site/su/su-why.js', import.meta.url), 'utf8');
  assert.ok(/import \{readStops, saveStop, stopDays\} from '\/su\/su-stops\.js'/.test(why) && !/tally\('stop_skip|tally\('nobuy/.test(why), '「왜 사?」는 su-stops.js 한 곳 · 새 신호 없음');
});
