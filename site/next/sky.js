/* 뒤 별 하늘 — 시험판 「우주 돌이」의 밤하늘을 진짜 사이트에(사장님 2026-10-20 20:10 「맞아 멋지게 만들어」 · 미리 보기 가지 wip-space)
   북극성을 가운데 두고 아주 천천히 돎(13분에 한 바퀴 · 북쪽 하늘처럼 반시계) · 별은 작게 숨 쉼 · 백 개에 일곱 개꼴 밝은 별 = 번지는 빛 + 십자 빛(3.6 ~ 7초에 한 번)
   별똥별은 16 ~ 28초에 하나 · 느리고 옅게 · 기기가 「움직임 줄이기」면 그대로 멈춘 하늘 한 장 · 창이 안 보이면 쉼
   그리는 것은 캔버스 하나뿐(글 · 단추 · 칸에는 손대지 않음) · html.space 일 때만 켬 */
const root = document.documentElement;
if (root.classList.contains('space')) start();

function start() {
  const cv = document.createElement('canvas');
  cv.className = 'stars'; cv.setAttribute('aria-hidden', 'true');
  document.body.prepend(cv);
  const ctx = cv.getContext('2d');
  if (!ctx) return;
  const still = () => window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const COL = '#DCE5FF';
  const GLOW = document.createElement('canvas'); GLOW.width = GLOW.height = 32;
  { const g2 = GLOW.getContext('2d'); if (g2) { const gr = g2.createRadialGradient(16, 16, 0, 16, 16, 16); gr.addColorStop(0, 'rgba(255,248,228,.95)'); gr.addColorStop(0.22, 'rgba(255,248,228,.38)'); gr.addColorStop(1, 'rgba(255,248,228,0)'); g2.fillStyle = gr; g2.fillRect(0, 0, 32, 32); } }
  let W = 0, H = 0, dpr = 1, stars = [], pole = {x: 0, y: 0}, ang = 0, met = null, nextMet = 0, raf = 0, lastT = 0, lastDraw = 0;
  function seed() {
    pole = {x: W * 0.84, y: Math.min(H * 0.2, 170)};
    const R = Math.hypot(Math.max(pole.x, W - pole.x), Math.max(pole.y, H - pole.y)) + 30;
    let r0 = 11; const rnd = () => (r0 = (r0 * 16807) % 2147483647) / 2147483647;
    stars = Array.from({length: Math.min(700, Math.round(Math.PI * R * R / 2600))}, () => ({r: Math.sqrt(rnd()) * R, t: rnd() * 6.2832, s: rnd() * 1.1 + 0.3, a: rnd() * 0.6 + 0.28, p: rnd() * 6.28, w: rnd() * 0.8 + 0.2, b: rnd() < 0.07, hue: rnd()}));
  }
  function draw(now) {
    const move = !still(), dt = Math.min(100, now - (lastT || now)); lastT = now;
    if (move) ang -= dt * 0.000008;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0); ctx.clearRect(0, 0, W, H);
    ctx.fillStyle = COL; ctx.strokeStyle = COL; ctx.lineCap = 'round';
    const bright = [];
    for (const st of stars) {
      const a = st.t + ang, x = pole.x + Math.cos(a) * st.r, y = pole.y + Math.sin(a) * st.r;
      if (x < -30 || y < -30 || x > W + 30 || y > H + 30) continue;
      if (st.b) { bright.push([st, x, y]); continue; }
      ctx.globalAlpha = st.a * (move ? 0.82 + 0.18 * Math.sin(st.p + now * 0.0006 * st.w) : 1);
      ctx.beginPath(); ctx.arc(x, y, st.s, 0, 6.2832); ctx.fill();
    }
    for (const [st, x, y] of bright) {
      const tw = move ? 0.55 + 0.45 * Math.sin(st.p + now * 0.0011 * (0.6 + st.w)) : 0.85, al = Math.min(1, st.a + 0.35) * tw, rr = st.s * 1.25 + 0.35, c2 = st.hue < 0.5 ? '#FFF6D6' : '#E3EBFF';
      ctx.globalAlpha = al * 0.6; ctx.drawImage(GLOW, x - rr * 6, y - rr * 6, rr * 12, rr * 12);
      ctx.globalAlpha = al; ctx.fillStyle = c2; ctx.beginPath(); ctx.arc(x, y, rr, 0, 6.2832); ctx.fill();
      const L = rr * (3.5 + 3.5 * tw); ctx.globalAlpha = al * 0.65; ctx.strokeStyle = c2; ctx.lineWidth = 0.8; ctx.beginPath(); ctx.moveTo(x - L, y); ctx.lineTo(x + L, y); ctx.moveTo(x, y - L); ctx.lineTo(x, y + L); ctx.stroke();
    }
    const pt = move ? 0.8 + 0.2 * Math.sin(now * 0.0011) : 0.9;
    ctx.globalAlpha = 0.9 * pt; ctx.drawImage(GLOW, pole.x - 22, pole.y - 22, 44, 44);
    ctx.globalAlpha = pt; ctx.fillStyle = '#FFF6D6'; ctx.beginPath(); ctx.arc(pole.x, pole.y, 2.6, 0, 6.2832); ctx.fill();
    ctx.globalAlpha = 0.7 * pt; ctx.strokeStyle = '#FFF6D6'; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(pole.x - 15, pole.y); ctx.lineTo(pole.x + 15, pole.y); ctx.moveTo(pole.x, pole.y - 15); ctx.lineTo(pole.x, pole.y + 15); ctx.stroke();
    ctx.fillStyle = COL; ctx.strokeStyle = COL;
    if (!move) return;
    if (!met && now > nextMet) met = {x: W * (0.35 + Math.random() * 0.6), y: H * (0.08 + Math.random() * 0.4), vx: -(0.10 + Math.random() * 0.05), vy: 0.05 + Math.random() * 0.04, t0: now};
    if (met) {
      const age = now - met.t0, life = 2800, x = met.x + met.vx * age, y = met.y + met.vy * age, L = 220;
      const gr = ctx.createLinearGradient(x, y, x - met.vx * L, y - met.vy * L); gr.addColorStop(0, 'rgba(255,244,220,.75)'); gr.addColorStop(1, 'rgba(255,244,220,0)');
      ctx.globalAlpha = Math.max(0, Math.min(1, age / 150, 1 - (age - life * 0.6) / (life * 0.4))); ctx.strokeStyle = gr; ctx.lineWidth = 1.6; ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x - met.vx * L, y - met.vy * L); ctx.stroke(); ctx.strokeStyle = COL;
      if (age > life) { met = null; nextMet = now + 16000 + Math.random() * 12000; }
    }
  }
  function loop(now) { raf = requestAnimationFrame(loop); if (now - lastDraw < 33) return; lastDraw = now; draw(now); }
  function size() { dpr = Math.min(2, window.devicePixelRatio || 1); W = window.innerWidth; H = window.innerHeight; cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr); seed(); draw(performance.now()); }
  size(); window.addEventListener('resize', size);
  nextMet = performance.now() + 6000;
  const go = () => { if (!raf && !still()) { lastT = 0; raf = requestAnimationFrame(loop); } };
  const stop = () => { if (raf) cancelAnimationFrame(raf); raf = 0; };
  go();
  document.addEventListener('visibilitychange', () => { if (document.hidden) stop(); else go(); });
  if (window.matchMedia) { const mq = window.matchMedia('(prefers-reduced-motion: reduce)'); const on = () => { if (still()) { stop(); draw(performance.now()); } else go(); }; if (mq.addEventListener) mq.addEventListener('change', on); }
}
