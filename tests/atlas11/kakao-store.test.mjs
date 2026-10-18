// 카톡 서버 저장 · 셈 시험(lib/atlas11/kakao-store.mjs · 일꾼 K1d · 잣대 docs/design/godori-2026-10-18/accept/K1d.md)
// 메모리 저장소(넷리파이 Blobs 와 같은 꼴) + 끝에 넷리파이 Blobs 로컬 서버 한 벌 · 브라우저 없음
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import {createHash} from 'node:crypto';
import * as K from '../../lib/atlas11/kakao-store.mjs';

const SECRET = 'test-secret-0123456789-abcdefghij-XYZ', OWNER = 'test-owner-key-0123456789', OWNER_HASH = createHash('sha256').update(OWNER).digest('hex');
const NOW = new Date('2026-10-18T03:00:00Z');
const ID = n => 4100000000 + n; // 가짜 카카오 회원 번호
const mh = n => K.memberHash(ID(n), SECRET);
const join = (s, n, ref = null, now = NOW) => K.finishSignup(s, {mh: mh(n), ref, secret: SECRET, now});
const dump = s => s._dump().map(([k, v]) => k + '\n' + v).join('\n');
const why = (at, code = '005930', extra = {}) => ({at, asOf: '2026-10-13', code, name: '가', price: 1000, answers: Array(11).fill(0), score: 0, verdict: '좋아, 정해 둔 대로만', ...extra});
const hold = (id, extra = {}) => ({id, code: '005930', name: '가', buy: 1000, qty: 10, day: '2026-10-01', at: '2026-10-01T01:00:00.000Z', ...extra});
const verify = (s, code, o = {}) => K.verifyCode(s, code, {ownerKey: OWNER, ownerHash: OWNER_HASH, secret: SECRET, now: NOW, ...o});

test('① 회원 표 = 서버 비밀값 HMAC 43자 · 번호 꼴 · 비밀값 없으면 꺼짐', () => {
  assert.match(mh(1), K.MH_RE);
  assert.equal(mh(1), K.memberHash(String(ID(1)), SECRET), '수 · 글 같은 표');
  assert.notEqual(mh(1), mh(2));
  assert.notEqual(mh(1), K.memberHash(ID(1), SECRET + 'x'), '비밀값이 다르면 다른 표');
  for (const bad of [0, -1, 1.5, 2 ** 53, NaN, '', '0123', 'abc', '12a', null, undefined, {}, '1'.repeat(21)]) assert.throws(() => K.memberHash(bad, SECRET), TypeError, String(bad));
  assert.throws(() => K.memberHash(ID(1), 'short'), TypeError);
  assert.throws(() => K.memberHash(ID(1), undefined), TypeError);
  assert.equal(K.secretOf({}), null);
  assert.equal(K.secretOf({[K.SECRET_ENV]: 'x'.repeat(31)}), null);
  assert.equal(K.secretOf({[K.SECRET_ENV]: SECRET}), SECRET);
  assert.deepEqual([...K.DATA_KEYS], ['atlas:godori-why', 'atlas:new:sub', 'atlas:new:later', 'atlas:godori-hold']);
});

test('② 저장소 어디에도 카카오 회원 번호 · 확인 번호 글자 없음(가입 · 기록 · 소개 · 번호 · 맞대기 · 셈 뒤)', async () => {
  const s = K.memoryStore(), a = await join(s, 1);
  for (let i = 2; i <= 4; i++) await join(s, i, a.ref);
  await K.putData(s, mh(1), {[K.K_WHY]: [why('2026-10-18T01:00:00.000Z')], [K.K_LATER]: ['005930']}, {now: NOW});
  await K.bumpDaily(s, 'start', {now: NOW});
  const st = await K.memberState(s, mh(1), {secret: SECRET});
  assert.equal(st.codes.length, 1);
  assert.equal((await verify(s, st.code)).body.ok, true);
  const all = dump(s);
  for (let i = 1; i <= 4; i++) assert.ok(!all.includes(String(ID(i))), '번호 ' + i);
  assert.ok(!all.includes(st.code.replaceAll('-', '')) && !all.includes(st.code), '확인 번호 글자');
  for (const [k] of s._dump()) assert.ok(K.PREFIXES.some(p => k.startsWith(p)), '열쇠 자리 ' + k);
});

