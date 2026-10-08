/**
 * ATLAS 중국 · 일본 · 베트남 판 · 자료 받기(깃허브 실행기에서 · 「중국 · 일본 · 베트남 주식 자료 받기」 단추) — 사장님 2026-10-07 05:25 「자 중국 일본 베트남 주식도 넣어라 미국 장 처럼 말이다」
 *   미국 판 scripts/atlas11/us/collect.mjs 와 같은 걸음 · 같은 출처(네이버 증권 해외주식) — 시장 값은 lib/atlas11/world/markets.mjs
 *   node scripts/atlas11/world/collect.mjs --market cn|jp|vn [--mode auto|select|update]
 *   --mode select : ① 시가총액 순 목록(거래소마다) → 상위 poolTop 곳 ② 결산(네이버 · 확정 칸만) — 부채비율이 판가름하는 회사만 야후 결산 줄로
 *                   ③ 일봉(지난 약 14달) ④ 고르기(lib/atlas11/world/universe.mjs selectWorld — 미국 판 규칙 그대로)
 *   --mode update : 지금 고른 회사 그대로 — 일봉만 새로
 *   두 경우 모두 ⑤ 한글 기사 · 지수
 *   쓰는 곳: reports/atlas11/<시장>/runs/<시각>/(원문 견본 · 후보 · 고른 결과 · 입력 사본 — 덮어쓰지 않음) · public/data/atlas11/<시장>/{input.json, context.json}
 *   한국 · 미국 판 파일은 읽지도 쓰지도 않는다 · 장중 값은 종가로 쓰지 않는다(그 나라 마감 1시간 뒤부터 · markets.mjs closeFinal)
 */
import {RETIRED} from '../../../lib/atlas11/places.mjs';
import fs from 'node:fs/promises';
import path from 'node:path';
import zlib from 'node:zlib';
import {createHash} from 'node:crypto';
import {NAVER_US, parseList, parseDay, parseFinance, metricsOf, parseUsNews, parseIndex} from '../../../lib/atlas11/us/naver.mjs';
import {usIsFinancial, usNotCommon} from '../../../lib/atlas11/us/universe.mjs';
import {YAHOO_TS, parseYahooTs, yahooMetrics} from '../../../lib/atlas11/us/yahoo.mjs';
import {worldOf, closeFinal, localTime} from '../../../lib/atlas11/world/markets.mjs';
import {selectWorld, worldRules, worldHowLines} from '../../../lib/atlas11/world/universe.mjs';

const root = process.cwd();
const arg = (name, d = null) => { const i = process.argv.indexOf(name); return i < 0 ? d : process.argv[i + 1]; };
const now = new Date(), stamp = now.toISOString().replace(/[:.]/g, '-').slice(0, 19);
const sleep = ms => new Promise(r => setTimeout(r, ms));
const PAUSE = Number(process.env.ATLAS_WORLD_PAUSE ?? 60);
const ymd = d => d.toISOString().slice(0, 10).replace(/-/g, '');
const sha = x => createHash('sha256').update(x).digest('hex');
export const dataDir = id => `public/data/atlas11/${id}`;

