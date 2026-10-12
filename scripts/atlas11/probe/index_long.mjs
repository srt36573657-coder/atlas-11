// 탐침 — 코스피 · 코스닥 날마다 종가 긴 기록(사장님 2026-10-13 01:28 「너에 의견이 맞니 1억번 계산고 360도 사고 해서 가장 날까론 저의를 내」)
//   첫 화면 금빛 「!」 문턱(지수 하루 3% → 「평소의 2배」?)을 지난 기록 전부로 견주려고 받음 · 깃허브 실행기에서만 닿음(이 컴퓨터는 바깥 연결이 막힘)
//   결과 reports/atlas11/probe/index-long/{kospi,kosdaq}.json = [[YYYY-MM-DD, 종가], …] · summary.json(해마다 받은 줄 수 · 응답)
import fs from 'node:fs/promises';
const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0 Safari/537.36';
const dir = 'reports/atlas11/probe/index-long'; await fs.mkdir(dir, {recursive: true});
const kst = new Date(Date.now() + 9 * 36e5), endY = +kst.toISOString().slice(0, 4), today = kst.toISOString().slice(0, 10).replaceAll('-', '');
const sum = [];
for (const idx of ['KOSPI', 'KOSDAQ']) {
  const rows = new Map();
  for (let y = 1990; y <= endY; y++) {
    const from = `${y}0101`, to = y === endY ? today : `${y}1231`, url = `https://api.stock.naver.com/chart/domestic/index/${idx}/day?startDateTime=${from}&endDateTime=${to}`;
    let status = 0, n = 0, err = null;
    try {
      const r = await fetch(url, {headers: {'User-Agent': UA, Referer: 'https://m.stock.naver.com/', Accept: 'application/json'}, signal: AbortSignal.timeout(20000)});
      status = r.status; const j = r.ok ? await r.json() : null;
      for (const c of Array.isArray(j) ? j : []) { const d = String(c.localDate ?? ''), v = Number(c.closePrice); if (/^\d{8}$/.test(d) && v > 0) { rows.set(`${d.slice(0, 4)}-${d.slice(4, 6)}-${d.slice(6, 8)}`, v); n++; } }
    } catch (e) { err = String(e.message); }
    sum.push({idx, y, status, n, err});
    await new Promise(r => setTimeout(r, 150));
  }
  const out = [...rows.entries()].sort((a, b) => (a[0] < b[0] ? -1 : 1));
  await fs.writeFile(`${dir}/${idx.toLowerCase()}.json`, JSON.stringify(out));
}
await fs.writeFile(`${dir}/summary.json`, JSON.stringify({made: new Date().toISOString(), years: sum}, null, 0));
console.log(JSON.stringify(sum.filter(x => x.n || x.err).map(x => [x.idx, x.y, x.status, x.n, x.err])));
