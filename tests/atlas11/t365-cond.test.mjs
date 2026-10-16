// 조건 찾기 탭(사장님 2026-10-15(싱가포르) 23:53 「엘셀처럼 찾는 조건을 3가지 걸수 하자 … 업데이트 탭 빼고 … 속은 정밀하나 사용은 정말 감편하게」 · 23:54 「가」 · 규칙 72 · cd-v1)
//   ① 지금 자료의 cond.json — 따로 세기(cond_verify.mjs · 노드)가 틀림 0 · 기본 짝(큰 회사가 오른 업종 · 대장주 · 5일 10% 넘게 오른 곳 빼기) 단계 수
//   ② 따로 세기가 일부러 틀린 사본(업종 · 회사 칸 · 날)을 모두 잡음
//   ③ 화면 코드 — 아래 탭 「조건」(업데이트 탭 자리) · 칸 셋 고르기(결정표 v2: 5 · 5 · 4) · 기본 · 쓰지 않을 말 0 · 정직 두 줄
//   ④ 점검용 길 지도 — 조건 탭은 아래 탭(1번) · 처음 결과 줄이 회사 3단 · 업데이트 기록은 도움말(?)에서
//   ⑤ 업데이트(roll.mjs) — 셈 → 따로 세기 → 멈추면 cond.json 을 빼고 올림
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {spawn} from 'node:child_process';
import {siteGraph, condDefaultX} from '../../scripts/atlas11/t365/inspect4.mjs';
const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), '../..');
const DATA = path.join(ROOT, 'site/atlas/data');
const J = f => JSON.parse(fs.readFileSync(f, 'utf8'));
const verify = (dir, out) => new Promise(res => {
  const p = spawn('node', ['scripts/atlas11/t365/cond_verify.mjs', dir, out], {cwd: ROOT});
  let s = ''; p.stdout.on('data', x => { s += x; }); p.stderr.on('data', x => { s += x; });
  p.on('close', code => res({code, log: s.slice(-600), rep: fs.existsSync(out) ? J(out) : null}));
});
const linkDir = tmp => { for (const f of fs.readdirSync(DATA)) if (f !== 'cond.json') fs.symlinkSync(path.join(DATA, f), path.join(tmp, f)); };

test('조건 찾기 — 지금 자료가 따로 세기와 같음 · 짝 100 · 기본 짝', async () => {
  const X = J(path.join(DATA, 'cond.json')), core = J(path.join(DATA, 'core.json'));
  assert.equal(X.version, 'cd-v1'); assert.equal(X.asOf, core.asOf); assert.equal(X.co.c.length, X.n);
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 't365-cond-'));
  try {
    const r = await verify(DATA, path.join(tmp, 'v.json'));
    assert.equal(r.code, 0, r.log); assert.equal(r.rep.fails, 0); assert.equal(r.rep.combos, 100);
    assert.equal(r.rep.default.k, 'big-lead-nos'); assert.equal(r.rep.default.steps[0], X.n);
    assert.ok(r.rep.default.steps.every((x, k, a) => k === 0 || x <= a[k - 1]), '단계마다 줄거나 같음');
  } finally { fs.rmSync(tmp, {recursive: true, force: true}); }
});

test('조건 찾기 — 따로 세기가 일부러 틀린 사본을 모두 잡음', async () => {
  const X0 = J(path.join(DATA, 'cond.json'));
  const cases = [
    [o => { const k = o.ind.findIndex(x => x.rc === 1); o.ind[k].rc = 0; }, '큰 회사가 오른 업종 rc'],
    [o => { const k = o.ind.findIndex(x => x.rise === 1); o.ind[k].rise = 0; }, '요즘 오르는 업종 rise'],
    [o => { const j = o.co.rk.indexOf(1); o.co.rk[j] = 2; }, '업종 안 몸값 차례 rk'],
    [o => { const j = o.co.x5.indexOf(1); o.co.x5[j] = 0; }, '5일 10% x5'],
    [o => { const j = o.co.f3.indexOf(1); o.co.f3[j] = null; }, '3해 모두 돈 번 곳 f3'],
    [o => { const j = o.co.r5.findIndex(x => x != null); o.co.r5[j] += 0.01; }, '5일 % r5'],
    [o => { o.asOf = '2026-01-02'; }, '날'],
  ];
  for (const [mut, what] of cases) {
    const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 't365-cond-m-'));
    try {
      linkDir(tmp); const o = JSON.parse(JSON.stringify(X0)); mut(o); fs.writeFileSync(path.join(tmp, 'cond.json'), JSON.stringify(o));
      const r = await verify(tmp, path.join(tmp, 'v.json'));
      assert.equal(r.code, 1, `${what} — 잡지 못함`); assert.ok(r.rep.fails > 0, what);
    } finally { fs.rmSync(tmp, {recursive: true, force: true}); }
  }
});

