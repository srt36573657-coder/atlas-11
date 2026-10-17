// 새 아틀란스 시험판(/next/ · 규칙 74) 빠짐없이 도는 검사 — 사장님 2026-10-17 02:38 「정교하게 만들어라」
//   쓰는 법: node scripts/atlas11/next/next_check.mjs --base http://127.0.0.1:8826 [--pw /opt/node-tools/] [--out reports/atlas11/verify/next-check-latest.json] [--limit N]
//   ① 세 폭(320 · 360 · 390)에서 화면 열여섯 — 오류 0 · 가로 넘침 0 · 「여는 중」 남음 0 · 누르는 자리 44px 넘게 · 쓰지 않을 말 0
//   ② 모든 회사 보는 화면 — 이름 · 20거래일 % · 하루 % 를 이 검사가 자료에서 따로 셈한 값과 맞댐 · 챕터 일곱 고리 · 다음 볼 것
//   ③ 모든 업종 · 갈래 채널 — 회사 수 · 한 회사 한 표 · 큰 회사는 크게 · 처음 칸 수
//   ④ 쇼츠 사실 — 오른 곳 · 내린 곳 수 · 1주 1등 업종 · 가장 센 · 약한 갈래 · 가장 많이 오른 회사(하루 30% 튐 · 빈 날 · 사흘 그대로 뺌) · 급등 1등 · 고른 곳 오름 수 · 미국 · 지수
//   ⑤ 찾기 — 모든 회사 이름이 첫 줄에 나옴 · 번호 찾기 · 없는 말
//   ⑥ 누르기 — 구독 → 구독 칸 · 담기 → 나 칸 · 선 끌기 → 그날 값 · 짧게 누르면 처음으로 · 지우기
//   ⑦ 고리 — 모든 화면의 href 가 아는 길(#/… · /#/g · /#/i · /#/c/<번호>/… · /letter.html · /)이고 가리키는 것이 자료에 있음
//   ⑧ 옛 이름 없음(2026-10-17 15:48 「아틀란스에서 보드리로 모두 변경해」) — 모든 길(세 폭 길 · 모든 회사 · 업종 · 갈래 · 달력 종목 · 쇼츠 · 구독 · 나)의 보이는 글 · 창 제목 ·
//      aria-label · alt · title 에 아틀란스 · ATLAS · 아틀라스 가 없음(남의 글 [data-proper] · 원문 [lang="ko"] · 자료의 회사 이름 빼고) → 「옛 이름 남음」 · 창 제목 끝 「 · 보드리」
//   실패가 하나라도 있으면 끝 코드 1 · 결과 파일에 실패 목록
import fs from 'node:fs/promises';
import path from 'node:path';
import {createRequire} from 'node:module';
import {fileURLToPath} from 'node:url';
import {nameScan, oldNamesIn, allowFromData, selfTest as renameSelfTest, LETTER_TITLE, TITLE_TAIL, OLD_NAME_FAIL, OLD_NAME_RE} from './rename.mjs';
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../..');
const arg = (k, d) => { const i = process.argv.indexOf(k); return i > 0 ? process.argv[i + 1] : d; };
const require = createRequire(arg('--pw', '/opt/node-tools/'));
const {chromium} = require('playwright');
const base = arg('--base', 'http://127.0.0.1:8826').replace(/\/$/, ''), out = path.resolve(ROOT, arg('--out', 'reports/atlas11/verify/next-check-latest.json'));
const LIMIT = Number(arg('--limit', '0')) || 0;
const fails = [], counts = {}, t0 = Date.now();
const fail = (k, x) => { if (fails.length < 400) fails.push([k, x]); counts.fail = (counts.fail || 0) + 1; };
const bump = k => { counts[k] = (counts[k] || 0) + 1; };

