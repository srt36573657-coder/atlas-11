/* 노란 경고 글은 두 줄까지(사장님 2026-10-18 00:15 명령문 [10] 10 「노란 경고 글은 두 줄까지. 길면 「?」 한 줄로 두고 누르면 펼쳐라」 · 일꾼 S12x · 쓰는 법 accept/S12.md)
   쓰는 법(쪽 모듈 맨 위 — 같은 주소 · 보안 규칙 그대로):
     import {warn} from '/next/warn.js';
     node.append(warn('긴 경고 글 …'));                         // 두 줄 안이면 금빛 한 문단 그대로 · 넘으면 「? 조심할 것 — 누르면 펼쳐요」 한 줄 → 누르면 펼침
     node.append(warn('긴 글 …', {short: '? 장 중 값이에요'}));  // 접힌 한 줄 글을 직접 줄 때(「?」로 시작 · 영어는 add.mjs 로 함께)
     node.append(warn(h('span', …), {cls: 'in'}));             // 글 대신 칸도 됨 · cls 'in' = 안쪽 칸(옆 여백 없음) · 그 밖의 이름은 쪽 css 가 씀
   두 줄인지는 그려진 뒤 글줄을 세어 정함(글자 상자의 줄 수 — 글씨 크기 단추 · 영어 · 화면 폭 · 글꼴이 모두 들어감)
   · 칸 폭이 바뀌거나(쪽 모양 파일이 늦게 붙음 · 글씨 크기 단추 · 화면 돌림) 글꼴이 다 오면 다시 정함 — 접힌 칸은 그리기 전에 잠깐 펴서 세고 두 줄 안이면 다시 한 문단으로
     (2026-10-18 깃허브 320 폭: 글꼴이 오기 전 세 줄로 재어 접힌 칸이 글꼴이 온 뒤 두 줄인데도 접힌 채 남던 것)
   · 같은 폭에서는 다시 정하지 않음(접고 펴서 높이만 바뀐 알림은 넘김 — 오가며 되풀이하지 않게)
   모양 = app.css 「노란 경고」 묶음(글 17px · 금빛 · 누르는 자리 44px) */
const SHORT = '? 조심할 것 — 누르면 펼쳐요';
/** 글줄 수 — 칸 안 글자 상자들의 서로 다른 줄(위 끝이 2px 넘게 다른 것) · 그려지지 않았으면 0 */
export function lineCount(el) {
  if (!el?.isConnected) return 0;
  const r = document.createRange(); r.selectNodeContents(el);
  const tops = [];
  for (const b of r.getClientRects()) { if (b.width < 1 || b.height < 1) continue; if (!tops.some(t => Math.abs(t - b.top) <= 2)) tops.push(b.top); }
  return tops.length;
}
const W = new WeakMap(); // 칸 → 마지막으로 정한 때의 폭
/** 지금 폭 · 글꼴로 접기 · 펴기를 정함 */
function settle(d) {
  const p = d?.querySelector(':scope > .nw-t'); if (!p || !d.isConnected) return;
  if (!d.classList.contains('long')) { if (lineCount(p) > 2) { d.classList.add('long'); d.open = false; } return; }
  const was = d.open; if (!was) d.open = true; // 접힌 칸 — 그리기 전 잠깐 펴서 셈(화면에는 안 보임)
  const n = lineCount(p);
  if (n > 0 && n <= 2) { d.classList.remove('long'); d.open = true; } // 두 줄 안 — 다시 금빛 한 문단
  else if (!was) d.open = false;
}
const widthOf = d => Math.round(d.getBoundingClientRect().width);
const ro = typeof ResizeObserver === 'function' ? new ResizeObserver(es => {
  const todo = [];
  for (const e of es) {
    const d = e.target; if (!d.isConnected) { ro.unobserve(d); continue; } // 지난 화면의 칸
    const w = widthOf(d); if (!w || W.get(d) === w) continue; // 같은 폭 — 접고 펴서 높이만 바뀐 것
    W.set(d, w); todo.push(d);
  }
  // 접고 펴기는 다음 그림 때(rAF) — 알림 안에서 칸 높이를 바꾸면 아이폰 엔진이 「ResizeObserver loop completed with undelivered notifications」 오류를 냄
  //   (2026-10-20 휴대폰 탐침 1c 일곱 단 — 아이폰 둘에서 4 ~ 7단 쪽 노란 경고 · p-past · p-grow 와 같은 방법)
  if (todo.length) requestAnimationFrame(() => { for (const d of todo) if (d.isConnected) settle(d); });
}) : null;
/** 글꼴이 다 오면 모두 다시(폭은 같아도 글자 폭이 바뀜) */
function settleAll() { for (const d of document.querySelectorAll('details.nw')) { if (!d.isConnected) continue; W.set(d, widthOf(d)); settle(d); } }
try { if (document.fonts) { document.fonts.ready.then(settleAll, () => {}); document.fonts.addEventListener?.('loadingdone', settleAll); } } catch { /* 글꼴 알림 없음 */ }
/** 노란 경고 — 짧으면 금빛 한 문단 · 두 줄을 넘으면 「?」 한 줄로 접힘(누르면 펼침) */
export function warn(body, {short = SHORT, cls = ''} = {}) {
  const d = document.createElement('details');
  d.className = 'nw' + (cls ? ' ' + cls : '');
  d.open = true;
  const s = document.createElement('summary'); s.className = 'nw-s'; s.textContent = short || SHORT;
  const p = document.createElement('p'); p.className = 'nw-t';
  if (body instanceof Node) p.append(body); else if (Array.isArray(body)) p.append(...body.filter(x => x != null)); else p.textContent = String(body ?? '');
  d.append(s, p);
  ro?.observe(d);
  return d;
}
