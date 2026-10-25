#!/usr/bin/env node
/**
 * ATLAS 11 · 선물형 초대장 시험 서버 — 넷리파이처럼 dist/ 를 내보내고 /i/<번호> → invite.html(그대로 200) · /api/invite → 함수 셈(lib/atlas11/invite.mjs) · /api/letter → 편지 여는 밤(lib/atlas11/letter.mjs · 2026-10-17)
 *   저장소: 넷리파이 Blobs 로컬 서버(@netlify/blobs/server) — 실제 함수 파일(functions/atlas11/invite.mjs)을 그대로 부른다
 *   머리글: dist/_headers 의 「/*」 머리글(CSP 등)을 모든 응답에 붙여 실제 사이트와 같은 보안 규칙으로 시험
 *   쓰는 법: node scripts/atlas11/invite_dev.mjs --dir dist --port 8824 [--blobs <폴더>] [--seed-expired] [--owner-key <시험 열쇠>]
 *   --owner-key: 사진 초대장 시험용 열쇠(진짜 열쇠가 아님) — 그 SHA-256 을 ATLAS_INVITE_OWNER_SHA256 으로 함수에 넘김(시험 서버에서만)
 *   --fake-kakao: 카톡 가입(2026-10-18 · /api/kakao/* · lib/atlas11/kakao.mjs)을 가짜 열쇠 · 가짜 카카오(tests/atlas11/fake-kakao/fake.mjs · /__fake-kakao/*)로 켬 — 진짜 카카오로 가는 요청 0
 *     없으면 /api/kakao/* 는 모두 404(스위치가 꺼진 사이트와 같음) · 가짜 동의 화면에는 「가짜 카카오 · 시험용」이 늘 보임
 *   자동으로 산 기록(가짜 돈 · 2026-10-22 08:50): /api/auto — 셈은 넷리파이 함수와 같은 lib/atlas11/auto.mjs · 저장소는 아래 Blobs 로컬 서버(같은 이름) · 사이트 파일(테마 · 대장주 · 회사 값)은 이 서버가 내보내는 것
 *   진화 칸 · 합계 칸(2026-10-18 16:39 [9] 8 · [10] 3 · 일꾼 KD): /api/jinhwa/* · /api/tally · /api/tally/sum — 셈은 넷리파이 함수와 같은 lib/atlas11/jinhwa.mjs · tally.mjs · 저장소는 위 Blobs 로컬 서버(같은 이름)
 *     진화 자료는 이 서버가 내보내는 /next/data/jinhwa.json · 진화 칸 검사(check_jinhwa)만 /__dev/jinhwa-data 로 잠시 바꿔 넣음(POST 글 = 자료 · DELETE = 원래대로 · 이 시험 서버에서만)
 */
import http from 'node:http';
import fs from 'node:fs/promises';
import {readFileSync} from 'node:fs';
import os from 'node:os';
import path from 'node:path';

