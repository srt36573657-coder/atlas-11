/* ATLAS 11 · 「오늘의 돈 이야기」 — 탭 「불장」(#/) 맨 위 세 장면
   사장님 2026-10-07 16:34 「아틀라스, 왕초보에게 시장을 해석시키지 마라. 네가 해석하고, 눈으로 이해되는 결과를 보여줘라 …
     [이 일이 생겼다] → [그래서 여기가 돈을 받는다] ⇢ [다음은 여기가 필요하다] · 선 위에는 이유 · 현재에는 확인된 근거 · 다음에는 반드시 확인 조건 ·
     회사 이름보다 하는 일 · 나라 이름보다 역할 · 현재만 크고 선명하게 · 다음은 점선과 '예상' · 기업 지출·주식 투자금·기대감은 구분 · 미확인이면 '수혜 기대' ·
     근거와 날짜 · 모르는 연결은 그리지 마라 · 아래에는 두 줄만 · 나머지 시장과 상세 자료는 아래에 · 누르거나 공부해야 하면 실패」 · 16:35 「지혜로운 답을 스스로 찾아서 하라」
   셈은 lib/atlas11/story.mjs(사이트를 쌀 때 /story.json 하나 — 다섯 판이 함께 읽음) · 이 파일은 그리기만
   앞날 말 검사에서 빼는 낱말은 사장님이 정하신 셋뿐(「예상」 · 「기대감」 · 「수혜 기대」) — 그 칸에만 data-pred-ok · 기사 제목 · 언론사 이름은 원문(lang="ko" · 식별자) */
import {h, korDate, pct, finite} from './util.js';
import {t as tr, LOCALE, LANG} from './i18n.js'; // 짚어 주기 소리 — 그 말로 읽음(언어판)
import {hold, release, idleIn} from './motion.js'; // 한 번에 하나 — 짚어 주기가 도는 동안 다른 그림은 기다림

let cache = null;
/** /story.json — 사이트 맨 위 한 파일(한국 · 미국 · 중국 · 일본 · 베트남 판이 함께) · 못 읽으면 null(화면은 옛 논평 무대로) */
export function loadStory() {
  if (!cache) cache = fetch('/story.json', {cache: 'no-cache'}).then(r => (r.ok ? r.json() : null)).then(j => (j?.schema === 'atlas11-story-1' ? j : null)).catch(() => null);
  return cache;
}

const PLACE = {kr: '한국', us: '미국', cn: '중국', jp: '일본', vn: '베트남'};
const KIND = {real: '실제 돈', capex: '기업 지출', stock: '주식 투자금', hype: '기대감', report: '보도'};
const ok = s => h('span', {'data-pred-ok': ''}, s); // 사장님이 정하신 낱말 셋(예상 · 기대감 · 수혜 기대)만 — 앞날 말 검사에서 뺌
/** 근거 한 줄 — 날짜 · 갈래 · 언론사 · 「기사 제목」(원문 · 누르면 기사) */
const evLine = e => h('li', {class: 'sy-e', 'data-kind': e.kind},
  h('span', {class: 'sy-ed'}, korDate(e.date)),
  h('span', {class: 'sy-ek', 'data-kind': e.kind}, e.kind === 'hype' ? ok(KIND.hype) : KIND[e.kind] ?? '보도'),
  e.office ? h('span', {class: 'sy-eo', lang: 'ko', 'data-ident': ''}, e.office) : null,
  e.url ? h('a', {class: 'sy-et', href: e.url, target: '_blank', rel: 'noopener noreferrer', lang: 'ko', 'data-ident': ''}, `「${e.title}」`) : h('span', {class: 'sy-et', lang: 'ko', 'data-ident': ''}, `「${e.title}」`));
const evList = xs => xs?.length ? h('ul', {class: 'sy-ev'}, ...xs.map(evLine)) : null;
/** 주식 투자금 — 시장마다 그 역할 업종 · 지난 20거래일 변화(작은 글) */
const marketsLine = ms => h('ul', {class: 'sy-mk'}, ...ms.map(m => h('li', {class: 'sy-mkt', 'data-place': m.place},
  h('span', {class: 'sy-mp'}, PLACE[m.place] ?? m.place), ' ', h('span', null, m.label), ' ', h('b', {class: 'chg20 ' + (m.change20 > 0 ? 'up' : 'down')}, finite(m.change20) ? pct(m.change20, 0) : '없음'))));
