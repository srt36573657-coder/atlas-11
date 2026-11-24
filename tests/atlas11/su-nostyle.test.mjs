// 손자병법 화면 글에 인라인 꾸밈 없음(주문 1125-0049 · 미리 보기 sonja-sell 1/11 「화면 오류 0」 다섯 — 막대 길이를 style 로 넣어 보안 규칙 style-src 'self' 에 막힘 · 틀림 장부 262)
//   h() · s() 에 style 을 넘기면 브라우저가 막고 화면 오류가 남 — 지역 서버는 이 규칙을 안 걸어 이 상자에서 안 보였음 → 글에서 미리 막음
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const DIR = path.resolve(import.meta.dirname, '../../site/su');
test('site/su/*.js — style 넘김 · style 속성 쓰기 0', () => {
  const bad = [];
  for (const f of fs.readdirSync(DIR).filter(f => f.endsWith('.js'))) {
    fs.readFileSync(path.join(DIR, f), 'utf8').split('\n').forEach((ln, i) => {
      const t = ln.replace(/\/\/.*$/, '');
      if (/[{,]\s*['"]?style['"]?\s*:/.test(t) || /setAttribute\(\s*['"]style['"]/.test(t)) bad.push(f + ':' + (i + 1));
    });
  }
  assert.deepEqual(bad, []);
});
