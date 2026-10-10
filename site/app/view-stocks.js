/* ATLAS 11 · 아래 탭 「종목」(#/stocks) — 「ATLAS 개편 실행 지시서」(사장님 2026-10-08 20:19 마카오 시각 첨부) 7
   찾기 · 정렬 · 거르기 · 전체 목록을 한 화면에 — 옛 탭 「찾기」(#/find 는 이 화면으로) · 출목표 · 예비 · 오름 상위는 위 「보기 바꾸기」
   기본 묶음(실험 규칙 · 앞 저녁 기록과 견줌): 새로 발견 · 근거 강화 · 근거 약화 · 전체 비교
     · 반복 조건 충족과 새 정보를 나눔(「목록에 새로 듦」 ↔ 「새 ★★★ 공시」) · 목록에 들고 난 원인(가격 변화 · 자료 지연 해소 · 자료 지연 · 구성 종목 변경)
   근거 영역은 따로: 가격 · 수급 · 실적 · 사건 — 불장 · 출목표 · 태양 · 포모는 같은 종가에서 나온 것이라 「가격」 하나로 셈(여러 증거로 더하지 않음)
   종합점수 · 가중치 · 상승 확률은 만들지 않음 · 자료가 없으면 「자료 없음」(낮은 가치와 다름) */
import {h, korDate, finite, place} from './util.js';
import {state, loadBoard, loadLens, loadPlaceBoard} from './store.js';
import {foot, segNav, STOCK_SEGS} from './parts.js';
import {stocksArt, quietArt} from './scenes.js';
import {findIn, stockHref} from './find.js';
import {pv, ppv, sharesTxt, howBox, lensMissing} from './lensparts.js';

export const LISTS = {next: '오름 상위 22곳', similar: '예비 7곳', hot: '불장 업종'};
export const CAUSE = {price: '가격 변화', caught: '자료 지연 해소', late: '자료 지연', universe: '구성 종목 변경'};
export const STATUS = {late: '지연', stale: '오래된 종가', ca: '기업행사 확인 필요', missing: '종가 없음'};
export const BUCKET_RULES = [
  '새로 발견 = 앞 기록에 없다가 이번 기록 목록(오름 상위 22곳 · 예비 7곳 · 불장 업종)에 든 곳, 또는 앞 기록 뒤 ★★★ 공시가 새로 나온 곳',
  '근거 강화 = 두 기록 모두 목록에 있고, 앞 기록 뒤 업종 평균보다 더 오르고, 외국인+기관 순매수(주식 수 합)가 0보다 큼',
  '근거 약화 = 앞 기록 목록에서 빠짐, 또는 두 기록 모두 있는데 앞 기록 뒤 업종 평균보다 덜 오르고 외국인+기관이 순매도',
  '근거 영역(가격 · 수급 · 실적 · 사건)은 따로 보임 · 불장 · 출목표 · 태양 · 포모는 같은 종가 자료라 가격 하나로 셈',
  '종합점수 · 가중치 · 상승 확률은 만들지 않음 · 실험 규칙(검증 전)'];
const lists = xs => xs.map(x => LISTS[x] ?? x).join(' · ');
/** 왜 이 묶음인가 — 한 줄 */
export function whyText(s) {
  const w = s.bucketWhy?.[0]; if (!w) return null;
  if (w.k === 'enter') return `${lists(w.lists)}에 새로 듦 · 원인: ${CAUSE[w.cause] ?? w.cause}`;
  if (w.k === 'leave') return `${lists(w.lists)}에서 빠짐 · 원인: ${CAUSE[w.cause] ?? w.cause}`;
  if (w.k === 'info') return `새 ★★★ 공시 ${w.n}건(새 정보 · 조건 반복이 아님)`;
  if (w.k === 'both') return [`앞 기록 뒤 업종 대비 `, ppv(w.vsGroup), ` · 외국인+기관 ${sharesTxt(w.fi)}`];
  return null;
}
/** 근거 영역 넷(가격 · 수급 · 실적 · 사건) — 따로 셈 */
export function domainChips(s, {flows = true} = {}) {
  const f = s.fund, fl = s.fl;
  return h('p', {class: 'sk-dom'},
    h('span', {class: 'dm dm-p'}, '가격 ', finite(s.vsGroup20) ? ['업종 대비 ', ppv(s.vsGroup20)] : '계산 불가'),
    flows ? h('span', {class: 'dm dm-f'}, '수급 ', fl && (finite(fl.f5) || finite(fl.i5)) ? `외국인 ${sharesTxt(fl.f5)} · 기관 ${sharesTxt(fl.i5)}` : '자료 없음') : null,
    h('span', {class: 'dm dm-e'}, '실적 ', f && (finite(f.roe) || finite(f.debt)) ? `ROE ${finite(f.roe) ? f.roe.toFixed(1) + '%' : '없음'} · 부채비율 ${f.debtExempt ? '금융회사 빼고 봄' : finite(f.debt) ? Math.round(f.debt) + '%' : '없음'}` : '자료 없음'),
    s.since?.disc ? h('span', {class: 'dm dm-n'}, `사건 새 공시 ${s.since.disc}건`) : null);
}
function row(s, flows) {
  const why = whyText(s);
  return h('li', {class: 'sk-row', 'data-code': s.code, 'data-bucket': s.bucket ?? ''},
    h('a', {class: 'sk-a', href: '#/stock/' + encodeURIComponent(s.code).replace(/%2E/gi, '.')},
      h('span', {class: 'sk-name'}, h('span', {'data-ident': ''}, s.name), s.status !== 'ok' ? h('small', {class: 'lv-tag st-' + s.status}, STATUS[s.status]) : null),
      h('small', {class: 'sk-sub muted'}, s.gl ?? '업종 모름'),
      h('span', {class: 'sk-r'}, pv(s.r20))),
    why ? h('p', {class: 'sk-why'}, ...[].concat(why)) : null,
    domainChips(s, {flows}));
}

