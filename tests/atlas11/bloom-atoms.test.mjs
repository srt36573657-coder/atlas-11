// 낱 조건 156 맞대기 — 사이트 모듈(site/next/bloom-atoms.js)이 연구 셈(scripts/atlas11/research/bloom_evolve.py ATOM_FULL)과 칸 하나까지 같은가
//   파이썬이 남긴 수 · 지문 = reports/atlas11/research/bloom-atoms-fixture.json
//   (python3 scripts/atlas11/research/bloom_evolve.py --atoms-fixture site/atlas/data reports/atlas11/research/bloom-atoms-fixture.json)
//   낱 조건마다 SPROUT & 조건 칸(t ≥ T0)의 수와 지문(Σ ((t + 1) × 2654435761 + int(코드, 36)) mod 2^32 · 다시 mod 2^32) · 바탕 넷(COUNT · SPROUT · BASEM · FLOWER)은 마스크 그대로
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {ATOM_IDS, ATOM_FAM, atomBase} from '../../site/next/bloom-atoms.js';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const DATA = path.join(ROOT, 'site/atlas/data');
const FIXTURE = path.join(ROOT, 'reports/atlas11/research/bloom-atoms-fixture.json');
const CANDS = path.join(ROOT, 'docs/design/bloom-evolve-2026-11-02/candidates.json');
const readJSON = f => JSON.parse(fs.readFileSync(f, 'utf8'));
const U32 = 4294967296;

/** sprout365.py 「자료」 그대로 읽기 — 회사 = mkt.json 가운데 co 파일 있는 곳 · 종가는 k0 만큼 밀어 날에 맞춤 */
function loadData(root) {
  const days = readJSON(path.join(root, 'days.json'));
  const dates = Array.isArray(days) ? days : days.dates || days.days;
  const N = dates.length;
  const companies = readJSON(path.join(root, 'mkt.json')).companies;
  const cond = readJSON(path.join(root, 'cond.json'));
  const caps = new Map();
  cond.co.c.forEach((c, k) => { if (k < cond.co.cap.length) caps.set(c, cond.co.cap[k]); });
  const codes = Object.keys(companies).filter(c => fs.existsSync(path.join(root, 'co', `${c}.json`)));
  const closes = new Map(), fins = new Map();
  for (const c of codes) {
    const d = readJSON(path.join(root, 'co', `${c}.json`));
    const k0 = Math.trunc(Number(d.k0 || 0)), a = new Array(N).fill(null);
    (d.close || []).forEach((v, i) => { const t = i + k0; if (t >= 0 && t < N) a[t] = v; });
    closes.set(c, a);
    if (d.fin) fins.set(c, d.fin);
  }
  return {dates, codes, closes, companies, caps, fins};
}

/** 수 · 지문 — and 가 있으면 두 마스크 모두 참인 칸만 */
function countHash(mask, and, {N, C, T0, cv}) {
  let count = 0, hash = 0;
  for (let t = T0; t < N; t++) {
    const o = t * C, base = (t + 1) * 2654435761;
    let row = 0;
    for (let j = 0; j < C; j++) if (mask[o + j] && (!and || and[o + j])) { count++; row += (base + cv[j]) % U32; }
    hash = (hash + row) % U32;
  }
  return {count, hash};
}

