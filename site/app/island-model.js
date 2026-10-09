/* ATLAS 11 · 「후보 7」 섬 — 셈만(화면 없음 · 다른 모듈을 읽지 않음 · node 시험 tests/atlas11/island.test.mjs)
   사장님 2026-10-09 17:02(마카오) 「잡스가 이 아틀란스를 개선한다면 3d방식으로 입체감과 정적인 상태를 만들고 상호 직용속에 유기적인 아틀란스를 만든다면」
   → 17:36 「어 변경하고 아주 색시한 전달력 있개 만들어서 반영해」 — 첫 화면 탑 일곱 줄(land3d.js)을 섬 하나로
   · 섬 = 판 읽기의 365곳 모두 · 한 곳 = 탑 하나 · 업종마다 십자 모양 다섯 칸 구역(격자 (2,1) · (−1,2) 로 빈틈없이 깔림) · 센 업종(탑 높이 평균)이 가운데
   · 탑 높이 = 1년 추세 차례(같은 무리 안 차례 — 값을 높이로 읽게 하지 않음: 입체 부피는 위치 · 길이보다 값 읽기가 어려움 · Cleveland · McGill 1984)
   · 물 높이 = 그물 기준선 — 그물 안(판 읽기 flags 다섯째 = 1년 추세 상위 20%)은 물 위 · 그물 밖은 물 아래 · 1년 추세를 셀 수 없는 곳은 바닥(높이 0)
   · 20거래일 전 높이(hP) = 같은 셈을 20거래일 전 1년 추세 · 그 날 기준선(grow.qp)으로 — 「재생」에서 7곳이 물 아래에서 올라옴
   · 값은 모두 판 읽기(lens.json — cand.grow.m · cand.flags · cand.items)에서 · 지어내지 않음 */
export const ISL = Object.freeze({water: 0.33, arms: [[0, 0], [1, 0], [0, 1], [-1, 0], [0, -1]], per: 5});
export const A = 0.40; // 탑 한 변의 반(칸 = 1) — 탑 사이 길
/** 지도 섬(islandmap.js · 모든 화면 그림 칸 맨 아래) 모양 — 높이 = 폭 × h · 가운데 = 높이 × cy · 탑 최대 = 폭 × z · 눕힘 tilt · 처음 각도 th
 *  2026-10-09 21:37 「슬기롭게」 — 눕힘 0.5 → 0.7 · 탑 0.2 → 0.15: 처음 모습에서 앞 탑에 통째로 가린 업종 5~7개 → 0개(3단 클릭 · 백만 번 맞대기가 날마다 잼) */
export const MAP = Object.freeze({h: 0.8, cy: 0.55, z: 0.15, tilt: 0.7, th: 0.62});
/** 지도 섬 자리 셈 값 — 폭 W(px) · 각도 th */
export const mapView = (W, th = MAP.th) => ({th, s: (W - 12) / 26.4, cx: W / 2, cy: Math.round(W * MAP.h) * MAP.cy, tilt: MAP.tilt, zmax: W * MAP.z});

const fin = v => typeof v === 'number' && Number.isFinite(v);
const cmp = (a, b) => (a < b ? -1 : a > b ? 1 : 0);

/** 무리(물 위 · 물 아래) 안 차례로 높이(0~1) — 물 위 = 물 높이 + 0.03 ~ 1 · 물 아래 = 0.02 ~ 물 높이 − 0.03 · 값 없음 = 0 */
function heightsOf(vals, up, codes, w) {
  const n = vals.length, h = new Array(n).fill(0), hi = [], lo = [];
  for (let i = 0; i < n; i++) if (vals[i] !== null) (up[i] ? hi : lo).push(i);
  const by = (a, b) => (vals[a] - vals[b]) || cmp(codes[a], codes[b]);
  hi.sort(by); lo.sort(by);
  hi.forEach((i, r) => { h[i] = w + 0.03 + (1 - w - 0.03) * (hi.length > 1 ? r / (hi.length - 1) : 1); });
  lo.forEach((i, r) => { h[i] = 0.02 + (w - 0.05) * (lo.length > 1 ? r / (lo.length - 1) : 0.5); });
  return h;
}

