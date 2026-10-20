import {createRequire} from 'node:module';
const {chromium} = createRequire('/tmp/pw/')('playwright');
const [file, dir] = process.argv.slice(2);
const b = await chromium.launch({executablePath: '/opt/pw-browsers/chromium'});
const ctx = await b.newContext({viewport: {width: 390, height: 780}, deviceScaleFactor: 1, hasTouch: true, recordVideo: {dir, size: {width: 390, height: 780}}});
const p = await ctx.newPage();
await p.route(/fonts\.(googleapis|gstatic)\.com/, r => r.abort());
await p.goto('file://' + file);
await p.waitForTimeout(9800);
// 별 하나 누르기(이름표)
const pt = await p.evaluate(() => { const st = [...document.querySelectorAll('.skyin circle.st.B')][1]; const r = st.getBoundingClientRect(); return {x: r.x + r.width / 2, y: r.y + r.height / 2}; });
await p.mouse.click(pt.x, pt.y); await p.waitForTimeout(1600);
await p.evaluate(() => window.scrollTo({top: 0, behavior: 'smooth'})); await p.waitForTimeout(600);
// 진짜 차오름으로 날아 들어가기
await p.evaluate(() => document.querySelector('.realcard').scrollIntoView({block: 'center', behavior: 'smooth'})); await p.waitForTimeout(900);
const box = await p.locator('.realcard').boundingBox(); await p.mouse.click(box.x + box.width / 2, box.y + box.height / 2);
await p.waitForTimeout(3200);
// 3번째 별(회사)로
const nx = await p.locator('a.next').first(); await nx.scrollIntoViewIfNeeded(); await p.waitForTimeout(500); await nx.click(); await p.waitForTimeout(2600);
// 지나온 길
await p.evaluate(() => { const a = [...document.querySelectorAll('a.next')][0]; a.scrollIntoView({block: 'center'}); }); await p.waitForTimeout(400); await p.locator('a.next').first().click(); await p.waitForTimeout(2600);
await ctx.close(); await b.close();
