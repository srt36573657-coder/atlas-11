#!/usr/bin/env node
// 흰 첫 화면 검사 — 사장님 2026-10-19 01:16(싱가포르) 「[골똘이 대공사 · 한 장 · 왜? 그럴까?]」 [차례] 1 · [검사 잣대] 1 ~ 4
//   원문 docs/design/white-2026-10-19/order-0116.txt → 01:24 종합판 order-0124.txt → 02:03 구글과 잡스 판 order-0203.txt([검사] 1 ~ 9)([첫 화면 원칙] 1 ~ 4 · [검사 잣대] 1 ~ 5) · 잣대는 하나 「사기 전에 한 번 더 멈추게 하는가?」
//   쓰는 법: node scripts/atlas11/next/check_white.mjs --base http://127.0.0.1:8826 [--pw /opt/node-tools/] [--path /next/?dev=1] [--out 결과.json]
//            [--baseline] = 지금 첫 화면 글자 수를 config/atlas11/white-baseline.json 에 적음(한 번만 · 공사 전 main 에서)
//            [--mock 파일.html] = 올리지 않는 시안 한 장(정적 html)을 같은 잣대로 잼(누름 · 빠르기 · 그대로 둘 것은 빼고 · 모양 잣대만)
//   첫 화면이 지킬 표시(시안 · 실제 화면 모두):
//     [data-w="ess"] 본질 칸 · [data-w="find"] 찾기 칸 · [data-w="today"] 오늘 장 · [data-w="gdr"] 골똘이 칸 · [data-w="all"] 전부 보기
//     [data-w="find"] 안에 글 칸(input) 하나 = 「친구야, 왜 사?」 찾기 칸 · [data-w="news"] 시황 사실 · [data-fact] 사실 한 줄
//     [data-say] 골똘이 말(인사 · 말풍선 · 안내 · 판정) — 「?」로 끝남
//     [data-path~="q1"] 첫 질문 길(누를 것 — 찾기 칸에 「삼성전자」를 친 뒤 뜬 회사 줄에도 붙임) · [data-num] 숫자 줄(「?」는 맨 앞 모름 · 오래됨 표시뿐)
//   잣대
//     ① 390 × 844 · 처음 온 기기와 다시 온 기기 모두: 바탕 #FFFFFF · 다섯 칸이 아래 단추 위 한 화면 안 · 320 × 568 은 본질 카드와 찾기 칸까지
//        ↳ 2026-10-19 다시 겨눔(사장님 16:06 「될듯 한걸 찾아주는거야 이게 돌이에 본질이야 … 이 본질이 중이이자 시작」 · 16:54 「이제 aaa7377.com에 올려 … 큰 구조는 건들이지 말고」 · 원칙 85):
//          맨 위 = 테마 시계(section.th-home) — 시계 그림이 한 화면 안(두 크기 모두 · 2026-10-25 22:54 「어 진짜 싸이트까지 바꿔」 뒤로는 돌 시계 아래 큰 네 칸 — 390 은 네 칸 모두 · 320 은 첫 줄이 찾기 줄 위) · 다섯 칸은 그 아래에 다 있어야 함 · 엄지 자리(찾기 칸 · 바로 가기 · 전부 보기)는 한 화면 안 그대로 → 2026-10-21 02:29 「어」부터 찾기 칸 한 줄만 한 화면 안(아래로 읽으면 숨고 위로 밀면 다시)
//          ② 글자 수 기준은 예전 칸들만 셈(테마 시계 칸 밖) · 테마 시계 칸은 따로 THEME_CHARS 자 아래
//        첫 화면 원칙: 오르는 것(급등 · 오르는 업종)은 처음 화면에 안 보이고 누름 2번에 닿음 · 「전부 보기」는 한 줄에 하나씩(네모 칸 깔기 · 바둑판 0)
//        시황 [data-w="news"] = 오른 곳(.up)과 내린 곳(.dn)을 함께 · 사실마다([data-fact]) 「왜 그럴까?」 단추 · 한 달 된 기록이 있으면 「그날 정한 대로 했어?」 한 줄
//     ② 글자 수 = 다시 온 기기 지금의 60% 이하 · 처음 온 기기 지금의 90% 이하(기준 = white-baseline.json)
//        대비: 글 4.5 이상(큰 글 24px · 굵은 19px 이상은 3) · 단추 · 칸 테두리나 바탕은 둘레와 3 이상 · 누르는 것 48 × 48 이상
//     ③ 누름(처음 온 기기): 첫 질문(「1 / 11」) 2번 안 · 기록(#/why) 1번 · 진화(#jhBtn) 1번 · 오르는 것 2번 · 카톡 보내기 2번 안
//        빠르기(느린 4G 150ms · 1.6Mbps · 처리 4배 느림): 가장 큰 그림 2.5초 안 · 누른 뒤 그려짐 0.2초 안 · 밀림 0.1 아래
//     ④ 망치는 길 그림 0: 그림자 · 광택(그러데이션) · 입체 · 작은 빨간 점 · 얼굴 그림(허락한 그림 밖 <img>) · 숫자 아닌 빨간 글
//        골똘이 말은 「?」로 끝남 · 숫자 줄 「?」는 맨 앞뿐 · 그대로 둘 것: 아래 단추 다섯 · 본질 세 줄 · 진화 단추 · 잠금 #/why
//   실패가 하나라도 있으면 끝 코드 1 — 단 저장소에 site/next/home.css(새 첫 화면)가 생기기 전에는 알림만(끝 코드 0 · enforced false · 스위치 한 곳 white_gate.mjs whiteOn)
//   올리기 직전 정적 문 = white_gate.mjs(deploy_netlify.mjs 본질 문 곁) · 잣대 한 장 = docs/골똘이_화면잣대.md
import fs from 'node:fs';
import path from 'node:path';
import {createRequire} from 'node:module';
import {fileURLToPath} from 'node:url';
import {whiteOn, HOME_CSS} from './white_gate.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../..');
const argv = process.argv.slice(2);
const arg = (k, d) => { const i = argv.indexOf(k); return i >= 0 && argv[i + 1] != null && !argv[i + 1].startsWith('--') ? argv[i + 1] : d; };
const require = createRequire(String(arg('--pw', process.env.PW_DIR || '/opt/node-tools/')).replace(/\/?$/, '/'));
const {chromium} = require('playwright');
const base = String(arg('--base', 'http://127.0.0.1:8826')).replace(/\/$/, ''), NEXT = arg('--path', '/next/?dev=1'), OUT = arg('--out', null), MOCK = arg('--mock', null);
const BASEFILE = path.join(ROOT, 'config/atlas11/white-baseline.json');
/* 돌 판(사장님 2026-10-19(싱가포르) 10:31 「이제 실제로 만들어 이기준으로」 · 시안 docs/design/kakao-2026-10-19/platform3) — 바탕 먹 #080808 · 글 흰색 · 돌 그림(/media/stone/)은 허락한 그림(입체 · 그림자는 그 그림 파일 안에만 · 10:12 「다써」) */
const BG = '#152D30', INK = '#F2F3F3'; // 돌 시계 청록 판(사장님 2026-10-26 08:16 「디자인 이렇게 하라고 어 다 다시해」 · site/next/clock.css) — 옛 흰 판 #FFFFFF · #000000(2026-10-23) // 숲 초록(사장님 2026-10-22 23:23 「배경색을 그린색으로 바꿔주세요」) · 옛 우주 밤하늘 #070B17(2026-10-20 20:27)
const W = 390, H = 844, BLOCKS = ['ess', 'find', 'today', 'gdr', 'all'], THUMB = ['find'], THEME_CHARS = 200; // THUMB = 엄지 자리(한 화면 안) — 2026-10-21 02:29 사장님 「어」(02:11 「친구야  왜? 사 이창 … 너무 불편해」): 붙어 있는 것은 찾기 칸 한 줄만 · 바로 가기(gdr) · 전부 보기(all)는 화면 안 제자리(칸이 있는지는 BLOCKS 가 그대로 잼) · THEME_CHARS = 테마 시계 칸 글자 한도(2026-10-19 잰 값 172자)
const TABS = ['오늘 장', '시황', '매매일지', '관심', '보유종목'];
const R = {schema: 'golttori-check-white-1', at: new Date().toISOString(), base: MOCK ? null : base, mock: MOCK, counts: {pass: 0, fail: 0}, fails: [], m: {}};
const fail = (what, why) => { R.counts.fail++; R.fails.push(`${what} — ${why}`); console.log('실패 ' + what + ' — ' + why); };
const check = (ok, what, why = '') => (ok ? R.counts.pass++ : fail(what, why));

