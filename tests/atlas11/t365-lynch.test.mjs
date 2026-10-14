// 멍거 · 린치 조건(ml-v1) — 사장님 2026-10-14 05:37(싱가포르) 「세계적인 주식투자 2인을 더 찾아 내 봐」 · 06:03 「가」 · 06:05 「가」(멍거 26곳과 린치 18곳을 함께 · 겹치면 한 번)
//   ① 린치 작은 보기(파이썬 judge 그대로): 20 ~ 25% 선 · 점수 2 선 · 적자 해 · 빈 값 · PER 빔 · 배당 없음
//   ② 10월 10일 모음 · 10월 8일 값: 41곳(멍거 26 · 린치 18 · 둘 다 3) · 노드 따로 세기 틀림 0 · 값을 바꾸면 따로 세기가 잡음
//   ③ 이어 받은 일봉(회차 날 값)이 바뀌어도 같은 곳 — 린치의 값은 모음 날 값
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {spawnSync} from 'node:child_process';
const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), '../..');
const ACT = JSON.parse(fs.readFileSync(path.join(ROOT, 'scripts/atlas11/t365/universe.json'), 'utf8'));
const OLD = {bundle: 'reports/atlas11/universe/2026-10-10/bundle.json.gz', asOf: '2026-10-08', dir: 'reports/atlas11/universe/2026-10-14-munger-lynch'}; // 10월 10일 모음(숫자를 박은 시험은 이 모음으로 고정 — 2026-10-14 「전 종목」부터 universe.json 은 새 모음)
const OLDENV = {...process.env, ATLAS_BUNDLE: OLD.bundle};
const py = code => { const r = spawnSync('python3', ['-c', code], {cwd: path.join(ROOT, 'scripts/atlas11/t365'), encoding: 'utf8'}); assert.equal(r.status, 0, r.stderr); return JSON.parse(r.stdout.trim().split('\n').at(-1)); };

test('린치 작은 보기 — 20 ~ 25% · 점수 2 · 적자 · 빈 값', () => {
  const out = py(`
import json, lynch
def x(e0, e2, d2=0, px=10000, keys=('202312','202412','202512')):
    return {'keys': list(keys), 'eps': [e0, 1, e2], 'dps': [0, 0, d2], 'px': px, 'pxDay': '2026-10-08'}
cases = {
  'A': ({'per': 5}, x(1000, 1500)),          # 22.47% · 점수 4.49 → in
  'B': ({'per': 5}, x(1000, 1400)),          # 18.32% → g
  'C': ({'per': 5}, x(1000, 1600)),          # 26.49% → g
  'D': ({'per': 12}, x(1000, 1500)),         # 22.47 ÷ 12 = 1.87 → peg
  'E': ({'per': 12}, x(1000, 1500, 300)),    # (22.47 + 3) ÷ 12 = 2.12 → in(배당이 넘김)
  'F': ({'per': 5}, x(-10, 1500)),           # 첫 해 적자 → loss
  'G': ({'per': 5}, x(None, 1500)),          # 빈 값 → q
  'H': ({'per': None}, x(1000, 1500)),       # PER 빔 → q
  'I': ({'per': 5}, x(1000, 1500, keys=('202412','202512'))),  # 3해 없음 → q
  'J': ({'per': 5}, x(1000, 1441)),          # 20.04% 선 바로 위 → in
}
res = {k: lynch.judge(r, v) for k, (r, v) in cases.items()}
print(json.dumps({k: [s, w] for k, (s, w, v) in res.items()}, ensure_ascii=False))
`);
  assert.deepEqual(Object.fromEntries(Object.entries(out).map(([k, v]) => [k, v[0]])), {A: 'in', B: 'g', C: 'g', D: 'peg', E: 'in', F: 'loss', G: 'q', H: 'q', I: 'q', J: 'in'});
  assert.match(out.B[1], /18\.3% 큼 — 20 ~ 25% 밖/); assert.match(out.D[1], /= 1\.87 — 2 밑/);
});

