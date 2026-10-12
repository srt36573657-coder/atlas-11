// 탐침 — 올라간 사이트(aaa7377.com)를 진짜 브라우저(휴대폰 크기)로 열어 봄(사장님 2026-10-13 03:35 「못한거 해내」 · 03:38 「모든 흔적 다 지워」)
//   깃허브 실행기에서만 바깥에 닿음 · 결과 reports/atlas11/probe/live-view/(그림 · summary.json)
//   ① 소개 그림 · 영상 · 달 · 링크 미리보기 파일을 받아 git 블롭 번호로 셈 — 옛 그림(지운 판 43개) 가운데 하나라도 나오면 실패
//   ② 맨 위 2장 → 「자세히 ›」 글 · ③ 업데이트 탭의 10월 12일 21:11 줄 · ④ 소개 한 장(hello.html) · ⑤ 옛 판 첫 화면 띠 — 그림으로 남김
import fs from 'node:fs/promises';
import crypto from 'node:crypto';
import {createRequire} from 'node:module';
const require = createRequire(process.env.PW_DIR ? process.env.PW_DIR.replace(/\/?$/, '/') : import.meta.url);
const {chromium} = require('playwright');
const B = 'https://aaa7377.com', dir = 'reports/atlas11/probe/live-view'; await fs.mkdir(dir, {recursive: true});
// 지운 옛 그림 판(git 블롭 번호 · 그림이 아니라 번호만)
const OLD = new Set(`${(await fs.readFile('scripts/atlas11/probe/old-media-blobs.txt', 'utf8'))}`.split(/\s+/).filter(Boolean));
const blobId = buf => crypto.createHash('sha1').update(Buffer.concat([Buffer.from(`blob ${buf.length}\0`), buf])).digest('hex');
const MEDIA = ['/media/makbi-moon.svg', '/media/makbi-icon.svg', '/media/makbi-hello.svg', '/media/makbi-poster.jpg', '/media/makbi-intro.mp4', '/media/makbi-intro.webm', '/og-makbi.jpg',
  // 옛 주소 — 지운 그림이 다시 나오지 않는지(없거나 첫 화면 글이 와야 함)
  '/media/atlas-moon-face.jpg', '/media/atlas-hello-wide.jpg', '/media/atlas-hello-132.jpg', '/media/atlas-hello-face.jpg', '/media/atlas-hello.jpg', '/media/atlas-hello.mp4', '/media/atlas-hello.webm', '/og-hello.jpg'];
