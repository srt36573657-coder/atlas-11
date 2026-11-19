/* 샘플 짜임 바꾸기 공통(시험 사이트에서만 · 진짜 사이트에 안 올림) — 쪽이 다 그려진 뒤 SAMPLE(main, hash) 를 부름 */
(() => {
  const $ = (s, r = document) => r.querySelector(s), $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const el = (tag, cls, text) => { const e = document.createElement(tag); if (cls) e.className = cls; if (text != null) e.textContent = text; return e; };
  window.SX = {$, $$, el};
  let last = '';
  const run = () => {
    const main = $('#su main.sj-page');
    if (!main || main.hasAttribute('data-wait') || main.dataset.sx === location.hash) return;
    main.dataset.sx = location.hash;
    try { window.SAMPLE && window.SAMPLE(main, location.hash || '#/'); } catch (e) { console.error('sample', e); }
  };
  new MutationObserver(run).observe(document.documentElement, {subtree: true, childList: true, attributes: true, attributeFilter: ['data-wait']});
  addEventListener('hashchange', () => setTimeout(run, 50));
  setInterval(run, 300);
})();
