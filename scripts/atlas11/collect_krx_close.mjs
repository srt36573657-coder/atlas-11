/**
 * ATLAS 11 · 정규장(KRX 15:30) 종가 수집기 — run_daily.mjs 의 --collector 모듈 (기본)
 *   node scripts/atlas11/collect_krx_close.mjs --now ISO [--codes 005930,...] [--fixture dir] [--out file.json]
 *   export async function collect(input, window, options) → {attempted, provider, observations, errors, stats, lastGoodDate, delayed, startedAt, finishedAt}
 *
 * 무엇이 「정규장 종가」인가 (2026-09-29 깃허브 실행기에서 실제 원문으로 확인)
 *   · 네이버·다음 일봉 「종가」는 정규장 뒤 시간외 단일가(16~18시)와 NXT 애프터마켓(~20시)이 섞여 저녁까지 바뀐다.
 *     삼성전자 9/29: 정규장 종가 272,500원(서울신문·아시아경제 보도) · 네이버 일봉 273,500 → 20시 275,000 · NXT 274,500.
 *   · 정규장 종가 = 15:20~15:30 종가 단일가 매매의 체결가 = 네이버 분봉의 「15:30:00」 봉(거래량이 몰린 한 봉). 이때 NXT 는 쉬고 있어 섞이지 않는다.
 *     삼성전자 9/29 15:30 봉 272,500원 · 거래량 1,907,055주 — 보도값과 같다.
 *   · 교차 검증: 같은 방법으로 직전 거래일 15:30 봉도 받아, 저장된 검토 종가(KRX_REGULAR · 매일경제 시세판)와 한 원도 다르면 그 종목은 넘기지 않는다.
 *
 * 규칙
 *   · 원천: https://api.stock.naver.com/chart/domestic/item/<code>/minute?startDateTime=<YYYYMMDD>1525&endDateTime=<YYYYMMDD>1545
 *   · 3회 재시도(1s/3s/8s) · 종목 사이 150ms · 한 종목 실패는 다른 종목에 번지지 않음
 *   · 넘기는 행은 종가만(시가·고가·저가·거래량 비움) — 다른 세션의 OHLC 를 섞지 않는다. 종가 단일가 체결량은 auctionVolume 으로 따로 남긴다
 *   · 오늘 행: 15:30 봉이 있고 거래량 > 0 이면 확정(finalClose) — 종가 단일가는 15:30 에 한 번 정해진다
 *   · 빠진 거래일(수집 실패 등)은 최근 5거래일까지 같은 방법으로 채운다(달력 거래일 · window.cutoff 이하)
 *   · observedAt = 실행기 시계(options.now) · fetchedAt = 실제 수신 시각 · rawHash = 응답 원문 sha256
 */
import fs from 'node:fs/promises';
import path from 'node:path';
import {createHash} from 'node:crypto';

export const PROVIDER = 'naver_minute_1530_closing_auction';
export const ORIGIN = 'https://api.stock.naver.com';
const UA = 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0 Safari/537.36 ATLAS11-collector/3.0';
const sha = b => createHash('sha256').update(b).digest('hex');
const finite = x => typeof x === 'number' && Number.isFinite(x);
const ymd = d => d.replaceAll('-', '');
const sleepDefault = ms => new Promise(r => setTimeout(r, ms));
export const minuteUrl = (code, day) => `${ORIGIN}/chart/domestic/item/${encodeURIComponent(code)}/minute?startDateTime=${ymd(day)}1525&endDateTime=${ymd(day)}1545`;

/** 분봉 JSON → 그 날 15:30:00 봉(없으면 null) */
export function closingAuctionBar(text, day) {
  let rows; try { rows = JSON.parse(text); } catch { throw Error('PARSE_FAILED'); }
  if (!Array.isArray(rows)) throw Error('PARSE_FAILED');
  const bar = rows.find(r => String(r.localDateTime) === ymd(day) + '153000');
  if (!bar) return null;
  const close = Number(bar.currentPrice), volume = Number(bar.accumulatedTradingVolume);
  if (!finite(close) || close <= 0) throw Error('BAR_PRICE');
  const after = rows.filter(r => String(r.localDateTime) > ymd(day) + '153000').map(r => Number(r.currentPrice)).filter(finite);
  return {close, auctionVolume: finite(volume) ? volume : null, afterCloseSamePrice: after.length ? after.every(p => p === close) : null, afterCloseBars: after.length};
}

