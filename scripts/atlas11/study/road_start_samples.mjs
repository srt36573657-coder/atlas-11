#!/usr/bin/env node
/**
 * ATLAS 11 공부 · 「대세 상승 초입의 출목표」 넷째 판 — 표본(진짜 회사 · 진짜 날짜 · 사이트는 바꾸지 않음)
 *   사장님 2026-10-06 11:03 「알았아 들었는데 명확하게 선명하게 다시 이야기하고 표본 샘플 제시해」
 *   그림 = 사이트 출목표 셈 그대로(site/app/road.js roadOf · 그 날까지 21개 종가 = 20거래일)
 *   크게 오름 = 그 뒤 120거래일(6달) 안 종가가 +50% 넘은 적 있음 · 크게 떨어짐 = −33.3% 아래로 간 적 있음(첫 판과 같은 잣대)
 *   그림 차이 = 왼쪽부터 줄(같은 색 동그라미 덩어리)마다 길이 차이를 모두 더한 수(= 다른 동그라미 수 · 첫 줄 색과 「동그라미 하나 = ○%」가 같을 때만 견줌)
 *   ① 크게 오르기 바로 전 날: 회사마다 「크게 오름」 날이 이어진 덩어리에서 그 뒤 가장 크게 오른 날(가장 싸게 살 수 있었던 날)
 *      보여 줄 표본 = 여섯 때(2023년 · 2024 상반기 · 2024 하반기 · 2025 상반기 · 2025 하반기 · 2026 상반기)마다 판 365곳 가운데 시가총액이 가장 큰 회사 하나(그림을 보고 고르지 않음)
 *   ② 가장 닮은 그림 30개: 다른 회사 · 아무 날 가운데 그림 차이가 가장 작은 30개 — 그 뒤 6달 크게 오름/떨어짐 수
 *   ③ 똑같은 그림 짝: 동그라미 하나까지 같은 그림(그림 차이 0) — 한쪽은 6달 안에 크게 오르고, 다른 쪽은 크게 떨어짐(그 전에 10% 넘게 오르지도 않음)
 *      두 가지 차례로 하나씩: 동그라미가 가장 많은(가장 복잡한) 짝 · 시가총액이 가장 큰 회사가 들어간 짝
 *   ④ 닮은 그림 숫자: 「크게 오르기 바로 전 날」 · 「크게 떨어지기 바로 전 날」 · 아무 날에서 1,000개씩 뽑아 가장 닮은 그림 30개의 앞날
 *      날짜가 6달(120거래일) 넘게 떨어진 닮은 그림만 센 값도 함께(같은 시기 시장 탓을 걷어 냄)
 *   ⑤ 1달 「빨강이 파랑의 2배」: 같은 날 이 모양이던 365곳 회사들의 한 달(20거래일) 뒤 — +30% 넘게 오름 · −23% 넘게 떨어짐
 *   쓰는 법: node scripts/atlas11/study/road_start_samples.mjs --out reports/atlas11/study/road-start/samples.json
 */
import fs from 'node:fs';
import zlib from 'node:zlib';
import {roadOf} from '../../../site/app/road.js';
import {SHAPES} from '../../../site/app/shapes.js';

const arg = (k, d = null) => { const i = process.argv.indexOf(k); return i > 0 ? process.argv[i + 1] : d; };
const OUT = arg('--out', 'reports/atlas11/study/road-start/samples.json');
const WIN = 20, AHEAD = 120, UP = 1.5, DOWN = 1 / UP, JUMP = 0.31, MONTH = 20, UPM = 1.3, DOWNM = 1 / UPM, K = 30, FAR = 120, SAMPLE = 1000, MIN_DAY = 20;
const PERIODS = [['2023년(5~12월)', '20230101', '20231231'], ['2024 상반기', '20240101', '20240630'], ['2024 하반기', '20240701', '20241231'], ['2025 상반기', '20250101', '20250630'], ['2025 하반기', '20250701', '20251231'], ['2026 상반기', '20260101', '20260630']];
const BUNDLE = 'reports/atlas11/universe/2026-10-05-0940/bundle.json.gz', PROPOSAL = 'reports/atlas11/universe/2026-10-05-0940/proposal.json', BOARD = 'public/data/atlas11/view/board.json';
const redTwice = SHAPES.find(s => s.id === 'redTwice').test;

