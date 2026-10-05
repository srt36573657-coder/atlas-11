import fs from "node:fs/promises";
try {
  const existing = JSON.parse(
    await fs.readFile(
      new URL("../public/data/atlas.json", import.meta.url),
      "utf8",
    ),
  );
  if (
    existing.model === "news" &&
    !process.argv.includes("--new-reconstruction")
  )
    throw Error(
      "저장된 최초 전망이 있습니다. 운영 갱신은 npm run refresh를 사용하세요. 새 재구성은 명시적 --new-reconstruction 옵션이 필요합니다.",
    );
  if (existing.model === "news") {
    await fs.mkdir(new URL("../public/archive/", import.meta.url), {
      recursive: true,
    });
    await fs.writeFile(
      new URL(
        "../public/archive/news-draft-" + Date.now() + ".json",
        import.meta.url,
      ),
      JSON.stringify(existing),
    );
  }
} catch (e) {
  if (e.code !== "ENOENT") throw e;
}
import {
  forecast,
  evaluateForecast,
  checkForecast,
  eligibleOrigins,
} from "../lib/news-engine.mjs";
const input = JSON.parse(
  await fs.readFile(
    new URL("../public/data/input.json", import.meta.url),
    "utf8",
  ),
);
const original = forecast(input, {
  origin: input.origin,
  paths: 10000,
  seed: 20260917,
});
const candidateOrigin = eligibleOrigins(input).at(-1);
const candidate = forecast(input, {
  origin: candidateOrigin,
  informationCutoff: input.informationAsOf,
  paths: 10000,
  seed: Number(candidateOrigin.replaceAll("-", "")),
});
const checks = checkForecast(original, input);
if (!checkForecast(candidate, input).complete)
  throw Error("후보 52종목 계산 실패");
if (!checks.ok || !checks.complete) throw Error(JSON.stringify(checks));
const bundle = {
  schema: 2,
  input,
  original,
  candidate,
  evaluation: evaluateForecast(original, input),
  checks,
  model: "news",
};
await fs.writeFile(
  new URL("../public/data/atlas.json", import.meta.url),
  JSON.stringify(bundle),
);
console.log(
  JSON.stringify(
    {
      original: original.id,
      candidate: candidate.id,
      ...checks,
      evaluationN: bundle.evaluation.n,
      mae: bundle.evaluation.mae,
      baselineMAE: bundle.evaluation.baselineMAE,
      top5: original.ranking.slice(0, 5),
    },
    null,
    2,
  ),
);
