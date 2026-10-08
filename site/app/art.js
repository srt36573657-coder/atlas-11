/* ATLAS 11 · 그림 한 장 공통 틀 — 모든 화면 맨 위(규칙 33)
   사장님 2026-10-08 00:12 「글이 너무 많아 더 과감하게 움직이는 도식화를 예술적으로 만들어봐 예술적으로 말이야」(첫 화면 「돈의 이동」 청자 그림 · 규칙 32)
     → 01:27 「자 이런식으로 모두 첫페이지부터 마지막까지 다해 전나라 · 내가 명령하면 한부분 하고있어 절대 그러지 않는다 다 한다」
     → 01:31 「너 대충했던 모든 곳을 점검해서 더 정확히 해라 · 너 시스템으로 그짓 못하게 해」
   한 틀(artStage)을 모든 그림이 같이 쓴다 — 돈의 이동(rotation.js)도 이 틀:
   · 그림(SVG · 글자 없음 · 화면 읽기 프로그램은 아래 이름 · 숫자를 읽음) + 이름 · 숫자(HTML · 늘 또렷함 · 흐려졌다 나타나지 않음) + 차례 점 넷(기 · 승 · 전 · 결) + 다시 보기 · 소리로 듣기
   · 움직임은 한 번에 하나(규칙 28) — 걸음마다 data-at 이 같은 것 하나만 「now」 · 머무는 시간(ms)에서 0.15초 뺀 만큼만 움직임(--dur · 다음 걸음과 겹치지 않음)
   · 처음 그린 그림만 저절로 한 번(이 창에서 그림마다 한 번) · 화면 밖이면 멈춤 · 다른 그림이 움직이는 동안 기다림(motion.js)
   · 움직임 줄이기 설정이면 처음부터 끝 모습 · 오른쪽부터 쓰는 말은 그림을 뒤집음(style.css .ra-svg)
   · 그림 속 값(높이 · 길이 · 자리)은 data-v="k:.62;x0:-40px" → CSS 변수(--k · --x0)로 옮김(CSSOM · 글 속 style 속성 없음 · CSP) */
import {h, pct, finite} from './util.js';
import {castDefs, stageDefs, stage} from './cast.js'; // 배우(신사 · 숙녀) · 무대(2026-10-08 06:40 영화 · 10:34 사람으로)
import {pic} from './story.js';
import {t as tr, LOCALE, LANG} from './i18n.js';
import {hold, release, idleIn} from './motion.js';

/** 변화 한 개(소수 한 자리 · 아주 작으면 둘째 자리 — comment.js 와 같은 모양) */
export const p1 = v => pct(v, finite(v) && Math.abs(v) < 0.0005 ? 2 : 1);
/** 오름 · 내림 숫자(빨강 · 파랑) — 부호가 숫자 앞(오른쪽부터 쓰는 말에서도) */
export const chgEl = (v, cls = '') => h('b', {class: `rt-n ak-c${v > 0 ? ' up' : v < 0 ? ' down' : ''}${cls ? ' ' + cls : ''}`}, finite(v) ? p1(v) : '없음');
/** 붉은 낙관 — tag(작은 말) · word(큰 말) · at(찍히는 걸음) */
export const sealEl = (tag, word, at, cls = '') => h('p', {class: 'ra-seal' + (cls ? ' ' + cls : ''), 'data-at': String(at)}, tag ? h('span', {class: 'ra-st'}, tag) : null, tag ? ' ' : null, h('span', {class: 'ra-sw'}, word));
/** 회사 이름 — 이름 그대로(이름 속 숫자를 단위 없는 숫자로 세지 않음) */
export const coName = (name, cls = 'ra-n') => h('p', {class: cls}, h('span', {'data-ident': ''}, name));
/** 업종 · 갈래 이름 */
export const grName = (label, cls = 'ra-n') => h('p', {class: cls}, label);
const r1 = v => Math.round(v * 10) / 10;
export const f1 = v => (Number.isFinite(v) ? r1(v).toFixed(1) : '0');

