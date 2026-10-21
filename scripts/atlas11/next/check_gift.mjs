// 상품권 앞 「우주 영상 1분」 검사(소개 한 장 hello.html · 진짜 1분을 끝까지 틀어 봄 · 약 80초)
//   사장님 2026-10-22(서울) 01:49 「… 마오는영상 1붘을 봐야 그게 정당해 그게 고지 해야고 그약솓 지켜야 상품권 받기 그때 나오게 해 그리고 정말쉽개 안내해야해
//   사람들에 1분 우리에게 투자하는것 서로 존중해야 잖아」 · 01:59 「맞아」 — docs/design/gift-2026-10-22/order-0149.txt
//   보는 것: ① 처음 = 약속 알림 · 걸음 넷 · 「상품권 받기」 · 번호 숨김 · 건너뛸 막대 없음 · 가로 넘침 없음 · 글씨 17px 위 · 단추 48px 위
//            ② 틀기 → 건너뛰기(50초로) 막힘 · 빨리 감기(4배) 막힘 ③ 끝까지 → 「상품권 받기」 · 번호 · 고마움 줄 · 이 기기 표시 ④ 다시 열면 바로 열림 ⑤ 영어 팩이면 한글 없음
//   node scripts/atlas11/next/check_gift.mjs [--base http://127.0.0.1:8826] [--pw /tmp/pw/] [--out 결과.json]  (scripts/atlas11/invite_dev.mjs --dir site 가 떠 있어야 함 · 깃허브 전체 검사도 이 꼴로 부름)
import {createRequire} from 'node:module';

const arg = (k, d) => { const i = process.argv.indexOf(k); return i > 0 && process.argv[i + 1] != null && !process.argv[i + 1].startsWith('--') ? process.argv[i + 1] : d; };
const require = createRequire(String(arg('--pw', process.env.PW_DIR || '/opt/node-tools/')).replace(/\/?$/, '/')); // 깃허브 전체 검사는 PW_DIR · PW_EXE(다른 검사와 같은 길)
const {chromium} = require('playwright');
const B = String(arg('--base', 'http://127.0.0.1:8826')).replace(/\/$/, '');
const fails = [], fail = (m, x = '') => { fails.push(m + (x ? ' — ' + x : '')); console.log('✗ ' + m, x); }, ok = m => console.log('✓ ' + m);
const EXE = process.env.PW_EXE || (process.env.PW_DIR ? null : '/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell');
const browser = await chromium.launch({...(EXE ? {executablePath: EXE} : {}), args: ['--autoplay-policy=user-gesture-required']});

const look = p => p.evaluate(() => {
  const sec = document.querySelector('#hp-promo'), v = document.querySelector('#hp-uv'), got = document.querySelector('#hp-got');
  const small = [...sec.querySelectorAll('*')].filter(e => e.childElementCount === 0 && e.textContent.trim() && e.offsetParent !== null && parseFloat(getComputedStyle(e).fontSize) < 17).map(e => e.className || e.tagName);
  const taps = [...sec.querySelectorAll('a, button')].filter(e => e.offsetParent !== null).map(e => ({t: e.textContent.trim(), h: Math.round(e.getBoundingClientRect().height)}));
  return {text: sec.innerText, got: got.hidden, ctl: v.controls, auto: v.autoplay, over: document.documentElement.scrollWidth > window.innerWidth, small, taps, gift: window.__gift ?? null, key: (() => { try { return localStorage.getItem('atlas:gift:seen'); } catch { return 'x'; } })()};
});

for (const [w, h] of [[390, 844], [320, 568]]) {
  const p = await browser.newPage({viewport: {width: w, height: h}});
  const errs = []; p.on('pageerror', e => errs.push(String(e)));
  await p.goto(B + '/hello.html', {waitUntil: 'networkidle'}); await p.waitForTimeout(600);
  const a = await look(p);
  if (a.got !== true) fail(`${w} 처음엔 「상품권 받기」 칸이 숨어야 함`);
  if (/010-9011-7377/.test(a.text)) fail(`${w} 처음엔 번호가 안 보여야 함`);
  if (!/먼저 알려 드려요/.test(a.text) || !/상품권은 우주 영상 1분을 끝까지 본 분께만 드려요/.test(a.text)) fail(`${w} 약속 알림`, a.text.slice(0, 120));
  if (!/우주 영상 1분을 끝까지 봐 주세요/.test(a.text.replace(/\s+/g, ' '))) fail(`${w} 걸음 「영상을 끝까지」`);
  if (a.ctl || a.auto) fail(`${w} 영상에 기본 막대 · 저절로 틀기 없음`, JSON.stringify({ctl: a.ctl, auto: a.auto}));
  if (a.over) fail(`${w} 가로 넘침`);
  if (a.small.length) fail(`${w} 17px 아래 글`, a.small.join(', '));
  for (const t of a.taps) if (t.h < 48) fail(`${w} 단추 48px 아래`, `${t.t} ${t.h}px`);
  if (errs.length) fail(`${w} 쪽 오류`, errs.join(' | '));
  if (!fails.length) ok(`${w}×${h} 처음 모습(약속 · 걸음 넷 · 잠김 · 번호 숨김)`);
  await p.close();
}

