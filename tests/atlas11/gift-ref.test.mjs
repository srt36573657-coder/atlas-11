// 친구 셋 선물 서버 셈 시험(lib/atlas11/gift.mjs · functions/atlas11/gift.mjs) — 메모리 저장소 · 시계를 옮겨 봄 · 마지막은 넷리파이 함수 그대로 + Blobs 로컬 서버
//   사장님 2026-10-25 13:40 「… 카톡 친구 세 명으로 세 명을 보냈다 라는 걸 알 수 있게끔 그렇게 시스템을 짜고 곳곳에 선물 받기를 다 집어넣어 놔 지금부터 만들어」 · 13:38 「내가 직접 보낼 거야」
//   (tests/atlas11/gift.test.mjs 는 화면 쪽 「우주 영상 1분」 시험 — 이 파일과 다름)
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import {createHash, randomBytes} from 'node:crypto';
import {handleGift, refOf, RULE, GIFT_SCHEMA, GIFT_STORE, CONTACT_KEY, askCode} from '../../lib/atlas11/gift.mjs';
import {memoryStore} from '../../lib/atlas11/letter.mjs';

const OWNER = 'test-owner-key-0123456789', OWNER_HASH = createHash('sha256').update(OWNER).digest('hex');
const devKey = () => randomBytes(16).toString('base64url'); // 22자 — 화면이 만드는 기기 열쇠 꼴
const KK_UA = 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 KAKAOTALK 10.8.1';
const WEB_UA = 'Mozilla/5.0 (Linux; Android 14; SM-S921N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/129.0.0.0 Mobile Safari/537.36';
function api(store, clock) {
  return async (method, p, body, {key, owner, origin, type, ua} = {}) => {
    const headers = {'content-type': type ?? 'application/json'};
    if (key) headers['x-gift-key'] = key;
    if (owner) headers['x-atlas-owner'] = owner;
    if (origin) headers.origin = origin;
    if (ua) headers['user-agent'] = ua;
    const req = new Request('https://aaa7377.com/api/gift' + p, {method, headers, body: method === 'POST' ? (typeof body === 'string' ? body : JSON.stringify(body)) : undefined});
    const res = await handleGift(req, {store, now: () => new Date(clock.t), ownerHash: OWNER_HASH});
    return {status: res.status, body: await res.json(), headers: res.headers};
  };
}
const T0 = Date.parse('2026-10-25T00:00:00Z'); // 서울 아침 9시 — 하루 셈이 서울 날짜를 넘지 않게
const iso = ms => new Date(ms).toISOString();
const OK = Object.freeze({phone: '010-1234 5678', agree: true, watched: true});
/** 서로 다른 기기 n개가 그 고리를 엶 */
async function friends(call, ref, n, ua = WEB_UA) {
  for (let i = 0; i < n; i++) assert.deepEqual((await call('POST', '/visit', {r: ref}, {key: devKey(), ua})).body, {ok: true});
}

test('내 표(refOf) — SHA-256 → base64url → 앞 16자 · 화면(SubtleCrypto + btoa)과 같은 값 · 이름과 규칙 수', async () => {
  assert.equal(refOf('AAAAAAAAAAAAAAAAAAAAAA'), 'ilvbTMFRZBJsbvJm');
  assert.equal(refOf('Ab3_-xYz0123456789abcd'), 'fO679MEjhtHHPUQA');
  const webRef = async k => {
    const b = new Uint8Array(await crypto.subtle.digest('SHA-256', new TextEncoder().encode(k)));
    return btoa(String.fromCharCode(...b)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '').slice(0, 16);
  };
  for (let i = 0; i < 50; i++) {
    const k = devKey(), r = refOf(k);
    assert.match(k, /^[A-Za-z0-9_-]{22}$/);
    assert.equal(r, createHash('sha256').update(k, 'utf8').digest('base64url').slice(0, 16));
    assert.equal(r, await webRef(k), '브라우저 셈과 같음');
    assert.match(r, /^[A-Za-z0-9_-]{16}$/);
  }
  assert.equal(GIFT_SCHEMA, 'atlas11-gift-1');
  assert.equal(GIFT_STORE, 'atlas11-gift-v1');
  assert.deepEqual(RULE, {per: 3, keepWaitDays: 60, maxClaims: 20, visitsPerDay: 60, dayAll: 20000});
  assert.ok(Object.isFrozen(RULE));
});

