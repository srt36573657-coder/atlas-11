// 탐침 — 올라간 사이트(aaa7377.com)에서 회사 화면 테마 시계 자리 줄 · 시계 읽는 법 행성 열을 진짜 브라우저(휴대폰 크기)로 봄
//   사장님 2026-10-20(서울) 21:56 「맞아 / 정말 맞아」(박승혁 님 생각 — 회사마다 지금 싹인지 꽃인지) · 22:17 「진짜 실사 행성으로 해」 · 23:42 「맞아」
//   깃허브 실행기에서만 바깥에 닿음 · 결과 reports/atlas11/probe/live-co/(그림 · summary.json) · 사이트에는 아무것도 올리지 않음
//   ① 자료 파일: /next/data/theme-co.json(회사 자리) · /media/planet/*.webp(행성 사진) · /next/app.js 에 themeCo 가 있나
//   ② 회사 화면(#/w/005930 · 000660 · 035420): 맨 위에서 업종 담기 단추가 첫 화면 안인가 · 자리 줄 글 · 줄로 내려 찍은 그림
//   ③ 시계 읽는 법(#/t/how): 행성 열 줄 수 · 사진이 다 열렸나 · 찍은 그림
//   쓰는 법(실행기): PW_DIR=/tmp/pw/node_modules node scripts/atlas11/probe/live_co.mjs
import fs from 'node:fs/promises';
import {createRequire} from 'node:module';
const require = createRequire(process.env.PW_DIR ? process.env.PW_DIR.replace(/\/?$/, '/') : import.meta.url);
const {chromium} = require('playwright');
const B = (process.env.LIVE_BASE || 'https://aaa7377.com').replace(/\/+$/, '');
const dir = process.env.LIVE_OUT || 'reports/atlas11/probe/live-co'; await fs.mkdir(dir, {recursive: true});
const out = {made: new Date().toISOString(), base: B, files: {}, co: [], how: null, errors: []};
const get = async p => { const r = await fetch(B + p + (p.includes('?') ? '&' : '?') + 'v=' + Date.now(), {headers: {'Cache-Control': 'no-cache'}, signal: AbortSignal.timeout(30000)}); return {r, buf: Buffer.from(await r.arrayBuffer())}; };
try {
  const {r, buf} = await get('/next/data/theme-co.json');
  const j = r.ok ? JSON.parse(buf.toString('utf8')) : null;
  out.files.themeCo = {status: r.status, bytes: buf.length, schema: j?.schema ?? null, asOf: j?.asOf ?? null, n: j?.n ?? null, skip: j?.skip ?? null, s005930: j?.co?.['005930'] ?? null, s000660: j?.co?.['000660'] ?? null};
} catch (e) { out.errors.push('themeCo ' + String(e.message).slice(0, 80)); }
try { const {r, buf} = await get('/next/app.js'); out.files.app = {status: r.status, themeCo: buf.includes('themeCo'), wZone: buf.includes('function wZone(')}; } catch (e) { out.errors.push('app ' + String(e.message).slice(0, 80)); }
out.files.planet = [];
for (const n of ['sun', 'earth', 'mercury', 'venus', 'moon', 'mars', 'jupiter', 'saturn', 'uranus', 'neptune', 'pluto']) {
  try { const {r, buf} = await get(`/media/planet/${n}-96.webp`); out.files.planet.push({n, status: r.status, type: r.headers.get('content-type'), bytes: buf.length, webp: buf.subarray(8, 12).toString() === 'WEBP'}); } catch (e) { out.errors.push(n + ' ' + String(e.message).slice(0, 60)); }
}
const b = await chromium.launch(process.env.PW_EXE ? {executablePath: process.env.PW_EXE} : {});
const ctx = await b.newContext({viewport: {width: 390, height: 844}, deviceScaleFactor: 2, isMobile: true, hasTouch: true, locale: 'ko-KR', timezoneId: 'Asia/Seoul'});
const page = await ctx.newPage();
const errs = []; page.on('pageerror', e => errs.push('PE ' + e.message.slice(0, 120)));
await page.addInitScript(() => { document.addEventListener('securitypolicyviolation', e => { (window.__csp = window.__csp || []).push(e.violatedDirective + ' ' + (e.blockedURI || '').slice(0, 60)); }); });
await page.goto(B + '/?v=' + Date.now() + '#/', {waitUntil: 'networkidle', timeout: 60000}).catch(e => out.errors.push('home ' + String(e).slice(0, 80)));
await page.waitForTimeout(2500);
for (const code of ['005930', '000660', '035420']) {
  try {
    await page.evaluate(h => { window.scrollTo(0, 0); location.hash = h; }, '#/w/' + code);
    await page.waitForFunction(() => document.querySelector('#view .chan') && !document.querySelector('#view .boot'), null, {timeout: 30000}).catch(() => {});
    await page.waitForTimeout(1200);
    const m = await page.evaluate(() => {
      const r = s => { const e = document.querySelector(s); if (!e) return null; const q = e.getBoundingClientRect(); return [Math.round(q.top), Math.round(q.bottom)]; };
      const z = document.querySelector('#view .wz');
      return {scrollY: Math.round(scrollY), player: r('#view .player'), tabs: r('#view nav.wtabs'), chanBtn: r('#view .chan .sub-btn'), wz: r('#view .wz'), h: innerHeight,
        tag: z?.tagName.toLowerCase() ?? null, t: z?.querySelector('.wz-t')?.textContent ?? null, n: [...(z?.querySelectorAll('.wz-n > span') ?? [])].map(x => x.textContent), q: z?.querySelector('.wz-n')?.textContent ?? null,
        href: z?.getAttribute('href') ?? null, zone: z?.getAttribute('data-z') ?? null, afterChan: !!(z && document.querySelector('#view .chan') && (document.querySelector('#view .chan').compareDocumentPosition(z) & Node.DOCUMENT_POSITION_FOLLOWING))};
    });
    if (code === '005930') {
      await page.evaluate(() => document.querySelector('#view .wz')?.scrollIntoView({block: 'center'})); await page.waitForTimeout(600);
      await page.screenshot({path: `${dir}/co-${code}-zone.png`});
    }
    out.co.push({code, ...m});
  } catch (e) { out.errors.push(code + ' ' + String(e.message).slice(0, 100)); }
}
try {
  await page.evaluate(() => { window.scrollTo(0, 0); location.hash = '#/t/how'; });
  await page.waitForFunction(() => document.querySelectorAll('#view .th-pls li').length > 0, null, {timeout: 30000}).catch(() => {});
  await page.waitForTimeout(1500);
  out.how = await page.evaluate(async () => {
    const ims = [...document.querySelectorAll('#view img.th-pi')];
    for (const i of ims) { try { await i.decode(); } catch { /* 못 엶 */ } }
    return {rows: document.querySelectorAll('#view .th-pls li').length, imgs: ims.length, bad: ims.filter(i => !i.naturalWidth).length, first: [...document.querySelectorAll('#view .th-pls li')].slice(0, 2).map(li => li.textContent),
      clockPlanets: document.querySelectorAll('#view svg.th-clock image.th-pl').length, sun: document.querySelectorAll('#view svg.th-clock image.th-sun').length, sw: document.documentElement.scrollWidth, cw: document.documentElement.clientWidth};
  });
  await page.evaluate(() => document.querySelector('#view .th-pls')?.scrollIntoView({block: 'start'})); await page.waitForTimeout(600);
  await page.screenshot({path: `${dir}/how-planets.png`});
} catch (e) { out.errors.push('how ' + String(e.message).slice(0, 100)); }
out.pageErrors = errs.slice(0, 6);
out.csp = await page.evaluate(() => (window.__csp || []).slice(0, 6)).catch(() => []);
await b.close();
await fs.writeFile(`${dir}/summary.json`, JSON.stringify(out, null, 1) + '\n');
console.log(JSON.stringify({co: out.co.map(c => [c.code, c.t, c.chanBtn, c.wz]), how: out.how, themeCo: out.files.themeCo?.status, errors: out.errors.length}));
