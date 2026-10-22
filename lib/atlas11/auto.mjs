/**
 * 돌이 · 자동으로 산 기록(가짜 돈) — 서버 셈 한 곳(넷리파이 함수 functions/atlas11/auto.mjs 가 부름 · 경로 /api/auto · /api/auto/*)
 *   사장님 2026-10-22(서울) 08:35 「자동 매수 프로그램을 만들어라 그래서 공개하라 어떻게 총 10억이잖아 싹에 올라오는 1등부터 3등까지를 가각 3천만원 매수하라
 *   업종이 바뀌면 무조건 매수 하라 매더ㅗ는 내가 하겠다」(매더ㅗ는 = 매도는) · 08:46 물음(진짜 돈 · 공개는 법에 걸릴 수 있고 본질 3 「사고팔기를 권하지 않는다」와 부딪힘
 *   → 「먼저 가짜 돈 10억으로 같은 규칙을 돌려 볼까요? 진짜 돈과 공개는 변호사 확인 뒤에 해요.」) · 08:50 「가짜돈으로 해」 — 기록 docs/design/autobuy-2026-10-22/order-0835.txt
 *   규칙(바꾸지 않음):
 *     · 계좌 하나 · 처음 현금 10억 원 · 수수료 · 세금 없음 · 셈은 화면 가짜 돈 연습과 같은 site/next/game-rule.js(ruleFor('dori-auto-1') — 공개 연습 계좌와 이름이 달라 섞이지 않음)
 *     · 날 = 테마 시계 자료(/next/data/theme-home.json · 올릴 때마다 새로 만듦)의 asOf · 싹 1 ~ 3번 = order.S 앞 셋(업종 이름)
 *     · 한 번 셈(tick · 같은 asOf 는 한 번만): 지난번 셋에 없던 업종(처음에는 셋 모두)마다 그 업종 대장주(/atlas/data/cond.json — 업종 안 크기 차례 rk 1)를
 *       그 회사 마지막 종가(/atlas/data/co/<번호>.json c.price · c.priceDate)로 3천만 원어치 삼(주 수 = 내림(3천만 ÷ 값))
 *       값을 모름 · 1주도 못 삼 · 현금이 모자람 · 대장주를 못 찾음 = 사지 않고 까닭을 기록에 적음 · 저절로 팔지 않음 · 오늘 셋과 asOf 를 기억
 *     · 장 중 값(provisional — 「장 중 값이에요. 저녁 8시까지 바뀌어요.」)이면 셈하지 않고 기다림 — 장 마감 값이 나온 뒤 그날 한 번(장 중 셋 · 장 중 값으로 굳히지 않게)
 *     · 자료를 못 받거나 꼴이 깨졌으면 아무것도 바꾸지 않고 닫음(다음 셈이 다시 함)
 *     · 팔기는 사장님만(매도는 사장님이 — 사장님 열쇠 x-atlas-owner): 한 종목의 전부 · 반을 그 회사 마지막 종가로
 *   보기(GET /api/auto)도 사장님 열쇠만 — 다른 기기에는 보이는 것 없음 · 셈(POST {op:'tick'})은 열쇠 없이 누구나(같은 asOf 면 아무 일 없음 · 공개 규칙을 한 번만 씀)
 *     부르는 곳: 올린 뒤 깃허브 작업(.github/workflows/atlas11-site.yml 「자동으로 산 기록 셈」) · 사장님 화면(#/game)이 열 때(못 부른 날을 따라잡음)
 * 이 파일은 넷리파이에 묶이지 않는다: 저장소는 get · setJSON(onlyIfNew · onlyIfMatch) · list(+ 있으면 getWithMetadata)만 씀(시험은 메모리 저장소 — letter.mjs memoryStore)
 * 저장소 열쇠: acct = 계좌 하나({schema, start, cash, pos, log, asOf, top, meta, ticks, at}) · 비밀 값은 어디에도 적지 않음(열쇠 해시는 invite.mjs · 넷리파이 환경 값)
 */
import {ownerKeyOk, OWNER_KEY_SHA256} from './invite.mjs';
import {ruleFor, valueOf, CODE_RE, GAME} from '../../site/next/game-rule.js';

