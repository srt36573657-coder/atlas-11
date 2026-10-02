/**
 * ATLAS 11 · 지난 기록 모으기(backfill) — 매일 관측만 하던 재료의 3년치 기록을 한 번에 모은다.
 *   2026-10-02 14:31 사장님 「일단 그렇게 해봐」(가: 13가지 모으기 → 시험 → 좋아진 것만 켜기)
 *   모은 값은 「지금 받은 값」이다(당시에 공개된 값 그대로라는 보증 없음 · vintage: retrieved_now). 시험에서는 공개 시각 규칙을 따로 적용한다.
 *   예측 숫자에 바로 쓰지 않는다(usedInForecast:false). 결측은 0 으로 채우지 않는다.
 * 출처: FRED CSV(전체 기록 한 번에) · 네이버 시장지표·종목 투자자 동향(페이지 넘기기 · 페이지 번호가 안 먹으면 날짜 커서로 바꿈)
 */
import {num, parseFredCSV, parseNaverSeries, macroURL, sha256} from './context.mjs';

export const BACKFILL_SCHEMA = 'atlas11-backfill-1';
export const BACKFILL_FROM = '2023-01-01';
const isDay = d => /^\d{4}-\d{2}-\d{2}$/.test(d ?? '') && new Date(d + 'T00:00:00Z').toISOString().slice(0, 10) === d;
const ymd = s => (typeof s === 'string' && /^\d{8}$/.test(s)) ? `${s.slice(0, 4)}-${s.slice(4, 6)}-${s.slice(6, 8)}` : null;
export const compactDay = d => d.replaceAll('-', '');
export const dayBefore = d => new Date(Date.parse(d + 'T00:00:00Z') - 86400000).toISOString().slice(0, 10);
export const safeName = id => id.replace(/[^A-Za-z0-9_-]/g, '_');

/** 종목 투자자 동향 + 거래량(수급 몫 계산용). 종가는 대체거래소가 섞일 수 있어 받지 않는다. */
export function parseFlowsWithVolume(text, code) {
  let d; try { d = JSON.parse(text); } catch { throw Error('PARSE_FAILED'); }
  if (!Array.isArray(d)) throw Error('SHAPE_FLOWS');
  const rows = [];
  for (const r of d) {
    if (r?.itemCode !== code) throw Error('CODE_MISMATCH');
    const date = ymd(r.bizdate); if (!date || !isDay(date)) continue;
    rows.push({date, foreignNet: num(r.foreignerPureBuyQuant), institutionNet: num(r.organPureBuyQuant), individualNet: num(r.individualPureBuyQuant), foreignHoldRatioPct: num(r.foreignerHoldRatio), volume: num(r.accumulatedTradingVolume), unit: 'shares'});
  }
  rows.sort((a, b) => a.date.localeCompare(b.date));
  return rows.filter((r, i) => i === 0 || r.date !== rows[i - 1].date);
}

export const BACKFILL_URLS = Object.freeze({
  flowsPage: (code, page, size) => `https://m.stock.naver.com/api/stock/${code}/trend?pageSize=${size}&page=${page}`,
  flowsCursor: (code, cursor, size) => `https://m.stock.naver.com/api/stock/${code}/trend?pageSize=${size}&bizdate=${cursor}`,
  naverPage: (series, page, size) => macroURL(series).replace('page=1&pageSize=10', `page=${page}&pageSize=${size}`),
  fred: (series, from) => macroURL(series, {from}),
});

/**
 * 페이지를 넘기며 날짜별 행을 모은다.
 *   멈춤: 가장 오래된 날짜 < from(reached_from) · 빈 페이지(empty_page) · 새 날짜 없음(no_new_rows) · 상한(max_pages) · 받기/읽기 실패
 *   둘째 페이지가 첫 페이지와 같은 날짜만 주면(페이지 번호 무시) 날짜 커서(cursorUrlFor)로 바꿔 계속한다.
 */
