/**
 * 골똘이 · 진화 칸 — 사장님 「확인」 · 거두기 · 되돌리기를 적는 서버 셈 한 곳(넷리파이 함수 functions/atlas11/jinhwa.mjs 가 부름 · 길 /api/jinhwa/*)
 *   사장님 2026-10-18(싱가포르) 16:39 「[꼴똘이 · 진화가 본질인 명령문]」 [9] 4 · 5 · 6 · 8 · [1] 5 「사장님의 「확인」으로만」 · 일 나누기 split.md 「KD」
 *   · 쓰기(POST confirm · withdraw · revert {id}) = 사장님 열쇠(머리글 x-atlas-owner · invite.mjs ownerKeyOk — 편지 여는 밤과 같은 열쇠 · 같은 해시)일 때만
 *     번호(id)는 지금 올라가 있는 /next/data/jinhwa.json(진화 회차 KE 가 씀 · schema kkolttori-jinhwa-1)의 waiting · applied 에 있는 것만
 *   · 읽기(GET /api/jinhwa/status) = 열쇠 없이 {items: [{id, state, at}]} 만 — 진화 회차가 읽음(이름 · 글 · 사람 · 기기 없음)
 *   · GET /api/jinhwa/me = 이 열쇠가 사장님 열쇠인가(진화 칸 쪽 · 보유종목 줄이 열기 전에 물음) — 맞으면 200 · 아니면 403
 *   · 깃허브 열쇠는 쓰지도 두지도 않는다([9] 8) — 저장소는 넷리파이 Blobs(편지 여는 밤과 같은 길)
 * 상태 넷(회차가 읽는 뜻):
 *   confirmed = 확인(기다리는 진화) → 다음 회차가 넣음 · withdrawn = 들어가기 전에 거둠 → 아무것도 안 함
 *   revert    = 들어간 진화를 되돌려 달라 → 다음 회차가 되돌림 · kept = 되돌리기를 거둠 → 아무것도 안 함
 *   회차는 업데이트마다 한 가지만([1] 5 「업데이트마다 … 한 가지씩」) — confirmed 가운데 at 이 가장 이른 것부터. 화면(p-jinhwa.js)의 「○시」도 이 차례로 셈
 *   거두기는 들어가기 전에만([9] 5) — applied 에 오른 번호의 확인은 못 거둠(409 applied) · 되돌리기는 applied 에 오른 번호만(409 not_applied)
 *   applied 줄에 reverted(또는 revertedAt)가 있으면 이미 되돌린 것 — 더 못 바꿈(409 reverted)
 * 기록은 지우지 않는다: 번호마다 한 장(s/<번호>) · 바뀔 때마다 log 에 한 줄 더함(마지막 100줄)
 * 이 파일은 넷리파이에 묶이지 않는다: 저장소(store)는 get · setJSON · list 셋만 쓴다(시험은 메모리 저장소로).
 */
import {ownerKeyOk, OWNER_KEY_SHA256} from './invite.mjs';

export const JINHWA_STORE = 'atlas11-jinhwa-v1';
export const STATE_SCHEMA = 'kkolttori-jinhwa-state-1';
export const DATA_SCHEMA = 'kkolttori-jinhwa-1';
export const STATES = Object.freeze(['confirmed', 'withdrawn', 'revert', 'kept']);
export const OPS = Object.freeze(['confirm', 'withdraw', 'revert']);
export const ID_RE = /^[A-Za-z0-9][A-Za-z0-9._-]{0,63}$/;
export const LIM = Object.freeze({body: 1024, log: 100, dataWaitMs: 4000});

const HEAD = {'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store', 'X-Robots-Tag': 'noindex, nofollow, noarchive', 'Referrer-Policy': 'no-referrer', 'X-Content-Type-Options': 'nosniff'};
const json = (status, body) => new Response(JSON.stringify(body), {status, headers: HEAD});
const R = (status, body) => ({status, body});

/** 진화 자료 → 번호 둘(기다리는 · 들어간) — 꼴이 틀리면 null */
export function idsOf(data) {
  if (!data || typeof data !== 'object' || data.schema !== DATA_SCHEMA || !Array.isArray(data.waiting) || !Array.isArray(data.applied)) return null;
  const waiting = new Set(), applied = new Map();
  for (const w of data.waiting) if (typeof w?.id === 'string' && ID_RE.test(w.id)) waiting.add(w.id);
  for (const a of data.applied) if (typeof a?.id === 'string' && ID_RE.test(a.id)) applied.set(a.id, a);
  return {waiting, applied};
}

/** 지금 올라가 있는 진화 자료 — 같은 사이트의 /next/data/jinhwa.json(받는 때 4초까지 · 못 받으면 null) */
export async function siteData(req, {fetchImpl = globalThis.fetch, waitMs = LIM.dataWaitMs} = {}) {
  try {
    const r = await fetchImpl(new URL('/next/data/jinhwa.json', req.url), {cache: 'no-store', redirect: 'error', signal: AbortSignal.timeout(waitMs)});
    return r.ok ? await r.json() : null;
  } catch { return null; }
}

/** 번호 하나의 상태(없으면 null) */
export async function stateOf(store, id) {
  const s = await store.get('s/' + id, {type: 'json'});
  return s?.schema === STATE_SCHEMA && STATES.includes(s.state) ? s : null;
}

