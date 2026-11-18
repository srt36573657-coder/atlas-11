#!/usr/bin/env node
/**
 * 지금 시장 받기(주문 1118-1239 · 사장님 2026-11-18(마카오) 12:39 · 12:48 「응」 — docs/design/su-now-2026-11-18/order-1239.txt)
 *   한국 시각 오전 10시 · 오후 2시 · 저녁 6시(.github/workflows/atlas11-su-now.yml)에 돌아
 *   ① 코스피 · 코스닥 지수 ② 시장 전체에서 외국인 · 기관 · 개인이 사고판 돈(억 원) ③ 판(board.json) 회사들의 그때 값 을 받아 적는다.
 *   올릴 때(package.mjs → su21.py --now) 이 값으로 「지금 땅」을 다시 가리고, 그 땅의 지난 기록으로 덜 잃은 꾀를 첫 화면에 보인다.
 *
 *   node scripts/atlas11/next/su_now.mjs [--root DIR] [--now ISO] [--fixtures DIR] [--codes 005930,000660]
 * 쓰는 것
 *   reports/atlas11/su-now/latest.json             마지막 묶음(올릴 때 읽음)
 *   reports/atlas11/su-now/<한국 날>/<HHMM>.json    그때 묶음(덮어쓰지 않음)
 * 지키는 것: 결측을 0 으로 채우지 않는다 · 장이 열려 있을 때 값은 굳지 않은 값(open) · 앞날을 맞히지 않는다 · 사고팔기를 권하지 않는다
 */
import fs from 'node:fs/promises';
import path from 'node:path';
import {makeFetcher} from '../collect_context.mjs';
import {SU_NOW_SCHEMA, NOW_IDX, NOW_URLS, kstOf, parseIndexNow, parseIndexFlows, parseStockNow, openAt} from '../../../lib/atlas11/su-now.mjs';

const arg = (name, argv = process.argv) => { const i = argv.indexOf(name); return i < 0 ? null : argv[i + 1]; };
async function pool(items, n, fn) { const out = new Array(items.length); let i = 0; await Promise.all(Array.from({length: Math.min(n, items.length)}, async () => { while (i < items.length) { const k = i++; out[k] = await fn(items[k], k); } })); return out; }

export async function collectNow({now = new Date().toISOString(), rootDir = process.cwd(), fixtures = null, codes = null, fetcher = null, concurrency = 8} = {}) {
  const k = kstOf(now); if (!k) throw new Error('BAD_NOW');
  const {get} = fetcher ?? makeFetcher({fixtures, retries: 1});
  const board = JSON.parse(await fs.readFile(path.join(rootDir, 'public/data/atlas11/view/board.json'), 'utf8'));
  const all = (board.companies ?? []).map(c => c.code).filter(c => /^\d{6}$/.test(c)).sort(), list = codes ? all.filter(c => codes.includes(c)) : all;
  const errors = [], index = {}, flows = {};
  for (const s of NOW_IDX) {
    const r = await get(NOW_URLS.index(s));
    try { index[s] = r.ok ? parseIndexNow(r.text, k.day) : null; if (!index[s]) errors.push({kind: 'index', key: s, error: r.ok ? 'INDEX_SHAPE' : r.error}); } catch (e) { index[s] = null; errors.push({kind: 'index', key: s, error: 'INDEX_PARSE ' + String(e.message).slice(0, 80)}); }
    const f = await get(NOW_URLS.flows(s));
    try { const v = f.ok ? parseIndexFlows(f.text, k.day) : {error: f.error}; if (v?.error) { flows[s] = null; errors.push({kind: 'flows', key: s, error: v.error, keys: v.keys ?? null}); } else flows[s] = v; } catch (e) { flows[s] = null; errors.push({kind: 'flows', key: s, error: 'FLOWS_PARSE ' + String(e.message).slice(0, 80)}); }
  }
  const idxToday = NOW_IDX.some(s => index[s]?.today);
  const p = {};
  await pool(list, concurrency, async c => { const r = await get(NOW_URLS.stock(c)); try { const v = r.ok ? parseStockNow(r.text, k.day) : null; if (v != null) p[c] = v; } catch { /* 모양이 다르면 그 회사는 빈칸(0 으로 채우지 않음) */ } });
  const n = Object.keys(p).length;
  if (idxToday && n < list.length * 0.8) errors.push({kind: 'prices', key: 'board', error: 'FEW_PRICES', n, of: list.length});
  return {schema: SU_NOW_SCHEMA, at: now, day: k.day, hm: k.hm, open: openAt(k, idxToday), idxToday, index, flows,
    prices: {day: k.day, board: board.asOf ?? null, n, of: list.length, p: Object.fromEntries(Object.keys(p).sort().map(c => [c, p[c]]))},
    errors, src: {index: NOW_URLS.index('{KOSPI|KOSDAQ}'), flows: NOW_URLS.flows('{KOSPI|KOSDAQ}'), stock: NOW_URLS.stock('{번호}'), unit: '사고판 돈은 억 원 · 시장 전체 · 그날 값은 잠정'}};
}

export async function writeNow(out, rootDir = process.cwd()) {
  const dir = path.join(rootDir, 'reports/atlas11/su-now'), day = path.join(dir, out.day), file = path.join(day, out.hm.replace(':', '') + '.json');
  await fs.mkdir(day, {recursive: true});
  try { await fs.access(file); return {file: null, latest: null, skipped: 'EXISTS'}; } catch { /* 없으면 씀 */ }
  const text = JSON.stringify(out, null, 1) + '\n';
  await fs.writeFile(file, text); await fs.writeFile(path.join(dir, 'latest.json'), text);
  return {file: path.relative(rootDir, file), latest: 'reports/atlas11/su-now/latest.json'};
}

if (process.argv[1] && path.resolve(process.argv[1]) === new URL(import.meta.url).pathname) {
  const rootDir = arg('--root') ?? process.cwd();
  const out = await collectNow({now: arg('--now') ?? new Date().toISOString(), rootDir, fixtures: arg('--fixtures'), codes: arg('--codes')?.split(',') ?? null});
  const w = await writeNow(out, rootDir);
  console.log(JSON.stringify({day: out.day, hm: out.hm, open: out.open, index: Object.fromEntries(NOW_IDX.map(s => [s, out.index[s] ? [out.index[s].date, out.index[s].price, out.index[s].change] : null])),
    flows: Object.fromEntries(NOW_IDX.map(s => [s, out.flows[s] ? [out.flows[s].date, out.flows[s].foreign] : null])), prices: [out.prices.n, out.prices.of], errors: out.errors.length, ...w}));
  process.exitCode = NOW_IDX.every(s => !out.index[s]) ? 2 : 0; // 지수를 하나도 못 받으면 실패(적은 것은 남김)
}
