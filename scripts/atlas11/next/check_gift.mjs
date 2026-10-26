// 상품권 앞 「우주 영상 1분」 검사 — 두 곳(앱 안 상품권 방 #/gift · 소개 한 장 hello.html) · 진짜 1분을 두 곳에서 함께 끝까지 틀어 봄(약 90초)
//   사장님 2026-10-22(서울) 01:49 「… 마오는영상 1붘을 봐야 그게 정당해 그게 고지 해야고 그약솓 지켜야 상품권 받기 그때 나오게 해 그리고 정말쉽개 안내해야해
//   사람들에 1분 우리에게 투자하는것 서로 존중해야 잖아」 · 01:59 「맞아」 — docs/design/gift-2026-10-22/order-0149.txt
//   03:38 「상품권 받는곳이 사용자자 이용많이 한 곳에 있어야 해 구글과 잡스라면 어떻개 하겠어 그렇게해」 — order-0338.txt(모든 쪽 위 막대 금빛 선물 단추 → 앱 안 상품권 방)
//   보는 것: ① 모든 쪽 위 막대에 금빛 선물 단추(48px · #/gift · 320 폭 넘침 0) → 누르면 상품권 방 ② 두 곳 처음 = 약속 알림 · 걸음 · 「상품권 받기」 · 번호 숨김 · 건너뛸 막대 없음 · 가로 넘침 없음 · 글씨 17px 위 · 단추 48px 위
//            ③ 틀기 → 건너뛰기(50초로) 막힘 · 빨리 감기(4배) 막힘 ④ 끝까지 → 「상품권 받기」 · 전화번호 칸(문자 · 전화 번호 없음) · 고마움 줄 · 이 기기 표시 ⑤ 다시 열면 바로 열림 · 다른 곳도 함께 열림 ⑥ 영어 팩이면 한글 없음
//            총정리(2026-10-22 D6 · D7) — 상품권 방 약속 칸 바로 밑 「지금 할 일 · 친구 3명에게 소개해요 ↓」(48px · 320 × 568 첫 화면 안 · 누르면 「친구에게 보내기」에 초점) · 다 본 뒤 「영상을 끝까지 봤어요 · 상품권 받기 ↓」
//   node scripts/atlas11/next/check_gift.mjs [--base http://127.0.0.1:8826] [--path /next/] [--pw /tmp/pw/] [--out 결과.json]  (scripts/atlas11/invite_dev.mjs --dir site 가 떠 있어야 함 · 깃허브 전체 검사도 이 꼴로 부름)
import {createRequire} from 'node:module';

const arg = (k, d) => { const i = process.argv.indexOf(k); return i > 0 && process.argv[i + 1] != null && !process.argv[i + 1].startsWith('--') ? process.argv[i + 1] : d; };
const require = createRequire(String(arg('--pw', process.env.PW_DIR || '/opt/node-tools/')).replace(/\/?$/, '/')); // 깃허브 전체 검사는 PW_DIR · PW_EXE(다른 검사와 같은 길)
const {chromium} = require('playwright');
const B = String(arg('--base', 'http://127.0.0.1:8826')).replace(/\/$/, '');
const NEXT = arg('--path', /127\.0\.0\.1|localhost/.test(B) ? '/next/' : '/'); // 시험 서버 = /next/ · 진짜 사이트 = /
const fails = [], fail = (m, x = '') => { fails.push(m + (x ? ' — ' + x : '')); console.log('✗ ' + m, x); }, ok = m => console.log('✓ ' + m);
const EXE = process.env.PW_EXE || (process.env.PW_DIR ? null : '/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell');
const browser = await chromium.launch({...(EXE ? {executablePath: EXE} : {}), args: ['--autoplay-policy=user-gesture-required']});

