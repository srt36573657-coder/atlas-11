/* 수르 — 아름다움(빈 파일에서 새로 씀 · 주문 1833)
   사장님 2026-11-04 13:33(+04) [아름다움] 「1. 알폰스 무하의 그림처럼 아름답게 해라 2. 부드러운 곡선 테두리와 꽃 장식을 써라
   3. 색은 은은한 금빛·연두·살구빛으로 맞춰라 4. 화면 한 장 한 장을 포스터처럼 완성해라 5. 장식이 값과 글을 가리지 않게 해라
   6. 아름다움과 읽기 쉬움을 함께 지켜라」(원문 docs/design/su-art-2026-11-04/order-1833.txt)
   ① 후광 꽃 — 큰 값 옆 금빛 고리 · 빛살 · 여섯 칸 꽃잎(찬 잎 = 채운 칸 · 점선 잎 = 「확인 필요」)(시안 1 · 9)
   ② 어깨 덩굴 — 큰 그림 아치 틀 두 어깨에 덩굴 · 잎 · 꽃망울(시안 6)
   ③ 꽃 띠 — 맨 아래 출처 바로 위(시안 7 · 8)
   ④ 네 모서리 꽃 — 화면 네 귀퉁이(시안 2)
   장식은 모두 aria-hidden · 누를 수 없음 · 네 박자 안에 한 번 그려짐 · 움직임 줄이기면 끝 모습(su-art.css)
   ⑤ 지킴이 — 장식 상자가 글자와 1px² 라도 겹치면 그 장식만 숨김(시안 8) · 그림 그대로 그린 장식이라 지어낸 숫자 없음 */
const NS = 'http://www.w3.org/2000/svg';
const sv = (tag, a = {}, ...kids) => {
  const e = document.createElementNS(NS, tag);
  for (const [k, v] of Object.entries(a)) if (v != null) e.setAttribute(k, String(v));
  for (const k of kids.flat(3)) if (k) e.append(k);
  return e;
};
const KEYS = ['누가', '언제', '어디서', '무엇을', '어떻게', '왜'];
const deco = (cls, vb) => ({class: 'su-orn ' + cls, viewBox: vb, 'aria-hidden': 'true', focusable: 'false'});
const f1 = x => x.toFixed(1);

/** ① 후광 꽃 — 큰 값 옆(값 줄 안의 한 칸 · 글을 덮지 않음) · 여섯 칸을 꽃잎으로 */
export function halo(six, label = '큰 값을 센 길') {
  const full = KEYS.map(k => !!six?.[k]), need = full.filter(f => !f).length;
  const rays = Array.from({length: 16}, (_, i) => { const a = i * Math.PI / 8;
    return sv('line', {x1: f1(36 + 29.5 * Math.cos(a)), y1: f1(36 + 29.5 * Math.sin(a)), x2: f1(36 + 33 * Math.cos(a)), y2: f1(36 + 33 * Math.sin(a)), class: 'o-ray art-fade art-b2'}); });
  return sv('svg', {class: 'su-halo', viewBox: '0 0 72 72', role: 'img', 'aria-label': label + ' · ' + (need ? '확인 필요 ' + need + '칸' : '다 채움')},
    sv('circle', {cx: 36, cy: 36, r: 34, pathLength: 1, class: 'o-ring art-draw art-b1'}),
    rays,
    sv('circle', {cx: 36, cy: 36, r: 26.5, pathLength: 1, class: 'o-ring2 art-draw art-b2'}),
    full.map((f, i) => sv('g', {transform: 'rotate(' + i * 60 + ' 36 36)'}, sv('ellipse', {cx: 36, cy: 23, rx: 6.2, ry: 10.2, class: (f ? 'o-pet' : 'o-pet-need') + ' art-pop art-b3'}))),
    sv('circle', {cx: 36, cy: 36, r: 4.6, class: 'o-core art-pop art-b4'}));
}

/** ② 어깨 덩굴 — 채찍처럼 휜 줄기 · 연두 잎 둘 · 살구 꽃망울 */
function sprig(right) {
  return sv('svg', deco('su-sprig' + (right ? ' su-sprig-r' : ''), '0 0 48 30'),
    sv('g', right ? {transform: 'translate(48 0) scale(-1 1)'} : {},
      sv('path', {d: 'M2 27 C 12 27, 13 12, 24 10 S 39 15, 44 6', pathLength: 1, class: 'o-vine art-draw art-b1'}),
      sv('path', {d: 'M13 19 q 4 -9 11 -8 q -3 8 -11 8 z', class: 'o-leaf art-pop art-b2'}),
      sv('path', {d: 'M30 13 q 1 8 9 10 q 1 -8 -9 -10 z', class: 'o-leaf art-pop art-b3'}),
      sv('circle', {cx: 44.5, cy: 6, r: 3.6, class: 'o-bud art-pop art-b4'})));
}

