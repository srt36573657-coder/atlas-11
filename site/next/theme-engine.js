/* 테마 시계 셈 한 곳(사장님 2026-10-19(싱가포르) 16:06 「테마가 된 게 아니라 될 듯한 걸 찾아 주는 거야 … 이 본질이 중심이자 시작」 ·
   16:54 「큰 구조는 건들이지 말고 더 스마트한 내부 시스템을 만들어서 올려」) — 결정표 docs/design/theme-2026-10-19/theme-engine.md 그대로
   theme-rule.js · 꽃 될 회사 낱 조건 bloom-atoms.js · 그 쉬운 한 줄 bloom-labels.js 만 부름(2026-11-02 주문 1313) · 화면(DOM)을 만지지 않음 — 올릴 때 셈(scripts/atlas11/next/build/theme.mjs) · 시험(tests/atlas11/theme.test.mjs) · 화면(p-theme.js 의 글 틀)이 같이 부름
   셈은 올릴 때 한 번(모든 회사 종가 839일) → /next/data/theme.json · theme-more.json — 화면은 그 파일만 읽음(첫 화면은 mkt · cond 를 받지 않음 · [9] 7)
   v1.3(2026-10-20 · 결정표 9): 회사 한 곳의 자리 → /next/data/theme-co.json(회사 화면 탭 아래 한 줄 — app.js wZone) */

import {THEME_SCHEMA, RULE, ZONES, zoneOf, pp, nearBar, DOT_TEXT} from './theme-rule.js'; // 잣대 · 글 꼴은 theme-rule.js 한 곳(화면도 같이 씀)
import {atomBase} from './bloom-atoms.js'; // 꽃 될 회사 낱 조건 156(연구 셈 bloom_evolve.py 와 칸마다 같음 — 시험 bloom-atoms.test · 2026-11-02 주문 1313)
import {ATOM_SAY, SPROUT_SAY} from './bloom-labels.js'; // 낱 조건마다 쉬운 한 줄(화면 글 · 영어 사전 en-src.json)
export {THEME_SCHEMA, RULE, ZONES, zoneOf, pp, nearBar, DOT_TEXT};
const r2 = v => (Number.isFinite(v) ? Math.round(v * 100) / 100 : null);
const r1 = v => (Number.isFinite(v) ? Math.round(v * 10) / 10 : null);
const ok = v => typeof v === 'number' && v > 0;

/** 같은 무게 지수(결정표 1) — closes = [Float64Array(N) | number[]] · 하루 변화가 |r| ≥ 0.35 인 회사는 그날 뺌 · 아무도 없으면 0 */
export function indexOf(closes, N) {
  const I = new Float64Array(N); I[0] = 100;
  for (let t = 1; t < N; t++) {
    let s = 0, n = 0;
    for (const a of closes) {
      const p = a[t - 1], q = a[t];
      if (ok(p) && ok(q)) { const r = q / p - 1; if (Math.abs(r) < RULE.jump) { s += r; n++; } }
    }
    I[t] = I[t - 1] * (1 + (n ? s / n : 0));
  }
  return I;
}
/** 시장보다 앞선 만큼(비율 · × 100 이면 %p) */
export const exOf = (I, M, t, k) => (t - k >= 0 ? (I[t] / I[t - k]) / (M[t] / M[t - k]) - 1 : NaN);
const chg = (a, t, k) => (t - k >= 0 && ok(a[t - k]) && ok(a[t]) ? a[t] / a[t - k] - 1 : null);
/** 튄 회사(결정표 3 · 5) — t − 9 ~ t 가운데 하루 변화가 |r| ≥ 0.35 인 날이 있으면 참(나눔 · 합침 · 자료 잘못) — 회사 셈(② · ③ · 함께 움직인 회사)에서 뺌 */
export function jumpy(a, t) { for (let s = Math.max(1, t - RULE.back + 1); s <= t; s++) if (ok(a[s - 1]) && ok(a[s]) && Math.abs(a[s] / a[s - 1] - 1) >= RULE.jump) return true; return false; }
/** 회사 열흘 변화 — 튄 회사 · 값이 빈 날이면 null */
const chg10 = (a, t) => (jumpy(a, t) ? null : chg(a, t, RULE.back));

/** 업종 하나의 날 t 점 넷(결정표 3) — {dots:[4 bool], up, tot, bigAvg} */
export function dotsAt({I, M, cs, big}, t) {
  const y = exOf(I, M, t, 5) * 100;
  let up = 0, tot = 0;
  for (const a of cs) { if (chg10(a, t) == null) continue; tot++; if (a[t] * 100 > a[t - RULE.back] * (100 + RULE.spreadUp * 100)) up++; } // 2% 넘게 = 정수 곱으로 맞댐(소수 잡음 없이 — 정확히 +2.000% 는 아님)
  const bx = big.map(a => chg10(a, t)).filter(v => v != null), bigAvg = bx.length ? bx.reduce((p, q) => p + q, 0) / bx.length : null;
  const real = I[t] / I[t - RULE.back] > 1;
  return {dots: [y >= RULE.powerY, tot > 0 && up * 2 >= tot, bigAvg != null && bigAvg >= RULE.bigUp, real], up, tot, bigAvg};
}

/** 회사 자리(결정표 9 · v1.3 · 사장님 2026-10-20 21:56 「맞아 정말 맞아」 — 박승혁 님 생각 「삼성전자를 치면 이게 지금 꽃을 피운 단계에 있는 건지 시듦의 단계인건지도」)
 *  업종 지수 I 대신 회사 한 곳의 종가 a 로 2 의 셈 그대로 → {x, y, z} · 셀 수 없으면 null
 *  셀 수 없음 = ① close(T) · close(T − 5) · close(T − 20) 가운데 빈 것 ② T − 19 ~ T 에 하루 |r| ≥ 0.35 인 날(1 의 지수에서 빼는 것과 같은 잣대 — 나눔 · 합침 · 자료 잘못) */
export function coZoneOf(a, M, T) {
  const k = RULE.win;
  if (!a || T - k < 0 || !ok(a[T]) || !ok(a[T - 5]) || !ok(a[T - k])) return null;
  for (let s = T - k + 1; s <= T; s++) if (ok(a[s - 1]) && ok(a[s]) && Math.abs(a[s] / a[s - 1] - 1) >= RULE.jump) return null;
  const x = exOf(a, M, T, k) * 100, y = exOf(a, M, T, 5) * 100;
  return {x, y, z: zoneOf(x, y)};
}

/** 업종 안에서 돈이 가장 많이 몰린 회사(사장님 2026-11-02 10:38(+04) 주문 1538 「돈이 몰린 종목 업종을 … 첫화면에」 · docs/design/home-two-2026-11-02/order-1538.txt ②)
 *  거래 대금 자료가 없어 종가와 몸값으로만 셈 — 한 달(T − 20 ~ T) 동안 몸값이 원으로 가장 많이 는 회사 하나
 *  는 몸값(억 원) = (close(T) − close(T − 20)) × 주식 수 · 주식 수 = 몸값(caps · cond.json 억 원) ÷ 마지막 종가(bloomOf 의 sh 와 같은 셈)
 *  셀 수 없음 = ① close(T) · close(T − 20) 가운데 빈 것 ② 몸값 없음 ③ T − 19 ~ T 에 하루 |r| ≥ 0.35 인 날(bloomOf J 와 같은 잣대) ④ 스물한 날 종가가 모두 같음(멈춤 — bloomOf E 와 같은 잣대)
 *  가장 많이 는 회사 · 같으면 번호 작은 쪽 · 가장 많이 는 값이 0 이하이거나 셀 회사가 없으면 null → [번호, 이름, 는 몸값(억 원 · 정수)] */
