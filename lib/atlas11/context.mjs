/**
 * ATLAS 11 · 시장·수급·뉴스·공시·거시 「관측 기록」 — 매 거래일 16:00 실행 앞에서 따로 모은다.
 *   이 값들은 기록·설명·검증 재료다. 검증을 통과해 채택되기 전까지 예측 숫자에 들어가지 않는다(usedInForecast:false).
 *   결측은 0 으로 채우지 않는다. 숫자로 읽히지 않는 칸은 null 로 두고 이유를 남긴다.
 *   가격(종가·시고저·거래량)은 여기서 모으지 않는다 — 네이버 일봉·수급표의 가격은 대체거래소(NXT) 거래가 섞일 수 있어 정규장 값으로 쓰지 않는다.
 */
import {createHash} from 'node:crypto';
import fs from 'node:fs/promises';
import path from 'node:path';

export const CONTEXT_SCHEMA = 'atlas11-context-1';
export const sha256 = x => createHash('sha256').update(typeof x === 'string' || Buffer.isBuffer(x) ? x : JSON.stringify(x)).digest('hex');

/** "+53,759" · "-2,508,369" · "46.48%" · "6,870.81" · 12.3 → 수, 읽을 수 없으면 null (0 으로 바꾸지 않는다) */
export function num(v) {
  if (typeof v === 'number') return Number.isFinite(v) ? v : null;
  if (typeof v !== 'string') return null;
  const s = v.replace(/[,%\s]/g, '').replace(/^\+/, '');
  if (!/^-?(\d+(\.\d+)?|\.\d+)$/.test(s)) return null;
  const n = Number(s); return Number.isFinite(n) ? n : null;
}
const isDay = d => /^\d{4}-\d{2}-\d{2}$/.test(d) && new Date(d + 'T00:00:00Z').toISOString().slice(0, 10) === d;
const ymd = s => (typeof s === 'string' && /^\d{8}$/.test(s)) ? `${s.slice(0, 4)}-${s.slice(4, 6)}-${s.slice(6, 8)}` : null;
const parseJSON = text => { try { return JSON.parse(text); } catch { throw Error('PARSE_FAILED'); } };

/** 출처 주소 — 모두 열쇠 없이 공개된 주소. 2026-09-30 GitHub 러너 탐침(reports/atlas11/probe/context*)에서 200 응답을 확인한 것만 쓴다. */
export const CONTEXT_URLS = Object.freeze({
  index: symbol => `https://m.stock.naver.com/api/index/${symbol}/price?pageSize=10&page=1`,
  flows: code => `https://m.stock.naver.com/api/stock/${code}/trend?pageSize=10&page=1`,
  news: code => `https://m.stock.naver.com/api/news/stock/${code}?pageSize=20&page=1`,
  disclosures: code => `https://m.stock.naver.com/api/stock/${code}/disclosure?pageSize=20&page=1`,
});

/** 요인 연결표 — 무엇을 관측했고 정의와 얼마나 맞는지. componentOnly 는 「정의 일부만」이라는 뜻이다. */
export const CONTEXT_FACTOR_MAP = Object.freeze({
  F14: {source: 'flows', field: 'foreignNet', label: '외국인 순매매 수량(종목별)', componentOnly: false, note: '네이버 종목 투자자 동향 표 · 당일 값은 16:00 에 잠정일 수 있어 다음 날 다시 받아 바뀌면 정정 기록'},
  F16: {source: 'flows', field: 'institutionNet', label: '기관 합계 순매매 수량(종목별)', componentOnly: true, note: '정의는 연기금 제외 기관 · 받은 값은 연기금이 포함된 기관 합계 → 일부 성분'},
  F19: {source: 'flows', field: 'individualNet', label: '개인 순매매 수량(종목별)', componentOnly: false, note: '네이버 종목 투자자 동향 표 · 당일 잠정 가능'},
  F30: {source: 'disclosures', field: 'corporateAction', label: '기업행위 공시 제목(배당락·권리락·증자·분할·병합 등)', componentOnly: true, note: '공시 제목 낱말로만 가림 · 금액·비율은 읽지 않음'},
});