test('연 기록 — 한 기기는 한 번만 · 내 고리는 안 셈 · 카톡 안에서 연 것(KAKAOTALK) · 내 수', async () => {
  const store = memoryStore(), clock = {t: T0}, call = api(store, clock), a = devKey(), ref = refOf(a);
  assert.deepEqual((await call('GET', '/me', null, {key: a})).body, {ref, friends: 0, kk: 0, per: 3, claims: [], next: 3, can: false, pending: null});
  // 내 고리를 내가 엶 → 안 셈
  assert.deepEqual((await call('POST', '/visit', {r: ref}, {key: a, ua: KK_UA})).body, {ok: true, self: true});
  assert.equal((await call('GET', '/me', null, {key: a})).body.friends, 0);
  // 친구 b 가 카톡 안에서 엶 · 1분 뒤 보통 브라우저로 또 엶 → 하나(첫 기록 그대로)
  const b = devKey();
  assert.deepEqual((await call('POST', '/visit', {r: ref}, {key: b, ua: KK_UA})).body, {ok: true});
  clock.t += 60e3;
  assert.deepEqual((await call('POST', '/visit', {r: ref}, {key: b, ua: WEB_UA})).body, {ok: true});
  // 친구 c 는 보통 브라우저 · 친구 d 는 소문자 kakaotalk · 친구 e 는 사용자 에이전트 없음
  await call('POST', '/visit', {r: ref}, {key: devKey(), ua: WEB_UA});
  await call('POST', '/visit', {r: ref}, {key: devKey(), ua: 'Mozilla/5.0 (Linux; Android 14) kakaotalk 10.8'});
  await call('POST', '/visit', {r: ref}, {key: devKey()});
  const m = (await call('GET', '/me', null, {key: a})).body;
  assert.deepEqual(m, {ref, friends: 4, kk: 2, per: 3, claims: [], next: 3, can: true, pending: null});
  const rec = [...store._map.entries()].filter(([k]) => k.startsWith(`v/${ref}/`)).map(([, v]) => JSON.parse(v));
  assert.equal(rec.length, 4);
  assert.ok(rec.some(r => r.at === iso(T0) && r.kk === true), 'b 의 첫 기록(카톡 · 처음 때)이 두 번째에 바뀌지 않음');
  // 내 수는 그 기기 표만 — 다른 기기는 제 수
  assert.equal((await call('GET', '/me', null, {key: b})).body.friends, 0);
  // 열쇠 · 표가 잘못이면 400 · 내 수는 열쇠 없으면 401
  const bad = await call('POST', '/visit', {r: ref});
  assert.equal(bad.status, 400); assert.deepEqual(bad.body, {error: 'key'});
  assert.equal((await call('POST', '/visit', {r: ref}, {key: 'short-key'})).status, 400);
  assert.equal((await call('POST', '/visit', {r: ref}, {key: b + 'x'})).status, 400);
  for (const r of ['bad', ref + 'x', ref.slice(0, 15) + '!', 42, null, undefined]) {
    const x = await call('POST', '/visit', {r}, {key: b});
    assert.equal(x.status, 400, String(r)); assert.deepEqual(x.body, {error: 'ref'});
  }
  assert.equal((await call('GET', '/me')).status, 401);
  assert.deepEqual((await call('GET', '/me', null, {key: a + 'x'})).body, {error: 'key'});
  assert.equal((await call('GET', '/me', null, {key: a})).body.friends, 4, '막힌 요청은 안 셈');
});

test('저장소에는 기기 열쇠가 없음 · 연 기기 해시로 그 기기의 표를 잇지 못함', async () => {
  const store = memoryStore(), clock = {t: T0}, call = api(store, clock), a = devKey(), b = devKey();
  await friends(call, refOf(a), 2);
  assert.deepEqual((await call('POST', '/visit', {r: refOf(a)}, {key: b})).body, {ok: true});
  await call('GET', '/me', null, {key: a});
  const dump = [...store._map.entries()].flat().join('\n');
  for (const k of [a, b]) assert.ok(!dump.includes(k), '기기 열쇠 없음');
  assert.ok(!dump.includes(refOf(b)), '연 사람(b)의 표는 저장소에 없음');
  const vhs = [...store._map.keys()].filter(k => k.startsWith('v/')).map(k => k.split('/')[2]);
  assert.equal(vhs.length, 3);
  for (const vh of vhs) assert.match(vh, /^[0-9a-f]{32}$/);
  const bHex = createHash('sha256').update(b, 'utf8').digest('hex').slice(0, 32);
  assert.ok(!vhs.includes(bHex), '연 기기 해시는 열쇠 해시와 다른 값(앞말을 붙여 셈)');
  for (const vh of vhs) assert.notEqual(Buffer.from(vh.slice(0, 24), 'hex').toString('base64url'), refOf(b));
});

