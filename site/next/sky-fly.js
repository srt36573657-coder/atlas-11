/* 뒤 하늘에 나는 것들 — 별똥별 · 태양계 · 우주선 · 용 · 천사(사장님 2026-10-21(서울) 19:44 「배경에 우주 있잖아 별똘별 태양계 그리고 우주선 그리고 용 그리고  천사들이 판타스틱하게 날아다니고 아주 아름답게 빛나게 해」)
   그리는 곳 = sky.js 의 뒤 별 하늘 SVG 한 장 안(캔버스 없음 — 규칙 50 · 글 속 꾸밈 없음 — CSP style-src 'self') · 글 · 단추 · 칸은 손대지 않음
   빛 = 그 그림 안의 둥근 빛(방사 그라데이션)과 같은 길을 굵고 옅게 · 중간 · 가늘고 밝게 겹친 선(거름 없음 — 느린 기기에서도 가볍게)
   터지는 불꽃 · 축하 그림 없음(본질 「망치는 길」 폭죽) · 별똥별은 한 줄 꼬리만 · 날아가는 것은 글이 읽히게 가는 빛선으로
   기기 「움직임 줄이기」면 날지 않음(태양계만 멈춘 그림) · 창이 숨으면 sky.js 가 쉬고 다시 보이면 그 자리에서 이어 감(하늘 시계 vt)
   sky.js 가 첫 그림 뒤 한가할 때 받음(첫 화면 빠르기 그대로) · 차례: 천사 → 우주선 → 용 → 비행접시 → … (방향 · 높이는 그때그때) · 별똥별은 5 ~ 10초에 하나 */
const NS = 'http://www.w3.org/2000/svg';
const f1 = v => Math.round(v * 10) / 10, f2 = v => Math.round(v * 100) / 100;
const TAU = Math.PI * 2, DEG = 180 / Math.PI;
const rnd = (a, b) => a + Math.random() * (b - a);

/** SVG 낱개 — 속성은 값으로만 */
function mk(tag, at, parent) {
  const e = document.createElementNS(NS, tag);
  for (const k in at) e.setAttribute(k, String(at[k]));
  if (parent) parent.appendChild(e);
  return e;
}
function set(e, at) { for (const k in at) e.setAttribute(k, String(at[k])); }
function grad(defs, tag, id, stops, at = {}) {
  const g = mk(tag, {id, ...at}, defs);
  for (const [o, c, a] of stops) mk('stop', {offset: o, 'stop-color': c, 'stop-opacity': a}, g);
  return g;
}
/** 빛나는 선 — 같은 길을 굵고 옅게 · 중간 · 가늘고 밝게 세 번(d 는 셋에 함께) */
function glow(parent, color, w = [9, 4, 1.2], a = [0.08, 0.22, 0.95], at = {}) {
  const g = mk('g', {fill: 'none', stroke: color, 'stroke-linecap': 'round', 'stroke-linejoin': 'round', ...at}, parent);
  const ps = w.map((sw, k) => mk('path', {'stroke-width': sw, 'stroke-opacity': a[k]}, g));
  return {g, d(d) { for (const p of ps) p.setAttribute('d', d); return this; }};
}
/** 점들을 지나는 부드러운 길(점 사이 가운데를 2차 곡선으로 이음) */
function smooth(P, move = true) {
  let d = (move ? 'M' : 'L') + f1(P[0][0]) + ' ' + f1(P[0][1]);
  for (let i = 1; i < P.length - 1; i++) d += 'Q' + f1(P[i][0]) + ' ' + f1(P[i][1]) + ' ' + f1((P[i][0] + P[i + 1][0]) / 2) + ' ' + f1((P[i][1] + P[i + 1][1]) / 2);
  const L = P[P.length - 1];
  return d + 'L' + f1(L[0]) + ' ' + f1(L[1]);
}
const tf = (x, y, r = 0, sx = 1, sy = 1) => `translate(${f1(x)} ${f1(y)})` + (r ? ` rotate(${f1(r)})` : '') + (sx !== 1 || sy !== 1 ? ` scale(${f2(sx)} ${f2(sy)})` : '');
/** 네 갈래 반짝 별(손에 든 별 · 여의주 둘레) */
const twinkle = (x, y, r) => `M${x} ${y - r}L${f1(x + r * 0.2)} ${f1(y - r * 0.2)}L${x + r} ${y}L${f1(x + r * 0.2)} ${f1(y + r * 0.2)}L${x} ${y + r}L${f1(x - r * 0.2)} ${f1(y + r * 0.2)}L${x - r} ${y}L${f1(x - r * 0.2)} ${f1(y - r * 0.2)}Z`;

