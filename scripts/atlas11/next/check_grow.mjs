// 6단 「앞으로 클까?」 옛 쪽(/atlas/#/c/<번호>/grow) ↔ 새 쪽(/next/?dev=1#/w/<번호>/grow) 맞대기
//   사장님 2026-10-17(싱가포르) 04:04 「첫화면 부터 마지막 페이지 까지 모두 바꿔」 · 04:23 「정말 빠르면서도 정밀하게 · 에이전트 총 동원해」 · 규칙 74
//   쓰는 법: node scripts/atlas11/next/check_grow.mjs --base http://127.0.0.1:8826 [--all | --limit N | --codes a,b] [--wide N] [--pw /opt/node-tools/ · 또는 PW_DIR] [--out 결과.json]
//     기본 = 고른 곳(이야기 있는 곳) 모두 + 매출 없는 곳 + 그 밖 회사 → 220곳 · --all = 모든 회사 · --limit N = 앞 N곳 · --wide N = 세 폭(320 · 360 · 390)으로 볼 회사 수(기본 10)
//   ① 회사마다 옛 쪽 글 낱낱(제목 · 단 표시 · 눈금 · 범례 · 출처 · 해마다 칸 · 이야기가 틀리게 될 때 · 다르게 보면 · 접은 칸 · 메모 · 다음 단 · 자료 줄)이 새 쪽에 그대로(접은 칸 글 포함)
//   ② 숫자 낱말(배 · % · 곳 · 개 · 년 · 월 · 일 · 「?」) — 옛 쪽 수만큼 새 쪽에도
//   ③ 그림 — 읽기 이름(aria-label) · 눈금 글 · 칸마다 손가락 이름표가 옛 쪽과 같음 · 붙은 뒤 실제 넓이로 그림
//   ④ 기사 고리 — 주소 · 글 같음 · 새 창(noopener) · 말 등급 칸 · 「작게 봄」 수 · ! ? 표
//   ⑤ 자료에서 따로 셈(앱 코드를 쓰지 않음) — 1 · 3 · 5 · 10년 가운데 · 범위 · 말 등급 · 「작게 봄」 · 기사 수 · 「조사 전」 · 「따로 다시 확인」 줄
//   ⑥ 챕터 일곱(6 = 지금 단) · 다음 챕터 · 안전 문장 · 쓰지 않을 말 0(남의 글 data-proper 빼고) · 화면 오류 0 · 가로 넘침 0 · 누르는 자리 44px
//   ⑦ 둘레 — 근거가 오래됨 · 근거 날짜 모름 · 자료 모자람 · 받는 중 값(provisional) · 없는 주소 · 회사 파일 · comp.json 못 받음
//   실패가 하나라도 있으면 끝 코드 1
import fs from 'node:fs/promises';
import path from 'node:path';
import {createRequire} from 'node:module';
import {fileURLToPath} from 'node:url';
import {oldToNewDeep} from './rename.mjs'; // 이름 바꾸기(2026-10-17 아틀란스 → 보드리)
import {fetchJSON, watch, settle, timer, netSummary} from './net.mjs'; // 망 탈에만 다시 받기 · 다시 열기 · 옛 쪽 · 새 쪽 시간(2026-10-17 고도리 명령문 [1] 8 · 9)
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../..');
const argv = process.argv.slice(2), has = k => argv.includes(k), arg = (k, d) => { const i = argv.indexOf(k); return i >= 0 && argv[i + 1] != null ? argv[i + 1] : d; };
const require = createRequire(arg('--pw', process.env.PW_DIR || '/opt/node-tools/')); // run_all.mjs 는 PW_DIR 로 넘김
const {chromium} = require('playwright');
const base = arg('--base', 'http://127.0.0.1:8826').replace(/\/$/, ''), ALL = has('--all'), LIMIT = Number(arg('--limit', '0')) || 0, WIDE = Number(arg('--wide', '10')) || 0, OUT = arg('--out', '');
const fails = [], counts = {}, t0 = Date.now(), tm = timer(t0);
const fail = (k, x) => { if (fails.length < 500) fails.push([k, String(x).slice(0, 300)]); counts.fail = (counts.fail || 0) + 1; };
const bump = (k, n = 1) => { counts[k] = (counts[k] || 0) + n; };

/* 따로 셈 — 앱 코드를 쓰지 않음 */
const XM = m => (m == null ? '?' : (Math.round(m * 10 + 1e-9) / 10).toFixed(1) + '배');
const HZ = [['1', 2027], ['3', 2029], ['5', 2031], ['10', 2036]];
const NORM = s => String(s ?? '').replace(/[\s ]+/g, ' ').trim();
const getJ = f => fetchJSON(base + '/atlas/data/' + f, f); // 망 탈(끊김 · 429 · 5xx)에만 기다렸다 다시 · 404 는 바로 실패(net.mjs)
const [core, mkt, comp] = await Promise.all(['core.json', 'mkt.json', 'comp.json'].map(f => getJ(f).catch(e => { fail('자료', e.message); return null; })));
if (!core || !mkt || !comp) { console.error('자료를 못 받음'); process.exit(1); }
const CO = mkt.companies, PK = comp.companies;
const pickName = `${core.rules?.name ?? '고른'} ${core.funnel?.picked ?? '?'}곳`;
const storyNone = pk => (pk ? '? 세 팀 이야기는 아직 없습니다 — 멍거 · 린치 조건에 새로 든 회사는 사람이 조사해 새 기록 파일로 채웁니다(정해진 날 없음). 지금은 숫자만 보입니다.'
  : `? 세 팀 이야기는 조사 전입니다 — 이야기는 ${pickName}만 사람이 조사해 씁니다. 이 회사는 숫자만 보입니다.`);