test('③ 받는 열쇠 넷 · 회원만 · GET 은 늘 넷', async () => {
  const s = K.memoryStore();
  assert.equal((await K.getData(s, mh(1))).status, 401);
  assert.equal((await K.putData(s, mh(1), {[K.K_LATER]: ['005930']})).status, 401);
  assert.equal(s._dump().length, 0, '회원 아님 — 쓴 것 0');
  await join(s, 1);
  assert.deepEqual((await K.getData(s, mh(1))).body, {data: {'atlas:godori-why': [], 'atlas:new:sub': [], 'atlas:new:later': [], 'atlas:godori-hold': []}, at: null});
  for (const body of [{'atlas:new:hist': ['005930']}, {'atlas:font': 1}, {'atlas:cal-star': []}, {x: 1}]) {
    const r = await K.putData(s, mh(1), body);
    assert.equal(r.status, 400); assert.equal(r.body.error, 'bad_key');
  }
  assert.equal((await K.putData(s, mh(1), {[K.K_SUB]: 'g:x'})).body.error, 'bad_value');
  assert.equal((await K.putData(s, mh(1), [])).body.error, 'bad_body');
  // GET 과 같은 꼴 {data: {열쇠 넷}, off} 도 받음(K1c · K2c) — data 안 · 밖의 다른 열쇠는 400
  const w = await K.putData(s, mh(1), {data: {[K.K_LATER]: ['005930'], [K.K_SUB]: ['g:a']}, off: {[K.K_SUB]: []}});
  assert.equal(w.status, 200); assert.deepEqual(w.body.data[K.K_LATER], ['005930']);
  assert.equal(K.parseDataBody(JSON.stringify({data: {[K.K_HOLD]: []}})).ok, true);
  for (const body of [{data: {'atlas:new:hist': []}}, {data: {}, [K.K_LATER]: []}, {data: [], off: {}}]) assert.equal((await K.putData(s, mh(1), body)).status, 400, JSON.stringify(body));
  assert.deepEqual((await K.getData(s, mh(1))).body.data[K.K_LATER], ['005930']);
  await K.withdrawMember(s, mh(1)); await join(s, 1);
  assert.equal((await K.putData(s, 'nope', {})).status, 400);
  assert.equal((await K.getData(s, 'nope')).status, 400);
  assert.equal(s._dump().filter(([k]) => k.startsWith('md/')).length, 0, '틀린 올리기 — 기록 0');
});

test('④ 내 돈(atlas:godori-money)은 어디에 있어도 받지 않음', async () => {
  const s = K.memoryStore();
  await join(s, 1);
  const bodies = [
    {[K.MONEY_KEY]: 10000000},
    {[K.K_WHY]: [why('2026-10-18T01:00:00.000Z', '005930', {[K.MONEY_KEY]: 5})]},
    {[K.K_HOLD]: [hold('h1', {note: 'atlas:godori-money'})]},
    {[K.K_SUB]: ['g:atlas:godori-money']},
    {off: {[K.MONEY_KEY]: []}},
  ];
  for (const b of bodies) {
    const r = await K.putData(s, mh(1), b);
    assert.equal(r.status, 400, JSON.stringify(b)); assert.equal(r.body.error, 'money');
    const p = K.parseDataBody(JSON.stringify(b));
    assert.equal(p.ok, false); assert.equal(p.error, 'money');
  }
  const esc = K.parseDataBody('{"atlas:godori\\u002dmoney": 1}'); // 글자를 숨겨 보내도
  assert.equal(esc.ok, false); assert.equal(esc.error, 'money');
  assert.ok(!dump(s).includes('godori-money'));
});