/* 두 곳 — 같은 셈(/next/gift-rule.js) · 같은 이 기기 표시(atlas:gift:seen) · 다른 그림(앱 칸 · 소개 쪽 칸) */
const P = {
  app: {name: '상품권 방', url: NEXT + '#/gift', sec: '#view .gf', v: '#view .gf-uv', play: '#view .gf-play', got: '#view .gf-got', steps: 3, stepRe: /우주 영상 1분을 끝까지 봐요/},
  hello: {name: '소개 쪽', url: '/hello.html', sec: '#hp-promo', v: '#hp-uv', play: '#hp-uplay', got: '#hp-got', steps: 4, stepRe: /우주 영상 1분을 끝까지 봐 주세요/}
};
const look = (p, q) => p.evaluate(q => {
  const sec = document.querySelector(q.sec), v = document.querySelector(q.v), got = document.querySelector(q.got);
  if (!sec || !v || !got) return {missing: [!sec && q.sec, !v && q.v, !got && q.got].filter(Boolean)};
  const small = [...sec.querySelectorAll('*')].filter(e => e.childElementCount === 0 && e.textContent.trim() && e.offsetParent !== null && parseFloat(getComputedStyle(e).fontSize) < 17).map(e => e.className || e.tagName);
  const taps = [...sec.querySelectorAll('a, button')].filter(e => e.offsetParent !== null).map(e => ({t: e.textContent.trim(), h: Math.round(e.getBoundingClientRect().height)}));
  return {text: sec.innerText, got: got.hidden, ctl: v.controls, auto: v.autoplay, over: document.documentElement.scrollWidth > window.innerWidth, small, taps, steps: sec.querySelectorAll('ol li').length,
    gift: globalThis.__gift ?? null, key: (() => { try { return localStorage.getItem('atlas:gift:seen'); } catch { return 'x'; } })()};
}, q);
const openAt = async (ctx, url, w = 390, h = 844) => {
  const p = await ctx.newPage(); await p.setViewportSize({width: w, height: h});
  const errs = []; p.on('pageerror', e => errs.push(String(e))); p.errs = errs;
  await p.goto(B + url, {waitUntil: 'networkidle'}); await p.waitForTimeout(900); return p;
};

/* ① 모든 쪽 위 막대 금빛 선물 단추 → 상품권 방(첫 화면 · 매매일지 쪽에서) */
for (const [w, h] of [[390, 844], [320, 568]]) for (const r of ['#/', '#/why']) {
  const ctx = await browser.newContext(), p = await openAt(ctx, NEXT + r, w, h);
  await p.waitForSelector('#giftBtn', {timeout: 20000}).catch(() => {});
  const g = await p.evaluate(() => { const a = document.querySelector('#giftBtn'); if (!a) return null; const r = a.getBoundingClientRect(), lg = document.querySelector('.top .logo'); return {href: a.getAttribute('href'), w: Math.round(r.width), h: Math.round(r.height), top: Math.round(r.top), inTop: !!a.closest('header.top'), label: a.getAttribute('aria-label') || '', logoCut: lg ? lg.scrollWidth > lg.clientWidth + 1 : null, over: document.documentElement.scrollWidth > innerWidth}; });
  if (!g) fail(`${w} ${r} 위 막대 금빛 선물 단추 없음`);
  else {
    if (g.href !== '#/gift' || g.w < 48 || g.h < 48 || !g.inTop || g.top > 80 || g.logoCut || g.over || !/상품권/.test(g.label)) fail(`${w} ${r} 위 막대 선물 단추(48px · #/gift · 이름 칸 안 잘림 · 넘침 0)`, JSON.stringify(g));
    await p.click('#giftBtn'); await p.waitForTimeout(1500);
    const at = await p.evaluate(() => ({hash: location.hash, h1: document.querySelector('#view h1')?.textContent?.trim() ?? '', gf: !!document.querySelector('#view .gf'), cur: document.querySelector('#giftBtn')?.getAttribute('aria-current')}));
    if (at.hash !== '#/gift' || !at.gf || at.h1 !== '상품권' || at.cur !== 'page') fail(`${w} ${r} 선물 단추를 누르면 상품권 방`, JSON.stringify(at)); else ok(`${w}×${h} ${r} 위 막대 금빛 선물 단추 → 한 번에 상품권 방(${g.w}×${g.h})`);
  }
  if (p.errs.length) fail(`${w} ${r} 쪽 오류`, p.errs.join(' | '));
  await ctx.close();
}

