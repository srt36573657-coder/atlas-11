/**
 * ATLAS 4시간 엔진 0판 · 상수 단계 (board.md inputs.constants)
 *
 * 봉인 때(봉인 시각 이하 자료만 · HAR 맞춤 줄은 1거래일 엠바고) 엔진이 쓰는 「맞춘 상태」를 잰다:
 *   beta   HAR 계수 4개 (b0 · 어제 · 5일 · 22일)
 *   rv     출발일의 밑값 3층 [어제 r² · 5일 평균 r² · 22일 평균 r²] (har.mjs harRegressors 그대로)
 *   rows   맞춤 줄 수
 *   zq·n·up·down·scUp·scDown·tails   표준화 잔차 분포의 맞춘 상태 (dist.mjs distState)
 * 엔진(engine)은 이 상수 + 지금 변수(출발값)만으로 판을 낸다 — 판에 지난 등락 목록을 싣지 않는다.
 * 숫자는 JSON 에 그대로(반올림 없이) 적는다: 배정밀도 수는 JSON 으로 오가도 한 자리도 안 바뀐다 → 다시 돌려도 같은 판(T4).
 * 방법(창 500 · 엠바고 1 · 바닥 1e-8 · k = 0.5σ̂ · 분위수 19 · 보합 ±0.10% · 가운데 = 출발값)은 0판 그대로다.
 */
import {harModel, harRegressors, HAR_WINDOW, VAR_FLOOR, EMBARGO} from './har.mjs';
import {distState, blockFromState, FLAT_BAND, SCENARIO_K} from './dist.mjs';

export const CONSTANTS_VERSION = 'atlas4h-constants-0';
export const HISTORY_DAYS = HAR_WINDOW + 22 + EMBARGO + 1; // 쓰는 지난 등락 수 (맞춤 창 + 달 평균 + 엠바고) — 0판과 같음
export const MIN_CHANGES = 30; // 0판 blockFor 와 같음 — 이보다 적으면 「없음」

/** 상수 → σ̂(t+1) — har.mjs harPredict 와 같은 셈 순서(바닥 적용) */
export function sigmaOf(beta, rv, floor = VAR_FLOOR) {
  const y = beta[0] * 1 + beta[1] * rv[0] + beta[2] * rv[1] + beta[3] * rv[2];
  return Math.sqrt(Math.max(floor, y));
}

/**
 * 한 계열(종목·코스피)의 하루 등락(%) 목록(끝 = 출발일) → 맞춘 상태. 줄이 모자라면 null.
 * 0판 blockFor 가 쓰던 꼴 그대로: 마지막 HISTORY_DAYS 개만, 로그 수익률 → harModel.
 */
export function measureSeries(changePcts) {
  const hist = changePcts.slice(-HISTORY_DAYS);
  if (hist.length < MIN_CHANGES) return null;
  const r = hist.map(c => Math.log1p(c / 100));
  const m = harModel(r);
  if (!m) return null;
  const v = r.map(x => x * x);
  const x = harRegressors(v, v.length - 1);
  const rv = [x[1], x[2], x[3]];
  const sigma = sigmaOf(m.beta, rv);
  if (sigma !== m.sigmaNext) throw new Error(`상수 σ̂ 이 HAR 예측과 다름 (${sigma} ≠ ${m.sigmaNext})`);
  return {beta: m.beta, rv, rows: m.rows, ...distState(sigma, m.z)};
}

const finite = x => typeof x === 'number' && Number.isFinite(x);
const count = x => Number.isInteger(x) && x >= 0;

/** 상수 한 벌이 엔진이 쓸 꼴인가 (모자라면 그 대상은 「없음」 · 엔진은 멈추지 않는다) */
export function validState(c) {
  return !!c && typeof c === 'object'
    && Array.isArray(c.beta) && c.beta.length === 4 && c.beta.every(finite)
    && Array.isArray(c.rv) && c.rv.length === 3 && c.rv.every(finite)
    && Array.isArray(c.zq) && c.zq.length === 19 && c.zq.every(finite)
    && count(c.n) && c.n > 0 && [c.up, c.down, c.scUp, c.scDown].every(count)
    && c.up + c.down <= c.n && c.scUp + c.scDown <= c.n
    && c.tails && count(c.tails.down) && count(c.tails.up) && count(c.rows);
}

/** 상수 + 출발값 → 판 덩어리 (0판 blockFor 와 한 자리도 같은 꼴·값) */
export function blockFromConstants(anchor, c, label) {
  const sigma = sigmaOf(c.beta, c.rv);
  const b = blockFromState(anchor, sigma, c, {label});
  b.har = {beta: c.beta.map(x => Number(x.toPrecision(10))), rows: c.rows};
  return b;
}

/** 방법 설명 (상수 sha256 에 함께 들어간다) */
export function methodOf(engineVersion) {
  return {
    engine: engineVersion,
    constants: CONSTANTS_VERSION,
    center: '무판 (출발값 그대로)',
    width: {model: 'HAR 하루 자료 · r² · 어제·5일·22일', window: HAR_WINDOW, floor: VAR_FLOOR, embargo: EMBARGO, historyDays: HISTORY_DAYS},
    dist: {model: '걸러낸 지난 기록 · 좌우 따로', quantiles: 19, flatBand: FLAT_BAND, scenarioK: SCENARIO_K},
  };
}