test('⑤ 합치기 — 두 기기가 따로 올려도 항목이 줄지 않음', async () => {
  const s = K.memoryStore();
  await join(s, 1);
  const A = {[K.K_WHY]: [why('2026-10-17T01:00:00.000Z'), why('2026-10-16T01:00:00.000Z', null)], [K.K_HOLD]: [hold('h1')], [K.K_SUB]: ['g:반도체'], [K.K_LATER]: ['005930']};
  const B = {[K.K_WHY]: [why('2026-10-18T01:00:00.000Z', '000660')], [K.K_HOLD]: [hold('h2', {code: '000660'})], [K.K_SUB]: ['i:전기'], [K.K_LATER]: ['000660']};
  const ra = await K.putData(s, mh(1), A, {now: NOW});
  assert.equal(ra.status, 200); assert.deepEqual(ra.body.added, {'atlas:godori-why': 2, 'atlas:new:sub': 1, 'atlas:new:later': 1, 'atlas:godori-hold': 1});
  const rb = await K.putData(s, mh(1), B, {now: NOW});
  assert.deepEqual(rb.body.added, {'atlas:godori-why': 1, 'atlas:new:sub': 1, 'atlas:new:later': 1, 'atlas:godori-hold': 1});
  const empty = await K.putData(s, mh(1), {[K.K_WHY]: [], [K.K_HOLD]: [], [K.K_SUB]: [], [K.K_LATER]: []}, {now: NOW});
  assert.equal(empty.status, 200);
  const d = (await K.getData(s, mh(1))).body.data;
  assert.deepEqual(d[K.K_WHY].map(r => r.at), ['2026-10-18T01:00:00.000Z', '2026-10-17T01:00:00.000Z', '2026-10-16T01:00:00.000Z'], '새 기록 먼저 · 줄어듦 0');
  assert.deepEqual(d[K.K_HOLD].map(r => r.id).sort(), ['h1', 'h2']);
  assert.deepEqual(d[K.K_SUB], ['i:전기', 'g:반도체']);
  assert.deepEqual(d[K.K_LATER], ['000660', '005930']);
});

test('⑥ 같은 항목 — 올린 기기 판 · 안 보낸 칸 남김 · kept · sold · wrong 은 안 지워짐', async () => {
  const s = K.memoryStore();
  await join(s, 1);
  const at = '2026-10-10T01:00:00.000Z', kept = {a: 'yes', at: '2026-10-18T02:00:00.000Z'};
  await K.putData(s, mh(1), {[K.K_WHY]: [why(at, '005930', {kept})], [K.K_HOLD]: [hold('h1', {doom: {at: 'd'}, asks: [['2026-10-17', 0]], sold: {day: '2026-10-17', price: 1200, at: 's'}}), hold('h2', {wrong: {at: 'w'}})]}, {now: NOW});
  // 옛 기기: kept 없음 · sold · wrong null · asks 칸 없음 · doom 풀림 · qty 바뀜
  const r = await K.putData(s, mh(1), {[K.K_WHY]: [why(at, '005930', {kept: null})], [K.K_HOLD]: [hold('h1', {doom: null, sold: null, qty: 4}), hold('h2', {wrong: null})]}, {now: NOW});
  assert.equal(r.status, 200);
  const d = (await K.getData(s, mh(1))).body.data, h1 = d[K.K_HOLD].find(x => x.id === 'h1'), h2 = d[K.K_HOLD].find(x => x.id === 'h2');
  assert.equal(d[K.K_WHY].length, 1);
  assert.deepEqual(d[K.K_WHY][0].kept, kept, '그날 정한 대로 — 안 지워짐');
  assert.deepEqual(h1.sold, {day: '2026-10-17', price: 1200, at: 's'}, '판 것 — 안 지워짐');
  assert.deepEqual(h2.wrong, {at: 'w'}, '잘못 적음 — 안 지워짐');
  assert.equal(h1.doom, null, '나타났어 풀림은 올린 판대로');
  assert.equal(h1.qty, 4, '올린 판대로');
  assert.deepEqual(h1.asks, [['2026-10-17', 0]], '안 보낸 칸은 남김');
  const same = await K.putData(s, mh(1), {[K.K_WHY]: [why(at, '005930', {kept: null})]}, {now: new Date(NOW.getTime() + 60e3)});
  assert.equal(same.body.at, r.body.at, '바뀐 것 없으면 안 씀');
});

