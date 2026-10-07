/**
 * 중국 · 일본 · 베트남 주식 자료 출처 시험(깃허브 실행기에서) — 사장님 2026-10-07 05:25 「자 중국 일본 베트남 주식도 넣어라 미국 장 처럼 말이다」
 *   이 작업 공간에서는 시세 사이트에 닿지 않아(접속 막힘) 깃허브 실행기에서 어느 길이 열리는지 먼저 본다(미국 판 scripts/atlas11/us/probe.mjs 와 같은 방법).
 *   결과: reports/atlas11/world/probe/<시각>/summary.json + 길마다 앞 20KB 원문(.txt)
 *   보는 것: ① 네이버 증권 해외주식 — 거래소 이름 후보(시가총액 순 목록) · 대표 회사 하루 값 · 결산 · 한글 기사 · 지수
 *            ② 야후 재무 시계열(결산 대신 · 막히는지 다시 확인)
 *   앞날 값은 받지도 셈하지도 않는다(2026-10-04 15:37 「이제 예측을 하지 않는다」).
 */
import fs from 'node:fs/promises';
import path from 'node:path';

const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0 Safari/537.36';
const out = path.join('reports/atlas11/world/probe', new Date().toISOString().replace(/[:.]/g, '-'));
await fs.mkdir(out, {recursive: true});
const today = new Date(), ymd = d => d.toISOString().slice(0, 10).replace(/-/g, '');
const from = new Date(today.getTime() - 40 * 864e5);
const naver = {'User-Agent': UA, Referer: 'https://m.stock.naver.com/', Accept: 'application/json, text/plain, */*'};
const N = 'https://api.stock.naver.com';
const T = [];
// ① 거래소 이름 후보 — 미국은 NYSE · NASDAQ · AMEX 였다
for (const ex of ['SHH', 'SHZ', 'SSE', 'SZSE', 'SHANGHAI', 'SHENZHEN', 'TYO', 'TSE', 'TOKYO', 'JPX', 'HSX', 'HOSE', 'HOCHIMINH', 'HNX', 'HANOI', 'HKG', 'HKEX'])
  T.push([`list_${ex}`, `${N}/stock/exchange/${ex}/marketValue?page=1&pageSize=20`, naver]);
for (const nat of ['CHN', 'JPN', 'VNM', 'HKG']) {
  T.push([`nation_${nat}`, `${N}/stock/nation/${nat}/marketValue?page=1&pageSize=20`, naver]);
  T.push([`mlist_${nat}`, `https://m.stock.naver.com/api/stocks/marketValue/${nat}?page=1&pageSize=20`, naver]);
  T.push([`industry_${nat}`, `${N}/stock/industry/list?nationType=${nat}`, naver]);
}
// ② 대표 회사 — 귀주모태(상하이) · 핑안은행(선전) · 도요타(도쿄) · 비나밀크(호찌민) · 하노이 한 곳
const reps = [['600519.SS', 'cn_sh'], ['000001.SZ', 'cn_sz'], ['7203.T', 'jp'], ['VNM.HM', 'vn_hm'], ['VNM', 'vn_plain'], ['SHS.HN', 'vn_hn'], ['VCB.HM', 'vn_vcb']];
for (const [rc, k] of reps) {
  T.push([`basic_${k}`, `${N}/stock/${encodeURIComponent(rc)}/basic`, naver]);
  T.push([`day_${k}`, `${N}/chart/foreign/item/${encodeURIComponent(rc)}/day?startDateTime=${ymd(from)}0000&endDateTime=${ymd(today)}2359`, naver]);
  T.push([`fin_${k}`, `${N}/stock/${encodeURIComponent(rc)}/finance/annual`, naver]);
  T.push([`news_${k}`, `${N}/news/worldStock/${encodeURIComponent(rc)}?pageSize=5&page=1`, naver]);
}
// ③ 지수 후보
for (const ix of ['.SSEC', '.SZSC', '.CSI300', '.N225', '.TOPX', '.VNI', '.HNXI', '.VN30', '.HSI'])
  T.push([`index_${ix.slice(1)}`, `${N}/index/${encodeURIComponent(ix)}/basic`, naver], [`indexday_${ix.slice(1)}`, `${N}/chart/foreign/index/${encodeURIComponent(ix)}/day?startDateTime=${ymd(from)}0000&endDateTime=${ymd(today)}2359`, naver]);
// ④ 야후 재무 시계열(결산 다른 길)
for (const sym of ['600519.SS', '7203.T', 'VNM.VN'])
  T.push([`yahoo_ts_${sym.replace(/\W/g, '_')}`, `https://query2.finance.yahoo.com/ws/fundamentals-timeseries/v1/finance/timeseries/${sym}?symbol=${sym}&type=annualNetIncome,annualOperatingIncome,annualStockholdersEquity,annualTotalLiabilitiesNetMinorityInterest&period1=1514764800&period2=${Math.floor(Date.now() / 1000)}`, {'User-Agent': UA}]);

const summary = [];
for (const [name, url, headers] of T) {
  const t = Date.now(); let status = 0, text = '', err = null, type = null;
  try { const r = await fetch(url, {headers, signal: AbortSignal.timeout(25000)}); status = r.status; type = r.headers.get('content-type'); text = await r.text(); } catch (e) { err = String(e?.cause?.code ?? e?.message ?? e).slice(0, 120); }
  await fs.writeFile(path.join(out, `${name}.txt`), text.slice(0, 20000));
  let shape = null;
  try { const j = JSON.parse(text); shape = Array.isArray(j) ? {array: j.length, first: JSON.stringify(j[0]).slice(0, 500)} : {keys: Object.keys(j).slice(0, 30), head: JSON.stringify(j).slice(0, 500)}; } catch {}
  summary.push({name, url, status, bytes: text.length, type, ms: Date.now() - t, err, shape});
  console.log(name, status, text.length, err ?? '');
  await new Promise(r => setTimeout(r, 150));
}
await fs.writeFile(path.join(out, 'summary.json'), JSON.stringify({at: new Date().toISOString(), runner: process.env.RUNNER_NAME ?? null, summary}, null, 1));
console.log('saved', out);
