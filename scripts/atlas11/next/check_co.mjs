// 3단 회사 자세히(새 아틀란스 /next/ 보는 화면 #/w/<번호> 의 .pco 칸 · site/next/p-co.js) — 지금 아틀란스 3단(/atlas/#/c/<번호>)과 맞대는 검사
//   사장님 2026-10-17(싱가포르) 04:04 「첫화면 부터 마지막 페이지 까지 모두 바꿔」 · 04:23 「정말 빠르면서도 정밀하게」
//   쓰는 법: node scripts/atlas11/next/check_co.mjs --base http://127.0.0.1:8826 [--all | --limit N] [--widths N] [--pw /opt/node-tools/] [--out 파일]
//     기본 = 고른 표본 200곳(모자란 자료 · 고른 곳 56곳 모두 · 1곳 업종 · 「?」 이름표 · 1년 값 없음 · 한글 아닌 끝 글자 · 큰 % · 나머지는 고르게) · --all = 모든 회사 · --limit N = 그 차례의 앞 N곳
//     --widths N = 세 폭(320 · 360 · 390)에서 볼 회사 수(기본 10 · --all 이면 30)
//   ① 옛 3단 #view 글(접은 칸 펼침 · 위치 줄 · 7단 칸 이름 · 그림 눈금 · 사이트 맨 아래 고리 · 옛 맺음 글만 뺌)의 줄이 새 main#view 에 빠짐없이 — 숫자 낱말 · 「?」는 수까지
//   ② 자료로 따로 셈 — 7단 중 3단 · 시장 · 번호 · 1주 값 · 고른 곳 줄 · 세 숫자 · 100만 원 줄 · 출처 · 범례 · 고른 날 금빛 세로선(고른 곳만) · 업종 평균 점선(2곳 넘는 업종만) ·
//      그림 눈금(옛 쪽과 같은 수) · 왜 들었나요?(해마다 값) / 왜 밖인가요?(멈춘 자리 · 까닭 · 깔때기 두 갈래) · 다음 챕터 고리 · 자료 줄 · 안전 문장
//   ③ 세 폭 — 가로 넘침 0 · .pco 안 글 17px 넘게 · 누르는 자리 44px 넘게 · 쓰지 않을 말 0 · 캔버스 0 · 화면 오류 0
//   실패가 하나라도 있으면 끝 코드 1 · --out 이면 결과 파일
import fs from 'node:fs/promises';
import path from 'node:path';
import {createRequire} from 'node:module';
import {oldToNewDeep, NEW_NAME} from './rename.mjs'; // 이름 바꾸기(2026-10-17 아틀란스 → 보드리)
const arg = (k, d) => { const i = process.argv.indexOf(k); return i > 0 ? process.argv[i + 1] : d; };
const has = k => process.argv.includes(k);
const require = createRequire(arg('--pw', '/opt/node-tools/'));
const {chromium} = require('playwright');
const base = arg('--base', 'http://127.0.0.1:8826').replace(/\/$/, ''), out = arg('--out', null);
const ALL = has('--all'), LIMIT = Number(arg('--limit', '0')) || 0, NW = Number(arg('--widths', ALL ? '30' : '10'));
const fails = [], counts = {}, t0 = Date.now();
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

const getJ = async f => { const r = await fetch(base + '/atlas/data/' + f, {cache: 'no-store'}); if (!r.ok) throw Error(f + ' ' + r.status); return r.json(); };
const [core, mkt, comp, lines, names] = await Promise.all(['core.json', 'mkt.json', 'comp.json', 'lines.json', 'names.json'].map(f => getJ(f).catch(e => { fail('자료', e.message); return null; })));
if (!core || !mkt || !comp || !lines || !names) { console.error('자료를 못 받음'); process.exit(1); }
const CO = mkt.companies, codes = Object.keys(CO), COMP = comp.companies, LINES = lines.lines;
const IND = new Map(core.industries.map(i => [i.name, i]));
const NAME = new Map(names.rows.map(r => [r.c, r]));
const PN = `${core.rules?.name ?? '고른'} ${core.funnel?.picked ?? '?'}곳`;
const HOW = `멍거 갈래는 3년 성적표만, 린치 갈래는 3년 성적표와 ${core.rules?.lyDay ? MD(core.rules.lyDay) : '모음 날'} 값으로 골랐습니다`;
const FOOT = `자료: ${core.sources?.price ?? '?'} · 기준일 = 마지막 종가 날(${MD(core.asOf)})의 ${core.days}거래일 전(${MD(core.base)}) · ${PN} — ${HOW}(그 뒤 주가는 안 씀).`;

