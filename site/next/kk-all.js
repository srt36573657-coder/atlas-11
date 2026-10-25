/* 「카톡 보내기」 모든 곳(사장님 2026-10-25 06:06 · 12:00 「못든곳에 카톡 보내기 다 표기한다 진짜모든곳에」 · 12:02 「이 뜻인가요?」 — 모든 쪽 · 모든 칸에 글자로 ·
   누르면 그 칸을 카톡 친구에게 · 12:24 「어」) — 쪽을 그린 다음 app.js route() 가 sweep(root, {title, url}) 를 한 번 부르고, 늦게 그려지는 칸은 지켜봄(watch)
   ① 쪽 — 쪽마다 하나: 큰 제목(h1)과 그 밑 설명 글 아래 · 제목이 없으면 칩 줄 아래 · 맨 위 · 이미 쪽 보내기 단추(.kk-pg · .kk-pgx)가 있으면 그대로
      page = 'top'(위) · 'end'(맨 아래 — 매매일지: 제목 바로 밑은 「한 달 전 약속」 자리 B17) · false(없음)
   ② 칸 — 칸 제목(h2)마다 하나: 그 칸 끝 오른쪽 · 칸 안에 이미 「카톡 보내기」 글 단추가 있으면 그대로 · 고리(a) · 단추 · 접힌 제목(summary) 안 제목은 건너뜀
      칸 = h2 하나만 품은 가장 가까운 덩이(section · article · details · [data-w] · .card) · 그런 덩이가 없으면 h2 부터 다음 h2 앞까지의 형제 묶음
   보내는 글 = 쪽 이름 · 칸 제목 · 주소만 — 오른 % · 수익률 숫자는 지움(「수익률은 보내지 마라」 · 글상자 p-share noGain 이 한 번 더 거름)
   글은 textContent 로만 · 글 속 style 없음(보안 규칙) · 단추 = share-btn.js kakaoText 한 곳 */
import {kakaoText} from './share-btn.js';
import {NAME} from './brand.js';

const GAIN = /[+\-−±]?\s?\d[\d,.]*\s*(%p?|％|퍼센트|원|배)/g;
/** 보낼 이름 — 숫자 %(오른 폭 · 수익률) · 값(원)을 지우고 한 줄로 */
export const clean = s => String(s ?? '').replace(GAIN, '').replace(/[?？]\s*$/, '?').replace(/\s*[·,]\s*$/, '').replace(/\s+/g, ' ').trim().slice(0, 60);
const HAS = '.kk-txt, .kk-pgx'; // 이미 있는 글 단추(쪽 · 칸 · 회사 화면 「카톡 보내기」 · 시황)
const SKIP = 'a, button, summary, nav, .ps-dlg, .kk-skip';

