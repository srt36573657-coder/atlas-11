// 요즘 오르는 업종(사장님 2026-10-14(싱가포르) 19:54 「이 곳은 상승 추세에 업종이 있게해 11개 업종 알겠지」 · 19:58 「아니 요즘 오르는중은 업종」 · 20:01 「1주일로 해」 · 규칙 64)
//   ① 지금 자료의 core.rise — 업종 선(v)에서 1주(마지막 5거래일)를 다시 세면 오른 업종 수 · 차례 · 1주 % · 줄 선 · 위 단 평균이 같음 · 많이 오른 순 11개까지
//   ② site_verify.mjs ⑯ — 일부러 틀린 사본(차례 바꿈 · 오른 수 · 1주 % · 자료 없음)은 모두 잡고 그 자리를 알림
//   ③ 화면 코드 — 첫 화면 경주판 = 요즘 오르는 업종(1주 6칸 선) · 큰 갈래는 한 줄 고리 · 「큰 회사는 크게」 단추 없음
//   ④ 점검용 길 지도 — 첫 화면에서 오른 업종 · 큰 갈래 10개가 모두 1번
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {spawn} from 'node:child_process';
import {siteGraph} from '../../scripts/atlas11/t365/inspect4.mjs';
const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), '../..');
const DATA = path.join(ROOT, 'site/atlas/data');
const ENV = (() => { const e = {...process.env}; delete e.ATLAS_T365_CLOSES; delete e.ATLAS_D365_DIR; return e; })();
const J = f => JSON.parse(fs.readFileSync(f, 'utf8'));
const verify = (dir, out) => new Promise(res => {
  const p = spawn('node', ['scripts/atlas11/t365/site_verify.mjs', dir, out], {cwd: ROOT, env: ENV});
  let s = ''; p.stdout.on('data', x => { s += x; }); p.stderr.on('data', x => { s += x; });
  p.on('close', code => res({code, log: s.slice(-600), rep: fs.existsSync(out) ? J(out) : null}));
});

test('요즘 오르는 업종 — 지금 자료가 업종 선에서 다시 센 1주와 같음 · 11개까지', () => {
  const c = J(path.join(DATA, 'core.json')), RI = c.rise, W = c.dates.length, K5 = W - 1 - RI.days;
  assert.equal(RI.days, 5); assert.equal(RI.max, 11); assert.equal(RI.min, 0.05); assert.equal(RI.from, c.dates[K5]); assert.equal(RI.to, c.asOf); assert.equal(RI.of, c.industries.length);
  const c5 = v => Math.round((v[W - 1] / v[K5] - 1) * 10000 + 1e-7) / 100;
  const want = c.industries.map(i => [i.name, c5(i.v)]).filter(x => x[1] >= RI.min).sort((a, b) => b[1] - a[1] || (a[0] < b[0] ? -1 : 1));
  assert.equal(RI.n, want.length, '오른 업종 수');
  assert.ok(RI.list.length === Math.min(11, RI.n), '많이 오른 순 11개까지 · 적은 날은 있는 만큼');
  RI.list.forEach((r, k) => { assert.equal(r.name, want[k][0], `${k + 1}번째`); assert.ok(Math.abs(r.chg - want[k][1]) <= 0.011, r.name); assert.equal(r.v.length, 6); assert.equal(r.v[0], 100); assert.ok(r.chg > 0); });
  assert.equal(RI.all.length, 6); assert.equal(RI.all[0], 100);
});

