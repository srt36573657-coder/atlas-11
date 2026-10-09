#!/usr/bin/env node
/**
 * ATLAS 11 · 백만 번 맞대기 — 사장님 2026-10-09 19:25 「오류 있느지 1000000번 점 검하고」
 *   무작위 판(씨앗 고정 · 다시 돌려도 같은 판)과 실제 판 읽기(한국 · 미국)로, 섬 셈(site/app/island-model.js)과 고르는 셈(lib/atlas11/cand.mjs)의 약속을
 *   하나하나 따로 셈해 맞댄다 — 맞댄 횟수가 1,000,000 을 넘을 때까지(한 번 = 약속 하나를 회사 하나 · 판 하나에서 따로 센 값과 견줌)
 *   ① 섬: 칸이 겹치지 않음 · 업종 구역이 십자 모양 · 높이가 0~1 · 물 위 ⇔ 그물 안(flags 다섯째) · 같은 무리 안 높이 차례 = 1년 추세 차례 ·
 *        20거래일 전 물 위 ⇔ 그 날 기준선 이상 · 빛나는 7곳 = 후보 차례 · 값 없음 = 바닥
 *   ② 고름: 기준선 = 넘파이 직선 보간(따로 셈) · 그물 안 · 초입 · 기준(그날 종가 · 흑자 · 위험 공시) · 7곳 = 1년 추세 큰 순 · 같은 업종 3곳(따로 고름) ·
 *        flags 여섯 글자 · 미국 판 위험 공시 = 「확인 못 함」(없다고 쓰지 않음)
 *   ③ 3단 클릭(2026-10-09 21:33 「아틀란스를 3단 클릭구조로 … 모든곳에 하나도 빠짐없이 … 점검 1000000만번」): 탑을 누르면 그 회사 · 그 업종(같은 g 다섯 곳) ·
 *        회사 고리 = 판의 회사 · 업종 고리 = 판의 업종 · 같은 탑을 다시 누르면 닫힘 · 다른 탑은 그 탑으로 · 지도 섬 처음 모습에서 업종마다 누를 수 있는 탑이 있음(가린 업종 0) ·
 *        누를 수 있는 점은 섬 칸 안 · 그 점을 누르면 그 탑(각도 72가지)
 *   node scripts/atlas11/verify/million.mjs [--target 1000000] [--out reports/atlas11/verify/million-latest.json]
 */
import fs from 'node:fs/promises';
import path from 'node:path';
import {islandModel, ISL, MAP, mapView, zoneOf, tapStep, tapInfo, projOf, towerHull, insideHull, hitCell, tapPointOf} from '../../../site/app/island-model.js';
import {candOf, CAND_RULES, RISK_UNKNOWN} from '../../../lib/atlas11/cand.mjs';

const arg = (k, d) => { const i = process.argv.indexOf(k); return i > 0 ? process.argv[i + 1] : d; };
const TARGET = Number(arg('--target', '1000000')), OUT = arg('--out', 'reports/atlas11/verify/million-latest.json');
let checks = 0; const fails = [], perKind = {};
const ok = (kind, cond, what) => { checks++; perKind[kind] = (perKind[kind] ?? 0) + 1; if (!cond && fails.length < 50) fails.push({kind, what: String(what).slice(0, 200)}); };
const fin = v => typeof v === 'number' && Number.isFinite(v);
function rngOf(seed) { let s = seed >>> 0 || 1; return () => { s ^= s << 13; s >>>= 0; s ^= s >>> 17; s ^= s << 5; s >>>= 0; return s / 4294967296; }; }
const qLin = (xs, p) => { const a = xs.filter(fin).sort((x, y) => x - y), n = a.length; if (!n) return null; const pos = (p / 100) * (n - 1), lo = Math.floor(pos), hi = Math.min(n - 1, lo + 1); return a[lo] + (a[hi] - a[lo]) * (pos - lo); };