/* 쪽 안에서 재는 셈 하나(노드에서 문자열로 넘김) — 글자 수 · 칸 자리 · 대비 · 누르는 크기 · 망치는 길 · 물음표 */
const MEASURE = () => {
  const rgb = s => { const m = /rgba?\(([^)]+)\)/.exec(s || ''); if (!m) return null; const p = m[1].split(/[ ,/]+/).filter(Boolean).map(Number); return {r: p[0], g: p[1], b: p[2], a: p.length > 3 ? p[3] : 1}; };
  const lin = c => { c /= 255; return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4; };
  const lum = c => 0.2126 * lin(c.r) + 0.7152 * lin(c.g) + 0.0722 * lin(c.b);
  const ratio = (a, b) => { const x = lum(a), y = lum(b); return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05); };
  const mix = (top, under) => ({r: top.r * top.a + under.r * (1 - top.a), g: top.g * top.a + under.g * (1 - top.a), b: top.b * top.a + under.b * (1 - top.a), a: 1});
  const bgOf = el => { const st = []; for (let e = el; e; e = e.parentElement) { const c = rgb(getComputedStyle(e).backgroundColor); if (c && c.a > 0) { st.push(c); if (c.a >= 1) break; } } let c = {r: 255, g: 255, b: 255, a: 1}; for (const x of st.reverse()) c = mix(x, c); return c; };
  const vis = el => { const cs = getComputedStyle(el); if (cs.display === 'none' || cs.visibility === 'hidden' || +cs.opacity === 0) return false; const r = el.getBoundingClientRect(); if (!r.width || !r.height) return false; for (let e = el; e; e = e.parentElement) if (e.tagName === 'DETAILS' && !e.open && !(el.closest('summary') && el.closest('details') === e)) return false; return true; };
  const ownText = el => [...el.childNodes].filter(n => n.nodeType === 3).map(n => n.nodeValue).join('').replace(/\s+/g, ' ').trim();
  const root = document.querySelector('#view') || document.body, tabs = document.querySelector('.tabs'), top = document.querySelector('.top');
  const scope = [root, top, tabs].filter(Boolean);
  const all = scope.flatMap(s => [s, ...s.querySelectorAll('*')]);
  const out = {bodyLum: lum(bgOf(document.body)), chars: 0, blocks: {}, tabsTop: tabs ? tabs.getBoundingClientRect().top : innerHeight, lowContrast: [], uiContrast: [], tiny: [], small: [], ruin: [], says: [], numQ: [], tabs: [], jh: !!document.querySelector('#jhBtn'), whyTab: !!document.querySelector('.tabs a[href="#/why"]'), ess: [1, 2, 3].map(i => !!document.querySelector(`[data-ess="${i}"]`))};
  for (const k of ['ess', 'find', 'today', 'gdr', 'all']) { const e = document.querySelector(`[data-w="${k}"]`); out.blocks[k] = e && vis(e) ? Math.round(e.getBoundingClientRect().bottom) : null; }
  out.tabs = tabs ? [...tabs.querySelectorAll('a')].map(a => a.textContent.trim()) : [];
  out.themeChars = 0;
  out.top = []; // 글자 수를 이룬 글(테마 칸 밖 · 많은 차례) — 걸리면 어느 글이 늘었는지 보이게(2026-10-20 「다시 온 기기 ② 글자 수 107 > 105」 까닭을 이 방에서 못 봄)
  for (const el of root.querySelectorAll('*')) if (vis(el)) { const n = (ownText(el).match(/[가-힣ㄱ-ㅎA-Za-z]/g) || []).length; if (el.closest('section.th-home')) out.themeChars += n; else { out.chars += n; if (n) out.top.push([n, (el.closest('[data-w]')?.getAttribute('data-w') ?? '-') + ' ' + el.tagName.toLowerCase() + (typeof el.className === 'string' && el.className ? '.' + el.className.split(' ')[0] : ''), ownText(el).slice(0, 30)]); } }
  out.top.sort((x, y) => y[0] - x[0]); // 글자 = 한글 · 로마자(숫자 · 기호는 자료라 날마다 길이가 바뀜 — 기준과 같은 셈) · 테마 시계 칸은 따로(2026-10-19)
  { const tb = document.querySelector('#view section.th-home'), tz = tb?.querySelector('.th-zones'), tz1 = tz?.querySelector('.th-zc'), th = document.querySelector('.s-thumb'), thTop = th && vis(th) ? th.getBoundingClientRect().top : null;
    out.theme = tb && vis(tb) ? {top: Math.round(tb.getBoundingClientRect().top), zonesBottom: tz && vis(tz) ? Math.round(tz.getBoundingClientRect().bottom) : null, rowBottom: tz1 && vis(tz1) ? Math.round(tz1.getBoundingClientRect().bottom) : null, thumbTop: thTop == null ? null : Math.round(thTop)} : null; } // 첫 화면 그림 = 돌 시계 아래 큰 네 칸(사장님 2026-10-25 22:52 「좋아 디자인 신경 더써서 세계 최고로 만들어봐」 · 22:54 「어 진짜 싸이트까지 바꿔」 — 고르신 판 best ①) · 한 해 줄 그림은 그 아래로 · 옛 잣대(2026-10-21 18:22 「그랴」 한 해 줄 그림 · 그 앞은 시계)는 svg.th-yrg 아래 · 이제는 떠 있는 찾기 줄(.s-thumb)에 가리지 않게 그 위까지 // 첫 화면 그림 = 한 해 줄 그림(2026-10-21 18:22 「그랴」 — 궤도 · 행성 지움 · 업종 줄 + 줄 그림) · 옛 판은 시계
  for (const el of all) {
    if (!vis(el)) continue;
    const cs = getComputedStyle(el), r = el.getBoundingClientRect(), t = ownText(el), tag = el.tagName.toLowerCase(), name = `${tag}.${String(el.className?.baseVal ?? el.className).split(' ')[0]}`;
    if (t && !el.closest('svg')) {
      const fg = rgb(cs.color), bg = bgOf(el); const fs = parseFloat(cs.fontSize), bold = +cs.fontWeight >= 600, big = fs >= 24 || (bold && fs >= 18.66);
      if (fs < 16.95) out.tiny.push(`${name} ${fs}px 「${t.slice(0, 12)}」`);
      if (fg) { const c = ratio(mix(fg, bg), bg); if (c < (big ? 3 : 4.5)) out.lowContrast.push(`${name} ${c.toFixed(2)} 「${t.slice(0, 16)}」`); }
      // 빨강(오름)은 숫자에만
      if (fg && fg.r > 150 && fg.g < 110 && fg.b < 110 && !/\d/.test(t)) out.ruin.push(`숫자 아닌 빨간 글 ${name} 「${t.slice(0, 12)}」`);
    }
    if (el.matches('a[href], button, summary, input, select, textarea, [role="button"]')) {
      if (r.height < 47.5 || r.width < 47.5) out.small.push(`${name} ${Math.round(r.width)}×${Math.round(r.height)} 「${el.textContent.trim().slice(0, 14)}」`);
      const own = rgb(cs.backgroundColor), bd = parseFloat(cs.borderTopWidth) > 0 ? rgb(cs.borderTopColor) : null, around = bgOf(el.parentElement || document.body);
      const ol = cs.outlineStyle !== 'none' && parseFloat(cs.outlineWidth) > 0 ? rgb(cs.outlineColor) : null; // 테 대신 그린 outline 도 보이는 테(돌 판 2026-10-19)
      const edges = [own && own.a > 0 ? ratio(mix(own, around), around) : 0, bd && bd.a > 0 ? ratio(mix(bd, around), around) : 0, ol && ol.a > 0 ? ratio(mix(ol, around), around) : 0];
      if ((own && own.a > 0 && ratio(mix(own, around), around) > 1.05) || (bd && bd.a > 0)) { if (Math.max(...edges) < 3) out.uiContrast.push(`${name} ${Math.max(...edges).toFixed(2)} 「${el.textContent.trim().slice(0, 14)}」`); }
    }
    if (cs.boxShadow !== 'none') out.ruin.push(`그림자 ${name}`);
    if (cs.textShadow !== 'none') out.ruin.push(`글 그림자 ${name}`);
    if (/gradient/.test(cs.backgroundImage)) out.ruin.push(`광택(그러데이션) ${name}`);
    if (/drop-shadow|blur/.test(cs.filter)) out.ruin.push(`그림자 거름 ${name}`);
    if (cs.perspective !== 'none' || cs.transformStyle === 'preserve-3d' || /matrix3d|rotate[XY]|perspective/.test(cs.transform)) out.ruin.push(`입체 ${name}`);
    const red = rgb(cs.backgroundColor); if (red && red.a > 0.5 && red.r > 180 && red.g < 90 && red.b < 90 && r.width <= 16 && r.height <= 16) out.ruin.push(`작은 빨간 점 ${name}`);
    if (tag === 'img' && !/\/media\/makbi-|\/media\/stone\/|\/media\/planet\/|\/next\/data\/|data:image\/svg/.test(el.getAttribute('src') || '')) out.ruin.push(`허락 밖 그림 ${el.getAttribute('src')}`); // /media/planet/ = 화면 잣대 색 4 「행성 사진 파일 안에만」(사장님 2026-10-20 22:17 · 미국 항공우주국 진짜 사진) — 2026-10-21 00:51 계절 판 첫 화면 줄의 행성
  }
  out.bodyHex = (() => { const c = rgb(getComputedStyle(document.body).backgroundColor); return c ? '#' + [c.r, c.g, c.b].map(v => v.toString(16).padStart(2, '0')).join('').toUpperCase() + (c.a < 1 ? '~' : '') : '?'; })();
  out.inkHex = (() => { const c = rgb(getComputedStyle(document.body).color); return c ? '#' + [c.r, c.g, c.b].map(v => v.toString(16).padStart(2, '0')).join('').toUpperCase() : '?'; })();
  out.findInput = !!document.querySelector('[data-w="find"] input');
  out.riseShown = [...root.querySelectorAll('*')].filter(e => vis(e) && (/급등|오르는 업종/.test(ownText(e)) || /#\/(f\/rise|f\/surge|surge)(\b|$)/.test(e.getAttribute?.('href') || ''))).map(e => (ownText(e) || e.getAttribute('href')).slice(0, 16));
  out.grid = []; for (const el of root.querySelectorAll('*')) { if (!vis(el) || el instanceof SVGElement) continue; const kids = [...el.children].filter(k => k instanceof HTMLElement && vis(k)); /* 바둑판 = 누르는 작은 네모 칸(HTML) — 그림(svg) 속 점은 자료 그림이라 셈 밖(2026-10-19 테마 시계 점 77개) */ if (kids.length < 20) continue; const sq = kids.filter(k => { const r = k.getBoundingClientRect(); return r.width <= 44 && r.height <= 44; }); if (sq.length >= 20) out.grid.push(String(el.className).split(' ')[0] || el.tagName); }
  const nw = document.querySelector('[data-w="news"]'); out.news = nw ? {up: !!nw.querySelector('.up'), dn: !!nw.querySelector('.dn'), facts: [...nw.querySelectorAll('[data-fact]')].length, why: [...nw.querySelectorAll('[data-fact]')].filter(f => [...f.querySelectorAll('button')].some(b => /왜 그럴까\?/.test(b.textContent))).length} : null;
  out.monthLine = /그날 정한 대로 했어\?/.test(root.innerText || '');
  for (const el of root.querySelectorAll('[data-say]')) if (vis(el)) { const t = el.textContent.replace(/\s+/g, ' ').trim(); out.says.push(t); }
  for (const el of root.querySelectorAll('[data-num]')) if (vis(el)) { const t = el.textContent.replace(/\s+/g, ' ').trim(); if (t.includes('?') && !/^\?/.test(t.replace(/^[^\w가-힣?]+/, ''))) out.numQ.push(t.slice(0, 30)); }
  return out;
};

function judge(m, tag, B) {
  check(m.bodyHex === BG, `${tag} ① 바탕 ${BG}`, `바탕 ${m.bodyHex}`);
  check(m.inkHex === INK, `${tag} 글 ${INK}`, `글 ${m.inkHex}`);
  check(m.findInput, `${tag} 「친구야, 왜 사?」 찾기 칸`, '[data-w="find"] 안에 글 칸이 없음');
  check(!m.riseShown.length, `${tag} 첫 화면 원칙 1 · 오르는 것은 한 번 더 눌러야`, m.riseShown.slice(0, 3).join(' | '));
  check(!m.grid.length, `${tag} 바둑판 0`, m.grid.slice(0, 3).join(' | '));
  check(!!m.news && m.news.up && m.news.dn, `${tag} 시황 = 오른 곳과 내린 곳 함께`, m.news ? `오름 ${m.news.up} · 내림 ${m.news.dn}` : '[data-w="news"] 가 없음');
  check(!!m.news && m.news.facts > 0 && m.news.why === m.news.facts, `${tag} 시황 사실마다 「왜 그럴까?」 단추`, m.news ? `사실 ${m.news.facts} · 단추 ${m.news.why}` : '');
  for (const k of BLOCKS) check(m.blocks[k] != null, `${tag} ① 칸 ${k}`, '칸이 없음'); // 다섯 칸은 테마 시계 아래에 그대로(2026-10-19 16:54)
  for (const k of THUMB) check(m.blocks[k] != null && m.blocks[k] <= m.tabsTop + 0.5, `${tag} ① 한 화면 엄지 자리 ${k}`, m.blocks[k] == null ? '칸이 없음' : `아래 ${m.blocks[k]} > 아래 단추 ${Math.round(m.tabsTop)}`);
  { const lim = Math.min(m.tabsTop, m.theme?.thumbTop ?? Infinity); check(!!m.theme && m.theme.zonesBottom != null && m.theme.zonesBottom <= lim + 0.5, `${tag} ① 테마 시계 네 칸 한 화면 안`, m.theme ? `네 칸 아래 ${m.theme.zonesBottom} > 찾기 줄 · 아래 단추 ${Math.round(lim)}` : '테마 시계 칸(section.th-home)이 없음'); } // 2026-10-25 22:54 — 네 칸 전부가 찾기 줄 위에 보임
  check(m.themeChars <= THEME_CHARS, `${tag} ② 테마 시계 칸 글자 수`, `${m.themeChars}자 > ${THEME_CHARS}자`);
  if (B) { const lim = Math.floor((tag.includes('처음') ? 0.9 * B.first : 0.6 * B.back)); check(m.chars <= lim, `${tag} ② 글자 수`, `${m.chars}자 > ${lim}자(기준 ${tag.includes('처음') ? B.first + '의 90%' : B.back + '의 60%'}) · 글 ${(m.top ?? []).map(x => x[0] + ' ' + x[1] + ' 「' + x[2] + '」').join(' / ')}`); }
  check(!m.lowContrast.length, `${tag} ② 글 대비`, `${m.lowContrast.length}곳 · ${m.lowContrast.slice(0, 3).join(' · ')}`);
  check(!m.uiContrast.length, `${tag} ② 단추 테두리 대비 3`, `${m.uiContrast.length}곳 · ${m.uiContrast.slice(0, 3).join(' · ')}`);
  check(!m.tiny.length, `${tag} ② 글씨 17px 아래 0`, `${m.tiny.length}곳 · ${m.tiny.slice(0, 3).join(' · ')}`);
  check(!m.small.length, `${tag} ② 누르는 크기 48`, `${m.small.length}곳 · ${m.small.slice(0, 3).join(' · ')}`);
  check(!m.ruin.length, `${tag} ④ 망치는 길 그림 0`, `${m.ruin.length}곳 · ${[...new Set(m.ruin)].slice(0, 4).join(' · ')}`);
  const badSay = m.says.filter(t => !/\?$/.test(t));
  check(m.says.length > 0 && !badSay.length, `${tag} ④ 돌이 말은 「?」로 끝남`, m.says.length ? badSay.slice(0, 3).join(' | ') : '돌이 말([data-say])이 없음');
  check(!m.numQ.length, `${tag} ④ 숫자 줄 「?」는 맨 앞뿐`, m.numQ.slice(0, 3).join(' | '));
}
function keep(m, tag) {
  check(JSON.stringify(m.tabs) === JSON.stringify(TABS), `${tag} 그대로 · 아래 단추 다섯`, m.tabs.join(' · '));
  check(m.whyTab, `${tag} 그대로 · 잠금 #/why`, '');
  check(m.jh, `${tag} 그대로 · 진화 단추`, '');
  check(m.ess.every(Boolean), `${tag} 그대로 · 본질 세 줄`, m.ess.join());
}

const EXE = process.env.PW_CHROMIUM || '/opt/pw-browsers/chromium'; // 이 방은 미리 깔린 크로미움 · 깃허브 실행기(모든 쪽 검사)는 playwright 가 깐 것
const browser = await chromium.launch({...(fs.existsSync(EXE) ? {executablePath: EXE} : {}), args: ['--disable-dev-shm-usage']});
const ctxOf = async (first, extra = {}) => {
  const ctx = await browser.newContext({viewport: {width: W, height: H}, deviceScaleFactor: 1, locale: 'ko-KR', timezoneId: 'Asia/Seoul', reducedMotion: 'reduce', ...extra});
  await ctx.addInitScript(f => { try { if (sessionStorage.getItem('cw-seed')) return; sessionStorage.setItem('cw-seed', '1'); localStorage.clear(); if (!f) { localStorage.setItem('atlas:essence-seen', 'true'); localStorage.setItem('atlas:white-seen', 'true'); } } catch { /* 기억 못 하는 기계 */ } }, first);
  await ctx.addInitScript(() => { window.__kk = []; const S = {sendDefault: o => window.__kk.push('kakao')}; window.Kakao = {init() {}, isInitialized: () => true, Share: S}; try { navigator.share = async () => { window.__kk.push('navshare'); }; } catch { /* 없음 */ } });
  return ctx;
};
const settle = async p => { await p.waitForFunction(() => !document.querySelector('#view .boot') && document.fonts?.status === 'loaded', null, {timeout: 20000}).catch(() => {}); await p.waitForTimeout(400); };
/** 열기 — 실제 사이트에서 문서가 넷리파이 오류 쪽(403 · 429 · 5xx — 세게 두드린 실행기를 잠깐 막음)이면 10 · 20 · 30초 기다렸다 다시(2026-10-20 #/f/lead · #/x/005935 가 목록 끝에서 넷리파이 흰 쪽) · 다시 연 수는 R.net */
const REMOTE_W = !MOCK && !/^https?:\/\/(127\.0\.0\.1|localhost|\[::1\])(:\d+)?(\/|$)/i.test(String(base));
R.net = {retry: 0, why: {}};
const open = async (ctx, url) => {
  const p = await ctx.newPage(); const errs = []; p.on('pageerror', e => errs.push(String(e.message).slice(0, 120)));
  for (let k = 0; ; k++) {
    const rs = await p.goto(url, {waitUntil: 'load', timeout: 30000}).catch(e => { if (!REMOTE_W || k >= 3) throw e; return null; });
    const st = rs?.status() ?? 0, ours = st > 0 && st < 400 && await p.evaluate(() => !!document.querySelector('#view')).catch(() => false);
    if (ours || !REMOTE_W || k >= 3) break;
    const why = st ? 'HTTP ' + st : '열기 실패'; R.net.retry++; R.net.why[why] = (R.net.why[why] || 0) + 1;
    await p.waitForTimeout([10000, 20000, 30000][k]);
  }
  await settle(p); return {p, errs};
};

try {
  if (MOCK) {
    const ctx = await ctxOf(true), url = 'file://' + path.resolve(MOCK);
    const {p} = await open(ctx, url); const m = await p.evaluate(MEASURE);
    const B = fs.existsSync(BASEFILE) ? JSON.parse(fs.readFileSync(BASEFILE, 'utf8')) : null;
    R.m.mock = m; judge(m, '시안(다시 온 기기 꼴)', B); await ctx.close();
    const c2 = await ctxOf(true, {viewport: {width: 320, height: 568}}), o2 = await open(c2, url), m2 = await o2.p.evaluate(MEASURE);
    for (const k of ['ess', 'find']) check(m2.blocks[k] != null && m2.blocks[k] <= m2.tabsTop + 0.5, `시안 320 × 568 한 화면 칸 ${k}`, m2.blocks[k] == null ? '칸이 없음' : `아래 ${m2.blocks[k]} > 아래 단추 ${Math.round(m2.tabsTop)}`);
    check(await o2.p.evaluate(() => document.scrollingElement.scrollWidth <= innerWidth + 1), '시안 320 × 568 옆 넘침 0', '');
    check(!m2.tiny.length && !m2.small.length, '시안 320 × 568 글씨 17 · 누름 48', [...m2.tiny, ...m2.small].slice(0, 3).join(' · ')); await c2.close();
  } else {
    const HOME = base + NEXT + '#/';
    if (argv.includes('--baseline')) {
      const res = {};
      for (const first of [true, false]) { const ctx = await ctxOf(first); const {p} = await open(ctx, HOME); res[first ? 'first' : 'back'] = (await p.evaluate(MEASURE)).chars; await ctx.close(); }
      fs.mkdirSync(path.dirname(BASEFILE), {recursive: true});
      fs.writeFileSync(BASEFILE, JSON.stringify({schema: 'golttori-white-baseline-1', at: new Date().toISOString(), why: '사장님 2026-10-19 01:16 [검사 잣대] 2 「글자 지금의 60%(처음 온 기기 90%) 아래」 — 공사 전 첫 화면 글자 수(띄어쓰기 빼고 · 보이는 글만 · 390 × 844)', base, ...res}, null, 1) + '\n');
      console.log('기준 적음', JSON.stringify(res)); await browser.close(); process.exit(0);
    }
    const B = fs.existsSync(BASEFILE) ? JSON.parse(fs.readFileSync(BASEFILE, 'utf8')) : null;
    check(!!B, '② 글자 수 기준 파일', 'config/atlas11/white-baseline.json 이 없음(--baseline 으로 공사 전에 적음)');
    // ① ② ④ 처음 온 기기 · 다시 온 기기
    for (const first of [true, false]) {
      const tag = first ? '처음 온 기기' : '다시 온 기기', ctx = await ctxOf(first), {p, errs} = await open(ctx, HOME);
      const m = await p.evaluate(MEASURE); R.m[first ? 'first' : 'back'] = {...m, errs};
      judge(m, tag, B); keep(m, tag); check(!errs.length, `${tag} 쪽 오류 0`, errs.slice(0, 2).join(' | '));
      await ctx.close();
    }
    // ① 320 × 568 — 본질 카드와 찾기 칸까지 한 화면
    {
      const ctx = await ctxOf(false, {viewport: {width: 320, height: 568}}), {p} = await open(ctx, HOME), m = await p.evaluate(MEASURE);
      for (const k of ['find']) check(m.blocks[k] != null && m.blocks[k] <= m.tabsTop + 0.5, `320 × 568 한 화면 칸 ${k}`, m.blocks[k] == null ? '칸이 없음' : `아래 ${m.blocks[k]} > 아래 단추 ${Math.round(m.tabsTop)}`); // 본질 카드는 테마 시계 아래로(2026-10-19 16:54 · 원칙 85)
      { const lim = Math.min(m.tabsTop, m.theme?.thumbTop ?? Infinity); check(!!m.theme && m.theme.rowBottom != null && m.theme.rowBottom <= lim + 0.5, '320 × 568 테마 시계 네 칸 첫 줄 한 화면 안', m.theme ? `첫 줄 아래 ${m.theme.rowBottom} > 찾기 줄 · 아래 단추 ${Math.round(lim)}` : '칸 없음'); } // 2026-10-25 22:54 — 작은 폰은 싹 · 꽃 첫 줄까지
      check(!m.small.length, '320 × 568 누르는 크기 48', m.small.slice(0, 3).join(' · '));
      check(await p.evaluate(() => document.scrollingElement.scrollWidth <= innerWidth + 1), '320 × 568 옆 넘침 0', '');
      await ctx.close();
    }
    // 한 달 된 기록 → 카드 밑 「그날 정한 대로 했어?」
    {
      const ctx = await ctxOf(false), old = new Date(Date.now() - 40 * 864e5);
      await ctx.addInitScript(at => { try { if (localStorage.getItem('atlas:godori-why')) return; localStorage.setItem('atlas:godori-why', JSON.stringify([{at, asOf: at.slice(0, 10), code: '005930', name: '삼성전자', price: 70000, day: at.slice(0, 10), answers: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], score: 20, reds: 0, verdict: '좋아', groups: [], bigDay: null, why: '이익이 늘어서', promise: {sell: 63000, half: 84000, text: '만약 63,000원 아래로 가면 다 판다. 만약 84,000원 위로 가면 절반 판다.'}, picks: []}])); } catch { /* 없음 */ } }, old.toISOString());
      const {p} = await open(ctx, HOME); await p.waitForTimeout(800); const m = await p.evaluate(MEASURE);
      check(m.monthLine, '한 달 된 기록 · 「그날 정한 대로 했어?」 한 줄', '첫 화면에 그 줄이 없음'); await ctx.close();
    }
    // 「전부 보기」 — 한 줄에 하나씩 · 오르는 것은 누름 2번
    {
      const ctx = await ctxOf(false), {p} = await open(ctx, HOME), all = p.locator('#view [data-w="all"]:visible').first();
      if (await all.count()) {
        await all.click(); await p.waitForTimeout(1200);
        const L = await p.evaluate(() => { const box = document.querySelector('[data-w="all"]'); const host = box?.closest('details') || box?.parentElement; const W0 = host?.getBoundingClientRect().width || 1;
          const rows = [...(host?.querySelectorAll('a[href], li') || [])].filter(e => e.getBoundingClientRect().height > 0 && !e.closest('summary'));
          return {narrow: rows.filter(e => e.getBoundingClientRect().width < 0.85 * W0).map(e => e.textContent.trim().slice(0, 14)), rise: rows.some(e => /#\/(f\/rise|f\/surge|surge)(\b|$)/.test(e.getAttribute?.('href') || '') || /#\/(f\/rise|f\/surge|surge)(\b|$)/.test(e.querySelector?.('a')?.getAttribute('href') || ''))}; });
        check(!L.narrow.length, '「전부 보기」 한 줄에 하나씩(네모 칸 0)', L.narrow.slice(0, 3).join(' | '));
        check(L.rise, '③ 오르는 것까지 누름 2번(전부 보기 → 오르는 것)', '전부 보기 안에 오르는 업종 · 급등 고리가 없음'); R.m.taps = {...(R.m.taps || {}), rise: L.rise ? 2 : null};
      } else fail('「전부 보기」', '[data-w="all"] 가 없음');
      await ctx.close();
    }
    // ③ 누름(처음 온 기기)
    {
      const ctx = await ctxOf(true), seen = async p => p.evaluate(() => /(^|\s)1\s*\/\s*11(\s|$)/.test(document.querySelector('#view')?.innerText || ''));
      let {p} = await open(ctx, HOME), n = 0;
      const fi = p.locator('#view [data-w="find"] input').first(); // 찾기 칸에 회사 이름을 침(치는 것은 누름이 아님) → 뜬 회사를 누름
      if (await fi.count()) { await fi.fill('삼성전자'); await p.waitForTimeout(1500); }
      // 누른 뒤 그 쪽이 다 열릴 때까지(8초 안) 기다린 다음 셈 — settle 만 쓰면 주소가 바뀌기 전에 끝나 0.4초 안에 못 연 쪽을 「못 감」으로 셌음
      // (2026-10-21 04:3x 진짜 사이트 두 번 「1번 눌러도 1 / 11 이 안 보임」 · 탐침 live_q1 = 누름 · 주소 바뀜은 맞고 그 0.4초에 「여는 중이에요…」 · 올린 직후 지나서는 세 번 모두 1번) · 재는 것은 누름 수 그대로(빠르기는 ③ 가장 큰 그림 · 누른 뒤 그려짐이 잼)
      while (n < 2 && !(await seen(p))) { const t = p.locator('#view [data-path~="q1"]:visible').first(); if (!(await t.count())) break; await t.click({timeout: 5000}); n++; await p.waitForFunction(() => /(^|\s)1\s*\/\s*11(\s|$)/.test(document.querySelector('#view')?.innerText || ''), null, {timeout: 8000}).catch(() => {}); await settle(p); }
      const q1 = await seen(p); R.m.taps = {...(R.m.taps || {}), q1: q1 ? n : null};
      check(q1 && n <= 2, '③ 첫 질문까지 누름 2번 안', q1 ? `${n}번` : `${n}번 눌러도 「1 / 11」이 안 보임`);
      await p.goto(HOME); await settle(p);
      const rec = await p.locator('a[href="#/why"]:visible').count(); check(rec > 0, '③ 기록까지 누름 1번', '보이는 #/why 고리 없음'); R.m.taps.record = rec > 0 ? 1 : null;
      const jh = await p.locator('#jhBtn:visible').count(); check(jh > 0, '③ 진화까지 누름 1번', '보이는 진화 단추 없음'); R.m.taps.jinhwa = jh > 0 ? 1 : null;
      let kk = null; const b = p.locator('#view .kk-btn:visible').first();
      if (await b.count()) { await b.click(); await p.waitForTimeout(800); let sent = await p.evaluate(() => window.__kk.length);
        if (!sent) { const k2 = p.locator('button:visible, a:visible').filter({hasText: /카톡/}).first(); if (await k2.count()) { await k2.click().catch(() => {}); await p.waitForTimeout(800); sent = await p.evaluate(() => window.__kk.length); kk = sent ? 2 : null; } } else kk = 1; }
      R.m.taps.kakao = kk; check(kk != null && kk <= 2, '③ 카톡 보내기 누름 2번 안', kk == null ? '첫 화면에서 2번 안에 카톡 보내기가 안 됨' : '');
      await ctx.close();
    }
    // ⑤ 다른 쪽도 흰 판(둘째 올림 · 실패할 길 1 「옛 쪽 글이 흰 바탕에 안 보임」을 막는 줄) — 쪽마다 흰 바탕 · 글 대비 · 단추 테두리 · 누름 48 · 망치는 길 0 · 옆 넘침 0(390 · 320)
    //   바둑판 셈은 첫 화면만(급등 36점 · 업데이트 막대는 자료 그림 <svg> — 칸 깔기가 아님)
    if (!argv.includes('--home-only')) {
      const PAGES = ['#/today', '#/shorts', '#/why', '#/why/005930', '#/sub', '#/me', '#/find/삼성', '#/surge', '#/surge/10', '#/cal', '#/cond', '#/talk', '#/up', '#/time', '#/info', '#/jinhwa', '#/gdr', '#/w/005930', '#/w/005930/past', '#/w/005930/rivals', '#/w/005930/grow', '#/w/005930/range', '#/f/rise', '#/f/lead', '#/x/005935'];
      R.m.pages = {};
      for (const vw of [390, 320]) {
        const ctx = await ctxOf(false, vw === 320 ? {viewport: {width: 320, height: 568}} : {});
        for (const hs of PAGES) {
          const {p, errs} = await open(ctx, base + NEXT + hs); const m = await p.evaluate(MEASURE), wide = await p.evaluate(() => document.scrollingElement.scrollWidth <= innerWidth + 1);
          const tag = `다른 쪽 ${hs} ${vw}`, ruin = [...new Set(m.ruin)];
          R.m.pages[`${hs} ${vw}`] = {low: m.lowContrast.length, ui: m.uiContrast.length, small: m.small.length, ruin: ruin.length};
          check(m.bodyHex === BG, `${tag} 바탕 ${BG}`, `바탕 ${m.bodyHex}`);
          check(!m.lowContrast.length, `${tag} 글 대비`, m.lowContrast.slice(0, 3).join(' · '));
          check(!m.uiContrast.length, `${tag} 단추 테두리 대비 3`, m.uiContrast.slice(0, 3).join(' · '));
          check(!m.small.length, `${tag} 누르는 크기 48`, m.small.slice(0, 3).join(' · '));
          check(!ruin.length, `${tag} 망치는 길 그림 0`, ruin.slice(0, 3).join(' · '));
          check(wide, `${tag} 옆 넘침 0`, '');
          check(!errs.length, `${tag} 쪽 오류 0`, errs.slice(0, 2).join(' | '));
          await p.close();
        }
        await ctx.close();
      }
    }
    // ③ 빠르기 — 느린 4G · 처리 4배 느림 · 다시 온 기기(첫 화면 그림 몫)
    {
      const ctx = await ctxOf(false), p = await ctx.newPage(), cdp = await ctx.newCDPSession(p);
      await cdp.send('Network.enable'); await cdp.send('Network.emulateNetworkConditions', {offline: false, latency: 150, downloadThroughput: 1.6 * 1024 * 1024 / 8, uploadThroughput: 750 * 1024 / 8}); await cdp.send('Emulation.setCPUThrottlingRate', {rate: 4});
      await p.addInitScript(() => { window.__v = {lcp: 0, cls: 0, inp: 0}; new PerformanceObserver(l => { for (const e of l.getEntries()) window.__v.lcp = e.startTime; }).observe({type: 'largest-contentful-paint', buffered: true}); new PerformanceObserver(l => { for (const e of l.getEntries()) if (!e.hadRecentInput) window.__v.cls += e.value; }).observe({type: 'layout-shift', buffered: true}); new PerformanceObserver(l => { for (const e of l.getEntries()) window.__v.inp = Math.max(window.__v.inp, e.duration); }).observe({type: 'event', buffered: true, durationThreshold: 16}); });
      await p.goto(HOME, {waitUntil: 'load', timeout: 60000}); await settle(p); await p.waitForTimeout(1500);
      const all = p.locator('#view [data-w="all"]:visible').first(); if (await all.count()) { await all.click().catch(() => {}); await p.waitForTimeout(1200); }
      const v = await p.evaluate(() => window.__v); R.m.speed = {lcp: Math.round(v.lcp), inp: Math.round(v.inp), cls: +v.cls.toFixed(3)};
      check(v.lcp > 0 && v.lcp <= 2500, '③ 가장 큰 그림 2.5초 안(느린 4G)', `${Math.round(v.lcp)}ms`);
      check(v.inp <= 200, '③ 누른 뒤 그려짐 0.2초 안', `${Math.round(v.inp)}ms`);
      check(v.cls < 0.1, '③ 밀림 0.1 아래', v.cls.toFixed(3));
      await ctx.close();
    }
  }
} catch (e) { fail('검사 돌리기', String(e?.message ?? e).split('\n')[0].slice(0, 200)); }
finally { await browser.close().catch(() => {}); }
R.ok = R.counts.fail === 0;
// 켜는 스위치(2026-10-19 03시 짓기 일꾼 C · 한 곳 = white_gate.mjs whiteOn) — 저장소에 site/next/home.css(새 첫 화면)가 있을 때만 걸리면 끝 코드 1
//   그 전에는 지금 사이트가 걸릴 수밖에 없어(38곳) 모든 쪽 검사 · 올리기 전 검사 기다리기를 막지 않게 알림만(실패 수는 그대로 찍고 결과 파일 enforced false)
//   시안(--mock) · --enforce 는 늘 켜짐
R.enforced = !!MOCK || argv.includes('--enforce') || whiteOn(ROOT);
if (OUT) { fs.mkdirSync(path.dirname(path.resolve(OUT)), {recursive: true}); fs.writeFileSync(OUT, JSON.stringify(R, null, 1) + '\n'); }
console.log(`흰 첫 화면 검사 — 통과 ${R.counts.pass} · 실패 ${R.counts.fail}${R.enforced ? '' : ` · 아직 막지 않음(${HOME_CSS} 가 저장소에 없음 — 새 첫 화면이 들어오면 저절로 막음)`}`);
process.exit(R.ok || !R.enforced ? 0 : 1);