const bundle = JSON.parse(zlib.gunzipSync(fs.readFileSync(BUNDLE)));
const prop = JSON.parse(fs.readFileSync(PROPOSAL, 'utf8'));
const board = JSON.parse(fs.readFileSync(BOARD, 'utf8'));
const inBoard = new Set(board.companies.map(c => c.code));
const capRank = new Map([...prop.picked, ...prop.notPicked].map(x => [x.code, x.capRank]));
const nameOf = code => bundle.stocks[code]?.list?.name ?? code;
const rankOf = code => capRank.get(code) ?? 9999;

/* 1) 날마다 그림 — 첫 판(road_start.mjs)과 같은 날들(앞 20 · 뒤 120거래일 안에 하루 ±31% 넘는 자료 끊김이 있으면 뺌) */
const S = [], W = [];
const runsOf = cells => { const out = []; for (const c of cells) { const l = out.at(-1); if (l && l.side === c.side) l.n++; else out.push({side: c.side, n: 1}); } return out; };
for (const code of Object.keys(bundle.stocks)) {
  const rows = bundle.stocks[code]?.fchart?.rows;
  if (!Array.isArray(rows) || rows.length < WIN + 1 + AHEAD) continue;
  const ds = rows.map(r => String(r[0])), cs = rows.map(r => Number(r[4]));
  if (cs.some(v => !(v > 0))) continue;
  const bad = [0]; for (let i = 1; i < cs.length; i++) bad.push(bad[i - 1] + (Math.abs(cs[i] / cs[i - 1] - 1) > JUMP ? 1 : 0));
  const si = S.length; S.push({code, ds, cs, board: inBoard.has(code)});
  for (let t = WIN; t + AHEAD < cs.length; t++) {
    if (bad[t + AHEAD] - bad[t - WIN] > 0) continue;
    const road = roadOf(cs.slice(t - WIN, t + 1));
    const runs = runsOf(road.cells);
    let f120 = -Infinity, g120 = Infinity, f20 = -Infinity, g20 = Infinity;
    for (let k = t + 1; k <= t + AHEAD; k++) { const r = cs[k] / cs[t]; if (r > f120) f120 = r; if (r < g120) g120 = r; if (k <= t + MONTH) { if (r > f20) f20 = r; if (r < g20) g20 = r; } }
    const lens = runs.map(x => x.n);
    W.push({si, t, date: ds[t], u: Math.round(road.unit * 100), first: runs[0]?.side ?? '-', lens, tot: road.all.up + road.all.down, up: road.all.up, down: road.all.down, f120, g120, f20, g20, rt: redTwice(road) ? 1 : 0});
  }
}
const N = W.length;
for (const w of W) w.key = `${w.u}|${w.first}|${w.lens.join('.')}`;
const byKey = new Map(); W.forEach((w, i) => { let a = byKey.get(w.key); if (!a) byKey.set(w.key, a = []); a.push(i); });
const isUp = w => w.f120 >= UP, isDn = w => w.g120 <= DOWN, fellOnly = w => isDn(w) && w.f120 < 1.1;
const baseUp = W.filter(isUp).length / N, baseDn = W.filter(isDn).length / N;
// 날마다 보통 비율(1,287곳 · 365곳) — 같은 날 시장 몫
const dayAgg = new Map(), dayBoard = new Map();
for (const w of W) { for (const [m, on] of [[dayAgg, true], [dayBoard, S[w.si].board]]) { if (!on) continue; const a = m.get(w.date) ?? {n: 0, up: 0, dn: 0}; a.n++; a.up += isUp(w); a.dn += isDn(w); m.set(w.date, a); } }
const dayUp = d => dayAgg.get(d).up / dayAgg.get(d).n, dayDn = d => dayAgg.get(d).dn / dayAgg.get(d).n;
const allDates = [...dayAgg.keys()].sort(); const dIdx = new Map(allDates.map((d, i) => [d, i]));

/* 2) 크게 오르기(떨어지기) 바로 전 날 — 회사마다 덩어리(이어진 t)에서 가장 크게 오른(떨어진) 날 */
function anchors(test, score) {
  const out = []; let blk = [];
  const flush = () => { if (blk.length) { out.push(blk.reduce((a, b) => (score(W[b]) > score(W[a]) ? b : a))); blk = []; } };
  for (let i = 0; i < N; i++) {
    const w = W[i], prev = W[i - 1];
    if (!(prev && prev.si === w.si && prev.t === w.t - 1)) flush();
    if (test(w)) blk.push(i); else flush();
  }
  flush();
  return out;
}
const upA = anchors(isUp, w => w.f120), dnA = anchors(isDn, w => -w.g120);

