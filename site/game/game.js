/* 아틀라스 게임 · aaa7377.com/game/
   2026-10-02 05:58 사장님 「aaa7377에 연결해야 한다」 — 게임을 사이트에 붙였다.
   2026-10-02 06:13 「더 논리적으로 더 고급스럽게 더 예술적으로 승격하라 — 180곳 · 36곳 방식」 — 판 넷(일곱 장 짜임 · 논리 판화 · 출목표 · 낙관 · 젖혀 열기 · 정산 증서).
   2026-10-02 06:19 「이정훈 대표 방식을 가장 중심으로 · 세계적인 방법 다섯은 보조로」 — 가운데 진열장 + 보조 다섯(engine.js).
   2026-10-02 06:34 「하루에 한 번」 — 하루 한 번, 08:00 전에 낙관을 찍어 건다(넥스트레이드 장전 거래 08:00 · 거래소 동시호가 08:30 전).
   자료: ../data/atlas11/view/game.json(scripts/atlas11/build_view.mjs → lib/atlas11/game.mjs · 발행본과 입력 종가에서만 만든다)
   정산 규칙(게임): 전날 종가 → 목표일 15:30 종가. 맞히면 건 돈의 2배를 돌려받고, 틀리면 잃고, ±0.1% 안이면 돌려받는다. 실제 거래와 관계없다.
   사이트 보안 규칙(CSP): 글 속 style 을 쓰지 않는다 — 모양 값은 CSSOM(style.setProperty · cssText)으로만.
   2026-10-04 08:19 사장님 「정리 정돈 — 상승할 것 같은 회사들만 한곳에, 그렇지 않은 회사들도 한곳으로 · 게임도 그렇게」 · 「예정된 뉴스나 공시와 중요도」:
     카드 묶음을 「▲ 오를 쪽」(이어 오름 · 돌아 오름) · 「▼ 내릴 쪽」(꺾여 내림 · 이어 내림) 두 묶음으로 · 처음엔 오를 쪽 · 카드 신발도 두 줄
     카드마다 「일정」(다가오는 회사·업종 일정 중 가장 중요한 것) · 「공시」(지난 30일 가장 중요한 것) 한 줄씩 — ../data/atlas11/view/agenda.json(사이트와 같은 표) */
import {FLAT_BAND, outcome, settle, SYSTEMS, CENTER, AUX, runSystem, kellyFraction} from './engine.js';
import {METHODS, REFS, HYP, JOBS} from './refs.js';

/* ───────── 도우미 ───────── */
const $ = (s, el = document) => el.querySelector(s);
function h(tag, attrs, ...kids) {
  const el = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs || {})) {
    if (v == null || v === false) continue;
    if (k === 'class') el.className = v; else if (k === 'style') el.style.cssText = v; else if (k.startsWith('on')) el.addEventListener(k.slice(2), v); else el.setAttribute(k, v === true ? '' : v);
  }
  for (const c of kids.flat()) if (c != null && c !== false) el.append(c.nodeType ? c : document.createTextNode(String(c)));
  return el;
}
const NS = 'http://www.w3.org/2000/svg';
function s(tag, attrs = {}, ...kids) { const el = document.createElementNS(NS, tag); for (const [k, v] of Object.entries(attrs)) if (v != null) el.setAttribute(k, String(v)); for (const c of kids.flat()) if (c != null) el.append(c.nodeType ? c : document.createTextNode(String(c))); return el; }
const W = ['일', '월', '화', '수', '목', '금', '토'];
const wd = d => W[new Date(d + 'T00:00:00Z').getUTCDay()];
const kday = d => `${+d.slice(5, 7)}월 ${+d.slice(8, 10)}일(${wd(d)})`;
const kstDate = iso => new Date(Date.parse(iso) + 9 * 3600e3).toISOString().slice(0, 10);
const kstTime = iso => new Date(Date.parse(iso) + 9 * 3600e3).toISOString().slice(11, 16);
function won(n, sign = false) {
  const neg = n < 0, v = Math.round(Math.abs(n));
  if (v === 0) return '0원';
  const e = Math.floor(v / 1e8), m = Math.floor(v % 1e8 / 1e4), w = v % 1e4, parts = [];
  if (e) parts.push(e.toLocaleString('ko-KR') + '억');
  if (m) parts.push(m.toLocaleString('ko-KR') + '만');
  if (w) parts.push(w.toLocaleString('ko-KR'));
  return (neg ? '−' : sign ? '+' : '') + parts.join(' ') + (w ? '원' : ' 원');
}
/* 큰 돈은 만 원 아래를 반올림해 짧게 — 「54억 358만 원」 */
const wonS = (n, sign = false) => won(Math.abs(n) >= 1e6 ? Math.round(n / 1e4) * 1e4 : n, sign);
const pct = (r, digits = 1) => `${r > 0 ? '+' : r < 0 ? '−' : ''}${Math.abs(r * 100).toFixed(digits)}%`;
const dirOf = outcome;
const reduceMotion = () => matchMedia('(prefers-reduced-motion: reduce)').matches;
const LOCK = '08:00'; // 걸기 마감(하루 한 번) — 넥스트레이드 장전 거래(08:00)가 열리기 전
const SUITS = {H: {g: '♥', name: '하트', means: '분명히 오를 쪽'}, D: {g: '♦', name: '다이아', means: '오를 쪽 · 거의 반반'}, C: {g: '♣', name: '클로버', means: '내릴 쪽 · 거의 반반'}, S: {g: '♠', name: '스페이드', means: '분명히 내릴 쪽'}, J: {g: '★', name: '조커', means: 'ATLAS가 보합을 본 카드'}};
const suitOf = f => f.sel === 'up' ? (f.close ? 'D' : 'H') : f.sel === 'down' ? (f.close ? 'C' : 'S') : 'J';
const sideP = f => f.sel === 'up' ? f.up : f.sel === 'down' ? f.down : f.flat;
const QUADS = {
  'cont-up': {name: '이어 오름', says: '지난 1주 올랐고 ATLAS도 오를 쪽'},
  'rev-up': {name: '돌아 오름', says: '지난 1주 내렸는데 ATLAS는 오를 쪽'},
  'turn-down': {name: '꺾여 내림', says: '지난 1주 올랐는데 ATLAS는 내릴 쪽'},
  'cont-down': {name: '이어 내림', says: '지난 1주 내렸고 ATLAS도 내릴 쪽'},
};
const quadOf = c => { const upSide = c.f.sel === 'up' || (c.f.sel === 'flat' && c.f.up >= c.f.down), wkUp = c.weekRet >= 0; return upSide ? (wkUp ? 'cont-up' : 'rev-up') : (wkUp ? 'turn-down' : 'cont-down'); };

/* ───────── 글씨 크기(사이트와 같은 칸 'atlas11:font' · 100→125→150→175→200%) ───────── */
const FONT_STEPS = [100, 125, 150, 175, 200];
const fontStep = () => { try { return Math.min(4, Math.max(0, Number(JSON.parse(localStorage.getItem('atlas11:font') ?? '0')) || 0)); } catch { return 0; } };
const applyFont = () => { document.documentElement.style.fontSize = FONT_STEPS[fontStep()] + '%'; };
applyFont();

/* ───────── 소리(단추를 누른 뒤에만) · 떨림 ───────── */
let AC = null;
function tone(kind) {
  try {
    AC = AC || new (window.AudioContext || window.webkitAudioContext)();
    const t = AC.currentTime, out = AC.createGain(); out.connect(AC.destination);
    const noiseBurst = (len, freq, q, gain, at = 0) => { const buf = AC.createBuffer(1, Math.max(1, AC.sampleRate * len), AC.sampleRate), d = buf.getChannelData(0); for (let i = 0; i < d.length; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / d.length) ** 2; const src = AC.createBufferSource(), f = AC.createBiquadFilter(), g = AC.createGain(); f.type = 'bandpass'; f.frequency.value = freq; f.Q.value = q; g.gain.value = gain; src.buffer = buf; src.connect(f); f.connect(g); g.connect(out); src.start(t + at); };
    if (kind === 'click') { const o = AC.createOscillator(); o.type = 'triangle'; o.frequency.setValueAtTime(1900, t); o.frequency.exponentialRampToValueAtTime(700, t + .035); out.gain.setValueAtTime(.07, t); out.gain.exponentialRampToValueAtTime(.0001, t + .05); o.connect(out); o.start(t); o.stop(t + .06); }
    if (kind === 'chip') { noiseBurst(.05, 3200, 6, .5); noiseBurst(.04, 2600, 8, .35, .055); }
    if (kind === 'flip') noiseBurst(.18, 2400, 1.2, .25);
    if (kind === 'peel') noiseBurst(.35, 1800, .8, .22);
    if (kind === 'seal') { const o = AC.createOscillator(), g = AC.createGain(); o.type = 'sine'; o.frequency.setValueAtTime(140, t); o.frequency.exponentialRampToValueAtTime(55, t + .16); g.gain.setValueAtTime(.35, t); g.gain.exponentialRampToValueAtTime(.0001, t + .22); o.connect(g); g.connect(out); o.start(t); o.stop(t + .25); noiseBurst(.06, 900, 1, .3); }
    if (kind === 'win') [880, 1318.5].forEach((fq, i) => { const o = AC.createOscillator(), g = AC.createGain(); o.type = 'sine'; o.frequency.value = fq; g.gain.setValueAtTime(.0001, t + i * .12); g.gain.exponentialRampToValueAtTime(.12, t + i * .12 + .02); g.gain.exponentialRampToValueAtTime(.0001, t + i * .12 + .35); o.connect(g); g.connect(out); o.start(t + i * .12); o.stop(t + i * .12 + .4); });
  } catch { /* 소리를 못 내는 기기면 조용히 넘어간다 */ }
}
const buzz = ms => { try { navigator.vibrate?.(ms); } catch { /* 떨림이 없는 기기 */ } };
document.addEventListener('click', e => { const b = e.target.closest('button'); if (b && !b.classList.contains('chip') && b.id !== 'seal') tone('click'); });
let voiceOn = false;
function speak(text) { try { const u = new SpeechSynthesisUtterance(text); u.lang = 'ko-KR'; u.rate = .9; u.pitch = 1; u.volume = .96; speechSynthesis.cancel(); speechSynthesis.speak(u); } catch { /* 소리 읽기가 없는 기기 */ } }

/* ───────── 그림: 기요셰 무늬(솔 르윗 · 베라 몰나르 — 한 규칙에서 52가지 변주) ─────────
   무늬 꼴은 종목 번호로, 물결 높이는 지난 1주 흔들림으로, 겹 수는 오른 날 수로, 도는 방향은 1주 합계 부호로 정한다. */
