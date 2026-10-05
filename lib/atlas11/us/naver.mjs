/**
 * ATLAS 미국 판 · 네이버 증권 해외주식 원문 읽기(셈만 · 받기 없음) — 2026-10-05 18:02 사장님 「이제는 미국 주식도 같은 개념으로 365개를 만들어라」
 *   한글 회사 이름 · 한글 업종 · 일봉 종가 · 결산 · 한글 기사를 한 출처에서 — 한국 판(네이버 증권)과 같은 곳이라 화면 글도 같은 말
 *   원문 모양이 조금 달라도 읽히도록 이름 후보 여럿을 본다(첫 깃허브 시험 reports/atlas11/us/probe 로 확인) — 못 읽으면 빈 값(지어내지 않음)
 *   결산은 확정 실적만 — 「추정(컨센서스)」 칸은 버린다(2026-10-04 15:37 「이제 예측을 하지 않는다」)
 */
import {decodeEntities, dedupeNews} from '../context.mjs';

export const NAVER_US = Object.freeze({
  origin: 'https://api.stock.naver.com',
  exchanges: Object.freeze(['NYSE', 'NASDAQ', 'AMEX']),
  list: (ex, page, size = 100) => `https://api.stock.naver.com/stock/exchange/${ex}/marketValue?page=${page}&pageSize=${size}`,
  basic: rc => `https://api.stock.naver.com/stock/${encodeURIComponent(rc)}/basic`,
  finance: rc => `https://api.stock.naver.com/stock/${encodeURIComponent(rc)}/finance/annual`,
  day: (rc, from, to) => `https://api.stock.naver.com/chart/foreign/item/${encodeURIComponent(rc)}/day?startDateTime=${from}0000&endDateTime=${to}2359`,
  indexDay: (sym, from, to) => `https://api.stock.naver.com/chart/foreign/index/${encodeURIComponent(sym)}/day?startDateTime=${from}0000&endDateTime=${to}2359`,
  indexPrice: sym => `https://api.stock.naver.com/index/${encodeURIComponent(sym)}/price?page=1&pageSize=10`,
  news: rc => `https://api.stock.naver.com/news/worldStock/${encodeURIComponent(rc)}?pageSize=20&page=1`,
  newsAlt: rc => `https://api.stock.naver.com/news/stock/${encodeURIComponent(rc)}?pageSize=20&page=1`,
  page: rc => `https://m.stock.naver.com/worldstock/stock/${encodeURIComponent(rc)}/total`,
  // 길이 여럿 — 앞 길이 막히면(409 · 404 · 빈 응답) 다음 길(scripts/atlas11/us/collect.mjs getAny · 한 번 열린 길을 먼저)
  ways: Object.freeze({
    list: (ex, page, size = 100) => [`https://api.stock.naver.com/stock/exchange/${ex}/marketValue?page=${page}&pageSize=${size}`, `https://m.stock.naver.com/api/stocks/marketValue/${ex}?page=${page}&pageSize=${size}`],
    finance: rc => [`https://api.stock.naver.com/stock/${encodeURIComponent(rc)}/finance/annual`, `https://m.stock.naver.com/api/stock/${encodeURIComponent(rc)}/finance/annual`],
    day: (rc, from, to) => [`https://api.stock.naver.com/chart/foreign/item/${encodeURIComponent(rc)}/day?startDateTime=${from}0000&endDateTime=${to}2359`, `https://api.stock.naver.com/chart/foreign/item/${encodeURIComponent(rc)}?periodType=dayCandle`],
    news: rc => [`https://api.stock.naver.com/news/worldStock/${encodeURIComponent(rc)}?pageSize=20&page=1`, `https://api.stock.naver.com/news/stock/${encodeURIComponent(rc)}?pageSize=20&page=1`, `https://m.stock.naver.com/api/news/stock/${encodeURIComponent(rc)}?pageSize=20&page=1`],
    index: (sym, from, to) => [`https://api.stock.naver.com/chart/foreign/index/${encodeURIComponent(sym)}/day?startDateTime=${from}0000&endDateTime=${to}2359`, `https://api.stock.naver.com/index/${encodeURIComponent(sym)}/price?page=1&pageSize=10`, `https://m.stock.naver.com/api/index/${encodeURIComponent(sym)}/price?pageSize=10&page=1`],
  }),
  headers: Object.freeze({'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0 Safari/537.36', Referer: 'https://m.stock.naver.com/', Accept: 'application/json, text/plain, */*'}),
});

