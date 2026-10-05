/**
 * ATLAS 미국 판 · 자료 받기(깃허브 실행기에서 · 「미국 주식 자료 받기」 단추) — 2026-10-05 18:02 사장님 「이제는 미국 주식도 같은 개념으로 365개를 만들어라」
 *   --mode select : 365곳을 새로 고른다(처음 한 번 · 또는 다시 고를 때)
 *       ① 시가총액 순 목록(뉴욕증권거래소 · 나스닥 · NYSE American) → 상위 1,500곳
 *       ② 1,500곳 결산(연간 · 확정 칸만) → 우량 네 조건   ③ 1,500곳 일봉(지난 약 14달) → 가격 이력
 *       ④ 365곳 고르기(lib/atlas11/us/universe.mjs selectUs365)
 *   --mode update : 지금 365곳 그대로 — 일봉만 새로(분할 등으로 바뀐 옛 종가도 함께 바로잡힘)
 *   두 경우 모두 ⑤ 365곳 한글 기사 · 지수 셋(S&P 500 · 나스닥 종합 · 다우존스)
 *   --mode auto(처음 값) : 미국 판 입력이 없으면 select, 있으면 update
 *   쓰는 곳: reports/atlas11/us/runs/<시각>/(받은 원문 견본 · 후보 · 고른 결과 · 입력 사본 — 덮어쓰지 않음) · public/data/atlas11/us/{input.json, context.json}
 *   한국 판 파일(public/data/input.json · public/data/atlas11/view · reports/atlas11/operations · context …)은 읽지도 쓰지도 않는다.
 *   장중 값은 종가로 쓰지 않는다 — 뉴욕 17:00 이 지나지 않은 날의 봉은 버린다(lib/atlas11/us/place.mjs usCloseFinal)
 */
import fs from 'node:fs/promises';
import path from 'node:path';
import zlib from 'node:zlib';
import {createHash} from 'node:crypto';
import {NAVER_US, parseList, parseDay, parseFinance, metricsOf, parseUsNews, parseIndex} from '../../../lib/atlas11/us/naver.mjs';
import {US365, selectUs365, usHowLines, usIsFinancial} from '../../../lib/atlas11/us/universe.mjs';
import {US_INDEX, usCloseFinal, newYork} from '../../../lib/atlas11/us/place.mjs';
import {NASDAQ, parseNasdaqFin, nasdaqMetrics, parseScreener} from '../../../lib/atlas11/us/nasdaq.mjs';

const root = process.cwd();
const arg = (name, d = null) => { const i = process.argv.indexOf(name); return i < 0 ? d : process.argv[i + 1]; };
export const US_DATA = 'public/data/atlas11/us';
const now = new Date(), stamp = now.toISOString().replace(/[:.]/g, '-').slice(0, 19);
const RUN = path.join('reports/atlas11/us/runs', stamp);
const sleep = ms => new Promise(r => setTimeout(r, ms));
const PAUSE = Number(process.env.ATLAS_US_PAUSE ?? 60); // 요청 사이 쉬는 틈(ms) — 시험에서는 0
const ymd = d => d.toISOString().slice(0, 10).replace(/-/g, '');
const sha = x => createHash('sha256').update(x).digest('hex');
const log = {startedAt: now.toISOString(), steps: [], samples: {}, failures: {}};
const step = (name, info) => { const row = {name, at: new Date().toISOString(), ...info}; log.steps.push(row); console.log(`[${row.at.slice(11, 19)}] ${name} ${JSON.stringify(info)}`); };

