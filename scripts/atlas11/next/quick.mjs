#!/usr/bin/env node
/**
 * 빠른 검사 — 고친 쪽만 2초(사장님 2026-10-18 00:31 「지금보다 50배 빠르개 하면저 정확하개」 · 「고칠 때마다 하는 검사는 99초에서 2초로」 · brief4 빠른 길 2 · 일꾼 Q)
 *
 * 쓰는 법
 *   node scripts/atlas11/next/quick.mjs '#/why' '#/w/005930' /letter.html [--en] [--w 360 | --w 320,360,390] [--h 640]
 *        [--seed key=json …] [--seed key=@파일.json] [--links] [--fresh] [--json] [--base http://127.0.0.1:8826]
 *   node scripts/atlas11/next/quick.mjs --for site/next/p-why.js[,site/next/app.css]   바뀐 파일 → 그 파일이 그리는 길(아래 FOR 표)
 *   node scripts/atlas11/next/quick.mjs --serve | --status | --stop                     켜 둔 브라우저 켜기 · 보기 · 끄기
 *   node scripts/atlas11/next/quick.mjs --selftest                                      심은 쪽 · 깨끗한 쪽으로 검사 자체 시험(서버 없이)
 *   node scripts/atlas11/next/quick.mjs --bench                                         처음(차가움) · 데운 뒤 걸린 초를 재어 reports/atlas11/speed/<날>.jsonl 에 한 줄
 *   길: '#/…' = 앱 길(<base>/next/?dev=1#/…) · '/…' = 뿌리 쪽(/letter.html · /hello.html) · 'http…' = 그대로
 *   --seed: 쪽을 열기 전에 localStorage 에 넣음(값은 JSON 글 그대로 저장 — 매매일지 · 보유종목 칸 상태) · 열 때마다(goto) 다시 넣음
 *   --en: 영어(?lang=en) — 사전은 지금 scripts/atlas11/next/i18n/en-src.json 을 그대로 씀(add.mjs 로 넣은 줄이 통합 전에도 보임) · --en-built 면 서버의 site/next/i18n/en.json
 *   --fresh: 길마다 새로 엶(기본은 첫 길만 열고 나머지는 앱 안에서 주소 # 만 바꿈 — 빠름) · --links: 화면의 안쪽 고리(#/…)를 하나씩 열어 봄(길마다 40개까지)
 *   끝 코드: 0 = 모두 통과 · 1 = 걸림 있음 · 2 = 검사를 못 함(브라우저 · 서버)
 *
 * 켜 둔 브라우저
 *   크로미움 하나를 playwright launchServer 로 띄워 두고(따로 떨어진 뒷 프로세스) 그 주소를 상태 파일에 적음 — 부를 때마다 거기 붙음(없으면 저절로 띄움 · 시작 잠금 파일로 하나만)
 *   상태 폴더 = $QUICK_STATE 또는 /tmp/claude-0/-home-claude/e38c6e2a-a659-5015-b86a-265061dd2612/scratchpad/quick/(server.json · last-used · server.log)
 *   부름마다 제 새 칸(context — 기억 · 쿠키가 남과 안 섞임)을 열고 끝에 닫음 → 여러 일꾼이 한꺼번에 불러도 안전 · $QUICK_IDLE_MIN(기본 30)분 안 쓰면 저절로 꺼짐
 *
 * 보는 것(길마다 · 폭마다 · 다 그린 뒤 — 「여는 중」 사라짐 · 모양 파일 붙음 · 글꼴 다 받음 · 망 조용 120ms · 두 장 그림 · 고정 쉼 없음)
 *   ① 화면 오류(pageerror · console.error · 못 받은 파일 404) ② 가로 넘침(쪽 전체) ③ 화면 밖으로 나간 칸(넘침을 자르는 부모가 없는 것 · next_en_check judgeBox 와 같은 잣대)
 *   ④ 칸 안에서 넘친 글 ⑤ 17px 아래 글(제 글이 있는 칸 · 16.95 미만 · check_why LAYOUT 과 같은 잣대) ⑥ 누르는 자리 44px 안 됨(a[href] · button · input · select · textarea · summary · [role=button] · 43.5 미만)
 *   ⑦ 옛 이름 남음(brand.js was · rename.mjs nameScan/oldNamesIn — 자료의 실제 회사 이름은 뺌) ⑧ 쓰지 않을 말(words.js screenHits + 지운 36곳 글 · [data-proper] · [lang="ko"] 빼고)
 *   ⑨ --en 이면: 보이는 한글(글 · 이름표 · 꾸밈 글 · 창 제목 — [lang="ko"] · [data-proper] 빼고) · 사전에 없는 틀(window.__atlasI18n.missing()) · html lang = en
 *   ⑩ 「화면을 그리지 못했어요」 · 「여는 중」이 10초 넘게 남음 ⑪ --links 면 안쪽 고리를 열어 그려지는지(처음으로 튕김 · 못 그림 · 오류)
 * 보지 않는 것(느린 검사만 봄 — 끝에 check_changed.mjs 한 번 · 모두는 깃허브)
 *   자료와 화면 숫자 맞대기(회사 % · 업종 수 · 고도리 칸 셈) · 모든 회사 · 모든 길 돌기 · 누르기 흐름(질문 열한 개 끝까지 · 구독 · 담기) · 바꿔치기한 빈 날 길 ·
 *   창 제목 끝 「 · 고도리」 · 3단 누름 수 · 영어 바꿔치기 문장 · 다른 쪽과 글자 맞대기(편지 HELLO_MSG 등)
 */
