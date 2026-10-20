import {createRequire} from 'node:module';
const {chromium} = createRequire('/tmp/pw/')('playwright');
const [file, dir] = process.argv.slice(2);
const b = await chromium.launch({executablePath: '/opt/pw-browsers/chromium'});
const ctx = await b.newContext({viewport: {width: 390, height: 780}, deviceScaleFactor: 1, hasTouch: true, recordVideo: {dir, size: {width: 390, height: 780}}});
const p = await ctx.newPage();
await p.route(/fonts\.(googleapis|gstatic)\.com/, r => r.abort());
await p.goto('file://' + file);
await p.waitForTimeout(6500);
const smooth = sel => p.evaluate(s => document.querySelector(s).scrollIntoView({block: 'center', behavior: 'smooth'}), sel);
// 별 둘을 눌러 내 하늘에 담기
await smooth('.skyin'); await p.waitForTimeout(900);
const tapStar = async (zone, k) => { const pt = await p.evaluate(([z, k]) => { const st = [...document.querySelectorAll('.skyin circle.st.' + z)][k]; const r = st.getBoundingClientRect(); return {x: r.x + r.width / 2, y: r.y + r.height / 2}; }, [zone, k]); await p.mouse.click(pt.x, pt.y); await p.waitForTimeout(700); };
await tapStar('B', 1); const mb = p.locator('.lens .mine-btn'); if (await mb.count()) { await mb.scrollIntoViewIfNeeded(); await p.waitForTimeout(300); await mb.click(); } await p.waitForTimeout(900);
await smooth('.skyin'); await p.waitForTimeout(700);
await tapStar('Q', 6); if (await mb.count()) { await mb.scrollIntoViewIfNeeded(); await p.waitForTimeout(300); await mb.click(); } await p.waitForTimeout(900);
await smooth('.skyin'); await p.waitForTimeout(3800);
// 맞혀 볼까
await smooth('.quiz'); await p.waitForTimeout(1200); await p.locator('.quiz .choices .btn').nth(2).click(); await p.waitForTimeout(2600);
// 타임캡슐
await p.evaluate(() => { const a = document.createElement('a'); a.href = '#'; a.dataset.go = 'back'; a.dataset.root = '1'; document.body.append(a); a.click(); a.remove(); }); await p.waitForTimeout(1500);
await smooth('#cap-in'); await p.waitForTimeout(600); await p.locator('#cap-in').pressSequentially('회사가 돈을 잘 벌어서', {delay: 70}); await p.waitForTimeout(400);
await p.click('text=달빛으로 봉인하기'); await p.waitForTimeout(1800); await p.click('text=미리 열어 보기'); await p.waitForTimeout(600); await smooth('.capsule .quote'); await p.waitForTimeout(1600); await p.click('text=했어'); await p.waitForTimeout(1800);
await ctx.close(); await b.close();
