#!/usr/bin/env node
/**
 * 수르 42칸 포모지수 — 몬테카를로 → 소거법 기준 일곱 → 회사마다 까닭 열하나(주문 0123 덧붙임)
 *   사장님 2026-11-09 02:01 「회사마다 포모지수라는게 있지 그 포모지수값을 첫페이지 42곳에 모두 표기해줘 그리고 왜? 이런값이 나왔는지 그이유도 11가지 기록하고」
 *   · 02:02 「포모 값을 계산할때는 몬트리올(= 몬테카를로) 방식을 최대한 하고 그런다음 소거법을 사용하여 기준을 잡은뒤 그다음 그 이유 7가지를 기록해」 · 02:04 「어」
 *   잣대 = 옛 ATLAS FOMO 1(lib/fomo.mjs) 열여덟 가지 가운데 종가로 셀 수 있는 「가격 열기」 여섯 · 두 묶음(추세 · 가격 위치) · 같은 셈 꼴(rawAt)
 *     추세: 10일 상승률 Σ₁₀ log(Cₜ/Cₜ₋₁) · 상승 가속 Σ최근5 r − Σ이전5 r · 상승일 비중 Σ₁₀ 1(r>0)/10
 *     가격 위치: 20일 평균 이격 C/mean(C 최근20) − 1 · 직전 60일 고점 돌파 C/max(C 직전60) − 1 · 상승 변동 집중 Σ₁₀ max(r,0)²/Σ₁₀ r²
 *   ① 몬테카를로(최대한) — 회사마다 길 100,000개: 오늘 열흘 바로 앞까지 지난 1년(252거래일) 하루 로그수익에서 열 날을 마구 뽑아(되돌려 넣기)
 *      열흘 전 실제 종가에서 열흘을 다시 걸음 · 길마다 여섯 잣대를 같은 셈으로 · 오늘 실제 잣대가 10만 길 가운데 어디쯤인지(가운데 자리 · 0 ~ 100)
 *      묶음 점수 = 잣대 점수의 무게 평균(무게 = 1 ÷ (1 + 같은 묶음 다른 잣대와의 순위 상관 절댓값 합) — lib/fomo.mjs 와 같은 꼴 · 상관은 10만 길에서)
 *      포모지수 = 두 묶음 점수의 평균(0 ~ 100 · 50 = 그 회사 보통 때) · 흔들림(표준오차)도 셈
 *      난수 = sfc32 · 씨앗 sha256(그날 판 · 회사 번호 · 판 이름) — 같은 날 같은 회사는 늘 같은 값(다시 세기 가능)
 *   ② 소거법 기준 일곱(차례 고정 · 하나라도 걸리면 그 회사 값은 「보류」 또는 「뺌」 — 지어내지 않음)
 *   ③ 까닭 열하나 = 지수 · 두 묶음 · 여섯 잣대 · 무게 · 바탕(su-why36.js 가 글로 풀어 보여 줌)
 *   종가 = 회사 자료(atlas/data/co) · 마지막 21거래일은 첫 페이지 칸과 같은 판 값(board.json c — 자료 마지막 날 = 판 날일 때만 · 두 자료가 다른 날이 있어 첫 페이지와 같은 값으로 셈)
 *   쓰는 곳: 목록 칸마다 fomo(정수 · 보류면 null) · fv(pass · hold · out) → su21.json · su21-next.json · 자세한 값 → su21-why.json(「왜?」 쪽만 받음)
 * 쓰는 법: node scripts/atlas11/next/su21_fomo.mjs --su <su/data 폴더> --data <atlas/data 폴더> [--paths 100000]
 */
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import {fileURLToPath} from 'node:url';

export const FOMO_MC = Object.freeze({id: 'su-fomo-mc-1', paths: 100000, base: 252, win: 10, minBase: 200, minPaths: 20000, maxSe: 0.5, maxLag: 5, jump: 0.35});
export const FEATS = Object.freeze([
  {id: 'return10', g: 'trend', label: '10일 상승률'}, {id: 'acceleration', g: 'trend', label: '상승 가속'}, {id: 'upDays', g: 'trend', label: '상승일 비중'},
  {id: 'maGap', g: 'place', label: '20일 평균 이격'}, {id: 'breakout', g: 'place', label: '직전 60일 고점 돌파'}, {id: 'upVariation', g: 'place', label: '상승 변동 집중'}]);
