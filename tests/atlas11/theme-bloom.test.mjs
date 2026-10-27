// 꽃 핀 업종 안의 싹 회사(사장님 2026-10-22 16:56 「싹에서 꽃이 되는 종목 … 엄선하고 검사해서 그것들만」 · theme-engine.js bloomOf) 시험
//   ① 저장소 자료로 올리기 셈(build)을 돌리고, 이 시험이 따로 짠 쉬운 셈(날마다 · 회사마다 고리)으로 같은 숫자가 나오는지 맞댐(앞 · 뒤 기록 · 오늘 목록)
//   ② 거래가 멈춘 회사(스물한 날 종가가 같음)는 오늘 목록에 없음
//   셈 약속 = docs/design/sprout-flower-2026-10-22/spec-v1.md v5 · 연구 셈 scripts/atlas11/research/sprout_flower.py · 따로 센 일꾼 숫자와 같아야 함
//   2026-10-27 17:34 부터 = 위 모습 + 회사 값이 반년 가장 높은 값 가까이(docs/design/sprout365-2026-10-27/spec.md · 연구 셈 scripts/atlas11/research/sprout365.py) — 바꾸기 전 모습은 old 로 나란히
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
  const T = N - 1, t0 = 120, t1 = T - 20, z = () => ({n: 0, h: 0, bn: 0, bh: 0, pn: 0, ph: 0, on: 0, oh: 0});
  let mid = D.findIndex((d, t) => t > t0 && d >= '2025-04-04'); if (mid < 0 || mid > t1) mid = Math.floor((t0 + t1) / 2); // 앞 · 뒤 가름 = 연구 셈 때의 가운데 날(spec v1)
  const R = {train: z(), test: z()}, today = [];
  let todayOld = 0;
  codes.forEach((c, j) => {
    const a = P[j], g = comp[c].i;
    for (let t = t0; t <= t1; t++) {
      if (!count(a, t) || !ok(a[t + 20])) continue;
      let jf = false; for (let s = t + 1; s <= t + 20; s++) if (jump(a, s)) { jf = true; break; } if (jf) continue;
      const hit = ex(a, t + 20, 20) >= 0.05, r = R[t < mid ? 'train' : 'test'];
      r.bn++; if (hit) r.bh++;
      if (sprout(a, t)) { r.pn++; if (hit) r.ph++; }
      if (sprout(a, t) && bloomInd(g, t)) { r.on++; if (hit) r.oh++; if (near(a, t)) { r.n++; if (hit) r.h++; } }
    }
    if (count(a, T) && sprout(a, T) && bloomInd(g, T)) { todayOld++; if (near(a, T)) today.push(c); }
  });
  return {R, today: today.sort(), todayOld, codes: codes.length, pct: (v, n) => (n ? Math.round((v / n) * 10000) / 100 : null)};
}

