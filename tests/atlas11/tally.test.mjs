// 합계 칸 시험(lib/atlas11/tally.mjs · site/next/tally.js) — 사장님 2026-10-18(싱가포르) 16:39 「진화가 본질인 명령문」 [10] 1 ~ 6 · 일꾼 KD
//   ① 받는 몸 = {k} 하나 · 막기(다른 사이트 · 몸 크기 · 꼴 · 초당 수 · 하루 끝 수) ② 두는 것 = 서울 날짜별 숫자만(이름 · 기기 번호 · 쿠키 · 인터넷 주소 0 — 저장소 전부를 훑음)
//   ③ 읽기 = 열쇠 없이 잣대 칸 넷만 · 사장님 열쇠면 참고 칸 셋도 · 날 칸 이름 day(진화 회차 normalizeTally) ④ 채점 한 곳 judge(표본 30 · 소음 |z| < 1.96 — 설정과 같은 값)
//   ⑤ 화면 신호 tally(k) — 보내는 몸 · 쿠키 안 보냄 · 주소 안 넘김 · 자동 브라우저 0 · 연 수는 쪽마다 한 번 ⑥ 신호 자리(p-why 끝냄 · 한 달 답 · app.js 연 수)
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {createHash} from 'node:crypto';
import {handleTally, memoryStore, sumOf, add, bump, limiter, judge, seoulDay, METRIC, REF, BUMP, LIM, JUDGE, TALLY_SCHEMA} from '../../lib/atlas11/tally.mjs';

const OWNER = 'test-owner-key-0123456789', OWNER_HASH = createHash('sha256').update(OWNER).digest('hex');
const ORIGIN = 'https://aaa7377.com';
const KST = s => new Date(s + '+09:00');
const read = f => fs.readFileSync(new URL('../../' + f, import.meta.url), 'utf8');
function api(store, clock, extra = {}) {
  return async (method, path, body, {owner, origin, site, type = 'application/json', len, raw, headers = {}} = {}) => {
    const h = {...headers};
    if (type) h['content-type'] = type;
    if (owner) h['x-atlas-owner'] = owner;
    if (origin) h.origin = origin;
    if (site) h['sec-fetch-site'] = site;
    if (len != null) h['content-length'] = String(len);
    const req = new Request(ORIGIN + path, {method, headers: h, body: method === 'POST' ? (raw ?? JSON.stringify(body)) : undefined});
    const res = await handleTally(req, {store, now: () => clock.t, ownerHash: OWNER_HASH, allow: () => true, ...extra});
    const text = await res.text();
    return {status: res.status, body: text ? JSON.parse(text) : null, headers: res.headers};
  };
}

test('서울 날짜 — 15:00(UTC) 에 날이 바뀜', () => {
  assert.equal(seoulDay(Date.parse('2026-10-18T14:59:59Z')), '2026-10-18');
  assert.equal(seoulDay(Date.parse('2026-10-18T15:00:00Z')), '2026-10-19');
});

test('받기 — {k} 하나 · 함께 더하는 칸(쉬어 가자 = 끝냄 + 쉬어 가자 · 했어 = 답함 + 했어) · 참고 칸은 따로', async () => {
  const store = memoryStore(), clock = {t: KST('2026-10-19T10:00:00')}, call = api(store, clock);
  for (const k of ['stop', 'stop_rest', 'stop_rest', 'promise', 'promise_yes', 'visit', 'visit', 'share', 'signup']) assert.equal((await call('POST', '/api/tally', {k}, {origin: ORIGIN, site: 'same-origin'})).status, 204, k);
  assert.deepEqual(JSON.parse(store._map.get('m/2026-10-19').s), {stop: 3, stop_rest: 2, promise: 2, promise_yes: 1});
  assert.deepEqual(JSON.parse(store._map.get('r/2026-10-19').s), {visit: 2, share: 1, signup: 1});
  assert.deepEqual(Object.keys(BUMP).sort(), [...METRIC, ...REF].sort());
  assert.deepEqual([...METRIC], ['stop', 'stop_rest', 'promise', 'promise_yes']);
  assert.deepEqual([...REF], ['visit', 'share', 'signup']);
});

