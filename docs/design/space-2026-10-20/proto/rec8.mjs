// 7판 영상 — 회사 쪽 그래프: 열흘 길 → 지나온 길(빛길 · 손가락으로 따라가기) → 이웃 별(빛줄기) → 커 왔을까(빛기둥) → 흔들림(달이 지나는 하늘길)
import {createRequire} from 'node:module';
const {chromium} = createRequire('/tmp/pw/')('playwright');
const [file, dir, code = '373220'] = process.argv.slice(2);
const b = await chromium.launch({executablePath: '/opt/pw-browsers/chromium'});
const ctx = await b.newContext({viewport: {width: 390, height: 780}, deviceScaleFactor: 1, hasTouch: true, recordVideo: {dir, size: {width: 390, height: 780}}});
const p = await ctx.newPage();
await p.route(/fonts\.(googleapis|gstatic)\.com/, r => r.abort());
await p.goto('file://' + file); await p.waitForTimeout(1800);
const nav = async r => { await p.evaluate(x => { const a = document.createElement('a'); a.href = '#'; a.dataset.go = x; document.body.append(a); a.click(); a.remove(); }, r); };
const smooth = sel => p.evaluate(s => { const e = document.querySelector(s); if (e) e.scrollIntoView({block: 'center', behavior: 'smooth'}); }, sel);
await nav(`c:${code}`); await p.waitForTimeout(900); await smooth('.facts'); await p.waitForTimeout(2600);
await nav(`c:${code}:past`); await p.waitForTimeout(700); await smooth('.chart'); await p.waitForTimeout(2600);
const bb = await p.locator('.chart svg').boundingBox(); await p.mouse.move(bb.x + bb.width * 0.08, bb.y + bb.height * 0.5); await p.mouse.down();
for (let k = 1; k <= 30; k++) { await p.mouse.move(bb.x + bb.width * (0.08 + 0.86 * k / 30), bb.y + bb.height * 0.5); await p.waitForTimeout(70); }
await p.mouse.up(); await p.waitForTimeout(1200);
await nav(`c:${code}:near`); await p.waitForTimeout(700); await smooth('.hbars'); await p.waitForTimeout(3000);
await nav(`c:${code}:grow`); await p.waitForTimeout(700); await smooth('.g3'); await p.waitForTimeout(2200); await p.evaluate(() => window.scrollBy({top: 520, behavior: 'smooth'})); await p.waitForTimeout(2200);
await nav(`c:${code}:range`); await p.waitForTimeout(700); await smooth('.band'); await p.waitForTimeout(3200);
await ctx.close(); await b.close();
