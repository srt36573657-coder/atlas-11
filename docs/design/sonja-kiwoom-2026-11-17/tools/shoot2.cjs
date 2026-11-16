const {chromium} = require('playwright');
(async () => {
  const [out, tag, menu] = [process.argv[2], process.argv[3], process.argv[4] === '1'];
  const b = await chromium.launch();
  const mk = async red => { const ctx = await b.newContext({viewport: {width: 390, height: 844}, deviceScaleFactor: 2, isMobile: true, hasTouch: true, locale: 'ko-KR', reducedMotion: red ? 'reduce' : 'no-preference'}); return ctx.newPage(); };
  const errs = [];
  const p = await mk(true); p.on('pageerror', e => errs.push(String(e.message)));
  const go = async (pg, hh) => { await pg.goto('http://127.0.0.1:8828/su/?v=' + tag + Date.now() + hh, {waitUntil: 'networkidle'}); await pg.waitForTimeout(1300); };
  await go(p, '#/'); await p.screenshot({path: out + '/' + tag + '-a.png'});
  await p.evaluate(() => { const e = document.querySelectorAll('#su .sj-sec')[1]; if (e) e.scrollIntoView({block: 'start'}); scrollBy(0, -12); }); await p.waitForTimeout(500);
  await p.screenshot({path: out + '/' + tag + '-b.png'});
  await go(p, '#/k/g07'); await p.screenshot({path: out + '/' + tag + '-c.png'});
  if (menu) { await go(p, '#/'); await p.click('#su .sj-menu > summary'); await p.waitForTimeout(300); await p.screenshot({path: out + '/' + tag + '-d.png'}); }
  const q = await mk(false); q.on('pageerror', e => errs.push(String(e.message)));
  await go(q, '#/k/g07');
  await q.evaluate(() => { const f = document.querySelector('#su figure.sj-kfig'); const s = f.querySelector('svg.ik-kk'); f.scrollIntoView({block: 'start'}); scrollBy(0, -10); s.classList.remove('ik-play'); void s.getBoundingClientRect(); s.classList.add('ik-play'); });
  await q.waitForTimeout(150);
  await q.evaluate(() => { for (const a of document.getAnimations()) { a.pause(); a.currentTime = 14000; } });
  await q.waitForTimeout(200);
  await q.screenshot({path: out + '/' + tag + '-e.png'});
  console.log(tag, JSON.stringify(errs.slice(0, 2)));
  await b.close();
})();