export const GROUPS = Object.freeze([{id: 'trend', label: '추세'}, {id: 'place', label: '가격 위치'}]);
/** 소거법 기준 일곱(차례 고정) — 글은 「왜?」 쪽이 그대로 씀 */
export const CHECKS = Object.freeze([
  {id: 'close', label: '그날 종가', rule: '오늘 판 날의 종가가 있어요', why: '값이 없는 날은 열기를 잴 수 없어요'},
  {id: 'fresh', label: '날짜', rule: '종가 날이 첫 페이지 판 날과 다섯 거래일 안이에요', why: '너무 옛 값이면 지금의 열기가 아니에요'},
  {id: 'ca', label: '주식 나눔 · 합침', rule: '지난 1년에 하루 35만큼 넘게 움직인 날이 없어요', why: '그런 날은 주식을 나누거나 합친 흔적이라 지난 값과 견줄 수 없어요'},
  {id: 'history', label: '지난 1년', rule: '지난 1년 하루 움직임이 200날 넘게 있어요', why: '이 하루 움직임을 섞어 길을 만들어요'},
  {id: 'paths', label: '길 수', rule: '몬테카를로 길을 2만 개 넘게(10만 개) 만들었어요', why: '길이 많을수록 값이 흔들리지 않아요'},
  {id: 'converge', label: '흔들림', rule: '다시 세어도 값이 0.5 안에서만 흔들려요', why: '다시 셀 때마다 크게 바뀌면 믿을 수 없어요'},
  {id: 'six', label: '잣대 여섯', rule: '여섯 잣대를 모두 셀 수 있어요', why: '하나라도 빠지면 묶음 점수가 한쪽으로 기울어요'}]);

const fin = v => typeof v === 'number' && Number.isFinite(v);
const ok = v => typeof v === 'number' && v > 0;
const r2 = v => (fin(v) ? Math.round(v * 100) / 100 : null);
const r4 = v => (fin(v) ? Math.round(v * 1e4) / 1e4 : null);