const whenLine = st => `지난 20거래일 · ${korDate(st.refDate)} 종가까지`;

/* ── 움직이는 도식(2026-10-07 18:27 사장님 「지금 글로 되어 있다 움직이는 도식화로 만들어라」 · 18:31 「과감하게 알틀란스를 전면 혁신하라 섹시하게 스마트 하게」) ──
   · 무대 맨 위 「한눈 그림」: 그림 셋이 선으로 이어지고 그 선을 따라 돈(금빛 동전)이 흐른다 — 일 → 돈 받는 곳(크고 빛남) ⇢ 다음(점선 · 흐린 동전 · 느리게)
   · 그 아래 「돈길」: 왼쪽 세로 줄 위에 같은 그림 셋(역 · 정류장처럼) · 줄을 따라 동전이 내려감 · 글은 오른쪽(읽는 사람은 줄을 따라 내려가며 읽음)
   · 가운데 장면: 빛나는 큰 동그라미(숨 쉬듯 퍼지는 테 둘) · 실제 돈 ✓가 그려짐 · 주식 투자금은 시장마다 막대가 자람(길이 = 지난 20거래일 변화)
   · 그림에는 글자가 없다(화면 읽기 프로그램은 옆 글을 읽음) · 처음 그릴 때 한 번 차례로 등장(app.js data-drawn) · 동전은 계속 흐름 · 움직임 줄이기 설정이면 모두 멈춘 그림
   · 그림 이름(아래 ICON)은 판의 역할 · 일 id(lib/atlas11/story.mjs) — 모르는 id 는 동그라미 하나(지어내지 않음) */
