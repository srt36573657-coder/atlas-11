import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import {buildForecast11, validateForecast11, forecastCSV, persistForecast11, readAllPublications, FORECAST11_SCHEMA} from '../../lib/atlas11/forecast.mjs';
import {realInputs, tempRoot, ISSUED, readJSON, root} from './helpers.mjs';
import {loadHorizon} from '../../lib/atlas11/horizon.mjs';

let built = null;
/** 옛 20거래일 동작 검사 — 스위치(config/atlas11/horizon.json)를 20 으로 둔 것과 같게 futureDays: 20 을 직접 준다 */
async function publication() {
  if (built) return built;
  const {input, calendar, registry, records} = await realInputs();
  const news = await readJSON('public/data/atlas11/news-events.json').catch(() => ({assets: []}));
  built = buildForecast11({input, recordsPayload: records, registry, calendar, issuedAt: ISSUED, paths: 150, implementationSHA256: 'test', futureDays: 20, newsAssets: news.assets});
  return built;
}

test('발행본: 52 고유코드 · 자기 실제 종가 출발(첫점 차이 0 = 52/52) · 20 실제 거래일 · 스키마', async () => {
  const p = await publication();
  assert.equal(p.schema, FORECAST11_SCHEMA); assert.match(p.forecastId, /^2026-09-28-atlas11-[a-f0-9]{16}$/);
  assert.equal(p.assets.length, 52); assert.equal(new Set(p.assets.map(a => a.code)).size, 52);
  assert.equal(p.summary.anchorMatches, 52);
  const {input, calendar} = await realInputs();
  const expected = calendar.sessions.filter(d => d > input.actualAsOf).slice(0, 20);
  assert.deepEqual(p.futureDates, expected);
  assert.ok(!p.futureDates.includes('2026-10-05') && !p.futureDates.includes('2026-10-09'), '휴장일은 예측점에 없다');
  for (const a of p.assets) {
    const actual = input.assets.find(x => x.code === a.code).prices.find(x => x.date === input.actualAsOf).close;
    assert.equal(a.anchor.close, actual); assert.equal(a.rows[0].p50, actual); assert.equal(a.rows[0].p10, actual); assert.equal(a.rows[0].p90, actual);
    assert.equal(a.rows.length, 21); assert.equal(a.actual60.length, 60); assert.equal(a.scenario.prices[0], actual); assert.equal(a.scenario.prices.length, 21);
    assert.equal(a.rows[1].date, expected[0]); assert.equal(a.rows[20].date, expected[19]);
    assert.equal(a.news.every(n => n.used === false && n.numericImpactAllowed === false), true, '뉴스는 수치 미반영');
  }
  assert.equal(p.provenance.priorForecastUsedAsNumericInput, false);
  assert.equal(p.summary.newsNumericEvents, 0);
});

test('검사기: 변조된 발행본을 거부한다 (출발점·분위수 순서·확률 합·중복 코드·미래 날짜·이전 발행 순서)', async () => {
  const p = await publication();
  const clone = () => structuredClone(p);
  assert.equal(validateForecast11(clone()), true);
  let x = clone(); x.assets[0].rows[0].p50 += 1; assert.throws(() => validateForecast11(x), /ANCHOR_DIFFERENCE/);
  x = clone(); x.assets[3].rows[5].p10 = x.assets[3].rows[5].p90 + 1; assert.throws(() => validateForecast11(x), /ROW_CONTRACT/);
  x = clone(); x.assets[3].rows[5].direction.daily.probabilities.up += 0.1; assert.throws(() => validateForecast11(x), /DIRECTION/);
  x = clone(); x.assets[1].code = x.assets[0].code; assert.throws(() => validateForecast11(x), /CONTRACT/);
  x = clone(); x.futureDates[0] = '2026-09-27'; assert.throws(() => validateForecast11(x), /FUTURE_SESSIONS/);
  x = clone(); x.assets[0].previous = {forecastId: x.forecastId, issuedAt: x.issuedAt, source: 'immutable_published_forecast', rows: []}; assert.throws(() => validateForecast11(x), /PREVIOUS_NOT_PRIOR/);
});

