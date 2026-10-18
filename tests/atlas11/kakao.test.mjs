// 고도리 카톡 가입 서버(lib/atlas11/kakao.mjs) — 가짜 카카오(tests/atlas11/fake-kakao/fake.mjs)로 여섯 길 + 새는 것 0 · 셈 둘 · 소개 수(새 회원만) · 스위치 · 보안 머리말
//   사장님 2026-10-18 00:15 order-0015 [3] 9 「가짜 카카오 서버로 여섯 길을 시험하라」 · [11] 2 「우리 쪽 누름 수를 재라. 카드 단추 1 + 동의 1 = 2. 우리 화면에서 더 누를 것 0」
//   돌리기: node --test tests/atlas11/kakao.test.mjs
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import {createHash} from 'node:crypto';
import {handleKakao, cleanTo, withMark, keysOf, switchOn, ENV, COOKIE, ROUTES, DEFAULTS, LOGIN_DAYS, STATE_SEC, KAKAO_WAIT_MS, kakaoMemberOf} from '../../lib/atlas11/kakao.mjs';
import {memoryStore, memberHash, dailyCounts, isMember, KAKAO_STORE} from '../../lib/atlas11/kakao-store.mjs';
import {createFakeKakao} from './fake-kakao/fake.mjs';

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), '../..');
const SITE = 'https://aaa7377.com', AUTH = 'https://kauth.kakao.com', API = 'https://kapi.kakao.com';
const ENVV = Object.freeze({ATLAS_KAKAO_REST_KEY: 'restKEY0aaaaaaaaaaaaaaaaaaaaaaaa', ATLAS_KAKAO_CLIENT_SECRET: 'clientSECRET0bbbbbbbbbbbbbbbbbbbbb', ATLAS_KAKAO_ADMIN_KEY: 'adminKEY0cccccccccccccccccccccccc', ATLAS_KAKAO_HASH_SECRET: 'hashSECRET0dddddddddddddddddddddddddddddd'});
const OWNER = 'testowner-key-1234567890', OWNER_HASH = createHash('sha256').update(OWNER).digest('hex');
const T0 = Date.parse('2026-10-18T03:00:00Z');
const SAME = {origin: SITE, 'sec-fetch-site': 'same-origin'};
const RESULT = {}; // 끝에 한 줄로 냄(보고 숫자)

/** 판 하나 — 메모리 저장소 · 가짜 카카오 · 우리 응답과 기록을 모두 모음 */
function rig({on = true, env = ENVV} = {}) {
  const store = memoryStore();
  const fake = createFakeKakao({restKey: env.ATLAS_KAKAO_REST_KEY, clientSecret: env.ATLAS_KAKAO_CLIENT_SECRET, adminKey: env.ATLAS_KAKAO_ADMIN_KEY});
  const logs = [], seen = [], kakaoFetch = [];
  let clock = T0;
  const deps = {config: {on}, store, log: l => logs.push(l), now: () => new Date(clock), ownerHash: OWNER_HASH,
    fetch: async (u, init) => { kakaoFetch.push({url: String(u), init}); return fake.fetch(u, init); }};
  async function call(req) {
    const r = await handleKakao(req, env, deps);
    seen.push({url: req.url, status: r.status, headers: [...r.headers].map(([k, v]) => `${k}: ${v}`).join('\n'), setCookies: r.headers.getSetCookie(), body: await r.clone().text()});
    return r;
  }
  return {store, fake, logs, seen, kakaoFetch, deps, call, env, tick: ms => { clock += ms; }};
}

/** 브라우저 흉내 — 집(origin)마다 쿠키 · 302 따라감 · 우리 사이트 쪽(/api 밖)에 닿으면 멈춤(그 쪽 = 화면) · 카카오 집은 가짜 카카오로 */
function browser(R, {kakaoUser = null} = {}) {
  const jars = new Map(), jar = o => { if (!jars.has(o)) jars.set(o, new Map()); return jars.get(o); };
  const keep = (origin, list) => {
    for (const sc of list) {
      const [nv, ...attrs] = sc.split(';'), i = nv.indexOf('='), name = nv.slice(0, i).trim(), value = nv.slice(i + 1).trim();
      const age = attrs.map(a => a.trim()).find(a => /^max-age=/i.test(a));
      if (age && Number(age.split('=')[1]) <= 0) jar(origin).delete(name); else jar(origin).set(name, value);
    }
  };
  async function one(href, init = {}) {
    const u = new URL(href), h = new Headers(init.headers ?? {}), ck = [...jar(u.origin)].map(([k, v]) => `${k}=${v}`).join('; ');
    if (ck) h.set('cookie', ck);
    if (kakaoUser && u.origin === AUTH) h.set('x-fake-user', kakaoUser);
    const req = new Request(href, {...init, headers: h});
    let r;
    if (u.origin === SITE && u.pathname.startsWith('/api/kakao/')) r = await R.call(req);
    else if (u.origin === AUTH || u.origin === API) r = await R.fake.handle(req);
    else return null; // 우리 사이트 화면 · 그 밖
    keep(u.origin, r.headers.getSetCookie());
    return r;
  }
  /** 누름 하나(주소 열기) — 302 를 따라가 화면(카카오 동의 화면 · 우리 쪽)에서 멈춤 · steps = 거친 응답 */
  async function go(href, init) {
    const steps = [];
    let cur = href;
    for (let i = 0; i < 12; i++) {
      const r = await one(cur, i === 0 ? init : {});
      if (!r) { steps.push({url: cur, screen: 'site'}); return {final: cur, steps}; }
      const loc = r.headers.get('location'), html = /text\/html/.test(r.headers.get('content-type') ?? '');
      steps.push({url: cur, status: r.status, ours: new URL(cur).origin === SITE, html});
      if (r.status >= 300 && r.status < 400 && loc) { cur = new URL(loc, cur).href; continue; }
      return {final: cur, steps, status: r.status, html: html ? await r.text() : null};
    }
    throw Error('302 이 너무 많음');
  }
  const api = (p, init = {}) => one(SITE + p, init);
  return {go, api, jar, cookie: name => jar(SITE).get(name)};
}
const agreeHref = (html, base, id = 'agree') => new URL(new RegExp(`id="${id}" href="([^"]+)"`).exec(html)[1].replace(/&amp;/g, '&'), base).href;
const cardUrl = (to, ref) => `${SITE}/api/kakao/start?to=${encodeURIComponent(to)}${ref ? '&ref=' + ref : ''}`;
/** 카드 단추(누름 1) → 카카오 동의(누름 2) → 보낸 쪽 — {taps, extra, end, first, second} */
async function signup(b, url, {action = 'agree'} = {}) {
  const first = await b.go(url); // 누름 1
  assert.equal(new URL(first.final).origin, AUTH, '누름 1 뒤 곧바로 카카오 동의 화면');
  assert.ok(first.html?.includes('id="agree"'), '카카오 동의 화면');
  const second = await b.go(agreeHref(first.html, first.final, action)); // 누름 2
  const ourScreens = [...first.steps, ...second.steps].filter(s => s.ours && (s.html || (s.status >= 200 && s.status < 300))).length;
  return {taps: 2, extra: ourScreens, end: second.final, first, second};
}
async function meOf(b) { const r = await b.api('/api/kakao/me'); assert.equal(r.status, 200); return r.json(); }
const mhOf = id => memberHash(id, ENVV.ATLAS_KAKAO_HASH_SECRET);
const keysIn = (store, prefix) => store._dump().map(([k]) => k).filter(k => k.startsWith(prefix));