async function fetchText(url, {fetch = globalThis.fetch, retries = 3, backoff = [1000, 3000, 8000], sleep = sleepDefault} = {}) {
  const attempts = [];
  for (let k = 0; k <= retries; k++) {
    const t = Date.now();
    try { const res = await fetch(url, {headers: {'User-Agent': UA, Accept: 'application/json', Referer: 'https://m.stock.naver.com/'}, signal: AbortSignal.timeout(15000)}); const text = await res.text(); attempts.push({attempt: k + 1, status: res.status, ms: Date.now() - t}); if (res.ok) return {ok: true, text, attempts, fetchedAt: new Date().toISOString()}; if (res.status === 404) return {ok: false, status: 404, attempts}; }
    catch (e) { attempts.push({attempt: k + 1, error: String(e.message), ms: Date.now() - t}); }
    if (k < retries) await sleep(backoff[Math.min(k, backoff.length - 1)]);
  }
  return {ok: false, attempts};
}

/** 검사용: <dir>/<code>-<YYYYMMDD>.json 을 원문으로 돌려준다 */
export function fixtureFetch(dir) {
  return async url => { const m = /item\/(\d{6})\/minute\?startDateTime=(\d{8})/.exec(url); try { const text = await fs.readFile(path.join(dir, `${m[1]}-${m[2]}.json`), 'utf8'); return {ok: true, status: 200, text: async () => text}; } catch { return {ok: false, status: 404, text: async () => ''}; } };
}

