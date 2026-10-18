// 새 아틀란스 채널 자세히(chx · 1단 갈래 · 2단 업종) 검사 — 지금 아틀란스(/atlas/#/g/<id> · #/i/<업종>)와 새 화면(/next/?dev=1#/ch/g/<id> · #/ch/i/<업종>)을 같은 자료로 열어 맞댐
//   쓰는 법: node scripts/atlas11/next/check_chx.mjs --base http://127.0.0.1:8826 [--all] [--limit N] [--skip N] [--wlimit N] [--pw /opt/node-tools/] [--out 결과.json]
//     (아무것도 안 주면 = --all: 모든 갈래 · 모든 업종(지금 87 화면 × 두 보기) 맞대기 + 세 폭 모두 · --limit N = 앞 N 화면만 맞대고 세 폭은 min(N, 10) 화면 ·
//      --skip N = 앞 N 화면 건너뜀(--skip 50 --limit 37 처럼 나눠 돌림) · --wlimit N = 세 폭 화면 수 · 일꾼은 --limit 50 까지, 전부는 주 일꾼이 합칠 때)
//   ① 줄 — 많이 오른 순 줄마다 이름 · 숫자 · 꼬리표(1곳 · ? · 고른 n곳 · 고른 곳) · 흐름(▲ 강하게 오름 · 힘 붙음) · 금빛 띠 · 차례 · 고리(옛 #/i · #/c → 새 #/ch/i · #/w)가 옛 화면과 같음 — 두 보기(한 회사 한 표 · 큰 회사는 크게) 모두
//   ② 글 — 옛 화면의 머리 · 흐름 · 업종 줄 · 몇 곳 · 다르게 보면 · 알림(가장 낮던 날 · 1곳 · ? 줄 · 금빛 · 두 보기 정직 글) · 범례 · 7단 중 n단 · 때 · 자료 줄이 새 화면(main#view · 접은 칸 포함)에 글자 그대로
//   ③ 숫자 낱말 — 옛 화면 글의 % · 곳 · 개 · 거래일 · 단 · 날짜가 새 화면에 빠짐없이(같은 낱말이 여러 번이면 그 수만큼) · 「?」 줄 모두
//   ④ 새 화면만 — 고른 곳 줄 = 자료의 고른 곳 · 위 단 고리 · 알림 글(옛 글의 「매수 · 매도」를 같은 뜻 쉬운 말로) · 쓰지 않을 말 0 · 고리는 아는 길 · 화면 오류 0
//   ⑤ 세 폭(320 · 360 · 390) — 접은 칸을 펴고 가로 넘침 0 · 칸 밖으로 나간 것 0 · 누르는 자리 44px 넘게
//   ⑥ 누르기 — 보기 바꾸기 · 다시 보기(그리는 중 누르면 끝으로) · 소리 단추 · 접은 칸이 보기를 바꿔도 펴진 채
//   ⑦ 2026-10-18 고도리 명령문 72개 [7] 6 · [10] 1 · 5 ~ 8 (일꾼 S4r) — 새 화면은 낱말표(site/next/glossary.js)를 거친 글이라 옛 화면 글도 같은 표로 바꿔 맞댐(glossO) ·
//      옛 낱말(갈래 · 몸값 · 한 회사 한 표 · 큰 회사는 크게 · 20거래일 …)이 화면에 0 · 모양 규칙(page_rules.mjs · 360 폭 닫은 채로): 음수 바깥 여백 0 · 겹친 형제 칸 0 · 글씨 6가지 이하 · 글 시작 왼쪽 줄 3줄 이하 · css 글 규칙
//   실패가 하나라도 있으면 끝 코드 1
import fs from 'node:fs/promises';
import path from 'node:path';
import {createRequire} from 'node:module';
import {oldToNewDeep} from './rename.mjs'; // 이름 바꾸기(2026-10-17 아틀란스 → 보드리)
import {fetchJSON, watch, settle, timer, netSummary, isRemote} from './net.mjs'; // 망 탈에만 다시 받기 · 다시 열기 · 옛 쪽 · 새 쪽 시간(2026-10-17 고도리 명령문 [1] 8 · 9)
import {oldSnap, fileSha} from './oldsnap.mjs'; // 옛 쪽 기준값(--old-snap 파일 · --old-refresh) — 옛 화면이 쓴 파일이 하나도 안 바뀌면 옛 쪽을 열지 않고 찍어 둔 값과 맞댐(명령문 [1] 9 · 옛 쪽 때 86%)
import {fileURLToPath} from 'node:url';
import {pageRules, cssRules} from './page_rules.mjs'; // 모양 규칙(음수 여백 · 겹침 · 글씨 6가지 · 왼쪽 줄 3줄 · css 글 규칙 — 범위 검사와 같이 씀 · 2026-10-18 명령문 [7] 6 · [10] 5 ~ 8)
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../..');
const arg = (k, d) => { const i = process.argv.indexOf(k); return i > 0 ? process.argv[i + 1] : d; };
const has = k => process.argv.includes(k);
const require = createRequire(arg('--pw', '/opt/node-tools/'));
const {chromium} = require('playwright');
const base = arg('--base', 'http://127.0.0.1:8826').replace(/\/$/, '');
const SKIP = has('--all') ? 0 : Number(arg('--skip', '0')) || 0; // --skip N = 앞 N 화면을 건너뜀(나눠 돌리기 — 기계가 작을 때)
const ALL = has('--all') || (!has('--limit') && !SKIP);
const LIMIT = ALL ? 0 : Number(arg('--limit', '0')) || 0;
const WLIMIT = has('--wlimit') ? Number(arg('--wlimit', '10')) : ALL ? 0 : Math.min(LIMIT || 10, 10);
const OUT = arg('--out', null);
const fails = [], counts = {}, t0 = Date.now(), tm = timer(t0);
let oldFails = 0; // 옛 쪽 실패 수 — 0 일 때만 기준값을 새로 씀
const fail = (k, x) => { if (fails.length < 300) fails.push([k, x]); counts.fail = (counts.fail || 0) + 1; if (/^옛/.test(k) || /^옛/.test(String(x ?? ''))) oldFails++; };
const bump = (k, n = 1) => { counts[k] = (counts[k] || 0) + n; };
const FAIL = fail, BUMP = bump;
const norm = s => String(s ?? '').replace(/[\s ]+/g, ' ').trim();
/* 낱말표(site/next/glossary.js · 2026-10-18 명령문 [10] 1 — 갈래 → 큰 업종 · 한 회사 한 표 → 평균 · 큰 회사는 크게 → 큰 회사 기준 · 20거래일 → 한 달 · 몸값 → 회사 크기)
   새 화면은 이 표를 거친 글이라 옛 화면 글도 같은 표로 바꿔 맞댐(표 파일을 그대로 읽어 씀 — 한 곳) */
