// 고도리 보내기 — 「친구에게 무슨 말을 할래?」 글상자 · 친구가 연 주소(#/s/…) 맞대기 — 사장님 2026-10-17 21:10(싱가포르) 「고도리 · 하나로 묶은 명령문」 [4] 1 ~ 9
//   쓰는 법: node scripts/atlas11/next/check_share.mjs --base http://127.0.0.1:8826 [--pw /opt/node-tools/] [--path /next/?dev=1] [--out 결과.json] [--all] [--limit N]
//     --all = 두 폭(360×640 · 390×844) 모두에서 모든 길 · 기본 = 360 은 모든 길 · 390 은 회사 화면 글상자 · 친구 주소 하나(--limit 은 받기만 — 기본과 같음)
//   기준 = 사장님 원문(docs/design/godori-2026-10-17/order-2110.txt [4] — 글상자 이름 · 빠른 말 셋 · 「보낸 날 값」 · 「오늘 값」 · 「같이 따져 줘」 · 「반토막 난다면 왜일까?」)
//          주소 꼴 = 일 나누기(docs/design/godori-2026-10-17/brief2.md) 「#/s/<번호>/<날>/<값>」 + 말 조각(UTF-8 base64url) — 이 검사가 따로 만들고 따로 풂(화면 모듈 p-share.js 의 셈을 쓰지 않음)
//   ⓪ 글 거르기(브라우저 없이): words.js 한 곳 = 편지 서버 · 편지 화면이 부름 · 편지 시험 글 · 빠른 말은 지남 · 수익 숫자는 걸림 · 화면 쓰지 않을 말 ⊇ next_check 목록
//   ① 보내기 입구마다 글상자(7곳): 회사 화면 「보내기」 · 「같이 따져 줘」 · 시황 「보내기」 · 소개 쪽 「친구에게 보내기」 · 편지 쪽 「봉인 소식 …」 · 초대장 · 사장님 새 초대장
//   ② 글상자: 이름(원문) · 빠른 말 셋(원문 차례) · 누르면 글상자에 · 갇힌 차례(Tab · Shift+Tab) · Esc 닫힘 · 닫으면 연 단추로 · 모양 파일이 앱 없이도 붙음
//   ③ 거르는 말 → 그 말을 짚어 알림 · 보내기 막힘(공유 창 안 열림) → 고치면 풀림 · 수익 숫자(+30% 벌었어 · 30퍼 먹었다 · 2배 올랐어) 막힘
//   ④ 공유 창(가짜) = 글 + 주소 함께 · 주소 꼴 · 말 조각을 풀면 보낸 말 · 같이 따져 줘 = a · 보낸 글 · 제목에 수익 숫자 없음
//   ⑤ 공유 창 없음 → 글 + 주소 함께 복사 · 알림 · 복사도 막힘 → 글을 보여 줌 · 대화창(dialog)을 못 쓰는 옛 기계 → 칸으로 열림(갇힌 차례 · Esc · 보내기)
//   ⑥ 친구 주소: 보낸 날 값 · 오늘 값(자료와 맞댐) · 그림(선 · 보낸 날 금빛 점) · 질문이 먼저 · 다 답하기 전엔 보낸 말이 화면에 없음 → 다 답한 뒤 보낸 말 ·
//      같이 따져 줘 = 「반토막 난다면 왜일까?」 + 내 생각 · 기록과 다른 값 「?」 · 깨진 말 · 거르는 말이 든 주소 · 이상한 주소
//   ⑧ 영어로 본 사람 — 빠른 말 · 기본 말 = 보이는 글(바뀐 글) · 쓴 사람 글(걸린 낱말 · 보낸 말 · 내 생각)은 한글이면 lang="ko"(엔진이 안 바꿈)
//   ⑦ 모양 — 옆 넘침 0 · 칸 밖 0 · 누르는 자리 44px · 글 17px · 쓰지 않을 말 0(남의 글 data-proper 밖) · 캔버스 0 · 화면 오류 0
//   검사 자체 시험: --mutate dup-name · no-filter · no-gain · msg-early · no-text · no-lang — 받은 p-share.js 를 일부러 망가뜨려 이 검사가 잡는지(잡으면 끝 코드 0)
//   실패가 하나라도 있으면 끝 코드 1(결과 파일은 --out 을 줄 때만)
import fs from 'node:fs/promises';
import path from 'node:path';
import {createRequire} from 'node:module';
import {fileURLToPath} from 'node:url';
import {NEW_NAME, SAFE_LINE} from './rename.mjs'; // 이름 = site/next/brand.js 한 곳(규칙 76) — 글자를 박지 않음
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../..');
const argv = process.argv.slice(2);
const arg = (k, d) => { const i = argv.indexOf(k); return i >= 0 && argv[i + 1] != null && !argv[i + 1].startsWith('--') ? argv[i + 1] : d; };
const require = createRequire(String(arg('--pw', process.env.PW_DIR || '/opt/node-tools/')).replace(/\/?$/, '/'));
const {chromium} = require('playwright');
const base = arg('--base', 'http://127.0.0.1:8826').replace(/\/$/, ''), NEXT = arg('--path', '/next/?dev=1'), OUT = arg('--out', null), ALL = argv.includes('--all');
const fails = [], counts = {}, t0 = Date.now();
// 검사 자체 시험(--mutate <이름>) — 화면 모듈을 일부러 망가뜨려(받을 때만 바꿈 · 시험 서버 파일은 그대로) 이 검사가 잡는지 봄 · 기대한 실패가 다 나오면 끝 코드 0
const MUTS = {
  'dup-name': [[['.slice(String(name ?? code).length)', '']], ['글상자에 이름이 두 번(이름 + 토씨만 써야 함)']],
  'no-filter': [[["import {sendHits} from './words.js';", 'const sendHits = () => [];']], ['거르는 말 알림', '걸렸는데 공유 창이 열림']],
  'no-gain': [[["import {sendHits} from './words.js';", "import {hits as sendHits} from './words.js';"]], ['거르는 말 알림']],
  'msg-early': [[['after.append(lock);', 'after.append(lock, senderMsg(S));']], ['다 답하기 전에 보낸 말이 화면에 보임']],
  'no-text': [[['await navigator.share({title, text, url});', 'await navigator.share({title, url});']], ['공유 창에 글이 없음']],
  'no-lang': [[["lang: /[가-힣]/.test(txt) ? 'ko' : null", 'lang: null']], ['보낸 말(쓴 사람 글)에 lang="ko" 없음', '걸린 낱말(쓴 사람 글)에 lang="ko" 없음 — 엔진이 바꿈']],
};
const MUT = arg('--mutate', null);
if (MUT && !MUTS[MUT]) { console.error('모르는 --mutate', MUT, Object.keys(MUTS).join(' · ')); process.exit(1); }
const fail = (k, x) => { counts.fail = (counts.fail || 0) + 1; if (fails.length < 500) fails.push([k, String(x).slice(0, 400)]); };
const bump = (k, n = 1) => { counts[k] = (counts[k] || 0) + n; };

