// 자동으로 산 기록 · 가짜 돈 시험(lib/atlas11/auto.mjs · site/next/game-rule.js ruleFor) — 메모리 저장소 · 가짜 사이트 파일(망 없이)
//   사장님 2026-10-22 08:35 「자동 매수 프로그램을 만들어라 … 싹에 올라오는 1등부터 3등까지를 각각 3천만원 매수하라 업종이 바뀌면 무조건 매수 하라 매도는 내가 하겠다」 · 08:50 「가짜돈으로 해」
import test from 'node:test';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {handleAuto, applyTick, themeOf, leaderOf, closeOf, newAuto, okAuto, AUTO, AUTO_KEY, AUTO_STORE, RULE} from '../../lib/atlas11/auto.mjs';
import {GAME, newAccount, okAccount, ruleFor, trade, valueOf} from '../../site/next/game-rule.js';
import {memoryStore} from '../../lib/atlas11/letter.mjs';
import {memoryStore as casStore} from '../../lib/atlas11/kakao-store.mjs';

const OWNER = 'test-owner-key-0123456789', HASH = createHash('sha256').update(OWNER).digest('hex');
const D1 = '2026-10-21', D2 = '2026-10-22', D3 = '2026-10-23';
const T0 = Date.parse('2026-10-21T12:30:00Z'); // 서울 밤 9시 30분 — 올린 뒤

/** 가짜 사이트 — 길 → 값(그대로 JSON) · 'down' = 503 · 'junk' = JSON 아님 · 없으면 404 */
function site() {
  const files = new Map();
  const theme = (asOf, S, more = {}) => files.set('/next/data/theme-home.json', {schema: 'dori-theme-1-home', made: '2026-10-21T12:00:00Z', asOf, provisional: false, order: {S}, count: {S: 37}, ...more});
  files.set('/atlas/data/cond.json', {schema: 'atlas-cond-1', asOf: D1, ind: [{n: '반도체'}, {n: '조선'}, {n: '방산'}, {n: '은행'}, {n: '바이오'}], co: {c: ['005930', '000660', '009540', '010140', '012450', '105560', '207940'], i: [0, 0, 1, 1, 2, 3, 4], rk: [1, 2, 1, 2, 1, 1, 1], cap: [400, 100, 20, 10, 30, 35, 60]}});
  const co = (c, name, price, d = D1) => files.set(`/atlas/data/co/${c}.json`, {c: {name, market: 'KOSPI', price, priceDate: d}});
  co('005930', '삼성전자', 60_000); co('000660', 'SK하이닉스', 200_000); co('009540', 'HD한국조선해양', 150_000); co('010140', '삼성중공업', 10_000);
  co('012450', '한화에어로스페이스', 700_000); co('105560', 'KB금융', 80_000); co('207940', '삼성바이오로직스', 40_000_000);
  theme(D1, ['반도체', '조선', '방산']);
  let calls = 0;
  const fetchImpl = async u => {
    calls++;
    const p = new URL(u).pathname, v = files.get(p);
    if (v === undefined) return new Response('not found', {status: 404});
    if (v === 'down') return new Response('busy', {status: 503});
    if (v === 'junk') return new Response('<html>', {status: 200});
    return new Response(JSON.stringify(v), {status: 200, headers: {'content-type': 'application/json'}});
  };
  return {files, theme, co, fetchImpl, calls: () => calls};
}
function api(store, S, clock = {t: T0}) {
  return async (method, body, {owner, origin, type, path = ''} = {}) => {
    const headers = {'content-type': type ?? 'application/json'};
    if (owner) headers['x-atlas-owner'] = owner;
    if (origin) headers.origin = origin;
    const req = new Request('https://aaa7377.com/api/auto' + path, {method, headers, body: method === 'POST' ? (typeof body === 'string' ? body : JSON.stringify(body)) : undefined});
    const res = await handleAuto(req, {store, now: () => new Date(clock.t), ownerHash: HASH, fetchImpl: S.fetchImpl});
    return {status: res.status, body: res.status === 405 ? null : await res.json()};
  };
}
const acct = async store => store.get(AUTO_KEY, {type: 'json'});
const TICK = {op: 'tick'};