/* ① 섬 셈 — 판 하나(C · stocks)에서 약속을 회사마다 맞댐 */
function checkIsland(C, stocks, tag) {
  const M = islandModel(C, stocks); ok('섬 · 값이 있으면 그림', !!M, tag); if (!M) return;
  const w = M.w, cells = M.cells, n = stocks.length, F = C.flags ?? {}, Gm = C.grow.m;
  ok('섬 · 칸 수', cells.length === n, tag);
  const keys = new Set(cells.map(c => `${c.x},${c.y}`)); ok('섬 · 칸이 겹치지 않음', keys.size === n, tag);
  const byD = new Map(); cells.forEach(c => { if (!byD.has(c.d)) byD.set(c.d, []); byD.get(c.d).push(c); });
  const L1 = (a, b) => Math.abs(a.x - b.x) + Math.abs(a.y - b.y);
  for (const cs of byD.values()) { const hub = cs.find(c => cs.every(o => L1(o, c) <= 1)); // 십자 가운데 칸 — 나머지가 모두 한 칸 안
    for (const c of cs) ok('섬 · 구역은 십자(가운데 칸에서 한 칸 안)', !!hub && L1(c, hub) <= 1 && cs.length <= ISL.per, `${tag} ${c.code}`); }
  const mOf = c => (fin(Gm[c]?.[0]) ? Gm[c][0] : null), mpOf = c => (fin(Gm[c]?.[1]) ? Gm[c][1] : null), qp = fin(C.grow.qp) ? C.grow.qp / 100 : null;
  for (const c of cells) {
    ok('섬 · 높이 0~1(오늘)', c.hN >= 0 && c.hN <= 1, `${tag} ${c.code} ${c.hN}`);
    ok('섬 · 높이 0~1(20거래일 전)', c.hP >= 0 && c.hP <= 1, `${tag} ${c.code} ${c.hP}`);
    const up = String(F[c.code] ?? '')[4] === '1' && mOf(c.code) !== null;
    ok('섬 · 물 위 ⇔ 그물 안', (c.hN > w) === up, `${tag} ${c.code}`);
    ok('섬 · 값 없음 = 바닥', mOf(c.code) !== null || c.hN === 0, `${tag} ${c.code}`);
    const upP = mpOf(c.code) !== null && qp !== null && mpOf(c.code) >= qp;
    ok('섬 · 20거래일 전 물 위 ⇔ 그 날 기준선 이상', (c.hP > w) === upP, `${tag} ${c.code}`);
    ok('섬 · 초록 = 물 위 · 기준 셋', c.elig === (String(F[c.code] ?? '').slice(0, 3) === '111'), `${tag} ${c.code}`);
  }
  for (const grp of [cells.filter(c => c.hN > w), cells.filter(c => c.hN <= w && mOf(c.code) !== null)]) { // 같은 무리 안 높이 차례 = 1년 추세 차례
    const srt = [...grp].sort((a, b) => (mOf(a.code) - mOf(b.code)) || (a.code < b.code ? -1 : a.code > b.code ? 1 : 0));
    for (let k = 1; k < srt.length; k++) ok('섬 · 높이 차례 = 1년 추세 차례', srt[k].hN > srt[k - 1].hN || (mOf(srt[k].code) === mOf(srt[k - 1].code) && srt[k].hN >= srt[k - 1].hN), `${tag} ${srt[k - 1].code} → ${srt[k].code}`);
  }
  const items = [...(C.items ?? [])].sort((a, b) => a.rank - b.rank);
  ok('섬 · 빛나는 곳 수 = 후보 수', M.seven.length === items.filter(x => stocks.some(s => String(s.code) === String(x.code))).length, tag);
  M.seven.forEach((i, k) => ok('섬 · 빛나는 곳 차례 = 후보 차례', cells[i].code === String(items[k].code) && cells[i].rank === items[k].rank, `${tag} ${k}`));
  ok('섬 · 물 위 곳 수', M.above === cells.filter(c => c.hN > w).length, tag);
}

/* 무작위 판 — 업종 73곳 × 5곳 · 1년 추세 · 20거래일 전 값 · 기준 셋 · 값 빠짐 */
function randomIsland(seed) {
  const r = rngOf(seed), stocks = [], m = {}, flags = {}, nSec = 73;
  for (let g = 0; g < nSec; g++) for (let k = 0; k < 5; k++) { const code = `R${String(seed % 1000).padStart(3, '0')}${String(g * 5 + k).padStart(3, '0')}`; stocks.push({code, name: code, g: 'g' + g, gl: '업종' + g});
    const a = r() < 0.03 ? null : Number(((r() - 0.3) * 2).toFixed(4)), b = r() < 0.03 ? null : Number(((r() - 0.3) * 2).toFixed(4)); m[code] = [a, b]; }
  const q = qLin(stocks.map(s => m[s.code][0]), 80), qp = qLin(stocks.map(s => m[s.code][1]), 80);
  for (const s of stocks) { const [a, b] = m[s.code], e = [r() < 0.95, r() < 0.9, r() < 0.97], inNet = fin(a) && a >= q, inPrev = fin(b) && b >= qp;
    flags[s.code] = [...e, fin(a), inNet, inNet && !inPrev].map(x => (x ? '1' : '0')).join(''); }
  const fresh = stocks.filter(s => flags[s.code] === '111111').sort((x, y) => m[y.code][0] - m[x.code][0] || (x.code < y.code ? -1 : 1));
  const per = new Map(), items = []; for (const s of fresh) { if (items.length >= 7) break; const k = per.get(s.g) ?? 0; if (k >= 3) continue; per.set(s.g, k + 1); items.push({code: s.code, rank: items.length + 1, status: 'met'}); }
  return {C: {grow: {m, qp: fin(qp) ? qp * 100 : null}, flags, items}, stocks};
}

