// 로마 신 72 쪽 검사(#/roman · site/next/p-roman.js · p-roman.css · 자료 site/next/roman72.js)
//   사장님 2026-10-30(+03) 22:23 「그냥재미삼아 적절한곳에 배치해봐 둘리에」(docs/design/roman72-site-2026-10-31/order-0423.txt)
//   앞 일 2026-10-31 02:49(+08) 「이제는 로마신화에 72명 먼저 선정해」 — 고른 목록 docs/design/roman72-2026-10-31/roman72.json(다른 일꾼 맞대기 check.md)
//   쓰는 법: node scripts/atlas11/next/check_roman.mjs --base http://127.0.0.1:8826 [--pw /opt/node-tools/] [--out 결과.json] [--all]
//     다른 쪽 검사와 같은 꼴(--all · --limit · --shard 를 받음 — 이 검사는 늘 일흔두 자리를 모두 돎)
//   ① 자료(브라우저 없이) — 자리 일흔둘 · 무리 여덟(10 · 11 · 11 · 11 · 6 · 7 · 5 · 11) · 신 일흔둘이 한 번씩(겹침 0 · 빠짐 0)
//      · 신 이름 · 라틴 이름 · 한 줄 소개 · 무리 = 고른 목록 그대로(ONE_FIX 에 까닭을 적은 번호만 한 줄 소개를 뺌) · 빈 칸 0 · 영어 칸 한글 0
//      · 쓰지 않을 말 0(words.js screenHits) · 망치는 길 낱말 0(RUIN · 한국어 · 영어) · 옛 이름 0 · 이름을 글에 박지 않음({N}) · 낱말표가 바꾸는 말 0
//      · 고리 꼴(#/… 또는 고리 없음) · 모양 규칙(p-roman.css 글씨 var(--fs-n) · 여백 var(--sp-n))
//   ② 쪽 세 폭(320 · 360 · 390) + 320 「아주 크게」 — 제목 · 무리 여덟 · 단추 여덟 · 카드 일흔둘(자료 차례 · 자리 · 신 · 라틴 · 한 줄 · 왜 여기 · 무리 · 고리)
//      · 가로 넘침 0 · 누르는 것 48 넘게 · 글 19px 넘게 · 신 이름 24px 넘게 · 모든 글 대비 7 넘게 · 누르는 것 테 대비 3 넘게 · 밝은 종이 바탕 · 쓰지 않을 말 0
//      · 무리 단추를 누르면 그 무리가 화면 위에 옴 · 초점 테 대비 3 넘게
//   ③ 고리 — 카드가 가는 길마다 열어 봄(쪽이 그려짐 · 주소가 바뀌지 않음 · 화면 오류 0 · 종이 판 꺼짐) · 카드를 누르면 그 자리로 감
//   ④ 영어(?lang=en) — 제목 · html lang · 창 제목 영어 · 카드 영어 글 = 자료 · 남은 한글 0 · 같은 재기
//   ⑤ 길 — 둘이 단추 안 「로마 신 72」(서른아홉 스승 다음 줄) → 쪽 · 아래 단추 「둘이」가 지금 쪽 · 종이 판 켜짐 · 다른 쪽이면 꺼짐 · 영어 둘이 단추 안 이름 · 모르는 꼬리 주소도 같은 쪽
//   실패가 하나라도 있으면 끝 코드 1(결과 파일은 --out 을 줄 때만)
import fs from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {createRequire} from 'node:module';
import {screenHits, RUIN, RUIN_OK} from '../../../site/next/words.js';
import {OLD_NAME_RE, NEW_NAME} from './rename.mjs';
import {cssRules} from './page_rules.mjs';
import {BRAND, josa} from '../../../site/next/brand.js';
import {GROUPS, GODS, ZONES, SEATS, ONE_FIX} from '../../../site/next/roman72.js';