// 쓰지 않을 말(next_check.mjs 와 같은 목록 + 지운 36곳 화면 글 — inspect4.mjs OLD36_TEXT 를 읽어 그대로)
const OLD36 = JSON.parse((/export const OLD36_TEXT = (\[[^\]]*\]);/.exec(await fs.readFile(path.join(ROOT, 'scripts/atlas11/t365/inspect4.mjs'), 'utf8').catch(() => '')) || [, '[]'])[1].replace(/'/g, '"'));
if (!OLD36.length) fail('OLD36_TEXT 를 못 읽음', 'scripts/atlas11/t365/inspect4.mjs');
const BANNED = ['추천', '매수', '매도', '팔라', '사세요', '파세요', '예측', '확률', '유망', '기회', '신호', '저평가', '1위', 'TOP', ...OLD36];

/* 회사 차례 — 고른 곳(이야기) → 매출 없는 곳(그림 못 그림) → 그 밖 번호 차례 */
const coFile = new Map();
const needCo = async code => { if (!coFile.has(code)) coFile.set(code, await getJ('co/' + encodeURIComponent(code) + '.json').catch(() => null)); return coFile.get(code); };
const picked = Object.keys(PK), others = Object.keys(CO).filter(c => !PK[c]).sort();
let noBase = [];
try { // 고르기 힌트만(기대값은 늘 --base 에서 받은 파일로 셈) — 저장소 사본에서 매출 없는 회사를 찾음
  const dir = path.join(ROOT, 'site/atlas/data/co');
  for (const f of (await fs.readdir(dir)).filter(f => f.endsWith('.json'))) { const c = f.slice(0, -5); if (!CO[c] || PK[c]) continue; const j = JSON.parse(await fs.readFile(path.join(dir, f), 'utf8')); if (!j?.grow?.baseRev) noBase.push(c); }
} catch { noBase = []; }
const order = [...picked, ...noBase.sort(), ...others.filter(c => !noBase.includes(c))];
let list = ALL ? order : order.slice(0, 220);
if (LIMIT) list = list.slice(0, LIMIT);
if (arg('--codes', '')) list = arg('--codes', '').split(',').map(s => s.trim()).filter(Boolean); // 고칠 때 몇 곳만(예: --codes 005930,278470)

/* 브라우저 */
const exe = '/opt/pw-browsers/chromium', b = await chromium.launch((await fs.stat(exe).catch(() => null)) ? {executablePath: exe} : {});
async function mkPage(ctx) { const p = await ctx.newPage(); p._errs = []; p.on('pageerror', e => p._errs.push(e.message)); p.on('console', m => { if (m.type() === 'error') p._errs.push(m.text()); }); return p; }
const ctxOf = (width, height = 844) => b.newContext({viewport: {width, height}, deviceScaleFactor: 1, hasTouch: true});
const raf2 = p => p.evaluate(() => new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r))));
//   망 탈(이 사이트 요청 끊김 · 429 · 5xx · 15초 넘게 답 없음)이 있었던 열기는 믿지 않고 새로 고쳐 다시(net.mjs settle) — 망 탈 없이 못 그리면 앞과 같음 · 여는 데 쓴 때를 쪽마다 셈(tm)
async function openOld(p, code, title, first) {
  const ok = await tm.old(() => settle(p, async () => {
    if (first || !p.url().startsWith(base + '/atlas/')) await p.goto(base + '/atlas/#/c/' + code + '/grow'); else await p.evaluate(h => { location.hash = h; }, '#/c/' + code + '/grow');
    return p.waitForFunction(t => { const v = document.querySelector('#view'); return v && !v.querySelector('.boot') && v.querySelector('h1')?.textContent === t; }, title, {timeout: 15000}).then(() => true).catch(() => false);
  }, {what: '옛 쪽 ' + code, fail}));
  if (ok) await tm.old(() => raf2(p));
  return !!ok;
}
async function openNew(p, code, title, first) {
  const ok = await tm.new(() => settle(p, async () => {
    if (first || !p.url().startsWith(base + '/next/')) await p.goto(base + '/next/?dev=1#/w/' + code + '/grow'); else await p.evaluate(h => { location.hash = h; }, '#/w/' + code + '/grow');
    return p.waitForFunction(t => { const v = document.querySelector('main#view'); return v && !v.querySelector('.boot') && v.querySelector('h1')?.textContent === t; }, title, {timeout: 15000}).then(() => true).catch(() => false);
  }, {what: '새 쪽 ' + code, fail}));
  if (ok) await tm.new(() => raf2(p));
  return !!ok;
}
/* 옛 쪽 — 글 낱낱 · 숫자 · 그림 · 고리(옛 7단 줄 · 맨 아래 고리 줄 · 투자 상담 글(새 쪽은 안전 문장) · 꾸밈 그림은 뺌) */
const OLD_X = () => {
  const v = document.querySelector('#view .vw') || document.querySelector('#view'), N = s => String(s ?? '').replace(/[\s ]+/g, ' ').trim();
  const q = s => [...v.querySelectorAll(s)], units = [], add = (k, els) => { for (const e of els) { const t = N(e.textContent); if (t) units.push([k, t]); } };
  const disc = p => /^저는 투자 상담사가 아닙니다/.test(N(p.textContent));
  add('제목', q('.co-head h1')); add('제목 밑', q('.co-head small')); add('단 표시', q('.st-t'));
  add('눈금', q('.gc .yr span')); add('그림 밑', q('.gc .ax span')); add('그림 못 그림', q('.gc p.q')); add('범례', q('.lkey > span')); add('출처', q('p.src'));
  add('물음표 줄', q(':scope > p.q, :scope > p.note')); add('칸 제목', q('h2.sec')); add('해마다 칸', q('ol.yrs > li > p'));
  add('이야기가 틀리게 될 때', q('.box h2, .box ul.chk > li')); add('다르게 보면', q('p.alt'));
  add('접은 칸', q('details.more > summary, details.more .in ul.chk > li, details.more .in > p, details.more .in ol > li'));
  add('메모', q('div.note > p')); add('다음 단', q('.nextst b, .nextst > span > span'));
  add('자료 줄', q('footer.foot > p').filter(p => !p.classList.contains('links') && !disc(p)));
  const cl = v.cloneNode(true); cl.querySelectorAll('nav.steps, .foot-mo, footer.foot p.links, .tip, .boot, .nextst .chev').forEach(e => e.remove());
  [...cl.querySelectorAll('footer.foot > p')].filter(disc).forEach(p => p.remove());
  const svg = v.querySelector('.gc svg[role=img]'), tw = document.createTreeWalker(cl, NodeFilter.SHOW_TEXT), sp = []; for (let t; (t = tw.nextNode());) sp.push(t.textContent);
  return {units, all: N(cl.textContent), sp: N(sp.join(' ')), aria: svg?.getAttribute('aria-label') ?? null, ticks: q('.gc .yr span').map(e => N(e.textContent)),
    chips: q('.gchip').map(e => e.className.replace('gchip', '').trim() + ':' + N(e.textContent)), below: q('ol.yrs .yg').filter(p => N(p.textContent).startsWith('! ')).length,
    marks: q('.box ul.chk .m').map(e => e.textContent), teams: q('details.more .in ul.chk .m').map(e => e.textContent), links: q('details.more .in ol a').map(a => a.getAttribute('href') + ' ' + N(a.textContent)), h1: N(v.querySelector('h1')?.textContent)};
};
const NEW_X = () => {
  const v = document.querySelector('main#view'), N = s => String(s ?? '').replace(/[\s ]+/g, ' ').trim(), q = s => [...v.querySelectorAll(s)];
  const svg = v.querySelector('.pgrow-gc svg[role=img]'), host = v.querySelector('.pgrow-host'), tw = document.createTreeWalker(v, NodeFilter.SHOW_TEXT), sp = []; for (let t; (t = tw.nextNode());) sp.push(t.textContent);
  return {all: N(v.textContent), sp: N(sp.join(' ')), aria: svg?.getAttribute('aria-label') ?? null, ticks: q('.pgrow-yr span').map(e => N(e.textContent)),
    chips: q('.pgrow-chip').map(e => e.className.replace('pgrow-chip', '').trim() + ':' + N(e.textContent)), below: q('.pgrow-below').length,
    marks: q('.pgrow-box .pgrow-m').map(e => e.textContent), teams: q('details.pgrow-more .pgrow-in ul.pgrow-chk .pgrow-m').map(e => e.textContent),
    links: q('.pgrow-facts a').map(a => a.getAttribute('href') + ' ' + N(a.textContent)), linkNew: q('.pgrow-facts a').every(a => a.target === '_blank' && /noopener/.test(a.rel)),
    h1: N(v.querySelector('h1')?.textContent), title: document.title, props: q('[data-proper]').map(e => N(e.textContent)).filter(Boolean),
    chaps: q('.chaps .cp').map(e => [e.tagName, e.getAttribute('href'), e.classList.contains('now') ? 'now' : '', e.getAttribute('aria-current') || '']),
    next: q('a.chap-next').map(a => a.getAttribute('href')), safe: q('p.safe').length,
    drawn: svg && host ? [svg.viewBox.baseVal.width, Math.max(260, host.clientWidth)] : null,
    sw: document.documentElement.scrollWidth, vw: document.documentElement.clientWidth};
};
/** 손가락 이름표 — 칸마다 가운데에 pointermove(옛 쪽 · 새 쪽 같은 셈: x = 4 + (j + ½)(W − 4 − 오른쪽 칸) ÷ n) */
const TIPS = ([sel, tipSel, n]) => {
  const svg = document.querySelector(sel); if (!svg) return null;
  const tip = svg.parentElement.querySelector(tipSel), r = svg.getBoundingClientRect(), W = svg.viewBox.baseVal.width, padR = Math.round((parseFloat(getComputedStyle(document.documentElement).fontSize) || 21) * 3.05), out = [];
  for (let j = 0; j < n; j++) { const x = 4 + (j + 0.5) * (W - 4 - padR) / n; svg.dispatchEvent(new PointerEvent('pointermove', {clientX: r.left + x * r.width / W, clientY: r.top + r.height / 2, bubbles: true})); out.push(tip?.hidden ? '(숨음)' : tip?.textContent); }
  svg.dispatchEvent(new PointerEvent('pointerleave', {bubbles: true}));
  return out;
};
// 숫자 낱말 — 「2.3배쯤」 「245개」 「10월 14일」 「?」 …
const TOK = /\?|[−+]?\d[\d,]*(?:\.\d+)?(?:배쯤|배|%|곳|개|년|월|일|번|거래일)?/g;
const tokCount = s => { const m = new Map(); for (const t of s.match(TOK) || []) m.set(t, (m.get(t) || 0) + 1); return m; };
function nSlots(G) { if (!G?.baseRev) return 0; const act = G.years.filter(y => !y.endsWith('E')).length, ek = G.years.findIndex(y => y.endsWith('E')); return act + (ek >= 0 && G.rev[ek] != null ? 1 : 0) + (G.story ? 4 : 0); }
const bannedIn = (all, props) => { const t = props.reduce((a, p) => a.split(p).join(' '), all); return BANNED.filter(w => t.includes(w)); };