export async function pageThrough({get, urlFor, cursorUrlFor = null, parse, from = BACKFILL_FROM, maxPages = 80, pageSize = 60}) {
  const rows = new Map(), pages = [], conflicts = [];
  let mode = 'page', page = 1, cursor = null, stop = null;
  for (let k = 0; k < maxPages; k++) {
    const url = mode === 'page' ? urlFor(page, pageSize) : cursorUrlFor(cursor, pageSize);
    const g = await get(url);
    if (!g.ok) { pages.push({url, ok: false, error: g.error, attempts: g.attempts?.length ?? 0}); stop = 'fetch_failed'; break; }
    let parsed;
    try { parsed = parse(g.text); } catch (e) { pages.push({url, ok: false, error: e.message, rawSHA256: sha256(g.text)}); stop = 'parse_failed'; break; }
    let fresh = 0;
    for (const r of parsed) {
      const prev = rows.get(r.date);
      if (prev) { if (JSON.stringify(prev) !== JSON.stringify(r)) conflicts.push({date: r.date, kept: prev, other: r, url}); continue; }
      rows.set(r.date, r); fresh++;
    }
    const dates = parsed.map(r => r.date).sort();
    pages.push({url, ok: true, rows: parsed.length, fresh, oldest: dates[0] ?? null, newest: dates.at(-1) ?? null, rawSHA256: sha256(g.text), fetchedAt: g.fetchedAt ?? null});
    if (!parsed.length) { stop = 'empty_page'; break; }
    if (dates[0] < from) { stop = 'reached_from'; break; }
    if (!fresh) {
      if (mode === 'page' && cursorUrlFor && page === 2) mode = 'cursor';
      else { stop = 'no_new_rows'; break; }
    }
    if (mode === 'page') page++;
    else { const oldest = [...rows.keys()].sort()[0]; cursor = compactDay(dayBefore(oldest)); }
  }
  stop ??= 'max_pages';
  const all = [...rows.values()].sort((a, b) => a.date.localeCompare(b.date));
  return {rows: all.filter(r => r.date >= from), mode, stop, pages, conflicts, oldestSeen: all[0]?.date ?? null, newestSeen: all.at(-1)?.date ?? null};
}

/** 거시 시계열 하나 — FRED 는 한 번에 전체, 네이버는 페이지 넘기기 */
export async function backfillSeries(get, series, {from = BACKFILL_FROM, maxPages = 80, pageSize = 60} = {}) {
  if (series.provider === 'fred') {
    const url = BACKFILL_URLS.fred(series, from), g = await get(url, {ua: 'curl/8.5.0'});
    if (!g.ok) return {rows: [], mode: 'single', stop: 'fetch_failed', pages: [{url, ok: false, error: g.error}], conflicts: []};
    try { const rows = parseFredCSV(g.text, series.id).filter(r => r.date >= from); return {rows, mode: 'single', stop: 'complete_csv', pages: [{url, ok: true, rows: rows.length, rawSHA256: sha256(g.text), fetchedAt: g.fetchedAt ?? null}], conflicts: [], oldestSeen: rows[0]?.date ?? null, newestSeen: rows.at(-1)?.date ?? null}; }
    catch (e) { return {rows: [], mode: 'single', stop: 'parse_failed', pages: [{url, ok: false, error: e.message, rawSHA256: sha256(g.text)}], conflicts: []}; }
  }
  return pageThrough({get, urlFor: (p, n) => BACKFILL_URLS.naverPage(series, p, n), parse: t => parseNaverSeries(t).map(({date, value}) => ({date, value})), from, maxPages, pageSize});
}

/** 종목 수급 하나 */
export function backfillFlows(get, code, {from = BACKFILL_FROM, maxPages = 80, pageSize = 60} = {}) {
  return pageThrough({get, urlFor: (p, n) => BACKFILL_URLS.flowsPage(code, p, n), cursorUrlFor: (c, n) => BACKFILL_URLS.flowsCursor(code, c, n), parse: t => parseFlowsWithVolume(t, code), from, maxPages, pageSize});
}
