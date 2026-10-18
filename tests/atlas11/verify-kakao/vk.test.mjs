// VK — 카톡 가입 서버를 만든 일꾼이 아닌 일꾼(VK)이 따로 잰다 · 2026-10-18 · 사장님 order-0015 [2] · [3] · [4] · [11] 2-4 · [12] 2-3
//   돌리기: node --test tests/atlas11/verify-kakao/vk.test.mjs   (tests/atlas11/*.test.mjs 묶음에는 안 들어감 — 폴더가 다름)
//   찾은 것(고칠 것)은 {todo: 'VK-Fn …'} 로 둔다 — 지금 틀려도 전체를 빨갛게 만들지 않음 · 고치면 todo 를 떼고 그대로 통과해야 함
//   설명은 docs/design/godori-2026-10-18/review/VK.md
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import {execFileSync} from 'node:child_process';
import {createHash, randomBytes} from 'node:crypto';
import {handleKakao, cleanTo, withMark, COOKIE, ROUTES, STATE_SEC} from '../../../lib/atlas11/kakao.mjs';
import {memoryStore, memberHash, dailyCounts, isMember} from '../../../lib/atlas11/kakao-store.mjs';
import {createFakeKakao} from '../fake-kakao/fake.mjs';

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), '../../..');
const SITE = 'https://aaa7377.com', AUTH = 'https://kauth.kakao.com', API = 'https://kapi.kakao.com';
const ENVV = Object.freeze({ATLAS_KAKAO_REST_KEY: 'vkREST-0123456789abcdefghijkl', ATLAS_KAKAO_CLIENT_SECRET: 'vkSECRET-0123456789abcdefghijkl', ATLAS_KAKAO_ADMIN_KEY: 'vkADMIN-0123456789abcdefghijkl', ATLAS_KAKAO_HASH_SECRET: 'vkHASH-0123456789abcdefghijklmnopqrstuvwxyz'});
const OWNER = 'vk-owner-key-0123456789', OWNER_HASH = createHash('sha256').update(OWNER).digest('hex');
const T0 = Date.parse('2026-10-18T03:30:00Z');
const SAME = {origin: SITE, 'sec-fetch-site': 'same-origin'};
const JSON_SAME = {...SAME, 'content-type': 'application/json'};
const mhOf = id => memberHash(id, ENVV.ATLAS_KAKAO_HASH_SECRET);
const fakeUserOf = req => req.headers.get('x-fake-user') ?? /(?:^|;\s*)fk_user=(\d+)/.exec(req.headers.get('cookie') ?? '')?.[1] ?? null;

/** 판 — 메모리 저장소 · 가짜 카카오 · realKakao = 진짜 카카오처럼 이미 동의한 사람은 일반 시작에서도 동의 화면 없이 code 를 줌(가짜는 늘 화면을 보임) */
function rig({on = true, env = ENVV, realKakao = false, store = memoryStore()} = {}) {
  const fake = createFakeKakao({restKey: env.ATLAS_KAKAO_REST_KEY, clientSecret: env.ATLAS_KAKAO_CLIENT_SECRET, adminKey: env.ATLAS_KAKAO_ADMIN_KEY});
  let clock = T0, unlinkFail = false, fetches = 0;
  const kakaoHandle = async req => {
    const u = new URL(req.url);
    if (realKakao && u.pathname === '/oauth/authorize' && !u.searchParams.get('prompt') && fake.users.get(fakeUserOf(req) ?? '')?.consented) {
      u.searchParams.set('prompt', 'none'); return fake.handle(new Request(u, {headers: req.headers}));
    }
    return fake.handle(req);
  };
  const logs = [], seen = [];
  const deps = {config: {on}, store, log: l => logs.push(l), now: () => new Date(clock), ownerHash: OWNER_HASH,
    fetch: async (u, init) => { fetches++; if (unlinkFail && String(u).endsWith('/v1/user/unlink')) return new Response('{"msg":"down"}', {status: 503}); return kakaoHandle(new Request(u, init)); }};
  async function call(req) {
    const r = await handleKakao(req, env, deps);
    seen.push({url: req.url, status: r.status, setCookies: r.headers.getSetCookie(), headers: [...r.headers].map(([k, v]) => k + ': ' + v).join('\n'), body: await r.clone().text()});
    return r;
  }
  return {store, fake, logs, seen, deps, call, kakaoHandle, tick: ms => { clock += ms; }, failUnlink: v => { unlinkFail = v; }, fetches: () => fetches, tokenCalls: () => fake.calls.filter(c => c.path === '/oauth/token').length};
}
/** 브라우저 흉내 — 집마다 쿠키 · 302 따라감 · 우리 화면(/api 밖)에 닿으면 멈춤 */
function browser(R, {kakaoUser = null} = {}) {
  const jars = new Map(), jar = o => { if (!jars.has(o)) jars.set(o, new Map()); return jars.get(o); };
  const keep = (origin, list) => { for (const sc of list) { const [nv, ...attrs] = sc.split(';'), i = nv.indexOf('='), name = nv.slice(0, i).trim(), value = nv.slice(i + 1).trim(); if (attrs.some(a => /^\s*max-age=0\s*$/i.test(a))) jar(origin).delete(name); else jar(origin).set(name, value); } };
  async function one(href, init = {}) {
    const u = new URL(href), h = new Headers(init.headers ?? {}), ck = [...jar(u.origin)].map(([k, v]) => `${k}=${v}`).join('; ');
    if (ck) h.set('cookie', ck);
    if (kakaoUser && u.origin === AUTH) h.set('x-fake-user', kakaoUser);
    let r;
    if (u.origin === SITE && u.pathname.startsWith('/api/kakao/')) r = await R.call(new Request(href, {...init, headers: h}));
    else if (u.origin === AUTH || u.origin === API) r = await R.kakaoHandle(new Request(href, {...init, headers: h}));
    else return null;
    keep(u.origin, r.headers.getSetCookie());
    return r;
  }
  async function go(href, init) {
    const steps = []; let cur = href;
    for (let i = 0; i < 12; i++) {
      const r = await one(cur, i ? {} : init);
      if (!r) { steps.push({url: cur, site: true}); return {final: cur, steps}; }
      const loc = r.headers.get('location'), html = /text\/html/.test(r.headers.get('content-type') ?? '');
      steps.push({url: cur, status: r.status, ours: new URL(cur).origin === SITE, html, loc});
      if (r.status >= 300 && r.status < 400 && loc) { cur = new URL(loc, cur).href; continue; }
      return {final: cur, steps, status: r.status, html: html ? await r.text() : null};
    }
    throw Error('redirect loop');
  }
  return {go, api: (p, init) => one(SITE + p, init), jar, cookie: n => jar(SITE).get(n)};
}
const agreeHref = (html, base, id = 'agree') => new URL(new RegExp(`id="${id}" href="([^"]+)"`).exec(html)[1].replace(/&amp;/g, '&'), base).href;
const card = (to, ref, extra = '') => `${SITE}/api/kakao/start?to=${encodeURIComponent(to)}${ref ? '&ref=' + ref : ''}${extra}`;
async function signup(b, url) { const f = await b.go(url); assert.ok(f.html?.includes('id="agree"'), 'consent page'); return b.go(agreeHref(f.html, f.final)); }
const meOf = async b => (await b.api('/api/kakao/me')).json();
const lastUser = R => String([...R.fake.users.keys()].at(-1));
/** 모든 저장소 조작을 세는 저장소(던지기 선택) */
function countingStore(inner = memoryStore(), {throws = false} = {}) {
  let n = 0;
  const wrap = f => async (...a) => { n++; if (throws) throw Error('store touched'); return f(...a); };
  return {get: wrap(inner.get), getWithMetadata: wrap(inner.getWithMetadata), set: wrap(inner.set), setJSON: wrap(inner.setJSON), delete: wrap(inner.delete), list: wrap(inner.list), _dump: inner._dump, ops: () => n};
}

