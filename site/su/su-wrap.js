/* 수르 틀 씌우기 — 옛 기능 쪽(/next/ · /atlas/ · /app/)을 새 수르 길 안에서 이어 걷게
   사장님 2026-11-04 18:54(+03) 「수르 명령서 — 잡스 판」 [4] 4 「모든 기능이 새 판 안에서 열리게 해라 (옛 화면으로 튕기면 흐름이 끊긴다)」 · [4] 6 「종목 검색과 앵무새는 어느 화면에나 둬라」
   - 수르 쪽(/su/#/g/<묶음>)에서 연 때만 씌움: 주소 ?su=<묶음> 또는 이 탭의 기억(sessionStorage) — 그냥 들어온 옛 손님 · 옛 쪽 검사는 그대로(옛 화면은 지우지 않음 · [1] 7)
   - 씌우는 것: 아래에 앵무새 「수르로 · <묶음> 길」 단추와 수르 탭 넷(21곳 · 지도 · 기록 · 멈춤) · 옛 아래 단추는 숨김 · 금빛 테두리(su-wrap.css · html.su-wrapped 아래만)
   - 옛 쪽의 글 · 숫자 · 셈은 그대로(바꾸지 않음) · innerHTML 없음 · 사이트 보안 규칙(남의 틀에 넣기 금지)을 건드리지 않고 같은 쪽 위에 얹기만 함
   - 첫 페이지 판(주문 2011 · 사장님 2026-11-08 20:11 「모든 페이지를 첫페이지 기준으로」 · 20:26 「아니 이것도 같이 작업해」 · 22:50 「이것도 구슬로 해」) — 모든 손님(수르에서 넘어왔든 옛 주소로 바로 왔든):
     색 파일(su-wrap-jobs.css)을 받은 뒤 밤 무대 판(html.clock)을 떼어 옛 흰 판 자리 위에 첫 페이지 색(흰 바탕 · 먹 글 · 호박색 하나) · 창 위 띠도 흰색 · 옛 쪽이 길을 바꾸며 다시 붙여도 곧바로 뗌
     옛 쪽 머리가 색 파일을 처음부터 받고 <html> 에 su-jobs 를 두면 첫 그림부터 흰 판(깜빡임 없음) · 머리에 없으면 여기서 붙이고 받은 뒤에 바꿈 · 수르 틀(아래 수르 막대)은 수르에서 넘어온 때만 */
