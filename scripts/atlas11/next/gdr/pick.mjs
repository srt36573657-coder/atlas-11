#!/usr/bin/env node
// 고도리 고르는 셈 gdr-v1(사장님 2026-10-17(싱가포르) 17:54 「고도리 만들기 · 한 장 명령문」 명령 7 ~ 11 · 결정표 docs/design/godori-2026-10-17/brief.md · 자료 메모 gdr-data.md)
//   상장된 모든 종목 → 회사 주식(보통주)만 셈 → 먼저 뺌(거래 적음 · 거래 정지 · 관리 종목 = 표시 칸 없어 「?」) → 다섯 문 → 차례 → 한 업종 3곳 · 36곳까지 → 비중 3 · 2.5 · 2 + 쉬는 돈
//   문의 경계는 정수 곱셈(BigInt)으로 정확히 셈(소수 오차 없음) · 값이 없으면 그 문 탈락 · 모자라면 채우지 않음
//   자료: site/atlas/data(mkt.json · days.json · co/<번호>.json) + 모음(scripts/atlas11/t365/universe.json 의 bundle — 거래량) · 둘의 마지막 날이 다르면 둘 다 있는 날(앞선 날)로 모든 문을 셈
//   2026-10-17 21:10 하나로 묶은 명령문 [5] 4 · [6] 2(결정표 덧붙임 brief2.md):
//     gates.json = 회사 주식 모두의 다섯 문 결과(godori-gates-1 · 번호 → [x, g1 … g5] · x 0 안 뺌 · 1 거래 적음 · 2 거래 정지 · 뺀 곳 gN = null ·
//       안 뺀 곳 gN = 1 지남 · 0 못 지남(보이는 값만으로 탈락이 정해짐 포함) · null 쓰는 값이 빠져 셀 수 없음(화면 「?」)) — 문마다 1 의 수가 gdr.json counts 와 다르면 두 파일 모두 안 씀
//     고른 곳마다 wrong = 「틀린다면 이유」 한 줄(wrong-v1 · 위에서부터 처음 맞는 하나 · 경계 · 숫자 모두 반올림 전 값을 정확한 분수로 · 딱 반이면 짝수 쪽 = 파이썬 format(Fraction))
//   쓰는 법: node scripts/atlas11/next/gdr/pick.mjs [--data site/atlas/data] [--bundle <bundle.json.gz>] [--out site/next/data/gdr.json] [--gates <gdr.json 옆 gates.json>] [--check]
//   자료가 없으면 끝 코드 0 · 결과 파일은 그대로(올리기를 막지 않음)
import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';
import {fileURLToPath} from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../../..');
const arg = (k, d) => (process.argv.includes(k) ? process.argv[process.argv.indexOf(k) + 1] : d);
const DATA = path.resolve(ROOT, arg('--data', 'site/atlas/data'));
const OUT = path.resolve(ROOT, arg('--out', 'site/next/data/gdr.json'));
const GATES = path.resolve(ROOT, arg('--gates', path.join(path.dirname(OUT), 'gates.json'))); // 처음 = gdr.json 옆
const CHECK = process.argv.includes('--check');

export const SAYINGS = ['남의 말로 산 주식은 남의 말에 판다', '모르는 주식은 사지 마라', '느낌은 이유가 아니다', '빚으로 산 주식은 잠을 뺏는다', '소문에 팔고 조용할 때 사라',
  '무릎에 사서 어깨에 팔아라', '사기 전에 팔 곳부터 정해라', '손해는 짧게 이익은 길게', '급한 돈은 주식에 넣지 마라', '급한 마음이 가장 비싼 값을 치른다', '달걀을 한 바구니에 담지 마라']; // 사장님 글 그대로(질문 1 ~ 11 차례)
export const RULES = {thin: 1000000000, quietX: 2, hot5: 10, r60: [5, 40], jump: 15, keep: 0.85, low2x: 2, indX: 1.1, sell: 0.9, half: 1.2, perInd: 3, max: 36, w: [3, 2.5, 2], base: 10000000};
const quit = msg => { console.log('고도리 고르는 셈 — ' + msg + ' · 결과 파일은 그대로'); process.exit(0); };

