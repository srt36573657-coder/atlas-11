// 고도리 카카오 브라우저 쪽 시험(site/next/kakao.js · 일꾼 K2c · 잣대 docs/design/godori-2026-10-18/accept/K2s.md)
// 가짜 fetch · 가짜 저장소 · 가짜 카카오 도구 — 브라우저 없음(브라우저 쪽 그림은 scripts/atlas11/next/check_share.mjs 가 잼)
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {fileURLToPath} from 'node:url';
import path from 'node:path';
import {createKakao, cleanTo, mergeKeys, KEYS, NEVER, FLAG_MEMBER, FLAG_OFFERED, BASE, SS_STATUS, SS_SILENT, SWITCH, SIGNUP, SHARE, SDK, SDK_HOST, sdkOf, sdkFilled, fileName} from '../../site/next/kakao.js';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const ORIGIN = 'https://aaa7377.com';
const mem = (init = {}) => { const m = new Map(Object.entries(init)); return {getItem: k => (m.has(k) ? m.get(k) : null), setItem: (k, v) => { m.set(k, String(v)); }, removeItem: k => { m.delete(k); }, _m: m}; };
const jres = (status, body) => ({ok: status >= 200 && status < 300, status, json: async () => { if (body === undefined) throw new Error('no body'); return body; }});
/** routes: {'GET /api/kakao/me': status | [status, body] | fn(init) → [status, body]} */
function net(routes, log) {
  return async (url, init = {}) => {
    const key = (init.method || 'GET') + ' ' + url;
    log.push({key, url, init});
    const r = routes[key];
    if (r === undefined) return jres(404);
    const v = typeof r === 'function' ? r(init) : r;
    if (Array.isArray(v)) return jres(v[0], v[1]);
    return jres(v);
  };
}
/** 한 번에 만들기 — 기본: 스위치 켜짐 · 우리 사이트 · 가짜 저장소 */
function mk(o = {}) {
  const log = [], gos = [], events = [], downloads = [], offers = [], urls = [];
  const clock = {t: 1760000000000};
  const ls = o.ls ?? mem(), ss = o.ss ?? mem();
  const env = {
    fetch: net(o.routes ?? {}, log), ls, ss, switchOn: o.switchOn ?? true,
    loc: {hostname: 'aaa7377.com', origin: ORIGIN, pathname: '/', search: '', hash: '#/', ...(o.loc ?? {})},
    ua: o.ua ?? 'Mozilla/5.0 (iPhone) Safari', now: () => clock.t,
    go: u => gos.push(u), replaceUrl: u => urls.push(u), emit: d => events.push(d),
    download: o.download ?? ((name, text) => { downloads.push({name, text}); return true; }),
    showOffer: o.showOffer ?? (async () => { offers.push(1); return true; }),
    addScript: o.addScript ?? (() => { throw new Error('이 시험에서는 카카오 도구를 받지 않음'); }),
    kakao: o.kakao ?? undefined, sdk: o.sdk, test: o.test, shareOn: o.shareOn, shareTest: o.shareTest,
  };
  for (const k of ['kakao', 'sdk', 'test', 'shareOn', 'shareTest']) if (o[k] === undefined) delete env[k];
  const K = createKakao(env);
  return {K, log, gos, events, downloads, offers, urls, ls, ss, clock, env};
}
const ME_OFF = {'GET /api/kakao/me': 404};
const ME_ON = {'GET /api/kakao/me': [200, {on: true, member: false}]};
const ME_MEMBER = {'GET /api/kakao/me': [200, {on: true, member: true, ref: 'ABCDEFGHIJKL', friends: 2, next: 3, code: null}]};
const why = (at, code = '005930', extra = {}) => ({at, code, name: '가', price: 1000, answers: [0], ...extra});
const fakeKakao = (sent, {init = true} = {}) => ({isInitialized: () => init, init() {}, Share: {sendDefault: o => { sent.push(o); }}});

test('① 꺼짐(스위치 false) — 서버를 묻지 않음 · 요청 0 · 하는 일 0 · 기록 파일은 늘 됨', async () => {
  const t = mk({switchOn: false, routes: ME_ON, ls: mem({[FLAG_MEMBER]: '1', 'atlas:godori-why': JSON.stringify([why('2026-10-01T00:00:00Z')])})});
  assert.equal(t.K.on, false);
  assert.equal((await t.K.ready()).on, false);
  assert.equal(await t.K.sdkReady(), false);
  assert.equal(t.K.start('#/s/x'), false);
  assert.equal(await t.K.offer('journal'), false);
  assert.equal(await t.K.withdraw(), false);
  assert.equal(t.K.sendCard({title: 'a', url: ORIGIN + '/', buttons: [{title: 'b', url: ORIGIN + '/'}]}), false);
  assert.equal(t.K.member(), false); assert.equal(t.K.ref(), null); assert.equal(t.K.friends(), null); assert.equal(t.K.canSend(), false);
  t.K.boot(); await t.K.ready();
  const ex = t.K.exportFile();
  assert.equal(ex.ok, true); assert.equal(ex.keys, 1);
  assert.equal(t.log.length, 0, '요청 0(가입 꺼짐 · 공유 꺼짐 — 공유 값은 화면 코드 속 사본이라 읽는 요청도 없음)');
  assert.deepEqual(t.gos, []); assert.deepEqual(t.offers, []); assert.deepEqual(t.events, []);
});

test('② 스위치 켜짐 · 서버가 꺼짐(404) — on false · 한 탭에서 한 번만 물음(다시 열어도 기억)', async () => {
  const t = mk({routes: ME_OFF});
  assert.equal((await t.K.ready()).on, false);
  await t.K.ready(); await t.K.ready();
  assert.equal(t.log.length, 1);
  assert.equal(t.K.start('#/s/x'), false); assert.equal(await t.K.offer('journal'), false);
  assert.deepEqual(t.offers, [], '꺼져 있으면 권유 칸 0');
  const t2 = mk({routes: ME_OFF, ss: t.ss}); await t2.K.ready();
  assert.equal(t2.log.length, 0, '같은 탭 기억(sessionStorage)');
  assert.ok(JSON.parse(t.ss.getItem(SS_STATUS)).s.on === false);
});

test('②-2 서버가 안 닿음(망 오류) — 꺼짐으로 풀림 · 기억하지 않음 · 1분 뒤 다시 물음', async () => {
  const t = mk({routes: {}});
  t.env.fetch = async () => { throw new Error('망 없음'); };
  const t2 = createKakao({...t.env, fetch: async () => { throw new Error('망 없음'); }});
  assert.equal((await t2.ready()).on, false);
  assert.equal(t.ss.getItem(SS_STATUS), null, '실패는 기억하지 않음');
});

