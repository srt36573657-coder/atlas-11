// 상품권 앞 「우주 영상 1분」 시험(site/gift-rule.js · site/hello.html · site/hello-gift.js · site/privacy.html · site/next/app.js)
//   사장님 2026-10-22(서울) 01:49 「… 마오는영상 1붘을 봐야 그게 정당해 그게 고지 해야고 그약솓 지켜야 상품권 받기 그때 나오게 해 그리고 정말쉽개 안내해야해
//   사람들에 1분 우리에게 투자하는것 서로 존중해야 잖아」 · 01:59 「맞아」 — docs/design/gift-2026-10-22/order-0149.txt
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {GIFT, playedOf, reachOf, done, clampSeek, sayLeft} from '../../site/gift-rule.js';

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
  assert.match(got, /<a class="hp-sms" href="sms:01090117377">상품권 받기<\/a>/);
  assert.match(got, /010-9011-7377/);
  assert.ok(sec.indexOf('sms:') > sec.indexOf('<div class="hp-got"') && sec.indexOf('tel:') > sec.indexOf('<div class="hp-got"'), '문자 · 전화는 열린 칸 안에만');
  assert.ok(!/010-9011-7377/.test(sec.slice(0, sec.indexOf('<div class="hp-got"'))), '번호는 다 본 뒤에만');
  assert.match(sec, /1분은 소중한 시간이에요\. 내어 주셔서 고마워요\./);
  assert.match(h, /<script type="module" src="\/hello-gift\.js"><\/script>/);
  for (const f of ['site/media/universe.mp4', 'site/media/universe.webm', 'site/media/universe-poster.jpg']) assert.ok(fs.statSync(new URL('../../' + f, import.meta.url)).size > 1000, f);
});

test('쪽 규칙 — 글 안 꾸밈 · innerHTML 없음 · 처리방침에 저장 열쇠 · 편지 상품권 줄도 같은 약속', () => {
  const js = read('site/hello-gift.js');
  assert.doesNotMatch(js, /innerHTML|\.style\.|setAttribute\('style'|insertAdjacentHTML|document\.write/);
  assert.match(js, /from '\/gift-rule\.js'/);
  assert.match(read('site/privacy.html'), /<code>atlas:gift:seen<\/code>/);
  assert.match(read('site/next/app.js'), /const HELLO_PROMO = '3명 소개하고 1분 영상 보면 스타벅스 상품권 1만원!';/);
  const css = read('site/hello-promo.css');
  for (const m of css.matchAll(/font-size:\s*([\d.]+)rem/g)) assert.ok(['1.0625', '1.1875', '1.3125', '1.5', '1.875'].includes(m[1]), '글씨 크기 ' + m[1]);
});
