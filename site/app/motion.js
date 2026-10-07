/* ATLAS 11 · 움직임 도우미 — 2026-10-07 18:27 사장님 「지금 글로 되어 있다 움직이는 도식화로 만들어라」 · 18:31 「과감하게 알틀란스를 전면 혁신하라 섹시하게 스마트 하게」
   2026-10-07 19:40 「하나 움직이고 그런 다음 다음 움직이고 그렇게 하나하나 움직이게 해 · 이렇게 동시에 움직이게 하지 말고」 — 화면 전체에 움직임 줄 하나:
   · 그림(막대 · 점 · 띠)은 눈에 들어오면 줄을 선다 → 앞 그림의 움직임이 다 끝나야 다음 그림이 움직임(dur = 그 그림이 움직이는 시간)
   · 돈 이야기 짚어 주기(story.js)가 도는 동안은 줄 전체가 기다림(hold · release)
   · 같은 화면을 다시 그리면(글씨 단추 · 탭을 오가며) 멈춘 그림 — 화면마다 이 창에서 처음 한 번만
   · 글은 움직이지 않는다(처음부터 보임) · 움직임 줄이기 설정이면 style.css 공통 규칙이 모든 움직임을 끔(끝 모습 그대로)
   · 쓰는 법: playOnce(이름, el, {dur}) — el 에 data-motion(처음 모습에서 멈춰 기다림) → 차례가 오면 .go(움직임 시작) */
const played = new Set(), queue = [];
let holder = null, busyUntil = 0, timer = 0;
const now = () => (typeof performance !== 'undefined' ? performance.now() : Date.now());
/** 줄 당기기 — 아무도 움직이지 않을 때만 맨 앞 그림을 움직임 */
function pump() {
  clearTimeout(timer);
  if (holder || !queue.length) return;
  const wait = busyUntil - now();
  if (wait > 0) { timer = setTimeout(pump, wait + 30); return; }
  const {el, dur} = queue.shift();
  if (!el.isConnected) { pump(); return; } // 다른 화면으로 간 뒤 남은 그림은 건너뜀
  el.classList.add('go');
  busyUntil = now() + dur;
  timer = setTimeout(pump, dur + 30);
}
/** 지금 움직이는 그림이 끝날 때까지 남은 시간(ms) — 짚어 주기가 다시 이어질 때 겹치지 않게 기다림 */
export const idleIn = () => Math.max(0, busyUntil - now());
/** 돈 이야기 짚어 주기가 도는 동안 — 줄 전체가 기다림 */
export function hold(owner) { holder = owner; clearTimeout(timer); }
export function release(owner) { if (holder === owner) { holder = null; pump(); } }
/** 이 화면(key)에서 처음이면 el 을 줄에 세우고 true · 이미 했으면 그대로(멈춘 그림) false · dur = 움직이는 시간(ms) */
export function playOnce(key, el, {when = 'seen', dur = 900} = {}) {
  if (!el || played.has(key)) return false;
  played.add(key);
  el.setAttribute('data-motion', '');
  const line = () => { queue.push({el, dur}); pump(); };
  if (when === 'now' || typeof IntersectionObserver !== 'function') { line(); return true; }
  const io = new IntersectionObserver(es => { for (const e of es) if (e.isIntersecting) { io.unobserve(e.target); line(); } }, {threshold: 0.12});
  io.observe(el);
  return true;
}
/** 차례 번호(--i) — 하나씩 차례로(지연 = 번호 × 간격 · CSS 가 씀 · 간격 = 하나가 움직이는 시간이라 겹치지 않음) · 글 속 style 속성 없이 CSSOM 으로만 */
export function stagger(els, step = null) {
  const xs = [...els];
  xs.forEach((x, i) => x.style.setProperty('--i', String(i)));
  if (step != null && xs[0]?.parentElement) xs[0].parentElement.style.setProperty('--st', step);
  return xs;
}
