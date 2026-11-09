#!/usr/bin/env node
/**
 * 수르 42칸 「며칠째 · 첫 발견」의 지난 날 — 남아 있는 판(board.json)마다 같은 고르는 규칙(su21.py 그대로)으로 여섯 목록을 다시 셈
 *   주문 0123 덧붙임(사장님 2026-11-09 01:44 「그리고 몇일째 그 항목에 있는지도 표기가 되어야 하고 첫포착은 첫 발견이라고 기록 되어야 해 퐁 42곳 모두에 말이야」)
 *   · 01:47 이해 보고 「지난 날은 같은 고르는 규칙으로 하루씩 다시 세어 찾고, 오늘부터는 날마다 기록을 남겨요」
 *   판 = reports/atlas11/su21/boards/<날>.json.gz(저장소 기록 public/data/atlas11/view/board.json 을 날마다 마지막 것으로 옮겨 둔 것 · 셈에 쓰는 칸만) + 오늘 판(--board)
 *   업종 · 회사 자리(theme.json · theme-co.json) · 몸값(cond.json) · 21 마지막 값 선(mkt.json l)은 그날까지의 종가(atlas/data/co · days.json)로 다시 셈
 *     — 셈은 테마 엔진 그대로(site/next/theme-engine.js indexOf · exOf · coZoneOf) · 자료 마지막 날보다 뒤의 판은 자료 마지막 날 값(사이트가 하는 그대로)
 *   맞댐 1: 자료 마지막 날로 다시 센 업종 x · 회사 자리 · 21 값 선이 그 사이트 파일과 같아야 함
 *   맞댐 2: 오늘 판으로 다시 센 여섯 목록이 방금 센 수르 판(--su 의 su21.json)과 같아야 함 — 둘 가운데 하나라도 다르면 쓰지 않고 끝 코드 1
 *   기록(--days)에 다시 센 날(how replay)만 새로 씀 · 올릴 때 적은 날(how kept)과 오늘은 건드리지 않음
 * 쓰는 법: node scripts/atlas11/next/su21_replay.mjs --live <사이트 자료 폴더(atlas/data · next/data)> --su <su/data 폴더> [--board public/data/atlas11/view/board.json] [--days reports/atlas11/su21/days.json] [--check] [--if-needed]
 *   package.mjs 가 올릴 때 부름 — 기록에 판 날이 모두 있으면 부르지 않음
 */
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import zlib from 'node:zlib';
import {execFileSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
import {indexOf, exOf, coZoneOf, RULE} from '../../../site/next/theme-engine.js';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../..');
const arg = (k, d = null) => (process.argv.includes(k) ? process.argv[process.argv.indexOf(k) + 1] : d);
const LIVE = path.resolve(arg('--live', path.join(ROOT, 'site')));
const OUT = path.resolve(arg('--days', path.join(ROOT, 'reports/atlas11/su21/days.json')));
const SU = path.resolve(arg('--su', path.join(ROOT, 'site/su/data')));
const BOARD_NOW = path.resolve(arg('--board', path.join(ROOT, 'public/data/atlas11/view/board.json')));
export const BOARDS_DIR = 'reports/atlas11/su21/boards';
const CHECK = process.argv.includes('--check');
const J = f => JSON.parse(fs.readFileSync(f, 'utf8'));
const r2 = v => (Number.isFinite(v) ? Math.round(v * 100) / 100 : null);
const KEYS = ['hot', 'bloom', 'money', 'hotNext', 'moneyNext', 'bloomNext'];
export const SCHEMA = 'su21-days-1';

/* ── 사이트 자료(그날까지 종가) ── */
const dd = path.join(LIVE, 'atlas', 'data');
const dates = J(path.join(dd, 'days.json')).dates, N = dates.length;
const mkt = J(path.join(dd, 'mkt.json')), companies = mkt.companies;
const cond = J(path.join(dd, 'cond.json'));
const closes = new Map();
for (const f of fs.readdirSync(path.join(dd, 'co')).filter(f => /^[0-9][0-9A-Z]{5}\.json$/.test(f)).sort()) {
  const code = f.slice(0, 6); if (!companies[code]) continue;
  let c; try { c = J(path.join(dd, 'co', f)); } catch { continue; }
  const cl = c?.close, k0 = c?.k0; if (!Array.isArray(cl) || !Number.isInteger(k0)) continue;
  const a = new Float64Array(N);
  for (let j = 0; j < cl.length; j++) { const t = j + k0, v = cl[j]; if (t >= 0 && t < N && typeof v === 'number' && v > 0) a[t] = v; }
  closes.set(code, a);
}
const codes = [...closes.keys()].filter(c => companies[c]).sort();

/** 그날(T)까지의 업종 x(테마 엔진 inds 의 x 와 같은 셈 · 업종 이름 차례) · 회사 자리([x, y, z] · theme-co.json 과 같은 셈) */
function themeAt(T) {
  const n = T + 1, cut = a => a.subarray(0, n);
  const M = indexOf(codes.map(c => cut(closes.get(c))), n);
  const mem = new Map();
  for (const c of codes) { const i = companies[c].i; if (typeof i !== 'string') continue; if (!mem.has(i)) mem.set(i, []); mem.get(i).push(c); }
  const names = [...mem.keys()].filter(k => mem.get(k).length >= RULE.minN).sort();
  const inds = names.map(k => { const I = indexOf(mem.get(k).map(c => cut(closes.get(c))), n); return {n: k, x: r2(exOf(I, M, T, RULE.win) * 100)}; });
  const co = {};
  for (const c of codes) { const v = coZoneOf(cut(closes.get(c)), M, T); if (v) co[c] = [r2(v.x), r2(v.y), v.z]; }
  return {inds, co};
}
/** 반올림 — 파이썬 round 와 같게(딱 반이면 짝수 쪽 · scripts/atlas11/t365/site_build.py 가 mkt.json l 을 이 셈으로 지음) */
const roundEven = z => { const f = Math.floor(z), d = z - f; return d > 0.5 ? f + 1 : d < 0.5 ? f : (f % 2 === 0 ? f : f + 1); };
/** 그날(T)까지의 21 마지막 값 선(mkt.json l 과 같은 꼴 — 스무 날 앞 = 10000 · 값 없는 날 null) */
function lineAt(a, T) {
  if (T - 20 < 0) return null;
  const b = a?.[T - 20]; if (!(b > 0)) return null;
  const out = []; for (let t = T - 20; t <= T; t++) out.push(a[t] > 0 ? roundEven(a[t] / b * 100 * 100) : null);
  return out;
}
/** 그날(T)의 몸값(억 원) — 자료 마지막 날 몸값 × 그날 종가 ÷ 마지막 날 종가(주식 수는 그대로) */
function capsAt(T) {
  const co = cond.co, last = N - 1;
  return co.c.map((c, k) => { const v = co.cap[k], a = closes.get(c); if (!(typeof v === 'number' && v > 0)) return v; if (T === last) return v; if (!a || !(a[T] > 0) || !(a[last] > 0)) return null; return Math.round(v * a[T] / a[last]); });
}

/* ── 맞댐 1 — 자료 마지막 날로 다시 센 것 = 그 사이트 파일 ── */
const T0 = N - 1, th0 = J(path.join(LIVE, 'next', 'data', 'theme.json')), tc0 = J(path.join(LIVE, 'next', 'data', 'theme-co.json'));
{
  const a = themeAt(T0), bad = [];
  if (th0.asOf !== dates[T0]) bad.push(`theme.json 날짜 ${th0.asOf} ≠ 자료 마지막 날 ${dates[T0]}`);
  const X = new Map(th0.inds.map(i => [i.n, i.x]));
  for (const i of a.inds) if (X.get(i.n) !== i.x) bad.push(`업종 ${i.n} x ${i.x} ≠ ${X.get(i.n)}`);
  if (a.inds.length !== th0.inds.length) bad.push(`업종 수 ${a.inds.length} ≠ ${th0.inds.length}`);
  const keys = new Set([...Object.keys(a.co), ...Object.keys(tc0.co)]);
  for (const c of keys) if (JSON.stringify(a.co[c]) !== JSON.stringify(tc0.co[c])) bad.push(`회사 ${c} ${JSON.stringify(a.co[c])} ≠ ${JSON.stringify(tc0.co[c])}`);
  let lb = 0; for (const c of codes) { const l = lineAt(closes.get(c), T0), m = companies[c].l; if (JSON.stringify(l) !== JSON.stringify(m) && !(l === null && Array.isArray(m) && m.some(x => x === null))) lb++; }
  console.log(`맞댐 1 — 자료 마지막 날 ${dates[T0]}: 업종 ${a.inds.length} · 회사 자리 ${Object.keys(a.co).length} · 다른 것 ${bad.length} · 선 다른 회사 ${lb}`);
  if (bad.length) { console.error(bad.slice(0, 12).join('\n')); process.exit(1); }
  if (lb) console.warn(`선(l)이 다른 회사 ${lb}곳 — 값 없는 날 꼴 차이(돈 셈은 21 값이 모두 있을 때만 씀)`);
}

/* ── 판 — 옮겨 둔 날마다 판 + 오늘 판 ── */
const BOARD = 'public/data/atlas11/view/board.json';
const byDay = new Map();
const bdir = path.join(ROOT, BOARDS_DIR);
for (const f of (fs.existsSync(bdir) ? fs.readdirSync(bdir) : []).filter(f => /^\d{4}-\d{2}-\d{2}\.json\.gz$/.test(f)).sort()) {
  let b; try { b = JSON.parse(zlib.gunzipSync(fs.readFileSync(path.join(bdir, f))).toString('utf8')); } catch { continue; }
  if (typeof b?.asOf === 'string' && Array.isArray(b.companies)) byDay.set(b.asOf, {b});
}
const now = J(BOARD_NOW); if (typeof now?.asOf === 'string' && Array.isArray(now.companies)) byDay.set(now.asOf, {b: now}); // 오늘 판이 옮겨 둔 같은 날 판보다 앞섬
const days = [...byDay.keys()].sort();
const RULE_NOW = (() => { try { const s = J(path.join(SU, 'su21.json')).strict; return s?.mode === 'mark' ? null : s?.rule ?? null; } catch { return null; } })(); // 고르는 규칙 이름(주문 0854 엄격 셈 · su21_strict.py RULE_ID) — 주문 1209 표시만(mark)이면 칸은 옛 셈 일곱이라 옛 규칙(null)
if (process.argv.includes('--if-needed')) { // 기록에 지난 판 날이 모두 있고 같은 규칙이면 다시 세지 않음(올릴 때마다 부름 · 규칙이 바뀌면 모두 다시 셈)
  let rec0 = null; try { rec0 = J(OUT); } catch { /* 기록 없음 — 셈 */ }
  const miss = days.filter(d => d < now.asOf && !rec0?.days?.[d]);
  if (!miss.length && (rec0?.rule ?? null) === RULE_NOW) { console.log(`지난 판 ${days.length - 1}날 기록이 모두 있음(규칙 ${RULE_NOW}) — 다시 세지 않음`); process.exit(0); }
  console.log((rec0?.rule ?? null) !== RULE_NOW ? `고르는 규칙이 바뀜(${rec0?.rule ?? '없음'} → ${RULE_NOW}) — 모든 판을 다시 셈` : `기록에 없는 지난 판 ${miss.length}날 — 다시 셈`);
}
console.log(`판 ${days.length}날 — ${days[0]} ~ ${days.at(-1)}`);

/* ── 날마다 su21.py 를 그대로 돌림(그날 판 + 그날까지 자료) ── */
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'su21-replay-'));
const link = (from, to) => { fs.mkdirSync(path.dirname(to), {recursive: true}); fs.symlinkSync(from, to); };
const put = (f, o) => { fs.mkdirSync(path.dirname(f), {recursive: true}); fs.writeFileSync(f, JSON.stringify(o)); };
const tAt = d => { let t = -1; for (let k = 0; k < N; k++) if (dates[k] <= d) t = k; return t; };
const out = {};
for (const d of days) {
  const T = tAt(d); if (T < RULE.win + 5) continue;
  const w = path.join(tmp, d), live = path.join(w, 'live'), repo = path.join(w, 'repo');
  link(path.join(dd, 'co'), path.join(live, 'atlas', 'data', 'co'));
  link(path.join(dd, 'days.json'), path.join(live, 'atlas', 'data', 'days.json')); // 엄격 셈(주문 0854) 몬테카를로 바탕 — 그날까지 하루 값(su21_strict.py 가 판 날에서 자름)
  if (T === T0) { // 자료 마지막 날 = 그 사이트 파일 그대로
    for (const f of ['mkt.json', 'cond.json']) link(path.join(dd, f), path.join(live, 'atlas', 'data', f));
    for (const f of ['theme.json', 'theme-co.json']) link(path.join(LIVE, 'next', 'data', f), path.join(live, 'next', 'data', f));
  } else {
    const th = themeAt(T);
    put(path.join(live, 'next', 'data', 'theme.json'), {asOf: dates[T], inds: th.inds});
    put(path.join(live, 'next', 'data', 'theme-co.json'), {asOf: dates[T], co: th.co});
    put(path.join(live, 'atlas', 'data', 'mkt.json'), {...mkt, asOf: dates[T], companies: Object.fromEntries(Object.entries(companies).map(([c, v]) => [c, {...v, l: lineAt(closes.get(c), T) ?? v.l?.map(() => null) ?? null}]))});
    put(path.join(live, 'atlas', 'data', 'cond.json'), {...cond, asOf: dates[T], co: {...cond.co, cap: capsAt(T)}});
  }
  put(path.join(repo, BOARD), byDay.get(d).b);
  link(path.join(ROOT, 'scripts/atlas11/t365/groups.json'), path.join(repo, 'scripts/atlas11/t365/groups.json'));
  link(path.join(ROOT, 'reports/atlas11/su-next/past.json'), path.join(repo, 'reports/atlas11/su-next/past.json'));
  if (fs.existsSync(path.join(ROOT, 'reports/atlas11/su-next/past-strict.json'))) link(path.join(ROOT, 'reports/atlas11/su-next/past-strict.json'), path.join(repo, 'reports/atlas11/su-next/past-strict.json')); // 엄격 셈 지난 1년(주문 0854)
  const o = path.join(w, 'su21.json');
  try { execFileSync('python3', [path.join(ROOT, 'scripts/atlas11/next/su21.py'), '--live', live, '--repo', repo, '--out', o], {encoding: 'utf8', maxBuffer: 1 << 26, stdio: ['ignore', 'pipe', 'pipe']}); }
  catch (e) { console.warn(`${d} — 다시 세기 멈춤: ${String(e.stderr || e.message).trim().split('\n').at(-1)}`); continue; }
  const s = J(o);
  out[d] = {how: 'replay', data: dates[T], lists: Object.fromEntries(KEYS.map(k => [k, (s.lists?.[k] ?? []).map(c => c.code)]))};
  console.log(d, '자료', dates[T], KEYS.map(k => k + ' ' + out[d].lists[k].length).join(' · '));
}
fs.rmSync(tmp, {recursive: true, force: true});

