/**
 * 돈의 이동 — 어느 업종에서 어느 업종으로 · 그 기간 · 포모값 · 돈의 파장 1~5차 (셈 한 곳 · 받기 · 쓰기 없음)
 *   사장님 2026-10-07 21:55 「돈에 흐름이 지금 현재 뭐냐 현실적으로 지금은 거시적이잖아」
 *     → 22:06 「아니 내말은 어떤 업종에서 어떤 업종으로 돈에 이동이 되고 있냐 그리고 그 기간과 포모값은 어찌 되냐 이거야」
 *     → 2026-10-08 06:46 「그리고 돈에 흐름이 1차 파장만 있다 5차 파장까지 도입하라」(⑦)
 *
 * 셈(판을 쌀 때 저절로 — scripts/atlas11/story/build.mjs)
 *   ① 업종 지수: 회사마다 시가총액(선정 때 · 억 원)을 무게로 날마다 (그날 종가 ÷ 앞 거래일 종가)를 이어 붙임(사슬)
 *      — 새로 들어온 회사 · 종가가 빠진 날에 값이 튀지 않음 · 빠진 날은 앞 종가를 그대로 들고 감(지어낸 오르내림 없음)
 *   ② 업종 시가총액: 선정 날 업종 시가총액 × (그날 지수 ÷ 선정 날 지수) · 전체 = 업종 73개 합(365곳)
 *   ③ 옮겨 간 돈(억 원) = 업종 시가총액 변화 − 전체와 같은 비율로 움직였다면의 변화 — 업종 73개를 더하면 0(한쪽이 늘면 다른 쪽이 준다)
 *      빠지는 업종 = 가장 많이 준 곳 · 들어가는 업종 = 가장 많이 는 곳(지난 10거래일 — 포모값 · 수급 자료와 같은 길이 ·
 *      20거래일로 재면 9월 4일 반도체 바닥 하나가 그림을 뒤집었다: 5 · 10 · 60거래일은 모두 「반도체에서 빠짐」, 20거래일만 「들어감」 → 10거래일을 씀)
 *   ④ 기간 = 「들어가는 업종 지수 ÷ 빠지는 업종 지수」의 마지막 바닥(그 앞으로 5% 넘게 높았던 날이 있는 가장 가까운 낮은 점)부터 마지막 종가 날까지
 *      — 들어가는 업종이 빠지는 업종보다 앞서기 시작한 날 · 지난 250거래일 안에 그런 바닥이 없으면 「250거래일 넘게」
 *   ⑤ 포모값(0~100) = 옛 ATLAS FOMO 18가지(lib/fomo.mjs · public/downloads/ATLAS_FOMO_EQUATIONS.md) 가운데 종가로 셀 수 있는 6가지 「가격 열기」를
 *      업종 지수에 그대로 — 10일 상승률 · 상승 가속 · 상승일 비중 · 20일 평균 이격 · 직전 60일 고점 돌파 · 상승 변동 집중
 *      지난 최대 252개 같은 길이 기간과 견준 백분위 · 묶음 안 겹침 할인(스피어만) · 두 묶음 평균 — 비교 기간 60개 미만이면 null(0 으로 채우지 않음)
 *      거래량 · 장중 · 개인 · 신용 · 관심 12가지는 자료가 없어 넣지 않음(화면에 그렇게 적음)
 *   ⑥ 누가 옮겼나 = 외국인 · 기관 · 개인 순매매(주) × 그날 종가 — 업종마다 합(관측 묶음에 든 거래일만 · 보통 10거래일)
 *   ⑦ 돈의 파장 1~5차 = 돈이 먼저 어느 업종으로 갔고 그다음 어느 업종으로 갔나 — 지난 종가로만(waves)
 *      마지막 종가 날부터 거꾸로 10거래일씩 겹치지 않게 끊음(마디 · 가장 많이 12마디 = 120거래일 · 거래일이 모자라면 있는 만큼 ·
 *      10거래일이 안 되는 맨 앞 자투리는 쓰지 않음) → 마디마다 ③의 셈으로 가장 많이 들어간 업종(억으로 반올림해 0 보다 큼 ·
 *      같으면 판 차례 앞 — 「들어가는 업종」과 같은 잣대) → 이어진 마디의 그 업종이 같으면 한 파장으로 묶고 묶은 기간 전체로 다시 셈
 *      (들어간 돈 · 그 기간 가장 많이 빠진 업종과 빠진 돈 — 마디 금액을 더하지 않음: 전체 크기가 마디마다 달라 더하면 어긋남)
 *      → 가장 새 파장 다섯을 오래된 것부터 1차 · 2차 … (마지막 = 지금 · 마지막 마디가 ③의 10거래일과 같아 「들어가는 업종」과 늘 같은 업종)
 *      · 맨 앞 마디까지 이어진 파장은 그보다 앞에서 시작했을 수 있음(atLeast — 「넘게」) · 들어간 업종이 없는 마디는 파장을 끊음
 * 앞날 말 없음 — 지난 종가와 지난 순매매만 셈 · 시험: tests/atlas11/rotation.test.mjs · 따로 다시 세기: scripts/atlas11/verify/waves_verify.py
 */