/* 잉크 색 셋(오름 · 내림 · 보합): dataviz 색 검사기(밝기 띠 · 채도 · 색맹 구분 · 대비)를 다섯 항목 모두 통과한 값 — 2026-10-02 07:05 */
const INK = {up: '#b0172f', down: '#2a5cb8', flat: '#17805c', gold: '#a8863f'};
function specOf(c) {
  const sd = [...c.code].reduce((a, ch) => (a * 31 + ch.charCodeAt(0)) % 9973, 7);
  const vol = Math.sqrt(c.week.reduce((a, w) => a + w.ret * w.ret, 0) / c.week.length);
  const ups = c.week.filter(w => w.ret > FLAT_BAND).length;
  return {m: 12 + (sd % 7) * 2, n: 3 + (sd % 4), m2: 7 + (sd % 5), n2: 2 + (sd % 3), L: 8 + ups * 2, amp: Math.min(1.7, .65 + vol * 28), dir: c.weekRet >= 0 ? 1 : -1};
}
function weave(g, cx, cy, r0, a, m, n, L, dir, T) {
  for (let k = 0; k < L; k++) {
    const ph = dir * k * Math.PI * 2 / L;
    g.beginPath();
    for (let i = 0; i <= T; i++) { const t = i / T * Math.PI * 2, r = r0 + a * Math.sin(m * t + ph) + a * .45 * Math.sin(n * t - ph * 2); const x = cx + r * Math.cos(t), y = cy + r * Math.sin(t); if (i) g.lineTo(x, y); else g.moveTo(x, y); }
    g.stroke();
  }
}
function rosette(g, cx, cy, R, sp, ink, {alpha = .6, lw = .6, T = 540, rings = true} = {}) {
  g.save(); g.strokeStyle = ink; g.lineWidth = lw; g.globalAlpha = alpha;
  weave(g, cx, cy, R * .74, R * .13 * sp.amp, sp.m, sp.n, sp.L, sp.dir, T);
  weave(g, cx, cy, R * .36, R * .11 * sp.amp, sp.m2, sp.n2, Math.max(5, Math.round(sp.L * .7)), -sp.dir, Math.round(T * .6));
  if (rings) { g.globalAlpha = Math.min(1, alpha + .25); for (const f of [.985, .94]) { g.beginPath(); g.arc(cx, cy, R * f, 0, Math.PI * 2); g.stroke(); } }
  g.restore();
}
function paintCanvas(cv, draw, hh = null) {
  const dpr = Math.min(2, window.devicePixelRatio || 1), w = cv.clientWidth, H = hh ?? cv.clientHeight;
  if (!w || !H) return false;
  cv.width = Math.round(w * dpr); cv.height = Math.round(H * dpr);
  const g = cv.getContext('2d'); g.setTransform(dpr, 0, 0, dpr, 0, 0); g.clearRect(0, 0, w, H);
  draw(g, w, H); return true;
}
const inkOf = c => c.f.sel === 'up' ? INK.up : c.f.sel === 'down' ? INK.down : INK.flat;
function drawRosettes(root = document) {
  for (const cv of root.querySelectorAll('canvas[data-code]')) {
    const c = R()?.by[cv.dataset.code]; if (!c) continue;
    paintCanvas(cv, (g, w, H) => rosette(g, w / 2, H / 2, Math.min(w, H) / 2, specOf(c), inkOf(c), {lw: .55, alpha: .55, T: 640}));
  }
}
function pearl(g, cx, cy) {
  if (!g.createConicGradient) return '#dcd6ea';
  const cg = g.createConicGradient(0, cx, cy);
  [['#f8d9e8', 0], ['#cfeaf6', .16], ['#d9f3dd', .33], ['#f7f0cb', .5], ['#e7d9f7', .66], ['#cdeff1', .83], ['#f8d9e8', 1]].forEach(([c, st]) => cg.addColorStop(st, c));
  return cg;
}
function noise(size, alpha, dark) {
  const cv = document.createElement('canvas'); cv.width = cv.height = size;
  const g = cv.getContext('2d'), img = g.createImageData(size, size);
  for (let i = 0; i < img.data.length; i += 4) { const v = dark ? 0 : (Math.random() < .5 ? 0 : 255); img.data[i] = img.data[i + 1] = img.data[i + 2] = v; img.data[i + 3] = Math.random() * alpha; }
  g.putImageData(img, 0, 0); return cv.toDataURL('image/png');
}
/* 카드 뒷면: 칠흑 옻칠 위 끊음질(자개를 가늘게 썰어 끊어 붙인 기하 무늬) — 귀갑(거북 등) 육각 격자 + 금박 두 줄 테(시어리일레븐 아티잔 골드) */
function cardBack() {
  const cv = document.createElement('canvas'); cv.width = 300; cv.height = 420;
  const g = cv.getContext('2d'), lac = g.createLinearGradient(0, 0, 300, 420);
  lac.addColorStop(0, '#19191e'); lac.addColorStop(.5, '#0a0a0c'); lac.addColorStop(1, '#141418'); g.fillStyle = lac; g.fillRect(0, 0, 300, 420);
  const pr = pearl(g, 150, 210), R0 = 17, hw = R0 * Math.sqrt(3);
  g.save(); g.beginPath(); g.rect(30, 30, 240, 360); g.clip();
  g.lineCap = 'butt';
  for (let row = -1; row < 16; row++) for (let col = -1; col < 10; col++) {
    const cx = 30 + col * hw + (row % 2 ? hw / 2 : 0), cy = 30 + row * R0 * 1.5;
    for (let k = 0; k < 6; k++) {
      const a0 = Math.PI / 6 + k * Math.PI / 3, a1 = a0 + Math.PI / 3, gap = .12; // 꼭짓점마다 끊어 붙인 틈
      const x0 = cx + R0 * Math.cos(a0 + gap), y0 = cy + R0 * Math.sin(a0 + gap), x1 = cx + R0 * Math.cos(a1 - gap), y1 = cy + R0 * Math.sin(a1 - gap);
      g.strokeStyle = pr; g.globalAlpha = .62 + ((row * 7 + col * 3 + k) % 5) * .07; g.lineWidth = 2.1 + ((row + col + k) % 3) * .35;
      g.beginPath(); g.moveTo(x0, y0); g.lineTo(x1, y1); g.stroke();
    }
  }
  g.restore();
  g.globalAlpha = 1; g.fillStyle = '#0b0b0d'; g.beginPath(); g.arc(150, 210, 46, 0, Math.PI * 2); g.fill();
  rosette(g, 150, 210, 42, {m: 18, n: 5, m2: 9, n2: 3, L: 14, amp: 1.2, dir: 1}, pr, {alpha: .9, lw: .7, T: 640});
  g.save(); g.strokeStyle = '#d9b968'; g.lineWidth = 1.4; g.globalAlpha = .9; g.strokeRect(16, 16, 268, 388); g.globalAlpha = .55; g.lineWidth = .8; g.strokeRect(22, 22, 256, 376); g.restore();
  return cv.toDataURL('image/png');
}
function artOnce() {
  const root = document.documentElement.style;
  try {
    root.setProperty('--paper-grain', `url(${noise(160, 14)})`);
    root.setProperty('--felt-noise', `url(${noise(180, 26, true)})`);
    root.setProperty('--card-back', `url(${cardBack()})`);
    const bg = document.createElement('canvas'); bg.width = 480; bg.height = 240;
    const b2 = bg.getContext('2d'); b2.strokeStyle = 'rgba(210,178,109,.05)'; b2.lineWidth = 1;
    for (let k = 0; k < 16; k++) { b2.beginPath(); for (let x = 0; x <= 480; x += 4) { const y = k * 15 + 7 * Math.sin(x / 480 * Math.PI * 4 + k * .5) + 3 * Math.sin(x / 480 * Math.PI * 10 - k); if (x) b2.lineTo(x, y); else b2.moveTo(x, y); } b2.stroke(); }
    root.setProperty('--bg-lines', `url(${bg.toDataURL('image/png')})`);
    const pc = document.createElement('canvas'); pc.width = pc.height = 120; const pg = pc.getContext('2d'); pg.fillStyle = pearl(pg, 60, 60); pg.fillRect(0, 0, 120, 120);
    root.setProperty('--pearl', `url(${pc.toDataURL('image/png')})`);
  } catch { /* 그림을 못 만들면 무늬 없이 둔다 */ }
  paintCanvas($('#emblem'), (g, w, H) => { g.fillStyle = '#0b0b0d'; g.beginPath(); g.arc(w / 2, H / 2, w / 2, 0, Math.PI * 2); g.fill(); rosette(g, w / 2, H / 2, w / 2 - 1, {m: 16, n: 4, m2: 8, n2: 3, L: 12, amp: 1.1, dir: 1}, pearl(g, w / 2, H / 2), {alpha: .9, lw: .5, T: 480}); g.strokeStyle = '#c9a75e'; g.lineWidth = 1; g.beginPath(); g.arc(w / 2, H / 2, w / 2 - .6, 0, Math.PI * 2); g.stroke(); });
}
/* 킨츠기: 틀린 자리를 금으로 이어 감추지 않는다 */
let KIN = 0;
function kintsugiSvg() {
  const id = 'kg' + (++KIN), svg = s('svg', {viewBox: '0 0 100 140', preserveAspectRatio: 'none', class: 'kin', 'aria-hidden': 'true'});
  const lg = s('linearGradient', {id, x1: 0, y1: 0, x2: 1, y2: 1}, ...[['0', '#f6e2a8'], ['.45', '#b8924a'], ['.6', '#f3dc9a'], ['1', '#8f6f2e']].map(([o, c]) => s('stop', {offset: o, 'stop-color': c})));
  svg.append(s('defs', {}, lg));
  for (const [d, w] of [['M6 22 L24 38 L21 50 L40 63 L37 76 L58 92 L55 104 L76 118 L73 127 L94 138', 2.4], ['M40 63 L52 58 L60 61', 1.6], ['M58 92 L47 101', 1.4]]) svg.append(s('path', {d, fill: 'none', stroke: `url(#${id})`, 'stroke-width': w, 'stroke-linejoin': 'round', 'stroke-linecap': 'round', 'vector-effect': 'non-scaling-stroke'}));
  return svg;
}
function kintsugiOn(g, x, y, r, seed) {
  g.save(); g.strokeStyle = '#c9a24e'; g.lineWidth = 1.3; g.globalAlpha = .95; g.lineJoin = 'round';
  g.beginPath(); const a = (seed % 7) / 7 * Math.PI; let px = x - r * Math.cos(a), py = y - r * Math.sin(a); g.moveTo(px, py);
  for (let i = 1; i <= 5; i++) { const t = i / 5, jx = ((seed * (i + 3)) % 9 - 4) / 9 * r * .5, jy = ((seed * (i + 5)) % 7 - 3) / 7 * r * .5; px = x - r * Math.cos(a) + 2 * r * Math.cos(a) * t + jx * Math.sin(a); py = y - r * Math.sin(a) + 2 * r * Math.sin(a) * t - jy * Math.cos(a); g.lineTo(px, py); }
  g.stroke(); g.restore();
}
function makiOn(g, x, y, r, seed) { // 마키에: 맞힌 무늬 둘레에 금가루
  g.save(); g.fillStyle = '#c9a24e';
  for (let i = 0; i < 14; i++) { const a = (seed * 13 + i * 47) % 360 / 180 * Math.PI, d = r * (1.02 + ((seed + i * 7) % 10) / 40); g.globalAlpha = .45 + (i % 4) * .12; g.beginPath(); g.arc(x + d * Math.cos(a), y + d * Math.sin(a), .55 + (i % 3) * .35, 0, Math.PI * 2); g.fill(); }
  g.restore();
}
/* 낙관(전각 白文): 붉은 인주 위 글자를 파 흰 글자로 — 네 글자를 오른쪽 줄부터 위에서 아래로 */
let SEAL = 0;
function sealSvg(chars, {size = 100} = {}) {
  const id = 'sl' + (++SEAL), svg = s('svg', {viewBox: '0 0 100 100', width: size, height: size, 'aria-hidden': 'true'});
  svg.append(s('defs', {}, s('filter', {id, x: '-5%', y: '-5%', width: '110%', height: '110%'}, s('feTurbulence', {type: 'fractalNoise', baseFrequency: '.9', numOctaves: 2, seed: 7, result: 'n'}), s('feDisplacementMap', {in: 'SourceGraphic', in2: 'n', scale: 3.2}))));
  const grp = s('g', {filter: `url(#${id})`});
  grp.append(s('rect', {x: 4, y: 4, width: 92, height: 92, rx: 5, fill: '#c3262c'}), s('rect', {x: 10, y: 10, width: 80, height: 80, rx: 3, fill: 'none', stroke: '#fff4ec', 'stroke-width': 2.4}));
  const pos = [[30, 37], [70, 37], [30, 72], [70, 72]]; // 왼쪽에서 오른쪽, 위에서 아래(요즘 읽는 순서)
  [...chars].slice(0, 4).forEach((ch, i) => grp.append(s('text', {x: pos[i][0], y: pos[i][1], 'text-anchor': 'middle', 'font-family': 'Hahmlet, serif', 'font-weight': 800, 'font-size': 31, fill: '#fff4ec'}, ch)));
  svg.append(grp); return svg;
}