/** sfc32 — 씨앗 문자열 → [0, 1) 난수 */
export function rngOf(seed) {
  const h = crypto.createHash('sha256').update(String(seed)).digest();
  let a = h.readUInt32LE(0), b = h.readUInt32LE(4), c = h.readUInt32LE(8), d = h.readUInt32LE(12);
  const next = () => { a >>>= 0; b >>>= 0; c >>>= 0; d >>>= 0; let t = (a + b) | 0; a = b ^ (b >>> 9); b = (c + (c << 3)) | 0; c = (c << 21) | (c >>> 11); d = (d + 1) | 0; t = (t + d) | 0; c = (c + t) | 0; return (t >>> 0) / 4294967296; };
  for (let k = 0; k < 15; k++) next();
  return next;
}
/** 여섯 잣대(lib/fomo.mjs rawAt 의 종가 갈래 그대로) — closes: 그날까지 종가(i = 오늘) · 열 하루 · 스무 날 · 예순 날이 모자라면 그 잣대는 null */
export function featuresAt(C, i) {
  const o = {return10: null, acceleration: null, upDays: null, maGap: null, breakout: null, upVariation: null};
  if (i - 10 < 0) return o;
  for (let t = i - 10; t <= i; t++) if (!ok(C[t])) return o;
  const r = []; for (let t = i - 9; t <= i; t++) r.push(Math.log(C[t] / C[t - 1]));
  const sum = xs => xs.reduce((p, q) => p + q, 0);
  o.return10 = sum(r); o.acceleration = sum(r.slice(5)) - sum(r.slice(0, 5)); o.upDays = r.filter(x => x > 0).length / 10;
  const sq = sum(r.map(x => x * x)); o.upVariation = sq > 0 ? sum(r.map(x => Math.max(0, x) ** 2)) / sq : 0.5;
  if (i - 19 >= 0) { let s = 0, n = 0; for (let t = i - 19; t <= i; t++) { if (!ok(C[t])) { n = -1; break; } s += C[t]; n++; } if (n === 20) o.maGap = C[i] / (s / 20) - 1; }
  if (i - 60 >= 0) { let m = 0, n = 0; for (let t = i - 60; t <= i - 1; t++) { if (!ok(C[t])) { n = -1; break; } if (C[t] > m) m = C[t]; n++; } if (n === 60) o.breakout = C[i] / m - 1; }
  return o;
}
/** 가운데 자리(0 ~ 100) — 작은 값 수 + 같은 값 수의 절반 */
const midRank = (v, xs) => { let lo = 0, eq = 0; for (let k = 0; k < xs.length; k++) { const x = xs[k]; if (x < v) lo++; else if (x === v) eq++; } return 100 * (lo + 0.5 * eq) / xs.length; };
/** 순위(같은 값은 평균 순위) */
function ranks(xs) {
  const n = xs.length, idx = new Uint32Array(n); for (let k = 0; k < n; k++) idx[k] = k;
  idx.sort((p, q) => xs[p] - xs[q]);
  const out = new Float64Array(n);
  for (let k = 0; k < n;) { let j = k + 1; while (j < n && xs[idx[j]] === xs[idx[k]]) j++; const rk = (k + j - 1) / 2; for (let m = k; m < j; m++) out[idx[m]] = rk; k = j; }
  return out;
}
const corr = (a, b) => { const n = a.length; let ma = 0, mb = 0; for (let k = 0; k < n; k++) { ma += a[k]; mb += b[k]; } ma /= n; mb /= n; let c = 0, x = 0, y = 0; for (let k = 0; k < n; k++) { const p = a[k] - ma, q = b[k] - mb; c += p * q; x += p * p; y += q * q; } return x && y ? c / Math.sqrt(x * y) : 0; };

/**
 * 회사 하나 — C: 종가(Float64Array · 0 = 없음) · i: 오늘 자리 · dates: 날짜 줄 · seed · lag: 판 날과 떨어진 거래일 수
 * 반환 {verdict, first, checks[7], v, v1, se, groups[2], f[6], base{from, to, n}, paths, asOf}
 */
