/* 첫 화면 큰 제목 돌리기(미리 보기 — 사장님 2026-10-21 23:09 「아 해 섹시하게」 · 차례 ② 「큰 제목 후보를 쉬운 말과 곧은 말로 나눠 보여 드릴게요」)
   까닭: 23:07 지인 말 「지금 봄이온곳~ 언어순환 필요 · 타겟팅을제대로해서.조금더고급스러운 언어로 순회시키기 · 지금은 ai수준. 미래는 테슬라처럼」
        · 사장님 23:05 「1.주식을잘모르는아이들을위한 편안한 쉬운 말투 2.주식을 이미 아는 사람들이 확실하게 볼수잇는 돌리지않는말투」
   쉬운 말(easy)과 곧은 말(direct)을 번갈아 · 6초마다 · 0.5초 동안 옅어지며 살짝 오르고 · 새 말이 아래에서 살짝 올라와 짙어짐(옮김 · 짙기만 — 입체 없음)
   한 줄 넉 자 + 띄어쓰기 하나 안쪽으로 두 줄(390 폭 48px · 돌 시계 옆 200px) · 제목 칸은 두 줄 자리 고정(stone.css .s-h1 min-height — 밀림 0)
   첫 말은 그대로 「지금 봄이 온 곳」(2026-10-21 00:51 · 00:59 사장님이 정하신 말) · 첫 그림 뒤 한가할 때 받음(가장 큰 그림을 늦추지 않음)
   움직임 줄이기 · 영어 화면이면 돌리지 않음(첫 말만) · 창이 숨으면 쉼 · 제목이 화면에서 떨어지면 멈춤 · 글은 textContent 로만 */
export const TITLES = Object.freeze([
  Object.freeze({t: '지금 봄이 온 곳', v: 'easy'}),
  Object.freeze({t: '시장보다 강한 업종', v: 'direct'}),
  Object.freeze({t: '꽃이 먼저 핀 곳', v: 'easy'}),
  Object.freeze({t: '시장을 앞선 업종', v: 'direct'}),
]);
export const EVERY_MS = 6000, FADE_MS = 500;
const still = () => !!globalThis.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches;
const english = () => document.documentElement.classList.contains('en') || document.documentElement.lang === 'en';

/** 제목 하나를 돌림 — 멈추는 함수를 돌려줌 */
export function rotateTitle(el, {list = TITLES, every = EVERY_MS} = {}) {
  if (!el || still() || english() || list.length < 2) return () => {};
  let i = Math.max(0, list.findIndex(x => x.t === el.textContent.trim())), timer = 0, swap = 0;
  el.setAttribute('aria-live', 'off');
  const stop = () => { clearTimeout(timer); clearTimeout(swap); timer = swap = 0; el.classList.remove('tt-out', 'tt-in'); };
  const next = () => {
    if (!el.isConnected) { stop(); return; }
    if (document.hidden) { timer = setTimeout(next, every); return; }
    i = (i + 1) % list.length;
    el.classList.add('tt-out');
    swap = setTimeout(() => {
      el.textContent = list[i].t;
      el.dataset.voice = list[i].v;
      el.classList.remove('tt-out'); el.classList.add('tt-in');
      void el.offsetWidth; // 새 말 자리(아래 · 옅음)를 한 번 그린 뒤 제자리로
      el.classList.remove('tt-in');
      timer = setTimeout(next, every);
    }, FADE_MS);
  };
  el.dataset.voice = list[i].v;
  timer = setTimeout(next, every);
  return stop;
}
