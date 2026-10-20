# 6판 ① 천천히 · 차분히 — 사장님 2026-10-20 18:53 「좀 천천히좀 돌아야해 차분히」
import sys
p=sys.argv[1]; s=open(p,encoding='utf-8').read()
def rep(a,b,n=1):
    global s
    c=s.count(a); assert c==n,(c,a[:90]); s=s.replace(a,b)

# ── 1년 하늘: 되감기 없앰 · 천천히 떠나 천천히 닿음 · 끝(오늘)에서 쉼 · 살며시 감췄다가 처음에서 ──
rep("""  const stopAll = () => { if (raf) cancelAnimationFrame(raf); if (timer) clearTimeout(timer); clearTimeout(hold); raf = 0; timer = 0; hold = 0; };""",
    """  const stopAll = () => { if (raf) cancelAnimationFrame(raf); if (timer) clearTimeout(timer); clearTimeout(hold); raf = 0; timer = 0; hold = 0; box.classList.remove('dim'); };""")
rep("""  function runTo(target, speed, done) {
    let last = performance.now();
    const step = now => {
      const d = Math.min(0.1, (now - last) / 1000) * speed; last = now;
      const nf = target > f ? Math.min(target, f + d) : Math.max(target, f - d); setDay(nf);
      if (nf !== target) raf = visible ? requestAnimationFrame(step) : 0; else { raf = 0; if (done) done(); }
    };
    raf = requestAnimationFrame(step);
  }
  function cycle() {
    stopAll(); if (!auto || !visible) return;
    trailsOn = false; trails.classList.add('off');
    const Y1 = mode === 'y';
    runTo(0, Y1 ? 22 : 3.4, () => { showTrails(); runTo(last(), Y1 ? 3.2 : 1.05, () => { fadeTrails(); hold = setTimeout(cycle, 2800); }); });
  }""",
"""  /* 6판 — 천천히 떠나 천천히 닿음(코사인 고르기) · 빠르기는 장/초 */
  const ease = u => 0.5 - 0.5 * Math.cos(Math.PI * u);
  function runTo(target, speed, done) {
    const from = f, dur = Math.max(1, Math.abs(target - from) / speed * 1000); let t0 = 0;
    const step = now => {
      if (!t0) t0 = now;
      const u = Math.min(1, (now - t0) / dur); setDay(from + (target - from) * ease(u));
      if (u < 1) raf = visible ? requestAnimationFrame(step) : 0; else { raf = 0; if (done) done(); }
    };
    raf = requestAnimationFrame(step);
  }
  /* 1년 = 51장을 약 36초에 · 엿새 = 약 9초에 · 끝(오늘)에서 4.5초 쉼 · 되감지 않고 별을 살며시 감췄다가 처음 자리에서 다시 띄움 */
  const SPEED = () => (mode === 'y' ? 1.4 : 0.55);
  function cycle() {
    stopAll(); if (!auto || !visible) return;
    if (f >= last() - 0.001) hold = setTimeout(() => { hold = 0; rest(); }, 1800); else go();
  }
  function go() {
    if (!auto || !visible) return;
    showTrails(); runTo(last(), SPEED(), () => { fadeTrails(); hold = setTimeout(() => { hold = 0; rest(); }, 4500); });
  }
  function rest() {
    if (!auto || !visible) return;
    box.classList.add('dim');
    hold = setTimeout(() => { trailsOn = false; trails.classList.add('off'); setDay(0); box.classList.remove('dim'); hold = setTimeout(() => { hold = 0; go(); }, 1200); }, 950);
  }""")
rep("timer = setTimeout(tick, mode === 'y' ? 260 : 800);", "timer = setTimeout(tick, mode === 'y' ? 480 : 1100);")
rep("const tail = mode === 'y' ? 2.6 : 1.2, stepT = mode === 'y' ? 0.3 : 0.15;", "const tail = mode === 'y' ? 1.6 : 0.9, stepT = mode === 'y' ? 0.2 : 0.15;")
rep("const g = s('g', {'aria-hidden': 'true'}), inner = s('g', {class: intro ? 'ignite' : ''});", "const g = s('g', {'aria-hidden': 'true', class: 'rl'}), inner = s('g', {class: intro ? 'ignite' : ''});")
rep("setInterval(() => { mt += 0.045; lit.setAttribute('d', moonD(36, 36, 15, 0.38 + 0.26 * Math.sin(mt), 'R')); }, 60)",
    "setInterval(() => { mt += 0.03; lit.setAttribute('d', moonD(36, 36, 15, 0.4 + 0.16 * Math.sin(mt), 'R')); }, 90)")