/**
 * 거시·해외 시계열. 공식 원자료(FRED: 연준·재무부·EIA·Cboe 등 원 제공기관 표기)를 먼저 쓰고,
 * FRED 에 없는 것(반도체지수·국고채)과 FRED 가 응답하지 않을 때의 대체(fallbackFor)는 네이버 시장지표를 쓴다.
 * FRED 는 브라우저 머리글로는 GitHub 러너에서 응답이 없고 curl 머리글로는 응답했다(2026-09-30 탐침 2차).
 */
export const MACRO_SERIES = Object.freeze([
  {id: 'DEXKOUS', provider: 'fred', factorId: 'F06', unit: 'KRW_per_USD', label: '원/달러(연준 H.10 뉴욕 정오 매입률)', componentOnly: true},
  {id: 'FX_USDKRW', provider: 'naver_fx', factorId: 'F06', unit: 'KRW_per_USD', label: '원/달러(네이버 표기 · 은행 고시 기준)', componentOnly: true},
  {id: 'SP500', provider: 'fred', factorId: 'F09', unit: 'index', label: 'S&P 500 종가', componentOnly: true},
  {id: 'NASDAQCOM', provider: 'fred', factorId: 'F09', unit: 'index', label: '나스닥 종합 종가', componentOnly: true},
  {id: '.SOX', provider: 'naver_world_index', factorId: 'F09', unit: 'index', label: '필라델피아 반도체지수 종가', componentOnly: true},
  {id: 'VIXCLS', provider: 'fred', factorId: 'F10', unit: 'index', label: 'VIX 종가(Cboe)', componentOnly: false},
  {id: '.VIX', provider: 'naver_world_index', factorId: 'F10', unit: 'index', label: 'VIX(네이버 · FRED 대체)', componentOnly: false, fallbackFor: 'VIXCLS'},
  {id: 'DFII10', provider: 'fred', factorId: 'F04', unit: 'percent', label: '미국 10년 물가연동채 실질수익률', componentOnly: false},
  {id: 'BAA10Y', provider: 'fred', factorId: 'F05', unit: 'percentage_points', label: '미국 Baa 회사채 − 국채10년', componentOnly: true},
  {id: 'DFF', provider: 'fred', factorId: 'F02', unit: 'percent', label: '미국 실효 연방기금금리', componentOnly: true},
  {id: 'DGS2', provider: 'fred', factorId: 'F02', unit: 'percent', label: '미국 국채 2년(정책 기대의 시장 대용)', componentOnly: true},
  {id: 'KR3YT=RR', provider: 'naver_bond', factorId: 'F03', unit: 'percent', label: '국고채 3년', componentOnly: true},
  {id: 'KR10YT=RR', provider: 'naver_bond', factorId: 'F03', unit: 'percent', label: '국고채 10년', componentOnly: true},
  {id: 'DCOILWTICO', provider: 'fred', factorId: 'F33', unit: 'USD_per_barrel', label: 'WTI 현물(EIA)', componentOnly: true},
  {id: 'CLcv1', provider: 'naver_energy', factorId: 'F33', unit: 'USD_per_barrel', label: 'WTI 근월물(네이버 · FRED 대체)', componentOnly: true, fallbackFor: 'DCOILWTICO'},
  {id: 'WALCL', provider: 'fred', factorId: 'F07', unit: 'USD_million', label: '연준 총자산(주간 · 수요일)', componentOnly: true},
]);
export const FRED_UA = 'curl/8.5.0';
export function macroURL(s, {from = null} = {}) {
  if (s.provider === 'fred') return `https://fred.stlouisfed.org/graph/fredgraph.csv?id=${s.id}${from ? '&cosd=' + from : ''}`;
  if (s.provider === 'naver_world_index') return `https://api.stock.naver.com/index/${s.id}/price?page=1&pageSize=10`;
  if (s.provider === 'naver_bond') return `https://api.stock.naver.com/marketindex/bond/${s.id}/prices?page=1&pageSize=10`;
  if (s.provider === 'naver_fx') return `https://api.stock.naver.com/marketindex/exchange/${s.id}/prices?page=1&pageSize=10`;
  if (s.provider === 'naver_energy') return `https://api.stock.naver.com/marketindex/energy/${s.id}/prices?page=1&pageSize=10`;
  throw Error('UNKNOWN_PROVIDER');
}
/** FRED CSV: 머리줄이 정확히 그 시계열이어야 한다 · '.'(값 없음)은 행을 만들지 않는다 */
export function parseFredCSV(text, id) {
  const lines = String(text).replace(/^﻿/, '').split(/\r?\n/).filter(Boolean);
  if (!new RegExp(`^(DATE|observation_date),${id.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`).test(lines[0] ?? '')) throw Error('SERIES_HEADER_MISMATCH');
  const rows = [];
  for (const l of lines.slice(1)) { const m = l.match(/^(\d{4}-\d{2}-\d{2}),(.*)$/); if (!m || !isDay(m[1])) continue; const v = m[2].trim(); if (v === '.' || v === '') continue; const n = Number(v); if (Number.isFinite(n)) rows.push({date: m[1], value: n}); }
  return rows;
}
/** 네이버 시장지표: 배열 또는 {result: 배열} · 날짜는 그 시장의 현지 거래일 */
export function parseNaverSeries(text) {
  const d = parseJSON(text), arr = Array.isArray(d) ? d : Array.isArray(d?.result) ? d.result : null;
  if (!arr) throw Error('SHAPE_SERIES');
  const rows = [];
  for (const r of arr) { const date = String(r?.localTradedAt ?? '').slice(0, 10); const v = num(r?.closePrice); if (isDay(date) && v != null) rows.push({date, value: v, changePct: num(r?.fluctuationsRatio)}); }
  rows.sort((a, b) => a.date.localeCompare(b.date));
  return rows.filter((r, i) => i === 0 || r.date !== rows[i - 1].date);
}

