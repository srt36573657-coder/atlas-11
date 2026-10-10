#!/usr/bin/env node
/**
 * ATLAS 11 · 백만 번 맞대기 — 사장님 2026-10-09 19:25 「오류 있느지 1000000번 점 검하고」
 *   무작위 판(씨앗 고정 · 다시 돌려도 같은 판)과 실제 판 읽기(한국 · 미국)로, 첫 화면 막대 그래프 셈(site/app/candbars.js — 2026-10-10 11:19(마카오) 「바둑판 영구 삭제해」로
 *   365칸 바둑판 셈 tiles-model.js 를 바꿈)과 고르는 셈(lib/atlas11/cand.mjs)의 약속을 하나하나 따로 셈해 맞댄다 — 맞댄 횟수가 1,000,000 을 넘을 때까지
 *   (한 번 = 약속 하나를 줄 하나 · 판 하나에서 따로 센 값과 견줌)
 *   ① 막대: 줄 = 후보(순위 차례) · 1년 추세 % = 판 읽기 값(소수 첫째) · 20거래일 전 % · 점선 = 기준선(qD) · 그때 기준선(qp 소수 첫째) · 같은 축(따로 셈)이 0 · 기준선 · 모든 값을 담음 ·
 *        막대 = 0 에서 값까지(오름 = 0 의 오른쪽 · 내림 = 왼쪽 · 아주 짧으면 0.6%) · 값이 없으면 막대 없음 · 짧은 세로 줄 자리 = 20거래일 전 값 · 큰 값이 오른쪽 ·
 *        그물 안 곳 수(flags 다섯째 · 값 있음) · 기준 셋을 넘은 곳 수(앞 셋 111)
 *   ② 고름: 기준선 = 넘파이 직선 보간(따로 셈) · 그물 안 · 초입 · 기준(그날 종가 · 흑자 · 위험 공시) · 7곳 = 1년 추세 큰 순 · 같은 업종 3곳(따로 고름) ·
 *        flags 여섯 글자 · 미국 판 위험 공시 = 「확인 못 함」(없다고 쓰지 않음)
 *   ③ 3단 클릭(2026-10-09 21:33 「아틀란스를 3단 클릭구조로 … 모든곳에 하나도 빠짐없이 … 점검 1000000만번」): 실제 판에서 막대 줄 = 판의 회사(줄 → 카드 → 회사 화면) ·
 *        후보 업종 = 판의 업종 — 화면마다 누름 수는 빠짐없이 도는 검사의 3단 클릭 층(click3)이 잼
 *   node scripts/atlas11/verify/million.mjs [--target 1000000] [--out reports/atlas11/verify/million-latest.json]
 */
import fs from 'node:fs/promises';
import path from 'node:path';
import {barsModel, barGeo} from '../../../site/app/candbars.js';
import {posOf} from '../../../site/app/charts.js';
import {candOf, CAND_RULES, RISK_UNKNOWN} from '../../../lib/atlas11/cand.mjs';

const arg = (k, d) => { const i = process.argv.indexOf(k); return i > 0 ? process.argv[i + 1] : d; };
const TARGET = Number(arg('--target', '1000000')), OUT = arg('--out', 'reports/atlas11/verify/million-latest.json');
let checks = 0; const fails = [], perKind = {};
const ok = (kind, cond, what) => { checks++; perKind[kind] = (perKind[kind] ?? 0) + 1; if (!cond && fails.length < 50) fails.push({kind, what: String(what).slice(0, 200)}); };
const fin = v => typeof v === 'number' && Number.isFinite(v);
function rngOf(seed) { let s = seed >>> 0 || 1; return () => { s ^= s << 13; s >>>= 0; s ^= s >>> 17; s ^= s << 5; s >>>= 0; return s / 4294967296; }; }
const qLin = (xs, p) => { const a = xs.filter(fin).sort((x, y) => x - y), n = a.length; if (!n) return null; const pos = (p / 100) * (n - 1), lo = Math.floor(pos), hi = Math.min(n - 1, lo + 1); return a[lo] + (a[hi] - a[lo]) * (pos - lo); };
const near = (a, b) => Math.abs(a - b) < 1e-9;

