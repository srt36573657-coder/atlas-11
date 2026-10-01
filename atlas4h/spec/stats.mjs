/**
 * ATLAS 4시간 엔진 · 채점 셈 모음 (사양 T12·T13 이 씀)
 *
 * 식은 모두 atlas4h/sources/part-engine.md 「코드에 넣을 식」 에서 옮겼다.
 *   1. CRPS (분포 채점)      — E01 Gneiting & Raftery 2007 식 (20)·(21)
 *   2. 구간 점수 (범위 채점) — E01 식 (43)
 *   3. 브라이어 (확률 채점)  — E01 Example 1
 *   5. DM (이겼는지)         — E03 Diebold 2015 식 (2) · 분산은 HAC(Newey–West, 바틀렛 창)
 *  11. 덮는 비율 검정       — E11 Kupiec 1995 식 (6)
 * 점수는 모두 「낮을수록 좋음(벌점)」 으로 낸다.
 * DM 의 작은 표본 보정(HLN 1997, E04)은 원문을 못 읽어 「보류」 — 여기에도 넣지 않았다.
 */

/** 1. CRPS — 표본 m개로 셈: (1/m)Σ|x−y| − (1/(2m²))ΣΣ|x_i−x_j| (정렬해서 m·log m 로 센다) */
export function crpsFromSamples(samples, y) {
  if (!Array.isArray(samples) || samples.length === 0 || !Number.isFinite(y)) return NaN;
  if (!samples.every(Number.isFinite)) return NaN;
  const xs = [...samples].sort((a, b) => a - b);
  const m = xs.length;
  let absErr = 0;
  let pair = 0; // Σ_k (2k − m − 1)·x_(k), k = 1..m  →  ΣΣ|x_i − x_j| = 2·pair
  for (let k = 1; k <= m; k++) {
    const x = xs[k - 1];
    absErr += Math.abs(x - y);
    pair += (2 * k - m - 1) * x;
  }
  return absErr / m - (2 * pair) / (2 * m * m);
}

/** 2. 구간 점수 — (u − l) + (2/α)(l − y)·1{y<l} + (2/α)(y − u)·1{y>u}. 80% 범위면 α = 0.2 */
export function intervalScore(lower, upper, y, alpha = 0.2) {
  if (!(alpha > 0 && alpha < 1)) throw new RangeError('alpha 는 0과 1 사이여야 한다');
  if (![lower, upper, y].every(Number.isFinite)) return NaN;
  let s = upper - lower;
  if (y < lower) s += (2 / alpha) * (lower - y);
  if (y > upper) s += (2 / alpha) * (y - upper);
  return s;
}

/** 3. 브라이어 — 두 갈래 사건: (p − o)², o ∈ {0, 1} */
export function brierScore(p, o) {
  if (!Number.isFinite(p) || !(o === 0 || o === 1)) return NaN;
  return (p - o) ** 2;
}

/** 오차 함수의 나머지 erfc — 작은 x 는 급수, 큰 x 는 연분수 (두 길 모두 1e-14 안쪽) */
export function erfc(x) {
  if (Number.isNaN(x)) return NaN;
  if (x < 0) return 2 - erfc(-x);
  if (x < 3) {
    // erf(x) = (2/√π)·e^{−x²}·Σ_n 2^n·x^{2n+1} / (1·3·…·(2n+1))  — 모든 항이 양수라 빼기 손실이 없다
    let term = x;
    let sum = x;
    for (let n = 1; n < 500; n++) {
      term *= (2 * x * x) / (2 * n + 1);
      sum += term;
      if (term < sum * 1e-17) break;
    }
    return 1 - (2 / Math.sqrt(Math.PI)) * Math.exp(-x * x) * sum;
  }
  // erfc(x) = e^{−x²}/√π · 1/(x + (1/2)/(x + (2/2)/(x + (3/2)/(x + …))))
  let t = x;
  for (let k = 80; k >= 1; k--) t = x + (k / 2) / t;
  return Math.exp(-x * x) / (Math.sqrt(Math.PI) * t);
}

