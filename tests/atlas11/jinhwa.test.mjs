// 진화 칸 시험(lib/atlas11/jinhwa.mjs · site/next/p-jinhwa.js) — 사장님 2026-10-18(싱가포르) 16:39 「진화가 본질인 명령문」 [9] 1 ~ 10 · [1] 5 · 일꾼 KD
//   ① 쓰기는 사장님 열쇠로만 · 번호는 올라간 진화 자료 안 것만 · 깃허브 열쇠 0 ② 확인 → 거둠(들어가기 전만) → 다시 확인 · 되돌리기 → 거둠(kept) · 되돌린 것은 못 바꿈
//   ③ 열쇠 없는 읽기 = 번호 · 상태 · 때 셋뿐 ④ 「○시」 셈 = 진화 회차 차례(회차마다 하나 · 되돌리기 먼저 · 이른 것부터 · 업데이트 30분 전 회차) ⑤ 화면 글 = 쓰지 않을 말 0 · 망치는 길 낱말 0
//   ⑥ 길 · 문 — 열쇠 없는 기기는 모듈도 안 받음(app.js) · 보유종목 줄은 열쇠 기기만(p-hold.js) · 함수 길
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {createHash} from 'node:crypto';
import {handleJinhwa, memoryStore, change, statusOf, siteData, idsOf, STATES, LIM, DATA_SCHEMA, STATE_SCHEMA} from '../../lib/atlas11/jinhwa.mjs';
import {slotAfter, slotPlan, slotLabel, picSrc, revertedAt, scoreLine, SLOTS, LEAD_MIN} from '../../site/next/p-jinhwa.js';
import {screenHits, ruinHits} from '../../site/next/words.js';
import {jsStrings} from '../../scripts/atlas11/next/rename.mjs';

const OWNER = 'test-owner-key-0123456789', OWNER_HASH = createHash('sha256').update(OWNER).digest('hex');
const SITE = 'https://aaa7377.com';
const KST = s => new Date(s + '+09:00');
const read = f => fs.readFileSync(new URL('../../' + f, import.meta.url), 'utf8');
const DATA = {schema: DATA_SCHEMA, made: '2026-10-19T09:31:00+09:00', essence: '골똘이의 본질: 주식을 사기 전에 한 번 멈추게 하는 곳이다.', n: 1, next: '2026-10-19T12:00:00+09:00',
  waiting: [{id: '20261019-0930-1'}, {id: '20261019-0930-2'}, {id: '20261019-0930-3'}],
  applied: [{id: '20261016-0930-1', at: '2026-10-16T10:00:00+09:00'}, {id: '20261015-0930-2', at: '2026-10-15T10:00:00+09:00', reverted: {at: '2026-10-16T12:00:00+09:00'}}],
  fixed: [], facts: {mismatch: 0, at: null}};
const [W1, W2, W3] = DATA.waiting.map(w => w.id), A1 = DATA.applied[0].id, AR = DATA.applied[1].id;
function api(store, clock, data = DATA) {
  return async (method, path, body, {owner = OWNER, origin, type = 'application/json', raw, len} = {}) => {
    const h = {};
    if (type) h['content-type'] = type;
    if (owner) h['x-atlas-owner'] = owner;
    if (origin) h.origin = origin;
    if (len != null) h['content-length'] = String(len);
    const req = new Request(SITE + path, {method, headers: h, body: method === 'POST' ? (raw ?? JSON.stringify(body)) : undefined});
    const res = await handleJinhwa(req, {store, now: () => clock.t, ownerHash: OWNER_HASH, dataOf: async () => (typeof data === 'function' ? data() : data)});
    const text = await res.text();
    return {status: res.status, body: text ? JSON.parse(text) : null, headers: res.headers};
  };
}

