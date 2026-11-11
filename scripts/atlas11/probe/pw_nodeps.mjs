// 탐침 — 깃허브 실행기 우분투 받기 주소 고장(2026-11-11 14:00Z 부터 · azure.archive.ubuntu.com 등 못 찾음) 때 브라우저를 apt 없이 띄울 수 있나(주문 1112-0044)
//   ① playwright 가 받은 chromium(install chromium · --with-deps 없이) ② 실행기에 깔린 구글 크롬(channel chrome) — 둘 다 진짜 사이트 /su/ 첫 쪽을 열어 봄
//   읽기만 함(누르기 · 적기 없음) · 결과는 이 탐침 글(pwnodeps.txt)에 한 줄씩
import {createRequire} from 'node:module';
const require = createRequire(process.env.PW_DIR ? process.env.PW_DIR.replace(/\/?$/, '/') : import.meta.url);
const {chromium} = require('playwright');
const B = 'https://aaa7377.com';
for (const [tag, opt] of [['받은 chromium', {}], ['깔린 크롬', {channel: 'chrome'}]]) {
  const t0 = Date.now();
  try {
    const b = await chromium.launch(opt);
    const p = await b.newPage({viewport: {width: 390, height: 844}});
    await p.goto(B + '/su/?v=' + Date.now() + '#/', {waitUntil: 'networkidle', timeout: 60000});
    await p.waitForSelector('svg.su-apple', {timeout: 40000});
    const n = await p.evaluate(() => ({cells: document.querySelectorAll('svg.su-apple a.sa-cell').length, up3: document.querySelectorAll('svg.su-apple [data-place]').length, title: document.title}));
    console.log(tag, '열림', b.version(), JSON.stringify(n), Math.round((Date.now() - t0) / 1000) + '초');
    if (!opt.channel) { await p.waitForTimeout(1500); await p.screenshot({path: 'reports/atlas11/probe/pwnodeps-su.png'}); const w = await p.evaluate(() => { const c = document.createElement('canvas').getContext('2d'); c.font = '20px sans-serif'; return {가: c.measureText('가나다라마바사').width, a: c.measureText('abcdefg').width, font: getComputedStyle(document.body).fontFamily.slice(0, 80)}; }); console.log('글 폭', JSON.stringify(w)); }
    await b.close();
  } catch (e) {
    console.log(tag, '실패', String(e?.message ?? e).split('\n').slice(0, 3).join(' | ').slice(0, 300));
  }
}
