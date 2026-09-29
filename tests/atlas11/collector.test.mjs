import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import {execFile} from 'node:child_process';
import {promisify} from 'node:util';
import {collect, parseFchartXml, parseNaverDayJson, fetchWithRetry, finalizeToday, rowProblem, fixtureFetch, fchartUrl, naverDayUrl, PROVIDER, FINALITY_BASIS} from '../../scripts/atlas11/collect_naver.mjs';
import {rollingOperationWindow, mergeRollingPrices, rollingHash} from '../../lib/rolling-operation.mjs';
import {runDaily} from '../../lib/atlas11/daily.mjs';
import {realInputs, root, readJSON, tempRoot} from './helpers.mjs';

const run = promisify(execFile);
const FIXTURES = path.join(root, 'tests/atlas11/fixtures/collector');
const NOW = '2026-09-29T07:05:00.000Z';            // 2026-09-29(화 · 거래일) 16:05 KST — 마감 뒤 · 마감 목표(16:00) 뒤
const NOW_1540 = '2026-09-29T06:40:00.000Z';       // 15:40 KST — 마감 뒤 · 16:00 전 (명시 증거 필수 구간)
const NOW_1520 = '2026-09-29T06:20:00.000Z';       // 15:20 KST — 정규장 마감 전
const CODES = ['005930', '000720', '373220'];
const noSleep = async () => {};

// ---------- 합성 응답 만들기 (실제 시세 아님) ----------
const ymd = d => d.replace(/-/g, '');
function bars(seed, dates) {
  let s = seed * 7919 + 17; const rnd = () => { s = (s * 1103515245 + 12345) % 2147483648; return s / 2147483648; };
  let close = 10000 + (seed % 50) * 1000; const rows = [];
  for (const date of dates) {
    const open = Math.round(close * (1 + (rnd() - 0.5) * 0.02)), next = Math.round(open * (1 + (rnd() - 0.5) * 0.04));
    const high = Math.max(open, next) + Math.round(rnd() * 200), low = Math.min(open, next) - Math.round(rnd() * 200);
    rows.push({date, open, high, low, close: next, volume: 100000 + Math.round(rnd() * 1e6)}); close = next;
  }
  return rows;
}
const xml = (symbol, rows, extra = '') => `<?xml version="1.0" encoding="EUC-KR" ?>\r\n<protocol>\r\n<chartdata symbol="${symbol}" name="합성" count="${rows.length}" timeframe="day" precision="0" origintime="20230614">\r\n${rows.map(r => `<item data="${ymd(r.date)}|${r.open}|${r.high}|${r.low}|${r.close}|${r.volume}" />`).join('\r\n')}${extra}\r\n</chartdata>\r\n</protocol>`;
const json = rows => JSON.stringify(rows.map(r => ({localDate: ymd(r.date), closePrice: String(r.close), openPrice: String(r.open), highPrice: String(r.high), lowPrice: String(r.low), accumulatedTradingVolume: String(r.volume), foreignRetentionRate: '50.00'})));
const symbolOf = url => { const u = new URL(url); return u.searchParams.get('symbol') ?? /\/item\/([^/]+)\/day/.exec(u.pathname)?.[1] ?? null; };
const respond = (body, status = 200, type = 'text/xml; charset=EUC-KR') => new Response(body, {status, headers: {'content-type': type}});
/** URL → 응답 함수. calls[url] 에 호출 횟수를 센다 */
function stubFetch(handler) {
  const calls = {}; let inFlight = 0, maxInFlight = 0;
  const f = async (url, init) => { calls[url] = (calls[url] ?? 0) + 1; inFlight++; maxInFlight = Math.max(maxInFlight, inFlight); try { await new Promise(r => setImmediate(r)); return await handler(url, calls[url], init); } finally { inFlight--; } };
  f.calls = calls; f.count = () => Object.values(calls).reduce((s, n) => s + n, 0); f.maxInFlight = () => maxInFlight;
  return f;
}
let ctx = null;
async function context() {
  if (ctx) return ctx;
  const {calendar} = await realInputs();
  const sessions = calendar.sessions, dates = sessions.filter(d => d <= '2026-09-29').slice(-6);   // 2026-09-19 ~ 09-29 거래일 여섯 (추석 9/24·25 제외)
  const input = {schema: 'test', origin: '2026-09-17', end: '2026-10-30', actualAsOf: '2026-09-28', calendar: {sessions, holidays: calendar.holidays}, assets: CODES.map((code, i) => ({code, name: 'T' + i, prices: [{date: '2026-09-28', close: 10000 + (Number(code) % 50) * 1000}]}))};
  const rowsOf = Object.fromEntries(CODES.map(code => [code, bars(Number(code), dates)]));
  return ctx = {calendar, sessions, dates, input, rowsOf, window: now => rollingOperationWindow(input, now, {calendar, runEndDate: null})};
}
const merge = (input, observations, now, calendar) => mergeRollingPrices(input, observations, {now, expectedHash: rollingHash(input), calendar});

