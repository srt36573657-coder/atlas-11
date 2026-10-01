/**
 * ATLAS 4시간 엔진 0판 · 분포 = 걸러낸 지난 기록 흉내(FHS)
 *
 * 1) 표준화 잔차 z = r / σ̂ (출발일 이하 맞춤 줄만 · har.mjs)
 * 2) 가운데 = 출발값 그대로(무판). z 의 가운데 값을 0 에 맞춘다.
 * 3) 좌우 따로(명령문 <엔진> 「좌우는 따로」): 아래쪽은 가운데보다 작은 z 만, 위쪽은 큰 z 만으로 분위수를 센다.
 * 4) 내일 로그 수익률 분위수 = σ̂(t+1) · z 분위수 → 값 = 출발값 · e^(그 수익률)
 * 5) 방향(오름·보합·내림): 보합 = 출발값 대비 ±0.10% 안 (judgment.json scores.brier)
 * 6) 세 시나리오 위·가운데·아래 = 수익률 > +k · 그 사이 · < −k, k = 0.5·σ̂(t+1). 확률은 같은 분포에서 센다.
 */

export const TAUS = Array.from({length: 19}, (_, i) => Math.round((i + 1) * 5) / 100); // 0.05 … 0.95
export const QKEYS = TAUS.map(t => `p${String(Math.round(t * 100)).padStart(2, '0')}`); // p05 … p95
export const FLAT_BAND = 0.001; // ±0.10%
export const SCENARIO_K = 0.5; // k = 0.5·σ̂

/** 정렬된 목록의 분위수 (선형 보간 · 7형) */
export function quantileSorted(xs, p) {
  const n = xs.length;
  if (!n) return NaN;
  if (n === 1) return xs[0];
  const h = (n - 1) * Math.min(1, Math.max(0, p));
  const lo = Math.floor(h);
  const hi = Math.min(n - 1, lo + 1);
  return xs[lo] + (h - lo) * (xs[hi] - xs[lo]);
}

/**
 * z → 좌우 따로 센 「가운데 0」 분위수 함수
 *   아래쪽 τ<0.5 : −Q_아래((0.5−τ)/0.5), Q_아래 = (가운데 − z) 들(z < 가운데)의 분위수
 *   위쪽  τ>0.5 : +Q_위((τ−0.5)/0.5),  Q_위  = (z − 가운데) 들(z > 가운데)의 분위수
 */
export function sidedZ(z) {
  const s = [...z].sort((a, b) => a - b);
  const med = quantileSorted(s, 0.5);
  const down = s.filter(x => x < med).map(x => med - x).sort((a, b) => a - b);
  const up = s.filter(x => x > med).map(x => x - med).sort((a, b) => a - b);
  // 가운데에 맞춘 표본 (방향·시나리오 확률을 셀 때 쓴다)
  const centered = s.map(x => x - med);
  const q = tau => {
    if (tau === 0.5) return 0;
    if (tau < 0.5) return down.length ? -quantileSorted(down, (0.5 - tau) / 0.5) : 0;
    return up.length ? quantileSorted(up, (tau - 0.5) / 0.5) : 0;
  };
  return {q, centered, median: med, down: down.length, up: up.length};
}

const round = (x, d = 4) => {
  const f = 10 ** d;
  return Math.round(x * f) / f;
};

/** 수익률 x(로그)들 가운데 조건에 맞는 몫 */
function share(xs, pred) {
  let c = 0;
  for (const x of xs) if (pred(x)) c++;
  return {c, n: xs.length};
}

/**
 * 잔차 분포의 「맞춘 상태」 — 판에 지난 기록 대신 싣는 상수 (constants.mjs 가 봉인 때 잰다)
 *   zq     19개 τ 의 좌우 따로 센 z 분위수 sz.q(τ) (가운데 0)
 *   n      잔차 수 · up·down 방향 문턱(±0.10%) 밖 개수 · scUp·scDown 시나리오 문턱(±k) 밖 개수
 *   tails  좌우 따로 센 아래·위 잔차 수
 * [판단] 방향·시나리오 문턱(ln 1.001 · ±0.5σ̂)은 σ̂ 에 달려 있고 σ̂ 도 상수(HAR 계수 + 밑값 3층)에서 나오므로
 *        문턱 밖 개수를 봉인 때 세어 싣는다 — 잔차 표본 500개를 판에 싣지 않고도 forecastBlock 과 한 자리도 같은 확률을 낸다.
 */
