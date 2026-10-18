// 고도리 칸 셈 gdr-v2 — 수 다루기(결정표 gdr-v2.md 「반올림 · 호가 · 뽑기」)
/** 분수 num ÷ den(BigInt) 을 소수 nd 자리 글로 — 딱 반이면 짝수 쪽(파이썬 format(Fraction) · round 와 같음) */
export function fracFixed(num, den, nd) {
  num = BigInt(num); den = BigInt(den);
  if (den === 0n) return null;
  if (den < 0n) { num = -num; den = -den; }
  const neg = num < 0n; if (neg) num = -num;
  num *= 10n ** BigInt(nd);
  let q = num / den; const r2x = (num - q * den) * 2n;
  if (r2x > den || (r2x === den && (q & 1n) === 1n)) q += 1n;
  let s = q.toString();
  if (nd > 0) { s = s.padStart(nd + 1, '0'); s = s.slice(0, -nd) + '.' + s.slice(-nd); }
  return (neg && /[1-9]/.test(s) ? '-' : '') + s;
}
/** 같은 셈을 수로 */
export const fracNum = (num, den, nd) => { const s = fracFixed(num, den, nd); return s === null ? null : Number(s); };
/** 거래소 호가 단위(2023-01-25 부터 코스피 · 코스닥 같음) */
export function tickOf(p) { return p < 2000 ? 1 : p < 5000 ? 5 : p < 20000 ? 10 : p < 50000 ? 50 : p < 200000 ? 100 : p < 500000 ? 500 : 1000; }
/** 값 x 를 그 값 자리의 호가 단위로 아래로 맞춤(종가가 이 값 이하면 닿음) */
export function floorTick(x) { const t = tickOf(x); return Math.floor(x / t + 1e-9) * t; }
/** FNV-1a 32 비트(글 → 씨앗) */
export function fnv1a(s) { let h = 0x811c9dc5; for (const b of Buffer.from(String(s), 'utf8')) { h ^= b; h = Math.imul(h, 0x01000193) >>> 0; } return h >>> 0; }
/** mulberry32 — 0 이상 1 미만(같은 씨앗 = 같은 수열 · 파이썬으로 옮기기 쉬움) */
export function mulberry32(seed) {
  let a = seed >>> 0;
  return () => { a = (a + 0x6d2b79f5) >>> 0; let t = a; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
}
/** 세 값 「그리고」 — 0 이 하나라도 있으면 0 · 아니고 null 이 있으면 null · 다 1 이면 1 */
export const and3 = xs => (xs.includes(0) ? 0 : xs.includes(null) ? null : 1);