export async function collect({market, mode = 'auto'} = {}) {
  const M = worldOf(market), DATA = dataDir(M.id), RUN = path.join(`reports/atlas11/${M.id}/runs`, stamp);
  const log = {market: M.id, startedAt: now.toISOString(), steps: [], samples: {}, failures: {}};
  const step = (name, info) => { const row = {name, at: new Date().toISOString(), ...info}; log.steps.push(row); console.log(`[${M.id} ${row.at.slice(11, 19)}] ${name} ${JSON.stringify(info)}`); };
  const readJSON = async (file, otherwise) => { try { return JSON.parse(await fs.readFile(path.join(root, file), 'utf8')); } catch (e) { if (otherwise !== undefined) return otherwise; throw e; } };
  const writeJSON = async (file, value, pretty = false) => { await fs.mkdir(path.dirname(path.join(root, file)), {recursive: true}); await fs.writeFile(path.join(root, file), JSON.stringify(value, null, pretty ? 1 : 0)); };
  const writeGz = async (file, value) => { const gz = zlib.gzipSync(Buffer.from(JSON.stringify(value))); await fs.mkdir(path.dirname(path.join(root, file)), {recursive: true}); await fs.writeFile(path.join(root, file), gz); return {file, sha256: sha(gz), bytes: gz.length}; };
  /** 받기 — 429 · 5xx · 끊김은 쉬었다가 다시(3번까지) · 원문 견본은 종류마다 첫 성공 · 첫 실패 하나만 */
  async function get(url, kind, {tries = 3, headers = NAVER_US.headers} = {}) {
    let last = null;
    for (let k = 0; k < tries; k++) {
      const t = Date.now();
      try {
        const r = await fetch(url, {headers, signal: AbortSignal.timeout(20000)}); const text = await r.text();
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
    if (!log.samples[kind + '_fail']) log.samples[kind + '_fail'] = {url, ...last};
    return {ok: false, ...last};
  }
  const way = {};
  async function getAny(urls, kind, good = () => true) {
    const order = [...new Set([...(way[kind] != null ? [way[kind]] : []), ...urls.keys()])]; let last = null;
    for (const i of order) {
      const r = await get(urls[i], i ? `${kind}_way${i}` : kind); let ok = false; if (r.ok) try { ok = !!good(r.json); } catch {}
      if (ok) { if (way[kind] !== i) { way[kind] = i; step('길', {kind, way: i, url: urls[i].replace(/\?.*$/, '')}); } return {...r, url: urls[i]}; }
      last = r.ok ? {status: r.status, err: 'EMPTY'} : r;
    }
    return {ok: false, ...last};
  }
  async function pool(items, n, fn) {
    const out = new Array(items.length); let i = 0;
    await Promise.all(Array.from({length: Math.min(n, items.length)}, async () => { while (i < items.length) { const k = i++; out[k] = await fn(items[k], k); if (PAUSE) await sleep(PAUSE); } }));
    return out;
  }
  /** ① 시가총액 순 목록 — 거래소마다 쪽을 넘기며 · 보통주만 · 합쳐서 큰 순(그 나라 돈 · 같은 시장 안에서만 견줌) */
  async function universeList(limit) {
    const all = new Map(), seen = {};
    for (const ex of M.exchanges) {
      seen[ex] = 0;
      for (let page = 1; page <= 25 && seen[ex] < M.perExchange[ex]; page++) {
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
  /** 일봉 — 지난 430일 · 장중 값은 버림 · 받은 시각 · 주소는 마지막 날에만 */
  async function history(c, from, to) {
    const r = await getAny(NAVER_US.ways.day(c.reuters, from, to), 'day', j => parseDay(j).length > 0), url = r.url ?? NAVER_US.day(c.reuters, from, to);
    if (!r.ok) return {rows: [], url, ok: false, status: r.status};
    const rows = parseDay(r.json).filter(x => closeFinal(M, x.date, now));
    if (rows.length) Object.assign(rows.at(-1), {closeBasis: 'NAVER_WORLD_DAY', sourceUrl: url, observedAt: new Date().toISOString()});
    return {rows, url, ok: true};
  }
  const RULES = worldRules(M);
  const historyCheck = (rows, latest) => ({rows: rows.length, last: rows.at(-1)?.date ?? null, ok: rows.length >= RULES.minHistoryRows && !!latest && !!rows.at(-1) && (Date.parse(latest) - Date.parse(rows.at(-1).date)) <= 7 * 864e5});

  async function selectMode() {
    const list = await universeList(M.poolTop);
    if (list.length < Math.min(500, M.poolTop * 0.6)) throw Error(`${M.id.toUpperCase()}_LIST_SHORT ${list.length} — 시가총액 목록을 충분히 받지 못함(samples 확인)`);
    // ② 결산 — ㉠ 네이버(모두 · EBIT · 순이익 · PBR÷PER · 부채비율 없음) ㉡ 부채비율이 판가름하는 회사만 야후 결산 줄(부채 총계 ÷ 자기자본)
    const naverFin = await pool(list, 6, async c => { const n = await getAny(NAVER_US.ways.finance(c.reuters), 'finance', j => parseFinance(j).cols.length > 0); if (!n.ok) return null; try { const m = metricsOf(parseFinance(n.json)); return m ? {...m, source: 'naver'} : null; } catch { return null; } });
    const needs = (c, m) => !usNotCommon(c) && !usIsFinancial(c) && (!m || (m.net > 0 && m.netPrev > 0 && (m.op ?? 1) > 0 && (m.opPrev ?? 1) > 0 && !(m.roe != null && m.roe < RULES.roeMinPct)));
    const fins = [...naverFin], ask = list.map((c, i) => i).filter(i => needs(list[i], naverFin[i]));
    let yOk = 0, yFail = 0, yOff = false;
    await pool(ask, 2, async i => {
      if (yOff) return;
      const c = list[i], y = await get(YAHOO_TS.url(M.yahoo(c.reuters)), 'yahoo_ts', {headers: YAHOO_TS.headers, tries: 2});
      if (y.ok) { try { const m = yahooMetrics(parseYahooTs(y.json)); if (m) { fins[i] = {...(naverFin[i] ?? {}), ...m, unit: M.unit, source: naverFin[i] ? 'naver+yahoo' : 'yahoo'}; yOk++; return; } } catch {} }
      else if (y.status === 429 && ++yFail >= 20) { yOff = true; step('야후 막힘', {after: yOk}); }
      if (PAUSE) await sleep(150);
    });
    step('결산', {asked: list.length, naver: naverFin.filter(Boolean).length, askedDebt: ask.length, yahoo: yOk, yahooOff: yOff, withDebt: fins.filter(m => m?.debt != null).length, withRoe: fins.filter(m => m?.roe != null).length});
    // ③ 일봉
    const to = ymd(now), from = ymd(new Date(now.getTime() - 430 * 864e5));
    const hist = await pool(list, 6, c => history(c, from, to));
    const latest = hist.map(h => h.rows.at(-1)?.date).filter(Boolean).sort().at(-1) ?? null;
    step('일봉', {asked: list.length, got: hist.filter(h => h.rows.length).length, latest, rows: hist.map(h => h.rows.length).sort((a, b) => b - a)[Math.floor(list.length / 2)] ?? 0});
    const candidates = list.map((c, i) => {
      const m = fins[i], fin = usIsFinancial(c);
      return {...c, financial: fin, history: historyCheck(hist[i].rows, latest),
        metrics: m ? {fiscalYear: m.fiscalYear, prevYear: m.prevYear, revenue: m.revenue ?? null, op: m.op, opPrev: m.opPrev, net: m.net, netPrev: m.netPrev, roe: m.roe, debt: m.debt ?? null, equityNeg: m.equityNeg ?? false, source: m.source, basis: m.basis ?? null} : null};
    });
    // ④ 고르기(미국 판 규칙 그대로)
    const sel = selectWorld(candidates, M);
    step('고르기', {ok: sel.ok, picked: sel.picked.length, industries: sel.counts.industries, filled: sel.counts.industriesFilled, kinds: sel.counts.kinds, pool: sel.counts.pool, failTop: Object.entries(sel.counts.failReasons).slice(0, 6)});
    await writeGz(path.join(RUN, 'history.json.gz'), {schema: 'atlas11-world-history-1', market: M.id, at: now.toISOString(), from, to, basis: `NAVER_WORLD_DAY · ${M.city} ${M.finalAfter} 지나 굳은 종가만`,
      rows: Object.fromEntries(list.map((c, i) => [c.code, hist[i].rows.map(r => [r.date, r.close])])), urls: Object.fromEntries(list.map((c, i) => [c.code, hist[i].url]))});
    await writeGz(path.join(RUN, 'candidates.json.gz'), {schema: 'atlas11-world-candidates-1', market: M.id, at: now.toISOString(), rules: {...sel.rules, trendGroups: sel.rules.trendGroups.map(g => ({id: g.id, label: g.label, words: String(g.words)}))},
      candidates: sel.checked.map(c => ({code: c.code, reuters: c.reuters, name: c.name, nameEn: c.nameEn, exchange: c.exchange, industry: c.industry, industryCode: c.industryCode, cap: c.capUsd, capRank: c.capRank, financial: c.financial, metrics: c.metrics, history: c.history, fails: c.fails, sameCompanyOf: c.sameCompanyOf ?? null}))});
    await writeJSON(path.join(RUN, 'proposal.json'), {schema: 'atlas11-world-proposal-1', market: M.id, at: now.toISOString(), ok: sel.ok, rules: sel.rules.version, counts: sel.counts,
      picked: sel.picked.map(p => ({rank: p.rank, code: p.code, name: p.name, nameEn: p.nameEn, industry: p.industry, kind: p.kind, capRank: p.capRank, industryRank: p.industryRank}))}, true);
    if (!sel.ok) throw Error(`${M.id.toUpperCase()}_SELECT_SHORT ${sel.picked.length}곳 · 업종 ${sel.counts.industries}개 — ${RUN}/proposal.json 의 counts.short 확인`);
    const id = `${M.id}1-${sel.rules.version}-${localTime(M.tz, now).date}`;
    const universe = {id, label: sel.rules.label, rules: sel.rules.version, says: sel.rules.says, selectedAt: now.toISOString(), how: worldHowLines(M, sel.rules, '네이버 증권 해외주식(한글 이름 · 업종 · 시가총액 · 종가 · 결산) · 야후 결산 줄(부채 총계 · 자기자본)'),
      counts: {picked: sel.picked.length, industries: sel.counts.industries, kinds: sel.counts.kinds}};
    return {universe, picked: sel.picked, rows: new Map(list.map((c, i) => [c.code, hist[i].rows])), rules: sel.rules};
  }
  async function updateMode(prev) {
    const to = ymd(now), from = ymd(new Date(now.getTime() - 430 * 864e5)), assets = prev.assets ?? [];
    const hist = await pool(assets, 6, a => history({reuters: a.reuters}, from, to));
    step('일봉(지금 고른 회사)', {asked: assets.length, got: hist.filter(h => h.rows.length).length, latest: hist.map(h => h.rows.at(-1)?.date).filter(Boolean).sort().at(-1) ?? null});
    const rows = new Map(assets.map((a, i) => [a.code, hist[i].rows.length ? hist[i].rows : (a.prices ?? [])]));
    const picked = assets.map(a => ({code: a.code, reuters: a.reuters, name: a.name, nameEn: a.nameEn, exchange: a.exchange, industry: a.industry, industryCode: a.industryCode ?? null, capUsd: a.quality?.cap ?? null, capRank: a.quality?.capRank ?? null,
      kind: a.quality?.kind ?? null, metrics: a.quality?.metrics ?? null, fails: a.quality?.fails ?? [], trend: a.quality?.trend ?? null, debtExempt: a.quality?.debtExempt ?? false, rank: a.quality?.rank ?? null}));
    return {universe: prev.universe, picked, rows, rules: {version: prev.universe?.rules ?? RULES.version}, kept: true};
  }
  /** ⑤ 기사 · 지수 */
  async function context(picked) {
    const news = await pool(picked, 6, async p => {
      const r = await getAny(NAVER_US.ways.news(p.reuters), 'news', j => Array.isArray(j) || (j && typeof j === 'object' && Object.keys(j).length > 0));
      if (!r.ok) return null; try { return parseUsNews(r.json, p.code); } catch { return null; }
    });
    const to = ymd(now), from = ymd(new Date(now.getTime() - 20 * 864e5)), index = [];
    const indexRows = j => { const d = parseDay(j); return d.length >= 2 ? d.map((x, i, a) => ({date: x.date, close: x.close, changePct: i ? Number(((x.close / a[i - 1].close - 1) * 100).toFixed(2)) : null})).filter(x => x.changePct != null) : parseIndex(j); };
    for (const ix of M.index) {
      const r = await getAny(NAVER_US.ways.index(ix.symbol, from, to), 'index', j => indexRows(j).length > 0);
      const rows = r.ok ? indexRows(r.json).filter(x => closeFinal(M, x.date, now)) : [];
      if (rows.length) index.push({symbol: ix.symbol, name: ix.name, sourceName: '네이버 증권 해외 지수', sourceUrl: r.url, rows: rows.slice(-10)});
    }
    step('기사 · 지수', {news: news.filter(Boolean).length, newsItems: news.reduce((t, n) => t + (n?.items?.length ?? 0), 0), index: index.map(i => `${i.name} ${i.rows.at(-1)?.date}`)});
    return {schema: 'atlas11-world-context-1', market: M.id, day: new Date(now.getTime() + 9 * 3600000).toISOString().slice(0, 10), fetchedAt: now.toISOString(),
      news: news.filter(Boolean), index, sources: {news: news.some(Boolean) ? '네이버 증권 해외주식 뉴스' : null, index: index.length ? '네이버 증권 해외 지수' : null}};
  }
  const sessionsOf = rowsByCode => { const count = new Map(); for (const rows of rowsByCode.values()) for (const r of rows) count.set(r.date, (count.get(r.date) ?? 0) + 1); const half = rowsByCode.size / 2; return [...count].filter(([, n]) => n > half).map(([d]) => d).sort(); };

  if (!['auto', 'select', 'update'].includes(mode)) throw Error(`WORLD_MODE ${String(mode).slice(0, 20)} — auto · select · update 가운데 하나`);
  await fs.mkdir(path.join(root, RUN, 'samples'), {recursive: true});
  try {
    const prev = await readJSON(DATA + '/input.json', null);
    const m = mode === 'auto' ? (prev?.assets?.length ? 'update' : 'select') : mode;
    if (m === 'update' && !prev?.assets?.length) throw Error(`${M.id.toUpperCase()}_NO_INPUT — 새 종가만 받으려면 먼저 골라야 함(mode auto 또는 select)`);
    step('시작', {mode: m, run: RUN, local: localTime(M.tz, now)});
    const got = m === 'select' ? await selectMode() : await updateMode(prev);
    const ctx = await context(got.picked);
    const sessions = sessionsOf(new Map(got.picked.map(p => [p.code, got.rows.get(p.code) ?? []])));
    const assets = got.picked.map(p => ({code: p.code, reuters: p.reuters, name: p.name, nameEn: p.nameEn ?? null, exchange: p.exchange ?? null, sector: p.industry, industry: p.industry, industryCode: p.industryCode ?? null,
      quality: {rules: got.rules.version, rank: p.rank, kind: p.kind, capRank: p.capRank, cap: p.capUsd, metrics: p.metrics ?? null, roe: p.metrics?.roe ?? null, debt: p.metrics?.debt ?? null, debtExempt: p.debtExempt ?? usIsFinancial(p), fails: p.fails ?? [], trend: p.trend ? (p.trend.id ?? p.trend) : null},
      prices: (got.rows.get(p.code) ?? []).map(r => ({date: r.date, close: r.close, ...(r.sourceUrl ? {closeBasis: r.closeBasis, sourceUrl: r.sourceUrl, observedAt: r.observedAt} : {})}))}));
    const input = {schema: 'atlas11-world-input-1', place: M.id, retrievedAt: now.toISOString(), mode: m,
      sources: {prices: '네이버 증권 해외주식', names: '네이버 증권 해외주식(한글 이름)', industry: '네이버 증권 해외주식 업종', finance: '네이버 증권 해외주식 결산 · 부채비율은 야후 결산 줄', news: ctx.sources.news},
      calendar: {timezone: M.tz, basis: '고른 회사 가운데 절반 넘게 종가가 있는 날', sessions}, universe: got.universe, assets};
    await writeJSON(DATA + '/input.json', input);
    await writeJSON(DATA + '/context.json', ctx);
    const copy = await writeGz(path.join(RUN, 'input.json.gz'), input);
    await writeGz(path.join(RUN, 'context.json.gz'), ctx);
    const lastDays = assets.map(a => a.prices.at(-1)?.date).filter(Boolean).sort();
    step('끝', {assets: assets.length, asOf: lastDays.at(-1) ?? null, late: lastDays.filter(d => d !== lastDays.at(-1)).length, sessions: sessions.length, inputCopy: copy});
    await writeJSON(path.join(RUN, 'log.json'), {...log, endedAt: new Date().toISOString()}, true);
    return {market: M.id, mode: m, run: RUN, assets: assets.length};
  } catch (e) {
    step('멈춤', {error: String(e?.message ?? e)}); await writeJSON(path.join(RUN, 'log.json'), {...log, endedAt: new Date().toISOString(), error: String(e?.message ?? e)}, true).catch(() => {});
    throw e;
  }
}

if (process.argv[1] && path.resolve(process.argv[1]) === new URL(import.meta.url).pathname) {
  // 내린 판(2026-10-08 18:33 마카오 시각 「한국 미국장만 두고 남머지 장은 삭제해」 — lib/atlas11/places.mjs RETIRED)은 받지 않고 끝(작업 파일은 고치지 않음 · 규칙 7 — 저녁 실행 뒤 저절로 돌아도 헛일 없이 끝남)
  if (RETIRED[arg('--market')]) { console.log(JSON.stringify({market: arg('--market'), skipped: `내린 판(${RETIRED[arg('--market')]}) — 받지 않음`})); process.exit(0); }
  try { console.log(JSON.stringify(await collect({market: arg('--market'), mode: arg('--mode', 'auto')}))); }
  catch (e) { console.error(String(e?.message ?? e)); process.exitCode = 1; }
}