export function fomoOf(C, i, dates, {seed, lag = 0, paths = FOMO_MC.paths} = {}) {
  const P = FOMO_MC, checks = [], put = (id, pass, value, hold = false) => checks.push({id, verdict: pass ? 'pass' : hold ? 'hold' : 'out', value});
  put('close', ok(C[i]), ok(C[i]) ? C[i] : null);
  put('fresh', lag <= P.maxLag, lag, true);
  let jump = null; for (let t = Math.max(1, i - P.base - 20); t <= i; t++) if (ok(C[t]) && ok(C[t - 1]) && Math.abs(C[t] / C[t - 1] - 1) >= P.jump) { jump = dates[t]; break; }
  put('ca', !jump, jump);
  // 바탕 = 오늘 열흘 바로 앞까지 252거래일 하루 로그수익
  const R = []; const b0 = Math.max(1, i - 10 - P.base + 1);
  for (let t = b0; t <= i - 10; t++) if (ok(C[t]) && ok(C[t - 1])) R.push(Math.log(C[t] / C[t - 1]));
  put('history', R.length >= P.minBase, R.length, true);
  const act = featuresAt(C, i);
  const six = FEATS.every(f => fin(act[f.id]));
  const base = {from: dates[b0 - 1] ?? null, to: dates[i - 10] ?? null, n: R.length};
  if (!checks.every(c => c.verdict === 'pass') || !six) {
    put('paths', false, 0, true); put('converge', false, null, true); put('six', six, FEATS.filter(f => fin(act[f.id])).length, true);
    const first = checks.find(c => c.verdict !== 'pass');
    return {verdict: checks.some(c => c.verdict === 'out') ? 'out' : 'hold', first: first?.id ?? null, checks, v: null, v1: null, se: null, groups: null, f: FEATS.map(f => ({id: f.id, act: r4(act[f.id])})), base, paths: 0, asOf: dates[i]};
  }
  // ① 몬테카를로 — 길마다 열 날을 바탕에서 뽑아 열흘 전 실제 종가부터 다시 걸음
  const rnd = rngOf(seed), nR = R.length, sims = Object.fromEntries(FEATS.map(f => [f.id, new Float64Array(paths)]));
  const pre20 = []; for (let t = i - 19; t <= i - 10; t++) pre20.push(C[t]); // 스무 날 평균의 앞 열흘(실제)
  let pre60 = 0; for (let t = i - 60; t <= i - 10; t++) if (C[t] > pre60) pre60 = C[t]; // 직전 60일 가운데 실제 쉰한 날의 가장 높은 값
  const s20 = pre20.reduce((p, q) => p + q, 0), c0 = C[i - 10], r = new Float64Array(10);
  for (let p = 0; p < paths; p++) {
    let up = 0, sum = 0, a5 = 0, sq = 0, upsq = 0, c = c0, ssum = 0, mx = pre60;
    for (let k = 0; k < 10; k++) { const x = R[Math.floor(rnd() * nR)]; r[k] = x; sum += x; if (k < 5) a5 += x; if (x > 0) { up++; upsq += x * x; } sq += x * x; c *= Math.exp(x); ssum += c; if (k < 9 && c > mx) mx = c; }
    sims.return10[p] = sum; sims.acceleration[p] = (sum - a5) - a5; sims.upDays[p] = up / 10; sims.upVariation[p] = sq > 0 ? upsq / sq : 0.5;
    sims.maGap[p] = c / ((s20 + ssum) / 20) - 1; sims.breakout[p] = c / mx - 1;
  }
  const f = FEATS.map(x => { const sc = midRank(act[x.id], sims[x.id]), q = sc / 100; return {id: x.id, g: x.g, act: r4(act[x.id]), score: r2(sc), se: 100 * Math.sqrt(q * (1 - q) / paths)}; });
  const rk = Object.fromEntries(FEATS.map(x => [x.id, ranks(sims[x.id])]));
  const groups = GROUPS.map(G => {
    const mem = f.filter(x => x.g === G.id);
    for (const m of mem) { let red = 0; for (const o of mem) if (o !== m) red += Math.abs(corr(rk[m.id], rk[o.id])); m.w = 1 / (1 + red); }
    const den = mem.reduce((p, q) => p + q.w, 0), score = mem.reduce((p, q) => p + q.score * q.w, 0) / den;
    const se = Math.sqrt(mem.reduce((p, q) => p + (q.w / den) ** 2 * q.se ** 2, 0));
    for (const m of mem) m.w = r4(m.w / den);
    return {id: G.id, score: r2(score), se};
  });
  const v1 = (groups[0].score + groups[1].score) / 2, se = Math.sqrt(groups[0].se ** 2 + groups[1].se ** 2) / 2;
  put('paths', paths >= P.minPaths, paths, true);
  put('converge', se <= P.maxSe, r2(se), true);
  put('six', true, 6);
  const first = checks.find(c => c.verdict !== 'pass'), pass = !first;
  return {verdict: pass ? 'pass' : 'hold', first: first?.id ?? null, checks, v: pass ? Math.round(v1) : null, v1: r2(v1), se: r2(se),
    groups: groups.map(g => ({id: g.id, score: g.score, se: r2(g.se)})), f: f.map(x => ({id: x.id, g: x.g, act: x.act, score: x.score, w: x.w})), base, paths, asOf: dates[i]};
}