/** 한 회사 맞대기 — o = 옛 쪽 뽑기 · n = 새 쪽 뽑기 */
function compare(tag, code, o, n, data) {
  const {G, pk, name} = data, S = G?.story;
  for (const [k, t] of o.units) if (!n.all.includes(t)) fail('옛 글이 새 쪽에 없음 · ' + k, tag + ' 「' + t.slice(0, 90) + '」');
  const ot = tokCount(o.sp), nt = tokCount(n.sp); // 글 마디 사이를 띄워 셈(마디가 붙어 「11.7」처럼 잘못 읽히지 않게)
  for (const [t, c] of ot) if ((nt.get(t) || 0) < c) fail('숫자 낱말 모자람', `${tag} 「${t}」 옛 ${c} · 새 ${nt.get(t) || 0}`);
  bump('맞댄 글 낱낱', o.units.length); bump('맞댄 숫자 낱말', [...ot.values()].reduce((a, x) => a + x, 0));
  if (o.aria !== n.aria) fail('그림 읽기 이름', `${tag} 옛 「${String(o.aria).slice(0, 80)}」 · 새 「${String(n.aria).slice(0, 80)}」`);
  if (JSON.stringify(o.ticks) !== JSON.stringify(n.ticks)) fail('그림 눈금 글', `${tag} ${o.ticks} ≠ ${n.ticks}`);
  if (JSON.stringify(o.chips) !== JSON.stringify(n.chips)) fail('말 등급 칸', `${tag} ${o.chips} ≠ ${n.chips}`);
  if (o.below !== n.below) fail('「작게 봄」 수', `${tag} 옛 ${o.below} · 새 ${n.below}`);
  if (JSON.stringify(o.marks) !== JSON.stringify(n.marks)) fail('! ? 표', `${tag} ${o.marks} ≠ ${n.marks}`);
  if (JSON.stringify(o.teams) !== JSON.stringify(n.teams)) fail('세 팀 표', `${tag} ${o.teams} ≠ ${n.teams}`);
  if (JSON.stringify(o.links) !== JSON.stringify(n.links)) fail('기사 고리', `${tag} 옛 ${o.links.length} · 새 ${n.links.length}`);
  if (!n.linkNew) fail('기사 고리 새 창', tag);
  if (o.h1 !== n.h1) fail('제목', `${tag} ${o.h1} ≠ ${n.h1}`);
  // ⑤ 자료에서 따로 셈
  const title = name + ' — 앞으로 클까?';
  if (n.h1 !== title) fail('제목(자료)', `${tag} ${n.h1} ≠ ${title}`);
  if (!n.title.startsWith(title)) fail('창 제목', `${tag} ${n.title}`);
  if (G && S) {
    const ek = G.years.findIndex(y => y.endsWith('E')), er = ek >= 0 && G.rev[ek] && G.baseRev ? G.rev[ek] / G.baseRev : null, BY = G.baseYear ?? '?';
    let below = 0;
    for (const [k, y] of HZ) { const x = S.h[k];
      const want = [`${k}년 뒤 · ${y}년`, x && x.mid != null ? `${XM(x.mid)}쯤 (${XM(x.lo)} ~ ${XM(x.hi)})` : '? 자료 모자람', x?.g ? `${BY}년보다 커져 있을까요? ${x.g}` : null, x?.t ? NORM(x.t) : null].filter(Boolean);
      for (const w of want) if (!n.all.includes(w)) fail('해마다 칸(자료)', `${tag} ${k}년 「${w.slice(0, 60)}」`);
      if (x && x.mid != null && er != null && x.mid < er) { below++; if (!n.all.includes(`올해 증권사 평균치(${XM(er)} · 남의 짐작)보다 작게 봄`)) fail('작게 봄 글(자료)', `${tag} ${k}년`); }
    }
    if (n.below !== below) fail('「작게 봄」 수(자료)', `${tag} 새 ${n.below} · 자료 ${below}`);
    if (!n.all.includes(`왜 이렇게 봤나요? — 세 팀 한 줄 · 근거 기사 ${(S.facts || []).length}개`)) fail('기사 수(자료)', tag);
    if (n.links.length !== (S.facts || []).length) fail('기사 고리 수(자료)', `${tag} ${n.links.length} ≠ ${(S.facts || []).length}`);
    if (!n.all.includes('범위는 「100번 중 80번쯤 이 안」으로 잡은 세 팀의 따짐이며, 맞힘이 아닙니다.')) fail('맞힘 아님 글', tag);
    bump('이야기 있는 회사');
  } else if (G) {
    if (!n.all.includes(NORM(storyNone(pk)))) fail('「조사 전」 · 「아직 없음」 글(자료)', tag);
    if (G.baseRev && !n.aria) fail('그림 없음', tag);
    if (!G.baseRev && !n.all.includes('? 마지막 결산 매출이 없어 그림을 못 그립니다')) fail('매출 없음 「?」', tag);
  }
  const wantCheck = !!G && !!core.grow?.check && (pk || !!S);
  if (n.all.includes('따로 다시 확인(') !== wantCheck) fail('따로 다시 확인 줄(자료)', `${tag} 있어야 ${wantCheck}`);
  // ⑥ 챕터 · 다음 챕터 · 안전 문장 · 쓰지 않을 말 · 넘침
  const want7 = ['#/w/' + code, '#/w/' + code + '/past', '#/w/' + code + '/rivals', '#/w/' + code + '/grow', '#/w/' + code + '/range'];
  if (n.chaps.length !== 7 || JSON.stringify(n.chaps.slice(2).map(x => x[1])) !== JSON.stringify(want7) || n.chaps[5][2] !== 'now' || n.chaps[5][3] !== 'page' || n.chaps.filter(x => x[2]).length !== 1) fail('챕터 일곱', `${tag} ${JSON.stringify(n.chaps).slice(0, 200)}`);
  if (!n.next.length || n.next.some(x => x !== '#/w/' + code + '/range') || n.next.length !== (S ? 2 : 1)) fail('다음 챕터', `${tag} ${n.next}`);
  if (n.safe !== 1) fail('안전 문장', tag);
  const bw = bannedIn(n.all, n.props); if (bw.length) fail('쓰지 않을 말', `${tag} ${bw.join(' · ')}`);
  if (n.sw > n.vw) fail('가로 넘침', `${tag} ${n.sw}>${n.vw}`);
  if (n.drawn && n.drawn[0] !== n.drawn[1]) fail('그림 넓이(붙은 뒤 다시 그림)', `${tag} ${n.drawn}`);
}
async function loadData(code) {
  const co = await needCo(code), pk = !!PK[code], c = pk ? PK[code] : co?.c;
  return {co, pk, G: co?.grow ?? null, name: c?.name ?? CO[code]?.n ?? '?'};
}
async function errsOf(p, tag, which) { if (p._errs.length) { (which === '새' ? fail : (k, x) => { bump('옛 쪽 오류(참고)'); })('화면 오류 · ' + which, tag + ' ' + p._errs.join(' | ').slice(0, 200)); p._errs.length = 0; } }