test('열쇠 — 쓰기는 사장님 열쇠로만 · me 는 열쇠가 맞을 때만 200 · 다른 사이트 막음', async () => {
  const store = memoryStore(), clock = {t: KST('2026-10-19T09:00:00')}, call = api(store, clock);
  assert.equal((await call('GET', '/api/jinhwa/me')).status, 200);
  assert.deepEqual((await call('GET', '/api/jinhwa/me')).body, {owner: true});
  assert.equal((await call('GET', '/api/jinhwa/me', null, {owner: null})).status, 403);
  assert.equal((await call('GET', '/api/jinhwa/me', null, {owner: 'wrong-key-00000000000000'})).status, 403);
  assert.equal((await call('GET', '/api/jinhwa/me', null, {owner: 'short'})).status, 403);
  for (const op of ['confirm', 'withdraw', 'revert']) {
    const r = await call('POST', '/api/jinhwa/' + op, {id: W1}, {owner: null});
    assert.equal(r.status, 403, op); assert.equal(r.body.error, 'owner_only');
  }
  assert.equal((await call('POST', '/api/jinhwa/confirm', {id: W1}, {owner: 'wrong-key-00000000000000'})).status, 403);
  assert.equal((await call('POST', '/api/jinhwa/confirm', {id: W1}, {origin: 'https://evil.example'})).status, 403);
  assert.equal(store._map.size, 0, '막힌 쓰기는 아무것도 안 남김');
});

test('꼴 막기 — 몸 꼴 · 크기 · 번호 · 길 · 자료 없음 · 모르는 번호', async () => {
  const store = memoryStore(), clock = {t: KST('2026-10-19T09:00:00')}, call = api(store, clock);
  assert.equal((await call('POST', '/api/jinhwa/confirm', {id: W1}, {type: 'text/plain'})).status, 415);
  assert.equal((await call('POST', '/api/jinhwa/confirm', null, {raw: '{bad'})).status, 400);
  assert.equal((await call('POST', '/api/jinhwa/confirm', null, {raw: JSON.stringify({id: W1, pad: 'x'.repeat(LIM.body)})})).status, 413);
  assert.equal((await call('POST', '/api/jinhwa/confirm', {id: W1}, {len: LIM.body + 1})).status, 413);
  for (const id of ['', '../x', 'a b', 'x'.repeat(65), 1, null]) assert.equal((await call('POST', '/api/jinhwa/confirm', {id})).status, 400, JSON.stringify(id));
  assert.equal((await call('POST', '/api/jinhwa/delete', {id: W1})).status, 404);
  assert.equal((await call('POST', '/api/jinhwa', {op: 'nope', id: W1})).status, 400);
  assert.equal((await call('POST', '/api/jinhwa', {op: 'confirm', id: W1})).status, 200, '몸 op 꼴도 받음');
  assert.equal((await call('POST', '/api/jinhwa/confirm', {id: '20261019-0930-9'})).status, 404, '자료에 없는 번호');
  assert.equal((await call('GET', '/api/jinhwa/nope')).status, 404);
  assert.equal((await call('PUT', '/api/jinhwa/confirm', {id: W1})).status, 405);
  const none = api(memoryStore(), clock, null);
  assert.deepEqual((await none('POST', '/api/jinhwa/confirm', {id: W1})).body, {error: 'no_data'});
  const bad = api(memoryStore(), clock, {...DATA, schema: 'other'});
  assert.equal((await bad('POST', '/api/jinhwa/confirm', {id: W1})).status, 503);
  assert.equal(idsOf({schema: DATA_SCHEMA, waiting: [{id: '../x'}, {id: W1}], applied: []}).waiting.size, 1, '이상한 번호는 자료에서도 버림');
});

test('확인 → 거둠 → 다시 확인 · 들어가기 전만 거둠 · 상태 꼴', async () => {
  const store = memoryStore(), clock = {t: KST('2026-10-19T09:00:00')}, call = api(store, clock);
  let r = await call('POST', '/api/jinhwa/confirm', {id: W1});
  assert.deepEqual(r.body, {id: W1, state: 'confirmed', at: clock.t.toISOString()});
  const at0 = r.body.at; clock.t = KST('2026-10-19T09:01:00');
  assert.equal((await call('POST', '/api/jinhwa/confirm', {id: W1})).body.at, at0, '같은 것을 두 번 — 때 그대로');
  assert.equal((await call('POST', '/api/jinhwa/withdraw', {id: W2})).body.error, 'not_confirmed', '확인 안 한 것은 못 거둠');
  r = await call('POST', '/api/jinhwa/withdraw', {id: W1}); assert.equal(r.body.state, 'withdrawn');
  assert.equal((await call('POST', '/api/jinhwa/withdraw', {id: W1})).status, 409);
  clock.t = KST('2026-10-19T09:02:00');
  r = await call('POST', '/api/jinhwa/confirm', {id: W1}); assert.equal(r.body.state, 'confirmed'); assert.notEqual(r.body.at, at0, '다시 확인 = 새 때(차례 뒤로)');
  assert.equal((await call('POST', '/api/jinhwa/revert', {id: W1})).body.error, 'not_applied', '기다리는 것은 되돌리기 없음');
  const doc = JSON.parse(store._map.get('s/' + W1));
  assert.deepEqual(Object.keys(doc).sort(), ['at', 'id', 'log', 'schema', 'state']);
  assert.equal(doc.schema, STATE_SCHEMA); assert.deepEqual(doc.log.map(x => x.state), ['confirmed', 'withdrawn', 'confirmed'], '기록은 지우지 않고 더함');
  // 회차가 들어가게 한 뒤(자료의 applied 로 옮김) — 확인은 못 거둠 · 되돌리기만
  const moved = {...DATA, waiting: DATA.waiting.slice(1), applied: [{id: W1, at: '2026-10-19T10:00:00+09:00'}, ...DATA.applied]};
  const c2 = api(store, clock, moved);
  assert.equal((await c2('POST', '/api/jinhwa/withdraw', {id: W1})).body.error, 'applied', '들어간 뒤에는 확인을 못 거둠([9] 5)');
  assert.equal((await c2('POST', '/api/jinhwa/confirm', {id: W1})).body.error, 'applied');
});

