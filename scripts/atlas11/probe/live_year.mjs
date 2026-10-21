// 탐침 — 진짜 사이트 첫 화면 「지난 한 해 다시 보기」가 저절로 도는지(사장님 2026-10-21 10:44 · 11:07 「음 단추가 아니라 자동으로 보여주게해」)
//   휴대폰 크기 390×844 · 움직임 줄이기 끔 · 다시 온 기기 · 크로뮴과(설치되면) 웹킷(아이폰 사파리와 같은 엔진)
//   때마다 적음: 도는지(th-run) · 단추 말 · 머리 줄(번호 · 이름) · 끝 수 · 「?」 줄 · 옆 넘침 · 받은 파일(theme-year.js · .css · theme-path.json) 응답 · 쪽 오류
//   끝난 뒤 한 번 누름(다시 보기 → 1번부터) · 또 한 번 누름(멈춤)
//   씀: <OUT>/year.json · year-<엔진>-<때>.png
//   쓰는 법: 실행기 PW_DIR=/tmp/pw/node_modules node scripts/atlas11/probe/live_year.mjs
//            로컬 LIVE_BASE=http://127.0.0.1:8826 LIVE_APP=/next/ PW_DIR=<node_modules> LIVE_OUT=<폴더> node …
import fs from 'node:fs/promises';
import {createRequire} from 'node:module';
const require = createRequire(process.env.PW_DIR ? process.env.PW_DIR.replace(/\/?$/, '/') : import.meta.url);
const pw = require('playwright');
const B = (process.env.LIVE_BASE || 'https://aaa7377.com').replace(/\/+$/, ''), APP = process.env.LIVE_APP || '/';
const dir = process.env.LIVE_OUT || 'reports/atlas11/probe/live-year'; await fs.mkdir(dir, {recursive: true});
const out = {made: new Date().toISOString(), base: B, app: APP, runs: []};
for (const eng of ['chromium', 'webkit']) {
  let b; try { b = await pw[eng].launch(process.env.PW_EXE && eng === 'chromium' ? {executablePath: process.env.PW_EXE} : {}); } catch (e) { out.runs.push({eng, err: 'launch ' + String(e.message).split('\n')[0].slice(0, 160)}); continue; }
  const R = {eng, at: []}; out.runs.push(R);
  const ctx = await b.newContext({viewport: {width: 390, height: 844}, deviceScaleFactor: 2, isMobile: true, hasTouch: true, locale: 'ko-KR', timezoneId: 'Asia/Seoul', reducedMotion: 'no-preference'});
  await ctx.addInitScript(() => { try { if (sessionStorage.getItem('cw-seed')) return; sessionStorage.setItem('cw-seed', '1'); localStorage.clear(); localStorage.setItem('atlas:essence-seen', 'true'); localStorage.setItem('atlas:white-seen', 'true'); } catch { /* 없음 */ } });
  const p = await ctx.newPage(); const errs = [], net = {};
  p.on('pageerror', e => errs.push(String(e.message).slice(0, 160)));
  p.on('response', r => { const m = /\/next\/(theme-year\.js|theme-year\.css|data\/theme-path\.json)/.exec(r.url()); if (m) net[m[1]] = r.status(); });
  const st = tag => p.evaluate(tag => { const o = document.querySelector('svg.th-orbit'), y = document.querySelector('.th-yr'); if (!y) return {tag, none: true}; return {tag, t: Math.round(performance.now()), run: !!o?.classList.contains('th-run'), label: y.getAttribute('aria-label'), dis: y.disabled, title: y.querySelector('.th-yrt')?.textContent ?? null, v: [...y.querySelectorAll('.th-yrv')].map(e => e.textContent).join(' '), say: /받지 못/.test(y.textContent), sw: document.documentElement.scrollWidth}; }, tag);
  try {
    await p.goto(B + APP + '?v=' + Date.now() + '#/', {waitUntil: 'load', timeout: 60000});
    const t0 = Date.now();
    for (const [ms, tag] of [[1500, 'a'], [6000, 'p1'], [16000, 'p2'], [26000, 'p3'], [40000, 'end']]) {
      const w = ms - (Date.now() - t0); if (w > 0) await p.waitForTimeout(w);
      R.at.push(await st(tag));
      if (tag !== 'a') await p.screenshot({path: `${dir}/year-${eng}-${tag}.png`});
    }
    await p.tap('.th-yr').catch(() => p.click('.th-yr')); await p.waitForTimeout(1500); R.at.push(await st('tap1'));
    await p.tap('.th-yr').catch(() => p.click('.th-yr')); await p.waitForTimeout(1500); R.at.push(await st('tap2'));
  } catch (e) { R.err = String(e.message).split('\n')[0].slice(0, 300); }
  R.net = net; R.errs = errs;
  await ctx.close(); await b.close();
}
await fs.writeFile(`${dir}/year.json`, JSON.stringify(out, null, 1) + '\n');
console.log(JSON.stringify(out.runs.map(r => ({eng: r.eng, err: r.err, net: r.net, errs: r.errs, at: (r.at || []).map(a => [a.tag, a.run ? 'run' : '-', a.label, a.title, a.v, a.say ? '?' : '', a.sw].join(':'))}))));