test('길 ⑥ 꺼짐 — 스위치 꺼짐 · 열쇠 하나라도 없음 · 모르는 길: 모든 길 × 방법 404 · 저장소 · 카카오 손댐 0', async () => {
  const variants = [{on: false, env: ENVV}, {on: 'true', env: ENVV}, ...Object.values(ENV).map(n => ({on: true, env: {...ENVV, [n]: ''}})), {on: true, env: {...ENVV, ATLAS_KAKAO_HASH_SECRET: 'short'}}];
  let n = 0;
  for (const v of variants) {
    const R = rig(v);
    for (const route of [...Object.keys(ROUTES), 'nope', '']) for (const method of ['GET', 'POST', 'PUT', 'DELETE']) {
      const r = await R.call(new Request(`${SITE}/api/kakao/${route}?to=%23%2F&code=x&state=y`, {method, headers: {...SAME, cookie: `${COOKIE.state}=x; ${COOKIE.login}=y`}}));
      assert.equal(r.status, 404, `${JSON.stringify(v.on)} ${route} ${method}`); n++;
      assert.equal(r.headers.getSetCookie().length, 0);
    }
    assert.equal(R.store._dump().length, 0, '저장소 손댐 0');
    assert.equal(R.fake.calls.length + R.kakaoFetch.length, 0, '카카오 부름 0');
  }
  assert.equal(switchOn({on: true}, ENVV), true); assert.equal(switchOn({on: false}, ENVV), false); assert.equal(keysOf({}), null);
  // 넷리파이 함수 그대로(환경 값 없음) → 404 · 경로는 /api/kakao/*
  const saved = Object.fromEntries(Object.values(ENV).map(k => [k, process.env[k]]));
  for (const k of Object.values(ENV)) delete process.env[k];
  try {
    const mod = await import('../../functions/atlas11/kakao.mjs');
    assert.deepEqual(mod.config, {path: '/api/kakao/*'});
    for (const route of Object.keys(ROUTES)) assert.equal((await mod.default(new Request(`${SITE}/api/kakao/${route}`))).status, 404);
  } finally { for (const [k, v] of Object.entries(saved)) if (v !== undefined) process.env[k] = v; }
  RESULT.offChecks = n;
});

test('스위치 파일 config/atlas11/kakao.json — 저장소에는 on=false · 열쇠 값 0(이름만) · 올리기 준비는 꺼져 있으면 카톡 함수를 안 올림', async () => {
  const text = await fs.readFile(path.join(ROOT, 'config/atlas11/kakao.json'), 'utf8'), cfg = JSON.parse(text);
  assert.equal(cfg.on, false);
  assert.deepEqual(cfg.env, Object.values(ENV));
  assert.equal(cfg.site, DEFAULTS.site); assert.equal(cfg.page, DEFAULTS.page); assert.equal(cfg.callback, DEFAULTS.callback);
  assert.ok(!/[0-9a-f]{32}/i.test(text), '열쇠처럼 보이는 값 없음');
  const {stageFunctions, functionSwitchedOn, SWITCH_STUB} = await import('../../scripts/atlas11/deploy_netlify.mjs');
  assert.equal(await functionSwitchedOn(ROOT, 'kakao.mjs'), false);
  const off = await fs.mkdtemp(path.join(os.tmpdir(), 'kakao-stage-off-'));
  try {
    const s = await stageFunctions(ROOT, off);
    assert.deepEqual(s.functions, ['invite', 'letter'], '꺼져 있으면 함수 목록이 그 전과 같음');
    assert.ok(!s.files.some(f => f.includes('kakao')), '꺼져 있으면 카톡 셈 파일 0(편지 함수가 불러도)');
    // VK F1 — 편지 함수가 부르는 카톡 셈 두 파일 자리에는 막대 파일(「카카오 회원 아님」) · 편지는 오늘 길 그대로
    assert.deepEqual(s.stubs, ['lib/atlas11/kakao-store.mjs', 'lib/atlas11/kakao.mjs']);
    for (const f of s.stubs) assert.equal(await fs.readFile(path.join(off, f), 'utf8'), SWITCH_STUB);
    const stub = await import(path.join(off, 'lib/atlas11/kakao.mjs'));
    assert.equal(await stub.kakaoMemberOf(new Request(`${SITE}/x`), ENVV, {}), null);
    assert.equal((await import(path.join(off, 'lib/atlas11/kakao-store.mjs'))).KAKAO_STORE, 'atlas11-kakao-v1');
  } finally { await fs.rm(off, {recursive: true, force: true}); }
  // 켜면(스위치 파일만 true 인 사본 뿌리) 카톡 함수 · 셈 파일이 함께 올라가고 옮긴 폴더만으로 돈다(열쇠 없으면 404)
  const fake = await fs.mkdtemp(path.join(os.tmpdir(), 'kakao-root-')), on = await fs.mkdtemp(path.join(os.tmpdir(), 'kakao-stage-on-'));
  try {
    for (const d of ['functions', 'lib', 'site', 'node_modules']) await fs.symlink(path.join(ROOT, d), path.join(fake, d));
    await fs.mkdir(path.join(fake, 'config/atlas11'), {recursive: true});
    await fs.writeFile(path.join(fake, 'config/atlas11/kakao.json'), JSON.stringify({...cfg, on: true}));
    const s = await stageFunctions(fake, on);
    assert.deepEqual(s.functions, ['invite', 'kakao', 'letter']);
    for (const f of ['functions/atlas11/kakao.mjs', 'lib/atlas11/kakao.mjs', 'lib/atlas11/kakao-store.mjs', 'lib/atlas11/invite.mjs', 'lib/atlas11/letter.mjs']) assert.ok(s.files.includes(f), f);
    assert.deepEqual(s.stubs, [], '켜면 막대 파일 0(진짜 셈)');
    assert.ok(!s.files.some(f => f.endsWith('.json')), '함수는 JSON 을 부르지 않음');
    const fn = (await import(path.join(on, 'functions/atlas11/kakao.mjs'))).default;
    assert.equal((await fn(new Request(`${SITE}/api/kakao/me`))).status, 404, '옮긴 폴더만으로 돌고 열쇠가 없으면 404');
  } finally { await fs.rm(fake, {recursive: true, force: true}); await fs.rm(on, {recursive: true, force: true}); }
  assert.equal(KAKAO_STORE, 'atlas11-kakao-v1');
});

