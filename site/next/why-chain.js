/* 「왜 그럴까?」 열한 걸음 — 한 사실이 다음 물음을 부르는 이어 말하기 · 움직이는 그림
   사장님 2026-10-22(서울) 08:53 「그리고 왜 그럴까를 뻔한 이야기로 하고 있어 … 원숭이 엉덩이는 빨개 빨가면 사과 사과는 맛있어 맛있으면 바나나 바나나는 길어
   이런 식으로 11단계는 논리적으로 사방팔방으로 이야기 해야지 그 이야기를 움직이는 도식화로 해야 하고」(명령문 docs/design/total-2026-10-22/order-0853.txt)
   쓰는 곳: 첫 화면 시황 사실 「왜 그럴까?」(app.js newsBox) · 테마 시계 회사 15쪽 「왜 그럴까?」(p-theme.js) — 자료를 고르는 셈은 그 쪽이 하고 여기는 그리기만
   걸음 = {q 이어 묻는 말(첫 걸음은 없음), a 지난 사실 한 줄(못 받으면 「? …」), tag 갈래(돈 · 업종 · 미국 · 지난날 · 싹 · 나 …), href 누르면 갈 곳(없어도 됨)}
   그림 둘: ① 위 — 걸음 번호 열한 개가 가운데에서 사방팔방으로 흩어진 별자리 · 이어 묻는 차례대로 선이 그려지며 번호가 하나씩 켜짐(0.7초씩)
            ② 아래 — 같은 번호의 글 줄(물음 금빛 작은 글 → 사실 굵은 글 → 갈래) · 글 시작은 한 줄로 맞춤(글 시작 왼쪽 줄 셋 · 별자리 속 글은 셈 밖)
   「다시 보기」 · 움직임 줄이기 기기는 처음부터 다 보임 · 앞날 · 사고팔기 권함 없음 — 물음과 지난 사실만(앵무새는 들은 것만)
   글은 textContent · 모양은 why-chain.css(이 파일이 처음 쓸 때 한 번 붙임 — 같은 곳 파일이라 보안 규칙 안) · CSSOM 은 --i · --len 만 */
import {t as L} from './i18n.js';

const nx = () => globalThis.NX;
const h = (...a) => nx().h(...a);
const sv = (...a) => nx().sv(...a);
export const STEPS = 11;
/** 별자리 자리(340 × 236) — 1 은 가운데 · 그다음은 동북 → 서남 → 북 → 동남 → 서북 → 동 → 남 → 서 → 먼 동 → 남쪽 가운데(한 방향으로 흐르지 않게 · 두 점 사이 60 넘게) */
export const PTS = Object.freeze([[160, 115], [268, 50], [52, 178], [160, 30], [272, 182], [48, 58], [222, 118], [104, 206], [98, 118], [296, 118], [178, 204]]);

let cssOn = false;
function css() {
  if (cssOn || typeof document === 'undefined') return; cssOn = true;
  if (document.querySelector('link[href="/next/why-chain.css"]')) return;
  document.head.append(h('link', {rel: 'stylesheet', href: '/next/why-chain.css'}));
}

/** 걸음 고르기 — 꼴이 틀린 걸음은 빼고 많아야 STEPS 개 · 첫 걸음은 물음 없이 · 고리는 사이트 안(#/ · /)만 */
export function cleanSteps(steps) {
  return (Array.isArray(steps) ? steps : []).filter(s => s && typeof s.a === 'string' && s.a.trim()).slice(0, STEPS)
    .map((s, i) => ({q: i && typeof s.q === 'string' ? s.q.trim() : '', a: s.a.trim(), tag: typeof s.tag === 'string' ? s.tag.trim() : '', href: typeof s.href === 'string' && /^(#\/|\/(?!\/))/.test(s.href) ? s.href : ''}));
}

/** 별자리 — 선(i 번째는 i → i+1) · 점(번호) · 모두 aria-hidden(글은 아래 줄이 맡음) */
function sky(n) {
  const s = sv('svg', {class: 'wc-sky', viewBox: '0 0 340 236', 'aria-hidden': 'true', focusable: 'false'});
  for (let i = 1; i < n; i++) {
    const [x1, y1] = PTS[i - 1], [x2, y2] = PTS[i], len = Math.ceil(Math.hypot(x2 - x1, y2 - y1));
    const ln = sv('line', {class: 'wc-ln', x1, y1, x2, y2});
    ln.style.setProperty('--i', String(i)); ln.style.setProperty('--len', String(len));
    s.append(ln);
  }
  for (let i = 0; i < n; i++) {
    const [x, y] = PTS[i], g = sv('g', {class: 'wc-dot', transform: `translate(${x} ${y})`});
    g.style.setProperty('--i', String(i));
    g.append(sv('circle', {r: 15}), Object.assign(sv('text', {'text-anchor': 'middle', dy: '0.35em'}), {textContent: String(i + 1)}));
    s.append(g);
  }
  return s;
}

/** 그림 한 장 — {title 칸 머리(없어도 됨)} · 돌려주는 것 = section.wc · 펼칠 때 el.play() 를 부르면 처음부터 움직임 */
export function whyChain(steps, {title = ''} = {}) {
  css();
  const S = cleanSteps(steps);
  const root = h('section', {class: 'wc', 'aria-label': L('왜 그럴까 — 이어 묻기')});
  if (title) root.append(h('p', {class: 'wc-h', text: title}));
  root.append(h('p', {class: 'wc-lead', text: L('한 사실이 다음 물음을 불러요.')}), sky(S.length));
  const ol = h('ol', {class: 'wc-steps'});
  S.forEach((s, i) => {
    const body = [s.q ? h('span', {class: 'wc-q', text: s.q}) : null, h('b', {class: 'wc-a', text: s.a}), s.tag ? h('span', {class: 'wc-tag', text: s.tag}) : null].filter(Boolean);
    const card = s.href ? h('a', {class: 'wc-card', href: s.href}, ...body, h('span', {class: 'wc-go', 'aria-hidden': 'true', text: '›'})) : h('div', {class: 'wc-card'}, ...body);
    const li = h('li', {class: 'wc-n', 'data-k': String(i + 1)}, h('span', {class: 'wc-no', 'aria-hidden': 'true', text: String(i + 1)}), card);
    li.style.setProperty('--i', String(i));
    ol.append(li);
  });
  const again = h('button', {type: 'button', class: 'wc-again', text: L('다시 보기')});
  root.append(ol, again);
  const play = () => { root.classList.remove('play'); void root.offsetWidth; root.classList.add('play'); }; // 다시 붙여 처음부터
  again.addEventListener('click', play);
  root.play = play;
  return root;
}
