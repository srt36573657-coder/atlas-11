// 꽃 핀 업종 안의 싹 회사(사장님 2026-10-22 16:56 「싹에서 꽃이 되는 종목 … 엄선하고 검사해서 그것들만」 · theme-engine.js bloomOf) 시험
//   ① 저장소 자료로 올리기 셈(build)을 돌리고, 이 시험이 따로 짠 쉬운 셈(날마다 · 회사마다 고리)으로 같은 숫자가 나오는지 맞댐(앞 · 뒤 기록 · 오늘 목록)
//   ② 거래가 멈춘 회사(스물한 날 종가가 같음)는 오늘 목록에 없음
//   셈 약속 = docs/design/sprout-flower-2026-10-22/spec-v1.md v5 · 연구 셈 scripts/atlas11/research/sprout_flower.py · 따로 센 일꾼 숫자와 같아야 함
//   2026-10-27 17:34 부터 = 위 모습 + 회사 값이 반년 가장 높은 값 가까이(docs/design/sprout365-2026-10-27/spec.md · 연구 셈 scripts/atlas11/research/sprout365.py) — 바꾸기 전 모습은 old 로 나란히
//   2026-11-02 부터 = 다시 세운 조건(주문 0815 · docs/design/bloom-evolve-2026-11-02/spec.md · scripts/atlas11/research/bloom_evolve.py) — 싹 + 그날 몸값 위 20% + 업종 한 달 15% 넘게
//     바꾸기 전 조건(업종 꽃 자리 + 싹 + 반년 가장 높은 값 가까이)은 old 로 나란히 · 가름 날 2026-09-10(고를 때 안 본 기록) · 회사마다 지난 기록(든 날 · 꽃) · 안 본 기록만(honest)
import {test} from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {build} from '../../scripts/atlas11/next/build/theme.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const DATA = path.join(ROOT, 'site', 'atlas', 'data');

