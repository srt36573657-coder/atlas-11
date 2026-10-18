#!/usr/bin/env node
// 고도리 칸 고르는 셈 gdr-v2(사장님 2026-10-18 00:15 「72개와 카톡 두 번 가입」 [8] 1 · 2 · 4 ~ 10 · [9] 1 · 결정표 docs/design/godori-2026-10-18/gdr-v2.md)
//   회사 주식 모두 → 먼저 뺌(거래 적음 · 거래 멈춤 짐작 · 거래소 · DART 목록) → 조건 다섯(모두 「그리고」) → 차례 → 한 업종 1곳(많아도 2곳) · 큰 업종 비중 위 끝 · 36곳까지 → 비중 3 · 2.5 · 2 + 현금으로 둠
//   그날 알 수 있던 것만: 값 · 거래량 · 업종 셈 = 그날까지 · 해마다 결산 = 끝 달 + 4 달째 1일부터 · 분기 = 끝 달 + 3 달째 1일부터 · 예상 칸은 안 읽음
//   「?」(값 · 목록 · 분기 자료가 없음)는 지나지 못함 · 모자라면 채우지 않음
//   [9] 1: 팔 선 · 절반 팔 선 · 금액은 공개 파일(gdr.json · gates.json)에 넣지 않음 — --private <파일> 로만 씀(기록은 지우지 않음)
//   내보냄: loadData(...) · selectOn(data, k, opts) · VERSION · RULES2 · TH · 그 밖 시험용
//   쓰는 법: node scripts/atlas11/next/gdr/pick2.mjs [--bundle <모음>] [--site site/atlas/data] [--quarters <분기 파일>] [--lists <목록 파일>]
//            [--out site/next/data/gdr.json] [--gates site/next/data/gates.json] [--private <파일>] [--prev <앞 gdr.json>] [--asof YYYY-MM-DD] [--check]
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {loadData as loadRaw} from './v2/data.mjs';
import {fracFixed, fracNum, floorTick, fnv1a, mulberry32, and3} from './v2/num.mjs';

export const VERSION = 'gdr-v2', SCHEMA = 'godori-gdr-2', GATES_SCHEMA = 'godori-gates-2';
export const GATE_NAMES = ['이익 늘었나', '아직 조용한가', '석 달 천천히 올랐나', '두 배 넘게 안 올랐나', '돈 들어오는 업종인가']; // 사장님 다섯 문 이름 그대로
/** 문턱(결정표 「문턱 표」 — 값을 바꾸면 새 판 이름) */
export const RULES2 = Object.freeze({
  thin: 1000000000, // X1 한 달(20거래일) 하루 평균 거래대금 10억 원 아래면 뺌
  opGrow: 0, salesGrow: 0, lossYears: 3, // G1 4분기 합 영업이익 · 매출이 늘었나(%) · 3해 모두 영업이익 · 순이익 0 이상
  quietX: 2, hot5: 10, r20: 25, // G2 한 달 평균 거래대금 ≤ 그 앞 120거래일 평균의 2배 · 5거래일 오름 < 10% · 한 달 오름 ≤ 25%
  r60lo: 5, r60hi: 40, jump: 15, mdd60: 20, dd0: 15, // G3 석 달 오름 5 ~ 40% · 하루 +15% 넘게 뛴 날 없음 · 석 달 안 가장 깊은 빠짐 ≤ 20% · 오늘 석 달 꼭대기보다 15% 넘게 아래 아님
  low2x: 2, // G4 1년 가장 낮은 종가의 2배 아래
  indX: 1.1, indMed: 0, // G5 업종 거래 1.1배 이상 · 업종 회사 한 달 오름 가운데값 > 0%
  need: 5, // 다섯 문 모두(「다섯 중 넷」이면 4)
  perInd: 1, perInd2: 2, corr2: 0.5, bigCap: 9, max: 36, w: [3, 2.5, 2], // 한 업종 1곳 · 둘째는 상관 0.5 아래일 때만 · 큰 업종 비중 합 9 까지 · 36곳 · 비중
  sellZ: 1.5, sellH: 20, volDays: 250, // 팔 선 = 종가 × e^(−1.5 × 하루 출렁임 × √20)
  fall3: 3, fall3Pct: 3, fall3Days: 250, // 「세 곳이 함께 내린 날」 = 고른 곳 셋 이상이 같은 날 −3% 이하
  mcN: 2000, mcH: 20, mcWin: [250, 60], // 몬테카를로 2,000번 · 한 달 · 지난 1년 / 석 달 하루 오름
});
/** 흔들어 볼 문턱(결정표 「흔들기」) — s = 한 칸(빡빡한 쪽 부호) · 값의 10% · 0 인 문턱은 정해 둔 칸 */
export const TH = [
  {key: 'thin', gate: 'x', step: +100000000},
  {key: 'opGrow', gate: 'g1', step: +5}, {key: 'salesGrow', gate: 'g1', step: +5},
  {key: 'quietX', gate: 'g2', step: -0.2}, {key: 'hot5', gate: 'g2', step: -1}, {key: 'r20', gate: 'g2', step: -2.5},
  {key: 'r60lo', gate: 'g3', step: +0.5}, {key: 'r60hi', gate: 'g3', step: -4}, {key: 'jump', gate: 'g3', step: -1.5}, {key: 'mdd60', gate: 'g3', step: -2}, {key: 'dd0', gate: 'g3', step: -1.5},
  {key: 'low2x', gate: 'g4', step: -0.2},
  {key: 'indX', gate: 'g5', step: +0.11}, {key: 'indMed', gate: 'g5', step: +1},
];
const GI = {g1: 0, g2: 1, g3: 2, g4: 3, g5: 4};
const P = t => Math.round(t * 1000); // 문턱(%) × 1000 → 정수(곱셈으로 정확히 견줌)