/** 표준정규 누적확률 Φ(z) */
export function normalCdf(z) {
  return 0.5 * erfc(-z / Math.SQRT2);
}

/** 표준정규 위쪽 꼬리 1 − Φ(z) (빼기 없이 바로 센다) */
export function normalSf(z) {
  return 0.5 * erfc(z / Math.SQRT2);
}

/** 자유도 1 카이제곱의 위쪽 꼬리 P(χ²₁ > x) */
export function chi2Sf1(x) {
  if (!(x >= 0)) return x < 0 ? 1 : NaN;
  return erfc(Math.sqrt(x / 2));
}

/**
 * 5. DM 검정 — 기준보다 엔진이 나은가 (한쪽 검정)
 *   d_t = 벌점(기준)_t − 벌점(엔진)_t   (양수면 엔진이 나음 · 같은 시각 판끼리)
 *   DM = d̄ / √(ĝ(0)/T),  ĝ(0) = γ̂(0) + 2·Σ_{τ=1..L} (1 − τ/(L+1))·γ̂(τ)   (Newey–West)
 *   p = 1 − Φ(DM)
 * lag(L): 같은 날 종가를 겨누는 판 수 − 1 (겹친 창). 0 아래면 0.
 */
export function dmTest(lossBaseline, lossEngine, {lag = 0} = {}) {
  if (!Array.isArray(lossBaseline) || !Array.isArray(lossEngine) || lossBaseline.length !== lossEngine.length) {
    throw new RangeError('두 벌점 목록의 길이가 같아야 한다');
  }
  const T = lossBaseline.length;
  const d = lossBaseline.map((b, i) => b - lossEngine[i]);
  if (T === 0 || !d.every(Number.isFinite)) return {T, lag: 0, mean: NaN, longRunVariance: NaN, stat: null, p: null, note: '숫자 아님'};
  const L = Math.max(0, Math.min(Math.floor(Number.isFinite(lag) ? lag : 0), T - 1));
  const mean = d.reduce((a, b) => a + b, 0) / T;
  const gamma = k => {
    let s = 0;
    for (let t = k; t < T; t++) s += (d[t] - mean) * (d[t - k] - mean);
    return s / T;
  };
  let g0 = gamma(0);
  for (let k = 1; k <= L; k++) g0 += 2 * (1 - k / (L + 1)) * gamma(k);
  if (!(g0 > 0)) return {T, lag: L, mean, longRunVariance: g0, stat: null, p: null, note: '분산 0'};
  const stat = mean / Math.sqrt(g0 / T);
  return {T, lag: L, mean, longRunVariance: g0, stat, p: normalSf(stat)};
}

/**
 * 11. Kupiec 덮는 비율 검정 (LR_uc)
 *   x = 빗나간 판 수, n = 판 수, p = 빗나갈 몫 (80% 범위면 0.2)
 *   LR = −2·ln[(1−p)^{n−x}·p^x] + 2·ln[(1−x/n)^{n−x}·(x/n)^x]  ~ χ²(1)
 */
export function kupiecLR(x, n, p = 0.2) {
  if (!(Number.isInteger(x) && Number.isInteger(n) && n > 0 && x >= 0 && x <= n && p > 0 && p < 1)) {
    return {lr: NaN, p: NaN};
  }
  const xlog = (a, b) => (a === 0 ? 0 : a * Math.log(b));
  const ll0 = xlog(n - x, 1 - p) + xlog(x, p);
  const ph = x / n;
  const ll1 = xlog(n - x, 1 - ph) + xlog(x, ph);
  const lr = Math.max(0, -2 * ll0 + 2 * ll1);
  return {lr, p: chi2Sf1(lr)};
}

/** 평균 (빈 목록이면 NaN) */
export function mean(xs) {
  return xs.length ? xs.reduce((a, b) => a + b, 0) / xs.length : NaN;
}
