#!/usr/bin/env node
// 달력 탭 따로 세기(tr-v1 · 사장님 2026-10-15 16:34 「몇일후 어떻게 됐는지도 확인」 · 20:51 「추적하는 시스템」 · 21:24 「가 로 해」 · 규칙 69)
//   surgetr.py(파이썬)는 열지 않고 결정표 v3(docs/design/surge-2026-10-15/cal-merge-v3.md) 1 ~ 9절만 보고
//   다른 길(노드 · 모음 원본 일봉 + 이어 받은 일봉 + 기록에서 처음부터)로 다시 세어 surgetr.json · surgetr-case.json 과 칸마다 맞댐
//   — 허용 오차 없음 · 틀린 것이 하나라도 있으면 끝 코드 1
//   일봉 읽기 · 한 날 셈(Day: clean · liquid · ratio · 차례 E)은 surge_verify.mjs 와 같은 길(surge.py load · provisional_of · Day 와 이미 맞대 본 것)
//   쓰는 법(저장소 맨 위에서): node scripts/atlas11/t365/surgetr_verify.mjs <자료 폴더(surgetr.json · surgetr-case.json · mkt.json)> <기록 json | -> <결과 json>
//     기록 json = {records: [{asOf, provisional, kst, slot, bands: {b10: {members: [{c, n, r5}]} …}} …]}(셈이 받은 그대로 · 때 차례)
//     - 이면 reports/atlas11/t365/surge/*.json(이름 차례 · payload.schema 'atlas-new-surge-1' · payload.bands.version 'sb-v1' 만)
//   환경 변수: ATLAS_T365_CLOSES(이어 받은 일봉 폴더 · 없어도 됨) · ATLAS_D365_DIR(그 업데이트 후보 표 폴더 — proposal.json · 없으면 universe.json dir)
//   맞대는 것: surgetr.json 의 kst(만든 때) 밖 모든 칸(slot 은 글 또는 null 인지만) · 칸 이름
//             · surgetr-case.json asOf · 번호 모음 · 파일마다 p · q · z · ev · mk · 칸 이름 · 크기 문(150,000 · 400,000 바이트)
//   결정표가 두 뜻으로 읽히는 곳은 「// 결정표 해석:」 줄에 고른 뜻을 적음
import fs from 'node:fs';
import zlib from 'node:zlib';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../..');
const [dataArg, recArg, outArg] = process.argv.slice(2);
const dataDir = path.resolve(ROOT, dataArg ?? 'site/atlas/data');
const recFile = recArg && recArg !== '-' ? path.resolve(ROOT, recArg) : null;
const outFile = path.resolve(ROOT, outArg ?? 'reports/atlas11/verify/atlas-new-surgetr-latest.json');
const J = f => JSON.parse(fs.readFileSync(f, 'utf8'));
const cmp = (a, b) => (a < b ? -1 : a > b ? 1 : 0);
const iso = d => `${d.slice(0, 4)}-${d.slice(4, 6)}-${d.slice(6, 8)}`;
// 맞대기 — 열쇠 차례는 따지지 않음(값만) · −0 과 0 은 같게 봄(JSON 글이 둘 다 0) · 빠진 칸은 「(없음)」
const canon = x => JSON.stringify(x, (k, v) => (v && typeof v === 'object' && !Array.isArray(v) ? Object.fromEntries(Object.keys(v).sort().map(q => [q, v[q]])) : v));
const bad = []; let checks = 0;
const same = (got, want, what) => { checks++; if (canon(got) !== canon(want)) bad.push({what, got: got === undefined ? '(없음)' : got, want: want === undefined ? '(없음)' : want}); };
const truth = (ok, what, got, want) => { checks++; if (!ok) bad.push({what, got, want}); };
// 긴 목록 — 틀리면 처음 다른 칸 하나만(길이와 함께) 적음
const sameArr = (got, want, what) => {
  checks++;
  if (canon(got) === canon(want)) return;
  if (!Array.isArray(got)) { bad.push({what, got: got === undefined ? '(없음)' : got, want}); return; }
  let i = 0; while (i < Math.max(got.length, want.length) && canon(got[i]) === canon(want[i])) i++;
  bad.push({what: `${what}[${i}] (길이 ${got.length} · ${want.length})`, got: got[i] === undefined ? '(없음)' : got[i], want: want[i] === undefined ? '(없음)' : want[i]});
};

// ── 결정표 숫자(1 ~ 9절) ──
const SCHEMA = 'atlas-new-surgetr-1', VERSION = 'tr-v1';
const SEED = {from: '2026-09-15', to: '2026-10-14'}; // 1절 되짚음(사장님 (가))
const CAP = 36;          // 2절 씨앗 날 칸마다 36곳까지
const OPEN_MAX = 60;     // 3절 열림 = idx(Ldone) − idx(d0) ≤ 60
const WARN_DAYS = 25;    // 6절 조심 = d0+1 … min(d0+25, Ldone)
const JUMPY = 35;        // 6절 jumpy = 하루 35% 넘게
const STAY = 1.10;       // 5절 ratio < 1.10 이면 'x'
const BANDS = [['b10', 1.10, 1.20, '1'], ['b20', 1.20, 1.30, '2'], ['b30', 1.30, 1.40, '3'], ['b40', 1.40, null, '4']]; // 1절 칸 · 글자
const SIZE_MAIN = 150000, SIZE_CASE = 400000; // 9절 크기 문(압축 전 바이트)
// Day 숫자 = surge.py CFG(hist 20 · jump 35 · liq 1억 · idleDays 61 · idleMax 13) — surge_verify.mjs 와 같음
const HIST = 20, JUMP = 35, LIQ = 1e8, IDLE_MAX = 13;

