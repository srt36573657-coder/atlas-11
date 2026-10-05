/**
 * ATLAS 11 · 네이버 일봉 수집기 — run_daily.mjs 의 --collector 모듈
 *   node scripts/atlas11/collect_naver.mjs --now ISO [--fixture dir] [--out file.json] [--count 30] [--codes 005930,...] [--no-market] [--finality-delay-ms 90000] [--polite-delay-ms 150] [--concurrency 4]
 *   export async function collect(input, window, options) → {attempted, provider, observations, marketObservations, errors, stats, lastGoodDate, delayed, startedAt, finishedAt}
 * 원천(일봉만 · 분봉/시간외 섞지 않음)
 *   1차 https://fchart.stock.naver.com/sise.nhn?symbol=<code>&timeframe=day&count=<n>&requestType=0   (XML <item data="YYYYMMDD|시|고|저|종|량"/>)
 *   2차 https://api.stock.naver.com/chart/domestic/item/<code>/day?startDateTime=YYYYMMDD0000&endDateTime=YYYYMMDD0000 (JSON 배열)
 * 규칙
 *   · 원천마다 4회(처음 1 + 재시도 3 · 대기 1s/3s/9s) → 실패하면 다음 원천 · 종목 실패는 다른 종목에 번지지 않음 · 동시 4 · 종목 사이 150ms
 *   · 행은 달력 거래일이며 window.cutoff 이하만 통과(끝나지 않은 장은 절대 넘기지 않음) · 비거래일 행은 droppedNonSessionRows 로 셈
 *   · 저장된 검토 행(priceBasis KRX_REGULAR)과 종가가 다른 날짜는 넘기지 않고 REVIEWED_ROW_MISMATCH 로 보고한다 — 검증기가 그 자리에서 하루 전체를 던지는(PRICE_SESSION_BASIS_CONFLICT) 대신 눈에 보이게
 *   · 오늘 봉: 15:30 KST 이후 두 번(사이 finalityDelayMs) 받아 종가·거래량이 같아야 finalClose 증거를 붙인다 · 다르면 오늘 행만 빼고 TODAY_NOT_FINAL
 *   · rawHash = 응답 원문 바이트의 sha256 · observedAt = 수집 시계 도장(아래) · fetchedAt = 실제 벽시계
 * 시계(observedAt) — 검증기(mergeRollingPrices)는 observedAt ≤ 실행기의 now 를 요구한다. 실행기(run_daily.mjs)는 now 를 시작 때 고정하므로
 *   options.now 가 없으면 실행기의 --now(argv) 또는 ATLAS_NOW 를 도장으로 쓴다(실제 수신 시각보다 이르거나 같은 하한). 둘 다 없으면 벽시계.
 * 이 파일을 두는 것만으로는 아무것도 돌지 않는다(deploy/ 의 설치 중 하나가 필요).
 */
import fs from 'node:fs/promises';
import path from 'node:path';
import {createHash} from 'node:crypto';
import {pathToFileURL} from 'node:url';

export const PROVIDER = 'naver_fchart_daily';
export const PRIMARY_ORIGIN = 'https://fchart.stock.naver.com';
export const FALLBACK_ORIGIN = 'https://api.stock.naver.com';
export const CLOSE_KST = '15:30', DEADLINE_KST = '16:00';
export const FINALITY_BASIS = 'two fetches of the daily bar >= 15:30 KST agreed on close and volume (regular session close)';
export const DEFAULT_BACKOFF_MS = Object.freeze([1000, 3000, 9000]);
const DEFAULT_UA = 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36 ATLAS11-collector/1.0';