// ── 시장 지수 (코스피·코스닥) ────────────────────────────────────────────────
export function parseIndexPrices(text, symbol) {
  const d = parseJSON(text); if (!Array.isArray(d)) throw Error('SHAPE_INDEX');
  const rows = [];
  for (const r of d) {
    const date = r?.localTradedAt; if (!isDay(date)) continue;
    const close = num(r.closePrice); if (close == null || close <= 0) continue;
    rows.push({date, close, open: num(r.openPrice), high: num(r.highPrice), low: num(r.lowPrice), change: num(r.compareToPreviousClosePrice), changePct: num(r.fluctuationsRatio)});
  }
  rows.sort((a, b) => a.date.localeCompare(b.date));
  for (let i = 1; i < rows.length; i++) if (rows[i].date === rows[i - 1].date) throw Error('DUPLICATE_DATE');
  return {symbol, rows};
}

// ── 종목별 투자자 수급 ─────────────────────────────────────────────────────
export function parseFlows(text, code) {
  const d = parseJSON(text); if (!Array.isArray(d)) throw Error('SHAPE_FLOWS');
  const rows = [];
  for (const r of d) {
    if (r?.itemCode !== code) throw Error('CODE_MISMATCH');
    const date = ymd(r.bizdate); if (!date) continue;
    rows.push({date, foreignNet: num(r.foreignerPureBuyQuant), institutionNet: num(r.organPureBuyQuant), individualNet: num(r.individualPureBuyQuant), foreignHoldRatioPct: num(r.foreignerHoldRatio), unit: 'shares'});
  }
  rows.sort((a, b) => a.date.localeCompare(b.date));
  return {code, rows};
}