const {gloss} = await import('data:text/javascript;base64,' + Buffer.from(await fs.readFile(path.join(ROOT, 'site/next/glossary.js'))).toString('base64'));
const G = s => (s == null ? s : gloss(String(s)));
const glossO = O => ({...O, head: O.head.map(G), blocks: O.blocks.map(G), key: O.key.map(G), foot: O.foot.map(G), text: G(O.text), crumbs: O.crumbs.map(G), rows: O.rows.map(r => ({...r, name: G(r.name), trd: G(r.trd), badges: r.badges.map(G)}))});
const OLD_WORDS = /갈래|몸값|한 회사 한 표|큰 회사는 크게|(?<![\d.,])20\s?거래일|다섯 문|쉬는 돈|챕터/; // 화면에 새로 나오면 안 되는 옛 낱말(낱말표가 모두 바꿔야 함)

const getJ = f => fetchJSON(base + '/atlas/data/' + f, f); // 망 탈(끊김 · 429 · 5xx)에만 기다렸다 다시 · 404 는 바로 실패(net.mjs)
const [core, mkt] = await Promise.all(['core.json', 'mkt.json'].map(f => getJ(f).catch(e => { fail('자료', e.message); return null; })));
if (!core || !mkt) { console.error(JSON.stringify({ok: false, fails})); process.exit(1); }
const CO = mkt.companies, IND = new Map(core.industries.map(i => [i.name, i])), GRP = new Map(core.groups.map(g => [g.id, g]));
// 쓰지 않을 말(새 아틀란스 안내 · next_check BANNED 와 같은 말)
const BANNED = ['추천', '매수', '매도', '팔라', '사세요', '파세요', '예측', '확률', '유망', '기회', '신호', '저평가', '1위', 'TOP', '사라'];
// 옛 맨 아래 알림 글(「매수 · 매도」가 들어 있음) → 새 화면은 같은 뜻 쉬운 말
const OLD_DISC = '저는 투자 상담사가 아닙니다 · 이 자료는 지난 기록을 센 공부이며, 특정 종목의 매수 · 매도 · 보유 또는 시장 전망을 권하지 않습니다.';
const NEW_DISC = '저는 투자 상담사가 아닙니다 · 이 자료는 지난 기록을 센 공부이며, 특정 종목을 사거나 팔거나 갖고 있으라고 권하지 않고 시장 앞날도 말하지 않습니다.';