/* ── 1 꺼짐 ── */
test('VK1 꺼짐 — on≠true · 열쇠 하나 없음/짧음 → 모든 길(이상한 이름 포함) × 여섯 방법 404 · 쿠키 0 · 저장소 0 · 카카오 0', async () => {
  const names = [...Object.keys(ROUTES), 'constructor', '__proto__', 'toString', 'valueOf', 'START', 'start/x', '..%2Fstart', ''];
  const variants = [{on: false}, {on: 'true'}, {on: 1}, {on: true, env: {...ENVV, ATLAS_KAKAO_ADMIN_KEY: '  '}}, {on: true, env: {...ENVV, ATLAS_KAKAO_HASH_SECRET: 'x'.repeat(31)}}, {on: true, env: {}}];
  let n = 0;
  for (const v of variants) {
    const store = countingStore(), R = rig({...v, store});
    for (const name of names) for (const method of ['GET', 'POST', 'PUT', 'DELETE', 'HEAD', 'OPTIONS']) {
      const r = await R.call(new Request(`${SITE}/api/kakao/${name}?to=%23%2F&code=c&state=s&user_id=1`, {method, headers: {...SAME, authorization: 'KakaoAK ' + ENVV.ATLAS_KAKAO_ADMIN_KEY, 'x-atlas-owner': OWNER, cookie: `${COOKIE.state}=x; ${COOKIE.login}=y`}}));
      assert.equal(r.status, 404, `${JSON.stringify(v.on)} ${name} ${method}`); assert.equal(r.headers.getSetCookie().length, 0); n++;
    }
    assert.equal(store.ops(), 0, '저장소 손댐 0'); assert.equal(R.fetches(), 0, '카카오 부름 0');
  }
  const R = rig();
  for (const name of ['constructor', '__proto__', 'toString', 'START', 'start/x']) assert.equal((await R.call(new Request(`${SITE}/api/kakao/${name}`))).status, 404, '켜져 있어도 모르는 길 404 ' + name);
  assert.ok(n >= 400);
});

test('VK2 꺼짐 — 올리기 준비(stageFunctions)에 카톡 셈 파일이 하나도 안 실림(편지 함수가 부르는 것 포함)', {todo: 'VK-F1 functions/atlas11/letter.mjs:11-14 dynamic import → lib/atlas11/kakao*.mjs staged while switch off (kakao.test.mjs:129 red)'}, async () => {
  const {stageFunctions} = await import('../../../scripts/atlas11/deploy_netlify.mjs');
  const cfg = JSON.parse(await fs.readFile(path.join(ROOT, 'config/atlas11/kakao.json'), 'utf8'));
  assert.equal(cfg.on, false, '저장소의 스위치는 꺼짐');
  const out = await fs.mkdtemp(path.join(os.tmpdir(), 'vk-stage-'));
  try {
    const s = await stageFunctions(ROOT, out);
    assert.deepEqual(s.functions, ['invite', 'letter']);
    assert.deepEqual(s.files.filter(f => /kakao/i.test(f)), [], '꺼져 있으면 카톡 셈 파일 0');
  } finally { await fs.rm(out, {recursive: true, force: true}); }
});