test('같은 셈 · 다른 계좌 이름 — 공개 연습 계좌와 섞이지 않음 · 공개 셈 결과는 그대로', () => {
  assert.equal(AUTO_STORE, 'atlas11-auto-v1'); assert.equal(RULE.schema, 'dori-auto-1');
  assert.throws(() => ruleFor(GAME.schema)); assert.throws(() => ruleFor(''));
  const a = newAuto(); assert.equal(a.cash, 1e9); assert.equal(a.start, 1e9); assert.ok(okAuto(a));
  assert.equal(okAccount(a), false, '공개 셈은 자동 계좌를 받지 않음'); assert.equal(RULE.okAccount(newAccount()), false, '자동 셈은 공개 계좌를 받지 않음');
  assert.equal(trade(a, {code: '005930', side: 'b', q: 1, px: 1}).why, 'account');
  const r = RULE.trade(a, {code: '005930', side: 'b', q: 500, px: 60_000, t: 1}); assert.ok(r.ok);
  assert.deepEqual(r.acc.pos, {'005930': {q: 500, cost: 30_000_000}}); assert.equal(r.acc.cash, 970_000_000); assert.deepEqual(r.acc.log, [{t: 1, c: '005930', s: 'b', q: 500, px: 60_000}]);
  const g = trade(newAccount(), {code: '005930', side: 'b', q: 500, px: 60_000, t: 1}); assert.ok(g.ok); assert.equal(g.acc.schema, GAME.schema); assert.equal(g.acc.cash, 970_000_000);
  let b = newAccount(); for (let i = 0; i < 205; i++) b = trade(b, {code: '005930', side: i % 2 ? 's' : 'b', q: 1, px: 1000, t: i}).acc; assert.equal(b.log.length, 200, '공개 계좌 기록은 그대로 200');
  let c = newAuto(); for (let i = 0; i < 505; i++) c = RULE.trade(c, {code: '005930', side: i % 2 ? 's' : 'b', q: 1, px: 1000, t: i}).acc; assert.equal(c.log.length, AUTO.log);
  assert.equal(valueOf(r.acc, {'005930': 66_000}).total, 970_000_000 + 33_000_000);
});

test('자료 읽기 — 테마 시계 셋 · 대장주(업종 안 크기 차례 1) · 마지막 종가', () => {
  const S = site();
  assert.deepEqual(themeOf(S.files.get('/next/data/theme-home.json')), {asOf: D1, top: ['반도체', '조선', '방산'], provisional: false});
  assert.equal(themeOf({schema: 'dori-theme-1-home', asOf: D1, order: {S: []}}), null, '싹이 비면 닫음');
  assert.equal(themeOf({schema: 'dori-theme-1-home', asOf: '10월 21일', order: {S: ['반도체']}}), null);
  assert.equal(themeOf({schema: 'dori-theme-1', asOf: D1, order: {S: ['반도체']}}), null, '다른 자료');
  assert.equal(themeOf({schema: 'dori-theme-1-home', asOf: D1, order: {S: ['반도체', '반도체']}}), null, '같은 이름 둘');
  assert.deepEqual(themeOf({schema: 'dori-theme-1-home', asOf: D1, order: {S: ['a', 'b', 'c', 'd']}}).top, ['a', 'b', 'c'], '앞 셋만');
  const cond = S.files.get('/atlas/data/cond.json');
  assert.equal(leaderOf(cond, '반도체'), '005930'); assert.equal(leaderOf(cond, '조선'), '009540'); assert.equal(leaderOf(cond, '없는 업종'), null);
  assert.equal(leaderOf({...cond, co: {...cond.co, rk: [1, 1, 1, 2, 1, 1, 1]}}, '반도체'), null, '차례 1 이 둘이면 사지 않음');
  assert.equal(leaderOf({ind: cond.ind}, '반도체'), null);
  assert.deepEqual(closeOf({c: {name: '삼성전자', price: 60000, priceDate: D1}}), {px: 60000, d: D1, n: '삼성전자'});
  for (const bad of [null, {}, {c: {price: 0}}, {c: {price: -1}}, {c: {price: '60000'}}, {c: {price: 1e9}}]) assert.equal(closeOf(bad), null);
});