/* ───────── 자료 · 상태 ───────── */
let D = null, ROUNDS = {}, PLAN = {}, POOLED = {}, RUNS = {}, AGENDA = null;
const KEY = 'atlas-game:v1';
const loadP = () => { try { const v = JSON.parse(localStorage.getItem(KEY) || 'null'); return v && typeof v === 'object' ? v : null; } catch { return null; } };
const P = Object.assign({purse: 3e8, bets: {}, history: [], method: 'kelly'}, loadP() || {});
const saveP = () => { try { localStorage.setItem(KEY, JSON.stringify(P)); } catch { /* 저장이 막힌 기기 — 이 화면에서만 */ } };
const AMTS = [1e7, 5e7, 1e8, 1.5e8];
const AMT = {10000000: ['1천만', 'c1'], 50000000: ['5천만', 'c2'], 100000000: ['1억', 'pl'], 150000000: ['1.5억', 'pl dark']};
const fresh = () => ({lev: null, inv: null, levAmt: 1e8, invAmt: 1e8, locked: false, revealed: false, open: {lev: false, inv: false}});
const S = {round: 'live', method: SYSTEMS[CENTER].ready ? CENTER : (AUX.includes(P.method) ? P.method : 'kelly'), idx: 0, quad: 'up', fresh: [], bets: {practice: fresh()}, plateAnimate: false, dealt: null, sealAnim: false};
const R = () => ROUNDS[S.round];
const B = () => S.round === 'live' ? (P.bets[ROUNDS.live.target] ||= {...fresh()}) : S.bets.practice;
const liveOpen = () => Date.now() < ROUNDS.live.closeAt;
const lockedNow = () => B().locked || (S.round === 'live' && !liveOpen());

function hitsOf(beforeDate) { // 종목마다 ATLAS가 방향을 맞힌 비율(후향 · 목표일 전날까지 · 보합 결과와 쉼은 뺌)
  const out = {}; if (!D.hist) return out;
  const n = D.hist.dates.filter(d => d < beforeDate).length;
  for (const st of D.hist.stocks) { let k = 0, m = 0; for (let i = 0; i < n; i++) { const side = st.s[i] === 'u' ? 'up' : st.s[i] === 'd' ? 'down' : null, o = outcome(st.r[i]); if (!side || o === 'flat') continue; m++; if (o === side) k++; } out[st.code] = {k, n: m, days: n}; }
  return out;
}
function prep(round, key) {
  const order = {H: 0, D: 1, J: 2, C: 3, S: 4}, hits = hitsOf(round.target);
  const deck = round.stocks.map(st => ({...st, suit: suitOf(st.f), p: sideP(st.f), quad: quadOf(st), hit: hits[st.code] ?? null, road: roadOf(st.c)}))
    .sort((a, b) => order[a.suit] - order[b.suit] || b.p - a.p || a.code.localeCompare(b.code));
  deck.forEach((c, i) => { c.no = i + 1; });
  return {...round, key, title: key === 'live' ? '실전 판' : '연습 판', deck, by: Object.fromEntries(deck.map(c => [c.code, c])), closeAt: Date.parse(round.target + `T${LOCK}:00+09:00`)};
}
/* 바카라 큰길(大路) + 크기 — 2026-10-03 23:22 사장님 「많이 움직이면 많이, 적게 움직이면 적게 · 바카라 표기 참 좋아」
   23:59 「어려워 · 쉬우면서 딱 봐도 판단되게」 → 기호 둘: 빨간 동그라미 = 1% 오름 · 파란 동그라미 = 1% 내림
   2026-10-04 00:10 「좋아 · 더 쉽게 더 지혜롭게」 → 힘 저울 두 줄(처음 15일 · 최근 5일), 맨 아래는 흐름 한 마디(9가지 중 하나)
   · 하루 등락을 1% 단위로 반올림한 수만큼 동그라미를 쌓는다(0.5% 안쪽 잔물결은 그리지 않음 — 주식의 점수 도표 Point & Figure 와 같은 생각)
   · 같은 쪽이 이어지면 아래로, 바뀌면 새 줄 · 여섯 칸이 차거나 막히면 오른쪽으로(용꼬리) — 바카라 큰길 규칙 그대로
   · 흐름 한 마디 = 「처음 15일 힘」 뒤에 「최근 5일 힘」을 이어 읽은 것: 오르다가 요즘 꺾임 · 내리다가 요즘 반등 …
     (20일 전체가 아니라 앞뒤를 나눠야 「~하다가 요즘 ~」이 말 그대로 맞다 — 20일 전체로 읽으면 내리다 최근에 크게 오른 종목이 「계속 오르는 흐름」으로 잘못 읽힘)
     지난 기록을 읽은 말 · 다음 날을 맞히는 말이 아님
   · 아주 크게 움직이는 종목(1%로 24줄 넘음)만 한 칸을 2%·3%·5% 로 키우고 「하나 = ○%」로 적는다 */
const ROAD_UNITS = [0.01, 0.02, 0.03, 0.05], ROAD_MAX_COLS = 24, ROAD_RECENT = 5;
function roadLayout(rets, unit) {
  const cells = [], occ = new Set();
  let last = null, colStart = -1, col = 0, row = 0, turned = false;
  rets.forEach((r, day) => {
    const n = Math.round(Math.abs(r) / unit), o = r > 0 ? 'up' : 'down';
    for (let k = 0; k < n; k++) {
      if (o !== last) { colStart++; while (occ.has(colStart + ',0')) colStart++; col = colStart; row = 0; turned = false; }
      else if (!turned && row < 5 && !occ.has(col + ',' + (row + 1))) row++;
      else { col++; turned = true; }
      occ.add(col + ',' + row); cells.push({col, row, side: o, day}); last = o;
    }
  });
  return {cells, cols: cells.length ? Math.max(...cells.map(c => c.col)) + 1 : 0};
}
/** 저울 하나: 빨간 수 대 파란 수 — 동그라미가 1개 이하면 잠잠 · 차이가 1개 또는 전체의 10% 이하면 비슷 */
const balance = (up, down) => ({up, down, side: up + down <= 1 ? 'still' : Math.abs(up - down) <= Math.max(1, (up + down) * .1) ? 'flat' : up > down ? 'up' : 'down'});
function roadOf(closes) {
  const rets = closes.slice(1).map((c, i) => c / closes[i] - 1);
  let unit = ROAD_UNITS[0], lay = roadLayout(rets, unit);
  for (const u of ROAD_UNITS.slice(1)) { if (lay.cols <= ROAD_MAX_COLS) break; unit = u; lay = roadLayout(rets, u); }
  const ups = rets.filter(r => outcome(r) === 'up').length, downs = rets.filter(r => outcome(r) === 'down').length, flats = rets.length - ups - downs;
  // 지금 이어지는 줄(보합은 줄을 끊지 않는다)과 그 동안의 등락 — 날 수로 센다
  const side = [...rets].reverse().map(outcome).find(o => o !== 'flat') ?? null;
  let len = 0, i = rets.length - 1;
  for (; i >= 0; i--) { const o = outcome(rets[i]); if (o === 'flat') continue; if (o !== side) break; len++; }
  const from = i + 1, ret = side ? closes.at(-1) / closes[from] - 1 : 0;
  const count = (cells, sd) => cells.filter(c => c.side === sd).length, cut = rets.length - ROAD_RECENT;
  const early = lay.cells.filter(c => c.day < cut), recent = lay.cells.filter(c => c.day >= cut);
  const all = balance(count(lay.cells, 'up'), count(lay.cells, 'down'));
  const before = balance(count(early, 'up'), count(early, 'down')), now = balance(count(recent, 'up'), count(recent, 'down'));
  return {...lay, unit, all, before, now, beforeDays: Math.max(0, cut), recentDays: Math.min(ROAD_RECENT, rets.length), ups, downs, flats, days: rets.length, streak: {side, len, ret}, total: closes.at(-1) / closes[0] - 1};
}
/** 흐름 한 마디: 처음 15일 힘 → 최근 5일 힘 (아홉 칸 표) — 글자 색은 최근 5일 쪽 */
const STORY = {
  up: {up: '계속 오르는 흐름', flat: '오르다가 요즘 쉬는 중', down: '오르다가 요즘 꺾임'},
  flat: {up: '요즘은 오름 쪽', flat: '뚜렷한 쪽 없음', down: '요즘은 내림 쪽'},
  down: {up: '내리다가 요즘 반등', flat: '내리다가 요즘 쉬는 중', down: '계속 내리는 흐름'}};
function roadStory(road) {
  const calm = x => x === 'still' ? 'flat' : x, b = road.before.side, n = road.now.side;
  if (b === 'still' && n === 'still') return {side: 'flat', text: `${road.days}거래일 내내 거의 안 움직임`};
  return {side: calm(n), text: STORY[calm(b)][calm(n)]};
}
/* 저울 옆 낱말 — 좁은 칸에 들어가게 짧게: 동그라미가 1개 이하(0.5칸 안쪽 잔물결뿐)면 「잠잠함」 */
const WORD = {up: '오름이 셈', down: '내림이 셈', flat: '비슷함', still: '잠잠함'};
function roadSvg(road) {
  const cs = 12, cols = Math.max(20, road.cols), unitPct = Math.round(road.unit * 100);
  const svg = s('svg', {class: 'road', viewBox: `0 0 ${cols * cs} ${6 * cs}`, role: 'img', 'aria-label': `출목표 ${road.days}거래일 · 동그라미 하나 = ${unitPct}% 움직임: 빨간 동그라미 ${road.all.up}개(오름) · 파란 동그라미 ${road.all.down}개(내림) · 처음 ${road.beforeDays}거래일 빨강 ${road.before.up}개 · 파랑 ${road.before.down}개 · 최근 ${road.recentDays}거래일 빨강 ${road.now.up}개 · 파랑 ${road.now.down}개 · ${roadStory(road).text}`});
  const grid = s('g', {stroke: 'rgba(122,92,32,.22)', 'stroke-width': .6});
  for (let c = 0; c <= cols; c++) grid.append(s('line', {x1: c * cs, y1: 0, x2: c * cs, y2: 6 * cs}));
  for (let r = 0; r <= 6; r++) grid.append(s('line', {x1: 0, y1: r * cs, x2: cols * cs, y2: r * cs}));
  svg.append(grid);
  for (const c of road.cells) svg.append(s('circle', {class: 'bead', cx: c.col * cs + cs / 2, cy: c.row * cs + cs / 2, r: 4.3, fill: 'none', stroke: c.side === 'up' ? INK.up : INK.down, 'stroke-width': 1.9}));
  return svg;
}
/* 표 아래: 힘 저울 두 줄(처음 15일 · 최근 5일) → 흐름 한 마디 → 작은 읽는 법
   막대 = 그 기간의 빨간 동그라미 수 대 파란 동그라미 수 · 「비슷함」이면 막대를 옅게(이긴 쪽 없음) · 「잠잠함」이면 빈 막대 */
