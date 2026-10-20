// 회사 쪽 그래프를 움직임 끈 채 찍음(그래프가 화면 가운데 오게) — 지나온 길 · 이웃 별 · 커 왔을까 · 흔들림 · 첫 회사 쪽
import {createRequire} from 'node:module';
const {chromium} = createRequire('/tmp/pw/')('playwright');
const [file, out, width = '390', code = '373220'] = process.argv.slice(2);
const b = await chromium.launch({executablePath: '/opt/pw-browsers/chromium'});
const p = await (await b.newContext({viewport: {width: Number(width), height: 844}, deviceScaleFactor: 2})).newPage();
const errs = []; p.on('pageerror', e => errs.push(e.message));
await p.route(/fonts\.(googleapis|gstatic)\.com/, r => r.abort());
await p.goto('file://' + file); await p.waitForTimeout(800);
await p.click('#mo'); await p.waitForTimeout(500);
const nav = async route => { await p.evaluate(r => { const a = document.createElement('a'); a.href = '#'; a.dataset.go = r; document.body.append(a); a.click(); a.remove(); }, route); await p.waitForTimeout(700); };
const shots = [];
for (const [name, route, sel] of [['co', `c:${code}`, '.facts'], ['past', `c:${code}:past`, '.chart'], ['near', `c:${code}:near`, '.hbars'], ['grow', `c:${code}:grow`, '.grow3'], ['range', `c:${code}:range`, '.band']]) {
  await nav(route);
  await p.evaluate(sl => { const e = document.querySelector(sl); if (e) e.scrollIntoView({block: 'center'}); }, sel); await p.waitForTimeout(400);
  const f = `${out}-${name}.png`; await p.screenshot({path: f}); shots.push(f);
}
// 지나온 길에서 손가락으로 따라가기 한 번
await nav(`c:${code}:past`); await p.evaluate(() => document.querySelector('.chart').scrollIntoView({block: 'center'})); await p.waitForTimeout(300);
const bb = await p.locator('.chart svg').boundingBox(); await p.mouse.move(bb.x + bb.width * 0.3, bb.y + bb.height * 0.5); await p.mouse.down(); await p.mouse.move(bb.x + bb.width * 0.62, bb.y + bb.height * 0.5, {steps: 6}); await p.mouse.up(); await p.waitForTimeout(300);
const f2 = `${out}-scrub.png`; await p.screenshot({path: f2}); shots.push(f2);
console.log(shots.join('\n')); console.log('errors', errs.length, errs.slice(0, 3)); await b.close();
