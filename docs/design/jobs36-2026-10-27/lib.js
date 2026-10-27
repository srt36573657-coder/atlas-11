// 쪽 안 칸 찾기 — probe 와 apply 가 같은 셈을 씀(브라우저 안에서 돔)
window.__J36 = {
  vis: el => [...el.children].filter(c => { const q = c.getBoundingClientRect(); const s = getComputedStyle(c); return q.height >= 2 && s.position !== 'fixed' && s.display !== 'none'; }),
  root() {
    const v = document.querySelector('#view');
    for (const sel of ['div.tc', 'section.th-home', 'div.ppast', 'div.ptoday', 'div.jh', 'div.gm', 'div.gf', 'div.hp', 'div.shorts']) {
      const r = v.querySelector(sel); if (r && this.vis(r).length >= 3) return {r, path: ['#view', sel]};
    }
    return {r: v, path: ['#view']};
  },
  sub(blocks) { // 칸이 여섯보다 적으면 가장 많은 칸을 품은 칸 안도 차례를 바꿈
    if (blocks.length >= 6) return null;
    let best = null, bn = 0;
    for (const b of blocks) { const n = this.vis(b).length; if (n >= 3 && n > bn) { best = b; bn = n; } }
    return best;
  },
  info(c) {
    const q = c.getBoundingClientRect(), cls = typeof c.className === 'string' ? c.className : (c.getAttribute('class') || '');
    return {tag: c.tagName.toLowerCase(), cls: cls.split(' ').filter(Boolean).slice(0, 3).join('.'), top: Math.round(q.top + scrollY), h: Math.round(q.height),
      pic: !!c.querySelector('svg, canvas, img, video, .bars, .th-bars, i.bar') || /^(svg|canvas|img|video)$/i.test(c.tagName), links: c.querySelectorAll('a, button').length, isA: /^(A|BUTTON|NAV)$/.test(c.tagName),
      text: (c.innerText || '').replace(/\s+/g, ' ').trim().slice(0, 90)};
  }
};