const ICON = {
  'e:aidc': '<rect x="4" y="3.5" width="16" height="7" rx="1.6"/><rect x="4" y="13.5" width="16" height="7" rx="1.6"/><path d="M7.5 7h.01M7.5 17h.01M11 7h5.5M11 17h5.5"/>', // 데이터센터(서버 두 칸)
  'e:ships': '<rect x="5.5" y="3.5" width="13" height="17" rx="2"/><path d="M9 8h6M9 12h6M9 16h3.5"/>', // 주문서
  'e:arms': '<path d="M3.5 9.5 12 4l8.5 5.5"/><path d="M5.8 9.8v7.7M9.9 9.8v7.7M14.1 9.8v7.7M18.2 9.8v7.7"/><path d="M3.5 20.2h17"/>', // 나라(기둥 건물)
  'e:oil': '<path d="M12 3.5c3.4 4.3 5.6 7.4 5.6 10.3a5.6 5.6 0 0 1-11.2 0c0-2.9 2.2-6 5.6-10.3z"/><path d="M9.4 14.6a2.7 2.7 0 0 0 2.4 2.5"/>', // 기름 방울
  'r:chip': '<rect x="6.5" y="6.5" width="11" height="11" rx="1.8"/><rect x="9.6" y="9.6" width="4.8" height="4.8" rx=".8"/><path d="M9.5 3v3.5M14.5 3v3.5M9.5 17.5V21M14.5 17.5V21M3 9.5h3.5M3 14.5h3.5M17.5 9.5H21M17.5 14.5H21"/>', // 칩
  'r:power': '<path d="M13.2 2.8 5.8 13.4h5.6l-1 7.8 7.6-10.9h-5.7z"/>', // 번개(전기를 보냄)
  'r:gen': '<path d="M3.5 20.5V12l5 3v-3l5 3V6.5h4l1.5 14z"/><path d="M3 20.5h18"/>', // 발전소
  'r:ship': '<path d="M3.5 14.5h17l-2.2 5H5.7z"/><path d="M6.5 14.5v-4h11v4"/><path d="M12 10.5V5.5M9.5 7.5h5"/>', // 배
  'r:shipParts': '<circle cx="12" cy="12" r="2.6"/><circle cx="12" cy="12" r="6.2"/><path d="M12 3.5v2.3M12 18.2v2.3M3.5 12h2.3M18.2 12h2.3M6 6l1.6 1.6M16.4 16.4 18 18M6 18l1.6-1.6M16.4 7.6 18 6"/>', // 톱니(엔진 · 기계)
  'r:arms': '<path d="M12 3.2 19 6v5.6c0 4.3-2.9 7.7-7 9.2-4.1-1.5-7-4.9-7-9.2V6z"/>', // 방패
  'r:armsCare': '<path d="M14.7 6.3a4 4 0 0 0-5.4 5.1l-5.6 5.6a1.8 1.8 0 0 0 2.5 2.5l5.6-5.6a4 4 0 0 0 5.1-5.4l-2.4 2.4-2.2-.5-.5-2.2z"/>', // 렌치(고침)
  'r:refine': '<path d="M8 20.5V7.5a2.5 2.5 0 0 1 5 0v13"/><path d="M13 12h4.5v8.5"/><path d="M4 20.5h16"/><path d="M8 11h5M8 15h5"/>', // 정제 탑
  'r:tanker': '<path d="M3 15h18l-2.4 5H5.4z"/><path d="M6 15v-2.5h12V15"/><path d="M8 12.5c0-1.4 1.8-2.5 4-2.5s4 1.1 4 2.5"/>', // 기름 배
  dot: '<circle cx="12" cy="12" r="5"/>',
  ok: '<path class="sy-okp" d="M5 12.5l4.2 4.2L19 7"/>', // ✓ 그려짐
  on: '<path d="M12 4.5v13"/><path d="M6.8 12.6 12 17.8l5.2-5.2"/>', // 이어짐(아래로)
  re: '<path d="M4.6 12.2a7.4 7.4 0 1 0 2.2-5.3"/><path d="M4.6 4.4v4h4"/>', // 다시 판단(되돌아 봄) · 다시 보기
  say: '<path d="M11 5 6 9H3v6h3l5 4z"/><path d="M15.5 8.5a5 5 0 0 1 0 7"/><path d="M18.5 5.5a9 9 0 0 1 0 13"/>', // 소리로 듣기(위 막대 소리 단추와 같은 그림)
};
const CHAIN_IDS = {'aidc-chip-power': ['aidc', 'chip', 'power'], 'aidc-power-gen': ['aidc', 'power', 'gen'], 'ships-ship-parts': ['ships', 'ship', 'shipParts'], 'arms-arms-care': ['arms', 'arms', 'armsCare'], 'oil-refine-tanker': ['oil', 'refine', 'tanker']}; // 옛 /story.json(id 없음)
const svg = key => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">${ICON[key] ?? ICON.dot}</svg>`;
const pic = (key, cls) => h('span', {class: cls, 'aria-hidden': 'true', html: svg(key)});
/** 동전 n개 — 선을 따라 흐름(장식 · 글자 없음) */
/** 한눈 그림 — 그림 셋 · 줄 둘(앞 줄 = 실선 · 뒤 줄 = 점선) · 줄마다 동전 하나(그 걸음에서 한 번 지나감)
   data-at = 그 그림이 움직이는 걸음 번호(아래 STEPS) — 짚어 주기가 그 걸음에서 「지금」으로 밝힘 · 앞 걸음은 켜진 채 · 뒤 걸음은 흐리게 */
const glance = ids => h('div', {class: 'sy-map', 'aria-hidden': 'true'},
  at(pic('e:' + ids[0], 'sy-mn sy-mn1'), 1), at(h('span', {class: 'sy-tr'}, h('i', {class: 'sy-coin'})), 2),
  at(pic('r:' + ids[1], 'sy-mn sy-mn2'), 0), at(h('span', {class: 'sy-tr sy-tr-d'}, h('i', {class: 'sy-coin'})), 4), // 가운데(돈 받는 곳)가 걸음 0 — 기: 결론 먼저(2026-10-07 20:04)
  at(pic('r:' + ids[2], 'sy-mn sy-mn3'), 5));