test('③ 켜짐 · 회원 아님 — start 는 주소 하나로 이동(우리 화면 없음) · 돌아올 길 보존', async () => {
  const t = mk({routes: ME_ON});
  assert.equal((await t.K.ready()).on, true);
  assert.equal(t.K.member(), false);
  assert.equal(t.K.start('#/s/005930/2026-10-16/70000/s/abc'), true);
  assert.equal(t.gos.length, 1);
  const u = new URL(t.gos[0], ORIGIN);
  assert.equal(u.pathname, '/api/kakao/start');
  assert.equal(u.searchParams.get('to'), '/#/s/005930/2026-10-16/70000/s/abc');
  assert.equal(u.searchParams.get('ref'), null); assert.equal(u.searchParams.get('prompt'), null);
  // 시험판(?dev=1)은 그대로 이어 감 · 전체 길
  const t2 = mk({routes: ME_ON, loc: {pathname: '/next/', search: '?dev=1', hash: '#/w/005930'}});
  await t2.K.ready();
  assert.equal(new URL(t2.K.startUrl(), ORIGIN).searchParams.get('to'), '/next/?dev=1#/w/005930', '아무것도 안 주면 지금 쪽');
  assert.equal(new URL(t2.K.startUrl('#/s/a'), ORIGIN).searchParams.get('to'), '/next/?dev=1#/s/a');
  assert.equal(new URL(t2.K.startUrl('/next/?dev=1#/s/b'), ORIGIN).searchParams.get('to'), '/next/?dev=1#/s/b');
  // 보낸 사람 표
  const v = new URL(t2.K.startUrl('#/s/a', {ref: 'ABCDEFGHIJKL'}), ORIGIN);
  assert.equal(v.searchParams.get('ref'), 'ABCDEFGHIJKL');
  assert.equal(new URL(t2.K.startUrl('#/s/a', {ref: 'bad ref!'}), ORIGIN).searchParams.get('ref'), null, '꼴이 틀린 표는 안 보냄');
  assert.equal(new URL(t2.K.startUrl('#/s/a', {ref: null}), ORIGIN).searchParams.get('ref'), null);
  assert.equal(new URL(t2.K.startUrl('#/s/a', {silent: true}), ORIGIN).searchParams.get('prompt'), 'none');
  assert.equal(t.log.filter(x => !x.key.includes('/me')).length, 0, '시작은 요청 없이 이동만');
});

test('④ 켜짐 · 회원 — 표 · 친구 수 · 알림 한 번 · 가입 단추 · 권유 0', async () => {
  const t = mk({routes: {...ME_MEMBER, 'GET /api/kakao/data': [200, {data: {}}], 'PUT /api/kakao/data': [200, {ok: true, data: {}}]}});
  await t.K.ready();
  assert.equal(t.K.member(), true); assert.equal(t.K.ref(), 'ABCDEFGHIJKL');
  assert.deepEqual(t.K.friends(), {n: 2, next: 3, code: null});
  assert.equal(t.ls.getItem(FLAG_MEMBER), '1');
  assert.equal(t.K.start('#/s/x'), false, '이미 회원이면 이동 없음'); assert.deepEqual(t.gos, []);
  assert.equal(await t.K.offer('journal'), false); assert.deepEqual(t.offers, []);
  assert.deepEqual(t.events, [{on: true, member: true}], '알림은 바뀔 때 한 번');
  // 이상한 /me 값은 걸러냄
  const t2 = mk({routes: {'GET /api/kakao/me': [200, {on: true, member: true, ref: '<script>', friends: -1, next: 1.5, code: 'a b'}]}});
  await t2.K.ready(); assert.equal(t2.K.ref(), null); assert.equal(t2.K.friends().n, null); assert.equal(t2.K.friends().code, null);
});

test('⑤ 기록 맞추기 — {data} 로 올림 · 합침(줄지 않음) · 뺀 것은 off · 로그인 풀림은 기록 그대로', async () => {
  const L = {'atlas:godori-why': [why('2026-10-02T00:00:00Z'), why('2026-10-01T00:00:00Z', '000660')], 'atlas:new:sub': ['a', 'x'], 'atlas:new:later': [], 'atlas:godori-hold': [{id: 'h1', code: '005930'}]};
  const R = {'atlas:godori-why': [why('2026-10-03T00:00:00Z', '035720'), why('2026-10-02T00:00:00Z')], 'atlas:new:sub': ['b', 'a'], 'atlas:godori-hold': [{id: 'h1', code: '005930', sold: true}, {id: 'h2', code: '000660'}]};
  const ls = mem(Object.fromEntries(Object.entries(L).map(([k, v]) => [k, JSON.stringify(v)])));
  let body = null;
  const t = mk({ls, routes: {...ME_MEMBER, 'GET /api/kakao/data': [200, {data: R, at: 'x'}], 'PUT /api/kakao/data': init => { body = JSON.parse(init.body); return [200, {ok: true, data: body.data, added: 1, skipped: 0}]; }}});
  await t.K.ready(); await t.K.sync();
  assert.deepEqual(Object.keys(body.data).sort(), [...KEYS].sort());
  assert.deepEqual(body.data['atlas:godori-why'].map(r => r.at), ['2026-10-03T00:00:00Z', '2026-10-02T00:00:00Z', '2026-10-01T00:00:00Z'], '때 · 종목이 같으면 한 줄 · 새것 먼저');
  assert.deepEqual(body.data['atlas:new:sub'], ['a', 'x', 'b'], '이 기기 차례가 먼저 · 합침');
  assert.equal(body.data['atlas:godori-hold'].length, 2); assert.equal(body.data['atlas:godori-hold'].find(r => r.id === 'h1').sold, true, '판 것 표시가 이김');
  assert.equal(body.off, undefined);
  const put = t.log.find(x => x.key === 'PUT /api/kakao/data');
  assert.equal(put.init.credentials, 'same-origin'); assert.equal(put.init.headers['content-type'], 'application/json');
  // 이 기기에 합친 것이 내려옴 · 이 기기에 있던 것은 안 줄어듦
  assert.deepEqual(JSON.parse(ls.getItem('atlas:new:sub')), ['a', 'x', 'b']);
  assert.equal(JSON.parse(ls.getItem('atlas:godori-why')).length, 3);
  assert.ok(JSON.parse(ls.getItem(BASE))['atlas:new:sub'].includes('x'));
  // 이 기기에서 「x」를 뺌 → 다음 맞추기에서 off 로 알림 · 서버 사본에서도 빠짐
  ls.setItem('atlas:new:sub', JSON.stringify(['a', 'b']));
  body = null; await t.K.sync();
  assert.deepEqual(body.off, {'atlas:new:sub': ['x']});
  assert.ok(!body.data['atlas:new:sub'].includes('x'));
  // 로그인이 풀리면 기록은 그대로 · 회원 표시는 이 기기에 남음
  const t3 = mk({ls, routes: {...ME_MEMBER, 'GET /api/kakao/data': 401}});
  const before = ls.getItem('atlas:new:sub');
  await t3.K.ready(); await new Promise(r => setTimeout(r, 5)); // 회원이면 ready() 가 기록 맞추기를 바로 시작함
  assert.equal(t3.K.member(), false, '로그인이 풀리면 회원 아님'); assert.equal(ls.getItem('atlas:new:sub'), before, '기록은 그대로'); assert.equal(ls.getItem(FLAG_MEMBER), '1', '이 기기 표시는 남음');
  assert.deepEqual(t3.events.map(e => e.member), [true, false]);
  assert.equal(t3.log.filter(x => x.key.startsWith('PUT')).length, 0, '로그인이 풀리면 올리지 않음');
});

