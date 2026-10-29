// 서른아홉 스승 쪽 검사(#/sage · #/sage/<이름> · site/next/p-sage.js · site/next/data/sage39.json)
//   사장님 2026-10-29(서울) 19:14 「…잡스가 정말 바보 천치도 알수 있게 … 육하원칙 … 기승전결 … 따딱딱 … 정조에 질은 하바드 이상 … 퍼음 부처 끝까지」
//   (docs/design/wise39-2026-10-29/order-1914.txt · ideas-36.md · 자료 만드는 법 build.py)
//   쓰는 법: node scripts/atlas11/next/check_sage.mjs --base http://127.0.0.1:8826 [--pw /opt/node-tools/] [--out 결과.json] [--all]
//     다른 쪽 검사와 같은 꼴(--all · --limit · --shard 를 받음 — 이 검사는 늘 서른아홉 사람을 모두 돎)
//   ① 자료(브라우저 없이) — 서른아홉 · 네 걸음(10 · 10 · 10 · 9) · 같은 이름 없음 · 빈 칸 없음 · 표시 넷 · 오늘 나라면은 물음 · 「N년 전」이 첫 줄과 같음
//      · 영어 칸 한글 0 · 쓰지 않을 말 0(words.js screenHits) · 망치는 길 낱말 0(words.js RUIN · 한국어 · 영어) · 옛 이름 0(rename.mjs) · 낱말표가 바꾸는 말 0 · 원문엔 말(lang)
//      · 모양 규칙(p-sage.css 글씨 var(--fs-n) · 여백 var(--sp-n)) · 첫 화면 스승 줄 이름(home-new.js SAGE_ID)이 자료에 있음
//   ② 첫 쪽 세 폭(320 · 360 · 390) + 320 「아주 크게」 — 제목 · 걸음 넷 · 사람 서른아홉(자료 차례 · 고리) · 가로 넘침 0 · 글 17px 넘게 · 누르는 것 48 넘게 · 쓰지 않을 말 0 · 화면 오류 0
//      · 걸음 단추를 누르면 그 걸음이 화면 위에 옴
//   ③ 한 사람 서른아홉(390) — 이름 · 네 줄(기승전결)이 자료 글 그대로 · 남긴 말 · 표시 · 원문(말 lang) · 출처 · 둘이 고리(걸음마다) · 앞 · 다음(끝은 처음으로) · n / 39 · 별 띠 밝은 점 하나
//      · 320 폭 · 아주 크게에서 넘침 0(긴 이름 다섯)
//   ④ 영어(?lang=en) — 첫 쪽 + 서른아홉 사람 · 남은 한글 0(원문 lang="ko" 빼고) · 영어 글이 자료 그대로 · 창 제목 영어
//   ⑤ 길 — 첫 화면 스승 줄(a.nh-sage)을 누르면 그 사람 한 장 · 둘이 단추 안 「서른아홉 스승」 · 없는 이름은 첫 쪽(알림 한 줄) · 자료를 못 받으면 「?」 한 줄(오류 0)
//   실패가 하나라도 있으면 끝 코드 1(결과 파일은 --out 을 줄 때만)
import fs from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {createRequire} from 'node:module';
import {screenHits, RUIN, RUIN_OK} from '../../../site/next/words.js';
import {OLD_NAME_RE, NEW_NAME} from './rename.mjs';
import {cssRules} from './page_rules.mjs';
import {BRAND, josa} from '../../../site/next/brand.js';