function at(el, k) { el.dataset.at = String(k); return el; }
/** 돈길 왼쪽 칸 — 장면이면 그림 동그라미 + 아래로 이어지는 줄 · 장면 사이면 줄만(동전이 흐름) */
const rail = (key, end = false) => h('span', {class: 'sy-rail', 'aria-hidden': 'true'}, key ? pic(key, 'sy-node') : null, end ? null : h('span', {class: 'sy-rl'})); // 돈길은 멈춘 그림(움직이는 것은 맨 위 짚어 주기 하나 — 2026-10-07 19:40 「동시에 움직이게 하지 말고」)
/** 주식 투자금 — 시장마다 막대(길이 = 지난 20거래일 변화 ÷ 가장 큰 변화) · 시장 이름 · 업종 · 변화 글은 그대로 */
function barsLine(ms) {
  const top = Math.max(1e-9, ...ms.map(m => (finite(m.change20) ? Math.abs(m.change20) : 0)));
  return h('ul', {class: 'sy-mk sy-mb'}, ...ms.map((m, i) => {
    const fill = h('i', {class: 'sy-bf'}); fill.style.setProperty('--k', (finite(m.change20) ? Math.max(0.04, Math.abs(m.change20) / top) : 0.04).toFixed(3)); fill.style.setProperty('--i', String(i)); // 길이 · 차례만 CSSOM(글 속 style 속성 없음)
    return h('li', {class: 'sy-mkt', 'data-place': m.place},
      h('span', {class: 'sy-ml'}, h('span', {class: 'sy-mp'}, PLACE[m.place] ?? m.place), ' ', h('span', null, m.label)),
      h('b', {class: 'chg20 ' + (m.change20 > 0 ? 'up' : 'down')}, finite(m.change20) ? pct(m.change20, 0) : '없음'),
      h('span', {class: 'sy-bar', 'aria-hidden': 'true'}, fill));
  }));
}

/** 근거가 뚜렷한 이야기가 없는 날 — 지어내지 않고 그렇다고 적음 */
function noneBox(st) {
  return h('section', {class: 'sy sy-none', 'aria-label': 'ATLAS가 고른 돈 이야기'},
    h('p', {class: 'sy-k'}, 'ATLAS가 고른 돈 이야기'),
    h('p', {class: 'sy-role', 'data-speak': ''}, '근거가 뚜렷한 돈 이야기가 없는 날입니다'),
    st.stockOnly?.length ? h('p', {class: 'sy-does'}, '주식 투자금만 보이는 곳 — 실제 돈 근거는 아직 못 찾음') : null,
    st.stockOnly?.length ? marketsLine(st.stockOnly) : null);
}

/** 세 장면 + 아래 두 줄(무대 안은 이것만) · 무대 밑에 나머지 시장 · 근거 모음(사장님 「아래에는 두 줄만 남겨라 · 나머지 시장과 상세 자료는 아래에 둬라」)
   장면마다 근거는 가장 굳은 한 줄만(실제 돈 > 기업 지출 > 보도 · 사상 최대 · 몇 배 · 급증이 먼저) — 나머지는 무대 밑 「근거 모음」 */
/* ── 첫 화면 한 장 — 기승전결 네 줄(2026-10-07 20:52 사장님 휴대폰 사진과 함께 「한 화면에 메인 정보가 나와야 한다 개선해」) ──
   앞 판(19:40 「하나하나 움직이게 · 바보도 알 수 있게」 · 20:04 「기승전결」)은 글상자 하나에 걸음 하나만 보여 나머지가 숨었다 → 네 줄을 한 화면에 늘 보이게:
   · 기(결론) 돈이 가는 곳 — 이름(크게) / 승(까닭) 일 한 줄 + ✓ 실제 돈 확인됨 · 날짜 / 전(더 넓게) 다음은 여기가 필요하다 · 예상 + 이름 / 결(볼 것) 이것만 보면 됩니다 + 볼 것
   · 맨 위 한눈 그림(그림 셋 · 줄 둘)은 그대로 · 아이폰 사파리 첫 화면(위 막대와 아래 탭 사이 약 520px)에 한눈 그림과 네 줄이 다 들어가게(검사기가 390×640 에서 잼)
   · 움직임은 한 번에 하나(19:40): 지금 줄만 옥빛 테 · 그 줄의 그림 하나씩(가운데 켜짐 → 일 켜짐 → 줄 · 동전 → ✓ → 점선 · 동전 → 다음 켜짐 → ↓) · 앞 것이 끝나야 다음
   · 글은 늘 보임(흐려졌다 나타나지 않음) · 처음 열면 저절로 한 번 → 결 줄에 멈춤(가운데 그림의 테만 숨 쉼) · 「다시 보기」 · 「소리로 듣기」(줄마다 말이 끝나야 다음 줄)
   · 무대가 화면 밖이면 멈추고 돌아오면 이어서 · 움직임 줄이기 설정이면 처음부터 끝 모습 · 도는 동안 아래 그림은 기다림(motion.js hold)
   · 뺀 것(규칙 1): 글상자 하나 · 이름표 단추 넷(줄 넷이 그 일을 함) · 걸음 「주식 투자금 막대」 · 「다시 판단」은 아래 돈길(세 장면 · 두 줄)에 그대로 */
