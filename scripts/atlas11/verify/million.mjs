#!/usr/bin/env node
/**
 * ATLAS 11 · 백만 번 맞대기 — 사장님 2026-10-09 19:25 「오류 있느지 1000000번 점 검하고」
 *   무작위 판(씨앗 고정 · 다시 돌려도 같은 판)과 실제 판 읽기(한국 · 미국)로, 칸 그림 셈(site/app/tiles-model.js — 2026-10-10 09:51 · 09:53 「3d 영구 삭제해」 · 「모두다」로
 *   옛 입체 섬 셈 island-model.js 를 바꿈)과 고르는 셈(lib/atlas11/cand.mjs)의 약속을 하나하나 따로 셈해 맞댄다 — 맞댄 횟수가 1,000,000 을 넘을 때까지
 *   (한 번 = 약속 하나를 회사 하나 · 판 하나에서 따로 센 값과 견줌)
 *   ① 칸: 묶음 셋(그물 안 ⇔ flags 다섯째 · 셀 수 없음 ⇔ 1년 추세 없음 · 나머지 그물 밖) · 묶음 안 차례 = 1년 추세 큰 순(같으면 기호 차례) · 자리(줄 · 칸) = 차례 ÷ 20 ·
 *        한 칸에 한 회사 · 20거래일 전 그물 안 ⇔ 그 날 기준선 이상 · 초록 = 기준 셋 · 번호 칸 7곳 = 후보 차례
 *   ② 고름: 기준선 = 넘파이 직선 보간(따로 셈) · 그물 안 · 초입 · 기준(그날 종가 · 흑자 · 위험 공시) · 7곳 = 1년 추세 큰 순 · 같은 업종 3곳(따로 고름) ·
 *        flags 여섯 글자 · 미국 판 위험 공시 = 「확인 못 함」(없다고 쓰지 않음)
 *   ③ 3단 클릭(2026-10-09 21:33 「아틀란스를 3단 클릭구조로 … 모든곳에 하나도 빠짐없이 … 점검 1000000만번」): 칸을 누르면 그 회사 · 그 업종(같은 g 모두) ·
 *        회사 고리 = 판의 회사 · 업종 고리 = 판의 업종 · 같은 칸을 다시 누르면 닫힘 · 다른 칸은 그 칸으로 · 평평한 그림이라 모든 업종에 누를 칸이 있음(가린 칸 0)
 *   node scripts/atlas11/verify/million.mjs [--target 1000000] [--out reports/atlas11/verify/million-latest.json]
 */
import fs from 'node:fs/promises';
import path from 'node:path';
import {tilesModel, COLS, zoneOf, tapStep, tapInfo} from '../../../site/app/tiles-model.js';
import {candOf, CAND_RULES, RISK_UNKNOWN} from '../../../lib/atlas11/cand.mjs';

const arg = (k, d) => { const i = process.argv.indexOf(k); return i > 0 ? process.argv[i + 1] : d; };
const TARGET = Number(arg('--target', '1000000')), OUT = arg('--out', 'reports/atlas11/verify/million-latest.json');
let checks = 0; const fails = [], perKind = {};
const ok = (kind, cond, what) => { checks++; perKind[kind] = (perKind[kind] ?? 0) + 1; if (!cond && fails.length < 50) fails.push({kind, what: String(what).slice(0, 200)}); };
const fin = v => typeof v === 'number' && Number.isFinite(v);
function rngOf(seed) { let s = seed >>> 0 || 1; return () => { s ^= s << 13; s >>>= 0; s ^= s >>> 17; s ^= s << 5; s >>>= 0; return s / 4294967296; }; }
const qLin = (xs, p) => { const a = xs.filter(fin).sort((x, y) => x - y), n = a.length; if (!n) return null; const pos = (p / 100) * (n - 1), lo = Math.floor(pos), hi = Math.min(n - 1, lo + 1); return a[lo] + (a[hi] - a[lo]) * (pos - lo); };
const byCode = (a, b) => (a < b ? -1 : a > b ? 1 : 0);

