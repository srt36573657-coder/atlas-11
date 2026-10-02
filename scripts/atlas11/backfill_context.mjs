#!/usr/bin/env node
/**
 * ATLAS 11 · 지난 기록 모으기 실행기 (사장님이 atlas11-backfill 버튼으로만 돌린다 · 예약 없음)
 *   node scripts/atlas11/backfill_context.mjs [--from 2023-01-01] [--codes 005930,...] [--max-pages 80] [--page-size 60] [--fixtures DIR] [--root DIR]
 * 쓰는 것
 *   reports/atlas11/backfill/<시각>/macro/<시계열>.json · flows/<종목>.json   해석한 값 · 페이지마다 주소·원문 해시 · 멈춘 이유
 *   reports/atlas11/raw/backfill/<시각>.json.gz                              받은 원문 그대로(주소 → 본문)
 *   reports/atlas11/backfill/latest.json                                       마지막 묶음 목록(재료 시험기가 읽는다)
 * 지키는 것: 결측을 0 으로 채우지 않는다 · 가격(종가)은 받지 않는다 · 예측 숫자에 바로 쓰지 않는다(시험 통과 전)
 */
import fs from 'node:fs/promises';
import path from 'node:path';
import zlib from 'node:zlib';
import {promisify} from 'node:util';
import {MACRO_SERIES} from '../../lib/atlas11/context.mjs';
import {BACKFILL_SCHEMA, BACKFILL_FROM, backfillSeries, backfillFlows, safeName} from '../../lib/atlas11/backfill.mjs';
import {makeFetcher} from './collect_context.mjs';

const gzip = promisify(zlib.gzip);
const arg = name => { const i = process.argv.indexOf(name); return i < 0 ? null : process.argv[i + 1]; };
const log = x => console.log(JSON.stringify({at: new Date().toISOString(), ...x}));
async function pool(items, n, fn) { const out = new Array(items.length); let i = 0; await Promise.all(Array.from({length: Math.min(n, items.length)}, async () => { while (i < items.length) { const k = i++; out[k] = await fn(items[k], k); } })); return out; }
const sleep = ms => new Promise(r => setTimeout(r, ms));

