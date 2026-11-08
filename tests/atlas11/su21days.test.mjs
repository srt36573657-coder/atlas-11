// 수르 42칸 며칠째 · 첫 발견 · 포모지수(주문 0123 · 사장님 2026-11-09 01:44 · 02:01 · 02:02 · 02:04 「어」) — 셈 시험
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import zlib from 'node:zlib';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {calendarOf, runOf, keepDay, annotate, KEYS} from '../../scripts/atlas11/next/su21_days.mjs';
import {rngOf, featuresAt, fomoOf, FOMO_MC, CHECKS, FEATS} from '../../scripts/atlas11/next/su21_fomo.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const L = (o = {}) => Object.fromEntries(KEYS.map(k => [k, o[k] ?? []]));
const rec = {days: {
  '2026-10-29': {how: 'replay', lists: L({hot: ['A'], money: ['B']})},
  '2026-10-30': {how: 'replay', lists: L({hot: ['A', 'C'], money: ['B']})},
  // 11-02 판 없음(장은 열림)
  '2026-11-03': {how: 'replay', lists: L({hot: ['A', 'C'], money: []})},
  '2026-11-04': {how: 'kept', lists: L({hot: ['A', 'C', 'D'], money: ['B']})}}};
const trade = ['2026-10-28', '2026-10-29', '2026-10-30', '2026-11-02', '2026-11-03', '2026-11-04', '2026-11-05'];

test('장이 열린 날 — 자료 날짜 + 기록한 날 + 오늘 · 오늘 뒤는 뺌', () => {
  assert.deepEqual(calendarOf(trade, rec, '2026-11-05'), trade);
  assert.deepEqual(calendarOf(['2026-11-04'], rec, '2026-11-06'), ['2026-10-29', '2026-10-30', '2026-11-03', '2026-11-04', '2026-11-06']);
});
test('며칠째 · 첫 발견 — 이어진 날 수 · 판이 빠진 날은 앞뒤에 모두 있으면 이어짐 · 기록 첫날까지면 since', () => {
  const cal = calendarOf(trade, rec, '2026-11-05');
  assert.deepEqual(runOf(rec, cal, '2026-11-05', 'hot', 'A'), {days: 6, found: '2026-10-29', since: true}); // 10-29 · 30 · 11-02(이어짐) · 03 · 04 · 05(오늘)
  assert.deepEqual(runOf(rec, cal, '2026-11-05', 'hot', 'C'), {days: 5, found: '2026-10-30', since: false});
  assert.deepEqual(runOf(rec, cal, '2026-11-05', 'hot', 'D'), {days: 2, found: '2026-11-04', since: false});
  assert.deepEqual(runOf(rec, cal, '2026-11-05', 'money', 'B'), {days: 2, found: '2026-11-04', since: false}); // 11-03 에 빠짐
  assert.deepEqual(runOf(rec, cal, '2026-11-05', 'hot', 'Z'), {days: 1, found: '2026-11-05', since: false}); // 오늘 처음
  assert.deepEqual(runOf({days: {'2026-11-05': {lists: L()}}}, ['2026-11-05'], '2026-11-05', 'hot', 'Q'), {days: 1, found: '2026-11-05', since: true});
});
test('기록 — 그날 목록을 한 번만 적음(먼저 적은 것을 바꾸지 않음) · 칸마다 며칠째를 더함', () => {
  const r = JSON.parse(JSON.stringify(rec));
  const su = {asOf: {board: '2026-11-05', data: '2026-11-05'}, lists: L({hot: [{code: 'A'}, {code: 'C'}], money: [{code: 'B'}]})};
  assert.equal(keepDay(r, su, null, 'x'), true);
  assert.equal(r.days['2026-11-05'].how, 'kept');
  assert.deepEqual(r.days['2026-11-05'].lists.hot, ['A', 'C']);
  assert.equal(keepDay(r, {...su, lists: L({hot: [{code: 'Z'}]})}, null, 'y'), false, '같은 날은 다시 적지 않음');
  assert.deepEqual(r.days['2026-11-05'].lists.hot, ['A', 'C']);
  annotate(r, calendarOf(trade, r, '2026-11-05'), su, null);
  assert.equal(su.lists.hot[0].days, 6); assert.equal(su.lists.hot[0].found, '2026-10-29');
  assert.equal(su.lists.money[0].days, 2);
  assert.equal(su.days.from, '2026-10-29'); assert.equal(su.days.to, '2026-11-05');
});
test('지난 판 — 날마다 마지막 판을 옮겨 둔 파일(셈에 쓰는 칸) · 날짜 = 파일 이름', () => {
  const dir = path.join(ROOT, 'reports/atlas11/su21/boards'), fs0 = fs.readdirSync(dir).filter(f => f.endsWith('.json.gz')).sort();
  assert.ok(fs0.length >= 20, '판 ' + fs0.length + '날');
  for (const f of [fs0[0], fs0.at(-1)]) {
    const b = JSON.parse(zlib.gunzipSync(fs.readFileSync(path.join(dir, f))).toString('utf8'));
    assert.equal(b.asOf + '.json.gz', f);
    assert.ok(Array.isArray(b.companies) && b.companies.length >= 300 && Array.isArray(b.hot?.items) && Array.isArray(b.groups));
    assert.ok(b.companies.every(c => typeof c.code === 'string' && c.group?.label));
  }
});

