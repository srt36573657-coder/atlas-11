// 고도리 칸 분기 결산 받기 quarter.mjs 시험(망 없이 · 견본만)
//   node --test tests/atlas11/gdr-quarter.test.mjs
//   견본 = tests/atlas11/fixtures/quarter/*(형식 견본 · 실제 네이버 응답이 아님 · 숫자는 꾸민 값)
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {parseQuarterJson, parseCopQuarterHtml, usableAt, mergeRows, collectQuarters, toText, num, KEEP, SCHEMA, API_URL, HTML_URL} from '../../scripts/atlas11/next/gdr/quarter.mjs';
import {decodeKr} from '../../scripts/atlas11/next/gdr/kind.mjs';
import {normQuarters} from '../../scripts/atlas11/next/gdr/v2/data.mjs';

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), '../..');
const FX = path.join(ROOT, 'tests/atlas11/fixtures/quarter'), fx = f => fs.readFileSync(path.join(FX, f));
const WANT = [{key: '202506', sales: 1000, op: 100, net: 80}, {key: '202509', sales: 1100, op: -20, net: -35}, {key: '202512', sales: 1250, op: 130, net: 101},
  {key: '202603', sales: 1180, op: 125, net: 99}, {key: '202606', sales: 1300, op: null, net: 120}];

test('API 꼴: 확정 칸만(예상 202609 뺌) · 「-」 = null · 쉼표 · 음수 · key 차례', () => {
  assert.deepEqual(parseQuarterJson(fx('m-stock-quarter-sample.json').toString('utf8')), WANT);
  const j = JSON.parse(fx('m-stock-quarter-sample.json')); j.financePeriodType = 'annual';
  assert.throws(() => parseQuarterJson(j), /QUARTER_NOT_QUARTER/);
  assert.throws(() => parseQuarterJson('<html>'), /QUARTER_JSON_INVALID/);
  assert.throws(() => parseQuarterJson({financeInfo: {}}), /QUARTER_JSON_SHAPE/);
  const j2 = JSON.parse(fx('m-stock-quarter-sample.json')); for (const t of j2.financeInfo.trTitleList) t.isConsensus = 'Y';
  assert.deepEqual(parseQuarterJson(j2), []); // 모두 예상 칸이면 담지 않음
  assert.equal(num('-'), null); assert.equal(num('1,234'), 1234); assert.equal(num('-12.5%'), -12.5); assert.equal(num(''), null);
});

test('쪽 꼴(EUC-KR 「기업실적분석」): 연간 칸 건너뛰고 분기 칸만 · (E) 칸 뺌 · API 와 같은 줄', () => {
  assert.deepEqual(parseCopQuarterHtml(decodeKr(fx('main-cop-analysis-euckr.html'))), WANT);
  assert.throws(() => parseCopQuarterHtml('<html></html>'), /COP_ANALYSIS_ABSENT/);
});

test('쓸 수 있는 첫날 usableAt — 결정표(끝 달 + 3 달째 1일) · 결산 달 분기 + 4 · 법정 마감 뒤', () => {
  assert.equal(usableAt('202606'), '2026-09-01'); assert.equal(usableAt('202512'), '2026-03-01'); assert.equal(usableAt('202609'), '2026-12-01');
  assert.equal(usableAt('202512', {fyEnd: 12}), '2026-04-01'); assert.equal(usableAt('202603', {fyEnd: 3}), '2026-07-01'); assert.equal(usableAt('202606', {fyEnd: 12}), '2026-09-01');
  assert.equal(usableAt('2025.12.'), '2026-03-01'); assert.equal(usableAt('bad'), null); assert.equal(usableAt('202513'), null);
  const end = (y, m) => Date.UTC(y, m, 0), days = (a, b) => (Date.parse(a) - b) / 864e5; // m 달 끝날
  for (let y = 2023; y <= 2027; y++) for (let m = 1; m <= 12; m++) {
    const key = `${y}${String(m).padStart(2, '0')}`;
    assert.ok(days(usableAt(key), end(y, m)) >= 60, `${key} 분기 · 반기보고서 45일(예외 60일) 뒤`); // 가장 짧은 때 = 1월 끝 → 4월 1일 60일
    assert.ok(days(usableAt(key, {fyEnd: m}), end(y, m)) >= 90, `${key} 사업보고서 90일 뒤`); // 1월 결산(국내에 거의 없음)만 꼭 90일째 · 12 · 3 · 6 · 9월 결산은 91 ~ 93일
  }
});

test('합치기: 앞 파일에만 있는 분기는 남김 · 겹친 분기는 새 값 · 16분기까지', () => {
  const prev = [{key: '202503', sales: 900, op: 90, net: 70}, {key: '202506', sales: 999, op: 99, net: 79}];
  assert.deepEqual(mergeRows(prev, WANT), [prev[0], ...WANT]);
  const many = Array.from({length: 20}, (_, i) => ({key: String(202000 + Math.floor(i / 4) * 100 + (i % 4) * 3 + 3), sales: i, op: i, net: i}));
  const m = mergeRows(many, []); assert.equal(m.length, KEEP); assert.equal(m[0].key, many[4].key);
});

const fakeFetch = (routes, seen) => async url => {
  seen.push(url);
  const v = routes[url]; if (v === undefined) return new Response('없음', {status: 404});
  if (v === 'throw') throw new Error('ECONNRESET'); if (typeof v === 'number') return new Response('x', {status: v});
  if (typeof v === 'object') return new Response(JSON.stringify(v), {status: 200, headers: {'content-type': 'application/json'}});
  return new Response(fx(v), {status: 200, headers: {'content-type': v.endsWith('.json') ? 'application/json;charset=UTF-8' : 'text/html'}});
};

