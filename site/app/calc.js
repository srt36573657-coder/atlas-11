/* ATLAS 11 · 공통 계산(산식 calc-1) — 「ATLAS 개편 실행 지시서」 10. 공통 계산 기준(사장님 2026-10-08 20:19 마카오 시각 첨부)
   화면(site/app) · 판 셈(lib/atlas11/lens.mjs) · 시험(tests/atlas11/calc.test.mjs)이 이 한 파일을 함께 쓴다 — 같은 값을 두 곳에서 따로 셈하지 않는다
   · 값은 모두 % 단위 숫자(+12.5 = +12.5%) · 중간에 반올림하지 않는다(보일 때만 반올림 — fmt*)
   · 셀 수 없는 값(빈 집합 · 분모 0 · 값 없음)은 0 이 아니라 null = 「계산 불가」
   · 빠진 값은 채우지 않고 센다(excluded) — 무엇을 왜 뺐는지는 부르는 쪽이 사유와 함께 적는다
   산식(지시서 그대로):
     N거래일 가격수익률(%) = (끝 종가 ÷ N거래일 전 종가 − 1) × 100 — 종가 N+1 개가 있어야 한다(20거래일 = 종가 21개)
     단순평균 = 같은 기준을 채운 값의 합 ÷ 유효 개수 · 상승 비율(%) = 0 보다 큰 값의 수 ÷ 유효 개수 × 100
     시장 대비 격차(%p) = 종목 수익률(%) − 같은 기간 시장 수익률(%)
     상대 가격비 변화(%) = ((1 + a/100) ÷ (1 + b/100) − 1) × 100 — %p 격차와 다른 값(섞지 않음)
     거래대금 대비 순매수 비율(%) = 같은 기간 · 같은 대상의 순매수 대금 합 ÷ 거래대금 합 × 100
     최대 낙폭(%) = 평가 구간 안에서 그때까지 가장 높던 종가 대비 가장 크게 떨어진 폭 · 최저 수익률(%) = 기준가 대비 가장 낮았던 수익률 — 둘은 다른 값 */
export const CALC_VERSION = 'calc-2'; // calc-1(2026-10-08) + 평균 펼치기(기여 · 제외 · 가중 · 재정규화) · 고정 예제 산식(2026-10-09)
export const fin = v => typeof v === 'number' && Number.isFinite(v);

/** 두 가격 사이 수익률(%) — 시작가가 0 이하이거나 값이 없으면 null(계산 불가) */
export function pctRet(end, start) { return fin(end) && fin(start) && start > 0 && end > 0 ? (end / start - 1) * 100 : null; }
/** 종가 목록(오래된 것 → 새 것)에서 N거래일 수익률 — 종가가 N+1 개보다 적으면 null */
export function retN(closes, n) {
  if (!Array.isArray(closes) || !(n >= 1) || closes.length < n + 1) return null;
  return pctRet(closes[closes.length - 1], closes[closes.length - 1 - n]);
}
/** 단순평균 — 유효값이 없으면 null */
export function mean(xs) { let s = 0, n = 0; for (const v of xs ?? []) if (fin(v)) { s += v; n++; } return n ? s / n : null; }
/** 중앙값(홀수 = 가운데 · 짝수 = 가운데 두 값의 평균) — 유효값이 없으면 null */
export function median(xs) {
  const v = (xs ?? []).filter(fin).sort((a, b) => a - b), n = v.length;
  if (!n) return null; return n % 2 ? v[(n - 1) / 2] : (v[n / 2 - 1] + v[n / 2]) / 2;
}
/** 상승 상위 k개를 뺀 평균(대상 = 유효값 · 큰 값부터 k개 뺌) — 남는 값이 없으면 null */
export function meanExTop(xs, k = 1) { const v = (xs ?? []).filter(fin).sort((a, b) => b - a); return v.length > k ? mean(v.slice(k)) : null; }
/** 자기 자신을 뺀 평균(같은 묶음 다른 값들) — 다른 값이 없으면 null */
export function meanExSelf(xs, i) { return mean((xs ?? []).filter((v, k) => k !== i)); }
/** 표본 표준편차(n − 1) — 값이 둘보다 적으면 null */
export function stdev(xs) { const v = (xs ?? []).filter(fin); if (v.length < 2) return null; const m = mean(v); return Math.sqrt(v.reduce((s, x) => s + (x - m) ** 2, 0) / (v.length - 1)); }
/** 격차(%p) = a − b */
export const gapPp = (a, b) => (fin(a) && fin(b) ? a - b : null);
/** 상대 가격비 변화(%) */
export const relPct = (a, b) => (fin(a) && fin(b) && b > -100 ? ((1 + a / 100) / (1 + b / 100) - 1) * 100 : null);
/** 비율(%) = 위 ÷ 아래 × 100 — 아래가 0 이거나 없으면 null */
export const ratioPct = (num, den) => (fin(num) && fin(den) && den !== 0 ? (num / den) * 100 : null);

