/**
 * ATLAS 11 · 「튼튼한 회사 52곳」 고르기 자료 모으기 — .github/workflows/atlas11-universe.yml 에서 사장님이 단추를 눌러야만 돈다.
 *   node scripts/atlas11/collect_universe.mjs --now ISO [--out-dir reports/atlas11/universe/<날짜>] [--fixture dir] [--from-bundle file.json.gz]
 *
 * 하는 일(전망·발행·채점은 하지 않는다 · 지금 화면의 52종목도 바꾸지 않는다 — 바꾸는 것은 config/atlas11/universe.json 이 정한 날의 매일 실행)
 *   ① 시가총액 목록(코스피·코스닥) ② 업종 이름표 ③ 후보마다 회사 요약(시총·업종) → 시가총액 순위 ④ 상위 300곳 결산 자료와 일봉 이력
 *   ⑤ 받은 원문을 통째로 bundle.json.gz 에 보관(규칙을 고쳐도 다시 받지 않고 같은 원문으로 다시 고를 수 있게) ⑥ 규칙(lib/atlas11/universe.mjs)대로 52곳 → proposal.json
 *   ⑦ 새 입력(next-input.json) — 지금 52종목에 이미 있는 종목은 지금 가격 기록을 그대로 이어 쓴다
 * 원천(모두 네이버 · 이 저장소의 다른 수집기와 같은 곳)
 *   목록  https://m.stock.naver.com/api/stocks/marketValue/{KOSPI|KOSDAQ}?page=&pageSize=100  (안 되면 https://finance.naver.com/sise/sise_market_sum.naver?sosok=0|1&page=)
 *   업종  https://finance.naver.com/sise/sise_group.naver?type=upjong   (업종 번호 = 회사 요약의 industryCode)
 *   요약  https://m.stock.naver.com/api/stock/{code}/integration   (2026-09-29 실제 응답 확인됨)
 *   결산  https://m.stock.naver.com/api/stock/{code}/finance/annual  (안 되면 https://finance.naver.com/item/main.naver?code= 의 「기업실적분석」 표)
 *   일봉  https://fchart.stock.naver.com/sise.nhn?symbol={code}&timeframe=day&count=840&requestType=0
 */
import fs from 'node:fs/promises';
import path from 'node:path';
import zlib from 'node:zlib';
import {createHash} from 'node:crypto';
import {fetchWithRetry, parseFchartXml} from './collect_naver.mjs';
import {QUALITY52, QT180, I36, S365, selectQualityTrend, selectIndustry36, selectSub365, parseKindCorpList, industryNameFrom, parseIndustryList, BUNDLE_SCHEMA, UNIVERSE_SCHEMA, parseMarketValueJson, parseMarketSumHtml, parseUpjongList, parseIntegration, parseFinanceJson, notCommon, parseCopAnalysisHtml, financeMetrics, historyCheck, selectQuality52, buildNextInput, whyLine} from '../../lib/atlas11/universe.mjs';
import {groupIdOfSector} from '../../lib/atlas11/groups.mjs';