/* 기준 — 사장님 원문 [4](글자 그대로 · 줄 바꿈은 띄어쓰기로) */
const ORDER = await fs.readFile(path.join(ROOT, 'docs/design/godori-2026-10-17/order-2110.txt'), 'utf8').catch(() => '');
const SEC4 = ((ORDER.split('[4 · 보내기]')[1] ?? '').split('[5 ·')[0] ?? '').replace(/\s+/g, ' ');
const HEAD = /「(친구에게 무슨 말을 할래\?)」/.exec(SEC4)?.[1];
const QUICK = (/빠른 말 셋: (.+?) 3\./.exec(SEC4)?.[1] ?? '').split(' / ').map(s => s.trim()).filter(Boolean);
const SENT_LBL = /「(보낸 날 값)」/.exec(SEC4)?.[1], NOW_LBL = /「(오늘 값)」/.exec(SEC4)?.[1];
const ASK_BTN = /「(같이 따져 줘)」/.exec(SEC4)?.[1], ASK_Q = /「(반토막 난다면 왜일까\?)」/.exec(SEC4)?.[1];
if (!HEAD || QUICK.length !== 3 || !SENT_LBL || !NOW_LBL || !ASK_BTN || !ASK_Q) { console.error('사장님 원문 [4] 를 order-2110.txt 에서 못 읽음', {HEAD, QUICK, SENT_LBL, NOW_LBL, ASK_BTN, ASK_Q}); process.exit(1); }
const BRIEF2 = await fs.readFile(path.join(ROOT, 'docs/design/godori-2026-10-17/brief2.md'), 'utf8').catch(() => '');
if (!BRIEF2.includes('#/s/<번호>/<날>/<값>')) fail('기준 글이 바뀜(brief2.md 주소 꼴 — 이 검사의 주소 셈을 고칠 것)', '#/s/<번호>/<날>/<값>');

