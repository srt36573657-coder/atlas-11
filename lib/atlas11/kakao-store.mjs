/**
 * 고도리 · 카톡 가입 — 서버 저장 · 셈 한 곳(카톡 서버 lib/atlas11/kakao.mjs · functions/atlas11/kakao.mjs 가 부른다 · 길 · 로그인 · 쿠키는 그쪽)
 *   사장님 2026-10-18(싱가포르) 00:15 명령문 docs/design/godori-2026-10-18/order-0015.txt [3] 6 · 7 · 8 · [4] 6 · 7 · [9] 4 · [11] 4 · [12] 3
 *   · 받는 것은 카카오 회원 번호 하나 — 저장소에는 서버 비밀값(넷리파이 환경 값 ATLAS_KAKAO_HASH_SECRET · 저장소 · 깃허브에 없음)으로 만든 HMAC 표(43자)만
 *   · 회원 기록 넷만(매매일지 atlas:godori-why · 관심 업종 atlas:new:sub · 관심 회사 atlas:new:later · 보유종목 atlas:godori-hold — site/next 열쇠 그대로)
 *     내 돈(atlas:godori-money)은 열쇠 · 값 · 속 어디에 있어도 받지 않음(400) · 가입 안 한 사람 · 탈퇴한 사람의 기록은 받지 않음(401)
 *   · 합치기 · 지우지 않음 — 항목은 줄지 않음 · 같은 항목은 올린 기기 판 + 그 기기가 안 보낸 칸은 남김 · kept · sold · wrong 은 null 로도 안 지워짐
 *     관심 두 목록은 그 기기에서 뺀 것(off)만 뺌 — off 가 없으면 모두 합침 · 크기를 넘으면 413(서버 사본 그대로 · 잘라 버리지 않음)
 *   · 탈퇴 = 그 회원 기록 · 회원 · 소개 표 · 소개 고리(양쪽)를 지움 · 카카오 연결 끊기에 넘길 값을 돌려줌 · 두 번 불러도 됨
 *   · 소개 수 = 소개 표로 가입을 마친 친구(지금도 회원인 친구)만 · 이름 · 친구 표를 돌려주지 않음 · 3명마다 확인 번호 하나
 *     번호 = 서버 비밀값 HMAC 으로 만든 12자(언제 보여도 같음) · 저장소에는 번호의 HMAC 만 · 같은 친구가 나갔다 다시 와도 새 번호 없음(가장 많이 찬 수 best)
 *     맞대 보기 = 사장님 열쇠 기기만(편지 여는 밤과 같은 ownerKeyOk · x-atlas-owner) · 처음 맞대면 「씀」 표시
 *   · 날마다 두 수(start = 카드 단추 누른 수 · done = 가입 마친 수 · 새 회원만)만 — 서울 날짜 열쇠에 숫자 둘 · 사람 표 · 시각 없음
 *   열쇠 자리(저장소 atlas11-kakao-v1): m/<표> 회원{ref, by?} · md/<표> 기록 넷 · rc/<소개 표> → {m} · f/<소개한 표>/<친구 표> 고리 · rf/<표> {best, k} · cv/<번호 HMAC> {k, at, used?} · d/<서울 날짜> {start, done}
 * 이 파일은 넷리파이에 묶이지 않는다: 저장소는 get · getWithMetadata · setJSON(onlyIfNew · onlyIfMatch) · delete · list 를 쓴다(시험은 memoryStore()).
 */
import {verifyCoupon} from './coupon.mjs';
import {createHmac, randomBytes} from 'node:crypto';
import {ownerKeyOk, OWNER_KEY_SHA256} from './invite.mjs';