test('낱 조건 156 · 바탕 넷: 사이트 모듈이 파이썬 연구 셈(--atoms-fixture)과 수 · 지문이 모두 같음', () => {
  const t0 = Date.now();
  const fx = readJSON(FIXTURE), cands = readJSON(CANDS);
  assert.equal(fx.schema, 'dori-bloom-atoms-fixture-1');
  assert.deepEqual([...ATOM_IDS], cands.atoms.map(a => a.id), 'ATOM_IDS = candidates.json atoms 차례');
  assert.deepEqual(cands.atoms.filter(a => ATOM_FAM[a.id] !== a.fam).map(a => a.id), [], 'ATOM_FAM = candidates.json fam');
  assert.deepEqual(fx.atoms.map(a => a.id), [...ATOM_IDS], '맞대기 자료도 같은 차례');

  const ctx = atomBase(loadData(DATA));
  const tLoad = Date.now() - t0;
  const stale = `자료(site/atlas/data)가 맞대기 자료와 다름 — python3 scripts/atlas11/research/bloom_evolve.py --atoms-fixture site/atlas/data ${path.relative(ROOT, FIXTURE)} 로 다시 만들 것`;
  assert.equal(ctx.dates[ctx.N - 1], fx.asOf, stale);
  assert.equal(ctx.N, fx.N, stale);
  assert.equal(ctx.C, fx.C, stale);
  const geo = {N: ctx.N, C: ctx.C, T0: fx.T0, cv: ctx.codes.map(c => parseInt(c, 36))};

  const bad = [];
  for (const k of ['COUNT', 'SPROUT', 'BASEM', 'FLOWER']) {
    const got = countHash(ctx[k], null, geo), want = fx.base[k];
    if (got.count !== want.count || got.hash !== want.hash) bad.push({id: k, py: want.count, js: got.count, pyHash: want.hash, jsHash: got.hash});
  }
  const want = new Map(fx.atoms.map(a => [a.id, a]));
  const fams = [...new Set(ATOM_IDS.map(id => ATOM_FAM[id]))];
  for (const f of fams) { // 갈래 하나씩 · 다 세면 큰 담음을 비움(메모리)
    for (const id of ATOM_IDS.filter(i => ATOM_FAM[i] === f)) {
      const got = countHash(ctx.atom(id), ctx.SPROUT, geo), w = want.get(id);
      if (got.count !== w.count || got.hash !== w.hash) bad.push({id, py: w.count, js: got.count, pyHash: w.hash, jsHash: got.hash});
    }
    ctx.drop();
  }
  const secs = ((Date.now() - t0) / 1000).toFixed(1);
  if (bad.length) {
    console.log(`안 맞음 ${bad.length} / ${ATOM_IDS.length + 4}`);
    console.table(bad.map(b => ({...b, diff: b.js - b.py})));
  }
  console.log(`낱 조건 ${ATOM_IDS.length} + 바탕 4 · 맞음 ${ATOM_IDS.length + 4 - bad.length} · 읽기 ${(tLoad / 1000).toFixed(1)}초 · 모두 ${secs}초`);
  assert.deepEqual(bad.map(b => b.id), [], '모든 낱 조건 · 바탕이 파이썬과 같아야 함');
});

test('pair: 짝 이름(a&b)은 두 낱 조건 모두 참 · 낱 이름은 그 조건 그대로(새 배열) · 모르는 이름은 멈춤', () => {
  const dates = ['2026-01-02', '2026-01-05', '2026-01-06'];
  const closes = new Map([['000020', [100, 101, 102]], ['00001A', [0, null, 50]]]);
  const ctx = atomBase({dates, codes: ['000020', '00001A'], closes, companies: {}, caps: new Map(), fins: new Map()});
  assert.deepEqual([...ctx.codes], ['00001A', '000020'], '코드는 글자 차례(파이썬 sorted 와 같음)');
  assert.equal(ctx.col('000020'), 1);
  assert.equal(ctx.col('999999'), -1);
  assert.ok(Number.isNaN(ctx.P[0 * 2 + 0]) && Number.isNaN(ctx.P[1 * 2 + 0]) && ctx.P[2 * 2 + 0] === 50, '0 · null 은 빈 값');
  const a = ctx.atom('px1'), b = ctx.atom('px2'), ab = ctx.pair('px1&px2'), one = ctx.pair('px1');
  for (let i = 0; i < a.length; i++) assert.equal(ab[i], a[i] & b[i]);
  assert.deepEqual([...one], [...a]);
  assert.notEqual(one, a, '새 배열');
  assert.equal(ctx.atom('isz2')[0], 1, '업종 밖 회사는 ISZ = 0(파이썬 처음 값) → 열다섯 곳 아래 참');
  assert.throws(() => ctx.atom('nope'), /BLOOM_ATOM_UNKNOWN/);
});
