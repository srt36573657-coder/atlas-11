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
//   실패가 하나라도 있으면 끝 코드 1
import fs from 'node:fs/promises';
import path from 'node:path';
import {createRequire} from 'node:module';
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
const fails = [], counts = {}, t0 = Date.now();
const fail = (k, x) => { if (fails.length < 300) fails.push([k, x]); counts.fail = (counts.fail || 0) + 1; };
const bump = (k, n = 1) => { counts[k] = (counts[k] || 0) + n; };
const FAIL = fail, BUMP = bump;
const norm = s => String(s ?? '').replace(/[\s ]+/g, ' ').trim();

const getJ = async f => { const r = await fetch(base + '/atlas/data/' + f, {cache: 'no-store'}); if (!r.ok) throw Error(f + ' ' + r.status); return r.json(); };
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
async function open(url, width, height = 844) {
  const ctx = await B.newContext({viewport: {width, height}, deviceScaleFactor: 1, hasTouch: true});
  const p = await ctx.newPage(); p._errs = [];
  p.on('pageerror', e => p._errs.push(e.message)); p.on('console', m => { if (m.type() === 'error') p._errs.push(m.text()); });
  await p.goto(url); return p;
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
async function waitOld(p, pg) {
  await p.evaluate(h => { document.querySelectorAll('#view > *').forEach(e => e.setAttribute('data-stale', '1')); location.hash = h; }, oldHash(pg));
  const want = pg.name + ' ' + core.days + '거래일';
  await p.waitForFunction(w => { const v = document.querySelector('#view > .vw:not([data-stale])'); return !!v && !v.querySelector('.boot') && (v.querySelector('h1.head')?.textContent ?? '').startsWith(w) && !!v.querySelector('.board .row'); }, want, {timeout: 15000}).catch(() => fail('옛 화면 안 열림', oldHash(pg)));
  await p.waitForTimeout(30);
}
async function waitNew(p, pg) {
  await p.evaluate(h => { document.querySelectorAll('#view > *').forEach(e => e.setAttribute('data-stale', '1')); location.hash = h; }, newHash(pg));
  const want = pg.name + ' ' + core.days + '거래일';
  await p.waitForFunction(w => !document.querySelector('#view .boot') && (document.querySelector('#view > section.chx-d:not([data-stale]) .pchx-head')?.textContent ?? '').startsWith(w), want, {timeout: 15000}).catch(() => fail('새 화면 안 열림', newHash(pg)));
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
  const node = pg.node, want = norm(pg.name + ' ' + core.days + '거래일 ' + P(mode === 'cw' ? node.cwChg : node.chg));
  if (norm(N.head) !== want) fail('머리 숫자', `${where} 「${N.head}」 ≠ 「${want}」`);
  const mem = pg.kind === 'g' ? (node.inds || []).flatMap(n => IND.get(n)?.members || []) : node.members || [];
  const gold = mem.filter(c => CO[c]?.p).map(c => '#/w/' + c);
  if (JSON.stringify(N.gold) !== JSON.stringify(gold)) fail('고른 곳 줄', `${where} ${N.gold.length}곳 ≠ 자료 ${gold.length}곳`);
  if ((node.pk || 0) !== gold.length) fail('고른 곳 수(자료)', `${where} pk ${node.pk} ≠ ${gold.length}`);
  if (pg.kind === 'i') { const g = GRP.get(node.g), w = g ? '#/ch/g/' + encodeURIComponent(g.id) : null; if (N.up !== w) fail('위 단 고리', `${where} ${N.up} ≠ ${w}`); if (O.stepLinks.length && mapHref(O.stepLinks[0]) !== N.up) fail('위 단 고리(옛)', `${where} ${O.stepLinks[0]}`); }
  for (const w of BANNED) if (N.sec.includes(w)) fail('쓰지 않을 말', `${where} 「${w}」`);
  for (const hr of N.hrefs) { bump('고리'); if (!knownHref(hr)) fail('모르는 고리', `${where} ${hr}`); }
}
/* ⓪ 검사 자체 시험 — 새 화면에서 읽은 것을 일부러 틀리게 바꿔 맞대면 그 틀림을 모두 잡아야 함(못 잡으면 이 검사가 실패) */
let selfTested = false;
function selfTest(O, N, pg, mode) {
  selfTested = true;
  const got = new Set(), F = k => got.add(k), Bn = () => {}, M = () => JSON.parse(JSON.stringify(N));
  const alt = O.blocks.map(norm).find(b => b.startsWith('다르게 보면') || b.startsWith('한 회사 한 표로 세면')) ?? '';
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

/* ①②③④ 맞대기 — 두 보기 */
{
  // 새 화면은 첫 화면(#/)을 거치지 않고 찾기 화면(#/find)에서 엶 — 첫 화면은 ?dev=1 로 아직 없는 다른 쪽 모듈을 불러 그 오류가 이 검사에 섞임
  const po = await open(base + '/atlas/#/', 390), pn = await open(base + '/next/?dev=1#/find', 390);
  await po.waitForFunction(() => !document.querySelector('#view .boot'), null, {timeout: 20000}).catch(() => fail('옛 화면', '첫 화면 안 열림'));
  await pn.waitForFunction(() => !document.querySelector('#view .boot'), null, {timeout: 20000}).catch(() => fail('새 화면', '첫 화면 안 열림'));
  for (const pg of LIST) {
    const where = (pg.kind === 'g' ? '갈래 ' : '업종 ') + pg.id;
    if (pg.kind === 'i' && pg.node.n === 1) { // 지금 아틀란스는 1곳 업종을 그 회사로 넘김 — 새 화면은 업종 채널에 1곳 알림
      await waitNew(pn, pg); const N = await pn.evaluate(readNew);
      if (!N || !N.text.includes('「1곳」 = 회사가 하나뿐인 업종')) fail('1곳 업종', where); errsOf(pn, where); bump('1곳 업종'); continue;
    }
    for (const mode of ['eq', 'cw']) {
      if (mode === 'eq') { await waitOld(po, pg); await waitNew(pn, pg); }
      else { await setMode(po, '#view .seg button', 2); await setMode(pn, '#view .pchx-seg button', 2); await po.waitForTimeout(800); } // 옛 경주판은 줄을 움직인 뒤 700ms 에 차례대로 다시 꽂음 — 그 전에 읽으면 옛 차례(실제 사이트 검사에서 걸린 것 · 2026-10-17)
      const [O, N] = [await po.evaluate(readOld), await pn.evaluate(readNew)];
      compare(where + ' · ' + (mode === 'eq' ? '한 회사 한 표' : '큰 회사는 크게'), O, N, pg, mode);
      if (!selfTested && N && O.rows.length > 1) selfTest(O, N, pg, mode);
      if (mode === 'cw') { await setMode(po, '#view .seg button', 1); await setMode(pn, '#view .pchx-seg button', 1); await po.waitForTimeout(800); }
      bump('맞댄 화면');
    }
    errsOf(po, '옛 ' + where); errsOf(pn, '새 ' + where);
  }
  await po.context().close(); await pn.context().close();
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
  const p = await ctx.newPage(); p._errs = [];
  p.on('pageerror', e => p._errs.push(e.message)); p.on('console', m => { if (m.type() === 'error') p._errs.push(m.text()); });
  await p.goto(base + '/next/?dev=1#/find');
  await p.waitForFunction(() => !document.querySelector('#view .boot'), null, {timeout: 20000}).catch(() => fail('새 화면', w + ' 첫 화면 안 열림'));
  for (const pg of font ? WLIST.slice(0, 4) : WLIST) {
    const where = w + (font ? ' 아주 크게' : '') + ' ' + newHash(pg);
    await waitNew(p, pg);
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
const res = {schema: 'atlas11-next-chx-1', at: new Date().toISOString(), base, asOf: mkt.asOf, pages: LIST.length, of: PAGES.length, widthPages: WLIST.length, full: !LIMIT && !WLIMIT && !SKIP, seconds: Math.round((Date.now() - t0) / 1000), counts, fails, ok: !fails.length};
if (OUT) { await fs.mkdir(path.dirname(path.resolve(OUT)), {recursive: true}); await fs.writeFile(path.resolve(OUT), JSON.stringify(res, null, 1) + '\n'); }
console.log(JSON.stringify({ok: res.ok, pages: res.pages + '/' + res.of, widthPages: res.widthPages, seconds: res.seconds, counts, fails: fails.slice(0, 15)}, null, 0));
process.exit(res.ok ? 0 : 1);
