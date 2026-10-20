// 3단 회사 자세히(새 아틀란스 /next/ 보는 화면 #/w/<번호> 의 .pco 칸 · site/next/p-co.js) — 지금 아틀란스 3단(/atlas/#/c/<번호>)과 맞대는 검사
//   사장님 2026-10-17(싱가포르) 04:04 「첫화면 부터 마지막 페이지 까지 모두 바꿔」 · 04:23 「정말 빠르면서도 정밀하게」
//   쓰는 법: node scripts/atlas11/next/check_co.mjs --base http://127.0.0.1:8826 [--all | --limit N] [--widths N] [--pw /opt/node-tools/] [--out 파일]
//     기본 = 고른 표본 200곳(모자란 자료 · 고른 곳 56곳 모두 · 1곳 업종 · 「?」 이름표 · 1년 값 없음 · 한글 아닌 끝 글자 · 큰 % · 나머지는 고르게) · --all = 모든 회사 · --limit N = 그 차례의 앞 N곳
//     --widths N = 세 폭(320 · 360 · 390)에서 볼 회사 수(기본 10 · --all 이면 30)
//   ① 옛 3단 #view 글(접은 칸 펼침 · 위치 줄 · 7단 칸 이름 · 그림 눈금 · 사이트 맨 아래 고리 · 옛 맺음 글만 뺌)의 줄이 새 main#view 에 빠짐없이 — 숫자 낱말 · 「?」는 수까지
//   ② 자료로 따로 셈 — 7단 중 3단 · 시장 · 번호 · 1주 값 · 고른 곳 줄 · 세 숫자 · 100만 원 줄 · 출처 · 범례 · 고른 날 금빛 세로선(고른 곳만) · 업종 평균 점선(2곳 넘는 업종만) ·
//      그림 눈금(옛 쪽과 같은 수) · 왜 들었나요?(해마다 값) / 왜 밖인가요?(멈춘 자리 · 까닭 · 깔때기 두 가지) · 다음 단 고리 · 자료 줄 · 안전 문장
//   ⑤ 머리(2026-10-18 [7] 1 ~ 4 · [10] 1 · 2 · 일꾼 S3p) — 길 표시(큰 업종 › 업종 · 고리 둘) · 이름 · 오늘 값 · 하루 %(자료에서 따로 셈) · 날 줄 · 든 목록 꼬리표(고도리 칸 n번 · 급등 칸 ·
//      급등 n%대 칸 · 고른 곳 — gdr.json · surge.json · mkt p 로 따로 셈) · 탭 넷(4 ~ 7단) · 큰 선 ▶ 없음 · 옛 일곱 칸(.chaps) 없음 · 「챕터」 0 · 옛 낱말(갈래 · 몸값 · 20거래일 …) 0(글 · aria-label · title · alt · 창 제목)
//      옛 3단 글은 낱말표(OLDMAP)로 바꿔 견줌: 20거래일 → 한 달 · 멍거 · 린치 갈래 → 조건 · 몸값 → 회사 크기
//   ③ 세 폭 — 가로 넘침 0 · .pco 안 글 17px 넘게 · 누르는 자리 44px 넘게 · 쓰지 않을 말 0 · 캔버스 0 · 화면 오류 0
//      + 한 화면 모든 칸([10] 5 ~ 10 · measure_type.mjs 와 같은 자): 글씨 가짓수 ≤ 6(17 · 19 · 21 · 24 · 30 · 48) · 17px 아래 0 · 글 시작 왼쪽 줄 ≤ 3 · 간격 0 · 8 · 16 · 24만 · 음수 0 · 같은 꼴 카드 높이 · 금빛 경고 두 줄 · 첫 화면(640)에 오늘 값 · 탭 넷 한 줄
//      + 아주 큰 글씨(320 · html.f2): 가로 넘침 0 · 탭 넷 화면 안
//   실패가 하나라도 있으면 끝 코드 1 · --out 이면 결과 파일
import fs from 'node:fs/promises';
import path from 'node:path';
import {createRequire} from 'node:module';
import {oldToNewDeep, NEW_NAME} from './rename.mjs'; // 이름 바꾸기(2026-10-17 아틀란스 → 보드리)
import {fetchJSON, watch, settle, timer, netSummary} from './net.mjs'; // 망 탈에만 다시 받기 · 다시 열기 · 옛 쪽 · 새 쪽 시간(2026-10-17 고도리 명령문 [1] 8 · 9)
import {shardOf} from './shard/part.mjs'; // --shard k/n = 한 번 다 돌 때의 일감(회사 · 빈 날 길 · 세 폭)을 n 몫으로 가른 k 번째만(깃허브 여러 대 · 합치기 shard/merge.mjs · 2026-10-18 고도리 길 1)
const arg = (k, d) => { const i = process.argv.indexOf(k); return i > 0 ? process.argv[i + 1] : d; };
const has = k => process.argv.includes(k);
const require = createRequire(arg('--pw', '/opt/node-tools/'));
const {chromium} = require('playwright');
const base = arg('--base', 'http://127.0.0.1:8826').replace(/\/$/, ''), out = arg('--out', null);
const ALL = has('--all'), LIMIT = Number(arg('--limit', '0')) || 0, NW = Number(arg('--widths', ALL ? '30' : '10'));
const fails = [], counts = {}, t0 = Date.now(), tm = timer(t0);
const fail = (k, x) => { if (fails.length < 400) fails.push([k, x]); counts.fail = (counts.fail || 0) + 1; };
const bump = (k, n = 1) => { counts[k] = (counts[k] || 0) + n; };

/* 따로 셈 — 앱 코드를 쓰지 않음(같은 규칙: 반올림은 크기로 · 100% 넘으면 소수 없음 · 날짜는 「10월 13일」) */
const R1 = x => Math.sign(x) * Math.floor(Math.abs(x) * 10 + 0.5 + 1e-7) / 10;
function P(x) { if (x == null || !Number.isFinite(x)) return '?'; const r = Math.floor(Math.abs(x) * 10 + 0.5 + 1e-7) / 10; if (r === 0) return '0.0%'; return (x > 0 ? '+' : '−') + (r >= 100 ? Math.floor(r + 0.5 + 1e-7).toLocaleString('ko-KR') : r.toFixed(1)) + '%'; }
const MD = d => (/^\d{4}-\d{2}-\d{2}/.test(String(d)) ? (+d.slice(5, 7)) + '월 ' + (+d.slice(8, 10)) + '일' : '?');
const N = n => Number(n).toLocaleString('ko-KR');
const WON = v => (v == null ? '?' : N(Math.round(v)) + '원');
const EOK = v => { if (v == null) return '?'; const s = v < 0 ? '−' : '', a = Math.abs(v); return a >= 10000 ? s + R1(a / 10000).toLocaleString('ko-KR', {maximumFractionDigits: 1}) + '조 원' : s + N(Math.round(a)) + '억 원'; };
const JOSA = w => { const k = String(w).trim().slice(-1).charCodeAt(0) - 0xAC00; return k < 0 || k > 11171 ? w + '은(는)' : w + (k % 28 ? '은' : '는'); };
const norm = s => String(s ?? '').replace(/\s+/g, ' ').trim(); // \s 는 붙임 띄어쓰기(NBSP)도 잡음 — 옛 쪽 날짜 「10월 13일」과 같게
const BANNED = ['추천', '매수', '매도', '사라', '팔라', '사세요', '파세요', '예측', '확률', '유망', '기회', '신호', '저평가', '1위', 'TOP', '매수 검토 36곳'];
// 숫자 낱말 — 부호 · 쉼표 · 소수 · 단위(% · 원 · 만 원 · 억 원 · 조 원 · 곳 · 배 · 거래일 · 일 · 년 · 월 · 단) · 「?」
const TOK = /[+−]?\d[\d,]*(?:\.\d+)?(?:\s?(?:%|만 원|억 원|조 원|원|곳|배|거래일|일|년|월|단))?|\?/g;
const tokCount = s => { const m = new Map(); for (const t of norm(s).match(TOK) ?? []) { const k = t.replace(/\s/g, ''); m.set(k, (m.get(k) || 0) + 1); } return m; };