export const KAKAO_STORE = 'atlas11-kakao-v1';
export const MEMBER_SCHEMA = 'atlas11-kakao-member-1', DATA_SCHEMA = 'atlas11-kakao-data-1';
export const SECRET_ENV = 'ATLAS_KAKAO_HASH_SECRET';
export const K_WHY = 'atlas:godori-why', K_SUB = 'atlas:new:sub', K_LATER = 'atlas:new:later', K_HOLD = 'atlas:godori-hold';
export const DATA_KEYS = Object.freeze([K_WHY, K_SUB, K_LATER, K_HOLD]);
export const MONEY_KEY = 'atlas:godori-money';
/** body = 올리는 글 · 저장 사본 바이트 · item = 매매일지 · 보유 한 줄 바이트 · items · list = 열쇠마다 항목 수 · text = 관심 업종 글자 · per = 확인 번호 하나에 친구 수 */
export const LIMITS = Object.freeze({body: 4 * 1024 * 1024, item: 16 * 1024, items: 1000, list: 1000, text: 80, depth: 8, secret: 32, per: 3});
export const MH_RE = /^[A-Za-z0-9_-]{43}$/, REF_RE = /^[A-Za-z0-9_-]{12}$/;
export const PREFIXES = Object.freeze(['m/', 'md/', 'rc/', 'f/', 'rf/', 'cv/', 'd/']);
const CODE_ABC = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789'; // 31자 — 헷갈리는 0 · O · 1 · I · L 없음
const CODE_RE = /^[ABCDEFGHJKMNPQRSTUVWXYZ2-9]{12}$/;
const STICKY = {[K_WHY]: ['kept'], [K_HOLD]: ['sold', 'wrong']}; // 한 번 남긴 답 · 판 것 · 잘못 적음 — 다른 기기의 옛 판이 null 로 와도 남김
const BAD_KEYS = new Set(['__proto__', 'constructor', 'prototype']);
const CTRL = /[\u0000-\u001F\u007F-\u009F]/;
const R = (status, body) => ({status, body});
const isObj = v => v != null && typeof v === 'object' && !Array.isArray(v);
const okMh = mh => typeof mh === 'string' && MH_RE.test(mh);
const bytes = v => Buffer.byteLength(JSON.stringify(v), 'utf8');
const num = v => (Number.isSafeInteger(v) && v >= 0 ? v : 0);
const metaKey = mh => 'm/' + mh, dataKey = mh => 'md/' + mh, progKey = mh => 'rf/' + mh, refKey = r => 'rc/' + r, linkPre = mh => 'f/' + mh + '/', dayKey = d => 'd/' + d;

/* 비밀값 · 표 */
/** 넷리파이 환경 값의 비밀값 — 없거나 32자 아래면 null(그러면 카톡 길은 모두 꺼 둠) */
export function secretOf(env = process.env, name = SECRET_ENV) { const v = env?.[name]; return typeof v === 'string' && v.length >= LIMITS.secret ? v : null; }
function needSecret(s) { if (typeof s !== 'string' || s.length < LIMITS.secret) throw new TypeError('kakao-store: secret missing'); return s; }
const hmac = (secret, msg) => createHmac('sha256', secret).update(msg, 'utf8').digest();
/** 카카오 회원 번호 → 10진 글(양의 정수 · 20자리까지) · 아니면 null */
export function kakaoIdOf(v) {
  if (typeof v === 'number') return Number.isSafeInteger(v) && v > 0 ? String(v) : null;
  if (typeof v === 'bigint') return v > 0n && v < 10n ** 20n ? v.toString() : null;
  return typeof v === 'string' && /^[1-9][0-9]{0,19}$/.test(v) ? v : null;
}
/** 회원 표 = HMAC-SHA256(서버 비밀값, 회원 번호) 43자 — 저장소에는 이것만(번호 글자 없음) */
export function memberHash(kakaoId, secret) {
  const id = kakaoIdOf(kakaoId);
  if (!id) throw new TypeError('kakao-store: kakao id');
  return hmac(needSecret(secret), 'kakao-member:' + id).toString('base64url');
}
export const seoulDate = (ms = Date.now()) => new Date(ms + 9 * 3600e3).toISOString().slice(0, 10);

export {update as storeUpdate};
/* 읽고 고쳐 쓰기 — 맞바꿈 쓰기(etag) · 넷리파이는 getWithMetadata 가 etag 를 줌 · 로컬 Blobs 서버(invite_dev · 시험)는 읽기에 etag 가 없어 list 의 etag 를 씀
   list 모드는 etag 를 먼저 · 값을 나중에 읽음 — 그 사이에 누가 고쳤으면 쓰기가 etag 에 걸려 다시 함(값이 etag 보다 새것일 수는 있어도 옛것일 수는 없음) */