test('길 ① 처음 온 사람 — 카드 단추 1 + 카카오 동의 1 = 2 · 우리 화면 더 누름 0 · 보낸 쪽(#/s/…)으로 · 로그인 쿠키만(HttpOnly · Secure · SameSite=Lax)', async () => {
  const R = rig();
  const sender = browser(R), s1 = await signup(sender, cardUrl('/next/#/'));
  const ref = (await meOf(sender)).ref;
  assert.match(ref, /^[A-Za-z0-9_-]{12}$/);
  assert.equal(R.store._dump().filter(([k]) => k.startsWith('m/')).length, 1);
  const friend = browser(R);
  const membersBefore = keysIn(R.store, 'm/').length;
  const to = '/next/?dev=1#/s/005930/a1B2c3';
  const s = await signup(friend, cardUrl(to, ref));
  assert.equal(keysIn(R.store, 'm/').length, membersBefore + 1, '동의 뒤에만 회원 하나');
  assert.equal(s.end, `${SITE}/next/?dev=1&kakao=ok#/s/005930/a1B2c3`, '친구가 보낸 그 쪽');
  assert.equal(s.taps, 2); assert.equal(s.extra, 0, '우리 화면에서 더 누를 것 0');
  assert.equal(s1.extra, 0);
  // 우리 응답은 둘(start 302 · callback 302) · 그 사이 우리 HTML 0
  const ours = [...s.first.steps, ...s.second.steps].filter(x => x.ours);
  assert.deepEqual(ours.map(x => [new URL(x.url).pathname, x.status, x.html]), [['/api/kakao/start', 302, false], ['/api/kakao/callback', 302, false]]);
  // 동의 화면 요청: 앱 열쇠 · 돌아올 주소 · code · 표 · scope 없음 · prompt 없음
  const auth = new URL(s.first.steps[1].url);
  assert.equal(auth.origin + auth.pathname, AUTH + '/oauth/authorize');
  assert.equal(auth.searchParams.get('client_id'), ENVV.ATLAS_KAKAO_REST_KEY);
  assert.equal(auth.searchParams.get('redirect_uri'), SITE + '/api/kakao/callback');
  assert.equal(auth.searchParams.get('response_type'), 'code');
  assert.match(auth.searchParams.get('state'), /^[A-Za-z0-9_-]{43}$/);
  assert.deepEqual([...auth.searchParams.keys()].sort(), ['client_id', 'redirect_uri', 'response_type', 'state'], 'scope · prompt · 채널 · 광고 값 없음');
  // 쿠키: 표 쿠키는 지워지고 로그인 쿠키 하나 — 깃발 넷
  const cb = R.seen.filter(x => new URL(x.url).pathname === '/api/kakao/callback').at(-1);
  const login = cb.setCookies.find(c => c.startsWith(COOKIE.login + '='));
  assert.match(login, new RegExp(`^${COOKIE.login}=[A-Za-z0-9_-]{43}\\.[A-Za-z0-9_-]{43}; Path=/; Max-Age=${LOGIN_DAYS * 86400}; HttpOnly; Secure; SameSite=Lax$`));
  assert.ok(cb.setCookies.some(c => c.startsWith(COOKIE.state + '=; Path=/; Max-Age=0; HttpOnly; Secure; SameSite=Lax')));
  const st = R.seen.find(x => new URL(x.url).pathname === '/api/kakao/start').setCookies[0];
  assert.match(st, new RegExp(`^${COOKIE.state}=[A-Za-z0-9_-]+\.[A-Za-z0-9_-]{43}; Path=/; Max-Age=${STATE_SEC}; HttpOnly; Secure; SameSite=Lax$`)); // 쿠키 = 내용.서명(VK F4)
  const me = await meOf(friend);
  assert.deepEqual(Object.keys(me).sort(), ['code', 'friends', 'member', 'next', 'on', 'ref']);
  assert.equal(me.member, true); assert.equal(me.on, true);
  assert.equal((await meOf(sender)).friends, 1, '보낸 사람 소개 수 +1');
  RESULT.ourTaps = s.taps; RESULT.extraTaps = s.extra;
});

test('길 ② 표 위조 — 표가 다름 · 표 쿠키 없음 · 표 없음 · 10분 지남 → 403 · 회원 0 · 증표 바꿈 0', async () => {
  const R = rig(), b = browser(R);
  const first = await b.go(cardUrl('/next/#/s/1'));
  const auth = new URL(first.steps[1].url), realState = auth.searchParams.get('state');
  const attacker = R.fake.seed('4299999999');
  const code = () => { const c = 'atk' + Math.random().toString(36).slice(2); R.fake.codes.set(c, {id: attacker, redirect_uri: SITE + '/api/kakao/callback', used: false}); return c; };
  const cases = [
    ['다른 표', b.api(`/api/kakao/callback?code=${code()}&state=${'A'.repeat(43)}`)],
    ['표 없음', b.api(`/api/kakao/callback?code=${code()}`)],
    ['표 쿠키 없음', R.call(new Request(`${SITE}/api/kakao/callback?code=${code()}&state=${realState}`))],
    ['다른 쿠키', R.call(new Request(`${SITE}/api/kakao/callback?code=${code()}&state=${realState}`, {headers: {cookie: `${COOKIE.state}=${Buffer.from(JSON.stringify({s: 'B'.repeat(43), to: '/next/#/', ref: null, p: 0, t: T0})).toString('base64url')}`}}))],
  ];
  for (const [name, p] of cases) {
    const r = await p;
    assert.equal(r.status, 403, name);
    const html = await r.text();
    for (const w of ['회원가입', '<input', '비밀번호', '별명', '전화', '생일', '<script', 'style=']) assert.ok(!html.includes(w), name + ' ' + w);
  }
  // 10분 지남(진짜 표라도)
  const b2 = browser(R), f2 = await b2.go(cardUrl('/next/#/s/2'));
  R.tick(STATE_SEC * 1000 + 1);
  const r2 = await b2.go(agreeHref(f2.html, f2.final));
  assert.equal(r2.status, 403);
  assert.equal(keysIn(R.store, 'm/').length, 0, '회원 0');
  assert.equal(R.fake.calls.filter(c => c.path === '/oauth/token').length, 0, '증표 바꿈 0');
  assert.equal(keysIn(R.store, 's/').length, 0);
  RESULT.forged = cases.length + 1;
});

test('길 ③ 다시 온 사람 — 카톡 안 prompt=none: 회원은 누름 0 으로 로그인 · 회원 아니면 가입 0(kakao=none) · 조용한 시작은 누른 수 0', async () => {
  const R = rig();
  const first = browser(R), s = await signup(first, cardUrl('/next/#/'));
  const kakaoId = String(R.fake.users.keys().next().value);
  const before = await dailyCounts(R.store, {days: 1, now: new Date(T0)});
  // 새 기기(로그인 쿠키 없음) · 카톡 안(카카오 계정 로그인 + 동의 있음)
  const again = browser(R, {kakaoUser: kakaoId});
  const r = await again.go(`${SITE}/api/kakao/start?to=${encodeURIComponent('/next/#/s/000660/x')}&prompt=none`);
  assert.equal(r.final, `${SITE}/next/?kakao=ok#/s/000660/x`, '누름 0 으로 그 쪽');
  assert.ok(r.steps.every(x => !x.html), '화면 0(동의 화면도 없음)');
  const auth = new URL(r.steps[1].url); assert.equal(auth.searchParams.get('prompt'), 'none');
  assert.equal((await meOf(again)).member, true);
  const after = await dailyCounts(R.store, {days: 1, now: new Date(T0)});
  assert.deepEqual(after, before, '조용한 로그인은 시작 누름 · 가입 마침 셈 0');
  // 카카오에는 동의가 남았지만 우리 회원이 아님(예: 연결 끊기 실패 뒤) → 가입 만들지 않음
  const ghost = R.fake.seed('4211111111');
  const g = await browser(R, {kakaoUser: ghost}).go(`${SITE}/api/kakao/start?to=${encodeURIComponent('/next/#/')}&prompt=none`);
  assert.equal(g.final, `${SITE}/next/?kakao=none#/`);
  assert.equal(await isMember(R.store, mhOf(ghost)), false, '조용한 시작은 가입 0');
  // 처음 온 사람(카카오 동의 없음 · 로그인 없음) → kakao=none · 가입 0
  const fresh = R.fake.seed('4222222222', {consented: false});
  for (const u of [fresh, null]) {
    const x = await browser(R, {kakaoUser: u}).go(`${SITE}/api/kakao/start?to=${encodeURIComponent('/next/#/s/1')}&prompt=none`);
    assert.equal(x.final, `${SITE}/next/?kakao=none#/s/1`);
  }
  assert.equal(keysIn(R.store, 'm/').length, 1);
  // 다시 온 회원이 카드 단추로 다시 와도(일반 시작) 가입 마친 수 · 소개 수 0
  const c2 = await dailyCounts(R.store, {days: 1, now: new Date(T0)});
  await signup(browser(R, {kakaoUser: kakaoId}), cardUrl('/next/#/'));
  const c3 = await dailyCounts(R.store, {days: 1, now: new Date(T0)});
  assert.equal(c3[0].done, c2[0].done, '다시 온 회원 = 가입 마침 아님');
  assert.equal(c3[0].start, c2[0].start + 1);
  assert.equal(s.extra, 0);
  RESULT.returningTaps = 0;
});