# ── 뒤 별 하늘: 더 느리게 돎 · 반짝임 작게 · 별똥별 드물고 느리게 · 순간이동(별이 스치는 것) 없앰 ──
rep("if (MOVE()) ang -= dt * 0.000012;", "if (MOVE()) ang -= dt * 0.000008;")
rep("ctx.globalAlpha = st.a * (MOVE() ? 0.6 + 0.4 * Math.sin(st.p + now * 0.0011 * st.w) : 1);", "ctx.globalAlpha = st.a * (MOVE() ? 0.82 + 0.18 * Math.sin(st.p + now * 0.0006 * st.w) : 1);")
rep("vx: -(0.17 + Math.random() * 0.1), vy: 0.09 + Math.random() * 0.07, t0: now};", "vx: -(0.10 + Math.random() * 0.05), vy: 0.05 + Math.random() * 0.04, t0: now};")
rep("const age = now - met.t0, life = 2000, x = met.x + met.vx * age, y = met.y + met.vy * age, L = 300;", "const age = now - met.t0, life = 2800, x = met.x + met.vx * age, y = met.y + met.vy * age, L = 220;")
rep("gr.addColorStop(0, 'rgba(255,244,220,.9)');", "gr.addColorStop(0, 'rgba(255,244,220,.75)');")
rep("if (age > life) { met = null; nextMet = now + 5000 + Math.random() * 6000; }", "if (age > life) { met = null; nextMet = now + 16000 + Math.random() * 12000; }")
rep("nextMet = performance.now() + 2500;", "nextMet = performance.now() + 6000;")
rep("met = null; nextMet = performance.now() + 5000; return true; }};", "met = null; nextMet = performance.now() + 16000; return true; }};")
rep("return {warp(dir) { if (FULL()) warp = {dir, t0: performance.now()}; }, start, still,", "return {warp() { /* 6판 — 별이 스치는 순간이동은 없앰(차분히) */ }, start, still,")

