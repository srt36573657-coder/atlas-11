/**
 * ④ 입력값 다시 세기 — 운영 코드(lib)를 쓰지 않고 원 종가에서 F35·F11·F36 입력을 센다.
 *   closes: 날짜 → 종가(같은 날 두 줄이면 오류, quality 'conflict' 는 빈 값) · sessions: 달력의 거래일(출발일까지)
 *   F35 = 출발일까지 자기 로그수익률 1·2·5·20·60일 평균
 *   F11 = 출발일 52종목 상승·하락 폭(+1/−1/0 평균) · 52종목 평균 로그수익률의 마지막 5일 평균
 *   F36 = 1일째 분산: 발행본 변동폭 모형(ω, a, b, last)에서 학습 끝 다음 날부터 출발일까지 실제 잔차로 갱신
 */
export function closeMaps(assets, until) {
  return assets.map(a => { const m = new Map(); for (const p of a.prices) { if (p.date > until) continue; if (m.has(p.date)) throw Error('DUP ' + a.code + ' ' + p.date); m.set(p.date, p.quality === 'conflict' ? null : p.close); } return m; });
}

export function ownInputs({sessions, closes, models, origin}) {
  const S = sessions.filter(d => d <= origin), T = S.length - 1, n = closes.length;
  if (S[T] !== origin) throw Error('ORIGIN_NOT_SESSION');
  const ret = closes.map(m => S.map((d, j) => { if (!j) return null; const p = m.get(d), q = m.get(S[j - 1]); return typeof p === 'number' && p > 0 && typeof q === 'number' && q > 0 ? Math.log(p / q) : null; }));
  const avg = a => { let s = 0; for (const v of a) s += v; return s / a.length; };
  const breadthAt = j => { let s = 0; for (let i = 0; i < n; i++) { const v = ret[i][j]; if (v === null) return null; s += v > 0 ? 1 : v < 0 ? -1 : 0; } return s / n; };
  const basketAt = j => { let s = 0; for (let i = 0; i < n; i++) { const v = ret[i][j]; if (v === null) return null; s += v; } return s / n; };
  // 날짜 j 의 특징 = j−1 까지의 정보(운영과 같은 시점 규칙: 그날 종가로 그날 수익률을 맞힌다)
  const featuresAt = (i, j) => { const h = ret[i].slice(j - 60, j); if (h.length < 60 || h.some(v => v === null)) return null; const b5 = []; for (let t = j - 5; t < j; t++) b5.push(basketAt(t)); const br = breadthAt(j - 1); if (br === null || b5.some(v => v === null)) return null; return [avg(h.slice(-1)), avg(h.slice(-2)), avg(h.slice(-5)), avg(h.slice(-20)), avg(h.slice(-60)), br, avg(b5)]; };
  const out = [];
  for (let i = 0; i < n; i++) {
    const m = models[i], x = featuresAt(i, T + 1); // 1일째 특징: 출발일 T 까지
    const muOf = xx => { let s = m.regression.intercept; for (let k = 0; k < xx.length; k++) s += m.regression.beta[k] * (xx[k] - m.regression.center[k]) / m.regression.scale[k]; return s; };
    let h = m.volatility.last; const start = S.indexOf(m.trainedThrough);
    if (start < 0) throw Error('TRAINED_THROUGH_NOT_SESSION');
    for (let j = start + 1; j <= T; j++) { const xj = featuresAt(i, j); if (!xj || ret[i][j] === null) throw Error('GAP ' + i + ' ' + S[j]); const e = ret[i][j] - muOf(xj); h = m.volatility.omega + m.volatility.a * e * e + m.volatility.b * h; }
    const contrib = x.map((v, k) => m.regression.beta[k] * (v - m.regression.center[k]) / m.regression.scale[k]);
    out.push({x, h, mu: muOf(x), F35: contrib.slice(0, 5).reduce((s, v) => s + v, 0), F11: contrib.slice(5).reduce((s, v) => s + v, 0), updates: T - start});
  }
  return {sessions: S, origin, out};
}
