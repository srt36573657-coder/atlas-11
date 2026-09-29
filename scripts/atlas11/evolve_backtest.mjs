/**
 * ATLAS 11 · 진화 실험 — 후보 시간순 검증 실행기
 *   node scripts/atlas11/evolve_backtest.mjs --spec A                # 운영 A (등가 확인)
 *   node scripts/atlas11/evolve_backtest.mjs --spec cand-xxxxxxxxxxxx   # 설정에서 만든 후보 id
 *   node scripts/atlas11/evolve_backtest.mjs --list                  # 후보 목록
 *   [--paths 512] [--config config/atlas11/evolution.v1.json]
 * 결과는 reports/atlas11/evolve/backtests/<specId>.json 에 저장(입력·프로토콜 해시 같으면 재사용).
 */
import fs from 'node:fs/promises';
import path from 'node:path';
import {createHash} from 'node:crypto';
import {generateCandidates, normalizeSpec, specId} from '../../lib/atlas11/evolve/models.mjs';
import {runSpecBacktest, protocolOf} from '../../lib/atlas11/evolve/backtest.mjs';

const root = process.cwd();
const arg = name => { const i = process.argv.indexOf(name); return i < 0 ? null : process.argv[i + 1]; };
const configFile = arg('--config') ?? 'config/atlas11/evolution.v1.json';
const config = JSON.parse(await fs.readFile(path.join(root, configFile), 'utf8'));
const candidates = generateCandidates(config);
if (process.argv.includes('--list')) { console.log(JSON.stringify({operating: {id: 'A', ...normalizeSpec(config.operating.spec)}, candidates: candidates.map(c => ({id: c.id, family: c.family, label: c.label, penalties: c.penalties, volatility: c.volatility, featureMask: c.featureMask, carry: c.carry}))}, null, 1)); process.exit(0); }
const want = arg('--spec') ?? 'A';
const spec = want === 'A' ? normalizeSpec(config.operating.spec) : candidates.find(c => c.id === want) ?? (want.startsWith('{') ? normalizeSpec(JSON.parse(want)) : null);
if (!spec) { console.error('unknown spec ' + want); process.exit(1); }
const inputBytes = await fs.readFile(path.join(root, 'public/data/input.json')), input = JSON.parse(inputBytes);
const protocol = protocolOf(config, arg('--paths') ? {paths: Number(arg('--paths'))} : {});
const t0 = Date.now();
const result = await runSpecBacktest(input, spec, {protocol, cacheDir: path.join(root, 'reports/atlas11/evolve/backtests'), inputSHA256: createHash('sha256').update(inputBytes).digest('hex'), onProgress: (k, n, date) => { if (k % 20 === 0) console.error(JSON.stringify({spec: specId(spec), completed: k, total: n, origin: date, elapsedMs: Date.now() - t0})); }});
console.log(JSON.stringify({specId: result.specId, label: spec.label, fromCache: result.fromCache === true, summary: result.summary, byBlock: result.byBlock.map(b => ({block: b.block, meanErrorPct: b.meanErrorPct, rankHits: b.rankHits})), elapsedMs: result.elapsedMs}));