const getJ = f => fetchJSON(base + '/atlas/data/' + f, f); // 망 탈(끊김 · 429 · 5xx)에만 기다렸다 다시 · 404 는 바로 실패(net.mjs)
const [core, mkt, comp, lines, names] = await Promise.all(['core.json', 'mkt.json', 'comp.json', 'lines.json', 'names.json'].map(f => getJ(f).catch(e => { fail('자료', e.message); return null; })));
if (!core || !mkt || !comp || !lines || !names) { console.error('자료를 못 받음'); process.exit(1); }
const CO = mkt.companies, codes = Object.keys(CO), COMP = comp.companies, LINES = lines.lines;
const surge = await getJ('surge.json').catch(e => { fail('자료', e.message); return null; }); // 꼬리표(급등 칸) 따로 셈
const GDR = await fetchJSON(base + '/next/data/gdr.json', 'gdr.json').catch(e => { fail('자료', 'gdr.json ' + e.message); return null; }); // 꼬리표(고도리 칸 n번) 따로 셈
const cond = await getJ('cond.json').catch(e => { fail('자료', e.message); return null; }); // 꼬리표(대장주) 따로 셈 — 칸 줄(c · rk · r5 · l5)을 이 검사가 직접 읽음
/** 대장주 = 업종 안 회사 크기 1등(rk 1) · 5일 선(l5)이 있고 5일 오름(r5)이 숫자 · 시장 자료에 든 회사 · cond 가 시장과 같은 날일 때만(#/f/lead 칩과 같은 걸름 — 앱 코드는 안 씀) */
const LEAD = new Set(cond?.asOf === mkt.asOf && cond?.co?.c ? cond.co.c.filter((c, k) => cond.co.rk?.[k] === 1 && CO[c] && Array.isArray(cond.co.l5?.[k]) && Number.isFinite(cond.co.r5?.[k])) : []);
const IND = new Map(core.industries.map(i => [i.name, i]));
const NAME = new Map(names.rows.map(r => [r.c, r]));
const PN = `${core.rules?.name ?? '고른'} ${core.funnel?.picked ?? '?'}곳`;
const SPAN = core.days === 20 ? '한 달' : `${core.days}거래일`; // 사장님 2026-10-18 [10] 1 「20거래일 → 한 달」(자료가 20일이 아니면 옛 말 그대로 — p-co.js SPAN 과 같은 뜻을 따로 셈)
const HOW = `멍거 조건은 3년 성적표만, 린치 조건은 3년 성적표와 ${core.rules?.lyDay ? MD(core.rules.lyDay) : '모음 날'} 값으로 골랐습니다`;
const FOOT = `자료: ${core.sources?.price ?? '?'} · 기준일 = 마지막 종가 날(${MD(core.asOf)})의 ${SPAN} 전(${MD(core.base)}) · ${PN} — ${HOW}(그 뒤 주가는 안 씀).`;
// 옛 3단 글 → 새 낱말(같은 표로 바꿔 견줌 · 사장님 [10] 1: 20거래일 → 한 달 · 멍거 갈래 · 린치 갈래(큰 업종이 아님) → 멍거 조건 · 린치 조건 · 몸값 → 회사 크기 · 토씨는 받침에 맞춤 갈래는 → 조건은)
const OLDMAP = [[`${core.days}거래일`, SPAN], ['멍거 갈래는', '멍거 조건은'], ['린치 갈래는', '린치 조건은'], ['깔때기 두 갈래', '깔때기 두 가지'], ['몸값', '회사 크기']];
const mapOld = t => OLDMAP.reduce((x, [a, b]) => x.split(a).join(b), t);

/* 표본 — 모자란 자료 먼저 · 고른 곳 모두 · 나머지는 고르게 */
const isPk = c => !!COMP[c];
const lineOf = async c => (isPk(c) ? {c: COMP[c], line: LINES[c]} : await getJ('co/' + encodeURIComponent(c) + '.json'));
function sample() {
  const pick = [], seen = new Set(), add = c => { if (c && CO[c] && !seen.has(c)) { seen.add(c); pick.push(c); } };
  const allNull = codes.filter(c => !(CO[c].l || []).some(x => x != null)); allNull.forEach(add);
  const pk = codes.filter(isPk);
  add(pk.find(c => COMP[c].pick?.mg && COMP[c].pick?.ly)); add(pk.find(c => COMP[c].pick?.ly && !COMP[c].pick?.mg)); add(pk.find(c => COMP[c].pick?.mg && !COMP[c].pick?.ly));
  [...LEAD].slice(0, 3).forEach(add); // 대장주(꼬리표 「대장주」) 몇 곳 — 가장 작은 범위(--limit)에서도 새 꼬리표를 봄
  core.industries.filter(i => i.n === 1).slice(0, 6).forEach(i => add(i.members[0]));
  codes.filter(c => NAME.get(c)?.s === 'q').slice(0, 8).forEach(add);
  codes.filter(c => !/[가-힣]$/.test(CO[c].n)).slice(0, 6).forEach(add);
  [...codes].filter(c => Number.isFinite(CO[c].c)).sort((a, b) => Math.abs(CO[b].c) - Math.abs(CO[a].c)).slice(0, 6).forEach(add);
  codes.filter(c => (CO[c].l || []).some(x => x == null) && (CO[c].l || []).some(x => x != null)).slice(0, 6).forEach(add);
  codes.filter(c => /[A-Z]/.test(c)).slice(0, 4).forEach(add); // 글자 섞인 새 번호(새로 상장 — 1년 값 「?」)
  pk.forEach(add);
  if (ALL) codes.forEach(add);
  else { const rest = codes.filter(c => !seen.has(c)), need = Math.max(0, 200 - pick.length), step = rest.length / Math.max(1, need); for (let k = 0; k < need && k * step < rest.length; k++) add(rest[Math.floor(k * step)]); }
  return LIMIT ? pick.slice(0, LIMIT) : pick;
}
const list = sample(), SH = shardOf(); // SH = 몫(--shard k/n · 없으면 모두 내 몫)

const exe = '/opt/pw-browsers/chromium', b = await chromium.launch((await fs.stat(exe).catch(() => null)) ? {executablePath: exe} : {});
async function page(width, height = 900, net = true) {
  const ctx = await b.newContext({viewport: {width, height}, deviceScaleFactor: 1, hasTouch: true});
  const p = await ctx.newPage(); p._errs = [];
  p.on('pageerror', e => p._errs.push(e.message)); p.on('console', m => { if (m.type() === 'error') p._errs.push(m.text()); });
  return net ? watch(p, base) : p; // 망 탈 셈(net.mjs) — 일부러 503 · 바꿔치기하는 빈 날 길 칸은 셈 밖(net = false)
}
async function hashGo(p, url, hash) { if (!p.url().startsWith(url)) await p.goto(url + hash); else await p.evaluate(x => { location.hash = x; }, hash); }

