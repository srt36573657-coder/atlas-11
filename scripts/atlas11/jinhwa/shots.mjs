#!/usr/bin/env node
// 진화 대안 전후 그림 — 사장님 2026-10-18(싱가포르) 16:39 [8] 5 「바뀌는 것(전과 후 그림 한 장씩)」 · [9] 3 「카드마다 … 전과 후 그림」
//   전 = 지금 main 의 사이트 폴더 · 후 = 대안 가지의 사이트 폴더 — 같은 자료 · 같은 길 · 같은 폭(360 × 640 · 휴대폰 세로)으로 한 장씩
//   서버 = 이 파일 안의 작은 정적 서버(폴더 둘을 따로 띄움 · 포트는 빈 것) — 시험 서버(8826)와 안 부딪힘 · 함수(/api/*)는 없음(둘 다 같은 조건)
//   --live <폴더> = 지금 사이트 자료(그 폴더의 atlas/data/* — gh.mjs liveData 가 받음)를 두 쪽 모두 /atlas/data/ 로 덮어 보임(저장소 자료는 며칠 묵음 · 일 폴더는 안 고침)
//   쓰는 법: node scripts/atlas11/jinhwa/shots.mjs --id 20261019-0930-1 --route '#/why' --before <폴더> --after <폴더> [--out site/next/data/jinhwa]
//            [--w 360] [--h 640] [--seed key=json …] [--steps '<JSON 누르기 차례>'|@파일] [--live <폴더>] [--motion] [--base-before http://… --base-after http://…]
//   끝 코드: 0 = 두 장 다 찍음(360 × 640 PNG · 바뀐 곳 네모 box · 새로 생긴 글 text) · 1 = 못 찍음(두 그림이 같아도) · 2 = 잘못 넣음
//   브라우저: createRequire('/opt/node-tools/')('playwright') · executablePath /opt/pw-browsers/chromium (한 번에 하나 · 다 쓰면 닫음)
import fs from 'node:fs';
import http from 'node:http';
import path from 'node:path';
import {createRequire} from 'node:module';
import {fileURLToPath} from 'node:url';

const MIME = {'.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.mjs': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8', '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.svg': 'image/svg+xml', '.webp': 'image/webp',
  '.woff2': 'font/woff2', '.woff': 'font/woff', '.ttf': 'font/ttf', '.mp4': 'video/mp4', '.webm': 'video/webm', '.txt': 'text/plain; charset=utf-8', '.ico': 'image/x-icon'};

/** 정적 서버 — root(사이트 폴더) · live(지금 사이트 자료 폴더 — 있으면 /atlas/data/ 를 거기서) · {base, close} */
export function serve(root, {live = null} = {}) {
  const R = path.resolve(root), L = live ? path.resolve(live) : null;
  const srv = http.createServer((req, res) => {
    let p; try { p = decodeURIComponent(new URL(req.url, 'http://x').pathname); } catch { res.writeHead(400).end(); return; }
    let f = path.resolve(R, '.' + p);
    if (f !== R && !f.startsWith(R + path.sep)) { res.writeHead(403).end(); return; }
    if (L && p.startsWith('/atlas/data/')) { const g = path.resolve(L, '.' + p); if (g.startsWith(L + path.sep) && fs.existsSync(g)) f = g; }
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

/** 다 그려질 때까지 기다림(「여는 중」 사라짐 · 글꼴 · 망 조용 300ms · 15초까지) */
async function settle(page, net) {
  const t0 = Date.now();
  while (Date.now() - t0 < 15000) {
    const busy = await page.evaluate(() => {
      const loading = [...document.querySelectorAll('body *')].some(e => e.childElementCount === 0 && /여는 중/.test(e.textContent || '') && e.getClientRects().length > 0);
      return loading || (document.fonts && document.fonts.status !== 'loaded');
    }).catch(() => true);
    if (!busy && net.inflight <= 0 && Date.now() - net.last > 300) break;
    await page.waitForTimeout(150);
  }
  await page.evaluate(() => new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r)))).catch(() => {});
}

