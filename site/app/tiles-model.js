/* ATLAS 11 · 「후보 7」 칸 그림 — 셈만(화면 없음 · 다른 모듈을 읽지 않음 · node 시험 tests/atlas11/tiles.test.mjs)
   사장님 2026-10-10 09:51(마카오) 「3d 영구 삭제해」 · 09:53 「모두다」 — 첫 화면 섬(옛 island.js · 입체 탑)을 평평한 칸 그림으로 바꿈
   · 칸 하나 = 판 읽기 회사 하나(365곳) · 차례 = 1년 추세 큰 차례(판 읽기 grow.m) — 왼쪽 위부터 한 줄에 COLS 칸
   · 묶음 셋: ① 그물 안(판 읽기 flags 다섯째 = 1년 추세 상위 20%) ② 그물 밖 ③ 1년 추세를 셀 수 없음 — ①과 ② 사이 굵은 선 = 그물 기준선
   · 값을 길이로 읽게 하지 않음 — 1년 추세는 몇 곳이 아주 커서(한국 판 +1,372%) 길이로 그리면 기준선 둘레가 납작해짐 · 차례와 선 하나로 보이고 값은 이름표 글로
   · 20거래일 전 그물 안 = 그 날 1년 추세 ≥ 그 날 기준선(grow.qp) — 「재생」 첫 걸음에서 7곳은 20거래일 전 모습(빈 칸)
   · 값은 모두 판 읽기(lens.json — cand.grow.m · cand.flags · cand.items)에서 · 지어내지 않음 */
export const COLS = 20;

const fin = v => typeof v === 'number' && Number.isFinite(v);
const cmp = (a, b) => (a < b ? -1 : a > b ? 1 : 0);
const pct1 = v => (v === null ? null : Number((v * 100).toFixed(1)));

/**
 * 칸 그림 한 장의 값 — C = 판 읽기 후보 묶음(lens.cand · 규칙 cand-rules-5) · stocks = 판 읽기 종목(lens.stocks · code · name · g · gl)
 * 반환 {cols, cells[], order[], blocks[셋], seven[], above, green, none, sectors} 또는 null(값이 없음 — 그리지 않음)
 *   cell = {i, code, name, sec, g, blk(0 그물 안 · 1 그물 밖 · 2 셀 수 없음), k(묶음 안 차례 0~), row, col, m12(1년 추세 % 소수 첫째 자리), m12p(20거래일 전 %),
 *           up(그물 안), upP(20거래일 전 그물 안), elig(그날 종가 · 흑자 · 위험 공시 없음), rank(후보 순위 · 아니면 0), status}
 *   order = 그리는 차례(묶음 ① → ② → ③ · 묶음 안은 1년 추세 큰 순 · 같으면 기호 차례)
 */
export function tilesModel(C, stocks) {
  const G = C?.grow, M = G?.m, F = C?.flags ?? {};
  if (!G || !M || !Array.isArray(stocks) || !stocks.length) return null;
  const codes = stocks.map(s => String(s.code));
  const m = codes.map(c => (fin(M[c]?.[0]) ? M[c][0] : null)), mp = codes.map(c => (fin(M[c]?.[1]) ? M[c][1] : null));
  const up = codes.map((c, i) => String(F[c] ?? '')[4] === '1' && m[i] !== null); // 그물 안 = 판 읽기 flags 다섯째(1년 추세 상위 20%)
  const elig = codes.map(c => String(F[c] ?? '').slice(0, 3) === '111');
  const qp = fin(G.qp) ? G.qp / 100 : null, upP = mp.map(v => v !== null && qp !== null && v >= qp); // 20거래일 전 그물 안 — 그 날 기준선(grow.qp · %)
  const blk = codes.map((_, i) => (m[i] === null ? 2 : up[i] ? 0 : 1));
  const order = codes.map((_, i) => i).sort((a, b) => (blk[a] - blk[b]) || ((m[b] ?? 0) - (m[a] ?? 0)) || cmp(codes[a], codes[b]));
  const rankOf = new Map((C.items ?? []).map(x => [String(x.code), x.rank])), stOf = new Map((C.items ?? []).map(x => [String(x.code), x.status]));
  const blocks = [0, 0, 0], cells = new Array(stocks.length);
  for (const i of order) {
    const s = stocks[i], b = blk[i], k = blocks[b]++;
    cells[i] = {i, code: codes[i], name: s.name ?? codes[i], sec: s.gl ?? s.g ?? '업종 없음', g: s.g != null ? String(s.g) : null, blk: b, k, row: Math.floor(k / COLS), col: k % COLS,
      m12: pct1(m[i]), m12p: pct1(mp[i]), up: up[i], upP: upP[i], elig: elig[i], rank: rankOf.get(codes[i]) ?? 0, status: stOf.get(codes[i]) ?? null};
  }
  const seven = [...(C.items ?? [])].sort((a, b) => a.rank - b.rank).map(x => codes.indexOf(String(x.code))).filter(i => i >= 0);
  return {cols: COLS, cells, order, blocks, seven, above: blocks[0], green: cells.filter(c => c.up && c.elig).length, none: blocks[2],
    sectors: new Set(cells.map(c => c.g ?? c.sec)).size};
}