/* 옛 쪽 — 3단 회사 화면이 다 그려지고(이름표 까닭까지) 나서 글을 뽑음 */
async function oldGrab(p, code) { // 여는 데 쓴 때(옛 쪽) · 옛 앱이 스스로 새로 고치는 사이(자료 made 가 바뀌면 atlas.js freshCheck)에 읽으면 「Execution context was destroyed」 — 다시 엶(2026-10-20 실제 사이트 큰 시험 co · check_range 와 같은 까닭)
  return tm.old(async () => { for (let k = 0; ; k++) { try { return await oldGrab0(p, code); } catch (e) { if (k >= 2 || !/Execution context was destroyed|frame was detached|navigation/i.test(String(e?.message))) throw e; await p.waitForLoadState('domcontentloaded').catch(() => {}); await p.waitForTimeout(800); } } });
}
async function oldGrab0(p, code) {
  // 망 탈(이 사이트 요청 끊김 · 429 · 5xx · 15초 넘게 답 없음)이 있었던 열기는 믿지 않고 새로 고쳐 다시(net.mjs settle) — 망 탈 없이 못 그리면 앞과 같음(null)
  const ok = await settle(p, async () => { await hashGo(p, base + '/atlas/', '#/c/' + code); return p.waitForFunction(n => { const v = document.querySelector('#view .vw'); if (!v || v.querySelector('.boot')) return false; if (v.querySelector('h1.head')?.textContent === '없는 주소입니다') return true;
    return v.querySelector('.co-head h1')?.textContent === n && !!v.querySelector('.foot') && !v.innerText.includes('까닭을 받는 중'); }, CO[code].n, {timeout: 20000}).then(() => true).catch(() => false); }, {what: '옛 쪽 ' + code, fail});
  if (!ok) return null;
  return p.evaluate(() => {
    const v = document.querySelector('#view .vw');
    v.querySelectorAll('details').forEach(d => { d.open = true; });
    const hid = [], hide = e => { hid.push([e, e.style.getPropertyValue('display'), e.style.getPropertyPriority('display')]); e.style.setProperty('display', 'none', 'important'); };
    // 뺄 것 — 위치 줄(보는 화면 업종 채널이 맡음) · 7단 칸 이름(챕터 일곱이 맡음) · 그림 눈금(따로 맞댐) · 사이트 맨 아래 고리 · 꽃밭 · 옛 맺음 글(금지 말 「매수 · 매도」 — 새 안전 문장으로 따로 봄)
    for (const e of v.querySelectorAll('nav.crumb, ol.st, .lc .yr, .foot .links, .foot-mo')) hide(e);
    const disc = [...v.querySelectorAll('.foot > p')].find(e => e.textContent.includes('투자 상담사')); if (disc) hide(disc);
    const text = v.innerText;
    for (const [e, d, pr] of hid) { if (d) e.style.setProperty('display', d, pr); else e.style.removeProperty('display'); }
    return {text, missing: v.querySelector('h1.head')?.textContent === '없는 주소입니다', ticks: [...v.querySelectorAll('.lc .yr span')].map(s => s.textContent), crumb: [...v.querySelectorAll('nav.crumb a, nav.crumb span')].map(e => e.textContent), disc: disc?.textContent ?? ''};
  });
}
/* 새 쪽 — 보는 화면 + .pco 칸(그림이 제 넓이로 다시 그려진 뒤) */
async function newGrab(p, code) { return tm.new(() => newGrab0(p, code)); } // 여는 데 쓴 때(새 쪽)
async function newGrab0(p, code) {
  const ok = await settle(p, async () => { await hashGo(p, base + '/next/?dev=1', '#/w/' + code); return p.waitForFunction(n => { const v = document.querySelector('#view'); if (!v || v.querySelector('.boot') || v.querySelector('.wt')?.textContent !== n) return false;
    if (v.innerText.includes('회사 자세히를 그리지 못했어요')) return true;
    const s = v.querySelector('.pco'); if (!s || s.innerText.includes('까닭을 받는 중')) return false;
    const w = s.querySelector('.pco-lc'), g = w?.querySelector('svg'); if (!w) return true; // 회사 자료를 못 받은 길 — 그림 없음
    return !!w.querySelector(':scope > .pco-q') || (!!g && Math.abs(+g.getAttribute('width') - Math.max(260, Math.round(w.getBoundingClientRect().width))) < 1.5); }, CO[code].n, {timeout: 20000}).then(() => true).catch(() => false); }, {what: '새 쪽 ' + code, fail});
  if (!ok) return null;
  return p.evaluate(() => {
    const v = document.querySelector('#view'), s = v.querySelector('.pco');
    const lineCount = e => { const r = document.createRange(); r.selectNodeContents(e); const tops = []; for (const z of r.getClientRects()) if (z.width >= 1 && z.height >= 1 && !tops.some(y => Math.abs(y - z.top) <= 2)) tops.push(z.top); return tops.length; };
    const w0 = v.querySelector('details.pco-warn'), warn0 = w0 ? {open: w0.open, lines: lineCount(w0.querySelector('summary')), h: Math.round(w0.querySelector('summary').getBoundingClientRect().height)} : null; // 펼치기 전 모습(접힘 · 한 줄)
    v.querySelectorAll('details').forEach(d => { d.open = true; });
    if (!s) return {text: v.innerText, none: true};
    const q = sel => s.querySelector(sel), T = e => e?.textContent ?? null;
    const N1 = e => (e?.textContent ?? '').replace(/\s+/g, ' ').trim(), wn = v.querySelector('.wnow');
    const skipW = el => { const k = el?.closest?.('[lang="ko"], [data-proper]'); return !!k && k !== document.documentElement && k !== document.body; };
    const strs = [], tw = document.createTreeWalker(v, NodeFilter.SHOW_TEXT); for (let x; (x = tw.nextNode());) if (x.nodeValue.trim() && !skipW(x.parentElement)) strs.push(x.nodeValue);
    for (const e of v.querySelectorAll('[aria-label], [title], [placeholder], [alt]')) if (!skipW(e)) for (const a of ['aria-label', 'title', 'placeholder', 'alt']) { const z = e.getAttribute(a); if (z) strs.push(z); }
    strs.push(document.title);
    const WORDS = [['챕터', /챕터/g], ['갈래', /갈래/g], ['몸값', /몸값/g], ['한 회사 한 표', /한 회사 한 표/g], ['큰 회사는 크게', /큰 회사는 크게/g], ['20거래일', /(?<![\d.])20\s?거래일/g], ['다섯 문', /다섯 문/g], ['쉬는 돈', /쉬는 돈/g]];
    const words = {}; for (const z of strs) for (const [k, re] of WORDS) { const m = z.match(re); if (m) words[k] = (words[k] || 0) + m.length; }
    return {
      words, warn0, title: document.title,
      head: { // 머리(app.js vWatch) — 큰 선 밑 길 표시 · 이름 · 오늘 값 · 날 줄 · 꼬리표 · 탭 넷
        path: [...v.querySelectorAll('nav.wpath > a, nav.wpath > span:not(.wsep)')].map(e => [N1(e), e.getAttribute('href')]), pathLabel: v.querySelector('nav.wpath')?.getAttribute('aria-label') ?? null,
        wt: N1(v.querySelector('h1.wt')), price: N1(wn?.querySelector('.wn-p')), dayK: N1(wn?.querySelector('.wn-k')), day: N1(wn?.querySelector('.wn-d')), dayCls: wn?.querySelector('.wn-d')?.className ?? '', ws: N1(v.querySelector('p.ws')), wsd: N1(v.querySelector('p.wsd')),
        tags: [...v.querySelectorAll('.wtags > a')].map(a => [N1(a), a.getAttribute('href'), a.classList.contains('pk')]),
        tabs: [...v.querySelectorAll('nav.wtabs > a')].map(a => [N1(a), a.getAttribute('href')]), tabsLabel: v.querySelector('nav.wtabs')?.getAttribute('aria-label') ?? null,
        play: v.querySelectorAll('.player .play').length, chapsOld: v.querySelectorAll('.chaps').length,
        order: [...v.children].filter(e => e.matches('.player, nav.wpath, h1.wt, p.wnow, p.ws, p.wsd, .wtags, nav.wtabs')).map(e => e.tagName.toLowerCase() + '.' + (e.classList[0] ?? '')),
      },
      sums: [...s.querySelectorAll('details.pco-more > summary')].map(e => N1(e)),
      text: v.innerText, pco: s.innerText,
      kind: T(q('.pco-kind')), meta: T(q('.pco-meta')), chip: T(q('.pco-chip')), chipPk: !!q('.pco-chip.pk .pco-badge'),
      trio: [...s.querySelectorAll('.pco-trio > div')].map(d => [T(d.querySelector('span')), T(d.querySelector('b')), d.querySelector('b')?.className ?? '']),
      won: T(q('.pco-won')), src: T(q('.pco-src')), key: [...s.querySelectorAll('.pco-key > span')].map(T),
      gold: s.querySelectorAll('.pco-lc line.pco-pick').length, yl: T(q('.pco-yl')), avg: s.querySelectorAll('.pco-lc path.pco-avg').length, coPath: s.querySelectorAll('.pco-lc path.pco-co').length,
      lcq: T(q('.pco-lc > .pco-q')), ax: [...s.querySelectorAll('.pco-ax span')].map(T), ticks: [...s.querySelectorAll('.pco-yr span')].map(T),
      boxH: T(q('.pco-box > h2')), box: q('.pco-box')?.innerText ?? '', hon: T(q('.pco-hon')), lead: T(q('.pco-lead')), why: T(q('.pco-why')),
      funnel: [...s.querySelectorAll('.pco-funnel')].map(ol => [...ol.children].map(li => [li.className, T(li.querySelector('b')), T(li.querySelector('span > span'))])),
      fname: [...s.querySelectorAll('.pco-fname')].map(T), small: [...s.querySelectorAll('.pco-small')].map(T),
      next: [q('a.pco-next')?.getAttribute('href') ?? null, T(q('a.pco-next'))], foot: [...s.querySelectorAll('p.pco-foot')].map(T), warn: q('details.pco-warn') ? [T(q('details.pco-warn > summary')), T(q('details.pco-warn > p'))] : null, safe: T(q('.pco-safe')),
      hrefs: [...s.querySelectorAll('a[href]')].map(a => a.getAttribute('href')), canvas: s.querySelectorAll('canvas').length,
    };
  });
}

