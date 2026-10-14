// 모든 회사 7단(사장님 2026-10-14 17:21(싱가포르) 「그리고 7단 클릭구조 부활 시켜」 · 17:25 「전부다 나오게 해」 · 규칙 62)
//   ① site_build.py 가 모든 회사(모음의 회사 주식)마다 회사 파일 — 고른 곳 밖은 3단 자료(c) · 선(line) · 성장 숫자(이야기 없음 = 조사 전) · core.co7 = 모든 회사
//   ② site_verify.mjs ⑮ 가 따로 세면 틀림 0 · 일부러 틀린 사본(1주 값 · 20거래일 · 선 · 든 까닭 · 회사 파일 지움 · 이야기 끼움)은 모두 잡고 그 자리를 알림
//   ③ 화면 코드 — 회사 고리(cHref) · 옛 밖 칸 주소는 회사로 · 「조사 전」 · 「왜 … 밖인가요?」 · 고른 날 줄은 고른 곳만
//   ④ 점검용 길 지도(inspect4 siteGraph) — 밖 칸 없음 · 모든 회사 3 ~ 7단 · 회사 3번 · n단 n번 안
//   숫자를 박지 않음 — 모음이 바뀌어도 proposal.json 의 수와 맞댐
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {spawn, spawnSync} from 'node:child_process';
import {siteGraph} from '../../scripts/atlas11/t365/inspect4.mjs';
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

test('모든 회사 7단 — 회사 파일 = 모든 회사 · 고른 곳 밖 3단 자료 · 따로 세기 틀림 0 · 일부러 틀린 사본은 모두 잡음 · 길 지도', async () => {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 't365-co7-'));
  try {
    const now = path.join(tmp, 'now.json'), data = path.join(tmp, 'data');
    let r = spawnSync('node', ['scripts/atlas11/t365/dump.mjs', ACT.bundle, now, ACT.asOf], {cwd: ROOT, encoding: 'utf8', maxBuffer: 256 << 20, env: ENV}); assert.equal(r.status, 0, r.stderr);
    r = spawnSync('python3', ['scripts/atlas11/t365/site_build.py', now, data], {cwd: ROOT, encoding: 'utf8', maxBuffer: 64 << 20, env: ENV}); assert.equal(r.status, 0, r.stderr);
    const core = J(path.join(data, 'core.json')), mkt = J(path.join(data, 'mkt.json')), comp = J(path.join(data, 'comp.json')).companies;
    const commons = [...pro.picked, ...pro.outside].filter(x => !x.nc).map(x => x.code).sort(), picked = new Set(pro.picked.map(p => p.code));
    // ① 모양
    const files = fs.readdirSync(path.join(data, 'co')).filter(f => f.endsWith('.json')).map(f => f.slice(0, -5)).sort();
    assert.deepEqual(files, commons, '회사 파일 = 모음의 회사 주식 모두');
    assert.equal(core.co7, commons.length, 'core.co7 = 모든 회사');
    const others = commons.filter(c => !picked.has(c)); assert.ok(others.length > 0);
    const one = others.find(c => mkt.companies[c].l.some(x => x != null)), co = J(path.join(data, 'co', one + '.json'));
    assert.equal(co.c.name, mkt.companies[one].n); assert.deepEqual(co.line, mkt.companies[one].l); assert.equal(co.c.chg, mkt.companies[one].c);
    assert.equal(co.c.pick, null, '고른 곳 밖 — 든 까닭 없음'); assert.equal(co.grow?.story ?? null, null, '고른 곳 밖 — 이야기 없음(조사 전)');
    for (const c of [...picked].slice(0, 5)) { const x = J(path.join(data, 'co', c + '.json')); assert.equal(x.c, undefined, '고른 곳 회사 파일은 그대로(3단 자료는 comp.json)'); assert.ok(comp[c]); }
    // ② 따로 세기 틀림 0 · 일부러 틀린 사본
    const ok = await verify(data, path.join(tmp, 'ok.json'));
    assert.equal(ok.code, 0, ok.log); assert.equal(ok.rep.bad, 0);
    const coF = c => path.join('co', c + '.json');
    const cases = [
      [coF(one), o => { o.c.price += 10; }, `밖 1주 값 ${one}`],
      [coF(one), o => { o.c.chg = (o.c.chg ?? 0) + 1; }, `밖 20거래일 ${one}`],
      [coF(one), o => { const k = o.line.findIndex(x => x != null); o.line[k] += 1; }, `밖 선 = 모든 회사 선(mkt.json) ${one}`],
      [coF(one), o => { o.c.pick = {tags: ['mg']}; }, `밖 회사에 든 까닭 없음 ${one}`],
      [coF(one), o => { o.grow.story = {shape: '혼자 앞섬'}; }, `밖 성장 이야기 없음(조사 전) ${one}`],
      [coF(one), null, '회사 파일 = 모든 회사(빠짐 · 남는 파일 없음)'],
    ];
    const run = async ([file, fn, want], k) => {
      const d = path.join(tmp, 'bad' + k); fs.cpSync(data, d, {recursive: true});
      const f = path.join(d, file); if (fn) { const o = J(f); fn(o); fs.writeFileSync(f, JSON.stringify(o)); } else fs.rmSync(f);
      return [want, await verify(d, path.join(tmp, `bad${k}.json`))];
    };
    const res = [];
    for (let k = 0; k < cases.length; k += 2) res.push(...await Promise.all(cases.slice(k, k + 2).map((x, j) => run(x, k + j)))); // 둘씩
    for (const [want, v] of res) {
      assert.equal(v.code, 1, `${want} — 끝 코드 ${v.code} ${v.log}`);
      assert.ok(v.rep.bad > 0 && v.rep.first.some(b => b.what.includes(want)), `${want} — ${JSON.stringify(v.rep.first.slice(0, 3))}`);
    }
    // ④ 점검용 길 지도 — 밖 칸 없음 · 모든 회사 3 ~ 7단 · 회사 3번 · n단 n번 안
    const S = {core, comp: J(path.join(data, 'comp.json')), range: {}, home: null, mkt}; S.codes = Object.keys(S.comp.companies); S.mk = mkt.companies;
    S.gid = new Map(core.groups.map(g => [g.id, g])); S.iby = new Map(core.industries.map(i => [i.name, i]));
    const {nodes, depth} = siteGraph(S);
    assert.equal([...nodes.keys()].filter(x => x.startsWith('#/x/')).length, 0, '모든 회사 7단 — 밖 칸 길 없음');
    for (const c of commons) { assert.ok(depth.get('#/c/' + c) <= 3, `${c} 3번 안`); for (const [sub, n] of [['past', 4], ['rivals', 5], ['grow', 6], ['range', 7]]) assert.ok(depth.get(`#/c/${c}/${sub}`) <= n, `${c} ${n}단 ${n}번 안`); }
    const C3 = nodes.get('#/c/' + one); assert.ok(C3.links.includes(`#/c/${one}/past`), '3단 → 4단 길'); assert.ok(!C3.links.includes(`#/c/${one}/rivals`), '3단에서 5단으로 건너뛰지 않음');
    const ind = core.industries.find(i => i.members.includes(one) && i.n > 1); if (ind) assert.ok(nodes.get('#/i/' + encodeURIComponent(ind.name)).links.includes('#/c/' + one), '업종 줄 → 3단 회사');
  } finally { fs.rmSync(tmp, {recursive: true, force: true}); }
});

