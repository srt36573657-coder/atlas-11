// 하늘 판만 크게 찍기 — 움직임 끔(오늘 하늘) · 움직임 켬(몇 초 뒤) 두 장
import {createRequire} from 'node:module';
const {chromium} = createRequire('/tmp/pw/')('playwright');
const [file, out, width = '390', waitMs = '14000'] = process.argv.slice(2);
const b = await chromium.launch({executablePath: '/opt/pw-browsers/chromium'});
const ctx = await b.newContext({viewport: {width: Number(width), height: 844}, deviceScaleFactor: 2});
const p = await ctx.newPage();
await p.route(/fonts\.(googleapis|gstatic)\.com/, r => r.abort());
await p.goto('file://' + file); await p.waitForTimeout(900);
await p.evaluate(() => document.querySelector('.sky').scrollIntoView({block: 'center'}));
await p.click('#mo'); await p.waitForTimeout(700);
await p.locator('.sky').first().screenshot({path: `${out}-still.png`});
await p.click('#mo'); await p.waitForTimeout(Number(waitMs));
await p.locator('.sky').first().screenshot({path: `${out}-moving.png`});
console.log('date', await p.evaluate(() => document.querySelector('.daylab')?.textContent));
await b.close();
