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
 *
 * 회사 일로 네이버가 지난 가격을 고쳐 적은 경우 (2026-10-03 16:11 사장님 「고쳐」)
 *   · 삼성바이오로직스 10/2 권리락(유상증자 신주배정 기준일 10/6)으로 네이버가 10/1 15:30 봉을 1,429,000 → 1,418,993(×0.992997)으로 고쳐 적어
 *     교차 검증이 막혔고, 52종목이 다 모이지 않아 10/2 저녁 발행이 멈췄다(고치지 않으면 매일 멈춤).
 *   · 받는 조건(셋 모두): ① 받은 값 ÷ 저장값이 0.90 이상 1.00 미만(작은 하향 조정만 · 분할처럼 큰 조정은 사람 확인)
 *                        ② 그 앞의 저장된 검토 종가 하루를 더 받아도 같은 비율(차이 0.0002 이하) — 한 날짜만 틀린 자료 오류와 가른다
 *                        ③ 최근 120일 공시 제목에 가격을 고쳐 적게 만드는 회사 일 낱말(ADJUSTMENT_WORDS)이 있다(관측 수집 묶음 reports/atlas11/context)
 *   · 받으면: 저장된 지난 기록은 고치지 않는다(가격 조정 미검증 원칙 그대로) · 빠진 날 행만 넘기고 crossCheck·finalityBasis·stats 에 까닭과 비율을 남긴다
 *   · 셋 중 하나라도 아니면 예전처럼 REVIEWED_ROW_MISMATCH(사람 확인) — 나머지 종목의 「한 원이라도 다르면 안 받음」은 그대로
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

/** 가격을 고쳐 적게 만드는 회사 일 낱말(공시 제목) — 소각·합병·전환사채처럼 지난 가격을 고치지 않는 일은 넣지 않는다 */
export const ADJUSTMENT_WORDS = /권리락|유상증자|무상증자|주식배당|액면분할|주식분할|인적분할|병합|감자/;
export const ADJUSTMENT_POLICY = Object.freeze({minRatio: 0.90, maxRatio: 1.0, ratioTolerance: 0.0002, lookbackDays: 120});

/** 관측 수집 묶음(reports/atlas11/context/<날짜>/<시각>.json)에서 그 종목의 최근 회사 일 공시 — 오늘 이전 최신 묶음부터 셋까지 본다 */
export async function corporateActionDisclosures(rootDir, code, today, {lookbackDays = ADJUSTMENT_POLICY.lookbackDays} = {}) {
  if (!rootDir) return [];
  const base = path.join(rootDir, 'reports/atlas11/context'), from = new Date(Date.parse(today + 'T00:00:00+09:00') - lookbackDays * 86400000).toISOString().slice(0, 10);
  let days = []; try { days = (await fs.readdir(base)).filter(d => /^\d{4}-\d{2}-\d{2}$/.test(d) && d <= today).sort().reverse(); } catch (e) { if (e.code === 'ENOENT') return []; throw e; }
  const files = [];
  for (const d of days) { let names = []; try { names = (await fs.readdir(path.join(base, d))).filter(f => f.endsWith('.json')).sort().reverse(); } catch { continue; } for (const n of names) { files.push(path.join(base, d, n)); if (files.length >= 3) break; } if (files.length >= 3) break; }
  const out = new Map();
  for (const f of files) {
    let c; try { c = JSON.parse(await fs.readFile(f, 'utf8')); } catch { continue; }
    for (const item of (c.disclosures ?? []).find(x => x.code === code)?.items ?? []) {
      const day = String(item.publishedAt ?? '').slice(0, 10);
      if (item.corporateAction && ADJUSTMENT_WORDS.test(item.title ?? '') && day >= from && day <= today && !out.has(item.id ?? item.title)) out.set(item.id ?? item.title, {title: item.title, publishedAt: item.publishedAt, word: (item.title.match(ADJUSTMENT_WORDS) ?? [null])[0], file: path.relative(rootDir, f)});
    }
  }
  return [...out.values()].sort((a, b) => String(a.publishedAt).localeCompare(String(b.publishedAt)));
}

