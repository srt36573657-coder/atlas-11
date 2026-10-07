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
export function storyBox(st) {
  if (!st) return null;
  if (st.none) return noneBox(st);
  const n = st.now, nx = st.next, ms = n.stock?.markets ?? [];
  const started = nx.state === 'started', one = xs => evList((xs ?? []).slice(0, 1));
  const stage = h('section', {class: 'sy', 'aria-label': 'ATLAS가 고른 돈 이야기', 'data-chain': st.chain},
    h('p', {class: 'sy-k'}, h('span', null, 'ATLAS가 고른 돈 이야기'), h('span', {class: 'sy-kw'}, `${korDate(st.refDate)} 종가까지 · 다섯 시장 자료로`)),
    // ① 이 일이 생겼다
    h('div', {class: 'sy-s sy-s1'},
      h('p', {class: 'sy-t'}, '이 일이 생겼다'),
      h('p', {class: 'sy-main', 'data-speak': ''}, st.event.text),
      h('p', {class: 'sy-money'}, h('span', {class: 'sy-chip', 'data-kind': 'capex'}, st.event.money)),
      one(st.event.evidence)),
    // 선 — 옆에 까닭
    h('div', {class: 'sy-line', role: 'presentation'}, h('span', {class: 'sy-why', 'data-speak': ''}, st.why1)),
    // ② 그래서 여기가 돈을 받는다(지금 — 크고 선명하게)
    h('div', {class: 'sy-s sy-s2'},
      h('p', {class: 'sy-t'}, '그래서 여기가 돈을 받는다'),
      h('p', {class: 'sy-role', 'data-speak': ''}, n.role),
      h('p', {class: 'sy-does'}, n.does),
      h('p', {class: 'sy-changed', 'data-speak': ''}, n.changed),
      h('dl', {class: 'sy-m'},
        h('div', {class: 'sy-mr', 'data-kind': 'real'}, h('dt', null, '실제 돈'), h('dd', null, h('b', {class: 'sy-st'}, '확인됨'), one(n.real.evidence))),
        h('div', {class: 'sy-mr', 'data-kind': 'stock'}, h('dt', null, '주식 투자금'), h('dd', null, h('b', {class: 'sy-st'}, `${ms.length}개 시장에서 함께 들어옴`), marketsLine(ms), h('p', {class: 'sy-w'}, whenLine(st)))),
        n.hype?.evidence?.length ? h('div', {class: 'sy-mr', 'data-kind': 'hype'}, h('dt', null, ok('기대감')), h('dd', null, h('b', {class: 'sy-st'}, '있음 — 실제 돈과 따로 봄'), one(n.hype.evidence))) : null)),
    // 점선 — 옆에 까닭
    h('div', {class: 'sy-line sy-dash', role: 'presentation'}, h('span', {class: 'sy-why', 'data-speak': ''}, st.why2)),
    // ③ 다음은 여기가 필요하다(점선 · 예상)
    h('div', {class: 'sy-s sy-s3'},
      h('p', {class: 'sy-t'}, h('span', {'data-ident': ''}, '다음은 여기가 필요하다'), ' ', h('span', {class: 'sy-badge'}, ok('예상'))),
      h('p', {class: 'sy-role3', 'data-speak': ''}, nx.role),
      h('p', {class: 'sy-check'}, h('span', null, '확인할 것'), ': ', h('span', null, nx.check)), // 말을 바꿀 때 「 · 」로 먼저 잘리지 않게 두 칸
      h('p', {class: 'sy-state'}, started ? `이미 돈을 받기 시작함 · 확인 ${nx.evidence.length}건` : ok('수혜 기대')),
      one(nx.evidence)),
    // 아래 두 줄만
    h('div', {class: 'sy-if'},
      h('p', {'data-speak': ''}, h('b', null, '이것이 확인되면 이어집니다'), ': ', st.confirm),
      h('p', {'data-speak': ''}, h('b', null, '이것이 나타나면 다시 판단합니다'), ': ', st.rethink)));
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
