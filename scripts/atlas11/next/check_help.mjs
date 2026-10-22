// 고객센터 쪽 검사(#/help · site/next/p-help.js · /api/help — lib/atlas11/help.mjs)
//   사장님 2026-10-21(서울) 22:54 · 22:55 「피드백 남기는 공간이랑 QA남기는공간 고객센터 안내 공간이 있으면 좋울것 같아 … 섹시하게 만들어」 · 23:05 말투 둘 · 23:09 「아 해 섹시하게」
//   쓰는 법: node scripts/atlas11/next/check_help.mjs --base http://127.0.0.1:8826 [--pw /opt/node-tools/] [--out 결과.json]
//     다른 쪽 검사와 같은 꼴(--all · --limit · --shard 를 받음 — 이 검사는 짧아서 늘 모두 돎) · 사장님 열쇠 = 환경 ATLAS_DEV_OWNER_KEY(없고 127.0.0.1 이면 시험 서버 열쇠 testowner-key-1234567890)
//   ① 세 폭(320 · 360 · 390) + 320 「아주 크게」 — 문 셋을 차례로 열어: 가로 넘침 0 · 글 17px 넘게 · 누르는 것 48 × 48 넘게 · 화면 오류 0 · 쓰지 않을 말 0(사람이 쓴 글 lang="ko" 빼고) · 모양 규칙(pageRules)
//   ② 길(390): 열기만 하면 이 기기에 아무것도 안 남김 → 한마디(안 돼요) 보내기 → 앵무새 돌이가 들은 말을 그대로 따라 말함(2026-10-22 01:22 「사람들에게 감동을 줘」) → 연락처 꼴은 막음(서버에 안 감) → 물음 보내기 → 「내가 남긴 글」에 「답을 기다려요」
//      → 사장님 열쇠로 답 · 모두에게 보이기 → 그 기기에 답 · 「많이 묻는 것」에 올라옴 → 지우기 두 번 → 서버에서 사라짐 → 곧은 말 단추 → 글이 곧은 말로 · 기억
//      → 사장님 화면(#/admin)에 「고객센터 글」 · 열쇠 없는 기기는 /api/help/all 403
//      · 총정리(2026-10-22) — 맨 위 결 단추 「답을 기다려요 · 1개 ›」 → 답이 오면 「답이 왔어요 · 1개 ›」 → 누르면 내 글로 · 다 지우면 단추 없음(D1) · 많이 묻는 것 첫 물음 = 본질 1(D4) · #/help/ask 로 바로 열면 그 문이 맨 위(D2)
//   ③ 영어(?lang=en) — 쉬운 말 · 곧은 말 두 벌로 문 셋 · 안내 안 남은 한글 0(사람이 쓴 글 lang="ko" 빼고) · 맨 아래 「고객센터」 고리도 영어
//   실패가 하나라도 있으면 끝 코드 1(결과 파일은 --out 을 줄 때만)
import fs from 'node:fs/promises';
import {createRequire} from 'node:module';
import {screenHits} from '../../../site/next/words.js';
import {pageRules} from './page_rules.mjs';
import {NAME, josa} from '../../../site/next/brand.js'; // 이름은 한 곳(규칙 76)

const argv = process.argv.slice(2);
const arg = (k, d) => { const i = argv.indexOf(k); return i >= 0 && argv[i + 1] != null && !argv[i + 1].startsWith('--') ? argv[i + 1] : d; };
const require = createRequire(String(arg('--pw', process.env.PW_DIR || '/opt/node-tools/')).replace(/\/?$/, '/'));
const {chromium} = require('playwright');
const base = String(arg('--base', 'http://127.0.0.1:8826')).replace(/\/$/, ''), OUT = arg('--out', null);
const LOCAL = /^https?:\/\/(127\.0\.0\.1|localhost)(:\d+)?$/.test(base);
const KEY = process.env.ATLAS_DEV_OWNER_KEY || (LOCAL ? 'testowner-key-1234567890' : null);
const R = {schema: 'golttori-check-help-1', at: new Date().toISOString(), base, counts: {pass: 0, fail: 0}, fails: [], m: {}};
const check = (ok, name, why = '') => { if (ok) R.counts.pass++; else { R.counts.fail++; R.fails.push([name, String(why).slice(0, 300)]); console.log('실패', name, why ? '— ' + String(why).slice(0, 300) : ''); } };
const URL_OF = (hash, q = '') => `${base}/next/?v=${Date.now()}${q}${hash}`;

