// 큐피트 쪽 js 설명 빼기(scripts/atlas11/next/slim_js.mjs · 주문 1114-1306 「속도를 3배 빠르게 해」) — 글 · 셈은 한 글자도 안 바뀜
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {createRequire} from 'node:module';
import {slimJs} from '../../scripts/atlas11/next/slim_js.mjs';
import {root} from './helpers.mjs';

test('설명만 뺌 — 따옴표 · 여러 줄 글 · ${ } · 정규식 안의 // · /* */ 는 그대로', () => {
  const src = [
    '// 머리 설명', 'const u = "https://a.b/c"; // 끝 설명', "const v = 'x // y /* z */';", '/* 덩이', '   설명 */', 'const t = `줄1 // 글', '', '// 글 안 줄', '${a /* 식 안 */ + 1}`;',
    'const r = /https?:\\/\\//g; // 정규식 뒤', 'const q = a / b / c; // 나눗셈', 'const k = /[/]/.test(s);', '/*! 남김 */', 'f(); /* 한 줄 덩이 */ g();', ''].join('\n');
  const {code, cut} = slimJs(src);
  assert.ok(code.includes('const u = "https://a.b/c";') && !code.includes('끝 설명') && !code.includes('머리 설명') && !code.includes('덩이'));
  assert.ok(code.includes("const v = 'x // y /* z */';"), '따옴표 안');
  assert.ok(code.includes('`줄1 // 글\n\n// 글 안 줄\n${a /* 식 안 */ + 1}`'), '여러 줄 글 · 빈 줄 · ${ } 안은 그대로');
  assert.ok(code.includes('const r = /https?:\\/\\//g; // 정규식 뒤'), '정규식이 든 줄은 설명도 남김(헷갈리지 않게)');
  assert.ok(code.includes('const q = a / b / c;') && !code.includes('나눗셈'), '나눗셈 줄 설명은 뺌');
  assert.ok(code.includes('const k = /[/]/.test(s);') && code.includes('/*! 남김 */') && code.includes('f();  g();'));
  assert.ok(cut >= 5);
});

test('site/su 의 js 모두 — 뺀 뒤 뼈대(문법 나무)가 원본과 같음 · 줄어듦', t => {
  let acorn = null; for (const base of [root + '/', '/opt/node-tools/']) { try { acorn = createRequire(base)('acorn'); break; } catch {} }
  if (!acorn) return t.skip('acorn 없음');
  const strip = n => (Array.isArray(n) ? n.map(strip) : n && typeof n === 'object' ? Object.fromEntries(Object.entries(n).filter(([k]) => !['start', 'end', 'loc', 'range', 'raw'].includes(k)).map(([k, v]) => [k, strip(v)])) : n);
  const dir = path.join(root, 'site/su'); let n = 0, saved = 0;
  for (const f of fs.readdirSync(dir).filter(f => f.endsWith('.js'))) {
    const src = fs.readFileSync(path.join(dir, f), 'utf8'), {code} = slimJs(src);
    const P = s => strip(acorn.parse(s, {ecmaVersion: 'latest', sourceType: 'module'}));
    assert.deepEqual(P(code), P(src), f + ' — 뼈대가 바뀜');
    n++; saved += src.length - code.length;
  }
  assert.ok(n >= 20 && saved > 0, `파일 ${n} · 줄어든 글자 ${saved}`);
});
