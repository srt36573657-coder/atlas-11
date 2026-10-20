# 7판 ② 우주 그래프 — 사장님 19:36 「똑똑 우주 어!」: 지나온 길 = 별이 지나온 빛길 · 이웃 별 / 커 왔을까 = 빛줄기 끝에 별 · 흔들림 = 달이 지나는 하늘길
# 길이 · 높이 · 자리는 그대로 값을 나타냄(모양만 우주) — 지난 기록만
import sys
p=sys.argv[1]; s=open(p,encoding='utf-8').read()
def rep(a,b,n=1):
    global s
    c=s.count(a); assert c==n,(c,a[:90]); s=s.replace(a,b)

# ① 지나온 길 — 그래프 안 작은 별밭 · 빛 번짐 · 옛날은 옅고 오늘로 올수록 밝은 빛길 · 높을 때 빨간 별 · 낮을 때 파란 별 · 오늘 금빛 별
rep("""  svg.append(s('path', {d: `M${px(P[0][0]).toFixed(1)},${yb} L${pts.join(' L')} L${px(P[n - 1][0]).toFixed(1)},${yb} Z`, class: 'ar fade'}), s('polyline', {points: pts.join(' '), class: 'ln draw', pathLength: 1000}));""",
"""  let sd = [...String(c)].reduce((a2, ch) => (a2 * 31 + ch.charCodeAt(0)) % 2147483647, 7) || 7; const rnd = () => (sd = (sd * 16807) % 2147483647) / 2147483647;
  for (let k = 0; k < 34; k++) svg.append(s('circle', {cx: (rnd() * W).toFixed(1), cy: (rnd() * H).toFixed(1), r: (0.5 + rnd() * 0.8).toFixed(2), class: 'cf', opacity: (0.12 + rnd() * 0.3).toFixed(2)}));
  svg.append(s('polyline', {points: pts.join(' '), class: 'lnglow'}), s('polyline', {points: pts.join(' '), class: 'ln trail2 draw', pathLength: 1000}));""")
rep("""  svg.append(s('circle', {cx: ex.toFixed(1), cy: ey.toFixed(1), r: 13, class: 'halo'}), s('circle', {cx: hx.toFixed(1), cy: hy.toFixed(1), r: 4.5, class: 'hi'}), s('circle', {cx: lx.toFixed(1), cy: ly.toFixed(1), r: 4.5, class: 'lo'}), s('circle', {cx: ex.toFixed(1), cy: ey.toFixed(1), r: 5.5, class: 'nowp'}));""",
    """  svg.append(s('circle', {cx: ex.toFixed(1), cy: ey.toFixed(1), r: 17, class: 'halo'}), sparkle(+hx.toFixed(1), +hy.toFixed(1), 7.5, 'hi'), sparkle(+lx.toFixed(1), +ly.toFixed(1), 7.5, 'lo'), sparkle(+ex.toFixed(1), +ey.toFixed(1), 10, 'nowp'));""")

# ③ 커 왔을까 — 빛기둥(바닥은 옅고 끝은 밝음) 끝에 별 · 지난해 은빛 · 마지막 해 금빛 · 손해는 아래로 파란 빛
i=s.find("    vals.forEach((v, k) => {\n      if (v == null) return;\n      const hgt = Math.max(1.5, Math.abs(v) / mx * span), cx = 50 + k * 100, x0 = cx - 12"); assert i>0
j=s.find("    });\n", i); assert j>0
s=s[:i]+"""    vals.forEach((v, k) => {
      if (v == null) return;
      const hgt = Math.max(1.5, Math.abs(v) / mx * span), cx = 50 + k * 100, up = v >= 0, e = up ? base - hgt : base + hgt, t = v < 0 ? 'b' : k === vals.length - 1 ? 'g' : 's';
      svg.append(s('rect', {x: cx - 7, y: (up ? e : base).toFixed(1), width: 14, height: hgt.toFixed(1), class: 'yb pl ' + t + (up ? '' : ' neg')}), sparkle(cx, +e.toFixed(1), 8, 'cap ' + t));
    });
"""+s[j+len("    });\n"):]