test('⑦ 관심 뺌 — off 로 보낸 것만 빠짐(없으면 모두 합침)', async () => {
  const s = K.memoryStore();
  await join(s, 1);
  await K.putData(s, mh(1), {[K.K_SUB]: ['g:a', 'g:b'], [K.K_LATER]: ['005930', '000660']});
  let r = await K.putData(s, mh(1), {[K.K_SUB]: ['g:a'], [K.K_LATER]: ['005930']});
  assert.deepEqual(r.body.data[K.K_SUB], ['g:a', 'g:b'], 'off 없음 — 다시 나옴');
  r = await K.putData(s, mh(1), {[K.K_SUB]: ['g:a'], [K.K_LATER]: ['005930'], off: {[K.K_SUB]: ['g:b', 'g:none'], [K.K_LATER]: ['000660', '005930']}});
  assert.deepEqual(r.body.data[K.K_SUB], ['g:a']);
  assert.deepEqual(r.body.data[K.K_LATER], ['005930'], '같이 온 것은 남김');
  assert.deepEqual(r.body.off, {'atlas:new:sub': 1, 'atlas:new:later': 1});
  assert.equal((await K.putData(s, mh(1), {off: {[K.K_WHY]: []}})).body.error, 'bad_off');
  assert.equal((await K.putData(s, mh(1), {off: []})).body.error, 'bad_off');
  r = await K.putData(s, mh(1), {[K.K_SUB]: ['g:ok', '', 'x'.repeat(81), 5, 'g:\u0007'], [K.K_LATER]: ['00593', 'abcdef', '0001A0']});
  assert.deepEqual(r.body.skipped, {'atlas:godori-why': 0, 'atlas:new:sub': 4, 'atlas:new:later': 2, 'atlas:godori-hold': 0});
  assert.deepEqual(r.body.data[K.K_LATER], ['0001A0', '005930']);
});

test('⑧ 동시에 올린 스물 — 맞바꿈 쓰기로 모두 남음', async () => {
  const s = K.memoryStore();
  await join(s, 1);
  const rs = await Promise.all(Array.from({length: 20}, (_, i) => K.putData(s, mh(1), {[K.K_WHY]: [why(new Date(Date.UTC(2026, 9, 1, i)).toISOString())], [K.K_LATER]: [String(100000 + i)]}, {now: NOW})));
  assert.ok(rs.every(r => r.status === 200));
  const d = (await K.getData(s, mh(1))).body.data;
  assert.equal(d[K.K_WHY].length, 20); assert.equal(d[K.K_LATER].length, 20);
});

test('⑨ 크기 — 4MB · 항목 수 · 항목 크기 · 넘으면 413 + 서버 사본 그대로', async () => {
  const s = K.memoryStore();
  await join(s, 1);
  assert.deepEqual(K.parseDataBody('x'.repeat(K.LIMITS.body + 1)), {ok: false, status: 413, error: 'too_large'});
  assert.equal(K.parseDataBody('{').error, 'bad_json');
  assert.equal(K.parseDataBody(5).error, 'bad_json');
  await K.putData(s, mh(1), {[K.K_WHY]: [why('2026-10-18T01:00:00.000Z')]});
  const before = (await K.getData(s, mh(1))).body;
  const many = Array.from({length: K.LIMITS.items + 1}, (_, i) => why(new Date(Date.UTC(2020, 0, 1) + i * 60e3).toISOString()));
  const r = await K.putData(s, mh(1), {[K.K_WHY]: many});
  assert.equal(r.status, 413); assert.deepEqual(r.body, {error: 'limit', key: K.K_WHY});
  assert.equal((await K.putData(s, mh(1), {[K.K_LATER]: Array.from({length: K.LIMITS.list + 1}, (_, i) => String(100000 + i))})).status, 413);
  assert.deepEqual((await K.getData(s, mh(1))).body, before, '서버 사본 그대로');
  const big = await K.putData(s, mh(1), {[K.K_HOLD]: [hold('h9', {note: '가'.repeat(6000)})]});
  assert.equal(big.body.skipped[K.K_HOLD], 1, '한 줄 16KB 넘음 — 받지 않음');
  assert.equal((await K.getData(s, mh(1))).body.data[K.K_HOLD].length, 0);
  const noid = await K.putData(s, mh(1), {[K.K_HOLD]: [{code: '005930'}, hold('bad id!')], [K.K_WHY]: [{code: '005930'}, why('not a date')]});
  assert.deepEqual(noid.body.skipped, {'atlas:godori-why': 2, 'atlas:new:sub': 0, 'atlas:new:later': 0, 'atlas:godori-hold': 2});
  assert.throws(() => K.mergeData(null, {[K.K_SUB]: Array.from({length: K.LIMITS.list + 1}, (_, i) => 'g:' + i)}), K.LimitError);
});