test('parseFchartXml: 행·날짜·숫자 · 주석/CRLF 무시 · 정렬 · timeframe≠day 거부 · 깨진 행 거부 · 중복 충돌 거부', async () => {
  const {dates} = await context(), rows = bars(1, dates);
  const parsed = parseFchartXml(xml('005930', [...rows].reverse(), '\r\n<!-- 주석 -->'));
  assert.equal(parsed.symbol, '005930'); assert.equal(parsed.timeframe, 'day'); assert.equal(parsed.count, rows.length);
  assert.deepEqual(parsed.rows, rows);
  assert.ok(parsed.rows.every(r => /^\d{4}-\d{2}-\d{2}$/.test(r.date) && [r.open, r.high, r.low, r.close, r.volume].every(Number.isFinite)));
  const idx = parseFchartXml('<protocol><chartdata symbol="KOSPI" timeframe="day"><item data="20260929|3010.12|3050.5|2990.01|3044.44|512345" /></chartdata></protocol>');
  assert.deepEqual(idx.rows, [{date: '2026-09-29', open: 3010.12, high: 3050.5, low: 2990.01, close: 3044.44, volume: 512345}]);
  assert.throws(() => parseFchartXml(xml('005930', rows).replace('timeframe="day"', 'timeframe="minute"')), /FCHART_TIMEFRAME_NOT_DAY/);
  assert.throws(() => parseFchartXml('<protocol><chartdata symbol="x" timeframe="day"><item data="20260929|1|2" /></chartdata></protocol>'), /FCHART_ROW_FIELDS/);
  assert.throws(() => parseFchartXml('<protocol><chartdata symbol="x" timeframe="day"><item data="2026-09-29|1|2|1|2|3" /></chartdata></protocol>'), /FCHART_ROW_VALUE/);
  assert.throws(() => parseFchartXml('<protocol><chartdata symbol="x" timeframe="day"><item data="20260929|1|2|1|2|3" /><item data="20260929|1|2|1|9|3" /></chartdata></protocol>'), /DUPLICATE_DATE_CONFLICT/);
  assert.throws(() => parseFchartXml('<html>error</html>'), /FCHART_NOT_XML/);
  assert.throws(() => parseFchartXml(''), /FCHART_EMPTY/);
  assert.deepEqual(parseFchartXml('<protocol><chartdata symbol="x" count="0" timeframe="day"></chartdata></protocol>').rows, []);
});

test('parseNaverDayJson: 문자열 숫자(쉼표 포함) · 정렬 · 배열 아님/필드 빠짐/JSON 아님 거부', async () => {
  const {dates} = await context(), rows = bars(2, dates);
  assert.deepEqual(parseNaverDayJson(json([...rows].reverse())).rows, rows);
  assert.deepEqual(parseNaverDayJson('[{"localDate":"20260929","openPrice":"79,600","highPrice":80000,"lowPrice":"79,000","closePrice":"79,900","accumulatedTradingVolume":"1,234"}]').rows, [{date: '2026-09-29', open: 79600, high: 80000, low: 79000, close: 79900, volume: 1234}]);
  assert.throws(() => parseNaverDayJson('{"a":1}'), /NAVER_JSON_NOT_ARRAY/);
  assert.throws(() => parseNaverDayJson('[{"localDate":"20260929","openPrice":"1"}]'), /NAVER_JSON_ROW/);
  assert.throws(() => parseNaverDayJson('<html>'), /NAVER_JSON_INVALID/);
});

test('rowProblem: 정지 봉(0/0/0/0 · 종가>0)은 통과 · 종가 0 · 음수 거래량 · OHLC 어긋남은 사유', () => {
  assert.equal(rowProblem({date: 'd', open: 0, high: 0, low: 0, close: 100, volume: 0}), null);
  assert.equal(rowProblem({date: 'd', open: 10, high: 12, low: 9, close: 11, volume: 5}), null);
  assert.equal(rowProblem({date: 'd', open: 10, high: 12, low: 9, close: 0, volume: 5}), 'close_not_positive');
  assert.equal(rowProblem({date: 'd', open: 10, high: 12, low: 9, close: 11, volume: -1}), 'volume_negative');
  assert.equal(rowProblem({date: 'd', open: 10, high: 9, low: 12, close: 11, volume: 5}), 'ohlc_inconsistent');
  assert.equal(rowProblem({date: 'd', open: 10, high: 12, low: 9, close: 13, volume: 5}), 'ohlc_inconsistent');
  assert.equal(rowProblem({date: 'd', open: '10', high: 12, low: 9, close: 11, volume: 5}), 'non_numeric');
});

test('fetchWithRetry: 500 두 번 뒤 성공(3회 · 대기 1s/3s) · 404 는 즉시 포기 · 전부 실패면 4회 시도 · sha256 · 시간 제한(Abort)', async () => {
  const slept = []; const sleep = async ms => { slept.push(ms); };
  let n = 0; const flaky = async () => (++n < 3 ? respond('boom', 500) : respond('<protocol><chartdata symbol="x" timeframe="day"><item data="20260929|1|2|1|2|3" /></chartdata></protocol>'));
  const got = await fetchWithRetry('https://fchart.stock.naver.com/sise.nhn?symbol=x', {fetch: flaky, sleep});
  assert.equal(got.attempts.length, 3); assert.deepEqual(slept, [1000, 3000]); assert.equal(got.status, 200);
  assert.match(got.rawHash, /^[0-9a-f]{64}$/); assert.equal(got.rawHash, (await import('node:crypto')).createHash('sha256').update(got.bytes).digest('hex'));
  assert.ok(got.text.includes('<item'));
  const dead = async () => respond('nope', 404);
  await assert.rejects(fetchWithRetry('https://fchart.stock.naver.com/x', {fetch: dead, sleep}), e => e.attempts.length === 1 && e.attempts[0].status === 404 && /FETCH_FAILED/.test(e.message));
  slept.length = 0;
  const down = async () => { throw Error('ECONNREFUSED'); };
  await assert.rejects(fetchWithRetry('https://fchart.stock.naver.com/x', {fetch: down, sleep}), e => e.attempts.length === 4 && e.attempts.every(a => /ECONNREFUSED/.test(a.error)));
  assert.deepEqual(slept, [1000, 3000, 9000]);
  const hang = (url, init) => new Promise((_, reject) => init.signal.addEventListener('abort', () => reject(init.signal.reason)));
  await assert.rejects(fetchWithRetry('https://fchart.stock.naver.com/x', {fetch: hang, sleep, timeoutMs: 5, retries: 1}), e => e.attempts.length === 2 && e.attempts.every(a => /TIMEOUT/.test(a.error)));
  await assert.rejects(fetchWithRetry('https://fchart.stock.naver.com/x', {fetch: null}), /FETCH_UNAVAILABLE/);
  // User-Agent · Referer 헤더가 붙는다
  let seen; await fetchWithRetry('https://fchart.stock.naver.com/x', {fetch: async (u, init) => { seen = init.headers; return respond('<protocol><chartdata symbol="x" timeframe="day"></chartdata></protocol>'); }, sleep});
  assert.ok(/ATLAS11/.test(seen['User-Agent'])); assert.equal(seen.Referer, 'https://finance.naver.com/');
});

