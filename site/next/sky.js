/* 뒤 별 하늘 — 시험판 「우주 돌이」의 밤하늘을 진짜 사이트에(사장님 2026-10-20 20:10 「맞아 멋지게 만들어」 · 20:27 「올려  우주」)
   북극성을 가운데 두고 아주 천천히 돎(13분에 한 바퀴 · 북쪽 하늘처럼 반시계) · 별은 작게 숨 쉼 · 백 개에 일곱 개꼴 밝은 별 = 번지는 빛 + 십자 빛(3.6 ~ 7초에 한 번)
   별똥별은 16 ~ 28초에 하나 · 느리고 옅게 · 기기가 「움직임 줄이기」면 그대로 멈춘 하늘 한 장 · 창이 안 보이면 쉼
   그리는 것은 평평한 SVG 그림 한 장(캔버스 없음 — 규칙 50 · next-modules ③ · check_share 「폭죽 0」) · 글 · 단추 · 칸에는 손대지 않음 · html.space 일 때만 켬
   나는 것들(별똥별 · 태양계 · 우주선 · 용 · 천사 — sky-fly.js · 사장님 2026-10-21 19:44)은 첫 그림 뒤 한가할 때 받아 이 그림 한 장 안 맨 위 묶음에 그림 · 날 때는 초당 30번
   그림 높이 = 창 높이와 기기 높이 가운데 큰 쪽(폰 주소 막대가 숨었다 나와도 하늘이 튀지 않음) · 폭이 바뀌면 다시 그림 · 그리는 빠르기 초당 15번(별똥별 때 30번) · 하늘은 제 층(space.css will-change)이라 글판은 다시 안 그림 */
const NS = 'http://www.w3.org/2000/svg';

/** SVG 낱개 하나 — 속성은 값으로만(글로 쓴 꾸밈 없음 · CSP style-src 'self') */
function mk(tag, at, parent) {
  const e = document.createElementNS(NS, tag);
  for (const k of Object.keys(at)) e.setAttribute(k, String(at[k]));
  if (parent) parent.appendChild(e);
  return e;
}
const r1 = v => Math.round(v * 10) / 10, r3 = v => Math.round(v * 1000) / 1000;
/** 그라데이션 하나(멈춤 점 = [자리, 색, 짙기]) */
function grad(defs, tag, at, stops) {
  const g = mk(tag, at, defs);
  for (const [o, c, a] of stops) mk('stop', {offset: o, 'stop-color': c, 'stop-opacity': a}, g);
  return g;
}

