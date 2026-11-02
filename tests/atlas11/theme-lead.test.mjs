// 업종 안에서 돈이 가장 많이 몰린 회사(사장님 2026-11-02 10:38(+04) 주문 1538 「돈이 몰린 종목 업종을 … 첫화면에」 · docs/design/home-two-2026-11-02/order-1538.txt ② · theme-engine.js leadOf) 시험
//   ① 작은 가짜 자료로 잣대 하나하나(는 몸값 = 원 · 같으면 번호 작은 쪽 · 튄 날 · 빈 값 · 몸값 없음 · 0 이하면 없음)
//   ② 저장소 자료로 올리기 셈(build)을 돌리고, 이 시험이 따로 짠 쉬운 셈(회사마다 스물한 날 창 · 줄 세우기)으로 업종마다 같은 회사 · 같은 값인지 맞댐
//   ③ 첫 화면 파일(theme-home.json)은 돈이 몰린 곳 셋(x 큰 차례 · x > 0 · 앞 셋 — home-new.js flowRows 와 같은 고르기)에만 lead · 옛 칸은 그대로 · 6KB 아래
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {build} from '../../scripts/atlas11/next/build/theme.mjs';
import {leadOf, RULE} from '../../site/next/theme-engine.js';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const DATA = path.join(ROOT, 'site', 'atlas', 'data');
const J = f => JSON.parse(fs.readFileSync(f, 'utf8'));
const HOME_MAX = 6_144; // 첫 화면 칸 파일 6KB 아래

test('잣대 — 는 몸값(원)이 가장 큰 회사 · 같으면 번호 작은 쪽 · 튄 날 · 빈 값 · 몸값 없음 · 0 이하면 없음', () => {
  const N = 40, T = N - 1, k = RULE.win;
  const ramp = (p0, p1) => Float64Array.from({length: N}, (_, t) => (t <= T - k ? p0 : p0 + (p1 - p0) * (t - (T - k)) / k)); // T − 20 까지 p0 · 그 뒤 날마다 조금씩 · T 에 p1
  const co = {}, closes = new Map(), caps = new Map();
  const put = (c, a, cap) => { closes.set(c, a); co[c] = {n: '회사' + c, i: '가 업종'}; if (cap != null) caps.set(c, cap); };
  put('100001', ramp(100, 200), 1000); // 주식 수 1000 ÷ 200 = 5 · 는 몸값 (200 − 100) × 5 = 500
  put('100002', ramp(100, 150), 3000); // 주식 수 20 · 는 몸값 50 × 20 = 1000 — 덜 올랐어도 큰 회사가 원으로는 더 많이
  assert.deepEqual(leadOf(['100001', '100002'], closes, co, caps, T), ['100002', '회사100002', 1000]);
  // 같은 값이면 번호 작은 쪽(줄 차례와 상관없이)
  put('100000', ramp(100, 150), 3000);
  assert.deepEqual(leadOf(['100002', '100001', '100000'], closes, co, caps, T), ['100000', '회사100000', 1000]);
  // T − 19 ~ T 에 하루 |r| ≥ 0.35 인 날이 있으면 뺌 — 창 첫 짝(T − 20 → T − 19)도 창 안 · 그 앞 짝(T − 21 → T − 20)은 창 밖
  const jIn = ramp(100, 300); jIn[T - 19] = jIn[T - 20] * (1 + RULE.jump); put('100003', jIn, 9000);
  assert.equal(leadOf(['100003', '100002'], closes, co, caps, T)[0], '100002', '창 안 튄 날');
  const jOut = ramp(100, 300); for (let t = 0; t < T - k; t++) jOut[t] = 50; put('100004', jOut, 9000); // T − 21 → T − 20 = +100%(창 밖)
  assert.deepEqual(leadOf(['100004', '100002'], closes, co, caps, T), ['100004', '회사100004', 6000], '창 밖 튄 날은 셈 그대로 · (300 − 100) × 9000 ÷ 300');
  // 빈 날을 건너뛴 큰 변화는 튄 날이 아님(bloomOf J 와 같은 잣대 — 두 날 값이 다 있을 때만 맞댐)
  const gap = ramp(100, 300); gap[T - 10] = 0; gap[T - 9] = gap[T - 11] * 1.5; put('100005', gap, 9000);
  assert.equal(leadOf(['100005', '100002'], closes, co, caps, T)[0], '100005', '빈 날 건너뜀');
  // close(T) · close(T − 20) 가운데 빈 것 · 몸값 없음 · 0 · NaN 이면 뺌
  const e20 = ramp(100, 300); e20[T - k] = 0; put('100006', e20, 9000);
  const eT = ramp(100, 300); eT[T] = 0; put('100007', eT, 9000);
  put('100008', ramp(100, 300)); put('100009', ramp(100, 300), 0); put('100010', ramp(100, 300), NaN);
  assert.equal(leadOf(['100006', '100007', '100008', '100009', '100010', '100002'], closes, co, caps, T)[0], '100002', '셀 수 없는 회사는 뺌');
  // 멈춤(스물한 날 종가가 모두 같음) · 내린 회사뿐이면 없음 · 업종에 회사가 없으면 없음 · 이름이 없으면 번호
  put('100011', Float64Array.from({length: N}, () => 500), 9000); put('100012', ramp(200, 100), 9000);
  assert.equal(leadOf(['100011', '100012'], closes, co, caps, T), null);
  assert.equal(leadOf([], closes, co, caps, T), null);
  assert.equal(leadOf(['100002'], closes, co, caps, k - 1), null, '날이 스무 날보다 적음');
  assert.deepEqual(leadOf(['100002'], closes, {}, caps, T), ['100002', '100002', 1000]);
});