test('finalizeToday: 두 번 같으면 확정(finalizedAt=두 번째) · 종가/거래량 다르면 fetch_mismatch · 15:30 전 · 두 번째 없음 · 오늘 봉 없음', () => {
  const day = '2026-09-29', url = fchartUrl('005930', 30), row = {date: day, open: 1, high: 3, low: 1, close: 2, volume: 9};
  const a = {rows: [row], observedAt: '2026-09-29T06:31:00.000Z', rawHash: 'a'.repeat(64), fetchedAt: '2026-09-29T06:31:00.500Z'};
  const b = {rows: [row], observedAt: '2026-09-29T06:32:30.000Z', rawHash: 'b'.repeat(64), fetchedAt: '2026-09-29T06:32:30.500Z'};
  const ok = finalizeToday(a, b, {day, url});
  assert.equal(ok.final, true); assert.equal(ok.sessionDate, day); assert.equal(ok.finalizedAt, b.observedAt); assert.equal(ok.finalitySourceUrl, url); assert.equal(ok.finalityBasis, FINALITY_BASIS);
  assert.deepEqual(ok.finalityEvidence, {firstObservedAt: a.observedAt, firstFetchedAt: a.fetchedAt, firstRawHash: a.rawHash, secondObservedAt: b.observedAt, secondFetchedAt: b.fetchedAt, secondRawHash: b.rawHash, close: 2, volume: 9});
  assert.equal(finalizeToday(a, {...b, rows: [{...row, close: 3}]}, {day, url}).reason, 'fetch_mismatch');
  assert.equal(finalizeToday(a, {...b, rows: [{...row, volume: 10}]}, {day, url}).reason, 'fetch_mismatch');
  assert.equal(finalizeToday({...a, observedAt: '2026-09-29T06:29:59.000Z'}, b, {day, url}).reason, 'before_regular_close');
  assert.equal(finalizeToday(a, {...b, observedAt: '2026-09-29T06:29:59.000Z'}, {day, url}).reason, 'before_regular_close');
  assert.equal(finalizeToday(a, null, {day, url}).reason, 'second_fetch_failed');
  assert.equal(finalizeToday({...a, rows: []}, b, {day, url}).reason, 'today_bar_absent');
  assert.equal(finalizeToday(a, {...b, rows: []}, {day, url}).reason, 'today_bar_absent_on_second_fetch');
  assert.equal(finalizeToday(a, {...b, observedAt: '2026-09-29T06:30:30.000Z'}, {day, url}).reason, 'clock_not_monotonic');
});