// rN — 가장 짧은 10진 글(노드 String = 파이썬 repr 와 같은 숫자 글)에서 소수 n 자리로 · 끝 5 는 0 에서 먼 쪽(Decimal ROUND_HALF_UP)
//      지수 꼴(1e-7 · 1.5e+21)도 글로 풂 · toFixed(두 진수 값을 반올림)는 안 씀 · −0 은 0(4절)
function rN(x, n) {
  if (x == null || !Number.isFinite(x)) return null;
  let s = String(x), neg = false;
  if (s[0] === '-') { neg = true; s = s.slice(1); }
  const [mant, ex] = s.split(/e/i);
  const [ip, fp = ''] = mant.split('.');
  const digits = (ip + fp).replace(/^0+/, '');
  const sh = (ex ? parseInt(ex, 10) : 0) - fp.length + n; // 값 × 10^n = digits × 10^sh
  let q = 0n;
  if (digits) {
    if (sh >= 0) q = BigInt(digits) * 10n ** BigInt(sh);
    else if (-sh <= digits.length) { const cut = digits.length + sh; q = BigInt(digits.slice(0, cut) || '0') + (digits[cut] >= '5' ? 1n : 0n); }
  }
  if (q === 0n) return 0;
  const qs = q.toString().padStart(n + 1, '0');
  return Number(`${neg ? '-' : ''}${qs.slice(0, -n)}.${qs.slice(-n)}`);
}
const r1 = x => rN(x, 1), r2 = x => rN(x, 2);
// 가운데값 — 짝수면 가운데 둘 (a + b) / 2(7절)
const median = xs => { if (!xs.length) return null; const s = [...xs].sort((a, b) => a - b), h = s.length >> 1; return s.length % 2 ? s[h] : (s[h - 1] + s[h]) / 2; };
// 서울 때
const seoul = at => { const t = Date.parse(at); if (!Number.isFinite(t)) return null; const s = new Date(t + 9 * 3600e3).toISOString(); return {day: s.slice(0, 10), hour: +s.slice(11, 13), text: `${s.slice(0, 10)} ${s.slice(11, 16)}`}; };

// ── 끝내기 — 결과 파일 + 마지막 줄 요약 json · 틀림이 있으면 끝 코드 1 ──
const finish = () => {
  const res = {ok: bad.length === 0, checks, bad, seen: finish.seen ?? null};
  fs.mkdirSync(path.dirname(outFile), {recursive: true}); fs.writeFileSync(outFile, JSON.stringify(res, null, 1) + '\n');
  const sn = finish.seen ?? {};
  console.log(JSON.stringify({ok: bad.length === 0, checks, bad: bad.length, asOf: sn.asOf ?? null, last: sn.last ?? null, cases: sn.cases ?? null, first: bad.slice(0, 3)}));
  process.exit(bad.length ? 1 : 0);
};

// ── 읽기 ── 두 공개 파일 · mkt.json 이 없으면(셈이 멈춤 등) 틀림으로 적고 끝 코드 1
const F_MAIN = path.join(dataDir, 'surgetr.json'), F_CASE = path.join(dataDir, 'surgetr-case.json'), F_MKT = path.join(dataDir, 'mkt.json');
for (const f of [F_MAIN, F_CASE, F_MKT]) if (!fs.existsSync(f)) truth(false, `${path.basename(f)} 없음`, null, f);
if (bad.length) finish();
const G = J(F_MAIN), GC = J(F_CASE);
const MK = J(F_MKT).companies ?? {};

