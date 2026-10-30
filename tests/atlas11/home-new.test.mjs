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

test('여는 동안 소개 칸 글 = 다 그린 소개 칸 글(① 돈 흐름 · 2026-10-29 12:45 ~ 13:33 「바보도 … 요즘 주식판을 한눈에」)', () => {
  const boot = quoted(read('site/next/boot-home.js'));
  const src = read('site/next/home-new.js'), i = src.indexOf('function flowMap'), j = src.indexOf('\n}\n', src.indexOf('export function heroBox'));
  assert.ok(i >= 0 && j > i, 'home-new.js 에 flowMap · heroBox 가 없음');
  const hero = quoted(src.slice(i, j));
  for (const t of ['돈 흐름', '요즘 돈은', '여기로 몰렸어요', '돈이 몰린 곳', '돈이 빠진 곳', '한 달 동안 시장과 견준 값이에요.', '애덤 스미스', '사려는 사람이 많으면 값이 올라요.', '지난 기록으로 고른 회사 보기', '앞날을 맞히거나 사고팔기를 권하지 않습니다.', '요즘 돈 흐름', '한 달 동안 시장보다 더 오른 업종과 덜 오른 업종']) {
    assert.ok(hero.has(t), `heroBox · flowMap 에 「${t}」 없음`);
    assert.ok(boot.has(t), `boot-home.js 에 「${t}」 없음 — 여는 동안 글과 다름`);
  }
  for (const t of ['나도 살까 싶을 때', '회사 이름 넣기', '네 걸음']) assert.ok(!boot.has(t) && !hero.has(t), `옛 소개 칸 글 「${t}」이 남음`);
  assert.match(src, /export const FLOW_N = 3;/); assert.match(read('site/next/boot-home.js'), /j < 3/, '여는 동안 빈 줄 수가 FLOW_N(3)과 다름');
});

test('① 돈 흐름 까닭 열한 가지(2026-10-30 04:27 · 05:03 「응」) — 여는 동안 몰린 곳 자리 = 다 그린 자리(같은 틀 · 같은 높이) · 권하지 않습니다는 머리 밑', () => {
  const boot = read('site/next/boot-home.js'), src = read('site/next/home-new.js'), css = read('site/next/home-new.css');
  // 여는 동안 칸: 빈 막대 줄 + 「왜?」 자리 + 불빛 줄 자리 + 「열한 가지 보기」 자리 — home-new.js upEmpty · upItem 과 같은 칸 이름 · 같은 차례
  assert.match(boot, /el\('li', 'y11-i y11-e'\), w = el\('div', 'y11-box'\), ws = el\('div', 'y11-s'\); ws\.append\(el\('div', 'nh-fr nh-f0'\), el\('div', 'y11-l'\), el\('div', 'y11-lt'\), el\('div', 'y11-m'\)\)/);
  assert.match(src, /h\('div', \{class: 'y11-s'\}, h\('div', \{class: 'nh-fr nh-f0'\}\), h\('div', \{class: 'y11-l'\}\), h\('div', \{class: 'y11-lt'\}\), h\('div', \{class: 'y11-m'\}\)\)/);
  assert.match(src, /h\('summary', \{class: 'y11-s'\}, bar, whyLine\(EN \? w\.why\?\.en : w\.why\?\.ko\), lightRow\(w\.lights\), moreLine\(\)\)/);
  assert.match(src, /h\('div', \{class: 'y11-s'\}, bar, whyLine\(null\), lightRow\(null\), moreLine\(\)\)/, '자료가 없을 때도 같은 틀(「?」)');
  // 높이를 정하는 칸(두 줄 자리 · 불빛 줄 · 보기 줄) — 여는 동안과 같게
  for (const re of [/\.y11-l \{[^}]*min-height: 48px;[^}]*line-height: 24px;/, /\.y11-lt \{[^}]*min-height: 38px;/, /\.y11-m \{[^}]*min-height: 24px;/, /\.y11-t > span \{ display: block; \}/, /\.nh-hero \.nh-h1 > span \{ display: block; \}/]) assert.match(css, re);
  // 「권하지 않습니다」는 머리 밑(첫 한 화면 안) — 여는 동안 · 다 그린 칸 같은 자리
  assert.match(boot, /sec\.append\(pm, h2, el\('p', 'nh-no', '앞날을 맞히거나 사고팔기를 권하지 않습니다\.'\), fm, door\);/);
  assert.ok(src.indexOf("h('p', {class: 'nh-no'") > src.indexOf("h('h2', {class: 'nh-h1'}") && src.indexOf("h('p', {class: 'nh-no'") < src.indexOf('flowMap(TH, W),'), 'heroBox 에서 권하지 않습니다가 머리 밑이 아님');
  // 앞날 말 · 사고팔기 말 없음
  const strs = [...quoted(src.slice(src.indexOf('/* 몰린 곳마다 까닭 열한 가지'), src.indexOf('/** 마디 머리')))];
  assert.ok(!strs.some(x => /오를 것|내릴 것|사세요|파세요|추천|매수|매도/.test(x)), '까닭 칸에 앞날 · 사고팔기 말');
});