import fs from 'node:fs';
import path from 'node:path';
import {spawn, spawnSync} from 'node:child_process';
import {createRequire} from 'node:module';
import {fileURLToPath} from 'node:url';
import {screenHits, WHY_OK} from '../../../site/next/words.js'; // WHY_OK = 「왜 사?」 칸(section.wy) 안에서만 허락한 말(사장님 2026-10-28 10:11 · docs/design/why-mock-2026-10-28/order-1011.txt 2)
import {BRAND} from '../../../site/next/brand.js';
import {nameScan, oldNamesIn, allowFromData, OLD_NAMES} from './rename.mjs';

const SELF = fileURLToPath(import.meta.url);
const ROOT = path.resolve(path.dirname(SELF), '../../..');
const VAL = new Set(['--w', '--h', '--seed', '--base', '--pw', '--out', '--for', '--max-links', '--timeout']);
const O = {routes: [], seeds: [], flags: new Set(), v: {}};
for (let i = 2; i < process.argv.length; i++) {
  const a = process.argv[i];
  if (VAL.has(a)) { const x = process.argv[++i]; if (a === '--seed') O.seeds.push(x); else O.v[a] = x; }
  else if (a.startsWith('--')) O.flags.add(a);
  else O.routes.push(a);
}
const flag = k => O.flags.has(k), val = (k, d) => (O.v[k] ?? d);
const PW = val('--pw', '/opt/node-tools/');
const {chromium} = createRequire(PW.endsWith('/') ? PW : PW + '/')('playwright');
const EXE = '/opt/pw-browsers/chromium';
const STATE_DIR = process.env.QUICK_STATE || '/tmp/claude-0/-home-claude/e38c6e2a-a659-5015-b86a-265061dd2612/scratchpad/quick';
const STATE = path.join(STATE_DIR, 'server.json'), LOCK = path.join(STATE_DIR, 'start.lock'), USED = path.join(STATE_DIR, 'last-used'), LOG = path.join(STATE_DIR, 'server.log');
const IDLE_MIN = Number(process.env.QUICK_IDLE_MIN || 30);
const BASE = String(val('--base', 'http://127.0.0.1:8826')).replace(/\/$/, '');
const TIMEOUT = Number(val('--timeout', 10000));
const sec = ms => Math.round(ms / 100) / 10;
const T_START = Date.now(), DEBUG = !!process.env.QUICK_DEBUG, dbg = (...a) => { if (DEBUG) console.error('[' + (Date.now() - T_START) + 'ms]', ...a); };
dbg('불러오기 끝(노드 · playwright)');

/* ── 켜 둔 브라우저 ── */
const readState = () => { try { return JSON.parse(fs.readFileSync(STATE, 'utf8')); } catch { return null; } };
const alive = pid => { if (!pid) return false; try { process.kill(pid, 0); } catch (e) { if (e.code !== 'EPERM') return false; } // 살아 있고 · 우리 켜 둔 프로세스인지(다시 켠 기계에서 같은 번호를 다른 프로세스가 받은 일 막음)
  try { const c = fs.readFileSync('/proc/' + pid + '/cmdline', 'utf8'); return c.includes('quick.mjs') && c.includes('--daemon'); } catch { return true; } };
const mtime = f => { try { return fs.statSync(f).mtimeMs; } catch { return 0; } };
const touch = f => { try { const t = new Date(); fs.utimesSync(f, t, t); } catch { try { fs.writeFileSync(f, ''); } catch { /* 못 적음 */ } } };
const pause = ms => new Promise(r => setTimeout(r, ms)); // 상태 파일 기다림에만(쪽 기다림에는 안 씀)

async function daemon() {
  fs.mkdirSync(STATE_DIR, {recursive: true});
  const server = await chromium.launchServer({...(fs.existsSync(EXE) ? {executablePath: EXE} : {}), headless: true});
  const st = {ws: server.wsEndpoint(), pid: process.pid, browserPid: server.process()?.pid ?? null, at: new Date().toISOString(), idleMin: IDLE_MIN};
  const tmp = STATE + '.' + process.pid + '.tmp'; fs.writeFileSync(tmp, JSON.stringify(st)); fs.renameSync(tmp, STATE);
  touch(USED);
  console.log(new Date().toISOString(), '켬', JSON.stringify(st));
  let closing = false;
  const stop = async why => {
    if (closing) return; closing = true;
    console.log(new Date().toISOString(), '끔', why);
    if (readState()?.pid === process.pid) fs.rmSync(STATE, {force: true});
    try { await server.close(); } catch { /* 이미 꺼짐 */ }
    process.exit(0);
  };
  process.on('SIGTERM', () => stop('SIGTERM')); process.on('SIGINT', () => stop('SIGINT'));
  server.process()?.on('exit', () => stop('브라우저가 꺼짐'));
  setInterval(() => { if (Date.now() - mtime(USED) > IDLE_MIN * 60e3) stop(IDLE_MIN + '분 안 씀'); if (readState()?.pid !== process.pid) stop('상태 파일이 다른 것을 가리킴'); }, 30e3);
}

/** 켜 둔 브라우저에 붙음(없으면 하나만 띄움) → {b, started, ms} */
async function connect() {
  fs.mkdirSync(STATE_DIR, {recursive: true});
  const t0 = Date.now(); let started = false;
  for (let attempt = 0; attempt < 4; attempt++) {
    const st = readState();
    if (st?.ws && alive(st.pid)) {
      try { const b = await chromium.connect(st.ws, {timeout: attempt ? 15000 : 8000}); touch(USED); return {b, started, ms: Date.now() - t0}; }
      catch (e) { if (attempt < 1) continue; try { process.kill(st.pid, 'SIGTERM'); } catch { /* 이미 꺼짐 */ } fs.rmSync(STATE, {force: true}); }
    }
    let mine = false;
    try { fs.writeFileSync(LOCK, String(process.pid), {flag: 'wx'}); mine = true; }
    catch { if (Date.now() - mtime(LOCK) > 40e3) { fs.rmSync(LOCK, {force: true}); continue; } }
    if (mine) {
      fs.rmSync(STATE, {force: true});
      const out = fs.openSync(LOG, 'a');
      spawn(process.execPath, [SELF, '--daemon', '--pw', PW], {detached: true, stdio: ['ignore', out, out], cwd: ROOT, env: {...process.env}}).unref();
      started = true;
    }
    const end = Date.now() + 40e3;
    while (Date.now() < end) { const s = readState(); if (s?.ws && alive(s.pid)) break; if (!mine && !fs.existsSync(LOCK) && !s) break; await pause(40); }
    if (mine) fs.rmSync(LOCK, {force: true});
  }
  throw new Error('브라우저를 켜지 못함 — ' + LOG);
}