// ── 1절 재료 — 일봉(surge_verify.mjs 0절과 같은 길 = surge.py load) ──
// 회사 = 후보 표(picked + outside) 가운데 보통주(nc 아님) · 번호 문자열 차례
const ACT = J(path.join(ROOT, 'scripts/atlas11/t365/universe.json'));
const pro = J(path.join(path.resolve(ROOT, process.env.ATLAS_D365_DIR || ACT.dir), 'proposal.json'));
const rowOf = new Map();
for (const r of [...(pro.picked ?? []), ...(pro.outside ?? [])]) if (!r.nc && !rowOf.has(r.code)) rowOf.set(r.code, r);
const ALLC = [...rowOf.keys()].sort(cmp), NC = ALLC.length, IX = new Map(ALLC.map((c, j) => [c, j]));
// 일봉 = 모음 fchart(종가 > 0) + 이어 받은 일봉(daese.merge 규칙: 모음 마지막 날 뒤만 · 같은 날은 나중 파일 · 모음 안 날 값이 0.5% 넘게 다르면 그 회사는 그 파일에서 안 받음)
const bundle = JSON.parse(zlib.gunzipSync(fs.readFileSync(path.resolve(ROOT, ACT.bundle))).toString('utf8'));
const base = new Map(ALLC.map(c => [c, (bundle.stocks?.[c]?.fchart?.rows ?? []).filter(r => r[4] && r[4] > 0)]));
let blast = ''; for (const rs of base.values()) for (const r of rs) if (r[0] > blast) blast = r[0];
const bmap = new Map(ALLC.map(c => [c, new Map(base.get(c).map(r => [r[0], r[4]]))]));
const add = new Map(ALLC.map(c => [c, new Map()]));
const CLOSES = process.env.ATLAS_T365_CLOSES;
let lastFile = null, nFiles = 0;
if (CLOSES && fs.existsSync(CLOSES) && fs.statSync(CLOSES).isDirectory()) {
  for (const fn of fs.readdirSync(CLOSES).filter(f => f.endsWith('.json.gz')).sort()) {
    const snap = JSON.parse(zlib.gunzipSync(fs.readFileSync(path.join(CLOSES, fn))).toString('utf8'));
    if (!['atlas-t365-closes-1', 'atlas-t365-closes-2'].includes(snap.schema)) continue;
    nFiles++;
    for (const [c, rs] of Object.entries(snap.rows ?? {})) {
      const bm = bmap.get(c); if (!bm) continue;
      if (rs.some(x => x[0] <= blast && bm.has(x[0]) && x[1] && Math.abs(x[1] / bm.get(x[0]) - 1) > 0.005)) continue;
      for (const x of rs) if (x[0] > blast && x[1] && x[1] > 0) { add.get(c).set(x[0], [x[1], x.length > 2 ? x[2] : null]); lastFile = {file: fn, startedAt: snap.startedAt ?? null}; }
    }
  }
}
// 거래일 달력 = 거래소 달력 ∪ (후보 절반 넘게 종가가 있는 날 가운데 달력 끝 뒤 날) · 마지막 날 = 종가 줄이 하나라도 있는 곳 절반 넘게 종가가 있는 마지막 날(daese.pick_day)
const calSessions = [...new Set([...J(path.join(ROOT, 'public/data/input.json')).calendar.sessions, ...(fs.existsSync(path.join(ROOT, 'public/data/rolling-calendar.json')) ? J(path.join(ROOT, 'public/data/rolling-calendar.json')).sessions ?? [] : [])])].sort(cmp);
const withRows = ALLC.filter(c => base.get(c).length + add.get(c).size > 0);
const cnt = new Map(); const tick = d => cnt.set(d, (cnt.get(d) ?? 0) + 1);
for (const c of withRows) { for (const r of base.get(c)) tick(iso(r[0])); for (const d of add.get(c).keys()) tick(iso(d)); }
const fullDays = [...cnt].filter(([, n]) => n > withRows.length / 2).map(([d]) => d).sort(cmp);
const ext = calSessions.length ? [...new Set([...calSessions, ...fullDays.filter(d => d > calSessions.at(-1))])].sort(cmp) : fullDays;
const extSet = new Set(ext), good = fullDays.filter(d => extSet.has(d));
if (!good.length) { truth(false, '1절 후보 절반 넘게 종가가 있는 날이 없음(파이썬은 멈춰야 함)', G.asOf ?? null, null); finish(); }
const L = good.at(-1), D = ext.filter(d => d <= L), K = D.length - 1, tix = new Map(D.map((d, t) => [d, t]));
// C[j][t] = 종가 · V[j][t] = 거래량(없으면 null · 0 은 0) · 달력에 없는 날 줄은 버림
const C = [], V = [];
for (const c of ALLC) {
  const cc = new Array(K + 1).fill(null), vv = new Array(K + 1).fill(null);
  for (const r of base.get(c)) { const t = tix.get(iso(r[0])); if (t !== undefined) { cc[t] = r[4]; vv[t] = r[5] ?? null; } }
  for (const [d, [v, vol]] of [...add.get(c)].sort((a, b) => cmp(a[0], b[0]))) { const t = tix.get(iso(d)); if (t !== undefined) { cc[t] = v; vv[t] = vol ?? null; } }
  C.push(cc); V.push(vv);
}
// provisional = surge.py provisional_of — 이어 받은 마지막 파일의 startedAt(서울) 날 = L · 시 < 20 · L > 모음 마지막 날
const blastIso = blast ? iso(blast) : '', ls = lastFile?.startedAt ? seoul(lastFile.startedAt) : null;
const PROV = !!(ls && ls.day === L && ls.hour < 20 && L > blastIso);
// Ldone = provisional 이면 L 앞 거래일 · 아니면 L
const LD = PROV ? K - 1 : K, Ldone = D[LD] ?? null;
if (LD < 0) { truth(false, '1절 Ldone 없음(거래일이 하루뿐)', G.last ?? null, null); finish(); }