const CH = [['기', '결론'], ['승', '까닭'], ['전', '더 넓게'], ['결', '볼 것']]; // 줄 이름 — 한국어 글자(기승전결)는 한국어 화면에만 · 다른 말은 차례 숫자(CSS)
/** 네 줄 — 줄마다 이름(작게) · 큰 말 한 줄 · 덧붙임 */
function rowsOf(st) {
  const n = st.now, nx = st.next, r = n.real?.evidence?.[0];
  return [
    {lab: ['돈이 가는 곳'], main: n.role, big: true},
    {lab: [], main: st.event.short ?? st.event.text, ok: r ? korDate(r.date) : ''},
    {lab: ['다음은 여기가 필요하다'], badge: true, main: nx.role},
    {lab: ['이것만 보면 됩니다'], main: st.confirm, icon: 'on'},
  ];
}
/** 걸음 일곱 — 줄(c) · 움직이는 그림(at) · 머무는 시간(ms): 줄이 바뀌는 걸음은 그 줄을 읽을 시간까지 */
const read = x => Math.max(2200, Math.min(5200, 1100 + [CH[x.c][1], ...x.lab, x.main].join('').length * 70));
function stepsOf(rows) {
  const R = rows.map((x, c) => ({...x, c}));
  return [{c: 0, at: 0, ms: read(R[0])}, {c: 1, at: 1, ms: 900}, {c: 1, at: 2, ms: 1750}, {c: 1, at: 3, ms: Math.max(900, read(R[1]) - 2650)},
    {c: 2, at: 4, ms: 2250}, {c: 2, at: 5, ms: Math.max(900, read(R[2]) - 2250)}, {c: 3, at: 6, ms: read(R[3])}];
}
function rowEl(x, c) {
  const lab = [h('span', {class: 'sy-rmn'}, CH[c][1]), ...x.lab.flatMap(t => [' · ', c === 2 ? h('span', {'data-ident': ''}, t) : h('span', null, t)]), x.badge ? [' ', h('span', {class: 'sy-badge'}, ok('예상'))] : null];
  return h('div', {class: 'sy-row', 'data-c': String(c)},
    h('span', {class: 'sy-rb', 'aria-hidden': 'true'}, h('span', {class: 'sy-chl', lang: 'ko', 'data-ident': ''}, CH[c][0])),
    h('div', {class: 'sy-rc'},
      h('p', {class: 'sy-rl2'}, ...lab.flat().filter(Boolean)),
      h('p', {class: 'sy-rm' + (x.big ? ' sy-rm-big' : '')}, x.icon ? at(pic(x.icon, 'sy-ifi sy-ri'), 6) : null, h('span', {'data-speak': ''}, x.main)),
      x.ok ? h('p', {class: 'sy-rs'}, at(pic('ok', 'sy-ok sy-ri'), 3), h('span', null, '실제 돈'), ' ', h('span', null, '확인됨'), ' · ', h('span', null, x.ok)) : null));
}
function player(st, ids, fresh) {
  const rows = rowsOf(st), steps = stepsOf(rows), map = glance(ids);
  const rowEls = rows.map(rowEl);
  const box = h('div', {class: 'sy-play'}, map, h('div', {class: 'sy-rows'}, ...rowEls),
    h('div', {class: 'sy-ctl'},
      h('button', {type: 'button', class: 'sy-btn', onclick: () => run(false)}, pic('re', 'sy-bi'), h('span', null, '다시 보기')),
      h('button', {type: 'button', class: 'sy-btn', onclick: () => run(true)}, pic('say', 'sy-bi'), h('span', null, '소리로 듣기'))));
  const parts = [...box.querySelectorAll('[data-at]')];
  let cur = -1, tick = 0, token = 0, voice = false, seen = true, waiting = null;
  /** 걸음 i — 앞 걸음 그림은 켜짐(on) · i 걸음 그림만 한 번 움직임(now) · 지금 줄만 옥빛 테(now) · 앞 줄은 켜짐 */
  function paint(i, again = false) {
    cur = i; const c = steps[i].c; box.dataset.step = String(i); box.dataset.c = String(c); box.classList.remove('sy-done');
    for (const el of parts) { const k = Number(el.dataset.at); el.classList.toggle('on', k <= steps[i].at); const now = k === steps[i].at; if (now && again) { el.classList.remove('now'); void el.offsetWidth; } el.classList.toggle('now', now); }
    rowEls.forEach((r, k) => { r.classList.toggle('now', k === c); r.classList.toggle('on', k < c); });
  }
  function done() { stop(); if (cur !== steps.length - 1) paint(steps.length - 1); for (const el of parts) { el.classList.add('on'); el.classList.remove('now'); } box.classList.add('sy-done'); }
  function stop() { token++; clearTimeout(tick); waiting = null; if (voice) { try { window.speechSynthesis?.cancel(); } catch {} } voice = false; release(box); }
  function say(x, c, then) {
    try { const ss = window.speechSynthesis; if (!ss || typeof SpeechSynthesisUtterance !== 'function') return false;
      const u = new SpeechSynthesisUtterance([CH[c][1], ...x.lab, x.main].filter(Boolean).map(v => tr(v)).join('. ')); u.lang = LOCALE; u.rate = 0.9; u.pitch = 1; u.volume = 0.96;
      const v = ss.getVoices().find(z => z.lang && z.lang.startsWith(LANG)); if (v) u.voice = v; let fin = false; u.onend = u.onerror = () => { if (!fin) { fin = true; then(); } }; ss.speak(u); return true; } catch { return false; }
  }
  /** 처음부터 — 걸음마다 그림 하나가 움직이고 머무는 시간이 지나면 다음 걸음 · 소리와 함께면 줄을 읽는 말이 끝나야 다음 줄 */
  function run(withVoice) {
    stop(); const my = token; voice = withVoice; let i = 0, talking = false, after = null; hold(box);
    if (withVoice) { try { window.speechSynthesis?.cancel(); } catch {} }
    const next = () => {
      if (my !== token) return;
      if (!box.isConnected) { stop(); return; }
      if (i >= steps.length) { if (talking) { after = next; return; } done(); return; }
      if (!seen && !voice) { waiting = next; release(box); return; } // 화면 밖이면 멈춤 — 돌아오면 이어서
      const x = steps[i];
      if (voice && talking && (i === 0 || steps[i - 1].c !== x.c)) { after = next; return; } // 앞 줄 말이 끝나야 다음 줄
      hold(box); paint(i++, true);
      if (voice && (i === 1 || steps[i - 2].c !== x.c)) { talking = say(rows[x.c], x.c, () => { talking = false; if (my === token && after) { const f = after; after = null; tick = setTimeout(f, 380); } }); }
      tick = setTimeout(next, x.ms);
    };
    next();
  }
  if (typeof IntersectionObserver === 'function') new IntersectionObserver(es => { for (const e of es) { seen = e.isIntersecting; if (seen && waiting) { const w = waiting; waiting = null; tick = setTimeout(w, idleIn() + 60); } } }, {threshold: 0.35}).observe(map); // 돌아오면 다른 그림이 다 움직인 뒤 이어서
  const calm = typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (fresh && !calm) { paint(0); for (const el of parts) el.classList.remove('on', 'now'); rowEls.forEach(r => r.classList.remove('now', 'on')); setTimeout(() => { if (box.isConnected && cur <= 0) run(false); }, 350); }
  else done();
  return box;
}