function roadKey(road) {
  const unitPct = Math.round(road.unit * 100), story = roadStory(road), w = 240;
  const bar = b => {
    const all = b.up + b.down, upW = all ? b.up / all * w : w / 2, show = b.side !== 'still', dim = b.side === 'flat' ? .5 : null;
    return s('svg', {class: 'scale', viewBox: `0 0 ${w} 10`, preserveAspectRatio: 'none', 'aria-hidden': 'true'},
      s('title', {}, `빨간 동그라미 ${b.up}개 · 파란 동그라미 ${b.down}개`),
      s('rect', {x: 0, y: 1, width: w, height: 8, rx: 4, fill: 'rgba(122,92,32,.15)'}),
      ...(show && b.up ? [s('rect', {x: 0, y: 1, width: Math.max(4, upW - (b.down ? 1 : 0)), height: 8, rx: 4, fill: INK.up, 'fill-opacity': dim})] : []),
      ...(show && b.down ? [s('rect', {x: b.up ? Math.min(w - 4, upW + 1) : 0, y: 1, width: Math.max(4, w - upW - (b.up ? 1 : 0)), height: 8, rx: 4, fill: INK.down, 'fill-opacity': dim})] : []));
  };
  const row = (label, b) => h('div', {class: 'rk-row', 'data-up': String(b.up), 'data-down': String(b.down), 'data-side': b.side}, h('span', {class: 'rk-lab'}, label), bar(b), h('b', {class: 'rk-word ' + b.side}, WORD[b.side]));
  return h('div', {class: 'road-key'},
    road.beforeDays ? row(`처음 ${road.beforeDays}일`, road.before) : null, row(`최근 ${road.recentDays}일`, road.now),
    h('p', {class: 'rk-story ' + story.side}, story.text),
    h('p', {class: 'rk-note'}, h('span', {}, `동그라미 하나 = ${unitPct}% · 빨강 오름 · 파랑 내림`), h('span', {}, '막대 길이 = 동그라미 개수')));
}
function sparkSvg(closes, total) {
  const w = 240, hh = 46, lo = Math.min(...closes), hi = Math.max(...closes), pad = (hi - lo) * .12 || 1;
  const x = i => i / (closes.length - 1) * (w - 8) + 4, y = v => hh - 4 - (v - (lo - pad)) / ((hi + pad) - (lo - pad)) * (hh - 8);
  const d = closes.map((v, i) => (i ? 'L' : 'M') + x(i).toFixed(1) + ' ' + y(v).toFixed(1)).join(' ');
  const iMin = closes.indexOf(lo), iMax = closes.indexOf(hi), end = closes.length - 1;
  return s('svg', {class: 'spark', viewBox: `0 0 ${w} ${hh}`, role: 'img', 'aria-label': `종가 ${closes.length}거래일: 처음 ${closes[0].toLocaleString('ko-KR')}원, 끝 ${closes[end].toLocaleString('ko-KR')}원`},
    s('path', {d, fill: 'none', stroke: '#4b4338', 'stroke-width': 1.4, 'stroke-linejoin': 'round'}),
    s('circle', {cx: x(iMin), cy: y(lo), r: 2.2, fill: INK.down}), s('circle', {cx: x(iMax), cy: y(hi), r: 2.2, fill: INK.up}),
    s('circle', {cx: x(end), cy: y(closes[end]), r: 3.4, fill: total >= 0 ? INK.up : INK.down, stroke: '#f6efe3', 'stroke-width': 1.2}));
}
function histPlan(beforeDate) {
  if (!D.hist) return {dates: [], stocks: []};
  const n = D.hist.dates.filter(d => d < beforeDate).length, dates = D.hist.dates.slice(0, n);
  return {dates, stocks: D.hist.stocks.map(st => { const days = new Map(); dates.forEach((dt, i) => { const c = st.s[i]; days.set(dt, {side: c === 'u' ? 'up' : c === 'd' ? 'down' : null, ret: st.r[i]}); }); return {code: st.code, name: ROUNDS.live.by[st.code]?.name, days}; })};
}
function pooledOf(plan) { const p = {win: 0, lose: 0}; for (const st of plan.stocks) for (const d of st.days.values()) { if (!d.side) continue; const o = outcome(d.ret); if (o === 'flat') continue; if (o === d.side) p.win++; else p.lose++; } return p; }
function realPlan() {
  const dates = D.settled.map(r => r.target);
  return {dates, stocks: ROUNDS.live.deck.map(c => ({code: c.code, name: c.name, days: new Map(D.settled.map(r => { const x = r.stocks.find(y => y.code === c.code); return [r.target, {side: x && x.ret != null && (x.sel === 'up' || x.sel === 'down') ? x.sel : null, ret: x?.ret ?? 0}]; }))}))};
}
const runOf = (key, m) => (RUNS[key + m] ||= runSystem(key === 'real' ? PLAN.real : PLAN[key], {system: m, unit: 1e7, bank: 1e8, pooled0: key === 'real' ? POOLED.beforeStart : null}));
/* ATLAS 이번 판: 실전 판은 게임 시작일부터 이어 온 돈과 베팅법 상태로 · 연습 판은 새 52억(카드마다 1억)으로 */
function atlasBets(Rd, m) {
  const sys = SYSTEMS[m];
  if (Rd.key === 'live') {
    const run = runOf('real', m), by = Object.fromEntries(run.stocks.map(x => [x.code, x]));
    return Rd.deck.map(c => { const side = c.f.sel === 'up' || c.f.sel === 'down' ? c.f.sel : null, st = by[c.code]; if (!side || !st || st.out) return {code: c.code, side, amount: 0}; const want = sys.sizeAtOpen ? sys.sizeAtOpen(st.end, run.pooled) : st.state.bet; return {code: c.code, side, amount: Math.max(0, Math.min(want, st.end))}; });
  }
  return Rd.deck.map(c => { const side = c.f.sel === 'up' || c.f.sel === 'down' ? c.f.sel : null; const amount = !side ? 0 : sys.sizeAtOpen ? sys.sizeAtOpen(1e8, POOLED.practice) : sys.start(1e7).bet; return {code: c.code, side, amount}; });
}
/* 걸어 둔 실전 판이 정산되면(그 날 종가가 들어오면) 내 돈에 더한다 — 한 번만 */
function settleSaved() {
  const done = new Set(P.history.map(x => x.target));
  for (const r of D.settled) {
    const b = P.bets[r.target];
    if (!b || !b.locked || !b.lev || !b.inv || done.has(r.target)) continue;
    const by = Object.fromEntries(r.stocks.map(x => [x.code, x])), L = by[b.lev], I = by[b.inv];
    if (L?.ret == null || I?.ret == null) continue;
    const l = settle('up', b.levAmt, L.ret), i = settle('down', b.invAmt, I.ret);
    P.purse += l.pnl + i.pnl;
    P.history.push({target: r.target, lev: b.lev, inv: b.inv, levAmt: b.levAmt, invAmt: b.invAmt, levRet: L.ret, invRet: I.ret, levRes: l.result, invRes: i.result, pnl: l.pnl + i.pnl, purseAfter: P.purse});
    S.fresh.push(r.target);
  }
  saveP();
}
const nameOf = code => ROUNDS.live.by[code]?.name ?? ROUNDS.practice?.by[code]?.name ?? code;
const resWord = r => r === 'win' ? '맞힘' : r === 'lose' ? '틀림' : '보합';
function settlePractice() {
  const R0 = ROUNDS.practice, b = S.bets.practice;
  const leg = (code, side, amt) => { const c = R0.by[code], st = settle(side, amt, c.actual.ret); return {code, name: c.name, side, amt, ret: c.actual.ret, ...st}; };
  const me = {lev: leg(b.lev, 'up', b.levAmt), inv: leg(b.inv, 'down', b.invAmt)}; me.total = me.lev.pnl + me.inv.pnl;
  let w = 0, l = 0, p = 0, tot = 0;
  for (const x of atlasBets(R0, S.method)) { const c = R0.by[x.code]; if (!x.side || !x.amount || !c.actual) continue; const st = settle(x.side, x.amount, c.actual.ret); tot += st.pnl; if (st.result === 'win') w++; else if (st.result === 'lose') l++; else p++; }
  return {me, at: {total: tot, win: w, lose: l, push: p}};
}
const revealed = () => S.round === 'practice' && S.bets.practice.revealed;

/* ───────── 머리판: 두 지갑(스플릿 플랩) · 판 · 마감 시계 ───────── */
const FLAP_PREV = new Map();
function flaps(el, text) {
  const prev = FLAP_PREV.get(el) ?? ''; FLAP_PREV.set(el, text);
  el.replaceChildren(...[...text].map((ch, i) => /\d/.test(ch) ? h('span', {class: 'fl' + (prev && prev[i] !== ch && !reduceMotion() ? ' flip' : '')}, ch) : ch === ' ' ? ' ' : h('span', {class: 'fu'}, ch)));
  el.setAttribute('aria-label', text);
}
function renderHead() {
  let me = P.purse, at = runOf('real', S.method).end, rr = null;
  if (revealed()) { rr = settlePractice(); me = 3e8 + rr.me.total; at = 52e8 + rr.at.total; }
  flaps($('#meNow'), wonS(me)); flaps($('#atNow'), wonS(at));
  const chg = (el, d, base, label) => { el.className = 'chg ' + (d > 0 ? 'up' : d < 0 ? 'down' : ''); el.textContent = d === 0 ? `처음 ${won(base)}` : `${label} ${wonS(d, true)} (${pct(d / base, 2)})`; };
  chg($('#meChg'), me - 3e8, 3e8, rr ? '연습 판' : '처음보다'); chg($('#atChg'), at - 52e8, 52e8, rr ? '연습 판' : '처음보다');
  $('#tab-live').setAttribute('aria-selected', String(S.round === 'live'));
  $('#tab-practice').setAttribute('aria-selected', String(S.round === 'practice'));
  $('#tab-practice').hidden = !ROUNDS.practice;
  $('#tabLiveDate').textContent = kday(ROUNDS.live.target);
  $('#tabLiveNote').textContent = liveOpen() ? `${LOCK} 마감` : `${LOCK}에 마감함`;
  if (ROUNDS.practice) $('#tabPracDate').textContent = kday(ROUNDS.practice.target);
  const clock = $('#clock'), R0 = R();
  if (S.round === 'live' && liveOpen()) {
    const left = R0.closeAt - Date.now(), hh = Math.floor(left / 3600000), mm = Math.floor(left % 3600000 / 60000), f = h('p', {class: 'flaps'});
    flaps(f, `${String(hh).padStart(2, '0')}시간 ${String(mm).padStart(2, '0')}분`);
    clock.replaceChildren(h('span', null, '걸기 마감 ', h('b', null, `${kday(R0.target)} ${LOCK}`), ' · 하루 한 번 · 남은 시간'), f);
  } else if (S.round === 'live') clock.replaceChildren(h('span', null, `${kday(R0.target)} 판은 ${LOCK}에 마감했습니다 · 그날 15:30 종가가 올라오면 정산합니다`));
  else clock.replaceChildren(h('span', null, `${kday(R0.target)} 판 · 종가가 나온 판이라 낙관을 찍고 카드를 젖히면 바로 정산합니다(내 돈에는 더하지 않음)`));
  $('#basis').textContent = `기준 ${kday(R0.actualAsOf)} 종가 · 게임 돈이며 실제 거래와 관계없습니다 · 내 돈은 이 기기에만 저장됩니다`;
}

/* ───────── I 법칙: 바카라 세 칸 · 하루 한 번 시간표 ───────── */
function renderRule() {
  const R0 = R();
  $('#rule').replaceChildren(
    h('div', {class: 'lev'}, h('h3', null, '레버리지'), h('p', null, '오르면 건 돈의 2배를 돌려받음'), h('p', null, '내리면 잃음')),
    h('div', {class: 'tie'}, h('h3', null, '보합'), h('p', null, '전날 종가에서 ±0.1% 안'), h('p', null, '건 돈을 돌려받음')),
    h('div', {class: 'inv'}, h('h3', null, '인버스'), h('p', null, '내리면 건 돈의 2배를 돌려받음'), h('p', null, '오르면 잃음')));
  const issued = R0.issuedAt ? [kstDate(R0.issuedAt), kstTime(R0.issuedAt)] : [R0.actualAsOf, '—'];
  $('#day').replaceChildren(
    h('li', null, h('i', null, '종'), h('b', null, '15:30'), h('span', null, `${kday(R0.actualAsOf)} 종가 · ATLAS 기준`)),
    h('li', null, h('i', null, '예'), h('b', null, issued[1]), h('span', null, `${kday(issued[0])} ATLAS 발행`)),
    h('li', {class: 'lock'}, h('i', null, '봉'), h('b', null, LOCK), h('span', null, `${kday(R0.target)} 걸기 마감 · 하루 한 번`)),
    h('li', null, h('i', null, '정'), h('b', null, '15:30'), h('span', null, `${kday(R0.target)} 종가로 정산`)));
  $('#duel').replaceChildren(h('b', null, '나'), ' — 카드 2장 · 3억 원으로 시작   대   ', h('b', null, 'ATLAS'), ' — 카드 52장 · 52억 원으로 시작');
}