/** 누르기 차례(사장님 2026-10-19 00:5x 「어디를 고쳤는지 … 표기가 없어서 한참 찾아야 해」 — 결과 화면처럼 눌러야 나오는 곳도 찍게)
 *  [{click: css, nth?}, {fill: css, text}, {press: css, key}, {wait: ms}] · 20개까지 · 틀린 꼴이면 null */
export function stepsOk(steps) {
  if (steps == null) return [];
  if (!Array.isArray(steps) || steps.length > 20) return null;
  const css = v => typeof v === 'string' && v.length > 0 && v.length <= 200;
  for (const s of steps) {
    if (!s || typeof s !== 'object') return null;
    const k = Object.keys(s).sort().join(',');
    if (k === 'click' || k === 'click,nth') { if (!css(s.click) || (s.nth != null && !(Number.isInteger(s.nth) && s.nth >= 0 && s.nth < 50))) return null; }
    else if (k === 'fill,text') { if (!css(s.fill) || typeof s.text !== 'string' || s.text.length > 200) return null; }
    else if (k === 'key,press') { if (!css(s.press) || !/^[A-Za-z]{1,12}$/.test(s.key)) return null; }
    else if (k === 'wait') { if (!(Number.isInteger(s.wait) && s.wait >= 0 && s.wait <= 3000)) return null; }
    else return null;
  }
  return steps;
}

/** 한 쪽 열기 — 길을 열고 · 누르기 차례를 하고 · 다 그려질 때까지 */
async function openSide(ctx, url, steps) {
  const page = await ctx.newPage();
  const net = {inflight: 0, last: Date.now()};
  const bump = d => { net.inflight += d; net.last = Date.now(); };
  page.on('request', () => bump(1)); page.on('requestfinished', () => bump(-1)); page.on('requestfailed', () => bump(-1));
  const errors = [];
  page.on('pageerror', e => errors.push(String(e?.message ?? e).slice(0, 120)));
  await page.goto(url, {waitUntil: 'load', timeout: 30000});
  await settle(page, net);
  for (const s of steps) {
    if ('click' in s) await page.locator(s.click).nth(s.nth ?? 0).click({timeout: 8000});
    else if ('fill' in s) await page.locator(s.fill).first().fill(s.text, {timeout: 8000});
    else if ('press' in s) await page.locator(s.press).first().press(s.key, {timeout: 8000});
    else await page.waitForTimeout(s.wait);
    await settle(page, net);
  }
  return {page, net, errors};
}

/** 두 PNG 의 다른 곳 네모 {x, y, w, h}(그림 점 · 고친 뒤 그림 기준) · 같으면 null — 빈 쪽(about:blank)의 그림판으로 셈(한 칸 차이 24 넘을 때만)
 *  글이 끼어들어 아래가 통째로 밀린 꼴이면(밀린 뒤 아래 줄이 고치기 전과 같음) 끼어든 줄만 네모로 · 빠진 꼴이면 그 자리에 얇은 네모 */