const sha256 = bytes => createHash('sha256').update(bytes).digest('hex');
const finite = x => typeof x === 'number' && Number.isFinite(x);
const toISO = x => { const t = x instanceof Date ? x.getTime() : Date.parse(x); if (!Number.isFinite(t)) throw Error('INVALID_CLOCK:' + x); return new Date(t).toISOString(); };
const defaultSleep = ms => new Promise(r => setTimeout(r, ms)); // unref 금지 — 기다리는 동안 프로세스가 끝나 버린다
/** 한국 시각(+09:00 · 서머타임 없음) — lib/rolling-operation.mjs 의 koreaDay 와 같은 셈법 */
export const kstDay = iso => new Date(Date.parse(iso) + 9 * 3600000).toISOString().slice(0, 10);
export const kstClock = iso => new Date(Date.parse(iso) + 9 * 3600000).toISOString().slice(11, 19);
const closeInstant = day => Date.parse(day + 'T' + CLOSE_KST + ':00+09:00');
const deadlineInstant = day => Date.parse(day + 'T' + DEADLINE_KST + ':00+09:00');
export const ymdToIso = s => { const m = /^(\d{4})(\d{2})(\d{2})$/.exec(String(s ?? '').trim()); if (!m) return null; const d = `${m[1]}-${m[2]}-${m[3]}`; return new Date(d + 'T00:00:00Z').toISOString().slice(0, 10) === d ? d : null; };
const isoToYmd = d => d.replace(/-/g, '');
export const fchartUrl = (symbol, count) => `${PRIMARY_ORIGIN}/sise.nhn?symbol=${encodeURIComponent(symbol)}&timeframe=day&count=${count}&requestType=0`;
export const naverDayUrl = (code, startDay, endDay) => `${FALLBACK_ORIGIN}/chart/domestic/item/${encodeURIComponent(code)}/day?startDateTime=${isoToYmd(startDay)}0000&endDateTime=${isoToYmd(endDay)}0000`;

// ---------- 응답 해석 ----------
const toNumber = v => { if (typeof v === 'number') return v; if (typeof v !== 'string') return NaN; const s = v.replace(/,/g, '').trim(); return s === '' ? NaN : Number(s); };
function sortedUnique(rows, tag) {
  const byDate = new Map();
  for (const r of rows) {
    const prev = byDate.get(r.date);
    if (prev && ['open', 'high', 'low', 'close', 'volume'].some(k => prev[k] !== r[k])) throw Error(tag + '_DUPLICATE_DATE_CONFLICT:' + r.date);
    byDate.set(r.date, r);
  }
  return [...byDate.values()].sort((a, b) => a.date.localeCompare(b.date));
}
/** fchart XML: <chartdata symbol=".." timeframe="day" ..><item data="YYYYMMDD|open|high|low|close|volume" /> … */
export function parseFchartXml(text) {
  if (typeof text !== 'string' || !text.trim()) throw Error('FCHART_EMPTY');
  const head = /<chartdata\b([^>]*)>/i.exec(text), attrs = {};
  if (head) for (const m of head[1].matchAll(/([A-Za-z_]+)="([^"]*)"/g)) attrs[m[1]] = m[2];
  if (attrs.timeframe && attrs.timeframe !== 'day') throw Error('FCHART_TIMEFRAME_NOT_DAY:' + attrs.timeframe);
  if (!head && !/<item\b/.test(text)) throw Error('FCHART_NOT_XML');
  const rows = [];
  for (const m of text.matchAll(/<item\s+data="([^"]*)"\s*\/?>/g)) {
    const f = m[1].split('|');
    if (f.length < 6) throw Error('FCHART_ROW_FIELDS:' + m[1]);
    const date = ymdToIso(f[0]), n = f.slice(1, 6).map(toNumber);
    if (!date || n.some(x => !Number.isFinite(x))) throw Error('FCHART_ROW_VALUE:' + m[1]);
    rows.push({date, open: n[0], high: n[1], low: n[2], close: n[3], volume: n[4]});
  }
  return {symbol: attrs.symbol ?? null, name: attrs.name ?? null, timeframe: attrs.timeframe ?? null, count: attrs.count != null && attrs.count !== '' ? Number(attrs.count) : null, rows: sortedUnique(rows, 'FCHART')};
}
/** api.stock.naver.com …/day: [{localDate:"YYYYMMDD", openPrice, highPrice, lowPrice, closePrice, accumulatedTradingVolume, …}] (값은 문자열일 수 있음) */
export function parseNaverDayJson(text) {
  let data; try { data = JSON.parse(text); } catch { throw Error('NAVER_JSON_INVALID'); }
  if (!Array.isArray(data)) throw Error('NAVER_JSON_NOT_ARRAY');
  const rows = data.map(r => {
    const date = ymdToIso(r?.localDate), n = ['openPrice', 'highPrice', 'lowPrice', 'closePrice', 'accumulatedTradingVolume'].map(k => toNumber(r?.[k]));
    if (!date || n.some(x => !Number.isFinite(x))) throw Error('NAVER_JSON_ROW:' + JSON.stringify(r).slice(0, 120));
    return {date, open: n[0], high: n[1], low: n[2], close: n[3], volume: n[4]};
  });
  return {rows: sortedUnique(rows, 'NAVER_JSON')};
}
/** 검증기(mergeRollingPrices)가 던질 행은 여기서 미리 걸러 하루 전체가 실패하지 않게 한다. 반환: null(정상) 또는 사유 */
export function rowProblem(p) {
  if (![p.open, p.high, p.low, p.close, p.volume].every(finite)) return 'non_numeric';
  if (p.close <= 0) return 'close_not_positive';
  if (p.volume < 0) return 'volume_negative';
  const halted = p.open === 0 && p.high === 0 && p.low === 0 && p.volume === 0;
  if (!halted && (p.low <= 0 || p.high < p.low || p.open < p.low || p.open > p.high || p.close < p.low || p.close > p.high)) return 'ohlc_inconsistent';
  return null;
}