const argv = process.argv.slice(2);
const arg = (k, d) => { const i = argv.indexOf(k); return i >= 0 && argv[i + 1] != null && !argv[i + 1].startsWith('--') ? argv[i + 1] : d; };
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../..');
const require = createRequire(String(arg('--pw', process.env.PW_DIR || '/opt/node-tools/')).replace(/\/?$/, '/'));
const base = String(arg('--base', 'http://127.0.0.1:8826')).replace(/\/$/, ''), OUT = arg('--out', null);
const R = {schema: 'duri-check-sage-1', at: new Date().toISOString(), base, counts: {pass: 0, fail: 0}, fails: [], m: {}};
const check = (ok, name, why = '') => { if (ok) R.counts.pass++; else { R.counts.fail++; R.fails.push([name, String(why).slice(0, 300)]); console.log('실패', name, why ? '— ' + String(why).slice(0, 300) : ''); } };
const URL_OF = (hash, q = '') => `${base}/next/?v=${Date.now()}${q}${hash}`;
const HAN = /[가-힣ㄱ-ㅎㅏ-ㅣ]/;
const GLOSS = /갈래|몸값|한 회사 한 표|큰 회사는 크게|거래일|다섯 문|쉬는 돈|챕터/; // 낱말표(site/next/glossary.js)가 화면에서 바꾸는 말
const KIND = {ko: {quote: '글 그대로 옮김', short: '글을 줄여 옮김', gist: '뜻을 풀어 씀', told: '뒷사람이 적은 이야기'}, en: {quote: 'Translated as written', short: 'Shortened translation', gist: 'Meaning paraphrased', told: 'Told by a later writer'}};
const QUOTE = {ko: s => `「${s}」`, en: s => `“${s}”`};
const SAFE = josa(NEW_NAME, '는') + ' 지난 기록만 보여 줘요. 사고팔기를 권하지 않아요.'; // 둘이 안전 문장(돌이 단추 안과 같은 글)

/* ── ① 자료 ── */
const D = JSON.parse(await fs.readFile(path.join(ROOT, 'site/next/data/sage39.json'), 'utf8'));
const PEOPLE = D.people ?? [], STEPS = D.steps ?? [];
{
  check(D.schema === 'sage39-v1', '① 자료 꼴', D.schema);
  check(PEOPLE.length === 39, '① 서른아홉 사람', PEOPLE.length);
  check(STEPS.length === 4 && STEPS.every((s, i) => s.k === i + 1), '① 네 걸음', STEPS.map(s => s.k).join(','));
  const cnt = [1, 2, 3, 4].map(k => PEOPLE.filter(p => p.step === k).length);
  check(cnt.join() === '10,10,10,9', '① 걸음마다 사람 수 10 · 10 · 10 · 9', cnt.join());
  const ids = PEOPLE.map(p => p.id); check(new Set(ids).size === ids.length && ids.every(i => /^[a-z]{3,16}$/.test(i)), '① 이름(id) 하나씩 · 꼴', ids.join(','));
  check(PEOPLE.every((p, i) => i === 0 || p.step > PEOPLE[i - 1].step || (p.step === PEOPLE[i - 1].step && p.year >= PEOPLE[i - 1].year)), '① 차례 = 걸음 → 오래된 차례');
  const F = ['name', 'short', 'key', 'life', 'place', 'gi', 'seung', 'jeon', 'today', 'say', 'kind', 'src'];
  const ko = [], en = [], bad = [];
  for (const s of STEPS) for (const f of ['v', 'q', 't', 'when', 'go']) { if (!s.ko?.[f] || !s.en?.[f]) bad.push(`걸음 ${s.k} ${f}`); ko.push(s.ko?.[f] ?? ''); en.push(s.en?.[f] ?? ''); }
  for (const p of PEOPLE) {
    for (const f of F) { if (!String(p.ko?.[f] ?? '').trim() || !String(p.en?.[f] ?? '').trim()) bad.push(`${p.id} ${f} 빈 칸`); }
    if (!KIND.ko[p.ko.kind] || p.ko.kind !== p.en.kind) bad.push(`${p.id} 표시 ${p.ko.kind}/${p.en.kind}`);
    if (!p.ko.today.endsWith('?') || !p.en.today.endsWith('?')) bad.push(`${p.id} 오늘 나라면이 물음 꼴이 아님`);
    if (!p.ko.gi.includes(p.ago.toLocaleString('en-US') + '년 전') && !p.ko.gi.includes(p.ago.toLocaleString('en-US') + '여 년 전')) bad.push(`${p.id} ${p.ago}년 전 이 첫 줄과 다름`);
    if (!p.en.gi.includes(p.ago.toLocaleString('en-US') + ' years ago')) bad.push(`${p.id} ${p.ago} years ago 가 첫 줄과 다름`);
    if (p.orig && !p.olang) bad.push(`${p.id} 원문 말(lang) 없음`);
    if (![1, 2, 3, 4].includes(p.step) || !Number.isFinite(p.year) || typeof p.east !== 'boolean') bad.push(`${p.id} 걸음 · 해 · 동서`);
    for (const f of F) { ko.push(String(p.ko[f])); en.push(String(p.en[f])); }
    if (p.orig) (p.olang === 'ko' ? ko : en).push(p.orig);
  }
  check(!bad.length, '① 빈 칸 · 표시 · 물음 꼴 · 몇 년 전 · 원문 말', bad.slice(0, 6).join(' | '));
  const K = ko.join('\n'), E = en.join('\n');
  check(!en.some(s => HAN.test(s)), '① 영어 칸 한글 0', en.find(s => HAN.test(s)));
  check(!screenHits(K).length, '① 쓰지 않을 말 0', screenHits(K).join(' '));
  let k2 = K; for (const ok of RUIN_OK) k2 = k2.split(ok).join(''); const k3 = k2.replace(/\s+/g, '');
  const ruin = [];
  for (const r of RUIN) {
    for (const w of r.ko) if (k2.includes(w) || k3.includes(w.replace(/\s+/g, ''))) ruin.push(r.key + ' 「' + w + '」');
    for (const w of r.en) if (new RegExp('\\b' + w.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '\\b', 'i').test(E)) ruin.push(r.key + ' 「' + w + '」');
  }
  check(!ruin.length, '① 망치는 길 낱말 0(한국어 · 영어)', ruin.join(' | '));
  check(!OLD_NAME_RE.test(K + '\n' + E), '① 옛 이름 0', (K + E).match(OLD_NAME_RE)?.[0]);
  check(!GLOSS.test(K), '① 낱말표가 바꾸는 말 0', K.match(GLOSS)?.[0]);
  const css = cssRules('site/next/p-sage.css'); check(!css.length, '① 모양 규칙(글씨 · 여백 잣대)', css.slice(0, 4).join(' | '));
  const home = await fs.readFile(path.join(ROOT, 'site/next/home-new.js'), 'utf8');
  const map = Object.fromEntries([...((/export const SAGE_ID = Object\.freeze\(\{([^}]*)\}\)/.exec(home) || [])[1] ?? '').matchAll(/'([^']+)':\s*'([a-z]+)'/g)].map(m => [m[1], m[2]]));
  check(Object.keys(map).length >= 6 && Object.entries(map).every(([nm, id]) => PEOPLE.some(p => p.id === id && (p.ko.name === nm || p.ko.short === nm || p.ko.name.endsWith(nm)))), '① 첫 화면 스승 줄 이름 → 자료', JSON.stringify(map));
  R.m.people = PEOPLE.length; R.m.steps = cnt;
}
const STEP_HREF = Object.fromEntries(STEPS.map(s => [s.k, s.href]));

