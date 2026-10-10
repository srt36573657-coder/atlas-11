#!/usr/bin/env node
// 새 ATLAS(aaa7377.com/atlas/) 화면 빠짐없이 돌기 — 첫 화면 · 갈래 10 · 업종 63(1곳뿐인 9곳은 회사로 넘어감) · 회사 365 · 업종 63 탭 · 도움말 · 찾기 · 365곳 밖
//   쓰는 법: node scripts/atlas11/t365/site_check.mjs --base http://127.0.0.1:8899 [--pw /opt/node-tools/] [--out reports/atlas11/verify/atlas-new-check-latest.json]
//   폭 셋(360×640 · 390×844 · 900×900) × 글씨 셋(보통 · 크게 · 아주 크게 — 360 에서만 셋, 나머지는 보통)마다 화면마다 본다:
//     오류 0(보안 규칙 CSP 걸림 포함) · 옆 넘침 0 · 보이는 글씨 21px 이상 · 누르는 자리 44px 이상 · 금지 말 0 · 캔버스 · 3D 0 · 작은 네모 20개 이상(바둑판) 0
//     숫자 = 자료(머리 % · 오름/내림 수 · 줄마다 % · 회사 세 숫자 · 1주 값) · 3번 누르면 회사(첫 화면에서 링크를 따라 가장 짧은 누름 수)
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
const BANNED = ['예측', '예외 없이', '절대', '상승 신호', '폭락 경보기', '팔 때', '들어갈 때', '시작을 맞힌다', '곧 오른다', '오를 것', '내릴 것', '사라', '팔라', '추천', '목표가', '확실', '보장', '무조건', '확률'];
const r1 = x => Math.floor(x * 10 + 0.5 + 1e-7) / 10;
const pct = x => { if (x == null) return '?'; const v = r1(x), a = Math.abs(v); return (v > 0 ? '+' : v < 0 ? '−' : '') + (a >= 100 ? Math.floor(a + 0.5 + 1e-7).toLocaleString('ko-KR') : a.toFixed(1)) + '%'; };

const routes = ['#/', '#/list', '#/36', ...core.groups.map(g => '#/g/' + g.id), ...core.industries.filter(i => i.n > 1).map(i => '#/i/' + encodeURIComponent(i.name)), ...Object.keys(comp).map(c => '#/c/' + c), '#/info'];
const fails = []; let screens = 0, numbers = 0;
const fail = (where, what) => fails.push({where, what});