/* ①~⑥ 회사마다 — 390 폭 */
{
  const cO = await ctxOf(390), cN = await ctxOf(390), po = watch(await mkPage(cO), base), pn = watch(await mkPage(cN), base); // 옛 쪽 · 새 쪽은 창을 따로(한 창 두 탭이면 뒤 탭의 그림 때(rAF)가 늦춰짐) · 망 탈 셈(net.mjs)
  let firstO = true, firstN = true; // 첫 번째만 주소로 엶 · 그다음은 # 만 바꿈(빠르게)
  for (const code of list) {
    const d = await loadData(code); if (!d.co) { fail('회사 파일', code); continue; }
    if (!d.pk && !(d.co.c && d.co.line)) { // 회사 파일에 c · line 이 없으면 지금 아틀란스도 「없는 주소」(coEntry) — 새 쪽도 같은 글
      const okM = await openNew(pn, code, '없는 주소입니다', firstN); firstN = false;
      if (!okM) fail('없는 주소', code);
      else if (!(await pn.evaluate(() => document.querySelector('main#view').textContent)).replace(/[\s\u00a0]+/g, ' ').includes(`「${code}」는 지금 ${pickName}에 없습니다.`)) fail('없는 주소 글', code);
      bump('없는 주소'); continue;
    }
    const title = d.name + ' — 앞으로 클까?';
    const [ok1, ok2] = await Promise.all([openOld(po, code, title, firstO), openNew(pn, code, title, firstN)]); firstO = firstN = false;
    if (!ok1) { fail('옛 쪽 안 열림', code); continue; }
    if (!ok2) { fail('새 쪽 안 열림', code + ' ' + await pn.evaluate(() => document.querySelector('main#view')?.textContent?.slice(0, 80))); continue; }
    const [o, n] = await Promise.all([tm.old(() => po.evaluate(OLD_X).then(x => oldToNewDeep(x))), tm.new(() => pn.evaluate(NEW_X))]); // 옛 쪽 글은 이름만 새 이름으로(rename.mjs)
    compare('390 ' + code, code, o, n, d);
    const ns = nSlots(d.G);
    if (ns) {
      const [to, tn] = await Promise.all([tm.old(() => po.evaluate(TIPS, ['#view .gc svg[role=img]', '.tip', ns])), tm.new(() => pn.evaluate(TIPS, ['main#view .pgrow-gc svg[role=img]', '.pgrow-tip', ns]))]);
      if (JSON.stringify(to) !== JSON.stringify(tn)) fail('손가락 이름표', `${code} 옛 ${JSON.stringify(to).slice(0, 100)} · 새 ${JSON.stringify(tn).slice(0, 100)}`);
      bump('손가락 이름표', ns);
    }
    await errsOf(pn, code, '새'); await errsOf(po, code, '옛');
    bump('회사');
  }
  await cO.close(); await cN.close();
}