/** 받기 — 429 · 5xx · 끊김은 쉬었다가 다시(3번까지) · 원문 견본은 종류마다 첫 성공 하나 · 첫 실패 하나만 남긴다 */
async function get(url, kind, {tries = 3, headers = NAVER_US.headers} = {}) {
  let last = null;
  for (let k = 0; k < tries; k++) {
    const t = Date.now();
    try {
      const r = await fetch(url, {headers, signal: AbortSignal.timeout(20000)});
      const text = await r.text();
      if (r.ok) {
        let json = null; try { json = JSON.parse(text); } catch {}
        if (json != null) { if (!log.samples[kind]) { log.samples[kind] = {url, status: r.status, ms: Date.now() - t}; await fs.writeFile(path.join(root, RUN, 'samples', kind + '.txt'), text.slice(0, 30000)); } return {ok: true, status: r.status, json}; }
        last = {status: r.status, err: 'NOT_JSON', head: text.slice(0, 200)};
      } else last = {status: r.status, head: text.slice(0, 200)};
      if (r.status !== 429 && r.status < 500) break;
    } catch (e) { last = {status: 0, err: String(e?.cause?.code ?? e?.name ?? e).slice(0, 120)}; }
    await sleep(800 * (k + 1) ** 2);
  }
  log.failures[kind] = (log.failures[kind] ?? 0) + 1;
  if (!log.samples[kind + '_fail']) { log.samples[kind + '_fail'] = {url, ...last}; }
  return {ok: false, ...last};
}
/** 여러 길 가운데 열리는 길 — 종류마다 한 번 열린 길을 먼저 · good(json) 이 참인 응답만(빈 목록이면 다음 길) */
const way = {};
async function getAny(urls, kind, good = () => true) {
  const order = [...new Set([...(way[kind] != null ? [way[kind]] : []), ...urls.keys()])];
  let last = null;
  for (const i of order) {
    const r = await get(urls[i], i ? `${kind}_way${i}` : kind);
    let ok = false; if (r.ok) try { ok = !!good(r.json); } catch {}
    if (ok) { if (way[kind] !== i) { way[kind] = i; step('길', {kind, way: i, url: urls[i].replace(/\?.*$/, '')}); } return {...r, url: urls[i]}; }
    last = r.ok ? {status: r.status, err: 'EMPTY'} : r;
  }
  return {ok: false, ...last};
}
/** 동시에 n 개씩 */
async function pool(items, n, fn) {
  const out = new Array(items.length); let i = 0;
  await Promise.all(Array.from({length: Math.min(n, items.length)}, async () => { while (i < items.length) { const k = i++; out[k] = await fn(items[k], k); if (PAUSE) await sleep(PAUSE); } }));
  return out;
}
const readJSON = async (file, otherwise) => { try { return JSON.parse(await fs.readFile(path.join(root, file), 'utf8')); } catch (e) { if (otherwise !== undefined) return otherwise; throw e; } };
const writeJSON = async (file, value, pretty = false) => { await fs.mkdir(path.dirname(path.join(root, file)), {recursive: true}); await fs.writeFile(path.join(root, file), JSON.stringify(value, null, pretty ? 1 : 0)); };
const writeGz = async (file, value) => { const gz = zlib.gzipSync(Buffer.from(JSON.stringify(value))); await fs.mkdir(path.dirname(path.join(root, file)), {recursive: true}); await fs.writeFile(path.join(root, file), gz); return {file, sha256: sha(gz), bytes: gz.length}; };

/** ① 시가총액 순 목록 — 거래소마다 쪽을 넘기며 · 보통주만(ETF 따로) · 합쳐서 큰 순 */
async function universeList(limit = US365.poolTop) {
  const perEx = {NYSE: 1100, NASDAQ: 1100, AMEX: 150}, all = new Map(), seen = {};
  for (const ex of NAVER_US.exchanges) {
    seen[ex] = 0;
    for (let page = 1; page <= 15 && seen[ex] < perEx[ex]; page++) {
      const r = await getAny(NAVER_US.ways.list(ex, page, 100), 'list', j => parseList(j, ex).items.length > 0);
      if (!r.ok) break;
      const {items} = parseList(r.json, ex);
      for (const x of items) { seen[ex]++; const had = all.get(x.code); if (!had || (x.capUsd ?? 0) > (had.capUsd ?? 0)) all.set(x.code, x); }
      if (items.length < 100) break;
      await sleep(150);
    }
  }
  const stocks = [...all.values()].filter(x => !x.endType || /stock/i.test(x.endType)).filter(x => x.capUsd > 0)
    .sort((a, b) => b.capUsd - a.capUsd || a.code.localeCompare(b.code)).slice(0, limit).map((x, i) => ({...x, capRank: i + 1}));
  step('목록', {seen, merged: all.size, stocks: stocks.length, top5: stocks.slice(0, 5).map(x => `${x.name}(${x.code}) ${x.industry}`)});
  return stocks;
}

