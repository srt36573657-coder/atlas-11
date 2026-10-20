# 8판 — 더 초롱초롱하게(사장님 19:51) · 차분함은 지킴: 빠른 깜빡임 없이 3.5 ~ 7초에 한 번 · 밝은 별 몇 개만 십자 빛
import sys
p=sys.argv[1]; s=open(p,encoding='utf-8').read()
def rep(a,b,n=1):
    global s
    c=s.count(a); assert c==n,(c,a[:90]); s=s.replace(a,b)

# ── 뒤 별 하늘: 모든 별 조금 더 밝게 · 백 개에 일곱 개꼴로 「밝은 별」(번지는 빛 + 십자 빛 · 3 ~ 5초에 한 번 천천히 반짝) ──
rep("() => ({r: Math.sqrt(rnd()) * R, t: rnd() * 6.2832, s: rnd() * 1.1 + 0.3, a: rnd() * 0.55 + 0.2, p: rnd() * 6.28, w: rnd() * 0.8 + 0.2}));",
    "() => ({r: Math.sqrt(rnd()) * R, t: rnd() * 6.2832, s: rnd() * 1.1 + 0.3, a: rnd() * 0.6 + 0.28, p: rnd() * 6.28, w: rnd() * 0.8 + 0.2, b: rnd() < 0.07, hue: rnd()}));")
rep("""      if (x < -30 || y < -30 || x > W + 30 || y > H + 30) continue;
      ctx.globalAlpha = st.a * (MOVE() ? 0.82 + 0.18 * Math.sin(st.p + now * 0.0006 * st.w) : 1);""",
"""      if (x < -30 || y < -30 || x > W + 30 || y > H + 30) continue;
      if (st.b) { bright.push([st, x, y]); continue; }
      ctx.globalAlpha = st.a * (MOVE() ? 0.82 + 0.18 * Math.sin(st.p + now * 0.0006 * st.w) : 1);""")
rep("""    ctx.fillStyle = col; ctx.strokeStyle = col; ctx.lineCap = 'round';
    for (const st of stars) {""", """    ctx.fillStyle = col; ctx.strokeStyle = col; ctx.lineCap = 'round';
    const bright = [];
    for (const st of stars) {""")
rep("""    const g = ctx.createRadialGradient(pole.x, pole.y, 0, pole.x, pole.y, 10); g.addColorStop(0, 'rgba(255,246,214,.95)'); g.addColorStop(1, 'rgba(255,246,214,0)');
    ctx.globalAlpha = 0.85; ctx.fillStyle = g; ctx.beginPath(); ctx.arc(pole.x, pole.y, 10, 0, 6.2832); ctx.fill(); ctx.fillStyle = col;""",
"""    /* 8판 — 초롱초롱한 별: 번지는 빛 · 맑은 알맹이 · 십자 빛 · 3 ~ 5초에 한 번 천천히 */
    for (const [st, x, y] of bright) {
      const tw = MOVE() ? 0.55 + 0.45 * Math.sin(st.p + now * 0.0016 * (0.6 + st.w)) : 0.85, al = Math.min(1, st.a + 0.35) * tw, rr = st.s * 1.25 + 0.35, c2 = st.hue < 0.5 ? '#FFF6D6' : '#E3EBFF';
      ctx.globalAlpha = al * 0.6; ctx.drawImage(GLOW, x - rr * 6, y - rr * 6, rr * 12, rr * 12);
      ctx.globalAlpha = al; ctx.fillStyle = c2; ctx.beginPath(); ctx.arc(x, y, rr, 0, 6.2832); ctx.fill();
      const L = rr * (3.5 + 3.5 * tw); ctx.globalAlpha = al * 0.65; ctx.strokeStyle = c2; ctx.lineWidth = 0.8; ctx.beginPath(); ctx.moveTo(x - L, y); ctx.lineTo(x + L, y); ctx.moveTo(x, y - L); ctx.lineTo(x, y + L); ctx.stroke();
    }
    ctx.fillStyle = col; ctx.strokeStyle = col;
    /* 북극성 — 더 맑게 · 십자 빛 */
    const pt = MOVE() ? 0.8 + 0.2 * Math.sin(now * 0.0011) : 0.9;
    ctx.globalAlpha = 0.9 * pt; ctx.drawImage(GLOW, pole.x - 22, pole.y - 22, 44, 44);
    ctx.globalAlpha = pt; ctx.fillStyle = '#FFF6D6'; ctx.beginPath(); ctx.arc(pole.x, pole.y, 2.6, 0, 6.2832); ctx.fill();
    ctx.globalAlpha = 0.7 * pt; ctx.strokeStyle = '#FFF6D6'; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(pole.x - 15, pole.y); ctx.lineTo(pole.x + 15, pole.y); ctx.moveTo(pole.x, pole.y - 15); ctx.lineTo(pole.x, pole.y + 15); ctx.stroke();
    ctx.fillStyle = col; ctx.strokeStyle = col;""")