test('⑩ __proto__ 꼴 열쇠 버림 · 물들임 0', async () => {
  const s = K.memoryStore();
  await join(s, 1);
  const t = K.parseDataBody('{"__proto__": {"x": 1}}');
  assert.equal(t.ok, false); assert.equal(t.error, 'bad_key');
  const p = K.parseDataBody('{"atlas:godori-hold": [{"id": "h1", "code": "005930", "__proto__": {"polluted": 1}, "constructor": {"prototype": {"polluted": 2}}, "g0": {"__proto__": {"polluted": 3}}}]}');
  assert.equal(p.ok, true);
  const r = await K.putData(s, mh(1), p.body);
  assert.equal(r.status, 200);
  const h = (await K.getData(s, mh(1))).body.data[K.K_HOLD][0];
  assert.deepEqual(Object.keys(h).sort(), ['code', 'g0', 'id']);
  assert.deepEqual(Object.keys(h.g0), []);
  assert.equal(({}).polluted, undefined);
  assert.ok(!dump(s).includes('polluted'));
});

test('⑪ 탈퇴 — 기록 · 회원 · 소개 표 · 소개 고리(양쪽) 지움 · 끊기 값 · 두 번 · 늦게 온 올리기 401', async () => {
  const s = K.memoryStore();
  const c = await join(s, 3), a = await join(s, 1, c.ref);
  await join(s, 2, a.ref);
  await K.putData(s, mh(1), {[K.K_WHY]: [why('2026-10-18T01:00:00.000Z')], [K.K_HOLD]: [hold('h1')]});
  assert.equal((await K.memberState(s, mh(3), {secret: SECRET})).friends, 1);
  const w = await K.withdrawMember(s, mh(1), {kakaoId: ID(1)});
  assert.equal(w.status, 200);
  assert.deepEqual(w.body, {ok: true, removed: true});
  assert.deepEqual(w.unlink, {target_id_type: 'user_id', target_id: String(ID(1))});
  assert.ok(!dump(s).includes(mh(1)), '그 회원 표가 남은 곳 0');
  assert.ok(!s._dump().some(([k]) => k === 'rc/' + a.ref), '소개 표 지움');
  assert.equal((await K.memberState(s, mh(3), {secret: SECRET})).friends, 0, '나를 소개한 사람 쪽 고리 지움');
  assert.deepEqual(Object.keys(JSON.parse(s._map.get('m/' + mh(2)).v)).sort(), ['ref', 'schema'], '내가 소개한 친구 쪽 by 지움');
  assert.equal(await K.memberState(s, mh(1), {secret: SECRET}), null);
  assert.equal(await K.isMember(s, mh(1)), false);
  assert.equal((await K.getData(s, mh(1))).status, 401);
  assert.equal((await K.putData(s, mh(1), {[K.K_LATER]: ['005930']})).status, 401);
  assert.ok(!s._dump().some(([k]) => k.startsWith('md/' + mh(1))), '늦게 온 올리기 — 사본 0');
  const again = await K.withdrawMember(s, mh(1));
  assert.deepEqual([again.status, again.body, again.unlink], [200, {ok: true, removed: false}, null]);
  // 올리기와 탈퇴가 겹침: 합친 사본을 쓰는 순간 회원이 지워짐 → 사본도 지우고 401
  await join(s, 5);
  const race = {...s, async setJSON(k, v, o) { const r = await s.setJSON(k, v, o); if (k === 'md/' + mh(5)) await s.delete('m/' + mh(5)); return r; }};
  const rr = await K.putData(race, mh(5), {[K.K_LATER]: ['005930']});
  assert.equal(rr.status, 401);
  assert.ok(!s._dump().some(([k]) => k === 'md/' + mh(5)));
});

