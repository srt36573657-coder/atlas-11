// 힘 붙은 365곳(h365-v1) — 사장님 2026-10-13 13:04 「매번 업데이트 할때 365개 종목기준을 힘이 붙는 종목으로 기준을 변경한다 … cia팀이 중심이 되서 나머지팀은 협력하여 기횓한후 알트라스에 적용시킨다」
//   ① 작은 보기 자료(파이썬 select 그대로): 「힘 붙음」 먼저 · 365곳 넘으면 힘 큰 차례로 · 남김은 앞 회차가 h365-v1 이고 오늘 450번째 안일 때만 · 「?」 셋 · 거래량을 모르는 날은 0 이 아님 · 두 번 같음
//   ② 10월 8일 실제 값: 기본 문 705 · 셀 수 있음 700 · 「?」 5 · 힘 붙음 291 · 채움 74 · 따로 세기 틀림 0 · 앞 회차 기록을 넣으면 남김 · 따로 세기도 같은 기록으로 틀림 0 · 고친 자료는 따로 세기가 잡음
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {spawnSync} from 'node:child_process';

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), '../..');
const py = (code, env = {}) => { const r = spawnSync('python3', ['-c', code], {cwd: ROOT, encoding: 'utf8', env: {...process.env, ...env}, maxBuffer: 64 << 20}); assert.equal(r.status, 0, r.stderr); return JSON.parse(r.stdout.trim().split('\n').at(-1)); };

// 보기 자료 — 날 30개 · 회사 n곳 · 회사마다 d 를 정해 종가를 만듦(앞 10거래일 0 · 뒤 10거래일 d) · 기본 문은 모두 지남
const SYN = `
import sys, json
sys.path.insert(0, 'scripts/atlas11/t365')
import h365
cal = ['2030-01-%02d' % k for k in range(1, 31)]
def make(ds, holes=None, vols=None):
    holes = holes or {}; vols = vols or {}
    rows, stocks = [], {}
    for j, d in enumerate(ds):
        c = '%06d' % (j + 1)
        rows.append({'code': c, 'name': 'C%d' % j, 'market': 'KOSPI', 'sector': '반도체와반도체장비', 'capEok': 5000 + j, 'notCommon': False,
                     'px': {'n': 300, 'atvEok': 10}, 'metrics': {'net': 1, 'op': 1, 'debt': 50}})
        rr = []
        for k, day in enumerate(cal):
            p = 1000.0 if k <= 19 else 1000.0 * (1 + d) ** ((k - 19) / 10)
            if (c, k) in holes: continue
            rr.append([day.replace('-', ''), None, None, None, p, vols.get((c, k), 100)])
        stocks[c] = {'fchart': {'rows': rr}}
    return rows, {'stocks': stocks}
out = {}
`;
const TAIL = 'print(json.dumps(out))';

test('작은 보기 — 「힘 붙음」 먼저 · 모자라면 차례로 채워 늘 365곳 · 365곳 넘으면 힘 큰 차례로', () => {
  const r = py(SYN + `
rows, m = make([0.10] * 100 + [0.0] * 400)
x = h365.select(rows, m, cal, cal[-1])
out['a'] = [x['counts'][k] for k in ('gainAll', 'gain', 'keep', 'fill', 'picked')]
out['aKinds'] = sorted(set(p['kind'] for p in x['picked'][:100])) + sorted(set(p['kind'] for p in x['picked'][100:]))
rows, m = make([0.05 + j * 1e-4 for j in range(400)])
x = h365.select(rows, m, cal, cal[-1])
out['b'] = [x['counts'][k] for k in ('gainAll', 'gain', 'fill', 'picked')]
out['bTop'] = x['picked'][0]['code']
out['bCut'] = sorted(set(s['why'] for s in x['status'].values() if s['s'] == 'cut'))
rows, m = make([0.10] * 10 + [0.0] * 10)
x = h365.select(rows, m, cal, cal[-1])
out['c'] = [x['counts'][k] for k in ('gain', 'fill', 'picked')]
${TAIL}`);
  assert.deepEqual(r.a, [100, 100, 0, 265, 365]); assert.deepEqual(r.aKinds, ['gain', 'fill']);
  assert.deepEqual(r.b, [400, 365, 0, 365]); assert.equal(r.bTop, '000400', '힘이 가장 큰 곳이 맨 앞'); assert.deepEqual(r.bCut, ['힘 붙음이지만 365곳이 이미 참']);
  assert.deepEqual(r.c, [10, 10, 20], '셀 수 있는 곳이 365곳보다 적으면 그 수만');
});