rep("""  const col = getComputedStyle(document.documentElement).getPropertyValue('--star').trim() || '#DCE5FF';""",
"""  const col = getComputedStyle(document.documentElement).getPropertyValue('--star').trim() || '#DCE5FF';
  /* 번지는 빛 한 장을 미리 그려 두고 밝은 별마다 찍음(가벼움) */
  const GLOW = document.createElement('canvas'); GLOW.width = GLOW.height = 32;
  { const g2 = GLOW.getContext('2d'); if (g2) { const gr = g2.createRadialGradient(16, 16, 0, 16, 16, 16); gr.addColorStop(0, 'rgba(255,248,228,.95)'); gr.addColorStop(0.22, 'rgba(255,248,228,.38)'); gr.addColorStop(1, 'rgba(255,248,228,0)'); g2.fillStyle = gr; g2.fillRect(0, 0, 32, 32); } }""")

# ── 하늘 판: 금빛 별 셋에 하나꼴로 빛 테가 천천히 커졌다 작아짐(별마다 다른 때) · 진짜 차오름 별에 45도 기운 옅은 빛살 ──
rep("""    if (intro) el.style.animationDelay = (Math.random() * 0.9).toFixed(2) + 's';""",
    """    if (intro) el.style.animationDelay = (Math.random() * 0.9).toFixed(2) + 's';
    if (Math.random() < 0.34) { el.setAttribute('data-tw', '1'); el.style.setProperty('--twd', (-Math.random() * 5).toFixed(2) + 's'); }""")
rep("""s('circle', {cx: cx.toFixed(1), cy: cy.toFixed(1), r: 18, class: 'glow'}), sparkle(cx, cy, 11, 'real'));""",
    """s('circle', {cx: cx.toFixed(1), cy: cy.toFixed(1), r: 18, class: 'glow'}), flare(cx, cy), sparkle(cx, cy, 11, 'real'));""", 2)
rep("""function sparkle(cx, cy, r, cls) {""", """/* 8판 — 진짜 차오름 별 뒤의 옅은 빛살(45도 기운 큰 별 · 천천히 숨 쉼) */
function flare(cx, cy) { const g = s('g', {transform: `rotate(45 ${(+cx).toFixed(1)} ${(+cy).toFixed(1)})`, 'aria-hidden': 'true'}); g.append(sparkle(+(+cx).toFixed(1), +(+cy).toFixed(1), 21, 'flare')); return g; }
function sparkle(cx, cy, r, cls) {""")

# ── 그래프 별: 빛 번짐 · 천천히 반짝 ──
rep("""  svg.append(s('circle', {cx: ex.toFixed(1), cy: ey.toFixed(1), r: 17, class: 'halo'}), sparkle(+hx.toFixed(1), +hy.toFixed(1), 7.5, 'hi'), sparkle(+lx.toFixed(1), +ly.toFixed(1), 7.5, 'lo'), sparkle(+ex.toFixed(1), +ey.toFixed(1), 10, 'nowp'));""",
    """  svg.append(s('circle', {cx: hx.toFixed(1), cy: hy.toFixed(1), r: 12, class: 'halo r'}), s('circle', {cx: lx.toFixed(1), cy: ly.toFixed(1), r: 12, class: 'halo b'}), s('circle', {cx: ex.toFixed(1), cy: ey.toFixed(1), r: 18, class: 'halo'}), sparkle(+hx.toFixed(1), +hy.toFixed(1), 7.5, 'hi tw'), sparkle(+lx.toFixed(1), +ly.toFixed(1), 7.5, 'lo tw'), sparkle(+ex.toFixed(1), +ey.toFixed(1), 10, 'nowp'));""")
rep("""      svg.append(s('rect', {x: cx - 7, y: (up ? e : base).toFixed(1), width: 14, height: hgt.toFixed(1), class: 'yb pl ' + t + (up ? '' : ' neg')}), sparkle(cx, +e.toFixed(1), 8, 'cap ' + t));""",
    """      svg.append(s('rect', {x: cx - 7, y: (up ? e : base).toFixed(1), width: 14, height: hgt.toFixed(1), class: 'yb pl ' + t + (up ? '' : ' neg')}), s('circle', {cx, cy: e.toFixed(1), r: 13, class: 'halo ' + (t === 'g' ? '' : t === 'b' ? 'b' : 'w')}), sparkle(cx, +e.toFixed(1), 8, 'cap tw ' + t));""")
