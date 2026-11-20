/* 회사 찾기 셈(주문 1120-1447) — 화면 없이 셀 수 있게 따로 둠(시험 tests/atlas11/su-find.test.mjs) · su-find.js 가 씀 */
export const FIND_URL = '/atlas/data/mkt.json';
export const FIND_MAX = 8;
const CODE = /^[0-9A-Z]{6}$/;
const norm = t => String(t ?? '').normalize('NFC').toLowerCase().replace(/[\s·.\-()]/g, '');

/** 찾기 — [{code, name, ind, r}] · r = 0 같음 · 1 앞이 같음 · 2 이름 속 · 3 업종 속 · 많아야 n개 */
export function findCo(M, q, n = FIND_MAX) {
  const Q = norm(q); if (!Q) return [];
  const co = M && typeof M === 'object' && M.companies && typeof M.companies === 'object' ? M.companies : {}, out = [];
  for (const [code, o] of Object.entries(co)) {
    if (!CODE.test(code) || typeof o?.n !== 'string' || !o.n) continue;
    const nm = norm(o.n), ind = typeof o.i === 'string' ? norm(o.i) : '', c = code.toLowerCase();
    const r = nm === Q || c === Q ? 0 : nm.startsWith(Q) || c.startsWith(Q) ? 1 : nm.includes(Q) ? 2 : ind && ind.includes(Q) ? 3 : -1;
    if (r >= 0) out.push({code, name: o.n, ind: typeof o.i === 'string' ? o.i : '', r});
  }
  out.sort((a, b) => a.r - b.r || a.name.length - b.name.length || (a.name < b.name ? -1 : a.name > b.name ? 1 : 0) || (a.code < b.code ? -1 : 1));
  return out.slice(0, n);
}
