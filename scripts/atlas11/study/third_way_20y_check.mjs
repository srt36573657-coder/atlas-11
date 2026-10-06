#!/usr/bin/env node
/**
 * ATLAS 11 공부 · 20년 판 따로 세기 — third_way_20y.py 의 코드를 쓰지 않고 자바스크립트로 처음부터 다시 셈(한국 · 미국)
 *   다시 세는 것: 줄 수 · 아무 날 크게 오름 비율 · 업종 6달 추세 위 20% · 회사 6달 추세 위 20% · 두 겹 — 전체 배수와 다섯 해 묶음 배수 · 큰 하락 덩어리 수
 *   + 3년 반 판과 겹치는 날들의 줄 수 · 두 겹 배수 + 때 × 구조(지수가 1년 꼭대기보다 30% 넘게 아래 · 근처일 때 두 겹 · 6달 추세 아래 20%)
 *   쓰는 법: node scripts/atlas11/study/third_way_20y_check.mjs <kr|us> <결과.json(파이썬 셈 · 자료 폴더 · 지수는 그 안에 적힌 것을 씀)>
 */
import fs from 'node:fs';
import zlib from 'node:zlib';

const [MK, PYF] = process.argv.slice(2);
const py = JSON.parse(fs.readFileSync(PYF, 'utf8'));
const ALL = py.universe === 'all', NAVER = py.groups_by === 'naver';  // 넓게(받은 회사 모두 · 네이버 업종 다섯 곳 넘는 것)도 같은 길로 셈
const L = 140, AHEAD = 120, JUMP = MK === 'kr' ? 0.31 : 0.50, IDX_KEY = py.index;  // 지수는 날짜 모음에만 쓰임(파이썬이 고른 것과 같게)
const D = JSON.parse(zlib.gunzipSync(fs.readFileSync(`${py.data}/${MK}.json.gz`)));
const BLOCKS = [['2005~2008', '2005', '2008'], ['2009~2013', '2009', '2013'], ['2014~2018', '2014', '2018'], ['2019~2022', '2019', '2022'], ['2023~2026', '2023', '2026']];
function unpack(p) {
  let t = Date.UTC(+p.d0.slice(0, 4), +p.d0.slice(4, 6) - 1, +p.d0.slice(6, 8)); const d = [p.d0];
  for (const k of p.dd) { t += k * 86400000; d.push(new Date(t).toISOString().slice(0, 10).replace(/-/g, '')); }
  return {d, c: p.c.map(Number)};
}
const board = new Set(D.board), groupOf = new Map();
let GROUPS = D.groups.map(g => ({id: g.id, codes: g.codes}));
if (NAVER) { const by = new Map(); for (const [code, p] of Object.entries(D.stocks)) { const ic = p.industryCode; if (ic == null || !(ALL || board.has(code))) continue; const k = String(ic); if (!by.has(k)) by.set(k, []); by.get(k).push(code); }
  GROUPS = [...by.entries()].filter(([, v]) => v.length >= 5).sort((a, b) => (a[0] < b[0] ? -1 : 1)).map(([k, v]) => ({id: k, codes: v})); }
GROUPS.forEach(g => g.codes.forEach(c => groupOf.set(c, g.id)));
if (GROUPS.length !== py.n_groups) throw Error(`업종 수가 다름: ${GROUPS.length} · ${py.n_groups}`);
const S = new Map();
for (const [code, p] of Object.entries(D.stocks)) { if (!ALL && !board.has(code)) continue; const u = unpack(p); if (u.d.length < L + 1 + AHEAD || u.c.some(x => !(x > 0))) continue; S.set(code, u); }
const idx = unpack(D.indices[IDX_KEY]);
const allDates = [...new Set([...idx.d, ...[...S.values()].flatMap(s => s.d)])].sort(); const pos = new Map(allDates.map((x, i) => [x, i]));
function groupIndex(codes) {
  const sum = new Float64Array(allDates.length), cnt = new Int32Array(allDates.length);
  for (const code of codes) { const s = S.get(code); if (!s) continue; for (let i = 1; i < s.c.length; i++) { const r = s.c[i] / s.c[i - 1] - 1; if (Math.abs(r) > JUMP) continue; const p = pos.get(s.d[i]); sum[p] += r; cnt[p]++; } }
  const out = new Array(allDates.length).fill(NaN); let v = 100; for (let p = 0; p < allDates.length; p++) { if (cnt[p] < 3) continue; v *= 1 + sum[p] / cnt[p]; out[p] = v; } return out;
}
const pctRank = xs => { const ix = xs.map((x, i) => [x, i]).sort((a, b) => a[0] - b[0]); const out = new Array(xs.length); let i = 0;
  while (i < ix.length) { let j = i; while (j + 1 < ix.length && ix[j + 1][0] === ix[i][0]) j++; const avg = (i + j) / 2 + 1; for (let k = i; k <= j; k++) out[ix[k][1]] = avg / ix.length; i = j + 1; } return out; };
