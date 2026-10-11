#!/usr/bin/env node
// 새 ATLAS(aaa7377.com/atlas/) 화면 빠짐없이 돌기 — 첫 화면 · 갈래 · 업종(1곳뿐인 업종은 회사로 넘어감) · 회사 365 · 업종 탭 · 36곳 · 도움말 · 찾기 · 365곳 밖
//   2026-10-11 11:43 대세 365곳(d365-v1): 회사 화면 「왜 365곳에 들었나요?」 층 · 대세 순서 · 업종 · 회사 30거래일 · 일부만 든 업종 글 · 도움말 층마다 가운데값 · 깔때기 숫자 · 36곳 시험 글(자료대로)도 맞댐
//   쓰는 법: node scripts/atlas11/t365/site_check.mjs --base http://127.0.0.1:8899 [--pw /opt/node-tools/] [--out reports/atlas11/verify/atlas-new-check-latest.json]
//   폭 셋(360×640 · 390×844 · 900×900) × 글씨 셋(보통 · 크게 · 아주 크게 — 360 에서만 셋, 나머지는 보통)마다 화면마다 본다:
//     오류 0(보안 규칙 CSP 걸림 포함) · 옆 넘침 0 · 보이는 글씨 21px 이상 · 누르는 자리 44px 이상 · 금지 말 0 · 캔버스 · 3D 0 · 작은 네모 20개 이상(바둑판) 0
//     글자 대비(2026-10-11 13:29 「고급스럽게 … 구글팀이라면」) — 보이는 글마다 글자색 ÷ 뒤 바탕(조상 바탕색 · 번짐 색 마디를 겹쳐 셈 · 경주판 줄은 막대 색까지)이
//       보통 글 4.5 · 큰 글(24px 이상 · 굵은 18.66px 이상) 3 넘게(WCAG 2.2 1.4.3) · 못 가는 단(흐린 칸)은 빼고 셈
//     숫자 = 자료(머리 % · 오름/내림 수 · 줄마다 % · 회사 세 숫자 · 1주 값 — 3단 회사 · 4단 처음과 끝) · 3번 누르면 회사 · 4번이면 4단 · 5번이면 5단(첫 화면에서 링크를 따라 가장 짧은 누름 수)
//   틀린 것이 하나라도 있으면 끝 코드 1
import fs from 'node:fs';
import path from 'node:path';
import {createRequire} from 'node:module';
const arg = (k, d) => { const i = process.argv.indexOf(k); return i < 0 ? d : process.argv[i + 1]; };
const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), '../../..');
const base = arg('--base', 'http://127.0.0.1:8899'), out = path.resolve(ROOT, arg('--out', 'reports/atlas11/verify/atlas-new-check-latest.json'));
const require = createRequire(arg('--pw', '/opt/node-tools/'));
const {chromium} = require('playwright');
const exe = ['/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell'].find(f => fs.existsSync(f));
const core = JSON.parse(fs.readFileSync(path.join(ROOT, 'site/atlas/data/core.json'), 'utf8'));
const comp = JSON.parse(fs.readFileSync(path.join(ROOT, 'site/atlas/data/comp.json'), 'utf8')).companies;
const pick = JSON.parse(fs.readFileSync(path.join(ROOT, 'site/atlas/data/pick36.json'), 'utf8'));
const days = JSON.parse(fs.readFileSync(path.join(ROOT, 'site/atlas/data/days.json'), 'utf8'));
const upd = JSON.parse(fs.readFileSync(path.join(ROOT, 'site/atlas/data/updates.json'), 'utf8')); // 업데이트 탭(사장님 12:41)
const tdata = fs.existsSync(path.join(ROOT, 'site/atlas/data/time.json')) ? JSON.parse(fs.readFileSync(path.join(ROOT, 'site/atlas/data/time.json'), 'utf8')) : null; // 봉인 시간(14:37 · 14:39 「3년후 5년후 10년후 이야기」)
const coOf = c => JSON.parse(fs.readFileSync(path.join(ROOT, 'site/atlas/data/co', c + '.json'), 'utf8'));
const BANNED = ['예측', '예외 없이', '절대', '상승 신호', '폭락 경보기', '팔 때', '들어갈 때', '시작을 맞힌다', '곧 오른다', '오를 것', '내릴 것', '사라', '팔라', '추천', '목표가', '확실', '보장', '무조건', '확률'];
const r1 = x => Math.floor(x * 10 + 0.5 + 1e-7) / 10;
const md = d => `${+d.slice(5, 7)}월 ${+d.slice(8, 10)}일`;
const ymd = d => d.slice(0, 4) + '년 ' + md(d);
const won100 = m => (m == null ? '?' : Math.round(m * 100).toLocaleString('ko-KR') + '만 원');
const ddayText = d => { const k = new Date(Date.now() + 9 * 36e5), t = Date.UTC(k.getUTCFullYear(), k.getUTCMonth(), k.getUTCDate()); const [y, m, x] = d.split('-').map(Number), n = Math.round((Date.UTC(y, m - 1, x) - t) / 864e5); return n > 0 ? 'D-' + n.toLocaleString('ko-KR') : n === 0 ? '오늘 엶' : '엶 날 지남 — 다시 셀 차례'; }; // 화면과 같은 꼴(서울 오늘부터)
// 사장님 2026-10-11 09:37 「기준일을 항상 현재 날짜에서 지난 20일 거래로」 — 화면 어디에도 옛 3개월 창(「3개월」 · 옛 기준일 7월 6일)이 남지 않았는지 · 기준일 = 마지막 종가 날의 20거래일 전인지
const cal = JSON.parse(fs.readFileSync(path.join(ROOT, 'public/data/input.json'), 'utf8')).calendar.sessions;
const W20 = cal.filter(d => d <= core.asOf).slice(-21);
if (core.base !== W20[0] || core.days !== 20 || JSON.stringify(core.dates) !== JSON.stringify(W20)) { console.error('기준일이 마지막 종가 날의 20거래일 전이 아님', core.base, W20[0], core.days); process.exit(1); }
// 방향 · 세기 · 힘 글(11:04 · 11:10 「이 화면에서 나와야 해」) — 화면 trText 와 같은 꼴
const trText = t => (t.d === 'up' ? '▲ ' : t.d === 'down' ? '▼ ' : '▶ ') + (t.s === 'strong' ? '강하게 ' : '') + {up: '오름', down: '내림', flat: '옆걸음'}[t.d] + (t.t === 'gain' ? ' · 힘 붙음' : t.t === 'fade' ? ' · 힘 빠짐' : '');
const pct = x => { if (x == null) return '?'; const v = r1(x), a = Math.abs(v); return (v > 0 ? '+' : v < 0 ? '−' : '') + (a >= 100 ? Math.floor(a + 0.5 + 1e-7).toLocaleString('ko-KR') : a.toFixed(1)) + '%'; };

