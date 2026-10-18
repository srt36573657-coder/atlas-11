#!/usr/bin/env node
// 진화 회차 열쇠 없는 읽기 — 사장님 2026-10-18(싱가포르) 16:39 [9] 8 「진화 회차는 열쇠 없는 읽기 주소로 대안 번호와 상태만 읽는다. 깃허브 열쇠는 사이트에 두지 마라.」
//   읽는 것 둘뿐: GET <사이트>/api/jinhwa/status(번호 · 상태 · 때) · GET <사이트>/api/tally/sum?days=N(잣대 칸 넷의 날마다 합계) — 열쇠 · 쿠키 · 머리글 없이
//   왜 따로 있나: Claude 예약 작업 방의 바깥 길(egress)은 aaa7377.com 을 막음(2026-10-18 이 방에서 connect_rejected 확인) →
//     round.mjs 가 먼저 바로 읽어 보고(curl · 길잡이 proxy) 막히면 깃허브 작업 .github/workflows/atlas11-jinhwa-read.yml 이 이 파일을 돌려 읽은 것을 묶음(artifact)으로 돌려줌
//   이 파일은 다른 파일을 부르지 않음(깃허브 작업이 이 폴더만 받아 돎) · 쓰는 것 = --out 파일 하나 · 사이트에 아무것도 보내지 않음(GET 둘)
//   쓰는 법: node scripts/atlas11/jinhwa/read.mjs [--days 200] [--base https://aaa7377.com] [--out jinhwa-read.json]
//   끝 코드: 0 = 둘 다 읽음 · 1 = 하나라도 못 읽음(파일은 늘 씀 — 못 읽은 쪽은 ok false · 까닭) · 2 = 잘못 부름
//   알림 줄(2026-10-18 20:20 첫 회차 — Claude 예약 방은 깃허브 묶음 · 작업 기록을 못 받음: 받는 곳 blob.core.windows.net 을 바깥 길이 막음 · api.github.com 만 됨)
//     node read.mjs --annotate jinhwa-read.json → 읽은 것을 gzip · base64 로 조각내 「::notice title=jinhwa-read-<i>::…」 줄로 찍음(머리 줄 = 조각 수 · 길이 · sha256)
//     회차(gh.mjs readAnnotations)가 gh api …/check-runs/<작업>/annotations 로 받아 fromAnnotations 로 다시 맞춤 — 하나라도 어긋나면 닫힌 쪽(아무것도 넣지 않음)
import fs from 'node:fs';
import zlib from 'node:zlib';
import crypto from 'node:crypto';
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

// ───────────── 알림 줄로 보내기 · 다시 맞추기 ─────────────
export const ANN_PREFIX = 'jinhwa-read-', ANN_CHUNK = 3000, ANN_MAX = 9; // 조각 3,000자(알림 글 한도보다 아주 작게) · 머리 줄 + 조각 9 = 한 걸음 알림 10개 안
const sha256 = s => crypto.createHash('sha256').update(s).digest('hex');
/** 읽은 것 → 알림 줄들(머리 줄 먼저) — 너무 크면 throw(닫힌 쪽) */
export function toAnnotations(obj, {chunk = ANN_CHUNK, max = ANN_MAX} = {}) {
  const b64 = zlib.gzipSync(Buffer.from(JSON.stringify(obj), 'utf8'), {level: 9}).toString('base64');
  const parts = [];
  for (let i = 0; i < b64.length; i += chunk) parts.push(b64.slice(i, i + chunk));
  if (!parts.length || parts.length > max) throw Error(`읽은 것이 너무 큼(조각 ${parts.length}개 · ${max}개까지)`);
  return [`::notice title=${ANN_PREFIX}head::v1 n=${parts.length} len=${b64.length} sha=${sha256(b64)}`, ...parts.map((p, i) => `::notice title=${ANN_PREFIX}${i}::${p}`)];
}
/** 깃허브 알림 목록(gh api repos/…/check-runs/<번호>/annotations 의 꼴 — [{title, message, annotation_level, …}]) → {ok, json, why}
 *  머리 줄 하나 · 조각 0 ~ n-1 모두 한 번씩(같은 번호 다른 글 = 실패) · 길이 · sha256 · gzip · JSON · schema 가 모두 맞아야 ok */