/** ③ 꽃 띠 — 가운데 다섯 잎 꽃 · 양옆 덩굴과 잎 */
function band() {
  const pet = r => sv('g', {transform: 'rotate(' + r + ' 120 14)'}, sv('ellipse', {cx: 120, cy: 7.4, rx: 3.6, ry: 6, class: 'o-pet art-pop art-b4'}));
  return sv('svg', deco('su-band', '0 0 240 28'),
    sv('path', {d: 'M8 14 C 40 14, 52 5, 84 10 S 104 14, 109 14', pathLength: 1, class: 'o-vine art-draw art-b1'}),
    sv('path', {d: 'M232 14 C 200 14, 188 5, 156 10 S 136 14, 131 14', pathLength: 1, class: 'o-vine art-draw art-b1'}),
    sv('path', {d: 'M58 9 q 6 -7 13 -4 q -6 6 -13 4 z', class: 'o-leaf art-pop art-b2'}),
    sv('path', {d: 'M182 9 q -6 -7 -13 -4 q 6 6 13 4 z', class: 'o-leaf art-pop art-b2'}),
    sv('circle', {cx: 30, cy: 14, r: 2.4, class: 'o-bud art-pop art-b3'}), sv('circle', {cx: 210, cy: 14, r: 2.4, class: 'o-bud art-pop art-b3'}),
    [0, 72, 144, 216, 288].map(pet), sv('circle', {cx: 120, cy: 14, r: 2.8, class: 'o-core art-pop art-b4'}));
}

/** ④ 모서리 꽃 — 네 잎 · 금빛 꽃술(화면 귀퉁이 13px · 글 자리 밖) */
function corner(at) {
  return sv('svg', deco('su-corner su-c-' + at, '0 0 14 14'),
    [0, 90, 180, 270].map(r => sv('g', {transform: 'rotate(' + r + ' 7 7)'}, sv('ellipse', {cx: 7, cy: 3.7, rx: 2.3, ry: 3.4, class: 'o-pet art-pop art-b4'}))),
    sv('circle', {cx: 7, cy: 7, r: 1.7, class: 'o-core'}));
}

/** 쪽 하나를 꾸밈 — 그린 뒤 부름(다시 그려도 한 벌만) */
export function dress(root) {
  const main = root?.querySelector('main'); if (!main) return;
  for (const e of root.querySelectorAll('.su-orn, .su-corners')) e.remove();
  const hero = main.querySelector('.su-hero');
  if (hero) hero.append(sprig(false), sprig(true));
  const src = main.querySelector(':scope > .su-src');
  if (src) src.before(band());
  const cs = document.createElement('div'); cs.className = 'su-corners'; cs.setAttribute('aria-hidden', 'true');
  cs.append(corner('tl'), corner('tr'), corner('bl'), corner('br'));
  root.append(cs);
  guard(root);
}

/** ⑤ 지킴이 — 장식 상자와 글자 상자가 겹치면 그 장식만 숨김(글이 늘 이김) */
export function guard(root) {
  const tr = [], tw = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
  for (let n = tw.nextNode(); n; n = tw.nextNode()) {
    const pe = n.parentElement;
    if (!n.textContent.trim() || !pe || pe.closest('svg, [aria-hidden="true"], details:not([open]) > :not(summary)')) continue; // 닫힌 서랍 안 글은 안 보임(검사 ⑩ 과 같은 셈)
    const r = document.createRange(); r.selectNodeContents(n);
    for (const q of r.getClientRects()) if (q.width > 0 && q.height > 0) tr.push(q);
  }
  let hid = 0;
  for (const o of root.querySelectorAll('.su-orn')) {
    const q = o.getBoundingClientRect(); let a = 0;
    for (const t of tr) a += Math.max(0, Math.min(q.right, t.right) - Math.max(q.left, t.left)) * Math.max(0, Math.min(q.bottom, t.bottom) - Math.max(q.top, t.top));
    if (a > 0) { o.classList.add('su-orn-off'); hid++; }
  }
  root.dataset.ornHidden = String(hid);
  return hid;
}