let played = false; // 등장 움직임은 이 창에서 처음 그릴 때 한 번(글씨 단추 · 탭을 오가며 다시 그리면 멈춘 그림 — app.js 「화면마다 처음 한 번만」과 같은 뜻)
export function storyBox(st) {
  if (!st) return null;
  if (st.none) return noneBox(st);
  const n = st.now, nx = st.next, ms = n.stock?.markets ?? [];
  const started = nx.state === 'started', one = xs => evList((xs ?? []).slice(0, 1));
  const ids = [st.event.id, n.id, nx.id].every(Boolean) ? [st.event.id, n.id, nx.id] : CHAIN_IDS[st.chain] ?? ['dot', 'dot', 'dot'];
  const fresh = !played; played = true;
  const stage = h('section', {class: 'sy' + (fresh ? ' sy-in' : ''), 'aria-label': 'ATLAS가 고른 돈 이야기', 'data-chain': st.chain, 'data-next': nx.state},
    h('p', {class: 'sy-k'}, h('span', null, 'ATLAS가 고른 돈 이야기'), h('span', {class: 'sy-kw'}, `${korDate(st.refDate)} 종가까지 · 다섯 시장 자료로`)),
    player(st, ids, fresh), // 한눈 그림 + 글상자 — 한 걸음씩 짚어 주기(2026-10-07 19:40)
    // ① 이 일이 생겼다
    h('div', {class: 'sy-s sy-s1'}, rail('e:' + ids[0]),
      h('div', {class: 'sy-c'},
        h('p', {class: 'sy-t'}, '이 일이 생겼다'),
        h('p', {class: 'sy-main', 'data-speak': ''}, st.event.text),
        h('p', {class: 'sy-money'}, h('span', {class: 'sy-chip', 'data-kind': 'capex'}, st.event.money)),
        one(st.event.evidence))),
    // 줄 — 동전이 흐름 · 옆에 까닭
    h('div', {class: 'sy-line', role: 'presentation'}, rail(null), h('div', {class: 'sy-c'}, h('span', {class: 'sy-why', 'data-speak': ''}, st.why1))),
    // ② 그래서 여기가 돈을 받는다(지금 — 크고 선명하게 · 빛나는 동그라미)
    h('div', {class: 'sy-s sy-s2'}, rail('r:' + ids[1]),
      h('div', {class: 'sy-c'},
        h('p', {class: 'sy-t'}, '그래서 여기가 돈을 받는다'),
        h('p', {class: 'sy-role', 'data-speak': ''}, n.role),
        h('p', {class: 'sy-does'}, n.does),
        h('p', {class: 'sy-changed', 'data-speak': ''}, n.changed),
        h('dl', {class: 'sy-m'},
          h('div', {class: 'sy-mr', 'data-kind': 'real'}, h('dt', null, '실제 돈'), h('dd', null, h('b', {class: 'sy-st'}, pic('ok', 'sy-ok'), '확인됨'), one(n.real.evidence))),
          h('div', {class: 'sy-mr', 'data-kind': 'stock'}, h('dt', null, '주식 투자금'), h('dd', null, h('b', {class: 'sy-st'}, `${ms.length}개 시장에서 함께 들어옴`), barsLine(ms), h('p', {class: 'sy-w'}, whenLine(st)))),
          n.hype?.evidence?.length ? h('div', {class: 'sy-mr', 'data-kind': 'hype'}, h('dt', null, ok('기대감')), h('dd', null, h('b', {class: 'sy-st'}, '있음 — 실제 돈과 따로 봄'), one(n.hype.evidence))) : null))),
    // 점선 — 흐린 동전이 느리게 · 옆에 까닭
    h('div', {class: 'sy-line sy-dash', role: 'presentation'}, rail(null), h('div', {class: 'sy-c'}, h('span', {class: 'sy-why', 'data-speak': ''}, st.why2))),
    // ③ 다음은 여기가 필요하다(점선 동그라미 · 점선 칸 · 예상)
    h('div', {class: 'sy-s sy-s3'}, rail('r:' + ids[2], true),
      h('div', {class: 'sy-c'},
        h('p', {class: 'sy-t'}, h('span', {'data-ident': ''}, '다음은 여기가 필요하다'), ' ', h('span', {class: 'sy-badge'}, ok('예상'))),
        h('p', {class: 'sy-role3', 'data-speak': ''}, nx.role),
        h('p', {class: 'sy-check'}, h('span', null, '확인할 것'), ': ', h('span', null, nx.check)), // 말을 바꿀 때 「 · 」로 먼저 잘리지 않게 두 칸
        h('p', {class: 'sy-state'}, started ? `이미 돈을 받기 시작함 · 확인 ${nx.evidence.length}건` : ok('수혜 기대')),
        one(nx.evidence))),
    // 아래 두 줄만 — 그림 하나씩(↓ 이어짐 · ↺ 다시 판단)
    h('div', {class: 'sy-if'},
      h('p', {'data-speak': '', 'data-if': 'on'}, pic('on', 'sy-ifi'), h('span', null, h('b', null, '이것이 확인되면 이어집니다'), ': ', st.confirm)),
      h('p', {'data-speak': '', 'data-if': 're'}, pic('re', 'sy-ifi'), h('span', null, h('b', null, '이것이 나타나면 다시 판단합니다'), ': ', st.rethink))));
  // 무대 밑 — 나머지 시장 · 근거 모음(작게)
  const seen = new Set(), all = [...(st.event.evidence ?? []), ...(n.real.evidence ?? []), ...(n.stock?.evidence ?? []), ...(n.hype?.evidence ?? []), ...(nx.evidence ?? [])].filter(e => { const k = e.url ?? e.title; if (seen.has(k)) return false; seen.add(k); return true; });
  const more = h('section', {class: 'sy-more', 'aria-label': '나머지 시장 · 근거 모음'},
    st.others?.length ? h('p', {class: 'sy-oh'}, '다른 시장의 1위 업종 — 주식 투자금만 보임 · 실제 돈 근거는 이 이야기에 넣지 않음') : null,
    st.others?.length ? marketsLine(st.others) : null,
    nx.markets?.length ? h('p', {class: 'sy-oh'}, '점선 장면 쪽 주식 투자금') : null,
    nx.markets?.length ? marketsLine(nx.markets) : null,
    h('p', {class: 'sy-oh'}, `근거 모음 ${all.length}건 — 기사 제목은 원문 그대로 · 누르면 기사`),
    evList(all));
  return [stage, more];
}

