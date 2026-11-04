/* 수르 틀 씌우기 — 옛 기능 쪽(/next/ · /atlas/ · /app/)을 새 수르 길 안에서 이어 걷게
   사장님 2026-11-04 18:54(+03) 「수르 명령서 — 잡스 판」 [4] 4 「모든 기능이 새 판 안에서 열리게 해라 (옛 화면으로 튕기면 흐름이 끊긴다)」 · [4] 6 「종목 검색과 앵무새는 어느 화면에나 둬라」
   - 수르 쪽(/su/#/g/<묶음>)에서 연 때만 씌움: 주소 ?su=<묶음> 또는 이 탭의 기억(sessionStorage) — 그냥 들어온 옛 손님 · 옛 쪽 검사는 그대로(옛 화면은 지우지 않음 · [1] 7)
   - 씌우는 것: 아래에 앵무새 「수르로 · <묶음> 길」 단추와 수르 탭 넷(21곳 · 지도 · 기록 · 멈춤) · 옛 아래 단추는 숨김 · 금빛 테두리(su-wrap.css · html.su-wrapped 아래만)
   - 옛 쪽의 글 · 숫자 · 셈은 그대로(바꾸지 않음) · innerHTML 없음 · 사이트 보안 규칙(남의 틀에 넣기 금지)을 건드리지 않고 같은 쪽 위에 얹기만 함 */
const KEY = 'su:wrap';
export const GROUPS = Object.freeze({hot: '불장', bloom: '꽃이 될', money: '돈이 몰리는', stop: '사기 전에 멈춤', guide: '길잡이', guest: '손님 부르기', back: '뒤에서 도는 것', sky: '하늘'});
const TABS = [['21곳', '/su/#/', 'M4 11l8-7 8 7v9H4z'], ['지도', '/su/#/m', 'M3 6l6-2 6 2 6-2v14l-6 2-6-2-6 2zM9 4v14M15 6v14'], ['기록', '/su/#/r', 'M4 20V10M10 20V4M16 20v-8M22 20H2'], ['멈춤', '/su/#/p', 'M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18zM10 9v6M14 9v6']];
const NS = 'http://www.w3.org/2000/svg';

/** 이 쪽을 씌울 묶음 — 주소의 ?su= 가 먼저 · 없으면 이 탭이 기억한 것 · 모르는 값은 씌우지 않음 */
export function wrapGroup(search = location.search) {
  let g = null;
  try { g = new URLSearchParams(search).get('su'); } catch { g = null; }
  try { if (g) sessionStorage.setItem(KEY, g); else g = sessionStorage.getItem(KEY); } catch { /* 기억 못 함 — 주소만 */ }
  return g && Object.prototype.hasOwnProperty.call(GROUPS, g) ? g : null;
}
function el(tag, attrs = {}, ...kids) {
  const e = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs)) if (v != null) e.setAttribute(k, v);
  for (const k of kids.flat()) if (k != null) e.append(k);
  return e;
}
function icon(d) {
  const sv = document.createElementNS(NS, 'svg'); sv.setAttribute('viewBox', '0 0 24 24'); sv.setAttribute('aria-hidden', 'true'); sv.setAttribute('class', 'suw-i');
  const p = document.createElementNS(NS, 'path'); p.setAttribute('d', d); sv.append(p); return sv;
}
/** 아래 막대 — 앵무새 단추(그 묶음 길로) + 탭 넷 */
export function wrapBar(g) {
  const back = el('a', {class: 'suw-back', href: '/su/#/g/' + g}, el('img', {src: '/media/makbi-icon.svg', alt: '', width: '34', height: '34'}),
    el('span', {class: 'suw-bk'}, '수르로'), el('b', {}, GROUPS[g] + ' 길'), el('i', {'aria-hidden': 'true'}, '›'));
  const find = el('a', {class: 'suw-find', href: '/su/#/g/guide', 'aria-label': '종목 찾기 · 길잡이'}, icon('M10.5 4a6.5 6.5 0 1 0 4 11.6l4.4 4.4 1.4-1.4-4.4-4.4A6.5 6.5 0 0 0 10.5 4zm0 2a4.5 4.5 0 1 1 0 9 4.5 4.5 0 0 1 0-9z'), el('span', {}, '찾기'));
  const tabs = el('nav', {class: 'suw-tabs', 'aria-label': '수르 탭'}, TABS.map(([t, href, d]) => el('a', {href}, icon(d), el('span', {}, t))));
  return el('div', {class: 'suw-bar', role: 'navigation', 'aria-label': '수르 길'}, el('div', {class: 'suw-row'}, back, find), tabs);
}
/** 씌우기 — 한 번만 · 몸통이 생긴 뒤 */
export function wrap() {
  const g = wrapGroup(); if (!g) return false;
  const go = () => { if (document.getElementById('suw')) return; document.documentElement.classList.add('su-wrapped'); const b = wrapBar(g); b.id = 'suw'; document.body.append(b); };
  if (document.body) go(); else document.addEventListener('DOMContentLoaded', go, {once: true});
  return true;
}
if (typeof document !== 'undefined') wrap();
