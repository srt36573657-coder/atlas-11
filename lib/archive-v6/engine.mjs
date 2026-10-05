/* ATLAS MC + elimination v2. Pure functions shared by browser and server. */
export const MODEL_VERSION = "atlas-mc-elimination-2.0.1";
export const CANDIDATES = [
  { id: "RW", label: "무추세 기준", lambda: 0, ar: false },
  { id: "D25", label: "추세 25%", lambda: 0.25, ar: false },
  { id: "D50", label: "추세 50%", lambda: 0.5, ar: false },
  { id: "D100", label: "추세 100%", lambda: 1, ar: false },
  { id: "AR", label: "평균회귀", lambda: 0.25, ar: true },
];
export const mean = (a) =>
  a.length ? a.reduce((s, x) => s + x, 0) / a.length : 0;
export const sd = (a) =>
  a.length > 1
    ? Math.sqrt(a.reduce((s, x) => s + (x - mean(a)) ** 2, 0) / (a.length - 1))
    : 0;
const clamp = (x, a, b) => Math.min(b, Math.max(a, x));
const round = (x) => Math.round(x * 100) / 100;
export function rng(seed) {
  let a = seed >>> 0;
  return () => {
    a += 0x6d2b79f5;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
export function hashString(s) {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++)
    h = Math.imul(h ^ s.charCodeAt(i), 16777619);
  return (h >>> 0).toString(16).padStart(8, "0");
}
export function quantile(sorted, q) {
  const x = (sorted.length - 1) * q,
    i = Math.floor(x);
  return (
    sorted[i] +
    (sorted[Math.min(i + 1, sorted.length - 1)] - sorted[i]) * (x - i)
  );
}
export function parameters(history, model) {
  const mu = mean(history),
    varr = history.reduce((s, x) => s + (x - mu) ** 2, 0);
  let phi = 0;
  if (model.ar && varr > 0)
    phi = clamp(
      history
        .slice(1)
        .reduce((s, x, i) => s + (x - mu) * (history[i] - mu), 0) / varr,
      -0.8,
      0.8,
    );
  return { mu: model.lambda * mu, phi, last: history.at(-1) ?? 0, center: mu };
}
export function logPoint(history, model, h) {
  const p = parameters(history, model);
  let v = 0;
  for (let j = 1; j <= h; j++) v += p.mu + p.phi ** j * (p.last - p.center);
  return v;
}
// E1: reject future information, invalid/non-session prices and unresolved conflicts.
export function training(asset, origin, sessions) {
  const index = new Map(sessions.map((d, i) => [d, i]));
  const rows = asset.prices
    .filter((p) => p.date <= origin && index.has(p.date))
    .sort((a, b) => a.date.localeCompare(b.date));
  const prices = new Map();
  const excluded = [];
  for (const p of rows) {
    if (!Number.isFinite(p.close) || p.close <= 0 || p.quality === "conflict") {
      excluded.push({
        date: p.date,
        reason: p.quality === "conflict" ? "출처 충돌" : "가격 누락/무효",
      });
      continue;
    }
    prices.set(p.date, p);
  }
  const returns = [];
  const returnMap = new Map();
  for (const [d, p] of prices) {
    const prev = sessions[index.get(d) - 1];
    if (prices.has(prev)) {
      const r = Math.log(p.close / prices.get(prev).close);
      returns.push({ date: d, value: r, index: index.get(d) });
      returnMap.set(d, r);
    }
  }
  return { prices, returns, returnMap, excluded, anchor: prices.get(origin) };
}
// E2: expanding/rolling-origin selection; target observations never enter fitting.
export function eliminateModels(returnRows) {
  const folds = [];
  for (let end = 20; end < returnRows.length; end++) {
    for (const h of [1, 5, 10]) {
      const future = returnRows.slice(end, end + h);
      if (
        future.length !== h ||
        future.some((r, j) => r.index !== returnRows[end - 1].index + j + 1)
      )
        continue;
      folds.push({
        end,
        h,
        train: returnRows.slice(Math.max(0, end - 60), end).map((r) => r.value),
        target: future.reduce((s, r) => s + r.value, 0),
      });
    }
  }
  const scores = CANDIDATES.map((m) => ({
    ...m,
    loss: folds.length
      ? mean(folds.map((f) => Math.abs(f.target - logPoint(f.train, m, f.h))))
      : null,
    folds: folds.length,
  }));
  const baseline = scores[0].loss;
  const enough = folds.length >= 10;
  const selected = scores.map((m) => ({
    ...m,
    kept: m.id === "RW" || (enough && m.loss <= baseline),
    reason:
      m.id === "RW"
        ? "비교 기준 유지"
        : !enough
          ? "검증 표본 부족"
          : m.loss > baseline
            ? "과거 순차검증에서 기준모형보다 오차 큼"
            : "기준모형 이하 오차",
  }));
  const survivors = selected.filter((m) => m.kept);
  const min = Math.min(...survivors.map((m) => m.loss ?? 0));
  const scale = Math.max(baseline ?? 0, 0.000001);
  const raw = survivors.map((m) =>
    Math.exp((-4 * ((m.loss ?? 0) - min)) / scale),
  );
  const den = raw.reduce((a, b) => a + b, 0);
  survivors.forEach((m, i) => (m.weight = raw[i] / den));
  return {
    candidates: selected,
    survivors,
    folds: folds.length,
    selectionStatus: enough
      ? "짧은 구간 순차검증 · 모델 선택용"
      : "검증 표본 부족 · 기준모형",
    fullHorizonValidated: false,
  };
}
// E3: semantic duplicate and publication-time gates. Never remove negative outcomes.
export function eliminateEvents(events, origin, end, sessions) {
  const accepted = [],
    rejected = [],
    seen = new Set();
  const cutoff = origin + "T16:00:00+09:00";
  for (const event of events ?? []) {
    let reasons = [];
    const key = event.canonicalId ?? event.id;
    const published = event.publishedAt ?? event.sources?.[0]?.publishedAt;
    const day = event.targetDate ?? event.date;
    if (!key || seen.has(key)) reasons.push("사건 식별자 없음/중복");
    if (
      !published ||
      !Number.isFinite(Date.parse(published)) ||
      Date.parse(published) > Date.parse(cutoff)
    )
      reasons.push("기준일 이전 공개 시각 미확인");
    if (!day || day <= origin || day > end || !sessions.includes(day))
      reasons.push("예측 거래일 밖");
    const impacts = event.residualImpacts;
    if (
      !Array.isArray(impacts) ||
      impacts.length < 5 ||
      impacts.some((x) => !Number.isFinite(x) || x <= -1)
    )
      reasons.push("부호 있는 잔여 영향 근거 5건 미충족");
    if (event.residualizedAgainst !== "atlas-base-v2")
      reasons.push("기본모형과 영향 중복 제거 미검증");
    if (
      !Number.isFinite(event.occurrenceProbability) ||
      event.occurrenceProbability < 0 ||
      event.occurrenceProbability > 1
    )
      reasons.push("발생 확률 미확인");
    if (reasons.length)
      rejected.push({
        id: event.id ?? null,
        name: event.name ?? "사건",
        reasons,
      });
    else {
      seen.add(key);
      accepted.push({ ...event, id: key, targetDate: day });
    }
  }
  return { accepted, rejected };
}
function pick(models, u) {
  let total = 0;
  for (const m of models) {
    total += m.weight;
    if (u <= total) return m;
  }
  return models.at(-1);
}
export function validateInput(input) {
  const validDate = (d) =>
    typeof d === "string" &&
    /^\d{4}-\d{2}-\d{2}$/.test(d) &&
    Number.isFinite(Date.parse(d)) &&
    new Date(d).toISOString().slice(0, 10) === d;
  if (
    input?.schema !== 2 ||
    !Array.isArray(input.assets) ||
    !Array.isArray(input.calendar?.sessions)
  )
    throw Error("입력 형식(schema 2)을 확인하세요.");
  if (input.assets.length !== 52) throw Error("52개 지정 종목이 필요합니다.");
  const codes = input.assets.map((a) => a.code);
  if (new Set(codes).size !== 52 || codes.some((c) => !/^\d{6}$/.test(c)))
    throw Error("종목코드가 중복되거나 잘못되었습니다.");
  if (
    input.calendar.sessions.some(
      (d, i, a) =>
        !validDate(d) ||
        (i > 0 && a[i - 1] >= d) ||
        [0, 6].includes(new Date(d).getUTCDay()),
    )
  )
    throw Error("거래일표가 중복되거나 순서가 틀립니다.");
  if (
    ![input.origin, input.end, input.actualAsOf].every(validDate) ||
    input.origin > input.end ||
    !input.calendar.sessions.includes(input.origin) ||
    !input.calendar.sessions.includes(input.end)
  )
    throw Error("기준일과 종료일을 확인하세요.");
  for (const a of input.assets) {
    if (
      !Array.isArray(a.prices) ||
      typeof a.name !== "string" ||
      typeof a.sector !== "string"
    )
      throw Error("종목 자료 형식 오류");
    if (new Set(a.prices.map((p) => p.date)).size !== a.prices.length)
      throw Error(a.code + " 가격 날짜 중복");
    for (const p of a.prices) {
      if (
        !validDate(p.date) ||
        p.date > input.actualAsOf ||
        !input.calendar.sessions.includes(p.date)
      )
        throw Error(a.code + " 실제 가격 날짜 오류");
      if (p.close !== null && (!Number.isFinite(p.close) || p.close <= 0))
        throw Error(a.code + " 유효하지 않은 가격");
    }
  }
}
export function eligibleOrigins(input) {
  return input.calendar.sessions.filter(
    (d) =>
      d >= input.origin &&
      d <= input.actualAsOf &&
      d < input.end &&
      input.assets.every((a) => {
        const data = training(a, d, input.calendar.sessions);
        return data.anchor && data.returns.length >= 20;
      }),
  );
}
export function forecast(
  input,
  {
    origin = input.origin,
    paths = 10000,
    seed = 20260917,
    blockLength = 5,
    createdAt = new Date().toISOString(),
  } = {},
) {
  validateInput(input);
  if (![2000, 10000, 20000].includes(paths))
    throw Error("경로 수는 2000, 10000, 20000 중 하나입니다.");
  if (
    !Number.isInteger(seed) ||
    !Number.isInteger(blockLength) ||
    blockLength < 1 ||
    blockLength > 20
  )
    throw Error("난수 시드·블록 길이 오류");
  if (origin < input.origin || origin > input.actualAsOf || origin > input.end)
    throw Error("실제 자료가 있는 기간에서 기준일을 선택하세요.");
  const sessions = input.calendar.sessions,
    targets = sessions.filter((d) => d >= origin && d <= input.end);
  if (!targets.length || targets[0] !== origin)
    throw Error("출발일이 거래일표에 없습니다.");
  const historyDates = sessions.filter((d) => d <= origin).slice(-60);
  const sampledDates = historyDates.slice(1);
  const random = rng(seed);
  const horizon = targets.length - 1;
  const blocks = Array.from({ length: paths }, () => {
    const indices = [];
    while (indices.length < horizon) {
      const start = Math.floor(random() * sampledDates.length);
      for (let j = 0; j < blockLength && indices.length < horizon; j++)
        indices.push((start + j) % sampledDates.length);
    }
    return indices;
  });
  const eventGate = eliminateEvents(input.events, origin, input.end, sessions);
  const inputDigest = hashString(
    JSON.stringify({
      assets: input.assets.map((a) => ({
        code: a.code,
        prices: a.prices
          .filter((p) => p.date <= origin)
          .map((p) => ({ date: p.date, close: p.close, quality: p.quality })),
      })),
      calendar: sessions,
      events: eventGate.accepted,
      origin,
      paths,
      seed,
      blockLength,
      model: MODEL_VERSION,
    }),
  );
  const assets = [],
    blocked = [],
    terminal = [];
  for (const asset of input.assets) {
    const data = training(asset, origin, sessions);
    if (!data.anchor || data.returns.length < 20) {
      blocked.push({
        code: asset.code,
        name: asset.name,
        reason: !data.anchor
          ? "출발일 종가 없음"
          : "연속 거래일 수익률 20개 미만",
      });
      continue;
    }
    const selection = eliminateModels(data.returns);
    const hist = data.returns.slice(-60).map((r) => r.value);
    const center = mean(hist);
    const local = rng((seed + Number(asset.code)) >>> 0);
    const values = Array.from(
      { length: targets.length },
      () => new Float64Array(paths),
    );
    values[0].fill(data.anchor.close);
    const effects = eventGate.accepted.filter(
      (e) => e.codes?.includes(asset.code) || e.target === "all",
    );
    const eventRandom = new Map(
      effects.map((e) => [
        e.id,
        rng((seed + parseInt(hashString(e.id), 16)) >>> 0),
      ]),
    );
    const positive = Array(targets.length).fill(0);
    let fallbackSamples = 0;
    for (let b = 0; b < paths; b++) {
      const m = pick(selection.survivors, local()),
        p = parameters(hist, m);
      let price = data.anchor.close;
      for (let h = 1; h < targets.length; h++) {
        let r = data.returnMap.get(sampledDates[blocks[b][h - 1]]);
        if (r == null) {
          r = hist[Math.floor(local() * hist.length)];
          fallbackSamples++;
        }
        let shock = r - center;
        const mu = p.mu + p.phi ** h * (p.last - p.center);
        for (const e of effects)
          if (e.targetDate === targets[h]) {
            const er = eventRandom.get(e.id);
            if (er() < e.occurrenceProbability)
              shock += Math.log1p(
                e.residualImpacts[Math.floor(er() * e.residualImpacts.length)],
              );
          }
        price *= Math.exp(mu + shock);
        if (!Number.isFinite(price) || price <= 0)
          throw Error("유효하지 않은 모의 주가가 생성되었습니다.");
        values[h][b] = price;
        if (price > data.anchor.close) positive[h]++;
      }
    }
    const rows = targets.map((date, h) => {
      const sorted = Float64Array.from(values[h]).sort();
      const p10 = round(quantile(sorted, 0.1)),
        p50 = round(quantile(sorted, 0.5)),
        p90 = round(quantile(sorted, 0.9));
      return {
        date,
        p10,
        p50,
        p90,
        mean: round(mean(sorted)),
        probUp: h ? positive[h] / paths : null,
        return: p50 / data.anchor.close - 1,
        anchor: h === 0,
      };
    });
    terminal.push(values.at(-1));
    assets.push({
      id: asset.id,
      code: asset.code,
      name: asset.name,
      sector: asset.sector,
      originPrice: data.anchor.close,
      originQuality: data.anchor.quality,
      rows,
      selection,
      training: {
        returns: hist.length,
        start: data.returns.at(-hist.length)?.date,
        end: origin,
        sigma: sd(hist),
        excluded: data.excluded,
        commonBlockFallbackRate: fallbackSamples / Math.max(1, paths * horizon),
      },
      eventsUsed: effects.length,
      mode: effects.length ? "event_enhanced" : "price_bootstrap",
      fullHorizonValidated: false,
    });
  }
  // Same date blocks preserve common shocks where source prices are present.
  const top10 = Array(assets.length).fill(0);
  for (let b = 0; b < paths; b++) {
    const order = assets
      .map((a, j) => ({ j, r: terminal[j][b] / a.originPrice - 1 }))
      .sort((a, b) => b.r - a.r || a.j - b.j);
    for (const x of order.slice(0, 10)) top10[x.j]++;
  }
  assets.forEach((a, j) => {
    a.probTop10 = top10[j] / paths;
    a.score = a.rows.at(-1).return;
  });
  const ranking = [...assets]
    .sort((a, b) => b.score - a.score || a.code.localeCompare(b.code))
    .map((a, i) => ({ code: a.code, rank: i + 1, score: a.score }));
  return {
    schema: 2,
    id: `${origin}-${inputDigest}`,
    modelVersion: MODEL_VERSION,
    inputDigest,
    origin,
    end: input.end,
    createdAt,
    informationCutoff: origin + "T16:00:00+09:00",
    isRetrospectiveReconstruction: true,
    paths,
    seed,
    blockLength,
    targets,
    assets,
    blocked,
    ranking,
    eventGate,
    notes: [
      "가격 이력을 현재 조회해 재구성한 전망입니다. 당시 저장된 실전 예측이 아닙니다.",
      "P10~P90은 목표 80% 구간이며 실제 포함률은 검증 중입니다.",
      "뉴스·수급·심리·거래량은 확인된 수치가 없으면 가격 계산에 사용하지 않습니다.",
      "상위10 확률은 공통 날짜 블록 재표집 모형 아래의 추정값입니다.",
    ],
    rowCount: assets.reduce((s, a) => s + a.rows.length, 0),
  };
}
export function evaluateForecast(version, input) {
  const rows = [];
  for (const a of version.assets) {
    const actual = input.assets.find((x) => x.code === a.code);
    for (const f of a.rows) {
      if (f.anchor) continue;
      const p = actual?.prices.find((x) => x.date === f.date);
      if (
        !p ||
        !Number.isFinite(p.close) ||
        p.close <= 0 ||
        p.quality === "conflict"
      )
        continue;
      rows.push({
        code: a.code,
        date: f.date,
        actual: p.close,
        predicted: f.p50,
        error: p.close - f.p50,
        errorReturn: (p.close - f.p50) / a.originPrice,
        inside: p.close >= f.p10 && p.close <= f.p90,
        baselineError: Math.abs(p.close - a.originPrice) / a.originPrice,
        width: (f.p90 - f.p10) / a.originPrice,
        direction:
          Math.sign(p.close - a.originPrice) ===
          Math.sign(f.p50 - a.originPrice),
      });
    }
  }
  return {
    versionId: version.id,
    rows,
    n: rows.length,
    mae: rows.length ? mean(rows.map((r) => Math.abs(r.errorReturn))) : null,
    baselineMAE: rows.length ? mean(rows.map((r) => r.baselineError)) : null,
    coverage: rows.length ? mean(rows.map((r) => (r.inside ? 1 : 0))) : null,
    direction: rows.length
      ? mean(rows.map((r) => (r.direction ? 1 : 0)))
      : null,
    meanWidth: rows.length ? mean(rows.map((r) => r.width)) : null,
    label: version.isRetrospectiveReconstruction
      ? "사후 재구성 비교 · 독립 성능 입증 아님"
      : "관측 후 채점",
  };
}
export function checkForecast(v, input) {
  const errors = [],
    targets = input.calendar.sessions.filter(
      (d) => d >= v?.origin && d <= input.end,
    ),
    expected = input.assets.length * targets.length;
  if (
    !v ||
    v.schema !== 2 ||
    !Array.isArray(v.assets) ||
    !Array.isArray(v.targets) ||
    !Array.isArray(v.blocked) ||
    !Array.isArray(v.ranking)
  )
    return { ok: false, complete: false, errors: ["예측 형식 오류"] };
  if (
    JSON.stringify(v.targets) !== JSON.stringify(targets) ||
    v.end !== input.end ||
    v.origin > input.actualAsOf
  )
    errors.push("예측 날짜 불일치");
  const codes = v.assets.map((a) => a.code);
  if (
    v.assets.length + v.blocked.length !== 52 ||
    new Set(codes).size !== codes.length ||
    codes.some((c) => !input.assets.some((a) => a.code === c))
  )
    errors.push("종목 수/코드 불일치");
  let count = 0;
  for (const a of v.assets) {
    if (!Array.isArray(a.rows)) {
      errors.push(a.code + " 행 누락");
      continue;
    }
    count += a.rows.length;
    if (a.rows.length !== targets.length) errors.push(a.code + " 날짜 누락");
    for (const [i, r] of a.rows.entries()) {
      if (r.date !== targets[i]) errors.push(a.code + " 날짜 순서 오류");
      if (
        ![r.p10, r.p50, r.p90, r.mean].every(Number.isFinite) ||
        !(r.p10 > 0 && r.p10 <= r.p50 && r.p50 <= r.p90)
      )
        errors.push(a.code + " 분위수 오류");
      if (i > 0 && !(r.probUp >= 0 && r.probUp <= 1))
        errors.push(a.code + " 확률 오류");
    }
    if (a.rows[0]?.p50 !== a.originPrice || !a.rows[0]?.anchor)
      errors.push(a.code + " 출발값 오류");
  }
  const ordered = [...v.assets].sort(
    (a, b) => b.score - a.score || a.code.localeCompare(b.code),
  );
  if (
    v.ranking.length !== ordered.length ||
    v.ranking.some((r, i) => r.rank !== i + 1 || r.code !== ordered[i]?.code)
  )
    errors.push("순위 오류");
  if (count !== v.rowCount) errors.push("행 수 오류");
  return {
    ok: errors.length === 0,
    complete:
      errors.length === 0 && count === expected && v.assets.length === 52,
    expectedRows: expected,
    actualRows: count,
    generatedAssets: v.assets.length,
    errors,
  };
}
