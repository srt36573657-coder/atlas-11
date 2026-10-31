/* 신 얼굴 듣기 — 얼굴(캐릭터 그림)을 누르면 그 신 이야기를 소리로(사장님 2026-10-31 10:58(+04) 「응」 — 물음 「신 얼굴을 누르면 그 신 이야기를 소리로 들려 드릴까요?」 · docs/design/roman72-site-2026-10-31/order-1558.txt)
   얼굴이 보이는 세 곳이 이 단추를 씀 — 로마 신 72 카드(p-roman.js) · 방 지킴이 이름표(roman-tag.js) · 말하는 불빛 지킴이(home-talk.js)
   이야기 = 카드에 이미 적힌 글 그대로 「이름. 누구(한 줄 소개). 왜 여기(맡은 까닭)」 — 새 사실을 지어 넣지 않음 · 말과 화면 글이 같은 내용(사장님 규칙)
   소리 = 휴대폰이 읽어 줌(speechSynthesis · 한국어 판 ko-KR · 영어 판 en-US · 빠르기 0.9 · 높이 1 · 크기 0.96) · 누를 때만 · 같은 얼굴을 다시 누르면 멈춤 · 쪽을 옮기면 멈춤
   글상자 = 얼굴이 든 칸 안 .rms-cap(이름표 · 불빛 지킴이) — 듣는 말 그대로 보임 · 소리를 못 내는 휴대폰도 글상자는 보임 · 로마 신 카드는 글이 카드에 있어 카드에 테만(.rm-say)
   글은 textContent 로만 · 그림은 글자 없는 svg · 글 속 style 없음 */
import {ON as EN} from './i18n.js';
import {NAME, NAME_EN} from './brand.js';
import {GODS, SEATS, artOf} from './roman72.js';

const fill = s => String(s).split('{N}').join(EN ? NAME_EN : NAME);
/** 그 신 이야기 — 카드 글 그대로(이름 · 한 줄 소개 · 왜 여기) · 없는 번호면 null */
export function storyOf(n) {
  const g = GODS[n], s = SEATS.find(x => x[4] === n); if (!g || !s) return null;
  return EN ? `${g[2]}. ${g[4]} ${fill(s[6])}` : `${g[0]}. ${g[3]} ${fill(s[5])}`;
}
export const VOICE = Object.freeze({rate: 0.9, pitch: 1, volume: 0.96}); // 사장님 소리 규칙(빠르기 0.90 · 높이 1.0 · 크기 0.96)
const canSay = () => typeof globalThis.speechSynthesis !== 'undefined' && typeof globalThis.SpeechSynthesisUtterance === 'function';
let cur = null; // 지금 말하는 얼굴 {btn, card}
function quiet() { const c = cur; cur = null; if (!c) return; c.btn.setAttribute('aria-pressed', 'false'); c.card?.classList.remove('rm-say'); }
/** 멈춤 — 소리 끄기 · 눌림 풂 */
export function stop() { quiet(); try { if (canSay()) speechSynthesis.cancel(); } catch { /* 소리 없음 */ } }
let hooked = false;
/** 얼굴 단추를 누름 — 같은 얼굴이 말하는 중이면 멈춤 · 아니면 이야기를 글상자에 보이고 읽음 */
export function say(n, btn) {
  const text = storyOf(n); if (!text || !btn) return;
  if (!hooked) { hooked = true; addEventListener('hashchange', stop); addEventListener('pagehide', stop); }
  if (cur && cur.btn === btn) { stop(); return; }
  stop();
  const host = btn.closest('.rmt, .y11-gw, .rm-card'), cap = host?.querySelector('.rms-cap'), card = host?.classList.contains('rm-card') ? host : null;
  if (cap) { cap.textContent = text; cap.hidden = false; }
  if (!canSay()) return; // 소리를 못 내는 휴대폰 — 글상자만
  const me = cur = {btn, card};
  btn.setAttribute('aria-pressed', 'true'); card?.classList.add('rm-say');
  try {
    const u = new SpeechSynthesisUtterance(text);
    u.lang = EN ? 'en-US' : 'ko-KR'; u.rate = VOICE.rate; u.pitch = VOICE.pitch; u.volume = VOICE.volume;
    u.onend = u.onerror = () => { if (cur === me) quiet(); };
    speechSynthesis.speak(u);
  } catch { if (cur === me) quiet(); }
}
const SVGNS = 'http://www.w3.org/2000/svg';
const sv = (tag, at) => { const e = document.createElementNS(SVGNS, tag); for (const [k, v] of Object.entries(at)) e.setAttribute(k, String(v)); return e; };
/** 소리 표 — 얼굴 오른쪽 아래 작은 동그라미 확성기(글자 없음) */
function spk() {
  const s = sv('svg', {class: 'rms-spk', viewBox: '0 0 24 24', width: 22, height: 22, 'aria-hidden': 'true', focusable: 'false'});
  s.append(sv('circle', {cx: 12, cy: 12, r: 11, fill: '#1E1428', stroke: '#F2C46B', 'stroke-width': 1.6}), sv('path', {d: 'M6 10h3l4-3v10l-4-3H6z', fill: '#F2C46B'}), sv('path', {d: 'M15.5 9.2a4 4 0 0 1 0 5.6', fill: 'none', stroke: '#F2C46B', 'stroke-width': 1.8, 'stroke-linecap': 'round'}));
  return s;
}
/** 얼굴 단추 — 그림(이름은 곁에 있어 그림 이름은 비움) + 소리 표 · 읽는 이름 「(신) 이야기 듣기」 · 누르면 say */
export function faceBtn(n, {size = 64, cls = '', lazy = false} = {}) {
  const g = GODS[n]; if (!g) return null;
  const b = document.createElement('button'), im = document.createElement('img');
  b.type = 'button'; b.className = 'rms-face' + (cls ? ' ' + cls : ''); b.dataset.n = String(n);
  b.setAttribute('aria-pressed', 'false'); b.setAttribute('aria-label', EN ? `Hear ${g[2]}’s story` : `${g[0]} 이야기 듣기`);
  im.alt = ''; im.width = size; im.height = size; im.decoding = 'async'; if (lazy) im.loading = 'lazy'; im.src = artOf(n);
  b.append(im, spk());
  b.addEventListener('click', e => { e.preventDefault(); e.stopPropagation(); say(n, b); });
  return b;
}
/** 글상자 — 처음엔 숨김 · 누르면 듣는 말 그대로 */
export function capBox() {
  const p = document.createElement('p'); p.className = 'rms-cap'; p.hidden = true; p.setAttribute('aria-live', 'polite');
  return p;
}