const browser = await chromium.launch(process.env.PW_EXE ? {executablePath: process.env.PW_EXE} : {});
const ctxOf = async (w, {font = 0, en = false} = {}) => {
  const ctx = await browser.newContext({viewport: {width: w, height: 760}, deviceScaleFactor: 1, isMobile: true, hasTouch: true, locale: en ? 'en-US' : 'ko-KR', timezoneId: 'Asia/Seoul', reducedMotion: 'reduce'});
  await ctx.addInitScript(([f]) => { try { if (sessionStorage.getItem('hp-seed')) return; sessionStorage.setItem('hp-seed', '1'); localStorage.setItem('atlas:essence-seen', 'true'); localStorage.setItem('atlas:white-seen', 'true'); if (f) localStorage.setItem('atlas:font', String(f)); } catch { /* 기억 못 함 */ } }, [font]);
  return ctx;
};
/** 화면 재기 — 넘침 · 작은 글 · 작은 누름 · 쓰지 않을 말 */
const measure = p => p.evaluate(() => {
  const v = document.querySelector('#view'), out = {w: document.documentElement.scrollWidth, cw: document.documentElement.clientWidth, small: [], tiny: [], text: []};
  const vis = e => { const r = e.getBoundingClientRect(); if (!r.width || !r.height) return false; for (let x = e; x && x !== document.body; x = x.parentElement) { const s = getComputedStyle(x); if (s.display === 'none' || s.visibility === 'hidden') return false; if (x.tagName === 'DETAILS' && !x.open && !x.firstElementChild?.contains(e)) return false; } return true; };
  for (const e of v.querySelectorAll('button, a[href], summary, input, textarea, [role="radio"]')) { if (!vis(e)) continue; const r = e.getBoundingClientRect(); if (r.width < 47.5 || r.height < 47.5) out.small.push(`${e.tagName.toLowerCase()}.${e.className} ${Math.round(r.width)}×${Math.round(r.height)} ${(e.textContent || '').trim().slice(0, 12)}`); }
  const w = document.createTreeWalker(v, NodeFilter.SHOW_TEXT);
  for (let n = w.nextNode(); n; n = w.nextNode()) {
    const t = n.nodeValue.trim(); if (!t || !vis(n.parentElement)) continue;
    const fs = parseFloat(getComputedStyle(n.parentElement).fontSize) * (parseFloat(getComputedStyle(document.querySelector('#view')).zoom) || 1);
    if (fs < 16.9) out.tiny.push(`${t.slice(0, 16)} ${fs}px`);
    if (!n.parentElement.closest('[lang="ko"]')) out.text.push(t);
  }
  return out;
});
const errsOf = p => { const e = []; p.on('pageerror', x => e.push(String(x.message).slice(0, 160))); return e; };

