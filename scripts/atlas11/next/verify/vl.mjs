// 일꾼 VL — 법과 안전 따로 보기(2026-10-18 · brief5.md 길 20 · 물결 B · 만든 사람이 아닌 사람이 사장님 말씀만 보고 잼)
//   잣대 = docs/design/godori-2026-10-18/order-0015.txt [9] 1 ~ 8 · [12] 5 · 6 · 8
//   만든 쪽의 검사(check_gdr · check_share …)는 쓰지 않음 — 화면에서 보이는 글 · 나가는 요청 · 공개 자료 파일 · 서버 코드 읽기 · words.js 를 노드에서 직접 부름
//   쓰는 법: node scripts/atlas11/next/verify/vl.mjs [--base http://127.0.0.1:8826] [--pw /opt/node-tools/] [--out 결과.json] [--no-en] [--max 70]
//   브라우저는 한 번에 하나 · 끝나면 닫음(2 CPU 공용 기계) · 걸린 것이 하나라도 있으면 끝 코드 1
import fs from 'node:fs/promises';
import path from 'node:path';
import {createRequire} from 'node:module';
import {fileURLToPath, pathToFileURL} from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../../..');
const argv = process.argv.slice(2);
const arg = (k, d) => { const i = argv.indexOf(k); return i >= 0 && argv[i + 1] != null && !argv[i + 1].startsWith('--') ? argv[i + 1] : d; };
const require = createRequire(String(arg('--pw', process.env.PW_DIR || '/opt/node-tools/')).replace(/\/?$/, '/'));
const {chromium} = require('playwright');
const BASE = arg('--base', 'http://127.0.0.1:8826').replace(/\/$/, '');
const OUT = arg('--out', null);
const NO_EN = argv.includes('--no-en');
const MAX = +arg('--max', 70);
const t0 = Date.now();
const log = (...a) => console.error(`[${Math.round((Date.now() - t0) / 1000)}s]`, ...a);
const sleep = ms => new Promise(r => setTimeout(r, ms));
const W = await import(pathToFileURL(path.join(ROOT, 'site/next/words.js')).href);
const {BRAND} = await import(pathToFileURL(path.join(ROOT, 'site/next/brand.js')).href);

const R = {when: new Date().toISOString(), base: BASE, items: {}, pages: [], requests: {total: 0, offOrigin: [], leaks: []}};
const fails = [];
const item = (k, v) => { R.items[k] = {...(R.items[k] || {}), ...v}; };
const fail = (k, what, where) => { fails.push({k, what, where}); (R.items[k] ??= {}).fails = [...(R.items[k].fails || []), {what, where}]; };

/* ── 심는 값(내 돈 · 보유) — 화면 · 요청 어디에도 나오면 안 되는 숫자 ── */
const MONEY = 7777777; // atlas:godori-money(옛 꼴 = 숫자 글)
const DERIVED = [MONEY, ...[3, 2.5, 2].map(w => Math.floor(MONEY * w / 100))]; // 금액 칸이 셈하던 꼴(내 돈 × 비중%)
const MONEY_DIGITS = DERIVED.map(String);
const HOLD = [{id: 'vl-1', code: '005930', name: '삼성전자', buy: 50000, qty: 10, day: '2026-09-01', at: '2026-09-01T01:00:00.000Z'}];

/* ───────── ① [9] 6 거르는 말 빈틈(노드 · words.js 를 그대로 부름) ───────── */
{
  const C = [
    // [이름, 글] — 모두 걸려야 함(사람이 쓴 글 · hits / sendHits)
    ['띄어쓰기', '추 천 종 목'], ['점', '추.천'], ['줄표', '사-야'], ['긴 줄표', '추—천'], ['밑줄', '사_야'], ['가운뎃점', '사·야'], ['아래아', '사ㆍ야'],
    ['넓은 숫자', '０１０-１２３４-５６７８'], ['동그라미 숫자', '⓪①⓪ ②③④⑤'], ['공일공', '공일공 일이삼사 오육칠팔'], ['영일영', '영일영-일이삼사'], ['공1공 섞임', '공1공 1234 5678'],
    ['+82 10', '+82 10-1234-5678'], ['+82-10', '+82-10-1234-5678'], ['+82 010', '+82 010 1234 5678'], ['82)10', '(82)10 1234 5678'], ['+８２ １０', '+８２ １０ １２３４ ５６７８'],
    ['빗금 낱말', '추/천'], ['빗금 전화', '010/1234/5678'], ['빗금 t/me', 't/me/abcd'], ['빗금 수익', '수/익 보/장'],
    ['비슷한 글자 O1O', 'O1O-1234-5678'], ['비슷한 글자 0l0', '0l0 1234 5678'], ['비슷한 글자 키릴 t.mе', 't.mе/abcd'], ['비슷한 글자 키릴 http', 'httр://x'], ['비슷한 글자 키릴 www', 'ԝԝԝ.x'],
    ['낱자모', 'ㅊㅜㅊㅓㄴ'], ['쉼표', '추,천'], ['물결', '사~야'], ['별표', '추*천'], ['그림 글자', '추🔥천'], ['괄호', '추(천)'], ['더하기', '사+야'], ['따옴표', '추"천'],
    ['영어 telegram', 'telegram @abcd'], ['닷컴', '네이버 닷컴'], ['dot com', 'abc dot com'], ['오픈 카카오', 'open kakao abc'], ['011 번호', '011-123-4567'], ['070 번호', '070-1234-5678'],
    ['무조건 점', '무.조.건 사.야'], ['텔레 줄표', '텔-레 방'], ['담아 띄움', '이 종목 담 아'], ['확실 가운뎃점', '확·실'], ['보장 넓은 꼴', '보　장'], // 넓은 빈칸 U+3000
  ];
  const slip = [], caught = [];
  for (const [k, t] of C) { const a = W.hits(t), s = W.sendHits(t); (a.length || s.length ? caught : slip).push({k, t, hit: [...a, ...s].map(x => x.word).join(',')}); }
  item('9-6 words', {cases: C.length, caught: caught.length, slip: slip.map(x => `${x.k}「${x.t}」`)});
  for (const x of slip) fail('9-6 words', '빠져나감', `${x.k}「${x.t}」`);
  // 더하라던 낱말 아홉이 목록에 있나
  const NEED = ['사야', '담아', '추천', '무조건', '확실', '보장', '수익', 't.me', '텔레'], all = W.BLOCK.flatMap(([, ws]) => ws);
  const miss = NEED.filter(w => !all.includes(w));
  item('9-6 words', {added9: NEED.length - miss.length, miss});
  for (const w of miss) fail('9-6 words', '더하라던 낱말 없음', w);
}