let memo = {bucket: null, sort: 'r20', group: '', q: ''}; // 회사 화면에 갔다 와도 고른 것 그대로(창을 닫으면 처음으로)
export async function renderStocks(main, {manifest, focus = false} = {}) {
  const [board, lens0] = await Promise.all([loadBoard(), loadLens().catch(() => null)]);
  const lens = lens0 && !lens0.none ? lens0 : null, flows = !!lens?.flows?.available, hasPrev = !!lens?.changes?.from;
  if (!memo.bucket) memo.bucket = hasPrev ? 'new' : 'all';
  const all = lens?.stocks ?? [];
  const B = [['new', '새로 발견'], ['up', '근거 강화'], ['down', '근거 약화'], ['all', '전체 비교']];
  const cnt = id => (id === 'all' ? all.length : all.filter(s => s.bucket === id).length);
  const SORTS = [['r20', '20거래일'], ['r5', '5거래일'], ['r1', '하루'], ['vsGroup20', '업종 대비'], ['name', '이름']];
  const list = h('ol', {class: 'sk-list'}), msg = h('p', {class: 'fd-msg', role: 'status', 'aria-live': 'polite'});
  const more = h('button', {class: 'b-btn', type: 'button', onclick: () => { shown += 40; draw(); }}, '더 보기');
  let shown = 30;
  const segBtns = B.map(([id, label]) => h('button', {class: 'f-seg-b sk-b', type: 'button', 'data-b': id, 'aria-pressed': String(memo.bucket === id), onclick: () => { memo.bucket = id; shown = 30; draw(); }}, h('span', null, label), h('small', null, ` ${cnt(id)}곳`)));
  const sortSel = h('select', {class: 'sk-sel', 'aria-label': '정렬', onchange: e => { memo.sort = e.target.value; draw(); }}, ...SORTS.map(([v, l]) => h('option', {value: v, selected: memo.sort === v ? true : null}, `정렬: ${l}`)));
  const groupSel = h('select', {class: 'sk-sel', 'aria-label': '업종 거르기', onchange: e => { memo.group = e.target.value; shown = 30; draw(); }},
    h('option', {value: ''}, '모든 업종'), ...(board.groups ?? []).map(g => h('option', {value: g.id, selected: memo.group === g.id ? true : null}, g.label)));
  // 찾기 — 이 판 + 다른 판(한국 · 미국) 회사 이름 · 기호 · 초성(find.js 그대로)
  const here = {id: place.id, label: place.label, href: ''}, boards = [{place: here, companies: board.companies, here: true}];
  const others = (state.places ?? []).filter(p => p.id !== place.id);
  Promise.allSettled(others.map(p => loadPlaceBoard(p.href))).then(rs => rs.forEach((r, i) => { if (r.status === 'fulfilled') boards.push({place: {id: others[i].id, label: others[i].label, href: others[i].href}, companies: r.value.board.companies, here: false}); if (memo.q) draw(); }));
  const input = h('input', {class: 'fd-in', type: 'search', value: memo.q, placeholder: '이름 · 첫 글자', 'aria-label': '회사 이름 · 기호 · 초성으로 찾기', autocomplete: 'off', autocapitalize: 'off', spellcheck: 'false', enterkeyhint: 'search',
    oninput: () => { memo.q = input.value; shown = 30; draw(); }});
  const form = h('form', {class: 'fd-form sk-form', role: 'search', 'aria-label': '회사 찾기', onsubmit: e => { e.preventDefault(); const hit = findIn(boards, input.value.trim())[0]; if (hit) location.href = stockHref(hit); }}, input);
  // 눌러 보는 첫 글자(새 판 찾기 · 구글 · 잡스팀 2026-10-10 20:47) — 누르면 칸에 넣고 바로 찾음(한국 · 미국 두 판 함께)
  const chip = t => h('button', {class: 'sk-chip', type: 'button', 'data-ident': '', onclick: () => { input.value = t; memo.q = t; shown = 30; draw(); }}, t);
  const chips = h('p', {class: 'sk-chips'}, h('span', {class: 'muted small'}, '첫 글자만 쳐도 돼요 · 눌러 보기'), chip('ㅅㅅㅈㅈ'), chip('ㅎㄷㅊ'), chip('ㅇㅂㄷㅇ'));
  function draw() {
    for (const b of segBtns) b.setAttribute('aria-pressed', String(b.dataset.b === memo.bucket));
    const q = memo.q.trim();
    if (q) {
      const found = findIn(boards, q), hits = found.slice(0, 30);
      list.replaceChildren(...hits.map(hit => h('li', {class: 'sk-row', 'data-code': hit.c.code}, h('a', {class: 'sk-a', href: stockHref(hit)},
        h('span', {class: 'sk-name'}, h('span', {'data-ident': ''}, hit.c.name)), h('small', {class: 'sk-sub muted'}, h('span', {'data-place': hit.place.id}, hit.place.label), ' · ', h('span', {'data-ident': ''}, hit.c.code), ` · ${hit.c.group?.label ?? '업종 모름'}`),
        h('span', {class: 'sk-r'}, pv(finite(hit.c.change20) ? hit.c.change20 * 100 : null))))));
      // 넣은 글자는 그대로(번역하지 않음 — 한글이면 lang="ko" · 숫자도 식별자 data-ident) — 뒤 글만 사전에서
      const clear = () => h('button', {class: 'b-link sk-clear', type: 'button', onclick: () => { memo.q = ''; input.value = ''; shown = 30; draw(); input.focus({preventScroll: true}); }}, '글자 지우기'); // 0곳이면 바로 다른 길(2026-10-09 지시서 0-E)
      msg.replaceChildren(h('span', {'data-ident': '', lang: /[가-힣ㄱ-ㅎㅏ-ㅣ]/.test(q) ? 'ko' : null}, `「${q}」`), ' ', ...(!found.length ? ['맞는 회사 없음 · ATLAS 는 고른 회사만 봅니다 · 초성 · 영어 이름 · 기호로도 찾습니다 · ', clear()] : [found.length > hits.length ? `${found.length}곳 가운데 ${hits.length}곳 · 글자를 더 넣으면 좁혀짐` : `${found.length}곳`]));
      more.hidden = true; return;
    }
    msg.replaceChildren();
    let xs = all.filter(s => (memo.bucket === 'all' || s.bucket === memo.bucket) && (!memo.group || s.g === memo.group));
    const k = memo.sort; xs = [...xs].sort(k === 'name' ? (a, b) => String(a.name).localeCompare(String(b.name), 'ko') : (a, b) => (finite(b[k]) ? b[k] : -Infinity) - (finite(a[k]) ? a[k] : -Infinity));
    list.replaceChildren(...xs.slice(0, shown).map(s => row(s, flows)));
    if (!xs.length) { // 0곳이면 거르기를 바꾸는 단추(2026-10-09 지시서 0-E)
      const fixes = [memo.bucket !== 'all' ? h('button', {class: 'b-link sk-fix', type: 'button', onclick: () => { memo.bucket = 'all'; shown = 30; draw(); }}, '「전체 비교」로 보기') : null,
        memo.group ? h('button', {class: 'b-link sk-fix', type: 'button', onclick: () => { memo.group = ''; groupSel.value = ''; shown = 30; draw(); }}, '업종 거르기 풀기') : null].filter(Boolean);
      list.replaceChildren(h('li', {class: 'muted small sk-none'}, memo.bucket === 'all' ? '해당 종목 없음' : '이 묶음에 든 종목 없음', ...fixes.flatMap(b => [' · ', b])));
    }
    more.hidden = xs.length <= shown;
  }
  state.summary = lens ? `종목 · ${korDate(lens.asOf)} 종가 · 새로 발견 ${cnt('new')}곳 · 근거 강화 ${cnt('up')}곳 · 근거 약화 ${cnt('down')}곳` : '종목';
  main.replaceChildren(h('div', {class: 'b-page sk-page'},
    h('section', {class: 'mk-b', 'data-first': '1', 'aria-label': '종목'}, h('h2', {class: 'mk-h'}, '종목'),
      lens ? h('p', {class: 'mk-l'}, h('b', null, `${korDate(lens.asOf)} 종가 · ${all.length}곳`), hasPrev ? ` · ${korDate(lens.changes.from)} 저녁 기록과 견줌` : ' · 견줄 앞 기록 없음(전체 비교만)') : lensMissing(lens0),
      form, chips, msg),
    segNav(STOCK_SEGS, 'list', '종목 보기 바꾸기'),
    h('div', {class: 'f-seg sk-seg', role: 'group', 'aria-label': '묶음'}, ...segBtns),
    h('div', {class: 'sk-tools'}, sortSel, groupSel),
    list, more,
    (lens ? stocksArt(lens) : null) ?? quietArt({key: 'stocks', label: '종목', when: `${korDate(board.asOf)} 종가`}),
    h('details', {class: 'b-how'}, h('summary', null, '묶음 규칙 · 근거 영역'), h('ul', null, ...BUCKET_RULES.map(x => h('li', null, x)))),
    lens ? howBox(lens) : null,
    foot(manifest)));
  draw();
  if (focus) input.focus({preventScroll: true});
}