/* 태양계 — 해는 왼쪽 가장자리에 반쯤 · 궤도는 가는 선 · 행성은 제 빛(반지름 · 색 · 궤도 배수 · 한 바퀴 초 · 처음 각도) */
const PLANETS = [
  {r: 2, c: '#C9C2B8', k: 0.21, T: 34, a: 0.35},
  {r: 3, c: '#F6DFAE', k: 0.3, T: 52, a: -0.55},
  {r: 3.3, c: '#78BEFF', k: 0.4, T: 80, a: 0.12, moon: true},
  {r: 2.7, c: '#E8A07E', k: 0.51, T: 120, a: -0.3},
  {r: 6.2, c: '#EBC9A0', k: 0.71, T: 260, a: 0.42, band: true},
  {r: 5.2, c: '#F4DCA6', k: 0.91, T: 400, a: -0.22, ring: true},
  {r: 4, c: '#A4EAF2', k: 1.11, T: 600, a: 0.16},
  {r: 3.9, c: '#7A95FF', k: 1.31, T: 820, a: -0.08}
];

export function plug() {
  let W = 0, H = 0, vh = 0, fsv = null, root = null, defs = null, sun = null, seq = 0;
  let act = [], big = null, nextBig = 0, nextMet = 0, order = 0, last = 0, vt = 0; // vt = 하늘 시계(창이 숨었던 동안은 흐르지 않음)
  const ORDER = ['angels', 'ship', 'dragon', 'ufo', 'angels', 'dragon', 'ship'];
  /* 누르거나 내리는 동안은 쉼(0.35초) — 손가락이 먼저(누른 뒤 다음 그림이 늦지 않게 · 반응 0.2초 잣대) · 쉬는 동안 하늘 시계도 멈춰 그 자리에서 이어 날아감 */
  let hold = 0;
  const rest = () => { hold = performance.now() + 350; };
  for (const ev of ['pointerdown', 'touchstart', 'keydown', 'wheel', 'scroll']) window.addEventListener(ev, rest, {passive: true, capture: true});

  function build(api) {
    W = api.W; H = api.H; vh = api.vh;
    // 제 층 하나(별 하늘 바로 위 · 글판 아래) — 나는 것이 움직여도 별 하늘 층은 다시 안 그림(느린 기기 반응 · space.css .sky-near)
    if (!fsv || !fsv.isConnected) { fsv = mk('svg', {class: 'sky-near', 'aria-hidden': 'true', focusable: 'false', preserveAspectRatio: 'xMaxYMin slice'}); api.sv.after(fsv); }
    while (fsv.firstChild) fsv.removeChild(fsv.firstChild);
    set(fsv, {width: W, height: H, viewBox: `0 0 ${W} ${H}`});
    root = mk('g', {class: 'sky-fly'}, fsv);
    defs = mk('defs', {}, root);
    grad(defs, 'radialGradient', 'flyW', [[0, '#FFFFFF', 0.95], [0.2, '#FFF6E2', 0.5], [1, '#FFF6E2', 0]]);
    grad(defs, 'radialGradient', 'flyG', [[0, '#FFF1C8', 0.95], [0.25, '#F2C46A', 0.45], [1, '#F2C46A', 0]]);
    grad(defs, 'radialGradient', 'flyC', [[0, '#E6FCFF', 0.9], [0.3, '#8FE3FF', 0.35], [1, '#8FE3FF', 0]]);
    grad(defs, 'radialGradient', 'flySunHalo', [[0, '#FFD98A', 0.28], [0.35, '#FFB35C', 0.1], [1, '#FF9A3D', 0]]);
    grad(defs, 'radialGradient', 'flyCorona', [[0, '#FFF3C9', 1], [0.38, '#FFD27A', 0.85], [0.62, '#FFAE52', 0.3], [1, '#FF9A3D', 0]]);
    grad(defs, 'radialGradient', 'flyDisk', [[0, '#FFFDF2', 1], [0.6, '#FFE7A6', 1], [1, '#FFC766', 1]]);
    grad(defs, 'linearGradient', 'flyFlame', [[0, '#FFF6D8', 0.95], [0.35, '#FFC266', 0.8], [1, '#FF7A3D', 0]], {x1: 1, y1: 0, x2: 0, y2: 0});
    for (const p of PLANETS) grad(defs, 'radialGradient', 'flyP' + p.k, [[0, p.c, 0.55], [1, p.c, 0]]);
    buildSun();
    act = []; big = null;
    nextMet = Math.max(nextMet, vt + 900); nextBig = Math.max(nextBig, vt + 1600);
  }

  function buildSun() {
    const R0 = Math.min(Math.max(W, 340), 560), cx = -W * 0.02, cy = vh * 0.57;
    const g = mk('g', {class: 'sky-sun'}, root);
    mk('circle', {cx: f1(cx), cy: f1(cy), r: f1(R0 * 0.62), fill: 'url(#flySunHalo)'}, g);
    for (const p of PLANETS) mk('circle', {cx: f1(cx), cy: f1(cy), r: f1(p.k * R0), fill: 'none', stroke: '#B4C4FF', 'stroke-opacity': 0.12, 'stroke-width': 0.8}, g);
    const cor = mk('circle', {cx: f1(cx), cy: f1(cy), r: 58, fill: 'url(#flyCorona)'}, g);
    mk('circle', {cx: f1(cx), cy: f1(cy), r: 24, fill: 'url(#flyDisk)'}, g);
    const pl = PLANETS.map(p => {
      const pg = mk('g', {opacity: 0.92}, g);
      mk('circle', {r: f1(p.r * 3.6), fill: `url(#flyP${p.k})`}, pg);
      if (p.ring) { mk('circle', {r: f1(p.r * 2.1), fill: 'none', stroke: p.c, 'stroke-opacity': 0.75, 'stroke-width': 1.3}, pg); mk('circle', {r: f1(p.r * 2.6), fill: 'none', stroke: p.c, 'stroke-opacity': 0.35, 'stroke-width': 0.8}, pg); }
      mk('circle', {r: p.r, fill: p.c}, pg);
      if (p.band) mk('path', {d: `M${-p.r * 0.85} -1.6H${p.r * 0.85}M${-p.r * 0.95} 1.4H${p.r * 0.95}`, stroke: '#B8875A', 'stroke-opacity': 0.7, 'stroke-width': 1}, pg);
      const moon = p.moon ? mk('circle', {r: 1.1, fill: '#E2E6EE'}, pg) : null;
      return {p, pg, moon};
    });
    sun = {g, cx, cy, R0, cor, pl};
  }

  function drawSun(t, move) {
    const {cx, cy, R0} = sun;
    for (const {p, pg, moon} of sun.pl) {
      const a = p.a - (move ? t / (p.T * 1000) * TAU : 0), R = p.k * R0;
      pg.setAttribute('transform', `translate(${f1(cx + Math.cos(a) * R)} ${f1(cy + Math.sin(a) * R)})`);
      if (moon) { const b = -t / 5200 * TAU; set(moon, {cx: f1(Math.cos(b) * 7.5), cy: f1(Math.sin(b) * 7.5)}); }
    }
    sun.cor.setAttribute('opacity', f2(move ? 0.86 + 0.14 * Math.sin(t * 0.0013) : 0.95));
  }

  /* 별똥별 — 밝은 머리 + 가늘어지는 꼬리 한 줄(아래 왼쪽으로) */
  function meteor(t) {
    const g = mk('g', {}, root), id = 'flyM' + (++seq);
    const gr = grad(defs, 'linearGradient', id, [[0, '#FFFFFF', 0.95], [0.16, '#FFF0CC', 0.75], [0.55, '#C4D4FF', 0.22], [1, '#A9C0FF', 0]], {gradientUnits: 'userSpaceOnUse'});
    const wide = mk('path', {fill: `url(#${id})`, opacity: 0.32}, g), core = mk('path', {fill: `url(#${id})`}, g);
    const halo = mk('circle', {r: 12, fill: 'url(#flyW)'}, g), head = mk('circle', {r: 1.8, fill: '#FFFFFF'}, g);
    const an = rnd(24, 40) / DEG, sp = rnd(0.3, 0.42), vx = -Math.cos(an), vy = Math.sin(an), L = rnd(170, 270), life = rnd(1700, 2400);
    const x0 = W * rnd(0.42, 1.12), y0 = vh * rnd(-0.03, 0.34);
    return {g, gr, step(now) {
      const age = now - t; if (age > life) return false;
      const x = x0 + vx * sp * age, y = y0 + vy * sp * age, l = L * Math.min(1, age / 380), tx = x - vx * l, ty = y - vy * l, nx = -vy, ny = vx;
      const tri = w => `M${f1(x + nx * w)} ${f1(y + ny * w)}L${f1(tx)} ${f1(ty)}L${f1(x - nx * w)} ${f1(y - ny * w)}Z`;
      wide.setAttribute('d', tri(3.6)); core.setAttribute('d', tri(1.2));
      set(gr, {x1: f1(x), y1: f1(y), x2: f1(tx), y2: f1(ty)});
      set(halo, {cx: f1(x), cy: f1(y)}); set(head, {cx: f1(x), cy: f1(y)});
      g.setAttribute('opacity', f2(Math.max(0, Math.min(1, age / 160, (life - age) / (life * 0.38)))));
      return true;
    }};
  }

  /* 연기 · 반짝이 — 미리 만든 점 몇 개를 돌려 씀(그때그때 새로 만들지 않음) */
  function dust(parent, n, color, life, grow, fall, a0 = 0.85) {
    const P = Array.from({length: n}, () => ({e: mk('circle', {r: 0, fill: color, opacity: 0}, parent), t: -1e9, x: 0, y: 0, r0: 1, on: false}));
    let k = 0;
    return {
      add(now, x, y, r0 = 1) { const p = P[k++ % n]; p.t = now; p.x = x; p.y = y; p.r0 = r0; },
      step(now) {
        for (const p of P) {
          const a = (now - p.t) / life;
          if (a < 0 || a > 1) { if (p.on) { p.e.setAttribute('opacity', 0); p.on = false; } continue; }
          p.on = true; set(p.e, {cx: f1(p.x), cy: f1(p.y + fall * a), r: f2(p.r0 * (1 + grow * a)), opacity: f2((1 - a) * a0)});
        }
      }
    };
  }

  /* 우주선 — 은빛 몸 · 하늘빛 창 · 꼬리 불(흔들림) · 지나간 자리에 옅은 연기 */
  function ship(t) {
    const g = mk('g', {class: 'sky-ship'}, root), smoke = dust(g, 16, '#FFCF94', 1400, 2.8, 0, 0.5);
    const s = mk('g', {}, g), flame = mk('g', {}, s);
    mk('path', {d: 'M-19 -3.4Q-44 0 -19 3.4Z', fill: 'url(#flyFlame)'}, flame);
    mk('circle', {cx: -21, r: 10, fill: 'url(#flyG)', opacity: 0.85}, flame);
    const body = 'M23 0C16 -7.5 -4 -8.6 -15 -6.4L-19.5 -3.4L-19.5 3.4L-15 6.4C-4 8.6 16 7.5 23 0Z';
    mk('path', {d: body, fill: '#16203F', 'fill-opacity': 0.85}, s);
    glow(s, '#E4ECFF', [8, 3.6, 1.2], [0.08, 0.22, 0.95]).d(body + 'M-9 -7.4L-20 -15.5L-16.5 -6.3M-9 7.4L-20 15.5L-16.5 6.3M-4 -7.8V7.8M14 -4.6C16 -2 16 2 14 4.6');
    mk('circle', {cx: 6, r: 9, fill: 'url(#flyC)'}, s);
    mk('circle', {cx: 6, r: 3.4, fill: '#CFF6FF'}, s);
    glow(s, '#CFF6FF', [5, 2.2, 0.9], [0.08, 0.25, 0.9]).d('M1.4 0A4.6 4.6 0 1 0 10.6 0A4.6 4.6 0 1 0 1.4 0');
    const lt = [mk('circle', {cx: -19.5, cy: -15.2, r: 1.6, fill: '#F2C46A'}, s), mk('circle', {cx: -19.5, cy: 15.2, r: 1.6, fill: '#8FE3FF'}, s)];
    const up = Math.random() < 0.5, P0 = [-70, vh * (up ? 0.74 : 0.2)], P1 = [W * 0.28, vh * (up ? 0.6 : 0.08)], P2 = [W * 0.62, vh * (up ? 0.22 : 0.5)], P3 = [W + 80, vh * (up ? 0.12 : 0.36)];
    const dur = 12000, B = (u, k) => { const v = 1 - u; return v * v * v * P0[k] + 3 * v * v * u * P1[k] + 3 * v * u * u * P2[k] + u * u * u * P3[k]; };
    let puff = 0;
    return {g, big: true, step(now) {
      const age = now - t, u = age / dur; if (u > 1.1) return false;
      const uu = Math.min(1, u), x = B(uu, 0), y = B(uu, 1), x2 = B(Math.min(1, uu + 0.01), 0), y2 = B(Math.min(1, uu + 0.01), 1);
      const a = Math.atan2(y2 - y, x2 - x), bob = 3 * Math.sin(age * 0.004);
      s.setAttribute('transform', tf(x, y + bob, a * DEG, 1.55, 1.55));
      flame.setAttribute('transform', `translate(-19 0) scale(${f2(0.85 + 0.35 * Math.abs(Math.sin(age * 0.023)) + 0.1 * Math.sin(age * 0.051))} 1) translate(19 0)`);
      const on = Math.floor(age / 500) % 2; lt[0].setAttribute('opacity', on ? 1 : 0.25); lt[1].setAttribute('opacity', on ? 0.25 : 1);
      if (u < 1 && now - puff > 95) { puff = now; smoke.add(now, x - Math.cos(a) * 46 + rnd(-2, 2), y + bob - Math.sin(a) * 46 + rnd(-2, 2), rnd(1.9, 2.9)); }
      smoke.step(now);
      return true;
    }};
  }

  /* 비행접시 — 납작한 접시 · 하늘빛 덮개 · 가장자리 불이 차례로 켜짐 · 한가운데서 잠깐 떠 있다가 빠르게 감 */
  function ufo(t) {
    const g = mk('g', {class: 'sky-ufo'}, root), s = mk('g', {}, g);
    mk('ellipse', {cy: 6, rx: 26, ry: 10, fill: 'url(#flyC)', opacity: 0.55}, s);
    mk('path', {d: 'M-9 -3C-9 -13 9 -13 9 -3Z', fill: '#BFF2FF', 'fill-opacity': 0.35}, s);
    glow(s, '#CFF6FF', [7, 3, 1.1], [0.08, 0.22, 0.95]).d('M-9 -3C-9 -13 9 -13 9 -3');
    mk('path', {d: 'M-24 0C-16 -6 16 -6 24 0C16 6 -16 6 -24 0Z', fill: '#1A2547', 'fill-opacity': 0.9}, s);
    glow(s, '#E4ECFF', [8, 3.4, 1.2], [0.08, 0.22, 0.95]).d('M-24 0C-16 -6 16 -6 24 0C16 6 -16 6 -24 0Z');
    const L = [-15, -7.5, 0, 7.5, 15].map(x => mk('circle', {cx: x, cy: 1.2, r: 1.5, fill: '#F2C46A', opacity: 0.3}, s));
    const dir = Math.random() < 0.5 ? -1 : 1, y0 = vh * rnd(0.26, 0.48), xs = dir < 0 ? W + 50 : -50, xm = W * (dir < 0 ? 0.58 : 0.42), xe = dir < 0 ? -90 : W + 90;
    const T1 = 4300, T2 = 1600, T3 = 2300;
    return {g, big: true, step(now) {
      const age = now - t; if (age > T1 + T2 + T3 + 200) return false;
      let x, tilt = 0;
      if (age < T1) { const u = age / T1, e = 1 - (1 - u) * (1 - u); x = xs + (xm - xs) * e; tilt = -dir * 6 * (1 - u); }
      else if (age < T1 + T2) { x = xm; tilt = 4 * Math.sin((age - T1) * 0.006); }
      else { const u = (age - T1 - T2) / T3; x = xm + (xe - xm) * u * u; tilt = dir * 10 * Math.min(1, u * 3); }
      const y = y0 + 6 * Math.sin(age * 0.0026);
      s.setAttribute('transform', tf(x, y, tilt, 1.55, 1.55));
      const k = Math.floor(age / 140) % L.length; L.forEach((c, i) => c.setAttribute('opacity', i === k ? 1 : 0.3));
      return true;
    }};
  }

  /* 용 — 금빛 몸이 물결치며 여의주를 쫓음(몸은 머리가 지나간 길을 그대로 따라옴) · 등 지느러미 · 마디진 배 · 발 넷 · 갈기 · 수염 · 꼬리 불꽃 */
  function dragon(t, dir) {
    const g = mk('g', {class: 'sky-dragon'}, root), glit = dust(g, 14, '#FFE3A0', 1300, -0.5, 10, 0.8);
    const N = 30, SP = 7.4, LEN = N * SP + 40;
    const y0 = vh * rnd(0.22, 0.5), y1 = y0 + vh * rnd(-0.12, 0.1);
    const xs = dir > 0 ? -50 : W + 50, xe = dir > 0 ? W + LEN + 60 : -LEN - 60;
    const D = Math.hypot(xe - xs, y1 - y0), ux = (xe - xs) / D, uy = (y1 - y0) / D, nx = -uy, ny = ux;
    const A = Math.min(48, vh * 0.056), lam = rnd(240, 300), ph = rnd(0, TAU), v = 0.054;
    const P = (s, age) => { const o = A * Math.sin(s / lam * TAU + ph) + 5 * Math.sin(s / 34 - age * 0.0045); return [xs + ux * s + nx * o, y0 + uy * s + ny * o]; };
    const body = mk('path', {fill: '#F2C46A', 'fill-opacity': 0.17}, g);
    const belly = mk('path', {fill: '#FFF3D6', 'fill-opacity': 0.13}, g);
    const rings = mk('path', {fill: 'none', stroke: '#FFE9B8', 'stroke-opacity': 0.42, 'stroke-width': 0.9, 'stroke-linecap': 'round'}, g);
    const edge = glow(g, '#FFE2A0', [12, 4.8, 1.2], [0.06, 0.18, 0.92]);
    const fins = glow(g, '#FF9A5C', [7, 2.8, 1], [0.08, 0.26, 0.92]);
    const finFill = mk('path', {fill: '#FF9A5C', 'fill-opacity': 0.16}, g);
    const legs = [5, 19].map(i => ({i, g: mk('g', {}, g)})); // 앞발 · 뒷발(가까운 쪽 둘 — 느린 기기)
    for (const l of legs) {
      glow(l.g, '#FFE2A0', [6, 2.6, 1.1], [0.07, 0.22, 0.95]).d('M0 0C2 4.5 0.5 8 -4 10.5M-4 10.5L-9 11.2M-4 10.5L-6.4 15M-4 10.5L-1.6 14.6');
      glow(l.g, '#FF9A5C', [5, 2, 0.9], [0.07, 0.22, 0.85]).d('M-0.5 2.5C-4 3 -6 1.5 -8.5 3M0.4 5C-3 6.5 -5.5 6 -8 8');
    }
    const tail = mk('g', {}, g);
    const TAIL = 'M0 0C-7 -5 -13 -3 -19 -12C-16 -5 -17 -1.5 -24 0.5C-17 2 -14 6 -18 13C-11 7 -6 4 0 0Z';
    mk('path', {d: TAIL, fill: '#FF9A5C', 'fill-opacity': 0.2}, tail);
    glow(tail, '#FF9A5C', [7, 3, 1.1], [0.08, 0.24, 0.92]).d(TAIL + 'M-4 -1C-9 -3.5 -12 -4 -15 -6M-5 1C-10 2.5 -13 3.5 -15.5 6');
    // 머리(오른쪽을 봄 · 위 = -y · 길이 34) — 벌린 입 · 송곳니 · 코 말림 · 눈썹 · 사슴뿔 둘 · 불꽃 갈기 · 턱수염 · 긴 수염
    const head = mk('g', {}, g);
    mk('path', {d: 'M-6 -6C0 -10 10 -10 18 -7C22 -6 25 -5 27 -3C28 -2 27.5 -1 26 -0.5C21 0 15 0.5 9 1.5C13 2.5 19 2.8 24 3C19 5 13 6.5 8 6C3 6.5 -2 6 -6 5Z', fill: '#F2C46A', 'fill-opacity': 0.24}, head);
    glow(head, '#FFE2A0', [11, 4.6, 1.3], [0.07, 0.2, 0.96]).d('M-6 -6C0 -10 10 -10 18 -7C22 -6 25 -5 27 -3C28 -2 27.5 -1 26 -0.5C21 0 15 0.5 9 1.5M24 3C19 5 13 6.5 8 6C3 6.5 -2 6 -6 5M9 1.5C13 2.5 19 2.8 24 3M24 -5.5C25.5 -7.5 27.5 -7 27 -5M3 -8C6 -10.2 10 -9.6 12.2 -7.4M-2 -8C-6 -15 -12 -20 -22 -23M-11 -18C-11 -22 -9 -25 -6 -27M1 -8.5C-2 -16 -6 -22 -14 -27.5M-6.5 -20C-9 -23 -9.5 -26 -9 -29');
    glow(head, '#FFFFFF', [4, 1.8, 0.9], [0.08, 0.3, 0.95]).d('M22 -0.2L21.2 2.2M17.5 0.4L16.8 2.6M20 3.2L20.6 1.3');
    glow(head, '#FF9A5C', [8, 3.2, 1.1], [0.07, 0.22, 0.9]).d('M-5 -5C-11 -8 -16 -4 -22 -8M-6 -1C-13 -1 -18 2 -25 -1M-6 3C-12 5 -17 9 -24 7M-5 6C-10 10 -14 13 -20 14M10 6.5C9 9 6 11 3 11.8M14 6C13 8.5 11 10.5 8 11.8');
    mk('ellipse', {cx: 8.5, cy: -5, rx: 2.2, ry: 1.3, fill: '#FFFFFF'}, head);
    mk('circle', {cx: 8.5, cy: -5, r: 6, fill: 'url(#flyW)', opacity: 0.75}, head);
    const wh = glow(head, '#FFE9B8', [5, 2.2, 0.9], [0.07, 0.2, 0.85]);
    const pearl = mk('g', {}, g);
    mk('circle', {r: 22, fill: 'url(#flyG)'}, pearl);
    mk('circle', {r: 5, fill: '#FFF8E8'}, pearl);
    const wisp = mk('g', {}, pearl);
    glow(wisp, '#FFB35C', [5, 2, 0.9], [0.08, 0.25, 0.9]).d('M0 -9C3.5 -11.5 5.5 -10 8 -12.5M8 4.5C11 5.5 12 9 14.5 9M-8 4.5C-10 8 -13 8 -14.5 11');
    mk('path', {d: twinkle(0, 0, 9), fill: '#FFF8E8', opacity: 0.55}, wisp);
    const nb = (dx, dy) => (dir > 0 ? [dy, -dx] : [-dy, dx]); // 등 쪽(위)
    let gl = 0;
    return {g, big: true, step(now) {
      const age = now - t, sh = v * age; if (sh > D + LEN + 80) return false;
      const S = [];
      for (let i = 0; i <= N; i++) S.push(P(sh - 8 - i * SP, age));
      const hp = P(sh, age), hq = P(sh + 2, age), ha = Math.atan2(hq[1] - hp[1], hq[0] - hp[0]);
      head.setAttribute('transform', tf(hp[0], hp[1], ha * DEG, 1.15, 1.15 * dir));
      const Lf = [], Rt = [], B1 = [], B2 = [], back = [];
      for (let i = 0; i <= N; i++) {
        const a = S[Math.max(0, i - 1)], b = S[Math.min(N, i + 1)], dx = a[0] - b[0], dy = a[1] - b[1], l = Math.hypot(dx, dy) || 1, [bx, by] = nb(dx / l, dy / l);
        const w = (i < 3 ? 9 + i * 2.1 : 16 * Math.pow(1 - (i - 3) / (N - 3), 0.8) + 1.3) / 2;
        Lf.push([S[i][0] + bx * w, S[i][1] + by * w]); Rt.push([S[i][0] - bx * w, S[i][1] - by * w]);
        B1.push([S[i][0] - bx * w * 0.1, S[i][1] - by * w * 0.1]); B2.push([S[i][0] - bx * w * 0.86, S[i][1] - by * w * 0.86]);
        back.push({x: S[i][0] + bx * w, y: S[i][1] + by * w, bx, by, tx: dx / l, ty: dy / l});
      }
      const shape = smooth(Lf) + smooth(Rt.slice().reverse(), false) + 'Z';
      body.setAttribute('d', shape); edge.d(shape);
      belly.setAttribute('d', smooth(B1) + smooth(B2.slice().reverse(), false) + 'Z');
      let rd = '';
      for (let i = 1; i < N - 2; i += 2) rd += `M${f1(B1[i][0])} ${f1(B1[i][1])}L${f1(B2[i][0])} ${f1(B2[i][1])}`;
      rings.setAttribute('d', rd);
      let fd = '';
      for (let i = 2; i < N - 3; i += 2) {
        const p = back[i], q = back[i + 2] ?? back[i + 1], h = 3.6 + 4.2 * (1 - i / N), ax = p.x + p.bx * h - p.tx * 4.5, ay = p.y + p.by * h - p.ty * 4.5;
        fd += `M${f1(p.x)} ${f1(p.y)}Q${f1(ax + p.tx * 2)} ${f1(ay + p.ty * 2)} ${f1(ax)} ${f1(ay)}Q${f1((ax + q.x) / 2)} ${f1((ay + q.y) / 2 - p.by * 0.5)} ${f1(q.x)} ${f1(q.y)}`;
      }
      fins.d(fd || 'M0 0'); finFill.setAttribute('d', fd || 'M0 0');
      for (const l of legs) {
        const i = l.i, p = Rt[i], s0 = S[Math.max(0, i - 1)], s1 = S[i + 1], a = Math.atan2(s0[1] - s1[1], s0[0] - s1[0]) * DEG;
        l.g.setAttribute('transform', tf(p[0], p[1], a + 16 * Math.sin(age * 0.006 + i), 1.1, 1.1 * dir));
      }
      const e = S[N], e2 = S[N - 1];
      tail.setAttribute('transform', tf(e[0], e[1], Math.atan2(e2[1] - e[1], e2[0] - e[0]) * DEG, 1, dir)); // 꼬리 불꽃은 몸 밖으로(-x 쪽)
      const sw = Math.sin(age * 0.005), sw2 = Math.sin(age * 0.004 + 1);
      wh.d(`M25 -2C14 ${f1(-12 - 3 * sw)} -6 ${f1(-6 + 4 * sw)} -30 ${f1(-12 + 7 * sw)}M24 3C14 ${f1(11 + 3 * sw2)} -4 ${f1(5 - 4 * sw2)} -27 ${f1(12 - 7 * sw2)}`);
      const pp = P(sh + 40 + 6 * Math.sin(age * 0.0021), age);
      pearl.setAttribute('transform', tf(pp[0], pp[1]));
      wisp.setAttribute('transform', `rotate(${f1(age * 0.12)})`);
      if (now - gl > 140) { gl = now; const k = 6 + Math.floor(Math.random() * (N - 8)); glit.add(now, Lf[k][0] + rnd(-3, 3), Lf[k][1] + rnd(-3, 3), rnd(0.8, 1.4)); }
      glit.step(now);
      return true;
    }};
  }

  /* 천사 셋 — 몸을 앞으로 눕혀 나는 옆모습 · 금빛 고리 · 큰 날개짓 · 두 갈래로 나부끼는 옷자락 · 손에 든 별 · 지나간 자리에 금빛 반짝이 */
  function angels(t, dir) {
    const g = mk('g', {class: 'sky-angels'}, root), spark = dust(g, 22, '#FFE7A8', 1500, -0.6, 16, 0.9);
    const y0 = vh * rnd(0.2, 0.34), y1 = y0 - vh * rnd(-0.04, 0.08), dur = 16000, xs = dir > 0 ? -70 : W + 70, xe = dir > 0 ? W + 150 : -150;
    const WING = 'M0 0C-1 -9 -8 -19 -20 -26C-17 -20 -18 -17 -14.5 -14C-19 -13 -19 -9.5 -13.5 -7.5C-17 -6 -15.5 -2.5 -10.5 -2.5C-7 -1.5 -3 -0.5 0 0Z';
    const FEATH = 'M-3 -4C-7 -8 -11 -12 -15 -15M-4 -1.5C-8 -3.5 -11 -5 -14 -7';
    const crew = [{dx: 0, dy: 0, s: 1.5, ph: 0}, {dx: -48, dy: -22, s: 1.2, ph: 1.4}, {dx: -86, dy: 16, s: 1.05, ph: 2.5}].map(c => {
      const a = mk('g', {}, g);
      const wf = mk('g', {}, a);
      mk('path', {d: WING, fill: '#FFFFFF', 'fill-opacity': 0.07}, wf); glow(wf, '#FFF8EC', [8, 3.2, 1], [0.05, 0.14, 0.45]).d(WING + FEATH);
      const robe = mk('path', {fill: '#FFFFFF', 'fill-opacity': 0.15}, a), robeL = glow(a, '#FFF8EC', [9, 3.6, 1.1], [0.06, 0.2, 0.92]);
      const fold = glow(a, '#FFF8EC', [4, 1.6, 0.8], [0.05, 0.15, 0.5]);
      glow(a, '#FFF8EC', [6, 2.6, 1], [0.06, 0.2, 0.88]).d('M5 -4C9 -3.5 12 -4.5 15 -6.5');
      mk('circle', {cx: 17, cy: -7.5, r: 7, fill: 'url(#flyG)'}, a);
      const star = mk('path', {d: twinkle(17, -7.5, 3.6), fill: '#FFF1C8'}, a);
      glow(a, '#FFF1D6', [5, 2, 0.9], [0.06, 0.2, 0.75]).d('M7 -12C3 -13.5 0 -12 -3 -13.5M6.5 -10C3 -10.5 0.5 -9 -2.5 -9.5');
      mk('circle', {cx: 9.5, cy: -9.5, r: 10, fill: 'url(#flyW)', opacity: 0.55}, a);
      mk('circle', {cx: 9.5, cy: -9.5, r: 3.6, fill: '#FFF7E6'}, a);
      const halo = mk('g', {transform: 'rotate(-14 10.5 -15.4)'}, a);
      glow(halo, '#F2C46A', [6, 2.8, 1.2], [0.1, 0.32, 1]).d('M5.5 -15.4A5 1.6 0 1 0 15.5 -15.4A5 1.6 0 1 0 5.5 -15.4');
      const wn = mk('g', {}, a);
      mk('path', {d: WING, fill: '#FFFFFF', 'fill-opacity': 0.15}, wn); glow(wn, '#FFF8EC', [9, 3.6, 1.1], [0.06, 0.2, 0.92]).d(WING + FEATH);
      return {...c, a, wf, wn, robe, robeL, fold, star};
    });
    let sp = 0;
    return {g, big: true, step(now) {
      const age = now - t, u = age / dur; if (u > 1) return false;
      const bx = xs + (xe - xs) * u, by = y0 + (y1 - y0) * u;
      for (const c of crew) {
        const x = bx + c.dx * dir * c.s, y = by + c.dy + 9 * Math.sin(age * 0.0019 + c.ph);
        c.a.setAttribute('transform', tf(x, y, -5 * Math.cos(age * 0.0019 + c.ph) * dir, dir * c.s, c.s));
        const fl = Math.sin(age * 0.0105 + c.ph);
        c.wn.setAttribute('transform', `translate(2 -5) rotate(${f1(-10 + 30 * fl)})`);
        c.wf.setAttribute('transform', `translate(3.5 -6.5) rotate(${f1(-22 + 26 * fl)}) scale(0.88)`);
        const h1 = 2.6 * Math.sin(age * 0.009 + c.ph), h2 = 2.4 * Math.sin(age * 0.008 + c.ph + 1.7);
        const d = `M7 -5C3 -4 -1 -2 -4 1C-11 6 -21 8 ${f1(-34)} ${f1(8.5 + h1)}C-27 11 -20 12.5 -12 11.5C-16 13.5 -22 14 ${f1(-28)} ${f1(13.5 + h2)}C-18 16.5 -7 14.5 -1 9.5C3 6 6 2 8 -2Z`;
        c.robe.setAttribute('d', d); c.robeL.d(d); c.fold.d(`M-2 2C-9 6 -18 9 -27 ${f1(10.5 + h1 * 0.6)}`);
        c.star.setAttribute('opacity', f2(0.75 + 0.25 * Math.sin(age * 0.008 + c.ph * 2)));
      }
      if (u < 0.97 && now - sp > 110) { sp = now; const q = crew[Math.floor(Math.random() * crew.length)]; spark.add(now, bx + (q.dx - 30) * dir * q.s + rnd(-3, 3), by + q.dy + 11 * q.s + 9 * Math.sin(age * 0.0019 + q.ph), rnd(0.9, 1.7)); }
      spark.step(now);
      return true;
    }};
  }

  function spawn(kind, now) {
    const dir = Math.random() < 0.5 ? -1 : 1;
    const f = kind === 'angels' ? angels(now, dir) : kind === 'ship' ? ship(now) : kind === 'dragon' ? dragon(now, dir) : kind === 'ufo' ? ufo(now) : meteor(now);
    act.push(f); if (f.big) big = f;
    return f;
  }

  function draw(now, move) {
    if (!root) return;
    if (move && now < hold) { last = now; return; } // 누르는 · 내리는 중 — 그리지 않음(시계도 멈춤)
    vt += last ? Math.min(100, Math.max(0, now - last)) : 0; last = now; // 창이 숨었다 오면 한 걸음만(건너뛰지 않음)
    drawSun(vt, move);
    if (!move) { for (const f of act) { f.g.remove(); f.gr?.remove(); } act = []; big = null; return; }
    if (vt >= nextMet) { spawn('meteor', vt); nextMet = vt + rnd(5200, 10500); if (Math.random() < 0.28) nextMet = vt + rnd(350, 800); }
    if (!big && vt >= nextBig) spawn(ORDER[order++ % ORDER.length], vt);
    act = act.filter(f => {
      if (f.step(vt)) return true;
      f.g.remove(); f.gr?.remove();
      if (f === big) { big = null; nextBig = vt + rnd(4500, 8500); }
      return false;
    });
  }

  return {build, draw, busy: () => act.length > 0 && performance.now() >= hold, spawn: k => spawn(k, vt)};
}