test('VK3 보안 머리말 — 열쇠 없으면 HEADER_TOP · kakaoHeaderTop() 이 커밋된 판과 한 바이트도 같음 · package.mjs 의 CSP 줄 바뀜 0 · 공유 열쇠 빈칸', async () => {
  const head = execFileSync('git', ['show', 'HEAD:scripts/atlas11/site_headers.mjs'], {cwd: ROOT, encoding: 'utf8'});
  const tmp = path.join(os.tmpdir(), `vk-headers-${process.pid}-${Date.now()}.mjs`);
  await fs.writeFile(tmp, head);
  try {
    const a = await import(tmp), b = await import('../../../scripts/atlas11/site_headers.mjs');
    assert.equal(b.HEADER_TOP, a.HEADER_TOP);
    assert.equal(Buffer.compare(Buffer.from(b.kakaoHeaderTop().head), Buffer.from(a.HEADER_TOP)), 0);
    for (const o of [{}, {share: false, login: false}, {login: true}, {share: 1}, {share: 'true'}]) assert.equal(b.kakaoHeaderTop(o).head, a.HEADER_TOP, JSON.stringify(o));
  } finally { await fs.rm(tmp, {force: true}); }
  const diff = execFileSync('git', ['diff', 'HEAD', '--', 'scripts/atlas11/package.mjs', 'scripts/atlas11/next/build_data.mjs'], {cwd: ROOT, encoding: 'utf8'});
  assert.ok(!/^[+-](?![+-]).*(Content-Security-Policy|script-src|connect-src|form-action|HEADER_TOP|kakao)/mi.test(diff), 'CSP 를 쓰는 줄 바뀜 0');
  const inv = JSON.parse(await fs.readFile(path.join(ROOT, 'config/atlas11/invite.json'), 'utf8'));
  assert.equal(inv.kakao?.key ?? '', ''); assert.equal(inv.kakao?.integrity ?? '', '');
});

/* ── 2 돌아갈 쪽(열린 리디렉트) ── */
const okTo = r => {
  if (typeof r !== 'string' || !r.startsWith('/') || r.startsWith('//') || /[\\\s\u0000-\u001f\u007f]/.test(r)) return false;
  const u = new URL(r, SITE);
  return u.origin === SITE && (u.pathname === '/' || u.pathname.startsWith('/next/') || /^\/[A-Za-z0-9_-]+\.html$/.test(u.pathname));
};
const EVIL = ['https://evil.com', 'http://evil.com', '//evil.com', '///evil.com', '////evil.com', '/\\evil.com', '/\\/evil.com', '/%5Cevil.com', '/%2F%2Fevil.com', '/%2f/evil.com',
  '/next/..//evil.com', '/next/%2e%2e//evil.com', '/next/%2E%2E/%2e%2e//evil.com', '/next/.%2e//evil.com', '/next/../..//evil.com/next/', '/./..//evil.com', '/next/..\\..\\evil.com',
  'javascript:alert(1)', 'JaVaScRiPt:alert(1)', ' javascript:alert(1)', 'java\tscript:alert(1)', 'data:text/html,<script>alert(1)</script>', 'vbscript:x', '\t//evil.com', '/\t/evil.com', '/\n/evil.com',
  '/next/\r\nLocation: https://evil.com', '/next/%0d%0aSet-Cookie:%20x=1', 'https:evil.com', 'https:/evil.com', 'https:\\\\evil.com', '/next/@evil.com', '/@evil.com', '/next/#@evil.com', '#//evil.com', '#/\\evil.com',
  '#/s/1"><script>alert(1)</script>', "#/s/1'onerror='x", '／／evil.com', '/next/／evil.com', ' //evil.com', '/next/?next=https://evil.com', '/api/kakao/withdraw', '/api/kakao/start?to=//evil.com', '/.netlify/functions/kakao',
  '/next/../api/kakao/withdraw', '/next/%2e%2e/api/kakao/withdraw', '/next/..%2fapi/kakao/withdraw', 'http://aaa7377.com.evil.com/', 'https://aaa7377.com@evil.com/', '//aaa7377.com/', 'https://aaa7377.com/next/#/s/1',
  '/next/' + 'a'.repeat(600), '%2F%2Fevil.com', '%23/s/1', '/next/%00', '/next/\u0000/evil', '..//evil.com', '?to=//evil.com', '/next?x=//evil.com'];
test('VK4 돌아갈 쪽 — 나쁜 값 ' + EVIL.length + '개 · 무작위 20,000개 모두 우리 집 쪽(/ · /next/… · /이름.html)만 · 카카오 다녀와도 같음', async () => {
  for (const v of EVIL) { const r = cleanTo(v); assert.ok(okTo(r), `cleanTo(${JSON.stringify(v)}) = ${JSON.stringify(r)}`); assert.ok(okTo(withMark(r, 'ok')), 'withMark ' + v); }
  const TOK = ['/', '\\', '.', '..', '%2e', '%2E', '%2f', '%2F', '%5c', '%5C', '@', ':', '#', '?', '&', '=', 'evil.com', 'next', 'javascript:', 'https:', '//', 'a', '%', '%0a', '%00', ' ', '\t', '#/', 'api', 'kakao', '.html', 'x'];
  let seed = 7; const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return seed % n; };
  for (let i = 0; i < 20000; i++) {
    let s = rnd(3) === 0 ? '#/' : rnd(2) ? '/' : '';
    for (let k = 1 + rnd(8); k > 0; k--) s += TOK[rnd(TOK.length)];
    const r = cleanTo(s); assert.ok(okTo(r) && okTo(withMark(r, 'none')), `cleanTo(${JSON.stringify(s)}) = ${JSON.stringify(r)}`);
  }
  // 끝까지(시작 → 카카오 동의 → 돌아옴): Location 은 늘 「/」로 시작하는 우리 집 길 · 끝 주소의 집 = 우리 사이트
  const R = rig();
  for (const v of EVIL.slice(0, 40)) {
    const b = browser(R), end = await signup(b, card(v));
    const cb = end.steps.find(s => s.ours && new URL(s.url).pathname === '/api/kakao/callback');
    assert.equal(cb.status, 302); assert.ok(okTo(cb.loc), `callback Location ${cb.loc} for ${JSON.stringify(v)}`);
    assert.equal(new URL(end.final).origin, SITE);
  }
});

