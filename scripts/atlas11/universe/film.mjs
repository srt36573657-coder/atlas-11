// 상품권 앞 「우주 영상 1분」(60초 · 720×1280 · 30fps) — 사장님 2026-10-22(서울) 01:49 · 01:59 「맞아」(친구 3명 소개 스타벅스 상품권)
//   「나만에 우주 알지 그런 상품권 받을따 다봐야 줄거야 우주산 그리고 용 오로라 기타등등 마오는영상 1붘을 봐야 그게 정당해 그게 고지 해야고
//    그약솓 지켜야 상품권 받기 그때 나오게 해 그리고 정말쉽개 안내해야해  사람들에 1분 우리에게 투자하는것 서로 존중해야 잖아」
//   명령문 원문 = docs/design/gift-2026-10-22/order-0149.txt
//
//   그림은 새로 그리지 않음 — 사이트 하늘 그대로(site/next/sky.js 별 하늘 · site/next/sky-fly.js 사장님이 그리신 것 · site/next/space.css 오로라)
//     사이트에서는 「하나씩 아주 가끔」(2026-10-21 23:58)이라 빼 둔 우주선 · 비행접시 · 혜성 · 별똥별 비도 이 1분 안에서는 차례로 하나씩 나옴
//   차례(초): 0 제목 「(이름)의 우주」 · 오로라 → 5 피터팬과 팅커벨 → 14 우주선 → 21.5 황룡과 청룡 → 30.5 천사 다섯 → 38.5 혜성 · 별똥별 비
//     → 44.5 비행접시 → 49 앵무새(하트) → 54 하트 별자리 · 「1분을 함께해 주셔서 고마워요」 — 한 번에 둘까지만 날게(지인 말 「번잡해」 2026-10-21 23:07)
//   글은 쉬운 말 한 줄씩(아래 CAPS) · 이름은 site/next/brand.js 한 곳(NAME · josa) · 사고팔기 · 앞날 · 숫자 자랑 없음
//   시계는 이 파일이 쥠(별 하늘 그리기를 한 장씩 부름 · 오로라 CSS 움직임도 같은 때로 맞춤) — 사이트 파일은 고치지 않고, 받을 때 두 곳만 바꿔 끼움(PATCH · 못 찾으면 멈춤)
//   소리 = 같은 폴더 sound.py(계산으로 만든 오르골 「반짝반짝 작은 별」(옛 민요 · 저작권 없음) + 잔잔한 화음 · 사람 목소리 · 녹음 없음)
//   node scripts/atlas11/universe/film.mjs → site/media/universe.mp4 · universe.webm · universe-poster.jpg
//     UF_T=3.5,20 UF_OUT=폴더 → 그 때 그림만 PNG(미리 보기)
import fs from 'node:fs/promises';
import path from 'node:path';
import {execFileSync} from 'node:child_process';
import {createRequire} from 'node:module';
import {NAME, josa} from '../../../site/next/brand.js';
import {screenHits, ruinHits, gainHits} from '../../../site/next/words.js';

const HERE = path.dirname(new URL(import.meta.url).pathname), ROOT = path.resolve(HERE, '../../..'), SITE = path.join(ROOT, 'site');
const OUT = process.env.UF_OUT ?? path.join(SITE, 'media');
const TMP = process.env.UF_TMP ?? '/tmp/universe-film';
const ONLY = process.env.UF_T ? process.env.UF_T.split(',').map(Number) : null;
const require = createRequire('/opt/node-tools/');
const {chromium} = require('playwright');
const exe = '/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell';
const CW = 360, CH = 640, DPR = 2, FPS = 30, DUR = 60; // 그림 = 휴대폰 한 화면(360×640) 두 배 = 720×1280
const stop = m => { console.error('멈춤: ' + m); process.exit(1); };

