#!/usr/bin/env node
/**
 * ATLAS 4시간 엔진 · 1단계 자료 모으기 (기획안 1단계 「지난 3년 자료를 받아 온다」)
 *   node atlas4h/collect/collect.mjs --mode history|now [--fixtures DIR] [--root DIR] [--now ISO]
 *
 * history — 코스피·반도체지수·S&P500·VIX·원달러·WTI·브렌트의 지난 3년 날마다 값.
 *           출처가 둘이면 둘 다 받아 날짜마다 맞춰 본다 → atlas4h/data/history/<id>.json
 * now     — 변수 열다섯의 지금 값 한 장(4시간 고리용) → atlas4h/ledger/inputs/YYYY-MM-DDTHH-mm.json (이름은 한국 시각)
 * 둘 다   — 받은 원문 그대로 gzip 으로 atlas4h/raw/<날짜>/ 에 두고 sha256 을 값 옆에 적는다.
 *           한 번 돌 때마다 atlas4h/ledger/collect/YYYY-MM-DD.jsonl 에 한 줄을 덧붙인다(고치지 않음).
 *
 * 지키는 것(자료 약속 atlas4h/data/contract.md)
 *   - 값마다 observedAt(값이 생긴 때) · fetchedAt(받은 때) · 출처 주소 · 원문 sha256
 *   - 두 출처가 허용 폭 안 → 'ok' · 하나뿐 → '한 출처' · 허용 폭 밖 → '확인 중'(값은 null, 안 씀)
 *   - 4시간 넘은 값 → '옛값'(까닭 '장 닫힘' 또는 '끊김') · 값이 없으면 '없음'(null) — 0 이나 앞 값으로 채우지 않는다
 *   - 열쇠(ATLAS4H_*_KEY)는 있을 때만 쓰고, 주소·기록·화면 어디에도 적지 않는다
 * ATLAS 11 파일은 읽기만 한다(해석기를 가져다 쓴다).
 */
import fs from 'node:fs/promises';
import path from 'node:path';
import zlib from 'node:zlib';
import {promisify} from 'node:util';
import {fileURLToPath} from 'node:url';
import {parseFredCSV, parseNaverSeries, parseIndexPrices, parseDisclosures, FRED_UA, num, sha256} from '../../lib/atlas11/context.mjs';

const gzip = promisify(zlib.gzip);
const REPO = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0 Safari/537.36';
export const STALE_HOURS = 4;
export const HISTORY_YEARS = 3;
export const STATUS = Object.freeze({OK: 'ok', ONE: '한 출처', CHECK: '확인 중', OLD: '옛값', NONE: '없음'});