test('첫 셈 — 싹 셋의 대장주를 3천만 원어치씩 삼 · 같은 날 두 번이면 아무 일 없음 · 열쇠 없이 부름', async () => {
  const store = memoryStore(), S = site(), call = api(store, S);
  const r = await call('POST', TICK);
  assert.equal(r.status, 200); assert.deepEqual(r.body, {ok: true, did: 'bought', asOf: D1, n: 3});
  const a = await acct(store);
  assert.ok(okAuto(a)); assert.equal(a.schema, 'dori-auto-1'); assert.equal(a.asOf, D1); assert.deepEqual(a.top, ['반도체', '조선', '방산']);
  assert.deepEqual(a.pos, {'005930': {q: 500, cost: 30_000_000}, '009540': {q: 200, cost: 30_000_000}, '012450': {q: 42, cost: 29_400_000}});
  assert.equal(a.cash, 1e9 - 30_000_000 - 30_000_000 - 29_400_000);
  for (const [c, p] of Object.entries(a.pos)) assert.ok(p.cost <= AUTO.buy && p.cost > AUTO.buy - S.files.get(`/atlas/data/co/${c}.json`).c.price, c + ' 3천만 원 안에서 가장 많이');
  assert.deepEqual(a.meta, {'005930': {n: '삼성전자', i: '반도체'}, '009540': {n: 'HD한국조선해양', i: '조선'}, '012450': {n: '한화에어로스페이스', i: '방산'}});
  assert.equal(a.ticks.length, 1);
  assert.deepEqual(a.ticks[0], {t: T0, asOf: D1, top: ['반도체', '조선', '방산'], fresh: ['반도체', '조선', '방산'], skips: [],
    buys: [{i: '반도체', c: '005930', n: '삼성전자', q: 500, px: 60_000, d: D1}, {i: '조선', c: '009540', n: 'HD한국조선해양', q: 200, px: 150_000, d: D1}, {i: '방산', c: '012450', n: '한화에어로스페이스', q: 42, px: 700_000, d: D1}]});
  assert.deepEqual(a.log.map(x => [x.c, x.s, x.q, x.px]), [['005930', 'b', 500, 60_000], ['009540', 'b', 200, 150_000], ['012450', 'b', 42, 700_000]]);
  const before = JSON.stringify(a), n0 = S.calls();
  const r2 = await call('POST', TICK);
  assert.deepEqual(r2.body, {ok: true, did: 'same', asOf: D1});
  assert.equal(JSON.stringify(await acct(store)), before, '같은 날 두 번 = 바뀜 0');
  assert.equal(S.calls() - n0, 1, '같은 날이면 테마 파일 하나만 받음');
  assert.deepEqual(Object.keys(r.body).sort(), ['asOf', 'did', 'n', 'ok'], '셈 답에 계좌가 없음(누구나 부름)');
});

test('새 업종이 들면 하나 더 삼 · 빠진 업종은 팔지 않음 · 그대로면 안 삼', async () => {
  const store = memoryStore(), S = site(), clock = {t: T0}, call = api(store, S, clock);
  await call('POST', TICK);
  S.theme(D2, ['반도체', '은행', '조선']); clock.t = T0 + 864e5; // 방산이 빠지고 은행이 듦
  const r = await call('POST', TICK);
  assert.deepEqual(r.body, {ok: true, did: 'bought', asOf: D2, n: 1});
  const a = await acct(store);
  assert.deepEqual(Object.keys(a.pos).sort(), ['005930', '009540', '012450', '105560'], '빠진 방산(012450)은 그대로');
  assert.deepEqual(a.pos['105560'], {q: 375, cost: 30_000_000}); assert.deepEqual(a.pos['005930'], {q: 500, cost: 30_000_000}, '그대로 있는 업종은 더 안 삼');
  assert.equal(a.cash, 1e9 - 30_000_000 * 3 - 29_400_000); assert.equal(a.log.filter(x => x.s === 's').length, 0, '저절로 판 것 0');
  assert.deepEqual(a.ticks.at(-1).fresh, ['은행']); assert.deepEqual(a.top, ['반도체', '은행', '조선']); assert.equal(a.asOf, D2);
  S.theme(D3, ['조선', '반도체', '은행']); clock.t += 864e5; // 차례만 바뀜
  assert.deepEqual((await call('POST', TICK)).body, {ok: true, did: 'kept', asOf: D3, n: 0});
  const b = await acct(store); assert.deepEqual(b.pos, a.pos); assert.equal(b.ticks.at(-1).buys.length, 0); assert.equal(b.asOf, D3);
  S.theme('2026-10-20', ['바이오', '은행', '조선']); // 옛 자료(되돌린 올리기) — 아무 일 없음
  assert.deepEqual((await call('POST', TICK)).body, {ok: true, did: 'same', asOf: D3});
  S.theme('2026-10-26', ['방산', '반도체', '은행']); clock.t += 3 * 864e5; // 빠졌던 방산이 다시 들면 다시 삼
  assert.deepEqual((await call('POST', TICK)).body, {ok: true, did: 'bought', asOf: '2026-10-26', n: 1});
  assert.deepEqual((await acct(store)).pos['012450'], {q: 84, cost: 58_800_000});
});