export const AUTO_SCHEMA = 'dori-auto-1';
export const AUTO_STORE = 'atlas11-auto-v1';
export const AUTO_KEY = 'acct';
export const AUTO = Object.freeze({start: GAME.start, buy: 30_000_000, top: 3, log: 500, ticks: 400, body: 1024, show: {log: 120, ticks: 60}, waitMs: 8000});
export const RULE = ruleFor(AUTO_SCHEMA, {log: AUTO.log});
const DAY_RE = /^\d{4}-\d{2}-\d{2}$/;
const okDay = s => typeof s === 'string' && DAY_RE.test(s);
const okName = s => typeof s === 'string' && s.trim() === s && s.length >= 1 && s.length <= 60;
/** 처음 계좌 — 현금 10억 원 · 아직 셈한 날 없음 */
export const newAuto = () => ({...RULE.newAccount(), asOf: null, top: [], meta: {}, ticks: [], at: null});
/** 자동 계좌가 망가지지 않았나 */
export function okAuto(a) {
  return RULE.okAccount(a) && (a.asOf === null || okDay(a.asOf)) && Array.isArray(a.top) && a.top.length <= AUTO.top && a.top.every(okName)
    && !!a.meta && typeof a.meta === 'object' && !Array.isArray(a.meta) && Array.isArray(a.ticks);
}

/* ── 사이트 자료 읽기(이 사이트 자기 파일 · 함수가 같은 주소로 받음) ── */
/** 받기 — 값 | null(없음 · 404 · 꼴이 JSON 아님) | undefined(잠깐 끊김 · 5xx · 시간 넘음 → 다음 셈이 다시) */
async function getJ(ctx, path) {
  let r;
  try { r = await ctx.fetchImpl(new URL(path, ctx.base), {cache: 'no-store', redirect: 'error', signal: AbortSignal.timeout(ctx.waitMs ?? AUTO.waitMs)}); } catch { return undefined; }
  if (r.status >= 500 || r.status === 429) return undefined;
  if (!r.ok) return null;
  try { return await r.json(); } catch { return null; }
}
/** 테마 시계 자료 → {asOf, top(싹 앞 셋), provisional} | null(꼴이 깨짐) */
export function themeOf(j) {
  if (!j || typeof j !== 'object' || typeof j.schema !== 'string' || !/^dori-theme-\d+-home$/.test(j.schema) || !okDay(j.asOf) || !Array.isArray(j.order?.S)) return null;
  const top = j.order.S.slice(0, AUTO.top);
  if (!top.length || !top.every(okName) || new Set(top).size !== top.length) return null;
  return {asOf: j.asOf, top, provisional: j.provisional === true};
}
/** 업종 이름 → 대장주 번호(업종 안 크기 차례 1 · 꼭 한 곳) | null — cond.json {ind: [{n}], co: {c: [번호], i: [업종 칸], rk: [차례]}} */
export function leaderOf(cond, name) {
  const I = cond?.ind, C = cond?.co;
  if (!Array.isArray(I) || !C || !Array.isArray(C.c) || !Array.isArray(C.i) || !Array.isArray(C.rk)) return null;
  const k = I.findIndex(x => x?.n === name); if (k < 0) return null;
  const hits = [];
  for (let j = 0; j < C.c.length; j++) if (C.i[j] === k && C.rk[j] === 1 && CODE_RE.test(String(C.c[j] ?? ''))) hits.push(C.c[j]);
  return hits.length === 1 ? hits[0] : null; // 차례 1 이 없거나 둘이면 자료가 깨진 것 — 사지 않음
}
const okCond = c => !!c && typeof c === 'object' && Array.isArray(c.ind) && Array.isArray(c.co?.c) && Array.isArray(c.co?.i) && Array.isArray(c.co?.rk);
const coName = j => (typeof j?.c?.name === 'string' && j.c.name.trim() ? j.c.name.trim().slice(0, 60) : null);
/** 회사 파일 → {px 마지막 종가, d 그 날, n 이름} | null */
export function closeOf(j) {
  const p = j?.c?.price;
  if (!(Number.isFinite(p) && p > 0 && p < 1e9)) return null;
  return {px: p, d: okDay(j.c.priceDate) ? j.c.priceDate : null, n: coName(j)};
}