/* ── 화면 안에서 재기(page.evaluate 로 넘김 · 바깥 것을 쓰지 않음) ── */
function inPage({en}) {
  const de = document.documentElement, W = de.clientWidth, HN = /[가-힣ㄱ-ㅎㅏ-ㅣ]/;
  const S = new Map(), cs = el => { let s = S.get(el); if (!s) { s = getComputedStyle(el); S.set(el, s); } return s; };
  const desc = e => e.tagName.toLowerCase() + (typeof e.className === 'string' && e.className.trim() ? '.' + e.className.trim().split(/\s+/).slice(0, 2).join('.') : '') + ' 「' + String(e.textContent || e.value || e.getAttribute('aria-label') || '').trim().replace(/\s+/g, ' ').slice(0, 24) + '」';
  const clipped = el => { for (let a = el.parentElement; a && a !== document.body && a !== de; a = a.parentElement) if (cs(a).overflowX !== 'visible') return true; return false; };
  const SKIP = 'script, style, noscript, template, [hidden], svg';
  const V = document.querySelector('#view'), sh = el => (V && !V.contains(el) ? '\u0002' : ''); // 앱 쪽에서 #view 밖(위 · 아래 막대 = 공용 칸) 표시
  const r = {sw: de.scrollWidth, vw: W, out: [], box: [], tiny: [], small: [], han: [], attrs: [], pseudo: [], title: document.title, lang: de.lang,
    boot: !!document.querySelector('#view .boot'), broke: /화면을 그리지 못했어요/.test(document.querySelector('#view')?.textContent ?? ''), app: !!document.querySelector('#view'), missing: null, text: ''};
  for (const el of document.body.querySelectorAll('*')) {
    if (el.closest(SKIP)) continue;
    const s = cs(el); if (s.display === 'none') continue;
    const rc = el.getBoundingClientRect(); if (rc.width < 2 && rc.height < 2) continue; // 눈에 안 보이는 읽기 칸(1px)
    if (s.visibility === 'hidden') continue;
    if ((rc.right > W + 1 || rc.left < -1) && !el.closest('.hpi') && !clipped(el)) r.out.push(sh(el) + desc(el) + ' ' + Math.round(rc.left) + '~' + Math.round(rc.right));
    const own = [...el.childNodes].some(n => n.nodeType === 3 && n.nodeValue.trim());
    if (own && s.overflowX === 'visible' && s.display !== 'inline' && s.textOverflow !== 'ellipsis' && el.clientWidth > 0 && el.scrollWidth > el.clientWidth + 1 && !clipped(el)) r.box.push(sh(el) + desc(el) + ' ' + el.scrollWidth + '>' + el.clientWidth);
    if ((own || (/^(INPUT|TEXTAREA)$/.test(el.tagName) && (el.value || el.placeholder))) && parseFloat(s.fontSize) < 16.95) r.tiny.push(sh(el) + desc(el) + ' ' + s.fontSize);
  }
  for (const e of document.querySelectorAll('a[href], button, input:not([type="hidden"]), select, textarea, summary, [role="button"]')) {
    if (e.closest('script, template, [hidden]')) continue;
    const s = cs(e); if (s.visibility === 'hidden' || s.display === 'none') continue;
    const rc = e.getBoundingClientRect(); if (rc.width < 2 && rc.height < 2) continue;
    if (rc.height < 43.5 || rc.width < 43.5) r.small.push(sh(e) + desc(e) + ' ' + Math.round(rc.width) + '×' + Math.round(rc.height));
  }
  const root = document.querySelector('#view') || document.body, cl = root.cloneNode(true);
  cl.querySelectorAll('[data-proper], [lang="ko"], script, style, noscript, template').forEach(x => x.remove());
  r.wyText = [...cl.querySelectorAll('section.wy')].map(x => x.textContent).join('\n'); cl.querySelectorAll('section.wy').forEach(x => x.remove()); r.text = cl.textContent; // 「왜 사?」 칸 글은 따로 셈(order-1011.txt 2 — 칸 안에서만 「매수」 허락)
  if (en) {
    const OUT = 'body [lang="ko"], body [data-proper], script, style, noscript, template, [hidden]';
    const vis = el => { const s = cs(el); if (s.visibility === 'hidden' || s.display === 'none' || !el.getClientRects().length) return false; return !el.closest('details:not([open]) > :not(summary)'); };
    const key = t => { try { return window.__atlasI18n.templateOf(t).key; } catch { return t; } };
    const w = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
    for (let n = w.nextNode(); n; n = w.nextNode()) { const el = n.parentElement, t = n.nodeValue.trim(); if (!el || !t || !HN.test(t) || el.closest(OUT) || !vis(el)) continue; r.han.push(key(t) === t ? t.slice(0, 60) : key(t).slice(0, 60) + ' ← ' + t.slice(0, 40)); }
    for (const a of ['aria-label', 'title', 'placeholder', 'alt']) for (const el of document.querySelectorAll('[' + a + ']')) { if (el.closest(OUT)) continue; const v = el.getAttribute(a); if (HN.test(v)) r.attrs.push('@' + a + ' ' + v.slice(0, 60)); }
    const sels = [], walk = rules => { for (const ru of rules) { if (ru.cssRules) walk(ru.cssRules); if (ru.selectorText && /::?(before|after)/.test(ru.selectorText) && HN.test(ru.style?.content ?? '')) sels.push(ru.selectorText); } };
    for (const sh of document.styleSheets) { try { walk(sh.cssRules); } catch { /* 다른 곳 글꼴표 */ } }
    for (const sel of sels) for (const part of sel.split(',')) { const m = /^(.*?)::?(before|after)\s*$/.exec(part.trim()); if (!m) continue; let els = []; try { els = document.querySelectorAll(m[1] || '*'); } catch { continue; }
      for (const el of els) { if (el.closest(OUT) || !vis(el)) continue; const c = getComputedStyle(el, '::' + m[2]).content; if (c && HN.test(c)) r.pseudo.push('::' + m[2] + ' ' + c.slice(0, 40)); } }
    try { r.missing = window.__atlasI18n?.missing?.() ?? null; } catch { r.missing = null; }
  }
  return r;
}