test('collect: 마감 뒤 두 번 받아 같으면 finalClose 증거 · 비거래일/미완료 행은 버리고 셈 · mergeRollingPrices 통과 · 52 규칙의 confirmedToday', async () => {
  const {input, calendar, rowsOf, window} = await context();
  const saturday = {date: '2026-09-26', open: 1, high: 2, low: 1, close: 1, volume: 1}, future = {date: '2026-09-30', open: 1, high: 2, low: 1, close: 1, volume: 1};
  const f = stubFetch(async url => { const s = symbolOf(url); if (s === 'KOSPI') return respond(xml('KOSPI', bars(9, ['2026-09-28', '2026-09-29']))); return respond(xml(s, [...rowsOf[s], saturday, future])); });
  const slept = []; const sleep = async ms => { slept.push(ms); };
  const r = await collect(input, window(NOW_1540), {fetch: f, now: NOW_1540, calendar, sleep, finalityDelayMs: 90000, politeDelayMs: 150, concurrency: 1});
  assert.equal(r.attempted, true); assert.equal(r.provider, PROVIDER); assert.equal(r.mode, 'injected_fetch'); assert.equal(r.delayed, false);
  assert.deepEqual(r.errors, []); assert.deepEqual(r.marketErrors, []);
  assert.deepEqual({...r.stats, durationMs: 0}, {stocks: 3, succeeded: 3, failed: 0, delayedFinality: 0, finalizedToday: 3, droppedNonSessionRows: 3, droppedIncompleteRows: 3, droppedInvalidRows: 0, reviewedRowMismatches: 0, requests: 7, durationMs: 0});
  assert.equal(slept.filter(x => x === 90000).length, 1, '확정 대기 90초 한 번(종목마다가 아니라 한 번)'); assert.equal(slept.filter(x => x === 150).length, 4, '동시 1 · 세 종목 사이 150ms 두 번 × 두 단계');
  assert.equal(r.warnings.filter(w => w.code === 'NON_SESSION_ROWS').length, 3);
  assert.deepEqual(r.lastGoodDate, Object.fromEntries(CODES.map(c => [c, '2026-09-29'])));
  for (const code of CODES) { assert.equal(f.calls[fchartUrl(code, 30)], 2, code + ' 두 번 받기'); assert.equal(f.calls[naverDayUrl(code, '2026-08-14', '2026-09-29')] ?? 0, 0, '2차 원천은 안 쓴다'); }
  assert.equal(f.calls[fchartUrl('KOSPI', 30)], 1);
  for (const o of r.observations) {
    assert.equal(o.source, 'fchart'); assert.equal(new URL(o.sourceUrl).hostname, 'fchart.stock.naver.com'); assert.match(o.rawHash, /^[0-9a-f]{64}$/);
    assert.equal(o.observedAt, NOW_1540); assert.equal(o.finalClose, true); assert.equal(o.sessionDate, '2026-09-29'); assert.equal(o.finalizedAt, NOW_1540); assert.equal(o.finalitySourceUrl, o.sourceUrl); assert.equal(o.finalityBasis, FINALITY_BASIS);
    assert.equal(o.finalityEvidence.firstRawHash, o.finalityEvidence.secondRawHash); assert.equal(o.rawHash, o.finalityEvidence.secondRawHash);
    assert.deepEqual(o.rows, rowsOf[o.code], '합성 행 그대로 · 토요일·미래 행은 빠짐'); assert.ok(o.rows.every(x => Object.keys(x).length === 6));
  }
  assert.equal(r.marketObservations.length, 1); assert.equal(r.marketObservations[0].symbol, 'KOSPI'); assert.equal(r.marketObservations[0].rows.length, 2);
  // 검증기(실제 함수) 통과 — 16:00 전 관측이므로 명시 증거가 있어야만 받는다
  const merged = merge(input, r.observations, NOW_1540, calendar);
  assert.deepEqual(merged.confirmedTodayCodes, [...CODES].sort()); assert.equal(merged.actualAsOf, '2026-09-29'); assert.equal(merged.changed, true);
  const stored = merged.input.assets[0].prices.find(p => p.date === '2026-09-29');
  assert.equal(stored.finalClose, true); assert.equal(stored.finalizedAt, NOW_1540); assert.equal(stored.rawHash, r.observations[0].rawHash);
  // 증거를 떼면 같은 관측이 거부된다(검증기가 실제로 증거를 보는지)
  assert.throws(() => merge(input, r.observations.map(({finalClose, ...o}) => o), NOW_1540, calendar), /EXPLICIT_FINAL_CLOSE_EVIDENCE_REQUIRED/);
});

test('collect: 두 번째 받기에서 종가/거래량이 다르면 그 종목의 오늘 행만 빠지고 TODAY_NOT_FINAL · delayed=true · 나머지는 검증기 통과', async () => {
  const {input, calendar, rowsOf, window} = await context();
  const f = stubFetch(async (url, nth) => { const s = symbolOf(url); if (s === 'KOSPI') return respond('x', 500); const rows = rowsOf[s].map(r => ({...r})); if (s === '000720' && nth === 2) rows.at(-1).close += 100; if (s === '373220' && nth === 2) rows.at(-1).volume += 1; return respond(xml(s, rows)); });
  const r = await collect(input, window(NOW), {fetch: f, now: NOW, calendar, sleep: noSleep, finalityDelayMs: 0, politeDelayMs: 0});
  assert.equal(r.delayed, true); assert.equal(r.stats.delayedFinality, 2); assert.equal(r.stats.finalizedToday, 1); assert.equal(r.stats.succeeded, 3);
  assert.deepEqual(r.errors.map(e => [e.code, e.stockCode, e.reason]).sort(), [['TODAY_NOT_FINAL', '000720', 'fetch_mismatch'], ['TODAY_NOT_FINAL', '373220', 'fetch_mismatch']]);
  assert.deepEqual(r.errors.find(e => e.stockCode === '000720').first.close + 100, r.errors.find(e => e.stockCode === '000720').second.close);
  assert.equal(r.marketErrors.length, 1); assert.equal(r.marketErrors[0].code, 'MARKET_FETCH_FAILED'); assert.deepEqual(r.marketObservations, []);
  const bad = r.observations.find(o => o.code === '000720'), good = r.observations.find(o => o.code === '005930');
  assert.ok(!bad.rows.some(x => x.date === '2026-09-29') && bad.finalClose === undefined && bad.rows.length === rowsOf['000720'].length - 1);
  assert.equal(good.finalClose, true); assert.equal(r.lastGoodDate['000720'], '2026-09-28'); assert.equal(r.lastGoodDate['005930'], '2026-09-29');
  const merged = merge(input, r.observations, NOW, calendar);
  assert.deepEqual(merged.confirmedTodayCodes, ['005930']); assert.equal(merged.actualAsOf, '2026-09-28', '셋 다 있어야 오늘로 넘어간다');
});