test('모아 받기: API · 안 되면 쪽 · 둘 다 안 되면 앞 값(없으면 null) · 받은 지 6일 안은 다시 안 받음 · DART 안 부름 · normQuarters 가 읽음', async () => {
  const seen = [], now = new Date('2026-10-18T11:30:00Z');
  const prev = {schema: SCHEMA, co: {'900003': [{key: '202503', sales: 1, op: 1, net: 1}], '900005': [{key: '202606', sales: 5, op: 5, net: 5}], '900006': null},
    got: {'900003': '2026-10-01', '900005': '2026-10-16', '900006': '2026-10-17'}};
  const res = await collectQuarters({codes: ['900001', '900002', '900003', '900004', '900005', '900006'], prev, now, pauseMs: 0, backoffMs: [0, 0], concurrency: 2,
    fetch: fakeFetch({[API_URL('900001')]: 'm-stock-quarter-sample.json', [API_URL('900002')]: 500, [HTML_URL('900002')]: 'main-cop-analysis-euckr.html',
      [API_URL('900003')]: 'throw', [HTML_URL('900003')]: 'throw', [API_URL('900006')]: 'm-stock-quarter-sample.json'}, seen)});
  assert.equal(res.schema, SCHEMA); assert.equal(res.asOf, '2026-10-18'); assert.equal(res.fetchedAt, now.toISOString());
  assert.deepEqual(res.co['900001'], WANT); assert.deepEqual(res.co['900002'], WANT); assert.deepEqual(res.co['900006'], WANT);
  assert.deepEqual(res.co['900003'], prev.co['900003']); assert.equal(res.co['900004'], null); assert.deepEqual(res.co['900005'], prev.co['900005']);
  assert.deepEqual(res.failed, ['900003', '900004']); assert.deepEqual(res.skipped, []);
  assert.deepEqual(res.got, {'900001': '2026-10-18', '900002': '2026-10-18', '900003': '2026-10-01', '900005': '2026-10-16', '900006': '2026-10-18'});
  assert.ok(!seen.some(u => u.includes('900005')), '받은 지 6일 안 = 다시 안 받음');
  assert.ok(seen.every(u => !/dart/i.test(u)));
  assert.deepEqual(res.source.via, {api: 2, html: 1});
  const back = JSON.parse(toText(res)); assert.deepEqual(back, JSON.parse(JSON.stringify(res)));
  assert.equal(toText(res).split('\n').length, 6 + 3); // 한 줄에 한 회사
  const Q = normQuarters(back);
  assert.deepEqual([...Q.keys()].sort(), ['900001', '900002', '900003', '900005', '900006']); // null 은 건너뜀
  assert.deepEqual(Q.get('900001').map(r => [r.key, r.from, r.sales, r.op, r.net]), WANT.map(r => [r.key, usableAt(r.key), r.sales, r.op, r.net]));
});

test('시간이 모자라면 못 간 회사는 앞 값 그대로 + skipped · --all 은 6일 안도 다시 · API 분기가 다섯이 안 되면 쪽 표도 받아 합침', async () => {
  const seen = [], prev = {schema: SCHEMA, co: {'900005': [{key: '202606', sales: 5, op: 5, net: 5}]}, got: {'900005': '2026-10-16'}};
  const r1 = await collectQuarters({codes: ['900005', '900007'], prev, now: new Date('2026-10-18T11:30:00Z'), budgetMs: -1, pauseMs: 0, backoffMs: [0, 0], fetch: fakeFetch({}, seen)});
  assert.deepEqual(r1.skipped, ['900007']); assert.equal(r1.co['900007'], null); assert.deepEqual(seen, []);
  const r2 = await collectQuarters({codes: ['900005'], prev, all: true, now: new Date('2026-10-18T11:30:00Z'), pauseMs: 0, backoffMs: [0, 0], fetch: fakeFetch({[API_URL('900005')]: 'm-stock-quarter-sample.json'}, seen)});
  assert.deepEqual(r2.co['900005'], WANT); assert.deepEqual(seen, [API_URL('900005'), HTML_URL('900005')]); // 202606 영업이익 「-」 → 다 있는 분기 넷 → 쪽 표도(404)
  const short = JSON.parse(fx('m-stock-quarter-sample.json')); short.financeInfo.trTitleList = short.financeInfo.trTitleList.slice(2); // API 가 확정 셋만 줌
  for (const r of short.financeInfo.rowList) r.columns['202603'] = {value: '9,999'}; // 겹친 분기는 API 값이 이김
  const seen3 = [];
  const r3 = await collectQuarters({codes: ['900008'], now: new Date('2026-10-18T11:30:00Z'), pauseMs: 0, backoffMs: [0, 0],
    fetch: fakeFetch({[API_URL('900008')]: short, [HTML_URL('900008')]: 'main-cop-analysis-euckr.html'}, seen3)});
  assert.deepEqual(r3.co['900008'].map(r => r.key), ['202506', '202509', '202512', '202603', '202606']);
  assert.equal(r3.co['900008'][3].sales, 9999); assert.equal(r3.co['900008'][0].sales, 1000); // 202506 은 쪽 표에서
  assert.deepEqual(r3.source.via, {api: 1, html: 1});
});
