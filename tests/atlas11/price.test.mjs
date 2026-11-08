// 수르 현재가(주문 2011 · 사장님 2026-11-08 20:11 「어 그렇게 하고」 — 장이 열려 있는 낮에도 첫 페이지 현재가가 바뀌게) — lib/atlas11/price.mjs · functions/atlas11/price.mjs
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {seoul, marketWindow, codesOf, lastOf, minuteUrl, prices, handlePrice, PRICE_SCHEMA, MAX_CODES} from '../../lib/atlas11/price.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const KST = s => Date.parse(s + '+09:00');

test('서울 시각 · 장 때 — 평일 9:00 ~ 15:30 열림(지난 20분) · 그 뒤 그날 마지막 값(15:25 ~ 15:45) · 밤 · 아침 · 주말은 받지 않음', () => {
  assert.deepEqual(seoul(KST('2026-11-09T14:31:20')), {day: '20261109', iso: '2026-11-09', hhmm: '1431', min: 871, dow: 1});
  const at = s => { const w = marketWindow(KST(s)); return [w.status, w.from, w.to]; };
  assert.deepEqual(at('2026-11-08T20:11:00'), ['shut', null, null], '일요일');
  assert.deepEqual(at('2026-11-07T11:00:00'), ['shut', null, null], '토요일');
  assert.deepEqual(at('2026-11-09T08:59:00'), ['shut', null, null], '월요일 장 전');
  assert.deepEqual(at('2026-11-09T09:00:00'), ['open', '0900', '0900']);
  assert.deepEqual(at('2026-11-09T09:07:00'), ['open', '0900', '0907'], '9시 앞으로는 받지 않음');
  assert.deepEqual(at('2026-11-09T14:31:00'), ['open', '1411', '1431']);
  assert.deepEqual(at('2026-11-09T15:29:00'), ['open', '1509', '1529']);
  assert.deepEqual(at('2026-11-09T15:30:00'), ['close', '1525', '1545'], '장 끝 — 그날 마지막 값');
  assert.deepEqual(at('2026-11-09T23:59:00'), ['close', '1525', '1545']);
  assert.equal(minuteUrl('005930', '20261109', '1411', '1431'), 'https://api.stock.naver.com/chart/domestic/item/005930/minute?startDateTime=202611091411&endDateTime=202611091431');
});

test('코드 줄 — 6자리만 · 겹침 뺌 · 60개까지 · 차례 그대로', () => {
  assert.deepEqual(codesOf('005930, 000660,005930,abc,0A1B2C,12345,1234567'), ['005930', '000660', '0A1B2C']);
  assert.deepEqual(codesOf(null), []);
  assert.equal(codesOf(Array.from({length: 80}, (_, i) => String(100000 + i)).join(',')).length, MAX_CODES);
});

test('분봉 원문(깃허브 실행기에서 받은 실제 꼴) → 그날 마지막 값 · 다른 날 · 빈 값 · 이상한 값은 버림', () => {
  const rows = JSON.parse(fs.readFileSync(path.join(ROOT, 'tests/atlas11/fixtures/naver-minute/005930-20260929.json'), 'utf8'));
  assert.deepEqual(lastOf(rows, '20260929'), {p: 272500, t: '2026-09-29T15:45'});
  assert.equal(lastOf(rows, '20260930'), null, '그날이 아님');
  assert.equal(lastOf([], '20260929'), null);
  assert.equal(lastOf({error: 1}, '20260929'), null);
  assert.deepEqual(lastOf([{localDateTime: '20261109141000', currentPrice: 196700}, {localDateTime: '20261109141100', currentPrice: 0}, {localDateTime: 'x', currentPrice: 1}], '20261109'), {p: 196700, t: '2026-11-09T14:10'}, '0 · 이상한 시각은 건너뜀');
});

test('값 받기 — 장 중 회사마다 분봉 한 번 · 못 받은 회사는 빠짐 · 장 밖은 받지 않음', async () => {
  const asked = [];
  const fake = async url => { asked.push(url); const code = /item\/(\w{6})\//.exec(url)[1]; if (code === '000660') return {ok: false, json: async () => null}; if (code === '035720') throw new Error('끊김');
    return {ok: true, json: async () => [{localDateTime: '20261109142900', currentPrice: 100}, {localDateTime: '20261109143000', currentPrice: code === '005930' ? 72300 : 196700}]}; };
  const r = await prices(['005930', '180640', '000660', '035720'], {now: KST('2026-11-09T14:31:00'), fetchImpl: fake});
  assert.equal(r.schema, PRICE_SCHEMA); assert.equal(r.status, 'open'); assert.equal(r.day, '2026-11-09'); assert.equal(r.hhmm, '1431');
  assert.deepEqual(r.items, {'005930': {p: 72300, t: '2026-11-09T14:30'}, '180640': {p: 196700, t: '2026-11-09T14:30'}});
  assert.equal(asked.length, 4); assert.ok(asked.every(u => u.includes('startDateTime=202611091411&endDateTime=202611091431')));
  const s = await prices(['005930'], {now: KST('2026-11-08T20:11:00'), fetchImpl: async () => { throw new Error('부르면 안 됨'); }});
  assert.equal(s.status, 'shut'); assert.deepEqual(s.items, {});
});

test('함수 — GET 만 · 장 중 30초 · 그 밖 5분 함께 씀 · 함수 주소 /api/price', async () => {
  const fake = async () => ({ok: true, json: async () => [{localDateTime: '20261109153000', currentPrice: 196100}]});
  const r = await handlePrice(new Request('https://aaa7377.com/api/price?codes=180640'), {fetchImpl: fake, now: KST('2026-11-09T16:00:00')});
  assert.equal(r.status, 200); const j = await r.json();
  assert.equal(j.status, 'close'); assert.deepEqual(j.items, {180640: {p: 196100, t: '2026-11-09T15:30'}});
  assert.match(r.headers.get('netlify-cdn-cache-control'), /s-maxage=300/);
  const o = await handlePrice(new Request('https://aaa7377.com/api/price?codes=180640'), {fetchImpl: fake, now: KST('2026-11-09T10:00:00')});
  assert.match(o.headers.get('netlify-cdn-cache-control'), /s-maxage=30\b/);
  assert.equal((await handlePrice(new Request('https://aaa7377.com/api/price', {method: 'POST', body: 'x'}))).status, 405);
  const F = await import('../../functions/atlas11/price.mjs');
  assert.deepEqual(F.config, {path: '/api/price'}); assert.equal(typeof F.default, 'function');
});