/** 일봉 — 지난 430일(약 296거래일) · 장중 값은 버림 · 받은 시각·주소는 마지막 날에만 */
async function history(c, from, to) {
  const r = await getAny(NAVER_US.ways.day(c.reuters, from, to), 'day', j => parseDay(j).length > 0), url = r.url ?? NAVER_US.day(c.reuters, from, to);
  if (!r.ok) return {rows: [], url, ok: false, status: r.status};
  const rows = parseDay(r.json).filter(x => usCloseFinal(x.date, now));
  if (rows.length) Object.assign(rows.at(-1), {closeBasis: 'NAVER_WORLD_DAY', sourceUrl: url, observedAt: new Date().toISOString()});
  return {rows, url, ok: true};
}
/** 가격 이력 검사 — 253개 이상 · 마지막 날이 모두의 마지막 날에서 7일 안(거래 멈춘 회사 빼기) */
const historyCheck = (rows, latest) => ({rows: rows.length, last: rows.at(-1)?.date ?? null, ok: rows.length >= US365.minHistoryRows && !!latest && !!rows.at(-1) && (Date.parse(latest) - Date.parse(rows.at(-1).date)) <= 7 * 864e5});

async function selectMode() {
  const list = await universeList();
  if (list.length < 500) throw Error(`US_LIST_SHORT ${list.length} — 시가총액 목록을 충분히 받지 못함(reports 의 samples 확인)`);
  // ①-2 나라 — 나스닥 종목표 한 번(전 종목) · 미국 회사만 고를 때 씀(못 받으면 나라를 모르는 채로 · 빼지 않음)
  const sc = await get(NASDAQ.screener, 'screener', {headers: NASDAQ.headers});
  const screen = sc.ok ? parseScreener(sc.json) : new Map();
  step('나라', {screener: screen.size, matched: list.filter(c => screen.has(c.code)).length, notUS: list.filter(c => (screen.get(c.code)?.country ?? '') && screen.get(c.code).country !== 'United States').length});
  // ② 결산 — 나스닥 결산표(영업이익 · 순이익 · 부채 · 자기자본)를 먼저 · 안 되면 네이버 결산(EBIT · PBR÷PER · 부채비율 없음)
  const fins = await pool(list, 5, async c => {
    const r = await get(NASDAQ.fin(c.code), 'nasdaq_fin', {headers: NASDAQ.headers});
    if (r.ok) { try { const m = nasdaqMetrics(parseNasdaqFin(r.json)); if (m && (m.net != null || m.op != null)) return {...m, source: 'nasdaq'}; } catch {} }
    const n = await getAny(NAVER_US.ways.finance(c.reuters), 'finance', j => parseFinance(j).cols.length > 0); if (!n.ok) return null;
    try { const m = metricsOf(parseFinance(n.json)); return m ? {...m, source: 'naver'} : null; } catch { return null; }
  });
  const withM = fins.filter(Boolean).length, bySrc = fins.reduce((t, m) => (m && (t[m.source] = (t[m.source] ?? 0) + 1), t), {});
  step('결산', {asked: list.length, got: withM, source: bySrc, withDebt: fins.filter(m => m?.debt != null).length, withRoe: fins.filter(m => m?.roe != null).length});
  // ③ 일봉
  const to = ymd(now), from = ymd(new Date(now.getTime() - 430 * 864e5));
  const hist = await pool(list, 6, c => history(c, from, to));
  const latest = hist.map(h => h.rows.at(-1)?.date).filter(Boolean).sort().at(-1) ?? null;
  step('일봉', {asked: list.length, got: hist.filter(h => h.rows.length).length, latest, rows: hist.map(h => h.rows.length).sort((a, b) => b - a)[Math.floor(list.length / 2)] ?? 0});
  const candidates = list.map((c, i) => {
    const m = fins[i], fin = usIsFinancial(c);
    return {...c, country: screen.get(c.code)?.country ?? null, financial: fin, metrics: m ? {fiscalYear: m.fiscalYear, prevYear: m.prevYear, revenue: m.revenue, op: m.op, opPrev: m.opPrev, net: m.net, netPrev: m.netPrev, roe: m.roe, debt: m.debt, equityNeg: m.equityNeg ?? false, source: m.source, basis: m.basis ?? null} : null, history: historyCheck(hist[i].rows, latest)};
  });
  // ④ 고르기
  const sel = selectUs365(candidates);
  step('고르기', {ok: sel.ok, picked: sel.picked.length, industries: sel.counts.industries, kinds: sel.counts.kinds, pool: sel.counts.pool, filled: sel.counts.industriesFilled, failTop: Object.entries(sel.counts.failReasons).slice(0, 6)});
  const rows = new Map(list.map((c, i) => [c.code, hist[i].rows]));
  // 1,500곳 일봉도 남긴다(날짜 · 종가만) — 고르는 규칙을 고칠 때 다시 받지 않고 이 기록으로 다시 고를 수 있게(기록은 덮어쓰지 않음)
  await writeGz(path.join(RUN, 'history.json.gz'), {schema: 'atlas11-us-history-1', at: now.toISOString(), from, to, basis: 'NAVER_WORLD_DAY · 뉴욕 17:00 지나 굳은 종가만',
    rows: Object.fromEntries(list.map((c, i) => [c.code, hist[i].rows.map(r => [r.date, r.close])])), urls: Object.fromEntries(list.map((c, i) => [c.code, hist[i].url]))});
  await writeGz(path.join(RUN, 'candidates.json.gz'), {schema: 'atlas11-us-candidates-1', at: now.toISOString(), rules: {...US365, trendGroups: US365.trendGroups.map(g => ({id: g.id, label: g.label, words: String(g.words)}))},
    candidates: sel.checked.map(c => ({code: c.code, reuters: c.reuters, name: c.name, nameEn: c.nameEn, exchange: c.exchange, country: c.country ?? null, industry: c.industry, industryCode: c.industryCode, capUsd: c.capUsd, capRank: c.capRank, financial: c.financial, metrics: c.metrics, history: c.history, fails: c.fails, sameCompanyOf: c.sameCompanyOf ?? null, trend: c.trend ? c.trend.id : null}))});
  await writeJSON(path.join(RUN, 'proposal.json'), {schema: 'atlas11-us-proposal-1', at: now.toISOString(), ok: sel.ok, rules: US365.version, counts: sel.counts,
    picked: sel.picked.map(p => ({rank: p.rank, code: p.code, name: p.name, nameEn: p.nameEn, industry: p.industry, kind: p.kind, capRank: p.capRank, industryRank: p.industryRank}))}, true);
  if (!sel.ok) throw Error(`US_SELECT_SHORT ${sel.picked.length}곳 · 업종 ${sel.counts.industries}개 — reports/atlas11/us/runs/${stamp}/proposal.json 의 counts.short 확인`);
  const id = `us1-n365-v1-${newYork(now).date}`;
  const universe = {id, label: US365.label, rules: US365.version, says: US365.says, selectedAt: now.toISOString(), how: usHowLines(US365, '네이버 증권 해외주식(한글 이름 · 업종 · 시가총액 · 종가) · 나스닥 결산표(영업이익 · 순이익 · 부채 · 자기자본) · 나스닥 종목표(나라)'), proposal: path.join(RUN, 'proposal.json')};
  return {universe, picked: sel.picked, rows};
}

