import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs/promises";
import {
  forecast,
  checkForecast,
  evaluateForecast,
  gateEvents,
  eliminateInfluence,
  eligibleOrigins,
  validateInput,
} from "../lib/forecast-engine.mjs";
import {
  initialState,
  transition,
  parseNaver,
  collectActual,
  refreshState,
  mergeRefresh,
} from "../lib/service.mjs";
import {
  parseBLS,
  parseFED,
  parseBOK,
  mergeNews,
} from "../lib/news-sources.mjs";
const input = JSON.parse(
  await fs.readFile(new URL("./fixtures/input-v3.json", import.meta.url)),
);
const options = {
    paths: 2000,
    seed: 20260917,
    createdAt: "2026-09-24T00:00:00Z",
  },
  base = forecast(input, options);
const bundle = {
  input,
  original: base,
  candidate: forecast(input, {
    ...options,
    origin: "2026-09-23",
    informationCutoff: input.informationAsOf,
  }),
};
const read = async (name) =>
  fs.readFile(
    new URL("../news-research/" + name + ".html", import.meta.url),
    "utf8",
  );
const html = {
  BLS: await read("bls2026"),
  FED: await read("fed"),
  BOK: await read("bok2026"),
};
test("52 stocks, full 9/17–10/30 horizon, six live news links per stock, valid distributions", () => {
  const c = checkForecast(bundle.original, input);
  assert.equal(c.complete, true);
  assert.equal(c.newsConnectedAll52, true);
  assert.equal(c.actualRows, 1456);
  assert.equal(base.targets.length, 28);
  assert.equal(base.targets.at(-1), "2026-10-30");
  assert.equal(base.newsCoverage.acceptedEvents, 6);
  assert.equal(base.newsCoverage.assetsWithNews, 52);
  assert.ok(
    Math.abs(base.assets.reduce((s, a) => s + a.probTop10, 0) - 10) < 1e-10,
  );
  for (const a of base.assets) {
    assert.equal(a.eventsUsed, 6);
    assert.ok(a.news.every((p) => p.sampleCount >= 5));
    assert.ok(
      a.rows.every((r) => r.p10 > 0 && r.p10 <= r.p50 && r.p50 <= r.p90),
    );
  }
});
test("seed reproduces results; actual prices AFTER the origin cannot alter the frozen forecast", () => {
  assert.deepEqual(forecast(input, options), base);
  const changed = structuredClone(input);
  for (const a of changed.assets)
    for (const p of a.prices) if (p.date > input.origin) p.close *= 100;
  assert.deepEqual(forecast(changed, options), base);
});
test("removing future news changes paths; no-news counterfactual uses exactly the same ordinary draws", () => {
  const changed = structuredClone(input);
  changed.events = changed.events.filter((e) => e.targetDate <= input.origin);
  const v = forecast(changed, options);
  assert.equal(v.newsCoverage.acceptedEvents, 0);
  for (let i = 0; i < 52; i++) {
    assert.deepEqual(
      v.assets[i].rows.map((r) => r.p50),
      base.assets[i].rows.map((r) => r.noNewsP50),
    );
  }
  assert.ok(
    base.assets.some(
      (a, i) => a.rows.at(-1).p90 !== v.assets[i].rows.at(-1).p90,
    ),
  );
});
test("moving a news date moves the distribution change, without moving earlier unchanged prices", () => {
  const changed = structuredClone(input),
    event = changed.events.find((e) => e.targetDate === "2026-09-30");
  event.announcementDate = "2026-09-30";
  event.targetDate = "2026-10-01";
  const v = forecast(changed, options),
    a = base.assets[0],
    b = v.assets[0];
  assert.deepEqual(
    a.rows.filter((r) => r.date < "2026-09-30"),
    b.rows.filter((r) => r.date < "2026-09-30"),
  );
  assert.notEqual(
    a.rows.find((r) => r.date === "2026-09-30").p90,
    b.rows.find((r) => r.date === "2026-09-30").p90,
  );
  assert.equal(b.rows.find((r) => r.date === "2026-10-01").eventIds.length, 1);
});
test("future disclosure, duplicates and unsupported news evidence are visibly eliminated", () => {
  const changed = structuredClone(input),
    e = changed.events.find((e) => e.targetDate === "2026-09-30");
  changed.events.push(structuredClone(e));
  changed.events.push({
    ...e,
    id: "future-test",
    availableAt: "2026-10-01T00:00:00Z",
  });
  changed.events.push({ ...e, id: "no-source-test", sources: [] });
  const gate = gateEvents(
    changed,
    input.origin,
    input.origin + "T16:00:00+09:00",
  );
  assert.equal(gate.accepted.length, 6);
  assert.equal(gate.rejected.length, 3);
});
test("negative evidence survives; influence selection only trains on earlier outcomes", () => {
  const samples = Array.from({ length: 12 }, (_, i) => ({
    date: `2025-${String(i + 1).padStart(2, "0")}-01`,
    value: -0.04,
  }));
  const result = eliminateInfluence(samples);
  assert.ok(result.mu < 0);
  assert.ok(result.lambda > 0);
  assert.equal(result.folds, 7);
  const mixed = base.assets.flatMap((a) => a.news.flatMap((p) => p.samples));
  assert.ok(mixed.some((s) => s.value < 0));
  assert.ok(mixed.some((s) => s.value > 0));
  for (const p of base.assets[0].news) {
    for (const a of base.assets) {
      const own=a.news.find(x=>x.id===p.id);
      assert.deepEqual(own.sharedDates,p.sharedDates);
      assert.ok(own.samples.every(s=>s.date<=input.origin));
      assert.equal(new Set(own.samples.map(s=>s.date)).size,own.samples.length);
    }
  }
  // v6 keeps valid crash days, so complete real histories can have equal sample counts.
  // Introduce one genuine data-quality gap and verify only its owner's event sample is removed.
  const changed=structuredClone(input),profile=base.assets[0].news[0],sample=profile.samples.at(-1);
  changed.assets[0].prices.find(p=>p.date===sample.date).quality='conflict';
  const v=forecast(changed,options);
  assert.ok(!v.assets[0].news.find(p=>p.id===profile.id).samples.some(s=>s.date===sample.date));
  for(let i=1;i<52;i++){assert.deepEqual(v.assets[i].news,base.assets[i].news);assert.deepEqual(v.assets[i].rows,base.assets[i].rows);}
});
test("official calendar parsing converts US after-hours releases and Korean holidays correctly", () => {
  const events = [
    ...parseBLS(
      html.BLS,
      2026,
      input.calendar.sessions,
      "2026-09-24T00:00:00Z",
    ),
    ...parseFED(html.FED, input.calendar.sessions, "2026-09-24T00:00:00Z"),
    ...parseBOK(
      html.BOK,
      2026,
      input.calendar.sessions,
      "2026-09-24T00:00:00Z",
    ),
  ];
  assert.equal(events.filter((e) => e.kind === "FOMC").length, 24);
  assert.equal(
    events.some(
      (e) => e.kind === "FOMC" && e.announcementDate === "2025-08-22",
    ),
    false,
  );
  const expected = {
    JOBS: ["2026-10-02", "2026-10-06"],
    CPI: ["2026-10-14", "2026-10-15"],
    PPI: ["2026-10-15", "2026-10-16"],
    FOMC: ["2026-10-28", "2026-10-29"],
    BOK: ["2026-10-22", "2026-10-22"],
  };
  for (const [kind, [date, target]] of Object.entries(expected))
    assert.equal(
      events.find((e) => e.kind === kind && e.announcementDate === date)
        .targetDate,
      target,
    );
  assert.throws(() =>
    parseBLS(
      "<html>blocked</html>",
      2026,
      input.calendar.sessions,
      "2026-09-24",
    ),
  );
});
test("schedule corrections are new revisions and cannot be backdated into an old forecast", () => {
  const old = input.events.find((e) => e.targetDate === "2026-09-30"),
    changed = {
      ...old,
      announcementDate: "2026-09-30",
      targetDate: "2026-10-01",
    };
  const updated = mergeNews(input, [changed], [], "2026-09-24T00:00:00Z");
  assert.equal(
    updated.events.find((e) => e.id === old.id).availableAt,
    "2026-09-24T00:00:00Z",
  );
  assert.equal(updated.newsRevisions.length, 1);
  assert.equal(
    gateEvents(
      updated,
      input.origin,
      input.origin + "T16:00:00+09:00",
    ).accepted.find((e) => e.id === old.id)?.targetDate,
    "2026-09-30",
  );
  assert.equal(gateEvents(updated,input.origin,'2026-09-25T00:00:00Z').accepted.find(e=>e.id===old.id)?.targetDate,'2026-10-01');
  assert.equal(old.targetDate, "2026-09-30");
});
test("actual evaluation excludes anchor; previous published version is immutable", () => {
  const score = evaluateForecast(bundle.original, input);
  assert.equal(score.n, 208);
  assert.ok(score.rows.every((r) => r.date > input.origin));
  const state = initialState(bundle),
    original = JSON.stringify(state.versions[0]);
  assert.equal(state.active, bundle.candidate.id);
  const a = transition(state, "approve", {
    id: bundle.original.id,
    requestId: "once",
  });
  const b = transition(a, "approve", {
    id: bundle.original.id,
    requestId: "once",
  });
  assert.equal(b.actions.length, 1);
  assert.equal(JSON.stringify(b.versions[0]), original);
  const bad = structuredClone(base);
  bad.ranking[0].rank = 2;
  assert.throws(() => transition(state, "candidate", { version: bad }));
});
test("daily collection recalculates and activates all 52 automatically while preserving prior versions", async () => {
  const state = initialState(bundle),
    before = JSON.stringify(state.versions),
    now = new Date("2026-09-28T08:30:00Z");
  const fetcher = async (url) => {
    if (url.includes("naver")) {
      const code = new URL(url).searchParams.get("symbol"),
        price = input.assets.find((a) => a.code === code).prices.at(-1).close;
      return new Response(
        `<chartdata symbol="${code}"><item data="20260928|${Math.round(price)}|${Math.round(price * 1.03)}|${Math.round(price * 0.99)}|${Math.round(price * 1.02)}|1000"/></chartdata>`,
      );
    }
    return new Response(
      url.includes("bls.gov")
        ? html.BLS
        : url.includes("federalreserve")
          ? html.FED
          : html.BOK,
    );
  };
  const next = await refreshState(state, { now, fetcher });
  assert.equal(next.collectionLogs.at(-1).fresh, 52);
  assert.equal(next.collectionLogs.at(-1).news.success, 3);
  assert.notEqual(next.active, state.active);
  assert.equal(
    next.versions.find((v) => v.id === next.active).origin,
    "2026-09-28",
  );
  assert.equal(next.updates.length, 1);
  assert.equal(next.actions.length, 0);
  assert.equal(JSON.stringify(state.versions), before);
  assert.deepEqual(next.versions.slice(0, 2), state.versions);
  const concurrent = structuredClone(state);
  concurrent.actions.push({ type: "defer", requestId: "concurrent" });
  concurrent.input.events.push({
    id: "custom-concurrent",
    kind: "CUSTOM",
    name: "test",
    availableAt: "2026-09-28T08:31:00Z",
  });
  const merged = mergeRefresh(concurrent, next);
  assert.equal(merged.actions.length, 1);
  assert.ok(merged.input.events.some((e) => e.id === "custom-concurrent"));
  assert.equal(merged.active, next.active);
});
test("failed collections preserve data; partial price coverage cannot silently advance the 52-stock anchor", async () => {
  const failed = await refreshState(initialState(bundle), {
    now: new Date("2026-09-28T08:30:00Z"),
    fetcher: async () => {
      throw Error("offline");
    },
  });
  assert.deepEqual(failed.input.assets, input.assets);
  assert.equal(failed.active, bundle.candidate.id);
  assert.equal(failed.collectionLogs.at(-1).success, 0);
  assert.equal(failed.collectionLogs.at(-1).news.success, 0);
  const partial = structuredClone(input);
  partial.actualAsOf = "2026-09-28";
  partial.assets[0].prices.push({ date: "2026-09-28", close: 300000 });
  assert.equal(eligibleOrigins(partial).at(-1), "2026-09-23");
  const rows = parseNaver(
    '<chartdata symbol="005930"><item data="20260923|99|105|95|100|500"/><item data="20260924|100|105|95|101|500"/></chartdata>',
    "005930",
    "2026-09-23",
    input.calendar.sessions,
  );
  assert.equal(rows.length, 1);
  assert.equal(rows[0].close, 100);
  const bad = structuredClone(input);
  bad.assets[0].prices.push(bad.assets[0].prices[0]);
  assert.throws(() => validateInput(bad));
});