test('선물 신청 — 동의 · 영상 다 봄 · 번호 꼴 · 셋마다 한 번(첫째 3명 · 둘째 6명) · 10분에 하나', async () => {
  const store = memoryStore(), clock = {t: T0}, call = api(store, clock), a = devKey(), ref = refOf(a);
  assert.deepEqual((await call('POST', '/claim', OK)).body, {error: 'key'});
  assert.equal((await call('POST', '/claim', OK)).status, 401);
  assert.deepEqual((await call('POST', '/claim', {...OK, agree: false}, {key: a})).body, {error: 'agree'});
  assert.deepEqual((await call('POST', '/claim', {phone: OK.phone, watched: true}, {key: a})).body, {error: 'agree'});
  assert.deepEqual((await call('POST', '/claim', {...OK, agree: 'true'}, {key: a})).body, {error: 'agree'});
  assert.deepEqual((await call('POST', '/claim', {...OK, watched: false}, {key: a})).body, {error: 'watched'});
  assert.deepEqual((await call('POST', '/claim', {phone: OK.phone, agree: true}, {key: a})).body, {error: 'watched'});
  for (const phone of ['02-123-4567', '010-123-456', '0101234567890', '+82 10-1234-5678', '010.1234.5678', '012-3456-7890', '010-1234-567a', '', 1012345678, null]) {
    const r = await call('POST', '/claim', {...OK, phone}, {key: a});
    assert.equal(r.status, 400, String(phone)); assert.deepEqual(r.body, {error: 'phone'}, String(phone));
  }
  // 둘이 열면 모자람
  await friends(call, ref, 2);
  const need = await call('POST', '/claim', OK, {key: a});
  assert.equal(need.status, 409); assert.deepEqual(need.body, {error: 'need', friends: 2, next: 3});
  // 셋째(카톡) → 첫 신청
  await friends(call, ref, 1, KK_UA);
  const c1 = await call('POST', '/claim', OK, {key: a});
  assert.equal(c1.status, 200);
  assert.deepEqual(Object.keys(c1.body).sort(), ['id', 'next', 'ok']);
  assert.equal(c1.body.ok, true); assert.equal(c1.body.next, 6); assert.match(c1.body.id, /^[0-9a-z]{9}-[A-Za-z0-9_-]{12}$/);
  assert.deepEqual(JSON.parse(store._map.get('c/' + c1.body.id)), {schema: GIFT_SCHEMA, id: c1.body.id, ref, at: iso(T0), phone: '01012345678', tail: '5678', friends: 3, kk: 1, state: 'wait', sentAt: null});
  assert.deepEqual(JSON.parse(store._map.get('m/' + ref)), {claims: [c1.body.id]});
  let m = (await call('GET', '/me', null, {key: a})).body;
  assert.deepEqual(m.claims, [{id: c1.body.id, at: iso(T0), state: 'wait'}]);
  assert.equal(m.next, 6); assert.equal(m.can, false);
  // 둘째는 6명이어야
  assert.deepEqual((await call('POST', '/claim', OK, {key: a})).body, {error: 'need', friends: 3, next: 6});
  await friends(call, ref, 3);
  m = (await call('GET', '/me', null, {key: a})).body;
  assert.equal(m.friends, 6); assert.equal(m.can, true);
  // 10분 안에는 하나만
  const slow = await call('POST', '/claim', OK, {key: a});
  assert.equal(slow.status, 429); assert.deepEqual(slow.body, {error: 'slow'});
  clock.t += 10 * 60e3 - 1;
  assert.deepEqual((await call('POST', '/claim', OK, {key: a})).body, {error: 'slow'});
  clock.t += 1;
  const c2 = await call('POST', '/claim', {...OK, phone: '011 987 6543'}, {key: a});
  assert.equal(c2.status, 200); assert.equal(c2.body.next, 9);
  assert.equal(JSON.parse(store._map.get('c/' + c2.body.id)).phone, '0119876543');
  m = (await call('GET', '/me', null, {key: a})).body;
  assert.deepEqual(m.claims.map(c => c.id), [c1.body.id, c2.body.id]);
  assert.equal(m.next, 9); assert.equal(m.can, false);
  // 다른 기기 신청은 제 표의 수로만
  assert.deepEqual((await call('POST', '/claim', OK, {key: devKey()})).body, {error: 'need', friends: 0, next: 3});
});