function expect(route) {
  // 화면마다 자료에서 따로 만든 기대 글(보기 = 한 회사 한 표)
  const [, kind, arg] = route.match(/^#\/(\w*)\/?(.*)$/) || [];
  if (kind === 'g') { const g = core.groups.find(x => x.id === arg); return {head: pct(g.chg), up: g.up, down: g.down, rows: g.inds.map(n => { const i = core.industries.find(x => x.name === n); return [n, pct(i.chg)]; })}; }
  if (kind === 'i') { const i = core.industries.find(x => x.name === decodeURIComponent(arg)); return {head: pct(i.chg), up: i.up, down: i.down, rows: i.members.map(c => [comp[c].name, pct(comp[c].chg3)])}; }
  if (kind === 'c') { const c = comp[arg]; return {trio: [pct(c.chg3), pct(c.r1y), pct(c.mdd3)], price: Math.round(c.price).toLocaleString('ko-KR') + '원'}; }
  if (!kind) return {up: core.all.up, down: core.all.down, rows: core.groups.map(g => [g.short, pct(g.chg)])};
  if (kind === '36') return {p36: pick.picks.map(p => [p.name, '번 길 ' + r1(p.avg).toFixed(1) + '%']), test: pick.backtest ? `${pick.backtest.n}번에 대입했더니, 36곳이 365곳 평균보다 나았던 때는 ${pick.backtest.wins}번` : null, total: Math.round(pick.total).toLocaleString('ko-KR') + '원'};
  return {};
}

const b = await chromium.launch(exe ? {executablePath: exe} : {});
const plans = [[360, 640, 0], [360, 640, 1], [360, 640, 2], [390, 844, 0], [900, 900, 0]];
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
      const res = {over: document.documentElement.scrollWidth - innerWidth, small: [], taps: [], banned: [], canvas: document.querySelectorAll('canvas').length, d3: 0, squares: 0, links: [], text: ''};
      const sheet = document.querySelector('.sheet:not([hidden])'), scope = sheet || document.body;
      const vis = e => { const s = getComputedStyle(e); if (s.visibility === 'hidden' || s.display === 'none' || e.closest('[hidden]') || e.closest('.sr')) return false; const b = e.getBoundingClientRect(); return b.width > 0 && b.height > 0; };
      for (const e of scope.querySelectorAll('*')) {
        if (!vis(e)) continue;
        const s = getComputedStyle(e);
        if (/matrix3d|perspective/.test(s.transform) || s.perspective !== 'none') res.d3++;
        const own = [...e.childNodes].some(n => n.nodeType === 3 && n.textContent.trim());
        if (own && parseFloat(s.fontSize) < 21 && !e.closest('svg')) res.small.push(e.tagName + ':' + e.textContent.trim().slice(0, 16) + ' ' + s.fontSize);
        const bb = e.getBoundingClientRect();
        if (bb.width >= 8 && bb.width <= 44 && Math.abs(bb.width - bb.height) <= 2 && !e.closest('svg')) res.squares++;
      }
      for (const a of scope.querySelectorAll('a[href], button')) { if (!vis(a)) continue; const bb = a.getBoundingClientRect(); if (bb.height < 43.5 || bb.width < 43.5) res.taps.push((a.textContent.trim() || a.getAttribute('aria-label') || a.tagName).slice(0, 20) + ` ${Math.round(bb.width)}×${Math.round(bb.height)}`); }
      const text = scope.innerText; res.text = text;
      for (const w of banned) if (text.includes(w)) res.banned.push(w);
      res.links = [...document.querySelectorAll('#view a[href^="#/"], .tabbar a[href^="#/"]')].map(a => a.getAttribute('href'));
      res.head = document.querySelector('#view h1')?.textContent ?? '';
      res.count = document.querySelector('#view .count')?.textContent ?? '';
      res.rows = [...document.querySelectorAll('#view .board .row')].sort((a, b) => a.getBoundingClientRect().top - b.getBoundingClientRect().top).map(x => [x.querySelector('.nm').firstChild.textContent, x.querySelector('.val').textContent]);
      res.trio = [...document.querySelectorAll('#view .trio b')].map(x => x.textContent);
      res.p36 = [...document.querySelectorAll('#view ol.p36 li')].map(x => [x.querySelector('.nm').textContent, x.querySelector('.val').textContent]);
      return res;
    }, {banned: BANNED});
    screens++;
    if (errs.length) fail(tag, '오류: ' + errs.slice(0, 2).join(' | '));
    if (r.over > 0) fail(tag, `옆 넘침 ${r.over}px`);
    if (r.small.length) fail(tag, '21px 미만: ' + r.small.slice(0, 3).join(' · '));
    if (r.taps.length) fail(tag, '44px 미만 누름: ' + r.taps.slice(0, 3).join(' · '));
    if (r.banned.length) fail(tag, '금지 말: ' + r.banned.join(' · '));
    if (r.canvas || r.d3) fail(tag, `입체 · 캔버스 ${r.canvas + r.d3}`);
    if (r.squares >= 20) fail(tag, `작은 네모 ${r.squares}개(바둑판)`);
    if (font === 0 && w === 390) links.set(route, r.links);
    const e = expect(route);
    if (e.head) { numbers++; if (!r.head.includes(e.head)) fail(tag, `머리 ${r.head} ≠ ${e.head}`); }
    if (e.up != null) { numbers += 2; if (!r.count.includes(e.up + '곳 오름') || !r.count.includes(e.down + '곳 내림')) fail(tag, `오름 · 내림 ${r.count}`); }
    if (e.rows) { numbers += e.rows.length; const got = JSON.stringify(r.rows), want = JSON.stringify(e.rows); if (got !== want) fail(tag, `줄 ${got.slice(0, 120)} ≠ ${want.slice(0, 120)}`); }
    if (e.p36) { numbers += e.p36.length + 2; if (JSON.stringify(r.p36) !== JSON.stringify(e.p36)) fail(tag, '36곳 줄 다름'); if (e.test && !r.text.includes(e.test)) fail(tag, '지난 기록 시험 글 다름'); if (!r.text.includes(e.total)) fail(tag, '1주씩 합계 다름'); }
    if (e.trio) { numbers += 4; if (JSON.stringify(r.trio) !== JSON.stringify(e.trio)) fail(tag, `세 숫자 ${r.trio} ≠ ${e.trio}`); if (!r.text.includes(e.price)) fail(tag, `1주 값 ${e.price} 없음`); }
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
      const errsF = errs.splice(0); if (errsF.length) fail(`${w} 찾기 ${q}`, '오류: ' + errsF[0]);
      await p.evaluate(() => { document.querySelector('[data-close="findSheet"]').click(); });
    }
    await p.evaluate(() => { location.hash = '#/x/035720'; });
    try { await p.waitForFunction(() => document.querySelector('#infoBody .funnel'), null, {timeout: 5000}); const t = await p.$eval('#infoBody', x => x.innerText); screens++; if (!/멈췄습니다/.test(t)) fail(`${w} 365곳 밖`, '까닭 줄 없음'); } catch { fail(`${w} 365곳 밖`, '깔때기 안 그려짐'); }
  }
  await ctx.close();
}
// 경주(움직임 켬) — 7.5초 뒤 맨 위 줄 = 3개월 1등 갈래 · 금빛 테
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
let far = 0; for (const c of Object.keys(comp)) { const d = depth.get('#/c/' + c); if (d == null || d > 3) { far++; fail('3번 누름', `${comp[c].name} ${d ?? '닿지 않음'}`); } }
const res = {schema: 'atlas-new-check-1', made: new Date().toISOString(), base, plans: plans.map(([w, h, f]) => `${w}×${h}${f ? ' 글씨' + (f + 1) : ''}`), routes: routes.length, screens, numbers, click3: {companies: Object.keys(comp).length, over3: far, max: Math.max(...Object.keys(comp).map(c => depth.get('#/c/' + c) ?? 99))}, fails: fails.length, kinds: Object.entries(fails.reduce((m, f) => { const k = f.what.replace(/[\d.]+px/g, 'n').replace(/:.*$/, '').slice(0, 30); m[k] = (m[k] ?? 0) + 1; return m; }, {})), all: fails};
fs.mkdirSync(path.dirname(out), {recursive: true}); fs.writeFileSync(out, JSON.stringify(res, null, 1) + '\n');
console.log(JSON.stringify({screens, numbers, fails: fails.length, click3: res.click3, first: fails.slice(0, 8)}));
process.exit(fails.length ? 1 : 0);
