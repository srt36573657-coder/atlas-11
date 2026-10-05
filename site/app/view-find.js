/* ATLAS 11 · 「찾기」(#/find · 아래 탭 다섯째) — 2026-10-05 20:24 사장님 「아틀란스에서 종목을 찾는 기능을 넣어라」
   어느 화면에서든 아래 탭 「찾기」 → 글자 하나만 넣어도 한국 판 · 미국 판 회사가 함께 나온다(셈은 site/app/find.js)
     · 한글 이름 일부 · 종목 기호(005930 · NVDA) · 초성(ㅅㅅㅈㅈ) · 미국 회사 영문 이름
     · 줄마다: 이름 · 태양 · 지난 20거래일 변화 · 시장(한국/미국) · 기호 · 업종 · 그 판의 오른 순 자리 → 누르면 그 회사 화면(다른 시장이면 그 판으로)
   넣으면서 뺀 것(규칙 1): 출목표 제목 줄의 작은 「찾기」 단추(출목표 365곳만 찾던 것) — 찾는 곳은 이 탭 하나
   ATLAS 는 고른 회사(한국 365 · 미국 365)만 본다 — 그 밖의 회사는 「없습니다」라고 적는다(지어내지 않음) */
import {h, pct, finite, signCls, place, korDate} from './util.js';
import {state, loadBoard, loadPlaceBoard, prefs} from './store.js';
import {foot, sunTag} from './parts.js';
import {sunOf} from './shapes.js';
import {findIn, stockHref, chosung} from './find.js';

const SHOW = 20, RECENT = 6;
let lastQuery = ''; // 회사 화면에 갔다 「‹ 찾기」로 돌아와도 넣은 글자 그대로(창을 닫으면 사라짐)

const findIcon = () => { const ns = 'http://www.w3.org/2000/svg', svg = document.createElementNS(ns, 'svg');
  for (const [k, v] of Object.entries({class: 'fd-ic', viewBox: '0 0 24 24', 'aria-hidden': 'true', focusable: 'false'})) svg.setAttribute(k, v);
  const c = document.createElementNS(ns, 'circle'); c.setAttribute('cx', '10.5'); c.setAttribute('cy', '10.5'); c.setAttribute('r', '6.5');
  const p = document.createElementNS(ns, 'path'); p.setAttribute('d', 'M15.4 15.4 20.5 20.5'); svg.append(c, p); return svg; };

/** 최근 찾은 회사(이 기기에만 · 두 판이 함께 · 여섯 곳까지) */
const recents = () => { const v = prefs.get('findRecent', []); return Array.isArray(v) ? v.filter(x => x && x.p && x.code).slice(0, RECENT) : []; };
const remember = hit => prefs.set('findRecent', [{p: hit.place.id, code: hit.c.code}, ...recents().filter(x => !(x.p === hit.place.id && x.code === hit.c.code))].slice(0, RECENT));

