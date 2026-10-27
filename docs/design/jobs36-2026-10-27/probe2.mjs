import {createRequire} from 'node:module';
import fs from 'node:fs';
import {ROUTES} from './routes.mjs';
const require = createRequire('/opt/node-tools/');
const {chromium} = require('playwright');
const B = 'http://127.0.0.1:8828', LIB = fs.readFileSync(new URL('./lib.js', import.meta.url), 'utf8');
const b = await chromium.launch();
const ctx = await b.newContext({viewport: {width: 390, height: 844}, deviceScaleFactor: 1, locale: 'ko-KR'});
await ctx.addInitScript(() => { try { localStorage.setItem('atlas:essence-seen', 'true'); localStorage.setItem('atlas:white-seen', 'true'); localStorage.setItem('atlas:gift:seen', '2026-10-27'); } catch {} });
await ctx.addInitScript(LIB);
const out = [];
await Promise.all([0, 1, 2, 3].map(async w => {
  for (let i = w; i < ROUTES.length; i += 4) {
    const [hs, name] = ROUTES[i]; const p = await ctx.newPage();
    await p.goto(B + '/next/?dev=1' + hs, {waitUntil: 'domcontentloaded'});
    await p.waitForFunction(() => { const v = document.querySelector('#view'); return v && !v.querySelector('.boot') && v.children.length > 0; }, null, {timeout: 20000}).catch(() => {});
    await p.waitForTimeout(1500);
    const r = await p.evaluate(() => { const J = window.__J36, {r, path} = J.root(), bl = J.vis(r), s = J.sub(bl); return {path, rootTop: Math.round(r.getBoundingClientRect().top + scrollY), blocks: bl.map(c => J.info(c)), sub: s ? {at: bl.indexOf(s), kids: J.vis(s).map(c => J.info(c))} : null}; });
    out[i] = {no: i + 1, hs, name, ...r}; await p.close();
  }
}));
fs.writeFileSync('blocks2.json', JSON.stringify(out, null, 1));
for (const o of out) console.log(o.no, o.name, '칸', o.blocks.length, o.sub ? `안칸 ${o.sub.kids.length}@${o.sub.at}` : '', '|', o.path.join(' > '));
await b.close();