/* ② 두 곳 처음 모습 */
for (const [k, q] of Object.entries(P)) for (const [w, h] of [[390, 844], [320, 568]]) {
  const ctx = await browser.newContext(), p = await openAt(ctx, q.url, w, h);
  await p.waitForSelector(q.sec, {timeout: 20000}).catch(() => {});
  const a = await look(p, q), n0 = fails.length;
  if (a.missing) { fail(`${q.name} ${w} 칸 없음`, a.missing.join(' ')); await ctx.close(); continue; }
  if (a.got !== true) fail(`${q.name} ${w} 처음엔 「상품권 받기」 칸이 숨어야 함`);
  if (/010-9011-7377/.test(a.text)) fail(`${q.name} ${w} 처음엔 번호가 안 보여야 함`);
  if (!/먼저 알려 드려요/.test(a.text) || !/상품권은 우주 영상 1분을 끝까지 본 분께만 드려요/.test(a.text)) fail(`${q.name} ${w} 약속 알림`, a.text.slice(0, 120));
  if (!q.stepRe.test(a.text.replace(/\s+/g, ' '))) fail(`${q.name} ${w} 걸음 「영상을 끝까지」`);
  if (a.steps !== q.steps) fail(`${q.name} ${w} 걸음 수`, `${a.steps} ≠ ${q.steps}`);
  if (a.ctl || a.auto) fail(`${q.name} ${w} 영상에 기본 막대 · 저절로 틀기 없음`, JSON.stringify({ctl: a.ctl, auto: a.auto}));
  if (a.over) fail(`${q.name} ${w} 가로 넘침`);
  if (a.small.length) fail(`${q.name} ${w} 17px 아래 글`, a.small.join(', '));
  for (const t of a.taps) if (t.h < 48) fail(`${q.name} ${w} 단추 48px 아래`, `${t.t} ${t.h}px`);
  if (k === 'app') { // 맨 위 결(총정리 2026-10-22 D6 · D7) — 약속 칸 바로 밑 「지금 할 일 · … ↓」 · 48px · 첫 화면 안(320 × 568 도) · 누르면 그 걸음 첫 단추에 초점
    const nw = await p.evaluate(() => { const b = document.querySelector('#view .gf-now'); if (!b) return null; const r = b.getBoundingClientRect(), tabs = document.querySelector('.tabs')?.getBoundingClientRect().top ?? innerHeight;
      return {t: b.textContent.trim(), afterVow: !!b.previousElementSibling?.classList.contains('gf-vow'), beforeSteps: !!b.nextElementSibling?.classList.contains('gf-steps'), h: Math.round(r.height), inFirst: r.bottom <= tabs + 0.5}; });
    if (!nw || nw.t !== '지금 할 일 · 친구 3명에게 소개해요 ↓' || !nw.afterVow || !nw.beforeSteps || nw.h < 48 || !nw.inFirst) fail(`${q.name} ${w} 맨 위 결 「지금 할 일」 단추(약속 칸 바로 밑 · 48px · 첫 화면 안)`, JSON.stringify(nw));
    else { await p.click('#view .gf-now'); await p.waitForTimeout(700); const f = await p.evaluate(() => document.activeElement?.textContent?.trim() ?? ''); if (f !== '카톡 보내기') fail(`${q.name} ${w} 「지금 할 일」을 누르면 걸음 1 「카톡 보내기」에 초점(2026-10-25 「진짜모든곳에」 — 옛 「친구에게 보내기」)`, f); }
  }
  if (p.errs.length) fail(`${q.name} ${w} 쪽 오류`, p.errs.join(' | '));
  if (fails.length === n0) ok(`${q.name} ${w}×${h} 처음 모습(약속 · 걸음 ${q.steps} · 잠김 · 번호 숨김${k === 'app' ? ' · 맨 위 「지금 할 일」' : ''})`);
  await ctx.close();
}

