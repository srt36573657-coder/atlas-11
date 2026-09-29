// 매일 함께 모을 「시장·수급·뉴스·공시·거시」 후보 출처를 한 번 두드려 원문을 남긴다(기록용 탐침 · 입력·발행은 건드리지 않음)
import fs from 'node:fs/promises';
const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0 Safari/537.36';
const day = process.argv[2] || '20260929';
const d = `${day.slice(0, 4)}-${day.slice(4, 6)}-${day.slice(6, 8)}`;
const dir = 'reports/atlas11/probe/context'; await fs.mkdir(dir, {recursive: true});
const T = [
  // 수급(외국인·기관·개인)
  ['flow-m-trend-005930.json', 'https://m.stock.naver.com/api/stock/005930/trend?pageSize=10&page=1'],
  ['flow-m-trend-196170.json', 'https://m.stock.naver.com/api/stock/196170/trend?pageSize=10&page=1'],
  ['flow-m-investor-005930.json', 'https://m.stock.naver.com/api/stock/005930/investor?pageSize=10&page=1'],
  ['flow-api-trend-005930.json', 'https://api.stock.naver.com/stock/005930/trend?pageSize=10&page=1'],
  ['flow-frgn-005930.html', 'https://finance.naver.com/item/frgn.naver?code=005930'],
  // 시장 지수
  ['index-m-kospi-basic.json', 'https://m.stock.naver.com/api/index/KOSPI/basic'],
  ['index-m-kospi-price.json', 'https://m.stock.naver.com/api/index/KOSPI/price?pageSize=5&page=1'],
  ['index-m-kosdaq-price.json', 'https://m.stock.naver.com/api/index/KOSDAQ/price?pageSize=5&page=1'],
  ['index-api-kospi-minute.json', `https://api.stock.naver.com/chart/domestic/index/KOSPI/minute?startDateTime=${day}1525&endDateTime=${day}1545`],
  ['index-api-kospi-day.json', `https://api.stock.naver.com/chart/domestic/index/KOSPI/day?startDateTime=${day.slice(0, 6)}01&endDateTime=${day}`],
  ['index-m-kospi-trend.json', 'https://m.stock.naver.com/api/index/KOSPI/trend'],
  ['index-investor-deal-kospi.html', `https://finance.naver.com/sise/investorDealTrendDay.naver?bizdate=${day}&sosok=01`],
  // 뉴스
  ['news-m-005930.json', 'https://m.stock.naver.com/api/news/stock/005930?pageSize=20&page=1'],
  ['news-api-005930.json', 'https://api.stock.naver.com/news/stock/005930?pageSize=20&page=1'],
  ['news-m-196170.json', 'https://m.stock.naver.com/api/news/stock/196170?pageSize=20&page=1'],
  // 공시
  ['disc-m-005930.json', 'https://m.stock.naver.com/api/stock/005930/disclosure?pageSize=20&page=1'],
  ['disc-m2-005930.json', 'https://m.stock.naver.com/api/disclosure/stock/005930?pageSize=20&page=1'],
  ['disc-api-005930.json', 'https://api.stock.naver.com/stock/005930/disclosure?pageSize=20&page=1'],
  ['disc-dart-list.html', 'https://dart.fss.or.kr/dsac001/mainAll.do'],
  // 거시(FRED 공개 CSV · 열쇠 없음)
  ['fred-DEXKOUS.csv', 'https://fred.stlouisfed.org/graph/fredgraph.csv?id=DEXKOUS'],
  ['fred-VIXCLS.csv', 'https://fred.stlouisfed.org/graph/fredgraph.csv?id=VIXCLS'],
  ['fred-SP500.csv', 'https://fred.stlouisfed.org/graph/fredgraph.csv?id=SP500'],
  ['fred-DFII10.csv', 'https://fred.stlouisfed.org/graph/fredgraph.csv?id=DFII10'],
  ['fred-BAA10Y.csv', 'https://fred.stlouisfed.org/graph/fredgraph.csv?id=BAA10Y'],
  ['fred-DCOILWTICO.csv', 'https://fred.stlouisfed.org/graph/fredgraph.csv?id=DCOILWTICO'],
  ['fred-DGS10.csv', 'https://fred.stlouisfed.org/graph/fredgraph.csv?id=DGS10'],
  ['fred-DFF.csv', 'https://fred.stlouisfed.org/graph/fredgraph.csv?id=DFF'],
];
const out = [];
for (const [name, url] of T) {
  let status = 0, text = '', err = null, type = '', ms = 0; const t = Date.now();
  try {
    const r = await fetch(url, {headers: {'User-Agent': UA, Referer: url.includes('naver.com') ? 'https://m.stock.naver.com/' : url, Accept: '*/*'}, signal: AbortSignal.timeout(20000)});
    status = r.status; type = r.headers.get('content-type') ?? '';
    const buf = Buffer.from(await r.arrayBuffer());
    text = /euc-kr/i.test(type) ? new TextDecoder('euc-kr').decode(buf) : buf.toString('utf8');
  } catch (e) { err = String(e.message); }
  ms = Date.now() - t;
  // FRED 는 긴 이력이라 최근 부분만 남긴다(머리줄 + 2026 행)
  const keep = name.startsWith('fred-') ? text.split(/\r?\n/).filter((l, i) => i === 0 || l.startsWith('2026-')).join('\n') : text.slice(0, 400000);
  await fs.writeFile(`${dir}/${name}`, keep);
  out.push({name, url, status, type, bytes: text.length, ms, err, fetchedAt: new Date().toISOString(), day: d});
}
await fs.writeFile(`${dir}/summary.json`, JSON.stringify(out, null, 1));
console.log(JSON.stringify(out.map(x => [x.name, x.status, x.bytes, x.err]), null, 0));