test('⑫ 소개 수 — 새 회원 + 맞는 표 + 자기 아님만 · 이름 · 친구 표 없음', async () => {
  const s = K.memoryStore(), a = await join(s, 1);
  assert.match(a.ref, K.REF_RE);
  assert.deepEqual(await join(s, 2, a.ref), {isNew: true, ref: (await K.memberState(s, mh(2), {secret: SECRET})).ref, counted: true});
  assert.equal((await join(s, 2, a.ref)).counted, false, '다시 온 회원 0');
  assert.equal((await join(s, 3, 'nope')).counted, false, '틀린 꼴 0');
  assert.equal((await join(s, 4, 'AAAAAAAAAAAA')).counted, false, '없는 표 0');
  assert.equal((await join(s, 1, a.ref)).counted, false, '자기(다시 옴) 0');
  await s.setJSON('rc/SELFSELFSELF', {m: mh(6)});
  assert.equal((await join(s, 6, 'SELFSELFSELF')).counted, false, '자기 표 0');
  const st = await K.memberState(s, mh(1), {secret: SECRET});
  assert.deepEqual(st, {ref: a.ref, friends: 1, next: 3, code: null, codes: []});
  const txt = JSON.stringify(st);
  for (let i = 2; i <= 6; i++) assert.ok(!txt.includes(mh(i)), '친구 표 ' + i);
  // 동시에 같은 새 회원이 두 번 돌아와도 새 회원은 한 번
  const both = await Promise.all([join(s, 7, a.ref), join(s, 7, a.ref)]);
  assert.equal(both.filter(r => r.isNew).length, 1);
  assert.equal((await K.memberState(s, mh(1), {secret: SECRET})).friends, 2);
  await K.withdrawMember(s, mh(2));
  assert.equal((await K.memberState(s, mh(1), {secret: SECRET})).friends, 1, '나간 친구는 셈에서 빠짐');
});

test('⑬ 3명마다 확인 번호 하나 · 나갔다 다시 와도 새 번호 0 · 저장소엔 HMAC 만', async () => {
  const s = K.memoryStore(), a = await join(s, 1);
  for (let i = 2; i <= 3; i++) await join(s, i, a.ref);
  assert.equal((await K.memberState(s, mh(1), {secret: SECRET})).code, null, '2명 — 번호 없음');
  await join(s, 4, a.ref);
  let st = await K.memberState(s, mh(1), {secret: SECRET});
  assert.equal(st.codes.length, 1); assert.match(st.code, /^[A-HJKMNP-Z2-9]{4}-[A-HJKMNP-Z2-9]{4}-[A-HJKMNP-Z2-9]{4}$/);
  assert.equal(st.next, 6);
  const first = st.code;
  for (let i = 2; i <= 4; i++) await K.withdrawMember(s, mh(i));
  for (let i = 2; i <= 4; i++) await join(s, i, a.ref);
  st = await K.memberState(s, mh(1), {secret: SECRET});
  assert.equal(st.friends, 3); assert.equal(st.codes.length, 1, '같은 셋이 다시 와도 새 번호 0'); assert.equal(st.code, first);
  for (let i = 5; i <= 7; i++) await join(s, i, a.ref);
  st = await K.memberState(s, mh(1), {secret: SECRET});
  assert.equal(st.codes.length, 2); assert.equal(st.code, st.codes[1]); assert.notEqual(st.codes[0], st.codes[1]); assert.equal(st.next, 9);
  const all = dump(s);
  for (const c of st.codes) assert.ok(!all.includes(c.replaceAll('-', '')), '번호 글자 0');
  assert.equal(s._dump().filter(([k]) => k.startsWith('cv/')).length, 2);
  // 나간 뒤에도 번호 장부는 남아 사장님이 맞대 봄(사람과 이어진 값 없음)
  await K.withdrawMember(s, mh(1));
  assert.equal((await verify(s, first)).body.ok, true);
  assert.ok(s._dump().filter(([k]) => k.startsWith('cv/')).every(([, v]) => Object.keys(JSON.parse(v)).every(x => ['k', 'at', 'used'].includes(x))));
});