/* ② 고르는 셈 — 무작위 종가 300거래일 · 결산 · 공시로 candOf 를 돌리고 따로 셈해 맞댐 */
function randomBoard(seed, place) {
  const r = rngOf(seed * 7919 + 13), N = 120, SES = Array.from({length: 300}, (_, i) => { const d = new Date(Date.UTC(2025, 6, 1) + i * 86400000); return d.toISOString().slice(0, 10); });
  const ASOF = SES.at(-1), stocks = [], price = new Map();
  for (let i = 0; i < N; i++) { const code = `C${String(i).padStart(4, '0')}`, g = 'g' + (i % 24), drift = (r() - 0.45) * 0.004; let p = 100 * (0.5 + r()); const row = new Map();
    for (const d of SES) { p *= 1 + drift + (r() - 0.5) * 0.03; row.set(d, r() < 0.002 ? null : Number(p.toFixed(2))); }
    if (r() < 0.04) row.set(ASOF, null); price.set(code, row);
    const op = r() < 0.08 ? -5 : r() < 0.03 ? null : 10, net = r() < 0.08 ? -3 : 8;
    stocks.push({code, name: code, g, gl: '업종' + (i % 24), date: row.get(ASOF) != null ? ASOF : SES.at(-2), close: row.get(ASOF), status: row.get(ASOF) != null ? 'ok' : 'late', fund: {fy: '2025.12', op, net, roe: 10, debt: 50}, r20: 1, r5: 1}); }
  const priceAt = (code, d) => price.get(code)?.get(d) ?? null;
  const agenda = {byCode: {}}; for (const s of stocks) if (r() < 0.05) agenda.byCode[s.code] = {disclosures: [{title: '관리종목 지정', publishedAt: `${SES.at(-5)}T10:00:00+09:00`, level: 3}]};
  return {stocks, priceAt, sessions: SES, asOf: ASOF, agenda, place};
}
function checkCand(seed, place) {
  const B = randomBoard(seed, place), tag = `${place}#${seed}`;
  const C = candOf({place, asOf: B.asOf, stocks: B.stocks, board: {companies: [], groups: []}, agenda: B.agenda, sessions: B.sessions, priceAt: B.priceAt});
  ok('고름 · 셈이 돎', C.ready === true, `${tag} ${C.why ?? ''}`); if (!C.ready) return;
  const R = CAND_RULES, ses = B.sessions, k0 = ses.indexOf(B.asOf);
  const tr = (code, k) => { const c0 = B.priceAt(code, ses[k]), a = B.priceAt(code, ses[k - R.look]), b = B.priceAt(code, ses[k - R.skip]); return fin(c0) && fin(a) && fin(b) && a > 0 ? Math.round((b / a - 1) * 1e4) / 1e4 : null; };
  const m = new Map(B.stocks.map(s => [s.code, tr(s.code, k0)])), mp = new Map(B.stocks.map(s => [s.code, tr(s.code, k0 - R.gap)]));
  const q = qLin([...m.values()], 100 - R.netPct), qp = qLin([...mp.values()], 100 - R.netPct);
  ok('고름 · 기준선 = 따로 센 직선 보간', fin(C.grow.q) && Math.abs(C.grow.q - q * 100) < 1e-9, `${tag} ${C.grow.q} vs ${q * 100}`);
  const riskBad = code => (B.agenda.byCode[code]?.disclosures ?? []).length > 0;
  const elig = s => s.close != null && s.date === B.asOf && fin(s.fund.op) && fin(s.fund.net) && s.fund.op > 0 && s.fund.net > 0 && (place !== 'kr' || !riskBad(s.code));
  for (const s of B.stocks) {
    const a = m.get(s.code), b = mp.get(s.code), inNet = fin(a) && a >= q, inPrev = fin(b) && b >= qp, f = C.flags[s.code];
    ok('고름 · 1년 추세 값(따로 셈)', (C.grow.m[s.code][0] ?? null) === a, `${tag} ${s.code}`);
    ok('고름 · 그물 안(flags 다섯째)', f[4] === (inNet ? '1' : '0'), `${tag} ${s.code}`);
    ok('고름 · 초입(flags 여섯째)', f[5] === (inNet && !inPrev ? '1' : '0'), `${tag} ${s.code}`);
    ok('고름 · 기준 셋(flags 앞 셋)', (f.slice(0, 3) === '111') === elig(s), `${tag} ${s.code} ${f}`);
  }
  const fresh = B.stocks.filter(s => elig(s) && fin(m.get(s.code)) && m.get(s.code) >= q && !(fin(mp.get(s.code)) && mp.get(s.code) >= qp)).sort((x, y) => (m.get(y.code) - m.get(x.code)) || (x.code < y.code ? -1 : 1));
  const per = new Map(), want = []; for (const s of fresh) { if (want.length >= R.want) break; const k = per.get(s.g) ?? 0; if (k >= R.perSector) continue; per.set(s.g, k + 1); want.push(s.code); }
  ok('고름 · 7곳 = 따로 고른 7곳(차례까지)', C.items.map(x => x.code).join() === want.join(), `${tag} ${C.items.map(x => x.code).join()} vs ${want.join()}`);
  ok('고름 · 7곳 이하', C.items.length <= R.want, tag);
  const perC = new Map(); for (const x of C.items) perC.set(x.g, (perC.get(x.g) ?? 0) + 1); ok('고름 · 같은 업종 3곳 이하', [...perC.values()].every(v => v <= R.perSector), tag);
  for (const x of C.items) {
    ok('고름 · 후보는 그물 안 · 초입', x.grow.inNet && x.grow.newc, `${tag} ${x.code}`);
    if (place !== 'kr') { ok('고름 · 미국 판 위험 공시 = 확인 못 함', x.checks.risk.unknown === true && x.checks.risk.now === RISK_UNKNOWN, `${tag} ${x.code}`); ok('고름 · 미국 판에 「위험 공시 없음」 글 없음', !JSON.stringify(x.entry).includes('위험 공시 없음'), `${tag} ${x.code}`); }
  }
  if (place !== 'kr') ok('고름 · 미국 판 돈 유입 1~365등 없음', C.rank === null, tag);
  ok('고름 · pool 그물 수', C.pool.net === B.stocks.filter(s => fin(m.get(s.code)) && m.get(s.code) >= q).length, tag);
}