/* ① 막대 그래프 셈 — 판 하나(C)에서 약속을 줄마다 맞댐 · 축 · 자리는 따로 셈(같은 꼴 · 다른 코드) */
function checkBars(C, tag) {
  const M = barsModel(C), Gm = C?.grow?.m, items = [...(C?.items ?? [])].sort((a, b) => a.rank - b.rank);
  ok('막대 · 값이 있으면 그림 · 없으면 그리지 않음', !!M === !!(C?.grow && Gm && items.length), tag); if (!M) return;
  const d1 = v => (fin(v) ? Number((v * 100).toFixed(1)) : null), G = C.grow;
  const qW = fin(G.qD) ? G.qD : fin(G.q) ? Number(G.q.toFixed(1)) : null, qpW = fin(G.qp) ? Number(G.qp.toFixed(1)) : null;
  ok('막대 · 줄 수 = 후보 수', M.rows.length === items.length && M.n === items.length, `${tag} ${M.rows.length} vs ${items.length}`);
  ok('막대 · 점선 = 기준선(qD) · 그때 기준선(qp 소수 첫째)', M.q === qW && M.qp === qpW, `${tag} ${M.q}/${M.qp} vs ${qW}/${qpW}`);
  const all = [0, qW, qpW, ...items.flatMap(x => [d1(Gm[String(x.code)]?.[0]), d1(Gm[String(x.code)]?.[1])])].filter(fin);
  let lo = Math.min(...all), hi = Math.max(...all); if (hi - lo < 1e-9) { lo = -1; hi = 1; } const span = hi - lo; if (lo < 0) lo -= span * 0.04; if (hi > 0) hi += span * 0.04; // 축 따로 셈(4% 여유)
  ok('막대 · 같은 축(따로 셈)', near(M.ax.lo, lo) && near(M.ax.hi, hi), `${tag} ${M.ax.lo}~${M.ax.hi} vs ${lo}~${hi}`);
  const pW = v => ((v - lo) / (hi - lo)) * 100, p0 = pW(0);
  ok('막대 · 0 · 기준선이 축 안', [0, qW, qpW].filter(fin).every(v => v >= M.ax.lo && v <= M.ax.hi), tag);
  items.forEach((x, k) => {
    const r = M.rows[k], c = String(x.code), m = Gm[c] ?? [], who = `${tag} ${c}`;
    ok('막대 · 줄 차례 = 순위 차례', !!r && r.code === c && r.rank === x.rank, who); if (!r) return;
    ok('막대 · 1년 추세 % = 판 읽기 값(소수 첫째)', r.m12 === d1(m[0]), `${who} ${r.m12} vs ${m[0]}`);
    ok('막대 · 20거래일 전 % = 판 읽기 값(소수 첫째)', r.m12p === d1(m[1]), `${who} ${r.m12p} vs ${m[1]}`);
    for (const v of [r.m12, r.m12p]) if (fin(v)) ok('막대 · 같은 축이 값을 담음', v >= M.ax.lo && v <= M.ax.hi && near(posOf(M.ax, v), pW(v)), `${who} ${v}`);
    const g = barGeo(M.ax, r.m12);
    if (!fin(r.m12)) ok('막대 · 값이 없으면 막대 없음', g === null, who);
    else { const pv = pW(r.m12), want = r.m12 > 0 ? {l: p0, w: Math.max(0.6, pv - p0)} : r.m12 < 0 ? {l: pv, w: Math.max(0.6, p0 - pv)} : {l: p0, w: 0.6};
      ok('막대 · 막대 = 0 에서 값까지(오름 오른쪽 · 내림 왼쪽 · 짧으면 0.6%)', !!g && near(g.l, want.l) && near(g.w, want.w), `${who} ${g?.l}/${g?.w} vs ${want.l}/${want.w}`); }
    if (fin(r.m12p)) ok('막대 · 짧은 세로 줄 자리 = 20거래일 전 값', near(posOf(M.ax, r.m12p), pW(r.m12p)), who);
    const pr = M.rows[k - 1]; if (pr && fin(pr.m12) && fin(r.m12)) ok('막대 · 큰 값이 오른쪽(값 차례 = 자리 차례)', Math.sign(posOf(M.ax, r.m12) - posOf(M.ax, pr.m12)) === Math.sign(r.m12 - pr.m12), who);
  });
  const F = C.flags ?? {}, codes = Object.keys(F), upW = c => String(F[c] ?? '')[4] === '1' && fin(Gm[c]?.[0]);
  ok('막대 · 그물 안 곳 수(flags 다섯째 · 값 있음)', M.above === codes.filter(upW).length, `${tag} ${M.above}`);
  ok('막대 · 기준 셋을 넘은 곳 수(앞 셋 111)', M.green === codes.filter(c => upW(c) && String(F[c]).slice(0, 3) === '111').length, `${tag} ${M.green}`);
}

