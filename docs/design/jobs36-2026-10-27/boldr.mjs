// 대범한 잡스 판 그리기 — bold.json 대로 주인공 크게 · 그림 · 단추 · 나머지 「자세히」 · 첫 화면 사진
import {createRequire} from 'node:module';
import fs from 'node:fs';
const require = createRequire('/opt/node-tools/');
const {chromium} = require('playwright');
const B = 'http://127.0.0.1:8828', LIB = fs.readFileSync(new URL('./lib.js', import.meta.url), 'utf8');
const P = JSON.parse(fs.readFileSync('bold.json', 'utf8'));
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
    await p.waitForTimeout(4200);
    const r = await p.evaluate(pk => {
      const J = window.__J36, {r} = J.root(), bl = J.vis(r);
      if (bl.length !== pk.nBlocks) return {ok: false, why: '칸 수 ' + bl.length + ' ≠ ' + pk.nBlocks};
      document.querySelectorAll('.kk-box, .kk-pgrow').forEach(e => e.setAttribute('data-j36', '1'));
      const at = i => (i == null ? null : bl[i]), used = new Set();
      const take = i => { const e = at(i); if (e) used.add(i); return e; };
      const sayI = pk.pre.find(i => /th-say|w-say|ws|jh-ess/.test(String(bl[i].getAttribute('class') ?? '')) && !/jh-ess/.test(String(bl[i].getAttribute('class') ?? '')));
      const pre = pk.pre.filter(i => !(pk.hide === 2 && i === sayI)).map(take);
      const hero = take(pk.hero), stick = pk.stick != null && pk.stick !== pk.hero ? take(pk.stick) : null, vis = take(pk.visual), act = take(pk.action), sec = pk.sec.filter(i => i !== pk.stick).map(take).filter(Boolean), bottom = pk.bottom.map(take).filter(Boolean);
      if (hero && pk.hs !== '#/') { // 첫 화면은 네 단추 한 화면(00:17) — 시계는 그대로 두고 아래만 접음
        const isPic = pk.heroKind === 'picture';
        if (!isPic && pk.zoom !== 1) hero.style.zoom = String(pk.zoom);
        if (pk.card === 1) Object.assign(hero.style, {border: '3px solid #F2B84B', borderRadius: '22px', padding: '14px 16px', background: 'rgba(242,184,75,.10)', boxSizing: 'border-box'});
        if (pk.card === 2) Object.assign(hero.style, {borderLeft: '10px solid #F2B84B', paddingLeft: '14px'});
      }
      if (act && pk.hs !== '#/') { act.style.zoom = '1.15'; act.style.boxShadow = '0 0 0 3px #F2B84B'; act.style.borderRadius = act.style.borderRadius || '16px'; }
      const rest = bl.filter((e, i) => !used.has(i));
      const det = document.createElement('details'); det.className = 'th-fold jb-more';
      const sm = document.createElement('summary'); sm.textContent = '자세히 보기 '; det.append(sm, ...rest);
      r.replaceChildren(...pre, ...(hero ? [hero] : []), ...(stick ? [stick] : []), ...(vis ? [vis] : []), ...(act ? [act] : []), ...sec, ...(rest.length ? [det] : []), ...bottom);
      if (pk.hide >= 1) document.querySelectorAll('.th-no').forEach(e => { e.style.display = 'none'; });
      scrollTo(0, 0); return {ok: true, folded: rest.length};
    }, pk);
    await p.waitForTimeout(2000);
    await p.evaluate(() => { document.querySelectorAll('.kk-box:not([data-j36]), .kk-pgrow:not([data-j36])').forEach(e => e.remove()); scrollTo(0, 0); });
    await p.waitForTimeout(250);
    await p.screenshot({path: `shots/bold-${nn}.jpg`, type: 'jpeg', quality: 62});
    log[i] = {no: pk.no, name: pk.name, ...r}; await p.close();
  }
}));
fs.writeFileSync('boldr.json', JSON.stringify(log, null, 1));
for (const l of log) console.log(l.no, l.name, l.ok ? '됨 접음 ' + l.folded : '안 됨 ' + l.why);
await b.close();