/* ③ 3단 클릭 — 판 하나(섬 칸 · 판의 회사 · 업종 기호)에서 누름 셈과 자리 셈의 약속 */
function fastHit(cells, v, zOf) { // hitCell 과 같은 셈 — 껍질을 한 번만 셈(맞대기 속도) · 둘이 같은지도 맞댐
  const P = projOf(v), sn = Math.sin(v.th), cs = Math.cos(v.th), front = cells.map((_, i) => i).sort((a, b) => (cells[b].x * sn + cells[b].y * cs) - (cells[a].x * sn + cells[a].y * cs) || a - b);
  const H = cells.map((c, i) => { const hl = towerHull(c, P, zOf(i)); let x0 = Infinity, x1 = -Infinity, y0 = Infinity, y1 = -Infinity; for (const q of hl) { x0 = Math.min(x0, q[0]); x1 = Math.max(x1, q[0]); y0 = Math.min(y0, q[1]); y1 = Math.max(y1, q[1]); } return {hl, x0, x1, y0, y1}; });
  return (px, py) => { for (const i of front) { const h = H[i]; if (px < h.x0 - 1 || px > h.x1 + 1 || py < h.y0 - 1 || py > h.y1 + 1) continue; if (insideHull(h.hl, px, py)) return i; } return -1; };
}
const nav3 = {hiddenZones: {}, tappable: {}};
function checkNav3(C, stocks, tag, {codes = null, gids = null, geo = false} = {}) {
  const M = islandModel(C, stocks); ok('3단 · 섬이 있음', !!M, tag); if (!M) return;
  const cells = M.cells, n = cells.length, zones = new Map(); cells.forEach((c, i) => { const z = zoneOf(c); if (!zones.has(z)) zones.set(z, []); zones.get(z).push(i); });
  for (let j = 0; j < n; j++) {
    const c = cells[j], s1 = tapStep(cells, null, j), info = tapInfo(cells, s1);
    ok('3단 · 탑을 누르면 그 회사', s1.i === j && !!info && info.co.code === c.code, `${tag} ${c.code}`);
    ok('3단 · 회사 고리 = #/stock/기호', info?.co.href === `#/stock/${c.code}`, `${tag} ${c.code}`);
    if (codes) ok('3단 · 회사 고리 = 판의 회사', codes.has(c.code), `${tag} ${c.code}`);
    ok('3단 · 그 업종 = 같은 g 의 회사 모두', !!info && info.zone.cos.length === zones.get(zoneOf(c)).length && info.zone.cos.every(x => zoneOf(cells[cells.findIndex(y => y.code === x.code)]) === zoneOf(c)), `${tag} ${c.code}`);
    ok('3단 · 업종 칸에 누른 회사 표시(하나)', !!info && info.zone.cos.filter(x => x.on).length === 1 && info.zone.cos.find(x => x.on)?.code === c.code, `${tag} ${c.code}`);
    ok('3단 · 업종 고리 = #/i/업종', !!info && (c.g == null ? info.zone.href === null : info.zone.href === `#/i/${c.g}`), `${tag} ${c.code}`);
    if (gids && c.g != null) ok('3단 · 업종 고리 = 판의 업종', gids.has(c.g), `${tag} ${c.g}`);
    const s2 = tapStep(cells, s1, j); ok('3단 · 같은 탑을 다시 누르면 닫힘', s2.i === -1 && s2.z === null && tapInfo(cells, s2) === null, `${tag} ${c.code}`);
    ok('3단 · 빈 곳을 누르면 닫힘', tapStep(cells, s1, -1).i === -1, `${tag} ${c.code}`);
    for (let k = 0; k < n; k++) if (k !== j) { const s3 = tapStep(cells, s1, k); ok('3단 · 다른 탑을 누르면 그 탑 · 그 업종', s3.i === k && s3.z === zoneOf(cells[k]), `${tag} ${c.code}→${cells[k].code}`); }
  }
  if (!geo) return;
  for (const W of [360, 390]) {
    const Hp = Math.round(W * MAP.h), zOf = i => cells[i].hN;
    for (let deg = 0; deg < 360; deg += 5) {
      const th = deg * Math.PI / 180, v = mapView(W, th), hit = fastHit(cells, v, zOf), P = projOf(v); let tap = 0; const zoneOk = new Set();
      for (let i = 0; i < n; i++) {
        const c = cells[i], z = Math.max(zOf(i), 0.006); let q = null;
        for (const f of [1, 0.9, 0.75, 0.6, 0.45, 0.3, 0.15, 0.02]) { for (const [ox, oy] of [[0, 0], [-0.2, 0], [0.2, 0], [0, 0.2], [0, -0.2], [-0.3, -0.3], [0.3, 0.3], [-0.3, 0.3], [0.3, -0.3]]) { const p = P(c.x + ox, c.y + oy, z * f); if (hit(p[0], p[1] + 1) === i) { q = [p[0], p[1] + 1]; break; } } if (q) break; }
        if (!q) continue; tap++; zoneOk.add(zoneOf(c));
        ok('3단 · 누를 수 있는 점은 섬 칸 안', q[0] >= 0 && q[0] <= W && q[1] >= 0 && q[1] <= Hp, `${tag} W${W} ${deg}° ${c.code}`);
        ok('3단 · 그 점을 누르면 그 탑(앞 탑이 아님)', hit(q[0], q[1]) === i, `${tag} W${W} ${deg}° ${c.code}`);
        if (deg % 45 === 0 && i % 7 === 0) ok('3단 · 빠른 셈 = 화면 셈(hitCell)', hitCell(cells, v, zOf, q[0], q[1]) === i, `${tag} W${W} ${deg}° ${c.code}`);
      }
      const hidden = zones.size - zoneOk.size;
      if (Math.abs(th - MAP.th) < 0.05 || deg === 35) { nav3.hiddenZones[`${tag} W${W} 처음`] = hidden; nav3.tappable[`${tag} W${W} 처음`] = tap; }
      ok('3단 · 섬 밖을 누르면 아무 탑도 아님', hit(-50, -50) === -1 && hit(W + 50, Hp + 50) === -1, `${tag} W${W} ${deg}°`);
    }
    // 처음 각도(MAP.th) — 업종마다 누를 수 있는 탑이 하나는 있음(가린 업종 0)
    const v0 = mapView(W), hit0 = fastHit(cells, v0, zOf), P0 = projOf(v0), zoneOk0 = new Set(); let tap0 = 0;
    for (let i = 0; i < n; i++) { const c = cells[i], z = Math.max(zOf(i), 0.006); let got = false;
      for (const f of [1, 0.9, 0.75, 0.6, 0.45, 0.3, 0.15, 0.02]) { for (const [ox, oy] of [[0, 0], [-0.2, 0], [0.2, 0], [0, 0.2], [0, -0.2], [-0.3, -0.3], [0.3, 0.3], [-0.3, 0.3], [0.3, -0.3]]) { const p = P0(c.x + ox, c.y + oy, z * f); if (hit0(p[0], p[1] + 1) === i) { got = true; break; } } if (got) break; }
      if (got) { tap0++; zoneOk0.add(zoneOf(c)); } }
    nav3.hiddenZones[`${tag} W${W}`] = zones.size - zoneOk0.size; nav3.tappable[`${tag} W${W}`] = tap0;
    ok('3단 · 지도 섬 처음 모습에서 업종마다 누를 수 있는 탑(가린 업종 0)', zoneOk0.size === zones.size, `${tag} W${W} 가린 업종 ${zones.size - zoneOk0.size}개`);
  }
}

