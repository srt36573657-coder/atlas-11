#!/usr/bin/env node
/**
 * ATLAS 11 · 몬테카를로 따로 세기 — 계획 docs/superpowers/plans/2026-10-10-atlas-phase1-engine.md Task 4a(설계 보고 ⑧ · 다른 언어 · 다른 난수 · 같은 명세)
 *   엔진(scripts/atlas11/mc/fhs_crn.py · 파이썬 넘파이)이 쓴 회차 결과를, 엔진 코드를 쓰지 않고 입력 종가에서 다시 센다
 *   ① 성질 검사(L2) — 회차 기록이 가리키는 판 결과의 모든 행: 경로 합 = 목표 · n + nonfinite = nBase + nExtra · q05 ≤ q10 ≤ median ≤ q90 ·
 *        cvar5 ≤ q05 · 0 ≤ ploss ≤ 1 · 숫자 칸이 모두 유한 · 기울기 0 · 한국 가격 제한 0.3 · 미국 null · 입력 지문 = 지금 입력 파일 바이트의 sha256
 *   ② 다시 뽑기(L1) — 판마다 후보 7곳(기준일 이하 가장 새 후보 파일 cand[].code) + 씨앗 FNV-1a(회차 ID)로 섞어 고른 13곳 = 20곳 · 회사마다 40,000경로
 *        입력 종가(양수 종가 60개 넘는 회사) → 합친 날짜 칸 → 로그수익 마지막 L칸 → 거르기(λ · 바닥 · 첫 20칸 분산이 씨앗) → 잔차 →
 *        빈 날은 같은 회사 다른 날 잔차로 채움 → 평균 빼기 → ±zclip 자름 → 흔들림 s² = w + α r² + β s²(w = (1−α−β) × 2년 분산 · 위 끝 vcap² × max(2년, 지금)) →
 *        한국 하루 로그수익 [log 0.7, log 1.3] → H일 합 → 단순 수익(expm1)
 *        고른 수 = mulberry32(FNV-1a(회차 ID) xor 회사 차례) · 날짜는 회사마다 따로 뽑음(한 회사 값의 분포는 다른 회사와 같은 날짜를 쓰는지와 무관)
 *        맞대기: ploss · q05 · cvar5 차이 ≤ 4 × √(se_판² + se_JS²) · 평균 ≤ 5 × √(…) — 계획 그대로에 두 가지를 더함(tolOf 설명 · 2026-10-10 실측):
 *          · se_판 = max(판이 적은 se, 같은 모형이면 판 경로 수에서 나올 se) · JS 표준오차 = 40묶음 묶음 평균법(계획은 10묶음 · 평균만 sd/√n)
 *          · 빈 날이 있는 회사만 √ 안에 2 × se_채움² (채움은 명세 안의 무작위 단계 — 엔진과 JS 가 서로 다른 채움 하나씩 · simOf 설명)
 *        + 난수가 없는 값(지금 흔들림 · 2년 흔들림 · 연 환산 √252)은 거의 똑같아야
 *   ③ 쓰기 — <회차 기록 폴더>/<runId>.verify.json 의 mc 칸만 바꿔 씀(elim 칸 등 다른 칸은 그대로)
 *   쓰는 법(저장소 맨 위에서): node scripts/atlas11/verify/mc_verify.mjs --run reports/atlas11/rounds/<runId>.json [--root 뿌리] [--out 파일] [--paths 40000]
 *     --root = 회차 기록에 적힌 판 결과 파일(public/data/atlas11/mc/…)의 뿌리 — 없으면 --run 경로의 reports/atlas11/rounds 앞 · 그것도 아니면 지금 폴더
 *     입력 종가 · 후보 파일은 지금 폴더(저장소 맨 위)에서 읽는다
 *   끝값: 모든 검사 통과 0 · 실패나 오류가 있으면 1 · 쓰는 법이 틀리면 2 · 마지막 줄 = 요약 JSON
 */
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import {fileURLToPath} from 'node:url';

export const VERSION = 'mc_verify-1';
const STEP = '⑧', NB = 40, N_PICK = 20, N_CAND = 7, VOL_TOL = 1e-6, SQ252 = Math.sqrt(252); // NB = JS 표준오차 묶음 수(tolOf 설명)
const MIN_TAIL_N = 2000; // q05 · cvar5 맞대기에 필요한 판 경로 수 — 묶음마다 꼬리 10개 이상(2,000 × 5% ÷ 10묶음) · 그보다 적으면 판 값 · 묶음 표준오차가 뜻이 없어 오류로 적음
export const K_SE = {ploss: 4, q05: 4, cvar5: 4, mean: 5}; // 맞대기 너비(합친 표준오차 몇 배)
export const SPEC = {id: 'fhs-crn-2', H: 60, L: 500, lambdaFilter: 0.94, floor: 0.000025, alpha: 0.06, beta: 0.93, zclip: 8, vcap: 4, drift: 0, demean: true}; // 계획 「모형 fhs-crn-2」
const LIMIT = {kr: 0.3, us: null}; // 한국 하루 가격 제한 ±30% · 미국 없음
const CAND_DIR = {kr: 'public/data/atlas11/cand/u2-n365-v1-2026-10-05/cand-rules-5', us: 'public/data/atlas11/us/cand/us1-n365-v1-2026-10-05'}; // 후보 발행본(5판 규칙)
const ROW_NUM = ['n', 'nBase', 'nExtra', 'nonfinite', 'extreme', 'clamped', 'mean', 'median', 'ploss', 'q05', 'q10', 'q90', 'cvar5', 'volNow', 'vol2y'];
const SE_NUM = ['mean', 'ploss', 'q05', 'cvar5'];
const STATS = ['ploss', 'q05', 'cvar5', 'mean'];