export function loadData(o = {}) { return loadRaw(o); }

/* ---------- 날 k 의 셈 바탕(업종 셈은 문턱 짝마다 한 번) ---------- */
const winTv = (data, n, a, b) => { if (a < 0) return null; const p = n * (data.D + 1); if (data.missPre[p + b + 1] - data.missPre[p + a] > 0) return null; return data.tvPre[p + b + 1] - data.tvPre[p + a]; };
const cl = (data, n, d) => { if (d < 0) return null; const v = data.close[n * data.D + d]; return v > 0 ? v : null; };
function indInfo(data, k, R, memo) {
  const key = R.indX + '|' + R.indMed; if (memo.has(key)) return memo.get(key);
  const X = BigInt(P(R.indX)), M = P(R.indMed), out = data.inds.map((_, i) => {
    if (k - 79 < 0) return {trade: null, med: null, s20: null, s60: null, medV: null};
    const T = data.indTvPre[i], s20 = T[k + 1] - T[k - 19], s60 = T[k - 19] - T[k - 79];
    const trade = s60 > 0n ? +(3000n * s20 >= X * s60) : null;
    const ch = [];
    for (const n of data.indMembers[i]) { const a = cl(data, n, k), b = cl(data, n, k - 20); if (a && b) ch.push([BigInt(a), BigInt(b)]); }
    ch.sort((x, y) => { const d = x[0] * y[1] - y[0] * x[1]; return d < 0n ? -1 : d > 0n ? 1 : 0; });
    let med = null, medV = null; const m = ch.length, S = 100000n, SM = 100000n + BigInt(M);
    if (m % 2) { const [a, b] = ch[(m - 1) / 2]; med = +(S * a > SM * b); medV = [a - b, b]; }
    else if (m) { const [a1, b1] = ch[m / 2 - 1], [a2, b2] = ch[m / 2]; med = +(S * (a1 * b2 + a2 * b1) > 2n * SM * b1 * b2); medV = [a1 * b2 + a2 * b1 - 2n * b1 * b2, 2n * b1 * b2]; }
    return {trade, med, s20, s60, medV};
  });
  memo.set(key, out); return out;
}
/** 해마다 결산 중 그날 쓸 수 있는 것(끝 달 차례) */
const fyUsable = (data, n, day) => data.fy[n].filter(f => f.from <= day);
const qNext = key => { let y = +key.slice(0, 4), m = +key.slice(4, 6) + 3; if (m > 12) { m -= 12; y++; } return y + String(m).padStart(2, '0'); };
/** 4분기 합 지금 · 한 분기 앞(분기 자료 5분기 이어짐) 또는 해마다 결산(지난 성적만) — {src, now: {op, sales}, prev: {op, sales}} 또는 null */
function ttmOf(data, n, day, annualTtm) {
  const Q = data.quarters?.get(data.codes[n]);
  if (Q) {
    // 결산 달 분기(12월 결산이면 12월 분기)는 해마다 결산과 같이 끝 달 + 4 달째 1일부터 · 다른 분기는 + 3 달째 1일부터
    const fyM = data.fy[n].length ? data.fy[n][data.fy[n].length - 1].key.slice(4, 6) : '12';
    const u = Q.filter(r => (r.key.slice(4, 6) === fyM ? monthFrom(r.key, 4) : r.from) <= day);
    if (u.length >= 5) {
      const q = u.slice(-5);
      const ok = q.every((r, i) => (i === 0 || r.key === qNext(q[i - 1].key)) && Number.isFinite(r.op) && Number.isFinite(r.sales));
      if (ok) { const sum = (a, b, f) => q.slice(a, b).reduce((s, r) => s + r[f], 0); return {src: 'q', key: q[4].key, now: {op: sum(1, 5, 'op'), sales: sum(1, 5, 'sales')}, prev: {op: sum(0, 4, 'op'), sales: sum(0, 4, 'sales')}}; }
    }
  }
  if (annualTtm) {
    const f = fyUsable(data, n, day);
    if (f.length >= 2) { const a = f[f.length - 1], b = f[f.length - 2]; if ([a.op, b.op, a.sales, b.sales].every(Number.isFinite)) return {src: 'fy', key: a.key, now: {op: a.op, sales: a.sales}, prev: {op: b.op, sales: b.sales}}; }
  }
  return null;
}
/** 늘었나: 100 × (지금 − 앞) > g × |앞| (g = 0 이면 지금 > 앞) */
const grew = (now, prev, g) => 100000 * (now - prev) > P(g) * Math.abs(prev);

/**
 * 한 회사 · 한 날 — {x, l, g: [g1..g5] (1 · 0 · null), on, v(보이는 값)}
 * x: 0 안 뺌 · 1 거래 적음(xq = 값이 빠져 「?」) · 2 거래 멈춤 짐작 · 3 거래소 · DART 목록에 듦
 */
