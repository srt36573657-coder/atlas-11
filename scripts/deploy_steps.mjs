import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";

// Record only the stage and exit code. Command arguments can contain secrets.
export function runStep(exe, args, label, { cwd, dry = false, logFile = process.env.ATLAS_RUN_LOG_PATH ?? path.join(cwd, ".atlas", "deploy-log.jsonl"), onOutput } = {}) {
  if(onOutput!==undefined&&typeof onOutput!=='function')throw TypeError('onOutput must be a function');
  const emit=onOutput??((stream,text)=>{(stream==='stderr'?process.stderr:process.stdout).write(text);});
  emit('stdout',label+'\n');
  if (dry) return;
  fs.mkdirSync(path.dirname(logFile), { recursive: true });
  const record = data => fs.appendFileSync(logFile, JSON.stringify({ at: new Date().toISOString(), stage: label, ...data }) + "\n");
  record({ status: "started" });
  const env={...process.env};
  // A deployment child must not inherit node:test's binary output protocol.
  delete env.NODE_TEST_CONTEXT;
  const capture=typeof onOutput==='function';
  // Output is an explicit dependency in tests/embedded callers: no child bytes
  // or stage labels may enter a test worker's V8-framed stdout transport.
  // The real executable still runs. Ordinary deployment keeps the live terminal.
  const r = spawnSync(exe, args, { cwd, env,
    stdio: capture ? ["inherit", "pipe", "pipe"] : "inherit",
    ...(capture ? {encoding:"utf8",maxBuffer:16*1024*1024} : {}),
    shell: process.platform === "win32" });
  if(capture) {
    if(r.stdout?.length)emit('stdout',r.stdout);
    if(r.stderr?.length)emit('stderr',r.stderr);
  }
  if (r.error || r.status !== 0) {
    record({ status: "failed", exitCode: r.status, signal: r.signal, errorCode: r.error?.code });
    throw Error(`${label} 실패 (${r.error?.code ?? r.signal ?? r.status ?? "실행 중단"}). 실행 기록: ${logFile}. 연결 또는 설치 문제를 해결한 뒤 같은 실행기를 다시 실행하세요.`);
  }
  record({ status: "success", exitCode: 0 });
}