/** 열쇠 없는 읽기 — 번호 · 상태 · 때만(이른 것부터) */
export async function statusOf(store) {
  const keys = ((await store.list({prefix: 's/'}))?.blobs ?? []).map(b => b.key);
  const items = [];
  for (const k of keys) { const s = await store.get(k, {type: 'json'}); if (s?.schema === STATE_SCHEMA && STATES.includes(s.state) && ID_RE.test(s.id ?? '')) items.push({id: s.id, state: s.state, at: s.at}); }
  items.sort((a, b) => (a.at < b.at ? -1 : a.at > b.at ? 1 : a.id < b.id ? -1 : 1));
  return {items};
}

/** 바꾸기 — op = confirm · withdraw · revert · data = 지금 올라가 있는 진화 자료 */
export async function change(store, op, id, data, now) {
  if (!OPS.includes(op)) return R(400, {error: 'bad_op'});
  if (typeof id !== 'string' || !ID_RE.test(id)) return R(400, {error: 'bad_id'});
  const D = idsOf(data);
  if (!D) return R(503, {error: 'no_data'});
  const ap = D.applied.get(id), inWait = D.waiting.has(id);
  if (!ap && !inWait) return R(404, {error: 'unknown_id'});
  if (ap && (ap.reverted || ap.revertedAt)) return R(409, {error: 'reverted'});
  const cur = await stateOf(store, id), st = cur?.state ?? null;
  let next;
  if (op === 'confirm') { if (ap) return R(409, {error: 'applied'}); next = 'confirmed'; }
  else if (op === 'withdraw') {
    if (ap) { if (st !== 'revert') return R(409, {error: st === 'kept' ? 'not_revert' : 'applied'}); next = 'kept'; } // 들어간 뒤에는 확인을 못 거둠 — 되돌리기만 거둠
    else { if (st !== 'confirmed') return R(409, {error: 'not_confirmed'}); next = 'withdrawn'; }
  } else { if (!ap) return R(409, {error: 'not_applied'}); next = 'revert'; }
  if (st === next) return R(200, {id, state: st, at: cur.at}); // 같은 것을 두 번 — 그대로(때도 그대로)
  const at = now.toISOString(), log = [...(Array.isArray(cur?.log) ? cur.log : []), {state: next, at}].slice(-LIM.log);
  await store.setJSON('s/' + id, {schema: STATE_SCHEMA, id, state: next, at, log});
  return R(200, {id, state: next, at});
}

/** 요청 하나 — GET status · me · POST confirm | withdraw | revert(길 끝 또는 몸 op) {id} */
export async function handleJinhwa(req, {store, now = () => new Date(), ownerHash = OWNER_KEY_SHA256, dataOf = siteData} = {}) {
  try {
    const url = new URL(req.url), sub = url.pathname.replace(/^\/api\/jinhwa\/?/, '').replace(/\/$/, '');
    const owner = ownerKeyOk(req.headers.get('x-atlas-owner'), ownerHash);
    if (req.method === 'GET') {
      if (sub === 'status') return json(200, await statusOf(store));
      if (sub === 'me') return owner ? json(200, {owner: true}) : json(403, {error: 'owner_only'});
      return json(404, {error: 'not_found'});
    }
    if (req.method === 'POST') {
      if (sub !== '' && !OPS.includes(sub)) return json(404, {error: 'not_found'});
      const origin = req.headers.get('origin');
      if (origin && origin !== url.origin) return json(403, {error: 'origin'});
      if (!owner) return json(403, {error: 'owner_only'});
      if (!/^application\/json\b/i.test(req.headers.get('content-type') ?? '')) return json(415, {error: 'type'});
      if (Number(req.headers.get('content-length') ?? 0) > LIM.body) return json(413, {error: 'too_large'});
      const text = await req.text();
      if (new TextEncoder().encode(text).length > LIM.body) return json(413, {error: 'too_large'});
      let body = null; try { body = JSON.parse(text); } catch { return json(400, {error: 'bad_json'}); }
      const op = sub || body?.op, id = body?.id;
      if (!OPS.includes(op)) return json(400, {error: 'bad_op'});
      if (typeof id !== 'string' || !ID_RE.test(id)) return json(400, {error: 'bad_id'});
      const r = await change(store, op, id, await dataOf(req), now());
      return json(r.status, r.body);
    }
    return new Response(null, {status: 405, headers: {...HEAD, Allow: 'GET, POST'}});
  } catch {
    return json(500, {error: 'server'});
  }
}

/** 시험 · 로컬용 메모리 저장소(넷리파이 Blobs 와 같은 get · setJSON · delete · list) */
export function memoryStore() {
  const m = new Map();
  return {
    async get(key, opts) { const v = m.get(key); if (v == null) return null; return opts?.type === 'json' ? JSON.parse(v) : v; },
    async setJSON(key, value, opts) { if (opts?.onlyIfNew && m.has(key)) return {modified: false}; m.set(key, JSON.stringify(value)); return {modified: true}; },
    async delete(key) { m.delete(key); },
    async list(opts) { const p = opts?.prefix ?? ''; return {blobs: [...m.keys()].filter(k => k.startsWith(p)).sort().map(key => ({key, etag: ''})), directories: []}; },
    _map: m,
  };
}
