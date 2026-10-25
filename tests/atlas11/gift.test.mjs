// 상품권 앞 「우주 영상 1분」 시험(site/next/gift-rule.js · site/next/p-gift.js · site/hello.html · site/hello-gift.js · site/privacy.html · site/next/app.js)
//   사장님 2026-10-22(서울) 01:49 「… 마오는영상 1붘을 봐야 그게 정당해 그게 고지 해야고 그약솓 지켜야 상품권 받기 그때 나오게 해 그리고 정말쉽개 안내해야해
//   사람들에 1분 우리에게 투자하는것 서로 존중해야 잖아」 · 01:59 「맞아」 — docs/design/gift-2026-10-22/order-0149.txt
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {GIFT, playedOf, reachOf, done, clampSeek, sayLeft} from '../../site/next/gift-rule.js';

const read = p => fs.readFileSync(new URL('../../' + p, import.meta.url), 'utf8');

const TR = xs => ({length: xs.length, start: i => xs[i][0], end: i => xs[i][1]}); // TimeRanges 꼴

test('본 초 — 실제로 틀어진 구간의 합(겹친 곳은 한 번 · 건너뛴 곳은 빠짐)', () => {
  assert.equal(playedOf(TR([[0, 60]])), 60);
  assert.ok(Math.abs(playedOf(TR([[0, 2.3], [50, 60]])) - 12.3) < 1e-9, '2.3초 뒤 50초로 껑충');
  assert.equal(playedOf(TR([[0, 30], [20, 60]])), 60, '되감아 다시 본 곳은 한 번만');
  assert.equal(playedOf(TR([])), 0);
  assert.equal(playedOf(null), 0);
  assert.equal(reachOf(TR([[0, 12.4], [40, 60]])), 12.4, '처음부터 이어서 본 데');
  assert.equal(reachOf(TR([[0.3, 5], [5.2, 9]])), 9);
  assert.equal(reachOf(TR([])), 0);
});

test('다 봤나 — 끝났고 · 60초에서 1.5초 모자란 것까지', () => {
  assert.equal(done(60, 60, true), true);
  assert.equal(done(58.6, 60.008, true), true);
  assert.equal(done(58.4, 60, true), false);
  assert.equal(done(60, 60, false), false, '끝나지 않음');
  assert.equal(done(60, NaN, true), true, '길이를 모르면 60초');
  assert.equal(done(1, 60, true), false, '건너뛰어 끝남');
  assert.equal(GIFT.need, 60);
  assert.equal(GIFT.key, 'atlas:gift:seen');
});

test('건너뛰기 막음 · 남은 초 글(쉬운 말)', () => {
  assert.equal(clampSeek(50, 12), 12);
  assert.equal(clampSeek(12.4, 12), 12.4);
  assert.equal(clampSeek(3, 12), 3, '되감기는 됨');
  assert.equal(sayLeft(0), '아직 안 봤어요. 60초를 끝까지 봐 주세요.');
  assert.equal(sayLeft(12.7), '12초 봤어요. 48초 남았어요.');
  assert.equal(sayLeft(60), '끝까지 다 봤어요.');
});

test('소개 쪽 — 약속을 먼저 알림 · 쉬운 네 걸음 · 영상 · 「상품권 받기」는 처음에 숨김', () => {
  const h = read('site/hello.html');
  const sec = h.slice(h.indexOf('<section class="hp-promo"'), h.indexOf('</section>', h.indexOf('<section class="hp-promo"')));
  assert.match(h, /<a class="hp-pbar" href="#hp-promo">친구 3명 소개하고 1분 영상 보면 스타벅스 상품권 1만원! ›<\/a>/);
  assert.doesNotMatch(h, /3명만 소개해도/, '영상 조건을 숨기는 옛 말');
  assert.match(sec, /<p class="hp-vow"><b>먼저 알려 드려요<\/b>상품권은 우주 영상 1분을 끝까지 본 분께만 드려요\./);
  assert.equal((sec.match(/<li>/g) ?? []).length, 4, '걸음 넷');
  assert.match(sec, /<video class="hp-uv" id="hp-uv" playsinline preload="none" poster="\/media\/universe-poster\.jpg"/);
  assert.doesNotMatch(sec.slice(sec.indexOf('<video'), sec.indexOf('</video>')), /\bcontrols\b|\bautoplay\b|\bloop\b/, '건너뛸 막대 · 저절로 · 되풀이 없음');
  assert.match(sec, /<source src="\/media\/universe\.mp4" type="video\/mp4">\s*<source src="\/media\/universe\.webm" type="video\/webm">/);
  const got = sec.slice(sec.indexOf('<div class="hp-got"'), sec.indexOf('<p class="hp-pn">'));
  assert.match(got, /^<div class="hp-got" id="hp-got" hidden>/, '「상품권 받기」 칸은 처음에 숨김');
  // 2026-10-25 13:40 「편지를 보내지 않아도 … 카톡 친구 세 명으로 세 명을 보냈다 라는 걸 알 수 있게끔」 · 13:38 「내가 직접 보낼 거야」 — 화면 찍어 문자 보내기 대신 상품권 방(#/gift)에서 전화번호를 적음
  assert.match(got, /<a class="hp-sms" href="\/#\/gift">상품권 받기<\/a>/);
  assert.ok(!/sms:|tel:|010-9011-7377/.test(sec), '문자 · 전화 · 번호 없음(친구 수는 사이트가 셈)');
  assert.match(sec, /<li>「상품권 받기」를 누르고 전화번호를 적어 주세요\.<\/li>/);
  assert.match(sec, /1분은 소중한 시간이에요\. 내어 주셔서 고마워요\./);
  assert.match(h, /<script type="module" src="\/hello-gift\.js"><\/script>/);
  for (const f of ['site/media/universe.mp4', 'site/media/universe.webm', 'site/media/universe-poster.jpg']) assert.ok(fs.statSync(new URL('../../' + f, import.meta.url)).size > 1000, f);
});