test('현금이 모자라면 · 값을 모르면 · 1주도 못 사면 · 대장주가 없으면 — 사지 않고 까닭을 적음', async () => {
  const store = memoryStore(), S = site(), call = api(store, S);
  const seed = {...newAuto(), cash: 40_000_000, asOf: '2026-10-20', top: ['은행', '바이오', '방산']};
  await store.setJSON(AUTO_KEY, seed);
  const r = await call('POST', TICK); // 새로 든 업종: 반도체 · 조선(방산은 그대로)
  assert.deepEqual(r.body, {ok: true, did: 'bought', asOf: D1, n: 1});
  const a = await acct(store), k = a.ticks.at(-1);
  assert.deepEqual(k.fresh, ['반도체', '조선']); assert.deepEqual(k.buys.map(x => x.c), ['005930']);
  assert.deepEqual(k.skips, [{i: '조선', c: '009540', n: 'HD한국조선해양', why: 'cash'}]); assert.equal(a.cash, 10_000_000);
  // 모두 못 삼 — 값 없는 회사 파일 · 1주가 3천만 원 넘음 · 업종이 대장주 자료에 없음
  S.files.delete('/atlas/data/co/005930.json');
  const s2 = memoryStore(), call2 = api(s2, S);
  S.theme(D1, ['반도체', '바이오', '로봇']);
  assert.deepEqual((await call2('POST', TICK)).body, {ok: true, did: 'skipped', asOf: D1, n: 0});
  const b = await acct(s2);
  assert.deepEqual(b.ticks[0].skips, [{i: '반도체', c: '005930', why: 'price'}, {i: '바이오', c: '207940', n: '삼성바이오로직스', why: 'qty'}, {i: '로봇', why: 'lead'}]);
  assert.equal(b.cash, 1e9); assert.deepEqual(b.pos, {}); assert.equal(b.asOf, D1, '까닭을 적고 그날은 넘어감');
});

test('장 중 값이면 기다림 · 자료가 깨지면 아무것도 안 바꾸고 닫음', async () => {
  const store = memoryStore(), S = site(), call = api(store, S);
  S.theme(D1, ['반도체', '조선', '방산'], {provisional: true});
  assert.deepEqual((await call('POST', TICK)).body, {ok: true, did: 'wait', asOf: D1}); assert.equal(await acct(store), null);
  for (const [why, set] of [
    ['테마 파일 없음', () => S.files.delete('/next/data/theme-home.json')],
    ['테마 파일 JSON 아님', () => S.files.set('/next/data/theme-home.json', 'junk')],
    ['테마 파일 잠깐 끊김', () => S.files.set('/next/data/theme-home.json', 'down')],
    ['다른 꼴', () => S.files.set('/next/data/theme-home.json', {schema: 'dori-theme-1-home', asOf: D1, order: {}})],
    ['싹 빔', () => S.theme(D1, [])],
    ['대장주 자료 없음', () => { S.theme(D1, ['반도체', '조선', '방산']); S.files.delete('/atlas/data/cond.json'); }],
    ['대장주 자료 깨짐', () => S.files.set('/atlas/data/cond.json', {ind: [], co: {c: []}})],
    ['회사 파일 잠깐 끊김', () => { S.files.set('/atlas/data/cond.json', site().files.get('/atlas/data/cond.json')); S.files.set('/atlas/data/co/009540.json', 'down'); }],
  ]) {
    set();
    const r = await call('POST', TICK);
    assert.equal(r.status, 503, why); assert.equal(r.body.error, 'no_data', why);
    assert.equal(await acct(store), null, why + ' — 계좌를 만들지 않음');
  }
  S.files.set('/atlas/data/co/009540.json', {c: {name: 'HD한국조선해양', price: 150_000, priceDate: D1}});
  assert.equal((await call('POST', TICK)).body.n, 3, '자료가 돌아오면 그날 셈');
  // 저장된 계좌가 깨졌으면 덮어쓰지 않음
  const s2 = memoryStore(); await s2.setJSON(AUTO_KEY, {schema: 'dori-auto-1', cash: -5});
  const c2 = api(s2, S);
  assert.deepEqual(await c2('POST', TICK), {status: 409, body: {error: 'account'}});
  assert.deepEqual(await acct(s2), {schema: 'dori-auto-1', cash: -5});
  assert.equal((await c2('GET', null, {owner: OWNER})).status, 409);
  assert.equal((await c2('POST', {op: 'sell', code: '005930', part: 'all'}, {owner: OWNER})).status, 409);
});