/* 3) 가장 닮은 그림 K개 — 같은 「동그라미 하나 = ○%」 · 같은 첫 줄 색 · 다른 회사 · 그림 차이(다른 동그라미 수)가 작은 순(같으면 앞 번호) */
const groups = new Map(); W.forEach((w, i) => { const k = w.u + '|' + w.first; let a = groups.get(k); if (!a) groups.set(k, a = []); a.push(i); });
for (const a of groups.values()) a.sort((x, y) => W[x].tot - W[y].tot || x - y);
function dist(a, b, cap) { const m = Math.max(a.length, b.length); let s = 0; for (let i = 0; i < m; i++) { s += Math.abs((a[i] ?? 0) - (b[i] ?? 0)); if (s > cap) return s; } return s; }
function knn(qi, {k = K, far = 0} = {}) {
  const q = W[qi], g = groups.get(q.u + '|' + q.first) ?? [], best = [];
  const cap = () => (best.length < k ? Infinity : best[best.length - 1].d);
  let lo = 0, hi = g.length; while (lo < hi) { const mid = (lo + hi) >> 1; if (W[g[mid]].tot < q.tot) lo = mid + 1; else hi = mid; }
  let L = lo - 1, R = lo;
  while (L >= 0 || R < g.length) {
    const dl = L >= 0 ? q.tot - W[g[L]].tot : Infinity, dr = R < g.length ? W[g[R]].tot - q.tot : Infinity;
    if (Math.min(dl, dr) > cap()) break;
    const j = dl <= dr ? g[L--] : g[R++], x = W[j];
    if (x.si === q.si || (far && Math.abs(dIdx.get(x.date) - dIdx.get(q.date)) <= far) || Math.abs(x.lens.length - q.lens.length) > cap()) continue;
    const d = dist(q.lens, x.lens, cap()); if (d > cap()) continue;
    let p = best.length; best.push(null);
    while (p > 0 && (best[p - 1].d > d || (best[p - 1].d === d && best[p - 1].j > j))) { best[p] = best[p - 1]; p--; }
    best[p] = {j, d}; if (best.length > k) best.pop();
  }
  return best;
}
const tally = list => { const n = list.length; if (!n) return {n: 0}; let up = 0, dn = 0, eu = 0, ed = 0, dsum = 0, dmax = 0; for (const {j, d} of list) { const x = W[j]; up += isUp(x); dn += isDn(x); eu += dayUp(x.date); ed += dayDn(x.date); dsum += d; dmax = Math.max(dmax, d); } return {n, up, dn, mid: n - up - dn + list.filter(({j}) => isUp(W[j]) && isDn(W[j])).length, pUp: up / n, pDn: dn / n, sameDayUp: eu / n, sameDayDn: ed / n, diffAvg: dsum / n, diffMax: dmax}; };

/* 4) 닮은 그림 숫자 — 무리마다 1,000개(정해 둔 씨앗으로 뽑음) · 그림 하나에 같은 무게 */
let seed = 20261006; const rnd = () => (seed = (seed * 1103515245 + 12345) % 2147483648) / 2147483648;
const pick = (arr, n) => { const s = new Set(); while (s.size < Math.min(n, arr.length)) s.add(arr[Math.floor(rnd() * arr.length)]); return [...s].sort((a, b) => a - b); };
const allIdx = Array.from({length: N}, (_, i) => i);
const groupsOfTest = {beforeRise: pick(upA, SAMPLE), beforeFall: pick(dnA, SAMPLE), anyDay: pick(allIdx, SAMPLE)};
function groupTest(idx, opt) {
  let sUp = 0, sDn = 0, sEu = 0, sEd = 0, sD = 0, own = 0, ownD = 0, ownEu = 0, ownEd = 0;
  for (const i of idx) { const tl = tally(knn(i, opt)); sUp += tl.pUp; sDn += tl.pDn; sEu += tl.sameDayUp; sEd += tl.sameDayDn; sD += tl.diffAvg; const w = W[i]; own += isUp(w); ownD += isDn(w); ownEu += dayUp(w.date); ownEd += dayDn(w.date); }
  const n = idx.length;
  return {n, ownUp: own / n, ownDn: ownD / n, ownSameDayUp: ownEu / n, ownSameDayDn: ownEd / n, pUp: sUp / n, pDn: sDn / n, sameDayUp: sEu / n, sameDayDn: sEd / n, adjUp: sUp / sEu, adjDn: sDn / sEd, diffAvg: sD / n};
}
const twinTest = {};
for (const [name, idx] of Object.entries(groupsOfTest)) twinTest[name] = {all: groupTest(idx), far: groupTest(idx, {far: FAR})};