export function distState(sigma, z) {
  const sz = sidedZ(z);
  const zq = TAUS.map(tau => sz.q(tau));
  const rets = sz.centered.map(x => sigma * x); // 내일 로그 수익률 표본
  const lnUp = Math.log1p(FLAT_BAND);
  const lnDown = Math.log1p(-FLAT_BAND);
  const k = SCENARIO_K * sigma;
  return {
    zq,
    n: rets.length,
    up: share(rets, x => x > lnUp).c,
    down: share(rets, x => x < lnDown).c,
    scUp: share(rets, x => x > k).c,
    scDown: share(rets, x => x < -k).c,
    tails: {down: sz.down, up: sz.up},
  };
}

/**
 * 한 대상(종목·코스피)의 판 덩어리
 *   anchor   출발값(마지막 종가)
 *   sigma    σ̂(t+1) (하루 로그 수익률 표준편차)
 *   z        표준화 잔차
 */
export function forecastBlock(anchor, sigma, z, {label = '값'} = {}) {
  return blockFromState(anchor, sigma, distState(sigma, z), {label});
}

/**
 * 맞춘 상태(distState) + 출발값 + σ̂ → 판 덩어리. 지난 기록 없이 돈다(엔진 함수가 쓰는 길).
 * 시나리오 경계(코스피·종목 같음): 위 = [출발값·e^k, max(p95, 출발값·e^k)] · 가운데 = [출발값·e^−k, 출발값·e^k] ·
 *   아래 = [min(p05, 출발값·e^−k), 출발값·e^−k] · k = 0.5·σ̂ · 확률은 같은 잔차 분포에서 ±k 밖 몫 (합 = 1)
 */
export function blockFromState(anchor, sigma, st, {label = '값'} = {}) {
  const quantiles = {};
  TAUS.forEach((tau, i) => {
    quantiles[QKEYS[i]] = round(anchor * Math.exp(sigma * st.zq[i]), 4);
  });
  quantiles.p50 = anchor; // 가운데 = 무판(출발값 그대로)
  const n = st.n;
  const direction = {up: st.up / n, flat: (n - st.up - st.down) / n, down: st.down / n};
  const k = SCENARIO_K * sigma;
  const pUp = st.scUp / n;
  const pDown = st.scDown / n;
  const pMid = (n - st.scUp - st.scDown) / n;
  const kPct = (Math.exp(k) - 1) * 100;
  const kTxt = `${round(kPct, 2)}%`;
  const hiP = Math.max(quantiles.p95, anchor * Math.exp(k));
  const loP = Math.min(quantiles.p05, anchor * Math.exp(-k));
  const scenarios = [
    {
      name: '위', prob: pUp,
      premise: `다음 종가가 출발값보다 ${kTxt} 넘게 오르는 길 (지난 흔들림 크기의 절반보다 큰 오름)`,
      [label]: {low: round(anchor * Math.exp(k), 4), high: round(hiP, 4)},
      invalidator: `다음 종가가 출발값 대비 +${kTxt} 이하에서 끝나면 이 길은 틀린 것`,
    },
    {
      name: '가운데', prob: pMid,
      premise: `다음 종가가 출발값 ±${kTxt} 안에서 끝나는 길 (흔들림이 평소보다 작음)`,
      [label]: {low: round(anchor * Math.exp(-k), 4), high: round(anchor * Math.exp(k), 4)},
      invalidator: `다음 종가가 출발값 ±${kTxt} 밖에서 끝나면 이 길은 틀린 것`,
    },
    {
      name: '아래', prob: pDown,
      premise: `다음 종가가 출발값보다 ${kTxt} 넘게 내리는 길 (지난 흔들림 크기의 절반보다 큰 내림)`,
      [label]: {low: round(loP, 4), high: round(anchor * Math.exp(-k), 4)},
      invalidator: `다음 종가가 출발값 대비 −${kTxt} 이상에서 끝나면 이 길은 틀린 것`,
    },
  ];
  return {
    center: anchor,
    quantiles,
    direction,
    scenarios,
    sigma: round(sigma, 8),
    tails: {down: st.tails.down, up: st.tails.up},
  };
}
