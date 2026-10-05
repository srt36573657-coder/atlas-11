import {isDisplayBundle,displayStateFromBundle} from './display-bundle.mjs';
import {mergeSealedState,syncSealedState,mergeBenchmark} from './sealed-state.mjs';
import {createBreakingState,recordBreakingEvent,decideBreakingEvent,evaluateBreaking,mergeBreaking} from './breaking-news.mjs';
import {syncBreakingCandidates} from './breaking-candidates.mjs';
import {updateEvolution,mergeEvolution} from './evolution.mjs';
import {appendEvolutionNote} from './evolution-notes.mjs';
import {journalInputChange} from './input-revisions.mjs';
import {appendEvaluationLedger} from "./evaluation-ledger.mjs";
import {forecast as legacyForecast} from './news-engine.mjs';
import {createCycleState,appendCycleReport} from './cycle-research.mjs';
import {mergeCycleData} from './cycle-data.mjs';
import {sha256 as cycleHash} from './cycle-math.mjs';
import {appendPressReport,replacePressResearch,upgradePressState,mergePressResearch} from './press-runtime.mjs';
import {mergeResearchRelease} from './researched-news.mjs';
import {
  forecast,
  MODEL_VERSION,
  checkForecast,
  validateInput,
  evaluateForecast,
  eligibleOrigins,
  sourceDataDigest,
} from "./forecast-engine.mjs";
import { collectNews } from "./news-sources.mjs";
import { parseNaver } from './market-data.mjs';
export { parseNaver } from './market-data.mjs';
// Derived research comparisons follow the active forecast. Stored reports remain
// immutable history; this is a display/state derivation, not a price-model update.
function alignActiveResearchReports(state){
  const version=state.versions.find(v=>v.id===state.active);
  if(!version||state.input.assets.length!==52)return state;
  let next=state;
  if(!state.cycleResearch||state.cycleResearch.report?.baselineId!==version.id){
    next={...next,cycleResearch:state.cycleResearch
      ?appendCycleReport(state.cycleResearch,state.input,version)
      :createCycleState(state.input,version)};
  }
  if(state.pressResearch?.data&&state.pressResearch.report?.baselineId!==version.id){
    next={...next,pressResearch:appendPressReport(state.pressResearch,state.input,version)};
  }
  return next;
}
// Derive the independent, append-only learning record without mutating any
// frozen forecast. A malformed research update must not discard collected prices.
function syncEvolution(state, now=new Date(), onFailure=null) {
  try {
    const original=typeof state.original==="string"?state.versions?.find(v=>v.id===state.original):state.original;
    const evolution=updateEvolution({...state,original},now);
    if(!evolution||typeof evolution!=="object"||Array.isArray(evolution))throw Error("진화 기록 반환 형식 오류");
    return evolution===state.evolution||JSON.stringify(evolution)===JSON.stringify(state.evolution)?state:{...state,evolution};
  } catch(error) {
    const message=String(error?.message??error),key=JSON.stringify([state.active,state.input?.actualAsOf,message]);
    onFailure?.(message);
    const errors=state.evolutionErrors??[];
    if(errors.some(e=>e.key===key))return state;
    return {...state,evolutionErrors:[...errors,{key,at:new Date(now).toISOString(),message,priorEvolutionPreserved:true}]};
  }
}
function syncBreaking(state,now=new Date(),onFailure=null){
 try{
  let breaking=state.breaking??createBreakingState();
  breaking=syncBreakingCandidates(breaking,state.companyNewsCollection,{now,codes:state.input.assets.map(a=>a.code),start:state.input.origin,end:state.input.end});
  breaking=evaluateBreaking(breaking,{input:state.input,now});
  return JSON.stringify(breaking)===JSON.stringify(state.breaking)?state:{...state,breaking};
 }catch(error){
  const message=String(error?.message??error),key=JSON.stringify([state.active,state.input?.actualAsOf,message]);onFailure?.(message);
  const errors=state.breakingErrors??[];if(errors.some(e=>e.key===key))return state;
  return {...state,breakingErrors:[...errors,{key,at:new Date(now).toISOString(),message,priorRecordsPreserved:true}]};
 }
}
function mergeBreakingRelease(next,bundle){
 if(bundle.breaking){try{const breaking=mergeBreaking(next.breaking,bundle.breaking);if(JSON.stringify(breaking)!==JSON.stringify(next.breaking))next={...next,breaking};}
 catch(error){const records=unionRecords(next.unappliedBreaking,[{source:'release_bundle',reason:String(error?.message??error),breaking:structuredClone(bundle.breaking)}]);if(JSON.stringify(records)!==JSON.stringify(next.unappliedBreaking??[]))next={...next,unappliedBreaking:records};}}
 for(const key of ['breakingErrors','unappliedBreaking']){if(!bundle[key]?.length)continue;const rows=unionRecords(next[key],bundle[key]);if(JSON.stringify(rows)!==JSON.stringify(next[key]??[]))next={...next,[key]:rows};}
 return next;
}
export function initialState(bundle) {
  if(isDisplayBundle(bundle))return displayStateFromBundle(bundle);
  const state = {
    schema: 2,
    sealedStudy: mergeSealedState(null,bundle.sealedStudy),
    atlasBenchmark: bundle.atlasBenchmark ?? null,
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
    companyNewsCollection: bundle.companyNewsCollection ?? null,
    pressResearch: bundle.pressResearch ?? null,
    cycleResearch: bundle.cycleResearch ?? (bundle.input.assets.length===52 ? createCycleState(bundle.input,bundle.candidate) : null),
    automatic: true,
    updates: bundle.updates ?? [],
    completed: bundle.completed ?? false,
    breaking:bundle.breaking??createBreakingState(),
    breakingErrors:bundle.breakingErrors??[],
    unappliedBreaking:bundle.unappliedBreaking??[],
    evolution: bundle.evolution ?? null,
    evolutionErrors: bundle.evolutionErrors ?? [],
    unappliedEvolution: bundle.unappliedEvolution ?? [],
    evaluationLedger: bundle.evaluationLedger ?? appendEvaluationLedger([], [bundle.original,...(bundle.priorVersions??[]),bundle.candidate],bundle.input),
  };
  return syncSealedState(syncBreaking(syncEvolution(alignActiveResearchReports(state))));
}
// Upgrade the working model once while retaining the original and every prior version.
function upgradeCoreState(state,bundle) {
  const mergedInput=mergeResearchRelease(state.input,bundle.input),researchChanged=mergedInput!==state.input;
  if(state.modelRevision===bundle.candidate.modelVersion&&!researchChanged){
    if(state.cycleResearch || state.input.assets.length!==52)return state;
    const next=structuredClone(state);
    next.cycleResearch=bundle.cycleResearch??createCycleState(next.input,next.versions.find(v=>v.id===next.active));
    return next;
  }
  if(state.input.origin!==bundle.input.origin||state.input.end!==bundle.input.end)throw Error("다른 기간의 상태는 자동 이전할 수 없습니다.");
  const next=structuredClone(state);
  if(researchChanged)next.input=mergedInput;
  next.input.calibration=structuredClone(bundle.input.calibration??null);
  const origin=eligibleOrigins(next.input).at(-1);
  if(!origin)throw Error("모형 이전을 위한 공통 종가가 없습니다.");
  const targetModel=bundle.candidate.modelVersion==='atlas-news-7.0.0'?'atlas-news-7.0.0':MODEL_VERSION;
  const version=(targetModel===MODEL_VERSION?forecast:legacyForecast)(next.input,{origin,paths:20000,seed:20260917,informationCutoff:next.input.informationAsOf,live:true});
  if(!checkForecast(version,next.input).complete)throw Error("새 모형 계산 검사 실패");
  if(!next.versions.some(v=>v.id===version.id))next.versions.push(version);
  next.active=version.id;next.modelRevision=targetModel;next.probabilityAudit=bundle.probabilityAudit??null;next.revision++;
  next.modelAudit=bundle.modelAudit??null;
  next.updates.push({type:researchChanged?'official-news-release':'model-upgrade',releaseId:next.input.newsResearch?.releaseId,at:new Date().toISOString(),model:targetModel,next:version.id,originalUnchanged:true});
  return next;
}
export function upgradeState(state,bundle) {
  if(state?._displayOnly||isDisplayBundle(bundle))throw Error('전체 보관 자료를 불러온 뒤 상태를 갱신해야 합니다.');
  let next=alignActiveResearchReports(upgradePressState(upgradeCoreState(state,bundle),bundle));
  // Released shadow records/notes are another immutable history branch. Merge
  // them into saved state; loading a release must not erase an earlier issuance.
  if(bundle.evolution){
    try {
      const evolution=mergeEvolution(next.evolution,bundle.evolution);
      if(JSON.stringify(evolution)!==JSON.stringify(next.evolution))next={...next,evolution};
    } catch(error) {
      const unappliedEvolution=unionRecords(next.unappliedEvolution,[{
        at:bundle.input?.informationAsOf??null,reason:String(error?.message??error),
        source:'release_bundle',evolution:structuredClone(bundle.evolution),
      }]);
      if(JSON.stringify(unappliedEvolution)!==JSON.stringify(next.unappliedEvolution??[]))next={...next,unappliedEvolution};
    }
  }
  for(const key of ['evolutionErrors','unappliedEvolution']){
    if(!bundle[key]?.length)continue;
    const records=unionRecords(next[key],bundle[key]);
    if(JSON.stringify(records)!==JSON.stringify(next[key]??[]))next={...next,[key]:records};
  }
  const sealedStudy=mergeSealedState(next.sealedStudy,bundle.sealedStudy),atlasBenchmark=mergeBenchmark(next.atlasBenchmark,bundle.atlasBenchmark);
  if(JSON.stringify(sealedStudy)!==JSON.stringify(next.sealedStudy)||JSON.stringify(atlasBenchmark)!==JSON.stringify(next.atlasBenchmark))next={...next,sealedStudy,atlasBenchmark};
  const scored=next.evaluationLedger?next:{...next,evaluationLedger:appendEvaluationLedger([],next.versions,next.input)};
  return syncSealedState(syncBreaking(syncEvolution(mergeBreakingRelease(scored,bundle))));
}
// Keep full evidence in storage; transfer it on demand for older versions.
// This bounds the daily state response as the version history grows.
export function clientState(state) {
  const next = { ...state };
  next.versions = next.versions.map((v) => {
    if (v.id === next.original || v.id === next.active)
      return { ...v, detailLoaded: true, evidenceDisplayProjection:true, assets:v.assets.map(a=>({
        ...a,
        ...(a.conditionalPath?{conditionalPath:Object.fromEntries(Object.entries(a.conditionalPath).filter(([key])=>key!=='rows'))}:{}),
        // The overview uses the terminal precision panel. Keep every date's full
        // precision in storage/on-demand version data without inflating state sync.
        rows:a.rows.map((r,i)=>{const {numericalPrecision,...display}=r;
          if(r.conditionalReturn)display.conditionalReturn={...r.conditionalReturn,components:r.conditionalReturn.components?.map(m=>({id:m.id,weight:m.weight}))};
          return i===a.rows.length-1?{...display,numericalPrecision}:display;}),
        ...(a.numericSummary?{numericSummary:{...a.numericSummary,rows:a.numericSummary.rows.map(r=>({date:r.date,standardDeviation:r.standardDeviation,numericStatus:r.numericStatus,flags:r.flags,meanMethod:r.meanMethod,increment:r.increment?{count:r.increment.count,logReturnMean:r.increment.logReturnMean,logReturnVariance:r.increment.logReturnVariance,logGrossMean:r.increment.logGrossMean}:null}))}}:{}),
        news:a.news?.map(n=>({...n,samples:n.samples.map(({date,value,source})=>({date,value,source}))}))
      })) };
    // Full archival evidence remains in stored state and the version endpoint.
    // v7 evidence coverage is as large as the asset profiles; omit both here.
    const {assets,evidenceCoverage,eventGate,notes,...metadata}=v;
    return { ...metadata, detailLoaded: false, assets: [] };
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
  } else if (action === "press-input") {
    next.pressResearch=replacePressResearch(next.pressResearch,next.input,next.versions.find(v=>v.id===next.active),payload.data,
      {expectedDataHash:payload.expectedDataHash,cutoff:new Date().toISOString()});
    if(next.pressResearch!==state.pressResearch)next.revision++;
  } else if (action === "cycle-input") {
    const active=next.versions.find(v=>v.id===next.active);
    const cycle=next.cycleResearch??createCycleState(next.input,active);
    const data=mergeCycleData(cycle.data,payload.data,next.input);
    next.cycleResearch=appendCycleReport({...cycle,data},next.input,active,{runPairAnalysis:true});
    next.revision++;
  } else if(action === "breakingRecord" || action === "breakingDecision"){
    const before=JSON.stringify(next.breaking),now=new Date();
    next.breaking=action==="breakingRecord"
      ?recordBreakingEvent(next.breaking,payload.event??payload,{now,codes:next.input.assets.map(a=>a.code),start:next.input.origin,end:next.input.end})
      :decideBreakingEvent(next.breaking,payload,{now,input:next.input,versions:next.versions,active:next.active});
    if(JSON.stringify(next.breaking)!==before)next.revision++;
  } else if (action === "evolutionNote") {
    const before=JSON.stringify(next.evolution);
    next.evolution=appendEvolutionNote(next.evolution,payload.note??payload,{
      now:new Date().toISOString(),codes:next.input.assets.map(a=>a.code),start:next.input.origin,end:next.input.end,
    });
    if(JSON.stringify(next.evolution)!==before)next.revision++;
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
    const journaled=journalInputChange(state.input,payload.input);
    next.input=journaled.input;
    if(journaled.changed)next.revision++;
  } else throw Error("지원하지 않는 동작입니다.");
  if(next.cycleResearch&&action!=="cycle-input")next.cycleResearch=appendCycleReport(next.cycleResearch,next.input,next.versions.find(v=>v.id===next.active));
  if(next.pressResearch&&action!=="press-input")next.pressResearch=appendPressReport(next.pressResearch,next.input,next.versions.find(v=>v.id===next.active));
  return ["candidate","approve","input"].includes(action)?syncSealedState(syncBreaking(syncEvolution(next))):next;
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
            row.featureObservedAt=now.toISOString();
            const p = a.prices.find((x) => x.date === row.date);
            // Enrich equal closing prices over the returned history, including the
            // pre-origin FOMO reference window. Never rewrite pre-origin closes here.
            if(p&&p.close===row.close&&p.quality!=='conflict'){
              const keys=['volume','open','high','low'];
              if(keys.some(k=>p[k]!==row[k])){
                const beforeRow=structuredClone(p);
                for(const key of keys)p[key]=row[key];
                p.featureObservedAt=now.toISOString();
                (next.priceRevisions??=[]).push({code:a.code,date:p.date,before:p.close,after:p.close,beforeRow,afterRow:structuredClone(p),at:now.toISOString(),provider:'NAVER_FEATURES'});
                added++;
              }
              continue;
            }
            if (row.date < input.origin) continue;
            if (!p) {
              (next.priceRevisions ??= []).push({code:a.code,date:row.date,before:null,beforeRow:null,after:row.close,afterRow:structuredClone(row),at:now.toISOString(),provider:'NAVER'});
              a.prices.push(row);
              added++;
            } else if (p.close == null && p.quality !== "conflict") {
              (next.priceRevisions ??= []).push({code:a.code,date:row.date,before:p.close,beforeRow:structuredClone(p),after:row.close,afterRow:structuredClone(row),at:now.toISOString(),provider:'NAVER'});
              a.prices[a.prices.indexOf(p)]=structuredClone(row);
              added++;
            } else if (next.newsSchema === 1 && p.close !== row.close) {
              (next.priceRevisions ??= []).push({
                code: a.code,
                date: row.date,
                before: p.close,
                beforeRow: structuredClone(p),
                after: row.close,
                afterRow: structuredClone(row),
                at: now.toISOString(),
                provider: "NAVER",
              });
              a.prices[a.prices.indexOf(p)]=structuredClone(row);
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
  const koreaDay=new Date(now.getTime()+9*3600000).toISOString().slice(0,10);
  if(koreaDay>state.input.end||koreaDay<state.input.origin)return state;
  const companyPromise=typeof options?.companyCollector==='function'
    ? Promise.resolve().then(()=>options.companyCollector({input:state.input,previous:state.companyNewsCollection??null,now,fetcher:options.companySourceFetcher})).catch(error=>({
      ...(structuredClone(state.companyNewsCollection??{})),exitCode:2,
      report:{status:'FAILED',partial:true,error:error.message,at:now.toISOString(),newVerifiedEvents:0,perAsset:state.input.assets.map(a=>({code:a.code,name:a.name,freshEventVerification:'NOT_PERFORMED',verifiedNewEvents:0}))},
    })) : Promise.resolve(null);
  const benchmarkPromise=typeof options?.benchmarkCollector==='function'
    ? Promise.resolve().then(()=>options.benchmarkCollector(state.atlasBenchmark,{now,fetcher:options.benchmarkFetcher,sessions:state.input.calendar.sessions,origin:state.input.origin,end:state.input.end})).catch(error=>({benchmark:state.atlasBenchmark,exitCode:2,log:{at:now.toISOString(),status:'FAILED',error:String(error?.message??error),priorPreserved:true}}))
    : Promise.resolve(null);
  const [collected, news,company,benchmark] = await Promise.all([
    collectActual(state.input, { ...options, now }),
    collectNews(state.input, { ...options, now }),
    companyPromise,
    benchmarkPromise,
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
  if(company)next.companyNewsCollection=company;
  if(benchmark){
    const validBenchmark=benchmark.benchmark?.code==='KOSPI'&&Array.isArray(benchmark.benchmark?.prices);
    next.atlasBenchmark=validBenchmark?benchmark.benchmark:state.atlasBenchmark;
    if(!validBenchmark){benchmark.exitCode=2;benchmark.log={...benchmark.log,status:'FAILED',priorPreserved:true,error:benchmark.log?.error??'INVALID_BENCHMARK_RESULT'};}
    collected.log.benchmark=benchmark.log;
  }
  collected.log.companyNews=company?.report??{status:'NOT_RUN',reason:'No server-side company collector supplied; no company-source verification claimed',newVerifiedEvents:0};
  collected.log.partial=collected.log.fresh!==52||news.log.success!==news.log.total||company?.report?.partial===true||benchmark?.exitCode===2;
  collected.log.exitCode=collected.log.partial?2:0;
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
      paths: 20000,
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
  if(next.input.assets.length===52){
    const active=next.versions.find(v=>v.id===next.active);
    if(typeof options?.cycleCollector==='function'){
      try{next.cycleResearch=await options.cycleCollector({input:next.input,version:active,previous:next.cycleResearch,now,fetcher:options.cycleFetcher});}
      catch(error){
        next.cycleResearch=appendCycleReport(next.cycleResearch,next.input,active,{cutoff:now.toISOString()});
        next.cycleResearch.collection={status:'failed',partial:true,attempted:1,success:0,failed:1,reason:error.message,at:now.toISOString()};
      }
    }else next.cycleResearch=appendCycleReport(next.cycleResearch,next.input,active,{cutoff:now.toISOString()});
    collected.log.cycle=next.cycleResearch.collection;
    if(collected.log.cycle?.exitCode===2||(collected.log.cycle?.attempted>0&&collected.log.cycle?.partial)){collected.log.partial=true;collected.log.exitCode=2;}
  }
  next.evaluationLedger=appendEvaluationLedger(next.evaluationLedger,next.versions,next.input,{now:now.toISOString()});
  // Ephemeral three-way merge base. Not serialized into the operating store.
  if(next.pressResearch){
    next.pressResearch=appendPressReport(next.pressResearch,next.input,next.versions.find(v=>v.id===next.active),{cutoff:now.toISOString()});
    collected.log.press={reportId:next.pressResearch.report.id,...next.pressResearch.report.counts,priceAdjustmentApplied:false};
  }
  let evolutionFailed=false;
  let breakingFailed=false;
  let sealedFailed=false;
  const evolved=syncSealedState(syncBreaking(syncEvolution(next,now,()=>{evolutionFailed=true;}),now,()=>{breakingFailed=true;}),{now,onFailure:()=>{sealedFailed=true;}});
  collected.log.sealedStudy={status:sealedFailed?'FAILED_PRIOR_PRESERVED':'UPDATED_OR_UNCHANGED',reports:evolved.sealedStudy?.reports?.length??0};
  if(sealedFailed){collected.log.partial=true;collected.log.exitCode=2;}
  collected.log.breaking={status:breakingFailed?'FAILED_PRIOR_PRESERVED':'UPDATED_OR_UNCHANGED'};
  if(breakingFailed){collected.log.partial=true;collected.log.exitCode=2;}
  collected.log.evolution={status:evolutionFailed?'FAILED_PRIOR_PRESERVED':'UPDATED_OR_UNCHANGED'};
  if(evolutionFailed){collected.log.partial=true;collected.log.exitCode=2;}
  Object.defineProperty(evolved,'refreshBase',{value:{input:state.input,atlasBenchmark:state.atlasBenchmark,cycleDataHash:state.cycleResearch?cycleHash(state.cycleResearch.data):null},enumerable:false});
  return evolved;
}
const identical=(a,b)=>JSON.stringify(a)===JSON.stringify(b);
const unionRecords=(a=[],b=[])=>[...new Map([...a,...b].map(item=>[JSON.stringify(item),structuredClone(item)])).values()];
function mergeCompanyCollection(current,update){
  if(!update)return current;
  if(!current)return structuredClone(update);
  const next=structuredClone(update),oldState=current.state,newState=next.state;
  if(oldState&&!newState)next.state=structuredClone(oldState);
  else if(oldState&&newState){
    newState.runs=[...new Map([...(oldState.runs??[]),...(newState.runs??[])].map(r=>[r.id,r])).values()];
    for(const [id,old]of Object.entries(oldState.sources??{})){
      const fresh=newState.sources[id];
      if(!fresh){newState.sources[id]=structuredClone(old);continue;}
      fresh.attempts=unionRecords(old.attempts,fresh.attempts);
      fresh.revisions=unionRecords(old.revisions,fresh.revisions);
      if(old.lastGood&&(!fresh.lastGood||Date.parse(old.lastGood.lastCheckedAt)>Date.parse(fresh.lastGood.lastCheckedAt))){
        if(fresh.lastGood&&!identical(fresh.lastGood,old.lastGood))fresh.revisions=unionRecords(fresh.revisions,[fresh.lastGood]);
        fresh.lastGood=structuredClone(old.lastGood);
      }
    }
  }
  if(current.registry&&next.registry){
    const sources=new Map(next.registry.sources.map(s=>[s.id,s]));
    for(const old of current.registry.sources){const fresh=sources.get(old.id);if(!fresh)sources.set(old.id,structuredClone(old));else fresh.config={...fresh.config,...structuredClone(old.config??{})};}
    next.registry.sources=[...sources.values()];
    next.registry.assets=next.registry.assets.map(a=>({...a,sourceIds:next.registry.sources.filter(s=>s.codes.includes(a.code)).map(s=>s.id)}));
  }else if(current.registry&&!next.registry)next.registry=structuredClone(current.registry);
  return next;
}
export function mergeRefresh(current, update) {
  const next=structuredClone(current),base=update.refreshBase?.input,conflicts=[];
  const blockedPrices=new Set();
  for(const asset of next.input.assets){
    const fresh=update.input.assets.find(a=>a.code===asset.code),before=base?.assets.find(a=>a.code===asset.code);
    for(const row of fresh?.prices??[]){
      const old=asset.prices.find(p=>p.date===row.date),prior=before?.prices.find(p=>p.date===row.date);
      if(!old){asset.prices.push(structuredClone(row));continue;}
      if(identical(old,row)||identical(prior,row))continue;
      if(base&&identical(old,prior)){
        const index=asset.prices.indexOf(old);asset.prices[index]=structuredClone(row);
      }else{
        blockedPrices.add(asset.code+':'+row.date);
        conflicts.push({type:'price',code:asset.code,date:row.date,at:update.input.informationAsOf??null,current:structuredClone(old),incoming:structuredClone(row),reason:'Concurrent user/collector edit retained; incoming price not applied'});
      }
    }
    asset.prices.sort((a,b)=>a.date.localeCompare(b.date));
  }
  next.input.actualAsOf=[current.input.actualAsOf,update.input.actualAsOf].sort().at(-1);
  next.input.retrievedAt=[current.input.retrievedAt,update.input.retrievedAt].sort().at(-1);
  // Price chronology is independent of whether the macro-news check was newer.
  const incomingPriceRevisions=(update.input.priceRevisions??[]).filter(r=>!blockedPrices.has(r.code+':'+r.date));
  next.input.priceRevisions=unionRecords(current.input.priceRevisions,incomingPriceRevisions);
  for(const id of new Set((update.input.events??[]).map(e=>e.id))){
    const incoming=update.input.events.filter(e=>e.id===id),existing=next.input.events.filter(e=>e.id===id),prior=base?.events.filter(e=>e.id===id);
    if(identical(existing,incoming)||identical(prior,incoming))continue;
    if(!existing.length||(base&&identical(existing,prior))){
      next.input.events=next.input.events.filter(e=>e.id!==id).concat(structuredClone(incoming));
    }else{
      // Preserve all conflicting records for the event gate; never collapse them in a Map.
      next.input.events=next.input.events.filter(e=>e.id!==id).concat(unionRecords(existing,incoming));
      conflicts.push({type:'news',id,at:update.input.informationAsOf??null,current:structuredClone(existing),incoming:structuredClone(incoming),reason:'Concurrent same-ID descriptions retained for conflict gate'});
    }
  }
  next.input.newsRevisions=unionRecords(current.input.newsRevisions,update.input.newsRevisions);
  if(Date.parse(update.input.newsCheckedAt??'')>=Date.parse(current.input.newsCheckedAt??'')||!current.input.newsCheckedAt){
    for(const key of ['newsCheckedAt','newsCollection'])next.input[key]=structuredClone(update.input[key]);
  }
  next.input.informationAsOf=[current.input.informationAsOf,update.input.informationAsOf].filter(Boolean).sort((a,b)=>Date.parse(a)-Date.parse(b)).at(-1);
  if(conflicts.length){
    next.mergeConflicts=unionRecords(next.mergeConflicts,conflicts);
    // Keep unapplied incoming revision records as conflict evidence, not active replay history.
    next.unappliedPriceRevisions=unionRecords(next.unappliedPriceRevisions,(update.input.priceRevisions??[]).filter(r=>blockedPrices.has(r.code+':'+r.date)));
  }
  for(const version of update.versions)if(!next.versions.some(v=>v.id===version.id))next.versions.push(structuredClone(version));
  next.collectionLogs=unionRecords(next.collectionLogs,update.collectionLogs);
  next.updates=unionRecords(next.updates,update.updates);
  next.companyNewsCollection=mergeCompanyCollection(current.companyNewsCollection,update.companyNewsCollection);
  if(!conflicts.length){
    const latest=next.versions.filter(v=>v.modelVersion===MODEL_VERSION).sort((a,b)=>a.origin.localeCompare(b.origin)||Date.parse(a.informationCutoff)-Date.parse(b.informationCutoff)).at(-1);
    if(latest)next.active=latest.id;
  }
  next.revision=Math.max(current.revision,update.revision)+(conflicts.length?1:0);
  next.completed=current.completed||update.completed;
  next.lastEvaluation=evaluateForecast(next.versions.find(v=>v.id===next.active),next.input);
  if(update.cycleResearch){
    const sameBase=update.refreshBase?.cycleDataHash=== (current.cycleResearch?cycleHash(current.cycleResearch.data):null);
    if(!current.cycleResearch||sameBase)next.cycleResearch=structuredClone(update.cycleResearch);
    else{
      next.cycleResearch=structuredClone(current.cycleResearch);
      next.cycleResearch.collectionLogs=unionRecords(current.cycleResearch.collectionLogs,update.cycleResearch.collectionLogs);
      if(cycleHash(current.cycleResearch.data)!==cycleHash(update.cycleResearch.data))
        (next.cycleResearch.unappliedCollections??=[]).push({at:update.cycleResearch.report.generatedAt,reason:'동시 사용자 수정 보존',data:structuredClone(update.cycleResearch.data)});
    }
  }
  if(next.cycleResearch)next.cycleResearch=appendCycleReport(next.cycleResearch,next.input,next.versions.find(v=>v.id===next.active));
  if(next.pressResearch||update.pressResearch)next.pressResearch=mergePressResearch(next.pressResearch,update.pressResearch,next.input,next.versions.find(v=>v.id===next.active));
  next.evaluationLedger=appendEvaluationLedger(unionRecords(current.evaluationLedger,update.evaluationLedger),next.versions,next.input);
  next.evolutionErrors=unionRecords(current.evolutionErrors,update.evolutionErrors);
  next.unappliedEvolution=unionRecords(current.unappliedEvolution,update.unappliedEvolution);
  try { next.evolution=mergeEvolution(current.evolution,update.evolution); }
  catch(error) {
    // A conflicting incoming history is evidence, never an overwrite target.
    next.evolution=structuredClone(current.evolution??null);
    next.unappliedEvolution=unionRecords(next.unappliedEvolution,[{at:update.input.informationAsOf??null,reason:String(error?.message??error),evolution:structuredClone(update.evolution)}]);
  }
  next.sealedStudy=mergeSealedState(current.sealedStudy,update.sealedStudy);
  next.atlasBenchmark=mergeBenchmark(current.atlasBenchmark,update.atlasBenchmark,{base:update.refreshBase?.atlasBenchmark});
  return syncSealedState(syncBreaking(syncEvolution(mergeBreakingRelease(next,update))));

}