/* 그림 · 길 자료(카드 · 보고서용) */
const pic = i => { const w = W[i], s = S[w.si]; return roadOf(s.cs.slice(w.t - WIN, w.t + 1)).cells.map(c => [c.col, c.row, c.side === 'up' ? 1 : 0]); };
const path = (i, after) => { const w = W[i], s = S[w.si], base = s.cs[w.t]; return s.cs.slice(w.t - WIN, w.t + after + 1).map(v => +(v / base).toFixed(4)); };
const ext = (i, after, hi) => { const w = W[i], s = S[w.si]; let b = w.t + 1; for (let k = w.t + 1; k <= w.t + after; k++) if (hi ? s.cs[k] > s.cs[b] : s.cs[k] < s.cs[b]) b = k; return {date: s.ds[b], days: b - w.t, x: +(s.cs[b] / s.cs[w.t]).toFixed(4)}; };
const card = (i, after = AHEAD) => { const w = W[i], s = S[w.si]; const db = dayBoard.get(w.date);
  return {code: s.code, name: nameOf(s.code), capRank: rankOf(s.code), inBoard: s.board, date: w.date, close: s.cs[w.t], unit: w.u, up: w.up, down: w.down, cols: w.lens.length, key: w.key,
    f120: +w.f120.toFixed(4), g120: +w.g120.toFixed(4), f20: +w.f20.toFixed(4), g20: +w.g20.toFixed(4), peak: ext(i, after, true), low: ext(i, after, false), cells: pic(i), path: path(i, after),
    day365: db ? {n: db.n, up: db.up, dn: db.dn} : null}; };

/* ① 보여 줄 「크게 오르기 바로 전 날」 — 반년마다 시가총액이 가장 큰 회사 하나(같은 회사는 한 번만) */
const used = new Set(), rise = [];
for (const [label, from, to] of PERIODS) {
  const cand = upA.filter(i => S[W[i].si].board && W[i].date >= from && W[i].date <= to && !used.has(W[i].si)).sort((a, b) => rankOf(S[W[a].si].code) - rankOf(S[W[b].si].code) || W[b].f120 - W[a].f120);
  if (!cand.length) continue; const i = cand[0]; used.add(W[i].si);
  const nb = knn(i), nf = knn(i, {far: FAR});
  const near1 = nb.filter(x => x.d === nb[0].d).sort((a, b) => rankOf(S[W[a.j].si].code) - rankOf(S[W[b.j].si].code) || a.j - b.j)[0];
  const fell = nb.find(x => fellOnly(W[x.j]));
  rise.push({period: label, ...card(i), near: tally(nb), nearFar: tally(nf), nearest: near1 ? {...card(near1.j), diff: near1.d} : null, nearestFell: fell ? {...card(fell.j), diff: fell.d} : null});
}

/* ③ 똑같은 그림 짝 — 그림 차이 0 · 다른 회사 · 한쪽 크게 오름 · 다른 쪽 크게 떨어짐(그 전 10% 넘게 오르지도 않음) · 동그라미 12개 이상
   차례: 두 회사 모두 365곳 → 동그라미가 많은 그림(더 복잡한 그림) → 두 회사 가운데 작은 쪽 시가총액이 큰 짝 */
