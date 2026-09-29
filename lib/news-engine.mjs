// ATLAS v7: evidence classification, exact marginal moments, research-only simulation.
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
import { scopeOf, normalizeEvent, scopeErrors, appliesTo, sameFamily, scopeLabel, scopeCounts, scopeKey, eventIdentity } from "./news-scope.mjs";
import {eventsAsOf, pricesAsOf, evidenceStatus} from './evidence.mjs';
import { assessEvent, assessCoverage52, assessSameDayOverlap, policyFingerprint, eventClusterKey, eventPhaseKey, EVIDENCE_POLICY_VERSION } from './event-evidence-v7.mjs';
import { exactPriceMoments, eventSupportWeights, NUMERICS_VERSION, compensatedSum, exactOneStepDistribution, monteCarloPrecision } from './news-numerics-v7.mjs';
export { evaluateForecast, eligibleOrigins, mean, quantile };
export const MODEL_VERSION = "atlas-news-7.0.0";
import {fitConditionalPath, CONDITIONAL_POLICY} from "./conditional-return.mjs";
export const CONDITIONAL_VERSION = "atlas-news-8.0.1";
import { calibratedProbability, calibrationEvidenceKey } from "./probability.mjs";
export const CONFIG = Object.freeze({
  evidencePolicy: EVIDENCE_POLICY_VERSION,
  moments: 'exact_independent_increment_marginals',
  numericsVersion: NUMERICS_VERSION,
  minSamplesMeaning: 'exploratory_empirical_distribution_only_not_accuracy_gate',
  minSamples: 5,
  priorSize: 8,
  lookback: 252,
  tailPolicy: 'retain_all_valid_signed_returns',
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
export function historicalEvents(input,origin,cutoff) {
  const available=eventsAsOf(input,cutoff).filter(e=>e.id&&e.kind&&e.name&&e.targetDate&&e.targetDate<=origin&&
    input.calendar.sessions.includes(e.targetDate)&&e.status!=='withdrawn'&&Date.parse(e.availableAt)<=Date.parse(cutoff)&&
    e.sources?.some(validSource)&&!scopeErrors(e,input.assets,cutoff).length);
  const signatures=new Map();
  for(const e of available){if(!signatures.has(e.id))signatures.set(e.id,new Set());signatures.get(e.id).add(policyFingerprint(e));}
  const seen=new Set();
  return available.sort((a,b)=>a.targetDate.localeCompare(b.targetDate)||a.id.localeCompare(b.id)).filter(e=>{
    const key=eventIdentity(e);if(signatures.get(e.id).size!==1||seen.has(key))return false;seen.add(key);return true;
  });
}
export function sourceDataDigest(input, origin, informationCutoff, {conditional=false}={}) {
  input={...input,assets:pricesAsOf(input,informationCutoff),events:eventsAsOf(input,informationCutoff)};
  const future = gateEvents(input, origin, informationCutoff).accepted;
  const historical = historicalEvents(input,origin,informationCutoff);
  const event = (e) => [
    e.id,
    e.kind,
    e.targetDate,
    scopeKey(e),
    e.availableAt,
    e.status,
    policyFingerprint(e),
  ];
  return hashString(
    JSON.stringify({
      origin,
      model: conditional ? CONDITIONAL_VERSION : MODEL_VERSION,
      ...(conditional ? {conditionalPolicy:CONDITIONAL_POLICY} : {}),
      calibration: input.calibration?.id ?? null,
      config: CONFIG,
      reviewRegistry: [...new Set(input.newsResearch?.eventIds ?? [])].filter(id=>[...future,...historical].some(e=>e.id===id)).sort(),
      prices: input.assets.map((a) => [
        a.code, a.sector,
        a.prices
          .filter((p) => p.date <= origin)
          .map((p) => [p.date, p.close, p.quality]),
      ]),
      future: future.map(event),
      historical: historical.map(event),
    }),
  );
}
function publicationKnown(event, cutoff){
  if(!/^\d{4}-\d{2}-\d{2}$/.test(event.publicationDate??''))return false;
  const time=Date.parse(event.publicationDate);
  if(!Number.isFinite(time)||new Date(time).toISOString().slice(0,10)!==event.publicationDate)return false;
  if(event.publishedAt)return Number.isFinite(Date.parse(event.publishedAt))&&Date.parse(event.publishedAt)<=Date.parse(cutoff);
  if(typeof event.timezone!=='string'||!event.timezone)return false;
  try{return event.publicationDate<=new Intl.DateTimeFormat('en-CA',{timeZone:event.timezone,year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date(cutoff));}catch{return false;}
}
export function gateEvents(input, origin, informationCutoff) {
  const accepted = [],
    rejected = [],
    seen = new Set(), identities = new Set();
  const events=eventsAsOf(input,informationCutoff), signatures=new Map();
  for(const e of events.filter(e=>Date.parse(e.availableAt)<=Date.parse(informationCutoff))){if(!signatures.has(e.id))signatures.set(e.id,new Set());signatures.get(e.id).add(policyFingerprint(e));}
  for (const event of [...events].sort((a,b)=>String(a.id).localeCompare(String(b.id)))) {
    if (event.targetDate && event.targetDate <= origin) continue;
    if (event.announcementDate > input.end) continue;
    const reasons = [];
    const known=Date.parse(event.availableAt)<=Date.parse(informationCutoff);
    if (!event.id || (known&&seen.has(event.id))) reasons.push("사건 ID 중복/누락");
    if(known&&signatures.get(event.id)?.size>1)reasons.push('같은 ID의 서로 다른 사건 · 전체 유보');
    if(known)seen.add(event.id);
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
    if (!['scheduled','announced','completed'].includes(event.status))
      reasons.push("확정 일정 또는 원문 확인된 발표 사실 아님/철회됨");
    if (event.status !== 'scheduled' && (!publicationKnown(event,informationCutoff) ||
      !(event.sources??[]).some(s=>s.sourceBodyRead===true && s.primaryPublisherVerified===true)))
      reasons.push('이미 발표된 결과의 공개 시각·원문 근거 부족');
    if (!event.sources?.some(validSource)) reasons.push("출처 URL 누락");
    reasons.push(...scopeErrors(event,input.assets,informationCutoff));
    const identity=eventIdentity(event);
    if(identities.has(identity))reasons.push('ID만 다른 동일 사건 · 중복 반영 제외');
    if (reasons.length)
      rejected.push({ id: event.id, name: event.name, reasons });
    else {accepted.push(normalizeEvent(event));identities.add(identity);}
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
export function reactionSample(asset, event, historyEvents, sessions, origin, evidenceOptions) {
  const data = training(asset, origin, sessions),
    samples = [],
    excluded = [];
  const seen = new Set();
  for (const h of historyEvents) {
    if (
      !sameFamily(h,event) || eventPhaseKey(h)!==eventPhaseKey(event) ||
      h.targetDate > origin ||
      !h.targetDate ||
      h.status === "withdrawn"
    )
      continue;
    if (!appliesTo(h,asset)) continue;
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
        eventClusterKey(x)!==eventClusterKey(h) &&
        x.targetDate === h.targetDate &&
        appliesTo(x,asset) && (!evidenceOptions || assessEvent(x,asset,evidenceOptions).classification!=='context_only'),
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
      before.some((x,j) => x.index !== sessions.indexOf(h.targetDate)-20+j)
    ) {
      excluded.push({
        date: h.targetDate,
        reason: "직전 20거래일 연속 가격 부족/충돌",
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
      code:asset.code, kind:h.kind, family:undefined,
      phaseId:eventPhaseKey(h),economicEventId:h.economicEventId ?? h.underlyingEventId ?? null,
      availableAt:h.availableAt,
      responseAvailableAt:asset.prices.find(p=>p.date===h.targetDate)?.observedAt ?? asset.prices.find(p=>p.date===h.targetDate)?.retrievedAt ?? null,
      baselineContinuous:true, baselineSessions:20,
      priceVintageVerified:false, corporateActionsChecked:false,
    });
  }
  return {
    samples: samples.sort((a, b) => a.date.localeCompare(b.date)),
    excluded,
    data,
  };
}
export function empiricalCRPS(values, actual) {
  if (!values.length) return null;
  const sorted=[...values].sort((a,b)=>a-b), n=sorted.length;
  return mean(sorted.map(v=>Math.abs(v-actual))) - sorted.reduce((s,v,i)=>s+(2*i-n+1)*v,0)/(n*n);
}
export function eliminateInfluence(samples) {
  const values = samples.map((x) => x.value),
    folds = [];
  for (let n = CONFIG.minSamples; n < values.length; n++) {
    const fitted = (mean(values.slice(0, n)) * n) / (n + CONFIG.priorSize);
    folds.push({ date: samples[n].date, fit: fitted, actual: values[n], residuals: values.slice(0,n).map(v=>v-mean(values.slice(0,n))) });
  }
  const candidates = CONFIG.lambdas.map((lambda) => ({
    lambda,
    loss: folds.length
      ? mean(folds.map((f) => Math.abs(f.actual - lambda * f.fit)))
      : null,
  }));
  for (const m of candidates) {
    m.crps = folds.length ? mean(folds.map(f=>empiricalCRPS(f.residuals.map(r=>r+m.lambda*f.fit),f.actual))) : null;
    m.brier = folds.length ? mean(folds.map(f=>{
      const p=f.residuals.filter(r=>r+m.lambda*f.fit>0).length/f.residuals.length;
      return (p-Number(f.actual>0))**2;
    })) : null;
  }
  const baseline = candidates[0].loss;
  for (const m of candidates) {
    m.kept =
      m.lambda === 0 || (folds.length >= 3 && m.loss <= baseline + 1e-12 && m.crps <= candidates[0].crps + 1e-12 && m.brier <= candidates[0].brier + 1e-12);
    m.reason =
      m.lambda === 0
        ? "방향 효과 0 비교 기준"
        : folds.length < 3
          ? "순차 검증 표본 부족"
          : m.kept
            ? "시간순 MAE·CRPS·Brier 모두 기준 이하"
            : "시간순 MAE·CRPS·Brier 중 기준보다 큰 항목 존재";
  }
  const survivors = candidates.filter((c) => c.kept),
    min = Math.min(...survivors.map((m) => m.loss ?? 0));
  const weights = survivors.map((m) =>
      Math.exp((-4 * ((m.loss ?? 0) - min)) / Math.max(baseline ?? 0, 1e-8)),
    ),
    den = weights.reduce((a, b) => a + b, 0);
  let lambda = survivors.reduce(
    (s, m, j) => s + (m.lambda * weights[j]) / den,
    0,
  );
  if (folds.length) {
    const blendMAE=mean(folds.map(f=>Math.abs(f.actual-lambda*f.fit)));
    const blendCRPS=mean(folds.map(f=>empiricalCRPS(f.residuals.map(r=>r+lambda*f.fit),f.actual)));
    const blendBrier=mean(folds.map(f=>(f.residuals.filter(r=>r+lambda*f.fit>0).length/f.residuals.length-Number(f.actual>0))**2));
    if(blendMAE>baseline+1e-12||blendCRPS>candidates[0].crps+1e-12||blendBrier>candidates[0].brier+1e-12)lambda=0;
  }
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
    paths = 20000,
    seed = 20260917,
    informationCutoff = origin + "T16:00:00+09:00",
    createdAt = new Date().toISOString(),
    live = false,
    onDistribution,
    conditional = false,
  } = {},
) {
  validateInput(input);
  input={...input,assets:pricesAsOf(input,informationCutoff),events:eventsAsOf(input,informationCutoff)};
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
    Date.parse(informationCutoff) < Date.parse(origin + "T15:30:00+09:00")
  )
    throw Error("정보 기준 시각 오류");
  const validCalibration = input.calibration?.engineVersion === (conditional ? CONDITIONAL_VERSION : MODEL_VERSION) &&
    input.calibration.trainedThrough < origin && (input.calibration.assetEvidenceKeys || input.calibration.evidenceKey === calibrationEvidenceKey(input,input.calibration.trainedThrough))
    ? input.calibration : null;
  const sessions = input.calendar.sessions,
    targets = sessions.filter((d) => d >= origin && d <= input.end),
    eventGate = gateEvents(input, origin, informationCutoff);
  const historyEvents = historicalEvents(input,origin,informationCutoff);
  const evidenceOptions={cutoff:informationCutoff,assets:input.assets,sessions:input.calendar.sessions,
    attestedEventIds:input.newsResearch?.eventIds ?? []};
  const assess=(e,a,samples=[])=>assessEvent(e,a,{...evidenceOptions,historySamples:samples});
  const prepared = input.assets.map((asset) => ({
    asset,
    data: training(asset, origin, sessions),
  }));
  const historicalEventDays = new Set(historyEvents.filter(e=>scopeOf(e).type==='market').map((e) => e.targetDate));
  // The SAME ordinary date is sampled across all 52 stocks. Ordinary-day uncertainty has zero mean log return.
  const ordinaryDates = sessions
    .filter(
      (d) =>
        d <= origin &&
        !historicalEventDays.has(d) &&
        (conditional || prepared.every(
          (p) =>
            p.data.returnMap.has(d),
        )),
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
      (p) => appliesTo(e,p.asset),
    );
    const samples = related.map(({ asset }) => {
      const key = asset.code + ":" + e.id;
      if (!reactionCache.has(key))
        reactionCache.set(
          key,
          reactionSample(asset, e, historyEvents, sessions, origin,evidenceOptions),
        );
      return reactionCache.get(key).samples;
    });
    // The event calendar is independent of another stock's missing/overlapping price samples.
    // This prevents company A's evidence from changing an unrelated company's forecast.
    const dates=[...new Set(historyEvents.filter(h=>sameFamily(h,e)&&eventPhaseKey(h)===eventPhaseKey(e)&&scopeKey(h)===scopeKey(e)).map(h=>h.targetDate))].sort();
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
      .filter((e) => appliesTo(e,asset))
      .map((e) => {
        const raw = reactionCache.get(asset.code + ":" + e.id),
          common = commonSamples.get(e.id);
        const samples = raw.samples, excluded = raw.excluded;
        const selection = eliminateInfluence(samples),
          evidenceAssessment = assess(e,asset,samples),
          used = evidenceAssessment.classification==='price_evidence_candidate' && samples.length >= CONFIG.minSamples;
        const vals = samples.map((s) => s.value).sort((a, b) => a - b);
        return {
          id: e.id,
          scope: scopeOf(e), route: scopeLabel(e),
          sharedDates: [...common],
          name: e.name,
          kind: e.kind,
          date: e.targetDate,
          channel: e.channel ?? "기업 고유 사건",
          sources: e.sources,
          status: e.status, publishedAt:e.publishedAt ?? null,
          economicEventId:e.economicEventId ?? null,
          evidenceAssessment, pricingResearchOnly:true, numericImpactAllowed:false,
          sampleCount: samples.length,
          samples,
          excluded,
          selection,
          used,
          reason: used
            ? "같은 종목·종류의 과거 반응으로 연구 시나리오 계산 · 가격 영향 검증 아님"
            : evidenceAssessment.classification==='context_only' ? "설명용 일정 · 경제적 결과와 가격 영향 미확인"
            : evidenceAssessment.classification==='abstain' ? "사건·출처·범위 근거 부족 · 계산 유보"
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
    // Calendar context does not force a price shift or automatically veto a macro event.
    // Multiple potentially material events still lack identified joint response evidence.
    for (const p of allProfiles) {
      const e=eventGate.accepted.find(e=>e.id===p.id);
      const overlap=assessSameDayOverlap(e,eventGate.accepted,asset,evidenceOptions);
      p.sameDayEvidence=overlap;
      if(p.evidenceAssessment.classification==='price_evidence_candidate' && !overlap.attributableToSingleEvent){
        p.used=false;p.reason="동일 종목·같은 날 복수 사건: 결합 반응 근거 부족으로 계산 유보";
        p.effect=null;p.downside=null;p.upside=null;
      }
    }
    // Two phases of one economic event cannot be counted as independent shocks on one day.
    const activeClusters=new Set();
    for(const p of allProfiles.filter(p=>p.used)){
      const e=eventGate.accepted.find(e=>e.id===p.id), key=p.date+':'+eventClusterKey(e);
      if(activeClusters.has(key)){p.used=false;p.reason='같은 경제 사건·같은 날 중복 단계 · 추가 충격 제외';p.effect=p.downside=p.upside=null;}
      else activeClusters.add(key);
    }
    const profiles = allProfiles.filter((p) => p.used),
      byDate = new Map(
        targets.map((d) => [d, profiles.filter((p) => p.date === d)]),
      );
    const conditionalPath=conditional?fitConditionalPath(asset,input,origin,targets):null;
    const conditionalRows=new Map((conditionalPath?.rows??[]).map(r=>[r.date,r]));
    const dailyMean=date=>conditionalRows.get(date)?.meanLogReturn??0;
    const localEventDays=new Set(historyEvents.filter(e=>appliesTo(e,asset)&&assess(e,asset).classification!=='context_only').map(e=>e.targetDate));
    const localDates=ordinaryDates.filter(d=>!localEventDays.has(d)&&(!conditional||data.returnMap.has(d)));
    if(localDates.length<20)throw Error(asset.name+"의 일반일 반응 표본이 20개 미만입니다.");
    const ordinary = localDates.map((d) => data.returnMap.get(d)), center = mean(ordinary);
    const localRng=rng(seed ^ parseInt(hashString("fallback:"+asset.code),16));
    const eventRngs=new Map(profiles.map(p=>[p.id,rng(seed ^ parseInt(hashString(p.id+":"+asset.code),16))]));
    const values = targets.map(() => new Float64Array(paths));
    values[0].fill(data.anchor.close);
    const positive = targets.map(() => 0),
      baseline = targets.map(() => new Float64Array(paths));
    baseline[0].fill(data.anchor.close);
    const eventDeltas=new Map(conditional?profiles.map(p=>[p.id,new Float64Array(paths)]):[]);
    for (let b = 0; b < paths; b++) {
      let price = data.anchor.close,
        control = price;
      for (let h = 1; h < targets.length; h++) {
        const commonDate=ordinaryDates[dayDraws[h][b]];
        const residual = (localEventDays.has(commonDate)||(conditional&&!data.returnMap.has(commonDate))?ordinary[Math.floor(localRng()*ordinary.length)]:data.returnMap.get(commonDate)) - center,
          active = byDate.get(targets[h]);
        let ret = residual;
        if (active.length) {
          // Replace the ordinary-day draw. Do not add a full event-day return to another full daily shock.
          ret = mean(
            active.map((p) => {
              const u = eventDraws.get(p.id)[b],
                date = p.sharedDates[Math.floor(u * p.sharedDates.length)],
                sample = p.samples.find(s=>s.date===date) ?? p.samples[Math.floor(eventRngs.get(p.id)()*p.samples.length)];
              return sample.value - p.selection.rawMean + p.selection.mu;
            }),
          );
        }
        if(conditional&&active.length===1)eventDeltas.get(active[0].id)[b]=ret-residual;
        ret += dailyMean(targets[h]);
        price *= Math.exp(ret);
        control *= Math.exp(residual+dailyMean(targets[h]));
        if (!Number.isFinite(price) || price <= 0 || !Number.isFinite(control) || control <= 0)
          throw Error("모의 가격 계산 오류");
        values[h][b] = price;
        baseline[h][b] = control;
        if (price > data.anchor.close) positive[h]++;
      }
    }
    const assetCalibration=validCalibration &&
      (!validCalibration.assetEvidenceKeys || validCalibration.assetEvidenceKeys[asset.code]===calibrationEvidenceKey(input,validCalibration.trainedThrough,asset.code)) &&
      (!validCalibration.supportedScopes || profiles.every(p=>validCalibration.supportedScopes.includes(scopeOf(p).type)))
      ? validCalibration : null;
    const supports=targets.slice(1).map(date=>{
      const p=byDate.get(date)[0];
      return p ? {date,values:p.samples.map(s=>s.value-p.selection.rawMean+p.selection.mu+dailyMean(date)),weights:eventSupportWeights(p)}
        : {date,values:ordinary.map(v=>v-center+dailyMean(date))};
    });
    const numericSummary=exactPriceMoments(data.anchor.close,supports,{paths,originDate:origin});
    const firstStep=supports.length ? exactOneStepDistribution(data.anchor.close,supports[0].values,{weights:supports[0].weights}) : null;
    const firstControl=supports.length ? exactOneStepDistribution(data.anchor.close,ordinary.map(v=>v-center+dailyMean(targets[1]))) : null;
    const precisionFamilySize=Math.max(1,input.assets.length*(targets.length-1));
    let logNewsCenter = 0;
    const rows = targets.map((date, h) => {
      const sorted = Float64Array.from(values[h]).sort(),
        sortedControl = Float64Array.from(baseline[h]).sort(),
        active = byDate.get(date);
      if (h && active.length)
        logNewsCenter += mean(active.map((p) => p.selection.mu));
      const exact=h===1 ? firstStep : null, exactControl=h===1 ? firstControl : null;
      const p50 = round(exact?.p50 ?? quantile(sorted, 0.5));
      const probability = h ? calibratedProbability(exact?.probUp ?? positive[h]/paths,h,assetCalibration,origin,conditional ? CONDITIONAL_VERSION : MODEL_VERSION) : null;
      const noNewsProbUp=h?(exactControl?.probUp ?? sortedControl.filter(p=>p>data.anchor.close).length/paths):null;
      const precision=h>1 ? monteCarloPrecision(sorted,{positiveCount:positive[h],familySize:precisionFamilySize}) : null;
      if(h&&typeof onDistribution==='function')onDistribution({code:asset.code,date,horizon:h,originPrice:data.anchor.close,
        sorted:Float64Array.from(sorted),baselineSorted:Float64Array.from(sortedControl)});
      return {
        date,
        p10: round(exact?.p10 ?? quantile(sorted, 0.1)),
        p50,
        p90: round(exact?.p90 ?? quantile(sorted, 0.9)),
        mean: numericSummary.rows[h].mean,
        monteCarloMean: compensatedSum(sorted)/paths,
        exactVariance: numericSummary.rows[h].variance,
        meanMonteCarloSE: 0,
        sampledMeanMonteCarloSE: numericSummary.rows[h].monteCarloMeanSE,
        numericStatus: numericSummary.rows[h].numericStatus,
        numericFlags: numericSummary.rows[h].flags,
        noNewsP50: round(exactControl?.p50 ?? quantile(sortedControl, 0.5)),
        noNewsP10: round(exactControl?.p10 ?? quantile(sortedControl, 0.1)),
        noNewsP90: round(exactControl?.p90 ?? quantile(sortedControl, 0.9)),
        noNewsProbUp,
        distributionMethod: h===0?'anchor':exact?.method ?? 'monte_carlo_empirical_paths',
        numericalPrecision: precision,
        probabilityMonteCarloSE: exact?0:h?Math.sqrt((positive[h]/paths)*(1-positive[h]/paths)/paths):null,
        probabilityMonteCarlo95: exact?[exact.probUp,exact.probUp]:precision?.singleDistribution.probability ?? null,
        medianMonteCarlo95: exact?[exact.p50,exact.p50]:precision?[precision.singleDistribution.p50.lower,precision.singleDistribution.p50.upper]:null,
        newsCenter: round(data.anchor.close * Math.exp(logNewsCenter)),
        probUp: probability?.value ?? null,
        rawProbUp: probability?.raw ?? null,
        probabilityStatus: probability?.status ?? "anchor",
        calibrationAlpha: probability?.alpha ?? null,
        return: p50 / data.anchor.close - 1,
        anchor: h === 0,
        eventIds: active.map((p) => p.id),
        ...(conditional ? {conditionalReturn:conditionalRows.get(date)??null} : {}),
      };
    });
    if(conditional){
      const terminalSorted=Float64Array.from(values.at(-1)).sort();
      for(const p of allProfiles){
        p.impact=null;
        if(!p.used||byDate.get(p.date)?.length!==1)continue;
        const deltas=eventDeltas.get(p.id);
        const off=Float64Array.from(values.at(-1),(value,b)=>value*Math.exp(-deltas[b])).sort();
        p.impact={targetDate:input.end,origin,method:'paired_terminal_wasserstein_1',
          distributionChangePP:compensatedSum(Array.from(terminalSorted,(v,j)=>Math.abs(v-off[j])))/paths/data.anchor.close*100,
          medianChangePP:(quantile(terminalSorted,.5)-quantile(off,.5))/data.anchor.close*100,
          pairedPaths:paths,causal:false,trustProbability:null};
      }
    }
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
      numericSummary,
      ...(conditional ? {conditionalPath} : {}),
      news: allProfiles,
      eventsUsed: profiles.length,
      newsByScope: scopeCounts(allProfiles),
      mode: profiles.length ? "scheduled_news" : "no_supported_event",
      newsEffect: Math.expm1(expectedContribution),
      score: rows.at(-1).return,
      training: {
        returns: ordinary.length,
        start: localDates[0],
        end: origin,
        sigma: sd(ordinary),
        excluded: data.excluded,
        ordinaryDates:localDates,
        retainedExtremeDays:localDates.filter(d=>Math.abs(data.returnMap.get(d))>Math.log(1.35)),
      },
      probabilityCalibrationId: assetCalibration?.id??null,
      fullHorizonValidated: false,
    });
    assets.at(-1).evidence=evidenceStatus(assets.at(-1));
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
      model: conditional ? CONDITIONAL_VERSION : MODEL_VERSION,
      ...(conditional ? {conditionalPolicy:CONDITIONAL_POLICY} : {}),
      calibration: input.calibration?.id ?? null,
      config: CONFIG,
      reviewRegistry: [...new Set(input.newsResearch?.eventIds ?? [])].filter(id=>[...eventGate.accepted,...historyEvents].some(e=>e.id===id)).sort(),
      origin,
      paths,
      seed,
      informationCutoff,
      prices: input.assets.map((a) => [
        a.code, a.sector,
        a.prices
          .filter((p) => p.date <= origin)
          .map((p) => [p.date, p.close, p.quality]),
      ]),
      events: eventGate.accepted,
      history: historyEvents.map((e) => [
        e.id,
        e.kind,
        e.targetDate,
        scopeOf(e),
        e.availableAt, e.sources,
        e.status,
      ]),
    }),
  );
  return {
    schema: 2,
    newsSchema: 1,
    id: `${origin}-${inputDigest}`,
    modelVersion: conditional ? CONDITIONAL_VERSION : MODEL_VERSION,
    ...(conditional ? {conditionalPolicy:CONDITIONAL_POLICY,modelStatus:"research_only",validatedPromotion:false} : {}),
    dataDigest: sourceDataDigest(input, origin, informationCutoff,{conditional}),
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
    rankingStatus:'exploratory_only_no_demonstrated_edge',
    trustProbability:null,
    eventGate,
    rowCount: assets.reduce((s, a) => s + a.rows.length, 0),
    probabilityCalibration: validCalibration ? { id: validCalibration.id, trainedThrough: validCalibration.trainedThrough, groups: validCalibration.groups, eligibleCodes: assets.filter(a=>a.probabilityCalibrationId).map(a=>a.code) } : null,
    evidenceCoverage: assessCoverage52(eventGate.accepted,input.assets,evidenceOptions),
    newsCoverage: {
      acceptedEvents: eventGate.accepted.length,
      assetsWithNews: assets.filter((a) => a.eventsUsed > 0).length,
      corporateEvents: scopeCounts(eventGate.accepted).company,
      byScope: scopeCounts(eventGate.accepted),
    },
    notes: [
      "미래 기사 내용은 알려져 있지 않습니다. 공개된 발표 일정과 과거의 양·음 반응으로 조건부 시나리오를 계산합니다.",
      "발표일 반응은 인과 효과의 증명이 아닙니다. 다른 뉴스·기업행위가 섞일 수 있습니다.",
      "비슷한 사건의 과거 상승 빈도는 다음 발표의 상승 확률을 보장하지 않습니다.",
      "설명용 일정은 가격 충격으로 세지 않습니다. 같은 날 여러 중요 사건은 결합 근거가 없으면 유보합니다.",
      "모형 평균·분산은 일별 조건부 분포의 적률을 직접 계산합니다. 첫 거래일의 분위수·상승 비중은 직접 합산하고 이후 날짜는 몬테카를로 근사이며, 실전 정확도 검증과 별개입니다.",
      "P10~P90은 모형의 목표 80% 범위입니다. 현실의 80% 보장은 아닙니다.",
      "큰 하락·상승을 크기만으로 삭제하지 않습니다. 미확인 기업행위 조정은 별도 자료 한계입니다.",
      "확률 경로 비율·중앙값의 몬테카를로 오차와 실제 예측 정확도는 다른 것입니다. 방향 판단과 추천 순위는 유보합니다.",
    ],
  };
}
export function checkForecast(v, input) {
  const result = baseCheck(v, input);
  if (![MODEL_VERSION, CONDITIONAL_VERSION, "atlas-news-8.0.0", "atlas-news-6.0.0", "atlas-news-5.0.0", "atlas-news-4.0.0", "atlas-news-3.0.1"].includes(v?.modelVersion)) {
    result.errors.push("뉴스 엔진 버전 불일치");
    result.ok = false;
    result.complete = false;
  }
  result.newsConnectedAll52 =
    v?.assets?.length === 52 && v.assets.every((a) => a.eventsUsed > 0);
  result.dataShapeComplete=result.complete;
  result.predictiveSkillVerified=false;
  return result;
}
