/**
 * 미국 주식 자료 출처 시험(깃허브 실행기에서) — 2026-10-05 18:02 사장님 「이제는 미국 주식도 같은 개념으로 365개를 만들어라」
 *   이 작업 공간에서는 미국 시세·재무 사이트에 닿지 않아(접속 막힘) 깃허브 실행기에서 어느 출처가 열리는지 먼저 본다.
 *   2026-09-29 시험에서 야후는 깃허브 실행기에 429(너무 많은 요청)만 돌려줬다(reports/atlas11/probe/yahoo52-progress.json) — 다시 확인만 한다.
 *   결과: reports/atlas11/us/probe/<시각>/summary.json + 출처마다 앞 20KB 원문(.txt)
 *   보는 것: ① 네이버 증권 해외주식(한글 회사 이름 · 일봉 · 재무 · 업종 · 한글 기사) ② 미국 증권거래위원회 SEC EDGAR(공식 · 회사 목록 · 업종 코드 · 재무)
 *            ③ 위키백과 S&P 500 목록(GICS 업종) ④ 나스닥 공식 API(전 종목 시가총액·업종) ⑤ Stooq 일봉 ⑥ 야후(다시 확인)
 *   앞날 값은 받지도 셈하지도 않는다(2026-10-04 15:37 「이제 예측을 하지 않는다」).
 */
import fs from 'node:fs/promises';
import path from 'node:path';

const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0 Safari/537.36';
const SEC_UA = 'ATLAS11 research atlas11-bot@users.noreply.github.com'; // SEC 공식 안내: 자동 요청은 연락처가 든 User-Agent 를 쓴다
const out = path.join('reports/atlas11/us/probe', new Date().toISOString().replace(/[:.]/g, '-'));
await fs.mkdir(out, {recursive: true});
const today = new Date(), ymd = d => d.toISOString().slice(0, 10).replace(/-/g, '');
const from = new Date(today.getTime() - 40 * 864e5);

