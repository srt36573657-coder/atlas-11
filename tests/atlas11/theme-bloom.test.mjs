// 꽃 핀 업종 안의 싹 회사(사장님 2026-10-22 16:56 「싹에서 꽃이 되는 종목 … 엄선하고 검사해서 그것들만」 · theme-engine.js bloomOf) 시험
//   ① 저장소 자료로 올리기 셈(build)을 돌리고, 이 시험이 따로 짠 쉬운 셈(날마다 · 회사마다 고리)으로 같은 숫자가 나오는지 맞댐(앞 · 뒤 기록 · 오늘 목록)
//   ② 거래가 멈춘 회사(스물한 날 종가가 같음)는 오늘 목록에 없음
//   셈 약속 = docs/design/sprout-flower-2026-10-22/spec-v1.md v5 · 연구 셈 scripts/atlas11/research/sprout_flower.py · 따로 센 일꾼 숫자와 같아야 함
//   2026-10-27 17:34 부터 = 위 모습 + 회사 값이 반년 가장 높은 값 가까이(docs/design/sprout365-2026-10-27/spec.md · 연구 셈 scripts/atlas11/research/sprout365.py) — 바꾸기 전 모습은 old 로 나란히
//   2026-11-02 부터 = 다시 세운 조건(주문 0815 · docs/design/bloom-evolve-2026-11-02/spec.md · scripts/atlas11/research/bloom_evolve.py) — 싹 + 그날 몸값 위 20% + 업종 한 달 15% 넘게
//     바꾸기 전 조건(업종 꽃 자리 + 싹 + 반년 가장 높은 값 가까이)은 old 로 나란히 · 가름 날 2026-09-10(고를 때 안 본 기록) · 회사마다 지난 기록(든 날 · 꽃) · 안 본 기록만(honest)
//   2026-11-02 주문 1313 부터 = 조건을 달마다 스스로 다시 고름(docs/design/self-evolve-2026-11-02/spec.md v2 · site/next/data/bloom-months.json)
//     달마다 결정 · 달 기록 · 모은 기록 · 오늘 목록 · 회사마다 지난 기록 = ① 연구 셈(reports/atlas11/research/bloom-month-2026-11-02.json · bloom_month.py)
//     = ② 따로 센 일꾼(docs/design/self-evolve-2026-11-02/recount-month.json) = ③ 엔진 · 셈 셋 맞대기 도구(scripts/atlas11/research/bloom_cross.mjs)가 다르면 새 판을 안 씀
import {test} from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {spawnSync} from 'node:child_process';
import {build} from '../../scripts/atlas11/next/build/theme.mjs';
import {planOf, PICK_EVOLVE} from '../../site/next/theme-engine.js';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const DATA = path.join(ROOT, 'site', 'atlas', 'data');