test('요즘 오르는 업종 — 따로 세기가 일부러 틀린 사본을 모두 잡음', async () => {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 't365-rise-'));
  try {
    const c0 = J(path.join(DATA, 'core.json'));
    const cases = [
      [o => { if (o.rise.list.length > 1) [o.rise.list[0], o.rise.list[1]] = [o.rise.list[1], o.rise.list[0]]; else o.rise.list[0].chg += 1; }, '요즘 오르는 업종 — 차례 · 1주 %'],
      [o => { o.rise.n += 1; }, '요즘 오르는 업종 — 오른 업종 수'],
      [o => { o.rise.list.at(-1).v[3] += 0.5; }, `요즘 오르는 업종 선 ${c0.rise.list.at(-1).name}`],
      [o => { delete o.rise; }, '요즘 오르는 업종(core.rise) 없음'],
    ];
    const run = async ([fn, want], k) => {
      const d = path.join(tmp, 'bad' + k); fs.mkdirSync(d);
      for (const f of fs.readdirSync(DATA)) { const p = path.join(DATA, f); if (fs.statSync(p).isFile()) fs.copyFileSync(p, path.join(d, f)); else fs.symlinkSync(p, path.join(d, f)); } // 회사 파일 폴더는 그대로 이음(고치지 않음)
      const o = J(path.join(d, 'core.json')); fn(o); fs.writeFileSync(path.join(d, 'core.json'), JSON.stringify(o));
      return [want, await verify(d, path.join(tmp, `bad${k}.json`))];
    };
    const res = [];
    for (let k = 0; k < cases.length; k += 2) res.push(...await Promise.all(cases.slice(k, k + 2).map((x, j) => run(x, k + j))));
    for (const [want, v] of res) {
      assert.equal(v.code, 1, `${want} — 끝 코드 ${v.code} ${v.log}`);
      assert.ok(v.rep.bad > 0 && v.rep.first.some(b => b.what.includes(want)), `${want} — ${JSON.stringify(v.rep.first.slice(0, 3))}`);
    }
  } finally { fs.rmSync(tmp, {recursive: true, force: true}); }
});

test('요즘 오르는 업종 — 화면 코드 · 길 지도(오른 업종 · 큰 갈래 모두 1번)', () => {
  const js = fs.readFileSync(path.join(ROOT, 'site/atlas/atlas.js'), 'utf8');
  // 첫 화면 = 먹빛 판(사장님 2026-10-15 09:41 · 규칙 67) — 요즘 오르는 업종 칸(m4rise · 줄마다 업종 화면) · 큰 갈래 칸(m4groups · 7단 중 1단 1번) · 「큰 회사는 크게」 단추 없음
  const a = js.indexOf('// ── 첫 화면 = 먹빛 판'), b = js.indexOf('// ── 화면 ② 갈래 ──', a), home = js.slice(a, b);
  assert.ok(a > 0 && b > a, '먹빛 첫 화면 코드');
  assert.match(home, /function m4rise\(v\)/); assert.match(home, /m4head\('h2', '요즘 오르는 업종'/); assert.match(home, /href = i \? hrefInd\(i\) : '#\/list'/); assert.match(home, /RI\??\.list/);
  assert.match(home, /function m4groups\(v\)/); assert.match(home, /href: '#\/g\/' \+ g\.id/);
  assert.ok(!/\bseg\(/.test(home), '첫 화면에 「큰 회사는 크게」 단추 없음'); assert.ok(!/C\.groups\.map\(g => \(\{key: g\.id/.test(home), '큰 갈래 경주 줄 없음');
  assert.match(js, /function race\(host, \{items, parent, wide = false, label, onTick, onDone, auto = false, n: nDays = null\}\)/);
  const c = J(path.join(DATA, 'core.json'));
  const S = {core: c, comp: J(path.join(DATA, 'comp.json')), range: {}, home: null, mkt: c.mkt ? J(path.join(DATA, 'mkt.json')) : null}; S.codes = Object.keys(S.comp.companies); S.mk = S.mkt?.companies ?? null;
  S.gid = new Map(c.groups.map(g => [g.id, g])); S.iby = new Map(c.industries.map(i => [i.name, i]));
  const {nodes, depth} = siteGraph(S), L = nodes.get('#/').links;
  for (const r of c.rise.list) { const i = S.iby.get(r.name), hf = i.n > 1 ? '#/i/' + encodeURIComponent(i.name) : '#/c/' + i.members[0]; assert.ok(L.includes(hf), r.name); assert.equal(depth.get(hf), 1, r.name); }
  for (const g of c.groups) { assert.ok(L.includes('#/g/' + g.id), g.short); assert.equal(depth.get('#/g/' + g.id), 1, `${g.short} — 7단 중 1단은 1번`); }
});