test('사장님 팔기 — 전부 · 반(내림)을 마지막 종가로 · 열쇠가 없거나 틀리면 403', async () => {
  const store = memoryStore(), S = site(), call = api(store, S);
  await call('POST', TICK);
  S.co('005930', '삼성전자', 66_000, D2);
  assert.deepEqual(await call('POST', {op: 'sell', code: '005930', part: 'half'}), {status: 403, body: {error: 'owner_only'}});
  assert.deepEqual(await call('POST', {op: 'sell', code: '005930', part: 'half'}, {owner: 'wrong-owner-key-000000000'}), {status: 403, body: {error: 'owner_only'}});
  assert.equal((await acct(store)).pos['005930'].q, 500, '열쇠 없이 판 것 0');
  const h = await call('POST', {op: 'sell', code: '005930', part: 'half'}, {owner: OWNER});
  assert.equal(h.status, 200); assert.deepEqual(h.body.sold, {c: '005930', q: 250, px: 66_000, d: D2});
  assert.deepEqual(h.body.acc.pos['005930'], {q: 250, cost: 15_000_000});
  const cash0 = 1e9 - 30_000_000 - 30_000_000 - 29_400_000;
  assert.equal(h.body.acc.cash, cash0 + 250 * 66_000);
  const all = await call('POST', {op: 'sell', code: '005930', part: 'all'}, {owner: OWNER});
  assert.equal(all.status, 200); assert.equal(all.body.sold.q, 250); assert.equal(all.body.acc.pos['005930'], undefined);
  assert.equal(all.body.acc.cash, cash0 + 500 * 66_000);
  assert.deepEqual((await acct(store)).log.filter(x => x.s === 's').map(x => [x.c, x.q, x.px]), [['005930', 250, 66_000], ['005930', 250, 66_000]]);
  assert.deepEqual(await call('POST', {op: 'sell', code: '005930', part: 'all'}, {owner: OWNER}), {status: 404, body: {error: 'hold'}}, '없는 주');
  assert.deepEqual(await call('POST', {op: 'sell', code: '005930', part: 'most'}, {owner: OWNER}), {status: 400, body: {error: 'part'}});
  assert.deepEqual(await call('POST', {op: 'sell', code: '5930', part: 'all'}, {owner: OWNER}), {status: 400, body: {error: 'code'}});
  // 1주는 반으로 못 나눔
  const s1 = memoryStore(); await s1.setJSON(AUTO_KEY, {...newAuto(), cash: 1e9 - 60_000, pos: {'005930': {q: 1, cost: 60_000}}, asOf: D1, top: ['반도체']});
  assert.deepEqual(await api(s1, S)('POST', {op: 'sell', code: '005930', part: 'half'}, {owner: OWNER}), {status: 400, body: {error: 'half'}});
  // 값을 못 받으면 못 팜
  S.files.set('/atlas/data/co/009540.json', 'down');
  assert.deepEqual(await call('POST', {op: 'sell', code: '009540', part: 'all'}, {owner: OWNER}), {status: 503, body: {error: 'price'}});
});