export function leadOf(cs, closes, companies, caps, T) {
  const k = RULE.win;
  if (T - k < 0) return null;
  let best = null, bg = 0;
  for (const c of cs) {
    const a = closes.get(c);
    if (!a || !ok(a[T]) || !ok(a[T - k])) continue;
    const cap = Number(caps.get(c));
    if (!Number.isFinite(cap) || cap <= 0) continue;
    let jump = false, same = 0;
    for (let s = T - k + 1; s <= T; s++) {
      if (!ok(a[s - 1]) || !ok(a[s])) continue;
      if (Math.abs(a[s] / a[s - 1] - 1) >= RULE.jump) { jump = true; break; }
      if (a[s] === a[s - 1]) same++;
    }
    if (jump || same === k) continue;
    let last = 0; for (let t = a.length - 1; t >= 0; t--) if (ok(a[t])) { last = a[t]; break; }
    const g = (a[T] - a[T - k]) * (cap / last);
    if (g > bg || (best !== null && g === bg && c < best)) { best = c; bg = g; }
  }
  return best === null ? null : [best, companies[best]?.n ?? best, Math.round(bg)];
}

/** 싹 순서(결정표 4) — 점 수 → y → 이름 */
export const sproutCmp = (a, b) => b.sc - a.sc || (b._y ?? b.y) - (a._y ?? a.y) || (a.n < b.n ? -1 : a.n > b.n ? 1 : 0);

/**
 * 전체 셈 — {dates, closes: Map(code → number[N]), companies: {code: {n, i}}, industries: [{name, g}], groups: [{id, name}], rk: Map(code → 차례), provisional}
 * → {theme, more} (두 파일의 몸) · 결정표 1 ~ 6
 */
export function computeTheme({dates, closes, companies, industries, groups = [], rk = new Map(), caps = new Map(), fins = new Map(), months = null, provisional = false, made = new Date().toISOString(), kept = {}}) { // caps = 회사 몸값(억 원 · cond.json · 꽃 될 회사 몸값 차례 — 2026-11-02 주문 0815)
  const N = dates.length, T = N - 1;
  if (N < RULE.recFrom + RULE.recAhead + 2) throw Error('theme: 날짜가 너무 적음 ' + N);
  const codes = [...closes.keys()].filter(c => companies[c]).sort();
  const M = indexOf(codes.map(c => closes.get(c)), N);
  const gName = new Map(groups.map(g => [g.id, g.name]));
  const gOf = new Map(industries.map(x => [x.name, x.g]));
  const mem = new Map();
  for (const c of codes) { const i = companies[c].i; if (typeof i !== 'string') continue; if (!mem.has(i)) mem.set(i, []); mem.get(i).push(c); }
  const names = [...mem.keys()].filter(n => mem.get(n).length >= RULE.minN).sort();
  const U = names.map(n => {
    const cs = mem.get(n), arr = cs.map(c => closes.get(c));
    const bigCodes = cs.filter(c => (rk.get(c) ?? 99) <= RULE.bigRanks).sort((a, b) => rk.get(a) - rk.get(b) || (a < b ? -1 : 1));
    return {n, cs, arr, I: indexOf(arr, N), bigCodes, big: bigCodes.map(c => closes.get(c))};
  });
  const zoneDay = (u, t) => zoneOf(exOf(u.I, M, t, RULE.win) * 100, exOf(u.I, M, t, 5) * 100);
  const inds = U.map(u => {
    const {I, cs, arr} = u, x = exOf(I, M, T, RULE.win) * 100, y = exOf(I, M, T, 5) * 100, z = zoneOf(x, y);
    let d = 0; for (let t = T; t >= RULE.win && zoneDay(u, t) === z; t--) d++;
    const tail = [], tz = []; for (let t = T - RULE.tail + 1; t <= T; t++) { tail.push([r2(exOf(I, M, t, RULE.win) * 100), r2(exOf(I, M, t, 5) * 100)]); tz.push(zoneDay(u, t)); }
    const D0 = dotsAt({I, M, cs: arr, big: u.big}, T);
    const series = []; for (let t = T - RULE.back; t <= T; t++) series.push(dotsAt({I, M, cs: arr, big: []}, t).up);
    const rows = cs.map(c => {
      const a = closes.get(c), d10 = chg10(a, T), a5 = chg(a, T - 5, 5), b5 = chg(a, T, 5);
      return {c, d10, a5, b5};
    }).filter(r => r.d10 != null).sort((p, q) => q.d10 - p.d10 || (p.c < q.c ? -1 : 1));
    const line = c => { const a = closes.get(c), b = a[T - RULE.back]; if (!ok(b)) return null; const out = []; let last = b; for (let t = T - RULE.back; t <= T; t++) { if (ok(a[t])) last = a[t]; out.push(Math.round(last / b * 1000)); } return out; };
    const p100 = v => r2(v == null ? NaN : v * 100); // 빈 값(null)은 null 로(null × 100 = 0 이 되지 않게 · 따로 세기 v1.2 가 짚음)
    const full = (r, k) => ({c: r.c, n: companies[r.c].n, d10: p100(r.d10), a5: p100(r.a5), b5: p100(r.b5), rank: k + 1, gap: p100(r.d10 - (rows[k + 1]?.d10 ?? NaN)), l: line(r.c)});
    const top = rows.slice(0, RULE.top).map(full);
    // 큰 회사 셋도 같은 칸(결정표 5 · v1.2) — 줄(d10 차례)에 없으면(튄 회사 · 값 빔) 숫자 칸은 모두 없음
    const big = u.bigCodes.map(c => { const k = rows.findIndex(r => r.c === c); return k < 0 ? {c, n: companies[c].n, rk: rk.get(c), d10: null, a5: null, b5: null, rank: null, gap: null, l: null} : {...full(rows[k], k), rk: rk.get(c)}; });
    return {
      _x: x, _y: y, n: u.n, g: gOf.get(u.n) ?? null, gn: gName.get(gOf.get(u.n)) ?? null, k: cs.length, z, x: r2(x), y: r2(y), d, t: tail, tz,
      dots: D0.dots.map(Number), sc: D0.dots.filter(Boolean).length, up: D0.up, tot: D0.tot, sp: series, sp5: series[series.length - 6], peak: Math.max(...series),
      bigAvg: r2(D0.bigAvg == null ? NaN : D0.bigAvg * 100), m10: r2((I[T] / I[T - RULE.back] - 1) * 100), A5: r2((I[T - 5] / I[T - 10] - 1) * 100), B5: r2((I[T] / I[T - 5] - 1) * 100),
      big, top, ranked: rows.length, lead: leadOf(cs, closes, companies, caps, T),
    };
  });
  const by = z => inds.filter(i => i.z === z);
  const sprout = by('S').sort(sproutCmp), bloom = by('B').sort((a, b) => b._x - a._x || (a.n < b.n ? -1 : 1)), wilt = by('W').sort((a, b) => a._y - b._y || (a.n < b.n ? -1 : 1)), quiet = by('Q').sort((a, b) => b._y - a._y || (a.n < b.n ? -1 : 1));
  const record = recordOf(U, M, T);
  const lite = i => ({n: i.n, g: i.g, gn: i.gn, k: i.k, z: i.z, x: i.x, y: i.y, d: i.d, t: i.t, tz: i.tz, dots: i.dots, sc: i.sc, up: i.up, tot: i.tot, sp: i.sp, sp5: i.sp5, peak: i.peak, bigAvg: i.bigAvg, m10: i.m10, A5: i.A5, B5: i.B5, lead: i.lead}); // lead = 돈이 가장 많이 몰린 회사 [번호, 이름, 한 달 동안 는 몸값(억 원)] · 없으면 null(leadOf · 2026-11-02 주문 1538)
  const theme = {
    schema: THEME_SCHEMA, made, asOf: dates[T], from20: dates[T - RULE.win], days6: dates.slice(T - RULE.tail + 1), recFrom: dates[RULE.recFrom], recTo: dates[T - RULE.recAhead], provisional: !!provisional, rule: RULE,
    count: {S: sprout.length, B: bloom.length, W: wilt.length, Q: quiet.length, real: sprout.filter(i => i.sc === 4).length, fresh: sprout.filter(i => i.d === 1).length},
    order: {S: sprout.map(i => i.n), B: bloom.map(i => i.n), W: wilt.map(i => i.n), Q: quiet.map(i => i.n)},
    groups: groups.map(g => ({id: g.id, name: g.name})),
    inds: inds.map(lite), record,
  };
  const more = {schema: THEME_SCHEMA + '-more', made, asOf: dates[T], inds: Object.fromEntries(inds.map(i => [i.n, {big: i.big, top: i.top, ranked: i.ranked}]))};
  // 회사 자리(결정표 9 · v1.3) — 모든 회사 · 셀 수 없는 회사는 빠짐(화면은 「?」) · x · y 는 소수 둘째 자리(8)
  const cz = {}; let skip = 0;
  for (const c of codes) { const v = coZoneOf(closes.get(c), M, T); if (!v) { skip++; continue; } cz[c] = [r2(v.x), r2(v.y), v.z]; }
  const co = {schema: THEME_SCHEMA + '-co', made, asOf: dates[T], from20: dates[T - RULE.win], from5: dates[T - 5], provisional: !!provisional, n: Object.keys(cz).length, skip, co: cz};
  return {theme, more, co, path: pathOf(U, M, dates, sprout.slice(0, 3).map(i => i.n), made), cal: calOf(U, M, dates, made, CAL_DAYS, kept), bloom: bloomOf({U, M, closes, codes, companies, dates, caps, fins, months, made, provisional})}; // fins = 회사 실적(co 파일 fin · 낱 조건 fin 갈래) · months = 달마다 고른 조건(bloom-months.json · 2026-11-02 주문 1313)
}