// ── 1절 Day(t) — surge.py Day(C, V, cnt, k) 와 같은 셈(surge_verify.mjs dayCalc 와 같은 길) ──
//   clean = 까닭(new · gap · novol · jump · idle) 없음 · liquid = clean 이고 평소 거래대금 ≥ 1억 · ratio = C[k] ÷ C[k−5] · E = liquid 를 ratio 큰 → liq 큰 → 번호 작은
const cumC = C.map(cc => { const a = new Int32Array(K + 1); let s = 0; for (let t = 0; t <= K; t++) { if (cc[t] != null) s++; a[t] = s; } return a; });
const dayCache = new Map();
function Day(k) {
  if (dayCache.has(k)) return dayCache.get(k);
  const R = new Array(NC).fill(null), liq = new Array(NC).fill(null), clean = new Array(NC).fill(false), liquid = new Array(NC).fill(false);
  for (let j = 0; j < NC; j++) {
    const c = C[j], v = V[j];
    // 결정표 해석: 6칸 창(k−5 … k)이 D 앞으로 넘치는 날(k < 5)은 셀 수 없음(clean 아님) — 씨앗 · 기록 날은 모두 D 한참 뒤라 실제로는 안 생김
    if (k - 5 < 0) continue;
    if (c[k] != null && c[k - 5] != null) R[j] = c[k] / c[k - 5];
    const hist = k - 6 >= 0 ? cumC[j][k - 6] : 0; // 5거래일 전 날 앞(0 … k−6) 종가 있는 날 수
    let ok = hist >= HIST;                                                                                        // new
    if (ok) for (let t = k - 5; t <= k; t++) if (c[t] == null) { ok = false; break; }                             // gap
    if (ok) for (let t = k - 5; t <= k; t++) if (v[t] == null || v[t] === 0) { ok = false; break; }               // novol
    if (ok) for (let t = k - 4; t <= k; t++) if (Math.abs(c[t] - c[t - 1]) * 100 > c[t - 1] * JUMP) { ok = false; break; } // jump
    if (ok) { let z = 0; for (let t = Math.max(0, k - 66); t <= k - 6; t++) if (v[t] === 0) z++; if (z > IDLE_MAX) ok = false; } // idle
    clean[j] = ok;
    if (ok) {
      const xs = []; for (let t = Math.max(0, k - 25); t <= k - 6; t++) if (c[t] != null && v[t] != null) xs.push(c[t] * v[t]);
      liq[j] = median(xs);
      liquid[j] = liq[j] != null && liq[j] >= LIQ;
    }
  }
  const E = []; for (let j = 0; j < NC; j++) if (liquid[j]) E.push(j);
  E.sort((a, b) => (R[a] !== R[b] ? (R[a] > R[b] ? -1 : 1) : liq[a] !== liq[b] ? (liq[a] > liq[b] ? -1 : 1) : a - b));
  const X = {k, R, liq, clean, liquid, E};
  dayCache.set(k, X);
  return X;
}
const letterOf = r => { for (const [, lo, hi, l] of BANDS) if (r >= lo && (hi === null || r < hi)) return l; return null; };
// 5절 q(t) — '?'(clean 아님) · 'x'(liquid 아님 또는 ratio < 1.10) · 아니면 칸 글자 '1' ~ '4'(36자리 다툼은 안 봄)
// 결정표 해석: 회사 목록(allc)에 없는 번호(기록에만 있는 곳)는 Day 값이 없으니 날마다 '?'
const qOf = (j, t) => {
  if (j === undefined) return '?';
  const X = Day(t);
  if (!X.clean[j]) return '?';
  if (!X.liquid[j] || X.R[j] < STAY) return 'x';
  return letterOf(X.R[j]);
};

// ── 1절 기록 ──
let RAW = [];
if (recFile) {
  if (!fs.existsSync(recFile)) { truth(false, '기록 json 없음', recFile, '있음'); finish(); }
  const x = J(recFile);
  RAW = Array.isArray(x?.records) ? x.records : [];
  truth(Array.isArray(x?.records), '기록 json 에 records 목록이 있음', typeof x?.records, 'array');
} else {
  const dir = path.join(ROOT, 'reports/atlas11/t365/surge');
  if (fs.existsSync(dir)) for (const fn of fs.readdirSync(dir).filter(f => f.endsWith('.json')).sort()) {
    let r; try { r = J(path.join(dir, fn)); } catch { continue; }
    const p = r?.payload;
    if (p && p.schema === 'atlas-new-surge-1' && p.bands?.version === 'sb-v1') RAW.push({asOf: p.asOf, provisional: p.provisional, kst: p.kst, slot: p.slot, bands: p.bands});
  }
}
// asOf 가 D 에 없는 기록은 쓰지 않음
const RECS = RAW.filter(r => r && typeof r.asOf === 'string' && tix.has(r.asOf));
const recByDay = new Map(); for (const r of RECS) { if (!recByDay.has(r.asOf)) recByDay.set(r.asOf, []); recByDay.get(r.asOf).push(r); }
const recDays = [...recByDay.keys()].sort(cmp);
const firstRec = recDays[0] ?? null;
// 이름(9절): mkt.json companies[c].n · 없으면 기록의 n · 없으면 번호
const recName = new Map(); for (const r of RECS) for (const [b] of BANDS) for (const m of r.bands?.[b]?.members ?? []) if (m && m.c != null && m.n != null && !recName.has(m.c)) recName.set(m.c, m.n);
// 결정표 해석: 「기록의 n」 = 그 파일을 연 기록 줄의 n · 그것도 없으면(씨앗으로 연 파일) 쓰인 기록 가운데 처음 나온 그 번호의 n
const nameOf = (c, openN) => MK[c]?.n ?? openN ?? recName.get(c) ?? c;