/* ⑤ 머리 · 접은 경고 — 따로 셈(앱 코드를 쓰지 않음) */
const GRP = new Map(core.groups.map(g => [g.id, g]));
const lineDay = l => (l?.length > 1 && l[l.length - 2] > 0 && l[l.length - 1] > 0 ? (l[l.length - 1] / l[l.length - 2] - 1) * 100 : null); // 선 끝 두 날 · 하나라도 0 이하면 모름
const lineChg = l => (l?.[0] > 0 && l[l.length - 1] > 0 ? (l[l.length - 1] / l[0] - 1) * 100 : null);
const c20 = o => (Number.isFinite(o.c) ? o.c : lineChg(o.l));
const clsOf = v => (v == null || !Number.isFinite(v) ? 'q' : R1(v) > 0 ? 'up' : R1(v) < 0 ? 'dn' : 'fl');
const deepNorm = x => (typeof x === 'string' ? norm(x) : Array.isArray(x) ? x.map(deepNorm) : x);
const BANDS = [['b10', '10%대', '10'], ['b20', '20%대', '20'], ['b30', '30%대', '30'], ['b40', '40% 이상', '40']];
const WHY_DONE_HERE = false; // 이 검사는 매매일지 기록(atlas:godori-why)을 넣지 않음 = 열한 질문 전 기기
/** 든 목록 꼬리표 — 이 검사가 자료에서 따로 센 것(차례: 고도리 칸 → 급등 칸 → 급등 n%대 칸 → 대장주 → 고른 곳) */
function wantTags(code, o) {
  const t = [];
  // 칸 번호 꼬리표는 열한 질문을 끝낸 기기에서만(본질 문 ④ · app.js wTags open · 일꾼 KI) — 이 검사의 칸들은 매매일지 기록이 없어 늘 뺌(끝낸 기기는 next_check 「질문 뒤」가 봄)
  if (WHY_DONE_HERE) for (const p of GDR?.picks ?? []) if (p.code === code) t.push([NEW_NAME + ' 칸 ' + p.no + '번', '#/gdr/' + p.no, false]);
  if (surge?.members?.some(m => m.c === code)) t.push(['급등 칸', '#/surge', false]);
  for (const [k, nm, n] of BANDS) if (surge?.bands?.[k]?.members?.some(m => m.c === code)) t.push(['급등 ' + nm + ' 칸', '#/surge/' + n, false]);
  if (LEAD.has(code)) t.push(['대장주', '#/f/lead', false]);
  if (o.p) t.push(['고른 곳', '#/f/pick', true]);
  return t;
}
const STEPS = [['past', '지나온 길'], ['rivals', '누구와 다투나'], ['grow', '앞으로 클까?'], ['range', '범위']];
function headCheck(nw, code, o, c, where) {
  const H = nw.head, w = (k, got, exp) => { bump('머리 셈'); if (JSON.stringify(deepNorm(got)) !== JSON.stringify(deepNorm(exp))) fail(k, where + ' 「' + JSON.stringify(got).slice(0, 140) + '」 ≠ 「' + JSON.stringify(exp).slice(0, 140) + '」'); };
  const I = IND.get(o.i), G = I ? GRP.get(I.g) : null, enc = encodeURIComponent;
  w('길 표시', H.path, [G ? [G.short || G.name, '#/ch/g/' + enc(G.id)] : ['큰 업종 ?', null], I ? [I.name + ' 업종', '#/ch/i/' + enc(I.name)] : ['업종 ?', null]]);
  w('길 표시 이름(aria)', H.pathLabel, '7단 길');
  w('이름', H.wt, o.n);
  const okP = Number.isFinite(c.price) && c.price > 0, day = lineDay(o.l);
  w('오늘 값', H.price, okP ? N(c.price) + '원' : '?');
  w('「하루」 글', H.dayK, '하루');
  w('오늘 하루 %', H.day, P(day));
  if (!H.dayCls.split(' ').includes(clsOf(day))) fail('오늘 하루 색', where + ' ' + H.dayCls + ' ≠ ' + clsOf(day));
  const pDay = okP && /^\d{4}-\d{2}-\d{2}/.test(String(c.priceDate ?? '')) ? String(c.priceDate).slice(0, 10) : null;
  const dateNote = pDay && pDay !== mkt.asOf; // 값 날이 마감 날과 다르면 탭 아래 한 줄(p.wsd · 2026-10-20 — 날 줄 뒤에 붙이면 360 폭에서 탭 넷이 첫 화면 밖으로 밀렸음)
  w('날 줄', H.ws, `${MD(mkt.asOf)} 마감 · 한 달 동안 ${P(c20(o))}`);
  w('값 날 줄(탭 아래)', H.wsd, dateNote ? `값은 ${MD(pDay)} 종가` : '');
  w('꼬리표', H.tags, wantTags(code, o));
  w('탭 넷 이름', H.tabs.map(x => x[0]), STEPS.map(x => x[1]));
  w('탭 넷 이름(aria)', H.tabsLabel, '7단 중 4 ~ 7단');
  H.tabs.forEach((x, k) => { bump('머리 셈'); const st = STEPS[k]?.[0]; if (!st || (x[1] !== '#/w/' + code + '/' + st && x[1] !== '/atlas/#/c/' + code + '/' + st)) fail('탭 고리', where + ' ' + x[0] + ' ' + x[1]); });
  if (H.play) fail('큰 선 ▶ 표시 남음', where + ' ' + H.play);
  if (H.chapsOld) fail('옛 일곱 칸(.chaps) 남음', where + ' ' + H.chapsOld);
  w('머리 차례(탭 넷이 꼬리표보다 먼저)', H.order, ['div.player', 'nav.wpath', 'h1.wt', 'p.wnow', 'p.ws', 'nav.wtabs', ...(dateNote ? ['p.wsd'] : []), ...(wantTags(code, o).length ? ['div.wtags'] : [])]);
}
/** 한 화면 재기(쪽 안에서 돎 · measure_type.mjs 와 같은 자 — 글 마디: 빈칸 아닌 글 중 상자 1×1px 넘고 보이는 것 · 제 글을 가진 칸 = 그 글을 바로 품은 요소)
    접은 칸(details)은 닫은 채로 잼 — 사람이 처음 보는 모습 */
