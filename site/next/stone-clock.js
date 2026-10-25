/* 돌 시계 — 첫 화면 오른쪽 위 돌 그림의 바늘판이 지금 시각을 가리킴(사장님 2026-10-21(서울) 21:21 「시계있는거 현재신ㅇ로 해놓아」)
   그림 = /media/stone/home-clock.svg(home.svg 에서 계기 바늘 · 노란 끝 · 「0」을 빼고 눈금을 시계 눈금 60개로 — 돌 · 그림자는 그 파일 안에만)
   바늘 = 그 위에 겹친 평평한 SVG(시침 · 분침 — 분침 끝은 옛 바늘처럼 노란 끝 · 초침은 가는 노란 선) · 그림자 · 광택 없음(화면 잣대)
   시각 = 이 기기의 시각(new Date) · 1초마다 바늘만 돌림 · 창이 숨으면 쉼 · 움직임 줄이기면 초침 없이 1분마다
   글 속 꾸밈 없음(CSP) — 속성은 값으로만 · 크기와 자리는 stone.css(.s-clock) */
const NS = 'http://www.w3.org/2000/svg';
const faces = new Set();
let timer = 0;
const still = () => !!globalThis.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches;
function sv(tag, at, parent) {
  const e = document.createElementNS(NS, tag);
  for (const k in at) e.setAttribute(k, String(at[k]));
  if (parent) parent.appendChild(e);
  return e;
}
/** 바늘 — 판 가운데(75, 60 · 그림 안 돌 판과 같은 비틀림)를 축으로 */
function tick() {
  const d = new Date(), s = d.getSeconds(), m = d.getMinutes() + s / 60, h = (d.getHours() % 12) + m / 60;
  for (const f of faces) {
    if (!f.svg.isConnected && (f.on || Date.now() - f.born > 60000)) { faces.delete(f); continue; } // 떨어진 시계는 뺌(새로 만든 시계는 화면에 붙기 전에도 바늘을 맞춰 둠)
    if (f.svg.isConnected) f.on = true;
    f.h.setAttribute('transform', `rotate(${(h * 30).toFixed(2)} 75 60)`);
    f.m.setAttribute('transform', `rotate(${(m * 6).toFixed(2)} 75 60)`);
    f.s.setAttribute('transform', `rotate(${s * 6} 75 60)`);
    f.s.setAttribute('display', still() ? 'none' : 'inline');
  }
  if (!faces.size) stop();
}
function stop() { if (timer) clearInterval(timer); timer = 0; }
function start() { if (!timer && faces.size && !document.hidden) { tick(); timer = setInterval(tick, still() ? 15000 : 1000); } }
document.addEventListener('visibilitychange', () => { if (document.hidden) stop(); else start(); });

// 돌 그림 — 2026-10-25 돌 시계가 240px 로 커져 첫 화면 가장 큰 그림이 됨(사장님 22:54 「어 진짜 싸이트까지 바꿔」)
//   큰 SVG 를 그리는 데 느린 폰에서 0.3초쯤 더 걸려(check_white ③ 가장 큰 그림 2.5초 안 · 느린 4G) 같은 그림을 미리 찍은 WebP 세 크기로(1x · 2x · 3x — 폰 화면 촘촘함에 맞춰 하나만 받음)
//   원본 = /media/stone/home-clock.svg(그림을 고치면 세 장을 다시 찍음 · 240 × 192 칸) · next/index.html 여는 화면(.s-boot)이 같은 그림을 먼저 보임
const SRC = '/media/stone/home-clock-1x.webp', SET = '/media/stone/home-clock-1x.webp 1x, /media/stone/home-clock-2x.webp 2x, /media/stone/home-clock-3x.webp 3x';

/** 돌 그림이 풀릴 때까지(길어야 ms) 기다림 — 첫 화면이 돌 시계와 글을 한 번에 그리게(늦게 툭 나타남 0 · 가장 큰 그림 = 첫 그림) */
export const clockDecoded = (wrap, ms = 400) => Promise.race([wrap?.querySelector('img')?.decode?.().catch(() => {}) ?? Promise.resolve(), new Promise(r => setTimeout(r, ms))]);

/** 돌 시계 하나 — 감싼 칸(.s-art .s-clock) 안에 돌 그림과 바늘 그림을 겹쳐 돌려줌 */
export function stoneClock() {
  const wrap = document.createElement('span');
  wrap.className = 's-art s-clock';
  wrap.setAttribute('aria-hidden', 'true');
  const img = document.createElement('img');
  for (const [k, v] of Object.entries({src: SRC, srcset: SET, alt: '', width: 240, height: 192, decoding: 'async'})) img.setAttribute(k, String(v));
  const svg = sv('svg', {class: 's-hands', viewBox: '0 0 150 120', focusable: 'false'});
  const g = sv('g', {transform: 'matrix(.9564 .0003 -.0324 .9856 6.68 1.14)'}, svg); // 돌 그림 안 판의 비틀림 그대로
  const hG = sv('g', {}, g);
  sv('path', {d: 'M75 63L73.1 60.4L75 42Z', fill: '#5C5955'}, hG); sv('path', {d: 'M75 63L76.9 60.4L75 42Z', fill: '#2B2927'}, hG);
  const mG = sv('g', {}, g);
  sv('path', {d: 'M75 63.5L73.7 60.3L75 28.4Z', fill: '#5C5955'}, mG); sv('path', {d: 'M75 63.5L76.3 60.3L75 28.4Z', fill: '#2B2927'}, mG);
  sv('path', {d: 'M75 32.8V28.9', stroke: '#F9D21C', 'stroke-width': 1.5, 'stroke-linecap': 'round'}, mG);
  const sG = sv('g', {}, g);
  sv('path', {d: 'M75 66V27.2', stroke: '#F9D21C', 'stroke-width': 0.6, 'stroke-linecap': 'round'}, sG);
  sv('circle', {cx: 75, cy: 60, r: 2.5, fill: '#5C5955', stroke: '#2B2927', 'stroke-width': 0.45}, g);
  sv('circle', {cx: 75, cy: 60, r: 0.9, fill: '#2B2927'}, g);
  wrap.append(img, svg);
  faces.add({svg, h: hG, m: mG, s: sG, on: false, born: Date.now()});
  stop(); start(); // 바로 한 번 맞추고(붙기 전이라도 바늘 자리는 그려 둠) 1초마다
  requestAnimationFrame(tick); // 화면에 붙은 뒤 한 번 더
  return wrap;
}