test('한 표에 신청은 20번까지', async () => {
  const store = memoryStore(), clock = {t: T0}, call = api(store, clock), a = devKey(), ref = refOf(a);
  await friends(call, ref, RULE.per * (RULE.maxClaims + 1));
  for (let i = 0; i < RULE.maxClaims; i++) {
    const r = await call('POST', '/claim', OK, {key: a});
    assert.equal(r.status, 200, '신청 ' + (i + 1)); assert.equal(r.body.next, RULE.per * (i + 2));
    clock.t += 10 * 60e3;
  }
  const max = await call('POST', '/claim', OK, {key: a});
  assert.equal(max.status, 429); assert.deepEqual(max.body, {error: 'max'});
  assert.equal((await call('GET', '/me', null, {key: a})).body.claims.length, RULE.maxClaims);
});

test('사장님 — 목록은 사장님 열쇠로만 · 기다림엔 번호 · 보냄 표시하면 번호를 지우고 끝 네 자리만', async () => {
  const store = memoryStore(), clock = {t: T0}, call = api(store, clock), a = devKey(), b = devKey();
  await friends(call, refOf(a), 3, KK_UA);
  await friends(call, refOf(b), 4);
  const ca = (await call('POST', '/claim', {...OK, phone: '010-1111-2222'}, {key: a})).body.id;
  clock.t += 60e3;
  const cb = (await call('POST', '/claim', {...OK, phone: '01033334444'}, {key: b})).body.id;
  // 열쇠 없음 · 틀린 열쇠 · 기기 열쇠로는 못 봄
  assert.equal((await call('GET', '/list')).status, 403);
  assert.deepEqual((await call('GET', '/list', null, {owner: 'wrong-key-0000000000000000'})).body, {error: 'owner_only'});
  assert.equal((await call('GET', '/list', null, {key: a})).status, 403);
  const l = (await call('GET', '/list', null, {owner: OWNER})).body;
  assert.deepEqual(Object.keys(l), ['items']);
  assert.deepEqual(l.items.map(x => x.id), [cb, ca], '새것부터');
  assert.deepEqual(l.items[1], {id: ca, at: iso(T0), ref: refOf(a), friends: 3, kk: 3, phone: '01011112222', tail: '2222', state: 'wait', sentAt: null, kind: 'phone', code: null});
  assert.deepEqual(l.items[0], {id: cb, at: iso(T0 + 60e3), ref: refOf(b), friends: 4, kk: 0, phone: '01033334444', tail: '4444', state: 'wait', sentAt: null, kind: 'phone', code: null});
  // 보냄 표시 — 사장님만 · 번호 꼴 · 없는 신청
  assert.equal((await call('POST', '/done', {id: ca})).status, 403);
  assert.equal((await call('POST', '/done', {id: ca}, {key: a})).status, 403);
  assert.deepEqual((await call('POST', '/done', {id: 'nope'}, {owner: OWNER})).body, {error: 'id'});
  const miss = await call('POST', '/done', {id: '000000000-AAAAAAAAAAAA'}, {owner: OWNER});
  assert.equal(miss.status, 404); assert.deepEqual(miss.body, {error: 'not_found'});
  clock.t += 3600e3;
  const sentAt = iso(clock.t);
  assert.deepEqual((await call('POST', '/done', {id: ca}, {owner: OWNER})).body, {ok: true});
  const l2 = (await call('GET', '/list', null, {owner: OWNER})).body.items;
  assert.deepEqual(l2.find(x => x.id === ca), {id: ca, at: iso(T0), ref: refOf(a), friends: 3, kk: 3, phone: null, tail: '2222', state: 'sent', sentAt, kind: 'phone', code: null});
  assert.equal(l2.find(x => x.id === cb).phone, '01033334444', '보내지 않은 신청은 그대로');
  assert.equal(JSON.parse(store._map.get('c/' + ca)).phone, null);
  assert.ok(![...store._map.values()].some(v => v.includes('01011112222')), '보낸 번호는 저장소에서 사라짐');
  // 다시 눌러도 보낸 때는 그대로
  clock.t += 60e3;
  assert.deepEqual((await call('POST', '/done', {id: ca}, {owner: OWNER})).body, {ok: true});
  assert.equal(JSON.parse(store._map.get('c/' + ca)).sentAt, sentAt);
  // 신청한 기기에서도 「보냄」
  assert.deepEqual((await call('GET', '/me', null, {key: a})).body.claims, [{id: ca, at: iso(T0), state: 'sent'}]);
});