export async function renderFind(main, {manifest, restoring} = {}) {
  const board = await loadBoard();
  const here = {id: place.id, label: place.label, href: ''};
  const boards = [{place: here, companies: board.companies, here: true, sun: sunOf(board), asOf: board.asOf, close: place.close}], notes = [];
  for (const p of (state.places ?? []).filter(p => p.id !== place.id)) {
    try { const {board: b, manifest: m} = await loadPlaceBoard(p.href); boards.push({place: {id: p.id, label: p.label, href: p.href}, companies: b.companies, here: false, sun: sunOf(b), asOf: b.asOf, close: m.place?.close ?? '15:30'}); }
    catch (e) { notes.push(`${p.label} 판을 읽지 못해 ${here.label} 판만 찾습니다`); }
  }
  // 한국 판이 앞(사장님이 먼저 보시는 판) · 미국 판이 뒤 — 어느 판에서 열어도 같은 차례
  boards.sort((a, b) => (a.place.id === 'kr' ? 0 : 1) - (b.place.id === 'kr' ? 0 : 1));
  const N = boards.reduce((t, b) => t + b.companies.length, 0), scope = boards.map(b => `${b.place.label} ${b.companies.length}곳`).join(' · ');
  const sunOn = hit => !!boards.find(b => b.place.id === hit.place.id)?.sun.sparkle.has(hit.c.code);

  const input = h('input', {class: 'fd-in', id: 'fd-in', type: 'search', value: lastQuery, placeholder: '회사 이름 · 기호 · 초성', 'aria-label': '회사 이름 · 기호 · 초성으로 찾기', autocomplete: 'off', autocapitalize: 'off', spellcheck: 'false', enterkeyhint: 'search', 'aria-describedby': 'fd-msg'});
  const msg = h('p', {class: 'fd-msg', id: 'fd-msg', role: 'status', 'aria-live': 'polite'}), list = h('ul', {class: 'fd-list'}), recentBox = h('section', {class: 'fd-recent', 'aria-label': '최근 찾은 회사'});
  const row = hit => h('li', null, h('a', {class: 'fd-hit', href: stockHref(hit), 'data-code': hit.c.code, 'data-place': hit.place.id, onclick: () => remember(hit)},
    h('span', {class: 'fd-top'}, h('span', {class: 'fd-name'}, hit.c.name, sunTag(sunOn(hit))),
      h('b', {class: 'fd-chg chg20 ' + (signCls(hit.c.change20) || 'flat')}, finite(hit.c.change20) ? pct(hit.c.change20, 1) : '없음')),
    h('small', {class: 'fd-sub'}, h('span', {class: 'fd-mkt', 'data-place': hit.place.id}, hit.place.label), ' ', h('span', {'data-ident': ''}, hit.c.code), ` · ${hit.c.group?.label ?? '업종 모름'} · 오른 순 ${hit.rank}위`))); // 기호는 이름(식별자) — 우리 숫자가 아님
  let hits = [];
  // 아무것도 안 넣었을 때: 최근 찾은 회사(있으면) · 넣어 볼 보기 넷(실제 판의 첫 회사로 — 누르면 그 글자를 넣어 줌)
  const showRecent = () => {
    const rows = recents().map(r => { const b = boards.find(x => x.place.id === r.p), c = b?.companies.find(x => x.code === r.code); if (!c) return null;
      const rank = [...b.companies].sort((x, y) => (Number.isFinite(y.change20) ? y.change20 : -Infinity) - (Number.isFinite(x.change20) ? x.change20 : -Infinity) || String(x.code).localeCompare(String(y.code))).indexOf(c) + 1;
      return {c, place: b.place, here: b.here, score: 1, rank}; }).filter(Boolean);
    const kr = boards.find(b => b.place.id === 'kr')?.companies[0], us = boards.find(b => b.place.id === 'us')?.companies[0];
    const tries = [kr && [kr.name, kr.name], us && [us.name, us.name], kr && [chosung(kr.name), `${chosung(kr.name)} (초성)`], us && [us.code, `${us.code} (기호)`]].filter(Boolean);
    recentBox.replaceChildren(...[ // replaceChildren 은 null 을 「null」 글자로 넣는다 — 빈 것은 빼고 넣음
      rows.length ? h('h2', {class: 't-h2'}, '최근 찾은 회사', h('small', null, ` · ${rows.length}곳 · 이 기기에만`)) : null,
      rows.length ? h('ul', {class: 'fd-list'}, ...rows.map(row)) : null,
      h('p', {class: 'fd-try-h small muted'}, '이렇게 넣어 보세요'),
      h('div', {class: 'fd-try'}, ...tries.map(([q, label]) => h('button', {class: 'fd-try-b', type: 'button', onclick: () => { input.value = q; show(); input.focus(); }}, label)))].filter(Boolean));
  };
  const show = () => {
    const q = input.value.trim(); lastQuery = input.value;
    if (!q) { hits = []; list.replaceChildren(); msg.textContent = ''; recentBox.hidden = false; showRecent(); state.summary = `찾기. ${scope}에서 회사 이름, 기호, 초성으로 찾습니다.`; return; }
    recentBox.hidden = true;
    hits = findIn(boards, q);
    list.replaceChildren(...hits.slice(0, SHOW).map(row));
    msg.textContent = !hits.length ? `「${q}」에 맞는 회사가 ${scope} 안에 없습니다 · ATLAS 는 고른 ${N}곳만 봅니다`
      : hits.length > SHOW ? `${hits.length}곳 가운데 ${SHOW}곳 · 글자를 더 넣으면 좁혀짐` : `${hits.length}곳`;
    state.summary = hits.length ? `「${q}」 ${hits.length}곳. 첫째 ${hits[0].c.name}, ${hits[0].place.label}, 지난 20거래일 ${finite(hits[0].c.change20) ? pct(hits[0].c.change20, 1) : '없음'}.` : `「${q}」에 맞는 회사가 없습니다.`;
  };
  input.addEventListener('input', show);
  const form = h('form', {class: 'fd-form', role: 'search', 'aria-label': `회사 찾기 · ${scope}`, onsubmit: e => { e.preventDefault(); show(); if (hits[0]) { remember(hits[0]); location.href = stockHref(hits[0]); } }},
    h('span', {class: 'fd-label', 'aria-hidden': 'true'}, findIcon()), input); // 이름은 글 칸의 aria-label(숨긴 글자를 따로 두지 않음 — 큰 글씨에서 화면 밖 글자로 잡힘)

  main.replaceChildren(h('div', {class: 'b-page fd-page'},
    h('header', {class: 'b-head'},
      h('h1', {class: 'b-title', 'data-speak': ''}, '찾기 ', h('span', {class: 'b-count'}, `${N}곳`)),
      h('p', {class: 'b-when', 'data-speak': ''}, `${scope} · 이름 일부 · 종목 기호 · 초성(ㅅㅅㅈㅈ)`),
      // 줄마다 붙는 변화(%)의 기준 — 시장마다 마지막 종가 날짜 · 시각(또렷함 3번: 숫자에는 기준을)
      h('p', {class: 'i-src muted small'}, `지난 20거래일 변화 · ${boards.map(b => `${b.place.label} ${korDate(b.asOf)} ${b.close} 종가까지`).join(' · ')}`)),
    form, msg, list, recentBox,
    ...notes.map(t => h('p', {class: 'b-note'}, t)),
    h('p', {class: 't-key muted xs'}, '차례: 꼭 맞는 이름 · 기호가 먼저 · 같으면 지난 20거래일 많이 오른 순 · 누르면 그 회사 화면(다른 시장이면 그 판으로) · 「오른 순 n위」는 그 시장 365곳 가운데 자리'),
    foot(manifest)));
  show();
  if (!restoring) input.focus({preventScroll: true});
}
