import test from 'node:test';
import assert from 'node:assert/strict';
import {pageThrough, parseFlowsWithVolume, backfillFlows, backfillSeries, BACKFILL_URLS, dayBefore, safeName} from '../../lib/atlas11/backfill.mjs';
import {MACRO_SERIES} from '../../lib/atlas11/context.mjs';

// 가짜 네이버 수급: 최근 → 과거 순서로 날짜를 내준다 (평일만)
const days = []; for (let d = new Date('2026-09-30T00:00:00Z'); days.length < 300; d = new Date(d - 86400000)) if (![0, 6].includes(d.getUTCDay())) days.push(d.toISOString().slice(0, 10));
const flowRow = (code, date) => ({itemCode: code, bizdate: date.replaceAll('-', ''), foreignerPureBuyQuant: '+1,000', organPureBuyQuant: '-500', individualPureBuyQuant: '-500', foreignerHoldRatio: '46.48%', closePrice: '1,000', accumulatedTradingVolume: '10,000'});
const ok = text => ({ok: true, text, fetchedAt: '2026-10-02T06:00:00Z'});

test('수급 해석: 거래량까지 · 종목 번호가 다르면 멈춤 · 숫자 아닌 칸은 null', () => {
  const rows = parseFlowsWithVolume(JSON.stringify([flowRow('005930', '2026-09-29'), {...flowRow('005930', '2026-09-28'), accumulatedTradingVolume: '-'}]), '005930');
  assert.deepEqual(rows.map(r => [r.date, r.foreignNet, r.volume]), [['2026-09-28', 1000, null], ['2026-09-29', 1000, 10000]]);
  assert.throws(() => parseFlowsWithVolume(JSON.stringify([flowRow('000660', '2026-09-29')]), '005930'), /CODE_MISMATCH/);
});

test('페이지 번호가 먹으면 from 보다 오래된 날짜가 나올 때까지 넘긴다', async () => {
  const get = async url => { const u = new URL(url), p = +u.searchParams.get('page'), n = +u.searchParams.get('pageSize'); return ok(JSON.stringify(days.slice((p - 1) * n, p * n).map(d => flowRow('005930', d)))); };
  const r = await backfillFlows(get, '005930', {from: '2026-03-02', pageSize: 60});
  assert.equal(r.mode, 'page'); assert.equal(r.stop, 'reached_from');
  assert.equal(r.rows[0].date, '2026-03-02'); assert.equal(r.rows.at(-1).date, '2026-09-30');
  assert.ok(r.rows.every((x, i) => !i || x.date > r.rows[i - 1].date));
});

test('페이지 번호를 무시하면(둘째 쪽이 첫 쪽과 같음) 날짜 커서로 바꿔 계속한다', async () => {
  const get = async url => { const u = new URL(url), n = +u.searchParams.get('pageSize'), c = u.searchParams.get('bizdate'); const start = c ? days.findIndex(d => d.replaceAll('-', '') <= c) : 0; return ok(JSON.stringify(days.slice(start, start + n).map(d => flowRow('005930', d)))); };
  const r = await backfillFlows(get, '005930', {from: '2026-01-05', pageSize: 40});
  assert.equal(r.mode, 'cursor'); assert.equal(r.stop, 'reached_from');
  assert.equal(r.rows[0].date, '2026-01-05');
  assert.equal(new Set(r.rows.map(x => x.date)).size, r.rows.length);
  assert.ok(r.pages[2].url.includes('bizdate='));
});

test('새 날짜가 없으면 멈추고, 실패는 실패로 남긴다(0 으로 채우지 않음)', async () => {
  const same = async () => ok(JSON.stringify(days.slice(0, 5).map(d => flowRow('005930', d))));
  const r = await pageThrough({get: same, urlFor: p => 'https://x.example/?page=' + p, parse: t => parseFlowsWithVolume(t, '005930'), from: '2020-01-01'});
  assert.equal(r.stop, 'no_new_rows'); assert.equal(r.rows.length, 5);
  const fail = await pageThrough({get: async () => ({ok: false, error: 'FETCH_FAILED', attempts: [1, 2]}), urlFor: p => 'https://x.example/?page=' + p, parse: JSON.parse});
  assert.equal(fail.stop, 'fetch_failed'); assert.deepEqual(fail.rows, []);
});

test('FRED 는 한 번에 전체 · 네이버 시장지표 주소는 페이지만 바꾼다', async () => {
  const s = MACRO_SERIES.find(x => x.id === 'DCOILWTICO');
  const r = await backfillSeries(async () => ok('observation_date,DCOILWTICO\n2023-01-02,.\n2023-01-03,76.9\n2026-09-29,96.16\n'), s, {from: '2023-01-01'});
  assert.equal(r.stop, 'complete_csv'); assert.deepEqual(r.rows, [{date: '2023-01-03', value: 76.9}, {date: '2026-09-29', value: 96.16}]);
  const bond = MACRO_SERIES.find(x => x.id === 'KR3YT=RR');
  assert.equal(BACKFILL_URLS.naverPage(bond, 3, 60), 'https://api.stock.naver.com/marketindex/bond/KR3YT=RR/prices?page=3&pageSize=60');
  assert.equal(BACKFILL_URLS.fred(s, '2023-01-01'), 'https://fred.stlouisfed.org/graph/fredgraph.csv?id=DCOILWTICO&cosd=2023-01-01');
  assert.equal(dayBefore('2026-03-01'), '2026-02-28'); assert.equal(safeName('KR3YT=RR'), 'KR3YT_RR'); assert.equal(safeName('.SOX'), '_SOX');
});
