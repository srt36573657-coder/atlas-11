// 선물형 초대장 저장 · 읽기 — 사장님 2026-10-09 16:12(마카오 시각) 첨부 「아틀라스용 ‘카카오톡으로 보내는 선물형 초대장’ 제작 프롬프트」
// 다른 휴대폰에서도 같은 내용 · 추측하기 어려운 번호 · 주소에 메시지 없음 · 글자로만 · 기간이 지난 링크 안내를 실제 셈(lib/atlas11/invite.mjs)과 넷리파이 Blobs 로컬 서버로 본다.
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import {createHash} from 'node:crypto';
import {cleanName, cleanMessage, validateDraft, createInvite, readInvite, readPhoto, handleInvite, memoryStore, newId, ownerKeyOk, jpegSize, photoBytes, ID_RE, LIMITS, TTL_DAYS, INVITE_STORE, OWNER_KEY_SHA256} from '../../lib/atlas11/invite.mjs';

const T0 = new Date('2026-10-09T08:00:00Z');
const req = (method, url, {body, headers = {}} = {}) => new Request(url, {method, body, headers});
// 시험용 사진 열쇠(진짜 열쇠는 저장소에 없음 — 해시만) · 시험용 JPEG 뼈대(SOI · 주석 · SOF0 가로세로 · EOI)
const KEY = 'test-owner-key-0123456789abcdef', KEY_HASH = createHash('sha256').update(KEY).digest('hex');
const fakeJpeg = (w, h, pad = 2000) => {
  const sof = Buffer.from([0xFF, 0xC0, 0x00, 0x11, 0x08, h >> 8, h & 255, w >> 8, w & 255, 0x03, 1, 0x22, 0, 2, 0x11, 1, 3, 0x11, 1]);
  const com = Buffer.concat([Buffer.from([0xFF, 0xFE, (pad + 2) >> 8, (pad + 2) & 255]), Buffer.alloc(pad, 0x41)]);
  return Buffer.concat([Buffer.from([0xFF, 0xD8]), com, sof, Buffer.from([0xFF, 0xD9])]);
};
const dataUrl = buf => 'data:image/jpeg;base64,' + buf.toString('base64');

test('이름 · 메시지 다듬기: 조종 문자 · 방향 문자 지움 · 그림 문자 이음(ZWJ)은 살림 · 글자 수로 자름 · 빈 줄 둘 넘으면 하나', () => {
  assert.equal(cleanName('  김\u0000하늘‮ \n'), '김하늘');
  assert.equal(cleanName('가'.repeat(40)).length, LIMITS.name);
  assert.equal(Array.from(cleanName('😀'.repeat(30))).length, LIMITS.name, '그림 문자도 한 글자');
  assert.equal(cleanName('👨‍👩‍👧 가족'), '👨‍👩‍👧 가족');
  assert.equal(cleanName(42), '');
  assert.equal(cleanMessage('첫 줄\r\n\r\n\r\n\r\n둘째 줄  \n'), '첫 줄\n\n둘째 줄');
  assert.equal(cleanMessage(Array.from({length: 20}, (_, i) => 'L' + i).join('\n')).split('\n').length, LIMITS.lines);
  assert.equal(Array.from(cleanMessage('가'.repeat(500))).length, LIMITS.message);
  assert.equal(cleanMessage('<script>alert(1)</script>'), '<script>alert(1)</script>', '글은 그대로 두고 화면이 글자로만 그린다(HTML 로 해석하지 않음)');
});

test('받는 사람 · 보내는 사람은 꼭 · 메시지는 비어도 됨', () => {
  assert.equal(validateDraft({to: '하늘', from: '바다', message: ''}).ok, true);
  assert.deepEqual(validateDraft({to: ' ', from: '바다'}).errors.map(e => e.field), ['to']);
  assert.deepEqual(validateDraft({}).errors.map(e => e.field), ['to', 'from']);
});