export const sha256 = buf => crypto.createHash('sha256').update(buf).digest('hex');
const fin = v => typeof v === 'number' && Number.isFinite(v);
const cnt = v => Number.isInteger(v) && v >= 0;
const p8 = v => (fin(v) ? Number(v.toPrecision(8)) : v ?? null);
const boardRank = p => (p === 'kr' ? 0 : p === 'us' ? 1 : 2); // 판 차례 — 한국 · 미국 · 그 밖

/** 씨앗 — 글(UTF-8 바이트)을 32비트 수로(FNV-1a) */
export function fnv1a(text) {
  let h = 0x811c9dc5;
  for (const b of Buffer.from(String(text), 'utf8')) h = Math.imul(h ^ b, 0x01000193) >>> 0;
  return h >>> 0;
}
/** 고른 수(mulberry32) — 0 이상 1 미만 · 넘파이 PCG64DXSM 과 다른 난수 */
export function mulberry32(seed) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6D2B79F5) >>> 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** 입력 종가 → 판 — 양수 종가가 60개 넘는 회사 · 그 회사들의 날짜를 합친 칸 · 로그수익은 마지막 L칸(T = min(L, 날짜 − 1)) */
export function boardOf(inp, L) {
  const px = new Map();
  for (const a of inp?.assets ?? []) {
    const s = new Map();
    for (const q of a?.prices ?? []) if (fin(q?.close) && q.close > 0) s.set(q.date, q.close);
    if (s.size > 60) px.set(String(a.code), s);
  }
  const ds = new Set(); for (const m of px.values()) for (const d of m.keys()) ds.add(d);
  const dates = [...ds].sort(), codes = [...px.keys()].sort(), T = Math.max(0, Math.min(L, dates.length - 1));
  return {px, dates, codes, T, from: T ? dates[dates.length - T] : null, to: dates.at(-1) ?? null};
}
/** 한 회사 로그수익 — 합친 날짜 칸에서 이웃 두 날 종가가 다 있을 때만(아니면 NaN · 빈 날을 건너 이어 붙이지 않음) */
export function returnsOf(B, code) {
  const m = B.px.get(code), D = B.dates.length, T = B.T, off = D - 1 - T, R = new Float64Array(T);
  for (let t = 0; t < T; t++) {
    const a = m.get(B.dates[off + t]), b = m.get(B.dates[off + t + 1]);
    R[t] = a !== undefined && b !== undefined ? Math.log(b / a) : NaN;
  }
  return R;
}
function nanvar(R, lo, hi) { // 넘파이 nanvar(ddof 0) — 평균을 먼저 · 숫자인 칸만
  let n = 0, s = 0;
  for (let t = lo; t < hi; t++) if (Number.isFinite(R[t])) { n++; s += R[t]; }
  if (!n) return NaN;
  const mu = s / n; let v = 0;
  for (let t = lo; t < hi; t++) if (Number.isFinite(R[t])) { const d = R[t] - mu; v += d * d; }
  return v / n;
}
/** 거르기(EWMA) — 잔차 z = r / √max(그날 앞 s², 바닥) · 씨앗 = 첫 20칸 분산(없거나 0 이하면 0.0001) · 빈 날은 s² 를 그대로 둠 · 지금 = 마지막 뒤 s² · 2년 = 창 전체 분산 */
export function filterOf(R, {lambdaFilter: lam, floor}) {
  const T = R.length, Z = new Float64Array(T);
  let s2 = nanvar(R, 0, Math.min(20, T));
  if (!(Number.isFinite(s2) && s2 > 0)) s2 = 1e-4;
  for (let t = 0; t < T; t++) {
    const r = R[t];
    Z[t] = r / Math.sqrt(Math.max(s2, floor));
    if (Number.isFinite(r)) s2 = lam * s2 + (1 - lam) * (r * r);
  }
  const v2y = nanvar(R, 0, T);
  return {Z, cur: Math.sqrt(Math.max(s2, floor)), v2y: Math.max(Number.isFinite(v2y) ? v2y : floor, floor)};
}
/** 잔차 다듬기 — 빈 날은 같은 회사 다른 날 잔차를 고른 수로 골라 채움(다른 날이 없으면 0) → 평균 빼기(채운 뒤 전체) → ±zclip 자름 */
export function residOf(Z, rnd, {demean, zclip}) {
  const T = Z.length, good = [];
  for (let t = 0; t < T; t++) if (Number.isFinite(Z[t])) good.push(t);
  if (good.length < T) for (let t = 0; t < T; t++) if (!Number.isFinite(Z[t])) Z[t] = good.length ? Z[good[Math.floor(rnd() * good.length)]] : 0;
  if (demean && T) { let s = 0; for (let t = 0; t < T; t++) s += Z[t]; const mu = s / T; for (let t = 0; t < T; t++) Z[t] -= mu; }
  for (let t = 0; t < T; t++) Z[t] = Math.min(zclip, Math.max(-zclip, Z[t]));
  return Z;
}
/** 경로 n개 — 하루 r = √s² × z(고른 날의 잔차) · 한국은 r 을 [log(1−제한), log(1+제한)] 로 묶음 · 다음 s² = w + α r² + β s²(위 끝 cap) · 끝 = expm1(Σr) */
export function pathsOf(Z, cur, v2y, rnd, {H, alpha, beta, vcap, limit}, n) {
  const T = Z.length, w = (1 - alpha - beta) * v2y, cap = vcap * vcap * Math.max(v2y, cur * cur), s0 = cur * cur;
  const lo = limit == null ? -Infinity : Math.log(1 - limit), hi = limit == null ? Infinity : Math.log(1 + limit), out = new Float64Array(n);
  for (let j = 0; j < n; j++) {
    let s2 = s0, tot = 0;
    for (let t = 0; t < H; t++) {
      let r = Math.sqrt(s2) * Z[Math.floor(rnd() * T)];
      if (r < lo) r = lo; else if (r > hi) r = hi;
      const sn = w + alpha * (r * r) + beta * s2;
      s2 = sn > cap ? cap : sn;
      tot += r;
    }
    out[j] = Math.expm1(tot);
  }
  return out;
}
/** 한 묶음 — 평균 · sd · 손실 비율(0 미만) · q05(넘파이 기본 직선 보간) · cvar5(q05 이하 평균) */
function blockOf(x) {
  const a = Float64Array.from(x).sort(), n = a.length;
  let s = 0, neg = 0;
  for (let i = 0; i < n; i++) { s += a[i]; if (a[i] < 0) neg++; }
  const mean = s / n; let v = 0;
  for (let i = 0; i < n; i++) { const d = a[i] - mean; v += d * d; }
  const pos = 0.05 * (n - 1), k = Math.floor(pos), q05 = a[k] + (a[Math.min(n - 1, k + 1)] - a[k]) * (pos - k);
  let ts = 0, tn = 0;
  for (let i = 0; i < n && a[i] <= q05; i++) { ts += a[i]; tn++; }
  return {mean, sd: Math.sqrt(v / (n - 1)), ploss: neg / n, q05, cvar5: ts / tn};
}
const sdOf = xs => { const m = xs.reduce((s, v) => s + v, 0) / xs.length; return Math.sqrt(xs.reduce((s, v) => s + (v - m) * (v - m), 0) / (xs.length - 1)); };
/** 값 넷 + 표준오차 — 손실 비율 · q05 · cvar5 = nb묶음 묶음 평균법(경로 차례대로 이어 자름 · numpy array_split 과 같은 크기) · 평균 = sd/√n */
export function statsOf(ret, nb = NB) {
  const n = ret.length, all = blockOf(ret), parts = [];
  for (let b = 0, at = 0; b < nb; b++) { const len = Math.floor(n / nb) + (b < n % nb ? 1 : 0); parts.push(blockOf(ret.subarray(at, at + len))); at += len; }
  const se = k => sdOf(parts.map(p => p[k])) / Math.sqrt(nb);
  return {n, v: {mean: all.mean, ploss: all.ploss, q05: all.q05, cvar5: all.cvar5}, se: {mean: all.sd / Math.sqrt(n), ploss: se('ploss'), q05: se('q05'), cvar5: se('cvar5')}};
}
/** 표본 — 후보 먼저(최대 7곳) + 나머지(기호 차례)를 mulberry32(FNV-1a(회차 ID))로 섞어(피셔-예이츠) 앞에서 채움 = 20곳 */
export function pickOf(runId, universe, cand, nPick = N_PICK) {
  const c = cand.slice(0, N_CAND), cs = new Set(c), rest = [...universe].sort().filter(x => !cs.has(x)), rnd = mulberry32(fnv1a(runId));
  for (let i = rest.length - 1; i > 0; i--) { const j = Math.floor(rnd() * (i + 1)); [rest[i], rest[j]] = [rest[j], rest[i]]; }
  return {cand: c, extra: rest.slice(0, Math.max(0, nPick - c.length))};
}
/** 한 회사 다시 셈 — 씨앗 = FNV-1a(회차 ID) xor 회사 차례(두 판을 이어 1부터 · 0 은 표본 섞기 몫) · 빈 날 채움에 먼저 쓰고 날짜 뽑기에 이어 씀
 *  빈 날이 있는 회사: 채움은 명세 안의 무작위 단계라 엔진 · JS 가 서로 다른 채움 하나씩을 쓴다 → 채움만 FILL_K번 바꾸고 날짜는 같게(공통 난수) 센 흩어짐 = seFill
 *  (2026-10-10 실측 원본 맞대기 — 미국 WBI 빈 날 31칸: 채움만으로 q05 sd 0.0090 · cvar5 sd 0.0109 = 경로 표준오차의 4~5배 · 빈 날 없는 회사는 0) */