/* 따로 셈 — 앱 코드를 쓰지 않음(같은 규칙: 반올림은 크기로 · 100% 넘으면 소수 없음) */
function P(x) {
  if (x == null || !Number.isFinite(x)) return '?';
  const r = Math.floor(Math.abs(x) * 10 + 0.5 + 1e-7) / 10;
  if (r === 0) return '0.0%';
  return (x > 0 ? '+' : '−') + (r >= 100 ? Math.floor(r + 0.5 + 1e-7).toLocaleString('ko-KR') : r.toFixed(1)) + '%';
}
const P2 = v => (v == null || !Number.isFinite(v) ? '?' : (v > 0 ? '+' : v < 0 ? '−' : '') + Math.abs(v).toFixed(2) + '%'); // 지수 · 미국 하루 = 둘째 자리 그대로(두 번 반올림 막기)
const MD = d => (+d.slice(5, 7)) + '월 ' + (+d.slice(8, 10)) + '일';
const N = n => Number(n).toLocaleString('ko-KR');
const getJ = async f => { const r = await fetch(base + '/atlas/data/' + f, {cache: 'no-store'}); if (!r.ok) throw Error(f + ' ' + r.status); return r.json(); };
const [core, mkt, home, surge, cond] = await Promise.all(['core.json', 'mkt.json', 'home.json', 'surge.json', 'cond.json'].map(f => getJ(f).catch(e => { fail('자료', e.message); return null; })));
if (!core || !mkt) { console.error('자료를 못 받음'); process.exit(1); }
const CO = mkt.companies, codes = Object.keys(CO);
const ind = new Map(core.industries.map(i => [i.name, i])), grp = new Map(core.groups.map(g => [g.id, g]));
// 끝 값이 없거나 0 이면(거래 멈춤 · 빈 날) 모름 = 「?」 — 2026-10-17 실제 사이트 탐침에서 005110 · 033340 을 −100% 로 잘못 기대한 것을 고침
const lineChg = l => (l?.[0] > 0 && l[l.length - 1] > 0) ? (l[l.length - 1] / l[0] - 1) * 100 : null, lineDay = l => (l?.length > 1 && l[l.length - 2] > 0 && l[l.length - 1] > 0) ? (l[l.length - 1] / l[l.length - 2] - 1) * 100 : null;
const c20 = o => Number.isFinite(o.c) ? o.c : lineChg(o.l);
const weird = l => { if (!Array.isArray(l) || l.length < 3) return true; for (const v of l) if (!(v > 0)) return true; for (let i = 1; i < l.length; i++) if (Math.abs(l[i] / l[i - 1] - 1) >= 0.3) return true; const n = l.length; return l[n - 1] === l[n - 2] && l[n - 2] === l[n - 3]; };
// 쓰지 않을 말(규칙 72 ⑥) + 지운 36곳 화면 글(inspect4.mjs OLD36_TEXT 를 읽어 그대로 — 「36곳 내림」 같은 셈 글은 아님)
const OLD36 = JSON.parse((/export const OLD36_TEXT = (\[[^\]]*\]);/.exec(await fs.readFile(path.join(ROOT, 'scripts/atlas11/t365/inspect4.mjs'), 'utf8')) || [, '[]'])[1].replace(/'/g, '"'));
if (!OLD36.length) { console.error('OLD36_TEXT 를 못 읽음'); process.exit(1); }
const BANNED = ['추천', '매수', '매도', '팔라', '사세요', '파세요', '예측', '확률', '유망', '기회', '신호', '저평가', '1위', 'TOP', ...OLD36];
// 새 화면으로 옮긴 쪽(app.js READY) — 옮긴 쪽은 새 주소(#/…), 아직이면 지금 아틀란스(/atlas/#/…)를 기대함(2026-10-17 04:23 「에이전트 총 동원해」)
const READY = new Set(((/const READY = new Set\(\[([^\]]*)\]\);/.exec(await fs.readFile(path.join(ROOT, 'site/next/app.js'), 'utf8')) || [, ''])[1].match(/'([a-z]+)'/g) || []).map(x => x.slice(1, -1)));
const oldOr = (k, h) => (READY.has(k) ? h : '/atlas/' + h);
// ⑧ 옛 이름 — 자료의 실제 이름(회사 「아틀라스링크」 등)은 옛 이름이 아님 · 검사 자체 시험(바꾸는 말 표 · 찾기가 틀림을 잡는지)
const names = await getJ('names.json').catch(e => { fail('자료', e.message); return null; });
const ALLOW = allowFromData({mkt, names, extra: [...(core.industries || []).map(i => i.name), ...(core.groups || []).map(g => g.name), ...(home?.us?.rows || []).map(r => r.name)]});
for (const x of renameSelfTest()) fail('검사 자체 시험(옛 이름)', x);
const guarded = new Set();
/** 지금 화면에 옛 이름이 남았나 · 창 제목 끝 = 「 · 보드리」(쪽마다 한 번) */
async function guard(p, where) {
  const s = await p.evaluate(nameScan);
  for (const x of oldNamesIn(s, ALLOW).slice(0, 6)) fail(OLD_NAME_FAIL, where + ' ' + x);
  if (!s.title.endsWith(TITLE_TAIL)) fail('창 제목 끝', where + ' 「' + s.title + '」');
  guarded.add(where); bump('옛 이름 본 화면');
}

