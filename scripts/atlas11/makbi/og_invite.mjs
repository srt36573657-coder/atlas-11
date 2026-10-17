#!/usr/bin/env node
// 초대장 링크 미리보기 그림(site/og-invite.png · 1200×630) — 바탕(옛 네모 표시 · ATLAS 글자를 지운 판 og-invite-base.png) 위에 왼쪽 위 앵무새 얼굴 + 이름
//   이름 = site/next/brand.js 한 곳(규칙 76 — 2026-10-17 17:57 「… 시스템에 세팅후 작업해」) · 글꼴 고운바탕 400 · 26px · 옛 글자 색 #A9BFB4(2026-10-17 일꾼 3 판과 같은 자리)
//   쓰는 법: node scripts/atlas11/makbi/og_invite.mjs [--out site/og-invite.png]
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {createRequire} from 'node:module';
import {NAME} from '../../../site/next/brand.js';
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../..');
const out = process.argv.includes('--out') ? process.argv[process.argv.indexOf('--out') + 1] : path.join(ROOT, 'site/og-invite.png');
const {chromium} = createRequire('/opt/node-tools/')('playwright');
const dataUrl = (f, t) => `data:${t};base64,` + fs.readFileSync(path.join(ROOT, f)).toString('base64'); // 빈 쪽에서 file:// 그림은 막힘 — 그림은 글 속에 담아 넘김
const BASE = dataUrl('scripts/atlas11/makbi/og-invite-base.png', 'image/png'), ICON = dataUrl('site/media/makbi-icon.svg', 'image/svg+xml');
const b = await chromium.launch({executablePath: '/opt/pw-browsers/chromium', args: ['--font-render-hinting=none', '--disable-background-networking', '--disable-component-update', '--no-first-run', '--disable-sync']});
try {
  const p = await b.newPage({viewport: {width: 1200, height: 630}, deviceScaleFactor: 1});
  await p.setContent(`<!doctype html><html lang="ko"><head><meta charset="utf-8"><link rel="stylesheet" href="file://${ROOT}/site/atlas/fonts.css"><style>
html,body{margin:0;width:1200px;height:630px;overflow:hidden;background:url('${BASE}') 0 0/1200px 630px no-repeat}
.brand{position:absolute;left:92px;top:146px;height:52px;display:flex;align-items:center;gap:15px}
.brand img{width:40px;height:40px;display:block}
.brand span{font-family:'Gowun Batang',serif;font-weight:400;font-size:26px;letter-spacing:.3em;color:#A9BFB4;line-height:1;white-space:nowrap}
</style></head><body><div class="brand"><img src="${ICON}" alt=""><span>${NAME}</span></div></body></html>`, {waitUntil: 'load', timeout: 90000});
  await p.evaluate(async n => { await document.fonts.load('400 26px "Gowun Batang"', n); await document.fonts.ready; }, NAME);
  const ok = await p.evaluate(n => ({font: document.fonts.check('400 26px "Gowun Batang"', n), img: document.querySelector('img').complete && document.querySelector('img').getBoundingClientRect().width === 40}), NAME);
  if (!ok.font || !ok.img) throw Error('글꼴 · 얼굴 그림을 못 읽음 ' + JSON.stringify(ok));
  await p.screenshot({path: out, clip: {x: 0, y: 0, width: 1200, height: 630}});
  console.log('og-invite ' + NAME + ' → ' + path.relative(ROOT, out));
} finally { await b.close(); }