const LAYOUT = () => {
  const vw = document.documentElement.clientWidth, vh = innerHeight, view = document.querySelector('#view') || document.body;
  view.querySelectorAll('details').forEach(d => { d.open = false; });
  const SKIP = new Set(['SCRIPT', 'STYLE', 'NOSCRIPT', 'TEMPLATE', 'TITLE']), TOK = [17, 19, 21, 24, 30, 48], SP = [0, 8, 16, 24];
  const clipCache = new Map();
  const clipped = el => { for (let a = el; a && a !== document.body; a = a.parentElement) { if (clipCache.has(a)) { if (clipCache.get(a)) return true; continue; } const cs = getComputedStyle(a); let c = false; if (cs.overflow !== 'visible' || cs.clip !== 'auto' || cs.clipPath !== 'none') { const r = a.getBoundingClientRect(); c = r.width <= 1 || r.height <= 1; } clipCache.set(a, c); if (c) return true; } return false; };
  const sel = el => { const c = (el.getAttribute('class') || '').trim().split(/\s+/).filter(Boolean).slice(0, 2).join('.'); return el.tagName.toLowerCase() + (c ? '.' + c : ''); };
  const R = document.createRange(), texts = [], tw = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
  for (let n; (n = tw.nextNode());) {
    if (!n.nodeValue.trim()) continue;
    const el = n.parentElement; if (!el || SKIP.has(el.tagName)) continue;
    R.selectNodeContents(n); const rs = [...R.getClientRects()].filter(q => q.width >= 1 && q.height >= 1); if (!rs.length) continue;
    if (el.checkVisibility && !el.checkVisibility({checkOpacity: true, checkVisibilityCSS: true})) continue;
    if (clipped(el)) continue;
    texts.push({n, el, rs, inView: view.contains(el)});
  }
  const out = {px: Math.max(document.documentElement.scrollHeight, document.body?.scrollHeight || 0)};
  const owners = new Map(); for (const t of texts) if (!owners.has(t.el)) owners.set(t.el, t);
  const fsAll = new Map(), small = [], bad = [];
  for (const [el, t] of owners) { const f = parseFloat(getComputedStyle(el).fontSize), k = Math.round(f * 2) / 2; fsAll.set(k, (fsAll.get(k) || 0) + 1); if (f < 16.99) small.push(sel(el) + ' ' + k + 'px 「' + t.n.nodeValue.trim().slice(0, 16) + '」'); if (!TOK.includes(k)) bad.push(sel(el) + ' ' + k + 'px 「' + t.n.nodeValue.trim().slice(0, 16) + '」'); }
  out.sizes = [...fsAll.keys()].sort((a, b) => a - b); out.small = small.slice(0, 5); out.nt = bad.slice(0, 5);
  const blockOf = el => { for (let a = el; a; a = a.parentElement) { const d = getComputedStyle(a).display; if (d !== 'inline' && d !== 'contents') return a; } return document.body; };
  const blocks = new Map(); for (const t of texts) { if (!t.inView) continue; const b = blockOf(t.el); if (!blocks.has(b)) blocks.set(b, t); }
  const xs = new Map(), xEx = {};
  for (const [b, t] of blocks) { const ta = getComputedStyle(b).textAlign; if (/center|right|end/.test(ta)) continue; const x = Math.round(t.rs[0].left); if (x < 0 || x >= vw) continue; xs.set(x, (xs.get(x) || 0) + 1); if (!xEx[x]) xEx[x] = sel(b) + ' 「' + t.n.nodeValue.trim().slice(0, 12) + '」'; }
  out.lefts = Object.fromEntries([...xs].sort((a, b) => a[0] - b[0])); out.leftEx = xEx;
  const PROPS = ['margin-top', 'margin-right', 'margin-bottom', 'margin-left', 'padding-top', 'padding-right', 'padding-bottom', 'padding-left', 'row-gap', 'column-gap'];
  const spBad = new Map(), negEx = []; let neg = 0;
  for (const el of view.querySelectorAll('*')) {
    if (el.closest('svg') && el.tagName.toLowerCase() !== 'svg') continue;
    if (!el.getClientRects().length) continue;
    const m = el.computedStyleMap ? el.computedStyleMap() : null, cs = getComputedStyle(el);
    for (const pr of PROPS) {
      if (pr.endsWith('gap') && !/flex|grid/.test(cs.display)) continue;
      let v = null; const sv = m?.get(pr);
      if (sv && sv.constructor?.name === 'CSSKeywordValue') continue;
      if (sv && sv.constructor?.name === 'CSSUnitValue') { if (sv.unit === 'percent') continue; v = sv.unit === 'px' ? sv.value : parseFloat(cs.getPropertyValue(pr)); } else v = parseFloat(cs.getPropertyValue(pr));
      if (!Number.isFinite(v)) continue;
      if (v < -0.5) { neg++; if (negEx.length < 5) negEx.push(sel(el) + ' ' + pr + ' ' + Math.round(v)); continue; }
      if (SP.some(x => Math.abs(x - v) < 0.6)) continue;
      const k = sel(el) + ' ' + pr.replace(/-(top|right|bottom|left)$/, '').replace('row-gap', 'gap').replace('column-gap', 'gap') + ' ' + (Math.round(v * 10) / 10);
      spBad.set(k, (spBad.get(k) || 0) + 1);
    }
  }
  out.neg = neg; out.negEx = negEx; out.sp = [...spBad.keys()].slice(0, 6);
  const cardLike = el => { const cs = getComputedStyle(el), r = el.getBoundingClientRect(); if (r.height < 48 || r.width < 100) return false; const a = /rgba?\(([^)]+)\)/.exec(cs.backgroundColor), alpha = a ? (a[1].split(',')[3] ?? '1') : '0'; const hasBg = Number(alpha) > 0.01 || cs.backgroundImage !== 'none'; const b4 = ['Top', 'Right', 'Bottom', 'Left'].every(z => parseFloat(cs['border' + z + 'Width']) > 0); return hasBg || cs.boxShadow !== 'none' || b4; };
  const cardBad = [];
  for (const Pn of [view, ...view.querySelectorAll('*')]) {
    if (Pn.closest('svg') || Pn.children.length < 2) continue;
    const by = new Map(); for (const c of Pn.children) { if (!c.getClientRects().length) continue; const k = sel(c); if (!by.has(k)) by.set(k, []); by.get(k).push(c); }
    for (const [k, cs] of by) { if (cs.length < 2) continue; const cc = cs.filter(cardLike); if (cc.length < 2) continue; const hs = cc.map(c => Math.round(c.getBoundingClientRect().height)); const lo = Math.min(...hs), hi = Math.max(...hs); if (hi - lo > 2) cardBad.push(sel(Pn) + ' > ' + k + ' ×' + cc.length + ' ' + lo + '–' + hi); }
  }
  out.card = cardBad.slice(0, 4);
  const isGold = c => { const m = /rgba?\((\d+),\s*(\d+),\s*(\d+)/.exec(c); return !!m && Math.abs(m[1] - 233) + Math.abs(m[2] - 185) + Math.abs(m[3] - 73) < 40; };
  const gb = new Set(); for (const t of texts) { if (!isGold(getComputedStyle(t.el).color)) continue; const b = blockOf(t.el); if (isGold(getComputedStyle(b).color)) gb.add(b); }
  const goldBad = [];
  for (const b of gb) { const tops = []; for (const t of texts) { if (!b.contains(t.el)) continue; for (const q of t.rs) if (!tops.some(y => Math.abs(y - q.top) <= 2)) tops.push(q.top); } if (tops.length > 2) goldBad.push(sel(b) + ' ' + tops.length + '줄 「' + (b.textContent || '').trim().slice(0, 18) + '」'); }
  out.gold = goldBad.slice(0, 4);
  const wn = view.querySelector('.wnow'); out.wnowBottom = wn ? Math.round(wn.getBoundingClientRect().bottom + scrollY) : null; out.wnFs = wn ? [...wn.querySelectorAll('.wn-p, .wn-d')].map(e => parseFloat(getComputedStyle(e).fontSize)) : []; out.vh = vh; out.vw = vw;
  out.barTop = Math.round(document.querySelector('nav.tabs')?.getBoundingClientRect().top ?? vh);
  out.tabs = [...view.querySelectorAll('nav.wtabs > a')].map(a => { const r = a.getBoundingClientRect(); return [Math.round(r.top + scrollY), Math.round(r.left), Math.round(r.right), Math.round(r.height)]; });
  out.tags = [...view.querySelectorAll('.wtags > a')].map(a => { const r = a.getBoundingClientRect(); return [Math.round(r.left), Math.round(r.right), Math.round(r.height)]; });
  return out;
};
/** 한 화면 재기 결과 → 실패 목록([10] 5 ~ 10 · [7] 1 ~ 3) */
function layoutCheck(L, w, code, big = false) {
  const at = w + (big ? ' 큰 글씨 ' : ' ') + code;
  bump('한 화면 재기');
  if (L.nt.length) fail('글씨 크기가 토큰(17 · 19 · 21 · 24 · 30 · 48) 밖', at + ' ' + L.nt.join(' / '));
  if (L.sizes.length > 6) fail('글씨 가짓수 6 넘음', at + ' ' + L.sizes.join(','));
  if (L.small.length) fail('글 17px 아래', at + ' ' + L.small.join(' / '));
  if (Object.keys(L.lefts).length > 3) fail('글 시작 왼쪽 줄 3 넘음', at + ' ' + JSON.stringify(L.lefts) + ' ' + JSON.stringify(L.leftEx));
  if (L.neg) fail('음수 간격', at + ' ' + L.negEx.join(' / '));
  if (L.sp.length) fail('간격이 0 · 8 · 16 · 24 밖', at + ' ' + L.sp.join(' / '));
  if (L.card.length) fail('같은 꼴 카드 높이 다름', at + ' ' + L.card.join(' / '));
  if (L.gold.length) fail('금빛 경고 두 줄 넘음', at + ' ' + L.gold.join(' / '));
  if (L.wnFs.length !== 2 || L.wnFs.some(f => f < 28)) fail('오늘 값 · 하루 %가 28px 안 됨', at + ' ' + JSON.stringify(L.wnFs));
  if (!big && (L.wnowBottom == null || L.wnowBottom > L.vh)) fail('첫 화면에 오늘 값 · 하루 %가 다 안 보임', at + ' 아래 끝 ' + L.wnowBottom + ' > ' + L.vh);
  if (L.tabs.length !== 4) fail('탭 넷이 아님', at + ' ' + L.tabs.length);
  else {
    if (!big && new Set(L.tabs.map(t => t[0])).size !== 1) fail('탭 넷이 한 줄이 아님', at + ' ' + JSON.stringify(L.tabs.map(t => t[0])));
    if (L.tabs.some(t => t[1] < -0.5 || t[2] > (L.vw ?? 1e9))) fail('탭이 화면 밖', at + ' ' + JSON.stringify(L.tabs));
    if (L.tabs.some(t => t[3] < 43.5)) fail('탭 누르는 자리 44px 안 됨', at + ' ' + JSON.stringify(L.tabs.map(t => t[3])));
    // 탭 줄은 꼬리표가 몇 개든 첫 화면 안 — 아래 단추 막대 윗선(640px 화면 572px) 위 · 360px 폭부터(320px 는 값 줄이 두 줄로 접힐 수 있어 재기만)
    if (!big && L.vw >= 360 && L.tabs.some(t => t[0] + t[3] > L.barTop)) fail('탭 넷이 첫 화면(아래 막대 위) 밖', at + ' 탭 아래 끝 ' + Math.max(...L.tabs.map(t => t[0] + t[3])) + ' > 막대 ' + L.barTop);
  }
  if (L.tags.some(t => t[2] < 43.5)) fail('꼬리표 누르는 자리 44px 안 됨', at + ' ' + JSON.stringify(L.tags));
}
/** 장 중 값 「?」 — 접힌 한 줄 「? 아직 바뀔 수 있는 값이에요 ›」 + 펼치면 옛 글 그대로 */
function warnCheck(nw, where) {
  bump('따로 셈');
  if (!nw.warn || norm(nw.warn[0]) !== '? 아직 바뀔 수 있는 값이에요 ›') fail('장 중 값 「?」 한 줄', where + ' ' + JSON.stringify(nw.warn));
  else if (norm(nw.warn[1]) !== norm(`${MD(core.asOf)} 값은 그날 저녁 8시 전에 받아 아직 바뀔 수 있습니다(시간외 · 넥스트레이드) — 다음 받기에서 고쳐집니다.`)) fail('장 중 값 「?」 펼친 글', where + ' ' + norm(nw.warn[1]).slice(0, 100));
  if (!nw.warn0 || nw.warn0.open || nw.warn0.lines !== 1) fail('장 중 값 접힘 한 줄', where + ' ' + JSON.stringify(nw.warn0));
}