/** 칸 이름표 한 줄 — 「이름 +12.3% · 그물 안」(값이 없으면 「1년 추세 셀 수 없음」) */
export const pctTxt = v => (fin(v) ? `${Number(Math.abs(v).toFixed(1)) === 0 ? '' : v > 0 ? '+' : '−'}${Math.abs(v).toFixed(1)}%` : '셀 수 없음');
export const placeTxt = c => (c.up ? (c.elig ? '그물 안' : '그물 안 · 기준 못 넘음') : c.m12 == null ? '1년 추세 셀 수 없음' : '그물 밖');

/* ═════════ 3단 클릭(사장님 2026-10-09 21:33 마카오 「아틀란스를 3단 클릭구조로 만든다 모든곳에 하나도 빠짐없이」 · 규칙 47)
   칸 그림 → 누르면 그 회사와 그 업종이 함께(「회사 보기 ›」 · 그림 아래 업종 칸 「업종 보기 ›」 + 같은 업종 회사 이름) → 누르면 그 화면
   · 같은 칸을 다시 누르면 처음으로 · 평평한 그림이라 가린 칸이 없음 — 「3번이면 회사」는 화면 고리로 보장(빠짐없이 도는 검사가 모든 화면 쌍을 잼) ═════════ */
/** 업종 키 — 판 읽기 g(없으면 그 회사 하나) */
export const zoneOf = c => (c.g != null ? `g:${c.g}` : `c:${c.code}`);
/** 누름 한 번 — st = {z: 고른 업종 키 | null, i: 고른 칸 | -1} · j = 누른 칸(-1 = 빈 곳) → 다음 상태 */
export function tapStep(cells, st, j) {
  if (!(j >= 0) || !cells[j]) return {z: null, i: -1};
  if (st?.i === j) return {z: null, i: -1}; // 같은 칸을 다시 → 닫음(처음)
  return {z: zoneOf(cells[j]), i: j}; // 그 회사 + 그 업종
}
/** 지금 상태의 이름표 · 업종 칸 값 — {co: {name, sec, code, href}, zone: {label, g, href, cos: [{code, name, href, on}]}} · 없음 = null
 *  같은 업종 회사 차례 = 1년 추세 큰 순(셀 수 없으면 뒤 · 같으면 기호 차례) */
export function tapInfo(cells, st) {
  if (!(st?.i >= 0) || !cells[st.i]) return null;
  const c = cells[st.i], v = x => (x.m12 == null ? -Infinity : x.m12);
  const cs = cells.filter(x => zoneOf(x) === st.z).sort((a, b) => (v(b) - v(a)) || cmp(a.code, b.code));
  return {co: {name: c.name, sec: c.sec, code: c.code, href: `#/stock/${c.code}`},
    zone: {label: c.sec, g: c.g, href: c.g != null ? `#/i/${c.g}` : null, cos: cs.map(x => ({code: x.code, name: x.name, href: `#/stock/${x.code}`, on: x.code === c.code}))}};
}