test('막기 — 다른 사이트 · 꼴 · 몸 크기 · 길 · 방법', async () => {
  const store = memoryStore(), clock = {t: KST('2026-10-19T10:00:00')}, call = api(store, clock);
  assert.equal((await call('POST', '/api/tally', {k: 'stop'}, {origin: 'https://evil.example'})).status, 403);
  assert.equal((await call('POST', '/api/tally', {k: 'stop'}, {site: 'cross-site'})).status, 403);
  assert.equal((await call('POST', '/api/tally', {k: 'stop'}, {site: 'same-site'})).status, 403);
  assert.equal((await call('POST', '/api/tally', {k: 'stop'}, {type: 'application/x-www-form-urlencoded'})).status, 415);
  assert.equal((await call('POST', '/api/tally', {k: 'stop'}, {type: 'text/plain;charset=UTF-8'})).status, 204, 'sendBeacon 꼴(글)');
  for (const b of [{k: 'nope'}, {k: 'stop', name: '홍길동'}, {k: 'stop', id: 'device-1'}, {}, [], {k: 1}]) assert.equal((await call('POST', '/api/tally', b)).status, 400, JSON.stringify(b));
  assert.equal((await call('POST', '/api/tally', null, {raw: 'k=stop'})).status, 400, 'JSON 아님');
  assert.equal((await call('POST', '/api/tally', null, {raw: JSON.stringify({k: 'stop', pad: 'x'.repeat(60)})})).status, 413, '64바이트 넘음');
  assert.equal((await call('POST', '/api/tally', {k: 'stop'}, {len: 65})).status, 413, '길이 머리글');
  assert.equal((await call('GET', '/api/tally')).status, 405);
  assert.equal((await call('POST', '/api/tally/sum', {k: 'stop'})).status, 405);
  assert.equal((await call('GET', '/api/tally/other')).status, 404);
  assert.equal(store._map.size, 1, '막힌 요청은 아무것도 세지 않음(sendBeacon 꼴 하나만)');
});

test('두는 것 — 서울 날짜별 숫자만 · 이름 · 기기 번호 · 쿠키 · 인터넷 주소 · 화면 주소 · 받은 때 0(저장소 전부를 훑음)', async () => {
  const store = memoryStore(), clock = {t: KST('2026-10-19T23:59:00')}, call = api(store, clock);
  const secret = {cookie: 'sid=cookie-secret-123', 'x-nf-client-connection-ip': '203.0.113.77', 'x-forwarded-for': '198.51.100.9', 'user-agent': 'UA-secret-browser', referer: 'https://aaa7377.com/next/#/why/005930'};
  for (const k of ['stop', 'promise_yes', 'visit']) await call('POST', '/api/tally', {k}, {headers: secret});
  clock.t = KST('2026-10-20T00:00:30'); await call('POST', '/api/tally', {k: 'stop_rest'}, {headers: secret});
  assert.deepEqual([...store._map.keys()].sort(), ['m/2026-10-19', 'm/2026-10-20', 'r/2026-10-19']);
  for (const [key, v] of store._map) {
    assert.match(key, /^[mr]\/\d{4}-\d{2}-\d{2}$/);
    const o = JSON.parse(v.s);
    for (const [c, n] of Object.entries(o)) { assert.ok([...METRIC, ...REF].includes(c), c); assert.ok(Number.isInteger(n) && n >= 0, `${c} ${n}`); }
    for (const bad of ['cookie-secret', '203.0.113', '198.51.100', 'UA-secret', '005930', 'why', 'T23', 'T00']) assert.ok(!v.s.includes(bad), `${key} 에 ${bad}`);
  }
});