const readJ = f => JSON.parse(fs.readFileSync(f, 'utf8'));
if (!fs.existsSync(path.join(DATA, 'mkt.json')) || !fs.existsSync(path.join(DATA, 'days.json'))) quit('사이트 자료(mkt.json · days.json) 없음');
const mkt = readJ(path.join(DATA, 'mkt.json')), days = readJ(path.join(DATA, 'days.json'));
let bundleFile = arg('--bundle', process.env.GDR_BUNDLE || null);
if (!bundleFile) { try { bundleFile = readJ(path.join(ROOT, 'scripts/atlas11/t365/universe.json')).bundle; } catch { /* 없음 */ } }
if (!bundleFile || !fs.existsSync(path.resolve(ROOT, bundleFile))) quit('모음(거래량) 없음');
const B = JSON.parse(zlib.gunzipSync(fs.readFileSync(path.resolve(ROOT, bundleFile))));

const T = days.dates; // 거래일 달력
const codes = Object.keys(mkt.companies).sort();
/* 모음 일봉: 날(YYYY-MM-DD) → [종가, 거래량] */
const rows = new Map();
let bundleLast = '';
for (const c of codes) {
  const m = new Map();
  for (const r of B.stocks?.[c]?.fchart?.rows ?? []) { const d = String(r[0]); const day = d.slice(0, 4) + '-' + d.slice(4, 6) + '-' + d.slice(6, 8); m.set(day, [r[4], r[5]]); if (day > bundleLast) bundleLast = day; }
  rows.set(c, m);
}
const siteDay = mkt.asOf;
const D = bundleLast && bundleLast < siteDay ? bundleLast : siteDay; // 둘 다 있는 날
const t = T.indexOf(D);
if (t < 250) quit('자료 날짜 ' + D + ' 를 거래일 달력에서 못 찾음 · 또는 250거래일이 안 됨');

/* 회사마다 종가(날 자리 k → 종가) · 결산 */
const co = new Map();
for (const c of codes) {
  const f = path.join(DATA, 'co', c + '.json');
  if (!fs.existsSync(f)) { co.set(c, null); continue; }
  const j = readJ(f); co.set(c, {k0: j.k0 ?? 0, close: j.close ?? [], op: j.fin?.op ?? null});
}
const cl = (c, k) => { const x = co.get(c); if (!x || k < x.k0) return null; const v = x.close[k - x.k0]; return Number.isFinite(v) && v > 0 ? v : null; };
const big = x => BigInt(Math.round(x));
/** 그날 거래대금(종가 × 거래량 · 원) — 줄이 없으면 null */
const tvOf = (c, k) => { const r = rows.get(c)?.get(T[k]); return r && Number.isFinite(r[0]) && Number.isFinite(r[1]) ? big(r[0]) * big(r[1]) : null; };
const volOf = (c, k) => { const r = rows.get(c)?.get(T[k]); return r && Number.isFinite(r[1]) ? r[1] : null; };
const sumTv = (c, a, b) => { let s = 0n; for (let k = a; k <= b; k++) { const v = tvOf(c, k); if (v === null) return null; s += v; } return s; };
const r2 = x => Math.round(x * 100) / 100, r4 = x => Math.round(x * 10000) / 10000;
/** 세 값 「그리고」(gates.json) — 0 이 하나라도 있으면 0(탈락이 정해짐) · 아니고 null 이 있으면 null(셀 수 없음) · 다 1 이면 1 */
const and3 = (...xs) => (xs.includes(0) ? 0 : xs.includes(null) ? null : 1);
/** 실수(2진) 값을 정확한 분수 [분자, 분모](BigInt)로 — 종가는 원 정수라 분모 1 */
const ratOf = x => {
  if (!Number.isFinite(x)) throw new Error('수가 아님 ' + x);
  const dv = new DataView(new ArrayBuffer(8)); dv.setFloat64(0, x);
  const hi = dv.getUint32(0), eb = (hi >>> 20) & 0x7ff;
  let m = (BigInt(hi & 0xfffff) << 32n) | BigInt(dv.getUint32(4));
  if (eb) m |= 1n << 52n;
  if (hi >>> 31) m = -m;
  const e = (eb || 1) - 1075; // x = m × 2^e
  return e >= 0 ? [m << BigInt(e), 1n] : [m, 1n << BigInt(-e)];
};
/** 분수 num ÷ den 을 소수 nd 자리 글로 — 반올림 전 값(정확한 분수)을 반올림 · 딱 반이면 짝수 쪽 = 파이썬 format(Fraction(num, den), '.{nd}f')
 *  2026-10-17 E: 옛 셈(실수 × 10 · 1e−12 안을 「딱 반」으로 봄)과 실제 종가에서 같은 값 · 실수 값을 그대로 format 하면 딱 반인 값(예: 174 ÷ 160 → 8.75)이 8.7 로 갈림 */
