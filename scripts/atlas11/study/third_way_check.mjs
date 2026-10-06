#!/usr/bin/env node
/**
 * ATLAS 11 공부 · 「제3의 방식」 따로 세기 — third_way_features.py · third_way_analyze.py 의 코드를 쓰지 않고 자바스크립트로 처음부터 다시 셈
 *   365곳(판 업종) · 같은 날 · 같은 출렁임 층(그 날 20일 출렁임 다섯 층 · 나를 뺀 비율)과 견준 「6달 안 +50%」 배수
 *   다시 세는 것: 아무 날 비율 · 두 시기 비율 · F01 6달 신고가 근처 · F05 6달 추세 위 20% · F11 거래량 급증 · F15 업종 6달 추세 위 20% · F15+F05 두 겹(전체 · 앞 · 뒤)
 *   쓰는 법: node scripts/atlas11/study/third_way_check.mjs <결과.json(파이썬 셈)>
 */
import fs from 'node:fs';
import zlib from 'node:zlib';

const L = 140, AHEAD = 120, JUMP = 0.31, SPLIT = '20250101';
const B = JSON.parse(zlib.gunzipSync(fs.readFileSync('reports/atlas11/universe/2026-10-05-0940/bundle.json.gz')));
const board = JSON.parse(fs.readFileSync('public/data/atlas11/view/board.json', 'utf8'));
const py = JSON.parse(fs.readFileSync(process.argv[2], 'utf8'));
const inBoard = new Set(board.companies.map(c => c.code));
const groupOf = new Map(); board.groups.forEach(g => g.codes.forEach(c => groupOf.set(c, g.id)));

// 종가 · 거래량 (141 + 120 거래일 넘게 · 종가가 모두 0보다 큰 회사)
const S = new Map();
for (const [code, s] of Object.entries(B.stocks)) {
  const rows = s?.fchart?.rows; if (!Array.isArray(rows) || rows.length < L + 1 + AHEAD) continue;
  const d = rows.map(r => String(r[0])), c = rows.map(r => Number(r[4])), v = rows.map(r => Number(r[5]));
  if (c.some(x => !(x > 0))) continue;
  S.set(code, {d, c, v});
}
const allDates = [...new Set([...S.values()].flatMap(s => s.d))].sort(); const pos = new Map(allDates.map((x, i) => [x, i]));
// 업종 지수: 하루 등락(±31% 넘으면 그 회사만 뺌)을 셋 이상일 때 똑같은 무게로 평균 · 모자란 날은 비워 두고 다음 날 앞 값에서 이어감
function groupIndex(codes) {
  const sum = new Float64Array(allDates.length), cnt = new Int32Array(allDates.length);
  for (const code of codes) { const s = S.get(code); if (!s) continue;
    for (let i = 1; i < s.c.length; i++) { const r = s.c[i] / s.c[i - 1] - 1; if (Math.abs(r) > JUMP) continue; const p = pos.get(s.d[i]); sum[p] += r; cnt[p]++; } }
  const idx = new Array(allDates.length).fill(NaN); let v = 100;
  for (let p = 0; p < allDates.length; p++) { if (cnt[p] < 3) continue; v *= 1 + sum[p] / cnt[p]; idx[p] = v; }
  return idx;
}
const G = board.groups.map(g => g.id), GI = new Map(board.groups.map(g => [g.id, groupIndex(g.codes)]));
// 날마다 업종 6달 추세 순위(평균 순위 / 개수 · 10개 넘게 있을 때)
const pctRank = xs => { const ix = xs.map((x, i) => [x, i]).sort((a, b) => a[0] - b[0]); const out = new Array(xs.length); let i = 0;
  while (i < ix.length) { let j = i; while (j + 1 < ix.length && ix[j + 1][0] === ix[i][0]) j++; const avg = (i + j) / 2 + 1; for (let k = i; k <= j; k++) out[ix[k][1]] = avg / ix.length; i = j + 1; } return out; };