test('초당 수 막기 · 하루 끝 수 · 겹쳐 쓰기(etag 맞대기)', async () => {
  const store = memoryStore(), clock = {t: KST('2026-10-19T10:00:00')};
  const lim = limiter(2), call = api(store, clock, {allow: () => lim(1000)});
  assert.equal((await call('POST', '/api/tally', {k: 'stop'})).status, 204);
  assert.equal((await call('POST', '/api/tally', {k: 'stop'})).status, 204);
  assert.equal((await call('POST', '/api/tally', {k: 'stop'})).status, 429, '같은 초 세 번째');
  const l2 = limiter(1); assert.equal(l2(5000), true); assert.equal(l2(5999), false); assert.equal(l2(6000), true);
  // 끝 수 — 세지 않고 202 · 합계에 capped
  store._map.set('m/2026-10-20', {s: JSON.stringify({stop: LIM.cap, stop_rest: 0, promise: 0, promise_yes: 0}), e: '"x"'});
  clock.t = KST('2026-10-20T10:00:00');
  const c2 = api(store, clock);
  const r = await c2('POST', '/api/tally', {k: 'stop_rest'});
  assert.equal(r.status, 202); assert.deepEqual(r.body, {counted: false, why: 'cap'});
  assert.equal(JSON.parse(store._map.get('m/2026-10-20').s).stop_rest, 0, '끝 수면 함께 더하는 칸도 안 셈');
  const s = await sumOf(store, {days: 1, now: clock.t});
  assert.equal(s.days[0].capped, true);
  // 겹쳐 쓰기 — 다섯이 한꺼번에 와도 다섯
  const s2 = memoryStore();
  const rs = await Promise.all(Array.from({length: 5}, () => add(s2, 'promise_yes', clock.t)));
  assert.deepEqual(rs.map(x => x.status), [204, 204, 204, 204, 204]);
  assert.deepEqual(JSON.parse(s2._map.get('m/2026-10-20').s), {stop: 0, stop_rest: 0, promise: 5, promise_yes: 5});
  // 계속 겹치면(여섯 번) 세었다고 하지 않음 — 503
  const stuck = {...memoryStore(), async getWithMetadata() { return {data: {stop: 1}, etag: '"old"'}; }, async setJSON() { return {modified: false}; }};
  assert.equal(await bump(stuck, 'm/x', ['stop'], METRIC), 'busy');
  assert.equal((await add(stuck, 'stop', clock.t)).status, 503);
});

test('읽기 — 열쇠 없이 잣대 칸 넷만 · 열쇠면 참고 칸도 · 날 칸 이름 day · 오래된 날부터 · 빈 날 0 · 날 수 1 ~ 200', async () => {
  const store = memoryStore(), clock = {t: KST('2026-10-19T10:00:00')}, call = api(store, clock);
  for (const k of ['stop', 'stop_rest', 'visit']) await call('POST', '/api/tally', {k});
  clock.t = KST('2026-10-21T10:00:00'); await call('POST', '/api/tally', {k: 'promise_yes'});
  const pub = await call('GET', '/api/tally/sum?days=3');
  assert.equal(pub.status, 200); assert.equal(pub.headers.get('cache-control'), 'no-store');
  assert.deepEqual(pub.body, {schema: TALLY_SCHEMA, tz: 'Asia/Seoul', to: '2026-10-21', n: 3,
    days: [{day: '2026-10-19', stop: 2, stop_rest: 1, promise: 0, promise_yes: 0}, {day: '2026-10-20', stop: 0, stop_rest: 0, promise: 0, promise_yes: 0}, {day: '2026-10-21', stop: 0, stop_rest: 0, promise: 1, promise_yes: 1}],
    total: {stop: 2, stop_rest: 1, promise: 1, promise_yes: 1}});
  assert.ok(!('ref' in pub.body) && !('refTotal' in pub.body), '열쇠 없이 참고 칸 없음');
  assert.ok(!('ref' in (await call('GET', '/api/tally/sum?days=3', null, {owner: 'wrong-key-000000000000'})).body), '틀린 열쇠');
  const own = await call('GET', '/api/tally/sum?days=3', null, {owner: OWNER});
  assert.deepEqual(own.body.refTotal, {visit: 1, share: 0, signup: 0});
  assert.deepEqual(own.body.ref.map(r => r.day), ['2026-10-19', '2026-10-20', '2026-10-21']);
  assert.equal((await call('GET', '/api/tally/sum')).body.n, LIM.defDays);
  assert.equal((await call('GET', '/api/tally/sum?days=0')).body.n, LIM.defDays);
  assert.equal((await call('GET', '/api/tally/sum?days=abc')).body.n, LIM.defDays);
  assert.equal((await call('GET', '/api/tally/sum?days=999')).body.n, 200);
  assert.equal(LIM.days, 200, '진화 회차 채점 칸(앞 · 뒤 60거래일)을 한 번에');
  // 목록을 못 받는 저장소 — 날마다 읽어 같은 답
  const noList = {...store, async list() { throw Error('list down'); }};
  assert.deepEqual(await sumOf(noList, {days: 3, now: clock.t}), await sumOf(store, {days: 3, now: clock.t}));
});

