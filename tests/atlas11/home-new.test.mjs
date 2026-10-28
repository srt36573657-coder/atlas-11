// 새 첫 화면(사장님 2026-10-28 11:12 「어」 · docs/design/why-mock-2026-10-28/order-1112.txt · home-brief.md) — 여는 동안 소개 칸(boot-home.js)과 다 그린 소개 칸(home-new.js heroBox)의 글이 같은가
//   다르면 여는 동안 보인 글이 바뀌며 깜빡이고 · 가장 큰 그림(check_white ③ 느린 4G 2.5초)이 다 그린 때로 밀림
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const read = f => fs.readFileSync(path.join(ROOT, f), 'utf8');
const quoted = s => new Set([...s.matchAll(/'([^'\n]*[가-힣][^'\n]*)'/g)].map(m => m[1]));

test('여는 동안 소개 칸 글 = 다 그린 소개 칸 글', () => {
  const boot = quoted(read('site/next/boot-home.js'));
  const src = read('site/next/home-new.js'), i = src.indexOf('export function heroBox'), j = src.indexOf('\n}\n', i);
  assert.ok(i >= 0 && j > i, 'home-new.js 에 heroBox 가 없음');
  const hero = quoted(src.slice(i, j));
  for (const t of ['주식을 사기 전에,', '지난 기록으로 한 번 더 확인하세요', '코스피와 코스닥 회사, 업종의 지난 기록을 숫자로 보여 드립니다.', '앞날을 맞히거나 사고팔기를 권하지 않습니다.', '회사', '업종', '년 기록', '이 사이트 소개']) {
    assert.ok(hero.has(t), `heroBox 에 「${t}」 없음`);
    assert.ok(boot.has(t), `boot-home.js 에 「${t}」 없음 — 여는 동안 글과 다름`);
  }
});

test('네 마디 줄(2026-10-28 14:45 기승전결) — 여는 동안 칸과 다 그린 칸이 같은 네 낱말', () => {
  const boot = read('site/next/boot-home.js'), src = read('site/next/home-new.js');
  for (const k of ['결론', '근거', '오늘', '할 일']) { assert.ok(src.includes(`'${k}'`), `home-new.js PARTS 에 「${k}」 없음`); assert.ok(boot.includes(`'${k}'`), `boot-home.js 에 「${k}」 없음`); }
  assert.match(read('site/next/app.js'), /railBox\(\), hero, goFirst\(\), partWhy\(B\), recordBox\(B\), partToday\(TH, H\?\.idx\?\.KOSPI\), mapBox\(TH, news\)/, '첫 화면 차례가 네 마디가 아님');
});

test('index.html 이 boot-home.js 를 app.js 보다 먼저 부름 · 새 첫 화면 모양을 받음', () => {
  const html = read('site/next/index.html'), a = html.indexOf('src="/next/boot-home.js"'), b = html.indexOf('src="/next/app.js"');
  assert.ok(a >= 0 && b > a, 'boot-home.js 가 app.js 앞에 없음');
  assert.match(html, /href="\/next\/home-new\.css"/);
  assert.doesNotMatch(html, /s-boot s-clock/, '여는 동안 돌 시계 그림이 남음(새 첫 화면에는 돌 시계가 없음)');
});
