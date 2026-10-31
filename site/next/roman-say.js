/* 신 얼굴 듣기 — 얼굴(캐릭터 그림)을 누르면 그 신 이야기를 소리로(사장님 2026-10-31 10:58(+04) 「응」 — 물음 「신 얼굴을 누르면 그 신 이야기를 소리로 들려 드릴까요?」 · docs/design/roman72-site-2026-10-31/order-1558.txt)
   얼굴이 보이는 세 곳이 이 단추를 씀 — 로마 신 72 카드(p-roman.js) · 방 지킴이 이름표(roman-tag.js) · 말하는 불빛 지킴이(home-talk.js)
   이야기 = 카드에 이미 적힌 글 그대로 「이름. 누구(한 줄 소개). 왜 여기(맡은 까닭)」 — 새 사실을 지어 넣지 않음 · 말과 화면 글이 같은 내용(사장님 규칙)
   소리 = 휴대폰이 읽어 줌(speechSynthesis · 한국어 판 ko-KR · 영어 판 en-US · 빠르기 0.9 · 높이 1 · 크기 0.96) · 누를 때만 · 같은 얼굴을 다시 누르면 멈춤 · 쪽을 옮기면 멈춤
   글상자 = 얼굴이 든 칸 안 .rms-cap(이름표 · 불빛 지킴이) — 듣는 말 그대로 보임 · 소리를 못 내는 휴대폰도 글상자는 보임 · 로마 신 카드는 글이 카드에 있어 카드에 테만(.rm-say)
   글은 textContent 로만 · 그림은 글자 없는 svg · 글 속 style 없음
   차례로 듣기(사장님 2026-10-31 12:23(+04) 「응」 — 물음 「말하는 불빛 열한 신 이야기를 차례로 이어서 들려 드릴까요?」 · order-1723.txt) = sayAll
     로마 신 72 쪽 곳마다 단추(p-roman.js — 말하는 불빛 칸 order-1723 → 여덟 곳 모두 14:20(+04) 「응」 order-1920.txt)가 그곳 카드 차례대로 넘김 · 누른 그 순간에 휴대폰 소리 줄에 모두 넣음(이어 읽기 · 아이폰도 누를 때만 소리) · 다른 곳 단추를 누르면 앞 곳은 처음 모습
     읽는 카드에 테 · 그 카드가 화면 밖이면 가운데로(움직임 줄이기면 바로) · 다시 누름 · 다른 얼굴 누름 · 지금 읽는 얼굴 누름 · 쪽 옮김 = 멈춤 · 다 읽으면 처음 모습
     첫 화면 말하는 불빛 차례로 듣기(16:23(+04) 「응」 · order-2123.txt · home-talk.js) — 카드 대신 go(그 불빛을 고름 · 말풍선이 글상자) · view(말풍선 머리가 화면 밖이면 위로 당김) */
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
/** 이 휴대폰이 소리를 낼 수 있나 — 못 내면 차례로 듣기 단추를 안 보임(p-roman.js) */
export const canSpeak = () => canSay();
let cur = null; // 지금 말하는 얼굴 {btn, card}
let run = null; // 차례로 듣는 중 {btn, cap, set, items:[{text, label, card, face}], us, i}
function quiet() { const c = cur; cur = null; if (!c) return; c.btn.setAttribute('aria-pressed', 'false'); c.card?.classList.remove('rm-say'); }
function unmark(it) { it.face?.setAttribute('aria-pressed', 'false'); it.card?.classList.remove('rm-say'); }
const still = () => !!globalThis.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches;
/** 차례로 듣기 — i번째 카드를 읽는 중으로(테 · 얼굴 눌림 · 글상자 · 화면 밖이면 가운데로) · 같은 번호면 그대로 */
function mark(r, i) {
  if (run !== r || i < 0 || i >= r.items.length || r.i === i) return;
  if (r.i >= 0) unmark(r.items[r.i]);
  r.i = i; const it = r.items[i];
  it.face?.setAttribute('aria-pressed', 'true'); it.card?.classList.add('rm-say'); it.go?.();
  if (r.cap) { r.cap.textContent = it.label; r.cap.hidden = false; }
  const how = still() ? 'auto' : 'smooth', b = it.card?.getBoundingClientRect(), v = !it.card ? it.view?.getBoundingClientRect() : null;
  if (b && (b.top < 72 || b.bottom > innerHeight - 72)) it.card.scrollIntoView({block: 'center', behavior: how});
  else if (v && v.height && (v.top < 72 || v.top > innerHeight * 0.55)) scrollBy({top: v.top - 84, behavior: how}); // 말풍선(첫 화면) — 머리가 위쪽에 오게
}
/** 이 단추가 지금 차례로 읽는 중인가(첫 화면 불빛 · 앞 · 다음 · 소리 단추가 먼저 멈춤) */
export const playing = btn => !!run && run.btn === btn;
function endRun() { const r = run; run = null; if (!r) return; if (r.i >= 0) unmark(r.items[r.i]); r.set?.(false); if (r.cap) { r.cap.hidden = true; r.cap.textContent = ''; } }
/** 멈춤 — 소리 끄기 · 눌림 풂 · 차례로 듣기도 처음 모습 */
export function stop() { quiet(); endRun(); try { if (canSay()) speechSynthesis.cancel(); } catch { /* 소리 없음 */ } }
let hooked = false;
const hook = () => { if (!hooked) { hooked = true; addEventListener('hashchange', stop); addEventListener('pagehide', stop); } };
const utter = text => { const u = new SpeechSynthesisUtterance(text); u.lang = EN ? 'en-US' : 'ko-KR'; u.rate = VOICE.rate; u.pitch = VOICE.pitch; u.volume = VOICE.volume; return u; };
/** 얼굴 단추를 누름 — 같은 얼굴이 말하는 중이면 멈춤 · 차례로 듣는 중 지금 읽는 얼굴이면 모두 멈춤 · 아니면 이야기를 글상자에 보이고 읽음 */
export function say(n, btn) {
  const text = storyOf(n); if (!text || !btn) return;
  hook();
  if (cur && cur.btn === btn) { stop(); return; }
  if (run && run.items[run.i]?.face === btn) { stop(); return; }
  stop();
  const host = btn.closest('.rmt, .y11-gw, .rm-card'), cap = host?.querySelector('.rms-cap'), card = host?.classList.contains('rm-card') ? host : null;
  if (cap) { cap.textContent = text; cap.hidden = false; }
  if (!canSay()) return; // 소리를 못 내는 휴대폰 — 글상자만
  const me = cur = {btn, card};
  btn.setAttribute('aria-pressed', 'true'); card?.classList.add('rm-say');
  try {
    const u = utter(text);
    u.onend = u.onerror = () => { if (cur === me) quiet(); };
    speechSynthesis.speak(u);
  } catch { if (cur === me) quiet(); }
}
/** 차례로 듣기 — items 를 차례대로 이어 읽음(누른 그 순간에 소리 줄에 모두 넣음) · 같은 단추를 다시 누르면 멈춤
    items = [{text 읽을 말, label 글상자 글, card 카드, face 얼굴 단추, go 시작할 때 부름, view 화면에 둘 칸}] · cap = 글상자 · set(on) = 단추 모양(읽는 중 / 처음) */
export function sayAll(items, btn, {cap = null, set = null} = {}) {
  if (!btn) return;
  hook();
  if (run && run.btn === btn) { stop(); return; }
  stop();
  const list = (items ?? []).filter(x => x && x.text);
  if (!canSay() || !list.length) return;
  const me = run = {btn, cap, set, items: list, us: [], i: -1};
  set?.(true);
  try {
    list.forEach((it, i) => {
      const u = utter(it.text); me.us.push(u); // 붙잡아 둠(끝 소식이 사라지지 않게)
      u.onstart = () => mark(me, i);
      u.onend = () => { if (run !== me) return; if (i === list.length - 1) endRun(); else mark(me, i + 1); };
      u.onerror = () => { if (run === me) stop(); };
      speechSynthesis.speak(u);
    });
    mark(me, 0);
  } catch { if (run === me) stop(); }
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