export async function diffBox(page, a, b) {
  return page.evaluate(async ([a, b]) => {
    const load = async s => createImageBitmap(await (await fetch('data:image/png;base64,' + s)).blob());
    const [A, B] = await Promise.all([load(a), load(b)]);
    const W = Math.max(A.width, B.width), H = Math.max(A.height, B.height);
    const px = I => { const c = new OffscreenCanvas(W, H), g = c.getContext('2d'); g.fillStyle = '#ff00ff'; g.fillRect(0, 0, W, H); g.drawImage(I, 0, 0); return g.getImageData(0, 0, W, H).data; };
    const p = px(A), q = px(B), T = 24;
    const same = (ya, yb) => { if (ya < 0 || yb < 0 || ya >= H || yb >= H) return false; const ia = ya * W * 4, ib = yb * W * 4; for (let x = 0; x < W * 4; x += 4) if (Math.abs(p[ia + x] - q[ib + x]) > T || Math.abs(p[ia + x + 1] - q[ib + x + 1]) > T || Math.abs(p[ia + x + 2] - q[ib + x + 2]) > T) return false; return true; };
    const flat = (d, y) => { const i = y * W * 4; for (let x = 4; x < W * 4; x += 4) if (Math.abs(d[i + x] - d[i]) > T || Math.abs(d[i + x + 1] - d[i + 1]) > T || Math.abs(d[i + x + 2] - d[i + 2]) > T) return false; return true; };
    let y0 = 0; while (y0 < H && same(y0, y0)) y0++;
    if (y0 >= H) return null;
    let y1 = H - 1; while (y1 > y0 && same(y1, y1)) y1--;
    const cols = (ya, yb, yq) => { let x0 = W, x1 = -1; for (let y = ya; y <= yb; y++) { const i = y * W * 4, j = (y + (yq - ya)) * W * 4; for (let x = 0; x < W; x++) { const k = x * 4; if (Math.abs(p[i + k] - q[j + k]) > T || Math.abs(p[i + k + 1] - q[j + k + 1]) > T || Math.abs(p[i + k + 2] - q[j + k + 2]) > T) { if (x < x0) x0 = x; if (x > x1) x1 = x; } } } return x1 < 0 ? [0, W - 1] : [x0, x1]; };
    // 밀림 찾기 — 다른 첫 줄 아래 40줄(빈 줄만이면 더 내려감)이 d 만큼 밀려 같으면 끼어듦(d > 0) · 빠짐(d < 0)
    const K = 40, ok = d => { let n = 0; for (let y = y0; y < H && n < K; y++) { if (!same(y, y + d)) return false; if (!flat(p, y)) n++; } return n >= Math.min(K, 8); };
    for (let d = 1; d < Math.min(H, 1500); d++) {
      if (ok(d)) { const [x0, x1] = cols(y0, Math.min(H - 1, y0 + d - 1), y0); let yb = y0 + d - 1; while (yb > y0 && flat(q, yb)) yb--; let ya = y0; while (ya < yb && flat(q, ya)) ya++; return {x: x0, y: ya, w: x1 - x0 + 1, h: yb - ya + 1, kind: 'add'}; }
      if (ok(-d)) return {x: 0, y: y0, w: W, h: 4, kind: 'cut'};
    }
    const [x0, x1] = cols(y0, y1, y0);
    return {x: x0, y: y0, w: x1 - x0 + 1, h: y1 - y0 + 1, kind: 'change'};
  }, [a.toString('base64'), b.toString('base64')]);
}

/** 고친 뒤 화면에서 새로 생긴 글(고치기 전 화면보다 더 많이 나온 글 — 같은 글이 다른 곳에 있어도) — {box: 쪽 전체 기준 네모 | null, text(120자까지)}
 *  글이 끼어들면 그 아래가 소수점만큼 밀려 그림 맞대기로는 넓게 잡힘 → 글이 있으면 글 자리를 먼저 씀 */