test('번호: 무작위 128비트 · 22자 · 겹치면 새 번호로 다시', async () => {
  const ids = new Set(Array.from({length: 2000}, () => newId()));
  assert.equal(ids.size, 2000); assert.ok([...ids].every(id => ID_RE.test(id)));
  const store = memoryStore(); let n = 0; const fixed = ['A'.repeat(22), 'A'.repeat(22), 'B'.repeat(22)];
  const a = await createInvite(store, {to: '하늘', from: '바다'}, {now: T0, makeId: () => fixed[n++]});
  const b = await createInvite(store, {to: '별', from: '달'}, {now: T0, makeId: () => fixed[n++]});
  assert.equal(a.body.id, 'A'.repeat(22)); assert.equal(b.body.id, 'B'.repeat(22), '같은 번호는 다시 쓰지 않음');
  assert.equal((await readInvite(store, 'A'.repeat(22), {now: T0})).body.to, '하늘', '먼저 쓴 초대장은 그대로');
});

test('만들기 → 다른 기기에서 읽기: 같은 내용 · 주소에는 번호만 · 180일 뒤 「기간이 지남」 · 없는 번호 · 틀린 모양', async () => {
  const store = memoryStore();
  const c = await createInvite(store, {to: '김하늘', from: '신바다', message: '좋은 기회는 소중한 사람과\n함께 나누고 싶었습니다.'}, {now: T0});
  assert.equal(c.status, 201); assert.match(c.body.path, /^\/i\/[A-Za-z0-9_-]{22}$/);
  assert.ok(!c.body.path.includes('하늘') && !c.body.path.includes('기회'), '주소에 이름 · 메시지가 없음');
  const r = await readInvite(store, c.body.id, {now: new Date(T0.getTime() + 3600e3)});
  assert.equal(r.status, 200); assert.deepEqual([r.body.to, r.body.from, r.body.message], ['김하늘', '신바다', '좋은 기회는 소중한 사람과\n함께 나누고 싶었습니다.']);
  assert.equal(r.body.expiresAt, new Date(T0.getTime() + TTL_DAYS * 864e5).toISOString());
  assert.equal((await readInvite(store, c.body.id, {now: new Date(T0.getTime() + (TTL_DAYS + 1) * 864e5)})).status, 410);
  assert.equal((await readInvite(store, 'Z'.repeat(22), {now: T0})).status, 404);
  for (const bad of [null, '', 'abc', '../../etc', 'A'.repeat(23), 'A'.repeat(21) + '='] ) assert.equal((await readInvite(store, bad, {now: T0})).status, 400, String(bad));
});

test('요청 하나: GET 읽기 · POST 만들기(같은 사이트 · JSON · 4KB) · 그 밖 막기 · 응답은 저장 · 검색 · 주소 전달 막음', async () => {
  const store = memoryStore(), base = 'https://aaa7377.com/api/invite';
  const ok = await handleInvite(req('POST', base, {body: JSON.stringify({to: '하늘', from: '바다', message: '안녕'}), headers: {'content-type': 'application/json', origin: 'https://aaa7377.com'}}), {store, now: () => T0});
  assert.equal(ok.status, 201); const {id} = await ok.json();
  for (const [k, v] of [['cache-control', 'no-store'], ['x-robots-tag', 'noindex, nofollow, noarchive'], ['referrer-policy', 'no-referrer']]) assert.equal(ok.headers.get(k), v);
  const got = await handleInvite(req('GET', `${base}?id=${id}`), {store, now: () => T0});
  assert.equal(got.status, 200); assert.equal((await got.json()).message, '안녕');
  const post = (body, headers) => handleInvite(req('POST', base, {body, headers}), {store, now: () => T0});
  assert.equal((await post(JSON.stringify({to: 'a', from: 'b'}), {'content-type': 'application/json', origin: 'https://evil.example'})).status, 403);
  assert.equal((await post(JSON.stringify({to: 'a', from: 'b'}), {'content-type': 'text/plain'})).status, 415);
  assert.equal((await post('{', {'content-type': 'application/json'})).status, 400);
  assert.equal((await post(JSON.stringify({to: 'a', from: 'b', message: 'x'.repeat(5000)}), {'content-type': 'application/json'})).status, 413);
  assert.equal((await post(JSON.stringify({to: '', from: 'b'}), {'content-type': 'application/json'})).status, 400);
  assert.equal((await handleInvite(req('DELETE', `${base}?id=${id}`), {store})).status, 405, '고치거나 지우는 길 없음(발송 당시 내용 그대로)');
  const broken = {get: async () => { throw Error('down'); }, setJSON: async () => { throw Error('down'); }};
  const e = await handleInvite(req('GET', `${base}?id=${id}`), {store: broken});
  assert.equal(e.status, 500); assert.deepEqual(await e.json(), {error: 'server'}, '안쪽 오류 글을 밖으로 내지 않음');
});