const argv = process.argv.slice(2);
const arg = (k, d) => { const i = argv.indexOf(k); return i >= 0 && argv[i + 1] != null && !argv[i + 1].startsWith('--') ? argv[i + 1] : d; };
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../..');
const require = createRequire(String(arg('--pw', process.env.PW_DIR || '/opt/node-tools/')).replace(/\/?$/, '/'));
const base = String(arg('--base', 'http://127.0.0.1:8826')).replace(/\/$/, ''), OUT = arg('--out', null);
const R = {schema: 'duri-check-roman-1', at: new Date().toISOString(), base, counts: {pass: 0, fail: 0}, fails: [], m: {}};
const check = (ok, name, why = '') => { if (ok) R.counts.pass++; else { R.counts.fail++; R.fails.push([name, String(why).slice(0, 300)]); console.log('실패', name, why ? '— ' + String(why).slice(0, 300) : ''); } };
const URL_OF = (hash, q = '') => `${base}/next/?v=${Date.now()}${q}${hash}`;
const HAN = /[가-힣ㄱ-ㅎㅏ-ㅣ]/;
const GLOSS = /갈래|몸값|한 회사 한 표|큰 회사는 크게|거래일|다섯 문|쉬는 돈|챕터/; // 낱말표(site/next/glossary.js)가 화면에서 바꾸는 말
const ZCOUNT = {home: 10, talk: 11, why: 11, dock: 11, top: 6, theme: 7, co: 5, more: 11};
const fillKo = s => String(s).split('{N}').join(NEW_NAME), fillEn = s => String(s).split('{N}').join(BRAND.en);
const SAFE = josa(NEW_NAME, '는') + ' 지난 기록만 보여 줘요. 사고팔기를 권하지 않아요.'; // 둘이 안전 문장(둘이 단추 안과 같은 글)
const WHY = {ko: '왜 여기?', en: 'Why here?'};

