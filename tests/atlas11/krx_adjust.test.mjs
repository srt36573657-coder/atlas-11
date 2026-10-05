// 회사 일(권리락 등)로 네이버가 지난 15:30 봉을 고쳐 적은 경우 — 2026-10-03 사장님 「고쳐」
// 실제 사례: 삼성바이오로직스 10/2 권리락 → 네이버 10/1 봉 1,429,000 → 1,418,993(×0.992997). 아래 10/2·10/6 값과 9/30 조정값은 합성(실제 시세 아님).
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import {collect, adjustmentCheck, corporateActionDisclosures, ADJUSTMENT_POLICY} from '../../scripts/atlas11/collect_krx_close.mjs';
import {rollingOperationWindow, mergeRollingPrices, rollingHash} from '../../lib/rolling-operation.mjs';
import {readJSON, tempRoot} from './helpers.mjs';

const CODE = '207940', NOW = '2026-10-06T07:05:00.000Z'; // 10/6(화) 16:05 KST — 10/3·10/5 휴일 뒤 첫 거래일
const FACTOR = 1418993 / 1429000;
const ymd = d => d.replaceAll('-', '');
const minute = (day, close, volume = 5000) => JSON.stringify([
  {localDateTime: ymd(day) + '152900', currentPrice: close, accumulatedTradingVolume: 0},
  {localDateTime: ymd(day) + '153000', currentPrice: close, accumulatedTradingVolume: volume},
  {localDateTime: ymd(day) + '154000', currentPrice: close, accumulatedTradingVolume: 10}]);
const stubFetch = closes => { const calls = []; const f = async url => { const day = /startDateTime=(\d{8})/.exec(url)[1], key = `${day.slice(0, 4)}-${day.slice(4, 6)}-${day.slice(6, 8)}`; calls.push(key); return key in closes ? {ok: true, status: 200, text: async () => minute(key, closes[key])} : {ok: false, status: 404, text: async () => ''}; }; f.calls = calls; return f; };
const row = (date, close) => ({date, close, priceBasis: 'KRX_REGULAR', closeBasis: 'krx_closing_auction_1530_minute_bar', quality: 'single_source', sourceUrl: 'https://api.stock.naver.com/chart/domestic/item/207940/minute', observedAt: date + 'T09:00:00.000Z', adjustmentsVerified: false});
const DISCLOSURE = {code: CODE, title: '삼성바이오로직스(주) 유상증자결정', publishedAt: '2026-08-28T06:50:02+09:00', word: '유상증자'};
let base = null;
async function setup() {
  if (base) return base;
  const calendar = await readJSON('public/data/rolling-calendar.json');
  const input = {schema: 'test', origin: '2026-09-17', end: '2026-10-30', actualAsOf: '2026-10-01', calendar: {sessions: calendar.sessions, holidays: calendar.holidays},
    assets: [{code: CODE, name: '삼성바이오로직스', prices: [row('2026-09-29', 1385000), row('2026-09-30', 1391000), row('2026-10-01', 1429000)]}]};
  return base = {calendar, input, window: rollingOperationWindow(input, NOW, {calendar, runEndDate: null})};
}
// 네이버: 권리락 전 날짜는 고쳐 적은 값, 10/2 이후는 실제 값
const adjustedNaver = {'2026-09-29': Math.round(1385000 * FACTOR), '2026-09-30': Math.round(1391000 * FACTOR), '2026-10-01': 1418993, '2026-10-02': 1412000, '2026-10-06': 1405000};

test('회사 일 조정: 비율이 작고(0.90~1.00) 두 날 같고 공시가 있으면 받는다 · 빠진 10/2·오늘 10/6 행 · 저장 기록은 그대로 · 까닭을 남긴다', async () => {
  const {input, window, calendar} = await setup();
  assert.equal(window.day, '2026-10-06'); assert.equal(window.cutoff, '2026-10-06');
  const fetch = stubFetch(adjustedNaver);
  const r = await collect(input, window, {now: NOW, calendar, fetch, sleep: async () => {}, corporateActions: [DISCLOSURE]});
  assert.deepEqual(r.errors, []);
  const o = r.observations[0];
  assert.deepEqual(o.rows.map(x => [x.date, x.close]), [['2026-10-02', 1412000], ['2026-10-06', 1405000]]);
  assert.equal(o.crossCheck.match, false); assert.equal(o.crossCheck.corporateActionAdjusted, true);
  assert.equal(o.crossCheck.day, '2026-10-01'); assert.equal(o.crossCheck.secondDay, '2026-09-30');
  assert.ok(Math.abs(o.crossCheck.ratio - FACTOR) < 1e-12 && Math.abs(o.crossCheck.secondRatio - FACTOR) < ADJUSTMENT_POLICY.ratioTolerance);
  assert.match(o.finalityBasis, /회사 일로 네이버가 ×0\.992997 고쳐 적어 다름/);
  assert.equal(r.stats.corporateActionAdjusted.length, 1); assert.deepEqual(r.stats.corporateActionAdjusted[0].words, ['유상증자']);
  assert.deepEqual(fetch.calls, ['2026-10-01', '2026-10-02', '2026-10-06', '2026-09-30'], '교차 검증 날짜 → 빠진 날 → 오늘 → 같은 비율 확인용 앞 날짜 하나만 더');
  // 저장 단계도 통과 · 지난 기록(10/1 1,429,000)은 바꾸지 않음 · 오늘 확정 종목에 들어감
  const m = mergeRollingPrices(input, r.observations, {now: NOW, expectedHash: rollingHash(input), calendar, runEndDate: null});
  const prices = m.input.assets[0].prices;
  assert.equal(prices.find(x => x.date === '2026-10-01').close, 1429000);
  assert.equal(prices.find(x => x.date === '2026-10-06').close, 1405000);
  assert.deepEqual(m.confirmedTodayCodes, [CODE]);
});