/* ①② 회사마다 */
const po = await page(390), pn = await page(390);
for (const code of SH.part('c', list)) {
  const o = CO[code], I = IND.get(o.i);
  let E; try { E = await lineOf(code); } catch (e) { fail('자료(회사 파일)', code + ' ' + e.message); continue; }
  const c = E.c, line = E.line, pk = isPk(code);
  if (!c || !Array.isArray(line)) { fail('자료(회사 파일)', code + ' c · line 없음'); continue; }
  const old = oldToNewDeep(await oldGrab(po, code)); if (!old) { fail('옛 쪽 안 열림', code); continue; } // 옛 쪽 글은 이름만 새 이름으로(rename.mjs)
  if (old.missing) { fail('옛 쪽이 없는 주소', code); continue; }
  const nw = await newGrab(pn, code); if (!nw) { fail('새 쪽 안 열림', code); continue; }
  if (nw.none) { fail('새 쪽 .pco 없음', code + ' ' + norm(nw.text).slice(-80)); continue; }
  const where = code + ' ' + o.n;
  // ① 옛 글 줄 → 새 글
  const NT = norm(nw.text);
  const OT = mapOld(old.text); // 옛 글을 새 낱말로(OLDMAP) 바꾼 뒤 견줌
  // 장 중 값 경고(옛 쪽은 펼친 한 줄 · 새 쪽은 「? 아직 바뀔 수 있는 값이에요 ›」 접은 칸)는 위 「장 중 값 「?」 펼친 글」 · 「접힘 한 줄」이 따로 맞댐 — 여기서 또 세면 장 중 자료 날마다 회사 수만큼 걸림(2026-10-19 낮 main 검사 400건)
  const PROV = /값은 그날 저녁 8시 전에 받아 아직 바뀔 수 있습니다/;
  for (const raw of OT.split('\n')) { const l = norm(raw); if (!l || /^[›‹·]$/.test(l)) continue; if (PROV.test(l) && nw.warn0) continue; bump('줄'); if (!NT.includes(l)) fail('옛 줄 빠짐', where + ' 「' + l.slice(0, 90) + '」'); }
  const oc = tokCount(OT), nc = tokCount(nw.text);
  for (const [k, n] of oc) { bump('숫자 낱말', n); if ((nc.get(k) || 0) < n) fail('숫자 낱말 모자람', where + ' 「' + k + '」 옛 ' + n + ' · 새 ' + (nc.get(k) || 0)); }
  for (const x of old.crumb) { const t = norm(x).replace(/\(1곳\)$/, ''); if (t && t !== '›' && t !== '한눈에' && !NT.includes(t)) fail('위치 줄(갈래 · 업종) 빠짐', where + ' ' + t); }
  if (JSON.stringify(old.ticks) !== JSON.stringify(nw.ticks)) fail('그림 눈금', where + ' 옛 ' + old.ticks.join(',') + ' · 새 ' + nw.ticks.join(','));
  if (old.disc && !(nw.safe?.includes('투자 상담사가 아니에요') && nw.safe.includes('사고팔기') && nw.safe.includes('시장 앞날'))) fail('안전 문장', where + ' ' + nw.safe);
  // ② 자료로 따로 셈
  const want = (k, got, exp) => { bump('따로 셈'); if (norm(got) !== norm(exp)) fail(k, where + ' 「' + norm(got).slice(0, 120) + '」 ≠ 「' + norm(exp).slice(0, 120) + '」'); };
  want('7단 중 3단', nw.kind, '7단 중 3단 · 회사 · 기록');
  want('시장 · 번호 · 1주 값', nw.meta, `${c.market === 'KOSPI' ? '코스피' : '코스닥'} · ${code} · 1주 ${WON(c.price)}`);
  want('고른 곳 줄', nw.chip, pk ? `고른 곳 ${PN}에 든 회사입니다 — 두 사람이 고른 목록은 아닙니다` : `${PN} 밖 이 회사도 7단까지 볼 수 있습니다`);
  if (nw.chipPk !== pk) fail('고른 곳 금빛 이름표', where);
  const trioW = [[SPAN, P(c.chg)], ['1년', P(c.r1y)], [`가장 깊이 빠짐(${SPAN})`, P(c.mdd)]];
  want('세 숫자', JSON.stringify(nw.trio.map(x => [x[0], x[1]])), JSON.stringify(trioW));
  nw.trio.forEach((x, k) => { const v = [c.chg, c.r1y, c.mdd][k], cl = v == null || !Number.isFinite(v) ? 'q' : R1(v) > 0 ? 'up' : R1(v) < 0 ? 'dn' : 'fl'; if (!x[2].split(' ').includes(cl)) fail('세 숫자 색', where + ' ' + x[0] + ' ' + x[2] + ' ≠ ' + cl); });
  const lv = line.filter(x => x != null).map(x => x / 100), low = lv.length ? Math.min(...lv) : null, last = lv.length ? lv[lv.length - 1] : null, MAN = x => N(Math.round(x)) + '만 원';
  want('100만 원 줄', nw.won, low == null ? '? 값을 못 읽었습니다' : low < 100 ? `${MD(core.base)}에 100만 원어치였다면 가장 낮을 때 ${MAN(low)} · 끝 ${MAN(last)}` : `${MD(core.base)}에 100만 원어치였다면 그보다 낮아진 적 없이 끝 ${MAN(last)}`);
  want('출처 줄', nw.src, `네이버 증권 · ${MD(c.priceDate || core.asOf)} 종가 · ${NEW_NAME} 셈`);
  const multi = (I?.n ?? 1) > 1, pickLine = pk && core.kPick != null;
  want('범례', JSON.stringify(nw.key), JSON.stringify([`${c.name} — ${MD(core.base)}보다 위 빨강 · 아래 파랑`, ...(multi ? [I.name + ' 평균'] : []), ...(pickLine ? [`고른 날 ${MD(core.pickAsOf)}`] : [])]));
  if (low == null) want('값 없는 그림', nw.lcq, `? 이 회사 ${SPAN} 값을 못 읽었습니다`);
  else {
    bump('그림');
    if (nw.gold !== (pickLine ? 1 : 0) || (pickLine ? nw.yl !== '고른 날' : nw.yl !== null)) fail('고른 날 금빛 세로선', where + ' 선 ' + nw.gold + ' · 글 ' + nw.yl);
    if (nw.avg !== (multi ? 1 : 0)) fail('업종 평균 점선', where + ' ' + nw.avg);
    if (nw.coPath !== 2) fail('회사 선', where + ' ' + nw.coPath);
    want('그림 날짜', JSON.stringify(nw.ax), JSON.stringify([MD(core.dates[0]) + ' = 100', MD(core.dates[core.dates.length - 1])]));
  }
  if (pk) {
    const p = c.pick, R = core.rules;
    want('왜 들었나 제목', nw.boxH, `왜 ${PN}에 들었나요?`);
    want('정직 글', nw.hon, `${R.notMunger} 좋은 회사 순서가 아닙니다.`);
    const BX = norm(nw.box), need = [];
    if (p.mg) { const Y = p.mg.years.map(y => String(y).slice(0, 4) + '년');
      need.push('멍거 조건 — 세 조건을 모두 넘었습니다', '① 해마다 남긴 돈 — ' + p.mg.net.map((x, k) => `${Y[k]} ${EOK(x)}`).join(' · '), '② 자기 돈 100원에 빚 — ' + p.mg.debt.map((x, k) => `${Y[k]} ${Math.round(x)}원`).join(' · '),
        '③ 자기 돈 100원으로 번 돈 — ' + p.mg.roe.map((x, k) => `${Y[k]} ${R1(x).toFixed(1)}원`).join(' · ')); }
    if (p.ly) { const l = p.ly;
      need.push('린치 조건 — 두 조건을 모두 넘었습니다', `① 한 주가 번 돈 — ${l.years[0]}년 ${WON(l.eps[0])} · ${l.years[1]}년 ${WON(l.eps[1])} · 해마다 ${R1(l.g).toFixed(1)}% 큼`,
        `② 크는 빠르기에 견줘 값 — 배당 ${R1(l.yld).toFixed(1)}% · 이익의 ${R1(l.per).toFixed(1)}배 값 · 점수 ${l.score.toFixed(2)} · 2 넘음 · ${MD(l.pxDay)} 값`, '점수 = (한 주 이익이 해마다 큰 % + 배당 %) ÷ 1년 이익의 몇 배 값 — 린치는 2 넘는 것을 찾았습니다.'); }
    for (const g of R.groups.filter(g => p.tags.includes(g.k))) { for (const x of g.conds) need.push(`${x.t} — 「${x.q}」 · ${x.who}`); need.push(g.price, g.notCounted, g.limits); }
    need.push(`네이버 업종 「${p.sector}」 · ${core.sources.pick}`);
    for (const t of need) { bump('따로 셈'); if (!BX.includes(norm(t))) fail('왜 들었나 글', where + ' 「' + t.slice(0, 90) + '」'); }
  } else {
    const r = NAME.get(code);
    want('왜 밖인가 제목', nw.boxH, `왜 ${PN} 밖인가요?`);
    if (!r) fail('이름표 없음(자료)', where);
    else {
      const stopSay = (core.funnel.groups ?? []).map(g => `${g.name}은 「${g.stopName?.[g.k === 'mg' ? r.sm : r.sl] ?? '고르기'}」에서`).join(', ') + ' 멈췄습니다';
      want('멈춘 자리', nw.lead, `${JOSA(r.n)} ${stopSay}.`);
      want('밖인 까닭', nw.why, r.w ?? '?');
      want('깔때기 이름', JSON.stringify(nw.fname), JSON.stringify((core.funnel.groups ?? []).map(g => `${g.name} ${g.n}곳`)));
      const fx = (core.funnel.groups ?? []).map(g => { const stop = g.k === 'mg' ? r.sm : r.sl, at = stop ? (g.stop?.[stop] ?? g.steps.length) : g.steps.length;
        return g.steps.map((s, ix) => [stop ? (ix < at ? 'past' : ix === at ? 'stop' : 'no') : '', N(s.n) + '곳', s.t]); });
      want('깔때기', JSON.stringify(nw.funnel), JSON.stringify(fx));
      want('다시 셈 줄', nw.small?.[0], `${HOW} — 새 1년 성적표가 나오면 다시 셉니다.`);
      want('깔때기 접은 칸 이름', JSON.stringify(nw.sums), JSON.stringify(['깔때기 두 가지 — 어디서 멈췄나 보기']));
    }
  }
  const nextOk = nw.next[0] === '#/w/' + code + '/past' || nw.next[0] === '/atlas/#/c/' + code + '/past';
  if (!nextOk || !norm(nw.next[1]).includes('4단 지나온 길') || !norm(nw.next[1]).includes('1년 · 3년 주가 · 해마다 번 돈 · 회사 크기') || !norm(nw.next[1]).startsWith('다음')) fail('다음 단', where + ' ' + JSON.stringify(nw.next));
  want('자료 줄', nw.foot[0], FOOT);
  if (core.provisional) warnCheck(nw, where); // 장 중 값: 「?」 한 줄 + 누르면 펼침
  else if (nw.foot.length !== 1 || nw.warn) fail('자료 줄 수', where + ' ' + nw.foot.length);
  headCheck(nw, code, o, c, where);
  for (const [k, n] of Object.entries(nw.words)) fail('옛 낱말 남음', where + ' 「' + k + '」 ' + n + '번(글 · aria-label · title · alt · 창 제목)');
  for (const w of BANNED) if (nw.pco.includes(w)) fail('쓰지 않을 말', where + ' 「' + w + '」');
  for (const hr of nw.hrefs) { bump('고리'); if (!(hr === '#/w/' + code + '/past' || hr === '/atlas/#/c/' + code + '/past')) fail('모르는 고리', where + ' ' + hr); }
  if (nw.canvas) fail('캔버스', where);
  if (pn._errs.length) { fail('화면 오류', where + ' ' + pn._errs.join(' | ').slice(0, 200)); pn._errs.length = 0; }
  po._errs.length = 0;
  bump('회사'); bump(pk ? '고른 곳' : '고른 곳 밖');
}
await po.context().close(); await pn.context().close();