test('미래 누수 차단: 발행 시각 뒤에 관측된 가격이나 기준일 뒤 가격은 입력이 되지 않는다', async () => {
  const {input, calendar, registry, records} = await realInputs();
  const leaked = structuredClone(input);
  leaked.assets[0].prices.push({date: '2026-09-29', close: 999999, quality: 'single_source', observedAt: '2026-09-29T07:00:00Z'});
  const q = buildForecast11({input: leaked, recordsPayload: records, registry, calendar, issuedAt: ISSUED, paths: 100, implementationSHA256: 'test', futureDays: 20});
  assert.ok(!q.assets[0].actual60.some(r => r.date === '2026-09-29'), '기준일 뒤 가격은 입력에서 제외');
  assert.notEqual(q.assets[0].rows[1].p50, 999999); assert.equal(q.assets[0].anchor.date, '2026-09-28');
  const observedLate = structuredClone(input);
  observedLate.assets[0].prices.at(-1).observedAt = '2026-09-28T23:00:00Z';
  assert.throws(() => buildForecast11({input: observedLate, recordsPayload: records, registry, calendar, issuedAt: ISSUED, paths: 100, implementationSHA256: 'test', futureDays: 20}), /FUTURE_OBSERVATION/, '발행 시각 뒤에 관측된 가격은 거부');
  const early = structuredClone(input); early.actualAsOf = '2026-09-28';
  assert.throws(() => buildForecast11({input: early, recordsPayload: records, registry, calendar, issuedAt: '2026-09-28T03:00:00.000Z', paths: 100, implementationSHA256: 'test', futureDays: 20}), /CLOSE_NOT_FINAL/, '15:30 전에는 오늘 종가로 발행 불가');
});

test('어제 전망 연결: 직전 거래일 발행본만 previous 가 된다 · 같은 날 앞선 발행은 earlierToday', async () => {
  const {input, calendar, registry, records} = await realInputs();
  const p = await publication();
  const prior = structuredClone(p); prior.forecastId = prior.id = '2026-09-23-atlas11-0000000000000000'; prior.issuedAt = '2026-09-23T08:00:00.000Z'; prior.actualAsOf = '2026-09-23';
  const sameDay = structuredClone(p); sameDay.forecastId = sameDay.id = '2026-09-28-atlas11-1111111111111111'; sameDay.issuedAt = '2026-09-28T09:00:00.000Z';
  const q = buildForecast11({input, recordsPayload: records, registry, calendar, issuedAt: ISSUED, paths: 100, implementationSHA256: 'test', futureDays: 20, priorPublications: [prior, sameDay]});
  assert.equal(q.assets[0].previous.forecastId, prior.forecastId); assert.equal(q.assets[0].previous.source, 'immutable_published_forecast');
  assert.deepEqual(q.earlierToday.map(e => e.forecastId), [sameDay.forecastId]);
  assert.equal(q.summary.previousForecastStocks, 52);
});

test('불변 저장: 같은 발행본은 재사용, 다른 내용의 같은 ID 는 거부, latest 포인터는 비교-교환, CSV 21행', async () => {
  const p = await publication(), rootDir = await tempRoot();
  const first = await persistForecast11(p, {rootDir, expectedLatestId: null});
  assert.equal(first.reused, false); assert.equal(first.createdForecastFiles, 52);
  const again = await persistForecast11(p, {rootDir, expectedLatestId: p.forecastId});
  assert.equal(again.reused, true); assert.equal(again.createdForecastFiles, 0);
  await assert.rejects(persistForecast11(p, {rootDir, expectedLatestId: null}), /LATEST_CONFLICT/);
  const tampered = structuredClone(p); tampered.provenance.semanticSHA256 = 'x'.repeat(64);
  await assert.rejects(persistForecast11(tampered, {rootDir, expectedLatestId: p.forecastId}), /ID_COLLISION/);
  const csv = await fs.readFile(path.join(rootDir, 'public/downloads/atlas11', p.forecastId, `ATLAS_${p.assets[0].code}_20260928.csv`), 'utf8');
  const lines = csv.trim().split('\r\n'); assert.equal(lines.length, 22); assert.equal(lines[0].replace(/^﻿/, ''), '날짜,구분,예측값,상단,하단'); assert.match(lines[1], /실제출발/);
  const manifest = JSON.parse(await fs.readFile(path.join(rootDir, 'public/downloads/atlas11', p.forecastId, 'manifest.json'), 'utf8'));
  assert.equal(manifest.files.length, 52); assert.equal(manifest.anchorRowIncluded, true); assert.equal(manifest.rowsPerFile, 21);
  const all = await readAllPublications(rootDir); assert.equal(all.length, 1); assert.equal(all[0].forecastId, p.forecastId);
  const stored = JSON.parse(await fs.readFile(path.join(rootDir, 'reports/atlas11/versions', p.forecastId + '.json'), 'utf8'));
  assert.equal(stored.assets[7].rows[20].p50, p.assets[7].rows[20].p50);
  assert.equal(forecastCSV(p.assets[0]).split('\r\n').length, 23);
});