const G = GROUPS.map(g => g.id), GI = new Map(GROUPS.map(g => [g.id, groupIndex(g.codes)]));
const gRank = new Map(G.map(g => [g, new Array(allDates.length).fill(NaN)]));
for (let p = 120; p < allDates.length; p++) { const vals = [], ids = []; for (const g of G) { const I = GI.get(g); const r = I[p] / I[p - 120] - 1; if (Number.isFinite(r)) { vals.push(r); ids.push(g); } } if (vals.length < 10) continue; pctRank(vals).forEach((rk, k) => { gRank.get(ids[k])[p] = rk; }); }
// 지수 자리(1년 꼭대기보다 몇 % 아래) — 파이썬과 같게 모든 날에 맞추고(없는 날은 앞 값) 250자리 안 가장 높은 값과 견줌
const IDXA = new Array(allDates.length).fill(NaN); idx.d.forEach((x, i) => { IDXA[pos.get(x)] = idx.c[i]; });
for (let p = 1; p < IDXA.length; p++) if (!Number.isFinite(IDXA[p])) IDXA[p] = IDXA[p - 1];
const DD = new Array(allDates.length).fill(NaN);
for (let p = 249; p < IDXA.length; p++) { let m = -Infinity; for (let k = p - 249; k <= p; k++) if (Number.isFinite(IDXA[k])) m = Math.max(m, IDXA[k]); if (m > -Infinity) DD[p] = IDXA[p] / m - 1; }
const rows = [];
for (const [code, s] of S) {
  const {d, c} = s, n = c.length; const cum = []; c.reduce((a, x, i) => (cum[i] = a + (i > 0 && Math.abs(x / c[i - 1] - 1) > JUMP ? 1 : 0)), 0);
  const ret = c.map((x, i) => (i > 0 ? x / c[i - 1] - 1 : NaN));
  for (let t = L; t < n - AHEAD; t++) {
    if (cum[t + AHEAD] - cum[t - L] > 0 || d[t] < '20050101') continue;
    let mx = -Infinity; for (let k = t + 1; k <= t + AHEAD; k++) mx = Math.max(mx, c[k]);
    const w = ret.slice(t - 19, t + 1), mu = w.reduce((a, x) => a + x, 0) / 20, sd20 = Math.sqrt(w.reduce((a, x) => a + (x - mu) ** 2, 0) / 19);
    const g = groupOf.get(code), gr = g ? gRank.get(g)[pos.get(d[t])] : NaN;
    rows.push({code, date: d[t], up: mx / c[t] >= 1.5 ? 1 : 0,  // 파이썬과 같게 나눗셈으로(곱셈 1.5 × 종가로 견주면 소수 넷째 자리 미국 값에서 경계 줄 11개쯤이 갈림)
      sd20, r120: c[t] / c[t - 120] - 1, F15: Number.isFinite(gr) ? (gr >= 0.8 ? 1 : 0) : NaN, dd: DD[pos.get(d[t])]});
  }
}
const byDate = new Map(); rows.forEach((r, i) => { if (!byDate.has(r.date)) byDate.set(r.date, []); byDate.get(r.date).push(i); });
for (const ix of byDate.values()) {
  const rk = pctRank(ix.map(i => rows[i].r120)); ix.forEach((i, k) => { rows[i].F05 = rk[k] >= 0.8 ? 1 : 0; rows[i].F06 = rk[k] <= 0.2 ? 1 : 0; });
  const ord = ix.map((i, k) => [rows[i].sd20, k]).sort((a, b) => a[0] - b[0] || a[1] - b[1]); ord.forEach(([, k], r) => { rows[ix[k]].vq = Math.floor(Math.min((r + 1) / ix.length, 0.999999) * 5); });
  const cell = new Map(); ix.forEach(i => { const q = rows[i].vq; const a = cell.get(q) ?? [0, 0]; a[0] += rows[i].up; a[1]++; cell.set(q, a); });
  ix.forEach(i => { const a = cell.get(rows[i].vq); rows[i].exp = a[1] > 1 ? (a[0] - rows[i].up) / (a[1] - 1) : NaN; });
}
const adj = sel => { let a = 0, e = 0, n = 0; for (const r of rows) if (sel(r) && Number.isFinite(r.exp)) { a += r.up; e += r.exp; n++; } return {n, adj: a / e}; };
const inBlk = (r, b) => r.date.slice(0, 4) >= b[1] && r.date.slice(0, 4) <= b[2];
const two = r => r.F15 === 1 && r.F05 === 1;
const out = {rows: [rows.length, py.rows], base_up: [rows.reduce((a, r) => a + r.up, 0) / rows.length, py.base_up],
  F05: [adj(r => r.F05 === 1).adj, py.structure['회사만'].adj_up], F15: [adj(r => r.F15 === 1).adj, py.structure['업종만'].adj_up], two: [adj(two).adj, py.structure['업종 + 회사'].adj_up]};