export const ROT = Object.freeze({schema: 'atlas11-rotation-1', window: 10, lookback: 250, trough: 0.05, top: 3, fomoRefs: 252, fomoMin: 60, fomoWindow: 10, waves: 5, waveWindows: 12});

const finite = x => typeof x === 'number' && Number.isFinite(x);
const ISO = /^\d{4}-\d{2}-\d{2}$/;
const sum = xs => xs.reduce((a, b) => a + b, 0), mean = xs => sum(xs) / xs.length;
const round = (x, n = 6) => (finite(x) ? Math.round(x * 10 ** n) / 10 ** n : null);

/** 회사 한 곳 — 날짜 → 확정 종가(0 이하 · 숫자 아님 · 확정 아님은 뺌) */
export function closeMap(prices, limitDay) {
  const m = new Map();
  for (const p of prices ?? []) if (ISO.test(p?.date ?? '') && p.date <= limitDay && finite(p.close) && p.close > 0 && p.finalClose !== false) m.set(p.date, p.close);
  return m;
}

/**
 * 업종 지수(사슬) — sessions: 거래일 차례 · members: [{cap(억 원 · refDay 시가총액), closes: Map, ref: refDay 종가}]
 * → idx[k] (첫날 = 1) · 그날 오르내림을 셀 수 있는 회사가 하나도 없으면 앞 값 그대로
 */
export function chainIndex(sessions, members) {
  const idx = new Array(sessions.length).fill(null), last = members.map(() => null);
  let level = 1;
  for (let k = 0; k < sessions.length; k++) {
    const d = sessions[k];
    let num = 0, den = 0;
    members.forEach((m, j) => {
      const b = m.closes.get(d), a = last[j];
      if (finite(b)) {
        if (finite(a) && finite(m.ref) && m.ref > 0) { const w = m.cap * a / m.ref; num += w * (b / a - 1); den += w; }
        last[j] = b;
      }
    });
    if (k > 0 && den > 0) level *= 1 + num / den;
    idx[k] = level;
  }
  return idx;
}