/** ① 쪽 단추 자리 — 큰 제목 머리 칸(.th-hd = 제목 + 돌 그림 한 줄) 뒤 · 큰 제목 뒤 · 칩 줄 뒤 · 맨 위 */
function pageBtn(root, title, url) {
  if (root.querySelector('.kk-pg, .kk-pgx')) return null;
  const t = clean(title) || NAME;
  const b = kakaoText({title: `${t} · ${NAME}`, text: `${NAME} — ${t}`, url});
  b.classList.add('kk-pg');
  const h1 = [...root.querySelectorAll('h1')].find(x => !x.closest(SKIP));
  if (h1) { // 제목 바로 밑 설명 글(p · 두 줄까지)은 제목과 붙여 둠(「제목 + 설명」 짝 그대로 · check_hold 관심 머리 글) — 그 다음에 단추
    let at = h1; // 제목을 품은 머리 칸(제목 + 작은 글 + 동그라미 · 돌 그림 — 아이 셋까지)이면 그 칸 뒤(머리 칸 줄 안에 끼지 않게)
    while (at.parentElement && at.parentElement !== root && at.parentElement.children.length <= 3 && !at.parentElement.matches('section, article, details, main, [data-page], .tc')) at = at.parentElement;
    for (let k = 0; k < 2 && at.nextElementSibling?.matches('p'); k++) at = at.nextElementSibling;
    at.after(b);
    if (b.getBoundingClientRect().left < h1.getBoundingClientRect().left - 4) { const w = document.createElement('div'); w.className = 'kk-pgi'; b.before(w); w.append(b); } // 단추가 제목보다 왼쪽(쪽 가장자리)이면 제목 왼쪽 줄에 맞춤
    return b;
  }
  const chips = root.querySelector('.chips');
  const top = chips ? [...root.children].find(c => c === chips || c.contains(chips)) : null;
  const w = document.createElement('div'); w.className = 'kk-pgw'; w.append(b); // 제목 없는 쪽 — 쪽 글과 같은 옆 띄움(칩 줄 · 맨 위는 쪽 가장자리)
  if (top) top.after(w); else root.prepend(w);
  return b;
}
/** ② 칸 — h2 하나만 품은 가장 가까운 덩이 → {box} · 없으면 형제 묶음 → {after} · 고리 · 단추 안이면 null */
function boxOf(h2, root) {
  for (let e = h2.parentElement; e && e !== root; e = e.parentElement) {
    if (e.matches(SKIP)) return null;
    if (e.matches('section, article, details, [data-w], .card') && e.querySelectorAll('h2').length === 1) return {box: e};
  }
  const run = [h2];
  for (let n = h2.nextElementSibling; n && !n.matches('h2') && !n.querySelector('h2'); n = n.nextElementSibling) run.push(n);
  return {run};
}
const EMPTY = /^(\?\s*)?아직 .*없어요\.?$|못했어요\.?$/; // 빈 칸 글(「아직 적은 보유종목이 없어요.」 · 「? 자료를 받지 못했어요」) — 보낼 것이 없는 칸은 단추 없이(빈 칸은 짧게 · check_hold 260px)
const WORTH = 'a[href], svg, img, canvas, table, ul, ol, dl, figure, .kk-btn[data-kk]';
const emptyIn = els => els.some(e => e.matches?.('.empty') || e.querySelector?.('.empty') || [...(e.matches?.('p') ? [e] : []), ...(e.querySelectorAll?.('p') ?? [])].some(x => EMPTY.test((x.textContent || '').trim())));
function boxBtn(h2, root, page, url) {
  if (h2.closest(SKIP) || h2.closest('.kk-box')) return null;
  const at = boxOf(h2, root); if (!at) return null;
  if (at.box ? at.box.querySelector(HAS) : at.run.some(e => e.matches(HAS) || e.querySelector(HAS))) return null; // 이미 있음
  if (emptyIn(at.box ? [at.box] : at.run)) return null; // 빈 칸
  const els = at.box ? [at.box] : at.run; // 글만 있는 칸(고리 · 그림 · 표 · 목록이 없음 — 빈 칸 안내 · 안내 한 줄)은 보낼 것이 없어 단추 없이
  if (!els.some(e => e.matches?.(WORTH) || e.querySelector?.(WORTH))) return null;
  const name = clean(h2.textContent); if (!name) return null;
  const pg = clean(page);
  const b = kakaoText({title: `${name} · ${NAME}`, text: pg && pg !== name ? `${NAME} ${pg} — ${name}` : `${NAME} — ${name}`, url});
  const wrap = document.createElement('div'); wrap.className = 'kk-box'; wrap.append(b);
  if (at.box) at.box.append(wrap); else at.run.at(-1).after(wrap);
  if (b.getBoundingClientRect().right > h2.getBoundingClientRect().right + 4) wrap.classList.add('kk-boxi'); // 단추가 제목 오른쪽 끝보다 바깥(쪽 가장자리)이면 안으로
  return wrap;
}
/** 쪽 맨 아래 쪽 단추(page = 'end') */
function pageEnd(root, title, url) {
  if (root.querySelector('.kk-pg, .kk-pgx')) return null;
  const t = clean(title) || NAME;
  const b = kakaoText({title: `${t} · ${NAME}`, text: `${NAME} — ${t}`, url});
  b.classList.add('kk-pg');
  const w = document.createElement('div'); w.className = 'kk-pgw'; w.append(b); root.append(w);
  return b;
}
/** 한 번 훑기 — 더한 단추 수 · boxes = 칸 단추를 달지(매매일지 기록 칸은 「했어 · 안 했어」 말고 누르는 것 0 — 규칙 77) */
export function sweep(root, {title = '', url = '', page = 'top', boxes = true} = {}) {
  if (!root) return 0;
  let n = 0;
  if (page === 'end' ? pageEnd(root, title, url) : page && pageBtn(root, title, url)) n++;
  if (boxes) for (const h2 of root.querySelectorAll('h2')) if (boxBtn(h2, root, title, url)) n++;
  return n;
}
/** 늦게 그려지는 칸(받은 뒤 붙는 카드 · 다음 줄 · 쿠폰 칸) — 그 쪽 동안만 지켜봄 · 우리 단추가 붙는 것은 무시 · 다음 쪽이면 stop() */
export function watch(root, o) {
  if (!root || typeof MutationObserver !== 'function') return () => {};
  let busy = false;
  // 지켜보기 알림은 그 바뀜 바로 뒤 · 그리기 전에 옴 — 늦게 붙는 칸과 그 칸의 단추가 같은 그림에 함께 나옴(단추만 따로 늦게 붙어 아래 글을 미는 일 0)
  const mo = new MutationObserver(list => {
    if (busy || list.every(m => [...m.addedNodes].every(x => x.nodeType !== 1 || x.matches?.('.kk-box, .kk-pg, .kk-pgw, .kk-pgi, .kk-btn')))) return;
    busy = true; try { sweep(root, {...o, page: false}); } catch (e) { console.error(e); } finally { mo.takeRecords(); busy = false; }
  });
  mo.observe(root, {childList: true, subtree: true});
  return () => mo.disconnect();
}
