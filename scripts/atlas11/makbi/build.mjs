// 막비 그림 · 영상 만들기(사장님 2026-10-13 03:38 · 03:39 「이 앵무새로 귀엽게 재미나게 그리고 위트있게 해」)
//   node scripts/atlas11/makbi/build.mjs [--only svg|og|video]
//   만드는 것(모두 사람 얼굴 없음 · 앵무새 막비만):
//     site/media/makbi-moon.svg   제목 옆 달(둥근 창) 속 막비 얼굴
//     site/media/makbi-icon.svg   둥근 막비 얼굴(옛 판 띠 · 맨 위 1장이 못 열릴 때 띠)
//     site/media/makbi-hello.svg  맨 위 1장 여는 홍표(240×300 · 바탕 없음 — 2026-10-15 「열면 홍표 니오게 해」 · 규칙 66)
//     site/og-makbi.jpg           링크 미리보기(1200×630)
//     site/media/makbi-poster.jpg · makbi-intro.mp4 · makbi-intro.webm  소개 영상 — video.mjs 가 만듦(2026-10-14 홍표 판: 720×1280 · 35초 · 소리 있음 · 자막)
//   2026-10-14(싱가포르) 21:50 「막비 이름을 홍표 라고 해」 · 22:29 「홍표 홍표 홍표 3번 하면서 더 아이어맨스럽게 만들어봐 그리고 아틀란스에 올려」 — 보이는 이름은 홍표(파일 이름 makbi-* 은 그대로)
//   위트 = 앵무새는 들은 말만 따라 한다 → ATLAS 도 지난 기록만 말한다(앞날 맞히기 없음 · 안전 문장과 같은 뜻)
//   친구 소개 상품권(사장님 2026-10-14 14:56 「카톡으로 아틀란스 소개 10명 … 스타벅스 아메리카노 상품권 1장 … 그 앵무새 영상에도」 · 14:59 「너가 알아서 해 그냥 많이줘」)
//     2026-10-14 18:19(싱가포르) 「스타벅스 상품권 1만원 이라고 해 1장이 아니라」 — 띠 · 끝 상자 글 = 「스타벅스 상품권 1만원」
//     = 영상 아래 금빛 띠(0.8 ~ 19.4초) + 마지막 장면 맨 아래 상자(안전 문장 줄은 로고 밑으로 옮김) · 길이는 24초 그대로(옛 판 띠 · 소개 쪽 글이 「24초」)
import fs from 'node:fs/promises';
import path from 'node:path';
import {execFileSync} from 'node:child_process';
import {createRequire} from 'node:module';
import {makbi, makbiHead, svg, C, hongpyo, GEAR_DEFS} from './draw.mjs';

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), '../../..');
const MEDIA = path.join(ROOT, 'site/media');
const TMP = process.env.MAKBI_TMP ?? '/tmp/makbi-build';
const only = process.argv.includes('--only') ? process.argv[process.argv.indexOf('--only') + 1] : null;
const P = {night: '#0C2824', deep: '#061A17', card: '#12322D', jade: '#6CC7A8', jadeInk: '#9FE0C8', ink: '#EEF6F2', sub: '#B7D0C7', moon: '#F4ECDE', gold: '#E9C46A'};
let seed = 20261013; const rnd = () => ((seed = (seed * 1103515245 + 12345) % 2147483648) / 2147483648);
const stars = (w, h, n, maxY) => Array.from({length: n}, () => `<circle cx="${(rnd() * w).toFixed(1)}" cy="${(rnd() * maxY).toFixed(1)}" r="${(0.8 + rnd() * 1.8).toFixed(1)}" fill="#fff" opacity="${(0.25 + rnd() * 0.6).toFixed(2)}"/>`).join('');

/** 맨 위 1장 여는 홍표(사장님 2026-10-15(싱가포르) 04:10 「열면 홍표 니오게 해」 · 규칙 66) — 사이트를 열면 1장 글 자리에 먼저 나오는 홍표(바탕 없음 · 240×300)
 *  눈 가리개는 이마 위 · 부리를 벌려 「홍표!」(말풍선 셋은 화면 글 — atlas.js slideHello · 움직임은 atlas.css) · 옛 그림(그래프 횃대 · 「짹! 지난 기록만」)은 2026-10-13 05:42 부터 안 쓰던 것 */
