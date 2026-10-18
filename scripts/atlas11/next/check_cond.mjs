// 조건 찾기(#/cond) 옛 쪽(/atlas/ · atlas.js viewCond · cdPick) ↔ 새 쪽(/next/ · p-cond.js) 맞대기 — 2026-10-17 「첫화면 부터 마지막 페이지 까지 모두 바꿔」
//   쓰는 법: node scripts/atlas11/next/check_cond.mjs --base http://127.0.0.1:8826 [--all | --limit N] [--from N] [--parts combos,picker,edges,widths] [--pw /opt/node-tools/] [--out 결과.json] [--shots 사진 폴더]
//   (--all 이 기본 = 조건 100가지 모두 · --limit N = 앞 N가지 · --from N = N번째부터 · --parts = 고른 묶음만(빠른 다시 돌기 — 문은 모두 돈 결과로) · --out 을 주어야 결과 파일을 씀)
//   ① 조건 100가지(① 업종 5 × ② 회사 5 × ③ 빼기 4)를 옛 쪽 · 새 쪽 같은 주소(#/cond/<①>-<②>-<③>)로 열어 맞댐:
//      칸 셋(고른 말 · 남은 수 · 읽는 이름 · 0곳 표시) · 남은 곳 · ▲ · ▼ · 깔때기 수 · 차례 글 · 처음 줄 · 더 보기 글 ·
//      결과 줄 전부(더 보기를 끝까지 · 번호 · 이름 · 5일 % · 업종 · 몸값 n등 · 고른 곳 금빛 · 고리 #/c/ → #/w/) · ? 줄 전부(이름 · 까닭 · 고리) ·
//      이 검사가 cond.json 으로 따로 센 것(깔때기 · 결과 번호 차례 · ? 번호) · 옛 쪽 숫자 낱말 · 「?」 줄이 새 쪽에 모두 있음(접은 칸 열고)
//   ② 고르는 판 — 칸마다 판 제목 · 고르기 글 · 설명 · 「→ n곳」 · 지금 표시 → 누르면 닫히고 바뀜 · 기억(atlas:cond) 같음 · 닫기 · Esc · 처음대로 · 다시 열면 기억대로 · 더 보기
//   ③ 둘레 — 자료 못 받음 · 날 다름 · 0곳(풀면 n곳 · 누르기) · 장 중 · 지난번과 견줌(atlas:cond-seen · 더 보기 뒤 사라짐) · 틀린 주소 · 기억 + 틀린 주소
//   ④ 세 폭(320 · 360 · 390) — 가로 넘침 0 · 누르는 자리 44px · 글 17px 넘게 · 화면 오류 0 · 쓰지 않을 말 0(처음 · 접은 칸 · 긴 목록 · 고르는 판 셋)
//   실패가 하나라도 있으면 끝 코드 1
import fs from 'node:fs/promises';
import path from 'node:path';
import {createRequire} from 'node:module';
import {fileURLToPath} from 'node:url';
import {oldToNew, oldToNewDeep} from './rename.mjs'; // 이름 바꾸기(2026-10-17 아틀란스 → 보드리)
import {fetchJSON, timer, netSummary} from './net.mjs'; // 망 탈에만 다시 받기 · 옛 쪽 · 새 쪽 시간(2026-10-17 고도리 명령문 [1] 8 · 9)
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../..');
const arg = (k, d) => { const i = process.argv.indexOf(k); return i > 0 ? process.argv[i + 1] : d; };
const require = createRequire(arg('--pw', '/opt/node-tools/'));
const {chromium} = require('playwright');
const base = arg('--base', 'http://127.0.0.1:8826').replace(/\/$/, ''), outArg = arg('--out', null), SHOTS = arg('--shots', null);
const LIMIT = process.argv.includes('--all') ? 0 : Number(arg('--limit', '0')) || 0, FROM = Number(arg('--from', '0')) || 0;
const PARTS = new Set(String(arg('--parts', 'combos,picker,edges,widths')).split(',')), ALLPARTS = ['combos', 'picker', 'edges', 'widths'].every(x => PARTS.has(x));
const fails = [], counts = {}, t0 = Date.now(), tm = timer(t0);
const T = (p, fn) => tm[/\/atlas\//.test(p.url()) ? 'old' : 'new'](fn); // 여는 · 읽는 데 쓴 때 — 그 쪽(주소로 앎) 몫으로
const fail = (k, x) => { if (fails.length < 400) fails.push([k, x]); counts.fail = (counts.fail || 0) + 1; };
const bump = (k, n = 1) => { counts[k] = (counts[k] || 0) + n; };
const J = x => JSON.stringify(x);

/* 자료 · 옛 쪽 고르기 글(atlas.js CD_SLOTS 를 읽어 그대로) */
const getJ = f => fetchJSON(base + '/atlas/data/' + f, f); // 망 탈(끊김 · 429 · 5xx)에만 기다렸다 다시 · 404 는 바로 실패(net.mjs)
const [core, mkt, cond] = await Promise.all(['core.json', 'mkt.json', 'cond.json'].map(f => getJ(f).catch(e => { console.error('자료를 못 받음', e.message); process.exit(1); })));
const SRC = await fs.readFile(path.join(ROOT, 'site/atlas/atlas.js'), 'utf8');
const SLOTS = (() => { const m = /const CD_SLOTS = (\[[\s\S]*?\n\]);/.exec(SRC); if (!m) { console.error('atlas.js 에서 CD_SLOTS 를 못 읽음'); process.exit(1); } return new Function('return ' + m[1])(); })();
const DEF = (() => { const m = /const CD_DEF = (\{[^}]*\})/.exec(SRC); return m ? new Function('return ' + m[1])() : null; })();
if (!DEF) { console.error('atlas.js 에서 CD_DEF 를 못 읽음'); process.exit(1); }
const OPNAME = Object.fromEntries(SLOTS.map(S => [S.k, Object.fromEntries(S.ops.map(o => [o[0], o[1]]))]));
const COMBOS = []; for (const a of SLOTS[0].ops) for (const b of SLOTS[1].ops) for (const c of SLOTS[2].ops) COMBOS.push([a[0], b[0], c[0]].join('-'));
if (COMBOS.length !== 100) fail('조건 가짓수', COMBOS.length + ' ≠ 100');
const OLD36 = JSON.parse((/export const OLD36_TEXT = (\[[^\]]*\]);/.exec(await fs.readFile(path.join(ROOT, 'scripts/atlas11/t365/inspect4.mjs'), 'utf8')) || [, '[]'])[1].replace(/'/g, '"'));
const BANNED = ['추천', '매수', '매도', '팔라', '사세요', '파세요', '예측', '확률', '유망', '기회', '신호', '저평가', '1위', 'TOP', ...OLD36];

/* 따로 셈 — 앱 코드를 쓰지 않음(결정표 cd-v1 · 옛 쪽과 같은 규칙: 값을 모르면 ? 로 따로 · 앞 단계에서 빠진 곳은 다시 안 셈 · 몸값 큰 차례 · 같으면 번호) */
function test(X, k, op, j) {
  const C = X.co, I = X.ind[C.i[j]];
  if (op === 'all') return true;
  if (k === 'a') { if (op === 'big') return I.rc == null ? null : I.rc === 1; return I[op] === 1; }
  if (k === 'b') { if (op === 'pick') return C.p[j] === 1; if (op === 'f3') return C.f3[j] == null ? null : C.f3[j] === 1; if (C.rk[j] == null) return null; return op === 'lead' ? C.rk[j] === 1 : C.rk[j] <= 3; }
  if (op === 'nos') return C.x5[j] == null ? null : C.x5[j] === 0;
  if (op === 'loss') return C.ls[j] == null ? null : C.ls[j] === 0;
  const f = [C.x5[j], C.d15[j], C.m30[j]]; return f.includes(1) ? false : f.includes(null) ? null : true;
}
function run(X, key) {
  const st = key.split('-'), C = X.co; let S = C.c.map((_, j) => j); const steps = [S.length], q = [];
  ['a', 'b', 'c'].forEach((k, i) => { const nx = []; for (const j of S) { const v = test(X, k, st[i], j); if (v === true) nx.push(j); else if (v == null) q.push([C.c[j], k]); } S = nx; steps.push(S.length); });
  S.sort((x, y) => (C.cap[y] ?? -1) - (C.cap[x] ?? -1) || (C.c[x] < C.c[y] ? -1 : 1));
  return {steps, codes: S.map(j => C.c[j]), q: q.sort((x, y) => (x[0] < y[0] ? -1 : 1)), up: S.filter(j => C.r5[j] > 0).length, dn: S.filter(j => C.r5[j] != null && C.r5[j] < 0).length};
}
const L = n => n.toLocaleString('ko-KR');

/* 브라우저 — 하나만(기계가 작음) · 옛 쪽 · 새 쪽은 따로 칸(기억이 섞이지 않게) */
const exe = '/opt/pw-browsers/chromium', B = await chromium.launch((await fs.stat(exe).catch(() => null)) ? {executablePath: exe} : {});
async function mkPage(width, height = 800, setup = null) {
  const ctx = await B.newContext({viewport: {width, height}, deviceScaleFactor: 1, hasTouch: true});
  if (setup) await setup(ctx);
  const p = await ctx.newPage(); p._errs = [];
  p.on('pageerror', e => p._errs.push(e.message)); p.on('console', m => { if (m.type() === 'error') p._errs.push(m.text()); });
  return p;
}
const OLDU = hh => base + '/atlas/' + hh, NEWU = hh => base + '/next/?dev=1' + hh;
const SEL = {
  old: {slot: 'button.cd-slot', o: '.cd-o', c: '.cd-c', reset: '.cd-reset', big: '.cd-big', flow: '.cd-flow', how: '.cd-how', none: '.cd-none', alt: '.cd-alt button', more: '.cd-more',
    row: 'a.cd-row', nm: '.nm', v: '.cd-v', sub: '.cd-sub', pk: '.cd-pk', qsum: 'details.cd-q > summary', qr: '.cd-qr', diff: '.cd-diff', time: '.cd-time', prov: '.cd-time + p.small',
    howto: 'details.cd-howto .in p', hon: 'p.hon', err: '.vw > p.q', src: 'footer.foot p', provc: 'footer.foot p.q',
    sheet: '#cdSheet:not([hidden])', title: '#cdTitle', op: '#cdBody button.cd-op', ot: '.cd-ot b', od: '.cd-od', oc: '.cd-oc', close: '#cdSheet button.close'},
  new: {slot: 'button.pcond-slot', o: '.pcond-o', c: '.pcond-c', reset: '.pcond-reset', big: '.pcond-big', flow: '.pcond-flow', how: '.pcond-how', none: '.pcond-none', alt: '.pcond-alt button', more: '.pcond-more',
    row: 'a.pcond-row', nm: '.pcond-nm', v: '.pcond-v', sub: '.pcond-sub', pk: '.pcond-pk', qsum: 'details.pcond-q > summary', qr: 'a.pcond-qr', diff: '.pcond-diff', time: '.pcond-time', prov: '.pcond-prov',
    howto: 'details.pcond-howto .pcond-in p', hon: '.pcond-hon', err: '.pcond-err', src: '.pcond-foot p', provc: '.pcond-foot .pcond-provc',
    sheet: '.pcond-sheet', title: '#pcondTitle', op: '.pcond-sheet button.pcond-op', ot: '.pcond-ot b', od: '.pcond-od', oc: '.pcond-oc', close: '.pcond-sheet .pcond-close'},
};
/** 화면 읽기(같은 꼴) — 옛 쪽 고리는 새 주소로 바꿔 맞댐(#/c/<번호> → #/w/<번호> · #/x/<번호> → /atlas/#/x/<번호>) · 옛 쪽 글은 이름만 새 이름으로(아틀란스 · ATLAS → 보드리 · rename.mjs) */
const read = (p, side) => T(p, async () => (side === 'old' ? oldToNewDeep(await readRaw(p, side)) : readRaw(p, side)));
const readSheet = (p, side) => T(p, async () => (side === 'old' ? oldToNewDeep(await readSheetRaw(p, side)) : readSheetRaw(p, side)));
const readRaw = (p, side) => p.evaluate(S => {
  const v = document.querySelector('#view'), T = e => (e ? e.textContent : null), A = s => [...v.querySelectorAll(s)];
  const map = hr => (hr ?? '').replace(/^#\/c\//, '#/w/').replace(/^#\/x\//, '/atlas/#/x/');
  const src = A(S.src).map(T).find(t => t.startsWith('자료: ')) ?? null;
  return {
    slots: A(S.slot).map(b => [b.dataset.k, b.getAttribute('aria-label'), T(b.querySelector(S.o)), T(b.querySelector(S.c)), b.classList.contains('zero')]),
    reset: T(v.querySelector(S.reset)), big: T(v.querySelector(S.big)), flow: T(v.querySelector(S.flow)), how: T(v.querySelector(S.how)), none: T(v.querySelector(S.none)), alt: A(S.alt).map(T), more: T(v.querySelector(S.more)),
    rows: A(S.row).map(a => [a.dataset.c, map(a.getAttribute('href')), T(a.querySelector(S.nm)), !!a.querySelector(S.nm)?.classList.contains('gold'), T(a.querySelector(S.v)), T(a.querySelector(S.sub)), !!a.querySelector(S.pk)]),
    qsum: T(v.querySelector(S.qsum)), q: A(S.qr).map(x => { const a = x.matches('a') ? x : x.querySelector('a'); return [map(a?.getAttribute('href')), T(x.matches('a') ? x.querySelector('b') : a), T(x)]; }),
    diff: T(v.querySelector(S.diff)), time: T(v.querySelector(S.time)), prov: T(v.querySelector(S.prov)), howto: A(S.howto).map(T), hon: T(v.querySelector(S.hon)), err: T(v.querySelector(S.err)), src, provc: T(v.querySelector(S.provc)),
  };
}, SEL[side]);
const readSheetRaw = (p, side) => p.evaluate(S => { const s = document.querySelector(S.sheet); if (!s) return null;
  return {title: s.querySelector(S.title)?.textContent ?? document.querySelector(S.title)?.textContent, ops: [...document.querySelectorAll(S.op)].map(b => [b.dataset.op, b.getAttribute('aria-current'), b.querySelector(S.ot)?.textContent, b.querySelector(S.od)?.textContent, b.querySelector(S.oc)?.textContent]),
    focus: document.activeElement?.dataset?.op ?? null}; }, SEL[side]);
/** 옛 쪽 · 새 쪽 같은 값인지(마당 하나씩) */
function same(where, o, n, keys) {
  for (const k of keys) {
    const a = o[k], b = n[k];
    if (J(a) === J(b)) continue;
    if (Array.isArray(a) && Array.isArray(b)) { const i = a.findIndex((x, i2) => J(x) !== J(b[i2])); fail('옛 쪽 ≠ 새 쪽 · ' + k, where + ' 줄 ' + (i < 0 ? a.length : i) + '/' + a.length + '·' + b.length + ' 옛 ' + J(a[i < 0 ? b.length - 1 : i]).slice(0, 160) + ' · 새 ' + J(b[i < 0 ? a.length : i]).slice(0, 160)); }
    else fail('옛 쪽 ≠ 새 쪽 · ' + k, where + ' 옛 ' + J(a).slice(0, 200) + ' · 새 ' + J(b).slice(0, 200));
  }
}
const HEAD = ['slots', 'reset', 'big', 'flow', 'how', 'none', 'alt', 'more', 'rows', 'qsum', 'q', 'diff', 'time', 'prov', 'howto', 'hon', 'err', 'src', 'provc'];
/** 이 조건으로 다 그려질 때까지(옛 쪽 = 칸 셋의 고른 말 · 새 쪽 = data-st) */
async function waitOld(p, key) { return tm.old(() => waitOld0(p, key)); }
async function waitOld0(p, key) {
  const want = key.split('-').map((op, i) => OPNAME['abc'[i]][op]);
  await p.waitForFunction(w => { const s = [...document.querySelectorAll('#view button.cd-slot')]; return s.length === 3 && s.every((b, i) => b.querySelector('.cd-o')?.textContent === w[i]) && !!document.querySelector('#view .cd-big'); }, want, {timeout: 20000});
}
const waitNew = (p, key) => tm.new(() => p.waitForFunction(k => !document.querySelector('#view .boot') && document.querySelector('#view .pcond')?.dataset.st === k && !!document.querySelector('#view .pcond-big'), key, {timeout: 20000}));
const goHash = (p, hh) => T(p, () => p.evaluate(x => { location.hash = x; }, hh));
const expand = (p, side) => T(p, () => p.evaluate(sel => { let n = 0, b; while ((b = document.querySelector('#view ' + sel)) && n < 3000) { b.click(); n++; } return n; }, SEL[side].more));
const norm = s => String(s ?? '').replace(/ /g, ' ').replace(/⁠/g, '');
const toks = s => (norm(s).match(/[+−-]?\d[\d,]*(?:\.\d+)?\s?(?:거래일|%|곳|일|등|개|월|원|배|년|해)?/g) || []).map(t => t.replace(/\s/g, ''));
const allText = p => T(p, () => p.evaluate(() => { for (const d of document.querySelectorAll('#view details')) d.open = true; return document.querySelector('#view').innerText; }));
/** 옛 쪽 숫자 낱말 · 「?」 줄이 새 쪽에 빠짐없이(같은 수만큼) 있는지 */
function wordsIn(where, ot0, nt) {
  const ot = oldToNew(ot0); // 옛 쪽 글 = 이름만 새 이름으로
  const cnt = a => a.reduce((m, t) => m.set(t, (m.get(t) || 0) + 1), new Map()), O = cnt(toks(ot)), N = cnt(toks(nt));
  for (const [t, c] of O) if ((N.get(t) || 0) < c) { fail('옛 쪽 숫자 낱말이 새 쪽에 없음', where + ' 「' + t + '」 옛 ' + c + ' · 새 ' + (N.get(t) || 0)); return; }
  const nl = norm(nt);
  for (const line of norm(ot).split('\n').map(x => x.trim()).filter(x => x.startsWith('?'))) if (!nl.includes(line)) { fail('옛 쪽 ? 줄이 새 쪽에 없음', where + ' 「' + line + '」'); return; }
}
function oldErrs(p, where) { if (p._errs.length) { bump('옛 쪽 화면 오류(참고)'); counts.oldErr = (where + ' ' + p._errs.join(' | ')).slice(0, 300); p._errs.length = 0; } }
function newErrs(p, where, allow = null) { const e = p._errs.filter(m => !(allow && allow.test(m))); p._errs.length = 0; if (e.length) fail('새 쪽 화면 오류', where + ' ' + e.join(' | ').slice(0, 300)); }
const R404 = /^Failed to load resource: the server responded with a status of 404/; // 이 검사가 일부러 404 로 준 자료(자료 못 받음 길)만 봐줌

/* ① 조건 100가지 */
const LIST = COMBOS.slice(FROM, LIMIT ? FROM + LIMIT : undefined);
if (PARTS.has('combos')) {
  const list = LIST;
  const po = await mkPage(390, 844), pn = await mkPage(390, 844);
  await Promise.all([po.goto(OLDU('#/cond/' + list[0])), pn.goto(NEWU('#/cond/' + list[0]))]);
  let first = true;
  for (const key of list) {
    try {
      if (!first) await Promise.all([goHash(po, '#/cond/' + key), goHash(pn, '#/cond/' + key)]);
      first = false;
      await Promise.all([waitOld(po, key), waitNew(pn, key)]);
      const [ho, hn] = await Promise.all([read(po, 'old'), read(pn, 'new')]);
      same(key + ' 처음', ho, hn, HEAD);
      const [eo, en] = await Promise.all([expand(po, 'old'), expand(pn, 'new')]);
      if (eo !== en) fail('더 보기 누른 수', key + ' 옛 ' + eo + ' · 새 ' + en);
      const [fo, fn] = await Promise.all([read(po, 'old'), read(pn, 'new')]);
      same(key + ' 끝까지', fo, fn, ['rows', 'more', 'q', 'big', 'slots']);
      // 따로 셈과 맞댐(옛 쪽 · 새 쪽이 함께 틀리지 않게)
      const x = run(cond, key);
      if (fn.flow !== x.steps.map(L).join(' → ')) fail('깔때기 ≠ 따로 셈', key + ' ' + fn.flow + ' ≠ ' + x.steps.join('→'));
      if (J(fn.rows.map(r => r[0])) !== J(x.codes)) fail('결과 번호 차례 ≠ 따로 셈', key + ' 새 ' + fn.rows.length + '곳 · 따로 ' + x.codes.length + '곳');
      if (J(fn.q.map(r => r[0])) !== J(x.q.map(([c]) => (core.co7 || cond.co.p[cond.co.c.indexOf(c)] === 1 ? '#/w/' : '/atlas/#/x/') + c))) fail('? 줄 ≠ 따로 셈', key + ' 새 ' + fn.q.length + ' · 따로 ' + x.q.length);
      const wantBig = '남은 곳 ' + L(x.codes.length) + '곳' + (x.codes.length ? ' ▲' + x.up + ' ▼' + x.dn : '');
      if (fn.big !== wantBig) fail('남은 곳 ≠ 따로 셈', key + ' 「' + fn.big + '」 ≠ 「' + wantBig + '」');
      for (const r of fn.rows) { const o = mkt.companies[r[0]]; if (!o) { fail('없는 회사 고리', key + ' ' + r[0]); continue; } if (r[2] !== o.n) fail('회사 이름', key + ' ' + r[0] + ' ' + r[2] + ' ≠ ' + o.n); }
      if ((x.q.length ? 1 : 0) !== (fn.qsum ? 1 : 0)) fail('? 칸 있음', key);
      bump('결과 줄', fn.rows.length); bump('? 줄', fn.q.length);
      const [to, tn] = await Promise.all([allText(po), allText(pn)]);
      wordsIn(key, to, tn);
      oldErrs(po, key); newErrs(pn, key);
      bump('조건');
    } catch (e) { fail('조건 열기', key + ' ' + String(e.message).split('\n')[0]); }
  }
  await po.context().close(); await pn.context().close();
}

/* ② 고르는 판 · 처음대로 · 기억 · 더 보기 */
if (PARTS.has('picker')) {
  const po = await mkPage(390, 844), pn = await mkPage(390, 844);
  await Promise.all([po.goto(OLDU('#/cond')), pn.goto(NEWU('#/cond'))]);
  const defKey = [DEF.a, DEF.b, DEF.c].join('-');
  await Promise.all([waitOld(po, defKey), waitNew(pn, defKey)]);
  let key = defKey;
  const both = async (fo, fn) => Promise.all([fo(po, 'old'), fn ? fn(pn, 'new') : fo(pn, 'new')]);
  const stored = async () => { const [a, b] = await Promise.all([po.evaluate(() => localStorage.getItem('atlas:cond')), pn.evaluate(() => localStorage.getItem('atlas:cond'))]); return [a, b]; };
  const PICK = {a: 'dn', b: 'top3', c: 'spike'};
  for (const S of SLOTS) {
    await Promise.all([po.click(`#view button.cd-slot[data-k="${S.k}"]`), pn.click(`#view button.pcond-slot[data-k="${S.k}"]`)]);
    await Promise.all([po.waitForSelector(SEL.old.sheet), pn.waitForSelector(SEL.new.sheet)]); await po.waitForTimeout(80);
    const [so, sn] = await both(readSheet);
    if (!so || !sn) { fail('고르는 판 안 열림', S.k + ' 옛 ' + !!so + ' · 새 ' + !!sn); continue; }
    same('판 ' + S.k, so, sn, ['title', 'ops', 'focus']);
    const st = key.split('-'), i = 'abc'.indexOf(S.k);
    const want = S.ops.map(o => { const k2 = [...st]; k2[i] = o[0]; return [o[0], o[0] === st[i] ? 'true' : null, oldToNew(o[1]), oldToNew(o[2]), '→ ' + L(run(cond, k2.join('-')).codes.length) + '곳']; });
    if (J(sn.ops) !== J(want)) fail('판 고르기 ≠ 따로 셈', S.k + ' ' + J(sn.ops).slice(0, 200));
    if (sn.title !== '①②③'[i] + ' ' + S.name + ' 고르기') fail('판 제목', sn.title);
    // 누르면 닫히고 바뀜
    await Promise.all([po.click(`#cdBody button.cd-op[data-op="${PICK[S.k]}"]`), pn.click(`.pcond-sheet button.pcond-op[data-op="${PICK[S.k]}"]`)]);
    st[i] = PICK[S.k]; key = st.join('-');
    await Promise.all([waitOld(po, key), waitNew(pn, key)]);
    const open = await both(p => p.evaluate(() => !!document.querySelector('#cdSheet:not([hidden])')), p => p.evaluate(() => !!document.querySelector('.pcond-sheet')));
    if (open[0] || open[1]) fail('누른 뒤 판이 닫히지 않음', S.k + ' ' + J(open));
    const [ho, hn] = await both(read);
    same('고른 뒤 ' + key, ho, hn, HEAD);
    const [ko, kn] = await stored();
    if (ko !== kn || kn !== J({a: st[0], b: st[1], c: st[2]})) fail('기억(atlas:cond)', 'old ' + ko + ' · new ' + kn);
    const foc = await pn.evaluate(k => document.activeElement?.matches?.(`button.pcond-slot[data-k="${k}"]`), S.k);
    if (!foc) fail('고른 뒤 그 칸으로 돌아옴', S.k);
    bump('고르기');
  }
  // 닫기 · Esc — 바뀌지 않음
  for (const how of ['close', 'esc']) {
    const k = how === 'close' ? 'a' : 'b';
    await Promise.all([po.click(`#view button.cd-slot[data-k="${k}"]`), pn.click(`#view button.pcond-slot[data-k="${k}"]`)]);
    await Promise.all([po.waitForSelector(SEL.old.sheet), pn.waitForSelector(SEL.new.sheet)]); await pn.waitForTimeout(60);
    if (how === 'close') await Promise.all([po.click(SEL.old.close), pn.click(SEL.new.close)]); else await Promise.all([po.keyboard.press('Escape'), pn.keyboard.press('Escape')]);
    await pn.waitForTimeout(100);
    const open = await both(p => p.evaluate(() => !!document.querySelector('#cdSheet:not([hidden])')), p => p.evaluate(() => !!document.querySelector('.pcond-sheet')));
    if (open[0] || open[1]) fail('판 닫기(' + how + ')', J(open));
    const [ho, hn] = await both(read);
    same(how + ' 뒤', ho, hn, HEAD);
    if (await pn.evaluate(() => document.querySelector('.pcond')?.dataset.st) !== key) fail('닫기로 바뀜(' + how + ')', key);
    bump('닫기');
  }
  // 다시 열면 기억대로(atlas:cond)
  await Promise.all([po.reload(), pn.reload()]);
  await Promise.all([waitOld(po, key), waitNew(pn, key)]);
  { const [ho, hn] = await both(read); same('다시 열기(기억) ' + key, ho, hn, HEAD); bump('기억'); }
  // 더 보기 한 번 · 처음대로(조건을 바꾸면 20곳부터)
  {
    const big = 'all-all-all';
    await Promise.all([goHash(po, '#/cond/' + big), goHash(pn, '#/cond/' + big)]); await Promise.all([waitOld(po, big), waitNew(pn, big)]);
    await Promise.all([po.click('#view .cd-more'), pn.click('#view .pcond-more')]); await pn.waitForTimeout(80);
    const [ho, hn] = await both(read); same('더 보기 한 번', ho, hn, HEAD);
    if (hn.rows.length !== 40) fail('더 보기 한 번 = 40곳', String(hn.rows.length));
    await Promise.all([po.click('#view .cd-reset'), pn.click('#view .pcond-reset')]);
    await Promise.all([waitOld(po, defKey), waitNew(pn, defKey)]);
    const [ro, rn] = await both(read); same('처음대로', ro, rn, HEAD);
    const [ko, kn] = await stored(); if (ko !== kn || kn !== J(DEF)) fail('처음대로 기억', ko + ' · ' + kn);
    const big2 = 'all-all-nos'; // 다른 주소로(같은 주소면 길이 다시 그리지 않음)
    await Promise.all([goHash(po, '#/cond/' + big2), goHash(pn, '#/cond/' + big2)]); await Promise.all([waitOld(po, big2), waitNew(pn, big2)]);
    const [bo, bn] = await both(read); same('처음대로 뒤 20곳부터', bo, bn, HEAD);
    if (bn.rows.length !== 20) fail('처음대로 뒤 20곳부터', String(bn.rows.length));
    bump('더 보기');
  }
  oldErrs(po, '고르는 판'); newErrs(pn, '고르는 판');
  await po.context().close(); await pn.context().close();
}

/* ③ 둘레 — 자료를 바꿔치기해 옛 쪽 · 새 쪽을 같은 자료로 */
async function edgePair(name, hh, {cond: cf, core: kf, ls = null, allow = null} = {}, after = null) {
  const setup = async ctx => {
    if (cf) await ctx.route('**/atlas/data/cond.json', async r => { const x = cf(structuredClone(cond)); if (x === 404) await r.fulfill({status: 404, contentType: 'text/plain', body: 'no'}); else await r.fulfill({status: 200, contentType: 'application/json', body: J(x)}); });
    if (kf) await ctx.route('**/atlas/data/core.json', async r => r.fulfill({status: 200, contentType: 'application/json', body: J(kf(structuredClone(core)))}));
    if (ls) await ctx.addInitScript(o => { if (!sessionStorage.getItem('__seed')) { sessionStorage.setItem('__seed', '1'); for (const [k, v] of Object.entries(o)) localStorage.setItem(k, v); } }, ls);
  };
  const po = await mkPage(390, 844, setup), pn = await mkPage(390, 844, setup);
  try {
    await Promise.all([po.goto(OLDU(hh)), pn.goto(NEWU(hh))]);
    await Promise.all([po.waitForFunction(() => document.querySelector('#view .cd-big') || document.querySelector('#view p.q'), null, {timeout: 20000}), pn.waitForFunction(() => !document.querySelector('#view .boot') && document.querySelector('#view .pcond'), null, {timeout: 20000})]);
    await pn.waitForTimeout(60);
    const [ho, hn] = await Promise.all([read(po, 'old'), read(pn, 'new')]);
    same('둘레 ' + name, ho, hn, HEAD);
    const [to, tn] = await Promise.all([allText(po), allText(pn)]); wordsIn('둘레 ' + name, to, tn);
    if (after) await after(po, pn, ho, hn);
    oldErrs(po, name); newErrs(pn, name, allow);
    bump('둘레');
  } catch (e) { fail('둘레 ' + name, String(e.message).split('\n')[0]); }
  await po.context().close(); await pn.context().close();
}
if (PARTS.has('edges')) {
await edgePair('자료 못 받음', '#/cond', {cond: () => 404, allow: R404}, async (po, pn, ho, hn) => { if (!hn.err?.startsWith('? 조건 자료를 못 받았어요')) fail('자료 못 받음 글', String(hn.err)); });
await edgePair('자료 틀린 판', '#/cond', {cond: x => { x.version = 'cd-v0'; return x; }}, async (po, pn, ho, hn) => { if (!hn.err?.startsWith('? 조건 자료를 못 받았어요')) fail('자료 틀린 판 글', String(hn.err)); });
await edgePair('날 다름', '#/cond', {cond: x => { x.asOf = '2026-10-10'; return x; }}, async (po, pn, ho, hn) => { if (!hn.err?.includes('날이 달라요')) fail('날 다름 글', String(hn.err)); });
await edgePair('장 중', '#/cond', {cond: x => { x.provisional = true; return x; }, core: x => { x.provisional = true; return x; }}, async (po, pn, ho, hn) => { if (!hn.time?.includes('장 중 값') || !hn.prov || !hn.provc) fail('장 중 글', J([hn.time, hn.prov, hn.provc])); });
await edgePair('0곳', '#/cond/big-pick-nos', {cond: x => { x.co.p = x.co.p.map(() => 0); return x; }}, async (po, pn, ho, hn) => {
  if (!hn.none || hn.alt.length !== 3) fail('0곳 글 · 풀면 단추', J([hn.none, hn.alt]));
  if (!hn.slots[1]?.[4]) fail('0곳 칸 표시', J(hn.slots[1]));
  await Promise.all([po.click('#view .cd-alt button:nth-child(2)'), pn.click('#view .pcond-alt button:nth-child(2)')]);
  await Promise.all([waitOld(po, 'big-all-nos'), waitNew(pn, 'big-all-nos')]);
  const [a, b] = await Promise.all([read(po, 'old'), read(pn, 'new')]); same('0곳 → ② 풀기', a, b, HEAD);
});
{ // 지난번과 견줌 — 같은 조건 · 다른 날 기록이 있으면 「…보다 새로 n곳 · 빠진 n곳」 · 더 보기(다시 그림) 뒤 사라짐
  const key = 'up-all-all', x = run(cond, key), prev = [...x.codes.slice(0, 30), '999998', '999999'];
  await edgePair('지난번과 견줌', '#/cond/' + key, {ls: {'atlas:cond-seen': J({sig: key, asOf: '2026-10-10', codes: prev})}}, async (po, pn, ho, hn) => {
    const want = '10월 10일보다 새로 ' + (x.codes.length - 30) + '곳 · 빠진 2곳';
    if (hn.diff !== want) fail('지난번과 견줌 글', J(hn.diff) + ' ≠ ' + J(want));
    await Promise.all([po.click('#view .cd-more'), pn.click('#view .pcond-more')]); await pn.waitForTimeout(80);
    const [a, b] = await Promise.all([read(po, 'old'), read(pn, 'new')]); same('견줌 → 더 보기', a, b, HEAD);
    if (b.diff) fail('더 보기 뒤 견줌 줄 남음', b.diff);
  });
}
for (const bad of ['#/cond/zzz', '#/cond/big-lead', '#/cond/big-lead-xxx', '#/cond/BIG-LEAD-NOS', '#/cond/all-all-all-all', '#/cond/', '#/cond/big-lead-nos/']) await edgePair('틀린 주소 ' + bad, bad);
await edgePair('기억 + 틀린 주소', '#/cond/zzz', {ls: {'atlas:cond': J({a: 'dn', b: 'top3', c: 'loss'})}}, async (po, pn, ho, hn) => { if (!hn.slots[0]?.[2]?.includes('한 달 내린 업종')) fail('기억 + 틀린 주소', J(hn.slots[0])); });
await edgePair('기억 + 맞는 주소', '#/cond/rise-f3-all', {ls: {'atlas:cond': J({a: 'dn', b: 'top3', c: 'loss'})}});
}

/* ④ 세 폭 — 새 쪽만(넘침 · 누르는 자리 · 글 크기 · 오류 · 쓰지 않을 말) */
const scan = p => p.evaluate(() => {
  const vw = document.documentElement.clientWidth, small = [], tiny = [];
  for (const e of document.querySelectorAll('#view a, #view button')) {
    const r = e.getBoundingClientRect(); if (!r.width || !r.height) continue;
    if (getComputedStyle(e).visibility === 'hidden' || e.closest('[hidden]')) continue;
    if (r.height < 43.5 || r.width < 43.5) small.push((e.textContent || e.getAttribute('aria-label') || e.className).trim().slice(0, 30) + ' ' + Math.round(r.width) + '×' + Math.round(r.height));
  }
  const root = document.querySelector('#view .pcond'), wide = [];
  if (root) for (const e of root.querySelectorAll('*')) {
    if (e.closest('svg')) continue;
    const own = [...e.childNodes].some(n => n.nodeType === 3 && n.textContent.trim()); if (!own) continue;
    const r = e.getBoundingClientRect(); if (!r.width || !r.height) continue;
    const fs = parseFloat(getComputedStyle(e).fontSize); if (fs < 17 - 0.01) tiny.push(e.className + ' ' + fs + 'px 「' + e.textContent.trim().slice(0, 20) + '」');
    if (r.right > vw + 0.5 || r.left < -0.5) wide.push(e.className + ' ' + Math.round(r.left) + '~' + Math.round(r.right));
  }
  return {sw: document.documentElement.scrollWidth, vw, text: document.querySelector('#view')?.innerText ?? '', small: small.slice(0, 8), tiny: tiny.slice(0, 8), wide: wide.slice(0, 8)};
});
function checkScan(where, s) {
  if (s.sw > s.vw) fail('가로 넘침', where + ' ' + s.sw + '>' + s.vw);
  for (const x of s.wide) fail('화면 밖 글', where + ' ' + x);
  for (const x of s.small) fail('누르는 자리 44px 안 됨', where + ' ' + x);
  for (const x of s.tiny) fail('글 17px 안 됨', where + ' ' + x);
  for (const w of BANNED) if (s.text.includes(w)) fail('쓰지 않을 말', where + ' 「' + w + '」');
  bump('폭 화면');
}
for (const w of PARTS.has('widths') ? [320, 360, 390] : []) {
  const p = await mkPage(w, 640);
  try {
    await p.goto(NEWU('#/cond')); await waitNew(p, [DEF.a, DEF.b, DEF.c].join('-')); await p.waitForTimeout(100);
    if (SHOTS && w === 360) { await fs.mkdir(SHOTS, {recursive: true}); await p.screenshot({path: path.join(SHOTS, 'cond-360-top.png')}); }
    checkScan(w + ' 처음', await scan(p));
    await p.evaluate(() => { for (const d of document.querySelectorAll('#view details')) d.open = true; }); await p.waitForTimeout(60);
    checkScan(w + ' 접은 칸 열고', await scan(p));
    for (const key of ['all-all-all', 'all-all-spike', 'dn-f3-loss', 'rise-pick-all']) {
      await goHash(p, '#/cond/' + key); await waitNew(p, key);
      const mb = await p.$('#view .pcond-more'); if (mb) await mb.click();
      await p.evaluate(() => { for (const d of document.querySelectorAll('#view details')) d.open = true; }); await p.waitForTimeout(60);
      checkScan(w + ' ' + key, await scan(p));
      if (SHOTS && w === 320 && key === 'all-all-spike') await p.screenshot({path: path.join(SHOTS, 'cond-320-list.png'), fullPage: true});
    }
    for (const k of ['a', 'b', 'c']) {
      await p.click(`#view button.pcond-slot[data-k="${k}"]`); await p.waitForSelector('.pcond-sheet'); await p.waitForTimeout(260);
      checkScan(w + ' 고르는 판 ' + k, await scan(p));
      if (SHOTS && w === 320 && k === 'c') await p.screenshot({path: path.join(SHOTS, 'cond-320-sheet.png')});
      await p.keyboard.press('Escape'); await p.waitForTimeout(60);
    }
    newErrs(p, w + ' 폭');
  } catch (e) { fail('세 폭 ' + w, String(e.message).split('\n')[0]); }
  await p.context().close();
}

await B.close();
const res = {schema: 'atlas11-next-cond-1', at: new Date().toISOString(), base, asOf: cond.asOf, combos: PARTS.has('combos') ? LIST.length : 0, from: FROM, parts: [...PARTS], full: !LIMIT && !FROM && ALLPARTS, seconds: Math.round((Date.now() - t0) / 1000), time: tm.get(), net: netSummary(), counts, fails, ok: !fails.length};
if (outArg) { const out = path.resolve(ROOT, outArg); await fs.mkdir(path.dirname(out), {recursive: true}); await fs.writeFile(out, JSON.stringify(res, null, 1) + '\n'); }
console.log(JSON.stringify({ok: res.ok, seconds: res.seconds, combos: res.combos, time: res.time, net: res.net, counts, fails: fails.slice(0, 15)}, null, 0));
process.exit(res.ok ? 0 : 1);