/* ① 칸 그림 셈 — 판 하나(C · stocks)에서 약속을 회사마다 맞댐 */
function checkTiles(C, stocks, tag) {
  const M = tilesModel(C, stocks); ok('칸 · 값이 있으면 그림', !!M, tag); if (!M) return;
  const cells = M.cells, n = stocks.length, F = C.flags ?? {}, Gm = C.grow.m;
  ok('칸 · 칸 수', cells.length === n, tag);
  const mOf = c => (fin(Gm[c]?.[0]) ? Gm[c][0] : null), mpOf = c => (fin(Gm[c]?.[1]) ? Gm[c][1] : null), qp = fin(C.grow.qp) ? C.grow.qp / 100 : null;
  const blkW = c => { const m = mOf(c); return m === null ? 2 : String(F[c] ?? '')[4] === '1' ? 0 : 1; };
  const want = [0, 1, 2].map(b => stocks.map(s => String(s.code)).filter(c => blkW(c) === b).sort((a, z) => (b === 2 ? 0 : mOf(z) - mOf(a)) || byCode(a, z))); // 따로 줄 세움
  ok('칸 · 묶음 수 = 따로 센 수', M.blocks.join() === want.map(x => x.length).join(), `${tag} ${M.blocks} vs ${want.map(x => x.length)}`);
  ok('칸 · 그리는 차례 = 묶음 ① → ② → ③ · 1년 추세 큰 순', M.order.map(i => cells[i].code).join() === want.flat().join(), tag);
  const spot = new Set();
  for (const c of cells) {
    const b = blkW(c.code), k = want[b].indexOf(c.code), up = String(F[c.code] ?? '')[4] === '1' && mOf(c.code) !== null;
    ok('칸 · 선 위 ⇔ 그물 안', (c.blk === 0) === up && c.up === up, `${tag} ${c.code}`);
    ok('칸 · 값 없음 = 셋째 묶음', (mOf(c.code) === null) === (c.blk === 2), `${tag} ${c.code}`);
    ok('칸 · 차례 = 1년 추세 차례', c.blk === b && c.k === k, `${tag} ${c.code} ${c.k} vs ${k}`);
    ok('칸 · 자리 = 차례 ÷ 20(줄 · 칸)', c.row === Math.floor(k / COLS) && c.col === k % COLS && c.col >= 0 && c.col < COLS, `${tag} ${c.code}`);
    spot.add(`${c.blk}:${c.row}:${c.col}`);
    const upP = mpOf(c.code) !== null && qp !== null && mpOf(c.code) >= qp;
    ok('칸 · 20거래일 전 그물 안 ⇔ 그 날 기준선 이상', c.upP === upP, `${tag} ${c.code}`);
    ok('칸 · 초록 = 그물 안 · 기준 셋', c.elig === (String(F[c.code] ?? '').slice(0, 3) === '111'), `${tag} ${c.code}`);
    ok('칸 · 1년 추세 % = 판 읽기 값(소수 첫째)', c.m12 === (mOf(c.code) === null ? null : Number((mOf(c.code) * 100).toFixed(1))), `${tag} ${c.code}`);
  }
  ok('칸 · 한 칸에 한 회사(자리가 겹치지 않음)', spot.size === n, tag);
  const items = [...(C.items ?? [])].sort((a, b) => a.rank - b.rank);
  ok('칸 · 번호 칸 수 = 후보 수', M.seven.length === items.filter(x => stocks.some(s => String(s.code) === String(x.code))).length, tag);
  M.seven.forEach((i, k) => ok('칸 · 번호 칸 차례 = 후보 차례', cells[i].code === String(items[k].code) && cells[i].rank === items[k].rank, `${tag} ${k}`));
  ok('칸 · 선 위 곳 수', M.above === cells.filter(c => c.up).length, tag);
  ok('칸 · 빗금 곳 수', M.none === cells.filter(c => c.m12 === null).length, tag);
}