const FILL_K = 12, FILL_M = 10000;
export function simOf(B, code, P, seed, nPaths) {
  const R = returnsOf(B, code), F = filterOf(R, P), rnd = mulberry32(seed), gaps = F.Z.reduce((s, v) => s + (Number.isFinite(v) ? 0 : 1), 0);
  const raw = gaps ? Float64Array.from(F.Z) : null;
  residOf(F.Z, rnd, P);
  const S = statsOf(pathsOf(F.Z, F.cur, F.v2y, rnd, P, nPaths)), seFill = Object.fromEntries(STATS.map(k => [k, 0]));
  if (gaps) {
    const dSeed = Math.floor(rnd() * 4294967296), vs = [];
    for (let k = 0; k < FILL_K; k++) { const Z = residOf(Float64Array.from(raw), rnd, P); vs.push(statsOf(pathsOf(Z, F.cur, F.v2y, mulberry32(dSeed), P, FILL_M)).v); }
    for (const k of STATS) seFill[k] = sdOf(vs.map(v => v[k]));
  }
  return {...S, seFill, gaps, volNow: F.cur * SQ252, vol2y: Math.sqrt(F.v2y * 252), seed};
}
/** 맞대기 너비 = K_SE[k] × √(max(se_판, se_같은모형)² + se_JS² + 2 × se_채움²) — se_같은모형 = se_JS × √(JS 경로 ÷ 판 경로)
 *  까닭(2026-10-10 실측): 계획 그대로(양쪽 10묶음 se · 4배)는 q05 · cvar5 맞대기 하나에 헛경보 약 0.1%(판 전체 730곳 맞대기 여섯 번 17,520개 중 9개) = 회차(160개)의 약 8% ·
 *  회차 ID 가 같으면 다시 돌려도 같은 결과라 지울 수 없음. 10묶음 se 는 자유도 9 라 흔들리고, 꼬리 값은 가끔 크게 작게 나옴(엔진을 씨앗만 바꿔 10번 —
 *  151860 cvar5 실제 sd 0.00305 인데 한 회차는 se 0.00104 를 적어 z −6.2). 같은 모형이면 판 se 는 JS 가 아는 값 이상이어야 하므로 바닥을 두고,
 *  JS 쪽은 40묶음(자유도 39)으로 셈 → 같은 자료에서 헛경보 0 · 이론상 회차 약 1%. 4배 · 5배는 계획 그대로 */
