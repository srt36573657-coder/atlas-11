// 멍거 조건(mg-v1) — 사장님 2026-10-13 23:14(서울) 「기준 다시 만들어봐 찰리 멍거라면」 · 23:34 「철저하게 찰리 망거 조건만 해」 · 2026-10-14 00:03 「가 로 하자」
//   ① 작은 보기 자료(파이썬 judge 그대로): 3해 모두 돈 벎 · 빚 ≤ 자기 돈(예외 없음 — 은행도) · 3해 모두 ROE 18% 이상 · 빈 값은 「모름」 · 예상 E 는 안 씀
//   ② 10월 10일 모음 · 10월 8일 값: 26곳 · 모름 109 · ① 682 · ② 427 · 노드 따로 세기 틀림 0 · 값을 바꾸면 따로 세기가 잡음
//   ③ 주가를 안 씀 — 이어 받은 일봉이 있어도 같은 곳(멍거 「기다림」)
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {spawnSync} from 'node:child_process';
const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), '../..');
const ACT = JSON.parse(fs.readFileSync(path.join(ROOT, 'scripts/atlas11/t365/universe.json'), 'utf8'));
const py = code => { const r = spawnSync('python3', ['-c', code], {cwd: path.join(ROOT, 'scripts/atlas11/t365'), encoding: 'utf8'}); assert.equal(r.status, 0, r.stderr); return JSON.parse(r.stdout.trim().split('\n').at(-1)); };

test('작은 보기 — 세 조건 · 모름 · 예외 없음 · 예상 E 안 씀', () => {
  const out = py(`
import json, munger
def row(code, sector, net, op, roe, debt, per=('2023.12','2024.12','2025.12','2026.12E')):
    f = {'periods': list(per)}
    for k, v in (('net', net), ('op', op), ('roe', roe), ('debt', debt)):
        f[k] = dict(zip(per, v))
    return {'code': code, 'name': code, 'market': 'KOSPI', 'sector': sector, 'capEok': 1000, 'notCommon': False, 'fin': f, 'per': 10}
rows = [
  row('A', '화학', [1,1,1,-9], [1,1,1,1], [20,25,30,1], [50,60,70,500]),       # 다 넘음 · 2026E 는 안 봄
  row('B', '화학', [1,-1,1,1], [1,1,1,1], [20,25,30,30], [50,60,70,70]),         # 2024 적자 → ①
  row('C', '화학', [1,1,1,1], [1,-1,1,1], [20,25,30,30], [50,60,70,70]),         # 본업 적자 → ①
  row('D', '은행', [1,1,1,1], [None,None,None,None], [20,25,30,30], [900,900,900,900]),  # 은행도 빚 셈 → ②
  row('E', '화학', [1,1,1,1], [1,1,1,1], [20,17.9,30,30], [50,60,100,70]),       # 빚 100 은 됨 · 17.9 → ③
  row('F', '화학', [1,1,1,1], [1,1,1,1], [20,None,30,30], [50,60,70,70]),        # 빈 값 → 모름
  row('G', '화학', [1,1,1], [1,1,1], [20,25,30], [50,60,70], per=('2024.12','2025.12','2026.12E')),  # 확정 2해뿐 → 모름
  row('H', '조선', [1,1,1,1], [1,1,1,1], [40,40,40,40], [300,250,200,200]),     # 조선도 예외 없음 → ②
  row('I', '화학', [1,1,1,1], [1,1,1,1], [18,18,18,18], [100,100,100,100]),     # 선 위(18 · 100)는 넘음
]
res = munger.select(rows, '2026-10-08')
print(json.dumps({'s': {c: v['s'] for c, v in res['status'].items()}, 'w': {c: v['why'] for c, v in res['status'].items()}, 'picked': [p['code'] for p in res['picked']], 'counts': res['counts']}, ensure_ascii=False))
`);
  assert.deepEqual(out.s, {A: 'in', B: 'loss', C: 'loss', D: 'debt', E: 'roe', F: 'q', G: 'q', H: 'debt', I: 'in'});
  assert.deepEqual(out.picked, ['A', 'I'], '차례 = 가장 낮은 ROE 큰 순(A 20 · I 18)');
  assert.equal(out.w.B, '2024년에 돈을 잃었음'); assert.equal(out.w.C, '2024년 본업에서 돈을 잃었음'); assert.equal(out.w.D, '2023년 빚이 자기 돈의 9.0배');
  assert.equal(out.w.E, '2024년 자기 돈 100원으로 17.9원 벎'); assert.equal(out.w.H, '2023년 빚이 자기 돈의 3.0배');
  const c = out.counts; assert.deepEqual([c.universe, c.q, c.known, c.loss, c.s1, c.debt, c.s2, c.roe, c.picked], [9, 2, 7, 2, 5, 2, 3, 1, 2]);
});

