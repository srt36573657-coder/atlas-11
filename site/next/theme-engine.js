/* 테마 시계 셈 한 곳(사장님 2026-10-19(싱가포르) 16:06 「테마가 된 게 아니라 될 듯한 걸 찾아 주는 거야 … 이 본질이 중심이자 시작」 ·
   16:54 「큰 구조는 건들이지 말고 더 스마트한 내부 시스템을 만들어서 올려」) — 결정표 docs/design/theme-2026-10-19/theme-engine.md 그대로
   다른 파일을 부르지 않음 · 화면(DOM)을 만지지 않음 — 올릴 때 셈(scripts/atlas11/next/build/theme.mjs) · 시험(tests/atlas11/theme.test.mjs) · 화면(p-theme.js 의 글 틀)이 같이 부름
   셈은 올릴 때 한 번(모든 회사 종가 839일) → /next/data/theme.json · theme-more.json — 화면은 그 파일만 읽음(첫 화면은 mkt · cond 를 받지 않음 · [9] 7)
   v1.3(2026-10-20 · 결정표 9): 회사 한 곳의 자리 → /next/data/theme-co.json(회사 화면 탭 아래 한 줄 — app.js wZone) */

import {THEME_SCHEMA, RULE, ZONES, zoneOf, pp, nearBar, DOT_TEXT} from './theme-rule.js'; // 잣대 · 글 꼴은 theme-rule.js 한 곳(화면도 같이 씀)
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

/** 싹 순서(결정표 4) — 점 수 → y → 이름 */
export const sproutCmp = (a, b) => b.sc - a.sc || (b._y ?? b.y) - (a._y ?? a.y) || (a.n < b.n ? -1 : a.n > b.n ? 1 : 0);

/**
 * 전체 셈 — {dates, closes: Map(code → number[N]), companies: {code: {n, i}}, industries: [{name, g}], groups: [{id, name}], rk: Map(code → 차례), provisional}
 * → {theme, more} (두 파일의 몸) · 결정표 1 ~ 6
 */
export function computeTheme({dates, closes, companies, industries, groups = [], rk = new Map(), provisional = false, made = new Date().toISOString()}) {
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
      big, top, ranked: rows.length,
    };
  });
  const by = z => inds.filter(i => i.z === z);
  const sprout = by('S').sort(sproutCmp), bloom = by('B').sort((a, b) => b._x - a._x || (a.n < b.n ? -1 : 1)), wilt = by('W').sort((a, b) => a._y - b._y || (a.n < b.n ? -1 : 1)), quiet = by('Q').sort((a, b) => b._y - a._y || (a.n < b.n ? -1 : 1));
  const record = recordOf(U, M, T);
  const lite = i => ({n: i.n, g: i.g, gn: i.gn, k: i.k, z: i.z, x: i.x, y: i.y, d: i.d, t: i.t, tz: i.tz, dots: i.dots, sc: i.sc, up: i.up, tot: i.tot, sp: i.sp, sp5: i.sp5, peak: i.peak, bigAvg: i.bigAvg, m10: i.m10, A5: i.A5, B5: i.B5});
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
  return {theme, more, co, path: pathOf(U, M, dates, sprout.slice(0, 3).map(i => i.n), made)};
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
