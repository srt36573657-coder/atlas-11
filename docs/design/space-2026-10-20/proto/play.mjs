import {createRequire} from 'node:module';
const {chromium} = createRequire('/tmp/pw/')('playwright');
const [file, out, width = '390'] = process.argv.slice(2);
const b = await chromium.launch({executablePath: '/opt/pw-browsers/chromium'});
const p = await (await b.newContext({viewport: {width: Number(width), height: 844}, deviceScaleFactor: 2, hasTouch: true})).newPage();
const errs = []; p.on('pageerror', e => errs.push(e.message)); p.on('console', m => { if (m.type() === 'error' && !/ERR_FAILED/.test(m.text())) errs.push(m.text()); });
await p.route(/fonts\.(googleapis|gstatic)\.com/, r => r.abort());
await p.goto('file://' + file); await p.waitForTimeout(800);
const nav = async route => { await p.evaluate(r => { const a = document.createElement('a'); a.href = '#'; a.dataset.go = r; document.body.append(a); a.click(); a.remove(); }, route); await p.waitForTimeout(700); };
// 1) 읽어 주기 상자 · 맞혀 볼까
await p.screenshot({path: `${out}/p1-home.png`});
await p.locator('.quiz .choices .btn').nth(2).click(); await p.waitForTimeout(1200);
await p.locator('.quiz').scrollIntoViewIfNeeded(); await p.screenshot({path: `${out}/p2-quiz.png`});
// 2) 별 누르고 내 하늘에 담기(둘)
await p.locator('.skyin').scrollIntoViewIfNeeded(); await p.waitForTimeout(300);
for (const k of [3, 9]) { const pt = await p.evaluate(k => { const st = [...document.querySelectorAll('.skyin circle.st')][k]; const r = st.getBoundingClientRect(); return {x: r.x + r.width / 2, y: r.y + r.height / 2}; }, k); await p.mouse.click(pt.x, pt.y); await p.waitForTimeout(400); const mb = p.locator('.lens .mine-btn'); if (await mb.count()) await mb.click(); await p.waitForTimeout(500); }
await p.locator('.skyin').scrollIntoViewIfNeeded(); await p.waitForTimeout(400); await p.screenshot({path: `${out}/p3-mine.png`});
// 3) 업종 쪽 읽어 주기 상자
await nav('i:2차전지'); await p.waitForTimeout(2500); await p.locator('.speak').first().scrollIntoViewIfNeeded(); await p.screenshot({path: `${out}/p4-ind.png`});
// 4) 왜 사? 들려줘
await nav('why'); await p.click('text=첫 질문 ›'); await p.waitForTimeout(500); await p.locator('.ans button').nth(0).click(); await p.waitForTimeout(400); await p.screenshot({path: `${out}/p5-why.png`});
// 5) 타임캡슐
await nav('back'); await p.fill('#cap-in', '회사가 돈을 잘 벌어서'); await p.click('text=달빛으로 봉인하기'); await p.waitForTimeout(1000); await p.click('text=미리 열어 보기'); await p.waitForTimeout(600); await p.click('text=했어'); await p.waitForTimeout(400);
await p.locator('.capsule').scrollIntoViewIfNeeded(); await p.screenshot({path: `${out}/p6-capsule.png`});
// 6) 첫 화면 내 별자리 줄
await nav('home'); await p.waitForTimeout(800); const txt = await p.evaluate(() => document.querySelector('#view').innerText.includes('내 별자리 · 2곳')); console.log('mine row', txt);
const ov = await p.evaluate(() => document.documentElement.scrollWidth - innerWidth); console.log('overflow', ov);
console.log('errors', errs.length, errs.slice(0, 3));
await b.close();