async function updateMode(prev) {
  const to = ymd(now), from = ymd(new Date(now.getTime() - 430 * 864e5));
  const assets = prev.assets ?? [];
  const hist = await pool(assets, 6, a => history({reuters: a.reuters}, from, to));
  step('일봉(지금 365곳)', {asked: assets.length, got: hist.filter(h => h.rows.length).length, latest: hist.map(h => h.rows.at(-1)?.date).filter(Boolean).sort().at(-1) ?? null});
  // 받지 못한 회사는 앞 입력의 종가를 그대로 둔다(빈 값으로 지우지 않음 · 늦은 회사로 화면에 적힘)
  const rows = new Map(assets.map((a, i) => [a.code, hist[i].rows.length ? hist[i].rows : (a.prices ?? [])]));
  const picked = assets.map(a => ({code: a.code, reuters: a.reuters, name: a.name, nameEn: a.nameEn, exchange: a.exchange, industry: a.industry, industryCode: a.industryCode ?? null, capUsd: a.quality?.capUsd ?? null, capRank: a.quality?.capRank ?? null,
    kind: a.quality?.kind ?? null, metrics: a.quality?.metrics ?? null, fails: a.quality?.fails ?? [], trend: a.quality?.trend ?? null, debtExempt: a.quality?.debtExempt ?? false, rank: a.quality?.rank ?? null}));
  return {universe: prev.universe, picked, rows, kept: true};
}

