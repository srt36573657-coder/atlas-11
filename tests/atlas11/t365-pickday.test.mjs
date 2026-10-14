// 고르는 날(daese.pick_day) — 종가 줄이 없는 목록(펀드 · 우선주 등)이 섞여도 「절반」을 종가 있는 회사로만 셈(2026-10-14 · 못 한 것 25번)
// 목록 모두 모음(--every)은 4,307줄 가운데 1,750줄이 종가를 받지 않음 → 옛 셈은 보통주의 84%가 그날 종가를 가져야 고르는 날이 됨
import {test} from 'node:test';
import assert from 'node:assert/strict';
import {execFileSync} from 'node:child_process';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const run = src => JSON.parse(execFileSync('python3', ['-c', `import sys, json; sys.path.insert(0, ${JSON.stringify(path.join(ROOT, 'scripts/atlas11/t365'))}); import daese\n${src}`], {encoding: 'utf8'}));

test('종가 없는 줄이 많아도 고르는 날은 종가 있는 회사의 절반으로 정함', () => {
  const r = run(`
rows = lambda days: [[d.replace('-', ''), 0, 0, 0, 100, 1] for d in days]
cal = ['2026-10-08', '2026-10-09', '2026-10-12', '2026-10-13']
stocks = {}
for k in range(10):   # 회사 10곳 — 10월 13일까지 종가(마지막 날은 6곳만)
    stocks['A%02d' % k] = {'fchart': {'rows': rows(cal if k < 6 else cal[:-1])}}
for k in range(20):   # 펀드 · 우선주 20줄 — 종가 줄 없음
    stocks['F%02d' % k] = {'fchart': {'rows': []}}
day, ext = daese.pick_day({'stocks': stocks}, sorted(stocks), cal)
print(json.dumps({'day': day, 'ext': ext}))`);
  assert.equal(r.day, '2026-10-13'); // 종가 있는 10곳 가운데 6곳 > 절반
  assert.deepEqual(r.ext, ['2026-10-08', '2026-10-09', '2026-10-12', '2026-10-13']);
});

test('종가 있는 회사의 절반을 못 넘는 날은 고르지 않음', () => {
  const r = run(`
rows = lambda days: [[d.replace('-', ''), 0, 0, 0, 100, 1] for d in days]
cal = ['2026-10-12', '2026-10-13']
stocks = {('A%02d' % k): {'fchart': {'rows': rows(cal if k < 4 else cal[:-1])}} for k in range(10)}
stocks.update({('F%02d' % k): {'fchart': {'rows': []}} for k in range(5)})
day, ext = daese.pick_day({'stocks': stocks}, sorted(stocks), cal)
print(json.dumps({'day': day}))`);
  assert.equal(r.day, '2026-10-12'); // 10월 13일은 10곳 가운데 4곳뿐
});

test('종가 줄이 하나도 없으면 멈춤', () => {
  assert.throws(() => run(`
stocks = {'F00': {'fchart': {'rows': []}}}
daese.pick_day({'stocks': stocks}, ['F00'], ['2026-10-13'])`), /절반/);
});
