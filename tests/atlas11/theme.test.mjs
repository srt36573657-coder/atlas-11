// 테마 시계 셈 시험(site/next/theme-engine.js · 결정표 docs/design/theme-2026-10-19/theme-engine.md v1.1 · 사장님 2026-10-19 16:54 「더 스마트한 내부 시스템」)
//   node --test tests/atlas11/theme.test.mjs — 작은 가짜 자료로 잣대 하나하나 + 저장소 자료로 파일 꼴(있을 때만)
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {zoneOf, indexOf, exOf, dotsAt, jumpy, computeTheme, sproutCmp, pp, nearBar, RULE, THEME_SCHEMA, coZoneOf} from '../../site/next/theme-engine.js';
import {build} from '../../scripts/atlas11/next/build/theme.mjs';

test('자리 — 꽃 선(가로 5) · 세로 0 경계', () => {
  assert.equal(zoneOf(5, 0), 'B');
  assert.equal(zoneOf(5, -0.0001), 'W');
  assert.equal(zoneOf(4.9999, 0), 'S');
  assert.equal(zoneOf(4.9999, -0.0001), 'Q');
  assert.equal(zoneOf(NaN, 1), null);
});

test('지수 — 같은 무게 · 하루 |r| ≥ 0.35 는 그날 뺌 · 값 없는 날은 뺌', () => {
  const a = [100, 110, 110], b = [100, 100, 150], c = [0, 100, 100]; // b 둘째 날 +50% = 뺌 · c 첫날 값 없음
  const I = indexOf([a, b, c], 3);
  assert.equal(I[0], 100);
  assert.ok(Math.abs(I[1] - 105) < 1e-9); // (10% + 0%) / 2 — c 는 첫날 값이 없어 뺌
  assert.ok(Math.abs(I[2] - 105) < 1e-9); // a 0% · b +50% 뺌 · c 0% → 평균 0
});

test('튄 회사 — 열흘 안 하루 35% 넘게 바뀌면 참', () => {
  const a = Array.from({length: 30}, () => 100); a[25] = 136;
  assert.equal(jumpy(a, 29), true);
  assert.equal(jumpy(a, 24), false);
  assert.equal(jumpy(a, 35 - 1), true); // t − 9 = 25 는 아직 안
});

test('점 넷 — 힘(y ≥ 2) · 번짐(정확히 +2% 는 아님) · 큰 회사 평균 ≥ 1% · 진짜 오름', () => {
  const N = 30, M = Float64Array.from({length: N}, () => 100);
  const flat = () => Array.from({length: N}, () => 100);
  const up = k => { const a = flat(); for (let t = N - 10; t < N; t++) a[t] = 100 + k; return a; }; // 열흘 전 100 → 오늘 100 + k
  const cs = [up(3), up(3), up(2), flat()]; // +3 · +3 · 정확히 +2(넘지 않음) · 0 → 2/4 = 절반 → 참
  const I = indexOf(cs, N);
  const r = dotsAt({I, M, cs, big: [up(1), up(1)]}, N - 1);
  assert.equal(r.tot, 4); assert.equal(r.up, 2);
  assert.deepEqual(r.dots, [false, true, true, true]); // y = 0(닷새 전부터 같은 값) · 번짐 참 · 큰 회사 +1% · 오름
  const r2 = dotsAt({I, M, cs: [up(3), flat(), flat()], big: [flat()]}, N - 1);
  assert.deepEqual(r2.dots.slice(1, 3), [false, false]);
});

test('싹 순서 — 점 수 → 지난 닷새 힘 → 이름', () => {
  const xs = [{n: '나', sc: 3, y: 5}, {n: '가', sc: 4, y: 1}, {n: '다', sc: 3, y: 5}, {n: '라', sc: 3, y: 6}];
  assert.deepEqual(xs.sort(sproutCmp).map(x => x.n), ['가', '라', '나', '다']);
});

test('글 꼴 — %p 한 자리 · 꽃까지 막대', () => {
  assert.equal(pp(2.94), '+2.9'); assert.equal(pp(-0.04), '0.0'); assert.equal(pp(-1.25), '−1.3'); assert.equal(pp(NaN), '?');
  assert.equal(nearBar(5), 1); assert.equal(nearBar(-5), 0); assert.equal(nearBar(0), 0.5);
});

