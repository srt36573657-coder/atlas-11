// 움직임을 끈 채 쪽마다 첫 화면 · 이어지는 화면을 찍음(바닥 띠 겹침 없이)
import {createRequire} from 'node:module';
const {chromium} = createRequire('/tmp/pw/')('playwright');
const [file, out, width = '390'] = process.argv.slice(2);
const b = await chromium.launch({executablePath: '/opt/pw-browsers/chromium'});
const p = await (await b.newContext({viewport: {width: Number(width), height: 844}, deviceScaleFactor: 2})).newPage();
await p.route(/fonts\.(googleapis|gstatic)\.com/, r => r.abort());
await p.goto('file://' + file); await p.waitForTimeout(900);
await p.click('#mo'); await p.waitForTimeout(600);
const nav = async route => { await p.evaluate(r => { const a = document.createElement('a'); a.href = '#'; a.dataset.go = r; document.body.append(a); a.click(); a.remove(); }, route); await p.waitForTimeout(700); };
const shots = [];
for (const [name, route, scrolls] of [['home', 'home', [0, 700, 1400, 2100]], ['ind', 'i:2차전지', [0, 700]], ['why', 'why', [0]], ['quiz', 'quiz', [0]]]) {
  if (route !== 'home') await nav(route);
  for (const y of scrolls) { await p.evaluate(v => window.scrollTo(0, v), y); await p.waitForTimeout(350); const f = `${out}-${name}-${y}.png`; await p.screenshot({path: f}); shots.push(f); }
}
console.log(shots.join('\n')); await b.close();