const fracFixed = (num, den, nd) => {
  if (den < 0n) { num = -num; den = -den; }
  const neg = num < 0n; if (neg) num = -num;
  num *= 10n ** BigInt(nd);
  let q = num / den; const r2x = (num - q * den) * 2n;
  if (r2x > den || (r2x === den && (q & 1n) === 1n)) q += 1n;
  let s = q.toString();
  if (nd > 0) { s = s.padStart(nd + 1, '0'); s = s.slice(0, -nd) + '.' + s.slice(-nd); }
  return (neg ? '-' : '') + s;
};
/** a ÷ b − 1 의 백분율(r60 · 정확한 분수) = 100 × (a − b) ÷ b */
const pctRat = (a, b) => { const [an, ad] = ratOf(a), [bn, bd] = ratOf(b); return [100n * (an * bd - bn * ad), ad * bn]; };
/** 이유 줄 숫자 — 소수 한 자리(위 반올림) · 부호는 옛 꼴 그대로(+ · 음수는 '−') */
const f1 = ([num, den], sign) => { const v = fracFixed(num < 0n ? -num : num, den < 0n ? -den : den, 1); return ((num < 0n) !== (den < 0n) && num !== 0n && v !== '0.0' ? '−' : sign ? '+' : '') + v; };

/* G5 업종(빼기 전 그 업종 회사 모두) */
const byInd = new Map();
for (const c of codes) { const i = mkt.companies[c].i; if (!i) continue; if (!byInd.has(i)) byInd.set(i, []); byInd.get(i).push(c); }
const indInfo = new Map();
for (const [i, cs] of byInd) {
  let s20 = 0n, s60 = 0n; const ch = [];
  for (const c of cs) {
    for (let k = t - 19; k <= t; k++) s20 += tvOf(c, k) ?? 0n;
    for (let k = t - 79; k <= t - 20; k++) s60 += tvOf(c, k) ?? 0n;
    const a = cl(c, t), b = cl(c, t - 20); if (a && b) ch.push({a: BigInt(a), b: BigInt(b)});
  }
  // 가운데 값의 부호는 분수 그대로(BigInt) — 딱 0 은 「> 0」이 아님(2026-10-17 따로 세기 일꾼 C 가 찾은 소수 오차: (+10% + −10%) ÷ 2 가 5e−15 로 셈되던 일)
  ch.sort((x, y) => { const d = x.a * y.b - y.a * x.b; return d < 0n ? -1 : d > 0n ? 1 : 0; });
  const n = ch.length, pc = x => (Number(x.a) / Number(x.b) - 1) * 100;
  const med = n ? (n % 2 ? pc(ch[(n - 1) / 2]) : (pc(ch[n / 2 - 1]) + pc(ch[n / 2])) / 2) : null;
  const medPos = n ? (n % 2 ? ch[(n - 1) / 2].a > ch[(n - 1) / 2].b : (() => { const x = ch[n / 2 - 1], y = ch[n / 2]; return x.a * y.b + y.a * x.b - 2n * x.b * y.b > 0n; })()) : false;
  const ok = s60 > 0n && 30n * s20 >= 11n * s60 && medPos;
  indInfo.set(i, {ok, indX: s60 > 0n ? Number(s20) * 3 / Number(s60) : null, ind20: med, s20, s60, medPos}); // 합은 9천조 아래라 Number 로 정확 · s20 · s60 = wrong-v1 경계(정수) · medPos = gates.json
}