/* ── 3 표(state) ── */
test('VK5 표(state) — 다름 · 없음 · 끝남 · 앞날 · 꼴 틀림 · 너무 큼 → 403 · 증표 바꿈 0 · 회원 0 · 로그인 쿠키 0', async () => {
  const R = rig();
  const atk = R.fake.seed('4277777777');
  const code = () => { const c = 'vk' + randomBytes(12).toString('hex'); R.fake.codes.set(c, {id: atk, redirect_uri: SITE + '/api/kakao/callback', used: false}); return c; };
  const s43 = randomBytes(32).toString('base64url');
  const ck = o => `${COOKIE.state}=${Buffer.from(JSON.stringify(o)).toString('base64url')}`;
  const good = {s: s43, to: '/next/#/', ref: null, p: 0};
  const cases = [
    ['쿠키 없음', `state=${s43}`, ''],
    ['state 없음', '', ck({...good, t: T0})],
    ['다른 표', `state=${randomBytes(32).toString('base64url')}`, ck({...good, t: T0})],
    ['10분 지남', `state=${s43}`, ck({...good, t: T0 - STATE_SEC * 1000 - 1})],
    ['앞날 표', `state=${s43}`, ck({...good, t: T0 + 120e3})],
    ['p=2', `state=${s43}`, ck({...good, p: 2, t: T0})],
    ['s 꼴 틀림', `state=abc`, ck({...good, s: 'abc', t: T0})],
    ['ref 꼴 틀림', `state=${s43}`, ck({...good, ref: '<script>', t: T0})],
    ['쿠키 너무 큼', `state=${s43}`, ck({...good, t: T0, pad: 'x'.repeat(3000)})],
    ['쿠키 JSON 아님', `state=${s43}`, `${COOKIE.state}=${'%%%'}`],
    ['state 두 번(앞 것이 다름)', `state=${randomBytes(32).toString('base64url')}&state=${s43}`, ck({...good, t: T0})],
    ['카카오 오류 + 표 다름', `state=${randomBytes(32).toString('base64url')}&error=access_denied`, ck({...good, t: T0})],
  ];
  for (const [name, q, cookie] of cases) {
    const r = await R.call(new Request(`${SITE}/api/kakao/callback?code=${code()}&${q}`, {headers: cookie ? {cookie} : {}}));
    assert.equal(r.status, 403, name);
    assert.ok(!r.headers.getSetCookie().some(c => c.startsWith(COOKIE.login + '=') && !c.includes('Max-Age=0')), name + ' 로그인 쿠키 0');
    const html = await r.text();
    assert.ok(!/<script|<input|<form|style=|\son[a-z]+=/i.test(html), name + ' 403 쪽은 글과 고리 하나뿐');
    assert.match(r.headers.get('content-security-policy') ?? '', /default-src 'none'/);
  }
  assert.equal(R.tokenCalls(), 0, '증표 바꿈 0'); assert.equal(R.store._dump().filter(([k]) => k.startsWith('m/') || k.startsWith('s/')).length, 0);
});

test('VK6 표는 한 번만 — 같은 표 쿠키 · 표로 두 번째 돌아오면 막음(서버가 쓴 표를 기억)', {todo: 'VK-F4 state is single-use only on the browser side (cookie cleared); a replayed cookie+state within 10 min is accepted with a new code'}, async () => {
  const R = rig(), b = browser(R);
  const f = await b.go(card('#/s/1'));
  const stCookie = b.cookie(COOKIE.state), state = new URL(f.steps[1].url).searchParams.get('state');
  const first = await b.go(agreeHref(f.html, f.final));
  assert.equal(first.final, `${SITE}/next/?kakao=ok#/s/1`);
  const atk = R.fake.seed('4288888888'), c = 'vkreplay' + randomBytes(8).toString('hex');
  R.fake.codes.set(c, {id: atk, redirect_uri: SITE + '/api/kakao/callback', used: false});
  const r = await R.call(new Request(`${SITE}/api/kakao/callback?code=${c}&state=${state}`, {headers: {cookie: `${COOKIE.state}=${stCookie}`}}));
  assert.equal(r.status, 403, '두 번째 같은 표');
});