// 맞댈 화면 — 모든 갈래 → 업종(꼬리표 · ? 줄 · 금빛이 있는 업종을 앞에 — --limit 으로 줄여도 그런 화면을 먼저 봄)
const feat = i => (i.members || []).some(c => CO[c]?.j) * 4 + (i.members || []).some(c => CO[c] && !CO[c].l?.some(x => x != null)) * 4 + (i.pk > 0) * 2 + (i.n === 1) * 8;
const inds = core.industries.slice().sort((a, b) => feat(b) - feat(a) || core.industries.indexOf(a) - core.industries.indexOf(b));
const PAGES = [...core.groups.map(g => ({kind: 'g', id: g.id, name: g.name, node: g})), ...inds.map(i => ({kind: 'i', id: i.name, name: i.name, node: i}))];
const LIST = PAGES.slice(SKIP, LIMIT ? SKIP + LIMIT : undefined);
const WLIST = WLIMIT ? [...LIST.filter(p => p.kind === 'g').slice(0, 2), ...LIST.filter(p => p.kind === 'i').sort((a, b) => (b.node.n || 0) - (a.node.n || 0)).slice(0, 2), ...LIST].filter((p, k, a) => a.indexOf(p) === k).slice(0, WLIMIT) : PAGES; // 세 폭은 맞댄 화면 가운데 갈래 둘 · 가장 큰 업종 둘부터
const oldHash = p => '#/' + p.kind + '/' + encodeURIComponent(p.id), newHash = p => '#/ch/' + p.kind + '/' + encodeURIComponent(p.id);

const exe = '/opt/pw-browsers/chromium', B = await chromium.launch((await fs.stat(exe).catch(() => null)) ? {executablePath: exe} : {});
async function open(url, width, height = 844, pre = null) {
  const ctx = await B.newContext({viewport: {width, height}, deviceScaleFactor: 1, hasTouch: true});
  const p = await ctx.newPage(); p._errs = []; if (pre) pre(p); // pre = 처음 열기 전에 붙일 것(기준값이 옛 화면 파일을 적음)
  p.on('pageerror', e => p._errs.push(e.message)); p.on('console', m => { if (m.type() === 'error') p._errs.push(m.text()); });
  watch(p, base); // 망 탈 셈(net.mjs)
  await settle(p, async () => { await p.goto(url); return true; }, {what: url.replace(base, ''), fail}); return p;
}
const errsOf = (p, where) => { if (p._errs.length) { fail('화면 오류', where + ' ' + p._errs.join(' | ').slice(0, 240)); p._errs.length = 0; } };

/* 옛 화면 읽기 — 줄은 보이는 차례(위 → 아래) · 글은 보이는 글(innerText) */
const readOld = () => {
  const v = document.querySelector('#view'), T = s => [...v.querySelectorAll(s)].map(e => e.innerText);
  const rows = [...v.querySelectorAll('.board .row')].map(r => ({top: r.getBoundingClientRect().top, name: r.querySelector('.nt')?.textContent ?? '', badges: [...r.querySelectorAll('.badge')].map(b => b.textContent), val: r.querySelector('.val')?.textContent ?? '', trd: r.querySelector('.trd')?.textContent ?? '', href: r.getAttribute('href'), pk: r.classList.contains('pk')}))
    .sort((a, b) => a.top - b.top).map(({top, ...x}) => x);
  const foot = v.querySelector('.foot'), footP = foot ? [...foot.querySelectorAll(':scope > p')].filter(p => !p.classList.contains('links')).map(p => p.innerText) : [];
  const steps = v.querySelector('.steps'), stepLinks = steps ? [...steps.querySelectorAll('a[href]')].map(a => a.getAttribute('href')) : [];
  return {rows, head: T('h1.head'), blocks: [...T('.trh'), ...T('.say'), ...T('.count'), ...T('.alt'), ...T('.note'), ...T('.st-t'), ...T('.tell .t')], key: [...v.querySelectorAll('.key span')].map(s => s.innerText), foot: footP, stepLinks, text: v.innerText, crumbs: T('.crumb a, .crumb span')};
};
/* 새 화면 읽기 — main#view 글은 접은 칸까지(textContent) · 자세히 칸(section.chx-d) 따로 */
const readNew = () => {
  const v = document.querySelector('main#view'), s = v?.querySelector('section.chx-d');
  if (!s) return null;
  const rows = [...s.querySelectorAll('.pchx-row')].map(r => ({name: r.querySelector('.pchx-nt')?.textContent ?? '', badges: [...r.querySelectorAll('.pchx-bd')].map(b => b.textContent), val: r.querySelector('.pchx-val')?.textContent ?? '', trd: r.querySelector('.pchx-trd')?.textContent ?? '', href: r.getAttribute('href'), pk: r.classList.contains('pk')}));
  const blockText = e => { const c = e.cloneNode(true); c.querySelectorAll('p, li, div, h1, h2, h3, summary, details, section, nav, ol').forEach(x => x.append(' ')); return c.textContent; }; // 칸 사이 띄어 읽기(붙은 글로 낱말이 붙지 않게)
  return {rows, text: blockText(v), sec: blockText(s), head: s.querySelector('.pchx-head')?.textContent ?? '', safe: s.querySelector('.pchx-safe')?.textContent ?? '',
    gold: [...s.querySelectorAll('.pchx-gold a')].map(a => a.getAttribute('href')), up: s.querySelector('.pchx-up')?.getAttribute('href') ?? null, hrefs: [...s.querySelectorAll('a[href]')].map(a => a.getAttribute('href')),
    stt: s.querySelector('.pchx-st-t')?.textContent ?? '', playing: !!s.querySelector('.pchx-list.playing'), tell: s.querySelector('.pchx-tell')?.textContent ?? ''};
};