export function fromAnnotations(list) {
  if (!Array.isArray(list)) return {ok: false, why: '알림 목록 꼴이 아님'};
  const mine = list.filter(a => typeof a?.title === 'string' && a.title.startsWith(ANN_PREFIX) && (a.annotation_level ?? 'notice') === 'notice');
  const heads = mine.filter(a => a.title === ANN_PREFIX + 'head').map(a => String(a.message ?? '').trim());
  if (new Set(heads).size !== 1) return {ok: false, why: heads.length ? '머리 줄이 여럿' : '머리 줄이 없음'};
  const m = /^v1 n=(\d+) len=(\d+) sha=([0-9a-f]{64})$/.exec(heads[0]);
  if (!m) return {ok: false, why: '머리 줄 꼴이 틀림'};
  const n = Number(m[1]), len = Number(m[2]);
  if (n < 1 || n > ANN_MAX) return {ok: false, why: `조각 수가 이상함(${n})`};
  const parts = new Map();
  for (const a of mine) {
    const k = /^jinhwa-read-(\d+)$/.exec(a.title)?.[1]; if (k == null) continue;
    const i = Number(k), msg = String(a.message ?? '').trim();
    if (!/^[A-Za-z0-9+/=]+$/.test(msg)) return {ok: false, why: `조각 ${i} 글이 base64 가 아님`};
    if (parts.has(i) && parts.get(i) !== msg) return {ok: false, why: `조각 ${i} 가 둘이고 서로 다름`};
    parts.set(i, msg);
  }
  if (parts.size !== n || [...parts.keys()].some(i => i < 0 || i >= n)) return {ok: false, why: `조각이 모자라거나 남음(${parts.size} / ${n})`};
  const b64 = Array.from({length: n}, (_, i) => parts.get(i)).join('');
  if (b64.length !== len) return {ok: false, why: `길이가 다름(${b64.length} / ${len})`};
  if (sha256(b64) !== m[3]) return {ok: false, why: 'sha256 이 다름'};
  let json;
  try { json = JSON.parse(zlib.gunzipSync(Buffer.from(b64, 'base64')).toString('utf8')); } catch { return {ok: false, why: '풀어 읽지 못함(gzip · JSON)'}; }
  if (json?.schema !== READ_SCHEMA || !Number.isFinite(Date.parse(json.at)) || !json.status || !json.tally) return {ok: false, why: '읽은 것 꼴이 틀림(schema · at · status · tally)'};
  return {ok: true, json};
}

if (process.argv[1] && fs.realpathSync(process.argv[1]) === fs.realpathSync(fileURLToPath(import.meta.url))) {
  const a = process.argv.slice(2), arg = (k, d) => { const i = a.indexOf(k); return i >= 0 && i + 1 < a.length ? a[i + 1] : d; };
  if (a.includes('--annotate')) { // 읽은 파일 → 알림 줄(깃허브 작업의 둘째 걸음) · 못 하면 끝 코드 1(닫힌 쪽)
    try { for (const l of toAnnotations(JSON.parse(fs.readFileSync(arg('--annotate', 'jinhwa-read.json'), 'utf8')))) console.log(l); process.exit(0); }
    catch (e) { console.error('알림 줄을 못 만듦 — ' + String(e?.message ?? e).slice(0, 120)); process.exit(1); }
  }
  const days = Number(arg('--days', '200')), base = arg('--base', 'https://aaa7377.com'), out = arg('--out', 'jinhwa-read.json');
  if (!Number.isInteger(days) || days < 1 || days > 200 || !/^https:\/\/[a-z0-9.-]+(:\d+)?\/?$|^http:\/\/127\.0\.0\.1:\d+\/?$/.test(base) || !/^[\w.\-/]+\.json$/.test(out)) {
    console.error('쓰는 법: read.mjs [--days 1 ~ 200] [--base https://…] [--out 파일.json]'); process.exit(2);
  }
  const r = await readBoth({base, days});
  fs.writeFileSync(out, JSON.stringify(r) + '\n');
  console.log(`상태 ${r.status.ok ? '읽음' : '못 읽음 ' + r.status.why} · 합계 ${r.tally.ok ? '읽음' : '못 읽음 ' + r.tally.why}`);
  process.exit(r.status.ok && r.tally.ok ? 0 : 1);
}
