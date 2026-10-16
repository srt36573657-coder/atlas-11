// 5단 누구와 다투나 — 새 아틀란스(/next/ p-rivals) 를 지금 아틀란스(/atlas/ viewRivals)와 맞대는 검사(2026-10-17 「첫화면 부터 마지막 페이지 까지 모두 바꿔」 · 「정말 빠르면서도 정밀하게」)
//   쓰는 법: node scripts/atlas11/next/check_rivals.mjs --base http://127.0.0.1:8826 [--all | --limit N] [--widths N] [--pw /opt/node-tools/] [--out 결과.json] [--dry = 고를 회사만 보고 끝]
//     기본 = 까다로운 회사(순이익 업종 · 막대 없음 · 차례 모름 · 위 다섯 밖 · 따로 확인한 글 · 기사 확인 안 함 …) + 고른 곳 모두 + 고른 곳 밖 골고루 = 회사 290곳쯤 + 없는 번호 넷
//     --all = 모든 회사(회사 파일이 있는 곳 모두) + 없는 번호 · --limit N = 위 차례로 앞 N곳 · --widths N = 세 폭 검사 회사 수(기본 10 · 0 이면 안 함)
//   ① 옛 쪽 · 새 쪽을 같은 자료로 열어 맞댐 — 옛 쪽 글 마디(7단 표시 · 맨 아래 꾸밈 · 맨 아래 고리 · 옛 맨 아래 문장 · 다음 단 단추는 따로 셈)가 새 쪽 글(접은 칸 포함)에 빠짐없이 ·
//      숫자 낱말(% · 원 · 곳 · 배 · 번째 · 년 · 월 · 일 …) · 「?」 줄 · 바깥 고리(기사 · 따로 확인한 글) · 7단 표시 「7단 중 5단 · … · 조사」 · 다음 단 글 · 안전 문장
//   ② 자료(co/<번호>.json · core · mkt · comp)에서 따로 셈 — 큰 제목 · 막대 머리 글 · 막대 줄 이름 · 값(억 원 · 조 원) · 넓이 · 이 회사 줄 · 다른 회사 줄 고리(#/w/<번호>/rivals) ·
//      판의 모양 · 진한 칸 · 경쟁 회사 수 · 이야기 없음 글 · 챕터 일곱(5 금빛 테) · 다음 챕터(#/w/<번호>/grow)
//   ③ 세 폭(320 · 360 · 390 · 접은 칸 연 채로) — 가로 넘침 0 · 칸 밖으로 나간 것 0 · 보이는 글씨 17px 넘게 · 누르는 자리 44px 넘게 · 화면 오류 0
//      (쓰지 않을 말 0 — 남의 글 data-proper 밖 · ① 에서 회사마다)
//   ④ 못 받은 파일(빈 날 길) — 회사 파일 · 고른 곳 자료 · 이름표 · 바탕 자료를 하나씩 막고 열어 봄: 멈춤 0 · 「?」 줄 · 화면 오류 0
//   실패가 하나라도 있으면 끝 코드 1(결과는 화면에 · --out 이면 파일로도)
import fs from 'node:fs/promises';
import path from 'node:path';
import {createRequire} from 'node:module';
import {fileURLToPath} from 'node:url';
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../..');
const argv = process.argv, has = k => argv.includes(k), arg = (k, d) => { const i = argv.indexOf(k); return i > 0 && argv[i + 1] != null ? argv[i + 1] : d; };
const require = createRequire(arg('--pw', '/opt/node-tools/'));
const {chromium} = require('playwright');
const base = arg('--base', 'http://127.0.0.1:8826').replace(/\/$/, ''), OUT = arg('--out', null), ALL = has('--all'), LIMIT = Number(arg('--limit', '0')) || 0, NW = Number(arg('--widths', '10'));
const fails = [], counts = {}, t0 = Date.now();
const fail = (k, x) => { if (fails.length < 400) fails.push([k, String(x).slice(0, 300)]); counts.fail = (counts.fail || 0) + 1; };
const bump = (k, n = 1) => { counts[k] = (counts[k] || 0) + n; };