/* ── 한 번 셈(순수) ── */
/** acc(지금 계좌 | null) · th(themeOf) · leads {업종: {c, px, d, n} | {c?, why}} · t(ms) → {acc 새 계좌, tick 기록 한 줄} | {skip: 'same' | 'need'}
 *  same = 이미 셈한 날(또는 더 옛 자료) · need = 새로 든 업종의 대장주 자료가 leads 에 없음(그 사이 누가 먼저 셈 — 다시 받아 셈) */
export function applyTick(acc, th, leads, t) {
  const A0 = acc ?? newAuto();
  if (A0.asOf && A0.asOf >= th.asOf) return {skip: 'same'};
  const prev = A0.asOf ? A0.top : [];
  const fresh = th.top.filter(n => !prev.includes(n)); // 처음(asOf 없음)이면 셋 모두
  if (fresh.some(n => !leads?.[n])) return {skip: 'need'};
  let A = A0; const meta = {...A0.meta}, buys = [], skips = [];
  for (const i of fresh) {
    const L = leads[i];
    if (L.why) { skips.push({i, ...(L.c ? {c: L.c} : {}), ...(L.n ? {n: L.n} : {}), why: L.why}); continue; }
    const q = Math.floor(AUTO.buy / L.px);
    if (q < 1) { skips.push({i, c: L.c, n: L.n, why: 'qty'}); continue; }
    const r = RULE.trade(A, {code: L.c, side: 'b', q, px: L.px, t});
    if (!r.ok) { skips.push({i, c: L.c, n: L.n, why: r.why}); continue; } // cash = 현금이 모자람
    A = r.acc; meta[L.c] = {n: L.n ?? L.c, i};
    buys.push({i, c: L.c, n: L.n ?? L.c, q, px: L.px, d: L.d});
  }
  const tick = {t, asOf: th.asOf, top: [...th.top], fresh, buys, skips};
  return {acc: {...A, asOf: th.asOf, top: [...th.top], meta, ticks: [...A0.ticks, tick].slice(-AUTO.ticks), at: new Date(t).toISOString()}, tick};
}

/* ── 저장(맞바꿈 쓰기 — kakao-store.mjs update 와 같은 길 · 카톡 스위치에 매이지 않게 따로 둠) ── */
const ETAG_MODE = new WeakMap();
async function readTagged(store, key) {
  if (typeof store.getWithMetadata !== 'function') return {cas: false, prev: await store.get(key, {type: 'json'}), etag: null}; // 맞바꿈 못 하는 저장소(메모리 저장소) — 그냥 읽고 씀
  if (ETAG_MODE.get(store) !== 'list') {
    const g = await store.getWithMetadata(key, {type: 'json'});
    if (!g) return {cas: true, prev: null, etag: null};
    if (g.etag) { ETAG_MODE.set(store, 'meta'); return {cas: true, prev: g.data ?? null, etag: g.etag}; }
    ETAG_MODE.set(store, 'list'); // 로컬 Blobs 서버(invite_dev)는 읽기에 etag 가 없음 — list 의 etag 를 먼저 · 값을 나중에
  }
  const etag = ((await store.list({prefix: key}))?.blobs ?? []).find(b => b.key === key)?.etag ?? null;
  return etag ? {cas: true, prev: await store.get(key, {type: 'json'}), etag} : {cas: true, prev: null, etag: null};
}
/** fn(앞 값 | null) → 새 값 · undefined 면 안 씀 · 남이 먼저 고쳤으면 조금 쉬었다 다시 */
async function update(store, key, fn, tries = 20) {
  for (let i = 0; i < tries; i++) {
    const {cas, prev, etag} = await readTagged(store, key);
    const next = fn(prev);
    if (next === undefined) return {value: prev, wrote: false};
    const r = await store.setJSON(key, next, !cas ? undefined : prev == null ? {onlyIfNew: true} : {onlyIfMatch: etag});
    if (r?.modified !== false) return {value: next, wrote: true};
    await new Promise(res => setTimeout(res, Math.random() * 8 * Math.min(i + 1, 8)));
  }
  throw new Error('auto: busy');
}
const readAcct = store => store.get(AUTO_KEY, {type: 'json'}).catch(() => undefined);
const R = (status, body) => ({status, body});

