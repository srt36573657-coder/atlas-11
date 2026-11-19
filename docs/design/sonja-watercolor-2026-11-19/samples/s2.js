/* 샘플 2 · 흰 종이 남기기(g07 · 21표) — 칸을 그리지 않고 종이를 남김 · 첫 쪽은 한 폭 다섯 켜(먼 산 · 정자 · 연잎 · 징검돌 · 물가) · 누를 곳만 먹 테 */
window.SAMPLE = (main, hash) => {
  const {$, $$, el} = window.SX;
  SC.all(main); SC.tabs({'#/j': null, '#/r/t': '기록'});
  document.documentElement.classList.add('sc2');
  const win = (pos, label) => { const w = el('div', 'sc-win'); w.style.backgroundPosition = 'center ' + pos; w.setAttribute('role', 'img'); w.setAttribute('aria-label', label); return w; };
  const go = (href, text) => { const a = el('a', 'sc-ink', text); a.href = href; a.append(el('i', 'sc-go', '›')); return a; };
  const layer = (cls, pos, label, kicker, nodes) => { const s = el('section', 'sc-layer ' + cls); s.append(win(pos, label), el('p', 'sc-lk', kicker)); for (const n of nodes) if (n) s.append(n); return s; };
  if (hash === '#/' || hash === '#' || hash === '') {
    const old = [':scope > section.sj-cover', ':scope > section.sj-sun', ':scope > section.sj-s36', ':scope > details.sj-more'].map(s => $(s, main));
    const w3 = $('.sj-win3', main);
    const l1 = layer('sc-l1', '15%', '안개 낀 먼 산', '먼 산 · 오늘 시장', [el('h2', 'sc-big', '지금은 ' + SC.kindOf()), el('p', 'sc-promise', SC.dateOf() + ' 기록이에요. 앞날이 아니에요.')]);
    const l2 = layer('sc-l2', '31%', '정자와 등불', '정자 · 오늘 꾀', [w3, go('#/k', '꾀 서른여섯 차례 보기')]);
    const loss = $('.sj-loss', main);
    const l3 = layer('sc-l3', '55%', '연잎 셋', '연잎 · 꾀가 고른 회사', [loss, SC.drawer('분야와 회사 모두 보기', [$('.sj-th', main)])]);
    const l4 = layer('sc-l4', '73%', '징검돌', '징검돌 · 사기 전에', [el('h2', 'sc-h', '사기 전에 한 번 멈춰요'), el('p', 'sc-p', '열한 가지를 묻고 답해요. 안 사도 괜찮아요.'), go('#/q', '멈추고 물어보기')]);
    const l5 = layer('sc-l5', '97%', '물가와 나룻배', '물가 · 내 기록', [el('h2', 'sc-h', '정산과 매매일지'), el('p', 'sc-p', '꾀마다 100원이 얼마가 됐는지 날마다 적어요.'), go('#/r/t', '기록 보기'), SC.drawer('더 보기 · 숫자와 그림', [$('.sj-now', main), $('.sj-yd', main), $('.sj-landfig', main), $('.sj-calm', main), $('figure.sj-scroll', main)])]);
    const box = el('div', 'sc-home'); box.append(l1, l2, l3, l4, l5);
    main.insertBefore(box, main.firstChild);
    for (const s of old) if (s) s.style.display = 'none';
  } else if (hash === '#/k') {
    for (const s of $$('.sj-ph > blockquote.sj-q', main)) s.style.display = 'none';
  }
  SC.next(main, '다음 디딤돌');
};
