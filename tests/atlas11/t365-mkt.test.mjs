// 모든 회사(사장님 2026-10-14 12:01(싱가포르) 「나」 — 「첫 화면부터 모두 모든 회사로 바꿔요. 고른 56곳은 금빛이에요」)
//   ① site_build.py 가 지금 판(universe.json 모음 · 이어 받은 일봉 없이)으로 만든 자료 — 갈래 · 업종 · 모든 회사(core.mkt) · mkt.json = 모음의 회사 주식(보통주) 모두 ·
//      고른 곳(멍거 · 린치 조건)은 금빛(p · pk) · core.all 은 고른 곳 전체 그대로 · 고른 곳 선 = lines.json — 를 site_verify.mjs 가 노드로 따로 다시 세면 틀림 0
//   ② 일부러 틀린 사본(선 정수 하나 +1 · 회사 하나를 다른 업종으로 · 갈래 고른 곳 수 · 몸값 큰 두 곳 이름 · 회사 하나 지움)은 모두 잡고 그 자리를 알림
//   숫자를 박지 않음 — 모음이 바뀌어도 proposal.json 의 수와 맞댐
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {spawn, spawnSync} from 'node:child_process';
const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), '../..');
const ACT = JSON.parse(fs.readFileSync(path.join(ROOT, 'scripts/atlas11/t365/universe.json'), 'utf8'));
const pro = JSON.parse(fs.readFileSync(path.join(ROOT, ACT.dir, 'proposal.json'), 'utf8'));
const ENV = (() => { const e = {...process.env}; delete e.ATLAS_T365_CLOSES; delete e.ATLAS_D365_DIR; return e; })(); // 지금 판 그대로
const J = f => JSON.parse(fs.readFileSync(f, 'utf8'));
const verify = (dir, out) => new Promise(res => {
  const p = spawn('node', ['scripts/atlas11/t365/site_verify.mjs', dir, out], {cwd: ROOT, env: ENV});
  let s = ''; p.stdout.on('data', x => { s += x; }); p.stderr.on('data', x => { s += x; });
  p.on('close', code => res({code, log: s.slice(-600), rep: fs.existsSync(out) ? J(out) : null}));
});

test('모든 회사 — 갈래 · 업종 · mkt.json 따로 세기 틀림 0 · 일부러 틀린 사본은 모두 잡음', async () => {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 't365-mkt-'));
  try {
    const now = path.join(tmp, 'now.json'), data = path.join(tmp, 'data');
    let r = spawnSync('node', ['scripts/atlas11/t365/dump.mjs', ACT.bundle, now, ACT.asOf], {cwd: ROOT, encoding: 'utf8', maxBuffer: 256 << 20, env: ENV}); assert.equal(r.status, 0, r.stderr);
    r = spawnSync('python3', ['scripts/atlas11/t365/site_build.py', now, data], {cwd: ROOT, encoding: 'utf8', maxBuffer: 64 << 20, env: ENV}); assert.equal(r.status, 0, r.stderr);
    const core = J(path.join(data, 'core.json')), mkt = J(path.join(data, 'mkt.json')), lines = J(path.join(data, 'lines.json')).lines;
    const commons = [...pro.picked, ...pro.outside].filter(x => !x.nc).map(x => x.code), picked = pro.picked.map(p => p.code);
    // 모양 — 모든 회사 · 금빛 = 고른 곳 · core.all 은 그대로 고른 곳 전체
    assert.equal(mkt.n, commons.length); assert.equal(Object.keys(mkt.companies).length, commons.length); assert.equal(mkt.pk, picked.length);
    assert.equal(core.mkt.n, commons.length); assert.equal(core.mkt.pk, picked.length); assert.equal(core.all.n, picked.length, 'core.all = 고른 곳 전체');
    assert.equal(core.groups.reduce((s, g) => s + g.n, 0), commons.length); assert.equal(core.industries.reduce((s, i) => s + i.members.length, 0), commons.length);
    assert.equal(core.groups.reduce((s, g) => s + g.pk, 0), picked.length); assert.equal(core.industries.reduce((s, i) => s + i.pk, 0), picked.length);
    for (const c of picked) { assert.equal(mkt.companies[c].p, 1, c); assert.deepEqual(mkt.companies[c].l, lines[c], c); }
    // ① 따로 세기 틀림 0
    const ok = await verify(data, path.join(tmp, 'ok.json'));
    assert.equal(ok.code, 0, ok.log); assert.equal(ok.rep.bad, 0);
    // ② 일부러 틀린 사본 — 사본마다 끝 코드 1 · 그 자리를 알림(원본 자료는 그대로)
    const other = Object.keys(mkt.companies).find(c => !mkt.companies[c].p && mkt.companies[c].l[10] != null);
    const ia = core.industries.find(i => i.members.length >= 3), ib = core.industries.find(i => i.g !== ia.g);
    const cases = [
      ['mkt.json', o => { o.companies[other].l[10] += 1; }, `모든 회사 선 ${other}`],
      ['core.json', o => { o.industries.find(i => i.name === ib.name).members.push(o.industries.find(i => i.name === ia.name).members.pop()); }, `업종 ${ia.name} 회사`],
      ['core.json', o => { o.groups[0].pk += 1; }, `갈래 ${core.groups[0].name} 고른 곳 수`],
      ['core.json', o => { o.facts.bigMkt[0].name += '우'; }, '모든 회사 몸값 큰 두 곳'],
      ['mkt.json', o => { delete o.companies[other]; }, `모든 회사 자료 없음 ${other}`],
    ];
    const run = async ([file, fn, want], k) => {
      const d = path.join(tmp, 'bad' + k); fs.cpSync(data, d, {recursive: true});
      const f = path.join(d, file), o = J(f); fn(o); fs.writeFileSync(f, JSON.stringify(o));
      return [want, await verify(d, path.join(tmp, `bad${k}.json`))];
    };
    const res = [];
    for (let k = 0; k < cases.length; k += 2) res.push(...await Promise.all(cases.slice(k, k + 2).map((x, j) => run(x, k + j)))); // 둘씩(한 번에 1GB 남짓)
    for (const [want, v] of res) {
      assert.equal(v.code, 1, `${want} — 끝 코드 ${v.code} ${v.log}`);
      assert.ok(v.rep.bad > 0 && v.rep.first.some(b => b.what.includes(want)), `${want} — ${JSON.stringify(v.rep.first.slice(0, 3))}`);
    }
  } finally { fs.rmSync(tmp, {recursive: true, force: true}); }
});