/** 싹 달력(사장님 2026-10-22 11:55 「일 이 삼 찾아낸 것들 다 달력으로 … 제시만 해가지고 기록이 없으면 그건 하수야」 · 「구글 잡스라면」) — 지난 CAL_DAYS 거래일마다
 *  그날까지의 값만으로 싹 앞 셋(결정표 4 차례 · 점 수 → 지난 닷새 · 첫 화면 1 · 2 · 3 과 같은 셈)과 한 달 뒤 꽃 선(성적표 결정표 6 과 같은 잣대 · 한 달이 안 지났으면 null)
 *  날 t 의 셋은 t 뒤 값을 쓰지 않음(꽃 선만 t + 20) · 마지막 날 셋 = theme.order.S 앞 셋(시험 tests/atlas11/theme-cal.test.mjs) */
export const CAL_DAYS = 60;
export function calOf(U, M, dates, made, n = CAL_DAYS, kept = {}) {
  const T = dates.length - 1, t0 = Math.max(RULE.win, T - n + 1), days = [], byName = new Map(U.map(u => [u.n, u]));
  const hitAt = (u, t) => (t + RULE.recAhead <= T && u ? exOf(u.I, M, t + RULE.recAhead, RULE.win) >= RULE.bloomX / 100 : null);
  for (let t = t0; t <= T; t++) {
    const K = kept?.[dates[t]]; // 지킨 기록(그날 장 마감 때 처음 셈한 셋 · reports/atlas11/theme-cal/kept.json) — 셋은 그대로 · 한 달 뒤 꽃 선만 지금 값으로
    if (K && Array.isArray(K.top)) { days.push({d: dates[t], s: Number.isInteger(K.s) ? K.s : null, k: 1, top: K.top.slice(0, 3).map(i => ({n: i.n, sc: i.sc, y: i.y, hit: hitAt(byName.get(i.n), t)}))}); continue; }
    const S = [];
    for (const u of U) {
      const x = exOf(u.I, M, t, RULE.win) * 100, y = exOf(u.I, M, t, 5) * 100;
      if (zoneOf(x, y) !== 'S') continue;
      S.push({n: u.n, sc: dotsAt({I: u.I, M, cs: u.arr, big: u.big}, t).dots.filter(Boolean).length, _y: y, y, u});
    }
    S.sort(sproutCmp);
    const later = t + RULE.recAhead <= T;
    days.push({d: dates[t], s: S.length, top: S.slice(0, 3).map(i => ({n: i.n, sc: i.sc, y: r1(i.y), hit: later ? exOf(i.u.I, M, t + RULE.recAhead, RULE.win) >= RULE.bloomX / 100 : null}))});
  }
  // 고른 날부터 오늘까지(사장님 2026-10-23 11:18 「1.2.3등을 골랐던 것이 날짜별로 그래프로 … 너가 알려준 날부터 항산 현재 까지」 · 11:28 「오늘 날짜까지 해야지」)
  //   달력 첫 날 = 100 으로 맞춘 시장(M) · 달력에 든 업종(I)만 — 화면이 고른 날 j 에서 마지막 날까지 (I[k] / I[j]) ÷ (M[k] / M[j]) − 1 을 그림 · 마지막 날 = asOf
  const rb = a => Array.from({length: T - t0 + 1}, (_, j) => (ok(a[t0]) && ok(a[t0 + j]) ? Math.round((a[t0 + j] / a[t0]) * 10000) / 100 : null));
  const names = [...new Set(days.flatMap(x => x.top.map(i => i.n)))].sort();
  const path = {from: dates[t0], M: rb(M), I: Object.fromEntries(names.map(nm => [nm, byName.has(nm) ? rb(byName.get(nm).I) : null]))};
  return {schema: THEME_SCHEMA + '-cal', made, asOf: dates[T], ahead: RULE.recAhead, days, path};
}

/** 지난 한 해 길(사장님 2026-10-21 10:44 「1.2.3 번에 행성이 어떻게 움직었는지 지난 1년에 주식 변화를 그래프로도 이 우주안에서 동영상으로 … 1번 보여주고 그다음 2번 … 3번」 ·
 *  11:07 「단추가 아니라 자동으로 보여주게해」) — 첫 화면 1 · 2 · 3번(싹 앞 셋)의 날마다 x · y(결정표 2 그대로) · 자리 · 업종 지수(한 해 전 = 100) + 시장 지수
 *  마지막 날 x · y · 자리는 theme.inds 와 같음(시험) · 날 = 기준 날의 달력 한 해 전 같은 날 뒤 첫 거래일부터(날이 모자라면 한 달 셈이 되는 날부터)
 *  날짜 글은 싣지 않음(첫 화면에 보이는 날짜는 띠에 한 번 — [6] 2) · 화면은 첫 그림 뒤에만 받음(/next/data/theme-path.json · theme-home.js) */