/* ── 4 쿠키 · 새는 것 ── */
test('VK7 쿠키 — 모든 Set-Cookie 가 __Host- · Path=/ · HttpOnly · Secure · SameSite=Lax · Domain 없음 · 몸에 증표 0 · CORS 머리글 0 · me 열쇠 여섯', async () => {
  const R = rig();
  const a = browser(R); await signup(a, card('#/s/1'));
  const ref = (await meOf(a)).ref;
  const b = browser(R); await signup(b, card('#/s/2', ref));
  await b.api('/api/kakao/data', {method: 'PUT', headers: JSON_SAME, body: JSON.stringify({data: {'atlas:new:later': ['000660']}})});
  await b.api('/api/kakao/data');
  await R.call(new Request(SITE + '/api/kakao/me', {headers: {cookie: `${COOKIE.login}=bad.cookie`}}));
  await R.call(new Request(SITE + '/api/kakao/data', {headers: {cookie: `${COOKIE.login}=${'A'.repeat(43)}.${'B'.repeat(43)}`}}));
  const d = browser(R), f = await d.go(card('#/')); await d.go(agreeHref(f.html, f.final, 'deny'));
  await b.api('/api/kakao/withdraw', {method: 'POST', headers: SAME});
  const all = R.seen.flatMap(x => x.setCookies);
  assert.ok(all.length >= 8);
  for (const c of all) {
    assert.match(c, /^__Host-kk_(login|state)=/, c);
    for (const flag of [/; Path=\/(;|$)/, /; HttpOnly(;|$)/, /; Secure(;|$)/, /; SameSite=Lax(;|$)/]) assert.match(c, flag, c);
    assert.ok(!/domain=/i.test(c), 'Domain 없음 ' + c);
  }
  const tokens = all.filter(c => c.startsWith(COOKIE.login + '=') && !c.includes('Max-Age=0')).map(c => c.split(';')[0].slice(COOKIE.login.length + 1));
  const states = all.filter(c => c.startsWith(COOKIE.state + '=') && !c.includes('Max-Age=0')).map(c => c.split(';')[0].slice(COOKIE.state.length + 1));
  for (const x of R.seen) {
    for (const t of tokens) { assert.ok(!x.body.includes(t.split('.')[1]), '몸에 로그인 증표 없음'); assert.ok(!x.body.includes(t.split('.')[0]), '몸에 회원 표 없음'); }
    for (const s of states) assert.ok(!x.body.includes(s), '몸에 표 쿠키 없음');
    assert.ok(!/access-control-allow/i.test(x.headers), 'CORS 머리글 없음');
    if (/\/api\/kakao\/(me|data|withdraw|counts|verify)/.test(x.url)) assert.match(x.headers, /cache-control: no-store/);
  }
  const me = await meOf(a);
  assert.deepEqual(Object.keys(me).sort(), ['code', 'friends', 'member', 'next', 'on', 'ref']);
  for (const s of [...Object.values(ENVV), ...R.fake.users.keys()]) for (const x of [...R.seen.map(y => y.body + y.headers.replace(/^location: https:\/\/kauth\.kakao\.com\/oauth\/authorize\?.*$/m, '')), ...R.logs]) assert.ok(!x.includes(s), '비밀 · 번호 새지 않음');
});

/* ── 5 회원 기록(data) ── */
test('VK8 회원 기록 — 열쇠 넷만 · 내 돈(어디에 · 어떤 꼴로도) 400 · 크기 거짓 413 · 항목 1001 413 · 같은 사이트만 · 가입 안 함 401', async () => {
  const R = rig(), a = browser(R); await signup(a, card('#/'));
  const put = (body, headers = JSON_SAME) => a.api('/api/kakao/data', {method: 'PUT', headers, body: typeof body === 'string' ? body : JSON.stringify(body)});
  const bad400 = [
    {data: {'atlas:godori-money': [1]}}, {'atlas:godori-money': [1]}, {data: {'atlas:godori-why': [{at: '2026-10-18T01:00:00Z', code: '005930', 'atlas:godori-money': 5}]}},
    {data: {'atlas:godori-hold': [{id: 'h1', note: 'atlas:godori-money'}]}}, {data: {}, off: {'atlas:godori-money': []}}, {data: {'atlas:font': ['x']}}, {data: {'atlas:new:sub': 'x'}},
    {__proto__x: 1}, {data: {constructor: []}}, {data: {'atlas:new:sub': []}, off: {'atlas:godori-why': []}}, [1, 2], 'null', '"x"', '{"data":', '{"__proto__":{"polluted":1},"data":{}}',
    '{"data":{"atlas:godori-hold":[{"id":"h1","x":"atlas:godori\\u002dmoney"}]}}', '{"data":{"atlas:godori\\u002dmoney":[1]}}'];
  for (const b of bad400) { const r = await put(b); assert.equal(r.status, 400, JSON.stringify(b)); }
  assert.equal(({}).polluted, undefined, '프로토타입 오염 없음');
  assert.equal((await put('x'.repeat(4 * 1024 * 1024 + 1), {...JSON_SAME, 'content-length': '10'})).status, 413, 'content-length 거짓');
  const later = Array.from({length: 1001}, (_, i) => String(100000 + i));
  assert.equal((await put({data: {'atlas:new:later': later}})).status, 413);
  for (const h of [{origin: SITE, 'sec-fetch-site': 'same-site', 'content-type': 'application/json'}, {'sec-fetch-site': 'cross-site', 'content-type': 'application/json'}, {origin: 'https://aaa7377.com.evil.com', 'content-type': 'application/json'}, {origin: 'null', 'content-type': 'application/json'}])
    assert.equal((await put({data: {}}, h)).status, 403, JSON.stringify(h));
  assert.equal((await put({data: {}}, {...SAME, 'content-type': 'text/plain'})).status, 415);
  assert.equal((await put({data: {'atlas:new:later': ['005930']}})).status, 200);
  const nob = browser(R);
  assert.equal((await nob.api('/api/kakao/data', {method: 'PUT', headers: JSON_SAME, body: '{"data":{}}'})).status, 401);
  assert.equal((await nob.api('/api/kakao/data')).status, 401);
  const dump = JSON.stringify(R.store._dump());
  assert.ok(!dump.includes('godori-money') && !dump.includes('polluted'));
});

