#!/usr/bin/env node
// 고도리 지난 성적 — 바탕 비교 둘 gb-v1(일꾼 G2b · 명령 [8] 3 「20, 60거래일 뒤를 같은 날 모든 회사, 코스피와 견줘라 · 그날 알 수 있던 것만」)
//
// 쓰는 법(모음을 한 번 읽고 여러 번 부름 — 모음 읽기 약 7초 · 1.1GB · 읽은 뒤 배열만 남김 약 40MB):
//   import {loadBaseline} from './baseline.mjs';
//   const bl = loadBaseline(bundleOrPath, opts);   // 모음 경로(.json.gz) 또는 이미 읽은 모음 객체(backtest.mjs 가 한 번만 읽게)
//   bl.days                  거래일 달력 ['YYYY-MM-DD', …] — 이 모음은 839날(0 = 2023-04-28 … 838 = 2026-10-13) · 날 k = bl.days[k]
//   bl.indexOf(date)         'YYYY-MM-DD' | 'YYYYMMDD' → k(없으면 -1)
//   bl.endOf(k, hold)        끝 날 자리 e = k + hold(hold = 거래일 수 1 이상) 또는 마지막 날(hold = 'end') · 못 세면 -1
//   bl.allCompanies(k, hold) → null | {k, e, from, to, n, median, mean, up, down, flat, stale, worst: {median, mean},
//                                       jump, clean: {n, median, mean}, haltedAtStart}
//   bl.beats(k, hold, r)     → null | {n, below, equal, above, share}   share = (below + equal / 2) / n · r = 견줄 오름(비율)
//   bl.kospi(k, hold)        → {k, e, from, to, c0, c1, r, src}   값이 없으면 r = null · why
//   bl.stockReturn(code, k, hold) → null | {code, k, e, c0, c1, r, stale, jump}   k 날 거래가 없거나 회사 주식이 아니면 null
//   bl.tradable(code, k)     → k 날 거래가 있었나(모든 회사 셈에 드는가)
//   bl.codes                 모든 회사 번호(차례대로) · bl.meta = 자료 · 규칙 · 수(gdr-back.json 에 그대로 실음)
//   모듈 함수 allCompanies(k, hold) · beats(k, hold, r) · kospi(k, hold) · stockReturn(code, k, hold) 는 마지막으로 읽은 bl 을 씀.
//
// 오름 r 은 비율(0.0123 = +1.23%) · 반올림 안 함 · 더하기는 번호 차례(같은 값이 늘 같게).
// 규칙 gb-v1:
//  ① 모든 회사 = 모음의 회사 주식(lib/atlas11/universe.mjs kindOf = null · 일봉 줄이 있는 곳) 가운데 시작 날 k 에 일봉 줄이 있고
//     거래량 > 0 인 곳. 들고 빠짐은 k 날 줄만 보고 정함(그 뒤 줄은 안 봄) — 뒤에 거래가 멈춘 곳도 그대로 듦.
//  ② 시작 값 = k 날 종가 · 끝 값 = e 날 줄의 종가. 그날 거래가 없으면(거래량 0) 네이버가 실은 값(= 마지막 종가)을 쓰고 stale 로 셈.
//     e 날 줄이 없으면 e 앞 마지막 줄의 종가(앞 줄만 씀). worst = stale 인 곳을 −100% 로 친 아래 끝(멈춘 뒤 폐지되면).
//  ③ 상장폐지된 회사는 모음에 없음 — 모음은 2026-10-14 에 상장돼 있던 목록으로 받은 것. 그 사이 폐지된 곳의 수 · 값은 이 모음으로 모름
//     (meta.survivorship). 그래서 모든 회사 값은 실제보다 좋게 나올 수 있다(쪽은 확실 · 크기는 모름).
//  ④ jump = (k, e] 안에 종가가 바로 앞 줄 종가보다 35% 넘게 바뀐 날이 있는 곳. 거래소 하루 값 폭은 ±30% — 넘으면 감자 · 병합 ·
//     재상장처럼 고쳐지지 않은 값으로 봄(급등 sv-v1 의 35% 와 같음). 모든 셈에는 넣고 clean 만 빼고 셈.
//  ⑤ 코스피 = reports/atlas11/probe/index-long/kospi.json(1990-01-04 ~ 2026-10-12 · 확정 종가) + 그 파일에 없는 날만
//     public/data/atlas11/market/KOSPI.json(장 끝난 뒤 이어 붙인 확정 종가 · 두 파일이 겹치는 날 모두 같을 때만 씀).
//     달력 날에 값이 없으면 null(앞 값으로 채우지 않음).
//  ⑥ 달력 = 회사 주식 일봉 날짜 가운데, 회사 주식 절반 넘게 줄이 있는 첫 날부터 뒤의 모든 날(앞쪽에 한두 곳만 있는 옛 줄은 뺌).
//
// 바로 돌리기(확인용): node scripts/atlas11/next/gdr/baseline.mjs [--bundle <bundle.json.gz>] [--k 250] [--hold 20]
import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';
import crypto from 'node:crypto';
import {fileURLToPath} from 'node:url';
import {kindOf} from '../../../../lib/atlas11/universe.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../../..');
export const BASELINE_VERSION = 'gb-v1';
export const DEFAULT_BUNDLE = 'reports/atlas11/universe/2026-10-14-1209-to1013/bundle.json.gz';
export const DEFAULT_KOSPI = ['reports/atlas11/probe/index-long/kospi.json', 'public/data/atlas11/market/KOSPI.json'];
export const JUMP = 0.35; // 하루 종가 바뀜이 이보다 크면 고쳐지지 않은 값으로 봄(거래소 값 폭 ±30%)
const KOSPI_TOL = 0.005; // 두 코스피 파일이 같은 날 같은 값인가(소수 둘째 자리)

