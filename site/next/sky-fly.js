/* 뒤 하늘에 나는 것들 — 별똥별 · 별똥별 비 · 태양계 · 혜성 · 오로라 · 우주선 · 비행접시 · 용 두 마리 · 천사 다섯
   사장님 2026-10-21(서울) 19:44 「배경에 우주 있잖아 별똘별 태양계 그리고 우주선 그리고 용 그리고  천사들이 판타스틱하게 날아다니고 아주 아름답게 빛나게 해」 · 20:22 「더 판타스틱하게 해」
   그리는 곳 = 별 하늘(sky.js) 바로 위 제 층들 — 오로라 둘 · 해 빛살 하나(그림은 가만있고 층째 천천히 움직임 — 다시 그리지 않음) · 나는 것들 하나(.sky-near)
   캔버스 없음(규칙 50) · 글 속 꾸밈 없음(CSP — 층 자리만 CSSOM) · 빛 = 그림 안의 둥근 빛(방사 그라데이션)과 같은 길을 굵고 옅게 겹친 선(거름 없음)
   글 · 단추 · 칸은 손대지 않음 · 터지는 불꽃 · 축하 그림 없음(본질 「망치는 길」 폭죽) — 별똥별 비도 한 줄 꼬리들만
   기기 「움직임 줄이기」면 날지 않음(오로라 · 해 · 행성만 멈춘 그림) · 누르거나 내리는 동안 0.35초 쉼 · 창이 숨으면 sky.js 가 쉬고 다시 보이면 그 자리에서 이어 감(하늘 시계 vt)
   처음 받으면 첫 쇼(별똥별 비 → 천사 다섯 → 우주선 → 용 두 마리 → 비행접시 → 혜성) · 그다음은 둘까지 겹쳐 날고 별똥별은 2.5 ~ 6초에 하나 · 별똥별 비는 35 ~ 50초에 한 번 */
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
/** 빛나는 선 — 같은 길을 굵고 옅게 · 중간 · 가늘고 밝게(d 는 함께) */
function glow(parent, color, w = [9, 4, 1.2], a = [0.08, 0.22, 0.95], at = {}) {
  const g = mk('g', {fill: 'none', stroke: color, 'stroke-linecap': 'round', 'stroke-linejoin': 'round', ...at}, parent);
  const ps = w.map((sw, k) => mk('path', {'stroke-width': sw, 'stroke-opacity': a[k]}, g));
  return {g, d(d) { for (const p of ps) p.setAttribute('d', d); return this; }};
}
/** 점들을 지나는 부드러운 길 */
function smooth(P, move = true) {
  let d = (move ? 'M' : 'L') + f1(P[0][0]) + ' ' + f1(P[0][1]);
  for (let i = 1; i < P.length - 1; i++) d += 'Q' + f1(P[i][0]) + ' ' + f1(P[i][1]) + ' ' + f1((P[i][0] + P[i + 1][0]) / 2) + ' ' + f1((P[i][1] + P[i + 1][1]) / 2);
  const L = P[P.length - 1];
  return d + 'L' + f1(L[0]) + ' ' + f1(L[1]);
}
const tf = (x, y, r = 0, sx = 1, sy = 1) => `translate(${f1(x)} ${f1(y)})` + (r ? ` rotate(${f1(r)})` : '') + (sx !== 1 || sy !== 1 ? ` scale(${f2(sx)} ${f2(sy)})` : '');
/** 네 갈래 반짝 별 */
const twinkle = (x, y, r) => `M${x} ${y - r}L${f1(x + r * 0.2)} ${f1(y - r * 0.2)}L${x + r} ${y}L${f1(x + r * 0.2)} ${f1(y + r * 0.2)}L${x} ${y + r}L${f1(x - r * 0.2)} ${f1(y + r * 0.2)}L${x - r} ${y}L${f1(x - r * 0.2)} ${f1(y - r * 0.2)}Z`;
/** 가는 빛 꼬리(점 몇 개를 지나는 길 · 머리에서 꼬리로 옅어지는 그라데이션) */
function ribbon(parent, defs, id, stops, w = [9, 2.4], a = [0.2, 1]) {
  const gr = grad(defs, 'linearGradient', id, stops, {gradientUnits: 'userSpaceOnUse'});
  const ps = w.map((sw, k) => mk('path', {fill: 'none', stroke: `url(#${id})`, 'stroke-width': sw, 'stroke-opacity': a[k], 'stroke-linecap': 'round', 'stroke-linejoin': 'round'}, parent));
  return {gr, draw(P) {
    if (P.length < 3) { for (const p of ps) p.setAttribute('d', ''); return; }
    const d = smooth(P); for (const p of ps) p.setAttribute('d', d);
    const L = P[P.length - 1]; set(gr, {x1: f1(P[0][0]), y1: f1(P[0][1]), x2: f1(L[0]), y2: f1(L[1])});
  }};
}

/* 태양계 — 해는 왼쪽 가장자리에 반쯤 · 궤도는 가는 선 · 행성은 제 빛과 지나온 꼬리(반지름 · 색 · 궤도 배수 · 한 바퀴 초 · 처음 각도) */
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
/* 용 두 마리의 빛깔 — 황룡(금) · 청룡(하늘) */
const GOLD = {fill: '#F2C46A', edge: '#FFE2A0', fin: '#FF9A5C', belly: '#FFF3D6', ring: '#FFE9B8', glit: '#FFE3A0'};
const AZURE = {fill: '#62C9FF', edge: '#D2F3FF', fin: '#A08CFF', belly: '#E8F8FF', ring: '#D8F4FF', glit: '#BDEBFF'};

