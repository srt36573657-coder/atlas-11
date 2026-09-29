import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { spawn } from "node:child_process";
import { once } from "node:events";
test("HTTP auth, concurrent approval, durable restart and unchanged original", async () => {
  const temp = await fs.mkdtemp(path.join(os.tmpdir(), "atlas-server-")),
    port = 18879,
    token = "local-integration-test-key",
    url = `http://127.0.0.1:${port}/api/atlas`;
  let child;
  const start = async () => {
    child = spawn(process.execPath, ["server.mjs"], {
      cwd: new URL("..", import.meta.url),
      env: {
        ...process.env,
        ATLAS_PORT: String(port),
        ATLAS_ADMIN_TOKEN: token,
        ATLAS_STATE_FILE: path.join(temp, "state.json"),
      },
    });
    await new Promise((resolve, reject) => {
      child.stdout.once("data", resolve);
      child.once("error", reject);
      child.once("exit", (c) => reject(Error("server exit " + c)));
    });
  };
  const stop = async () => {
    const exit = once(child, "exit");
    child.kill();
    await exit;
  };
  try {
    await start();
    const initial = (await (await fetch(url)).json()).state,
      original = JSON.stringify(initial.versions[0]),
      candidate = initial.versions[1].id;
    const send = (body, auth = true, origin) =>
      fetch(url, {
        method: "POST",
        headers: {
          "content-type": "application/json",
          ...(auth ? { authorization: `Bearer ${token}` } : {}),
          ...(origin ? { origin } : {}),
        },
        body: JSON.stringify(body),
      });
    assert.equal(
      (
        await send(
          { action: "approve", id: candidate, requestId: "unauthorized" },
          false,
        )
      ).status,
      401,
    );
    assert.equal(
      (
        await send(
          { action: "approve", id: candidate, requestId: "cross-origin" },
          true,
          "https://foreign.example",
        )
      ).status,
      403,
    );
    const replies = await Promise.all([
      send({ action: "approve", id: candidate, requestId: "once" }),
      send({ action: "approve", id: candidate, requestId: "once" }),
    ]);
    assert.ok(replies.every((r) => r.status === 200));
    await stop();
    await start();
    const stored = (await (await fetch(url)).json()).state;
    assert.equal(stored.active, candidate);
    assert.equal(stored.actions.length, initial.actions.length + 1);
    assert.equal(stored.revision, initial.revision + 1);
    assert.equal(JSON.stringify(stored.versions[0]), original);
  } finally {
    if (child?.exitCode === null) await stop();
    await fs.rm(temp, { recursive: true, force: true });
  }
});
