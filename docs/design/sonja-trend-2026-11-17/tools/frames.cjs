const {chromium} = require('playwright');
(async () => {
  const out = process.argv[2];
  const b = await chromium.launch();
  const ctx = await b.newContext({viewport: {width: 390, height: 844}, deviceScaleFactor: 2, isMobile: true, hasTouch: true, locale: 'ko-KR', reducedMotion: 'no-preference'});
  const p = await ctx.newPage(); const bad = [];
  for (let i = 1; i <= 36; i++) {
    const g = 'g' + String(i).padStart(2, '0');
    await p.goto('http://127.0.0.1:8828/su/?v=f' + Date.now() + '#/k/' + g, {waitUntil: 'networkidle'}); await p.waitForTimeout(400);
    const ok = await p.evaluate(() => { const f = document.querySelector('#su figure.sj-kfig'); const s = f && f.querySelector('svg.ik-kk'); if (!s) return false; f.scrollIntoView({block: 'start'}); s.classList.remove('ik-play'); void s.getBoundingClientRect(); s.classList.add('ik-play'); return true; });
    if (!ok) { bad.push(g); continue; }
    await p.waitForTimeout(120);
    const el = await p.$('#su figure.sj-kfig svg.ik-kk');
    for (const [n, t] of [[1, 3000], [2, 9000], [3, 14000], [4, 20000]]) {
      await p.evaluate(t => { for (const a of document.getAnimations()) { a.pause(); a.currentTime = t; } }, t);
      await p.waitForTimeout(90);
      await el.screenshot({path: out + '/film/' + g + '-' + n + '.png'});
    }
  }
  console.log('missing', bad.join(',') || 0); await b.close();
})();
