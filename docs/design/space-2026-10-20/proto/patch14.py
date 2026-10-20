# 6판 ② 아름답게 — 새긴 별자리판(천상열차분야지도의 가는 금 · 겹 둘레) · 금박 금빛 · 깊은 남색 밤 · 머리카락 같은 선
import sys
p=sys.argv[1]; s=open(p,encoding='utf-8').read()
def rep(a,b,n=1):
    global s
    c=s.count(a); assert c==n,(c,a[:90]); s=s.replace(a,b)
# 색
rep("  --sky: #060A14; --sky-2: #0C1322; --sky-3: #141D33; --line: #243050;", "  --sky: #070B17; --sky-2: #0D1428; --sky-3: #141C36; --line: rgba(150, 170, 220, .17); --line-2: rgba(150, 170, 220, .28);")
rep("  --moon: #F3E7C8; --wax: #FFC857; --wax-soft: rgba(255, 200, 87, .10);", "  --moon: #F1E6C8; --wax: #F2C46A; --wax-soft: rgba(242, 196, 106, .10);")
rep("  --frame: #9C8456; --frame-soft: rgba(156, 132, 86, .45);", "  --frame: #A88A55; --frame-soft: rgba(168, 138, 85, .38);")
rep("--moon-base: #101A30; --moon-edge: #3A4766; --star: #DCE5FF; --sky-glow: #101A33;", "--moon-base: #0F1830; --moon-edge: #3A4766; --star: #DCE5FF; --sky-glow: #121C3C; --cool: #8FA0C4;")
# 밤 바탕 — 위쪽에만 아주 옅은 남빛 · 보랏빛 안개(반복 없음)
rep("html, body { background: var(--sky); color: var(--ink); }", "html { background: radial-gradient(120% 55% at 88% -6%, rgba(72, 96, 186, .22) 0%, rgba(72, 96, 186, 0) 62%) no-repeat, radial-gradient(80% 45% at -12% 26%, rgba(118, 84, 170, .10) 0%, rgba(118, 84, 170, 0) 60%) no-repeat, var(--sky); color: var(--ink); }\nbody { background: transparent; color: var(--ink); }")
rep("body { margin: 0; font-family: var(--sans); font-size: var(--fs-2); line-height: 1.55;", "body { margin: 0; font-family: var(--sans); font-size: var(--fs-2); line-height: 1.6;")
rep("#stars { position: fixed; inset: 0; width: 100%; height: 100%; z-index: 0; pointer-events: none; }", "#stars { position: fixed; inset: 0; width: 100%; height: 100%; z-index: 0; pointer-events: none; }\n.defs { position: absolute; width: 0; height: 0; overflow: hidden; }")
rep("background: rgba(6, 10, 20, .88); border-bottom: 1px solid var(--line);", "background: rgba(7, 11, 23, .82); border-bottom: 1px solid var(--line);")
# 글씨
rep(".eyebrow { margin: 0; color: var(--dim); font-size: var(--fs-1); letter-spacing: .03em; }", ".eyebrow { margin: 0; color: var(--faint); font-size: var(--fs-1); letter-spacing: .02em; }")
rep(".hero { margin: 0; font-family: var(--serif); font-size: var(--fs-6); font-weight: 700; line-height: 1.18; text-wrap: balance; }", ".hero { margin: 0; font-family: var(--serif); font-size: var(--fs-6); font-weight: 700; line-height: 1.22; letter-spacing: -.01em; text-wrap: balance; }")
# 하늘 판 — 금빛 가는 두 줄 테 · 새긴 선
rep(".sky { position: relative; margin: 0; border: 1px solid var(--frame); border-radius: 8px; padding: 6px; background: radial-gradient(120% 90% at 30% 25%, var(--sky-glow) 0%, var(--sky) 70%); box-shadow: inset 0 0 0 5px var(--sky), inset 0 0 0 6px var(--frame-soft); }",
    ".sky { position: relative; margin: 0; border: 1px solid var(--frame); border-radius: 6px; padding: 7px; background: radial-gradient(120% 90% at 28% 22%, var(--sky-glow) 0%, var(--sky) 72%); box-shadow: inset 0 0 0 6px var(--sky), inset 0 0 0 7px var(--frame-soft); }")
