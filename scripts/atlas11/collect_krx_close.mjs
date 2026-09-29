/**
 * ATLAS 11 · 정규장(KRX 15:30) 종가 수집기 — run_daily.mjs 의 --collector 모듈 (기본)
 *   node scripts/atlas11/collect_krx_close.mjs --now ISO [--codes 005930,...] [--fixture dir] [--out file.json]
 *   export async function collect(input, window, options) → {attempted, provider, observations, marketObservations, errors, stats, lastGoodDate, delayed, startedAt, finishedAt}
 *
 * 왜 네이버가 아닌가 (2026-09-29 깃허브 실행기에서 실제로 확인)
 *   네이버·다음 일봉의 「종가」는 대체거래소(NXT) 거래가 섞인 통합 가격이라 저녁 8시까지 바뀐다.
 *   예) 삼성전자 9/29 — 정규장 종가 272,500원(서울신문·아시아경제 보도) · 네이버 273,500→274,000원 · 야후 272,500원.
 *   LG에너지솔루션 9/28 — 정규장 364,000원(검토 자료) · 네이버 360,500원 · 야후 364,000원.
 *   야후(.KS/.KQ)의 일봉은 과거에 사람이 검토한 정규장 종가(KRX_REGULAR, 매일경제 시세판) 17일치와 3종목 모두 한 원도 다르지 않았다.
 *
 * 규칙
 *   · 원천: https://query1.finance.yahoo.com/v8/finance/chart/<code>.KS (없으면 .KQ) · 대체 호스트 query2 · 3회 재시도(2s/5s/10s) · 종목 사이 250ms
 *   · 거래일 달력에 있는 날짜이면서 window.cutoff 이하만 넘긴다(끝나지 않은 장은 넘기지 않음)
 *   · 교차 검증: 저장된 검토 종가(priceBasis KRX_REGULAR)와 겹치는 날짜는 한 원도 달라서는 안 된다. 하나라도 다르면 그 종목은 오늘 값도 넘기지 않는다(REVIEWED_ROW_MISMATCH)
 *   · 오늘 봉은 regularMarketTime(정규장 마지막 체결 시각)이 오늘 15:30 KST 이후이고, 오늘 봉 종가 = regularMarketPrice 일 때만 「확정」 증거를 붙인다
 *   · 거래량은 제공자 합계(NXT 포함 여부 미검증) — volumeBasis 로 표시 · 가격 조정(기업행위) 미검증
 *   · observedAt = 실행기 시계(options.now) · fetchedAt = 실제 수신 시각 · rawHash = 응답 원문 sha256
 */
import fs from 'node:fs/promises';
import path from 'node:path';
import {createHash} from 'node:crypto';

export const PROVIDER = 'yahoo_chart_krx_regular';
export const HOSTS = Object.freeze(['https://query1.finance.yahoo.com', 'https://query2.finance.yahoo.com']);
const UA = 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0 Safari/537.36 ATLAS11-collector/2.0';
const sha = b => createHash('sha256').update(b).digest('hex');
const finite = x => typeof x === 'number' && Number.isFinite(x);
const kstDay = ms => new Date(ms + 9 * 3600000).toISOString().slice(0, 10);
const kstClock = ms => new Date(ms + 9 * 3600000).toISOString().slice(11, 19);
const closeInstant = d => Date.parse(d + 'T15:30:00+09:00');
const sleepDefault = ms => new Promise(r => setTimeout(r, ms));
export const chartUrl = (host, symbol, range = '1mo') => `${host}/v8/finance/chart/${encodeURIComponent(symbol)}?range=${range}&interval=1d&includePrePost=false`;

/** 야후 차트 JSON → {meta, rows:[{date,open,high,low,close,volume}]} (KST 날짜) */
export function parseYahooChart(text) {
  let j; try { j = JSON.parse(text); } catch { throw Error('PARSE_FAILED'); }
  const r = j?.chart?.result?.[0]; if (!r) throw Error(j?.chart?.error?.code ? 'NO_DATA:' + j.chart.error.code : 'NO_DATA');
  const q = r.indicators?.quote?.[0] ?? {}, ts = r.timestamp ?? [];
  const rows = ts.map((t, k) => ({date: kstDay(t * 1000), open: q.open?.[k], high: q.high?.[k], low: q.low?.[k], close: q.close?.[k], volume: q.volume?.[k]})).filter(x => [x.open, x.high, x.low, x.close, x.volume].every(finite) && x.close > 0);
  return {meta: r.meta ?? {}, rows};
}