test('60일 넘게 기다린 신청 — 사장님이 목록을 볼 때 번호를 지움(끝 네 자리 · 기다림은 그대로)', async () => {
  const store = memoryStore(), clock = {t: T0}, call = api(store, clock), a = devKey();
  await friends(call, refOf(a), 3);
  const id = (await call('POST', '/claim', {...OK, phone: '010-5555-6666'}, {key: a})).body.id;
  clock.t += RULE.keepWaitDays * 864e5; // 꼭 60일 — 아직 둠
  assert.equal((await call('GET', '/list', null, {owner: OWNER})).body.items[0].phone, '01055556666');
  clock.t += 1;
  const it = (await call('GET', '/list', null, {owner: OWNER})).body.items[0];
  assert.equal(it.phone, null); assert.equal(it.tail, '6666'); assert.equal(it.state, 'wait');
  assert.equal(JSON.parse(store._map.get('c/' + id)).phone, null);
  assert.ok(![...store._map.values()].some(v => v.includes('01055556666')), '저장소에서도 사라짐');
});

test('잦기 — 연 기록 한 기기 서울 하루 60개 · 이미 센 고리는 막지 않음 · 날짜가 바뀌면 다시 · 사이트 하루 20000개', async () => {
  const store = memoryStore(), clock = {t: T0}, call = api(store, clock), v = devKey(), first = refOf(devKey());
  assert.deepEqual((await call('POST', '/visit', {r: first}, {key: v})).body, {ok: true});
  for (let i = 1; i < RULE.visitsPerDay; i++) assert.deepEqual((await call('POST', '/visit', {r: refOf(devKey())}, {key: v})).body, {ok: true});
  const day = await call('POST', '/visit', {r: refOf(devKey())}, {key: v});
  assert.equal(day.status, 429); assert.deepEqual(day.body, {error: 'day'});
  assert.deepEqual((await call('POST', '/visit', {r: first}, {key: v})).body, {ok: true}, '이미 센 고리는 쓰지 않으니 막지 않음');
  assert.equal((await call('POST', '/visit', {r: refOf(devKey())}, {key: devKey()})).status, 200, '다른 기기는 됨');
  clock.t += 15 * 3600e3; // 서울 자정(아침 9시 + 15시간)
  assert.deepEqual((await call('POST', '/visit', {r: refOf(devKey())}, {key: v})).body, {ok: true});
  store._map.set(`q/${iso(clock.t + 9 * 3600e3).slice(0, 10)}/all`, JSON.stringify({n: RULE.dayAll}));
  const busy = await call('POST', '/visit', {r: refOf(devKey())}, {key: devKey()});
  assert.equal(busy.status, 429); assert.deepEqual(busy.body, {error: 'busy'});
});

