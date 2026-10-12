// 탐침 — 새 ATLAS 첫 화면 종합 정보(사장님 2026-10-12 14:54 「첫화면에 3개월 코스피 코스닥 지수 그래프 … 365개 종목 … 오늘 어떤 업종이 강했는지 약했는지 각각 7가지 … 수급 … 미국장 분위기」)
//   깃허브 실행기에서만 닿는 네이버 주소들의 지금 응답 모양을 받아 둠(이 컴퓨터에서는 바깥 연결이 막힘) — 결과 reports/atlas11/probe/home/
import fs from 'node:fs/promises';
const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0 Safari/537.36';
const dir = 'reports/atlas11/probe/home'; await fs.mkdir(dir, {recursive: true});
const kst = new Date(Date.now() + 9 * 36e5), ymd = d => d.toISOString().slice(0, 10).replaceAll('-', ''), to = ymd(kst), from = ymd(new Date(kst.getTime() - 120 * 864e5));
const T = [
  ['kospi-day.json', `https://api.stock.naver.com/chart/domestic/index/KOSPI/day?startDateTime=${from}&endDateTime=${to}`],
  ['kosdaq-day.json', `https://api.stock.naver.com/chart/domestic/index/KOSDAQ/day?startDateTime=${from}&endDateTime=${to}`],
  ['kospi-trend.json', 'https://m.stock.naver.com/api/index/KOSPI/trend'],
  ['kosdaq-trend.json', 'https://m.stock.naver.com/api/index/KOSDAQ/trend'],
  ['kospi-trend-page.json', 'https://m.stock.naver.com/api/index/KOSPI/trend?pageSize=10&page=1'],
  ['kospi-price.json', 'https://m.stock.naver.com/api/index/KOSPI/price?pageSize=10&page=1'],
  ['kosdaq-price.json', 'https://m.stock.naver.com/api/index/KOSDAQ/price?pageSize=10&page=1'],
  ['industry.json', 'https://m.stock.naver.com/api/stocks/industry?page=1&pageSize=100'],
  ['us-inx.json', 'https://api.stock.naver.com/index/.INX/price?page=1&pageSize=60'],
  ['us-ixic.json', 'https://api.stock.naver.com/index/.IXIC/price?page=1&pageSize=60'],
  ['us-dji.json', 'https://api.stock.naver.com/index/.DJI/price?page=1&pageSize=60'],
  ['us-sox.json', 'https://api.stock.naver.com/index/.SOX/price?page=1&pageSize=60'],
  ['us-vix.json', 'https://api.stock.naver.com/index/.VIX/price?page=1&pageSize=60'],
];
const out = [];
for (const [name, url] of T) {
  let status = 0, text = '', err = null, type = ''; const t = Date.now();
  try {
    const r = await fetch(url, {headers: {'User-Agent': UA, Referer: 'https://m.stock.naver.com/', Accept: 'application/json, text/plain, */*'}, signal: AbortSignal.timeout(20000)});
    status = r.status; type = r.headers.get('content-type') ?? ''; text = Buffer.from(await r.arrayBuffer()).toString('utf8');
  } catch (e) { err = String(e.message); }
  await fs.writeFile(`${dir}/${name}`, text.slice(0, 300000));
  out.push({name, url, status, type, bytes: text.length, ms: Date.now() - t, err, fetchedAt: new Date().toISOString()});
}
await fs.writeFile(`${dir}/summary.json`, JSON.stringify(out, null, 1));
console.log(JSON.stringify(out.map(x => [x.name, x.status, x.bytes, x.err])));