/** 십자 구역 가운데 자리 — 격자 i·(2,1) + j·(−1,2) 를 가운데에서 가까운 차례(같으면 각도)로 k 개 */
export function centersOf(k) {
  const R = Math.ceil(Math.sqrt(k)) + 4, pts = [];
  for (let i = -R; i <= R; i++) for (let j = -R; j <= R; j++) pts.push([2 * i - j, i + 2 * j]);
  pts.sort((a, b) => (a[0] ** 2 + a[1] ** 2) - (b[0] ** 2 + b[1] ** 2) || Math.atan2(a[1], a[0]) - Math.atan2(b[1], b[0]));
  return pts.slice(0, k);
}

/**
 * 섬 한 장의 값 — C = 판 읽기 후보 묶음(lens.cand · 규칙 cand-rules-5) · stocks = 판 읽기 종목(lens.stocks · code · name · g · gl)
 * 반환 {w, cells[], seven[], above, green, districts, sectors} 또는 null(값이 없음 — 그리지 않음)
 *   cell = {code, name, sec, x, y, d, hN, hP, up(물 위 = 그물 안), elig(그날 종가 · 흑자 · 위험 공시 없음), rank(후보 순위 · 아니면 0), m12(1년 추세 % 소수 첫째 자리), m12p(20거래일 전 1년 추세 %), status}
 */
export function islandModel(C, stocks) {
  const G = C?.grow, M = G?.m, F = C?.flags ?? {};
  if (!G || !M || !Array.isArray(stocks) || !stocks.length) return null;
  const w = ISL.water, codes = stocks.map(s => String(s.code));
  const m = codes.map(c => (fin(M[c]?.[0]) ? M[c][0] : null)), mp = codes.map(c => (fin(M[c]?.[1]) ? M[c][1] : null));
  const up = codes.map((c, i) => String(F[c] ?? '')[4] === '1' && m[i] !== null); // 그물 안 = 판 읽기 flags 다섯째(1년 추세 상위 20%)
  const elig = codes.map(c => String(F[c] ?? '').slice(0, 3) === '111');
  const qp = fin(G.qp) ? G.qp / 100 : null, upP = mp.map(v => v !== null && qp !== null && v >= qp); // 20거래일 전 그물 안 — 그 날 기준선(grow.qp · %)
  const hN = heightsOf(m, up, codes, w), hP = heightsOf(mp, upP, codes, w);
  const rankOf = new Map((C.items ?? []).map(x => [String(x.code), x.rank])), stOf = new Map((C.items ?? []).map(x => [String(x.code), x.status]));
  // 업종 — 탑 높이 평균이 큰 업종부터 가운데 · 업종 안은 높은 탑부터 십자 가운데 → 팔
  const by = new Map();
  stocks.forEach((s, i) => { const k = String(s.g ?? s.gl ?? '기타'); if (!by.has(k)) by.set(k, {key: k, label: s.gl ?? s.g ?? '업종 없음', idx: []}); by.get(k).idx.push(i); }); // 업종 키 = 판 읽기 g(업종 화면 주소 #/i/<g>)
  const secs = [...by.values()].map(g => ({...g, mean: g.idx.reduce((t, i) => t + hN[i], 0) / g.idx.length}));
  secs.sort((a, b) => (b.mean - a.mean) || cmp(a.key, b.key));
  const groups = []; // 다섯 칸씩(업종이 다섯을 넘으면 이웃 구역으로 이어짐)
  for (const g of secs) { const idx = [...g.idx].sort((a, b) => (hN[b] - hN[a]) || cmp(codes[a], codes[b])); for (let k = 0; k < idx.length; k += ISL.per) groups.push({sec: g.label, idx: idx.slice(k, k + ISL.per)}); }
  const cen = centersOf(groups.length), cells = new Array(stocks.length);
  groups.forEach((g, d) => g.idx.forEach((i, k) => {
    const [ax, ay] = ISL.arms[k], s = stocks[i];
    cells[i] = {code: codes[i], name: s.name ?? codes[i], sec: g.sec, g: s.g != null ? String(s.g) : null, x: cen[d][0] + ax, y: cen[d][1] + ay, d, hN: hN[i], hP: hP[i], up: up[i], elig: elig[i],
      rank: rankOf.get(codes[i]) ?? 0, m12: m[i] === null ? null : Number((m[i] * 100).toFixed(1)), m12p: mp[i] === null ? null : Number((mp[i] * 100).toFixed(1)), status: stOf.get(codes[i]) ?? null}; // m12p = 20거래일 전 1년 추세(%) — 재생 첫 걸음 위 이름표
  }));
  const seven = [...(C.items ?? [])].sort((a, b) => a.rank - b.rank).map(x => codes.indexOf(String(x.code))).filter(i => i >= 0);
  return {w, cells, seven, above: cells.filter(c => c.hN > w).length, green: cells.filter(c => c.hN > w && c.elig).length, districts: groups.length, sectors: secs.length};
}