test('조건 찾기 — 화면 코드: 아래 탭 「조건」 · 칸 셋 고르기 · 기본 · 쓰지 않을 말 0', () => {
  const html = fs.readFileSync(path.join(ROOT, 'site/atlas/index.html'), 'utf8'), js = fs.readFileSync(path.join(ROOT, 'site/atlas/atlas.js'), 'utf8');
  assert.match(html, /<a href="#\/cond" id="tabCond">조건<\/a>/); assert.doesNotMatch(html, /id="tabUp"/, '업데이트 탭은 뺌(23:54 「가」)');
  assert.match(js, /const CD_DEF = \{a: 'big', b: 'lead', c: 'nos'\}/);
  const blk = js.slice(js.indexOf('// ════ 조건 찾기 탭'), js.indexOf('function cdPick('));
  const ops = k => [...blk.matchAll(new RegExp(`\\{k: '${k}'[^\\n]*`, 'g'))][0][0].match(/\['([a-z0-9]+)', '/g).map(x => x.slice(2, -4));
  assert.deepEqual(ops('a'), ['big', 'rise', 'up', 'dn', 'all']); assert.deepEqual(ops('b'), ['lead', 'top3', 'f3', 'pick', 'all']); assert.deepEqual(ops('c'), ['nos', 'spike', 'loss', 'all']);
  const shown = [...blk.matchAll(/'([^'\n]*[가-힣][^'\n]*)'/g)].map(m => m[1]).join('\n').split('급등 탭').join(' ');
  for (const w of ['추천', '매수', '매도', '사라', '팔라', '예측', '확률', '유망', '기회', '신호', '저평가', '1위', 'TOP']) assert.ok(!shown.includes(w), `쓰지 않을 말 「${w}」`);
  assert.ok(!/급등/.test(shown), '「급등」은 탭 이름으로만');
  assert.ok(blk.includes("'사고팔 곳을 고른 목록이 아니에요.'") && blk.includes("'지난 값일 뿐 앞날을 말하지 않아요.'"), '정직 두 줄');
  assert.match(js, /href: '#\/up', text: '업데이트 기록 보기 ›'/, '업데이트 기록은 도움말(?)에서');
});

test('조건 찾기 — 점검용 길 지도: 아래 탭 · 처음 결과 줄이 회사 3단', () => {
  const S = {core: J(path.join(DATA, 'core.json')), comp: J(path.join(DATA, 'comp.json')), range: J(path.join(DATA, 'range.json')), lines: J(path.join(DATA, 'lines.json')), home: fs.existsSync(path.join(DATA, 'home.json')) ? J(path.join(DATA, 'home.json')) : null};
  S.codes = Object.keys(S.comp.companies); S.gid = new Map(S.core.groups.map(g => [g.id, g])); S.iby = new Map(S.core.industries.map(i => [i.name, i]));
  S.mkt = S.core.mkt ? J(path.join(DATA, 'mkt.json')) : null; S.mk = S.mkt?.companies ?? null; S.cond = J(path.join(DATA, 'cond.json'));
  for (const f of ['surge', 'surgecal', 'surgetr']) { const p = path.join(DATA, f + '.json'); if (fs.existsSync(p)) S[f === 'surgetr' ? 'tr' : f] = J(p); }
  const [res, q] = condDefaultX(S);
  assert.ok(res.length > 0 && res.length <= 20, '처음 결과 줄(20곳까지)');
  const {nodes} = siteGraph(S), n = nodes.get('#/cond');
  assert.ok(n, '#/cond 화면'); for (const c of [...res, ...q]) assert.ok(n.links.some(l => l.endsWith('/' + c)), `${c} 고리`);
  for (const [r, v] of nodes) assert.ok(v.links.includes('#/cond'), `${r} 아래 탭에 조건`);
});

test('조건 찾기 — 업데이트(roll.mjs): 셈 → 따로 세기 → 멈추면 cond.json 을 뺌', () => {
  const s = fs.readFileSync(path.join(ROOT, 'scripts/atlas11/t365/roll.mjs'), 'utf8');
  const i1 = s.indexOf("run('조건 찾기 셈', 'python3', ['scripts/atlas11/t365/cond.py', out]"), i2 = s.indexOf("run('조건 찾기 따로 세기', 'node', ['scripts/atlas11/t365/cond_verify.mjs', out");
  assert.ok(i1 > 0 && i2 > i1, '셈 뒤 따로 세기'); assert.ok(/await fs\.rm\(path\.join\(out, 'cond\.json'\), \{force: true\}\)/.test(s.slice(i2, i2 + 800)), '멈추면 cond.json 을 뺌');
});
