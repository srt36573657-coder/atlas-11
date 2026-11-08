#!/usr/bin/env node
/**
 * 수르 틀을 미리 입힌 개인정보 처리방침(/su/privacy.html) 짓기 — 주문 2011(사장님 2026-11-08 20:11 「제 처음부터 끝까지 모든 페이지를 첫페이지 기준으로 모두 변경해」 · 20:26 「아니 이것도 같이 작업해」)
 *   원본 site/privacy.html 은 쪽 보안 규칙(default-src 'none')이 스크립트를 막아 su-wrap.js 로 틀을 씌울 수 없음 → 원본 글은 한 글자도 바꾸지 않고 머리 · 꼬리만 덧붙인 짝 쪽을 지음
 *   - 원본도 첫 페이지 색(<html class="su-jobs"> · su-privacy.css · 주문 2250) — 짝 쪽은 su-wrapped + su-wrap.css(아래 수르 막대 · 옛 아래 단추 숨김)만 더함
 *   - 아래 수르 막대는 su-wrap.js wrapBar 와 같은 꼴을 글로 박음(스크립트 0 · 글 속 style 0 — 원본 보안 규칙 그대로)
 *   - 수르 쪽 고리(su-roads.js hrefOf)와 수르 틀 안 옛 쪽의 「개인정보 처리방침」 고리(su-wrap.js SOLO)가 이 쪽으로 옴 · 옛 주소로 바로 온 손님은 원본 그대로
 * 쓰는 법: node scripts/atlas11/next/su_privacy.mjs          → site/su/privacy.html 을 새로 씀
 *          node scripts/atlas11/next/su_privacy.mjs --check  → 원본에서 지은 것과 다르면 끝 코드 1(시험 tests/atlas11/su.test.mjs)
 */
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {GROUPS, TABS, FIND_D} from '../../../site/su/su-wrap.js';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../..');
const SRC = path.join(ROOT, 'site/privacy.html'), OUT = path.join(ROOT, 'site/su/privacy.html');
const G = 'back'; // 수르 옛 기능 명단(su-feat.js)의 개인정보 묶음 = 뒤에서 도는 것
const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const icon = d => `<svg viewBox="0 0 24 24" aria-hidden="true" class="suw-i"><path d="${esc(d)}"/></svg>`;

export function bar(g = G) {
  const back = `<a class="suw-back" href="/su/#/g/${g}"><img src="/media/makbi-icon.svg" alt="" width="34" height="34"><span class="suw-bk">수르로</span><b>${esc(GROUPS[g])} 길</b><i aria-hidden="true">›</i></a>`;
  const find = `<a class="suw-find" href="/su/#/g/guide" aria-label="종목 찾기 · 길잡이">${icon(FIND_D)}<span>찾기</span></a>`;
  const tabs = `<nav class="suw-tabs" aria-label="수르 탭">${TABS.map(([t, href, d]) => `<a href="${esc(href)}">${icon(d)}<span>${esc(t)}</span></a>`).join('')}</nav>`;
  return `<div class="suw-bar" id="suw" role="navigation" aria-label="수르 길"><div class="suw-row">${back}${find}</div>${tabs}</div>`;
}

export function build(src) {
  const once = (s, a, b) => { const i = s.indexOf(a); if (i < 0 || s.indexOf(a, i + 1) >= 0) throw new Error('원본에서 한 번만 나와야 함: ' + a); return s.slice(0, i) + b + s.slice(i + a.length); };
  let s = src;
  s = once(s, '<!doctype html>\n', '<!doctype html>\n<!-- 지은 파일 — scripts/atlas11/next/su_privacy.mjs 가 site/privacy.html 에서 지음(손으로 고치지 않음 · 원본을 고친 뒤 다시 지음) · 수르 틀을 미리 입힌 짝 쪽(주문 2011) -->\n');
  s = once(s, '<html lang="ko" class="su-jobs">', '<html lang="ko" class="su-jobs su-wrapped">'); // 원본은 이미 첫 페이지 색(su-jobs · su-privacy.css · 주문 2250) — 짝 쪽은 수르 틀(아래 수르 막대)만 더함
  s = s.replace(/<meta name="theme-color" content="#[0-9A-Fa-f]{6}">/, '<meta name="theme-color" content="#FFFFFF">');
  s = once(s, '<link rel="stylesheet" href="/su/su-privacy.css">', '<link rel="stylesheet" href="/su/su-privacy.css">\n<link rel="stylesheet" href="/su/su-wrap.css">');
  s = once(s, '</body>', bar() + '\n</body>');
  return s;
}

const isMain = process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (isMain) {
  const want = build(fs.readFileSync(SRC, 'utf8'));
  if (process.argv.includes('--check')) {
    const have = fs.existsSync(OUT) ? fs.readFileSync(OUT, 'utf8') : '';
    if (have !== want) { console.error('site/su/privacy.html 이 원본(site/privacy.html)에서 지은 것과 달라요 — node scripts/atlas11/next/su_privacy.mjs 로 다시 지으세요'); process.exit(1); }
    console.log('site/su/privacy.html = 원본에서 지은 것');
  } else { fs.writeFileSync(OUT, want); console.log('지음 → site/su/privacy.html (' + want.length + '자)'); }
}
