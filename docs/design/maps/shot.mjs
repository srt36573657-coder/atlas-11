// 지도 샘플 한 장을 휴대폰 크기 사진으로 — node shot.mjs <파일이름(확장자 없이)> [light]
// 기본은 어두운 화면(사장님 휴대폰) · 폭 430px · 2배 · 전체 길이 · maps/<이름>.html → shots/<이름>[-light].jpg
import {createRequire} from 'node:module';
const require = createRequire('/opt/node-tools/node_modules/');
const {chromium} = require('playwright');
const name = process.argv[2], scheme = process.argv[3] === 'light' ? 'light' : 'dark';
const PORT = process.env.MAPS_PORT || '8731';
if (!name) { console.error('파일 이름을 주십시오'); process.exit(2); }
const browser = await chromium.launch({executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome', args: ['--font-render-hinting=none']});
const page = await browser.newPage({viewport: {width: 430, height: 932}, deviceScaleFactor: 2, colorScheme: scheme});
const errors = [];
page.on('console', m => { if (m.type() === 'error' || m.type() === 'warning') errors.push(`${m.type()}: ${m.text()}`); });
page.on('pageerror', e => errors.push('pageerror: ' + e.message));
await page.goto(`http://localhost:${PORT}/maps/${name}.html`, {waitUntil: 'networkidle'});
await page.waitForFunction(() => window.READY === true, null, {timeout: 30000}).catch(() => errors.push('READY 가 30초 안에 안 옴'));
await page.evaluate(() => document.fonts.ready);
await page.waitForTimeout(400);
const m = await page.evaluate(() => ({w: document.documentElement.scrollWidth, h: document.documentElement.scrollHeight,
  over: [...document.querySelectorAll('.sheet *')].filter(e => { const r = e.getBoundingClientRect(); return r.width && (r.right > 430.5 || r.left < -0.5); }).slice(0, 5).map(e => e.tagName + '.' + (e.className?.baseVal ?? e.className) + ' ' + (e.textContent || '').slice(0, 20)),
  fonts: [...document.fonts].filter(f => f.status === 'loaded').map(f => f.family).filter((v, i, a) => a.indexOf(v) === i)}));
const file = `shots/${name}${scheme === 'light' ? '-light' : ''}.jpg`;
await page.screenshot({path: new URL('./' + file, import.meta.url).pathname, fullPage: true, type: 'jpeg', quality: 88});
await browser.close();
console.log(JSON.stringify({file, width: m.w, height: m.h, outside430: m.over, fontsLoaded: m.fonts, errors}, null, 1));