test('쪽 규칙 — 글 안 꾸밈 · innerHTML 없음 · 처리방침에 저장 열쇠 · 편지 상품권 줄도 같은 약속', () => {
  const js = read('site/hello-gift.js');
  assert.doesNotMatch(js, /innerHTML|\.style\.|setAttribute\('style'|insertAdjacentHTML|document\.write/);
  assert.match(js, /from '\/next\/gift-rule\.js'/);
  assert.match(read('site/privacy.html'), /<code>atlas:gift:seen<\/code>/);
  assert.match(read('site/next/app.js'), /const HELLO_PROMO = '3명 소개하고 1분 영상 보면 스타벅스 상품권 1만원!';/);
  const css = read('site/hello-promo.css');
  for (const m of css.matchAll(/font-size:\s*([\d.]+)rem/g)) assert.ok(['1.0625', '1.1875', '1.3125', '1.5', '1.875'].includes(m[1]), '글씨 크기 ' + m[1]);
});

test('앱 안 상품권 방(#/gift) — 모든 쪽 위 막대 금빛 선물 단추 · 걸음 셋 · 같은 셈 · 쪽 규칙(사장님 2026-10-22 03:38 · order-0338)', async () => {
  const app = read('site/next/app.js'), js = read('site/next/p-gift.js');
  assert.match(app, /VIEWS\.gift = a => page\('gift', a\);/);
  assert.match(app, /gift: 'why-q1'\}/, '돌 그림');
  assert.match(app, /const giftBtn = h\('a', \{class: 'ibtn tgift', id: 'giftBtn', href: '#\/gift'/, '위 막대 고리');
  assert.match(app, /jhBtn\.after\(giftBtn\);/, '진화 단추 옆 · 모든 쪽');
  assert.match(app, /if \(k === 'gift'\) giftBtn\.setAttribute\('aria-current', 'page'\);/);
  assert.doesNotMatch(app, /w-gift|w-acts/, '첫 화면 글 칸은 그대로(테마 시계 자리 · 글자 잣대)');
  assert.match(js, /from '\.\/gift-rule\.js'/);
  assert.doesNotMatch(js, /innerHTML|\.style\.|setAttribute\('style'|insertAdjacentHTML|document\.write|controls/);
  assert.match(js, /상품권은 우주 영상 1분을 끝까지 본 분께만 드려요\. 이 약속은 꼭 지켜요\./);
  assert.equal((js.match(/step\(\d, /g) ?? []).length, 3, '걸음 셋');
  assert.match(js, /const got = h\('div', \{class: 'gf-got', hidden: true\}/, '받기 칸은 처음에 숨김');
  // 2026-10-25 13:40 「편지를 보내지 않아도 … 카톡 친구 세 명으로 세 명을 보냈다 라는 걸 알 수 있게끔」 — 문자 고리 대신 받기 칸 안 전화번호 한 칸 + 동의 · 친구 수는 서버(gift-ref.js)
  assert.doesNotMatch(js, /sms:|tel:|TEL_SHOW/, '문자 · 전화 고리 없음');
  assert.ok(js.indexOf("const got = h('div'") > js.indexOf("const tel = h('input'"), '전화번호 칸은 받기 칸 안에만');
  assert.match(js, /import \{ref, withRef, me, claim, PER\} from '\.\/gift-ref\.js';/);
  assert.match(js, /상품권을 보내려고 이 번호를 사장님께만 보여 드려요\. 보내면 바로 지워요\. 동의해요\./, '동의 글');
  assert.doesNotMatch(js.replace(/^\/\*[\s\S]*?\*\//, ''), /'돌이/, '이름은 brand.js');
  const {cssRules} = await import('../../scripts/atlas11/next/page_rules.mjs');
  assert.deepEqual(cssRules('site/next/p-gift.css'), []);
});

test('하얀 비숑(사장님 방 2026-10-22 03:58 「비숑도 넣어주세요🤍」 · order-0358) — 그림 · 하늘 · 우주 영상', () => {
  const svg = read('site/media/bichon.svg'), fly = read('site/next/sky-fly.js'), film = read('scripts/atlas11/universe/film.mjs');
  assert.match(svg, /<svg xmlns="http:\/\/www\.w3\.org\/2000\/svg" viewBox="0 0 160 112"/);
  assert.doesNotMatch(svg, /<script|<foreignObject|href="http|xlink:href="http/, '그림 파일은 그림만');
  assert.match(fly, /function bichon\(t, dir, o = \{\}\)/);
  assert.match(fly, /kind === 'bichon' \? bichon\(now, dir, p\)/, '부르는 이름');
  assert.match(fly, /const ALT = \['angels', 'dragon', 'bichon'\]\[Math\.floor\(Math\.random\(\) \* 3\)\];/, '첫 화면 2번 자리 — 셋 가운데 하나');
  assert.match(fly, /const GENTLE = \['peter', 'angels', 'parrot', 'dragon', 'bichon'\];/, '다른 쪽 하늘 차례');
  assert.match(fly, /whites = heartPool\(14, true\)/, '하얀 하트');
  assert.match(film, /\{at: 33\.5, kind: 'bichon', dur: 9500, cap: '하얀 비숑이 구름처럼 날아요'/, '우주 영상 장면');
  for (const p of ['site/hello.html', 'site/next/p-gift.js']) assert.match(read(p), /천사 다섯 · 하얀 비숑 · 혜성과 별똥별/, p + ' 영상 설명');
});