const gRank = new Map(G.map(g => [g, new Array(allDates.length).fill(NaN)]));
for (let p = 120; p < allDates.length; p++) {
  const vals = [], ids = [];
  for (const g of G) { const I = GI.get(g); const r = I[p] / I[p - 120] - 1; if (Number.isFinite(r)) { vals.push(r); ids.push(g); } }
  if (vals.length < 10) continue;
  pctRank(vals).forEach((rk, k) => { gRank.get(ids[k])[p] = rk; });
}
// 날마다 줄
const rows = [];
for (const [code, s] of S) {
  if (!inBoard.has(code)) continue;
  const {d, c, v} = s, n = c.length;
  const jump = c.map((x, i) => (i > 0 && Math.abs(x / c[i - 1] - 1) > JUMP ? 1 : 0)); const cum = []; jump.reduce((a, x, i) => (cum[i] = a + x), 0);
  const ret = c.map((x, i) => (i > 0 ? x / c[i - 1] - 1 : NaN));
  for (let t = L; t < n - AHEAD; t++) {
    if (cum[t + AHEAD] - cum[t - L] > 0) continue;
    if (d[t] < '20231101') continue;
    let mx = -Infinity, mn = Infinity; for (let k = t + 1; k <= t + AHEAD; k++) { mx = Math.max(mx, c[k]); mn = Math.min(mn, c[k]); }
    const w = ret.slice(t - 19, t + 1), mu = w.reduce((a, x) => a + x, 0) / 20, sd20 = Math.sqrt(w.reduce((a, x) => a + (x - mu) ** 2, 0) / 19);
    let hi = -Infinity; for (let k = t - 119; k <= t; k++) hi = Math.max(hi, c[k]);
    let v5 = 0, v115 = 0; for (let k = t - 4; k <= t; k++) v5 += v[k]; for (let k = t - 119; k <= t - 5; k++) v115 += v[k]; v5 /= 5; v115 /= 115;
    const p = pos.get(d[t]); const gr = gRank.get(groupOf.get(code))[p];
    rows.push({code, date: d[t], up: mx >= 1.5 * c[t] ? 1 : 0, sd20, r120: c[t] / c[t - 120] - 1, F01: c[t] >= 0.98 * hi ? 1 : 0, F11: v115 > 0 && v5 >= 3 * v115 ? 1 : 0, F15: Number.isFinite(gr) ? (gr >= 0.8 ? 1 : 0) : NaN});
  }
}
// 날마다: F05(6달 추세 위 20%) · 출렁임 다섯 층(같으면 먼저 나온 줄이 앞) · 나를 뺀 같은 칸 비율
const byDate = new Map(); rows.forEach((r, i) => { if (!byDate.has(r.date)) byDate.set(r.date, []); byDate.get(r.date).push(i); });
for (const idx of byDate.values()) {
  const rk = pctRank(idx.map(i => rows[i].r120)); idx.forEach((i, k) => { rows[i].F05 = rk[k] >= 0.8 ? 1 : 0; });
  const ord = idx.map((i, k) => [rows[i].sd20, k]).sort((a, b) => a[0] - b[0] || a[1] - b[1]);
  ord.forEach(([, k], r) => { rows[idx[k]].vq = Math.floor(Math.min((r + 1) / idx.length, 0.999999) * 5); });
  const cell = new Map(); idx.forEach(i => { const q = rows[i].vq; const a = cell.get(q) ?? [0, 0]; a[0] += rows[i].up; a[1]++; cell.set(q, a); });
  idx.forEach(i => { const a = cell.get(rows[i].vq); rows[i].exp = (a[0] - rows[i].up) / (a[1] - 1); });
}
const adj = sel => { let a = 0, e = 0, n = 0; for (const r of rows) if (sel(r)) { a += r.up; e += r.exp; n++; } return {n, p_up: a / n, adj: a / e}; };
const p1 = r => r.date < SPLIT, p2 = r => r.date >= SPLIT;
const two = r => r.F15 === 1 && r.F05 === 1;
const T = Object.fromEntries(py.table.map(x => [x.id, x.s365]));
const L2 = py.two_layer['365']['업종 + 회사도 추세 위'];
const out = {
  rows: [rows.length, py.universe['365'].rows], base_up: [adj(() => true).p_up, py.universe['365'].base_up],
  base_p1: [adj(p1).p_up, py.universe['365'].p1.base_up], base_p2: [adj(p2).p_up, py.universe['365'].p2.base_up],
  F01: [adj(r => r.F01 === 1).adj, T.F01.adj_up], F05: [adj(r => r.F05 === 1).adj, T.F05.adj_up], F11: [adj(r => r.F11 === 1).adj, T.F11.adj_up], F15: [adj(r => r.F15 === 1).adj, T.F15.adj_up],
  two_all: [adj(two).adj, L2.all.adj_up], two_p1: [adj(r => two(r) && p1(r)).adj, L2.p1.adj_up], two_p2: [adj(r => two(r) && p2(r)).adj, L2.p2.adj_up],
  two_n: [adj(two).n, L2.all.n], two_p_up: [adj(two).p_up, L2.all.p_up],
};
let ok = true;
for (const [k, [js, pyv]] of Object.entries(out)) { const same = Math.abs(js - pyv) < 1e-6 * Math.max(1, Math.abs(pyv)); ok &&= same; console.log(`${k}: 자바스크립트 ${js} · 파이썬 ${pyv} → ${same ? '같음' : '다름!'}`); }
console.log(ok ? '모두 같음' : '다른 것이 있음');
