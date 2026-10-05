import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs/promises";
import path from "node:path";
import os from "node:os";
import { spawnSync } from "node:child_process";
import { supportedNode, readSourceZip, prepareSource } from "../public/DEPLOY_NETLIFY.mjs";
import { runStep } from "../scripts/deploy_steps.mjs";
const archive = new URL("../publish/downloads/ATLAS_Program_Source.zip", import.meta.url);
const launcher = new URL("../public/DEPLOY_NETLIFY.mjs", import.meta.url);
async function fixture() {
  const root = await fs.mkdtemp(path.join(os.tmpdir(), "atlas-deploy-test-"));
  await fs.mkdir(path.join(root, "downloads"));
  await fs.copyFile(archive, path.join(root, "downloads", "ATLAS_Program_Source.zip"));
  await fs.copyFile(launcher, path.join(root, "DEPLOY_NETLIFY.mjs"));
  return root;
}
test("deployment rejects unsupported Node versions before installation", () => {
  for (const version of ["18.20.0", "20.19.0", "22.0.0", "22.22.1", "23.11.0", "24.14.9", "25.0.0", "26.0.0-rc.1"])
    assert.equal(supportedNode(version), false, version);
  for (const version of ["22.22.2", "22.23.0", "24.15.0", "24.19.0", "26.0.0"])
    assert.equal(supportedNode(version), true, version);
});
test("release checker really validates CRC, rejects damaged ZIPs, and never starts deployment", async () => {
  const root = await fixture();
  try {
    const run = () => spawnSync(process.execPath, [path.join(root, "DEPLOY_NETLIFY.mjs"), "--check"], { encoding: "utf8" });
    const good = run();
    assert.equal(good.status, 0, good.stderr);
    assert.match(good.stdout, /CRC 확인/);
    await assert.rejects(fs.access(path.join(root, ".atlas-deploy")));
    const zipPath = path.join(root, "downloads", "ATLAS_Program_Source.zip"), zip = await fs.readFile(zipPath);
    zip[30 + zip.readUInt16LE(26) + zip.readUInt16LE(28)] ^= 255;
    await fs.writeFile(zipPath, zip);
    const bad = run();
    assert.equal(bad.status, 1);
    assert.match(bad.stderr, /손상/);
    await assert.rejects(fs.access(path.join(root, ".atlas-deploy")));
    const log = (await fs.readFile(path.join(root, "ATLAS_RUN_LOG.jsonl"), "utf8")).trim().split("\n").map(JSON.parse);
    assert.deepEqual(log.map(e => e.status), ["checked", "failed"]);
    assert.throws(() => readSourceZip(Buffer.from("broken")), /손상/);
  } finally { await fs.rm(root, { recursive: true, force: true }); }
});
test("deployment retry preserves updated prices, administrator key and existing original work", async () => {
  const root = await fixture();
  try {
    const legacy = path.join(root, ".atlas-deploy", "public", "data");
    await fs.mkdir(legacy, { recursive: true });
    await fs.writeFile(path.join(legacy, "atlas.json"), "existing-original");
    const first = await prepareSource(root);
    assert.equal(first.restored, true);
    const data = path.join(first.destination, "public", "data", "atlas.json");
    await fs.writeFile(data, "updated-actuals-and-forecasts");
    await fs.mkdir(path.join(first.destination, ".atlas"));
    await fs.writeFile(path.join(first.destination, ".atlas", "admin-key.txt"), "existing-key");
    const second = await prepareSource(root);
    assert.equal(second.destination, first.destination);
    assert.equal(second.restored, false);
    assert.equal(await fs.readFile(data, "utf8"), "updated-actuals-and-forecasts");
    assert.equal(await fs.readFile(path.join(first.destination, ".atlas", "admin-key.txt"), "utf8"), "existing-key");
    assert.equal(await fs.readFile(path.join(legacy, "atlas.json"), "utf8"), "existing-original");
  } finally { await fs.rm(root, { recursive: true, force: true }); }
});
test("failed installation keeps a stage record without secrets, returns failure, then allows retry", async () => {
  const root = await fs.mkdtemp(path.join(os.tmpdir(), "atlas-step-test-")),
    logFile = path.join(root, "run.jsonl"), secret = "do-not-log-command-arguments";
  try {
    const fail = path.join(root, "fail.mjs"), pass = path.join(root, "pass.mjs");
    await fs.writeFile(fail, "if(process.env.NODE_TEST_CONTEXT!==undefined)process.exit(91);process.stdout.write('installation stdout\\n');process.stderr.write('installation stderr\\n');process.exit(7)");
    await fs.writeFile(pass, "if(process.env.NODE_TEST_CONTEXT!==undefined)process.exit(92);process.stdout.write('retry stdout\\n');process.stderr.write('retry stderr\\n');process.exit(0)");
    const output=[],onOutput=(stream,text)=>output.push({stream,text});
    assert.throws(() => runStep(process.execPath, [fail, secret], "설치", { cwd: root, logFile,onOutput }), /실패 \(7\)/);
    runStep(process.execPath, [pass], "설치 재시도", { cwd: root, logFile,onOutput });
    assert.deepEqual(output,[
      {stream:'stdout',text:'설치\n'},
      {stream:'stdout',text:'installation stdout\n'},
      {stream:'stderr',text:'installation stderr\n'},
      {stream:'stdout',text:'설치 재시도\n'},
      {stream:'stdout',text:'retry stdout\n'},
      {stream:'stderr',text:'retry stderr\n'},
    ]);
    assert.ok(!JSON.stringify(output).includes(secret));
    const log = await fs.readFile(logFile, "utf8");
    assert.ok(!log.includes(secret));
    const records=log.trim().split("\n").map(JSON.parse);
    assert.deepEqual(records.map(e => e.status), ["started", "failed", "started", "success"]);
    assert.equal(records[1].exitCode,7);assert.equal(records[3].exitCode,0);
    assert.deepEqual(records.map(e=>e.stage),['설치','설치','설치 재시도','설치 재시도']);
    assert.ok(records.every(e=>Number.isFinite(Date.parse(e.at))&&!('args'in e)&&!('stdout'in e)&&!('stderr'in e)));
  } finally { await fs.rm(root, { recursive: true, force: true }); }
});