test('길 ④ 「그냥 보기」 · 동의 거부 — 가입 0 · 회원 기록 요청 401 · 거부는 kakao=none 으로 그 쪽', async () => {
  const R = rig();
  // 그냥 보기 = 카드 두 번째 단추 = 우리 쪽 주소를 바로 엶(/api 를 거치지 않음)
  const b = browser(R), v = await b.go(`${SITE}/next/#/s/005930/a1`);
  assert.equal(v.final, `${SITE}/next/#/s/005930/a1`);
  assert.equal(R.seen.length, 0); assert.equal(R.store._dump().length, 0); assert.equal(R.fake.calls.length, 0);
  assert.equal((await b.api('/api/kakao/data')).status, 401, '가입 안 한 사람의 기록은 이 기기에만');
  assert.equal((await meOf(b)).member, false);
  // 동의 거부(「취소」)
  const d = await signup(b, cardUrl('/next/#/s/005930/a1'), {action: 'deny'});
  assert.equal(d.end, `${SITE}/next/?kakao=none#/s/005930/a1`);
  assert.equal(keysIn(R.store, 'm/').length, 0, '가입 0');
  assert.equal(R.fake.calls.filter(c => c.path === '/oauth/token').length, 0);
  assert.equal(b.cookie(COOKIE.login), undefined);
  assert.equal(b.cookie(COOKIE.state), undefined, '표 쿠키 지움');
  const day = (await dailyCounts(R.store, {days: 1, now: new Date(T0)}))[0];
  assert.deepEqual([day.start, day.done], [1, 0]);
});

test('길 ⑤ 탈퇴 — 서버 사본 · 로그인 기록 0 · 카카오 연결 끊기 1번(어드민 열쇠 · 그 회원 번호) · 쿠키 지움 · 다른 기기도 회원 아님 · 이 기기 기록은 화면 몫', async () => {
  const R = rig(), a = browser(R);
  await signup(a, cardUrl('/next/#/'));
  const id = String([...R.fake.users.keys()][0]), mh = mhOf(id);
  const other = browser(R, {kakaoUser: id});
  await other.go(`${SITE}/api/kakao/start?to=%2Fnext%2F%23%2F&prompt=none`);
  assert.equal((await meOf(other)).member, true, '두 번째 기기');
  const put = await a.api('/api/kakao/data', {method: 'PUT', headers: {...SAME, 'content-type': 'application/json'}, body: JSON.stringify({data: {'atlas:godori-why': [{at: '2026-10-18T01:00:00.000Z', code: '005930', kept: true}], 'atlas:new:later': ['005930']}})});
  assert.equal(put.status, 200);
  assert.ok(keysIn(R.store, 'md/').length === 1 && keysIn(R.store, `s/${mh}/`).length === 2);
  // 다른 사이트에서 보낸 탈퇴 → 403 · 아무것도 안 지움
  assert.equal((await a.api('/api/kakao/withdraw', {method: 'POST', headers: {origin: 'https://evil.example', 'sec-fetch-site': 'cross-site'}})).status, 403);
  assert.equal(await isMember(R.store, mh), true);
  const w = await a.api('/api/kakao/withdraw', {method: 'POST', headers: SAME});
  assert.equal(w.status, 200);
  assert.deepEqual(await w.json(), {ok: true, removed: true, unlinked: true});
  assert.ok(w.headers.getSetCookie().some(c => c.startsWith(COOKIE.login + '=; Path=/; Max-Age=0; HttpOnly; Secure; SameSite=Lax')), '쿠키 지움');
  const un = R.fake.calls.filter(c => c.path === '/v1/user/unlink');
  assert.equal(un.length, 1); assert.equal(un[0].auth, 'kakaoak'); assert.deepEqual(un[0].form, {target_id_type: 'user_id', target_id: id});
  assert.deepEqual(R.fake.unlinked, [id]);
  assert.equal(R.store._dump().filter(([k]) => k.includes(mh)).length, 0, '그 회원 표가 든 열쇠 0');
  assert.equal(keysIn(R.store, 's/').length, 0, '로그인 기록 0');
  assert.equal((await meOf(a)).member, false);
  assert.equal((await meOf(other)).member, false, '다른 기기 쿠키도 회원 아님');
  assert.equal((await other.api('/api/kakao/data')).status, 401);
  assert.equal((await a.api('/api/kakao/withdraw', {method: 'POST', headers: SAME})).status, 401, '두 번째 탈퇴 = 로그인 없음');
  // 카카오 설정에서 끊음(연결 끊기 알림) — 대표 어드민 열쇠로만 · 서버 사본 지움 · 카카오에는 늘 200
  const b = browser(R); await signup(b, cardUrl('/next/#/'));
  const id2 = String([...R.fake.users.keys()].at(-1)), mh2 = mhOf(id2);
  assert.equal(await isMember(R.store, mh2), true);
  assert.equal((await R.call(new Request(`${SITE}/api/kakao/unlinked?user_id=${id2}&app_id=1&referrer_type=UNLINK_FROM_APPS`))).status, 401, '열쇠 없음');
  assert.equal((await R.call(new Request(`${SITE}/api/kakao/unlinked?user_id=${id2}`, {headers: {authorization: 'KakaoAK wrong'}}))).status, 401);
  assert.equal(await isMember(R.store, mh2), true);
  const n = await R.call(new Request(`${SITE}/api/kakao/unlinked`, {method: 'POST', headers: {authorization: 'KakaoAK ' + ENVV.ATLAS_KAKAO_ADMIN_KEY, 'content-type': 'application/x-www-form-urlencoded'}, body: `app_id=1&user_id=${id2}&referrer_type=UNLINK_FROM_APPS`}));
  assert.equal(n.status, 200);
  assert.equal(await isMember(R.store, mh2), false); assert.equal(keysIn(R.store, `s/${mh2}/`).length, 0);
  assert.equal((await R.call(new Request(`${SITE}/api/kakao/unlinked?user_id=4999999999&referrer_type=ACCOUNT_DELETE`, {headers: {authorization: 'KakaoAK ' + ENVV.ATLAS_KAKAO_ADMIN_KEY}}))).status, 200, '모르는 사람도 200');
});

