#!/usr/bin/env node
// 첫 화면 요약 파일(사장님 2026-10-18 [9] 7 「첫 화면을 가볍게 하라. 첫 화면용 작은 요약 파일(몇 KB)을 만들고, mkt.json, cond.json은 그 칩이나 화면을 열 때만 받아라.」
//   · [6] 6 「급등 칩 카드마다 「36곳 중 n곳이 1년 안에 반값 아래로 떨어진 적 있어요」 … n은 자료에서 셈하라.」)
//   읽음: <site>/atlas/data/{home,core,mkt,surge,cond}.json · 급등 칸 회사마다 <site>/atlas/data/co/<번호>.json(종가 줄)
//   씀:   <site>/next/data/home-summary.json(8KB 아래) — 사이트 자료를 바꾸지 않음 · 못 읽은 칸은 null
//   쓰는 법: node scripts/atlas11/next/build/home_summary.mjs [--site site] [--verify]   (--verify = 반값 셈을 다른 방법으로 한 번 더 · 다르면 끝 코드 1)
//            import {build} from './home_summary.mjs'; build({siteDir}) → {file, bytes, half, n}
//
// 꼴(schema godori-home-summary-1 · S2 첫 화면이 읽음 · docs/design/godori-2026-10-18/accept/S2c.md 와 같음):
// { schema, made: ISO(UTC),
//   src: {home: home.kst, mkt: mkt.asOf, core: core.made, surge: surge.kst, cond: cond.asOf},  // 새것 맞대기 — 화면은 src.home 과 /atlas/data/home.json 의 kst 를 견줌(다르면 옛 길)
//   asOf: 마지막 종가 날(mkt.asOf),
//   band: {live, kst, stale, KOSPI: {name, date, day, close} | null, KOSDAQ: {…} | null},     // [6] 1 한 줄 띠 · day = 하루 %
//   alert: [{name, v, why: 'big'|'usual'}],                                                      // 큰 날 「!」 = home.alerts 의 kind 'idx'
//   day: {date, n, up, dn, fl, eq, cw, big: {n, up, dn, fl, eq}, small: {…}} | null,            // 모든 회사 마지막 날 하루 · eq = 평균 % · cw = 큰 회사 기준 %(회사 크기 무게) · big = 회사 크기 위 100곳
//   rise: {from, to, n, top: {name, chg, v}, list: [그 꼴 넷까지]} | null, groups: {n, base, top: {id, name, short, chg, n, v}, low: {…}} | null,
//   time: {id, open: 3년 뒤 엶 날} | null,                                                       // 「더 보기」 봉인 줄(core.time)
//   pick: {date, n, up, dn} | null, us: {date, top: {name, chg}} | null,
//   lines: [한국어 세 줄],                                                                        // 오늘 시장 세 줄 요약(영어 틀은 en-src 에 있음)
//   chips: {rise: {n}, surge: {n, asOf, half, known, days: 250, flags: {번호: 0|1}, miss: [모든 회사 파일에 없는 번호]}, lead: {n}, pick: {n}, group: {n}, ind: {n}, us: {n}} }
//   반값 셈 = 회사 종가 줄의 마지막 250거래일 안에서 어느 날 종가가 그보다 앞선 날 종가의 절반 이하(가장 깊이 빠짐 50% 이상) · 값이 60개 못 되면 모름(known 에서 뺌)
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

export const SCHEMA = 'godori-home-summary-1';
export const DAYS = 250;
const BIG = 100;
const r2 = x => (Number.isFinite(x) ? Math.round(x * 100) / 100 : null);
const readJ = f => { try { return JSON.parse(fs.readFileSync(f, 'utf8')); } catch { return null; } };
const dayOf = v => (Array.isArray(v) && v.length > 1 && v[v.length - 2] > 0 && v[v.length - 1] > 0 ? (v[v.length - 1] / v[v.length - 2] - 1) * 100 : null);
const mdK = d => (typeof d === 'string' && /^\d{4}-\d{2}-\d{2}/.test(d) ? `${+d.slice(5, 7)}월 ${+d.slice(8, 10)}일` : '?');
const pctK = x => { if (!Number.isFinite(x)) return '?'; const v = Math.sign(x) * Math.floor(Math.abs(x) * 10 + 0.5 + 1e-7) / 10; return (v > 0 ? '+' : v < 0 ? '−' : '') + Math.abs(v).toFixed(1) + '%'; };
const numK = n => Number(n).toLocaleString('ko-KR');

