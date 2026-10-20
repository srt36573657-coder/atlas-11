import {createRequire} from 'node:module';
const {chromium} = createRequire('/tmp/pw/')('playwright');
const [file, dir] = process.argv.slice(2);
const b = await chromium.launch({executablePath: '/opt/pw-browsers/chromium'});
const ctx = await b.newContext({viewport: {width: 390, height: 780}, deviceScaleFactor: 1, hasTouch: true, recordVideo: {dir, size: {width: 390, height: 780}}});
const p = await ctx.newPage();
await p.route(/fonts\.(googleapis|gstatic)\.com/, r => r.abort());
await p.goto('file://' + file);
const smooth = sel => p.evaluate(s => document.querySelector(s).scrollIntoView({block: 'center', behavior: 'smooth'}), sel);
await p.waitForTimeout(3000);
await smooth('.skyin'); await p.waitForTimeout(11000);
// 망원경
await p.click('[aria-label="하늘 키우기"]'); await p.waitForTimeout(1600); await p.click('[aria-label="하늘 키우기"]'); await p.waitForTimeout(1800); await p.click('text=원래대로'); await p.waitForTimeout(800);
// 별똥별 잡기(기다렸다가 머리를 누름)
await p.evaluate(() => window.scrollTo({top: 0, behavior: 'smooth'})); await p.waitForTimeout(700);
for (let k = 0; k < 140; k++) { const hd = await p.evaluate(() => window.__t.SKY.head); if (hd && hd[0] > 20 && hd[0] < 370 && hd[1] > 70 && hd[1] < 690) { const free = await p.evaluate(([x, y]) => { const e = document.elementFromPoint(x, y); return !(e && e.closest('a, button, input, label, [role=link], .skyin svg, .chart, .kgame')); }, hd); if (free) { await p.waitForTimeout(250); const h2 = await p.evaluate(() => window.__t.SKY.head); if (h2) { await p.mouse.click(h2[0], h2[1]); break; } } } await p.waitForTimeout(100); }
await p.waitForTimeout(3500);
// 네 별 켜 보기(기우는 중 업종)
await p.evaluate(() => { const a = document.createElement('a'); a.href = '#'; a.dataset.go = 'i:반도체'; document.body.append(a); a.click(); a.remove(); }); await p.waitForTimeout(1200);
await smooth('.kgame'); await p.waitForTimeout(700); await p.click('text=한꺼번에'); await p.waitForTimeout(2800);
// 하늘 퀴즈
await p.evaluate(() => { const a = document.createElement('a'); a.href = '#'; a.dataset.go = 'quiz'; a.dataset.root = '1'; document.body.append(a); a.click(); a.remove(); }); await p.waitForTimeout(1500);
await p.locator('.qopts button').first().scrollIntoViewIfNeeded(); await p.locator('.qopts button').nth(0).click(); await p.waitForTimeout(2600);
await ctx.close(); await b.close();
