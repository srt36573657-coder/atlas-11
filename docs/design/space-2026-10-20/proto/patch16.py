# 7판 — 그래프를 아름답게(사장님 19:24 「아름답게 그라프 알지?」) · 데이터 그림 규칙: 가는 선 2px · 둥근 끝(바닥은 반듯) · 옅은 바탕 · 머리카락 격자 · 이름표는 가려서 셋만 · 점은 밤빛 고리
import sys
p=sys.argv[1]; s=open(p,encoding='utf-8').read()
def rep(a,b,n=1):
    global s
    c=s.count(a); assert c==n,(c,a[:90]); s=s.replace(a,b)
def cut(start,end,new):
    global s
    i=s.find(start); assert i>0, start[:60]; j=s.find(end,i); assert j>0, end[:60]; s=s[:i]+new+s[j+len(end):]

# ① 지나온 길 — 선 · 옅은 달빛 바탕 · 진짜 가장 높은 날/낮은 날을 선에 끼움 · 이름표 셋
cut("  const fig = h('figure', {class: 'chart scrub'}); const W = 360, H = 210, L = C.line, n = L.length;",
    "  fig.addEventListener('pointermove', e => { if (e.pointerType === 'mouse' || e.buttons) pick(e); });\n",
"""  const fig = h('figure', {class: 'chart scrub'}); const W = 360, H = 220;
  /* 7판 — 이틀마다 찍힌 값에 진짜 가장 높은 날 · 낮은 날을 끼워 넣음(그래프 점과 아래 글이 같은 값) */
  const idx = []; for (let j = 0; j <= C.days; j += 2) idx.push(j); if (idx[idx.length - 1] !== C.days) idx.push(C.days);
  const P = C.line.map((v, k) => [idx[k] ?? k * 2, v]);
  const put = (dt, v) => { const d = D.dates.indexOf(dt) - (C.k0 || 0); if (d < 0 || d > C.days || P.some(q => q[0] === d)) return; P.push([d, v]); };
  if (C.hi && C.hi[1]) put(C.hi[1], C.hi[0]); if (C.lo && C.lo[1]) put(C.lo[1], C.lo[0]);
  P.sort((a, b) => a[0] - b[0]);
  const n = P.length, vals = P.map(q => q[1]), top = Math.max(C.hi[0], ...vals), bot = Math.min(C.lo[0], ...vals), span = top - bot || 1;
  const px = d => 8 + d / Math.max(1, C.days) * (W - 16), py = v => 22 + (top - v) / span * (H - 46);
  const svg = s('svg', {viewBox: `0 0 ${W} ${H}`, role: 'img', 'aria-label': `${C.n} ${C.full ? '1년' : '상장 뒤'} 값 — ${won(C.f0)}에서 ${won(C.f1)}`}); fig.append(svg);
  for (const gy of [py(top), py((top + bot) / 2), py(bot)]) svg.append(s('line', {x1: 0, y1: gy.toFixed(1), x2: W, y2: gy.toFixed(1), class: 'gd'}));
  const pts = P.map(([d, v]) => `${px(d).toFixed(1)},${py(v).toFixed(1)}`), yb = py(bot).toFixed(1);
  svg.append(s('path', {d: `M${px(P[0][0]).toFixed(1)},${yb} L${pts.join(' L')} L${px(P[n - 1][0]).toFixed(1)},${yb} Z`, class: 'ar fade'}), s('polyline', {points: pts.join(' '), class: 'ln draw', pathLength: 1000}));
  const kHi = vals.indexOf(Math.max(...vals)), kLo = vals.indexOf(Math.min(...vals)), kEnd = n - 1, at = k => [px(P[k][0]), py(P[k][1])];
  const [hx, hy] = at(kHi), [lx, ly] = at(kLo), [ex, ey] = at(kEnd);
  svg.append(s('circle', {cx: ex.toFixed(1), cy: ey.toFixed(1), r: 13, class: 'halo'}), s('circle', {cx: hx.toFixed(1), cy: hy.toFixed(1), r: 4.5, class: 'hi'}), s('circle', {cx: lx.toFixed(1), cy: ly.toFixed(1), r: 4.5, class: 'lo'}), s('circle', {cx: ex.toFixed(1), cy: ey.toFixed(1), r: 5.5, class: 'nowp'}));
  /* 이름표는 셋만 — 가장 높을 때 · 낮을 때 · 오늘(글은 글자색 · 색은 점이 가짐) · 겹치면 뒤의 것을 뺌 */
  const UW = t => String(t).length * 12 + 8, UH = 28, boxes = [];
  const lab = (x, y, text, side) => { const w = UW(text), x0 = side === 'end' ? x - w : x, yy = Math.max(14, Math.min(H - 14, y)), r = [x0, yy - UH / 2, x0 + w, yy + UH / 2]; if (boxes.some(b => r[0] < b[2] && b[0] < r[2] && r[1] < b[3] && b[1] < r[3])) return; boxes.push(r); ov(fig, [W, H], x, yy, text, 'cl ' + side); };
  const sideOf = x => (x < W * 0.55 ? 'start' : 'end'), off = x => (x < W * 0.55 ? 11 : -11);
  lab(hx + off(hx), hy, won(P[kHi][1]), sideOf(hx));
  if (kLo !== kHi) lab(lx + off(lx), ly, won(P[kLo][1]), sideOf(lx));
  if (kEnd !== kHi && kEnd !== kLo) lab(ex - 4, ey + (ey < H / 2 ? 24 : -24), won(P[kEnd][1]), 'end');
  const guide = s('line', {y1: 8, y2: H - 8, class: 'guide', visibility: 'hidden'}), dot = s('circle', {r: 5, class: 'pick', visibility: 'hidden'});
  svg.append(guide, dot);
  const tip = h('div', {class: 'tip', 'aria-live': 'polite'}); tip.hidden = true; fig.append(tip);
  const show = k => {
    const [x, y] = at(k);
    guide.setAttribute('x1', x.toFixed(1)); guide.setAttribute('x2', x.toFixed(1)); guide.setAttribute('visibility', 'visible');
    dot.setAttribute('cx', x.toFixed(1)); dot.setAttribute('cy', y.toFixed(1)); dot.setAttribute('visibility', 'visible');
    const di = D.dates[(C.k0 || 0) + P[k][0]], ch = (P[k][1] / C.f0 - 1) * 100;
    tip.replaceChildren(h('b', {}, won(P[k][1])), h('span', {}, di ? kdate(di) : ''), h('span', {class: cls3(ch)}, `처음보다 ${pct(ch)}`));
    tip.hidden = false;
    const fw = fig.clientWidth || W, tw = tip.offsetWidth || 160, left = Math.max(tw / 2 + 2, Math.min(fw - tw / 2 - 2, x / W * fw));
    tip.style.left = left + 'px'; tip.style.top = (y / H * 100) + '%'; tip.classList.toggle('below', y / H < 0.42);
  };
  const pick = e => { const m = svg.getScreenCTM(); if (!m) return; const pt = svg.createSVGPoint(); pt.x = e.clientX; pt.y = e.clientY; const q = pt.matrixTransform(m.inverse()), d = (q.x - 8) / (W - 16) * C.days; let best = 0; for (let k = 1; k < n; k++) if (Math.abs(P[k][0] - d) < Math.abs(P[best][0] - d)) best = k; show(best); };
  fig.addEventListener('pointerdown', pick);
  fig.addEventListener('pointermove', e => { if (e.pointerType === 'mouse' || e.buttons) pick(e); });
""")
# 날짜는 그래프 아래(가로축 자리)로
rep("""    h('div', {class: 'band-l'}, h('span', {}, kdate(C.from)), h('span', {}, kshort(C.to))),
    fig,""", """    fig,
    h('div', {class: 'band-l'}, h('span', {}, kdate(C.from)), h('span', {}, kshort(C.to))),""")

