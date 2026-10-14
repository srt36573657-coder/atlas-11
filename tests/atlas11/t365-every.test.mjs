// 목록에 오른 것 모두(모음 every) — 사장님 2026-10-14 11:02(싱가포르) 「이거 다 올려」(펀드와 우선주까지 4,307개)
//   ① dump.mjs: 보통주 후보가 아닌 것(상장 펀드 · 우선주 …)도 「보통주 아님」 줄로 더함 · 종류 이름 · 글자 섞인 번호 보통주는 보통주 후보
//   ② 두 갈래(멍거 · 린치) 모두 「모름」 · 까닭 = 「<종류> — 회사 주식이 아니라 셀 수 없음」 · 고른 곳은 그대로 ③ 옛 모음(every 아님)은 더하지 않음
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import zlib from 'node:zlib';
import {spawnSync} from 'node:child_process';
const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), '../..');
const days = JSON.parse(fs.readFileSync(path.join(ROOT, 'public/data/input.json'), 'utf8')).calendar.sessions.filter(d => d <= '2026-10-08').slice(-300);
const integ = (c, n, t, cap) => ({text: JSON.stringify({itemCode: c, stockName: n, stockEndType: t, industryCode: '278', totalInfos: [{code: 'marketValue', value: `${cap.toLocaleString('en-US')}억`}, {code: 'per', value: '5.00배'}]})});
const fin = v => ({kind: 'json', text: JSON.stringify({financeInfo: {trTitleList: ['202312', '202412', '202512'].map(k => ({isConsensus: 'N', title: k.slice(0, 4) + '.12.', key: k})),
  rowList: [['매출액', 100], ['영업이익', 10], ['당기순이익', 8], ['ROE', v], ['부채비율', 40], ['EPS', 1000], ['주당배당금', 0]].map(([t, x]) => ({title: t, columns: Object.fromEntries(['202312', '202412', '202512'].map(k => [k, {value: String(x)}]))}))}})});
const rows = k => days.map((d, i) => [d.replaceAll('-', ''), 100 + k, 101 + k, 99 + k, 100 + k + (i % 3), 1000]);
function bundle(every) {
  const stocks = {
    '100000': {list: {code: '100000', name: '합성전자', market: 'KOSPI', endType: 'stock'}, integration: integ('100000', '합성전자', 'stock', 9000), finance: fin(25), fchart: {rows: rows(1)}},
    '0126Z0': {list: {code: '0126Z0', name: '합성에피스홀딩스', market: 'KOSPI', endType: 'stock'}, integration: integ('0126Z0', '합성에피스홀딩스', 'stock', 8000), finance: fin(5), fchart: {rows: rows(2)}},
    '069500': {list: {code: '069500', name: 'KODEX 200', market: 'KOSPI', endType: 'etf'}, integration: integ('069500', 'KODEX 200', 'etf', 5000)},
    '100005': {list: {code: '100005', name: '합성전자우', market: 'KOSPI', endType: 'stock'}, integration: integ('100005', '합성전자우', 'stock', 600)},
  };
  return {schema: 'atlas11-universe-bundle-1', now: '2026-10-09T12:00:00Z', collectedAt: '2026-10-09T12:00:00Z', all: true, ...(every ? {every: true} : {}), lists: {source: 'json', pages: []}, stocks};
}
const dump = (b, tmp) => { const f = path.join(tmp, 'b.json.gz'), out = path.join(tmp, 'now.json'); fs.writeFileSync(f, zlib.gzipSync(JSON.stringify(b)));
  const r = spawnSync('node', ['scripts/atlas11/t365/dump.mjs', f, out, '2026-10-08'], {cwd: ROOT, encoding: 'utf8'}); assert.equal(r.status, 0, r.stderr); return [JSON.parse(fs.readFileSync(out, 'utf8')), f]; };

test('dump — every 면 펀드 · 우선주도 「보통주 아님」 줄 · 글자 섞인 번호 보통주는 후보 · 옛 모음은 그대로', () => {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'every-'));
  try {
    const [N] = dump(bundle(true), tmp), by = Object.fromEntries(N.rows.map(r => [r.code, r]));
    assert.equal(N.every, true); assert.deepEqual(Object.keys(by).sort(), ['0126Z0', '069500', '100000', '100005']);
    assert.equal(by['0126Z0'].notCommon, false, '글자 섞인 번호도 보통주(틀림 장부 26번)'); assert.equal(by['100000'].notCommon, false);
    assert.deepEqual([by['069500'].notCommon, by['069500'].kind, by['069500'].kindName], [true, 'etf', '상장 펀드']);
    assert.deepEqual([by['100005'].notCommon, by['100005'].kind, by['100005'].kindName], [true, 'pref', '우선주']);
    const [O] = dump(bundle(false), tmp);
    assert.deepEqual(O.rows.map(r => r.code).sort(), ['0126Z0', '100000'], '옛 모음(every 아님)은 보통주 후보만');
    assert.equal(O.every, undefined);
  } finally { fs.rmSync(tmp, {recursive: true, force: true}); }
});

test('두 갈래 — 회사 주식이 아닌 것은 모두 「모름」 · 종류 까닭 · 고른 곳은 보통주만', () => {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'every-'));
  try {
    const [, f] = dump(bundle(true), tmp);
    const code = `
import json, gzip, sys
sys.path.insert(0, 'scripts/atlas11/t365')
import munger, lynch, ml
N = json.load(open(${JSON.stringify(path.join(tmp, 'now.json'))}))
B = json.load(gzip.open(${JSON.stringify(f)}, 'rt'))
res = ml.select(N['rows'], N['asOf'], lynch.inputs(B, N['asOf']))
print(json.dumps({c: [s['s'], s['mg']['s'], s['mg']['why'], s['ly']['s'], s['ly']['why']] for c, s in res['status'].items()} | {'_picked': [p['code'] for p in res['picked']]}, ensure_ascii=False))`;
    const r = spawnSync('python3', ['-c', code], {cwd: ROOT, encoding: 'utf8'}); assert.equal(r.status, 0, r.stderr);
    const S = JSON.parse(r.stdout.trim().split('\n').at(-1));
    assert.deepEqual(S['069500'], ['q', 'q', '상장 펀드 — 회사 주식이 아니라 셀 수 없음', 'q', '상장 펀드 — 회사 주식이 아니라 셀 수 없음']);
    assert.deepEqual(S['100005'].slice(0, 2), ['q', 'q']); assert.match(S['100005'][2], /^우선주 — /);
    assert.ok(S._picked.includes('100000'), 'ROE 25% 보통주는 멍거 갈래로 듦'); assert.ok(!S._picked.includes('069500') && !S._picked.includes('100005'));
  } finally { fs.rmSync(tmp, {recursive: true, force: true}); }
});
