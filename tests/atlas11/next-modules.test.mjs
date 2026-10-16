// 새 아틀란스 쪽 모듈 지킴(사장님 2026-10-17 04:04 「첫화면 부터 마지막 페이지 까지 모두 바꿔」 · 04:23 「에이전트 총 동원해」 · 규칙 74 ⑧)
//   ① READY 에 든 쪽은 p-<이름>.js(render 내보냄) · p-<이름>.css 가 있고 맞대는 검사 check_<이름>.mjs 가 있음(co · chx · today 처럼 다른 화면 안에 끼는 쪽 포함)
//   ② 보안 규칙(CSP style-src · script-src 'self') — 글 속 HTML 넣기 · 글로 쓴 꾸밈 · eval 없음
//   ③ 입체 없음(규칙 50) — 캔버스 · 원근 · 3D 돌리기 · 그림자 필터 없음
//   ④ 옛 주소를 받는 쪽(OLD_KINDS)은 모두 모듈 파일이 있음 — 켜면 바로 열리게
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const NEXT = path.join(ROOT, 'site/next'), CHK = path.join(ROOT, 'scripts/atlas11/next');
const app = fs.readFileSync(path.join(NEXT, 'app.js'), 'utf8');
const listOf = re => ((re.exec(app) || [, ''])[1].match(/'([a-z]+)'/g) || []).map(x => x.slice(1, -1));
const READY = listOf(/const READY = new Set\(\[([^\]]*)\]\);/), OLD = listOf(/const OLD_KINDS = new Set\(\[([^\]]*)\]\);/);
const js = fs.readdirSync(NEXT).filter(f => f.endsWith('.js')), css = fs.readdirSync(NEXT).filter(f => f.endsWith('.css'));
const src = f => fs.readFileSync(path.join(NEXT, f), 'utf8');
const code = s => s.replace(/\/\*[\s\S]*?\*\//g, '').replace(/(^|[^:'"\\])\/\/[^\n]*/g, '$1'); // 풀이 글은 빼고 셈

test('① READY 쪽마다 모듈 · 모양 · 맞대는 검사', () => {
  for (const k of READY) {
    assert.ok(fs.existsSync(path.join(NEXT, `p-${k}.js`)), `p-${k}.js 없음`);
    assert.ok(fs.existsSync(path.join(NEXT, `p-${k}.css`)), `p-${k}.css 없음`);
    assert.match(src(`p-${k}.js`), /export (async )?function render\s*\(/, `p-${k}.js 가 render 를 내보내지 않음`);
    const chk = ['up', 'time', 'info', 'x', 'talk'].includes(k) ? 'check_misc.mjs' : `check_${k}.mjs`;
    assert.ok(fs.existsSync(path.join(CHK, chk)), `${k} 맞대는 검사 ${chk} 없음`);
  }
});

test('② 보안 규칙 — 글 속 HTML · 글로 쓴 꾸밈 · eval 없음', () => {
  for (const f of js) {
    const s = code(src(f));
    for (const bad of [/\.innerHTML\s*=/, /\.outerHTML\s*=/, /insertAdjacentHTML/, /document\.write/, /\beval\s*\(/, /new Function\s*\(/, /setAttribute\(\s*['"]style['"]/, /\.style\.cssText\s*=/, /style="/])
      assert.doesNotMatch(s, bad, `${f}: ${bad}`);
  }
  assert.doesNotMatch(fs.readFileSync(path.join(NEXT, 'index.html'), 'utf8'), /style="|<script(?![^>]*\bsrc=)[^>]*>/, 'index.html 에 글 속 꾸밈 · 스크립트');
});

test('③ 입체 없음 — 캔버스 · 원근 · 3D 돌리기 · 그림자 필터', () => {
  for (const f of js) assert.doesNotMatch(code(src(f)), /getContext\s*\(|createElement\(\s*['"]canvas/, `${f}: 캔버스`);
  for (const f of css) assert.doesNotMatch(src(f), /perspective|preserve-3d|rotate[XY]\(|translateZ|translate3d|drop-shadow/, `${f}: 입체`);
});

test('④ 옛 주소를 받는 쪽은 모두 모듈 파일이 있음', () => {
  assert.ok(OLD.length >= 9, 'OLD_KINDS 를 못 읽음');
  for (const k of OLD) assert.ok(fs.existsSync(path.join(NEXT, `p-${k}.js`)), `p-${k}.js 없음`);
  for (const k of ['co', 'past', 'rivals', 'grow', 'range', 'chx']) assert.ok(fs.existsSync(path.join(NEXT, `p-${k}.js`)), `p-${k}.js 없음`);
});
