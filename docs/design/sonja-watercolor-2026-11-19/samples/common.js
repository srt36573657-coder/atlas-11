/* 샘플 셋 공통 짜임(시험 사이트에서만) — 참모 서른여섯이 함께 고른 것: 머리 줄 셋 · 떠 있는 막대 버림 · 탭 넷 · 그림 뜻 딱지 버림 · 쪽 끝 다음 단추 · 천사 선물은 끝 줄 */
window.SC = (() => {
  const {$, $$, el} = window.SX;
  const kindOf = () => { const t = (($('#su .sj-today') || {}).innerText || '').replace(/\s+/g, ' '); const m = t.match(/(오르는|잔잔한|쏠린|흔들리는|내리는)\s*시장/); return m ? m[1] + ' 시장' : '오늘 시장'; };
  const dateOf = () => { const t = (($('#su .sj-now') || {}).innerText || ''); const m = t.match(/(\d+월 \d+일)/); return m ? m[1] : ''; };
  const head = () => {
    const top = $('#su header.sj-top'); if (!top || top.dataset.sc) return; top.dataset.sc = '1';
    for (const s of ['.sj-angel', '.sj-find', '.sj-gift']) { const a = $(s, top); if (a) a.style.display = 'none'; }
    const lis = $('#su nav.sj-dock .sj-listen');
    if (lis) { const b = el('button', 'sj-btn sc-listen', '듣기'); b.type = 'button'; b.addEventListener('click', () => lis.click()); const big = $('.sj-bigtext', top); (big ? big.parentNode : top).insertBefore(b, big); }
  };
  const tabs = (names) => {
    for (const a of $$('#su nav.sj-tabs a.sj-tab')) {
      const h = a.getAttribute('href'); if (!(h in names)) continue;
      if (names[h] === null) { a.style.display = 'none'; continue; }
      const t = [...a.childNodes].reverse().find(n => n.nodeType === 3 && n.textContent.trim()) || [...a.querySelectorAll('span')].pop();
      if (t) t.textContent = names[h];
    }
  };
  const next = (main, label) => {
    const nx = $('#su nav.sj-dock a.sj-next'); if (!nx || $('.sc-next', main)) return;
    const txt = nx.textContent.replace(/^\s*\d+\s*\/\s*\d+\s*/, '').replace('›', '').trim();
    const a = el('a', 'sc-next'); a.href = nx.getAttribute('href');
    const b = el('span', 'sc-nextb'); b.append(el('span', 'sc-nextk', label || '다음 한 걸음'), el('b', 'sc-nextt', txt));
    a.append(b, el('i', 'sc-nextgo', '›'));
    const end = $(':scope > footer.sj-end', main); main.insertBefore(a, end);
  };
  const clean = (main) => {
    for (const s of $$('.sj-pmt', main)) s.remove();
    for (const s of $$('p.sj-step', main)) s.style.display = 'none';
    for (const e of $$('*', main)) if (!e.children.length && /undefined/.test(e.textContent)) e.style.display = 'none';
    for (const s of $$(':scope > .sj-ph > .sj-today, :scope > .sj-ph > .sj-says', main)) s.style.display = 'none';
  };
  const foot = (main) => {
    const f = $(':scope > footer.sj-end', main); if (!f || $('.sc-flinks', f)) return;
    const p = el('p', 'sc-flinks'); const a1 = el('a', 'sc-fl', '천사 ↗'); a1.href = 'https://shin-yxy.gino.im/'; const a2 = el('a', 'sc-fl', '선물'); a2.href = '#/gift'; const a3 = el('a', 'sc-fl', '찾기'); a3.href = '#/q';
    p.append(a1, a2, a3); f.prepend(p);
  };
  const rows = (main, from, n, cls) => {
    const ol = el('ol', cls || 'sc-rowl');
    for (const li of $$('ol.sj-tricks > li', main).slice(from, from + n)) {
      const a = $('a.sj-tkh', li); if (!a) continue;
      const it = el('li'), aa = el('a', 'sc-row'); aa.href = a.getAttribute('href');
      const b = el('span', 'sc-rb'); b.append(el('b', 'sc-rn', ($('.sj-tn b', li) || {}).textContent || ''), el('span', 'sc-rv', (($('.sj-ktrv', li) || {}).textContent || '').replace('정산에서 ', '')));
      aa.append(el('span', 'sc-rk', ($('.sj-rk', li) || {}).textContent || ''), b, el('i', 'sc-go', '›')); it.append(aa); ol.append(it);
    }
    return ol;
  };
  const drawer = (title, nodes) => { const d = el('details', 'sj-drawer sc-drawer'); const s = el('summary', '', title); d.append(s); for (const n of nodes) if (n) d.append(n); return d; };
  const all = (main) => { head(); clean(main); foot(main); };
  return {kindOf, dateOf, head, tabs, next, clean, foot, rows, drawer, all};
})();