const ETAG_MODE = new WeakMap();
async function readTagged(store, key) {
  if (typeof store.getWithMetadata !== 'function') return {cas: false, prev: await store.get(key, {type: 'json'}), etag: null}; // 맞바꿈 못 하는 저장소(옛 메모리 저장소) — 그냥 읽고 씀
  if (ETAG_MODE.get(store) !== 'list') {
    const g = await store.getWithMetadata(key, {type: 'json'});
    if (!g) return {cas: true, prev: null, etag: null};
    if (g.etag) { ETAG_MODE.set(store, 'meta'); return {cas: true, prev: g.data ?? null, etag: g.etag}; }
    ETAG_MODE.set(store, 'list');
  }
  const etag = ((await store.list({prefix: key}))?.blobs ?? []).find(b => b.key === key)?.etag ?? null;
  return etag ? {cas: true, prev: await store.get(key, {type: 'json'}), etag} : {cas: true, prev: null, etag: null};
}
/** fn(앞 값 | null) → 새 값 · undefined 면 안 씀 · 남이 먼저 고쳤으면 조금 쉬었다 다시(40번) */
async function update(store, key, fn, tries = 40) {
  for (let i = 0; i < tries; i++) {
    const {cas, prev, etag} = await readTagged(store, key);
    const next = fn(prev);
    if (next === undefined) return {value: prev, wrote: false};
    const r = await store.setJSON(key, next, !cas ? undefined : prev == null ? {onlyIfNew: true} : {onlyIfMatch: etag});
    if (r?.modified !== false) return {value: next, wrote: true};
    await new Promise(res => setTimeout(res, Math.random() * 6 * Math.min(i + 1, 8)));
  }
  throw new Error('kakao-store: busy');
}
const keysOf = async (store, prefix) => ((await store.list({prefix}))?.blobs ?? []).map(b => b.key);
async function metaOf(store, mh) { const m = await store.get(metaKey(mh), {type: 'json'}); return m?.schema === MEMBER_SCHEMA ? m : null; }
/** 지금 회원인가(탈퇴하면 false — 다른 기기에 남은 로그인 쿠키를 거를 때) */
export async function isMember(store, mh) { return okMh(mh) && !!(await metaOf(store, mh)); }

/* 날마다 두 수 — 사람 표 · 시각 없이 숫자 둘 */
/** kind = 'start'(카드 단추 누른 수 · /start) | 'done'(가입 마친 수 · finishSignup 이 새 회원일 때만) · 던지지 않음 */
export async function bumpDaily(store, kind, {now = new Date()} = {}) {
  if (kind !== 'start' && kind !== 'done') return {ok: false};
  const date = seoulDate(now.getTime());
  try {
    let n = 0;
    await update(store, dayKey(date), prev => { const o = {start: num(prev?.start), done: num(prev?.done)}; o[kind] += 1; n = o[kind]; return o; });
    return {ok: true, date, n};
  } catch { return {ok: false, date}; }
}
/** 지난 days 날(서울 날짜 · 새 날 먼저) [{date, start, done}] */
export async function dailyCounts(store, {days = 30, now = new Date()} = {}) {
  const out = [];
  for (let i = 0; i < Math.min(Math.max(1, Math.floor(days) || 1), 400); i++) {
    const date = seoulDate(now.getTime() - i * 864e5), v = await store.get(dayKey(date), {type: 'json'});
    out.push({date, start: num(v?.start), done: num(v?.done)});
  }
  return out;
}