export function evalCo(data, n, k, R, ctx) {
  const res = {x: 0, l: null, g: [null, null, null, null, null], v: {}};
  const s20 = winTv(data, n, k - 19, k);
  if (s20 === null) { res.x = 1; res.xq = true; return res; }
  if (s20 < 20n * BigInt(Math.round(R.thin))) { res.x = 1; return res; }
  const c0 = cl(data, n, k); let halt = !c0;
  for (let d = k - 4; d <= k && !halt; d++) if (!(data.vol[n * data.D + d] > 0)) halt = true;
  if (halt) { res.x = 2; return res; }
  // 목록 문
  if (ctx.listMode === 'skip') res.l = 1;
  else if (!ctx.lists) res.l = null;
  else {
    const code = data.codes[n]; let unknown = false; const on = [];
    for (const [nm, set] of ctx.lists.sets) { if (set === null) unknown = true; else if (set.has(code)) on.push(nm); }
    if (on.length) { res.x = 3; res.l = 0; res.on = on; return res; }
    res.l = unknown ? null : 1;
  }
  const v = res.v, day = data.days[k]; v.c0 = c0; v.tv20 = s20;
  // G1 이익
  const t = ttmOf(data, n, day, ctx.annualTtm);
  const fyU = fyUsable(data, n, day);
  let loss = null;
  if (fyU.length >= R.lossYears) {
    const last = fyU.slice(-R.lossYears);
    loss = last.some(f => (Number.isFinite(f.op) && f.op < 0) || (Number.isFinite(f.net) && f.net < 0)) ? 0 : last.every(f => Number.isFinite(f.op) && Number.isFinite(f.net)) ? 1 : null;
  }
  if (t) { v.ttm = t; }
  res.g[0] = and3([t ? +(t.now.op > 0) : null, t ? +grew(t.now.op, t.prev.op, R.opGrow) : null, t ? +grew(t.now.sales, t.prev.sales, R.salesGrow) : null, loss]);
  v.loss = loss;
  // G2 조용함
  const s120 = winTv(data, n, k - 139, k - 20), c5 = cl(data, n, k - 5), c20 = cl(data, n, k - 20);
  v.s120 = s120; v.c5 = c5; v.c20 = c20;
  res.g[1] = and3([s120 === null ? null : +(6000n * s20 <= BigInt(P(R.quietX)) * s120), c5 ? +(100000 * c0 < (100000 + P(R.hot5)) * c5) : null, c20 ? +(100000 * c0 <= (100000 + P(R.r20)) * c20) : null]);
  // G3 석 달 천천히
  const c60 = cl(data, n, k - 60); v.c60 = c60;
  let all60 = k - 60 >= 0, jump = 1, mdd = 1, mx = 0, maxJ = -Infinity, ddMax = 0;
  for (let d = k - 60; d <= k && all60; d++) { if (!cl(data, n, d)) all60 = false; }
  if (all60) {
    for (let d = k - 60; d <= k; d++) {
      const a = cl(data, n, d);
      if (d > k - 60) { const b = cl(data, n, d - 1); if (100000 * a >= (100000 + P(R.jump)) * b) jump = 0; maxJ = Math.max(maxJ, a / b - 1); }
      mx = Math.max(mx, a); if (100000 * a < (100000 - P(R.mdd60)) * mx) mdd = 0; ddMax = Math.max(ddMax, 1 - a / mx);
    }
    v.maxJump = maxJ; v.mdd = ddMax; v.mx60 = mx;
  }
  res.g[2] = and3([c60 ? +(100000 * c0 >= (100000 + P(R.r60lo)) * c60 && 100000 * c0 <= (100000 + P(R.r60hi)) * c60) : null, all60 ? jump : null, all60 ? mdd : null,
    all60 ? +(100000 * c0 >= (100000 - P(R.dd0)) * mx) : null]);
  // G4 두 배
  let lo = Infinity, hi = 0, all250 = k - 249 >= 0;
  for (let d = k - 249; d <= k && all250; d++) { const a = cl(data, n, d); if (!a) all250 = false; else { lo = Math.min(lo, a); hi = Math.max(hi, a); } }
  v.lo250 = all250 ? lo : null; v.hi250 = all250 ? hi : null;
  res.g[3] = all250 ? +(1000 * c0 < P(R.low2x) * lo) : null;
  // G5 업종
  const ii = data.indIdx.get(data.ind[n]), I = ii === undefined ? null : indInfo(data, k, R, ctx.memo)[ii];
  v.ind = I;
  res.g[4] = I ? and3([I.trade, I.med]) : null;
  return res;
}
const passes = (r, R) => r.x === 0 && r.l === 1 && r.g.filter(x => x === 1).length >= R.need;
const noFail = r => r.x === 0 && r.l !== 0 && r.g.every(x => x !== 0); // 「?」는 지난 것으로 보고 셈(흔들기 표 · 자료가 오면 줄어듦)