/* ③ ④ 두 곳에서 함께 진짜 1분 — 건너뛰기 · 빨리 감기 막힘 · 끝까지 → 열림 · 이 기기 표시 */
async function watch(k) {
  const q = P[k], ctx = await browser.newContext(), p = await openAt(ctx, q.url);
  await p.waitForSelector(q.play, {timeout: 20000}).catch(() => {});
  await p.locator(q.play).first().scrollIntoViewIfNeeded(); await p.locator(q.play).first().click();
  await p.waitForFunction(sel => { const v = document.querySelector(sel); return v && !v.paused && v.currentTime > 2; }, q.v, {timeout: 20000}).catch(() => fail(`${q.name} 틀기 — 20초 안에 안 흐름`));
  const skip = await p.evaluate(async sel => { const v = document.querySelector(sel); v.currentTime = 50; await new Promise(r => setTimeout(r, 400)); return v.currentTime; }, q.v);
  if (skip > 10) fail(`${q.name} 건너뛰기가 막히지 않음`, String(skip)); else ok(`${q.name} 건너뛰기(50초로) 막힘 → ${skip.toFixed(1)}초`);
  const rate = await p.evaluate(async sel => { const v = document.querySelector(sel); v.playbackRate = 4; await new Promise(r => setTimeout(r, 300)); return v.playbackRate; }, q.v);
  if (rate !== 1) fail(`${q.name} 빨리 감기가 막히지 않음`, String(rate)); else ok(`${q.name} 빨리 감기(4배) 막힘`);
  const mid = await look(p, q);
  if (mid.got !== true) fail(`${q.name} 보는 중에 「상품권 받기」가 나옴`);
  const label = (await p.locator(q.play).first().textContent()).trim();
  if (label !== '잠깐 멈추기') fail(`${q.name} 보는 중 단추 글`, label);
  await p.waitForFunction(sel => document.querySelector(sel)?.ended === true, q.v, {timeout: 95000, polling: 500}).catch(() => fail(`${q.name} 95초 안에 끝나지 않음`));
  await p.waitForTimeout(400);
  const end = await look(p, q), n0 = fails.length;
  if (end.got !== false) fail(`${q.name} 끝까지 봤는데 「상품권 받기」가 안 나옴`, JSON.stringify(end.gift));
  // 끝난 뒤(사장님 2026-10-25 13:40 「편지를 보내지 않아도 … 세 명을 보냈다 라는 걸 알 수 있게끔」 · 13:38 「내가 직접 보낼 거야」) — 문자 · 전화 번호 대신 상품권 방 = 전화번호 칸 + 동의 + 「상품권 받기」 · 소개 쪽 = 「상품권 받기」 → /#/gift
  const fin = k === 'app'
    ? await p.evaluate(() => ({claim: document.querySelector('#view .gf-claim')?.textContent?.trim() ?? '', formHidden: !!document.querySelector('#view .gf-form')?.hidden, callHidden: !!document.querySelector('#view .gf-callbox')?.hidden, sms: document.querySelectorAll('#view a[href^="sms:"], #view a[href^="tel:"]').length}))
    : await p.evaluate(() => ({go: document.querySelector('.hp-sms')?.getAttribute('href') ?? '', sms: document.querySelectorAll('a[href^="sms:"], a[href^="tel:"]').length}));
  // 2026-10-26 16:14 「… 상푸권 주세요 버튼 만들어그렣게 반자동으로 해놓아」 · 16:16 「일단 내 번호 남겨」 — 상품권 방 = 「상품권 주세요」 한 단추(번호 칸 · 예전 전화번호 칸은 숨김) · 친구가 모자란 기기는 눌러도 번호가 안 나옴
  if (/010-9011-7377|010-0000-0000/.test(end.text) || !(k === 'app' ? /상품권 주세요/ : /상품권 받기/).test(end.text) || fin.sms || (k === 'app' ? !(fin.claim === '상품권 주세요' && fin.formHidden && fin.callHidden) : fin.go !== '/#/gift')) fail(`${q.name} 끝난 뒤 전화번호 칸 · 동의 · 「상품권 받기」(문자 · 전화 번호 없음)`, JSON.stringify(fin) + ' ' + end.text.slice(-160));
  if (!/끝까지 봐 주셔서 고마워요/.test(end.text)) fail(`${q.name} 끝난 뒤 고마움 줄`);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(end.key ?? '')) fail(`${q.name} 이 기기 표시(atlas:gift:seen)`, String(end.key));
  if (!(end.gift?.watched >= 58.5)) fail(`${q.name} 본 초`, JSON.stringify(end.gift));
  for (const t of end.taps) if (t.h < 48) fail(`${q.name} 끝난 뒤 단추 48px 아래`, `${t.t} ${t.h}px`);
  if (k === 'app') { // 친구가 없는 기기 — 「상품권 주세요」를 눌러도 번호 · 문자 고리가 안 나오고 「n명 더 열면」 한 줄만
    await p.click('#view .gf-claim'); await p.waitForTimeout(1500);
    const pr = await p.evaluate(() => ({res: document.querySelector('#view .gf-res')?.textContent?.trim() ?? '', call: !document.querySelector('#view .gf-callbox')?.hidden, sms: document.querySelectorAll('#view a[href^="sms:"]').length, text: document.querySelector('#view .gf')?.innerText ?? ''}));
    if (pr.call || pr.sms || /010-\d{4}-\d{4}/.test(pr.text.replace('010-1234-5678', '')) || !/명 더 열면/.test(pr.res)) fail(`${q.name} 친구가 모자란 기기 — 「상품권 주세요」를 눌러도 번호가 안 나와야 함`, JSON.stringify({res: pr.res, call: pr.call, sms: pr.sms}));
    else ok(`${q.name} 친구가 모자란 기기 — 눌러도 번호 숨김 · 「${pr.res}」`);
  }
  if (k === 'app') { const nt = await p.evaluate(() => document.querySelector('#view .gf-now')?.textContent?.trim() ?? ''); if (nt !== '영상을 끝까지 봤어요 · 상품권 주세요 ↓') fail(`${q.name} 끝난 뒤 맨 위 결 단추 글(총정리 D7)`, nt); }
  if (fails.length === n0) ok(`${q.name} 끝까지 본 뒤 열림(본 초 ${end.gift?.watched}) · ${k === 'app' ? '「상품권 주세요」 · 번호 숨김' : '상품권 방 고리 · 「상품권 받기」'} · 고마움 줄`);
  await p.reload({waitUntil: 'networkidle'}); await p.waitForTimeout(900);
  const again = await look(p, q);
  if (again.got !== false || !/이 휴대폰에서 영상을 끝까지 봤어요/.test(again.text)) fail(`${q.name} 다시 열면 바로 열려야 함`, String(again.text).slice(-200)); else ok(`${q.name} 다시 열면 바로 열림(또 보지 않음)`);
  const other = k === 'app' ? 'hello' : 'app', o = await openAt(ctx, P[other].url); await o.waitForSelector(P[other].got, {state: 'attached', timeout: 20000}).catch(() => {});
  const ol = await look(o, P[other]);
  if (ol.got !== false) fail(`${q.name}에서 다 보면 ${P[other].name}도 열려야 함`); else ok(`${q.name}에서 다 보면 ${P[other].name}도 함께 열림`);
  if (p.errs.length || o.errs.length) fail(`${q.name} 쪽 오류`, [...p.errs, ...o.errs].join(' | '));
  await ctx.close();
}
await Promise.all([watch('app'), watch('hello')]);