/* ── 브라우저 ── */
const {chromium} = require('playwright');
const browser = await chromium.launch(process.env.PW_EXE ? {executablePath: process.env.PW_EXE} : {});
const ctxOf = async (w, {font = 0, en = false} = {}) => {
  const ctx = await browser.newContext({viewport: {width: w, height: 800}, deviceScaleFactor: 1, isMobile: true, hasTouch: true, locale: en ? 'en-US' : 'ko-KR', timezoneId: 'Asia/Seoul', reducedMotion: 'reduce'});
  await ctx.addInitScript(([f]) => { try { localStorage.setItem('atlas:essence-seen', 'true'); localStorage.setItem('atlas:white-seen', 'true'); if (f) localStorage.setItem('atlas:font', String(f)); } catch { /* 기억 못 함 */ } }, [font]);
  return ctx;
};
const errsOf = p => { const e = []; p.on('pageerror', x => e.push(String(x.message).slice(0, 160))); return e; };
const ready = p => p.waitForFunction(() => !document.querySelector('#view .boot') && !!document.querySelector('#view .sg, #view .empty'), null, {timeout: 20000}).then(() => true, () => false);
const go = async (p, hash) => { await p.evaluate(h => { location.hash = h; }, hash); return ready(p); };
/** 화면 재기(화면 안에서 돎 — 바깥 이름을 쓰지 않음) — 넘침 · 작은 글 · 작은 누름 · 칸 밖 · 쓰지 않을 말 · 남은 한글 */
function measureInPage() {
  const v = document.querySelector('#view'), W = document.documentElement.clientWidth, out = {sw: document.documentElement.scrollWidth, cw: W, small: [], tiny: [], text: [], han: [], over: []};
  const vis = e => { const r = e.getBoundingClientRect(); if (!r.width || !r.height) return false; for (let x = e; x && x !== document.body; x = x.parentElement) { const s = getComputedStyle(x); if (s.display === 'none' || s.visibility === 'hidden') return false; } return true; };
  for (const e of v.querySelectorAll('.sg a[href], .sg button')) { if (!vis(e)) continue; const r = e.getBoundingClientRect(); if (r.width < 47.5 || r.height < 47.5) out.small.push(`${e.className} ${Math.round(r.width)}×${Math.round(r.height)} 「${e.textContent.trim().slice(0, 14)}」`); if (r.right > W + 0.5 || r.left < -0.5) out.over.push(`${e.className} ${Math.round(r.left)}~${Math.round(r.right)}`); }
  const z = parseFloat(getComputedStyle(v).zoom) || 1;
  const w = document.createTreeWalker(v, NodeFilter.SHOW_TEXT);
  for (let n = w.nextNode(); n; n = w.nextNode()) {
    const el = n.parentElement, t = n.nodeValue.trim(); if (!t || !el || !el.closest('.sg') || !vis(el)) continue;
    const fs = parseFloat(getComputedStyle(el).fontSize) * z; if (fs < 16.9) out.tiny.push(`${t.slice(0, 16)} ${fs}px`);
    if (!el.closest('[lang]:not([lang="en"])')) out.text.push(t);
    if (/[가-힣ㄱ-ㅎㅏ-ㅣ]/.test(t) && !el.closest('[lang="ko"]')) out.han.push(t.slice(0, 40));
    const cs = getComputedStyle(el); if (el.scrollWidth > el.clientWidth + 1 && cs.overflowX === 'visible' && cs.display !== 'inline') out.over.push(`${el.className || el.tagName} 「${t.slice(0, 16)}」 ${el.scrollWidth}>${el.clientWidth}`);
  }
  return out;
}
const MEASURE = p => p.evaluate(measureInPage).catch(e => ({err: String(e.message)}));
const judge = (tag, m, {en = false} = {}) => {
  if (m.err) return check(false, `${tag} 재기`, m.err);
  check(m.sw <= m.cw, `${tag} 가로 넘침 0`, `${m.sw}>${m.cw}`);
  check(!m.small.length, `${tag} 누르는 것 48 넘게`, m.small.slice(0, 3).join(' | '));
  check(!m.tiny.length, `${tag} 글 17px 넘게`, m.tiny.slice(0, 3).join(' | '));
  check(!m.over.length, `${tag} 칸 밖 · 칸 안 넘친 글 0`, m.over.slice(0, 3).join(' | '));
  if (!en) { const hit = screenHits(m.text.join('\n')); check(!hit.length, `${tag} 쓰지 않을 말 0`, hit.join(' ')); }
  else check(!m.han.length, `${tag} 남은 한글 0`, m.han.slice(0, 3).join(' | '));
};

