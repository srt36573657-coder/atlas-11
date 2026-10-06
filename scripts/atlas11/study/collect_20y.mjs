#!/usr/bin/env node
/**
 * ATLAS 11 공부 · 20년 기록 받기(한국 · 미국) — 사장님 2026-10-06 13:01 「20년 기록을 봐봐 그리고 미국 도 보고」
 *   깃허브 자동 작업(.github/workflows/study-20y.yml · study-20y 가지에 올릴 때만 돎)에서 돈다 — 작업 공간은 네이버에 닿지 않음
 *   한국: 코스피 · 코스닥 지수 + 묶음(2026-10-05 · 1,648곳) 회사 — fchart count=6000(약 24년) · 안 되면 api.stock.naver.com 국내 일봉을 해마다
 *   미국: S&P 500(.INX) · 나스닥 종합(.IXIC) · 다우(.DJI) + 미국 판 365곳 — api.stock.naver.com 해외 일봉을 해마다 나눠 받음(한 번에 받는 줄 수 상한 대비)
 *         지수는 길 셋을 차례로 시험: 해외 지수 일봉 → 지수 시세 쪽 넘기기 → nasdaq.com 지수 기록
 *   남기는 것: 날짜 · 종가 · 거래량만(날짜는 첫날 + 달력 날 차이로 줄여 적음) · 어느 길이 됐는지(probe)
 *   결과: <out>/kr.json.gz · <out>/us.json.gz · <out>/probe.json — 사이트 · main · 매일 작업 파일은 건드리지 않는다
 *   쓰는 법: node scripts/atlas11/study/collect_20y.mjs --out reports/atlas11/study/20y [--only kr|us] [--limit N]
 */
import fs from 'node:fs';
import zlib from 'node:zlib';
import path from 'node:path';
import {fetchWithRetry} from '../collect_naver.mjs';

const arg = (k, d = null) => { const i = process.argv.indexOf(k); return i > 0 ? process.argv[i + 1] : d; };
const OUT = arg('--out', 'reports/atlas11/study/20y'), ONLY = arg('--only'), LIMIT = Number(arg('--limit', '0'));
const START_YEAR = 2004, END = new Date(), END_YEAR = END.getUTCFullYear();
const ymd = d => d.toISOString().slice(0, 10).replace(/-/g, '');
const sleep = ms => new Promise(r => setTimeout(r, ms));
const num = v => (typeof v === 'number' ? v : Number(String(v ?? '').replace(/,/g, '').trim()));
fs.mkdirSync(OUT, {recursive: true});
const probe = {startedAt: new Date().toISOString(), kr: {}, us: {}, errors: []};

/** [{d:'YYYYMMDD', c, v}] → 줄인 꼴 {d0, dd:[달력 날 차이], c:[], v:[]} */
function pack(rows) {
  const r = [...new Map(rows.filter(x => /^\d{8}$/.test(x.d) && x.c > 0).map(x => [x.d, x])).values()].sort((a, b) => a.d.localeCompare(b.d));
  if (!r.length) return null;
  const toT = s => Date.UTC(+s.slice(0, 4), +s.slice(4, 6) - 1, +s.slice(6, 8));
  const dd = []; for (let i = 1; i < r.length; i++) dd.push(Math.round((toT(r[i].d) - toT(r[i - 1].d)) / 86400000));
  return {d0: r[0].d, n: r.length, dd, c: r.map(x => x.c), v: r.map(x => (Number.isFinite(x.v) ? x.v : null))};
}
function parseFchart(text) {
  const out = [];
  for (const m of String(text).matchAll(/<item\s+data="([^"]*)"\s*\/?>/g)) { const f = m[1].split('|'); if (f.length >= 5) out.push({d: f[0], c: num(f[4]), v: num(f[5])}); }
  return out;
}
function parseDayJson(text) {
  let j; try { j = JSON.parse(text); } catch { return []; }
  const arr = Array.isArray(j) ? j : (Array.isArray(j?.priceInfos) ? j.priceInfos : []);
  return arr.map(x => ({d: String(x.localDate ?? x.localTradedAt ?? '').replace(/-/g, '').slice(0, 8), c: num(x.closePrice), v: num(x.accumulatedTradingVolume)}));
}
async function get(url, headers = {}) {
  try { const r = await fetchWithRetry(url, {retries: 2, backoffMs: [1000, 3000], timeoutMs: 20000, headers}); return {ok: true, status: r.status, text: r.text}; }
  catch (e) { return {ok: false, status: e.attempts?.at(-1)?.status ?? null, error: String(e.message).slice(0, 160)}; }
}
async function pool(items, n, fn) {
  let i = 0; const out = new Array(items.length);
  await Promise.all(Array.from({length: n}, async () => { while (i < items.length) { const k = i++; out[k] = await fn(items[k], k); await sleep(80); } }));
  return out;
}
const years = Array.from({length: END_YEAR - START_YEAR + 1}, (_, k) => START_YEAR + k);