/** 셈 — 누구나 · 같은 asOf 면 아무 일 없음 → {status, body: {ok, did, asOf, n?} | {error}} */
export async function tick(store, ctx, t = Date.now()) {
  const raw = await getJ(ctx, '/next/data/theme-home.json'), th = raw ? themeOf(raw) : null;
  if (!th) return R(503, {error: 'no_data'});
  if (th.provisional) return R(200, {ok: true, did: 'wait', asOf: th.asOf});
  let leads = {};
  for (let round = 0; round < 3; round++) {
    const cur = await readAcct(store);
    if (cur === undefined) return R(503, {error: 'store'});
    if (cur !== null && !okAuto(cur)) return R(409, {error: 'account'}); // 깨진 계좌는 덮어쓰지 않음(기록을 잃지 않게)
    if (cur?.asOf && cur.asOf >= th.asOf) return R(200, {ok: true, did: 'same', asOf: cur.asOf});
    const prev = cur?.asOf ? cur.top : [], want = th.top.filter(n => !prev.includes(n) && !leads[n]);
    if (want.length) {
      const cond = await getJ(ctx, '/atlas/data/cond.json');
      if (!okCond(cond)) return R(503, {error: 'no_data'}); // 대장주 자료를 못 받음 — 그날을 넘기지 않고 다음 셈이 다시
      for (const n of want) {
        const c = leaderOf(cond, n);
        if (!c) { leads[n] = {why: 'lead'}; continue; }
        const co = await getJ(ctx, `/atlas/data/co/${c}.json`);
        if (co === undefined) return R(503, {error: 'no_data'});
        const p = co ? closeOf(co) : null;
        leads[n] = p ? {c, ...p} : {c, ...(coName(co) ? {n: coName(co)} : {}), why: 'price'};
      }
    }
    let out = null;
    const w = await update(store, AUTO_KEY, prev0 => {
      if (prev0 !== null && !okAuto(prev0)) { out = {skip: 'account'}; return undefined; }
      out = applyTick(prev0, th, leads, t);
      return out.acc ?? undefined;
    });
    if (out?.skip === 'account') return R(409, {error: 'account'});
    if (out?.skip === 'need') { leads = {...leads}; continue; } // 그 사이 다른 셈이 지난 셋을 바꿈 — 모자란 대장주만 더 받아 다시
    if (!w.wrote || !out?.tick) return R(200, {ok: true, did: 'same', asOf: th.asOf});
    const k = out.tick;
    return R(200, {ok: true, did: k.buys.length ? 'bought' : k.fresh.length ? 'skipped' : 'kept', asOf: th.asOf, n: k.buys.length});
  }
  return R(503, {error: 'busy'});
}

/** 사장님 보기 → 계좌(기록은 뒤쪽만) · 지금 값 · 합계 · 사이트 오늘 싹 셋 · 마지막 셈 */
export async function view(store, ctx) {
  const cur = await readAcct(store);
  if (cur === undefined) return R(503, {error: 'store'});
  if (cur !== null && !okAuto(cur)) return R(409, {error: 'account'});
  const A = cur ?? newAuto();
  const codes = Object.keys(A.pos), prices = {}, px = {};
  for (let i = 0; i < codes.length; i += 20) {
    await Promise.all(codes.slice(i, i + 20).map(async c => { const j = await getJ(ctx, `/atlas/data/co/${c}.json`), p = j ? closeOf(j) : null; prices[c] = p ? {px: p.px, d: p.d} : null; if (p) px[c] = p.px; }));
  }
  const v = valueOf(A, px), raw = await getJ(ctx, '/next/data/theme-home.json'), th = raw ? themeOf(raw) : null;
  return R(200, {ok: true, started: !!A.asOf, buy: AUTO.buy,
    acc: {schema: A.schema, start: A.start, cash: A.cash, pos: A.pos, meta: A.meta, asOf: A.asOf, top: A.top, at: A.at, log: A.log.slice(-AUTO.show.log), ticks: A.ticks.slice(-AUTO.show.ticks)},
    value: {cash: v.cash, stock: v.stock, total: v.total, unknown: v.unknown}, prices,
    site: th, last: A.ticks.at(-1) ?? null});
}