export function tolOf(k, sp, nProd, S) {
  const sj = S.se[k], h0 = sj * Math.sqrt(S.n / nProd), spx = Math.max(sp, h0), s = Math.sqrt(spx * spx + sj * sj + 2 * S.seFill[k] * S.seFill[k]);
  return {s, tol: K_SE[k] * s, h0};
}

function readJson(file) { // 파이썬 json.dump 가 NaN · Infinity 를 그대로 쓰면 JSON 이 아님 — 까닭을 알기 쉽게
  const buf = fs.readFileSync(file), text = buf.toString('utf8');
  try { return {buf, sha: sha256(buf), json: JSON.parse(text)}; } catch (e) {
    if (/[:,[]\s*-?(NaN|Infinity)\b/.test(text)) throw Error(`${path.basename(file)}: JSON 안에 숫자 아님(NaN · Infinity)이 있음`);
    throw e;
  }
}
const inside = (base, f) => { // 기록에 적힌 파일 이름 — 뿌리 안 상대 경로만
  if (typeof f !== 'string' || !f || path.isAbsolute(f) || f.split(/[\\/]/).includes('..')) throw Error(`파일 이름이 뿌리 안 상대 경로가 아님: ${JSON.stringify(f)}`);
  return path.join(base, f);
};
function candOf(repo, place, asOf) {
  const dir = CAND_DIR[place];
  if (!dir) throw Error('후보 폴더를 모르는 판: ' + place);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(asOf ?? '')) throw Error('판 결과 기준일(asOf)이 없음');
  const names = fs.readdirSync(path.join(repo, dir)).filter(n => /^\d{4}-\d{2}-\d{2}\.json$/.test(n) && n.slice(0, 10) <= asOf).sort();
  if (!names.length) throw Error(`${dir} 에 ${asOf} 이하 후보 파일이 없음`);
  const file = `${dir}/${names.at(-1)}`, {sha, json} = readJson(path.join(repo, file));
  if (json.place !== place) throw Error(`후보 파일 place ${json.place} ≠ ${place}`);
  if (!Array.isArray(json.cand)) throw Error(`${file} 에 cand 목록이 없음`);
  const codes = json.cand.map(c => String(c?.code ?? '')).filter(Boolean).slice(0, N_CAND); // 0곳이면 20곳 모두 씨앗으로 고름
  return {file, sha, asOf: json.asOf ?? null, rules: json.rules ?? null, codes};
}