function brute() {
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
  let mid = D.findIndex((d, t) => t > t0 && d >= '2026-09-10'); if (mid < 0 || mid > t1) mid = t1 + 1; // 가름 날 = 다시 세운 조건을 고를 때 안 본 첫날
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

test('꽃 될 회사 — 올리기 셈 = 따로 짠 쉬운 셈(고를 때 본 · 안 본 기록 · 오늘 목록 · 회사마다 지난 기록)', async () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'bloom-'));
  fs.mkdirSync(path.join(dir, 'atlas'), {recursive: true});
  fs.symlinkSync(DATA, path.join(dir, 'atlas', 'data'));
  await build({siteDir: dir, keptFile: path.join(dir, 'kept.json')});
  const B = JSON.parse(fs.readFileSync(path.join(dir, 'next', 'data', 'theme-bloom.json'), 'utf8'));
  const {R, today, todayOld, past, pct, codes} = brute();
  for (const k of ['train', 'test']) {
    assert.equal(B.record[k].n, R[k].n, k + ' n');
    assert.equal(B.record[k].baseN, R[k].bn, k + ' 바탕 n');
    assert.equal(B.record[k].rate, pct(R[k].h, R[k].n), k + ' 꽃 비율');
    assert.equal(B.record[k].base, pct(R[k].bh, R[k].bn), k + ' 바탕 꽃 비율');
    assert.equal(B.record[k].plainN, R[k].pn, k + ' 그냥 싹 n');
    assert.equal(B.record[k].plain, pct(R[k].ph, R[k].pn), k + ' 그냥 싹 꽃 비율');
    assert.equal(B.record[k].oldN, R[k].on, k + ' 바꾸기 전 조건 n');
    assert.equal(B.record[k].old, pct(R[k].oh, R[k].on), k + ' 바꾸기 전 조건 꽃 비율');
  }
  assert.equal(B.record.all.n, B.record.train.n + B.record.test.n, '모든 날 = 앞 + 뒤');
  assert.equal(Object.values(B.record.years).reduce((p, y) => p + y.n, 0), B.record.all.n, '해마다 합 = 모든 날');
  assert.equal(B.companies, codes, '본 회사 수');
  const CL = JSON.parse(fs.readFileSync(path.join(ROOT, 'docs', 'design', 'bloom-evolve-2026-11-02', 'candidates.json'), 'utf8'));
  assert.equal(B.tried, CL.candidates, '고르는 조건 후보 수 = 셈 전에 적은 목록(11,874)');
  assert.equal(CL.candidates, CL.atoms.length + CL.pairs); assert.equal(CL.atoms.length, 156);
  for (const id of ['iz1', 'hi1', 'big2', 'ix4']) assert.ok(CL.atoms.some(a => a.id === id), '낱 조건 안에 ' + id + '(바꾸기 전 조건 · 지금 조건도 겨룸)');
  const got = B.today.inds.flatMap(i => i.co.map(r => r[0])).sort();
  assert.equal(B.today.all, todayOld, '바꾸기 전 조건이면 오늘 수 = 쉬운 셈');
  assert.deepEqual(got, today, '오늘 목록(지금 조건)'); assert.equal(B.today.n, today.length);
  for (const i of B.today.inds) for (const r of i.co) { assert.deepEqual([r[4], r[5]], past[r[0]], '회사마다 지난 기록(든 날 · 꽃) ' + r[0]); assert.ok(r[6] == null || (r[6] >= 1 && r[6] <= 20), '몸값 위 20% 안 ' + r[0]); }
  // 연구 셈(달마다 걸어가며 고르기 · 운 걸러내기)과 엔진 숫자 · 다시 세운 길(PICK_EVOLVE)이 같음
  const RR = JSON.parse(fs.readFileSync(path.join(ROOT, 'reports', 'atlas11', 'research', 'bloom-evolve-2026-11-02.json'), 'utf8'));
  assert.equal(RR.final.id, 'big2&ix4', '마지막 하나'); assert.equal(B.pick.final.id, RR.final.id);
  assert.ok(Object.values(RR.rules).every(Boolean), '넣는 잣대 넷(연구 셈) 모두 넘음');
  assert.deepEqual({n: B.record.all.n, rate: B.record.all.rate, base: B.record.all.base}, {n: RR.final.n, rate: RR.final.rate, base: RR.final.base}, '고를 때 본 기록 = 연구 셈 마지막 하나');
  assert.deepEqual(B.pick.final.train, {from: B.span.from, to: RR.tl, n: RR.final.n, rate: RR.final.rate, base: RR.final.base, pickDayShare: RR.final.pickDayShare}, '마지막 하나 고를 때 본 기록(T0 ~ TL)');
  assert.equal(pct(B.record.train.pickDays, B.record.train.days), RR.final.pickDayShare, '고른 날 몫(엔진) = 연구 셈 마지막 하나');
  assert.equal(B.record.all.days, B.record.train.days + B.record.test.days, '모든 날 수 = 앞 + 뒤'); assert.equal(B.record.all.pickDays, B.record.train.pickDays + B.record.test.pickDays, '고른 날 = 앞 + 뒤');
  assert.equal(B.pick.n, RR.candidates); assert.equal(B.pick.atoms, RR.atoms); assert.equal(B.pick.pairs, RR.pairs); assert.equal(B.pick.months, RR.steps.length);
  const A = RR.periodA, Bp = RR.periodB;
  assert.deepEqual(B.pick.wf.A, {from: A.method.from, to: A.method.to, n: A.method.n, hits: A.method.hits, rate: A.method.rate, base: A.method.base, baseN: A.method.baseN, baseHits: A.method.baseHits, pickDayShare: A.method.pickDayShare, fall: A.method.fall, fallBase: A.method.fallBase, cur: A.current.rate, sprout: A.sprout.rate}, '안 본 기록 A = 연구 셈');
  assert.deepEqual(B.pick.wf.B, {from: Bp.method.from, to: Bp.method.to, n: Bp.method.n, hits: Bp.method.hits, rate: Bp.method.rate, base: Bp.method.base, fall: Bp.method.fall, fallBase: Bp.method.fallBase, cur: Bp.current.rate, curN: Bp.current.n, sprout: Bp.sprout.rate}, '안 본 기록 B = 연구 셈');
  assert.deepEqual(B.pick.ci, RR.ci); assert.deepEqual(B.pick.rc, {eligible: RR.rc.eligible, p: RR.rc.p});
  assert.deepEqual(got, RR.today.rows.map(r => r.c).sort(), '오늘 목록 = 연구 셈 오늘');
  for (const r of RR.today.rows) assert.deepEqual(past[r.c], [r.pastDays, r.pastHits], '회사마다 지난 기록 = 연구 셈 ' + r.c);
  // 안 본 기록만(honest) = 연구 A + 엔진 test
  assert.equal(B.honest.n, A.method.n + B.record.test.n); assert.equal(B.honest.hits, A.method.hits + B.record.test.hits);
  assert.equal(B.honest.rate, pct(A.method.hits + B.record.test.hits, A.method.n + B.record.test.n));
  assert.equal(B.honest.base, pct(A.method.baseHits + B.record.test.baseHits, A.method.baseN + B.record.test.baseN));
  assert.equal(B.span.train[1] <= '2026-09-09', true, '고를 때 본 기록은 2026-09-09 까지'); assert.equal(B.span.test[0], '2026-09-10');
  fs.rmSync(dir, {recursive: true, force: true});
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
  assert.equal(B.rule.hiWin, 120); assert.equal(B.rule.hiNear, 95); assert.equal(B.rule.bigTop, 20); assert.equal(B.rule.ixMin, 15);
  const W = B.pick.wf.B;
  assert.ok(W.rate > W.cur && W.rate > W.base, '안 본 기록 B: 다시 세운 법 > 바꾸기 전 조건 · 아무 회사');
  assert.ok(B.pick.ci.methodMinusBase[0] > 0 && B.pick.rc.p < 0.05 && B.pick.wf.A.pickDayShare >= 60 && B.pick.wf.A.fall <= B.pick.wf.A.fallBase, '넣는 잣대(1 ~ 4)');
  assert.equal(B.prev.final, 'C3+hi1', '바꾸기 전 조건이 나온 길도 남김');
});
