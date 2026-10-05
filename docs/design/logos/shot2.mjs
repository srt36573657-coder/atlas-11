// node shot2.mjs <경로(maps-root 기준)> <사진이름> [폭] [light|dark]
import {createRequire} from 'node:module';
const require = createRequire('/opt/node-tools/node_modules/');
const {chromium} = require('playwright');
const [, , path, out, w = '430', scheme = 'dark'] = process.argv;
const b = await chromium.launch({executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome', args: ['--font-render-hinting=none']});
const p = await b.newPage({viewport: {width: Number(w), height: 900}, deviceScaleFactor: 2, colorScheme: scheme});
const errs = []; p.on('pageerror', e => errs.push(e.message)); p.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
await p.goto(`http://localhost:8731/${path}`, {waitUntil: 'networkidle'});
await p.waitForFunction(() => window.READY === true, null, {timeout: 20000}).catch(() => errs.push('READY 안 옴'));
await p.evaluate(() => document.fonts.ready); await p.waitForTimeout(300);
const sw = await p.evaluate(() => document.documentElement.scrollWidth);
await p.screenshot({path: new URL(`./shots/${out}.jpg`, import.meta.url).pathname, fullPage: true, type: 'jpeg', quality: 90});
await b.close(); console.log(JSON.stringify({out, sw, errs}));