/* ───────── II 논리 판화: 가로 = 지난 1주 · 세로 = ATLAS · 무늬 하나 = 종목 하나 ───────── */
let PLATE_RUN = 0, PLATE_PTS = [];
function layoutPlate(deck, W0, H0, r) {
  const x0 = W0 / 2, y0 = H0 / 2, pad = r + 4;
  // 눈금: 크기 순서는 지키되 0 근처를 넓혀 그린다(부호 있는 제곱근 · 90번째 백분위 넘는 값은 끝에 붙임)
  const q90 = a => { const v = a.map(Math.abs).sort((x, y) => x - y); return v[Math.min(v.length - 1, Math.floor(v.length * .9))] || 1e-6; };
  const xr = Math.max(.01, q90(deck.map(c => c.weekRet))), yr = Math.max(.02, q90(deck.map(c => c.f.up - c.f.down)));
  const sq = (v, m) => Math.sign(v) * Math.sqrt(Math.min(1, Math.abs(v) / m));
  const pts = deck.map(c => { const q = c.quad, right = q === 'cont-up' || q === 'turn-down', top = q === 'cont-up' || q === 'rev-up';
    let x = x0 + sq(c.weekRet, xr) * (W0 / 2 - pad), y = y0 - sq(c.f.up - c.f.down, yr) * (H0 / 2 - pad);
    x = right ? Math.max(x0 + r * 1.05, x) : Math.min(x0 - r * 1.05, x); y = top ? Math.min(y0 - r * 1.05, y) : Math.max(y0 + r * 1.05, y);
    return {c, x, y, right, top}; });
  // 겹치지 않게 밀어내기(같은 사분면 안에서만 · 같은 입력이면 같은 결과)
  for (let it = 0; it < 160; it++) {
    for (let i = 0; i < pts.length; i++) for (let j = i + 1; j < pts.length; j++) {
      const a = pts[i], b = pts[j], dx = b.x - a.x, dy = b.y - a.y, d = Math.hypot(dx, dy) || .01, need = r * 2.04;
      if (d < need) { const push = (need - d) / 2, ux = dx / d || 1, uy = dy / d; a.x -= ux * push; a.y -= uy * push; b.x += ux * push; b.y += uy * push; }
    }
    for (const p of pts) { p.x = p.right ? Math.min(W0 - r - 2, Math.max(x0 + r * 1.05, p.x)) : Math.max(r + 2, Math.min(x0 - r * 1.05, p.x)); p.y = p.top ? Math.max(r + 2, Math.min(y0 - r * 1.05, p.y)) : Math.min(H0 - r - 2, Math.max(y0 + r * 1.05, p.y)); }
  }
  return pts;
}
function renderPlate() {
  const R0 = R(), actual = revealed(), cv = $('#plateCv'), box = $('#plateBox');
  const animate = S.plateAnimate && !reduceMotion(); S.plateAnimate = false; const run = ++PLATE_RUN;
  const W0 = box.clientWidth; if (!W0) return;
  const H0 = Math.round(W0 * .9), r = Math.max(9, W0 / 27);
  cv.style.height = H0 + 'px';
  const pts = layoutPlate(R0.deck, W0, H0, r); PLATE_PTS = pts.map(p => ({code: p.c.code, x: p.x, y: p.y, r}));
  const cnt = {'cont-up': 0, 'rev-up': 0, 'turn-down': 0, 'cont-down': 0}, hit = {'cont-up': 0, 'rev-up': 0, 'turn-down': 0, 'cont-down': 0}, dec = {...hit};
  let up = 0, down = 0, flat = 0, hits = 0, decided = 0;
  paintCanvas(cv, (g, w, H) => {
    // 축: 금빛 가는 선 두 줄 + 눈금
    g.save(); g.strokeStyle = 'rgba(122,92,32,.55)'; g.lineWidth = 1; g.beginPath(); g.moveTo(w / 2, 4); g.lineTo(w / 2, H - 4); g.moveTo(4, H / 2); g.lineTo(w - 4, H / 2); g.stroke();
    g.strokeStyle = 'rgba(122,92,32,.3)'; for (let k = 1; k < 8; k++) { const x = k * w / 8, y = k * H / 8; g.beginPath(); g.moveTo(x, H / 2 - 3); g.lineTo(x, H / 2 + 3); g.moveTo(w / 2 - 3, y); g.lineTo(w / 2 + 3, y); g.stroke(); }
    g.restore();
    const marks = pts.map((p, i) => {
      const c = p.c; cnt[c.quad]++;
      let ink, a, miss = false, hitOk = false;
      if (actual && c.actual) {
        const d = dirOf(c.actual.ret);
        if (d === 'up') up++; else if (d === 'down') down++; else flat++;
        if (d !== 'flat' && c.f.sel !== 'flat') { decided++; dec[c.quad]++; if (d === c.f.sel) { hits++; hit[c.quad]++; hitOk = true; } else miss = true; }
        ink = d === 'up' ? INK.up : d === 'down' ? INK.down : INK.flat; a = d === 'flat' ? .4 : .32 + .6 * Math.min(1, Math.abs(c.actual.ret) / .03);
      } else { ink = inkOf(c); a = .28 + .62 * Math.min(1, Math.max(0, (c.p - .45) / .15)); if (c.f.sel === 'up') up++; else down++; }
      return {x: p.x, y: p.y, sp: {...specOf(c), L: Math.min(10, specOf(c).L)}, ink, a, miss, hitOk, seed: i + 3};
    });
    const stamp = m => { rosette(g, m.x + .7, m.y + .9, r, m.sp, 'rgba(40,28,10,1)', {alpha: m.a * .22, lw: .6, T: 220}); rosette(g, m.x, m.y, r, m.sp, m.ink, {alpha: m.a, lw: .5, T: 220}); if (m.miss) kintsugiOn(g, m.x, m.y, r, m.seed); if (m.hitOk) makiOn(g, m.x, m.y, r, m.seed); };
    if (!animate) { marks.forEach(stamp); return; }
    let i = 0; const t0 = performance.now();
    const step = now => { if (run !== PLATE_RUN) return; const upto = Math.min(marks.length, Math.floor((now - t0) / 30) + 1); while (i < upto) stamp(marks[i++]); if (i < marks.length) requestAnimationFrame(step); };
    requestAnimationFrame(step);
  }, H0);
  const date = kday(R0.target);
  $('#plateLead').textContent = actual ? `${date} 종가로 다시 찍었습니다. 붉은 잉크는 오른 종목, 푸른 잉크는 내린 종목입니다. ATLAS가 맞힌 무늬에는 금가루, 틀린 무늬에는 금 이음을 남겼습니다.` : '가로는 지난 1주 실제로 오르내린 비율, 세로는 ATLAS가 본 쪽입니다. 무늬 하나가 종목 하나입니다.';
  $('#axTop').textContent = '↑ ATLAS 오를 쪽'; $('#axBottom').textContent = '↓ ATLAS 내릴 쪽';
  $('#axX').replaceChildren(h('span', null, '← 지난 1주 내림'), h('span', null, '지난 1주 오름 →'));
  const qlab = k => `${QUADS[k].name} ${cnt[k]}종목` + (actual ? ` · 맞힘 ${hit[k]}개 / ${dec[k]}개` : '');
  $('#qTop').replaceChildren(h('span', null, '↖ ' + qlab('rev-up')), h('span', null, qlab('cont-up') + ' ↗'));
  $('#qBottom').replaceChildren(h('span', null, '↙ ' + qlab('cont-down')), h('span', null, qlab('turn-down') + ' ↘'));
  cv.setAttribute('aria-label', actual ? `${date} 판화: 오른 종목 ${up}개, 내린 종목 ${down}개, 보합 ${flat}개, ATLAS가 맞힌 무늬 ${hits}개 / ${decided}개` : `${date} ATLAS 판화: 오를 쪽 ${up}종목, 내릴 쪽 ${down}종목`);
  $('#plateLabel').replaceChildren(
    h('h3', null, actual ? `「${date}」 · 종가로 다시 찍은 판화` : `「${date}」 · ATLAS의 밑그림`),
    h('div', {class: 'q4'}, ...['rev-up', 'cont-up', 'cont-down', 'turn-down'].map(k => h('p', null, h('b', null, QUADS[k].name), ` ${cnt[k]}종목 — ${QUADS[k].says}`))),
    actual ? h('p', null, `ATLAS가 방향을 맞힌 무늬 ${hits}개 / ${decided}개 · 오른 ${up}종목 · 내린 ${down}종목 · 보합 ${flat}종목`) : h('p', null, `오를 쪽 ${up}종목 · 내릴 쪽 ${down}종목 · 확률이 높을수록 잉크가 짙습니다`),
    h('p', null, '무늬는 종목 번호 · 지난 1주 흔들림 · 오른 날 수로 새겼습니다(종목마다 하나뿐) · 무늬를 누르면 그 카드가 열립니다'),
    h('p', null, '눈금은 크기 순서를 지키되 가운데를 넓혀 그렸습니다(제곱근 눈금)'),
    h('p', null, actual ? `판화 1장 · 무늬 52개 · ${kday(R0.target)} 종가로 다시 찍음` : `판화 1장 · 무늬 52개 · ${kday(R0.actualAsOf)} 종가로 찍음`));
}
function onPlateClick(e) {
  const rect = $('#plateCv').getBoundingClientRect(), x = e.clientX - rect.left, y = e.clientY - rect.top;
  let best = null, bd = Infinity; for (const p of PLATE_PTS) { const d = Math.hypot(p.x - x, p.y - y); if (d < bd) { bd = d; best = p; } }
  if (!best || bd > best.r * 1.5) return;
  openCard(best.code);
}
function openCard(code) {
  const c = R().by[code]; if (!c) return;
  if (!filtered().some(x => x.code === code)) S.quad = sideOfCard(c); // 고른 카드가 지금 묶음에 없으면 그 카드의 쪽으로
  S.idx = list().findIndex(x => x.code === code); S.dealt = code; render();
  $('#ch3').scrollIntoView({behavior: reduceMotion() ? 'auto' : 'smooth', block: 'start'});
}

