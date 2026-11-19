/* 샘플 3 · 산 하나 말 하나(g04 · 19표) — 열면 바로 오늘 산 하나와 큰 말 하나 · 쪽마다 맨 위는 그림 하나 · 말 하나 */
window.SAMPLE = (main, hash) => {
  const {$, $$, el} = window.SX;
  SC.all(main); SC.tabs({'#/j': null});
  document.documentElement.classList.add('sc3');
  if (hash === '#/' || hash === '#' || hash === '') {
    const old = [':scope > section.sj-cover', ':scope > section.sj-sun', ':scope > section.sj-s36', ':scope > details.sj-more'].map(s => $(s, main));
    const kinds = ['오르는', '잔잔한', '쏠린', '흔들리는', '내리는'];
    const D = ['M0 60C30 52 60 30 88 6C92 3 96 6 100 12L100 60Z', 'M0 60C20 28 80 28 100 60Z', 'M0 60C25 55 40 10 50 3C58 10 75 55 100 60Z', 'M0 60L15 30L28 48L42 18L55 44L70 14L84 40L100 60Z', 'M0 60C3 36 7 12 15 6C20 3 25 5 31 10C52 30 76 50 100 60Z'];
    const k = SC.kindOf(), ki = Math.max(0, kinds.findIndex(x => k.startsWith(x)));
    let back = '', x = 6;
    for (let i = 0; i < 5; i++) { if (i === ki) continue; back += `<path transform="translate(${x} 70) scale(.74 .6)" d="${D[i]}" fill="#9DB8BA" opacity=".34"/>`; x += 88; }
    const svg = `<svg viewBox="0 0 360 180" width="360" height="180" aria-hidden="true"><defs><linearGradient id="sc3m" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#2F4A55"/><stop offset=".7" stop-color="#4E676C"/><stop offset="1" stop-color="#8FB0B2"/></linearGradient><linearGradient id="sc3f" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#F4F8F7" stop-opacity="0"/><stop offset="1" stop-color="#F4F8F7"/></linearGradient></defs>${back}<path transform="translate(34 58) scale(2.95 1.7)" d="${D[ki]}" fill="#BFDCDC" opacity=".7"/><path transform="translate(30 52) scale(2.95 1.75)" d="${D[ki]}" fill="url(#sc3m)" opacity=".92" stroke="#1F2B2C" stroke-opacity=".35" stroke-width=".5"/><rect x="0" y="128" width="360" height="52" fill="url(#sc3f)"/></svg>`;
    const hero = el('section', 'sc-hero'); const pic = el('div', 'sc-mtn'); pic.innerHTML = svg;
    hero.append(pic, el('h2', 'sc-big', k), el('p', 'sc-date', '오늘 땅 · ' + SC.dateOf()), el('p', 'sc-promise', '지난 기록이에요. 앞날이 아니에요.'));
    const w3 = $('.sj-win3', main); const top = el('section', 'sc-top');
    const wk = w3 && $('li.sj-w3', w3) ? $('li.sj-w3', w3).dataset.k : ''; const tp = wk && $(`ol.sj-tricks > li[data-k="${wk}"] a.sj-tkpic`, main);
    if (tp) { const p = el('div', 'sc-toppic'); p.append(tp.cloneNode(true)); top.append(p); }
    top.append(el('p', 'sc-k', '지금 같은 시장에서 덜 잃은 꾀'), w3);
    const ord = el('section', 'sc-ord'); const allk = el('a', 'sc-more', '서른여섯 모두 보기 ›'); allk.href = '#/k';
    ord.append(el('h2', 'sc-h', '꾀 차례 · 한 줄씩'), SC.rows(main, 0, 5), allk);
    const stop = el('section', 'sc-stop'); const sb = el('a', 'sc-stopb', '사기 전에 멈출까요? ›'); sb.href = '#/q';
    stop.append(el('p', 'sc-k', '멈춤'), sb, el('p', 'sc-p', '열한 가지를 묻고, 답은 내 매매일지에 남아요.'));
    const rest = SC.drawer('더 보기 · 숫자와 그림', [$('.sj-loss', main), $('.sj-now', main), $('.sj-yd', main), $('.sj-artw', main), $('figure.sj-scroll', main), $('.sj-th', main)]);
    const box = el('div', 'sc-home'); box.append(hero, top, ord, stop, rest);
    main.insertBefore(box, main.firstChild);
    for (const s of old) if (s) s.style.display = 'none';
  } else if (hash === '#/k') {
    for (const s of $$('.sj-ph > blockquote.sj-q', main)) s.style.display = 'none';
  }
  SC.next(main, '다음');
};