/** 따로 짠 쉬운 셈 — 저장소 자료를 직접 읽어 업종마다 한 달 동안 몸값이 원으로 가장 많이 는 회사(엔진 코드를 쓰지 않음) */
function brute() {
  const D = J(path.join(DATA, 'days.json')).dates, N = D.length, T = N - 1;
  const comp = J(path.join(DATA, 'mkt.json')).companies;
  const cond = J(path.join(DATA, 'cond.json')).co, cap = new Map();
  cond.c.forEach((c, j) => { const v = cond.cap[j]; if (typeof v === 'number' && v > 0) cap.set(c, v); });
  const P = new Map();
  for (const f of fs.readdirSync(path.join(DATA, 'co')).filter(x => /^[0-9][0-9A-Z]{5}\.json$/.test(x)).sort()) {
    const c = f.slice(0, 6); if (!comp[c]) continue;
    let d; try { d = J(path.join(DATA, 'co', f)); } catch { continue; }
    if (!Array.isArray(d?.close) || !Number.isInteger(d?.k0)) continue;
    const a = new Array(N).fill(0); d.close.forEach((v, j) => { const t = j + d.k0; if (t >= 0 && t < N && typeof v === 'number' && v > 0) a[t] = v; });
    P.set(c, a);
  }
  const mem = {};
  for (const c of [...P.keys()].sort()) { const g = comp[c].i; if (typeof g === 'string') (mem[g] ??= []).push(c); }
  const out = {};
  for (const [g, cs] of Object.entries(mem)) {
    if (cs.length < 5) continue; // 회사 다섯 곳 아래 업종은 셈 밖(결정표 1)
    const rows = [];
    for (const c of cs) {
      const a = P.get(c), w = a.slice(T - 20, T + 1), v = cap.get(c);
      if (!(w[0] > 0) || !(w[20] > 0) || v === undefined) continue;
      let bad = false; for (let s = 1; s <= 20; s++) if (w[s - 1] > 0 && w[s] > 0 && Math.abs(w[s] / w[s - 1] - 1) >= 0.35) bad = true;
      if (bad || w.every(x => x === w[0])) continue;
      const last = a.findLast(x => x > 0);
      rows.push({c, g: (w[20] - w[0]) * (v / last)});
    }
    rows.sort((p, q) => q.g - p.g || (p.c < q.c ? -1 : p.c > q.c ? 1 : 0));
    out[g] = rows.length && rows[0].g > 0 ? [rows[0].c, comp[rows[0].c].n ?? rows[0].c, Math.round(rows[0].g)] : null;
  }
  return {asOf: D[T], leads: out, comp};
}

/** 돈이 몰린 곳 셋 — 첫 화면이 줄 세우는 그대로(x 가 있는 업종 · x 큰 차례 · 같으면 처음 차례 · x > 0 · 앞 셋) */
const flowTop = inds => inds.filter(i => typeof i.x === 'number' && Number.isFinite(i.x) && typeof i.n === 'string').sort((a, b) => b.x - a.x).filter(i => i.x > 0).slice(0, 3).map(i => i.n);
const leadShape = (v, what) => {
  if (v === null) return;
  assert.ok(Array.isArray(v) && v.length === 3, what + ' 꼴 [번호, 이름, 억 원]');
  assert.match(v[0], /^[0-9][0-9A-Z]{5}$/, what + ' 번호'); assert.ok(typeof v[1] === 'string' && v[1].length > 0, what + ' 이름'); assert.ok(Number.isInteger(v[2]) && v[2] >= 0, what + ' 억 원 정수');
};