/* ⑥ 영어 팩 — 두 곳 칸 안 한글 0 */
for (const [k, q] of Object.entries(P)) {
  const ctx = await browser.newContext(), p = await openAt(ctx, k === 'app' ? NEXT + '?lang=en#/gift' : '/hello.html?lang=en');
  await p.waitForTimeout(2000);
  const en = await p.evaluate(sel => (document.querySelector(sel)?.innerText ?? '') + (document.querySelector('.hp-pbar')?.textContent ?? ''), q.sec);
  const han = en.match(/[가-힣]+/g) ?? [];
  if (!en) fail(`${q.name} 영어 팩 — 칸 없음`); else if (han.length) fail(`${q.name} 영어 팩 — 한글이 남음`, han.slice(0, 8).join(' ')); else ok(`${q.name} 영어 팩 — 상품권 칸 한글 0`);
  await ctx.close();
}
await browser.close();
const OUT = arg('--out', null);
if (OUT) { const fs = await import('node:fs/promises'); await fs.writeFile(OUT, JSON.stringify({schema: 'atlas11-check-gift-1', base: B, ok: !fails.length, fails}, null, 1)); } // 전체 검사가 쪽마다 남기는 결과(다른 검사와 같은 --out)
console.log(fails.length ? `실패 ${fails.length}` : '상품권 영상 검사 실패 0');
process.exit(fails.length ? 1 : 0);
