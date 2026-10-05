/**
 * ATLAS 미국 판 · 나스닥(nasdaq.com) 원문 읽기(셈만 · 받기 없음) — 2026-10-05 18:02 사장님 「이제는 미국 주식도 같은 개념으로 365개를 만들어라」
 *   네이버 해외 결산 표에는 영업이익 · ROE · 부채비율 줄이 없다(19:36 첫 실행) → 우량 네 조건의 숫자는 나스닥 결산표에서(19:39 시험에서 열림 확인)
 *     결산표(회사마다): 영업이익(Operating Income) · 순이익(Net Income) · 부채 총계(Total Liabilities) · 자기자본(Total Equity) — 네 해 · 단위 천 달러
 *     종목표(한 번에 전 종목): 나라(country) — 미국 회사만 고를 때
 *   ROE = 순이익 ÷ 자기자본 · 부채비율 = 부채 총계 ÷ 자기자본 (한국 판과 같은 뜻) · 자기자본이 0 이하이면 둘 다 셀 수 없음
 *   앞날 값(추정 · 컨센서스)은 이 표에 없고, 읽지도 않는다(2026-10-04 15:37 「이제 예측을 하지 않는다」)
 */
export const NASDAQ = Object.freeze({
  fin: sym => `https://api.nasdaq.com/api/company/${encodeURIComponent(sym)}/financials?frequency=1`,
  screener: 'https://api.nasdaq.com/api/screener/stocks?tableonly=true&limit=25&offset=0&download=true',
  headers: Object.freeze({'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0 Safari/537.36', Accept: 'application/json, text/plain, */*', Origin: 'https://www.nasdaq.com', Referer: 'https://www.nasdaq.com/'}),
});

/** 「$416,161,000」 · 「-$321,000」 · 「($321,000)」 · 「151.9%」 → 수 · 「--」 · 빈 칸 → null */
export function money(v) {
  if (typeof v === 'number') return Number.isFinite(v) ? v : null;
  let s = String(v ?? '').trim(); if (!s || /^-+$/.test(s)) return null;
  let neg = false;
  if (/^\(.*\)$/.test(s)) { neg = true; s = s.slice(1, -1); }
  if (s.startsWith('-')) { neg = !neg; s = s.slice(1); }
  s = s.replace(/[$,%\s]/g, '');
  if (!/^\d+(\.\d+)?$/.test(s)) return null;
  const n = Number(s); return Number.isFinite(n) ? (neg ? -n : n) : null;
}
/** 「9/27/2025」 → 「2025-09-27」 */
export const mdy = s => { const m = String(s ?? '').match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/); return m ? `${m[3]}-${m[1].padStart(2, '0')}-${m[2].padStart(2, '0')}` : null; };

/** 결산표 원문 → {periods:[날짜…(새 것부터)], rows:{표이름:{줄이름:[값…]}}} */
export function parseNasdaqFin(j) {
  const d = j?.data; if (!d || typeof d !== 'object') return null;
  const out = {symbol: d.symbol ?? null, periods: [], rows: {}};
  for (const [name, t] of Object.entries(d)) {
    if (!t || typeof t !== 'object' || !Array.isArray(t.rows) || !t.headers) continue;
    const keys = Object.keys(t.headers).filter(k => k !== 'value1').sort((a, b) => Number(a.slice(5)) - Number(b.slice(5)));
    const periods = keys.map(k => mdy(t.headers[k]));
    if (!out.periods.length && periods.every(Boolean)) out.periods = periods;
    out.rows[name] = Object.fromEntries(t.rows.filter(r => r?.value1).map(r => [String(r.value1).trim(), keys.map(k => money(r[k]))]));
  }
  return out.periods.length ? out : null;
}

/** 결산표 → 우량 조건 숫자(한국 판 metrics 와 같은 모양) — 맨 앞 칸이 가장 최근 결산 해 */
export function nasdaqMetrics(f) {
  if (!f?.periods?.length) return null;
  const inc = f.rows.incomeStatementTable ?? {}, bal = f.rows.balanceSheetTable ?? {}, rat = f.rows.financialRatiosTable ?? {};
  const at = (row, i) => Array.isArray(row) ? (row[i] ?? null) : null;
  const op = inc['Operating Income'], net = inc['Net Income'] ?? inc['Net Income Applicable to Common Shareholders'], rev = inc['Total Revenue'];
  const liab = at(bal['Total Liabilities'], 0), eq = at(bal['Total Equity'], 0);
  const equityNeg = typeof eq === 'number' && eq <= 0;
  const roe = typeof eq === 'number' && eq > 0 && typeof at(net, 0) === 'number' ? Number((at(net, 0) / eq * 100).toFixed(2)) : (equityNeg ? null : at(rat['After Tax ROE'], 0));
  const debt = typeof eq === 'number' && eq > 0 && typeof liab === 'number' ? Number((liab / eq * 100).toFixed(2)) : null;
  return {fiscalYear: f.periods[0], prevYear: f.periods[1] ?? null, revenue: at(rev, 0), op: at(op, 0), opPrev: at(op, 1), net: at(net, 0), netPrev: at(net, 1), roe, debt,
    liabilities: liab, equity: eq, equityNeg, unit: '천 달러', basis: {op: 'Operating Income', roe: '순이익÷자기자본', debt: '부채 총계÷자기자본'}};
}

/** 종목표 원문 → Map(기호 → {country, sector, industry, capUsd}) — 기호의 「/」는 「.」로(BRK/B → BRK.B) */
export function parseScreener(j) {
  const rows = j?.data?.rows ?? j?.data?.table?.rows ?? [];
  const m = new Map();
  for (const r of rows) {
    const sym = String(r?.symbol ?? '').trim().toUpperCase().replace(/\//g, '.'); if (!sym) continue;
    m.set(sym, {country: String(r.country ?? '').trim(), sector: r.sector ?? null, industry: r.industry ?? null, capUsd: money(r.marketCap)});
  }
  return m;
}
