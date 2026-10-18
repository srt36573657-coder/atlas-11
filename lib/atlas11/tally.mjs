/**
 * 골똘이 · 합계 칸 — 날마다 합계만 세는 서버 셈 한 곳(넷리파이 함수 functions/atlas11/tally.mjs 가 부름 · 길 /api/tally · /api/tally/sum)
 *   사장님 2026-10-18(싱가포르) 16:39 「[꼴똘이 · 진화가 본질인 명령문]」 [10] 1 ~ 6 · [0] 「기록이 이 기기에만 있어 사람들이 실제로 멈췄는지 셀 길이 없다」
 *   잣대 셋(설정 config/atlas11/jinhwa-metrics.v1.json — 기계는 못 고침):
 *     ① 멈춤 = 매매일지를 끝낸 수(stop) · 그중 「오늘은 쉬어 가자」 수(stop_rest)
 *     ② 약속 = 한 달 뒤 「그날 정한 대로 했어?」에 답한 수(promise) · 그중 「했어」 수(promise_yes)
 *     ③ 사실 = 화면 숫자가 자료와 다른 곳(진화 자료 facts.mismatch — 여기서 세지 않음)
 *   참고(잣대 아님 · [10] 2) = 사이트를 연 수(visit) · 보낸 수(share) · 가입을 마친 수(signup) — 사장님 열쇠로만 읽음
 * 받는 것: POST /api/tally {k} 하나 — k = stop | stop_rest | promise | promise_yes | visit | share | signup
 *   stop_rest 하나 = 끝냄 1 + 쉬어 가자 1(한 장에 함께 더함 · 「그중」이 끝낸 수를 넘지 않게) · promise_yes 하나 = 답함 1 + 했어 1
 * 두는 것([10] 3): 서울 날짜마다 숫자만 — m/<날짜> = {stop, stop_rest, promise, promise_yes} · r/<날짜> = {visit, share, signup}
 *   사람 이름 · 기기 번호 · 쿠키 · 인터넷 주소 · 화면 주소 · 받은 때(초)는 읽지도 두지도 않음 · 몸은 {k} 말고 다른 칸이 있으면 받지 않음
 * 막기(이름 없이 할 수 있는 것만): 같은 사이트에서만(Origin · Sec-Fetch-Site) · 몸 64바이트 · 하루 한 칸 20,000 끝(넘으면 세지 않고 capped 표시) ·
 *   함수 하나가 1초에 40번까지(넘으면 429) · 동시에 쓰면 etag 맞대기로 다시(6번)
 * 읽기: GET /api/tally/sum?days=N(1 ~ 200 · 기본 14) — 열쇠 없이 잣대 칸 넷의 날마다 합계만 · 사장님 열쇠(x-atlas-owner)면 참고 칸 셋도
 *   꼴 = {schema, tz, to, n, days: [{day, stop, stop_rest, promise, promise_yes}](오래된 날부터 · 빈 날 0) , total, (열쇠면) ref: [{day, visit, share, signup}], refTotal}
 *   날 칸 이름은 day(진화 회차 scripts/atlas11/jinhwa/lib.mjs normalizeTally 가 day · date 를 읽음) · 200일 = 진화 회차가 채점에 쓰는 앞 · 뒤 칸(60거래일씩)을 한 번에
 * 채점 한 곳: judge({rule, before, after}) — 설정 config/atlas11/jinhwa-metrics.v1.json judge(표본 30 · 소음 |z| < 1.96)를 셈으로 · 진화 회차가 불러 씀
 * 이 파일은 넷리파이에 묶이지 않는다: 저장소는 get · getWithMetadata · setJSON(onlyIfNew · onlyIfMatch) · list 넷만 쓴다(시험은 메모리 저장소로).
 */
import {ownerKeyOk, OWNER_KEY_SHA256} from './invite.mjs';

export const TALLY_STORE = 'atlas11-tally-v1';
export const TALLY_SCHEMA = 'kkolttori-tally-1';
export const METRIC = Object.freeze(['stop', 'stop_rest', 'promise', 'promise_yes']);
export const REF = Object.freeze(['visit', 'share', 'signup']);
/** k → 함께 더하는 칸 */
export const BUMP = Object.freeze({stop: ['stop'], stop_rest: ['stop', 'stop_rest'], promise: ['promise'], promise_yes: ['promise', 'promise_yes'], visit: ['visit'], share: ['share'], signup: ['signup']});
export const LIM = Object.freeze({body: 64, days: 200, defDays: 14, cap: 20000, perSec: 40, tries: 6});
/** 채점 문턱(설정 judge 와 같은 값 — tests/atlas11/tally.test.mjs 가 설정 파일과 맞대 봄) */
export const JUDGE = Object.freeze({minSample: 30, z: 1.96});
const KST = 9 * 3600e3;
/** 서울 날짜(YYYY-MM-DD) */
export const seoulDay = ms => new Date(ms + KST).toISOString().slice(0, 10);
const dayBack = (day, k) => new Date(Date.parse(day + 'T00:00:00Z') - k * 864e5).toISOString().slice(0, 10);