/* 먼저 뺌 → 다섯 문 */
const counts = {listed: 0, companies: codes.length, outThin: 0, outThinQ: 0, outHalt: 0, managed: null, afterOut: 0, g1: 0, g2: 0, g3: 0, g4: 0, g5: 0, passAll: 0, picked: 0, cash: 0};
const listed = new Set(Object.keys(B.stocks ?? {}));
for (const p of B.lists?.pages ?? []) { try { for (const s of JSON.parse(p.text)?.stocks ?? []) if (s?.itemCode) listed.add(String(s.itemCode)); } catch { /* 못 읽은 쪽 */ } }
counts.listed = listed.size;
const pass = [];
const gates = new Map(); // 번호 → [x, g1, g2, g3, g4, g5](gates.json · x 0 안 뺌 · 1 거래 적음 · 2 거래 정지 · 뺀 곳 gN = null)
const OUT1 = [1, null, null, null, null, null], OUT2 = [2, null, null, null, null, null], triBad = [];
for (const c of codes) {
  // X1 거래 적음(최근 20거래일 하루 평균 거래대금 < 10억 · 값이 없으면 「?」로 뺌)
  const s20 = sumTv(c, t - 19, t);
  if (s20 === null) { counts.outThin++; counts.outThinQ++; gates.set(c, OUT1); continue; }
  if (s20 < 20n * BigInt(RULES.thin)) { counts.outThin++; gates.set(c, OUT1); continue; }
  // X2 거래 정지(추정 — 최근 5거래일에 거래량 0 이거나 줄 없음 · 그날 종가 없음)
  let halt = !cl(c, t);
  for (let k = t - 4; k <= t && !halt; k++) { const v = volOf(c, k); if (v === null || v === 0) halt = true; }
  if (halt) { counts.outHalt++; gates.set(c, OUT2); continue; }
  // X3 관리 종목 · 투자 경고 — 모음에 표시 칸이 없음 → 셀 수 없음(null · 「?」)
  counts.afterOut++;
  const x = co.get(c), g = {};
  // G1 이익 늘었나
  const op = (x?.op ?? []).filter(v => v !== undefined);
  const opPrev = op.length >= 2 ? op[op.length - 2] : null, opLast = op.length >= 2 ? op[op.length - 1] : null;
  const g1 = Number.isFinite(opPrev) && Number.isFinite(opLast) && opLast > 0 && opLast > opPrev;
  // G2 아직 조용한가
  const s120 = sumTv(c, t - 139, t - 20), c0 = cl(c, t), c5 = cl(c, t - 5);
  const g2 = s120 !== null && 3n * s20 <= s120 && !!c5 && 10 * c0 < 11 * c5;
  // G3 석 달 천천히 올랐나
  let g3 = false, maxJ = null, mx = null;
  const c60 = cl(c, t - 60);
  if (c60) {
    let okData = true, okJump = true; mx = 0; maxJ = -Infinity;
    for (let k = t - 59; k <= t; k++) { const a = cl(c, k), b = cl(c, k - 1); if (!a || !b) { okData = false; break; } if (100 * a >= 115 * b) okJump = false; maxJ = Math.max(maxJ, (a / b - 1) * 100); mx = Math.max(mx, a); }
    if (!okData) { maxJ = null; mx = null; }
    g3 = okData && okJump && 100 * c0 >= 105 * c60 && 100 * c0 <= 140 * c60 && 100 * c0 >= 85 * mx;
  }
  // G4 두 배 넘게 안 올랐나
  let lo = Infinity, okLo = true;
  for (let k = t - 249; k <= t; k++) { const a = cl(c, k); if (!a) { okLo = false; break; } lo = Math.min(lo, a); }
  const g4 = okLo && c0 < 2 * lo;
  // G5 돈 들어오는 업종인가
  const ind = indInfo.get(mkt.companies[c].i);
  const g5 = !!ind?.ok;
  if (g1) counts.g1++; if (g2) counts.g2++; if (g3) counts.g3++; if (g4) counts.g4++; if (g5) counts.g5++;
  // gates.json 칸(brief2 「gN = 1 지남 · 0 못 지남 · null 셀 수 없음」 · 2026-10-17 조정 일꾼): 문마다 작은 시험을 세 값으로 —
  //   보이는 값만으로 이미 탈락이 정해지면 0 · 아니고 쓰는 값이 빠졌으면 null(화면 「?」) · 다 있고 지나면 1. 셈(counts · 고르기)은 위 g1 ~ g5 그대로
  const L = op.length, last = L >= 1 && Number.isFinite(op[L - 1]) ? op[L - 1] : null, prev = L >= 2 && Number.isFinite(op[L - 2]) ? op[L - 2] : null;
  let jb = 1, kc = 1; // G3 (b) 하루 +15% 넘는 날 · (c) 60날 가장 높은 종가의 0.85 배 — 보이는 날끼리만 견줌
  for (let k = t - 59; k <= t; k++) {
    const a = cl(c, k), b = cl(c, k - 1);
    if (jb !== 0) { if (a && b) { if (100 * a >= 115 * b) jb = 0; } else jb = null; }
    if (kc !== 0) { if (a) { if (100 * c0 < 85 * a) kc = 0; } else kc = null; }
  }
  let lo4 = Infinity, m4 = false; // G4 보이는 날의 가장 낮은 종가(빠진 날이 더 낮을 수는 있어도 높을 수는 없음 → 이미 두 배면 탈락이 정해짐)
  for (let k = t - 249; k <= t; k++) { const a = cl(c, k); if (a) lo4 = Math.min(lo4, a); else m4 = true; }
  const tri = [and3(last === null ? null : +(last > 0), last === null || prev === null ? null : +(last > prev)), // G1 마지막 해 > 0 · > 앞 해
    and3(s120 === null ? null : +(3n * s20 <= s120), c5 ? +(10 * c0 < 11 * c5) : null), // G2 (a) 앞 120날이 다 있어야 셈 · (b) 5일 오름
    and3(c60 ? +(100 * c0 >= 105 * c60 && 100 * c0 <= 140 * c60) : null, jb, kc), // G3
    c0 >= 2 * lo4 ? 0 : m4 ? null : 1, // G4
    ind ? and3(ind.indX === null ? null : +(30n * ind.s20 >= 11n * ind.s60), ind.ind20 === null ? null : +ind.medPos) : null]; // G5 업종
  if ([g1, g2, g3, g4, g5].some((v, j) => (tri[j] === 1) !== v)) triBad.push(c); // 1 의 자리 = 지난 곳 그대로여야 함
  gates.set(c, [0, ...tri]);
  if (!(g1 && g2 && g3 && g4 && g5)) continue;
  counts.passAll++;
  pass.push({code: c, name: mkt.companies[c].n, ind: mkt.companies[c].i, price: c0, c60, opPrev, opLast,
    g: {opPrev, opLast, opGrow: opPrev > 0 ? r4(opLast / opPrev - 1) : null, r60: r2((c0 / c60 - 1) * 100), maxJump: r2(maxJ), keep: r4(c0 / mx), low250x: r4(c0 / lo),
      indX: ind.indX === null ? null : r4(ind.indX), ind20: r2(ind.ind20), tv20: Number((s20 + 10n) / 20n), r5: r2((c0 / c5 - 1) * 100), quiet: r4(Number(s20) * 6 / Number(s120))},
    lo, indS20: ind.s20, indS60: ind.s60});
}
/** 「틀린다면 이유」 wrong-v1(brief2.md · 위에서부터 처음 맞는 하나) — 경계 · 숫자 모두 반올림 전 값(정확한 분수)으로 · 숫자 꼴은 fracFixed(파이썬 format · 딱 반이면 짝수)
 *  r60 = (종가 ÷ 60거래일 전 종가 − 1) × 100 · low250x = 종가 ÷ 250거래일 가장 낮은 종가 · indX = 업종 (20날 합 ÷ 20) ÷ (앞 60날 합 ÷ 60) = 3 × 20날 합 ÷ 60날 합 · opGrow = 마지막 해 ÷ 앞 해 − 1(앞 해 ≤ 0 이면 없음) */
