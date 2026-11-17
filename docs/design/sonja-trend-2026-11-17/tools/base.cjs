const {chromium} = require('playwright');
const fs = require('fs');
(async () => {
  const out = process.argv[2];
  const b = await chromium.launch();
  const ctx = await b.newContext({viewport: {width: 390, height: 844}, deviceScaleFactor: 2, isMobile: true, hasTouch: true, locale: 'ko-KR', reducedMotion: 'reduce'});
  const p = await ctx.newPage();
  const errs = []; p.on('pageerror', e => errs.push(String(e.message)));
  const go = async hh => { await p.goto('http://127.0.0.1:8828/su/?v=b' + Date.now() + hh, {waitUntil: 'networkidle'}); await p.waitForTimeout(1200); };
  await go('#/');
  const co = await p.evaluate(() => { const a = document.querySelector('#su a[href^="#/c/"]'); return a ? a.getAttribute('href') : null; });
  const routes = [['home', '#/'], ['kkoe-list', '#/k'], ['kkoe-g07', '#/k/g07'], ['company', co || '#/'], ['stop', '#/q'], ['journal', '#/j'], ['settle', '#/r/t']];
  const info = {};
  for (const [name, hh] of routes) {
    await go(hh);
    const m = await p.evaluate(() => ({h: document.documentElement.scrollHeight, text: (document.querySelector('#su') || document.body).innerText}));
    info[name] = {route: hh, height: m.h, screens: +(m.h / 844).toFixed(1)};
    fs.writeFileSync(out + '/' + name + '.txt', m.text);
    await p.screenshot({path: out + '/' + name + '-1.png'});
    for (const k of [2, 3]) { await p.evaluate(k => scrollTo(0, 844 * (k - 1) - 60), k); await p.waitForTimeout(250); await p.screenshot({path: out + '/' + name + '-' + k + '.png'}); }
  }
  // 전체 모습(구조 보기용 · 1배)
  const c1 = await b.newContext({viewport: {width: 390, height: 844}, deviceScaleFactor: 1, isMobile: true, hasTouch: true, locale: 'ko-KR', reducedMotion: 'reduce'});
  const q = await c1.newPage();
  for (const [name, hh] of [['home', '#/'], ['kkoe-g07', '#/k/g07']]) {
    await q.goto('http://127.0.0.1:8828/su/?v=f' + Date.now() + hh, {waitUntil: 'networkidle'}); await q.waitForTimeout(1200);
    await q.screenshot({path: out + '/' + name + '-full.png', fullPage: true});
  }
  // 영화 14초(반전 막)
  const c2 = await b.newContext({viewport: {width: 390, height: 844}, deviceScaleFactor: 2, isMobile: true, hasTouch: true, locale: 'ko-KR', reducedMotion: 'no-preference'});
  const r = await c2.newPage();
  await r.goto('http://127.0.0.1:8828/su/?v=m' + Date.now() + '#/k/g07', {waitUntil: 'networkidle'}); await r.waitForTimeout(1200);
  await r.evaluate(() => { const f = document.querySelector('#su figure.sj-kfig'); const s = f.querySelector('svg.ik-kk'); f.scrollIntoView({block: 'start'}); scrollBy(0, -10); s.classList.remove('ik-play'); void s.getBoundingClientRect(); s.classList.add('ik-play'); });
  await r.waitForTimeout(150);
  await r.evaluate(() => { for (const a of document.getAnimations()) { a.pause(); a.currentTime = 14000; } });
  await r.waitForTimeout(200); await r.screenshot({path: out + '/film-14s.png'});
  fs.writeFileSync(out + '/info.json', JSON.stringify({info, errs: errs.slice(0, 5)}, null, 1));
  console.log(JSON.stringify(info), errs.length);
  await b.close();
})();