/** 가짜 시장: 업종 셋(회사 다섯씩) · 80일 · 「뜨는」 업종은 끝 닷새에 오름 */
function fake() {
  const N = 80, dates = Array.from({length: N}, (_, i) => new Date(Date.UTC(2026, 0, 1 + i)).toISOString().slice(0, 10));
  const closes = new Map(), companies = {};
  const mk = (code, i, f) => { const a = new Float64Array(N); for (let t = 0; t < N; t++) a[t] = Math.round(f(t)); closes.set(code, a); companies[code] = {n: '회사' + code, i}; };
  for (let k = 0; k < 5; k++) mk('10000' + k, '뜨는 업종', t => 1000 * (t >= N - 5 ? 1 + 0.008 * (t - N + 6) : 1)); // 끝 닷새 +4% — 시장보다 닷새 2%p 넘게 · 한 달 5%p 아래
  for (let k = 0; k < 5; k++) mk('20000' + k, '내리는 업종', t => 1000 * (1 - 0.002 * t));
  for (let k = 0; k < 5; k++) mk('30000' + k, '잔잔한 업종', t => 1000 + (t % 2));
  mk('400000', '작은 업종', () => 1000); // 회사 5곳 아래 = 셈 밖
  const rk = new Map([['100000', 1], ['100001', 2], ['100002', 3], ['200000', 1], ['300000', 1]]);
  const industries = [{name: '뜨는 업종', g: 'a'}, {name: '내리는 업종', g: 'a'}, {name: '잔잔한 업종', g: 'b'}];
  return computeTheme({dates, closes, companies, industries, groups: [{id: 'a', name: '무리 A'}, {id: 'b', name: '무리 B'}], rk, made: '2026-01-01T00:00:00.000Z'});
}

test('회사 자리(결정표 9 · v1.3) — 한 달 · 닷새 시장보다 · 셀 수 없음 둘', () => {
  const N = 30, T = N - 1, M = Float64Array.from({length: N}, () => 100); // 시장 그대로
  const at = f => Float64Array.from({length: N}, (_, t) => f(t));
  const up = at(t => (t >= T - 4 ? 120 : t >= T - 19 ? 110 : 100)); // close(T − 20) 100 · close(T − 5) 110 · close(T) 120 → 한 달 +20% · 닷새 +9.09%
  let v = coZoneOf(up, M, T); assert.equal(v.z, 'B'); assert.ok(Math.abs(v.x - 20) < 1e-9); assert.ok(Math.abs(v.y - (120 / 110 - 1) * 100) < 1e-9);
  v = coZoneOf(at(t => (t >= T - 4 ? 104 : 110)), M, T); assert.equal(v.z, 'Q'); // 한 달 −5.45% · 닷새 −5.45%
  v = coZoneOf(at(t => (t >= T - 4 ? 104 : 100)), M, T); assert.equal(v.z, 'S'); // 한 달 +4% · 닷새 +4% — 꽃 선 앞
  v = coZoneOf(at(t => (t >= T - 4 ? 110 : t >= T - 19 ? 120 : 100)), M, T); assert.equal(v.z, 'W'); // 한 달 +10% · 닷새 −8.3%
  const Mup = at(t => 100 * (1 + 0.01 * t)); v = coZoneOf(up, Mup, T); // 시장이 오르면 앞선 만큼은 줆(나눔 꼴)
  assert.ok(Math.abs(v.x - ((120 / 100) / (Mup[T] / Mup[T - 20]) - 1) * 100) < 1e-9); assert.ok(Math.abs(v.y - ((120 / 110) / (Mup[T] / Mup[T - 5]) - 1) * 100) < 1e-9);
  const gap = at(t => 100); gap[T - 5] = 0; assert.equal(coZoneOf(gap, M, T), null); // 닷새 전 값 없음
  const gap20 = at(t => 100); gap20[T - 20] = 0; assert.equal(coZoneOf(gap20, M, T), null); // 한 달 전 값 없음
  const mid = at(t => 100); mid[T - 10] = 0; assert.equal(coZoneOf(mid, M, T)?.z, 'S'); // 가운데 빈 날은 괜찮음(셋만 봄) · x = y = 0 → 싹(세로 0 은 위쪽)
  const jump = at(t => (t >= T - 19 ? 140 : 100)); assert.equal(coZoneOf(jump, M, T), null); // T − 19 날 +40% = 튄 날
  const jumpOld = at(t => (t >= T - 20 ? 140 : 100)); assert.equal(coZoneOf(jumpOld, M, T)?.z, 'S'); // T − 20 날의 튐은 창 밖(셈 그대로 · x = y = 0)
  assert.equal(coZoneOf(at(() => 100), M, 10), null); // 날이 20일보다 적음
});

