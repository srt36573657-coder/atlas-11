# 6판 ③ 물 흐르듯 — 닷새마다 한 장 사이를 곧은 선이 아니라 부드러운 곡선으로(지난 자리는 그대로 지남) · 1년 하늘은 꼬리 없이
import sys,re
p=sys.argv[1]; s=open(p,encoding='utf-8').read()
def rep(a,b,n=1):
    global s
    c=s.count(a); assert c==n,(c,a[:90]); s=s.replace(a,b)
i=s.find("  const posT = (t, f, i) => {"); j=s.find("\n",i); assert i>0
s=s[:i]+"""  /* 6판 — 장과 장 사이를 부드러운 곡선(캣멀롬)으로 · 닷새마다 찍힌 진짜 자리는 정확히 지남 */
  const posT = (t, f, i) => {
    if (!Array.isArray(t) || t.length < 2) return [i.x, i.y];
    const n = t.length, k = Math.max(0, Math.min(n - 2, Math.floor(f))), u = Math.max(0, Math.min(1, f - k));
    const p0 = t[Math.max(0, k - 1)], p1 = t[k], p2 = t[k + 1], p3 = t[Math.min(n - 1, k + 2)];
    const cr = (a, b, c, d) => 0.5 * (2 * b + (-a + c) * u + (2 * a - 5 * b + 4 * c - d) * u * u + (-a + 3 * b - 3 * c + d) * u * u * u);
    return [cr(p0[0], p1[0], p2[0], p3[0]), cr(p0[1], p1[1], p2[1], p3[1])];
  };"""+s[j:]
rep("""  const ease = u => 0.5 - 0.5 * Math.cos(Math.PI * u);""",
"""  const ease = u => { const a = 0.12; if (u < a) return u * u / (2 * a * (1 - a)); if (u > 1 - a) { const v = 1 - u; return 1 - v * v / (2 * a * (1 - a)); } return (u - a / 2) / (1 - a); }; // 처음 · 끝 12% 만 천천히 · 가운데는 고른 빠르기""")
rep("""  /* 1년 = 51장을 약 36초에 · 엿새 = 약 9초에 · 끝(오늘)에서 4.5초 쉼 · 되감지 않고 별을 살며시 감췄다가 처음 자리에서 다시 띄움 */
  const SPEED = () => (mode === 'y' ? 1.4 : 0.55);""",
"""  /* 1년 = 51장을 약 40초에 · 엿새 = 약 10초에 · 끝(오늘)에서 4.5초 쉼 · 되감지 않고 별을 살며시 감췄다가 처음 자리에서 다시 띄움 */
  const SPEED = () => (mode === 'y' ? 1.25 : 0.5);""")
rep("  const showTrails = () => { clearTimeout(fadeT); trails.classList.remove('off'); trailsOn = true; };",
    "  const showTrails = () => { clearTimeout(fadeT); if (mode === 'y') return; trails.classList.remove('off'); trailsOn = true; }; // 1년 하늘은 꼬리 없이(차분히)")
rep("r.g.setAttribute('transform', `translate(${dx.toFixed(1)} ${dy.toFixed(1)})`);",
    "r.g.setAttribute('transform', `translate(${dx.toFixed(1)} ${dy.toFixed(1)})`); if (r.tl) r.tl.setAttribute('visibility', mode === 'y' && f < last() - 0.02 ? 'hidden' : 'visible');")
rep('<radialGradient id="zoneglow" cx="55%" cy="55%" r="75%"><stop offset="0" stop-color="#F2C46A" stop-opacity=".15"/><stop offset=".7" stop-color="#F2C46A" stop-opacity=".04"/><stop offset="1" stop-color="#F2C46A" stop-opacity="0"/></radialGradient>',
    '<radialGradient id="zoneglow" cx="50%" cy="50%" r="70%"><stop offset="0" stop-color="#F2C46A" stop-opacity=".15"/><stop offset=".45" stop-color="#F2C46A" stop-opacity=".06"/><stop offset=".7" stop-color="#F2C46A" stop-opacity="0"/></radialGradient>')
open(p,'w',encoding='utf-8').write(s); print('patched 15')