/** 교차 검증이 어긋났을 때: 회사 일로 지난 가격을 고쳐 적은 것인지 세 조건으로 가린다(받을지 말지만 정함 · 아무것도 고치지 않음) */
export async function adjustmentCheck({code, checkDay, reviewed, fetched, sessions, stored, fetchBar, disclosures, policy = ADJUSTMENT_POLICY}) {
  const ratio = fetched / reviewed;
  const base = {day: checkDay, reviewedClose: reviewed, fetchedClose: fetched, ratio};
  if (!(ratio >= policy.minRatio && ratio < policy.maxRatio)) return {...base, accepted: false, reason: 'ratio_out_of_band', note: `비율 ${ratio.toFixed(6)} — 작은 하향 조정(${policy.minRatio}~${policy.maxRatio}) 밖 · 사람 확인`};
  const secondDay = sessions.filter(d => d < checkDay && stored.get(d)?.priceBasis === 'KRX_REGULAR').at(-1) ?? null;
  if (!secondDay) return {...base, accepted: false, reason: 'no_second_day', note: '같은 비율을 확인할 앞 날짜 검토 종가 없음'};
  const second = await fetchBar(secondDay);
  if (!second?.bar) return {...base, secondDay, accepted: false, reason: 'second_day_bar_missing', note: `${secondDay} 15:30 봉을 못 받음`};
  const secondReviewed = stored.get(secondDay).close, secondRatio = second.bar.close / secondReviewed;
  if (Math.abs(secondRatio - ratio) > policy.ratioTolerance) return {...base, secondDay, secondReviewedClose: secondReviewed, secondFetchedClose: second.bar.close, secondRatio, accepted: false, reason: 'ratio_not_uniform', note: '두 날의 비율이 달라 회사 일 조정으로 볼 수 없음 · 사람 확인'};
  const found = disclosures.filter(x => ADJUSTMENT_WORDS.test(x.title ?? ''));
  if (!found.length) return {...base, secondDay, secondReviewedClose: secondReviewed, secondFetchedClose: second.bar.close, secondRatio, accepted: false, reason: 'no_corporate_action_disclosure', note: `최근 ${policy.lookbackDays}일 공시에 가격을 고쳐 적게 만드는 회사 일이 없음 · 사람 확인`};
  return {...base, secondDay, secondReviewedClose: secondReviewed, secondFetchedClose: second.bar.close, secondRatio, secondUrl: second.url, secondRawHash: second.rawHash, accepted: true, reason: 'corporate_action_adjustment', disclosures: found.map(({title, publishedAt, word, file}) => ({title, publishedAt, word, file})), note: `네이버가 회사 일(${[...new Set(found.map(x => x.word))].join('·')})로 ${checkDay} 이전 가격을 ×${ratio.toFixed(6)} 고쳐 적음 · ${secondDay} 도 같은 비율 · 저장 기록은 고치지 않음(가격 조정 미검증)`};
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
  const observations = [], errors = [], lastGoodDate = {}, adjustments = [];
  let finalizedToday = 0, requests = 0, checkedPrev = 0;
  if (!cutoff) return {attempted: false, provider: PROVIDER, observations, errors: [{code: 'NO_COMPLETED_SESSION'}], stats: {stocks: codes.length}, startedAt, finishedAt: new Date().toISOString()};
  for (const code of codes) {
    const asset = input.assets.find(a => a.code === code); if (!asset) { errors.push({code: 'UNKNOWN_CODE', stockCode: code}); continue; }
    const stored = new Map(asset.prices.map(p => [p.date, p]));
    // 채울 날짜: cutoff 이하 최근 5거래일 중 정규장 종가 행이 없는 날
    const recent = sessions.filter(d => d <= cutoff).slice(-5), need = recent.filter(d => stored.get(d)?.priceBasis !== 'KRX_REGULAR');
    // 교차 검증 날짜: 가장 최근의 검토 종가 날짜(오늘 제외) — 분봉 보관 기간(약 1~2주) 안이어야 한다
    const checkDay = sessions.filter(d => d <= cutoff && d !== today && stored.get(d)?.priceBasis === 'KRX_REGULAR').at(-1) ?? null;
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
    let adjusted = null;
    if (checkDay) {
      checkedPrev++;
      const bar = got[checkDay], reviewed = stored.get(checkDay).close;
      if (!bar || bar.close !== reviewed) {
        // 회사 일로 네이버가 지난 가격을 고쳐 적은 것인지 세 조건으로 가린다 — 아니면 예전처럼 넘기지 않는다
        if (bar) {
          const disclosures = options.corporateActions ? options.corporateActions.filter(x => x.code === code) : await corporateActionDisclosures(options.rootDir ?? null, code, today);
          adjusted = await adjustmentCheck({code, checkDay, reviewed, fetched: bar.close, sessions, stored, disclosures, fetchBar: async day => {
            const url = minuteUrl(code, day); requests++;
            const r = await fetchText(url, {fetch, sleep, retries: options.retries ?? 3, backoff: options.backoff});
            if (!r.ok) return null;
            let b = null; try { b = closingAuctionBar(r.text, day); } catch { return null; }
            raw.push(r.text); if (delay) await sleep(delay);
            return b ? {bar: b, url, rawHash: sha(r.text)} : null;
          }});
        }
        if (!adjusted?.accepted) { errors.push({code: 'REVIEWED_ROW_MISMATCH', stockCode: code, day: checkDay, reviewedClose: reviewed, fetchedClose: bar?.close ?? null, message: bar ? '직전 검토 종가와 15:30 봉이 다름 · 이 종목은 넘기지 않음' : '직전 거래일 15:30 봉 없음(보관 기간 밖일 수 있음) · 교차 검증 불가 · 넘기지 않음', ...(adjusted ? {adjustment: adjusted} : {})}); continue; }
        adjustments.push({code, ...adjusted});
      }
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
    const crossNote = adjusted ? ` · 직전 거래일(${adjusted.day}) 종가는 회사 일로 네이버가 ×${adjusted.ratio.toFixed(6)} 고쳐 적어 다름 — ${adjusted.secondDay} 도 같은 비율 확인 · 저장 기록은 고치지 않음(가격 조정 미검증)` : ' · 직전 거래일 검토 종가와 같은 방법으로 일치 확인';
    observations.push({code, sourceUrl: main.url, rawHash: sha(raw.join('\n')), observedAt: now, fetchedAt: main.fetchedAt, priceBasis: 'KRX_REGULAR', adjustmentsVerified: false,
      crossCheck: checkDay ? (adjusted ? {day: checkDay, reviewedClose: adjusted.reviewedClose, fetchedClose: adjusted.fetchedClose, match: false, corporateActionAdjusted: true, ratio: adjusted.ratio, secondDay: adjusted.secondDay, secondRatio: adjusted.secondRatio, disclosures: adjusted.disclosures, note: adjusted.note} : {day: checkDay, reviewedClose: stored.get(checkDay).close, fetchedClose: got[checkDay].close, match: true}) : null,
      ...(tb ? {finalClose: true, sessionDate: today, finalizedAt: new Date(Math.max(Date.parse(today + 'T15:30:00+09:00'), Math.min(Date.parse(now), Date.parse(tb.fetchedAt)))).toISOString(), finalitySourceUrl: tb.url, finalityBasis: `15:30 종가 단일가 분봉(체결 ${tb.auctionVolume}주)${tb.afterCloseSamePrice ? ' · 15:40 이후 시간외 종가매매 봉도 같은 가격' : ''}${crossNote}`} : {}),
      rows});
  }
  const failedStocks = new Set(errors.filter(e => ['FETCH_FAILED', 'PARSE_FAILED', 'REVIEWED_ROW_MISMATCH', 'UNKNOWN_CODE'].includes(e.code)).map(e => e.stockCode));
  return {attempted: true, provider: PROVIDER, observations, errors, lastGoodDate, adjustments, delayed: errors.some(e => e.code === 'TODAY_NOT_FINAL'), startedAt, finishedAt: new Date().toISOString(),
    stats: {stocks: codes.length, succeeded: codes.length - failedStocks.size, failed: failedStocks.size, finalizedToday, crossChecked: checkedPrev, requests, durationMs: Date.now() - t0,
      // 회사 일 조정으로 받은 종목(하루 기록 장부에 stats 로 남는다)
      corporateActionAdjusted: adjustments.map(a => ({code: a.code, day: a.day, reviewedClose: a.reviewedClose, fetchedClose: a.fetchedClose, ratio: +a.ratio.toFixed(6), secondDay: a.secondDay, secondRatio: +a.secondRatio.toFixed(6), words: [...new Set(a.disclosures.map(x => x.word))], disclosures: a.disclosures.map(x => ({title: x.title, publishedAt: x.publishedAt}))}))}};
}

if (process.argv[1] && path.resolve(process.argv[1]) === new URL(import.meta.url).pathname) {
  const arg = n => { const i = process.argv.indexOf(n); return i < 0 ? null : process.argv[i + 1]; };
  const root = process.cwd(), input = JSON.parse(await fs.readFile(path.join(root, 'public/data/input.json'), 'utf8')), calendar = JSON.parse(await fs.readFile(path.join(root, 'public/data/rolling-calendar.json'), 'utf8'));
  const {rollingOperationWindow} = await import('../../lib/rolling-operation.mjs');
  const now = arg('--now') ?? new Date().toISOString(), window = rollingOperationWindow(input, now, {calendar, runEndDate: null});
  const result = await collect(input, window, {now, calendar, rootDir: root, codes: arg('--codes')?.split(','), fixtureDir: arg('--fixture') ?? undefined});
  if (arg('--out')) await fs.writeFile(arg('--out'), JSON.stringify(result, null, 1));
  console.log(JSON.stringify({provider: result.provider, stats: result.stats, errors: result.errors.map(e => [e.code, e.stockCode, e.day]), observations: result.observations.map(o => [o.code, o.rows.map(r => r.date + ':' + r.close).join(' '), o.finalClose === true, o.crossCheck?.day])}));
  process.exitCode = result.errors.length ? 2 : 0;
}
