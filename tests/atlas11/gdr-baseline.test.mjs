// 고도리 지난 성적 바탕 비교 gb-v1 시험(scripts/atlas11/next/gdr/baseline.mjs · 일꾼 G2b)
//   작은 가짜 모음으로 손으로 센 값과 맞댐 · 그날 뒤 줄을 잘라도 값이 같은지(그날 알 수 있던 것만) · 코스피 빈 날 = null
//   진짜 모음 맞대기는 GDR_REAL=1 일 때만(모음 읽기 약 7초 · 1.1GB)
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {loadBaseline, mergeKospi, allCompanies, kospi as kospiFn, DEFAULT_BUNDLE} from '../../scripts/atlas11/next/gdr/baseline.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const near = (a, b, msg) => assert.ok(a !== null && b !== null && Math.abs(a - b) < 1e-12, `${msg}: ${a} != ${b}`);
const D = ['20240102', '20240103', '20240104', '20240105', '20240108', '20240109', '20240110', '20240111'];
const row = (d, c, v = 1000) => [d, c, c, c, c, v];
const rows = (closes, vols = [], from = 0) => closes.map((c, i) => (c == null ? null : row(D[from + i], c, vols[i] ?? 1000))).filter(Boolean);
const st = (code, name, rs, endType = 'stock') => [code, {list: {code, name, market: 'KOSDAQ', endType}, fchart: {rows: rs}}];

function fixture() {
  return {stocks: Object.fromEntries([
    st('000010', 'A', [['20231228', 50, 50, 50, 50, 10], ...rows([100, 110, 121, 100, 90, 95, 99, 120])]), // 달력 앞 옛 줄(한 곳뿐 → 달력에서 빠짐 · d1 의 +100% 는 (k, e] 밖)
    st('000020', 'B', rows([200, 210, 220, 220, 220, 230, 240, 250], [1, 1, 1, 0, 0, 1, 1, 1])), // d4 · d5 멈춤
    st('000030', 'C', rows([50, 55, 60, 66, 70, 72], [], 2)), // d3 에 새로 상장
    st('000040', 'D', rows([300, 310, 320, 330, 340, 350, 350, 350], [1, 1, 1, 1, 1, 1, 0, 0])), // 끝에 멈춤
    st('000050', 'E', rows([1000, 1000, 1000, 1000, 2000, 2100, 2200, 2300])), // d5 +100%(고쳐지지 않은 값)
    st('000060', 'F', rows([40, 40, 44, 48, 50, 52, 54, 56], [0, 0, 1, 1, 1, 1, 1, 1])), // 처음 이틀 멈춤
    st('000070', 'G', rows([10, 11, 12, 13, 14, null, 15, 16])), // d6 줄 없음
    st('000075', 'G우', rows([5, 5, 5, 5, 5, 5, 5, 5])), // 우선주(번호 끝 5)
    st('000080', '테스트스팩1호', rows([2, 2, 2, 2, 2, 2, 2, 2])), // 스팩
    st('000090', 'KODEX 가짜', rows([9, 9, 9, 9, 9, 9, 9, 9]), 'etf'), // 상장 펀드
    ['000100', {list: {code: '000100', name: 'H', market: 'KOSPI', endType: 'stock'}}], // 회사 주식인데 일봉 없음
  ])};
}
const KOSPI = D.filter(d => d !== '20240109').map((d, i) => [d.slice(0, 4) + '-' + d.slice(4, 6) + '-' + d.slice(6), 1000 + i * 10]);
const cut = (B, last) => ({stocks: Object.fromEntries(Object.entries(B.stocks).map(([c, s]) => [c, s.fchart ? {...s, fchart: {...s.fchart, rows: s.fchart.rows.filter(r => r[0] <= last)}} : s]))});

test('① 달력 · 모든 회사 수 · 회사 주식만', () => {
  const bl = loadBaseline(fixture(), {kospi: KOSPI});
  assert.equal(bl.n, 8);
  assert.deepEqual(bl.days, D.map(d => d.slice(0, 4) + '-' + d.slice(4, 6) + '-' + d.slice(6)));
  assert.deepEqual(bl.codes, ['000010', '000020', '000030', '000040', '000050', '000060', '000070']);
  assert.equal(bl.meta.companies.common, 7);
  assert.equal(bl.meta.companies.commonNoRows, 1);
  assert.equal(bl.indexOf('2024-01-08'), 4);
  assert.equal(bl.indexOf('20240108'), 4);
  assert.equal(bl.indexOf('2023-12-28'), -1);
  assert.equal(bl.endOf(0, 4), 4); assert.equal(bl.endOf(5, 'end'), 7); assert.equal(bl.endOf(7, 'end'), -1);
  assert.equal(bl.endOf(7, 1), -1); assert.equal(bl.endOf(0, 0), -1); assert.equal(bl.endOf(0, 1.5), -1); assert.equal(bl.endOf(-1, 2), -1);
});