/* ---------- 고른 곳 둘레 셈 ---------- */
/** 석 달 하루 오름 상관(두 회사 모두 값이 있는 날 50날 이상) */
function corr60(data, a, b, k) {
  const xs = [], ys = [];
  for (let d = k - 59; d <= k; d++) { const a1 = cl(data, a, d), a0 = cl(data, a, d - 1), b1 = cl(data, b, d), b0 = cl(data, b, d - 1); if (a1 && a0 && b1 && b0) { xs.push(a1 / a0 - 1); ys.push(b1 / b0 - 1); } }
  if (xs.length < 50) return null;
  const m = xs.length, mx = xs.reduce((s, x) => s + x, 0) / m, my = ys.reduce((s, y) => s + y, 0) / m;
  let sxy = 0, sxx = 0, syy = 0; for (let i = 0; i < m; i++) { sxy += (xs[i] - mx) * (ys[i] - my); sxx += (xs[i] - mx) ** 2; syy += (ys[i] - my) ** 2; }
  return sxx > 0 && syy > 0 ? sxy / Math.sqrt(sxx * syy) : null;
}
/** 하루 로그 오름(값이 있는 이웃한 두 날) — 지난 W 거래일 */
function logRets(data, n, k, W) { const r = []; for (let d = k - W + 1; d <= k; d++) { const a = cl(data, n, d), b = cl(data, n, d - 1); if (a && b) r.push(Math.log(a / b)); } return r; }
/** 팔 선(공개 안 함) — 종가 × e^(−z σ √H) 를 호가 단위 아래로 · 지난 1년 한 달 안에 닿은 적(같은 거리 · 종가 기준) */
export function sellOf(data, n, k, R = RULES2) {
  const r = logRets(data, n, k, R.volDays); if (r.length < 200) return null;
  const m = r.reduce((s, x) => s + x, 0) / r.length, sd = Math.sqrt(r.reduce((s, x) => s + (x - m) ** 2, 0) / (r.length - 1));
  const ratio = Math.exp(-R.sellZ * sd * Math.sqrt(R.sellH)), c0 = cl(data, n, k), line = floorTick(c0 * ratio);
  let T = 0, N = 0;
  for (let s = k - 250; s <= k - R.sellH; s++) {
    const b = cl(data, n, s); if (!b) continue; let full = true, hit = false;
    for (let d = s + 1; d <= s + R.sellH; d++) { const a = cl(data, n, d); if (!a) { full = false; break; } if (a <= b * ratio) hit = true; }
    if (!full) continue; N++; if (hit) T++;
  }
  return {line, ratio: Math.round(ratio * 10000) / 10000, sigma: Math.round(sd * 100000) / 100000, basis: '종가', touch: N ? {n: Math.floor((20 * T + N) / (2 * N)), of: 10, T, N} : null};
}
/** 몬테카를로 — 한 달 뒤 종가가 고른 날 종가보다 위인 번 수(4가지 셈의 가장 작은 ~ 가장 큰 것 → 10번 중 lo ~ hi번) */
export function mcOf(data, n, k, R = RULES2) {
  const counts = [];
  for (const W of R.mcWin) for (const demean of [false, true]) {
    let r = logRets(data, n, k, W); if (r.length < Math.floor(W * 0.8)) return null;
    if (demean) { const m = r.reduce((s, x) => s + x, 0) / r.length; r = r.map(x => x - m); }
    const rnd = mulberry32(fnv1a(`${data.codes[n]}|${data.days[k]}|${W}|${demean ? 1 : 0}`)); let up = 0;
    for (let i = 0; i < R.mcN; i++) { let s = 0; for (let h = 0; h < R.mcH; h++) s += r[Math.floor(rnd() * r.length)]; if (s > 0) up++; }
    counts.push(up);
  }
  const lo = Math.floor(10 * Math.min(...counts) / R.mcN), hi = Math.ceil(10 * Math.max(...counts) / R.mcN);
  return {lo, hi, of: 10, h: R.mcH, counts, n: R.mcN};
}
export const MC_IN = '지난 1년과 석 달의 하루 오름을 섞어 뽑아 한 달 뒤를 2,000번씩 셈 · 오른 흐름을 넣은 셈과 뺀 셈 · 넷 중 가장 적은 ~ 가장 많은 번';
/** 카드 한 줄 — PER · PBR(그날 쓸 수 있던 이익 · 자산) · 회사 크기(억 원) · 1년 꼭대기 대비(%) · 업종 거래(배) */
export function cardOf(data, n, k, v) {
  const day = data.days[k], c0 = v.c0, I = data.integ[n], fyU = fyUsable(data, n, day), lastFy = fyU[fyU.length - 1] ?? null;
  const pick = f => { const key = I?.[f + 'Key']; if (I && Number.isFinite(I[f]) && key && monthFrom(key, 3) <= day) return I[f]; return lastFy && Number.isFinite(lastFy[f]) ? lastFy[f] : null; };
  const eps = pick('eps'), bps = pick('bps');
  let last = null; for (let d = data.D - 1; d >= 0; d--) if (cl(data, n, d)) { last = cl(data, n, d); break; }
  const cap = Number.isFinite(data.cap[n]) && last ? fracNum(BigInt(Math.round(data.cap[n])) * BigInt(c0), BigInt(last), 0) : null;
  return {per: eps > 0 ? fracNum(BigInt(c0), BigInt(Math.round(eps)), 1) : null, pbr: bps > 0 ? fracNum(BigInt(c0), BigInt(Math.round(bps)), 1) : null, cap,
    hi: v.hi250 ? fracNum(100n * BigInt(c0 - v.hi250), BigInt(v.hi250), 1) : null,
    trade: v.ind && v.ind.s60 > 0n ? fracNum(3n * v.ind.s20, v.ind.s60, 1) : null};
}
const monthFrom = (key, add) => { let y = +key.slice(0, 4), m = +key.slice(4, 6) + add; while (m > 12) { m -= 12; y++; } return `${y}-${String(m).padStart(2, '0')}-01`; };
/** 「세 곳이 함께 내린 날」 — 지난 250거래일 중 고른 곳 셋 이상이 같은 날 −3% 이하 */
export function fall3Of(data, ns, k, R = RULES2) {
  if (ns.length < R.fall3) return {n: null, days: R.fall3Days, of: ns.length};
  let n = 0;
  for (let d = Math.max(1, k - R.fall3Days + 1); d <= k; d++) {
    let c = 0; for (const i of ns) { const a = cl(data, i, d), b = cl(data, i, d - 1); if (a && b && 100 * a <= (100 - R.fall3Pct) * b) c++; }
    if (c >= R.fall3) n++;
  }
  return {n, days: R.fall3Days, of: ns.length};
}
/* 틀린다면 이유(wrong-v2 = v1 차례 · 「업종 돈」→「업종 거래」) */
export const WRONG = ['석 달 {r60}% 올라 숨이 찰 수 있어.', '1년 바닥보다 {low250x}배라 더 오르기 버거울 수 있어.', '업종 거래가 조금만 줄어도 이 문을 못 지나.', '이익이 다시 줄면 고른 까닭이 사라져.', '시장 전체가 내리면 같이 내릴 수 있어.'];
function wrongOf(v) {
  const c0 = BigInt(v.c0), c60 = BigInt(v.c60);
  if (100n * (c0 - c60) >= 30n * c60) return WRONG[0].replace('{r60}', fracFixed(100n * (c0 - c60), c60, 0));
  if (10n * c0 >= 17n * BigInt(v.lo250)) return WRONG[1].replace('{low250x}', fracFixed(c0, BigInt(v.lo250), 1));
  if (30n * v.ind.s20 < 13n * v.ind.s60) return WRONG[2];
  const t = v.ttm; if (!(t.prev.op > 0) || 5 * t.now.op < 6 * t.prev.op) return WRONG[3];
  return WRONG[4];
}

