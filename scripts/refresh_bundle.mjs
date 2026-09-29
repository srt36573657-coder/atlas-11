import {collectBenchmark} from '../lib/benchmark-collection.mjs';
import {createCycleCollector} from '../lib/cycle-runtime.mjs';
// Daily portable update. Never rebuild or overwrite the original forecast.
import fs from "node:fs/promises";
import { initialState, refreshState } from "../lib/service.mjs";
import { checkForecast, evaluateForecast } from "../lib/news-engine.mjs";
import {createCompanyCollector} from '../lib/company-collection-runtime.mjs';
import {fileURLToPath} from 'node:url';
const root = new URL("../", import.meta.url),
  file = new URL("public/data/atlas.json", root);
const bundle = JSON.parse(await fs.readFile(file, "utf8")),
  state = initialState(bundle);
const today = new Date(Date.now() + 9 * 3600000).toISOString().slice(0, 10);
if (today > state.input.end) {
  console.log("예측 기간이 종료되었습니다. 원본과 마지막 관측을 보존합니다.");
  process.exit(0);
}
const originalBefore = JSON.stringify(bundle.original);
const next = await refreshState(state, {
  benchmarkCollector:collectBenchmark,
  companyCollector:createCompanyCollector({directory:fileURLToPath(new URL('reports/collection52',root))}),
  cycleCollector:createCycleCollector(),
  feedUrl: process.env.ATLAS_NEWS_FEED_URL,
});
const original = next.versions.find((v) => v.id === next.original),
  candidate = next.versions.find((v) => v.id === next.active);
if (JSON.stringify(original) !== originalBefore)
  throw Error("최초 전망 변경을 거부했습니다.");
const checks = checkForecast(candidate, next.input);
if (!checks.ok || !checks.complete) throw Error(JSON.stringify(checks));
const output = {
  ...bundle,
  input: next.input,
  original,
  candidate,
  priorVersions: next.versions.filter(
    (v) => v.id !== original.id && v.id !== candidate.id,
  ),
  collectionLogs: next.collectionLogs,
  evaluationLedger:next.evaluationLedger,
  sealedStudy:next.sealedStudy,
  atlasBenchmark:next.atlasBenchmark,
  breaking:next.breaking,
  breakingErrors:next.breakingErrors,
  unappliedBreaking:next.unappliedBreaking,
  evolution:next.evolution,
  evolutionErrors:next.evolutionErrors,
  unappliedEvolution:next.unappliedEvolution,
  companyNewsCollection:next.companyNewsCollection,
  pressResearch:next.pressResearch,
  cycleResearch:next.cycleResearch,
  actions: next.actions,
  updates: next.updates,
  revision: next.revision,
  completed: next.completed,
  evaluation: evaluateForecast(original, next.input),
  checks,
};
await fs.writeFile(
  new URL("public/data/atlas.next.json", root),
  JSON.stringify(output),
);
await fs.rename(new URL("public/data/atlas.next.json", root), file);
await fs.writeFile(
  new URL("public/data/input.json", root),
  JSON.stringify(next.input),
);
const log = next.collectionLogs.at(-1);
console.log(
  JSON.stringify(
    {
      actualAsOf: next.input.actualAsOf,
      prices: log.fresh,
      news: log.news.success,
      newsSources: log.news.total,
      companySources:{sourceCount:log.companyNews?.sourceCount??0,observed:log.companyNews?.successfulSources??0,failed:log.companyNews?.failedSources??0,deferred:log.companyNews?.deferredSources??0,partial:log.companyNews?.partial??true,newVerifiedEvents:log.companyNews?.newVerifiedEvents??0,reusedObservation:log.companyNews?.reusedObservation??false},
      partial:log.partial,
      versions: next.versions.length,
      evolution: log.evolution ?? null,
      breaking:log.breaking??null,
      active: next.active,
      originalUnchanged: true,
      checks,
    },
    null,
    2,
  ),
);
if (log.partial)
  process.exitCode = 2;

// FOMO runs after normal prices/news are durably written; partial evidence stays partial.
const {spawnSync}=await import("node:child_process");
const childEnv={...process.env};delete childEnv.NODE_TEST_CONTEXT;
const fomoRun=spawnSync(process.execPath,["scripts/research_fomo_v2.mjs","--collect"],{cwd:fileURLToPath(root),env:childEnv,stdio:"inherit",timeout:180000});
if(fomoRun.error||fomoRun.status!==0)process.exitCode=2;