async function newText(before, after) {
  const leafTexts = () => [...document.querySelectorAll('body *')].filter(e => e.getClientRects().length && [...e.childNodes].some(n => n.nodeType === 3 && n.textContent.trim()))
    .map(e => { const r = e.getBoundingClientRect(); return {t: (e.innerText || e.textContent || '').replace(/\s+/g, ' ').trim(), r: {x: r.x + scrollX, y: r.y + scrollY, w: r.width, h: r.height}}; }).filter(o => o.t && o.r.w > 0 && o.r.h > 0);
  const cnt = xs => xs.reduce((m, o) => m.set(o.t, (m.get(o.t) ?? 0) + 1), new Map());
  const pairs = xs => xs.map((o, i) => ({...o, k: (xs[i - 1]?.t ?? '') + '\u0000' + o.t}));
  const Bx = await before.evaluate(leafTexts), A = pairs(await after.evaluate(leafTexts)), B = cnt(Bx), AC = cnt(A);
  const BK = cnt(pairs(Bx).map(o => ({t: o.k})));
  const more = A.filter(o => (AC.get(o.t) ?? 0) > (B.get(o.t) ?? 0));
  const fresh = more.filter(o => !(BK.get(o.k) > 0)); // 같은 글이 이미 있던 곳(앞 글까지 같음)은 옛것 — 앞 글이 다른 쪽이 새로 끼어든 곳
  const got = fresh.length ? fresh : more;
  if (!got.length) return {box: null, text: ''};
  const g = got.filter(o => o.r.y <= got[0].r.y + 400); // 첫 새 글 둘레(멀리 떨어진 것은 같은 글이 아래 목록에 또 생긴 것)
  const x0 = Math.min(...g.map(o => o.r.x)), y0 = Math.min(...g.map(o => o.r.y)), x1 = Math.max(...g.map(o => o.r.x + o.r.w)), y1 = Math.max(...g.map(o => o.r.y + o.r.h));
  return {box: {x: Math.round(x0), y: Math.round(y0), w: Math.round(x1 - x0), h: Math.round(y1 - y0), kind: 'text'}, text: [...new Set(g.map(o => o.t))].join(' ').slice(0, 120)};
}

/** 전후 두 장 — o = {id, route, before, after(폴더 — 그 안의 site/ 를 띄움) | baseBefore, baseAfter(주소), out, w, h, seed: {key: 글}, steps, motion, dev}
 *  두 쪽을 끝까지 찍어 다른 곳을 찾고 → 그 곳이 화면 위쪽 3분의 1에 오게 두 쪽을 같은 만큼 내려 한 장씩(360 × 640)
 *  돌려줌 {ok, before, after, box: {x, y, w, h}(찍은 그림 안 바뀐 곳 · 점), text(새로 생긴 글)} · 두 그림이 같으면 ok false(사장님이 어디를 고쳤는지 못 찾음) */