test('되돌리기 → 거둠(kept) → 다시 되돌리기 · 되돌린 것은 못 바꿈 · 기록 100줄까지', async () => {
  const store = memoryStore(), clock = {t: KST('2026-10-19T09:00:00')}, call = api(store, clock);
  assert.equal((await call('POST', '/api/jinhwa/revert', {id: A1})).body.state, 'revert');
  assert.equal((await call('POST', '/api/jinhwa/revert', {id: A1})).status, 200);
  assert.equal((await call('POST', '/api/jinhwa/withdraw', {id: A1})).body.state, 'kept');
  assert.equal((await call('POST', '/api/jinhwa/withdraw', {id: A1})).body.error, 'not_revert');
  assert.equal((await call('POST', '/api/jinhwa/revert', {id: A1})).body.state, 'revert');
  for (const op of ['confirm', 'withdraw', 'revert']) assert.equal((await call('POST', '/api/jinhwa/' + op, {id: AR})).body.error, 'reverted', op);
  assert.deepEqual([...STATES].sort(), ['confirmed', 'kept', 'revert', 'withdrawn']);
  for (let i = 0; i < 120; i++) { clock.t = new Date(clock.t.getTime() + 1000); await change(store, i % 2 ? 'revert' : 'withdraw', A1, DATA, clock.t); }
  assert.equal(JSON.parse(store._map.get('s/' + A1)).log.length, LIM.log);
});

test('열쇠 없는 읽기 — 번호 · 상태 · 때 셋뿐 · 이른 것부터 · 이상한 것은 버림', async () => {
  const store = memoryStore(), clock = {t: KST('2026-10-19T09:05:00')}, call = api(store, clock);
  await call('POST', '/api/jinhwa/confirm', {id: W2}); clock.t = KST('2026-10-19T09:00:00'); await call('POST', '/api/jinhwa/confirm', {id: W1});
  clock.t = KST('2026-10-19T09:02:00'); await call('POST', '/api/jinhwa/revert', {id: A1});
  await store.setJSON('s/junk', {schema: 'x', id: 'junk', state: 'confirmed', at: 'x'});
  await store.setJSON('other', {id: W3, state: 'confirmed'});
  const r = await call('GET', '/api/jinhwa/status', null, {owner: null});
  assert.equal(r.status, 200); assert.equal(r.headers.get('cache-control'), 'no-store');
  assert.deepEqual(r.body.items.map(x => [x.id, x.state]), [[W1, 'confirmed'], [A1, 'revert'], [W2, 'confirmed']]);
  for (const x of r.body.items) assert.deepEqual(Object.keys(x), ['id', 'state', 'at']);
  assert.deepEqual(Object.keys(r.body), ['items']);
  const {normalizeStatus} = await import('../../scripts/atlas11/jinhwa/lib.mjs'); // 진화 회차(KE)가 같은 꼴로 읽음
  const n = normalizeStatus(r.body);
  assert.equal(n.ok, true); assert.equal(n.unknown, 0); assert.deepEqual(n.items.map(x => x.state), ['confirmed', 'revert', 'confirmed']);
  assert.deepEqual(await statusOf(memoryStore()), {items: []});
});

