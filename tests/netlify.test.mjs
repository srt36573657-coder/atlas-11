import test from "node:test";
import assert from "node:assert/strict";
import http from "node:http";
import { createHash } from "node:crypto";
import { setEnvironmentContext } from "@netlify/blobs";

test("Netlify SDK adapter: auth, persistence and conditional-write HTTP contract", async () => {
  // Contract fixture: local SDK BlobsServer 11.1.1 omits GET ETag headers.
  // This fixture implements the documented strong-read/conditional-write HTTP contract;
  // it is not a claim of testing a hosted Netlify deployment.
  const entries = new Map();
  const server = http.createServer(async (req, res) => {
    const old = entries.get(req.url);
    if (req.method === "GET") {
      if (!old) {
        res.writeHead(404);
        return res.end();
      }
      res.writeHead(200, { etag: old.etag });
      return res.end(old.body);
    }
    if (req.method === "PUT") {
      if (
        (req.headers["if-none-match"] === "*" && old) ||
        (req.headers["if-match"] && req.headers["if-match"] !== old?.etag)
      ) {
        res.writeHead(412);
        return res.end();
      }
      const chunks = [];
      for await (const chunk of req) chunks.push(chunk);
      const body = Buffer.concat(chunks),
        etag = '"' + createHash("sha256").update(body).digest("hex") + '"';
      entries.set(req.url, { body, etag });
      res.writeHead(200, { etag });
      return res.end();
    }
    res.writeHead(405);
    res.end();
  });
  await new Promise((r) => server.listen(0, "127.0.0.1", r));
  const endpoint = `http://127.0.0.1:${server.address().port}`;
  setEnvironmentContext({
    siteID: "atlas-test",
    token: "local-test",
    edgeURL: endpoint,
    uncachedEdgeURL: endpoint,
  });
  process.env.ATLAS_ADMIN_TOKEN = "test-admin";
  process.env.DEPLOY_ID = "isolated-test";
  try {
    const { default: handler } = await import("../netlify/functions/atlas.mjs");
    const { readState, saveState } = await import("../netlify/lib/state.mjs");
    const request = (body, key = "test-admin") =>
      new Request("https://atlas.example/api/atlas", {
        method: "POST",
        headers: {
          authorization: `Bearer ${key}`,
          "content-type": "application/json",
        },
        body: JSON.stringify(body),
      });
    const initial = await (
      await handler(new Request("https://atlas.example/api/atlas"))
    ).json();
    assert.ok(initial.state, JSON.stringify(initial));
    const state = initial.state;
    assert.ok(state.versions.length >= 2);
    assert.equal(
      (await handler(request({ action: "approve" }, "wrong"))).status,
      401,
    );
    const payload = {
      action: "approve",
      id: state.versions[1].id,
      requestId: "netlify-once",
    };
    const saved = await handler(request(payload));
    assert.equal(saved.status, 200, await saved.text());
    const repeated = await handler(request(payload));
    assert.equal(repeated.status, 200, await repeated.text());
    const first = await readState(),
      second = await readState();
    assert.equal(first.state.actions.length, state.actions.length + 1);
    assert.equal(first.state.active, state.versions[1].id);
    first.state.versions.push({
      ...structuredClone(first.state.versions[1]),
      id: "2026-09-23-abcd0123",
    });
    first.state.revision++;
    await saveState(first.state, first.etag);
    const thin = await (
      await handler(new Request("https://atlas.example/api/atlas"))
    ).json();
    assert.equal(
      thin.state.versions.find((v) => v.id === "2026-09-23-abcd0123").assets
        .length,
      0,
    );
    const full = await (
      await handler(
        new Request(
          "https://atlas.example/api/atlas?version=2026-09-23-abcd0123",
        ),
      )
    ).json();
    assert.equal(full.version.assets.length, 52);
    assert.ok(full.version.assets[0].news[0].samples.length >= 5);
    await assert.rejects(
      () => saveState(second.state, second.etag),
      /다른 작업/,
    );
  } finally {
    await new Promise((r) => server.close(r));
  }
});