/* ④ 빈 날 길 — 자료를 바꿔치기 · 못 받게 해서 「?」 줄이 옛 쪽 뜻대로 나오는지(화면마다 새 칸 — 받아 둔 자료가 섞이지 않게) */
{
  const pkC = codes.find(isPk), outC = codes.find(c => !isPk(c) && NAME.get(c)?.s === 'out' && (CO[c].l || []).some(x => x != null));
  const json = (r, body) => r.fulfill({status: 200, contentType: 'application/json', body: JSON.stringify(body)});
  const NET = /Failed to load resource|net::ERR|503 \(Service Unavailable\)/;
  const cases = [
    ['장 중 값(provisional)', outC, [['**/atlas/data/core.json', r => json(r, {...core, provisional: true})]], nw => { warnCheck(nw, '빈 날 길 장 중 값'); }],
    ['회사 파일 못 받음', outC, [['**/atlas/data/co/' + outC + '.json', r => r.fulfill({status: 503, body: ''})]], nw => {
      if (!norm(nw.pco).includes('? 회사 자료를 받지 못했어요')) fail('빈 날 길', '회사 파일 못 받음 — 「?」 줄 없음 · ' + norm(nw.pco).slice(0, 80));
      want0('빈 날 길 · 밖인 까닭', nw.why, NAME.get(outC).w); if (nw.trio?.length) fail('빈 날 길', '회사 파일 못 받음 — 세 숫자가 나옴'); }],
    ['이름표 못 받음', outC, [['**/atlas/data/names.json', r => r.fulfill({status: 503, body: ''})]], nw => { if (!norm(nw.box).includes('? 까닭을 못 읽었습니다')) fail('빈 날 길', '이름표 못 받음 — ' + norm(nw.box).slice(0, 80)); }],
    ['고른 곳 자료 못 받음', pkC, [['**/atlas/data/comp.json', r => r.fulfill({status: 503, body: ''})]], nw => { if (!norm(nw.pco).includes('? 회사 자료를 받지 못했어요')) fail('빈 날 길', '고른 곳 자료 못 받음 — ' + norm(nw.pco).slice(0, 80)); }],
    ['든 까닭 없음', pkC, [['**/atlas/data/comp.json', r => json(r, {...comp, companies: {...COMP, [pkC]: {...COMP[pkC], pick: null}}})]], nw => { if (!norm(nw.box).includes('? 든 까닭을 못 읽었습니다')) fail('빈 날 길', '든 까닭 없음 — ' + norm(nw.box).slice(0, 80)); }],
  ];
  function want0(k, got, exp) { bump('따로 셈'); if (norm(got) !== norm(exp)) fail(k, '「' + norm(got).slice(0, 100) + '」 ≠ 「' + norm(exp).slice(0, 100) + '」'); }
  for (const [name, code, routes, check] of SH.part('e', cases, 40, x => x[0])) {
    if (!code) { fail('빈 날 길', name + ' — 회사를 못 고름'); continue; }
    const p = await page(390, 900, false);
    for (const [pat, fn] of routes) await p.route(pat, fn);
    const nw = await newGrab(p, code);
    if (!nw || nw.none) fail('빈 날 길 안 열림', name + ' ' + code); else check(nw);
    const errs = p._errs.filter(e => !NET.test(e)); if (errs.length) fail('화면 오류', '빈 날 길 ' + name + ' ' + errs.join(' | ').slice(0, 200));
    for (const w of BANNED) if (nw?.pco?.includes(w)) fail('쓰지 않을 말', '빈 날 길 ' + name + ' 「' + w + '」');
    bump('빈 날 길');
    await p.context().close();
  }
}