test('소개 수 — 새 회원만 +1(다시 온 회원 · 자기 표 · 틀린 표 0) · 이름 0 · 3명 = 확인 번호 · 사장님 열쇠 기기만 맞대 봄', async () => {
  const R = rig(), boss = browser(R);
  await signup(boss, cardUrl('/next/#/'));
  const ref = (await meOf(boss)).ref;
  for (let i = 0; i < 2; i++) await signup(browser(R), cardUrl('/next/#/s/1', ref));
  let me = await meOf(boss);
  assert.deepEqual([me.friends, me.code, me.next], [2, null, 3]);
  await signup(browser(R), cardUrl('/next/#/s/1', ref + 'x')); // 틀린 표(13자) — 버림(새 회원이지만 소개 수 0)
  await signup(boss, cardUrl('/next/#/s/1', ref)); // 자기 표 · 다시 온 회원
  const old = String([...R.fake.users.keys()][1]);
  await signup(browser(R, {kakaoUser: old}), cardUrl('/next/#/s/1', ref)); // 다시 온 친구(새 기기)
  me = await meOf(boss);
  assert.equal(me.friends, 2, '새 회원만 셈');
  await signup(browser(R), cardUrl('/next/#/s/1', ref));
  me = await meOf(boss);
  assert.equal(me.friends, 3);
  assert.match(me.code, /^[A-Z2-9]{4}-[A-Z2-9]{4}-[A-Z2-9]{4}$/);
  assert.ok(!JSON.stringify(me).match(/4200000|nickname|name|photo/i), '이름 · 번호 0');
  const v = code => R.call(new Request(`${SITE}/api/kakao/verify?code=${encodeURIComponent(code)}`, {headers: {'x-atlas-owner': OWNER}}));
  assert.equal((await R.call(new Request(`${SITE}/api/kakao/verify?code=${me.code}`))).status, 403, '사장님 열쇠 없음');
  assert.equal((await R.call(new Request(`${SITE}/api/kakao/verify?code=${me.code}`, {headers: {'x-atlas-owner': 'wrong-owner-key-000000'}}))).status, 403);
  assert.deepEqual(await (await v(me.code)).json().then(j => [j.ok, j.used]), [true, false]);
  assert.deepEqual(await (await v(me.code)).json().then(j => [j.ok, j.used]), [true, true], '두 번째는 「씀」');
  assert.deepEqual(await (await v('ABCD-EFGH-JKMN')).json().then(j => [j.ok, j.used]), [false, false]);
  // 날마다 두 수(사장님 열쇠 기기만)
  assert.equal((await R.call(new Request(`${SITE}/api/kakao/counts`))).status, 403);
  const cnt = await (await R.call(new Request(`${SITE}/api/kakao/counts?days=1`, {headers: {'x-atlas-owner': OWNER}}))).json();
  assert.deepEqual(Object.keys(cnt.days[0]).sort(), ['date', 'done', 'start']);
  RESULT.referral = me.friends;
});

test('셈 둘 — 시작 누름 · 가입 마침만 · 날마다 숫자 둘(사람 표 · 시각 없음) · 회원 기록 401 · 내 돈 400 · 다른 사이트 403', async () => {
  const R = rig();
  const a = browser(R); await signup(a, cardUrl('/next/#/'));
  await signup(browser(R), cardUrl('/next/#/'), {action: 'deny'});
  await browser(R).go(cardUrl('/next/#/')); // 누르고 동의 화면에서 그냥 닫음
  await browser(R, {kakaoUser: String([...R.fake.users.keys()][0])}).go(`${SITE}/api/kakao/start?prompt=none&to=%23%2F`);
  await R.call(new Request(cardUrl('/next/#/'), {headers: {'user-agent': 'kakaotalk-scrap/1.0; +https://devtalk.kakao.com/'}})); // 링크 미리보기 일꾼
  const [day] = await dailyCounts(R.store, {days: 1, now: new Date(T0)});
  assert.deepEqual([day.start, day.done], [3, 1], '시작 누름 3(조용한 시작 · 미리보기 일꾼 뺌) · 가입 마침 1');
  const d = R.store._dump().filter(([k]) => k.startsWith('d/'));
  assert.equal(d.length, 1); assert.deepEqual(Object.keys(JSON.parse(d[0][1])).sort(), ['done', 'start']);
  // 회원 기록 넷 — 회원만 · 열쇠 넷만 · 내 돈 막힘 · 같은 사이트만 · JSON 만
  const j = {...SAME, 'content-type': 'application/json'};
  assert.equal((await a.api('/api/kakao/data', {method: 'PUT', headers: j, body: JSON.stringify({data: {'atlas:godori-money': [1]}})})).status, 400);
  assert.equal((await a.api('/api/kakao/data', {method: 'PUT', headers: j, body: JSON.stringify({data: {'atlas:font': ['x']}})})).status, 400);
  assert.equal((await a.api('/api/kakao/data', {method: 'PUT', headers: {...SAME, 'content-type': 'text/plain'}, body: '{}'})).status, 415);
  assert.equal((await a.api('/api/kakao/data', {method: 'PUT', headers: {origin: 'https://evil.example', 'content-type': 'application/json'}, body: '{"data":{}}'})).status, 403);
  assert.equal((await a.api('/api/kakao/data', {method: 'PUT', headers: {...j, 'content-length': String(5 * 1024 * 1024)}, body: '{}'})).status, 413);
  const ok = await a.api('/api/kakao/data', {method: 'PUT', headers: j, body: JSON.stringify({data: {'atlas:new:sub': ['반도체'], 'atlas:godori-hold': [{id: 'h1', code: '005930'}]}})});
  assert.equal(ok.status, 200);
  const got = await (await a.api('/api/kakao/data')).json();
  assert.deepEqual(got.data['atlas:new:sub'], ['반도체']); assert.equal(got.data['atlas:godori-hold'].length, 1);
  assert.equal((await a.api('/api/kakao/me', {method: 'POST', headers: SAME})).status, 405);
  RESULT.counts = `${day.start}/${day.done}`;
});

test('새는 것 0 — 우리 응답(몸 · 머리글 · 쿠키 · 옮길 주소) · 기록(log) 안에 비밀 열쇠 · 증표 · code · 카카오 회원 번호 0 · 앱 열쇠는 동의 화면 주소에만', async () => {
  const R = rig();
  R.deps.fetch = async (u, init) => { R.kakaoFetch.push({url: String(u), init}); if (String(u).endsWith('/v1/user/logout')) throw Error('down ' + init.headers.Authorization); return R.fake.fetch(u, init); }; // 오류 글에 증표가 있어도 기록에 안 남음
  const a = browser(R); await signup(a, cardUrl('/next/#/s/1'));
  const ref = (await meOf(a)).ref;
  const b = browser(R); await signup(b, cardUrl('/next/#/s/1', ref));
  await b.api('/api/kakao/data', {method: 'PUT', headers: {...SAME, 'content-type': 'application/json'}, body: JSON.stringify({data: {'atlas:new:later': ['000660']}})});
  await b.api('/api/kakao/data');
  await signup(browser(R), cardUrl('/next/#/'), {action: 'deny'});
  await b.api('/api/kakao/withdraw', {method: 'POST', headers: SAME});
  // 카카오가 증표를 못 줄 때도 기록에는 까닭 낱말만
  R.fake.codes.clear();
  const c = browser(R), f = await c.go(cardUrl('/next/#/'));
  R.deps.fetch = async () => new Response('{"error":"invalid_grant","error_description":"code ' + 'Z'.repeat(20) + '"}', {status: 400});
  const end = await c.go(agreeHref(f.html, f.final));
  assert.equal(end.final, `${SITE}/next/?kakao=none#/`);
  const secrets = [ENVV.ATLAS_KAKAO_CLIENT_SECRET, ENVV.ATLAS_KAKAO_ADMIN_KEY, ENVV.ATLAS_KAKAO_HASH_SECRET];
  const tokens = [...R.fake.tokens.keys(), ...[...R.fake.tokens.values()].map(t => t.refresh)];
  const codes = [...R.fake.codes.keys(), ...R.fake.calls.filter(x => x.path === '/oauth/token').map(x => x.form.code)];
  const ids = [...R.fake.users.keys()];
  assert.ok(tokens.length >= 4 && codes.length >= 2 && ids.length >= 3);
  const outText = R.seen.map(x => [x.body, x.headers, ...x.setCookies].join('\n'));
  const outNoAuthorize = R.seen.map(x => [x.body, x.headers.split('\n').filter(h => !/^location: https:\/\/kauth\.kakao\.com\/oauth\/authorize\?/.test(h)).join('\n'), ...x.setCookies].join('\n'));
  for (const s of [...secrets, ...tokens, ...ids]) for (const t of [...outText, ...R.logs]) assert.ok(!t.includes(s), '우리 응답 · 기록에 비밀 · 증표 · 번호 없음');
  for (const s of codes) for (const t of [...outText, ...R.logs]) assert.ok(!t.includes(s), 'code 없음');
  for (const t of [...outNoAuthorize, ...R.logs]) assert.ok(!t.includes(ENVV.ATLAS_KAKAO_REST_KEY), '앱 열쇠는 동의 화면 주소에만');
  assert.ok(R.logs.length >= 1 && R.logs.every(l => /^[a-z]+ [a-z0-9_ ]+$/i.test(l)), '기록 = 까닭 낱말만: ' + R.logs.join(' | '));
  // 저장소에도 카카오 회원 번호 · 증표 글자 그대로 없음(번호는 쿠키로만 열리는 자물쇠 안)
  const dump = JSON.stringify(R.store._dump());
  for (const s of [...ids, ...tokens, ...secrets]) assert.ok(!dump.includes(s));
  // 클라이언트 시크릿은 서버 → 카카오 증표 요청에만 · 프로필(/v2/user/me) 부름 0 · 번호는 access_token_info 로만
  const secretCalls = R.kakaoFetch.filter(x => JSON.stringify(x).includes(ENVV.ATLAS_KAKAO_CLIENT_SECRET));
  assert.ok(secretCalls.length >= 2 && secretCalls.every(x => x.url.endsWith('/oauth/token')));
  assert.equal(R.fake.calls.filter(x => x.path === '/v2/user/me').length, 0);
  assert.ok(R.fake.calls.some(x => x.path === '/v1/user/access_token_info'));
  // 화면 쪽 응답 몸에 로그인 증표 없음(쿠키에만)
  const login = R.seen.flatMap(x => x.setCookies).filter(x => x.startsWith(COOKIE.login + '=') && !x.includes('Max-Age=0')).map(x => x.split(';')[0].split('=')[1]);
  assert.ok(login.length >= 2);
  for (const v of login) for (const x of R.seen) assert.ok(!x.body.includes(v.split('.')[1]));
  RESULT.leaks = 0;
});

