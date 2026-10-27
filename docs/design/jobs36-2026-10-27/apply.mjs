// 잡스 판 그리기 — pick.json 차례대로 쪽 칸을 옮기고(접을 칸은 「더 보기」 안으로) 첫 화면 사진 — node apply.mjs
import {createRequire} from 'node:module';
import fs from 'node:fs';
const require = createRequire('/opt/node-tools/');
const {chromium} = require('playwright');
const B = 'http://127.0.0.1:8828', LIB = fs.readFileSync(new URL('./lib.js', import.meta.url), 'utf8');
const P = JSON.parse(fs.readFileSync('pick.json', 'utf8')), BL = JSON.parse(fs.readFileSync('blocks2.json', 'utf8'));
const b = await chromium.launch();
const ctx = await b.newContext({viewport: {width: 390, height: 844}, deviceScaleFactor: 1.5, locale: 'ko-KR'});
await ctx.addInitScript(() => { try { localStorage.setItem('atlas:essence-seen', 'true'); localStorage.setItem('atlas:white-seen', 'true'); localStorage.setItem('atlas:gift:seen', '2026-10-27'); } catch {} });
await ctx.addInitScript(LIB);
const log = [];
await Promise.all([0, 1, 2, 3].map(async w => {
  for (let i = w; i < P.length; i += 4) {
    const pk = P[i], p = await ctx.newPage(), nn = String(pk.no).padStart(2, '0');
    await p.goto(B + '/next/?dev=1' + pk.hs, {waitUntil: 'domcontentloaded'});
    await p.waitForFunction(() => { const v = document.querySelector('#view'); return v && !v.querySelector('.boot') && v.children.length > 0; }, null, {timeout: 20000}).catch(() => {});
    await p.waitForTimeout(1500);
    const r = await p.evaluate(({pk, want}) => {
      const J = window.__J36, {r} = J.root(), bl = J.vis(r);
      if (bl.length !== want) return {ok: false, why: '칸 수 다름 ' + bl.length + ' ≠ ' + want};
      document.querySelectorAll('.kk-box, .kk-pgrow').forEach(e => e.setAttribute('data-j36', '1'));
      const sub = J.sub(bl);
      if (pk.same) return {ok: true, moved: 0};
      for (const k of pk.seq) r.appendChild(bl[k]);
      if (pk.foldI.length) {
        const d = document.createElement('details'); d.className = 'j36-more';
        d.style.cssText = 'margin:14px 0;border-top:1px dashed currentColor;padding-top:10px;opacity:.9';
        const s = document.createElement('summary'); s.textContent = '더 보기 ▾'; s.style.cssText = 'font-size:17px;font-weight:700;cursor:pointer;padding:6px 0';
        d.appendChild(s); for (const k of pk.foldI) d.appendChild(bl[k]); r.appendChild(d);
      }
      for (const k of pk.tail) r.appendChild(bl[k]);
      if (sub && pk.sub.length) { const kids = J.vis(sub); if (kids.length === pk.sub.length) for (const k of pk.sub) sub.appendChild(kids[k]); }
      scrollTo(0, 0); return {ok: true, moved: pk.seq.length + pk.foldI.length};
    }, {pk, want: BL[i].blocks.length});
    await p.waitForTimeout(2200);
    await p.evaluate(() => { document.querySelectorAll('.kk-box:not([data-j36]), .kk-pgrow:not([data-j36])').forEach(e => e.remove()); scrollTo(0, 0); });
    await p.waitForTimeout(200);
    await p.screenshot({path: `shots/job-${nn}.jpg`, type: 'jpeg', quality: 62});
    log[i] = {no: pk.no, name: pk.name, ...r}; await p.close();
  }
}));
fs.writeFileSync('apply.json', JSON.stringify(log, null, 1));
for (const l of log) console.log(l.no, l.name, l.ok ? '됨' : '안 됨 ' + l.why, l.moved ?? '');
await b.close();