const routes = ['#/', '#/list', '#/36', '#/up', ...(tdata ? ['#/time'] : []), ...core.groups.map(g => '#/g/' + g.id), ...core.industries.filter(i => i.n > 1).map(i => '#/i/' + encodeURIComponent(i.name)), ...Object.keys(comp).map(c => '#/c/' + c), ...Object.keys(comp).map(c => `#/c/${c}/past`), ...Object.keys(comp).map(c => `#/c/${c}/range`), '#/info'];
const fails = []; let screens = 0, numbers = 0;
const fail = (where, what) => fails.push({where, what});

function expect(route) {
  // 화면마다 자료에서 따로 만든 기대 글(보기 = 한 회사 한 표)
  const [, kind, arg] = route.match(/^#\/(\w*)\/?(.*)$/) || [];
  if (kind === 'g') { const g = core.groups.find(x => x.id === arg); return {step: 1, head: pct(g.chg), up: g.up, down: g.down, rows: g.inds.map(n => { const i = core.industries.find(x => x.name === n); return [n, pct(i.chg)]; }), trh: trText(g.tr), trd: g.inds.map(n => trText(core.industries.find(x => x.name === n).tr))}; }
  if (kind === 'i') { const i = core.industries.find(x => x.name === decodeURIComponent(arg)); return {step: 2, head: pct(i.chg), up: i.up, down: i.down, rows: i.members.map(c => [comp[c].name, pct(comp[c].chg)]), trh: trText(i.tr)}; }
  if (kind === 'c') {
    const [code, sub] = arg.split('/'), c = comp[code];
    if (!sub) { const q = c.pick, why = [{1: '1층 — 두 팀 모두 「대세」로 본 업종', 2: `2층 — ${q.google ? '구글팀' : 'CIA팀'}만 「대세」로 본 업종`, 3: '3층 — 대세에 가까운 순서로 채운 업종'}[q.tier],
        `「${q.sector}」 · ${core.funnel.sectors}업종 가운데 대세 순서 ${q.srank}번째`, `업종 ${pct(q.schg)} · 이 회사 ${q.r30 == null ? '? 셈 못 함' : pct(q.r30)}`, `많이 오른 순 ${q.srank}번째`];
      if (q.part) why.push(`${q.inN}곳만 넣었습니다 — 이 회사는 ${q.prank}번째`);
      return {step: 3, trio: [pct(c.chg), pct(c.r1y), pct(c.mdd)], price: Math.round(c.price).toLocaleString('ko-KR') + '원', axis: md(core.base) + ' = 100', why}; }
    if (sub === 'past') { // 4단 — 처음 보기 1년(253거래일) · 자료 파일에서 따로 셈
      const co = coOf(code), n = days.dates.length, from = Math.max(co.k0, n - 253), cl = co.close.slice(from - co.k0).filter(x => x != null);
      const base = cl[0], last = cl.at(-1); let peak = 0, m = 0; for (const x of cl) { peak = Math.max(peak, x); m = Math.min(m, x / peak - 1); }
      const wn = x => Math.round(x).toLocaleString('ko-KR') + '원';
      return {step: 4, trio: [pct((last / base - 1) * 100), pct(m * 100), pct((last / peak - 1) * 100)], price: [wn(base), wn(last)]}; // 처음 · 끝 1주 값
    }
    const k = pick.companies[code];
    return {step: 5, dirs: k && k.ok ? k.win.map((w, j) => [`번 길 ${r1(w).toFixed(1)}%`, `크게 잃는 길 ${r1(k.big[j]).toFixed(1)}%`]) : null, status: !k || !k.ok ? '? 셈 못 함' : k.rank ? `36곳 가운데 ${k.rank}번째` : k.cut ? '지움' : '남았지만 36곳 밖'};
  }
  if (!kind) { const T = core.time; return {up: core.all.up, down: core.all.down, rows: core.groups.map(g => [g.short, pct(g.chg)]), title: `지난 ${core.days}거래일 1등은 ${core.groups[0].short}`, trd: core.groups.map(g => trText(g.tr)),
    why: T ? ['3년 전', ymd(T.past.from), won100(T.past.mult365), won100(T.past.multPool), `지금 · 봉인 ${T.id}호`, ...T.opens.flatMap(o => [`${o.y}년 뒤`, ymd(o.date), ddayText(o.date)]), `${T.past.n365}곳 중 ${T.past.half}곳`, `봉인 번호 ${T.digest}`] : []}; }
  if (kind === 'time') { const K = tdata.capsules[0], P = K.past, S = K.since; return {title: `봉인 ${K.id}호 — ${md(K.seal)} 365곳`,
    why: [ymd(P.from), `${P.n365}곳`, won100(P.mult365), won100(P.med365), won100(P.multPool), `${P.half}곳`, `${P.skip365}곳은 뺐습니다`, ...K.opens.flatMap(o => [ymd(o.date), ddayText(o.date)]), K.digest, K.file, // 잠근 규칙은 접힌 칸이라 글에 안 잡힘 — site_verify ⑫ 가 봉인 파일과 맞댐
      ...(S.days ? [pct(S.chg365), pct(S.chg36), pct(S.chgPool), `봉인 뒤 ${S.days}거래일`] : ['아직 0거래일'])]}; }
  if (kind === '36') { const B = pick.backtest;
    return {p36: pick.picks.map(p => [p.name, '번 길 ' + r1(p.avg).toFixed(1) + '%']), test: B ? `${B.n}번에 대입했더니, 36곳이 365곳 평균보다 나았던 때는 ${B.wins}번` : null, total: Math.round(pick.total).toLocaleString('ko-KR') + '원',
      why: B ? [`${B.wins}번(${Math.round(B.rate * 100)}%)${B.rate < 0.5 ? '뿐' : ''}입니다`, B.passes ? '문턱을 넘었습니다' : B.meanPick < B.meanAll ? '아무거나 고른 것보다 못했습니다' : '한 달 평균은 나았지만', ...(B.skipped?.length ? [`셀 수 없어 뺀 때 ${B.skipped.length}번`] : [])] : []}; }
  if (kind === 'up') { const r0 = upd.records[0]; return {title: '업데이트 기록', why: r0 ? [{'바꿈': '바꿈', '그대로': '그대로 — 새 값 없음', '실패': '실패'}[r0.result], ...(r0.asOf ? [`고른 날 ${md(r0.asOf)}`, `기준일 ${md(r0.base)}`] : []), ...(r0.in?.length ? [`새로 든 곳 ${r0.in.length}`, `빠진 곳 ${r0.out.length}`] : [])] : ['아직 기록이 없습니다']}; }
  if (kind === 'info') return {why: [...core.facts.tiers.map(t => `${t.t}층 ${t.n}곳 ${pct(t.med)}`), ...core.funnel.steps.map(x => x.n.toLocaleString('ko-KR') + '곳')]};
  return {};
}

const b = await chromium.launch(exe ? {executablePath: exe} : {});
const plans = [[360, 640, 0], [360, 640, 1], [360, 640, 2], [390, 844, 0], [900, 900, 0]];
let moTotal = 0; // 영상 친구 그림 수(화면 × 판 합)
const links = new Map(); // 길 → 그 화면에서 누를 수 있는 길(3번 누름 셈)
for (const [w, hgt, font] of plans) {
  const ctx = await b.newContext({viewport: {width: w, height: hgt}, reducedMotion: 'reduce'});
  await ctx.addInitScript(f => { try { localStorage.setItem('atlas:font', String(f)); } catch {} }, font);
  const p = await ctx.newPage();
  const errs = []; p.on('pageerror', e => errs.push('pageerror ' + e.message)); p.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
  await p.goto(base + '/atlas/', {waitUntil: 'networkidle'});
  await p.waitForFunction(() => document.querySelector('#view h1'));
  for (const route of routes) {
    const tag = `${w}×${hgt}${font ? ' 글씨' + (font + 1) : ''} ${decodeURIComponent(route)}`;
    errs.length = 0;
    await p.evaluate(r => { location.hash = r; }, route);
    try {
      if (route === '#/info') await p.waitForFunction(() => !document.querySelector('#infoSheet').hidden && document.querySelector('#infoBody').childElementCount > 0, null, {timeout: 8000});
      else await p.waitForFunction(r => { const v = document.querySelector('#view'); return v.querySelector('h1') && (location.hash === r || (r === '#/' && location.hash === '')) && !v.querySelector('.boot'); }, route, {timeout: 8000});
    } catch { fail(tag, '그려지지 않음'); continue; }
    await p.waitForTimeout(60);
    const r = await p.evaluate(({banned}) => {
      const res = {over: document.documentElement.scrollWidth - innerWidth, small: [], taps: [], banned: [], lowc: [], canvas: document.querySelectorAll('canvas').length, d3: 0, squares: 0, links: [], text: ''};
      const sheet = document.querySelector('.sheet:not([hidden])'), scope = sheet || document.body;
      const vis = e => { const s = getComputedStyle(e); if (s.visibility === 'hidden' || s.display === 'none' || e.closest('[hidden]') || e.closest('.sr')) return false; const b = e.getBoundingClientRect(); return b.width > 0 && b.height > 0; };
      // 글자 대비 — 색 읽기 · 겹치기 · 밝기(WCAG 2)
      const P = c => { const m = /rgba?\(([^)]+)\)/.exec(c || ''); if (!m) return null; const v = m[1].split(/[\s,/]+/).filter(Boolean).map(Number); return [v[0], v[1], v[2], v.length > 3 ? v[3] : 1]; };
      const over = (t, b) => { const a = t[3] + b[3] * (1 - t[3]); return a ? [0, 1, 2].map(i => (t[i] * t[3] + b[i] * b[3] * (1 - t[3])) / a).concat(a) : [0, 0, 0, 0]; };
      const lum = c => { const f = v => { v /= 255; return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4; }; return 0.2126 * f(c[0]) + 0.7152 * f(c[1]) + 0.0722 * f(c[2]); };
      const cr = (a, b) => { const x = lum(a), y = lum(b); return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05); };
      const stopsOf = s => (s.backgroundImage && s.backgroundImage !== 'none' ? [...s.backgroundImage.matchAll(/rgba?\([^)]*\)/g)].map(m => P(m[0])).filter(Boolean) : []);
      const ROOT_BG = P(getComputedStyle(document.documentElement).backgroundColor) || [17, 20, 51, 1];
      const memo = new Map();
      const bgOf = el => { // 이 칸 뒤에 깔린 바탕 후보(번짐 색은 마디마다 하나씩) — 맨 위 불투명 바탕까지
        if (!el) return [ROOT_BG]; if (memo.has(el)) return memo.get(el);
        const s = getComputedStyle(el), c = P(s.backgroundColor) || [0, 0, 0, 0], g = stopsOf(s);
        let out = c[3] >= 1 ? [c] : bgOf(el.parentElement).map(p => (c[3] > 0 ? over(c, p) : p));
        if (g.length) out = out.flatMap(b => g.map(t => over(t, b)));
        if (out.length > 12) out = out.slice(0, 12);
        memo.set(el, out); return out;
      };
      const opa = el => { let o = 1; for (let x = el; x; x = x.parentElement) o *= +getComputedStyle(x).opacity; return o; };
      // 옆으로 잘림 — 글 칸이 넘침을 숨기는 조상(overflow) 밖으로 나가면 실패(줄임표 … 로 일부러 줄인 칸은 뺌)
      res.clip = [];
      const clipAnc = el => { const out = []; for (let x = el.parentElement; x && x !== document.body && x !== document.documentElement; x = x.parentElement) { const s = getComputedStyle(x); if (s.overflowX !== 'visible' && s.textOverflow !== 'ellipsis') out.push(x); } return out; };
      for (const e of scope.querySelectorAll('*')) {
        if (!vis(e)) continue;
        const s = getComputedStyle(e);
        if (/matrix3d|perspective/.test(s.transform) || s.perspective !== 'none') res.d3++;
        const own = [...e.childNodes].some(n => n.nodeType === 3 && n.textContent.trim());
        if (own && parseFloat(s.fontSize) < 21 && !e.closest('svg')) res.small.push(e.tagName + ':' + e.textContent.trim().slice(0, 16) + ' ' + s.fontSize);
        if (own && !e.closest('svg') && !e.closest('ol.st li.next > .cell')) { // 못 가는 단(흐린 칸)은 WCAG 「쓸 수 없는 칸」이라 뺌
          const fg0 = P(s.color); let bgs = bgOf(e);
          const row = e.closest('.board:not(.wide) .row'); // 경주판 줄 글은 막대(빨강 · 파랑 번짐) 위에도 놓임
          if (row) { const bars = [...row.querySelectorAll('.bar')].flatMap(b => { const bs = getComputedStyle(b); return [P(bs.backgroundColor), ...stopsOf(bs)].filter(x => x && x[3] > 0); }); bgs = bgs.flatMap(b => [b, ...bars.map(t => over(t, b))]); }
          if (fg0) { const fg = [fg0[0], fg0[1], fg0[2], fg0[3] * opa(e)], fs = parseFloat(s.fontSize), big = fs >= 24 || (fs >= 18.66 && +s.fontWeight >= 700), need = big ? 3 : 4.5;
            const worst = Math.min(...bgs.map(b => cr(over(fg, b), b)));
            if (worst < need) res.lowc.push(`${e.tagName}.${(e.className || '').toString().split(' ')[0]}:${e.textContent.trim().slice(0, 12)} ${worst.toFixed(2)}<${need}`); }
          const bb = e.getBoundingClientRect();
          for (const a of clipAnc(e)) { const ab = a.getBoundingClientRect(); if (bb.right > ab.right + 1 || bb.left < ab.left - 1) { res.clip.push(`${e.tagName}:${e.textContent.trim().slice(0, 12)} ${Math.round(bb.right - ab.right)}px`); break; } }
        }
        const bb = e.getBoundingClientRect();
        if (bb.width >= 8 && bb.width <= 44 && Math.abs(bb.width - bb.height) <= 2 && !e.closest('svg')) res.squares++;
      }
      // 영상 친구들(사장님 2026-10-11 16:29 「곳곳에 영상에 있는 고양이 무지개 앵무새 꽃 … 공주님은 절대 넣지 말고 곳곳에 잘어울리게」) — 꾸밈 그림 지킴:
      //  정해 둔 11가지만(사람 · 공주님 그림 없음 — 사진은 소개 띠 한 장뿐) · 화면 읽기에서 숨김 · 자료 칸 안에 없음 · 글자를 덮지 않음 ·
      //  숫자 · 그림(차트) · ? 와 10px 넘게 떨어짐 · 빨강 · 파랑(오름 · 내림 색)과 색상 25° 안의 진한 색 없음(규칙 53)
      res.mo = []; res.moN = 0;
      const MO_OK = new Set(['heart', 'star', 'moon', 'daisy', 'tulip', 'cat', 'catsleep', 'parrot', 'rainbow', 'whale', 'butterfly']);
      const ZONE = '.board, .row, .trio, .lc, .tc, .upchart, ol.p36, .munger, .test, .bt, ul.dirbars, ol.funnel, .key, .lkey, .track, .num, .q, .chip, .box, .digest, .srank, .tell, .trh, .seg, ol.steps, .co-head, .crumb, .badge';
      for (const im of scope.querySelectorAll('img')) if (vis(im) && !im.closest('a.hello')) res.mo.push('사진 ' + (im.getAttribute('src') || '').slice(-24));
      const okl = hx => { const v = (hx || '').trim().replace('#', ''); if (!/^[0-9a-f]{6}$/i.test(v)) return null; const f = c => { c /= 255; return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4; }; const [R, G, B] = [0, 2, 4].map(i => f(parseInt(v.slice(i, i + 2), 16)));
        const l = Math.cbrt(0.4122214708 * R + 0.5363325363 * G + 0.0514459929 * B), m = Math.cbrt(0.2119034982 * R + 0.6806995451 * G + 0.1073969566 * B), q = Math.cbrt(0.0883024619 * R + 0.2817188376 * G + 0.6299787005 * B);
        const A = 1.9779984951 * l - 2.4285922050 * m + 0.4505937099 * q, Bb = 0.0259040371 * l + 0.7827717662 * m - 0.8086757660 * q; return {h: (Math.atan2(Bb, A) * 180 / Math.PI + 360) % 360, c: Math.hypot(A, Bb)}; };
      const rootS = getComputedStyle(document.documentElement), sig = ['--up', '--down', '--up-ink', '--down-ink'].map(k => okl(rootS.getPropertyValue(k))).filter(Boolean);
      if (sig.length < 4) res.mo.push('오름 · 내림 색 이름을 못 읽음');
      const hueGap = (a, b2) => { const d = Math.abs(a - b2) % 360; return d > 180 ? 360 - d : d; };
      const gapOf = (a, b2) => Math.hypot(Math.max(0, b2.left - a.right, a.left - b2.right), Math.max(0, b2.top - a.bottom, a.top - b2.bottom));
      const shut = el => { const d = el.closest('details:not([open])'); return !!d && !el.closest('summary'); }; // 닫힌 「자세히」 속 글은 그려지지 않음(크롬은 자리만 셈)
      const bar = el => !!el.closest('nav.tabbar, header.band'); // 위 · 아래 고정 막대 — 스크롤 따라 덮고 지나감(겹침 아님)
      const mos = [...scope.querySelectorAll('svg.mo')].filter(m => vis(m) && !shut(m));
      if (mos.length) {
        const near = [...scope.querySelectorAll('.num, .q, svg:not(.mo)')].filter(x => !x.closest('svg.mo') && vis(x) && !shut(x) && !bar(x)).map(x => [x, x.getBoundingClientRect()]);
        const texts = []; const tw = document.createTreeWalker(scope, NodeFilter.SHOW_TEXT);
        for (let n = tw.nextNode(); n; n = tw.nextNode()) { const pe = n.parentElement; if (!n.textContent.trim() || !pe || pe.closest('svg') || !vis(pe) || shut(pe) || bar(pe)) continue; const rg = document.createRange(); rg.selectNodeContents(n); for (const q of rg.getClientRects()) if (q.width > 0 && q.height > 0) texts.push([q, n.textContent.trim().slice(0, 10)]); }
        for (const m of mos) {
          res.moN++;
          const nm = [...m.classList].find(c => c.startsWith('mo-'))?.slice(3) ?? '?';
          if (!MO_OK.has(nm)) res.mo.push('정해 둔 친구가 아님 ' + nm);
          if (!m.closest('[aria-hidden="true"]')) res.mo.push(nm + ' 화면 읽기에 보임');
          const z = m.parentElement?.closest(ZONE); if (z) res.mo.push(`${nm} 자료 칸 안 .${String(z.className?.baseVal ?? z.className).split(' ')[0]}`);
          const mb = m.getBoundingClientRect(), ib = {left: mb.left + 1, right: mb.right - 1, top: mb.top + 1, bottom: mb.bottom - 1};
          const hit = texts.find(([q]) => q.left < ib.right && q.right > ib.left && q.top < ib.bottom && q.bottom > ib.top); if (hit) res.mo.push(`${nm} 글자를 덮음 「${hit[1]}」`);
          const nb = near.find(([x, q]) => gapOf(mb, q) < 10); if (nb) res.mo.push(`${nm} 숫자 · 그림 · ? 와 ${gapOf(mb, nb[1]).toFixed(0)}px 「${(nb[0].textContent || nb[0].tagName).trim().slice(0, 10)}」`);
          for (const el of m.querySelectorAll('[fill], [stroke]')) for (const at of ['fill', 'stroke']) { const L = okl(el.getAttribute(at)); if (L && L.c >= 0.05 && sig.some(g => hueGap(L.h, g.h) < 25)) res.mo.push(`${nm} 오름 · 내림 색 근처 ${el.getAttribute(at)}`); }
        }
      }
      for (const a of scope.querySelectorAll('a[href], button')) { if (!vis(a)) continue; const bb = a.getBoundingClientRect(); if (bb.height < 43.5 || bb.width < 43.5) res.taps.push((a.textContent.trim() || a.getAttribute('aria-label') || a.tagName).slice(0, 20) + ` ${Math.round(bb.width)}×${Math.round(bb.height)}`); }
      const text = scope.innerText; res.text = text;
      for (const w of banned) if (text.includes(w)) res.banned.push(w);
      res.links = [...document.querySelectorAll('#view a[href^="#/"], .tabbar a[href^="#/"]')].map(a => a.getAttribute('href'));
      res.head = document.querySelector('#view h1')?.textContent ?? '';
      res.count = document.querySelector('#view .count')?.textContent ?? '';
      res.rows = [...document.querySelectorAll('#view .board .row')].sort((a, b) => a.getBoundingClientRect().top - b.getBoundingClientRect().top).map(x => [x.querySelector('.nm').firstChild.textContent, x.querySelector('.val').textContent]);
      res.trd = [...document.querySelectorAll('#view .board .row')].sort((a, b) => a.getBoundingClientRect().top - b.getBoundingClientRect().top).map(x => x.querySelector('.trd')?.textContent ?? null);
      res.trdCut = [...document.querySelectorAll('#view .board .row .trd')].filter(x => x.scrollWidth > x.clientWidth + 1).map(x => x.textContent);
      res.trh = document.querySelector('#view .trh')?.textContent ?? null;
      res.trio = [...document.querySelectorAll('#view .trio b')].map(x => x.textContent);
      res.p36 = [...document.querySelectorAll('#view ol.p36 li')].map(x => [x.querySelector('.nm').textContent, x.querySelector('.val').textContent]);
      res.hello = document.querySelector('#view a.hello')?.getAttribute('href') ?? null;
      res.step = document.querySelector('#view .st-t b')?.textContent ?? null;
      res.dirs = [...document.querySelectorAll('#view ul.dirbars li')].map(li => [...li.querySelectorAll('.dl .num')].map(x => x.textContent));
      res.foot = [...document.querySelectorAll('#view .foot .links a')].map(a => a.getAttribute('href'));
      return res;
    }, {banned: BANNED});
    screens++;
    if (errs.length) fail(tag, '오류: ' + errs.slice(0, 2).join(' | '));
    if (r.over > 0) fail(tag, `옆 넘침 ${r.over}px`);
    if (r.small.length) fail(tag, '21px 미만: ' + r.small.slice(0, 3).join(' · '));
    if (r.lowc.length) fail(tag, '대비 낮음: ' + r.lowc.slice(0, 3).join(' · '));
    if (r.clip.length) fail(tag, '옆으로 잘림: ' + r.clip.slice(0, 3).join(' · '));
    if (r.taps.length) fail(tag, '44px 미만 누름: ' + r.taps.slice(0, 3).join(' · '));
    if (r.banned.length) fail(tag, '금지 말: ' + r.banned.join(' · '));
    if (r.canvas || r.d3) fail(tag, `입체 · 캔버스 ${r.canvas + r.d3}`);
    if (r.squares >= 20) fail(tag, `작은 네모 ${r.squares}개(바둑판)`);
    if (r.mo.length) fail(tag, '영상 친구 자리: ' + [...new Set(r.mo)].slice(0, 3).join(' · '));
    if (r.moN < 1) fail(tag, '영상 친구가 하나도 없음(맨 아래 꽃밭 · 도움말 무지개가 빠짐)');
    moTotal += r.moN;
    if (font === 0 && w === 390) links.set(route, r.links);
    const e = expect(route);
    if (e.head) { numbers++; if (!r.head.includes(e.head)) fail(tag, `머리 ${r.head} ≠ ${e.head}`); }
    if (e.title) { numbers++; if (!r.head.includes(e.title)) fail(tag, `머리 ${r.head} ≠ ${e.title}`); }
    if (e.axis) { numbers++; if (!r.text.includes(e.axis)) fail(tag, `그림 아래 「${e.axis}」 없음`); }
    for (const old of ['3개월', '7월 6일']) if (r.text.includes(old)) fail(tag, `옛 3개월 창 글 「${old}」이 남음`);
    if (e.up != null) { numbers += 2; if (!r.count.includes(e.up + '곳 오름') || !r.count.includes(e.down + '곳 내림')) fail(tag, `오름 · 내림 ${r.count}`); }
    if (e.rows) { numbers += e.rows.length; const got = JSON.stringify(r.rows), want = JSON.stringify(e.rows); if (got !== want) fail(tag, `줄 ${got.slice(0, 120)} ≠ ${want.slice(0, 120)}`); }
    if (e.step) { numbers++; if (r.step !== `5단 중 ${e.step}단`) fail(tag, `5단 표시 ${r.step} ≠ ${e.step}단`); }
    if (e.trd) { numbers += e.trd.length; if (JSON.stringify(r.trd) !== JSON.stringify(e.trd)) fail(tag, `방향 · 세기 줄 ${JSON.stringify(r.trd).slice(0, 120)} ≠ ${JSON.stringify(e.trd).slice(0, 120)}`); }
    if (r.trdCut?.length) fail(tag, '방향 · 세기 줄이 잘림: ' + r.trdCut.slice(0, 2).join(' · '));
    if (e.trh) { numbers++; if (r.trh !== e.trh) fail(tag, `머리 밑 방향 ${r.trh} ≠ ${e.trh}`); }
    if (e.dirs !== undefined) { numbers += 9; if (e.dirs && JSON.stringify(r.dirs) !== JSON.stringify(e.dirs)) fail(tag, '4방향 숫자 다름'); if (!e.dirs && !r.text.includes('? 셈 못 함')) fail(tag, '셈 못 함 표시 없음'); if (e.dirs && !r.text.includes(e.status)) fail(tag, '36곳 자리 글 다름 ' + e.status); }
    if (route === '#/') { numbers++; if (r.hello !== '/hello.html') fail(tag, '첫 화면 맨 위 「친구에게 소개하기」 없음(규칙 45)'); }
    if (route !== '#/info') { numbers++; if (JSON.stringify(r.foot) !== JSON.stringify(['/hello.html', '/old/', '/us/'])) fail(tag, '맨 아래 길(소개 · 옛 ATLAS · 미국 판) 다름'); }
    if (e.p36) { numbers += e.p36.length + 2; if (JSON.stringify(r.p36) !== JSON.stringify(e.p36)) fail(tag, '36곳 줄 다름'); if (e.test && !r.text.includes(e.test)) fail(tag, '지난 기록 시험 글 다름'); if (!r.text.includes(e.total)) fail(tag, '1주씩 합계 다름'); }
    for (const want of e.why ?? []) { numbers++; if (!r.text.includes(want)) fail(tag, `글 「${want}」 없음`); }
    if (e.trio) { numbers += 4; if (JSON.stringify(r.trio) !== JSON.stringify(e.trio)) fail(tag, `세 숫자 ${r.trio} ≠ ${e.trio}`); for (const pz of [].concat(e.price ?? [])) { numbers++; if (!r.text.includes(pz)) fail(tag, `1주 값 ${pz} 없음`); } }
    if (route === '#/' && w === 390 && font === 0) {
      await p.evaluate(() => [...document.querySelectorAll('#view .seg button')][1].click()); await p.waitForTimeout(900);
      const got = await p.evaluate(() => [...document.querySelectorAll('#view .board .row')].sort((a, b) => a.getBoundingClientRect().top - b.getBoundingClientRect().top).map(x => [x.querySelector('.nm').firstChild.textContent, x.querySelector('.trd')?.textContent]));
      const want = core.groups.slice().sort((a, b) => b.cw.at(-1) - a.cw.at(-1)).map(g => [g.short, trText(g.trc)]);
      numbers += want.length; if (JSON.stringify(got) !== JSON.stringify(want)) fail(tag + ' 큰 회사는 크게', `방향 · 세기 줄 ${JSON.stringify(got).slice(0, 120)} ≠ ${JSON.stringify(want).slice(0, 120)}`);
      await p.evaluate(() => [...document.querySelectorAll('#view .seg button')][0].click()); await p.waitForTimeout(600);
    }
    if (route === '#/info') await p.evaluate(() => { location.hash = '#/'; });
  }
  // 찾기 — 한 글자 · 첫 글자 · 영어 이름 소리 · 번호 · 365곳 밖
  if (font === 0) {
    for (const [q, want] of [['삼성', '삼성전자'], ['ㅅㅅㅈㅈ', '삼성전자'], ['에스케이하이', 'SK하이닉스'], ['005930', '삼성전자'], ['반도체 부품', '반도체 부품'], ['카카오', '365곳 밖']]) {
      await p.evaluate(() => { location.hash = '#/find'; });
      await p.waitForFunction(() => !document.querySelector('#findSheet').hidden);
      await p.fill('#q', q); await p.waitForTimeout(250);
      const t = await p.$eval('#hits', x => x.innerText);
      screens++; numbers++;
      if (!t.includes(want)) fail(`${w} 찾기 ${q}`, `결과에 ${want} 없음`);
      const clipF = await p.evaluate(() => { const H = document.querySelector('#hits').getBoundingClientRect(); return [...document.querySelectorAll('#hits li *')].filter(x => { const bx = x.getBoundingClientRect(); return bx.width > 0 && (bx.right > H.right + 1 || bx.left < H.left - 1); }).length; });
      if (clipF) fail(`${w} 찾기 ${q}`, `결과 줄이 옆으로 잘림 ${clipF}칸`);
      const errsF = errs.splice(0); if (errsF.length) fail(`${w} 찾기 ${q}`, '오류: ' + errsF[0]);
      await p.evaluate(() => { document.querySelector('[data-close="findSheet"]').click(); });
    }
    await p.evaluate(() => { location.hash = '#/x/035720'; });
    try { await p.waitForFunction(() => document.querySelector('#infoBody .funnel'), null, {timeout: 5000}); const t = await p.$eval('#infoBody', x => x.innerText); screens++; if (!/멈췄습니다/.test(t)) fail(`${w} 365곳 밖`, '까닭 줄 없음'); } catch { fail(`${w} 365곳 밖`, '깔때기 안 그려짐'); }
  }
  await ctx.close();
}
// 경주(움직임 켬) — 8초 뒤 맨 위 줄 = 20거래일 1등 갈래 · 금빛 테
{
  const ctx = await b.newContext({viewport: {width: 390, height: 844}});
  const p = await ctx.newPage(); const errs = []; p.on('pageerror', e => errs.push(e.message));
  await p.goto(base + '/atlas/', {waitUntil: 'networkidle'});
  const mid = await p.evaluate(() => new Promise(res => setTimeout(() => res(document.querySelector('.tell .t').textContent), 1500)));
  await p.waitForTimeout(6500);
  const top = await p.evaluate(() => { const rows = [...document.querySelectorAll('.board .row')].sort((a, b) => a.getBoundingClientRect().top - b.getBoundingClientRect().top); return {name: rows[0].querySelector('.nm').firstChild.textContent, win: rows[0].classList.contains('win')}; });
  const want = core.groups[0].short; screens++;
  if (top.name !== want || !top.win) fail('경주', `끝 맨 위 ${top.name}(${top.win}) ≠ ${want}`);
  if (!/월/.test(mid)) fail('경주', '날짜 줄이 흐르지 않음: ' + mid);
  if (errs.length) fail('경주', '오류 ' + errs[0]);
  await ctx.close();
}
await b.close();
// 3번 누르면 회사 — 첫 화면에서 화면 안 링크로만 가장 짧은 누름 수(390 · 보통 글씨에서 모은 링크)
const depth = new Map([['#/', 0]]), q = ['#/'];
while (q.length) { const r = q.shift(); for (const l of links.get(r) ?? []) { const n = l === '#/' ? '#/' : l; if (!depth.has(n)) { depth.set(n, depth.get(r) + 1); if (links.has(n)) q.push(n); } } }
let far = 0; for (const c of Object.keys(comp)) { const d = depth.get('#/c/' + c); if (d == null || d > 3) { far++; fail('3번 누름', `${comp[c].name} ${d ?? '닿지 않음'}`); }
  const d4 = depth.get(`#/c/${c}/past`), d5 = depth.get(`#/c/${c}/range`); if (d4 == null || d4 > 4) fail('4단', `${comp[c].name} ${d4 ?? '닿지 않음'}`); if (d5 == null || d5 > 5) fail('5단', `${comp[c].name} ${d5 ?? '닿지 않음'}`); }
const max5 = Math.max(...Object.keys(comp).map(c => depth.get(`#/c/${c}/range`) ?? 99));
const res = {schema: 'atlas-new-check-1', made: new Date().toISOString(), base, plans: plans.map(([w, h, f]) => `${w}×${h}${f ? ' 글씨' + (f + 1) : ''}`), routes: routes.length, screens, numbers, click3: {companies: Object.keys(comp).length, over3: far, max: Math.max(...Object.keys(comp).map(c => depth.get('#/c/' + c) ?? 99))}, click5: {deepest: max5}, friends: {shown: moTotal, kinds: 11}, fails: fails.length, kinds: Object.entries(fails.reduce((m, f) => { const k = f.what.replace(/[\d.]+px/g, 'n').replace(/:.*$/, '').slice(0, 30); m[k] = (m[k] ?? 0) + 1; return m; }, {})), all: fails};
fs.mkdirSync(path.dirname(out), {recursive: true}); fs.writeFileSync(out, JSON.stringify(res, null, 1) + '\n');
console.log(JSON.stringify({screens, numbers, fails: fails.length, click3: res.click3, first: fails.slice(0, 8)}));
process.exit(fails.length ? 1 : 0);