test('⑥ 내 돈 칸 · 본 기록은 읽지도 올리지도 내보내지도 않음', async () => {
  const money = JSON.stringify({total: 987654321, secret: 'MONEYMARK'});
  const ls = mem({[NEVER]: money, 'atlas:new:hist': JSON.stringify(['HISTMARK']), 'atlas:new:sub': JSON.stringify(['a'])});
  const bodies = [];
  const t = mk({ls, routes: {...ME_MEMBER, 'GET /api/kakao/data': [200, {data: {}}], 'PUT /api/kakao/data': init => { bodies.push(init.body); return [200, {ok: true, data: {}}]; }}});
  await t.K.ready(); await t.K.sync(); await t.K.sync();
  const out = t.K.exportFile();
  assert.ok(bodies.length >= 1);
  for (const b of bodies) { assert.ok(!b.includes('MONEYMARK') && !b.includes('987654321') && !b.includes('HISTMARK') && !b.includes('godori-money'), '올린 글에 내 돈 칸 0'); }
  assert.ok(!t.downloads[0].text.includes('MONEYMARK') && !t.downloads[0].text.includes('godori-money') && !t.downloads[0].text.includes('HISTMARK'), '기록 파일에 내 돈 칸 0');
  assert.equal(out.keys, 1);
  assert.equal(ls.getItem(NEVER), money, '내 돈 칸은 그대로(안 건드림)');
  // 소스에도 내 돈 칸 이름은 상수 하나와 글 속 설명뿐 — 읽는 코드 0
  const src = fs.readFileSync(path.join(ROOT, 'site/next/kakao.js'), 'utf8');
  const code = src.replace(/\/\*[\s\S]*?\*\//g, '').split('\n').map(l => l.replace(/\/\/.*$/, '')).join('\n');
  assert.equal((code.match(/atlas:godori-money/g) || []).length, 1, '코드 속 이름은 NEVER 상수 한 곳');
});

test('⑦ 기록 파일 — 넷만 · 파일 이름 · 요청 0(회원이어도) · 내려받기가 막히면 false', async () => {
  const ls = mem({'atlas:godori-why': JSON.stringify([why('2026-10-01T00:00:00Z')]), 'atlas:new:sub': JSON.stringify(['a']), 'atlas:godori-hold': '깨진 글', 'other': 'x'});
  const t = mk({ls, routes: ME_MEMBER});
  await t.K.ready(); const n = t.log.length;
  const r = t.K.exportFile();
  assert.equal(t.log.length, n, '기록 파일 = 요청 0');
  assert.equal(r.ok, true); assert.match(r.name, /^[a-z]+-records-\d{4}-\d{2}-\d{2}\.json$/); assert.equal(r.name, fileName(new Date(t.clock.t)));
  const j = JSON.parse(t.downloads[0].text);
  assert.equal(j.schema, 'godori-device-records-1'); assert.deepEqual(Object.keys(j.keys).sort(), ['atlas:godori-why', 'atlas:new:sub'], '있는 것만 · 깨진 것 · 다른 열쇠는 안 넣음');
  const t2 = mk({ls, download: () => false});
  assert.equal(t2.K.exportFile(), false);
  const t3 = mk({ls: mem(), download: () => { throw new Error('막힘'); }});
  assert.equal(t3.K.exportFile(), false);
  assert.equal(mk({ls: mem()}).K.exportFile().keys, 0, '기록이 없어도 빈 파일은 만들어짐');
});

test('⑧ 가입 권유 — 매매일지 끝낸 뒤 한 번 · 꺼짐 · 회원이면 0 · 안 그려졌으면 다시 시도', async () => {
  const t = mk({routes: ME_ON});
  assert.equal(await t.K.offer('chat'), false, '매매일지 밖에서는 안 뜸');
  assert.deepEqual(t.log, [], '다른 곳에서는 서버도 안 물음');
  assert.equal(await t.K.offer('journal'), true);
  assert.equal(t.offers.length, 1); assert.equal(t.ls.getItem(FLAG_OFFERED), '1');
  assert.equal(await t.K.offer('journal'), false); assert.equal(t.offers.length, 1, '한 번만');
  // 새 탭에서도 한 번만(localStorage)
  const t2 = mk({routes: ME_ON, ls: t.ls}); assert.equal(await t2.K.offer('journal'), false); assert.equal(t2.offers.length, 0);
  // 결과 칸이 안 그려져 못 띄웠으면 표시를 남기지 않음 → 다음에 다시
  const t3 = mk({routes: ME_ON, showOffer: async () => false});
  assert.equal(await t3.K.offer('journal'), false); assert.equal(t3.ls.getItem(FLAG_OFFERED), null);
  const t4 = mk({routes: ME_ON, showOffer: async () => { throw new Error('깨짐'); }});
  assert.equal(await t4.K.offer('journal'), false); assert.equal(t4.ls.getItem(FLAG_OFFERED), null);
  // 앞서 가입했던 기기(로그인 풀림)는 이미 보였어도 다시 권함
  const t5 = mk({routes: ME_ON, ls: mem({[FLAG_OFFERED]: '1', [FLAG_MEMBER]: '1'})});
  assert.equal(await t5.K.offer('journal'), true);
});

test('⑨ 탈퇴 — 서버에 POST 한 번 · 다 했다고 한 때만 true · 이 기기 가입 표시만 지움 · 안 끝났으면(502 · 500 · 403 · 망) 그대로 · 로그인이 풀렸으면(401) 회원이 아닌 것으로', async () => {
  const MEM = {...ME_MEMBER, 'GET /api/kakao/data': [200, {data: {}}], 'PUT /api/kakao/data': [200, {ok: true, data: {}}]};
  const ls = mem({'atlas:new:sub': JSON.stringify(['a'])});
  const t = mk({ls, routes: {...MEM, 'POST /api/kakao/withdraw': [200, {ok: true, removed: true, unlinked: true}]}});
  assert.equal(await t.K.withdraw(), false, '회원이 되기 전에는 false');
  await t.K.ready(); await t.K.sync();
  assert.equal(await t.K.withdraw(), true);
  const w = t.log.find(x => x.key === 'POST /api/kakao/withdraw');
  assert.ok(w); assert.equal(w.init.body, undefined, '본문 없음'); assert.equal(w.init.credentials, 'same-origin');
  assert.equal(t.K.member(), false); assert.equal(ls.getItem(FLAG_MEMBER), null); assert.equal(ls.getItem(BASE), null); assert.equal(t.ss.getItem(SS_STATUS), null);
  assert.equal(ls.getItem('atlas:new:sub'), JSON.stringify(['a']), '이 기기 기록은 그대로');
  assert.deepEqual(t.events.at(-1), {on: true, member: false});
  assert.equal(t.K.start('#/s/x'), true, '탈퇴 뒤엔 다시 가입 단추가 됨');
  // 안 끝난 답들 — 502 {unlink}: 카카오 연결을 못 끊음(아무것도 안 지움) · 500 {delete}: 연결은 끊겼고 서버 사본이 덜 지워짐 · 403 {origin} · 200 인데 다 했다는 말이 없음 · 망 오류 → 모두 false · 그대로 회원 · 표시 그대로 · 알림 없음
  for (const [nm, ans] of [['502 unlink', [502, {error: 'unlink'}]], ['500 delete', [500, {error: 'delete'}]], ['403 origin', [403, {error: 'origin'}]], ['200 인데 unlinked 가 아님', [200, {ok: true, unlinked: false}]], ['200 인데 본문 없음', [200]], ['404', 404]]) {
    const u = mk({routes: {...MEM, 'POST /api/kakao/withdraw': ans}}); await u.K.ready();
    const before = u.events.length;
    assert.equal(await u.K.withdraw(), false, nm); assert.equal(u.K.member(), true, nm + ' — 그대로 회원'); assert.equal(u.ls.getItem(FLAG_MEMBER), '1', nm + ' — 표시 그대로'); assert.equal(u.events.length, before, nm + ' — 알림 없음');
  }
  const base0 = mk({routes: MEM}), flaky = createKakao({...base0.env, fetch: (url, init) => (String(url).endsWith('/withdraw') ? Promise.reject(new Error('망 없음')) : base0.env.fetch(url, init))}); await flaky.ready();
  assert.equal(await flaky.withdraw(), false, '망 오류'); assert.equal(flaky.member(), true); assert.equal(base0.ls.getItem(FLAG_MEMBER), '1');
  // 502 뒤 다시 누르면 끝남(카카오가 「이미 끊김」으로 답하고 서버가 지움)
  let n = 0;
  const again = mk({routes: {...MEM, 'POST /api/kakao/withdraw': () => (++n === 1 ? [502, {error: 'unlink'}] : [200, {ok: true, removed: true, unlinked: true}])}}); await again.K.ready();
  assert.equal(await again.K.withdraw(), false); assert.equal(again.K.member(), true);
  assert.equal(await again.K.withdraw(), true); assert.equal(again.K.member(), false); assert.equal(again.ls.getItem(FLAG_MEMBER), null);
  // 401 — 로그인이 이미 풀림: false · 회원이 아닌 것으로 바뀜(알림 한 번) · 이 기기 표시는 남김(조용한 로그인 · 다시 권유가 되게)
  const gone = mk({routes: {...MEM, 'POST /api/kakao/withdraw': [401, {error: 'member_only'}]}}); await gone.K.ready();
  assert.equal(await gone.K.withdraw(), false); assert.equal(gone.K.member(), false); assert.equal(gone.ls.getItem(FLAG_MEMBER), '1'); assert.deepEqual(gone.events.at(-1), {on: true, member: false}); assert.equal(gone.ss.getItem(SS_STATUS), null);
});

test('⑩ 돌아올 길(cleanTo) — 우리 사이트 길만 · 512자 안 · 이상하면 지금 쪽', () => {
  const loc = {origin: ORIGIN, pathname: '/next/', search: '?dev=1'};
  assert.equal(cleanTo('#/s/a', loc), '/next/?dev=1#/s/a');
  assert.equal(cleanTo('/next/?dev=1#/s/a', loc), '/next/?dev=1#/s/a');
  assert.equal(cleanTo('/', loc), '/');
  assert.equal(cleanTo(ORIGIN + '/next/?dev=1#/s/a', loc), '/next/?dev=1#/s/a', '같은 사이트의 전체 주소는 길로');
  for (const bad of ['https://evil.example/#/s/a', '//evil.example/x', 'javascript:alert(1)', '/x\\y', '/x\u0000y', '/' + 'a'.repeat(600), '', null, undefined, 42]) {
    assert.equal(cleanTo(bad, loc), '/next/?dev=1#/', String(bad).slice(0, 30));
  }
  assert.equal(cleanTo('//evil.example', {origin: ORIGIN, pathname: '/', search: ''}, '/x'), '/x', '바탕값 지정');
});

test('⑪ 기록 합치기(mergeKeys) — 합집합 · 지우지 않음 · 네 열쇠 밖은 버림', () => {
  const m = mergeKeys({'atlas:new:sub': ['a'], [NEVER]: 'x', foo: 1}, {'atlas:new:sub': ['b'], 'atlas:new:later': ['z']});
  assert.deepEqual(Object.keys(m).sort(), ['atlas:new:later', 'atlas:new:sub']);
  assert.ok(!(NEVER in m) && !('foo' in m));
  assert.deepEqual(m['atlas:new:sub'], ['a', 'b']);
  assert.deepEqual(mergeKeys({}, {}), {});
  assert.deepEqual(mergeKeys({'atlas:godori-why': [null, 3, why('2026-10-01T00:00:00Z')]}, {})['atlas:godori-why'].length, 1, '깨진 줄은 건너뜀');
  const h = mergeKeys({'atlas:godori-hold': [{id: 'a'}, {id: 'a', sold: true}]}, {'atlas:godori-hold': [{id: 'b', wrong: true}]});
  assert.deepEqual(h['atlas:godori-hold'].map(r => r.id + (r.sold ? 's' : '') + (r.wrong ? 'w' : '')), ['as', 'bw']);
  assert.deepEqual(mergeKeys({'atlas:new:sub': 'x'}, {'atlas:new:sub': [1, 'q']})['atlas:new:sub'], ['q'], '글자가 아닌 것은 버림');
});

test('⑫ 카드 보내기(sendCard) — feed 한 장 · 단추 둘까지 · 우리 사이트 주소만', async () => {
  const sent = [];
  const t = mk({routes: ME_ON, kakao: fakeKakao(sent), shareOn: true});
  await t.K.ready(); assert.equal(t.K.canSend(), true); assert.equal(await t.K.sdkReady(), true);
  const card = {title: '삼성전자', description: '이거 어때?\n10월 16일 값 70,000원', imageUrl: ORIGIN + '/og-makbi.jpg', url: ORIGIN + '/#/s/005930/2026-10-16/70000/s/abc',
    buttons: [{title: '카카오로 시작하기', url: ORIGIN + '/api/kakao/start?to=%2F%23%2Fs%2Fx'}, {title: '그냥 보기', url: ORIGIN + '/#/s/005930/2026-10-16/70000/s/abc'}, {title: '셋째', url: ORIGIN + '/x'}]};
  assert.equal(t.K.sendCard(card), true);
  assert.equal(sent.length, 1);
  const c = sent[0];
  assert.equal(c.objectType, 'feed'); assert.equal(c.content.title, '삼성전자'); assert.equal(c.content.description, card.description); assert.equal(c.content.imageUrl, card.imageUrl);
  assert.deepEqual(c.content.link, {mobileWebUrl: card.url, webUrl: card.url});
  assert.equal(c.buttons.length, 2, '카카오 카드 단추는 둘까지'); assert.deepEqual(c.buttons.map(b => b.title), ['카카오로 시작하기', '그냥 보기']);
  assert.equal(c.buttons[0].link.webUrl, card.buttons[0].url);
  // 남의 주소는 거름 — 그림 · 단추 · 카드 주소
  sent.length = 0;
  assert.equal(t.K.sendCard({...card, imageUrl: 'https://evil.example/a.jpg'}), true); assert.equal(sent[0].content.imageUrl, undefined);
  sent.length = 0; assert.equal(t.K.sendCard({...card, buttons: [{title: 'x', url: 'https://evil.example/'}, card.buttons[1]]}), true); assert.equal(sent[0].buttons.length, 1);
  sent.length = 0; assert.equal(t.K.sendCard({...card, buttons: [{title: 'x', url: 'https://evil.example/'}]}), false);
  assert.equal(t.K.sendCard({...card, url: 'https://evil.example/'}), false);
  assert.equal(t.K.sendCard({...card, title: ''}), false); assert.equal(t.K.sendCard(null), false); assert.equal(t.K.sendCard('x'), false);
  assert.equal(sent.length, 0);
  // 도구가 안 켜졌거나 던지면 false(보내는 쪽이 휴대폰 공유 창으로 바꿈)
  const t2 = mk({routes: ME_ON, kakao: fakeKakao([], {init: false}), shareOn: true}); await t2.K.ready(); assert.equal(t2.K.sendCard(card), false); assert.equal(t2.K.canSend(), false);
  const bad = {isInitialized: () => true, Share: {sendDefault() { throw new Error('막힘'); }}};
  const t3 = mk({routes: ME_ON, kakao: bad, shareOn: true}); await t3.K.ready(); assert.equal(t3.K.sendCard(card), false);
  const t4 = mk({routes: ME_ON}); await t4.K.ready(); assert.equal(t4.K.canSend(), false); assert.equal(await t4.K.sdkReady(), false, '공유 값(SDK 세 칸)이 비어 있으면 받지 않음');
  // 스위치 둘([7] 1) — 가입이 꺼져도(서버 404) 공유가 켜지면 카드가 감 · 공유가 꺼지면 가입이 켜져도 카드 0
  const s2 = [], onlyShare = mk({routes: ME_OFF, kakao: fakeKakao(s2), shareOn: true}); await onlyShare.K.ready();
  assert.equal(onlyShare.K.on, false); assert.equal(onlyShare.K.share, true); assert.equal(onlyShare.K.sendCard(card), true); assert.equal(s2.length, 1);
  const s3 = [], onlySignup = mk({routes: ME_ON, kakao: fakeKakao(s3), shareOn: false}); await onlySignup.K.ready();
  assert.equal(onlySignup.K.on, true); assert.equal(onlySignup.K.share, false); assert.equal(onlySignup.K.sendCard(card), false); assert.equal(onlySignup.K.canSend(), false); assert.equal(s3.length, 0);
});

test('⑬ 동의 화면에서 돌아옴(?kakao=ok|none) — 주소에서 지움 · 서버 기억 버림 · none 은 조용한 로그인 멈춤', async () => {
  const ss = mem({[SS_STATUS]: JSON.stringify({t: 1760000000000, s: {on: true, member: false}})});
  const t = mk({routes: ME_MEMBER, ss, loc: {pathname: '/next/', search: '?dev=1&kakao=ok', hash: '#/s/a'}, routes2: null});
  t.K.boot(); await t.K.ready();
  assert.deepEqual(t.urls, ['/next/?dev=1#/s/a'], 'kakao 만 지우고 나머지는 그대로');
  assert.equal(t.K.member(), true, '앞서 적어 둔 「회원 아님」 기억을 버리고 서버에 다시 물음');
  assert.equal(t.log.filter(x => x.key === 'GET /api/kakao/me').length, 1);
  const t2 = mk({routes: ME_ON, loc: {pathname: '/', search: '?kakao=none', hash: '#/s/a'}, ls: mem({[FLAG_MEMBER]: '1'}), ua: 'KAKAOTALK 10.0'});
  t2.K.boot(); await t2.K.ready();
  assert.deepEqual(t2.urls, ['/#/s/a']); assert.ok(t2.ss.getItem(SS_SILENT)); assert.deepEqual(t2.gos, [], 'none 을 받은 뒤엔 조용한 로그인을 되풀이하지 않음');
  const t3 = mk({routes: ME_ON}); t3.K.boot(); assert.deepEqual(t3.urls, []); assert.equal(t3.log.length, 0, '처음 온 사람 · 표 없음 = 서버도 안 물음');
});

test('⑭ 조용한 로그인 — 앞서 가입한 기기 + 카톡 안 + 회원 아님일 때만 · 30분에 한 번', async () => {
  const flagged = () => mem({[FLAG_MEMBER]: '1'});
  const t = mk({routes: ME_ON, ls: flagged(), ua: 'Mozilla/5.0 KAKAOTALK/10.4'});
  t.K.boot(); await t.K.ready();
  assert.equal(t.gos.length, 1); const u = new URL(t.gos[0], ORIGIN);
  assert.equal(u.pathname, '/api/kakao/start'); assert.equal(u.searchParams.get('prompt'), 'none'); assert.equal(u.searchParams.get('to'), '/#/');
  // 같은 탭에서 다시 열어도 30분 안에는 안 함
  const again = mk({routes: ME_ON, ls: t.ls, ss: t.ss, ua: 'KAKAOTALK'}); again.K.boot(); await again.K.ready(); assert.equal(again.gos.length, 0);
  again.clock.t += 31 * 60e3; const later = mk({routes: ME_ON, ls: t.ls, ss: t.ss, ua: 'KAKAOTALK'}); later.clock.t = again.clock.t; later.ss.setItem(SS_STATUS, 'x'); later.K.boot(); await later.K.ready();
  assert.equal(later.gos.length, 1, '30분 지난 뒤에는 다시');
  // 처음 온 사람(표 없음) · 카톡 밖 · 이미 로그인 · 시각을 못 적는 기계
  const fresh = mk({routes: ME_ON, ua: 'KAKAOTALK'}); fresh.K.boot(); await Promise.resolve(); assert.equal(fresh.log.length, 0, '처음 온 사람 = 시작 때 서버도 안 물음'); await fresh.K.ready(); assert.equal(fresh.gos.length, 0, '처음 온 사람은 건드리지 않음');
  const outside = mk({routes: ME_ON, ls: flagged(), ua: 'Safari'}); outside.K.boot(); await outside.K.ready(); assert.equal(outside.gos.length, 0);
  const member = mk({routes: {...ME_MEMBER, 'GET /api/kakao/data': [200, {data: {}}], 'PUT /api/kakao/data': [200, {ok: true, data: {}}]}, ls: flagged(), ua: 'KAKAOTALK'}); member.K.boot(); await member.K.ready(); assert.equal(member.gos.length, 0);
  const blocked = mk({routes: ME_ON, ls: flagged(), ua: 'KAKAOTALK', ss: {getItem: () => null, setItem() { throw new Error('막힘'); }, removeItem() {}}}); blocked.K.boot(); await blocked.K.ready(); assert.equal(blocked.gos.length, 0, '시각을 못 적으면 하지 않음(되풀이 막기)');
  const off = mk({routes: ME_OFF, ls: flagged(), ua: 'KAKAOTALK'}); off.K.boot(); await off.K.ready(); assert.equal(off.gos.length, 0);
});

test('⑮ 시험 서버(127.0.0.1) — 스위치가 꺼져 있으면 시험 표시가 있을 때만 서버를 물음', async () => {
  const loc = {hostname: '127.0.0.1', origin: 'http://127.0.0.1:8826', pathname: '/next/', search: '?dev=1', hash: '#/'};
  const a = mk({switchOn: false, routes: ME_ON, loc}); await a.K.ready(); assert.equal(a.log.length, 0); assert.equal(a.K.on, false);
  const b = mk({switchOn: false, routes: ME_ON, loc, test: true}); await b.K.ready(); assert.equal(b.log.length, 1); assert.equal(b.K.on, true);
  const c = mk({switchOn: false, routes: ME_ON, loc: {...loc, search: '?dev=1&kakaodev=1'}}); await c.K.ready(); assert.equal(c.K.on, true);
  const prod = mk({switchOn: false, routes: ME_ON, test: true}); await prod.K.ready(); assert.equal(prod.log.length, 0, '실제 사이트에서는 시험 표시가 있어도 스위치만 봄');
});

test('⑯ 스위치 한 곳 — SWITCH 는 저장소의 config/atlas11/kakao.json on 과 같음(파일이 없으면 false)', () => {
  const f = path.join(ROOT, 'config/atlas11/kakao.json');
  const on = fs.existsSync(f) ? JSON.parse(fs.readFileSync(f, 'utf8')).on === true : false;
  assert.equal(SWITCH, on, '켤 때는 두 곳을 함께 바꿈');
  // 편지 쪽(site/letter.js)에도 같은 불이 하나 있음 — kakao.js 를 부르면 카카오 도구 전체가 그 쪽에 만들어져서 값만 따로 둠(2026-10-18 K2c · S7l) → 셋이 늘 같아야 함
  const lj = fs.readFileSync(path.join(ROOT, 'site/letter.js'), 'utf8').replace(/\/\*[\s\S]*?\*\//g, ''), m = /^const KAKAO_ON = (true|false);/m.exec(lj);
  assert.ok(m, 'site/letter.js 에 KAKAO_ON 이 있어야 함');
  assert.equal(m[1] === 'true', SWITCH, '편지 쪽 KAKAO_ON · kakao.js SWITCH · config on 셋은 늘 같음(켤 때 함께 바꿈)');
  assert.equal(SIGNUP, SWITCH, '가입 스위치 = SWITCH');
  // 공유 스위치([7] 1 · 2 — 사장님 2026-10-18 16:39) — 값은 한 곳(config share.from = invite.json kakao 세 칸) · 따로 켜는 값 없음 · 오늘은 꺼짐
  const cfg = JSON.parse(fs.readFileSync(f, 'utf8'));
  assert.equal(cfg.share?.from, 'config/atlas11/invite.json'); assert.deepEqual(cfg.share?.fields, ['kakao.key', 'kakao.version', 'kakao.integrity']);
  assert.ok(!('key' in (cfg.share ?? {})) && !('on' in (cfg.share ?? {})), 'kakao.json 에는 공유 열쇠 · 공유 켜기 값이 없음(한 곳만)');
  const inv = JSON.parse(fs.readFileSync(path.join(ROOT, cfg.share.from), 'utf8')), want = sdkOf(inv.kakao);
  // 화면 사본 SDK = 원본 invite.json kakao(찼으면 같은 세 칸 · 비었으면 SDK 도 빔) — 켤 때 한쪽만 바꾸면 여기서 막힘
  if (want) assert.deepEqual({...SDK}, {...want}, 'site/next/kakao.js SDK 가 config/atlas11/invite.json kakao 와 다름');
  else assert.deepEqual({...SDK}, {src: '', integrity: '', key: ''}, 'invite.json 에 열쇠 · 무결성이 없으면 화면 SDK 도 비어 있어야 함');
  assert.equal(SHARE, !!want, '공유 스위치 = 원본 세 칸이 다 참');
  assert.equal(want, null, '오늘(2026-10-18)은 열쇠 · 무결성이 비어 공유 꺼짐');
  const full = {key: '0123456789abcdef0123456789abcdef', version: '2.8.3', integrity: 'sha384-' + 'Ab12'.repeat(16)};
  assert.deepEqual({...sdkOf(full)}, {src: SDK_HOST + '/kakao_js_sdk/2.8.3/kakao.min.js', integrity: full.integrity, key: full.key}, '세 칸이 다 차면 켜짐 · 도구 주소는 판에서');
  for (const half of [{...full, key: ''}, {...full, integrity: ''}, {...full, version: ''}, {...full, version: '2.8'}, {...full, integrity: 'md5-x'}, {...full, key: 'a b'}, null, 'x'])
    assert.equal(sdkOf(half), null, '반쯤 찬 것 · 꼴이 틀린 것은 꺼짐 ' + JSON.stringify(half));
  assert.equal(sdkFilled(sdkOf(full)), true); assert.equal(sdkFilled(SDK), false);
});

test('⑰ 소스 지킴 — 바깥 주소 · innerHTML · 쿠키 읽기 · 평가 0 · p-share 는 도구를 받지 않음', () => {
  const read = f => fs.readFileSync(path.join(ROOT, f), 'utf8');
  const strip = s => s.replace(/\/\*[\s\S]*?\*\//g, '').split('\n').map(l => l.replace(/(^|[^:'"`])\/\/.*$/, '$1')).join('\n');
  const k = strip(read('site/next/kakao.js')), p = strip(read('site/next/p-share.js')), sb = strip(read('site/next/share-btn.js'));
  for (const [name, code] of [['kakao.js', k], ['p-share.js', p], ['share-btn.js', sb]]) {
    const urls = (code.match(/https?:\/\/[^'"`\s)]*/g) || []).filter(u => !['http://www.w3.org/2000/svg', 'https://aaa7377.com/', ...(name === 'kakao.js' ? [SDK_HOST] : [])].includes(u)); // 그림 이름 공간 · 옛 바탕 주소(사이트 자기 이름) · kakao.js 의 카카오 도구 주소 하나(공유 값이 찼을 때만 씀)만 허락
    assert.deepEqual(urls, [], name + ' — 코드 속 바깥 주소 0');
    assert.ok(!/innerHTML|outerHTML|insertAdjacentHTML|document\.write|eval\(|new Function/.test(code), name + ' — 위험한 글 넣기 0');
    assert.ok(!/document\.cookie/.test(code), name + ' — 쿠키 읽기 0');
    assert.ok(!/회원가입/.test(code), name + ' — 「회원가입」 낱말 0');
  }
  assert.ok(!/createElement\(\s*['"]script['"]\s*\)/.test(p) && !/h\(\s*['"]script['"]/.test(p), 'p-share.js 는 바깥 스크립트를 받지 않음');
  assert.ok(!/kakao\.com|kakaocdn/.test(p + sb), 'p-share.js · share-btn.js 에 카카오 도구 주소 0');
  assert.equal((k.match(/kakaocdn/g) || []).length, 1, 'kakao.js 의 카카오 도구 주소는 SDK_HOST 한 곳뿐(공유 값이 찼을 때만 씀)');
  assert.ok(!/kakao\.com/.test(k), 'kakao.js 에 카카오 다른 주소 0');
  assert.ok(!/\bstyle\s*[:=]|setAttribute\(\s*['"]style|\.style\./.test(sb), 'share-btn.js — 글 속 style 0(보안 규칙)');
  const css = read('site/next/p-share.css');
  const flat = css.replace(/\/\*[\s\S]*?\*\//g, '').replace(/var\([^)]*\)/g, 'V');
  assert.ok(!/(?:^|[;{\s])(?:margin|padding)[a-z-]*\s*:[^;}]*[\s:]-\d/.test(flat), 'p-share.css — 음수 간격 0');
});

test('⑱ 카드 — p-share cardOf 가 만든 카드를 kakao.js sendCard 가 그대로 보냄 · 단추 둘 · 가입 길 주소 · 수익 숫자 0', async () => {
  const {cardOf, CARD_BTN, CARD_OPEN, halfLine} = await import('../../site/next/p-share.js');
  const see = ORIGIN + '/next/#/s/005930/2026-10-13/234000/s/abc', card = (K, o = {}) => cardOf({name: '삼성전자', msg: '이거 어때?', lead: '', price: 234000, day: '2026-10-13', see, ...o}, K, ORIGIN);
  const sent = [];
  const t = mk({routes: ME_ON, kakao: fakeKakao(sent), shareOn: true}); await t.K.ready();
  const c = card(t.K);
  assert.deepEqual(c.buttons.map(b => b.title), [...CARD_BTN], '단추 이름 · 차례');
  const u = new URL(c.buttons[0].url);
  assert.equal(u.origin + u.pathname, ORIGIN + '/api/kakao/start', '단추 1 = 우리 주소(곧바로 카카오 동의 화면으로 보내는 길)');
  assert.equal(u.searchParams.get('to'), '/next/#/s/005930/2026-10-13/234000/s/abc', '동의 뒤 돌아올 쪽 = 보낸 쪽'); assert.equal(u.searchParams.has('ref'), false, '회원이 아니면 보낸 사람 표 없음'); assert.deepEqual([...u.searchParams.keys()], ['to']);
  assert.equal(c.buttons[1].url, see, '단추 2 = 보낸 주소 그대로(가입 없음)');
  assert.equal(t.K.sendCard(c), true); assert.equal(sent.length, 1);
  const s = sent[0];
  assert.equal(s.objectType, 'feed'); assert.equal(s.content.title, '삼성전자'); assert.equal(s.content.description, '이거 어때?\n10월 13일 값 234,000원');
  assert.deepEqual(s.content.link, {mobileWebUrl: see, webUrl: see}); assert.equal(s.content.imageUrl, ORIGIN + '/og-makbi.jpg');
  assert.equal(s.buttons.length, 2); assert.deepEqual(s.buttons.map(b => b.title), [...CARD_BTN]); assert.equal(s.buttons[1].link.webUrl, see);
  assert.ok(!/[%％]|퍼센트|프로|1등|1위|급등/.test(JSON.stringify(s).replace(/%[0-9A-F]{2}/g, '')), '수익 숫자 · 1등 · 급등 0');
  assert.equal(t.log.filter(x => /start|data|withdraw/.test(x.url)).length, 0, '보내기만으로는 가입 길 요청 0');
  // 회원이 보내면 단추 1 에 보낸 사람 표
  const m = mk({routes: {...ME_MEMBER, 'GET /api/kakao/data': [200, {data: {}}], 'PUT /api/kakao/data': [200, {ok: true, data: {}}]}, kakao: fakeKakao([]), shareOn: true}); await m.K.ready();
  assert.equal(new URL(card(m.K).buttons[0].url).searchParams.get('ref'), 'ABCDEFGHIJKL');
  // 카카오 쪽 없이(미리보기) — 가입이 켜진 미리보기는 단추 1 주소 없음 · 가입이 꺼진 미리보기는 「열어 보기」 하나 · 글은 같음
  const p = card(null, {signup: true}); assert.equal(p.buttons[0].url, null); assert.equal(p.description, c.description);
  const p0 = card(null); assert.deepEqual(p0.buttons, [{title: CARD_OPEN, url: see}], '가입이 꺼짐 = 「열어 보기」 하나([7] 5)');
  // 공유만 켜짐(가입 서버 꺼짐 · 404) — 카드 단추 「열어 보기」 하나 · 보낸 주소 · 가입 길 요청 0([7] 3 · 5)
  const s1 = [], so = mk({routes: ME_OFF, kakao: fakeKakao(s1), shareOn: true}); await so.K.ready();
  const c1 = card(so.K); assert.deepEqual(c1.buttons, [{title: CARD_OPEN, url: see}]);
  assert.equal(so.K.sendCard(c1), true); assert.equal(s1.length, 1); assert.deepEqual(s1[0].buttons.map(b => b.title), [CARD_OPEN]); assert.equal(s1[0].buttons[0].link.webUrl, see);
  assert.equal(s1[0].content.title, '삼성전자'); assert.equal(s1[0].content.description, '이거 어때?\n10월 13일 값 234,000원', '종목 이름 · 보낸 사람 말 · 보낸 날 값');
  assert.equal(so.log.filter(x => /\/api\/kakao\/(start|data|withdraw)/.test(x.url)).length, 0);
  // 급등([6] 8) — 반값 한 줄은 값 바로 앞 · 값은 늘 마지막 줄 · halfLine 은 n · of 가 바른 수일 때만
  const hl = halfLine({n: 4, of: 36}); assert.equal(hl, '36곳 중 4곳이 1년 안에 반값 아래로 떨어진 적 있어요');
  for (const bad of [null, {}, {n: 40, of: 36}, {n: -1, of: 36}, {n: 1.5, of: 36}, {n: '4', of: 36}, {n: 4, of: 0}]) assert.equal(halfLine(bad), '', JSON.stringify(bad));
  const ch = card(so.K, {half: hl}); assert.equal(ch.description, '이거 어때?\n' + hl + '\n10월 13일 값 234,000원');
  assert.ok(!/[%％]|퍼센트|1등|1위|급등/.test(ch.description), '반값 한 줄에도 수익 숫자 · 급등 낱말 0');
  // 보낸 말 + 같이 가는 글이 있으면 두 줄 · 값은 늘 마지막 줄
  assert.equal(card(t.K, {msg: '나는 이렇게 봤어', lead: '소개 한 줄'}).description, '나는 이렇게 봤어\n소개 한 줄\n10월 13일 값 234,000원');
  // 바깥 주소 · 단추 없음은 보내지 않음 · 켜져 있지 않으면 보내지 않음
  assert.equal(t.K.sendCard({...c, url: 'https://evil.example/x'}), false); assert.equal(t.K.sendCard({...c, buttons: [{title: 'x', url: 'https://evil.example/y'}]}), false); assert.equal(sent.length, 1);
  const off = mk({switchOn: false, kakao: fakeKakao([])}); assert.equal(off.K.sendCard(c), false);
});

test('⑲ 보내기 단추 한 곳(사장님 2026-10-18 16:39 [6] 2) — shareButtons 정의는 share-btn.js 하나 · p-share.js 는 다시 내보냄 · 쓰는 곳은 새로 만들지 않음', async () => {
  const read = f => fs.readFileSync(path.join(ROOT, f), 'utf8');
  const strip = s => s.replace(/\/\*[\s\S]*?\*\//g, '').split('\n').map(l => l.replace(/(^|[^:'"`])\/\/.*$/, '$1')).join('\n');
  const files = fs.readdirSync(path.join(ROOT, 'site/next')).filter(f => f.endsWith('.js')).map(f => 'site/next/' + f);
  const defs = files.filter(f => /\bfunction\s+shareButtons\s*\(|\bshareButtons\s*=\s*(?:\(|function|[a-z]\s*=>)/.test(strip(read(f))));
  assert.deepEqual(defs, ['site/next/share-btn.js'], 'shareButtons 를 만드는 곳은 share-btn.js 하나');
  const ps = strip(read('site/next/p-share.js'));
  assert.match(ps, /import \{shareButtons, kakaoButton\} from '\.\/share-btn\.js';/); assert.match(ps, /export \{shareButtons, kakaoButton\};/);
  const sb = strip(read('site/next/share-btn.js'));
  assert.ok(!/^\s*import\s/m.test(sb), 'share-btn.js 는 처음에 아무 모듈도 받지 않음(작고 동기 · 글상자는 누를 때 import())');
  assert.match(sb, /preventDefault\(\);\s*ev\.stopPropagation\(\)/, '누름은 줄 고리로 새지 않음');
  const m = await import('../../site/next/share-btn.js'), p = await import('../../site/next/p-share.js');
  assert.equal(p.shareButtons, m.shareButtons, '같은 함수(다시 내보냄)');
  assert.equal(m.KK_CLASS, 'kk-btn'); assert.equal(m.KK_LABEL, '카톡으로 보내기');
  const css = read('site/next/app.css');
  const blk = /\.kk-btn \{[^}]*\}/.exec(css)?.[0] ?? '';
  assert.match(blk, /width: 44px/); assert.match(blk, /height: 44px/); assert.match(blk, /flex: none/);
  assert.match(css, /\.kk-ic \.kk-b \{ fill: #FEE500; \}/, '노란 말풍선');
  assert.equal(p.AGAIN, '나도 보내기');
});

test('⑳ 보안 머리말 두 상태([7] 6) — 공유 열쇠 없음 = 오늘과 한 바이트도 같음 · 있음 = script-src 에 카카오 도구 주소 하나만 · 반쯤 참 = 그대로', async () => {
  const H = await import('../../scripts/atlas11/site_headers.mjs');
  const TODAY = "/*\n  X-Content-Type-Options: nosniff\n  Referrer-Policy: strict-origin-when-cross-origin\n  Content-Security-Policy: default-src 'self'; script-src 'self'; style-src 'self'; img-src 'self' data:; font-src 'self'; connect-src 'self'; object-src 'none'; base-uri 'self'; form-action 'self'; frame-ancestors 'none'\n  Permissions-Policy: camera=(), microphone=(), geolocation=()\n  X-Frame-Options: DENY\n";
  const inv = JSON.parse(fs.readFileSync(path.join(ROOT, 'config/atlas11/invite.json'), 'utf8'));
  assert.equal(H.shareKeyIn(inv), false, '오늘 저장소에는 공유 열쇠 없음');
  assert.equal(Buffer.compare(Buffer.from(H.HEADER_TOP), Buffer.from(TODAY)), 0, '오늘 머리말 = 한 바이트도 같음');
  assert.equal(H.BASE_TOP, TODAY); assert.equal(H.SHARE_KEY, false);
  for (const c of [null, {}, {kakao: null}, {kakao: {key: '', version: '2.8.3', integrity: ''}}, {kakao: {key: 'k', version: '2.8.3', integrity: ''}}, {kakao: {key: '', version: '2.8.3', integrity: 'sha384-x'}}])
    assert.equal(H.headerTopFor(c), TODAY, '열쇠 없음 · 반쯤 참 ' + JSON.stringify(c));
  const on = H.headerTopFor({kakao: {key: '0123456789abcdef0123456789abcdef', version: '2.8.3', integrity: 'sha384-abc'}});
  const a = TODAY.split('\n'), b = on.split('\n');
  assert.equal(a.length, b.length);
  const diff = a.map((l, i) => [l, b[i]]).filter(([x, y]) => x !== y);
  assert.equal(diff.length, 1, '바뀐 줄은 보안 규칙 한 줄뿐');
  assert.equal(diff[0][1], diff[0][0].replace("script-src 'self';", "script-src 'self' " + SDK_HOST + ';'), 'script-src 에 카카오 도구 주소 하나만(다른 지시 바뀜 0)');
  assert.equal(H.KAKAO_CSP.share['script-src'][0], SDK_HOST, '화면이 받는 도구 주소와 머리말에 더하는 주소가 같음');
  assert.ok(!/kakao/.test(on.replace(SDK_HOST, '')), '카카오 주소는 그 하나뿐');
  assert.equal(H.headerTopFor({kakao: {key: 'k', version: '2.8.3', integrity: 'sha384-abc'}}), H.kakaoHeaderTop({share: true}).head, 'package.mjs addInvite 와 같은 값');
});

test('㉑ 공유 스위치 — SDK 세 칸이 다 찼을 때만 카카오 도구를 받음(판 주소 · 무결성 · 열쇠) · 가입 서버 요청 0 · 못 받으면 다음에 다시 · 시험 표시는 시험 서버에서만', async () => {
  const full = sdkOf({key: '0123456789abcdef0123456789abcdef', version: '2.8.3', integrity: 'sha384-' + 'Ab12'.repeat(16)});
  const sent = [], inits = [], adds = []; let loaded = false;
  const fake = {isInitialized: () => inits.length > 0, init(k) { inits.push(k); }, Share: {sendDefault: o => { sent.push(o); }}};
  const t = mk({switchOn: false, routes: {}, sdk: full, kakao: () => (loaded ? fake : undefined), addScript: (src, integrity, done) => { adds.push({src, integrity}); loaded = true; done(true); }});
  assert.equal(t.K.share, true, '세 칸이 다 차면 켜짐(따로 켜는 값 없음)'); assert.equal(t.K.on, false);
  assert.equal(t.K.canSend(), false, '도구를 받기 전');
  assert.equal(await t.K.sdkReady(), true);
  assert.equal(t.K.on, false, '가입은 따로 꺼짐');
  assert.deepEqual(adds, [{src: SDK_HOST + '/kakao_js_sdk/2.8.3/kakao.min.js', integrity: full.integrity}]);
  assert.deepEqual(inits, [full.key]);
  assert.equal(t.log.length, 0, '가입 서버 · 공유 값 읽기 요청 0(도구 하나만 받음)');
  await t.K.sdkReady(); assert.equal(adds.length, 1, '도구는 한 번만 받음');
  assert.equal(t.K.sendCard({title: '삼성전자', url: ORIGIN + '/#/s/005930/2026-10-16/70000/s', buttons: [{title: '열어 보기', url: ORIGIN + '/#/s/005930/2026-10-16/70000/s'}]}), true);
  assert.equal(sent.length, 1);
  // 반쯤 참 · 꼴이 틀림 → 꺼짐 · 도구 0
  for (const sdk of [{...full, key: ''}, {...full, integrity: ''}, {...full, src: ''}, {...full, src: 'https://evil.example/kakao.min.js'}]) {
    const a2 = []; const x = mk({switchOn: false, routes: {}, sdk, addScript: (s2, i, d) => { a2.push(s2); d(true); }});
    assert.equal(x.K.share, false, JSON.stringify(sdk)); assert.equal(await x.K.sdkReady(), false); assert.deepEqual(a2, []);
  }
  // 도구를 못 받음(망 · 무결성 틀림) → false · 다음 누름에 다시 받음
  let tries = 0; const flaky = mk({switchOn: false, routes: {}, sdk: full, kakao: () => (tries > 1 ? fake : undefined), addScript: (s2, i, d) => { tries++; d(tries > 1); }});
  assert.equal(await flaky.K.sdkReady(), false); assert.equal(await flaky.K.sdkReady(), true); assert.equal(tries, 2);
  // 시험 서버 표시 — 127.0.0.1 에서만 공유를 켜 봄(가짜 도구) · 실제 사이트에서는 표시가 있어도 꺼짐
  const loc = {hostname: '127.0.0.1', origin: 'http://127.0.0.1:8826', pathname: '/next/', search: '?dev=1', hash: '#/'};
  const dev = mk({switchOn: false, routes: {}, loc, shareTest: true, kakao: fakeKakao([])}); assert.equal(await dev.K.sdkReady(), true); assert.equal(dev.K.share, true); assert.equal(dev.K.on, false); assert.equal(dev.log.length, 0);
  const dev2 = mk({switchOn: false, routes: {}, loc: {...loc, search: '?dev=1&kakaoshare=1'}, kakao: fakeKakao([])}); assert.equal(dev2.K.share, true);
  const prod = mk({switchOn: false, routes: {}, shareTest: true, kakao: fakeKakao([])}); assert.equal(await prod.K.sdkReady(), false); assert.equal(prod.K.share, false);
});
