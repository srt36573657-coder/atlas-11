#!/usr/bin/env node
/**
 * ATLAS 11 · 선물형 초대장 시험 서버 — 넷리파이처럼 dist/ 를 내보내고 /i/<번호> → invite.html(그대로 200) · /api/invite → 함수 셈(lib/atlas11/invite.mjs)
 *   저장소: 넷리파이 Blobs 로컬 서버(@netlify/blobs/server) — 실제 함수 파일(functions/atlas11/invite.mjs)을 그대로 부른다
 *   머리글: dist/_headers 의 「/*」 머리글(CSP 등)을 모든 응답에 붙여 실제 사이트와 같은 보안 규칙으로 시험
 *   쓰는 법: node scripts/atlas11/invite_dev.mjs --dir dist --port 8824 [--blobs <폴더>] [--seed-expired] [--owner-key <시험 열쇠>]
 *   --owner-key: 사진 초대장 시험용 열쇠(진짜 열쇠가 아님) — 그 SHA-256 을 ATLAS_INVITE_OWNER_SHA256 으로 함수에 넘김(시험 서버에서만)
 */
import http from 'node:http';
import fs from 'node:fs/promises';
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
    if (url.pathname === '/api/invite') {
      const body = req.method === 'POST' ? await new Promise(r => { let b = ''; req.on('data', d => { b += d; }); req.on('end', () => r(b)); }) : undefined;
      const r = await fn(new Request(url, {method: req.method, headers: req.headers, body}));
      res.writeHead(r.status, Object.fromEntries(r.headers)); res.end(Buffer.from(await r.arrayBuffer())); return;
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
server.listen(port, '127.0.0.1', () => console.log(`invite dev http://127.0.0.1:${port} · dist ${dir} · blobs ${blobsDir}${seeded ? ` · expired ${seeded}` : ''}`));
const stop = async () => { server.close(); await blobs.stop(); process.exit(0); };
process.on('SIGTERM', stop); process.on('SIGINT', stop);