export const WRONG = ['석 달 {r60}% 올라 숨이 찰 수 있어.', '1년 바닥보다 {low250x}배라 더 오르기 버거울 수 있어.', '업종 돈이 조금만 빠져도 이 문을 못 지나.', '이익이 다시 줄면 고른 까닭이 사라져.', '시장 전체가 내리면 같이 내릴 수 있어.'];
const wrongOf = p => {
  const [rn, rd] = pctRat(p.price, p.c60); // rd > 0
  if (rn >= 30n * rd) return WRONG[0].replace('{r60}', fracFixed(rn, rd, 0)); // 1. r60 ≥ 30
  const [an, ad] = ratOf(p.price), [ln, ld] = ratOf(p.lo), xn = an * ld, xd = ad * ln; // low250x = xn ÷ xd(xd > 0)
  if (10n * xn >= 17n * xd) return WRONG[1].replace('{low250x}', fracFixed(xn, xd, 1)); // 2. low250x ≥ 1.7
  if (30n * p.indS20 < 13n * p.indS60) return WRONG[2]; // 3. indX < 1.3 ⇔ 3 × s20 ÷ s60 < 1.3
  if (!(p.opPrev > 0)) return WRONG[3]; // 4. opGrow 없음(앞 해 ≤ 0)
  const [on, od] = ratOf(p.opLast), [pn, pd] = ratOf(p.opPrev);
  if (5n * on * pd < 6n * pn * od) return WRONG[3]; // 4. opGrow < 0.2 ⇔ 마지막 해 < 1.2 × 앞 해
  return WRONG[4]; // 5. 그 밖
};
/* 차례: 영업이익 늘어난 비율 큰(앞 해 > 0 만 · 없으면 모두 뒤) → 60거래일 오름 작은 → 번호 작은 — 곱셈으로 정확히 견줌 */
pass.sort((a, b) => {
  const ga = a.opPrev > 0, gb = b.opPrev > 0;
  if (ga !== gb) return ga ? -1 : 1;
  if (ga) { const l = BigInt(a.opLast) * BigInt(b.opPrev), r = BigInt(b.opLast) * BigInt(a.opPrev); if (l !== r) return l > r ? -1 : 1; }
  const l2 = BigInt(a.price) * BigInt(b.c60), r2b = BigInt(b.price) * BigInt(a.c60); if (l2 !== r2b) return l2 < r2b ? -1 : 1;
  return a.code < b.code ? -1 : a.code > b.code ? 1 : 0;
});
/* 고르기 · 비중 */
const perInd = new Map(), picks = [];
for (const p of pass) {
  if (picks.length >= RULES.max) break;
  if ((perInd.get(p.ind) ?? 0) >= RULES.perInd) continue;
  perInd.set(p.ind, (perInd.get(p.ind) ?? 0) + 1);
  const no = picks.length + 1, w = no <= 12 ? RULES.w[0] : no <= 24 ? RULES.w[1] : RULES.w[2];
  picks.push({no, code: p.code, name: p.name, ind: p.ind, w, price: p.price, sell: Math.floor(p.price * 9 / 10), half: Math.floor(p.price * 12 / 10),
    reason: `영업이익 ${p.opPrev}억 → ${p.opLast}억 · 석 달 ${f1(pctRat(p.price, p.c60), true)}% · 업종 돈 ${f1([3n * p.indS20, p.indS60], false)}배`, saying: (no - 1) % 11, wrong: wrongOf(p), g: p.g});
}
const inds = {};
for (const p of picks) inds[p.ind] = (inds[p.ind] ?? 0) + p.w;
const wsum = picks.reduce((s, p) => s + p.w * 10, 0) / 10;
counts.picked = picks.length; counts.cash = Math.round((100 - wsum) * 10) / 10;
const out = {schema: 'godori-gdr-1', version: 'gdr-v1', asOf: D, made: new Date().toISOString(), src: path.relative(ROOT, path.resolve(ROOT, bundleFile)),
  dates: {site: siteDay, bundle: bundleLast, calc: D}, base: RULES.base,
  rules: {thin: RULES.thin, quietX: RULES.quietX, hot5: RULES.hot5, r60: RULES.r60, jump: RULES.jump, keep: RULES.keep, low2x: RULES.low2x, indX: RULES.indX, sell: RULES.sell, half: RULES.half},
  counts, sayings: SAYINGS, picks, inds,
  note: [D !== siteDay ? `사이트 자료(${siteDay})보다 거래량 자료가 앞선 날(${bundleLast})까지라 모든 문을 ${D} 로 셈` : '사이트 자료 날짜와 거래량 자료 날짜가 같음',
    '관리 종목 · 투자 경고는 모음에 표시 칸이 없어 아직 못 거름(?)', '거래 정지는 최근 5거래일 거래량 0 으로 짐작함']};