/* 자료 — 앱 코드를 쓰지 않고 따로 셈(같은 규칙: 반올림은 크기로 · 억 원 · 조 원) */
const getJ = async f => { const r = await fetch(base + '/atlas/data/' + f, {cache: 'no-store'}); if (!r.ok) throw Error(f + ' ' + r.status); return r.json(); };
const [core, mkt, comp, names] = await Promise.all(['core.json', 'mkt.json', 'comp.json', 'names.json'].map(f => getJ(f).catch(e => { fail('자료', e.message); return null; })));
if (!core || !mkt || !comp) { console.error('자료를 못 받음'); process.exit(1); }
const CO = mkt.companies, PK = comp.companies;
const R1 = x => Math.sign(x) * Math.floor(Math.abs(x) * 10 + 0.5 + 1e-7) / 10;
const EOK = v => { if (v == null) return '?'; const s = v < 0 ? '−' : '', a = Math.abs(v); return a >= 10000 ? s + R1(a / 10000).toLocaleString('ko-KR', {maximumFractionDigits: 1}) + '조 원' : s + Math.round(a).toLocaleString('ko-KR') + '억 원'; };
const PN = `${core.rules?.name ?? '고른'} ${core.funnel?.picked ?? '?'}곳`;
const SHAPES = ['혼자 앞섬', '몇 곳이 나눔', '다투는 곳이 많음', '새로 생기는 판'];
const norm = s => String(s ?? '').replace(/[\u00a0\u2060\u200b]/g, ' ').replace(/\s+/g, ' ').trim();
// 쓰지 않을 말(새 아틀란스 공통 + 규칙 72 ⑥) + 지운 36곳 화면 글(inspect4.mjs OLD36_TEXT 그대로 — next_check 와 같은 목록)
const OLD36 = JSON.parse((/export const OLD36_TEXT = (\[[^\]]*\]);/.exec(await fs.readFile(path.join(ROOT, 'scripts/atlas11/t365/inspect4.mjs'), 'utf8')) || [, '[]'])[1].replace(/'/g, '"'));
if (!OLD36.length) { console.error('OLD36_TEXT 를 못 읽음'); process.exit(1); }
const BANNED = ['추천', '매수', '매도', '사라', '팔라', '사세요', '파세요', '예측', '확률', '유망', '기회', '신호', '저평가', '1위', 'TOP', ...OLD36];
// 안전 문장 — 옛 맨 아래 「저는 투자 상담사가 아닙니다 · … 매수 · 매도 · 보유 또는 시장 전망을 권하지 않습니다」의 뜻(상담사 아님 · 지난 기록 · 사고팔기 · 들고 있기 · 시장 앞날)이 새 화면 말로 다 있는지
const SAFE_HAS = ['투자 상담사가 아니', '지난 기록', '사고팔기', '들고 있기', '시장 앞날', '권하지 않'];

/* 회사 고르기 — 까다로운 곳 먼저 · 고른 곳 모두 · 고른 곳 밖 골고루 */
const files = new Set((await fs.readdir(path.join(ROOT, 'site/atlas/data/co')).catch(() => [])).map(f => f.replace(/\.json$/, '')));
const allCodes = Object.keys(CO).filter(c => !files.size || files.has(c)).sort();
const coCache = new Map();
const coOf = c => { if (!coCache.has(c)) coCache.set(c, getJ('co/' + encodeURIComponent(c) + '.json').catch(() => null)); return coCache.get(c); };
/** 회사 파일을 여럿 함께 받아 둠(한 번에 24개씩) */
async function prefetch(cs) { let k = 0; await Promise.all(Array.from({length: 24}, async () => { while (k < cs.length) await coOf(cs[k++]); })); }
async function pickList() {
  await prefetch(allCodes);
  if (ALL) return allCodes;
  // 까다로운 곳 — 모든 회사 파일을 훑어 갈래마다 몇 곳(순이익 업종 · 막대 없음 · 차례 모름 · 위 다섯 밖 · 음수 값 · 따로 확인한 글 · 기사 확인 안 함 · 경쟁 회사 많음 · 긴 이름 · 긴 경쟁 회사 이름)
  const want = {net: 2, empty: 3, rankNull: 3, outTop: 3, neg: 2, chk: 3, plain: 3, many: 3, longName: 3, longRival: 2}, cand = Object.fromEntries(Object.keys(want).map(k => [k, []]));
  for (const c of allCodes) { const g = (await coOf(c))?.grow; if (!g?.ind) continue; const I = g.ind, S = g.story;
    if (I.size === 'net') cand.net.push([0, c]); if (!g.top?.length) cand.empty.push([0, c]); if (I.rank == null) cand.rankNull.push([0, c]);
    if (!g.top?.some(t => t[2] === c) && I.me != null && g.top?.length) cand.outTop.push([0, c]); if ((g.top || []).some(t => t[1] < 0) || I.me < 0) cand.neg.push([0, c]);
    if (S?.rivals?.some(r => !r.url && r.chk)) cand.chk.push([0, c]); if (S?.rivals?.some(r => !r.url && !r.chk)) cand.plain.push([0, c]);
    if ((S?.rivals?.length ?? 0) >= 4) cand.many.push([-S.rivals.length, c]); cand.longName.push([-CO[c].n.length, c]);
    if (S?.rivals?.length) cand.longRival.push([-Math.max(...S.rivals.map(r => r.name.length)), c]); }
  const tricky = new Set(), got = {};
  for (const k of Object.keys(want)) { const xs = cand[k].sort((a, b) => a[0] - b[0] || (a[1] < b[1] ? -1 : 1)); got[k] = 0; for (const [, c] of xs) { if (got[k] >= want[k]) break; if (!tricky.has(c)) { tricky.add(c); got[k]++; } } }
  counts.tricky = got;
  // 그다음 고른 곳 모두 · 고른 곳 밖은 업종마다 한 곳 + 골고루(150곳쯤)
  const byInd = new Map(); for (const c of allCodes) { const i = CO[c].i; if (!byInd.has(i)) byInd.set(i, c); }
  const spread = allCodes.filter((c, k) => k % Math.max(1, Math.floor(allCodes.length / 150)) === 0);
  return [...new Set([...tricky, ...Object.keys(PK).sort(), ...byInd.values(), ...spread])];
}
let list = await pickList();
counts.sec = {pick: Math.round((Date.now() - t0) / 1000)};
if (LIMIT) list = list.slice(0, LIMIT);
// 없는 번호 — 회사 파일이 없는 이름표(우선주 · 펀드 …) 종류마다 하나 + 이름표에도 없는 번호
const MISSING = [];
if (names?.rows) { const seen = new Set(); for (const r of names.rows) { if (files.has(r.c) || CO[r.c]) continue; const k = r.k ?? r.s; if (seen.has(k)) continue; seen.add(k); MISSING.push(r.c); if (MISSING.length >= (ALL ? 8 : 3)) break; } }
MISSING.push('ZZZZZZ');
const NAMES = new Map((names?.rows ?? []).map(r => [r.c, r]));
if (has('--dry')) { console.log(JSON.stringify({companies: list.length, missing: MISSING, tricky: counts.tricky, first: list.slice(0, 30)})); process.exit(0); } // 고른 회사만 보고 끝(브라우저 없이)

/* 화면 */
const exe = '/opt/pw-browsers/chromium', b = await chromium.launch((await fs.stat(exe).catch(() => null)) ? {executablePath: exe} : {});
async function page(width, height = 844) {
  const ctx = await b.newContext({viewport: {width, height}, deviceScaleFactor: 1, hasTouch: true});
  const p = await ctx.newPage(); p._errs = [];
  p.on('pageerror', e => p._errs.push(e.message)); p.on('console', m => { if (m.type() === 'error') p._errs.push(m.text()); });
  return p;
}
/** 길 열기 — 앞 화면 글이 남아 있으면 「다 그림」으로 잘못 읽으므로 먼저 비우고 주소를 바꿈 */
async function open(p, hash, done, what) {
  await p.evaluate(h => { if (location.hash === h) history.replaceState(null, '', '#/~'); document.querySelector('#view')?.replaceChildren(); location.hash = h; }, hash); // 같은 주소면 길이 안 바뀌므로 잠깐 다른 주소로 바꿔 둠(길은 열지 않음)
  let ok = await p.waitForFunction(done, null, {timeout: 20000}).then(() => true).catch(() => false);
  if (!ok) { // 실제 사이트가 잠깐 느릴 때(다른 검사가 함께 돌 때) — 한 번만 다시 열어 봄 · 그래도 못 그리면 실패(2026-10-17 실제 사이트 검사)
    await p.evaluate(h => { history.replaceState(null, '', '#/~'); document.querySelector('#view')?.replaceChildren(); location.hash = h; }, hash);
    ok = await p.waitForFunction(done, null, {timeout: 40000}).then(() => true).catch(() => false);
  }
  if (!ok) fail('다 그리지 못함', what + ' ' + hash);
  return ok;
}
const OLD_DONE = () => { const v = document.querySelector('#view'); return !!(v && v.querySelector('.vw') && !v.querySelector('.boot') && v.querySelector('h1')); };
const NEW_DONE = () => { const v = document.querySelector('#view'); return !!(v && v.childElementCount && !v.querySelector('.boot') && v.querySelector('h1')); };
/** 옛 쪽 — 글 마디(7단 표시 · 맨 아래 꾸밈 · 맨 아래 고리 · 다음 단 단추 · 옛 맨 아래 문장 빼고) · 다음 단 글 · 7단 표시 · 바깥 고리 */
const oldRead = () => {
  const v = document.querySelector('#view'), parts = [];
  const disc = [...v.querySelectorAll('.foot p')].find(x => x.textContent.includes('투자 상담사'));
  const skip = el => el.closest('nav.steps, .foot-mo, .foot .links, a.nextst, .chev, svg') || (disc && disc.contains(el));
  const tw = document.createTreeWalker(v, NodeFilter.SHOW_TEXT);
  for (let n = tw.nextNode(); n; n = tw.nextNode()) { const pe = n.parentElement; if (pe && !skip(pe)) parts.push(n.textContent); }
  return {parts, h1: v.querySelector('h1')?.textContent ?? '', st: v.querySelector('.st-t')?.textContent ?? null,
    nextst: [...v.querySelectorAll('a.nextst')].map(a => [a.querySelector('b')?.textContent ?? '', a.querySelector('span span')?.textContent ?? '', a.getAttribute('href')]),
    ext: [...v.querySelectorAll('a[target="_blank"]')].map(a => a.getAttribute('href')), disc: disc?.textContent ?? null,
    peers: [...v.querySelectorAll('ul.peers li')].map(li => [li.querySelector('.pn')?.textContent ?? '', li.querySelector('b.num')?.textContent ?? '', li.classList.contains('me'), li.querySelector('.pb')?.style.width ?? '']), peersLabel: v.querySelector('ul.peers')?.getAttribute('aria-label') ?? null, err: !!v.querySelector('.vw > .play') && v.textContent.includes('자료를 못 읽었습니다')};
};
/** 새 쪽 — 글(접은 칸 포함 · 글 마디를 그대로 이어 붙임) · 남의 글 · 막대 · 판의 모양 · 고리 */
const newRead = () => {
  const v = document.querySelector('#view'), parts = [], own = [];
  const tw = document.createTreeWalker(v, NodeFilter.SHOW_TEXT);
  for (let n = tw.nextNode(); n; n = tw.nextNode()) { parts.push(n.textContent); if (!n.parentElement?.closest('[data-proper]')) own.push(n.textContent); }
  const q = s => v.querySelector(s), qa = s => [...v.querySelectorAll(s)];
  return {all: parts.join(''), own: own.join('\n'), h1: q('h1')?.textContent ?? '', head: q('.privals-h')?.textContent ?? null, lv: q('.privals-lv')?.textContent ?? null,
    peers: qa('.privals-peers > li').map(li => ({n: li.querySelector('.privals-pn')?.textContent ?? null, v: li.querySelector('.privals-pv')?.textContent ?? null, w: li.querySelector('.privals-pb')?.style.width ?? null,
      me: li.classList.contains('privals-me'), meBar: !!li.querySelector('.privals-pb.privals-mebar'), href: li.querySelector('a')?.getAttribute('href') ?? null})),
    q0: !!q('.privals-q0'), peersLabel: q('.privals-peers')?.getAttribute('aria-label') ?? null, note: q('.privals-note')?.textContent ?? null, shape: q('.privals-shape b')?.textContent ?? null, shpOn: qa('.privals-shp.privals-on').map(x => x.textContent), shpN: qa('.privals-shp').length,
    rv: qa('.privals-rv').length, h3: q('.privals-h3')?.textContent ?? null, ext: qa('a[target="_blank"]').map(a => a.getAttribute('href')),
    extRel: qa('a[target="_blank"]').every(a => /noopener/.test(a.rel || '')), chaps: qa('.chaps .cp').map(x => [x.querySelector('i')?.textContent, x.classList.contains('now'), x.getAttribute('href')]),
    next: q('a.chap-next')?.getAttribute('href') ?? null, safe: qa('.safe').map(x => x.textContent), details: qa('details').length, title: document.title};
};
const strip = t => { let s = norm(t); for (let k = 0; k < 3; k++) s = s.replace(/^[·—–\-:,]\s*/, '').trim(); return s; };
const NUM = /[−+]?\d[\d,]*(?:\.\d+)?(?:\s?(?:%|조 원|억 원|만 원|원|곳|배|번째|위|년|월|일|분기|인치|개|명|거래일|단))?/g;

/* ①② 회사마다 — 390 폭 */
const po = await page(390), pn = await page(390);
// 새 쪽은 찾기 화면에서 시작 — 새 쪽 첫 화면(홈)은 다른 쪽 모듈을 부르므로(옮기는 중 404) 이 검사와 섞이지 않게 · 같은 주소로 다시 가면 길이 안 바뀌므로 5단 주소로는 시작하지 않음
await po.goto(base + '/atlas/#/'); await po.waitForFunction(() => document.querySelector('#view .vw') && !document.querySelector('#view .boot'), null, {timeout: 30000}).catch(() => fail('옛 쪽 첫 화면', '안 열림'));
await pn.goto(base + '/next/?dev=1#/find'); await pn.waitForFunction(() => document.querySelector('#view .find input'), null, {timeout: 30000}).catch(() => fail('새 쪽 찾기 화면', '안 열림'));
await pn.waitForTimeout(150);
po._errs.length = 0; pn._errs.length = 0;
const fundCode = new Set(MISSING);
for (const code of [...list, ...MISSING]) {
  const miss = fundCode.has(code), tag = (miss ? '없는 번호 ' : '') + code;
  // 옛 쪽 · 새 쪽을 함께 엶(따로 된 두 칸 — 기다리는 때를 겹쳐 빠르게)
  const [okO, okN] = await Promise.all([open(po, '#/c/' + code + '/rivals', OLD_DONE, '옛 쪽').then(async ok => { if (ok && miss && NAMES.has(code)) await po.waitForFunction(() => document.querySelector('#view .funnels'), null, {timeout: 8000}).catch(() => fail('옛 쪽 까닭', tag)); return ok; }), // 옛 쪽은 이름표를 받은 뒤 까닭 · 깔때기를 붙임
    open(pn, '#/w/' + code + '/rivals', NEW_DONE, '새 쪽')]);
  if (!okO || !okN) continue;
  const O = await po.evaluate(oldRead);
  if (O.err) { fail('옛 쪽 못 엶', tag); continue; }
  const N = await pn.evaluate(newRead), ALLN = norm(N.all);
  // ① 옛 쪽 글 마디가 새 쪽에 빠짐없이
  let seg = 0;
  for (const raw of O.parts) { const t = strip(raw); if (!t || !/[0-9A-Za-z가-힣?]/.test(t)) continue; seg++; if (!ALLN.includes(t)) fail('옛 글이 새 쪽에 없음', tag + ' 「' + t.slice(0, 80) + '」'); }
  bump('글 마디', seg);
  const toks = new Set(O.parts.flatMap(x => norm(x).match(NUM) ?? []).map(x => x.trim()));
  for (const tk of toks) if (!ALLN.includes(tk)) fail('숫자 낱말 없음', tag + ' ' + tk);
  bump('숫자 낱말', toks.size);
  for (const x of O.parts.map(norm).filter(x => x.startsWith('?'))) if (!ALLN.includes(x)) fail('「?」 줄 없음', tag + ' ' + x);
  if (norm(O.h1) !== norm(N.h1)) fail('큰 제목', tag + ' 「' + N.h1 + '」 ≠ 「' + O.h1 + '」');
  if (O.st != null && norm(N.lv) !== norm(O.st)) fail('7단 표시', tag + ' 「' + N.lv + '」 ≠ 「' + O.st + '」');
  for (const [tt, sub] of O.nextst) for (const x of [tt, sub]) if (x && !ALLN.includes(norm(x))) fail('다음 단 글', tag + ' ' + x);
  for (const u of new Set(O.ext)) if (!N.ext.includes(u)) fail('바깥 고리 없음', tag + ' ' + u);
  // 막대 줄 — 옛 쪽 줄(이름 · 값 · 이 회사 · 넓이)과 새 쪽 줄을 차례대로 · 화면 읽기 이름(aria-label)
  if (O.peers.length !== N.peers.length) fail('막대 줄 수(옛 쪽)', tag + ' ' + N.peers.length + ' ≠ ' + O.peers.length);
  O.peers.forEach(([n, v, me, w], k) => { const g = N.peers[k]; if (!g) return; if (g.n !== n || g.v !== v || g.me !== me || Math.abs(parseFloat(g.w) - parseFloat(w)) > 0.01) fail('막대 줄(옛 쪽)', tag + ' ' + JSON.stringify([g.n, g.v, g.me, g.w]) + ' ≠ ' + JSON.stringify([n, v, me, w])); });
  if (O.peers.length && N.peersLabel !== O.peersLabel) fail('막대 화면 읽기 이름', tag + ' ' + N.peersLabel + ' ≠ ' + O.peersLabel);
  if (!N.extRel) fail('바깥 고리 noopener', tag);
  if (!N.safe.some(x => SAFE_HAS.every(w => x.includes(w)))) fail('안전 문장', tag + ' ' + JSON.stringify(N.safe));
  { const own = norm(N.own); const bad = BANNED.filter(w => own.includes(w)); if (bad.length) fail('쓰지 않을 말', tag + ' ' + bad.join(' · ')); }
  // ② 자료에서 따로 셈
  if (miss) {
    const r = NAMES.get(code);
    const wantH1 = r ? `${r.n} — 지금 ${PN} 밖` : '없는 주소입니다';
    if (norm(N.h1) !== norm(wantH1)) fail('없는 번호 제목', tag + ' ' + N.h1 + ' ≠ ' + wantH1);
    if (r && !ALLN.includes(norm(r.w))) fail('없는 번호 까닭', tag);
    if (N.peers.length || N.head != null) fail('없는 번호에 막대', tag);
    bump('없는 번호');
  } else {
    const co = await coOf(code), G = co?.grow, I = G?.ind, S = G?.story, pk = !!PK[code], name = pk ? PK[code].name : co?.c?.name;
    if (!G || !I) { fail('자료 없음', tag); continue; }
    if (N.h1 !== name + ' — 누구와 다투나?') fail('큰 제목(자료)', tag + ' ' + N.h1);
    const all = core.funnel.companies ?? core.funnel.universe;
    const wantHead = `우리나라 상장 회사 ${all.toLocaleString('ko-KR')}곳 안 「${I.name}」 ${I.n}곳 가운데 매출 ${I.rank ?? '?'}번째`;
    if (norm(N.head) !== wantHead) fail('막대 머리 글', tag + ' 「' + N.head + '」 ≠ 「' + wantHead + '」');
    const top = G.top || [], rows = top.map(([n, v, c]) => ({n, v, me: c === code, c}));
    if (!top.some(t => t[2] === code) && I.me != null) rows.push({n: `${name}(${I.rank ?? '?'}번째)`, v: I.me, me: true, c: code});
    const mx = Math.max(1, ...rows.map(r => r.v || 0));
    if (N.peers.length !== rows.length) fail('막대 줄 수', tag + ' ' + N.peers.length + ' ≠ ' + rows.length);
    rows.forEach((r, k) => { const g = N.peers[k]; if (!g) return;
      if (g.n !== r.n) fail('막대 이름', tag + ' ' + g.n + ' ≠ ' + r.n);
      if (g.v !== EOK(r.v)) fail('막대 값', tag + ' ' + r.n + ' ' + g.v + ' ≠ ' + EOK(r.v));
      if (Math.abs(parseFloat(g.w) - Math.max(2, (r.v || 0) / mx * 100)) > 0.01) fail('막대 넓이', tag + ' ' + r.n + ' ' + g.w);
      if (g.me !== r.me || g.meBar !== r.me) fail('이 회사 줄', tag + ' ' + r.n);
      const wantHref = !r.me && r.c && CO[r.c] ? '#/w/' + encodeURIComponent(r.c) + '/rivals' : null;
      if (g.href !== wantHref) fail('막대 고리', tag + ' ' + r.n + ' ' + g.href + ' ≠ ' + wantHref); });
    if (!rows.length && !N.q0) fail('막대 없음 「?」', tag);
    bump('막대 줄', rows.length);
    const share = I.share != null ? R1(I.share).toFixed(1) + '%' : '?';
    const wantNote = `${I.size === 'net' ? '매출이 없는 업종이라 순이익으로 셉니다 · ' : ''}이 회사 = 이 ${I.n}곳 매출 합의 ${share}(시장 점유율이 아님) · 매출이 절반 ~ 두 배인 비슷한 크기 ${I.near ?? '?'}곳 · 후보 밖 · 업종이 다르게 묶인 회사 · 나라 밖 경쟁 회사는 이 막대에 없습니다(아래 이름에만).`;
    if (norm(N.note) !== wantNote) fail('막대 밑 글', tag + ' 「' + N.note + '」');
    if (S) {
      if (N.shape !== S.shape) fail('판의 모양', tag + ' ' + N.shape + ' ≠ ' + S.shape);
      if (N.shpN !== 4 || JSON.stringify(N.shpOn) !== JSON.stringify(SHAPES.includes(S.shape) ? [S.shape] : [])) fail('판의 모양 그림', tag + ' ' + JSON.stringify(N.shpOn));
      const nr = S.rivals?.length ?? 0;
      if (N.rv !== nr) fail('경쟁 회사 수', tag + ' ' + N.rv + ' ≠ ' + nr);
      if (nr && N.h3 !== `경쟁 회사 ${nr}곳`) fail('경쟁 회사 머리', tag + ' ' + N.h3);
      const wantExt = (S.rivals || []).map(r => r.url || (r.chk?.v === '기사로 확인' && r.chk.url ? r.chk.url : null)).filter(Boolean);
      if (JSON.stringify(N.ext) !== JSON.stringify(wantExt)) fail('기사 고리(자료)', tag + ' ' + N.ext.length + ' ≠ ' + wantExt.length);
      if ((S.sells || S.why) && N.details !== 1) fail('접은 칸', tag + ' ' + N.details);
      bump('경쟁 회사', nr);
    } else {
      const want = pk ? '? 세 팀 이야기는 아직 없습니다' : '? 세 팀 이야기는 조사 전입니다';
      if (!ALLN.includes(want)) fail('이야기 없음 글', tag);
      if (N.rv || N.shpN) fail('이야기 없는데 경쟁 회사 · 판 그림', tag);
    }
    const ch = N.chaps;
    if (ch.length !== 7 || ch.filter(x => x[1]).map(x => x[0]).join() !== '5') fail('챕터 일곱', tag + ' ' + JSON.stringify(ch));
    if (N.next !== '#/w/' + encodeURIComponent(code) + '/grow') fail('다음 챕터', tag + ' ' + N.next);
    if (!N.title.startsWith(name)) fail('창 이름', tag + ' ' + N.title);
    bump('회사');
  }
  if (pn._errs.length) { fail('화면 오류', '새 쪽 ' + tag + ' ' + pn._errs.join(' | ').slice(0, 200)); pn._errs.length = 0; }
  if (po._errs.length) { bump('옛 쪽 화면 오류(참고 · 없는 번호의 회사 파일 404 등)'); po._errs.length = 0; } // 옛 쪽 오류는 이 검사의 실패가 아님(옛 쪽은 고치지 않음)
}
await po.context().close(); await pn.context().close();
counts.sec.compare = Math.round((Date.now() - t0) / 1000) - counts.sec.pick;

/* ③ 세 폭 — 까다로운 곳부터 N곳(긴 이름 · 경쟁 회사 많음 · 순이익 · 막대 없음) + 없는 번호 하나 · 접은 칸을 연 채로 */
if (NW > 0) {
  const pickW = [...list.slice(0, Math.max(0, NW - 1)), MISSING[0]].filter(Boolean);
  const layout = (vw) => {
    const v = document.querySelector('#view'), out = {sw: document.documentElement.scrollWidth, cw: document.documentElement.clientWidth, outEl: [], small: [], taps: []};
    for (const d of v.querySelectorAll('details')) d.open = true;
    const vis = el => { const cs = getComputedStyle(el); if (cs.display === 'none' || cs.visibility === 'hidden') return false; const r = el.getBoundingClientRect(); return r.width > 0 && r.height > 0; };
    for (const el of v.querySelectorAll('*')) { if (!vis(el) || el.closest('svg') || el.closest('.chaps.row')) continue; /* 챕터 줄은 옆으로 미는 칸 — 밀려 가려진 칩은 넘침이 아님(2026-10-17 챕터 한 줄) */ const r = el.getBoundingClientRect(); if (r.right > vw + 0.5 || r.left < -0.5) out.outEl.push((el.className?.baseVal ?? el.className) + ' ' + Math.round(r.left) + '~' + Math.round(r.right)); }
    const tw = document.createTreeWalker(v, NodeFilter.SHOW_TEXT);
    for (let n = tw.nextNode(); n; n = tw.nextNode()) { const pe = n.parentElement; if (!n.textContent.trim() || !pe || pe.closest('svg, [aria-hidden="true"]') || !vis(pe)) continue; const fsz = parseFloat(getComputedStyle(pe).fontSize); if (fsz < 16.95) out.small.push(n.textContent.trim().slice(0, 16) + ' ' + fsz + 'px'); }
    for (const a of v.querySelectorAll('a[href], button, summary')) { if (!vis(a)) continue; const r = a.getBoundingClientRect(); if (r.height < 43.5 || r.width < 43.5) out.taps.push((a.textContent || a.getAttribute('aria-label') || '').trim().slice(0, 20) + ' ' + Math.round(r.width) + '×' + Math.round(r.height)); }
    return out;
  };
  for (const w of [320, 360, 390]) {
    const p = await page(w, 640);
    await p.goto(base + '/next/?dev=1#/find'); await p.waitForFunction(() => document.querySelector('#view .find input'), null, {timeout: 30000}).catch(() => fail('새 쪽 찾기 화면', w + ' 안 열림')); await p.waitForTimeout(150); p._errs.length = 0;
    for (const code of pickW) {
      if (!await open(p, '#/w/' + code + '/rivals', NEW_DONE, w + ' 새 쪽')) continue;
      const L = await p.evaluate(layout, w);
      if (L.sw > L.cw) fail('가로 넘침', w + ' ' + code + ' ' + L.sw + '>' + L.cw);
      for (const x of L.outEl.slice(0, 3)) fail('칸 밖으로 나감', w + ' ' + code + ' ' + x);
      for (const x of L.small.slice(0, 3)) fail('글씨 17px 안 됨', w + ' ' + code + ' ' + x);
      for (const x of L.taps.slice(0, 3)) fail('누르는 자리 44px 안 됨', w + ' ' + code + ' ' + x);
      if (p._errs.length) { fail('화면 오류', w + ' ' + code + ' ' + p._errs.join(' | ').slice(0, 200)); p._errs.length = 0; }
      bump('세 폭 화면');
    }
    await p.context().close();
  }
}
/* ④ 못 받은 파일(빈 날 길) — 회사 파일 · 고른 곳 자료 · 이름표 · 바탕 자료를 막고 열어 봄: 멈추지 않고 「?」 줄 · 화면 오류 0(막은 파일 받기 실패 줄은 뺌) */
{
  const pkc = Object.keys(PK).sort()[0], out = allCodes.find(c => !PK[c]), miss = MISSING.find(c => NAMES.has(c));
  const cases = [['회사 파일 못 받음(고른 곳)', 'co/' + pkc + '.json', pkc, x => x.h1 === PK[pkc].name + ' — 누구와 다투나?' && x.q.some(t => t.startsWith('? 회사 자료를 받지 못했어요')) && x.next != null],
    ['회사 파일 못 받음(고른 곳 밖)', 'co/' + out + '.json', out, x => x.h1 === CO[out].n + ' — 누구와 다투나?' && x.q.some(t => t.startsWith('? 회사 자료를 받지 못했어요')) && x.next != null],
    ['고른 곳 자료 못 받음(고른 곳)', 'comp.json', pkc, x => x.h1 === PK[pkc].name + ' — 누구와 다투나?' && x.peers > 0 && x.next != null],
    ['고른 곳 자료 못 받음(고른 곳 밖)', 'comp.json', out, x => x.h1 === CO[out].n + ' — 누구와 다투나?' && x.peers > 0],
    ...(miss ? [['이름표 못 받음(없는 번호)', 'names.json', miss, x => x.h1 === '없는 주소입니다' && x.say.includes(miss)]] : []),
    ['바탕 자료 못 받음', 'core.json', pkc, x => x.q.some(t => t.startsWith('? 자료를 받지 못했어요'))]];
  for (const [what, file, code, ok] of cases) {
    const ctx = await b.newContext({viewport: {width: 360, height: 640}, deviceScaleFactor: 1}), p = await ctx.newPage(), errs = [];
    p.on('pageerror', e => errs.push(e.message)); p.on('console', m => { if (m.type() === 'error' && !/Failed to load resource/.test(m.text())) errs.push(m.text()); });
    await ctx.route(u => u.pathname === '/atlas/data/' + file, r => r.abort());
    await p.goto(base + '/next/?dev=1#/w/' + code + '/rivals');
    const done = await p.waitForFunction(() => document.querySelector('#view')?.childElementCount && !document.querySelector('#view .boot'), null, {timeout: 20000}).then(() => true).catch(() => false);
    const x = done ? await p.evaluate(() => ({h1: document.querySelector('#view h1')?.textContent ?? null, q: [...document.querySelectorAll('#view .empty, #view .privals-q')].map(e => e.textContent), peers: document.querySelectorAll('#view .privals-peers li').length,
      next: document.querySelector('#view .chap-next')?.getAttribute('href') ?? null, say: document.querySelector('#view .privals-say')?.textContent ?? '', sw: document.documentElement.scrollWidth, cw: document.documentElement.clientWidth})) : null;
    if (!x) fail('못 받은 파일 — 멈춤', what);
    else { if (!ok(x)) fail('못 받은 파일', what + ' ' + JSON.stringify(x).slice(0, 200)); if (x.sw > x.cw) fail('가로 넘침', what); }
    if (errs.length) fail('화면 오류', what + ' ' + errs.join(' | ').slice(0, 200));
    bump('못 받은 파일 길');
    await ctx.close();
  }
}
await b.close();
const res = {schema: 'atlas11-next-rivals-1', at: new Date().toISOString(), base, asOf: mkt.asOf, companies: list.length, missing: MISSING.length, all: ALL, limit: LIMIT || null, seconds: Math.round((Date.now() - t0) / 1000), counts, fails, ok: !fails.length};
if (OUT) { await fs.mkdir(path.dirname(path.resolve(OUT)), {recursive: true}); await fs.writeFile(path.resolve(OUT), JSON.stringify(res, null, 1) + '\n'); }
console.log(JSON.stringify({ok: res.ok, seconds: res.seconds, companies: res.companies, missing: res.missing, counts, fails: fails.slice(0, 15)}, null, 0));
process.exit(res.ok ? 0 : 1);