function start() {
  const sv = mk('svg', {class: 'stars', 'aria-hidden': 'true', focusable: 'false', preserveAspectRatio: 'xMaxYMin slice'});
  document.body.prepend(sv);
  const still = () => !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  /* 작은 별 네 무리 — 무리마다 숨 쉬는 때가 다름(위상 · 빠르기) */
  const TW = [[0, 1], [1.7, 0.75], [3.4, 0.55], [5.1, 0.35]];
  let W = 0, H = 0, pole = {x: 0, y: 0}, ang = 0, met = null, nextMet = 0, raf = 0, lastT = 0, lastDraw = 0;
  let rot = null, tw = [], bright = [], polar = null, metLine = null, metGrad = null;
  const plug = []; // 이 그림에 붙는 것(sky-fly.js) — build · draw · busy
  const api = () => ({sv, W, H, vh: window.innerHeight || H});

  function build() {
    const vh = window.innerHeight || 640;
    W = document.documentElement.clientWidth || window.innerWidth || 390;
    H = Math.max(vh, (window.screen && window.screen.height) || 0);
    while (sv.firstChild) sv.removeChild(sv.firstChild);
    sv.setAttribute('width', W); sv.setAttribute('height', H); sv.setAttribute('viewBox', `0 0 ${W} ${H}`);
    pole = {x: r1(W * 0.84), y: r1(Math.min(vh * 0.2, 170))};
    const R = Math.hypot(Math.max(pole.x, W - pole.x), Math.max(pole.y, H - pole.y)) + 30, M = Math.max(W, H);
    const defs = mk('defs', {}, sv);
    grad(defs, 'radialGradient', {id: 'skyGlow'}, [[0, '#FFF8E4', 0.95], [0.22, '#FFF8E4', 0.38], [1, '#FFF8E4', 0]]);
    /* 옅은 남빛 · 보랏빛 안개(위 오른쪽 · 왼쪽) — 바탕 #070B17 위에 아주 옅게 · 움직이지 않음 */
    grad(defs, 'radialGradient', {id: 'skyNeb1', gradientUnits: 'userSpaceOnUse', cx: r1(W * 0.88), cy: r1(-vh * 0.06), r: r1(M * 0.75)}, [[0, '#4860BA', 0.24], [1, '#4860BA', 0]]);
    grad(defs, 'radialGradient', {id: 'skyNeb2', gradientUnits: 'userSpaceOnUse', cx: r1(-W * 0.12), cy: r1(vh * 0.26), r: r1(M * 0.5)}, [[0, '#7654AA', 0.12], [1, '#7654AA', 0]]);
    metGrad = grad(defs, 'linearGradient', {id: 'skyMet', gradientUnits: 'userSpaceOnUse', x1: 0, y1: 0, x2: 1, y2: 0}, [[0, '#FFF4DC', 0.75], [1, '#FFF4DC', 0]]);
    mk('rect', {width: W, height: H, fill: 'url(#skyNeb1)'}, sv);
    mk('rect', {width: W, height: H, fill: 'url(#skyNeb2)'}, sv);
    /* 별 — 같은 씨앗이라 늘 같은 하늘 · 북극성 둘레 원판에 고르게 */
    rot = mk('g', {}, sv);
    tw = TW.map(() => mk('g', {fill: '#DCE5FF'}, rot));
    bright = [];
    let r0 = 11; const rnd = () => (r0 = (r0 * 16807) % 2147483647) / 2147483647;
    const n = Math.min(700, Math.round(Math.PI * R * R / 2600));
    for (let i = 0; i < n; i++) {
      const st = {r: Math.sqrt(rnd()) * R, t: rnd() * 6.2832, s: rnd() * 1.1 + 0.3, a: rnd() * 0.6 + 0.28, p: rnd() * 6.28, w: rnd() * 0.8 + 0.2, b: rnd() < 0.07, hue: rnd()};
      const x = r1(pole.x + Math.cos(st.t) * st.r), y = r1(pole.y + Math.sin(st.t) * st.r);
      if (!st.b) { mk('circle', {cx: x, cy: y, r: r3(st.s), opacity: r3(st.a)}, tw[i % TW.length]); continue; }
      const rr = st.s * 1.25 + 0.35, c2 = st.hue < 0.5 ? '#FFF6D6' : '#E3EBFF';
      const g = mk('g', {transform: `translate(${x} ${y})`}, rot);
      mk('circle', {r: r1(rr * 6), fill: 'url(#skyGlow)', opacity: 0.6}, g);
      mk('circle', {r: r3(rr), fill: c2}, g);
      const gl = mk('path', {d: 'M-1 0H1M0-1V1', fill: 'none', stroke: c2, 'stroke-width': 0.8, 'stroke-linecap': 'round', 'vector-effect': 'non-scaling-stroke', opacity: 0.65}, g);
      bright.push({st, g, gl, x, y, rr, al0: Math.min(1, st.a + 0.35)});
    }
    /* 북극성 — 돌지 않음 */
    polar = mk('g', {transform: `translate(${pole.x} ${pole.y})`}, sv);
    mk('circle', {r: 22, fill: 'url(#skyGlow)', opacity: 0.9}, polar);
    mk('circle', {r: 2.6, fill: '#FFF6D6'}, polar);
    mk('path', {d: 'M-15 0H15M0-15V15', fill: 'none', stroke: '#FFF6D6', 'stroke-width': 1, 'stroke-linecap': 'round', opacity: 0.7}, polar);
    metLine = mk('line', {x1: 0, y1: 0, x2: 1, y2: 0, stroke: 'url(#skyMet)', 'stroke-width': 1.6, 'stroke-linecap': 'round', opacity: 0}, sv);
    met = null;
    for (const p of plug) p.build(api());
  }

  function draw(now) {
    const move = !still(), dt = Math.min(100, now - (lastT || now)); lastT = now;
    if (move) ang -= dt * 0.000008;
    const deg = r3(ang * 57.29578), c = Math.cos(ang), s = Math.sin(ang);
    rot.setAttribute('transform', `rotate(${deg} ${pole.x} ${pole.y})`);
    for (let k = 0; k < tw.length; k++) tw[k].setAttribute('opacity', move ? r3(0.82 + 0.18 * Math.sin(TW[k][0] + now * 0.0006 * TW[k][1])) : 1);
    for (const b of bright) {
      const dx = b.x - pole.x, dy = b.y - pole.y, x = pole.x + dx * c - dy * s, y = pole.y + dx * s + dy * c;
      if (x < -40 || y < -40 || x > W + 40 || y > H + 40) continue; // 안 보이는 별은 건드리지 않음
      const t = move ? 0.55 + 0.45 * Math.sin(b.st.p + now * 0.0011 * (0.6 + b.st.w)) : 0.85;
      b.g.setAttribute('opacity', r3(b.al0 * t));
      b.gl.setAttribute('transform', `rotate(${-deg}) scale(${r3(b.rr * (3.5 + 3.5 * t))})`); // 십자 빛은 늘 가로 · 세로
    }
    polar.setAttribute('opacity', r3(move ? 0.8 + 0.2 * Math.sin(now * 0.0011) : 0.9));
    for (const p of plug) p.draw(now, move);
    if (!move) { met = null; metLine.setAttribute('opacity', 0); return; }
    if (!met && now > nextMet) { const vh = window.innerHeight || H; met = {x: W * (0.35 + Math.random() * 0.6), y: vh * (0.08 + Math.random() * 0.4), vx: -(0.10 + Math.random() * 0.05), vy: 0.05 + Math.random() * 0.04, t0: now}; }
    if (met) {
      const age = now - met.t0, life = 2800, L = 220, x = met.x + met.vx * age, y = met.y + met.vy * age;
      const p = {x1: r1(x), y1: r1(y), x2: r1(x - met.vx * L), y2: r1(y - met.vy * L)};
      for (const k of Object.keys(p)) { metLine.setAttribute(k, p[k]); metGrad.setAttribute(k, p[k]); }
      metLine.setAttribute('opacity', r3(Math.max(0, Math.min(1, age / 150, 1 - (age - life * 0.6) / (life * 0.4)))));
      if (age > life) { met = null; metLine.setAttribute('opacity', 0); nextMet = now + 16000 + Math.random() * 12000; }
    }
  }
  function loop(now) { raf = requestAnimationFrame(loop); if (now - lastDraw < (met || plug.some(p => p.busy()) ? 33 : 66)) return; lastDraw = now; draw(now); }
  const go = () => { if (!raf && !still() && !document.hidden) { lastT = 0; raf = requestAnimationFrame(loop); } };
  const stop = () => { if (raf) cancelAnimationFrame(raf); raf = 0; };

  build(); draw(performance.now());
  nextMet = performance.now() + 6000;
  go();
  /* 나는 것들 — 창 load 뒤 한가할 때 받음(첫 그림 · 첫 반응을 늦추지 않음) · 못 받으면 별 하늘 그대로 */
  const fly = () => import('./sky-fly.js').then(m => { const p = m.plug(); plug.push(p); p.build(api()); draw(performance.now()); globalThis.__skyFly = p; }).catch(() => {});
  const idle = () => (window.requestIdleCallback ? window.requestIdleCallback(fly, {timeout: 2500}) : setTimeout(fly, 600));
  if (document.readyState === 'complete') idle(); else window.addEventListener('load', idle, {once: true});
  let rs = 0;
  window.addEventListener('resize', () => {
    clearTimeout(rs);
    rs = setTimeout(() => { const w = document.documentElement.clientWidth || window.innerWidth; if (w !== W || window.innerHeight > H) { build(); draw(performance.now()); } }, 150);
  });
  document.addEventListener('visibilitychange', () => { if (document.hidden) stop(); else go(); });
  if (window.matchMedia) {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const on = () => { if (still()) { stop(); draw(performance.now()); } else go(); };
    if (mq.addEventListener) mq.addEventListener('change', on);
  }
}

/* 켜기는 맨 끝에서 — 위의 const(r1 · r3 · NS)가 다 준비된 뒤(먼저 부르면 「r1 을 준비 전에 씀」 오류) */
if (document.documentElement.classList.contains('space')) start();