const out = {made: new Date().toISOString(), base: B, media: [], oldFound: 0, sameAsRepo: 0, shots: [], texts: {}, errors: []};
for (const p of MEDIA) {
  try {
    const r = await fetch(B + p + '?v=' + Date.now(), {headers: {'Cache-Control': 'no-cache'}, signal: AbortSignal.timeout(60000)});
    const buf = Buffer.from(await r.arrayBuffer()), id = blobId(buf);
    let repo = null; try { repo = blobId(await fs.readFile('site' + p)); } catch { /* 저장소에 없음 */ }
    const row = {path: p, status: r.status, bytes: buf.length, old: OLD.has(id), sameAsRepo: repo === id};
    out.media.push(row); if (row.old) out.oldFound++; if (row.sameAsRepo) out.sameAsRepo++;
  } catch (e) { out.errors.push(`${p}: ${String(e.message).slice(0, 80)}`); }
}
const b = await chromium.launch();
const ctx = await b.newContext({viewport: {width: 390, height: 844}, deviceScaleFactor: 2, isMobile: true, hasTouch: true, locale: 'ko-KR', timezoneId: 'Asia/Seoul'});
const page = await ctx.newPage();
const shot = async (name, opts = {}) => { const f = `${dir}/${name}.png`; await page.screenshot({path: f, ...opts}); out.shots.push(f); };
const step = async (name, fn) => { try { await fn(); } catch (e) { out.errors.push(`${name}: ${String(e.message).slice(0, 120)}`); } };
await step('첫 화면', async () => {
  await page.goto(B + '/?v=' + Date.now(), {waitUntil: 'networkidle', timeout: 60000});
  await page.waitForSelector('.hbar', {timeout: 30000}); await page.waitForTimeout(800);
  await page.evaluate(() => document.querySelector('[aria-label="‖ 멈춤"], .hplay')?.click?.());
  await shot('p1-slide1');
  out.texts.moon = await page.evaluate(() => { const hd = document.querySelector('h1.head, .co-head h1'); return hd ? getComputedStyle(hd, '::before').backgroundImage : null; });
});
await step('2장', async () => {
  await page.click('button[aria-label="다음 장"]'); await page.waitForTimeout(900); await shot('p2-slide2');
  out.texts.slide2 = await page.evaluate(() => [...document.querySelectorAll('.hs')].filter(s => !s.hidden && getComputedStyle(s).visibility !== 'hidden').map(s => s.innerText).join('\n').slice(0, 800));
  const more = page.locator('.hs:not([hidden]) .hmore').filter({hasText: '자세히'}).first();
  await more.click({timeout: 10000}); await page.waitForSelector('.hdet:not([hidden])', {timeout: 10000}); await page.waitForTimeout(500);
  out.texts.detail = (await page.locator('.hdet').innerText()).slice(0, 2000);
  await page.locator('.hdet').screenshot({path: `${dir}/p3-slide2-detail.png`}); out.shots.push(`${dir}/p3-slide2-detail.png`);
});
await step('업데이트 탭', async () => {
  await page.goto(B + '/?v=' + Date.now() + '#/up', {waitUntil: 'networkidle', timeout: 60000}); await page.waitForTimeout(1500);
  out.texts.moonUp = await page.evaluate(() => { const hd = document.querySelector('h1.head, .co-head h1'); return hd ? getComputedStyle(hd, '::before').backgroundImage : null; });
  const lines = await page.evaluate(() => [...document.querySelectorAll('#view li, #view p, #view details, #view tr')].map(e => e.innerText).filter(t => /21:11/.test(t)).slice(0, 4));
  out.texts.up2111 = lines;
  const hit = page.locator('#view li, #view details, #view tr').filter({hasText: '21:11'}).first();
  if (await hit.count()) { await hit.scrollIntoViewIfNeeded(); await page.waitForTimeout(300); await hit.screenshot({path: `${dir}/p4-up-2111.png`}); out.shots.push(`${dir}/p4-up-2111.png`); }
  await page.evaluate(() => window.scrollTo(0, 0)); await shot('p4-up-top');
});
await step('소개 한 장', async () => {
  await page.goto(B + '/hello.html?v=' + Date.now(), {waitUntil: 'networkidle', timeout: 60000}); await page.waitForTimeout(800);
  out.texts.hello = await page.evaluate(() => ({poster: document.querySelector('video')?.getAttribute('poster') ?? null, src: [...document.querySelectorAll('video source')].map(s => s.getAttribute('src')), og: document.querySelector('meta[property="og:image"]')?.content ?? null}));
  await shot('p5-hello');
});
await step('36곳 없음', async () => { // 사장님 2026-10-13 06:45 「매수 검토 36곳 영구 삭제 하라」 — 옛 주소 · 탭 · 글 · 자료 파일
  await page.goto(B + '/?v=' + Date.now() + '#/36', {waitUntil: 'networkidle', timeout: 60000}); await page.waitForTimeout(1500);
  const r = await page.evaluate(() => ({hash: location.hash, tabs: [...document.querySelectorAll('nav.tabbar a')].map(a => a.textContent.trim()), seen: (document.body.innerText.match(/(?<![\d,])36곳|매수 검토/g) ?? []).length}));
  await shot('p7-no36');
  const get = async u => { try { const x = await fetch(B + u + '?v=' + Date.now(), {headers: {'Cache-Control': 'no-cache'}, signal: AbortSignal.timeout(30000)}); const t = await x.text(); return {status: x.status, json: /^\s*\{/.test(t), picks: /"picks"|(?<![\d,])36곳/.test(t)}; } catch { return {status: 0}; } };
  const pick = await get('/atlas/data/pick36.json'), range = await get('/atlas/data/range.json'); // 없는 파일은 404 또는 첫 화면 글(되돌려 보내기) — 36곳 자료(JSON)만 아니면 됨
  out.no36 = {...r, pick36: pick, range, ok: (r.hash === '#/' || r.hash === '') && r.tabs.length === 3 && r.seen === 0 && !pick.json && !pick.picks && range.status === 200 && range.json && !range.picks};
  if (!out.no36.ok) out.errors.push('36곳 없음: ' + JSON.stringify(out.no36).slice(0, 160));
});
await step('옛 판', async () => {
  await page.goto(B + '/old/?v=' + Date.now(), {waitUntil: 'networkidle', timeout: 60000}); await page.waitForTimeout(1500); await shot('p6-old');
});
await b.close();
out.ok = out.oldFound === 0 && out.errors.length === 0;
await fs.writeFile(`${dir}/summary.json`, JSON.stringify(out, null, 1));
console.log(JSON.stringify({oldFound: out.oldFound, sameAsRepo: out.sameAsRepo, media: out.media.length, shots: out.shots.length, errors: out.errors}));