/** 가장 깊이 빠짐(마지막 250거래일) — 첫 셈: 앞 꼭대기를 따라가며 */
export function maxDrop(close, days = DAYS) {
  const v = (Array.isArray(close) ? close : []).filter(x => Number.isFinite(x) && x > 0).slice(-days);
  if (v.length < 60) return null;
  let pk = 0, mm = 0;
  for (const x of v) { if (x > pk) pk = x; mm = Math.min(mm, x / pk - 1); }
  return mm;
}
/** 따로 셈 — 짝을 모두 봄(앞선 날 i · 뒤 날 j · j 종가 ≤ i 종가의 절반) */
function halfPairs(close, days = DAYS) {
  const v = (Array.isArray(close) ? close : []).filter(x => Number.isFinite(x) && x > 0).slice(-days);
  if (v.length < 60) return null;
  for (let i = 0; i < v.length; i++) for (let j = i + 1; j < v.length; j++) if (v[j] * 2 <= v[i]) return true;
  return false;
}

export function build({siteDir = 'site', verify = false} = {}) {
  const dd = path.join(siteDir, 'atlas', 'data');
  const H = readJ(path.join(dd, 'home.json')), C = readJ(path.join(dd, 'core.json')), M = readJ(path.join(dd, 'mkt.json'));
  const S = readJ(path.join(dd, 'surge.json')), K = readJ(path.join(dd, 'cond.json'));
  const co = M?.companies || {};
  const out = {schema: SCHEMA, made: new Date().toISOString().replace(/\.\d+Z$/, 'Z'),
    src: {home: H?.kst ?? null, mkt: M?.asOf ?? null, core: C?.made ?? null, surge: S?.kst ?? null, cond: K?.asOf ?? null},
    asOf: M?.asOf ?? C?.asOf ?? null};
  // [6] 1 한 줄 띠 · 큰 날 「!」
  const ixo = k => { const x = H?.idx?.[k], rows = Array.isArray(x?.rows) ? x.rows : []; const last = rows[rows.length - 1];
    return x ? {name: x.name ?? null, date: x.date ?? last?.[0] ?? null, day: r2(x.day), close: Array.isArray(last) && last[1] > 0 ? last[1] : null} : null; };
  out.band = H ? {live: !!H.live, kst: H.kst ?? null, stale: H.stale?.idx ?? null, KOSPI: ixo('KOSPI'), KOSDAQ: ixo('KOSDAQ')} : null;
  out.alert = (H?.alerts ?? []).filter(a => a?.kind === 'idx').map(a => ({name: a.name ?? null, v: r2(a.v), why: a.why ?? 'usual'}));
  // 모든 회사 마지막 날 하루(평균 · 큰 회사 기준 · 회사 크기 위 100곳과 나머지)
  const cap = new Map();
  if (K?.co?.c && K.asOf === M?.asOf) K.co.c.forEach((c, k) => { const v = K.co.cap?.[k]; if (Number.isFinite(v) && v > 0) cap.set(c, v); });
  const rows = Object.entries(co).map(([c, o]) => [c, dayOf(o?.l)]).filter(([, x]) => x != null);
  const tally = xs => { let up = 0, dn = 0, fl = 0, s = 0; for (const [, x] of xs) { const v = Math.round(x * 10) / 10; if (v > 0) up++; else if (v < 0) dn++; else fl++; s += x; } return {n: xs.length, up, dn, fl, eq: xs.length ? r2(s / xs.length) : null}; };
  if (rows.length) {
    const t = tally(rows); let cw = null, big = null, small = null;
    if (cap.size) {
      const wr = rows.filter(([c]) => cap.has(c)), W = wr.reduce((a, [c]) => a + cap.get(c), 0);
      cw = W > 0 ? r2(wr.reduce((a, [c, x]) => a + cap.get(c) * x, 0) / W) : null;
      const byCap = [...wr].sort((a, b) => cap.get(b[0]) - cap.get(a[0]) || a[0].localeCompare(b[0]));
      big = tally(byCap.slice(0, BIG)); small = tally(byCap.slice(BIG));
    }
    out.day = {date: M?.asOf ?? null, ...t, cw, big, small};
  } else out.day = null;
  // 1주 오른 업종 · 큰 업종 한 달 · 고른 곳 · 미국
  const rl = C?.rise?.list || [], rx = r => ({name: r.name, chg: r2(r.chg), v: r.v ?? null});
  out.rise = C?.rise ? {from: C.rise.from ?? null, to: C.rise.to ?? null, n: rl.length, top: rl[0] ? rx(rl[0]) : null, list: rl.slice(0, 4).map(rx)} : null; // list = 「더 보기」 카드 넷(S2x · core 를 안 받게)
  const T = C?.time; out.time = T?.opens?.[0]?.date ? {id: T.id ?? null, open: T.opens[0].date} : null; // 봉인 줄(「더 보기」 · 3년 뒤 엶 날)
  const gs = (C?.groups || []).filter(g => Number.isFinite(g.chg)).sort((a, b) => b.chg - a.chg);
  const gx = g => (g ? {id: g.id ?? null, name: g.name ?? null, short: g.short ?? null, chg: r2(g.chg), cwChg: r2(g.cwChg), n: g.n ?? null, v: g.v ?? null} : null);
  out.groups = gs.length ? {n: gs.length, base: C?.base ?? null, top: gx(gs[0]), low: gs.length > 1 ? gx(gs[gs.length - 1]) : null} : null;
  const s3 = H?.s365;
  out.pick = s3 ? {date: s3.date ?? null, n: s3.n ?? null, up: s3.up ?? null, dn: s3.down ?? null} : null;
  const us0 = H?.us?.rows?.[0];
  out.us = us0 && Number.isFinite(us0.chg) ? {date: H.us.date ?? null, top: {name: us0.name, chg: r2(us0.chg)}} : null;
  // 오늘 시장 세 줄(영어 틀: en-src 에 더함)
  const L = [];
  if (out.day) { const up = out.day.up >= out.day.dn; L.push(`${mdK(out.day.date)} 모든 회사 ${numK(out.day.n)}곳 가운데 ${numK(up ? out.day.up : out.day.dn)}곳이 ${up ? '올랐어요' : '내렸어요'}.`); }
  if (out.day?.big && out.day?.small) L.push(`작은 회사는 평균 ${pctK(out.day.small.eq)}, 큰 회사 ${BIG}곳은 평균 ${pctK(out.day.big.eq)}였어요.`);
  if (out.rise?.top) L.push(`1주 동안 가장 많이 오른 업종은 ${out.rise.top.name} ${pctK(out.rise.top.chg)}예요.`);
  out.lines = L;
  // 칩 — 칩마다 몇 곳 · 급등 칸 반값 셈(회사 파일을 칩이 받지 않게)
  const mem = Array.isArray(S?.members) ? S.members.filter(m => m && typeof m.c === 'string') : [];
  const flags = {}; let half = 0, known = 0, diff = 0;
  for (const m of mem) {
    const j = readJ(path.join(dd, 'co', m.c + '.json')), dpx = maxDrop(j?.close);
    if (dpx == null) continue;
    known++; const f = dpx <= -0.5 ? 1 : 0; flags[m.c] = f; half += f;
    if (verify) { const g = halfPairs(j?.close); if ((g ? 1 : 0) !== f) { diff++; console.error('반값 셈 다름', m.c, dpx, g); } }
  }
  const leadN = K?.co?.c && K.asOf === M?.asOf ? K.co.c.filter((c, k) => K.co.rk?.[k] === 1 && co[c] && Array.isArray(K.co.l5?.[k]) && Number.isFinite(K.co.r5?.[k])).length : null;
  const miss = mem.filter(m => !co[m.c]).map(m => m.c); // 모든 회사 파일에 없는 급등 칸 회사(칩이 mkt 를 안 받고 거름)
  out.chips = {rise: {n: rl.length}, surge: S ? {n: mem.length, asOf: S.asOf ?? null, half, known, days: DAYS, flags, miss} : null, lead: {n: leadN},
    pick: {n: Array.isArray(s3?.list) ? s3.list.filter(([c]) => co[c]).length : null}, group: {n: gs.length}, ind: {n: (C?.industries || []).length}, us: {n: (H?.us?.rows || []).length}};
  const file = path.join(siteDir, 'next', 'data', 'home-summary.json');
  fs.mkdirSync(path.dirname(file), {recursive: true});
  const body = JSON.stringify(out);
  fs.writeFileSync(file, body + '\n');
  return {file, bytes: Buffer.byteLength(body) + 1, half, known, n: mem.length, diff};
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const a = process.argv.slice(2), si = a.indexOf('--site');
  const r = build({siteDir: si >= 0 ? a[si + 1] : 'site', verify: a.includes('--verify')});
  console.log(`첫 화면 요약 ${r.file} · ${r.bytes}바이트 · 급등 칸 ${r.n}곳 중 반값 아래 ${r.half}곳(값 있는 ${r.known}곳)` + (a.includes('--verify') ? ` · 따로 셈 다름 ${r.diff}` : ''));
  if (r.diff || r.bytes > 8192) process.exit(1);
}
