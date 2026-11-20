// 손자병법 전체 뒤 배경 시험(주문 1120-1449 · 사장님 2026-11-20(마카오) 14:49 「이배경을 손자병법 싸이트 전체 뒤 배경으로 하라」)
//   site/su/su-bg.svg — scripts/atlas11/next/su_bg.py 가 첫 쪽 한 폭(su-sonja-scroll.svg)에서 번호 도장 · 정산 점선만 빼서 만듦 · 글자 0 · 스크립트 0 · 바깥 주소 0 · 가벼움 · 다시 만들면 같은 그림
//   site/su/su-sonja.css — #su::after 한 장이 화면에 붙어 글 뒤에 · #su::before(옛 겹테 자리)는 비워 둠
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {execFileSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const svg = fs.readFileSync(path.join(ROOT, 'site/su/su-bg.svg'), 'utf8');
const css = fs.readFileSync(path.join(ROOT, 'site/su/su-sonja.css'), 'utf8');

test('글자 0 · 번호 도장 0 · 정산 점선 0 · 스크립트 0 · 바깥 주소 0', () => {
  assert.ok(!/<text/.test(svg), '글자');
  assert.ok(!/<circle cx="30" cy="200"/.test(svg), '번호 도장');
  assert.ok(!/stroke-dasharray="0\.1 6"/.test(svg), '정산 점선');
  assert.ok(!/<script|javascript:|on[a-z]+="/i.test(svg), '스크립트');
  assert.ok(!/(?:href|src)="https?:/.test(svg), '바깥 주소');
  assert.ok(!/[㐀-鿿]/.test(svg.replace(/<!--[\s\S]*?-->/g, '')), '한자 0');
});

test('빨강 0(한국에서 빨강은 오름 — 배경에도 쓰지 않음)', () => {
  for (const c of new Set((svg.match(/#[0-9A-Fa-f]{6}\b/g) ?? []).map(x => x.toUpperCase()))) {
    const [r, g, b] = [1, 3, 5].map(i => parseInt(c.slice(i, i + 2), 16));
    assert.ok(!(r > 170 && g < 90 && b < 90), '빨강 ' + c);
  }
});

test('가벼움(40KB 아래) · 다시 만들면 같은 그림', () => {
  assert.ok(Buffer.byteLength(svg) < 40000, String(Buffer.byteLength(svg)));
  const tmp = path.join(fs.mkdtempSync(path.join(ROOT, '.tmp-bg-')), 'bg.svg');
  try { execFileSync('python3', [path.join(ROOT, 'scripts/atlas11/next/su_bg.py'), tmp]); assert.equal(fs.readFileSync(tmp, 'utf8'), svg); }
  finally { fs.rmSync(path.dirname(tmp), {recursive: true, force: true}); }
});

test('CSS — 화면에 붙은 한 장(#su::after) · 글 뒤 · 누를 수 없음 · 옛 겹테 자리(#su::before)는 비움', () => {
  const rule = [...css.matchAll(/html\.sj-on #su::after \{([^}]*)\}/g)].map(m => m[1]).find(r => r.includes('su-bg.svg')) ?? '';
  for (const want of ['content: ""', 'position: fixed', 'inset: 0', 'z-index: -1', 'url(/su/su-bg.svg)', 'cover', 'pointer-events: none']) assert.ok(rule.includes(want), want);
  assert.ok(/html\.sj-on #su \{ position: relative; z-index: 0; \}/.test(css), '#su 쌓임 한 겹');
  assert.ok(!/html\.sj-on #su::before \{[^}]*content: ""/.test(css), '옛 겹테 자리에 그리지 않음');
});