// ---------- 한국 ----------
async function krSeries(symbol, isIndex) {
  const f = await get(`https://fchart.stock.naver.com/sise.nhn?symbol=${encodeURIComponent(symbol)}&timeframe=day&count=6000&requestType=0`);
  let rows = f.ok ? parseFchart(f.text) : [];
  let how = 'fchart';
  if (rows.length < 50) {
    how = 'api-domestic-years'; rows = [];
    for (const y of years) {
      const kind = isIndex ? 'index' : 'item';
      const r = await get(`https://api.stock.naver.com/chart/domestic/${kind}/${encodeURIComponent(symbol)}/day?startDateTime=${y}01010000&endDateTime=${y}12312359`);
      if (r.ok) rows.push(...parseDayJson(r.text));
    }
  }
  return {how, rows, fchartStatus: f.status ?? null};
}
async function runKr() {
  const B = JSON.parse(zlib.gunzipSync(fs.readFileSync('reports/atlas11/universe/2026-10-05-0940/bundle.json.gz')));
  const board = JSON.parse(fs.readFileSync('public/data/atlas11/view/board.json', 'utf8'));
  const inBoard = new Set(board.companies.map(c => c.code));
  let codes = Object.keys(B.stocks).sort((a, b) => (inBoard.has(b) - inBoard.has(a)) || a.localeCompare(b)); // 판 365곳 먼저
  if (LIMIT) codes = codes.slice(0, LIMIT);
  const out = {market: 'kr', fetchedAt: new Date().toISOString(), indices: {}, stocks: {}, board: [...inBoard], groups: board.groups.map(g => ({id: g.id, codes: g.codes}))};
  for (const sym of ['KOSPI', 'KOSDAQ']) {
    const s = await krSeries(sym, true); out.indices[sym] = pack(s.rows); probe.kr[sym] = {how: s.how, rows: s.rows.length, first: out.indices[sym]?.d0 ?? null, fchartStatus: s.fchartStatus};
    console.log('kr index', sym, probe.kr[sym]);
  }
  let done = 0, fails = 0; const hows = {};
  await pool(codes, 4, async code => {
    const s = await krSeries(code, false); const p = pack(s.rows);
    if (p) { out.stocks[code] = {name: B.stocks[code]?.list?.name ?? code, industryCode: (() => { try { return JSON.parse(B.stocks[code].integration.text).industryCode ?? null; } catch { return null; } })(), ...p}; } else fails++;
    hows[s.how] = (hows[s.how] ?? 0) + 1;
    if (++done % 200 === 0) console.log('kr stocks', done, '/', codes.length, 'fails', fails, hows);
  });
  probe.kr.stocks = {asked: codes.length, got: Object.keys(out.stocks).length, fails, hows,
    boardGot: [...inBoard].filter(c => out.stocks[c]).length, startedBefore2007: Object.values(out.stocks).filter(s => s.d0 < '20070101').length};
  fs.writeFileSync(path.join(OUT, 'kr.json.gz'), zlib.gzipSync(JSON.stringify(out)));
  console.log('kr done', probe.kr.stocks);
}

