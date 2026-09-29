import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import {buildForecast11, validateForecast11, forecastCSV, persistForecast11, readAllPublications, FORECAST11_SCHEMA} from '../../lib/atlas11/forecast.mjs';
import {realInputs, tempRoot, ISSUED, readJSON} from './helpers.mjs';

let built = null;
async function publication() {
  if (built) return built;
  const {input, calendar, registry, records} = await realInputs();
  const news = await readJSON('public/data/atlas11/news-events.json').catch(() => ({assets: []}));
  built = buildForecast11({input, recordsPayload: records, registry, calendar, issuedAt: ISSUED, paths: 150, implementationSHA256: 'test', newsAssets: news.assets});
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
  const q = buildForecast11({input: leaked, recordsPayload: records, registry, calendar, issuedAt: ISSUED, paths: 100, implementationSHA256: 'test'});
  assert.ok(!q.assets[0].actual60.some(r => r.date === '2026-09-29'), '기준일 뒤 가격은 입력에서 제외');
  assert.notEqual(q.assets[0].rows[1].p50, 999999); assert.equal(q.assets[0].anchor.date, '2026-09-28');
  const observedLate = structuredClone(input);
  observedLate.assets[0].prices.at(-1).observedAt = '2026-09-28T23:00:00Z';
  assert.throws(() => buildForecast11({input: observedLate, recordsPayload: records, registry, calendar, issuedAt: ISSUED, paths: 100, implementationSHA256: 'test'}), /FUTURE_OBSERVATION/, '발행 시각 뒤에 관측된 가격은 거부');
  const early = structuredClone(input); early.actualAsOf = '2026-09-28';
  assert.throws(() => buildForecast11({input: early, recordsPayload: records, registry, calendar, issuedAt: '2026-09-28T03:00:00.000Z', paths: 100, implementationSHA256: 'test'}), /CLOSE_NOT_FINAL/, '15:30 전에는 오늘 종가로 발행 불가');
});

test('어제 전망 연결: 직전 거래일 발행본만 previous 가 된다 · 같은 날 앞선 발행은 earlierToday', async () => {
  const {input, calendar, registry, records} = await realInputs();
  const p = await publication();
  const prior = structuredClone(p); prior.forecastId = prior.id = '2026-09-23-atlas11-0000000000000000'; prior.issuedAt = '2026-09-23T08:00:00.000Z'; prior.actualAsOf = '2026-09-23';
  const sameDay = structuredClone(p); sameDay.forecastId = sameDay.id = '2026-09-28-atlas11-1111111111111111'; sameDay.issuedAt = '2026-09-28T09:00:00.000Z';
  const q = buildForecast11({input, recordsPayload: records, registry, calendar, issuedAt: ISSUED, paths: 100, implementationSHA256: 'test', priorPublications: [prior, sameDay]});
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