const pairCands = [];
for (const [key, idx] of byKey) {
  if (idx.length < 2 || W[idx[0]].tot < 12) continue;
  const ups = idx.filter(i => isUp(W[i])), dns = idx.filter(i => fellOnly(W[i])); if (!ups.length || !dns.length) continue;
  let best = null;
  for (const a of ups) for (const b of dns) { if (W[a].si === W[b].si) continue; const ca = S[W[a].si].code, cb = S[W[b].si].code;
    const c = {a, b, both: S[W[a].si].board + S[W[b].si].board, fame: Math.max(rankOf(ca), rankOf(cb)), swing: W[a].f120 / W[b].g120};
    if (!best || c.both > best.both || (c.both === best.both && (c.fame < best.fame || (c.fame === best.fame && c.swing > best.swing)))) best = c; }
  if (best) pairCands.push({key, tot: W[idx[0]].tot, n: idx.length, ...best});
}
pairCands.sort((p, q) => q.both - p.both || q.tot - p.tot || p.fame - q.fame || q.swing - p.swing);
const pairs = []; const usedCo = new Set();
const pairOut = (p, why) => { const grp = byKey.get(p.key).map(j => ({j, d: 0})); return {why, rise: card(p.a), fall: card(p.b), same: tally(grp), sameCompanies: new Set(grp.map(x => W[x.j].si)).size,
  members: grp.map(({j}) => ({name: nameOf(S[W[j].si].code), code: S[W[j].si].code, date: W[j].date, f120: +W[j].f120.toFixed(4), g120: +W[j].g120.toFixed(4)}))}; };
for (const p of pairCands) { const a = W[p.a].si, b = W[p.b].si; if (usedCo.has(a) || usedCo.has(b)) continue; pairs.push(pairOut(p, '동그라미가 가장 많은 짝')); usedCo.add(a); usedCo.add(b); if (pairs.length >= 3) break; }
// 시가총액이 가장 큰 회사가 들어간 짝(모든 짝 가운데 · 같으면 동그라미가 많은 짝) — 그 그림에서 그 회사의 짝을 다시 고름
let famousPair = null;
for (const [key, idx] of byKey) {
  if (idx.length < 2 || W[idx[0]].tot < 12) continue;
  for (const a of idx) { if (!isUp(W[a])) continue; for (const b of idx) { if (!fellOnly(W[b]) || W[a].si === W[b].si) continue;
    const top = Math.min(rankOf(S[W[a].si].code), rankOf(S[W[b].si].code)), other = Math.max(rankOf(S[W[a].si].code), rankOf(S[W[b].si].code));
    const c = {key, a, b, top, other, tot: W[a].tot};
    if (!famousPair || c.top < famousPair.top || (c.top === famousPair.top && (c.tot > famousPair.tot || (c.tot === famousPair.tot && c.other < famousPair.other)))) famousPair = c; } }
}
if (famousPair && !pairs.some(p => p.rise.key === famousPair.key)) pairs.push(pairOut(famousPair, '시가총액이 가장 큰 회사가 들어간 짝'));

/* ⑤ 1달 「빨강이 파랑의 2배」 — 같은 날 365곳(그 날 이 모양 회사가 20곳 이상인 날만) · 가장 많이 오른 날과 가장 많이 떨어진 날 */
const byDate = new Map(); W.forEach((w, i) => { if (!w.rt || !S[w.si].board) return; const a = byDate.get(w.date) ?? []; a.push(i); byDate.set(w.date, a); });
const upM = w => w.f20 >= UPM, dnM = w => w.g20 <= DOWNM;
const days = [...byDate].filter(([, idx]) => idx.length >= MIN_DAY).map(([d, idx]) => ({d, idx, n: idx.length, nUp: idx.filter(i => upM(W[i])).length, nDn: idx.filter(i => dnM(W[i])).length}));
const famous = (idx, test) => idx.filter(i => test(W[i])).sort((a, b) => rankOf(S[W[a].si].code) - rankOf(S[W[b].si].code) || a - b)[0];
// 그 날 보여 줄 둘: 30% 넘게 오른 회사 가운데 시가총액이 가장 큰 곳 · 23% 넘게 떨어진 회사 가운데 가장 큰 곳(없으면 그 날 가장 덜 오른 곳)
const least = idx => idx.slice().sort((a, b) => W[a].f20 - W[b].f20 || a - b)[0];
const dayCard = x => { const r = famous(x.idx, upM), f = famous(x.idx, w => dnM(w) && w.f20 < 1.05);
  return {date: x.d, n: x.n, nUp30: x.nUp, nDn23: x.nDn, rose: r !== undefined ? card(r, MONTH) : null, fell: f !== undefined ? card(f, MONTH) : null, least: f === undefined ? card(least(x.idx), MONTH) : null,
    members: x.idx.map(i => ({name: nameOf(S[W[i].si].code), capRank: rankOf(S[W[i].si].code), f20: +W[i].f20.toFixed(4), g20: +W[i].g20.toFixed(4)})).sort((a, b) => b.f20 - a.f20)}; };
