#!/usr/bin/env node
// 새 ATLAS 일봉 이어 받기 — 사장님 2026-10-11 09:37 「기준일을 항상 현재 날짜에서 지난 20일 거래로 하라 … 항상 그렇게 하라」
//   12:41 「아니 내일이면 내일 다시 그다음날도 다시 기준은 항상 오늘날짜로 해야 하고 업데이트는 하루에 4번 해야 하고 …」 → 회차마다 365곳을 다시 고르므로
//   후보 모두(기본 --set all · 고른 365곳 + 밖 회사 · 1,378곳)의 [날, 종가, 거래량]을 받는다(--set 365 = 고른 365곳만).
//   모음(reports/atlas11/universe/2026-10-10/bundle.json.gz)과 같은 네이버 일봉 주소에서 마지막 count 줄만 받아 새 파일로 남긴다.
//   count 기본 = 모음 날(universe.json asOf) 뒤 평일 수 + 10(30 ~ 400) — 모음 뒤 날을 한 번에 다 받으므로 지난 파일이 없어도 됨
//   올리기(scripts/atlas11/package.mjs)가 깃허브 실행기에서 돌 때 부른다(평일 16:00 · 19:00 예약 올리기 · 손으로 올리기) — 예약 작업 파일은 고치지 않음(규칙 7).
//   쓰는 법: node scripts/atlas11/t365/closes_fetch.mjs [--out reports/atlas11/t365/closes] [--count 30] [--budget-s 240] [--fixture 폴더]
//   결과: <out>/<받기 시작한 때 UTC YYYYMMDDTHHMMSSZ>.json.gz — 새 파일만(덮어쓰지 않음 · 기록은 지우지 않음)
//         {schema: 'atlas-t365-closes-2', startedAt, finishedAt, source, count, set, codes, ok, failed,
//          rows: {번호: [[YYYYMMDD, 종가, 거래량], …]}, errors: [{code, error}]}  (옛 판 -1 은 [YYYYMMDD, 종가])
//   한 곳 실패는 다른 곳에 번지지 않음 · 시간(budget) 넘으면 남은 곳은 「BUDGET」으로 적고 끝냄
//   끝 코드 0 = 한 곳 이상 받아 파일을 씀 · 1 = 한 곳도 못 받음(파일은 남김 — 실패도 기록)
import fs from 'node:fs/promises';
import path from 'node:path';
import zlib from 'node:zlib';
import {fetchWithRetry, parseFchartXml, fixtureFetch} from '../collect_naver.mjs';

const arg = (k, d) => { const i = process.argv.indexOf(k); return i < 0 ? d : process.argv[i + 1]; };
const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), '../../..');
const out = path.resolve(ROOT, arg('--out', 'reports/atlas11/t365/closes'));
const act = JSON.parse(await fs.readFile(path.join(ROOT, 'scripts/atlas11/t365/universe.json'), 'utf8')); // 지금 쓰는 365곳 판(대세 365곳)
const weekdaysSince = d0 => { let n = 0; for (let t = Date.parse(d0 + 'T00:00:00Z') + 864e5; t <= Date.now() + 9 * 36e5; t += 864e5) { const w = new Date(t).getUTCDay(); if (w !== 0 && w !== 6) n++; } return n; };
const count = Math.max(5, Math.min(400, +arg('--count', 0) || Math.max(30, weekdaysSince(act.asOf) + 10)));
const budget = Math.max(30, +arg('--budget-s', 420) || 420) * 1000;
const fixture = arg('--fixture', null), set = arg('--set', 'all');
const pro = JSON.parse(await fs.readFile(path.join(ROOT, act.dir, 'proposal.json'), 'utf8'));
const codes = set === '365' ? pro.picked.map(p => p.code) : [...pro.picked.map(p => p.code), ...(pro.outside ?? []).map(o => o.code)];
const doFetch = fixture ? fixtureFetch(path.resolve(fixture)) : globalThis.fetch;
const url = code => `https://fchart.stock.naver.com/sise.nhn?symbol=${code}&timeframe=day&count=${count}&requestType=0`;
const t0 = Date.now(), startedAt = new Date().toISOString(), rows = {}, errors = [];
let next = 0;
async function worker() {
  while (next < codes.length) {
    const code = codes[next++];
    if (Date.now() - t0 > budget) { errors.push({code, error: 'BUDGET'}); continue; }
    try {
      const r = await fetchWithRetry(url(code), {fetch: doFetch, retries: 2, backoffMs: [800, 2400], timeoutMs: 15000});
      const got = parseFchartXml(r.text).rows.filter(x => x.close > 0).map(x => [x.date.replaceAll('-', ''), x.close, x.volume]);
      if (!got.length) throw Error('FCHART_NO_ROWS');
      rows[code] = got;
    } catch (e) { errors.push({code, error: String(e?.message ?? e).slice(0, 160)}); }
    if (!fixture) await new Promise(r => setTimeout(r, 120)); // 네이버에 예의 — 곳마다 쉼
  }
}
await Promise.all([worker(), worker(), worker(), worker()]);
const ok = Object.keys(rows).length;
const res = {schema: 'atlas-t365-closes-2', startedAt, finishedAt: new Date().toISOString(), source: 'https://fchart.stock.naver.com/sise.nhn?symbol=<번호>&timeframe=day&count=' + count + '&requestType=0',
  count, set, codes: codes.length, ok, failed: codes.length - ok, rows: Object.fromEntries(codes.filter(c => rows[c]).map(c => [c, rows[c]])), errors};
await fs.mkdir(out, {recursive: true});
const file = path.join(out, startedAt.replace(/[-:]/g, '').replace(/\.\d+Z$/, 'Z') + '.json.gz');
try { await fs.access(file); console.error('같은 이름 파일이 이미 있어 쓰지 않음: ' + file); process.exit(1); } catch { /* 없음 = 새로 씀 */ }
await fs.writeFile(file, zlib.gzipSync(JSON.stringify(res)));
const last = Object.values(rows).map(r => r.at(-1)?.[0]).filter(Boolean).sort().at(-1) ?? null;
console.log(JSON.stringify({file: path.relative(ROOT, file), ok, failed: res.failed, last, sec: Math.round((Date.now() - t0) / 1000), firstErrors: errors.slice(0, 3)}));
process.exit(ok ? 0 : 1);