/* ── 6 탈퇴 ── */
test('VK9 탈퇴 — 그 회원의 열쇠 · 값 어디에도 회원 표 · 소개 표 · 번호 0 · 친구 by 지움 · 소개해 준 사람 고리 지움 · 로그인 둘 0 · 연결 끊기 1번(어드민 열쇠)', async () => {
  const R = rig();
  const grand = browser(R); await signup(grand, card('#/'));
  const gref = (await meOf(grand)).ref;
  const boss = browser(R); await signup(boss, card('#/', gref));
  const bossId = lastUser(R), mh = mhOf(bossId), bref = (await meOf(boss)).ref;
  for (let i = 0; i < 3; i++) await signup(browser(R), card('#/s/1', bref));
  const me = await meOf(boss); assert.equal(me.friends, 3); assert.ok(me.code);
  await boss.api('/api/kakao/data', {method: 'PUT', headers: JSON_SAME, body: JSON.stringify({data: {'atlas:godori-why': [{at: '2026-10-18T01:00:00.000Z', code: '005930', kept: true}], 'atlas:new:sub': ['반도체'], 'atlas:new:later': ['005930'], 'atlas:godori-hold': [{id: 'h1', code: '005930'}]}})});
  const dev2 = browser(R, {kakaoUser: bossId}); await dev2.go(card('#/', null, '&prompt=none'));
  assert.equal((await meOf(dev2)).member, true);
  const w = await boss.api('/api/kakao/withdraw', {method: 'POST', headers: SAME});
  assert.deepEqual(await w.json(), {ok: true, removed: true, unlinked: true});
  const dump = R.store._dump();
  for (const [k, v] of dump) for (const s of [mh, bref, bossId]) assert.ok(!k.includes(s) && !v.includes(s), `남은 것 ${k} = ${v.slice(0, 80)}`);
  assert.equal((await meOf(grand)).friends, 0, '소개해 준 사람 쪽 고리도 지움');
  const un = R.fake.calls.filter(c => c.path === '/v1/user/unlink');
  assert.equal(un.length, 1); assert.equal(un[0].auth, 'kakaoak'); assert.deepEqual(un[0].form, {target_id_type: 'user_id', target_id: bossId});
  assert.equal((await meOf(dev2)).member, false);
  assert.equal(dump.filter(([k]) => k.startsWith('s/')).length, 4, '남은 로그인 = 다른 회원 넷(grand · 친구 셋)뿐');
});

test('VK10 탈퇴 — 편지 여는 밤 회원 기록에 붙인 카카오 회원 표도 뗌([4] 8 로 붙인 것)', {todo: 'VK-F2 lib/atlas11/letter.mjs:128 detachKakao() is never called from kakao withdraw/unlinked — letter m/<id>.kakao keeps the member hash'}, async () => {
  const {join, mintCode, memoryStore: letterMem} = await import('../../../lib/atlas11/letter.mjs');
  const R = rig(), a = browser(R); await signup(a, card('#/'));
  const mh = mhOf(lastUser(R)), ls = letterMem();
  const code = await mintCode(ls, 'owner', new Date(T0).toISOString());
  const j = await join(ls, {code, nick: '가나다라'}, new Date(T0), {kakao: mh});
  assert.equal(j.status, 201);
  assert.ok(JSON.stringify(await Promise.all(((await ls.list({prefix: 'm/'})).blobs).map(b => ls.get(b.key, {type: 'json'})))).includes(mh), '붙음');
  await a.api('/api/kakao/withdraw', {method: 'POST', headers: SAME});
  const after = JSON.stringify(await Promise.all(((await ls.list({prefix: 'm/'})).blobs).map(b => ls.get(b.key, {type: 'json'}))));
  assert.ok(!after.includes(mh), '탈퇴 뒤 편지 기록에 카카오 회원 표 0');
});

test('VK11 탈퇴 — 카카오 연결 끊기가 안 되면 「탈퇴됨」으로 답하지 않음(화면이 다시 누르게) · 서버 사본과 카카오 연결이 함께 남거나 함께 지워짐', {todo: 'VK-F3 lib/atlas11/kakao.mjs:228-232 deletes first, then unlink; on unlink failure answers 200 ok → site/next/kakao.js:247 reports success'}, async () => {
  const R = rig(), a = browser(R); await signup(a, card('#/'));
  const id = lastUser(R);
  R.failUnlink(true);
  const w = await a.api('/api/kakao/withdraw', {method: 'POST', headers: SAME});
  const body = await w.json();
  assert.equal(R.fake.users.get(id).consented, true, '카카오 연결은 남음');
  assert.ok(!(w.ok && body.ok === true), '연결이 남았는데 「됐다」로 답하지 않음');
});