test('지금 올라간 자료 읽기 — 같은 사이트 /next/data/jinhwa.json · 넘겨주기 없음 · 못 받으면 null', async () => {
  let seen = null;
  const ok = await siteData(new Request(SITE + '/api/jinhwa/confirm', {method: 'POST', body: '{}'}), {fetchImpl: async (u, init) => { seen = {u: String(u), init}; return new Response(JSON.stringify(DATA), {status: 200}); }});
  assert.equal(seen.u, SITE + '/next/data/jinhwa.json'); assert.equal(seen.init.redirect, 'error'); assert.equal(seen.init.cache, 'no-store');
  assert.equal(ok.n, 1);
  assert.equal(await siteData(new Request(SITE + '/api/jinhwa/x'), {fetchImpl: async () => new Response('', {status: 404})}), null);
  assert.equal(await siteData(new Request(SITE + '/api/jinhwa/x'), {fetchImpl: async () => { throw Error('down'); }}), null);
});

test('깃허브 열쇠 0 · 비밀 값 0 · 함수 길', async () => {
  for (const f of ['lib/atlas11/jinhwa.mjs', 'functions/atlas11/jinhwa.mjs', 'lib/atlas11/tally.mjs', 'functions/atlas11/tally.mjs', 'site/next/p-jinhwa.js', 'site/next/tally.js']) {
    const s = read(f);
    assert.doesNotMatch(s, /GITHUB_TOKEN|GH_TOKEN|ghp_[A-Za-z0-9]|github_pat_|api\.github\.com|Authorization/i, f);
    assert.doesNotMatch(s, /testowner-key|test-owner-key/, f + ' 시험 열쇠');
  }
  const fn = await import('../../functions/atlas11/jinhwa.mjs');
  assert.deepEqual(fn.config.path, ['/api/jinhwa', '/api/jinhwa/*']);
});

/* ── 「○시」 셈(화면 p-jinhwa.js) — 진화 회차 = 평일 09:30 · 11:30 · 13:30 · 17:30(서울 · [8] 1) · 회차마다 하나 ── */
const ms = s => KST(s).getTime(), iso = s => KST(s).toISOString();
test('업데이트 때 — 평일 10 · 12 · 14 · 18시 · 회차는 30분 전 · 주말 건너뜀', () => {
  assert.deepEqual([...SLOTS], [10, 12, 14, 18]); assert.equal(LEAD_MIN, 30);
  assert.equal(slotAfter(ms('2026-10-19T09:29:00')), ms('2026-10-19T10:00:00'), '월 09:29 → 10시 회차에 듦');
  assert.equal(slotAfter(ms('2026-10-19T09:30:00')), ms('2026-10-19T12:00:00'), '09:30 회차가 이미 돎 → 12시');
  assert.equal(slotAfter(ms('2026-10-19T09:45:00'), false), ms('2026-10-19T10:00:00'), '다음 업데이트(회차 아님)');
  assert.equal(slotAfter(ms('2026-10-23T17:31:00')), ms('2026-10-26T10:00:00'), '금 17:31 → 월 10시');
  assert.equal(slotAfter(ms('2026-10-24T12:00:00'), false), ms('2026-10-26T10:00:00'), '토요일 → 월 10시');
});