const sha = s => createHash('sha256').update(s).digest('hex');
const kst = iso => new Date(Date.parse(iso) + 9 * 3600000).toISOString();
const sleep = ms => new Promise(r => setTimeout(r, ms));
export const URLS = Object.freeze({
  mvJson: (market, page) => `https://m.stock.naver.com/api/stocks/marketValue/${market}?page=${page}&pageSize=100`,
  mvHtml: (sosok, page) => `https://finance.naver.com/sise/sise_market_sum.naver?sosok=${sosok}&page=${page}`,
  upjong: 'https://finance.naver.com/sise/sise_group.naver?type=upjong',
  integration: code => `https://m.stock.naver.com/api/stock/${code}/integration`,
  financeJson: code => `https://m.stock.naver.com/api/stock/${code}/finance/annual`,
  financeHtml: code => `https://finance.naver.com/item/main.naver?code=${code}`,
  fchart: code => `https://fchart.stock.naver.com/sise.nhn?symbol=${code}&timeframe=day&count=840&requestType=0`,
  // 2026-10-05 05:07 「180개를 365개로 · 업종도 늘리고 더 세분화」 — 한국거래소 KIND 상장회사 목록(업종 = 한국표준산업분류 · 주요제품)
  kind: 'https://kind.krx.co.kr/corpgeneral/corpList.do?method=download&searchType=13',
  // 네이버 업종 이름표 쪽이 바뀐 뒤(2026-10-04) 이름을 찾을 길 — 되는 길 하나를 첫 번호로 고른 뒤 그 길로만 · 받은 원문은 보관(안 되면 다음에 고칠 근거)
  industryList: Object.freeze(['https://m.stock.naver.com/api/stocks/industry?page=1&pageSize=100', 'https://m.stock.naver.com/api/stocks/industry']),
  industryRoutes: Object.freeze([no => `https://m.stock.naver.com/api/stocks/industry/${no}?page=1&pageSize=5`, no => `https://finance.naver.com/sise/sise_group_detail.naver?type=upjong&no=${no}`, no => `https://stock.naver.com/market/stock/kr/industry/${no}`]),
});
// 2026-10-04 21:04 사장님 「업종 36개에서 180개 회사를 찾아…」 — 업종마다 5곳을 채우려면 300위 밖 회사도 봐야 한다 → 목록을 더 깊이(코스피·코스닥 각 600곳) · 결산·일봉은 시가총액 900위까지
// 2026-10-05 05:07 「180개를 365개로 · 업종도 늘리고 더 세분화」 → 목록 코스피·코스닥 각 900곳 · 결산·일봉 시가총액 1300위까지(업종 73개마다 5곳)
const MARKETS = Object.freeze([{market: 'KOSPI', sosok: 0, jsonPages: 9, htmlPages: 18, take: 900}, {market: 'KOSDAQ', sosok: 1, jsonPages: 9, htmlPages: 18, take: 900}]);
/** 결산 자료·일봉을 받는 깊이(시가총액 순위) — 고르기 규칙의 poolTop(300 등)과 따로 · 규칙은 자기 poolTop 안에서만 고른다 */
export const BUNDLE_DEPTH = 1300;

/** 재생 모드: <dir>/urls.json 의 {url: 파일} 대로 읽는다(없는 주소는 404) */
export function fixtureMapFetch(dir) {
  let map = null;
  return async url => {
    map ??= JSON.parse(await fs.readFile(path.join(dir, 'urls.json'), 'utf8'));
    const file = map[url]; if (!file) return new Response('fixture missing', {status: 404});
    const bytes = await fs.readFile(path.join(dir, file));
    return new Response(bytes, {status: 200, headers: {'content-type': file.endsWith('.json') ? 'application/json; charset=utf-8' : file.endsWith('.xml') ? 'text/xml; charset=utf-8' : 'text/html; charset=utf-8'}});
  };
}
async function pool(items, limit, worker, delayMs = 0) {
  const out = new Array(items.length); let next = 0;
  await Promise.all(Array.from({length: Math.max(1, Math.min(limit, items.length))}, async () => { while (next < items.length) { const i = next++; out[i] = await worker(items[i], i); if (delayMs) await sleep(delayMs); } }));
  return out;
}