/** ⑤ 기사 · 지수 */
async function context(picked) {
  const news = await pool(picked, 6, async p => {
    const r = await getAny(NAVER_US.ways.news(p.reuters), 'news', j => Array.isArray(j) || (j && typeof j === 'object' && Object.keys(j).length > 0));
    if (!r.ok) return null;
    try { return parseUsNews(r.json, p.code); } catch { return null; }
  });
  const to = ymd(now), from = ymd(new Date(now.getTime() - 20 * 864e5));
  const index = [];
  // 지수 행 — 일봉(종가만 · 등락%는 앞 날 종가로 셈)이든 가격 목록(등락% 있음)이든 같은 모양으로
  const indexRows = j => { const d = parseDay(j); return d.length >= 2 ? d.map((x, i, a) => ({date: x.date, close: x.close, changePct: i ? Number(((x.close / a[i - 1].close - 1) * 100).toFixed(2)) : null})).filter(x => x.changePct != null) : parseIndex(j); };
  for (const ix of US_INDEX) {
    const r = await getAny(NAVER_US.ways.index(ix.symbol, from, to), 'index', j => indexRows(j).length > 0);
    const rows = r.ok ? indexRows(r.json).filter(x => usCloseFinal(x.date, now)) : [];
    if (rows.length) index.push({symbol: ix.symbol, name: ix.name, sourceName: '네이버 증권 해외 지수', sourceUrl: r.url, rows: rows.slice(-10)});
  }
  step('기사 · 지수', {news: news.filter(Boolean).length, newsItems: news.reduce((t, n) => t + (n?.items?.length ?? 0), 0), index: index.map(i => `${i.name} ${i.rows.at(-1)?.date}`)});
  return {schema: 'atlas11-us-context-1', day: new Date(now.getTime() + 9 * 3600000).toISOString().slice(0, 10), fetchedAt: now.toISOString(),
    news: news.filter(Boolean), index, sources: {news: news.some(Boolean) ? '네이버 증권 해외주식 뉴스' : null, index: index.length ? '네이버 증권 해외 지수' : null}};
}

/** 거래일 — 365곳 가운데 절반 넘게 종가가 있는 날(휴장일 표를 따로 쓰지 않고 받은 종가로) */
function sessionsOf(rowsByCode) {
  const count = new Map(); for (const rows of rowsByCode.values()) for (const r of rows) count.set(r.date, (count.get(r.date) ?? 0) + 1);
  const half = rowsByCode.size / 2;
  return [...count].filter(([, n]) => n > half).map(([d]) => d).sort();
}