/* 차례 — 날 것(사이트 sky-fly.js 의 이름) · 나는 때(초) · 오래(밀리초) · 글 한 줄(쉬운 말) */
const SHOW = [
  {at: 5.0, kind: 'peter', dur: 11000, cap: '피터팬과 팅커벨이 하트를 그려요', c: [5.6, 12.4]},
  {at: 14.0, kind: 'ship', dur: 9000, cap: '우주선이 별 사이를 지나가요', c: [14.6, 20.6]},
  {at: 21.5, kind: 'dragons', dur: 11000, cap: '황룡과 청룡이 함께 날아요', c: [22.1, 28.8]},
  {at: 30.5, kind: 'angels', dur: 10500, cap: '천사 다섯이 빛을 뿌려요', c: [31.1, 37.4]},
  {at: 38.5, kind: 'comet', dur: 9500, cap: '혜성과 별똥별이 지나가요', c: [39.1, 44.2]},
  {at: 39.8, kind: 'shower'},
  {at: 44.5, kind: 'ufo', cap: '비행접시도 놀러 왔어요', c: [45.1, 49.4]},
  {at: 49.0, kind: 'parrot', dur: 9000, cap: josa('앵무새 ' + NAME, '가') + ' 하트를 보내요', c: [49.6, 54.0]},
  {at: 54.0, kind: 'finale'}
];
const TITLE = josa(NAME, '의') + ' 우주', SUB = '1분 동안 함께 봐요', END = ['1분을 함께해 주셔서', '고마워요'], SITE_URL = 'aaa7377.com';
for (const t of [TITLE, SUB, ...END, ...SHOW.map(s => s.cap ?? '')]) { const bad = [...screenHits(t), ...ruinHits(t), ...gainHits(t)]; if (bad.length) stop(`글 「${t}」 걸림: ${bad.join(' · ')}`); }

/* 사이트 파일을 받을 때 바꿔 끼우는 곳 — 별 하늘이 스스로 돌지 않고(이 파일이 한 장씩 그림) · 날 것에 오래(dur)를 줄 수 있게 */
const PATCH = {
  '/next/sky.js': [['build(); draw(performance.now());\n  nextMet = performance.now() + 20000;\n  go();', 'build(); draw(performance.now());\n  nextMet = performance.now() + 20000;\n  globalThis.__skyDraw = draw;']],
  '/next/sky-fly.js': [['spawn: k => spawn(k, vt)};', 'spawn: k => spawn(k, vt), spawnO: (k, o) => spawn(k, vt, o)};']]
};
const PAGE = `<!doctype html><html lang="ko" class="space home"><head><meta charset="utf-8">
<meta name="viewport" content="width=${CW}, initial-scale=1">
<link rel="stylesheet" href="/app/fonts.css"><link rel="stylesheet" href="/next/space.css">
<style>
html, body { margin: 0; height: 100%; overflow: hidden; background: #070B17; }
body { font-family: 'Pretendard Variable', Pretendard, system-ui, sans-serif; color: #F4EEFA; -webkit-font-smoothing: antialiased; }
.tt { position: fixed; left: 0; right: 0; top: 33%; text-align: center; opacity: 0; }
.tt h1 { margin: 0; font-size: 40px; line-height: 1.2; font-weight: 800; color: #FFE2A0; letter-spacing: -0.01em; }
.tt p { margin: 14px 0 0; font-size: 19px; font-weight: 600; color: #E8DDF2; }
.cap { position: fixed; left: 24px; right: 24px; bottom: 92px; margin: 0; text-align: center; font-size: 21px; line-height: 1.45; font-weight: 700; color: #F4EEFA; opacity: 0; }
.end { position: fixed; left: 0; right: 0; top: 52%; text-align: center; opacity: 0; }
.end p { margin: 0; font-size: 26px; line-height: 1.4; font-weight: 800; color: #FFE2A0; }
.end small { display: block; margin-top: 18px; font-size: 17px; font-weight: 600; color: #D9CFE8; letter-spacing: 0.02em; }
</style></head><body>
<div class="tt" id="tt"><h1 id="t1"></h1><p id="t2"></p></div>
<p class="cap" id="cap"></p>
<div class="end" id="end"><p id="e1"></p><p id="e2"></p><small id="e3"></small></div>
<script type="module" src="/film-boot.js"></script>
</body></html>`;
/* 씨앗 고정(늘 같은 영상) — 사이트 그림이 쓰는 Math.random 을 정해진 수열로 */
const SEED = `(() => { let a = 20261022; Math.random = () => { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; })();`;
const BOOT = `
const D = ${JSON.stringify({SHOW, TITLE, SUB, END, SITE_URL})};
const $ = id => document.getElementById(id);
$('t1').textContent = D.TITLE; $('t2').textContent = D.SUB; $('e1').textContent = D.END[0]; $('e2').textContent = D.END[1]; $('e3').textContent = D.SITE_URL;
await import('/next/sky.js');
const ramp = (t, a, b, f = 0.6) => t < a || t > b ? 0 : Math.min(1, (t - a) / f, (b - t) / f);
let T0 = null, fired = new Set(), lastCap = '';
window.film = t => { // t = 초(0 ~ 60) · 한 장 그림
  if (T0 === null) T0 = performance.now();
  const now = T0 + t * 1000;
  for (const s of D.SHOW) if (t >= s.at && !fired.has(s)) { fired.add(s); globalThis.__skyFly.spawnO(s.kind, s.dur ? {dur: s.dur} : undefined); }
  globalThis.__skyDraw(now);
  for (const a of document.getAnimations()) { a.pause(); a.currentTime = t * 1000; } // 오로라(나타남 4초 · 숨 19초 · 27초)도 같은 때
  $('tt').style.opacity = ramp(t, 0.5, 5.2, 0.9).toFixed(3);
  const c = D.SHOW.find(s => s.cap && t >= s.c[0] - 0.6 && t <= s.c[1] + 0.6);
  if (c && c.cap !== lastCap) { $('cap').textContent = c.cap; lastCap = c.cap; }
  $('cap').style.opacity = (c ? ramp(t, c.c[0], c.c[1]) : 0).toFixed(3);
  $('end').style.opacity = ramp(t, 55.0, 61, 0.9).toFixed(3);
  return {fly: !!globalThis.__skyFly, cap: c ? c.cap : '', tt: $('tt').style.opacity, end: $('end').style.opacity};
};
window.ready = true;
`;