/* ── 잣대(노드 쪽) ── */
const OLD36 = (() => { try { return JSON.parse((/export const OLD36_TEXT = (\[[^\]]*\]);/.exec(fs.readFileSync(path.join(ROOT, 'scripts/atlas11/t365/inspect4.mjs'), 'utf8')) || [, '[]'])[1].replace(/'/g, '"')); } catch { return []; } })();
const OLD_KO = OLD_NAMES.filter(x => /[가-힣]/.test(x));
const OLD_EN_RE = (() => { const en = BRAND.was.map(w => w.en).filter(Boolean); return en.length ? new RegExp('\\b(?:' + en.map(s => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|') + ')\\b') : /(?!)/; })();
let ALLOW = null;
/** 자료에 있는 실제 이름 가운데 옛 이름 글자가 든 것(회사 「아틀라스링크」 등) — 옛 이름 글자가 화면에 보일 때만 받음 */
async function allowList() {
  if (ALLOW) return ALLOW;
  const get = async f => { try { const r = await fetch(BASE + '/atlas/data/' + f); return r.ok ? await r.json() : null; } catch { return null; } };
  const [mkt, names, core, home] = await Promise.all(['mkt.json', 'names.json', 'core.json', 'home.json'].map(get));
  ALLOW = allowFromData({mkt, names, extra: [...(core?.industries || []).map(i => i.name), ...(core?.groups || []).map(g => g.name), ...(home?.us?.rows || []).map(r => r.name)]});
  return ALLOW;
}
/** 한 번 잰 것 → 걸림 목록 [[갈래, 보기]] */
async function rules(r, scan, {en, allow = null}) {
  const f = [], add = (k, xs0, n = 4) => { // 공용 칸(#view 밖 · 표시 \u0002)은 따로 — 길마다 되풀이하지 않게 runRoutes 가 한 번만 셈
    for (const [xs, shell] of [[xs0.filter(x => !String(x).startsWith('\u0002')), false], [xs0.filter(x => String(x).startsWith('\u0002')).map(x => x.slice(1)), true]]) {
      for (const x of xs.slice(0, n)) f.push([k, x, shell]); if (xs.length > n) f.push([k, '… 외 ' + (xs.length - n) + '개', shell]); } };
  if (r.boot) f.push(['여는 중 남음', '「여는 중」이 그대로']);
  if (r.broke) f.push(['화면을 못 그림', '「? 화면을 그리지 못했어요」']);
  if (r.sw > r.vw) f.push(['가로 넘침', r.sw + 'px > ' + r.vw + 'px']);
  add('화면 밖으로 나간 칸', r.out); add('칸 안에서 넘친 글', r.box); add('17px 아래 글', r.tiny); add('누르는 자리 44px 안 됨', r.small);
  add('쓰지 않을 말', [...screenHits(r.text), ...OLD36.filter(w => r.text.includes(w)),
    ...screenHits(r.wyText ?? '').filter(w => !WHY_OK.includes(w)), ...OLD36.filter(w => (r.wyText ?? '').includes(w))].map(w => '「' + w + '」')); // 칸 안 = WHY_OK 만 빼고 그대로(order-1011.txt 2)
  const flatAll = [scan.title, scan.text, ...scan.attrs, ...scan.meta].join('\n');
  if (OLD_NAMES.some(n => flatAll.includes(n))) {
    const al = allow ?? await allowList();
    if (!en) add('옛 이름 남음', oldNamesIn(scan, al));
    else {
      const strip = s => { let t = String(s ?? ''); for (const a of al) t = t.split(a).join(' '); return t; };
      const hits = [];
      for (const [w, s] of [['창 제목', scan.title], ['글', scan.text], ...scan.attrs.map(a => ['이름표', a]), ...scan.meta.map(a => ['머리말', a])]) {
        const t = strip(s); const m = OLD_EN_RE.exec(t) || (OLD_KO.find(k => t.includes(k)) ? {index: Math.min(...OLD_KO.filter(k => t.includes(k)).map(k => t.indexOf(k))), 0: OLD_KO.find(k => t.includes(k))} : null);
        if (m) hits.push(w + ' 「' + t.slice(Math.max(0, m.index - 20), m.index + String(m[0]).length + 20).replace(/\s+/g, ' ').trim() + '」');
      }
      add('옛 이름 남음', hits);
    }
  }
  if (en) {
    add('한글 남음', r.han); add('한글 남음(이름표)', r.attrs); add('한글 남음(꾸밈 글)', r.pseudo);
    if (/[가-힣]/.test(r.title)) f.push(['창 제목 한글', r.title]);
    if (r.app && r.lang !== 'en') f.push(['html lang', String(r.lang)]);
    if (r.app && r.missing == null) f.push(['영어 엔진 없음', 'window.__atlasI18n 없음']);
  }
  return f;
}

/* ── 열기 · 기다리기 ── */
const urlOf = (route, en) => {
  if (/^https?:/.test(route)) return route;
  if (route.startsWith('#')) return BASE + '/next/?dev=1' + (en ? '&lang=en' : '') + route;
  const [p, h = ''] = route.split('#');
  return BASE + p + (en ? (p.includes('?') ? '&' : '?') + 'lang=en' : '') + (h ? '#' + h : '');
};
/** 망 조용 — 이 쪽이 낸 요청이 다 끝나고 quiet ms 동안 새 요청이 없음(최대 cap) */
function netQuiet(st, quiet = 120, cap = 1500) {
  return new Promise(res => { const t0 = Date.now(); const tick = () => { const now = Date.now(); if (st.n === 0 && now - st.last >= quiet) return res(true); if (now - t0 >= cap) return res(false); setTimeout(tick, 15); }; tick(); });
}
async function settled(p, st, {app, en}) {
  const miss = [];
  if (app) {
    const ok = await p.waitForFunction(en => { const v = document.querySelector('#view'); if (!v || !v.firstElementChild || v.querySelector('.boot')) return false; if (window.__qTok && v.firstElementChild === window.__qTok) return false; return !en || !!window.__atlasI18n; }, en, {timeout: TIMEOUT, polling: 'raf'}).then(() => true, () => false);
    if (!ok) miss.push(['여는 중 남음', (TIMEOUT / 1000) + '초 안에 안 그려짐']);
  } else await p.waitForLoadState('load', {timeout: TIMEOUT}).catch(() => miss.push(['여는 중 남음', '쪽 load 가 ' + (TIMEOUT / 1000) + '초 안에 안 옴']));
  const css = await p.evaluate(t => Promise.race([
    Promise.all([...document.querySelectorAll('link[rel="stylesheet"]')].map(l => (l.sheet ? 0 : new Promise(r => { l.addEventListener('load', r, {once: true}); l.addEventListener('error', r, {once: true}); })))).then(() => document.fonts.ready),
    new Promise(r => setTimeout(r, t)),
  ]).then(() => [...document.querySelectorAll('link[rel="stylesheet"]')].filter(l => !l.sheet).map(l => l.getAttribute('href'))), 4000);
  if (css.length) miss.push(['모양 파일 안 붙음', css.join(' ')]);
  dbg('모양 · 글꼴');
  await netQuiet(st);
  dbg('망 조용');
  await p.evaluate(() => new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r))));
  return miss;
}

/** 길 여럿을 한 칸에서 — 돌려줌 [{route, ms, fails: [[갈래, 보기, 폭]]}] */
async function runRoutes(b, routes, {en = false, enBuilt = false, widths = [360], h = 640, seeds = [], fresh = false, links = false, maxLinks = 40} = {}) {
  const ctx = await b.newContext({viewport: {width: widths[0], height: h}, deviceScaleFactor: 1, hasTouch: true});
  dbg('새 칸');
  if (en && !enBuilt) { // 영어 사전 = 지금 en-src.json 그대로(i18n_build 와 같은 꼴) — add.mjs 로 막 넣은 줄도 바로 봄(통합이 en.json 을 다시 만들기 전)
    let body = null; try { const S = JSON.parse(fs.readFileSync(path.join(ROOT, 'scripts/atlas11/next/i18n/en-src.json'), 'utf8')); body = JSON.stringify({schema: 'atlas-new-i18n-1', lang: 'en', note: 'quick.mjs — en-src.json 그대로', entities: S.entities, templates: S.templates}); } catch { /* 원본 못 읽음 — 서버 것 */ }
    if (body) await ctx.route(/\/next\/i18n\/en\.json(\?|$)/, r => r.fulfill({status: 200, contentType: 'application/json; charset=utf-8', body}));
  }
  if (seeds.length) await ctx.addInitScript(sd => { try { if (window.top !== window) return; for (const [k, v] of sd) localStorage.setItem(k, v); } catch { /* 기억 못 하는 쪽 */ } }, seeds);
  const p = await ctx.newPage();
  const errs = [], st = {n: 0, last: Date.now()};
  p.on('pageerror', e => errs.push('pageerror ' + e.message));
  p.on('console', m => { if (m.type() === 'error') errs.push(m.text().slice(0, 160) + (m.location()?.url ? ' @' + m.location().url.replace(BASE, '') : '')); });
  p.on('request', () => { st.n++; st.last = Date.now(); });
  const done = () => { st.n = Math.max(0, st.n - 1); st.last = Date.now(); };
  p.on('requestfinished', done); p.on('requestfailed', done);
  const seen = new Set(), out = [], shellFails = [];
  const onApp = () => p.url().startsWith(BASE + '/next/');
  for (const route of routes) {
    const t0 = Date.now(), fails = [], app = route.startsWith('#');
    errs.length = 0;
    if (app && onApp() && !fresh) {
      const cur = await p.evaluate(() => location.hash || '#/');
      if (cur !== route) await p.evaluate(hh => { window.__qTok = document.querySelector('#view')?.firstElementChild ?? null; location.hash = hh; }, route);
    } else {
      const res = await p.goto(urlOf(route, en), {waitUntil: 'commit', timeout: TIMEOUT}).catch(e => { fails.push(['못 엶', e.message.split('\n')[0], widths[0]]); return null; });
      if (res && res.status() >= 400) fails.push(['못 엶', 'HTTP ' + res.status(), widths[0]]);
    }
    dbg(route, '열기 보냄');
    for (const [k, x] of await settled(p, st, {app, en})) fails.push([k, x, widths[0]]);
    dbg(route, '다 그림');
    for (const w of widths) {
      if (w !== (p.viewportSize()?.width)) { await p.setViewportSize({width: w, height: h}); await p.evaluate(() => new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r)))); }
      const r = await p.evaluate(inPage, {en}), scan = await p.evaluate(nameScan);
      dbg(route, w, '잼');
      if (r.missing) { r.missing = r.missing.filter(m => !seen.has(m.key)); for (const m of r.missing) seen.add(m.key); }
      for (const [k, x, shell] of await rules(r, scan, {en})) (shell ? shellFails : fails).push([k, x, w]);
      for (const m of r.missing ?? []) fails.push(['사전에 없는 틀', m.key + (m.ex && m.ex !== m.key ? ' ← ' + m.ex : ''), w]);
    }
    if (links && app) {
      const hrefs = [...new Set(await p.evaluate(() => [...document.querySelectorAll('#view a[href^="#/"]')].map(a => a.getAttribute('href'))))].filter(x => x !== route).slice(0, maxLinks);
      for (const hh of hrefs) {
        errs.length = 0;
        await p.evaluate(x => { window.__qTok = document.querySelector('#view')?.firstElementChild ?? null; location.hash = x; }, hh);
        const miss = await settled(p, st, {app: true, en});
        const g = await p.evaluate(() => ({hash: location.hash, broke: /화면을 그리지 못했어요/.test(document.querySelector('#view')?.textContent ?? '')}));
        for (const [k, x] of miss) fails.push(['고리 ' + k, hh + ' ' + x, widths.at(-1)]);
        if (g.broke) fails.push(['고리 못 그림', hh, widths.at(-1)]);
        else if (g.hash !== hh && (g.hash === '#/' || g.hash === '')) fails.push(['고리가 처음으로 튕김', hh + ' → ' + g.hash, widths.at(-1)]);
        for (const e of errs) fails.push(['고리 화면 오류', hh + ' ' + e, widths.at(-1)]);
      }
      errs.length = 0;
      await p.evaluate(x => { window.__qTok = document.querySelector('#view')?.firstElementChild ?? null; location.hash = x; }, route); await settled(p, st, {app: true, en});
    }
    for (const e of [...new Set(errs)]) fails.push(['화면 오류', e, widths.at(-1)]);
    out.push({route, ms: Date.now() - t0, fails});
    if (p.viewportSize()?.width !== widths[0]) await p.setViewportSize({width: widths[0], height: h});
  }
  await ctx.close().catch(() => {});
  const uniq = new Map(); for (const x of shellFails) { const key = x[0] + '|' + x[1].replace(/ \d+(\.\d+)?px$| \d+×\d+$| -?\d+~\d+$| \d+>\d+$/, '') + '|' + x[2]; if (!uniq.has(key)) uniq.set(key, x); }
  if (app0(routes)) out.push({route: '(공용 칸 — 위 · 아래 막대 · #view 밖 · 길마다 같아 한 번만)', ms: 0, fails: [...uniq.values()], shell: true});
  return out;
}
const app0 = routes => routes.some(r => r.startsWith('#'));

/* ── 바뀐 파일 → 길 ── */
const FOR = [
  [/^site\/next\/p-why\.(js|css)$/, ['#/why', '#/', '#/me']],
  [/^site\/next\/p-gdr\.(js|css)$/, ['#/gdr', '#/gdr/1', '#/']],
  [/^site\/next\/p-hold\.(js|css)$/, ['#/me']],
  [/^site\/next\/p-co\.(js|css)$/, ['#/w/005930']],
  [/^site\/next\/p-chx\.(js|css)$/, ['#/f/ind']],
  [/^site\/next\/p-today\.(js|css)$/, ['#/today', '#/']],
  [/^site\/next\/p-share\.(js|css)$/, ['#/me']],
  [/^site\/next\/p-(past|rivals|grow|range)\.(js|css)$/, m => ['#/w/005930/' + m[1]]],
  [/^site\/next\/p-surge\.(js|css)$/, ['#/surge', '#/surge/10']],
  [/^site\/next\/p-([a-z]+)\.(js|css)$/, m => ['#/' + m[1]]],
  [/^site\/next\/(app\.js|app\.css|index\.html|brand\.js|words\.js|glossary\.js|kakao\.js)$/, ['#/', '#/why', '#/w/005930', '#/me', '#/sub', '#/shorts']],
  [/^site\/(letter)\.(html|css|js)$/, ['/letter.html']],
  [/^site\/hello/, ['/hello.html']],
  [/^site\/privacy\.html$/, ['/privacy.html']],
];
function routesFor(files) { const s = new Set(); for (const f of files) for (const [re, r] of FOR) { const m = re.exec(f); if (m) { for (const x of (typeof r === 'function' ? r(m) : r)) s.add(x); break; } } return [...s]; }

/* ── 검사 자체 시험(서버 없이 · 같은 잣대 길) ── */
async function selftest() {
  const {b} = await connect();
  const T0 = Date.now(), bad = [];
  const BIG = '<style>body{margin:0;font:18px/1.5 sans-serif} button,a{display:inline-block;min-width:44px;min-height:44px;font:inherit}</style>';
  const planted = BIG + '<div id="view">'
    + '<div class="wide" style="width:600px;height:20px">넓은 칸</div>'
    + '<div style="overflow-x:auto;width:200px"><div class="clip" style="width:900px">clip-row</div></div>'
    + '<p class="tiny" style="font-size:13px">작은 글</p>'
    + '<button class="b30" style="width:30px;height:30px;min-width:0;min-height:0">x</button>'
    + '<p class="ko">한글 남음 글</p><p lang="ko">원문은 안 셈</p>'
    + '<p class="old">아틀란스 첫 화면</p><p data-proper>보드리 남의 글은 안 셈</p><p>아틀라스링크 회사</p>'
    + '<p class="ban">오늘의 추천 종목</p>'
    + '</div><script>console.error("심은 오류"); window.__atlasI18n = {missing: () => [{key: "심은 틀 {n}", ex: "심은 틀 3"}], templateOf: s => ({key: s})};</script>';
  const cleanKo = BIG + '<div id="view"><h1 style="font-size:24px">깨끗한 쪽</h1><p>지난 기록만 보여 줘요.</p><button>누르기</button><a href="#/x">고리</a>'
    + '<div style="overflow-x:auto;width:300px"><div style="width:900px">옆으로 미는 줄</div></div><p data-proper>아틀라스링크</p><p>아틀라스링크 회사</p></div>';
  const cleanEn = BIG + '<div id="view"><h1 style="font-size:24px">Clean page</h1><p>Only past records.</p><button>Tap</button><p lang="ko">원문 그대로</p><p data-proper>보드리</p></div>'
    + '<script>document.documentElement.lang = "en"; window.__atlasI18n = {missing: () => [], templateOf: s => ({key: s})};</script>';
  const run = async (html, en) => {
    const ctx = await b.newContext({viewport: {width: 360, height: 640}, deviceScaleFactor: 1, hasTouch: true}), p = await ctx.newPage(), errs = [];
    p.on('pageerror', e => errs.push('pageerror ' + e.message)); p.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
    await p.setContent('<!doctype html><html lang="' + (en ? 'en' : 'ko') + '"><head><meta charset="utf-8"><title>' + (en ? 'Test' : '시험') + '</title></head><body>' + html + '</body></html>');
    await p.evaluate(() => new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r))));
    const r = await p.evaluate(inPage, {en}), scan = await p.evaluate(nameScan);
    const f = await rules(r, scan, {en, allow: ['아틀라스링크']});
    for (const m of r.missing ?? []) f.push(['사전에 없는 틀', m.key]);
    for (const e of errs) f.push(['화면 오류', e]);
    await ctx.close(); return f;
  };
  const kinds = f => new Set(f.map(x => x[0]));
  const want = {en: ['가로 넘침', '화면 밖으로 나간 칸', '17px 아래 글', '누르는 자리 44px 안 됨', '한글 남음', '옛 이름 남음', '쓰지 않을 말', '화면 오류', '사전에 없는 틀'],
    ko: ['가로 넘침', '화면 밖으로 나간 칸', '17px 아래 글', '누르는 자리 44px 안 됨', '옛 이름 남음', '쓰지 않을 말', '화면 오류']};
  const fEn = await run(planted, true), fKo = await run(planted, false), cK = await run(cleanKo, false), cE = await run(cleanEn, true);
  for (const [mode, f] of [['en', fEn], ['ko', fKo]]) for (const k of want[mode]) if (!kinds(f).has(k)) bad.push(`심은 쪽(${mode})에서 「${k}」 못 잡음`);
  const leak = (f, re, why) => { for (const x of f) if (re.test(x[1])) bad.push(why + ': ' + x.join(' · ')); };
  for (const f of [fEn, fKo]) { leak(f.filter(x => /넘침|밖으로/.test(x[0])), /clip/, '잘리는 부모 안 칸을 셈'); leak(f, /원문은 안 셈|남의 글은 안 셈/, 'lang=ko · data-proper 를 셈'); leak(f, /아틀라스링크/, '자료의 회사 이름을 옛 이름으로 셈'); }
  if (fKo.some(x => x[0] === '한글 남음')) bad.push('한국어 쪽에서 「한글 남음」을 셈');
  if (cK.length) bad.push('깨끗한 쪽(ko)이 걸림: ' + cK.map(x => x.join(' · ')).join(' | '));
  if (cE.length) bad.push('깨끗한 쪽(en)이 걸림: ' + cE.map(x => x.join(' · ')).join(' | '));
  await b.close();
  const caught = want.en.filter(k => kinds(fEn).has(k)).length + want.ko.filter(k => kinds(fKo).has(k)).length, total = want.en.length + want.ko.length;
  console.log(`검사 자체 시험 · 심은 쪽 잡음 ${caught}/${total}(en ${want.en.length} · ko ${want.ko.length}) · 깨끗한 쪽 ${cK.length + cE.length ? '걸림' : '통과'} 2/2 · ${sec(Date.now() - T0)}초`);
  if (flag('--json')) console.log(JSON.stringify({fEn, fKo, cK, cE}, null, 1));
  for (const x of bad) console.log('  틀림: ' + x);
  console.log(bad.length ? '실패 ' + bad.length : '통과');
  return bad.length ? 1 : 0;
}