test('돌아갈 쪽 · 보내는 집 — 같은 사이트 쪽만 · 다른 집은 page #/ · 다른 집에서 시작하면 사이트 집으로 · 다른 기기 탈퇴 뒤 me 쿠키 지움', async () => {
  for (const [v, want] of [['#/s/005930/x', '/next/#/s/005930/x'], ['/next/?dev=1#/s/1', '/next/?dev=1#/s/1'], ['/', '/'], ['/letter.html', '/letter.html'],
    ['//evil.com/x', '/next/#/'], ['https://evil.com', '/next/#/'], ['javascript:alert(1)', '/next/#/'], ['/api/kakao/withdraw', '/next/#/'], ['/next/ x', '/next/#/'], ['/\\evil', '/next/#/'], ['', '/next/#/'], [null, '/next/#/'], ['#/' + 'a'.repeat(600), '/next/#/']]) assert.equal(cleanTo(v), want, String(v));
  assert.equal(withMark('/next/?dev=1#/s/1', 'ok'), '/next/?dev=1&kakao=ok#/s/1');
  const R = rig();
  const r = await R.call(new Request('https://atlas11-x.netlify.app/api/kakao/start?to=%23%2F'));
  assert.equal(r.status, 302); assert.equal(r.headers.get('location'), SITE + '/api/kakao/start?to=%23%2F');
  assert.equal(r.headers.getSetCookie().length, 0);
  // 헤어진 쿠키(틀린 꼴) → 회원 아님 + 쿠키 지움
  const bad = await R.call(new Request(SITE + '/api/kakao/me', {headers: {cookie: `${COOKIE.login}=nope`}}));
  assert.equal((await bad.json()).member, false); assert.ok(bad.headers.getSetCookie()[0].includes('Max-Age=0'));
  // 다른 서버 길이 쓰는 「지금 회원인가」(편지 여는 밤 초대장을 회원에 붙일 때)
  const a = browser(R); await signup(a, cardUrl('/next/#/'));
  const req = new Request(SITE + '/letter.html', {headers: {cookie: `${COOKIE.login}=${a.cookie(COOKIE.login)}`}});
  assert.equal(await kakaoMemberOf(req, ENVV, R.deps), mhOf(String([...R.fake.users.keys()][0])));
  assert.equal(await kakaoMemberOf(req, ENVV, {...R.deps, config: {on: false}}), null);
  // 끝 숫자 한 줄
  console.log('K1c 결과 ' + JSON.stringify(RESULT));
});

test('보안 머리말 — 열쇠 없으면 오늘과 한 바이트도 안 다름(더한 주소 0) · 공유 열쇠 있으면 도구 주소 하나만 · 가입은 0', async () => {
  const {HEADER_TOP, kakaoHeaderTop, KAKAO_CSP} = await import('../../scripts/atlas11/site_headers.mjs');
  const TODAY = "/*\n  X-Content-Type-Options: nosniff\n  Referrer-Policy: strict-origin-when-cross-origin\n  Content-Security-Policy: default-src 'self'; script-src 'self'; style-src 'self'; img-src 'self' data:; font-src 'self'; connect-src 'self'; object-src 'none'; base-uri 'self'; form-action 'self'; frame-ancestors 'none'\n  Permissions-Policy: camera=(), microphone=(), geolocation=()\n  X-Frame-Options: DENY\n";
  assert.equal(HEADER_TOP, TODAY);
  for (const o of [undefined, {}, {share: false, login: false}, {login: true}, {share: 'yes'}]) { const r = kakaoHeaderTop(o); assert.equal(r.head, TODAY); assert.equal(r.added.length, 0); }
  const s = kakaoHeaderTop({share: true, login: true});
  assert.deepEqual(s.added, ['script-src https://t1.kakaocdn.net']);
  assert.equal(s.head, TODAY.replace("script-src 'self';", "script-src 'self' https://t1.kakaocdn.net;"), 'package.mjs addInvite 와 같은 값');
  assert.equal(kakaoHeaderTop({share: true}, s.head).added.length, 0, '두 번 더하지 않음');
  assert.deepEqual(KAKAO_CSP.login, {});
});

/* ── 따로 검증(VK · docs/design/godori-2026-10-18/review/VK.md) 고침마다 시험 하나 ── */
const SAME_JSON = {...SAME, 'content-type': 'application/json'};
async function member(R, opts) { const b = browser(R, opts); await signup(b, cardUrl('/next/#/')); return {b, id: String([...R.fake.users.keys()].at(-1))}; }

test('VK F2 — 탈퇴 · 연결 끊김 알림이 편지 여는 밤 회원 기록의 카카오 회원 표를 뗌(onGone)', async () => {
  const {join, mintCode, detachKakao, memoryStore: letterMem} = await import('../../lib/atlas11/letter.mjs');
  const R = rig(), ls = letterMem(), gone = [];
  R.deps.onGone = async mh => { gone.push(mh); return detachKakao(ls, mh); };
  const letterKakao = async () => JSON.stringify(await Promise.all(((await ls.list({prefix: 'm/'})).blobs).map(b => ls.get(b.key, {type: 'json'}))));
  const a = await member(R), b = await member(R);
  for (const x of [a, b]) assert.equal((await join(ls, {code: await mintCode(ls, 'owner', new Date(T0).toISOString()), nick: '편지' + x.id.slice(-3)}, new Date(T0), {kakao: mhOf(x.id)})).status, 201);
  assert.ok((await letterKakao()).includes(mhOf(a.id)) && (await letterKakao()).includes(mhOf(b.id)));
  assert.equal((await a.b.api('/api/kakao/withdraw', {method: 'POST', headers: SAME})).status, 200);
  assert.ok(!(await letterKakao()).includes(mhOf(a.id)), '탈퇴 뒤 편지 기록에 그 회원 표 0');
  assert.equal((await R.call(new Request(`${SITE}/api/kakao/unlinked?user_id=${b.id}`, {headers: {authorization: 'KakaoAK ' + ENVV.ATLAS_KAKAO_ADMIN_KEY}}))).status, 200);
  assert.ok(!(await letterKakao()).includes(mhOf(b.id)), '카카오 설정에서 끊어도 0');
  assert.deepEqual(gone, [mhOf(a.id), mhOf(b.id)]);
  assert.equal((await ls.list({prefix: 'm/'})).blobs.length, 2, '편지 회원은 그대로(고리만 뗌)');
});