/* 숫자 낱말 — % · 곳 · 개 · 거래일 · 단 · 날짜(붙임 띄어쓰기는 한 칸으로) */
const TOK = /[+−-]?\d[\d,]*(?:\.\d+)?%|\d[\d,]*(?:곳|개|거래일|단|배|원)|\d{1,2}월 \d{1,2}일/g;
const toks = s => (norm(s).match(TOK) || []);
const bag = xs => { const m = new Map(); for (const x of xs) m.set(x, (m.get(x) || 0) + 1); return m; };
const knownHref = h => {
  let m;
  if ((m = /^#\/w\/([0-9A-Z]{6})$/.exec(h))) return !!CO[m[1]];
  if ((m = /^#\/ch\/i\/(.+)$/.exec(h))) { try { return IND.has(decodeURIComponent(m[1])); } catch { return false; } }
  if ((m = /^#\/ch\/g\/(.+)$/.exec(h))) { try { return GRP.has(decodeURIComponent(m[1])); } catch { return false; } }
  return false;
};
const mapHref = h => { let m; if ((m = /^#\/i\/(.+)$/.exec(h))) return '#/ch/i/' + m[1]; if ((m = /^#\/c\/([0-9A-Z]{6})$/.exec(h))) return '#/w/' + m[1]; if ((m = /^#\/x\/(.+)$/.exec(h))) return '/atlas/#/x/' + m[1]; if ((m = /^#\/g\/(.+)$/.exec(h))) return '#/ch/g/' + m[1]; return '?' + h; };

// 화면 옮기기 — 앞 화면 칸에 표를 달고 바꿈 → 표 없는 새 칸이 그려질 때까지(같은 이름의 갈래 · 업종 — 「반도체」 — 을 앞 화면으로 잘못 읽지 않게)
//   망 탈(이 사이트 요청 끊김 · 429 · 5xx · 15초 넘게 답 없음)이 있었던 열기는 믿지 않고 새로 고쳐 다시(net.mjs settle — 새로 고친 뒤 같은 주소면 #/~ 를 거쳐 다시 그림) · 망 탈 없이 못 그리면 앞과 같은 실패 · 여는 데 쓴 때를 쪽마다 셈(tm)
async function waitOld(p, pg) {
  const want = pg.name + ' ' + core.days + '거래일';
  const ok = await tm.old(() => settle(p, async () => {
    await p.evaluate(h => { document.querySelectorAll('#view > *').forEach(e => e.setAttribute('data-stale', '1')); if (location.hash === h) history.replaceState(null, '', '#/~'); location.hash = h; }, oldHash(pg));
    return p.waitForFunction(w => { const v = document.querySelector('#view > .vw:not([data-stale])'); return !!v && !v.querySelector('.boot') && (v.querySelector('h1.head')?.textContent ?? '').startsWith(w) && !!v.querySelector('.board .row'); }, want, {timeout: 15000}).then(() => true, () => false);
  }, {what: '옛 화면 ' + oldHash(pg), fail}));
  if (ok === false) fail('옛 화면 안 열림', oldHash(pg));
  await tm.old(() => p.waitForTimeout(30));
}
async function waitNew(p, pg) {
  const want = G(pg.name + ' ' + core.days + '거래일'); // 새 화면 머리는 낱말표를 거침(20거래일 → 한 달)
  const ok = await tm.new(() => settle(p, async () => {
    await p.evaluate(h => { document.querySelectorAll('#view > *').forEach(e => e.setAttribute('data-stale', '1')); if (location.hash === h) history.replaceState(null, '', '#/~'); location.hash = h; }, newHash(pg));
    return p.waitForFunction(w => !document.querySelector('#view .boot') && (document.querySelector('#view > section.chx-d:not([data-stale]) .pchx-head')?.textContent ?? '').startsWith(w), want, {timeout: 15000}).then(() => true, () => false);
  }, {what: '새 화면 ' + newHash(pg), fail}));
  if (ok === false) fail('새 화면 안 열림', newHash(pg));
}
async function setMode(p, sel, k) { await p.click(sel + ':nth-child(' + k + ')'); await p.waitForTimeout(40); }

function compare(where, O, N, pg, mode, fail = FAIL, bump = BUMP) { // fail · bump 를 바꿔 끼우면 검사 자체 시험(아래 ⓪)
  if (!N) { fail('자세히 칸 없음', where); return; }
  // ① 줄
  if (O.rows.length !== N.rows.length) fail('줄 수', `${where} ${N.rows.length} ≠ 옛 ${O.rows.length}`);
  O.rows.forEach((o, k) => {
    const n = N.rows[k]; if (!n) return;
    if (o.name !== n.name) fail('줄 차례 · 이름', `${where} ${k + 1}번째 「${n.name}」 ≠ 옛 「${o.name}」`);
    if (o.val !== n.val) fail('줄 숫자', `${where} ${o.name} ${n.val} ≠ 옛 ${o.val}`);
    if (JSON.stringify(o.badges) !== JSON.stringify(n.badges)) fail('줄 꼬리표', `${where} ${o.name} ${JSON.stringify(n.badges)} ≠ 옛 ${JSON.stringify(o.badges)}`);
    if (norm(o.trd) !== norm(n.trd)) fail('줄 흐름', `${where} ${o.name} 「${n.trd}」 ≠ 옛 「${o.trd}」`);
    if (o.pk !== n.pk) fail('금빛 띠', `${where} ${o.name}`);
    if (mapHref(o.href) !== n.href) fail('줄 고리', `${where} ${o.name} ${n.href} ≠ ${mapHref(o.href)}`);
    bump('줄');
  });
  // ② 글
  const NT = norm(N.text);
  const blocks = [...O.head, ...O.blocks, ...O.key, ...O.foot.filter(t => norm(t) !== OLD_DISC)].map(norm).filter(Boolean);
  for (const b of blocks) { if (!NT.includes(b)) fail('글 없음', `${where} 「${b.slice(0, 90)}」`); else bump('글'); }
  const disc = O.foot.map(norm).find(t => t.startsWith('저는 투자 상담사가'));
  if (disc && disc !== OLD_DISC) fail('옛 알림 글이 바뀜', `${where} 「${disc}」 — 새 화면 글도 같이 고칠 것`);
  if (norm(N.safe) !== NEW_DISC) fail('알림 글', `${where} 「${N.safe}」`);
  // ③ 숫자 낱말 · ? 줄
  const ob = bag(toks(O.text.replace(OLD_DISC, ''))), nb = bag(toks(N.text));
  for (const [t, c] of ob) { const got = nb.get(t) || 0; if (got < c) fail('숫자 낱말', `${where} 「${t}」 새 ${got} < 옛 ${c}`); else bump('숫자 낱말', c); }
  for (const line of O.text.split('\n').map(norm).filter(l => l.includes('?') && l !== '?')) { if (!NT.includes(line)) fail('? 줄', `${where} 「${line.slice(0, 90)}」`); else bump('? 줄'); }
  for (const c of O.crumbs.map(norm).filter(x => x && x !== '한눈에')) if (!NT.includes(c)) fail('이름', `${where} 「${c}」`);
  // ④ 새 화면만 — 머리 숫자 · 고른 곳 · 위 단 고리 · 쓰지 않을 말 · 고리
  const node = pg.node, want = norm(G(pg.name + ' ' + core.days + '거래일 ' + P(mode === 'cw' ? node.cwChg : node.chg)));
  if (norm(N.head) !== want) fail('머리 숫자', `${where} 「${N.head}」 ≠ 「${want}」`);
  const mem = pg.kind === 'g' ? (node.inds || []).flatMap(n => IND.get(n)?.members || []) : node.members || [];
  const gold = mem.filter(c => CO[c]?.p).map(c => '#/w/' + c);
  if (JSON.stringify(N.gold) !== JSON.stringify(gold)) fail('고른 곳 줄', `${where} ${N.gold.length}곳 ≠ 자료 ${gold.length}곳`);
  if ((node.pk || 0) !== gold.length) fail('고른 곳 수(자료)', `${where} pk ${node.pk} ≠ ${gold.length}`);
  if (pg.kind === 'i') { const g = GRP.get(node.g), w = g ? '#/ch/g/' + encodeURIComponent(g.id) : null; if (N.up !== w) fail('위 단 고리', `${where} ${N.up} ≠ ${w}`); if (O.stepLinks.length && mapHref(O.stepLinks[0]) !== N.up) fail('위 단 고리(옛)', `${where} ${O.stepLinks[0]}`); }
  for (const w of BANNED) if (N.sec.includes(w)) fail('쓰지 않을 말', `${where} 「${w}」`);
  { const m = OLD_WORDS.exec(NT); if (m) fail('옛 낱말이 화면에 나옴(낱말표 밖)', `${where} 「${m[0]}」 …${NT.slice(Math.max(0, m.index - 20), m.index + 20)}…`); } // 사장님 [10] 1
  for (const hr of N.hrefs) { bump('고리'); if (!knownHref(hr)) fail('모르는 고리', `${where} ${hr}`); }
}
/* ⓪ 검사 자체 시험 — 새 화면에서 읽은 것을 일부러 틀리게 바꿔 맞대면 그 틀림을 모두 잡아야 함(못 잡으면 이 검사가 실패) */
let selfTested = false;
function selfTest(O, N, pg, mode) {
  selfTested = true;
  const got = new Set(), F = k => got.add(k), Bn = () => {}, M = () => JSON.parse(JSON.stringify(N));
  const alt = O.blocks.map(norm).find(b => b.startsWith('다르게 보면') || b.startsWith('평균으로 세면') || b.startsWith('한 회사 한 표로 세면')) ?? '';
  const cases = [
    ['줄 숫자', x => { x.rows[0].val = x.rows[0].val === '+99.9%' ? '+98.9%' : '+99.9%'; }],
    ['줄 차례 · 이름', x => { [x.rows[0], x.rows[1]] = [x.rows[1], x.rows[0]]; }],
    ['줄 꼬리표', x => { x.rows[0].badges.push('?'); }],
    ['줄 고리', x => { x.rows[0].href = '#/'; }],
    ['글 없음', x => { x.text = norm(x.text).split(alt).join(''); }],
    ['숫자 낱말', x => { x.text = norm(x.text).split(norm(O.rows[0].val)).join(''); }],
    ['알림 글', x => { x.safe = ''; }],
    ['쓰지 않을 말', x => { x.sec += ' 매수'; }],
  ];
  for (const [k, mut] of cases) { got.clear(); const x = M(); mut(x); compare('검사 자체 시험', O, x, pg, mode, F, Bn); if (!got.has(k)) fail('검사 자체 시험', `「${k}」 틀림을 못 잡음`); else bump('자체 시험'); }
}
/* 따로 셈 — 반올림은 크기로(지금 아틀란스 r1) · 100% 넘으면 소수 없음 */
function P(x) { if (x == null || !Number.isFinite(x)) return '?'; const r = Math.floor(Math.abs(x) * 10 + 0.5 + 1e-7) / 10; if (r === 0) return '0.0%'; return (x > 0 ? '+' : '−') + (r >= 100 ? Math.floor(r + 0.5 + 1e-7).toLocaleString('ko-KR') : r.toFixed(1)) + '%'; }

for (const x of cssRules('site/next/p-chx.css')) fail('글 규칙(css)', x);

/* ①②③④ 맞대기 — 두 보기 */
{
  // 새 화면은 첫 화면(#/)을 거치지 않고 찾기 화면(#/find)에서 엶 — 첫 화면은 ?dev=1 로 아직 없는 다른 쪽 모듈을 불러 그 오류가 이 검사에 섞임
  // 옛 쪽 기준값(oldsnap.mjs) — 쓸 수 있으면 옛 쪽을 열지 않음(po = null) · 아니면 열고 읽은 값 · 받은 파일을 찍음
  const SNAP = await tm.old(async () => oldSnap({file: arg('--old-snap', null), page: 'chx', base, remote: isRemote(base), refresh: has('--old-refresh'),
    key: {checker: await fileSha(fileURLToPath(import.meta.url)), browser: B.version(), width: 390, list: LIST.map(oldHash)}}));
  const po = SNAP.use ? null : await tm.old(() => open(base + '/atlas/#/', 390, 844, q => SNAP.watch(q))), pn = await open(base + '/next/?dev=1#/find', 390);
  if (po) await po.waitForFunction(() => !document.querySelector('#view .boot'), null, {timeout: 20000}).catch(() => fail('옛 화면', '첫 화면 안 열림'));
  await pn.waitForFunction(() => !document.querySelector('#view .boot'), null, {timeout: 20000}).catch(() => fail('새 화면', '첫 화면 안 열림'));
  for (const pg of LIST) {
    const where = (pg.kind === 'g' ? '갈래 ' : '업종 ') + pg.id;
    if (pg.kind === 'i' && pg.node.n === 1) { // 지금 아틀란스는 1곳 업종을 그 회사로 넘김 — 새 화면은 업종 채널에 1곳 알림
      await waitNew(pn, pg); const N = await pn.evaluate(readNew);
      if (!N || !N.text.includes('「1곳」 = 회사가 하나뿐인 업종')) fail('1곳 업종', where); errsOf(pn, where); bump('1곳 업종'); continue;
    }
    for (const mode of ['eq', 'cw']) {
      if (mode === 'eq') { if (po) await waitOld(po, pg); await waitNew(pn, pg); }
      else { if (po) await tm.old(() => setMode(po, '#view .seg button', 2)); await tm.new(() => setMode(pn, '#view .pchx-seg button', 2)); if (po) await tm.old(() => po.waitForTimeout(800)); } // 옛 경주판은 줄을 움직인 뒤 700ms 에 차례대로 다시 꽂음 — 그 전에 읽으면 옛 차례(실제 사이트 검사에서 걸린 것 · 2026-10-17)
      const sk = oldHash(pg) + '|' + mode, O0 = po ? await tm.old(() => po.evaluate(readOld)) : SNAP.get(sk); // 옛 쪽 값 — 열어서 읽음 · 또는 기준값
      if (po) SNAP.put(sk, O0);
      if (!O0) { fail('옛 쪽 기준값 없음', sk); continue; }
      const [O, N] = [glossO(oldToNewDeep(O0)), await tm.new(() => pn.evaluate(readNew))]; // 옛 쪽 글은 이름만 새 이름으로(아틀란스 · ATLAS → 보드리 · rename.mjs) · 낱말은 낱말표로(glossO)
      compare(where + ' · ' + (mode === 'eq' ? '한 회사 한 표' : '큰 회사는 크게'), O, N, pg, mode);
      if (!selfTested && N && O.rows.length > 1) selfTest(O, N, pg, mode);
      if (mode === 'cw') { if (po) await tm.old(() => setMode(po, '#view .seg button', 1)); await tm.new(() => setMode(pn, '#view .pchx-seg button', 1)); if (po) await tm.old(() => po.waitForTimeout(800)); }
      bump('맞댄 화면');
    }
    if (po) errsOf(po, '옛 ' + where); errsOf(pn, '새 ' + where);
  }
  if (po) await po.context().close(); await pn.context().close();
  counts.oldSnap = {...SNAP.info(), note: await SNAP.save(oldFails === 0)}; // 기준값 — 다시 씀 · 새로 씀 · 안 씀(까닭)
  if (!selfTested && LIST.length) fail('검사 자체 시험', '돌리지 못함(줄 둘 넘는 화면 없음)');
}

/* ⑤ 세 폭 — 접은 칸을 펴고 넘침 · 칸 밖 · 44px */
const scan = () => {
  const vw = document.documentElement.clientWidth, s = document.querySelector('main#view section.chx-d'), out = {sw: document.documentElement.scrollWidth, vw, out: [], small: [], has: !!s};
  if (!s) return out;
  s.querySelectorAll('details').forEach(d => { d.open = true; });
  for (const e of s.querySelectorAll('*')) { if (e.closest('.pchx-sr')) continue; const r = e.getBoundingClientRect(); if (!r.width && !r.height) continue; if (r.right > vw + 0.5 || r.left < -0.5) out.out.push((e.className?.baseVal ?? e.className) + ' ' + Math.round(r.left) + '~' + Math.round(r.right)); }
  for (const e of s.querySelectorAll('a, button, summary')) { const r = e.getBoundingClientRect(); if (!r.width || !r.height) continue; if (r.height < 43.5 || r.width < 43.5) out.small.push((e.textContent || e.getAttribute('aria-label') || '').trim().slice(0, 24) + ' ' + Math.round(r.width) + '×' + Math.round(r.height)); }
  out.sw = document.documentElement.scrollWidth; out.out = out.out.slice(0, 6); out.small = out.small.slice(0, 6);
  return out;
};
for (const [w, font] of [[320, 0], [360, 0], [390, 0], [320, 2]]) { // 끝 = 320 폭 · 글씨 「아주 크게」(app.css html.f3 — 화면 칸을 1.29배) 앞 네 화면
  const ctx = await B.newContext({viewport: {width: w, height: 640}, deviceScaleFactor: 1, hasTouch: true});
  await ctx.addInitScript(k => { try { localStorage.setItem('atlas:font', String(k)); } catch { /* 기억 못 함 */ } }, font);
  const p = watch(await ctx.newPage(), base); p._errs = [];
  p.on('pageerror', e => p._errs.push(e.message)); p.on('console', m => { if (m.type() === 'error') p._errs.push(m.text()); });
  await settle(p, async () => { await p.goto(base + '/next/?dev=1#/find'); return true; }, {what: w + ' 찾기 화면', fail});
  await p.waitForFunction(() => !document.querySelector('#view .boot'), null, {timeout: 20000}).catch(() => fail('새 화면', w + ' 첫 화면 안 열림'));
  for (const pg of font ? WLIST.slice(0, 4) : WLIST) {
    const where = w + (font ? ' 아주 크게' : '') + ' ' + newHash(pg);
    await waitNew(p, pg);
    if (w === 360 && !font) for (const x of await pageRules(p)) fail('모양 규칙', `${where} ${x}`); // 닫은 채로(scan 이 접은 칸을 펴기 전에)
    const s = await p.evaluate(scan);
    if (!s.has) fail('자세히 칸 없음', where);
    if (s.sw > s.vw) fail('가로 넘침', `${where} ${s.sw}>${s.vw}`);
    for (const x of s.out) fail('칸 밖', `${where} ${x}`);
    for (const x of s.small) fail('누르는 자리 44px 안 됨', `${where} ${x}`);
    errsOf(p, where); bump('세 폭 화면');
  }
  await p.context().close();
}

/* ⑥ 누르기 — 다시 보기 · 그리는 중 누르면 끝으로 · 소리 · 접은 칸 그대로 · 보기는 화면을 옮겨도 이어짐 */
{
  const p = await open(base + '/next/?dev=1#/find', 390);
  await p.waitForFunction(() => !document.querySelector('#view .boot'), null, {timeout: 20000}).catch(() => {});
  const big = PAGES.filter(x => x.kind === 'i').sort((a, b) => b.node.n - a.node.n)[0], g0 = PAGES.find(x => x.kind === 'g');
  await waitNew(p, g0);
  const d0 = await p.evaluate(() => [...document.querySelectorAll('.chx-d .pchx-ln')].map(x => x.getAttribute('d')));
  await p.click('#view .pchx-btns .pchx-ib:nth-child(1)'); await p.waitForTimeout(500);
  const mid = await p.evaluate(readNew);
  if (!mid.playing || !/\d+월 \d+일/.test(norm(mid.tell)) || mid.tell.includes('→')) fail('다시 보기', JSON.stringify({playing: mid.playing, tell: mid.tell}));
  await p.click('#view .pchx-list .pchx-row'); await p.waitForTimeout(120);
  const end = await p.evaluate(readNew), d1 = await p.evaluate(() => [...document.querySelectorAll('.chx-d .pchx-ln')].map(x => x.getAttribute('d')));
  if (end.playing || !end.tell.includes('→') || JSON.stringify(d0) !== JSON.stringify(d1)) fail('그리는 중 누르면 끝으로', JSON.stringify({playing: end.playing, tell: end.tell, same: JSON.stringify(d0) === JSON.stringify(d1)}));
  if (!(await p.evaluate(() => location.hash)).startsWith('#/ch/g/')) fail('그리는 중 누름이 넘어감', await p.evaluate(() => location.hash));
  await p.click('#view .pchx-btns .pchx-ib:nth-child(2)'); await p.waitForTimeout(80); // 소리(소리 장치가 없어도 오류 없이)
  errsOf(p, '누르기 갈래');
  await waitNew(p, big);
  await p.click('#view .pchx-rest > summary'); await setMode(p, '#view .pchx-seg button', 2);
  const st = await p.evaluate(() => ({open: !!document.querySelector('.chx-d details.pchx-rest[open]'), cw: document.querySelector('.chx-d .pchx-seg button:nth-child(2)')?.getAttribute('aria-pressed')}));
  if (!st.open || st.cw !== 'true') fail('접은 칸 · 보기', JSON.stringify(st));
  await waitNew(p, g0);
  const keep = await p.evaluate(() => document.querySelector('.chx-d .pchx-seg button:nth-child(2)')?.getAttribute('aria-pressed'));
  if (keep !== 'true') fail('보기가 이어지지 않음', String(keep));
  await setMode(p, '#view .pchx-seg button', 1);
  errsOf(p, '누르기 업종'); bump('누르기');
  await p.context().close();
}
await B.close();
const res = {schema: 'atlas11-next-chx-1', at: new Date().toISOString(), base, asOf: mkt.asOf, pages: LIST.length, of: PAGES.length, widthPages: WLIST.length, full: !LIMIT && !WLIMIT && !SKIP, seconds: Math.round((Date.now() - t0) / 1000), time: tm.get(), net: netSummary(), counts, fails, ok: !fails.length};
if (OUT) { await fs.mkdir(path.dirname(path.resolve(OUT)), {recursive: true}); await fs.writeFile(path.resolve(OUT), JSON.stringify(res, null, 1) + '\n'); }
console.log(JSON.stringify({ok: res.ok, pages: res.pages + '/' + res.of, widthPages: res.widthPages, seconds: res.seconds, time: res.time, net: res.net, counts, fails: fails.slice(0, 15)}, null, 0));
process.exit(res.ok ? 0 : 1);