test('collect: 시계가 15:30 전이면 두 번째 받기 없이 오늘 행 제외(before_regular_close) · 마감 전 창(cutoff=어제)이면 오늘 행은 미완료로 버림', async () => {
  const {input, calendar, rowsOf, window} = await context();
  const f = stubFetch(async url => respond(xml(symbolOf(url), rowsOf[symbolOf(url)] ?? bars(9, ['2026-09-29']))));
  const forced = {...window(NOW), afterClose: true, session: true, cutoff: '2026-09-29'};
  const r = await collect(input, forced, {fetch: f, now: NOW_1520, calendar, sleep: noSleep, finalityDelayMs: 0, politeDelayMs: 0, market: []});
  assert.equal(r.delayed, true); assert.deepEqual(r.errors.map(e => e.reason), ['before_regular_close', 'before_regular_close', 'before_regular_close']);
  assert.ok(CODES.every(c => f.calls[fchartUrl(c, 30)] === 1), '두 번째 받기 없음'); assert.ok(r.observations.every(o => !o.rows.some(x => x.date === '2026-09-29') && !o.finalClose));
  assert.doesNotThrow(() => merge(input, r.observations, NOW, calendar));
  const w = window(NOW_1520); assert.equal(w.afterClose, false); assert.equal(w.cutoff, '2026-09-28');
  const g = stubFetch(async url => respond(xml(symbolOf(url), rowsOf[symbolOf(url)])));
  const r2 = await collect(input, w, {fetch: g, now: NOW_1520, calendar, sleep: noSleep, finalityDelayMs: 0, politeDelayMs: 0, market: []});
  assert.equal(r2.window.todayRequired, false); assert.equal(r2.delayed, false); assert.deepEqual(r2.errors, []); assert.equal(r2.stats.droppedIncompleteRows, 3);
  assert.ok(r2.observations.every(o => o.rows.at(-1).date === '2026-09-28'));
  assert.doesNotThrow(() => merge(input, r2.observations, NOW_1520, calendar));
});

test('collect: 1차(fchart) 원천이 계속 실패하면 4회 시도 뒤 2차(api JSON) · 둘 다 실패한 종목만 FETCH_FAILED · 다른 종목은 무사', async () => {
  const {input, calendar, rowsOf, window} = await context();
  const f = stubFetch(async url => { const u = new URL(url), s = symbolOf(url); if (u.hostname === 'fchart.stock.naver.com') return s === '005930' ? respond(xml(s, rowsOf[s])) : respond('down', 503); if (s === '000720') return respond(json(rowsOf[s]), 200, 'application/json'); return respond('{}', 500, 'application/json'); });
  const slept = []; const sleep = async ms => { slept.push(ms); };
  const r = await collect(input, window(NOW), {fetch: f, now: NOW, calendar, sleep, finalityDelayMs: 0, politeDelayMs: 0, market: []});
  assert.equal(r.stats.succeeded, 2); assert.equal(r.stats.failed, 1); assert.equal(r.stats.finalizedToday, 2); assert.equal(r.lastGoodDate['373220'], null);
  assert.deepEqual(r.errors.map(e => [e.code, e.stockCode]), [['FETCH_FAILED', '373220']]);
  const failed = r.errors[0]; assert.equal(failed.tried.length, 2); assert.ok(failed.tried.every(t => t.ok === false && t.attempts.length === 4), '원천마다 4회');
  assert.equal(f.calls[fchartUrl('000720', 30)], 4); assert.equal(f.calls[naverDayUrl('000720', '2026-08-14', '2026-09-29')], 2, '2차 원천으로 두 번(확정) 받기');
  const alt = r.observations.find(o => o.code === '000720');
  assert.equal(alt.source, 'naver_api'); assert.equal(new URL(alt.sourceUrl).hostname, 'api.stock.naver.com'); assert.equal(alt.finalClose, true); assert.equal(alt.finalitySourceUrl, alt.sourceUrl);
  assert.deepEqual(alt.rows, rowsOf['000720'], 'JSON 문자열 값이 같은 숫자 행으로');
  assert.equal(alt.fetchAttempts[0].ok, false); assert.equal(alt.fetchAttempts[0].attempts.length, 4); assert.equal(alt.fetchAttempts[1].ok, true);
  assert.ok(slept.filter(x => x === 9000).length >= 2, '9초 대기까지 간다');
  const merged = merge(input, r.observations, NOW, calendar); assert.deepEqual(merged.confirmedTodayCodes, ['000720', '005930']);
});

test('collect: 동시 요청 4 이하 · 종목 실패 격리 · 16:00 뒤 doubleFetchAfterDeadline=false 면 증거 없이 오늘 행 유지(검증기는 시각으로 받음)', async () => {
  const {calendar, sessions, dates} = await context();
  const codes = Array.from({length: 12}, (_, i) => String(100000 + i * 1111).padStart(6, '0'));
  const input = {schema: 'test', origin: '2026-09-17', end: '2026-10-30', actualAsOf: '2026-09-28', calendar: {sessions}, assets: codes.map(code => ({code, name: code, prices: []}))};
  const window = rollingOperationWindow(input, NOW, {calendar, runEndDate: null});
  const f = stubFetch(async url => { const s = symbolOf(url); if (s === codes[5]) throw Error('ECONNRESET'); return respond(xml(s, bars(Number(s), dates))); });
  const r = await collect(input, window, {fetch: f, now: NOW, calendar, sleep: noSleep, finalityDelayMs: 0, politeDelayMs: 0, market: [], doubleFetchAfterDeadline: false});
  assert.ok(f.maxInFlight() <= 4 && f.maxInFlight() >= 2, 'in-flight ' + f.maxInFlight());
  assert.equal(r.stats.succeeded, 11); assert.equal(r.stats.failed, 1); assert.equal(r.stats.finalizedToday, 0); assert.equal(r.delayed, false);
  assert.ok(codes.filter(c => c !== codes[5]).every(c => f.calls[fchartUrl(c, 30)] === 1), '16:00 뒤 · 두 번 받기 끔 → 한 번만');
  assert.ok(r.observations.every(o => o.finalClose === undefined && o.rows.some(x => x.date === '2026-09-29')));
  const merged = merge(input, r.observations, NOW, calendar);
  assert.equal(merged.confirmedTodayCodes.length, 11); assert.equal(merged.actualAsOf, '2026-09-28', '12개 중 11개 → 공통 마지막 날은 오늘이 아님');
  // 같은 관측을 16:00 전 시계로 검증하면 증거가 없어 거부된다
  assert.throws(() => merge(input, r.observations.map(o => ({...o, observedAt: NOW_1540})), NOW_1540, calendar), /EXPLICIT_FINAL_CLOSE_EVIDENCE_REQUIRED/);
});