test('전체 셈 — 업종 셋 · 작은 업종 뺌 · 뜨는 업종은 싹이고 점 넷 · 자료 꼴', () => {
  const {theme, more, co} = fake();
  assert.equal(theme.schema, THEME_SCHEMA);
  assert.equal(co.schema, THEME_SCHEMA + '-co'); assert.equal(co.asOf, theme.asOf); assert.equal(co.n + co.skip, 16); // 회사 16곳 모두 자리가 있거나 셀 수 없음
  for (const [c, [x, y, z]] of Object.entries(co.co)) { assert.equal(z, zoneOf(x, y) ?? z); assert.ok(['B', 'W', 'S', 'Q'].includes(z), c); }
  assert.deepEqual(theme.inds.map(i => i.n).sort(), ['내리는 업종', '뜨는 업종', '잔잔한 업종']);
  const up = theme.inds.find(i => i.n === '뜨는 업종');
  assert.equal(up.z, 'S'); // 한 달은 아직 5%p 아래 · 닷새 힘 큼 → 꽃 선 앞 싹
  assert.deepEqual(up.dots, [1, 1, 1, 1]); assert.equal(up.sc, 4);
  assert.equal(theme.count.real, 1); assert.equal(theme.order.S[0], '뜨는 업종');
  assert.equal(up.t.length, RULE.tail); assert.equal(up.tz.length, RULE.tail); assert.equal(up.sp.length, RULE.back + 1);
  assert.equal(up.gn, '무리 A');
  const sum = theme.count.S + theme.count.B + theme.count.W + theme.count.Q;
  assert.equal(sum, theme.inds.length);
  assert.equal(theme.days6.length, RULE.tail); assert.equal(theme.days6.at(-1), theme.asOf);
  assert.ok(more.inds['뜨는 업종'].top.length <= RULE.top);
  assert.deepEqual(more.inds['뜨는 업종'].big.map(b => b.rk), [1, 2, 3]);
  const R = theme.record;
  assert.ok(R.all.n > 0 && R.all.p >= 0 && R.all.p <= 100);
  assert.equal(R.byDots.reduce((p, b) => p + b.n, 0), R.sprout.n);
  assert.equal(typeof R.more, 'boolean');
});

test('올릴 때 셈 — 저장소 자료(있을 때만)로 두 파일을 쓰고 꼴이 맞음', async t => {
  const src = path.resolve('site/atlas/data');
  if (!fs.existsSync(path.join(src, 'days.json')) || !fs.existsSync(path.join(src, 'co'))) { t.skip('저장소 자료 없음'); return; }
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'theme-'));
  fs.mkdirSync(path.join(tmp, 'atlas'), {recursive: true}); fs.symlinkSync(src, path.join(tmp, 'atlas', 'data'));
  const line = await build({siteDir: tmp});
  assert.match(line, /업종 \d+곳/);
  const th = JSON.parse(fs.readFileSync(path.join(tmp, 'next/data/theme.json'), 'utf8'));
  const mo = JSON.parse(fs.readFileSync(path.join(tmp, 'next/data/theme-more.json'), 'utf8'));
  assert.equal(th.schema, THEME_SCHEMA); assert.equal(mo.schema, THEME_SCHEMA + '-more');
  assert.ok(th.inds.length >= 50);
  assert.equal(th.order.S.length, th.count.S);
  for (const i of th.inds) { assert.ok(['B', 'W', 'S', 'Q'].includes(i.z)); assert.equal(i.dots.length, 4); assert.ok(mo.inds[i.n]); }
  assert.ok(fs.statSync(path.join(tmp, 'next/data/theme.json')).size < 60_000, '테마 쪽 파일은 60KB 아래');
  const hm = JSON.parse(fs.readFileSync(path.join(tmp, 'next/data/theme-home.json'), 'utf8'));
  assert.equal(hm.schema, 'dori-theme-1-home'); assert.deepEqual(hm.order.S, th.order.S.slice(0, 3)); assert.deepEqual(hm.count, th.count); assert.deepEqual(hm.record, th.record);
  for (const n of hm.order.S) { const a = hm.inds.find(i => i.n === n), b = th.inds.find(i => i.n === n); assert.deepEqual([a.x, a.y, a.d, a.t, a.dots, a.sc], [b.x, b.y, b.d, b.t, b.dots, b.sc]); }
  assert.ok(fs.statSync(path.join(tmp, 'next/data/theme-home.json')).size < 8_192, '첫 화면 칸 파일은 8KB 아래');
  const tc = JSON.parse(fs.readFileSync(path.join(tmp, 'next/data/theme-co.json'), 'utf8'));
  assert.equal(tc.schema, THEME_SCHEMA + '-co'); assert.equal(tc.asOf, th.asOf); assert.ok(tc.n >= 1000, '회사 자리 1,000곳 넘게'); assert.equal(Object.keys(tc.co).length, tc.n);
  for (const [c, v] of Object.entries(tc.co)) { assert.match(c, /^[0-9][0-9A-Z]{5}$/); assert.equal(v.length, 3); assert.ok(['B', 'W', 'S', 'Q'].includes(v[2]), c); }
  assert.ok(fs.statSync(path.join(tmp, 'next/data/theme-co.json')).size < 120_000, '회사 자리 파일은 120KB 아래');
  fs.rmSync(tmp, {recursive: true, force: true});
});