export async function shoot(o) {
  const w = Number(o.w || 360), h = Number(o.h || 640), route = o.route || '#/', out = o.out;
  if (!/^\d{8}-\d{4}-(?:[1-3]|f[1-9])$/.test(o.id || '')) return {ok: false, why: '번호(--id)가 이상함'};
  if (!/^#\/[\w\-/.%?=&]*$/.test(route)) return {ok: false, why: '길(--route)은 #/… 꼴'};
  const steps = stepsOk(o.steps);
  if (!steps) return {ok: false, why: '누르기 차례(--steps)의 꼴이 틀림'};
  const req = createRequire('/opt/node-tools/');
  let chromium; try { ({chromium} = req('playwright')); } catch { return {ok: false, why: 'playwright 를 못 찾음(/opt/node-tools)'}; }
  const servers = [], res = {}, side = {};
  let browser;
  try {
    browser = await chromium.launch({executablePath: o.executablePath || '/opt/pw-browsers/chromium', args: ['--disable-dev-shm-usage']});
    for (const k of ['before', 'after']) {
      let base = k === 'before' ? o.baseBefore : o.baseAfter;
      if (!base) {
        const dir = k === 'before' ? o.before : o.after;
        const site = path.join(dir || '', 'site');
        if (!dir || !fs.existsSync(path.join(site, 'next'))) return {ok: false, why: `${k} 폴더에 site/next 가 없음`};
        const s = await serve(site, {live: o.live || null}); servers.push(s); base = s.base;
      }
      const ctx = await browser.newContext({viewport: {width: w, height: h}, deviceScaleFactor: 1, locale: 'ko-KR', timezoneId: 'Asia/Seoul', reducedMotion: o.motion ? 'no-preference' : 'reduce'});
      const seed = o.seed || {};
      if (Object.keys(seed).length) await ctx.addInitScript(s => { try { for (const [k, v] of Object.entries(s)) localStorage.setItem(k, v); } catch { /* 기억 못 하는 기계 */ } }, seed);
      const url = `${base.replace(/\/$/, '')}/next/${o.dev === false ? '' : '?dev=1'}${route}`;
      try { side[k] = {ctx, ...(await openSide(ctx, url, steps))}; }
      catch (e) { return {ok: false, why: `${k} 쪽 누르기 차례 실패 — ` + String(e?.message ?? e).split('\n')[0].slice(0, 140)}; }
    }
    const scratch = await side.after.ctx.newPage();
    const full = {before: await side.before.page.screenshot({type: 'png', fullPage: true}), after: await side.after.page.screenshot({type: 'png', fullPage: true})};
    if (process.env.JH_SHOT_DEBUG) { fs.writeFileSync(process.env.JH_SHOT_DEBUG + "-b.png", full.before); fs.writeFileSync(process.env.JH_SHOT_DEBUG + "-a.png", full.after); }
    const px = await diffBox(scratch, full.before, full.after);
    const nt = px ? await newText(side.before.page, side.after.page).catch(() => ({box: null, text: ''})) : {box: null, text: ''};
    const fb = nt.box ?? px;
    if (!fb) return {ok: false, why: '전후 그림이 같음 — 바뀐 곳이 나오는 길(--route · --seed · --steps)을 골라야 함'};
    const sy = Math.max(0, fb.y - Math.round(h * 0.3));
    const shot = {};
    for (const k of ['before', 'after']) {
      const pg = side[k].page;
      await pg.evaluate(y => window.scrollTo(0, y), sy);
      await pg.evaluate(() => new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r))));
      fs.mkdirSync(out, {recursive: true});
      const file = path.join(out, `${o.id}-${k}.png`);
      shot[k] = await pg.screenshot({path: file, type: 'png'});
      res[k] = {file, bytes: fs.statSync(file).size, errors: side[k].errors};
      const sz = pngSize(shot[k]);
      if (!sz.ok || sz.w !== w || sz.h !== h) return {ok: false, why: `${k} 그림 크기 ${sz.w}×${sz.h} — ${w}×${h} 이어야 함`, ...res};
    }
    const sa = await side.after.page.evaluate(() => window.scrollY);
    const b0 = {x: fb.x, y: fb.y - sa, w: fb.w, h: fb.h};
    if (b0.y + b0.h <= 0 || b0.y >= h || !(await diffBox(scratch, shot.before, shot.after))) return {ok: false, why: '바뀐 곳이 찍은 칸 안에 안 들어옴(위 · 아래 막대 밑에 숨음)', ...res};
    const P = 6, box = {x: Math.max(0, b0.x - P), y: Math.max(0, b0.y - P)};
    box.w = Math.min(w, b0.x + b0.w + P) - box.x; box.h = Math.min(h, b0.y + b0.h + P) - box.y;
    const text = nt.text;
    return {ok: true, ...res, box, kind: fb.kind, text};
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
  let steps = null; const sa = arg('--steps');
  if (sa) { try { steps = JSON.parse(sa.startsWith('@') ? fs.readFileSync(sa.slice(1), 'utf8') : sa); } catch { console.error('--steps 는 JSON'); process.exit(2); } }
  const o = {steps, id: arg('--id'), route: arg('--route', '#/'), before: arg('--before'), after: arg('--after'), baseBefore: arg('--base-before'), baseAfter: arg('--base-after'),
    out: arg('--out', 'site/next/data/jinhwa'), w: arg('--w', '360'), h: arg('--h', '640'), seed, live: arg('--live'), motion: a.includes('--motion'), dev: !a.includes('--no-dev')};
  if (!o.id) { console.error('쓰는 법: shots.mjs --id <번호> --route "#/…" --before <폴더> --after <폴더> [--out 폴더]'); process.exit(2); }
  const r = await shoot(o);
  console.log(JSON.stringify(r));
  process.exit(r.ok ? 0 : 1);
}