test('② k=0 · 4거래일 — 손으로 센 값', () => {
  const bl = loadBaseline(fixture(), {kospi: KOSPI});
  const a = bl.allCompanies(0, 4);
  // 든 곳: A B D E G(C 는 아직 상장 전 · F 는 멈춤) — 오름 A −0.1 · B +0.1(끝 날 멈춤 = stale) · D 340/300−1 · E +1(jump) · G +0.4
  const rA = 90 / 100 - 1, rB = 220 / 200 - 1, rD = 340 / 300 - 1, rE = 2000 / 1000 - 1, rG = 14 / 10 - 1;
  assert.equal(a.n, 5); assert.equal(a.haltedAtStart, 1);
  assert.equal(a.from, '2024-01-02'); assert.equal(a.to, '2024-01-08'); assert.equal(a.e, 4);
  near(a.median, rD, 'median'); near(a.mean, (rA + rB + rD + rE + rG) / 5, 'mean');
  assert.equal(a.up, 4); assert.equal(a.down, 1); assert.equal(a.flat, 0); assert.equal(a.stale, 1); assert.equal(a.jump, 1);
  near(a.worst.median, rD, 'worst median'); near(a.worst.mean, (rA - 1 + rD + rE + rG) / 5, 'worst mean');
  assert.equal(a.clean.n, 4); near(a.clean.median, (rB + rD) / 2, 'clean median'); near(a.clean.mean, (rA + rB + rD + rG) / 4, 'clean mean');
});

test('③ k=2 · 끝까지 · beats(나은 곳 몇 %)', () => {
  const bl = loadBaseline(fixture(), {kospi: KOSPI});
  const a = bl.allCompanies(2, 'end');
  const r = {A: 120 / 121 - 1, B: 250 / 220 - 1, C: 72 / 50 - 1, D: 350 / 320 - 1, E: 2300 / 1000 - 1, F: 56 / 44 - 1, G: 16 / 12 - 1};
  assert.equal(a.n, 7); assert.equal(a.haltedAtStart, 0); assert.equal(a.e, 7); assert.equal(a.stale, 1); assert.equal(a.jump, 1);
  near(a.median, r.F, 'median'); near(a.mean, (r.A + r.B + r.C + r.D + r.E + r.F + r.G) / 7, 'mean');
  assert.deepEqual(bl.beats(2, 'end', 0.3), {n: 7, below: 4, equal: 0, above: 3, share: 4 / 7});
  assert.deepEqual(bl.beats(2, 'end', r.C), {n: 7, below: 5, equal: 1, above: 1, share: 5.5 / 7});
  assert.deepEqual(bl.beats(2, 'end', -5), {n: 7, below: 0, equal: 0, above: 7, share: 0});
  assert.equal(bl.beats(7, 2, 0.1), null);
  assert.equal(bl.beats(2, 'end', NaN), null);
});

test('④ 한 회사 오름 · 멈춤 · 없는 줄 · 회사 주식 아님', () => {
  const bl = loadBaseline(fixture(), {kospi: KOSPI});
  const b = bl.stockReturn('000020', 0, 4);
  near(b.r, 0.1, 'B'); assert.equal(b.stale, true); assert.equal(b.jump, false); assert.equal(b.c0, 200); assert.equal(b.c1, 220);
  assert.equal(bl.stockReturn('000060', 0, 4), null, '시작 날 멈춤');
  assert.equal(bl.stockReturn('000030', 0, 4), null, '시작 날 상장 전');
  assert.equal(bl.stockReturn('000075', 2, 2), null, '우선주');
  assert.equal(bl.stockReturn('000090', 2, 2), null, '상장 펀드');
  const g = bl.stockReturn('000070', 3, 2); // d6 줄 없음 → d5 값 · 거래 없음 = stale
  near(g.r, 14 / 13 - 1, 'G'); assert.equal(g.stale, true);
  assert.equal(bl.stockReturn('000050', 4, 2).jump, false, '(k, e] 밖 jump'); // d5 가 k
  assert.equal(bl.stockReturn('000050', 3, 2).jump, true);
  assert.equal(bl.stockReturn('000010', 0, 1).jump, false, '달력 앞 옛 줄의 바뀜은 안 셈');
  assert.equal(bl.tradable('000060', 1), false); assert.equal(bl.tradable('000060', 2), true); assert.equal(bl.tradable('000075', 2), false);
});