/* ⑥ 세 폭 — 넘침 · 누르는 자리 44px · 접은 칸 펼침 · 손가락 이름표가 화면 안 */
const SCAN = () => {
  const v = document.querySelector('main#view'), vw = document.documentElement.clientWidth, small = [], out = [];
  for (const e of v.querySelectorAll('a, button, summary')) { const r = e.getBoundingClientRect(); if (!r.width || !r.height || e.closest('[hidden]')) continue; if (r.height < 43.5 || r.width < 43.5) small.push(String(e.textContent).trim().slice(0, 24) + ' ' + Math.round(r.width) + '×' + Math.round(r.height)); }
  const clipped = e => { for (let a = e.parentElement; a && a !== v; a = a.parentElement) if (getComputedStyle(a).overflowX !== 'visible') return true; return false; }; // 옆으로 미는 줄(챕터 칩 줄 등) 안은 잘려 보임 — 화면 넘침 아님
  for (const e of v.querySelectorAll('*')) { const r = e.getBoundingClientRect(); if (r.width && (r.right > vw + 0.5 || r.left < -0.5) && !clipped(e)) out.push((e.className?.baseVal ?? e.className ?? e.tagName) + ' ' + Math.round(r.left) + '~' + Math.round(r.right)); }
  const tiny = [...v.querySelectorAll('*')].filter(e => e.childNodes.length && [...e.childNodes].some(x => x.nodeType === 3 && x.textContent.trim()) && parseFloat(getComputedStyle(e).fontSize) < 16.5 && e.getBoundingClientRect().width).map(e => e.className + ' ' + getComputedStyle(e).fontSize);
  return {sw: document.documentElement.scrollWidth, vw, small: small.slice(0, 6), out: out.slice(0, 6), tiny: tiny.slice(0, 6)};
};
/** 눈금 「1배」 글이 1배 점선 옆에 있는지(글씨 크기 zoom 에도) · 그림을 칸의 실제 넓이로 그렸는지 */
const AXIS = () => {
  const svg = document.querySelector('.pgrow-gc svg[role=img]'), host = document.querySelector('.pgrow-host'); if (!svg || !host) return null;
  const one = [...document.querySelectorAll('.pgrow-yr span')].find(e => e.textContent === '1배'), ln = svg.querySelector('line[stroke-dasharray="2 4"]');
  if (!one || !ln) return {d: 99, drawn: null};
  const a = one.getBoundingClientRect(), l = ln.getBoundingClientRect();
  return {d: Math.round(Math.abs((a.top + a.bottom) / 2 - (l.top + l.bottom) / 2) * 10) / 10, drawn: [svg.viewBox.baseVal.width, Math.max(260, host.clientWidth)]};
};
async function axisOk(p, tag) { const a = await p.evaluate(AXIS); if (!a) return; if (a.d > 3) fail('눈금 글 어긋남', `${tag} 「1배」 ${a.d}px`); if (a.drawn && a.drawn[0] !== a.drawn[1]) fail('그림 넓이', `${tag} ${a.drawn}`); }
if (WIDE) {
  // 세 폭으로 볼 곳 — 글이 가장 긴 이야기 · 이름이 가장 긴 회사 · 매출 없는 곳 · 고른 곳 밖 · 그다음 고른 곳
  const lenOf = async c => { const g = (await needCo(c))?.grow?.story; return g ? JSON.stringify([g.unknown, g.brk, g.h, g.teams]).length : 0; };
  const L = []; for (const c of picked) L.push([c, await lenOf(c)]); L.sort((a, b) => b[1] - a[1]);
  const longName = Object.keys(CO).sort((a, b) => CO[b].n.length - CO[a].n.length)[0];
  const wide = [...new Set([L[0]?.[0], longName, noBase[0], '005930', ...L.slice(1).map(x => x[0])].filter(Boolean))].slice(0, WIDE);
  for (const w of [320, 360, 390]) {
    const ctx = await ctxOf(w, 640), p = await mkPage(ctx); let first = true;
    for (const code of wide) {
      const d = await loadData(code), tag = w + ' ' + code;
      if (!await openNew(p, code, d.name + ' — 앞으로 클까?', first)) { fail('새 쪽 안 열림', tag); continue; } first = false;
      let s = await p.evaluate(SCAN);
      if (s.sw > s.vw || s.out.length) fail('가로 넘침', `${tag} ${s.sw}>${s.vw} ${s.out.join(' | ')}`);
      for (const x of s.small) fail('누르는 자리 44px 안 됨', `${tag} ${x}`);
      for (const x of s.tiny) fail('글 17px 밑', `${tag} ${x}`);
      if (await p.$('details.pgrow-more')) { await p.click('details.pgrow-more > summary'); await raf2(p); s = await p.evaluate(SCAN);
        if (s.sw > s.vw || s.out.length) fail('가로 넘침(접은 칸 폄)', `${tag} ${s.sw}>${s.vw} ${s.out.join(' | ')}`); for (const x of s.small) fail('누르는 자리 44px 안 됨(접은 칸 폄)', `${tag} ${x}`); }
      await axisOk(p, tag);
      if (wide.indexOf(code) < 3) { // 글씨 크기 「아주 크게」(app.css html.f3 · 화면 칸 zoom) — 그림을 다시 그리고 넘치지 않음
        await p.evaluate(() => document.documentElement.classList.add('f3')); await raf2(p); await p.waitForTimeout(80); await raf2(p);
        const z = await p.evaluate(SCAN); if (z.sw > z.vw || z.out.length) fail('가로 넘침(아주 크게)', `${tag} ${z.sw}>${z.vw} ${z.out.join(' | ')}`); for (const x of z.small) fail('누르는 자리 44px 안 됨(아주 크게)', `${tag} ${x}`);
        await axisOk(p, tag + ' 아주 크게');
        await p.evaluate(() => document.documentElement.classList.remove('f3')); await raf2(p); await p.waitForTimeout(80); await raf2(p);
        await axisOk(p, tag + ' 보통으로 돌아옴'); bump('아주 크게');
      }
      const ns = nSlots(d.G);
      if (ns) for (const j of [0, ns - 1]) { // 끝 칸 이름표가 그림 칸 밖 · 화면 밖으로 나가지 않음
        const r = await p.evaluate(([j, n]) => { const svg = document.querySelector('.pgrow-gc svg[role=img]'), tip = document.querySelector('.pgrow-tip'), R = svg.getBoundingClientRect(), W = svg.viewBox.baseVal.width, padR = Math.round(parseFloat(getComputedStyle(document.documentElement).fontSize) * 3.05), x = 4 + (j + 0.5) * (W - 4 - padR) / n;
          svg.dispatchEvent(new PointerEvent('pointermove', {clientX: R.left + x * R.width / W, clientY: R.top + 40, bubbles: true})); const t = tip.getBoundingClientRect(), g = svg.parentElement.getBoundingClientRect(); return {l: t.left, r: t.right, gl: g.left, gr: g.right, vw: document.documentElement.clientWidth, sw: document.documentElement.scrollWidth, hid: tip.hidden}; }, [j, ns]);
        if (r.hid || r.l < r.gl - 0.5 || r.r > r.gr + 0.5 || r.sw > r.vw) fail('손가락 이름표 넘침', `${tag} 칸 ${j} ${JSON.stringify(r)}`);
      }
      await errsOf(p, tag, '새');
      bump('세 폭 화면');
    }
    await ctx.close();
  }
}