test('「○시」 차례 = 진화 회차 차례 — 회차마다 하나 · 되돌리기 먼저 · 이른 것부터 · 기다리는 것 · 들어간 것만', () => {
  const now = ms('2026-10-19T09:10:00'), sets = {waiting: new Set([W1, W2, W3]), applied: new Set([A1])};
  let p = slotPlan([{id: W1, state: 'confirmed', at: iso('2026-10-19T09:00:00')}], now, sets);
  assert.equal(p.get(W1), ms('2026-10-19T10:00:00'));
  p = slotPlan([{id: W2, state: 'confirmed', at: iso('2026-10-19T09:05:00')}, {id: W1, state: 'confirmed', at: iso('2026-10-19T09:00:00')}], now, sets);
  assert.deepEqual([p.get(W1), p.get(W2)], [ms('2026-10-19T10:00:00'), ms('2026-10-19T12:00:00')], '둘이면 하나씩');
  p = slotPlan([{id: W1, state: 'confirmed', at: iso('2026-10-19T08:00:00')}, {id: A1, state: 'revert', at: iso('2026-10-19T09:00:00')}], now, sets);
  assert.deepEqual([p.get(A1), p.get(W1)], [ms('2026-10-19T10:00:00'), ms('2026-10-19T12:00:00')], '되돌리기 먼저(lib.mjs planRound)');
  p = slotPlan([{id: W1, state: 'confirmed', at: iso('2026-10-19T09:35:00')}], ms('2026-10-19T09:40:00'), sets);
  assert.equal(p.get(W1), ms('2026-10-19T12:00:00'), '09:30 회차 뒤에 누름 → 12시');
  p = slotPlan([{id: W1, state: 'confirmed', at: iso('2026-10-19T09:00:00')}], ms('2026-10-19T09:40:00'), sets);
  assert.equal(p.get(W1), ms('2026-10-19T10:00:00'), '09:30 회차가 실었고 10시 업데이트 전');
  p = slotPlan([{id: W1, state: 'confirmed', at: iso('2026-10-19T09:00:00')}], ms('2026-10-19T10:05:00'), sets);
  assert.equal(p.get(W1), ms('2026-10-19T12:00:00'), '회차가 못 넣었으면 다음 업데이트');
  p = slotPlan([{id: W1, state: 'confirmed', at: iso('2026-10-23T17:40:00')}], ms('2026-10-23T17:41:00'), sets);
  assert.equal(p.get(W1), ms('2026-10-26T10:00:00'), '금요일 마지막 회차 뒤 → 월 10시');
  p = slotPlan([{id: 'gone', state: 'confirmed', at: iso('2026-10-19T09:00:00')}, {id: W3, state: 'withdrawn', at: iso('2026-10-19T09:00:00')}, {id: W1, state: 'revert', at: iso('2026-10-19T09:00:00')}, {id: W2, state: 'confirmed', at: iso('2026-10-19T09:01:00')}], now, sets);
  assert.deepEqual([...p.keys()], [W2], '내려간 대안 · 거둔 것 · 기다리는 것의 되돌리기는 셈 밖');
});

test('「○시」 글 — 다음 업데이트 · 오늘 뒤 · 다른 날 · 되돌리기', () => {
  const now = ms('2026-10-19T09:10:00');
  assert.equal(slotLabel('confirm', ms('2026-10-19T10:00:00'), now), '확인함 · 다음 업데이트 10시에 들어가요');
  assert.equal(slotLabel('confirm', ms('2026-10-19T12:00:00'), now), '확인함 · 12시 업데이트에 들어가요');
  assert.equal(slotLabel('confirm', ms('2026-10-20T10:00:00'), now), '확인함 · 10월 20일 10시 업데이트에 들어가요');
  assert.equal(slotLabel('revert', ms('2026-10-19T10:00:00'), now), '되돌리기 함 · 다음 업데이트 10시에 되돌려요');
  assert.equal(slotLabel('confirm', null, now), '확인함 · 다음 업데이트에 들어가요');
  assert.match(slotLabel('confirm', ms('2026-10-19T10:00:00'), now), /^확인함 · 다음 업데이트 \d+시에 들어가요$/, '[9] 4 사장님 글 꼴');
});

test('화면 조각 — 그림 길 · 되돌린 때 · 채점 글(회차 꼴 score.at = null 이면 아직)', () => {
  assert.equal(picSrc({id: 'x-1', before: 'data/jinhwa/x-1-before.png'}, 'before'), '/next/data/jinhwa/x-1-before.png', '회차가 쓰는 /next/ 기준 길');
  assert.equal(picSrc({id: 'x-1', after: '/next/data/jinhwa/x-1-after.png'}, 'after'), '/next/data/jinhwa/x-1-after.png');
  for (const bad of ['https://evil.example/a.png', '../a.png', 'data/jinhwa/../../a.png', 'javascript:alert(1)']) assert.equal(picSrc({id: 'x-1', before: bad}, 'before'), '/next/data/jinhwa/x-1-before.png', bad);
  assert.equal(revertedAt({id: 'a'}), null);
  assert.equal(revertedAt({reverted: {at: '2026-10-16T12:00:00+09:00'}}), '2026-10-16T12:00:00+09:00');
  assert.equal(revertedAt({revertedAt: '2026-10-16T12:00:00+09:00'}), '2026-10-16T12:00:00+09:00');
  assert.equal(revertedAt({reverted: true}), '');
  assert.deepEqual(scoreLine({predict: {days: 10}, score: {at: null, ok: null, text: '채점 전 — 들어간 뒤 10거래일이 지나면 매겨요'}}), {cls: '', head: null, why: '채점 전 — 들어간 뒤 10거래일이 지나면 매겨요'});
  assert.deepEqual(scoreLine({}), {cls: '', head: '10거래일 뒤 채점 전이에요', why: ''});
  assert.equal(scoreLine({score: {at: '2026-11-03T09:30:00+09:00', ok: true, text: 'x'}}).head, '10거래일 뒤 · 맞았어요');
  assert.equal(scoreLine({score: {at: '2026-11-03T09:30:00+09:00', ok: false, text: 'x'}}).cls, ' no');
  assert.equal(scoreLine({score: {at: '2026-11-03T09:30:00+09:00', ok: null, text: 'x'}}).head, '10거래일 뒤 · 판단 못 했어요');
});

