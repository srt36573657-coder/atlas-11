#!/usr/bin/env node
/**
 * ATLAS 11 · 시장·수급·뉴스·공시·거시 관측 수집기 (16:00 매일 실행의 앞 단계 · 실패해도 본 실행은 계속)
 *   node scripts/atlas11/collect_context.mjs [--now ISO] [--root DIR] [--fixtures DIR] [--codes 005930,196170]
 * 쓰는 것
 *   reports/atlas11/context/<day>/<시각>.json      그날 관측 묶음(해석한 값 · 출처 주소 · 원문 해시 · 오류)
 *   reports/atlas11/raw/context/<day>/<시각>.json.gz 받은 원문 그대로(주소 → 본문)
 *   reports/atlas11/context/latest.json            마지막 묶음 요약 + 요인 관측 현황(요인 기록·화면이 읽는다)
 *   reports/atlas11/ledger/collection/<day>.jsonl  수집 기록(종목별 수급·새 뉴스·새 공시 · 시장·거시) — 덮어쓰지 않음
 * 지키는 것: 결측을 0 으로 채우지 않는다 · 당일 수급은 잠정 표시 · 가격(종가·거래량)은 여기서 모으지 않는다 · 예측 숫자에 쓰지 않는다
 */
import fs from 'node:fs/promises';
import path from 'node:path';
import zlib from 'node:zlib';
import {promisify} from 'node:util';
import {CONTEXT_SCHEMA, CONTEXT_URLS, MACRO_SERIES, FRED_UA, macroURL, parseFredCSV, parseNaverSeries, parseIndexPrices, parseFlows, parseNews, parseDisclosures, flowRevisions, markProvisional, factorObservations, summarizeContext, sha256} from '../../lib/atlas11/context.mjs';
import {appendRecord} from '../../lib/atlas11/records.mjs';
import {loadUniverseConfig, switchDue, loadNextInput} from '../../lib/atlas11/universe-switch.mjs';

const gzip = promisify(zlib.gzip);
const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0 Safari/537.36';
const arg = (name, argv = process.argv) => { const i = argv.indexOf(name); return i < 0 ? null : argv[i + 1]; };
const koreaParts = at => { const d = new Date(Date.parse(at) + 9 * 3600000); return {day: d.toISOString().slice(0, 10), hm: d.toISOString().slice(11, 16)}; };
const readJSON = async (file, otherwise) => { try { return JSON.parse(await fs.readFile(file, 'utf8')); } catch (e) { if (e.code === 'ENOENT' && otherwise !== undefined) return otherwise; throw e; } };

/** 제한된 재시도 + 출처(호스트)별 차단기: 한 호스트가 연속 N번 실패하면 그 호스트의 남은 요청은 「출처 장애로 건너뜀」 */
export function makeFetcher({fixtures = null, timeoutMs = 15000, retries = 1, breakerAfter = 8, fetchImpl = globalThis.fetch} = {}) {
  const failures = new Map(), raw = new Map();
  let fixtureMap = null;
  const get = async (url, {ua = UA} = {}) => {
    const host = new URL(url).hostname;
    if ((failures.get(host) ?? 0) >= breakerAfter) return {ok: false, url, error: 'SOURCE_CIRCUIT_OPEN', attempts: []};
    if (fixtures) {
      fixtureMap ??= await readJSON(path.join(fixtures, 'urls.json'), {});
      const f = fixtureMap[url];
      if (!f) { failures.set(host, (failures.get(host) ?? 0) + 1); return {ok: false, url, error: 'FIXTURE_MISSING', attempts: [{attempt: 1, status: 0}]}; }
      const text = await fs.readFile(path.join(fixtures, f), 'utf8'); raw.set(url, text); failures.set(host, 0);
      return {ok: true, url, text, fetchedAt: '2026-09-30T07:05:00.000Z', attempts: [{attempt: 1, status: 200}]};
    }
    const attempts = [];
    for (let k = 0; k <= retries; k++) {
      const t = Date.now();
      try {
        const res = await fetchImpl(url, {headers: {'User-Agent': ua, Accept: '*/*', Referer: host.endsWith('naver.com') ? 'https://m.stock.naver.com/' : `https://${host}/`}, signal: AbortSignal.timeout(timeoutMs)});
        const text = await res.text(); attempts.push({attempt: k + 1, status: res.status, ms: Date.now() - t});
        if (res.ok) { raw.set(url, text); failures.set(host, 0); return {ok: true, url, text, fetchedAt: new Date().toISOString(), attempts}; }
        if (res.status === 404 || res.status === 410) break;
      } catch (e) { attempts.push({attempt: k + 1, status: 0, ms: Date.now() - t, error: String(e.message).slice(0, 120)}); }
      if (k < retries) await new Promise(r => setTimeout(r, 1500 * (k + 1)));
    }
    failures.set(host, (failures.get(host) ?? 0) + 1);
    return {ok: false, url, error: 'FETCH_FAILED', attempts};
  };
  return {get, raw};
}

