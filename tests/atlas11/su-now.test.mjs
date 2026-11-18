// 지금 시장(주문 1118-1239) — 받은 글 읽기 · 묶음 만들기 · 결측은 빈칸(0 으로 채우지 않음) · 장이 열려 있을 때 값은 굳지 않은 값
import {test} from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import {num, kstOf, parseIndexNow, parseIndexFlows, parseStockNow, openAt, NOW_URLS, SU_NOW_SCHEMA} from '../../lib/atlas11/su-now.mjs';
import {collectNow, writeNow} from '../../scripts/atlas11/next/su_now.mjs';

const IDX = (d, p, c, r) => JSON.stringify([{localTradedAt: d, closePrice: p, compareToPreviousClosePrice: c, fluctuationsRatio: r, openPrice: '1', highPrice: '1', lowPrice: '1'}, {localTradedAt: '2026-11-17', closePrice: '4,968.48'}]);
const FLOW = (d, f, o, p) => JSON.stringify({dealTrendInfos: [{bizdate: d.replaceAll('-', ''), personalValue: p, foreignValue: f, institutionalValue: o}, {bizdate: '20261117', personalValue: '+1', foreignValue: '-1', institutionalValue: '0'}]});
const STK = (d, p) => JSON.stringify([{localTradedAt: d, closePrice: p}]);

test('숫자 읽기 · 한국 시각', () => {
  assert.equal(num('4,968.48'), 4968.48); assert.equal(num('-132.02'), -132.02); assert.equal(num('+1,234'), 1234); assert.equal(num('-3,210억'), -3210);
  assert.equal(num(''), null); assert.equal(num('-'), null); assert.equal(num(null), null); assert.equal(num('N/A'), null);
  assert.deepEqual(kstOf('2026-11-18T01:03:00Z'), {day: '2026-11-18', hm: '10:03', wd: 3});
  assert.deepEqual(kstOf('2026-11-18T15:30:00Z'), {day: '2026-11-19', hm: '00:30', wd: 4});
  assert.ok(openAt(kstOf('2026-11-18T01:03:00Z'), true) && !openAt(kstOf('2026-11-18T09:00:00Z'), true) && !openAt(kstOf('2026-11-18T01:03:00Z'), false) && !openAt(kstOf('2026-11-21T01:03:00Z'), true));
});

test('지수 · 사고판 돈 · 회사 값 읽기', () => {
  assert.deepEqual(parseIndexNow(IDX('2026-11-18', '5,012.30', '43.82', '0.88'), '2026-11-18'), {date: '2026-11-18', price: 5012.3, change: 43.82, ratio: 0.88, today: true});
  assert.equal(parseIndexNow(IDX('2026-11-17', '4,968.48', '-132.02', '-2.59'), '2026-11-18').today, false);
  assert.equal(parseIndexNow('[]', '2026-11-18'), null); assert.equal(parseIndexNow(JSON.stringify([{localTradedAt: '2026-11-18', closePrice: '-'}]), '2026-11-18'), null);
  const f = parseIndexFlows(FLOW('2026-11-18', '-3,210', '+1,020', '+2,190'), '2026-11-18');
  assert.deepEqual([f.date, f.today, f.foreign, f.inst, f.indiv, f.unit], ['2026-11-18', true, -3210, 1020, 2190, '억원']);
  assert.equal(parseIndexFlows(JSON.stringify({dealTrendInfos: [{bizdate: '20261118', foreignerPureBuyValue: '-77'}]}), '2026-11-18').foreign, -77); // 이름이 바뀌어도 앞글자로
  assert.equal(parseIndexFlows(JSON.stringify({totalInfos: []}), '2026-11-18').error, 'NO_DEAL_TREND');
  // 진짜 응답(2026-11-18 14:21 · 지수 요약) — dealTrendInfo 한 줄(여러 날 아님) · 날이 없으면 지수가 그날일 때만 그날 · 한 겹 안쪽 값도 읽음
  const one = parseIndexFlows(JSON.stringify({stockEndType: 'index', dealTrendInfo: {personalValue: '-1,520', foreignValue: '+2,345', institutionalValue: '-810'}}), '2026-11-18', true);
  assert.deepEqual([one.date, one.today, one.foreign, one.inst, one.indiv], ['2026-11-18', true, 2345, -810, -1520]);
  assert.equal(parseIndexFlows(JSON.stringify({dealTrendInfo: {foreignValue: '+2,345'}}), '2026-11-18', false).error, 'FLOWS_SHAPE'); // 날도 없고 지수도 그날이 아니면 쓰지 않음
  const nest = parseIndexFlows(JSON.stringify({dealTrendInfo: {bizdate: '20261118', foreigner: {value: '-99'}, personal: {value: '+50'}, institutional: {value: '+49'}}}), '2026-11-18');
  assert.deepEqual([nest.foreign, nest.indiv, nest.inst], [-99, 50, 49]);
  assert.ok(parseIndexFlows(JSON.stringify({dealTrendInfo: {bizdate: '20261118', other: '1'}}), '2026-11-18').sample.includes('other'));
  assert.equal(parseIndexFlows(JSON.stringify({dealTrendInfos: [{bizdate: '20261118', foo: '1'}]}), '2026-11-18').error, 'FLOWS_SHAPE');
  assert.equal(parseIndexFlows(FLOW('2026-11-18', '-3,210,000', '0', '0'), '2026-11-18').error, 'FLOWS_UNIT'); // 단위가 다른 듯하면 쓰지 않음
  assert.equal(parseStockNow(STK('2026-11-18', '275,500'), '2026-11-18'), 275500); assert.equal(parseStockNow(STK('2026-11-17', '275,500'), '2026-11-18'), null);
});