test('VK F3 — 카카오 연결 끊기를 먼저: 안 되면 502 · 아무것도 안 지움(로그인 그대로) · -101 은 이미 끊김 · 지우다 깨지면 500 뒤 다시 누르면 끝남', async () => {
  const R = rig(), {b, id} = await member(R), mh = mhOf(id);
  await b.api('/api/kakao/data', {method: 'PUT', headers: SAME_JSON, body: JSON.stringify({data: {'atlas:new:later': ['005930']}})});
  const before = JSON.stringify(R.store._dump().filter(([k]) => !k.startsWith('d/')));
  const real = R.deps.fetch;
  R.deps.fetch = async (u, init) => (String(u).endsWith('/v1/user/unlink') ? new Response('{"msg":"down","code":-1}', {status: 503}) : real(u, init));
  const w1 = await b.api('/api/kakao/withdraw', {method: 'POST', headers: SAME});
  assert.equal(w1.status, 502); assert.deepEqual(await w1.json(), {error: 'unlink'});
  assert.equal(w1.headers.getSetCookie().length, 0, '로그인 쿠키 그대로');
  assert.equal(JSON.stringify(R.store._dump().filter(([k]) => !k.startsWith('d/'))), before, '서버 사본 · 로그인 · 소개 그대로');
  assert.equal(R.fake.users.get(id).consented, true);
  assert.equal((await meOf(b)).member, true);
  // VK12 뜻: 끊기가 안 된 뒤 남의 쪽이 띄운 시작(남의 소개 표)으로 와도 새 가입 · 소개 수 0(회원 기록이 그대로라 「다시 온 회원」)
  const atk = await member(R), atkRef = (await meOf(atk.b)).ref, doneBefore = (await dailyCounts(R.store, {days: 1, now: new Date(T0)}))[0].done;
  await signup(browser(R, {kakaoUser: id}), cardUrl('/next/#/x', atkRef));
  assert.equal((await meOf(atk.b)).friends, 0, '소개 수 오르지 않음');
  assert.equal((await dailyCounts(R.store, {days: 1, now: new Date(T0)}))[0].done, doneBefore, '새 가입 0');
  R.deps.fetch = real; // 지우다 깨짐(편지 고리 떼기 실패) → 500 · 카카오는 이미 끊김
  R.deps.onGone = async () => { throw Error('letter store down'); };
  const w2 = await b.api('/api/kakao/withdraw', {method: 'POST', headers: SAME});
  assert.equal(w2.status, 500); assert.deepEqual(await w2.json(), {error: 'delete'});
  assert.equal(R.fake.users.get(id).consented, false, '카카오는 끊김');
  assert.equal(await isMember(R.store, mh), true, '지운 것 0(다시 누를 수 있게)');
  R.deps.onGone = null; // 다시 누름 → 카카오 -101(이미 끊김) = 끊긴 것으로 → 마저 지움
  const w3 = await b.api('/api/kakao/withdraw', {method: 'POST', headers: SAME});
  assert.equal(w3.status, 200); assert.deepEqual(await w3.json(), {ok: true, removed: true, unlinked: true});
  assert.equal(R.fake.calls.filter(c => c.path === '/v1/user/unlink').length, 2);
  assert.equal(R.store._dump().filter(([k]) => k.includes(mh)).length, 0);
  assert.ok(R.logs.every(l => /^[a-z]+ [a-z0-9_ ]+$/i.test(l)), R.logs.join(' | '));
});

test('VK F4 — 표 쿠키는 서명(HMAC) · 서버가 한 번만: 고친 쿠키 · 서명 없는 쿠키 · 같은 표 두 번째 → 403', async () => {
  const R = rig(), b = browser(R), f = await b.go(cardUrl('/next/#/s/1'));
  const ck = b.cookie(COOKIE.state), state = new URL(f.steps[1].url).searchParams.get('state');
  const [payload, sig] = ck.split('.');
  assert.match(sig, /^[A-Za-z0-9_-]{43}$/);
  const forged = Buffer.from(JSON.stringify({...JSON.parse(Buffer.from(payload, 'base64url').toString()), ref: 'AAAAAAAAAAAA'})).toString('base64url');
  const atk = R.fake.seed('4277000001'), code = () => { const c = 'f4' + Math.random().toString(36).slice(2); R.fake.codes.set(c, {id: atk, redirect_uri: SITE + '/api/kakao/callback', used: false}); return c; };
  for (const [name, cookie] of [['ref 를 고침', `${forged}.${sig}`], ['서명 없음', payload], ['서명 틀림', `${payload}.${'A'.repeat(43)}`], ['남의 비밀로 서명', `${payload}.${createHash('sha256').update(payload).digest('base64url')}`]])
    assert.equal((await R.call(new Request(`${SITE}/api/kakao/callback?code=${code()}&state=${state}`, {headers: {cookie: `${COOKIE.state}=${cookie}`}}))).status, 403, name);
  const ok = await b.go(agreeHref(f.html, f.final));
  assert.equal(ok.final, `${SITE}/next/?kakao=ok#/s/1`, '진짜 쿠키는 통과');
  const again = await R.call(new Request(`${SITE}/api/kakao/callback?code=${code()}&state=${state}`, {headers: {cookie: `${COOKIE.state}=${ck}`}}));
  assert.equal(again.status, 403, '같은 표 두 번째');
  assert.equal(keysIn(R.store, 'm/').length, 1, '두 번째로 회원이 안 생김');
  const st = keysIn(R.store, 'st/');
  assert.ok(st.length >= 1 && st.every(k => /^st\/[0-9a-f]{64}$/.test(k)));
  for (const k of st) assert.deepEqual(Object.keys(JSON.parse(R.store._dump().find(([x]) => x === k)[1])), ['d'], '한 번 표에는 날짜만');
});

test('VK F6 — 「카드 단추 누른 수」는 사람이 쪽을 여는 꼭대기 이동만(그림 · 스크립트 · fetch · 미리보기 일꾼 0)', async () => {
  const R = rig();
  const tries = [[{'sec-fetch-mode': 'navigate', 'sec-fetch-dest': 'document', 'sec-fetch-site': 'cross-site'}, 1], [{}, 1], [{'sec-fetch-mode': 'navigate'}, 1],
    [{'sec-fetch-mode': 'no-cors', 'sec-fetch-dest': 'image'}, 0], [{'sec-fetch-mode': 'no-cors', 'sec-fetch-dest': 'script'}, 0], [{'sec-fetch-mode': 'cors', 'sec-fetch-dest': 'empty'}, 0],
    [{'sec-fetch-mode': 'navigate', 'sec-fetch-dest': 'iframe'}, 0], [{'user-agent': 'facebookexternalhit/1.1'}, 0]];
  let want = 0;
  for (const [h, n] of tries) {
    const r = await R.call(new Request(cardUrl('/next/#/'), {headers: h}));
    assert.equal(r.status, 302, '세지 않아도 길은 그대로');
    want += n;
    assert.equal((await dailyCounts(R.store, {days: 1, now: new Date(T0)}))[0].start, want, JSON.stringify(h));
  }
});

