// 탐침 2차 — 거시(환율·해외지수·금리·유가) 후보 출처. FRED 는 1차에서 20초 안에 응답이 없어 시간·머리글을 바꿔 다시 두드린다.
import fs from 'node:fs/promises';
const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0 Safari/537.36';
const dir = 'reports/atlas11/probe/context2'; await fs.mkdir(dir, {recursive: true});
const T = [
  ['fx-api-usdkrw-prices.json', 'https://api.stock.naver.com/marketindex/exchange/FX_USDKRW/prices?page=1&pageSize=10'],
  ['fx-m-usdkrw-prices.json', 'https://m.stock.naver.com/front-api/marketIndex/prices?category=exchange&reutersCode=FX_USDKRW&page=1&pageSize=10'],
  ['fx-api-usdkrw-basic.json', 'https://api.stock.naver.com/marketindex/exchange/FX_USDKRW'],
  ['fx-m-exchange-detail.json', 'https://m.stock.naver.com/front-api/marketIndex/productDetail?category=exchange&reutersCode=FX_USDKRW'],
  ['world-inx-price.json', 'https://api.stock.naver.com/index/.INX/price?page=1&pageSize=10'],
  ['world-ixic-price.json', 'https://api.stock.naver.com/index/.IXIC/price?page=1&pageSize=10'],
  ['world-sox-price.json', 'https://api.stock.naver.com/index/.SOX/price?page=1&pageSize=10'],
  ['world-vix-price.json', 'https://api.stock.naver.com/index/.VIX/price?page=1&pageSize=10'],
  ['world-inx-basic.json', 'https://api.stock.naver.com/index/.INX/basic'],
  ['bond-us10y-prices.json', 'https://api.stock.naver.com/marketindex/bond/US10YT=RR/prices?page=1&pageSize=10'],
  ['bond-m-us10y.json', 'https://m.stock.naver.com/front-api/marketIndex/prices?category=bond&reutersCode=US10YT%3DRR&page=1&pageSize=10'],
  ['bond-m-kr3y.json', 'https://m.stock.naver.com/front-api/marketIndex/prices?category=bond&reutersCode=KR3YT%3DRR&page=1&pageSize=10'],
  ['energy-wti-prices.json', 'https://api.stock.naver.com/marketindex/energy/CLcv1/prices?page=1&pageSize=10'],
  ['energy-m-wti.json', 'https://m.stock.naver.com/front-api/marketIndex/prices?category=energy&reutersCode=CLcv1&page=1&pageSize=10'],
  ['fred-60s-DEXKOUS.csv', 'https://fred.stlouisfed.org/graph/fredgraph.csv?id=DEXKOUS&cosd=2026-08-01', 60000, 'curl/8.5.0'],
  ['fred-60s-VIXCLS.csv', 'https://fred.stlouisfed.org/graph/fredgraph.csv?id=VIXCLS&cosd=2026-08-01', 60000, UA],
];
const out = [];
for (const [name, url, timeout = 20000, ua = UA] of T) {
  let status = 0, text = '', err = null, type = ''; const t = Date.now();
  try {
    const r = await fetch(url, {headers: {'User-Agent': ua, Referer: url.includes('naver.com') ? 'https://m.stock.naver.com/' : 'https://fred.stlouisfed.org/', Accept: '*/*'}, signal: AbortSignal.timeout(timeout)});
    status = r.status; type = r.headers.get('content-type') ?? '';
    text = Buffer.from(await r.arrayBuffer()).toString('utf8');
  } catch (e) { err = String(e.message); }
  await fs.writeFile(`${dir}/${name}`, text.slice(0, 200000));
  out.push({name, url, status, type, bytes: text.length, ms: Date.now() - t, err, fetchedAt: new Date().toISOString()});
}
await fs.writeFile(`${dir}/summary.json`, JSON.stringify(out, null, 1));
console.log(JSON.stringify(out.map(x => [x.name, x.status, x.bytes, x.err])));
