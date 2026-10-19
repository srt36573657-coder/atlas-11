#!/usr/bin/env node
// 테마 시계 쪽 맞대기 — 첫 화면 맨 위 칸(section.th-home) · #/t/… 열아홉 쪽 · 있는 쪽 맨 아래 「다음」 한 줄
//   사장님 2026-10-19(싱가포르) 16:06 「테마가 될 듯한 걸 찾아 주는 거야」 · 16:46 「물 흐르듯 … 다음다음다음 … 36장」 · 16:54 「이제 aaa7377.com에 올려 … 더 스마트한 내부 시스템」
//   셈 원본 = 결정표 docs/design/theme-2026-10-19/theme-engine.md(셈은 tests/atlas11/theme.test.mjs · 따로 세기 scratchpad recount) — 이 검사는 화면이 자료(/next/data/theme.json · theme-more.json)를 그대로 보이는지
//   쓰는 법: node scripts/atlas11/next/check_theme.mjs --base http://127.0.0.1:8826 [--pw /opt/node-tools/] [--out 결과.json]
//   ① 자료 꼴(차례 수 = 자리 수 · 합 = 업종 수) ② 첫 화면 칸(돌이 물음 뒤 · 줄 셋 = 싹 차례 앞 셋 · 답 줄 · 세 칸 · 성적표 숫자 · 기준 날)
//   ③ 「다음」 차례 — 인사에서 「다음」만 눌러 열여덟 번(→ #/why/<번호>) · 있는 쪽 다섯(관심 → 매매일지 → 보유종목 → 가짜 돈 → 진화 → 오늘 정리 → 첫 화면) · 앞 쪽(‹) 고리
//   ④ 숫자 = 자료(업종 쪽 점 넷 ✓ · 번짐 수 · 회사 열흘 %) ⑤ 두 폭(360 · 390) 가로 넘침 0 · 글 17px 넘게 · 누르는 자리 44px · 화면 오류 0 · 쓰지 않을 말 0
//   ⑥ 자료를 못 받으면 「?」 한 줄(첫 화면 · 쪽) — 화면이 죽지 않음
//   실패가 하나라도 있으면 끝 코드 1
import fs from 'node:fs/promises';
import fss from 'node:fs';
import {createRequire} from 'node:module';
import {screenHits} from '../../../site/next/words.js';
import {pp} from '../../../site/next/theme-engine.js';

const argv = process.argv.slice(2);
const arg = (k, d) => { const i = argv.indexOf(k); return i >= 0 && argv[i + 1] != null && !argv[i + 1].startsWith('--') ? argv[i + 1] : d; };
const require = createRequire(String(arg('--pw', process.env.PW_DIR || '/opt/node-tools/')).replace(/\/?$/, '/')); // check_white 와 같은 길(깃허브 실행기는 PW_DIR)
const {chromium} = require('playwright');
const base = arg('--base', 'http://127.0.0.1:8826').replace(/\/$/, ''), OUT = arg('--out', null), PAGE = base + '/next/';
const fails = [], counts = {}, t0 = Date.now();
const fail = (k, x) => { counts.fail = (counts.fail || 0) + 1; if (fails.length < 300) fails.push([k, String(x).slice(0, 300)]); console.log('걸림 ' + k + ' — ' + String(x).slice(0, 200)); };
const bump = (k, n = 1) => { counts[k] = (counts[k] || 0) + n; };
const getJ = async f => { for (let i = 0; i < 4; i++) { try { const r = await fetch(base + f, {cache: 'no-store'}); if (r.ok) return await r.json(); if (r.status === 404) return null; } catch { /* 다시 */ } await new Promise(r => setTimeout(r, 800 * (i + 1))); } return null; };
const enc = encodeURIComponent, num = n => Number(n).toLocaleString('ko-KR');
const MD = d => (+d.slice(5, 7)) + '월 ' + (+d.slice(8, 10)) + '일';