/** 탭 「불장」 맨 아래 「결」(2026-10-07 20:04 사장님 「아틀라스가 기승전결이 매우 부족해 개선한다」) — 다 내려 본 사람에게 결론을 한 번 더:
   볼 것 하나(확인되면 이어짐) + 돈이 가는 곳 + 그 까닭의 근거(실제 돈 확인 날짜) — 첫 화면(기 · 결론)과 마지막(결 · 볼 것)이 같은 어둠 무대로 맞물림 */
export function storyEnd(st) {
  if (!st || st.none) return null;
  const r = st.now.real?.evidence?.[0];
  return h('section', {class: 'sy-end', 'aria-label': '이것만 보면 됩니다'},
    h('p', {class: 'sy-end-k'}, h('span', {class: 'sy-chl', lang: 'ko', 'data-ident': '', 'aria-hidden': 'true'}, '결'), h('span', null, '볼 것')),
    h('p', {class: 'sy-end-t', 'data-speak': ''}, '이것만 보면 됩니다'),
    h('p', {class: 'sy-end-m', 'data-speak': ''}, pic('on', 'sy-ifi'), h('span', null, st.confirm)),
    h('p', {class: 'sy-end-s'}, h('span', null, '돈이 가는 곳'), ': ', h('b', null, st.now.role)),
    r ? h('p', {class: 'sy-end-s'}, h('span', null, '실제 돈'), ' ', h('span', null, '확인됨'), ' · ', h('span', null, korDate(r.date))) : null);
}

/** 소리로 듣기 한 줄 */
export const storySay = st => !st ? '' : st.none ? 'ATLAS가 고른 돈 이야기. 근거가 뚜렷한 돈 이야기가 없는 날입니다. '
  : `ATLAS가 고른 돈 이야기. ${st.event.text}. 그래서 ${st.now.role}가 돈을 받습니다. ${st.now.changed}. 다음은 ${st.next.role}가 필요할 것으로 봅니다. 확인할 것: ${st.next.check}. `;