/**
 * selectOn(data, k, opts) — 날 k(data.days 자리)의 고르기
 * opts: {asOf, backtest = false, lists (null · 정규화 전 객체 · 없으면 data.lists), annualTtm (지난 성적 = 참), mc, sens, cards, sell, lossYears, rules}
 * 돌려줌: {version, asOf, k, picks: [{code, name, ind, big, w, ...}], cash, invested, counts, status, ...}
 */
export function selectOn(data, k, opts = {}) {
  if (opts.asOf) k = data.days.indexOf(opts.asOf);
  if (!(k >= 0 && k < data.D)) throw new Error('날 자리 밖: ' + k);
  const bt = !!opts.backtest, R = {...RULES2, ...(opts.rules ?? {}), ...(opts.lossYears ? {lossYears: opts.lossYears} : {})};
  const full = !bt, want = f => (opts[f] ?? full);
  const listsIn = bt ? null : opts.lists !== undefined ? opts.lists : data.lists;
  const ctx = {listMode: bt ? 'skip' : 'check', lists: listsIn && listsIn.sets ? listsIn : null, annualTtm: opts.annualTtm ?? bt, memo: new Map()};
  const rows = new Array(data.N);
  const counts = {companies: data.N, outThin: 0, outThinQ: 0, outHalt: 0, outList: 0, listQ: 0, afterOut: 0, g1: 0, g2: 0, g3: 0, g4: 0, g5: 0, passAll: 0, cutInd: 0, cutBig: 0, picked: 0, cash: 100, loss3: 0, why: null};
  const pass = [];
  for (let n = 0; n < data.N; n++) {
    const r = rows[n] = evalCo(data, n, k, R, ctx);
    if (r.x === 1) { counts.outThin++; if (r.xq) counts.outThinQ++; continue; }
    if (r.x === 2) { counts.outHalt++; continue; }
    if (r.x === 3) { counts.outList++; continue; }
    counts.afterOut++; if (r.l === null) counts.listQ++;
    r.g.forEach((g, j) => { if (g === 1) counts['g' + (j + 1)]++; });
    if (passes(r, R)) pass.push(n);
  }
  counts.passAll = pass.length;
  // 차례: 4분기 합 영업이익 늘어난 비율 큰(앞 > 0 만 · 없으면 뒤) → 석 달 오름 작은 → 번호 작은
  pass.sort((a, b) => {
    const A = rows[a].v, B = rows[b].v, ga = A.ttm.prev.op > 0, gb = B.ttm.prev.op > 0;
    if (ga !== gb) return ga ? -1 : 1;
    if (ga) { const l = A.ttm.now.op * B.ttm.prev.op, r = B.ttm.now.op * A.ttm.prev.op; if (l !== r) return l > r ? -1 : 1; }
    const l2 = A.c0 * B.c60, r2 = B.c0 * A.c60; if (l2 !== r2) return l2 < r2 ? -1 : 1;
    return data.codes[a] < data.codes[b] ? -1 : 1;
  });
  const picks = [], perInd = new Map(), bigSum = new Map();
  for (const n of pass) {
    if (picks.length >= R.max) break;
    const ind = data.ind[n], bigK = data.big[n] ?? ('업종:' + ind), have = perInd.get(ind) ?? [];
    if (have.length >= R.perInd2) { counts.cutInd++; continue; }
    if (have.length >= R.perInd) { const c = corr60(data, have[0], n, k); if (c === null || !(c < R.corr2)) { counts.cutInd++; continue; } }
    const no = picks.length + 1, w = no <= 12 ? R.w[0] : no <= 24 ? R.w[1] : R.w[2];
    if ((bigSum.get(bigK) ?? 0) + w > R.bigCap + 1e-9) { counts.cutBig++; continue; }
    perInd.set(ind, [...have, n]); bigSum.set(bigK, (bigSum.get(bigK) ?? 0) + w);
    picks.push({n, no, code: data.codes[n], name: data.name[n], ind, big: data.big[n], w});
  }
  const invested = Math.round(picks.reduce((s, p) => s + p.w * 10, 0)) / 10;
  counts.picked = picks.length; counts.cash = Math.round((100 - invested) * 10) / 10;
  // 고른 곳이 없을 때 까닭(글 하나 · 여럿이면 쉼표): lists = 목록 「?」 · years = 3해 결산을 셀 수 있는 회사가 없음 · quarters = 4분기 합을 셀 수 없음 · cut = 업종 · 위 끝에서 모두 빠짐 · none = 문을 다 지난 곳 없음
  const x0 = rows.filter(r => r.x === 0); counts.loss3 = x0.filter(r => r.v.loss !== null).length; // 3해 결산을 셀 수 있는 회사 수
  if (picks.length) counts.why = null;
  else {
    const w = [];
    if (counts.listQ) w.push('lists');
    if (x0.length && 2 * counts.loss3 < x0.length) w.push('years'); // 안 뺀 회사의 절반도 3해를 못 셈
    else if (x0.length && x0.every(r => !r.v.ttm)) w.push(ctx.annualTtm ? 'years' : 'quarters');
    if (!w.length) w.push(counts.passAll ? 'cut' : 'none');
    counts.why = w.join(',');
  }
  const out = {version: VERSION, asOf: data.days[k], k, picks, cash: counts.cash, invested, counts,
    status: {lists: bt ? 'skipped' : ctx.lists ? ([...ctx.lists.sets.values()].some(s => s === null) ? 'partial' : 'ok') : 'missing', quarters: data.quarters ? 'ok' : ctx.annualTtm ? 'annual' : 'missing'}};
  if (bt && !opts.detail) { for (const p of picks) delete p.n; return out; }
  // ---- 자세히(사이트 파일 · 시험) ----
  out.rows = rows; out.R = R;
  const indW = {}, bigW = {};
  for (const p of picks) { indW[p.ind] = (indW[p.ind] ?? 0) + p.w; const b = p.big ?? p.ind; bigW[b] = (bigW[b] ?? 0) + p.w; }
  out.inds = indW; out.bigs = bigW;
  out.fall3 = fall3Of(data, picks.map(p => p.n), k, R);
  for (const p of picks) {
    const v = rows[p.n].v;
    p.price = v.c0;
    p.reason = `영업이익 ${v.ttm.prev.op}억 → ${v.ttm.now.op}억 · 석 달 ${sign1(100n * BigInt(v.c0 - v.c60), BigInt(v.c60))}% · 업종 거래 ${fracFixed(3n * v.ind.s20, v.ind.s60, 1)}배`;
    p.wrong = wrongOf(v);
    if (want('cards')) p.card = cardOf(data, p.n, k, v);
    if (want('mc')) { const m = mcOf(data, p.n, k, R); p.mc = m ? {lo: m.lo, hi: m.hi, of: 10, h: m.h} : null; p.mcCounts = m?.counts ?? null; }
    if (want('sell')) p.sell = sellOf(data, p.n, k, R);
  }
  if (want('sens')) {
    out.sens = TH.map(th => {
      const vals = [R[th.key] + th.step, R[th.key], R[th.key] - th.step].map(x => Math.round(x * 1e6) / 1e6);
      return {key: th.key, gate: th.gate, sens: vals.map(val => {
        const R2 = {...R, [th.key]: val}, c2 = {...ctx, memo: new Map()}; let nn = 0;
        for (let n = 0; n < data.N; n++) { const r = val === R[th.key] ? rows[n] : (th.gate === 'x' || rows[n].x === 0 ? evalCo(data, n, k, R2, c2) : rows[n]); if (noFail(r)) nn++; }
        return {v: val, n: nn};
      })};
    });
    for (const p of picks) {
      p.near = [];
      for (const th of TH) { const R2 = {...R, [th.key]: R[th.key] + th.step}; const r = evalCo(data, p.n, k, R2, {...ctx, memo: new Map()}); if (!passes(r, R2)) p.near.push(th.key); }
    }
  }
  return out;
}
const sign1 = (num, den) => { const s = fracFixed(num, den, 1); return s.startsWith('-') ? '−' + s.slice(1) : '+' + s; };