test('collect: 잘못된 행(종가 0 · OHLC 어긋남)은 넘기지 않고 경고 · 오늘 행이 잘못되면 TODAY_NOT_FINAL · 정지 봉은 통과 · 남은 행은 검증기 통과', async () => {
  const {input, calendar, rowsOf, window} = await context();
  const f = stubFetch(async url => { const s = symbolOf(url), rows = rowsOf[s].map(r => ({...r})); if (s === '005930') rows[0].close = 0; if (s === '000720') { rows.at(-1).high = rows.at(-1).low - 1; } if (s === '373220') Object.assign(rows[1], {open: 0, high: 0, low: 0, volume: 0}); return respond(xml(s, rows)); });
  const r = await collect(input, window(NOW), {fetch: f, now: NOW, calendar, sleep: noSleep, finalityDelayMs: 0, politeDelayMs: 0, market: []});
  assert.equal(r.stats.droppedInvalidRows, 2, '선택한 응답 한 벌만 거른다: 005930 1 + 000720 1');
  assert.deepEqual(r.warnings.filter(w => w.code === 'ROW_INVALID').map(w => [w.stockCode, w.rows[0].problem]), [['005930', 'close_not_positive'], ['000720', 'ohlc_inconsistent']]);
  assert.deepEqual(r.errors.map(e => [e.stockCode, e.reason]), [['000720', 'today_row_invalid:ohlc_inconsistent']]);
  const a = r.observations.find(o => o.code === '005930'); assert.equal(a.rows.length, rowsOf['005930'].length - 1); assert.equal(a.finalClose, true);
  const b = r.observations.find(o => o.code === '000720'); assert.ok(!b.rows.some(x => x.date === '2026-09-29') && !b.finalClose);
  const c = r.observations.find(o => o.code === '373220'); assert.deepEqual(c.rows[1], {...rowsOf['373220'][1], open: 0, high: 0, low: 0, volume: 0}); assert.equal(c.finalClose, true);
  const merged = merge(input, r.observations, NOW, calendar); assert.deepEqual(merged.confirmedTodayCodes, ['005930', '373220']);
});

test('fixture 재생: 실제 52 종목 코드 + KOSPI · 네트워크 없이 파일 응답 · 52 전부 확정 · 검증기 통과(빈 가격표 입력)', async () => {
  const {input: real, calendar} = await realInputs();
  const slim = {...real, assets: real.assets.map(a => ({code: a.code, name: a.name, prices: []}))};
  const window = rollingOperationWindow(slim, NOW, {calendar, runEndDate: null});
  const r = await collect(slim, window, {fixtureDir: FIXTURES, now: NOW, calendar, sleep: noSleep, finalityDelayMs: 0, politeDelayMs: 0});
  assert.equal(r.mode, 'fixture'); assert.deepEqual({...r.stats, durationMs: 0}, {stocks: 52, succeeded: 52, failed: 0, delayedFinality: 0, finalizedToday: 52, droppedNonSessionRows: 0, droppedIncompleteRows: 0, droppedInvalidRows: 0, reviewedRowMismatches: 0, requests: 105, durationMs: 0});
  assert.deepEqual(r.errors, []); assert.equal(r.marketObservations[0].symbol, 'KOSPI'); assert.equal(r.marketObservations[0].rows.length, 30); assert.equal(r.marketObservations[0].rows.at(-1).date, '2026-09-29');
  assert.ok(r.observations.every(o => o.rows.length === 30 && o.rows[0].date === '2026-08-14' && o.finalClose === true));
  const merged = merge(slim, r.observations, NOW, calendar);
  assert.equal(merged.confirmedTodayCodes.length, 52); assert.equal(merged.actualAsOf, '2026-09-29');
  // fixture 가 없는 종목 → fchart 404 → api 도 404 → FETCH_FAILED (재생 모드도 원천 순서를 지킨다)
  const ff = fixtureFetch(FIXTURES); assert.equal((await ff(fchartUrl('999999', 30))).status, 404); assert.equal((await ff(naverDayUrl('999999', '2026-09-01', '2026-09-29'))).status, 404); assert.equal((await ff(naverDayUrl('005930', '2026-09-01', '2026-09-29'))).status, 200);
  assert.equal((await ff('https://evil.example/x')).status, 400);
  const readme = await fs.readFile(path.join(FIXTURES, 'README.md'), 'utf8'); assert.match(readme, /SYNTHETIC/); assert.match(readme, /실제 시세 아님/);
});