# ④ 흔들림 — 달이 지나는 하늘길(반원) · 왼쪽 땅끝 = 1년 가장 낮을 때(파랑) · 오른쪽 = 가장 높을 때(빨강) · 눈금 열한 개(10%마다) · 지금 = 금빛 달
rep("""  const band = h('figure', {class: 'band chart'}); const svg = s('svg', {viewBox: '0 0 300 44', role: 'img',""", """  const band = h('figure', {class: 'band chart'}); const svg = s('svg', {viewBox: '0 0 300 150', role: 'img',""")
rep("""  const kx = Math.max(12, Math.min(288, pos * 300)).toFixed(1);
  svg.append(s('rect', {x: 2, y: 18, width: 296, height: 8, rx: 4, class: 'bb'}), s('circle', {cx: kx, cy: 22, r: 17, class: 'halo'}), s('circle', {cx: kx, cy: 22, r: 8.5, class: 'bn'}));""",
"""  const AX = 150, AY = 134, AR = 112, pp = Math.max(0, Math.min(1, pos)), th = Math.PI * (1 - pp), mxp = AX + AR * Math.cos(th), myp = AY - AR * Math.sin(th);
  svg.append(s('line', {x1: 8, y1: AY, x2: 292, y2: AY, class: 'hz'}), s('path', {d: `M${AX - AR} ${AY} A${AR} ${AR} 0 0 1 ${AX + AR} ${AY}`, class: 'arcg'}), s('path', {d: `M${AX - AR} ${AY} A${AR} ${AR} 0 0 1 ${AX + AR} ${AY}`, class: 'arc'}));
  for (let k = 0; k <= 10; k++) { const a = Math.PI * (1 - k / 10), c1 = Math.cos(a), s1 = Math.sin(a), r1 = AR + 5, r2 = AR + (k % 5 ? 10 : 15); svg.append(s('line', {x1: (AX + c1 * r1).toFixed(1), y1: (AY - s1 * r1).toFixed(1), x2: (AX + c1 * r2).toFixed(1), y2: (AY - s1 * r2).toFixed(1), class: 'atk'})); }
  svg.append(s('circle', {cx: mxp.toFixed(1), cy: myp.toFixed(1), r: 22, class: 'halo'}), s('circle', {cx: mxp.toFixed(1), cy: myp.toFixed(1), r: 10, class: 'bn'}));""")
rep("h('p', {class: 'sub'}, `지금 ${won(C.f1)} · 금빛 동그라미예요.`)", "h('p', {class: 'sub'}, `지금 ${won(C.f1)} · 하늘길 위 금빛 달이에요.`)")

# ⑤ 작은 선 — 끝을 별로
rep("s('circle', {cx: X(k).toFixed(1), cy: Y(l[k]).toFixed(1), r: 3.6, class: 'se ' + cls3(d10)})", "sparkle(+X(k).toFixed(1), +Y(l[k]).toFixed(1), 5.2, 'se ' + cls3(d10))")

# 정의(그라데이션) 다섯
rep('<radialGradient id="starglow">', '<linearGradient id="trailgrad" gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="360" y2="0"><stop offset="0" stop-color="#F1E6C8" stop-opacity=".28"/><stop offset=".75" stop-color="#F1E6C8" stop-opacity=".85"/><stop offset="1" stop-color="#FFF6D6" stop-opacity="1"/></linearGradient><linearGradient id="pillarS" x1="0" y1="1" x2="0" y2="0"><stop offset="0" stop-color="#8FA0C4" stop-opacity=".04"/><stop offset="1" stop-color="#8FA0C4" stop-opacity=".8"/></linearGradient><linearGradient id="pillarG" x1="0" y1="1" x2="0" y2="0"><stop offset="0" stop-color="#F2C46A" stop-opacity=".05"/><stop offset="1" stop-color="#F2C46A" stop-opacity=".95"/></linearGradient><linearGradient id="pillarB" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#5EA2FF" stop-opacity=".05"/><stop offset="1" stop-color="#5EA2FF" stop-opacity=".9"/></linearGradient><linearGradient id="arcgrad" gradientUnits="userSpaceOnUse" x1="38" y1="0" x2="262" y2="0"><stop offset="0" stop-color="#5EA2FF"/><stop offset=".5" stop-color="#8C97AC"/><stop offset="1" stop-color="#FF6A3D"/></linearGradient><radialGradient id="starglow">')

