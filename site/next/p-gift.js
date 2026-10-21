/* 상품권 방(#/gift) — 사장님 2026-10-22(서울) 03:38 「상품권 받는곳이 사용자자 이용많이 한 곳에 있어야 해 구글과 잡스라면 어떻개 하겠어 그렇게해 질문하지말고 바로 해」
   · 01:49 「… 마오는영상 1붘을 봐야 그게 정당해 그게 고지 해야고 그약솓 지켜야 상품권 받기 그때 나오게 해 그리고 정말쉽개 안내해야해 사람들에 1분 우리에게 투자하는것 서로 존중해야 잖아」 · 01:59 「맞아」
   명령문 원문 docs/design/gift-2026-10-22/order-0149.txt · order-0338.txt
   구글 = 사람들이 이미 있는 곳에서 한 번에 닿음 — 모든 쪽 위 막대의 금빛 선물 단추(app.js giftBtn) → 이 쪽 · 앱 밖(소개 쪽)으로 나가지 않고 여기서 끝냄
   잡스 = 한 쪽 · 걸음 셋(소개 → 1분 → 받기) · 지금 할 걸음 하나만 금빛 번호 · 걸음마다 단추 하나 · 꾸밈 없이 글과 가는 선
   약속을 먼저(「상품권은 우주 영상 1분을 끝까지 본 분께만」) · 본 초 = 실제로 틀어진 구간(gift-rule.js · 건너뛰기 · 빨리 감기는 셈 밖)
   끝까지 본 기기는 소개 쪽(/hello.html)과 같은 표시(atlas:gift:seen) — 어느 쪽에서 봐도 둘 다 열림 · 표시는 이 기기에만(서버로 안 감 · 처리방침에 적음)
   글은 textContent 로만 · 이름은 brand.js · 폭죽 없음 · 사고팔기 · 앞날 말 없음 · 영어는 i18n(en-src.json) */
import {t as L} from './i18n.js';
import {NAME, josa} from './brand.js';
import {GIFT, playedOf, reachOf, done, clampSeek, sayLeft} from './gift-rule.js';

const nx = () => globalThis.NX;
const h = (...a) => nx().h(...a);
const TEL = '01090117377', TEL_SHOW = '010-9011-7377';
const seenDay = () => { try { return localStorage.getItem(GIFT.key) || ''; } catch { return ''; } };
const markSeen = () => { try { localStorage.setItem(GIFT.key, new Date().toISOString().slice(0, 10)); } catch { /* 저장이 막힌 기기 — 이번에만 열림 */ } };

/** 걸음 하나 — 번호(지금 할 걸음만 금빛) · 제목 · 한 줄 · 그 밖(단추 · 영상) */
function step(n, title, line, ...rest) {
  return h('li', {class: 'gf-step', 'data-step': String(n)}, h('span', {class: 'gf-no', 'aria-hidden': 'true', text: String(n)}),
    h('div', {class: 'gf-body'}, h('h2', {class: 'gf-h2', text: title}), h('p', {class: 'gf-p', text: line}), ...rest));
}