/** 회차 하나 검사 — {runId, mc}(mc = 검사 목록 · 요약) · 파일은 쓰지 않음 */
export function verifyRun({runFile, root, repo = process.cwd(), nPaths = 40000, now = () => new Date().toISOString()}) {
  const t0 = performance.now(), checks = [], sample = {};
  const check = (meta, fn) => {
    let result, value;
    try { const r = fn(); result = r.ok ? 'pass' : 'fail'; value = r.value; } catch (e) { result = 'error'; value = {why: String(e?.message ?? e)}; }
    checks.push({id: meta.id, step: STEP, level: meta.level, target: meta.target, version: VERSION, input: meta.input, expect: meta.expect, result, value, at: now()});
    return result;
  };
  const relOf = f => path.relative(root, f).split(path.sep).join('/');

  let rec = null, runSha = null, runErr = null;
  try {
    ({json: rec, sha: runSha} = readJson(runFile));
    if (rec?.schema !== 'atlas11-round-1') throw Error(`회차 기록 schema 가 atlas11-round-1 이 아님: ${rec?.schema}`);
  } catch (e) { runErr = e; }
  const runId = typeof rec?.runId === 'string' && rec.runId ? rec.runId : path.basename(runFile, '.json'), runRel = relOf(runFile);
  const places = runErr ? [] : Object.keys(rec.boards ?? {}).sort((a, b) => boardRank(a) - boardRank(b) || (a < b ? -1 : 1));

  // ① 회차 — 판 경로 합
  check({id: 'mc.round.paths', level: 'L2', target: `${runRel}#paths`, input: {file: runRel, sha256: runSha}, expect: '판마다 paths 합(target · done · nonfinite) = 회차 paths · done + nonfinite = target'}, () => {
    if (runErr) throw Error('회차 기록을 못 읽음: ' + runErr.message);
    const P = rec.paths ?? {}, sum = k => places.reduce((s, p) => s + rec.boards[p]?.paths?.[k], 0), bad = [];
    if (!places.length) bad.push('회차 기록에 판이 없음');
    for (const k of ['target', 'done', 'nonfinite']) { if (!cnt(P[k])) bad.push(`paths.${k} ${P[k]} — 0 이상 정수가 아님`); else if (P[k] !== sum(k)) bad.push(`paths.${k} ${P[k]} ≠ 판 합 ${sum(k)}`); }
    if (P.done + P.nonfinite !== P.target) bad.push(`done + nonfinite ${P.done + P.nonfinite} ≠ target ${P.target}`);
    return {ok: !bad.length, value: {target: P.target ?? null, done: P.done ?? null, nonfinite: P.nonfinite ?? null, boards: Object.fromEntries(places.map(p => [p, rec.boards[p]?.paths ?? null])), bad}};
  });

  let offset = 0, notRun = 0;
  for (const place of places) {
    const ref = rec.boards[place] ?? {}, bRel = typeof ref.file === 'string' ? ref.file : null, tg = s => `${bRel}${s ? '#' + s : ''}`;
    let board = null, bSha = null, bErr = null;
    try { ({json: board, sha: bSha} = readJson(inside(root, ref.file))); } catch (e) { bErr = e; }
    const bIn = {file: bRel, sha256: bSha};
    const B = () => { if (bErr) throw Error('판 결과를 못 읽음: ' + bErr.message); return board; };
    const ROWS = () => { const r = B().rows; if (!Array.isArray(r) || !r.length) throw Error('판 결과 rows 가 비었음'); return r; };
    const rowsCheck = (key, expect, why1) => check({id: `mc.${place}.rows.${key}`, level: 'L2', target: tg('rows'), input: bIn, expect}, () => {
      const rs = ROWS(), bad = [];
      for (const r of rs) { const why = why1(r); if (why) bad.push(`${r?.code}: ${why}`); }
      return {ok: !bad.length, value: {rows: rs.length, bad: bad.length, first: bad.slice(0, 10)}};
    });

    // ① 성질 검사(L2)
    check({id: `mc.${place}.file`, level: 'L2', target: tg(''), input: bIn, expect: 'schema atlas11-mc-2 · runId · place · asOf · paths 가 회차 기록과 같음 · 종목 기호 겹침 없음'}, () => {
      const b = B(), bad = [], codes = ROWS().map(r => String(r?.code));
      if (b.schema !== 'atlas11-mc-2') bad.push(`schema ${b.schema}`);
      if (b.runId !== rec.runId) bad.push(`runId ${b.runId} ≠ ${rec.runId}`);
      if (b.place !== place) bad.push(`place ${b.place}`);
      if (!b.asOf || b.asOf !== ref.asOf) bad.push(`asOf ${b.asOf} ≠ 회차 기록 ${ref.asOf}`);
      for (const k of ['target', 'done', 'nonfinite']) if (b.paths?.[k] !== ref.paths?.[k]) bad.push(`paths.${k} ${b.paths?.[k]} ≠ 회차 기록 ${ref.paths?.[k]}`);
      const dup = codes.length - new Set(codes).size;
      if (dup) bad.push(`겹친 종목 기호 ${dup}`);
      return {ok: !bad.length, value: {schema: b.schema ?? null, runId: b.runId ?? null, asOf: b.asOf ?? null, rows: codes.length, bad}};
    });
    let inp = null, inErr = null, inRel = null;
    try { inRel = B().input?.file ?? null; const buf = fs.readFileSync(inside(repo, inRel)); inp = {buf, sha: sha256(buf)}; } catch (e) { inErr = e; }
    const inIn = {file: inRel, sha256: inp?.sha ?? null};
    const sameInput = check({id: `mc.${place}.input.sha256`, level: 'L2', target: tg('input.sha256'), input: inIn, expect: 'input.sha256 = 지금 입력 파일 바이트의 sha256'}, () => {
      if (inErr) throw Error('입력 파일을 못 읽음: ' + inErr.message);
      const was = B().input?.sha256;
      return {ok: was === inp.sha, value: {recorded: was ?? null, now: inp.sha}};
    }) === 'pass';
    check({id: `mc.${place}.paths.sum`, level: 'L2', target: tg('paths'), input: bIn, expect: 'Σ(n + nonfinite) = paths.target · Σn = paths.done · Σnonfinite = paths.nonfinite'}, () => {
      const P = B().paths ?? {}, rs = ROWS();
      let n = 0, nf = 0;
      for (const r of rs) { n += r?.n; nf += r?.nonfinite; }
      return {ok: cnt(P.target) && P.target === n + nf && P.done === n && P.nonfinite === nf, value: {target: P.target ?? null, done: P.done ?? null, nonfinite: P.nonfinite ?? null, sumN: fin(n) ? n : null, sumNonfinite: fin(nf) ? nf : null}};
    });
    rowsCheck('alloc', '모든 행 n + nonfinite = nBase + nExtra(넷 다 0 이상 정수)', r => (['n', 'nBase', 'nExtra', 'nonfinite'].every(k => cnt(r?.[k])) && r.n + r.nonfinite === r.nBase + r.nExtra ? null : `n ${r?.n} + nonfinite ${r?.nonfinite} · nBase ${r?.nBase} + nExtra ${r?.nExtra}`));
    rowsCheck('order', '모든 행 q05 ≤ q10 ≤ median ≤ q90', r => ([r?.q05, r?.q10, r?.median, r?.q90].every(fin) && r.q05 <= r.q10 && r.q10 <= r.median && r.median <= r.q90 ? null : `q05 ${r?.q05} · q10 ${r?.q10} · median ${r?.median} · q90 ${r?.q90}`));
    rowsCheck('cvar5', '모든 행 cvar5 ≤ q05', r => (fin(r?.cvar5) && fin(r?.q05) && r.cvar5 <= r.q05 + 1e-12 ? null : `cvar5 ${r?.cvar5} · q05 ${r?.q05}`));
    rowsCheck('ploss', '모든 행 0 ≤ ploss ≤ 1', r => (fin(r?.ploss) && r.ploss >= 0 && r.ploss <= 1 ? null : `ploss ${r?.ploss}`));
    rowsCheck('finite', `모든 행 숫자 칸(${ROW_NUM.join(' · ')} · se 넷)이 다 있고 유한`, r => {
      const miss = [...ROW_NUM.filter(k => !fin(r?.[k])), ...SE_NUM.filter(k => !fin(r?.se?.[k])).map(k => 'se.' + k)];
      return miss.length ? `숫자 아님 ${miss.join(' ')}` : null;
    });
    check({id: `mc.${place}.model.drift`, level: 'L2', target: tg('model.drift'), input: bIn, expect: 'model.drift === 0(기울기 0)'}, () => {
      const d = B().model?.drift;
      return {ok: d === 0, value: {drift: d ?? null}};
    });
    check({id: `mc.${place}.model.limit`, level: 'L2', target: tg('model.limit'), input: bIn, expect: place === 'kr' ? 'model.limit === 0.3(한국 하루 가격 제한 ±30%)' : 'model.limit === null(미국 가격 제한 없음)'}, () => {
      if (!(place in LIMIT)) throw Error('가격 제한을 모르는 판: ' + place);
      const m = B().model ?? {};
      return {ok: 'limit' in m && m.limit === LIMIT[place], value: {limit: 'limit' in m ? m.limit : '(칸 없음)'}};
    });
    check({id: `mc.${place}.model.spec`, level: 'L2', target: tg('model'), input: bIn, expect: 'model = fhs-crn-2(H 60 · L 500 · λ 0.94 · 바닥 0.000025 · α 0.06 · β 0.93 · 자름 ±8 · 위 끝 4 · 평균 뺌)'}, () => {
      const m = B().model ?? {}, bad = Object.entries(SPEC).filter(([k, v]) => k !== 'drift' && m[k] !== v).map(([k, v]) => `${k} ${JSON.stringify(m[k])} ≠ ${JSON.stringify(v)}`);
      return {ok: !bad.length, value: {bad}};
    });

    // ② 다시 뽑기(L1) — 모형 값은 판이 적은 것(명세와 다르면 위 model.spec 이 실패) · 없는 칸만 명세 값
    const M = board?.model ?? {}, mnum = (k, ok = fin) => (ok(M[k]) ? M[k] : SPEC[k]), pint = v => Number.isInteger(v) && v > 0;
    const P = {H: mnum('H', pint), L: mnum('L', pint), lambdaFilter: mnum('lambdaFilter'), floor: mnum('floor'), alpha: mnum('alpha'), beta: mnum('beta'), zclip: mnum('zclip'), vcap: mnum('vcap'),
      demean: typeof M.demean === 'boolean' ? M.demean : SPEC.demean, limit: 'limit' in M ? (fin(M.limit) ? M.limit : null) : LIMIT[place] ?? null};
    let J = null, jErr = null;
    try { if (inErr) throw Error('입력 파일을 못 읽음: ' + inErr.message); J = boardOf(JSON.parse(inp.buf.toString('utf8')), P.L); } catch (e) { jErr = e; }
    const needJ = () => { if (jErr) throw jErr; if (!sameInput) throw Error('입력 지문이 회차 기록과 다름 — 다시 셈을 맞대지 않음'); return J; };
    check({id: `mc.${place}.sim.universe`, level: 'L1', target: tg('input'), input: inIn, expect: '입력 종가에서 다시 센 판(양수 종가 60개 넘는 회사) = 판 행 · input.stocks · input.days · input.to 같음'}, () => {
      const j = needJ(), I = B().input ?? {}, prod = new Set(ROWS().map(r => String(r?.code))), mine = new Set(j.codes);
      const onlyJs = j.codes.filter(c => !prod.has(c)), onlyProd = [...prod].filter(c => !mine.has(c)).sort();
      return {ok: !onlyJs.length && !onlyProd.length && I.stocks === j.codes.length && I.days === j.T && I.to === j.to,
        value: {stocks: {prod: I.stocks ?? null, js: j.codes.length}, days: {prod: I.days ?? null, js: j.T}, to: {prod: I.to ?? null, js: j.to}, from: {prod: I.from ?? null, js: j.from}, onlyJs: onlyJs.slice(0, 10), onlyProd: onlyProd.slice(0, 10)}};
    });
    let cand = null, cErr = null;
    try { cand = candOf(repo, place, B().asOf); } catch (e) { cErr = e; }
    const prodRow = new Map((Array.isArray(board?.rows) ? board.rows : []).map(r => [String(r?.code), r]));
    const uni = J ? J.codes.filter(c => prodRow.has(c)) : [], pk = pickOf(runId, uni, cand?.codes ?? []), picks = [...pk.cand, ...pk.extra];
    const short = Math.max(0, N_PICK - picks.length) * STATS.length; // 표본을 다 고르지 못한 자리의 맞대기 = 못 돈 검사(목록에 없음 · 요약 notRun)
    notRun += short;
    sample[place] = {cand: cand ? {file: cand.file, sha256: cand.sha, asOf: cand.asOf, rules: cand.rules, codes: cand.codes} : null, extra: pk.extra, model: P,
      notRun: short ? {checks: short, why: String((bErr && '판 결과를 못 읽음: ' + bErr.message) || (jErr && '입력을 못 읽음: ' + jErr.message) || `판 회사가 ${N_PICK}곳보다 적음`)} : null};
    check({id: `mc.${place}.sim.sample`, level: 'L1', target: tg('rows'), input: {file: cand?.file ?? null, sha256: cand?.sha ?? null}, expect: `후보(기준일 이하 가장 새 후보 파일 cand[].code · 최대 ${N_CAND}곳) + 씨앗 FNV-1a(회차 ID)로 섞어 고른 나머지 = ${N_PICK}곳 · 모두 판 행과 입력에 있음`}, () => {
      if (cErr) throw Error('후보 파일을 못 읽음: ' + cErr.message);
      needJ(); ROWS();
      const missing = pk.cand.filter(c => !uni.includes(c));
      return {ok: !missing.length && picks.length === N_PICK, value: {candFile: cand.file, cand: pk.cand, extra: pk.extra, missing}};
    });
    const base = fnv1a(runId), sims = new Map();
    for (const code of picks) {
      try {
        const j = needJ(), idx = j.codes.indexOf(code);
        if (idx < 0) throw Error('입력에 이 회사가 없음(양수 종가 60개 이하)');
        if (!j.T) throw Error('로그수익 칸이 없음');
        sims.set(code, {S: simOf(j, code, P, (base ^ (offset + idx + 1)) >>> 0, nPaths)});
      } catch (e) { sims.set(code, {err: e}); }
    }
    check({id: `mc.${place}.sim.vol`, level: 'L1', target: tg('rows/*/volNow,vol2y'), input: inIn, expect: `표본 ${N_PICK}곳 volNow · vol2y(연 환산 √252) — 난수 없이 입력 종가에서 셈 · 차이 ≤ ${VOL_TOL}`}, () => {
      needJ();
      const bad = [], diffs = [];
      for (const code of picks) {
        const {S, err} = sims.get(code), r = prodRow.get(code);
        if (err) { bad.push(`${code}: ${err.message}`); continue; }
        if (!r) { bad.push(`${code}: 판 행 없음`); continue; }
        for (const k of ['volNow', 'vol2y']) { const d = Math.abs(S[k] - r[k]); diffs.push(fin(d) ? d : Infinity); if (!(d <= VOL_TOL)) bad.push(`${code} ${k}: 판 ${r[k]} · JS ${p8(S[k])}`); }
      }
      return {ok: !bad.length, value: {stocks: picks.length, maxDiff: diffs.length ? p8(Math.max(...diffs)) : null, bad: bad.slice(0, 10)}};
    });
    for (const code of picks) {
      const {S, err} = sims.get(code), r = prodRow.get(code);
      for (const k of STATS) check({id: `mc.${place}.sim.${code}.${k}`, level: 'L1', target: tg(`rows/${code}/${k}`), input: inIn, expect: `|JS − 판| ≤ ${K_SE[k]} × √(max(se_판, se_JS × √(n_JS ÷ n_판))² + se_JS² + 2 × se_채움²) — se_JS ${NB}묶음 · se_채움 = 빈 날 채움만 ${FILL_K}번 바꿔 센 흩어짐(빈 날 없으면 0)`}, () => {
        if (err) throw err;
        if (!r) throw Error('판 결과에 이 회사 행이 없음');
        const p = r[k], sp = r.se?.[k], j = S.v[k];
        if (!fin(p) || !fin(sp) || sp < 0) throw Error(`판 ${k} 또는 se.${k} 가 숫자가 아님`);
        if (!(Number.isInteger(r.n) && r.n > 0)) throw Error(`판 경로 수 n 이 없음: ${r.n}`);
        if ((k === 'q05' || k === 'cvar5') && r.n < MIN_TAIL_N) throw Error(`판 경로 ${r.n}개 — ${MIN_TAIL_N}개보다 적어 ${k} 맞대기 뜻이 없음(묶음마다 꼬리 10개 미만)`);
        const {s, tol, h0} = tolOf(k, sp, r.n, S), diff = j - p;
        return {ok: Math.abs(diff) <= tol, value: {prod: p, js: p8(j), diff: p8(diff), seProd: sp, seProdH0: p8(h0), seJs: p8(S.se[k]), seFill: p8(S.seFill[k]), gaps: S.gaps, tol: p8(tol), z: s > 0 ? p8(diff / s) : null, nProd: r.n, nJs: S.n, seed: S.seed}};
      });
    }
    offset += J?.codes.length ?? 0;
  }

  const count = x => checks.filter(c => c.result === x).length, pass = count('pass'), fail = count('fail'), error = count('error');
  const summary = {made: checks.length + notRun, ran: pass + fail + error, pass, fail, error, notRun}; // 만든 수 = 목록 + 못 돈 수(표본 빈 자리 · sample.<판>.notRun 에 까닭)
  return {runId, mc: {version: VERSION, runId, at: now(), sec: Number(((performance.now() - t0) / 1000).toFixed(1)), pathsPerStock: nPaths, sample, summary, checks}};
}