async function pool(items, n, fn) { const out = new Array(items.length); let i = 0; await Promise.all(Array.from({length: Math.min(n, items.length)}, async () => { while (i < items.length) { const k = i++; out[k] = await fn(items[k], k); } })); return out; }

async function latestPreviousSnapshot(rootDir, day) {
  const base = path.join(rootDir, 'reports/atlas11/context');
  let days = []; try { days = (await fs.readdir(base)).filter(d => /^\d{4}-\d{2}-\d{2}$/.test(d) && d <= day).sort(); } catch (e) { if (e.code !== 'ENOENT') throw e; }
  for (const d of days.reverse()) { const files = (await fs.readdir(path.join(base, d))).filter(f => f.endsWith('.json')).sort(); if (files.length) return readJSON(path.join(base, d, files.at(-1))); }
  return null;
}

export async function collectContext({now = new Date().toISOString(), rootDir = process.cwd(), fixtures = null, codes = null, fetcher = null, log = () => {}} = {}) {
  const input = await readJSON(path.join(rootDir, 'public/data/input.json'));
  const calendar = await readJSON(path.join(rootDir, 'public/data/rolling-calendar.json'), input.calendar);
  const sessions = calendar.sessions, {day, hm} = koreaParts(now);
  let assets = input.assets.filter(a => !codes || codes.includes(a.code)).map(a => ({code: a.code, name: a.name}));
  if (!sessions.includes(day)) return {status: 'not_trading_day', day, written: null};
  // 종목을 바꾸는 날(config/atlas11/universe.json next.switchOn 이후 · 아직 안 바꿈)에는 새 묶음 회사도 함께 모은다
  //   이 수집은 16:00 매일 실행보다 먼저 돌므로, 이렇게 해야 바꾼 첫날 저녁부터 새 회사들의 공시·기사·수급이 화면에 보인다(2026-10-04 180곳)
  let nextUniverse = null, nextError = null;
  if (!codes) {
    try {
      const cfg = await loadUniverseConfig(rootDir);
      if (switchDue(cfg, input, day)) { const nx = await loadNextInput(rootDir, cfg.next), have = new Set(assets.map(a => a.code)), extra = nx.input.assets.filter(a => !have.has(a.code)).map(a => ({code: a.code, name: a.name})); assets = [...assets, ...extra]; nextUniverse = {id: cfg.next.id, count: nx.input.assets.length, added: extra.length, from: nx.from}; }
    } catch (e) { nextError = String(e.message); }
  }
  const afterClose = hm >= '15:40';
  const f = fetcher ?? makeFetcher({fixtures});
  const errors = nextError ? [{kind: 'universe_next', key: 'next', error: nextError}] : [], sources = [];
  const take = async (kind, key, url, parse, opts) => {
    const r = await f.get(url, opts);
    sources.push({kind, key, url, ok: r.ok, fetchedAt: r.fetchedAt ?? null, rawSHA256: r.ok ? sha256(r.text) : null, attempts: r.attempts});
    if (!r.ok) { errors.push({kind, key, url, error: r.error, attempts: r.attempts}); return null; }
    try { return {value: parse(r.text), fetchedAt: r.fetchedAt, rawSHA256: sha256(r.text), url}; }
    catch (e) { errors.push({kind, key, url, error: String(e.message)}); return null; }
  };
  // 시장 지수
  const index = (await pool(['KOSPI', 'KOSDAQ'], 2, s => take('index', s, CONTEXT_URLS.index(s), t => parseIndexPrices(t, s)))).filter(Boolean).map(x => ({...x.value, sourceUrl: x.url, rawSHA256: x.rawSHA256, fetchedAt: x.fetchedAt, rows: x.value.rows.filter(r => r.date < day || (r.date === day && afterClose))}));
  // 종목별 수급 · 뉴스 · 공시 (한 종목씩 · 동시 4)
  const flows = [], news = [], disclosures = [];
  await pool(assets, 4, async a => {
    const fl = await take('flows', a.code, CONTEXT_URLS.flows(a.code), t => parseFlows(t, a.code));
    if (fl) flows.push({code: a.code, name: a.name, sourceUrl: fl.url, rawSHA256: fl.rawSHA256, fetchedAt: fl.fetchedAt, rows: fl.value.rows.filter(r => r.date < day || (r.date === day && afterClose))});
    const nw = await take('news', a.code, CONTEXT_URLS.news(a.code), t => parseNews(t, a.code, {name: a.name}));
    if (nw) news.push({...nw.value, name: a.name, sourceUrl: nw.url, rawSHA256: nw.rawSHA256, fetchedAt: nw.fetchedAt});
    const ds = await take('disclosures', a.code, CONTEXT_URLS.disclosures(a.code), t => parseDisclosures(t, a.code));
    if (ds) disclosures.push({...ds.value, name: a.name, sourceUrl: ds.url, rawSHA256: ds.rawSHA256, fetchedAt: ds.fetchedAt});
  });
  const byCode = (a, b) => a.code.localeCompare(b.code); flows.sort(byCode); news.sort(byCode); disclosures.sort(byCode);
  // 거시 — 공식(FRED) 먼저, 대체 출처는 공식이 실패했을 때만(출처 전환 기록)
  const from = new Date(Date.parse(day) - 120 * 864e5).toISOString().slice(0, 10);
  const macro = [];
  for (const s of MACRO_SERIES.filter(s => !s.fallbackFor)) {
    const got = await take('macro', s.id, macroURL(s, {from}), t => s.provider === 'fred' ? parseFredCSV(t, s.id) : parseNaverSeries(t), s.provider === 'fred' ? {ua: FRED_UA} : {});
    if (got && got.value.length) { macro.push({...s, rows: got.value.filter(r => r.date <= day).slice(-60), sourceUrl: got.url, rawSHA256: got.rawSHA256, fetchedAt: got.fetchedAt, switchedFrom: null}); continue; }
    const alt = MACRO_SERIES.find(x => x.fallbackFor === s.id);
    if (!alt) continue;
    const g2 = await take('macro', alt.id, macroURL(alt), t => parseNaverSeries(t));
    if (g2 && g2.value.length) macro.push({...alt, rows: g2.value.filter(r => r.date <= day).slice(-60), sourceUrl: g2.url, rawSHA256: g2.rawSHA256, fetchedAt: g2.fetchedAt, switchedFrom: s.id, switchReason: `${s.id}(${s.provider}) 수집 실패 → ${alt.id}(${alt.provider})`});
  }
  // 정정(잠정 → 확정) · 이전 묶음과 비교
  const previous = await latestPreviousSnapshot(rootDir, day);
  const flowsMarked = markProvisional(flows, day);
  const revisions = flowRevisions(previous?.flows ?? [], flowsMarked);
  const seenNews = new Set((previous?.news ?? []).flatMap(n => n.items.map(i => i.id))), seenDisc = new Set((previous?.disclosures ?? []).flatMap(d => d.items.map(i => i.id)));
  const ctx = {schema: CONTEXT_SCHEMA, day, fetchedAt: now, afterClose, assets: assets.length, ...(nextUniverse ? {nextUniverse} : {}), index, flows: flowsMarked, news, disclosures, macro, revisions, errors, sources: sources.map(({attempts, ...s}) => ({...s, attempts: attempts?.length ?? 0})), previousSnapshot: previous ? {day: previous.day, fetchedAt: previous.fetchedAt} : null, usedInForecast: false,
    policy: {prices: '종가·시고저·거래량은 이 수집기에서 받지 않는다(정규장 값 확인 불가 · 대체거래소 거래 섞임)', missing: '결측은 null · 0 으로 채우지 않음', sameDayFlows: '당일 투자자 수급은 16:00 에 잠정일 수 있어 provisional_same_day 로 표시 · 다음 수집에서 값이 바뀌면 revisions 에 기록', beforeClose: '15:40 KST 전 실행이면 당일 행을 버린다'}};
  ctx.summary = summarizeContext(ctx);
  ctx.factors = factorObservations(ctx, sessions);
  // 저장 — 같은 날 여러 번 돌면 파일을 더한다(덮어쓰지 않음)
  const stamp = now.replace(/[:.]/g, '-'), dir = path.join(rootDir, 'reports/atlas11/context', day), rawDir = path.join(rootDir, 'reports/atlas11/raw/context', day);
  await fs.mkdir(dir, {recursive: true}); await fs.mkdir(rawDir, {recursive: true});
  const file = path.join(dir, stamp + '.json');
  await fs.writeFile(file, JSON.stringify(ctx), {flag: 'wx'}).catch(async e => { if (e.code !== 'EEXIST') throw e; });
  await fs.writeFile(path.join(rawDir, stamp + '.json.gz'), await gzip(JSON.stringify(Object.fromEntries(f.raw))));
  const latest = {schema: 'atlas11-context-latest-1', day, fetchedAt: now, file: path.relative(rootDir, file), summary: ctx.summary, factors: ctx.factors, errors: errors.length, usedInForecast: false};
  await fs.writeFile(path.join(rootDir, 'reports/atlas11/context/latest.json'), JSON.stringify(latest, null, 1));
  // 기록 장부 — 시장·거시 한 건 + 종목별(수급 최근 3일·새 뉴스·새 공시)
  const rec = body => appendRecord(rootDir, {type: 'collection', at: now, body, links: {contextFile: path.relative(rootDir, file)}});
  let records = 0;
  const r0 = await rec({kind: 'context_market', day, status: errors.length ? 'partial' : 'ok', index: index.map(i => ({symbol: i.symbol, rows: i.rows.slice(-3), sourceUrl: i.sourceUrl, rawSHA256: i.rawSHA256})), macro: macro.map(m => ({id: m.id, factorId: m.factorId, label: m.label, provider: m.provider, latest: m.rows.at(-1) ?? null, sourceUrl: m.sourceUrl, rawSHA256: m.rawSHA256, switchedFrom: m.switchedFrom ?? null})), summary: ctx.summary, errors: errors.map(e => ({kind: e.kind, key: e.key, error: e.error})), usedInForecast: false}); if (!r0.duplicate) records++;
  for (const fl of flowsMarked) { const revs = revisions.filter(r => r.code === fl.code); const r = await rec({kind: 'context_flows', day, code: fl.code, name: fl.name, rows: fl.rows.slice(-3), revisions: revs, sourceUrl: fl.sourceUrl, rawSHA256: fl.rawSHA256, status: revs.length ? '정정 있음' : fl.rows.some(x => x.status === 'provisional_same_day') ? '당일 잠정' : '보고값', usedInForecast: false}); if (!r.duplicate) records++; }
  for (const n of news) { const fresh = n.items.filter(i => !seenNews.has(i.id)); if (!fresh.length) continue; const r = await rec({kind: 'context_news', day, code: n.code, name: n.name, items: fresh.map(({id, office, publishedAt, title, url, duplicateOf, mentionsName}) => ({id, office, publishedAt, title, url, duplicateOf, mentionsName})), distinct: fresh.filter(i => !i.duplicateOf).length, republished: fresh.filter(i => i.duplicateOf).length, sourceUrl: n.sourceUrl, rawSHA256: n.rawSHA256, status: '새 기사', usedInForecast: false}); if (!r.duplicate) records++; }
  for (const d of disclosures) { const fresh = d.items.filter(i => !seenDisc.has(i.id)); if (!fresh.length) continue; const r = await rec({kind: 'context_disclosures', day, code: d.code, name: d.name, items: fresh, corporateActions: fresh.filter(i => i.corporateAction).length, sourceUrl: d.sourceUrl, rawSHA256: d.rawSHA256, status: fresh.some(i => i.corporateAction) ? '기업행위 공시' : '새 공시', usedInForecast: false}); if (!r.duplicate) records++; }
  const status = sources.every(s => !s.ok) ? 'failed' : errors.length ? 'partial' : 'ok';
  log({status, day, file: latest.file, errors: errors.length, records});
  return {status, day, afterClose, written: latest.file, records, errors: errors.length, summary: ctx.summary, factorsObserved: Object.values(ctx.factors).filter(x => x.observed).map(x => x.factorId)};
}

if (process.argv[1] && path.resolve(process.argv[1]) === new URL(import.meta.url).pathname) {
  const out = await collectContext({now: arg('--now') ?? new Date().toISOString(), rootDir: arg('--root') ?? process.cwd(), fixtures: arg('--fixtures'), codes: arg('--codes')?.split(',') ?? null});
  console.log(JSON.stringify(out));
  process.exitCode = out.status === 'failed' ? 2 : 0;
}
