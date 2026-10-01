#!/usr/bin/env node
/**
 * 후향 실행기(갈래 나) — v1 방법(입력 input.json@30dcfb2 · 120 기준일 · 경로 512 · 난수 20260917)
 *   node scripts/atlas11/overhaul/lane-b/run-retro.mjs --model A        --out <cells.json>
 *   node scripts/atlas11/overhaul/lane-b/run-retro.mjs --model pooled   --out <cells.json>   (③ 52종목 무게 한 벌)
 *   node scripts/atlas11/overhaul/lane-b/run-retro.mjs --model A --center median|symmetric --out <cells.json>  (⑤ 보조)
 * 결과(칸 자료)는 --out 파일에 쓴다. 운영 코드·운영 결과는 바꾸지 않는다.
 */
import fs from 'node:fs';
import path from 'node:path';
import {ROOT, RETRO_INPUT, inputAt, readJSON, sha256} from './common.mjs';
import {runRetro, protocolOf, sameAsStored} from './retro.mjs';

const arg = k => { const i = process.argv.indexOf(k); return i < 0 ? null : process.argv[i + 1]; };
const model = arg('--model') ?? 'A', center = arg('--center') ?? 'mean', out = arg('--out');
if (!out) { console.error('--out 이 필요하다'); process.exit(2); }
const config = readJSON('config/atlas11/evolution.v1.json');
const protocol = protocolOf(config);
const {input, sha256: inputSHA} = inputAt(RETRO_INPUT.commit, RETRO_INPUT.path, RETRO_INPUT.sha256);
const spec = config.operating.spec;
let fitBlock = null, simulate;
if (model === 'pooled') fitBlock = (await import('./pooled.mjs')).pooledFitBlock;
if (center !== 'mean') { const m = await import('./simulate-variant.mjs'); simulate = (models, panel, assets, dates, opt) => m.simulateJointVariant(models, panel, assets, dates, {...opt, center}); }
const t0 = Date.now();
const run = runRetro(input, spec, {protocol, fitBlock, simulate: simulate ?? undefined, onProgress: (k, n, d) => { if (k % 20 === 0) console.error(JSON.stringify({model, center, completed: k, total: n, origin: d, elapsedMs: Date.now() - t0})); }});
const stored = model === 'A' && center === 'mean' ? readJSON('reports/atlas11/evolve/backtests/A.json') : null;
const reproduction = stored ? sameAsStored(run, stored) : null;
const result = {schema: 'atlas11-overhaul-retro-cells-1', label: '후향', model, center, protocol, protocolSHA256: sha256(JSON.stringify(protocol)).slice(0, 16), input: {...RETRO_INPUT, sha256: inputSHA}, elapsedMs: Date.now() - t0, reproduction, ...run};
fs.mkdirSync(path.dirname(path.resolve(out)), {recursive: true});
fs.writeFileSync(out, JSON.stringify(result));
console.log(JSON.stringify({model, center, out, elapsedMs: result.elapsedMs, reproduction: reproduction && {identical: reproduction.identical, diffCount: reproduction.diffCount}, summary: run.summary}));
