/* ATLAS 11 · 움직임 도우미 — 2026-10-07 18:27 사장님 「지금 글로 되어 있다 움직이는 도식화로 만들어라」 · 18:31 「과감하게 알틀란스를 전면 혁신하라 섹시하게 스마트 하게」
   · 그림(막대 · 점 · 줄)은 눈에 들어올 때 한 번 자라거나 켜진다 — 화면 아래쪽 그림은 내려가서 보일 때(IntersectionObserver)
   · 같은 화면을 다시 그리면(글씨 단추 · 탭을 오가며) 멈춘 그림 — 화면마다 이 창에서 처음 한 번만(app.js 「선 그리기는 화면마다 처음 한 번만」과 같은 뜻)
   · 글은 움직이지 않는다(처음부터 보임 — 바로 읽기 · 대비 검사) · 움직임 줄이기 설정이면 style.css 공통 규칙이 모든 움직임을 끔(끝 모습 그대로)
   · 쓰는 법: el 에 data-motion 을 달아 돌려받고(그림이 처음 자리 · 멈춤) → 보이면 .go(움직임 시작) — CSS 는 [data-motion]:not(.go) 안의 움직임을 멈춰 둠 */
const played = new Set();
/** 이 화면(key)에서 처음이면 el 에 움직임을 걸고 true · 이미 했으면 그대로(멈춘 그림) false */
export function playOnce(key, el, {when = 'seen'} = {}) {
  if (!el || played.has(key)) return false;
  played.add(key);
  el.setAttribute('data-motion', '');
  if (when === 'now' || typeof IntersectionObserver !== 'function') { el.classList.add('go'); return true; }
  const io = new IntersectionObserver(es => { for (const e of es) if (e.isIntersecting) { e.target.classList.add('go'); io.unobserve(e.target); } }, {threshold: 0.12});
  io.observe(el);
  return true;
}
/** 차례 번호(--i) — 하나씩 차례로 자라게(지연 = 번호 × 간격 · CSS 가 씀) · 글 속 style 속성 없이 CSSOM 으로만 */
export function stagger(els, step = null) {
  const xs = [...els];
  xs.forEach((x, i) => x.style.setProperty('--i', String(i)));
  if (step != null && xs[0]?.parentElement) xs[0].parentElement.style.setProperty('--st', step);
  return xs;
}