/* 표본 — 모자란 자료 먼저 · 고른 곳 모두 · 나머지는 고르게 */
const isPk = c => !!COMP[c];
const lineOf = async c => (isPk(c) ? {c: COMP[c], line: LINES[c]} : await getJ('co/' + encodeURIComponent(c) + '.json'));
function sample() {
  const pick = [], seen = new Set(), add = c => { if (c && CO[c] && !seen.has(c)) { seen.add(c); pick.push(c); } };
  const allNull = codes.filter(c => !(CO[c].l || []).some(x => x != null)); allNull.forEach(add);
  const pk = codes.filter(isPk);
  add(pk.find(c => COMP[c].pick?.mg && COMP[c].pick?.ly)); add(pk.find(c => COMP[c].pick?.ly && !COMP[c].pick?.mg)); add(pk.find(c => COMP[c].pick?.mg && !COMP[c].pick?.ly));
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
const list = sample();

const exe = '/opt/pw-browsers/chromium', b = await chromium.launch((await fs.stat(exe).catch(() => null)) ? {executablePath: exe} : {});
async function page(width, height = 900) {
  const ctx = await b.newContext({viewport: {width, height}, deviceScaleFactor: 1, hasTouch: true});
  const p = await ctx.newPage(); p._errs = [];
  p.on('pageerror', e => p._errs.push(e.message)); p.on('console', m => { if (m.type() === 'error') p._errs.push(m.text()); });
  return p;
}
async function hashGo(p, url, hash) { if (!p.url().startsWith(url)) await p.goto(url + hash); else await p.evaluate(x => { location.hash = x; }, hash); }

/* 옛 쪽 — 3단 회사 화면이 다 그려지고(이름표 까닭까지) 나서 글을 뽑음 */
async function oldGrab(p, code) {
  await hashGo(p, base + '/atlas/', '#/c/' + code);
  const ok = await p.waitForFunction(n => { const v = document.querySelector('#view .vw'); if (!v || v.querySelector('.boot')) return false; if (v.querySelector('h1.head')?.textContent === '없는 주소입니다') return true;
    return v.querySelector('.co-head h1')?.textContent === n && !!v.querySelector('.foot') && !v.innerText.includes('까닭을 받는 중'); }, CO[code].n, {timeout: 20000}).then(() => true).catch(() => false);
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
async function newGrab(p, code) {
  await hashGo(p, base + '/next/?dev=1', '#/w/' + code);
  const ok = await p.waitForFunction(n => { const v = document.querySelector('#view'); if (!v || v.querySelector('.boot') || v.querySelector('.wt')?.textContent !== n) return false;
    if (v.innerText.includes('회사 자세히를 그리지 못했어요')) return true;
    const s = v.querySelector('.pco'); if (!s || s.innerText.includes('까닭을 받는 중')) return false;
    const w = s.querySelector('.pco-lc'), g = w?.querySelector('svg'); if (!w) return true; // 회사 자료를 못 받은 길 — 그림 없음
    return !!w.querySelector(':scope > .pco-q') || (!!g && Math.abs(+g.getAttribute('width') - Math.max(260, Math.round(w.getBoundingClientRect().width))) < 1.5); }, CO[code].n, {timeout: 20000}).then(() => true).catch(() => false);
  if (!ok) return null;
  return p.evaluate(() => {
    const v = document.querySelector('#view'), s = v.querySelector('.pco');
    v.querySelectorAll('details').forEach(d => { d.open = true; });
    if (!s) return {text: v.innerText, none: true};
    const q = sel => s.querySelector(sel), T = e => e?.textContent ?? null;
    return {
      text: v.innerText, pco: s.innerText,
      kind: T(q('.pco-kind')), meta: T(q('.pco-meta')), chip: T(q('.pco-chip')), chipPk: !!q('.pco-chip.pk .pco-badge'),
      trio: [...s.querySelectorAll('.pco-trio > div')].map(d => [T(d.querySelector('span')), T(d.querySelector('b')), d.querySelector('b')?.className ?? '']),
      won: T(q('.pco-won')), src: T(q('.pco-src')), key: [...s.querySelectorAll('.pco-key > span')].map(T),
      gold: s.querySelectorAll('.pco-lc line.pco-pick').length, yl: T(q('.pco-yl')), avg: s.querySelectorAll('.pco-lc path.pco-avg').length, coPath: s.querySelectorAll('.pco-lc path.pco-co').length,
      lcq: T(q('.pco-lc > .pco-q')), ax: [...s.querySelectorAll('.pco-ax span')].map(T), ticks: [...s.querySelectorAll('.pco-yr span')].map(T),
      boxH: T(q('.pco-box > h2')), box: q('.pco-box')?.innerText ?? '', hon: T(q('.pco-hon')), lead: T(q('.pco-lead')), why: T(q('.pco-why')),
      funnel: [...s.querySelectorAll('.pco-funnel')].map(ol => [...ol.children].map(li => [li.className, T(li.querySelector('b')), T(li.querySelector('span > span'))])),
      fname: [...s.querySelectorAll('.pco-fname')].map(T), small: [...s.querySelectorAll('.pco-small')].map(T),
      next: [q('a.pco-next')?.getAttribute('href') ?? null, T(q('a.pco-next'))], foot: [...s.querySelectorAll('.pco-foot')].map(T), safe: T(q('.pco-safe')),
      hrefs: [...s.querySelectorAll('a[href]')].map(a => a.getAttribute('href')), canvas: s.querySelectorAll('canvas').length,
    };
  });
}

/* ①② 회사마다 */
const po = await page(390), pn = await page(390);
for (const code of list) {
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
  for (const raw of old.text.split('\n')) { const l = norm(raw); if (!l || /^[›‹·]$/.test(l)) continue; bump('줄'); if (!NT.includes(l)) fail('옛 줄 빠짐', where + ' 「' + l.slice(0, 90) + '」'); }
  const oc = tokCount(old.text), nc = tokCount(nw.text);
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
  const trioW = [[`${core.days}거래일`, P(c.chg)], ['1년', P(c.r1y)], [`가장 깊이 빠짐(${core.days}거래일)`, P(c.mdd)]];
  want('세 숫자', JSON.stringify(nw.trio.map(x => [x[0], x[1]])), JSON.stringify(trioW));
  nw.trio.forEach((x, k) => { const v = [c.chg, c.r1y, c.mdd][k], cl = v == null || !Number.isFinite(v) ? 'q' : R1(v) > 0 ? 'up' : R1(v) < 0 ? 'dn' : 'fl'; if (!x[2].split(' ').includes(cl)) fail('세 숫자 색', where + ' ' + x[0] + ' ' + x[2] + ' ≠ ' + cl); });
  const lv = line.filter(x => x != null).map(x => x / 100), low = lv.length ? Math.min(...lv) : null, last = lv.length ? lv[lv.length - 1] : null, MAN = x => N(Math.round(x)) + '만 원';
  want('100만 원 줄', nw.won, low == null ? '? 값을 못 읽었습니다' : low < 100 ? `${MD(core.base)}에 100만 원어치였다면 가장 낮을 때 ${MAN(low)} · 끝 ${MAN(last)}` : `${MD(core.base)}에 100만 원어치였다면 그보다 낮아진 적 없이 끝 ${MAN(last)}`);
  want('출처 줄', nw.src, `네이버 증권 · ${MD(c.priceDate || core.asOf)} 종가 · ${NEW_NAME} 셈`);
  const multi = (I?.n ?? 1) > 1, pickLine = pk && core.kPick != null;
  want('범례', JSON.stringify(nw.key), JSON.stringify([`${c.name} — ${MD(core.base)}보다 위 빨강 · 아래 파랑`, ...(multi ? [I.name + ' 평균'] : []), ...(pickLine ? [`고른 날 ${MD(core.pickAsOf)}`] : [])]));
  if (low == null) want('값 없는 그림', nw.lcq, `? 이 회사 ${core.days}거래일 값을 못 읽었습니다`);
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
    }
  }
  const nextOk = nw.next[0] === '#/w/' + code + '/past' || nw.next[0] === '/atlas/#/c/' + code + '/past';
  if (!nextOk || !norm(nw.next[1]).includes('4단 지나온 길') || !norm(nw.next[1]).includes('1년 · 3년 주가 · 해마다 번 돈 · 몸값')) fail('다음 챕터', where + ' ' + JSON.stringify(nw.next));
  want('자료 줄', nw.foot[0], FOOT);
  if (core.provisional) want('장 중 값 「?」', nw.foot[1], `? ${MD(core.asOf)} 값은 그날 저녁 8시 전에 받아 아직 바뀔 수 있습니다(시간외 · 넥스트레이드) — 다음 받기에서 고쳐집니다.`);
  else if (nw.foot.length !== 1) fail('자료 줄 수', where + ' ' + nw.foot.length);
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
    ['장 중 값(provisional)', outC, [['**/atlas/data/core.json', r => json(r, {...core, provisional: true})]], nw => { want0('장 중 값 「?」', nw.foot?.[1], `? ${MD(core.asOf)} 값은 그날 저녁 8시 전에 받아 아직 바뀔 수 있습니다(시간외 · 넥스트레이드) — 다음 받기에서 고쳐집니다.`); }],
    ['회사 파일 못 받음', outC, [['**/atlas/data/co/' + outC + '.json', r => r.fulfill({status: 503, body: ''})]], nw => {
      if (!norm(nw.pco).includes('? 회사 자료를 받지 못했어요')) fail('빈 날 길', '회사 파일 못 받음 — 「?」 줄 없음 · ' + norm(nw.pco).slice(0, 80));
      want0('빈 날 길 · 밖인 까닭', nw.why, NAME.get(outC).w); if (nw.trio?.length) fail('빈 날 길', '회사 파일 못 받음 — 세 숫자가 나옴'); }],
    ['이름표 못 받음', outC, [['**/atlas/data/names.json', r => r.fulfill({status: 503, body: ''})]], nw => { if (!norm(nw.box).includes('? 까닭을 못 읽었습니다')) fail('빈 날 길', '이름표 못 받음 — ' + norm(nw.box).slice(0, 80)); }],
    ['고른 곳 자료 못 받음', pkC, [['**/atlas/data/comp.json', r => r.fulfill({status: 503, body: ''})]], nw => { if (!norm(nw.pco).includes('? 회사 자료를 받지 못했어요')) fail('빈 날 길', '고른 곳 자료 못 받음 — ' + norm(nw.pco).slice(0, 80)); }],
    ['든 까닭 없음', pkC, [['**/atlas/data/comp.json', r => json(r, {...comp, companies: {...COMP, [pkC]: {...COMP[pkC], pick: null}}})]], nw => { if (!norm(nw.box).includes('? 든 까닭을 못 읽었습니다')) fail('빈 날 길', '든 까닭 없음 — ' + norm(nw.box).slice(0, 80)); }],
  ];
  function want0(k, got, exp) { bump('따로 셈'); if (norm(got) !== norm(exp)) fail(k, '「' + norm(got).slice(0, 100) + '」 ≠ 「' + norm(exp).slice(0, 100) + '」'); }
  for (const [name, code, routes, check] of cases) {
    if (!code) { fail('빈 날 길', name + ' — 회사를 못 고름'); continue; }
    const p = await page(390);
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
for (const w of [320, 360, 390]) {
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
    if (g.sw > g.vw) fail('가로 넘침', where + ' ' + g.sw + '>' + g.vw);
    for (const x of g.bad) fail('칸 밖으로 넘침', where + ' ' + x);
    for (const x of g.small) fail('누르는 자리 44px 안 됨', where + ' ' + x);
    for (const x of g.tiny) fail('글 17px 안 됨', where + ' ' + x);
    if (p._errs.length) { fail('화면 오류', where + ' ' + p._errs.join(' | ').slice(0, 200)); p._errs.length = 0; }
    bump('세 폭 화면');
  }
  await p.context().close();
}
await b.close();
const res = {schema: 'atlas11-next-co-check-1', at: new Date().toISOString(), base, asOf: mkt.asOf, companies: list.length, all: ALL, limit: LIMIT || null, widths: wl.length, seconds: Math.round((Date.now() - t0) / 1000), counts, fails, ok: !fails.length};
if (out) { await fs.mkdir(path.dirname(path.resolve(out)), {recursive: true}); await fs.writeFile(path.resolve(out), JSON.stringify(res, null, 1) + '\n'); }
const kinds = {}; for (const [k] of fails) kinds[k] = (kinds[k] || 0) + 1;
console.log(JSON.stringify({ok: res.ok, companies: res.companies, widths: res.widths, seconds: res.seconds, counts, kinds, fails: fails.slice(0, 15)}, null, 0));
process.exit(res.ok ? 0 : 1);
