// 정규장 종가 후보 출처 원문(전체) 저장 — 매일경제 시세판 · 네이버 통합/실시간/분봉
import fs from 'node:fs/promises';
const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0 Safari/537.36';
const dir = 'reports/atlas11/probe/deep'; await fs.mkdir(dir, {recursive: true});
const T = [
  ['mk-home-005930.html', 'https://stock.mk.co.kr/price/home/KR7005930003'],
  ['mk-foreigner-005930.html', 'https://stock.mk.co.kr/price/foreigner/KR7005930003'],
  ['mk-daily-005930.html', 'https://stock.mk.co.kr/price/daily/KR7005930003'],
  ['naver-integration-005930.json', 'https://m.stock.naver.com/api/stock/005930/integration'],
  ['naver-polling-005930.json', 'https://polling.finance.naver.com/api/realtime/domestic/stock/005930'],
  ['naver-minute-005930.json', 'https://api.stock.naver.com/chart/domestic/item/005930/minute?startDateTime=202609291515&endDateTime=202609291545'],
  ['naver-m-price-krx-005930.json', 'https://m.stock.naver.com/api/stock/005930/price?pageSize=3&page=1&marketType=KRX'],
  ['naver-fchart-krx-005930.xml', 'https://fchart.stock.naver.com/sise.nhn?symbol=005930&timeframe=day&count=3&requestType=0&market=KRX'],
  ['naver-siseJson-krx-005930.txt', 'https://api.finance.naver.com/siseJson.naver?symbol=005930&requestType=1&startTime=20260925&endTime=20260929&timeframe=day'],
];
const out = [];
for (const [name, url] of T) {
  let status = 0, text = '', err = null;
  try { const r = await fetch(url, {headers: {'User-Agent': UA, Referer: url.includes('mk.co.kr') ? 'https://stock.mk.co.kr/' : 'https://m.stock.naver.com/', Accept: '*/*'}, signal: AbortSignal.timeout(20000)}); status = r.status; const buf = Buffer.from(await r.arrayBuffer()); text = /euc-kr/i.test(r.headers.get('content-type') ?? '') ? new TextDecoder('euc-kr').decode(buf) : buf.toString('utf8'); } catch (e) { err = String(e.message); }
  await fs.writeFile(`${dir}/${name}`, text.slice(0, 600000)); out.push({name, url, status, bytes: text.length, err});
}
await fs.writeFile(`${dir}/summary.json`, JSON.stringify(out, null, 1)); console.log(JSON.stringify(out));