/* ── 재기(부름 전체 — 노드 켜기부터 끝까지) ── */
function bench() {
  const dir = path.join(STATE_DIR, 'bench-' + process.pid); fs.mkdirSync(dir, {recursive: true});
  const env = {...process.env, QUICK_STATE: dir};
  const call = (...a) => { const t = Date.now(); const r = spawnSync(process.execPath, [SELF, ...a, '--base', BASE], {env, encoding: 'utf8', cwd: ROOT, timeout: 120e3}); return {s: sec(Date.now() - t), code: r.status, tail: String(r.stdout || '').trim().split('\n').at(-1)}; };
  const stop = () => spawnSync(process.execPath, [SELF, '--stop'], {env, encoding: 'utf8'});
  const med = xs => { const s = [...xs].sort((a, b) => a - b); return s[Math.floor(s.length / 2)]; };
  const res = {job: 'quick.mjs 재기', start: new Date().toISOString(), base: BASE, cpus: (await_os()).cpus, how: '부름 전체(노드 켜기 · playwright 읽기 · 브라우저 붙기 · 열기 · 재기 · 닫기)를 spawnSync 로 잼 · 데움 = 세 번 중 가운데'};
  for (const r of ['#/why', '#/w/005930']) {
    stop(); const cold = call(r); const warm = [call(r), call(r), call(r)];
    res[r] = {cold: cold.s, warm: med(warm.map(x => x.s)), warmAll: warm.map(x => x.s), result: warm[0].tail, code: warm[0].code};
  }
  const three = [call('#/why', '#/', '#/me'), call('#/why', '#/', '#/me')];
  res.pwhy3 = {routes: ['#/why', '#/', '#/me'], warm: med(three.map(x => x.s)), all: three.map(x => x.s), result: three[0].tail, was: 99.3};
  const three3 = call('#/why', '#/', '#/me', '--w', '320,360,390');
  res.pwhy3w3 = {widths: [320, 360, 390], s: three3.s, result: three3.tail};
  const en = call('#/why', '--en'); res.whyEn = {s: en.s, result: en.tail};
  stop(); fs.rmSync(dir, {recursive: true, force: true});
  res.end = new Date().toISOString();
  const day = new Date(Date.now() + 8 * 36e5).toISOString().slice(0, 10), sd = path.join(ROOT, 'reports/atlas11/speed');
  fs.mkdirSync(sd, {recursive: true}); fs.appendFileSync(path.join(sd, day + '.jsonl'), JSON.stringify(res) + '\n');
  console.log(JSON.stringify(res, null, 1));
  return 0;
}
function await_os() { return {cpus: Number(spawnSync('nproc', [], {encoding: 'utf8'}).stdout.trim()) || null}; }

