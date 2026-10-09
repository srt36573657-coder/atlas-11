/* ATLAS · 첫 화면 맨 위 「친구에게 ATLAS 소개하기」 띠 + 소개 영상 창(공주님 36초)
   사장님 2026-10-09 19:54(중국 시각) 「지금 만든걸 아틀란에 맨위에 넣어 친구에게 소개하기로 지혜롭게」
   · 한국 판 · 한국어 화면만 — 영상 말풍선이 한국어이고 한국 주식 365곳 이야기라서(초대장과 같음) · lang="ko"(다른 말 화면에는 그리지 않음)
   · 띠는 멈춘 그림(움직임 없음 — 규칙 28 「한 번에 하나만 움직인다」) · 첫 화면이 받는 것은 얼굴 그림 하나(약 7KB) — 영상(약 3MB)은 누를 때만 받음
   · 영상 창: 누른 뒤라 소리와 함께 바로 재생 · 「친구에게 보내기」(hello-share.js) · 「초대장 만들기 ›」 · 닫기(× · 바깥 누르기 · Esc) → 누른 자리로 초점이 돌아감
   · 넣으면서 뺀 것(규칙 1): 화면마다 맨 아래 줄 「ATLAS 초대장 보내기 ›」 → 이 창 안 「초대장 만들기 ›」(친구에게 알리는 일을 맨 위 한 곳으로) */
import {h, place} from './util.js';
import {LANG} from './i18n.js';
import {shareHello, shareSay} from './hello-share.js';

const MP4 = '/media/atlas-hello.mp4', WEBM = '/media/atlas-hello.webm', POSTER = '/media/atlas-hello.jpg', FACE = '/media/atlas-hello-face.jpg'; // 영상 두 꼴: MP4(H.264 · 휴대폰 · 카카오톡 안 브라우저) 먼저 → 못 여는 브라우저는 WebM(VP9)
const SUB = '공주님 36초 영상'; // 눌러서 본다는 뜻은 얼굴 위 ▶ 가 함 — 좁은 휴대폰(360)에서도 한 줄씩

/** 첫 화면 맨 위 띠 — 한국 판 · 한국어 화면이 아니면 null(그리지 않음) */
export function helloBar() {
  if (LANG !== 'ko' || place.id !== 'kr') return null;
  const sub = h('span', {class: 'hl-sub'}, SUB);
  let back = 0;
  const send = async () => { const t = shareSay(await shareHello()); if (!t) return; sub.textContent = t; clearTimeout(back); back = setTimeout(() => { sub.textContent = SUB; }, 6000); };
  return h('aside', {class: 'hl-bar', lang: 'ko', 'aria-label': '친구에게 ATLAS 소개하기'},
    h('button', {class: 'hl-open', type: 'button', 'aria-haspopup': 'dialog', 'aria-label': '친구에게 ATLAS 소개하기 · 공주님 36초 영상 보기', onclick: e => openHello(e.currentTarget)},
      h('span', {class: 'hl-face'}, h('img', {src: FACE, alt: '', width: '52', height: '52', decoding: 'async'}), h('span', {class: 'hl-tri', 'aria-hidden': 'true'})),
      h('span', {class: 'hl-words'}, h('b', {class: 'hl-t'}, '친구에게 소개하기'), sub)),
    h('button', {class: 'hl-send', type: 'button', 'aria-label': '소개 영상 링크를 친구에게 보내기', onclick: send}, '보내기'));
}

/** 소개 영상 창 — 하나만(이미 열려 있으면 그대로) */
export function openHello(opener = null) {
  if (document.querySelector('.hl-ov')) return;
  const vid = h('video', {class: 'hl-vid', poster: POSTER, controls: true, playsinline: true, preload: 'auto', 'aria-label': '공주님이 ATLAS를 소개하는 36초 영상'},
    h('source', {src: MP4, type: 'video/mp4'}), h('source', {src: WEBM, type: 'video/webm'}));
  const msg = h('p', {class: 'hl-msg', role: 'status'});
  const close = () => { vid.pause(); ov.remove(); document.documentElement.classList.remove('hl-lock'); document.removeEventListener('keydown', key); opener?.focus?.(); };
  const key = e => { if (e.key === 'Escape') close(); };
  const x = h('button', {class: 'hl-x', type: 'button', 'aria-label': '닫기', onclick: close}, '×');
  const ov = h('div', {class: 'hl-ov', role: 'dialog', 'aria-modal': 'true', 'aria-label': 'ATLAS 소개 영상', lang: 'ko', onclick: e => { if (e.target === ov) close(); }},
    h('div', {class: 'hl-box'}, x, vid,
      h('div', {class: 'hl-row'},
        h('button', {class: 'hl-go', type: 'button', onclick: async () => { msg.textContent = shareSay(await shareHello()); }}, '친구에게 보내기'),
        h('a', {class: 'hl-inv', href: '/invite.html'}, '초대장 만들기 ›')),
      msg));
  document.body.append(ov); document.documentElement.classList.add('hl-lock'); document.addEventListener('keydown', key);
  x.focus({preventScroll: true});
  vid.play().catch(() => {}); // 누른 뒤라 소리와 함께 재생됨(휴대폰이 막으면 가운데 ▶ 를 누르면 됨)
}
