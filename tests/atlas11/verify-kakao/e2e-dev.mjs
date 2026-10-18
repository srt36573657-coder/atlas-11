#!/usr/bin/env node
// VK — 시험 서버(scripts/atlas11/invite_dev.mjs --fake-kakao)를 제 포트에 띄워 가짜 카카오 가입 길을 처음부터 끝까지 · 우리 쪽 누름 수를 셈
//   돌리기: node tests/atlas11/verify-kakao/e2e-dev.mjs [--port 8838]  — 끝에 결과 한 줄(JSON) · 틀리면 exit 1
//   누름 = 사람이 손으로 여는 주소(카드 단추 · 동의 단추) · 302 를 따라가는 것은 누름이 아님 · 그 사이 우리 HTML 화면 수도 셈
import {spawn} from 'node:child_process';
import path from 'node:path';
import assert from 'node:assert/strict';

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), '../../..');
const arg = (n, d) => { const i = process.argv.indexOf(n); return i < 0 ? d : process.argv[i + 1]; };
const PORT = Number(arg("--port", 8838)), OFF_PORT = Number(arg("--off-port", 8858)), OWNER = 'testowner-key-1234567890';

function serve(port, fake) {
  const p = spawn(process.execPath, ['scripts/atlas11/invite_dev.mjs', '--dir', 'site', '--port', String(port), '--owner-key', OWNER, ...(fake ? ['--fake-kakao'] : [])], {cwd: ROOT, stdio: ['ignore', 'pipe', 'pipe']});
  return new Promise((res, rej) => {
    let out = '';
    const t = setTimeout(() => rej(Error('server start timeout: ' + out)), 30000);
    p.stdout.on('data', d => { out += d; if (out.includes('invite dev http')) { clearTimeout(t); res({p, line: out.trim()}); } });
    p.stderr.on('data', d => { out += d; });
    p.on('exit', c => rej(Error('server exit ' + c + ' ' + out)));
  });
}
function client(base) {
  const jar = new Map();
  const keep = r => { for (const sc of r.headers.getSetCookie()) { const [nv, ...a] = sc.split(';'), i = nv.indexOf('='), k = nv.slice(0, i).trim(), v = nv.slice(i + 1).trim(); if (a.some(x => /^\s*max-age=0\s*$/i.test(x))) jar.delete(k); else jar.set(k, v); } };
  const cookie = () => [...jar].map(([k, v]) => `${k}=${v}`).join('; ');
  async function one(url, init = {}) { const h = new Headers(init.headers ?? {}); if (jar.size) h.set('cookie', cookie()); const r = await fetch(url, {...init, headers: h, redirect: 'manual'}); keep(r); return r; }
  /** 누름 하나 — 302 를 따라가 화면(HTML 200)에서 멈춤 */
  async function tap(url) {
    const hops = []; let cur = new URL(url, base).href;
    for (let i = 0; i < 10; i++) {
      const r = await one(cur), ct = r.headers.get('content-type') ?? '';
      hops.push({path: new URL(cur).pathname, status: r.status, html: /text\/html/.test(ct), loc: r.headers.get('location')});
      if (r.status >= 300 && r.status < 400) { cur = new URL(r.headers.get('location'), cur).href; await r.arrayBuffer(); continue; }
      return {url: cur, status: r.status, html: /text\/html/.test(ct) ? await r.text() : (await r.arrayBuffer(), null), hops};
    }
    throw Error('302 loop');
  }
  return {one, tap, jar};
}
const agree = (html, id = 'agree') => new RegExp(`id="${id}" href="([^"]+)"`).exec(html)[1].replace(/&amp;/g, '&');

