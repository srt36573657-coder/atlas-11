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
//      · 읽는 종이 판은 이 쪽에서만 켜지고 다른 쪽으로 가면 꺼짐(html.pg-sage · #view 바탕)
//   ⑥ 읽기(사장님 2026-10-30 00:03 「그게아니라 글씨체랑 글씨크기랑 배경색이랑 글씨색이 가독성이 떨어진다고」 · docs/design/read-2026-10-30/order-0003.txt)
//      — 위 ② ③ ④ 에서 재는 모든 화면마다: 바탕체 0(글씨체 하나) · 글 19px 넘게 · 이야기 넷 · 남긴 말 24px 넘게 · 모든 글이 제 바탕과 대비 7 넘게
//      · 누르는 것의 테(또는 칸 빛)가 둘레와 대비 3 넘게 · 쪽 바탕이 밝은 종이 #FDF9F5
//   ⑦ 듣기(사장님 2026-10-31 22:40(+04) 「응」 · 22:41 「그냥 신 처럼 끝까지 다해」 · docs/design/sage-say-2026-11-01/order-0340.txt) — 가짜 소리 줄(넣은 차례대로 · __next 로 손으로 넘김)
//      — 첫 쪽 맨 위 「서른아홉 스승 모두 듣기」 · 네 걸음 「열 스승 차례로 듣기」(넷째 「아홉 스승」) · 읽는 말 = 쪽 글 그대로 다섯 줄씩(백아흔다섯 · ko-KR · 0.9 · 1 · 0.96)
//      · 읽는 칸 테 · 쪽 아래 글상자 = 듣는 줄(아래 막대 위 · 칸을 안 가림) · 멈추면 읽던 사람을 이 휴대폰에(atlas:sage-at) · 「멈춘 스승부터 이어 듣기」 + 「처음부터」 · 「멈춘 곳: …」
//      · 다시 열어도 그대로 · 이어 듣기 · 걸음 단추로 바꿈 · 쪽 옮김 멈춤 · 끝까지 들으면 지움 · 이 방 지킴이 얼굴(같은 소리 줄) · 쪽 글을 이어 붙여도 쓰지 않을 말 0
//      · 한 사람 쪽 「이야기 듣기」 — 여섯 줄 · 머리 → 네 줄 → 남긴 말 테 · 멈춤 · 다음 사람으로 가면 멈춤 · 끝까지 · 영어 · 소리 없는 휴대폰(단추 없음) · 아주 크게 320
//   ⑧ 얼굴(사장님 2026-11-01 05:46(+04) 「응 캐릭터 만들어서」 · docs/design/sage-art-2026-11-01/order-1046.txt) — 사람마다 여섯째 줄 「남긴 말. …」(⑦ 줄 수에 듦)
//      · 그림 서른아홉이 그림 기계(sage_art.mjs svgOf)와 같음(저장소 파일 · 사이트가 보내는 파일) · 글자 · 스크립트 · style 없음
//      · 첫 쪽 칸마다 얼굴 단추(64px · 읽는 이름 「(이름) 남긴 말 듣기」 · 그림 주소) · 누르면 「(이름)이 남긴 말. …」 한 줄(ko-KR · 0.9 · 1 · 0.96) · 그 칸 테 · 쪽 아래 글상자 · 다시 누르면 멈춤
//      · 모두 듣는 중 얼굴 = 모두 듣기 멈추고 그 말만 · 읽는 사람 얼굴은 눌림 · 한 사람 쪽 머리 얼굴(96px) → 남긴 말 칸 테 · 머리 아래 글상자 · 끝나면 숨김
//      · 영어 · 소리 없는 휴대폰(얼굴은 그림만 · 단추 0) · 아주 크게 320(머리 얼굴 · 칸 넘침 0)
//   실패가 하나라도 있으면 끝 코드 1(결과 파일은 --out 을 줄 때만)
import fs from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {createRequire} from 'node:module';
import {screenHits, RUIN, RUIN_OK} from '../../../site/next/words.js';
import {OLD_NAME_RE, NEW_NAME} from './rename.mjs';
import {cssRules} from './page_rules.mjs';
import {BRAND, josa} from '../../../site/next/brand.js';
import {svgOf, ART as SAGE_ART} from './sage_art.mjs'; // 스승 얼굴 그림 기계(order-1046)

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
  // ⑧ 얼굴 그림 — 자료 이름마다 하나 · 저장소 파일 = 그림 기계 · 글자 · 스크립트 · style · 바깥 그림 없음
  check(Object.keys(SAGE_ART).length === PEOPLE.length && PEOPLE.every(p => SAGE_ART[p.id]), '⑧ 얼굴 그림 서른아홉 = 자료 이름', Object.keys(SAGE_ART).filter(k => !PEOPLE.some(p => p.id === k)).join(','));
  const artBad = [];
  for (const p of PEOPLE) {
    const f = await fs.readFile(path.join(ROOT, 'site/next/sage-art', p.id + '.svg'), 'utf8').catch(() => null);
    if (f !== svgOf(p.id)) artBad.push(p.id + ' 기계와 다름');
    else if (/<text|<script|style=|href=|<image/i.test(f) || f.length > 12000) artBad.push(p.id + ' 글자 · 스크립트 · style · 바깥 그림 · 크기');
  }
  check(!artBad.length, '⑧ 얼굴 그림 파일 서른아홉 = 그림 기계 · 글자 없음 · 12KB 아래', artBad.slice(0, 4).join(' | '));
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
  // ⑥ 읽기 — 글씨체 · 크기 · 대비(바탕은 조상을 거슬러 올라가 처음 칠한 빛을 겹쳐 셈 · check_white 와 같은 셈)
  const rgb = x => { const m = /rgba?\(([^)]+)\)/.exec(x || ''); if (!m) return null; const q = m[1].split(/[ ,/]+/).filter(Boolean).map(Number); return {r: q[0], g: q[1], b: q[2], a: q.length > 3 ? q[3] : 1}; };
  const lin = c => { c /= 255; return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4; };
  const lum = c => 0.2126 * lin(c.r) + 0.7152 * lin(c.g) + 0.0722 * lin(c.b);
  const ratio = (a, b) => { const x = lum(a), y = lum(b); return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05); };
  const mix = (top, under) => ({r: top.r * top.a + under.r * (1 - top.a), g: top.g * top.a + under.g * (1 - top.a), b: top.b * top.a + under.b * (1 - top.a), a: 1});
  const bgOf = el => { const st = []; for (let e = el; e; e = e.parentElement) { const c = rgb(getComputedStyle(e).backgroundColor); if (c && c.a > 0) { st.push(c); if (c.a >= 1) break; } } let c = {r: 255, g: 255, b: 255, a: 1}; for (const x of st.reverse()) c = mix(x, c); return c; };
  out.ser = []; out.lt19 = []; out.low7 = []; out.ui3 = []; out.big = [];
  out.paper = getComputedStyle(v).backgroundColor; out.pg = document.documentElement.classList.contains('pg-sage');
  for (const e of v.querySelectorAll('.sg a[href], .sg button')) { if (!vis(e)) continue; const cs = getComputedStyle(e), own = rgb(cs.backgroundColor), around = bgOf(e.parentElement), bd = parseFloat(cs.borderTopWidth) > 0 ? rgb(cs.borderTopColor) : null;
    const edge = Math.max(own && own.a > 0 ? ratio(mix(own, around), around) : 0, bd && bd.a > 0 ? ratio(mix(bd, around), around) : 0);
    if (((own && own.a > 0 && ratio(mix(own, around), around) > 1.05) || (bd && bd.a > 0)) && edge < 3) out.ui3.push(`${e.className} ${edge.toFixed(2)} 「${e.textContent.trim().slice(0, 14)}」`); }
  for (const e of v.querySelectorAll('.sg-story .sg-bt p, .sg-q p')) { const f = parseFloat(getComputedStyle(e).fontSize) * z; if (f < 23.9) out.big.push(`${e.textContent.trim().slice(0, 12)} ${f}px`); }
  const w = document.createTreeWalker(v, NodeFilter.SHOW_TEXT);
  for (let n = w.nextNode(); n; n = w.nextNode()) {
    const el = n.parentElement, t = n.nodeValue.trim(); if (!t || !el || !el.closest('.sg') || !vis(el)) continue;
    const fs = parseFloat(getComputedStyle(el).fontSize) * z; if (fs < 16.9) out.tiny.push(`${t.slice(0, 16)} ${fs}px`);
    { const cs = getComputedStyle(el), fam = cs.fontFamily, fg = rgb(cs.color), bg = bgOf(el), first = fam.split(',')[0].trim().replace(/["']/g, '');
      if (/gowun|batang|바탕/i.test(fam) || /^serif$/i.test(first)) out.ser.push(`${t.slice(0, 12)} ${first}`);
      if (fs < 18.9) out.lt19.push(`${t.slice(0, 16)} ${fs}px`);
      if (fg) { const c = ratio(mix(fg, bg), bg); if (c < 7) out.low7.push(`${el.className || el.tagName} ${c.toFixed(2)} 「${t.slice(0, 14)}」`); } }
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
  check(!m.ser.length, `${tag} ⑥ 바탕체 0 · 글씨체 하나`, m.ser.slice(0, 3).join(' | '));
  check(!m.lt19.length, `${tag} ⑥ 글 19px 넘게`, m.lt19.slice(0, 3).join(' | '));
  check(!m.big.length, `${tag} ⑥ 이야기 · 남긴 말 24px 넘게`, m.big.slice(0, 3).join(' | '));
  check(!m.low7.length, `${tag} ⑥ 글 대비 7 넘게`, m.low7.slice(0, 3).join(' | '));
  check(!m.ui3.length, `${tag} ⑥ 누르는 것 테 대비 3 넘게`, m.ui3.slice(0, 3).join(' | '));
  check(m.pg && /^rgb\(253, 249, 245\)$/.test(m.paper), `${tag} ⑥ 밝은 종이 바탕`, `${m.pg} ${m.paper}`);
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
      tiles: [...document.querySelectorAll('#view .sg-tile')].map(a => [a.querySelector('a.sg-tl')?.getAttribute('href') ?? null, a.querySelector('.sg-tn')?.textContent.trim(), a.querySelector('.sg-tk2')?.textContent.trim()]),
      safe: document.querySelector('#view .sg ~ .safe, #view .sg .safe')?.textContent.trim(), one: document.querySelector('#view .sg-one')?.textContent.trim(), dots: document.querySelectorAll('#view .sg-sky .sg-dot').length, title: document.title}));
    check(s.h1 === '서른아홉 스승', `${tag} 제목`, s.h1);
    check(s.steps === 4 && s.jumps === 4, `${tag} 걸음 넷 · 단추 넷`, `${s.steps} · ${s.jumps}`);
    check(s.tiles.length === 39 && s.tiles.every((t, i) => t[0] === '#/sage/' + PEOPLE[i].id && t[1] === PEOPLE[i].ko.name && t[2] === PEOPLE[i].ko.key), `${tag} 사람 서른아홉(자료 차례 · 고리 · 이름 · 낱말)`, JSON.stringify(s.tiles.find((t, i) => t[0] !== '#/sage/' + PEOPLE[i]?.id || t[1] !== PEOPLE[i]?.ko.name) ?? s.tiles.length));
    check(s.dots === 39, `${tag} 별 띠 점 서른아홉`, s.dots);
    check(s.one === '묻고, 보고, 따지고, 지켜요.', `${tag} 한목소리`, s.one);
    check(s.safe === SAFE, `${tag} 안전 문장`, s.safe);
    check(s.title === '서른아홉 스승 · ' + NEW_NAME, `${tag} 창 제목`, s.title);
    judge(tag, await MEASURE(p));
    if (w === 390 && !font) { // ⑥ 초점 테 — 글판 안 누르개까지 Tab 으로 가면 테 빛이 둘레와 대비 3 넘게(판 전체 하늘빛 테는 밝은 종이 위 1.9)
      for (let i = 0; i < 40; i++) { await p.keyboard.press('Tab'); if (await p.evaluate(() => !!document.activeElement?.closest('#view .sg'))) break; }
      const fr = await p.evaluate(() => {
        const e = document.activeElement; if (!e?.closest('#view .sg')) return {ok: false, why: '글판 안에 초점이 안 감 ' + (e?.tagName ?? '')};
        const rgb = x => { const m = /rgba?\(([^)]+)\)/.exec(x || ''); if (!m) return null; const q = m[1].split(/[ ,/]+/).filter(Boolean).map(Number); return {r: q[0], g: q[1], b: q[2], a: q.length > 3 ? q[3] : 1}; };
        const lin = c => { c /= 255; return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4; }, lum = c => 0.2126 * lin(c.r) + 0.7152 * lin(c.g) + 0.0722 * lin(c.b);
        let bg = null; for (let x = e.parentElement; x; x = x.parentElement) { const c = rgb(getComputedStyle(x).backgroundColor); if (c && c.a >= 1) { bg = c; break; } }
        const cs = getComputedStyle(e), oc = rgb(cs.outlineColor), on = cs.outlineStyle !== 'none' && parseFloat(cs.outlineWidth) > 0;
        if (!on || !oc || !bg) return {ok: false, why: `테 없음 ${cs.outlineStyle} ${cs.outlineWidth}`};
        const a = lum(oc), b = lum(bg), r = (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);
        return {ok: r >= 3, why: `${e.className} 테 ${cs.outlineColor} · 둘레 ${getComputedStyle(e.parentElement).backgroundColor} · ${r.toFixed(2)}`};
      });
      check(fr.ok, `${tag} ⑥ 초점 테 대비 3 넘게`, fr.why);
      // 걸음 단추 → 그 걸음이 화면 위에
      await p.locator('#view .sg-jump.s3').click(); await p.waitForTimeout(300); // 옮김이 멈출 때까지(3초까지) 기다려 잼 — 쪽이 길면 부드럽게 옮기는 데 오래 걸림
      const top = await p.evaluate(async () => { let a = null; for (let i = 0; i < 30; i++) { const t = document.getElementById('sg-s3')?.getBoundingClientRect().top; if (t != null && a != null && Math.abs(t - a) < 0.5) return t; a = t; await new Promise(r => setTimeout(r, 100)); } return a; });
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
      check(c.go === STEP_HREF[x.step] && c.prev === '#/sage/' + prev.id && c.next === '#/sage/' + next.id && c.all === '#/sage', `${tag} 수르 고리 · 앞 · 다음 · 모두`, `${c.go} ${c.prev} ${c.next}`);
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
    check(dm?.startsWith('서른아홉 스승'), '⑤ 수르 단추 안 「서른아홉 스승」', dm);
    if (dm) { await p.locator('#view .dm a[href="#/sage"]').click(); check(await p.waitForFunction(() => document.querySelectorAll('#view .sg-tile').length === 39, null, {timeout: 8000}).then(() => true, () => false), '⑤ 수르 단추 안 → 첫 쪽'); }
    const tab = await p.evaluate(() => document.querySelector('.tabs a[data-tab="dori"]')?.getAttribute('aria-current'));
    check(tab === 'page', '⑤ 아래 단추 「수르」가 지금 쪽', tab);
    const paper = () => p.evaluate(() => ({pg: document.documentElement.classList.contains('pg-sage'), bg: getComputedStyle(document.querySelector('#view')).backgroundColor}));
    const on = await paper(); check(on.pg && on.bg === 'rgb(253, 249, 245)', '⑤ 서른아홉 스승에서 종이 판 켜짐', JSON.stringify(on));
    await go(p, '#/dori'); await p.waitForFunction(() => !!document.querySelector('#view .dm'), null, {timeout: 8000}).catch(() => {});
    const off = await paper(); check(!off.pg && off.bg !== 'rgb(253, 249, 245)', '⑤ 다른 쪽(#/dori)으로 가면 종이 판 꺼짐', JSON.stringify(off));
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

  // ⑦ 듣기(order-0340) — 로마 신 72 쪽 듣기 넷을 그대로 · 가짜 소리 줄로 맞댐(읽는 말은 자료에서 따로 셈)
  {
    const dotT = s => (/[.?!]$/.test(s) ? s : s + '.');
    const linesK = x => [`${dotT(x.ko.name)} ${dotT(x.ko.key)}`, x.ko.gi, x.ko.seung, x.ko.jeon, x.ko.today, `남긴 말. ${x.ko.say}`], linesE = x => [`${dotT(x.en.name)} ${dotT(x.en.key)}`, x.en.gi, x.en.seung, x.en.jeon, x.en.today, `In their words. ${x.en.say}`]; // 여섯째 줄 = 남긴 말(order-1046)
    const faceK = x => `${josa(x.ko.name, '이')} 남긴 말. ${x.ko.say}`, faceE = x => `In ${x.en.name}’s words. ${x.en.say}`, NL = ALL => ALL.length; // 얼굴을 누르면 읽는 말(order-1046)
    const ALLK = PEOPLE.flatMap(linesK), ALLE = PEOPLE.flatMap(linesE), stepPeople = k => PEOPLE.filter(x => x.step === k), whoK = x => `${x.step}걸음 · ${x.ko.name}`;
    const FAKEQ = () => { // 가짜 소리 줄 — 넣은 차례대로 하나씩 읽음(시작 · 끝 소식) · 한 줄 window.__dur 밀리초 · 멈추면 줄 비움 · __next = 지금 줄을 바로 끝내고 다음으로
      const said = []; window.__said = said; window.__q = []; window.__cancel = 0; window.__dur = 600000;
      class U { constructor(t) { this.text = t; this.lang = ''; this.rate = 1; this.pitch = 1; this.volume = 1; this.onstart = null; this.onend = null; this.onerror = null; } }
      const q = []; let cur = null;
      const next = () => { cur = q.shift() ?? null; if (!cur) return; const u = cur; said.push({text: u.text, lang: u.lang}); u.onstart?.({}); u.__t = setTimeout(() => { if (cur === u) { cur = null; u.onend?.({}); next(); } }, window.__dur); };
      const ss = {get speaking() { return !!cur; }, get pending() { return q.length > 0; }, paused: false, getVoices() { return []; },
        speak(u) { window.__q.push({text: u.text, lang: u.lang, rate: u.rate, pitch: u.pitch, volume: u.volume}); q.push(u); if (!cur) next(); },
        cancel() { window.__cancel++; q.length = 0; const u = cur; cur = null; if (u) { clearTimeout(u.__t); u.onerror?.({error: 'interrupted'}); } }};
      window.__next = () => { const u = cur; if (!u) return; clearTimeout(u.__t); cur = null; u.onend?.({}); next(); };
      Object.defineProperty(window, 'speechSynthesis', {value: ss, configurable: true});
      Object.defineProperty(window, 'SpeechSynthesisUtterance', {value: U, configurable: true, writable: true});
    };
    const NOSAY = () => { Object.defineProperty(window, 'speechSynthesis', {value: undefined, configurable: true}); Object.defineProperty(window, 'SpeechSynthesisUtterance', {value: undefined, configurable: true, writable: true}); };
    const qCtx = async (w, o = {}) => { const c = await ctxOf(w, o); await c.addInitScript(o.fake === false ? NOSAY : FAKEQ); return c; };
    const voiceOk = (x, text, lang) => !!x && x.text === text && x.lang === lang && Math.abs(x.rate - 0.9) < 1e-9 && x.pitch === 1 && Math.abs(x.volume - 0.96) < 1e-9;
    const tap = async (q, sel) => { const b = q.locator(sel).first(); await b.scrollIntoViewIfNeeded(); await b.click(); await q.waitForTimeout(150); };
    const TOP = '#view .sg-hero .sg-allb', RE = '#view .sg-hero .sg-allr', STEP = k => `#view #sg-s${k} .sg-allb`, STORY = '#view .sg-storyb';
    const SI = q => q.evaluate(() => { // 첫 쪽 모습 — 맨 위 단추 · 처음부터 · 멈춘 곳 · 쪽 아래 글상자 · 테 · 걸음 단추 · 소리 줄 · 기억
      const top = document.querySelector('#view .sg-hero .sg-allb'), re = document.querySelector('#view .sg-hero .sg-allr'), c = document.querySelector('#view .sg-hero .sg-allc'), now = document.querySelector('#view .sg-now');
      const nr = now && !now.hidden ? now.getBoundingClientRect() : null, tabs = document.querySelector('.tabs')?.getBoundingClientRect(), ring = [...document.querySelectorAll('#view .rm-say')], rr = ring[0]?.getBoundingClientRect();
      let at = null; try { at = JSON.parse(localStorage.getItem('atlas:sage-at') ?? 'null')?.id ?? null; } catch { at = 'x'; }
      return {label: top?.textContent ?? null, on: top?.classList.contains('sg-allon') ?? null, re: re ? {hid: re.hidden, t: re.textContent, h: Math.round(re.getBoundingClientRect().height)} : null,
        cap: c && !c.hidden ? c.textContent : null, now: now && !now.hidden ? now.textContent : null, nowTop: nr ? nr.top : null, nowBot: nr ? nr.bottom : null, tabsTop: tabs ? tabs.top : innerHeight,
        ring: ring.map(x => x.dataset.id ?? x.className), ringTop: rr ? rr.top : null, ringBot: rr ? rr.bottom : null,
        steps: [...document.querySelectorAll('#view .sg-step .sg-allb')].map(x => x.textContent), stepOn: document.querySelectorAll('#view .sg-step .sg-allb.sg-allon').length,
        q: window.__q?.length ?? 0, said: window.__said?.length ?? 0, cancel: window.__cancel ?? 0, at, hash: location.hash, vw: document.documentElement.clientWidth, sw: document.documentElement.scrollWidth}; });
    const PS = q => q.evaluate(() => { // 한 사람 쪽 모습
      const b = document.querySelector('#view .sg-storyb'), r = b?.getBoundingClientRect(), ring = [...document.querySelectorAll('#view .rm-say')], rr = ring[0]?.getBoundingClientRect(), tabs = document.querySelector('.tabs')?.getBoundingClientRect();
      return {n: document.querySelectorAll('#view .sg-storyb').length, kids: [...(document.querySelector('#view .sg-card')?.children ?? [])].map(x => String(x.className).split(' ')[0]).join('|'),
        label: b?.textContent ?? null, on: b?.classList.contains('sg-allon') ?? null, h: r ? Math.round(r.height) : 0, fs: b ? parseFloat(getComputedStyle(b).fontSize) : 0,
        ring: ring.map(x => String(x.className).split(' ').filter(k => k !== 'rm-say').join('.')), ringTop: rr ? rr.top : null, ringBot: rr ? rr.bottom : null, tabsTop: tabs ? tabs.top : innerHeight,
        now: document.querySelectorAll('#view .sg-now').length, q: window.__q?.length ?? 0, said: window.__said?.length ?? 0, cancel: window.__cancel ?? 0, hash: location.hash}; });
    const joinedHits = async q => screenHits(await q.evaluate(() => document.querySelector('#view')?.cloneNode(true).textContent ?? ''));
    const c1 = await qCtx(390), p = await c1.newPage(), e1 = errsOf(p);
    await p.goto(URL_OF('#/sage'), {waitUntil: 'load', timeout: 60000});
    if (!await ready(p)) check(false, '⑦ 첫 쪽', '안 그려짐');
    else {
      await p.waitForTimeout(200);
      const lay = await p.evaluate(() => { const hero = document.querySelector('#view .sg-hero'), b = hero?.querySelector('.sg-allb'), r = b?.getBoundingClientRect();
        return {hero: [...(hero?.children ?? [])].map(x => String(x.className).split(' ')[0] || x.tagName).join('|'), h: r ? Math.round(r.height) : 0, fs: b ? parseFloat(getComputedStyle(b).fontSize) : 0,
          secs: [...document.querySelectorAll('#view .sg-step')].map(s => [...s.children].map(x => String(x.className).split(' ')[0]).join('|')),
          stepH: [...document.querySelectorAll('#view .sg-step .sg-allb')].map(x => Math.round(x.getBoundingClientRect().height)), now: document.querySelectorAll('#view .sg-now').length}; });
      const S0 = await SI(p);
      check(lay.hero.startsWith('h|sg-lead|sg-all') && lay.h >= 55 && lay.fs >= 20.9 && S0.label === '서른아홉 스승 모두 듣기' && S0.re?.hid === true && S0.cap === null && S0.now === null && S0.at === null && lay.now === 1,
        '⑦ 첫 쪽 맨 위(머리 글 아래 · 별 띠 위) 「서른아홉 스승 모두 듣기」 · 56px · 21px · 「처음부터」 숨김 · 글상자 숨김 · 기억 없음', JSON.stringify({lay, S0}));
      check(lay.secs.length === 4 && lay.secs.every(s => s.startsWith('sg-sh|sg-st|sg-when|sg-all|sg-grid')) && S0.steps.join('|') === '열 스승 차례로 듣기|열 스승 차례로 듣기|열 스승 차례로 듣기|아홉 스승 차례로 듣기' && lay.stepH.every(x => x >= 55),
        '⑦ 네 걸음마다 「이럴 때」 아래 · 사람 칸 위 「열 스승 차례로 듣기」(넷째 「아홉 스승」) · 56px', JSON.stringify({secs: lay.secs, steps: S0.steps, h: lay.stepH}));
      await tap(p, TOP); const S1 = await SI(p), Q = await p.evaluate(() => window.__q.map(x => ({...x})));
      const qb = Q.length === ALLK.length && ALLK.length === 234 ? Q.findIndex((x, i) => !voiceOk(x, ALLK[i], 'ko-KR')) : -2;
      check(qb === -1 && S1.on && S1.label === '멈추기' && S1.ring.join() === PEOPLE[0].id && S1.now === ALLK[0] && S1.nowBot != null && S1.nowBot <= S1.tabsTop + 0.5 && S1.nowTop >= 0 && S1.cap === null && S1.hash === '#/sage',
        '⑦ 누름 → 서른아홉 사람 여섯 줄씩(이백서른네 줄 · 쪽 글 그대로 · 여섯째 = 남긴 말 · ko-KR · 0.9 · 1 · 0.96) · 첫 칸 테 · 쪽 아래 글상자 = 듣는 줄(아래 막대 위) · 「멈추기」', JSON.stringify({qb, n: Q.length, q0: Q[0]?.text, S1}));
      for (let j = 0; j < 7; j++) await p.evaluate(() => window.__next());
      await p.waitForTimeout(500); const S2 = await SI(p);
      check(S2.ring.join() === PEOPLE[1].id && S2.now === ALLK[7] && S2.ringTop >= 57 && S2.ringBot <= S2.nowTop + 0.5 && S2.said === S1.said + 7,
        '⑦ 줄이 끝나면 다음 줄 — 둘째 사람 칸으로 테 · 글상자가 듣는 줄로 · 칸이 위 막대 · 글상자에 안 가림', JSON.stringify(S2));
      await tap(p, TOP); const S3 = await SI(p); await p.waitForTimeout(300); const S3b = await SI(p);
      check(S3.cancel > S2.cancel && !S3.on && S3.label === '멈춘 스승부터 이어 듣기' && S3.re?.hid === false && S3.re?.t === '처음부터' && S3.re?.h >= 47.5 && S3.cap === `멈춘 곳: ${whoK(PEOPLE[1])}` && S3.at === PEOPLE[1].id && S3.now === null && !S3.ring.length && S3b.said === S3.said,
        '⑦ 다시 누르면 멈춤 — 소리 끔 · 읽던 사람을 이 휴대폰에 · 「멈춘 스승부터 이어 듣기」 + 「처음부터」 48px · 「멈춘 곳: …」 · 글상자 · 테 풂 · 뒤 줄 안 읽음', JSON.stringify(S3));
      const h1 = await joinedHits(p); check(!h1.length, '⑦ 쪽 글을 이어 붙여도 쓰지 않을 말 0(이어 듣기 모양)', JSON.stringify(h1));
      await p.reload({waitUntil: 'load'}); await ready(p); await p.waitForTimeout(300); const S4 = await SI(p);
      check(S4.label === '멈춘 스승부터 이어 듣기' && S4.re?.hid === false && S4.cap === `멈춘 곳: ${whoK(PEOPLE[1])}` && S4.at === PEOPLE[1].id, '⑦ 쪽을 다시 열어도 이어 듣기 모양 그대로', JSON.stringify(S4));
      await tap(p, TOP); const S5 = await SI(p), Q5 = await p.evaluate(() => window.__q.map(x => x.text));
      check(S5.on && Q5.length === ALLK.length - 6 && Q5.join('\n') === ALLK.slice(6).join('\n') && S5.ring.join() === PEOPLE[1].id && S5.re?.hid === true && S5.cap === null && S5.now === ALLK[6],
        '⑦ 이어 듣기 — 멈춘 사람 첫 줄부터 끝까지(이백스물여덟 줄) · 그 칸 테 · 「처음부터」 · 「멈춘 곳」 숨김', JSON.stringify({n: Q5.length, S5}));
      const s3 = stepPeople(3); await tap(p, STEP(3)); const S6 = await SI(p), Q6 = await p.evaluate(n => window.__q.slice(n).map(x => x.text), S5.q);
      check(!S6.on && S6.label === '멈춘 스승부터 이어 듣기' && S6.at === PEOPLE[1].id && S6.stepOn === 1 && S6.steps[2] === '멈추기' && Q6.join('\n') === s3.flatMap(linesK).join('\n') && S6.ring.join() === s3[0].id && S6.now === linesK(s3[0])[0],
        '⑦ 모두 듣는 중 걸음 단추 — 모두 듣기는 멈춤(읽던 사람 기억) · 그 걸음 열 사람 예순 줄 · 첫 칸 테 · 글상자', JSON.stringify({n: Q6.length, S6}));
      await tap(p, STEP(3)); const S7 = await SI(p);
      check(S7.stepOn === 0 && S7.steps[2] === '열 스승 차례로 듣기' && S7.now === null && !S7.ring.length && S7.at === PEOPLE[1].id, '⑦ 걸음 단추를 다시 누르면 멈춤 — 처음 모습 · 모두 듣기 기억은 그대로', JSON.stringify(S7));
      await tap(p, TOP); for (let j = 0; j < 6; j++) await p.evaluate(() => window.__next());
      const c8 = (await SI(p)).cancel;
      await p.evaluate(() => { location.hash = '#/sage/plato'; }); await p.waitForTimeout(500);
      const away = await p.evaluate(() => { try { return JSON.parse(localStorage.getItem('atlas:sage-at') ?? 'null')?.id ?? null; } catch { return 'x'; } }), c8b = (await SI(p)).cancel;
      await go(p, '#/sage'); await p.waitForTimeout(300); const S8 = await SI(p);
      check(c8b > c8 && away === PEOPLE[2].id && S8.label === '멈춘 스승부터 이어 듣기' && S8.cap === `멈춘 곳: ${whoK(PEOPLE[2])}`, '⑦ 듣는 중 쪽을 옮기면 멈춤 · 읽던 사람 기억 · 돌아오면 그 사람', JSON.stringify({c8, c8b, away, S8}));
      await tap(p, RE); const S9 = await SI(p), Q9 = await p.evaluate(n => window.__q.slice(n).map(x => x.text), S8.q);
      check(S9.on && Q9.length === ALLK.length && Q9.join('\n') === ALLK.join('\n') && S9.at === null && S9.ring.join() === PEOPLE[0].id, '⑦ 「처음부터」 — 첫 사람부터 이백서른네 줄 · 기억 지움', JSON.stringify({n: Q9.length, S9}));
      await p.evaluate(() => { window.__dur = 15; window.__next(); }); await p.waitForTimeout(15 * ALLK.length + 5000);
      const S10 = await SI(p), tail = await p.evaluate(n => window.__said.slice(-n).map(x => x.text), ALLK.length);
      check(tail.join('\n') === ALLK.join('\n') && !S10.on && S10.at === null && S10.label === '서른아홉 스승 모두 듣기' && S10.re?.hid === true && S10.cap === null && S10.now === null && !S10.ring.length,
        '⑦ 끝까지 — 이백서른네 줄을 쪽 차례대로 다 읽음 · 기억 지움 · 처음 모습', JSON.stringify({n: tail.length, t0: tail[0], S10}));
      const h2 = await joinedHits(p); check(!h2.length, '⑦ 쪽 글을 이어 붙여도 쓰지 않을 말 0(처음 모습)', JSON.stringify(h2));
      const s4 = stepPeople(4), n4 = s4.flatMap(linesK).length; await tap(p, STEP(4)); await p.waitForTimeout(15 * n4 + 3000);
      const S11 = await SI(p), tail4 = await p.evaluate(n => window.__said.slice(-n).map(x => x.text), n4);
      check(tail4.join('\n') === s4.flatMap(linesK).join('\n') && S11.stepOn === 0 && S11.steps[3] === '아홉 스승 차례로 듣기' && S11.now === null && S11.at === null, '⑦ 넷째 걸음 끝까지 — 아홉 사람 쉰네 줄 · 처음 모습 · 모두 듣기 기억 없음', JSON.stringify({n: tail4.length, S11}));
      await p.evaluate(() => { window.__dur = 600000; }); await tap(p, STEP(1));
      const face = p.locator('.rmt button.rms-face').first();
      if (await face.count()) {
        const g0 = await SI(p); await face.scrollIntoViewIfNeeded(); await face.click(); await p.waitForTimeout(200); const S12 = await SI(p), last = await p.evaluate(() => window.__said.at(-1)?.text ?? '');
        check(g0.stepOn === 1 && S12.stepOn === 0 && S12.now === null && !S12.ring.length && S12.cancel > g0.cancel && /^아폴로\./.test(last), '⑦ 걸음 듣는 중 이 방 지킴이(아폴로) 얼굴을 누르면 — 스승 듣기 멈춤 · 지킴이 이야기만(같은 소리 줄)', JSON.stringify({g0: g0.stepOn, S12, last: last.slice(0, 20)}));
        await face.click(); await p.waitForTimeout(150);
      } else check(false, '⑦ 이 방 지킴이 얼굴', '쪽에 없음');
      // 한 사람 쪽 「이야기 듣기」
      const X = PEOPLE.find(x => x.id === 'socrates'), Y = PEOPLE[(PEOPLE.indexOf(X) + 1) % PEOPLE.length];
      await go(p, '#/sage/' + X.id); await p.waitForFunction(n => document.querySelector('#view #sg-name')?.textContent === n, X.ko.name, {timeout: 8000}).catch(() => {}); await p.waitForTimeout(200);
      const P0 = await PS(p);
      check(P0.n === 1 && P0.kids.startsWith('sg-top|sg-head|sg-all|sg-band|sg-story') && P0.label === '이야기 듣기' && P0.h >= 55 && P0.fs >= 20.9 && P0.now === 0, '⑦ 한 사람 쪽 이름 아래(별 띠 위) 「이야기 듣기」 · 56px · 글상자 없음(글이 쪽에 있음)', JSON.stringify(P0));
      await tap(p, STORY); const P1 = await PS(p), PQ = await p.evaluate(n => window.__q.slice(n).map(x => ({...x})), P0.q), wantP = linesK(X);
      const pb = PQ.length === 6 ? PQ.findIndex((x, i) => !voiceOk(x, wantP[i], 'ko-KR')) : -2;
      check(pb === -1 && P1.on && P1.label === '멈추기' && P1.ring.join() === 'sg-head', '⑦ 누름 → 「이름. 큰 낱말.」 · 기 · 승 · 전 · 결 · 「남긴 말. …」 여섯 줄(쪽 글 그대로 · ko-KR) · 머리에 테 · 「멈추기」', JSON.stringify({pb, n: PQ.length, q0: PQ[0]?.text, P1}));
      for (let j = 0; j < 3; j++) await p.evaluate(() => window.__next());
      await p.waitForTimeout(300); const P2 = await PS(p);
      check(P2.ring.join() === 'sg-b.b3' && P2.ringTop >= 57 && P2.ringBot <= P2.tabsTop + 0.5, '⑦ 줄마다 그 줄에 테 — 셋째 줄(전 · 무엇을 · 어떻게) · 화면 안', JSON.stringify(P2));
      await tap(p, STORY); const P3 = await PS(p);
      check(!P3.on && P3.label === '이야기 듣기' && !P3.ring.length && P3.cancel > P2.cancel, '⑦ 다시 누르면 멈춤 — 처음 모습', JSON.stringify(P3));
      await tap(p, STORY); const c13 = (await PS(p)).cancel; await tap(p, '#view .sg-nav a.next'); await p.waitForTimeout(400); const P4 = await PS(p);
      check(P4.cancel > c13 && P4.hash === '#/sage/' + Y.id && P4.label === '이야기 듣기' && !P4.on && !P4.ring.length, '⑦ 듣는 중 다음 사람으로 가면 멈춤 · 새 쪽은 처음 모습', JSON.stringify(P4));
      await p.evaluate(() => { window.__dur = 15; }); await tap(p, STORY); await p.waitForTimeout(15 * 6 + 2000);
      const P5 = await PS(p), t5 = await p.evaluate(() => window.__said.slice(-6).map(x => x.text));
      check(t5.join('\n') === linesK(Y).join('\n') && !P5.on && P5.label === '이야기 듣기' && !P5.ring.length, '⑦ 끝까지 — 여섯 줄 다 읽고 처음 모습', JSON.stringify({t5: t5.map(s => s.slice(0, 12)), P5}));
      const h3 = await joinedHits(p); check(!h3.length, '⑦ 한 사람 쪽 글을 이어 붙여도 쓰지 않을 말 0', JSON.stringify(h3));
    }
    check(!e1.length, '⑦ 화면 오류 0', e1.join(' | ')); await c1.close();
    // 영어
    const c2 = await qCtx(390, {en: true}), r2 = await c2.newPage(), e2 = errsOf(r2);
    await r2.goto(URL_OF('#/sage', '&lang=en'), {waitUntil: 'load', timeout: 60000});
    if (await ready(r2)) {
      await r2.waitForTimeout(200); const E0 = await SI(r2);
      await tap(r2, TOP); const EQ = await r2.evaluate(() => window.__q.map(x => ({...x}))), E1 = await SI(r2);
      const eb = EQ.length === ALLE.length ? EQ.findIndex((x, i) => !voiceOk(x, ALLE[i], 'en-US') || HAN.test(x.text)) : -2;
      await r2.evaluate(() => window.__next()); await r2.waitForTimeout(100); await tap(r2, TOP); const E2 = await SI(r2);
      check(E0.label === 'Hear all thirty-nine in order' && E0.steps.join('|') === 'Hear all ten in order|Hear all ten in order|Hear all ten in order|Hear all nine in order' && eb === -1 && E1.label === 'Stop' && E1.now === ALLE[0]
        && E2.label === 'Resume where I stopped' && E2.re?.t === 'From the start' && E2.cap === `Stopped at: Step ${PEOPLE[0].step} · ${PEOPLE[0].en.name}` && !HAN.test(`${E2.label}${E2.re?.t}${E2.cap}`),
        '⑦ 영어 — 단추 글 · 영어 이백서른네 줄 en-US · 「Stop」 · 「Resume where I stopped」 · 「From the start」 · 「Stopped at: …」', JSON.stringify({E0: {label: E0.label, steps: E0.steps}, eb, n: EQ.length, q0: EQ[0]?.text, E1: {label: E1.label, now: E1.now}, E2}));
      await go(r2, '#/sage/' + PEOPLE[0].id); await r2.waitForTimeout(200); const pq = await r2.evaluate(() => window.__q.length), lb = await r2.evaluate(() => document.querySelector('#view .sg-storyb')?.textContent ?? null);
      await tap(r2, STORY); const EQ2 = await r2.evaluate(n => window.__q.slice(n).map(x => ({...x})), pq);
      const eb2 = EQ2.length === 6 ? EQ2.findIndex((x, i) => !voiceOk(x, linesE(PEOPLE[0])[i], 'en-US')) : -2;
      check(lb === 'Hear the story' && eb2 === -1, '⑦ 영어 한 사람 쪽 — 「Hear the story」 · 여섯 줄 en-US', JSON.stringify({lb, eb2, n: EQ2.length}));
    } else check(false, '⑦ 영어 첫 쪽', '안 그려짐');
    check(!e2.length, '⑦ 영어 화면 오류 0', e2.join(' | ')); await c2.close();
    // 소리 없는 휴대폰 — 단추 · 글상자 없음 · 칸 · 네 줄 그대로
    const c3 = await qCtx(390, {fake: false}), r3 = await c3.newPage(), e3 = errsOf(r3);
    await r3.goto(URL_OF('#/sage'), {waitUntil: 'load', timeout: 60000});
    if (await ready(r3)) {
      const m1 = await r3.evaluate(() => ({b: document.querySelectorAll('#view .sg-allb, #view .sg-allr').length, now: document.querySelectorAll('#view .sg-now').length, tiles: document.querySelectorAll('#view .sg-tile').length}));
      await go(r3, '#/sage/kant'); await r3.waitForTimeout(100);
      const m2 = await r3.evaluate(() => ({b: document.querySelectorAll('#view .sg-allb').length, beats: document.querySelectorAll('#view .sg-story .sg-b').length}));
      check(m1.b === 0 && m1.now === 0 && m1.tiles === 39 && m2.b === 0 && m2.beats === 4, '⑦ 소리 없는 휴대폰 — 듣기 단추 · 글상자 없음 · 칸 서른아홉 · 네 줄 그대로', JSON.stringify({m1, m2}));
    } else check(false, '⑦ 소리 없는 휴대폰 첫 쪽', '안 그려짐');
    check(!e3.length, '⑦ 소리 없는 휴대폰 화면 오류 0', e3.join(' | ')); await c3.close();
    // 아주 크게 320
    const c4 = await qCtx(320, {font: 2}), r4 = await c4.newPage(), e4 = errsOf(r4);
    await r4.goto(URL_OF('#/sage'), {waitUntil: 'load', timeout: 60000});
    if (await ready(r4)) {
      await r4.waitForTimeout(200);
      const B = await r4.evaluate(() => [...document.querySelectorAll('#view .sg-allb')].map(b => { const r = b.getBoundingClientRect(); return [Math.round(r.left), Math.round(r.right), Math.round(r.height)]; }));
      await tap(r4, TOP); for (let j = 0; j < 12; j++) await r4.evaluate(() => window.__next());
      await r4.waitForTimeout(400); const S = await SI(r4);
      check(B.length === 5 && B.every(([l, rt, hh]) => l >= 0 && rt <= S.vw + 0.5 && hh >= 48) && S.sw <= S.vw && S.now === ALLK[12] && S.nowTop >= 0 && S.nowBot <= S.tabsTop + 0.5 && S.ringTop >= 57 && S.ringBot <= S.nowTop + 0.5,
        '⑦ 아주 크게 320 — 단추 다섯 화면 안 · 48px · 넘침 0 · 듣는 중 글상자 아래 막대 위 · 읽는 칸이 글상자에 안 가림', JSON.stringify({B, S}));
      await tap(r4, TOP);
      await go(r4, '#/sage/descartes'); await r4.waitForTimeout(200);
      const PB = await r4.evaluate(() => { const b = document.querySelector('#view .sg-storyb'), r = b?.getBoundingClientRect(); return r ? [Math.round(r.left), Math.round(r.right), Math.round(r.height), document.documentElement.scrollWidth, document.documentElement.clientWidth] : null; });
      check(!!PB && PB[0] >= 0 && PB[1] <= PB[4] + 0.5 && PB[2] >= 48 && PB[3] <= PB[4], '⑦ 아주 크게 320 한 사람 쪽 — 「이야기 듣기」 화면 안 · 48px · 넘침 0', JSON.stringify(PB));
    } else check(false, '⑦ 아주 크게 320 첫 쪽', '안 그려짐');
    check(!e4.length, '⑦ 아주 크게 320 화면 오류 0', e4.join(' | ')); await c4.close();
    // ⑧ 얼굴(order-1046) — 첫 쪽 칸 얼굴 단추 · 누르면 남긴 말 · 한 사람 쪽 머리 얼굴 · 영어 · 소리 없는 휴대폰
    const c5 = await qCtx(390), r5 = await c5.newPage(), e5 = errsOf(r5);
    const served = [];
    for (const x of PEOPLE) { const res = await r5.request.get(`${base}/next/sage-art/${x.id}.svg?v=${Date.now()}`).catch(() => null); const t = res && res.ok() ? await res.text() : null; if (t !== svgOf(x.id)) served.push(`${x.id} ${res ? res.status() : '못 받음'}`); }
    check(!served.length, '⑧ 사이트가 보내는 얼굴 그림 서른아홉 = 그림 기계', served.slice(0, 4).join(' | '));
    await r5.goto(URL_OF('#/sage'), {waitUntil: 'load', timeout: 60000});
    if (await ready(r5)) {
      await r5.waitForTimeout(200);
      const F0 = await r5.evaluate(() => [...document.querySelectorAll('#view .sg-tile')].map(t => { const b = t.querySelector(':scope > button.sg-face'), im = b?.querySelector('img'), r = b?.getBoundingClientRect();
        return {id: t.dataset.id, label: b?.getAttribute('aria-label') ?? null, pressed: b?.getAttribute('aria-pressed') ?? null, src: im?.getAttribute('src') ?? null, alt: im?.getAttribute('alt'), w: r ? Math.round(r.width) : 0, h: r ? Math.round(r.height) : 0, spk: !!b?.querySelector('.rms-spk'), inA: !!b?.closest('a')}; }));
      const hint = await r5.evaluate(() => document.querySelector('#view .sg-hero .sg-hint')?.textContent ?? null);
      const fBad = F0.find((f, i) => f.id !== PEOPLE[i]?.id || f.label !== `${PEOPLE[i]?.ko.name} 남긴 말 듣기` || f.pressed !== 'false' || f.src !== `/next/sage-art/${PEOPLE[i]?.id}.svg` || f.alt !== '' || f.w < 63 || f.h < 63 || !f.spk || f.inA);
      check(F0.length === 39 && !fBad && hint === '얼굴을 누르면 그 스승이 남긴 말을 들려줘요.', '⑧ 첫 쪽 칸마다 얼굴 단추(64px · 「(이름) 남긴 말 듣기」 · 그림 주소 · 소리 표 · 고리 밖) · 모두 듣기 아래 안내 한 줄', JSON.stringify({n: F0.length, fBad, hint}));
      const drawn = await r5.evaluate(async () => { const ims = [...document.querySelectorAll('#view .sg-tile img')].slice(0, 3); for (const im of ims) { im.scrollIntoView({block: 'center'}); try { await im.decode(); } catch { /* 못 그림 */ } } return ims.map(im => im.naturalWidth); });
      check(drawn.length === 3 && drawn.every(w => w > 0), '⑧ 얼굴 그림이 실제로 그려짐(첫 셋)', JSON.stringify(drawn));
      const FACE = id => `#view .sg-tile[data-id="${id}"] > button.sg-face`;
      const FS = q => q.evaluate(() => {
        const now = document.querySelector('#view .sg-now'), nr = now && !now.hidden ? now.getBoundingClientRect() : null, tabs = document.querySelector('.tabs')?.getBoundingClientRect(), rr = document.querySelector('#view .rm-say')?.getBoundingClientRect();
        return {now: now && !now.hidden ? now.textContent : null, nowTop: nr ? nr.top : null, nowBot: nr ? nr.bottom : null, tabsTop: tabs ? tabs.top : innerHeight, ringTop: rr ? rr.top : null, ringBot: rr ? rr.bottom : null,
          ring: [...document.querySelectorAll('#view .rm-say')].map(x => x.dataset.id ?? x.className), pressed: [...document.querySelectorAll('#view button.sg-face[aria-pressed="true"]')].map(b => b.dataset.id),
          q: window.__q.length, said: window.__said.length, cancel: window.__cancel, top: document.querySelector('#view .sg-hero .sg-allb')?.textContent ?? null, hash: location.hash}; });
      const X = PEOPLE[2], f0 = await FS(r5); await tap(r5, FACE(X.id)); const f1 = await FS(r5), fq = await r5.evaluate(n => window.__q.slice(n).map(x => ({...x})), f0.q);
      check(fq.length === 1 && voiceOk(fq[0], faceK(X), 'ko-KR') && f1.now === faceK(X) && f1.ring.join() === X.id && f1.pressed.join() === X.id && f1.nowBot <= f1.tabsTop + 0.5 && f1.ringTop >= 57 && f1.ringBot <= f1.nowTop + 0.5 && f1.hash === '#/sage',
        '⑧ 얼굴을 누르면 「(이름)이 남긴 말. …」 한 줄(쪽 글 그대로 · ko-KR · 0.9 · 1 · 0.96) · 그 칸 테 · 얼굴 눌림 · 쪽 아래 글상자 · 칸이 글상자에 안 가림 · 쪽 그대로', JSON.stringify({fq, f1}));
      await tap(r5, FACE(X.id)); const f2 = await FS(r5);
      check(f2.cancel > f1.cancel && f2.now === null && !f2.ring.length && !f2.pressed.length, '⑧ 다시 누르면 멈춤 — 소리 끔 · 테 · 눌림 · 글상자 숨김', JSON.stringify(f2));
      await tap(r5, FACE(X.id)); await r5.evaluate(() => window.__next()); await r5.waitForTimeout(200); const f3 = await FS(r5);
      check(f3.now === null && !f3.ring.length && !f3.pressed.length, '⑧ 말이 끝나면 처음 모습(글상자 숨김)', JSON.stringify(f3));
      await tap(r5, TOP); const g1 = await FS(r5), Z = PEOPLE[5];
      check(g1.pressed.join() === PEOPLE[0].id && g1.ring.join() === PEOPLE[0].id, '⑧ 모두 듣는 중 — 읽는 사람 얼굴이 눌림', JSON.stringify(g1));
      await tap(r5, FACE(Z.id)); const g2 = await FS(r5), last = await r5.evaluate(() => window.__said.at(-1)?.text ?? '');
      check(g2.cancel > g1.cancel && g2.top === '멈춘 스승부터 이어 듣기' && last === faceK(Z) && g2.ring.join() === Z.id && g2.now === faceK(Z) && g2.pressed.join() === Z.id,
        '⑧ 모두 듣는 중 다른 얼굴을 누르면 — 모두 듣기 멈춤(읽던 사람 기억) · 그 스승 말만 · 그 칸 테 · 글상자', JSON.stringify({g2, last: last.slice(0, 24)}));
      await tap(r5, FACE(Z.id)); await tap(r5, TOP); const g3 = await FS(r5);
      await tap(r5, FACE(g3.pressed[0] ?? PEOPLE[0].id)); const g4 = await FS(r5);
      check(g3.pressed.length === 1 && g4.cancel > g3.cancel && g4.now === null && !g4.ring.length && !g4.pressed.length && g4.top === '멈춘 스승부터 이어 듣기', '⑧ 모두 듣는 중 지금 읽는 얼굴을 누르면 모두 멈춤', JSON.stringify({g3: g3.pressed, g4}));
      const Y = PEOPLE.find(x => x.id === 'sejong');
      await go(r5, '#/sage/' + Y.id); await r5.waitForFunction(n => document.querySelector('#view #sg-name')?.textContent === n, Y.ko.name, {timeout: 8000}).catch(() => {}); await r5.waitForTimeout(200);
      const HP = q => q.evaluate(() => { const b = document.querySelector('#view .sg-head > button.sg-face'), r = b?.getBoundingClientRect(), cap = document.querySelector('#view .sg-head .sg-fcap');
        return {face: !!b, w: r ? Math.round(r.width) : 0, label: b?.getAttribute('aria-label') ?? null, src: b?.querySelector('img')?.getAttribute('src') ?? null, pressed: b?.getAttribute('aria-pressed') ?? null,
          cap: cap && !cap.hidden ? cap.textContent : null, capN: document.querySelectorAll('#view .sg-fcap').length, ring: [...document.querySelectorAll('#view .rm-say')].map(x => String(x.className).split(' ').filter(k => k !== 'rm-say').join('.')),
          story: document.querySelector('#view .sg-storyb')?.textContent ?? null, q: window.__q.length, cancel: window.__cancel}; });
      const h0 = await HP(r5);
      check(h0.face && h0.w >= 95 && h0.label === `${Y.ko.name} 남긴 말 듣기` && h0.src === `/next/sage-art/${Y.id}.svg` && h0.pressed === 'false' && h0.cap === null && h0.capN === 1, '⑧ 한 사람 쪽 머리 얼굴 단추(96px) · 글상자 숨김', JSON.stringify(h0));
      await tap(r5, '#view .sg-head > button.sg-face'); const h1 = await HP(r5), hq = await r5.evaluate(n => window.__q.slice(n).map(x => ({...x})), h0.q);
      check(hq.length === 1 && voiceOk(hq[0], faceK(Y), 'ko-KR') && h1.pressed === 'true' && h1.cap === faceK(Y) && h1.ring.join() === 'sg-say', '⑧ 머리 얼굴을 누르면 남긴 말 한 줄 · 남긴 말 칸에 테 · 머리 아래 글상자', JSON.stringify({hq, h1}));
      await r5.evaluate(() => window.__next()); await r5.waitForTimeout(200); const h2 = await HP(r5);
      check(h2.pressed === 'false' && h2.cap === null && !h2.ring.length, '⑧ 말이 끝나면 처음 모습', JSON.stringify(h2));
      await tap(r5, STORY); const h3 = await HP(r5); await tap(r5, '#view .sg-head > button.sg-face'); const h4 = await HP(r5), lastY = await r5.evaluate(() => window.__said.at(-1)?.text ?? '');
      check(h3.story === '멈추기' && h4.cancel > h3.cancel && lastY === faceK(Y) && h4.story === '이야기 듣기' && h4.cap === faceK(Y), '⑧ 이야기 듣는 중 머리 얼굴 — 이야기 멈춤 · 남긴 말만', JSON.stringify({h3: h3.story, h4}));
      await tap(r5, '#view .sg-head > button.sg-face');
      const h5 = await joinedHits(r5); check(!h5.length, '⑧ 얼굴 단 쪽 글을 이어 붙여도 쓰지 않을 말 0', JSON.stringify(h5));
    } else check(false, '⑧ 첫 쪽', '안 그려짐');
    check(!e5.length, '⑧ 화면 오류 0', e5.join(' | ')); await c5.close();
    const c6 = await qCtx(390, {en: true}), r6 = await c6.newPage(), e6 = errsOf(r6);
    await r6.goto(URL_OF('#/sage/' + PEOPLE[0].id, '&lang=en'), {waitUntil: 'load', timeout: 60000});
    if (await ready(r6)) {
      await r6.waitForTimeout(200); const q0 = await r6.evaluate(() => window.__q.length), lab = await r6.evaluate(() => document.querySelector('#view .sg-head > button.sg-face')?.getAttribute('aria-label') ?? null);
      await tap(r6, '#view .sg-head > button.sg-face'); const eq = await r6.evaluate(n => window.__q.slice(n).map(x => ({...x})), q0), cap = await r6.evaluate(() => document.querySelector('#view .sg-fcap')?.textContent ?? null);
      check(lab === `Hear ${PEOPLE[0].en.name}’s words` && eq.length === 1 && voiceOk(eq[0], faceE(PEOPLE[0]), 'en-US') && !HAN.test(eq[0].text) && cap === faceE(PEOPLE[0]), '⑧ 영어 — 「Hear …’s words」 · 「In …’s words. …」 en-US · 글상자', JSON.stringify({lab, eq, cap}));
      await go(r6, '#/sage'); await r6.waitForTimeout(200);
      const hintE = await r6.evaluate(() => ({hint: document.querySelector('#view .sg-hint')?.textContent ?? null, lab: document.querySelector('#view .sg-tile > button.sg-face')?.getAttribute('aria-label') ?? null}));
      check(hintE.hint === 'Tap a face to hear that master’s words.' && hintE.lab === `Hear ${PEOPLE[0].en.name}’s words`, '⑧ 영어 첫 쪽 안내 한 줄 · 얼굴 이름', JSON.stringify(hintE));
    } else check(false, '⑧ 영어', '안 그려짐');
    check(!e6.length, '⑧ 영어 화면 오류 0', e6.join(' | ')); await c6.close();
    const c7 = await qCtx(390, {fake: false}), r7 = await c7.newPage(), e7 = errsOf(r7);
    await r7.goto(URL_OF('#/sage'), {waitUntil: 'load', timeout: 60000});
    if (await ready(r7)) {
      const n1 = await r7.evaluate(() => ({btn: document.querySelectorAll('#view button.sg-face').length, img: document.querySelectorAll('#view .sg-tile > .sg-fimg img').length, hint: document.querySelectorAll('#view .sg-hint').length}));
      await go(r7, '#/sage/kant'); await r7.waitForTimeout(100);
      const n2 = await r7.evaluate(() => ({btn: document.querySelectorAll('#view button.sg-face').length, img: document.querySelectorAll('#view .sg-head > .sg-fimg img').length, cap: document.querySelectorAll('#view .sg-fcap').length}));
      check(n1.btn === 0 && n1.img === 39 && n1.hint === 0 && n2.btn === 0 && n2.img === 1 && n2.cap === 0, '⑧ 소리 없는 휴대폰 — 얼굴은 그림만(단추 0) · 안내 · 글상자 없음', JSON.stringify({n1, n2}));
    } else check(false, '⑧ 소리 없는 휴대폰', '안 그려짐');
    check(!e7.length, '⑧ 소리 없는 휴대폰 화면 오류 0', e7.join(' | ')); await c7.close();
  }
} catch (e) { check(false, '검사 멈춤', e.stack || e.message); }
await browser.close();
R.brand = BRAND.ko;
if (OUT) await fs.writeFile(OUT, JSON.stringify(R, null, 1));
console.log(`서른아홉 스승 검사 — 통과 ${R.counts.pass} · 실패 ${R.counts.fail}`);
process.exit(R.counts.fail ? 1 : 0);