// ---------- 받기 (재시도 · 시간 제한 · 원문 해시) ----------
const retryableStatus = s => s >= 500 || s === 408 || s === 429;
async function readBody(res) {
  if (typeof res.arrayBuffer === 'function') return Buffer.from(await res.arrayBuffer());
  if (typeof res.text === 'function') return Buffer.from(await res.text(), 'utf8');
  throw Error('RESPONSE_WITHOUT_BODY');
}
function decodeBody(bytes, contentType) {
  const m = /charset=([^;\s]+)/i.exec(contentType ?? ''), charset = (m?.[1] ?? 'utf-8').replace(/^"|"$/g, '').toLowerCase();
  try { return new TextDecoder(charset).decode(bytes); } catch { return bytes.toString('utf8'); }
}
/**
 * fetchWithRetry(url, {fetch, retries=3, backoffMs=[1000,3000,9000], timeoutMs=15000, headers, sleep, wallClock})
 *   → {url, status, bytes, text, rawHash, fetchedAt, attempts:[{attempt, at, status|error, ms}]}   실패하면 Error(FETCH_FAILED) + .attempts
 */
export async function fetchWithRetry(url, {fetch: doFetch = globalThis.fetch, retries = 3, backoffMs = DEFAULT_BACKOFF_MS, timeoutMs = 15000, headers = {}, sleep = defaultSleep, wallClock = () => new Date().toISOString(), userAgent = process.env.ATLAS_COLLECTOR_UA || DEFAULT_UA} = {}) {
  if (typeof doFetch !== 'function') throw Error('FETCH_UNAVAILABLE');
  const attempts = [], host = new URL(url).hostname, base = {'User-Agent': userAgent, Accept: '*/*', ...(host.endsWith('naver.com') ? {Referer: 'https://finance.naver.com/'} : {}), ...headers};
  for (let i = 0; i <= retries; i++) {
    if (i > 0) await sleep(backoffMs[Math.min(i - 1, backoffMs.length - 1)]);
    const at = wallClock(), t0 = Date.now(), ac = new AbortController(), timer = setTimeout(() => ac.abort(Error('TIMEOUT:' + timeoutMs + 'ms')), timeoutMs); // finally 에서 반드시 지운다
    try {
      const res = await doFetch(url, {headers: base, signal: ac.signal, redirect: 'follow'});
      const bytes = await readBody(res), status = res.status ?? (res.ok ? 200 : 0);
      if (!res.ok) { attempts.push({attempt: i + 1, at, status, ms: Date.now() - t0}); if (!retryableStatus(status)) break; continue; }
      attempts.push({attempt: i + 1, at, status, ok: true, bytes: bytes.length, ms: Date.now() - t0});
      const contentType = typeof res.headers?.get === 'function' ? res.headers.get('content-type') : res.headers?.['content-type'];
      return {url, status, bytes, text: decodeBody(bytes, contentType), rawHash: sha256(bytes), fetchedAt: at, attempts};
    } catch (e) {
      attempts.push({attempt: i + 1, at, error: String(e?.message ?? e).slice(0, 200), ms: Date.now() - t0});
    } finally { clearTimeout(timer); }
  }
  const err = Error('FETCH_FAILED:' + url); err.attempts = attempts; throw err;
}
/** 재생(fixture) 모드: <dir>/<symbol>.xml (fchart) · <dir>/<code>.json (api) 를 네트워크 대신 읽는다. 없으면 404 */
export function fixtureFetch(dir) {
  return async url => {
    const u = new URL(url); let file = null;
    if (u.origin === PRIMARY_ORIGIN) file = (u.searchParams.get('symbol') ?? '') + '.xml';
    else if (u.origin === FALLBACK_ORIGIN) { const m = /\/chart\/domestic\/item\/([^/]+)\/day/.exec(u.pathname); if (m) file = decodeURIComponent(m[1]) + '.json'; }
    if (!file || !/^[A-Za-z0-9_.-]+$/.test(file)) return new Response('bad fixture url', {status: 400});
    try { const bytes = await fs.readFile(path.join(dir, file)); return new Response(bytes, {status: 200, headers: {'content-type': file.endsWith('.json') ? 'application/json' : 'text/xml; charset=utf-8'}}); }
    catch (e) { if (e.code === 'ENOENT') return new Response('fixture missing: ' + file, {status: 404}); throw e; }
  };
}

