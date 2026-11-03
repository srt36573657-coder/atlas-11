#!/usr/bin/env node
// 빈 날 가장 가까운 회사 셋 — 따로 다시 세기(사장님 2026-11-03 12:01(+04) 「어 그렇게 해」 · 주문 1512 · docs/design/bloom-empty-2026-11-03)
//   엔진(site/next/theme-engine.js bloomOf near)도 낱 조건 셈(site/next/bloom-atoms.js)도 부르지 않고, 날마다 · 회사마다 고리로 다시 세어 theme-bloom.json near 와 맞댐
//   쓰는 법: node scripts/atlas11/verify/bloom_near_verify.mjs --site <사이트 폴더(atlas/data · next/data 가 든 곳)> [--months <bloom-months.json>]
//   끝 코드: 0 같음(또는 near 가 없어야 하는데 없음) · 1 다름 · 2 이 셈이 모르는 낱 조건(몸값 big2 · big3 · big4 + 업종 ix1 ~ ix4 만 셈) · 3 자료를 못 읽음
//   셈 약속(엔진과 같은 뜻 · 다른 셈)
//     셀 수 있음 = t ≥ 20 · t · t−5 · t−20 종가 있음 · t−19 ~ t 사이 하루 35% 넘게 튄 날 없음 · 그 스무 날 모두 앞날과 같은 값은 아님
//     싹 = 한 달(20거래일) 동안 시장보다 더 오른 % < 5 · 닷새 동안 ≥ 0
//     시장 · 업종 지수 = 하루 오른 비율 평균(35% 넘게 튄 날 뺌) · 업종은 회사 다섯 곳 넘는 곳만
//     몸값 위 % = 그날 셀 수 있는 회사끼리 (종가 × 지금 주식 수) 작은 쪽부터 차례 · (차례 + 1) ÷ 센 수 · 같으면 번호 차례
//     그 달 조건 = bloom-months.json(그 달 결정 · 결정 없는 달은 앞 달 것을 이어 씀 · 기록은 그 달 결정 날만)
//     가장 가까운 셋 = 셀 수 있음 · 싹 · 회사 조건은 그대로, 업종 조건만 빼고 업종이 더 오른 % 큰 차례 · 회사가 더 오른 % 큰 차례 · 번호 차례
//     기록 = 고를 때 안 본 날(t0 = 120 ~ 마지막 날 − 20) 가운데 고른 회사가 없던 날 · 한 달 뒤 결과가 난 회사(그 사이 35% 튐 없음) · 꽃 = 시장보다 5% 넘게 더 오름
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const W = 20, AH = 20, T0 = 120, JUMP = 0.35, NEAR_N = 3, BLOOM = 0.05;
const IXMIN = {ix1: 0, ix2: 5, ix3: 10, ix4: 15};
const BIG = {big2: v => v >= 0.8, big3: v => v <= 0.2, big4: v => v >= 0.5};
const IND = /^(iz|ix|iy|ib|i60|isz)/;