/* ---------- 사이트 파일 ---------- */
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../../..');
async function cli() {
  const argv = process.argv.slice(2), arg = (k, d) => (argv.includes(k) ? argv[argv.indexOf(k) + 1] : d), CHECK = argv.includes('--check');
  let bundle = arg('--bundle', process.env.GDR_BUNDLE || null);
  if (!bundle) { try { bundle = JSON.parse(fs.readFileSync(path.join(ROOT, 'scripts/atlas11/t365/universe.json'), 'utf8')).bundle; } catch { /* 없음 */ } }
  const quit = m => { console.log('고도리 칸 셈 gdr-v2 — ' + m + ' · 결과 파일은 그대로'); process.exit(0); };
  if (!bundle || !fs.existsSync(path.resolve(ROOT, bundle))) quit('모음 없음');
  const opt = f => { const p = arg(f, null); return p && fs.existsSync(path.resolve(ROOT, p)) ? path.resolve(ROOT, p) : null; };
  const quarters = opt('--quarters') ?? (fs.existsSync(path.join(ROOT, 'reports/atlas11/godori/quarter-latest.json')) ? path.join(ROOT, 'reports/atlas11/godori/quarter-latest.json') : null);
  const lists = opt('--lists') ?? (fs.existsSync(path.join(ROOT, 'reports/atlas11/godori/kind-latest.json')) ? path.join(ROOT, 'reports/atlas11/godori/kind-latest.json') : null);
  const OUT = path.resolve(ROOT, arg('--out', 'site/next/data/gdr.json')), GATES = path.resolve(ROOT, arg('--gates', path.join(path.dirname(OUT), 'gates.json')));
  const t0 = Date.now();
  const data = loadData({bundle, site: arg('--site', 'site/atlas/data'), quarters, lists, root: ROOT});
  const last = data.siteAsOf && data.siteAsOf < data.days[data.D - 1] ? data.siteAsOf : data.days[data.D - 1], asof = arg('--asof', null);
  const k = asof ? data.days.indexOf(asof) : data.days.lastIndexOf(data.days.filter(d => d <= last).at(-1)); // --asof = 장이 끝난 마지막 날(G3 실행기 · 모음에 그날 줄이 있어야)
  if (asof && k < 0) quit('--asof ' + asof + ' 가 달력에 없음');
  if (k < 250) quit('거래일이 250날이 안 됨');
  const S = selectOn(data, k, {});
  const TXT = {
    out: buildPublic(data, S, {bundle, quarters, lists, ROOT, prev: arg('--prev', null)}),
    gates: buildGates(data, S),
  };
  const bad = selfCheck(data, S, TXT);
  console.log(JSON.stringify({asOf: S.asOf, counts: S.counts, status: S.status, picks: S.picks.map(p => p.code), secs: (Date.now() - t0) / 1000, bad}));
  if (bad.length) { console.log('스스로 확인에서 걸림 — 파일을 쓰지 않음'); process.exit(1); }
  if (CHECK) return;
  const priv = arg('--private', null);
  const files = [[GATES, TXT.gates], [OUT, TXT.out]]; if (priv) files.push([path.resolve(ROOT, priv), JSON.stringify(buildPrivate(data, S)) + '\n']);
  const tmp = f => f + '.tmp-' + process.pid;
  try { for (const [f, t] of files) { fs.mkdirSync(path.dirname(f), {recursive: true}); fs.writeFileSync(tmp(f), t); } for (const [f] of files) fs.renameSync(tmp(f), f); }
  catch (e) { for (const [f] of files) { try { fs.unlinkSync(tmp(f)); } catch { /* 없음 */ } } throw e; }
  console.log('→ ' + files.map(([f]) => path.relative(ROOT, f)).join(' · '));
}
export {buildPublic, buildGates, buildPrivate, selfCheck};
/** 공개 gdr.json(v2) — 팔 선 · 절반 팔 선 · 금액 없음([9] 1) */
function buildPublic(data, S, src = {}) {
  const R = S.R, rel = p => (p && src.ROOT ? path.relative(src.ROOT, path.resolve(src.ROOT, p)) : p ?? null);
  const picks = S.picks.map(p => ({no: p.no, code: p.code, name: p.name, ind: p.ind, big: p.big, w: p.w, price: p.price, reason: p.reason, wrong: p.wrong, near: p.near ?? [], card: p.card ?? null,
    mc: p.mc ? {...p.mc, in: MC_IN} : null}));
  const rules = TH.map(th => { const s = S.sens?.find(x => x.key === th.key); return {gate: th.gate, key: th.key, name: TXT_RULE[th.key].name, v: R[th.key], unit: TXT_RULE[th.key].unit, why: TXT_RULE[th.key].why, sens: s?.sens ?? null}; });
  let score = null;
  if (src.prev) score = scoreKept(data, src.prev, S.k);
  if (!score) score = scoreRecomputed(data, S.k);
  const out = {schema: SCHEMA, version: VERSION, asOf: S.asOf, made: new Date().toISOString(),
    src: {bundle: rel(src.bundle), quarters: rel(src.quarters), lists: rel(src.lists)},
    dates: {site: data.siteAsOf, bundle: data.days[data.D - 1], calc: S.asOf}, status: S.status,
    limits: {need: R.need, perInd: R.perInd, perInd2: R.perInd2, corr2: R.corr2, bigCap: R.bigCap, max: R.max, w: R.w},
    counts: {listed: data.listed ?? data.N, ...S.counts}, rules, sensNote: '흔들기 수 = 못 지난 문이 없는 곳(「?」 문은 지난 것으로 셈 · 분기 · 목록 자료가 오면 줄어듦)',
    picks, inds: S.inds, bigs: S.bigs, fall3: S.fall3, score,
    note: noteOf(S)};
  return JSON.stringify(out) + '\n';
}
function noteOf(S) {
  const n = [];
  if (S.status.lists !== 'ok') n.push('거래소(관리 · 투자경고 · 투자위험 · 거래정지) · DART(1년 안 전환사채 · 유상증자) 목록을 못 받아 모든 회사가 「?」 — 지나지 못함');
  if (S.status.quarters !== 'ok') n.push('분기 결산을 못 받아 이익 문(최근 4분기 합)이 모두 「?」 — 지나지 못함');
  n.push('거래 멈춤은 최근 5거래일 거래량 0 으로 짐작함 · 업종 나눔은 오늘 것');
  return n;
}
/** gates.json(v2) — co[번호] = [x, g1, g2, g3, g4, g5, l] (앞 여섯 자리는 v1 과 같은 뜻 · x 3 = 목록에 듦 · l = 목록 문) */
function buildGates(data, S) {
  const co = data.codes.map((c, n) => { const r = S.rows[n]; const a = r.x === 0 ? [0, ...r.g, r.l] : [r.x, null, null, null, null, null, r.x === 3 ? 0 : null]; return JSON.stringify(c) + ':' + JSON.stringify(a); });
  return '{' + [`"schema":"${GATES_SCHEMA}"`, `"version":"${VERSION}"`, '"asOf":' + JSON.stringify(S.asOf), '"keys":["x","g1","g2","g3","g4","g5","l"]', '"need":' + S.R.need, '"co":{' + co.join(',') + '}'].join(',') + '}\n';
}
/** 공개 안 하는 기록(팔 선 · 닿은 수 · 몬테카를로 번 수) — --private 로만 */
function buildPrivate(data, S) {
  return {schema: 'godori-gdr-2-private', version: VERSION, asOf: S.asOf, why: '[9] 1 — 변호사 서면 의견 전까지 화면 · 공개 파일에 넣지 않음', picks: S.picks.map(p => ({code: p.code, price: p.price, w: p.w, sell: p.sell, mcCounts: p.mcCounts}))};
}
/** 채점 — 앞 gdr.json(v2) 의 고른 곳 · 그 날 + 한 달(20거래일) 종가 */
function scoreKept(data, prevPath, k) {
  let P0; try { P0 = JSON.parse(fs.readFileSync(prevPath, 'utf8')); } catch { return null; }
  if (P0?.version !== VERSION) return null;
  const k0 = data.days.indexOf(P0.asOf); if (k0 < 0 || k0 + RULES2.mcH > k) return null;
  return scoreRows(data, (P0.picks ?? []).map(p => ({code: p.code, price: p.price, mc: p.mc})), k0, k0 + RULES2.mcH, 'kept');
}
function scoreRecomputed(data, k) {
  const k0 = k - RULES2.mcH; if (k0 < 250) return null;
  const S0 = selectOn(data, k0, {backtest: true, detail: true, mc: true});
  return scoreRows(data, S0.picks.map(p => ({code: p.code, price: p.price ?? cl(data, p.n, k0), mc: p.mc})), k0, k, 'recomputed');
}
function scoreRows(data, picks, k0, k1, srcKind) {
  const idx = new Map(data.codes.map((c, i) => [c, i]));
  const rows = picks.map(p => { const n = idx.get(p.code), a = n === undefined ? null : cl(data, n, k1); return {code: p.code, lo: p.mc?.lo ?? null, hi: p.mc?.hi ?? null, from: p.price, to: a, up: a && p.price ? +(a > p.price) : null}; });
  const ok = rows.filter(r => r.up !== null);
  for (const r of rows) { const n = idx.get(r.code); r.name = n === undefined ? null : data.name[n]; }
  return {src: srcKind, from: data.days[k0], to: data.days[k1], n: rows.length, up: ok.filter(r => r.up === 1).length, counted: ok.length,
    lo: ok.length && ok.every(r => r.lo !== null) ? ok.reduce((s, r) => s + r.lo, 0) : null, hi: ok.length && ok.every(r => r.hi !== null) ? ok.reduce((s, r) => s + r.hi, 0) : null, rows};
}
/** 스스로 확인 — 틀리면 쓰지 않음 */
function selfCheck(data, S, TXT) {
  const bad = [], G = JSON.parse(TXT.gates), O = JSON.parse(TXT.out);
  if (Math.abs(S.invested + S.cash - 100) > 1e-9) bad.push('비중 합 + 현금 ≠ 100');
  for (const [b, s] of Object.entries(S.bigs ?? {})) if (s > S.R.bigCap + 1e-9) bad.push('큰 업종 위 끝 넘음 ' + b);
  const per = {}; for (const p of S.picks) per[p.ind] = (per[p.ind] ?? 0) + 1; for (const [i, c] of Object.entries(per)) if (c > S.R.perInd2) bad.push('한 업종 둘 넘음 ' + i);
  if (Object.keys(G.co).length !== data.N) bad.push('gates.json 회사 수');
  const cnt = [0, 0, 0, 0, 0]; let x0 = 0;
  for (const c of data.codes) { const a = G.co[c]; if (!Array.isArray(a) || a.length !== 7) { bad.push('gates.json 꼴 ' + c); break; } if (a[0] === 0) { x0++; a.slice(1, 6).forEach((v, j) => { if (v === 1) cnt[j]++; }); } }
  if (x0 !== S.counts.afterOut) bad.push('gates.json 안 뺀 수 ≠ afterOut');
  cnt.forEach((v, j) => { if (v !== S.counts['g' + (j + 1)]) bad.push(`gates.json g${j + 1} ${v} ≠ ${S.counts['g' + (j + 1)]}`); });
  for (const p of S.picks) { const a = G.co[p.code]; if (!(a[0] === 0 && a[6] === 1 && a.slice(1, 6).filter(x => x === 1).length >= S.R.need)) bad.push('고른 곳 문 ' + p.code); }
  const txt = TXT.out; for (const w of ['"sell"', '"half"', '"base"', '담겠어', '팔겠어', '"line"']) if (txt.includes(w)) bad.push('공개 파일에 ' + w);
  if (O.picks.length !== S.picks.length) bad.push('고른 곳 수');
  return bad;
}
/* 문턱마다 이름 · 단위 · 왜 이 값인가(쉬운 말 · 결정표와 같은 글) */
export const TXT_RULE = {
  thin: {name: '하루 평균 거래대금', unit: '원', why: '하루 10억 원은 오가야 사고팔 때 값이 크게 안 흔들려요.'},
  opGrow: {name: '최근 4분기 영업이익이 늘어난 정도', unit: '%', why: '0% 넘게 = 한 분기 앞보다 줄지 않고 늘었는지만 봐요.'},
  salesGrow: {name: '최근 4분기 매출이 늘어난 정도', unit: '%', why: '이익만 늘고 매출이 줄면 아껴서 남긴 것이라 오래 못 가요.'},
  quietX: {name: '한 달 거래대금 ÷ 그 앞 여섯 달 평균', unit: '배', why: '2배를 넘으면 이미 사람들이 몰린 뒤라고 봐요.'},
  hot5: {name: '5일 오름', unit: '%', why: '닷새에 10% 넘게 오르면 들뜬 때라 쉬어요.'},
  r20: {name: '한 달 오름 위 끝', unit: '%', why: '2023년 말부터 2025년까지 모든 회사의 한 달 오름 중 위 10%가 이 값쯤이에요. 그보다 더 오른 곳은 이미 많이 오른 곳이에요.'},
  r60lo: {name: '석 달 오름 아래 끝', unit: '%', why: '석 달에 5%는 올라야 오르는 흐름이 있다고 봐요.'},
  r60hi: {name: '석 달 오름 위 끝', unit: '%', why: '석 달에 40% 넘게 오르면 천천히 오른 게 아니에요.'},
  jump: {name: '하루 오름 위 끝', unit: '%', why: '하루에 15% 넘게 뛴 날이 있으면 소식 하나로 튄 것일 수 있어요.'},
  mdd60: {name: '석 달 안 가장 깊은 빠짐', unit: '%', why: '2023년 말부터 2025년까지 모든 회사의 석 달 가장 깊은 빠짐 가운데값이 이 값쯤이에요. 보통 회사보다 덜 빠진 곳만 봐요.'},
  dd0: {name: '오늘 값이 석 달 꼭대기보다 아래인 정도', unit: '%', why: '꼭대기에서 15% 넘게 내려와 있으면 오르는 흐름이 꺾였다고 봐요.'},
  low2x: {name: '1년 가장 낮은 값의 몇 배', unit: '배', why: '1년 바닥의 2배가 넘으면 이미 크게 오른 뒤예요.'},
  indX: {name: '업종 거래 한 달 ÷ 그 앞 석 달', unit: '배', why: '업종에 오가는 돈이 10%는 늘어야 돈이 들어온다고 봐요.'},
  indMed: {name: '업종 회사 한 달 오름 가운데값', unit: '%', why: '업종 회사 절반 넘게 올라야 업종이 오르는 중이라고 봐요.'},
};

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) cli().catch(e => { console.error(e); process.exit(1); });