export const ymd = d => { const s = String(d); return /^\d{8}$/.test(s) ? `${s.slice(0, 4)}-${s.slice(4, 6)}-${s.slice(6, 8)}` : s; };
export const readBundle = p => JSON.parse(zlib.gunzipSync(fs.readFileSync(path.resolve(ROOT, p))));

/** 코스피 파일 한 개 → [[YYYY-MM-DD, 종가], …] — [[d, c]] 꼴과 {rows: [{date, close}]} 꼴 모두 */
function kospiRows(j) {
  const rows = Array.isArray(j) ? j : Array.isArray(j?.rows) ? j.rows : [];
  return rows.map(r => (Array.isArray(r) ? [ymd(r[0]), Number(r[1])] : [ymd(r.date), Number(r.close)])).filter(([d, c]) => /^\d{4}-\d\d-\d\d$/.test(d) && c > 0);
}

/** 여러 코스피 출처를 하나로 — 첫 출처가 바탕 · 뒤 출처는 겹치는 날이 모두 같을 때만 빈 날을 채움 */
export function mergeKospi(sources) {
  const map = new Map(), src = new Map(), info = [];
  sources.forEach(({name, rows}, i) => {
    let shared = 0, disagree = 0; const first = [];
    for (const [d, c] of rows) if (map.has(d)) { shared++; if (Math.abs(map.get(d) - c) > KOSPI_TOL) { disagree++; if (first.length < 3) first.push([d, map.get(d), c]); } }
    const use = i === 0 || disagree === 0;
    let added = 0;
    if (use) for (const [d, c] of rows) if (!map.has(d)) { map.set(d, c); src.set(d, i); added++; }
    const ds = rows.map(r => r[0]).sort();
    info.push({file: name, n: rows.length, from: ds[0] ?? null, to: ds.at(-1) ?? null, shared, disagree, firstDisagree: first, used: use, added});
  });
  return {map, src, info};
}

let LAST = null;
const need = () => { if (!LAST) throw new Error('baseline: loadBaseline() 을 먼저 부르세요'); return LAST; };
export const allCompanies = (k, hold) => need().allCompanies(k, hold);
export const beats = (k, hold, r) => need().beats(k, hold, r);
export const kospi = (k, hold) => need().kospi(k, hold);
export const stockReturn = (code, k, hold) => need().stockReturn(code, k, hold);

