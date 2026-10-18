/* 노란 경고 글은 두 줄까지(사장님 2026-10-18 00:15 명령문 [10] 10 「노란 경고 글은 두 줄까지. 길면 「?」 한 줄로 두고 누르면 펼쳐라」 · 일꾼 S12x · 쓰는 법 accept/S12.md)
   쓰는 법(쪽 모듈 맨 위 — 같은 주소 · 보안 규칙 그대로):
     import {warn} from '/next/warn.js';
     node.append(warn('긴 경고 글 …'));                         // 두 줄 안이면 금빛 한 문단 그대로 · 넘으면 「? 조심할 것 — 누르면 펼쳐요」 한 줄 → 누르면 펼침
     node.append(warn('긴 글 …', {short: '? 장 중 값이에요'}));  // 접힌 한 줄 글을 직접 줄 때(「?」로 시작 · 영어는 add.mjs 로 함께)
     node.append(warn(h('span', …), {cls: 'in'}));             // 글 대신 칸도 됨 · cls 'in' = 안쪽 칸(옆 여백 없음) · 그 밖의 이름은 쪽 css 가 씀
   두 줄인지는 그려진 뒤 글줄을 세어 정함(글자 상자의 줄 수 — 글씨 크기 단추 · 영어 · 화면 폭이 모두 들어감 · 넘으면 접고 다시 펴지 않음)
   모양 = app.css 「노란 경고」 묶음(글 17px · 금빛 · 누르는 자리 44px) */
const SHORT = '? 조심할 것 — 누르면 펼쳐요';
const seen = new Set(), wasOn = new WeakSet(); // 지켜보는 글 칸 · 한 번이라도 화면에 붙었던 칸
/** 글줄 수 — 칸 안 글자 상자들의 서로 다른 줄(위 끝이 2px 넘게 다른 것) · 그려지지 않았으면 0 */
export function lineCount(el) {
  if (!el?.isConnected) return 0;
  const r = document.createRange(); r.selectNodeContents(el);
  const tops = [];
  for (const b of r.getClientRects()) { if (b.width < 1 || b.height < 1) continue; if (!tops.some(t => Math.abs(t - b.top) <= 2)) tops.push(b.top); }
  return tops.length;
}
function fold(d) { d.classList.add('long'); d.open = false; }
const ro = typeof ResizeObserver === 'function' ? new ResizeObserver(es => {
  for (const e of es) {
    const p = e.target, d = p.parentElement;
    if (!d || d.classList.contains('long')) { ro.unobserve(p); seen.delete(p); continue; }
    if (lineCount(p) > 2) { fold(d); ro.unobserve(p); seen.delete(p); }
  }
  for (const p of seen) { if (p.isConnected) wasOn.add(p); else if (wasOn.has(p)) { ro.unobserve(p); seen.delete(p); } } // 지난 화면의 칸(화면이 바뀌어 떨어진 것)은 그만 봄
}) : null;
/** 노란 경고 — 짧으면 금빛 한 문단 · 두 줄을 넘으면 「?」 한 줄로 접힘(누르면 펼침) */
export function warn(body, {short = SHORT, cls = ''} = {}) {
  const d = document.createElement('details');
  d.className = 'nw' + (cls ? ' ' + cls : '');
  d.open = true;
  const s = document.createElement('summary'); s.className = 'nw-s'; s.textContent = short || SHORT;
  const p = document.createElement('p'); p.className = 'nw-t';
  if (body instanceof Node) p.append(body); else if (Array.isArray(body)) p.append(...body.filter(x => x != null)); else p.textContent = String(body ?? '');
  d.append(s, p);
  if (ro) { ro.observe(p); seen.add(p); }
  return d;
}