/* ───────── III 카드 ───────── */
/* 묶음: 전체 · 오를 쪽(이어 오름 + 돌아 오름) · 내릴 쪽(꺾여 내림 + 이어 내림) · 네 갈래 하나 — 사이트 첫 화면의 두 문과 같은 나누기(ATLAS가 본 쪽) */
const sideOfCard = c => c.quad === 'cont-up' || c.quad === 'rev-up' ? 'up' : 'down';
const SIDE_NAME = {all: '전체', up: '오를 쪽', down: '내릴 쪽'};
const filtered = () => { const d = R().deck; return S.quad === 'all' ? d : S.quad === 'up' || S.quad === 'down' ? d.filter(c => sideOfCard(c) === S.quad) : d.filter(c => c.quad === S.quad); };
const list = () => { const f = filtered(); return f.length ? f : R().deck; }; // 빈 묶음이면 전체(카드가 없는 화면을 만들지 않음)
const filterName = () => filtered().length ? (SIDE_NAME[S.quad] ?? QUADS[S.quad]?.name ?? '전체') : '전체';
function renderQuads() {
  const R0 = R(), cnt = {}, side = {up: 0, down: 0}; for (const c of R0.deck) { cnt[c.quad] = (cnt[c.quad] ?? 0) + 1; side[sideOfCard(c)]++; }
  const btn = (key, label, n, cls, title) => h('button', {type: 'button', class: cls, 'aria-pressed': String(S.quad === key), disabled: !n, title, onclick: () => { S.quad = key; S.idx = 0; render(); }}, label, h('b', null, `${n ?? 0}장`));
  const group = (k, label, quads) => h('div', {class: 'side-g ' + k}, btn(k, label, side[k], 'side-b ' + k, k === 'up' ? 'ATLAS가 오를 쪽으로 본 카드' : 'ATLAS가 내릴 쪽으로 본 카드'),
    h('div', {class: 'subs'}, ...quads.map(q => btn(q, QUADS[q].name, cnt[q], 'sub', QUADS[q].says))));
  $('#quads').replaceChildren(group('up', '▲ 오를 쪽', ['cont-up', 'rev-up']), group('down', '▼ 내릴 쪽', ['turn-down', 'cont-down']), btn('all', '전체', R0.deck.length, 'all-b', `${R0.deck.length}장 모두`));
}
/** 일정·공시 한 줄(사이트와 같은 표 agenda.json) — 가장 중요한 것 하나 · 같으면 가까운 날 / 최근 */
const STARS = {3: '★★★', 2: '★★', 1: '★'};
function agendaLines(code) {
  const a = AGENDA?.byCode?.[code];
  if (!a) return [h('li', null, h('span', null, '일정'), h('span', null, AGENDA ? '확인된 일정 없음' : '일정 표를 읽지 못함'))];
  const ev = [...(a.upcoming ?? [])].sort((x, y) => y.level - x.level || x.date.localeCompare(y.date))[0], ds = (a.disclosures ?? [])[0];
  return [h('li', null, h('span', null, '일정'), h('span', null, ev ? [h('b', {class: 'lv lv' + ev.level}, STARS[ev.level]), ` ${kday(ev.date)} ${ev.name}`] : '확인된 회사·업종 일정 없음')),
    h('li', null, h('span', null, '공시'), h('span', null, ds ? [h('b', {class: 'lv lv' + ds.level}, STARS[ds.level]), ` ${kday(ds.publishedAt.slice(0, 10))} ${ds.title}`] : `지난 ${a.disclosureDays ?? 30}일 공시 없음`))];
}
function bigCard(c) {
  const sd = SUITS[c.suit], R0 = R(), ab = atlasBets(R0, S.method).find(x => x.code === c.code), res = revealed() ? c.actual : null, pp = Math.round(c.p * 100);
  const fside = c.f.sel === 'up' ? '오를 쪽' : c.f.sel === 'down' ? '내릴 쪽' : '보합 쪽', road = c.road, st = road.streak;
  const wkUps = c.week.filter(w => w.ret > FLAT_BAND).length;
  const idx = () => h('div', {class: 'idx', 'aria-hidden': 'true'}, h('span', {class: 'g'}, sd.g), h('b', null, pp + '%'));
  const card = h('article', {class: `card ${c.suit}`, 'aria-label': `${c.name} 카드. ${sd.name}, ${sd.means}. ATLAS ${fside} ${pp}퍼센트.`, ...(S.round === 'live' ? {'data-forecast-date': R0.target} : {})},
    h('canvas', {class: 'ros', 'data-code': c.code, 'aria-hidden': 'true'}),
    h('div', {class: 'c-top'}, idx(), h('p', {class: 'ed'}, `${kday(R0.target)} 판`, h('br'), `52장 중 ${c.no}번째`)),
    h('div', {class: 'c-name'}, h('h3', null, c.name), h('p', null, `${c.sector} · `, h('span', {class: 'mono', 'data-ident': ''}, c.code), ` · ${kday(R0.actualAsOf)} 종가 ${c.close.toLocaleString('ko-KR')}원`)),
    h('div', {class: 'eye'}, h('p', {class: 'eye-h'}, h('span', null, `카지노의 눈 · 출목표 ${road.days}거래일`), h('b', {class: st.side ?? ''}, st.side ? `${st.len}일째 ${st.side === 'up' ? '오름' : '내림'} · ${pct(st.ret)}` : '줄 없음')), roadSvg(road), roadKey(road)),
    h('div', {class: 'eye'}, h('p', {class: 'eye-h'}, h('span', null, `주식의 눈 · 종가 ${c.c.length}거래일`), h('b', {class: road.total >= 0 ? 'up' : 'down'}, `${road.days}거래일 ${pct(road.total)}`)), sparkSvg(c.c, road.total)),
    h('ul', {class: 'why3'},
      h('li', null, h('span', null, '사실'), h('span', null, '지난 1주 ', h('span', {class: dirOf(c.weekRet)}, pct(c.weekRet)), ` · 오른 날 ${wkUps}일`)),
      h('li', null, h('span', null, 'ATLAS'), h('span', null, `${kday(R0.target)} `, h('span', {class: c.f.sel}, `${fside} ${pp}%`), c.f.close ? ' · 거의 반반' : '')),
      h('li', null, h('span', null, '기록'), h('span', null, c.hit && c.hit.n ? `이 종목 방향을 맞힌 비율 ${Math.round(c.hit.k / c.hit.n * 100)}% · ${c.hit.days}거래일 후향` : '후향 기록 없음')),
      ...agendaLines(c.code)),
    h('p', {class: 'abet'}, 'ATLAS 자동: ', h('b', null, ab && ab.amount ? `${ab.side === 'up' ? '레버리지' : '인버스'} ${wonS(ab.amount)}` : '쉼')),
    h('div', {class: 'c-bot'}, idx()),
    res ? h('div', {class: 'stamp ' + dirOf(res.ret)}, `실제 ${pct(res.ret, 2)}`, h('small', null, `${kday(R0.target)} 종가 ${res.close.toLocaleString('ko-KR')}원`)) : null,
    h('div', {class: 'holo', 'aria-hidden': 'true'}));
  let x0 = null;
  card.addEventListener('pointerdown', e => { x0 = e.clientX; });
  card.addEventListener('pointerup', e => { if (x0 == null) return; const dx = e.clientX - x0; x0 = null; if (Math.abs(dx) > 40) go(dx < 0 ? 1 : -1); });
  const wrap = h('div', {class: 'tilt' + (S.dealt === c.code && !reduceMotion() ? ' deal' : '')}, card);
  tiltify(wrap, card);
  return wrap;
}
/* 손(마우스)을 따라 카드가 기울고 빛의 띠가 흐른다(스위스 9차 지폐 · 파베르제 칠보) — 움직임 줄이기면 가만히 */
function tiltify(wrap, card) {
  if (reduceMotion()) return;
  let raf = 0, leaveT = 0;
  const set = (px, py, on) => { const st = wrap.style, d = Math.min(1, Math.hypot(px - .5, py - .5) * 2.2); st.setProperty('--ry', ((px - .5) * 14).toFixed(2) + 'deg'); st.setProperty('--rx', ((.5 - py) * 10).toFixed(2) + 'deg'); st.setProperty('--mx', (px * 100).toFixed(1) + '%'); st.setProperty('--my', (py * 100).toFixed(1) + '%'); st.setProperty('--holo', on ? (.16 + .45 * d).toFixed(2) : '0'); };
  wrap.addEventListener('pointermove', e => { const r = card.getBoundingClientRect(), px = Math.max(0, Math.min(1, (e.clientX - r.left) / r.width)), py = Math.max(0, Math.min(1, (e.clientY - r.top) / r.height)); clearTimeout(leaveT); wrap.classList.add('on'); cancelAnimationFrame(raf); raf = requestAnimationFrame(() => set(px, py, true)); });
  const leave = () => { cancelAnimationFrame(raf); set(.5, .5, false); leaveT = setTimeout(() => wrap.classList.remove('on'), 520); };
  wrap.addEventListener('pointerleave', leave); wrap.addEventListener('pointercancel', leave);
}
function renderCard() {
  const L = list(); S.idx = Math.max(0, Math.min(L.length - 1, S.idx));
  const c = L[S.idx], b = B();
  $('#bigBox').replaceChildren(bigCard(c)); S.dealt = null;
  $('#count').textContent = `${filterName()} ${L.length}장 중 ${S.idx + 1}번째`;
  const lock = lockedNow();
  for (const [id, side, label] of [['#putLev', 'lev', '레버리지'], ['#putInv', 'inv', '인버스']]) { const el = $(id); el.disabled = lock; el.setAttribute('aria-pressed', String(b[side] === c.code)); el.textContent = b[side] === c.code ? `${label}에 놓임` : `${label}에 놓기`; }
  $('#shoe').replaceChildren(...['up', 'down'].map(k => h('div', {class: 'shoe-row ' + k}, h('span', {class: 'shoe-lab'}, SIDE_NAME[k]), ...R().deck.filter(d => sideOfCard(d) === k).map(d => h('button', {class: (d.code === c.code ? 'on' : '') + (b.lev === d.code || b.inv === d.code ? ' mine' : ''), type: 'button', tabindex: '-1', onclick: () => openCard(d.code)})))));
}

/* ───────── IV 테이블 ───────── */
function miniFace(code, side) {
  const c = R().by[code], sd = SUITS[c.suit], res = revealed() && S.bets.practice.open[side === 'up' ? 'lev' : 'inv'] ? c.actual : null;
  const face = h('div', {class: `mini ${c.suit}`, ...(S.round === 'live' ? {'data-forecast-date': R().target} : {})}, h('span', {class: 'g', 'aria-hidden': 'true'}, sd.g), h('b', null, c.name), h('span', null, `ATLAS ${Math.round(c.p * 100)}%`));
  if (res) { const o = dirOf(res.ret), r = o === 'flat' ? 'push' : o === side ? 'win' : 'lose'; if (r === 'lose') face.append(kintsugiSvg()); face.append(h('div', {class: 'stamp ' + r}, resWord(r), h('small', null, pct(res.ret, 2)))); }
  return face;
}
function slotContent(side) {
  const b = B(), code = b[side], R0 = R();
  if (!code || !R0.by[code]) return null;
  const face = miniFace(code, side === 'lev' ? 'up' : 'down');
  if (S.round !== 'practice' || !b.locked) return face;
  const wrap = h('div', {class: 'peel' + (b.open[side] ? ' open' : '')}, face, h('div', {class: 'back', role: 'button', tabindex: '0', 'aria-label': `${side === 'lev' ? '레버리지' : '인버스'} 카드 젖혀 열기`}), h('div', {class: 'curl', 'aria-hidden': 'true'}));
  if (!b.open[side]) squeezable(wrap, side);
  return wrap;
}
/* 바카라 스퀴즈: 카드 뒷면을 아래에서 위로 밀어 올려 젖힌다 · 반을 넘기면 저절로 열린다 · 키보드는 Enter */
function squeezable(wrap, side) {
  const back = wrap.querySelector('.back'); let y0 = null, hgt = 1, pr = 0;
  const setP = v => { pr = v; wrap.style.setProperty('--peel', v.toFixed(1) + '%'); };
  back.addEventListener('pointerdown', e => { y0 = e.clientY; hgt = back.getBoundingClientRect().height || 1; wrap.classList.add('peeling'); try { back.setPointerCapture(e.pointerId); } catch { /* 없음 */ } e.preventDefault(); });
  back.addEventListener('pointermove', e => { if (y0 == null) return; setP(Math.max(0, Math.min(100, (y0 - e.clientY) / hgt * 100))); });
  const end = () => { if (y0 == null) return; y0 = null; wrap.classList.remove('peeling'); if (pr > 55) openSide(side); else setP(0); };
  back.addEventListener('pointerup', end); back.addEventListener('pointercancel', end);
  back.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openSide(side); } });
}
function openSide(side) {
  const b = S.bets.practice; if (!b.locked || b.open[side]) return;
  b.open[side] = true; tone('peel'); buzz(8);
  if (b.open.lev && b.open.inv) { b.revealed = true; S.plateAnimate = true; render(); const t = settlePractice().me.total; if (t > 0) tone('win'); if (voiceOn) speak(resultText()); $('#ch5').scrollIntoView({behavior: reduceMotion() ? 'auto' : 'smooth', block: 'start'}); }
  else render();
}
function renderTable() {
  const b = B(), lock = lockedNow();
  for (const side of ['lev', 'inv']) {
    const slot = $('#slot-' + side), content = slotContent(side);
    slot.classList.toggle('filled', Boolean(content)); slot.replaceChildren(content ?? '카드를 놓으세요');
    $('#chips-' + side).replaceChildren(...AMTS.map(a => h('button', {class: 'chip ' + AMT[a][1], type: 'button', 'aria-pressed': String(b[side + 'Amt'] === a), 'aria-label': `${side === 'lev' ? '레버리지' : '인버스'}에 ${won(a)}`, disabled: lock, onclick: () => { b[side + 'Amt'] = a; tone('chip'); buzz(6); if (S.round === 'live') saveP(); render(); }}, AMT[a][0])));
  }
  const both = Boolean(b.lev && b.inv && R().by[b.lev] && R().by[b.inv]), btn = $('#seal'), note = $('#sealNote'), mark = $('#sealMark');
  btn.classList.remove('ghost');
  if (S.round === 'practice') {
    if (b.revealed) { $('#sealText').textContent = '다시 하기'; btn.disabled = false; btn.classList.add('ghost'); note.textContent = ''; }
    else if (b.locked) { $('#sealText').textContent = '두 장 한 번에 열기'; btn.disabled = false; btn.classList.add('ghost'); note.textContent = '카드 뒷면을 손가락으로 아래에서 위로 밀어 올려 젖히세요. 반을 넘기면 열립니다.'; }
    else { $('#sealText').textContent = '낙관 찍고 걸기'; btn.disabled = !both; note.textContent = both ? `레버리지 ${won(b.levAmt)} · 인버스 ${won(b.invAmt)}` : '두 자리에 카드를 한 장씩 놓으면 낙관을 찍을 수 있습니다.'; }
  } else if (!liveOpen()) { $('#sealText').textContent = '마감'; btn.disabled = true; note.textContent = b.locked ? '낙관을 찍은 판은 15:30 종가가 올라온 뒤 정산됩니다.' : '이 판은 걸지 않았습니다.'; }
  else if (b.locked && both) { $('#sealText').textContent = '낙관 지우기'; btn.disabled = false; btn.classList.add('ghost'); note.textContent = `낙관을 찍었습니다(${kstTime(b.placedAt)}) · 레버리지 ${R().by[b.lev].name} ${won(b.levAmt)} · 인버스 ${R().by[b.inv].name} ${won(b.invAmt)} · ${LOCK}까지 지우고 바꿀 수 있습니다`; }
  else { $('#sealText').textContent = '낙관 찍고 걸기'; btn.disabled = !both || b.levAmt + b.invAmt > P.purse; note.textContent = !both ? '두 자리에 카드를 한 장씩 놓으면 낙관을 찍을 수 있습니다.' : b.levAmt + b.invAmt > P.purse ? `내 돈(${wonS(P.purse)})보다 더 걸 수 없습니다.` : `레버리지 ${won(b.levAmt)} · 인버스 ${won(b.invAmt)} · 하루 한 번`; }
  const sealed = b.locked && both;
  if (sealed && !mark.querySelector('svg')) mark.replaceChildren(sealSvg('하루한번'));
  if (!sealed) mark.replaceChildren('낙관', h('br'), '자리');
  mark.classList.toggle('on', sealed);
  if (S.sealAnim && sealed) { mark.classList.remove('stamp-in'); void mark.offsetWidth; mark.classList.add('stamp-in'); }
  S.sealAnim = false;
}
function onSeal() {
  const b = B();
  if (S.round === 'practice') {
    if (b.revealed) { S.bets.practice = fresh(); render(); return; }
    if (b.locked) { b.open.lev = true; b.open.inv = false; openSide('inv'); return; }
    if (!(b.lev && b.inv)) return;
    b.locked = true; b.placedAt = new Date().toISOString(); S.sealAnim = true; tone('seal'); buzz(14); render(); return;
  }
  if (!liveOpen()) return;
  if (!b.locked && b.levAmt + b.invAmt > P.purse) return;
  b.locked = !b.locked; b.placedAt = new Date().toISOString(); if (b.locked) { S.sealAnim = true; tone('seal'); buzz(14); }
  saveP(); render();
}