/**
 * loadBaseline(src = DEFAULT_BUNDLE, opts)
 *   src  : 모음 경로(ROOT 기준 또는 절대) 또는 이미 읽은 모음 객체({stocks: {번호: {list, fchart: {rows}}}})
 *   opts : {kospi: [[date, close], …] (시험용 · 주면 파일 대신) · kospiFiles: [경로, …] (처음 = DEFAULT_KOSPI) · sha: false(해시 안 셈)}
 */
export function loadBaseline(src = DEFAULT_BUNDLE, opts = {}) {
  const t0 = Date.now();
  const fromPath = typeof src === 'string';
  const bundleFile = fromPath ? path.resolve(ROOT, src) : null;
  let B = fromPath ? readBundle(src) : src;
  const stocks = B?.stocks ?? {};
  const totalListed = Object.keys(stocks).length;
  const codes = Object.keys(stocks).filter(c => { const s = stocks[c]; return kindOf(c, s?.list?.name, s?.list?.endType) === null && (s?.fchart?.rows?.length ?? 0) > 0; }).sort();
  const commonNoRows = Object.keys(stocks).filter(c => { const s = stocks[c]; return kindOf(c, s?.list?.name, s?.list?.endType) === null && !((s?.fchart?.rows?.length ?? 0) > 0); }).length;
  const S = codes.length;

  // ⑥ 달력
  const cnt = new Map();
  const sorted = new Array(S);
  for (let s = 0; s < S; s++) {
    let rows = stocks[codes[s]].fchart.rows;
    for (let i = 1; i < rows.length; i++) if (!(String(rows[i][0]) > String(rows[i - 1][0]))) { rows = [...new Map(rows.map(r => [String(r[0]), r])).values()].sort((a, b) => (String(a[0]) < String(b[0]) ? -1 : 1)); break; }
    sorted[s] = rows;
    for (const r of rows) { const d = String(r[0]); cnt.set(d, (cnt.get(d) ?? 0) + 1); }
  }
  const allDates = [...cnt.keys()].sort();
  const d0 = allDates.find(d => cnt.get(d) * 2 > S) ?? null;
  const D = d0 ? allDates.filter(d => d >= d0) : [];
  const n = D.length, at = new Map(D.map((d, i) => [d, i]));
  const days = D.map(ymd);

  // 회사 × 날 배열(앞 줄만으로 채움)
  const close = new Float64Array(S * n).fill(NaN), traded = new Uint8Array(S * n), hasRow = new Uint8Array(S * n), jumpCum = new Int32Array(S * n);
  const jumpFlag = new Uint8Array(n);
  let jumpRows = 0;
  for (let s = 0; s < S; s++) {
    const base = s * n; let prev = NaN;
    jumpFlag.fill(0);
    for (const r of sorted[s]) {
      const c = Number(r[4]), v = Number(r[5]);
      if (!(c > 0)) continue; // 값 없는 줄은 없는 줄로
      const i = at.get(String(r[0]));
      if (i !== undefined) {
        close[base + i] = c; hasRow[base + i] = 1; traded[base + i] = v > 0 ? 1 : 0;
        if (prev > 0 && Math.abs(c / prev - 1) > JUMP) { jumpFlag[i] = 1; jumpRows++; }
      }
      prev = c;
    }
    let last = NaN, cum = 0;
    for (let t = 0; t < n; t++) { const j = base + t; if (hasRow[j]) last = close[j]; else close[j] = last; cum += jumpFlag[t]; jumpCum[j] = cum; }
  }
  sorted.length = 0;
  B = null; // 경로로 읽었으면 여기서 놓음(부른 쪽이 준 객체는 부른 쪽 것)

  // ⑤ 코스피
  const kSources = opts.kospi ? [{name: '(opts.kospi)', rows: kospiRows(opts.kospi)}]
    : (opts.kospiFiles ?? DEFAULT_KOSPI).map(f => { const p = path.resolve(ROOT, f); return {name: f, rows: fs.existsSync(p) ? kospiRows(JSON.parse(fs.readFileSync(p, 'utf8'))) : []}; });
  const K = mergeKospi(kSources);
  const kc = new Float64Array(n).fill(NaN), ks = new Int8Array(n).fill(-1);
  days.forEach((d, i) => { if (K.map.has(d)) { kc[i] = K.map.get(d); ks[i] = K.src.get(d); } });
  const kMissing = days.filter((d, i) => !(kc[i] > 0));
  // 달력 안쪽인데 모음 달력에 없는 코스피 날(두 달력이 어긋나는지)
  const kExtra = [...K.map.keys()].filter(d => d >= (days[0] ?? '9') && d <= (days.at(-1) ?? '0') && !days.includes(d));

  const codeAt = new Map(codes.map((c, i) => [c, i]));
  const endOf = (k, hold) => {
    if (!Number.isInteger(k) || k < 0 || k >= n) return -1;
    const e = hold === 'end' ? n - 1 : Number.isInteger(hold) && hold >= 1 ? k + hold : -1;
    return e > k && e < n ? e : -1;
  };
  const median = (a, m) => (m ? (m % 2 ? a[(m - 1) / 2] : (a[m / 2 - 1] + a[m / 2]) / 2) : null);

  const cache = new Map();
  function core(k, e) {
    const key = k * n + e;
    if (cache.has(key)) return cache.get(key);
    const rs = new Float64Array(S), ws = new Float64Array(S), cs = new Float64Array(S);
    let m = 0, mc = 0, sum = 0, wsum = 0, csum = 0, up = 0, down = 0, flat = 0, stale = 0, jump = 0, halted = 0;
    for (let s = 0; s < S; s++) {
      const j0 = s * n + k, j1 = s * n + e;
      if (!traded[j0]) { if (hasRow[j0]) halted++; continue; }
      const r = close[j1] / close[j0] - 1;
      const st = !traded[j1], jp = jumpCum[j1] - jumpCum[j0] > 0;
      rs[m] = r; sum += r; const w = st ? -1 : r; ws[m] = w; wsum += w; m++;
      if (r > 0) up++; else if (r < 0) down++; else flat++;
      if (st) stale++;
      if (jp) jump++; else { cs[mc++] = r; csum += r; }
    }
    const R = rs.subarray(0, m).sort(), W = ws.subarray(0, m).sort(), C = cs.subarray(0, mc).sort();
    const out = {k, e, from: days[k], to: days[e], n: m, median: median(R, m), mean: m ? sum / m : null, up, down, flat, stale,
      worst: {median: median(W, m), mean: m ? wsum / m : null}, jump, clean: {n: mc, median: median(C, mc), mean: mc ? csum / mc : null}, haltedAtStart: halted};
    const v = {out, R};
    cache.set(key, v);
    return v;
  }

  const bl = {
    version: BASELINE_VERSION, days, codes, n,
    indexOf: d => { const i = at.get(String(d).replaceAll('-', '')); return i === undefined ? -1 : i; },
    endOf,
    tradable: (code, k) => { const s = codeAt.get(code); return s !== undefined && Number.isInteger(k) && k >= 0 && k < n && traded[s * n + k] === 1; },
    allCompanies(k, hold) { const e = endOf(k, hold); return e < 0 ? null : {hold, ...core(k, e).out}; },
    beats(k, hold, r) {
      const e = endOf(k, hold); if (e < 0 || !Number.isFinite(r)) return null;
      const {R} = core(k, e), m = R.length; if (!m) return null;
      let lo = 0, hi = m; while (lo < hi) { const mid = (lo + hi) >> 1; if (R[mid] < r) lo = mid + 1; else hi = mid; }
      const below = lo; hi = m; while (lo < hi) { const mid = (lo + hi) >> 1; if (R[mid] <= r) lo = mid + 1; else hi = mid; }
      const equal = lo - below;
      return {n: m, below, equal, above: m - below - equal, share: (below + equal / 2) / m};
    },
    kospi(k, hold) {
      const e = endOf(k, hold);
      if (e < 0) return {k, hold, e: -1, from: days[k] ?? null, to: null, c0: null, c1: null, r: null, src: null, why: '끝 날이 자료 밖'};
      const c0 = kc[k] > 0 ? kc[k] : null, c1 = kc[e] > 0 ? kc[e] : null;
      const srcName = i => (i >= 0 ? K.info[i].file : null);
      const o = {k, hold, e, from: days[k], to: days[e], c0, c1, r: c0 && c1 ? c1 / c0 - 1 : null, src: [srcName(ks[k]), srcName(ks[e])]};
      if (o.r === null) o.why = '코스피 값 없음 ' + [c0 ? null : days[k], c1 ? null : days[e]].filter(Boolean).join(' · ');
      return o;
    },
    stockReturn(code, k, hold) {
      const s = codeAt.get(code), e = endOf(k, hold);
      if (s === undefined || e < 0 || !traded[s * n + k]) return null;
      const j0 = s * n + k, j1 = s * n + e;
      return {code, k, e, from: days[k], to: days[e], c0: close[j0], c1: close[j1], r: close[j1] / close[j0] - 1, stale: !traded[j1], jump: jumpCum[j1] - jumpCum[j0] > 0};
    },
    meta: null,
  };
  bl.meta = {
    version: BASELINE_VERSION,
    bundle: bundleFile ? path.relative(ROOT, bundleFile) : '(넘겨받은 모음 객체)',
    bundleSha256: bundleFile && opts.sha !== false ? crypto.createHash('sha256').update(fs.readFileSync(bundleFile)).digest('hex') : null,
    calendar: {n, from: days[0] ?? null, to: days.at(-1) ?? null, rule: '회사 주식 절반 넘게 줄이 있는 첫 날부터 뒤의 모든 일봉 날'},
    companies: {listed: totalListed, common: S, commonNoRows, rule: 'lib/atlas11/universe.mjs kindOf = null(우선주 · 스팩 · 리츠 · 펀드 · ETF · ETN 뺌) · 일봉 줄 있음'},
    universeRule: '시작 날 k 에 일봉 줄이 있고 거래량 > 0 인 회사 주식 모두 — k 날 줄만 보고 정함 · 뒤에 멈춘 곳도 듦',
    valueRule: '시작 = k 날 종가 · 끝 = e 날 줄 종가(거래 없으면 네이버가 실은 마지막 종가 = stale · 줄 없으면 앞 마지막 줄) · worst = stale 을 −100%',
    jumpRule: `종가가 바로 앞 줄보다 ${JUMP * 100}% 넘게 바뀐 날이 (k, e] 에 있으면 jump(거래소 하루 값 폭 ±30% 밖 = 고쳐지지 않은 값) · 모든 셈에 넣고 clean 만 뺌`,
    jumpRows,
    survivorship: '모음은 2026-10-14 에 상장돼 있던 목록으로 받은 것 — 2023-04-28 ~ 2026-10-13 사이 상장폐지된 회사는 없음(수 · 값 모름) · 그래서 모든 회사 값은 실제보다 좋게 나올 수 있음(쪽은 확실 · 크기는 모름) · 거래가 멈춘 채 아직 상장된 곳은 듦(stale)',
    kospi: {sources: K.info, covered: n - kMissing.length, missing: kMissing, extraDays: kExtra.length,
      rule: '첫 파일이 바탕 · 다음 파일은 겹치는 날이 모두 같을 때만 빈 날을 채움 · 없는 날은 null(앞 값으로 채우지 않음)'},
    buildMs: Date.now() - t0,
  };
  LAST = bl;
  return bl;
}

// 바로 돌리기 — 한 날 값을 보여 줌(확인용)
if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const arg = (k, d) => (process.argv.includes(k) ? process.argv[process.argv.indexOf(k) + 1] : d);
  const bl = loadBaseline(arg('--bundle', DEFAULT_BUNDLE));
  const k = Number(arg('--k', 250)), holdArg = arg('--hold', '20'), hold = holdArg === 'end' ? 'end' : Number(holdArg);
  console.log(JSON.stringify({meta: {...bl.meta, kospi: {...bl.meta.kospi, sources: bl.meta.kospi.sources.map(s => ({file: s.file, n: s.n, from: s.from, to: s.to, shared: s.shared, disagree: s.disagree, used: s.used, added: s.added}))}}, all: bl.allCompanies(k, hold), kospi: bl.kospi(k, hold)}, null, 1));
}