/* ③ 세 폭 — 표본 앞쪽(모자란 자료 · 고른 곳 · 밖)에서 NW 곳 */
const wl = [...new Set([...list.slice(0, Math.ceil(NW / 2)), ...list.filter(isPk).slice(0, Math.ceil(NW / 4)), ...list.filter(c => !isPk(c)).slice(-Math.ceil(NW / 4))])].slice(0, NW);
for (const w of SH.part('w', [320, 360, 390], 30 * wl.length)) { // 무게 = 회사 하나(약 0.04초)의 몇 배 — 폭 하나 약 38초(2026-10-18 깃허브 39091891146)
  const p = await page(w, 640);
  for (const code of wl) {
    const nw = await newGrab(p, code); if (!nw || nw.none) { fail('세 폭 안 열림', w + ' ' + code); continue; }
    const g = await p.evaluate(() => {
      const vw = document.documentElement.clientWidth, s = document.querySelector('#view .pco'), bad = [], small = [], tiny = [];
      for (const e of s.querySelectorAll('*')) {
        if (e instanceof SVGElement && e.tagName !== 'svg') continue;
        const r = e.getBoundingClientRect(); if (!r.width && !r.height) continue;
        if (r.right > vw + 0.5 || r.left < -0.5) bad.push((e.className?.baseVal ?? e.className) + ' ' + Math.round(r.left) + '~' + Math.round(r.right));
        if ([...e.childNodes].some(n => n.nodeType === 3 && n.textContent.trim())) { const fz = parseFloat(getComputedStyle(e).fontSize); if (fz < 16.9) tiny.push(e.tagName + '.' + e.className + ' ' + fz + 'px 「' + e.textContent.trim().slice(0, 20) + '」'); }
      }
      for (const e of s.querySelectorAll('a, button, summary')) { const r = e.getBoundingClientRect(); if (r.width && (r.width < 43.5 || r.height < 43.5)) small.push(e.textContent.trim().slice(0, 20) + ' ' + Math.round(r.width) + '×' + Math.round(r.height)); }
      return {sw: document.documentElement.scrollWidth, vw, bad: bad.slice(0, 6), small: small.slice(0, 6), tiny: tiny.slice(0, 6)};
    });
    const where = w + ' ' + code;
    await p.waitForFunction(() => document.getAnimations().every(a => a.playState !== 'running' || !Number.isFinite(a.effect?.getComputedTiming?.().endTime)), null, {timeout: 4000}).catch(() => {}); // 끝이 있는 움직임이 끝난 뒤에 잼
    layoutCheck(await p.evaluate(LAYOUT), w, code);
    if (g.sw > g.vw) fail('가로 넘침', where + ' ' + g.sw + '>' + g.vw);
    for (const x of g.bad) fail('칸 밖으로 넘침', where + ' ' + x);
    for (const x of g.small) fail('누르는 자리 44px 안 됨', where + ' ' + x);
    for (const x of g.tiny) fail('글 17px 안 됨', where + ' ' + x);
    if (p._errs.length) { fail('화면 오류', where + ' ' + p._errs.join(' | ').slice(0, 200)); p._errs.length = 0; }
    bump('세 폭 화면');
  }
  await p.context().close();
}
/* ③-2 아주 큰 글씨(html.f2 · 320 폭) — 앞 두 곳: 가로 넘침 0 · 탭 넷이 화면 안 · 오늘 값이 보임 */
for (const _ of SH.part('b', ['아주 큰 글씨'], 2 * 2)) {
  const p = await page(320, 640); await p.context().addInitScript(() => { try { localStorage.setItem('atlas:font', '2'); } catch { /* 기억 못 함 */ } });
  for (const code of wl.slice(0, 2)) {
    const nw = await newGrab(p, code); if (!nw || nw.none) { fail('큰 글씨 안 열림', code); continue; }
    await p.waitForFunction(() => document.getAnimations().every(a => a.playState !== 'running' || !Number.isFinite(a.effect?.getComputedTiming?.().endTime)), null, {timeout: 4000}).catch(() => {});
    const g = await p.evaluate(() => ({f2: document.documentElement.classList.contains('f2') || document.documentElement.classList.contains('f3'), sw: document.documentElement.scrollWidth, vw: document.documentElement.clientWidth}));
    if (!g.f2) fail('큰 글씨 모양이 안 켜짐', code);
    if (g.sw > g.vw) fail('큰 글씨 가로 넘침', code + ' ' + g.sw + '>' + g.vw);
    const L = await p.evaluate(LAYOUT);
    if (L.tabs.length !== 4 || L.tabs.some(t => t[1] < -0.5 || t[2] > L.vw + 0.5)) fail('큰 글씨에서 탭이 화면 밖', code + ' ' + JSON.stringify(L.tabs));
    if (L.tabs.some(t => t[3] < 43.5)) fail('큰 글씨 탭 누르는 자리 44px 안 됨', code + ' ' + JSON.stringify(L.tabs));
    if (L.small.length) fail('큰 글씨 글 17px 아래', code + ' ' + L.small.join(' / '));
    bump('큰 글씨 화면');
  }
  await p.context().close();
}
await b.close();
const res = {schema: 'atlas11-next-co-check-1', at: new Date().toISOString(), base, asOf: mkt.asOf, companies: list.length, all: ALL, limit: LIMIT || null, widths: wl.length, ...SH.info(), seconds: Math.round((Date.now() - t0) / 1000), time: tm.get(), net: netSummary(), counts, fails, ok: !fails.length};
if (out) { await fs.mkdir(path.dirname(path.resolve(out)), {recursive: true}); await fs.writeFile(path.resolve(out), JSON.stringify(res, null, 1) + '\n'); }
const kinds = {}; for (const [k] of fails) kinds[k] = (kinds[k] || 0) + 1;
console.log(JSON.stringify({ok: res.ok, companies: res.companies, widths: res.widths, seconds: res.seconds, time: res.time, net: res.net, counts, kinds, fails: fails.slice(0, 15)}, null, 0));
process.exit(res.ok ? 0 : 1);