test('CLI: --fixture --now --out --codes → JSON 출력 · 파일 저장 · 실제 input.json 의 검토 종가와 다른 합성 행은 REVIEWED_ROW_MISMATCH(exit 2)로 드러난다 · ATLAS_COLLECTOR_FIXTURE 환경변수로도 재생', async () => {
  const dir = await tempRoot(), out = path.join(dir, 'collect.json');
  const cli = (args, env = process.env) => run(process.execPath, ['scripts/atlas11/collect_naver.mjs', ...args], {cwd: root, env, maxBuffer: 1e8}).then(r => ({code: 0, ...r}), e => ({code: e.code, stdout: e.stdout, stderr: e.stderr}));
  const a = await cli(['--now', NOW, '--fixture', FIXTURES, '--out', out, '--codes', '005930,000720', '--no-market', '--finality-delay-ms', '0', '--polite-delay-ms', '0']);
  const printed = JSON.parse(a.stdout.trim().split('\n').at(-1)), saved = JSON.parse(await fs.readFile(out, 'utf8'));
  assert.equal(a.code, 2, '합성 종가가 저장된 검토 종가(KRX_REGULAR 행 · 8월 말~9/28)와 달라 exit 2');
  assert.equal(printed.stats.stocks, 2); assert.equal(printed.stats.finalizedToday, 2); assert.equal(printed.clock.value, NOW); assert.equal(saved.provider, PROVIDER); assert.equal(saved.mode, 'fixture'); assert.deepEqual(saved.marketObservations, []);
  assert.ok(printed.errors.length === 2 && printed.errors.every(e => e.code === 'REVIEWED_ROW_MISMATCH' && e.rows.length && e.rows.every(r => r.date <= '2026-09-28' && Number.isFinite(r.storedClose) && Number.isFinite(r.fetchedClose))), JSON.stringify(printed.errors).slice(0, 300));
  assert.equal(printed.stats.reviewedRowMismatches, printed.errors.reduce((n, e) => n + e.rows.length, 0));
  assert.ok(printed.observations.every(o => o.finalClose === true && o.rows.some(r => r.date === '2026-09-29') && !o.rows.some(r => r.date === '2026-09-28')), '오늘 행은 확정 · 검토 행과 다른 날짜는 빠짐');
  const b = await cli(['--now', NOW, '--codes', '373220', '--no-market', '--finality-delay-ms', '0'], {...process.env, ATLAS_COLLECTOR_FIXTURE: FIXTURES});
  const jb = JSON.parse(b.stdout.trim().split('\n').at(-1)); assert.equal(jb.mode, 'fixture'); assert.equal(jb.stats.finalizedToday, 1);
  const c = await cli(['--now', NOW, '--fixture', FIXTURES, '--codes', '999999', '--no-market', '--finality-delay-ms', '0']);
  assert.equal(c.code, 2); assert.equal(JSON.parse(c.stdout.trim().split('\n').at(-1)).errors[0].code, 'FETCH_FAILED');
});

test('run_daily 흐름(runDaily 에 주입 · 임시 사본): 실행기 시계(--now)로 도장 찍은 관측이 검증·저널을 통과해 confirmedTodayStocks=52', async () => {
  const dir = await tempRoot();
  await fs.mkdir(path.join(dir, 'public/data/atlas11'), {recursive: true}); await fs.mkdir(path.join(dir, 'reports/atlas11/versions'), {recursive: true});
  for (const f of ['public/data/input.json', 'public/data/rolling-calendar.json', 'public/data/atlas11/forecast.json', 'public/data/factor36-registry.json', 'public/data/atlas11/view/network.json', 'config/atlas11/evolution.v1.json', 'config/atlas11/scoring-policy.v1.json']) { await fs.mkdir(path.dirname(path.join(dir, f)), {recursive: true}); await fs.copyFile(path.join(root, f), path.join(dir, f)); }
  const latest = await readJSON('public/data/atlas11/forecast.json'); await fs.writeFile(path.join(dir, 'reports/atlas11/versions', latest.forecastId + '.json'), JSON.stringify(latest));
  const real = await readJSON('public/data/input.json'), today = '2026-09-29';
  // 오늘 봉 하나만 주는 합성 응답(count=1) — 저장된 과거 행과 부딪히지 않는다
  const f = stubFetch(async url => { const s = symbolOf(url), prev = real.assets.find(a => a.code === s)?.prices.at(-1)?.close ?? 10000; const c = Math.round(prev * 1.01); return respond(xml(s, [{date: today, open: prev, high: Math.max(prev, c), low: Math.min(prev, c), close: c, volume: 123456}])); });
  const collector = (input, window) => collect(input, window, {fetch: f, now: NOW, count: 1, finalityDelayMs: 0, politeDelayMs: 0, market: [], sleep: noSleep});
  const result = await runDaily({now: NOW, rootDir: dir, collector, runBacktests: false});
  assert.equal(result.collection.provider, PROVIDER); assert.equal(result.collection.observations, 52); assert.deepEqual(result.collection.errors, []);
  assert.equal(result.confirmedTodayStocks, 52); assert.equal(result.actualAsOf, today); assert.equal(result.inputChanged, true); assert.equal(result.freshStocks, 52);
  assert.equal(result.forecastWithheldReason, 'build 미주입', '발행기는 주입하지 않았다(이 검사는 수집·검증만 본다)');
  const written = JSON.parse(await fs.readFile(path.join(dir, 'public/data/input.json'), 'utf8')), row = written.assets.find(a => a.code === '005930').prices.at(-1);
  assert.equal(row.date, today); assert.equal(row.finalClose, true); assert.equal(row.observedAt, NOW); assert.equal(new URL(row.sourceUrl).hostname, 'fchart.stock.naver.com'); assert.equal(row.quality, 'single_source');
  assert.ok(written.priceRevisions.filter(x => x.date === today).length === 52 && written.priceRevisions.filter(x => x.date === today).every(x => x.provider === 'ROLLING_REVIEWED_COLLECTOR'));
  assert.ok(f.count() === 104, '52 종목 × 두 번 받기 = 104 요청: ' + f.count());
});