test('저장소 자료 — 업종마다 lead = 따로 짠 쉬운 셈 · 첫 화면 파일은 돈이 몰린 곳 셋에만 · 옛 칸 그대로 · 6KB 아래', async () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'theme-lead-'));
  fs.mkdirSync(path.join(dir, 'atlas'), {recursive: true});
  fs.symlinkSync(DATA, path.join(dir, 'atlas', 'data'));
  await build({siteDir: dir, keptFile: path.join(dir, 'kept.json')});
  const th = J(path.join(dir, 'next', 'data', 'theme.json')), hf = path.join(dir, 'next', 'data', 'theme-home.json'), hm = J(hf);
  const B = brute();
  assert.equal(th.asOf, B.asOf, '같은 자료 날');
  // theme.json — 모든 업종에 lead 칸(없으면 null) · 쉬운 셈과 업종마다 같음
  assert.deepEqual(th.inds.map(i => i.n).sort(), Object.keys(B.leads).sort(), '업종 열 = 쉬운 셈');
  for (const i of th.inds) {
    assert.ok('lead' in i, i.n + ' lead 칸'); leadShape(i.lead, i.n);
    assert.deepEqual(i.lead, B.leads[i.n], i.n + ' 돈이 가장 많이 몰린 회사 = 쉬운 셈');
    if (i.lead) assert.equal(B.comp[i.lead[0]].i, i.n, i.n + ' 같은 업종 회사');
  }
  assert.ok(th.inds.filter(i => i.lead).length >= th.inds.length / 2, '셀 수 있는 업종이 절반 넘게(빈 셈이 아님)');
  // theme-home.json — 돈이 몰린 곳 셋에만 lead(theme.json 과 같은 값) · 나머지는 없음
  const up = flowTop(hm.inds);
  assert.ok(up.length >= 1 && up.length <= 3, '돈이 몰린 곳 ' + up.length);
  assert.deepEqual(up, flowTop(th.inds), '첫 화면 파일 x 로 고른 셋 = theme.json x 로 고른 셋');
  assert.deepEqual(hm.inds.filter(i => 'lead' in i).map(i => i.n).sort(), [...up].sort(), 'lead 는 돈이 몰린 곳 셋에만');
  for (const n of up) { const a = hm.inds.find(i => i.n === n); assert.deepEqual(a.lead, th.inds.find(i => i.n === n).lead, n); assert.deepEqual(a.lead, B.leads[n], n + ' = 쉬운 셈'); }
  // 옛 칸 그대로 — 싹 앞 셋은 꼬리 · 점 · 며칠째까지 · 나머지는 이름 · 무리 · 자리 · x · y 만
  assert.deepEqual(Object.keys(hm), ['schema', 'made', 'asOf', 'provisional', 'recFrom', 'recTo', 'count', 'order', 'record', 'inds']);
  assert.deepEqual(hm.inds.map(i => i.n), th.inds.map(i => i.n), '업종 차례 그대로');
  for (const a of hm.inds) {
    const b = th.inds.find(i => i.n === a.n), keys = hm.order.S.includes(a.n) ? ['n', 'g', 'z', 'x', 'y', 'd', 't', 'dots', 'sc'] : ['n', 'g', 'z', 'x', 'y'];
    assert.deepEqual(Object.keys(a).filter(x => x !== 'lead'), keys, a.n + ' 칸');
    for (const x of keys) assert.deepEqual(a[x], b[x], a.n + ' ' + x);
  }
  assert.ok(fs.statSync(hf).size < HOME_MAX, '첫 화면 칸 파일 6KB 아래 ' + fs.statSync(hf).size);
  fs.rmSync(dir, {recursive: true, force: true});
});

test('올린 파일(site/next/data) — theme.json 모든 업종에 lead 칸 · theme-home.json 은 돈이 몰린 곳 셋에만 · 6KB 아래', () => {
  const th = J(path.join(ROOT, 'site', 'next', 'data', 'theme.json')), hf = path.join(ROOT, 'site', 'next', 'data', 'theme-home.json'), hm = J(hf);
  for (const i of th.inds) { assert.ok('lead' in i, i.n + ' lead 칸'); leadShape(i.lead, i.n); }
  assert.equal(hm.asOf, th.asOf);
  const up = flowTop(hm.inds);
  assert.deepEqual(hm.inds.filter(i => 'lead' in i).map(i => i.n).sort(), [...up].sort(), 'lead 는 돈이 몰린 곳 셋에만');
  for (const n of up) assert.deepEqual(hm.inds.find(i => i.n === n).lead, th.inds.find(i => i.n === n).lead, n + ' 두 파일이 같은 값');
  assert.ok(fs.statSync(hf).size < HOME_MAX, '첫 화면 칸 파일 6KB 아래 ' + fs.statSync(hf).size);
});