test('화면 글 — 쓰지 않을 말 0(「예측」 대신 「어림」) · 망치는 길 낱말 0 · 이름을 박지 않음', async () => {
  const {BRAND} = await import('../../site/next/brand.js');
  for (const f of ['site/next/p-jinhwa.js', 'site/next/tally.js']) {
    const strs = jsStrings(read(f)).map(x => x.s);
    const bad = strs.flatMap(s => [...screenHits(s).map(w => `「${s}」 ${w}`), ...ruinHits(s).map(x => `「${s}」 ${x.word}`)]);
    assert.deepEqual(bad, [], f);
    assert.deepEqual(strs.filter(s => [BRAND.ko, ...BRAND.was.map(w => w.ko)].some(n => s.includes(n))), [], f + ' 이름');
  }
  const priv = read('site/privacy.html');
  assert.match(priv, /<h3 id="tally">합계 칸<\/h3>/, '[10] 4 처리방침에 합계 칸');
  assert.match(priv, /Daily tally:/, '처리방침 영어 줄');
  const sec = priv.slice(priv.indexOf('<h3 id="tally">'), priv.indexOf('</section>', priv.indexOf('<h3 id="tally">')));
  assert.deepEqual(ruinHits(sec.replace(/<[^>]+>/g, ' ')), []);
});

test('길 · 문 — 열쇠 없는 기기는 모듈도 안 받음 · 보유종목 줄은 열쇠 기기만 · 서버가 맞다고 할 때만', () => {
  const app = read('site/next/app.js'), hold = read('site/next/p-hold.js'), pj = read('site/next/p-jinhwa.js');
  const line = app.split('\n').find(l => l.startsWith('VIEWS.jinhwa = '));
  assert.ok(line, 'app.js 길 한 줄');
  assert.match(line, /localStorage\.getItem\('atlas11:invite:owner'\)/);
  assert.match(line, /return k && k\.length >= 16 && k\.length <= 128 \? page\('jinhwa', a\) : new Promise\(res => \{ addEventListener\('hashchange', [^]*location\.replace\('#\/'\)/, '열쇠가 없으면(길이도 p-jinhwa ownerKey 와 같은 잣대) 모듈 없이 #/ 로(기록 바꿔 씀)');
  assert.match(pj, /k\.length >= 16 && k\.length <= 128/, 'p-jinhwa 열쇠 길이 잣대');
  const sc = hold.slice(hold.indexOf('export function shortcuts()'), hold.indexOf('export async function news'));
  assert.match(sc, /if \(localStorage\.getItem\('atlas11:invite:owner'\)\) import\('\.\/p-jinhwa\.js'\)\.then\(m => m\.ownerRow\(box\)\)/);
  assert.equal((hold.match(/p-jinhwa/g) ?? []).length, 1, 'p-hold 은 그 한 줄만');
  assert.match(pj, /if \(!\(await ownerOk\(\)\)\) return away\(\);/, '그리기 전에 서버에 물음');
  assert.match(pj, /fetch\('\/api\/jinhwa\/me', \{headers: \{'x-atlas-owner': k\}/);
  assert.match(pj, /if \(!ok \|\| !box \|\| box\.querySelector\('a\.jh-row'\)\) return;/, '줄도 서버가 맞다고 한 뒤에만');
  assert.match(pj, /location\.replace\('#\/'\)/);
  assert.doesNotMatch(pj, /location\.(href|hash)\s*=|history\.pushState/, '문 밖 길은 주소 기록을 남기지 않음');
});