const HEAD = {'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store', 'X-Robots-Tag': 'noindex, nofollow, noarchive', 'Referrer-Policy': 'no-referrer', 'X-Content-Type-Options': 'nosniff'};
const json = (status, body) => new Response(JSON.stringify(body), {status, headers: HEAD});

/** 저장된 한 장 → 그 칸 숫자만(다른 칸 · 이상한 값은 버림) */
const pick = (v, cols) => Object.fromEntries(cols.map(c => [c, Number.isInteger(v?.[c]) && v[c] > 0 ? v[c] : 0]));

/** 한 장에 더하기 — 없으면 새로(onlyIfNew) · 있으면 etag 맞대기(onlyIfMatch) · 「ok」 · 「cap」(끝 수 · 세지 않음) · 「busy」(여섯 번 다 겹침) */
export async function bump(store, key, fields, cols) {
  for (let i = 0; i < LIM.tries; i++) {
    const cur = await store.getWithMetadata(key, {type: 'json'});
    const v = pick(cur?.data, cols);
    if (fields.some(f => v[f] >= LIM.cap)) return 'cap';
    for (const f of fields) v[f] += 1;
    const r = cur ? await store.setJSON(key, v, cur.etag ? {onlyIfMatch: cur.etag} : {}) : await store.setJSON(key, v, {onlyIfNew: true});
    if (r?.modified !== false) return 'ok';
  }
  return 'busy';
}

/** 함수 하나(따뜻한 동안)의 1초 바구니 — 이름 없이 막는 길 */
export function limiter(perSec = LIM.perSec) {
  let sec = -1, n = 0;
  return ms => { const s = Math.floor(ms / 1000); if (s !== sec) { sec = s; n = 0; } return ++n <= perSec; };
}
const LIMIT = limiter();

/** 하나 세기 — k 가 맞으면 오늘(서울) 칸에 더함 */
export async function add(store, k, now) {
  const fields = BUMP[k];
  if (!fields) return {status: 400, body: {error: 'bad_k'}};
  const metric = METRIC.includes(fields[0]), day = seoulDay(now.getTime());
  const r = await bump(store, (metric ? 'm/' : 'r/') + day, fields, metric ? METRIC : REF);
  return r === 'ok' ? {status: 204, body: null} : r === 'cap' ? {status: 202, body: {counted: false, why: 'cap'}} : {status: 503, body: {error: 'busy'}};
}

/** 날마다 합계 — 오래된 날부터 · 빈 날은 0 · owner 면 참고 칸도 · 저장소 목록으로 있는 날만 읽음(목록을 못 받으면 날마다 읽음) */
export async function sumOf(store, {days = LIM.defDays, owner = false, now = new Date()} = {}) {
  const n = Math.max(1, Math.min(LIM.days, Math.floor(Number(days)) || LIM.defDays)), to = seoulDay(now.getTime());
  const list = Array.from({length: n}, (_, i) => dayBack(to, n - 1 - i));
  const rows = async (pre, cols) => {
    let have = null;
    try { have = new Set(((await store.list({prefix: pre}))?.blobs ?? []).map(b => b.key.slice(pre.length))); } catch { have = null; }
    const vals = await Promise.all(list.map(d => (have && !have.has(d) ? null : store.get(pre + d, {type: 'json'}))));
    return vals.map((v, i) => {
      const row = {day: list[i], ...pick(v, cols)};
      if (cols.some(c => row[c] >= LIM.cap)) row.capped = true;
      return row;
    });
  };
  const total = (rs, cols) => Object.fromEntries(cols.map(c => [c, rs.reduce((s, r) => s + r[c], 0)]));
  const m = await rows('m/', METRIC), out = {schema: TALLY_SCHEMA, tz: 'Asia/Seoul', to, n, days: m, total: total(m, METRIC)};
  if (owner) { const r = await rows('r/', REF); out.ref = r; out.refTotal = total(r, REF); }
  return out;
}

/** 잣대 하나 채점(설정 judge 한 곳 · [10] 5 · 6) — 들어가기 전 칸(before)과 뒤 칸(after)의 날마다 줄(sumOf days 꼴 · 같은 날 수)
 *  rule = {num, den?, dir: 'up' | 'down'} — den 이 있으면 몫(num ÷ den · 표본 = den) · 없으면 수(표본 = 그 수)
 *  → {ok: true(맞음) | false(틀림) | null(판단 안 함), why: 'ok' | 'small'(표본 30 아래) | 'noise'(|z| < 1.96) | 'rule', a, b(뒤 · 앞 값 — 몫 또는 하루 평균), sa, sb(표본), z}
 *  몫은 두 몫 차이 z(합친 몫 표준 오차) · 수는 하루 평균 차이 z(칸 길이가 같으면 (뒤 − 앞) ÷ √(앞 + 뒤)) — 설정 judge.noise 그대로 · 하루 숫자로는 판단하지 않음 */