// ── 시각 ─────────────────────────────────────────────────────────────────────
/** 그 시간대에서 그 순간의 UTC 차이(분) */
function tzOffsetMinutes(utcMs, tz) {
  const p = Object.fromEntries(new Intl.DateTimeFormat('en-US', {timeZone: tz, hourCycle: 'h23', year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit'}).formatToParts(new Date(utcMs)).map(x => [x.type, x.value]));
  return (Date.UTC(+p.year, +p.month - 1, +p.day, +p.hour, +p.minute, +p.second) - utcMs) / 60000;
}
/** 「그 시간대의 그 날짜 그 시각」 → UTC ISO (서머타임을 따진다) */
export function zonedToUTC(date, hms, tz) {
  const [h, m, s = 0] = hms.split(':').map(Number);
  const guess = Date.UTC(+date.slice(0, 4), +date.slice(5, 7) - 1, +date.slice(8, 10), h, m, s);
  let t = guess - tzOffsetMinutes(guess, tz) * 60000;
  const off2 = tzOffsetMinutes(t, tz); t = guess - off2 * 60000;
  return new Date(t).toISOString();
}
export const kstParts = at => { const d = new Date(Date.parse(at) + 9 * 3600000).toISOString(); return {day: d.slice(0, 10), hm: d.slice(11, 16), stamp: `${d.slice(0, 10)}T${d.slice(11, 13)}-${d.slice(14, 16)}`}; };
const ymd = d => d.replaceAll('-', '');
const minIso = (a, b) => (Date.parse(a) <= Date.parse(b) ? new Date(Date.parse(a)).toISOString() : new Date(Date.parse(b)).toISOString());

/** 날짜만 있는 값은 그 시장 마감 시각으로 본다(약속 10). 원달러는 하루 여러 번 고시라 「그날 가장 늦은 때」. 브렌트 19:30 런던은 [가정] */
export const CLOSE_AT = Object.freeze({
  kospi: {tz: 'Asia/Seoul', hms: '15:30:00'},
  sox: {tz: 'America/New_York', hms: '16:00:00'},
  sp500: {tz: 'America/New_York', hms: '16:00:00'},
  vix: {tz: 'America/New_York', hms: '16:15:00'},
  usdkrw: {tz: 'Asia/Seoul', hms: '23:59:59'},
  wti: {tz: 'America/Chicago', hms: '16:00:00'},
  brent: {tz: 'Europe/London', hms: '19:30:00'},
});
export const closeAt = (id, date) => zonedToUTC(date, CLOSE_AT[id].hms, CLOSE_AT[id].tz);

// ── 받기: 15초 · 재시도 1번 · 한 곳 8번 연속 실패면 건너뜀 (ATLAS 11 makeFetcher 방식을 본뜸) ──────────────
/** 열쇠는 주소에서 '{KEY}' 로 바꿔 적는다 — 기록·원문 보관·오류 문구 모두 이 주소만 쓴다 */
export function redact(text, secrets) { let s = String(text); for (const k of secrets) if (k) s = s.split(k).join('{KEY}'); return s; }

export function makeFetcher({fixtures = null, timeoutMs = 15000, retries = 1, breakerAfter = 8, fetchImpl = globalThis.fetch, fixedFetchedAt = null, secrets = []} = {}) {
  const failures = new Map(), raw = new Map();
  let fixtureMap = null;
  const get = async (url, {ua = UA, headers = {}} = {}) => {
    const shown = redact(url, secrets), host = new URL(url).hostname;
    if ((failures.get(host) ?? 0) >= breakerAfter) return {ok: false, url: shown, error: 'SOURCE_CIRCUIT_OPEN', attempts: []};
    if (fixtures) {
      fixtureMap ??= JSON.parse(await fs.readFile(path.join(fixtures, 'urls.json'), 'utf8'));
      const f = fixtureMap[shown];
      if (!f) { failures.set(host, (failures.get(host) ?? 0) + 1); return {ok: false, url: shown, error: 'FIXTURE_MISSING', attempts: [{attempt: 1, status: 0}]}; }
      const buf = await fs.readFile(path.join(fixtures, f));
      const out = {ok: true, url: shown, buf, text: buf.toString('utf8'), rawSha256: sha256(buf), fetchedAt: fixedFetchedAt ?? new Date().toISOString(), attempts: [{attempt: 1, status: 200}]};
      raw.set(shown, out); failures.set(host, 0); return out;
    }
    const attempts = [];
    for (let k = 0; k <= retries; k++) {
      const t = Date.now();
      try {
        const res = await fetchImpl(url, {headers: {'User-Agent': ua, Accept: '*/*', Referer: host.endsWith('naver.com') ? 'https://m.stock.naver.com/' : `https://${host}/`, ...headers}, signal: AbortSignal.timeout(timeoutMs)});
        const buf = Buffer.from(await res.arrayBuffer()); attempts.push({attempt: k + 1, status: res.status, ms: Date.now() - t});
        if (res.ok) { const out = {ok: true, url: shown, buf, text: buf.toString('utf8'), rawSha256: sha256(buf), fetchedAt: new Date().toISOString(), attempts}; raw.set(shown, out); failures.set(host, 0); return out; }
        if (res.status === 404 || res.status === 410) break;
      } catch (e) { attempts.push({attempt: k + 1, status: 0, ms: Date.now() - t, error: redact(String(e.message), secrets).slice(0, 120)}); }
      if (k < retries) await new Promise(r => setTimeout(r, 1500 * (k + 1)));
    }
    failures.set(host, (failures.get(host) ?? 0) + 1);
    return {ok: false, url: shown, error: 'FETCH_FAILED', attempts};
  };
  return {get, raw};
}

async function pool(items, n, fn) { const out = new Array(items.length); let i = 0; await Promise.all(Array.from({length: Math.min(n, items.length)}, async () => { while (i < items.length) { const k = i++; out[k] = await fn(items[k], k); } })); return out; }

// ── 해석기 (ATLAS 11 것을 쓰고, 시각이 필요한 곳만 덧붙임) ─────────────────────────────────────
/** 네이버 시장지표·해외지수: parseNaverSeries 의 날짜·값 + 원문 localTradedAt 의 시각(있으면 UTC 로) */
export function parseNaverStamped(text) {
  const rows = parseNaverSeries(text), raw = JSON.parse(text), arr = Array.isArray(raw) ? raw : raw.result, stamp = new Map();
  for (const r of arr) { const s = String(r?.localTradedAt ?? ''), d = s.slice(0, 10); if (!stamp.has(d)) stamp.set(d, /T\d{2}:\d{2}(:\d{2})?([+-]\d{2}:\d{2}|Z)$/.test(s) && Number.isFinite(Date.parse(s)) ? new Date(Date.parse(s)).toISOString() : null); }
  return rows.map(r => ({date: r.date, value: r.value, stampedAt: stamp.get(r.date) ?? null}));
}
export const parseKospiPage = text => parseIndexPrices(text, 'KOSPI').rows.map(r => ({date: r.date, value: r.close, stampedAt: null}));
export const parseFred = (text, id) => parseFredCSV(text, id).map(r => ({date: r.date, value: r.value, stampedAt: null}));
/** KRX Open API 지수 일별 — 필드 이름은 2차 자료(variables.json). 꼴이 다르면 오류로 끊김 처리 */
export function parseKrxIndex(text, name = '코스피') {
  const d = JSON.parse(text), arr = d?.OutBlock_1; if (!Array.isArray(arr)) throw Error('SHAPE_KRX');
  const out = [];
  for (const r of arr) { if (r?.IDX_NM !== name) continue; const m = String(r.BAS_DD ?? '').match(/^(\d{4})(\d{2})(\d{2})$/); const v = num(r.CLSPRC_IDX); if (m && v != null) out.push({date: `${m[1]}-${m[2]}-${m[3]}`, value: v, stampedAt: null}); }
  return out;
}
/** 한국은행 ECOS StatisticSearch — row[].TIME(YYYYMMDD) · row[].DATA_VALUE */
export function parseEcos(text) {
  const d = JSON.parse(text);
  if (!d?.StatisticSearch) { if (d?.RESULT?.CODE === 'INFO-200') return {total: 0, rows: []}; throw Error('SHAPE_ECOS ' + String(d?.RESULT?.CODE ?? '')); }
  const rows = [];
  for (const r of d.StatisticSearch.row ?? []) { const m = String(r?.TIME ?? '').match(/^(\d{4})(\d{2})(\d{2})$/); const v = num(r?.DATA_VALUE); if (m && v != null) rows.push({date: `${m[1]}-${m[2]}-${m[3]}`, value: v, stampedAt: null}); }
  return {total: Number(d.StatisticSearch.list_total_count ?? rows.length), rows};
}
/** 네이버 분봉: 그날(day) 15:30:00 이하 봉 가운데 가장 늦은 것 */
export function pickMinuteBar(text, day) {
  const arr = JSON.parse(text); if (!Array.isArray(arr)) throw Error('SHAPE_MINUTE');
  let best = null;
  for (const b of arr) { const s = String(b?.localDateTime ?? ''); if (!/^\d{14}$/.test(s) || s.slice(0, 8) !== ymd(day) || s.slice(8) > '153000') continue; const v = num(b.currentPrice); if (v == null || v <= 0) continue; if (!best || s > best.at) best = {at: s, value: v}; }
  if (!best) return null;
  const hms = `${best.at.slice(8, 10)}:${best.at.slice(10, 12)}:${best.at.slice(12, 14)}`;
  return {value: best.value, observedAt: zonedToUTC(day, hms, 'Asia/Seoul'), closingAuction: best.at.slice(8) === '153000', barTime: hms};
}
/** 네이버 실시간(polling): 맨 위 값(KRX) 의 거래대금 원값 · 거래 상태 */
export function parsePolling(text, code) {
  const d = JSON.parse(text), x = d?.datas?.[0]; if (!x) throw Error('SHAPE_POLLING');
  if (x.itemCode !== code) throw Error('CODE_MISMATCH');
  const s = String(x.localTradedAt ?? '');
  return {tradingValue: /^\d+$/.test(String(x.accumulatedTradingValueRaw ?? '')) ? Number(x.accumulatedTradingValueRaw) : null, closePrice: num(x.closePrice), marketStatus: x.marketStatus ?? null, tradeStop: x.tradeStopType?.name ?? null, observedAt: Number.isFinite(Date.parse(s)) ? new Date(Date.parse(s)).toISOString() : null};
}

// ── 맞춰 보기 ─────────────────────────────────────────────────────────────────
/** 허용 폭 안인가 — relative: |첫째−둘째| ÷ |첫째| ≤ 폭 · exact: 같아야 함 */
export function within(a, b, compare) {
  if (a == null || b == null) return null;
  if (compare.rule === 'exact') return a === b;
  return Math.abs(a - b) / Math.abs(a) <= compare.tolerance;
}
/** 날짜마다 두 출처 맞대기 — 있는 날짜만 · 비면 비운 채(0·앞 값으로 채우지 않음) */
export function mergeSeries(first, second, compare) {
  const A = new Map(first.rows.map(r => [r.date, r.value])), B = new Map((second?.rows ?? []).map(r => [r.date, r.value]));
  const dates = [...new Set([...A.keys(), ...B.keys()])].sort();
  return dates.map(date => {
    const a = A.get(date), b = B.get(date), sources = {};
    if (a != null) sources[first.name] = a;
    if (b != null) sources[second.name] = b;
    if (a != null && b != null) { const ok = within(a, b, compare); return {date, value: ok ? a : null, sources, status: ok ? STATUS.OK : STATUS.CHECK}; }
    return {date, value: a ?? b, sources, status: STATUS.ONE};
  });
}

/**
 * 지금 값 하나 — 첫째의 가장 늦은 값 · 같은 날짜 둘째로 맞춤 · 4시간 넘으면 옛값 · 둘 다 없으면 앞 장의 값(옛값·끊김) 또는 없음
 * first/second = {name, url, ok, rows:[{date,value,observedAt}], rawSha256, fetchedAt, error}
 */
export function buildVariable({id, first, second = null, compare, at, previous = null, staleHours = STALE_HOURS}) {
  const out = {id, value: null, observedAt: null, fetchedAt: null, status: STATUS.NONE, marks: [], reason: null, sources: []};
  const src = (s, row) => ({name: s.name, url: s.url, value: row?.value ?? null, observedAt: row?.observedAt ?? null, fetchedAt: s.fetchedAt ?? null, rawSha256: s.rawSha256 ?? null, ...(s.ok ? {} : {error: s.error ?? 'FETCH_FAILED'})});
  // 쓸 수 있는 값 = 받은 때보다 늦지 않은 값(날짜만 있는 오늘 값은 observedAt = 받은 때)
  const usable = s => s && s.ok && s.rows?.length ? s.rows.filter(r => r.observedAt && Date.parse(r.observedAt) <= Math.max(Date.parse(at), Date.parse(s.fetchedAt ?? at))) : [];
  const A = usable(first), B = usable(second);
  const latestA = A.at(-1) ?? null, latestB = B.at(-1) ?? null;
  if (latestA) {
    const sameB = B.find(r => r.date === latestA.date) ?? null;
    out.value = latestA.value; out.observedAt = latestA.observedAt; out.fetchedAt = first.fetchedAt;
    out.sources.push(src(first, latestA));
    if (second) out.sources.push(src(second, sameB ?? latestB));
    if (sameB) {
      if (within(latestA.value, sameB.value, compare)) out.status = STATUS.OK;
      else { out.status = STATUS.CHECK; out.marks.push(STATUS.CHECK); out.reason = `두 출처가 ${latestA.date} 값에서 허용 폭(${compare.rule} ${compare.tolerance})을 넘게 다름 — 이 고리에서 쓰지 않음`; out.value = null; }
    } else {
      out.status = STATUS.ONE; out.marks.push(STATUS.ONE);
      if (second && latestB) { const a = A.find(r => r.date === latestB.date); if (a) out.lateCheck = {date: latestB.date, first: a.value, second: latestB.value, agree: within(a.value, latestB.value, compare)}; }
      out.reason = second ? (second.ok ? `둘째 출처에 ${latestA.date} 값이 아직 없음` : `둘째 출처 끊김(${second.error ?? 'FETCH_FAILED'})`) : '둘째 출처 없음';
    }
  } else if (latestB) {
    out.value = latestB.value; out.observedAt = latestB.observedAt; out.fetchedAt = second.fetchedAt; out.status = STATUS.ONE; out.marks.push(STATUS.ONE);
    out.reason = `첫째 출처 끊김(${first?.error ?? '값 없음'}) — 둘째 값을 한 출처로 씀`;
    if (first) out.sources.push(src(first, null));
    out.sources.push(src(second, latestB));
  } else {
    if (first) out.sources.push(src(first, null));
    if (second) out.sources.push(src(second, null));
    if (previous && previous.value != null && previous.observedAt) {
      out.value = previous.value; out.observedAt = previous.observedAt; out.fetchedAt = previous.fetchedAt ?? null; out.status = STATUS.OLD; out.marks.push(STATUS.OLD, '끊김');
      out.reason = '두 출처 모두 끊김 — 앞 장의 값을 옛값으로 둠'; out.carriedFrom = previous.file ?? null;
      return out;
    }
    out.status = STATUS.NONE; out.marks.push(STATUS.NONE); out.reason = first || second ? '두 출처 모두 값을 못 받음' : '출처 없음';
    return out;
  }
  if (out.value != null && Date.parse(at) - Date.parse(out.observedAt) > staleHours * 3600000) {
    out.status = STATUS.OLD; out.marks.unshift(STATUS.OLD); out.marks.push('장 닫힘');
    out.reason = `값이 생긴 지 ${staleHours}시간 넘음(장 닫힘)` + (out.reason ? ' · ' + out.reason : '');
  }
  return out;
}

// ── 출처 목록 ─────────────────────────────────────────────────────────────────
const naverPaged = {
  kospi: p => `https://m.stock.naver.com/api/index/KOSPI/price?pageSize=10&page=${p}`,
  sox: p => `https://api.stock.naver.com/index/.SOX/price?page=${p}&pageSize=10`,
  sp500: p => `https://api.stock.naver.com/index/.INX/price?page=${p}&pageSize=10`,
  vix: p => `https://api.stock.naver.com/index/.VIX/price?page=${p}&pageSize=10`,
  usdkrw: p => `https://api.stock.naver.com/marketindex/exchange/FX_USDKRW/prices?page=${p}&pageSize=10`,
  wti: p => `https://api.stock.naver.com/marketindex/energy/CLcv1/prices?page=${p}&pageSize=10`,
};
const fredId = {sp500: 'SP500', vix: 'VIXCLS', wti: 'DCOILWTICO', brent: 'DCOILBRENTEU'};
export const fredURL = (id, from) => `https://fred.stlouisfed.org/graph/fredgraph.csv?id=${id}&cosd=${from}`;
export const krxKospiURL = date => `https://data-dbg.krx.co.kr/svc/apis/idx/kospi_dd_trd?basDd=${ymd(date)}`;
export const ecosURL = (key, from, to, a, b) => `https://ecos.bok.or.kr/api/StatisticSearch/${key}/json/kr/${a}/${b}/731Y001/D/${ymd(from)}/${ymd(to)}/0000001`;
export const HISTORY_IDS = ['kospi', 'sox', 'sp500', 'vix', 'usdkrw', 'wti', 'brent'];
const parseFirst = id => (id === 'kospi' ? parseKospiPage : parseNaverStamped);
/** 날짜만 있는 값의 observedAt — 시각이 찍힌 값은 그 시각, 아니면 그 시장 마감(받은 때보다 늦을 수는 없음) */
const withObserved = (id, rows, fetchedAt) => rows.map(r => ({...r, observedAt: r.stampedAt ?? minIso(closeAt(id, r.date), fetchedAt)}));

function readVariables(rootDir) { return readJSONFirst([path.join(rootDir, 'atlas4h/data/variables.json'), path.join(REPO, 'atlas4h/data/variables.json')]); }
async function readJSONFirst(files) { for (const f of files) { try { return JSON.parse(await fs.readFile(f, 'utf8')); } catch (e) { if (e.code !== 'ENOENT') throw e; } } throw Error('NOT_FOUND ' + files.at(-1)); }

// ── history ──────────────────────────────────────────────────────────────────
/** 네이버 쪽 넘기기(10줄씩): 가장 오래된 날짜가 시작일보다 앞서거나, 빈 쪽이거나, 같은 쪽이 되풀이되거나, 못 받으면 멈춤 */
async function naverPages(f, id, start, {maxPages = 90, errors}) {
  const pages = [], rows = new Map();
  for (let p = 1; p <= maxPages; p++) {
    const r = await f.get(naverPaged[id](p));
    if (!r.ok) { errors.push({variable: id, source: 'naver', url: r.url, error: r.error}); break; }
    let got; try { got = parseFirst(id)(r.text); } catch (e) { errors.push({variable: id, source: 'naver', url: r.url, error: String(e.message)}); break; }
    pages.push({url: r.url, rawSha256: r.rawSha256, fetchedAt: r.fetchedAt, rows: got.length});
    if (!got.length) break;
    const fresh = got.filter(x => !rows.has(x.date));
    if (!fresh.length) { errors.push({variable: id, source: 'naver', url: r.url, error: 'PAGE_REPEAT'}); break; }
    for (const x of fresh) rows.set(x.date, x);
    if (got[0].date < start) break;
  }
  const fetchedAt = pages.at(-1)?.fetchedAt ?? null;
  return {name: 'naver', url: naverPaged[id](1), ok: pages.length > 0, pages, rawSha256: pages.length ? sha256(JSON.stringify(pages.map(p => p.rawSha256))) : null, fetchedAt, rows: [...rows.values()].sort((a, b) => a.date.localeCompare(b.date))};
}
async function fredSeries(f, id, from, errors) {
  const r = await f.get(fredURL(fredId[id], from), {ua: FRED_UA});
  if (!r.ok) { errors.push({variable: id, source: 'fred', url: r.url, error: r.error}); return {name: 'fred', url: r.url, ok: false, error: r.error, rows: []}; }
  try { return {name: 'fred', url: r.url, ok: true, rawSha256: r.rawSha256, fetchedAt: r.fetchedAt, rows: parseFred(r.text, fredId[id])}; }
  catch (e) { errors.push({variable: id, source: 'fred', url: r.url, error: String(e.message)}); return {name: 'fred', url: r.url, ok: false, error: String(e.message), rows: []}; }
}
async function krxKospi(f, dates, key, errors) {
  const pages = [], rows = [];
  await pool(dates, 4, async d => {
    const r = await f.get(krxKospiURL(d), {headers: {AUTH_KEY: key}});
    if (!r.ok) { errors.push({variable: 'kospi', source: 'krx', url: r.url, error: r.error}); return; }
    try { rows.push(...parseKrxIndex(r.text)); pages.push({url: r.url, rawSha256: r.rawSha256, fetchedAt: r.fetchedAt}); }
    catch (e) { errors.push({variable: 'kospi', source: 'krx', url: r.url, error: String(e.message)}); }
  });
  pages.sort((a, b) => a.url.localeCompare(b.url)); rows.sort((a, b) => a.date.localeCompare(b.date));
  return {name: 'krx', url: krxKospiURL(dates[0] ?? '2000-01-01').replace(/basDd=\d+/, 'basDd={YYYYMMDD}'), ok: pages.length > 0, pages, rawSha256: pages.length ? sha256(JSON.stringify(pages.map(p => p.rawSha256))) : null, fetchedAt: pages.at(-1)?.fetchedAt ?? null, rows};
}
async function ecosUsdkrw(f, key, from, to, errors) {
  const rows = [], pages = [];
  for (let a = 1; a < 100000; a += 1000) {
    const r = await f.get(ecosURL(key, from, to, a, a + 999));
    if (!r.ok) { errors.push({variable: 'usdkrw', source: 'ecos', url: r.url, error: r.error}); break; }
    let got; try { got = parseEcos(r.text); } catch (e) { errors.push({variable: 'usdkrw', source: 'ecos', url: r.url, error: redact(String(e.message), [key])}); break; }
    pages.push({url: r.url, rawSha256: r.rawSha256, fetchedAt: r.fetchedAt}); rows.push(...got.rows);
    if (a + 999 >= got.total || !got.rows.length) break;
  }
  rows.sort((x, y) => x.date.localeCompare(y.date));
  return {name: 'ecos', url: pages[0]?.url ?? redact(ecosURL(key, from, to, 1, 1000), [key]), ok: pages.length > 0, pages, rawSha256: pages.length ? sha256(JSON.stringify(pages.map(p => p.rawSha256))) : null, fetchedAt: pages.at(-1)?.fetchedAt ?? null, rows};
}

export async function collectHistory({at, rootDir, f, keys, errors}) {
  const vars = await readVariables(rootDir), byId = Object.fromEntries(vars.variables.map(v => [v.id, v]));
  const today = kstParts(at).day, start = new Date(Date.parse(at) - (HISTORY_YEARS * 365 + 7) * 864e5).toISOString().slice(0, 10);
  const closed = (id, rows) => rows.filter(r => r.date >= start && Date.parse(closeAt(id, r.date)) <= Date.parse(at));
  const written = {}, perVariable = {};
  await pool(HISTORY_IDS, 3, async id => {
    const srcs = [];
    if (naverPaged[id]) srcs.push(await naverPages(f, id, start, {errors}));
    if (fredId[id]) srcs.push(await fredSeries(f, id, start, errors));
    if (id === 'kospi' && keys.krx) srcs.push(await krxKospi(f, closed(id, srcs[0].rows).map(r => r.date), keys.krx, errors));
    if (id === 'usdkrw' && keys.ecos) srcs.push(await ecosUsdkrw(f, keys.ecos, start, today, errors));
    for (const s of srcs) s.rows = closed(id, s.rows);
    const [first, second] = srcs;
    const series = mergeSeries(first, second ?? null, byId[id].compare);
    const doc = {schema: 'atlas4h-history-1', id, fetchedAt: at, from: start, to: series.at(-1)?.date ?? null,
      observedAtRule: `날짜만 있는 값은 그 시장 마감 ${CLOSE_AT[id].hms} ${CLOSE_AT[id].tz} 로 본다(약속 10)`, compare: byId[id].compare,
      sources: srcs.map(s => ({name: s.name, url: s.url, fetchedAt: s.fetchedAt ?? null, rawSha256: s.rawSha256 ?? null, rows: s.rows.length, ...(s.pages ? {pages: s.pages.map(({url, rawSha256}) => ({url, rawSha256}))} : {}), ...(s.ok ? {} : {error: s.error ?? 'FETCH_FAILED'})})),
      counts: Object.fromEntries(Object.values(STATUS).map(k => [k, series.filter(x => x.status === k).length])),
      series};
    const file = path.join(rootDir, 'atlas4h/data/history', `${id}.json`);
    await fs.mkdir(path.dirname(file), {recursive: true});
    await fs.writeFile(file, JSON.stringify(doc, null, 1) + '\n');
    written[id] = path.relative(rootDir, file);
    const okSources = srcs.filter(s => s.ok && s.rows.length).length;
    perVariable[id] = {status: !series.length ? STATUS.NONE : okSources >= 2 ? STATUS.OK : STATUS.ONE, sources: okSources, rows: series.length, from: series[0]?.date ?? null, to: series.at(-1)?.date ?? null, counts: doc.counts};
  });
  return {written: Object.fromEntries(HISTORY_IDS.map(id => [id, written[id]])), perVariable: Object.fromEntries(HISTORY_IDS.map(id => [id, perVariable[id]]))};
}

// ── now ──────────────────────────────────────────────────────────────────────
async function sessionsOf(rootDir) {
  const cal = await readJSONFirst([path.join(rootDir, 'public/data/rolling-calendar.json'), path.join(REPO, 'public/data/rolling-calendar.json')]).catch(() => null);
  const input = await readJSONFirst([path.join(rootDir, 'public/data/input.json'), path.join(REPO, 'public/data/input.json')]);
  return {sessions: cal?.sessions ?? input.calendar.sessions, assets: input.assets.map(a => ({code: a.code, name: a.name}))};
}
/** 분봉 창: 오늘이 거래일이고 09:00 뒤면 지금 앞 10분(15:30 뒤면 15:25~15:45), 아니면 앞 거래일 15:25~15:45 */
export function minuteWindow(at, sessions) {
  const {day, hm} = kstParts(at), last = sessions.at(-1), wd = new Date(day + 'T00:00:00Z').getUTCDay();
  const isSession = sessions.includes(day) || (day > last && wd > 0 && wd < 6);
  if (isSession && hm >= '09:00') {
    if (hm >= '15:30') return {day, start: '1525', end: '1545'};
    const t = new Date(Date.parse(`${day}T${hm}:00Z`) - 10 * 60000).toISOString().slice(11, 16);
    return {day, start: (t < '09:00' ? '09:00' : t).replace(':', ''), end: hm.replace(':', '')};
  }
  const prev = sessions.filter(d => d < day).at(-1) ?? null;
  return prev ? {day: prev, start: '1525', end: '1545'} : null;
}
export const minuteURL = (code, w) => `https://api.stock.naver.com/chart/domestic/item/${code}/minute?startDateTime=${ymd(w.day)}${w.start}&endDateTime=${ymd(w.day)}${w.end}`;
export const pollingURL = code => `https://polling.finance.naver.com/api/realtime/domestic/stock/${code}`;
export const disclosureURL = code => `https://m.stock.naver.com/api/stock/${code}/disclosure?pageSize=20&page=1`;

async function previousSnapshot(rootDir, stamp) {
  const dir = path.join(rootDir, 'atlas4h/ledger/inputs');
  let files = []; try { files = (await fs.readdir(dir)).filter(x => x.endsWith('.json') && x.slice(0, 16) < stamp).sort(); } catch (e) { if (e.code !== 'ENOENT') throw e; }
  if (!files.length) return null;
  const doc = JSON.parse(await fs.readFile(path.join(dir, files.at(-1)), 'utf8'));
  return {file: `atlas4h/ledger/inputs/${files.at(-1)}`, byId: new Map(doc.variables.map(v => [v.id, {...v, file: `atlas4h/ledger/inputs/${files.at(-1)}`}]))};
}

export async function collectNow({at, rootDir, f, keys, errors}) {
  const vars = await readVariables(rootDir), byId = Object.fromEntries(vars.variables.map(v => [v.id, v]));
  const {sessions, assets} = await sessionsOf(rootDir), {stamp} = kstParts(at), prev = await previousSnapshot(rootDir, stamp);
  const lookback = new Date(Date.parse(at) - 40 * 864e5).toISOString().slice(0, 10);
  const one = async (id, name, url, parse, opts) => {
    const r = await f.get(url, opts);
    if (!r.ok) { errors.push({variable: id, source: name, url: r.url, error: r.error}); return {name, url: r.url, ok: false, error: r.error, rows: []}; }
    try { return {name, url: r.url, ok: true, rawSha256: r.rawSha256, fetchedAt: r.fetchedAt, rows: withObserved(id, parse(r.text), r.fetchedAt)}; }
    catch (e) { errors.push({variable: id, source: name, url: r.url, error: String(e.message)}); return {name, url: r.url, ok: false, error: String(e.message), rows: []}; }
  };
  const variables = [];
  const scalar = async id => {
    const first = id === 'brent' ? await one(id, 'fred', fredURL('DCOILBRENTEU', lookback), t => parseFred(t, 'DCOILBRENTEU'), {ua: FRED_UA}) : await one(id, 'naver', naverPaged[id](1), parseFirst(id));
    let second = null;
    if (fredId[id] && id !== 'brent') second = await one(id, 'fred', fredURL(fredId[id], lookback), t => parseFred(t, fredId[id]), {ua: FRED_UA});
    if (id === 'kospi' && keys.krx) { const d = first.rows.filter(r => Date.parse(closeAt('kospi', r.date)) <= Date.parse(at)).at(-1)?.date; if (d) second = await one(id, 'krx', krxKospiURL(d), t => parseKrxIndex(t), {headers: {AUTH_KEY: keys.krx}}); }
    if (id === 'usdkrw' && keys.ecos) second = await one(id, 'ecos', ecosURL(keys.ecos, lookback, kstParts(at).day, 1, 100), t => parseEcos(t).rows);
    return buildVariable({id, first, second, compare: byId[id].compare, at, previous: prev?.byId.get(id) ?? null});
  };
  for (const id of ['kospi', 'sox', 'sp500', 'vix', 'usdkrw', 'wti', 'brent']) variables.push(await scalar(id));
  // 아직 받을 길이 없는 변수 — 짐작하지 않고 없음
  const none = (id, reason) => ({id, value: null, observedAt: null, fetchedAt: null, status: STATUS.NONE, marks: [STATUS.NONE], reason, sources: []});
  variables.push(none('futures-kospi200', '받을 길 없음 — KRX Open API·KIS 열쇠와 해석기가 필요(gaps keys)'));
  variables.push(none('futures-us', '받을 길 없음 — KIS 계좌·앱키가 필요, 둘째 출처 없음(gaps futures-us)'));
  variables.push(none('vkospi', '받을 길 없음 — 장중 출처 없음 · KRX 하루 값은 열쇠와 해석기가 필요(gaps vkospi)'));
  variables.push(none('events-us', '해석기 아직 없음 — BLS·연준 일정 쪽은 다음 단계에서 읽음'));
  variables.push(none('events-kr', '출처 주소 미확인(gaps events-kr)'));
  // 공시 — 52종목 네이버 공시(지난 24시간) · DART 맞대기는 다음 단계
  const disc = [], discFail = [], discSha = [];
  await pool(assets, 4, async a => {
    const r = await f.get(disclosureURL(a.code));
    if (!r.ok) { discFail.push(a.code); errors.push({variable: 'events-earnings', source: 'naver', url: r.url, error: r.error}); return; }
    try { const d = parseDisclosures(r.text, a.code); discSha.push({url: r.url, rawSha256: r.rawSha256, fetchedAt: r.fetchedAt}); for (const it of d.items) if (it.publishedAt && Date.parse(it.publishedAt) <= Date.parse(at) && Date.parse(at) - Date.parse(it.publishedAt) <= 24 * 3600000) disc.push({code: a.code, id: it.id, title: it.title, publishedAt: new Date(Date.parse(it.publishedAt)).toISOString(), corporateAction: it.corporateAction}); }
    catch (e) { discFail.push(a.code); errors.push({variable: 'events-earnings', source: 'naver', url: r.url, error: String(e.message)}); }
  });
  disc.sort((x, y) => x.publishedAt.localeCompare(y.publishedAt) || x.code.localeCompare(y.code));
  discSha.sort((x, y) => x.url.localeCompare(y.url));
  variables.push(discSha.length
    ? {id: 'events-earnings', value: disc, observedAt: disc.at(-1)?.publishedAt ?? null, fetchedAt: discSha.at(-1).fetchedAt, status: STATUS.ONE, marks: [STATUS.ONE], reason: `네이버 공시 ${discSha.length}/${assets.length}종목 · 지난 24시간 ${disc.length}건 · DART 맞대기는 다음 단계` + (discFail.length ? ` · 못 받은 종목 ${discFail.sort().join(',')}` : ''), sources: discSha.map(s => ({name: 'naver', url: s.url, value: null, observedAt: null, fetchedAt: s.fetchedAt, rawSha256: s.rawSha256}))}
    : none('events-earnings', '52종목 공시를 하나도 못 받음'));
  // 종목 값(분봉) · 거래대금(실시간) — 52종목
  const w = minuteWindow(at, sessions), minute = new Map(), polls = new Map();
  // 받기는 주소 종류별로 따로 돈다(한 곳 차단기가 다른 주소의 실패로 열리지 않게)
  if (w) await pool(assets, 4, async a => { minute.set(a.code, await f.get(minuteURL(a.code, w))); });
  await pool(assets, 4, async a => { polls.set(a.code, await f.get(pollingURL(a.code))); });
  for (const a of assets) {
    const base = {variableId: null, code: a.code, value: null, observedAt: null, fetchedAt: null, status: STATUS.NONE, marks: [], reason: null, sources: []};
    const poll = polls.get(a.code);
    let p = null;
    if (poll.ok) { try { p = parsePolling(poll.text, a.code); } catch (e) { errors.push({variable: 'stock-trading-value', source: 'naver', url: poll.url, error: String(e.message)}); } }
    else errors.push({variable: 'stock-trading-value', source: 'naver', url: poll.url, error: poll.error});
    const pollSrc = {name: 'naver-polling', url: poll.url, value: p?.tradingValue ?? null, observedAt: p?.observedAt ?? null, fetchedAt: poll.fetchedAt ?? null, rawSha256: poll.rawSha256 ?? null, ...(poll.ok ? {} : {error: poll.error})};
    const stopped = p && p.tradeStop && p.tradeStop !== 'TRADING';
    // 거래대금
    const tv = {...base, variableId: 'stock-trading-value', id: `stock-trading-value:${a.code}`, sources: [pollSrc], fetchedAt: poll.fetchedAt ?? null};
    if (stopped) Object.assign(tv, {status: STATUS.NONE, marks: [STATUS.NONE, '거래정지'], reason: `거래정지(${p.tradeStop}) — 0 으로 적지 않음`});
    else if (p?.tradingValue != null && p.marketStatus === 'CLOSE') Object.assign(tv, {value: p.tradingValue, observedAt: p.observedAt, status: STATUS.ONE, marks: [STATUS.ONE], reason: 'KRX 하루 값은 다음 영업일 08:00(열쇠 필요) — 그 전엔 한 출처'});
    else if (p?.tradingValue != null) Object.assign(tv, {status: STATUS.CHECK, marks: [STATUS.CHECK], reason: `장중 값(${p.marketStatus}) — KRX만의 값인지 NXT가 섞였는지 확인 전(gaps intraday-basis)`});
    else Object.assign(tv, {status: STATUS.NONE, marks: [STATUS.NONE], reason: '거래대금을 못 받음'});
    // 종목 값
    const sp = {...base, variableId: 'stock-price', id: `stock-price:${a.code}`};
    if (!w) Object.assign(sp, {marks: [STATUS.NONE], reason: '거래일 달력에서 날짜를 못 찾음'});
    else {
      const r = minute.get(a.code);
      let bar = null;
      if (r.ok) { try { bar = pickMinuteBar(r.text, w.day); } catch (e) { errors.push({variable: 'stock-price', source: 'naver', url: r.url, error: String(e.message)}); } }
      else errors.push({variable: 'stock-price', source: 'naver', url: r.url, error: r.error});
      sp.fetchedAt = r.fetchedAt ?? null;
      sp.sources = [{name: 'naver-minute', url: r.url, value: bar?.value ?? null, observedAt: bar?.observedAt ?? null, fetchedAt: r.fetchedAt ?? null, rawSha256: r.rawSha256 ?? null, ...(r.ok ? {} : {error: r.error})}];
      // 같은 회사(네이버)의 다른 주소라 둘째 출처로 세지 않는다(약속 2). 다만 같은 날 종가가 서로 다르면 쓰지 않는다(확인 중).
      const self = bar?.closingAuction && p?.closePrice != null && p.observedAt && kstParts(p.observedAt).day === w.day ? {pollingClose: p.closePrice, agree: p.closePrice === bar.value} : null;
      if (self) sp.naverSelfCheck = self;
      if (stopped) Object.assign(sp, {status: STATUS.NONE, marks: [STATUS.NONE, '거래정지'], reason: `거래정지(${p.tradeStop}) — 0 으로 적지 않음`});
      else if (self && !self.agree) Object.assign(sp, {status: STATUS.CHECK, marks: [STATUS.CHECK], reason: `네이버 두 주소의 ${w.day} 종가가 다름(15:30 봉 ${bar.value} · 실시간 ${p.closePrice}) — 쓰지 않음`});
      else if (bar?.closingAuction) Object.assign(sp, {value: bar.value, observedAt: bar.observedAt, status: STATUS.ONE, marks: [STATUS.ONE], reason: '15:30 종가 단일가 봉 · KRX 하루 값은 다음 영업일 08:00(열쇠 필요)'});
      else if (bar) Object.assign(sp, {status: STATUS.CHECK, marks: [STATUS.CHECK], reason: `장중 봉 ${bar.barTime} — KRX만의 값인지 NXT가 섞였는지 확인 전(gaps intraday-basis)`});
      else Object.assign(sp, {marks: [STATUS.NONE], reason: r.ok ? '그 창에 정규장 봉이 없음' : '분봉을 못 받음'});
    }
    for (const v of [sp, tv]) if (v.value != null && Date.parse(at) - Date.parse(v.observedAt) > STALE_HOURS * 3600000) { v.status = STATUS.OLD; v.marks.unshift(STATUS.OLD); v.marks.push('장 닫힘'); v.reason = `값이 생긴 지 ${STALE_HOURS}시간 넘음(장 닫힘) · ` + v.reason; }
    variables.push(sp, tv);
  }
  const order = id => { const i = vars.variables.findIndex(v => id === v.id || id.startsWith(v.id + ':')); return i < 0 ? 99 : i; };
  variables.sort((x, y) => order(x.id) - order(y.id) || x.id.localeCompare(y.id));
  const doc = {schema: 'atlas4h-inputs-1', at, atKST: new Date(Date.parse(at) + 9 * 3600000).toISOString().slice(0, 19) + '+09:00', staleAfterHours: STALE_HOURS, minuteWindow: w, previous: prev?.file ?? null, variables};
  const dir = path.join(rootDir, 'atlas4h/ledger/inputs'); await fs.mkdir(dir, {recursive: true});
  let file = path.join(dir, `${stamp}.json`);
  for (let k = 2; ; k++) { try { await fs.writeFile(file, JSON.stringify(doc, null, 1) + '\n', {flag: 'wx'}); break; } catch (e) { if (e.code !== 'EEXIST' || k > 50) throw e; file = path.join(dir, `${stamp}-${k}.json`); } }
  // 변수마다 한 줄: 상태 · 답한 출처 수(받기에 성공한 출처 이름의 수)
  const answered = list => new Set(list.flatMap(x => x.sources.filter(s => !s.error && s.rawSha256).map(s => s.name))).size;
  const perVariable = {};
  for (const v of vars.variables) {
    const mine = variables.filter(x => x.id === v.id || x.variableId === v.id);
    if (mine.length === 1) perVariable[v.id] = {status: mine[0].status, sources: answered(mine)};
    else { const counts = {}; for (const x of mine) counts[x.status] = (counts[x.status] ?? 0) + 1; const top = Object.entries(counts).sort((a, b) => b[1] - a[1])[0]?.[0] ?? STATUS.NONE; perVariable[v.id] = {status: top, sources: answered(mine), items: mine.length, counts}; }
  }
  return {written: {inputs: path.relative(rootDir, file)}, perVariable};
}

// ── 한 번 돌기 ────────────────────────────────────────────────────────────────
export async function run({mode, at = new Date().toISOString(), rootDir = process.cwd(), fixtures = null, env = process.env, fetchImpl} = {}) {
  if (!['history', 'now'].includes(mode)) throw Error('MODE must be history|now');
  const keys = {krx: env.ATLAS4H_KRX_KEY || null, ecos: env.ATLAS4H_ECOS_KEY || null, dart: env.ATLAS4H_DART_KEY || null, fred: env.ATLAS4H_FRED_KEY || null};
  const secrets = Object.values(keys).filter(Boolean);
  const f = makeFetcher({fixtures, fixedFetchedAt: fixtures ? at : null, timeoutMs: mode === 'history' ? 30000 : 15000, secrets, ...(fetchImpl ? {fetchImpl} : {})});
  const errors = [];
  const out = mode === 'history' ? await collectHistory({at, rootDir, f, keys, errors}) : await collectNow({at, rootDir, f, keys, errors});
  // 원문 보관 — 받은 바이트 그대로(gzip) · sha256 은 바이트로 셈
  const {day, stamp} = kstParts(at), rawDir = path.join(rootDir, 'atlas4h/raw', day);
  await fs.mkdir(rawDir, {recursive: true});
  const bodies = {};
  for (const [url, r] of [...f.raw.entries()].sort((a, b) => a[0].localeCompare(b[0]))) {
    const asText = Buffer.from(r.text, 'utf8').equals(r.buf);
    bodies[url] = {sha256: r.rawSha256, fetchedAt: r.fetchedAt, bytes: r.buf.length, ...(asText ? {text: r.text} : {base64: r.buf.toString('base64')})};
  }
  let rawFile = path.join(rawDir, `${stamp.slice(11)}-${mode}.json.gz`);
  const gz = await gzip(JSON.stringify({schema: 'atlas4h-raw-1', at, mode, bodies}));
  for (let k = 2; ; k++) { try { await fs.writeFile(rawFile, gz, {flag: 'wx'}); break; } catch (e) { if (e.code !== 'EEXIST' || k > 50) throw e; rawFile = path.join(rawDir, `${stamp.slice(11)}-${mode}-${k}.json.gz`); } }
  // 모으기 기록 — 덧붙이기만
  const line = {at, mode, ok: errors.length === 0, fixtures: Boolean(fixtures), keys: Object.fromEntries(Object.entries(keys).map(([k, v]) => [k, Boolean(v)])), perVariable: out.perVariable, written: {...out.written, raw: path.relative(rootDir, rawFile)}, rawBodies: Object.keys(bodies).length, errors: errors.map(e => ({...e, url: redact(e.url, secrets), error: redact(e.error, secrets)}))};
  const logFile = path.join(rootDir, 'atlas4h/ledger/collect', `${day}.jsonl`);
  await fs.mkdir(path.dirname(logFile), {recursive: true});
  await fs.appendFile(logFile, redact(JSON.stringify(line), secrets) + '\n');
  const fetched = Object.keys(bodies).length;
  return {status: fetched === 0 ? 'failed' : errors.length ? 'partial' : 'ok', mode, at, rawBodies: fetched, errors: errors.length, log: path.relative(rootDir, logFile), written: line.written, perVariable: out.perVariable};
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const arg = name => { const i = process.argv.indexOf(name); return i < 0 ? null : process.argv[i + 1]; };
  const out = await run({mode: arg('--mode'), at: arg('--now') ? new Date(arg('--now')).toISOString() : new Date().toISOString(), rootDir: path.resolve(arg('--root') ?? process.cwd()), fixtures: arg('--fixtures') ? path.resolve(arg('--fixtures')) : null});
  const short = {...out, perVariable: Object.fromEntries(Object.entries(out.perVariable).map(([k, v]) => [k, `${v.status} · 출처 ${v.sources}`]))};
  console.log(JSON.stringify(short, null, 1));
  process.exitCode = out.status === 'failed' ? 2 : 0;
}