test('작은 보기 — 남김은 앞 회차가 h365-v1 일 때만 · 오늘 450번째 안 · 판이 바뀌는 첫 회차는 완충 없음', () => {
  const r = py(SYN + `
ds = [0.10] * 100 + [0.02 - j * 1e-5 for j in range(500)]
rows, m = make(ds)
codes = [r['code'] for r in rows]
prev_mem = codes[400:420] + codes[460:470] + codes[0:5]
x = h365.select(rows, m, cal, cal[-1], {'version': 'h365-v1', 'at': 'T', 'members': prev_mem})
out['keep'] = [p['code'] for p in x['picked'] if p['kind'] == 'keep']
out['n'] = [x['counts'][k] for k in ('gain', 'keep', 'fill', 'picked')]
out['prev'] = x['prev']
y = h365.select(rows, m, cal, cal[-1], {'version': 'd365-v2', 'at': 'T', 'members': prev_mem})
out['old'] = [y['counts'][k] for k in ('gain', 'keep', 'fill')] + [y['prev']['used']]
z = h365.select(rows, m, cal, cal[-1], None)
out['none'] = [z['counts'][k] for k in ('gain', 'keep', 'fill')] + [z['prev']['used']]
out['same'] = [p['code'] for p in z['picked']] == [p['code'] for p in h365.select(rows, m, cal, cal[-1], None)['picked']]
${TAIL}`);
  // 차례 401 ~ 420번째(450번째 안)만 남김 · 461 ~ 470번째(450번째 밖)와 「힘 붙음」(1 ~ 5번째)은 남김이 아님
  assert.deepEqual(r.keep, Array.from({length: 20}, (_, k) => String(401 + k).padStart(6, '0')));
  assert.deepEqual(r.n, [100, 20, 245, 365]); assert.equal(r.prev.used, true); assert.equal(r.prev.n, 35); assert.match(r.prev.digest, /^[0-9a-f]{16}$/);
  assert.deepEqual(r.old, [100, 0, 265, false], '앞 회차 판이 다르면 완충 없음');
  assert.deepEqual(r.none, [100, 0, 265, false]); assert.equal(r.same, true, '같은 원문이면 같은 365곳');
});

test('작은 보기 — 「?」 셋(종가 빈 날 · 끊긴 값 · 거래량 0) · 고르는 날 거래량과 모르는 거래량은 0 으로 보지 않음', () => {
  const r = py(SYN + `
rows, m = make([0.10] * 8, holes={('000001', 15): 1})
m['stocks']['000002']['fchart']['rows'][25][4] *= 1.5
m['stocks']['000003']['fchart']['rows'][12][5] = 0
m['stocks']['000004']['fchart']['rows'][29][5] = 0
m['stocks']['000005']['fchart']['rows'][12][5] = None
x = h365.select(rows, m, cal, cal[-1])
out['st'] = {c: x['status'][c] for c in ('000001', '000002', '000003', '000004', '000005')}
out['q'] = [x['counts']['q'], x['counts']['qWhy']]
${TAIL}`);
  assert.deepEqual(r.st['000001'], {s: 'q', why: '? 셈 못 함 — 종가 빈 날'});
  assert.deepEqual(r.st['000002'], {s: 'q', why: '? 끊긴 값(쪼개기 등)'});
  assert.deepEqual(r.st['000003'], {s: 'q', why: '? 거래량 0인 날(거래정지 흔적)'});
  assert.deepEqual(r.st['000004'], {s: 'in'}, '고르는 날(낮 회차) 거래량은 보지 않음');
  assert.deepEqual(r.st['000005'], {s: 'in'}, '거래량을 모르는 날은 0 이 아님');
  assert.deepEqual(r.q, [3, {gap: 1, break: 1, vol0: 1}]);
});

