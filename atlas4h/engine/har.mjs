/**
 * ATLAS 4시간 엔진 0판 · 폭 = HAR (하루 자료)
 *
 * 흔들림 크기의 대용값 = 하루 로그 수익률의 제곱 r².
 * 내일 r² 를 「어제 r² · 지난 5일 평균 · 지난 22일 평균」 세 층(밑값 3층)으로 맞춘다.
 *   r²(t+1) = b0 + bd·r²(t) + bw·평균(r², t−4..t) + bm·평균(r², t−21..t) + 오차
 * 맞춤은 보통 최소제곱(OLS)이고, 출발일(origin) 이하 자료만 쓴다(누수 없음).
 * 맞춘 값이 0 이하로 떨어지면 작은 양수 바닥(VAR_FLOOR)에서 멈춘다.
 * 근거: 명령문 <엔진> 「① HAR: 밑값 3층(어제·주·달)」 · atlas4h/sources/part-engine.md
 */

export const HAR_WINDOW = 500; // 맞춤에 쓰는 줄 수 (거래일) — 창을 굴린다
export const HAR_MIN_ROWS = 60; // 이보다 적으면 맞추지 않는다 (「없음」)
export const VAR_FLOOR = 1e-8; // 흔들림 바닥 (하루 표준편차 0.01%)
export const EMBARGO = 1; // judgment.json evolution.leakage — 마지막 1거래일은 맞춤 줄에서 띄운다

/** 하루 등락(%) 목록 → 로그 수익률 */
export function logReturnsFromPct(changePcts) {
  return changePcts.map(c => Math.log1p(c / 100));
}

/** 종가 목록 → 로그 수익률 */
export function logReturnsFromCloses(closes) {
  const out = [];
  for (let i = 1; i < closes.length; i++) out.push(Math.log(closes[i] / closes[i - 1]));
  return out;
}

function meanRange(xs, from, to) {
  let s = 0;
  for (let i = from; i <= to; i++) s += xs[i];
  return s / (to - from + 1);
}

/** t 시점의 밑값 3층 [1, 어제, 주, 달] — t 이하 자료만 */
export function harRegressors(v, t) {
  return [1, v[t], meanRange(v, t - 4, t), meanRange(v, t - 21, t)];
}

/** 작은 연립방정식 A·x = b (가우스 소거, 부분 피벗) */
export function solveLinear(A, b) {
  const n = b.length;
  const M = A.map((row, i) => [...row, b[i]]);
  for (let c = 0; c < n; c++) {
    let p = c;
    for (let r = c + 1; r < n; r++) if (Math.abs(M[r][c]) > Math.abs(M[p][c])) p = r;
    if (Math.abs(M[p][c]) < 1e-300) return null;
    [M[c], M[p]] = [M[p], M[c]];
    for (let r = c + 1; r < n; r++) {
      const f = M[r][c] / M[c][c];
      for (let k = c; k <= n; k++) M[r][k] -= f * M[c][k];
    }
  }
  const x = new Array(n).fill(0);
  for (let r = n - 1; r >= 0; r--) {
    let s = M[r][n];
    for (let k = r + 1; k < n; k++) s -= M[r][k] * x[k];
    x[r] = s / M[r][r];
  }
  return x;
}

/**
 * HAR 맞춤 — v = 흔들림 대용값(r²) 목록, 맨 끝이 출발일.
 * 맞춤 줄: 대상 v[t+1] 의 t+1 ≤ (끝 − embargo), 그 가운데 마지막 window 줄.
 * 돌려줌: {beta[4], rows, firstTarget, lastTarget} 또는 null(줄 부족·풀 수 없음)
 */
export function fitHar(v, {window = HAR_WINDOW, embargo = EMBARGO, minRows = HAR_MIN_ROWS} = {}) {
  const last = v.length - 1 - embargo; // 맞춤 대상의 마지막 자리
  const firstT = 21; // 달 평균(22개)이 처음 서는 자리
  const lastT = last - 1;
  const fromT = Math.max(firstT, lastT - window + 1);
  const rows = lastT - fromT + 1;
  if (rows < minRows) return null;
  const XtX = [[0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0]];
  const Xty = [0, 0, 0, 0];
  for (let t = fromT; t <= lastT; t++) {
    const x = harRegressors(v, t);
    const y = v[t + 1];
    for (let i = 0; i < 4; i++) {
      Xty[i] += x[i] * y;
      for (let j = 0; j < 4; j++) XtX[i][j] += x[i] * x[j];
    }
  }
  const beta = solveLinear(XtX, Xty);
  if (!beta || !beta.every(Number.isFinite)) return null;
  return {beta, rows, fromT, lastT};
}

/** 맞춘 계수로 t 다음 날 흔들림(분산)을 낸다 — 바닥 적용 */
export function harPredict(beta, v, t, floor = VAR_FLOOR) {
  const x = harRegressors(v, t);
  const y = beta[0] * x[0] + beta[1] * x[1] + beta[2] * x[2] + beta[3] * x[3];
  return Math.max(floor, y);
}

/**
 * 한 종목(또는 코스피)의 HAR 한 벌: 로그 수익률 r (끝 = 출발일) →
 *   sigmaNext   = √(내일 분산 예측)
 *   z           = 맞춤 줄의 표준화 잔차 r(t+1)/σ̂(t+1) (출발일 이하)
 * 줄이 모자라면 null
 */
export function harModel(r, opts = {}) {
  const v = r.map(x => x * x);
  const fit = fitHar(v, opts);
  if (!fit) return null;
  const floor = opts.floor ?? VAR_FLOOR;
  const z = [];
  for (let t = fit.fromT; t <= fit.lastT; t++) z.push(r[t + 1] / Math.sqrt(harPredict(fit.beta, v, t, floor)));
  const varNext = harPredict(fit.beta, v, v.length - 1, floor);
  return {beta: fit.beta, rows: fit.rows, z, varNext, sigmaNext: Math.sqrt(varNext)};
}