rep(".ov { position: absolute; z-index: 2; font-size: var(--fs-1); line-height: 1.2;", ".ov { position: absolute; z-index: 2; font-family: var(--serif); font-size: var(--fs-1); line-height: 1.2;")
rep(".ax { stroke: var(--line); stroke-width: 1.2; }", ".ax { stroke: rgba(200, 212, 240, .16); stroke-width: 1; }")
rep(".orbit { fill: none; stroke: var(--faint); stroke-width: 1; stroke-dasharray: 3 7; opacity: .7; }", ".orbit { fill: none; stroke: var(--moon); stroke-width: .9; opacity: .26; }\n.orbit2 { fill: none; stroke: var(--moon); stroke-width: .8; stroke-dasharray: 1 5; stroke-linecap: round; opacity: .3; }\n.tick { stroke: var(--moon); stroke-width: .8; opacity: .22; }")
rep(".arw { fill: var(--faint); opacity: .8; }", ".arw { fill: var(--moon); opacity: .42; }")
rep(".zone-s { fill: var(--wax-soft); }", ".zone-s { fill: url(#zoneglow); }")
rep(".st.S { fill: var(--wax); opacity: .9; }", ".st.S { fill: var(--wax); opacity: .95; stroke: rgba(242, 196, 106, .22); stroke-width: 3.4; }")
rep(".st.B { fill: var(--moon); opacity: .85; }", ".st.B { fill: var(--moon); opacity: .82; }")
rep(".st.W, .st.Q { fill: var(--faint); opacity: .75; }", ".st.W, .st.Q { fill: var(--cool); opacity: .55; }")
rep(".strail { fill: none; stroke-width: 1.3; opacity: .5; stroke-linecap: round; stroke-linejoin: round; }", ".strail { fill: none; stroke-width: 1; opacity: .36; stroke-linecap: round; stroke-linejoin: round; }")
rep(".strail.S { stroke: var(--wax); } .strail.B { stroke: var(--moon); } .strail.W, .strail.Q { stroke: var(--faint); opacity: .35; }", ".strail.S { stroke: var(--wax); } .strail.B { stroke: var(--moon); } .strail.W, .strail.Q { stroke: var(--cool); opacity: .16; }")
rep(".ov.month { font-family: var(--serif); font-size: var(--fs-6); font-weight: 700; color: var(--moon); opacity: .16; text-shadow: none; }", ".ov.month { font-family: var(--serif); font-size: var(--fs-5); font-weight: 700; color: var(--moon); opacity: .1; text-shadow: none; }")
# 판 · 칸 — 머리카락 같은 선 · 옅은 남빛 바탕
rep(".speak { display: flex; flex-direction: column; gap: 10px; padding: var(--sp-2); border: 1px solid var(--line); border-radius: var(--r); background: rgba(12, 19, 34, .75); }", ".speak { display: flex; flex-direction: column; gap: 10px; padding: var(--sp-2); border: 1px solid var(--line); border-radius: var(--r); background: rgba(13, 20, 40, .55); }")
rep(".capsule { display: flex; flex-direction: column; gap: 12px; padding: var(--sp-2); border: 1px solid var(--frame); border-radius: var(--r); background: rgba(12, 19, 34, .8); }", ".capsule { display: flex; flex-direction: column; gap: 12px; padding: var(--sp-2); border: 1px solid var(--frame-soft); border-radius: var(--r); background: rgba(13, 20, 40, .6); }")
rep(".lens { display: flex; flex-direction: column; gap: 12px; padding: var(--sp-2); border: 1px solid var(--wax); border-radius: var(--r); background: var(--sky-2); }", ".lens { display: flex; flex-direction: column; gap: 12px; padding: var(--sp-2); border: 1px solid rgba(242, 196, 106, .55); border-radius: var(--r); background: rgba(13, 20, 40, .92); }")
rep(".realcard { display: flex; align-items: center; gap: var(--sp-2); min-height: 96px; padding: var(--sp-2); border: 1px solid var(--wax); border-radius: var(--r); background: linear-gradient(180deg, rgba(255, 200, 87, .08), rgba(255, 200, 87, .02));", ".realcard { display: flex; align-items: center; gap: var(--sp-2); min-height: 96px; padding: var(--sp-2); border: 1px solid rgba(242, 196, 106, .6); border-radius: var(--r); background: radial-gradient(120% 140% at 0% 0%, rgba(242, 196, 106, .12), rgba(242, 196, 106, .02) 70%);")
rep(".cond li { display: flex; align-items: flex-start; gap: 12px; padding: 12px 14px; border: 1px solid var(--line); border-radius: 14px; }", ".cond li { display: flex; align-items: flex-start; gap: 12px; padding: 12px 14px; border: 1px solid var(--line); border-radius: 14px; background: rgba(13, 20, 40, .4); }")
rep(".cond li.on { border-color: rgba(255, 200, 87, .55); background: var(--wax-soft); }", ".cond li.on { border-color: rgba(242, 196, 106, .5); background: var(--wax-soft); }")
# 안 쓰는 당기기 움직임 지움
rep("@keyframes zoomin { from { transform: scale(.93); filter: blur(4px); } }\n", "")
rep("@keyframes zoomout { from { transform: scale(1.06); filter: blur(3px); } }\n", "")
# 새긴 판의 정의(그라데이션) — 글 속 style 없이 SVG 속성으로만
rep('<canvas id="stars" aria-hidden="true"></canvas>', '<canvas id="stars" aria-hidden="true"></canvas>\n<svg class="defs" aria-hidden="true" focusable="false"><defs><radialGradient id="zoneglow" cx="55%" cy="55%" r="75%"><stop offset="0" stop-color="#F2C46A" stop-opacity=".15"/><stop offset=".7" stop-color="#F2C46A" stop-opacity=".04"/><stop offset="1" stop-color="#F2C46A" stop-opacity="0"/></radialGradient></defs></svg>')
# 궤도 — 겹 둘레 · 새긴 눈금 스물넷(천상열차분야지도의 둘레처럼)
rep("""  og.append(s('circle', {cx: x5, cy: y0, r: R, class: 'orbit'}));""",
"""  og.append(s('circle', {cx: x5, cy: y0, r: R, class: 'orbit'}), s('circle', {cx: x5, cy: y0, r: R + 7, class: 'orbit2'}));
  for (let k = 0; k < 24; k++) { const a = k * Math.PI / 12, c = Math.cos(a), sn = Math.sin(a), r1 = R + 2, r2 = R + (k % 6 ? 5 : 9); og.append(s('line', {x1: (x5 + c * r1).toFixed(1), y1: (y0 + sn * r1).toFixed(1), x2: (x5 + c * r2).toFixed(1), y2: (y0 + sn * r2).toFixed(1), class: 'tick'})); }""")
rep("const arrow = (x, y, ang) => s('path', {d: 'M-6 -5 L6 0 L-6 5 Z', class: 'arw',", "const arrow = (x, y, ang) => s('path', {d: 'M-4.5 -3.6 L4.5 0 L-4.5 3.6 Z', class: 'arw',")
open(p,'w',encoding='utf-8').write(s); print('patched 14')