test('꽃 핀 업종 안의 싹 회사 — 올리기 셈 = 따로 짠 쉬운 셈(앞 · 뒤 기록 · 오늘 목록)', async () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'bloom-'));
  fs.mkdirSync(path.join(dir, 'atlas'), {recursive: true});
  fs.symlinkSync(DATA, path.join(dir, 'atlas', 'data'));
  await build({siteDir: dir, keptFile: path.join(dir, 'kept.json')});
  const B = JSON.parse(fs.readFileSync(path.join(dir, 'next', 'data', 'theme-bloom.json'), 'utf8'));
  const {R, today, todayOld, pct, codes} = brute();
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
  const RS = JSON.parse(fs.readFileSync(path.join(ROOT, 'reports', 'atlas11', 'research', 'sprout-flower-2026-10-22.json'), 'utf8'));
  assert.deepEqual(RS.passed, ['C3'], '앞 판에서 지나간 모습은 C3 하나(바꾸기 전 조건)');
  const CL = JSON.parse(fs.readFileSync(path.join(ROOT, 'docs', 'design', 'sprout365-2026-10-27', 'candidates.json'), 'utf8'));
  assert.equal(B.tried, CL.candidates.length, '고르는 조건 후보 수 = 셈 전에 적은 목록(365)');
  assert.equal(CL.candidates.length, 365);
  assert.ok(CL.candidates.some(c => c.id === 'iz1' && c.parts.join() === 'iz1'), '바꾸기 전 조건(C3 = iz1)도 후보 안에서 겨룸');
  const got = B.today.inds.flatMap(i => i.co.map(r => r[0])).sort();
  assert.equal(B.today.all, todayOld, '바꾸기 전 조건이면 오늘 수 = 쉬운 셈');
  assert.deepEqual(got, today, '오늘 목록(지금 조건)'); assert.equal(B.today.n, today.length);
  // 연구 셈(365 → 37 → 3 → 1)과 엔진 숫자 · 고른 길(PICK365)이 같음
  const RR = JSON.parse(fs.readFileSync(path.join(ROOT, 'reports', 'atlas11', 'research', 'sprout365-2026-10-27.json'), 'utf8'));
  assert.equal(RR.final, 'C3+hi1', '고른 하나');
  assert.equal(RR.final_test.pass, true, '뒤 기록에서 넣는 잣대를 넘음');
  assert.equal(B.pick.final, RR.final);
  assert.equal(B.pick.n, 365); assert.equal(B.pick.ok, RR.n_ok); assert.equal(B.pick.short, RR.top37.length);
  assert.deepEqual(B.pick.three.map(t => t.id), RR.top3, '셋');
  for (const t of B.pick.three) { const c = RR.candidates[t.id]; assert.deepEqual(t.train, {n: c.n, rate: c.rate, base: c.base}, '셋 앞 기록 ' + t.id); }
  for (const k of ['train', 'test']) {
    assert.equal(RR[k][0], B.span[k][0], k + ' 첫날'); assert.equal(RR[k][1], B.span[k][1], k + ' 끝날');
    const S = k === 'train' ? RR.options[RR.final] : RR.final_test;
    assert.equal(B.record[k].n, S.n, k + ' 연구 셈 n = 엔진'); assert.equal(B.record[k].rate, S.rate, k + ' 연구 셈 꽃 비율 = 엔진'); assert.equal(B.record[k].base, S.base, k + ' 연구 셈 바탕 = 엔진');
    assert.equal(B.record[k].old, RR.c3[k].rate, k + ' 바꾸기 전 조건 = 연구 셈 C3');
    assert.deepEqual({n: B.pick[k].n, rate: B.pick[k].rate, base: B.pick[k].base, old: B.pick[k].old}, {n: S.n, rate: S.rate, base: S.base, old: RR.c3[k].rate}, k + ' 고른 길 숫자 = 연구 셈');
  }
  assert.deepEqual(got, RR.today.rows.map(r => r[0]).sort(), '오늘 목록 = 연구 셈 오늘');
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

test('기록 달력 · 꽃이 못 된 까닭 · 고른 길 — 셈이 서로 맞음(사장님 2026-10-22 22:54 · spec v6 · v7 · 2026-10-27 17:34)', () => {
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
    else assert.ok(!seenWait, '기다림은 끝쪽에만 ' + d.d);
  }
  assert.equal(D.at(-1).n, B.today.n, '달력 마지막 날 고른 수 = 오늘 고른 수(지금 조건)');
  assert.ok(B.today.n <= B.today.all, '지금 조건은 바꾸기 전 조건 안');
  for (const k of ['all', 'train', 'test']) assert.equal(B.why[k].why.reduce((p, x) => p + x, 0), B.why[k].miss, '까닭 합 ' + k);
  assert.equal(B.why.all.miss, B.why.train.miss + B.why.test.miss, '모든 못 됨 = 앞 + 뒤');
  for (const k of ['all', 'train', 'test']) { const R = B.record[k]; assert.ok(Math.abs((R.n - B.why[k].miss) - (R.rate * R.n) / 100) < 1, '꽃 = n − 못 됨 ' + k); }
  assert.equal(B.fix, undefined, '옛 고쳐 본 것 다섯(모두 못 지나감)은 365 셈이 대신함');
  for (const k of ['all', 'train', 'test']) assert.ok(B.record[k].n <= B.record[k].oldN, '지금 조건은 바꾸기 전 조건 안 ' + k);
  assert.equal(B.rule.hiWin, 120); assert.equal(B.rule.hiNear, 95);
  assert.ok(B.pick.test.rate > B.pick.test.old && B.pick.test.rate > B.pick.test.base, '뒤 기록: 지금 조건 > 바꾸기 전 조건 · 아무 회사');
});