test('VK F8 — 「가입 마친 수」는 회원 기록이 새로 생길 때만(finishSignup isNew): 다시 온 회원 카드 · 조용한 로그인 · 여러 기기 0', async () => {
  const R = rig(), done = async () => (await dailyCounts(R.store, {days: 1, now: new Date(T0)}))[0].done;
  const {id} = await member(R);
  assert.equal(await done(), 1);
  await signup(browser(R, {kakaoUser: id}), cardUrl('/next/#/')); // 같은 사람 · 새 기기 · 카드
  await browser(R, {kakaoUser: id}).go(`${SITE}/api/kakao/start?prompt=none&to=%23%2F`); // 조용한 로그인
  await signup(browser(R, {kakaoUser: id}), cardUrl('/next/#/', (await meOf(browser(R))).ref ?? undefined));
  assert.equal(await done(), 1, '다시 온 회원 = 가입 마침 아님');
  await member(R);
  assert.equal(await done(), 2, '새 회원 +1');
});

test('VK F10 — 돌아옴 한 번에 카카오를 기다리는 때 합 8초 안 · 카카오가 답을 안 하면 그 안에 kakao=none', async () => {
  assert.ok(KAKAO_WAIT_MS.token + KAKAO_WAIT_MS.info + KAKAO_WAIT_MS.logout <= 8000);
  assert.ok(KAKAO_WAIT_MS.unlink <= 8000);
  const R = rig(), b = browser(R), f = await b.go(cardUrl('/next/#/s/9'));
  R.deps.wait = {token: 120, info: 80, logout: 40};
  R.deps.fetch = (u, init) => new Promise((_, rej) => init.signal.addEventListener('abort', () => rej(init.signal.reason), {once: true})); // 답 없는 카카오
  const keep = setInterval(() => {}, 20); // AbortSignal.timeout 시계는 node 를 붙잡지 않음 — 서버(넷리파이 함수)처럼 살아 있게
  const t = Date.now(), end = await b.go(agreeHref(f.html, f.final)).finally(() => clearInterval(keep)), ms = Date.now() - t;
  assert.equal(end.final, `${SITE}/next/?kakao=none#/s/9`);
  assert.ok(ms < 120 + 80 + 40 + 400, '기다림 ' + ms + 'ms');
  assert.deepEqual(R.logs, ['callback error TimeoutError']);
});

test('VK F11 — 연결 끊김 알림: 지우다 깨지면 500(카카오 웹훅 기록에 실패로 남음) · 다시 오면 지움 · 모르는 사람 200', async () => {
  const R = rig(), {id} = await member(R), mh = mhOf(id), h = {authorization: 'KakaoAK ' + ENVV.ATLAS_KAKAO_ADMIN_KEY};
  R.deps.onGone = async () => { throw Error('down'); };
  const r1 = await R.call(new Request(`${SITE}/api/kakao/unlinked?user_id=${id}&referrer_type=UNLINK_FROM_APPS`, {headers: h}));
  assert.equal(r1.status, 500); assert.deepEqual(await r1.json(), {error: 'delete'});
  assert.equal(await isMember(R.store, mh), true);
  assert.deepEqual(R.logs, ['unlinked error Error']);
  R.deps.onGone = null;
  assert.equal((await R.call(new Request(`${SITE}/api/kakao/unlinked?user_id=${id}`, {headers: h}))).status, 200);
  assert.equal(await isMember(R.store, mh), false);
  assert.equal((await R.call(new Request(`${SITE}/api/kakao/unlinked?user_id=4999999998`, {headers: h}))).status, 200);
});

test('VK F2 — 넷리파이 함수 그대로(functions/atlas11/kakao.mjs + Blobs 로컬 서버 + 가짜 카카오): 탈퇴하면 편지 여는 밤 기록의 카카오 회원 표도 뗌', async () => {
  const {BlobsServer} = await import('@netlify/blobs/server');
  const dir = await fs.mkdtemp(path.join(os.tmpdir(), 'kakao-blobs-')), token = 'local-kakao-token';
  const server = new BlobsServer({directory: dir, token}), {port} = await server.start(), edge = `http://127.0.0.1:${port}`;
  const saved = {ctx: process.env.NETLIFY_BLOBS_CONTEXT, fetch: globalThis.fetch, env: Object.fromEntries(Object.keys(ENVV).map(k => [k, process.env[k]]))};
  const fake = createFakeKakao({restKey: ENVV.ATLAS_KAKAO_REST_KEY, clientSecret: ENVV.ATLAS_KAKAO_CLIENT_SECRET, adminKey: ENVV.ATLAS_KAKAO_ADMIN_KEY});
  process.env.NETLIFY_BLOBS_CONTEXT = Buffer.from(JSON.stringify({edgeURL: edge, uncachedEdgeURL: edge, siteID: 'local-site', token})).toString('base64');
  Object.assign(process.env, ENVV);
  globalThis.fetch = (u, init) => { const s = String(u?.url ?? u); return s.startsWith(AUTH) || s.startsWith(API) ? fake.fetch(u, init) : saved.fetch(u, init); }; // 카카오 주소만 가짜로 · Blobs 는 그대로
  try {
    const fn = (await import('../../functions/atlas11/kakao.mjs')).default;
    const cookieOf = (r, name) => r.headers.getSetCookie().find(c => c.startsWith(name + '='))?.split(';')[0];
    const s1 = await fn(new Request(cardUrl('/next/#/')));
    assert.equal(s1.status, 302);
    const consent = await fake.handle(new Request(s1.headers.get('location'))), back = await fake.handle(new Request(agreeHref(await consent.text(), AUTH + '/oauth/authorize')));
    const cb = await fn(new Request(back.headers.get('location'), {headers: {cookie: cookieOf(s1, COOKIE.state)}}));
    assert.equal(cb.status, 302); assert.equal(cb.headers.get('location'), '/next/?kakao=ok#/');
    const login = cookieOf(cb, COOKIE.login), id = String([...fake.users.keys()][0]), mh = mhOf(id);
    const {getStore} = await import('@netlify/blobs'), {join, mintCode, LETTER_STORE} = await import('../../lib/atlas11/letter.mjs');
    const ls = getStore({name: LETTER_STORE, consistency: 'strong'}), now = new Date();
    assert.equal((await join(ls, {code: await mintCode(ls, 'owner', now.toISOString()), nick: '가나다라'}, now, {kakao: mh})).status, 201);
    const letters = async () => JSON.stringify(await Promise.all(((await ls.list({prefix: 'm/'})).blobs).map(b => ls.get(b.key, {type: 'json'}))));
    assert.ok((await letters()).includes(mh), '붙음');
    const w = await fn(new Request(SITE + '/api/kakao/withdraw', {method: 'POST', headers: {...SAME, cookie: login}}));
    assert.equal(w.status, 200); assert.deepEqual(await w.json(), {ok: true, removed: true, unlinked: true});
    assert.ok(!(await letters()).includes(mh), '탈퇴 뒤 편지 기록에 카카오 회원 표 0');
    assert.ok((await letters()).includes('가나다라'), '편지 회원은 그대로');
  } finally {
    globalThis.fetch = saved.fetch;
    if (saved.ctx === undefined) delete process.env.NETLIFY_BLOBS_CONTEXT; else process.env.NETLIFY_BLOBS_CONTEXT = saved.ctx;
    for (const [k, v] of Object.entries(saved.env)) if (v === undefined) delete process.env[k]; else process.env[k] = v;
    await server.stop(); await fs.rm(dir, {recursive: true, force: true});
  }
});