// ── 1 · 2절 씨앗 날 · 명단 M(t) ──
const seedDays = D.filter(d => d >= SEED.from && d <= SEED.to), seedSet = new Set(seedDays);
const firstSeed = seedDays[0] ?? null;
// 씨앗 날 명단 — 칸마다 Day(t).E 차례로 훑어 ratio 가 그 칸에 드는 곳을 앞에서부터 36곳까지 · r5 = r2((ratio − 1) × 100) · kst null · re true
const seedRoster = ti => {
  const X = Day(ti), rows = [];
  for (const [, lo, hi, l] of BANDS) {
    let n = 0;
    for (const j of X.E) { if (n >= CAP) break; const r = X.R[j]; if (r >= lo && (hi === null || r < hi)) { rows.push({c: ALLC[j], b: l, r5: r2((r - 1) * 100), kst: null, re: true, n: null}); n++; } }
  }
  return rows;
};
// 기록 날 명단 — 그날 기록들을 이름 차례로 · 칸 b10 → b40 · 줄 차례로 훑어 처음 나온 것의 b · r5 · kst · re false
const recRoster = recs => {
  const seen = new Set(), rows = [];
  for (const rec of recs) for (const [b, , , l] of BANDS) for (const m of rec.bands?.[b]?.members ?? []) {
    if (!m || m.c == null || seen.has(m.c)) continue;
    seen.add(m.c);
    rows.push({c: m.c, b: l, r5: m.r5 ?? null, kst: rec.kst ?? null, re: false, n: m.n ?? null});
  }
  return rows;
};

// ── 3절 파일 — 명단 있는 날을 차례로 훑어 c ∈ M(t) · c ∉ 앞 명단 · c 의 열린 파일이 없으면 엶 ──
// 결정표 해석: 명단 있는 날 = 씨앗 날 ∪ 기록 날(D 안) · 첫 씨앗 날의 앞 명단 = D 바로 앞 거래일의 씨앗 셈 명단(그 앞 날에 기록이 있어도)
//             · 첫 씨앗 날보다 앞선 기록 날(지금은 없음)은 그 앞 명단 있는 날 명단을 · 그런 날이 없으면 빈 앞 명단
const rosterDays = [...new Set([...seedDays, ...recDays])].sort(cmp);
const files = [], latest = new Map(); // latest: 번호 → 그 번호의 마지막 파일
let prevCodes = new Set();
for (const d of rosterDays) {
  const ti = tix.get(d);
  const M = recByDay.has(d) ? recRoster(recByDay.get(d)) : seedRoster(ti);
  if (d === firstSeed) prevCodes = ti >= 1 ? new Set(seedRoster(ti - 1).map(r => r.c)) : new Set();
  for (const row of M) {
    if (prevCodes.has(row.c)) continue;
    const lf = latest.get(row.c);
    if (lf && ti - lf.d0i <= OPEN_MAX) continue; // 그날 열린 파일이 있음(닫힘 = idx(t) − idx(d0) > 60)
    const F = {c: row.c, d0: d, d0i: ti, b0: row.b, r5: row.r5, kst: row.kst, re: row.re, openN: row.n};
    files.push(F); latest.set(row.c, F);
  }
  prevCodes = new Set(M.map(r => r.c));
}
// 공개 = 열린 파일(idx(Ldone) − idx(d0) ≤ 60)
const PUB = files.filter(F => LD - F.d0i <= OPEN_MAX);