/* ═════════ 3단 클릭(사장님 2026-10-09 21:33 마카오 「아틀란스를 3단 클릭구조로 만든다 모든곳에 하나도 빠짐없이 … 점검 1000000만번」 · 21:37 「슬기롭게 해」 · 규칙 17 「지도는 세 번이면 회사」를 모든 섬으로)
   섬(지도) → 누르면 그 회사와 그 업종이 함께(이름표 「회사 보기 ›」 · 섬 아래 업종 칸 「업종 보기 ›」 + 같은 업종 회사 이름) → 누르면 그 화면
   · 같은 탑을 다시 누르거나 빈 곳을 누르면 처음으로 — 첫 화면 섬(island.js)과 모든 화면 지도 섬(islandmap.js)이 같은 셈
   · 가린 탑(앞 탑 뒤)은 섬을 돌리거나 탐색 탭 지도 색인(갈래 → 업종 → 회사)으로 — 「3번이면 회사」는 화면 고리로 보장(빠짐없이 도는 검사가 모든 화면 쌍을 잼) ═════════ */
/** 업종 키 — 판 읽기 g(없으면 구역 번호) */
export const zoneOf = c => (c.g != null ? `g:${c.g}` : `d:${c.d}`);
/** 누름 한 번 — st = {z: 고른 업종 키 | null, i: 고른 회사 칸 | -1} · j = 누른 칸(-1 = 빈 곳) → 다음 상태 */
export function tapStep(cells, st, j) {
  if (!(j >= 0) || !cells[j]) return {z: null, i: -1};
  if (st?.i === j) return {z: null, i: -1}; // 같은 탑을 다시 → 닫음(처음)
  return {z: zoneOf(cells[j]), i: j}; // 그 회사 + 그 업종
}
/** 지금 상태의 이름표 · 업종 칸 값 — {co: {name, sec, code, href}, zone: {label, g, href, cos: [{code, name, href, on}]}} · 없음 = null */
export function tapInfo(cells, st) {
  if (!(st?.i >= 0) || !cells[st.i]) return null;
  const c = cells[st.i], cs = cells.filter(x => zoneOf(x) === st.z).sort((a, b) => (b.hN - a.hN) || (a.code < b.code ? -1 : a.code > b.code ? 1 : 0));
  return {co: {name: c.name, sec: c.sec, code: c.code, href: `#/stock/${c.code}`},
    zone: {label: c.sec, g: c.g, href: c.g != null ? `#/i/${c.g}` : null, cos: cs.map(x => ({code: x.code, name: x.name, href: `#/stock/${x.code}`, on: x.code === c.code}))}};
}