/* ── 본 줄 ── */
async function main() {
  if (flag('--daemon')) return daemon();
  if (flag('--status')) { const s = readState(); console.log(s && alive(s.pid) ? `켜짐 · ${s.ws} · 프로세스 ${s.pid} · 브라우저 ${s.browserPid} · ${s.at} 부터 · 마지막 씀 ${new Date(mtime(USED)).toISOString()}` : '꺼짐'); return 0; }
  if (flag('--stop')) { const s = readState(); if (s && alive(s.pid)) { process.kill(s.pid, 'SIGTERM'); const end = Date.now() + 10e3; while (alive(s.pid) && Date.now() < end) await pause(50); } fs.rmSync(STATE, {force: true}); console.log('끔'); return 0; }
  if (flag('--serve')) { const {b, started, ms} = await connect(); await b.close(); const s = readState(); console.log(`${started ? '켰음' : '이미 켜짐'} · ${sec(ms)}초 · ${s?.ws} · 상태 ${STATE}`); return 0; }
  if (flag('--selftest')) return selftest();
  if (flag('--bench')) return bench();
  let routes = O.routes;
  if (O.v['--for']) routes = [...new Set([...routes, ...routesFor(O.v['--for'].split(',').filter(Boolean))])];
  if (!routes.length) { console.log('길이 없음 — 예) node scripts/atlas11/next/quick.mjs \'#/why\' \'#/w/005930\' [--en] [--w 320,360,390] (머리 풀이 참고)'); return 2; }
  const seeds = [];
  for (const s of O.seeds) {
    const i = s.indexOf('='); if (i < 1) { console.log('--seed 꼴은 key=json — ' + s); return 2; }
    let v = s.slice(i + 1); if (v.startsWith('@')) v = fs.readFileSync(path.resolve(v.slice(1)), 'utf8').trim();
    try { JSON.parse(v); } catch { console.log('--seed 값이 JSON 이 아님 — ' + s.slice(0, 80)); return 2; }
    seeds.push([s.slice(0, i), v]);
  }
  const widths = String(val('--w', '360')).split(',').map(Number).filter(n => n > 0);
  const en = flag('--en'), T0 = Date.now();
  let conn;
  try { conn = await connect(); } catch (e) { console.log('검사 못 함 — ' + e.message); return 2; }
  dbg('붙음');
  const up = await fetch(BASE + '/next/', {method: 'HEAD'}).then(r => r.ok, () => false);
  if (!up) { await conn.b.close(); console.log(`검사 못 함 — 시험 서버 ${BASE} 가 꺼짐(node scripts/atlas11/invite_dev.mjs --dir site --port 8826 --owner-key testowner-key-1234567890 &)`); return 2; }
  const res = await runRoutes(conn.b, routes, {en, widths, h: Number(val('--h', 640)), seeds, fresh: flag('--fresh'), links: flag('--links'), enBuilt: flag('--en-built'), maxLinks: Number(val('--max-links', 40))});
  await conn.b.close();
  const nf = res.filter(r => r.fails.length).length, total = sec(Date.now() - T0), nRoutes = res.filter(r => !r.shell).length, nShell = res.find(r => r.shell)?.fails.length ?? 0;
  if (flag('--json')) console.log(JSON.stringify({ok: !nf, seconds: total, connectSec: sec(conn.ms), started: conn.started, en, widths, routes: res}, null, 1));
  else {
    for (const r of res) {
      console.log(`${r.fails.length ? '걸림' : '통과'} ${r.route}${en ? ' (영어)' : ''} · 폭 ${widths.join(',')} · ${sec(r.ms)}초${r.fails.length ? ' · ' + r.fails.length + '개' : ''}`);
      for (const [k, x, w] of r.fails) console.log(`   - ${k}${widths.length > 1 ? ' @' + w : ''}: ${x}`);
    }
    console.log(`합계 · 길 ${nRoutes} · 폭 ${widths.length} · 걸린 길 ${res.filter(r => !r.shell && r.fails.length).length} · 공용 칸 걸림 ${nShell} · ${total}초(브라우저 ${conn.started ? '새로 켬' : '붙음'} ${sec(conn.ms)}초)`);
  }
  if (O.v['--out']) fs.writeFileSync(path.resolve(O.v['--out']), JSON.stringify({ok: !nf, at: new Date().toISOString(), seconds: total, en, widths, routes: res}, null, 1));
  return nf ? 1 : 0;
}

const code = await main();
if (typeof code === 'number') process.exit(code);