/* ⓪ 글 거르기 — 브라우저 없이 */
const W = await import(path.join(ROOT, 'site/next/words.js'));
const L = await import(path.join(ROOT, 'lib/atlas11/letter.mjs'));
if (L.BAD !== W.BLOCK || L.OKW !== W.OKW || L.badWord !== W.badWord) fail('한 곳 아님', '편지 서버(lib/atlas11/letter.mjs)의 막는 말이 words.js 의 것이 아님');
const LJS = await fs.readFile(path.join(ROOT, 'site/letter.js'), 'utf8');
if (!/import \{[^}]*\bbadWord\b[^}]*\} from '\/next\/words\.js'/.test(LJS) || /const (BAD|OKW) = \[/.test(LJS)) fail('한 곳 아님', '편지 화면(site/letter.js)이 /next/words.js 를 부르지 않거나 제 목록을 가짐');
for (const f of ['site/letter.js', 'site/hello-send.js']) if (!/from '\/next\/p-share\.js'/.test(await fs.readFile(path.join(ROOT, f), 'utf8'))) fail('글상자 안 씀', f + ' 가 /next/p-share.js 를 부르지 않음');
const NC = await fs.readFile(path.join(ROOT, 'scripts/atlas11/next/next_check.mjs'), 'utf8');
const ncList = /const BANNED = \[([^\]]*)\]/.exec(NC)?.[1];
if (ncList) for (const w of (ncList.match(/'([^']+)'/g) || []).map(x => x.slice(1, -1))) if (!W.SCREEN.includes(w)) fail('화면 쓰지 않을 말이 words.js 에 없음', w);
for (const w of ['추천', '매수', '매도', '예측', '확률', '유망', '기회', '신호', '저평가', '1위', 'TOP', '사세요', '사라', '파세요', '팔아라']) if (!W.SCREEN.includes(w)) fail('명령문의 쓰지 않을 말이 words.js 에 없음', w);
const T = (s, want, tag) => { const got = W.badWord(s); if (JSON.stringify(got) !== JSON.stringify(want)) fail('거르기 틀림', `${tag} 「${s}」 ${JSON.stringify(got)} ≠ ${JSON.stringify(want)}`); bump('거르기 맞댐'); };
T('내일 사 세 요', ['사고팔기 말', '사세요'], '편지 시험'); T('지금 사라', ['사고팔기 말', '사라'], '편지 시험');
for (const s of ['이번 주는 뉴스를 덜 보기로 했어요', '급등 탭에서 봤어요', '거래가 사라졌어요', '사라져요', ...QUICK, ASK_Q, '같이 따져 줘', 'stop', '돈을 잘 번대']) { if (W.sendHits(s).length) fail('보통 말이 걸림', `「${s}」 ${JSON.stringify(W.sendHits(s))}`); bump('거르기 맞댐'); }
for (const s of ['오픈채팅 오세요', '연락은 010-1234', 'WWW.example', '좋은 기회야', 'TOP 10', '시총 1위', '지금 팔아라', '추천해']) { if (!W.badWord(s)) fail('걸러야 할 말이 지남', `「${s}」`); bump('거르기 맞댐'); }
const GAIN = ['+30% 벌었어', '30퍼 먹었다', '2배 올랐어', '두 배 올랐네', '수익률 좋아', '20 % 났어', '▲12 찍음', '3프로 올랐어'];
for (const s of GAIN) { if (!W.sendHits(s).length) fail('수익 숫자가 지남', `「${s}」`); bump('거르기 맞댐'); }
for (const [s, want] of [['사라져요 공매도 STOP', []], ['TOP 10 · 1위', ['1위', 'TOP']], ['사라지는 것', []], ['지금 사라', ['사라']]]) { const got = W.screenHits(s); if (JSON.stringify(got) !== JSON.stringify(want)) fail('화면 셈 틀림', `「${s}」 ${JSON.stringify(got)}`); bump('거르기 맞댐'); }

/* 주소 · 말 조각 — 이 검사가 따로 만들고 풂(UTF-8 base64url) */
const b64 = s => Buffer.from(s, 'utf8').toString('base64url'), unb64 = s => Buffer.from(s, 'base64url').toString('utf8');
const URL_RE = new RegExp('^' + (base + NEXT).replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '#/s/([0-9A-Z]{6})/(\\d{4}-\\d{2}-\\d{2})/([1-9]\\d*)/([sa])(?:/([A-Za-z0-9_-]+))?$');
const num = n => Number(n).toLocaleString('ko-KR');
const md = d => `${+d.slice(5, 7)}월 ${+d.slice(8, 10)}일`;
const noGainPayload = (d, tag) => { const t = (d?.title ?? '') + '\n' + (d?.text ?? ''); if (/\d\s*(%|％|퍼센트|프로)/.test(t) || W.gainHits(t).length) fail('보낸 글에 수익 숫자', `${tag} 「${t.slice(0, 80)}」`); bump('보낸 글 수익 숫자 0'); };

/* 자료 — 회사 하나(고도리 칸 첫 곳 · 없으면 삼성전자) · 그 회사 값 · 날짜 */
const getJ = async f => { const r = await fetch(base + f, {cache: 'no-store'}); if (!r.ok) throw Error(f + ' ' + r.status); return r.json(); };
const G = await getJ('/next/data/gdr.json').catch(() => null);
const CODE = [G?.picks?.[0]?.code, '005930'].find(c => /^[0-9A-Z]{6}$/.test(c ?? ''));
const CO = await getJ('/atlas/data/co/' + CODE + '.json').catch(e => { fail('자료', e.message); return null; });
const DAYS = await getJ('/atlas/data/days.json').catch(e => { fail('자료', e.message); return null; });
if (!CO?.c?.price || !Array.isArray(CO?.close) || !Array.isArray(DAYS?.dates)) { console.error('자료를 못 받음', CODE); process.exit(1); }
const K0 = Number.isInteger(CO.k0) ? CO.k0 : 0, closeAt = d => { const i = DAYS.dates.indexOf(d) - K0; return i >= 0 && i < CO.close.length ? CO.close[i] : null; };
const SENT_DAY = DAYS.dates[DAYS.dates.length - 6], SENT_PRICE = Math.round(closeAt(SENT_DAY));
if (!(SENT_PRICE > 0)) { console.error('보낸 날 값을 자료에서 못 셈', SENT_DAY); process.exit(1); }

/* 브라우저 — 한 번에 하나 · 길마다 새 칸 */
const exe = '/opt/pw-browsers/chromium', browser = await chromium.launch((await fs.stat(exe).catch(() => null)) ? {executablePath: exe} : {});
/** mode: 'share'(가짜 공유 창) · 'copy'(공유 창 없음 · 복사 됨) · 'show'(둘 다 막힘) · letter = 편지 서버 가짜(회원 · 봉인 · 초대장 · 사장님) */
async function newPage(width, height, {mode = 'share', letter = false, noDialog = false} = {}) {
  const ctx = await browser.newContext({viewport: {width, height}, deviceScaleFactor: 1, hasTouch: true, locale: 'ko-KR', timezoneId: 'Asia/Seoul'});
  if (noDialog) await ctx.addInitScript(() => { delete HTMLDialogElement.prototype.showModal; }); // 대화창(dialog)을 못 쓰는 옛 기계
  await ctx.addInitScript(m => {
    window.__shared = []; window.__copied = [];
    Object.defineProperty(Navigator.prototype, 'share', {configurable: true, value: m === 'share' ? async function (d) { window.__shared.push({title: d?.title ?? null, text: d?.text ?? null, url: d?.url ?? null}); } : undefined});
    Object.defineProperty(Navigator.prototype, 'clipboard', {configurable: true, get() { return {writeText: m === 'show' ? () => Promise.reject(new DOMException('막힘', 'NotAllowedError')) : async t => { window.__copied.push(String(t)); }}; }});
  }, mode);
  if (letter) {
    const now = Date.now(), opens = new Date(now + 3 * 864e5).toISOString();
    const me = {nick: '시험이', weeks: ['2026-10-16'], invites: [{code: 'AbCdEfGhIjKlMn01', used: false}, {code: 'AbCdEfGhIjKlMn02', used: true}, {code: 'AbCdEfGhIjKlMn03', used: false}]};
    await ctx.route('**/api/letter**', r => {
      const u = new URL(r.request().url()), post = r.request().method() === 'POST';
      if (post) return r.fulfill({status: 201, contentType: 'application/json', body: JSON.stringify({codes: ['NewCode000000001', 'NewCode000000002']})});
      const body = u.searchParams.get('week') ? {letters: [], me} : {now: new Date(now).toISOString(), opensAt: opens, count: 3, subjects: [], member: true, owner: true, prev: '2026-10-16', me,
        mine: {what: {kind: 'idx', code: 'KOSPI', name: '코스피'}, at: new Date(now - 864e5).toISOString(), text: '이번 주는 뉴스를 덜 보기로 했어요'}};
      return r.fulfill({status: 200, contentType: 'application/json', body: JSON.stringify(body)});
    });
  }
  if (MUT) await ctx.route('**/next/p-share.js', async r => {
    const res = await r.fetch(); let body = await res.text();
    for (const [x, y] of MUTS[MUT][0]) { if (!body.includes(x)) { console.error('망가뜨릴 자리를 못 찾음(검사 자체 시험을 고칠 것)', x); process.exit(1); } body = body.replace(x, y); }
    await r.fulfill({response: res, body});
  });
  const p = await ctx.newPage(); p._errs = [];
  p.on('pageerror', e => p._errs.push('pageerror ' + e.message));
  p.on('console', m => { if (m.type() === 'error') p._errs.push(m.text() + (m.location()?.url ? ' @ ' + m.location().url : '')); });
  p.on('response', r => { if (r.status() >= 400 && r.url().startsWith(base)) p._errs.push(r.status() + ' ' + r.url()); });
  return p;
}
const errsOf = (p, tag) => { if (p._errs.length) { fail('화면 오류', tag + ' · ' + p._errs.slice(0, 3).join(' | ')); p._errs.length = 0; } };
const done = async p => { try { await p.context().close(); } catch {} };

/** 모양 — 옆 넘침 · 칸 밖 · 누르는 자리 · 글 크기 · 캔버스 · 쓰지 않을 말(남의 글 data-proper 밖 · 이름표 글 포함) */
const LAYOUT = sel => {
  const vw = document.documentElement.clientWidth, root = document.querySelector(sel);
  const out = {sw: document.documentElement.scrollWidth, vw, wide: [], small: [], tiny: [], canvas: 0, text: '', attrs: [], missing: !root};
  if (!root) return out;
  const desc = e => e.tagName.toLowerCase() + (typeof e.className === 'string' && e.className.trim() ? '.' + e.className.trim().split(/\s+/).join('.') : '') + ' 「' + (e.textContent || '').trim().slice(0, 24) + '」';
  for (const e of [root, ...root.querySelectorAll('*')]) {
    if (e.ownerSVGElement || e.closest('[hidden]')) continue;
    const r = e.getBoundingClientRect(); if (r.width < 2 && r.height < 2) continue;
    if (r.right > vw + 1 || r.left < -1) out.wide.push(desc(e) + ' ' + Math.round(r.left) + '~' + Math.round(r.right));
    const cs = getComputedStyle(e);
    if (cs.visibility !== 'hidden' && [...e.childNodes].some(n => n.nodeType === 3 && n.textContent.trim()) && parseFloat(cs.fontSize) < 16.95) out.tiny.push(desc(e) + ' ' + cs.fontSize);
  }
  for (const e of root.querySelectorAll('a[href], button, input, select, textarea, summary, [role="button"]')) { if (e.closest('[hidden]')) continue; const r = e.getBoundingClientRect(); if (!r.width || !r.height) continue; if (r.height < 43.5 || r.width < 43.5) out.small.push(desc(e) + ' ' + Math.round(r.width) + '×' + Math.round(r.height)); }
  out.canvas = root.querySelectorAll('canvas').length;
  const c = root.cloneNode(true); c.querySelectorAll('[data-proper]').forEach(x => x.remove()); out.text = c.textContent;
  for (const e of [c, ...c.querySelectorAll('*')]) for (const a of ['aria-label', 'title', 'alt', 'placeholder']) { const v = e.getAttribute?.(a); if (v) out.attrs.push(v); }
  return out;
};
async function layout(p, sel, tag) {
  const s = await p.evaluate(LAYOUT, sel); bump('모양 잰 화면');
  if (s.missing) { fail('칸 없음', tag + ' ' + sel); return; }
  if (s.sw > s.vw) fail('옆으로 넘침', `${tag}: ${s.sw} > ${s.vw}`);
  for (const x of s.wide.slice(0, 3)) fail('칸 밖으로 나감', `${tag}: ${x}`);
  for (const x of s.small.slice(0, 3)) fail('누르는 자리 44px 밑', `${tag}: ${x}`);
  for (const x of s.tiny.slice(0, 3)) fail('글 17px 밑', `${tag}: ${x}`);
  if (s.canvas) fail('캔버스(입체 없음 규칙 50)', tag);
  for (const w of W.screenHits(s.text + '\n' + s.attrs.join('\n'))) fail('쓰지 않을 말', `${tag} 「${w}」`);
}

/* 글상자 */
const DLG = '.ps-dlg';
const READD = () => {
  const d = document.querySelector('.ps-dlg'); if (!d) return null;
  const go = d.querySelector('.ps-go');
  return {open: d.tagName === 'DIALOG' ? d.open : true, h: d.querySelector('.ps-h')?.textContent ?? null, desc: d.querySelector('.ps-d')?.textContent ?? '', labelled: d.getAttribute('aria-labelledby'),
    quick: [...d.querySelectorAll('.ps-q button')].map(b => b.textContent), ta: d.querySelector('textarea.ps-t:not(.ps-show)')?.value ?? null, say: d.querySelector('.ps-m')?.textContent ?? '',
    sayNo: !!d.querySelector('.ps-m.no'), dis: go?.getAttribute('aria-disabled') ?? null, show: (() => { const s = d.querySelector('.ps-show'); return s && !s.hidden ? s.value : null; })(),
    inFocus: !!document.activeElement?.closest('.ps-dlg'), radius: getComputedStyle(d).borderTopLeftRadius, all: (() => { const c = d.cloneNode(true); c.querySelectorAll('.ps-url, textarea').forEach(x => x.remove()); return c.textContent; })(), name: d.querySelector('.ps-d b')?.textContent ?? null};
};
async function openBox(p, click, tag) {
  await click();
  try { await p.waitForSelector(DLG, {state: 'visible', timeout: 10000}); } catch { fail('글상자가 안 열림', tag); return null; }
  const s = await p.evaluate(READD); bump('연 글상자');
  if (!s?.open) fail('글상자가 안 열림', tag);
  if (s.h !== HEAD) fail('글상자 이름(원문)', `${tag} 「${s.h}」 ≠ 「${HEAD}」`);
  if (JSON.stringify(s.quick) !== JSON.stringify(QUICK)) fail('빠른 말 셋(원문 차례)', `${tag} ${JSON.stringify(s.quick)}`);
  if (!s.inFocus) fail('연 뒤 초점이 글상자 밖', tag);
  if (s.radius !== '18px') fail('글상자 모양 파일(p-share.css)이 안 붙음', `${tag} ${s.radius}`);
  if (/undefined|null|NaN|\?원|값 원|·\s*·/.test(s.all)) fail('글상자에 빈 칸 · 깨진 값', `${tag} 「${s.all.slice(0, 120)}」`);
  if (s.name && s.desc.split(s.name).length - 1 !== 1) fail('글상자에 이름이 두 번(이름 + 토씨만 써야 함)', `${tag} 「${s.desc}」`);
  return s;
}
/** 빠른 말을 누르고 보냄 → 가짜 공유 창 / 복사 / 보여 줌 결과 */
async function sendQuick(p, k, tag) {
  const shown = await p.locator(DLG + ' .ps-q button').nth(k).textContent();
  await p.locator(DLG + ' .ps-q button').nth(k).click();
  const ta = await p.evaluate(() => document.querySelector('.ps-dlg textarea.ps-t')?.value);
  if (ta !== shown) fail('빠른 말 — 글상자 = 단추에 보이는 글(영어면 바뀐 글)', `${tag} 「${ta}」 ≠ 「${shown}」`);
  if (!EN_PAGE.has(p) && ta !== QUICK[k]) fail('빠른 말이 글상자에 안 들어감', `${tag} 「${ta}」`);
  await p.locator(DLG + ' .ps-go').click();
  return shown;
}
const EN_PAGE = new WeakSet(); // 영어(?lang=en)로 연 쪽 — 빠른 말 · 기본 말은 보이는 글(바뀐 글)과 맞댐
const shared = p => p.evaluate(() => window.__shared), copied = p => p.evaluate(() => window.__copied);
async function waitShared(p, n, tag) { try { await p.waitForFunction(k => window.__shared.length >= k, n, {timeout: 8000}); return (await shared(p))[n - 1]; } catch { fail('공유 창이 안 열림', tag); return null; } }

/** ① ② ③ ④ — 회사 화면 「보내기」: 차례 · Esc · 거르기 · 수익 숫자 · 보내기 */
async function companyBox(W_, H_, deep) {
  const tag = `${W_}×${H_} 회사 #/w/${CODE}`, p = await newPage(W_, H_);
  try {
    await p.goto(base + NEXT + '#/w/' + CODE, {waitUntil: 'domcontentloaded'});
    const shareB = p.locator('#view .acts button', {hasText: /^보내기$/}), askB = p.locator('#view .acts button', {hasText: new RegExp('^' + ASK_BTN + '$')});
    await shareB.first().waitFor({timeout: 30000});
    if (!(await askB.count())) fail('「같이 따져 줘」 단추 없음', tag);
    let s = await openBox(p, () => shareB.first().click(), tag + ' 보내기'); if (!s) return;
    if (!s.desc.includes(num(CO.c.price) + '원')) fail('글상자에 그날 값이 없음', `${tag} 「${s.desc}」`);
    await layout(p, DLG, tag + ' 글상자');
    // 갇힌 차례
    for (let i = 0; i < 14; i++) { await p.keyboard.press('Tab'); if (!(await p.evaluate(() => !!document.activeElement?.closest('.ps-dlg')))) { fail('Tab 이 글상자 밖으로', `${tag} ${i + 1}번째`); break; } }
    for (let i = 0; i < 4; i++) { await p.keyboard.press('Shift+Tab'); if (!(await p.evaluate(() => !!document.activeElement?.closest('.ps-dlg')))) { fail('Shift+Tab 이 글상자 밖으로', `${tag} ${i + 1}번째`); break; } }
    bump('갇힌 차례');
    await p.keyboard.press('Escape');
    try { await p.waitForSelector(DLG, {state: 'detached', timeout: 4000}); } catch { fail('Esc 로 안 닫힘', tag); }
    if ((await p.evaluate(() => document.activeElement?.textContent)) !== '보내기') fail('닫은 뒤 초점이 연 단추로 안 돌아옴', tag);
    // 거르는 말 · 수익 숫자
    s = await openBox(p, () => shareB.first().click(), tag + ' 다시'); if (!s) return;
    const ta = p.locator(DLG + ' textarea.ps-t').first();
    for (const [txt, word] of [['지금 사세요', '사세요'], ['+30% 벌었어', '30%'], ['30퍼 먹었다', '30퍼'], ['2배 올랐어', '2배 올'], ['카톡 주세요', '카톡']].slice(0, deep ? 5 : 3)) {
      await ta.fill(txt); s = await p.evaluate(READD);
      if (!s.sayNo || !s.say.includes(word)) fail('거르는 말 알림', `${tag} 「${txt}」 → 「${s.say}」`);
      if (s.dis !== 'true') fail('걸렸는데 보내기가 안 막힘', `${tag} 「${txt}」`);
      if (txt === '지금 사세요') {
        await layout(p, DLG, tag + ' 걸린 말 알림'); // 알림 속 걸린 낱말은 쓴 사람 글(data-proper) — 화면 쓰지 않을 말 셈 밖이어야 함
        const lg = await p.evaluate(() => document.querySelector('.ps-dlg .ps-m [data-proper]')?.getAttribute('lang') ?? null);
        if (lg !== 'ko') fail('걸린 낱말(쓴 사람 글)에 lang="ko" 없음 — 엔진이 바꿈', `${tag} ${lg}`);
      }
      await p.locator(DLG + ' .ps-go').click({force: true}); await p.waitForTimeout(250); // aria-disabled 단추도 누름 — 막는 것은 화면 셈이어야 함
      if ((await shared(p)).length) fail('걸렸는데 공유 창이 열림', `${tag} 「${txt}」`);
      const sel = await p.evaluate(() => { const t = document.querySelector('.ps-dlg textarea.ps-t'); return t ? t.value.slice(t.selectionStart, t.selectionEnd) : ''; });
      if (!sel) fail('걸린 낱말을 짚지 않음', `${tag} 「${txt}」`);
      bump('막은 말');
    }
    await ta.fill('나는 이렇게 봤어'); s = await p.evaluate(READD);
    if (s.sayNo || s.dis !== 'false') fail('고친 뒤에도 막힘', `${tag} 「${s.say}」 ${s.dis}`);
    // 보내기 — 빠른 말
    await sendQuick(p, 2, tag);
    const d = await waitShared(p, 1, tag);
    if (d) {
      const m = URL_RE.exec(d.url ?? '');
      if (!m) fail('보낸 주소 꼴', `${tag} 「${d.url}」`);
      else {
        if (m[1] !== CODE || m[2] !== CO.c.priceDate || +m[3] !== Math.round(CO.c.price) || m[4] !== 's') fail('주소의 종목 · 날 · 값 · 갈래', `${tag} ${m.slice(1, 5).join(' ')}`);
        if (!m[5] || unb64(m[5]) !== QUICK[2]) fail('주소의 말 조각', `${tag} 「${m[5] ? unb64(m[5]) : ''}」`);
        if (m[5] && m[5].length > 200) fail('말 조각이 200자 넘음', tag);
      }
      if (!String(d.text ?? '').startsWith(QUICK[2])) fail('공유 창에 글이 없음', `${tag} 「${d.text}」`);
      noGainPayload(d, tag);
      bump('보낸 것');
    }
    try { await p.waitForSelector(DLG, {state: 'detached', timeout: 4000}); } catch { fail('보낸 뒤 글상자가 안 닫힘', tag); }
    // 같이 따져 줘 — 빈 글상자로 보내면 기본 말
    s = await openBox(p, () => askB.first().click(), tag + ' 같이 따져 줘'); if (!s) return;
    if (!s.desc.includes(ASK_Q)) fail('같이 따져 줘 글상자에 「반토막 난다면 왜일까?」 없음', `${tag} 「${s.desc}」`);
    if (!s.desc.startsWith(CO.c.name + '를 ') && !s.desc.startsWith(CO.c.name + '을 ')) fail('같이 따져 줘 — 이름 한 번 + 토씨', `${tag} 「${s.desc.slice(0, 40)}」`);
    await p.locator(DLG + ' .ps-go').click();
    const a = await waitShared(p, 2, tag + ' 같이 따져 줘');
    if (a) {
      const m = URL_RE.exec(a.url ?? '');
      if (!m || m[4] !== 'a') fail('같이 따져 줘 주소 갈래(a)', `${tag} 「${a.url}」`);
      else if (!m[5] || !unb64(m[5]).includes(ASK_Q)) fail('같이 따져 줘 말 조각', `${tag} 「${m[5] ? unb64(m[5]) : ''}」`);
      if (!String(a.text ?? '').includes(ASK_Q)) fail('같이 따져 줘 글', `${tag} 「${a.text}」`);
      noGainPayload(a, tag + ' 같이 따져 줘');
      bump('보낸 것');
    }
    errsOf(p, tag);
  } finally { await done(p); }
}
/** ⑤ 공유 창 없음 → 복사 · 복사도 막힘 → 보여 줌 */
async function fallbacks(W_, H_) {
  for (const mode of ['copy', 'show']) {
    const tag = `${W_}×${H_} ${mode === 'copy' ? '공유 창 없음 → 복사' : '복사도 막힘 → 보여 줌'}`, p = await newPage(W_, H_, {mode});
    try {
      await p.goto(base + NEXT + '#/w/' + CODE, {waitUntil: 'domcontentloaded'});
      const b = p.locator('#view .acts button', {hasText: /^보내기$/}); await b.first().waitFor({timeout: 30000});
      if (!(await openBox(p, () => b.first().click(), tag))) continue;
      await sendQuick(p, 0, tag);
      if (mode === 'copy') {
        try { await p.waitForFunction(() => window.__copied.length > 0, null, {timeout: 6000}); } catch { fail('복사 안 됨', tag); }
        const c = (await copied(p))[0] ?? '', [t1, u1] = [c.split('\n')[0], c.split('\n').pop()];
        if (t1 !== QUICK[0] || !URL_RE.test(u1)) fail('복사한 글 = 글 + 주소', `${tag} 「${c.slice(0, 120)}」`);
        const s = await p.evaluate(READD); if (!/함께 담았어요/.test(s?.say ?? '')) fail('복사했다는 알림', `${tag} 「${s?.say}」`);
      } else {
        try { await p.waitForFunction(() => { const s = document.querySelector('.ps-dlg .ps-show'); return s && !s.hidden; }, null, {timeout: 6000}); } catch { fail('글을 보여 주지 않음', tag); }
        const s = await p.evaluate(READD); if (!s?.show || !s.show.startsWith(QUICK[0]) || !URL_RE.test(s.show.split('\n').pop())) fail('보여 준 글 = 글 + 주소', `${tag} 「${s?.show}」`);
        await layout(p, DLG, tag);
      }
      bump('보낸 것');
      errsOf(p, tag);
    } finally { await done(p); }
  }
}
/** 영어로 본 사람 — 빠른 말 · 기본 말이 보이는 글(바뀐 글)로 감(한국어 글자를 박아 보내지 않음) · 소개 쪽(앱 없음)과 회사 화면(앱) */
async function englishBox(W_, H_) {
  for (const [where, url, click] of [['소개 쪽', '/hello.html?lang=en', p => p.locator('#hp-send').click()], ['회사 화면', NEXT + '&lang=en#/w/' + CODE, p => p.locator('#view .acts button').nth(1).click()]]) {
    const tag = `${W_}×${H_} 영어 ${where}`, p = await newPage(W_, H_); EN_PAGE.add(p);
    try {
      await p.goto(base + url, {waitUntil: 'domcontentloaded'});
      await p.waitForFunction(() => document.documentElement.lang === 'en' && (!!document.querySelector('#hp-send') || document.querySelectorAll('#view .acts button').length >= 2), null, {timeout: 30000});
      await p.waitForTimeout(300); // 엔진이 그려진 글을 바꾸는 사이
      await click(p);
      try { await p.waitForSelector(DLG, {state: 'visible', timeout: 10000}); } catch { fail('글상자가 안 열림', tag); continue; }
      await p.waitForTimeout(200);
      const first = await sendQuick(p, 0, tag);
      const d = await waitShared(p, 1, tag);
      if (d && String(d.text ?? '').split('\n')[0] !== first) fail('보낸 첫 줄 = 단추에 보이는 글', `${tag} 「${d.text}」 ≠ 「${first}」`);
      // 빈 글상자로 보내면 기본 말 = 첫 빠른 말(보이는 글)
      await click(p); await p.waitForSelector(DLG, {state: 'visible', timeout: 10000}); await p.waitForTimeout(200);
      const shown0 = await p.locator(DLG + ' .ps-q button').first().textContent();
      await p.locator(DLG + ' .ps-go').click();
      const e = await waitShared(p, 2, tag + ' 기본 말');
      if (e && String(e.text ?? '').split('\n')[0] !== shown0) fail('기본 말 = 지금 말의 첫 빠른 말', `${tag} 「${e.text}」 ≠ 「${shown0}」`);
      bump('보낸 것', 2);
      errsOf(p, tag);
    } finally { await done(p); }
  }
}
/** 대화창을 못 쓰는 옛 기계 — 칸(div role=dialog)으로 열림 · 갇힌 차례 · Esc · 보내기 */
async function noDialogBox(W_, H_) {
  const tag = `${W_}×${H_} 대화창 없는 기계`, p = await newPage(W_, H_, {noDialog: true});
  try {
    await p.goto(base + NEXT + '#/w/' + CODE, {waitUntil: 'domcontentloaded'});
    const b = p.locator('#view .acts button', {hasText: /^보내기$/}); await b.first().waitFor({timeout: 30000});
    if (!(await openBox(p, () => b.first().click(), tag))) return;
    const kind = await p.evaluate(() => { const d = document.querySelector('.ps-dlg'); return d.tagName + ' ' + d.getAttribute('role') + ' ' + d.getAttribute('aria-modal'); });
    if (kind !== 'DIV dialog true') fail('옛 기계 글상자 꼴(div role=dialog aria-modal)', `${tag} ${kind}`);
    for (let i = 0; i < 12; i++) { await p.keyboard.press('Tab'); if (!(await p.evaluate(() => !!document.activeElement?.closest('.ps-dlg')))) { fail('Tab 이 글상자 밖으로(옛 기계)', `${tag} ${i + 1}번째`); break; } }
    await layout(p, DLG, tag);
    await p.keyboard.press('Escape');
    try { await p.waitForSelector(DLG, {state: 'detached', timeout: 4000}); } catch { fail('Esc 로 안 닫힘(옛 기계)', tag); }
    if (!(await openBox(p, () => b.first().click(), tag + ' 다시'))) return;
    await sendQuick(p, 1, tag);
    const d = await waitShared(p, 1, tag);
    if (d && (!URL_RE.test(d.url ?? '') || !String(d.text ?? '').startsWith(QUICK[1]))) fail('옛 기계 보낸 글 · 주소', `${tag} 「${d?.text}」 「${d?.url}」`);
    bump('보낸 것');
    errsOf(p, tag);
  } finally { await done(p); }
}
/** ① 다른 입구 — 시황 · 소개 쪽 · 편지 쪽 셋 */
async function otherEntries(W_, H_) {
  // 시황(쇼츠)
  let tag = `${W_}×${H_} 시황 #/shorts`, p = await newPage(W_, H_);
  try {
    await p.goto(base + NEXT + '#/shorts', {waitUntil: 'domcontentloaded'});
    const b = p.locator('#view button', {hasText: /^보내기$/});
    try { await b.first().waitFor({timeout: 30000}); } catch { fail('시황 보내기 단추 없음', tag); }
    if (await b.count()) {
      const sb = await openBox(p, () => b.first().click(), tag);
      if (sb && (/값|원을 같이/.test(sb.desc) || !sb.desc.trim())) fail('시황 글상자 — 종목 값 칸이 없어야 하고 이름표는 있어야 함', `${tag} 「${sb.desc}」`);
      if (sb) {
        await sendQuick(p, 0, tag);
        const d = await waitShared(p, 1, tag);
        if (d) { if (!String(d.url ?? '').startsWith(base + '/#/shorts/') && !URL_RE.test(d.url ?? '')) fail('시황 보낸 주소', `${tag} 「${d.url}」`); if (!String(d.text ?? '').startsWith(QUICK[0])) fail('시황 보낸 글', `${tag} 「${d.text}」`); noGainPayload(d, tag); bump('보낸 것'); }
      }
    }
    errsOf(p, tag);
  } finally { await done(p); }
  // 소개 쪽(앱 없음)
  tag = `${W_}×${H_} 소개 /hello.html`; p = await newPage(W_, H_);
  try {
    await p.goto(base + '/hello.html', {waitUntil: 'domcontentloaded'});
    await p.locator('#hp-send').waitFor({timeout: 20000});
    const lead = await p.evaluate(() => window.__helloShare?.text ?? null);
    if (await openBox(p, () => p.locator('#hp-send').click(), tag)) {
      if (await p.evaluate(() => !!globalThis.NX)) fail('소개 쪽에 앱이 있음(앱 없이 시험해야 함)', tag);
      await layout(p, DLG, tag + ' 글상자');
      await sendQuick(p, 1, tag);
      const d = await waitShared(p, 1, tag);
      if (d) {
        if (d.url !== base + '/hello.html') fail('소개 쪽 보낸 주소', `${tag} 「${d.url}」`);
        if (!String(d.text ?? '').startsWith(QUICK[1]) || (lead && !d.text.includes(lead))) fail('소개 쪽 보낸 글 = 내 말 + 소개 글', `${tag} 「${d.text}」`);
        noGainPayload(d, tag); bump('보낸 것');
      }
    }
    errsOf(p, tag);
  } finally { await done(p); }
  // 편지 쪽 — 봉인 소식 · 초대장 · 사장님 새 초대장(편지 서버는 가짜 — 시험 서버 기록을 건드리지 않음)
  tag = `${W_}×${H_} 편지 /letter.html`; p = await newPage(W_, H_, {letter: true});
  try {
    await p.goto(base + '/letter.html', {waitUntil: 'domcontentloaded'});
    const entries = [
      ['봉인 소식', () => p.locator('button', {hasText: '봉인 소식'}).first(), base + '/letter.html', '편지를 봉인했어요'],
      ['초대장', () => p.locator('.tickets button.tk').first(), base + '/letter.html#join=AbCdEfGhIjKlMn01', '초대해요'],
      ['사장님 새 초대장', async () => { await p.locator('button', {hasText: '초대장 5장 만들기'}).click(); return p.locator('.codes button.tk').first(); }, base + '/letter.html#join=NewCode000000001', '초대해요']];
    let n = 0;
    for (const [nm, get, url, leadPart] of entries) {
      const t2 = tag + ' ' + nm;
      let b; try { b = await get(); await b.waitFor({timeout: 15000}); } catch { fail('편지 쪽 보내기 단추 없음', t2); continue; }
      if (!(await openBox(p, () => b.click(), t2))) continue;
      await sendQuick(p, 0, t2); n++;
      const d = await waitShared(p, n, t2);
      if (d) { if (d.url !== url) fail('편지 쪽 보낸 주소', `${t2} 「${d.url}」`); if (!String(d.text ?? '').startsWith(QUICK[0]) || !d.text.includes(leadPart)) fail('편지 쪽 보낸 글 = 내 말 + 편지 글', `${t2} 「${d.text}」`); noGainPayload(d, t2); bump('보낸 것'); }
      try { await p.waitForSelector(DLG, {state: 'detached', timeout: 4000}); } catch { fail('보낸 뒤 글상자가 안 닫힘', t2); }
    }
    errsOf(p, tag);
  } finally { await done(p); }
}

/* ⑥ 친구가 연 주소 */
const READL = () => {
  const v = document.querySelector('#view'), land = v?.querySelector('.ps-land'); if (!land) return {land: false, head: v?.querySelector('h1')?.textContent ?? null};
  const vs = [...land.querySelectorAll('.ps-v')].map(x => ({k: x.querySelector('.ps-vk')?.textContent ?? '', n: x.querySelector('.ps-vn')?.textContent ?? '', q: x.querySelector('.ps-q')?.textContent ?? null, cls: x.querySelector('.ps-vn')?.className ?? ''}));
  const why = v.querySelector('.ps-why .wy'), after = v.querySelector('.ps-after');
  return {land: true, kick: land.querySelector('.ps-kick')?.textContent ?? '', name: land.querySelector('.ps-name')?.textContent ?? '', vs, cmp: land.querySelector('.ps-cmp')?.textContent ?? '',
    line: !!land.querySelector('svg .ps-ln'), dot: !!land.querySelector('svg .ps-sent'), why: !!why, whyFirst: !!(why && after && (why.compareDocumentPosition(after) & Node.DOCUMENT_POSITION_FOLLOWING)),
    lock: !!v.querySelector('.ps-lock'), said: v.querySelector('.ps-said')?.textContent ?? null, askq: v.querySelector('.ps-askq')?.textContent ?? null, mine: v.querySelector('.ps-mine')?.textContent ?? null,
    askline: v.querySelector('.ps-askline')?.textContent ?? null, afterText: after?.textContent ?? '', safe: v.querySelector('.ps-safe')?.textContent ?? null, body: document.body.innerText,
    saidLang: v.querySelector('.ps-said [data-proper]')?.getAttribute('lang') ?? null, mineLang: v.querySelector('.ps-mine [data-proper]')?.getAttribute('lang') ?? null};
};
/** 왜 사? 칸을 끝까지(첫 답 · 다음 · 두 줄 · 결과 보기) — 모양은 그 칸 검사(check_why)가 봄 */
async function finishWhy(p, why, tag) {
  for (let k = 0; k < 40; k++) {
    const st = await p.evaluate(() => {
      const c = document.querySelector('#view .ps-why .wy'); if (!c) return 'none';
      if (!document.querySelector('#view .ps-lock')) return 'open';
      if (c.querySelector('.wy-res')) return 'res';
      if (c.querySelector('.wy-why')) return 'lines';
      if (c.querySelector('.wy-opt')) return c.querySelector('.wy-opt[aria-pressed="true"]') ? 'next' : 'pick';
      return 'wait';
    });
    if (st === 'open') return true;
    if (st === 'none' || st === 'res') break;
    if (st === 'wait') { await p.waitForTimeout(150); continue; }
    if (st === 'pick') await p.locator('#view .ps-why .wy-opt').first().click();
    else if (st === 'next') await p.locator('#view .ps-why .wy-next').first().click();
    else {
      await p.locator('#view .ps-why .wy-why').fill(why);
      for (const [c, v] of [['.wy-sell', '1000'], ['.wy-half', '2000']]) { const x = p.locator('#view .ps-why ' + c); if ((await x.count()) && !(await x.inputValue())) await x.fill(v); }
      await p.locator('#view .ps-why .wy-next').last().click();
    }
    await p.waitForTimeout(60);
  }
  try { await p.waitForFunction(() => !document.querySelector('#view .ps-lock'), null, {timeout: 4000}); return true; } catch { fail('질문을 다 답했는데 보낸 말이 안 열림', tag); return false; }
}
async function landing(W_, H_, cases) {
  for (const C of cases) {
    const tag = `${W_}×${H_} 친구 주소 ${C.name}`, p = await newPage(W_, H_);
    try {
      const hash = '#/s/' + C.code + '/' + C.day + '/' + C.price + (C.kind ? '/' + C.kind : '') + (C.msg != null ? '/' + C.msg : '');
      await p.goto(base + NEXT + hash, {waitUntil: 'domcontentloaded'});
      try { await p.waitForFunction(() => !!document.querySelector('#view .ps-land, #view .ps-name') && !document.querySelector('#view .boot'), null, {timeout: 30000}); } catch { fail('친구 주소가 안 열림(#/s/ 길)', tag); continue; }
      let s = await p.evaluate(READL);
      if (C.bad) { if (!/주소가 이상해요/.test(s.head ?? s.name ?? '')) fail('이상한 주소 알림', `${tag} 「${s.head ?? s.name}」`); bump('친구 주소'); errsOf(p, tag); continue; }
      if (!s.land) { fail('친구 주소 칸 없음', tag); continue; }
      const sent = s.vs.find(x => x.k === SENT_LBL), now = s.vs.find(x => x.k === NOW_LBL);
      if (!sent || !now) fail('「보낸 날 값」 · 「오늘 값」 이름(원문)', `${tag} ${JSON.stringify(s.vs.map(x => x.k))}`);
      if (sent && sent.n !== num(C.price) + '원') fail('보낸 날 값', `${tag} 「${sent.n}」 ≠ ${num(C.price)}원`);
      if (now && now.n !== num(CO.c.price) + '원') fail('오늘 값(자료 co.c.price)', `${tag} 「${now.n}」 ≠ ${num(CO.c.price)}원`);
      const dir = CO.c.price > C.price ? 'up' : CO.c.price < C.price ? 'dn' : 'fl';
      if (now && !now.cls.split(/\s+/).includes(dir)) fail('오늘 값 색(빨강 오름 · 파랑 내림)', `${tag} ${now.cls} · 기대 ${dir}`);
      if ((C.price !== Math.round(closeAt(C.day))) !== !!sent?.q) fail('기록과 다른 값 「?」', `${tag} ${sent?.q}`);
      if (!s.line || !s.dot) fail('그림(선 · 보낸 날 금빛 점)', `${tag} 선 ${s.line} 점 ${s.dot}`);
      if (!s.why || !s.whyFirst || !s.lock) fail('질문이 먼저가 아님', `${tag} 질문 ${s.why} 먼저 ${s.whyFirst} 잠김 ${s.lock}`);
      if (s.safe !== SAFE_LINE) fail('안전 문장', `${tag} 「${s.safe}」`);
      if (C.kind === 'a' && !(s.askline ?? '').includes(ASK_Q)) fail('같이 따져 줘 물음이 처음에 없음', `${tag} 「${s.askline}」`);
      if (C.text && s.body.includes(C.text)) fail('다 답하기 전에 보낸 말이 화면에 보임', tag);
      await layout(p, '#view', tag + ' 처음');
      if (!(await finishWhy(p, C.why ?? '이익이 줄어서', tag))) continue;
      s = await p.evaluate(READL);
      if (C.text != null && !C.hide) { if (s.said !== '「' + C.text + '」') fail('다 답한 뒤 보낸 말', `${tag} 「${s.said}」 ≠ 「${C.text}」`); if (/[가-힣]/.test(C.text) && s.saidLang !== 'ko') fail('보낸 말(쓴 사람 글)에 lang="ko" 없음', `${tag} ${s.saidLang}`); }
      if (C.hide) { if (s.said != null || (C.text && s.body.includes(C.text))) fail('거르는 말 · 깨진 말을 보여 줌', `${tag} 「${s.said}」`); if (!new RegExp(C.hide).test(s.afterText)) fail('못 보여 주는 까닭', `${tag} 「${s.afterText.slice(0, 80)}」`); }
      if (C.kind === 'a') {
        if (s.askq !== ASK_Q) fail('같이 따져 줘 「반토막 난다면 왜일까?」', `${tag} 「${s.askq}」`);
        if (!(s.mine ?? '').includes(C.why ?? '이익이 줄어서')) fail('같이 따져 줘 — 내 생각(두 줄 ① 답)', `${tag} 「${s.mine}」`);
        if (s.mineLang !== 'ko') fail('내 생각(쓴 사람 글)에 lang="ko" 없음', `${tag} ${s.mineLang}`);
      }
      await layout(p, '#view', tag + ' 다 답한 뒤');
      bump('친구 주소');
      errsOf(p, tag);
    } finally { await done(p); }
  }
}

const MSG = '이거 어때? 같이 보자';
const CASES = [
  {name: '보내기', code: CODE, day: SENT_DAY, price: SENT_PRICE, kind: 's', msg: b64(MSG), text: MSG},
  {name: '같이 따져 줘', code: CODE, day: SENT_DAY, price: SENT_PRICE, kind: 'a', msg: b64('같이 따져 줘'), text: '같이 따져 줘', why: '파는 물건이 덜 팔려서'},
  {name: '기록과 다른 값', code: CODE, day: SENT_DAY, price: SENT_PRICE + 1000, kind: 's', msg: b64('나는 이렇게 봤어'), text: '나는 이렇게 봤어'},
  {name: '거르는 말이 든 주소', code: CODE, day: SENT_DAY, price: SENT_PRICE, kind: 's', msg: b64('지금 사세요'), text: '지금 사세요', hide: '거르는 말'},
  {name: '깨진 말', code: CODE, day: SENT_DAY, price: SENT_PRICE, kind: 's', msg: 'A', hide: '깨져서'},
  {name: '이상한 주소', code: 'ABC', day: SENT_DAY, price: SENT_PRICE, bad: true},
];
const SIZES = [[360, 640], [390, 844]];
const step = async (tag, f) => { try { await f(); } catch (e) { fail('검사 길이 멈춤', tag + ' · ' + String(e?.message ?? e).split('\n')[0]); } };
for (const [w, h] of SIZES) {
  const full = ALL || w === 360;
  await step(`${w}×${h} 회사 글상자`, () => companyBox(w, h, full));
  if (full) { await step(`${w}×${h} 복사 · 보여 줌`, () => fallbacks(w, h)); await step(`${w}×${h} 대화창 없는 기계`, () => noDialogBox(w, h)); await step(`${w}×${h} 영어`, () => englishBox(w, h)); await step(`${w}×${h} 다른 입구`, () => otherEntries(w, h)); }
  await step(`${w}×${h} 친구 주소`, () => landing(w, h, full ? CASES : CASES.slice(0, 1)));
}
await browser.close();
const secs = Math.round((Date.now() - t0) / 1000);
const out = {schema: 'godori-check-share-1', at: new Date().toISOString(), base, path: NEXT, all: ALL, code: CODE, secs, counts, fails, ok: !fails.length,
  entries: ['회사 보내기', '회사 ' + ASK_BTN, '시황 보내기', '소개 쪽 친구에게 보내기', '편지 봉인 소식', '편지 초대장', '편지 사장님 새 초대장'], name: NEW_NAME};
if (OUT) { await fs.mkdir(path.dirname(path.resolve(OUT)), {recursive: true}); await fs.writeFile(OUT, JSON.stringify(out, null, 1)); }
console.log(`보내기 검사 · ${secs}초 · ${JSON.stringify(counts)}`);
for (const [k, x] of fails.slice(0, 40)) console.log('✗ ' + k + ' — ' + x);
if (MUT) { const miss = MUTS[MUT][1].filter(k => !fails.some(f => f[0] === k)); if (miss.length) { console.log('✗ 검사 자체 시험 — 망가뜨렸는데 못 잡음: ' + miss.join(' · ')); process.exit(1); } console.log(`검사 자체 시험 「${MUT}」 — 잡음(실패 ${fails.length}개 · 기대한 것 모두)`); process.exit(0); }
if (fails.length) process.exit(1);
console.log('실패 0');