const isMain = process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (isMain) {
  const arg = (k, d = null) => (process.argv.includes(k) ? process.argv[process.argv.indexOf(k) + 1] : d);
  const SU = path.resolve(arg('--su')), DD = path.resolve(arg('--data')), PATHS = Number(arg('--paths', FOMO_MC.paths));
  const J = f => JSON.parse(fs.readFileSync(f, 'utf8'));
  const su = J(path.join(SU, 'su21.json')), nf = path.join(SU, 'su21-next.json'), suNext = fs.existsSync(nf) ? J(nf) : null;
  // 자료가 판 날보다 앞서면(장 중에 올릴 때 오늘 값이 섞임 — 2026-11-09 진짜 사이트 검사 3/11) 판 날까지만 씀 — 포모 자료 날 = 판 날 · 첫 페이지 칸과 같은 날
  const board = su.asOf?.board ?? null, dates0 = J(path.join(DD, 'days.json')).dates, dates = board ? dates0.filter(d => d <= board) : dates0, N = dates.length;
  const KEYS = ['hot', 'bloom', 'money', 'hotNext', 'moneyNext', 'bloomNext'];
  const items = [su, suNext].flatMap(F => KEYS.flatMap(k => F?.lists?.[k] ?? []));
  const codes = [...new Set(items.map(c => c.code))].sort();
  // 판 날과 떨어진 거래일 — 자료 마지막 날 뒤의 평일(쉬는 날 모름 · 넉넉히)
  let lag = 0; if (board && dates[N - 1] < board) { for (let d = new Date(dates[N - 1] + 'T00:00:00Z'); ;) { d = new Date(d.getTime() + 86400e3); const s = d.toISOString().slice(0, 10); if (s > board) break; if (d.getUTCDay() % 6) lag++; } }
  const t0 = Date.now(), out = {};
  for (const code of codes) {
    let co; try { co = J(path.join(DD, 'co', code + '.json')); } catch { co = null; }
    const C = new Float64Array(N);
    if (co && Array.isArray(co.close) && Number.isInteger(co.k0)) co.close.forEach((x, j) => { const t = j + co.k0; if (t >= 0 && t < N && typeof x === 'number' && x > 0) C[t] = x; });
    // 마지막 21거래일은 첫 페이지 칸과 같은 값(그날 판 board.json 의 21 마지막 값 · 네이버 증권 그날 마지막 값) — 자료 마지막 날 = 판 날일 때만(날짜가 맞을 때만 갈아 끼움)
    const it = items.find(x => x.code === code && Array.isArray(x.c)) ?? items.find(x => x.code === code), c21 = Array.isArray(it?.c) && it.c.length === 21 && it.c.every(v => typeof v === 'number' && v > 0) ? it.c : null;
    const spliced = !!(c21 && board && dates[N - 1] === board && it.date === board);
    if (spliced) for (let k = 0; k < 21; k++) C[N - 21 + k] = c21[k];
    out[code] = {...fomoOf(C, N - 1, dates, {seed: [FOMO_MC.id, board, code].join('|'), lag, paths: PATHS}), src: spliced ? '마지막 21거래일 = 첫 페이지 판 값 · 그 앞 = 회사 자료 종가' : '회사 자료 종가'};
  }
  for (const c of items) { const x = out[c.code]; c.fomo = x?.v ?? null; c.fv = x?.verdict ?? 'hold'; }
  const why = {schema: 'su21-why-1', made: new Date().toISOString(), board, data: dates[N - 1], mc: {...FOMO_MC, paths: PATHS}, checks: CHECKS, feats: FEATS, groups: GROUPS, fomo: out};
  const w = (f, o) => { const tmp = f + '.tmp' + process.pid; fs.writeFileSync(tmp, JSON.stringify(o)); fs.renameSync(tmp, f); };
  w(path.join(SU, 'su21.json'), su); if (suNext) w(nf, suNext); w(path.join(SU, 'su21-why.json'), why);
  const pass = Object.values(out).filter(x => x.verdict === 'pass').length;
  console.log(`포모지수 — 회사 ${codes.length} · 통과 ${pass} · 길 ${PATHS.toLocaleString('en')}개씩 · ${((Date.now() - t0) / 1000).toFixed(1)}초 · 자료 ${dates[N - 1]} · 판 ${board} · ` + codes.slice(0, 5).map(c => c + ' ' + (out[c].v ?? out[c].first)).join(' · '));
}