export function pathOf(U, M, dates, names, made) {
  const T = dates.length - 1, y1 = String(Number(dates[T].slice(0, 4)) - 1) + dates[T].slice(4);
  let t0 = dates.findIndex(d => d > y1); if (t0 < RULE.win) t0 = RULE.win;
  const inds = names.map(n => U.find(u => u.n === n)).filter(Boolean).map(u => {
    const x = [], y = [], I = []; let z = '';
    for (let t = t0; t <= T; t++) { const xx = exOf(u.I, M, t, RULE.win) * 100, yy = exOf(u.I, M, t, 5) * 100; x.push(r2(xx)); y.push(r2(yy)); z += zoneOf(xx, yy) ?? '-'; I.push(r1(u.I[t] / u.I[t0] * 100)); }
    return {n: u.n, x, y, z, I};
  });
  const Mv = []; for (let t = t0; t <= T; t++) Mv.push(r1(M[t] / M[t0] * 100));
  return {schema: THEME_SCHEMA + '-path', made, asOf: dates[T], from: dates[t0], days: T - t0 + 1, M: Mv, inds};
}

/** 성적표(결정표 6) — t = 40 ~ T − 20 · 「한 달 뒤 꽃 선」 = ex(t + 20, 20) ≥ 0.05 */
export function recordOf(U, M, T) {
  const t0 = RULE.recFrom, t1 = T - RULE.recAhead, split = Math.floor((t0 + t1) / 2);
  const box = () => ({n: 0, y: 0, h: [[0, 0], [0, 0]]});
  const all = box(), sp = box(), real = box(), byDots = [0, 1, 2, 3, 4].map(box);
  const add = (b, hit, half) => { b.n++; if (hit) b.y++; b.h[half][0]++; if (hit) b.h[half][1]++; };
  for (const u of U) {
    for (let t = t0; t <= t1; t++) {
      const hit = exOf(u.I, M, t + RULE.recAhead, RULE.win) >= RULE.bloomX / 100, half = t < split ? 0 : 1;
      add(all, hit, half);
      const z = zoneOf(exOf(u.I, M, t, RULE.win) * 100, exOf(u.I, M, t, 5) * 100);
      if (z !== 'S') continue;
      const s = dotsAt({I: u.I, M, cs: u.arr, big: u.big}, t).dots.filter(Boolean).length;
      add(sp, hit, half); add(byDots[s], hit, half); if (s === 4) add(real, hit, half);
    }
  }
  const pc = (y, n) => (n ? r1(y / n * 100) : null);
  const out = b => ({n: b.n, p: pc(b.y, b.n), h: [pc(b.h[0][1], b.h[0][0]), pc(b.h[1][1], b.h[1][0])]});
  const A = out(all), R = out(real);
  return {from: t0, to: t1, all: A, sprout: out(sp), real: R, byDots: byDots.map(out), more: R.h[0] != null && R.h[1] != null && A.h[0] != null && A.h[1] != null && R.h[0] > A.h[0] && R.h[1] > A.h[1]};
}


/** 꽃 핀 업종 안의 싹 회사(사장님 2026-10-22 16:56 「싹에서 꽃이 되는 종목을 찾는게 돌이에 본질이야 … 과거 데이타를 모조리 뒤져서 막 올리지말고 엄선하고 럼서해서 그것들만 올려야 해」 · 17:00 「어」 — 회사 하나하나)
 *  첫 모습 = 회사는 싹 자리(결정표 9 — x < 5 · y ≥ 0) · 그 회사 업종은 꽃 자리(결정표 2 — x ≥ 5 · y ≥ 0) — 후보 열일곱 가운데 앞 · 뒤 기록 두 번 지나간 하나(C3 · spec-v1.md v3)
 *  2026-10-27 17:34 부터 = 위 모습 + 회사 값이 반년 가장 높은 값 가까이(BLOOM_HI · 후보 365 → 37 → 3 → 1 · PICK365) — 아래 old(바꾸기 전 조건)로 나란히
 *  2026-11-02 부터 = 다시 세운 조건(사장님 2026-11-02 01:08(+04) 「진화를 과감 해 / … 너 클로드가 할수 있는 최대 진화를 해」 · 03:15(+04) 「응」 — 「지난 기록을 모조리 뒤져 꽃 될 회사 고르는 법을 다시 세울까요?」)
 *    후보 11,874(낱 156 · 짝 11,718) → 달마다 그 달을 안 본 채 가장 단단한 하나(21달) → 안 본 기록에서 바꾸기 전 조건보다 많음 · 운 걸러내기 통과 → 마지막 하나(PICK_EVOLVE)
 *    셈 약속 docs/design/bloom-evolve-2026-11-02/spec.md · 연구 셈 scripts/atlas11/research/bloom_evolve.py · 숫자 reports/atlas11/research/bloom-evolve-2026-11-02.json(시험이 맞댐)
 *    고르는 조건 = 회사는 싹 + 그날 몸값이 셀 수 있는 회사 가운데 위 20%(BLOOM_BIG) + 업종이 한 달 동안 시장보다 15% 넘게 더 오름(BLOOM_IX) — 그날까지의 값만
 *  지난 기록 = t = BLOOM.from ~ T − 20 · 회사 · 날마다 「한 달 뒤 꽃 선」 · 한 달 평균 앞선 만큼(±50% 자름) · 크게 떨어짐(−5% 아래) — 아무 회사(셀 수 있는 모든 회사 · 날)와 나란히
 *    train = 고를 때 본 기록(~ 2026-09-09) · test = 고를 때 안 본 기록(BLOOM.split 2026-09-10 부터 · 날이 쌓일수록 늚)
 *    honest = 안 본 기록만(연구의 달마다 걸어가며 고른 기록 2025-01-02 ~ 2026-09-09 + 그 뒤 이 조건의 test) — 첫 화면 · 쪽 결론 숫자는 이것
 *  오늘 = T 에 고르는 조건에 든 회사 · 업종은 x 큰 차례 · 회사는 이름 차례(차례에 뜻이 없음) · 회사마다 까닭(몸값 위 몇 % · 업종 한 달) · 지난 기록(이 조건에 든 날 · 그중 꽃) */
