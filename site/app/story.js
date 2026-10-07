/* ATLAS 11 · 「오늘의 돈 이야기」 — 탭 「불장」(#/) 맨 위 세 장면
   사장님 2026-10-07 16:34 「아틀라스, 왕초보에게 시장을 해석시키지 마라. 네가 해석하고, 눈으로 이해되는 결과를 보여줘라 …
     [이 일이 생겼다] → [그래서 여기가 돈을 받는다] ⇢ [다음은 여기가 필요하다] · 선 위에는 이유 · 현재에는 확인된 근거 · 다음에는 반드시 확인 조건 ·
     회사 이름보다 하는 일 · 나라 이름보다 역할 · 현재만 크고 선명하게 · 다음은 점선과 '예상' · 기업 지출·주식 투자금·기대감은 구분 · 미확인이면 '수혜 기대' ·
     근거와 날짜 · 모르는 연결은 그리지 마라 · 아래에는 두 줄만 · 나머지 시장과 상세 자료는 아래에 · 누르거나 공부해야 하면 실패」 · 16:35 「지혜로운 답을 스스로 찾아서 하라」
   셈은 lib/atlas11/story.mjs(사이트를 쌀 때 /story.json 하나 — 다섯 판이 함께 읽음) · 이 파일은 그리기만
   앞날 말 검사에서 빼는 낱말은 사장님이 정하신 셋뿐(「예상」 · 「기대감」 · 「수혜 기대」) — 그 칸에만 data-pred-ok · 기사 제목 · 언론사 이름은 원문(lang="ko" · 식별자) */
import {h, korDate, pct, finite} from './util.js';

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
  re: '<path d="M4.6 12.2a7.4 7.4 0 1 0 2.2-5.3"/><path d="M4.6 4.4v4h4"/>', // 다시 판단(되돌아 봄)
};
const CHAIN_IDS = {'aidc-chip-power': ['aidc', 'chip', 'power'], 'aidc-power-gen': ['aidc', 'power', 'gen'], 'ships-ship-parts': ['ships', 'ship', 'shipParts'], 'arms-arms-care': ['arms', 'arms', 'armsCare'], 'oil-refine-tanker': ['oil', 'refine', 'tanker']}; // 옛 /story.json(id 없음)
const svg = key => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">${ICON[key] ?? ICON.dot}</svg>`;
const pic = (key, cls) => h('span', {class: cls, 'aria-hidden': 'true', html: svg(key)});
/** 동전 n개 — 선을 따라 흐름(장식 · 글자 없음) */
const coins = n => Array.from({length: n}, () => h('i', {class: 'sy-coin'}));
/** 한눈 그림 — 그림 셋 · 선 둘(앞 선 = 실선 · 동전 셋 / 뒤 선 = 점선 · 흐린 동전 둘) */
const glance = ids => h('div', {class: 'sy-map', 'aria-hidden': 'true'},
  pic('e:' + ids[0], 'sy-mn sy-mn1'), h('span', {class: 'sy-tr'}, ...coins(3)),
  pic('r:' + ids[1], 'sy-mn sy-mn2'), h('span', {class: 'sy-tr sy-tr-d'}, ...coins(2)),
  pic('r:' + ids[2], 'sy-mn sy-mn3'));
/** 돈길 왼쪽 칸 — 장면이면 그림 동그라미 + 아래로 이어지는 줄 · 장면 사이면 줄만(동전이 흐름) */
const rail = (key, end = false) => h('span', {class: 'sy-rail', 'aria-hidden': 'true'}, key ? pic(key, 'sy-node') : null, end ? null : h('span', {class: 'sy-rl'}, ...(key ? [] : coins(3))));
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
    glance(ids), // 한눈 그림(글자 없음) — 일 → 돈 받는 곳 ⇢ 다음
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

/** 소리로 듣기 한 줄 */
export const storySay = st => !st ? '' : st.none ? 'ATLAS가 고른 돈 이야기. 근거가 뚜렷한 돈 이야기가 없는 날입니다. '
  : `ATLAS가 고른 돈 이야기. ${st.event.text}. 그래서 ${st.now.role}가 돈을 받습니다. ${st.now.changed}. 다음은 ${st.next.role}가 필요할 것으로 봅니다. 확인할 것: ${st.next.check}. `;
