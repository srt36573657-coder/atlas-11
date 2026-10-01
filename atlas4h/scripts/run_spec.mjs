#!/usr/bin/env node
/**
 * ATLAS 4시간 엔진 · 사양 T1~T23 · 극한 K1~K7 서른 개를 지금 저장소 기록으로 돌린다
 *   node atlas4h/scripts/run_spec.mjs                    엔진 없이 (T4·T15·K1~K7 은 「엔진 없음」)
 *   node atlas4h/scripts/run_spec.mjs --engine <모듈>    모듈의 default(또는 run·engine) 함수를 엔진으로 씀
 * 결과: atlas4h/harness/spec-latest.json 에 적고 화면에 짧은 표를 낸다.
 * 종료코드: 이 스크립트가 멈출 때만 1. 「안 통과」가 있어도 0 — 통과 표시는 평가 일꾼만 바꾼다(passlist.json).
 * T11 은 깃에서 a9187c6 뒤 「atlas4h」 커밋의 바뀐 파일을, T19 는 판정 기준 파일의 마지막 커밋 시각을 센다.
 */
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath, pathToFileURL} from 'node:url';
import {loadState, runAll, collectAtlas4hChanges, judgmentCommitTime} from '../spec/checks.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const OUT = path.join(ROOT, 'atlas4h', 'harness', 'spec-latest.json');

/** 한국 시각 ISO (초까지) */
function kstNow(d = new Date()) {
  return new Date(d.getTime() + 9 * 3600e3).toISOString().replace(/\.\d{3}Z$/, '+09:00');
}

async function loadEngine(file) {
  if (!file) return undefined;
  const mod = await import(pathToFileURL(path.resolve(file)).href);
  const fn = mod.default ?? mod.run ?? mod.engine;
  if (typeof fn !== 'function') throw new Error(`엔진 함수가 없음: ${file}`);
  return fn;
}

async function main() {
  const argv = process.argv.slice(2);
  const at = argv.indexOf('--engine');
  const engine = await loadEngine(at >= 0 ? argv[at + 1] : null);
  const state = await loadState(ROOT);
  const opts = {engine, changes: collectAtlas4hChanges(ROOT), judgmentCommitAt: judgmentCommitTime(ROOT)};
  const results = runAll(state, opts);
  const passed = results.filter(r => r.pass).length;
  const out = {schema: 'atlas4h-spec-latest-1', at: kstNow(), results, passed, failed: results.length - passed};
  fs.mkdirSync(path.dirname(OUT), {recursive: true});
  fs.writeFileSync(OUT, `${JSON.stringify(out, null, 1)}\n`);

  for (const e of state.errors) console.log(`못 읽은 줄: ${path.relative(ROOT, e.file)}${e.line ? `:${e.line}` : ''} — ${e.message}`);
  for (const r of results) console.log(`${r.id.padEnd(4)} ${r.pass ? '통과   ' : '안 통과'}  ${r.reason}`);
  console.log(`통과 ${passed} · 안 통과 ${out.failed} (엔진 ${engine ? '있음' : '없음'}) → ${path.relative(ROOT, OUT)}`);
}

main().catch(e => {
  console.error(`run_spec 이 멈춤: ${e?.stack ?? e}`);
  process.exit(1);
});