/** 검사 파일에 mc 칸만 바꿔 씀 — 다른 칸(elim 등)은 그대로 · 다른 회차 파일이면 쓰지 않음 · 임시 파일 뒤 이름 바꾸기 */
export function writeMc(out, runId, mc) {
  let doc = {};
  if (fs.existsSync(out)) {
    doc = JSON.parse(fs.readFileSync(out, 'utf8'));
    if (doc?.runId && doc.runId !== runId) throw Error(`${out} 는 다른 회차(${doc.runId}) 검사 파일 — 쓰지 않음`);
    if (doc?.mc) throw Error(`${out} 에 몬테카를로 검사 기록이 이미 있음 — 기록은 고치지 않음(규칙 8 · 새 회차로 다시 셈)`);
  }
  doc = {schema: doc.schema ?? 'atlas11-round-verify-1', runId: doc.runId ?? runId, ...doc, mc};
  fs.mkdirSync(path.dirname(out), {recursive: true});
  const tmp = `${out}.${process.pid}.tmp`;
  fs.writeFileSync(tmp, JSON.stringify(doc, null, 1) + '\n');
  fs.renameSync(tmp, out);
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const argv = process.argv.slice(2), arg = (k, d) => { const i = argv.indexOf(k); return i >= 0 && i + 1 < argv.length ? argv[i + 1] : d; };
  const run = arg('--run', null), nPaths = Number(arg('--paths', '40000'));
  if (!run || !Number.isInteger(nPaths) || nPaths < 10000) { // 40묶음마다 꼬리 12개 이상
    console.error('쓰는 법: node scripts/atlas11/verify/mc_verify.mjs --run reports/atlas11/rounds/<runId>.json [--root 뿌리] [--out 파일] [--paths 40000(10000 이상)]');
    process.exit(2);
  }
  const runFile = path.resolve(run), m = runFile.match(/^(.*)\/reports\/atlas11\/rounds\/[^/]+$/);
  const root = path.resolve(arg('--root', m ? m[1] || '/' : '.'));
  const {runId, mc} = verifyRun({runFile, root, repo: process.cwd(), nPaths});
  const out = path.resolve(arg('--out', path.join(path.dirname(runFile), `${runId}.verify.json`)));
  try { writeMc(out, runId, mc); } catch (e) { console.error('검사 파일을 쓰지 못함: ' + (e?.message ?? e)); process.exit(2); }
  for (const c of mc.checks.filter(x => x.result !== 'pass').slice(0, 20)) console.error(`${c.result} ${c.id} ${JSON.stringify(c.value).slice(0, 300)}`);
  console.log(JSON.stringify({runId, out: path.relative(process.cwd(), out), summary: mc.summary, sec: mc.sec}));
  process.exit(mc.summary.pass === mc.summary.made ? 0 : 1);
}