test('사진 열쇠: 해시만 저장소에 · 맞는 열쇠만 · 길이가 이상하면 바로 아님', () => {
  assert.match(OWNER_KEY_SHA256, /^[0-9a-f]{64}$/);
  assert.equal(ownerKeyOk(KEY, KEY_HASH), true);
  assert.equal(ownerKeyOk(KEY + 'x', KEY_HASH), false);
  for (const bad of [null, undefined, 42, '', 'short', 'x'.repeat(200)]) assert.equal(ownerKeyOk(bad, KEY_HASH), false, String(bad));
  assert.equal(ownerKeyOk(KEY), false, '시험 열쇠는 진짜 열쇠가 아님');
});

test('사진 모양: JPEG 머리 · 끝 · 크기 · 가로세로(서버가 직접 읽음) · 다른 꼴은 받지 않음', () => {
  assert.deepEqual(jpegSize(fakeJpeg(880, 1100)), {w: 880, h: 1100});
  const p = photoBytes(dataUrl(fakeJpeg(880, 1100)));
  assert.deepEqual([p.w, p.h], [880, 1100]);
  assert.equal(photoBytes('data:image/png;base64,' + fakeJpeg(880, 1100).toString('base64')), null, 'JPEG 만');
  assert.equal(photoBytes(dataUrl(fakeJpeg(880, 1100)).replace('base64,', 'base64, ')), null);
  assert.equal(photoBytes(dataUrl(fakeJpeg(880, 1100, 200))), null, '너무 작음');
  assert.equal(photoBytes(dataUrl(Buffer.concat([fakeJpeg(880, 1100).subarray(0, -2), Buffer.from([0, 0])]))), null, '끝 표시 없음');
  assert.equal(photoBytes(dataUrl(fakeJpeg(3000, 2000))), null, '가장 긴 쪽 2400 넘음');
  assert.equal(photoBytes(dataUrl(fakeJpeg(2000, 400))), null, '비율 3:1 넘음');
  assert.equal(photoBytes('data:image/jpeg;base64,' + 'A'.repeat(LIMITS.photo * 2)), null, '800KB 넘음');
  assert.equal(photoBytes({}), null);
});

test('사진 초대장: 열쇠가 맞을 때만 · 글 없이 사진만 남지 않음 · 읽으면 주소와 가로세로 · 기간이 지나면 사진도 410', async () => {
  const store = memoryStore(), body = {to: '하늘', from: '바다', message: '우주에서', photo: dataUrl(fakeJpeg(880, 1100))};
  assert.deepEqual((await createInvite(store, body, {now: T0})).body, {error: 'photo_owner_only'}, '열쇠 없으면 사진을 받지 않음');
  assert.equal(store._map.size, 0, '아무것도 저장 안 됨');
  assert.equal((await createInvite(store, {...body, photo: 'data:image/jpeg;base64,AAAA'}, {now: T0, owner: true})).status, 400);
  const c = await createInvite(store, body, {now: T0, owner: true});
  assert.equal(c.status, 201); assert.equal(c.body.photo, true);
  const r = await readInvite(store, c.body.id, {now: T0});
  assert.deepEqual(r.body.photo, {src: '/api/invite?photo=' + c.body.id, w: 880, h: 1100});
  const ph = await readPhoto(store, c.body.id, {now: T0});
  assert.equal(ph.status, 200); assert.ok(Buffer.from(ph.bytes).equals(fakeJpeg(880, 1100)), '보낸 그대로');
  assert.equal((await readPhoto(store, c.body.id, {now: new Date(T0.getTime() + (TTL_DAYS + 1) * 864e5)})).status, 410);
  const plain = await createInvite(store, {to: '별', from: '달'}, {now: T0});
  assert.equal((await readInvite(store, plain.body.id, {now: T0})).body.photo, null);
  assert.equal((await readPhoto(store, plain.body.id, {now: T0})).status, 404, '사진 없는 초대장');
  assert.equal((await readPhoto(store, '../x', {now: T0})).status, 400);
  let n = 0; const ids = ['C'.repeat(22), 'C'.repeat(22), 'D'.repeat(22)];
  await createInvite(store, {to: '가', from: '나'}, {now: T0, makeId: () => ids[n++]}); // C 를 글로 먼저 차지
  const d = await createInvite(store, body, {now: T0, owner: true, makeId: () => ids[n++]});
  assert.equal(d.body.id, 'D'.repeat(22)); assert.equal(store._map.has('photo/' + 'C'.repeat(22)), false, '번호가 겹친 사진은 지움');
});