test('10월 8일 값 — 705 · 700 · 「?」 5 · 힘 붙음 291 · 채움 74 · 따로 세기 틀림 0 · 앞 회차 기록이면 남김 · 고친 자료는 잡힘', () => {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 't365-h365-'));
  const now = path.join(tmp, 'now.json');
  let r = spawnSync('node', ['scripts/atlas11/t365/dump.mjs', 'reports/atlas11/universe/2026-10-10/bundle.json.gz', now, '2026-10-08'], {cwd: ROOT, encoding: 'utf8'}); assert.equal(r.status, 0, r.stderr);
  const run = (dir, extra = [], env = {}) => { const x = spawnSync('python3', ['scripts/atlas11/t365/h365.py', now, dir, ...extra], {cwd: ROOT, encoding: 'utf8', env: {...process.env, ...env}}); assert.equal(x.status, 0, x.stderr); return JSON.parse(fs.readFileSync(path.join(dir, 'proposal.json'), 'utf8')); };
  const verify = (prop, env = {}) => spawnSync('node', ['scripts/atlas11/t365/h365_verify.mjs', now, prop, path.join(tmp, 'v.json')], {cwd: ROOT, encoding: 'utf8', env: {...process.env, ...env}});
  const a = run(path.join(tmp, 'a'));
  const c = a.counts;
  assert.deepEqual([c.universe, c.gate, c.measured, c.q, c.gainAll, c.gain, c.keep, c.fill, c.picked], [1378, 705, 700, 5, 291, 291, 0, 74, 365]);
  assert.deepEqual(c.qWhy, {gap: 0, break: 3, vol0: 2}); assert.equal(a.rules.version, 'h365-v1'); assert.equal(a.from.prev.used, false);
  assert.deepEqual(a.window, {from: '2026-09-07', mid: '2026-09-21', to: '2026-10-08', days: 20});
  for (const p of a.picked) assert.ok(!('rank' in p) && !('tier' in p) && ['gain', 'fill'].includes(p.kind), p.code);
  for (const o of a.outside) if (o.s !== 'gate') assert.ok(o.why.length <= 30, o.why);
  r = verify(path.join(tmp, 'a', 'proposal.json')); assert.equal(r.status, 0, r.stdout + r.stderr); assert.match(r.stdout, /"bad":0/);
  // 두 번 돌려도 같음(만든 때만 다름)
  const b = run(path.join(tmp, 'b')); delete a.made; delete b.made; assert.deepEqual(b, a);
  // 앞 회차 기록(h365-v1) — 지금 대세 365곳을 앞 회차처럼 넣으면 그 가운데 450번째 안 · 「힘 붙음」 아닌 곳이 남김
  const d365 = JSON.parse(fs.readFileSync(path.join(ROOT, 'reports/atlas11/universe/2026-10-11-d365-v2/proposal.json'), 'utf8')).picked.map(p => p.code);
  const pf = path.join(tmp, 'prev.json'); fs.writeFileSync(pf, JSON.stringify({version: 'h365-v1', at: '2026-10-08T05:00:00Z', members: d365}));
  const k = run(path.join(tmp, 'k'), ['--prev', pf]);
  assert.ok(k.counts.keep > 0 && k.counts.gain === 291 && k.counts.picked === 365, JSON.stringify(k.counts));
  for (const p of k.picked.filter(p => p.kind === 'keep')) assert.ok(d365.includes(p.code) && p.d <= 0.03, p.code);
  assert.equal(k.from.prev.used, true); assert.equal(k.from.prev.n, 365);
  r = verify(path.join(tmp, 'k', 'proposal.json'), {ATLAS_H365_PREV: pf}); assert.equal(r.status, 0, r.stdout + r.stderr);
  r = verify(path.join(tmp, 'k', 'proposal.json')); assert.equal(r.status, 1, '앞 회차 기록 없이 맞대면 틀림(남김 · 지문)');
  // 고친 자료 — 남김 하나를 채움으로 · 365곳에서 하나를 바꿔 넣음 → 따로 세기가 잡음
  const bad1 = structuredClone(k); bad1.picked.find(p => p.kind === 'keep').kind = 'fill'; fs.writeFileSync(path.join(tmp, 'bad1.json'), JSON.stringify(bad1));
  r = verify(path.join(tmp, 'bad1.json'), {ATLAS_H365_PREV: pf}); assert.equal(r.status, 1, '든 까닭을 바꾸면 잡힘');
  const bad2 = structuredClone(a), o = bad2.outside.find(x => x.s === 'cut'); [bad2.picked[364].code, o.code] = [o.code, bad2.picked[364].code]; fs.writeFileSync(path.join(tmp, 'bad2.json'), JSON.stringify(bad2));
  r = verify(path.join(tmp, 'bad2.json')); assert.equal(r.status, 1, '회사를 바꿔 넣으면 잡힘');
  fs.rmSync(tmp, {recursive: true, force: true});
});