/* 소개 · 확인 번호 */
/** 확인 번호(12자 · 헷갈리는 글자 없음) — 회원 표 · 차례 k 와 서버 비밀값으로 만듦(저장하지 않아도 언제나 같은 번호) */
export function codeOf(mh, k, secret) {
  let x = BigInt('0x' + hmac(needSecret(secret), 'kakao-code:' + mh + ':' + k).toString('hex')), s = '';
  for (let i = 0; i < 12; i++) { s += CODE_ABC[Number(x % 31n)]; x /= 31n; }
  return s;
}
export const showCode = c => c.slice(0, 4) + '-' + c.slice(4, 8) + '-' + c.slice(8, 12);
/** 손으로 친 번호 → 12자(작은 글자 · 빈칸 · 줄표 허용) · 아니면 null */
export function normCode(v) { if (typeof v !== 'string' || v.length > 40) return null; const c = v.toUpperCase().replace(/[\s._·-]/g, ''); return CODE_RE.test(c) ? c : null; }
const cvKey = (secret, c) => 'cv/' + hmac(secret, 'kakao-cv:' + c).toString('base64url');

/** 지금도 회원인 친구 수 — 고리 + 친구 쪽 by 가 맞을 때만 · 나간 친구의 늦게 남은 고리는 치움 */
async function liveFriends(store, boss) {
  let n = 0;
  for (const k of await keysOf(store, linkPre(boss))) {
    const f = k.slice(linkPre(boss).length), m = okMh(f) ? await metaOf(store, f) : null;
    if (m?.by === boss) n++;
    else if (!m) await store.delete(k);
  }
  return n;
}
/** 친구 수 → 가장 많이 찬 수(best) → 번호 차례 k = floor(best / 3) · 새 차례의 번호 장부(cv/)를 먼저 쓰고 rf/ 를 올림(번호가 보이면 장부도 있음) */
async function progress(store, boss, secret, now) {
  const n = await liveFriends(store, boss), p0 = await store.get(progKey(boss), {type: 'json'});
  const best = Math.max(num(p0?.best), n), k = Math.max(num(p0?.k), Math.floor(best / LIMITS.per)), at = now.toISOString();
  for (let i = num(p0?.k) + 1; i <= k; i++) await store.setJSON(cvKey(secret, codeOf(boss, i, secret)), {k: i, at}, {onlyIfNew: true});
  const r = await update(store, progKey(boss), p => {
    const b = Math.max(num(p?.best), best), kk = Math.max(num(p?.k), Math.min(k, Math.floor(b / LIMITS.per)));
    return p && p.best === b && p.k === kk ? undefined : {best: b, k: kk};
  });
  return {n, p: r.value};
}
async function countFriend(store, {ref, friend, secret, now}) {
  const boss = (await store.get(refKey(ref), {type: 'json'}))?.m;
  if (!okMh(boss) || boss === friend) return false;
  const bm = await metaOf(store, boss);
  if (!bm || bm.ref !== ref) return false;
  let mark = false; // 한 회원은 한 번만 셈(by 가 이미 있으면 0)
  await update(store, metaKey(friend), p => { mark = false; if (p?.schema !== MEMBER_SCHEMA || p.by) return undefined; mark = true; return {...p, by: boss}; });
  if (!mark) return false;
  await store.setJSON(linkPre(boss) + friend, {}, {onlyIfNew: true});
  await progress(store, boss, secret, now);
  return true;
}

/** 카카오에서 돌아옴(callback) — 처음이면 회원 + 제 소개 표를 만들고 「가입 마친 수」 +1 · ref 가 맞고 자기가 아니면 그 사람 소개 수 +1
 *  다시 온 회원 = 셈 0(가입이 아님) · → {isNew, ref: 이 회원의 소개 표, counted} */
export async function finishSignup(store, {mh, ref = null, secret, now = new Date()} = {}) {
  if (!okMh(mh)) throw new TypeError('kakao-store: member');
  needSecret(secret);
  const old = await metaOf(store, mh);
  if (old) return {isNew: false, ref: old.ref ?? null, counted: false};
  let mine = null;
  for (let i = 0; i < 3 && !mine; i++) { const c = randomBytes(9).toString('base64url'), w = await store.setJSON(refKey(c), {m: mh}, {onlyIfNew: true}); if (w?.modified !== false) mine = c; }
  if (!mine) throw new Error('kakao-store: busy');
  const w = await store.setJSON(metaKey(mh), {schema: MEMBER_SCHEMA, ref: mine}, {onlyIfNew: true});
  if (w?.modified === false) { await store.delete(refKey(mine)); const m = await metaOf(store, mh); return {isNew: false, ref: m?.ref ?? null, counted: false}; }
  await bumpDaily(store, 'done', {now});
  const counted = typeof ref === 'string' && REF_RE.test(ref) ? await countFriend(store, {ref, friend: mh, secret, now}) : false;
  return {isNew: true, ref: mine, counted};
}

