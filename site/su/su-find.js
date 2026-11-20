/* 회사 찾기(주문 1120-1447 · 사장님 2026-11-20(마카오) 14:47 「종목 검색 기능 원하는 회사명이나 종목명을 직접 검색할 수 있는 검색창 추가 …」 · 15:27 「모든 작업을 5시까지 …」)
   회사 탭(#/o) 맨 위 찾기 칸 — 이름 · 번호 · 업종 글자를 쓰면 아래에 회사 줄(누르면 그 회사 쪽 #/c/<번호>)
   자료 = /atlas/data/mkt.json companies(코스피 · 코스닥 회사 이름 · 업종 — 올리기 작업이 날마다 만듦 · 고치지 않음) · 처음 쓸 때만 받음(첫 화면을 무겁게 하지 않음)
   차례 = 이름 · 번호가 같음 → 앞이 같음 → 이름 속에 있음 → 업종 이름 속에 있음 · 같은 칸 안에서는 짧은 이름 먼저(값 · 오름 차례 아님) */
import {h} from '/su/su-fig.js';
import {findCo, FIND_URL} from '/su/su-find-core.js';

/** 찾기 칸 — get = 자료 받기(X.get) · 글을 쓰면 곧바로 줄을 바꿈 · 들어가기(엔터)는 맨 위 회사로 */
export function findBox(get) {
  let M = null, wait = null;
  const need = () => (M ? Promise.resolve(M) : (wait ??= Promise.resolve(get(FIND_URL)).catch(() => null).then(j => { M = j && j.companies ? j : null; wait = null; return M; })));
  const inp = h('input', {class: 'sj-findi', type: 'search', name: 'q', placeholder: '회사 이름이나 번호', 'aria-label': '회사 찾기 — 이름이나 번호', enterkeyhint: 'search', autocomplete: 'off', autocapitalize: 'off', spellcheck: 'false'});
  const list = h('ol', {class: 'sj-findl', 'aria-live': 'polite'});
  const note = h('p', {class: 'sj-findn', text: '코스피 · 코스닥 회사를 이름이나 번호로 찾아요. 한 글자부터 찾아요.'});
  const row = x => h('li', {class: 'sj-findr', 'data-code': x.code},
    h('a', {class: 'sj-finda', href: '#/c/' + x.code},
      h('b', {'data-proper': '', text: x.name}), h('span', {text: (x.ind ? x.ind + ' · ' : '') + x.code}), h('i', {'aria-hidden': 'true', text: '›'})));
  let ticket = 0;
  const run = async () => {
    const q = inp.value.trim(), my = ++ticket;
    if (!q) { list.replaceChildren(); note.textContent = '코스피 · 코스닥 회사를 이름이나 번호로 찾아요. 한 글자부터 찾아요.'; return; }
    const D = await need(); if (my !== ticket) return;
    if (!D) { list.replaceChildren(); note.textContent = '회사 목록을 받지 못했어요. 잠시 뒤 다시 써 주세요.'; return; }
    const hits = findCo(D, q);
    list.replaceChildren(...hits.map(row));
    note.textContent = hits.length ? '누르면 그 회사 쪽이 열려요.' : '「' + q + '」 — 찾는 회사가 없어요. 이름을 조금 다르게 써 보세요.';
  };
  inp.addEventListener('input', run);
  inp.addEventListener('focus', () => { need(); }, {once: true});
  const form = h('form', {class: 'sj-findf', role: 'search', 'aria-label': '회사 찾기'}, inp);
  form.addEventListener('submit', e => { e.preventDefault(); const a = list.querySelector('a.sj-finda'); if (a) location.hash = a.getAttribute('href'); else run(); });
  let go = false; try { go = sessionStorage.getItem('su-find') === '1'; if (go) sessionStorage.removeItem('su-find'); } catch { /* 저장소 없음 */ }
  if (go) { const t0 = Date.now(), tick = () => { if (inp.isConnected) { inp.scrollIntoView({block: 'center'}); inp.focus({preventScroll: true}); } else if (Date.now() - t0 < 4000) requestAnimationFrame(tick); }; requestAnimationFrame(tick); } // 맨 위 「찾기」로 왔으면 글 칸에 커서
  return h('section', {class: 'sj-sec sj-find', 'aria-label': '회사 찾기'},
    h('h2', {class: 'sj-h2'}, h('span', {class: 'sj-brush', text: '회사 찾기'})), form, note, list);
}