export async function collect({mode = 'auto'} = {}) {
  if (!['auto', 'select', 'update'].includes(mode)) throw Error(`US_MODE ${String(mode).slice(0, 20)} — auto · select · update 가운데 하나`);
  await fs.mkdir(path.join(root, RUN, 'samples'), {recursive: true});
  const prev = await readJSON(US_DATA + '/input.json', null);
  const m = mode === 'auto' ? (prev?.assets?.length === US365.count ? 'update' : 'select') : mode;
  if (m === 'update' && !prev?.assets?.length) throw Error('US_NO_INPUT — 새 종가만 받으려면 먼저 365곳을 골라야 함(mode auto 또는 select)');
  step('시작', {mode: m, run: RUN, newYork: newYork(now)});
  const got = m === 'select' ? await selectMode() : await updateMode(prev);
  const ctx = await context(got.picked);
  const sessions = sessionsOf(new Map(got.picked.map(p => [p.code, got.rows.get(p.code) ?? []])));
  const assets = got.picked.map(p => ({code: p.code, reuters: p.reuters, name: p.name, nameEn: p.nameEn ?? null, exchange: p.exchange ?? null, sector: p.industry, industry: p.industry, industryCode: p.industryCode ?? null,
    quality: {rules: US365.version, rank: p.rank, kind: p.kind, capRank: p.capRank, capUsd: p.capUsd, metrics: p.metrics ?? null, roe: p.metrics?.roe ?? null, debt: p.metrics?.debt ?? null, debtExempt: p.debtExempt ?? usIsFinancial(p), fails: p.fails ?? [], trend: p.trend ? (p.trend.id ?? p.trend) : null},
    prices: (got.rows.get(p.code) ?? []).map(r => ({date: r.date, close: r.close, ...(r.sourceUrl ? {closeBasis: r.closeBasis, sourceUrl: r.sourceUrl, observedAt: r.observedAt} : {})}))}));
  const input = {schema: 'atlas11-us-input-1', place: 'us', retrievedAt: now.toISOString(), mode: m,
    sources: {prices: '네이버 증권 해외주식', names: '네이버 증권 해외주식(한글 이름)', industry: '네이버 증권 해외주식 업종', finance: '나스닥 결산표(nasdaq.com) · 없으면 네이버 증권 해외주식 결산', country: '나스닥 종목표(nasdaq.com)', news: ctx.sources.news},
    calendar: {timezone: 'America/New_York', basis: '365곳 가운데 절반 넘게 종가가 있는 날', sessions}, universe: got.universe, assets};
  await writeJSON(US_DATA + '/input.json', input);
  await writeJSON(US_DATA + '/context.json', ctx);
  const copy = await writeGz(path.join(RUN, 'input.json.gz'), input);
  await writeGz(path.join(RUN, 'context.json.gz'), ctx);
  const lastDays = assets.map(a => a.prices.at(-1)?.date).filter(Boolean).sort();
  step('끝', {assets: assets.length, asOf: lastDays.at(-1) ?? null, late: lastDays.filter(d => d !== lastDays.at(-1)).length, sessions: sessions.length, inputCopy: copy});
  await writeJSON(path.join(RUN, 'log.json'), {...log, endedAt: new Date().toISOString()}, true);
  return {mode: m, run: RUN, assets: assets.length};
}

if (process.argv[1] && path.resolve(process.argv[1]) === new URL(import.meta.url).pathname) {
  try { console.log(JSON.stringify(await collect({mode: arg('--mode', 'auto')}))); }
  catch (e) { step('멈춤', {error: String(e?.message ?? e)}); await writeJSON(path.join(RUN, 'log.json'), {...log, endedAt: new Date().toISOString(), error: String(e?.message ?? e)}, true).catch(() => {}); process.exitCode = 1; }
}