const [TH, TM] = await Promise.all([getJ('/next/data/theme.json'), getJ('/next/data/theme-more.json')]);
if (!TH || !TM) { console.error('테마 자료를 못 받음'); if (OUT) await fs.writeFile(OUT, JSON.stringify({ok: false, fails: [['자료', 'theme.json · theme-more.json']]})); process.exit(1); }
/* ① 자료 꼴 */
const Z = ['S', 'B', 'W', 'Q'], ind = new Map(TH.inds.map(i => [i.n, i]));
for (const z of Z) { if (TH.order[z].length !== TH.count[z]) fail('자료 차례 수', z + ' ' + TH.order[z].length + ' ≠ ' + TH.count[z]); if (TH.order[z].some(n => ind.get(n)?.z !== z)) fail('자료 차례 자리', z); }
if (Z.reduce((s, z) => s + TH.count[z], 0) !== TH.inds.length) fail('자료 합', '자리 합 ≠ 업종 수');
if (TH.count.real !== TH.inds.filter(i => i.z === 'S' && i.sc === 4).length) fail('자료 진짜 싹 수', TH.count.real);
for (const i of TH.inds) { if (!TM.inds[i.n]) fail('더 자료 없음', i.n); if (i.sc !== i.dots.filter(Boolean).length) fail('점 수', i.n); }
bump('자료');
const TOP = TH.order.S[0] ?? TH.order.B[0] ?? TH.inds[0].n, LEAD = TM.inds[TOP]?.top?.[0];
const I1 = ind.get(TOP);

const EXE = process.env.PW_CHROMIUM || '/opt/pw-browsers/chromium'; // 이 방은 미리 깔린 크로미움 · 깃허브 실행기는 playwright 가 깐 것(check_white 와 같음)
const browser = await chromium.launch({...(fss.existsSync(EXE) ? {executablePath: EXE} : {}), args: ['--disable-dev-shm-usage']});
async function open(hash, {w = 390, h = 844, routes = null} = {}) {
  const ctx = await browser.newContext({viewport: {width: w, height: h}, locale: 'ko-KR', timezoneId: 'Asia/Seoul'});
  if (routes) for (const [pat, fn] of routes) await ctx.route(pat, fn);
  const p = await ctx.newPage(); p._errs = []; p.on('pageerror', e => p._errs.push(String(e.message).slice(0, 160)));
  await p.goto(PAGE + hash, {waitUntil: 'domcontentloaded'});
  await settle(p);
  return {p, ctx};
}
const settle = async p => { await p.waitForFunction(() => !document.querySelector('#view .boot') && document.querySelector('#view')?.childElementCount > 0, null, {timeout: 20000}).catch(() => {}); await p.waitForTimeout(250); };
/** 화면 모양 잣대(⑤) — 가로 넘침 · 글 17px · 누르는 자리 44px · 쓰지 않을 말 */
const shape = p => p.evaluate(() => {
  const v = document.querySelector('#view'), out = {over: document.documentElement.scrollWidth - innerWidth, small: [], tap: [], text: v?.innerText ?? ''};
  const vis = e => { const r = e.getBoundingClientRect(); return r.width > 0 && r.height > 0 && getComputedStyle(e).visibility !== 'hidden'; };
  const w = document.createTreeWalker(v, NodeFilter.SHOW_TEXT);
  for (let n = w.nextNode(); n; n = w.nextNode()) { const el = n.parentElement; if (!n.textContent.trim() || !el || !vis(el)) continue; const fs = parseFloat(getComputedStyle(el).fontSize); if (fs < 16.95) out.small.push(n.textContent.trim().slice(0, 20) + ' ' + fs); }
  for (const a of v.querySelectorAll('a[href], button, summary')) { if (!vis(a)) continue; const r = a.getBoundingClientRect(); if (r.height < 43.5 || r.width < 43.5) out.tap.push((a.textContent || a.getAttribute('aria-label') || '').trim().slice(0, 20) + ' ' + Math.round(r.width) + '×' + Math.round(r.height)); }
  return out;
});
async function look(where, p) {
  const s = await shape(p);
  if (s.over > 0) fail('가로 넘침', where + ' ' + s.over + 'px');
  if (s.small.length) fail('17px 아래 글', where + ' ' + s.small.slice(0, 3).join(' | '));
  if (s.tap.length) fail('누르는 자리 44px 아래', where + ' ' + s.tap.slice(0, 3).join(' | '));
  const bad = screenHits(s.text); if (bad.length) fail('쓰지 않을 말', where + ' ' + bad.join(' · '));
  if (p._errs.length) fail('화면 오류', where + ' ' + p._errs.slice(0, 2).join(' | '));
  return s;
}
const nextOf = p => p.evaluate(() => { const a = [...document.querySelectorAll('#view a.th-next')]; return {n: a.length, href: a.at(-1)?.getAttribute('href') ?? null, title: a.at(-1)?.querySelector('b')?.textContent ?? a.at(-1)?.textContent ?? null}; });
const prevOf = p => p.evaluate(() => document.querySelector('#view a.th-back')?.getAttribute('href') ?? null);
const noOf = p => p.evaluate(() => document.querySelector('#view .th-no b')?.textContent ?? null);

