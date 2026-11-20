// 대나무 숲 그림 시험(주문 1120-1422 · 사장님 2026-11-20(마카오) 14:22 「여기 첫화면에 멋진 대나무밭 그림 그려서 기품있게 예술적으로 기백있게 …」)
//   site/su/su-bamboo.js — scripts/atlas11/next/su_bamboo.py 가 만듦 · 글 속 그림(가장 큰 칠함에 들지 않음) · 쪽빛 먹 · 빨강 0 · 글자 0 · 가벼움 · 다시 만들면 같은 그림
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {execFileSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const svg = fs.readFileSync(path.join(ROOT, 'site/su/su-bamboo.js'), 'utf8');

test('쪽빛 먹 넷과 종이빛만 · 빨강 0', () => {
  const cols = new Set((svg.match(/#[0-9A-Fa-f]{6}\b/g) ?? []).map(c => c.toUpperCase()));
  for (const c of cols) assert.ok(['#27236E', '#4339A8', '#8C86DB', '#BDB9EE', '#FCFEFD'].includes(c), '쓰지 않는 빛 ' + c);
  for (const c of cols) { const [r, g, b] = [1, 3, 5].map(i => parseInt(c.slice(i, i + 2), 16)); assert.ok(!(r > 170 && g < 110 && b < 110), '빨강 ' + c); }
});

test('글자 0(한자 0) · 스크립트 0 · 바깥 주소 0', () => {
  assert.ok(!/'text'|innerHTML|href|https?:\/\//.test(svg));
  const body = svg.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\*\*.*\*\//g, '');
  assert.ok(!/[㐀-鿿]/.test(body), '한자 0');
});

test('가벼움(60KB 아래) · 다시 만들면 같은 그림', () => {
  assert.ok(Buffer.byteLength(svg) < 60000, String(Buffer.byteLength(svg)));
  const tmp = path.join(fs.mkdtempSync(path.join(ROOT, '.tmp-bamboo-')), 'b.js');
  try { execFileSync('python3', [path.join(ROOT, 'scripts/atlas11/next/su_bamboo.py'), tmp]); assert.equal(fs.readFileSync(tmp, 'utf8'), svg); }
  finally { fs.rmSync(path.dirname(tmp), {recursive: true, force: true}); }
});