export function verifyNear(siteDir, monthsFile = null) {
  const dd = path.join(siteDir, 'atlas', 'data'), nd = path.join(siteDir, 'next', 'data');
  const J = f => JSON.parse(fs.readFileSync(f, 'utf8'));
  let dates, comp, cond, bloom, months;
  try {
    dates = J(path.join(dd, 'days.json')).dates; comp = J(path.join(dd, 'mkt.json')).companies; cond = J(path.join(dd, 'cond.json'));
    bloom = J(path.join(nd, 'theme-bloom.json'));
    months = J(monthsFile ?? path.join(nd, 'bloom-months.json')).months;
  } catch (e) { return {code: 3, why: '자료를 못 읽음 ' + e.message}; }
  const N = dates.length, T = N - 1, t1 = T - AH;
  const codes = fs.readdirSync(path.join(dd, 'co')).filter(f => /^[0-9][0-9A-Z]{5}\.json$/.test(f)).map(f => f.slice(0, 6)).filter(c => comp[c]).sort((a, b) => (a < b ? -1 : a > b ? 1 : 0));
  const P = codes.map(c => {
    const d = J(path.join(dd, 'co', c + '.json')), a = new Array(N).fill(0);
    if (Array.isArray(d.close) && Number.isInteger(d.k0)) d.close.forEach((v, j) => { const t = j + d.k0; if (t >= 0 && t < N && typeof v === 'number' && v > 0) a[t] = v; });
    return a;
  });
  const ok = v => v > 0;
  const jumpAt = (a, t) => t >= 1 && ok(a[t - 1]) && ok(a[t]) && Math.abs(a[t] / a[t - 1] - 1) >= JUMP;
  const index = rows => { const I = [100]; for (let t = 1; t < N; t++) { let s = 0, n = 0; for (const a of rows) { if (!ok(a[t - 1]) || !ok(a[t])) continue; const r = a[t] / a[t - 1] - 1; if (Math.abs(r) < JUMP) { s += r; n++; } } I.push(I[t - 1] * (1 + (n ? s / n : 0))); } return I; };
  const M = index(P);
  const mem = new Map(); codes.forEach((c, j) => { const g = comp[c].i; if (typeof g === 'string') { if (!mem.has(g)) mem.set(g, []); mem.get(g).push(j); } });
  const IDX = new Map(); for (const [g, js] of mem) if (js.length >= 5) IDX.set(g, index(js.map(j => P[j])));
  const rel = (a, t, k) => (a[t] / a[t - k]) / (M[t] / M[t - k]) - 1;
  const countOf = a => { const out = new Uint8Array(N); for (let t = W; t < N; t++) { if (!ok(a[t]) || !ok(a[t - 5]) || !ok(a[t - W])) continue; let same = 0, bad = false; for (let s = t - W + 1; s <= t; s++) { if (jumpAt(a, s)) { bad = true; break; } if (ok(a[s - 1]) && ok(a[s]) && a[s] === a[s - 1]) same++; } if (!bad && same < W) out[t] = 1; } return out; };
  const CNT = P.map(countOf);
  const sprout = (j, t) => CNT[j][t] === 1 && rel(P[j], t, W) * 100 < 5 && rel(P[j], t, 5) * 100 >= 0;
  // 몸값 위 % — 날마다 그날 셀 수 있는 회사끼리(지금 주식 수 = cond.json 몸값 ÷ 마지막 종가)
  const capOf = new Map(); const co = cond?.co; if (co && Array.isArray(co.c)) co.c.forEach((c, k) => { const v = co.cap?.[k]; if (typeof v === 'number' && v > 0) capOf.set(c, v); });
  const sh = codes.map((c, j) => { const a = P[j]; let last = 0; for (let t = N - 1; t >= 0; t--) if (ok(a[t])) { last = a[t]; break; } const v = capOf.get(c); return v && last ? v / last : NaN; });
  const SZP = new Map(); // t → Float64Array(C)
  const szpAt = t => { if (SZP.has(t)) return SZP.get(t); const js = []; for (let j = 0; j < codes.length; j++) if (CNT[j][t] && Number.isFinite(sh[j]) && ok(P[j][t])) js.push(j); js.sort((p, q) => P[p][t] * sh[p] - P[q][t] * sh[q] || p - q); const o = new Float64Array(codes.length).fill(NaN); js.forEach((j, r) => { o[j] = (r + 1) / js.length; }); SZP.set(t, o); return o; };
  const ixOf = (j, t) => { const I = IDX.get(comp[codes[j]].i); return I ? rel(I, t, W) : NaN; };
  // 그 달 조건 — 엔진 planOf 와 같은 뜻
  const list = (Array.isArray(months) ? months : []).filter(m => m && /^\d{4}-\d{2}$/.test(m.month ?? '')).sort((p, q) => (p.month < q.month ? -1 : 1));
  if (!list.length) return {code: 0, why: '달마다 결정이 없음 — near 없어야 함', expectNull: true, same: bloom.near == null};
  const by = new Map(list.map((m, q) => [m.month, q])), at = new Int32Array(N).fill(-1), carry = new Uint8Array(N);
  for (let t = 0, last = -1; t < N; t++) { const mo = dates[t].slice(0, 7); if (mo < list[0].month) continue; if (by.has(mo)) last = by.get(mo); else carry[t] = 1; at[t] = last; }
  const ruleOf = q => { // {ind, min, co: [fn]} | null(가까운 셋 없음) | 'unknown'
    const id = list[q]?.id; if (typeof id !== 'string') return null;
    const parts = id.split('&'), ind = parts.filter(x => x in IXMIN), cos = parts.filter(x => !IND.test(x));
    if (!(ind.length === 1 && cos.length >= 1 && cos.length === parts.length - 1)) return null;
    if (!cos.every(x => x in BIG)) return 'unknown';
    return {ind: ind[0], min: IXMIN[ind[0]], co: cos.map(x => BIG[x])};
  };
  const RQ = list.map((m, q) => ruleOf(q));
  const qT = at[T], rT = qT >= 0 ? RQ[qT] : null;
  if (rT === 'unknown') return {code: 2, why: '이 셈이 모르는 낱 조건 ' + list[qT].id};
  if (!rT) return {code: bloom.near == null ? 0 : 1, why: bloom.near == null ? '오늘 조건은 가까운 셋이 없음 — 맞음' : '오늘 조건은 가까운 셋이 없어야 하는데 있음'};
  const passCo = (r, j, t) => { const z = szpAt(t)[j]; return Number.isFinite(z) && r.co.every(f => f(z)); };
  const picksAny = (r, t) => { for (let j = 0; j < codes.length; j++) if (sprout(j, t) && passCo(r, j, t) && Number.isFinite(ixOf(j, t)) && ixOf(j, t) * 100 >= r.min) return true; return false; };
  const nearAt = (r, t) => {
    const rows = [];
    for (let j = 0; j < codes.length; j++) { if (!sprout(j, t) || !passCo(r, j, t)) continue; const ix = ixOf(j, t); if (!Number.isFinite(ix)) continue; rows.push({j, ix, x: rel(P[j], t, W)}); }
    rows.sort((p, q) => q.ix - p.ix || q.x - p.x || (codes[p.j] < codes[q.j] ? -1 : 1));
    return rows.slice(0, NEAR_N);
  };
  const doneAt = (j, t) => { const a = P[j]; if (!ok(a[t + AH])) return null; for (let s = t + 1; s <= t + AH; s++) if (jumpAt(a, s)) return null; return rel(a, t + AH, AH); };
  let n = 0, h = 0, bn = 0, bh = 0, days = 0, lo = -1;
  for (let t = T0; t <= t1; t++) {
    const q = at[t]; if (q < 0 || carry[t]) continue;
    const r = RQ[q]; if (r === 'unknown') return {code: 2, why: '이 셈이 모르는 낱 조건 ' + list[q].id + ' · ' + dates[t]}; if (!r) continue;
    if (picksAny(r, t)) continue;
    const rows = nearAt(r, t); if (!rows.length) continue;
    if (lo < 0) lo = t; days++;
    for (let j = 0; j < codes.length; j++) { if (!CNT[j][t]) continue; const e = doneAt(j, t); if (e == null) continue; bn++; if (e >= BLOOM) bh++; }
    for (const {j} of rows) { const e = doneAt(j, t); if (e == null) continue; n++; if (e >= BLOOM) h++; }
  }
  const today = picksAny(rT, T) ? [] : nearAt(rT, T).map(({j, ix, x}) => [codes[j], comp[codes[j]].n ?? codes[j], comp[codes[j]].i, Math.round(ix * 10000) / 100, Math.round(x * 10000) / 100]);
  const mine = {atom: list[qT].id.split('&').find(x => x in IXMIN), today, rec: {n, hits: h, baseN: bn, baseHits: bh, days, from: lo >= 0 ? dates[lo] : null, to: dates[t1]}};
  const E = bloom.near;
  const diffs = [];
  if (!E || typeof E !== 'object') diffs.push('theme-bloom.json near 가 없음');
  else {
    if (E.rule?.atom !== mine.atom) diffs.push(`조건 ${E.rule?.atom} ≠ ${mine.atom}`);
    const et = Array.isArray(E.today) ? E.today : [];
    if (et.length !== today.length) diffs.push(`오늘 ${et.length}곳 ≠ ${today.length}곳`);
    today.forEach((r, k) => { const e = et[k] ?? []; if (e[0] !== r[0]) diffs.push(`오늘 ${k + 1}번 ${e[0]} ≠ ${r[0]}`); else if (Math.abs((e[3] ?? NaN) - r[3]) > 0.011 || Math.abs((e[4] ?? NaN) - r[4]) > 0.011) diffs.push(`오늘 ${r[0]} % ${e[3]} · ${e[4]} ≠ ${r[3]} · ${r[4]}`); });
    for (const k of ['n', 'hits', 'baseN', 'baseHits', 'days', 'from', 'to']) if (E.rec?.[k] !== mine.rec[k]) diffs.push(`기록 ${k} ${E.rec?.[k]} ≠ ${mine.rec[k]}`);
  }
  return {code: diffs.length ? 1 : 0, mine, diffs};
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const a = process.argv.slice(2), arg = k => (a.includes(k) ? a[a.indexOf(k) + 1] : null);
  const r = verifyNear(arg('--site') ?? 'site', arg('--months'));
  console.log(JSON.stringify({code: r.code, why: r.why ?? null, diffs: r.diffs ?? [], today: r.mine?.today ?? null, rec: r.mine?.rec ?? null}));
  process.exit(r.code);
}