try {
  // ① 세 폭 + 아주 크게
  for (const [w, font] of [[320, 0], [360, 0], [390, 0], [320, 2]]) {
    const tag = `${w}${font ? ' 아주 크게' : ''}`, ctx = await ctxOf(w, {font}), p = await ctx.newPage(), errs = errsOf(p);
    await p.goto(URL_OF('#/help'), {waitUntil: 'load', timeout: 60000});
    const ok = await p.waitForSelector('#view .hp-door', {timeout: 20000}).then(() => true).catch(() => false);
    check(ok, `${tag} 문 셋`, ok ? '' : '고객센터 쪽이 안 그려짐');
    if (!ok) { await ctx.close(); continue; }
    const head = await p.evaluate(() => ({h1: document.querySelector('#view h1')?.firstChild?.textContent?.trim(), doors: document.querySelectorAll('#view .hp-door').length, radios: document.querySelectorAll('#view .hp-vb[role="radio"]').length, dev: localStorage.getItem('atlas:help:dev'), foot: [...document.querySelectorAll('footer.foot a')].map(a => a.getAttribute('href')),
      note: document.querySelector('#view .hp-note-card .hp-n1')?.textContent, sign: document.querySelector('#view .hp-note-card figcaption')?.textContent}));
    check(head.h1 === '고객센터' && head.doors === 3 && head.radios === 2, `${tag} 제목 · 문 · 말투 단추`, JSON.stringify(head));
    check(head.note === '남겨 주신 말은 한 줄도 빠짐없이 제가 직접 읽어요.' && head.sign === '— ' + josa(NAME, '를') + ' 만든 사람', `${tag} 만든 사람의 말(맨 위)`, `${head.note} ${head.sign}`);
    check(head.dev == null, `${tag} 열기만 하면 남기는 것 0`, head.dev);
    check(head.foot[0] === '#/help', `${tag} 맨 아래 첫 고리 = 고객센터`, head.foot.join(' '));
    for (let i = 0; i < 3; i++) {
      await p.click(`#view .hp-door >> nth=${i}`); await p.waitForTimeout(250);
      const exp = await p.evaluate(i => { const d = document.querySelectorAll('#view .hp-door')[i]; const pane = d?.nextElementSibling; return {exp: d?.getAttribute('aria-expanded'), shown: !!pane && !pane.hidden && pane.getBoundingClientRect().height > 40}; }, i);
      check(exp.exp === 'true' && exp.shown, `${tag} 문 ${i + 1} 열림`, JSON.stringify(exp));
      if (i === 1) await p.evaluate(() => { for (const d of document.querySelectorAll('#view details.hp-qa')) d.open = true; });
      const m = await measure(p);
      check(m.w <= m.cw, `${tag} 문 ${i + 1} 가로 넘침 0`, `${m.w} > ${m.cw}`);
      check(!m.tiny.length, `${tag} 문 ${i + 1} 글 17px`, m.tiny.slice(0, 3).join(' · '));
      check(!m.small.length, `${tag} 문 ${i + 1} 누르는 크기 48`, m.small.slice(0, 3).join(' · '));
      const bad = m.text.flatMap(t => screenHits(t).map(x => `「${t.slice(0, 20)}」 ${x}`));
      check(!bad.length, `${tag} 문 ${i + 1} 쓰지 않을 말 0`, bad.slice(0, 3).join(' · '));
      const rules = await pageRules(p, {maxLefts: 99});
      check(!rules.length, `${tag} 문 ${i + 1} 모양 규칙`, rules.slice(0, 2).join(' | '));
    }
    check(!errs.length, `${tag} 화면 오류 0`, errs.slice(0, 2).join(' | '));
    await ctx.close();
  }

  // ② 길(390)
  {
    const ctx = await ctxOf(390), p = await ctx.newPage(), errs = errsOf(p);
    const api = (path, opt = {}) => p.evaluate(async ([path, opt]) => { const r = await fetch(path, opt); let j = null; try { j = await r.json(); } catch { /* 빈 몸 */ } return {s: r.status, j}; }, [path, opt]);
    await p.goto(URL_OF('#/why'), {waitUntil: 'load', timeout: 60000}); await p.waitForTimeout(300);
    await p.goto(URL_OF('#/help'), {waitUntil: 'load'}); // 바로 전 길 = 매매일지(보던 화면 이름)
    await p.evaluate(() => { location.hash = '#/why'; }); await p.waitForTimeout(400); await p.evaluate(() => { location.hash = '#/help'; }); await p.waitForSelector('#view .hp-door');
    // 한마디 — 안 돼요
    await p.click('#view .hp-door >> nth=0'); await p.click('#view .hp-tone[data-tone="broken"]');
    const ph = await p.getAttribute('#view .hp-ta', 'placeholder');
    check(ph === '어디에서 무엇이 안 되나요?', '한마디 갈래 → 빈칸 안내 글', ph);
    const noteText = '검사 — 매매일지 3번 질문 글자가 겹쳐요 ' + Date.now();
    await p.fill('#view .hp-ta', noteText); await p.click('#view .hp-go');
    const echo = await p.waitForFunction(() => { const e = document.querySelector('#view .hp-echo'); return e ? {h: e.querySelector('.hp-echo-h')?.textContent, q: e.querySelector('.hp-echo-q')?.textContent, ko: e.querySelector('.hp-echo-q')?.getAttribute('lang'), s: e.querySelector('.hp-echo-s')?.textContent, up: e.querySelector('a.hp-echo-up')?.getAttribute('href'), img: e.querySelector('img.hp-parrot')?.getAttribute('src')} : null; }, null, {timeout: 10000}).then(x => x.jsonValue()).catch(() => null);
    check(echo?.h === josa(NAME, '가') + ' 들은 말' && echo?.q === '「' + noteText + '」' && echo?.ko === 'ko' && echo?.s === '한 글자도 바꾸지 않고 그대로 전했어요. 고마워요.' && echo?.up === '#/up' && echo?.img === '/media/makbi-hello.svg',
      '한마디 보냄 — 앵무새 돌이가 들은 말을 한 글자도 바꾸지 않고 따라 말함', JSON.stringify(echo));
    const dev = await p.evaluate(() => localStorage.getItem('atlas:help:dev'));
    check(/^[A-Za-z0-9_-]{43}$/.test(dev ?? ''), '처음 보낼 때 이 기기 열쇠를 만듦', dev);
    // 연락처 꼴 — 화면이 막고 서버에도 안 감
    await p.click('#view .hp-door >> nth=1');
    const before = (await api('/api/help/mine', {headers: {'x-help-key': dev}})).j?.items?.length ?? -1;
    await p.fill('#view .hp-pane .hp-form .hp-ta', '연락은 010-1234-5678 로 주세요'); await p.click('#view .hp-pane .hp-form .hp-go'); await p.waitForTimeout(400);
    const cMsg = await p.textContent('#view .hp-pane .hp-form .hp-out');
    const after = (await api('/api/help/mine', {headers: {'x-help-key': dev}})).j?.items?.length ?? -2;
    check(cMsg === '전화번호나 이메일은 빼고 보내 주세요.' && before === after, '연락처 꼴은 막음', `${cMsg} ${before}→${after}`);
    // 물음
    const qText = '검사 물음 — 관심 회사는 몇 개까지 담아요? ' + Date.now();
    await p.fill('#view .hp-pane .hp-form .hp-ta', qText); await p.click('#view .hp-pane .hp-form .hp-go');
    await p.waitForFunction(t => [...document.querySelectorAll('#view .hp-item .hp-q')].some(e => e.textContent === t), qText, {timeout: 10000}).catch(() => {});
    const mine = await p.evaluate(t => { const li = [...document.querySelectorAll('#view .hp-item')].find(e => e.querySelector('.hp-q')?.textContent === t); return li ? {st: li.querySelector('.hp-st')?.textContent, when: li.querySelector('.hp-when')?.textContent, ko: li.querySelector('.hp-q')?.getAttribute('lang')} : null; }, qText);
    check(mine?.st === '답을 기다려요' && /^물어보기 · \d+월 \d+일$/.test(mine?.when ?? '') && mine?.ko === 'ko', '물음 → 내가 남긴 글 · 답을 기다려요', JSON.stringify(mine));
    // 맨 위 결 단추(총정리 2026-10-22 D1 · 사장님 04:09 「결과부터」) — 제목 바로 밑 · 답을 기다리는 물음 수(한마디는 안 셈) · 48px
    const ansTop = () => p.evaluate(() => { const b = document.querySelector('#view .hp-ans'); return b && !b.hidden ? {t: b.textContent, got: b.classList.contains('got'), first: b.previousElementSibling?.tagName === 'H1', h: Math.round(b.getBoundingClientRect().height)} : null; });
    const a1 = await ansTop();
    check(a1?.t === '답을 기다려요 · 1개 ›' && !a1.got && a1.first && a1.h >= 48, '맨 위 결 — 제목 바로 밑 「답을 기다려요 · 1개 ›」(한마디는 안 셈)', JSON.stringify(a1));
    const items = (await api('/api/help/mine', {headers: {'x-help-key': dev}})).j?.items ?? [];
    const qi = items.find(x => x.text === qText), ni = items.find(x => x.kind === 'note');
    check(!!qi && !!ni && ni.tone === 'broken' && ni.voice === 'easy', '서버 — 물음 · 한마디(안 돼요 · 쉬운 말)', JSON.stringify(items.map(x => [x.kind, x.tone, x.voice])));
    // 사장님 열쇠 — 모두 보기(보던 화면 이름) · 답 · 모두에게 보이기
    check((await api('/api/help/all')).s === 403, '열쇠 없는 기기 — 모든 글 403');
    if (KEY && qi) {
      const all = await api('/api/help/all', {headers: {'x-atlas-owner': KEY}});
      const nAll = all.j?.items?.find(x => x.id === ni?.id);
      check(all.s === 200 && nAll?.page === 'why', '사장님 — 모든 글 · 보던 화면 이름(매매일지)', `${all.s} ${nAll?.page}`);
      const ans = await api('/api/help', {method: 'POST', headers: {'content-type': 'application/json', 'x-atlas-owner': KEY}, body: JSON.stringify({op: 'answer', id: qi.id, answer: '검사 답 — 관심 회사는 제한 없이 담을 수 있어요.', public: true, pubQ: '검사 — 관심 회사는 몇 개까지 담나요?'})});
      check(ans.s === 200, '사장님 답 달기', ans.s);
      await p.click('#view .hp-door >> nth=1'); await p.click('#view .hp-door >> nth=1'); await p.waitForTimeout(800);
      const got = await p.evaluate(t => { const li = [...document.querySelectorAll('#view .hp-item')].find(e => e.querySelector('.hp-q')?.textContent === t); return {a: li?.querySelector('.hp-a p:last-child')?.textContent ?? null, faq: [...document.querySelectorAll('#view .hp-qa summary')].map(s => s.textContent)}; }, qText);
      check(got.a === '검사 답 — 관심 회사는 제한 없이 담을 수 있어요.', '물은 기기에 답이 옴', got.a);
      check(got.faq.includes('검사 — 관심 회사는 몇 개까지 담나요?'), '많이 묻는 것에 올라옴', got.faq.slice(-2).join(' | '));
      check(got.faq[0] === josa(NAME, '는') + ' 무엇을 해 줘요?' && await p.evaluate(() => document.querySelector('#view details.hp-qa a.hp-qlink')?.getAttribute('href')) === '#/t/how', '많이 묻는 것 첫 물음 = 본질 1 · 답 밑 「시계 읽는 법 ›」(총정리 D4)', got.faq[0]);
      const a2 = await ansTop();
      check(a2?.t === '답이 왔어요 · 1개 ›' && a2.got, '맨 위 결 — 답이 오면 「답이 왔어요 · 1개 ›」(총정리 D1)', JSON.stringify(a2));
      await p.evaluate(() => window.scrollTo(0, 0)); await p.click('#view .hp-ans'); await p.waitForTimeout(900);
      const a3 = await p.evaluate(() => ({open: document.querySelector('#view .hp-door[aria-expanded="true"] .hp-dt b')?.textContent ?? null, top: Math.round(document.querySelector('#view .hp-mine')?.getBoundingClientRect().top ?? -1), vh: innerHeight}));
      check(a3.open === '물어보기' && a3.top >= 0 && a3.top < a3.vh / 2, '맨 위 결을 누르면 물어보기 문이 열리고 내가 남긴 글로 내려감', JSON.stringify(a3));
      await api('/api/help', {method: 'POST', headers: {'content-type': 'application/json', 'x-atlas-owner': KEY}, body: JSON.stringify({op: 'drop', id: ni.id})}); // 한마디는 사장님이 지움(뒷정리)
    } else check(!KEY, '사장님 열쇠 길', '물음 없음');
    // 지우기 두 번 → 서버에서 사라짐
    const delSel = `#view .hp-item:has(.hp-q:text-is("${qText.replace(/"/g, '\\"')}")) .hp-del`;
    await p.click(delSel); const armed = await p.textContent(delSel);
    await p.click(delSel); await p.waitForTimeout(800);
    const left = (await api('/api/help/mine', {headers: {'x-help-key': dev}})).j?.items ?? [];
    check(armed === '한 번 더 누르면 지워요' && !left.some(x => x.text === qText), '지우기 두 번 → 서버에서 사라짐', `${armed} ${left.length}`);
    const a4 = await ansTop();
    check(a4 === null, '맨 위 결 — 기다리는 물음 · 답이 없으면 단추 없음', JSON.stringify(a4));
    check(!(await api('/api/help/faq')).j?.items?.some(x => x.q === '검사 — 관심 회사는 몇 개까지 담나요?'), '지운 물음은 많이 묻는 것에서도 사라짐');
    // 곧은 말
    await p.click('#view .hp-vb >> nth=1'); await p.waitForTimeout(200);
    const dir = await p.evaluate(() => ({d: [...document.querySelectorAll('#view .hp-door .hp-dt b')].map(b => b.textContent), lead: document.querySelector('#view .hp-note-card .hp-n1')?.textContent, mem: localStorage.getItem('atlas:help:voice')}));
    check(dir.d.join('|') === '의견 보내기|질문하기|운영 안내' && dir.lead === '모든 글은 운영자가 직접 읽습니다.' && dir.mem === 'direct', '곧은 말 단추 → 글이 바뀌고 기억', JSON.stringify(dir));
    check(await p.evaluate(() => !!document.querySelector('#view h1 img.st-art')), '말투를 바꿔도 제목 돌 그림이 남음');
    await p.reload({waitUntil: 'load'}); await p.waitForSelector('#view .hp-door');
    check(await p.evaluate(() => document.querySelector('#view .hp-vb[aria-checked="true"]')?.textContent) === '곧은 말', '다시 열어도 곧은 말');
    // #/help/ask 로 바로 열면 그 문을 화면 맨 위에(총정리 2026-10-22 D2 — 그린 뒤 맨 위로 올리는 app.js 보다 나중에)
    await p.goto(URL_OF('#/help/ask'), {waitUntil: 'load'}); await p.waitForSelector('#view .hp-door'); await p.waitForTimeout(700);
    const dl = await p.evaluate(() => { const d = document.querySelector('#hp-ask')?.previousElementSibling, r = d?.getBoundingClientRect(); return {exp: d?.getAttribute('aria-expanded') ?? null, top: r ? Math.round(r.top) : null, y: Math.round(scrollY)}; });
    check(dl.exp === 'true' && dl.y > 0 && dl.top >= 0 && dl.top <= 120, '#/help/ask 로 바로 열면 물어보기 문이 맨 위', JSON.stringify(dl));
    check(!errs.length, '길 화면 오류 0', errs.slice(0, 2).join(' | '));
    // 사장님 화면
    if (KEY) {
      const c2 = await browser.newContext({viewport: {width: 390, height: 800}, locale: 'ko-KR', reducedMotion: 'reduce'});
      await c2.addInitScript(k => { try { localStorage.setItem('atlas11:invite:owner', k); localStorage.setItem('atlas:essence-seen', 'true'); localStorage.setItem('atlas:white-seen', 'true'); } catch { /* 없음 */ } }, KEY);
      const p2 = await c2.newPage(); await p2.goto(URL_OF('#/admin'), {waitUntil: 'load'});
      const adm = await p2.waitForSelector('#view .adm-help h2', {timeout: 20000}).then(e => e.textContent()).catch(() => null);
      check(adm === '고객센터 글', '사장님 화면 — 고객센터 글 칸', adm);
      await c2.close();
    }
    await ctx.close();
  }

  // ③ 영어
  {
    const ctx = await ctxOf(390, {en: true}), p = await ctx.newPage();
    await p.goto(URL_OF('#/help', '&lang=en'), {waitUntil: 'load', timeout: 60000});
    await p.waitForFunction(() => document.documentElement.lang === 'en', null, {timeout: 10000}).catch(() => {});
    await p.waitForSelector('#view .hp-door', {timeout: 20000}).catch(() => {});
    const left = [];
    for (const [v, i] of [[0, 0], [0, 1], [0, 2], [1, 0], [1, 1], [1, 2]]) { // 쉬운 말 · 곧은 말 두 벌
      if (v === 1 && i === 0) { await p.click('#view .hp-vb >> nth=1').catch(() => {}); await p.waitForTimeout(500); }
      await p.click(`#view .hp-door >> nth=${i}`).catch(() => {}); await p.waitForTimeout(500);
      if (i === 1) await p.evaluate(() => { for (const d of document.querySelectorAll('#view details.hp-qa')) d.open = true; });
      left.push(...await p.evaluate(() => { const out = [], HAN = /[가-힣]/, root = document.querySelector('#view'); const w = document.createTreeWalker(root, NodeFilter.SHOW_TEXT); for (let n = w.nextNode(); n; n = w.nextNode()) if (HAN.test(n.nodeValue) && !n.parentElement.closest('[lang="ko"], [data-proper], script, style')) out.push(n.nodeValue.trim().slice(0, 40)); for (const e of root.querySelectorAll('[aria-label], [placeholder]')) for (const a of ['aria-label', 'placeholder']) { const v = e.getAttribute(a); if (v && HAN.test(v) && !e.closest('[lang="ko"]')) out.push(a + '=' + v.slice(0, 30)); } return out; }));
    }
    const foot = await p.evaluate(() => document.querySelector('footer.foot a[href="#/help"]')?.textContent);
    check(!left.length, '영어 — 남은 한글 0', [...new Set(left)].slice(0, 5).join(' | '));
    check(foot === 'Help center', '영어 — 맨 아래 고객센터 고리', foot);
    R.m.en = [...new Set(left)];
    await ctx.close();
  }
} catch (e) { check(false, '검사 돌리기', String(e?.message ?? e).split('\n')[0].slice(0, 200)); }
finally { await browser.close().catch(() => {}); }
R.ok = R.counts.fail === 0;
console.log(`고객센터 검사 — 통과 ${R.counts.pass} · 실패 ${R.counts.fail}`);
if (OUT) await fs.writeFile(OUT, JSON.stringify(R, null, 1) + '\n');
process.exit(R.ok ? 0 : 1);
