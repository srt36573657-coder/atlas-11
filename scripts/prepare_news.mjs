import fs from "node:fs/promises";
import { parseBLS, parseFED, parseBOK } from "../lib/news-sources.mjs";
const root = new URL("../", import.meta.url);
const read = async (file) =>
  JSON.parse(await fs.readFile(new URL(file, root), "utf8"));
const old = await read("public/data/input.json");
await fs.mkdir(new URL("public/archive/", root), { recursive: true });
try {
  await fs.copyFile(
    new URL("public/data/atlas.json", root),
    new URL("public/archive/atlas-price-v2.json", root),
    fs.constants.COPYFILE_EXCL,
  );
} catch (e) {
  if (e.code !== "EEXIST") throw e;
}
const assets = await Promise.all(
  old.assets.map(async (a) => {
    const raw = await read(`news-research/prices/${a.code}.json`);
    return {
      id: a.id,
      code: a.code,
      name: a.name,
      sector: a.sector,
      leaderStatus: a.leaderStatus,
      priceSource: {
        provider: "NAVER",
        url: raw.url,
        retrievedAt: raw.retrievedAt,
        quality: "single_source",
        note: "현재 조회한 가격 이력 · 당시 데이터 빈티지와 기업행위 조정 여부 미확인",
      },
      prices: raw.rows.map((p) => ({ date: p.date, close: p.close })),
    };
  }),
);
const sessions = [
  ...new Set([
    ...assets.flatMap((a) => a.prices.map((p) => p.date)),
    ...old.calendar.sessions,
  ]),
].sort();
const observedAt = new Date().toISOString();
// Observation date below is the task's source-retrieval date. It is not a historical forecast issue date.
const html = (name) =>
  fs.readFile(new URL(`news-research/${name}.html`, root), "utf8");
const events = [];
for (const year of [2025, 2026]) {
  events.push(
    ...parseBLS(await html(`bls${year}`), year, sessions, observedAt),
  );
  events.push(
    ...parseBOK(await html(`bok${year}`), year, sessions, observedAt),
  );
}
events.push(...parseFED(await html("fed"), sessions, observedAt));
// Retain a separately classified historical strategy vote, never use it as a rate-decision sample.
const strategy = old.events?.find((e) => e.kind === "FED_STRATEGY");
if (strategy) events.push(structuredClone(strategy));
const input = {
  schema: 2,
  newsSchema: 1,
  origin: old.origin,
  end: old.end,
  actualAsOf: "2026-09-23",
  retrievedAt: "2026-09-24",
  newsCheckedAt: observedAt,
  informationAsOf: observedAt,
  calendar: { ...old.calendar, sessions },
  assets,
  events,
  newsRevisions: [],
  newsCollection: {
    at: observedAt,
    success: 3,
    total: 3,
    items: [
      { provider: "BLS", ok: true },
      { provider: "FED", ok: true },
      { provider: "BOK", ok: true },
    ],
  },
  coverage: {
    corporateEventsVerified: 0,
    note: "기업별 3분기 실적·수주·임상·정책 뉴스는 확인된 일정과 반응 표본이 아직 없습니다. 공통 공식 경제 뉴스 6종류가 계산에 연결됩니다. 기업 사건은 근거 파일로 추가할 수 있습니다.",
    attempts: [
      {
        source: "KRX KIND IR 일정",
        at: observedAt,
        status: "조회 시간 초과 · 연결 대기",
      },
      {
        source: "삼성전자 IR 일정",
        at: observedAt,
        status: "2026년 3분기 확정 발표일 미확인",
        url: "https://www.samsung.com/global/ir/ir-events-presentations/events/",
      },
    ],
  },
  provenance: {
    method: "공식 발표 일정 + 같은 종류의 발표일 종목 반응",
    pricePolicy:
      "v3은 52종목 일관 비교를 위해 NAVER 가격 이력 사용. 이전 혼합 출처 v2는 별도 보존.",
    retrospective: true,
    legacy: "/archive/atlas-price-v2.json",
  },
};
await fs.writeFile(
  new URL("public/data/input.json", root),
  JSON.stringify(input),
);
console.log(
  JSON.stringify(
    {
      stocks: assets.length,
      prices: assets.reduce((s, a) => s + a.prices.length, 0),
      events: events.length,
      upcoming: events
        .filter((e) => e.targetDate > input.origin && e.targetDate <= input.end)
        .map((e) => ({
          name: e.name,
          date: e.announcementDate,
          kr: e.targetDate,
          known: e.availableAt,
        })),
    },
    null,
    2,
  ),
);
