#!/usr/bin/env node
// 반값 셈 h36-a — 명령문 [4] 2 ⑦ 영상 「날아오른 36곳 가운데 n곳은 1년 안에 반값 아래로 떨어진 적 있어요」 · [6] 8 카톡 급등 카드의 n
//   (사장님 2026-10-18 16:39 명령문 · 17:01 「가장 논리적인 것을 선탹해」 → (가) · 리드 덧붙임 spread · 일꾼 KG)
//   셈은 결정표 docs/design/kkolttori-2026-10-18/half36.md 그대로다 — 셈을 바꾸려면 표를 먼저 고치고 rule 이름을 새로 단다.
//   읽음: <site>/atlas/data/{days,mkt,surge}.json · co/<번호>.json(종가 줄) — 사이트 자료는 읽기만
//   씀:   <site>/next/data/half36.json — 따로 세기(verify/half36_verify.py · 일꾼 KG2 · 결정표만 보고 씀) 끝 코드 0 일 때만
//   쓰는 법: node scripts/atlas11/next/half36.mjs [--site site|dist] [--out 파일] [--no-verify]
//            import {build} from './half36.mjs'; build({siteDir}) → {code, line, file, n, of, …}   (올릴 때 build_data.mjs 가 dist 로 부르면 됨)
//   끝 코드: 0 = 씀 · 1 = 자료 문제로 멈춤 또는 따로 세기 틀림(파일 그대로) · 2 = 따로 세기 파일이 없음(--no-verify 면 씀 · check = null)
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {spawnSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';

export const SCHEMA = 'kkolttori-half36-1';
export const RULE = 'h36-a';
export const ALT_RULE = 'h36-b';
export const WIN = 250;   // 1년 = 250거래일(days.json 의 날)
export const PICK = 36;   // 고르는 곳 수
export const RISE = 5;    // 5거래일 오름
export const JUMP = 35;   // 하루 35% 넘게 바뀐 날 = 크게 바뀜(사이트 급등 칸 sv-v1 과 같은 잣대)
export const ALT_MIN = 60; // alt: 값 60개 밑이면 모름
export const VERIFY = path.join(path.dirname(fileURLToPath(import.meta.url)), 'verify', 'half36_verify.py');

class Stop extends Error {}
const stop = m => { throw new Stop(m); };
/** 쓸 수 있는 값 = JSON 수 · 유한 · 0 보다 큼(결정표 §2) — 자료 배열은 쓸 수 있는 값 아니면 NaN 으로 둠 */
const okv = x => typeof x === 'number' && Number.isFinite(x) && x > 0;
const jump = (p, x) => Math.abs(x - p) * 100 > p * JUMP; // 곱셈 꼴(§2)
const below = (x, b) => 2 * x < b;                        // 꼭 절반은 아래가 아님(§2)
const iso = d => d.toISOString().replace(/\.\d+Z$/, 'Z');
function readJ(f, what) {
  let s; try { s = fs.readFileSync(f, 'utf8'); } catch { stop(`${what}을 못 읽음: ${f}`); }
  try { return JSON.parse(s); } catch { stop(`${what} JSON 이 깨짐: ${f}`); }
}
/** co 파일 → 날 번호 t 의 값(빈 값 = NaN) · 꼴이 틀리면 null */
function coArr(j, N) {
  const k0 = j?.k0, cl = j?.close;
  if (!Number.isInteger(k0) || k0 < 0 || !Array.isArray(cl) || k0 + cl.length !== N) return null;
  const a = new Float64Array(N).fill(NaN);
  for (let i = 0; i < cl.length; i++) if (okv(cl[i])) a[k0 + i] = cl[i];
  return {a, k0};
}

function load(siteDir) {
  const dd = path.join(siteDir, 'atlas', 'data');
  const dates = readJ(path.join(dd, 'days.json'), 'days.json')?.dates;
  if (!Array.isArray(dates) || !dates.every(d => typeof d === 'string')) stop('days.json 의 dates 가 글 배열이 아님');
  for (let t = 1; t < dates.length; t++) if (!(dates[t - 1] < dates[t])) stop(`days.json 날이 오름차순이 아님: ${dates[t - 1]} 다음 ${dates[t]}`);
  const N = dates.length;
  if (N < WIN + RISE + 1) stop(`days.json 날이 ${N}개 — ${WIN + RISE + 1}개가 안 됨`);
  const L = dates[N - 1];
  const M = readJ(path.join(dd, 'mkt.json'), 'mkt.json'), co = M?.companies;
  if (!co || typeof co !== 'object' || Array.isArray(co) || !Object.keys(co).length) stop('mkt.json 의 companies 가 비었음');
  if (M.asOf !== L) stop(`mkt.json asOf(${M.asOf})가 마지막 날(${L})과 다름`);
  const codes = Object.keys(co).sort(), V = new Map();
  for (const c of codes) {
    const A = coArr(readJ(path.join(dd, 'co', c + '.json'), `회사 파일 ${c}`), N);
    if (!A) stop(`회사 파일 ${c} 꼴이 틀림(k0 · close 길이 + k0 = 날 수 ${N})`);
    V.set(c, A);
  }
  return {dd, dates, N, L, co, codes, V};
}

/** §5 날 i 의 고르기 — 들 수 있는 곳 수 · 차례 앞 PICK 곳 [{c, q}] (q 큰 것 먼저 · 같으면 번호 글자 차례) */
function pick(S, i) {
  const top = []; let eligible = 0;
  for (const c of S.codes) {
    const a = S.V.get(c).a, w0 = a[i - RISE];
    if (!(w0 > 0)) continue;
    let good = true;
    for (let t = i - RISE + 1; t <= i; t++) { const x = a[t]; if (!(x > 0) || jump(a[t - 1], x)) { good = false; break; } }
    if (!good) continue;
    eligible++;
    const q = a[i] / w0;
    if (top.length === PICK) { const w = top[PICK - 1]; if (q < w.q || (q === w.q && c > w.c)) continue; }
    let k = top.length; top.push(null);
    while (k > 0 && (top[k - 1].q < q || (top[k - 1].q === q && top[k - 1].c > c))) { top[k] = top[k - 1]; k--; }
    top[k] = {c, q};
    if (top.length > PICK) top.pop();
  }
  return {eligible, top};
}

/** §6 그 뒤(날 i+1 … E) — 예(true) · 아니오(false) · 모름(null) */
function after(a, i, E, dates) {
  const b = a[i]; let prev = b, gap = false;
  for (let t = i + 1; t <= E; t++) {
    const x = a[t];
    if (!(x > 0)) { gap = true; continue; }
    if (jump(prev, x)) return {half: null, halfDay: null, why: 'jump', jumpDay: dates[t]};
    if (below(x, b)) return {half: true, halfDay: dates[t], why: null, jumpDay: null};
    prev = x;
  }
  return gap ? {half: null, halfDay: null, why: 'gap', jumpDay: null} : {half: false, halfDay: null, why: null, jumpDay: null};
}
/** §6 표시용 — 가장 작은 값과 처음 나온 날 */
function lowOf(a, i, E, dates) {
  let m = Infinity, d = null;
  for (let t = i + 1; t <= E; t++) { const x = a[t]; if (x > 0 && x < m) { m = x; d = dates[t]; } }
  return m === Infinity ? {min: null, minDay: null} : {min: m, minDay: d};
}

/** §9 alt — 지난 250거래일 안 앞 꼭대기의 반 아래(크게 바뀐 날 앞뒤는 견주지 않음) */
function peakHalf({a, k0}, N) {
  let peak = null, prev = null, cnt = 0, gap = false, cut = false;
  for (let t = Math.max(0, N - WIN); t < N; t++) {
    if (t < k0) continue;
    const x = a[t];
    if (!(x > 0)) { gap = true; continue; }
    if (prev !== null && jump(prev, x)) { cut = true; peak = null; }
    if (peak !== null && below(x, peak)) return true;
    peak = peak === null ? x : Math.max(peak, x); prev = x; cnt++;
  }
  return cut || gap || cnt < ALT_MIN ? null : false;
}
function altOf(S) {
  let G; try { G = JSON.parse(fs.readFileSync(path.join(S.dd, 'surge.json'), 'utf8')); } catch { return null; }
  if (!Array.isArray(G?.members)) return null;
  const mem = G.members.map(m => m?.c).filter(c => typeof c === 'string');
  let n = 0, unknown = 0;
  for (const c of mem) {
    let A = S.V.get(c);
    if (!A) { let j = null; try { j = JSON.parse(fs.readFileSync(path.join(S.dd, 'co', c + '.json'), 'utf8')); } catch { /* 모름 */ } A = j ? coArr(j, S.N) : null; }
    const h = A ? peakHalf(A, S.N) : null;
    if (h === true) n++; else if (h === null) unknown++;
  }
  return {rule: ALT_RULE, n, of: mem.length, unknown, asOf: G.asOf ?? null, kst: G.kst ?? null};
}

const kday = d => `${d.slice(0, 4)}년 ${+d.slice(5, 7)}월 ${+d.slice(8, 10)}일`;
/** 쉬운 말 한 문단(영어 틀은 en-src.json — 틀이 바뀌면 add.mjs 로 다시 더함) */
export function noteOf(R) {
  const s = [`${kday(R.from)}부터 ${kday(R.day)}까지 5일 동안 가장 많이 오른 ${R.of}곳을 모았어요.`,
    `그 뒤 ${kday(R.until)}까지 1년 동안 종가가 그날 종가의 반보다 낮았던 날이 하루라도 있는 곳을 셌어요.`,
    '지금 시장에 남아 있는 회사만 셌어요. 그사이 시장에서 빠진 회사는 자료에 없어서 실제보다 적게 셌을 수 있어요.'];
  if (R.unknown) s.push(`? ${R.unknown}곳은 값이 빈 날이나 하루에 ${JUMP}% 넘게 바뀐 날이 있어 못 셌어요.`);
  return s.join(' ');
}

/** 결정표대로 셈 — 파일은 쓰지 않음 · 자료 문제면 Stop */
export function compute({siteDir = 'site'} = {}) {
  const S = load(siteDir), {dates, N} = S;
  const i0 = N - 1 - WIN, E = N - 1;
  const P = pick(S, i0);
  if (P.top.length < PICK) stop(`그날(${dates[i0]}) 들 수 있는 곳이 ${P.eligible}곳 — ${PICK}곳이 안 됨`);
  const list = P.top.map(({c, q}) => {
    const a = S.V.get(c).a, r = after(a, i0, E, dates), lo = lowOf(a, i0, E, dates), nm = S.co[c]?.n;
    return {code: c, name: typeof nm === 'string' ? nm : c, rise5: Math.round((q - 1) * 100 * 100) / 100, close: a[i0], min: lo.min, minDay: lo.minDay,
      half: r.half, halfDay: r.halfDay, why: r.why, jumpDay: r.jumpDay};
  });
  const n = list.filter(x => x.half === true).length, unknown = list.filter(x => x.half === null).length;
  // §8 spread — 그 뒤 250날이 모두 자료 안에 있는 모든 그날
  const ns = []; let fromI = null, toI = null, unknownDays = 0;
  for (let i = RISE; i <= N - 1 - WIN; i++) {
    const {top} = pick(S, i);
    if (top.length < PICK) continue;
    let k = 0, u = 0;
    for (const {c} of top) { const h = after(S.V.get(c).a, i, i + WIN, dates).half; if (h === true) k++; else if (h === null) u++; }
    ns.push(k); if (fromI === null) fromI = i; toI = i; if (u) unknownDays++;
  }
  let spread = null;
  if (ns.length) {
    const s = [...ns].sort((x, y) => x - y), m = s.length, mid = m % 2 ? s[(m - 1) / 2] : (s[m / 2 - 1] + s[m / 2]) / 2;
    spread = {days: m, from: dates[fromI], to: dates[toI], min: s[0], median: mid, max: s[m - 1], mean: Math.round(ns.reduce((x, y) => x + y, 0) / m * 10) / 10,
      lower: ns.filter(x => x < n).length, higher: ns.filter(x => x > n).length, unknownDays};
  }
  const R = {schema: SCHEMA, rule: RULE, n, of: list.length, unknown, day: dates[i0], from: dates[i0 - RISE], until: dates[E], asOf: S.L, window: WIN,
    eligible: P.eligible, universe: S.codes.length, made: iso(new Date()), list, alt: altOf(S), spread, note: '', check: null};
  R.note = noteOf(R);
  return R;
}

function writeAtomic(file, obj) {
  fs.mkdirSync(path.dirname(file), {recursive: true});
  const tmp = `${file}.tmp${process.pid}`;
  fs.writeFileSync(tmp, JSON.stringify(obj) + '\n');
  fs.renameSync(tmp, file);
}

/** 셈 → 따로 세기 → 틀림 0 이면 씀(결정표 §11) — process.exit 하지 않고 {code, …} 를 돌려줌 · verifier 는 시험용(기본 = KG2 의 파일) */
export function build({siteDir = 'site', out = null, verify = true, verifier = VERIFY} = {}) {
  const t0 = Date.now(), file = out ?? path.join(siteDir, 'next', 'data', 'half36.json');
  let R;
  try { R = compute({siteDir}); } catch (e) { if (e instanceof Stop) return {code: 1, why: e.message, line: '반값 셈 멈춤 — ' + e.message}; throw e; }
  const sum = `반값 셈 ${R.rule} · 그날 ${R.day} · ${R.of}곳 중 ${R.n}곳(모름 ${R.unknown}) · 그 뒤 ${R.until}까지` +
    (R.spread ? ` · spread ${R.spread.days}날 가운데 ${R.spread.median}(${R.spread.min} ~ ${R.spread.max} · 평균 ${R.spread.mean})` : ' · spread 없음') +
    (R.alt ? ` · alt ${R.alt.n}/${R.alt.of}(모름 ${R.alt.unknown})` : ' · alt 없음');
  if (verify) {
    if (!fs.existsSync(verifier)) return {code: 2, why: '따로 세기 파일이 없음 ' + path.relative(process.cwd(), verifier), line: sum + ' · 안 씀(따로 세기 없음 — --no-verify 면 씀)', R};
    const tmp = path.join(os.tmpdir(), `half36-cand-${process.pid}-${t0}.json`);
    fs.writeFileSync(tmp, JSON.stringify(R) + '\n');
    let p;
    try { p = spawnSync('python3', [verifier, '--site', path.resolve(siteDir), '--json', tmp], {stdio: 'inherit'}); } finally { fs.rmSync(tmp, {force: true}); }
    if (p.status !== 0) return {code: 1, why: `따로 세기 끝 코드 ${p.status ?? p.error?.message}`, line: sum + ` · 안 씀(따로 세기 끝 코드 ${p.status ?? '?'})`, R};
    R.check = {by: 'half36_verify.py', ok: true, at: iso(new Date())};
  }
  writeAtomic(file, R);
  const ms = Date.now() - t0;
  return {code: 0, file, n: R.n, of: R.of, unknown: R.unknown, day: R.day, until: R.until, spread: R.spread, alt: R.alt, ms,
    line: sum + ` · ${(ms / 1000).toFixed(1)}초 · 씀 ${path.relative(process.cwd(), file) || file}` + (R.check ? ' · 따로 세기 틀림 0' : ' · 따로 세기 안 함(check = null)'), R};
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const a = process.argv.slice(2), arg = k => { const i = a.indexOf(k); return i >= 0 ? a[i + 1] : null; };
  const r = build({siteDir: arg('--site') ?? 'site', out: arg('--out'), verify: !a.includes('--no-verify')});
  (r.code ? console.error : console.log)(r.line);
  process.exit(r.code);
}