test('⑭ 맞대기 — 사장님 열쇠만 · 처음 used:false → 다음 used:true · 없는 번호 ok:false', async () => {
  const s = K.memoryStore(), a = await join(s, 1);
  for (let i = 2; i <= 4; i++) await join(s, i, a.ref);
  const code = (await K.memberState(s, mh(1), {secret: SECRET})).code;
  assert.equal((await K.verifyCode(s, code, {secret: SECRET})).status, 403);
  assert.equal((await K.verifyCode(s, code, {ownerKey: 'wrong-key-0123456789', ownerHash: OWNER_HASH, secret: SECRET})).status, 403);
  assert.equal((await K.verifyCode(s, code, {ownerKey: OWNER, secret: SECRET})).status, 403, '기본 열쇠 해시(진짜 사장님 열쇠)와 다름');
  const peek = await verify(s, code, {mark: false});
  assert.deepEqual([peek.body.ok, peek.body.used], [true, false]);
  const r1 = await verify(s, code.toLowerCase().replaceAll('-', ' '));
  assert.equal(r1.status, 200); assert.deepEqual([r1.body.ok, r1.body.used], [true, false]); assert.equal(r1.body.usedAt, NOW.toISOString());
  const r2 = await verify(s, code);
  assert.deepEqual([r2.body.ok, r2.body.used, r2.body.usedAt], [true, true, NOW.toISOString()]);
  assert.deepEqual((await verify(s, 'ABCD-EFGH-JKMN')).body, {ok: false, used: false});
  assert.deepEqual((await verify(s, 'nope')).body, {ok: false, used: false});
  assert.deepEqual((await verify(s, 'O0I1-L000-0000')).body, {ok: false, used: false});
  // 같은 새 번호를 동시에 다섯 번 — 처음은 하나만
  for (let i = 5; i <= 7; i++) await join(s, i, a.ref);
  const code2 = (await K.memberState(s, mh(1), {secret: SECRET})).code;
  const rs = await Promise.all(Array.from({length: 5}, () => verify(s, code2)));
  assert.equal(rs.filter(r => r.body.ok && !r.body.used).length, 1);
  assert.equal(rs.filter(r => r.body.ok && r.body.used).length, 4);
});

test('⑮ 날마다 두 수 — 서울 날짜 · start · done 숫자만 · 다시 온 회원 0 · 동시 50번', async () => {
  const s = K.memoryStore();
  for (let i = 0; i < 3; i++) await K.bumpDaily(s, 'start', {now: NOW});
  const a = await join(s, 1);
  await join(s, 2, a.ref);
  await join(s, 1); // 다시 옴
  assert.deepEqual(JSON.parse(s._map.get('d/2026-10-18').v), {start: 3, done: 2});
  assert.equal(K.seoulDate(Date.parse('2026-10-18T14:59:59Z')), '2026-10-18');
  assert.equal(K.seoulDate(Date.parse('2026-10-18T15:00:00Z')), '2026-10-19');
  await K.bumpDaily(s, 'done', {now: new Date('2026-10-18T15:00:00Z')});
  assert.deepEqual(await K.dailyCounts(s, {days: 3, now: new Date('2026-10-18T15:00:00Z')}), [{date: '2026-10-19', start: 0, done: 1}, {date: '2026-10-18', start: 3, done: 2}, {date: '2026-10-17', start: 0, done: 0}]);
  assert.deepEqual(await K.bumpDaily(s, 'other', {now: NOW}), {ok: false});
  const t = K.memoryStore();
  const rs = await Promise.all(Array.from({length: 50}, () => K.bumpDaily(t, 'start', {now: NOW})));
  assert.ok(rs.every(r => r.ok));
  assert.deepEqual(JSON.parse(t._map.get('d/2026-10-18').v), {start: 50, done: 0});
  for (const [k, v] of s._dump().filter(([k]) => k.startsWith('d/'))) {
    assert.match(k, /^d\/\d{4}-\d{2}-\d{2}$/);
    assert.deepEqual(Object.keys(JSON.parse(v)).sort(), ['done', 'start'], '사람 표 · 시각 없음');
  }
  const broken = {...t, async setJSON() { throw new Error('down'); }};
  assert.equal((await K.bumpDaily(broken, 'start', {now: NOW})).ok, false, '저장소가 죽어도 던지지 않음');
});