export const BLOOM = Object.freeze({from: 120, clip: 0.5, fall: -0.05, split: '2026-09-10', cal: 60});
// split = 고를 때 본 기록 · 안 본 기록 가름 — 다시 세운 조건은 2026-09-09 까지의 결과로 골랐음(연구 TL) · 옛 판(2025-04-04)은 PICK365 · PICK_EVOLVE.wf 에 적힘
export const BLOOM_HI = Object.freeze({win: 120, near: 0.95}); // 바꾸기 전 조건(2026-10-27 ~ 11-01)의 「반년 가장 높은 값 가까이」 — old 로 나란히 셈
export const BLOOM_BIG = Object.freeze({top: 0.8}); // 그날 셀 수 있는 회사 가운데 몸값 차례(작은 쪽부터 0) (차례 + 1) ÷ 센 수 ≥ 0.8 = 위 20% · 몸값 = 그날 종가 × 지금 주식 수(cond.json 몸값 ÷ 마지막 종가)
export const BLOOM_IX = Object.freeze({min: 15}); // 업종이 한 달(20거래일) 동안 시장보다 앞선 만큼(%p) ≥ 15
/** 빈 날 가장 가까운 회사 셋(사장님 2026-11-03 12:01(+04) 「어 그렇게 해」 — 물음 「꽃이 될 종목이 없는 날에는 조건에 가장 가까운 회사 셋을 따로 보여 드릴까요?」 · 주문 1512 · docs/design/bloom-empty-2026-11-03)
 *  그날 조건이 「업종이 한 달 동안 시장보다 X% 넘게 더 오름」(ix1 ~ ix4) 하나 + 회사 조건일 때만 — 셀 수 있음 · 싹 · 회사 조건은 그대로, 업종 조건만 빼고
 *  업종이 한 달 동안 시장보다 더 오른 만큼 큰 차례 · 같으면 회사가 한 달 동안 더 오른 차례 · 같으면 번호 차례로 셋 · 고른 회사와 섞지 않음(today 와 따로 near)
 *  지난 기록도 따로 — 고를 때 안 본 날(달마다 그 달 결정 · 앞 달 것을 이어 쓴 날은 뺌) 가운데 고른 회사가 없던 날만 · 한 달 뒤 결과가 난 회사만 · 같은 날 아무 회사와 맞댐
 *  따로 다시 세기 = scripts/atlas11/verify/bloom_near_verify.mjs(엔진 · 낱 조건 셈을 안 씀) — 다르면 올릴 때 near 를 뺌 */
export const NEAR = Object.freeze({n: 3, ix: Object.freeze({ix1: 0, ix2: 5, ix3: 10, ix4: 15})});
const IND_ATOM = /^(iz|ix|iy|ib|i60|isz)/; // 업종 갈래 낱 조건(bloom-atoms.js ind1 · ind2 · byInd)
/** 365 → 37 → 3 → 1(2026-10-27 17:34) — 바꾸기 전 조건이 나온 길(기록으로 남김) */
export const PICK365 = Object.freeze({
  date: '2026-10-27', asOf: '2026-10-13', n: 365, ok: 88, short: 37, final: 'C3+hi1',
  train: {from: '2023-10-27', to: '2025-04-03', n: 1349, rate: 30.47, base: 22.51, old: 25.67},
  test: {from: '2025-04-04', to: '2026-09-09', n: 2653, rate: 32.04, base: 24.57, old: 27.48},
});
/** 다시 세운 길(2026-11-02 · 주문 0815) — reports/atlas11/research/bloom-evolve-2026-11-02.json 그대로(시험이 맞댐)
 *  n = 후보 수 · months = 달마다 고른 달 수 · wf.A = 걸어가며 고른 모든 달(안 본 기록) · wf.B = 2025-04-04 ~(바꾸기 전 조건도 안 본 기간) · cur = 같은 날 바꾸기 전 조건
 *  ci = 20날 덩어리 다시 뽑기 2,000 번 95% 폭(%p) · rc = 운 걸러내기(들 수 있던 후보 수 · 가장 좋은 것이 운으로 나올 몫) · final = 마지막 하나 · 고를 때 본 기록 */
export const PICK_EVOLVE = Object.freeze({
  date: '2026-11-02', asOf: '2026-10-13', atoms: 156, pairs: 11718, n: 11874, months: 21,
  wf: {
    A: {from: '2025-01-02', to: '2026-09-09', n: 1570, hits: 522, rate: 33.25, base: 24.27, baseN: 1001933, baseHits: 243147, pickDayShare: 69.59, fall: 32.1, fallBase: 38.05, cur: 31.97, sprout: 23.39},
    B: {from: '2025-04-04', to: '2026-09-09', n: 1295, hits: 459, rate: 35.44, base: 24.57, fall: 31.27, fallBase: 38.74, cur: 32.04, curN: 2653, sprout: 23.68},
  },
  ci: {methodMinusBase: [1.46, 18.37], methodMinusCurrent: [-6.83, 11.3], currentMinusBase: [2.35, 12.51]},
  rc: {eligible: 1276, p: 0.008},
  final: {id: 'big2&ix4', train: {from: '2023-10-27', to: '2026-09-09', n: 754, rate: 39.79, base: 23.56, pickDayShare: 46.64}}, // pickDayShare = 마지막 하나가 고른 회사가 있던 날 몫(T0 ~ TL · 엔진 record.train days · pickDays 와 시험이 맞댐)
  prev: 'hi1&iz1',
  say: ['업종이 한 달 동안 시장보다 15% 넘게 더 올랐어요', '그날 몸값이 큰 쪽 위 20% 회사예요', '회사는 아직 싹이에요'],
});
/** 달마다 고른 조건(spec v2 · site/next/data/bloom-months.json months) → 날마다 결정 차례 at(t) · 결정 전 끝 달은 가장 최근 결정을 이어 씀(carry)
 *  결정 파일이 없거나 비면 다시 세운 하나(PICK_EVOLVE.final)를 2025-01 부터 씀(legacy · 이어 씀 표시 없음) */
