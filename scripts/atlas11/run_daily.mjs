/**
 * ATLAS 11 · 매 거래일 실행기(파일 기반) — 예측 없음(2026-10-04 15:37 사장님 「이제 예측을 하지 않는다」)
 *   node scripts/atlas11/run_daily.mjs [--now ISO] [--collector <module.mjs>]
 * --collector 모듈은 `export async function collect(input, window)` 를 내보내고
 *   {attempted:true, provider, observations:[{code, sourceUrl, rawHash, observedAt, finalClose, sessionDate, finalizedAt, finalitySourceUrl, finalityBasis, rows:[{date, close, …}]}], errors:[]} 를 돌려준다.
 * 수집기가 없으면 시도하지 않고 실패로 기록한다(저장 자료만 사용). 하는 일: 실제 종가 모으기 · 종목 바꾸기 · 52곳 판 화면 묶음.
 */
import path from 'node:path';
import fs from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {pathToFileURL} from 'node:url';
import {runDaily, offlineCollector} from '../../lib/atlas11/daily.mjs';
import {buildAndWriteView} from './build_view.mjs';

const arg = name => { const i = process.argv.indexOf(name); return i < 0 ? null : process.argv[i + 1]; };
let collector = offlineCollector;
const collectorPath = arg('--collector') ?? process.env.ATLAS_COLLECTOR;
if (collectorPath) { const mod = await import(pathToFileURL(path.resolve(collectorPath)).href); collector = mod.collect; }
const codeSHA256 = createHash('sha256').update((await Promise.all(['lib/atlas11/daily.mjs', 'lib/atlas11/records.mjs', 'lib/atlas11/universe-switch.mjs', 'lib/rolling-operation.mjs'].map(f => fs.readFile(path.join(process.cwd(), f), 'utf8')))).join('\n')).digest('hex');
const result = await runDaily({now: arg('--now') ?? new Date().toISOString(), collector, buildView: buildAndWriteView, codeSHA256});
console.log(JSON.stringify(result));
process.exitCode = result.exitCode;