test('10월 10일 모음 — 41곳 · 두 갈래 셈 · 노드 따로 세기 틀림 0 · 값을 바꾸면 잡음 · 이어 받은 값으로 안 바뀜', () => {
  assert.equal(ACT.version, 'ml-v1');
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'ml-'));
  try {
    const now = path.join(tmp, 'now.json');
    let r = spawnSync('node', ['scripts/atlas11/t365/dump.mjs', OLD.bundle, now, OLD.asOf], {cwd: ROOT, encoding: 'utf8', maxBuffer: 64 << 20}); assert.equal(r.status, 0, r.stderr);
    r = spawnSync('python3', ['scripts/atlas11/t365/ml.py', now, path.join(tmp, 'a')], {cwd: ROOT, encoding: 'utf8', env: OLDENV}); assert.equal(r.status, 0, r.stderr);
    const a = JSON.parse(fs.readFileSync(path.join(tmp, 'a', 'proposal.json'), 'utf8')), c = a.counts;
    assert.deepEqual([c.universe, c.picked, c.mg.picked, c.ly.picked, c.both], [1378, 41, 26, 18, 3]);
    assert.deepEqual([c.ly.q, c.ly.known, c.ly.l0, c.ly.l1], [89, 1289, 762, 31]);
    assert.equal(a.rules.version, 'ml-v1'); assert.equal(a.rules.line, '멍거 조건 26곳 · 린치 조건 18곳 · 둘 다 3곳'); assert.equal(a.rules.groups.length, 2);
    assert.match(a.rules.notMunger, /멍거 · 린치가 고른 목록이 아닙니다/);
    for (const p of a.picked) {
      assert.ok(p.tags.length >= 1);
      if (p.tags.includes('ly')) { assert.ok(p.ly.g >= 20 && p.ly.g <= 25 && p.ly.score >= 2 && p.ly.pxDay === OLD.asOf, p.name); } else assert.equal(p.ly, null);
      if (p.tags.includes('mg')) assert.ok(p.mg.roe.every(x => x >= 18) && p.mg.debt.every(x => x <= 100), p.name); else assert.equal(p.mg, null);
    }
    const tags = Object.fromEntries(a.picked.map(p => [p.name, p.tags.join('+')]));
    assert.equal(tags['시프트업'], 'mg+ly'); assert.equal(tags['JYP Ent.'], 'mg+ly'); assert.equal(tags['감성코퍼레이션'], 'mg+ly'); assert.equal(tags['한국단자'], 'ly'); assert.equal(tags['에이피알'], 'mg');
    // 10월 10일 모음으로 고른 판(저장소)과 같은 곳 · 같은 차례
    const base = JSON.parse(fs.readFileSync(path.join(ROOT, OLD.dir, 'proposal.json'), 'utf8')); assert.deepEqual(a.picked.map(p => p.code), base.picked.map(p => p.code));
    r = spawnSync('node', ['scripts/atlas11/t365/ml_verify.mjs', now, path.join(tmp, 'a', 'proposal.json'), path.join(tmp, 'v.json')], {cwd: ROOT, encoding: 'utf8', maxBuffer: 64 << 20, env: OLDENV}); assert.equal(r.status, 0, r.stdout + r.stderr); assert.match(r.stdout, /틀림 0/);
    // 값을 바꾸면 따로 세기가 잡음 — ① 린치만 든 곳의 점수 ② 밖 회사 하나의 린치 멈춘 자리 ③ 꼬리표
    const lyOnly = a.picked.findIndex(p => p.tags.join() === 'ly');
    const bad1 = JSON.parse(JSON.stringify(a)); bad1.picked[lyOnly].ly.score = 1.5; fs.writeFileSync(path.join(tmp, 'bad1.json'), JSON.stringify(bad1));
    r = spawnSync('node', ['scripts/atlas11/t365/ml_verify.mjs', now, path.join(tmp, 'bad1.json')], {cwd: ROOT, encoding: 'utf8', maxBuffer: 64 << 20, env: OLDENV}); assert.equal(r.status, 1, '린치 점수를 바꾸면 잡힘');
    const bad2 = JSON.parse(JSON.stringify(a)); bad2.outside[0].ly.s = bad2.outside[0].ly.s === 'g' ? 'peg' : 'g'; fs.writeFileSync(path.join(tmp, 'bad2.json'), JSON.stringify(bad2));
    r = spawnSync('node', ['scripts/atlas11/t365/ml_verify.mjs', now, path.join(tmp, 'bad2.json')], {cwd: ROOT, encoding: 'utf8', maxBuffer: 64 << 20, env: OLDENV}); assert.equal(r.status, 1, '린치 멈춘 자리를 바꾸면 잡힘');
    const bad3 = JSON.parse(JSON.stringify(a)); bad3.picked[0].tags = ['ly']; fs.writeFileSync(path.join(tmp, 'bad3.json'), JSON.stringify(bad3));
    r = spawnSync('node', ['scripts/atlas11/t365/ml_verify.mjs', now, path.join(tmp, 'bad3.json')], {cwd: ROOT, encoding: 'utf8', maxBuffer: 64 << 20, env: OLDENV}); assert.equal(r.status, 1, '꼬리표를 바꾸면 잡힘');
  } finally { fs.rmSync(tmp, {recursive: true, force: true}); }
});

test('지금 모음(universe.json) — 다시 고르면 저장소 판과 같은 곳 · 같은 차례 · 노드 따로 세기 틀림 0', () => {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'ml-now-'));
  try {
    const now = path.join(tmp, 'now.json');
    let r = spawnSync('node', ['scripts/atlas11/t365/dump.mjs', ACT.bundle, now, ACT.asOf], {cwd: ROOT, encoding: 'utf8', maxBuffer: 256 << 20}); assert.equal(r.status, 0, r.stderr);
    r = spawnSync('python3', ['scripts/atlas11/t365/ml.py', now, path.join(tmp, 'a')], {cwd: ROOT, encoding: 'utf8', maxBuffer: 64 << 20}); assert.equal(r.status, 0, r.stderr);
    const a = JSON.parse(fs.readFileSync(path.join(tmp, 'a', 'proposal.json'), 'utf8')), base = JSON.parse(fs.readFileSync(path.join(ROOT, ACT.dir, 'proposal.json'), 'utf8'));
    assert.deepEqual(a.picked.map(p => p.code), base.picked.map(p => p.code)); assert.deepEqual(a.counts, base.counts);
    r = spawnSync('node', ['scripts/atlas11/t365/ml_verify.mjs', now, path.join(tmp, 'a', 'proposal.json')], {cwd: ROOT, encoding: 'utf8', maxBuffer: 256 << 20}); assert.equal(r.status, 0, r.stdout + r.stderr); assert.match(r.stdout, /틀림 0/);
  } finally { fs.rmSync(tmp, {recursive: true, force: true}); }
});