async function fetchText(url, {fetch = globalThis.fetch, retries = 3, backoff = [2000, 5000, 10000], sleep = sleepDefault} = {}) {
  const attempts = [];
  for (let k = 0; k <= retries; k++) {
    const t = Date.now();
    try {
      const res = await fetch(url, {headers: {'User-Agent': UA, Accept: 'application/json'}, signal: AbortSignal.timeout(15000)});
      const text = await res.text(); attempts.push({attempt: k + 1, status: res.status, ms: Date.now() - t});
      if (res.ok) return {ok: true, text, attempts, fetchedAt: new Date().toISOString()};
      if (res.status === 404) return {ok: false, status: 404, attempts};
    } catch (e) { attempts.push({attempt: k + 1, error: String(e.message), ms: Date.now() - t}); }
    if (k < retries) await sleep(backoff[Math.min(k, backoff.length - 1)]);
  }
  return {ok: false, attempts};
}

export function fixtureFetch(dir) {
  return async url => { const sym = decodeURIComponent(url.split('/chart/')[1].split('?')[0]); try { const text = await fs.readFile(path.join(dir, sym + '.json'), 'utf8'); return {ok: true, status: 200, text: async () => text}; } catch { return {ok: false, status: 404, text: async () => ''}; } };
}

export async function collect(input, window, options = {}) {
  const startedAt = new Date().toISOString(), t0 = Date.now();
  const now = options.now ?? process.env.ATLAS_NOW ?? (() => { const i = process.argv.indexOf('--now'); return i >= 0 ? new Date(process.argv[i + 1]).toISOString() : new Date().toISOString(); })();
  const fetch = options.fetch ?? (options.fixtureDir || process.env.ATLAS_COLLECTOR_FIXTURE ? fixtureFetch(options.fixtureDir ?? process.env.ATLAS_COLLECTOR_FIXTURE) : globalThis.fetch);
  const sleep = options.sleep ?? sleepDefault, delay = options.politeDelayMs ?? 250;
  const sessions = new Set((options.calendar ?? input.calendar).sessions), today = window.day, cutoff = window.cutoff;
  const codes = options.codes ?? input.assets.map(a => a.code);
  const observations = [], errors = [], lastGoodDate = {}, suffixes = {};
  let finalizedToday = 0, requests = 0, reviewedChecked = 0;
  for (const code of codes) {
    const asset = input.assets.find(a => a.code === code); if (!asset) { errors.push({code: 'UNKNOWN_CODE', stockCode: code}); continue; }
    let got = null, url = null, tried = [];
    outer: for (const sfx of ['.KS', '.KQ']) for (const host of HOSTS) {
      url = chartUrl(host, code + sfx); requests++;
      const r = await fetchText(url, {fetch, sleep, retries: options.retries ?? 3, backoff: options.backoff});
      tried.push({url, ok: r.ok, attempts: r.attempts});
      if (r.ok) { try { const parsed = parseYahooChart(r.text); if (parsed.rows.length) { got = {...parsed, text: r.text, fetchedAt: r.fetchedAt, url}; suffixes[code] = sfx; break outer; } } catch (e) { tried.at(-1).parseError = String(e.message); } }
      if (r.status === 404) break; // 이 접미사는 없음 → 다음 접미사
    }
    if (delay) await sleep(delay);
    if (!got) { errors.push({code: 'FETCH_FAILED', stockCode: code, message: '모든 원천 실패', tried}); continue; }
    // 교차 검증: 저장된 검토 종가와 겹치는 날짜
    const reviewed = new Map(asset.prices.filter(p => p.priceBasis === 'KRX_REGULAR').map(p => [p.date, p.close]));
    const overlap = got.rows.filter(r => reviewed.has(r.date)), mismatched = overlap.filter(r => r.close !== reviewed.get(r.date));
    reviewedChecked += overlap.length;
    if (mismatched.length) { errors.push({code: 'REVIEWED_ROW_MISMATCH', stockCode: code, rows: mismatched.map(r => ({date: r.date, reviewedClose: reviewed.get(r.date), fetchedClose: r.close})), message: '검토된 정규장 종가와 다름 · 이 종목은 오늘 값도 넘기지 않음'}); continue; }
    // 넘길 행: 달력 거래일 · cutoff 이하 · (저장이 없거나 검토 행이 아닌 날짜) — 검토 행과 같은 값은 다시 넘기지 않는다
    const stored = new Map(asset.prices.map(p => [p.date, p]));
    let rows = got.rows.filter(r => sessions.has(r.date) && cutoff && r.date <= cutoff && !(stored.get(r.date)?.priceBasis === 'KRX_REGULAR'));
    const meta = got.meta, rmt = finite(meta.regularMarketTime) ? meta.regularMarketTime * 1000 : null;
    const todayRow = rows.find(r => r.date === today);
    let finality = null;
    if (todayRow) {
      const ok = rmt && kstDay(rmt) === today && rmt >= closeInstant(today) && Date.parse(now) >= rmt && todayRow.close === meta.regularMarketPrice && meta.hasPrePostMarketData !== true;
      if (ok) { finality = {finalClose: true, sessionDate: today, finalizedAt: new Date(rmt).toISOString(), finalitySourceUrl: got.url, finalityBasis: `Yahoo regularMarketTime ${kstClock(rmt)} KST(정규장 종가 체결) · 오늘 봉 종가 = regularMarketPrice · 시간외 없음(hasPrePostMarketData=false) · 검토 종가 ${overlap.length}일과 전부 일치`}; finalizedToday++; }
      else { rows = rows.filter(r => r.date !== today); errors.push({code: 'TODAY_NOT_FINAL', stockCode: code, regularMarketTime: rmt ? new Date(rmt).toISOString() : null, regularMarketPrice: meta.regularMarketPrice ?? null, todayClose: todayRow.close, message: '정규장 종가 확정 증거 부족 · 오늘 행 제외'}); }
    }
    lastGoodDate[code] = got.rows.at(-1)?.date ?? null;
    if (!rows.length) continue;
    observations.push({code, symbol: code + suffixes[code], sourceUrl: got.url, rawHash: sha(got.text), observedAt: now, fetchedAt: got.fetchedAt, priceBasis: 'KRX_REGULAR', volumeBasis: 'provider_total_unverified', adjustmentsVerified: false, reviewedOverlapDays: overlap.length, ...(finality ?? {}), rows: rows.map(r => ({...r, priceBasis: 'KRX_REGULAR'}))});
  }
  // 시장 지수(기록용 · 입력에 섞지 않음)
  const marketObservations = [];
  if (options.market !== false) { const url = chartUrl(HOSTS[0], '^KS11'); const r = await fetchText(url, {fetch, sleep, retries: 1}); requests++; if (r.ok) { try { const p = parseYahooChart(r.text); marketObservations.push({symbol: 'KOSPI', sourceUrl: url, rawHash: sha(r.text), rows: p.rows.filter(x => cutoff && x.date <= cutoff).slice(-5)}); } catch {} } }
  const failed = new Set(errors.filter(e => ['FETCH_FAILED', 'REVIEWED_ROW_MISMATCH', 'UNKNOWN_CODE'].includes(e.code)).map(e => e.stockCode));
  return {attempted: true, provider: PROVIDER, observations, marketObservations, errors, lastGoodDate, delayed: errors.some(e => e.code === 'TODAY_NOT_FINAL'), startedAt, finishedAt: new Date().toISOString(),
    stats: {stocks: codes.length, succeeded: codes.length - failed.size, failed: failed.size, finalizedToday, reviewedOverlapChecked: reviewedChecked, requests, durationMs: Date.now() - t0, suffixes}};
}