test('요청 하나 · 사진: 열쇠 머리글이 맞으면 1.1MB까지 · 아니면 4KB(큰 글은 413 · 작은 사진은 403) · 사진 응답 머리글', async () => {
  const store = memoryStore(), base = 'https://aaa7377.com/api/invite';
  const post = (body, headers = {}) => handleInvite(req('POST', base, {body: JSON.stringify(body), headers: {'content-type': 'application/json', ...headers}}), {store, now: () => T0, ownerHash: KEY_HASH});
  const big = {to: '하늘', from: '바다', photo: dataUrl(fakeJpeg(880, 1100, 60000))};
  assert.equal((await post(big)).status, 413, '열쇠 없으면 4KB');
  assert.equal((await post(big, {'x-atlas-owner': 'wrong-key-wrong-key-123'})).status, 413);
  assert.equal((await post({to: '하늘', from: '바다', photo: dataUrl(fakeJpeg(880, 1100, 1200))})).status, 403, '작은 사진도 열쇠 없으면 막음');
  const ok = await post(big, {'x-atlas-owner': KEY});
  assert.equal(ok.status, 201); const {id, photo} = await ok.json(); assert.equal(photo, true);
  const img = await handleInvite(req('GET', `${base}?photo=${id}`), {store, now: () => T0});
  assert.equal(img.status, 200); assert.equal(img.headers.get('content-type'), 'image/jpeg');
  for (const [k, v] of [['cross-origin-resource-policy', 'same-origin'], ['x-content-type-options', 'nosniff'], ['referrer-policy', 'no-referrer']]) assert.equal(img.headers.get(k), v);
  assert.match(img.headers.get('x-robots-tag'), /noimageindex/); assert.match(img.headers.get('cache-control'), /^private/);
  assert.ok(Buffer.from(await img.arrayBuffer()).equals(fakeJpeg(880, 1100, 60000)));
  assert.equal((await handleInvite(req('GET', `${base}?photo=abc`), {store})).status, 400);
});