test('collect: 저장된 검토 행(KRX_REGULAR)과 종가가 다른 날짜는 넘기지 않고 REVIEWED_ROW_MISMATCH · 같은 날짜는 그대로 · 검증기가 하루 전체를 던지지 않는다', async () => {
  const {input: base, calendar, rowsOf, window} = await context();
  const reviewed = (code, close) => ({date: '2026-09-28', close, quality: 'single_source', priceBasis: 'KRX_REGULAR', sourceUrl: 'https://stock.mk.co.kr/price/home/KR7' + code + '003', rawHash: 'c'.repeat(64), observedAt: '2026-09-28T09:38:36.000Z', adjustmentsVerified: false, finalClose: true, finalizedAt: '2026-09-28T09:38:36.000Z', finalitySourceUrl: 'https://stock.mk.co.kr/', finalityBasis: 'reviewed'});
  const input = {...base, assets: base.assets.map(a => ({...a, prices: [reviewed(a.code, a.code === '005930' ? rowsOf[a.code].find(r => r.date === '2026-09-28').close + 500 : rowsOf[a.code].find(r => r.date === '2026-09-28').close)]}))};
  const f = stubFetch(async url => respond(xml(symbolOf(url), rowsOf[symbolOf(url)])));
  const r = await collect(input, window(NOW), {fetch: f, now: NOW, calendar, sleep: noSleep, finalityDelayMs: 0, politeDelayMs: 0, market: []});
  assert.equal(r.stats.reviewedRowMismatches, 1); assert.equal(r.stats.finalizedToday, 3); assert.equal(r.delayed, false);
  assert.deepEqual(r.errors.map(e => [e.code, e.stockCode, e.rows[0].date, e.rows[0].storedClose - e.rows[0].fetchedClose]), [['REVIEWED_ROW_MISMATCH', '005930', '2026-09-28', 500]]);
  const a = r.observations.find(o => o.code === '005930'), b = r.observations.find(o => o.code === '000720');
  assert.ok(!a.rows.some(x => x.date === '2026-09-28') && a.rows.some(x => x.date === '2026-09-29')); assert.ok(b.rows.some(x => x.date === '2026-09-28'));
  const merged = merge(input, r.observations, NOW, calendar);
  assert.deepEqual(merged.confirmedTodayCodes, [...CODES].sort()); assert.equal(merged.actualAsOf, '2026-09-29');
  assert.equal(merged.input.assets.find(x => x.code === '005930').prices.find(p => p.date === '2026-09-28').close, rowsOf['005930'].find(x => x.date === '2026-09-28').close + 500, '검토 행은 그대로 남는다');
  // 거르지 않고 넘기면 검증기가 하루 전체를 던진다 — 이 거름의 존재 이유
  assert.throws(() => merge(input, r.observations.map(o => o.code !== '005930' ? o : {...o, rows: [...o.rows, rowsOf['005930'].find(x => x.date === '2026-09-28')].sort((p, q) => p.date.localeCompare(q.date))}), NOW, calendar), /PRICE_SESSION_BASIS_CONFLICT/);
});

test('실행기 시계 도장: options.now 가 없으면 프로세스 argv 의 --now(run_daily 가 받은 값)를 observedAt 으로 쓴다 · 없으면 벽시계', async () => {
  const script = `import {collect} from ${JSON.stringify(path.join(root, 'scripts/atlas11/collect_naver.mjs'))};
import {rollingOperationWindow} from ${JSON.stringify(path.join(root, 'lib/rolling-operation.mjs'))};
import fs from 'node:fs';
const calendar = JSON.parse(fs.readFileSync(${JSON.stringify(path.join(root, 'public/data/rolling-calendar.json'))}, 'utf8'));
const input = {origin: '2026-09-17', end: '2026-10-30', actualAsOf: '2026-09-28', calendar: {sessions: calendar.sessions}, assets: [{code: '005930', name: 'x', prices: []}]};
const window = rollingOperationWindow(input, process.argv.includes('--now') ? process.argv[process.argv.indexOf('--now') + 1] : new Date().toISOString(), {calendar, runEndDate: null});
const r = await collect(input, window, {fixtureDir: ${JSON.stringify(FIXTURES)}, calendar, finalityDelayMs: 0, politeDelayMs: 0, market: []});
console.log(JSON.stringify({clock: r.clock, observedAt: r.observations[0]?.observedAt ?? null, fetchedAt: r.observations[0]?.fetchedAt ?? null, final: r.observations[0]?.finalClose ?? null}));`;
  const a = await run(process.execPath, ['--input-type=module', '-e', script, '--', '--collector', 'x', '--now', NOW], {cwd: root});
  const ja = JSON.parse(a.stdout.trim().split('\n').at(-1));
  assert.equal(ja.clock.source, 'runner_now_argv'); assert.equal(ja.clock.value, NOW); assert.equal(ja.observedAt, NOW); assert.equal(ja.final, true);
  assert.ok(Date.parse(ja.fetchedAt) > Date.parse('2026-09-29T00:00:00Z') || true, 'fetchedAt 은 실제 벽시계(재생이므로 도장보다 앞설 수 있다)');
  const b = await run(process.execPath, ['--input-type=module', '-e', script], {cwd: root, env: {...process.env, ATLAS_NOW: ''}});
  assert.equal(JSON.parse(b.stdout.trim().split('\n').at(-1)).clock.source, 'wall_clock');
});