/** 묶음 요약 — 값 목록(빈 값 포함) → 개수 · 평균 · 중앙값 · 오름/내림/보합 수 · 상승 비율 · 1위 제외 · 상위 2개 제외 평균 · 가장 큰/작은 값
 *  excluded = 값이 없어 뺀 수(사유는 부르는 쪽이 따로) · 보합 = 정확히 0(종가가 같음) */
export function summarize(xs) {
  const all = xs ?? [], v = all.filter(fin), n = v.length;
  const up = v.filter(x => x > 0).length, down = v.filter(x => x < 0).length, flat = n - up - down;
  return {n, excluded: all.length - n, mean: mean(v), median: median(v), up, down, flat, upRatio: n ? (up / n) * 100 : null,
    exTop1: meanExTop(v, 1), exTop2: meanExTop(v, 2), max: n ? Math.max(...v) : null, min: n ? Math.min(...v) : null};
}

/** 평가 구간 가격 줄(기준가 포함 · 오래된 것 → 새 것) → 최대 낙폭(%) · 최저 수익률(%) · 끝 수익률(%)
 *  최대 낙폭 = max(그때까지 가장 높던 종가 − 지금 종가) ÷ 가장 높던 종가 × 100(0 이상 · 떨어진 폭) / 최저 수익률 = 기준가 대비 가장 낮은 수익률(기준가 뒤 날들) */
export function pathStats(path) {
  const v = path ?? []; if (v.length < 2 || !v.every(x => fin(x) && x > 0)) return null;
  let peak = v[0], mdd = 0, minRet = Infinity;
  for (let i = 1; i < v.length; i++) { peak = Math.max(peak, v[i]); mdd = Math.max(mdd, (peak - v[i]) / peak * 100); minRet = Math.min(minRet, (v[i] / v[0] - 1) * 100); }
  return {ret: (v.at(-1) / v[0] - 1) * 100, mdd, minRet};
}

/* ── 평균 펼치기(calc-2 · 2026-10-09 「ATLAS 업데이트 실행 프롬프트」 0-C · 6 · 9) ──
   묶음 = [{sum, count, w}] — 종목 하나는 {sum: 수익률, count: 1} · 업종 하나는 {sum: 유효 종목 수익률 합, count: 유효 종목 수}
   동일가중 평균 = Σsum ÷ Σcount · 한 칸의 기여(%p) = 그 칸 sum ÷ Σcount(기여를 모두 더하면 평균) · 제외 = 그 칸의 sum · count 를 빼고 다시 나눔(분모가 줄어듦)
   시가총액 가중 평균 = Σ(w × 수익률) ÷ Σw(값이 있는 칸만) · 제외하면 남은 칸의 가중치를 다시 합 100% 로(재정규화) — 가중치 시점은 부르는 쪽이 적음 */