export async function runBackfill({rootDir = process.cwd(), from = BACKFILL_FROM, codes = null, maxPages = 80, pageSize = 60, fixtures = null, now = new Date().toISOString(), pauseMs = 250} = {}) {
  const input = JSON.parse(await fs.readFile(path.join(rootDir, 'public/data/input.json'), 'utf8'));
  const assets = input.assets.filter(a => !codes || codes.includes(a.code)).map(a => ({code: a.code, name: a.name}));
  const f = makeFetcher({fixtures, retries: 2, breakerAfter: 12});
  const get = async (url, opt) => { const g = await f.get(url, opt); if (!fixtures) await sleep(pauseMs); return g; };
  const stamp = now.replace(/[:.]/g, '-'), base = path.join(rootDir, 'reports/atlas11/backfill', stamp);
  await fs.mkdir(path.join(base, 'macro'), {recursive: true}); await fs.mkdir(path.join(base, 'flows'), {recursive: true});
  const common = {schema: BACKFILL_SCHEMA, from, fetchedAt: now, vintage: 'retrieved_now_not_point_in_time', usedInForecast: false, missing: 'null · 0 으로 채우지 않음'};
  const macro = [], flows = [], errors = [];
  for (const s of MACRO_SERIES) {
    const r = await backfillSeries(get, s, {from, maxPages, pageSize});
    const file = path.join(base, 'macro', safeName(s.id) + '.json');
    await fs.writeFile(file, JSON.stringify({...common, id: s.id, provider: s.provider, factorId: s.factorId, unit: s.unit, label: s.label, componentOnly: s.componentOnly, fallbackFor: s.fallbackFor ?? null, ...r, count: r.rows.length, first: r.rows[0]?.date ?? null, last: r.rows.at(-1)?.date ?? null}));
    const row = {id: s.id, factorId: s.factorId, file: path.relative(rootDir, file), rows: r.rows.length, first: r.rows[0]?.date ?? null, last: r.rows.at(-1)?.date ?? null, mode: r.mode, stop: r.stop, pages: r.pages.length, conflicts: r.conflicts.length};
    macro.push(row); if (!r.rows.length || ['fetch_failed', 'parse_failed'].includes(r.stop)) errors.push({kind: 'macro', id: s.id, stop: r.stop, error: r.pages.find(p => !p.ok)?.error ?? null});
    log({macro: s.id, rows: row.rows, first: row.first, last: row.last, stop: r.stop, mode: r.mode});
  }
  await pool(assets, 3, async a => {
    const r = await backfillFlows(get, a.code, {from, maxPages, pageSize});
    const file = path.join(base, 'flows', a.code + '.json');
    await fs.writeFile(file, JSON.stringify({...common, code: a.code, name: a.name, factorIds: ['F14', 'F16', 'F19'], fields: {foreignNet: 'F14', institutionNet: 'F16(연기금 포함 기관 합계 · 일부 성분)', individualNet: 'F19', volume: '거래량(수급 몫 분모)'}, ...r, count: r.rows.length, first: r.rows[0]?.date ?? null, last: r.rows.at(-1)?.date ?? null}));
    const row = {code: a.code, name: a.name, file: path.relative(rootDir, file), rows: r.rows.length, first: r.rows[0]?.date ?? null, last: r.rows.at(-1)?.date ?? null, mode: r.mode, stop: r.stop, pages: r.pages.length, conflicts: r.conflicts.length};
    flows.push(row); if (!r.rows.length || ['fetch_failed', 'parse_failed'].includes(r.stop)) errors.push({kind: 'flows', code: a.code, stop: r.stop, error: r.pages.find(p => !p.ok)?.error ?? null});
    log({flows: a.code, rows: row.rows, first: row.first, last: row.last, stop: r.stop, mode: r.mode, pages: row.pages});
  });
  flows.sort((a, b) => a.code.localeCompare(b.code));
  const rawDir = path.join(rootDir, 'reports/atlas11/raw/backfill'); await fs.mkdir(rawDir, {recursive: true});
  await fs.writeFile(path.join(rawDir, stamp + '.json.gz'), await gzip(JSON.stringify(Object.fromEntries(f.raw))));
  const summary = {macroSeries: macro.length, macroWithRows: macro.filter(m => m.rows).length, flowStocks: flows.length, flowStocksWithRows: flows.filter(x => x.rows).length, flowStocksReachedFrom: flows.filter(x => x.stop === 'reached_from').length, flowFirstEarliest: flows.map(x => x.first).filter(Boolean).sort()[0] ?? null, flowFirstLatest: flows.map(x => x.first).filter(Boolean).sort().at(-1) ?? null, errors: errors.length};
  const latest = {schema: 'atlas11-backfill-latest-1', stamp, fetchedAt: now, from, dir: path.relative(rootDir, base), raw: path.relative(rootDir, path.join(rawDir, stamp + '.json.gz')), macro, flows, errors, summary, usedInForecast: false};
  await fs.writeFile(path.join(base, 'summary.json'), JSON.stringify(latest, null, 1));
  await fs.writeFile(path.join(rootDir, 'reports/atlas11/backfill/latest.json'), JSON.stringify(latest, null, 1));
  const status = !macro.some(m => m.rows) && !flows.some(x => x.rows) ? 'failed' : errors.length ? 'partial' : 'ok';
  log({status, summary});
  return {status, summary, latest: path.relative(rootDir, path.join(rootDir, 'reports/atlas11/backfill/latest.json'))};
}

if (process.argv[1] && path.resolve(process.argv[1]) === new URL(import.meta.url).pathname) {
  const out = await runBackfill({rootDir: arg('--root') ?? process.cwd(), from: arg('--from') ?? BACKFILL_FROM, codes: arg('--codes')?.split(',') ?? null, maxPages: Number(arg('--max-pages') ?? 80), pageSize: Number(arg('--page-size') ?? 60), fixtures: arg('--fixtures'), now: arg('--now') ?? new Date().toISOString()});
  console.log(JSON.stringify(out));
  process.exitCode = out.status === 'failed' ? 2 : 0;
}