function brute(split = '2026-09-10') { // split = 고를 때 본 · 안 본 기록 가름 날(달마다 고르기 = 첫 결정 달 첫날)
  const D = JSON.parse(fs.readFileSync(path.join(DATA, 'days.json'), 'utf8')).dates, N = D.length;
  const comp = JSON.parse(fs.readFileSync(path.join(DATA, 'mkt.json'), 'utf8')).companies;
  const codes = fs.readdirSync(path.join(DATA, 'co')).filter(f => /^[0-9][0-9A-Z]{5}\.json$/.test(f)).map(f => f.slice(0, 6)).filter(c => comp[c]).sort();
  const P = codes.map(c => { const d = JSON.parse(fs.readFileSync(path.join(DATA, 'co', c + '.json'), 'utf8')), a = new Array(N).fill(0); (d.close ?? []).forEach((v, j) => { const t = j + (d.k0 ?? 0); if (t >= 0 && t < N && v > 0) a[t] = v; }); return a; });
  const ok = v => v > 0, jump = (a, t) => ok(a[t - 1]) && ok(a[t]) && Math.abs(a[t] / a[t - 1] - 1) >= 0.35;
  const idx = rows => { const I = [1]; for (let t = 1; t < N; t++) { let s = 0, n = 0; for (const a of rows) if (ok(a[t - 1]) && ok(a[t]) && !jump(a, t)) { s += a[t] / a[t - 1] - 1; n++; } I.push(I[t - 1] * (1 + (n ? s / n : 0))); } return I; };
  const M = idx(P), mem = {};
  codes.forEach((c, j) => { const g = comp[c].i; if (typeof g === 'string') (mem[g] ??= []).push(j); });
  const ind = {}; for (const [g, js] of Object.entries(mem)) if (js.length >= 5) ind[g] = idx(js.map(j => P[j]));
  const ex = (a, t, k) => (a[t] / a[t - k]) / (M[t] / M[t - k]) - 1;
  const bloomInd = (g, t) => { const I = ind[g]; return !!I && ex(I, t, 20) * 100 >= 5 && ex(I, t, 5) * 100 >= 0; };
  const count = (a, t) => { if (t < 20 || !ok(a[t]) || !ok(a[t - 5]) || !ok(a[t - 20])) return false; let same = 0; for (let s = t - 19; s <= t; s++) { if (jump(a, s)) return false; if (ok(a[s - 1]) && a[s] === a[s - 1]) same++; } return same < 20; };
  const sprout = (a, t) => ex(a, t, 20) * 100 < 5 && ex(a, t, 5) * 100 >= 0;
  const near = (a, t) => { if (t < 119) return false; let mx = 0; for (let s = t - 119; s <= t; s++) { if (!ok(a[s])) return false; if (a[s] > mx) mx = a[s]; } return a[t] / mx >= 0.95; }; // 반년(120거래일) 가장 높은 값의 95% 이상 — 하루라도 빈 값이면 아님
  // 몸값(그날 종가 × 지금 주식 수 = cond.json 몸값 ÷ 마지막 종가) · 그날 셀 수 있는 회사끼리 작은 쪽부터 차례 · (차례 + 1) ÷ 센 수 ≥ 0.8 = 위 20%(따로 짬 — 날마다 줄 세움)
  const cond = JSON.parse(fs.readFileSync(path.join(DATA, 'cond.json'), 'utf8')).co, cap = new Map(cond.c.map((c, k) => [c, cond.cap[k]]));
  const sh = codes.map((c, j) => { const a = P[j]; let last = 0; for (let t = N - 1; t >= 0; t--) if (ok(a[t])) { last = a[t]; break; } const v = cap.get(c); return typeof v === 'number' && v > 0 && last > 0 ? v / last : NaN; });
  const bigAt = codes.map(() => new Array(N).fill(false));
  for (let t = 0; t < N; t++) {
    const js = []; codes.forEach((c, j) => { if (count(P[j], t) && Number.isFinite(sh[j]) && ok(P[j][t])) js.push(j); });
    js.sort((p, q) => P[p][t] * sh[p] - P[q][t] * sh[q] || p - q);
    js.forEach((j, r) => { if ((r + 1) / js.length >= 0.8) bigAt[j][t] = true; });
  }
  const hotInd = (g, t) => { const I = ind[g]; return !!I && t >= 20 && ex(I, t, 20) * 100 >= 15; }; // 업종 한 달 15% 넘게
  const T = N - 1, t0 = 120, t1 = T - 20, z = () => ({n: 0, h: 0, bn: 0, bh: 0, pn: 0, ph: 0, on: 0, oh: 0});
  let mid = D.findIndex((d, t) => t > t0 && d >= split); if (mid < 0 || mid > t1) mid = t1 + 1; // 가름 날 = 고를 때 안 본 첫날
  const R = {train: z(), test: z()}, today = [], past = {};
  let todayOld = 0;
  codes.forEach((c, j) => {
    const a = P[j], g = comp[c].i, rule = t => sprout(a, t) && hotInd(g, t) && bigAt[j][t];
    let pn = 0, ph = 0;
    for (let t = t0; t <= t1; t++) {
      if (!count(a, t) || !ok(a[t + 20])) continue;
      let jf = false; for (let s = t + 1; s <= t + 20; s++) if (jump(a, s)) { jf = true; break; } if (jf) continue;
      const hit = ex(a, t + 20, 20) >= 0.05, r = R[t < mid ? 'train' : 'test'];
      r.bn++; if (hit) r.bh++;
      if (sprout(a, t)) { r.pn++; if (hit) r.ph++; }
      if (sprout(a, t) && bloomInd(g, t) && near(a, t)) { r.on++; if (hit) r.oh++; } // 바꾸기 전 조건
      if (rule(t)) { r.n++; if (hit) r.h++; pn++; if (hit) ph++; }
    }
    if (count(a, T) && sprout(a, T) && bloomInd(g, T) && near(a, T)) todayOld++;
    if (count(a, T) && rule(T)) { today.push(c); past[c] = [pn, ph]; }
  });
  return {R, today: today.sort(), todayOld, past, codes: codes.length, pct: (v, n) => (n ? Math.round((v / n) * 10000) / 100 : null)};
}