for (const b of BLOCKS) { const x = adj(r => two(r) && inBlk(r, b)); const pv = py.structure['업종 + 회사'].blocks[b[0]]; if (pv.adj_up != null) out['two ' + b[0]] = [x.adj, pv.adj_up]; }
const deep = r => r.dd <= -0.30, nearHi = r => r.dd > -0.05;  // 때 × 구조: 30% 넘게 아래 · 근처
const sbd = lab => py.structure_by_dd.find(x => x.label === lab);
out['때×구조 30%+ 아래 두 겹'] = [adj(r => deep(r) && two(r)).adj, sbd('30% 넘게 아래')['업종 + 회사'].adj_up];
out['때×구조 30%+ 아래 6달 추세 아래 20%'] = [adj(r => deep(r) && r.F06 === 1).adj, sbd('30% 넘게 아래')['6달 추세 아래 20%'].adj_up];
out['때×구조 꼭대기 근처 두 겹'] = [adj(r => nearHi(r) && two(r)).adj, sbd('1년 꼭대기 근처(5% 안쪽)')['업종 + 회사'].adj_up];
// 때(지수만) — 지수 자기 날짜로: 1년(250자리) 꼭대기보다 몇 % 아래 칸마다 6달(120자리) 뒤 평균 · 큰 하락 덩어리 수
{
  const c = idx.c, d = idx.d, n = c.length, BK = [[-0.05, 9], [-0.10, -0.05], [-0.20, -0.10], [-0.30, -0.20], [-9, -0.30]];
  const dd = c.map((x, i) => { if (i < 249) return NaN; let m = -Infinity; for (let k = i - 249; k <= i; k++) m = Math.max(m, c[k]); return x / m - 1; });
  const sum = BK.map(() => [0, 0]);
  for (let i = 0; i < n - AHEAD; i++) { if (!Number.isFinite(dd[i]) || d[i] < '20050101') continue; const k = BK.findIndex(([lo, hi]) => lo < dd[i] && dd[i] <= hi); sum[k][0] += c[i + AHEAD] / c[i] - 1; sum[k][1]++; }
  const pw = py.when_index[IDX_KEY];
  sum.forEach(([a, m], k) => { out[`때 ${IDX_KEY} 칸${k + 1} 6달 뒤 평균`] = [m ? a / m : NaN, pw.buckets[k].idx_end_mean ?? NaN]; });
  let eps = 0, last = -999; for (let i = 0; i < n; i++) if (Number.isFinite(dd[i]) && dd[i] <= -0.20 && d[i] >= '20040101') { if (i - last > 20) eps++; last = i; }
  out[`때 ${IDX_KEY} 큰 하락 덩어리 수`] = [eps, pw.episodes.length];
}
const inOv = r => r.date >= py.overlap.dates[0] && r.date <= py.overlap.dates[1];
out['겹치는 때 줄 수'] = [rows.filter(inOv).length, py.overlap.rows]; out['겹치는 때 두 겹'] = [adj(r => two(r) && inOv(r)).adj, py.overlap['업종 + 회사']];
let ok = true;
for (const [k, [js, pv]] of Object.entries(out)) { const same = Math.abs(js - pv) < 1e-6 * Math.max(1, Math.abs(pv)); ok &&= same; console.log(`${k}: 자바스크립트 ${js} · 파이썬 ${pv} → ${same ? '같음' : '다름!'}`); }
console.log(ok ? '모두 같음' : '다른 것이 있음');