test('묶음 만들기 — 받지 못한 회사는 빈칸 · 적은 파일은 덮어쓰지 않음', async () => {
  const root = await fs.mkdtemp(path.join(os.tmpdir(), 'su-now-'));
  await fs.mkdir(path.join(root, 'public/data/atlas11/view'), {recursive: true});
  await fs.writeFile(path.join(root, 'public/data/atlas11/view/board.json'), JSON.stringify({asOf: '2026-11-17', companies: [{code: '005930'}, {code: '000660'}, {code: '035420'}]}));
  const R = {[NOW_URLS.index('KOSPI')]: IDX('2026-11-18', '5,012.30', '43.82', '0.88'), [NOW_URLS.index('KOSDAQ')]: IDX('2026-11-18', '655.10', '5.04', '0.78'),
    [NOW_URLS.flows('KOSPI')]: FLOW('2026-11-18', '-3,210', '+1,020', '+2,190'), [NOW_URLS.stock('005930')]: STK('2026-11-18', '275,500'), [NOW_URLS.stock('000660')]: STK('2026-11-18', '500,000')};
  const fetcher = {get: async url => (R[url] ? {ok: true, url, text: R[url]} : {ok: false, url, error: 'FETCH_FAILED'})};
  const out = await collectNow({now: '2026-11-18T01:03:00Z', rootDir: root, fetcher});
  assert.equal(out.schema, SU_NOW_SCHEMA); assert.equal(out.day, '2026-11-18'); assert.equal(out.hm, '10:03'); assert.equal(out.open, true);
  assert.equal(out.index.KOSPI.price, 5012.3); assert.equal(out.flows.KOSPI.foreign, -3210); assert.equal(out.flows.KOSDAQ, null);
  assert.deepEqual(out.prices.p, {'000660': 500000, '005930': 275500}); assert.equal(out.prices.n, 2); assert.equal(out.prices.of, 3); assert.equal(out.prices.board, '2026-11-17');
  assert.ok(out.errors.some(e => e.kind === 'flows' && e.key === 'KOSDAQ') && out.errors.some(e => e.kind === 'prices' && e.error === 'FEW_PRICES'));
  const w = await writeNow(out, root); assert.equal(w.file, 'reports/atlas11/su-now/2026-11-18/1003.json');
  assert.equal(JSON.parse(await fs.readFile(path.join(root, 'reports/atlas11/su-now/latest.json'), 'utf8')).hm, '10:03');
  assert.equal((await writeNow({...out, open: false}, root)).skipped, 'EXISTS');
  const after = await collectNow({now: '2026-11-18T09:05:00Z', rootDir: root, fetcher}); assert.equal(after.open, false); assert.equal(after.hm, '18:05');
});
