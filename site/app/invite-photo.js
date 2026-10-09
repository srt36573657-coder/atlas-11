/* ATLAS 11 · 선물형 초대장 — 사진이 든 선물(사장님이 보내는 초대장에만)
   사장님 2026-10-09 17:22 · 17:29(마카오 시각) 「이 이미지로 판타스틱하게 3d 입체감으로 유기적으로 상호작용하게」 · 「귀엽게 예쁘게 알아서 … 예술에 장인이 만든다 생각하며」
   그림 이야기: 청자 합을 열면 사진이 빛 속에서 떠오르고, 금빛 별가루 띠 두 줄과 ATLAS 일곱 별이 그 둘레를 돈다
   깊이(3D): 가장 먼 하늘(사진 가장자리 빛깔을 넓힌 바탕 · 작은 별) → 뒤쪽 별가루(사진에 가려짐) → 사진(살짝 떠다님) → 앞쪽 별가루(사진 앞을 지남)
     · 띠는 진짜 3D 고리(기울기 · 비스듬함 · 원근 900px)로 셈하고, 사진도 같은 축 · 같은 원근으로 기울어 둘이 한 몸처럼 움직인다
   만지면: 옆으로 끌면 사진과 띠가 함께 기울고 놓으면 용수철처럼 제자리 · 톡 누르면 그 자리에서 별가루가 퍼져 띠 쪽으로 돈다 · 기울이면(되는 휴대폰) 먼 하늘이 따라 움직임
   지키는 것: 소리 없음 · 움직임 줄이기면 멈춘 한 장 · 느린 기기는 별가루 수를 절반으로(처음 1초 프레임 시간으로 판단) · 화면 밖 · 숨은 탭이면 멈춤
     · 메시지 카드 위로는 그리지 않음(카드가 위 층) · 세로로 밀면 화면이 그대로 내려감(touch-action: pan-y)
     · 보안 규칙(CSP): 글 속 style 속성 없음 — 자리 · 빛깔은 CSSOM(element.style)으로만 · 사진은 같은 사이트 주소 또는 data: 만 */
const TAU = Math.PI * 2;
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const easeOut = t => 1 - Math.pow(1 - clamp(t, 0, 1), 3);
const easeBack = t => { t = clamp(t, 0, 1); const c = 1.6; return 1 + (c + 1) * Math.pow(t - 1, 3) + c * Math.pow(t - 1, 2); };
const rgba = (c, a = 1) => `rgba(${c[0] | 0}, ${c[1] | 0}, ${c[2] | 0}, ${a})`;
const reducedMotion = () => matchMedia('(prefers-reduced-motion: reduce)').matches;
const GOLD = [255, 222, 160], WHITE = [255, 248, 232];
const PERSPECTIVE = 900, RING_CY = 0.62; // 원근(px) · 고리 한가운데(사진 높이의 62% — 치마께)