// 스스로 확인(틀리면 결과를 쓰지 않음)
const bad = [];
if (Math.abs(wsum + counts.cash - 100) > 1e-9) bad.push('비중 합 + 쉬는 돈 ≠ 100');
for (const [i, s] of Object.entries(inds)) if (s > 9 + 1e-9) bad.push('업종 합 9 넘음 ' + i);
if (new Set(picks.map(p => p.code)).size !== picks.length) bad.push('겹친 회사');
if (counts.companies !== counts.outThin + counts.outHalt + counts.afterOut) bad.push('먼저 뺀 수가 안 맞음');
const WRONG_OK = new RegExp('^(?:석 달 -?\\d+% 올라 숨이 찰 수 있어\\.|1년 바닥보다 -?\\d+\\.\\d배라 더 오르기 버거울 수 있어\\.|' + WRONG.slice(2).map(s => s.replace(/\./g, '\\.')).join('|') + ')$');
for (const p of picks) if (typeof p.wrong !== 'string' || !WRONG_OK.test(p.wrong)) bad.push('틀린다면 이유 꼴이 틀림 ' + p.code);

/* gates.json — 회사 주식 모두 · 번호 글자 차례(숫자 같은 번호가 앞으로 가는 JS 차례를 피하려고 손으로 이어 씀) */
const gatesTxt = '{' + ['"schema":"godori-gates-1"', '"version":"gdr-v1"', '"asOf":' + JSON.stringify(D), '"rules":' + JSON.stringify(out.rules),
  '"keys":["x","g1","g2","g3","g4","g5"]', '"co":{' + codes.map(c => JSON.stringify(c) + ':' + JSON.stringify(gates.get(c) ?? null)).join(',') + '}'].join(',') + '}\n';
