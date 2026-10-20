// 탐침 — 「처음 온 사람 길」 미리 보기에 쓸 진짜 화면 넷을 휴대폰 크기로 찍고, 짚을 곳의 자리를 잰다
//   서진성 님 2026-10-21(서울) 00:13 「주식을 아예 모르는 사람들이 알수있게 … 이 우주를 중심이 두고 … 구글과 잡스가 협력하여 바보도 알수 있개 혁신하라」
//   00:19 「초보자들이 뭘 눌러야? 모르잖아 그러면 여기 눌러봐요 이건 이거예요 즉 엄마가 아이를 가르치듯이 해야해」
//   길: 첫 화면(테마 시계) → 번호 ① 업종 → 그 업종에서 가장 많이 오른 회사 → 「이 회사로 왜 사?」
//   씀: <OUT>/a-home.png · b-ind.png · c-co.png · d-why.png(390×844 · 두 배) · steps.json(짚을 곳 자리 = CSS px · 화면 안 좌표)
//   쓰는 법: 실행기 PW_DIR=/tmp/pw/node_modules node scripts/atlas11/probe/live_guide.mjs
//            로컬 LIVE_BASE=http://127.0.0.1:8826 LIVE_APP=/next/ PW_DIR=/tmp/pw/node_modules PW_EXE=/opt/pw-browsers/chromium LIVE_OUT=<폴더> node …
import fs from 'node:fs/promises';
import {createRequire} from 'node:module';
const require = createRequire(process.env.PW_DIR ? process.env.PW_DIR.replace(/\/?$/, '/') : import.meta.url);
const {chromium} = require('playwright');
const B = (process.env.LIVE_BASE || 'https://aaa7377.com').replace(/\/+$/, ''), APP = process.env.LIVE_APP || '/';
const dir = process.env.LIVE_OUT || 'reports/atlas11/probe/live-guide'; await fs.mkdir(dir, {recursive: true});
const out = {made: new Date().toISOString(), base: B, w: 390, h: 844, screens: {}, errors: []};
const b = await chromium.launch(process.env.PW_EXE ? {executablePath: process.env.PW_EXE} : {});
const ctx = await b.newContext({viewport: {width: 390, height: 844}, deviceScaleFactor: 2, isMobile: true, hasTouch: true, locale: 'ko-KR', timezoneId: 'Asia/Seoul'});
const page = await ctx.newPage();
const errs = []; page.on('pageerror', e => errs.push(e.message.slice(0, 120)));
const rect = sel => page.evaluate(s => { const e = typeof s === 'string' ? document.querySelector(s) : null; if (!e) return null; const q = e.getBoundingClientRect(); return [Math.round(q.left), Math.round(q.top), Math.round(q.width), Math.round(q.height)]; }, sel);
const go = async (hash, waitSel) => {
  await page.evaluate(h => { location.hash = h; }, hash);
  await page.waitForFunction(s => !!document.querySelector(s) && !document.querySelector('#view .boot'), waitSel, {timeout: 30000}).catch(() => out.errors.push('기다림 ' + waitSel));
  await page.waitForTimeout(1500); await page.evaluate(() => window.scrollTo(0, 0)); await page.waitForTimeout(500);
};
try {
  await page.goto(B + APP + '?v=' + Date.now() + '#/', {waitUntil: 'networkidle', timeout: 60000});
  await page.waitForFunction(() => document.querySelectorAll('svg.th-clock a.th-tapn').length > 0, null, {timeout: 30000});
  await page.waitForTimeout(1500); await page.evaluate(() => window.scrollTo(0, 0)); await page.waitForTimeout(500);
  const a = await page.evaluate(() => {
    const r = e => { if (!e) return null; const q = e.getBoundingClientRect(); return [Math.round(q.left), Math.round(q.top), Math.round(q.width), Math.round(q.height)]; };
    const one = [...document.querySelectorAll('svg.th-clock a.th-tapn')].find(x => x.textContent.trim() === '1');
    const row1 = [...document.querySelectorAll('#view a.th-row')].find(x => x.getAttribute('href') === one?.getAttribute('href'));
    const nb = one?.querySelector('circle.th-nb');
    return {clock: r(document.querySelector('svg.th-clock')), sun: r(document.querySelector('svg.th-clock image.th-sun')), sprout: r(document.querySelector('svg.th-clock rect.th-sz')),
      one: r(nb) ?? r(one), oneTap: r(one), oneHref: one?.getAttribute('href') ?? null, oneName: (row1?.querySelector('b, .th-rn, strong')?.textContent ?? '').trim() || null, cnt: document.querySelectorAll('svg.th-clock image.th-pl').length};
  });
  if (!a.oneName && a.oneHref) a.oneName = decodeURIComponent(a.oneHref.replace(/^#\/t\/i\//, ''));
  await page.screenshot({path: `${dir}/a-home.png`}); out.screens.a = {img: 'a-home.png', ...a};
  await go(a.oneHref, '#view .th-ck');
  const bb = await page.evaluate(() => {
    const r = e => { if (!e) return null; const q = e.getBoundingClientRect(); return [Math.round(q.left), Math.round(q.top), Math.round(q.width), Math.round(q.height)]; };
    const cks = [...document.querySelectorAll('#view .th-ck')], ans = document.querySelector('#view h2.th-ans');
    const top = ans ? ans.getBoundingClientRect().top : cks[0]?.getBoundingClientRect().top, last = cks[cks.length - 1]?.getBoundingClientRect();
    const chip = [...document.querySelectorAll('#view .chaps a.cp')].find(x => /^\s*3/.test(x.textContent));
    if (chip) chip.scrollIntoView({block: 'nearest', inline: 'nearest'});
    return {head: r(document.querySelector('#view .th-hd')), dots: top != null && last ? [16, Math.round(top), 358, Math.round(last.bottom - top)] : null, on: cks.filter(x => /✓/.test(x.textContent)).length, all: cks.length,
      chip: r(chip), chipHref: chip?.getAttribute('href') ?? null, coName: chip?.textContent.replace(/^\s*3/, '').trim() ?? null, name: document.querySelector('#view .th-hd')?.textContent.trim() ?? null, say: document.querySelector('#view .th-say')?.textContent.replace(/^돌이/, '').trim() ?? null};
  });
  bb.chip = await page.evaluate(() => { const c = [...document.querySelectorAll('#view .chaps a.cp')].find(x => /^\s*3/.test(x.textContent)); if (!c) return null; const q = c.getBoundingClientRect(); return [Math.round(q.left), Math.round(q.top), Math.round(q.width), Math.round(q.height)]; });
  await page.screenshot({path: `${dir}/b-ind.png`}); out.screens.b = {img: 'b-ind.png', ...bb};
  const code = (/\/t\/c\/(\d{6})/.exec(bb.chipHref || '') || [])[1];
  out.screens.code = code ?? null;
  await go('#/w/' + code, '#view a.why-go');
  const c = await page.evaluate(() => {
    const r = e => { if (!e) return null; const q = e.getBoundingClientRect(); return [Math.round(q.left), Math.round(q.top), Math.round(q.width), Math.round(q.height)]; };
    const z = document.querySelector('#view .wz');
    return {player: r(document.querySelector('#view .player')), name: document.querySelector('#view h1.wt')?.textContent.trim() ?? null, why: r(document.querySelector('#view a.why-go')), price: r(document.querySelector('#view p.wnow')),
      zone: z?.getAttribute('data-z') ?? null, zoneText: z?.querySelector('.wz-t')?.textContent ?? null, tip: document.querySelector('#view .player .tip')?.textContent ?? null};
  });
  await page.screenshot({path: `${dir}/c-co.png`}); out.screens.c = {img: 'c-co.png', ...c};
  await go('#/why/' + code, '#view .wy-opts');
  const d = await page.evaluate(() => {
    const r = e => { if (!e) return null; const q = e.getBoundingClientRect(); return [Math.round(q.left), Math.round(q.top), Math.round(q.width), Math.round(q.height)]; };
    return {head: r(document.querySelector('#view .wy-head')), q: r(document.querySelector('#view h3.wy-q')), opts: r(document.querySelector('#view .wy-opts')), qText: document.querySelector('#view h3.wy-q')?.textContent ?? null, opt: [...document.querySelectorAll('#view .wy-opt')].map(x => x.textContent.trim())};
  });
  await page.screenshot({path: `${dir}/d-why.png`}); out.screens.d = {img: 'd-why.png', ...d};
} catch (e) { out.errors.push(String(e.message || e).slice(0, 200)); }
out.pageErrors = errs.slice(0, 6);
await b.close();
await fs.writeFile(`${dir}/steps.json`, JSON.stringify(out, null, 1) + '\n');
console.log(JSON.stringify({a: out.screens.a?.oneName, b: out.screens.b?.name, co: out.screens.c?.name, zone: out.screens.c?.zone, errors: out.errors, pageErrors: out.pageErrors}));
