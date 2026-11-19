/* 샘플 1 · 문지기 수채화(g22 · 22표) — 물빛은 둘레에, 글은 흰 종이 판에 늘 또렷하게 · 붙는 것은 아래 탭 하나 */
window.SAMPLE = (main, hash) => {
  const {$, $$, el} = window.SX;
  SC.all(main); SC.tabs({'#/j': null});
  document.documentElement.classList.add('sc1');
  if (hash === '#/' || hash === '#' || hash === '') {
    const cover = $(':scope > section.sj-cover', main), sun = $(':scope > section.sj-sun', main), s36 = $(':scope > section.sj-s36', main), more = $(':scope > details.sj-more', main);
    const land = el('section', 'sc-land sc-panel');
    const strip = el('div', 'sc-strip'); strip.setAttribute('role', 'img'); strip.setAttribute('aria-label', '안개 낀 먼 산 그림');
    const card = el('div', 'sc-card');
    card.append(el('p', 'sc-kicker', '오늘 시장 · ' + SC.dateOf()), el('h2', 'sc-big', '지금은 ' + SC.kindOf()), el('p', 'sc-promise', '지난 기록이에요. 앞날이 아니에요.'));
    land.append(strip, card);
    const win = $('.sj-win3', main); if (win) win.classList.add('sc-panel');
    const loss = $('.sj-loss', main); if (loss) loss.classList.add('sc-panel', 'sc-lossp');
    const order = el('section', 'sc-order sc-panel');
    const allk = el('a', 'sc-more', '꾀 서른여섯 모두 보기 ›'); allk.href = '#/k';
    order.append(el('h2', 'sc-h', '꾀 서른여섯 · 오늘 차례'), SC.rows(main, 0, 3), allk);
    const scroll = $('figure.sj-scroll', main); if (scroll) scroll.classList.add('sc-panel');
    const rest = SC.drawer('더 보기 · 숫자와 그림', [$('.sj-now', main), $('.sj-yd', main), $('.sj-landfig', main), $('.sj-calm', main), $('.sj-th', main), $('.sj-artw', main)]);
    const box = el('div', 'sc-home');
    box.append(land, win, loss, order, scroll, rest);
    main.insertBefore(box, main.firstChild);
    for (const s of [cover, sun, s36, more]) if (s) s.style.display = 'none';
  } else if (hash === '#/k') {
    for (const s of $$('.sj-ph > blockquote.sj-q', main)) s.style.display = 'none';
  }
  SC.next(main, '다음');
};
