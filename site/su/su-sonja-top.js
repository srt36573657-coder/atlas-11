/* 손자병법 첫 쪽 머리 줄 · 표지(주문 1115-1706 · 빈 파일에서 새로 씀 · 짝 = 본문 su-sonja.js · 꾸밈 su-sonja.css)
   자료와 본문 코드를 기다리지 않고 먼저 칠함 — 느린 휴대폰(느린 4G · 처리 4배 느림)에서 가장 큰 그림(표지)이 먼저 보이게
   처음 열 때는 index.html 이 같은 머리 줄 · 표지를 글로 들고 있어 자바스크립트보다 먼저 보임(주문 1115-1836 「지금보다 속도 3배 빠르게」) — sonjaShell 이 그것을 그대로 이어 씀
   (index.html 의 글을 고치면 여기 topBar · cover 도 같이 고침 — 다른 쪽에서 첫 쪽으로 돌아올 때는 여기서 새로 그림)
   본문(형세 보고 → … → 끝 줄 · 이야기 막대 · 탭)은 su-sonja.js 가 자료를 받은 뒤 같은 main 뒤에 붙임(표지는 다시 그리지 않음)
   보안 규칙: innerHTML 없음 · 글 속 style 없음 · 다른 주소 스크립트 없음 */
import {h} from '/su/su-fig.js';
import {NAME} from '/next/brand.js';

export const ART = '/su/su-sonja-hero.svg';

/** 「글씨」 단추 — 누르면 한 단 크게(html.su-lg · 다음에 열어도 그대로) */
function bigText(big) {
  if (!big) return null;
  big.setAttribute('aria-pressed', String(document.documentElement.classList.contains('su-lg')));
  big.addEventListener('click', () => { const on = document.documentElement.classList.toggle('su-lg'); big.setAttribute('aria-pressed', String(on)); try { localStorage.setItem('su-big-text', on ? '1' : '0'); } catch { /* 저장 못 해도 됨 */ } });
  return big;
}
/** 머리 줄 — 띄어 쓴 명조 이름 · 먹 테 네모 단추 넷(천사 · 찾기 · 선물 · 글씨) */
export function topBar() {
  const big = bigText(h('button', {class: 'sj-btn sj-bigtext', type: 'button', 'aria-label': '글씨 크게', text: '글씨'}));
  return h('header', {class: 'sj-top'},
    h('a', {class: 'sj-brand', href: '#/', 'aria-label': NAME + ' 첫 쪽', text: NAME}),
    h('div', {class: 'sj-tools'},
      h('a', {class: 'sj-btn sj-angel', href: 'https://shin-yxy.gino.im/', target: '_blank', rel: 'noopener', 'aria-label': '천사 바로가기 · 새 창'}, h('b', {text: '천사'}), h('i', {'aria-hidden': 'true', text: '↗'})),
      h('a', {class: 'sj-btn sj-find', href: '/next/?su=guide#/find', 'aria-label': '종목 찾기', text: '찾기'}),
      h('a', {id: 'giftBtn', class: 'sj-btn sj-gift', href: '#/gift', 'aria-label': '선물 받기 · 상품권', text: '선물'}),
      big));
}

/** 표지 — 큰 붓 글씨 그림 한 장 · 걸음 「기 · 1 / 8 · 오늘」(dd = 「11월 13일」 같은 자료 날 · 없으면 뒤에 붙임) */
export function cover(dd = null) {
  return h('section', {class: 'sj-cover', 'aria-label': NAME + ' 표지'},
    h('img', {class: 'sj-art', src: ART, width: '390', height: '470', alt: '붓 글씨 「' + NAME + '」 · 불장 · 꽃이 될 · 돈이 몰리는 곳을 찾아요', decoding: 'async', fetchpriority: 'high'}),
    h('p', {class: 'sj-step', 'aria-label': '1 / 8 · 오늘'}, h('b', {text: '기'}), h('span', {text: '1 / 8 · 오늘'}), dd ? stepDay(dd) : null));
}
/** 걸음 줄 끝의 자료 날 */
export const stepDay = dd => h('span', {class: 'sj-stepd', text: dd + ' 자료'});

/** 먼저 칠하는 판 — 머리 줄과 표지만 든 main(data-wait — 본문을 다 붙이고 채우면 뗌 · 검사가 기다림)
 *  root 에 index.html 이 든 판(.sj-pre)이 있으면 그것을 그대로 씀(pre = true · 다시 그리지 않음 — 첫 칠함 그대로) */
export function sonjaShell(root = null) {
  const top = root?.querySelector(':scope > header.sj-top.sj-pre'), main = root?.querySelector(':scope > main.sj-page.sj-pre');
  if (top && main && main.querySelector(':scope > .sj-cover img.sj-art')) {
    top.classList.remove('sj-pre'); main.classList.remove('sj-pre'); main.setAttribute('data-wait', '');
    bigText(top.querySelector('button.sj-bigtext'));
    return {top, main, pre: true};
  }
  return {top: topBar(), main: h('main', {class: 'sj-page', 'data-page': 'sonja', 'data-wait': ''}, cover(null)), pre: false};
}