/** 네트워크로 받기 → bundle(원문 그대로) */
export async function collectBundle({now, fetch = globalThis.fetch, concurrency = 3, politeDelayMs = 200, fallbackCodes = [], log = () => {}} = {}) {
  const requests = [], errors = [];
  const get = async url => {
    const t0 = Date.now();
    try { const r = await fetchWithRetry(url, {fetch, retries: 2, backoffMs: [800, 2400], timeoutMs: 20000}); requests.push({url, status: r.status, bytes: r.bytes.length, ms: Date.now() - t0}); return {url, status: r.status, text: r.text, rawHash: r.rawHash, fetchedAt: r.fetchedAt}; }
    catch (e) { requests.push({url, status: e.attempts?.at(-1)?.status ?? 0, error: String(e.message).slice(0, 160), ms: Date.now() - t0}); return {url, status: e.attempts?.at(-1)?.status ?? 0, text: null, error: String(e.message).slice(0, 160)}; }
  };
  // ① 시가총액 목록
  const lists = {source: null, pages: []};
  let pool0 = [];
  for (const m of MARKETS) {
    let rows = [], pages = [];
    // JSON 이 한 쪽이라도 틀리면(받기 실패·모양 다름) 그 시장은 처음부터 HTML 표로 · 빈 쪽이 나오면 거기서 끝(목록 끝)
    let jsonFailed = false;
    for (let p = 1; p <= m.jsonPages; p++) { const r = await get(URLS.mvJson(m.market, p)); pages.push({market: m.market, kind: 'json', ...r}); try { if (!r.text) throw Error('no body'); const got = parseMarketValueJson(r.text, m.market); if (!got.length) break; rows.push(...got); } catch (e) { errors.push({step: 'list_json', market: m.market, page: p, error: String(e.message)}); jsonFailed = true; break; } }
    let source = 'json';
    if (jsonFailed || !rows.length) {
      source = 'html'; rows = [];
      for (let p = 1; p <= m.htmlPages; p++) { const r = await get(URLS.mvHtml(m.sosok, p)); pages.push({market: m.market, kind: 'html', ...r}); try { if (!r.text) throw Error('no body'); rows.push(...parseMarketSumHtml(r.text, m.market)); } catch (e) { errors.push({step: 'list_html', market: m.market, page: p, error: String(e.message)}); break; } }
    }
    lists.pages.push(...pages); lists.source = lists.source && lists.source !== source ? 'mixed' : source;
    const seen = new Set(); pool0.push(...rows.filter(r => !seen.has(r.code) && seen.add(r.code)).slice(0, m.take));
    log(`목록 ${m.market} ${source} ${rows.length}`);
  }
  let poolCodes = [...new Map(pool0.filter(r => !notCommon(r.code, r.name)).map(r => [r.code, r])).values()];
  // 목록을 둘 다 못 받으면: 지금 52종목 + 그 업종의 시가총액 큰 이웃(회사 요약의 industryCompareInfo · 실제 응답 확인됨)으로 후보를 만든다
  if (!poolCodes.length && fallbackCodes.length) {
    lists.source = 'peers';
    const seen = new Map(fallbackCodes.map(code => [code, {code, name: null, market: null, endType: null, listValue: null}]));
    await pool(fallbackCodes, concurrency, async code => { const r = await get(URLS.integration(code)); try { for (const p of parseIntegration(r.text).industryPeers) if (/^\d{6}$/.test(p.code) && !seen.has(p.code)) seen.set(p.code, {code: p.code, name: p.name, market: null, endType: null, listValue: null}); } catch (e) { errors.push({step: 'peers', code, error: String(e.message)}); } }, politeDelayMs);
    poolCodes = [...seen.values()].filter(r => !notCommon(r.code, r.name ?? ''));
    log(`목록 대신 이웃 ${poolCodes.length}`);
  }
  // ② 업종 이름표(옛 모양 — 2026-10-04 부터 화면이 바뀌어 이름이 안 들어 있음 · 그대로 보관)
  const upjong = await get(URLS.upjong);
  // ②-1 한국거래소 KIND 상장회사 목록(업종 = 한국표준산업분류) — EUC-KR 표 · 글자가 깨지면 EUC-KR 로 다시 읽는다
  let kind;
  { const t0 = Date.now();
    try { const r = await fetchWithRetry(URLS.kind, {fetch, retries: 2, backoffMs: [800, 2400], timeoutMs: 45000}); requests.push({url: URLS.kind, status: r.status, bytes: r.bytes.length, ms: Date.now() - t0});
      let text = r.text; if (/\uFFFD/.test(text) || !/[가-힣]/.test(text)) { try { text = new TextDecoder('euc-kr').decode(r.bytes); } catch { /* 그대로 */ } }
      kind = {url: URLS.kind, status: r.status, text, rawHash: r.rawHash, fetchedAt: r.fetchedAt};
      try { kind.parsed = parseKindCorpList(text).size; } catch (e) { errors.push({step: 'kind', error: String(e.message)}); }
    } catch (e) { requests.push({url: URLS.kind, status: e.attempts?.at(-1)?.status ?? 0, error: String(e.message).slice(0, 160), ms: Date.now() - t0}); kind = {url: URLS.kind, status: e.attempts?.at(-1)?.status ?? 0, text: null, error: String(e.message).slice(0, 160)}; errors.push({step: 'kind', error: String(e.message).slice(0, 160)}); }
    log(`KRX 업종 ${kind.parsed ?? 0}곳`); }
  // ③ 회사 요약(시총·업종)
  const stocks = {};
  await pool(poolCodes, concurrency, async r => { stocks[r.code] = {list: r, integration: await get(URLS.integration(r.code))}; }, politeDelayMs);
  log(`요약 ${Object.keys(stocks).length}`);
  // ③-1 네이버 업종 이름 — 목록 길을 먼저, 모자라면 업종 번호마다(되는 길 하나를 첫 번호로 고름) · 원문은 짧게 잘라 보관
  const industryCodes = [...new Set(Object.values(stocks).map(s => { try { return parseIntegration(s.integration?.text ?? '').industryCode; } catch { return null; } }).filter(Boolean))].sort();
  const industryNames = {}, industryProbes = [], cut = (r, n = 6000) => ({url: r.url, status: r.status, error: r.error ?? null, text: r.text ? r.text.slice(0, n) : null});
  for (const u of URLS.industryList) { const r = await get(u); industryProbes.push(cut(r, 20000)); for (const x of r.text ? parseIndustryList(r.text) : []) industryNames[x.no] ??= x.name; }
  let route = null;
  if (industryCodes.some(no => !industryNames[no])) for (const [k, rt] of URLS.industryRoutes.entries()) { const no = industryCodes.find(n => !industryNames[n]); const r = await get(rt(no)); industryProbes.push(cut(r)); const nm = industryNameFrom(r.text, no); if (nm) { industryNames[no] = nm; route = k; break; } }
  if (route != null) await pool(industryCodes.filter(no => !industryNames[no]), concurrency, async no => { const r = await get(URLS.industryRoutes[route](no)); const nm = industryNameFrom(r.text, no); if (nm) industryNames[no] = nm; else industryProbes.push(cut(r, 3000)); }, politeDelayMs);
  // 새 업종 화면의 코드 조각(이름을 어디서 받아 오는지 찾을 근거) — 앞 6개만
  const chunks = [];
  for (const p of [...new Set(upjong.text?.match(/\/imgstock\/[^"'\s]*industry[^"'\s]*\.js/g) ?? [])].slice(0, 6)) { const r = await get('https://ssl.pstatic.net' + p); chunks.push({url: r.url, status: r.status, text: r.text ? r.text.slice(0, 300000) : null}); }
  log(`네이버 업종 이름 ${Object.keys(industryNames).length}/${industryCodes.length}`);
  // ④ 시가총액 상위 BUNDLE_DEPTH 곳(보통주) — 결산 · 일봉
  const ranked = rankByCap(stocks).slice(0, BUNDLE_DEPTH);
  await pool(ranked, concurrency, async ({code}) => {
    const s = stocks[code];
    const fj = await get(URLS.financeJson(code)); let finance = {kind: 'json', ...fj};
    let ok = false; try { if (fj.text) { parseFinanceJson(fj.text); ok = true; } } catch { ok = false; }
    if (!ok) { const fh = await get(URLS.financeHtml(code)); const at = fh.text?.indexOf('cop_analysis') ?? -1; finance = {kind: 'html', url: fh.url, status: fh.status, error: fh.error, jsonStatus: fj.status, jsonError: fj.error ?? (fj.text ? 'FINANCE_JSON_SHAPE' : null), text: at >= 0 ? fh.text.slice(at, fh.text.indexOf('</table>', at) + 8) : null, jsonText: fj.text ? fj.text.slice(0, 4000) : null}; }
    s.finance = finance;
    const fc = await get(URLS.fchart(code));
    let rows = null; try { rows = fc.text ? parseFchartXml(fc.text).rows.map(r => [r.date.replaceAll('-', ''), r.open, r.high, r.low, r.close, r.volume]) : null; } catch (e) { errors.push({step: 'fchart', code, error: String(e.message)}); }
    s.fchart = {url: fc.url, status: fc.status, fetchedAt: fc.fetchedAt ?? null, rawHash: fc.rawHash ?? null, error: fc.error ?? null, rows};
  }, politeDelayMs);
  log(`결산·일봉 ${ranked.length}`);
  const failed = requests.filter(r => r.error || !(r.status >= 200 && r.status < 300)).length;
  return {schema: BUNDLE_SCHEMA, now, collectedAt: new Date().toISOString(), lists, upjong, kind, industryNames, industryRoute: route, industryProbes, chunks, stocks, errors, requests: {total: requests.length, ok: requests.length - failed, failed, sample: requests.filter(r => r.error).slice(0, 20)}};
}
function rankByCap(stocks) {
  const rows = [];
  for (const [code, s] of Object.entries(stocks)) {
    let integ = null; try { integ = s.integration?.text ? parseIntegration(s.integration.text) : null; } catch { integ = null; }
    const name = integ?.name ?? s.list?.name ?? '';
    if (!integ || !(integ.marketCapEok > 0) || notCommon(code, name) || (integ.endType && integ.endType !== 'stock')) continue;
    rows.push({code, cap: integ.marketCapEok});
  }
  return rows.sort((a, b) => b.cap - a.cap || a.code.localeCompare(b.code)).map((r, i) => ({...r, capRank: i + 1}));
}

/** bundle → 후보 목록(네트워크 없음) */
export function candidatesFromBundle(bundle, {sessions, asOf, input = null}) {
  let upjong = []; try { upjong = bundle.upjong?.text ? parseUpjongList(bundle.upjong.text) : []; } catch { upjong = []; }
  const sectorOf = new Map(upjong.map(u => [u.no, u.name]));
  for (const [no, name] of Object.entries(bundle.industryNames ?? {})) if (!sectorOf.has(no)) sectorOf.set(no, name); // 2026-10-05 새 길로 받은 이름
  let kindOf = new Map(); try { kindOf = bundle.kind?.text ? parseKindCorpList(bundle.kind.text) : new Map(); } catch { kindOf = new Map(); }
  // 업종 이름표를 못 받았거나 빠진 번호: 지금 52종목의 업종 이름(입력)과 그 회사 요약의 업종 번호를 짝지어 채운다
  for (const a of input?.assets ?? []) { try { const n = parseIntegration(bundle.stocks[a.code]?.integration?.text ?? '').industryCode; if (n && !sectorOf.has(n) && a.sector) sectorOf.set(n, a.sector); } catch { /* 요약 없음 */ } }
  const ranks = new Map(rankByCap(bundle.stocks).map(r => [r.code, r.capRank]));
  const out = [];
  for (const [code, s] of Object.entries(bundle.stocks)) {
    if (!ranks.has(code)) continue;
    const integ = parseIntegration(s.integration.text);
    let fin = null, finError = null;
    try { fin = s.finance?.text ? (s.finance.kind === 'json' ? parseFinanceJson(s.finance.text) : parseCopAnalysisHtml(s.finance.text)) : null; } catch (e) { finError = String(e.message); }
    const rows = (s.fchart?.rows ?? []).map(([d, o, h, l, c, v]) => ({date: `${d.slice(0, 4)}-${d.slice(4, 6)}-${d.slice(6, 8)}`, open: o, high: h, low: l, close: c, volume: v}));
    out.push({code, name: integ.name ?? s.list?.name, market: s.list?.market ?? null, endType: integ.endType, industryCode: integ.industryCode, sector: sectorOf.get(integ.industryCode) ?? null, ksic: kindOf.get(code)?.ksic ?? null, products: kindOf.get(code)?.products ?? null,
      capRank: ranks.get(code), marketCapEok: integ.marketCapEok, eps: integ.eps, bps: integ.bps, per: integ.per, pbr: integ.pbr, dividendYield: integ.dividendYield,
      metrics: financeMetrics(fin), financeSource: fin?.source ?? null, financeError: finError ?? s.finance?.error ?? null,
      history: s.fchart?.rows ? historyCheck(rows, sessions, {asOf}) : null, rowsCount: rows.length, fchart: {url: s.fchart?.url ?? null, fetchedAt: s.fchart?.fetchedAt ?? null, rawHash: s.fchart?.rawHash ?? null}, _rows: rows});
  }
  return out.sort((a, b) => a.capRank - b.capRank);
}

/** 마지막으로 끝난 거래일(15:40 KST 이후면 그날 포함) */
export function lastCompletedSession(sessions, now) {
  const k = kst(now), day = k.slice(0, 10), clock = k.slice(11, 16);
  return sessions.filter(d => d < day || (d === day && clock >= '15:40')).at(-1) ?? null;
}

/** bundle → proposal + 새 입력 (쓰지는 않음) */
/** 규칙 판 이름 → 규칙(기본은 config/atlas11/universe.json 의 selectRules · 없으면 q52-v2) */
export const RULE_SETS = Object.freeze({'q52-v2': QUALITY52, 'qt180-v1': QT180, 'i36-v1': I36, 's365-v1': S365});
export function proposeFromBundle(bundle, {input, now, rules = QUALITY52}) {
  const sessions = input.calendar.sessions, asOf = lastCompletedSession(sessions, bundle.now ?? now), day = kst(bundle.now ?? now).slice(0, 10);
  const candidates = candidatesFromBundle(bundle, {sessions, asOf, input});
  // 2026-10-04 18:10 「180개 회사 · 우량주 그리고 시대 트랜드 주식만」 → qt180-v1 은 우량 전부 + 트렌드 업종으로 채움
  // 2026-10-04 21:04 「업종 36개에서 180개 회사를 찾아…」 → i36-v1 은 업종마다 5곳 · 36개 업종
  // 2026-10-05 05:07 「180개를 365개로 · 업종도 늘리고 더 세분화」 → s365-v1 은 KRX 업종(한국표준산업분류)마다 5곳 · 73개 업종
  const sel = rules.mix === 'sub-industry' ? selectSub365(candidates, rules) : rules.mix === 'industry' ? selectIndustry36(candidates, rules) : rules.mix === 'quality-first' ? selectQualityTrend(candidates, rules) : selectQuality52(candidates, rules);
  const id = `u2-${rules.version}-${day}`;
  const strip = c => { const {_rows, ...rest} = c; return rest; };
  const picked = sel.picked.map(c => ({rank: c.rank, code: c.code, name: c.name, market: c.market, sector: c.sector, ...(c.industry ? {industry: c.industry, industryRank: c.industryRank} : {}), ...(c.ksic ? {ksic: c.ksic, groupBy: c.groupBy ?? null} : {}), group: groupIdOfSector(c.sector), capRank: c.capRank, marketCapEok: c.marketCapEok, score: Number.isFinite(c.score) ? Number(c.score.toFixed(4)) : null, parts: c.parts ? Object.fromEntries(Object.entries(c.parts).map(([k, v]) => [k, Number(v.toFixed(4))])) : null, debtExempt: c.debtExempt, metrics: c.metrics, financeSource: c.financeSource, carried: input.assets.some(a => a.code === c.code), why: whyLine(c),
    ...(c.kind ? {kind: c.kind, trend: c.trend ? {id: c.trend.id, label: c.trend.label} : null, fails: c.fails.map(x => x.replace(/\(.*\)/, ''))} : {})}));
  const nearMiss = sel.checked.filter(c => c.fails.length).slice(0, 80).map(c => ({code: c.code, name: c.name, capRank: c.capRank, sector: c.sector, fails: c.fails}));
  const proposal = {schema: UNIVERSE_SCHEMA, id, createdAt: now, collectedAt: bundle.collectedAt, asOf, ok: sel.ok, rules: {...rules, perSectorMax: Number.isFinite(rules.perSectorMax) ? rules.perSectorMax : null, applied: {step: sel.step, ...sel.rules, perSectorMax: Number.isFinite(sel.rules.perSectorMax) ? sel.rules.perSectorMax : null}}, counts: sel.counts,
    listSource: bundle.lists?.source ?? null, kindRows: (() => { try { return bundle.kind?.text ? parseKindCorpList(bundle.kind.text).size : 0; } catch { return 0; } })(), industryNames: Object.keys(bundle.industryNames ?? {}).length, industryRoute: bundle.industryRoute ?? null, requests: bundle.requests, errors: (bundle.errors ?? []).slice(0, 50), financeSources: tallyBy(candidates, c => c.financeSource ?? (c.financeError ? 'error' : 'none')),
    picked, notPicked: nearMiss, previous: {id: input.universe?.id ?? 'u1-sector52', codes: input.assets.map(a => a.code)},
    overlap: {kept: picked.filter(p => p.carried).map(p => p.code), added: picked.filter(p => !p.carried).map(p => p.code), dropped: input.assets.filter(a => !picked.some(p => p.code === a.code)).map(a => a.code)}};
  let next = null;
  if (sel.ok) {
    const histories = Object.fromEntries(sel.picked.map(c => [c.code, {rows: c._rows, url: c.fchart.url, fetchedAt: c.fchart.fetchedAt}]));
    next = buildNextInput(input, sel.picked, {histories, now, proposalId: id, rules: sel.rules});
  }
  return {proposal, next, candidates: candidates.map(strip)};
}
const tallyBy = (xs, f) => xs.reduce((m, x) => { const k = f(x); m[k] = (m[k] ?? 0) + 1; return m; }, {});

export async function writeOutputs({rootDir, outDir, bundle, proposal, next, bundleRef = null}) {
  const dir = path.join(rootDir, outDir); await fs.mkdir(dir, {recursive: true});
  if (bundleRef) { const gz = await fs.readFile(path.join(rootDir, bundleRef)); proposal.bundle = {file: bundleRef, sha256: sha(gz), bytes: gz.length, reused: true}; } // 같은 원문으로 다시 고름(다시 받지 않음)
  else { const gz = zlib.gzipSync(Buffer.from(JSON.stringify(bundle)), {level: 9}); await fs.writeFile(path.join(dir, 'bundle.json.gz'), gz); proposal.bundle = {file: path.join(outDir, 'bundle.json.gz'), sha256: sha(gz), bytes: gz.length}; }
  if (next) { const text = JSON.stringify(next); await fs.writeFile(path.join(dir, 'next-input.json'), text); proposal.nextInput = {file: path.join(outDir, 'next-input.json'), sha256: sha(text), actualAsOf: next.actualAsOf, assets: next.assets.length}; }
  await fs.writeFile(path.join(dir, 'proposal.json'), JSON.stringify(proposal, null, 1));
  await fs.writeFile(path.join(rootDir, 'reports/atlas11/universe/latest.json'), JSON.stringify({id: proposal.id, dir: outDir, ok: proposal.ok, picked: proposal.picked.length, createdAt: proposal.createdAt, counts: proposal.counts}, null, 1));
  return proposal;
}

if (process.argv[1] && path.resolve(process.argv[1]) === new URL(import.meta.url).pathname) {
  const arg = k => { const i = process.argv.indexOf(k); return i >= 0 ? process.argv[i + 1] : null; };
  const root = process.cwd(), now = arg('--now') ?? new Date().toISOString(), day = kst(now).slice(0, 10);
  // 같은 날 폴더가 이미 있으면 덮어쓰지 않고 시각을 붙인 새 폴더(옛 원문·제안은 그대로 둔다)
  const exists = async d => fs.access(path.join(root, d)).then(() => true, () => false);
  let outDir = arg('--out-dir') ?? `reports/atlas11/universe/${day}`;
  if (!arg('--out-dir') && await exists(outDir)) outDir = `reports/atlas11/universe/${day}-${kst(now).slice(11, 16).replace(':', '')}`;
  const input = JSON.parse(await fs.readFile(path.join(root, 'public/data/input.json'), 'utf8'));
  let bundle;
  if (arg('--from-bundle')) bundle = JSON.parse(zlib.gunzipSync(await fs.readFile(arg('--from-bundle'))).toString('utf8'));
  else bundle = await collectBundle({now, fetch: arg('--fixture') ? fixtureMapFetch(arg('--fixture')) : globalThis.fetch, fallbackCodes: input.assets.map(a => a.code), log: m => console.log(m)});
  await fs.mkdir(path.join(root, 'reports/atlas11/universe'), {recursive: true});
  // 규칙 판: --rules 이름 → config/atlas11/universe.json 의 selectRules → q52-v2
  let config = null; try { config = JSON.parse(await fs.readFile(path.join(root, 'config/atlas11/universe.json'), 'utf8')); } catch { config = null; }
  const ruleName = arg('--rules') ?? config?.selectRules ?? 'q52-v2', rules = RULE_SETS[ruleName];
  if (!rules) throw Error('UNKNOWN_RULES ' + ruleName);
  let proposal, next;
  try { ({proposal, next} = proposeFromBundle(bundle, {input, now, rules})); }
  catch (e) { proposal = {schema: UNIVERSE_SCHEMA, id: `u2-${rules.version}-${day}`, createdAt: now, ok: false, error: String(e.stack ?? e.message).slice(0, 2000), picked: [], counts: null, requests: bundle.requests}; next = null; }
  const written = await writeOutputs({rootDir: root, outDir, bundle, proposal, next, bundleRef: arg('--from-bundle') ? path.relative(root, path.resolve(arg('--from-bundle'))) : null});
  console.log(JSON.stringify({id: written.id, ok: written.ok, picked: written.picked.length, counts: written.counts, requests: bundle.requests?.total, failed: bundle.requests?.failed, listSource: bundle.lists?.source, error: written.error ?? null}));
  process.exitCode = written.ok ? 0 : 3;
}