/* ── 그림 공통 재료(무대 · 배우 · 금 · 보라 유리) — id 앞에 그림 이름을 붙여 한 화면에 그림이 둘이어도 겹치지 않게
   2026-10-08 06:40 「청자로 하지 말고」 — 청자 유약(glz · glz2) · 먹빛 산을 보라 · 분홍 무대 빛으로 바꿈(이름은 그대로 — 그림마다 같은 자리) ── */
export function defs(p) {
  return castDefs(p) + stageDefs(p) + `<defs>
<linearGradient id="${p}-glz" x1="0" x2="1" y1="0" y2="0"><stop offset="0" stop-color="#4A3C8C"/><stop offset=".3" stop-color="#C9BBFF"/><stop offset=".58" stop-color="#9C8BFF"/><stop offset="1" stop-color="#3E3278"/></linearGradient>
<linearGradient id="${p}-glz2" x1="0" x2="1" y1="0" y2="0"><stop offset="0" stop-color="#A84F70"/><stop offset=".3" stop-color="#FFD0E0"/><stop offset=".6" stop-color="#F49AB8"/><stop offset="1" stop-color="#8E3E5E"/></linearGradient>
<linearGradient id="${p}-gold" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stop-color="#FFE7AE"/><stop offset="1" stop-color="#D99A35"/></linearGradient>
<linearGradient id="${p}-red" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stop-color="#FF8A80"/><stop offset="1" stop-color="#B8423C"/></linearGradient>
<linearGradient id="${p}-blue" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stop-color="#5E86C8"/><stop offset="1" stop-color="#A8C8FF"/></linearGradient>
<linearGradient id="${p}-hill" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stop-color="#B9A8FF" stop-opacity=".16"/><stop offset="1" stop-color="#B9A8FF" stop-opacity=".02"/></linearGradient>
<linearGradient id="${p}-flame" x1="0" x2="0" y1="1" y2="0"><stop offset="0" stop-color="#FF6B45"/><stop offset=".55" stop-color="#FFAE5C"/><stop offset="1" stop-color="#FFE3A0" stop-opacity=".85"/></linearGradient>
<radialGradient id="${p}-halo"><stop offset="0" stop-color="#F4F1EA" stop-opacity=".42"/><stop offset="1" stop-color="#F4F1EA" stop-opacity="0"/></radialGradient>
<radialGradient id="${p}-sun"><stop offset="0" stop-color="#FF8A70" stop-opacity=".55"/><stop offset="1" stop-color="#FF8A70" stop-opacity="0"/></radialGradient>
<filter id="${p}-glow" x="-30%" y="-40%" width="160%" height="180%"><feGaussianBlur stdDeviation="2.2" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
</defs>`;
}
/** 무대 + 먼 보랏빛 언덕 두 겹(바탕 · 움직이지 않음) — 높이 H 그림의 아래쪽(06:40 청자 · 먹빛 산 대신 극장 무대) */
export const hills = (p, H, k = 1) => stage(p, H) + `<path d="M0,${H - 36 * k} C40,${H - 74 * k} 78,${H - 100 * k} 118,${H - 80 * k} C150,${H - 64 * k} 170,${H - 90 * k} 204,${H - 100 * k} C240,${H - 110 * k} 268,${H - 80 * k} 300,${H - 90 * k} C326,${H - 98 * k} 344,${H - 84 * k} 360,${H - 78 * k} L360,${H} L0,${H} Z" fill="url(#${p}-hill)"/>`
  + `<path d="M0,${H - 18 * k} C50,${H - 44 * k} 96,${H - 54 * k} 140,${H - 38 * k} C176,${H - 26 * k} 214,${H - 50 * k} 252,${H - 44 * k} C292,${H - 38 * k} 330,${H - 50 * k} 360,${H - 40 * k} L360,${H} L0,${H} Z" fill="url(#${p}-hill)"/>`;
