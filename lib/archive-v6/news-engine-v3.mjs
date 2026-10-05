// ATLAS v3: scheduled-news conditional returns, signed outcomes, deterministic Monte Carlo.
import {
  mean,
  sd,
  rng,
  hashString,
  quantile,
  training,
  validateInput as baseValidate,
  checkForecast as baseCheck,
  evaluateForecast,
  eligibleOrigins,
} from "./engine.mjs";
export { evaluateForecast, eligibleOrigins, mean, quantile };
export const MODEL_VERSION = "atlas-news-3.0.1";
export const CONFIG = Object.freeze({
  minSamples: 5,
  priorSize: 8,
  lookback: 252,
  abnormalLog: Math.log(1.35),
  lambdas: [0, 0.25, 0.5, 1],
});
const round = (n) => Math.round(n * 100) / 100;
const validSource = (s) => {
  try {
    return new URL(s.url).protocol === "https:";
  } catch {
    return false;
  }
};
export function validateInput(input) {
  baseValidate(input);
  if (input.newsSchema !== 1 || !Array.isArray(input.events))
    throw Error("뉴스 입력 형식(newsSchema 1)을 확인하세요.");
}
export function sourceDataDigest(input, origin, informationCutoff) {
  const future = gateEvents(input, origin, informationCutoff).accepted;
  const historical = input.events.filter(
    (e) => e.targetDate && e.targetDate <= origin && e.status !== "withdrawn",
  );
  const event = (e) => [
    e.id,
    e.kind,
    e.targetDate,
    e.target,
    e.codes,
    e.status,
    e.sources?.map((s) => s.url),
  ];
  return hashString(
    JSON.stringify({
      origin,
      model: MODEL_VERSION,
      config: CONFIG,
      prices: input.assets.map((a) => [
        a.code,
        a.prices
          .filter((p) => p.date <= origin)
          .map((p) => [p.date, p.close, p.quality]),
      ]),
      future: future.map(event),
      historical: historical.map(event),
    }),
  );
}
export function gateEvents(input, origin, informationCutoff) {
  const accepted = [],
    rejected = [],
    seen = new Set();
  for (const event of input.events) {
    if (event.targetDate && event.targetDate <= origin) continue;
    if (event.announcementDate > input.end) continue;
    const reasons = [];
    if (!event.id || seen.has(event.id)) reasons.push("사건 ID 중복/누락");
    seen.add(event.id);
    if (!event.kind || !event.name) reasons.push("사건 종류/제목 누락");
    if (
      !Number.isFinite(Date.parse(event.availableAt)) ||
      Date.parse(event.availableAt) > Date.parse(informationCutoff)
    )
      reasons.push("기준 시각 이전에 알려진 일정 아님");
    if (
      !input.calendar.sessions.includes(event.targetDate) ||
      event.targetDate <= origin ||
      event.targetDate > input.end
    )
      reasons.push("예측 거래일 밖");
    if (event.status !== "scheduled")
      reasons.push("확정된 예정 일정 아님/철회됨");
    if (!event.sources?.some(validSource)) reasons.push("출처 URL 누락");
    if (
      event.target !== "all" &&
      (!Array.isArray(event.codes) ||
        !event.codes.length ||
        event.codes.some((c) => !input.assets.some((a) => a.code === c)))
    )
      reasons.push("연결 종목 코드 오류");
    if (reasons.length)
      rejected.push({ id: event.id, name: event.name, reasons });
    else accepted.push(structuredClone(event));
  }
  return {
    accepted: accepted.sort(
      (a, b) =>
        a.targetDate.localeCompare(b.targetDate) || a.id.localeCompare(b.id),
    ),
    rejected,
  };
}
// Evidence elimination, NOT elimination of losing/negative Monte Carlo paths.
export function reactionSample(asset, event, historyEvents, sessions, origin) {
  const data = training(asset, origin, sessions),
    samples = [],
    excluded = [];
  const seen = new Set();
  for (const h of historyEvents) {
    if (
      h.kind !== event.kind ||
      h.targetDate > origin ||
      !h.targetDate ||
      h.status === "withdrawn"
    )
      continue;
    if (h.target !== "all" && !h.codes?.includes(asset.code)) continue;
    if (!h.sources?.some(validSource)) {
      excluded.push({ date: h.targetDate, reason: "과거 사건 출처 없음" });
      continue;
    }
    if (seen.has(h.targetDate)) continue;
    seen.add(h.targetDate);
    // Avoid attributing a known simultaneous macro announcement to one event type.
    const overlap = historyEvents.some(
      (x) =>
        x.id !== h.id &&
        x.kind !== h.kind &&
        x.targetDate === h.targetDate &&
        (x.target === "all" || x.codes?.includes(asset.code)),
    );
    if (overlap) {
      excluded.push({
        date: h.targetDate,
        reason: "다른 종류의 알려진 발표와 같은 반영일",
      });
      continue;
    }
    const r = data.returnMap.get(h.targetDate),
      before = data.returns.filter((x) => x.date < h.targetDate).slice(-20);
    if (
      r == null ||
      before.length < 20 ||
      before.some((x) => Math.abs(x.value) > CONFIG.abnormalLog) ||
      Math.abs(r) > CONFIG.abnormalLog
    ) {
      excluded.push({
        date: h.targetDate,
        reason: "연속 가격/20일 사전 자료 부족 또는 가격 단위 급변",
      });
      continue;
    }
    const center = mean(before.map((x) => x.value));
    samples.push({
      id: h.id,
      date: h.targetDate,
      return: r,
      priorMean: center,
      value: r - center,
      source: h.sources[0].url,
    });
  }
  return {
    samples: samples.sort((a, b) => a.date.localeCompare(b.date)),
    excluded,
    data,
  };
}
export function eliminateInfluence(samples) {
  const values = samples.map((x) => x.value),
    folds = [];
  for (let n = CONFIG.minSamples; n < values.length; n++) {
    const fitted = (mean(values.slice(0, n)) * n) / (n + CONFIG.priorSize);
    folds.push({ date: samples[n].date, fit: fitted, actual: values[n] });
  }
  const candidates = CONFIG.lambdas.map((lambda) => ({
    lambda,
    loss: folds.length
      ? mean(folds.map((f) => Math.abs(f.actual - lambda * f.fit)))
      : null,
  }));
  const baseline = candidates[0].loss;
  for (const m of candidates) {
    m.kept =
      m.lambda === 0 || (folds.length >= 3 && m.loss <= baseline + 1e-12);
    m.reason =
      m.lambda === 0
        ? "방향 효과 0 비교 기준"
        : folds.length < 3
          ? "순차 검증 표본 부족"
          : m.kept
            ? "사전 순차 검증 오차가 기준 이하"
            : "사전 순차 검증 오차가 기준보다 큼";
  }
  const survivors = candidates.filter((c) => c.kept),
    min = Math.min(...survivors.map((m) => m.loss ?? 0));
  const weights = survivors.map((m) =>
      Math.exp((-4 * ((m.loss ?? 0) - min)) / Math.max(baseline ?? 0, 1e-8)),
    ),
    den = weights.reduce((a, b) => a + b, 0);
  const lambda = survivors.reduce(
    (s, m, j) => s + (m.lambda * weights[j]) / den,
    0,
  );
  const rawMean = mean(values),
    mu =
      ((lambda * values.length) / (values.length + CONFIG.priorSize)) * rawMean;
  return {
    candidates,
    folds: folds.length,
    lambda,
    rawMean,
    mu,
    baselineLoss: baseline,
    selectedLoss: folds.length
      ? mean(folds.map((f) => Math.abs(f.actual - lambda * f.fit)))
      : null,
    status:
      folds.length >= 3
        ? "과거 사건을 시간순으로 검증해 영향 크기 선택"
        : "방향성 검증 부족 · 평균 방향 효과 0, 발표일 변동성 유지",
  };
}
export function forecast(
  input,
  {
    origin = input.origin,
    paths = 10000,
    seed = 20260917,
    informationCutoff = origin + "T16:00:00+09:00",
    createdAt = new Date().toISOString(),
    live = false,
  } = {},
) {
  validateInput(input);
  if (![2000, 10000, 20000].includes(paths) || !Number.isInteger(seed))
    throw Error("경로 수 또는 시드 오류");
  if (
    !input.calendar.sessions.includes(origin) ||
    origin < input.origin ||
    origin > input.actualAsOf ||
    origin > input.end
  )
    throw Error("실제 종가가 있는 거래일을 선택하세요.");
  if (
    !Number.isFinite(Date.parse(informationCutoff)) ||
    informationCutoff.slice(0, 10) < origin
  )
    throw Error("정보 기준 시각 오류");
  const sessions = input.calendar.sessions,
    targets = sessions.filter((d) => d >= origin && d <= input.end),
    eventGate = gateEvents(input, origin, informationCutoff);
  const historyEvents = input.events.filter(
    (e) => e.targetDate && e.targetDate <= origin && e.status !== "withdrawn",
  );
  const prepared = input.assets.map((asset) => ({
    asset,
    data: training(asset, origin, sessions),
  }));
  const historicalEventDays = new Set(historyEvents.map((e) => e.targetDate));
  // The SAME ordinary date is sampled across all 52 stocks. Ordinary-day uncertainty has zero mean log return.
  const ordinaryDates = sessions
    .filter(
      (d) =>
        d <= origin &&
        !historicalEventDays.has(d) &&
        prepared.every(
          (p) =>
            p.data.returnMap.has(d) &&
            Math.abs(p.data.returnMap.get(d)) <= CONFIG.abnormalLog,
        ),
    )
    .slice(-CONFIG.lookback);
  if (ordinaryDates.length < 20)
    throw Error("52종목의 공통 일반 거래일 표본이 20개 미만입니다.");
  const dayDraws = targets.map((date) => {
    const r = rng(seed ^ parseInt(hashString("ordinary:" + date), 16));
    return Uint32Array.from({ length: paths }, () =>
      Math.floor(r() * ordinaryDates.length),
    );
  });
  const eventDraws = new Map(
    eventGate.accepted.map((e) => {
      const r = rng(seed ^ parseInt(hashString(e.id), 16));
      return [e.id, Float64Array.from({ length: paths }, () => r())];
    }),
  );
  const reactionCache = new Map(),
    commonSamples = new Map();
  for (const e of eventGate.accepted) {
    const related = prepared.filter(
      (p) => e.target === "all" || e.codes?.includes(p.asset.code),
    );
    const samples = related.map(({ asset }) => {
      const key = asset.code + ":" + e.kind;
      if (!reactionCache.has(key))
        reactionCache.set(
          key,
          reactionSample(asset, e, historyEvents, sessions, origin),
        );
      return reactionCache.get(key).samples;
    });
    // Sample the SAME past announcement across related stocks, not unrelated quantiles.
    const dates =
      samples[0]
        ?.map((s) => s.date)
        .filter((d) => samples.every((a) => a.some((s) => s.date === d))) ?? [];
    commonSamples.set(e.id, new Set(dates));
  }
  const assets = [],
    blocked = [],
    terminal = [];
  for (const { asset, data } of prepared) {
    if (!data.anchor) {
      blocked.push({
        code: asset.code,
        name: asset.name,
        reason: "출발일 실제 종가 없음",
      });
      continue;
    }
    const allProfiles = eventGate.accepted
      .filter((e) => e.target === "all" || e.codes?.includes(asset.code))
      .map((e) => {
        const raw = reactionCache.get(asset.code + ":" + e.kind),
          common = commonSamples.get(e.id);
        const samples = raw.samples.filter((s) => common.has(s.date)),
          excluded = [
            ...raw.excluded,
            ...raw.samples
              .filter((s) => !common.has(s.date))
              .map((s) => ({
                date: s.date,
                reason: "연결 종목의 공통 사건 표본 확보 불가",
              })),
          ];
        const selection = eliminateInfluence(samples),
          used = samples.length >= CONFIG.minSamples;
        const vals = samples.map((s) => s.value).sort((a, b) => a - b);
        return {
          id: e.id,
          name: e.name,
          kind: e.kind,
          date: e.targetDate,
          channel: e.channel ?? "기업 고유 사건",
          sources: e.sources,
          sampleCount: samples.length,
          samples,
          excluded,
          selection,
          used,
          reason: used
            ? "동일 종류의 과거 발표일 반응 사용"
            : "과거 사건 반응 5건 미만 · 계산 제외",
          positiveFrequency: samples.length
            ? samples.filter((s) => s.value > 0).length / samples.length
            : null,
          effect: used ? Math.expm1(selection.mu) : null,
          downside: used
            ? Math.expm1(quantile(vals, 0.1) - selection.rawMean + selection.mu)
            : null,
          upside: used
            ? Math.expm1(quantile(vals, 0.9) - selection.rawMean + selection.mu)
            : null,
        };
      });
    const profiles = allProfiles.filter((p) => p.used),
      byDate = new Map(
        targets.map((d) => [d, profiles.filter((p) => p.date === d)]),
      );
    const ordinary = ordinaryDates.map((d) => data.returnMap.get(d)),
      center = mean(ordinary);
    const values = targets.map(() => new Float64Array(paths));
    values[0].fill(data.anchor.close);
    const positive = targets.map(() => 0),
      baseline = targets.map(() => new Float64Array(paths));
    baseline[0].fill(data.anchor.close);
    for (let b = 0; b < paths; b++) {
      let price = data.anchor.close,
        control = price;
      for (let h = 1; h < targets.length; h++) {
        const residual = ordinary[dayDraws[h][b]] - center,
          active = byDate.get(targets[h]);
        let ret = residual;
        if (active.length) {
          // Replace the ordinary-day draw. Do not add a full event-day return to another full daily shock.
          ret = mean(
            active.map((p) => {
              const u = eventDraws.get(p.id)[b],
                sample = p.samples[Math.floor(u * p.samples.length)];
              return sample.value - p.selection.rawMean + p.selection.mu;
            }),
          );
        }
        price *= Math.exp(ret);
        control *= Math.exp(residual);
        if (!Number.isFinite(price) || price <= 0)
          throw Error("모의 가격 계산 오류");
        values[h][b] = price;
        baseline[h][b] = control;
        if (price > data.anchor.close) positive[h]++;
      }
    }
    let logNewsCenter = 0;
    const rows = targets.map((date, h) => {
      const sorted = Float64Array.from(values[h]).sort(),
        sortedControl = Float64Array.from(baseline[h]).sort(),
        active = byDate.get(date);
      if (h && active.length)
        logNewsCenter += mean(active.map((p) => p.selection.mu));
      const p50 = round(quantile(sorted, 0.5));
      return {
        date,
        p10: round(quantile(sorted, 0.1)),
        p50,
        p90: round(quantile(sorted, 0.9)),
        mean: round(mean(sorted)),
        noNewsP50: round(quantile(sortedControl, 0.5)),
        newsCenter: round(data.anchor.close * Math.exp(logNewsCenter)),
        probUp: h ? positive[h] / paths : null,
        return: p50 / data.anchor.close - 1,
        anchor: h === 0,
        eventIds: active.map((p) => p.id),
      };
    });
    const expectedContribution = profiles.reduce(
      (s, p) => s + p.selection.mu / byDate.get(p.date).length,
      0,
    );
    assets.push({
      id: asset.id,
      code: asset.code,
      name: asset.name,
      sector: asset.sector,
      originPrice: data.anchor.close,
      originQuality: asset.priceSource?.quality ?? "single_source",
      rows,
      news: allProfiles,
      eventsUsed: profiles.length,
      mode: profiles.length ? "scheduled_news" : "no_supported_event",
      newsEffect: Math.expm1(expectedContribution),
      score: rows.at(-1).return,
      training: {
        returns: ordinary.length,
        start: ordinaryDates[0],
        end: origin,
        sigma: sd(ordinary),
        excluded: data.excluded,
      },
      fullHorizonValidated: false,
    });
    terminal.push(values.at(-1));
  }
  const top = assets.map(() => 0);
  for (let b = 0; b < paths; b++)
    for (const j of assets
      .map((a, j) => ({ j, value: terminal[j][b] / a.originPrice }))
      .sort((a, b) => b.value - a.value || a.j - b.j)
      .slice(0, 10))
      top[j.j]++;
  assets.forEach((a, j) => (a.probTop10 = top[j] / paths));
  const ranking = [...assets]
    .sort((a, b) => b.score - a.score || a.code.localeCompare(b.code))
    .map((a, i) => ({ code: a.code, rank: i + 1, score: a.score }));
  const inputDigest = hashString(
    JSON.stringify({
      model: MODEL_VERSION,
      config: CONFIG,
      origin,
      paths,
      seed,
      informationCutoff,
      prices: input.assets.map((a) => [
        a.code,
        a.prices
          .filter((p) => p.date <= origin)
          .map((p) => [p.date, p.close, p.quality]),
      ]),
      events: eventGate.accepted,
      history: historyEvents.map((e) => [
        e.id,
        e.kind,
        e.targetDate,
        e.codes,
        e.status,
      ]),
    }),
  );
  return {
    schema: 2,
    newsSchema: 1,
    id: `${origin}-${inputDigest}`,
    modelVersion: MODEL_VERSION,
    dataDigest: sourceDataDigest(input, origin, informationCutoff),
    inputDigest,
    origin,
    end: input.end,
    createdAt,
    informationCutoff,
    isRetrospectiveReconstruction: !live,
    paths,
    seed,
    targets,
    assets,
    blocked,
    ranking,
    eventGate,
    rowCount: assets.reduce((s, a) => s + a.rows.length, 0),
    newsCoverage: {
      acceptedEvents: eventGate.accepted.length,
      assetsWithNews: assets.filter((a) => a.eventsUsed > 0).length,
      corporateEvents: eventGate.accepted.filter((e) => e.target !== "all")
        .length,
    },
    notes: [
      "미래 기사 내용은 알려져 있지 않습니다. 공개된 발표 일정과 과거의 양·음 반응으로 조건부 시나리오를 계산합니다.",
      "발표일 반응은 인과 효과의 증명이 아닙니다. 다른 뉴스·기업행위가 섞일 수 있습니다.",
      "비슷한 사건의 과거 상승 빈도는 다음 발표의 상승 확률을 보장하지 않습니다.",
      "동일 날짜 여러 사건은 평균 반응으로 합쳐 중복 계산을 줄입니다. 상호작용은 미추정입니다.",
      "P10~P90은 모형의 목표 80% 범위입니다. 현실의 80% 보장은 아닙니다.",
    ],
  };
}
export function checkForecast(v, input) {
  const result = baseCheck(v, input);
  if (v?.modelVersion !== MODEL_VERSION) {
    result.errors.push("뉴스 엔진 버전 불일치");
    result.ok = false;
    result.complete = false;
  }
  result.newsConnectedAll52 =
    v?.assets?.length === 52 && v.assets.every((a) => a.eventsUsed > 0);
  return result;
}