/* ---------------- 「내일 하루만」(2026-10-02 사장님 명령 · config/atlas11/horizon.json futureDays 1) ---------------- */
const NUMERIC_KEYS = ['p05', 'p10', 'p25', 'p50', 'p75', 'p90', 'p95', 'mean', 'return', 'lossPathShare', 'dailyP50Change'];
let pair = null;
/** 같은 입력·같은 경로 수(400)로 20거래일 판과 내일 하루만 판을 함께 만든다 */
async function tomorrowPair() {
  if (pair) return pair;
  const {input, calendar, registry, records} = await realInputs();
  const news = await readJSON('public/data/atlas11/news-events.json').catch(() => ({assets: []}));
  const common = {input, recordsPayload: records, registry, calendar, issuedAt: ISSUED, paths: 400, implementationSHA256: 'test', newsAssets: news.assets};
  pair = {twenty: buildForecast11({...common, futureDays: 20}), one: buildForecast11({...common, futureDays: 1})};
  return pair;
}

test('내일 하루만 꼴(contract §1): horizon 1 · futureDates=[다음 거래일] · 행 2 · scenario null · errors {1:null} · 정책 표지 · tomorrowOnly 표지', async () => {
  const {one, twenty} = await tomorrowPair(), {input, calendar} = await realInputs(), h = loadHorizon(root);
  const next = calendar.sessions.filter(d => d > input.actualAsOf)[0];
  assert.equal(one.horizon, 1); assert.deepEqual(one.futureDates, [next]); assert.equal(next, '2026-09-29');
  assert.equal(one.modelVersion, 'atlas11-A-1'); assert.equal(one.policy.id, 'atlas11-tomorrow-A-1'); assert.equal(one.policy.horizon, 1); assert.equal(one.policy.modelVersion, 'atlas11-A-1');
  assert.deepEqual({...one.policy, id: twenty.policy.id, horizon: 20}, twenty.policy, '정책은 id·horizon 말고 그대로');
  assert.deepEqual(one.tomorrowOnly, {futureDays: 1, since: h.since, config: 'config/atlas11/horizon.json', configSHA256: h.configSHA256});
  assert.equal(one.summary.futurePointsPerStock, 1); assert.equal(one.summary.closeCallStocksDay20, null); assert.equal(one.summary.anchorMatches, 52);
  for (const a of one.assets) {
    assert.equal(a.rows.length, 2); assert.equal(a.rows[0].anchor, true); assert.equal(a.rows[1].date, next);
    assert.equal(a.scenario, null); assert.deepEqual(a.errors, {1: null});
  }
  assert.equal(one.audit.computedSteps, 1); assert.equal(one.audit.rngStepsPerPath, 20); assert.equal(one.audit.skippedDrawsPerPath, 19);
  assert.equal(validateForecast11(one), true);
  assert.notEqual(one.forecastId, twenty.forecastId, '20거래일 판과 ID 가 섞이지 않는다');
});

test('회귀(내일 = 20거래일 첫날): 같은 입력이면 내일 행의 모든 숫자가 20거래일 계산 1일째 행과 한 자리도 같다 · 52종목', async () => {
  const {one, twenty} = await tomorrowPair();
  let compared = 0;
  for (let i = 0; i < 52; i++) {
    const a = one.assets[i].rows[1], b = twenty.assets[i].rows[1];
    assert.equal(one.assets[i].code, twenty.assets[i].code);
    for (const k of NUMERIC_KEYS) { assert.equal(a[k], b[k], `${one.assets[i].code} ${k}`); compared++; }
    assert.deepStrictEqual(a.direction, b.direction); assert.deepStrictEqual(a.dailyMovement, b.dailyMovement); assert.deepStrictEqual(a.factor36, b.factor36); assert.deepStrictEqual(a.wave, b.wave);
    assert.deepStrictEqual(a, b, '행 전체가 같다');
    assert.deepStrictEqual(one.assets[i].rows[0], twenty.assets[i].rows[0]); assert.deepStrictEqual(one.assets[i].model, twenty.assets[i].model);
  }
  assert.equal(compared, 52 * NUMERIC_KEYS.length);
  assert.equal(one.summary.closeCallStocksDay1, twenty.summary.closeCallStocksDay1);
});