/** 매병(폭 72 · 높이 99 · 입 가운데 36,0) — rotation.js 와 같은 모양 */
export const VASE = 'M29.7,0 L42.3,0 L41.4,7.2 C63,10.8 72,23.4 68.4,36 C64.8,55.8 55.8,77.4 52.2,90 L56.7,99 L15.3,99 L19.8,90 C16.2,77.4 7.2,55.8 3.6,36 C0,23.4 9,10.8 30.6,7.2 Z';
/** 항아리(폭 80 · 높이 84) */
export const JAR = 'M24,0 L56,0 L55,6 C74,12 82,30 80,48 C78,66 68,80 56,84 L24,84 C12,80 2,66 0,48 C-2,30 6,12 25,6 Z';
/** 별 다섯 끝(가운데 0,0 · 반지름 r) */
export const star = (r, ri = r * 0.45) => Array.from({length: 10}, (_, i) => { const a = -Math.PI / 2 + i * Math.PI / 5, rr = i % 2 ? ri : r; return `${(Math.cos(a) * rr).toFixed(2)},${(Math.sin(a) * rr).toFixed(2)}`; }).join(' ');

/* ── 재생기 ── */
const played = new Set(); // 저절로 한 번은 이 창에서 그 그림을 처음 그릴 때만
const calmNow = () => typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches;
/** 검사기만 쓰는 빠르기(atlas11:speed · 1~10 · 보통 1) — 움직임 검사를 빠르게 돌 때 걸음 시간만 나눔(CSS 움직임은 검사기가 같은 배로 빠르게 · 2026-10-08 06:42 「10배 빠르게」) */
const SPEED = (() => { try { const v = Number(JSON.parse(localStorage.getItem('atlas11:speed') ?? '1')); return v >= 1 && v <= 10 ? v : 1; } catch { return 1; } })();
/** data-v="k:.62;x0:-40px" → --k · --x0 */
function vars(root) {
  for (const el of root.querySelectorAll('[data-v]')) for (const kv of el.getAttribute('data-v').split(';')) { const i = kv.indexOf(':'); if (i > 0) el.style.setProperty('--' + kv.slice(0, i).trim(), kv.slice(i + 1).trim()); }
}
/**
 * 그림 한 장 + 이름 · 숫자 + 차례 점 넷 + 다시 보기 · 소리로 듣기
 * spec = {key(그림 이름 · 저절로 한 번 기억), svg(글 · 글자 없음), labels(HTML 요소), steps([{c: 기승전결 0~3, at: 움직이는 그림 번호, ms: 머무는 시간}]),
 *         says(기승전결 넷 — 한국어 낱말 묶음 · 그 말로 읽음), setup(art => …) · cls}
 */