/** /me 에 넣을 것 — 회원 아니면 null · {ref, friends(지금도 회원인 친구 수), next(다음 번호까지 친구 수), code(가장 새 번호 | null), codes} · 이름 · 친구 표 없음 */
export async function memberState(store, mh, {secret, now = new Date()} = {}) {
  needSecret(secret);
  if (!okMh(mh)) return null;
  const m = await metaOf(store, mh);
  if (!m) return null;
  const friends = await liveFriends(store, mh);
  let p = await store.get(progKey(mh), {type: 'json'});
  if (num(p?.best) < friends || num(p?.k) < Math.floor(friends / LIMITS.per)) p = (await progress(store, mh, secret, now)).p; // 중간에 끊긴 셈 고침(드묾)
  const k = num(p?.k), codes = [];
  for (let i = 1; i <= k; i++) codes.push(showCode(codeOf(mh, i, secret)));
  return {ref: m.ref ?? null, friends, next: LIMITS.per * (k + 1), code: codes.at(-1) ?? null, codes};
}

/** 확인 번호 맞대기 — 사장님 열쇠 기기만(편지 여는 밤 · 초대장과 같은 ownerKeyOk) · {ok, used} · mark(기본) = 처음 맞댈 때 「씀」 표시
 *  처음: {ok: true, used: false, at, usedAt} · 다음: {ok: true, used: true, at, usedAt} · 없는 번호: {ok: false, used: false} */
export async function verifyCode(store, code, {ownerKey, ownerHash = OWNER_KEY_SHA256, secret, now = new Date(), mark = true} = {}) {
  if (!ownerKeyOk(ownerKey, ownerHash)) return R(403, {error: 'owner_only'});
  needSecret(secret);
  const c = normCode(code);
  if (!c) return R(200, {ok: false, used: false});
  if (!(await store.get(cvKey(secret, c), {type: 'json'}))) { // 친구 소개 번호가 아니면 커피 쿠폰 번호(lib/atlas11/coupon.mjs · 2026-10-19 13:54)
    const cf = await verifyCoupon(store, c, {secret, now, mark, update});
    if (cf.ok) return R(200, cf);
  }
  let out = null;
  await update(store, cvKey(secret, c), p => {
    if (!isObj(p) || !Number.isSafeInteger(p.k)) { out = {ok: false, used: false}; return undefined; }
    if (p.used) { out = {ok: true, used: true, at: p.at ?? null, usedAt: p.used}; return undefined; }
    out = {ok: true, used: false, at: p.at ?? null, ...(mark ? {usedAt: now.toISOString()} : {})};
    return mark ? {...p, used: now.toISOString()} : undefined;
  });
  return R(200, out);
}