// ── 뉴스 (같은 기사 · 재게시 · 계열 중복 제거) ─────────────────────────────────
/** 네이버 기사 제목에 섞여 오는 HTML 문자 참조(&quot; 등)를 글자로 되돌린다 — 원문 해시는 받은 본문 그대로 따로 남는다 */
export function decodeEntities(t) {
  return String(t ?? '').replace(/&(quot|amp|lt|gt|apos|#39|#x27|nbsp|middot|hellip|lsquo|rsquo|ldquo|rdquo);/g, (m, k) => ({quot: '"', amp: '&', lt: '<', gt: '>', apos: "'", '#39': "'", '#x27': "'", nbsp: ' ', middot: '·', hellip: '…', lsquo: '‘', rsquo: '’', ldquo: '“', rdquo: '”'})[k] ?? m).replace(/&#(\d{2,5});/g, (m, n) => { const c = Number(n); return c >= 32 && c < 0x10000 ? String.fromCharCode(c) : m; });
}
/** 제목 정규화: 괄호 머리말·따옴표·문장부호·공백을 지운다. 같은 열쇠면 같은 사건의 재게시로 본다(가장 이른 것이 대표). */
export function titleKey(title) {
  return String(title ?? '').normalize('NFKC').toLowerCase()
    .replace(/\[[^\]]*\]|【[^】]*】|<[^>]*>/g, '')
    .replace(/[“”"'‘’`·…,.:;!?()\-–—~_/\\|]+/g, '')
    .replace(/\s+/g, '');
}
export function parseNews(text, code, {name = null} = {}) {
  const d = parseJSON(text); if (!Array.isArray(d)) throw Error('SHAPE_NEWS');
  const items = [];
  for (const cluster of d) {
    for (const it of cluster?.items ?? []) {
      const dt = String(it?.datetime ?? '');
      if (!/^\d{12}$/.test(dt)) continue;
      const publishedAt = `${dt.slice(0, 4)}-${dt.slice(4, 6)}-${dt.slice(6, 8)}T${dt.slice(8, 10)}:${dt.slice(10, 12)}:00+09:00`;
      const title = decodeEntities(String(it.titleFull || it.title || '')).trim(); if (!title) continue;
      items.push({id: String(it.officeId ?? '') + '-' + String(it.articleId ?? ''), office: it.officeName ?? null, publishedAt, title, url: it.mobileNewsUrl ?? null, clusterSize: Number.isFinite(cluster.total) ? cluster.total : null, mentionsName: name ? title.includes(name) : null});
    }
  }
  return dedupeNews(code, items);
}
export function dedupeNews(code, items) {
  const byId = new Map();
  for (const it of items) if (!byId.has(it.id)) byId.set(it.id, it);
  const unique = [...byId.values()].sort((a, b) => a.publishedAt.localeCompare(b.publishedAt) || a.id.localeCompare(b.id));
  const firstByKey = new Map(), out = [];
  for (const it of unique) {
    const key = titleKey(it.title);
    if (key && firstByKey.has(key)) { out.push({...it, duplicateOf: firstByKey.get(key)}); continue; }
    if (key) firstByKey.set(key, it.id);
    out.push({...it, duplicateOf: null});
  }
  return {code, items: out, raw: items.length, sameArticle: items.length - unique.length, republished: out.filter(x => x.duplicateOf).length, distinct: out.filter(x => !x.duplicateOf).length};
}

// ── 공시 (기업행위 낱말 가림) ───────────────────────────────────────────────
export const CORPORATE_ACTION = /배당락|권리락|분할|병합|유상증자|무상증자|감자|합병|주식배당|자기주식|자사주|소각|상장폐지|매매거래정지|거래정지|전환사채|신주인수권/;
export function parseDisclosures(text, code) {
  const d = parseJSON(text); if (!Array.isArray(d)) throw Error('SHAPE_DISCLOSURES');
  const items = [];
  for (const r of d) {
    if (r?.itemCode !== code) throw Error('CODE_MISMATCH');
    const raw = String(r.datetime ?? ''); const m = raw.match(/^(\d{4}-\d{2}-\d{2})T(\d{2}:\d{2}:\d{2})$/);
    const title = decodeEntities(String(r.title ?? '')).trim(); if (!title) continue;
    items.push({id: String(r.disclosureId ?? ''), title, author: r.author ?? null, datetimeRaw: raw || null, publishedAt: m ? `${m[1]}T${m[2]}+09:00` : null, timezoneAssumed: m ? 'Asia/Seoul(원문에 시간대 표기 없음)' : null, corporateAction: CORPORATE_ACTION.test(title), actionWord: title.match(CORPORATE_ACTION)?.[0] ?? null});
  }
  items.sort((a, b) => String(a.publishedAt).localeCompare(String(b.publishedAt)));
  return {code, items};
}

// ── 정정 추적: 같은 종목·같은 날짜의 수급 값이 이전 수집과 다르면 정정으로 남긴다(잠정 → 확정) ─────────
export function flowRevisions(previousFlows, currentFlows) {
  const prev = new Map(); for (const f of previousFlows ?? []) for (const r of f.rows ?? []) prev.set(`${f.code}|${r.date}`, {...r, fetchedAt: f.fetchedAt ?? null});
  const out = [];
  for (const f of currentFlows ?? []) for (const r of f.rows ?? []) {
    const p = prev.get(`${f.code}|${r.date}`); if (!p) continue;
    for (const k of ['foreignNet', 'institutionNet', 'individualNet', 'foreignHoldRatioPct']) if (p[k] !== r[k]) out.push({code: f.code, date: r.date, field: k, before: p[k] ?? null, after: r[k] ?? null, beforeFetchedAt: p.fetchedAt});
  }
  return out;
}

/** 오늘 행을 확정으로 보지 않는 창: 16:00 수집이라도 당일 투자자 수급은 잠정일 수 있다 → provisional 표시 */
export function markProvisional(flows, day) {
  return flows.map(f => ({...f, rows: f.rows.map(r => ({...r, status: r.date === day ? 'provisional_same_day' : 'reported'}))}));
}

/** 하루치 관측 묶음 → 요인 현황(관측 확보·최근 관측일·신선도·범위) · 예측 사용은 항상 false */
export function factorObservations(ctx, sessions) {
  const out = {};
  const lagDays = date => { if (!date) return null; const a = sessions.indexOf(date), b = sessions.indexOf(ctx.day); return a >= 0 && b >= 0 ? b - a : null; };
  for (const [id, m] of Object.entries(CONTEXT_FACTOR_MAP)) {
    if (m.source === 'flows') {
      const withValue = (ctx.flows ?? []).filter(f => f.rows.some(r => r[m.field] != null));
      const latest = withValue.map(f => f.rows.filter(r => r[m.field] != null).at(-1)?.date).filter(Boolean).sort().at(-1) ?? null;
      out[id] = {factorId: id, observed: withValue.length > 0, stocks: withValue.length, latestObservation: latest, lagSessions: lagDays(latest), provisionalToday: (ctx.flows ?? []).some(f => f.rows.some(r => r.date === ctx.day && r.status === 'provisional_same_day')), label: m.label, componentOnly: m.componentOnly, note: m.note, sourceUrlPattern: CONTEXT_URLS.flows('{code}'), usedInForecast: false};
    } else if (m.source === 'disclosures') {
      const stocks = (ctx.disclosures ?? []).filter(d => d.items.length > 0);
      const actions = (ctx.disclosures ?? []).flatMap(d => d.items.filter(i => i.corporateAction).map(i => ({code: d.code, title: i.title, publishedAt: i.publishedAt, word: i.actionWord})));
      out[id] = {factorId: id, observed: stocks.length > 0, stocks: stocks.length, latestObservation: actions.map(a => a.publishedAt?.slice(0, 10)).filter(Boolean).sort().at(-1) ?? null, corporateActions: actions.length, recentActions: actions.sort((a, b) => String(b.publishedAt).localeCompare(String(a.publishedAt))).slice(0, 12), label: m.label, componentOnly: m.componentOnly, note: m.note, sourceUrlPattern: CONTEXT_URLS.disclosures('{code}'), usedInForecast: false};
    }
  }
  for (const mac of ctx.macro ?? []) {
    if (!mac.factorId || !mac.rows?.length) continue;
    const latest = mac.rows.at(-1).date, prev = out[mac.factorId];
    const entry = {series: mac.id, label: mac.label, latestObservation: latest, value: mac.rows.at(-1).value, unit: mac.unit, sourceUrl: mac.sourceUrl};
    if (prev) { prev.series = [...(prev.series ?? []), entry]; if (latest > (prev.latestObservation ?? '')) prev.latestObservation = latest; continue; }
    out[mac.factorId] = {factorId: mac.factorId, observed: true, stocks: null, scope: 'market', latestObservation: latest, calendarLagDays: Math.round((Date.parse(ctx.day) - Date.parse(latest)) / 864e5), series: [entry], label: mac.factorLabel ?? mac.label, componentOnly: mac.componentOnly !== false, note: mac.note ?? null, usedInForecast: false};
  }
  return out;
}

/** 하루치 관측 묶음 요약 — 화면·보고서·요인 기록이 같은 숫자를 쓴다 */
export function summarizeContext(ctx) {
  const idx = Object.fromEntries((ctx.index ?? []).map(i => { const r = i.rows.find(x => x.date === ctx.day) ?? null; return [i.symbol, r ? {date: r.date, close: r.close, changePct: r.changePct, status: 'same_day'} : i.rows.length ? {date: i.rows.at(-1).date, close: i.rows.at(-1).close, changePct: i.rows.at(-1).changePct, status: 'earlier_day'} : null]; }));
  const flowsToday = (ctx.flows ?? []).map(f => ({code: f.code, row: f.rows.find(r => r.date === ctx.day) ?? null})).filter(x => x.row);
  const sum = k => flowsToday.reduce((s, x) => s + (x.row[k] ?? 0), 0);
  const news = ctx.news ?? [];
  const newsToday = news.map(n => ({code: n.code, n: n.items.filter(i => !i.duplicateOf && i.publishedAt.slice(0, 10) === ctx.day).length})).filter(x => x.n > 0);
  return {
    day: ctx.day, fetchedAt: ctx.fetchedAt,
    index: idx,
    flows: {stocks: (ctx.flows ?? []).length, stocksWithToday: flowsToday.length, provisional: true, foreignNetSharesSum: flowsToday.length ? sum('foreignNet') : null, institutionNetSharesSum: flowsToday.length ? sum('institutionNet') : null, individualNetSharesSum: flowsToday.length ? sum('individualNet') : null, note: '수량(주) 합계 · 종목마다 주가가 달라 금액 합계가 아님 · 당일 값은 잠정일 수 있음'},
    news: {stocks: news.length, raw: news.reduce((s, n) => s + n.raw, 0), distinct: news.reduce((s, n) => s + n.distinct, 0), republished: news.reduce((s, n) => s + n.republished, 0), sameArticle: news.reduce((s, n) => s + n.sameArticle, 0), stocksWithTodayNews: newsToday.length, todayDistinct: newsToday.reduce((s, x) => s + x.n, 0)},
    disclosures: {stocks: (ctx.disclosures ?? []).length, items: (ctx.disclosures ?? []).reduce((s, d) => s + d.items.length, 0), corporateActions: (ctx.disclosures ?? []).reduce((s, d) => s + d.items.filter(i => i.corporateAction).length, 0)},
    macro: (ctx.macro ?? []).map(m => ({id: m.id, label: m.label, factorId: m.factorId ?? null, latest: m.rows?.at(-1) ?? null, rows: m.rows?.length ?? 0})),
    revisions: (ctx.revisions ?? []).length,
    errors: (ctx.errors ?? []).length,
    usedInForecast: false,
  };
}

// ── 원인 분석용: 쌓인 관측 묶음을 합쳐 읽고, 채점 셀의 기간(발행 뒤 ~ 목표일 마감)에 있었던 기사·수급·공시를 꺼낸다 ─────────
/** 모든 관측 묶음을 시각 순서로 합친다 · 같은 기사/공시 id 는 한 번 · 같은 날 수급은 나중 수집값(정정 반영) · 기사 수집 범위(구간)를 남긴다 */
export async function loadObservations(rootDir, {upTo = null} = {}) {
  const base = path.join(rootDir, 'reports/atlas11/context');
  let days; try { days = (await fs.readdir(base)).filter(d => /^\d{4}-\d{2}-\d{2}$/.test(d) && (!upTo || d <= upTo)).sort(); } catch (e) { if (e.code === 'ENOENT') return null; throw e; }
  const obs = {snapshots: 0, news: new Map(), newsIntervals: new Map(), flows: new Map(), disclosures: new Map(), firstFetchedAt: null, lastFetchedAt: null};
  for (const d of days) {
    for (const f of (await fs.readdir(path.join(base, d))).filter(f => f.endsWith('.json')).sort()) {
      const s = JSON.parse(await fs.readFile(path.join(base, d, f), 'utf8')); obs.snapshots++;
      obs.firstFetchedAt ??= s.fetchedAt; obs.lastFetchedAt = s.fetchedAt;
      for (const n of s.news ?? []) {
        const m = obs.news.get(n.code) ?? new Map(); for (const it of n.items ?? []) if (!m.has(it.id)) m.set(it.id, it); obs.news.set(n.code, m);
        const times = (n.items ?? []).map(i => i.publishedAt).filter(Boolean).sort();
        if (times.length) { const iv = obs.newsIntervals.get(n.code) ?? []; iv.push([times[0], n.fetchedAt ?? s.fetchedAt]); obs.newsIntervals.set(n.code, iv); }
      }
      for (const fl of s.flows ?? []) { const m = obs.flows.get(fl.code) ?? new Map(); for (const r of fl.rows ?? []) m.set(r.date, {...r, fetchedAt: fl.fetchedAt ?? s.fetchedAt}); obs.flows.set(fl.code, m); }
      for (const ds of s.disclosures ?? []) { const m = obs.disclosures.get(ds.code) ?? new Map(); for (const it of ds.items ?? []) if (!m.has(it.id)) m.set(it.id, it); obs.disclosures.set(ds.code, m); }
    }
  }
  return obs.snapshots ? obs : null;
}
/** [시작, 끝] 이 수집 구간들의 합집합에 다 들어가는가 */
export function covers(intervals, t0, t1) {
  const iv = (intervals ?? []).map(([a, b]) => [Date.parse(a), Date.parse(b)]).filter(([a, b]) => Number.isFinite(a) && Number.isFinite(b) && b >= a).sort((x, y) => x[0] - y[0]);
  let reach = t0;
  for (const [a, b] of iv) { if (a > reach) break; if (b > reach) reach = b; if (reach >= t1) return true; }
  return reach >= t1;
}
const median = xs => { const v = xs.filter(Number.isFinite).sort((a, b) => a - b); if (!v.length) return null; const m = Math.floor(v.length / 2); return v.length % 2 ? v[m] : (v[m - 1] + v[m]) / 2; };
/** 한 채점 셀의 기간 증거 — 「있었다」는 사실만 모은다. 원인 판정은 하지 않는다. */
export function observationEvidence(obs, {code, issuedAt, originDate, targetDate}) {
  if (!obs) return null;
  const t0 = Date.parse(issuedAt), t1 = Date.parse(targetDate + 'T15:30:00+09:00');
  if (!Number.isFinite(t0) || !Number.isFinite(t1) || t1 <= t0) return null;
  const inWin = iso => { const t = Date.parse(iso); return Number.isFinite(t) && t > t0 && t <= t1; };
  const allNews = [...(obs.news.get(code)?.values() ?? [])];
  const news = allNews.filter(i => !i.duplicateOf && inWin(i.publishedAt)).sort((a, b) => a.publishedAt.localeCompare(b.publishedAt));
  const republished = allNews.filter(i => i.duplicateOf && inWin(i.publishedAt)).length;
  const flowsAll = [...(obs.flows.get(code)?.values() ?? [])].sort((a, b) => a.date.localeCompare(b.date));
  const flows = flowsAll.filter(r => r.date > originDate && r.date <= targetDate), base = flowsAll.filter(r => r.date <= originDate).slice(-10);
  const sum = k => flows.some(r => r[k] == null) ? null : flows.reduce((s, r) => s + r[k], 0);
  const disc = [...(obs.disclosures.get(code)?.values() ?? [])].filter(i => inWin(i.publishedAt)).sort((a, b) => String(a.publishedAt).localeCompare(String(b.publishedAt)));
  return {
    window: {from: issuedAt, to: targetDate + 'T15:30:00+09:00'},
    news: {count: news.length, republished, coverageComplete: covers(obs.newsIntervals.get(code), t0, t1), items: news.slice(0, 5).map(({id, publishedAt, office, title, url}) => ({id, publishedAt, office, title: decodeEntities(title), url}))},
    flows: {days: flows.length, dates: flows.map(r => r.date), foreignNet: sum('foreignNet'), institutionNet: sum('institutionNet'), individualNet: sum('individualNet'), provisional: flows.some(r => r.status === 'provisional_same_day'), baselineDays: base.length, baselineMedianAbsForeignInst: median(base.map(r => (r.foreignNet == null || r.institutionNet == null) ? NaN : Math.abs(r.foreignNet + r.institutionNet))), unit: 'shares'},
    disclosures: {count: disc.length, items: disc.slice(0, 5).map(({id, publishedAt, title, corporateAction, actionWord}) => ({id, publishedAt, title: decodeEntities(title), corporateAction, actionWord})), corporateActions: disc.filter(d => d.corporateAction).map(d => ({title: decodeEntities(d.title), word: d.actionWord, publishedAt: d.publishedAt}))},
    label: '확인된 사실(기간 안에 기사·수급·공시가 있었다는 것) · 원인 판정 아님',
  };
}