export function artStage(spec) {
  const {key, svg, labels, steps, says = [[], [], [], []], setup = null, cls = ''} = spec;
  const fresh = !played.has(key); played.add(key);
  const art = h('div', {class: 'ra-art', html: svg}); // 자막 띠는 뺌(2026-10-08 10:34 마카오 시각 「로미오 줄리엣 그거 빼 해보니 엉망이다」) — 그림 · 이름 · 숫자만
  vars(art); if (setup) setup(art);
  const beats = h('ol', {class: 'ra-beats', 'aria-hidden': 'true'}, ...['기', '승', '전', '결'].map(x => h('li', null, h('span', {class: 'sy-chl', lang: 'ko', 'data-ident': ''}, x))));
  const box = h('div', {class: `ra ak-${key}${cls ? ' ' + cls : ''}`, 'data-scene': key, 'data-steps': String(steps.length), 'data-plan': steps.map(s => `${s.c}:${s.at}`).join(',')}, art, labels, // data-plan = 걸음마다 기승전결:그림 번호(검사기가 계산으로 봄)
    h('div', {class: 'ra-ctl'}, beats,
      h('button', {type: 'button', class: 'sy-btn', onclick: () => run(false)}, pic('re', 'sy-bi'), h('span', null, '다시 보기')),
      h('button', {type: 'button', class: 'sy-btn', onclick: () => run(true)}, pic('say', 'sy-bi'), h('span', null, '소리로 듣기'))));
  vars(box);
  const parts = [...box.querySelectorAll('[data-at]')], dots = [...beats.children];
  // 걸음마다 움직이는 시간(--dur) = 머무는 시간 − 0.15초(다음 걸음과 겹치지 않음 · 낙관은 CSS 0.5초 그대로)
  for (const s of steps) for (const el of parts) if (Number(el.dataset.at) === s.at && !el.classList.contains('ra-seal')) el.style.setProperty('--dur', `${Math.max(250, s.ms - 150)}ms`);
  let cur = -1, tick = 0, token = 0, voice = false, seen = true, waiting = null;
  function paint(i, again = false) {
    cur = i; const x = steps[i]; box.dataset.step = String(i); box.dataset.c = String(x.c); box.classList.remove('ra-done');
    for (const el of parts) { const k = Number(el.dataset.at); el.classList.toggle('on', k <= x.at); const now = k === x.at; if (now && again) { el.classList.remove('now'); void el.getBoundingClientRect(); } el.classList.toggle('now', now); }
    dots.forEach((d, k) => { d.classList.toggle('now', k === x.c); d.classList.toggle('on', k < x.c); });
  }
  function stop() { token++; clearTimeout(tick); waiting = null; if (voice) { try { window.speechSynthesis?.cancel(); } catch {} } voice = false; release(box); }
  function done() { stop(); if (cur !== steps.length - 1) paint(steps.length - 1); for (const el of parts) { el.classList.add('on'); el.classList.remove('now'); } dots.forEach(d => { d.classList.add('on'); d.classList.remove('now'); }); box.classList.add('ra-done'); }
  function say(c, then) {
    try { const ss = window.speechSynthesis; if (!ss || typeof SpeechSynthesisUtterance !== 'function') return false;
      const u = new SpeechSynthesisUtterance((says[c] ?? []).map(v => tr(v)).join('. ')); u.lang = LOCALE; u.rate = 0.9; u.pitch = 1; u.volume = 0.96;
      const v = ss.getVoices().find(z => z.lang && z.lang.startsWith(LANG)); if (v) u.voice = v; let fin = false; u.onend = u.onerror = () => { if (!fin) { fin = true; then(); } }; ss.speak(u); return true; } catch { return false; }
  }
  function run(withVoice) {
    stop(); const my = token; voice = withVoice; let i = 0, talking = false, after = null; hold(box);
    if (withVoice) { try { window.speechSynthesis?.cancel(); } catch {} }
    const next = () => {
      if (my !== token) return;
      if (!box.isConnected) { stop(); return; }
      if (i >= steps.length) { if (talking) { after = next; return; } done(); return; }
      if (!seen && !voice) { waiting = next; release(box); return; }
      const x = steps[i];
      if (voice && talking && (i === 0 || steps[i - 1].c !== x.c)) { after = next; return; }
      hold(box); paint(i++, true);
      if (voice && (i === 1 || steps[i - 2].c !== x.c)) talking = say(x.c, () => { talking = false; if (my === token && after) { const f = after; after = null; tick = setTimeout(f, 380 / SPEED); } });
      tick = setTimeout(next, x.ms / SPEED);
    };
    next();
  }
  if (typeof IntersectionObserver === 'function') new IntersectionObserver(es => { for (const e of es) { seen = e.isIntersecting; if (seen && waiting) { const w = waiting; waiting = null; tick = setTimeout(w, idleIn() + 60); } } }, {threshold: 0.35}).observe(art);
  // 저절로 한 번 — 그리는 순간부터 움직임 줄을 잡아 둠(아래 막대 · 띠가 그림보다 먼저 움직이지 않게 · 규칙 28) · 붙지 않았으면 놓음
  if (fresh && !calmNow()) { hold(box); paint(0); for (const el of parts) el.classList.remove('on', 'now'); dots.forEach(d => d.classList.remove('now', 'on')); setTimeout(() => { if (!box.isConnected) { release(box); return; } if (cur <= 0) run(false); }, 350 / SPEED); }
  else done();
  return box;
}

/** 그림 무대 — 맨 위 작은 이름표(kicker · when) · 큰 줄(title 조각) · 그림 · 그 아래(rest) */
export function artSection({key, label, kicker, when = null, title = null, stage, rest = [], cls = ''}) {
  return h('section', {class: `sy rt ak${cls ? ' ' + cls : ''}`, 'aria-label': label ?? kicker, 'data-art': key},
    h('p', {class: 'sy-k'}, h('span', null, kicker), when ? h('span', {class: 'sy-kw'}, when) : null),
    title ? h('p', {class: 'ra-t'}, ...title) : null,
    stage, ...rest);
}
