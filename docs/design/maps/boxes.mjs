import {createRequire} from 'node:module';
import fs from 'node:fs';
const require = createRequire('/opt/node-tools/node_modules/');
const {chromium} = require('playwright');
const browser = await chromium.launch({executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome'});
const page = await browser.newPage({viewport: {width: 430, height: 932}, deviceScaleFactor: 2, colorScheme: 'dark'});
const out = {};
for (let n = 1; n <= 11; n++) {
  const id = String(n).padStart(2, '0');
  await page.goto(`http://localhost:8731/maps/${id}.html`, {waitUntil: 'networkidle'});
  await page.waitForFunction(() => window.READY === true, null, {timeout: 30000});
  await page.evaluate(() => document.fonts.ready); await page.waitForTimeout(250);
  out[id] = await page.evaluate(() => { const r = document.getElementById('map').getBoundingClientRect(); const q = document.getElementById('question').textContent.replace(/^이 지도가 답하는 물음:\s*/, '');
    return {title: document.getElementById('title').textContent, sub: document.getElementById('sub').textContent, question: q, x: r.left + scrollX, y: r.top + scrollY, w: r.width, h: r.height}; });
}
await browser.close();
fs.writeFileSync('boxes.json', JSON.stringify(out, null, 1));
console.log(Object.entries(out).map(([k, v]) => `${k} ${v.title} | ${v.sub} | map ${Math.round(v.y)}+${Math.round(v.h)}`).join('\n'));