/* ── 포모값 — 가격 열기 6가지(lib/fomo.mjs rawAt 의 앞 여섯과 같은 식 · 종가 대신 업종 지수) ── */
const PRICE6 = Object.freeze([['return10', '추세'], ['acceleration', '추세'], ['upDays', '추세'], ['maGap', '가격 위치'], ['breakout', '가격 위치'], ['upVariation', '가격 위치']]);
/** i 날의 여섯 값 — v: 지수 줄(모두 양수) */
export function price6At(v, i) {
  const out = Object.fromEntries(PRICE6.map(([id]) => [id, null]));
  if (i - 10 < 0) return out;
  const r = []; for (let k = i - 9; k <= i; k++) r.push(Math.log(v[k] / v[k - 1]));
  out.return10 = sum(r); out.acceleration = sum(r.slice(5)) - sum(r.slice(0, 5)); out.upDays = r.filter(x => x > 0).length / 10;
  const sq = sum(r.map(x => x * x)); out.upVariation = sq > 0 ? sum(r.map(x => Math.max(0, x) ** 2)) / sq : 0.5;
  if (i - 19 >= 0) out.maGap = v[i] / mean(v.slice(i - 19, i + 1)) - 1;
  if (i - 60 >= 0) out.breakout = v[i] / Math.max(...v.slice(i - 60, i)) - 1;
  return out;
}
export const midRank = (value, ref) => (!finite(value) || !ref.length ? null : 100 * ref.reduce((n, x) => n + (x < value ? 1 : x === value ? 0.5 : 0), 0) / ref.length);
function rankArray(a) { const s = [...a].sort((x, y) => x - y), rk = new Map(); for (let i = 0; i < s.length;) { let j = i + 1; while (j < s.length && s[j] === s[i]) j++; rk.set(s[i], 100 * (i + (j - i) / 2) / s.length); i = j; } return a.map(x => rk.get(x)); }
function corr(a, b) { const ma = mean(a), mb = mean(b); let c = 0, aa = 0, bb = 0; for (let i = 0; i < a.length; i++) { const x = a[i] - ma, y = b[i] - mb; c += x * y; aa += x * x; bb += y * y; } return aa && bb ? c / Math.sqrt(aa * bb) : 0; }
/** 포모값(가격 열기) — v: 지수 줄 · i: 오늘 차례 → {score, groups, refs} · 비교 기간이 모자라면 score null */
export function fomoOf(v, i, {refs = ROT.fomoRefs, min = ROT.fomoMin} = {}) {
  const raw = price6At(v, i), ref = [];
  for (let k = Math.max(0, i - refs - 9); k <= i - 10; k++) ref.push(price6At(v, k)); // 비교 기간은 모두 오늘의 10거래일이 시작되기 전에 끝남(lib/fomo.mjs 와 같음)
  const feats = PRICE6.map(([id, group]) => { const xs = ref.map(x => x[id]).filter(finite); return {id, group, value: round(raw[id]), score: finite(raw[id]) && xs.length >= min ? midRank(raw[id], xs) : null, n: xs.length}; });
  const groups = ['추세', '가격 위치'].map(name => {
    const ms = feats.filter(f => f.group === name && f.score != null);
    for (const f of ms) { let red = 0; for (const o of ms) { if (o === f) continue; const pair = ref.filter(x => finite(x[f.id]) && finite(x[o.id])); red += pair.length >= 60 ? Math.abs(corr(rankArray(pair.map(x => x[f.id])), rankArray(pair.map(x => x[o.id])))) : 1; } f.weight = 1 / (1 + red); }
    const den = sum(ms.map(f => f.weight));
    return {name, score: ms.length === 3 ? round(sum(ms.map(f => f.score * f.weight)) / den, 2) : null};
  });
  const score = groups.every(g => g.score != null) ? round(mean(groups.map(g => g.score)), 1) : null;
  return {score, groups, features: feats.map(({id, value, score: s, n}) => ({id, value, score: round(s, 2), n})), refs: ref.length};
}
/** 앞서기 시작한 날 — b ÷ a 의 마지막 바닥: 오늘부터 거꾸로 가며 가장 낮은 값을 들고 가다가, 그보다 th 넘게 높은 날을 만나면 멈춤(그 앞은 다른 흐름)
   · 바닥 근처(tol 안)에 머문 날들 가운데 가장 늦은 날 = 오르기 시작한 날(오래 나란히 가다 갈라진 경우 갈라진 날)
   · 거꾸로 lookback 끝까지 갔으면 atLeast(「넘게」) · 바닥이 오늘이면 오늘 앞 날 */
export function troughOf(b, a, T, {lookback = ROT.lookback, th = ROT.trough, tol = 0.01} = {}) {
  let m = b[T] / a[T], mi = T, found = false; const lo = Math.max(0, T - lookback);
  for (let k = T - 1; k >= lo; k--) { const r = b[k] / a[k]; if (r < m) { m = r; mi = k; } else if (r > m * (1 + th) && mi < T) { found = true; break; } }
  let s = mi; for (let k = T - 1; k > mi; k--) if (b[k] / a[k] <= m * (1 + tol)) { s = k; break; }
  if (s >= T) s = Math.max(lo, T - 1);
  return {start: s, found, atLeast: !found && mi === lo};
}
/** 포모값 → 말 다섯 등급(사장님 「숫자 대신 다섯 등급 말 · 숫자가 불가피하면 등급을 함께」) */
export const fomoWord = s => (!finite(s) ? null : s >= 80 ? '아주 높다' : s >= 60 ? '높다' : s >= 40 ? '보통' : s >= 20 ? '낮다' : '아주 낮다');

