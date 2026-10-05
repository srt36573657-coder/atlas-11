// 검사용 실제 원문: 세 종목 · 9/28·9/29 15:25~15:45 분봉
import fs from 'node:fs/promises';
const dir = 'tests/atlas11/fixtures/naver-minute'; await fs.mkdir(dir, {recursive: true});
for (const code of ['005930', '373220', '329180']) for (const day of ['20260928', '20260929']) {
  const url = `https://api.stock.naver.com/chart/domestic/item/${code}/minute?startDateTime=${day}1525&endDateTime=${day}1545`;
  const r = await fetch(url, {headers: {'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64) Chrome/126.0', Referer: 'https://m.stock.naver.com/'}}); const t = await r.text();
  await fs.writeFile(`${dir}/${code}-${day}.json`, t); console.log(code, day, r.status, t.length);
}
await fs.writeFile(`${dir}/README.md`, `# 네이버 분봉 실제 수신 원문\n\n${new Date().toISOString()} 깃허브 실행기에서 받은 15:25~15:45 분봉(세 종목 · 9/28·9/29). 검사 전용.\n`);
