/**
 * ATLAS 11 · 매 거래일 실행기 (파일 기반)
 *   node scripts/atlas11/run_daily.mjs [--now ISO] [--collector <module.mjs>] [--force] [--no-backtests] [--budget-minutes N]
 * --collector 모듈은 `export async function collect(input, window)` 를 내보내고
 *   {attempted:true, provider, observations:[{code, sourceUrl, rawHash, observedAt, finalClose, sessionDate, finalizedAt, finalitySourceUrl, finalityBasis, rows:[{date,open,high,low,close,volume}]}], errors:[]} 를 돌려준다.
 * 수집기가 없으면 시도하지 않고 실패로 기록한다(저장 자료만 사용). 이 파일을 두는 것은 서버·예약 설치가 아니다.
 * 거리는 config/atlas11/horizon.json 스위치 하나(runDaily·발행이 같은 파일을 읽는다): futureDays 1 = 내일 하루만(채점 1거래일 · 후보 20거래일 시험 꺼 둠) · 20 = 옛 동작.
 */
import path from 'node:path';
import fs from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {pathToFileURL} from 'node:url';
import {runDaily, offlineCollector} from '../../lib/atlas11/daily.mjs';
import {buildAndPersist} from './build_forecast.mjs';
import {buildAndWriteView} from './build_view.mjs';

const arg = name => { const i = process.argv.indexOf(name); return i < 0 ? null : process.argv[i + 1]; };
let collector = offlineCollector;
const collectorPath = arg('--collector') ?? process.env.ATLAS_COLLECTOR;
if (collectorPath) { const mod = await import(pathToFileURL(path.resolve(collectorPath)).href); collector = mod.collect; }
const codeSHA256 = createHash('sha256').update((await Promise.all(['lib/atlas11/daily.mjs', 'lib/atlas11/analysis.mjs', 'lib/atlas11/records.mjs', 'lib/atlas11/evolve/models.mjs', 'lib/atlas11/evolve/backtest.mjs', 'lib/atlas11/evolve/promote.mjs', 'lib/atlas11/evolve/registry.mjs', 'lib/atlas11/forecast.mjs', 'lib/atlas11/horizon.mjs'].map(f => fs.readFile(f, 'utf8')))).join('\n')).digest('hex');
const result = await runDaily({now: arg('--now') ?? new Date().toISOString(), collector, build: buildAndPersist, buildView: buildAndWriteView, forceForecast: process.argv.includes('--force'), runBacktests: !process.argv.includes('--no-backtests'), backtestTimeBudgetMs: arg('--budget-minutes') ? Number(arg('--budget-minutes')) * 60000 : null, codeSHA256, log: (name, entry) => console.error(JSON.stringify({step: name, status: entry.status, durationMs: entry.durationMs, error: entry.error ?? undefined}))});
console.log(JSON.stringify(result));
process.exitCode = result.exitCode;