export function judge({rule, before, after, minSample = JUDGE.minSample, zMin = JUDGE.z} = {}) {
  const cols = [...METRIC, ...REF];
  if (!rule || !cols.includes(rule.num) || (rule.den != null && !cols.includes(rule.den)) || !['up', 'down'].includes(rule.dir) || !Array.isArray(before) || !Array.isArray(after)) return {ok: null, why: 'rule'};
  const sum = (W, k) => W.reduce((s, r) => s + (Number.isInteger(r?.[k]) && r[k] > 0 ? r[k] : 0), 0);
  let a, b, sa, sb, z;
  if (rule.den != null) {
    const na = sum(after, rule.num), nb = sum(before, rule.num); sa = sum(after, rule.den); sb = sum(before, rule.den);
    if (sa < minSample || sb < minSample) return {ok: null, why: 'small', sa, sb};
    a = na / sa; b = nb / sb;
    const p = (na + nb) / (sa + sb), se = Math.sqrt(p * (1 - p) * (1 / sa + 1 / sb));
    z = se > 0 ? (a - b) / se : 0;
  } else {
    const la = after.length, lb = before.length;
    sa = sum(after, rule.num); sb = sum(before, rule.num);
    if (!la || !lb || sa < minSample || sb < minSample) return {ok: null, why: 'small', sa, sb};
    a = sa / la; b = sb / lb;
    z = (a - b) / Math.sqrt(sa / (la * la) + sb / (lb * lb));
  }
  z = Math.round(z * 1000) / 1000;
  if (Math.abs(z) < zMin) return {ok: null, why: 'noise', a, b, sa, sb, z};
  return {ok: rule.dir === 'up' ? z > 0 : z < 0, why: 'ok', a, b, sa, sb, z};
}

/** 요청 하나 — POST /api/tally {k} · GET /api/tally/sum?days=N */
export async function handleTally(req, {store, now = () => new Date(), ownerHash = OWNER_KEY_SHA256, allow = LIMIT} = {}) {
  try {
    const url = new URL(req.url), sub = url.pathname.replace(/^\/api\/tally\/?/, '').replace(/\/$/, '');
    if (req.method === 'POST' && sub === '') {
      const origin = req.headers.get('origin'), site = req.headers.get('sec-fetch-site');
      if ((origin && origin !== url.origin) || (site && site !== 'same-origin')) return json(403, {error: 'origin'});
      if (!/^(application\/json|text\/plain)\b/i.test(req.headers.get('content-type') ?? '')) return json(415, {error: 'type'});
      if (Number(req.headers.get('content-length') ?? 0) > LIM.body) return json(413, {error: 'too_large'});
      const text = await req.text();
      if (new TextEncoder().encode(text).length > LIM.body) return json(413, {error: 'too_large'});
      let body = null; try { body = JSON.parse(text); } catch { return json(400, {error: 'bad_json'}); }
      if (!body || typeof body !== 'object' || Array.isArray(body) || Object.keys(body).length !== 1 || typeof body.k !== 'string' || !Object.hasOwn(BUMP, body.k)) return json(400, {error: 'bad_k'});
      if (!allow(Date.now())) return json(429, {error: 'rate'});
      const r = await add(store, body.k, now());
      return r.body == null ? new Response(null, {status: r.status, headers: HEAD}) : json(r.status, r.body);
    }
    if (req.method === 'GET' && sub === 'sum') {
      const owner = ownerKeyOk(req.headers.get('x-atlas-owner'), ownerHash);
      return json(200, await sumOf(store, {days: url.searchParams.get('days') ?? LIM.defDays, owner, now: now()}));
    }
    if (sub !== '' && sub !== 'sum') return json(404, {error: 'not_found'});
    return new Response(null, {status: 405, headers: {...HEAD, Allow: sub === 'sum' ? 'GET' : 'POST'}});
  } catch {
    return json(500, {error: 'server'});
  }
}

/** 시험 · 로컬용 메모리 저장소 — 넷리파이 Blobs 처럼 etag(바뀔 때마다 새 값) · onlyIfNew · onlyIfMatch */
export function memoryStore() {
  const m = new Map();
  let v = 0;
  return {
    async get(key, opts) { const x = m.get(key); if (x == null) return null; return opts?.type === 'json' ? JSON.parse(x.s) : x.s; },
    async getWithMetadata(key, opts) { const x = m.get(key); if (x == null) return null; return {data: opts?.type === 'json' ? JSON.parse(x.s) : x.s, etag: x.e, metadata: {}}; },
    async setJSON(key, value, opts) {
      const x = m.get(key);
      if (opts?.onlyIfNew && x) return {modified: false};
      if (opts?.onlyIfMatch != null && (!x || x.e !== opts.onlyIfMatch)) return {modified: false};
      const e = '"e' + (++v) + '"'; m.set(key, {s: JSON.stringify(value), e}); return {modified: true, etag: e};
    },
    async delete(key) { m.delete(key); },
    async list(opts) { const p = opts?.prefix ?? ''; return {blobs: [...m.keys()].filter(k => k.startsWith(p)).sort().map(key => ({key, etag: m.get(key).e})), directories: []}; },
    _map: m,
  };
}