const exe = '/opt/pw-browsers/chromium', b = await chromium.launch((await fs.stat(exe).catch(() => null)) ? {executablePath: exe} : {}); // 이 방은 미리 깔린 크로미움 · 깃허브 실행기는 playwright 가 깐 것
async function page(width, height = 800) {
  const ctx = await b.newContext({viewport: {width, height}, deviceScaleFactor: 1, hasTouch: true});
  const p = await ctx.newPage(); p._errs = [];
  p.on('pageerror', e => p._errs.push(e.message)); p.on('console', m => { if (m.type() === 'error') p._errs.push(m.text()); });
  return p;
}
async function go(p, hash, wait = s => true) {
  await p.evaluate(h => { location.hash = h; }, hash);
  await p.waitForFunction(() => !document.querySelector('#view .boot'), null, {timeout: 20000}).catch(() => fail('여는 중 남음', hash));
}
const scan = p => p.evaluate(() => {
  const vw = document.documentElement.clientWidth, view = document.querySelector('#view');
  const small = [];
  for (const e of document.querySelectorAll('#view a, #view button, .tabs a, .top a, .trial a')) {
    const r = e.getBoundingClientRect(); if (!r.width || !r.height) continue;
    if (getComputedStyle(e).visibility === 'hidden' || e.closest('[hidden]')) continue;
    if (r.height < 43.5 || r.width < 43.5) small.push((e.textContent || e.getAttribute('aria-label') || e.className).trim().slice(0, 30) + ' ' + Math.round(r.width) + '×' + Math.round(r.height));
  }
  const cl = view?.cloneNode(true); cl?.querySelectorAll('[data-proper], [lang="ko"]').forEach(e => e.remove()); // 이름 · 남의 글(원문)은 쓰지 않을 말 셈에서 뺌 — 「코스피 양매도 ETN」 같은 상품 이름
  return {sw: document.documentElement.scrollWidth, vw, text: cl?.textContent ?? '', hrefs: [...document.querySelectorAll('#view a[href]')].map(a => a.getAttribute('href')), small: small.slice(0, 8), title: document.title};
});
const knownHref = h => {
  if (h === '/' || h === '/letter.html' || h === '/hello.html' || h === '/us/') return true; // /us/ = 미국 판(규칙 54 그대로)
  if (/^https:\/\/[a-z0-9.-]+\.[a-z]{2,}(\/|$)/i.test(h)) return true; // 바깥 출처 고리(유튜브 · 기사 · 네이버 증권 · 공시) — 쪽 검사가 자료와 맞대 봄
  let mm = /^#\/(surge(?:\/(?:10|20|30|40))?|cal|cond(?:\/[a-z0-9]+-[a-z0-9]+-[a-z0-9]+)?|talk|up|time|info|today)$/.exec(h); if (mm) return READY.has(mm[1].split('/')[0]);
  if ((mm = /^#\/cal\/([0-9A-Z]{6})$/.exec(h))) return READY.has('cal'); // 종목 파일 — check_cal 이 자료와 맞대 봄
  if ((mm = /^#\/w\/([0-9A-Z]{6})\/(past|rivals|grow|range)$/.exec(h))) return READY.has(mm[2]) && !!CO[mm[1]];
  if ((mm = /^#\/x\/(.+)$/.exec(h))) return READY.has('x');
  let m = /^#\/(?:f\/(rise|surge|lead|pick|group|ind|us)|shorts(?:\/\d+)?|sub|me|find(?:\/.*)?)?$/.exec(h); if (m) return true;
  if ((m = /^\/atlas\/(#\/.*)$/.exec(h))) h = '/' + m[1]; // 아직 지금 아틀란스에서 여는 쪽(/atlas/#/…) — 아래 같은 잣대로
  if ((m = /^#\/w\/(.+)$/.exec(h))) return m[1] === 'KOSPI' || m[1] === 'KOSDAQ' || !!CO[m[1]];
  if ((m = /^#\/ch\/([ig])\/(.+)$/.exec(h))) { const v = decodeURIComponent(m[2]); return m[1] === 'i' ? ind.has(v) : grp.has(v); }
  if ((m = /^\/#\/g\/(.+)$/.exec(h))) return grp.has(decodeURIComponent(m[1]));
  if ((m = /^\/#\/i\/(.+)$/.exec(h))) return ind.has(decodeURIComponent(m[1]));
  if ((m = /^\/#\/c\/([0-9A-Z]{6})(\/(past|rivals|grow|range))?$/.exec(h))) return !!CO[m[1]];
  if ((m = /^\/#\/x\/([0-9A-Z]{6})$/.exec(h))) return true; // 밖 칸(펀드 · 우선주 …) — 지금 아틀란스
  return /^\/#\/(surge|cal|cond|talk|find|time|up|info|today)$/.test(h);
};
function checkScan(where, s, p) {
  if (s.sw > s.vw) fail('가로 넘침', where + ' ' + s.sw + '>' + s.vw);
  const T = s.text.replace(/공매도/g, ''); // 「공매도」(빌려 판 주식 — 급등 쪽 「?」 줄의 사실 말)는 권하는 말이 아님
  for (const w of BANNED) if (T.includes(w)) fail('쓰지 않을 말', where + ' 「' + w + '」');
  for (const x of s.small) fail('누르는 자리 44px 안 됨', where + ' ' + x);
  for (const hr of s.hrefs) { bump('고리'); if (!knownHref(hr)) fail('모르는 고리', where + ' ' + hr); }
  if (p._errs.length) { fail('화면 오류', where + ' ' + p._errs.join(' | ').slice(0, 200)); p._errs.length = 0; }
}

/* ① 세 폭 */
const firstCo = codes[0], g0 = core.groups[0].id, i0 = core.industries[0].name, g0id = () => g0;
const ROUTES = ['#/', '#/f/rise', '#/f/surge', '#/f/lead', '#/f/pick', '#/f/group', '#/f/ind', '#/f/us', '#/shorts', '#/sub', '#/me', '#/find', '#/find/삼성', '#/w/KOSPI', '#/w/KOSDAQ', '#/w/' + firstCo, '#/ch/g/' + g0, '#/ch/i/' + encodeURIComponent(i0)];
const MODR = {surge: ['#/surge', '#/surge/10', '#/surge/20', '#/surge/30', '#/surge/40'], cal: ['#/cal'], cond: ['#/cond'], talk: ['#/talk'], up: ['#/up'], time: ['#/time'], info: ['#/info'], today: ['#/today'], x: ['#/x/005935'], past: ['#/w/005930/past', '#/w/' + firstCo + '/past'], rivals: ['#/w/005930/rivals'], grow: ['#/w/005930/grow', '#/w/' + firstCo + '/grow'], range: ['#/w/005930/range', '#/w/' + firstCo + '/range']};
for (const [k, rs] of Object.entries(MODR)) if (READY.has(k)) ROUTES.push(...rs); // 옮긴 쪽도 세 폭 · 쓰지 않을 말 · 44px · 고리
for (const w of [320, 360, 390]) {
  const p = await page(w); await p.goto(base + '/next/#/'); await p.waitForFunction(() => !document.querySelector('#view .boot'), null, {timeout: 20000});
  for (const r of ROUTES) { await go(p, r); await p.waitForTimeout(80); checkScan(w + ' ' + r, await scan(p), p); if (w === 390) await guard(p, r); bump('화면'); }
  if (w === 390) { // ⑧ 옛 이름 — 세 폭 길에 없는 쪽도(달력 종목 파일 · 조건 고른 주소 · 쇼츠 한 장 · 없는 주소)
    const tr = await getJ('surgetr.json').catch(() => null), c0 = tr?.cases?.[0]?.[0];
    for (const r of [...(READY.has('cal') && c0 ? ['#/cal/' + c0] : []), ...(READY.has('cond') ? ['#/cond/all-all-all'] : []), '#/shorts/1', '#/w/ZZZZZZ', '#/ch/i/' + encodeURIComponent('없는 업종')]) { await go(p, r); await p.waitForTimeout(80); await guard(p, r); }
  }
  await p.context().close();
}

/* ①-1 아주 큰 글씨(지금 아틀란스와 같은 세 칸 · 기억 atlas:font 2 · 화면 칸 zoom) — 320 폭에서 넘침 0 */
{
  const ctx = await b.newContext({viewport: {width: 320, height: 700}, deviceScaleFactor: 1, hasTouch: true});
  await ctx.addInitScript(() => { try { localStorage.setItem('atlas:font', '2'); } catch { /* 없음 */ } });
  const p = await ctx.newPage(); p._errs = []; p.on('pageerror', e => p._errs.push(e.message));
  await p.goto(base + '/next/#/'); await p.waitForFunction(() => !document.querySelector('#view .boot'), null, {timeout: 20000});
  if (!(await p.evaluate(() => document.documentElement.classList.contains('f3')))) fail('큰 글씨 기억', 'atlas:font 2 인데 html.f3 아님');
  for (const r of ROUTES) { await go(p, r); await p.waitForTimeout(80); const sc = await scan(p); if (sc.sw > sc.vw) fail('큰 글씨 넘침', '320 아주 크게 ' + r + ' ' + sc.sw + '>' + sc.vw); bump('큰 글씨 화면'); }
  if (p._errs.length) fail('화면 오류', '큰 글씨 ' + p._errs.join(' | ').slice(0, 200));
  await ctx.close();
}
/* ①-2 첫 화면 붙박이(지금 화면 site/next/app.js 의 HELLO_MSG · HELLO_PROMO 와 글자 그대로 — 2026-10-17 15:54 「예전 아트란스는 … 현재 것만」: 옛 atlas.js 는 더 이상 기준이 아님) · 옛 주소 */
{
  const src = await fs.readFile(path.join(ROOT, 'site/next/app.js'), 'utf8');
  const MSG = JSON.parse((/const HELLO_MSG = (\[[^\]]*\]);/.exec(src) || [, 'null'])[1].replace(/'/g, '"')), PROMO = (/const HELLO_PROMO = '([^']*)';/.exec(src) || [])[1];
  if (!Array.isArray(MSG) || MSG.length < 2 || !PROMO) fail('편지 글을 site/next/app.js 에서 못 읽음', '');
  if (MSG?.[0] !== LETTER_TITLE) fail('편지 첫 줄', `「${MSG?.[0]}」 ≠ 「${LETTER_TITLE}」`);
  for (const t of [...(MSG || []), PROMO]) if (OLD_NAME_RE.test(t ?? '')) fail(OLD_NAME_FAIL, '편지 · 상품권 줄 「' + t + '」');
  const q = await page(390, 844); await q.goto(base + '/next/#/');
  await q.waitForSelector('#view .m4-letter', {timeout: 20000});
  const g0 = await q.evaluate(() => ({intro: document.querySelector('#view .m4-letter')?.classList.contains('intro'), bub: [...document.querySelectorAll('#view .hpi-b')].map(b => b.textContent)}));
  if (!g0.intro || g0.bub.join(',') !== '고도리!,고도리!,고도리!') fail('열면 고도리', JSON.stringify(g0));
  await q.waitForFunction(() => document.querySelector('#view .m4-letter')?.classList.contains('landed'), null, {timeout: 9000}).catch(() => fail('고도리 내려앉음', '9초 안에 안 끝남'));
  const g = await q.evaluate(() => ({lines: [...document.querySelectorAll('#view .m4-msg .hml')].map(e => e.textContent), promo: document.querySelector('#view .m4-gift')?.textContent ?? '', act: document.querySelector('#view .m4-aw')?.textContent ?? '',
    href: document.querySelector('#view a.m4-letter')?.getAttribute('href'), tk: document.querySelector('#view a.tk-entry')?.getAttribute('href'), today: document.querySelectorAll('#view .today .tl').length,
    mr: document.querySelector('#view a.m4-mr')?.getAttribute('href') ?? null, seal: !!document.querySelector('#view .m4-seal-box'), al: [...document.querySelectorAll('#view .m4-al')].map(e => e.textContent), first: document.querySelector('#view > *')?.className ?? ''}));
  if (JSON.stringify(g.lines) !== JSON.stringify(MSG)) fail('사장님 편지 글자', JSON.stringify(g.lines).slice(0, 200));
  if (g.promo !== PROMO) fail('상품권 줄', g.promo + ' ≠ ' + PROMO);
  if (g.act !== '친구에게 소개하기고도리 1분 영상 · 보내기') fail('친구 소개 줄', g.act);
  if (g.href !== '/hello.html') fail('편지 고리', String(g.href));
  if (g.tk !== oldOr('talk', '#/talk') || !g.first.includes('tk-entry')) fail('이야기 입구', g.tk + ' ' + g.first);
  if (home?.idx?.KOSPI && g.today !== 2) fail('오늘 한 줄', String(g.today));
  if (core.time?.opens?.[0]?.date && g.mr !== oldOr('time', '#/time')) fail('봉인 줄', String(g.mr));
  if (!g.seal) fail('고도리 약속', '');
  const wantAl = ['big', 'usual'].filter(w => (home?.alerts ?? []).some(a => a.kind === 'idx' && (a.why ?? 'usual') === w)).length;
  if (g.al.length !== wantAl) fail('큰 날 「!」', g.al.length + ' ≠ ' + wantAl);
  // 옛 주소 — 새 화면으로 · 아직 안 옮긴 쪽은 /atlas/
  for (const [from, want] of [['#/c/005930', '#/w/005930'], ['#/g/' + g0id(), '#/ch/g/' + g0id()], ['#/list', '#/f/ind'], ['#/36', '#/']]) {
    await q.evaluate(hh => { location.hash = hh; }, from); await q.waitForTimeout(250);
    const got = await q.evaluate(() => location.hash); if (got !== want) fail('옛 주소', from + ' → ' + got + ' ≠ ' + want);
  }
  if (READY.has('surge')) { await q.evaluate(() => { location.hash = '#/surge'; }); await q.waitForTimeout(400); if (!/\/next\/#\/surge$/.test(q.url())) fail('옮긴 쪽 주소', '#/surge → ' + q.url()); }
  else { await q.evaluate(() => { location.hash = '#/surge'; }); await q.waitForURL(/\/atlas\/#\/surge$/, {timeout: 15000}).catch(() => fail('옛 주소', '#/surge → /atlas/#/surge 아님 ' + q.url())); }
  for (const k of ['past', 'rivals', 'grow', 'range'].filter(k => READY.has(k))) { await q.goto(base + '/next/#/c/005930/' + k); await q.waitForTimeout(500); if (!q.url().endsWith('#/w/005930/' + k)) fail('옛 7단 주소', k + ' → ' + q.url()); }
  bump('첫 화면 붙박이');
  await q.context().close();
}
/* ② 모든 회사 보는 화면 · ③ 채널 · ④ 쇼츠 · ⑤ 찾기 · ⑥ 누르기 — 390 폭 */
const p = await page(390, 844);
await p.goto(base + '/next/#/'); await p.waitForFunction(() => !document.querySelector('#view .boot'), null, {timeout: 20000});
const list = LIMIT ? codes.slice(0, LIMIT) : codes;
for (const code of list) {
  const o = CO[code];
  await go(p, '#/w/' + code);
  await p.waitForFunction(n => document.querySelector('#view .wt')?.textContent === n, o.n, {timeout: 8000}).catch(() => fail('보는 화면 이름', code));
  const g = await p.evaluate(() => ({ws: document.querySelector('#view .ws')?.textContent ?? '', ch: [...document.querySelectorAll('#view .chaps a.cp')].map(a => a.getAttribute('href')), chq: document.querySelectorAll('#view .chaps span.cp').length,
    nx: document.querySelectorAll('#view .nx').length, chan: document.querySelector('#view .chan b')?.textContent ?? '', sw: document.documentElement.scrollWidth, vw: document.documentElement.clientWidth, tip: document.querySelector('#view .player .tip')?.textContent ?? ''}));
  const want20 = P(c20(o)), wantDay = P(lineDay(o.l));
  if (!g.ws.includes('20거래일 동안 ' + want20)) fail('20거래일 %', code + ' 「' + g.ws + '」 ≠ ' + want20);
  if (!g.ws.includes('하루 ' + wantDay)) fail('하루 %', code + ' 「' + g.ws + '」 ≠ ' + wantDay);
  if (!g.ws.includes(MD(mkt.asOf) + ' 마감')) fail('마감 날', code);
  const I = ind.get(o.i), G = I ? grp.get(I.g) : null;
  const sub = k => (READY.has(k) ? '#/w/' + code + '/' + k : '/atlas/#/c/' + code + '/' + k);
  const wantCh = [G ? '#/ch/g/' + encodeURIComponent(G.id) : null, I ? '#/ch/i/' + encodeURIComponent(I.name) : null, READY.has('co') ? '#/w/' + code : '/atlas/#/c/' + code, sub('past'), sub('rivals'), sub('grow'), sub('range')].filter(Boolean);
  if (JSON.stringify(g.ch) !== JSON.stringify(wantCh) || g.ch.length + g.chq !== 7) fail('챕터 일곱', code + ' ' + JSON.stringify(g.ch));
  if (g.chan !== (o.i || '?') + ' 업종') fail('채널 줄', code + ' ' + g.chan);
  const mem = (I?.members || []).filter(m => m !== code && CO[m]).length;
  if (g.nx !== Math.min(6, mem)) fail('다음 볼 것 수', code + ' ' + g.nx + ' ≠ ' + Math.min(6, mem));
  if (g.sw > g.vw) fail('가로 넘침', 'w ' + code);
  if (!/^20거래일 · \d+월 \d+일 → \d+월 \d+일$/.test(g.tip)) fail('선 이름표', code + ' ' + g.tip);
  if (p._errs.length) { fail('화면 오류', code + ' ' + p._errs.join(' | ').slice(0, 200)); p._errs.length = 0; }
  await guard(p, '#/w/' + code);
  bump('회사');
}
for (const I of core.industries) {
  await go(p, '#/ch/i/' + encodeURIComponent(I.name));
  await p.waitForFunction(n => document.querySelector('#view .chhead h1')?.textContent === n, I.name + ' 업종', {timeout: 8000}).catch(() => fail('업종 채널 이름', I.name));
  const g = await p.evaluate(() => ({small: document.querySelector('#view .chhead small')?.textContent ?? '', st: [...document.querySelectorAll('#view .stats b')].map(b => b.textContent), tiles: document.querySelectorAll('#view .grid > a').length}));
  const n = I.members.filter(m => CO[m]).length;
  if (!g.small.startsWith('회사 ' + N(n) + '곳')) fail('업종 회사 수', I.name + ' ' + g.small);
  if (g.st[0] !== P(I.chg) || g.st[1] !== P(I.cwChg)) fail('업종 두 숫자', I.name + ' ' + g.st.join(','));
  if (g.tiles !== Math.min(20, n)) fail('업종 칸 수', I.name + ' ' + g.tiles);
  await guard(p, '#/ch/i/' + I.name);
  bump('업종 채널');
}
for (const G of core.groups) {
  await go(p, '#/ch/g/' + encodeURIComponent(G.id));
  await p.waitForFunction(n => document.querySelector('#view .chhead h1')?.textContent === n, G.name + ' 갈래', {timeout: 8000}).catch(() => fail('갈래 채널 이름', G.id));
  const g = await p.evaluate(() => ({small: document.querySelector('#view .chhead small')?.textContent ?? '', st: [...document.querySelectorAll('#view .stats b')].map(b => b.textContent)}));
  const n = (G.inds || []).reduce((a, nm) => a + (ind.get(nm)?.members || []).filter(m => CO[m]).length, 0);
  if (n !== G.n) fail('갈래 회사 수(자료)', G.id + ' ' + n + ' ≠ ' + G.n);
  if (!g.small.startsWith('회사 ' + N(n) + '곳') || !g.small.includes('업종 ' + (G.inds || []).length + '개')) fail('갈래 회사 수', G.id + ' ' + g.small);
  if (g.st[0] !== P(G.chg) || g.st[1] !== P(G.cwChg)) fail('갈래 두 숫자', G.id + ' ' + g.st.join(','));
  await guard(p, '#/ch/g/' + G.id);
  bump('갈래 채널');
}
/* ④ 쇼츠 */
{
  await go(p, '#/shorts'); await p.waitForTimeout(200);
  const got = await p.evaluate(() => [...document.querySelectorAll('#view .sh')].map(s => ({k: s.querySelector('.k')?.textContent, l1: s.querySelector('.l1')?.textContent, big: s.querySelector('.bg')?.textContent, l2: s.querySelector('.l2')?.textContent})));
  const exp = [];
  const kp = home?.idx?.KOSPI, kq = home?.idx?.KOSDAQ;
  if (kp) exp.push({l1: '코스피는 하루', big: P2(kp.day), l2: '코스닥은 ' + P2(kq.day) + '이에요'});
  let up = 0, dn = 0, fl = 0; for (const o of Object.values(CO)) { const d = lineDay(o.l); if (!Number.isFinite(d)) continue; if (d > 0) up++; else if (d < 0) dn++; else fl++; }
  exp.push({l1: '모든 회사 ' + N(up + dn + fl) + '곳 가운데', big: N(Math.max(up, dn)) + '곳'});
  const r0 = [...core.rise.list].sort((a, b) => b.chg - a.chg)[0]; if (r0) exp.push({l1: r0.name, big: P(r0.chg)});
  const gs = [...core.groups].sort((a, b) => b.chg - a.chg); exp.push({l1: gs[0].name + ' 갈래', big: P(gs[0].chg)}, {l1: gs[gs.length - 1].name + ' 갈래', big: P(gs[gs.length - 1].chg)});
  let best = null; for (const [c, o] of Object.entries(CO)) { if (weird(o.l)) continue; const x = c20(o); if (!best || x > best.x) best = {c, o, x}; }
  if (best) exp.push({l1: best.o.n, big: P(best.x)});
  if (surge?.members?.length) { const t = [...surge.members].sort((a, b) => b.r5 - a.r5)[0]; exp.push({l1: '급등 칸 ' + surge.members.length + '곳 가운데 1등', big: P(t.r5), l2: t.n + ' · ' + t.i}); }
  if (home?.s365) exp.push({l1: '고른 곳 ' + home.s365.n + '곳 가운데', big: N(home.s365.up) + '곳'});
  if (home?.us?.rows?.[0]) exp.push({l1: home.us.rows[0].name, big: P2(home.us.rows[0].chg), l2: home.us.rows.slice(1, 3).map(r => r.name + ' ' + P2(r.chg)).join(' · ')});
  for (const e of exp) {
    const hit = got.find(x => x.l1 === e.l1);
    if (!hit) { fail('쇼츠 사실 없음', e.l1); continue; }
    if (hit.big !== e.big) fail('쇼츠 숫자', e.l1 + ' ' + hit.big + ' ≠ ' + e.big);
    if (e.l2 && hit.l2 !== e.l2) fail('쇼츠 둘째 줄', e.l1 + ' 「' + hit.l2 + '」 ≠ 「' + e.l2 + '」');
    bump('쇼츠 사실');
  }
  if (got.length !== exp.length + 1) fail('쇼츠 수', got.length + ' ≠ ' + (exp.length + 1) + '(편지 한 장 포함)');
}
/* ⑤ 찾기 — 모든 회사 이름 */
{
  await go(p, '#/find'); await p.waitForSelector('#view .find input');
  const miss = await p.evaluate(names => {
    const inp = document.querySelector('#view .find input'), bad = [];
    for (const [code, n] of names) { inp.value = n; inp.dispatchEvent(new Event('input')); const a = document.querySelector('#view .hits a[href^="#/w/"]'); if (!a || a.getAttribute('href') !== '#/w/' + code) { if (a?.textContent?.startsWith(n) && document.querySelectorAll('#view .hits a[href^="#/w/"]').length && [...document.querySelectorAll('#view .hits a[href^="#/w/"]')].some(x => x.getAttribute('href') === '#/w/' + code)) continue; bad.push(code + ' ' + n); } }
    inp.value = '005930'; inp.dispatchEvent(new Event('input')); const s1 = document.querySelector('#view .hits a[href^="#/w/"]')?.getAttribute('href');
    inp.value = 'ㅋㅋㅋ없는말'; inp.dispatchEvent(new Event('input')); const s2 = document.querySelectorAll('#view .hits a[href^="#/w/"]').length;
    return {bad, s1, s2};
  }, codes.map(c => [c, CO[c].n]));
  for (const x of miss.bad.slice(0, 20)) fail('찾기 첫 줄', x);
  if (miss.s1 !== '#/w/005930') fail('번호 찾기', String(miss.s1));
  if (miss.s2 !== 0) fail('없는 말 찾기', String(miss.s2));
  counts['찾기'] = codes.length;
}
/* ⑥ 누르기 */
{
  await p.evaluate(() => { localStorage.clear(); });
  const code = '005930', o = CO[code];
  await go(p, '#/w/' + code); await p.waitForSelector('#view .sub-btn');
  await p.click('#view .chan .sub-btn'); await p.waitForTimeout(100);
  const sub = await p.evaluate(() => JSON.parse(localStorage.getItem('atlas:new:sub') || '[]'));
  if (!sub.includes('i:' + o.i)) fail('구독 누름', JSON.stringify(sub));
  await p.click('#view .acts .act'); await p.waitForTimeout(100);
  const later = await p.evaluate(() => JSON.parse(localStorage.getItem('atlas:new:later') || '[]'));
  if (!later.includes(code)) fail('담기 누름', JSON.stringify(later));
  // 선 끌기 — 왼쪽 끝 → 첫날 · 짧게 누름 → 처음 이름표
  const box = await p.locator('#view .player').boundingBox();
  await p.mouse.move(box.x + box.width * 0.04, box.y + box.height / 2); await p.mouse.down(); await p.mouse.move(box.x + box.width * 0.05, box.y + box.height / 2, {steps: 3});
  const t1 = await p.textContent('#view .player .tip'); await p.mouse.up();
  if (!t1.startsWith(MD(core.dates[0]) + ' · 첫날보다 0.0%')) fail('선 끌기 첫날', t1);
  await p.mouse.move(box.x + box.width * 0.96, box.y + box.height / 2); await p.mouse.down(); await p.mouse.move(box.x + box.width * 0.97, box.y + box.height / 2, {steps: 3});
  const t2 = await p.textContent('#view .player .tip'); await p.mouse.up();
  if (!t2.startsWith(MD(mkt.asOf) + ' · 첫날보다 ' + P(lineChg(o.l)))) fail('선 끌기 끝날', t2 + ' ≠ ' + P(lineChg(o.l)));
  await p.mouse.click(box.x + box.width / 2, box.y + box.height / 2); await p.waitForTimeout(80);
  const t3 = await p.textContent('#view .player .tip'); if (!t3.startsWith('20거래일 · ')) fail('짧게 누름', t3);
  await go(p, '#/sub'); const s = await p.evaluate(() => [...document.querySelectorAll('#view .avs small')].map(x => x.textContent));
  if (!s.includes(o.i)) fail('구독 칸', JSON.stringify(s));
  checkScan('390 #/sub(구독 있음)', await scan(p), p); await guard(p, '#/sub(구독 있음)');
  await go(p, '#/me'); const m = await p.evaluate(() => ({hist: document.querySelectorAll('#view .row a').length, later: [...document.querySelectorAll('#view .lst a[href^="#/w/"]')].map(a => a.getAttribute('href'))}));
  if (m.hist < 1 || !m.later.includes('#/w/' + code)) fail('나 칸', JSON.stringify(m));
  checkScan('390 #/me(기록 있음)', await scan(p), p); await guard(p, '#/me(기록 있음)');
  p.once('dialog', d => d.accept()); await p.click('#view .lst button'); await p.waitForTimeout(150);
  const cleared = await p.evaluate(() => [JSON.parse(localStorage.getItem('atlas:new:hist') || '[]').length, JSON.parse(localStorage.getItem('atlas:new:later') || '[]').length]);
  if (cleared[0] || cleared[1]) fail('지우기', JSON.stringify(cleared));
  // 글씨 크기 단추 — 보통 → 크게 → 아주 크게 → 보통 · 기억 atlas:font
  const fs3 = [];
  for (let k = 0; k < 3; k++) { await p.click('#fontBtn'); await p.waitForTimeout(60); fs3.push(await p.evaluate(() => [document.documentElement.classList.contains('f2'), document.documentElement.classList.contains('f3'), localStorage.getItem('atlas:font')].join(','))); }
  if (fs3.join(' ') !== 'true,false,1 false,true,2 false,false,0') fail('글씨 크기 단추', fs3.join(' '));
  bump('누르기');
}
await b.close();
const res = {schema: 'atlas11-next-check-1', at: new Date().toISOString(), base, asOf: mkt.asOf, ready: [...READY], companies: codes.length, limit: LIMIT || null, full: !LIMIT, oldNameScreens: guarded.size, oldNameAllow: ALLOW, seconds: Math.round((Date.now() - t0) / 1000), counts, fails, ok: !fails.length};
await fs.mkdir(path.dirname(out), {recursive: true});
await fs.writeFile(out, JSON.stringify(res, null, 1) + '\n');
console.log(JSON.stringify({ok: res.ok, seconds: res.seconds, counts, fails: fails.slice(0, 12)}, null, 0));
process.exit(res.ok ? 0 : 1);