test('보기는 사장님만 — 합계 · 지금 값 · 오늘 싹 셋 · 마지막 셈', async () => {
  const store = memoryStore(), S = site(), call = api(store, S);
  assert.deepEqual(await call('GET'), {status: 403, body: {error: 'owner_only'}});
  const g0 = await call('GET', null, {owner: OWNER});
  assert.equal(g0.status, 200); assert.equal(g0.body.started, false); assert.equal(g0.body.value.total, 1e9); assert.equal(g0.body.last, null); assert.equal(g0.body.buy, 30_000_000);
  await call('POST', TICK);
  S.co('005930', '삼성전자', 66_000, D2);
  const g = await call('GET', null, {owner: OWNER});
  assert.equal(g.body.started, true); assert.deepEqual(g.body.site, {asOf: D1, top: ['반도체', '조선', '방산'], provisional: false});
  assert.deepEqual(g.body.prices['005930'], {px: 66_000, d: D2});
  assert.equal(g.body.value.total, 1e9 - 89_400_000 + 500 * 66_000 + 200 * 150_000 + 42 * 700_000);
  assert.equal(g.body.last.asOf, D1); assert.equal(g.body.last.buys.length, 3); assert.equal(g.body.acc.ticks.length, 1);
  S.files.delete('/atlas/data/co/009540.json');
  const u = await call('GET', null, {owner: OWNER});
  assert.deepEqual(u.body.value.unknown, ['009540'], '값을 못 받은 회사는 산 돈으로 셈'); assert.equal(u.body.prices['009540'], null);
});

test('요청 꼴 — 다른 주소 · JSON 아님 · 너무 큼 · 모르는 일 · 모르는 길 · 다른 방법', async () => {
  const store = memoryStore(), S = site(), call = api(store, S);
  assert.deepEqual(await call('POST', TICK, {origin: 'https://evil.example'}), {status: 403, body: {error: 'origin'}});
  assert.equal((await call('POST', TICK, {origin: 'https://aaa7377.com'})).status, 200, '같은 주소에서 부름');
  assert.deepEqual(await call('POST', 'op=tick', {type: 'text/plain'}), {status: 415, body: {error: 'type'}});
  assert.deepEqual(await call('POST', '{op', {}), {status: 400, body: {error: 'bad_json'}});
  assert.deepEqual(await call('POST', {op: 'tick', pad: 'x'.repeat(2000)}), {status: 413, body: {error: 'too_large'}});
  assert.deepEqual(await call('POST', {op: 'buy', code: '005930'}, {owner: OWNER}), {status: 400, body: {error: 'bad_op'}}, '손으로 사기는 없음');
  assert.deepEqual(await call('GET', null, {owner: OWNER, path: '/x'}), {status: 404, body: {error: 'not_found'}});
  assert.equal((await call('PUT', null)).status, 405);
  assert.equal((await call('GET', null, {owner: OWNER, path: '/'})).status, 200);
});

test('두 셈이 한꺼번에 와도 그날 한 번만(맞바꿈 쓰기)', async () => {
  const store = casStore(), S = site(), call = api(store, S);
  const rs = await Promise.all([call('POST', TICK), call('POST', TICK), call('POST', TICK)]);
  assert.deepEqual(rs.map(r => r.body.did).sort(), ['bought', 'same', 'same']);
  const a = await acct(store);
  assert.equal(a.ticks.length, 1); assert.equal(a.log.length, 3); assert.equal(a.cash, 1e9 - 89_400_000);
});

test('순수 셈 applyTick — 이미 셈한 날 · 대장주 자료가 모자라면 쓰지 않음', () => {
  const th = {asOf: D1, top: ['반도체', '조선'], provisional: false};
  assert.deepEqual(applyTick({...newAuto(), asOf: D1, top: ['반도체']}, th, {}, T0), {skip: 'same'});
  assert.deepEqual(applyTick(null, th, {'반도체': {c: '005930', px: 60_000, d: D1, n: '삼성전자'}}, T0), {skip: 'need'});
  const r = applyTick(null, th, {'반도체': {c: '005930', px: 60_000, d: D1, n: '삼성전자'}, '조선': {c: '009540', px: 150_000, d: D1, n: 'HD한국조선해양'}}, T0);
  assert.equal(r.tick.buys.length, 2); assert.equal(r.acc.at, new Date(T0).toISOString()); assert.ok(okAuto(r.acc));
});