/* 회원 기록 넷 */
/** 받은 값 다시 짓기 — 평범한 객체 · 배열 · 글 · 수 · 참거짓 · null 만 · __proto__ · constructor · prototype 열쇠 버림 · 깊이 8 */
function sane(v, d = 0) {
  if (v === null || typeof v === 'string' || typeof v === 'boolean') return v;
  if (typeof v === 'number') return Number.isFinite(v) ? v : null;
  if (d >= LIMITS.depth || typeof v !== 'object') return undefined;
  if (Array.isArray(v)) return v.map(x => sane(x, d + 1)).filter(x => x !== undefined);
  const o = {};
  for (const [k, x] of Object.entries(v)) { if (BAD_KEYS.has(k)) continue; const y = sane(x, d + 1); if (y !== undefined) o[k] = y; }
  return o;
}
function hasMoney(v, d = 0) {
  if (typeof v === 'string') return v.includes('godori-money');
  if (v == null || typeof v !== 'object' || d > LIMITS.depth + 4) return false;
  for (const [k, x] of Object.entries(v)) if (k.includes('godori-money') || hasMoney(x, d + 1)) return true;
  return false;
}
/** 올린 몸 — 두 꼴 다 받음: {data: {열쇠 넷}, off?}(GET 과 같은 꼴 · K1c · K2c) 또는 {열쇠 넷 …, off?} · 그 밖 열쇠 400 → {ok, data, off} */
function checkBody(body) {
  if (!isObj(body)) return {ok: false, status: 400, error: 'bad_body'};
  if (hasMoney(body)) return {ok: false, status: 400, error: 'money'};
  const wrapped = Object.hasOwn(body, 'data'), bad = k => ({ok: false, status: 400, error: 'bad_key', key: String(k).slice(0, 40)});
  for (const k of Object.keys(body)) if (wrapped ? k !== 'data' && k !== 'off' : !DATA_KEYS.includes(k) && k !== 'off') return bad(k);
  const d = wrapped ? body.data : body;
  if (!isObj(d)) return {ok: false, status: 400, error: 'bad_body'};
  if (wrapped) for (const k of Object.keys(d)) if (!DATA_KEYS.includes(k)) return bad(k);
  for (const k of DATA_KEYS) if (d[k] !== undefined && !Array.isArray(d[k])) return {ok: false, status: 400, error: 'bad_value', key: k};
  if (body.off !== undefined) {
    if (!isObj(body.off)) return {ok: false, status: 400, error: 'bad_off'};
    for (const k of Object.keys(body.off)) if ((k !== K_SUB && k !== K_LATER) || !Array.isArray(body.off[k])) return {ok: false, status: 400, error: 'bad_off', key: k.slice(0, 40)};
  }
  return {ok: true, data: d, off: isObj(body.off) ? body.off : {}};
}
/** PUT 글 → {ok: true, body} | {ok: false, status, error[, key]} — 4MB(413) · 내 돈 글자(400 money) · JSON · 열쇠 넷(그대로 또는 data 안)과 off 만 */
export function parseDataBody(text) {
  if (typeof text !== 'string') return {ok: false, status: 400, error: 'bad_json'};
  if (Buffer.byteLength(text, 'utf8') > LIMITS.body) return {ok: false, status: 413, error: 'too_large'};
  if (text.includes('godori-money')) return {ok: false, status: 400, error: 'money'};
  let body;
  try { body = JSON.parse(text); } catch { return {ok: false, status: 400, error: 'bad_json'}; }
  const c = checkBody(body);
  return c.ok ? {ok: true, body} : c;
}