# ── 글판 움직임: 하나씩 솟는 것 · 당기기 · 번쩍임 · 흔들림 · 튀는 것을 걷고 살며시 나타나기만 ──
rep(".mo-on .page.enter > * { animation: rise .55s cubic-bezier(.2, .7, .2, 1) both; animation-delay: calc(var(--i, 0) * 70ms); }\n", ".mo-on .page.enter { animation: fadein .6s ease-out both; }\n")
rep(".mo-on .page.enter .rows > * { animation: rise .5s cubic-bezier(.2, .7, .2, 1) both; animation-delay: calc(var(--j, 0) * 55ms + 180ms); }\n", "")
rep("@keyframes rise { from { opacity: 0; transform: translateY(16px); } }", "@keyframes rise { from { opacity: 0; transform: translateY(6px); } }")
rep(".mo-full .page.enter.deep { animation: zoomin .55s cubic-bezier(.2, .7, .2, 1) both; }", ".mo-full .page.enter.deep { animation: fadein .6s ease-out both; }")
rep(".mo-full .page.enter.back-in { animation: zoomout .5s cubic-bezier(.2, .7, .2, 1) both; }", ".mo-full .page.enter.back-in { animation: fadein .6s ease-out both; }")
i=s.find(".mo-on .hero em { background: linear-gradient"); j=s.find("\n",i); assert i>0; s=s[:i]+"/* 6판 — 큰 제목 금빛 번쩍임 없앰 */"+s[j:]
rep(".mo-on .glow { animation: breathe 3.2s ease-in-out infinite;", ".mo-on .glow { animation: breathe 7s ease-in-out infinite;")
rep("@keyframes breathe { 0%, 100% { opacity: .10; transform: scale(.85); } 50% { opacity: .26; transform: scale(1.15); } }", "@keyframes breathe { 0%, 100% { opacity: .12; transform: scale(.95); } 50% { opacity: .22; transform: scale(1.05); } }")
rep(".mo-on .real { animation: twinkle 3.4s ease-in-out infinite;", ".mo-on .real { animation: twinkle 6.5s ease-in-out infinite;")
rep("@keyframes twinkle { 0%, 100% { transform: scale(1) rotate(0deg); } 50% { transform: scale(1.2) rotate(18deg); } }", "@keyframes twinkle { 0%, 100% { transform: scale(1); } 50% { transform: scale(1.08); } }")
rep(".mo-on .orbitg { animation: spin2 90s linear infinite;", ".mo-on .orbitg { animation: spin2 240s linear infinite;")
rep(".mo-on .beam { animation: flow 2.4s linear infinite; }", ".mo-on .beam { animation: flow 6s linear infinite; }")
rep(".mo-on .orb { animation: spin 14s linear infinite;", ".mo-on .orb { animation: spin 36s linear infinite;")
rep(".mo-on .st.appear { animation: appear .9s ease-out both; }", ".mo-on .st.appear { animation: appear 1.6s ease-out both; }")
rep(".mo-on .ignite { animation: ignite 1.3s cubic-bezier(.2, .7, .2, 1) .5s both;", ".mo-on .ignite { animation: ignite 2s cubic-bezier(.2, .7, .2, 1) .6s both;")
rep(".mo-on .photon { animation: photon 2.6s linear infinite; }", ".mo-on .photon { animation: photon 6.5s linear infinite; }")
rep(".mo-on .zone-s.pulse, .mo-on .zone-s.live { animation: zpulse 3.2s ease-in-out infinite; }", "/* 6판 — 차오르는 달 칸 깜빡임 없앰 */")
rep(".mo-on .pgnow, .mo-on .beckon { animation: ping 1.6s ease-in-out infinite;", ".mo-on .pgnow, .mo-on .beckon { animation: ping 4.5s ease-in-out infinite;")
rep("@keyframes ping { 0%, 100% { opacity: .9; transform: scale(1); } 50% { opacity: .3; transform: scale(1.3); } }", "@keyframes ping { 0%, 100% { opacity: .9; transform: scale(1); } 50% { opacity: .5; transform: scale(1.12); } }")
rep(".mo-on .lens.pop { animation: pop .38s cubic-bezier(.2, .9, .3, 1.25) both; }", ".mo-on .lens.pop { animation: pop .45s cubic-bezier(.2, .7, .2, 1) both; }")
rep("@keyframes pop { from { opacity: 0; transform: scale(.92); } }", "@keyframes pop { from { opacity: 0; transform: scale(.98); } }")
rep(".mo-on .dipnav .ds { animation: dstw 3s ease-in-out infinite;", ".mo-on .dipnav .ds { animation: dstw 6s ease-in-out infinite;")
rep("@keyframes dstw { 0%, 100% { transform: scale(1); } 50% { transform: scale(1.2); } }", "@keyframes dstw { 0%, 100% { transform: scale(1); } 50% { transform: scale(1.1); } }")
rep(".mo-on .nowp { animation: breathe2 2.2s ease-in-out infinite;", ".mo-on .nowp { animation: breathe2 5s ease-in-out infinite;")
rep("@keyframes breathe2 { 0%, 100% { transform: scale(1); } 50% { transform: scale(1.35); } }", "@keyframes breathe2 { 0%, 100% { transform: scale(1); } 50% { transform: scale(1.12); } }")
rep(".mo-on .toast { animation: toastin .35s cubic-bezier(.2, .9, .3, 1.2) both; }", ".mo-on .toast { animation: toastin .5s cubic-bezier(.2, .7, .2, 1) both; }")
rep(".mo-on .factc { animation: toastin .4s cubic-bezier(.2, .9, .3, 1.2) both; }", ".mo-on .factc { animation: toastin .55s cubic-bezier(.2, .7, .2, 1) both; }")
rep("@keyframes toastin { from { opacity: 0; transform: translate(-50%, 12px); } }", "@keyframes toastin { from { opacity: 0; transform: translate(-50%, 6px); } }")
rep(".mo-on .seal svg { animation: sealin .9s cubic-bezier(.2, .9, .3, 1.15) both; }", ".mo-on .seal svg { animation: sealin 1s cubic-bezier(.2, .7, .2, 1) both; }")
rep("@keyframes sealin { from { opacity: 0; transform: scale(1.6) rotate(-40deg); } }", "@keyframes sealin { from { opacity: 0; transform: scale(.92); } }")
rep(".mo-on .minering { animation: ping 2s ease-in-out infinite; transform-box: fill-box; transform-origin: center; }", "/* 6판 — 내 별 고리는 가만히 */")
rep(".mo-on .kgame .ks:not(.lit):not(.nope) { animation: dstw 1.5s ease-in-out infinite; transform-box: fill-box; transform-origin: center; }", "/* 6판 — 아직 안 누른 별 흔들림 없앰 */")
rep(".mo-on .kite .ks.nope { animation: nope .5s ease-in-out; transform-box: fill-box; transform-origin: center; }", ".mo-on .kite .ks.nope { animation: nope .9s ease-in-out; }")
rep("@keyframes nope { 20%, 60% { transform: translateX(-4px); } 40%, 80% { transform: translateX(4px); } }", "@keyframes nope { 50% { opacity: .35; } }")
rep(".mo-on .hlring { animation: ping 1.6s ease-in-out infinite;", ".mo-on .hlring { animation: ping 4.5s ease-in-out infinite;")
rep(".mo-on .tapring { animation: tapring .55s ease-out forwards; }", ".mo-on .tapring { animation: tapring .8s ease-out forwards; }")
rep("@keyframes tapring { from { transform: scale(.25); opacity: .95; } to { transform: scale(1.6); opacity: 0; } }", "@keyframes tapring { from { transform: scale(.4); opacity: .6; } to { transform: scale(1.4); opacity: 0; } }")
rep(".trails { transition: opacity 1.4s ease; }", ".trails { transition: opacity 1.8s ease; }")
# 살며시 감추기(되감기 대신)
rep(".trails.off { opacity: 0; }", """.trails.off { opacity: 0; }
.skyin .st, .skyin .ring, .skyin .rl, .skyin .minering, .skyin .mineln, .skyin .ov.wax.big, .skyin .ov.mine { transition: opacity .9s ease; }
.skyin.dim .st, .skyin.dim .ring, .skyin.dim .rl, .skyin.dim .minering, .skyin.dim .mineln, .skyin.dim .ov.wax.big, .skyin.dim .ov.mine, .skyin.dim .trails { opacity: 0; }""")
open(p,'w',encoding='utf-8').write(s); print('patched 13')