const J = f => JSON.parse(fs.readFileSync(f, 'utf8'));
const MONTHS = path.join(ROOT, 'site', 'next', 'data', 'bloom-months.json');
const RES = path.join(ROOT, 'reports', 'atlas11', 'research', 'bloom-month-2026-11-02.json'); // ① 연구 셈(저장소 자료)
const REC = path.join(ROOT, 'docs', 'design', 'self-evolve-2026-11-02', 'recount-month.json'); // ② 따로 센 일꾼(저장소 자료)
const pct = (v, n) => (n ? Math.round((v / n) * 10000) / 100 : null);
const F = ['n', 'h', 'nb', 'hb', 'days', 'pickDays', 'complete'];
/** ① 연구 셈의 결정(저장소 자료)으로 결정 파일 — main 의 bloom-months.json 은 깃허브 일이 지금 사이트 자료로 다시 써서 저장소 자료와 결정이 다를 수 있음(맞대기는 같은 자료끼리) */
function candFile(dir, R) {
  const f = path.join(dir, 'cand-months.json');
  fs.writeFileSync(f, JSON.stringify({schema: 'dori-bloom-months-1', asOf: R.asOf, months: R.months.map(m => ({month: m.month, s: m.s, id: m.id ?? null, sealed: m.month >= (R.sealFrom ?? '2026-11'), fresh: m.fresh ?? null, lb: m.lb ?? null, nTrain: m.nTrain ?? null, elig: m.elig ?? null})),
    check: {at: '2026-11-02T00:00:00.000Z', data: 'stored', asOf: R.asOf, agree: true, counts: 3}}));
  return f;
}
async function buildAt(months = null) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'bloom-'));
  fs.mkdirSync(path.join(dir, 'atlas'), {recursive: true});
  fs.symlinkSync(DATA, path.join(dir, 'atlas', 'data'));
  await build({siteDir: dir, keptFile: path.join(dir, 'kept.json'), monthsFile: months});
  return {dir, B: J(path.join(dir, 'next', 'data', 'theme-bloom.json'))};
}

