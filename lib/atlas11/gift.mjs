/**
 * 돌이 · 친구 셋 선물 — 서버 쪽 셈 한 곳(넷리파이 함수 functions/atlas11/gift.mjs 가 부름 · 경로 /api/gift · /api/gift/*)
 *   사장님 2026-10-25 13:40 「편지를 보내지 않아도 … 카톡 친구 세 명으로 세 명을 보냈다 라는 걸 알 수 있게끔 그렇게 시스템을 짜고 곳곳에 선물 받기를 다 집어넣어 놔 지금부터 만들어」
 *   · 13:38 「내가 직접 보낼 거야」
 *   한 줄: 내 고리를 연 다른 기기 수를 셈 · 셋마다 선물 신청 한 번 · 사장님(열쇠 x-atlas-owner)이 신청을 보고 카톡 선물을 직접 보낸 뒤 「보냄」 표시
 *   · 이름 · 기기 열쇠는 두지 않음(해시만) — 기기 열쇠(22자 · 그 기기에만)는 x-gift-key 로만 옴 · 내 표 = SHA-256(열쇠) base64url 앞 16자(화면도 같은 셈)
 *   · 연 기기 해시는 「gift-visit|」를 앞에 붙여 따로 셈 — 내 표와 이어지지 않게(누가 누구 고리를 열었는지 저장소에서 잇지 못함)
 *   · 전화번호는 동의받고 선물 보낼 때까지만(보내면 지움 · 끝 네 자리만 남김 · 60일 넘게 기다린 신청도 목록을 볼 때 지움)
 *   · 너무 잦으면 막음: 연 기록 한 기기 하루 60개 · 사이트 모두 하루 20000개 · 신청은 한 표에 10분 하나 · 모두 20번까지
 * 이 파일은 넷리파이에 묶이지 않는다: 저장소(store)는 get · setJSON · delete · list 넷만 씀(시험은 메모리 저장소 — letter.mjs memoryStore)
 * 저장소 열쇠: v/<내 표>/<연 기기 해시> 연 기록 · c/<번호> 신청 · m/<내 표> 그 표의 신청 번호 · q/<서울 날짜>/<연 기기 해시> · q/<서울 날짜>/all 잦기
 */
import {randomBytes, createHash} from 'node:crypto';
import {ownerKeyOk, OWNER_KEY_SHA256} from './invite.mjs';

export const GIFT_SCHEMA = 'atlas11-gift-1';
export const GIFT_STORE = 'atlas11-gift-v1';
export const RULE = Object.freeze({per: 3, keepWaitDays: 60, maxClaims: 20, visitsPerDay: 60, dayAll: 20000});

const KEY_RE = /^[A-Za-z0-9_-]{22}$/, REF_RE = /^[A-Za-z0-9_-]{16}$/, ID_RE = /^[0-9a-z]{9}-[A-Za-z0-9_-]{12}$/, PHONE_RE = /^01[016789]\d{7,8}$/;
const BODY = 2048, GAP = 10 * 60e3, KST = 9 * 3600e3;
/** 내 표(고리에 붙는 공개 표) — 화면은 SubtleCrypto 로 같은 셈(SHA-256 → base64url → 앞 16자) */
export const refOf = k => createHash('sha256').update(k, 'utf8').digest('base64url').slice(0, 16);
/** 연 기기 해시(16진 32자) — 앞말을 붙여 내 표와 다른 값 */
const vhOf = k => createHash('sha256').update('gift-visit|' + k, 'utf8').digest('hex').slice(0, 32);
const seoulDay = ms => new Date(ms + KST).toISOString().slice(0, 10);
/** 신청 번호 — 때(36진 9자 · 차례대로 늘어섬) + 무작위 12자 */
const newId = ms => Math.floor(ms).toString(36).padStart(9, '0') + '-' + randomBytes(9).toString('base64url');

