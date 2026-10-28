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
  for (const t of ['나도 살까 싶을 때', '주식을 사기 전에,', '지난 기록으로 2분만 확인하세요', '회사 이름 넣기', '지난 기록으로 고른 회사 보기', '앞날을 맞히거나 사고팔기를 권하지 않습니다.', '이 사이트 소개']) { // 2026-10-29 01:48 네 걸음 — 숫자 셋 · 풀이 줄 · 오늘 코스피 줄은 ② 보기로
    assert.ok(hero.has(t), `heroBox 에 「${t}」 없음`);
    assert.ok(boot.has(t), `boot-home.js 에 「${t}」 없음 — 여는 동안 글과 다름`);
  }
  assert.ok(src.slice(i, j).includes("'#/t/picks'") && read('site/next/boot-home.js').includes("'#/t/picks'"), '지난 기록으로 고른 회사 고리 #/t/picks 가 두 곳에 같이 없음');
});

test('네 걸음(2026-10-29 01:48 「이 36이 둘리를 다 함께 아주 직관적으로」) — 여는 동안 칸과 다 그린 칸이 같은 낱말 · 차례', () => {
  const boot = read('site/next/boot-home.js'), src = read('site/next/home-new.js');
  for (const k of ['찾기', '보기', '묻기', '돌아보기', '사려는 회사', '지난 기록', '질문 11개', '한 달 뒤', '네 걸음']) { assert.ok(src.includes(`'${k}'`), `home-new.js 네 걸음에 「${k}」 없음`); assert.ok(boot.includes(`'${k}'`), `boot-home.js 에 「${k}」 없음`); }
  for (const k of ['결론', '근거', '할 일']) assert.ok(!boot.includes(`'${k}'`), `boot-home.js 에 옛 네 마디 낱말 「${k}」이 남음`);
  assert.match(read('site/next/app.js'), /\[hero, partWhy\(B\), recordBox\(B\), partToday\(TH, H\?\.idx\?\.KOSPI\), mapBox\(TH, news\), mktBox\(band\.el, newsBox\(H\), H\), partDo\(B\),/, '첫 화면 차례가 네 걸음이 아님');
  assert.match(read('site/next/app.js'), /whyBox\(\{done: \(C\?\.stop \?\? 0\) > 0\}\), backBox\(\{month\}\), thumb/, '③ 묻기 뒤에 ④ 돌아보기가 없음');
});

test('index.html 이 boot-home.js 를 app.js 보다 먼저 부름 · 새 첫 화면 모양을 받음', () => {
  const html = read('site/next/index.html'), a = html.indexOf('src="/next/boot-home.js"'), b = html.indexOf('src="/next/app.js"');
  assert.ok(a >= 0 && b > a, 'boot-home.js 가 app.js 앞에 없음');
  assert.match(html, /href="\/next\/home-new\.css"/);
  assert.doesNotMatch(html, /s-boot s-clock/, '여는 동안 돌 시계 그림이 남음(새 첫 화면에는 돌 시계가 없음)');
});