const KEY = 'su:wrap';
export const GROUPS = Object.freeze({hot: '불장', bloom: '꽃이 될', money: '돈이 몰리는', stop: '사기 전에 멈춤', guide: '길잡이', guest: '손님 부르기', back: '뒤에서 도는 것', sky: '하늘'});
export const TABS = [['21곳', '/su/#/', 'M4 11l8-7 8 7v9H4z'], ['지도', '/su/#/m', 'M3 6l6-2 6 2 6-2v14l-6 2-6-2-6 2zM9 4v14M15 6v14'], ['기록', '/su/#/r', 'M4 20V10M10 20V4M16 20v-8M22 20H2'], ['멈춤', '/su/#/p', 'M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18zM10 9v6M14 9v6']];
const NS = 'http://www.w3.org/2000/svg';
export const JOBS_CSS = '/su/su-wrap-jobs.css'; // 색 이름 · 위 막대 · 아래 단추 · 밤 판 자리 지킴 — 쪽 머리가 처음부터 받음
export const APP_CSS = '/su/su-wrap-app.css'; // 옛 앱(/next/) 쪽마다 남은 색 — 첫 그림을 늦추지 않게 여기서 뒤에 붙임
const WHITE = '#FFFFFF';
export const FIND_D = 'M10.5 4a6.5 6.5 0 1 0 4 11.6l4.4 4.4 1.4-1.4-4.4-4.4A6.5 6.5 0 0 0 10.5 4zm0 2a4.5 4.5 0 1 1 0 9 4.5 4.5 0 0 1 0-9z';
/** 개인정보 처리방침 — 그 쪽은 보안 규칙이 스크립트를 막아(default-src 'none') 틀을 씌울 수 없어, 수르 틀을 미리 입힌 쪽(/su/privacy.html · scripts/atlas11/next/su_privacy.mjs 가 원본에서 지음)으로 감 */
export const SOLO = Object.freeze({'/privacy.html': '/su/privacy.html'});

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
  const back = el('a', {class: 'suw-back', href: '/su/#/'}, el('img', {src: '/media/makbi-icon.svg', alt: '', width: '34', height: '34'}), // 옛 기능 쪽 「셋의 길」(#/g)은 버림 — 큐피트 첫 쪽으로(주문 1114-1306 ⑧)
    el('span', {class: 'suw-bk'}, '큐피트로'), el('b', {}, '첫 쪽'), el('i', {'aria-hidden': 'true'}, '›'));
  const find = el('a', {class: 'suw-find', href: '/next/?su=guide#/find', 'aria-label': '종목 찾기'}, icon(FIND_D), el('span', {}, '찾기'));
  const tabs = el('nav', {class: 'suw-tabs', 'aria-label': '큐피트 탭'}, TABS.map(([t, href, d]) => el('a', {href}, icon(d), el('span', {}, t))));
  return el('div', {class: 'suw-bar', role: 'navigation', 'aria-label': '큐피트 길'}, el('div', {class: 'suw-row'}, back, find), tabs);
}
/** 첫 페이지 판 — 색 파일을 붙이고, 다 받은 뒤(그 전에는 옛 판 그대로 — 반쯤 바뀐 화면 없음) 밤 무대 판을 떼고 창 위 띠를 흰색으로 지킴 · 한 번만 */
let looked = false;
export function jobsLook(doc = document) {
  const de = doc.documentElement;
  const keep = () => {
    if (de.classList.contains('clock')) de.classList.remove('clock');
    for (const m of doc.querySelectorAll('meta[name="theme-color"]')) if (m.getAttribute('content') !== WHITE) m.setAttribute('content', WHITE);
  };
  const on = () => {
    if (looked) return; looked = true;
    de.classList.add('su-jobs'); keep();
    const mo = new MutationObserver(keep);
    mo.observe(de, {attributes: true, attributeFilter: ['class']});
    mo.observe(doc.head, {subtree: true, attributes: true, attributeFilter: ['content']});
  };
  if (/^\/next\//.test(doc.location?.pathname ?? '') && !doc.querySelector(`link[href="${APP_CSS}"]`)) { const a = doc.createElement('link'); a.rel = 'stylesheet'; a.href = APP_CSS; doc.head.append(a); }
  let l = doc.querySelector(`link[href="${JOBS_CSS}"]`);
  if (l) { if (l.sheet) on(); else l.addEventListener('load', on, {once: true}); return l; }
  l = doc.createElement('link'); l.rel = 'stylesheet'; l.href = JOBS_CSS;
  l.addEventListener('load', on, {once: true});
  doc.head.append(l);
  return l;
}
/** 씌우기 — 한 번만 · 몸통이 생긴 뒤 */
export function wrap() {
  const g = wrapGroup(); if (!g) return false;
  const go = () => { if (document.getElementById('suw')) return; document.documentElement.classList.add('su-wrapped'); jobsLook(); const b = wrapBar(g); b.id = 'suw'; document.body.append(b); };
  // 옛 쪽 안 「개인정보 처리방침」 고리는 누르는 순간 수르 틀을 입힌 쪽으로(바뀌는 화면마다 새로 그려지는 고리도 — 누를 때 바꿈)
  document.addEventListener('click', e => { const a = e.target?.closest?.('a[href]'); if (!a) return; const h = a.getAttribute('href'), k = Object.keys(SOLO).find(x => h === x || h.startsWith(x + '#') || h.startsWith(x + '?')); if (k) a.setAttribute('href', SOLO[k] + h.slice(k.length).replace(/^\?[^#]*/, '')); }, true);
  if (document.body) go(); else document.addEventListener('DOMContentLoaded', go, {once: true});
  return true;
}
if (typeof document !== 'undefined') { jobsLook(); wrap(); } // 첫 페이지 판은 모든 손님 · 수르 틀은 수르에서 넘어온 때만