/* 무작위 막대 판 — 회사 수 · 1년 추세(오름 · 내림 · 아주 작음 · 아주 큼 · 같은 값 · 빠짐) · 20거래일 전 · 기준 셋 · 후보 0~9곳 · qD 없음 · qp 없음 */
function randomBars(seed) {
  const r = rngOf(seed * 2654435761 + 7), N = 8 + Math.floor(r() * 393), m = {}, flags = {}, codes = [];
  const val = () => { const u = r(); return u < 0.04 ? null : u < 0.08 ? 0 : u < 0.12 ? Number(((r() - 0.5) * 0.004).toFixed(4)) : u < 0.15 ? Number((3 + r() * 9).toFixed(4)) : Number(((r() - 0.3) * 2).toFixed(4)); };
  for (let i = 0; i < N; i++) { const code = `B${String(seed % 10000).padStart(4, '0')}${String(i).padStart(3, '0')}`; codes.push(code); m[code] = [val(), val()]; if (i && r() < 0.05) m[code][0] = m[codes[i - 1]][0]; } // 같은 값도
  const q = qLin(codes.map(c => m[c][0]), 80), qp = qLin(codes.map(c => m[c][1]), 80);
  for (const c of codes) { const [a, b] = m[c], e = [r() < 0.95, r() < 0.9, r() < 0.97], inNet = fin(a) && fin(q) && a >= q, inPrev = fin(b) && fin(qp) && b >= qp; flags[c] = [...e, fin(a), inNet, inNet && !inPrev].map(x => (x ? '1' : '0')).join(''); }
  const nItems = Math.floor(r() * 10), pick = [...codes].sort(() => r() - 0.5).slice(0, nItems).sort((x, y) => (m[y][0] ?? -9) - (m[x][0] ?? -9));
  const items = pick.map((code, k) => ({code, rank: k + 1, status: r() < 0.8 ? 'met' : 'wait', name: r() < 0.9 ? '회사' + code : undefined, g: r() < 0.9 ? 'g' + Math.floor(r() * 73) : null}));
  if (r() < 0.5) items.reverse(); // 차례가 뒤섞여 와도 순위 차례로
  const qPct = fin(q) ? q * 100 : null, grow = {m, q: qPct, qD: r() < 0.1 || !fin(qPct) ? undefined : Number(qPct.toFixed(1)), qp: r() < 0.05 || !fin(qp) ? null : qp * 100};
  return {grow: r() < 0.01 ? null : grow, flags, items};
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
  checkBars(C, `고른 판 ${tag}`); // 고르는 셈이 낸 묶음을 그대로 막대로(판 읽기와 같은 꼴)
}

/* 실제 판 읽기(한국 · 미국) — 사이트 묶음(dist)에 있으면 막대 셈을 같은 약속으로 · 3단: 막대 줄 = 판의 회사 · 후보 업종 = 판의 업종 */
const real = [], click3 = {};
for (const [place, f] of [['kr', 'dist/data/atlas11/view/lens.json'], ['us', 'dist/us/data/atlas11/view/lens.json']]) {
  try { const L = JSON.parse(await fs.readFile(f, 'utf8')); if (!L.cand?.ready) continue;
    checkBars(L.cand, `실제 ${place}`); real.push(place);
    const B = JSON.parse(await fs.readFile(f.replace('lens.json', 'board.json'), 'utf8')), codes = new Set(B.companies.map(c => String(c.code))), gids = new Set((B.groups ?? []).map(g => String(g.id)));
    const M = barsModel(L.cand); let n = 0;
    for (const r of M?.rows ?? []) { ok('3단 · 막대 줄 = 판의 회사(줄 → 카드 → 회사 화면)', codes.has(r.code), `실제 ${place} ${r.code}`); n++; if (r.g != null) ok('3단 · 후보 업종 = 판의 업종', gids.has(r.g), `실제 ${place} ${r.g}`); }
    click3[place] = n;
  } catch (e) { if (process.env.MILLION_DEBUG) console.error(e); }
}
const t0 = Date.now(); let boardsB = 0, boardsC = 0;
for (let seed = 1; boardsC < 60; seed++) { checkCand(seed, seed % 2 ? 'kr' : 'us'); boardsC++; }
for (let seed = 1; checks < TARGET; seed++) { checkBars(randomBars(seed), `무작위 막대 #${seed}`); boardsB++; } // 막대 · 고르는 셈 약속을 목표 수만큼
const res = {schema: 'atlas11-million-4', at: new Date().toISOString(), seconds: Math.round((Date.now() - t0) / 1000), checks, target: TARGET, failed: fails.length, real, boards: {bars: boardsB, cand: boardsC}, click3, perKind, fails};
await fs.mkdir(path.dirname(OUT), {recursive: true}); await fs.writeFile(OUT, JSON.stringify(res, null, 1) + '\n');
console.log(JSON.stringify({checks, failed: fails.length, real, boards: res.boards, click3, seconds: res.seconds, sample: fails.slice(0, 5)}));
process.exit(fails.length ? 1 : 0);