// 쓸 글을 다시 읽어 따로 셈 — 문마다 지난 수(x = 0 안 1 의 수) = gdr.json counts · 뺀 까닭 수 = outThin · outHalt · afterOut · 고른 곳은 다섯 문 다 1
//   x = 0 의 null 은 그 문이 쓰는 값이 정말 빠진 곳만 · 값이 빠진 문은 1 일 수 없음(아래 missChk = 위 셈과 다른 길로 날마다 빠진 수를 다시 셈)
//   G1 은 마지막 해까지 없거나 앞 해가 없을 때(결산이 둘보다 적음 포함) · G2 앞 120날 거래대금 · 5거래일 전 종가 · G3 60거래일 전 ~ 오늘 종가 · G4 250거래일 종가 · G5 업종 셈
const missCount = (c, a, b, f) => { let n = 0; for (let k = a; k <= b; k++) if (f(c, k) === null) n++; return n; };
const missChk = c => {
  const op = co.get(c)?.op ?? [], L = op.length, ind = indInfo.get(mkt.companies[c].i);
  return [L < 2 || !Number.isFinite(op[L - 2]) || !Number.isFinite(op[L - 1]), // G1
    missCount(c, t - 139, t - 20, tvOf) > 0 || cl(c, t - 5) === null, // G2
    missCount(c, t - 60, t, cl) > 0, // G3
    missCount(c, t - 249, t, cl) > 0, // G4
    !ind || ind.indX === null || ind.ind20 === null]; // G5
};
const GJ = JSON.parse(gatesTxt), gN = [0, 0, 0, 0, 0], gNull = [0, 0, 0, 0, 0], gZeroMiss = [0, 0, 0, 0, 0], xN = [0, 0, 0];
let all5 = 0, gBad = 0;
if (Object.keys(GJ.co).length !== codes.length) bad.push('gates.json 회사 수 ' + Object.keys(GJ.co).length + ' ≠ ' + codes.length);
for (const c of codes) {
  const a = GJ.co[c];
  if (!Array.isArray(a) || a.length !== 6 || ![0, 1, 2].includes(a[0])) { gBad++; continue; }
  const [x, ...g] = a; xN[x]++;
  if (x !== 0) { if (g.some(v => v !== null)) gBad++; continue; }
  const mc = missChk(c);
  if (g.some((v, j) => (v !== null && v !== 0 && v !== 1) || (v === null && !mc[j]) || (v === 1 && mc[j]))) { gBad++; continue; }
  g.forEach((v, j) => { if (v === 1) gN[j]++; else if (v === null) gNull[j]++; else if (mc[j]) gZeroMiss[j]++; });
  if (g.every(v => v === 1)) all5++;
}
if (gBad) bad.push('gates.json 값 · 빈 자리(null)가 틀린 회사 ' + gBad + '곳');
if (triBad.length) bad.push('gates.json 1 의 자리가 문 셈과 다른 회사 ' + triBad.length + '곳 ' + triBad.slice(0, 5));
['g1', 'g2', 'g3', 'g4', 'g5'].forEach((k, j) => { if (gN[j] !== counts[k]) bad.push(`gates.json ${k} ${gN[j]} ≠ gdr.json counts.${k} ${counts[k]}`); });
if (xN[0] !== counts.afterOut || xN[1] !== counts.outThin || xN[2] !== counts.outHalt) bad.push(`gates.json 뺀 까닭 ${xN} ≠ counts ${[counts.afterOut, counts.outThin, counts.outHalt]}`);
if (all5 !== counts.passAll) bad.push(`gates.json 다섯 문 다 ${all5} ≠ passAll ${counts.passAll}`);
for (const p of picks) if (GJ.co[p.code]?.join() !== '0,1,1,1,1,1') bad.push('고른 곳의 문이 다 1 이 아님 ' + p.code);
if (GATES === OUT) bad.push('gates.json 과 gdr.json 이 같은 파일');
console.log(JSON.stringify({asOf: D, dates: out.dates, counts, wsum, inds: Object.keys(inds).length,
  gates: {n: Object.keys(GJ.co).length, x: xN, g: gN, nulls: gNull, zeroMiss: gZeroMiss, all5, bytes: Buffer.byteLength(gatesTxt)}, wrong: picks.map(p => p.wrong), bad}));
if (bad.length) { console.log('스스로 확인에서 걸림 — 두 파일 모두 쓰지 않음'); process.exit(1); }
if (!CHECK) { // 둘 다 임시 파일에 쓴 뒤 옮김(하나만 바뀐 채 남지 않게)
  const tmp = f => f + '.tmp-' + process.pid;
  try {
    for (const [f, txt] of [[GATES, gatesTxt], [OUT, JSON.stringify(out) + '\n']]) { fs.mkdirSync(path.dirname(f), {recursive: true}); fs.writeFileSync(tmp(f), txt); }
    fs.renameSync(tmp(GATES), GATES); fs.renameSync(tmp(OUT), OUT);
  } catch (e) { for (const f of [GATES, OUT]) { try { fs.unlinkSync(tmp(f)); } catch { /* 없음 */ } } throw e; }
  console.log('→ ' + path.relative(ROOT, OUT) + ' · ' + path.relative(ROOT, GATES));
}