const HEAD = {'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store', 'X-Robots-Tag': 'noindex, nofollow, noarchive', 'Referrer-Policy': 'no-referrer', 'X-Content-Type-Options': 'nosniff'};
const json = (status, body) => new Response(JSON.stringify(body), {status, headers: HEAD});
const R = (status, body) => ({status, body});
const keysOf = async (store, prefix) => ((await store.list({prefix}))?.blobs ?? []).map(b => b.key);
const getJ = (store, key) => store.get(key, {type: 'json'}).catch(() => null);
/** 여럿을 스무 개씩 나눠 받음 */
async function getMany(store, keys) {
  const out = [];
  for (let i = 0; i < keys.length; i += 20) out.push(...(await Promise.all(keys.slice(i, i + 20).map(k => getJ(store, k)))));
  return out;
}

/** 내 고리를 연 다른 기기 수 · 그 가운데 카톡 안에서 연 수 */
async function countOf(store, ref) {
  const rows = await getMany(store, await keysOf(store, `v/${ref}/`));
  return {friends: rows.length, kk: rows.filter(r => r?.kk === true).length};
}

/** 그 표의 신청들(오래된 것부터) — ids 는 m/<표> 그대로 · rows 는 남아 있는 신청 */
async function claimsOf(store, ref) {
  const meta = await getJ(store, 'm/' + ref);
  const ids = [...new Set(Array.isArray(meta?.claims) ? meta.claims.filter(x => typeof x === 'string' && ID_RE.test(x)) : [])];
  const rows = (await getMany(store, ids.map(x => 'c/' + x))).filter(c => c?.id && c.ref === ref);
  return {ids, rows};
}

/** 연 기록 — 남의 고리를 처음 연 기기만 하나로 셈(내 고리 · 두 번째는 안 셈) */
async function visit(store, k, body, ua, now) {
  const r = body?.r;
  if (typeof r !== 'string' || !REF_RE.test(r)) return R(400, {error: 'ref'});
  if (refOf(k) === r) return R(200, {ok: true, self: true});
  const vh = vhOf(k), vk = `v/${r}/${vh}`;
  if (await getJ(store, vk)) return R(200, {ok: true});
  const t = now.getTime(), day = seoulDay(t), qk = `q/${day}/${vh}`, ak = `q/${day}/all`;
  const [mine, all] = await Promise.all([getJ(store, qk), getJ(store, ak)]);
  const n = Number.isFinite(mine?.n) ? mine.n : 0, na = Number.isFinite(all?.n) ? all.n : 0;
  if (n >= RULE.visitsPerDay) return R(429, {error: 'day'});
  if (na >= RULE.dayAll) return R(429, {error: 'busy'});
  await store.setJSON(vk, {at: now.toISOString(), kk: /KAKAOTALK/i.test(ua ?? '')});
  await Promise.all([store.setJSON(qk, {n: n + 1}), store.setJSON(ak, {n: na + 1})]);
  return R(200, {ok: true});
}

/** 내 수 — 연 친구 · 카톡에서 연 수 · 내 신청 · 다음 신청에 필요한 수 */
async function me(store, ref) {
  const [{friends, kk}, {rows}] = await Promise.all([countOf(store, ref), claimsOf(store, ref)]);
  const next = RULE.per * (rows.length + 1);
  return {ref, friends, kk, per: RULE.per, claims: rows.map(c => ({id: c.id, at: c.at, state: c.state})), next, can: friends >= next};
}

/** 선물 신청 — 동의 · 영상 다 봄 · 휴대폰 번호 · 셋마다 한 번 */
async function claim(store, ref, body, now) {
  if (body?.agree !== true) return R(400, {error: 'agree'});
  if (body?.watched !== true) return R(400, {error: 'watched'});
  const phone = typeof body?.phone === 'string' ? body.phone.replace(/[\s-]/g, '') : '';
  if (!PHONE_RE.test(phone)) return R(400, {error: 'phone'});
  const [{friends, kk}, {ids, rows}] = await Promise.all([countOf(store, ref), claimsOf(store, ref)]);
  if (rows.length >= RULE.maxClaims) return R(429, {error: 'max'});
  const next = RULE.per * (rows.length + 1);
  if (friends < next) return R(409, {error: 'need', friends, next});
  const t = now.getTime(), last = Math.max(0, ...rows.map(c => Date.parse(c.at)).filter(Number.isFinite));
  if (t - last < GAP) return R(429, {error: 'slow'});
  const id = newId(t), at = now.toISOString();
  await store.setJSON('c/' + id, {schema: GIFT_SCHEMA, id, ref, at, phone, tail: phone.slice(-4), friends, kk, state: 'wait', sentAt: null});
  await store.setJSON('m/' + ref, {claims: [...ids, id]});
  return R(200, {ok: true, id, next: RULE.per * (rows.length + 2)});
}