test('⑯ 넷리파이 Blobs 로컬 서버에서도 같게 돎(맞바꿈 쓰기 · 합치기 · 소개 · 탈퇴)', async t => {
  let blobs = null, dir = null;
  try {
    dir = await fs.mkdtemp(path.join(os.tmpdir(), 'kakao-store-blobs-'));
    const {BlobsServer} = await import('@netlify/blobs/server');
    blobs = new BlobsServer({directory: dir, token: 'dev'});
    const {port} = await blobs.start();
    process.env.NETLIFY_BLOBS_CONTEXT = Buffer.from(JSON.stringify({edgeURL: `http://127.0.0.1:${port}`, uncachedEdgeURL: `http://127.0.0.1:${port}`, siteID: 'dev', token: 'dev'})).toString('base64');
  } catch (e) {
    t.skip('Blobs 로컬 서버를 못 띄움: ' + e.message);
    return;
  }
  try {
    const {getStore} = await import('@netlify/blobs');
    const s = getStore({name: K.KAKAO_STORE, consistency: 'strong'});
    const a = await join(s, 1);
    for (let i = 2; i <= 4; i++) assert.equal((await join(s, i, a.ref)).counted, true);
    const st = await K.memberState(s, mh(1), {secret: SECRET});
    assert.equal(st.friends, 3); assert.equal(st.codes.length, 1);
    for (let i = 0; i < 3; i++) assert.equal((await K.putData(s, mh(1), {data: {[K.K_WHY]: [why(new Date(Date.UTC(2026, 9, 1, i)).toISOString())]}}, {now: NOW})).status, 200);
    // 다른 기기가 읽기와 쓰기 사이에 끼어듦(이 서버는 읽기에 etag 를 안 줌 → list etag) — 맞바꿈이 걸려 다시 읽고 둘 다 남아야 함
    // (로컬 Blobs 서버의 조건 쓰기는 확인과 쓰기 사이가 끊겨 있어 진짜 동시 요청 시험은 메모리 저장소 ⑧ ⑭ ⑮ 에서 함)
    let cut = true;
    const sly = {list: o => s.list(o), getWithMetadata: (k, o) => s.getWithMetadata(k, o), setJSON: (k, v, o) => s.setJSON(k, v, o), delete: k => s.delete(k),
      async get(k, o) {
        const v = await s.get(k, o);
        if (cut && k === 'md/' + mh(1)) { cut = false; await s.setJSON(k, {...v, data: {...v.data, [K.K_WHY]: [why('2026-10-05T00:00:00.000Z'), ...v.data[K.K_WHY]]}}); }
        return v;
      }};
    assert.equal((await K.putData(sly, mh(1), {[K.K_LATER]: ['005930']}, {now: NOW})).status, 200);
    assert.equal(cut, false, '끼어든 쓰기가 실제로 일어남');
    const d = (await K.getData(s, mh(1))).body.data;
    assert.deepEqual([d[K.K_WHY].length, d[K.K_LATER]], [4, ['005930']], '끼어든 기록 + 내 기록 모두');
    for (let i = 0; i < 3; i++) assert.equal((await K.bumpDaily(s, 'start', {now: NOW})).n, i + 1);
    assert.deepEqual((await K.dailyCounts(s, {days: 1, now: NOW}))[0], {date: '2026-10-18', start: 3, done: 4});
    const v1 = await verify(s, st.code), v2 = await verify(s, st.code);
    assert.deepEqual([v1.body.used, v2.body.used], [false, true]);
    await K.withdrawMember(s, mh(1), {kakaoId: ID(1)});
    const keys = (await s.list()).blobs.map(b => b.key);
    assert.ok(!keys.some(k => k.includes(mh(1))), '탈퇴 뒤 그 회원 표 0');
    assert.equal((await K.memberState(s, mh(2), {secret: SECRET})).friends, 0);
  } finally {
    await blobs?.stop();
    if (dir) await fs.rm(dir, {recursive: true, force: true});
  }
});