export function planOf(dates, months) {
  const list = (Array.isArray(months) ? months : Array.isArray(months?.months) ? months.months : []).filter(m => m && /^\d{4}-\d{2}$/.test(m.month ?? '') && (m.id == null || /^[a-z0-9]+(&[a-z0-9]+)?$/.test(m.id))).sort((p, q) => (p.month < q.month ? -1 : 1));
  const legacy = !list.length;
  const plan = legacy ? [{month: '2025-01', id: PICK_EVOLVE.final.id, sealed: false, legacy: true}]
    : list.map(m => ({month: m.month, id: m.id ?? null, sealed: !!m.sealed, s: m.s ?? null, lb: Number.isFinite(m.lb) ? m.lb : null, nTrain: Number.isInteger(m.nTrain) ? m.nTrain : null, elig: Number.isInteger(m.elig) ? m.elig : null, fresh: m.fresh ?? null}));
  const N = dates.length, at = new Int32Array(N).fill(-1), carry = new Uint8Array(N), by = new Map(plan.map((p, q) => [p.month, q]));
  for (let t = 0, last = -1; t < N; t++) {
    const mo = dates[t].slice(0, 7);
    if (mo < plan[0].month) continue;
    if (by.has(mo)) last = by.get(mo); else if (!legacy) carry[t] = 1;
    at[t] = last;
  }
  return {plan, at, carry, legacy};
}
/** 셈 셋 맞대기 결과(bloom-months.json check · 깃허브 일 atlas11-bloom-month 이 씀) — 화면 한 줄용으로 줄임 */
const selfOf = m => { const c = m && !Array.isArray(m) ? m.check : null; return c && typeof c === 'object' ? {agree: c.agree === true, asOf: typeof c.asOf === 'string' ? c.asOf : null, data: c.data === 'live' ? 'live' : 'stored', counts: Number.isInteger(c.counts) ? c.counts : null, at: typeof c.at === 'string' ? c.at : null, made: typeof m.made === 'string' ? m.made : null} : null; };
export function bloomOf({U, M, closes, codes, companies, dates, caps = new Map(), fins = new Map(), months = null, made = new Date().toISOString(), provisional = false}) {
  const N = dates.length, T = N - 1, k = RULE.win, A = RULE.recAhead;
  const t0 = BLOOM.from, t1 = T - A;
  // 2026-11-02 주문 1313 — 조건은 달마다 스스로 다시 고른 것(spec v2) · 낱 조건 156 은 bloom-atoms.js(연구 셈과 칸마다 같음 — 시험 bloom-atoms.test)
  const {plan, at: PL, carry: PC, legacy} = planOf(dates, months);
  const ctx = atomBase({dates, codes, closes, companies, caps, fins}), CX = ctx.C;
  const RM = plan.map(p => (p.id ? ctx.pair(p.id) : null)); // 결정마다 (날 × 회사) 참거짓 — ctx 칸 차례
  const firstT = PL.findIndex(q => q >= 0);
  let mid = firstT >= 0 ? Math.max(firstT, t0 + 1) : -1; if (mid < 0 || mid > t1) mid = t1 + 1; // 고를 때 안 본 기록 = 달마다 그 달을 안 보고 고른 날(첫 결정 달부터)
  const indZ = new Map(), indI = new Map(U.map(u => [u.n, u.I]));
  const c0 = Math.max(k, T - BLOOM.cal + 1), cal = []; for (let t = c0; t <= T; t++) cal.push({d: dates[t], n: 0, hit: 0, miss: 0, wait: 0, why: [0, 0, 0], bn: 0, bh: 0}); // 달력 — 날마다 고른 수 · 꽃 · 못 됨(까닭 가 · 나 · 다) · 기다림 · 같은 날 아무 회사(bn 센 수 · bh 꽃)
  const whyOf = () => ({miss: 0, why: [0, 0, 0]}), why = {all: whyOf(), train: whyOf(), test: whyOf()};
  const whyAt = (ex, I, t) => (ex >= 0 ? 0 : I && exOf(I, M, t + A, A) < 0 ? 1 : 2); // 가 조금 모자람 · 나 업종째 식음 · 다 회사만 처짐(spec v6)
  for (const u of U) {
    const z = new Uint8Array(N);
    for (let t = k; t < N; t++) if (zoneOf(exOf(u.I, M, t, k) * 100, exOf(u.I, M, t, 5) * 100) === 'B') z[t] = 1;
    indZ.set(u.n, z);
  }
  // 회사마다 튄 날 · 멈춘 날 누적 · 셀 수 있는 날 · 몸값(그날 종가 × 지금 주식 수) — 몸값 차례는 그날 셀 수 있는 회사끼리
  const CC = codes.length, JJ = [], EE = [], CNT = [], SZ = [];
  for (const c of codes) {
    const a = closes.get(c), J = new Int32Array(N), E = new Int32Array(N), cn = new Uint8Array(N), sz = new Float64Array(N).fill(NaN);
    for (let t = 1; t < N; t++) { J[t] = J[t - 1] + (ok(a[t - 1]) && ok(a[t]) && Math.abs(a[t] / a[t - 1] - 1) >= RULE.jump ? 1 : 0); E[t] = E[t - 1] + (ok(a[t - 1]) && ok(a[t]) && a[t] === a[t - 1] ? 1 : 0); }
    for (let t = k; t < N; t++) cn[t] = ok(a[t]) && ok(a[t - 5]) && ok(a[t - k]) && J[t] - J[t - k] === 0 && E[t] - E[t - k] < k ? 1 : 0; // t − 20 ~ t 스물한 날 종가가 모두 같으면 뺌
    let last = 0; for (let t = N - 1; t >= 0; t--) if (ok(a[t])) { last = a[t]; break; }
    const cap = Number(caps.get(c)), sh = Number.isFinite(cap) && cap > 0 && last > 0 ? cap / last : NaN;
    if (Number.isFinite(sh)) for (let t = 0; t < N; t++) if (ok(a[t])) sz[t] = a[t] * sh;
    JJ.push(J); EE.push(E); CNT.push(cn); SZ.push(sz);
  }
  const TOPP = new Float64Array(CC).fill(NaN); // TOPP = 마지막 날 몸값 위 몇 %(회사마다 까닭 — 그 달 조건에 몸값 갈래가 있을 때만 보임)
  { const js = []; for (let j = 0; j < CC; j++) if (CNT[j][T] && Number.isFinite(SZ[j][T])) js.push(j);
    js.sort((p, q) => SZ[p][T] - SZ[q][T] || p - q);
    const nv = js.length; for (let r = 0; r < nv; r++) TOPP[js[r]] = (1 - r / nv) * 100; }
  const PN = new Float64Array(N), PH = new Float64Array(N), BNd = new Float64Array(N), BHd = new Float64Array(N); // 날마다 고른 회사(결과 있음) · 꽃 · 같은 날 아무 회사 · 꽃 — 달 기록 · 모은 기록
  const blank = () => ({n: 0, h: 0, f: 0, e: 0});
  const blank4 = () => [blank(), blank(), blank(), blank()];
  const acc = {all: blank4(), train: blank4(), test: blank4()}, years = {}; // [아무 회사 · 지금 조건 · 그냥 싹 · 바꾸기 전 조건(업종 꽃 자리 + 싹 + 반년 가장 높은 값 가까이)]
  const add = (o, hit, fall, e) => { o.n++; if (hit) o.h++; if (fall) o.f++; o.e += e; };
  const SPS = new Array(CC), PANY = new Uint16Array(N); // 빈 날 가까운 회사(주문 1512) — 회사마다 날마다 셀 수 있고 싹 · 날마다 그날 조건에 든 회사 수(결과 없는 날도)
  const today = [], PD = new Uint8Array(N); // PD = 지금 조건으로 고른 회사가 있던 날(지난 기록 t0 ~ t1 · 결과가 난 회사만 — 연구 셈 고른 날과 같은 잣대)
  let todayOld = 0;
  codes.forEach((c, j) => {
    const a = closes.get(c), iz = indZ.get(companies[c]?.i), I = indI.get(companies[c]?.i), J = JJ[j], cn = CNT[j], cj = ctx.col(c);
    const countable = t => t - k >= 0 && cn[t] === 1;
    const sproutAt = t => zoneOf(((a[t] / a[t - k]) / (M[t] / M[t - k]) - 1) * 100, ((a[t] / a[t - 5]) / (M[t] / M[t - 5]) - 1) * 100) === 'S';
    // 반년 가장 높은 값 가까이(BLOOM_HI · 바꾸기 전 조건) — t − 119 ~ t 하루도 빈 값이 없고 a[t] ÷ 그 사이 가장 높은 값 ≥ 0.95(연구 셈과 같은 나눗셈)
    const HW = BLOOM_HI.win, NEAR = new Uint8Array(N), dq = new Int32Array(N);
    for (let t = 0, bad = 0, qh = 0, qt = 0; t < N; t++) {
      if (!ok(a[t])) bad++;
      if (t - HW >= 0 && !ok(a[t - HW])) bad--;
      if (ok(a[t])) { while (qt > qh && a[dq[qt - 1]] <= a[t]) qt--; dq[qt++] = t; }
      while (qt > qh && dq[qh] <= t - HW) qh++;
      if (t >= HW - 1 && bad === 0 && qt > qh && a[t] / a[dq[qh]] >= BLOOM_HI.near) NEAR[t] = 1;
    }
    const pick = t => { const q = PL[t], m = q >= 0 ? RM[q] : null; return !!m && cj >= 0 && m[t * CX + cj] === 1; }; // 그날이 든 달의 조건(싹 · 셀 수 있음은 따로 봄)
    { const sps = new Uint8Array(N); for (let t = k; t < N; t++) if (countable(t) && sproutAt(t)) { sps[t] = 1; if (pick(t)) PANY[t]++; } SPS[j] = sps; }
    let pastN = 0, pastH = 0; // 이 회사가 지난 기록에서 수르가 고른 날(달마다 조건) · 그중 꽃
    for (let t = t0; t <= t1; t++) {
      if (!countable(t) || !ok(a[t + A]) || J[t + A] - J[t] !== 0) continue;
      const ex = (a[t + A] / a[t]) / (M[t + A] / M[t]) - 1, hit = ex >= RULE.bloomX / 100, fall = ex <= BLOOM.fall, e = Math.max(-BLOOM.clip, Math.min(BLOOM.clip, ex));
      const sp = sproutAt(t), g = sp && pick(t), go = sp && !!iz && iz[t] === 1 && NEAR[t] === 1, half = t < mid ? 'train' : 'test', yr = dates[t].slice(0, 4);
      years[yr] ??= blank4();
      for (const o of [acc.all, acc[half], years[yr]]) { add(o[0], hit, fall, e); if (g) add(o[1], hit, fall, e); if (sp) add(o[2], hit, fall, e); if (go) add(o[3], hit, fall, e); }
      BNd[t]++; if (hit) BHd[t]++; if (g) { PN[t]++; if (hit) PH[t]++; }
      if (g) { PD[t] = 1; pastN++; if (hit) pastH++; if (!hit) { const w = whyAt(ex, I, t); for (const o of [why.all, why[half]]) { o.miss++; o.why[w]++; } } }
    }
    for (let t = c0; t <= T; t++) {
      const cnt = countable(t), day = cal[t - c0], done = t <= t1 && cnt && ok(a[t + A]) && J[t + A] - J[t] === 0; // 한 달 안에 튄 날 · 값 없음 — 셈 밖(지난 기록과 같은 잣대)
      const ex = done ? (a[t + A] / a[t]) / (M[t + A] / M[t]) - 1 : 0;
      if (done) { day.bn++; if (ex >= RULE.bloomX / 100) day.bh++; } // 같은 날 아무 회사 — 고른 회사와 같은 날끼리 맞댐
      if (!cnt || !sproutAt(t) || !pick(t)) continue; // 그날이 든 달의 조건(싹 + 낱 조건 둘)
      day.n++;
      if (t > t1) { day.wait++; continue; }
      if (!done) continue;
      if (ex >= RULE.bloomX / 100) day.hit++; else { day.miss++; day.why[whyAt(ex, I, t)]++; }
    }
    if (countable(T) && sproutAt(T)) {
      if (iz && iz[T] === 1 && NEAR[T] === 1) todayOld++; // 바꾸기 전 조건이면 고른 수
      if (pick(T)) {
        const x = ((a[T] / a[T - k]) / (M[T] / M[T - k]) - 1) * 100, y = ((a[T] / a[T - 5]) / (M[T] / M[T - 5]) - 1) * 100;
        today.push({c, n: companies[c].n ?? c, i: companies[c].i, x: r2(x), y: r2(y), pn: pastN, ph: pastH, top: Number.isFinite(TOPP[j]) ? Math.max(1, Math.round(TOPP[j])) : null});
      }
    }
  });
  const pct = (v, n) => (n ? Math.round((v / n) * 10000) / 100 : null); // 소수 둘째 자리 — 화면은 다시 반올림해 「100번에 N번」(소수 한 자리로 두 번 반올림하면 27.48 이 28 이 됨)
  // 빈 날 가장 가까운 회사 셋(주문 1512 · 위 NEAR) — 그 달 조건이 ix1 ~ ix4 하나 + 회사 조건일 때만
  const nearPlan = plan.map(p => {
    const parts = typeof p.id === 'string' ? p.id.split('&') : [], ind = parts.filter(x => Object.hasOwn(NEAR.ix, x)), co = parts.filter(x => !IND_ATOM.test(x));
    return ind.length === 1 && co.length >= 1 && co.length === parts.length - 1 ? {atom: ind[0], min: NEAR.ix[ind[0]], co: co.map(x => ctx.atom(x))} : null;
  });
  const COLS = codes.map(c => ctx.col(c));
  const nearAt = t => {
    const q = PL[t], np = q >= 0 ? nearPlan[q] : null; if (!np) return null;
    const rows = [];
    for (let j = 0; j < CC; j++) {
      const cj = COLS[j]; if (!SPS[j][t] || cj < 0) continue;
      let okc = true; for (const m of np.co) if (m[t * CX + cj] !== 1) { okc = false; break; }
      if (!okc) continue;
      const c = codes[j], I = indI.get(companies[c]?.i); if (!I) continue;
      const ix = exOf(I, M, t, k); if (!Number.isFinite(ix)) continue;
      const a = closes.get(c);
      rows.push({j, ix, x: (a[t] / a[t - k]) / (M[t] / M[t - k]) - 1});
    }
    rows.sort((p, q2) => q2.ix - p.ix || q2.x - p.x || (codes[p.j] < codes[q2.j] ? -1 : 1));
    return {np, rows: rows.slice(0, NEAR.n)};
  };
  let near = null;
  { const qT0 = PL[T], npT = qT0 >= 0 ? nearPlan[qT0] : null;
    if (npT) {
      let nn = 0, nh = 0, nbn = 0, nbh = 0, nd = 0, lo = -1;
      for (let t = t0; t <= t1; t++) {
        if (PL[t] < 0 || PC[t] || PANY[t] > 0) continue; // 고를 때 안 본 날(달마다 그 달 결정) · 고른 회사가 없던 날만
        const r = nearAt(t); if (!r || !r.rows.length) continue;
        if (lo < 0) lo = t;
        nd++; nbn += BNd[t]; nbh += BHd[t];
        for (const {j} of r.rows) { const a = closes.get(codes[j]); if (!ok(a[t + A]) || JJ[j][t + A] - JJ[j][t] !== 0) continue; nn++; if ((a[t + A] / a[t]) / (M[t + A] / M[t]) - 1 >= RULE.bloomX / 100) nh++; }
      }
      const rT = PANY[T] === 0 ? nearAt(T) : null;
      near = {rule: {atom: npT.atom, min: npT.min, say: ATOM_SAY[npT.atom] ?? null},
        today: rT ? rT.rows.map(({j, ix, x}) => { const c = codes[j]; return [c, companies[c].n ?? c, companies[c].i, r2(ix * 100), r2(x * 100)]; }) : [], // [번호 · 이름 · 업종 · 업종이 한 달 동안 시장보다 더 오른 % · 회사가 더 오른 %]
        rec: {n: nn, hits: nh, rate: pct(nh, nn), base: pct(nbh, nbn), baseN: nbn, baseHits: nbh, days: nd, from: lo >= 0 ? dates[lo] : null, to: dates[t1]}};
    }
  }
  const out = ([b, g, s, o]) => ({n: g.n, hits: g.h, base: pct(b.h, b.n), rate: pct(g.h, g.n), ex: pct(g.e, g.n), exBase: pct(b.e, b.n), fall: pct(g.f, g.n), fallBase: pct(b.f, b.n), baseN: b.n, baseHits: b.h, plain: pct(s.h, s.n), plainN: s.n, old: pct(o.h, o.n), oldN: o.n}); // old = 바꾸기 전 조건(업종 꽃 자리 + 싹 + 반년 가장 높은 값 가까이)
  const byInd = new Map();
  for (const r of today) { if (!byInd.has(r.i)) byInd.set(r.i, []); byInd.get(r.i).push(r); }
  const inds = [...byInd.entries()].map(([n, rows]) => {
    const u = U.find(v => v.n === n);
    return {n, x: r2(exOf(u.I, M, T, k) * 100), y: r2(exOf(u.I, M, T, 5) * 100), co: rows.sort((p, q) => (p.n < q.n ? -1 : p.n > q.n ? 1 : 0)).map(r => [r.c, r.n, r.x, r.y, r.pn, r.ph, r.top])}; // [번호 · 이름 · 한 달 · 5일 · 지난 기록 든 날 · 그중 꽃 · 몸값 위 몇 %]
  }).sort((p, q) => q.x - p.x || (p.n < q.n ? -1 : 1));
  const dayStat = (lo, hi) => { let days = 0, pickDays = 0; for (let t = lo; t <= hi; t++) { days++; if (PD[t]) pickDays++; } return {days, pickDays}; }; // 고른 날 몫 — 날 수 · 고른 회사가 있던 날 수
  const rec = {all: {...out(acc.all), ...dayStat(t0, t1)}, train: {...out(acc.train), ...dayStat(t0, Math.min(mid, t1 + 1) - 1)}, test: {...out(acc.test), ...dayStat(mid, t1)}, years: Object.fromEntries(Object.keys(years).sort().map(yv => [yv, out(years[yv])]))};
  // 달마다 결정 · 달 기록(spec v2 §3 · §4) — 연구 셈 bloom_month.py · 따로 센 일꾼과 칸마다 맞댐(시험 theme-bloom · 깃허브 일 atlas11-bloom-month)
  const sayOf = id => (typeof id === 'string' ? [...id.split('&').map(p => ATOM_SAY[p] ?? p), SPROUT_SAY] : []);
  const lastMo = dates[T].slice(0, 7);
  const monthsOut = plan.map((p, q) => [p, q]).filter(([p]) => p.month <= lastMo).map(([p, q]) => { // 자료 끝 달 뒤의 결정(다른 자료로 낸 판)은 빼요
    let n = 0, h = 0, nb = 0, hb = 0, days = 0, pickDays = 0, lastT = -1, firstD = -1;
    for (let t = 0; t < N; t++) {
      if (PL[t] !== q || PC[t]) continue;
      if (firstD < 0) firstD = t;
      lastT = t;
      if (t < t0 || t > t1) continue;
      days++; n += PN[t]; h += PH[t]; nb += BNd[t]; hb += BHd[t]; if (PN[t] > 0) pickDays++;
    }
    const nextIn = PL.some((v, t) => v > q && !PC[t]) || (lastT >= 0 && lastT < T); // 다음 달 첫 거래일이 자료에 있음
    const complete = !p.legacy && lastT >= 0 && lastT <= t1 && nextIn;
    return {month: p.month, s: firstD >= 0 ? dates[firstD] : p.s, id: p.id, say: sayOf(p.id), sealed: p.sealed, lb: p.lb ?? null, nTrain: p.nTrain ?? null, elig: p.elig ?? null, fresh: p.fresh ?? null,
      rec: {n, h, nb, hb, days, pickDays, complete, rate: pct(h, n), base: pct(hb, nb), score: n && nb ? Math.round((h / n - hb / nb) * 10000) / 100 : null}};
  });
  // 고를 때 안 본 기록만(첫 화면 · 쪽 결론) = 달마다 그 달을 안 보고 고른 모든 달(2025-01 부터 · 결과가 난 날)
  let hn = 0, hh = 0, hbn = 0, hbh = 0, hd = 0, hpd = 0; for (const m of monthsOut) { hn += m.rec.n; hh += m.rec.h; hbn += m.rec.nb; hbh += m.rec.hb; hd += m.rec.days; hpd += m.rec.pickDays; }
  const honest = {from: firstT >= 0 ? dates[firstT] : null, to: dates[t1], n: hn, hits: hh, rate: pct(hh, hn), base: pct(hbh, hbn), baseN: hbn, baseHits: hbh, days: hd, pickDays: hpd, months: monthsOut.filter(m => m.rec.days > 0).length,
    up: monthsOut.filter(m => m.rec.n > 0 && Math.round(m.rec.score) > 0).length, down: monthsOut.filter(m => m.rec.n > 0 && Math.round(m.rec.score) < 0).length, scored: monthsOut.filter(m => m.rec.n > 0).length}; // up · down = 화면 「100번에 N번 더 · 덜」과 같은 반올림(0 이면 「비슷」)
  const qT = PL[T], ruleT = qT >= 0 ? plan[qT] : null;
  const hasBig = typeof ruleT?.id === 'string' && ruleT.id.split('&').some(p => /^big\d$/.test(p));
  if (!hasBig) for (const i of inds) for (const r of i.co) r[6] = null; // 몸값 위 몇 % 는 그 달 조건에 몸값 갈래가 있을 때만
  return {
    schema: THEME_SCHEMA + '-bloom', made, asOf: dates[T], provisional: !!provisional, companies: codes.length, tried: PICK_EVOLVE.n, // 고르는 조건 후보 — 셈 전에 적은 11,874(docs/design/bloom-evolve-2026-11-02/candidates.json)
    rule: {from: BLOOM.from, win: k, ahead: A, bloomX: RULE.bloomX, fall: BLOOM.fall * 100, clip: BLOOM.clip * 100, hiWin: BLOOM_HI.win, hiNear: BLOOM_HI.near * 100, monthly: !legacy},
    span: {from: dates[t0], to: dates[t1], train: [dates[t0], dates[Math.min(mid, t1 + 1) - 1]], test: mid <= t1 ? [dates[mid], dates[t1]] : [BLOOM.split, null]},
    record: rec, honest, months: monthsOut, self: selfOf(months), // self = 달마다 다시 고르기 · 셈 셋 맞대기 결과(bloom-months.json check)
    today: {n: today.length, all: todayOld, inds, rule: ruleT ? {month: dates[T].slice(0, 7), id: ruleT.id, say: sayOf(ruleT.id), carry: !!PC[T], decided: ruleT.month} : null}, // all = 바꾸기 전 조건이면 고른 수 · rule = 오늘 쓴 조건(그 달 결정 · carry = 이번 달 결정 전이라 앞 달 것)
    near, // 빈 날 가장 가까운 회사 셋(주문 1512) — 고른 회사가 아님 · 조건이 ix1 ~ ix4 하나 + 회사 조건일 때만(아니면 null) · today 는 고른 회사가 없는 날만
    cal: {from: dates[c0], to: dates[T], days: cal}, // 지난 60거래일 — 날마다 고른 수 · 꽃 · 못 됨 · 까닭 · 기다림(사장님 22:54 「그 기록을 한 달력이 첫화면에」)
    why: {all: why.all, train: why.train, test: why.test, names: ['조금 모자랐어요', '업종째 식었어요', '회사만 처졌어요']},
    pick: PICK_EVOLVE, prev: PICK365, // 다시 세운 길(2026-11-02) · 바꾸기 전 조건이 나온 길(2026-10-27)
  };
}