/* ── 맞댐 2 — 가장 늦은 판으로 다시 센 여섯 목록 = 저장된 수르 판 ── */
const last = now.asOf, saved = J(path.join(SU, 'su21.json'));
const same = saved.asOf?.board === last && KEYS.every(k => JSON.stringify(out[last]?.lists?.[k]) === JSON.stringify((saved.lists?.[k] ?? []).map(c => c.code)));
console.log(`맞댐 2 — ${last} 다시 센 여섯 목록 ${same ? '=' : '≠'} 방금 센 수르 판(${saved.asOf?.board} · 자료 ${saved.asOf?.data})`);
if (!same) { for (const k of KEYS) console.error(k, JSON.stringify(out[last]?.lists?.[k]), JSON.stringify((saved.lists?.[k] ?? []).map(c => c.code))); process.exit(1); }
if (CHECK) process.exit(0);

let rec; try { rec = J(OUT); } catch { rec = null; }
const sameRule = (rec?.rule ?? null) === RULE_NOW; // 규칙이 바뀌면 올릴 때 적은 날(옛 규칙)도 버리고 다시 센 것만 씀
const keep = sameRule ? Object.fromEntries(Object.entries(rec?.days ?? {}).filter(([d, v]) => v?.how === 'kept')) : {};
delete out[last]; // 오늘은 올릴 때 적음(how kept)
const merged = {...out, ...keep};
const body = {schema: SCHEMA, made: new Date().toISOString(), rule: RULE_NOW,
  how: {replay: '날마다 판(board.json · 저장소 기록)으로 같은 고르는 규칙(su21.py)을 다시 셈 · 업종 · 회사 자리 · 몸값 · 21 값 선은 그날까지 종가로(자료 마지막 날보다 뒤의 판은 자료 마지막 날 값)', kept: '올릴 때마다 그날 판으로 센 여섯 목록을 한 번 적음(먼저 적은 것을 바꾸지 않음)'},
  src: {boards: BOARDS_DIR + ' + ' + BOARD, data: 'atlas/data(days · co · mkt · cond) · next/data(theme · theme-co) — 자료 마지막 날 ' + dates[T0]},
  days: Object.fromEntries(Object.keys(merged).sort().map(d => [d, merged[d]]))};
fs.mkdirSync(path.dirname(OUT), {recursive: true});
const tmpf = OUT + '.tmp' + process.pid; fs.writeFileSync(tmpf, JSON.stringify(body, null, 1) + '\n'); fs.renameSync(tmpf, OUT);
console.log('씀 →', path.relative(ROOT, OUT), '다시 센 날 ' + Object.keys(out).length + ' · 적은 날 ' + Object.keys(keep).length);