const arg = (n, d) => { const i = process.argv.indexOf(n); return i < 0 ? d : process.argv[i + 1]; };
const dir = path.resolve(arg('--dir', 'dist')), port = Number(arg('--port', 8824));
const blobsDir = arg('--blobs', null) ?? await fs.mkdtemp(path.join(os.tmpdir(), 'atlas11-invite-blobs-'));
const {BlobsServer} = await import('@netlify/blobs/server');
const blobs = new BlobsServer({directory: blobsDir, token: 'dev'}); const {port: bport} = await blobs.start();
process.env.NETLIFY_BLOBS_CONTEXT = Buffer.from(JSON.stringify({edgeURL: `http://127.0.0.1:${bport}`, uncachedEdgeURL: `http://127.0.0.1:${bport}`, siteID: 'dev', token: 'dev'})).toString('base64');
const ownerKey = arg('--owner-key', null);
if (ownerKey) process.env.ATLAS_INVITE_OWNER_SHA256 = (await import('node:crypto')).createHash('sha256').update(ownerKey).digest('hex');
const fn = (await import('../../functions/atlas11/invite.mjs')).default;
// 편지 여는 밤(2026-10-17) — 같은 시험 서버에서 /api/letter · 시계 옮기기 /__dev/skew?ms=(이 시험 서버에서만 · ATLAS_LETTER_DEV=1)
process.env.ATLAS_LETTER_DEV = '1';
const lfn = (await import('../../functions/atlas11/letter.mjs')).default;
// 카톡 가입(2026-10-18 · K1c) — --fake-kakao 일 때만 켬: 가짜 열쇠(이 시험 서버에만) · 카카오 대신 가짜 카카오(같은 서버 /__fake-kakao/*) · 저장소는 위 Blobs 로컬 서버
// 가입 스위치가 켜진 판(config/atlas11/kakao.json on: true)을 검사할 때는 --fake-kakao 를 안 붙여도 가짜 카카오로 켬 — 진짜 사이트처럼 /api/kakao/* 가 답해야 하므로(2026-10-19 카톡 가입 발행)
const kakaoSwitchOn = (() => { try { return JSON.parse(readFileSync(new URL('../../config/atlas11/kakao.json', import.meta.url), 'utf8')).on === true; } catch { return false; } })();
const kakao = (process.argv.includes('--fake-kakao') || kakaoSwitchOn) ? await (async () => {
  const [{handleKakao}, {KAKAO_STORE}, {createFakeKakao}, {getStore}, {detachKakao, LETTER_STORE}] = await Promise.all([import('../../lib/atlas11/kakao.mjs'), import('../../lib/atlas11/kakao-store.mjs'), import('../../tests/atlas11/fake-kakao/fake.mjs'), import('@netlify/blobs'), import('../../lib/atlas11/letter.mjs')]);
  const env = {ATLAS_KAKAO_REST_KEY: 'fake-rest-key', ATLAS_KAKAO_CLIENT_SECRET: 'fake-client-secret', ATLAS_KAKAO_ADMIN_KEY: 'fake-admin-key', ATLAS_KAKAO_HASH_SECRET: 'fake-hash-secret-for-this-dev-server-only-000'};
  Object.assign(process.env, env); // 같은 시험 서버의 편지 함수([4] 8 · kakaoMemberOf)도 같은 가짜 열쇠를 봄 — 이 시험 서버 안에서만
  const fake = createFakeKakao({restKey: env.ATLAS_KAKAO_REST_KEY, clientSecret: env.ATLAS_KAKAO_CLIENT_SECRET, adminKey: env.ATLAS_KAKAO_ADMIN_KEY, prefix: '/__fake-kakao'});
  const call = (req, origin) => handleKakao(req, env, {config: {on: true}, dev: true, store: () => getStore({name: KAKAO_STORE, consistency: 'strong'}), kakao: {auth: origin + '/__fake-kakao', api: origin + '/__fake-kakao'},
    fetch: (u, init) => (String(u).startsWith(origin + '/__fake-kakao/') ? fake.fetch(u, init) : Promise.reject(Error('dev: only fake kakao'))), ownerHash: process.env.ATLAS_INVITE_OWNER_SHA256,
    onGone: mh => detachKakao(getStore({name: LETTER_STORE, consistency: 'strong'}), mh)});
  return {fake, call};
})() : null;
// 진화 칸 · 합계 칸(KD) — 함수 파일(functions/atlas11/jinhwa.mjs · tally.mjs)과 같은 셈 · 같은 열쇠 해시 · 같은 저장소 이름 · 진화 자료만 시험용으로 바꿔 넣을 수 있음
const jt = await (async () => {
  const [{handleJinhwa, siteData, JINHWA_STORE}, {handleTally, TALLY_STORE}, {getStore}, {OWNER_KEY_SHA256}] = await Promise.all([import('../../lib/atlas11/jinhwa.mjs'), import('../../lib/atlas11/tally.mjs'), import('@netlify/blobs'), import('../../lib/atlas11/invite.mjs')]);
  const hash = () => process.env.ATLAS_INVITE_OWNER_SHA256 || OWNER_KEY_SHA256;
  const S = {data: null};
  return {S,
    jinhwa: req => handleJinhwa(req, {store: getStore({name: JINHWA_STORE, consistency: 'strong'}), ownerHash: hash(), dataOf: r => (S.data ? Promise.resolve(S.data) : siteData(r))}),
    tally: req => handleTally(req, {store: getStore({name: TALLY_STORE, consistency: 'strong'}), ownerHash: hash()})};
})();
// 고객센터(사장님 2026-10-21 22:54 · 22:55 · 23:09 · lib/atlas11/help.mjs) — 함수 파일(functions/atlas11/help.mjs)과 같은 셈 · 같은 열쇠 해시 · 같은 저장소 이름
const hp = await (async () => {
  const [{handleHelp, HELP_STORE}, {getStore}, {OWNER_KEY_SHA256}] = await Promise.all([import('../../lib/atlas11/help.mjs'), import('@netlify/blobs'), import('../../lib/atlas11/invite.mjs')]);
  return req => handleHelp(req, {store: getStore({name: HELP_STORE, consistency: 'strong'}), ownerHash: process.env.ATLAS_INVITE_OWNER_SHA256 || OWNER_KEY_SHA256});
})();
// 자동으로 산 기록 · 가짜 돈(사장님 2026-10-22 08:35 · 08:50 「가짜돈으로 해」 · lib/atlas11/auto.mjs) — 함수 파일(functions/atlas11/auto.mjs)과 같은 셈 · 같은 열쇠 해시 · 같은 저장소 이름 · 사이트 파일은 이 서버에서 받음
const au = await (async () => {
  const [{handleAuto, AUTO_STORE}, {getStore}, {OWNER_KEY_SHA256}] = await Promise.all([import('../../lib/atlas11/auto.mjs'), import('@netlify/blobs'), import('../../lib/atlas11/invite.mjs')]);
  return req => handleAuto(req, {store: getStore({name: AUTO_STORE, consistency: 'strong'}), ownerHash: process.env.ATLAS_INVITE_OWNER_SHA256 || OWNER_KEY_SHA256});
})();
// 친구 소개 세기 · 선물 받기(사장님 2026-10-25 13:40 「카톡 친구 세 명으로 세 명을 보냈다 라는 걸 알 수 있게끔」 · lib/atlas11/gift.mjs) — 함수 파일(functions/atlas11/gift.mjs)과 같은 셈 · 같은 열쇠 해시 · 같은 저장소 이름
const gf = await (async () => {
  const [{handleGift, GIFT_STORE}, {getStore}, {OWNER_KEY_SHA256}] = await Promise.all([import('../../lib/atlas11/gift.mjs'), import('@netlify/blobs'), import('../../lib/atlas11/invite.mjs')]);
  return req => handleGift(req, {store: getStore({name: GIFT_STORE, consistency: 'strong'}), ownerHash: process.env.ATLAS_INVITE_OWNER_SHA256 || OWNER_KEY_SHA256});
})();
/** 함수 응답(Fetch Response) → node 응답 · Set-Cookie 여럿을 그대로(하나로 합치지 않음) */
const sendFetch = async (res, r) => { const h = {}; for (const [k, v] of r.headers) if (k !== 'set-cookie') h[k] = v; const sc = r.headers.getSetCookie?.() ?? []; if (sc.length) h['set-cookie'] = sc; res.writeHead(r.status, h); res.end(Buffer.from(await r.arrayBuffer())); };
const bodyOf = req => (req.method === 'POST' || req.method === 'PUT' ? new Promise(r => { let b = ''; req.on('data', d => { b += d; }); req.on('end', () => r(b)); }) : Promise.resolve(undefined));
// --seed-expired: 시험용으로 181일 전에 만든 초대장 하나(기간이 지난 링크 안내를 보려고) — 번호를 첫 줄에 알림
let seeded = null;
if (process.argv.includes('--seed-expired')) {
  const {getStore} = await import('@netlify/blobs'); const {createInvite, INVITE_STORE, TTL_DAYS} = await import('../../lib/atlas11/invite.mjs');
  const r = await createInvite(getStore({name: INVITE_STORE, consistency: 'strong'}), {to: '지난 손님', from: 'ATLAS', message: '기간이 지난 초대장'}, {now: new Date(Date.now() - (TTL_DAYS + 1) * 864e5)});
  seeded = r.body.id;
}