/* 무작위 판 — 업종 73곳 × 5곳 · 1년 추세 · 20거래일 전 값 · 기준 셋 · 값 빠짐 */
function randomTiles(seed) {
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

/* ③ 3단 클릭 — 판 하나(칸 · 판의 회사 · 업종 기호)에서 누름 셈의 약속 · 평평한 그림이라 모든 칸을 누를 수 있음 */
const nav3 = {zones: {}, tappable: {}};
function checkNav3(C, stocks, tag, {codes = null, gids = null} = {}) {
  const M = tilesModel(C, stocks); ok('3단 · 칸 그림이 있음', !!M, tag); if (!M) return;
  const cells = M.cells, n = cells.length, zones = new Map(); cells.forEach((c, i) => { const z = zoneOf(c); if (!zones.has(z)) zones.set(z, []); zones.get(z).push(i); });
  for (let j = 0; j < n; j++) {
    const c = cells[j], s1 = tapStep(cells, null, j), info = tapInfo(cells, s1);
    ok('3단 · 칸을 누르면 그 회사', s1.i === j && !!info && info.co.code === c.code, `${tag} ${c.code}`);
    ok('3단 · 회사 고리 = #/stock/기호', info?.co.href === `#/stock/${c.code}`, `${tag} ${c.code}`);
    if (codes) ok('3단 · 회사 고리 = 판의 회사', codes.has(c.code), `${tag} ${c.code}`);
    ok('3단 · 그 업종 = 같은 g 의 회사 모두', !!info && info.zone.cos.length === zones.get(zoneOf(c)).length && info.zone.cos.every(x => zoneOf(cells[cells.findIndex(y => y.code === x.code)]) === zoneOf(c)), `${tag} ${c.code}`);
    ok('3단 · 업종 칸에 누른 회사 표시(하나)', !!info && info.zone.cos.filter(x => x.on).length === 1 && info.zone.cos.find(x => x.on)?.code === c.code, `${tag} ${c.code}`);
    ok('3단 · 업종 고리 = #/i/업종', !!info && (c.g == null ? info.zone.href === null : info.zone.href === `#/i/${c.g}`), `${tag} ${c.code}`);
    if (gids && c.g != null) ok('3단 · 업종 고리 = 판의 업종', gids.has(c.g), `${tag} ${c.g}`);
    const s2 = tapStep(cells, s1, j); ok('3단 · 같은 칸을 다시 누르면 닫힘', s2.i === -1 && s2.z === null && tapInfo(cells, s2) === null, `${tag} ${c.code}`);
    ok('3단 · 빈 곳을 누르면 닫힘', tapStep(cells, s1, -1).i === -1, `${tag} ${c.code}`);
    for (let k = 0; k < n; k++) if (k !== j) { const s3 = tapStep(cells, s1, k); ok('3단 · 다른 칸을 누르면 그 칸 · 그 업종', s3.i === k && s3.z === zoneOf(cells[k]), `${tag} ${c.code}→${cells[k].code}`); }
  }
  const spots = new Set(cells.map(c => `${c.blk}:${c.row}:${c.col}`)), zoneOk = new Set(cells.filter(c => c.col >= 0 && c.col < COLS).map(zoneOf));
  nav3.zones[tag] = zones.size; nav3.tappable[tag] = spots.size;
  ok('3단 · 모든 업종에 누를 칸이 있음(가린 칸 0 — 평평한 그림)', zoneOk.size === zones.size && spots.size === n, `${tag} 업종 ${zoneOk.size}/${zones.size} · 칸 ${spots.size}/${n}`);
}

/* 실제 판 읽기(한국 · 미국) — 사이트 묶음(dist)에 있으면 칸 그림 셈을 같은 약속으로 */
const real = [];
for (const [place, f] of [['kr', 'dist/data/atlas11/view/lens.json'], ['us', 'dist/us/data/atlas11/view/lens.json']]) {
  try { const L = JSON.parse(await fs.readFile(f, 'utf8')); if (L.cand?.ready) { checkTiles(L.cand, L.stocks, `실제 ${place}`); real.push(place);
    const B = JSON.parse(await fs.readFile(f.replace('lens.json', 'board.json'), 'utf8'));
    checkNav3(L.cand, L.stocks, `실제 ${place}`, {codes: new Set(B.companies.map(c => String(c.code))), gids: new Set((B.groups ?? []).map(g => String(g.id)))}); } } catch (e) { if (process.env.MILLION_DEBUG) console.error(e); }
}
const t0 = Date.now(); let boardsT = 0, boardsC = 0;
for (let seed = 1; boardsC < 60; seed++) { checkCand(seed, seed % 2 ? 'kr' : 'us'); boardsC++; }
let boardsN = 0; for (let seed = 1; seed <= 6; seed++) { const {C, stocks} = randomTiles(seed + 5000); checkNav3(C, stocks, `무작위 칸 3단 #${seed}`); boardsN++; } // 3단 클릭 — 무작위 판(누름 셈)
const nav3Now = () => Object.entries(perKind).filter(([k]) => k.startsWith('3단')).reduce((t, [, v]) => t + v, 0);
const base3 = nav3Now(); for (let seed = 1; checks - base3 < TARGET; seed++) { const {C, stocks} = randomTiles(seed); checkTiles(C, stocks, `무작위 칸 #${seed}`); boardsT++; } // 칸 · 고르는 셈 약속은 3단과 따로 목표 수만큼
const nav3n = nav3Now();
const res = {schema: 'atlas11-million-3', at: new Date().toISOString(), seconds: Math.round((Date.now() - t0) / 1000), checks, target: TARGET, failed: fails.length, real, boards: {tiles: boardsT, cand: boardsC, nav3: boardsN}, nav3: {checks: nav3n, ...nav3}, perKind, fails};
await fs.mkdir(path.dirname(OUT), {recursive: true}); await fs.writeFile(OUT, JSON.stringify(res, null, 1) + '\n');
console.log(JSON.stringify({checks, failed: fails.length, real, boards: res.boards, nav3: nav3n, seconds: res.seconds, sample: fails.slice(0, 5)}));
process.exit(fails.length ? 1 : 0);