const okPart = p => p && fin(p.sum) && fin(p.count) && p.count > 0;
/** 동일가중 평균 · 분모 — parts 가운데 skip(Set · 칸 번호)을 뺀 나머지 */
export function poolMean(parts, skip = new Set()) {
  let s = 0, n = 0; (parts ?? []).forEach((p, i) => { if (!skip.has(i) && okPart(p)) { s += p.sum; n += p.count; } });
  return {mean: n ? s / n : null, n};
}
/** 칸마다 기여(%p) = sum ÷ 전체 count(제외한 칸은 null) · 합 = 평균 */
export function contribs(parts, skip = new Set()) {
  const {n} = poolMean(parts, skip);
  return (parts ?? []).map((p, i) => (!skip.has(i) && okPart(p) && n ? p.sum / n : null));
}
/** 시가총액 가중 평균(%) — w 가 양수이고 값이 있는 칸만 · 제외 칸 뺀 뒤 남은 가중치로 다시 나눔 */
export function weightedMean(rets, ws, skip = new Set()) {
  let s = 0, wsum = 0; (rets ?? []).forEach((r, i) => { const w = ws?.[i]; if (!skip.has(i) && fin(r) && fin(w) && w > 0) { s += w * r; wsum += w; } });
  return wsum > 0 ? s / wsum : null;
}
/** 가장 큰 값의 칸 번호(값이 같으면 앞 칸) — 「상승 1위」 · 「기여 1위」 고르기 */
export function topIndex(vals) { let k = -1; (vals ?? []).forEach((v, i) => { if (fin(v) && (k < 0 || v > vals[k])) k = i; }); return k; }

/* ── 고정 예제용 산식(지시서 18 — 시험 · 데모 전용 · 운영 값으로 쓰지 않음 · 중간 반올림 없음) ── */
/** 가격 줄 → 끝 수익률 · 최대 낙폭(이전 고점 → 이후 저점 · 음수 %) · 현재 낙폭(구간 최고점 대비 지금 · 음수 %) · 최고점 회복에 필요한 상승률(%) */
export function drawdowns(path) {
  const v = path ?? []; if (v.length < 2 || !v.every(x => fin(x) && x > 0)) return null;
  let peak = v[0], maxDD = 0;
  for (const x of v) { peak = Math.max(peak, x); maxDD = Math.min(maxDD, (x / peak - 1) * 100); }
  const last = v.at(-1);
  return {ret: (last / v[0] - 1) * 100, maxDD, curDD: (last / peak - 1) * 100, toPeak: (peak / last - 1) * 100};
}
/** 원화 기준 수익률(소수) = (1 + 현지 수익률) × (1 + 원화 기준 외화 가치 변화율) − 1 — 입력도 소수 */
export const krwReturn = (local, fx) => (fin(local) && fin(fx) ? (1 + local) * (1 + fx) - 1 : null);
/** 주당순이익 = 순이익 ÷ 기간 가중평균 주식 수(같은 회계 · 희석 정의에서만 견줌) */
export const eps = (net, shares) => (fin(net) && fin(shares) && shares > 0 ? net / shares : null);
/** 조건부 가치: 주가 = EPS × PER · 그 주가가 되려면 필요한 EPS = 주가 ÷ PER(확률 · 목표주가 아님) */
export const priceAt = (e, per) => (fin(e) && fin(per) ? e * per : null);
export const epsNeeded = (price, per) => (fin(price) && fin(per) && per > 0 ? price / per : null);

/** 보이는 글(한 자리 반올림 · 부호 — 반올림해 0 이면 부호 없음) — 계산에는 쓰지 않음 */
const shown = (v, d) => { const a = Math.abs(v).toFixed(d), z = Number(a) === 0; return `${z ? '' : v > 0 ? '+' : '−'}${a}`; };
export const fmtPct = (v, d = 1) => (fin(v) ? `${shown(v, d)}%` : '계산 불가');
export const fmtPp = (v, d = 1) => (fin(v) ? `${shown(v, d)}%p` : '계산 불가');