/* ═════════ 섬 그림의 자리 셈(화면 없음 · 첫 화면 섬 · 지도 섬 · 백만 번 맞대기가 같은 셈) — v = {th 돎 각도, s 칸 크기, cx · cy 가운데, tilt 눕힘, zmax 탑 최대 높이(px)} ═════════ */
export function projOf(v) { const sn = Math.sin(v.th), cs = Math.cos(v.th); return (x, y, z) => { const xr = x * cs - y * sn, yr = x * sn + y * cs; return [v.cx + xr * v.s, v.cy + yr * v.s * v.tilt - z * v.zmax]; }; }
export const cornersOf = c => [[c.x - A, c.y - A], [c.x + A, c.y - A], [c.x + A, c.y + A], [c.x - A, c.y + A]];
export function hullOf(p) { p = p.slice().sort((a, b) => a[0] - b[0] || a[1] - b[1]); const cr = (o, a, b) => (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0]), lo = [], up = [];
  for (const q of p) { while (lo.length >= 2 && cr(lo[lo.length - 2], lo[lo.length - 1], q) <= 0) lo.pop(); lo.push(q); }
  for (let k = p.length - 1; k >= 0; k--) { const q = p[k]; while (up.length >= 2 && cr(up[up.length - 2], up[up.length - 1], q) <= 0) up.pop(); up.push(q); }
  up.pop(); lo.pop(); return lo.concat(up); }
export function insideHull(hl, x, y) { let sg = 0; for (let k = 0; k < hl.length; k++) { const a = hl[k], b = hl[(k + 1) % hl.length], c = (b[0] - a[0]) * (y - a[1]) - (b[1] - a[1]) * (x - a[0]); if (c !== 0) { const t = c > 0 ? 1 : -1; if (!sg) sg = t; else if (t !== sg) return false; } } return true; }
/** 탑 하나의 테두리(바닥 · 꼭대기 여덟 점의 껍질) */
export function towerHull(c, P, z) { const pts = []; for (const [x, y] of cornersOf(c)) pts.push(P(x, y, 0), P(x, y, Math.max(z, 0.006))); return hullOf(pts); }
/** 누른 점(px, py) 의 탑 — 앞(보는 쪽)에서부터 · 없으면 −1 */
export function hitCell(cells, v, zOf, px, py) {
  const P = projOf(v), sn = Math.sin(v.th), cs = Math.cos(v.th), front = cells.map((_, i) => i).sort((a, b) => (cells[b].x * sn + cells[b].y * cs) - (cells[a].x * sn + cells[a].y * cs) || a - b);
  for (const i of front) { const hl = towerHull(cells[i], P, zOf(i)); let x0 = Infinity, x1 = -Infinity, y0 = Infinity, y1 = -Infinity;
    for (const q of hl) { if (q[0] < x0) x0 = q[0]; if (q[0] > x1) x1 = q[0]; if (q[1] < y0) y0 = q[1]; if (q[1] > y1) y1 = q[1]; }
    if (px < x0 - 1 || px > x1 + 1 || py < y0 - 1 || py > y1 + 1) continue;
    if (insideHull(hl, px, py)) return i; }
  return -1;
}
/** 그 탑을 누를 수 있는 점(앞 탑에 가리지 않은 자리 — 꼭대기 쪽부터) · 없으면 null(완전히 가린 탑) · skip(x, y) = 피할 자리(핀 · 이름표) */
export function tapPointOf(cells, v, zOf, i, skip = null) {
  const P = projOf(v), c = cells[i]; if (!c) return null; const z = Math.max(zOf(i), 0.006);
  for (const f of [1, 0.9, 0.75, 0.6, 0.45, 0.3, 0.15, 0.02]) for (const [ox, oy] of [[0, 0], [-0.2, 0], [0.2, 0], [0, 0.2], [0, -0.2], [-0.3, -0.3], [0.3, 0.3], [-0.3, 0.3], [0.3, -0.3]]) {
    const q = P(c.x + ox, c.y + oy, z * f); if (skip && skip(q[0], q[1] + 1)) continue;
    if (hitCell(cells, v, zOf, q[0], q[1] + 1) === i) return [q[0], q[1] + 1]; }
  return null;
}

