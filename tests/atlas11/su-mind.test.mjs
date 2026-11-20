// 주식 할 때 가질 자세 열한 가지 시험(주문 1120-2116 · 사장님 2026-11-20(마카오) 21:16 「전에 자료를 찾아 봐봐 주식을 할 때 가져야 할 자세 11가지 정리한 거 있어 그걸 첫 페이지에 멋지게 나열해봐」)
//   site/su/su-mind-core.js MIND11 — 격언 = 사장님 2026-10-17 글 그대로(site/next/p-why.js QS say · docs/design/godori-2026-10-17/brief.md 원문)
//   질문 = p-why.js QS q = su-why.js WHY_QS · 묶음 = p-why.js GROUPS = su-why.js WHY_GROUPS · 첫 쪽(su-sonja.js mindSec)은 꾀 칸 다음 · 자세히 앞 · 격언은 남의 글 표시(data-proper)
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

import {MIND11, MIND_RULE} from '../../site/su/su-mind-core.js';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const read = f => fs.readFileSync(path.join(ROOT, f), 'utf8');
const WHY = read('site/next/p-why.js');
const QS = [...WHY.matchAll(/\{q: '([^']+)', a: \[[\s\S]*?\], say: '([^']+)'\}/g)].map(m => ({q: m[1], say: m[2]}));
const GROUPS = JSON.parse(/export const GROUPS = (\[\[[^\n]*\]\]);/.exec(WHY)[1].replace(/'/g, '"'));

test('열한 가지 · 차례 1 ~ 11 · 바뀌지 않게 얼림', () => {
  assert.equal(MIND_RULE, 'mind11-v1');
  assert.equal(MIND11.length, 11);
  assert.deepEqual(MIND11.map(m => m.n), [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11]);
  assert.ok(Object.isFrozen(MIND11) && MIND11.every(m => Object.isFrozen(m)));
});

test('격언 = 사장님 글 그대로(p-why.js QS say · 2026-10-17 원문) · 질문 = 「왜 사?」 열한 질문', () => {
  assert.equal(QS.length, 11, 'p-why.js QS 열한 개를 읽음');
  assert.deepEqual(MIND11.map(m => m.say), QS.map(x => x.say));
  assert.deepEqual(MIND11.map(m => m.q), QS.map(x => x.q));
  const brief = read('docs/design/godori-2026-10-17/brief.md');
  for (const m of MIND11) assert.ok(brief.includes(m.q + ' ') && brief.includes('-' + m.say + '\n'), '원문 한 장 명령문에 그대로 — ' + m.say);
  const wy = read('site/su/su-why.js'), qs = /export const WHY_QS = Object\.freeze\((\[[^\n]*\])\);/.exec(wy);
  assert.ok(qs, 'su-why.js WHY_QS');
  assert.deepEqual(MIND11.map(m => m.q), JSON.parse(qs[1].replace(/'/g, '"')), '손자병법 「왜 사?」 질문과 같음');
});

test('묶음 = 네 묶음(이유 · 돈 · 때 · 마음 — p-why.js GROUPS · su-why.js WHY_GROUPS)', () => {
  const gOf = n => GROUPS.find(([, ns]) => ns.includes(n))?.[0];
  assert.deepEqual(MIND11.map(m => m.g), MIND11.map(m => gOf(m.n)));
  const wy = read('site/su/su-why.js'), g = /export const WHY_GROUPS = Object\.freeze\((\[\[[^\n]*\]\])\);/.exec(wy);
  assert.ok(g, 'su-why.js WHY_GROUPS');
  assert.deepEqual(JSON.parse(g[1].replace(/'/g, '"')), GROUPS);
  assert.deepEqual([...new Set(MIND11.map(m => m.g))].sort(), ['돈', '때', '마음', '이유'].sort());
});

test('첫 쪽 — 꾀 칸 다음 · 자세히 앞 · 격언은 남의 글 표시 · 고리 멈춤 하나 · 쪽 글에 쓰지 않을 말 0', async () => {
  const sj = read('site/su/su-sonja.js');
  assert.ok(sj.includes("import {MIND11, MIND_RULE} from '/su/su-mind-core.js';"));
  assert.ok(sj.includes('body = [sunSec(T), wait, mindSec(), moreBox(S), endSec(T, S)];'), '꾀 칸(wait → trickSec) 다음 · 자세히 앞');
  const fn = /function mindSec\(\) \{[\s\S]*?\n\}/.exec(sj)?.[0] ?? '';
  assert.ok(fn.includes("h('span', {'data-proper': '', text: m.say})"), '격언은 남의 글 표시(data-proper)');
  assert.deepEqual([...fn.matchAll(/href: '([^']+)'/g)].map(m => m[1]), ['#/q'], '고리는 멈춤 하나');
  const {screenHits, ruinHits} = await import('../../site/next/words.js');
  const texts = [...fn.matchAll(/'([^'\n]*[가-힣][^'\n]*)'/g)].map(m => m[1]);
  assert.deepEqual(texts.flatMap(s => [...screenHits(s), ...ruinHits(s).map(x => x.word)]), [], '쪽 글(격언 밖)에 쓰지 않을 말 0');
  assert.ok(!/\.innerHTML\b|['"]style['"]/.test(fn), '보안 규칙');
  const css = read('site/su/su-sonja.css');
  assert.ok(/#su \.sj-mind ol\.sj-jg \{/.test(css) && /#su \.sj-mind \.sj-jsm \{[^}]*font-size: 1\.375rem/.test(css) && /#su \.sj-mind \.sj-jsq \{[^}]*font-size: 1\.0625rem/.test(css), '대나무 조각 꾸밈 · 격언 22 · 질문 17');
});
