// 고도리 지난 성적 bt-v1 시험(scripts/atlas11/next/gdr/backtest.mjs · 일꾼 G2b)
//   ① 한 날 오름(같은 돈 · 규칙 비중 · 현금 · 「?」) 손 셈 ② 요약(이긴 날 · 차이 가운데 · 가장 나쁜 날) 다시 세기 ③ 셀 수 있는 창 · 띄어 센 것
//   ④ 그날 것만 모음(뒤 줄 자름 · 못 쓰던 결산 칸 바꿈) ⑤ 가짜 고르는 셈으로 끝까지(부른 수 = 고른 날 수 · 그날 것만 다름 0 · 파일 꼴)
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import zlib from 'node:zlib';
import {execFileSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
import {loadBaseline} from '../../scripts/atlas11/next/gdr/baseline.mjs';
import {dayReturn, summarize, evaluate, pitBundle, normSel, sameSel, evaluable} from '../../scripts/atlas11/next/gdr/backtest.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const near = (a, b, msg) => assert.ok(a !== null && b !== null && Math.abs(a - b) < 1e-12, `${msg}: ${a} != ${b}`);
const D = ['20240102', '20240103', '20240104', '20240105', '20240108', '20240109', '20240110', '20240111'];
const row = (d, c, v = 1000) => [d, c, c, c, c, v];
const rows = (closes, vols = []) => closes.map((c, i) => row(D[i], c, vols[i] ?? 1000));
const st = (code, rs) => [code, {list: {code, name: 'N' + code, market: 'KOSPI', endType: 'stock'}, fchart: {rows: rs}}];
const fixture = () => ({stocks: Object.fromEntries([
  st('000010', rows([100, 110, 121, 100, 90, 95, 99, 120])),
  st('000020', rows([200, 210, 220, 220, 220, 230, 240, 250], [1, 1, 1, 0, 0, 1, 1, 1])),
  st('000040', rows([300, 310, 320, 330, 340, 350, 350, 350], [1, 1, 1, 1, 1, 1, 0, 0])),
  st('000060', rows([40, 40, 44, 48, 50, 52, 54, 56], [0, 0, 1, 1, 1, 1, 1, 1])),
])});
const KOSPI = D.map((d, i) => [`${d.slice(0, 4)}-${d.slice(4, 6)}-${d.slice(6)}`, [1000, 1010, 990, 1000, 1050, 1020, 1000, 980][i]]);

test('① 한 날 오름 — 같은 돈 · 규칙 비중 · 현금 · 「?」', () => {
  const bl = loadBaseline(fixture(), {kospi: KOSPI});
  const sel = {picks: [{code: '000010', w: 3}, {code: '000040', w: 2.5}], cash: 94.5};
  const r = dayReturn(bl, sel, 0, 4);
  const rA = 90 / 100 - 1, rD = 340 / 300 - 1;
  near(r.basket, (rA + rD) / 2, 'basket'); near(r.rule, 0.03 * rA + 0.025 * rD, 'rule');
  const all = bl.allCompanies(0, 4); near(r.allMean, all.mean, 'allMean'); near(r.kospi, 1050 / 1000 - 1, 'kospi');
  assert.equal(r.n, 2); assert.equal(r.unknown, 0); assert.equal(r.e, 4);
  assert.equal(r.beat, bl.beats(0, 4, r.basket).share);
  const cash = dayReturn(bl, {picks: [], cash: 100}, 0, 4);
  assert.equal(cash.basket, 0); assert.equal(cash.rule, 0); assert.equal(cash.n, 0);
  const q = dayReturn(bl, {picks: [{code: '000060', w: 3}, {code: '000010', w: 3}], cash: 94}, 0, 4); // 000060 은 시작 날 멈춤
  assert.equal(q.basket, null); assert.equal(q.rule, null); assert.equal(q.unknown, 1);
  assert.equal(dayReturn(bl, sel, 5, 4), null, '끝 날이 자료 밖');
  const s = dayReturn(bl, {picks: [{code: '000040', w: 3}], cash: 97}, 2, 'end'); // 끝 날 멈춤 = stale
  assert.equal(s.stale, 1); near(s.basket, 350 / 320 - 1, 'stale');
});

test('② 요약 — 이긴 날 · 차이 가운데 · 가장 나쁜 날(다시 세어 같음)', () => {
  const days = ['d0', 'd1', 'd2', 'd3', 'd4'];
  const rows5 = [
    {k: 0, n: 2, basket: 0.05, rule: 0.002, allMean: 0.01, allMedian: 0, kospi: 0.02, beat: 0.8},
    {k: 1, n: 0, basket: 0, rule: 0, allMean: 0.03, allMedian: 0.01, kospi: -0.01, beat: 0.4},
    {k: 2, n: 3, basket: -0.10, rule: -0.006, allMean: -0.02, allMedian: -0.03, kospi: -0.05, beat: 0.1},
    {k: 3, n: 1, basket: null, rule: null, allMean: 0.0, allMedian: 0, kospi: 0.0, beat: null},
    {k: 4, n: 1, basket: 0.02, rule: 0.001, allMean: 0.02, allMedian: 0.01, kospi: null, beat: 0.6},
  ];
  const s = summarize(rows5, days);
  assert.equal(s.days, 5); assert.equal(s.counted, 4); assert.equal(s.unknown, 1); assert.equal(s.cash, 1);
  assert.equal(s.winAll, 1); assert.equal(s.vsAll, 4); assert.equal(s.winAllShare, 0.25); // 0.02 = 0.02 는 진 날
  assert.equal(s.winKospi, 2); assert.equal(s.vsKospi, 3);
  assert.equal(s.winAllMedian, 2); // 0.05 > 0 · 0.02 > 0.01
  near(s.diffAll, med([0.04, -0.03, -0.08, 0]), 'diffAll'); near(s.diffKospi, 0.01, 'diffKospi');
  assert.deepEqual(s.worst, {date: 'd2', k: 2, r: -0.10, allMean: -0.02, kospi: -0.05});
  assert.equal(s.worstVsAll.k, 2); near(s.worstVsAll.diff, -0.08, 'worstVsAll');
  assert.equal(s.from, 'd0'); assert.equal(s.to, 'd4');
  const r = summarize(rows5, days, 'rule'); assert.equal(r.winAll, 1); assert.equal(r.winKospi, 2); // −0.006 > −0.02 · 0 > −0.01 · −0.006 > −0.05
  assert.deepEqual(summarize([], days).days, 0);
});
const med = xs => { const a = xs.slice().sort((x, y) => x - y), m = a.length; return m % 2 ? a[(m - 1) / 2] : (a[m / 2 - 1] + a[m / 2]) / 2; };

test('③ 셀 수 있는 창(years 로 비운 날 뒤부터) · 띄어 센 것', () => {
  const bl = loadBaseline(fixture(), {kospi: KOSPI});
  const sels = new Map([[0, {picks: [], cash: 100, counts: {why: 'years'}}], [1, {picks: [], cash: 100, counts: {why: 'years'}}],
    [2, {picks: [{code: '000010', w: 3}], cash: 97, counts: {}}], [3, {picks: [], cash: 100, counts: {why: 'none'}}], [4, {picks: [{code: '000020', w: 3}], cash: 97, counts: {}}]]);
  assert.equal(evaluable(sels.get(1)), false); assert.equal(evaluable(sels.get(3)), true);
  assert.equal(evaluable({picks: [], counts: {why: ['years']}}), false, '까닭이 배열'); assert.equal(evaluable({picks: [], counts: {why: 'cut,years'}}), false, '까닭 여럿은 쉼표로'); assert.equal(evaluable({picks: [], counts: {why: 'none'}}), true); assert.equal(evaluable({picks: [{code: 'A', w: 3}], counts: {why: ['years']}}), true);
  assert.equal(evaluate(bl, sels, {from: 0, to: 4, kStart: 3}).kStart, 3, '창 첫 날을 밖에서 정하면 그 날');
  const ev = evaluate(bl, sels, {from: 0, to: 4});
  assert.equal(ev.kStart, 2); assert.equal(ev.start, '2024-01-04'); assert.equal(ev.notEval, 2);
  // HOLDS m1 = 20 이라 이 작은 자료에서는 끝 날이 모자라 줄이 비어야 함(채우지 않음)
  assert.equal(ev.holds.m1.rows.length, 0); assert.equal(ev.holds.m1.main.days, 0);
});

test('④ 그날 것만 모음 — 뒤 줄 자름 · 못 쓰던 결산 칸만 바꿈', () => {
  const fin = {financeInfo: {trTitleList: [{isConsensus: 'N', key: '202412'}, {isConsensus: 'N', key: '202512'}, {isConsensus: 'N', key: '202603'}, {isConsensus: 'Y', key: '202612'}],
    rowList: [{title: '매출액', columns: {202412: {value: '10'}, 202512: {value: '11'}, 202603: {value: '12'}, 202612: {value: '13'}}}]}};
  const B = {stocks: {'000010': {list: {code: '000010'}, finance: {kind: 'json', text: JSON.stringify(fin)}, fchart: {rows: [row('20260331', 1), row('20260401', 2), row('20260701', 3)]}}}};
  const before = JSON.stringify(B);
  const vals = b => JSON.parse(b.stocks['000010'].finance.text).financeInfo.rowList[0].columns;
  const a = pitBundle(B, '2026-03-31');
  assert.deepEqual(Object.fromEntries(Object.entries(vals(a.bundle)).map(([k, v]) => [k, v.value])), {202412: '10', 202512: '-999,999', 202603: '-999,999', 202612: '-999,999'});
  assert.deepEqual(a.bundle.stocks['000010'].fchart.rows.map(r => r[0]), ['20260331']);
  const b = pitBundle(B, '2026-04-01');
  assert.deepEqual(Object.fromEntries(Object.entries(vals(b.bundle)).map(([k, v]) => [k, v.value])), {202412: '10', 202512: '11', 202603: '-999,999', 202612: '-999,999'});
  const c = pitBundle(B, '2026-07-01');
  assert.equal(vals(c.bundle)[202603].value, '12'); assert.equal(vals(c.bundle)[202612].value, '-999,999');
  assert.equal(JSON.stringify(B), before, '원래 모음은 그대로');
  const d = pitBundle(B, '2026-03-31', {poison: false});
  assert.equal(vals(d.bundle)[202512].value, '11'); assert.equal(d.bundle.stocks['000010'].fchart.rows.length, 1);
  // 받은 때 요약 칸: 값 · 시총 · PER 은 늘 · EPS(2026.06.)는 2026-09-01 전 · 배당(2025.12.)은 2026-04-01 전에 바꿈 · 목록 시총은 1
  const integ = {industryCode: 278, totalInfos: [{code: 'marketValue', value: '1조'}, {code: 'per', value: '10배', valueDesc: '2026.06.'}, {code: 'eps', value: '22,292원', valueDesc: '2026.06.'}, {code: 'dividend', value: '1,668원', valueDesc: '2025.12.'}]};
  const B2 = {stocks: {'000010': {list: {code: '000010', listValue: 604}, integration: {text: JSON.stringify(integ)}, fchart: {rows: [row('20260331', 1)]}}}};
  const iv = (b) => Object.fromEntries(JSON.parse(b.stocks['000010'].integration.text).totalInfos.map(t => [t.code, t.value]));
  assert.deepEqual(iv(pitBundle(B2, '2026-08-31').bundle), {marketValue: '-999,999', per: '-999,999', eps: '-999,999', dividend: '1,668원'});
  assert.deepEqual(iv(pitBundle(B2, '2026-03-31').bundle), {marketValue: '-999,999', per: '-999,999', eps: '-999,999', dividend: '-999,999'});
  assert.deepEqual(iv(pitBundle(B2, '2026-09-01').bundle), {marketValue: '-999,999', per: '-999,999', eps: '22,292원', dividend: '1,668원'});
  assert.equal(JSON.parse(pitBundle(B2, '2026-09-01').bundle.stocks['000010'].integration.text).industryCode, 278, '업종 번호는 그대로');
  assert.equal(pitBundle(B2, '2026-09-01').bundle.stocks['000010'].list.listValue, 1);
  assert.equal(pitBundle(B2, '2026-09-01', {poison: false}).bundle.stocks['000010'].list.listValue, 604);
  assert.equal(sameSel({picks: [{code: 'A', w: 3, name: 'x'}], cash: 97, counts: {why: null}}, {picks: [{code: 'A', w: 3}], cash: 97}), true);
  assert.equal(sameSel({picks: [{code: 'A', w: 3}], cash: 97}, {picks: [{code: 'A', w: 2.5}], cash: 97.5}), false);
  assert.deepEqual(normSel(null), {picks: [], cash: null, why: null});
});

test('⑤ 가짜 고르는 셈으로 끝까지 — 부른 수 · 그날 것만 다름 0 · 파일 꼴', () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'gdr-back-'));
  try {
    // 90날 · 회사 다섯 — 하루 값은 정해진 꼴(무작위 없음)
    const days = []; for (let t = new Date(Date.UTC(2031, 0, 1)); days.length < 90; t = new Date(t.getTime() + 864e5)) if (t.getUTCDay() % 6) days.push(t.toISOString().slice(0, 10).replaceAll('-', ''));
    const stocks = {};
    // 결산 세 해째(203011 → 2031-03-01 부터 씀)가 모이는 날이 창 첫 날 · 참고 줄은 두 해(202912 → 2030-04-01 · 처음부터)
    const fin = JSON.stringify({financeInfo: {trTitleList: [{isConsensus: 'N', key: '202812'}, {isConsensus: 'N', key: '202912'}, {isConsensus: 'N', key: '203011'}, {isConsensus: 'Y', key: '203111'}], rowList: []}});
    ['000010', '000020', '000030', '000040', '000050'].forEach((code, i) => { stocks[code] = {list: {code, name: 'N' + i, market: 'KOSPI', endType: 'stock'}, finance: {kind: 'json', text: fin},
      fchart: {rows: days.map((d, t) => row(d, Math.round(1000 * (1 + 0.3 * Math.sin((t + 7 * i) / (5 + i))) + 10 * i)))}}; });
    fs.writeFileSync(path.join(dir, 'b.json.gz'), zlib.gzipSync(JSON.stringify({stocks})));
    // 가짜 pick2: 그날까지 줄만 보고 5날 오름 큰 두 곳 · 앞 10날은 years
    fs.writeFileSync(path.join(dir, 'pick2.mjs'), `export const VERSION = 'fake-v1';
export async function loadData({bundle}) { const codes = Object.keys(bundle.stocks).sort(); const all = new Set(); for (const c of codes) for (const r of bundle.stocks[c].fchart.rows) all.add(String(r[0]));
  const ds = [...all].sort(); const close = codes.map(c => new Map(bundle.stocks[c].fchart.rows.map(r => [String(r[0]), r[4]])));
  return {codes, close, days: ds.map(d => d.slice(0,4)+'-'+d.slice(4,6)+'-'+d.slice(6)), raw: ds}; }
export function selectOn(data, k, opts = {}) { if (k < 10) return {version: VERSION, k, picks: [], cash: 100, counts: {why: 'years'}};
  const d = data.raw[k], p = data.raw[k - 5]; const sc = data.codes.map((c, i) => [c, data.close[i].get(d) / data.close[i].get(p)]).sort((a, b) => b[1] - a[1] || (a[0] < b[0] ? -1 : 1));
  const n = opts.lossYears ? 1 : 2; return {version: VERSION, k, picks: sc.slice(0, n).map(([code]) => ({code, w: 3})), cash: 100 - 3 * n, counts: {}}; }
`);
    const out = path.join(dir, 'back.json');
    const log = execFileSync(process.execPath, ['scripts/atlas11/next/gdr/backtest.mjs', '--bundle', path.join(dir, 'b.json.gz'), '--picker', path.join(dir, 'pick2.mjs'), '--out', out, '--from', '5', '--pit', '4', '--side', '1'], {cwd: ROOT, encoding: 'utf8'});
    assert.match(log, /고도리 지난 성적/);
    const j = JSON.parse(fs.readFileSync(out, 'utf8'));
    assert.equal(j.version, 'fake-v1'); assert.equal(j.backtest, 'bt-v1'); assert.equal(j.baseline, 'gb-v1');
    assert.equal(j.window.calls, 90 - 1 - 20 - 5 + 1, '부른 수 = 고른 날 수'); assert.equal(j.picks.length, j.window.calls);
    const k0 = days.findIndex(d => d >= '20310301');
    assert.equal(j.window.kStart, k0, '창 첫 날 = 세 해째 결산을 쓸 수 있는 첫 날'); assert.equal(j.window.notEval, k0 - 5);
    assert.equal(j.window.ready.atStart, 5); assert.equal(j.window.ready.dayBefore, 0);
    assert.equal(j.summary.m1.days, 90 - 1 - 20 - k0 + 1); assert.equal(j.summary.m3.days, Math.max(0, 90 - 1 - 60 - k0 + 1));
    assert.equal(j.side.kStart, 5, '참고 줄 = 두 해 — 처음부터');
    assert.ok(j.pit.compared >= 4); assert.equal(j.pit.diffs, 0); assert.equal(j.pit.baseline.diffs, 0);
    assert.equal(j.m1.length, 90 - 1 - 20 - 5 + 1); assert.equal(j.m3.length, 90 - 1 - 60 - 5 + 1);
    // 날마다 줄에서 다시 세어 요약과 같음
    const idx = Object.fromEntries(j.columns.map((c, i) => [c, i]));
    const inWin = j.m1.filter(r => r[idx.k] >= j.window.kStart);
    assert.equal(inWin.filter(r => r[idx.basket] > r[idx.allMean]).length, j.summary.m1.winAll);
    assert.equal(j.summary.m1.counted, inWin.length);
    assert.equal(j.picked.m1.counted, inWin.filter(r => r[idx.n] > 0).length);
    assert.equal(j.side.lossYears, 1); assert.match(j.side.label, /참고/);
    assert.ok(j.line.ko.includes('나빠도 실음'));
    assert.ok(j.secs.total >= 0);
  } finally { fs.rmSync(dir, {recursive: true, force: true}); }
});