// ---------- 오늘 봉 확정 (두 번 받아 같아야) ----------
/**
 * finalizeToday(first, second, {day, url}) — first/second: {rows, observedAt, rawHash, fetchedAt}
 *   → {final:true, sessionDate, finalizedAt, finalitySourceUrl, finalityBasis, finalityEvidence} | {final:false, reason}
 */
export function finalizeToday(first, second, {day, url}) {
  const a = first?.rows?.find(r => r.date === day);
  if (!a) return {final: false, reason: 'today_bar_absent'};
  if (Date.parse(first.observedAt) < closeInstant(day)) return {final: false, reason: 'before_regular_close'};
  if (!second) return {final: false, reason: 'second_fetch_failed'};
  const b = second.rows?.find(r => r.date === day);
  if (!b) return {final: false, reason: 'today_bar_absent_on_second_fetch'};
  if (Date.parse(second.observedAt) < closeInstant(day)) return {final: false, reason: 'before_regular_close'};
  if (Date.parse(second.observedAt) < Date.parse(first.observedAt)) return {final: false, reason: 'clock_not_monotonic'};
  if (a.close !== b.close || a.volume !== b.volume) return {final: false, reason: 'fetch_mismatch', first: {close: a.close, volume: a.volume}, second: {close: b.close, volume: b.volume}};
  return {final: true, sessionDate: day, finalizedAt: second.observedAt, finalitySourceUrl: url, finalityBasis: FINALITY_BASIS,
    finalityEvidence: {firstObservedAt: first.observedAt, firstFetchedAt: first.fetchedAt ?? null, firstRawHash: first.rawHash, secondObservedAt: second.observedAt, secondFetchedAt: second.fetchedAt ?? null, secondRawHash: second.rawHash, close: b.close, volume: b.volume}};
}

// ---------- 시계 · 동시 실행 ----------
function resolveClock(now) {
  if (typeof now === 'function') return {source: 'injected_function', at: () => toISO(now())};
  if (now != null) { const v = toISO(now); return {source: 'injected_fixed', value: v, at: () => v}; }
  const i = process.argv.indexOf('--now');
  if (i >= 0 && process.argv[i + 1]) { const v = toISO(process.argv[i + 1]); return {source: 'runner_now_argv', value: v, at: () => v}; }
  if (process.env.ATLAS_NOW) { const v = toISO(process.env.ATLAS_NOW); return {source: 'ATLAS_NOW_env', value: v, at: () => v}; }
  return {source: 'wall_clock', at: () => new Date().toISOString()};
}
async function pool(items, limit, worker, {politeDelayMs = 0, sleep = defaultSleep} = {}) {
  const results = new Array(items.length); let next = 0;
  await Promise.all(Array.from({length: Math.max(1, Math.min(limit, items.length))}, async () => {
    while (next < items.length) { const i = next++; results[i] = await worker(items[i], i); if (politeDelayMs > 0 && next < items.length) await sleep(politeDelayMs); }
  }));
  return results;
}
async function loadCalendarSessions(rootDir) {
  try { const c = JSON.parse(await fs.readFile(path.join(rootDir, 'public/data/rolling-calendar.json'), 'utf8')); return Array.isArray(c.sessions) ? c.sessions : null; } catch (e) { if (e.code === 'ENOENT') return null; throw e; }
}

