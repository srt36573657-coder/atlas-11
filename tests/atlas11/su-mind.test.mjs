// 손자병법 주식 격언 열 가지 시험(주문 1120-2116 · 사장님 2026-11-20(마카오) 21:16 「… 첫 페이지에 멋지게 나열해봐」 · 23:14 「이게 아니야 돌이를 만들때 주식을 하는 명언이 있던 걸로 기억해 … 글을 그 수채화 위에 글을 찾아서 올려」)
//   site/su/su-mind-core.js — 사장님 2026-10-16 「아틀란스 주식 격언 열 가지」 = 돌이 첫 화면 편지 site/next/app.js HELLO_MSG(제목 「손자병법 주식 격언 열 가지」 + 열 줄) 글자 그대로
//   첫 쪽(su-sonja.js mindSec) = 꾀 칸 다음 · 자세히 앞 · 산수 수채화(su-bg.svg)를 깐 족자 · 격언은 남의 글 표시(data-proper)
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

import {MIND10, MIND_LINES, MIND_TITLE, MIND_RULE} from '../../site/su/su-mind-core.js';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const read = f => fs.readFileSync(path.join(ROOT, f), 'utf8');
const HELLO = JSON.parse(/const HELLO_MSG = (\[[^\]]*\]);/.exec(read('site/next/app.js'))[1].replace(/'/g, '"'));

test('제목 · 열 줄 = 돌이 첫 화면 편지(app.js HELLO_MSG) 글자 그대로', () => {
  assert.equal(MIND_RULE, 'gyeok10-v1');
  assert.equal(HELLO.length, 11);
  assert.equal(MIND_TITLE, HELLO[0]);
  assert.deepEqual([...MIND_LINES], HELLO.slice(1));
  const atlas = read('site/atlas/atlas.js'), old = JSON.parse(/const HELLO_MSG = (\[[^\]]*\]);/.exec(atlas)[1].replace(/'/g, '"'));
  assert.equal(old[0], '아틀란스 주식 격언 열 가지', '사장님 2026-10-16 첫 글 제목');
  assert.deepEqual(old.slice(1), HELLO.slice(1), '열 줄은 첫 글과 같음');
});

test('줄마다 번호 · 격언 · 풀이로 나눠도 글자가 그대로', () => {
  assert.equal(MIND10.length, 10);
  assert.deepEqual(MIND10.map(m => m.n), [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
  MIND10.forEach((m, i) => { assert.ok(m.say && m.more); assert.equal(m.n + '. ' + m.say + ' ' + m.more, MIND_LINES[i]); });
  assert.ok(Object.isFrozen(MIND10) && MIND10.every(m => Object.isFrozen(m)) && Object.isFrozen(MIND_LINES));
});

test('첫 쪽 — 첫 화면 맨 위(표지보다 위 · 23:21 「맨 위에 두어라」) · 수채화 족자 · 격언은 남의 글 표시 · 쪽 글에 쓰지 않을 말 0', async () => {
  const sj = read('site/su/su-sonja.js');
  assert.ok(sj.includes("import {MIND10, MIND_TITLE, MIND_RULE} from '/su/su-mind-core.js';"));
  assert.ok(sj.includes('body = [sunSec(T), wait, moreBox(S), endSec(T, S)];') && sj.includes("if (!main.querySelector(':scope > section.sj-mind')) main.prepend(mindSec());"), '맨 위(표지 앞) — 먼저 칠한 판이 없으면 맨 앞에 붙임');
  const html = read('site/su/index.html'), at = html.indexOf('<main class="sj-page sj-pre" data-page="sonja" data-wait="">'), ms = html.indexOf('<section class="sj-sec sj-mind"'), cv = html.indexOf('<section class="sj-cover"');
  assert.ok(at >= 0 && ms > at && cv > ms, 'index.html 먼저 칠함 — main 맨 앞 격언 족자 → 표지');
  const pre = html.slice(ms, html.indexOf('</section>', ms));
  const said = [...pre.matchAll(/<b class="sj-gkm">([^<]+)<\/b><span class="sj-gkx">([^<]+)<\/span>/g)].map(m => m[1] + ' ' + m[2]);
  assert.deepEqual(said, MIND10.map(m => m.say + ' ' + m.more), '먼저 칠한 글 = 사장님 글 그대로');
  assert.ok(pre.includes('<span class="sj-brush">' + MIND_TITLE + '</span>') && pre.includes('data-proper=""') && pre.includes('data-rule="' + MIND_RULE + '"'));
  const fn = /function mindSec\(\) \{[\s\S]*?\n\}/.exec(sj)?.[0] ?? '';
  assert.ok(fn.includes("h('p', {class: 'sj-gkt', 'data-proper': ''}"), '격언은 남의 글 표시(data-proper)');
  assert.ok(!/href:/.test(fn), '고리 0');
  const {screenHits, ruinHits} = await import('../../site/next/words.js');
  const texts = [...fn.matchAll(/'([^'\n]*[가-힣][^'\n]*)'/g)].map(m => m[1]);
  assert.deepEqual(texts.flatMap(s => [...screenHits(s), ...ruinHits(s).map(x => x.word)]), [], '쪽 글(격언 밖)에 쓰지 않을 말 0');
  assert.ok(!/\.innerHTML\b|['"]style['"]/.test(fn), '보안 규칙');
  const css = read('site/su/su-sonja.css');
  assert.ok(/#su \.sj-mind \.sj-gk \{[^}]*url\(\/su\/su-bg\.svg\)/.test(css), '산수 수채화(su-bg.svg)를 깐 족자');
  assert.ok(/#su \.sj-mind \.sj-gkm \{[^}]*font-size: 1\.3125rem/.test(css) && /#su \.sj-mind \.sj-gkx \{[^}]*font-size: 1\.0625rem/.test(css), '격언 21 · 풀이 17');
  assert.ok(!/sj-jg|sj-js\b/.test(css), '앞 판 대나무 조각 꾸밈 지움');
});
