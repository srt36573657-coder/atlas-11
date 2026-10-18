#!/usr/bin/env node
// 진화 대안 전후 그림 — 사장님 2026-10-18(싱가포르) 16:39 [8] 5 「바뀌는 것(전과 후 그림 한 장씩)」 · [9] 3 「카드마다 … 전과 후 그림」
//   전 = 지금 main 의 사이트 폴더 · 후 = 대안 가지의 사이트 폴더 — 같은 자료 · 같은 길 · 같은 폭(360 × 640 · 휴대폰 세로)으로 한 장씩
//   서버 = 이 파일 안의 작은 정적 서버(폴더 둘을 따로 띄움 · 포트는 빈 것) — 시험 서버(8826)와 안 부딪힘 · 함수(/api/*)는 없음(둘 다 같은 조건)
//   쓰는 법: node scripts/atlas11/jinhwa/shots.mjs --id 20261019-0930-1 --route '#/why' --before <폴더> --after <폴더> [--out site/next/data/jinhwa]
//            [--w 360] [--h 640] [--seed key=json …] [--motion] [--base-before http://… --base-after http://…] [--only before|after]
//   끝 코드: 0 = 두 장 다 찍음(360 × 640 PNG) · 1 = 못 찍음 · 2 = 잘못 넣음
//   브라우저: createRequire('/opt/node-tools/')('playwright') · executablePath /opt/pw-browsers/chromium (한 번에 하나 · 다 쓰면 닫음)
import fs from 'node:fs';
import http from 'node:http';
import path from 'node:path';
import {createRequire} from 'node:module';
import {fileURLToPath} from 'node:url';

const MIME = {'.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.mjs': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8', '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.svg': 'image/svg+xml', '.webp': 'image/webp',
  '.woff2': 'font/woff2', '.woff': 'font/woff', '.ttf': 'font/ttf', '.mp4': 'video/mp4', '.webm': 'video/webm', '.txt': 'text/plain; charset=utf-8', '.ico': 'image/x-icon'};

/** 정적 서버 — root(사이트 폴더) · {base, close} */
export function serve(root) {
  const R = path.resolve(root);
  const srv = http.createServer((req, res) => {
    let p; try { p = decodeURIComponent(new URL(req.url, 'http://x').pathname); } catch { res.writeHead(400).end(); return; }
    let f = path.resolve(R, '.' + p);
    if (f !== R && !f.startsWith(R + path.sep)) { res.writeHead(403).end(); return; }
    try { if (fs.statSync(f).isDirectory()) f = path.join(f, 'index.html'); } catch { /* 아래에서 404 */ }
    fs.readFile(f, (err, b) => {
      if (err) { res.writeHead(404, {'content-type': 'text/plain'}).end('없음'); return; }
      res.writeHead(200, {'content-type': MIME[path.extname(f).toLowerCase()] || 'application/octet-stream', 'cache-control': 'no-store'}).end(b);
    });
  });
  return new Promise(ok => srv.listen(0, '127.0.0.1', () => ok({base: `http://127.0.0.1:${srv.address().port}`, close: () => new Promise(r => srv.close(r))})));
}

/** PNG 머리 — {ok, w, h} */
export function pngSize(buf) {
  if (!buf || buf.length < 24 || buf.readUInt32BE(0) !== 0x89504e47 || buf.toString('ascii', 12, 16) !== 'IHDR') return {ok: false, w: 0, h: 0};
  return {ok: true, w: buf.readUInt32BE(16), h: buf.readUInt32BE(20)};
}

/** 한 판 찍기 — page 에서 다 그려질 때까지(「여는 중」 사라짐 · 글꼴 · 망 조용 300ms · 두 장 그림 · 15초까지) */
async function shootOne(ctx, url, file) {
  const page = await ctx.newPage();
  let inflight = 0, lastNet = Date.now();
  const bump = d => { inflight += d; lastNet = Date.now(); };
  page.on('request', () => bump(1)); page.on('requestfinished', () => bump(-1)); page.on('requestfailed', () => bump(-1));
  const errors = [];
  page.on('pageerror', e => errors.push(String(e?.message ?? e).slice(0, 120)));
  await page.goto(url, {waitUntil: 'load', timeout: 30000});
  const t0 = Date.now();
  while (Date.now() - t0 < 15000) {
    const busy = await page.evaluate(() => {
      const loading = [...document.querySelectorAll('body *')].some(e => e.childElementCount === 0 && /여는 중/.test(e.textContent || '') && e.getClientRects().length > 0);
      return loading || (document.fonts && document.fonts.status !== 'loaded');
    }).catch(() => true);
    if (!busy && inflight <= 0 && Date.now() - lastNet > 300) break;
    await page.waitForTimeout(150);
  }
  await page.evaluate(() => new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r)))).catch(() => {});
  fs.mkdirSync(path.dirname(file), {recursive: true});
  await page.screenshot({path: file, type: 'png'});
  await page.close();
  return {file, bytes: fs.statSync(file).size, errors};
}