const TYPES = {'.js': 'text/javascript', '.css': 'text/css', '.woff2': 'font/woff2', '.svg': 'image/svg+xml', '.json': 'application/json', '.png': 'image/png', '.jpg': 'image/jpeg'};
await fs.rm(TMP, {recursive: true, force: true}); await fs.mkdir(TMP, {recursive: true}); await fs.mkdir(OUT, {recursive: true});
const browser = await chromium.launch({executablePath: exe});
const ctx = await browser.newContext({viewport: {width: CW, height: CH}, deviceScaleFactor: DPR, reducedMotion: 'no-preference'});
await ctx.addInitScript(SEED);
await ctx.route('http://film.local/**', async route => {
  const p = new URL(route.request().url()).pathname;
  if (p === '/film.html') return route.fulfill({status: 200, contentType: 'text/html; charset=utf-8', body: PAGE});
  if (p === '/film-boot.js') return route.fulfill({status: 200, contentType: 'text/javascript', body: BOOT});
  const file = path.join(SITE, path.normalize(p).replace(/^(\.\.[/\\])+/, ''));
  if (!file.startsWith(SITE)) return route.fulfill({status: 404, body: ''});
  let body = await fs.readFile(file).catch(() => null);
  if (!body) return route.fulfill({status: 404, body: ''});
  if (PATCH[p]) { let s = body.toString('utf8'); for (const [a, b] of PATCH[p]) { if (!s.includes(a)) stop(`${p} 에서 바꿔 끼울 곳을 못 찾음: ${a.slice(0, 60)}`); s = s.replace(a, b); } body = s; }
  return route.fulfill({status: 200, contentType: TYPES[path.extname(p)] ?? 'application/octet-stream', body});
});
const pg = await ctx.newPage();
const errs = []; pg.on('pageerror', e => errs.push(String(e))); pg.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
await pg.goto('http://film.local/film.html', {waitUntil: 'load'});
await pg.waitForFunction(() => window.ready === true && !!globalThis.__skyFly && !!globalThis.__skyDraw, null, {timeout: 20000}).catch(() => stop('하늘(sky.js · sky-fly.js)이 안 뜸 ' + errs.join(' | ')));
await pg.evaluate(() => document.fonts.ready);
const shot = async (t, file, type = 'jpeg') => { const r = await pg.evaluate(t => window.film(t), t); await pg.screenshot({path: file, type, ...(type === 'jpeg' ? {quality: 92} : {})}); return r; };
if (ONLY) {
  // 미리 보기 — 그 때까지 한 장씩 돌려 놓고(날 것이 제자리에 있게) 그 때 그림만 PNG
  const want = new Set(ONLY.map(t => Math.round(t * FPS)));
  for (let i = 0; i <= Math.max(...want); i++) { if (want.has(i)) { const r = await shot(i / FPS, path.join(OUT, `uf-${(i / FPS).toFixed(1)}.png`), 'png'); console.log((i / FPS).toFixed(1), JSON.stringify(r)); } else await pg.evaluate(t => window.film(t), i / FPS); }
  await browser.close(); if (errs.length) stop('쪽 오류: ' + errs.join(' | ')); process.exit(0);
}
const N = DUR * FPS; const seen = new Set();
for (let i = 0; i < N; i++) { const r = await shot(i / FPS, path.join(TMP, `f${String(i).padStart(5, '0')}.jpg`)); if (r.cap) seen.add(r.cap); if (i % 300 === 0) console.log('그림', i, '/', N); }
await browser.close();
if (errs.length) stop('쪽 오류: ' + errs.join(' | '));
for (const s of SHOW) if (s.cap && !seen.has(s.cap)) stop('글 한 줄이 영상에 안 나옴: ' + s.cap);
// 소리(계산 · 60초) → 영상 둘 · 표지(제목이 다 보이는 3.5초)
execFileSync('python3', [path.join(HERE, 'sound.py'), path.join(TMP, 'sound.wav'), JSON.stringify(SHOW.map(s => ({at: s.at, kind: s.kind})))], {stdio: 'inherit'});
const ff = a => execFileSync('ffmpeg', ['-hide_banner', '-loglevel', 'error', '-y', ...a], {stdio: 'inherit'});
const IN = ['-framerate', String(FPS), '-i', path.join(TMP, 'f%05d.jpg'), '-i', path.join(TMP, 'sound.wav')];
ff([...IN, '-map', '0:v', '-map', '1:a', '-c:v', 'libx264', '-preset', 'slow', '-crf', '25', '-pix_fmt', 'yuv420p', '-profile:v', 'high', '-c:a', 'aac', '-b:a', '96k', '-movflags', '+faststart', '-t', String(DUR), path.join(OUT, 'universe.mp4')]);
ff([...IN, '-map', '0:v', '-map', '1:a', '-c:v', 'libvpx-vp9', '-b:v', '0', '-crf', '37', '-row-mt', '1', '-deadline', 'good', '-cpu-used', '2', '-pix_fmt', 'yuv420p', '-c:a', 'libopus', '-b:a', '64k', '-t', String(DUR), path.join(OUT, 'universe.webm')]);
ff(['-i', path.join(TMP, `f${String(Math.round(3.5 * FPS)).padStart(5, '0')}.jpg`), '-q:v', '4', path.join(OUT, 'universe-poster.jpg')]);
for (const f of ['universe.mp4', 'universe.webm']) {
  const d = Number(execFileSync('ffprobe', ['-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', path.join(OUT, f)]).toString().trim());
  if (Math.abs(d - DUR) > 0.1) stop(`${f} 길이 ${d}초 — 60초가 아님`);
  console.log(f, d.toFixed(2) + '초', ((await fs.stat(path.join(OUT, f))).size / 1e6).toFixed(2) + 'MB');
}
await fs.rm(TMP, {recursive: true, force: true});