if (process.argv[1] && path.resolve(process.argv[1]) === new URL(import.meta.url).pathname) {
  const arg = n => { const i = process.argv.indexOf(n); return i < 0 ? null : process.argv[i + 1]; };
  const root = process.cwd(), input = JSON.parse(await fs.readFile(path.join(root, 'public/data/input.json'), 'utf8')), calendar = JSON.parse(await fs.readFile(path.join(root, 'public/data/rolling-calendar.json'), 'utf8'));
  const {rollingOperationWindow} = await import('../../lib/rolling-operation.mjs');
  const now = arg('--now') ?? new Date().toISOString(), window = rollingOperationWindow(input, now, {calendar, runEndDate: null});
  const result = await collect(input, window, {now, calendar, codes: arg('--codes')?.split(','), fixtureDir: arg('--fixture') ?? undefined});
  if (arg('--out')) await fs.writeFile(arg('--out'), JSON.stringify(result, null, 1));
  console.log(JSON.stringify({provider: result.provider, stats: result.stats, errors: result.errors.map(e => [e.code, e.stockCode]), observations: result.observations.map(o => [o.code, o.rows.map(r => r.date + ':' + r.close).join(' '), o.finalClose === true])}));
  process.exitCode = result.errors.length ? 2 : 0;
}