/** 전후 두 장 — o = {id, route, before, after(폴더 — 그 안의 site/ 를 띄움) | baseBefore, baseAfter(주소), out, w, h, seed: {key: 글}, motion, only, dev} */
export async function shoot(o) {
  const w = Number(o.w || 360), h = Number(o.h || 640), route = o.route || '#/', out = o.out;
  if (!/^\d{8}-\d{4}-(?:[1-3]|f[1-9])$/.test(o.id || '')) return {ok: false, why: '번호(--id)가 이상함'};
  if (!/^#\/[\w\-/.%?=&]*$/.test(route)) return {ok: false, why: '길(--route)은 #/… 꼴'};
  const sides = (o.only ? [o.only] : ['before', 'after']).filter(s => s === 'before' || s === 'after');
  const req = createRequire('/opt/node-tools/');
  let chromium; try { ({chromium} = req('playwright')); } catch { return {ok: false, why: 'playwright 를 못 찾음(/opt/node-tools)'}; }
  const servers = [], res = {};
  let browser;
  try {
    browser = await chromium.launch({executablePath: o.executablePath || '/opt/pw-browsers/chromium', args: ['--disable-dev-shm-usage']});
    for (const side of sides) {
      const given = side === 'before' ? o.baseBefore : o.baseAfter;
      let base = given;
      if (!base) {
        const dir = side === 'before' ? o.before : o.after;
        const site = path.join(dir || '', 'site');
        if (!dir || !fs.existsSync(path.join(site, 'next'))) return {ok: false, why: `${side} 폴더에 site/next 가 없음`};
        const s = await serve(site); servers.push(s); base = s.base;
      }
      const ctx = await browser.newContext({viewport: {width: w, height: h}, deviceScaleFactor: 1, locale: 'ko-KR', timezoneId: 'Asia/Seoul', reducedMotion: o.motion ? 'no-preference' : 'reduce'});
      const seed = o.seed || {};
      if (Object.keys(seed).length) await ctx.addInitScript(s => { try { for (const [k, v] of Object.entries(s)) localStorage.setItem(k, v); } catch { /* 기억 못 하는 기계 */ } }, seed);
      const url = `${base.replace(/\/$/, '')}/next/${o.dev === false ? '' : '?dev=1'}${route}`;
      const file = path.join(out, `${o.id}-${side}.png`);
      res[side] = await shootOne(ctx, url, file);
      await ctx.close();
      const sz = pngSize(fs.readFileSync(file));
      if (!sz.ok || sz.w !== w || sz.h !== h) return {ok: false, why: `${side} 그림 크기 ${sz.w}×${sz.h} — ${w}×${h} 이어야 함`, ...res};
    }
    return {ok: true, ...res};
  } catch (e) {
    return {ok: false, why: '찍기 실패 ' + String(e?.message ?? e).split('\n')[0].slice(0, 160), ...res};
  } finally {
    if (browser) await browser.close().catch(() => {});
    for (const s of servers) await s.close();
  }
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const a = process.argv.slice(2), arg = (k, d) => { const i = a.indexOf(k); return i >= 0 && i + 1 < a.length ? a[i + 1] : d; };
  const seed = {};
  a.forEach((x, i) => { if (x === '--seed' && a[i + 1]) { const s = a[i + 1], j = s.indexOf('='); if (j > 0) { const v = s.slice(j + 1); seed[s.slice(0, j)] = v.startsWith('@') ? fs.readFileSync(v.slice(1), 'utf8') : v; } } });
  const o = {id: arg('--id'), route: arg('--route', '#/'), before: arg('--before'), after: arg('--after'), baseBefore: arg('--base-before'), baseAfter: arg('--base-after'),
    out: arg('--out', 'site/next/data/jinhwa'), w: arg('--w', '360'), h: arg('--h', '640'), seed, motion: a.includes('--motion'), only: arg('--only'), dev: !a.includes('--no-dev')};
  if (!o.id) { console.error('쓰는 법: shots.mjs --id <번호> --route "#/…" --before <폴더> --after <폴더> [--out 폴더]'); process.exit(2); }
  const r = await shoot(o);
  console.log(JSON.stringify(r));
  process.exit(r.ok ? 0 : 1);
}