/** ③ 옮겨 간 돈(억) — a 차례 → b 차례 · g.level: 업종 시가총액 줄 · M: 전체 줄 · 업종을 모두 더하면 0 */
export const movedOf = (g, M, a, b) => g.level[b] - g.level[a] * M[b] / M[a];
/** a → b 에 가장 많이 들어간 · 빠진 업종 — 「들어가는 · 빠지는 업종」과 같은 잣대(억으로 반올림 · 0 은 뺌 · 같으면 판 차례 앞) */
export function leadOf(G, M, a, b) {
  let up = null, down = null;
  for (const g of G) {
    const v = Math.round(movedOf(g, M, a, b));
    if (v > 0 && (!up || v > up.amount)) up = {g, amount: v};
    if (v < 0 && (!down || v < down.amount)) down = {g, amount: v};
  }
  return {up, down};
}
/** ⑦ 돈의 파장 — G: [{id, label, level}] · M: 전체 줄 · days: 거래일 · T: 마지막 종가 차례 → 오래된 것부터 [{n, to, from, start, end, days, amount, fromAmount, atLeast}] */
export function wavesOf(G, M, days, T, {size = ROT.window, windows = ROT.waveWindows, keep = ROT.waves} = {}) {
  const cuts = []; // 마디 — 오래된 것부터 · [시작 차례, 끝 차례]
  for (let j = windows - 1; j >= 0; j--) { const a = T - size * (j + 1); if (a >= 0) cuts.push([a, T - size * j]); }
  const runs = [];
  for (const [a, b] of cuts) {
    const {up} = leadOf(G, M, a, b), last = runs.at(-1);
    if (!up) continue; // 들어간 업종이 없는 마디 — 어느 파장에도 넣지 않음 · 앞뒤 마디는 맞닿지 않아(last.b ≠ a) 잇지 않음
    if (last && last.g === up.g && last.b === a) last.b = b; else runs.push({g: up.g, a, b});
  }
  const first = cuts[0]?.[0];
  return runs.slice(-keep).map(({g, a, b}, i) => {
    const {down} = leadOf(G, M, a, b);
    return {n: i + 1, to: {id: g.id, label: g.label}, from: down ? {id: down.g.id, label: down.g.label} : null, start: days[a], end: days[b], days: b - a,
      amount: Math.round(movedOf(g, M, a, b)), fromAmount: down?.amount ?? null, atLeast: a === first};
  });
}

/**
 * 돈의 이동 — assets: input.json 의 회사(prices · quality.marketCapEok) · groups: 판 업종([{id, label, codes}]) ·
 *   sessions: 거래일(오름차순) · asOf: 판 날짜 · capDay: 시가총액을 잰 날(그날 이전 마지막 거래일 종가가 기준) · flows: 관측 묶음 flows([{code, rows}])
 */