test('VK12 탈퇴 실패 뒤(진짜 카카오처럼 동의 화면 생략) 남의 쪽이 띄운 시작으로 조용히 다시 가입 · 소개 수 올리기 없음', {todo: 'VK-F3 follow-on: Kakao link survives a failed unlink → a third-party navigation to /api/kakao/start?ref=<attacker> re-creates the member with no consent screen and credits the referral'}, async () => {
  const R = rig({realKakao: true});
  const atkB = browser(R); await signup(atkB, card('#/'));
  const atkRef = (await meOf(atkB)).ref;
  const v = browser(R); await signup(v, card('#/'));
  const vid = lastUser(R);
  R.failUnlink(true); await v.api('/api/kakao/withdraw', {method: 'POST', headers: SAME}); R.failUnlink(false);
  assert.equal(await isMember(R.store, mhOf(vid)), false);
  const forced = await browser(R, {kakaoUser: vid}).go(card('#/s/x', atkRef)); // 남의 쪽이 띄운 꼭대기 이동 · 누름 0
  assert.ok(forced.steps.every(s => !s.html), '화면 0(동의 화면도 없음)');
  assert.equal(await isMember(R.store, mhOf(vid)), false, '동의 화면 없이 다시 가입되지 않음');
  assert.equal((await meOf(atkB)).friends, 0, '소개 수 오르지 않음');
});

test('VK13 연결 끊기 알림 — 대표 어드민 열쇠(KakaoAK) 머리글만 · 틀리면 401 · 저장소 손댐 0 · 맞으면 그 회원 지움', async () => {
  const store = countingStore(), R = rig({store}), a = browser(R); await signup(a, card('#/'));
  const id = lastUser(R), mh = mhOf(id), q = `user_id=${id}&app_id=1234567&referrer_type=UNLINK_FROM_APPS`;
  const tries = [{}, {authorization: 'KakaoAK wrong'}, {authorization: 'kakaoak ' + ENVV.ATLAS_KAKAO_ADMIN_KEY}, {authorization: 'KakaoAK  ' + ENVV.ATLAS_KAKAO_ADMIN_KEY}, {authorization: 'Bearer ' + ENVV.ATLAS_KAKAO_ADMIN_KEY},
    {authorization: ENVV.ATLAS_KAKAO_ADMIN_KEY}, {authorization: 'KakaoAK ' + ENVV.ATLAS_KAKAO_REST_KEY}, {authorization: 'KakaoAK ' + ENVV.ATLAS_KAKAO_CLIENT_SECRET}, {authorization: 'KakaoAK ' + ENVV.ATLAS_KAKAO_ADMIN_KEY.slice(0, -1)}, {'x-kakao-admin': ENVV.ATLAS_KAKAO_ADMIN_KEY}];
  const before = store.ops();
  for (const h of tries) {
    assert.equal((await R.call(new Request(`${SITE}/api/kakao/unlinked?${q}&admin_key=${ENVV.ATLAS_KAKAO_ADMIN_KEY}`, {headers: h}))).status, 401, JSON.stringify(h));
    assert.equal((await R.call(new Request(`${SITE}/api/kakao/unlinked`, {method: 'POST', headers: {...h, 'content-type': 'application/x-www-form-urlencoded'}, body: q}))).status, 401);
  }
  assert.equal(store.ops(), before, '틀린 알림은 저장소를 안 만짐');
  assert.equal(await isMember(R.store ?? store, mh), true);
  const ok = await R.call(new Request(`${SITE}/api/kakao/unlinked`, {method: 'POST', headers: {authorization: 'KakaoAK ' + ENVV.ATLAS_KAKAO_ADMIN_KEY, 'content-type': 'application/json'}, body: JSON.stringify({app_id: 1234567, user_id: Number(id), referrer_type: 'UNLINK_FROM_APPS'})}));
  assert.equal(ok.status, 200);
  assert.equal(await isMember(store, mh), false);
  assert.equal((await meOf(a)).member, false);
});

/* ── 7 사장님 열쇠 ── */
test('VK14 /counts · /verify — 사장님 열쇠 머리글만 · 없음 · 틀림 · 짧음 · 김 · 주소에 넣음 → 403 · 저장소를 만지기 전에 막음 · 답에 사람 표 0', async () => {
  const throwing = countingStore(memoryStore(), {throws: true}), R0 = rig({store: throwing});
  const bad = [{}, {'x-atlas-owner': 'wrong-owner-key-000000'}, {'x-atlas-owner': 'short'}, {'x-atlas-owner': 'x'.repeat(200)}, {authorization: 'Bearer ' + OWNER}, {'x-atlas-owner': OWNER_HASH}];
  for (const h of bad) for (const p of ['/api/kakao/counts?days=3', `/api/kakao/verify?code=ABCD-EFGH-JKMN&owner=${OWNER}&key=${OWNER}`]) {
    const r = await R0.call(new Request(SITE + p, {headers: h}));
    assert.equal(r.status, 403, p + ' ' + JSON.stringify(h)); assert.deepEqual(await r.json(), {error: 'owner_only'});
  }
  assert.equal(throwing.ops(), 0, '열쇠가 틀리면 저장소 손댐 0');
  const R = rig(), boss = browser(R); await signup(boss, card('#/'));
  const ref = (await meOf(boss)).ref;
  for (let i = 0; i < 3; i++) await signup(browser(R), card('#/s/1', ref));
  const code = (await meOf(boss)).code;
  const v = await (await R.call(new Request(`${SITE}/api/kakao/verify?code=${encodeURIComponent(code.toLowerCase())}`, {headers: {'x-atlas-owner': OWNER}}))).json();
  assert.equal(v.ok, true); for (const k of Object.keys(v)) assert.ok(['ok', 'used', 'at', 'usedAt'].includes(k), k);
  const c = await (await R.call(new Request(`${SITE}/api/kakao/counts?days=99999`, {headers: {'x-atlas-owner': OWNER}}))).json();
  assert.equal(c.days.length, 400); for (const d of c.days) assert.deepEqual(Object.keys(d).sort(), ['date', 'done', 'start']);
  assert.ok(!JSON.stringify(c).includes(mhOf(lastUser(R))));
});

