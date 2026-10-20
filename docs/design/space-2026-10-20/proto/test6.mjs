import {createRequire} from 'node:module';
import fs from 'node:fs';
const {chromium} = createRequire('/tmp/pw/')('playwright');
const [file, out, width = '390'] = process.argv.slice(2);
const b = await chromium.launch({executablePath: '/opt/pw-browsers/chromium'});
const p = await (await b.newContext({viewport: {width: Number(width), height: 844}, deviceScaleFactor: 2, hasTouch: true})).newPage();
const errs = []; p.on('pageerror', e => errs.push('PE ' + e.message)); p.on('console', m => { if (m.type() === 'error' && !/ERR_FAILED/.test(m.text())) errs.push('C ' + m.text()); });
await p.route(/fonts\.(googleapis|gstatic)\.com/, r => r.abort());
await p.goto('file://' + file); await p.waitForTimeout(700);
const nav = async route => { await p.evaluate(r => { const a = document.createElement('a'); a.href = '#'; a.dataset.go = r; document.body.append(a); a.click(); a.remove(); }, route); await p.waitForTimeout(700); };
const texts = [];
const audit = async name => { const a = await p.evaluate(() => { const v = document.getElementById('view'); const small = []; const w = document.createTreeWalker(v, NodeFilter.SHOW_TEXT); const seen = new Set(); while (w.nextNode()) { const el = w.currentNode.parentElement; if (!w.currentNode.textContent.trim() || seen.has(el)) continue; seen.add(el); const r = el.getBoundingClientRect(); if (!r.width || el.closest('[hidden]')) continue; if (parseFloat(getComputedStyle(el).fontSize) < 17) small.push(el.textContent.trim().slice(0, 20)); } const tiny = []; for (const el of document.querySelectorAll('#view a, #view button, #view [role=link]')) { const r = el.getBoundingClientRect(); if (!r.width) continue; if (r.height < 43.5 || r.width < 43.5) tiny.push((el.getAttribute('aria-label') || el.textContent.trim()).slice(0, 20) + ' ' + Math.round(r.width) + 'x' + Math.round(r.height)); } return {over: document.documentElement.scrollWidth - innerWidth, small, tiny, text: v.innerText}; }); texts.push([name, a.text]); const bad = /\bnull\b|\bundefined\b|NaN|\[object/.exec(a.text); console.log(name, 'over', a.over, 'small', a.small.length, a.small.slice(0, 2).join('|'), 'tiny', a.tiny.length, a.tiny.slice(0, 3).join('|'), bad ? 'BAD:' + bad[0] : ''); };
// 업종 쪽 네 별 켜 보기
await nav('i:2차전지'); await audit('ind-before');
const kb = p.locator('.kbtn'); console.log('kbtn', await kb.count());
for (let k = 0; k < await kb.count(); k++) { await kb.nth(k).click(); await p.waitForTimeout(250); }
await p.waitForTimeout(500); await audit('ind-after'); await p.locator('.kgame').scrollIntoViewIfNeeded(); await p.screenshot({path: `${out}/q1-kite.png`});
await nav('i:반도체'); await p.waitForTimeout(400); await p.click('text=한꺼번에'); await p.waitForTimeout(2400); await audit('ind-wilt'); await p.locator('.kgame').scrollIntoViewIfNeeded(); await p.screenshot({path: `${out}/q2-kite-wilt.png`});
// 하늘 퀴즈 다섯
await nav('quiz'); await audit('quiz-1'); await p.screenshot({path: `${out}/q3-quiz1.png`});
for (let k = 0; k < 6; k++) { const opt = p.locator('.qopts button:not([disabled])'); if (!(await opt.count())) break; await opt.nth(k % 2).click(); await p.waitForTimeout(500); await audit('quiz-pick-' + (k + 1)); if (k === 0) await p.screenshot({path: `${out}/q4-quiz1-ans.png`}); const nx = p.locator('a.next'); if (await nx.count()) { await nx.first().click(); await p.waitForTimeout(700); } }
await audit('quiz-end'); await p.screenshot({path: `${out}/q5-quiz-end.png`});
// 내 별자리 이름(둘 담은 뒤)
await nav('i:2차전지'); await p.click('.mine-btn'); await nav('i:반도체'); await p.click('.mine-btn'); await nav('home'); await p.waitForTimeout(600);
const mn = p.locator('#mine-name'); console.log('mine-name', await mn.count());
if (await mn.count()) { await mn.fill('겨울 바다'); await mn.press('Enter'); await mn.evaluate(e => e.dispatchEvent(new Event('change'))); await p.waitForTimeout(700); }
await p.locator('.skyin').scrollIntoViewIfNeeded(); await p.waitForTimeout(500); await audit('home-mine'); await p.screenshot({path: `${out}/q6-mine-name.png`});
console.log('title pin', await p.evaluate(() => [...document.querySelectorAll('.ov.mine.big')].map(e => e.textContent + (e.hidden ? '(숨김)' : '')).join(',')));
fs.writeFileSync(`${out}/text6-${width}.json`, JSON.stringify(texts));
console.log('errors', errs.length, errs.slice(0, 4));
await b.close();