/* ───────── ② 코드 읽기 — [9] 2 · 3 · 4 ───────── */
{
  const K = await fs.readFile(path.join(ROOT, 'lib/atlas11/kakao.mjs'), 'utf8');
  const S = await fs.readFile(path.join(ROOT, 'lib/atlas11/kakao-store.mjs'), 'utf8');
  const body = (src, name) => { const i = src.indexOf('async function ' + name + '('); if (i < 0) return ''; let d = 0, j = src.indexOf('{', i); for (let k = j; k < src.length; k++) { if (src[k] === '{') d++; else if (src[k] === '}' && --d === 0) return src.slice(i, k + 1); } return ''; };
  const D = body(K, 'data');
  const okGet = /getData\(c\.store, s\.mh\)/.test(D), okPut = /putData\(c\.store, s\.mh,/.test(D), noParam = !/searchParams|p\.body\.(mh|member|id)|\bmh\s*=/.test(D);
  const sess = body(K, 'sessionOfReq'), fromCookie = /cookieOf\(req, names\.login\)/.test(sess);
  item('9-2 member-only', {dataRoute: 'lib/atlas11/kakao.mjs data()', getUsesCallerMh: okGet, putUsesCallerMh: okPut, noOtherMemberParam: noParam, mhFromLoginCookie: fromCookie, routes: (/ROUTES = Object\.freeze\((\{[^)]*\})/.exec(K) || [])[1]});
  if (!(okGet && okPut && noParam && fromCookie)) fail('9-2 member-only', 'data 길이 부른 사람 말고 다른 회원 기록을 열 수 있음', 'lib/atlas11/kakao.mjs data()');
  // [9] 3 — 메시지를 보내는 카카오 길(나에게 · 친구에게 · 채널 · 알림톡 · 친구톡)
  const files = [];
  for (const dir of ['lib/atlas11', 'netlify/functions', 'site/next', 'site', 'scripts/atlas11/next']) {
    let names = []; try { names = await fs.readdir(path.join(ROOT, dir)); } catch { continue; }
    for (const n of names) if (/\.(m?js|html)$/.test(n)) files.push(path.join(dir, n));
  }
  const SEND = /talk\/memo|talk\/friends|friends\/message|\/v[0-9]\/api\/talk|bizmessage|alimtalk|friendtalk|plusfriend|talk\/channels|channels\/[a-z]|Kakao\.Channel|chat\.kakao|api\/talk/i;
  const hits = [], kapi = new Set();
  for (const f of files) {
    const src = await fs.readFile(path.join(ROOT, f), 'utf8');
    src.split('\n').forEach((l, i) => { if (SEND.test(l)) hits.push(`${f}:${i + 1}`); });
    for (const m of src.matchAll(/base\.api \+ '([^']+)'/g)) kapi.add(m[1]);
  }
  const serverSendsStock = hits.filter(h => !h.startsWith('scripts/'));
  item('9-3 channel', {scanned: files.length, sendPaths: serverSendsStock, kakaoApiCalls: [...kapi], userShare: 'site/next/kakao.js sendCard → Kakao.Share.sendDefault(사람이 누른 친구 공유 · 우리 사이트 주소만) — 채널 아님'});
  for (const h of serverSendsStock) fail('9-3 channel', '메시지를 보내는 길이 있음', h);
  // [9] 4 — 화면 코드가 내 돈 열쇠를 읽거나 쓰나(주석 밖)
  const strip = s => s.replace(/\/\*[\s\S]*?\*\//g, '').replace(/(^|[^:'"`])\/\/.*$/gm, '$1');
  const use = [];
  for (const f of files.filter(f => f.startsWith('site/next/'))) { const s = strip(await fs.readFile(path.join(ROOT, f), 'utf8')); s.split('\n').forEach((l, i) => { if (/godori-money/.test(l)) use.push(`${f}: ${l.trim().slice(0, 120)}`); }); }
  const storeGuard = /hasMoney\(body\)/.test(S) && /text\.includes\('godori-money'\)/.test(S);
  item('9-4 money', {codeUses: use, serverRejectsMoney: storeGuard});
  for (const u of use) if (!/NEVER\s*=/.test(u)) fail('9-4 money', '화면 코드가 내 돈 열쇠를 씀', u);
}

/* ───────── ③ 공개 자료 파일 — [9] 1(gdr.json 에 팔 선 · 금액 칸 없음) · [9] 7(요약 파일 크기) ───────── */
{
  const dir = path.join(ROOT, 'site/next/data'), out = {};
  for (const n of await fs.readdir(dir)) {
    if (!n.endsWith('.json')) continue;
    const raw = await fs.readFile(path.join(dir, n), 'utf8'); let j = null; try { j = JSON.parse(raw); } catch { fail('9-1 data', '못 읽는 공개 자료', n); continue; }
    const bad = [];
    (function walk(v, p) {
      if (Array.isArray(v)) v.forEach((x, i) => walk(x, p + '[' + i + ']'));
      else if (v && typeof v === 'object') for (const [k, x] of Object.entries(v)) { if (/^(sell|half|sellLine|halfLine|amt|amount|money|won|krw|qty|buyAmt)$/i.test(k)) bad.push(p + '.' + k); walk(x, p + '.' + k); }
      else if (typeof v === 'string' && /담겠어|팔겠어|팔 선|금액/.test(v)) bad.push(p + ' = ' + v.slice(0, 60));
    })(j, n);
    out[n] = {bytes: Buffer.byteLength(raw), picks: Array.isArray(j?.picks) ? j.picks.length : undefined, badFields: bad.slice(0, 8), badN: bad.length};
    if (n === 'gdr.json') for (const b of bad) fail('9-1 data', '공개 gdr.json 에 팔 선 · 금액 칸', b);
  }
  item('9-1 data', {files: out});
}

/* ───────── ④ 브라우저 ───────── */
const browser = await chromium.launch({executablePath: '/opt/pw-browsers/chromium', args: ['--no-sandbox']});
const ORIGIN = new URL(BASE).origin;
const allReqs = [];
const DONE = {at: new Date(Date.now() - 864e5).toISOString(), answers: [2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], score: 0, reds: 0, verdict: '좋아, 정해 둔 대로만', groups: {}, picks: []}; // 열한 질문을 끝낸 매매일지 하나(어제) — 고도리 칸이 열림
async function newCtx({money = true, hold = true, why = true, en = false, extra = null} = {}) {
  const ctx = await browser.newContext({viewport: {width: 390, height: 844}, locale: en ? 'en-US' : 'ko-KR', serviceWorkers: 'block'});
  await ctx.addInitScript(([money, hold, M, H, en, why, D]) => {
    try { if (money && localStorage.getItem('atlas:godori-money') == null) localStorage.setItem('atlas:godori-money', String(M)); } catch {}
    try { if (hold && localStorage.getItem('atlas:godori-hold') == null) localStorage.setItem('atlas:godori-hold', JSON.stringify(H)); } catch {}
    try { if (why && localStorage.getItem('atlas:godori-why') == null) localStorage.setItem('atlas:godori-why', JSON.stringify([D])); } catch {}
    try { localStorage.setItem('atlas:lang', en ? 'en' : 'ko'); } catch {}
    // 누르는 듣개를 단 칸을 적어 둠(단추 · 고리가 아닌 칸에 누르기를 달았나 — [9] 8)
    const EV = new Set(['click', 'pointerdown', 'pointerup', 'mousedown', 'mouseup', 'touchstart', 'touchend']), seen = new WeakSet(), orig = EventTarget.prototype.addEventListener;
    window.__vlClick = seen;
    EventTarget.prototype.addEventListener = function (t, f, o) { try { if (EV.has(t) && this instanceof Element) seen.add(this); } catch {} return orig.call(this, t, f, o); };
  }, [money, hold, MONEY, HOLD, en, why, DONE]);
  if (extra) await extra(ctx);
  ctx.on('request', r => { const u = r.url(); let pd = null; try { pd = r.postData(); } catch {} allReqs.push({u, m: r.method(), pd}); });
  ctx.on('page', p => p.on('dialog', d => d.dismiss().catch(() => {})));
  return ctx;
}

/** 화면 한 장에서 읽을 것 — 보이는 글 · 이름 · 남의 글을 뺀 글 · 속성 글 · 읽어 주기 */
const READ = () => {
  const vis = el => { if (!el || !(el instanceof Element)) return true; if (typeof el.checkVisibility === 'function') return el.checkVisibility({checkOpacity: false, checkVisibilityCSS: true}); const r = el.getBoundingClientRect(); return r.width > 0 || r.height > 0; };
  const texts = [], np = [];
  const tw = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
  for (let n = tw.nextNode(); n; n = tw.nextNode()) {
    const p = n.parentElement; if (!p || p.closest('script,style,noscript,template')) continue;
    const t = n.nodeValue.replace(/\s+/g, ' ').trim(); if (!t) continue;
    if (!vis(p)) continue;
    texts.push(t); if (!p.closest('[data-proper]')) np.push(t);
  }
  const attrs = [];
  for (const el of document.querySelectorAll('[aria-label],[title],[alt],[placeholder]')) for (const a of ['aria-label', 'title', 'alt', 'placeholder']) { const v = el.getAttribute(a); if (v && v.trim() && !el.closest('[data-proper]')) attrs.push(v.trim()); }
  // 읽어 주기 — 이름(aria-hidden 아래 글은 뺌)
  const own = el => { // aria-hidden · hidden 아래 글은 이름에 안 듦(그 칸 아래를 건너뜀)
    let s = ''; const w = document.createTreeWalker(el, NodeFilter.SHOW_TEXT | NodeFilter.SHOW_ELEMENT);
    for (let n = w.nextNode(); n; n = w.nextNode()) {
      if (n.nodeType === 1) {
        if (n.getAttribute('aria-hidden') === 'true' || n.hidden) { let last = n; while (last.lastChild) last = last.lastChild; w.currentNode = last; continue; }
        if (n.tagName === 'IMG' && n.alt) s += ' ' + n.alt;
        if (n.getAttribute('aria-label') && n.matches('svg,[role=img]')) s += ' ' + n.getAttribute('aria-label');
      } else s += n.nodeValue;
    }
    return s.replace(/\s+/g, ' ').trim();
  };
  const nameOf = el => {
    const lb = el.getAttribute('aria-labelledby'); if (lb) { const t = lb.split(/\s+/).map(id => document.getElementById(id)?.textContent || '').join(' ').trim(); if (t) return t; }
    const al = el.getAttribute('aria-label'); if (al && al.trim()) return al.trim();
    if (el.matches('input,select,textarea')) { if (el.id) { const l = document.querySelector('label[for="' + CSS.escape(el.id) + '"]'); if (l?.textContent.trim()) return l.textContent.trim(); } const pl = el.closest('label'); if (pl?.textContent.trim()) return pl.textContent.trim(); if (['button', 'submit', 'reset'].includes(el.type) && el.value) return el.value; return el.getAttribute('placeholder') || el.title || ''; }
    return own(el) || el.title || '';
  };
  const sel = el => { const p = []; for (let e = el; e && e !== document.body && p.length < 4; e = e.parentElement) p.unshift(e.tagName.toLowerCase() + (e.id ? '#' + e.id : '') + (e.classList.length ? '.' + [...e.classList].slice(0, 2).join('.') : '')); return p.join('>'); };
  const INTER = 'a[href],button,input,select,textarea,summary,[role=button],[role=link],[role=tab],[role=menuitem],[role=checkbox],[role=switch],[role=option],[role=radio],[role=slider],[contenteditable=true]';
  const noName = [], clickNon = [], chartTap = [], badLi = [], dots = [];
  for (const el of document.querySelectorAll(INTER)) { if (!vis(el) || el.closest('[aria-hidden=true]') || el.matches('input[type=hidden]')) continue; if (!nameOf(el)) noName.push(sel(el)); }
  const seen = window.__vlClick;
  for (const el of document.querySelectorAll('body *')) {
    if (!vis(el)) continue;
    const clicky = (seen && seen.has(el)) || typeof el.onclick === 'function';
    // 누르는 칸처럼 보이는데(손가락 모양) 단추 · 고리가 아닌 것 = 걸림 · 그림 위 끌기(값 보기 — 손가락 모양 아님) · 아래 줄에 맡기는 바깥 칸 = 따로 적기만
    if (clicky && !el.matches(INTER + ',label,details,dialog,form') && !el.querySelector(INTER) && el.id !== 'view') (getComputedStyle(el).cursor === 'pointer' ? clickNon : chartTap).push(sel(el) + ' 「' + (el.textContent || '').trim().slice(0, 24) + '」');
    if (el.getAttribute('role') === 'listitem' || el.tagName === 'LI') { const pa = el.parentElement; if (!(pa && (pa.matches('ul,ol,menu') || pa.getAttribute('role') === 'list'))) badLi.push(sel(el)); else if (pa.matches('ul,ol') && pa.getAttribute('role') && pa.getAttribute('role') !== 'list') badLi.push(sel(el) + ' (부모 role=' + pa.getAttribute('role') + ')'); }
    // 색만으로 뜻을 전하는 작은 점(글 · 이름 · 숨김 없음)
    const r = el.getBoundingClientRect();
    if (r.width >= 4 && r.width <= 20 && r.height >= 4 && r.height <= 20 && !el.children.length && !(el.textContent || '').trim() && !el.matches('img,svg,input,br,hr') ) {
      const cs = getComputedStyle(el), bg = cs.backgroundColor;
      const colored = bg && !/rgba\(0, 0, 0, 0\)|transparent/.test(bg);
      const labelNext = (el.parentElement?.textContent || '').trim().length > 0; // 범례 칸(점 옆에 글이 함께 있음 — 뜻은 글이 전함)
      if (colored && !labelNext && el.getAttribute('aria-hidden') !== 'true' && !el.closest('[aria-hidden=true]') && !el.getAttribute('aria-label') && !el.title && !el.closest('a,button')) dots.push(sel(el) + ' bg=' + bg);
    }
  }
  const inputs = [...document.querySelectorAll('input,textarea')].filter(vis).map(i => ({sel: sel(i), label: i.getAttribute('aria-label') || i.placeholder || i.name || '', type: i.type}));
  const fx = document.querySelectorAll('canvas,[class*=confetti],[class*=firework],[class*=fx-burst],[class*=streak]').length;
  return {title: document.title, texts, np, attrs, noName, clickNon, chartTap, badLi, dots, inputs, fx, url: location.href};
};

const RE_MONEY_KO = /금액|팔\s*선|절반\s*팔|담겠어|팔겠어/g;
const RE_MONEY_EN = /\b(sell[- ]?line|sell[- ]half|half[- ]sell|I'?d put|I'?ll put|I would put)\b/gi; // 「팔 선 · 절반 팔 선 · 담겠어」의 영어 꼴(사용자가 누르는 답 「I'd buy」 · 「If you'd put in 1 million won」 같은 지난 셈은 따로 적음)
const RE_OLD = new RegExp([...BRAND.was.flatMap(w => [w.ko, w.en]), '아틀라스', 'Atlas'].map(s => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|'), 'g');
const RE_FX = /폭죽|축하해|축하합니다|축하드|연속 접속|접속 보상|출석|스트릭|login streak|daily streak|congratulat|🎉|🎊|🥳|confetti|firework/gi; // 「n일 연속 오름」 같은 시장 사실은 보상이 아님
const RE_EN_ADV = /\b(recommend(ed|s|ation)?|must buy|buy now|sell now|guarantee(d)?|strong buy|buy signal|sell signal)\b/gi;
const ctxOf = (t, re) => { const out = []; re.lastIndex = 0; for (const m of t.matchAll(re)) { out.push(t.slice(Math.max(0, m.index - 18), m.index + m[0].length + 18).replace(/\s+/g, ' ')); if (out.length >= 3) break; } return out; };

function judge(tag, g, lang) {
  const text = g.texts.join(' \n '), np = g.np.join(' \n '), all = text + ' \n ' + g.attrs.join(' \n ') + ' \n ' + g.title;
  const pg = {tag, lang, url: g.url.replace(BASE, ''), issues: []};
  const add = (k, what) => { pg.issues.push(k + ': ' + what); fail(k, what, `${lang} ${tag}`); };
  for (const c of ctxOf(all, lang === 'en' ? RE_MONEY_EN : RE_MONEY_KO)) add('9-1 screen', '「' + c + '」');
  if (lang === 'en') for (const c of ctxOf(all, RE_MONEY_KO)) add('9-1 screen', '「' + c + '」');
  const digits = all.replace(/[,\s.]/g, '');
  for (const d of MONEY_DIGITS) if (digits.includes(d)) add('9-1 money', `내 돈(${MONEY})에서 셈한 ${d} 이 화면에 있음`);
  if (/777만|7\.8M|7\.78M/.test(all)) add('9-1 money', '내 돈 만 원 꼴');
  const sh = W.screenHits(np + ' \n ' + g.attrs.join(' \n '));
  for (const w of sh) add('12-6 words', `쓰지 않을 말 「${w}」 · ` + ctxOf(np, new RegExp(w.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'))[0]);
  if (lang === 'en') for (const c of ctxOf(np, RE_EN_ADV)) add('12-6 words', 'en 「' + c + '」');
  for (const c of ctxOf(all, RE_OLD)) add('12-5 old name', '「' + c + '」');
  if (!new RegExp(lang === 'en' ? BRAND.en : BRAND.ko).test(g.title) && !/\.html$/.test(tag)) add('12-5 name', `창 제목에 이름 없음 「${g.title}」`);
  for (const c of ctxOf(all, RE_FX)) add('12-8 fx', '「' + c + '」');
  if (g.fx) add('12-8 fx', `캔버스 · 폭죽 칸 ${g.fx}개`);
  for (const s of g.noName.slice(0, 4)) add('9-8 a11y', '이름 없는 누름 칸 ' + s);
  for (const s of g.clickNon.slice(0, 4)) add('9-8 a11y', '단추 · 고리가 아닌 칸에 누르기 ' + s);
  for (const s of g.badLi.slice(0, 3)) add('9-8 a11y', '목록 줄의 바깥 칸이 목록이 아님 ' + s);
  for (const s of g.dots.slice(0, 3)) add('9-8 a11y', '색만 있는 점(글 · 이름 없음) ' + s);
  const moneyIn = g.inputs.filter(i => /내 돈|돈\(|money|금액|amount/i.test(i.label)); // 「판 값(원)」 같은 값 칸은 내 돈 칸이 아님
  for (const i of moneyIn) add('9-4 money box', `보이는 돈 칸 ${i.sel} 「${i.label}」`);
  pg.notes = [...g.chartTap.slice(0, 3).map(s => '그림 위 끌기 · 바깥 칸 듣개(단추 아님 · 손가락 모양 아님) ' + s), ...ctxOf(all, /100만 원어치|1 million won|I'?d buy|살 거야/g).map(c => '따로 적음 「' + c + '」')];
  pg.n = {texts: g.texts.length, noName: g.noName.length, clickNon: g.clickNon.length, chartTap: g.chartTap.length, badLi: g.badLi.length, dots: g.dots.length};
  R.pages.push(pg);
  return pg;
}

async function settle(p) {
  await p.waitForFunction(() => { const v = document.querySelector('#view'); return v && !v.querySelector('.boot'); }, null, {timeout: 12000}).catch(() => {});
  await sleep(450);
}
const kindOf = h => {
  const m = /^#\/([a-z0-9]*)\/?(.*)$/.exec(h); if (!m) return null; const [, k, rest] = m;
  if (k === 'w') { if (/^KOS/.test(rest)) return 'w:' + rest; const s = rest.split('/'); return s[1] ? 'w/' + s[1] : 'w'; }
  if (k === 'ch') return 'ch/' + rest.split('/')[0];
  if (k === 'f' || k === 'surge') return k + '/' + rest;
  if (k === 'cal' || k === 'cond' || k === 'x' || k === 's' || k === 'shorts') return k + (rest ? '/x' : '');
  return k;
};
const SEED = ['#/', '#/f/rise', '#/f/group', '#/f/ind', '#/f/us', '#/f/surge', '#/f/lead', '#/f/pick', '#/shorts', '#/sub', '#/me', '#/find', '#/why', '#/gdr', '#/today', '#/surge', '#/surge/10', '#/surge/20', '#/surge/30', '#/surge/40', '#/cal', '#/cond', '#/talk', '#/up', '#/time', '#/info', '#/w/KOSPI', '#/w/KOSDAQ', '#/w/005930', '#/w/005930/past', '#/w/005930/rivals', '#/w/005930/grow', '#/w/005930/range', '#/x/069500', '#/s/005930/2026-10-13/60000/s'];
const ROOTS = ['/letter.html', '/hello.html', '/privacy.html', '/invite.html'];

async function walk(lang) {
  const ctx = await newCtx({en: lang === 'en'}), p = await ctx.newPage(), errs = [];
  p.on('pageerror', e => errs.push(String(e).slice(0, 160)));
  await p.goto(BASE + '/next/?dev=1' + (lang === 'en' ? '&lang=en' : '&lang=ko') + '#/', {waitUntil: 'domcontentloaded'});
  await settle(p);
  const done = new Set(), cnt = new Map(), q = [...SEED];
  let n = 0;
  while (q.length && n < MAX) {
    const h = q.shift(); if (done.has(h)) continue; done.add(h);
    const k = kindOf(h); if (k && (cnt.get(k) || 0) >= (k === 'w' ? 2 : 1) && !SEED.includes(h)) continue;
    cnt.set(k, (cnt.get(k) || 0) + 1); n++;
    await p.evaluate(x => { if (location.hash === x) window.dispatchEvent(new HashChangeEvent('hashchange')); else location.hash = x; }, h);
    await settle(p);
    if (!p.url().includes('/next/')) { R.pages.push({tag: h, lang, url: p.url(), issues: ['left /next/']}); await p.goto(BASE + '/next/?dev=1&lang=' + lang + '#/'); await settle(p); continue; }
    const g = await p.evaluate(READ);
    judge(h, g, lang);
    if (h === '#/me') { // 보유종목 — 「오늘 처음 봤다면 살 거야?」에 답해야 점검 글(④ 팔 약속까지 …)이 열림
      await p.locator('#view button', {hasText: lang === 'en' ? /buy/i : '살 거야'}).first().click({timeout: 3000}).catch(() => {});
      await sleep(600);
      for (const s of await p.$$('#view button[aria-expanded="false"]')) { await s.click().catch(() => {}); await sleep(100); }
      judge('#/me (답 누른 뒤)', await p.evaluate(READ), lang);
    }
    const hrefs = await p.evaluate(() => [...document.querySelectorAll('#view a[href^="#/"], nav a[href^="#/"]')].map(a => a.getAttribute('href')));
    for (const x of hrefs) { const kk = kindOf(x); if (!done.has(x) && kk && (cnt.get(kk) || 0) < (kk === 'w' ? 2 : 1) && !q.includes(x)) q.push(x); }
  }
  for (const r of ROOTS) {
    await p.goto(BASE + r + (lang === 'en' ? '?lang=en' : ''), {waitUntil: 'load'}).catch(() => {});
    await sleep(900);
    const g = await p.evaluate(READ);
    judge(r, g, lang);
    if (r === '/hello.html' || r === '/privacy.html') R[lang + r] = g.texts;
  }
  R.items['pageErrors ' + lang] = errs.slice(0, 6);
  await ctx.close();
  log(lang, 'pages', n + ROOTS.length);
  return n;
}

/* ④-1 [9] 7 — 첫 화면이 받는 자료(빈 기기 · 아무것도 심지 않음) */
for (const lang of NO_EN ? ['ko'] : ['ko', 'en']) {
  const ctx = await newCtx({money: false, hold: false, en: lang === 'en'}), p = await ctx.newPage(), got = [];
  p.on('response', async r => { const u = r.url(); if (/\/(atlas|next)\/data\//.test(u)) { let b = 0; try { b = (await r.body()).length; } catch {} got.push({f: u.replace(ORIGIN, ''), s: r.status(), b}); } });
  await p.goto(BASE + '/next/?dev=1&lang=' + lang + '#/', {waitUntil: 'domcontentloaded'});
  await settle(p); await sleep(2500);
  const heavy = got.filter(x => /\/(mkt|cond|core)\.json/.test(x.f));
  item('9-7 home light', {[lang]: got.map(x => `${x.f} ${x.s} ${Math.round(x.b / 1024)}KB`), [lang + 'TotalKB']: Math.round(got.reduce((s, x) => s + x.b, 0) / 1024)});
  for (const x of heavy) fail('9-7 home light', '첫 화면이 큰 자료를 받음', `${lang} ${x.f} ${Math.round(x.b / 1024)}KB`);
  if (!got.some(x => /home-summary\.json/.test(x.f) && x.s === 200)) fail('9-7 home light', '첫 화면이 요약 파일을 안 받음', lang);
  await ctx.close();
}

/* ④-2 모든 길 — 한국어 · 영어(내 돈 · 보유 심음) */
allReqs.length = 0;
await walk('ko');
if (!NO_EN) await walk('en');

/* ④-3 [9] 1 · 4 — 팔 선 · 절반 팔 선이 든 옛 자료(v1 표본)를 넣어도 화면에 금액 · 팔 선이 안 나오나 · 돈 칸은 숨었나 */
{
  const fx = await fs.readFile(path.join(ROOT, 'scripts/atlas11/next/fixtures/gdr-v1-sample.json'), 'utf8'), FX = JSON.parse(fx);
  const vals = FX.picks.flatMap(x => [x.sell, x.half]).filter(Number.isFinite).map(String);
  for (const lang of NO_EN ? ['ko'] : ['ko', 'en']) {
    const ctx = await newCtx({en: lang === 'en', extra: c => c.route('**/next/data/gdr.json', r => r.fulfill({status: 200, contentType: 'application/json', body: fx}))});
    const p = await ctx.newPage();
    for (const h of ['#/gdr', '#/']) {
      await p.goto(BASE + '/next/?dev=1&lang=' + lang + h, {waitUntil: 'domcontentloaded'}); await settle(p); await sleep(400);
      const cells = await p.$$('button.gdr-cell, [class*=gdr] button[aria-expanded="false"]');
      for (const c of cells.slice(0, 6)) { await c.click().catch(() => {}); await sleep(250); }
      const g = await p.evaluate(READ), pg = judge('v1표본 ' + h + ' (칸 ' + cells.length + '개 엶)', g, lang);
      const digits = (g.texts.join(' ') + g.attrs.join(' ')).replace(/[,\s]/g, '');
      const shown = vals.filter(v => new RegExp('(?<!\\d)' + v + '(?!\\d)').test(digits));
      for (const v of shown) fail('9-1 screen', `v1 표본 팔 선 · 절반 팔 선 값 ${v} 이 화면에 있음`, `${lang} ${h}`);
      pg.v1 = {cells: cells.length, sellHalfShown: shown};
    }
    await ctx.close();
  }
}

/* ④-4 [9] 6 — 친구가 여는 보내기 주소(#/s/…)의 말은 열한 질문 뒤에 열리고 sendHits 가 빈 말만 보임(p-share.js 「sendHits(S.msg).length」)
   화면은 질문에 막혀 바로 못 봄 → 같은 셈(sendHits)을 노드에서 잼 · 편지 · 별명 · 한 줄 답(hits · 서버 letter.mjs badWord)도 따로 적음 */
{
  const MSG2 = ['추/천 무/조/건 사/야', '연락 (82)10 1234 5678', '연락 +82 10 1234 5678', 't/me/abc', 'O1O-1234-5678', 'ㅊㅜㅊㅓㄴ 종목'];
  item('9-6 words', {shareAndLetter: MSG2.map(m => `「${m}」 보내기 쪽 ${W.sendHits(m).length ? '막힘' : '보임'} · 편지 ${W.hits(m).length ? '막힘' : '지남'}`)});
}
if (process.env.VL_SHARE_PAGE === '1') { // 질문 앞 화면만 봄(말이 질문 앞에서 새지 않나)
  const b64 = s => Buffer.from(s, 'utf8').toString('base64url');
  const MSG = [['막힐 글', '무조건 사라 010-1234-5678'], ['빗금 빈틈', '추/천 무/조/건 사/야'], ['+82 빈틈', '연락 +82 10 1234 5678'], ['비슷한 글자', '텔ㄹㅔ t.mе/abc O1O-1234-5678']];
  const ctx = await newCtx({}), p = await ctx.newPage(), out = [];
  for (const [k, m] of MSG) {
    await p.goto(BASE + '/next/?dev=1&lang=ko#/s/005930/2026-10-13/60000/s/' + b64(m), {waitUntil: 'domcontentloaded'}); await settle(p); await sleep(300);
    const t = await p.evaluate(() => document.querySelector('#view')?.innerText || '');
    const shown = t.includes(m) || t.includes(m.slice(0, 6));
    out.push(`${k}: ${shown ? '화면에 나옴' : '안 나옴'}`);
    if (shown && k !== '막힐 글') fail('9-6 words', '친구가 연 보내기 쪽에 빈틈 글이 그대로 나옴', `#/s/005930/2026-10-13/60000/s/<${k}>「${m}」`);
    if (shown && k === '막힐 글') fail('9-6 words', '막힐 글이 보내기 쪽에 나옴', m);
  }
  item('9-6 words', {shareLanding: out});
  await ctx.close();
}
await browser.close();

/* ⑤ 요청 — 내 돈 · 열쇠가 기기를 떠났나 · 바깥 주소 */
{
  const leaks = [], off = new Set();
  for (const r of allReqs) {
    const blob = decodeURIComponent(r.u) + ' ' + (r.pd || '');
    if (/godori-money/.test(blob) || MONEY_DIGITS.some(d => blob.replace(/[,%2C]/g, '').includes(d))) leaks.push(r.m + ' ' + r.u.slice(0, 120));
    const o = new URL(r.u).origin; if (o !== ORIGIN && !r.u.startsWith('data:') && !r.u.startsWith('blob:')) off.add(o);
  }
  R.requests = {total: allReqs.length, posts: allReqs.filter(r => r.m !== 'GET').map(r => r.m + ' ' + r.u.replace(ORIGIN, '')).slice(0, 10), offOrigin: [...off], leaks};
  item('9-4 money', {requests: allReqs.length, leaks: leaks.length, offOrigin: [...off]});
  for (const l of leaks) fail('9-4 money', '내 돈이 요청에 실림', l);
}

/* ⑥ [9] 5 — 소개 쪽 네 줄 · 처리방침과 맞나 */
{
  const H = (R['ko/hello.html'] || []).join(' '), P = (R['ko/privacy.html'] || []).join(' ');
  const four = ['모으는 것', '쓰는 곳', '지우는 때', '거부할 수 있음'], has = four.filter(x => H.includes(x));
  const pairs = [ // 소개 쪽 말 → 처리방침에 같은 뜻이 있나
    ['카카오 회원 번호 하나만', /카카오가 주는 회원 번호 하나만|회원 번호 하나만/], ['서버로 보내지 않아요', /서버로 보내지 않아요/], ['광고에 쓰거나 팔지 않아요', /광고를 붙이지 않아요|팔지 않아요/],
    ['탈퇴하면 서버에 둔 내 기록을 바로 지워요', /탈퇴하면 바로 지워요|서버에 둔 내 기록을 지우/], ['지워 달라고 하면 지워요', /지워 달라고 하면 지워요/],
    ['가입하지 않아도 모든 화면', /가입하지 않아도 모든 화면/], ['동의하지 않으면 아무것도 받지 않아요', /동의하지 않으면 아무것도 받지 않아요/]];
  const mism = pairs.filter(([, re]) => !re.test(P)).map(([k]) => k);
  const enH = (R['en/hello.html'] || []).join(' ');
  item('9-5 hello', {fourOnScreen: has, privacyMismatch: mism, helloMentionsServerCopyForMembers: /가입하면[^.]*서버|서버에도/.test(H), helloMentionsPhoneNumber: /전화번호|문자/.test(H.split('내 정보는 이렇게 다뤄요')[1] || ''), enFour: ['collect', 'use', 'delete', 'say no'].filter(w => new RegExp(w, 'i').test(enH))});
  for (const x of four.filter(x => !has.includes(x))) fail('9-5 hello', '네 줄 가운데 없음', x);
  for (const m of mism) fail('9-5 hello', '처리방침에 같은 뜻 없음', m);
}

R.fails = fails; R.sec = Math.round((Date.now() - t0) / 1000);
const byK = {}; for (const f of fails) (byK[f.k] ??= []).push(f.where + ' — ' + f.what);
R.summary = Object.fromEntries(Object.entries(byK).map(([k, v]) => [k, {n: v.length, first: [...new Set(v)].slice(0, 6)}]));
const out = OUT || path.join((await import('node:os')).tmpdir(), 'vl-latest.json'); // 저장소에 쓰지 않음(--out 으로 고름)
await fs.mkdir(path.dirname(out), {recursive: true}).catch(() => {});
await fs.writeFile(out, JSON.stringify(R, null, 1));
console.log(JSON.stringify({sec: R.sec, pages: R.pages.length, fails: fails.length, summary: R.summary, items: Object.fromEntries(Object.entries(R.items).map(([k, v]) => [k, {...v, fails: v.fails?.length}]))}, null, 1));
process.exitCode = fails.length ? 1 : 0;