const TYPES = {'.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.mjs': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8', '.json': 'application/json; charset=utf-8', '.svg': 'image/svg+xml', '.png': 'image/png', '.woff2': 'font/woff2', '.ico': 'image/x-icon', '.txt': 'text/plain; charset=utf-8', '.jpg': 'image/jpeg', '.mp4': 'video/mp4', '.webm': 'video/webm'}; // .jpg · .mp4 · .webm — 소개 영상(2026-10-09 hello.html)
let globalHeaders = {};
try { // 「/*」 덩어리만(넷리파이 _headers 형식)
  const t = await fs.readFile(path.join(dir, '_headers'), 'utf8'); let cur = null;
  for (const line of t.split('\n')) { if (/^\S/.test(line)) cur = line.trim(); else if (cur === '/*' && line.includes(':')) { const i = line.indexOf(':'); globalHeaders[line.slice(0, i).trim()] = line.slice(i + 1).trim(); } }
} catch {}
const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`);
  try {
    if (url.pathname === '/__dev/skew') { process.env.ATLAS_LETTER_SKEW_MS = String(Number(url.searchParams.get('ms') || 0)); res.writeHead(200, {'Content-Type': 'application/json'}); res.end(JSON.stringify({skew: Number(process.env.ATLAS_LETTER_SKEW_MS)})); return; }
    if (url.pathname === '/api/invite' || url.pathname === '/api/letter') {
      const body = req.method === 'POST' ? await new Promise(r => { let b = ''; req.on('data', d => { b += d; }); req.on('end', () => r(b)); }) : undefined;
      const r = await (url.pathname === '/api/letter' ? lfn : fn)(new Request(url, {method: req.method, headers: req.headers, body}));
      res.writeHead(r.status, Object.fromEntries(r.headers)); res.end(Buffer.from(await r.arrayBuffer())); return;
    }
    if (url.pathname === '/api/kakao' || url.pathname.startsWith('/api/kakao/')) { // 카톡 가입 — --fake-kakao 가 없으면 꺼진 사이트처럼 404
      if (!kakao) { res.writeHead(404, {'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store'}); res.end('{"error":"not_found"}'); return; }
      await sendFetch(res, await kakao.call(new Request(url, {method: req.method, headers: req.headers, body: await bodyOf(req)}), url.origin)); return;
    }
    if (kakao && url.pathname.startsWith('/__fake-kakao/')) { await sendFetch(res, await kakao.fake.handle(new Request(url, {method: req.method, headers: req.headers, body: await bodyOf(req)}))); return; }
    if (url.pathname === '/api/jinhwa' || url.pathname.startsWith('/api/jinhwa/')) { await sendFetch(res, await jt.jinhwa(new Request(url, {method: req.method, headers: req.headers, body: await bodyOf(req)}))); return; }
    if (url.pathname === '/api/gift' || url.pathname.startsWith('/api/gift/')) { await sendFetch(res, await gf(new Request(url, {method: req.method, headers: req.headers, body: await bodyOf(req)}))); return; } // 친구 소개 세기 · 선물 받기
    if (url.pathname === '/api/help' || url.pathname.startsWith('/api/help/')) { await sendFetch(res, await hp(new Request(url, {method: req.method, headers: req.headers, body: await bodyOf(req)}))); return; } // 고객센터
    if (url.pathname === '/api/auto' || url.pathname.startsWith('/api/auto/')) { await sendFetch(res, await au(new Request(url, {method: req.method, headers: req.headers, body: await bodyOf(req)}))); return; } // 자동으로 산 기록(가짜 돈)
    if (url.pathname === '/api/tally' || url.pathname === '/api/tally/sum') { await sendFetch(res, await jt.tally(new Request(url, {method: req.method, headers: req.headers, body: await bodyOf(req)}))); return; }
    if (url.pathname === '/__dev/jinhwa-data') { // 진화 칸 검사용 — 이 시험 서버에서만(올리는 사이트에는 없음)
      if (req.method === 'POST') { let d = null; try { d = JSON.parse(await bodyOf(req)); } catch { d = null; } jt.S.data = d && typeof d === 'object' && !Array.isArray(d) ? d : null; }
      else if (req.method === 'DELETE') jt.S.data = null;
      res.writeHead(200, {'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store'}); res.end(JSON.stringify({override: !!jt.S.data})); return;
    }
    let p = decodeURIComponent(url.pathname);
    if (/^\/i\/[^/]*\/?$/.test(p)) p = '/invite.html'; // _redirects: /i/*  /invite.html  200
    if (p.endsWith('/')) p += 'index.html';
    const file = path.join(dir, p);
    if (!file.startsWith(dir)) { res.writeHead(403); res.end(); return; }
    const data = await fs.readFile(file);
    res.writeHead(200, {...globalHeaders, 'Content-Type': TYPES[path.extname(file)] ?? 'application/octet-stream', 'Cache-Control': 'no-cache'}); res.end(data);
  } catch (e) { res.writeHead(e.code === 'ENOENT' ? 404 : 500, {'Content-Type': 'text/plain; charset=utf-8'}); res.end(e.code === 'ENOENT' ? 'not found' : 'error'); }
});
server.listen(port, '127.0.0.1', () => console.log(`invite dev http://127.0.0.1:${port} · dist ${dir} · blobs ${blobsDir}${seeded ? ` · expired ${seeded}` : ''}${kakao ? ' · kakao: fake' : ''}`));
const stop = async () => { server.close(); await blobs.stop(); process.exit(0); };
process.on('SIGTERM', stop); process.on('SIGINT', stop);
