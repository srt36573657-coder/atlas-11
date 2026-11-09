// 수르 엄격 셈(주문 0854 · 사장님 2026-11-09 08:54 「몬테카를로 방식으로 먼저 찾아낸 다음 소거법을 31번 더 돌려서 지금보다 엄격한 기준으로」 · 09:02 「어」) — 셈 시험
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {execFileSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
import {keepDay, KEYS} from '../../scripts/atlas11/next/su21_days.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const py = code => JSON.parse(execFileSync('python3', ['-c', 'import sys, json; sys.path.insert(0, "scripts/atlas11/next"); import su21_strict as S\n' + code], {cwd: ROOT, encoding: 'utf8'}));

test('소거 기준 31가지 — 서로 다른 이름 · 다섯 묶음 · 화면 글(쓰지 않을 말 0 · 「%」 0 · 영어 글자 0)', async () => {
  const C = py('print(json.dumps({"crit": S.CRIT, "rule": S.RULE_ID, "paths": S.MC_PATHS, "p": S.MC_P}, ensure_ascii=False))');
  assert.equal(C.crit.length, 31); assert.equal(new Set(C.crit.map(c => c[0])).size, 31);
  assert.deepEqual([...new Set(C.crit.map(c => c[1]))], ['가', '나', '다', '라', '마']);
  assert.equal(C.paths, 100000); assert.equal(C.p, 0.05); assert.match(C.rule, /^strict31-v\d+$/);
  const W = await import('../../site/next/words.js'), all = C.crit.flatMap(c => c.slice(2)).join('\n');
  assert.deepEqual([...W.screenHits(all), ...W.ruinHits(all)].map(x => x.word ?? x), []);
  assert.ok(!all.includes('%') && !/[A-Za-z]/.test(all));
});
test('몬테카를로 — 같은 씨앗 같은 값 · 드문 값은 작게 · 흔한 값은 크게', () => {
  const r = py(`import numpy as np
h = np.random.default_rng(7).normal(0, 0.02, 250)
s = sorted(h[np.random.default_rng(1).integers(0, 250, size=(200000, 5))].sum(axis=1))
q95 = float(s[int(0.95 * len(s))])
print(json.dumps({"a": S.mc_p(h, 5, q95, 11), "b": S.mc_p(h, 5, q95, 11), "hi": S.mc_p(h, 5, 0.2, 11), "lo": S.mc_p(h, 5, -0.2, 11)}))`);
  assert.equal(r.a, r.b, '같은 씨앗');
  assert.ok(Math.abs(r.a - 0.05) < 0.01, '위 5 문턱이면 0.05 가까이 ' + r.a);
  assert.ok(r.hi < 0.001 && r.lo > 0.999, JSON.stringify(r));
});
test('고르기 — 지금 셈 일곱만 받아 거름(채우지 않음) · 몬테카를로를 못 지나면 기준을 대지 않음 · 소거 줄은 줄어들기만', () => {
  const r = py(`import numpy as np, math
rng = np.random.default_rng(3)
dates = ['2025-%02d-%02d' % (1 + i // 28, 1 + i % 28) for i in range(320)]
B, CL, closes = {}, {}, {}
for k in range(12):
    c = '%06d' % (100000 + k)
    lr = rng.normal(0, 0.01, 320)
    if k < 3: lr[-20:] += 0.02                # 뜨거운 셋
    a = 10000 * np.exp(np.cumsum(lr)); closes[c] = a
    l = [round(float(x)) for x in a[-21:]]; CL[c] = l
    B[c] = {'c': l, 'date': dates[-1], 'group': {'label': '업종' + str(k % 2)}, 'info': {'days52': 252}, 'brief': {'flows': {'foreign': 10, 'institution': 5, 'individual': -3, 'holdPct': {'first': 10, 'last': 10.2}}, 'newsNamed': 1, 'news': {'title': '실적 발표'}}}
ctx = S.Ctx(B, dates[-1], dates, lambda c: closes.get(c), lambda c: True, {c: 5000 for c in B}, CL, lambda c: B[c]['group']['label'])
fin = lambda c: {'op': [1, 2], 'net': [1, 2], 'roe': [5, 6], 'debt': [50, 40], 'rev': [100, 105], '_pbr': 1.5}
pools = {k: list(B)[:7] for k in ('hot', 'bloom', 'money', 'hotNext', 'moneyNext', 'bloomNext')}
pick, res = S.select(ctx, pools, fin)
print(json.dumps({'pick': pick, 'res': {k: {kk: v[kk] for kk in ('pool', 'mc', 'steps', 'final')} for k, v in res.items()}}))`);
  for (const k of KEYS) {
    const g = r.res[k];
    assert.equal(g.pool, 7, k); assert.ok(g.mc <= g.pool); assert.equal(g.steps.length, 31);
    assert.ok(g.steps.every((n, i) => n <= (i ? g.steps[i - 1] : g.mc)), k + ' 줄어들기만');
    assert.equal(g.final, r.pick[k].length); assert.ok(r.pick[k].every(c => ['100000', '100001', '100002', '100003', '100004', '100005', '100006'].includes(c)), '일곱 밖에서 채우지 않음');
  }
  assert.ok(r.res.hot.mc >= 1 && r.pick.hot.every(c => ['100000', '100001', '100002'].includes(c)), '불장 = 뜨거운 셋만 ' + JSON.stringify(r.pick.hot));
});
test('며칠째 기록 — 규칙이 다르면 그날 목록을 적지 않음(지난 판을 새 규칙으로 다시 센 뒤에 적음)', () => {
  const su = {asOf: {board: '2026-11-09'}, strict: {rule: 'strict31-v1'}, lists: Object.fromEntries(KEYS.map(k => [k, []]))};
  const old = {days: {'2026-11-06': {how: 'replay', lists: {}}}};
  assert.equal(keepDay(old, su, null, 'x'), false, '옛 규칙 기록에는 적지 않음');
  const neu = {rule: 'strict31-v1', days: {'2026-11-06': {how: 'replay', lists: {}}}};
  assert.equal(keepDay(neu, su, null, 'x'), true); assert.equal(neu.rule, 'strict31-v1');
  const empty = {days: {}}; assert.equal(keepDay(empty, su, null, 'x'), true); assert.equal(empty.rule, 'strict31-v1');
});
test('지난 1년 견줌 — 엄격 셈 · 옛 셈 · 아무 회사(될 듯 셋) · 규칙 이름이 같음', () => {
  const P = JSON.parse(fs.readFileSync(path.join(ROOT, 'reports/atlas11/su-next/past-strict.json'), 'utf8'));
  assert.equal(P.rule, py('print(json.dumps(S.RULE_ID))'));
  for (const g of ['hotNext', 'moneyNext', 'bloomNext']) {
    const v = P.res[g];
    for (const k of ['old', 'strict', 'base']) assert.ok(v[k].picks > 0 && Number.isFinite(v[k].per100), g + ' ' + k);
    assert.ok(v.strict.picks < v.old.picks, g + ' 엄격하면 적게');
  }
});

test('며칠째 — 표시 판(주문 1209 · strict.mode mark)은 칸이 옛 셈 일곱이라 규칙 없음(null)으로 적음', async () => {
  const {keepDay} = await import('../../scripts/atlas11/next/su21_days.mjs');
  const KEYS = ['hot', 'bloom', 'money', 'hotNext', 'moneyNext', 'bloomNext'];
  const su = {asOf: {board: '2026-11-09'}, strict: {rule: 'strict31-v1', mode: 'mark'}, lists: Object.fromEntries(KEYS.map(k => [k, []]))};
  const oldRec = {days: {'2026-11-06': {how: 'replay', lists: {}}}}; // 엄격 셈 앞 기록(규칙 없음) — 그대로 이어 적음
  assert.equal(keepDay(oldRec, su, null, 'x'), true); assert.equal(oldRec.rule ?? null, null);
  const strictRec = {rule: 'strict31-v1', days: {'2026-11-06': {how: 'replay', lists: {}}}}; // 거른 판으로 적은 기록 — 규칙이 달라 적지 않음(지난 판 다시 세기가 먼저 옛 규칙으로 바꿈)
  assert.equal(keepDay(strictRec, su, null, 'x'), false);
});

test('며칠째 — 몬테카를로 차례 판(주문 1422 · listRule mc365-v1)은 그 규칙 이름으로 적음 · 옛 기록은 지난 판 다시 세기가 먼저 바꿈', async () => {
  const {keepDay} = await import('../../scripts/atlas11/next/su21_days.mjs');
  const KEYS = ['hot', 'bloom', 'money', 'hotNext', 'moneyNext', 'bloomNext'];
  const su = {asOf: {board: '2026-11-09'}, listRule: 'mc365-v1', lists: Object.fromEntries(KEYS.map(k => [k, []]))};
  const oldRec = {days: {'2026-11-06': {how: 'replay', lists: {}}}};
  assert.equal(keepDay(oldRec, su, null, 'x'), false);
  const neu = {rule: 'mc365-v1', days: {'2026-11-06': {how: 'replay', lists: {}}}};
  assert.equal(keepDay(neu, su, null, 'x'), true); assert.equal(neu.rule, 'mc365-v1');
});
