#!/usr/bin/env node
/**
 * ATLAS 11 공부 · 20년 기록 받기(한국 · 미국) — 사장님 2026-10-06 13:01 「20년 기록을 봐봐 그리고 미국 도 보고」
 *   깃허브 자동 작업(.github/workflows/study-20y.yml · study-20y 가지에 올릴 때만 돎)에서 돈다 — 작업 공간은 네이버에 닿지 않음
 *   한국: 코스피 · 코스닥 지수 + 묶음(2026-10-05 · 1,648곳) 회사 — fchart count=6000(약 24년) · 안 되면 api.stock.naver.com 국내 일봉을 해마다
 *   미국: S&P 500(.INX) · 나스닥 종합(.IXIC) · 다우(.DJI) + 미국 판 365곳 — api.stock.naver.com 해외 일봉을 해마다 나눠 받음(한 번에 받는 줄 수 상한 대비)
 *         지수는 길 셋을 차례로 시험: 해외 지수 일봉 → 지수 시세 쪽 넘기기 → nasdaq.com 지수 기록
 *   남기는 것: 날짜 · 종가 · 거래량만(날짜는 첫날 + 달력 날 차이로 줄여 적음) · 어느 길이 됐는지(probe)
 *   (13:12 첫 판에서 알게 된 것) fchart 는 count 6000 을 줘도 3,000줄(2014-07 부터)에서 끊김 · 네이버 해외 일봉은 2010-07 부터
 *     → 한국은 네이버 siseJson(기간을 날짜로 줌)을 먼저, 미국 지수는 미 연준(FRED) 나스닥 종합(1971~) · stooq(^spx · ^dji)를 먼저,
 *       미국 회사는 stooq 를 먼저 쓰고, 안 되면 앞 판의 길(네이버)로. 두 길이 겹치는 날의 종가를 회사 몇 곳에서 맞대어 probe 에 남김
 *       S&P 500 · 다우는 stooq 가 안 되면 월스트리트저널(WSJ) 기록 내려받기를 한 번 더 시험
 *     → 둘째 판 결과는 첫 판을 덮지 않도록 다른 칸(--out reports/atlas11/study/20y/r2)에 적는다
 *   (14:07) 둘째 판이 48분 넘게 끝나지 않아(한국 siseJson 이 느린 것으로 보임) 판 365곳만 한국 넷째 판(20y/r4kr · --only kr --limit 365)으로 나란히 받음
 *     probe 에 한국도 중간중간 적고, siseJson 한 번에 걸린 시간(처음 30번)을 남김
 *   (13:3x) 둘째 판의 미국 쪽이 오래 걸려(stooq 가 늘어지는 것으로 보임) 미국만 따로 셋째 판(20y/r2us)으로 나란히 돌림:
 *     stooq 는 8초까지만 · 여섯 번 잇달아 안 되면 그만 · probe 를 중간중간 적어 끊겨도 남게
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
const BROWSER = {'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0 Safari/537.36', 'Accept-Language': 'en-US,en;q=0.9'};
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
async function get(url, headers = {}, {retries = 2, timeoutMs = 20000} = {}) {
  try { const r = await fetchWithRetry(url, {retries, backoffMs: [1000, 3000], timeoutMs, headers}); return {ok: true, status: r.status, text: r.text}; }
  catch (e) { return {ok: false, status: e.attempts?.at(-1)?.status ?? null, error: String(e.message).slice(0, 160)}; }
}
const writeProbe = () => { try { fs.writeFileSync(path.join(OUT, 'probe.json'), JSON.stringify({...probe, partialAt: new Date().toISOString()}, null, 1)); } catch {} };
// stooq 가 막히거나 늘어지면(14:3x 둘째 판이 오래 걸림) 여섯 번 잇달아 안 되면 그 뒤로는 시험하지 않음 · 한 번에 8초까지만 기다림
let stooqMiss = 0; const STOOQ_OFF_AFTER = 6;
async function pool(items, n, fn) {
  let i = 0; const out = new Array(items.length);
  await Promise.all(Array.from({length: n}, async () => { while (i < items.length) { const k = i++; out[k] = await fn(items[k], k); await sleep(80); } }));
  return out;
}
const years = Array.from({length: END_YEAR - START_YEAR + 1}, (_, k) => START_YEAR + k);

// ---------- 한국 ----------
function parseSiseJson(text) {
  const out = [];
  for (const m of String(text).matchAll(/\[\s*["'](\d{8})["']\s*,\s*([\d.]+)\s*,\s*([\d.]+)\s*,\s*([\d.]+)\s*,\s*([\d.]+)\s*,\s*([\d.]+)/g)) out.push({d: m[1], c: num(m[5]), v: num(m[6])});
  return out;
}
const TODAY = ymd(END);
const krTimes = [];
async function krSeries(symbol, isIndex) {
  const t0 = Date.now();
  const sj = await get(`https://api.finance.naver.com/siseJson.naver?symbol=${encodeURIComponent(symbol)}&requestType=1&startTime=${START_YEAR}0101&endTime=${TODAY}&timeframe=day`);
  let rows = sj.ok ? parseSiseJson(sj.text) : [];
  if (krTimes.length < 30) krTimes.push({symbol, ms: Date.now() - t0, status: sj.status ?? null, rows: rows.length});
  if (rows.length >= 50) return {how: 'siseJson', rows, fchartStatus: sj.status ?? null};
  const f = await get(`https://fchart.stock.naver.com/sise.nhn?symbol=${encodeURIComponent(symbol)}&timeframe=day&count=6000&requestType=0`);
  rows = f.ok ? parseFchart(f.text) : [];
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
    console.log('kr index', sym, probe.kr[sym]); writeProbe();
  }
  let done = 0, fails = 0; const hows = {};
  await pool(codes, 4, async code => {
    const s = await krSeries(code, false); const p = pack(s.rows);
    if (p) { out.stocks[code] = {name: B.stocks[code]?.list?.name ?? code, industryCode: (() => { try { return JSON.parse(B.stocks[code].integration.text).industryCode ?? null; } catch { return null; } })(), ...p}; } else fails++;
    hows[s.how] = (hows[s.how] ?? 0) + 1;
    if (++done % 50 === 0) { console.log('kr stocks', done, '/', codes.length, 'fails', fails, hows); probe.kr.progress = {done, fails, hows: {...hows}, at: new Date().toISOString(), times: krTimes.slice(0, 30)}; writeProbe(); }
  });
  probe.kr.overlap = [];
  for (const code of ['005930', '000660', '035420', '005380', '051910']) {
    const st = out.stocks[code]; if (!st) continue;
    const f = await get(`https://fchart.stock.naver.com/sise.nhn?symbol=${code}&timeframe=day&count=3000&requestType=0`);
    const fv = f.ok ? new Map(parseFchart(f.text).map(x => [x.d, x.c])) : new Map();
    let t = Date.UTC(+st.d0.slice(0, 4), +st.d0.slice(4, 6) - 1, +st.d0.slice(6, 8)); const ratios = [];
    for (let i = 0; i < st.c.length; i++) { if (i) t += st.dd[i - 1] * 86400000; const dd = new Date(t).toISOString().slice(0, 10).replace(/-/g, ''); if (fv.has(dd)) ratios.push(st.c[i] / fv.get(dd)); }
    ratios.sort((a, b) => a - b);
    probe.kr.overlap.push({code, n: ratios.length, min: ratios[0] ?? null, median: ratios[Math.floor(ratios.length / 2)] ?? null, max: ratios.at(-1) ?? null});
  }
  probe.kr.stocks = {asked: codes.length, got: Object.keys(out.stocks).length, fails, hows,
    boardGot: [...inBoard].filter(c => out.stocks[c]).length, startedBefore2007: Object.values(out.stocks).filter(s => s.d0 < '20070101').length};
  fs.writeFileSync(path.join(OUT, 'kr.json.gz'), zlib.gzipSync(JSON.stringify(out)));
  console.log('kr done', probe.kr.stocks);
}

// ---------- 미국 ----------
const NAVER_PAGE = (code, page) => `https://api.stock.naver.com/index/${encodeURIComponent(code)}/price?page=${page}&pageSize=60`;
function parseCsv(text, dateCol = 0, closeCol = 4, volCol = 5) {
  const out = []; const lines = String(text).trim().split(/\r?\n/);
  for (const ln of lines.slice(1)) { const f = ln.split(','); if (!/^\d{4}-\d{2}-\d{2}$/.test(f[dateCol] ?? '')) continue; const c = num(f[closeCol]); if (!(c > 0)) continue; out.push({d: f[dateCol].replace(/-/g, ''), c, v: volCol == null ? NaN : num(f[volCol])}); }
  return out;
}
const STOOQ = (sym, host = 'stooq.com') => `https://${host}/q/d/l/?s=${encodeURIComponent(sym)}&d1=${START_YEAR}0101&d2=${TODAY}&i=d`;
function parseWsj(text) {  // Date, Open, High, Low, Close · 날짜는 MM/DD/YY
  const out = [];
  for (const ln of String(text).trim().split(/\r?\n/).slice(1)) { const f = ln.split(',').map(x => x.trim()); const m = /^(\d{2})\/(\d{2})\/(\d{2})$/.exec(f[0] ?? ''); if (!m) continue; const c = num(f[4]); if (c > 0) out.push({d: `20${m[3]}${m[1]}${m[2]}`, c, v: NaN}); }
  return out;
}
async function usIndex(code, nasdaqSym) {
  const tries = [];
  const stq = {'.INX': '^spx', '.IXIC': '^ndq', '.DJI': '^dji'}[code];
  if (code === '.IXIC') {  // 미 연준(FRED) 나스닥 종합 — 1971년부터 날마다
    const r = await get('https://fred.stlouisfed.org/graph/fredgraph.csv?id=NASDAQCOM', {...BROWSER, Accept: 'text/csv,*/*'});
    const rows = r.ok ? parseCsv(r.text, 0, 1, null).filter(x => x.d >= `${START_YEAR}0101`) : [];
    tries.push({way: 'fred-NASDAQCOM', status: r.status, total: rows.length});
    if (rows.length >= 4000) return {how: 'fred-NASDAQCOM', rows, tries};
  }
  if (stq) {
    for (const host of ['stooq.com', 'stooq.pl']) {
      const r = await get(STOOQ(stq, host), {...BROWSER, Accept: 'text/csv,*/*'}, {retries: 0, timeoutMs: 8000});
      const rows = r.ok ? parseCsv(r.text) : [];
      tries.push({way: `stooq-${stq}@${host}`, status: r.status, total: rows.length, head: r.ok ? r.text.slice(0, 80) : null});
      if (rows.length >= 4000) return {how: 'stooq-' + stq, rows, tries};
    }
  }
  const wsj = {'.INX': 'SPX', '.IXIC': 'COMP', '.DJI': 'DJIA'}[code];
  if (wsj) {
    const r = await get(`https://www.wsj.com/market-data/quotes/index/${wsj}/historical-prices/download?MOD_VIEW=page&num_rows=9000&range_days=9000&startDate=01/01/${START_YEAR}&endDate=${TODAY.slice(4, 6)}/${TODAY.slice(6, 8)}/${TODAY.slice(0, 4)}`, {...BROWSER, Accept: 'text/csv,*/*'});
    const rows = r.ok ? parseWsj(r.text) : [];
    tries.push({way: 'wsj-' + wsj, status: r.status, total: rows.length, head: r.ok ? r.text.slice(0, 80) : null});
    if (rows.length >= 4000) return {how: 'wsj-' + wsj, rows, tries};
  }
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
const stooqSym = code => code.toLowerCase().replace(/\./g, '-') + '.us';
async function usStock(reuters, code) {
  let st = {ok: false, status: 'skipped'}, sr = [];
  if (stooqMiss < STOOQ_OFF_AFTER) {
    st = await get(STOOQ(stooqSym(code)), {...BROWSER, Accept: 'text/csv,*/*'}, {retries: 0, timeoutMs: 8000});
    sr = st.ok ? parseCsv(st.text) : [];
    stooqMiss = sr.length >= 250 ? 0 : stooqMiss + 1;
  }
  if (sr.length >= 250) return {rows: sr, okYears: null, firstStatus: st.status, how: 'stooq'};
  const rows = []; let okYears = 0, firstStatus = null;
  for (const y of years) {
    const r = await get(`https://api.stock.naver.com/chart/foreign/item/${encodeURIComponent(reuters)}/day?startDateTime=${y}01010000&endDateTime=${y}12312359`);
    if (firstStatus === null) firstStatus = r.status;
    if (r.ok) { const p = parseDayJson(r.text); if (p.length) okYears++; rows.push(...p); }
  }
  return {rows, okYears, firstStatus, how: 'naver-years', stooqStatus: st.status, stooqHead: st.ok ? String(st.text).slice(0, 60) : null};
}
async function runUs() {
  const input = JSON.parse(fs.readFileSync('public/data/atlas11/us/input.json', 'utf8'));
  const board = JSON.parse(fs.readFileSync('public/data/atlas11/us/view/board.json', 'utf8'));
  const reutersOf = new Map(input.assets.map(a => [a.code, a.reuters]));
  let list = board.companies.map(c => ({code: c.code, name: c.name, reuters: reutersOf.get(c.code), industry: input.assets.find(a => a.code === c.code)?.industryCode ?? null}));
  if (LIMIT) list = list.slice(0, LIMIT);
  const out = {market: 'us', fetchedAt: new Date().toISOString(), indices: {}, stocks: {}, board: list.map(x => x.code), groups: board.groups.map(g => ({id: g.id, label: g.label, codes: g.codes}))};
  for (const [code, nas] of [['.IXIC', 'COMP'], ['.INX', 'SPX'], ['.DJI', 'INDU']]) {
    const s = await usIndex(code, nas); out.indices[code] = pack(s.rows);
    probe.us[code] = {how: s.how, rows: s.rows.length, first: out.indices[code]?.d0 ?? null, tries: s.tries};
    console.log('us index', code, probe.us[code].how, probe.us[code].rows, probe.us[code].first); writeProbe();
  }
  let done = 0, fails = 0; const hows = {}; const stooqFail = [];
  await pool(list, 2, async x => {  // stooq 는 천천히(하루 받기 한도)
    if (!x.reuters) { fails++; return; }
    const s = await usStock(x.reuters, x.code); const p = pack(s.rows);
    hows[s.how] = (hows[s.how] ?? 0) + 1; if (s.how !== 'stooq' && stooqFail.length < 8) stooqFail.push({code: x.code, status: s.stooqStatus, head: s.stooqHead});
    if (p) out.stocks[x.code] = {name: x.name, reuters: x.reuters, industryCode: x.industry, src: s.how, ...p}; else { fails++; probe.errors.push({us: x.code, firstStatus: s.firstStatus}); }
    if (++done % 50 === 0) { console.log('us stocks', done, '/', list.length, 'fails', fails, hows); probe.us.progress = {done, fails, hows: {...hows}, stooqFail: stooqFail.slice(0, 8)}; writeProbe(); }
    await sleep(250);
  });
  probe.us.stocks = {asked: list.length, got: Object.keys(out.stocks).length, fails, hows, stooqFail, startedBefore2007: Object.values(out.stocks).filter(s => s.d0 < '20070101').length};
  // 두 길 맞대기(미국): stooq 로 받은 회사 다섯의 2024년 종가를 네이버 해외 일봉과 견줌(나눗셈 비율)
  probe.us.overlap = [];
  for (const code of ['AAPL', 'NVDA', 'MSFT', 'JPM', 'KO']) {
    const st = out.stocks[code]; const ru = reutersOf.get(code); if (!st || st.src !== 'stooq' || !ru) continue;
    const r = await get(`https://api.stock.naver.com/chart/foreign/item/${encodeURIComponent(ru)}/day?startDateTime=20240101 0000&endDateTime=20241231 2359`.replace(/ /g, ''));
    const nv = r.ok ? new Map(parseDayJson(r.text).map(x => [x.d, x.c])) : new Map();
    let t = Date.UTC(+st.d0.slice(0, 4), +st.d0.slice(4, 6) - 1, +st.d0.slice(6, 8)); const ratios = [];
    for (let i = 0; i < st.c.length; i++) { if (i) t += st.dd[i - 1] * 86400000; const dd = new Date(t).toISOString().slice(0, 10).replace(/-/g, ''); if (nv.has(dd)) ratios.push(st.c[i] / nv.get(dd)); }
    ratios.sort((a, b) => a - b);
    probe.us.overlap.push({code, n: ratios.length, min: ratios[0] ?? null, median: ratios[Math.floor(ratios.length / 2)] ?? null, max: ratios.at(-1) ?? null});
  }
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
