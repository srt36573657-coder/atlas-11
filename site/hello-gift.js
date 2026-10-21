/* 소개 한 장(hello.html) 상품권 칸 — 「우주 영상 1분」을 끝까지 보면 그때 「상품권 받기」가 나옴
   사장님 2026-10-22(서울) 01:49 「… 마오는영상 1붘을 봐야 그게 정당해 그게 고지 해야고 그약솓 지켜야 상품권 받기 그때 나오게 해 그리고 정말쉽개 안내해야해
   사람들에 1분 우리에게 투자하는것 서로 존중해야 잖아」 · 01:59 「맞아」(친구 3명 소개 스타벅스 상품권) — 명령문 원문 docs/design/gift-2026-10-22/order-0149.txt
   · 영상 = /media/universe.mp4 · webm(사이트 하늘 그대로 · scripts/atlas11/universe/film.mjs) · 휴대폰 기본 막대(controls)는 두지 않음 — 건너뛸 막대가 없게, 큰 단추 하나로 보기 · 멈추기
   · 본 초 = 브라우저가 적는 실제로 틀어진 구간(video.played) — 셈은 /gift-rule.js(시험 tests/atlas11/gift.test.mjs · 진짜 1분 검사 scripts/atlas11/next/check_gift.mjs)
   · 끝까지 본 기기는 이 기기에만 날짜 한 줄(GIFT.key) — 다시 와도 또 보지 않음 · 글 · 단추 · 칸 꾸밈은 /hello-promo.css(쪽 보안 규칙 style-src 'self')*/
import {t as L} from '/next/i18n.js';
import {GIFT, playedOf, reachOf, done, clampSeek, sayLeft} from '/gift-rule.js';

const $ = id => document.getElementById(id);
const v = $('hp-uv'), play = $('hp-uplay'), bar = $('hp-ubar'), left = $('hp-uleft'), lock = $('hp-lock'), got = $('hp-got'), thx = $('hp-thx');
const seenDay = () => { try { return localStorage.getItem(GIFT.key) || ''; } catch { return ''; } };
let opened = false;
const watched = () => playedOf(v.played);

function show(s) { bar.value = Math.min(GIFT.need, s); bar.textContent = L(sayLeft(s)); left.textContent = L(sayLeft(s)); }
function open(first) {
  if (opened) return; opened = true;
  got.hidden = false; lock.hidden = true; show(GIFT.need);
  thx.textContent = L(first ? '끝까지 봐 주셔서 고마워요! 이제 상품권을 받을 수 있어요.' : '이 휴대폰에서 영상을 끝까지 봤어요. 상품권을 받을 수 있어요.');
  if (first) { try { localStorage.setItem(GIFT.key, new Date().toISOString().slice(0, 10)); } catch { /* 저장이 막힌 기기 — 이번 방문에서만 열림 */ } }
  window.__gift = {open: true, first, watched: Math.round(watched() * 10) / 10};
}
const label = () => { play.textContent = L(!v.paused ? '잠깐 멈추기' : v.ended ? '다시 보기' : watched() > 0 ? '이어서 보기' : '우주 영상 보기'); play.setAttribute('aria-pressed', v.paused ? 'false' : 'true'); };
function toggle() {
  if (!v.paused) { v.pause(); return; }
  if (v.ended) v.currentTime = 0;
  const p = v.play(); if (p && p.catch) p.catch(() => { left.textContent = L('영상이 아직 안 열렸어요. 잠시 뒤 다시 눌러 주세요.'); });
}

if (v && play && bar && left && lock && got && thx) {
  if (seenDay()) open(false);
  else show(0);
  play.addEventListener('click', toggle);
  v.addEventListener('click', toggle); // 그림을 눌러도 보기 · 멈추기
  v.addEventListener('play', label); v.addEventListener('pause', label);
  v.addEventListener('timeupdate', () => { if (!opened) show(watched()); });
  v.addEventListener('seeking', () => { const to = clampSeek(v.currentTime, reachOf(v.played)); if (to !== v.currentTime) v.currentTime = to; }); // 앞으로 건너뛰기 막음(되감기는 됨)
  v.addEventListener('ratechange', () => { if (v.playbackRate !== 1) v.playbackRate = 1; }); // 빨리 감기 막음
  v.addEventListener('ended', () => {
    label();
    if (done(watched(), v.duration, true)) open(true);
    else if (!opened) { left.textContent = L('건너뛴 곳이 있어요. 처음부터 다시 봐 주세요.'); v.currentTime = 0; }
  });
  v.addEventListener('error', () => { left.textContent = L('영상이 아직 안 열렸어요. 잠시 뒤 다시 눌러 주세요.'); }, true);
  label();
  window.__gift = window.__gift ?? {open: false};
}