try {
  // ② 첫 쪽 세 폭 + 아주 크게
  for (const [w, font] of [[320, 0], [360, 0], [390, 0], [320, 2]]) {
    const tag = `② ${w}${font ? ' 아주 크게' : ''}`, ctx = await ctxOf(w, {font}), p = await ctx.newPage(), errs = errsOf(p);
    await p.goto(URL_OF('#/sage'), {waitUntil: 'load', timeout: 60000});
    if (!await ready(p)) { check(false, `${tag} 첫 쪽`, '안 그려짐'); await ctx.close(); continue; }
    const s = await p.evaluate(() => ({h1: document.querySelector('#view h1')?.textContent.trim(), steps: document.querySelectorAll('#view .sg-step').length, jumps: document.querySelectorAll('#view .sg-jump').length,
      tiles: [...document.querySelectorAll('#view .sg-tile')].map(a => [a.getAttribute('href'), a.querySelector('.sg-tn')?.textContent.trim(), a.querySelector('.sg-tk2')?.textContent.trim()]),
      safe: document.querySelector('#view .sg ~ .safe, #view .sg .safe')?.textContent.trim(), one: document.querySelector('#view .sg-one')?.textContent.trim(), dots: document.querySelectorAll('#view .sg-sky .sg-dot').length, title: document.title}));
    check(s.h1 === '서른아홉 스승', `${tag} 제목`, s.h1);
    check(s.steps === 4 && s.jumps === 4, `${tag} 걸음 넷 · 단추 넷`, `${s.steps} · ${s.jumps}`);
    check(s.tiles.length === 39 && s.tiles.every((t, i) => t[0] === '#/sage/' + PEOPLE[i].id && t[1] === PEOPLE[i].ko.name && t[2] === PEOPLE[i].ko.key), `${tag} 사람 서른아홉(자료 차례 · 고리 · 이름 · 낱말)`, JSON.stringify(s.tiles.find((t, i) => t[0] !== '#/sage/' + PEOPLE[i]?.id || t[1] !== PEOPLE[i]?.ko.name) ?? s.tiles.length));
    check(s.dots === 39, `${tag} 별 띠 점 서른아홉`, s.dots);
    check(s.one === '묻고, 보고, 따지고, 지켜요.', `${tag} 한목소리`, s.one);
    check(s.safe === SAFE, `${tag} 안전 문장`, s.safe);
    check(s.title === '서른아홉 스승 · ' + NEW_NAME, `${tag} 창 제목`, s.title);
    judge(tag, await MEASURE(p));
    if (w === 390 && !font) { // 걸음 단추 → 그 걸음이 화면 위에
      await p.locator('#view .sg-jump.s3').click(); await p.waitForTimeout(700);
      const top = await p.evaluate(() => document.getElementById('sg-s3')?.getBoundingClientRect().top);
      check(top != null && top >= 0 && top < 200, `${tag} 걸음 단추 → ③ 따지기가 화면 위`, top);
    }
    check(!errs.length, `${tag} 화면 오류 0`, errs.join(' | ')); await ctx.close();
  }

  // ③ 한 사람 서른아홉(390) + 긴 이름 다섯(320 · 아주 크게)
  {
    const ctx = await ctxOf(390), p = await ctx.newPage(), errs = errsOf(p);
    await p.goto(URL_OF('#/sage/' + PEOPLE[0].id), {waitUntil: 'load', timeout: 60000}); await ready(p);
    for (let i = 0; i < PEOPLE.length; i++) {
      const x = PEOPLE[i], prev = PEOPLE[(i + 38) % 39], next = PEOPLE[(i + 1) % 39], tag = `③ ${x.id}`;
      if (!await go(p, '#/sage/' + x.id)) { check(false, `${tag} 열기`, '안 그려짐'); continue; }
      await p.waitForFunction(id => document.querySelector('#view .sg-card #sg-name')?.textContent && document.querySelector(`#view .sg-nav a.prev`)?.getAttribute('href') !== null && location.hash === '#/sage/' + id, x.id, {timeout: 8000}).catch(() => {});
      const c = await p.evaluate(() => {
        const q = s => document.querySelector('#view ' + s), qa = s => [...document.querySelectorAll('#view ' + s)];
        return {name: q('#sg-name')?.textContent.trim(), key: q('.sg-key')?.textContent.trim(), beats: qa('.sg-story .sg-bt p').map(e => e.textContent.trim()), labels: qa('.sg-story .sg-bl').map(e => e.textContent.trim()),
          say: q('.sg-q p')?.textContent.trim(), kind: q('.sg-kind')?.textContent.trim(), orig: q('.sg-orig span')?.textContent.trim() ?? null, olang: q('.sg-orig span')?.getAttribute('lang') ?? null,
          src: q('.sg-src span')?.textContent.trim(), go: q('a.sg-go')?.getAttribute('href'), prev: q('.sg-nav a.prev')?.getAttribute('href'), next: q('.sg-nav a.next')?.getAttribute('href'), all: q('.sg-nav a.all')?.getAttribute('href'),
          pos: q('.sg-pos')?.textContent.trim(), on: qa('.sg-sky .sg-dot.on').length, off: qa('.sg-sky .sg-dot.off').length, title: document.title};
      });
      check(c.name === x.ko.name && c.key === x.ko.key, `${tag} 이름 · 큰 낱말`, `${c.name} · ${c.key}`);
      check(JSON.stringify(c.beats) === JSON.stringify([x.ko.gi, x.ko.seung, x.ko.jeon, x.ko.today]), `${tag} 기승전결 네 줄 = 자료`, c.beats.join(' / ').slice(0, 120));
      check(c.labels.join('|') === '누가 · 언제 · 어디서|왜|무엇을 · 어떻게|오늘 나라면', `${tag} 육하원칙 이름표`, c.labels.join('|'));
      check(c.say === QUOTE.ko(x.ko.say) && c.kind === KIND.ko[x.ko.kind] && c.src === x.ko.src, `${tag} 남긴 말 · 표시 · 출처`, `${c.kind} · ${c.src}`);
      check(x.orig ? (c.orig === x.orig && c.olang === x.olang) : c.orig === null, `${tag} 원문 · 말(lang)`, `${c.orig} · ${c.olang}`);
      check(c.go === STEP_HREF[x.step] && c.prev === '#/sage/' + prev.id && c.next === '#/sage/' + next.id && c.all === '#/sage', `${tag} 둘이 고리 · 앞 · 다음 · 모두`, `${c.go} ${c.prev} ${c.next}`);
      check(c.pos === `${i + 1} / 39` && c.on === 1 && c.off === 38, `${tag} n / 39 · 별 띠 밝은 점 하나`, `${c.pos} · ${c.on} · ${c.off}`);
      check(c.title === `${x.ko.name} · 서른아홉 스승 · ${NEW_NAME}`, `${tag} 창 제목`, c.title);
      judge(tag, await MEASURE(p));
    }
    check(!errs.length, '③ 화면 오류 0', errs.join(' | ')); await ctx.close();
    const LONG = ['marcus', 'leonardo', 'dasan', 'curie', 'descartes'];
    for (const [w, font] of [[320, 0], [320, 2]]) {
      const ctx2 = await ctxOf(w, {font}), q = await ctx2.newPage(), e2 = errsOf(q);
      await q.goto(URL_OF('#/sage/' + LONG[0]), {waitUntil: 'load', timeout: 60000}); await ready(q);
      for (const id of LONG) { await go(q, '#/sage/' + id); await q.waitForTimeout(80); judge(`③ ${w}${font ? ' 아주 크게' : ''} ${id}`, await MEASURE(q)); }
      check(!e2.length, `③ ${w} 화면 오류 0`, e2.join(' | ')); await ctx2.close();
    }
  }

  // ④ 영어
  {
    const ctx = await ctxOf(390, {en: true}), p = await ctx.newPage(), errs = errsOf(p);
    await p.goto(URL_OF('#/sage', '&lang=en'), {waitUntil: 'load', timeout: 60000});
    if (await ready(p)) {
      await p.waitForTimeout(300);
      const s = await p.evaluate(() => ({h1: document.querySelector('#view h1')?.textContent.trim(), lang: document.documentElement.lang, title: document.title, steps: [...document.querySelectorAll('#view .sg-sv')].map(e => e.textContent.trim())}));
      check(s.h1 === '39 Masters' && s.lang === 'en', '④ 첫 쪽 제목 · html lang', `${s.h1} · ${s.lang}`);
      check(s.steps.join('|') === STEPS.map(x => x.en.v).join('|'), '④ 걸음 이름 영어', s.steps.join('|'));
      check(!HAN.test(s.title) && s.title.startsWith('39 Masters'), '④ 창 제목 영어', s.title);
      judge('④ 첫 쪽', await MEASURE(p), {en: true});
      for (const x of PEOPLE) {
        if (!await go(p, '#/sage/' + x.id)) { check(false, `④ ${x.id}`, '안 그려짐'); continue; }
        await p.waitForTimeout(40);
        const c = await p.evaluate(() => ({name: document.querySelector('#view #sg-name')?.textContent.trim(), beats: [...document.querySelectorAll('#view .sg-story .sg-bt p')].map(e => e.textContent.trim()), say: document.querySelector('#view .sg-q p')?.textContent.trim(), kind: document.querySelector('#view .sg-kind')?.textContent.trim(), title: document.title}));
        check(c.name === x.en.name && JSON.stringify(c.beats) === JSON.stringify([x.en.gi, x.en.seung, x.en.jeon, x.en.today]) && c.say === QUOTE.en(x.en.say) && c.kind === KIND.en[x.en.kind], `④ ${x.id} 영어 글 = 자료`, `${c.name} · ${c.kind}`);
        check(!HAN.test(c.title), `④ ${x.id} 창 제목 영어`, c.title);
        judge(`④ ${x.id}`, await MEASURE(p), {en: true});
      }
    } else check(false, '④ 영어 첫 쪽', '안 그려짐');
    check(!errs.length, '④ 화면 오류 0', errs.join(' | ')); await ctx.close();
  }

  // ⑤ 길 — 첫 화면 스승 줄 · 둘이 단추 안 · 없는 이름 · 자료 못 받음
  {
    const ctx = await ctxOf(390), p = await ctx.newPage(), errs = errsOf(p);
    await p.goto(URL_OF('#/'), {waitUntil: 'load', timeout: 60000});
    await p.waitForFunction(() => !document.querySelector('#view .boot') && document.querySelectorAll('#view a.nh-sage').length > 0, null, {timeout: 20000}).catch(() => {});
    const links = await p.evaluate(() => [...document.querySelectorAll('#view a.nh-sage')].map(a => { const r = a.getBoundingClientRect(); return {href: a.getAttribute('href'), who: a.querySelector('b')?.textContent.trim(), w: r.width, h: r.height}; }));
    check(links.length >= 1, '⑤ 첫 화면 스승 줄이 고리', links.length);
    check(links.every(l => { const id = (/^#\/sage\/([a-z]+)$/.exec(l.href) || [])[1]; const x = PEOPLE.find(q => q.id === id); return x && (x.ko.name === l.who || x.ko.short === l.who || x.ko.name.endsWith(l.who)); }), '⑤ 스승 줄 고리 = 그 사람', JSON.stringify(links.map(l => [l.who, l.href])));
    check(links.every(l => l.h >= 47.5 && l.w >= 47.5), '⑤ 스승 줄 누르는 자리 48 넘게', JSON.stringify(links.map(l => [l.who, Math.round(l.w), Math.round(l.h)])));
    if (links.length) {
      const first = links[0], id = first.href.split('/').pop(), x = PEOPLE.find(q => q.id === id);
      await p.locator('#view a.nh-sage').first().scrollIntoViewIfNeeded(); await p.locator('#view a.nh-sage').first().click();
      const ok = await p.waitForFunction(n => document.querySelector('#view #sg-name')?.textContent.trim() === n, x?.ko.name, {timeout: 8000}).then(() => true, () => false);
      check(ok, `⑤ 스승 줄 누름 → ${id} 한 장`, await p.evaluate(() => location.hash));
    }
    await p.goto(URL_OF('#/dori'), {waitUntil: 'load', timeout: 60000});
    await p.waitForFunction(() => !!document.querySelector('#view .dm a[href="#/sage"]'), null, {timeout: 15000}).catch(() => {});
    const dm = await p.evaluate(() => document.querySelector('#view .dm a[href="#/sage"]')?.textContent.trim());
    check(dm?.startsWith('서른아홉 스승'), '⑤ 둘이 단추 안 「서른아홉 스승」', dm);
    if (dm) { await p.locator('#view .dm a[href="#/sage"]').click(); check(await p.waitForFunction(() => document.querySelectorAll('#view .sg-tile').length === 39, null, {timeout: 8000}).then(() => true, () => false), '⑤ 둘이 단추 안 → 첫 쪽'); }
    const tab = await p.evaluate(() => document.querySelector('.tabs a[data-tab="dori"]')?.getAttribute('aria-current'));
    check(tab === 'page', '⑤ 아래 단추 「둘이」가 지금 쪽', tab);
    await go(p, '#/sage/nobody'); await p.waitForTimeout(100);
    const nb = await p.evaluate(() => ({note: document.querySelector('#view .sg-hero .sg-note[role="status"]')?.textContent.trim(), tiles: document.querySelectorAll('#view .sg-tile').length}));
    check(nb.tiles === 39 && /그런 사람은 없어요/.test(nb.note ?? ''), '⑤ 없는 이름 → 첫 쪽 · 알림 한 줄', JSON.stringify(nb));
    check(!errs.length, '⑤ 화면 오류 0', errs.join(' | ')); await ctx.close();
    const ctx3 = await ctxOf(390), q = await ctx3.newPage(), e3 = errsOf(q);
    await q.route('**/next/data/sage39.json', r => r.abort());
    await q.goto(URL_OF('#/sage'), {waitUntil: 'load', timeout: 60000}); await ready(q);
    const em = await q.evaluate(() => document.querySelector('#view .empty')?.textContent.trim());
    check(/^\?/.test(em ?? ''), '⑤ 자료를 못 받으면 「?」 한 줄', em);
    check(!e3.length, '⑤ 자료 못 받음 화면 오류 0', e3.join(' | ')); await ctx3.close();
  }
} catch (e) { check(false, '검사 멈춤', e.stack || e.message); }
await browser.close();
R.brand = BRAND.ko;
if (OUT) await fs.writeFile(OUT, JSON.stringify(R, null, 1));
console.log(`서른아홉 스승 검사 — 통과 ${R.counts.pass} · 실패 ${R.counts.fail}`);
process.exit(R.counts.fail ? 1 : 0);