# ② 이웃 별 — 가는 가로 막대(바닥 반듯 · 끝 둥근) · 이 회사만 금빛 · 나머지 은빛
cut("  const bar = ([nm, rev, code]) => {", "    return !me && D.co[code] ? go1('c:' + code, 'hb', ...inner) : h('div', {class: 'hb' + (me ? ' me' : '')}, ...inner);\n  };\n",
"""  const bar = ([nm, rev, code]) => {
    const me = code === c, fill = h('i', {}); fill.style.width = Math.max(1.5, (rev || 0) / mx * 100).toFixed(1) + '%';
    const inner = [h('span', {class: 'lbl'}, h('span', {}, nm + (me ? ' · 이 회사' : '')), h('b', {}, eok(rev))), h('span', {class: 'hbar', 'aria-hidden': 'true'}, fill)];
    return !me && D.co[code] ? go1('c:' + code, 'hb', ...inner) : h('div', {class: 'hb' + (me ? ' me' : '')}, ...inner);
  };
""")
# 맞혀 볼까 · 성적표 막대도 같은 모양
rep("""  const row = (lbl, v, c) => h('div', {class: 'r'}, h('span', {}, lbl), s('svg', {viewBox: '0 0 100 14', preserveAspectRatio: 'none', 'aria-hidden': 'true'}, s('rect', {x: 0, y: 0, width: 100, height: 14, rx: 7, class: 't0'}), s('rect', {x: 0, y: 0, width: v, height: 14, rx: 7, class: c + ' grow'})), cnt(v, '번'));""",
    """  const row = (lbl, v, c) => { const f = h('i', {class: c}); f.style.width = Math.max(0, Math.min(100, v)).toFixed(1) + '%'; return h('div', {class: 'r'}, h('span', {}, lbl), h('span', {class: 'hbar', 'aria-hidden': 'true'}, f), cnt(v, '번')); };""")

