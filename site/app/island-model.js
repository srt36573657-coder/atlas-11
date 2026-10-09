/* ATLAS 11 · 「후보 7」 섬 — 셈만(화면 없음 · 다른 모듈을 읽지 않음 · node 시험 tests/atlas11/island.test.mjs)
   사장님 2026-10-09 17:02(마카오) 「잡스가 이 아틀란스를 개선한다면 3d방식으로 입체감과 정적인 상태를 만들고 상호 직용속에 유기적인 아틀란스를 만든다면」
   → 17:36 「어 변경하고 아주 색시한 전달력 있개 만들어서 반영해」 — 첫 화면 탑 일곱 줄(land3d.js)을 섬 하나로
   · 섬 = 판 읽기의 365곳 모두 · 한 곳 = 탑 하나 · 업종마다 십자 모양 다섯 칸 구역(격자 (2,1) · (−1,2) 로 빈틈없이 깔림) · 센 업종(탑 높이 평균)이 가운데
   · 탑 높이 = 1년 추세 차례(같은 무리 안 차례 — 값을 높이로 읽게 하지 않음: 입체 부피는 위치 · 길이보다 값 읽기가 어려움 · Cleveland · McGill 1984)
   · 물 높이 = 그물 기준선 — 그물 안(판 읽기 flags 다섯째 = 1년 추세 상위 20%)은 물 위 · 그물 밖은 물 아래 · 1년 추세를 셀 수 없는 곳은 바닥(높이 0)
   · 20거래일 전 높이(hP) = 같은 셈을 20거래일 전 1년 추세 · 그 날 기준선(grow.qp)으로 — 「재생」에서 7곳이 물 아래에서 올라옴
   · 값은 모두 판 읽기(lens.json — cand.grow.m · cand.flags · cand.items)에서 · 지어내지 않음 */
export const ISL = Object.freeze({water: 0.33, arms: [[0, 0], [1, 0], [0, 1], [-1, 0], [0, -1]], per: 5});

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
  stocks.forEach((s, i) => { const k = String(s.g ?? s.gl ?? '기타'); if (!by.has(k)) by.set(k, {key: k, label: s.gl ?? s.g ?? '업종 없음', idx: []}); by.get(k).idx.push(i); });
  const secs = [...by.values()].map(g => ({...g, mean: g.idx.reduce((t, i) => t + hN[i], 0) / g.idx.length}));
  secs.sort((a, b) => (b.mean - a.mean) || cmp(a.key, b.key));
  const groups = []; // 다섯 칸씩(업종이 다섯을 넘으면 이웃 구역으로 이어짐)
  for (const g of secs) { const idx = [...g.idx].sort((a, b) => (hN[b] - hN[a]) || cmp(codes[a], codes[b])); for (let k = 0; k < idx.length; k += ISL.per) groups.push({sec: g.label, idx: idx.slice(k, k + ISL.per)}); }
  const cen = centersOf(groups.length), cells = new Array(stocks.length);
  groups.forEach((g, d) => g.idx.forEach((i, k) => {
    const [ax, ay] = ISL.arms[k], s = stocks[i];
    cells[i] = {code: codes[i], name: s.name ?? codes[i], sec: g.sec, x: cen[d][0] + ax, y: cen[d][1] + ay, d, hN: hN[i], hP: hP[i], up: up[i], elig: elig[i],
      rank: rankOf.get(codes[i]) ?? 0, m12: m[i] === null ? null : Number((m[i] * 100).toFixed(1)), m12p: mp[i] === null ? null : Number((mp[i] * 100).toFixed(1)), status: stOf.get(codes[i]) ?? null}; // m12p = 20거래일 전 1년 추세(%) — 재생 첫 걸음 위 이름표
  }));
  const seven = [...(C.items ?? [])].sort((a, b) => a.rank - b.rank).map(x => codes.indexOf(String(x.code))).filter(i => i >= 0);
  return {w, cells, seven, above: cells.filter(c => c.hN > w).length, green: cells.filter(c => c.hN > w && c.elig).length, districts: groups.length, sectors: secs.length};
}