try {
  /* ② 첫 화면 칸 */
  {
    const {p, ctx} = await open('#/');
    await p.waitForFunction(() => document.querySelector('#view section.th-home .th-row, #view section.th-home .empty'), null, {timeout: 20000}).catch(() => {});
    const g = await p.evaluate(() => {
      const v = document.querySelector('#view'), box = v.querySelector('section.th-home'), say = v.querySelector('div.w-say'), ess = v.querySelector('section.ess');
      return {box: !!box, afterSay: !!(box && say && (say.compareDocumentPosition(box) & Node.DOCUMENT_POSITION_FOLLOWING)), beforeEss: !!(box && ess && (box.compareDocumentPosition(ess) & Node.DOCUMENT_POSITION_FOLLOWING)),
        rows: [...(box?.querySelectorAll('a.th-row') ?? [])].map(a => ({href: a.getAttribute('href'), name: a.querySelector('.th-rn')?.textContent})), ans: box?.querySelector('.th-ans')?.textContent ?? '',
        three: [...(box?.querySelectorAll('.th-three p') ?? [])].map(x => x.textContent), rec: box?.querySelector('.th-rec')?.textContent ?? '', asof: box?.querySelector('.th-asof')?.textContent ?? '',
        next: box?.querySelector('a.th-next')?.getAttribute('href') ?? null, more: box?.querySelector('a.th-more')?.getAttribute('href') ?? null, clock: !!box?.querySelector('svg.th-clock'), h1: v.querySelector('h1')?.textContent ?? ''};
    });
    if (!g.box) fail('첫 화면', '테마 시계 칸(section.th-home)이 없음');
    else {
      if (!g.afterSay || !g.beforeEss) fail('첫 화면 차례', '돌이 물음 → 테마 시계 → 본질 카드 차례가 아님');
      if (!/테마 시계/.test(g.h1)) fail('첫 화면 제목', g.h1);
      if (!g.clock) fail('첫 화면 시계 그림', '없음');
      const want = TH.order.S.slice(0, 3);
      if (JSON.stringify(g.rows.map(r => r.name)) !== JSON.stringify(want)) fail('첫 화면 줄 셋', g.rows.map(r => r.name).join(' · ') + ' ≠ ' + want.join(' · '));
      if (g.rows.some(r => r.href !== '#/t/i/' + enc(r.name))) fail('첫 화면 줄 고리', g.rows.map(r => r.href).join(' '));
      const ansWant = TH.count.real ? '진짜 싹 ' + num(TH.count.real) + '곳' : '지금은 진짜 싹이 없어요';
      if (g.ans.trim() !== ansWant) fail('첫 화면 답 줄', g.ans + ' ≠ ' + ansWant);
      const tw = [num(TH.count.real) + '곳진짜 싹', num(TH.count.fresh) + '곳새로 들어옴', num(TH.count.S) + '곳싹 자리'];
      if (JSON.stringify(g.three) !== JSON.stringify(tw)) fail('첫 화면 세 칸', g.three.join(' | '));
      const R = TH.record;
      if (R.more && !(g.rec.includes(`100번 가운데 ${Math.round(R.real.p)}번`) && g.rec.includes(`100번 가운데 ${Math.round(R.all.p)}번이었어요`))) fail('성적표 숫자', g.rec);
      if (!R.more && !g.rec.includes('차이가 없었어요')) fail('성적표 차이 없음 글', g.rec);
      if (!g.asof.startsWith(MD(TH.asOf))) fail('기준 날', g.asof + ' ≠ ' + MD(TH.asOf));
      if (g.next !== '#/t/how') fail('첫 화면 다음', g.next);
      if (g.more !== '#/t/sprout') fail('싹 자리 모두 보기 고리', g.more);
    }
    await look('#/', p); bump('첫 화면'); await ctx.close();
  }
  /* ③ 「다음」 차례 — 인사부터 열여덟 번 */
  const ib = '#/t/i/' + enc(TOP), cb = LEAD ? '#/t/c/' + LEAD.c : null;
  const CHAIN = ['#/t/hello', '#/', '#/t/how', '#/t/sprout', '#/t/bloom', '#/t/wilt', ib, ib + '/path', ib + '/spread', ib + '/big', ib + '/co', ib + '/near',
    ...(cb ? [cb, cb + '/lead', cb + '/why', cb + '/rank', cb + '/unknown', cb + '/keep', '#/why/' + LEAD.c] : ['#/'])];
  const NO = {'#/t/hello': 1, '#/t/how': 3, '#/t/sprout': 4, '#/t/bloom': 5, '#/t/wilt': 6};
  {
    const {p, ctx} = await open(CHAIN[0]);
    for (let k = 0; k < CHAIN.length - 1; k++) {
      const here = CHAIN[k];
      if (here !== '#/') {
        const nx = await nextOf(p), no = await noOf(p), pv = await prevOf(p);
        if (nx.n !== 1) fail('다음 단추 수', here + ' ' + nx.n);
        if (nx.href !== CHAIN[k + 1]) fail('다음 차례', here + ' → ' + nx.href + ' (바람 ' + CHAIN[k + 1] + ')');
        const wantNo = NO[here] ?? (k <= 11 ? k + 1 : k + 1); if (no !== String(wantNo)) fail('쪽 번호', here + ' ' + no + ' ≠ ' + wantNo);
        if (k > 0 && pv !== CHAIN[k - 1] && !(k === 6 && pv === '#/t/wilt')) fail('앞 쪽 고리', here + ' ‹ ' + pv + ' (바람 ' + CHAIN[k - 1] + ')');
        await look(here, p);
      }
      const want = CHAIN[k + 1];
      await p.evaluate(h => { const a = location.hash === '#/' || location.hash === '' ? document.querySelector('#view section.th-home a.th-next') : [...document.querySelectorAll('#view a.th-next')].at(-1); if (a) a.click(); else location.hash = h; }, want);
      await p.waitForFunction(w => location.hash === w || decodeURIComponent(location.hash) === decodeURIComponent(w), want, {timeout: 8000}).catch(() => {});
      await settle(p);
      const at = await p.evaluate(() => location.hash);
      if (decodeURIComponent(at) !== decodeURIComponent(want)) { fail('다음 눌러 감', CHAIN[k] + ' → ' + at + ' (바람 ' + want + ')'); break; }
      bump('다음 차례');
    }
    await ctx.close();
  }
  /* 있는 쪽 맨 아래 「다음」 한 줄 · 오늘 정리 */
  for (const [from, to] of [['#/sub', '#/why'], ['#/why', '#/me'], ['#/me', '#/game'], ['#/game', '#/jinhwa'], ['#/jinhwa', '#/t/today'], ['#/t/today', '#/']]) {
    const {p, ctx} = await open(from);
    await p.waitForFunction(() => document.querySelector('#view a.th-next'), null, {timeout: 8000}).catch(() => {});
    const nx = await nextOf(p);
    if (nx.n !== 1 || nx.href !== to) fail('있는 쪽 다음', from + ' → ' + nx.href + ' ×' + nx.n + ' (바람 ' + to + ')');
    if (from === '#/t/today') await look(from, p); else if (p._errs.length) fail('화면 오류', from + ' ' + p._errs[0]);
    bump('있는 쪽 다음'); await ctx.close();
  }
  /* ④ 숫자 = 자료 */
  {
    const {p, ctx} = await open(ib);
    const s = await p.evaluate(() => ({ck: [...document.querySelectorAll('#view .th-ck > b')].map(b => b.textContent), ans: document.querySelector('#view .th-ans')?.textContent ?? ''}));
    if (JSON.stringify(s.ck) !== JSON.stringify(I1.dots.map(d => (d ? '✓' : '✗')))) fail('업종 점 넷', TOP + ' ' + s.ck.join('') + ' ≠ ' + I1.dots.join(''));
    if (s.ans !== '점 넷 가운데 ' + I1.sc + '개') fail('업종 점 수 줄', s.ans);
    await ctx.close();
    const q = await open(ib + '/spread');
    const sp = await q.p.evaluate(() => ({ans: document.querySelector('#view .th-ans')?.textContent ?? '', bars: document.querySelectorAll('#view svg.th-bars rect').length}));
    if (sp.ans !== `${num(I1.tot)}곳 가운데 ${num(I1.up)}곳`) fail('번짐 수', sp.ans);
    if (sp.bars !== I1.sp.length) fail('번짐 막대 수', sp.bars + ' ≠ ' + I1.sp.length);
    await q.ctx.close();
    if (LEAD) {
      const r = await open(cb);
      const t = await r.p.evaluate(() => document.querySelector('#view .th-ans')?.textContent ?? '');
      if (t !== '열흘 동안 ' + pp(LEAD.d10) + '%') fail('회사 열흘', t + ' ≠ ' + pp(LEAD.d10));
      await r.ctx.close();
    }
    bump('숫자');
  }
  /* ⑤ 두 폭 — 남은 쪽들 */
  for (const w of [360, 320]) for (const hsh of ['#/', '#/t/how', '#/t/sprout', ib, ib + '/co', ib + '/near', ...(cb ? [cb + '/lead', cb + '/why', cb + '/rank'] : []), '#/t/today']) {
    const {p, ctx} = await open(hsh, {w, h: 640}); await look(hsh + ' @' + w, p); bump('폭'); await ctx.close();
  }
  /* ⑥ 자료를 못 받으면 「?」 */
  {
    const no = [['**/next/data/theme*.json*', r => r.fulfill({status: 404, body: 'x'})]];
    const a = await open('#/', {routes: no});
    const t = await a.p.evaluate(() => document.querySelector('#view section.th-home')?.textContent ?? '');
    if (!/^\? 테마 시계 자료를 받지 못했어요/.test(t.trim())) fail('자료 없을 때 첫 화면', t.slice(0, 60));
    if (a.p._errs.length) fail('자료 없을 때 화면 오류', a.p._errs[0]);
    await a.ctx.close();
    const b = await open('#/t/how', {routes: no});
    const u = await b.p.evaluate(() => document.querySelector('#view .empty')?.textContent ?? '');
    if (!/^\? 테마 시계 자료를 받지 못했어요/.test(u)) fail('자료 없을 때 쪽', u.slice(0, 60));
    await b.ctx.close();
    bump('자료 없음');
  }
} finally { await browser.close(); }

const ok = !fails.length;
console.log((ok ? '통과' : '걸림 ' + fails.length) + ' · ' + Object.entries(counts).map(([k, v]) => k + ' ' + v).join(' · ') + ' · ' + Math.round((Date.now() - t0) / 1000) + '초');
if (OUT) await fs.writeFile(OUT, JSON.stringify({ok, at: new Date().toISOString(), base, counts, fails}, null, 1));
process.exit(ok ? 0 : 1);