test('첫 화면 차례(2026-10-29 바보도 한눈에) — ① 돈 흐름 → ② 고른 회사 → 업종 점 그림 → 오늘 시장 → ③ 묻기 → ④ 돌아보기', () => {
  const app = read('site/next/app.js'), src = read('site/next/home-new.js');
  assert.match(app, /const hero = heroBox\(TH, W\); hero\.id = 'nh-p1';/); // W = 까닭 열한 가지(2026-10-30 04:27)
  assert.match(app, /\[hero, recordBox\(B\), mapBox\(TH, news\), mktBox\(band\.el, newsBox\(H\), H\), partDo\(\),/, '첫 화면 차례가 바뀜');
  assert.match(app, /whyBox\(\{done: \(C\?\.stop \?\? 0\) > 0\}\), backBox\(\{month\}\), thumb/, '③ 묻기 뒤에 ④ 돌아보기가 없음');
  for (const k of ['고른 회사', '묻기', '돌아보기', '이렇게 고른 회사', '아무 회사나', '오늘은 조건에 맞은 회사가 없어요.', "'#/t/pick'", "'#/t/picks'"]) assert.ok(src.includes(k.startsWith("'") ? k : `'${k}'`) || src.includes(k), `home-new.js 에 「${k}」 없음`);
  // 분명한 문장(13:33 「모든 회사는 스물네 번이었어요 … 분명한 이야기만 해」) — 주어가 있는 문장 · 옛 「모든 회사」 · 「①과 ③은 높을수록」 · 「읽는 법」 없음
  assert.match(src, /이렇게 고른 회사 100곳 중 \$\{a\}곳이 한 달 뒤 시장보다 5% 넘게 더 올랐어요\./);
  assert.match(src, /같은 날 아무 회사나 골랐다면 100곳 중 \$\{b\}곳이었어요\./);
  const strs = [...quoted(src)]; // 글(따옴표 안)만 — 머리말 기록은 셈 밖
  for (const k of ['높을수록 좋고', '읽는 법', '근거는 셋이에요']) assert.ok(!strs.some(x => x.includes(k)), `헷갈리는 옛 글 「${k}」이 남음`);
  assert.ok(!strs.includes('모든 회사'), '주어가 흐린 옛 이름 「모든 회사」가 남음');
  // 스승 한 줄 — 서른여섯(애덤 스미스 · 다윈 · 소크라테스) + 셋(덩샤오핑 · 리콴유 · 퍼스)
  for (const w of ['애덤 스미스', '다윈', '소크라테스', '덩샤오핑', '리콴유', '퍼스']) assert.match(src, new RegExp(`sage\\('${w}'`), `스승 「${w}」 한 줄이 없음`);
});

test('index.html 이 boot-home.js 를 app.js 보다 먼저 부름 · 새 첫 화면 모양을 받음', () => {
  const html = read('site/next/index.html'), a = html.indexOf('src="/next/boot-home.js"'), b = html.indexOf('src="/next/app.js"');
  assert.ok(a >= 0 && b > a, 'boot-home.js 가 app.js 앞에 없음');
  assert.match(html, /href="\/next\/home-new\.css"/);
  assert.doesNotMatch(html, /s-boot s-clock/, '여는 동안 돌 시계 그림이 남음(새 첫 화면에는 돌 시계가 없음)');
});

test('말하는 불빛(사장님 2026-10-30 15:15(+08) 「응」 · docs/design/why11-2026-10-30/order-1615.txt) — 물음 · 쉬운 말 열하나 · 영어 판 한글 0 · 그림 모양 = 자료 셈 · 쓰지 않을 말 0', async () => {
  const {TALK_Q, TALK_A, sceneKind} = await import('../../site/next/home-talk.js');
  const {screenHits} = await import('../../site/next/words.js');
  assert.deepEqual(Object.keys(TALK_Q).map(Number), [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11], '물음 열하나');
  for (const [k, row] of Object.entries(TALK_Q)) {
    assert.equal(row.length, 4, `${k} 물음 · 영어 물음 · 쉬운 말 · 영어 쉬운 말`);
    assert.ok(row.every(t => typeof t === 'string' && t.trim()), `${k} 빈 글`);
    assert.ok(/\?$/.test(row[0]) && /\?$/.test(row[1]), `${k} 물음은 물음표로 끝남`);
    assert.ok(!/[가-힣]/.test(row[1] + row[3]), `${k} 영어 글에 한글`);
    assert.deepEqual(screenHits(row[0] + ' ' + row[2]), [], `${k} 쓰지 않을 말`);
    assert.ok(!/오를 것|내릴 것|사세요|파세요|추천|매수|매도|will rise|will fall/i.test(row.join(' ')), `${k} 앞날 · 사고팔기 말`);
  }
  assert.deepEqual(TALK_A, {on: ['네', 'Yes'], off: ['아니요', 'No'], q: ['몰라요', "Don't know"]});
  // 8 그림: 켜짐 = 비 · 불 켜짐 / 꺼짐 + 움직임 = 비 · 불 꺼짐 / 꺼짐 + 거의 그대로 = 해 / 모름 = 날씨 없음(결정표 6)
  assert.equal(sceneKind(8, 'on', {fx: {moved: true}}), 'on');
  assert.equal(sceneKind(8, 'off', {fx: {moved: false}, rate: {moved: true}}), 'rain');
  assert.equal(sceneKind(8, 'off', {fx: {moved: false}, rate: {moved: false}}), 'sun');
  assert.equal(sceneKind(8, 'q', null), 'q');
  for (const st of ['on', 'off', 'q']) assert.equal(sceneKind(9, st, {}), st);
  for (const k of [1, 2, 3, 4, 5, 6, 7, 10, 11]) assert.equal(sceneKind(k, 'on', {}), null, `${k} 그림 없음(8 · 9 만)`);
  // 화면 글은 textContent 로만 · 그림은 글자 없는 선 그림(svg text 0) · 칸 글(따옴표 안)에 쓰지 않을 말 · 앞날 · 사고팔기 말 0
  const part = read('site/next/home-talk.js');
  assert.ok(part.length > 1000 && !/innerHTML|insertAdjacentHTML|sv\('text'|\.style\.cssText|setAttribute\('style'/.test(part), '말하는 불빛 칸이 글 그림 · 글 속 style 을 씀');
  const strs = [...quoted(part)];
  assert.deepEqual(strs.flatMap(x => screenHits(x)), [], '말하는 불빛 칸 글에 쓰지 않을 말');
  assert.ok(!strs.some(x => /오를 것|내릴 것|사세요|파세요|추천|매수|매도/.test(x)), '말하는 불빛 칸 글에 앞날 · 사고팔기 말');
  // 늦게 받기(첫 화면 가장 큰 그림 2.5초 길에서 뺌 — 2026-10-30 느린 4G 2413ms → 2575ms 를 막음): 칸을 열 때만 import · 첫 화면 파일 목록에 없음
  const src = read('site/next/home-new.js'), html = read('site/next/index.html'), tcss = read('site/next/home-talk.css'), ncss = read('site/next/home-new.css');
  assert.match(src, /import\('\.\/home-talk\.js'\)/, 'home-new.js 가 칸을 열 때 home-talk.js 를 부르지 않음');
  assert.doesNotMatch(src, /^import [^\n]*home-talk/m, 'home-new.js 가 home-talk.js 를 처음부터 부름(첫 화면 길이 무거워짐)');
  assert.doesNotMatch(html, /home-talk/, 'index.html 이 home-talk 를 처음부터 받음');
  assert.doesNotMatch(ncss, /\.y11-(bd|bub|lamp|scn|sky)\b/, 'home-new.css 에 말하는 불빛 칸 모양이 남음(첫 화면 길이 무거워짐)');
  const [top, night] = tcss.split('/* ── 밤 무대 판(아래는 scripts/atlas11/next/clock_theme.py 가 지음 · 손으로 고치지 않음) ── */');
  assert.ok(top && night && /html\.white\.clock\.clock\.clock\.clock\.home #view \.y11-bub \{/.test(night), 'home-talk.css 에 밤 무대 색 규칙이 없음(clock_theme.py 를 다시 돌림)');
  assert.doesNotMatch(tcss, /box-shadow|text-shadow|gradient\(|drop-shadow|blur\(/, '말하는 불빛 칸에 그림자 · 그러데이션');
});