const naver = {'User-Agent': UA, Referer: 'https://m.stock.naver.com/', Accept: 'application/json, text/plain, */*'};
const T = [
  // ① 네이버 증권 해외주식 — 길이 여럿이라 후보를 모두 본다
  ['naver_nasdaq_cap', 'https://api.stock.naver.com/stock/exchange/NASDAQ/marketValue?page=1&pageSize=20', naver],
  ['naver_nyse_cap', 'https://api.stock.naver.com/stock/exchange/NYSE/marketValue?page=1&pageSize=20', naver],
  ['naver_amex_cap', 'https://api.stock.naver.com/stock/exchange/AMEX/marketValue?page=1&pageSize=20', naver],
  ['naver_m_nasdaq_cap', 'https://m.stock.naver.com/api/stocks/marketValue/NASDAQ?page=1&pageSize=20', naver],
  ['naver_aapl_basic', 'https://api.stock.naver.com/stock/AAPL.O/basic', naver],
  ['naver_aapl_integration', 'https://api.stock.naver.com/stock/AAPL.O/integration', naver],
  ['naver_aapl_finance_annual', 'https://api.stock.naver.com/stock/AAPL.O/finance/annual', naver],
  ['naver_aapl_price', 'https://api.stock.naver.com/stock/AAPL.O/price?page=1&pageSize=30', naver],
  ['naver_aapl_chart_day', `https://api.stock.naver.com/chart/foreign/item/AAPL.O/day?startDateTime=${ymd(from)}0000&endDateTime=${ymd(today)}2359`, naver],
  ['naver_aapl_chart_candle', 'https://api.stock.naver.com/chart/foreign/item/AAPL.O?periodType=dayCandle', naver],
  ['naver_aapl_news', 'https://api.stock.naver.com/news/stock/AAPL.O?pageSize=5&page=1', naver],
  ['naver_aapl_news_world', 'https://api.stock.naver.com/news/worldStock/AAPL.O?pageSize=5&page=1', naver],
  ['naver_jpm_basic', 'https://api.stock.naver.com/stock/JPM/basic', naver],
  ['naver_jpm_n_basic', 'https://api.stock.naver.com/stock/JPM.N/basic', naver],
  ['naver_jpm_finance_annual', 'https://api.stock.naver.com/stock/JPM/finance/annual', naver],
  ['naver_index_spx', 'https://api.stock.naver.com/index/.INX/basic', naver],
  ['naver_index_ixic', 'https://api.stock.naver.com/index/.IXIC/basic', naver],
  ['naver_index_spx_price', 'https://api.stock.naver.com/index/.INX/price?page=1&pageSize=10', naver],
  ['naver_industry_list', 'https://api.stock.naver.com/stock/industry/list?nationType=USA', naver],
  // ② SEC EDGAR — 공식 · 무료(초당 10회 안쪽)
  ['sec_tickers', 'https://www.sec.gov/files/company_tickers_exchange.json', {'User-Agent': SEC_UA}],
  ['sec_submissions_aapl', 'https://data.sec.gov/submissions/CIK0000320193.json', {'User-Agent': SEC_UA}],
  ['sec_frames_net_2024', 'https://data.sec.gov/api/xbrl/frames/us-gaap/NetIncomeLoss/USD/CY2024.json', {'User-Agent': SEC_UA}],
  ['sec_frames_equity_2024q4', 'https://data.sec.gov/api/xbrl/frames/us-gaap/StockholdersEquity/USD/CY2024Q4I.json', {'User-Agent': SEC_UA}],
  ['sec_frames_liab_2024q4', 'https://data.sec.gov/api/xbrl/frames/us-gaap/Liabilities/USD/CY2024Q4I.json', {'User-Agent': SEC_UA}],
  ['sec_frames_op_2024', 'https://data.sec.gov/api/xbrl/frames/us-gaap/OperatingIncomeLoss/USD/CY2024.json', {'User-Agent': SEC_UA}],
  // ③ 위키백과 S&P 500 목록(GICS 업종)
  ['wiki_sp500', 'https://en.wikipedia.org/wiki/List_of_S%26P_500_companies', {'User-Agent': SEC_UA}],
  // ④ 나스닥 공식 API — 전 종목(시가총액 · 업종) 한 번에
  ['nasdaq_screener', 'https://api.nasdaq.com/api/screener/stocks?tableonly=true&limit=25&offset=0&download=true', {'User-Agent': UA, Accept: 'application/json, text/plain, */*', Origin: 'https://www.nasdaq.com', Referer: 'https://www.nasdaq.com/'}],
  ['nasdaq_hist_aapl', `https://api.nasdaq.com/api/quote/AAPL/historical?assetclass=stocks&fromdate=${from.toISOString().slice(0, 10)}&limit=60`, {'User-Agent': UA, Accept: 'application/json, text/plain, */*', Origin: 'https://www.nasdaq.com', Referer: 'https://www.nasdaq.com/'}],
  // ⑤ Stooq 일봉(CSV)
  ['stooq_aapl', 'https://stooq.com/q/d/l/?s=aapl.us&i=d', {'User-Agent': UA}],
  ['stooq_spx', 'https://stooq.com/q/d/l/?s=%5Espx&i=d', {'User-Agent': UA}],
  // ⑤-2 부채비율(빚 ÷ 자기자본)을 줄 곳 — 네이버 해외 결산 표에는 ROE · 부채비율이 없다(2026-10-05 19:36 첫 실행에서 확인)
  ['nasdaq_fin_aapl', 'https://api.nasdaq.com/api/company/AAPL/financials?frequency=1', {'User-Agent': UA, Accept: 'application/json, text/plain, */*', Origin: 'https://www.nasdaq.com', Referer: 'https://www.nasdaq.com/'}],
  ['nasdaq_fin_jpm', 'https://api.nasdaq.com/api/company/JPM/financials?frequency=1', {'User-Agent': UA, Accept: 'application/json, text/plain, */*', Origin: 'https://www.nasdaq.com', Referer: 'https://www.nasdaq.com/'}],
  ['nasdaq_fin_brkb', 'https://api.nasdaq.com/api/company/BRK.B/financials?frequency=1', {'User-Agent': UA, Accept: 'application/json, text/plain, */*', Origin: 'https://www.nasdaq.com', Referer: 'https://www.nasdaq.com/'}],
  ['yahoo_ts_aapl', 'https://query2.finance.yahoo.com/ws/fundamentals-timeseries/v1/finance/timeseries/AAPL?symbol=AAPL&type=annualTotalLiabilitiesNetMinorityInterest,annualStockholdersEquity,annualNetIncome,annualOperatingIncome&period1=1609459200&period2=1798761600', {'User-Agent': UA}],
  ['naver_aapl_finance_quarter', 'https://api.stock.naver.com/stock/AAPL.O/finance/quarter', naver],
  // ⑥ 야후(다시 확인)
  ['yahoo_q1_aapl', 'https://query1.finance.yahoo.com/v8/finance/chart/AAPL?range=1mo&interval=1d', {'User-Agent': UA}],
  ['yahoo_q2_aapl', 'https://query2.finance.yahoo.com/v8/finance/chart/AAPL?range=1mo&interval=1d', {'User-Agent': UA}],
];
const summary = [];
for (const [name, url, headers] of T) {
  const t = Date.now(); let status = 0, text = '', err = null, type = null;
  try { const r = await fetch(url, {headers, signal: AbortSignal.timeout(25000)}); status = r.status; type = r.headers.get('content-type'); text = await r.text(); } catch (e) { err = String(e?.cause?.code ?? e?.message ?? e).slice(0, 200); }
  await fs.writeFile(path.join(out, `${name}.txt`), text.slice(0, /^(nasdaq_fin|yahoo_ts)/.test(name) ? 80000 : 20000));
  let shape = null;
  try { const j = JSON.parse(text); shape = Array.isArray(j) ? {array: j.length, first: JSON.stringify(j[0]).slice(0, 400)} : {keys: Object.keys(j).slice(0, 30)}; } catch {}
  summary.push({name, url, status, bytes: text.length, type, ms: Date.now() - t, err, shape});
  console.log(name, status, text.length, err ?? '');
  await new Promise(r => setTimeout(r, name.startsWith('sec') ? 300 : 150));
}
await fs.writeFile(path.join(out, 'summary.json'), JSON.stringify({at: new Date().toISOString(), runner: process.env.RUNNER_NAME ?? null, summary}, null, 1));
console.log('saved', out);
