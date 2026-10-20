// 6판 영상 — 첫 화면 → 1년 하늘이 천천히 흐르는 모습(오래) → 별똥별 잡기 → 업종 쪽 → 하늘 퀴즈
import {createRequire} from 'node:module';
const {chromium} = createRequire('/tmp/pw/')('playwright');
const [file, dir] = process.argv.slice(2);
const b = await chromium.launch({executablePath: '/opt/pw-browsers/chromium'});
const ctx = await b.newContext({viewport: {width: 390, height: 780}, deviceScaleFactor: 1, hasTouch: true, recordVideo: {dir, size: {width: 390, height: 780}}});
const p = await ctx.newPage();
await p.route(/fonts\.(googleapis|gstatic)\.com/, r => r.abort());
await p.goto('file://' + file);
const smooth = sel => p.evaluate(s => document.querySelector(s).scrollIntoView({block: 'center', behavior: 'smooth'}), sel);
await p.waitForTimeout(3200);
await smooth('.sky'); await p.waitForTimeout(23000);
// 별똥별 잡기(기다렸다가 머리를 누름)
await p.evaluate(() => window.scrollTo({top: 0, behavior: 'smooth'})); await p.waitForTimeout(900);
let caught = false;
for (let k = 0; k < 320 && !caught; k++) { const hd = await p.evaluate(() => window.__t.SKY.head); if (hd && hd[0] > 20 && hd[0] < 370 && hd[1] > 70 && hd[1] < 690) { const free = await p.evaluate(([x, y]) => { const e = document.elementFromPoint(x, y); return !(e && e.closest('a, button, input, label, [role=link], .skyin svg, .chart, .kgame')); }, hd); if (free) { await p.waitForTimeout(300); const h2 = await p.evaluate(() => window.__t.SKY.head); if (h2) { await p.mouse.click(h2[0], h2[1]); caught = true; } } } await p.waitForTimeout(100); }
console.log('caught', caught);
await p.waitForTimeout(4200);
// 업종 쪽(네 별)
await p.evaluate(() => { const a = document.createElement('a'); a.href = '#'; a.dataset.go = 'i:2차전지'; document.body.append(a); a.click(); a.remove(); }); await p.waitForTimeout(3600);
// 하늘 퀴즈
await p.evaluate(() => { const a = document.createElement('a'); a.href = '#'; a.dataset.go = 'quiz'; a.dataset.root = '1'; document.body.append(a); a.click(); a.remove(); }); await p.waitForTimeout(1600);
await p.locator('.qopts button').first().scrollIntoViewIfNeeded(); await p.locator('.qopts button').nth(0).click(); await p.waitForTimeout(3200);
await ctx.close(); await b.close();