test('꽃 될 회사 — 달마다 고른 조건 · 달 기록 · 모은 기록 · 오늘 목록 = 연구 셈 = 따로 센 일꾼 = 엔진(셈 셋 · 주문 1313)', async () => {
  const R = J(RES), Q = J(REC);
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'bloom-c-'));
  const {dir, B} = await buildAt(candFile(tmp, R));
  assert.equal(R.asOf, B.asOf, '연구 셈 자료 날 = 저장소 자료'); assert.equal(Q.asOf, B.asOf, '따로 센 일꾼 자료 날 = 저장소 자료'); assert.equal(R.tl, Q.tl);
  assert.equal(B.rule.monthly, true, '달마다 고르기 켜짐'); assert.equal(B.self.agree, true); assert.equal(B.self.asOf, R.asOf);
  // 결정 — 연구 셈 = 따로 센 일꾼 = 엔진이 쓴 결정
  assert.deepEqual(B.months.map(m => [m.month, m.id]), R.months.map(m => [m.month, m.id ?? null]), '엔진 결정 = 연구 셈');
  assert.deepEqual(Q.months.map(m => [m.month, m.id ?? null]), R.months.map(m => [m.month, m.id ?? null]), '따로 센 일꾼 결정 = 연구 셈');
  assert.ok(B.months.length >= 21, '2025-01 부터 달마다');
  // 달 기록 — 칸마다 셋이 같음 · 점수 = 100 × (h/n − hb/nb)
  B.months.forEach((m, k) => {
    for (const f of F) { assert.equal(m.rec[f], R.months[k].record[f], `${m.month} ${f} ① = ③`); assert.equal(m.rec[f], Q.months[k].record[f], `${m.month} ${f} ② = ③`); }
    assert.equal(m.rec.rate, pct(m.rec.h, m.rec.n)); assert.equal(m.rec.base, pct(m.rec.hb, m.rec.nb));
    assert.equal(m.rec.score, m.rec.n && m.rec.nb ? Math.round((m.rec.h / m.rec.n - m.rec.hb / m.rec.nb) * 10000) / 100 : null, m.month + ' 점수');
    assert.equal(m.sealed, m.month >= '2026-11', m.month + ' 봉인 = 2026-11 부터');
    assert.ok(Array.isArray(m.say) && (m.id ? m.say.length === m.id.split('&').length + 1 : m.say.length === 0), m.month + ' 조건 쉬운 말(낱 조건마다 + 싹)');
  });
  // 모은 기록(쪽 · 첫 화면 결론) = 달 기록 합 = 연구 셈 = 따로 센 일꾼
  const H = B.honest;
  assert.deepEqual({n: H.n, h: H.hits, nb: H.baseN, hb: H.baseHits}, {n: R.totals.n, h: R.totals.h, nb: R.totals.nb, hb: R.totals.hb}, '모은 기록 ① = ③');
  assert.deepEqual({n: Q.totals.n, h: Q.totals.h, nb: Q.totals.nb, hb: Q.totals.hb}, {n: R.totals.n, h: R.totals.h, nb: R.totals.nb, hb: R.totals.hb}, '모은 기록 ① = ②');
  assert.equal(H.rate, pct(H.hits, H.n)); assert.equal(H.base, pct(H.baseHits, H.baseN));
  assert.equal(H.months, B.months.filter(m => m.rec.days > 0).length); assert.equal(H.scored, B.months.filter(m => m.rec.n > 0).length);
  assert.equal(H.up, B.months.filter(m => m.rec.n > 0 && Math.round(m.rec.score) > 0).length, '많았던 달 = 화면 반올림');
  assert.equal(H.down, B.months.filter(m => m.rec.n > 0 && Math.round(m.rec.score) < 0).length);
  // 저장소 자료(2026-10-13)로는 v1 연구 셈의 안 본 기록 A(2025-01-02 ~ 2026-09-09)와 같은 수 — v2 는 v1 을 바꾸지 않고 이어 감
  if (B.asOf === PICK_EVOLVE.asOf) assert.deepEqual({n: H.n, hits: H.hits, baseN: H.baseN, baseHits: H.baseHits}, {n: PICK_EVOLVE.wf.A.n, hits: PICK_EVOLVE.wf.A.hits, baseN: PICK_EVOLVE.wf.A.baseN, baseHits: PICK_EVOLVE.wf.A.baseHits}, 'v1 안 본 기록 A 와 같음');
  // 오늘 — 조건 · 목록 · 회사마다 지난 기록(수르가 고른 날 · 그중 꽃) = 연구 셈
  assert.equal(B.today.rule.id, R.today.id, '오늘 조건'); assert.equal(B.today.rule.carry, R.today.carry); assert.equal(B.today.rule.month, R.today.month);
  const got = B.today.inds.flatMap(i => i.co.map(r => r[0])).sort();
  assert.deepEqual(got, [...R.today.rows].sort(), '오늘 목록'); assert.equal(B.today.n, got.length);
  for (const i of B.today.inds) for (const r of i.co) assert.deepEqual([r[4], r[5]], R.today.past[r[0]], '회사마다 지난 기록 ' + r[0]);
  // 고를 때 안 본 기록 = 첫 결정 달부터(결정 전 날은 고른 회사 없음)
  assert.equal(B.span.test[0], B.months[0].s, '가름 날 = 첫 결정 달 첫 거래일'); assert.equal(B.record.train.n, 0, '첫 결정 전에는 고르지 않음');
  assert.equal(B.record.test.n, H.n, '안 본 기록 = 모은 기록(이어 쓴 날 없음)');
  // 바탕 · 그냥 싹 · 바꾸기 전 조건 = 따로 짠 쉬운 셈(같은 가름 날)
  const {R: BR, todayOld, codes} = brute(B.span.test[0]);
  for (const k of ['train', 'test']) {
    assert.equal(B.record[k].baseN, BR[k].bn, k + ' 바탕 n'); assert.equal(B.record[k].base, pct(BR[k].bh, BR[k].bn), k + ' 바탕 꽃 비율');
    assert.equal(B.record[k].plainN, BR[k].pn, k + ' 그냥 싹 n'); assert.equal(B.record[k].plain, pct(BR[k].ph, BR[k].pn), k + ' 그냥 싹 꽃 비율');
    assert.equal(B.record[k].oldN, BR[k].on, k + ' 바꾸기 전 조건 n'); assert.equal(B.record[k].old, pct(BR[k].oh, BR[k].on), k + ' 바꾸기 전 조건 꽃 비율');
  }
  assert.equal(B.today.all, todayOld, '바꾸기 전 조건이면 오늘 수 = 쉬운 셈');
  assert.equal(B.companies, codes, '본 회사 수');
  assert.equal(B.record.all.n, B.record.train.n + B.record.test.n, '모든 날 = 앞 + 뒤');
  assert.equal(Object.values(B.record.years).reduce((p, y) => p + y.n, 0), B.record.all.n, '해마다 합 = 모든 날');
  const hasBig = B.today.rule.id.split('&').some(p => /^big\d$/.test(p));
  for (const i of B.today.inds) for (const r of i.co) assert.ok(hasBig ? r[6] >= 1 && r[6] <= 100 : r[6] == null, '몸값 위 몇 % 는 그 달 조건에 몸값 갈래가 있을 때만 ' + r[0]);
  const CL = J(path.join(ROOT, 'docs', 'design', 'bloom-evolve-2026-11-02', 'candidates.json'));
  assert.equal(B.tried, CL.candidates, '고르는 조건 후보 수 = 셈 전에 적은 목록(11,874)');
  for (const m of B.months) if (m.id) for (const a of m.id.split('&')) assert.ok(CL.atoms.some(x => x.id === a), m.month + ' 결정의 낱 조건이 후보 목록 안 ' + a);
  fs.rmSync(dir, {recursive: true, force: true}); fs.rmSync(tmp, {recursive: true, force: true});
});

