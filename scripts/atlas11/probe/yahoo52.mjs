// 야후 52종목 요청 시험: 종목마다 한 번(재시도 없음) · 상태·시간·크기 기록 + spark(묶음) 시험
import fs from 'node:fs/promises';
const input = JSON.parse(await fs.readFile('public/data/input.json', 'utf8'));
const UA = 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0 Safari/537.36';
const out = []; const t0 = Date.now();
const delay = Number(process.argv[2] ?? 600);
for (const a of input.assets) {
  for (const sfx of ['.KS', '.KQ']) {
    const url = `https://query1.finance.yahoo.com/v8/finance/chart/${a.code}${sfx}?range=1mo&interval=1d&includePrePost=false`, t = Date.now();
    let status = 0, bytes = 0, err = null, last = null;
    try { const r = await fetch(url, {headers: {'User-Agent': UA, Accept: 'application/json'}, signal: AbortSignal.timeout(15000)}); status = r.status; const text = await r.text(); bytes = text.length; try { const j = JSON.parse(text).chart.result[0]; const q = j.indicators.quote[0]; last = {close: q.close.at(-1), ts: j.timestamp.at(-1), rmt: j.meta.regularMarketTime, price: j.meta.regularMarketPrice}; } catch {} } catch (e) { err = String(e.message); }
    out.push({code: a.code, sfx, status, bytes, ms: Date.now() - t, err, last});
    await fs.writeFile('reports/atlas11/probe/yahoo52-progress.json', JSON.stringify({elapsedMs: Date.now() - t0, out}));
    await new Promise(r => setTimeout(r, delay));
    if (status === 200 && last) break;
  }
}
for (const url of [`https://query1.finance.yahoo.com/v8/finance/spark?symbols=${input.assets.slice(0, 20).map(a => a.code + '.KS').join(',')}&range=5d&interval=1d`, `https://query1.finance.yahoo.com/v7/finance/spark?symbols=${input.assets.slice(0, 20).map(a => a.code + '.KS').join(',')}&range=5d&interval=1d`]) {
  let status = 0, text = ''; try { const r = await fetch(url, {headers: {'User-Agent': UA}, signal: AbortSignal.timeout(15000)}); status = r.status; text = await r.text(); } catch (e) { text = String(e.message); }
  out.push({spark: url.includes('v8') ? 'v8' : 'v7', status, sample: text.slice(0, 1500)});
}
await fs.writeFile('reports/atlas11/probe/yahoo52-progress.json', JSON.stringify({elapsedMs: Date.now() - t0, done: true, out}, null, 1));
console.log('done', Date.now() - t0);