const LIST_OK = {[K_SUB]: s => typeof s === 'string' && s.length >= 1 && s.length <= LIMITS.text && !CTRL.test(s), [K_LATER]: s => typeof s === 'string' && /^[0-9A-Z]{6}$/.test(s)};
/** 항목 표 — 매매일지 = 적은 때(at) + 회사 번호(p-why.js keep() 과 같음) · 보유 = id */
const ID_OF = {
  [K_WHY]: r => (typeof r.at === 'string' && r.at.length <= 40 && Number.isFinite(Date.parse(r.at)) && (r.code == null || (typeof r.code === 'string' && r.code.length <= 16)) ? r.at + '|' + (r.code ?? '') : null),
  [K_HOLD]: r => (typeof r.id === 'string' && /^[A-Za-z0-9_-]{1,40}$/.test(r.id) ? r.id : null),
};
export class LimitError extends Error { constructor(key) { super('kakao-store: limit ' + key); this.key = key; } }
const blank = d => Object.fromEntries(DATA_KEYS.map(k => [k, Array.isArray(d?.[k]) ? d[k] : []]));
/** 같은 항목 — 올린 판이 이김(null 포함) · 올린 판에 없는 칸은 남김 · STICKY 칸은 null 로 안 지워짐 */
function mergeItem(old, inc, sticky = []) {
  const out = {...old, ...inc};
  for (const f of sticky) if (old[f] != null && inc[f] == null) out[f] = old[f];
  return out;
}
/** 서버 사본 + 올린 것 → {data, added, skipped, off, changed} — 항목은 줄지 않음(관심은 off 로 보낸 것만 빠짐) · 크기를 넘으면 LimitError(던짐) · 저장소를 안 만짐 */
export function mergeData(server, incoming = {}, off = {}) {
  const s = blank(server), data = {}, added = {}, skipped = {}, offN = {};
  for (const key of DATA_KEYS) {
    const inc = Array.isArray(incoming?.[key]) ? incoming[key] : [];
    if (LIST_OK[key]) {
      const ok = LIST_OK[key], incV = inc.filter(ok), incSet = new Set(incV);
      const offSet = new Set((Array.isArray(off?.[key]) ? off[key] : []).filter(x => ok(x) && !incSet.has(x)));
      const seen = new Set(), list = [];
      for (const x of [...incV, ...s[key]]) { if (seen.has(x) || offSet.has(x) || !ok(x)) continue; seen.add(x); list.push(x); }
      if (list.length > LIMITS.list) throw new LimitError(key);
      const had = new Set(s[key]);
      data[key] = list; added[key] = list.filter(x => !had.has(x)).length; skipped[key] = inc.length - incV.length; offN[key] = [...had].filter(x => offSet.has(x)).length;
      continue;
    }
    const idOf = ID_OF[key], sticky = STICKY[key] ?? [], old = new Map(), got = new Map();
    for (const r of s[key]) { const id = isObj(r) ? idOf(r) : null; if (id != null && !old.has(id)) old.set(id, r); }
    let bad = 0;
    for (const r0 of inc) {
      const r = isObj(r0) ? sane(r0) : null, id = r ? idOf(r) : null;
      if (id == null || bytes(r) > LIMITS.item) { bad++; continue; }
      got.set(id, got.has(id) ? mergeItem(got.get(id), r, sticky) : r);
    }
    const list = [];
    for (const [id, r] of got) list.push(old.has(id) ? mergeItem(old.get(id), r, sticky) : r);
    for (const [id, r] of old) if (!got.has(id)) list.push(r);
    if (key === K_WHY) list.sort((a, b) => Date.parse(b.at) - Date.parse(a.at)); // 새 기록 먼저(이 기기 차례와 같음 · 같은 때는 그대로)
    if (list.length > LIMITS.items) throw new LimitError(key);
    data[key] = list; added[key] = [...got.keys()].filter(id => !old.has(id)).length; skipped[key] = bad;
  }
  if (bytes(data) > LIMITS.body) throw new LimitError('total');
  return {data, added, skipped, off: offN, changed: JSON.stringify(data) !== JSON.stringify(s)};
}

/** GET — 회원만(401) · {data: 열쇠 넷(늘 배열), at} */
export async function getData(store, mh) {
  if (!okMh(mh)) return R(400, {error: 'bad_member'});
  if (!(await metaOf(store, mh))) return R(401, {error: 'not_member'});
  const rec = await store.get(dataKey(mh), {type: 'json'}), ok = rec?.schema === DATA_SCHEMA;
  return R(200, {data: blank(ok ? rec.data : null), at: ok ? rec.at ?? null : null});
}
/** PUT — 회원만 · 열쇠 넷 + off 만 · 내 돈 400 · 합침(맞바꿈 쓰기 — 두 기기가 같이 올려도 둘 다 남음) · 크기 413 · 쓰고 나서 다시 회원인지 봄(탈퇴와 겹치면 지우고 401) */
export async function putData(store, mh, body, {now = new Date()} = {}) {
  if (!okMh(mh)) return R(400, {error: 'bad_member'});
  const c = checkBody(body);
  if (!c.ok) return R(c.status, {error: c.error, ...(c.key ? {key: c.key} : {})});
  if (!(await metaOf(store, mh))) return R(401, {error: 'not_member'});
  const incoming = Object.fromEntries(DATA_KEYS.filter(k => Array.isArray(c.data[k])).map(k => [k, c.data[k]]));
  const at = now.toISOString();
  let res = null, last = null;
  try {
    await update(store, dataKey(mh), p => {
      const ok = p?.schema === DATA_SCHEMA;
      res = mergeData(ok ? p.data : null, incoming, c.off); last = ok ? p.at ?? null : null;
      if (!res.changed && (ok || p == null)) return undefined; // 바뀐 것 없음 — 안 씀(꼴이 깨진 사본만 새로 씀)
      res.changed = true;
      return {schema: DATA_SCHEMA, at, data: res.data};
    });
  } catch (e) {
    if (e instanceof LimitError) return R(413, {error: 'limit', key: e.key});
    throw e;
  }
  if (!(await metaOf(store, mh))) { await store.delete(dataKey(mh)); return R(401, {error: 'not_member'}); }
  return R(200, {ok: true, at: res.changed ? at : last ?? at, data: res.data, added: res.added, skipped: res.skipped, off: res.off});
}