test('⑤ 그날 알 수 있던 것만 — 뒤 줄을 잘라도 같은 값(검은 상자)', () => {
  const B = fixture(), full = loadBaseline(B, {kospi: KOSPI});
  let compared = 0;
  for (let k = 0; k < 8; k++) {
    // 들고 빠짐은 k 날까지 자른 자료와 같음
    const atK = loadBaseline(cut(B, D[k]), {kospi: KOSPI});
    for (const c of full.codes) assert.equal(atK.tradable(c, k), full.tradable(c, k), `tradable ${c} ${k}`);
    for (let e = k + 1; e < 8; e++) {
      const part = loadBaseline(cut(B, D[e]), {kospi: KOSPI});
      assert.deepEqual(part.allCompanies(k, e - k), full.allCompanies(k, e - k), `k ${k} e ${e}`);
      for (const c of full.codes) assert.deepEqual(part.stockReturn(c, k, e - k), full.stockReturn(c, k, e - k));
      compared++;
    }
  }
  assert.equal(compared, 28);
});

test('⑥ 코스피 — 없는 날은 null(채우지 않음) · 두 출처 합치기', () => {
  const bl = loadBaseline(fixture(), {kospi: KOSPI});
  const a = bl.kospi(0, 4);
  assert.equal(a.c0, 1000); assert.equal(a.c1, 1040); near(a.r, 0.04, 'kospi');
  const b = bl.kospi(3, 2); // 끝 날 2024-01-09 없음
  assert.equal(b.r, null); assert.equal(b.c1, null); assert.match(b.why, /2024-01-09/);
  assert.equal(bl.kospi(7, 1).r, null);
  assert.deepEqual(bl.meta.kospi.missing, ['2024-01-09']);
  // 같은 값이면 빈 날을 채우고, 하나라도 다르면 그 출처는 안 씀
  const base = {name: 'long', rows: [['2024-01-02', 10], ['2024-01-03', 11]]};
  const ok = mergeKospi([base, {name: 'pub', rows: [['2024-01-03', 11.001], ['2024-01-04', 12]]}]);
  assert.equal(ok.map.get('2024-01-04'), 12); assert.equal(ok.info[1].used, true); assert.equal(ok.info[1].added, 1);
  const bad = mergeKospi([base, {name: 'pub', rows: [['2024-01-03', 11.5], ['2024-01-04', 12]]}]);
  assert.equal(bad.map.has('2024-01-04'), false); assert.equal(bad.info[1].used, false); assert.equal(bad.info[1].disagree, 1);
  // 모듈 함수는 마지막으로 읽은 것
  assert.deepEqual(allCompanies(0, 4), bl.allCompanies(0, 4)); assert.deepEqual(kospiFn(0, 4), a);
});

test('⑦ 진짜 모음(GDR_REAL=1 일 때만) — 달력 839날 · 코스피 839날 · 2024-05-09 한 달', {skip: process.env.GDR_REAL !== '1' || !fs.existsSync(path.join(ROOT, DEFAULT_BUNDLE))}, () => {
  const bl = loadBaseline(DEFAULT_BUNDLE, {sha: false});
  assert.equal(bl.n, 839); assert.equal(bl.days[0], '2023-04-28'); assert.equal(bl.days[838], '2026-10-13');
  assert.equal(bl.days[250], '2024-05-09'); assert.equal(bl.days[818], '2026-09-09'); assert.equal(bl.days[778], '2026-07-13');
  assert.equal(bl.meta.companies.common, 2557); assert.equal(bl.meta.kospi.covered, 839);
  const a = bl.allCompanies(250, 20);
  assert.equal(a.n, 2316); assert.equal(a.to, '2024-06-10');
  assert.equal(bl.kospi(818, 20).c1, 6035.35);
});