test('저장된 결정 판(bloom-months.json) — 셈 셋이 같을 때만 · 봉인 · 낱 조건 이름 · 엔진이 그대로 읽음', async () => {
  const M = J(MONTHS), CL = J(path.join(ROOT, 'docs', 'design', 'bloom-evolve-2026-11-02', 'candidates.json'));
  assert.equal(M.schema, 'dori-bloom-months-1'); assert.equal(M.check.agree, true, '셈 셋이 같을 때만 씀'); assert.equal(M.check.counts, 3); assert.equal(M.check.asOf, M.asOf);
  assert.ok(Array.isArray(M.months) && M.months.length >= 21);
  M.months.forEach((m, k) => {
    assert.match(m.month, /^\d{4}-\d{2}$/); if (k) assert.ok(M.months[k - 1].month < m.month, '달 차례');
    assert.equal(!!m.sealed, m.month >= M.sealFrom, m.month + ' 봉인 = ' + M.sealFrom + ' 부터');
    assert.ok(m.month <= M.asOf.slice(0, 7), m.month + ' 자료 날 뒤 달 없음');
    if (m.id != null) for (const a of m.id.split('&')) assert.ok(CL.atoms.some(x => x.id === a), m.month + ' 낱 조건 ' + a);
  });
  const {dir, B} = await buildAt(MONTHS);
  assert.deepEqual(B.months.map(m => [m.month, m.id]), M.months.filter(m => m.month <= B.asOf.slice(0, 7)).map(m => [m.month, m.id ?? null]), '엔진이 저장된 결정을 그대로 씀');
  assert.equal(B.self.agree, true); assert.equal(B.self.asOf, M.check.asOf);
  fs.rmSync(dir, {recursive: true, force: true});
  // 자료 끝 달 뒤의 결정(지금 사이트 자료로 낸 새 달)은 저장소 자료로 돌릴 때 엔진이 빼요
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'bloom-f-')), f = path.join(tmp, 'm.json');
  fs.writeFileSync(f, JSON.stringify({...M, months: [...M.months, {month: '2099-01', s: '2099-01-02', id: M.months.at(-1).id, sealed: true}]}));
  const X = await buildAt(f);
  assert.ok(!X.B.months.some(m => m.month === '2099-01'), '자료 뒤 달 없음'); assert.equal(X.B.months.length, B.months.length);
  fs.rmSync(X.dir, {recursive: true, force: true}); fs.rmSync(tmp, {recursive: true, force: true});
});