/* 빛깔 — 사진을 40×50 으로 줄여: 가장자리(하늘) 평균 · 밝고 고운 빛(별가루 한 빛깔) · 사람을 하늘빛으로 덮은 「넓힌 하늘」(바탕) */
export function photoPalette(img) {
  const c = document.createElement('canvas'); c.width = 40; c.height = 50;
  const g = c.getContext('2d', {willReadFrequently: true});
  let d = null;
  try { g.drawImage(img, 0, 0, 40, 50); d = g.getImageData(0, 0, 40, 50).data; } catch { d = null; }
  if (!d) return {edge: [70, 56, 96], accent: [255, 210, 226], sky: null};
  let e = [0, 0, 0], en = 0, a = [0, 0, 0], an = 0;
  for (let y = 0; y < 50; y++) for (let x = 0; x < 40; x++) {
    const i = (y * 40 + x) * 4, r = d[i], gg = d[i + 1], b = d[i + 2];
    if (x < 3 || x > 36 || y < 3 || y > 46) { e[0] += r; e[1] += gg; e[2] += b; en++; }
    const l = 0.2126 * r + 0.7152 * gg + 0.0722 * b, s = Math.max(r, gg, b) - Math.min(r, gg, b);
    if (l > 110 && s > 50) { a[0] += r; a[1] += gg; a[2] += b; an++; }
  }
  const edge = e.map(v => v / en);
  const accent = an ? a.map(v => v / an * 0.45 + 255 * 0.55) : [255, 210, 226]; // 고운 빛(파스텔)
  // 넓힌 하늘: 가운데(사람)를 가장자리 빛깔로 부드럽게 덮음 → 바탕이 밝은 옷 빛에 물들지 않음(글자가 또렷)
  const gr = g.createRadialGradient(20, 25, 2, 20, 25, 24);
  gr.addColorStop(0, rgba(edge, 1)); gr.addColorStop(0.62, rgba(edge, 0.92)); gr.addColorStop(1, rgba(edge, 0));
  g.fillStyle = gr; g.fillRect(0, 0, 40, 50);
  let sky = null; try { sky = c.toDataURL('image/png'); } catch {}
  return {edge, accent, sky};
}

/* 빛 조각(한 번 그려 두고 찍기 — 프레임마다 그라데이션을 만들지 않음) */
function sprite(size, draw) { const c = document.createElement('canvas'); c.width = c.height = size; draw(c.getContext('2d'), size / 2, size); return c; }
const dotSprite = col => sprite(32, (g, r) => {
  const gr = g.createRadialGradient(r, r, 0, r, r, r);
  gr.addColorStop(0, 'rgba(255,255,255,1)'); gr.addColorStop(0.2, rgba(col, 0.95)); gr.addColorStop(0.48, rgba(col, 0.3)); gr.addColorStop(1, rgba(col, 0));
  g.fillStyle = gr; g.fillRect(0, 0, 2 * r, 2 * r);
});
const sparkle = (g, r, L, k) => { g.beginPath(); g.moveTo(r, r - L); g.quadraticCurveTo(r + k, r - k, r + L, r); g.quadraticCurveTo(r + k, r + k, r, r + L); g.quadraticCurveTo(r - k, r + k, r - L, r); g.quadraticCurveTo(r - k, r - k, r, r - L); g.fill(); };
const starSprite = (col, hollow) => sprite(96, (g, r, s) => {
  const gr = g.createRadialGradient(r, r, 0, r, r, r);
  gr.addColorStop(0, rgba(col, hollow ? 0.08 : 0.6)); gr.addColorStop(0.22, rgba(col, 0.22)); gr.addColorStop(1, rgba(col, 0));
  g.fillStyle = gr; g.fillRect(0, 0, s, s);
  if (hollow) { g.strokeStyle = rgba(col, 0.95); g.lineWidth = 2.4; g.beginPath(); g.arc(r, r, s * 0.1, 0, TAU); g.stroke(); return; } // 후보가 비는 자리 — 빈 고리
  g.fillStyle = 'rgba(255,255,255,.96)'; sparkle(g, r, s * 0.47, s * 0.028);
  g.save(); g.translate(r, r); g.rotate(Math.PI / 4); g.translate(-r, -r); g.fillStyle = rgba(col, 0.75); sparkle(g, r, s * 0.2, s * 0.02); g.restore();
  const core = g.createRadialGradient(r, r, 0, r, r, s * 0.08); core.addColorStop(0, '#fff'); core.addColorStop(1, 'rgba(255,255,255,0)'); g.fillStyle = core; g.fillRect(0, 0, s, s);
});
const tinySparkSprite = col => sprite(40, (g, r, s) => { g.fillStyle = rgba(col, 0.95); sparkle(g, r, s * 0.45, s * 0.04); const c = g.createRadialGradient(r, r, 0, r, r, r * 0.5); c.addColorStop(0, 'rgba(255,255,255,.9)'); c.addColorStop(1, 'rgba(255,255,255,0)'); g.fillStyle = c; g.fillRect(0, 0, s, s); });