export function plug() {
  let W = 0, H = 0, vh = 0, fsv = null, aur = null, rays = null, root = null, defs = null, sun = null, seq = 0;
  let act = [], tws = [], nextBig = 0, nextMet = 0, nextShower = 0, last = 0, vt = 0, showAt = -1, showI = 0, lastKind = '';
  const SHOW = [[400, 'shower'], [1500, 'angels'], [7000, 'ship'], [12500, 'dragons'], [25500, 'ufo'], [31500, 'comet']];
  const KINDS = ['angels', 'ship', 'dragons', 'ufo', 'comet'];
  /* 누르거나 내리는 동안은 쉼(0.35초) — 손가락이 먼저(반응 0.2초 잣대) · 쉬는 동안 하늘 시계도 멈춤 */
  let hold = 0;
  const rest = () => { hold = performance.now() + 350; };
  for (const ev of ['pointerdown', 'touchstart', 'keydown', 'wheel', 'scroll']) window.addEventListener(ev, rest, {passive: true, capture: true});
  const layer = (cls, at = {}) => mk('svg', {class: cls, 'aria-hidden': 'true', focusable: 'false', ...at});

  function build(api) {
    W = api.W; H = api.H; vh = api.vh;
    if (!fsv || !fsv.isConnected) {
      aur = [layer('sky-aurora'), layer('sky-aurora a2')]; rays = layer('sky-rays'); fsv = layer('sky-near', {preserveAspectRatio: 'xMaxYMin slice'});
      api.sv.after(aur[0], aur[1], rays, fsv); // 차례: 별 하늘 → 오로라 둘 → 해 빛살 → 나는 것들(모두 글판 아래)
    }
    for (const e of [...aur, rays, fsv]) while (e.firstChild) e.removeChild(e.firstChild);
    set(fsv, {width: W, height: H, viewBox: `0 0 ${W} ${H}`});
    root = mk('g', {class: 'sky-fly'}, fsv);
    defs = mk('defs', {}, root);
    grad(defs, 'radialGradient', 'flyW', [[0, '#FFFFFF', 0.95], [0.2, '#FFF6E2', 0.5], [1, '#FFF6E2', 0]]);
    grad(defs, 'radialGradient', 'flyG', [[0, '#FFF1C8', 0.95], [0.25, '#F2C46A', 0.45], [1, '#F2C46A', 0]]);
    grad(defs, 'radialGradient', 'flyC', [[0, '#E6FCFF', 0.9], [0.3, '#8FE3FF', 0.35], [1, '#8FE3FF', 0]]);
    grad(defs, 'radialGradient', 'flySunHalo', [[0, '#FFD98A', 0.32], [0.35, '#FFB35C', 0.12], [1, '#FF9A3D', 0]]);
    grad(defs, 'radialGradient', 'flyCorona', [[0, '#FFF3C9', 1], [0.38, '#FFD27A', 0.85], [0.62, '#FFAE52', 0.3], [1, '#FF9A3D', 0]]);
    grad(defs, 'radialGradient', 'flyDisk', [[0, '#FFFDF2', 1], [0.6, '#FFE7A6', 1], [1, '#FFC766', 1]]);
    grad(defs, 'linearGradient', 'flyFlame', [[0, '#FFF6D8', 0.95], [0.35, '#FFC266', 0.8], [1, '#FF7A3D', 0]], {x1: 1, y1: 0, x2: 0, y2: 0});
    grad(defs, 'linearGradient', 'flyBeam', [[0, '#BDF6FF', 0.5], [0.6, '#8FE3FF', 0.16], [1, '#8FE3FF', 0]], {x1: 0, y1: 0, x2: 0, y2: 1});
    for (const p of PLANETS) grad(defs, 'radialGradient', 'flyP' + p.k, [[0, p.c, 0.55], [1, p.c, 0]]);
    buildSun(); buildRays(); buildAurora(); buildTwinkles();
    act = [];
    if (showAt < 0) { showAt = vt; nextBig = vt + 38000; nextShower = vt + 42000; }
    nextMet = Math.max(nextMet, vt + 2600);
  }

  /* 오로라 — 위쪽 하늘에 커튼 두 장(초록빛 · 보랏빛) · 그림은 한 번 그리고 층째 천천히 흔들림(space.css skyAur) */
  function buildAurora() {
    const h = Math.round(vh * 0.52);
    aur.forEach((e, k) => {
      set(e, {width: W, height: h, viewBox: `0 0 ${W} ${h}`, preserveAspectRatio: 'none'});
      const d = mk('defs', {}, e), C = k ? ['#B58CFF', '#FF8AD8'] : ['#4FF0C0', '#4CC6FF'], id = 'flyAur' + k;
      grad(d, 'linearGradient', id, [[0, C[0], 0], [0.32, C[0], k ? 0.2 : 0.24], [0.68, C[1], k ? 0.12 : 0.15], [1, C[1], 0]], {x1: 0, y1: 0, x2: 0, y2: 1});
      const base = h * (k ? 0.16 : 0.34), th = h * (k ? 0.32 : 0.38), ph = k ? 1.7 : 0.3, n = 16, top = [], bot = [];
      for (let i = 0; i <= n; i++) {
        const u = i / n, x = -W * 0.12 + W * 1.24 * u, y = base + h * 0.075 * Math.sin(u * TAU * 1.3 + ph) + h * 0.03 * Math.sin(u * TAU * 3.1 + ph * 2);
        top.push([x, y]); bot.push([x, y + th * (0.72 + 0.28 * Math.sin(u * TAU * 0.9 + ph))]);
      }
      mk('path', {d: smooth(top) + smooth(bot.slice().reverse(), false) + 'Z', fill: `url(#${id})`}, e);
      let rd = '';
      for (let i = 0; i < 54; i++) {
        const u = Math.random() * n, j = Math.min(n - 1, Math.floor(u)), f = u - j, x = top[j][0] + (top[j + 1][0] - top[j][0]) * f;
        const y0 = top[j][1] + (top[j + 1][1] - top[j][1]) * f, y1 = bot[j][1] + (bot[j + 1][1] - bot[j][1]) * f;
        rd += `M${f1(x)} ${f1(y0 + (y1 - y0) * 0.12)}V${f1(y1 - (y1 - y0) * rnd(0.12, 0.4))}`;
      }
      mk('path', {d: rd, fill: 'none', stroke: C[0], 'stroke-opacity': k ? 0.07 : 0.09, 'stroke-width': 1.4, 'stroke-linecap': 'round'}, e);
    });
  }

  /* 해 빛살 — 해 둘레 열여섯 줄(그림은 가만있고 층째 천천히 돎 — space.css skyRay) */
  function buildRays() {
    const R = Math.round(Math.min(230, Math.max(W, 340) * 0.5)), {cx, cy} = sun;
    set(rays, {width: 2 * R, height: 2 * R, viewBox: `0 0 ${2 * R} ${2 * R}`});
    rays.style.left = f1(cx - R) + 'px'; rays.style.top = f1(cy - R) + 'px';
    const d = mk('defs', {}, rays);
    grad(d, 'radialGradient', 'flyRay', [[0, '#FFE7A6', 0.6], [0.22, '#FFD27A', 0.34], [0.6, '#FFB35C', 0.1], [1, '#FFB35C', 0]], {gradientUnits: 'userSpaceOnUse', cx: R, cy: R, r: R});
    let p = '';
    for (let k = 0; k < 16; k++) {
      const a = k / 16 * TAU + (k % 2 ? 0.1 : 0), L = R * (k % 2 ? 0.7 : 1), w = k % 2 ? 0.045 : 0.07;
      p += `M${f1(R + Math.cos(a - w) * 24)} ${f1(R + Math.sin(a - w) * 24)}L${f1(R + Math.cos(a) * L)} ${f1(R + Math.sin(a) * L)}L${f1(R + Math.cos(a + w) * 24)} ${f1(R + Math.sin(a + w) * 24)}Z`;
    }
    mk('path', {d: p, fill: 'url(#flyRay)'}, rays);
  }

  function buildSun() {
    const R0 = Math.min(Math.max(W, 340), 560), cx = -W * 0.02, cy = vh * 0.57;
    const g = mk('g', {class: 'sky-sun'}, root);
    mk('circle', {cx: f1(cx), cy: f1(cy), r: f1(R0 * 0.66), fill: 'url(#flySunHalo)'}, g);
    for (const p of PLANETS) mk('circle', {cx: f1(cx), cy: f1(cy), r: f1(p.k * R0), fill: 'none', stroke: '#B4C4FF', 'stroke-opacity': 0.12, 'stroke-width': 0.8}, g);
    const cor = mk('circle', {cx: f1(cx), cy: f1(cy), r: 60, fill: 'url(#flyCorona)'}, g);
    mk('circle', {cx: f1(cx), cy: f1(cy), r: 25, fill: 'url(#flyDisk)'}, g);
    const pl = PLANETS.map(p => {
      const t2 = mk('path', {fill: 'none', stroke: p.c, 'stroke-opacity': 0.14, 'stroke-width': f1(p.r * 0.9), 'stroke-linecap': 'round'}, g);
      const t1 = mk('path', {fill: 'none', stroke: p.c, 'stroke-opacity': 0.36, 'stroke-width': f1(p.r * 1.2), 'stroke-linecap': 'round'}, g);
      const pg = mk('g', {opacity: 0.94}, g);
      mk('circle', {r: f1(p.r * 3.8), fill: `url(#flyP${p.k})`}, pg);
      if (p.ring) { mk('circle', {r: f1(p.r * 2.1), fill: 'none', stroke: p.c, 'stroke-opacity': 0.75, 'stroke-width': 1.3}, pg); mk('circle', {r: f1(p.r * 2.6), fill: 'none', stroke: p.c, 'stroke-opacity': 0.35, 'stroke-width': 0.8}, pg); }
      mk('circle', {r: p.r, fill: p.c}, pg);
      if (p.band) mk('path', {d: `M${-p.r * 0.85} -1.6H${p.r * 0.85}M${-p.r * 0.95} 1.4H${p.r * 0.95}`, stroke: '#B8875A', 'stroke-opacity': 0.7, 'stroke-width': 1}, pg);
      const moon = p.moon ? mk('circle', {r: 1.1, fill: '#E2E6EE'}, pg) : null;
      return {p, pg, moon, t1, t2};
    });
    sun = {g, cx, cy, R0, cor, pl};
  }

  function drawSun(t, move) {
    const {cx, cy, R0} = sun, at = (a, R) => `${f1(cx + Math.cos(a) * R)} ${f1(cy + Math.sin(a) * R)}`;
    for (const {p, pg, moon, t1, t2} of sun.pl) {
      const a = p.a - (move ? t / (p.T * 1000) * TAU : 0), R = p.k * R0;
      pg.setAttribute('transform', `translate(${at(a, R)})`);
      if (moon) { const b = -t / 5200 * TAU; set(moon, {cx: f1(Math.cos(b) * 7.5), cy: f1(Math.sin(b) * 7.5)}); }
      if (move) { const d1 = 30 / R, d2 = 90 / R; t1.setAttribute('d', `M${at(a + d1, R)}A${f1(R)} ${f1(R)} 0 0 0 ${at(a, R)}`); t2.setAttribute('d', `M${at(a + d2, R)}A${f1(R)} ${f1(R)} 0 0 0 ${at(a + d1, R)}`); }
      else { t1.setAttribute('d', ''); t2.setAttribute('d', ''); }
    }
    sun.cor.setAttribute('opacity', f2(move ? 0.86 + 0.14 * Math.sin(t * 0.0013) : 0.95));
  }

  /* 반짝 별 — 하늘 여기저기서 네 갈래 별이 하나씩 피었다 짐(터지지 않음) */
  function buildTwinkles() {
    const g = mk('g', {}, root), C = ['#FFFFFF', '#FFF1C8', '#BDEBFF', '#E6D6FF'];
    tws = Array.from({length: 16}, (_, i) => {
      const e = mk('g', {opacity: 0}, g);
      mk('circle', {r: 7, fill: i % 2 ? 'url(#flyW)' : 'url(#flyC)'}, e);
      mk('path', {d: twinkle(0, 0, 6.5), fill: C[i % C.length]}, e);
      return {e, t0: vt + rnd(0, 5000), dur: rnd(1800, 3600), x: rnd(0, W), y: rnd(vh * 0.08, vh * 0.95), s: rnd(0.6, 1.3), r: rnd(0, 45)};
    });
  }
  function drawTwinkles(move) {
    for (const w of tws) {
      if (!move) { w.e.setAttribute('opacity', 0); continue; }
      const p = (vt - w.t0) / w.dur;
      if (p < 0) continue;
      if (p > 1) { w.t0 = vt + rnd(200, 2600); w.dur = rnd(1800, 3600); w.x = rnd(0, W); w.y = rnd(vh * 0.08, vh * 0.95); w.s = rnd(0.6, 1.3); w.r = rnd(0, 45); w.e.setAttribute('opacity', 0); continue; }
      const s = Math.sin(Math.PI * p);
      w.e.setAttribute('transform', `translate(${f1(w.x)} ${f1(w.y)}) rotate(${f1(w.r + p * 40)}) scale(${f2(w.s * (0.25 + 0.75 * s))})`);
      w.e.setAttribute('opacity', f2(s));
    }
  }

  /* 연기 · 반짝이 — 미리 만든 점을 돌려 씀 */
  function dust(parent, n, color, life, grow, fall, a0 = 0.85) {
    const P = Array.from({length: n}, () => ({e: mk('circle', {cx: -99, cy: -99, r: 0, fill: color, opacity: 0}, parent), t: -1e9, x: 0, y: 0, r0: 1, on: false}));
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

  /* 별똥별 — 밝은 머리 + 가늘어지는 꼬리 한 줄(아래 왼쪽으로) · o = 별똥별 비에서 정한 자리와 빠르기 */
  function meteor(t, o = {}) {
    const g = mk('g', {}, root), id = 'flyM' + (++seq), tint = o.tint ?? ['#FFF0CC', '#C4D4FF'];
    const gr = grad(defs, 'linearGradient', id, [[0, '#FFFFFF', 0.95], [0.16, tint[0], 0.75], [0.55, tint[1], 0.22], [1, tint[1], 0]], {gradientUnits: 'userSpaceOnUse'});
    const wide = mk('path', {fill: `url(#${id})`, opacity: 0.32}, g), core = mk('path', {fill: `url(#${id})`}, g);
    const halo = mk('circle', {r: 12, fill: 'url(#flyW)'}, g), head = mk('circle', {r: 1.8, fill: '#FFFFFF'}, g);
    const an = (o.an ?? rnd(24, 40)) / DEG, sp = o.sp ?? rnd(0.3, 0.42), vx = -Math.cos(an), vy = Math.sin(an), L = o.L ?? rnd(170, 270), life = o.life ?? rnd(1700, 2400);
    const x0 = o.x0 ?? W * rnd(0.42, 1.12), y0 = o.y0 ?? vh * rnd(-0.03, 0.34);
    return {g, grs: [gr], step(now) {
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

  /* 별똥별 비 — 한 자리(오른쪽 위)에서 여덟 줄이 차례로(3초 남짓) · 터지지 않고 한 줄씩 */
  function shower(t) {
    const rx = W * rnd(0.62, 0.98), ry = -vh * 0.03, n = 8, T = [];
    for (let i = 0, a = t; i < n; i++) { T.push(a); a += rnd(220, 520); }
    const tints = [['#FFF0CC', '#C4D4FF'], ['#E6FCFF', '#8FE3FF'], ['#F4E8FF', '#B996FF'], ['#FFF6D8', '#FFC266']];
    let k = 0;
    return {g: mk('g', {}, root), step(now) {
      while (k < n && now >= T[k]) { spawn('meteor', now, {x0: rx + rnd(-40, 40), y0: ry + rnd(-10, 30), an: rnd(26, 64), sp: rnd(0.36, 0.56), L: rnd(150, 320), life: rnd(1500, 2300), tint: tints[k % tints.length]}); k++; }
      return k < n;
    }};
  }

  /* 혜성 — 흰 머리 · 금빛 먼지 꼬리(넓게 휨) · 하늘빛 이온 꼬리(곧게) · 15초에 위쪽 하늘을 건넘 */
  function comet(t) {
    const g = mk('g', {class: 'sky-comet'}, root), id = 'flyCo' + (++seq), id2 = 'flyCi' + seq;
    const gr = grad(defs, 'linearGradient', id, [[0, '#FFFFFF', 0.7], [0.22, '#FFF0CC', 0.42], [0.6, '#FFD27A', 0.14], [1, '#FFD27A', 0]], {gradientUnits: 'userSpaceOnUse'});
    const gr2 = grad(defs, 'linearGradient', id2, [[0, '#E6FCFF', 0.75], [0.5, '#8FE3FF', 0.25], [1, '#7FD8FF', 0]], {gradientUnits: 'userSpaceOnUse'});
    const tailD = mk('path', {fill: `url(#${id})`}, g), ion = mk('path', {fill: 'none', stroke: `url(#${id2})`, 'stroke-width': 1.8, 'stroke-linecap': 'round'}, g);
    const ion2 = mk('path', {fill: 'none', stroke: `url(#${id2})`, 'stroke-width': 7, 'stroke-opacity': 0.2, 'stroke-linecap': 'round'}, g);
    const sp = dust(g, 14, '#FFF1C8', 1700, -0.5, 12, 0.8);
    const coma2 = mk('circle', {r: 46, fill: 'url(#flyC)', opacity: 0.35}, g), coma = mk('circle', {r: 24, fill: 'url(#flyW)'}, g), nuc = mk('circle', {r: 2.8, fill: '#FFFFFF'}, g);
    const dir = Math.random() < 0.5 ? 1 : -1, x0 = dir > 0 ? -70 : W + 70, x1 = dir > 0 ? W + 300 : -300, y0 = vh * rnd(0.07, 0.2), y1 = y0 + vh * rnd(0.06, 0.2), dur = 15500;
    const l = Math.hypot(x1 - x0, y1 - y0), ux = -(x1 - x0) / l, uy = -(y1 - y0) / l, nx = -uy * dir, ny = ux * dir;
    let pk = 0;
    return {g, big: true, grs: [gr, gr2], step(now) {
      const u = (now - t) / dur; if (u > 1) return false;
      const x = x0 + (x1 - x0) * u, y = y0 + (y1 - y0) * u - 16 * Math.sin(u * Math.PI);
      const L = 250, w = 38, cx = x + ux * L * 0.55 + nx * 22, cy = y + uy * L * 0.55 + ny * 22, ex = x + ux * L + nx * 46, ey = y + uy * L + ny * 46;
      tailD.setAttribute('d', `M${f1(x + nx * 5)} ${f1(y + ny * 5)}Q${f1(cx + nx * w * 0.55)} ${f1(cy + ny * w * 0.55)} ${f1(ex + nx * w)} ${f1(ey + ny * w)}L${f1(ex - nx * w * 0.5)} ${f1(ey - ny * w * 0.5)}Q${f1(cx - nx * w * 0.25)} ${f1(cy - ny * w * 0.25)} ${f1(x - nx * 5)} ${f1(y - ny * 5)}Z`);
      set(gr, {x1: f1(x), y1: f1(y), x2: f1(ex), y2: f1(ey)});
      const ix = x + ux * 330 - nx * 8, iy = y + uy * 330 - ny * 8, id = `M${f1(x)} ${f1(y)}L${f1(ix)} ${f1(iy)}`;
      ion.setAttribute('d', id); ion2.setAttribute('d', id); set(gr2, {x1: f1(x), y1: f1(y), x2: f1(ix), y2: f1(iy)});
      for (const c of [coma2, coma, nuc]) set(c, {cx: f1(x), cy: f1(y)});
      coma2.setAttribute('opacity', f2(0.3 + 0.1 * Math.sin(now * 0.004)));
      g.setAttribute('opacity', f2(Math.min(1, u * 9, (1 - u) * 9)));
      if (now - pk > 120) { pk = now; const k = rnd(0.2, 0.9); sp.add(now, x + ux * L * k + nx * rnd(10, 40) * k, y + uy * L * k + ny * rnd(10, 40) * k, rnd(0.8, 1.6)); }
      sp.step(now);
      return true;
    }};
  }

  /* 우주선 — 은빛 몸 · 하늘빛 창 · 꼬리 불(흔들림) · 지나간 길에 하늘빛 → 보랏빛 → 분홍빛으로 옅어지는 빛 꼬리 · 불티 */
  function ship(t) {
    const g = mk('g', {class: 'sky-ship'}, root);
    const trail = ribbon(g, defs, 'flySt' + (++seq), [[0, '#C8FCFF', 0.95], [0.35, '#B98CFF', 0.55], [0.75, '#FF86D8', 0.18], [1, '#FF86D8', 0]], [11, 2.8], [0.22, 1]);
    const sparks = dust(g, 18, '#FFE7A8', 900, -0.6, 10, 0.9);
    const s = mk('g', {}, g), flame = mk('g', {}, s);
    mk('path', {d: 'M-19 -3.6Q-48 0 -19 3.6Z', fill: 'url(#flyFlame)'}, flame);
    mk('circle', {cx: -21, r: 11, fill: 'url(#flyG)', opacity: 0.9}, flame);
    const body = 'M23 0C16 -7.5 -4 -8.6 -15 -6.4L-19.5 -3.4L-19.5 3.4L-15 6.4C-4 8.6 16 7.5 23 0Z';
    mk('path', {d: body, fill: '#16203F', 'fill-opacity': 0.85}, s);
    glow(s, '#E4ECFF', [8, 3.6, 1.2], [0.1, 0.24, 0.95]).d(body + 'M-9 -7.4L-20 -15.5L-16.5 -6.3M-9 7.4L-20 15.5L-16.5 6.3M-4 -7.8V7.8M14 -4.6C16 -2 16 2 14 4.6');
    mk('circle', {cx: 6, r: 10, fill: 'url(#flyC)'}, s);
    mk('circle', {cx: 6, r: 3.4, fill: '#CFF6FF'}, s);
    glow(s, '#CFF6FF', [5, 2.2, 0.9], [0.08, 0.25, 0.9]).d('M1.4 0A4.6 4.6 0 1 0 10.6 0A4.6 4.6 0 1 0 1.4 0');
    const lt = [mk('circle', {cx: -19.5, cy: -15.2, r: 1.6, fill: '#F2C46A'}, s), mk('circle', {cx: -19.5, cy: 15.2, r: 1.6, fill: '#8FE3FF'}, s)];
    const up = Math.random() < 0.5, P0 = [-80, vh * (up ? 0.74 : 0.2)], P1 = [W * 0.28, vh * (up ? 0.6 : 0.08)], P2 = [W * 0.62, vh * (up ? 0.22 : 0.5)], P3 = [W + 90, vh * (up ? 0.12 : 0.36)];
    const dur = 12000, K = 1.8, B = (u, k) => { const v = 1 - u; return v * v * v * P0[k] + 3 * v * v * u * P1[k] + 3 * v * u * u * P2[k] + u * u * u * P3[k]; };
    const hist = []; let hs = 0, sk = 0;
    return {g, big: true, grs: [trail.gr], step(now) {
      const age = now - t, u = age / dur; if (u > 1.25) return false;
      const uu = Math.min(1, u), x = B(uu, 0), y = B(uu, 1), x2 = B(Math.min(1, uu + 0.01), 0), y2 = B(Math.min(1, uu + 0.01), 1);
      const a = Math.atan2(y2 - y, x2 - x), bob = 3 * Math.sin(age * 0.004), ex = x - Math.cos(a) * 22 * K, ey = y + bob - Math.sin(a) * 22 * K;
      s.setAttribute('transform', tf(x, y + bob, a * DEG, K, K));
      flame.setAttribute('transform', `translate(-19 0) scale(${f2(0.85 + 0.4 * Math.abs(Math.sin(age * 0.023)) + 0.1 * Math.sin(age * 0.051))} 1) translate(19 0)`);
      const on = Math.floor(age / 450) % 2; lt[0].setAttribute('opacity', on ? 1 : 0.25); lt[1].setAttribute('opacity', on ? 0.25 : 1);
      if (u < 1 && now - hs > 40) { hs = now; hist.push([ex, ey]); if (hist.length > 44) hist.shift(); }
      if (u >= 1 && hist.length) hist.shift();
      trail.draw(u < 1 ? [[ex, ey], ...hist.slice().reverse()] : hist.slice().reverse());
      if (u < 1 && now - sk > 70) { sk = now; sparks.add(now, ex + rnd(-3, 3), ey + rnd(-3, 3), rnd(0.8, 1.6)); }
      sparks.step(now);
      return true;
    }};
  }

  /* 비행접시 — 납작한 접시 · 하늘빛 덮개 · 둘레 빛고리 · 가장자리 불이 차례로 · 한가운데 떠서 아래로 빛기둥과 오르는 반짝이 · 그리고 빠르게 감 */
  function ufo(t) {
    const g = mk('g', {class: 'sky-ufo'}, root), s = mk('g', {}, g), up = dust(g, 16, '#CFF6FF', 1300, -0.5, -46, 0.9);
    const beam = mk('path', {d: 'M-9 6L-30 92L30 92L9 6Z', fill: 'url(#flyBeam)', opacity: 0}, s);
    mk('ellipse', {cy: 6, rx: 28, ry: 11, fill: 'url(#flyC)', opacity: 0.6}, s);
    const ring = mk('ellipse', {cy: 0.5, rx: 31, ry: 8.5, fill: 'none', stroke: '#CFF6FF', 'stroke-width': 1, opacity: 0.5}, s);
    mk('path', {d: 'M-9 -3C-9 -13 9 -13 9 -3Z', fill: '#BFF2FF', 'fill-opacity': 0.35}, s);
    glow(s, '#CFF6FF', [7, 3, 1.1], [0.08, 0.22, 0.95]).d('M-9 -3C-9 -13 9 -13 9 -3');
    mk('path', {d: 'M-24 0C-16 -6 16 -6 24 0C16 6 -16 6 -24 0Z', fill: '#1A2547', 'fill-opacity': 0.9}, s);
    glow(s, '#E4ECFF', [8, 3.4, 1.2], [0.08, 0.22, 0.95]).d('M-24 0C-16 -6 16 -6 24 0C16 6 -16 6 -24 0Z');
    const C = ['#F2C46A', '#8FE3FF', '#FF86D8', '#B98CFF', '#F2C46A'];
    const L = [-15, -7.5, 0, 7.5, 15].map((x, i) => mk('circle', {cx: x, cy: 1.2, r: 1.6, fill: C[i], opacity: 0.3}, s));
    const dir = Math.random() < 0.5 ? -1 : 1, y0 = vh * rnd(0.26, 0.44), xs = dir < 0 ? W + 60 : -60, xm = W * (dir < 0 ? 0.58 : 0.42), xe = dir < 0 ? -100 : W + 100;
    const T1 = 4300, T2 = 2800, T3 = 2300, K = 1.8; let pk = 0;
    return {g, big: true, step(now) {
      const age = now - t; if (age > T1 + T2 + T3 + 1400) return false;
      let x, tilt = 0, bm = 0;
      if (age < T1) { const u = age / T1, e = 1 - (1 - u) * (1 - u); x = xs + (xm - xs) * e; tilt = -dir * 6 * (1 - u); }
      else if (age < T1 + T2) { const v = (age - T1) / T2; x = xm; tilt = 4 * Math.sin((age - T1) * 0.006); bm = Math.min(1, v * 4, (1 - v) * 4); }
      else { const u = Math.min(1.4, (age - T1 - T2) / T3); x = xm + (xe - xm) * u * u; tilt = dir * 10 * Math.min(1, u * 3); }
      const y = y0 + 6 * Math.sin(age * 0.0026);
      s.setAttribute('transform', tf(x, y, tilt, K, K));
      beam.setAttribute('opacity', f2(bm));
      ring.setAttribute('opacity', f2(0.35 + 0.3 * Math.sin(age * 0.008)));
      const k = Math.floor(age / 110) % L.length; L.forEach((c, i) => c.setAttribute('opacity', i === k ? 1 : 0.3));
      if (bm > 0.3 && now - pk > 90) { pk = now; up.add(now, x + rnd(-22, 22) * K * 0.6, y + 80 * K * rnd(0.6, 0.95), rnd(0.8, 1.5)); }
      up.step(now);
      return true;
    }};
  }

  /* 용 한 마리 — 몸(마디진 배) · 등 지느러미 · 발 둘 · 머리 · 수염 · 꼬리 불꽃 · 몸을 따라 흐르는 빛 */
  function oneDragon(g, C, dir, N) {
    const body = mk('path', {fill: C.fill, 'fill-opacity': 0.18}, g);
    const belly = mk('path', {fill: C.belly, 'fill-opacity': 0.13}, g);
    const rings = mk('path', {fill: 'none', stroke: C.ring, 'stroke-opacity': 0.42, 'stroke-width': 0.9, 'stroke-linecap': 'round'}, g);
    const edge = glow(g, C.edge, [13, 5, 1.2], [0.07, 0.2, 0.92]);
    const shine = mk('path', {fill: 'none', stroke: '#FFFFFF', 'stroke-opacity': 0.6, 'stroke-width': 2.4, 'stroke-linecap': 'round', 'stroke-dasharray': `16 ${N * 9}`}, g);
    const fins = glow(g, C.fin, [7, 2.8, 1], [0.08, 0.26, 0.92]), finFill = mk('path', {fill: C.fin, 'fill-opacity': 0.16}, g);
    const legs = [5, 20].map(i => ({i, g: mk('g', {}, g)}));
    for (const l of legs) {
      glow(l.g, C.edge, [6, 2.6, 1.1], [0.07, 0.22, 0.95]).d('M0 0C2 4.5 0.5 8 -4 10.5M-4 10.5L-9 11.2M-4 10.5L-6.4 15M-4 10.5L-1.6 14.6');
      glow(l.g, C.fin, [5, 2, 0.9], [0.07, 0.22, 0.85]).d('M-0.5 2.5C-4 3 -6 1.5 -8.5 3M0.4 5C-3 6.5 -5.5 6 -8 8');
    }
    const tail = mk('g', {}, g), TAIL = 'M0 0C-7 -5 -13 -3 -19 -12C-16 -5 -17 -1.5 -24 0.5C-17 2 -14 6 -18 13C-11 7 -6 4 0 0Z';
    mk('path', {d: TAIL, fill: C.fin, 'fill-opacity': 0.2}, tail);
    glow(tail, C.fin, [7, 3, 1.1], [0.08, 0.24, 0.92]).d(TAIL + 'M-4 -1C-9 -3.5 -12 -4 -15 -6M-5 1C-10 2.5 -13 3.5 -15.5 6');
    const head = mk('g', {}, g);
    mk('path', {d: 'M-6 -6C0 -10 10 -10 18 -7C22 -6 25 -5 27 -3C28 -2 27.5 -1 26 -0.5C21 0 15 0.5 9 1.5C13 2.5 19 2.8 24 3C19 5 13 6.5 8 6C3 6.5 -2 6 -6 5Z', fill: C.fill, 'fill-opacity': 0.26}, head);
    glow(head, C.edge, [12, 4.8, 1.3], [0.08, 0.22, 0.96]).d('M-6 -6C0 -10 10 -10 18 -7C22 -6 25 -5 27 -3C28 -2 27.5 -1 26 -0.5C21 0 15 0.5 9 1.5M24 3C19 5 13 6.5 8 6C3 6.5 -2 6 -6 5M9 1.5C13 2.5 19 2.8 24 3M24 -5.5C25.5 -7.5 27.5 -7 27 -5M3 -8C6 -10.2 10 -9.6 12.2 -7.4M-2 -8C-6 -15 -12 -20 -22 -23M-11 -18C-11 -22 -9 -25 -6 -27M1 -8.5C-2 -16 -6 -22 -14 -27.5M-6.5 -20C-9 -23 -9.5 -26 -9 -29');
    glow(head, '#FFFFFF', [4, 1.8, 0.9], [0.08, 0.3, 0.95]).d('M22 -0.2L21.2 2.2M17.5 0.4L16.8 2.6M20 3.2L20.6 1.3');
    glow(head, C.fin, [8, 3.2, 1.1], [0.07, 0.22, 0.9]).d('M-5 -5C-11 -8 -16 -4 -22 -8M-6 -1C-13 -1 -18 2 -25 -1M-6 3C-12 5 -17 9 -24 7M-5 6C-10 10 -14 13 -20 14M10 6.5C9 9 6 11 3 11.8M14 6C13 8.5 11 10.5 8 11.8');
    mk('ellipse', {cx: 8.5, cy: -5, rx: 2.2, ry: 1.3, fill: '#FFFFFF'}, head);
    mk('circle', {cx: 8.5, cy: -5, r: 6.5, fill: 'url(#flyW)', opacity: 0.8}, head);
    const wh = glow(head, C.ring, [5, 2.2, 0.9], [0.07, 0.2, 0.85]);
    const nb = (dx, dy) => (dir > 0 ? [dy, -dx] : [-dy, dx]); // 등 쪽(위)
    return {update(S, hp, ha, age, glit) {
      head.setAttribute('transform', tf(hp[0], hp[1], ha * DEG, 1.25, 1.25 * dir));
      const Lf = [], Rt = [], B1 = [], B2 = [], back = [];
      for (let i = 0; i <= N; i++) {
        const a = S[Math.max(0, i - 1)], b = S[Math.min(N, i + 1)], dx = a[0] - b[0], dy = a[1] - b[1], l = Math.hypot(dx, dy) || 1, [bx, by] = nb(dx / l, dy / l);
        const w = (i < 3 ? 10 + i * 2.2 : 17 * Math.pow(1 - (i - 3) / (N - 3), 0.8) + 1.3) / 2;
        Lf.push([S[i][0] + bx * w, S[i][1] + by * w]); Rt.push([S[i][0] - bx * w, S[i][1] - by * w]);
        B1.push([S[i][0] - bx * w * 0.1, S[i][1] - by * w * 0.1]); B2.push([S[i][0] - bx * w * 0.86, S[i][1] - by * w * 0.86]);
        back.push({x: S[i][0] + bx * w, y: S[i][1] + by * w, bx, by, tx: dx / l, ty: dy / l});
      }
      const shape = smooth(Lf) + smooth(Rt.slice().reverse(), false) + 'Z', spine = smooth(S);
      body.setAttribute('d', shape); edge.d(shape);
      belly.setAttribute('d', smooth(B1) + smooth(B2.slice().reverse(), false) + 'Z');
      let rd = '';
      for (let i = 1; i < N - 2; i += 2) rd += `M${f1(B1[i][0])} ${f1(B1[i][1])}L${f1(B2[i][0])} ${f1(B2[i][1])}`;
      rings.setAttribute('d', rd);
      shine.setAttribute('d', spine); shine.setAttribute('stroke-dashoffset', f1(-((age * 0.2) % (N * 9 + 16))));
      let fd = '';
      for (let i = 2; i < N - 3; i += 2) {
        const p = back[i], q = back[i + 2] ?? back[i + 1], h = 4 + 4.6 * (1 - i / N), ax = p.x + p.bx * h - p.tx * 4.5, ay = p.y + p.by * h - p.ty * 4.5;
        fd += `M${f1(p.x)} ${f1(p.y)}Q${f1(ax + p.tx * 2)} ${f1(ay + p.ty * 2)} ${f1(ax)} ${f1(ay)}Q${f1((ax + q.x) / 2)} ${f1((ay + q.y) / 2 - p.by * 0.5)} ${f1(q.x)} ${f1(q.y)}`;
      }
      fins.d(fd || 'M0 0'); finFill.setAttribute('d', fd || 'M0 0');
      for (const l of legs) {
        const i = l.i, p = Rt[i], s0 = S[Math.max(0, i - 1)], s1 = S[i + 1], a = Math.atan2(s0[1] - s1[1], s0[0] - s1[0]) * DEG;
        l.g.setAttribute('transform', tf(p[0], p[1], a + 16 * Math.sin(age * 0.006 + i), 1.15, 1.15 * dir));
      }
      const e = S[N], e2 = S[N - 1];
      tail.setAttribute('transform', tf(e[0], e[1], Math.atan2(e2[1] - e[1], e2[0] - e[0]) * DEG, 1.15, 1.15 * dir)); // 꼬리 불꽃은 몸 밖으로
      const sw = Math.sin(age * 0.005), sw2 = Math.sin(age * 0.004 + 1);
      wh.d(`M25 -2C14 ${f1(-12 - 3 * sw)} -6 ${f1(-6 + 4 * sw)} -30 ${f1(-12 + 7 * sw)}M24 3C14 ${f1(11 + 3 * sw2)} -4 ${f1(5 - 4 * sw2)} -27 ${f1(12 - 7 * sw2)}`);
      if (glit) { const k = 6 + Math.floor(Math.random() * (N - 8)); glit(Lf[k][0] + rnd(-3, 3), Lf[k][1] + rnd(-3, 3)); }
    }};
  }

  /* 용 두 마리 — 황룡과 청룡이 서로 꼬며(두 줄 나선) 하나의 여의주를 쫓음 · 몸은 머리가 지나간 길을 그대로 따라옴 */
  function dragons(t, dir) {
    const g = mk('g', {class: 'sky-dragon'}, root), gG = mk('g', {}, g), gA = mk('g', {}, g);
    const N = 34, SP = 7.2, LEN = N * SP + 50;
    const y0 = vh * rnd(0.24, 0.46), y1 = y0 + vh * rnd(-0.1, 0.1);
    const xs = dir > 0 ? -60 : W + 60, xe = dir > 0 ? W + LEN + 80 : -LEN - 80;
    const D = Math.hypot(xe - xs, y1 - y0), ux = (xe - xs) / D, uy = (y1 - y0) / D, nx = -uy, ny = ux;
    const A = Math.min(40, vh * 0.05), lam = rnd(250, 310), ph = rnd(0, TAU), C2 = 22, lc = rnd(150, 190), v = 0.056;
    const P = (s, age, k) => { const o = A * Math.sin(s / lam * TAU + ph) + k * C2 * Math.sin(s / lc * TAU + ph * 0.7) + 4 * Math.sin(s / 34 - age * 0.0045); return [xs + ux * s + nx * o, y0 + uy * s + ny * o]; };
    const gold = oneDragon(gG, GOLD, dir, N), azure = oneDragon(gA, AZURE, dir, N);
    const glitG = dust(g, 14, GOLD.glit, 1300, -0.5, 10, 0.8), glitA = dust(g, 14, AZURE.glit, 1300, -0.5, 10, 0.8);
    const pearl = mk('g', {}, g);
    mk('circle', {r: 30, fill: 'url(#flyG)'}, pearl); mk('circle', {r: 18, fill: 'url(#flyC)', opacity: 0.6}, pearl);
    mk('circle', {r: 5.5, fill: '#FFF8E8'}, pearl);
    const wisp = mk('g', {}, pearl);
    glow(wisp, '#FFB35C', [5, 2, 0.9], [0.08, 0.25, 0.9]).d('M0 -10C3.5 -12.5 5.5 -11 8 -13.5M9 5C12 6 13 9.5 15.5 9.5M-9 5C-11 8.5 -14 8.5 -15.5 11.5');
    mk('path', {d: twinkle(0, 0, 11), fill: '#FFF8E8', opacity: 0.5}, wisp);
    let gl = 0;
    return {g, big: true, step(now) {
      const age = now - t, sh = v * age; if (sh > D + LEN + 120) return false;
      const go = now - gl > 120; if (go) gl = now;
      for (const [dr, k, off, glit] of [[gold, 1, 0, glitG], [azure, -1, 26, glitA]]) {
        const s0 = sh - off, S = [];
        for (let i = 0; i <= N; i++) S.push(P(s0 - 8 - i * SP, age, k));
        const hp = P(s0, age, k), hq = P(s0 + 2, age, k);
        dr.update(S, hp, Math.atan2(hq[1] - hp[1], hq[0] - hp[0]), age, go ? (x, y) => glit.add(now, x, y, rnd(0.8, 1.5)) : null);
        glit.step(now);
      }
      const pp = P(sh + 48 + 6 * Math.sin(age * 0.0021), age, 0);
      pearl.setAttribute('transform', tf(pp[0], pp[1]));
      wisp.setAttribute('transform', `rotate(${f1(age * 0.12)})`);
      return true;
    }};
  }

  /* 천사 다섯 — ∨ 꼴로 날며 몸을 앞으로 눕힌 옆모습 · 금빛 고리 · 큰 날개짓 · 두 갈래 옷자락 · 손에 든 별 · 지나간 길에 금빛 빛 꼬리와 반짝이 */
  function angels(t, dir) {
    const g = mk('g', {class: 'sky-angels'}, root), tg = mk('g', {}, g), spark = dust(g, 34, '#FFE7A8', 1600, -0.6, 16, 0.9);
    const y0 = vh * rnd(0.22, 0.34), y1 = y0 - vh * rnd(-0.04, 0.08), dur = 17000, xs = dir > 0 ? -90 : W + 90, xe = dir > 0 ? W + 210 : -210;
    const WING = 'M0 0C-1 -9 -8 -19 -20 -26C-17 -20 -18 -17 -14.5 -14C-19 -13 -19 -9.5 -13.5 -7.5C-17 -6 -15.5 -2.5 -10.5 -2.5C-7 -1.5 -3 -0.5 0 0Z';
    const FEATH = 'M-3 -4C-7 -8 -11 -12 -15 -15M-4 -1.5C-8 -3.5 -11 -5 -14 -7';
    const F = [{dx: 0, dy: 0, s: 1.5, ph: 0}, {dx: -40, dy: -30, s: 1.25, ph: 1.1}, {dx: -40, dy: 30, s: 1.25, ph: 2.2}, {dx: -78, dy: -56, s: 1.05, ph: 3.3}, {dx: -78, dy: 56, s: 1.05, ph: 4.4}];
    const crew = F.map(c => {
      const tr = ribbon(tg, defs, 'flyAt' + (++seq), [[0, '#FFF6DE', 0.75], [0.4, '#F2C46A', 0.3], [1, '#F2C46A', 0]], [7, 1.6], [0.2, 0.9]);
      const a = mk('g', {}, g);
      const wf = mk('g', {}, a);
      mk('path', {d: WING, fill: '#FFFFFF', 'fill-opacity': 0.07}, wf); glow(wf, '#FFF8EC', [6, 1.2], [0.08, 0.45]).d(WING + FEATH);
      const robe = mk('path', {fill: '#FFFFFF', 'fill-opacity': 0.15}, a), robeL = glow(a, '#FFF8EC', [9, 3.6, 1.1], [0.06, 0.2, 0.92]);
      const fold = mk('path', {fill: 'none', stroke: '#FFF8EC', 'stroke-opacity': 0.45, 'stroke-width': 0.8, 'stroke-linecap': 'round'}, a);
      glow(a, '#FFF8EC', [5, 1.1], [0.1, 0.88]).d('M5 -4C9 -3.5 12 -4.5 15 -6.5');
      mk('circle', {cx: 17, cy: -7.5, r: 8, fill: 'url(#flyG)'}, a);
      const star = mk('path', {d: twinkle(17, -7.5, 4), fill: '#FFF1C8'}, a);
      glow(a, '#FFF1D6', [4, 0.9], [0.1, 0.75]).d('M7 -12C3 -13.5 0 -12 -3 -13.5M6.5 -10C3 -10.5 0.5 -9 -2.5 -9.5');
      mk('circle', {cx: 9.5, cy: -9.5, r: 11, fill: 'url(#flyW)', opacity: 0.6}, a);
      mk('circle', {cx: 9.5, cy: -9.5, r: 3.6, fill: '#FFF7E6'}, a);
      const halo = mk('g', {transform: 'rotate(-14 10.5 -15.4)'}, a);
      mk('ellipse', {cx: 10.5, cy: -15.4, rx: 8, ry: 4, fill: 'url(#flyG)', opacity: 0.7}, halo);
      glow(halo, '#F2C46A', [6, 2.8, 1.2], [0.12, 0.34, 1]).d('M5.5 -15.4A5 1.6 0 1 0 15.5 -15.4A5 1.6 0 1 0 5.5 -15.4');
      const wn = mk('g', {}, a);
      mk('path', {d: WING, fill: '#FFFFFF', 'fill-opacity': 0.16}, wn); glow(wn, '#FFF8EC', [9, 3.6, 1.1], [0.06, 0.2, 0.92]).d(WING + FEATH);
      return {...c, a, wf, wn, robe, robeL, fold, star, tr, hist: [], hs: 0};
    });
    let sp = 0;
    return {g, big: true, grs: crew.map(c => c.tr.gr), step(now) {
      const age = now - t, u = age / dur; if (u > 1) return false;
      const bx = xs + (xe - xs) * u, by = y0 + (y1 - y0) * u;
      for (const c of crew) {
        const x = bx + c.dx * dir * c.s, y = by + c.dy + 9 * Math.sin(age * 0.0019 + c.ph);
        c.a.setAttribute('transform', tf(x, y, -5 * Math.cos(age * 0.0019 + c.ph) * dir, dir * c.s, c.s));
        const fl = Math.sin(age * 0.0105 + c.ph);
        c.wn.setAttribute('transform', `translate(2 -5) rotate(${f1(-10 + 30 * fl)})`);
        c.wf.setAttribute('transform', `translate(3.5 -6.5) rotate(${f1(-22 + 26 * fl)}) scale(0.88)`);
        const h1 = 2.6 * Math.sin(age * 0.009 + c.ph), h2 = 2.4 * Math.sin(age * 0.008 + c.ph + 1.7);
        const d = `M7 -5C3 -4 -1 -2 -4 1C-11 6 -21 8 -34 ${f1(8.5 + h1)}C-27 11 -20 12.5 -12 11.5C-16 13.5 -22 14 -28 ${f1(13.5 + h2)}C-18 16.5 -7 14.5 -1 9.5C3 6 6 2 8 -2Z`;
        c.robe.setAttribute('d', d); c.robeL.d(d); c.fold.setAttribute('d', `M-2 2C-9 6 -18 9 -27 ${f1(10.5 + h1 * 0.6)}`);
        c.star.setAttribute('opacity', f2(0.75 + 0.25 * Math.sin(age * 0.008 + c.ph * 2)));
        const tx = x - 30 * dir * c.s, ty = y + 10 * c.s;
        if (now - c.hs > 45) { c.hs = now; c.hist.push([tx, ty]); if (c.hist.length > 26) c.hist.shift(); }
        c.tr.draw([[tx, ty], ...c.hist.slice().reverse()]);
      }
      if (u < 0.97 && now - sp > 70) { sp = now; const q = crew[Math.floor(Math.random() * crew.length)]; spark.add(now, bx + (q.dx - 30) * dir * q.s + rnd(-3, 3), by + q.dy + 11 * q.s + 9 * Math.sin(age * 0.0019 + q.ph), rnd(0.9, 1.8)); }
      spark.step(now);
      return true;
    }};
  }

  function spawn(kind, now, o) {
    const dir = Math.random() < 0.5 ? -1 : 1;
    const f = kind === 'angels' ? angels(now, dir) : kind === 'ship' ? ship(now) : kind === 'dragons' ? dragons(now, dir) : kind === 'ufo' ? ufo(now) : kind === 'comet' ? comet(now) : kind === 'shower' ? shower(now) : meteor(now, o);
    f.kind = kind; act.push(f);
    return f;
  }
  /** 다음 큰 것 — 지금 날고 있는 것 · 바로 앞 것과 다른 것 */
  function pick() {
    const on = new Set(act.filter(f => f.big).map(f => f.kind)), ks = KINDS.filter(k => !on.has(k) && k !== lastKind);
    return ks.length ? ks[Math.floor(Math.random() * ks.length)] : '';
  }

  function draw(now, move) {
    if (!root) return;
    if (move && now < hold) { last = now; return; } // 누르는 · 내리는 중 — 그리지 않음(시계도 멈춤)
    vt += last ? Math.min(100, Math.max(0, now - last)) : 0; last = now; // 창이 숨었다 오면 한 걸음만
    drawSun(vt, move); drawTwinkles(move);
    if (!move) { for (const f of act) { f.g.remove(); for (const x of f.grs ?? []) x.remove(); } act = []; return; }
    while (showI < SHOW.length && vt - showAt >= SHOW[showI][0]) { lastKind = SHOW[showI][1]; spawn(SHOW[showI][1], vt); showI++; }
    if (showI >= SHOW.length) {
      if (vt >= nextShower) { spawn('shower', vt); nextShower = vt + rnd(35000, 50000); }
      if (vt >= nextBig && act.filter(f => f.big).length < 2) { const k = pick(); if (k) { lastKind = k; spawn(k, vt); } nextBig = vt + rnd(4000, 8000); }
    }
    if (vt >= nextMet) { spawn('meteor', vt); nextMet = vt + rnd(2500, 6000); }
    const cur = act; act = [];
    for (const f of cur) { if (f.step(vt)) act.push(f); else { f.g.remove(); for (const x of f.grs ?? []) x.remove(); } } // 걸음 중에 새로 난 것(별똥별 비)은 act 에 바로 들어감
  }

  return {build, draw, busy: () => performance.now() >= hold, spawn: k => spawn(k, vt)};
}