test('진화 회차가 읽는 꼴 — normalizeTally(scripts/atlas11/jinhwa/lib.mjs)가 날마다 숫자를 그대로 받음', async () => {
  const {normalizeTally} = await import('../../scripts/atlas11/jinhwa/lib.mjs');
  const store = memoryStore();
  await add(store, 'stop_rest', KST('2026-10-19T10:00:00')); await add(store, 'promise', KST('2026-10-20T10:00:00'));
  const n = normalizeTally(await sumOf(store, {days: 2, now: KST('2026-10-20T12:00:00')}));
  assert.equal(n.ok, true);
  assert.deepEqual(n.days, {'2026-10-19': {stop: 1, stop_rest: 1, promise: 0, promise_yes: 0}, '2026-10-20': {stop: 0, stop_rest: 0, promise: 1, promise_yes: 0}});
});

test('채점 한 곳 judge — 표본 30 아래 · 소음 · 맞음 · 틀림 · 몫 · 칸 길이가 다를 때', () => {
  const days = (n, row) => Array.from({length: n}, () => ({...row}));
  assert.equal(judge({rule: {num: 'stop', dir: 'up'}, before: days(10, {stop: 2}), after: days(10, {stop: 9})}).why, 'small', '앞 칸 20');
  assert.equal(judge({rule: {num: 'stop', dir: 'up'}, before: days(10, {stop: 4}), after: days(10, {stop: 5})}).why, 'noise');
  const up = judge({rule: {num: 'stop', dir: 'up'}, before: days(10, {stop: 3}), after: days(10, {stop: 6})});
  assert.deepEqual([up.ok, up.why, up.z], [true, 'ok', 3.162]);
  assert.equal(judge({rule: {num: 'stop', dir: 'down'}, before: days(10, {stop: 3}), after: days(10, {stop: 6})}).ok, false);
  const sh = judge({rule: {num: 'stop_rest', den: 'stop', dir: 'up'}, before: days(10, {stop: 10, stop_rest: 2}), after: days(10, {stop: 10, stop_rest: 5})});
  assert.equal(sh.ok, true); assert.equal(sh.a, 0.5); assert.equal(sh.b, 0.2); assert.equal(sh.sa, 100);
  assert.equal(judge({rule: {num: 'stop_rest', den: 'stop', dir: 'up'}, before: days(10, {stop: 2, stop_rest: 1}), after: days(10, {stop: 10, stop_rest: 9})}).why, 'small', '몫의 표본 = 밑수');
  const uneq = judge({rule: {num: 'stop', dir: 'up'}, before: days(20, {stop: 3}), after: days(10, {stop: 3})}); // 하루 평균은 같음
  assert.deepEqual([uneq.ok, uneq.why], [null, 'noise']);
  for (const bad of [null, {num: 'stop'}, {num: 'nope', dir: 'up'}, {num: 'stop', den: 'nope', dir: 'up'}, {num: 'stop', dir: 'zero'}]) assert.equal(judge({rule: bad, before: [], after: []}).why, 'rule');
  const cfg = JSON.parse(read('config/atlas11/jinhwa-metrics.v1.json'));
  assert.equal(cfg.judge.minSample, JUDGE.minSample, '설정 문턱 = 셈 문턱');
  assert.match(cfg.judge.noise, /1\.96/); assert.equal(JUDGE.z, 1.96);
  assert.equal(cfg.judge.scoreAfterTradingDays, 10);
  assert.deepEqual(cfg.measures.filter(m => m.counters).flatMap(m => [m.counters.total, m.counters.of]), [...METRIC]);
  assert.deepEqual(cfg.reference.counters, [...REF]);
  assert.match(cfg.server.read, /1 ~ 200/);
});