/* ── ① 자료 ── */
const LIST = JSON.parse(await fs.readFile(path.join(ROOT, 'docs/design/roman72-2026-10-31/roman72.json'), 'utf8'));
{
  check(SEATS.length === 72, '① 자리 일흔둘', SEATS.length);
  check(ZONES.length === 8 && ZONES.every(z => z.id in ZCOUNT), '① 무리 여덟', ZONES.map(z => z.id).join(','));
  const cnt = ZONES.map(z => SEATS.filter(s => s[0] === z.id).length), want = ZONES.map(z => ZCOUNT[z.id]);
  check(cnt.join() === want.join() && SEATS.every(s => s[0] in ZCOUNT), '① 무리마다 자리 수 10 · 11 · 11 · 11 · 6 · 7 · 5 · 11', cnt.join());
  check(SEATS.every((s, i) => i === 0 || ZONES.findIndex(z => z.id === s[0]) >= ZONES.findIndex(z => z.id === SEATS[i - 1][0])), '① 자리 차례 = 무리 차례');
  const gs = SEATS.map(s => s[4]);
  check(new Set(gs).size === 72 && gs.every(n => Number.isInteger(n) && n >= 1 && n <= 72), '① 신 일흔둘이 한 자리씩(겹침 0 · 빠짐 0)', [...Array(72)].map((_, i) => i + 1).filter(n => !gs.includes(n)).join(','));
  const people = LIST.groups.flatMap((g, k) => g.people.map(p => ({...p, g: k + 1})));
  check(people.length === 72 && LIST.groups.length === 6, '① 고른 목록 여섯 무리 · 일흔두 명', people.length);
  const bad = [];
  for (const p of people) {
    const x = GODS[p.n]; if (!x) { bad.push(`${p.n} 없음`); continue; }
    if (x[0] !== p.name || x[1] !== p.latin) bad.push(`${p.n} 이름 ${x[0]}/${x[1]} ≠ ${p.name}/${p.latin}`);
    if (x[3] !== p.one && !ONE_FIX[p.n]) bad.push(`${p.n} 한 줄 「${x[3]}」 ≠ 「${p.one}」`);
    if (x[5] !== p.g) bad.push(`${p.n} 무리 ${x[5]} ≠ ${p.g}`);
  }
  check(!bad.length && Object.keys(GODS).length === 72, '① 신 이름 · 라틴 · 한 줄 · 무리 = 고른 목록', bad.slice(0, 5).join(' | '));
  check(Object.keys(ONE_FIX).every(n => GODS[n] && String(ONE_FIX[n]).length > 10) && Object.keys(ONE_FIX).length <= 3, '① 한 줄을 바꾼 번호는 까닭과 함께 셋 이하', JSON.stringify(ONE_FIX));
  check(GROUPS.length === 6 && GROUPS.every((g, k) => g[0] === LIST.groups[k].name && g[1] && !HAN.test(g[1])), '① 무리 이름 = 고른 목록', GROUPS.map(g => g[0]).join(','));
  const ko = [], en = [], empty = [];
  for (const s of SEATS) { for (const k of [1, 2, 5, 6]) if (!String(s[k] ?? '').trim()) empty.push(`${s[4]} 칸 ${k}`); ko.push(s[1], s[5]); en.push(s[2], s[6]); }
  for (const [n, g] of Object.entries(GODS)) { for (const k of [0, 1, 2, 3, 4]) if (!String(g[k] ?? '').trim()) empty.push(`신 ${n} 칸 ${k}`); ko.push(g[0], g[3]); en.push(g[2], g[4]); }
  for (const z of ZONES) { ko.push(z.name[0], z.note[0]); en.push(z.name[1], z.note[1]); }
  for (const g of GROUPS) { ko.push(g[0]); en.push(g[1]); }
  check(!empty.length, '① 빈 칸 0', empty.slice(0, 5).join(' | '));
  const K = ko.map(fillKo).join('\n'), E = en.map(fillEn).join('\n');
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
  const nameKo = new RegExp(BRAND.ko + '(?!서)'), nameEn = new RegExp('\\b' + BRAND.en + '\\b'); // 「둘이서」(둘이 함께 — 보통 말)는 이름이 아님
  const own = [...SEATS.flatMap(x => [x[1], x[2], x[5], x[6]]), ...ZONES.flatMap(z => [...z.name, ...z.note])]; // 자리 · 무리 글(고른 목록의 한 줄 소개 「얼굴이 앞뒤 둘이에요」는 보통 말이라 셈 밖)
  check(!own.some(s => nameKo.test(s) || nameEn.test(s)), '① 이름을 글에 박지 않음({N} 으로 · 규칙 76)', own.filter(s => nameKo.test(s) || nameEn.test(s)).slice(0, 3).join(' | '));
  check(!GLOSS.test(K), '① 낱말표가 바꾸는 말 0', K.match(GLOSS)?.[0]);
  check(SEATS.every(s => s[3] === null || /^#\/[a-z0-9/]*$/.test(s[3])), '① 고리 꼴(#/… 또는 고리 없음)', SEATS.filter(s => !(s[3] === null || /^#\/[a-z0-9/]*$/.test(s[3]))).map(s => s[3]).join(','));
  check(SEATS.filter(s => s[3] === null).length <= 6, '① 고리 없는 자리 여섯 이하(제 주소가 없는 단추 · 쪽만)', SEATS.filter(s => s[3] === null).length);
  check(SEATS.every(s => /요\.$/.test(s[5]) && /[.?”]$/.test(s[6])), '① 왜 여기 = 끝난 문장(…요. · 영어 마침표)', SEATS.filter(s => !(/요\.$/.test(s[5]) && /[.?”]$/.test(s[6]))).map(s => s[4]).join(','));
  const css = cssRules('site/next/p-roman.css'); check(!css.length, '① 모양 규칙(글씨 · 여백 잣대)', css.slice(0, 4).join(' | '));
  R.m.seats = SEATS.length; R.m.zones = cnt; R.m.links = new Set(SEATS.map(s => s[3]).filter(Boolean)).size;
}

/* ── 브라우저 ── */
const {chromium} = require('playwright');
const browser = await chromium.launch(process.env.PW_EXE ? {executablePath: process.env.PW_EXE} : {});
const ctxOf = async (w, {font = 0, en = false} = {}) => {
  const ctx = await browser.newContext({viewport: {width: w, height: 800}, deviceScaleFactor: 1, isMobile: true, hasTouch: true, locale: en ? 'en-US' : 'ko-KR', timezoneId: 'Asia/Seoul', reducedMotion: 'reduce'});
  await ctx.addInitScript(([f]) => { try { localStorage.setItem('atlas:essence-seen', 'true'); localStorage.setItem('atlas:white-seen', 'true'); if (f) localStorage.setItem('atlas:font', String(f)); } catch { /* 기억 못 함 */ } }, [font]);
  return ctx;
};
const errsOf = p => { const e = []; p.on('pageerror', x => e.push(String(x.message).slice(0, 160))); return e; };
const ready = p => p.waitForFunction(() => !document.querySelector('#view .boot') && !!document.querySelector('#view .rm, #view .empty'), null, {timeout: 20000}).then(() => true, () => false);
const go = async (p, hash) => { await p.evaluate(h => { location.hash = h; }, hash); return ready(p); };
/** 화면 재기(화면 안에서 돎 — 바깥 이름을 쓰지 않음) — 넘침 · 작은 글 · 작은 누름 · 칸 밖 · 글씨체 · 대비 · 남은 한글(check_sage 와 같은 셈 · 라틴 이름 lang="la" 은 쓰지 않을 말 셈 밖) */
function measureInPage() {
  const v = document.querySelector('#view'), W = document.documentElement.clientWidth, out = {sw: document.documentElement.scrollWidth, cw: W, small: [], tiny: [], text: [], han: [], over: []};
  const vis = e => { const r = e.getBoundingClientRect(); if (!r.width || !r.height) return false; for (let x = e; x && x !== document.body; x = x.parentElement) { const s = getComputedStyle(x); if (s.display === 'none' || s.visibility === 'hidden') return false; } return true; };
  for (const e of v.querySelectorAll('.rm a[href], .rm button')) { if (!vis(e)) continue; const r = e.getBoundingClientRect(); if (r.width < 47.5 || r.height < 47.5) out.small.push(`${e.className} ${Math.round(r.width)}×${Math.round(r.height)} 「${e.textContent.trim().slice(0, 14)}」`); if (r.right > W + 0.5 || r.left < -0.5) out.over.push(`${e.className} ${Math.round(r.left)}~${Math.round(r.right)}`); }
  const z = parseFloat(getComputedStyle(v).zoom) || 1;
  const rgb = x => { const m = /rgba?\(([^)]+)\)/.exec(x || ''); if (!m) return null; const q = m[1].split(/[ ,/]+/).filter(Boolean).map(Number); return {r: q[0], g: q[1], b: q[2], a: q.length > 3 ? q[3] : 1}; };
  const lin = c => { c /= 255; return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4; };
  const lum = c => 0.2126 * lin(c.r) + 0.7152 * lin(c.g) + 0.0722 * lin(c.b);
  const ratio = (a, b) => { const x = lum(a), y = lum(b); return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05); };
  const mix = (top, under) => ({r: top.r * top.a + under.r * (1 - top.a), g: top.g * top.a + under.g * (1 - top.a), b: top.b * top.a + under.b * (1 - top.a), a: 1});
  const bgOf = el => { const st = []; for (let e = el; e; e = e.parentElement) { const c = rgb(getComputedStyle(e).backgroundColor); if (c && c.a > 0) { st.push(c); if (c.a >= 1) break; } } let c = {r: 255, g: 255, b: 255, a: 1}; for (const x of st.reverse()) c = mix(x, c); return c; };
  out.ser = []; out.lt19 = []; out.low7 = []; out.ui3 = []; out.big = [];
  out.paper = getComputedStyle(v).backgroundColor; out.pg = document.documentElement.classList.contains('pg-roman');
  for (const e of v.querySelectorAll('.rm a[href], .rm button')) { if (!vis(e)) continue; const cs = getComputedStyle(e), own = rgb(cs.backgroundColor), around = bgOf(e.parentElement), bd = parseFloat(cs.borderTopWidth) > 0 ? rgb(cs.borderTopColor) : null;
    const edge = Math.max(own && own.a > 0 ? ratio(mix(own, around), around) : 0, bd && bd.a > 0 ? ratio(mix(bd, around), around) : 0);
    if (((own && own.a > 0 && ratio(mix(own, around), around) > 1.05) || (bd && bd.a > 0)) && edge < 3) out.ui3.push(`${e.className} ${edge.toFixed(2)} 「${e.textContent.trim().slice(0, 14)}」`); }
  for (const e of v.querySelectorAll('.rm-gn')) { const f = parseFloat(getComputedStyle(e).fontSize) * z; if (f < 23.9) out.big.push(`${e.textContent.trim().slice(0, 12)} ${f}px`); }
  const w = document.createTreeWalker(v, NodeFilter.SHOW_TEXT);
  for (let n = w.nextNode(); n; n = w.nextNode()) {
    const el = n.parentElement, t = n.nodeValue.trim(); if (!t || !el || !el.closest('.rm') || !vis(el)) continue;
    const fs = parseFloat(getComputedStyle(el).fontSize) * z; if (fs < 16.9) out.tiny.push(`${t.slice(0, 16)} ${fs}px`);
    { const cs = getComputedStyle(el), fam = cs.fontFamily, fg = rgb(cs.color), bg = bgOf(el), first = fam.split(',')[0].trim().replace(/["']/g, '');
      if (/gowun|batang|바탕/i.test(fam) || /^serif$/i.test(first)) out.ser.push(`${t.slice(0, 12)} ${first}`);
      if (fs < 18.9) out.lt19.push(`${t.slice(0, 16)} ${fs}px`);
      if (fg) { const c = ratio(mix(fg, bg), bg); if (c < 7) out.low7.push(`${el.className || el.tagName} ${c.toFixed(2)} 「${t.slice(0, 14)}」`); } }
    if (!el.closest('#view [lang="la"]')) out.text.push(t);
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
  check(!m.ser.length, `${tag} 바탕체 0 · 글씨체 하나`, m.ser.slice(0, 3).join(' | '));
  check(!m.lt19.length, `${tag} 글 19px 넘게`, m.lt19.slice(0, 3).join(' | '));
  check(!m.big.length, `${tag} 신 이름 24px 넘게`, m.big.slice(0, 3).join(' | '));
  check(!m.low7.length, `${tag} 글 대비 7 넘게`, m.low7.slice(0, 3).join(' | '));
  check(!m.ui3.length, `${tag} 누르는 것 테 대비 3 넘게`, m.ui3.slice(0, 3).join(' | '));
  check(m.pg && /^rgb\(253, 249, 245\)$/.test(m.paper), `${tag} 밝은 종이 바탕`, `${m.pg} ${m.paper}`);
  if (!en) { const hit = screenHits(m.text.join('\n')); check(!hit.length, `${tag} 쓰지 않을 말 0`, hit.join(' ')); check(m.text.length > 300, `${tag} 잰 글 수`, m.text.length); }
  else check(!m.han.length, `${tag} 남은 한글 0`, m.han.slice(0, 3).join(' | '));
};
/** 카드 일흔둘 읽기(화면 안) */
const readCards = p => p.evaluate(() => [...document.querySelectorAll('#view .rm-card')].map(c => ({
  tag: c.tagName.toLowerCase(), href: c.getAttribute('href'), n: +c.dataset.n, zone: c.closest('section.rm-zone')?.id ?? null,
  spot: c.querySelector('.rm-spot')?.textContent.trim(), name: c.querySelector('.rm-gn')?.textContent.trim(), la: c.querySelector('.rm-la')?.textContent.trim() ?? null,
  laLang: c.querySelector('.rm-la')?.getAttribute('lang') ?? null, one: c.querySelector('.rm-one')?.textContent.trim(), wl: c.querySelector('.rm-wl')?.textContent.trim(),
  why: c.querySelector('.rm-wt')?.textContent.trim(), grp: c.querySelector('.rm-grp')?.textContent.trim()})));
const cardsOk = (cards, en) => {
  const bad = [];
  if (cards.length !== 72) bad.push('카드 ' + cards.length);
  SEATS.forEach((s, i) => {
    const c = cards[i], g = GODS[s[4]]; if (!c) return;
    const want = en
      ? {spot: fillEn(s[2]), name: g[2], la: g[1] !== g[2] ? g[1] : null, one: g[4], why: fillEn(s[6]), grp: GROUPS[g[5] - 1][1], wl: WHY.en}
      : {spot: fillKo(s[1]), name: g[0], la: g[1], one: g[3], why: fillKo(s[5]), grp: GROUPS[g[5] - 1][0], wl: WHY.ko};
    for (const [k, v] of Object.entries(want)) if (c[k] !== v) bad.push(`${i + 1} ${k} 「${c[k]}」 ≠ 「${v}」`);
    if (c.n !== s[4]) bad.push(`${i + 1} 신 번호 ${c.n} ≠ ${s[4]}`);
    if (c.zone !== 'rm-z-' + s[0]) bad.push(`${i + 1} 무리 ${c.zone}`);
    if (s[3] ? (c.tag !== 'a' || c.href !== s[3]) : (c.tag !== 'div' || c.href !== null)) bad.push(`${i + 1} 고리 ${c.tag} ${c.href} ≠ ${s[3]}`);
    if (c.la !== null && c.laLang !== 'la') bad.push(`${i + 1} 라틴 이름 말(lang)`);
  });
  return bad;
};

try {
  // ② 쪽 세 폭 + 아주 크게
  for (const [w, font] of [[320, 0], [360, 0], [390, 0], [320, 2]]) {
    const tag = `② ${w}${font ? ' 아주 크게' : ''}`, ctx = await ctxOf(w, {font}), p = await ctx.newPage(), errs = errsOf(p);
    await p.goto(URL_OF('#/roman'), {waitUntil: 'load', timeout: 60000});
    if (!await ready(p)) { check(false, `${tag} 쪽`, '안 그려짐'); await ctx.close(); continue; }
    const s = await p.evaluate(() => ({h1: document.querySelector('#view h1')?.textContent.trim(), zones: [...document.querySelectorAll('#view section.rm-zone')].map(e => e.id),
      jumps: [...document.querySelectorAll('#view .rm-jump')].map(b => [b.dataset.z, b.querySelector('b')?.textContent.trim(), b.querySelector('.rm-jc')?.textContent.trim()]),
      safe: document.querySelector('#view .rm .safe')?.textContent.trim(), title: document.title, kk: document.querySelectorAll('#view .rm-zone .kk-box').length}));
    check(s.h1 === '로마 신 72', `${tag} 제목`, s.h1);
    check(s.zones.join() === ZONES.map(z => 'rm-z-' + z.id).join(), `${tag} 무리 여덟(차례)`, s.zones.join());
    check(s.jumps.length === 8 && s.jumps.every((j, k) => j[0] === ZONES[k].id && j[1] === fillKo(ZONES[k].name[0]) && j[2] === `${ZCOUNT[ZONES[k].id]}자리`), `${tag} 무리 단추 여덟(이름 · 자리 수)`, JSON.stringify(s.jumps[0]));
    const bad = cardsOk(await readCards(p), false);
    check(!bad.length, `${tag} 카드 일흔둘 = 자료(차례 · 자리 · 신 · 라틴 · 한 줄 · 왜 여기 · 무리 · 고리)`, bad.slice(0, 4).join(' | '));
    check(s.safe === SAFE, `${tag} 안전 문장`, s.safe);
    check(s.title === '로마 신 72 · ' + NEW_NAME, `${tag} 창 제목`, s.title);
    check(s.kk === 8, `${tag} 무리마다 카톡 단추 하나`, s.kk);
    judge(tag, await MEASURE(p));
    if (w === 390 && !font && OUT) { // 결과 폴더에 사진 셋(깃허브 결과와 함께 main 에 남음 — 끝 보고 그림) — 머리 · 말하는 불빛 무리 · 다른 쪽 무리
      const shot = async (name, sel) => { if (sel) await p.evaluate(q => { const e = document.querySelector(q); if (e) window.scrollTo(0, e.getBoundingClientRect().top + window.scrollY - 70); }, sel); await p.waitForTimeout(250); await p.screenshot({path: path.join(path.dirname(OUT), name), type: 'jpeg', quality: 70}).catch(() => {}); };
      await shot('roman-top.jpg', null); await shot('roman-talk.jpg', '#rm-z-talk'); await shot('roman-more.jpg', '#rm-z-more .rm-grid'); await p.evaluate(() => window.scrollTo(0, 0));
    }
    if (w === 390 && !font) {
      for (let i = 0; i < 40; i++) { await p.keyboard.press('Tab'); if (await p.evaluate(() => !!document.activeElement?.closest('#view .rm'))) break; }
      const fr = await p.evaluate(() => {
        const e = document.activeElement; if (!e?.closest('#view .rm')) return {ok: false, why: '글판 안에 초점이 안 감 ' + (e?.tagName ?? '')};
        const rgb = x => { const m = /rgba?\(([^)]+)\)/.exec(x || ''); if (!m) return null; const q = m[1].split(/[ ,/]+/).filter(Boolean).map(Number); return {r: q[0], g: q[1], b: q[2], a: q.length > 3 ? q[3] : 1}; };
        const lin = c => { c /= 255; return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4; }, lum = c => 0.2126 * lin(c.r) + 0.7152 * lin(c.g) + 0.0722 * lin(c.b);
        let bg = null; for (let x = e.parentElement; x; x = x.parentElement) { const c = rgb(getComputedStyle(x).backgroundColor); if (c && c.a >= 1) { bg = c; break; } }
        const cs = getComputedStyle(e), oc = rgb(cs.outlineColor), on = cs.outlineStyle !== 'none' && parseFloat(cs.outlineWidth) > 0;
        if (!on || !oc || !bg) return {ok: false, why: `테 없음 ${cs.outlineStyle} ${cs.outlineWidth}`};
        const a = lum(oc), b = lum(bg), r = (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);
        return {ok: r >= 3, why: `${e.className} 테 ${cs.outlineColor} · ${r.toFixed(2)}`};
      });
      check(fr.ok, `${tag} 초점 테 대비 3 넘게`, fr.why);
      for (const zid of ['talk', 'co', 'more']) {
        await p.locator(`#view .rm-jump[data-z="${zid}"]`).click(); await p.waitForTimeout(700);
        const top = await p.evaluate(id => document.getElementById('rm-z-' + id)?.getBoundingClientRect().top, zid);
        check(top != null && top >= 0 && top < 200, `${tag} 무리 단추 → ${zid} 가 화면 위`, top);
      }
    }
    check(!errs.length, `${tag} 화면 오류 0`, errs.join(' | ')); await ctx.close();
  }

  // ③ 고리 — 카드가 가는 길마다 열어 봄 · 카드 누름
  {
    const ctx = await ctxOf(390), p = await ctx.newPage(), errs = errsOf(p);
    await p.goto(URL_OF('#/roman'), {waitUntil: 'load', timeout: 60000}); await ready(p);
    const hrefs = [...new Set(SEATS.map(s => s[3]).filter(Boolean))];
    for (const hr of hrefs) {
      await p.evaluate(h => { location.hash = h; }, hr);
      const ok = await p.waitForFunction(() => !document.querySelector('#view .boot') && document.querySelector('#view')?.children.length > 0 && !document.querySelector('#view .rm'), null, {timeout: 20000}).then(() => true, () => false);
      await p.waitForTimeout(150);
      const s = await p.evaluate(() => ({hash: location.hash, h1: document.querySelector('#view h1')?.textContent.trim() ?? '', title: document.title, pg: document.documentElement.classList.contains('pg-roman'), n: document.querySelectorAll('#view *').length}));
      check(ok && s.hash === hr, `③ ${hr} 열림 · 주소 그대로`, `${ok} ${s.hash}`);
      check(s.n > 5 && !/없는 (주소|회사|채널)/.test(s.h1 + s.title), `③ ${hr} 쪽이 그려짐`, `${s.h1} · ${s.title} · ${s.n}`);
      check(!s.pg, `③ ${hr} 종이 판 꺼짐`, s.pg);
      await p.evaluate(() => { location.hash = '#/roman'; }); await ready(p);
    }
    check(!errs.length, '③ 고리 화면 오류 0', errs.join(' | '));
    // 카드 누름 — 서른아홉 스승 카드 → #/sage
    await p.evaluate(() => { location.hash = '#/roman'; }); await ready(p);
    const card = p.locator('#view a.rm-card[href="#/sage"]'); await card.scrollIntoViewIfNeeded(); await card.click();
    check(await p.waitForFunction(() => location.hash === '#/sage' && document.querySelectorAll('#view .sg-tile').length > 0, null, {timeout: 10000}).then(() => true, () => false), '③ 서른아홉 스승 카드 누름 → 그 쪽');
    R.m.linkPages = hrefs.length; await ctx.close();
  }

  // ④ 영어
  {
    const ctx = await ctxOf(390, {en: true}), p = await ctx.newPage(), errs = errsOf(p);
    await p.goto(URL_OF('#/roman', '&lang=en'), {waitUntil: 'load', timeout: 60000});
    if (await ready(p)) {
      await p.waitForTimeout(300);
      const s = await p.evaluate(() => ({h1: document.querySelector('#view h1')?.textContent.trim(), lang: document.documentElement.lang, title: document.title,
        jumps: [...document.querySelectorAll('#view .rm-jump b')].map(e => e.textContent.trim()), why: document.querySelector('#view .rm-wl')?.textContent.trim()}));
      check(s.h1 === '72 Roman Gods' && s.lang === 'en', '④ 제목 · html lang', `${s.h1} · ${s.lang}`);
      check(!HAN.test(s.title) && s.title.startsWith('72 Roman Gods'), '④ 창 제목 영어', s.title);
      check(s.jumps.join('|') === ZONES.map(z => fillEn(z.name[1])).join('|'), '④ 무리 이름 영어', s.jumps.join('|'));
      const bad = cardsOk(await readCards(p), true);
      check(!bad.length, '④ 카드 일흔둘 영어 글 = 자료', bad.slice(0, 4).join(' | '));
      judge('④ 영어', await MEASURE(p), {en: true});
    } else check(false, '④ 영어 쪽', '안 그려짐');
    check(!errs.length, '④ 화면 오류 0', errs.join(' | ')); await ctx.close();
  }

  // ⑤ 길 — 둘이 단추 안 · 아래 단추 · 종이 판 · 영어 이름 · 꼬리 주소
  {
    const ctx = await ctxOf(390), p = await ctx.newPage(), errs = errsOf(p);
    await p.goto(URL_OF('#/dori'), {waitUntil: 'load', timeout: 60000});
    await p.waitForFunction(() => !!document.querySelector('#view .dm a[href="#/roman"]'), null, {timeout: 15000}).catch(() => {});
    const dm = await p.evaluate(() => { const a = [...document.querySelectorAll('#view .dm a')]; const i = a.findIndex(x => x.getAttribute('href') === '#/roman'); return {i, text: a[i]?.textContent.trim(), prev: a[i - 1]?.getAttribute('href'), h: a[i]?.getBoundingClientRect().height}; });
    check(dm.i >= 0 && dm.text?.startsWith('로마 신 72'), '⑤ 둘이 단추 안 「로마 신 72」', JSON.stringify(dm));
    check(dm.prev === '#/sage', '⑤ 서른아홉 스승 다음 줄', dm.prev);
    check(dm.h >= 47.5, '⑤ 줄 높이 48 넘게', dm.h);
    if (dm.i >= 0) { await p.locator('#view .dm a[href="#/roman"]').click(); check(await p.waitForFunction(() => document.querySelectorAll('#view .rm-card').length === 72, null, {timeout: 10000}).then(() => true, () => false), '⑤ 둘이 단추 안 → 로마 신 72'); }
    if (OUT) { await go(p, '#/dori'); await p.waitForTimeout(200); await p.screenshot({path: path.join(path.dirname(OUT), 'roman-dori.jpg'), type: 'jpeg', quality: 70}).catch(() => {}); await go(p, '#/roman'); }
    const tab = await p.evaluate(() => document.querySelector('.tabs a[data-tab="dori"]')?.getAttribute('aria-current'));
    check(tab === 'page', '⑤ 아래 단추 「둘이」가 지금 쪽', tab);
    const paper = () => p.evaluate(() => ({pg: document.documentElement.classList.contains('pg-roman'), sage: document.documentElement.classList.contains('pg-sage'), bg: getComputedStyle(document.querySelector('#view')).backgroundColor}));
    const on = await paper(); check(on.pg && !on.sage && on.bg === 'rgb(253, 249, 245)', '⑤ 로마 신 72에서 종이 판 켜짐', JSON.stringify(on));
    await go(p, '#/dori'); await p.waitForFunction(() => !!document.querySelector('#view .dm'), null, {timeout: 8000}).catch(() => {});
    const off = await paper(); check(!off.pg && off.bg !== 'rgb(253, 249, 245)', '⑤ 다른 쪽(#/dori)으로 가면 종이 판 꺼짐', JSON.stringify(off));
    await go(p, '#/roman/nobody'); await p.waitForTimeout(100);
    check(await p.evaluate(() => document.querySelectorAll('#view .rm-card').length) === 72, '⑤ 모르는 꼬리 주소(#/roman/nobody)도 같은 쪽');
    check(!errs.length, '⑤ 화면 오류 0', errs.join(' | ')); await ctx.close();
    const c2 = await ctxOf(390, {en: true}), q = await c2.newPage(), e2 = errsOf(q);
    await q.goto(URL_OF('#/dori', '&lang=en'), {waitUntil: 'load', timeout: 60000});
    await q.waitForFunction(() => !!document.querySelector('#view .dm a[href="#/roman"]'), null, {timeout: 15000}).catch(() => {}); await q.waitForTimeout(300);
    const en = await q.evaluate(() => document.querySelector('#view .dm a[href="#/roman"]')?.textContent.trim());
    check(en?.startsWith('72 Roman Gods') && !HAN.test(en), '⑤ 영어 둘이 단추 안 「72 Roman Gods」', en);
    check(!e2.length, '⑤ 영어 화면 오류 0', e2.join(' | ')); await c2.close();
  }
} catch (e) { check(false, '검사 멈춤', e.stack || e.message); }
await browser.close();
R.brand = BRAND.ko;
if (OUT) await fs.writeFile(OUT, JSON.stringify(R, null, 1));
console.log(`로마 신 72 검사 — 통과 ${R.counts.pass} · 실패 ${R.counts.fail}`);
process.exit(R.counts.fail ? 1 : 0);
