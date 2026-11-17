const {chromium} = require('playwright');
(async () => {
  const out = process.argv[2];
  const b = await chromium.launch();
  const ctx = await b.newContext({viewport: {width: 390, height: 844}, deviceScaleFactor: 2, isMobile: true, hasTouch: true, locale: 'ko-KR', reducedMotion: 'reduce'});
  const p = await ctx.newPage();
  const bad = [];
  for (let i = 1; i <= 36; i++) {
    const g = 'g' + String(i).padStart(2, '0');
    await p.goto('http://127.0.0.1:8828/su/?v=p' + Date.now() + '#/k/' + g, {waitUntil: 'networkidle'}); await p.waitForTimeout(500);
    const el = await p.$('#su figure.sj-kfig svg.ik-kk');
    if (!el) { bad.push(g); continue; }
    await el.screenshot({path: out + '/k/' + g + '.png'});
  }
  console.log('missing', bad.join(',') || 0);
  await b.close();
})();