# CSS — 빛길 · 빛줄기 · 빛기둥 · 하늘길
rep(".hbar { display: block; height: 10px; border-radius: 0 5px 5px 0; background: rgba(150, 170, 220, .10); }\n.hbar i { display: block; height: 100%; border-radius: 0 5px 5px 0; background: var(--cool); opacity: .8; }\n.hb.me .hbar i, .bar100 .hbar i.t1 { background: var(--wax); opacity: 1; }",
""".hbar { display: block; position: relative; height: 12px; margin-right: 6px; background: linear-gradient(rgba(150, 170, 220, .14), rgba(150, 170, 220, .14)) center / 100% 1px no-repeat; }
.hbar i { display: block; position: relative; height: 4px; margin-top: 4px; border-radius: 2px; background: linear-gradient(90deg, rgba(143, 160, 196, 0), rgba(143, 160, 196, .85)); }
.hbar i::after { content: ""; position: absolute; right: -5px; top: 50%; width: 10px; height: 10px; margin-top: -5px; border-radius: 50%; background: var(--star); box-shadow: 0 0 6px 2px rgba(143, 160, 196, .55); }
.hb.me .hbar i, .bar100 .hbar i.t1 { background: linear-gradient(90deg, rgba(242, 196, 106, 0), rgba(242, 196, 106, .95)); }
.hb.me .hbar i::after, .bar100 .hbar i.t1::after { background: var(--sheen); box-shadow: 0 0 8px 3px rgba(242, 196, 106, .7); }""")
rep(".g3 .yb { fill: var(--cool); opacity: .78; } .g3 .yb.last { fill: var(--wax); opacity: 1; } .g3 .yb.neg { fill: var(--down); opacity: .85; }",
    ".g3 .pl.s { fill: url(#pillarS); } .g3 .pl.g { fill: url(#pillarG); } .g3 .pl.b { fill: url(#pillarB); }\n.g3 .cap { stroke: var(--sky); stroke-width: 1.2; } .g3 .cap.s { fill: var(--star); } .g3 .cap.g { fill: var(--wax); } .g3 .cap.b { fill: var(--down); }\n.mo-on .page.enter .g3 .cap { animation: fadein .6s ease-out .95s both; }")
rep(".band .bb { fill: url(#rangegrad); }", ".band .hz { stroke: rgba(200, 212, 240, .22); stroke-width: 1; }\n.band .arc { fill: none; stroke: url(#arcgrad); stroke-width: 3; stroke-linecap: round; opacity: .85; }\n.band .arcg { fill: none; stroke: url(#arcgrad); stroke-width: 12; stroke-linecap: round; opacity: .12; }\n.band .atk { stroke: var(--moon); stroke-width: 1; opacity: .3; }")
rep(".ar { fill: url(#areamoon); }", ".ar { fill: url(#areamoon); }\n.cf { fill: var(--star); }\n.lnglow { fill: none; stroke: var(--moon); stroke-width: 7; stroke-linejoin: round; stroke-linecap: round; opacity: .09; }\n.ln.trail2 { stroke: url(#trailgrad); stroke-width: 1.8; }")
rep(".hi, .lo, .nowp { stroke: var(--sky); stroke-width: 2; }", ".hi, .lo, .nowp { stroke: var(--sky); stroke-width: 1.5; }")
rep(".spark .se { stroke: var(--sky); stroke-width: 1.5; }", ".spark .se { stroke: var(--sky); stroke-width: 1; }")
open(p,'w',encoding='utf-8').write(s); print('patched 17')
