#!/usr/bin/env node
// 큐피트 — 우량주 365곳(board.json) 네이버 일봉 [날, 종가, 거래량] 받기(주문 1113-2033 · 사장님 2026-11-13 20:33 「이걸 11 가지로 만든다면 … 이전 11 개를 해가지고 … 정상까지 다 연결」)
//   손자병법 서른여섯 꾀 가운데 거래량으로 재는 다섯(몰래 다른 길 가기 · 풀 쳐서 뱀 놀래기 · 솥 밑 장작 빼기 · 나무에 꽃 달기 · 빈 성 꾀 — su21_s36.py · 주문 1113-2224)에 씀
//   (주문 1113-2033 특징 열하나의 넷에 쓰던 것 — 그 묶음은 주문 1113-2224 로 뺌)
//   올리기 작업(package.mjs · 깃허브 실행기)만 부름 — 이 컴퓨터 · 미리 보기는 받지 않음(그 다섯은 「거래량 자료가 없어 못 셈」) · 예약 작업 파일은 고치지 않음(규칙 7)
//   같은 네이버 일봉 주소 · 같은 쉼(곳마다 120ms) · 받기 도구는 ../collect_naver.mjs 그대로(예전 화면 t365 파일은 손대지 않음 — 규칙 75)
//   쓰는 법: node scripts/atlas11/next/su21_vol.mjs --board public/data/atlas11/view/board.json --out <파일.json> [--count 70] [--budget-s 120] [--fixture 폴더]
//   결과: {schema: 'su21-vol-1', at, count, codes, ok, failed, last, rows: {번호: [[YYYYMMDD, 종가, 거래량], …]}, errors: [{code, error}]} · 한 곳도 못 받으면 끝 코드 1
import fs from 'node:fs/promises';
import {fetchWithRetry, parseFchartXml, fixtureFetch, fchartUrl} from '../collect_naver.mjs';

const arg = (k, d) => { const i = process.argv.indexOf(k); return i < 0 ? d : process.argv[i + 1]; };
const boardF = arg('--board', 'public/data/atlas11/view/board.json'), out = arg('--out', null);
if (!out) { console.error('--out 이 필요해요'); process.exit(2); }
const count = Math.max(30, Math.min(200, +arg('--count', 70) || 70)), budget = Math.max(20, +arg('--budget-s', 120) || 120) * 1000;
const fixture = arg('--fixture', null), doFetch = fixture ? fixtureFetch(fixture) : globalThis.fetch;
const board = JSON.parse(await fs.readFile(boardF, 'utf8'));
const codes = [...new Set((board.companies ?? []).map(c => c?.code).filter(c => /^[0-9A-Z]{6}$/.test(c ?? '')))];
const t0 = Date.now(), rows = {}, errors = [];
let next = 0;
async function worker() {
  while (next < codes.length) {
    const code = codes[next++];
    if (Date.now() - t0 > budget) { errors.push({code, error: 'BUDGET'}); continue; }
    try {
      const r = await fetchWithRetry(fchartUrl(code, count), {fetch: doFetch, retries: 2, backoffMs: [800, 2400], timeoutMs: 15000});
      const got = parseFchartXml(r.text).rows.filter(x => x.close > 0 && x.volume >= 0).map(x => [x.date.replaceAll('-', ''), x.close, x.volume]);
      if (!got.length) throw Error('FCHART_NO_ROWS');
      rows[code] = got;
    } catch (e) { errors.push({code, error: String(e?.message ?? e).slice(0, 160)}); }
    if (!fixture) await new Promise(r => setTimeout(r, 120)); // 네이버에 예의 — 곳마다 쉼
  }
}
const PAR = Math.max(1, Math.min(8, Math.floor(+process.env.ATLAS_FETCH_PAR) || 4));
await Promise.all(Array.from({length: PAR}, worker));
const ok = Object.keys(rows).length, last = Object.values(rows).map(r => r.at(-1)?.[0]).filter(Boolean).sort().at(-1) ?? null;
await fs.writeFile(out, JSON.stringify({schema: 'su21-vol-1', at: new Date().toISOString(), count, codes: codes.length, ok, failed: codes.length - ok, last, rows, errors}));
console.log(JSON.stringify({ok, failed: codes.length - ok, last, sec: Math.round((Date.now() - t0) / 1000), firstErrors: errors.slice(0, 2)}));
process.exit(ok ? 0 : 1);