export function buildRotation({assets, groups, sessions, asOf, capDay, flows = [], place = 'kr', daily = false}) {
  const days = (sessions ?? []).filter(d => ISO.test(d) && d <= asOf);
  const T = days.length - 1;
  if (T < ROT.window + 1 || !groups?.length) return {schema: ROT.schema, none: true, reason: '거래일이 모자람'};
  const byCode = new Map((assets ?? []).map(a => [a.code, a]));
  const refDay = days.filter(d => d <= capDay).at(-1) ?? days[T];
  const G = groups.map(g => {
    const members = (g.codes ?? []).map(code => {
      const a = byCode.get(code); if (!a) return null;
      const closes = closeMap(a.prices, asOf), cap = a.quality?.marketCapEok;
      const ref = closes.get(refDay) ?? [...closes.entries()].filter(([d]) => d <= refDay).sort((x, y) => x[0].localeCompare(y[0])).at(-1)?.[1];
      return finite(cap) && cap > 0 && finite(ref) ? {code, cap, closes, ref} : null;
    }).filter(Boolean);
    const idx = chainIndex(days, members), kRef = days.indexOf(refDay);
    const capRef = sum(members.map(m => m.cap));
    const level = idx.map(x => capRef * x / idx[kRef]); // 억 원
    return {id: g.id, label: g.label, n: members.length, idx, level, codes: members.map(m => m.code)};
  }).filter(g => g.n > 0);
  const M = days.map((_, k) => sum(G.map(g => g.level[k])));
  const t0 = T - ROT.window;
  const moved = (g, a, b) => movedOf(g, M, a, b);
  const rows = G.map(g => ({id: g.id, label: g.label, n: g.n, amount: Math.round(moved(g, t0, T)), change: round(g.idx[T] / g.idx[t0] - 1), share0: round(g.level[t0] / M[t0]), share1: round(g.level[T] / M[T]), cap: Math.round(g.level[T])}));
  const fomo = new Map(G.map(g => [g.id, fomoOf(g.idx, T)]));
  const pick = xs => xs.slice(0, ROT.top).map(r => ({...r, fomo: fomo.get(r.id)?.score ?? null, fomoWord: fomoWord(fomo.get(r.id)?.score)}));
  const outs = pick([...rows].sort((x, y) => x.amount - y.amount).filter(r => r.amount < 0));
  const ins = pick([...rows].sort((x, y) => y.amount - x.amount).filter(r => r.amount > 0));
  if (!outs.length || !ins.length) return {schema: ROT.schema, none: true, reason: '옮겨 간 돈이 없음'};
  // 기간 — 들어가는 업종 ÷ 빠지는 업종 지수 비가 가장 낮았던 날부터
  const A = G.find(g => g.id === outs[0].id), B = G.find(g => g.id === ins[0].id);
  const {start: s, atLeast} = troughOf(B.idx, A.idx, T, {lookback: ROT.lookback, th: ROT.trough});
  const pair = {from: {id: A.id, label: A.label}, to: {id: B.id, label: B.label}, start: days[s], end: days[T], days: T - s, atLeast,
    fromChange: round(A.idx[T] / A.idx[s] - 1), toChange: round(B.idx[T] / B.idx[s] - 1), fromMoved: Math.round(moved(A, s, T)), toMoved: Math.round(moved(B, s, T))};
  // 누가 옮겼나 — 순매매(주) × 그날 종가 · 업종마다 합
  const flowDays = new Set(), who = new Map(G.map(g => [g.id, {foreign: 0, institution: 0, individual: 0, n: 0}])), groupOf = new Map(G.flatMap(g => g.codes.map(c => [c, g.id])));
  const fiDay = daily ? new Map(G.map(g => [g.id, new Map()])) : null; // 날마다 외국인+기관(원) — 아래 daily(3판 1만 번 다시 뽑기 — 4판은 회사 날마다 값만 써서 부르지 않음)만 씀 · who 와 같은 줄만
  for (const f of flows ?? []) {
    const gid = groupOf.get(f.code), a = byCode.get(f.code); if (!gid || !a) continue;
    const closes = closeMap(a.prices, asOf), w = who.get(gid);
    for (const r of f.rows ?? []) {
      const c = closes.get(r.date); if (!ISO.test(r.date ?? '') || r.date > asOf || !finite(c)) continue;
      if (![r.foreignNet, r.institutionNet, r.individualNet].every(finite)) continue;
      w.foreign += r.foreignNet * c; w.institution += r.institutionNet * c; w.individual += r.individualNet * c; w.n++; flowDays.add(r.date);
      if (fiDay) { const m = fiDay.get(gid); m.set(r.date, (m.get(r.date) ?? 0) + (r.foreignNet + r.institutionNet) * c); }
    }
  }
  const fd = [...flowDays].sort(), whoOf = id => { const w = who.get(id); return w?.n ? {foreign: Math.round(w.foreign / 1e8), institution: Math.round(w.institution / 1e8), individual: Math.round(w.individual / 1e8)} : null; }; // 억 원
  const fomoPair = {to: fomo.get(B.id), from: fomo.get(A.id)};
  // 돈의 파장 1~5차(⑦) — 마지막 마디 = 위 10거래일이라 마지막 파장의 들어간 업종 = pair.to(checkRotation 이 맞댐)
  const waves = wavesOf(G, M, days, T);
  // 날마다 값(daily 를 달라고 할 때만 · 3판 매수 검토 후보의 1만 번 다시 뽑기 — 4판은 부르지 않음 · 사이트 story.json 에는 싣지 않음)
  //   c = 그날 옮겨 간 돈(억) = (그날 업종 시가총액 변화 − 전체와 같은 비율이었다면의 변화) × 창 끝날 전체 ÷ 그날 전체 — 창 안 열흘을 더하면 위 amount 와 같음(줄어드는 합)
  //   lr = 그날 업종 지수 로그 오르내림(열흘을 더하면 log(1 + change)) · fi = 그날 외국인+기관 순매수 × 그날 종가(억 · who 와 같은 줄)
  const dailyOut = daily ? (() => {
    const wd = days.slice(t0 + 1, T + 1), at = i => t0 + 1 + i;
    return {dates: wd, sectors: G.map(g => ({id: g.id, label: g.label,
      c: wd.map((_, i) => { const k = at(i); return (g.level[k] - g.level[k - 1] * M[k] / M[k - 1]) * M[T] / M[k]; }),
      lr: wd.map((_, i) => Math.log(g.idx[at(i)] / g.idx[at(i) - 1])),
      fi: wd.map(d => (fiDay.get(g.id).get(d) ?? 0) / 1e8)}))};
  })() : null;
  return {schema: ROT.schema, none: false, place, asOf: days[T], window: {from: days[t0], to: days[T], days: ROT.window}, capDay: refDay, total: Math.round(M[T]), groups: G.length,
    out: outs.map(r => ({...r, who: whoOf(r.id)})), in: ins.map(r => ({...r, who: whoOf(r.id)})), pair, waves,
    fomo: {to: fomoPair.to?.score ?? null, toWord: fomoWord(fomoPair.to?.score), from: fomoPair.from?.score ?? null, fromWord: fomoWord(fomoPair.from?.score), refs: fomoPair.to?.refs ?? 0,
      groups: fomoPair.to?.groups ?? [], features: fomoPair.to?.features ?? [], items: 6, of: 18},
    flows: fd.length ? {from: fd[0], to: fd.at(-1), days: fd.length} : null, ...(dailyOut ? {daily: dailyOut} : {})};
}