rep("""s('circle', {cx: mxp.toFixed(1), cy: myp.toFixed(1), r: 22, class: 'halo'})""", """s('circle', {cx: mxp.toFixed(1), cy: myp.toFixed(1), r: 26, class: 'halo'})""")
# 그래프 별밭 조금 더 밝게
rep("class: 'cf', opacity: (0.12 + rnd() * 0.3).toFixed(2)}));", "class: 'cf', opacity: (0.18 + rnd() * 0.42).toFixed(2)}));")

# 정의 — 빨강 · 파랑 · 흰 빛 번짐
rep('<radialGradient id="starglow">', '<radialGradient id="redglow"><stop offset="0" stop-color="#FF6A3D" stop-opacity=".5"/><stop offset=".45" stop-color="#FF6A3D" stop-opacity=".14"/><stop offset="1" stop-color="#FF6A3D" stop-opacity="0"/></radialGradient><radialGradient id="blueglow"><stop offset="0" stop-color="#5EA2FF" stop-opacity=".5"/><stop offset=".45" stop-color="#5EA2FF" stop-opacity=".14"/><stop offset="1" stop-color="#5EA2FF" stop-opacity="0"/></radialGradient><radialGradient id="whiteglow"><stop offset="0" stop-color="#E3EBFF" stop-opacity=".5"/><stop offset=".45" stop-color="#E3EBFF" stop-opacity=".14"/><stop offset="1" stop-color="#E3EBFF" stop-opacity="0"/></radialGradient><radialGradient id="starglow">')

# CSS
rep(".halo { fill: url(#starglow); }", """.halo { fill: url(#starglow); } .halo.r { fill: url(#redglow); } .halo.b { fill: url(#blueglow); } .halo.w { fill: url(#whiteglow); }
/* 8판 — 초롱초롱(3.5 ~ 7초에 한 번 · 움직임을 끄면 멈춤) */
.flare { fill: var(--sheen); opacity: .28; }
.mo-on .flare { animation: flareb 5.2s ease-in-out infinite; transform-box: fill-box; transform-origin: center; }
@keyframes flareb { 0%, 100% { opacity: .16; transform: scale(.9); } 50% { opacity: .42; transform: scale(1.06); } }
.mo-on .skyin .st.S[data-tw] { animation: halotw 4.6s ease-in-out infinite; animation-delay: var(--twd, 0s); }
@keyframes halotw { 0%, 100% { stroke: rgba(242, 196, 106, .2); stroke-width: 3.4; } 50% { stroke: rgba(255, 226, 150, .55); stroke-width: 7; } }
.mo-on .tw { animation: twk 4.2s ease-in-out infinite; transform-box: fill-box; transform-origin: center; }
@keyframes twk { 0%, 100% { transform: scale(1); } 50% { transform: scale(1.16); } }
.mo-on .hbar i::after { animation: headtw 3.8s ease-in-out infinite; }
.mo-on .hb:nth-child(2n) .hbar i::after { animation-delay: -1.3s; } .mo-on .hb:nth-child(3n) .hbar i::after { animation-delay: -2.4s; }
@keyframes headtw { 0%, 100% { opacity: .82; transform: scale(1); } 50% { opacity: 1; transform: scale(1.22); } }
.hero em, .realcard .nm { text-shadow: 0 0 22px rgba(242, 196, 106, .32); }""")
rep(".hbar i::after { content: \"\"; position: absolute; right: -5px; top: 50%; width: 10px; height: 10px; margin-top: -5px; border-radius: 50%; background: var(--star); box-shadow: 0 0 6px 2px rgba(143, 160, 196, .55); }",
    ".hbar i::after { content: \"\"; position: absolute; right: -5px; top: 50%; width: 10px; height: 10px; margin-top: -5px; border-radius: 50%; background: #F4F7FF; box-shadow: 0 0 8px 3px rgba(190, 205, 240, .6), 0 0 18px 4px rgba(143, 160, 196, .25); }")
rep(".hb.me .hbar i::after, .bar100 .hbar i.t1::after { background: var(--sheen); box-shadow: 0 0 8px 3px rgba(242, 196, 106, .7); }",
    ".hb.me .hbar i::after, .bar100 .hbar i.t1::after { background: #FFFBEA; box-shadow: 0 0 10px 4px rgba(242, 196, 106, .75), 0 0 22px 6px rgba(242, 196, 106, .3); }")
rep(".st.S { fill: var(--wax); opacity: .95; stroke: rgba(242, 196, 106, .22); stroke-width: 3.4; }", ".st.S { fill: #F7CF7A; opacity: 1; stroke: rgba(242, 196, 106, .24); stroke-width: 3.4; }")
open(p,'w',encoding='utf-8').write(s); print('patched 18')