/** 탈퇴 — 그 회원 기록 · 회원 · 소개 표 · 소개 고리(내가 소개한 친구 쪽 by 까지 · 나를 소개한 사람 고리)를 지움 · 두 번 불러도 됨
 *  확인 번호 장부(cv/)와 날마다 두 수는 사람과 이어지지 않아 남김(이미 받은 번호는 사장님이 계속 맞대 봄)
 *  → {status: 200, body: {ok: true, removed: 있던 회원을 지웠나}, unlink: {target_id_type: 'user_id', target_id} | null}(카카오 연결 끊기에 넘길 값 · 번호는 해시에서 못 되살려 부른 쪽이 줌) */
export async function withdrawMember(store, mh, {kakaoId} = {}) {
  const id = kakaoIdOf(kakaoId), unlink = id ? {target_id_type: 'user_id', target_id: id} : null;
  if (!okMh(mh)) return {...R(400, {error: 'bad_member'}), unlink};
  const meta = await metaOf(store, mh);
  await store.delete(dataKey(mh));
  for (const k of await keysOf(store, linkPre(mh))) {
    const f = k.slice(linkPre(mh).length);
    if (okMh(f)) await update(store, metaKey(f), p => { if (p?.schema !== MEMBER_SCHEMA || p.by !== mh) return undefined; const {by, ...rest} = p; return rest; });
    await store.delete(k);
  }
  await store.delete(progKey(mh));
  await store.delete('cp/' + mh); // 커피 쿠폰 점수 칸(lib/atlas11/coupon.mjs cpKey · 2026-10-19) — 받은 쿠폰 장부(cf/)는 사람 표 없이 남음
  if (okMh(meta?.by)) await store.delete(linkPre(meta.by) + mh);
  if (typeof meta?.ref === 'string' && REF_RE.test(meta.ref) && (await store.get(refKey(meta.ref), {type: 'json'}))?.m === mh) await store.delete(refKey(meta.ref));
  await store.delete(metaKey(mh)); // 마지막에(중간에 끊기면 다시 불러 마저 지움)
  return {...R(200, {ok: true, removed: !!meta}), unlink};
}

/** 시험 · 로컬용 메모리 저장소 — 넷리파이 Blobs 와 같은 꼴(getWithMetadata · onlyIfNew · onlyIfMatch · list) */
export function memoryStore() {
  const m = new Map();
  let seq = 0;
  const put = (key, v, o) => {
    const e = m.get(key);
    if (o?.onlyIfNew && e) return {modified: false};
    if (o?.onlyIfMatch != null && (!e || e.etag !== o.onlyIfMatch)) return {modified: false};
    const etag = `"m${++seq}"`;
    m.set(key, {v, etag});
    return {modified: true, etag};
  };
  const read = (e, o) => (o?.type === 'json' ? JSON.parse(e.v) : e.v);
  return {
    async get(key, o) { const e = m.get(key); return e ? read(e, o) : null; },
    async getWithMetadata(key, o) { const e = m.get(key); return e ? {data: read(e, o), etag: e.etag, metadata: {}} : null; },
    async set(key, value, o) { return put(key, typeof value === 'string' ? value : String(value), o); },
    async setJSON(key, value, o) { return put(key, JSON.stringify(value), o); },
    async delete(key) { m.delete(key); },
    async list(o) { const p = o?.prefix ?? ''; return {blobs: [...m.keys()].filter(k => k.startsWith(p)).sort().map(key => ({key, etag: m.get(key).etag})), directories: []}; },
    _dump: () => [...m.entries()].map(([k, e]) => [k, e.v]),
    _map: m,
  };
}