test('화면 신호 tally(k) — 몸 {k} 하나 · 쿠키 안 보냄 · 주소 안 넘김 · 자동 브라우저 0 · 연 수는 한 번', async () => {
  const sent = [], g = globalThis, keep = {navigator: Object.getOwnPropertyDescriptor(g, 'navigator'), fetch: g.fetch};
  const nav = v => Object.defineProperty(g, 'navigator', {value: v, configurable: true, writable: true});
  g.fetch = (url, init) => { sent.push({url, init}); return Promise.resolve(new Response(null, {status: 204})); };
  try {
    nav({webdriver: false});
    const T = await import('../../site/next/tally.js?a');
    assert.equal(T.tally('stop_rest'), true); assert.equal(T.tally('nope'), false); assert.equal(T.tally('visit'), true); assert.equal(T.tally('visit'), false, '연 수는 쪽마다 한 번');
    assert.equal(sent.length, 2);
    for (const s of sent) {
      assert.equal(s.url, '/api/tally'); assert.equal(s.init.method, 'POST'); assert.deepEqual(Object.keys(JSON.parse(s.init.body)), ['k']);
      assert.equal(s.init.credentials, 'omit'); assert.equal(s.init.referrerPolicy, 'no-referrer'); assert.equal(s.init.keepalive, true);
      assert.deepEqual(Object.keys(s.init.headers), ['content-type']);
    }
    assert.deepEqual(sent.map(s => JSON.parse(s.init.body).k), ['stop_rest', 'visit']);
    nav({webdriver: true}); sent.length = 0;
    const W = await import('../../site/next/tally.js?b');
    assert.equal(W.tally('stop'), false, '자동 브라우저'); assert.equal(sent.length, 0);
    g.__kkTally = 'test';
    assert.equal(W.tally('stop'), true, '검사가 신호를 볼 때만'); assert.equal(sent.length, 1);
  } finally {
    delete g.__kkTally; g.fetch = keep.fetch;
    if (keep.navigator) Object.defineProperty(g, 'navigator', keep.navigator); else delete g.navigator;
  }
});

test('신호 자리 — 매매일지 끝냄(쉬어 가자면 stop_rest) · 한 달 답(했어면 promise_yes) · 쪽 열 때 연 수 · 함수 길', async () => {
  const why = read('site/next/p-why.js'), app = read('site/next/app.js');
  assert.match(why, /import \{tally\} from '\.\/tally\.js'/);
  const fin = why.slice(why.indexOf('const finish = '), why.indexOf('const resView = '));
  assert.match(fin, /tally\(V_CODE\[J\.verdict\] === 'rest' \? 'stop_rest' : 'stop'\)/, '끝낸 순간 한 번');
  assert.equal((fin.match(/tally\(/g) ?? []).length, 1);
  const lb = why.slice(why.indexOf('async function laterBox'));
  assert.match(lb, /const ask = yes => \(\) => \{ keep\(r, yes\); tally\(yes \? 'promise_yes' : 'promise'\);/, '답한 순간 한 번');
  assert.equal((why.match(/\btally\(/g) ?? []).length, 2, 'p-why 신호는 두 줄(끝냄 · 한 달 답)');
  assert.match(app, /import\('\/next\/tally\.js'\)\.then\(m => m\.tally\('visit'\)\)/, '쪽 열 때 연 수');
  const fn = await import('../../functions/atlas11/tally.mjs');
  assert.deepEqual(fn.config.path, ['/api/tally', '/api/tally/sum']);
});