/* ⑦ 둘레 — 자료를 바꿔치기해 옛 쪽 · 새 쪽을 같이 엶(드문 갈래 · 받는 중 값) · 새 쪽만 못 받은 파일 · 없는 주소 */
{
  const sc = picked.find(c => (coFile.get(c) ?? null)?.grow?.story) ?? picked[0], base0 = await needCo(sc);
  const variants = [
    ['근거가 오래됨', j => { for (const f of j.grow.story.facts) f.date = '2024-03-02'; }],
    ['근거 날짜 모름 · 못 찾은 것 없음 · 무너질 조건 없음', j => { for (const f of j.grow.story.facts) delete f.date; j.grow.story.unknown = '없음'; j.grow.story.brk = ''; }],
    ['자료 모자람 · 말 등급 없음 · 한 팀 없음', j => { const H = j.grow.story.h; H['10'].mid = null; delete H['5'].g; delete H['3'].t; delete j.grow.story.teams.apple; H['1'].mid = 0.5; }],
    ['올해 짐작 없음', j => { const ek = j.grow.years.findIndex(y => y.endsWith('E')); if (ek >= 0) j.grow.rev[ek] = null; }],
  ];
  const coreProv = JSON.stringify({...core, provisional: true});
  for (const [name, fx] of [...variants, ['받는 중 값(provisional)', null]]) {
    const cO = await ctxOf(390), cN = await ctxOf(390);
    for (const ctx of [cO, cN]) {
      if (fx) { const j = structuredClone(base0); fx(j); const body = JSON.stringify(j); await ctx.route('**/atlas/data/co/' + sc + '.json', r => r.fulfill({status: 200, contentType: 'application/json', body})); }
      else await ctx.route('**/atlas/data/core.json', r => r.fulfill({status: 200, contentType: 'application/json', body: coreProv}));
    }
    const po = await mkPage(cO), pn = await mkPage(cN), d0 = await loadData(sc), d = {...d0, G: fx ? (() => { const j = structuredClone(base0); fx(j); return j.grow; })() : d0.G};
    const title = d.name + ' — 앞으로 클까?';
    const [ok1, ok2] = await Promise.all([openOld(po, sc, title, true), openNew(pn, sc, title, true)]);
    if (!ok1 || !ok2) { fail('둘레 안 열림', name + ' ' + ok1 + ' ' + ok2); await cO.close(); await cN.close(); continue; }
    const [o, n] = await Promise.all([po.evaluate(OLD_X).then(x => oldToNewDeep(x)), pn.evaluate(NEW_X)]); // 옛 쪽 글은 이름만 새 이름으로(rename.mjs)
    compare('둘레 「' + name + '」 ' + sc, sc, o, n, d);
    const ns = nSlots(d.G), [to, tn] = await Promise.all([po.evaluate(TIPS, ['#view .gc svg[role=img]', '.tip', ns]), pn.evaluate(TIPS, ['main#view .pgrow-gc svg[role=img]', '.pgrow-tip', ns])]);
    if (JSON.stringify(to) !== JSON.stringify(tn)) fail('손가락 이름표(둘레)', `${name} 옛 ${JSON.stringify(to).slice(0, 100)} · 새 ${JSON.stringify(tn).slice(0, 100)}`);
    if (name.startsWith('받는 중') && !n.all.includes('값은 그날 저녁 8시 전에 받아 아직 바뀔 수 있습니다')) fail('받는 중 값 줄', sc);
    if (name === '근거가 오래됨' && !n.all.includes('근거 기사가 모두 1년 넘은 글입니다(가장 새 글 2024년 3월)')) fail('근거가 오래됨 줄', sc);
    if (name.startsWith('근거 날짜 모름') && !n.all.includes('근거 날짜 근거 기사의 날짜를 모릅니다.')) fail('근거 날짜 줄', sc);
    await errsOf(pn, '둘레 ' + name, '새');
    bump('둘레');
    await cO.close(); await cN.close();
  }
  // 새 쪽만 — 있는 회사의 파일을 못 받음 · comp.json 을 못 받음 · 없는 주소
  const edge = [['회사 파일 못 받음', '005930', '**/atlas/data/co/005930.json', '? 회사 자료를 받지 못했어요'], ['comp.json 못 받음', sc, '**/atlas/data/comp.json', '? 회사 자료를 받지 못했어요'],
    ['없는 주소(번호 꼴)', 'ZZZZZZ', null, `「ZZZZZZ」는 지금 ${pickName}에 없습니다. 찾기로 이름을 쳐 보세요.`], ['없는 주소(회사 아닌 종목)', Object.keys(CO).includes('005935') ? '0000A0' : '005935', null, '에 없습니다. 찾기로 이름을 쳐 보세요.']];
  for (const [name, code, pat, want] of edge) {
    const ctx = await ctxOf(360, 640); if (pat) await ctx.route(pat, r => r.fulfill({status: 404, body: 'no'}));
    const p = await mkPage(ctx); await p.goto(base + '/next/?dev=1#/w/' + code + '/grow');
    await p.waitForFunction(() => { const v = document.querySelector('main#view'); return v && !v.querySelector('.boot'); }, null, {timeout: 15000}).catch(() => {});
    await raf2(p);
    const r = await p.evaluate(() => ({t: document.querySelector('main#view').textContent.replace(/[\s ]+/g, ' '), sw: document.documentElement.scrollWidth, vw: document.documentElement.clientWidth, x: [...document.querySelectorAll('main#view a')].map(a => a.getAttribute('href'))}));
    if (!r.t.includes(want)) fail('둘레 「' + name + '」', r.t.slice(0, 120));
    if (name.startsWith('없는 주소(회사 아닌') && ![].concat(r.x ?? []).flatMap(x => String(x).split(',')).some(x => x === '#/x/' + code || x === '/atlas/#/x/' + code)) fail('밖 칸 고리', code + ' ' + r.x); // 밖 칸이 새 화면에 켜지면 #/x/ (2026-10-17)
    if (r.sw > r.vw) fail('가로 넘침', name);
    p._errs = p._errs.filter(e => !/404|Failed to load resource/.test(e)); // 일부러 막은 파일의 404 줄은 뺌
    await errsOf(p, '둘레 ' + name, '새');
    bump('둘레');
    await ctx.close();
  }
}
await b.close();
const res = {schema: 'atlas11-next-grow-check-1', at: new Date().toISOString(), base, asOf: mkt.asOf, companies: list.length, of: Object.keys(CO).length, all: ALL, limit: LIMIT || null, wide: WIDE,
  seconds: Math.round((Date.now() - t0) / 1000), time: tm.get(), net: netSummary(), counts, fails, ok: !fails.length};
if (OUT) { await fs.mkdir(path.dirname(path.resolve(OUT)), {recursive: true}); await fs.writeFile(path.resolve(OUT), JSON.stringify(res, null, 1) + '\n'); }
console.log(JSON.stringify({ok: res.ok, companies: res.companies, seconds: res.seconds, time: res.time, net: res.net, counts, fails: fails.slice(0, 15)}, null, 0));
process.exit(res.ok ? 0 : 1);