test('⑥ 화면 글 — 금지 말 0 · 영어 틀 모두 등록 · 숫자는 요약 그대로', async () => {
  const {buildLines} = await import('../../scripts/atlas11/next/gdr/backtest.mjs');
  const {templateOf} = await import('../../site/next/i18n.js');
  const {screenHits} = await import('../../site/next/words.js');
  const T = JSON.parse(fs.readFileSync(path.join(ROOT, 'scripts/atlas11/next/i18n/en-src.json'), 'utf8')).templates;
  const sm = o => ({from: '2026-04-01', to: '2026-09-09', days: 112, counted: 112, vsAll: 112, winAll: 61, vsKospi: 112, winKospi: 55, cash: 3, diffAll: 0.0123, diffKospi: -0.008, worst: {date: '2026-07-28', r: -0.1234}, ...o});
  const ev = {start: '2026-04-01', holds: {m1: {main: sm(), nonOverlap: sm({vsAll: 6, winAll: 4, vsKospi: 6, winKospi: 3})}, m3: {main: sm({to: '2026-07-13', vsAll: 72, winAll: 30, vsKospi: 72, winKospi: 28, worst: {date: '2027-01-02', r: 0.05}})}}};
  const L = buildLines(ev, {holds: {m1: {main: sm({from: '2024-05-09', vsAll: 569, winAll: 300, vsKospi: 569, winKospi: 250})}}}, ['2023-04-28'], 1);
  assert.equal(L.ko, '지난 성적(나빠도 실음): 2026년 4월 1일 ~ 9월 9일 날마다 같은 규칙으로 고르면, 한 달 뒤 모든 회사 평균보다 나은 날 112날 중 61날 · 코스피보다 나은 날 112날 중 55날 · 가장 나쁜 날 7월 28일 −12.3%');
  assert.match(L.more[0], /가장 나쁜 날 2027년 1월 2일 \+5\.0%/, '해가 다르면 해까지');
  assert.match(L.more[1], /\+1\.2%p · 코스피보다 −0\.8%p/);
  const none = buildLines({holds: {m1: {main: {counted: 0}}}}, null, [], 1);
  for (const s of [L.ko, ...L.more, L.side, none.ko]) {
    assert.deepEqual(screenHits(s), [], s);
    assert.ok(templateOf(s).key in T, '영어 틀 없음: ' + templateOf(s).key);
  }
});