test('막는 길 — 다른 곳에서 보낸 POST · 글꼴 · 크기 · 깨진 JSON · 모르는 길은 404 · 모든 답은 JSON(저장 안 함 머리)', async () => {
  const store = memoryStore(), clock = {t: T0}, call = api(store, clock), a = devKey(), b = devKey();
  const evil = await call('POST', '/visit', {r: refOf(a)}, {key: b, origin: 'https://evil.example'});
  assert.equal(evil.status, 403); assert.deepEqual(evil.body, {error: 'origin'});
  assert.equal((await call('POST', '/visit', {r: refOf(a)}, {key: b, origin: 'http://aaa7377.com'})).status, 403);
  assert.equal((await call('POST', '/claim', OK, {key: a, origin: 'https://aaa7377.com.evil.example'})).status, 403);
  assert.equal((await call('POST', '/done', {id: '000000000-AAAAAAAAAAAA'}, {owner: OWNER, origin: 'https://evil.example'})).status, 403);
  assert.equal((await call('GET', '/me', null, {key: a})).body.friends, 0, '막힌 연 기록은 안 셈');
  assert.deepEqual((await call('POST', '/visit', {r: refOf(a)}, {key: b, origin: 'https://aaa7377.com'})).body, {ok: true}, '같은 곳은 됨');
  assert.deepEqual((await call('POST', '/visit', {r: refOf(a)}, {key: b, type: 'text/plain'})).body, {error: 'type'});
  assert.equal((await call('POST', '/visit', 'x'.repeat(3000), {key: b})).status, 413);
  assert.deepEqual((await call('POST', '/visit', '{bad', {key: b})).body, {error: 'bad_json'});
  for (const [m, p] of [['GET', ''], ['GET', '/'], ['GET', '/visit'], ['POST', '/me'], ['POST', '/list'], ['GET', '/claim'], ['GET', '/done'], ['PUT', '/visit'], ['DELETE', '/me'], ['GET', '/me/x'], ['GET', '/nope']]) {
    const r = await call(m, p, {}, {key: a, owner: OWNER});
    assert.equal(r.status, 404, m + ' ' + p); assert.deepEqual(r.body, {error: 'not_found'});
  }
  const r = await call('GET', '/me', null, {key: a});
  assert.equal(r.headers.get('cache-control'), 'no-store');
  assert.equal(r.headers.get('content-type'), 'application/json; charset=utf-8');
  assert.equal(r.headers.get('x-robots-tag'), 'noindex, nofollow, noarchive');
  assert.equal(r.headers.get('referrer-policy'), 'no-referrer');
  // 저장소가 깨지면 500(JSON)
  const broken = {get: async () => null, setJSON: async () => { throw Error('down'); }, delete: async () => {}, list: async () => { throw Error('down'); }};
  const res = await handleGift(new Request('https://aaa7377.com/api/gift/me', {headers: {'x-gift-key': a}}), {store: broken, ownerHash: OWNER_HASH});
  assert.equal(res.status, 500); assert.deepEqual(await res.json(), {error: 'server'});
});

test('넷리파이 함수 그대로(functions/atlas11/gift.mjs) + Blobs 로컬 서버 — 길 · 연 기록 · 내 수 · 신청 · 사장님 목록 · 보냄', async () => {
  const mod = await import('../../functions/atlas11/gift.mjs');
  assert.deepEqual(mod.config, {path: ['/api/gift', '/api/gift/*']});
  assert.equal(typeof mod.default, 'function');
  const {BlobsServer} = await import('@netlify/blobs/server');
  const dir = await fs.mkdtemp(path.join(os.tmpdir(), 'atlas11-gift-blobs-')), token = 'local-gift-token';
  const server = new BlobsServer({directory: dir, token}); const {port} = await server.start();
  const edge = `http://127.0.0.1:${port}`, prev = {ctx: process.env.NETLIFY_BLOBS_CONTEXT, owner: process.env.ATLAS_INVITE_OWNER_SHA256};
  process.env.NETLIFY_BLOBS_CONTEXT = Buffer.from(JSON.stringify({edgeURL: edge, uncachedEdgeURL: edge, siteID: 'local-site', token})).toString('base64');
  process.env.ATLAS_INVITE_OWNER_SHA256 = OWNER_HASH;
  try {
    const fn = mod.default, a = devKey(), ref = refOf(a);
    const send = async (method, p, body, headers = {}) => {
      const res = await fn(new Request('https://aaa7377.com/api/gift' + p, {method, headers: {'content-type': 'application/json', ...headers}, body: body == null ? undefined : JSON.stringify(body)}));
      return {status: res.status, body: await res.json()};
    };
    for (let i = 0; i < 3; i++) assert.deepEqual((await send('POST', '/visit', {r: ref}, {'x-gift-key': devKey(), 'user-agent': i ? WEB_UA : KK_UA})).body, {ok: true});
    const m = (await send('GET', '/me', null, {'x-gift-key': a})).body;
    assert.deepEqual(m, {ref, friends: 3, kk: 1, per: 3, claims: [], next: 3, can: true, pending: null});
    const c = await send('POST', '/claim', {phone: '010-7777-8888', agree: true, watched: true}, {'x-gift-key': a});
    assert.equal(c.status, 200); assert.equal(c.body.next, 6);
    assert.equal((await send('GET', '/list')).status, 403);
    const l = (await send('GET', '/list', null, {'x-atlas-owner': OWNER})).body;
    assert.equal(l.items.length, 1); assert.equal(l.items[0].phone, '01077778888'); assert.equal(l.items[0].kk, 1);
    assert.deepEqual((await send('POST', '/done', {id: c.body.id}, {'x-atlas-owner': OWNER})).body, {ok: true});
    const after = (await send('GET', '/list', null, {'x-atlas-owner': OWNER})).body.items[0];
    assert.equal(after.phone, null); assert.equal(after.tail, '8888'); assert.equal(after.state, 'sent');
  } finally {
    for (const [k, v] of [['NETLIFY_BLOBS_CONTEXT', prev.ctx], ['ATLAS_INVITE_OWNER_SHA256', prev.owner]]) { if (v === undefined) delete process.env[k]; else process.env[k] = v; }
    await server.stop(); await fs.rm(dir, {recursive: true, force: true});
  }
});