/** 「3,456.78」 · 「-12.5」 · 「1.2E3」 → 수 · 「-」 「N/A」 빈 칸 → null */
export function numOf(v) {
  if (typeof v === 'number') return Number.isFinite(v) ? v : null;
  if (typeof v !== 'string') return null;
  const s = v.replace(/[,\s]/g, '').replace(/^\+/, '');
  if (!/^-?\d+(\.\d+)?([eE][-+]?\d+)?$/.test(s)) return null;
  const n = Number(s); return Number.isFinite(n) ? n : null;
}
/** 「1조 2,345억」 → 1.2345e12 (단위 글자는 화폐와 상관없이 크기만 · 순위를 셀 때만 씀) */
export function hangeulAmount(text) {
  const s = String(text ?? '').replace(/,/g, '');
  const jo = s.match(/(\d+(?:\.\d+)?)\s*조/), eok = s.match(/(\d+(?:\.\d+)?)\s*억/), man = s.match(/(\d+(?:\.\d+)?)\s*만/);
  if (!jo && !eok && !man) return null;
  return (jo ? Number(jo[1]) * 1e12 : 0) + (eok ? Number(eok[1]) * 1e8 : 0) + (man && !eok ? Number(man[1]) * 1e4 : 0);
}
const pick = (o, keys) => { for (const k of keys) { const v = k.split('.').reduce((x, p) => x?.[p], o); if (v != null && v !== '') return v; } return null; };
/** 원문 안에서 조건에 맞는 첫 배열(깊이 4까지) */
export function findArray(j, test, depth = 0) {
  if (Array.isArray(j)) { if (j.length && test(j[0])) return j; for (const x of j) { const f = depth < 4 && x && typeof x === 'object' ? findArray(x, test, depth + 1) : null; if (f) return f; } return null; }
  if (j && typeof j === 'object' && depth < 4) for (const v of Object.values(j)) { const f = findArray(v, test, depth + 1); if (f) return f; }
  return null;
}
const ISO = /^\d{4}-\d{2}-\d{2}$/;
/** 「20251003」 · 「2025-10-03」 · 「2025-10-03T16:00:00-04:00」 · 「2025.10.03」 → 「2025-10-03」 */
export function dayOf(v) {
  const s = String(v ?? '');
  let m = s.match(/^(\d{4})(\d{2})(\d{2})/); if (m) return `${m[1]}-${m[2]}-${m[3]}`;
  m = s.match(/^(\d{4})[-.](\d{2})[-.](\d{2})/); return m ? `${m[1]}-${m[2]}-${m[3]}` : null;
}
/** 화면 주소에 쓰는 기호 — 영문 대문자 · 숫자 · 점 · 줄표만(AAPL · BRK.B) */
export const codeOf = (symbol, reuters = '') => {
  const s = String(symbol ?? '').trim().toUpperCase().replace(/\//g, '.');
  if (/^[A-Z0-9][A-Z0-9.\-]{0,11}$/.test(s)) return s;
  const r = String(reuters ?? '').trim().toUpperCase().replace(/\.[A-Z]$/, '').replace(/[^A-Z0-9.\-]/g, '-');
  return /^[A-Z0-9][A-Z0-9.\-]{0,11}$/.test(r) ? r : null;
};

/** 시가총액 순 목록 한 쪽 → {items:[{code, reuters, name, nameEn, exchange, industry, industryCode, industryEn, capUsd, endType, close, nation}], total} */
export function parseList(j, exchange) {
  const arr = findArray(j, x => x && typeof x === 'object' && ('reutersCode' in x || 'symbolCode' in x)) ?? [];
  const total = numOf(pick(j, ['totalCount', 'total', 'count']));
  const items = arr.map(x => {
    const ind = x.industryCodeType ?? x.industryType ?? null;
    const cap = numOf(pick(x, ['marketValue', 'marketCap', 'marketValueUsd'])) ?? hangeulAmount(pick(x, ['marketValueHangeul', 'marketValueKrwHangeul']));
    return {code: codeOf(x.symbolCode, x.reutersCode), reuters: x.reutersCode ?? null, name: String(pick(x, ['stockName', 'stockNameKor', 'name']) ?? '').trim() || null,
      nameEn: String(pick(x, ['stockNameEng', 'stockNameEn', 'englishName']) ?? '').trim() || null,
      exchange: pick(x, ['stockExchangeType.name', 'stockExchangeName', 'exchangeName']) ?? exchange,
      industry: ind ? String(pick(ind, ['industryGroupKor', 'nameKor', 'industryNameKor', 'korName', 'name']) ?? '').trim() || null : (String(pick(x, ['industryName', 'industryGroupKor']) ?? '').trim() || null),
      industryCode: ind ? (pick(ind, ['code']) ?? null) : (x.reutersIndustryCode ?? null), industryEn: ind ? (pick(ind, ['industryGroupEng', 'nameEng', 'name']) ?? null) : null,
      capUsd: cap, endType: x.stockEndType ?? x.endType ?? null, close: numOf(x.closePrice), nation: x.nationType ?? x.nationCode ?? null};
  }).filter(x => x.code && x.reuters);
  return {items, total, raw: arr.length};
}

/** 일봉 원문 → [{date, close, open, high, low, volume}] (날짜 차례 · 같은 날은 마지막 것) */
export function parseDay(j) {
  const arr = findArray(j, x => x && typeof x === 'object' && ('closePrice' in x || 'close' in x || 'clsPrc' in x)) ?? [];
  const by = new Map();
  for (const x of arr) {
    const date = dayOf(pick(x, ['localDate', 'localTradedAt', 'date', 'tradeDate', 'bizdate'])), close = numOf(pick(x, ['closePrice', 'close', 'clsPrc']));
    if (!date || !ISO.test(date) || !(close > 0)) continue;
    by.set(date, {date, close, open: numOf(pick(x, ['openPrice', 'open'])), high: numOf(pick(x, ['highPrice', 'high'])), low: numOf(pick(x, ['lowPrice', 'low'])), volume: numOf(pick(x, ['accumulatedTradingVolume', 'volume']))});
  }
  return [...by.values()].sort((a, b) => a.date.localeCompare(b.date));
}

/** 지수 값 원문(가격 목록) → [{date, close, changePct}] */
export function parseIndex(j) {
  const arr = findArray(j, x => x && typeof x === 'object' && ('closePrice' in x || 'close' in x)) ?? [];
  const rows = arr.map(x => ({date: dayOf(pick(x, ['localTradedAt', 'localDate', 'date', 'tradeDate'])), close: numOf(pick(x, ['closePrice', 'close'])), changePct: numOf(pick(x, ['fluctuationsRatio', 'changeRate', 'changePct']))}))
    .filter(r => r.date && r.close > 0);
  const by = new Map(rows.map(r => [r.date, r]));
  const out = [...by.values()].sort((a, b) => a.date.localeCompare(b.date));
  // 등락%가 없으면 앞 날 종가로 센다(원문 두 값으로만)
  for (let i = 1; i < out.length; i++) if (out[i].changePct == null) out[i].changePct = Number(((out[i].close / out[i - 1].close - 1) * 100).toFixed(2));
  return out.filter(r => r.changePct != null);
}

/** 결산(연간) 원문 → 줄 이름별 값 · 확정 칸만(추정 칸 버림) → {cols:[{key,title}], rows:{이름:{key:값}}, droppedEstimates} */
export function parseFinance(j) {
  const info = j?.financeInfo ?? j;
  const titles = findArray(info, x => x && typeof x === 'object' && 'key' in x && 'title' in x && !('columns' in x)) ?? [];
  const est = new Set(titles.filter(t => /^y/i.test(String(t.isConsensus ?? '')) || /\(E\)|추정|예상|컨센서스/.test(String(t.title ?? ''))).map(t => String(t.key)));
  const cols = titles.filter(t => !est.has(String(t.key))).map(t => ({key: String(t.key), title: String(t.title ?? t.key)}));
  const rowList = findArray(info, x => x && typeof x === 'object' && 'title' in x && 'columns' in x) ?? [];
  const rows = {};
  for (const r of rowList) {
    const name = String(r.title ?? '').trim(); if (!name || rows[name]) continue;
    rows[name] = Object.fromEntries(Object.entries(r.columns ?? {}).filter(([k]) => !est.has(String(k))).map(([k, v]) => [String(k), numOf(v?.value ?? v)]));
  }
  return {cols: cols.sort((a, b) => a.key.localeCompare(b.key)), rows, droppedEstimates: est.size};
}

/** 결산 → 우량 조건 숫자 {fiscalYear, prevYear, revenue, op, opPrev, net, netPrev, roe, debt} — 줄 이름(한국말)으로 찾는다 · 없으면 null */
export function metricsOf(fin) {
  const cols = (fin?.cols ?? []).filter(c => Object.values(fin.rows ?? {}).some(r => r[c.key] != null));
  if (!cols.length) return null;
  const row = (re, not = null) => { const k = Object.keys(fin.rows).find(n => re.test(n.replace(/\s+/g, '')) && !(not && not.test(n.replace(/\s+/g, '')))); return k ? fin.rows[k] : null; };
  const rev = row(/^(매출액|매출|영업수익|총수익|수익)$/), op = row(/^영업이익$/) ?? row(/영업이익(?!률)/, /률|증가/), net = row(/^(당기순이익|순이익)$/) ?? row(/순이익(?!률)/, /률|증가|비지배/),
    roe = row(/^ROE/i) ?? row(/자기자본이익률/), debt = row(/^부채비율/) ?? row(/부채비율/);
  const last = cols.at(-1).key, prev = cols.at(-2)?.key ?? null, v = (r, k) => r && k ? (r[k] ?? null) : null;
  return {fiscalYear: cols.at(-1).title, prevYear: cols.at(-2)?.title ?? null, revenue: v(rev, last), op: v(op, last), opPrev: v(op, prev), net: v(net, last), netPrev: v(net, prev), roe: v(roe, last), debt: v(debt, last),
    rowsSeen: Object.keys(fin.rows).slice(0, 40)};
}

/** 기사 원문 → {code, items:[{id, office, publishedAt, title, url}], …} (한국 판 dedupeNews 와 같은 겹침 거르기) */
export function parseUsNews(j, code) {
  const arr = findArray(j, x => x && typeof x === 'object' && ('tit' in x || 'title' in x || 'titleFull' in x)) ?? [];
  const items = [];
  for (const it of arr) {
    const title = decodeEntities(String(pick(it, ['titleFull', 'title', 'tit']) ?? '')).replace(/<[^>]+>/g, '').trim(); if (!title) continue;
    const dt = String(pick(it, ['datetime', 'dt', 'publishedAt', 'date']) ?? '');
    let publishedAt = null, m;
    if ((m = dt.match(/^(\d{4})(\d{2})(\d{2})(\d{2})(\d{2})(\d{2})?$/))) publishedAt = `${m[1]}-${m[2]}-${m[3]}T${m[4]}:${m[5]}:${m[6] ?? '00'}+09:00`;
    else if (Number.isFinite(Date.parse(dt))) publishedAt = new Date(Date.parse(dt)).toISOString();
    if (!publishedAt) continue;
    const oid = pick(it, ['officeId', 'oid']), aid = pick(it, ['articleId', 'aid']);
    const url = [pick(it, ['mobileNewsUrl', 'linkUrl', 'url'])].find(u => /^https:\/\/\S+$/.test(String(u ?? ''))) ?? (oid && aid ? `https://n.news.naver.com/mnews/article/${oid}/${aid}` : null);
    items.push({id: oid && aid ? `${oid}-${aid}` : String(pick(it, ['id']) ?? title), office: pick(it, ['officeName', 'ohnm', 'office']) ?? null, publishedAt, title, url});
  }
  return dedupeNews(code, items);
}