# ③ 커 왔을까 — 가는 기둥(24) · 위끝만 둥글게 · 지난해 은빛 · 마지막 해 금빛 · 손해는 파랑
rep("""    vals.forEach((v, k) => { if (v == null) return; const hgt = Math.abs(v) / mx * span, x = 30 + k * 100; svg.append(s('rect', {x, y: (v >= 0 ? base - hgt : base).toFixed(1), width: 40, height: Math.max(1.5, hgt).toFixed(1), rx: 4, class: 'yb' + (v < 0 ? ' neg' : k === vals.length - 1 ? ' last' : '')})); });""",
"""    vals.forEach((v, k) => {
      if (v == null) return;
      const hgt = Math.max(1.5, Math.abs(v) / mx * span), cx = 50 + k * 100, x0 = cx - 12, x1 = cx + 12, r = Math.min(4, hgt), e = v >= 0 ? base - hgt : base + hgt, sg = v >= 0 ? 1 : -1;
      const d = `M${x0},${base} V${(e + sg * r).toFixed(1)} Q${x0},${e.toFixed(1)} ${x0 + r},${e.toFixed(1)} H${x1 - r} Q${x1},${e.toFixed(1)} ${x1},${(e + sg * r).toFixed(1)} V${base} Z`;
      svg.append(s('path', {d, class: 'yb' + (v < 0 ? ' neg' : k === vals.length - 1 ? ' last' : '')}));
    });""")

# ④ 흔들림 — 낮을 때(파랑)부터 높을 때(빨강)까지 옅은 띠 · 금빛 동그라미에 밤빛 고리와 번지는 빛
rep("""  svg.append(s('rect', {x: 0, y: 14, width: 300, height: 16, rx: 8, class: 'bb'}), s('rect', {x: 0, y: 14, width: (pos * 300).toFixed(1), height: 16, rx: 8, class: 'bf grow'}), s('circle', {cx: Math.max(10, Math.min(290, pos * 300)).toFixed(1), cy: 22, r: 10, class: 'bn'}));""",
    """  const kx = Math.max(12, Math.min(288, pos * 300)).toFixed(1);
  svg.append(s('rect', {x: 2, y: 18, width: 296, height: 8, rx: 4, class: 'bb'}), s('circle', {cx: kx, cy: 22, r: 17, class: 'halo'}), s('circle', {cx: kx, cy: 22, r: 8.5, class: 'bn'}));""")

# ⑤ 작은 선(열흘 길) — 끝점 하나
rep("""  const pts = l.map((v, i) => `${(2 + i / (l.length - 1) * 92).toFixed(1)},${(34 - (v - lo) / sp * 32).toFixed(1)}`).join(' ');
  return s('svg', {viewBox: '0 0 96 36', class: 'spark', 'aria-hidden': 'true'}, s('polyline', {points: pts, class: 'sl ' + cls3(d10), pathLength: 100}));""",
    """  const X = i => 3 + i / (l.length - 1) * 87, Y = v => 31 - (v - lo) / sp * 26, k = l.length - 1;
  const pts = l.map((v, i) => `${X(i).toFixed(1)},${Y(v).toFixed(1)}`).join(' ');
  return s('svg', {viewBox: '0 0 96 36', class: 'spark', 'aria-hidden': 'true'}, s('polyline', {points: pts, class: 'sl ' + cls3(d10), pathLength: 100}), s('circle', {cx: X(k).toFixed(1), cy: Y(l[k]).toFixed(1), r: 3.6, class: 'se ' + cls3(d10)}));""")

# 그래프 정의(그라데이션) 둘 더
rep('<radialGradient id="starglow">', '<linearGradient id="areamoon" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#F1E6C8" stop-opacity=".16"/><stop offset="1" stop-color="#F1E6C8" stop-opacity="0"/></linearGradient><linearGradient id="rangegrad" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#5EA2FF" stop-opacity=".6"/><stop offset=".5" stop-color="#8C97AC" stop-opacity=".32"/><stop offset="1" stop-color="#FF6A3D" stop-opacity=".6"/></linearGradient><radialGradient id="starglow">')