test('달마다 결정 차례(planOf) — 결정 전 달은 앞 달 것을 이어 씀 · 파일이 없으면 다시 세운 하나', () => {
  const dates = ['2024-12-30', '2025-01-02', '2025-01-31', '2025-02-03', '2025-02-28', '2025-03-04', '2025-04-01'];
  const P = planOf(dates, {months: [{month: '2025-01', id: 'big2&ix4', sealed: false}, {month: '2025-03', id: null}, {month: '2025-02x', id: 'bad'}, {month: '2025-05', id: 'NOPE!'}]});
  assert.equal(P.legacy, false); assert.deepEqual(P.plan.map(p => [p.month, p.id]), [['2025-01', 'big2&ix4'], ['2025-03', null]], '이상한 달 · 이름은 뺌');
  assert.deepEqual([...P.at], [-1, 0, 0, 0, 0, 1, 1], '날마다 결정 차례'); assert.deepEqual([...P.carry], [0, 0, 0, 1, 1, 0, 1], '결정 없는 달 = 이어 씀');
  const L = planOf(dates, null);
  assert.equal(L.legacy, true); assert.equal(L.plan[0].id, PICK_EVOLVE.final.id); assert.deepEqual([...L.carry], [0, 0, 0, 0, 0, 0, 0], '옛 판은 이어 씀 표시 없음');
  assert.deepEqual([...L.at], [-1, 0, 0, 0, 0, 0, 0]);
});

test('셈 셋 맞대기 도구 — 같으면 새 판을 쓰고 · 하나라도 다르면 안 씀(bloom_cross · spec v2 §5)', () => {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'bloom-x-'));
  fs.mkdirSync(path.join(tmp, 'site', 'atlas'), {recursive: true});
  fs.symlinkSync(DATA, path.join(tmp, 'site', 'atlas', 'data'));
  const run = (rec, out) => spawnSync(process.execPath, [path.join(ROOT, 'scripts/atlas11/research/bloom_cross.mjs'), '--research', RES, '--recount', rec, '--site', path.join(tmp, 'site'), '--out', out, '--report', out + '.check', '--data', 'stored'], {encoding: 'utf8', timeout: 300e3});
  const ok = run(REC, path.join(tmp, 'ok.json'));
  assert.equal(ok.status, 0, '셋이 같음 ' + ok.stdout + ok.stderr);
  const W = J(path.join(tmp, 'ok.json')), R = J(RES);
  assert.equal(W.check.agree, true); assert.equal(W.asOf, R.asOf); assert.deepEqual(W.months.map(m => [m.month, m.id]), R.months.map(m => [m.month, m.id ?? null]), '새 판 결정 = 연구 셈');
  const Q = J(REC); Q.months[3].record.h += 1; fs.writeFileSync(path.join(tmp, 'bad-rec.json'), JSON.stringify(Q));
  const bad = run(path.join(tmp, 'bad-rec.json'), path.join(tmp, 'bad.json'));
  assert.equal(bad.status, 1, '하나라도 다르면 끝 코드 1');
  assert.equal(fs.existsSync(path.join(tmp, 'bad.json')), false, '다르면 새 판을 쓰지 않음');
  const C = J(path.join(tmp, 'bad.json.check'));
  assert.equal(C.agree, false); assert.ok(C.diffs.some(d => d.includes(Q.months[3].month) && d.includes('h ')), '다른 곳을 적음');
  fs.rmSync(tmp, {recursive: true, force: true});
});