// ── 4 · 5 · 6 · 7절 파일마다 ──
// 7절 같은 날들 모든 회사 — d0 마다 한 번(S · U · 가운데값 mk)
const mkCache = new Map();
const mkOf = d0i => {
  if (mkCache.has(d0i)) return mkCache.get(d0i);
  let S = 0, U = 0; const xs = [];
  for (let j = 0; j < NC; j++) { const a = C[j][d0i], b = C[j][K]; if (a != null && b != null) { S++; if (b > a) U++; xs.push((b / a - 1) * 100); } }
  const o = {S, U, mk: d0i === K ? null : r1(median(xs))};
  mkCache.set(d0i, o);
  return o;
};
for (const F of PUB) {
  const j = IX.get(F.c), cc = j === undefined ? null : C[j], vv = j === undefined ? null : V[j];
  const Cv = t => (cc && t >= 0 && t <= K && cc[t] != null ? cc[t] : null);
  const Vv = t => (vv && t >= 0 && t <= K && vv[t] != null ? vv[t] : null);
  const d0i = F.d0i, B = Cv(d0i);
  // 4절 p[i] (i = 0 … idx(L) − idx(d0)) = r1((C[t] ÷ B − 1) × 100) · B 가 없으면 모두 null · p[0] = 0
  F.p = []; for (let t = d0i; t <= K; t++) { const ct = Cv(t); F.p.push(B == null || ct == null ? null : t === d0i ? 0 : r1((ct / B - 1) * 100)); }
  // 결정표 해석: z(거래량 0 인 날의 i)는 p 와 같은 범위(i = 0 … idx(L) − idx(d0) · 장 중 L 포함) · B 가 없어도 셈(%가 아님)
  F.z = []; for (let t = d0i; t <= K; t++) if (Vv(t) === 0) F.z.push(t - d0i);
  // v = p[마지막] · d0 == L 이면 null
  F.v = d0i === K ? null : F.p[K - d0i];
  // 5절 날마다 제 칸 · 사건(끝난 날만 · t = d0 … Ldone · d0 > Ldone 이면 칸 · 사건 없음)
  const bandEv = [];
  let qs = '';
  if (d0i <= LD) {
    for (let t = d0i; t <= LD; t++) qs += qOf(j, t);
    if (qs[0] === 'x') bandEv.push([D[d0i], 'out', null]);
    for (let t = d0i + 1; t <= LD; t++) {
      const qt = qs[t - d0i];
      if (qt === '?') continue;
      let pq = null; for (let u = t - 1; u >= d0i; u--) if (qs[u - d0i] !== '?') { pq = qs[u - d0i]; break; } // 가장 늦은 '?' 아닌 q
      if (pq === null) continue;
      if (pq !== 'x' && qt !== 'x' && pq !== qt) bandEv.push([D[t], 'mv', qt]);
      else if (pq !== 'x' && qt === 'x') bandEv.push([D[t], 'out', null]);
      else if (pq === 'x' && qt !== 'x') bandEv.push([D[t], 're', qt]);
    }
  }
  F.q = qs;
  // 6절 상태 · 금빛 · 조심(끝난 종가로만 · d0 < Ldone 인 파일만)
  // 결정표 해석: 6절 머리 「d0 < Ldone 인 파일만」을 글자 그대로 — d0 ≥ Ldone 파일은 f · h · x = 0 · 금빛 없음 · 조심 없음(st 는 모든 파일)
  F.f = 0; F.h = 0; F.x = 0; F.halfNew = false; F.haltNew = false;
  let warnT = null;
  if (d0i < LD) {
    let top = null; const half = [];
    for (let t = d0i; t <= LD; t++) { const ct = Cv(t); if (ct != null && (top === null || ct > top)) top = ct; half.push(ct != null && top !== null && ct * 2 <= top); }
    const halt = t => Cv(t) != null && Vv(t) === 0;
    let jumpy = false;
    for (let u = d0i + 1; u <= LD; u++) { const a = Cv(u), b = Cv(u - 1); if (a != null && b != null && Math.abs(a - b) * 100 > b * JUMPY) { jumpy = true; break; } }
    const halfL = half[LD - d0i], haltL = halt(LD);
    F.f = halfL ? (jumpy ? 2 : 1) : 0;
    F.h = haltL ? 1 : 0;
    F.x = qs[LD - d0i] === 'x' ? 1 : 0;
    let halfBefore = false; for (let t = d0i + 1; t <= LD - 1; t++) if (half[t - d0i]) { halfBefore = true; break; }
    F.halfNew = halfL && !halfBefore;
    F.haltNew = haltL && (LD === d0i + 1 || !halt(LD - 1));
    // 조심 — d0+1 … min(d0+25, Ldone) 가운데 처음으로 C[t] 가 C[t−14 … t] 가운데 가장 크고(빈 값이 있으면 안 셈) · (C[t] × 10 ≥ C[t−5] × 16 또는 C[t] ≥ C[t−15] × 2)
    // 결정표 해석: 「가장 크고」 = C[t] ≥ 그 15칸의 가장 큰 값(같아도 됨) · D 앞으로 넘치는 칸은 빈 값 · C[t−15] 가 없으면 둘째 조건은 거짓
    for (let t = d0i + 1; t <= Math.min(d0i + WARN_DAYS, LD); t++) {
      const ct = Cv(t); if (ct == null) continue;
      let ok = t - 14 >= 0, mx = -Infinity;
      if (ok) for (let u = t - 14; u <= t; u++) { const cu = Cv(u); if (cu == null) { ok = false; break; } if (cu > mx) mx = cu; }
      if (!ok || !(ct >= mx)) continue;
      const c5 = Cv(t - 5), c15 = Cv(t - 15);
      if ((c5 != null && ct * 10 >= c5 * 16) || (c15 != null && ct >= c15 * 2)) { warnT = t; break; }
    }
  }
  // 결정표 해석: ev 차례 = 날 오름 · 같은 날이면 칸 사건(out · mv · re) 먼저 · warn 나중
  F.ev = warnT === null ? bandEv : [...bandEv.filter(e => e[0] <= D[warnT]), [D[warnT], 'warn', null], ...bandEv.filter(e => e[0] > D[warnT])];
  F.bandEv = bandEv;
  // 6절 상태 글자 st
  F.st = d0i === K ? 'n' : F.v == null ? 'q' : F.v > 0 ? 'u' : F.v < 0 ? 'd' : 'z';
  F.mk = mkOf(d0i).mk;
  F.name = nameOf(F.c, F.openN);
}
// 공개 파일 차례(cases) = d0 큰 → b0 큰(b40 먼저) → r5 큰 → c 작은
// 결정표 해석: r5 가 null(기록에 r5 가 빠진 줄 — 지금은 없음)이면 가장 작은 것으로 봄
const r5k = x => (x == null ? -Infinity : x);
PUB.sort((a, b) => cmp(b.d0, a.d0) || cmp(b.b0, a.b0) || (r5k(a.r5) !== r5k(b.r5) ? (r5k(a.r5) > r5k(b.r5) ? -1 : 1) : 0) || cmp(a.c, b.c));