/* 실제 판 읽기(한국 · 미국) — 사이트 묶음(dist)에 있으면 섬 셈을 같은 약속으로 */
const real = [];
for (const [place, f] of [['kr', 'dist/data/atlas11/view/lens.json'], ['us', 'dist/us/data/atlas11/view/lens.json']]) {
  try { const L = JSON.parse(await fs.readFile(f, 'utf8')); if (L.cand?.ready) { checkIsland(L.cand, L.stocks, `실제 ${place}`); real.push(place);
    const B = JSON.parse(await fs.readFile(f.replace('lens.json', 'board.json'), 'utf8')).catch?.(() => null) ?? JSON.parse(await fs.readFile(f.replace('lens.json', 'board.json'), 'utf8'));
    checkNav3(L.cand, L.stocks, `실제 ${place}`, {codes: new Set(B.companies.map(c => String(c.code))), gids: new Set((B.groups ?? []).map(g => String(g.id))), geo: true}); } } catch (e) { if (process.env.MILLION_DEBUG) console.error(e); }
}
const t0 = Date.now(); let boardsI = 0, boardsC = 0;
for (let seed = 1; boardsC < 60; seed++) { checkCand(seed, seed % 2 ? 'kr' : 'us'); boardsC++; }
let boardsN = 0; for (let seed = 1; seed <= 6; seed++) { const {C, stocks} = randomIsland(seed + 5000); checkNav3(C, stocks, `무작위 섬 3단 #${seed}`); boardsN++; } // 3단 클릭 — 무작위 판(누름 셈)
const nav3Now = () => Object.entries(perKind).filter(([k]) => k.startsWith('3단')).reduce((t, [, v]) => t + v, 0);
const base3 = nav3Now(); for (let seed = 1; checks - base3 < TARGET; seed++) { const {C, stocks} = randomIsland(seed); checkIsland(C, stocks, `무작위 섬 #${seed}`); boardsI++; } // 섬 · 고르는 셈 약속은 3단과 따로 목표 수만큼
const nav3n = Object.entries(perKind).filter(([k]) => k.startsWith('3단')).reduce((t, [, v]) => t + v, 0);
const res = {schema: 'atlas11-million-2', at: new Date().toISOString(), seconds: Math.round((Date.now() - t0) / 1000), checks, target: TARGET, failed: fails.length, real, boards: {island: boardsI, cand: boardsC, nav3: boardsN}, nav3: {checks: nav3n, ...nav3}, perKind, fails};
await fs.mkdir(path.dirname(OUT), {recursive: true}); await fs.writeFile(OUT, JSON.stringify(res, null, 1) + '\n');
console.log(JSON.stringify({checks, failed: fails.length, real, boards: res.boards, nav3: nav3n, hiddenZones: nav3.hiddenZones, seconds: res.seconds, sample: fails.slice(0, 5)}));
process.exit(fails.length ? 1 : 0);
