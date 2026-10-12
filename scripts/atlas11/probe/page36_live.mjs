// 탐침 — 올라간 사이트 「36곳」 화면을 휴대폰 크기로 열어 글 · 그림을 그대로 남김(사장님 2026-10-13 04:28 「36 거기 너 계산 하지 않네 18」)
import fs from 'node:fs/promises';
import {createRequire} from 'node:module';
const require = createRequire(process.env.PW_DIR.replace(/\/?$/, '/'));
const {chromium} = require('playwright');
const dir = 'reports/atlas11/probe/page36-live'; await fs.mkdir(dir, {recursive: true});
const b = await chromium.launch(); const ctx = await b.newContext({viewport: {width: 390, height: 844}, deviceScaleFactor: 2, isMobile: true, hasTouch: true, locale: 'ko-KR', timezoneId: 'Asia/Seoul'});
const pg = await ctx.newPage(); const out = {made: new Date().toISOString(), pages: {}};
for (const [k, hash] of [['p36', '#/36'], ['home', '#/'], ['list', '#/list']]) {
  try {
    await pg.goto('https://aaa7377.com/?v=' + Date.now() + hash, {waitUntil: 'networkidle', timeout: 60000}); await pg.waitForTimeout(1800);
    out.pages[k] = (await pg.locator('#view').innerText()).slice(0, 6000);
    await pg.screenshot({path: `${dir}/${k}-top.png`}); await pg.screenshot({path: `${dir}/${k}-full.png`, fullPage: true});
  } catch (e) { out.pages[k] = 'ERR ' + String(e.message).slice(0, 120); }
}
await b.close(); await fs.writeFile(`${dir}/summary.json`, JSON.stringify(out, null, 1)); console.log('ok');