test('10월 10일 모음 — 26곳 · 깔때기 · 노드 따로 세기 틀림 0 · 값을 바꾸면 잡음 · 주가를 안 씀', () => {
  assert.equal(ACT.version, 'mg-v1');
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'mg-'));
  try {
    const now = path.join(tmp, 'now.json');
    let r = spawnSync('node', ['scripts/atlas11/t365/dump.mjs', ACT.bundle, now, ACT.asOf], {cwd: ROOT, encoding: 'utf8', maxBuffer: 64 << 20}); assert.equal(r.status, 0, r.stderr);
    r = spawnSync('python3', ['scripts/atlas11/t365/munger.py', now, path.join(tmp, 'a')], {cwd: ROOT, encoding: 'utf8'}); assert.equal(r.status, 0, r.stderr);
    const a = JSON.parse(fs.readFileSync(path.join(tmp, 'a', 'proposal.json'), 'utf8')), c = a.counts;
    assert.deepEqual([c.universe, c.q, c.known, c.s1, c.s2, c.picked], [1378, 109, 1269, 682, 427, 26]);
    assert.equal(a.rules.version, 'mg-v1'); assert.equal(a.rules.conds.length, 3); assert.match(a.rules.notMunger, /멍거가 고른 목록이 아닙니다/);
    for (const p of a.picked) { assert.equal(p.years.length, 3); assert.ok(p.net.every(x => x > 0) && p.debt.every(x => x <= 100) && p.roe.every(x => x >= 18), p.name); assert.ok(p.years.every(y => !y.endsWith('E'))); }
    const names = a.picked.map(p => p.name); for (const n of ['에이피알', '한미반도체', '코웨이']) assert.ok(names.includes(n), n);
    const out = Object.fromEntries(a.outside.map(o => [o.name, o])); assert.equal(out['삼성전자'].s, 'roe'); assert.equal(out['SK하이닉스'].s, 'loss'); assert.equal(out['현대차'].s, 'debt');
    // 바탕 판(저장소)과 같은 곳 · 같은 차례
    const base = JSON.parse(fs.readFileSync(path.join(ROOT, ACT.dir, 'proposal.json'), 'utf8')); assert.deepEqual(a.picked.map(p => p.code), base.picked.map(p => p.code));
    r = spawnSync('node', ['scripts/atlas11/t365/munger_verify.mjs', now, path.join(tmp, 'a', 'proposal.json'), path.join(tmp, 'v.json')], {cwd: ROOT, encoding: 'utf8'}); assert.equal(r.status, 0, r.stdout + r.stderr); assert.match(r.stdout, /틀림 0/);
    // 값을 바꾸면 따로 세기가 잡음 — ① 고른 곳 하나의 ROE 를 18 밑으로 ② 밖 회사 하나의 멈춘 자리를 바꿈
    const bad1 = JSON.parse(JSON.stringify(a)); bad1.picked[0].roe[1] = 12; fs.writeFileSync(path.join(tmp, 'bad1.json'), JSON.stringify(bad1));
    r = spawnSync('node', ['scripts/atlas11/t365/munger_verify.mjs', now, path.join(tmp, 'bad1.json')], {cwd: ROOT, encoding: 'utf8'}); assert.equal(r.status, 1, '3해 값을 바꾸면 잡힘');
    const bad2 = JSON.parse(JSON.stringify(a)); bad2.outside[0].s = bad2.outside[0].s === 'roe' ? 'debt' : 'roe'; fs.writeFileSync(path.join(tmp, 'bad2.json'), JSON.stringify(bad2));
    r = spawnSync('node', ['scripts/atlas11/t365/munger_verify.mjs', now, path.join(tmp, 'bad2.json')], {cwd: ROOT, encoding: 'utf8'}); assert.equal(r.status, 1, '멈춘 자리를 바꾸면 잡힘');
    // 주가를 안 씀 — 후보 표의 몸값 · 1주 값 · 거래대금을 크게 바꿔도 같은 곳(멍거 「기다림」 · 새 결산이 담긴 모음이 들어와야 바뀜)
    const N = JSON.parse(fs.readFileSync(now, 'utf8')); for (const x of N.rows) { x.capEok = 1; if (x.px) { x.px.close = 1; x.px.atvEok = 0; } x.per = 999; }
    fs.writeFileSync(path.join(tmp, 'now2.json'), JSON.stringify(N));
    r = spawnSync('python3', ['scripts/atlas11/t365/munger.py', path.join(tmp, 'now2.json'), path.join(tmp, 'b')], {cwd: ROOT, encoding: 'utf8'}); assert.equal(r.status, 0, r.stderr);
    const b = JSON.parse(fs.readFileSync(path.join(tmp, 'b', 'proposal.json'), 'utf8')); assert.deepEqual(b.picked.map(p => p.code), a.picked.map(p => p.code));
  } finally { fs.rmSync(tmp, {recursive: true, force: true}); }
});