/** 사장님 — 모든 신청(새것부터) · 60일 넘게 기다린 신청은 번호를 지움(끝 네 자리는 남김) */
async function list(store, now) {
  const keys = (await keysOf(store, 'c/')).sort().reverse(), t = now.getTime(), keep = RULE.keepWaitDays * 864e5, items = [];
  for (const c of await getMany(store, keys)) {
    if (!c?.id) continue;
    let it = c;
    if (it.state === 'wait' && it.phone && !(t - Date.parse(it.at) <= keep)) { it = {...it, phone: null}; await store.setJSON('c/' + it.id, it); }
    items.push({id: it.id, at: it.at, ref: it.ref, friends: it.friends, kk: it.kk, phone: it.state === 'wait' ? it.phone ?? null : null, tail: it.tail ?? null, state: it.state, sentAt: it.sentAt ?? null});
  }
  return {items};
}

/** 사장님 — 선물 보냄 표시 · 번호 지움(끝 네 자리는 남김) */
async function done(store, body, now) {
  const id = body?.id;
  if (typeof id !== 'string' || !ID_RE.test(id)) return R(400, {error: 'id'});
  const it = await getJ(store, 'c/' + id);
  if (!it?.id) return R(404, {error: 'not_found'});
  if (it.state !== 'sent' || it.phone) await store.setJSON('c/' + id, {...it, state: 'sent', sentAt: it.sentAt ?? now.toISOString(), phone: null, tail: it.tail ?? (typeof it.phone === 'string' ? it.phone.slice(-4) : null)});
  return R(200, {ok: true});
}

export async function handleGift(req, {store, now = () => new Date(), ownerHash = OWNER_KEY_SHA256} = {}) {
  try {
    const url = new URL(req.url), t = now(), owner = ownerKeyOk(req.headers.get('x-atlas-owner'), ownerHash);
    const key = req.headers.get('x-gift-key'), k = typeof key === 'string' && KEY_RE.test(key) ? key : null;
    const sub = url.pathname.replace(/^\/api\/gift\/?/, '');
    if (req.method === 'GET') {
      if (sub === 'me') return k ? json(200, await me(store, refOf(k))) : json(401, {error: 'key'});
      if (sub === 'list') return owner ? json(200, await list(store, t)) : json(403, {error: 'owner_only'});
      return json(404, {error: 'not_found'});
    }
    if (req.method === 'POST' && ['visit', 'claim', 'done'].includes(sub)) {
      const origin = req.headers.get('origin');
      if (origin && origin !== url.origin) return json(403, {error: 'origin'});
      if (!/^application\/json\b/i.test(req.headers.get('content-type') ?? '')) return json(415, {error: 'type'});
      if (Number(req.headers.get('content-length') ?? 0) > BODY) return json(413, {error: 'too_large'});
      const raw = await req.text();
      if (new TextEncoder().encode(raw).length > BODY) return json(413, {error: 'too_large'});
      let body = null; try { body = JSON.parse(raw); } catch { return json(400, {error: 'bad_json'}); }
      let r;
      if (sub === 'visit') r = k ? await visit(store, k, body, req.headers.get('user-agent'), t) : R(400, {error: 'key'});
      else if (sub === 'claim') r = k ? await claim(store, refOf(k), body, t) : R(401, {error: 'key'});
      else r = owner ? await done(store, body, t) : R(403, {error: 'owner_only'});
      return json(r.status, r.body);
    }
    return json(404, {error: 'not_found'});
  } catch {
    return json(500, {error: 'server'});
  }
}