test('회사 일 조정이 아니면 예전처럼 넘기지 않는다: 공시 없음 · 두 날 비율 다름 · 큰 조정(분할 등)', async () => {
  const {input, window, calendar} = await setup();
  const noDisc = await collect(input, window, {now: NOW, calendar, fetch: stubFetch(adjustedNaver), sleep: async () => {}, corporateActions: []});
  assert.equal(noDisc.observations.length, 0); assert.equal(noDisc.errors[0].code, 'REVIEWED_ROW_MISMATCH'); assert.equal(noDisc.errors[0].adjustment.reason, 'no_corporate_action_disclosure');
  const oneDayOnly = await collect(input, window, {now: NOW, calendar, fetch: stubFetch({...adjustedNaver, '2026-09-30': 1391000}), sleep: async () => {}, corporateActions: [DISCLOSURE]});
  assert.equal(oneDayOnly.observations.length, 0); assert.equal(oneDayOnly.errors[0].adjustment.reason, 'ratio_not_uniform');
  const split = await collect(input, window, {now: NOW, calendar, fetch: stubFetch({...adjustedNaver, '2026-10-01': 285800, '2026-09-30': 278200}), sleep: async () => {}, corporateActions: [DISCLOSURE]});
  assert.equal(split.observations.length, 0); assert.equal(split.errors[0].adjustment.reason, 'ratio_out_of_band');
  const up = await collect(input, window, {now: NOW, calendar, fetch: stubFetch({...adjustedNaver, '2026-10-01': 1430000}), sleep: async () => {}, corporateActions: [DISCLOSURE]});
  assert.equal(up.errors[0].adjustment.reason, 'ratio_out_of_band', '올라간 값(비율 > 1)은 받지 않음');
  assert.ok([noDisc, oneDayOnly, split, up].every(r => r.stats.corporateActionAdjusted.length === 0));
});

test('공시 찾기: 관측 수집 묶음에서 최근 120일 · 가격을 고쳐 적게 만드는 낱말만(소각·합병 제외)', async () => {
  const dir = await tempRoot(), day = path.join(dir, 'reports/atlas11/context/2026-10-06');
  await fs.mkdir(day, {recursive: true});
  const items = [
    {id: '1', title: '삼성바이오로직스(주) 유상증자결정', publishedAt: '2026-08-28T06:50:02+09:00', corporateAction: true},
    {id: '2', title: '삼성바이오로직스(주) 주식 소각 결정', publishedAt: '2026-09-10T08:00:00+09:00', corporateAction: true},
    {id: '3', title: '삼성바이오로직스(주) 무상증자결정', publishedAt: '2026-04-01T08:00:00+09:00', corporateAction: true},
    {id: '4', title: '삼성바이오로직스(주) 기업설명회(IR) 개최', publishedAt: '2026-09-01T08:00:00+09:00', corporateAction: false}];
  await fs.writeFile(path.join(day, '2026-10-06T07-01-00Z.json'), JSON.stringify({disclosures: [{code: CODE, items}, {code: '005930', items: [{id: '9', title: '삼성전자(주) 무상증자결정', publishedAt: '2026-09-01T08:00:00+09:00', corporateAction: true}]}]}));
  const found = await corporateActionDisclosures(dir, CODE, '2026-10-06');
  assert.deepEqual(found.map(x => [x.title, x.word]), [['삼성바이오로직스(주) 유상증자결정', '유상증자']], '120일 밖(4/1)·소각·공시 아닌 것·다른 종목은 빠짐');
  assert.deepEqual(await corporateActionDisclosures(null, CODE, '2026-10-06'), []);
  assert.deepEqual(await corporateActionDisclosures(path.join(dir, 'none'), CODE, '2026-10-06'), []);
  // 파일에서 찾은 공시로도 받는다(실행기와 같은 길: options.rootDir)
  const {input, window, calendar} = await setup();
  const r = await collect(input, window, {now: NOW, calendar, rootDir: dir, fetch: stubFetch(adjustedNaver), sleep: async () => {}});
  assert.deepEqual(r.errors, []); assert.equal(r.observations[0].crossCheck.disclosures[0].file, 'reports/atlas11/context/2026-10-06/2026-10-06T07-01-00Z.json');
});

test('adjustmentCheck 는 아무것도 고치지 않고 받을지 말지만 정한다', async () => {
  const stored = new Map([['2026-09-30', {close: 1391000, priceBasis: 'KRX_REGULAR'}], ['2026-10-01', {close: 1429000, priceBasis: 'KRX_REGULAR'}]]);
  const sessions = ['2026-09-29', '2026-09-30', '2026-10-01', '2026-10-02'];
  const r = await adjustmentCheck({code: CODE, checkDay: '2026-10-01', reviewed: 1429000, fetched: 1418993, sessions, stored, disclosures: [DISCLOSURE], fetchBar: async () => ({bar: {close: adjustedNaver['2026-09-30']}, url: 'https://x.example', rawHash: 'a'.repeat(64)})});
  assert.equal(r.accepted, true); assert.equal(r.reason, 'corporate_action_adjustment');
  assert.equal(stored.get('2026-10-01').close, 1429000);
  const missing = await adjustmentCheck({code: CODE, checkDay: '2026-10-01', reviewed: 1429000, fetched: 1418993, sessions, stored, disclosures: [DISCLOSURE], fetchBar: async () => null});
  assert.equal(missing.accepted, false); assert.equal(missing.reason, 'second_day_bar_missing');
});