{
  const p = await browser.newPage({viewport: {width: 390, height: 844}});
  const errs = []; p.on('pageerror', e => errs.push(String(e)));
  await p.goto(B + '/hello.html', {waitUntil: 'networkidle'});
  await p.locator('#hp-uplay').scrollIntoViewIfNeeded(); await p.locator('#hp-uplay').click();
  await p.waitForFunction(() => { const v = document.querySelector('#hp-uv'); return v && !v.paused && v.currentTime > 2; }, null, {timeout: 20000}).catch(() => fail('틀기 — 20초 안에 안 흐름'));
  const skip = await p.evaluate(async () => { const v = document.querySelector('#hp-uv'); v.currentTime = 50; await new Promise(r => setTimeout(r, 400)); return v.currentTime; });
  if (skip > 10) fail('건너뛰기가 막히지 않음', String(skip)); else ok('건너뛰기(50초로) 막힘 → ' + skip.toFixed(1) + '초');
  const rate = await p.evaluate(async () => { const v = document.querySelector('#hp-uv'); v.playbackRate = 4; await new Promise(r => setTimeout(r, 300)); return v.playbackRate; });
  if (rate !== 1) fail('빨리 감기가 막히지 않음', String(rate)); else ok('빨리 감기(4배) 막힘');
  const mid = await look(p);
  if (mid.got !== true) fail('보는 중에 「상품권 받기」가 나옴');
  const label = await p.locator('#hp-uplay').textContent();
  if (label !== '잠깐 멈추기') fail('보는 중 단추 글', label);
  await p.waitForFunction(() => document.querySelector('#hp-uv')?.ended === true, null, {timeout: 90000, polling: 500}).catch(() => fail('90초 안에 끝나지 않음'));
  await p.waitForTimeout(400);
  const end = await look(p);
  if (end.got !== false) fail('끝까지 봤는데 「상품권 받기」가 안 나옴', JSON.stringify(end.gift));
  if (!/010-9011-7377/.test(end.text) || !/상품권 받기/.test(end.text)) fail('끝난 뒤 번호 · 단추', end.text.slice(-200));
  if (!/끝까지 봐 주셔서 고마워요/.test(end.text)) fail('끝난 뒤 고마움 줄');
  if (!/^\d{4}-\d{2}-\d{2}$/.test(end.key ?? '')) fail('이 기기 표시(atlas:gift:seen)', String(end.key));
  if (!(end.gift?.watched >= 58.5)) fail('본 초', JSON.stringify(end.gift));
  for (const t of end.taps) if (t.h < 48) fail('끝난 뒤 단추 48px 아래', `${t.t} ${t.h}px`);
  if (!fails.length) ok(`끝까지 본 뒤 열림(본 초 ${end.gift?.watched}) · 번호 · 「상품권 받기」 · 고마움 줄`);
  await p.reload({waitUntil: 'networkidle'}); await p.waitForTimeout(500);
  const again = await look(p);
  if (again.got !== false || !/이 휴대폰에서 영상을 끝까지 봤어요/.test(again.text)) fail('다시 열면 바로 열려야 함', again.text.slice(-200)); else ok('다시 열면 바로 열림(또 보지 않음)');
  if (errs.length) fail('쪽 오류', errs.join(' | '));
  await p.close();
}

{
  const p = await browser.newPage({viewport: {width: 390, height: 844}});
  await p.goto(B + '/hello.html?lang=en', {waitUntil: 'networkidle'}); await p.waitForTimeout(2500);
  const en = await p.evaluate(() => ({t: document.querySelector('#hp-promo').innerText, bar: document.querySelector('.hp-pbar').textContent}));
  const han = (en.t + en.bar).match(/[가-힣]+/g) ?? [];
  if (han.length) fail('영어 팩 — 한글이 남음', han.slice(0, 8).join(' ')); else ok('영어 팩 — 상품권 칸 한글 0');
  await p.evaluate(() => { try { localStorage.removeItem('atlas:lang'); } catch {} });
  await p.close();
}
await browser.close();
const OUT = arg('--out', null);
if (OUT) { const fs = await import('node:fs/promises'); await fs.writeFile(OUT, JSON.stringify({schema: 'atlas11-check-gift-1', base: B, ok: !fails.length, fails}, null, 1)); } // 전체 검사가 쪽마다 남기는 결과(다른 검사와 같은 --out)
console.log(fails.length ? `실패 ${fails.length}` : '상품권 영상 검사 실패 0');
process.exit(fails.length ? 1 : 0);