// 행성 시계(사장님 2026-10-20(서울) 22:17 「진짜 실사 행성으로 해」) — 큰 업종 무리마다 행성 하나 · 사진 파일이 있음 · 첫 화면 자료에 무리(g)가 실림
test('행성 — 무리마다 다른 행성 · 사진 파일 · 첫 화면 자료의 g', async () => {
  const {PLANET, PLANET_KO, planetSrc} = await import('../../site/next/theme-home.js');
  const T = JSON.parse(fs.readFileSync('site/next/data/theme.json', 'utf8'));
  const ids = T.groups.map(g => g.id);
  assert.deepEqual([...ids].sort(), Object.keys(PLANET).sort(), '무리 열 = 행성 열');
  assert.equal(new Set(Object.values(PLANET)).size, ids.length, '행성이 겹치지 않음');
  for (const id of [...ids, 'sun']) {
    const f = path.join('site', planetSrc(id));
    assert.ok(fs.existsSync(f), f);
    const b = fs.readFileSync(f);
    assert.equal(b.subarray(0, 4).toString(), 'RIFF'); assert.equal(b.subarray(8, 12).toString(), 'WEBP');
    assert.ok(b.length < 8000, f + ' 작게');
  }
  for (const k of Object.values(PLANET)) assert.ok(PLANET_KO[k], k);
  const H = JSON.parse(fs.readFileSync('site/next/data/theme-home.json', 'utf8'));
  for (const i of H.inds) assert.ok(ids.includes(i.g), i.n + ' 무리');
  const src = JSON.parse(fs.readFileSync('site/media/planet/sources.json', 'utf8'));
  assert.equal(src.files.length, ids.length + 1);
  for (const r of src.files) assert.match(r.credit, /NASA/);
});

// 계절 궤도(사장님 2026-10-21 00:51 「이기준에 스마트하게」) — 행성 각이 결정표 네 자리와 같은 쪽(봄 = 싹 · 여름 = 꽃 · 가을 = 시듦 · 겨울 = 잠잠)
test('계절 각 — 네 자리와 같은 쪽 · 계절 이름', async () => {
  const {seasonAngle, SEASON} = await import('../../site/next/theme-home.js');
  assert.deepEqual(SEASON, {Q: '겨울', S: '봄', B: '여름', W: '가을'});
  const side = a => (a >= Math.PI / 2 ? 'S' : a >= 0 ? 'B' : a >= -Math.PI / 2 ? 'W' : 'Q'); // 화면: 왼쪽 위 · 오른쪽 위 · 오른쪽 아래 · 왼쪽 아래
  let n = 0;
  for (let x = -30; x <= 30; x += 0.7) for (let y = -15; y <= 15; y += 0.45) {
    if (x === RULE.bloomX) continue;
    const z = zoneOf(x, y), a = seasonAngle(x, y);
    if (y === 0) continue; // 가로축 위는 결정표가 위쪽(싹 · 꽃)으로 셈 — 각 0 / π 경계는 따로 보지 않음
    assert.equal(side(a), z, `x ${x} y ${y}`); n++;
  }
  assert.ok(n > 3000);
  const H = JSON.parse(fs.readFileSync('site/next/data/theme-home.json', 'utf8'));
  for (const i of H.inds) if (Number.isFinite(i.x) && Number.isFinite(i.y) && i.y !== 0 && i.x !== RULE.bloomX) assert.equal(side(seasonAngle(i.x, i.y)), i.z, i.n);
});