export function render() {
  const root = h('div', {class: 'gf', 'data-page': 'gift'});
  /* ① 소개 — 소개 쪽(/hello.html · 친구가 열면 우주 · 상품권 칸까지 있음)을 보내기 글상자로 */
  const said = h('p', {class: 'gf-said', role: 'status'});
  const send = h('button', {type: 'button', class: 'gf-btn', text: '친구에게 보내기'});
  send.addEventListener('click', async () => {
    const r = await nx().shareBox({kind: 'share', title: L(josa(NAME, '를') + ' 소개합니다'), text: L(`앵무새 ${josa(NAME, '가')} 1분 동안 자기를 소개해요. 앵무새는 들은 것만 말해요 — 그래서 지난 기록만 말해요!`), url: new URL('/hello.html', location.origin).href}).catch(() => null);
    if (r?.how === 'share' || r?.how === 'copy' || r?.how === 'show') { said.textContent = L('보냈으면 보낸 화면을 찍어 두세요. 3명이 되면 다음 걸음이에요.'); if (!opened) on(2); }
  });
  /* ② 우주 영상 1분 — 기본 막대 없음(건너뛸 막대가 없게) · 큰 단추 하나로 보기 · 멈추기 */
  const v = h('video', {class: 'gf-uv', playsinline: true, preload: 'none', poster: '/media/universe-poster.jpg', width: 720, height: 1280,
    'aria-label': josa(NAME, '의') + ' 우주 1분 — 오로라 · 피터팬과 팅커벨 · 우주선 · 황룡과 청룡 · 천사 다섯 · 하얀 비숑 · 혜성과 별똥별 · 비행접시 · 앵무새 ' + NAME + ' · 하트 별자리'},
  h('source', {src: '/media/universe.mp4', type: 'video/mp4'}), h('source', {src: '/media/universe.webm', type: 'video/webm'}));
  const play = h('button', {type: 'button', class: 'gf-btn gf-play', 'aria-pressed': 'false', text: '우주 영상 보기'});
  const bar = h('progress', {class: 'gf-bar', max: String(GIFT.need), value: '0'});
  const left = h('p', {class: 'gf-left', role: 'status'});
  /* ③ 받기 — 끝까지 본 뒤에만 문자 · 전화 · 번호 */
  const lock = h('p', {class: 'gf-lock', text: '영상을 끝까지 보면 여기에 「상품권 받기」 단추가 나와요.'});
  const thx = h('p', {class: 'gf-thx'});
  const got = h('div', {class: 'gf-got', hidden: true}, thx,
    h('div', {class: 'gf-tel'}, h('a', {class: 'gf-sms', href: 'sms:' + TEL, text: '상품권 받기'}), h('a', {class: 'gf-call', href: 'tel:' + TEL, text: '전화'})),
    h('p', {class: 'gf-num'}, '문자 번호 ', h('b', {text: TEL_SHOW})));
  const steps = h('ol', {class: 'gf-steps'},
    step(1, '친구 3명에게 소개해요', `카톡으로 ${josa(NAME, '를')} 보내고, 보낸 화면을 찍어 두세요.`, send, said),
    step(2, '우주 영상 1분을 끝까지 봐요', '우주선, 용, 오로라가 나와요.', v, play, bar, left),
    step(3, '상품권 받기를 눌러요', '찍어 둔 화면을 문자로 보내 주세요.', lock, got));
  let opened = false;
  const on = n => { for (const li of steps.children) li.classList.toggle('on', li.getAttribute('data-step') === String(n)); };
  const watched = () => playedOf(v.played);
  const show = s => { bar.value = Math.min(GIFT.need, s); bar.textContent = L(sayLeft(s)); left.textContent = L(sayLeft(s)); };
  const open = first => {
    if (opened) return; opened = true;
    got.hidden = false; lock.hidden = true; show(GIFT.need); on(3);
    thx.textContent = L(first ? '끝까지 봐 주셔서 고마워요! 이제 상품권을 받을 수 있어요.' : '이 휴대폰에서 영상을 끝까지 봤어요. 상품권을 받을 수 있어요.');
    if (first) markSeen();
    globalThis.__gift = {open: true, first, watched: Math.round(watched() * 10) / 10, where: 'app'};
  };
  const label = () => { play.textContent = L(!v.paused ? '잠깐 멈추기' : v.ended ? '다시 보기' : watched() > 0 ? '이어서 보기' : '우주 영상 보기'); play.setAttribute('aria-pressed', v.paused ? 'false' : 'true'); };
  const toggle = () => {
    if (!v.paused) { v.pause(); return; }
    if (v.ended) v.currentTime = 0;
    const p = v.play(); if (p && p.catch) p.catch(() => { left.textContent = L('영상이 아직 안 열렸어요. 잠시 뒤 다시 눌러 주세요.'); });
    if (!opened) on(2);
  };
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
  if (seenDay()) open(false); else { show(0); on(1); globalThis.__gift = {open: false, where: 'app'}; }
  label();
  root.append(
    h('h1', {class: 'gf-h1', text: '상품권'}),
    h('p', {class: 'gf-lead'}, h('b', {text: '스타벅스 상품권 1만원'}), h('span', {text: '친구 3명에게 소개하고 우주 영상 1분을 보면 드려요.'})),
    h('div', {class: 'gf-vow', role: 'note'}, h('b', {text: '먼저 알려 드려요'}), h('span', {text: '상품권은 우주 영상 1분을 끝까지 본 분께만 드려요. 이 약속은 꼭 지켜요.'})),
    steps,
    h('div', {class: 'gf-pn'}, h('p', {text: '1분은 소중한 시간이에요. 내어 주셔서 고마워요.'}), h('p', {text: '3명마다 1만원씩, 여러 번 받을 수 있어요.'}), h('p', {text: '이벤트가 끝날 때는 이 자리에 먼저 알려 드려요.'})),
    h('p', {class: 'gf-fine'}, '문자를 보내면 보낸 전화번호가 운영자 휴대폰에 남아요. ', h('a', {href: '/privacy.html', text: '개인정보 처리방침 ›'})));
  return {title: '상품권', nodes: [root]};
}