const goodDay = days.slice().sort((a, b) => b.nUp / b.n - a.nUp / a.n || a.d.localeCompare(b.d))[0];
const badDay = days.slice().sort((a, b) => b.nDn / b.n - a.nDn / a.n || a.d.localeCompare(b.d))[0];
const shares = days.map(x => x.nUp / x.n).sort((a, b) => a - b);
const q = p => shares[Math.min(shares.length - 1, Math.floor(p * shares.length))];
const m365 = W.filter(w => S[w.si].board); const mRt = m365.filter(w => w.rt);
const month = {good: dayCard(goodDay), bad: dayCard(badDay), daysCounted: days.length, upShareByDay: {min: shares[0], q25: q(0.25), median: q(0.5), q75: q(0.75), max: shares.at(-1)},
  all365: {days: m365.length, base: {up30: m365.filter(upM).length / m365.length, dn23: m365.filter(dnM).length / m365.length}, redTwice: {n: mRt.length, up30: mRt.filter(upM).length / mRt.length, dn23: mRt.filter(dnM).length / mRt.length}}};

/* 「때」 — 날마다 365곳 가운데 6달 안 크게 오른 회사 비율(가장 낮은 날 · 가장 높은 날) */
const dShare = [...dayBoard].filter(([, a]) => a.n >= 200).map(([d, a]) => ({d, n: a.n, up: a.up / a.n, dn: a.dn / a.n})).sort((a, b) => a.up - b.up || a.d.localeCompare(b.d));
const when = {lowest: dShare[0], highest: dShare.at(-1), median: dShare[Math.floor(dShare.length / 2)]};

const res = {made: new Date().toISOString(), rules: {win: WIN, ahead: AHEAD, up: UP, down: DOWN, month: MONTH, upMonth: UPM, downMonth: DOWNM, k: K, far: FAR, sample: SAMPLE, minDay: MIN_DAY, periods: PERIODS, bundle: BUNDLE},
  stocks: S.length, windows: N, pictures: byKey.size, baseUp, baseDn, upAnchors: upA.length, dnAnchors: dnA.length, twinTest, rise, pairs, pairCands: pairCands.length, pairTop: pairCands.slice(0, 15).map(p => ({key: p.key, tot: p.tot, n: p.n, both: p.both, rise: [nameOf(S[W[p.a].si].code), W[p.a].date, +W[p.a].f120.toFixed(3)], fall: [nameOf(S[W[p.b].si].code), W[p.b].date, +W[p.b].g120.toFixed(3)]})), month, when};
fs.writeFileSync(OUT, JSON.stringify(res));
const brief = c => c && [c.name, c.date, c.f120, c.g120, c.diff, c.f20, c.g20];
console.log(JSON.stringify({stocks: S.length, windows: N, pictures: byKey.size, baseUp, baseDn, upA: upA.length, dnA: dnA.length, twinTest, pairCands: pairCands.length, pairTop: res.pairTop, when,
  rise: rise.map(r => ({p: r.period, n: r.name, rank: r.capRank, d: r.date, f: r.f120, g: r.g120, u: r.unit, up: r.up, dn: r.down, day365: r.day365, near: r.near, nearFar: r.nearFar, nearest: brief(r.nearest), nearestFell: brief(r.nearestFell)})),
  pairs: pairs.map(p => ({why: p.why, k: p.rise.key, rise: brief(p.rise), fall: brief(p.fall), same: p.same, cos: p.sameCompanies})),
  month: {good: {d: month.good.date, n: month.good.n, up: month.good.nUp30, dn: month.good.nDn23, rose: brief(month.good.rose), fell: brief(month.good.fell), least: brief(month.good.least)}, bad: {d: month.bad.date, n: month.bad.n, up: month.bad.nUp30, dn: month.bad.nDn23, rose: brief(month.bad.rose), fell: brief(month.bad.fell), least: brief(month.bad.least)}, days: month.daysCounted, share: month.upShareByDay, all365: month.all365}}, null, 1));