const out = {};
const on = await serve(PORT, true);
let off;
try {
  out.server = on.line;
  const base = `http://127.0.0.1:${PORT}`;
  // 보낸 사람 — 카드 단추(누름 1) → 가짜 카카오 동의 화면 → 「동의하고 계속하기」(누름 2) → 보낸 쪽
  const s = client(base);
  const a1 = await s.tap('/api/kakao/start?to=' + encodeURIComponent('#/s/005930/vk'));
  assert.equal(new URL(a1.url).pathname, '/__fake-kakao/oauth/authorize'); assert.ok(a1.html.includes('가짜 카카오'));
  const a2 = await s.tap(agree(a1.html));
  const ourHtmlBetween = [...a1.hops, ...a2.hops].filter(h => h.path.startsWith('/api/') && h.html).length;
  out.senderEnd = a2.url.replace(base, ''); out.taps = 2; out.ourScreensBetween = ourHtmlBetween;
  assert.equal(out.senderEnd, '/next/?kakao=ok#/s/005930/vk');
  const me1 = await (await s.one(base + '/api/kakao/me')).json();
  assert.equal(me1.member, true); out.meKeys = Object.keys(me1).sort().join(',');
  // 친구 — 보낸 사람 표(ref)로 가입 → 소개 수 1
  const f = client(base);
  const b1 = await f.tap(`/api/kakao/start?to=${encodeURIComponent('#/s/000660/vk')}&ref=${me1.ref}`);
  const b2 = await f.tap(agree(b1.html));
  assert.equal(b2.url.replace(base, ''), '/next/?kakao=ok#/s/000660/vk');
  out.friends = (await (await s.one(base + '/api/kakao/me')).json()).friends;
  // 거부 — 가입 0 · kakao=none
  const d = client(base), d1 = await d.tap('/api/kakao/start?to=' + encodeURIComponent('#/s/1')), d2 = await d.tap(agree(d1.html, 'deny'));
  out.denyEnd = d2.url.replace(base, ''); assert.equal(out.denyEnd, '/next/?kakao=none#/s/1');
  // 표 위조 — 표 쿠키 없이 돌아옴 → 403
  out.forged = (await fetch(base + '/api/kakao/callback?code=x&state=' + 'A'.repeat(43), {redirect: 'manual'})).status;
  // 다시 온 사람(카톡 안 · prompt=none) — 가짜 카카오 로그인 쿠키(fk_user)만 있는 새 기기 → 누름 0
  const fkUser = s.jar.get('fk_user'); // 가짜 쪽 쿠키(같은 집이라 한 단지에 섞임 — 시험 서버만)
  const again = client(base); again.jar.set('fk_user', fkUser);
  const r1 = await again.tap('/api/kakao/start?prompt=none&to=' + encodeURIComponent('#/s/005930/again'));
  out.returningEnd = r1.url.replace(base, ''); out.returningScreens = r1.hops.filter(h => h.html && h.status !== 200 || (h.html && h.path !== '/next/')).length;
  // 기록 넷 — 같은 집 PUT · GET · 내 돈 400
  const H = {'content-type': 'application/json', origin: base, 'sec-fetch-site': 'same-origin'};
  out.put = (await s.one(base + '/api/kakao/data', {method: 'PUT', headers: H, body: JSON.stringify({data: {'atlas:new:later': ['005930'], 'atlas:godori-hold': [{id: 'h1', code: '005930'}]}})})).status;
  out.money = (await s.one(base + '/api/kakao/data', {method: 'PUT', headers: H, body: JSON.stringify({data: {'atlas:godori-money': [1]}})})).status;
  out.getLater = (await (await s.one(base + '/api/kakao/data')).json()).data['atlas:new:later'];
  // 사장님 열쇠 — 날마다 두 수
  out.counts403 = (await fetch(base + '/api/kakao/counts')).status;
  out.counts = (await (await fetch(base + '/api/kakao/counts?days=1', {headers: {'x-atlas-owner': OWNER}})).json()).days[0];
  // 탈퇴 — 두 번째 기기 로그인도 끝
  const w = await s.one(base + '/api/kakao/withdraw', {method: 'POST', headers: {origin: base, 'sec-fetch-site': 'same-origin'}});
  out.withdraw = await w.json();
  out.meAfter = (await (await s.one(base + '/api/kakao/me')).json()).member;
  out.otherDeviceAfter = (await (await again.one(base + '/api/kakao/me')).json()).member;
  // 꺼진 시험 서버(--fake-kakao 없음) — 모든 길 404
  off = await serve(OFF_PORT, false);
  out.offStatuses = [...new Set(await Promise.all(['start', 'callback', 'me', 'data', 'withdraw', 'verify', 'counts', 'unlinked'].map(async r => (await fetch(`http://127.0.0.1:${OFF_PORT}/api/kakao/${r}`, {redirect: 'manual'})).status)))];
  assert.deepEqual(out.offStatuses, [404]);
  assert.equal(out.ourScreensBetween, 0); assert.equal(out.friends, 1); assert.equal(out.forged, 403); assert.equal(out.money, 400); assert.equal(out.put, 200);
  assert.deepEqual(out.withdraw, {ok: true, removed: true, unlinked: true}); assert.equal(out.meAfter, false); assert.equal(out.otherDeviceAfter, false);
  console.log('VK e2e ' + JSON.stringify(out));
} catch (e) { console.log('VK e2e FAIL ' + (e?.message ?? e) + ' ' + JSON.stringify(out)); process.exitCode = 1; }
finally { on.p.kill('SIGTERM'); off?.p.kill('SIGTERM'); }