/* ── 포모지수 ── */
const series = (n, f) => { const a = new Float64Array(n); let p = 10000; for (let t = 0; t < n; t++) { p *= Math.exp(f(t)); a[t] = Math.round(p); } return a; };
const dates = n => Array.from({length: n}, (_, t) => new Date(Date.UTC(2025, 0, 1) + t * 86400e3).toISOString().slice(0, 10));
test('난수 — 같은 씨앗은 같은 줄 · 다른 씨앗은 다른 줄 · 0 ~ 1', () => {
  const a = rngOf('x'), b = rngOf('x'), c = rngOf('y'), xs = Array.from({length: 1000}, () => a());
  assert.deepEqual(xs.slice(0, 5), Array.from({length: 5}, () => b()));
  assert.notEqual(xs[0], c());
  assert.ok(xs.every(v => v >= 0 && v < 1));
  const m = xs.reduce((p, q) => p + q, 0) / xs.length; assert.ok(m > 0.45 && m < 0.55, '평균 ' + m);
});
test('잣대 여섯 — lib/fomo.mjs rawAt 종가 갈래와 같은 셈', () => {
  const C = new Float64Array([100, 101, 102, 101, 103, 104, 103, 105, 106, 105, 107, 108, 107, 109, 110, 109, 111, 112, 111, 113, 114, ...Array(60).fill(0).map((_, j) => 114 + j % 3)]);
  const i = 20, o = featuresAt(C, i), r = []; for (let t = i - 9; t <= i; t++) r.push(Math.log(C[t] / C[t - 1]));
  assert.ok(Math.abs(o.return10 - Math.log(C[20] / C[10])) < 1e-12);
  assert.equal(o.upDays, r.filter(x => x > 0).length / 10);
  assert.ok(Math.abs(o.maGap - (C[20] / (Array.from(C.slice(1, 21)).reduce((p, q) => p + q, 0) / 20) - 1)) < 1e-12);
  assert.equal(o.breakout, null, '예순 날이 모자라면 null');
  const o2 = featuresAt(C, 75); assert.ok(Number.isFinite(o2.breakout));
});
test('포모 — 몬테카를로 → 소거 기준 일곱 · 같은 씨앗 같은 값 · 뜨거운 열흘은 높고 식은 열흘은 낮음', () => {
  const n = 400, d = dates(n), wig = t => 0.01 * Math.sin(t * 1.7) + 0.004 * Math.cos(t * 0.9);
  const hot = series(n, t => (t >= n - 10 ? 0.03 : wig(t))), cold = series(n, t => (t >= n - 10 ? -0.03 : wig(t)));
  const a = fomoOf(hot, n - 1, d, {seed: 's', paths: 20000}), b = fomoOf(hot, n - 1, d, {seed: 's', paths: 20000}), c = fomoOf(cold, n - 1, d, {seed: 's', paths: 20000});
  assert.equal(a.checks.length, 7); assert.deepEqual(a.checks.map(x => x.id), CHECKS.map(x => x.id));
  assert.equal(a.verdict, 'pass'); assert.deepEqual(a, b, '같은 씨앗 같은 값');
  assert.ok(a.v >= 80, '뜨거움 ' + a.v); assert.ok(c.v <= 20, '식음 ' + c.v);
  assert.ok(a.se <= FOMO_MC.maxSe); assert.equal(a.f.length, FEATS.length);
  assert.ok(Math.abs(a.f.filter(f => f.g === 'trend').reduce((p, q) => p + q.w, 0) - 1) < 1e-3, '묶음 무게 합 1');
});
test('포모 소거 — 주식 나눔 흔적 · 모자란 지난 날 · 옛 값은 값을 보이지 않음', () => {
  const n = 400, d = dates(n), wig = t => 0.01 * Math.sin(t * 1.3);
  const split = series(n, t => (t === 300 ? Math.log(0.5) : wig(t)));
  const x = fomoOf(split, n - 1, d, {seed: 's', paths: 5000});
  assert.equal(x.verdict, 'out'); assert.equal(x.first, 'ca'); assert.equal(x.v, null);
  const short = series(n, wig); for (let t = 0; t < 250; t++) short[t] = 0;
  const y = fomoOf(short, n - 1, d, {seed: 's', paths: 5000});
  assert.equal(y.verdict, 'hold'); assert.equal(y.first, 'history');
  const z = fomoOf(series(n, wig), n - 1, d, {seed: 's', lag: 9, paths: 5000});
  assert.equal(z.first, 'fresh'); assert.equal(z.v, null);
});