/* ── 8 소개 수 · 셈 둘 · 막무가내 ── */
test('VK15 소개 수 — 한 카카오 계정이 나갔다 다시 와도(다섯 번) 소개 수 · 번호가 늘지 않음 · 조용한 시작의 ref 는 버림 · 다른 셋이 함께 있어야 번호', async () => {
  const R = rig(), boss = browser(R); await signup(boss, card('#/'));
  const ref = (await meOf(boss)).ref;
  const f = browser(R); await signup(f, card('#/s/1', ref));
  const fid = lastUser(R);
  for (let i = 0; i < 5; i++) {
    assert.equal((await (await f.api('/api/kakao/withdraw', {method: 'POST', headers: SAME})).json()).unlinked, true);
    const again = browser(R, {kakaoUser: fid}); await signup(again, card('#/s/1', ref));
    const m = await meOf(boss); assert.equal(m.friends, 1); assert.equal(m.code, null);
    Object.assign(f, again);
  }
  const ghost = R.fake.seed('4266666666');
  await browser(R, {kakaoUser: ghost}).go(card('#/s/1', ref, '&prompt=none'));
  assert.equal(await isMember(R.store, mhOf(ghost)), false); assert.equal((await meOf(boss)).friends, 1);
  for (let i = 0; i < 2; i++) await signup(browser(R), card('#/s/1', ref));
  const m = await meOf(boss); assert.equal(m.friends, 3); assert.match(m.code, /^[A-Z2-9]{4}-[A-Z2-9]{4}-[A-Z2-9]{4}$/);
  const [day] = await dailyCounts(R.store, {days: 1, now: new Date(T0)});
  assert.equal(day.done, 1 + 1 + 5 + 2, '「가입 마친 수」는 다시 온 다섯 번도 셈(참고)');
});

test('VK16 막무가내 — 시작 300번 · 가짜 돌아옴 100번: 가입 마친 수 0 · 회원 0 · 증표 바꿈 0', async () => {
  const R = rig();
  for (let i = 0; i < 300; i++) await R.call(new Request(card('#/s/1', 'AAAAAAAAAAAA'), {headers: {'user-agent': 'Mozilla/5.0 (Linux; Android 14) curl-like'}}));
  for (let i = 0; i < 50; i++) await R.call(new Request(`${SITE}/api/kakao/callback?code=x${i}&state=${randomBytes(32).toString('base64url')}`));
  for (let i = 0; i < 50; i++) { const s = randomBytes(32).toString('base64url'); await R.call(new Request(`${SITE}/api/kakao/callback?code=x${i}&state=${s}`, {headers: {cookie: `${COOKIE.state}=${randomBytes(40).toString('base64url')}`}})); }
  const [day] = await dailyCounts(R.store, {days: 1, now: new Date(T0)});
  assert.equal(day.done, 0); assert.equal(day.start, 300, '시작 누른 수는 300(봇이 올릴 수 있음 — 참고)');
  assert.equal(R.store._dump().filter(([k]) => /^(m|s|md|rc|f|rf)\//.test(k)).length, 0); assert.equal(R.tokenCalls(), 0);
});

test('VK17 시작 누른 수 — 다른 사이트의 그림 · 숨은 요청(sec-fetch-mode no-cors · dest image)은 사람 누름으로 안 셈', {todo: 'VK-F6 lib/atlas11/kakao.mjs:156-157 counts any GET incl. cross-site <img>/<script> subresource loads'}, async () => {
  const R = rig();
  for (const h of [{'sec-fetch-mode': 'no-cors', 'sec-fetch-dest': 'image', 'sec-fetch-site': 'cross-site'}, {'sec-fetch-mode': 'no-cors', 'sec-fetch-dest': 'script', 'sec-fetch-site': 'cross-site'}, {'sec-fetch-mode': 'cors', 'sec-fetch-dest': 'empty', 'sec-fetch-site': 'cross-site'}])
    await R.call(new Request(card('#/'), {headers: h}));
  await R.call(new Request(card('#/'), {headers: {'sec-fetch-mode': 'navigate', 'sec-fetch-dest': 'document', 'sec-fetch-site': 'cross-site'}}));
  const [day] = await dailyCounts(R.store, {days: 1, now: new Date(T0)});
  assert.equal(day.start, 1, '꼭대기 이동 한 번만');
});

test('VK18 조용한 시작(prompt=none) — 동의만 있고 회원 아님 · 로그인 없음 · 동의 없음 → 회원 0 · 셈 0 · 그 쪽으로 kakao=none', async () => {
  const R = rig();
  const consented = R.fake.seed('4255555555'), fresh = R.fake.seed('4244444444', {consented: false});
  for (const u of [consented, fresh, null]) {
    const r = await browser(R, {kakaoUser: u}).go(card('#/s/005930/x', 'AAAAAAAAAAAA', '&prompt=none'));
    assert.equal(r.final, `${SITE}/next/?kakao=none#/s/005930/x`); assert.ok(r.steps.every(s => !s.html));
  }
  assert.equal(R.store._dump().filter(([k]) => /^(m|s|rc)\//.test(k)).length, 0);
  const [day] = await dailyCounts(R.store, {days: 1, now: new Date(T0)}); assert.deepEqual([day.start, day.done], [0, 0]);
});