test('「상품권 주세요」(사장님 2026-10-26 16:14 · 16:16 「일단 내 번호 남겨」) — 사장님 번호는 저장소에만 · 친구 셋을 채운 기기만 번호와 확인 번호 · 다시 눌러도 같은 번호 · 목록 · 보냄 뒤 끝', async () => {
  const store = memoryStore(), clock = {t: T0}, call = api(store, clock), a = devKey(), ref = refOf(a);
  assert.equal((await call('POST', '/ask', {watched: true})).status, 401);
  assert.deepEqual((await call('POST', '/ask', {watched: false}, {key: a})).body, {error: 'watched'});
  const none = await call('POST', '/ask', {watched: true}, {key: a});
  assert.equal(none.status, 503); assert.deepEqual(none.body, {error: 'contact'}, '번호가 없으면 503 — 화면은 예전 전화번호 칸');
  await store.setJSON(CONTACT_KEY, {phone: '010-9999-0000', at: iso(T0)});
  await friends(call, ref, 2);
  const need = await call('POST', '/ask', {watched: true}, {key: a});
  assert.equal(need.status, 409); assert.deepEqual(need.body, {error: 'need', friends: 2, next: 3}, '모자라면 번호를 안 줌');
  assert.equal((await call('GET', '/me', undefined, {key: a})).body.pending, null);
  await friends(call, ref, 1, KK_UA);
  const r1 = await call('POST', '/ask', {watched: true}, {key: a});
  assert.equal(r1.status, 200); assert.match(r1.body.code, /^\d{4}$/); assert.equal(r1.body.contact, '01099990000');
  assert.equal(r1.body.code, askCode(r1.body.id));
  const r2 = await call('POST', '/ask', {watched: true}, {key: a});
  assert.equal(r2.body.code, r1.body.code); assert.equal(r2.body.again, true, '다시 눌러도 같은 확인 번호(새 신청 없음)');
  assert.deepEqual((await call('GET', '/me', undefined, {key: a})).body.pending, {code: r1.body.code, contact: '01099990000'}, '다시 열어도 번호가 그대로');
  const c = await store.get('c/' + r1.body.id, {type: 'json'});
  assert.equal(c.kind, 'ask'); assert.equal(c.phone, null); assert.equal(c.friends, 3); assert.equal(c.kk, 1);
  const it = (await call('GET', '/list', undefined, {owner: OWNER})).body.items.find(x => x.id === r1.body.id);
  assert.equal(it.kind, 'ask'); assert.equal(it.code, r1.body.code); assert.equal(it.phone, null);
  const b = devKey();
  assert.equal((await call('POST', '/ask', {watched: true}, {key: b})).status, 409, '친구가 없는 기기는 번호를 못 받음');
  assert.equal((await call('GET', '/me', undefined, {key: b})).body.pending, null);
  assert.equal((await call('POST', '/done', {id: r1.body.id}, {owner: OWNER})).status, 200);
  assert.equal((await call('GET', '/me', undefined, {key: a})).body.pending, null, '보냄 표시 뒤에는 기다림이 아님');
});