// ---------- 미국 ----------
const NAVER_PAGE = (code, page) => `https://api.stock.naver.com/index/${encodeURIComponent(code)}/price?page=${page}&pageSize=60`;
async function usIndex(code, nasdaqSym) {
  const tries = [];
  // 1) 해외 지수 일봉(해마다)
  let rows = [];
  for (const y of years) {
    const r = await get(`https://api.stock.naver.com/chart/foreign/index/${encodeURIComponent(code)}/day?startDateTime=${y}01010000&endDateTime=${y}12312359`);
    if (r.ok) rows.push(...parseDayJson(r.text));
    if (y === START_YEAR) tries.push({way: 'chart-foreign-index-years', status: r.status, rows: rows.length});
  }
  if (rows.length >= 1000) return {how: 'chart-foreign-index-years', rows, tries};
  tries.push({way: 'chart-foreign-index-years', total: rows.length});
  // 2) 지수 시세 쪽 넘기기(60줄씩)
  rows = [];
  for (let page = 1; page <= 120; page++) {
    const r = await get(NAVER_PAGE(code, page)); if (!r.ok) { tries.push({way: 'index-price-pages', page, status: r.status}); break; }
    let j; try { j = JSON.parse(r.text); } catch { break; }
    if (!Array.isArray(j) || !j.length) break;
    for (const x of j) rows.push({d: String(x.localTradedAt ?? '').slice(0, 10).replace(/-/g, ''), c: num(x.closePrice), v: NaN});
    if (rows.at(-1).d < `${START_YEAR}0101`) break;
    await sleep(60);
  }
  if (rows.length >= 1000) return {how: 'index-price-pages', rows, tries};
  tries.push({way: 'index-price-pages', total: rows.length});
  // 3) nasdaq.com 지수 기록
  const r = await get(`https://api.nasdaq.com/api/quote/${nasdaqSym}/historical?assetclass=index&fromdate=${START_YEAR}-01-01&limit=9999`, {Accept: 'application/json, text/plain, */*', Origin: 'https://www.nasdaq.com', Referer: 'https://www.nasdaq.com/'});
  rows = [];
  if (r.ok) { try { const j = JSON.parse(r.text); for (const x of j?.data?.tradesTable?.rows ?? []) { const [m, d, y] = String(x.date).split('/'); rows.push({d: `${y}${m}${d}`, c: num(String(x.close).replace('$', '')), v: NaN}); } } catch {} }
  tries.push({way: 'nasdaq-index', status: r.status, total: rows.length});
  return {how: rows.length ? 'nasdaq-index' : 'none', rows, tries};
}
async function usStock(reuters) {
  const rows = []; let okYears = 0, firstStatus = null;
  for (const y of years) {
    const r = await get(`https://api.stock.naver.com/chart/foreign/item/${encodeURIComponent(reuters)}/day?startDateTime=${y}01010000&endDateTime=${y}12312359`);
    if (firstStatus === null) firstStatus = r.status;
    if (r.ok) { const p = parseDayJson(r.text); if (p.length) okYears++; rows.push(...p); }
  }
  return {rows, okYears, firstStatus};
}
async function runUs() {
  const input = JSON.parse(fs.readFileSync('public/data/atlas11/us/input.json', 'utf8'));
  const board = JSON.parse(fs.readFileSync('public/data/atlas11/us/view/board.json', 'utf8'));
  const reutersOf = new Map(input.assets.map(a => [a.code, a.reuters]));
  let list = board.companies.map(c => ({code: c.code, name: c.name, reuters: reutersOf.get(c.code), industry: input.assets.find(a => a.code === c.code)?.industryCode ?? null}));
  if (LIMIT) list = list.slice(0, LIMIT);
  const out = {market: 'us', fetchedAt: new Date().toISOString(), indices: {}, stocks: {}, board: list.map(x => x.code), groups: board.groups.map(g => ({id: g.id, label: g.label, codes: g.codes}))};
  for (const [code, nas] of [['.INX', 'SPX'], ['.IXIC', 'COMP'], ['.DJI', 'INDU']]) {
    const s = await usIndex(code, nas); out.indices[code] = pack(s.rows);
    probe.us[code] = {how: s.how, rows: s.rows.length, first: out.indices[code]?.d0 ?? null, tries: s.tries};
    console.log('us index', code, probe.us[code].how, probe.us[code].rows, probe.us[code].first);
  }
  let done = 0, fails = 0;
  await pool(list, 6, async x => {
    if (!x.reuters) { fails++; return; }
    const s = await usStock(x.reuters); const p = pack(s.rows);
    if (p) out.stocks[x.code] = {name: x.name, reuters: x.reuters, industryCode: x.industry, ...p}; else { fails++; probe.errors.push({us: x.code, firstStatus: s.firstStatus}); }
    if (++done % 50 === 0) console.log('us stocks', done, '/', list.length, 'fails', fails);
  });
  probe.us.stocks = {asked: list.length, got: Object.keys(out.stocks).length, fails, startedBefore2007: Object.values(out.stocks).filter(s => s.d0 < '20070101').length};
  fs.writeFileSync(path.join(OUT, 'us.json.gz'), zlib.gzipSync(JSON.stringify(out)));
  console.log('us done', probe.us.stocks);
}

try {
  if (ONLY !== 'us') await runKr();
  if (ONLY !== 'kr') await runUs();
} catch (e) { probe.errors.push({fatal: String(e?.stack ?? e).slice(0, 600)}); console.error(e); }
probe.finishedAt = new Date().toISOString();
fs.writeFileSync(path.join(OUT, 'probe.json'), JSON.stringify(probe, null, 1));
console.log(JSON.stringify({kr: probe.kr.stocks, us: probe.us.stocks, errors: probe.errors.length}));