/* ───────── V 정산: 주권 모양 증서 · 시세 테이프 ───────── */
function certBorder(cv) {
  paintCanvas(cv, (g, w, H) => {
    g.strokeStyle = '#8a6a2c'; g.lineWidth = 1.2; g.strokeRect(6, 6, w - 12, H - 12); g.lineWidth = .6; g.strokeRect(24, 24, w - 48, H - 48);
    g.lineWidth = .5; g.globalAlpha = .55;
    for (let k = 0; k < 5; k++) { const ph = k * Math.PI / 5;
      const wave = (x0, y0, x1, y1) => { const len = Math.hypot(x1 - x0, y1 - y0), ux = (x1 - x0) / len, uy = (y1 - y0) / len; g.beginPath(); for (let t = 0; t <= len; t += 2) { const a = 5 * Math.sin(t / 9 + ph) + 2 * Math.sin(t / 3.5 - ph * 2); const x = x0 + ux * t - uy * a, y = y0 + uy * t + ux * a; if (t) g.lineTo(x, y); else g.moveTo(x, y); } g.stroke(); };
      wave(15, 15, w - 15, 15); wave(15, H - 15, w - 15, H - 15); wave(15, 15, 15, H - 15); wave(w - 15, 15, w - 15, H - 15); }
    g.globalAlpha = 1;
    for (const [x, y] of [[15, 15], [w - 15, 15], [15, H - 15], [w - 15, H - 15]]) { g.fillStyle = '#f6efe3'; g.beginPath(); g.arc(x, y, 12, 0, Math.PI * 2); g.fill(); rosette(g, x, y, 11, {m: 12, n: 3, m2: 7, n2: 2, L: 9, amp: 1, dir: 1}, '#8a6a2c', {alpha: .8, lw: .45, T: 200}); }
    rosette(g, w / 2, 62, 34, {m: 16, n: 4, m2: 8, n2: 3, L: 12, amp: 1.1, dir: 1}, 'rgba(138,106,44,.5)', {alpha: .5, lw: .5, T: 420});
  });
}
function renderResult() {
  const box = $('#result'), R0 = R(), b = B(); box.replaceChildren();
  if (S.round === 'practice') {
    if (!b.revealed) { box.append(h('p', {class: 'wait'}, `카드 두 장을 놓고 낙관을 찍은 뒤 카드를 젖히면, ${kday(R0.target)} 종가로 바로 정산하고 증서를 발행합니다.`)); return; }
    const r = settlePractice(), diff = r.me.total - r.at.total, serial = `AG-${R0.target.replace(/-/g, '').slice(2)}-${b.lev.slice(-3)}${b.inv.slice(-3)}`;
    const row = x => h('div', {class: 'cert-row'}, h('span', {class: x.side === 'up' ? 'lev' : 'inv'}, x.side === 'up' ? '레버리지' : '인버스'), h('span', null, `${x.name} · 실제 ${pct(x.ret, 2)} · ${resWord(x.result)}`), h('span', {class: 'n'}, won(x.pnl, true)));
    const cert = h('section', {class: 'cert pop', 'aria-live': 'polite'}, h('canvas', {class: 'border', 'aria-hidden': 'true'}),
      h('div', {class: 'cert-h'}, h('small', null, 'ATLAS GAME · 정산 증서'), h('h3', null, '정산 증서'), h('p', null, `${kday(R0.target)} 판 · 전날 종가에서 ${kday(R0.target)} 15:30 종가까지`)),
      h('div', {class: 'cert-rows'}, row(r.me.lev), row(r.me.inv), h('div', {class: 'cert-row sum'}, h('span', null, '합계'), h('span', null, '내 두 자리'), h('span', {class: 'n'}, won(r.me.total, true)))),
      h('div', {class: 'cert-vs'}, h('div', null, h('p', null, '나 · 3억 원에서'), h('b', null, won(r.me.total, true))), h('div', null, h('p', null, `ATLAS · 52장 · ${SYSTEMS[S.method].name}`), h('b', null, wonS(r.at.total, true)), h('p', null, `맞힘 ${r.at.win}장 · 틀림 ${r.at.lose}장 · 보합 ${r.at.push}장`))),
      h('p', {class: 'cert-verdict'}, diff > 0 ? `내가 ATLAS보다 ${wonS(diff)} 더 벌었습니다` : diff < 0 ? `ATLAS가 나보다 ${wonS(-diff)} 더 벌었습니다` : '나와 ATLAS가 똑같이 벌었습니다'),
      h('div', {class: 'cert-foot'}, h('div', null, h('p', null, '증서 번호 ', h('span', {class: 'mono', 'data-ident': ''}, serial)), h('p', {class: 'sig'}, 'ATLAS 게임 정산소 · 게임 돈')), h('div', {class: 'cert-seal'}, sealSvg('아틀라스'))));
    box.append(cert, h('button', {class: 'again', type: 'button', onclick: () => { S.bets.practice = fresh(); render(); $('#ch3').scrollIntoView({behavior: reduceMotion() ? 'auto' : 'smooth', block: 'start'}); }}, '다시 하기'));
    requestAnimationFrame(() => certBorder(cert.querySelector('canvas.border')));
    return;
  }
  const both = b.lev && b.inv && R0.by[b.lev] && R0.by[b.inv];
  box.append(h('p', {class: 'wait'}, b.locked && both ? `낙관을 찍었습니다 · 레버리지 ${R0.by[b.lev].name} · 인버스 ${R0.by[b.inv].name} · ${kday(R0.target)} 15:30 종가가 사이트에 올라오면 정산해 내 돈에 더합니다.` : liveOpen() ? `${kday(R0.target)} ${LOCK} 전에 낙관을 찍어야 이 판에 들어갑니다 · 하루 한 번입니다.` : `${kday(R0.target)} 판은 걸지 않았습니다 · 연습 판에서 정산을 해 볼 수 있습니다.`));
  if (P.history.length) box.append(h('section', {class: 'tape', 'aria-label': '내 지난 판'}, h('h3', null, '내 지난 판 · 시세 테이프'),
    ...P.history.slice(-5).reverse().map(x => h('p', {class: S.fresh.includes(x.target) ? 'new' : ''}, `${kday(x.target)} · 레버리지 ${nameOf(x.lev)} ${resWord(x.levRes)} · 인버스 ${nameOf(x.inv)} ${resWord(x.invRes)} · `, h('b', null, wonS(x.pnl, true)), ` → 내 돈 ${wonS(x.purseAfter)}`))));
}
function resultText() {
  if (!revealed()) return '';
  const r = settlePractice();
  return `${kday(ROUNDS.practice.target)} 종가로 정산했습니다. 레버리지 ${r.me.lev.name}, ${resWord(r.me.lev.result)}. 인버스 ${r.me.inv.name}, ${resWord(r.me.inv.result)}. 나는 ${won(r.me.total, true)}, ATLAS는 ${wonS(r.at.total, true)}.`;
}

