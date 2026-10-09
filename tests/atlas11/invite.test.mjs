// 선물형 초대장 저장 · 읽기 — 사장님 2026-10-09 16:12(마카오 시각) 첨부 「아틀라스용 ‘카카오톡으로 보내는 선물형 초대장’ 제작 프롬프트」
// 다른 휴대폰에서도 같은 내용 · 추측하기 어려운 번호 · 주소에 메시지 없음 · 글자로만 · 기간이 지난 링크 안내를 실제 셈(lib/atlas11/invite.mjs)과 넷리파이 Blobs 로컬 서버로 본다.
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import {cleanName, cleanMessage, validateDraft, createInvite, readInvite, handleInvite, memoryStore, newId, ID_RE, LIMITS, TTL_DAYS, INVITE_STORE} from '../../lib/atlas11/invite.mjs';

const T0 = new Date('2026-10-09T08:00:00Z');
const req = (method, url, {body, headers = {}} = {}) => new Request(url, {method, body, headers});

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