// ---------- 본체 ----------
export async function collect(input, window, options = {}) {
  const startedAt = new Date().toISOString(), t0 = Date.now();
  if (!input || !Array.isArray(input.assets)) throw Error('COLLECTOR_INPUT_ASSETS');
  if (!window || !/^\d{4}-\d{2}-\d{2}$/.test(window.day ?? '')) throw Error('COLLECTOR_WINDOW_DAY');
  const opt = {count: Number(process.env.ATLAS_COLLECTOR_COUNT) || 30, retries: 3, backoffMs: DEFAULT_BACKOFF_MS, timeoutMs: 15000, concurrency: 4, politeDelayMs: 150, finalityDelayMs: 90000, doubleFetchAfterDeadline: true, market: ['KOSPI'], rootDir: process.cwd(), ...Object.fromEntries(Object.entries(options).filter(([, v]) => v !== undefined))};
  const sleep = opt.sleep ?? defaultSleep, clock = resolveClock(opt.now), wallClock = opt.wallClock ?? (() => new Date().toISOString());
  const fixtureDir = opt.fixtureDir ?? process.env.ATLAS_COLLECTOR_FIXTURE ?? null;
  const doFetch = opt.fetch ?? (fixtureDir ? fixtureFetch(fixtureDir) : globalThis.fetch);
  const mode = opt.fetch ? 'injected_fetch' : fixtureDir ? 'fixture' : 'network';
  const sessionList = opt.sessions ?? opt.calendar?.sessions ?? (await loadCalendarSessions(opt.rootDir)) ?? input.calendar?.sessions;
  if (!Array.isArray(sessionList) || !sessionList.length) throw Error('COLLECTOR_CALENDAR_SESSIONS');
  const sessions = new Set(sessionList), day = window.day, cutoff = window.cutoff ?? null;
  const todayRequired = window.session === true && window.afterClose === true && cutoff === day && sessions.has(day);
  const codes = (opt.codes ?? input.assets.map(a => a.code)).filter(c => /^\d{6}$/.test(String(c)));
  const errors = [], warnings = [], marketErrors = [], observations = [], marketObservations = [], lastGoodDate = {};
  const stats = {stocks: codes.length, succeeded: 0, failed: 0, delayedFinality: 0, finalizedToday: 0, droppedNonSessionRows: 0, droppedIncompleteRows: 0, droppedInvalidRows: 0, reviewedRowMismatches: 0, requests: 0, durationMs: 0};
  const reviewedOf = code => new Map((input.assets.find(a => a.code === code)?.prices ?? []).filter(p => p?.priceBasis === 'KRX_REGULAR').map(p => [p.date, p]));
  const startDay = sessionList.filter(d => d <= day).slice(-Math.max(1, opt.count))[0] ?? day;
  const fetchOpts = {fetch: doFetch, retries: opt.retries, backoffMs: opt.backoffMs, timeoutMs: opt.timeoutMs, sleep, wallClock, headers: opt.headers, userAgent: opt.userAgent};
  const get = async url => { try { return await fetchWithRetry(url, fetchOpts); } finally { stats.requests += 1; } };
  /** 행 거르기: 달력 거래일 · cutoff 이하 · 검증기가 받을 수 있는 값 */
  const filterRows = (rows, code) => {
    const kept = [], nonSession = [], incomplete = [], invalid = [], mismatched = [], reviewed = reviewedOf(code);
    for (const r of rows) {
      if (!sessions.has(r.date)) { nonSession.push(r.date); continue; }
      if (cutoff == null || r.date > cutoff) { incomplete.push(r.date); continue; }
      const problem = rowProblem(r); if (problem) { invalid.push({date: r.date, problem}); continue; }
      const stored = reviewed.get(r.date);
      if (stored && stored.close !== r.close) { mismatched.push({date: r.date, storedClose: stored.close, fetchedClose: r.close, storedSourceUrl: stored.sourceUrl ?? null}); continue; }
      kept.push({date: r.date, open: r.open, high: r.high, low: r.low, close: r.close, volume: r.volume});
    }
    stats.droppedNonSessionRows += nonSession.length; stats.droppedIncompleteRows += incomplete.length; stats.droppedInvalidRows += invalid.length; stats.reviewedRowMismatches += mismatched.length;
    if (nonSession.length) warnings.push({code: 'NON_SESSION_ROWS', stockCode: code, dates: nonSession});
    if (invalid.length) warnings.push({code: 'ROW_INVALID', stockCode: code, rows: invalid});
    if (mismatched.length) errors.push({code: 'REVIEWED_ROW_MISMATCH', stockCode: code, rows: mismatched, message: '저장된 검토 종가(KRX_REGULAR)와 다름 · 그 날짜 행은 넘기지 않음 · 사람이 두 원천을 대조할 것'});
    return {kept, todayInvalid: invalid.find(x => x.date === day) ?? mismatched.find(x => x.date === day) ?? null};
  };
  const sources = code => [
    {name: 'fchart', url: fchartUrl(code, opt.count), parse: t => parseFchartXml(t).rows},
    {name: 'naver_api', url: naverDayUrl(code, startDay, day), parse: t => parseNaverDayJson(t).rows}];
  /** 한 원천을 받아 해석까지 — 실패 사유를 attempts 에 남긴다 */
  const fetchParsed = async source => {
    const got = await get(source.url), observedAt = clock.at();
    let rows; try { rows = source.parse(got.text); } catch (e) { const err = Error('PARSE_FAILED:' + e.message); err.attempts = [...got.attempts, {parseError: String(e.message).slice(0, 200)}]; throw err; }
    if (!rows.length) { const err = Error('EMPTY_ROWS'); err.attempts = [...got.attempts, {parseError: 'EMPTY_ROWS'}]; throw err; }
    return {source, rows, observedAt, fetchedAt: got.fetchedAt, rawHash: got.rawHash, status: got.status, attempts: got.attempts};
  };
  // 1단계: 종목마다 첫 수신 (원천 순서대로 · 종목 실패는 격리)
  const first = await pool(codes, opt.concurrency, async code => {
    const tried = [];
    for (const source of sources(code)) {
      try { const r = await fetchParsed(source); tried.push({source: source.name, url: source.url, ok: true, attempts: r.attempts}); return {code, ok: true, ...r, tried}; }
      catch (e) { tried.push({source: source.name, url: source.url, ok: false, error: String(e.message).slice(0, 200), attempts: e.attempts ?? []}); }
    }
    return {code, ok: false, tried};
  }, {politeDelayMs: opt.politeDelayMs, sleep});
  // 지수(기록용 · 실패해도 계속)
  for (const symbol of opt.market ?? []) {
    try {
      const got = await get(fchartUrl(symbol, opt.count)), observedAt = clock.at(), parsed = parseFchartXml(got.text);
      const rows = parsed.rows.filter(r => sessions.has(r.date) && cutoff != null && r.date <= cutoff);
      marketObservations.push({symbol, name: parsed.name ?? null, provider: PROVIDER, sourceUrl: got.url, rawHash: got.rawHash, observedAt, fetchedAt: got.fetchedAt, rows, droppedRows: parsed.rows.length - rows.length});
    } catch (e) { marketErrors.push({code: 'MARKET_FETCH_FAILED', symbol, message: String(e.message).slice(0, 200), attempts: e.attempts ?? []}); }
  }
  // 2단계: 오늘 봉이 있고 확정이 필요한 종목만 잠시 뒤 같은 원천을 한 번 더
  const needSecond = first.filter(r => r.ok && todayRequired && r.rows.some(x => x.date === day) && Date.parse(r.observedAt) >= closeInstant(day) && (opt.doubleFetchAfterDeadline || Date.parse(r.observedAt) < deadlineInstant(day)));
  const second = new Map();
  if (needSecond.length) {
    if (opt.finalityDelayMs > 0) await sleep(opt.finalityDelayMs);
    await pool(needSecond, opt.concurrency, async r => {
      try { second.set(r.code, await fetchParsed(r.source)); }
      catch (e) { second.set(r.code, {failed: true, error: String(e.message).slice(0, 200), attempts: e.attempts ?? []}); }
    }, {politeDelayMs: opt.politeDelayMs, sleep});
  }
  // 조립
  for (const r of first) {
    if (!r.ok) { stats.failed += 1; lastGoodDate[r.code] = null; errors.push({code: 'FETCH_FAILED', stockCode: r.code, message: '모든 원천 실패', tried: r.tried}); continue; }
    let chosen = r, finality = null, todayError = null;
    const hasToday = r.rows.some(x => x.date === day);
    if (todayRequired) {
      if (!hasToday) todayError = 'today_bar_absent';
      else if (Date.parse(r.observedAt) < closeInstant(day)) todayError = 'before_regular_close';
      else if (needSecond.includes(r)) {
        const s = second.get(r.code), f = finalizeToday(r, s?.failed ? null : s, {day, url: r.source.url});
        if (f.final) { chosen = s; finality = f; } else { todayError = f.reason; if (f.reason === 'fetch_mismatch') finality = f; }
      } // else: 16:00 이후 + doubleFetchAfterDeadline=false → 시각만으로 검증기가 받는다(증거 없음)
    }
    const {kept, todayInvalid} = filterRows(chosen.rows, r.code);
    if (todayRequired && !todayError && todayInvalid) todayError = 'today_row_invalid:' + (todayInvalid.problem ?? 'reviewed_row_mismatch');
    const rows = todayError ? kept.filter(x => x.date !== day) : kept;
    if (todayRequired && todayError) { stats.delayedFinality += 1; errors.push({code: 'TODAY_NOT_FINAL', stockCode: r.code, reason: todayError, ...(finality?.reason === 'fetch_mismatch' ? {first: finality.first, second: finality.second} : {}), message: `오늘(${day}) 봉 미확정 · ${todayError}`}); }
    if (!rows.length) { stats.failed += 1; lastGoodDate[r.code] = null; errors.push({code: 'NO_USABLE_ROWS', stockCode: r.code, message: '거를 뒤 남은 행 없음'}); continue; }
    stats.succeeded += 1; lastGoodDate[r.code] = rows.at(-1).date;
    const o = {code: r.code, provider: PROVIDER, source: chosen.source.name, sourceUrl: chosen.source.url, rawHash: chosen.rawHash, observedAt: chosen.observedAt, fetchedAt: chosen.fetchedAt, rows, adjustmentsVerified: false, fetchAttempts: r.tried};
    if (finality?.final && !todayError) { stats.finalizedToday += 1; Object.assign(o, {finalClose: true, sessionDate: finality.sessionDate, finalizedAt: finality.finalizedAt, finalitySourceUrl: finality.finalitySourceUrl, finalityBasis: finality.finalityBasis, finalityEvidence: finality.finalityEvidence}); }
    observations.push(o);
  }
  stats.durationMs = Date.now() - t0;
  return {attempted: true, provider: PROVIDER, mode, clock: {source: clock.source, value: clock.value ?? null}, window: {day, cutoff, session: window.session === true, afterClose: window.afterClose === true, todayRequired},
    observations, marketObservations, errors, warnings, marketErrors, stats, lastGoodDate, delayed: stats.delayedFinality > 0, startedAt, finishedAt: new Date().toISOString()};
}