/* ───────── VI ATLAS: 가운데(이정훈 대표 방식) · 보조 다섯 · 식 · 기록 ───────── */
function formulaOf(m) {
  const R0 = R(), pooled = R0.key === 'live' ? runOf('real', m).pooled : POOLED.practice;
  if (m === 'kelly') { const {p, f} = kellyFraction(pooled); return [`맞힌 비율 = (맞힘 ${pooled.win.toLocaleString('ko-KR')}번 + 50번) ÷ (맞힘 ${pooled.win.toLocaleString('ko-KR')}번 + 틀림 ${pooled.lose.toLocaleString('ko-KR')}번 + 100번) = ${(p * 100).toFixed(1)}%`, `걸 비율 = (2 × ${(p * 100).toFixed(1)}% − 100%)의 절반 = ${(f * 100).toFixed(2)}%`, `카드마다 = 1억 원 × ${(f * 100).toFixed(2)}% = ${won(Math.floor(1e8 * f))}`]; }
  if (m === 'elder2') return ['걸 돈 = 가진 돈 × 2%', '카드마다 = 1억 원 × 2% = 200만 원', '가진 돈이 줄면 걸 돈도 같이 줄어듭니다'];
  if (m === 'flat') return ['걸 돈 = 늘 1천만 원', '이겨도 져도 같은 돈', '그레이엄: 같은 돈을 정해진 때마다'];
  if (m === 'martingale') return ['1천만 원 → 지면 2천만 원 → 4천만 원 → 8천만 원', '이기면 다시 1천만 원', '카드마다 1억 원이라 네 번 내리 지면 그 카드는 0원'];
  if (m === 'paroli') return ['1천만 원 → 이기면 2천만 원 → 4천만 원', '세 번 내리 이기거나 지면 다시 1천만 원', '이긴 돈만 다시 거는 「불리기」'];
  return [SYSTEMS[m].note];
}
function chartSvg(curve, cmp) {
  const vals = [52e8, ...curve.map(x => x.total), ...(cmp ? cmp.map(x => x.total) : [])], lo = Math.min(...vals), hi = Math.max(...vals), pad = (hi - lo) * .08 || 1e8;
  const y = v => 150 - (v - (lo - pad)) / ((hi + pad) - (lo - pad)) * 140, x = i => i / curve.length * 320;
  const path = cv => [[0, y(52e8)], ...cv.map((p, i) => [x(i + 1), y(p.total)])].map((p, i) => (i ? 'L' : 'M') + p[0].toFixed(1) + ' ' + p[1].toFixed(1)).join(' ');
  const main = path(curve), end = [x(curve.length), y(curve.at(-1).total)];
  return s('svg', {viewBox: '0 0 320 160', preserveAspectRatio: 'none', role: 'img', 'aria-label': `ATLAS 돈의 흐름: 52억 원에서 ${wonS(curve.at(-1).total)}으로`},
    s('path', {d: main + ` L ${end[0].toFixed(1)} 152 L 0 152 Z`, fill: 'rgba(210,178,109,.13)'}),
    s('line', {x1: 0, x2: 320, y1: y(52e8).toFixed(1), y2: y(52e8).toFixed(1), stroke: 'rgba(244,237,224,.35)', 'stroke-dasharray': '2 4', 'vector-effect': 'non-scaling-stroke'}),
    cmp ? s('path', {d: path(cmp), fill: 'none', stroke: '#bdb2a0', 'stroke-width': 1.4, 'stroke-dasharray': '5 4', 'vector-effect': 'non-scaling-stroke'}) : null,
    s('path', {d: main, fill: 'none', stroke: '#f1d99c', 'stroke-width': 2.2, 'vector-effect': 'non-scaling-stroke'}),
    s('circle', {cx: end[0].toFixed(1), cy: end[1].toFixed(1), r: 4, fill: '#f1d99c'}));
}
function renderAtlas() {
  const R0 = R(), m = S.method, sys = SYSTEMS[m], lee = SYSTEMS[CENTER];
  $('#center').replaceChildren(h('p', {class: 'tag'}, '가 운 데'), h('h3', null, lee.name), h('p', {class: 'who'}, lee.who),
    h('p', {class: 'state'}, lee.ready ? '켜짐' : '원문 기다림 · 원문이 오면 이 자리에서 켭니다'),
    h('p', {class: 'now'}, lee.ready ? '' : `원문이 오기 전까지 ATLAS는 보조 다섯 가운데 「${sys.name}」으로 겁니다.`),
    h('p', {class: 'now'}, lee.ready ? '' : '인터넷에 공개된 원문이 없어 지어 넣지 않았습니다(2026년 10월 2일(금) 06:20 찾아봄).'),
    h('div', {class: 'pedestal', 'aria-hidden': 'true'}));
  $('#aux').replaceChildren(...AUX.map(k => h('button', {type: 'button', 'aria-pressed': String(m === k), onclick: () => { S.method = k; P.method = k; saveP(); render(); }}, h('b', null, SYSTEMS[k].name), h('span', null, SYSTEMS[k].who))));
  $('#formula').replaceChildren(h('p', null, `「${sys.name}」 — ${sys.note}`), ...formulaOf(m).map(t => h('p', {class: 'eq'}, t)));
  const bets = atlasBets(R0, m), lev = bets.filter(x => x.side === 'up' && x.amount).length, inv = bets.filter(x => x.side === 'down' && x.amount).length, staked = bets.reduce((a, x) => a + x.amount, 0);
  $('#today').replaceChildren(h('div', null, h('p', null, '레버리지'), h('b', null, `${lev}장`)), h('div', null, h('p', null, '인버스'), h('b', null, `${inv}장`)), h('div', null, h('p', null, `${kday(R0.target)} 건 돈`), h('b', null, wonS(staked))));
  const plan = PLAN[S.round];
  if (!plan.dates.length) { $('#recTitle').textContent = '후향 기록'; $('#chart').replaceChildren(h('p', {class: 'note'}, '후향 기록 자료가 없습니다.')); $('#beads').replaceChildren(); $('#facts').replaceChildren(); }
  else {
    const run = runOf(S.round, m), cmp = m === 'flat' ? null : runOf(S.round, 'flat');
    $('#recTitle').textContent = `이 베팅법으로 지난 ${plan.dates.length}거래일 — 후향 · 실제 종가로 다시 셈`;
    $('#chart').replaceChildren(chartSvg(run.curve, cmp?.curve), h('div', {class: 'ax'}, h('span', null, kday(plan.dates[0])), h('span', null, kday(plan.dates.at(-1)))),
      h('div', {class: 'key'}, h('span', null, h('i'), sys.name), cmp ? h('span', null, h('i', {class: 'dash'}), '비교: 정액 분할') : null, h('span', null, '점선 가로줄 = 52억 원')));
    const w = run.curve.filter(x => x.pnl > 0).length, l = run.curve.filter(x => x.pnl < 0).length, p0 = run.curve.length - w - l;
    $('#beads').replaceChildren(h('p', null, `ATLAS 구슬판 · 번 날 ${w}일(붉은 구슬) · 잃은 날 ${l}일(푸른 구슬) · 쉬거나 비긴 날 ${p0}일(옥색 구슬)`), h('div', {class: 'grid', role: 'img', 'aria-label': `번 날 ${w}일, 잃은 날 ${l}일`}, ...run.curve.map(x => h('i', {class: x.pnl > 0 ? 'w' : x.pnl < 0 ? 'l' : 'p'}))));
    $('#facts').replaceChildren(h('div', null, h('p', null, '끝에 남은 돈'), h('b', null, wonS(run.end))), h('div', null, h('p', null, '처음보다'), h('b', null, pct(run.ret, 1))), h('div', null, h('p', null, '0원이 된 카드'), h('b', null, `${run.busted}장`)));
  }
  const real = runOf('real', m);
  $('#realNote').textContent = D.settled.length ? `게임 시작(${kday(D.gameStart)}) 뒤 실제 판 ${D.settled.length}번 · 이 베팅법으로 ATLAS 돈 ${wonS(real.end)}` : `실제 판의 셈은 ${kday(D.gameStart)} 15:30 종가가 사이트에 올라오면 시작합니다 · ATLAS 돈 ${wonS(real.end)}`;
}

/* ───────── VII 만든 생각(한 번만 그림) ───────── */
function renderWhy() {
  const body = $('#whyBody'); let n = 1, k = 1;
  body.replaceChildren(
    h('h3', null, '배워서 넣은 방식 36가지'),
    ...METHODS.flatMap(([g, list]) => { const ol = h('ol', {start: String(n)}, list.map(([a, b, c]) => h('li', null, h('b', null, a), ` — ${b} → ${c}`))); n += list.length; return [h('p', {class: 'grp'}, g), ol]; }),
    h('h3', null, '하루 한 번 · 08:00 마감의 근거'),
    h('ol', null,
      h('li', null, h('b', null, '바버 · 오딘(2000)'), ' — 미국 6만 6,465가구(1991~1996년)에서 가장 자주 거래한 가구는 한 해 11.4%, 시장은 17.9%'),
      h('li', null, h('b', null, '넥스트레이드 · 한국거래소'), ' — 장전 거래 08:00~08:50, 거래소 시가 동시호가 08:30~09:00 · 그 전에 걸어야 ATLAS와 같은 조건'),
      h('li', null, h('b', null, '페롤드(1988)'), ' — 종이 위 수익과 실제 수익 사이의 틈(실행 부족분)'),
      h('li', null, h('b', null, '루 · 포크 · 스쿠라스(2019)'), ' — 수익의 일부는 밤사이(전날 종가 → 시가)에 난다 · ATLAS의 몫이 밤사이인지 낮인지는 시가 자료가 생기면 잰다')),
    h('h3', null, '가설 여덟'), h('ol', null, HYP.map(([a, b]) => h('li', null, h('b', null, a), ' — ', b))),
    h('h3', null, '잡스라면 · 열한 번 생각'), h('ol', null, JOBS.map(([a, b, c]) => h('li', null, h('b', null, a), ' — ', b, ` (${c})`))),
    h('h3', null, '참고한 180곳'),
    ...REFS.flatMap(([g, list]) => { const ol = h('ol', {start: String(k)}, list.map(([a, b]) => h('li', null, h('b', null, a), ` — ${b}`))); k += list.length; return [h('p', {class: 'grp'}, g), ol]; }));
}

/* ───────── 그리기 ───────── */
function render() {
  renderHead(); renderRule(); renderQuads(); renderCard(); renderTable(); renderResult(); renderAtlas();
  requestAnimationFrame(() => { renderPlate(); drawRosettes($('#bigBox')); });
}
function go(step) { const n = list().length; S.idx = (S.idx + step + n) % n; S.dealt = list()[S.idx].code; tone('flip'); render(); }
function put(side) {
  const b = B(), code = list()[S.idx].code, other = side === 'lev' ? 'inv' : 'lev';
  if (lockedNow()) return;
  if (b[other] === code) b[other] = null; // 같은 카드를 두 자리에 놓지 않는다
  b[side] = b[side] === code ? null : code;
  tone('chip'); buzz(6);
  if (S.round === 'live') saveP();
  render();
}
function screenText() {
  const R0 = R(), b = B(), cnt = {}; for (const c of R0.deck) cnt[c.quad] = (cnt[c.quad] ?? 0) + 1;
  const t = [`아틀라스 게임. ${R0.title}, ${kday(R0.target)}.`, `내 돈 ${wonS(P.purse)}, ATLAS ${wonS(runOf('real', S.method).end)}.`, `오를 쪽 ${R0.deck.filter(c => sideOfCard(c) === 'up').length}장, 내릴 쪽 ${R0.deck.filter(c => sideOfCard(c) === 'down').length}장.`, ...Object.keys(QUADS).map(k => `${QUADS[k].name} ${cnt[k] ?? 0}장.`),
    `레버리지 자리 ${b.lev && R0.by[b.lev] ? R0.by[b.lev].name + ' ' + won(b.levAmt) : '비어 있음'}. 인버스 자리 ${b.inv && R0.by[b.inv] ? R0.by[b.inv].name + ' ' + won(b.invAmt) : '비어 있음'}.`];
  const rt = resultText(); if (rt) t.push(rt);
  return t.join(' ');
}
async function start() {
  try {
    const r = await fetch('../data/atlas11/view/game.json', {cache: 'no-cache'});
    if (!r.ok) throw Error(`게임 자료를 받지 못했습니다(${r.status})`);
    D = await r.json();
    // 일정·공시 표(없어도 게임은 돈다)
    try { const ra = await fetch('../data/atlas11/view/agenda.json', {cache: 'no-cache'}); if (ra.ok) AGENDA = await ra.json(); } catch { AGENDA = null; }
  } catch (e) { $('#loading').replaceWith(h('p', {class: 'err'}, `게임 자료를 열지 못했습니다. ${e.message}`)); return; }
  ROUNDS = {live: prep(D.live, 'live')};
  if (D.practice && D.practice.stocks.every(x => x.actual)) ROUNDS.practice = prep(D.practice, 'practice');
  PLAN = {live: histPlan(ROUNDS.live.target), practice: ROUNDS.practice ? histPlan(ROUNDS.practice.target) : {dates: [], stocks: []}};
  PLAN.real = realPlan();
  POOLED = {practice: pooledOf(PLAN.practice), beforeStart: pooledOf(histPlan(D.gameStart))};
  settleSaved();
  $('#loading').remove(); $('#game').hidden = false;
  artOnce(); renderWhy();
  $('#src').replaceChildren(`자료: ATLAS 발행본(실전 판 = ${kday(D.live.actualAsOf)} 종가로 낸 판${D.practice ? `, 연습 판 = ${kday(D.practice.actualAsOf)} 종가로 낸 판` : ''}) · 출목표와 종가 선 = 한국거래소 15:30 종가`,
    ...(D.hist ? [' · ATLAS 기록과 맞힌 비율 = 후향(', h('span', {'data-ident': ''}, D.hist.method), `, ${kday(D.hist.dates[0])}~${kday(D.hist.dates.at(-1))})`] : []),
    ' · ATLAS 확률은 아직 보정하지 않은 모형 빈도입니다 · 무늬의 「거의 반반」 = 1위와 2위 확률 차이가 작거나 통계적으로 못 가르는 경우 · 게임 돈이며 실제 거래와 관계없습니다 · 투자 조언이 아닙니다.');
  $('#tab-live').addEventListener('click', () => { S.round = 'live'; S.idx = 0; S.quad = 'up'; render(); });
  $('#tab-practice').addEventListener('click', () => { if (!ROUNDS.practice) return; S.round = 'practice'; S.idx = 0; S.quad = 'up'; render(); });
  $('#prev').addEventListener('click', () => go(-1));
  $('#next').addEventListener('click', () => go(1));
  $('#putLev').addEventListener('click', () => put('lev'));
  $('#putInv').addEventListener('click', () => put('inv'));
  $('#seal').addEventListener('click', onSeal);
  $('#plateCv').addEventListener('click', onPlateClick);
  $('#fontBtn').addEventListener('click', () => { try { localStorage.setItem('atlas11:font', JSON.stringify((fontStep() + 1) % FONT_STEPS.length)); } catch { /* 저장이 막힌 기기 */ } applyFont(); render(); });
  $('#voiceBtn').addEventListener('click', e => { voiceOn = !voiceOn; e.currentTarget.setAttribute('aria-pressed', String(voiceOn)); if (voiceOn) speak(screenText()); else try { speechSynthesis.cancel(); } catch { /* 없음 */ } });
  document.addEventListener('keydown', e => { if (e.target.closest('input, textarea')) return; if (e.key === 'ArrowRight') go(1); if (e.key === 'ArrowLeft') go(-1); });
  render();
  setInterval(() => { if (S.round === 'live') renderHead(); }, 30000);
  let rz = 0; window.addEventListener('resize', () => { clearTimeout(rz); rz = setTimeout(render, 200); });
}
start();