export async function collect(input, window, options = {}) {
  const startedAt = new Date().toISOString(), t0 = Date.now();
  const now = options.now ?? process.env.ATLAS_NOW ?? (() => { const i = process.argv.indexOf('--now'); return i >= 0 ? new Date(process.argv[i + 1]).toISOString() : new Date().toISOString(); })();
  const fetch = options.fetch ?? (options.fixtureDir || process.env.ATLAS_COLLECTOR_FIXTURE ? fixtureFetch(options.fixtureDir ?? process.env.ATLAS_COLLECTOR_FIXTURE) : globalThis.fetch);
  const sleep = options.sleep ?? sleepDefault, delay = options.politeDelayMs ?? 150;
  const sessions = (options.calendar ?? input.calendar).sessions, cutoff = window.cutoff, today = window.day;
  const codes = options.codes ?? input.assets.map(a => a.code);
  const observations = [], errors = [], lastGoodDate = {};
  let finalizedToday = 0, requests = 0, checkedPrev = 0;
  if (!cutoff) return {attempted: false, provider: PROVIDER, observations, errors: [{code: 'NO_COMPLETED_SESSION'}], stats: {stocks: codes.length}, startedAt, finishedAt: new Date().toISOString()};
  for (const code of codes) {
    const asset = input.assets.find(a => a.code === code); if (!asset) { errors.push({code: 'UNKNOWN_CODE', stockCode: code}); continue; }
    const stored = new Map(asset.prices.map(p => [p.date, p]));
    // 채울 날짜: cutoff 이하 최근 5거래일 중 정규장 종가 행이 없는 날
    const recent = sessions.filter(d => d <= cutoff).slice(-5), need = recent.filter(d => stored.get(d)?.priceBasis !== 'KRX_REGULAR');
    // 교차 검증 날짜: need 보다 앞선 가장 가까운 검토 종가 날짜
    const checkDay = sessions.filter(d => d < (need[0] ?? cutoff) && stored.get(d)?.priceBasis === 'KRX_REGULAR').at(-1) ?? null;
    if (!need.length) { lastGoodDate[code] = cutoff; continue; }
    const got = {}, raw = [];
    let failed = null;
    for (const day of [checkDay, ...need].filter(Boolean)) {
      const url = minuteUrl(code, day); requests++;
      const r = await fetchText(url, {fetch, sleep, retries: options.retries ?? 3, backoff: options.backoff});
      if (!r.ok) { failed = {code: 'FETCH_FAILED', stockCode: code, day, url, attempts: r.attempts}; break; }
      let bar = null; try { bar = closingAuctionBar(r.text, day); } catch (e) { failed = {code: 'PARSE_FAILED', stockCode: code, day, url, message: String(e.message)}; break; }
      got[day] = bar ? {...bar, url, rawHash: sha(r.text), fetchedAt: r.fetchedAt} : null; raw.push(r.text);
      if (delay) await sleep(delay);
    }
    if (failed) { errors.push(failed); continue; }
    if (checkDay) {
      checkedPrev++;
      const bar = got[checkDay], reviewed = stored.get(checkDay).close;
      if (!bar || bar.close !== reviewed) { errors.push({code: 'REVIEWED_ROW_MISMATCH', stockCode: code, day: checkDay, reviewedClose: reviewed, fetchedClose: bar?.close ?? null, message: bar ? '직전 검토 종가와 15:30 봉이 다름 · 이 종목은 넘기지 않음' : '직전 거래일 15:30 봉 없음(보관 기간 밖일 수 있음) · 교차 검증 불가 · 넘기지 않음'}); continue; }
    }
    const rows = [];
    for (const day of need) {
      const bar = got[day];
      if (!bar || !(bar.auctionVolume > 0)) { if (day === today) errors.push({code: 'TODAY_NOT_FINAL', stockCode: code, day, message: bar ? '15:30 봉 거래량 0' : '15:30 종가 단일가 봉이 아직 없음'}); else errors.push({code: 'DAY_MISSING', stockCode: code, day, message: '15:30 봉 없음'}); continue; }
      rows.push({date: day, close: bar.close, priceBasis: 'KRX_REGULAR', closeBasis: 'krx_closing_auction_1530_minute_bar', auctionVolume: bar.auctionVolume});
    }
    if (!rows.length) continue;
    const t = rows.find(r => r.date === today), tb = t ? got[today] : null;
    if (t) finalizedToday++;
    lastGoodDate[code] = rows.at(-1).date;
    const main = tb ?? got[rows.at(-1).date];
    observations.push({code, sourceUrl: main.url, rawHash: sha(raw.join('\n')), observedAt: now, fetchedAt: main.fetchedAt, priceBasis: 'KRX_REGULAR', adjustmentsVerified: false,
      crossCheck: checkDay ? {day: checkDay, reviewedClose: stored.get(checkDay).close, fetchedClose: got[checkDay].close, match: true} : null,
      ...(tb ? {finalClose: true, sessionDate: today, finalizedAt: new Date(Math.max(Date.parse(today + 'T15:30:00+09:00'), Math.min(Date.parse(now), Date.parse(tb.fetchedAt)))).toISOString(), finalitySourceUrl: tb.url, finalityBasis: `15:30 종가 단일가 분봉(체결 ${tb.auctionVolume}주)${tb.afterCloseSamePrice ? ' · 15:40 이후 시간외 종가매매 봉도 같은 가격' : ''} · 직전 거래일 검토 종가와 같은 방법으로 일치 확인`} : {}),
      rows});
  }
  const failedStocks = new Set(errors.filter(e => ['FETCH_FAILED', 'PARSE_FAILED', 'REVIEWED_ROW_MISMATCH', 'UNKNOWN_CODE'].includes(e.code)).map(e => e.stockCode));
  return {attempted: true, provider: PROVIDER, observations, errors, lastGoodDate, delayed: errors.some(e => e.code === 'TODAY_NOT_FINAL'), startedAt, finishedAt: new Date().toISOString(),
    stats: {stocks: codes.length, succeeded: codes.length - failedStocks.size, failed: failedStocks.size, finalizedToday, crossChecked: checkedPrev, requests, durationMs: Date.now() - t0}};
}

if (process.argv[1] && path.resolve(process.argv[1]) === new URL(import.meta.url).pathname) {
  const arg = n => { const i = process.argv.indexOf(n); return i < 0 ? null : process.argv[i + 1]; };
  const root = process.cwd(), input = JSON.parse(await fs.readFile(path.join(root, 'public/data/input.json'), 'utf8')), calendar = JSON.parse(await fs.readFile(path.join(root, 'public/data/rolling-calendar.json'), 'utf8'));
  const {rollingOperationWindow} = await import('../../lib/rolling-operation.mjs');
  const now = arg('--now') ?? new Date().toISOString(), window = rollingOperationWindow(input, now, {calendar, runEndDate: null});
  const result = await collect(input, window, {now, calendar, codes: arg('--codes')?.split(','), fixtureDir: arg('--fixture') ?? undefined});
  if (arg('--out')) await fs.writeFile(arg('--out'), JSON.stringify(result, null, 1));
  console.log(JSON.stringify({provider: result.provider, stats: result.stats, errors: result.errors.map(e => [e.code, e.stockCode, e.day]), observations: result.observations.map(o => [o.code, o.rows.map(r => r.date + ':' + r.close).join(' '), o.finalClose === true, o.crossCheck?.day])}));
  process.exitCode = result.errors.length ? 2 : 0;
}