test('넷리파이 함수 그대로(functions/atlas11/invite.mjs) + Blobs 로컬 서버: 만든 초대장을 다른 요청에서 읽음', async () => {
  const {BlobsServer} = await import('@netlify/blobs/server');
  const dir = await fs.mkdtemp(path.join(os.tmpdir(), 'atlas11-blobs-')), token = 'local-test-token';
  const server = new BlobsServer({directory: dir, token}); const {port} = await server.start();
  const edge = `http://127.0.0.1:${port}`;
  process.env.NETLIFY_BLOBS_CONTEXT = Buffer.from(JSON.stringify({edgeURL: edge, uncachedEdgeURL: edge, siteID: 'local-site', token})).toString('base64');
  try {
    const fn = (await import('../../functions/atlas11/invite.mjs')).default;
    assert.deepEqual((await import('../../functions/atlas11/invite.mjs')).config, {path: '/api/invite'});
    const made = await fn(req('POST', 'https://aaa7377.com/api/invite', {body: JSON.stringify({to: '하늘', from: '바다', message: '첫 줄\n둘째 줄'}), headers: {'content-type': 'application/json'}}));
    assert.equal(made.status, 201); const {id} = await made.json();
    const read = await fn(req('GET', `https://aaa7377.com/api/invite?id=${id}`));
    assert.equal(read.status, 200); assert.equal((await read.json()).message, '첫 줄\n둘째 줄');
    const files = []; const walk = async d => { for (const e of await fs.readdir(d, {withFileTypes: true})) e.isDirectory() ? await walk(path.join(d, e.name)) : files.push(path.join(d, e.name)); }; await walk(dir);
    assert.ok(files.some(f => f.includes(INVITE_STORE) || f.includes(id)), '저장소 이름 · 번호로 저장됨');
    // 사진: 실제 Blobs(set · get arrayBuffer · onlyIfNew)로 — 시험 열쇠 해시를 넘겨서
    const {getStore} = await import('@netlify/blobs');
    const store = getStore({name: INVITE_STORE, consistency: 'strong'}), jpg = fakeJpeg(640, 800, 30000);
    const pm = await handleInvite(req('POST', 'https://aaa7377.com/api/invite', {body: JSON.stringify({to: '하늘', from: '바다', photo: dataUrl(jpg)}), headers: {'content-type': 'application/json', 'x-atlas-owner': KEY}}), {store, ownerHash: KEY_HASH});
    assert.equal(pm.status, 201); const pid = (await pm.json()).id;
    const pr = await fn(req('GET', `https://aaa7377.com/api/invite?id=${pid}`));
    assert.deepEqual((await pr.json()).photo, {src: '/api/invite?photo=' + pid, w: 640, h: 800});
    const pi = await fn(req('GET', `https://aaa7377.com/api/invite?photo=${pid}`));
    assert.equal(pi.status, 200); assert.ok(Buffer.from(await pi.arrayBuffer()).equals(jpg), 'Blobs 에서 보낸 그대로');
    const noKey = await fn(req('POST', 'https://aaa7377.com/api/invite', {body: JSON.stringify({to: '하늘', from: '바다', photo: dataUrl(fakeJpeg(64, 80, 1100))}), headers: {'content-type': 'application/json', 'x-atlas-owner': KEY}}));
    assert.equal(noKey.status, 403, '함수는 진짜 열쇠 해시로만 — 시험 열쇠는 통하지 않음');
  } finally { delete process.env.NETLIFY_BLOBS_CONTEXT; await server.stop(); await fs.rm(dir, {recursive: true, force: true}); }
});

test('올리기 준비(deploy_netlify.mjs stageFunctions): 함수 · 부르는 저장소 파일 · 패키지만 저장소 밖 폴더로 — 그 폴더만으로 함수가 돈다', async () => {
  const {stageFunctions, FUNCTIONS_DIR} = await import('../../scripts/atlas11/deploy_netlify.mjs');
  const root = path.resolve('.'), stage = await fs.mkdtemp(path.join(os.tmpdir(), 'atlas11-fnstage-'));
  const {BlobsServer} = await import('@netlify/blobs/server');
  const dir = await fs.mkdtemp(path.join(os.tmpdir(), 'atlas11-blobs-')), token = 't2';
  const server = new BlobsServer({directory: dir, token}); const {port} = await server.start();
  try {
    const s = await stageFunctions(root, stage);
    assert.equal(s.rel, FUNCTIONS_DIR); assert.deepEqual(s.functions, ['invite']);
    assert.deepEqual(s.files, ['functions/atlas11/invite.mjs', 'lib/atlas11/invite.mjs']);
    assert.ok(s.packages.includes('@netlify/blobs') && s.packages.includes('@netlify/runtime-utils'), s.packages.join(','));
    assert.ok(!s.packages.includes('react') && !s.files.some(f => f.startsWith('netlify/')), '옛 함수 · 쓰지 않는 패키지는 옮기지 않음');
    const edge = `http://127.0.0.1:${port}`;
    process.env.NETLIFY_BLOBS_CONTEXT = Buffer.from(JSON.stringify({edgeURL: edge, uncachedEdgeURL: edge, siteID: 's', token})).toString('base64');
    const fn = (await import(path.join(stage, 'functions/atlas11/invite.mjs'))).default; // 저장소 node_modules 가 아니라 옮긴 폴더의 것으로 풀림
    const made = await fn(new Request('https://aaa7377.com/api/invite', {method: 'POST', body: JSON.stringify({to: '하늘', from: '바다'}), headers: {'content-type': 'application/json'}}));
    assert.equal(made.status, 201);
    assert.equal((await stageFunctions(root, stage, 'functions/none')), null, '함수 폴더가 없으면 함수 없이 올림');
  } finally { delete process.env.NETLIFY_BLOBS_CONTEXT; await server.stop(); await fs.rm(stage, {recursive: true, force: true}); await fs.rm(dir, {recursive: true, force: true}); }
});
