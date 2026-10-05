/**
 * ATLAS 미국 판 · 야후 결산 줄(fundamentals-timeseries) 읽기(셈만 · 받기 없음) — 2026-10-05 18:02 사장님 「이제는 미국 주식도 같은 개념으로 365개를 만들어라」
 *   나스닥 결산표가 깃허브 실행기를 막을 때(19:51 실행에서 353곳 뒤 「Access Denied」) 쓰는 둘째 길 — 19:39 시험에서 애플 값이 나스닥과 한 자리까지 같음을 확인
 *   영업이익 · 순이익 · 부채 총계 · 자기자본(해마다 · 단위 달러) → nasdaqMetrics 와 같은 모양
 */
export const YAHOO_TS = Object.freeze({
  types: ['annualOperatingIncome', 'annualNetIncome', 'annualStockholdersEquity', 'annualTotalLiabilitiesNetMinorityInterest'],
  url: (sym, nowSec = Math.floor(Date.now() / 1000)) => `https://query2.finance.yahoo.com/ws/fundamentals-timeseries/v1/finance/timeseries/${encodeURIComponent(sym)}?symbol=${encodeURIComponent(sym)}&type=${YAHOO_TS.types.join(',')}&period1=1609459200&period2=${nowSec + 86400}`,
  headers: Object.freeze({'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0 Safari/537.36', Accept: 'application/json, text/plain, */*'}),
});

/** 원문 → {종류: [{date, value}] 새 것부터} */
export function parseYahooTs(j) {
  const out = {};
  for (const r of j?.timeseries?.result ?? []) {
    const t = r?.meta?.type?.[0]; if (!t) continue;
    out[t] = (r[t] ?? []).filter(x => x && /^\d{4}-\d{2}-\d{2}$/.test(x.asOfDate ?? '') && Number.isFinite(x.reportedValue?.raw))
      .map(x => ({date: x.asOfDate, value: x.reportedValue.raw})).sort((a, b) => b.date.localeCompare(a.date));
  }
  return out;
}

/** 결산 줄 → 우량 조건 숫자(nasdaqMetrics 와 같은 모양) · 순이익이 없으면 null */
export function yahooMetrics(ts) {
  const net = ts?.annualNetIncome ?? [], op = ts?.annualOperatingIncome ?? [], eqs = ts?.annualStockholdersEquity ?? [], liab = ts?.annualTotalLiabilitiesNetMinorityInterest ?? [];
  if (!net.length) return null;
  const year = net[0].date, prevYear = net[1]?.date ?? null, on = (list, d) => d ? (list.find(x => x.date === d)?.value ?? null) : null;
  const eq = on(eqs, year), li = on(liab, year), equityNeg = typeof eq === 'number' && eq <= 0;
  return {fiscalYear: year, prevYear, revenue: null, op: on(op, year), opPrev: on(op, prevYear), net: net[0].value, netPrev: net[1]?.value ?? null,
    roe: typeof eq === 'number' && eq > 0 ? Number((net[0].value / eq * 100).toFixed(2)) : null,
    debt: typeof eq === 'number' && eq > 0 && typeof li === 'number' ? Number((li / eq * 100).toFixed(2)) : null,
    liabilities: li, equity: eq, equityNeg, unit: '달러', basis: {op: 'Operating Income', roe: '순이익÷자기자본', debt: '부채 총계÷자기자본'}};
}
