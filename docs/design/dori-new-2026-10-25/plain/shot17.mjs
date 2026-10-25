// 샘플 한 칸을 휴대폰 너비로 찍고 검사한다 — node shot.mjs s01 [s02 …]
//   ① 화면 글: 돌이 금지 말(사이트 words.js 의 screenHits · ruinHits · gainHits) · 소문자 영어 낱말 · 「%」
//   ② 색: 조각 안 #색 번호가 청록 색 100가지(palette.json) 밖이면 걸림(rgba 는 같은 세 숫자만)
//   ③ 넘침: 390 폭에서 옆으로 넘치면 걸림 · 휴대폰 틀 안 글씨가 틀 너비 4.75cqw(휴대폰에서 틀 너비 358px 일 때 17px · 사장님 기준 가장 작아도 17px)보다 작으면 걸림
import fs from 'node:fs';
import path from 'node:path';
import {pathToFileURL} from 'node:url';
import {createRequire} from 'node:module';
const require = createRequire(import.meta.url);
const {chromium} = require('playwright');
const DIR = path.dirname(new URL(import.meta.url).pathname);
const W = await import(pathToFileURL('/home/claude/atlas-space/site/next/words.js').href);
const PAL = new Set(JSON.parse(fs.readFileSync(path.join(DIR, 'palette.json'), 'utf8')).map(h => h.toUpperCase()));
const PAL_RGB = new Set([...PAL].map(h => [1, 3, 5].map(i => parseInt(h.slice(i, i + 2), 16)).join(',')));
const base = fs.readFileSync(path.join(DIR, 'base.css'), 'utf8');
const ids = process.argv.slice(2);
const browser = await chromium.launch();
let bad = 0;
for (const id of ids) {
  const frag = fs.readFileSync(path.join(DIR, id + '.html'), 'utf8');
  const out = [];
  // ② 색
  const hexes = [...frag.matchAll(/#([0-9a-fA-F]{6}|[0-9a-fA-F]{3})\b/g)].map(m => m[1].length === 3 ? '#' + [...m[1]].map(c => c + c).join('') : '#' + m[1]).map(h => h.toUpperCase());
  const offHex = [...new Set(hexes.filter(h => !PAL.has(h)))];
  if (offHex.length) out.push('색 100가지 밖 색 번호: ' + offHex.join(' '));
  const rgbs = [...frag.matchAll(/rgba?\(\s*(\d+)[\s,]+(\d+)[\s,]+(\d+)/g)].map(m => [m[1], m[2], m[3]].join(','));
  const offRgb = [...new Set(rgbs.filter(t => !PAL_RGB.has(t)))];
  if (offRgb.length) out.push('색 100가지 밖 rgb: ' + offRgb.join(' '));
  const named = [...frag.matchAll(/(?:color|background|fill|stroke|border[a-z-]*)\s*:\s*[^;"]*\b(white|black|red|blue|green|gray|grey|silver|teal|cyan|navy|gold|yellow|orange|pink|purple)\b/gi)].map(m => m[1]);
  if (named.length) out.push('이름 색: ' + [...new Set(named)].join(' '));
  if (/https?:\/\//.test(frag.replace(/xmlns(:\w+)?="http:\/\/www\.w3\.org\/[^"]*"/g, ''))) out.push('바깥 주소가 있음');
  const page = await browser.newPage({viewport: {width: 390, height: 900}, deviceScaleFactor: 2});
  const errs = [];
  page.on('pageerror', e => errs.push(String(e)));
  await page.setContent(`<!doctype html><html lang="ko"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><style>${base}</style></head><body><main>${frag}</main></body></html>`, {waitUntil: 'load'});
  await page.waitForTimeout(300);
  const r = await page.evaluate(() => {
    const sw = document.documentElement.scrollWidth;
    const phone = document.querySelector('.phone');
    const pw = phone ? phone.getBoundingClientRect().width : 0;
    const texts = [];
    let small = [];
    const walk = n => {
      for (const c of n.childNodes) {
        if (c.nodeType === 3 && c.textContent.trim()) {
          const el = c.parentElement, cs = getComputedStyle(el);
          if (cs.visibility === 'hidden' || cs.display === 'none' || Number(cs.opacity) === 0) continue;
          texts.push(c.textContent.trim());
          if (phone && phone.contains(el)) {
            const fs = parseFloat(cs.fontSize);
            if (fs < pw * 0.0475 - 0.01) small.push(c.textContent.trim().slice(0, 12) + ' ' + fs.toFixed(1) + 'px');
          }
        } else if (c.nodeType === 1 && !['STYLE', 'SCRIPT'].includes(c.tagName)) walk(c);
      }
    };
    walk(document.body);
    return {sw, pw, text: texts.join(' '), small: small.slice(0, 8), aria: [...document.querySelectorAll('[aria-label]')].map(e => e.getAttribute('aria-label')).join(' ')};
  });
  if (r.sw > 390) out.push('옆 넘침 ' + r.sw);
  if (!r.pw) out.push('휴대폰 틀(.phone)이 없음');
  if (r.small.length) out.push('작은 글씨: ' + r.small.join(' / '));
  const all = r.text + ' ' + r.aria;
  const sh = W.screenHits(all).map(x => x.word ?? x);
  if (sh.length) out.push('금지 말: ' + [...new Set(sh)].join(' '));
  const rh = (W.ruinHits(all) || []).map(x => x.name ?? x.word ?? JSON.stringify(x));
  if (rh.length) out.push('망치는 길 말: ' + [...new Set(rh)].join(' '));
  const gh = (W.gainHits(all) || []).map(x => x.word ?? x);
  if (gh.length) out.push('수익 자랑 말: ' + [...new Set(gh)].join(' '));
  const en = all.match(/(?<![A-Za-z])[a-z]{3,}(?![A-Za-z])/g);
  if (en) out.push('영어 낱말: ' + [...new Set(en)].slice(0, 8).join(' '));
  if (/%/.test(all)) out.push('「%」 글');
  if (errs.length) out.push('화면 오류: ' + errs.slice(0, 3).join(' | '));
  const el = await page.$('.sample');
  if (el) await el.screenshot({path: path.join(DIR, id + '.png')});
  await page.close();
  bad += out.length;
  console.log(id + (out.length ? ' 걸림 ' + out.length + '\n  - ' + out.join('\n  - ') : ' 통과'));
}
await browser.close();
process.exit(bad ? 1 : 0);
