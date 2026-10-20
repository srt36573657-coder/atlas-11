// 8판 영상 — 첫 화면의 초롱초롱한 별 → 하늘 판 → 지나온 길 · 이웃 별의 반짝이는 별
import {createRequire} from 'node:module';
const {chromium} = createRequire('/tmp/pw/')('playwright');
const [file, dir, code = '373220'] = process.argv.slice(2);
const b = await chromium.launch({executablePath: '/opt/pw-browsers/chromium'});
const ctx = await b.newContext({viewport: {width: 390, height: 780}, deviceScaleFactor: 1, hasTouch: true, recordVideo: {dir, size: {width: 390, height: 780}}});
const p = await ctx.newPage();
await p.route(/fonts\.(googleapis|gstatic)\.com/, r => r.abort());
await p.goto('file://' + file); await p.waitForTimeout(6000);
await p.evaluate(() => document.querySelector('.sky').scrollIntoView({block: 'center', behavior: 'smooth'})); await p.waitForTimeout(9000);
const nav = async r => { await p.evaluate(x => { const a = document.createElement('a'); a.href = '#'; a.dataset.go = x; document.body.append(a); a.click(); a.remove(); }, r); };
await nav(`c:${code}:past`); await p.waitForTimeout(700); await p.evaluate(() => document.querySelector('.chart').scrollIntoView({block: 'center', behavior: 'smooth'})); await p.waitForTimeout(4500);
await nav(`c:${code}:near`); await p.waitForTimeout(700); await p.evaluate(() => document.querySelector('.hbars').scrollIntoView({block: 'center', behavior: 'smooth'})); await p.waitForTimeout(4500);
await nav(`c:${code}:grow`); await p.waitForTimeout(700); await p.evaluate(() => document.querySelector('.g3').scrollIntoView({block: 'center', behavior: 'smooth'})); await p.waitForTimeout(4000);
await ctx.close(); await b.close();