test("closed-market days reuse already observed prices, without pretending to fetch 52 fresh quotes", async () => {
  let calls = 0;
  const result = await collectActual(input, {
    now: new Date("2026-09-25T08:00:00Z"),
    fetcher: async () => {
      calls++;
      throw Error("should not fetch closed day");
    },
  });
  assert.equal(calls, 0);
  assert.equal(result.log.cached, 52);
  assert.equal(result.log.success, 0);
  assert.equal(result.log.fresh, 52);
  assert.deepEqual(result.input.assets, input.assets);
});
test("an unchanged daily news check does not manufacture duplicate forecast versions", async () => {
  const state = initialState(bundle);
  const next = await refreshState(state, {
    now: new Date("2026-09-25T08:00:00Z"),
    fetcher: async (url) =>
      new Response(
        url.includes("bls.gov")
          ? html.BLS
          : url.includes("federalreserve")
            ? html.FED
            : html.BOK,
      ),
  });
  assert.equal(next.collectionLogs.at(-1).news.success, 3);
  assert.equal(next.versions.length, state.versions.length);
  assert.equal(next.active, state.active);
  assert.equal(next.collectionLogs.at(-1).forecastChanged, false);
});
test("many archived versions remain bounded in API responses; stored full evidence is preserved", async () => {
  const { clientState } = await import("../lib/service.mjs"),
    { gzipSync } = await import("node:zlib");
  const state = initialState(bundle);
  state.versions = Array.from({ length: 100 }, (_, i) => ({
    ...bundle.candidate,
    id: "archive-" + i,
  }));
  state.original = "archive-0";
  state.active = "archive-99";
  const publicData = clientState(state);
  assert.equal(
    publicData.versions.filter((v) => v.assets.length === 52).length,
    2,
  );
  assert.ok(state.versions.every((v) => v.assets.length === 52));
  assert.ok(state.versions.at(-1).assets[0].rows[2].numericalPrecision);
  assert.equal(publicData.versions.at(-1).assets[0].rows.at(-1).numericalPrecision.method,'fixed_n_dkw_massart');
  assert.ok(gzipSync(JSON.stringify(publicData)).length < 2000000);
});