// ── 7절 답 한 줄 · 같은 날들 모든 회사 ──
const NOTN = PUB.filter(F => F.st !== 'n');
const N = NOTN.length, A = NOTN.filter(F => F.st === 'u').length, Bn = NOTN.filter(F => F.st === 'd').length, KN = PUB.filter(F => F.st === 'n').length;
// ⌊p ÷ q⌋ — 정수만으로
const fdiv = (p, q) => (p - (p % q)) / q;
// 결정표 해석: N = 0 이면 n10 = null · T = 0 이면 m10 = null
const n10 = N > 0 ? fdiv(20 * A + N, 2 * N) : null;
let U = 0, T = 0; for (const F of NOTN) { const o = mkOf(F.d0i); U += o.U; T += o.S; }
const m10 = T > 0 ? fdiv(20 * U + T, 2 * T) : null;

// ── 6절 새로 생긴 금빛 줄 — halt 먼저 · half 다음 · 한 종목은 한 줄에만(둘 다면 거래 멈춤) ──
const haltF = PUB.filter(F => F.haltNew), halfF = PUB.filter(F => !F.haltNew && F.halfNew);
// 결정표 해석: top 의 v 가 null 인 곳은 가장 큰 것으로 봄(값 있는 곳이 먼저) · 반 토막 줄의 f = top 의 f · 거래 멈춤 줄에는 f 칸 없음
const vk = F => (F.v == null ? Infinity : F.v);
const topOf = fs_ => fs_.reduce((a, b) => (vk(b) < vk(a) || (vk(b) === vk(a) && cmp(b.c, a.c) < 0) ? b : a));
const alerts = [];
const csOf = arr => [...arr].sort((x, y) => ((x.v ?? Infinity) - (y.v ?? Infinity)) || cmp(x.c, y.c)).map(x => x.c); // 결정표 v3 9절 고침(2026-10-15 화면 「새로 생긴 일」 접은 칸): cs = 그 줄 종목 모두(v 작은 → 번호)
if (haltF.length) { const t = topOf(haltF); alerts.push({kind: 'halt', n: haltF.length, top: {c: t.c, n: t.name, v: t.v}, cs: csOf(haltF)}); }
if (halfF.length) { const t = topOf(halfF); alerts.push({kind: 'half', n: halfF.length, top: {c: t.c, n: t.name, v: t.v}, f: t.f, cs: csOf(halfF)}); }

// ── 8절 날짜별 묶음 days(창 = 첫 씨앗 날(없으면 첫 기록 날) … L · 새 날이 앞) ──
const W0 = firstSeed ?? firstRec;
const dates = W0 === null ? [] : D.slice(tix.get(W0), K + 1);
// 결정표 해석: 창 안 모든 날을 싣음(사건이 없는 날도 빈 목록으로) · seed 는 늘 있음(씨앗 날 = SEED 안 D 날이고 그날 기록이 없으면 true · 아니면 false — 맞대 보고 고침)
const days = [...dates].reverse().map(d => {
  const sel = PUB.filter(F => F.d0 === d).map(F => F.c);
  const mv = [], out = [], re = [];
  for (const F of PUB) for (const [ed, kind, l] of F.bandEv) if (ed === d) { if (kind === 'mv') mv.push([F.c, l]); else if (kind === 'out') out.push(F.c); else if (kind === 're') re.push([F.c, l]); }
  mv.sort((a, b) => cmp(a[0], b[0])); out.sort(cmp); re.sort((a, b) => cmp(a[0], b[0]));
  return {d, seed: seedSet.has(d) && !recByDay.has(d), sel, mv, out, re}; // 2026-10-15 맞대 보고 정함(결정표 v3 8절 고침): 「되짚음」 = 그날 명단을 씨앗 셈으로 만든 날(기록이 있는 날은 아님)
});

// ── 9절 공개 파일 둘(만든 때 kst · slot 밖) ──
const cases = PUB.map(F => [F.c, F.name, F.d0, F.b0, F.r5, F.v, F.st, F.h, F.f, F.x, F.re ? 1 : 0, F.re ? null : F.kst]);
// 결정표 해석: 한 번호에 공개 파일이 둘(장 중 · 61거래일 전 파일이 아직 열림 + 오늘 다시 듦 — 지금은 없음)이면 surgetr-case.json 에는 새 파일(cases 앞쪽)
const caseMap = new Map(); let dup = 0;
for (const F of PUB) { if (caseMap.has(F.c)) { dup++; continue; } caseMap.set(F.c, {p: F.p, q: F.q, z: F.z, ev: F.ev, mk: F.mk}); }
const seed = seedDays.length ? {from: SEED.from, to: SEED.to} : null; // 결정표 해석: D 안에 씨앗 날이 하루도 없으면 null
const WANT = {schema: SCHEMA, version: VERSION, asOf: L, last: Ldone, provisional: PROV, seed, first: firstRec, dates, N, a: A, b: Bn, k: KN, n10, m10, U, T, alerts, days, cases};