test('꽃 핀 업종 안의 싹 회사 — 회사는 이름 차례 · 업종은 x 큰 차례 · 앞날 말 · 사고팔기 말 없음', () => {
  const B = JSON.parse(fs.readFileSync(path.join(ROOT, 'site', 'next', 'data', 'theme-bloom.json'), 'utf8'));
  assert.equal(B.schema, 'dori-theme-1-bloom');
  for (let k = 1; k < B.today.inds.length; k++) assert.ok(B.today.inds[k - 1].x >= B.today.inds[k].x, '업종 x 차례');
  for (const i of B.today.inds) for (let k = 1; k < i.co.length; k++) assert.ok(i.co[k - 1][1] <= i.co[k][1], '회사 이름 차례 ' + i.n);
  const page = fs.readFileSync(path.join(ROOT, 'site', 'next', 'p-theme.js'), 'utf8');
  const sec = page.slice(page.indexOf('async function pPick()'), page.indexOf('export async function render'));
  assert.ok(sec.length > 500, 'pPick 있음');
  for (const w of ['추천', '매수', '매도', '사세요', '팔', '예측', '확률', '유망']) assert.ok(!sec.includes(w), '쓰지 않을 말 ' + w);
});

test('기록 달력 · 꽃이 못 된 까닭 · 고른 길 — 셈이 서로 맞음(사장님 2026-10-22 22:54 · spec v6 · v7 · 2026-10-27 17:34 · 2026-11-02 주문 0815)', () => {
  const B = JSON.parse(fs.readFileSync(path.join(ROOT, 'site', 'next', 'data', 'theme-bloom.json'), 'utf8'));
  const D = B.cal.days;
  assert.ok(D.length > 0 && D.length <= 60, '달력 60거래일 안');
  assert.equal(D[0].d, B.cal.from); assert.equal(D.at(-1).d, B.cal.to); assert.equal(B.cal.to, B.asOf, '달력 끝 = 기준 날');
  let seenWait = false;
  for (const d of D) {
    assert.ok(d.n >= d.hit + d.miss + d.wait, '고른 수 ≥ 꽃 + 못 됨 + 기다림 ' + d.d);
    assert.equal(d.why.reduce((p, x) => p + x, 0), d.miss, '까닭 합 = 못 됨 ' + d.d);
    assert.ok(d.bh <= d.bn, '같은 날 아무 회사 ' + d.d);
    if (d.wait > 0) { seenWait = true; assert.equal(d.hit + d.miss, 0, '기다리는 날은 꽃 셈 없음 ' + d.d); }
    else if (seenWait) assert.equal(d.hit + d.miss, 0, '기다림은 끝쪽에만 — 기다린 날 뒤에 끝난 날 없음(고른 회사가 없는 날은 기다림 0) ' + d.d);
  }
  assert.equal(D.at(-1).n, B.today.n, '달력 마지막 날 고른 수 = 오늘 고른 수(지금 조건)');
  for (const k of ['all', 'train', 'test']) assert.equal(B.why[k].why.reduce((p, x) => p + x, 0), B.why[k].miss, '까닭 합 ' + k);
  assert.equal(B.why.all.miss, B.why.train.miss + B.why.test.miss, '모든 못 됨 = 앞 + 뒤');
  for (const k of ['all', 'train', 'test']) { const R = B.record[k]; assert.ok(Math.abs((R.n - B.why[k].miss) - (R.rate * R.n) / 100) < 1, '꽃 = n − 못 됨 ' + k); }
  assert.equal(B.fix, undefined, '옛 고쳐 본 것 다섯(모두 못 지나감)은 365 셈이 대신함');
  assert.equal(B.rule.hiWin, 120); assert.equal(B.rule.hiNear, 95); assert.equal(B.rule.monthly, true, '달마다 고르기(주문 1313)');
  assert.equal(B.months.at(-1).month <= B.asOf.slice(0, 7), true); assert.equal(B.today.rule.month, B.asOf.slice(0, 7), '오늘 조건 = 기준 날이 든 달');
  const W = B.pick.wf.B;
  assert.ok(W.rate > W.cur && W.rate > W.base, '안 본 기록 B: 다시 세운 법 > 바꾸기 전 조건 · 아무 회사');
  assert.ok(B.pick.ci.methodMinusBase[0] > 0 && B.pick.rc.p < 0.05 && B.pick.wf.A.pickDayShare >= 60 && B.pick.wf.A.fall <= B.pick.wf.A.fallBase, '넣는 잣대(1 ~ 4)');
  assert.equal(B.prev.final, 'C3+hi1', '바꾸기 전 조건이 나온 길도 남김');
});
