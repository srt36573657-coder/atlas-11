// 내 별자리 이름이 하늘 밖으로 나가거나 다른 이름과 겹치는지 — 1년 하늘이 도는 동안 여러 번 잼
import {createRequire} from 'node:module';
const {chromium} = createRequire('/tmp/pw/')('playwright');
const [file, width = '390', names = '2차전지,반도체'] = process.argv.slice(2);
const b = await chromium.launch({executablePath: '/opt/pw-browsers/chromium'});
const p = await (await b.newContext({viewport: {width: Number(width), height: 844}, deviceScaleFactor: 1, hasTouch: true})).newPage();
const errs = []; p.on('pageerror', e => errs.push(e.message));
await p.route(/fonts\.(googleapis|gstatic)\.com/, r => r.abort());
await p.goto('file://' + file); await p.waitForTimeout(700);
if (process.argv[5] === "off") { await p.click("#mo"); await p.waitForTimeout(400); console.log("motion", await p.evaluate(() => document.documentElement.className)); }
const nav = async route => { await p.evaluate(r => { const a = document.createElement('a'); a.href = '#'; a.dataset.go = r; document.body.append(a); a.click(); a.remove(); }, route); await p.waitForTimeout(600); };
for (const n of names.split(',')) { await nav('i:' + n); await p.click('.mine-btn'); }
await nav('home');
const mn = p.locator('#mine-name'); if (await mn.count()) { await mn.fill('겨울 바다'); await mn.press('Enter'); await mn.evaluate(e => e.dispatchEvent(new Event('change'))); }
await p.locator('.skyin').scrollIntoViewIfNeeded();
let bad = 0, n = 0, out = 0, worst = [];
for (let k = 0; k < 40; k++) {
  await p.waitForTimeout(450);
  const r = await p.evaluate(() => {
    const box = document.querySelector('.skyin').getBoundingClientRect();
    const t = document.querySelector('.ov.mine.big'); if (!t || t.hidden || !t.textContent) return null;
    const a = t.getBoundingClientRect();
    const others = [...document.querySelectorAll('.skyin .ov')].filter(e => e !== t && !e.hidden && e.textContent && getComputedStyle(e).visibility !== 'hidden' && !e.classList.contains('month') && !e.classList.contains('zl'));
    const L = [t, ...others], hits = [];
    for (let i = 0; i < L.length; i++) for (let j = i + 1; j < L.length; j++) { const a2 = L[i].getBoundingClientRect(), q = L[j].getBoundingClientRect(); if (a2.left < q.right - 1 && q.left < a2.right - 1 && a2.top < q.bottom - 1 && q.top < a2.bottom - 1) hits.push(L[i].textContent + '×' + L[j].textContent); }
    for (const e of others) { const q = e.getBoundingClientRect(); if (q.left < box.left - 1 || q.right > box.right + 1 || q.top < box.top - 1 || q.bottom > box.bottom + 1) hits.push(e.textContent + ' 밖'); }
    const outside = a.left < box.left - 1 || a.right > box.right + 1 || a.top < box.top - 1 || a.bottom > box.bottom + 1;
    const wax = [...document.querySelectorAll('.skyin .ov.wax.big')].filter(e => getComputedStyle(e).visibility !== 'hidden').map(e => { const q = e.getBoundingClientRect(); return q.left < box.left - 1 || q.right > box.right + 1; }).filter(Boolean).length;
    return {hits, outside, wax, date: document.querySelector('.daylab')?.textContent};
  });
  if (!r) continue; n++;
  if (r.hits.length) { bad++; if (worst.length < 4) worst.push(r.date + ':' + r.hits.join('/')); }
  if (r.outside || r.wax) { out++; if (worst.length < 6) worst.push(r.date + ': 밖' + (r.wax ? '(금빛)' : '')); }
}
console.log(`width ${width} samples ${n} overlap ${bad} outside ${out}`, worst, 'errors', errs.length);
await b.close();