# CSS
rep(".ln { fill: none; stroke: var(--moon); stroke-width: 2.2; stroke-linejoin: round; stroke-linecap: round; }", ".ln { fill: none; stroke: var(--moon); stroke-width: 2; stroke-linejoin: round; stroke-linecap: round; }")
rep(".ar { fill: rgba(243, 231, 200, .08); }", ".ar { fill: url(#areamoon); }")
rep(".gd { stroke: var(--line); stroke-width: 1; }", ".gd { stroke: rgba(200, 212, 240, .12); stroke-width: 1; }")
rep(".hi { fill: var(--up); } .lo { fill: var(--down); } .nowp { fill: var(--wax); }", ".hi { fill: var(--up); } .lo { fill: var(--down); } .nowp { fill: var(--wax); }\n.hi, .lo, .nowp { stroke: var(--sky); stroke-width: 2; }\n.halo { fill: url(#starglow); }\n.ov.cl { font-family: var(--sans); font-weight: 600; color: var(--ink); font-variant-numeric: tabular-nums; }")
rep(".spark .sl.up { stroke: var(--up); } .spark .sl.dn { stroke: var(--down); } .spark .sl.fl { stroke: var(--dim); }", ".spark .sl.up { stroke: var(--up); } .spark .sl.dn { stroke: var(--down); } .spark .sl.fl { stroke: var(--dim); }\n.spark .se { stroke: var(--sky); stroke-width: 1.5; } .spark .se.up { fill: var(--up); } .spark .se.dn { fill: var(--down); } .spark .se.fl { fill: var(--dim); }")
rep(".hb svg { display: block; width: 100%; height: 16px; }", ".hbar { display: block; height: 10px; border-radius: 0 5px 5px 0; background: rgba(150, 170, 220, .10); }\n.hbar i { display: block; height: 100%; border-radius: 0 5px 5px 0; background: var(--cool); opacity: .8; }\n.hb.me .hbar i, .bar100 .hbar i.t1 { background: var(--wax); opacity: 1; }\n.mo-on .page.enter .hbar i { animation: growx 1s cubic-bezier(.2, .7, .2, 1) .25s both; transform-origin: left center; }")
rep(".bar100 svg { display: block; width: 100%; height: 14px; }", ".bar100 .hbar { align-self: center; }")
rep(".g3 { display: flex; flex-direction: column; gap: var(--sp-1); padding: var(--sp-2); border: 1px solid var(--line); border-radius: var(--r); }", ".g3 { display: flex; flex-direction: column; gap: var(--sp-1); padding: var(--sp-2); border: 1px solid var(--line); border-radius: var(--r); background: rgba(13, 20, 40, .4); }")
rep(".g3 .yb { fill: var(--dim); } .g3 .yb.last { fill: var(--moon); } .g3 .yb.neg { fill: var(--down); }", ".g3 .yb { fill: var(--cool); opacity: .78; } .g3 .yb.last { fill: var(--wax); opacity: 1; } .g3 .yb.neg { fill: var(--down); opacity: .85; }")
rep(".g3 .zero { stroke: var(--faint); stroke-width: 1; }", ".g3 .zero { stroke: rgba(200, 212, 240, .28); stroke-width: 1; }")
rep(".band .bb { fill: var(--sky-3); }", ".band .bb { fill: url(#rangegrad); }")
rep(".band .bn { fill: var(--wax); }", ".band .bn { fill: var(--wax); stroke: var(--sky); stroke-width: 3; }")
rep(".guide { stroke: var(--moon); stroke-width: 1; stroke-dasharray: 3 4; opacity: .7; }", ".guide { stroke: var(--moon); stroke-width: 1; opacity: .45; }")
rep(".tip { position: absolute; z-index: 3; display: flex; flex-direction: column; gap: 0; min-width: 9.5em; padding: 8px 12px; border: 1px solid var(--frame); border-radius: 12px; background: var(--sky-2);", ".tip { position: absolute; z-index: 3; display: flex; flex-direction: column; gap: 0; min-width: 9.5em; padding: 8px 12px; border: 1px solid rgba(242, 196, 106, .45); border-radius: 12px; background: rgba(13, 20, 40, .95);")
rep(".mo-on .page.enter .spark .sl { stroke-dasharray: 100; animation: draw100 1s ease-out .35s both; }", ".mo-on .page.enter .spark .sl { stroke-dasharray: 100; animation: draw100 1s ease-out .35s both; }\n.mo-on .page.enter .spark .se { animation: fadein .6s ease-out 1.2s both; }")
rep(".mo-on .ln.draw { stroke-dasharray: 1000; animation: draw 1.6s cubic-bezier(.3, .6, .2, 1) both; }", ".mo-on .ln.draw { stroke-dasharray: 1000; animation: draw 2.2s cubic-bezier(.3, .6, .2, 1) both; }")
open(p,'w',encoding='utf-8').write(s); print('patched 16')