test('모든 회사 7단 — 화면 코드(회사 고리 · 옛 밖 칸 주소 · 조사 전 · 왜 밖인가요 · 고른 날 줄)', () => {
  const js = fs.readFileSync(path.join(ROOT, 'site/atlas/atlas.js'), 'utf8');
  assert.match(js, /const cHref = \(c, pk\) => \(D\.core\?\.co7 \|\| pk \? '#\/c\/' : '#\/x\/'\) \+ c;/, '회사 고리 — 모든 회사 7단이면 모두 3단 회사');
  assert.match(js, /if \(xc && D\.core\.co7 && D\.mkt\?\.\[xc\]\) \{ location\.replace\('#\/c\/' \+ xc\); return; \}/, '옛 밖 칸 주소(회사 주식)는 3단 회사로');
  assert.match(js, /세 팀 이야기는 조사 전입니다/, '고른 곳 밖 — 이야기 「조사 전」');
  assert.match(js, /h2', \{text: `왜 \$\{pickName\(C\)\} 밖인가요\?`\}/, '고른 곳 밖 3단 — 왜 밖인가요?');
  assert.match(js, /noPick: !E\.pk/, '고른 날 금빛 줄은 고른 곳만');
  for (const f of ['viewCompany', 'viewPast', 'viewRivals', 'viewGrow']) { const a = js.indexOf(`async function ${f}(`); assert.match(js.slice(a, a + 200), /const E = await coEntry\(code\);\s*if \(!E\) return viewMissing\(v, code\);/, `${f} — 모든 회사(coEntry) · 없으면 없는 주소`); }
  const a = js.indexOf('async function viewRange('); assert.match(js.slice(a, a + 600), /k = E\.pk \? K\.companies\[code\] : K\.others\?\.\[code\]/, '7단 — 고른 곳 밖은 others 범위');
});
