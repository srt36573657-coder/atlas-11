// Reconcile only documented conflicts with a third provider; preserve all evidence.
import fs from "node:fs/promises";
import { parseNaver } from "../lib/service.mjs";
const input = JSON.parse(await fs.readFile("public/data/input.json", "utf8")),
  raw = JSON.parse(await fs.readFile("engine/data/prices.json", "utf8")),
  results = [];
const affected = input.assets.filter((a) =>
  a.prices.some((p) => p.quality === "conflict"),
);
for (let i = 0; i < affected.length; i += 3) {
  await Promise.all(
    affected.slice(i, i + 3).map(async (a) => {
      try {
        const url = `https://fchart.stock.naver.com/sise.nhn?symbol=${a.code}&timeframe=day&count=60&requestType=0`;
        let res;
        for (let retry = 0; retry < 2; retry++) {
          try {
            res = await fetch(url, { signal: AbortSignal.timeout(20000) });
            if (!res.ok) throw Error("HTTP " + res.status);
            break;
          } catch (e) {
            if (retry === 1) throw e;
          }
        }
        const xml = await res.text(),
          retrievedAt = new Date().toISOString(),
          rows = parseNaver(
            xml,
            a.code,
            input.actualAsOf,
            input.calendar.sessions,
          );
        for (const p of a.prices.filter((p) => p.quality === "conflict")) {
          const live = rows.find((x) => x.date === p.date),
            prior = raw.observations.filter(
              (x) => x.code === a.code && x.date === p.date,
            ),
            agrees =
              live &&
              prior.some(
                (x) => x.close != null && Number(x.close) === live.close,
              );
          results.push({
            code: a.code,
            date: p.date,
            close: agrees ? live.close : null,
            status: agrees ? "reconciled" : "unresolved",
            url,
            retrievedAt,
            naverClose: live?.close ?? null,
            prior,
            reason: agrees
              ? "NAVER 재조회 종가가 기존 제공사 중 한 곳의 종가와 일치. 상충 원값은 기록 보존."
              : "제3 제공사 대조 불충분 — 결측 유지",
          });
        }
        console.log(a.code, "checked");
      } catch (e) {
        results.push({ code: a.code, status: "unresolved", error: e.message });
        console.log(a.code, e.message);
      }
    }),
  );
}
await fs.writeFile(
  "engine/research/reconciled_naver.json",
  JSON.stringify(results, null, 2),
);
console.log(
  "Resolved",
  results.filter((x) => x.status === "reconciled").length,
  "of",
  results.length,
);
