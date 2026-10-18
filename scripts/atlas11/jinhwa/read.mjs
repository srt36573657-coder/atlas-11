#!/usr/bin/env node
// 진화 회차 열쇠 없는 읽기 — 사장님 2026-10-18(싱가포르) 16:39 [9] 8 「진화 회차는 열쇠 없는 읽기 주소로 대안 번호와 상태만 읽는다. 깃허브 열쇠는 사이트에 두지 마라.」
//   읽는 것 둘뿐: GET <사이트>/api/jinhwa/status(번호 · 상태 · 때) · GET <사이트>/api/tally/sum?days=N(잣대 칸 넷의 날마다 합계) — 열쇠 · 쿠키 · 머리글 없이
//   왜 따로 있나: Claude 예약 작업 방의 바깥 길(egress)은 aaa7377.com 을 막음(2026-10-18 이 방에서 connect_rejected 확인) →
//     round.mjs 가 먼저 바로 읽어 보고(curl · 길잡이 proxy) 막히면 깃허브 작업 .github/workflows/atlas11-jinhwa-read.yml 이 이 파일을 돌려 읽은 것을 묶음(artifact)으로 돌려줌
//   이 파일은 다른 파일을 부르지 않음(깃허브 작업이 이 폴더만 받아 돎) · 쓰는 것 = --out 파일 하나 · 사이트에 아무것도 보내지 않음(GET 둘)
//   쓰는 법: node scripts/atlas11/jinhwa/read.mjs [--days 200] [--base https://aaa7377.com] [--out jinhwa-read.json]
//   끝 코드: 0 = 둘 다 읽음 · 1 = 하나라도 못 읽음(파일은 늘 씀 — 못 읽은 쪽은 ok false · 까닭) · 2 = 잘못 부름
import fs from 'node:fs';
import {fileURLToPath} from 'node:url';

export const READ_SCHEMA = 'kkolttori-jinhwa-read-1';
const sleep = ms => new Promise(r => setTimeout(r, ms));
async function get(url, {tries = 3, timeoutMs = 15000} = {}) {
  let why = '';
  for (let i = 0; i < tries; i++) {
    try {
      const r = await fetch(url, {headers: {accept: 'application/json'}, cache: 'no-store', redirect: 'error', signal: AbortSignal.timeout(timeoutMs)});
      if (r.ok) { const json = await r.json(); return {ok: true, http: r.status, json}; }
      why = 'HTTP ' + r.status; if (r.status === 404 || r.status === 403) return {ok: false, http: r.status, why};
    } catch (e) { why = String(e?.cause?.code || e?.name || e?.message || e).slice(0, 80); }
    await sleep(1500 * (i + 1));
  }
  return {ok: false, http: 0, why};
}
/** 둘 읽기 — {schema, at, base, days, status: {ok, http, json | why}, tally: {…}} */
export async function readBoth({base = 'https://aaa7377.com', days = 200} = {}) {
  const b = String(base).replace(/\/+$/, '');
  const [status, tally] = await Promise.all([get(`${b}/api/jinhwa/status`), get(`${b}/api/tally/sum?days=${days}`)]);
  return {schema: READ_SCHEMA, at: new Date().toISOString(), base: b, days, status, tally};
}

if (process.argv[1] && fs.realpathSync(process.argv[1]) === fs.realpathSync(fileURLToPath(import.meta.url))) {
  const a = process.argv.slice(2), arg = (k, d) => { const i = a.indexOf(k); return i >= 0 && i + 1 < a.length ? a[i + 1] : d; };
  const days = Number(arg('--days', '200')), base = arg('--base', 'https://aaa7377.com'), out = arg('--out', 'jinhwa-read.json');
  if (!Number.isInteger(days) || days < 1 || days > 200 || !/^https:\/\/[a-z0-9.-]+(:\d+)?\/?$|^http:\/\/127\.0\.0\.1:\d+\/?$/.test(base) || !/^[\w.\-/]+\.json$/.test(out)) {
    console.error('쓰는 법: read.mjs [--days 1 ~ 200] [--base https://…] [--out 파일.json]'); process.exit(2);
  }
  const r = await readBoth({base, days});
  fs.writeFileSync(out, JSON.stringify(r) + '\n');
  console.log(`상태 ${r.status.ok ? '읽음' : '못 읽음 ' + r.status.why} · 합계 ${r.tally.ok ? '읽음' : '못 읽음 ' + r.tally.why}`);
  process.exit(r.status.ok && r.tally.ok ? 0 : 1);
}