/** 사진 무대 하나 — {el(사진 · 별가루 띠), backdrop(장면 맨 뒤 하늘), ready(사진을 다 읽으면), start(mode), reset(), setCount(n), stop()} */
export function photoStage({src, w = 4, h = 5, alt = '', n = 7} = {}) {
  const mk = (tag, cls) => { const e = document.createElement(tag); if (cls) e.className = cls; return e; };
  const el = mk('div', 'iv-ph'), card = mk('div', 'iv-ph-card'), img = mk('img', 'iv-ph-img'), glint = mk('span', 'iv-ph-glint');
  const back = mk('canvas', 'iv-ph-c back'), front = mk('canvas', 'iv-ph-c front');
  back.setAttribute('aria-hidden', 'true'); front.setAttribute('aria-hidden', 'true'); glint.setAttribute('aria-hidden', 'true');
  img.alt = alt; img.decoding = 'async'; img.draggable = false;
  card.append(img, glint); el.append(back, card, front);
  el.style.setProperty('--ph-ratio', `${Math.max(1, w)} / ${Math.max(1, h)}`);
  el.style.setProperty('--ph-wr', (Math.max(1, w) / Math.max(1, h)).toFixed(4));
  el.style.setProperty('--ph-cy', `${RING_CY * 100}%`);
  const backdrop = mk('div', 'iv-ph-bg'), skyImg = mk('img'), far = mk('canvas', 'far');
  skyImg.alt = ''; backdrop.setAttribute('aria-hidden', 'true'); backdrop.append(skyImg, far);

  const reduce = reducedMotion();
  let pal = {edge: [70, 56, 96], accent: [255, 210, 226]};
  let sprites = null;
  const ready = new Promise((resolve, reject) => {
    img.onload = () => {
      const go = () => {
        pal = photoPalette(img);
        if (pal.sky) skyImg.src = pal.sky;
        const deep = pal.edge.map(v => v * 0.18 + 4), mid = pal.edge.map(v => v * 0.5 + 8);
        backdrop.style.setProperty('--ph-deep', rgba(deep)); backdrop.style.setProperty('--ph-mid', rgba(mid));
        el.style.setProperty('--ph-accent', rgba(pal.accent)); el.style.setProperty('--ph-glow', rgba(pal.edge.map(v => v * 0.6 + 100), 0.55));
        sprites = {gold: dotSprite(GOLD), white: dotSprite(WHITE), accent: dotSprite(pal.accent), star: starSprite(GOLD, false), hollow: starSprite(GOLD, true),
          sparkGold: tinySparkSprite(GOLD), sparkAccent: tinySparkSprite(pal.accent), sparkWhite: tinySparkSprite(WHITE)};
        if (shown && (reduce || !running)) draw(0); // 사진보다 화면이 먼저 열렸으면(바로 보기 · 움직임 줄이기) 이제 그림
        resolve();
      };
      img.decode ? img.decode().then(go, go) : go();
    };
    img.onerror = () => reject(new Error('photo'));
  });
  img.src = src;

  /* 별가루 — 고리 둘(안쪽 · 바깥쪽, 서로 반대로 돎) · 일곱 별은 안쪽 고리에 고르게 */
  const RINGS = [{R: 0.56, incl: 0.3, slant: -0.22, speed: 0.22, thick: 6}, {R: 0.7, incl: 0.36, slant: 0.18, speed: -0.14, thick: 9}];
  const dust = [], stars = [];
  const makeDust = count => {
    dust.length = 0;
    RINGS.forEach((ring, ri) => {
      const m = Math.round(count * (ri === 0 ? 0.56 : 0.44));
      for (let i = 0; i < m; i++) {
        const u = Math.random();
        dust.push({ring: ri, th: Math.random() * TAU, dr: (Math.random() - 0.5) * (ri ? 26 : 18), dy: (Math.random() - 0.5) * ring.thick,
          size: 0.9 + Math.pow(Math.random(), 2.2) * 2.6, tw: Math.random() * TAU, tws: 1.2 + Math.random() * 2.4,
          col: u < 0.62 ? 'gold' : u < 0.86 ? 'white' : 'accent', delay: Math.random() * 0.45});
      }
    });
  };
  for (let k = 0; k < 7; k++) stars.push({ring: 0, th: -Math.PI / 2 + k * TAU / 7, dr: 0, dy: 0, empty: k >= n, delay: 0.32 + k * 0.095, tw: k * 0.9});
  const setCount = c => { stars.forEach((s, k) => { s.empty = k >= c; }); if (reduce && running === false && shown) draw(0); };
  const sparks = [], pulses = [];
  let shoot = null, nextShoot = 6 + Math.random() * 5;

  /* 크기 · 원근 */
  let W = 0, H = 0, cw = 0, ch = 0, cx = 0, cy = 0, dpr = 1;
  const g1 = back.getContext('2d'), g2 = front.getContext('2d');
  const resize = () => {
    paintFar();
    const nw = el.clientWidth, nh = el.clientHeight; if (!nw || !nh || (nw === W && nh === H)) return;
    W = nw; H = nh; dpr = Math.min(devicePixelRatio || 1, 2);
    cw = W * 1.6; ch = H * 1.24; cx = W * 0.3 + W / 2; cy = H * 0.12 + H * RING_CY;
    for (const c of [back, front]) { c.width = Math.round(cw * dpr); c.height = Math.round(ch * dpr); }
    g1.setTransform(dpr, 0, 0, dpr, 0, 0); g2.setTransform(dpr, 0, 0, dpr, 0, 0);
  };
  const paintFar = () => { // 먼 하늘의 작은 별(크기가 바뀔 때만 다시 · 같은 씨앗이라 자리가 뒤섞이지 않음)
    const bw = Math.round(backdrop.clientWidth), bh = Math.round(backdrop.clientHeight); if (!bw || !bh || (far.width === bw && far.height === bh)) return;
    far.width = bw; far.height = bh;
    const g = far.getContext('2d'); g.clearRect(0, 0, bw, bh);
    let seed = 0x9E3779B9; const rnd = () => { seed |= 0; seed = seed + 0x6D2B79F5 | 0; let q = Math.imul(seed ^ seed >>> 15, 1 | seed); q = q + Math.imul(q ^ q >>> 7, 61 | q) ^ q; return ((q ^ q >>> 14) >>> 0) / 4294967296; };
    const count = Math.round(bw * bh / 2600);
    for (let i = 0; i < count; i++) {
      const x = rnd() * bw, y = rnd() * bh, big = rnd() < 0.08, r = big ? 1.3 + rnd() : 0.4 + rnd() * 0.7;
      g.fillStyle = `rgba(255, ${235 + rnd() * 20 | 0}, ${215 + rnd() * 40 | 0}, ${(0.22 + rnd() * 0.6).toFixed(2)})`;
      g.beginPath(); g.arc(x, y, r, 0, TAU); g.fill();
    }
  };

  /* 3D 셈 — 고리(XZ 평면) → 앞으로 기울기(X축) → 비스듬함(Z축) → 사람이 돌린 만큼(Y축 · X축, CSS rotateX · rotateY 와 같은 차례) → 원근 */
  const P = {x: 0, y: 0, z: 0, s: 1};
  const project = (ring, th, rad, dy, rx, ry) => {
    const ci = Math.cos(ring.incl), si = Math.sin(ring.incl), cs = Math.cos(ring.slant), ss = Math.sin(ring.slant);
    const x = rad * Math.cos(th), z = rad * Math.sin(th);
    const y1 = dy * ci + z * si, z1 = -dy * si + z * ci;
    const x2 = x * cs - y1 * ss, y2 = x * ss + y1 * cs;
    const cry = Math.cos(ry), sry = Math.sin(ry), crx = Math.cos(rx), srx = Math.sin(rx);
    const x3 = x2 * cry + z1 * sry, z3 = -x2 * sry + z1 * cry;
    const y4 = y2 * crx - z3 * srx, z4 = y2 * srx + z3 * crx;
    const s = PERSPECTIVE / (PERSPECTIVE - z4);
    P.x = cx + x3 * s; P.y = cy + y4 * s; P.z = z4; P.s = s;
    return P;
  };

  /* 움직임 상태 */
  let running = false, shown = false, raf = 0, last = 0, t = 0, t0 = 0, revealing = false;
  let rx = 0, ry = 0, vrx = 0, vry = 0, trx = 0, tryy = 0, boost = 0, tiltX = 0, tiltY = 0, frames = 0, slow = 0, thinned = false;
  let visible = true, pageVisible = !document.hidden;
  const count0 = () => (matchMedia('(max-width: 360px)').matches ? 230 : 300);

  const draw = dt => {
    const a1 = g1, a2 = g2; a1.clearRect(0, 0, cw, ch); a2.clearRect(0, 0, cw, ch);
    if (!sprites || !W) return;
    a1.globalCompositeOperation = 'lighter'; a2.globalCompositeOperation = 'lighter';
    const RX = rx * Math.PI / 180, RY = ry * Math.PI / 180;
    const el0 = t - t0, grow = p => (revealing ? easeOut((el0 - p) / 1.25) : 1);
    // 고리의 몸(가는 빛 띠) — 앞 반은 사진 앞, 뒤 반은 사진 뒤(사진에 가려짐) · 별가루가 흩어져도 고리 모양이 읽히게
    for (const ring of RINGS) {
      const gr = grow(0.15), rad = ring.R * W * gr; if (gr <= 0) continue;
      const N = 96; let prev = null;
      for (let i = 0; i <= N; i++) {
        const q = project(ring, i / N * TAU, rad, 0, RX, RY), cur = {x: q.x, y: q.y, z: q.z};
        if (prev) {
          const front = (prev.z + cur.z) / 2 > 0, g = front ? a2 : a1, depth = 0.5 + 0.5 * clamp(((prev.z + cur.z) / 2 + ring.R * W) / (2 * ring.R * W), 0, 1);
          const shimmer = reduce ? 0.8 : 0.5 + 0.5 * Math.sin(i / N * TAU * 3 - t * ring.speed * 9 + ring.R * 7); // 띠를 따라 흐르는 빛(고르지 않게 → 살아 있는 느낌)
          g.globalAlpha = Math.min(1, gr * 1.4) * (front ? 0.4 : 0.18) * depth * (0.35 + 0.65 * shimmer); g.strokeStyle = rgba(GOLD, 1); g.lineWidth = front ? 1.3 : 1;
          g.beginPath(); g.moveTo(prev.x, prev.y); g.lineTo(cur.x, cur.y); g.stroke();
          g.globalAlpha *= 0.28; g.lineWidth = 7; g.beginPath(); g.moveTo(prev.x, prev.y); g.lineTo(cur.x, cur.y); g.stroke();
        }
        prev = cur;
      }
    }
    // 별가루
    for (const d of dust) {
      const ring = RINGS[d.ring], gr = grow(d.delay);
      if (gr <= 0) continue;
      d.th += ring.speed * (1 + boost) * dt;
      const th = d.th + (1 - gr) * 2.6 * Math.sign(ring.speed); // 나올 때는 소용돌이처럼 감기며 퍼짐
      const p = project(ring, th, (ring.R * W + d.dr) * gr, d.dy, RX, RY);
      const depth = 0.5 + 0.5 * clamp((p.z + ring.R * W) / (2 * ring.R * W), 0, 1);
      const twk = reduce ? 0.85 : 0.62 + 0.38 * Math.sin(d.tw + t * d.tws);
      const alpha = Math.min(1, gr * 1.6) * twk * (0.35 + 0.65 * depth);
      const size = d.size * p.s * (0.75 + 0.5 * depth) * 3.2;
      const g = p.z > 0 ? a2 : a1;
      g.globalAlpha = alpha; g.drawImage(sprites[d.col], p.x - size / 2, p.y - size / 2, size, size);
    }
    // 일곱 별(후보 자리 일곱) — 별가루보다 크고 또렷 · 비는 자리는 빈 고리
    for (const s of stars) {
      const ring = RINGS[0], gr = grow(s.delay);
      if (gr <= 0) continue;
      s.th += ring.speed * 0.6 * (1 + boost) * dt;
      const th = s.th + (1 - gr) * 2.2;
      const p = project(ring, th, ring.R * W * gr, 0, RX, RY);
      const depth = 0.5 + 0.5 * clamp((p.z + ring.R * W) / (2 * ring.R * W), 0, 1);
      const pop = revealing ? easeBack((el0 - s.delay) / 0.7) : 1;
      const twk = reduce ? 1 : 0.86 + 0.14 * Math.sin(s.tw + t * 2.1);
      const size = 30 * p.s * (0.78 + 0.32 * depth) * pop * twk;
      const g = p.z > 0 ? a2 : a1;
      g.globalAlpha = clamp(gr * 1.4, 0, 1) * (0.55 + 0.45 * depth);
      g.drawImage(s.empty ? sprites.hollow : sprites.star, p.x - size / 2, p.y - size / 2, size, size);
    }
    // 누른 자리 별가루 · 퍼지는 고리
    for (let i = sparks.length - 1; i >= 0; i--) {
      const s = sparks[i]; s.life += dt;
      if (s.life > s.max) { sparks.splice(i, 1); continue; }
      const dx = s.x - cx, dy = s.y - cy, dist = Math.hypot(dx, dy) || 1;
      s.vx += (-dy / dist) * 70 * dt * s.spin - dx * 0.35 * dt; s.vy += (dx / dist) * 70 * dt * s.spin - dy * 0.35 * dt; // 띠 쪽으로 감아 돎
      const damp = Math.exp(-2.2 * dt); s.vx *= damp; s.vy *= damp; s.x += s.vx * dt; s.y += s.vy * dt; s.rot += s.vr * dt;
      const k = s.life / s.max, size = s.size * (1 - k * 0.5);
      a2.globalAlpha = (k < 0.15 ? k / 0.15 : 1 - Math.pow((k - 0.15) / 0.85, 1.6)) * 0.95;
      a2.save(); a2.translate(s.x, s.y); a2.rotate(s.rot); a2.drawImage(sprites[s.sp], -size / 2, -size / 2, size, size); a2.restore();
    }
    a2.globalCompositeOperation = 'source-over';
    for (let i = pulses.length - 1; i >= 0; i--) {
      const q = pulses[i]; q.life += dt; if (q.life > 0.9) { pulses.splice(i, 1); continue; }
      const k = q.life / 0.9; a2.globalAlpha = (1 - k) * 0.55; a2.strokeStyle = rgba(GOLD, 1); a2.lineWidth = 1.4 * (1 - k) + 0.4;
      a2.beginPath(); a2.arc(q.x, q.y, 6 + easeOut(k) * 46, 0, TAU); a2.stroke();
    }
    // 별똥별(먼 쪽 · 가끔)
    if (shoot) {
      shoot.life += dt; const k = shoot.life / shoot.max;
      if (k >= 1) shoot = null;
      else {
        const hx = shoot.x + shoot.dx * easeOut(k), hy = shoot.y + shoot.dy * easeOut(k), tl = 70 * (1 - k * 0.4);
        const ang = Math.atan2(shoot.dy, shoot.dx), tx = hx - Math.cos(ang) * tl, ty = hy - Math.sin(ang) * tl;
        const lg = a1.createLinearGradient(tx, ty, hx, hy); lg.addColorStop(0, 'rgba(255,248,232,0)'); lg.addColorStop(1, 'rgba(255,248,232,.85)');
        a1.globalCompositeOperation = 'source-over'; a1.globalAlpha = Math.sin(k * Math.PI); a1.strokeStyle = lg; a1.lineWidth = 1.3;
        a1.beginPath(); a1.moveTo(tx, ty); a1.lineTo(hx, hy); a1.stroke();
      }
    }
    a1.globalAlpha = 1; a2.globalAlpha = 1;
  };

  const step = now => {
    raf = 0;
    if (!el.isConnected) { destroy(); return; }
    const dt = Math.min(0.05, last ? (now - last) / 1000 : 0.016); last = now; t += dt;
    // 처음 1초 프레임 시간이 길면(느린 기기) 별가루 절반
    if (!thinned && frames < 60) { frames++; if (dt > 0.026) slow++; if (frames === 60 && slow > 30) { thinned = true; for (let i = dust.length - 1; i >= 0; i -= 2) dust.splice(i, 1); } }
    // 용수철(놓으면 살짝 넘쳤다가 제자리)
    const k = 46, c = 8.5;
    const idleY = down ? 0 : Math.sin(t * 0.42) * 3.2, idleX = down ? 0 : Math.sin(t * 0.31 + 0.8) * 1.4; // 가만히 있어도 천천히 숨 쉬듯 기욺(띠와 사진이 함께 → 깊이가 보임)
    vrx += (k * (trx + tiltX + idleX - rx) - c * vrx) * dt; vry += (k * (tryy + tiltY + idleY - ry) - c * vry) * dt; rx += vrx * dt; ry += vry * dt;
    boost *= Math.exp(-2.4 * dt);
    const bob = Math.sin(t * 0.9) * 4.5, sway = Math.sin(t * 0.55 + 1) * 0.7, breathe = 1 + Math.sin(t * 0.9) * 0.006;
    card.style.transform = `translate3d(0, ${bob.toFixed(2)}px, 0) rotateX(${rx.toFixed(3)}deg) rotateY(${ry.toFixed(3)}deg) rotateZ(${sway.toFixed(3)}deg) scale(${breathe.toFixed(4)})`;
    backdrop.style.transform = `translate3d(${(-ry * 1.1).toFixed(2)}px, ${(rx * 1.1).toFixed(2)}px, 0)`;
    if (revealing && t - t0 > 2.2) revealing = false;
    nextShoot -= dt; if (nextShoot <= 0 && !shoot && !thinned) { nextShoot = 8 + Math.random() * 6; shoot = {x: cw * (0.1 + Math.random() * 0.3), y: ch * (0.04 + Math.random() * 0.16), dx: cw * (0.35 + Math.random() * 0.2), dy: ch * (0.1 + Math.random() * 0.08), life: 0, max: 1.1}; }
    draw(dt);
    if (running && visible && pageVisible) raf = requestAnimationFrame(step);
  };
  const loop = () => { if (!raf && running && visible && pageVisible && !reduce) { last = 0; raf = requestAnimationFrame(step); } };
  const stop = () => { running = false; if (raf) cancelAnimationFrame(raf); raf = 0; };

  /** start('reveal') = 고리가 소용돌이처럼 감기며 퍼짐 · start('show') = 다 퍼진 모습 */
  const start = (mode = 'show', {delay = 0} = {}) => {
    resize(); if (!dust.length) makeDust(count0());
    shown = true;
    if (reduce) { revealing = false; draw(0); return; } // 움직임 줄이기: 멈춘 한 장
    t0 = t + delay / 1000; revealing = mode === 'reveal';
    running = true; loop();
  };
  const reset = () => { stop(); shown = false; revealing = false; sparks.length = 0; pulses.length = 0; shoot = null; rx = ry = vrx = vry = trx = tryy = 0; card.style.transform = ''; backdrop.style.transform = ''; g1.clearRect(0, 0, cw, ch); g2.clearRect(0, 0, cw, ch); };

  /* 만지기 — 옆으로 끌기 = 기울기 · 톡 = 별가루 · 세로 밀기는 화면 내리기(브라우저가 맡음 → pointercancel) */
  let down = null;
  const local = e => { const r = front.getBoundingClientRect(); return {x: (e.clientX - r.left) * (cw / r.width), y: (e.clientY - r.top) * (ch / r.height)}; };
  el.addEventListener('pointerdown', e => { if (!shown || reduce) return; down = {x: e.clientX, y: e.clientY, t: performance.now(), id: e.pointerId, moved: 0}; });
  el.addEventListener('pointermove', e => {
    if (!down || e.pointerId !== down.id) return;
    const dx = e.clientX - down.x, dy = e.clientY - down.y; down.moved = Math.max(down.moved, Math.hypot(dx, dy));
    tryy = clamp(dx * 0.11, -15, 15); if (e.pointerType === 'mouse') trx = clamp(-dy * 0.08, -9, 9);
    boost = Math.max(boost, Math.min(1.6, Math.abs(dx) / 120));
  });
  const up = e => {
    if (!down || e.pointerId !== down.id) return;
    const tap = down.moved < 8 && performance.now() - down.t < 450;
    if (tap && e.type === 'pointerup') burst(local(e));
    down = null; trx = 0; tryy = 0; // 놓으면 제자리(용수철)
  };
  el.addEventListener('pointerup', up); el.addEventListener('pointercancel', up); el.addEventListener('pointerleave', e => { if (e.pointerType === 'mouse') up(e); });
  const burst = ({x, y}) => {
    if (!sprites) return;
    const m = thinned ? 10 : 16;
    for (let i = 0; i < m; i++) {
      const a = Math.random() * TAU, v = 50 + Math.random() * 150, u = Math.random();
      sparks.push({x, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v - 20, life: 0, max: 1.3 + Math.random() * 1.1, size: 7 + Math.random() * 9,
        rot: Math.random() * TAU, vr: (Math.random() - 0.5) * 3, spin: Math.random() < 0.5 ? 1 : -1, sp: u < 0.5 ? 'sparkGold' : u < 0.78 ? 'sparkAccent' : 'sparkWhite'});
    }
    pulses.push({x, y, life: 0}); boost = Math.max(boost, 1.4); loop();
  };
  // 휴대폰 기울기(허락을 묻지 않아도 되는 곳만 — 아이폰은 묻는 창이 뜨므로 쓰지 않음)
  const onTilt = e => { if (e.gamma == null || !shown) return; tiltY = clamp(e.gamma * 0.18, -6, 6); tiltX = clamp(((e.beta ?? 45) - 45) * -0.1, -4, 4); };
  const useTilt = !reduce && typeof DeviceOrientationEvent !== 'undefined' && typeof DeviceOrientationEvent.requestPermission !== 'function';
  if (useTilt) addEventListener('deviceorientation', onTilt);
  // 화면 밖 · 숨은 탭이면 멈춤(전지)
  const io = 'IntersectionObserver' in window ? new IntersectionObserver(es => { visible = es.some(x => x.isIntersecting); loop(); }) : null; io?.observe(el);
  const onVis = () => { pageVisible = !document.hidden; loop(); }; document.addEventListener('visibilitychange', onVis);
  const ro = 'ResizeObserver' in window ? new ResizeObserver(() => { const ow = W, oh = H; resize(); if (shown && (ow !== W || oh !== H) && (reduce || !running)) draw(0); }) : null;
  ro?.observe(el); ro?.observe(backdrop);
  function destroy() { stop(); if (useTilt) removeEventListener('deviceorientation', onTilt); io?.disconnect(); ro?.disconnect(); document.removeEventListener('visibilitychange', onVis); }

  return {el, backdrop, ready, start, reset, stop, destroy, setCount, burst, get running() { return running; }};
}
