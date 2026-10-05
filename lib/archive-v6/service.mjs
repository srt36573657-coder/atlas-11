import {mergeResearchRelease} from './researched-news.mjs';
import {
  forecast,
  MODEL_VERSION,
  checkForecast,
  validateInput,
  evaluateForecast,
  eligibleOrigins,
  sourceDataDigest,
} from "./news-engine.mjs";
import { collectNews } from "./news-sources.mjs";
export function initialState(bundle) {
  return {
    schema: 2,
    modelRevision: bundle.candidate.modelVersion,
    probabilityAudit: bundle.probabilityAudit ?? null,
    modelAudit:bundle.modelAudit??null,
    revision: bundle.revision ?? 0,
    active: bundle.candidate.id,
    original: bundle.original.id,
    versions: [
      ...new Map(
        [
          bundle.original,
          ...(bundle.priorVersions ?? []),
          bundle.candidate,
        ].map((v) => [v.id, v]),
      ).values(),
    ],
    actions: bundle.actions ?? [],
    input: bundle.input,
    collectionLogs: bundle.collectionLogs ?? [],
    automatic: true,
    updates: bundle.updates ?? [],
    completed: bundle.completed ?? false,
  };
}
// Upgrade the working model once while retaining the original and every prior version.
export function upgradeState(state,bundle) {
  const mergedInput=mergeResearchRelease(state.input,bundle.input),researchChanged=mergedInput!==state.input;
  if(state.modelRevision===MODEL_VERSION&&!researchChanged)return state;
  if(state.input.origin!==bundle.input.origin||state.input.end!==bundle.input.end)throw Error("다른 기간의 상태는 자동 이전할 수 없습니다.");
  const next=structuredClone(state);
  if(researchChanged)next.input=mergedInput;
  next.input.calibration=structuredClone(bundle.input.calibration??null);
  const origin=eligibleOrigins(next.input).at(-1);
  if(!origin)throw Error("모형 이전을 위한 공통 종가가 없습니다.");
  const version=forecast(next.input,{origin,paths:10000,seed:20260917,informationCutoff:next.input.informationAsOf,live:true});
  if(!checkForecast(version,next.input).complete)throw Error("새 모형 계산 검사 실패");
  if(!next.versions.some(v=>v.id===version.id))next.versions.push(version);
  next.active=version.id;next.modelRevision=MODEL_VERSION;next.probabilityAudit=bundle.probabilityAudit??null;next.revision++;
  next.modelAudit=bundle.modelAudit??null;
  next.updates.push({type:researchChanged?'official-news-release':'model-upgrade',releaseId:next.input.newsResearch?.releaseId,at:new Date().toISOString(),model:MODEL_VERSION,next:version.id,originalUnchanged:true});
  return next;
}
// Keep full evidence in storage; transfer it on demand for older versions.
// This bounds the daily state response as the version history grows.
export function clientState(state) {
  const next = { ...state };
  next.versions = next.versions.map((v) => {
    if (v.id === next.original || v.id === next.active)
      return { ...v, detailLoaded: true };
    return { ...v, detailLoaded: false, assets: [] };
  });
  return next;
}
export function transition(state, action, payload) {
  const next = structuredClone(state);
  if (action === "candidate") {
    const v = payload.version;
    const checks = checkForecast(v, next.input);
    if (!checks.ok || !checks.complete) throw Error("후보 계산 검사 실패");
    if (
      !/^\d{4}-\d{2}-\d{2}-[a-f0-9]{8}$/.test(v.id) ||
      v.end !== next.input.end
    )
      throw Error("후보 버전 형식 오류");
    if (!next.versions.some((x) => x.id === v.id)) next.versions.push(v);
  } else if (action === "approve" || action === "defer") {
    if (!next.versions.some((v) => v.id === payload.id))
      throw Error("저장된 후보가 없습니다.");
    if (
      typeof payload.requestId !== "string" ||
      payload.requestId.length > 100 ||
      !payload.requestId
    )
      throw Error("요청 번호가 없습니다.");
    if (next.actions.some((a) => a.requestId === payload.requestId))
      return next;
    if (action === "approve") {
      const candidate = next.versions.find((v) => v.id === payload.id);
      if (!checkForecast(candidate, next.input).complete)
        throw Error("52종목이 완성된 후보만 승인할 수 있습니다.");
      next.active = payload.id;
    }
    next.revision++;
    next.actions.push({
      type: action,
      version: payload.id,
      requestId: payload.requestId,
      revision: next.revision,
      at: new Date().toISOString(),
    });
  } else if (action === "input") {
    validateInput(payload.input);
    if (
      payload.input.origin !== state.input.origin ||
      payload.input.end !== state.input.end ||
      payload.input.assets.some(
        (a) => !state.input.assets.some((s) => s.code === a.code),
      )
    )
      throw Error("원본 기간과 대상 종목은 바꿀 수 없습니다.");
    next.input = payload.input;
  } else throw Error("지원하지 않는 동작입니다.");
  return next;
}
export function parseNaver(text, code, today, sessions) {
  const rows = [];
  for (const m of text.matchAll(/data="(\d{8})\|([^\"]+)"/g)) {
    const d =
      m[1].slice(0, 4) + "-" + m[1].slice(4, 6) + "-" + m[1].slice(6, 8);
    const fields = m[2].split("|"),
      close = Number(fields[3]);
    if (
      d <= today &&
      sessions.includes(d) &&
      Number.isFinite(close) &&
      close > 0
    )
      rows.push({
        date: d,
        close,
        quality: "single_source",
        volume: Number(fields[4]),
        sources: [
          {
            provider: "NAVER",
            url: `https://finance.naver.com/item/sise.naver?code=${code}`,
            retrievedAt: today,
          },
        ],
      });
  }
  return rows;
}
export async function collectActual(
  input,
  { now = new Date(), fetcher = fetch, forcePriceCheck = false } = {},
) {
  const parts = new Intl.DateTimeFormat("sv-SE", {
    timeZone: "Asia/Seoul",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    hour12: false,
  }).formatToParts(now);
  const get = (t) => parts.find((p) => p.type === t)?.value;
  const day = `${get("year")}-${get("month")}-${get("day")}`;
  const cutoff =
    Number(get("hour")) >= 16
      ? input.calendar.sessions.filter((d) => d <= day).at(-1)
      : input.calendar.sessions.filter((d) => d < day).at(-1);
  const next = structuredClone(input),
    logs = [];
  if (
    !forcePriceCheck &&
    !input.calendar.sessions.includes(day) &&
    input.assets.every((a) =>
      a.prices.some(
        (p) => p.date === cutoff && p.close > 0 && p.quality !== "conflict",
      ),
    )
  ) {
    return {
      input: next,
      log: {
        at: now.toISOString(),
        cutoff,
        success: 0,
        fresh: 52,
        total: 52,
        cached: 52,
        marketClosed: true,
        items: next.assets.map((a) => ({
          code: a.code,
          ok: true,
          fresh: true,
          cached: true,
          providerLatest: cutoff,
          added: 0,
        })),
      },
    };
  }
  for (let i = 0; i < next.assets.length; i += 4) {
    await Promise.all(
      next.assets.slice(i, i + 4).map(async (a) => {
        try {
          const url = `https://fchart.stock.naver.com/sise.nhn?symbol=${a.code}&timeframe=day&count=260&requestType=0`;
          let res;
          for (let attempt = 0; attempt < 2; attempt++) {
            try {
              res = await fetcher(url, { signal: AbortSignal.timeout(20000) });
              if (!res.ok) throw Error("HTTP " + res.status);
              break;
            } catch (e) {
              if (attempt === 1) throw e;
            }
          }
          const rows = parseNaver(
            await res.text(),
            a.code,
            cutoff,
            next.calendar.sessions,
          );
          if (!rows.length) throw Error("유효한 가격 행 없음");
          let added = 0;
          for (const row of rows) {
            if (row.date < input.origin) continue;
            const p = a.prices.find((x) => x.date === row.date);
            if (!p) {
              a.prices.push(row);
              added++;
            } else if (p.close == null && p.quality !== "conflict") {
              Object.assign(p, row);
              added++;
            } else if (next.newsSchema === 1 && p.close !== row.close) {
              (next.priceRevisions ??= []).push({
                code: a.code,
                date: row.date,
                before: p.close,
                beforeRow: structuredClone(p),
                after: row.close,
                at: now.toISOString(),
                provider: "NAVER",
              });
              Object.assign(p, row);
              added++;
            }
          }
          a.prices.sort((a, b) => a.date.localeCompare(b.date));
          const fresh = a.prices.some(
            (p) => p.date === cutoff && p.close > 0 && p.quality !== "conflict",
          );
          logs.push({
            code: a.code,
            ok: true,
            added,
            fresh,
            providerLatest: rows.at(-1)?.date,
          });
        } catch (e) {
          logs.push({ code: a.code, ok: false, error: e.message });
        }
      }),
    );
  }
  const latest = next.assets
    .flatMap((a) =>
      a.prices
        .filter((p) => p.close != null && p.quality !== "conflict")
        .map((p) => p.date),
    )
    .sort()
    .at(-1);
  next.actualAsOf = latest ?? input.actualAsOf;
  next.retrievedAt = day;
  return {
    input: next,
    log: {
      at: now.toISOString(),
      cutoff,
      success: logs.filter((x) => x.ok).length,
      fresh: logs.filter((x) => x.fresh).length,
      total: logs.length,
      items: logs,
    },
  };
}
export async function refreshState(state, options) {
  const now = options?.now ?? new Date();
  const [collected, news] = await Promise.all([
    collectActual(state.input, { ...options, now }),
    collectNews(state.input, { ...options, now }),
  ]);
  const next = structuredClone(state);
  next.input = collected.input;
  for (const key of [
    "events",
    "newsRevisions",
    "newsCheckedAt",
    "newsCollection",
  ])
    next.input[key] = news.input[key];
  next.input.informationAsOf = now.toISOString();
  collected.log.news = news.log;
  collected.log.day = new Date(now.getTime() + 9 * 3600000)
    .toISOString()
    .slice(0, 10);
  next.collectionLogs.push(collected.log);
  next.lastEvaluation = evaluateForecast(
    next.versions.find((v) => v.id === next.active),
    next.input,
  );
  const candidateOrigin = eligibleOrigins(next.input).at(-1);
  const current = next.versions.find((v) => v.id === next.active);
  const changed =
    candidateOrigin &&
    sourceDataDigest(next.input, candidateOrigin, now.toISOString()) !==
      current?.dataDigest;
  collected.log.forecastChanged = !!changed;
  next.completed = next.input.assets.every((a) =>
    a.prices.some((p) => p.date === next.input.end && p.close > 0),
  );
  if (
    (collected.log.success > 0 || news.log.success > 0) &&
    candidateOrigin &&
    changed &&
    !next.completed &&
    candidateOrigin >= next.input.origin
  ) {
    const v = forecast(next.input, {
      origin: candidateOrigin,
      paths: 10000,
      seed: Number(candidateOrigin.replaceAll("-", "")),
      informationCutoff: now.toISOString(),
      createdAt: now.toISOString(),
      live: true,
    });
    if (
      checkForecast(v, next.input).complete &&
      !next.versions.some((x) => x.id === v.id)
    ) {
      next.versions.push(v);
      next.active = v.id;
      next.revision++;
      (next.updates ??= []).push({
        at: now.toISOString(),
        version: v.id,
        origin: candidateOrigin,
        type: "automatic",
        news: news.log.success,
        prices: collected.log.fresh,
      });
    }
  }
  return next;
}
export function mergeRefresh(current, update) {
  const next = structuredClone(current);
  for (const a of next.input.assets) {
    const fresh = update.input.assets.find((x) => x.code === a.code);
    for (const p of fresh?.prices ?? []) {
      const old = a.prices.find((x) => x.date === p.date);
      if (!old) a.prices.push(p);
      else if (
        (old.close == null && old.quality !== "conflict") ||
        (update.input.newsSchema === 1 &&
          update.input.retrievedAt >= current.input.retrievedAt)
      )
        Object.assign(old, p);
    }
    a.prices.sort((a, b) => a.date.localeCompare(b.date));
  }
  next.input.actualAsOf = [current.input.actualAsOf, update.input.actualAsOf]
    .sort()
    .at(-1);
  next.input.retrievedAt = [current.input.retrievedAt, update.input.retrievedAt]
    .sort()
    .at(-1);
  if (
    (update.input.newsCheckedAt ?? "") >= (current.input.newsCheckedAt ?? "")
  ) {
    const events = new Map(current.input.events.map((e) => [e.id, e]));
    for (const e of update.input.events) {
      const old = events.get(e.id);
      if (!old || Date.parse(e.availableAt) >= Date.parse(old.availableAt))
        events.set(e.id, e);
    }
    next.input.events = [...events.values()];
    for (const key of ["newsCheckedAt", "newsCollection", "informationAsOf"])
      next.input[key] = update.input[key];
    for (const key of ["newsRevisions", "priceRevisions"]) {
      const items = [
        ...(current.input[key] ?? []),
        ...(update.input[key] ?? []),
      ];
      next.input[key] = [
        ...new Map(items.map((x) => [JSON.stringify(x), x])).values(),
      ];
    }
  }
  for (const v of update.versions)
    if (!next.versions.some((x) => x.id === v.id)) next.versions.push(v);
  for (const l of update.collectionLogs)
    if (!next.collectionLogs.some((x) => x.at === l.at))
      next.collectionLogs.push(l);
  for (const u of update.updates ?? [])
    if (!(next.updates ??= []).some((x) => x.version === u.version))
      next.updates.push(u);
  const latest = next.versions
    .filter((v) => v.modelVersion?.startsWith("atlas-news-"))
    .sort(
      (a, b) =>
        a.origin.localeCompare(b.origin) ||
        Date.parse(a.informationCutoff) - Date.parse(b.informationCutoff),
    )
    .at(-1);
  if (latest) {
    next.active = latest.id;
    next.revision = Math.max(current.revision, update.revision);
  }
  next.completed = current.completed || update.completed;
  next.lastEvaluation = evaluateForecast(
    next.versions.find((x) => x.id === next.active),
    next.input,
  );
  return next;
}
