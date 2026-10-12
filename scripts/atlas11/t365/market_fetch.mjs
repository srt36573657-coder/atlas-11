#!/usr/bin/env node
// 새 ATLAS 첫 화면 종합 정보 원문 받기(깃허브 실행기 · 회차마다) — 사장님 2026-10-12 14:54 「첫화면에 3개월 코스피 코스닥 지수 그래프 … 오늘 … 업종 … 수급 … 미국장 분위기」
//   주소는 탐침 scripts/atlas11/probe/home.mjs 가 깃허브 실행기에서 확인한 것(2026-10-12 14:59 · 모두 200) — 이름도 같게 써서 home_build.mjs 가 그대로 읽음
//   주소마다 20초 · 두 번까지 · 못 받으면 그 파일만 비움(home_build 가 앞 회차 값 또는 「?」) · 끝 코드는 늘 0(첫 화면 조각이 회차를 멈추지 않게)
// 쓰는 법: node scripts/atlas11/t365/market_fetch.mjs --out <폴더>
import fs from 'node:fs/promises';
const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0 Safari/537.36';
const arg = (k, d) => { const i = process.argv.indexOf(k); return i < 0 ? d : process.argv[i + 1]; };
const dir = arg('--out', 'home-raw'); await fs.mkdir(dir, {recursive: true});
const kst = new Date(Date.now() + 9 * 36e5), ymd = d => d.toISOString().slice(0, 10).replaceAll('-', ''), to = ymd(kst), from = ymd(new Date(kst.getTime() - 120 * 864e5));
export const HOME_URLS = [
  ['kospi-day.json', `https://api.stock.naver.com/chart/domestic/index/KOSPI/day?startDateTime=${from}&endDateTime=${to}`],
  ['kosdaq-day.json', `https://api.stock.naver.com/chart/domestic/index/KOSDAQ/day?startDateTime=${from}&endDateTime=${to}`],
  ['kospi-trend.json', 'https://m.stock.naver.com/api/index/KOSPI/trend'],
  ['kosdaq-trend.json', 'https://m.stock.naver.com/api/index/KOSDAQ/trend'],
  ['industry.json', 'https://m.stock.naver.com/api/stocks/industry?page=1&pageSize=100'],
  ['us-inx.json', 'https://api.stock.naver.com/index/.INX/price?page=1&pageSize=60'],
  ['us-ixic.json', 'https://api.stock.naver.com/index/.IXIC/price?page=1&pageSize=60'],
  ['us-dji.json', 'https://api.stock.naver.com/index/.DJI/price?page=1&pageSize=60'],
  ['us-sox.json', 'https://api.stock.naver.com/index/.SOX/price?page=1&pageSize=60'],
  ['us-vix.json', 'https://api.stock.naver.com/index/.VIX/price?page=1&pageSize=60'],
];
const out = [];
for (const [name, url] of HOME_URLS) {
  let status = 0, text = '', err = null; const t = Date.now();
  for (let k = 0; k < 2; k++) {
    try {
      const r = await fetch(url, {headers: {'User-Agent': UA, Referer: 'https://m.stock.naver.com/', Accept: 'application/json, text/plain, */*'}, signal: AbortSignal.timeout(20000)});
      status = r.status; text = Buffer.from(await r.arrayBuffer()).toString('utf8'); err = null;
      if (r.ok) { try { JSON.parse(text); break; } catch { err = 'JSON 아님'; } } else err = 'HTTP ' + r.status;
    } catch (e) { err = String(e.message ?? e).slice(0, 120); }
    await new Promise(res => setTimeout(res, 1500));
  }
  await fs.writeFile(`${dir}/${name}`, err ? '' : text.slice(0, 400000));
  out.push({name, url, status, bytes: text.length, ms: Date.now() - t, err, fetchedAt: new Date().toISOString()});
}
await fs.writeFile(`${dir}/summary.json`, JSON.stringify(out, null, 1));
console.log(JSON.stringify({ok: out.filter(x => !x.err).length, failed: out.filter(x => x.err).map(x => x.name + ' ' + x.err)}));