test('내일 하루만 저장: CSV 2행(출발 + 내일) · manifest rowsPerFile 2 · futurePoints 1 · 다시 읽기 통과', async () => {
  const {one} = await tomorrowPair(), rootDir = await tempRoot();
  const first = await persistForecast11(one, {rootDir, expectedLatestId: null}); assert.equal(first.csvFiles, 52);
  const csv = await fs.readFile(path.join(rootDir, 'public/downloads/atlas11', one.forecastId, `ATLAS_${one.assets[0].code}_20260928.csv`), 'utf8');
  const lines = csv.trim().split('\r\n'); assert.equal(lines.length, 3, '머리줄 + 2행'); assert.match(lines[1], /실제출발/); assert.match(lines[2], /^2026-09-29,전망,/);
  const manifest = JSON.parse(await fs.readFile(path.join(rootDir, 'public/downloads/atlas11', one.forecastId, 'manifest.json'), 'utf8'));
  assert.equal(manifest.rowsPerFile, 2); assert.equal(manifest.futurePoints, 1); assert.ok(manifest.files.every(f => f.rows === 2 && f.futurePoints === 1));
  const all = await readAllPublications(rootDir); assert.equal(all.length, 1); assert.equal(all[0].horizon, 1);
});

test('검사기는 두 꼴을 다 받는다: 저장소의 지난 20거래일 발행본 전부 통과 · 내일 하루만 꼴 변조는 거부', async () => {
  const past = await readAllPublications(root);
  assert.ok(past.length >= 1); assert.ok(past.filter(p => p.schema === FORECAST11_SCHEMA).every(p => p.horizon === 20 && p.assets.every(a => a.rows.length === 21)), '지난 기록은 20거래일 그대로');
  const {one} = await tomorrowPair(), clone = () => structuredClone(one);
  let x = clone(); x.assets[0].scenario = {prices: [1, 2]}; assert.throws(() => validateForecast11(x), /ASSET_CONTRACT/);
  x = clone(); x.assets[0].rows.push({...x.assets[0].rows[1]}); assert.throws(() => validateForecast11(x), /ASSET_CONTRACT/);
  x = clone(); delete x.tomorrowOnly; assert.throws(() => validateForecast11(x), /TOMORROW_ONLY/);
  x = clone(); x.futureDates.push('2026-09-30'); assert.throws(() => validateForecast11(x), /CONTRACT/);
  x = clone(); x.assets[2].rows[1].p05 = x.assets[2].rows[1].p95 + 1; assert.throws(() => validateForecast11(x), /ROW_CONTRACT/);
  assert.throws(() => forecastCSV({rows: clone().assets[0].rows.slice(0, 1)}), /CSV_ROWS/);
});

test('스위치 읽기: futureDays 를 주지 않으면 config/atlas11/horizon.json 을 읽는다 · 설정 파일이 없는 곳은 옛 20', async () => {
  const {input, calendar, registry, records} = await realInputs();
  const fromRepo = buildForecast11({input, recordsPayload: records, registry, calendar, issuedAt: ISSUED, paths: 100, implementationSHA256: 'test'});
  assert.equal(fromRepo.horizon, loadHorizon(root).futureDays);
  const legacy = buildForecast11({input, recordsPayload: records, registry, calendar, issuedAt: ISSUED, paths: 100, implementationSHA256: 'test', rootDir: await tempRoot()});
  assert.equal(legacy.horizon, 20); assert.equal(legacy.tomorrowOnly, undefined); assert.equal(legacy.policy.id, 'atlas11-rolling20-A-1'); assert.equal(legacy.assets[0].rows.length, 21);
});