function helloScene() {
  const o = {id: 'h', tilt: -9, blink: 0, wingL: .18, wingR: .4, crestUp: .9, beakOpen: .65, visor: 0, vs: 1, flame: 0, glowWing: .45};
  return svg(240, 300, `<defs>${GEAR_DEFS}<radialGradient id="ha" cx="50%" cy="50%" r="50%"><stop offset="0" stop-color="#7FFFE6" stop-opacity=".42"/><stop offset=".6" stop-color="#2FB89F" stop-opacity=".14"/><stop offset="1" stop-color="#2FB89F" stop-opacity="0"/></radialGradient></defs>
  <ellipse cx="120" cy="160" rx="118" ry="130" fill="url(#ha)"/><g transform="translate(0 24)">${hongpyo(o, .2, {boot: 1, guard: 1})}</g>`);
}
if (!only || only === 'svg') {
  await fs.writeFile(path.join(MEDIA, 'makbi-moon.svg'), svg(100, 100, makbiHead({id: 'm'})));
  await fs.writeFile(path.join(MEDIA, 'makbi-icon.svg'), svg(100, 100, `<circle cx="50" cy="50" r="50" fill="${P.moon}"/>` + makbiHead({id: 'i'})));
  await fs.writeFile(path.join(MEDIA, 'makbi-hello.svg'), helloScene());
  console.log('svg 3');
}
if (only === 'svg') process.exit(0);

// ── 브라우저로 그리기(링크 미리보기 · 영상) ──
const require = createRequire(process.env.PW_DIR ?? '/opt/node-tools/');
const {chromium} = require('playwright');
const exe = process.env.PW_EXE ?? '/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell';
const b = await chromium.launch(exe ? {executablePath: exe} : {});
await fs.mkdir(TMP, {recursive: true});
const drawSrc = (await fs.readFile(new URL('./draw.mjs', import.meta.url), 'utf8')).replace(/^export /gm, '');
const fontCss = `<link rel="stylesheet" href="file://${ROOT}/site/atlas/fonts.css">`;
const base = `*{box-sizing:border-box;margin:0}body{font-family:'Pretendard Variable',Pretendard,'Noto Sans CJK KR',sans-serif;-webkit-font-smoothing:antialiased}`;

if (!only || only === 'og') {
  const pg = await b.newPage({viewport: {width: 1200, height: 630}});
  await pg.setContent(`<!doctype html><meta charset="utf-8">${fontCss}<style>${base}
    body{width:1200px;height:630px;overflow:hidden;background:radial-gradient(120% 90% at 22% 30%,#164A41 0%,${P.night} 55%,${P.deep} 100%);color:${P.ink};position:relative}
    .st{position:absolute;inset:0}.mb{position:absolute;left:70px;top:96px;width:400px}
    .bub{position:absolute;left:300px;top:44px;background:#fff;color:${P.night};font-weight:800;font-size:34px;padding:14px 26px;border-radius:24px}
    .bub:after{content:'';position:absolute;left:34px;bottom:-20px;border:14px solid transparent;border-top:22px solid #fff;border-bottom:0}
    .tx{position:absolute;left:600px;top:118px;width:560px}
    h1{font-size:68px;line-height:1.12;font-weight:800;letter-spacing:-1px}
    .who{margin-top:22px;font-size:36px;font-weight:800;color:${P.jadeInk}}
    .wit{margin-top:18px;font-size:30px;line-height:1.45;color:${P.sub};font-weight:600}
    .row{margin-top:30px;display:flex;gap:22px;align-items:center}.btn{background:${P.ink};color:${P.night};font-size:30px;font-weight:800;padding:12px 30px;border-radius:40px}.dom{font-size:26px;color:${P.sub}}</style>
    <body><svg class="st" viewBox="0 0 1200 630">${stars(1200, 630, 70, 630)}</svg>
    <div class="mb"><svg viewBox="0 -6 240 330"><defs>${GEAR_DEFS}</defs>${hongpyo({id: 'o', tilt: -8, blink: 0, wingL: .15, wingR: .5, crestUp: .9, beakOpen: .5, visor: 0, vs: 1, flame: .55, glowWing: .6}, .3, {boot: 1, guard: 1})}</svg></div>
    <div class="bub">홍표! 홍표! 홍표!</div>
    <div class="tx"><h1>ATLAS를<br>소개합니다</h1><p class="who">안내 · 앵무새 홍표</p><p class="wit">앵무새는 들은 것만 말해요.<br>ATLAS도 지난 기록만 말해요.</p>
    <div class="row"><span class="btn">▶ 35초 영상</span><span class="dom">aaa7377.com</span></div></div></body>`, {waitUntil: 'load'});
  await pg.evaluate(() => document.fonts.ready); await pg.waitForTimeout(200);
  await pg.screenshot({path: path.join(ROOT, 'site/og-makbi.jpg'), type: 'jpeg', quality: 88});
  await pg.close(); console.log('og 1');
}

if (!only || only === 'video') { // 소개 영상 — video.mjs(홍표 35초 · 소리 있음 · 2026-10-14)
  execFileSync('node', [path.join(ROOT, 'scripts/atlas11/makbi/video.mjs')], {stdio: 'inherit', env: {...process.env, HP_OUT: MEDIA}});
}
await b.close();