/** 판에 싣기 전 검사 — 비면 통과 */
export function checkRotation(r) {
  const bad = [];
  if (!r || r.schema !== ROT.schema) return ['schema'];
  if (r.none) return [];
  if (!ISO.test(r.asOf ?? '') || !ISO.test(r.pair?.start ?? '')) bad.push('날짜');
  if (!(r.out?.length && r.in?.length)) bad.push('빠지는 · 들어가는 업종');
  const net = sum([...(r.out ?? []), ...(r.in ?? [])].map(x => x.amount));
  if (r.out?.some(x => x.amount >= 0) || r.in?.some(x => x.amount <= 0)) bad.push('방향');
  if (r.fomo?.to != null && !(r.fomo.to >= 0 && r.fomo.to <= 100)) bad.push('포모값 범위');
  if (!finite(net)) bad.push('합');
  // 돈의 파장(⑦) — 1차부터 차례 · 날짜는 오래된 것부터 겹치지 않게 · 들어간 돈 > 0 · 빠진 돈 < 0 · 마지막 = 지금 들어가는 업종 · 마지막 종가 날
  const W = Array.isArray(r.waves) ? r.waves : [], int = x => Number.isInteger(x);
  if (!W.length || W.length > ROT.waves) bad.push('파장 수');
  if (W.some((w, i) => w?.n !== i + 1)) bad.push('파장 차례');
  if (W.some((w, i) => !ISO.test(w?.start ?? '') || !ISO.test(w?.end ?? '') || !(w.start < w.end) || (i > 0 && !(W[i - 1]?.end <= w.start)))) bad.push('파장 날짜');
  if (W.some(w => !(int(w?.days) && w.days > 0))) bad.push('파장 기간');
  if (W.some(w => !(int(w?.amount) && w.amount > 0 && int(w?.fromAmount) && w.fromAmount < 0))) bad.push('파장 방향');
  if (W.some(w => !w?.to?.id || !w?.from?.id || w.to.id === w.from.id)) bad.push('파장 업종');
  if (W.length && (W.at(-1)?.to?.id !== r.pair?.to?.id || W.at(-1)?.end !== r.asOf)) bad.push('마지막 파장 ≠ 지금 들어가는 업종');
  return bad;
}