/** 사장님 팔기 — 한 종목 전부 · 반(내림)을 마지막 종가로 → 새 보기 */
export async function sell(store, body, ctx, t = Date.now()) {
  const code = body?.code, part = body?.part;
  if (typeof code !== 'string' || !CODE_RE.test(code)) return R(400, {error: 'code'});
  if (part !== 'all' && part !== 'half') return R(400, {error: 'part'});
  const cur = await readAcct(store);
  if (cur === undefined) return R(503, {error: 'store'});
  if (cur !== null && !okAuto(cur)) return R(409, {error: 'account'});
  if (!cur?.pos?.[code]) return R(404, {error: 'hold'});
  const j = await getJ(ctx, `/atlas/data/co/${code}.json`), p = j ? closeOf(j) : null;
  if (!p) return R(503, {error: 'price'});
  let why = null, done = null;
  await update(store, AUTO_KEY, prev => {
    if (prev === null || !okAuto(prev) || !prev.pos[code]) { why = prev !== null && !okAuto(prev) ? 'account' : 'hold'; return undefined; }
    const have = prev.pos[code].q, q = part === 'all' ? have : Math.floor(have / 2);
    if (q < 1) { why = 'half'; return undefined; }
    const r = RULE.trade(prev, {code, side: 's', q, px: p.px, t});
    if (!r.ok) { why = r.why; return undefined; }
    why = null; done = {c: code, q, px: p.px, d: p.d};
    return r.acc;
  });
  if (why) return R(why === 'hold' ? 404 : why === 'account' ? 409 : 400, {error: why});
  const v = await view(store, ctx);
  return R(v.status, {...v.body, sold: done});
}

const HEAD = {'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store', 'X-Robots-Tag': 'noindex, nofollow, noarchive', 'Referrer-Policy': 'no-referrer', 'X-Content-Type-Options': 'nosniff'};
const json = (status, body) => new Response(JSON.stringify(body), {status, headers: HEAD});

export async function handleAuto(req, {store, now = () => new Date(), ownerHash = OWNER_KEY_SHA256, fetchImpl = globalThis.fetch, waitMs = AUTO.waitMs} = {}) {
  try {
    const url = new URL(req.url), sub = url.pathname.replace(/^\/api\/auto\/?/, '').replace(/\/$/, '');
    if (sub !== '') return json(404, {error: 'not_found'});
    const owner = ownerKeyOk(req.headers.get('x-atlas-owner'), ownerHash), ctx = {base: url.origin, fetchImpl, waitMs};
    if (req.method === 'GET') { if (!owner) return json(403, {error: 'owner_only'}); const r = await view(store, ctx); return json(r.status, r.body); }
    if (req.method === 'POST') {
      const origin = req.headers.get('origin');
      if (origin && origin !== url.origin) return json(403, {error: 'origin'});
      if (!/^application\/json\b/i.test(req.headers.get('content-type') ?? '')) return json(415, {error: 'type'});
      if (Number(req.headers.get('content-length') ?? 0) > AUTO.body) return json(413, {error: 'too_large'});
      const raw = await req.text();
      if (new TextEncoder().encode(raw).length > AUTO.body) return json(413, {error: 'too_large'});
      let body = null; try { body = JSON.parse(raw); } catch { return json(400, {error: 'bad_json'}); }
      if (body?.op === 'tick') { const r = await tick(store, ctx, now().getTime()); return json(r.status, r.body); }
      if (body?.op === 'sell') { if (!owner) return json(403, {error: 'owner_only'}); const r = await sell(store, body, ctx, now().getTime()); return json(r.status, r.body); }
      return json(400, {error: 'bad_op'});
    }
    return new Response(null, {status: 405, headers: {...HEAD, Allow: 'GET, POST'}});
  } catch {
    return json(500, {error: 'server'});
  }
}