// ---------- CLI ----------
if (process.argv[1] && path.resolve(process.argv[1]) === new URL(import.meta.url).pathname) {
  const arg = name => { const i = process.argv.indexOf(name); return i < 0 ? null : process.argv[i + 1]; };
  const rootDir = path.resolve(arg('--root') ?? process.cwd()), now = arg('--now') ?? new Date().toISOString();
  const {rollingOperationWindow} = await import(pathToFileURL(path.join(rootDir, 'lib/rolling-operation.mjs')).href);
  const input = JSON.parse(await fs.readFile(path.join(rootDir, 'public/data/input.json'), 'utf8'));
  let calendar = null; try { calendar = JSON.parse(await fs.readFile(path.join(rootDir, 'public/data/rolling-calendar.json'), 'utf8')); } catch (e) { if (e.code !== 'ENOENT') throw e; }
  const window = rollingOperationWindow(input, toISO(now), {calendar: calendar ?? input.calendar, runEndDate: null});
  const num = name => arg(name) == null ? undefined : Number(arg(name));
  const result = await collect(input, window, {now: toISO(now), rootDir, calendar: calendar ?? input.calendar, fixtureDir: arg('--fixture') ?? undefined, count: num('--count'), codes: arg('--codes')?.split(',').map(s => s.trim()) ?? undefined, market: process.argv.includes('--no-market') ? [] : undefined,
    finalityDelayMs: num('--finality-delay-ms'), politeDelayMs: num('--polite-delay-ms'), concurrency: num('--concurrency')});
  if (arg('--out')) { await fs.mkdir(path.dirname(path.resolve(arg('--out'))), {recursive: true}); await fs.writeFile(path.resolve(arg('--out')), JSON.stringify(result, null, 2)); }
  console.log(JSON.stringify(result));
  process.exitCode = result.errors.length ? 2 : 0;
}