// ── 맞대기 — surgetr.json ──
same(Object.keys(G ?? {}).sort(), [...Object.keys(WANT), 'kst', 'slot'].sort(), 'surgetr.json 칸 이름');
for (const key of ['schema', 'version', 'asOf', 'last', 'provisional', 'seed', 'first', 'N', 'a', 'b', 'k', 'n10', 'm10', 'U', 'T']) same(G[key], WANT[key], key);
truth(G.slot === null || typeof G.slot === 'string', 'slot 은 글 또는 null', G.slot === undefined ? '(없음)' : G.slot, 'string | null');
sameArr(G.dates, dates, 'dates');
same(G.alerts, alerts, 'alerts');
const gd = Array.isArray(G.days) ? G.days : [];
sameArr(gd.map(x => x?.d), days.map(x => x.d), 'days 날 · 차례');
const gdBy = new Map(gd.filter(x => x && typeof x === 'object').map(x => [x.d, x]));
for (const x of days) {
  const y = gdBy.get(x.d);
  if (!y) { truth(false, `days.${x.d} 없음`, null, x); continue; }
  same(y.seed, x.seed, `days.${x.d}.seed`); sameArr(y.sel, x.sel, `days.${x.d}.sel`); sameArr(y.mv, x.mv, `days.${x.d}.mv`); sameArr(y.out, x.out, `days.${x.d}.out`); sameArr(y.re, x.re, `days.${x.d}.re`);
  same(Object.keys(y).sort(), ['d', 'mv', 'out', 're', 'sel', 'seed'].sort(), `days.${x.d} 칸 이름`);
}
const gcs = Array.isArray(G.cases) ? G.cases : [];
sameArr(gcs.map(x => (Array.isArray(x) ? x[0] : x)), cases.map(x => x[0]), 'cases 번호 · 차례');
const CF = ['c', 'name', 'd0', 'b0', 'r5', 'v', 'st', 'h', 'f', 'x', 're', 'kst'];
const gcBy = new Map(); for (const x of gcs) if (Array.isArray(x) && !gcBy.has(x[0])) gcBy.set(x[0], x);
for (const x of cases) {
  const y = gcBy.get(x[0]);
  if (!y) { truth(false, `cases.${x[0]} 없음`, null, x); continue; }
  same(y.length, x.length, `cases.${x[0]} 칸 수`);
  CF.forEach((f, i) => same(y[i], x[i], `cases.${x[0]}.${f}`));
}
// ── 맞대기 — surgetr-case.json ──
same(Object.keys(GC ?? {}).sort(), ['asOf', 'cases'], 'surgetr-case.json 칸 이름');
same(GC.asOf, L, 'case.asOf');
const gcc = GC.cases && typeof GC.cases === 'object' && !Array.isArray(GC.cases) ? GC.cases : {};
sameArr(Object.keys(gcc).sort(cmp), [...caseMap.keys()].sort(cmp), 'case 번호 모음');
for (const [c, w] of caseMap) {
  const y = gcc[c];
  if (!y || typeof y !== 'object') { truth(false, `case.${c} 없음`, null, w); continue; }
  sameArr(y.p, w.p, `case.${c}.p`); same(y.q, w.q, `case.${c}.q`); sameArr(y.z, w.z, `case.${c}.z`); sameArr(y.ev, w.ev, `case.${c}.ev`); same(y.mk, w.mk, `case.${c}.mk`);
  same(Object.keys(y).sort(), ['ev', 'mk', 'p', 'q', 'z'], `case.${c} 칸 이름`);
}
// ── 9절 크기 문 ──
const sz1 = fs.statSync(F_MAIN).size, sz2 = fs.statSync(F_CASE).size;
truth(sz1 <= SIZE_MAIN, '크기 문 surgetr.json', sz1, `≤ ${SIZE_MAIN}`);
truth(sz2 <= SIZE_CASE, '크기 문 surgetr-case.json', sz2, `≤ ${SIZE_CASE}`);

// 맞대 보기용(사람이 두 셈을 나란히 볼 때만) — ATLAS_SURGETR_VERIFY_DUMP=<파일> 이면 다시 센 두 파일을 그 파일 하나에 적음(kst · slot 은 받은 것 그대로)
if (process.env.ATLAS_SURGETR_VERIFY_DUMP) fs.writeFileSync(path.resolve(process.env.ATLAS_SURGETR_VERIFY_DUMP), JSON.stringify({surgetr: {...WANT, kst: G.kst ?? null, slot: G.slot ?? null}, case: {asOf: L, cases: Object.fromEntries(caseMap)}}) + '\n');
finish.seen = {asOf: L, last: Ldone, provisional: PROV, files: nFiles, lastFile: lastFile?.file ?? null, records: RAW.length, recordsUsed: RECS.length, first: firstRec,
  seedDays: seedDays.length, rosterDays: rosterDays.length, opened: files.length, N, a: A, b: Bn, k: KN, n10, m10, U, T, cases: PUB.length, dup,
  alerts: alerts.map(x => `${x.kind} ${x.n}`), size: [sz1, sz2]};
finish();
