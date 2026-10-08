/* ATLAS 11 · 평균 펼치기(대표 조작) — 2026-10-09 「ATLAS 업데이트 실행 프롬프트」(사장님 01:41 마카오 시각 첨부) 0-C · 6 · 9
   한 부품을 두 곳에 씀: 시장 → 업종(#/sectors · 선정 표본 평균을 업종마다 기여로) · 업종 → 종목(#/i/<업종> · 업종 평균을 종목마다 수익률과 기여로)
   · 같은 축 막대(charts.js) · 기여(%p) = 그 칸 수익률 합 ÷ 지금 분모(모두 더하면 평균) · 값이 없는 종목은 분모에서 빼고 까닭을 그 자리에 적음
   · 「상승 1위 제외」(업종 화면) · 「기여 1위 업종 제외」(업종 탭) — 빼도 그 줄은 제자리에 「제외」 표시로 남음 · 「원래대로」 = 처음 값 그대로
   · 단순평균(동일가중): 뺀 칸의 합 · 수를 빼고 다시 나눔(분모가 줄어듦) · 시가총액 가중: 남은 칸의 가중치를 다시 합 100% 로(재정규화 — 가중치 = 선정 때 시가총액 · 미국 판은 시가총액 자료 없음)
   · 공식 기록 · 판 자료는 바꾸지 않음 — 이 화면 안에서만 다시 셈(새로 고치면 처음 값) · 셈은 calc.js 한 곳(시험 tests/atlas11/calc.test.mjs A~I) */
import {h, korDate, finite, place} from './util.js';
import {poolMean, contribs, weightedMean, topIndex, median, fmtPct, fmtPp, fin} from './calc.js';
import {barRows, axisOf, keyEl, sideOf} from './charts.js';
import {artStage, artSection} from './art.js';
import {state} from './store.js';

/** 고른 상태 기억(이 탭 안 · 새로 고치면 처음 값) — 회사 화면에 갔다가 돌아오면 「제외」 · 「모두 보기」를 그대로(통합본 0-D 「뒤로 가면 이전 선택이 돌아온다」) · 열쇠 = 그림 이름 + 주소 · 칸은 이름(id)으로 기억 */
const MEMO = new Map();

const P = v => fmtPct(v), PP = v => fmtPp(v);
const sgn = v => (fin(v) ? sideOf(v) : '');
const STATUS = {late: '지연(그날 종가 없음)', stale: '오래된 종가', ca: '기업행사 확인(가격 기준 바뀜)', missing: '값 없음'};
/** 바뀐 값 「앞 → 뒤」(같으면 하나) */
const both = (a, b, f = P, color = true) => { const c = v => (color ? sgn(v) : null); return fin(a) && fin(b) && Math.abs(a - b) > 1e-12 ? [h('b', {class: c(a)}, f(a)), h('span', {class: 'dc-arrow'}, ' → '), h('b', {class: c(b)}, f(b))] : [h('b', {class: c(a)}, f(a))]; }; // 곳 수는 색을 칠하지 않음(오름 · 내림이 아님)
const cell = (k, ...v) => h('p', {class: 'dc-cell'}, h('span', {class: 'dc-k'}, k), h('span', {class: 'dc-v'}, ...v));
const tag = t => h('span', {class: 'ra-k ra-tag'}, t);

/**
 * 펼치기 상태 기계 — units = 칸(종목 하나 또는 업종 하나) · 칸마다 rets(값이 있는 종목 수익률 %) · caps(시가총액 · 없으면 null)
 * skip = 뺀 칸 번호(Set) → 단순평균 · 분모 · 중앙값 · 오른 곳 · 칸마다 기여 · 시가총액 가중 평균
 */
export function decompState(units, skip = new Set()) {
  const parts = units.map(u => ({sum: u.rets.length ? u.rets.reduce((t, r) => t + r, 0) : null, count: u.rets.length}));
  const {mean, n} = poolMean(parts, skip), cs = contribs(parts, skip);
  const rs = units.flatMap((u, i) => (skip.has(i) ? [] : u.rets)), ws = units.flatMap((u, i) => (skip.has(i) ? [] : u.caps ?? u.rets.map(() => null)));
  const capsOk = units.every(u => !u.rets.length || (u.caps && u.caps.length === u.rets.length && u.caps.every(c => fin(c) && c > 0)));
  return {mean, n, median: median(rs), up: rs.filter(r => r > 0).length, contribs: cs, wMean: capsOk ? weightedMean(rs, ws) : null, capsOk};
}

/**
 * 그림 한 장(펼치기) — kind: 'stocks'(업종 → 종목) · 'sectors'(시장 → 업종)
 * units = [{id, name, href, ident, rets: [%], caps: [억원] | null, why(값 없는 까닭 · 종목), total(업종 선정 수)}] — 값이 없는 칸(rets 빈)은 맨 뒤 · 분모 밖
 * topBy = 'ret'(상승 1위 — 수익률이 가장 큰 칸) | 'contrib'(기여 1위 — 합이 가장 큰 칸)
 */
export function decompFig({key, kind, units, label = null, kicker, when, title, topBy, topWord, refs = [], refKeys = [], ref = null, counter, limits = [], nextLine, capDay = null, show = 0, first = null, checkOf, axis = null, weighted = true}) {
  const valid = units.map((u, i) => (u.rets.length ? i : -1)).filter(i => i >= 0);
  const base = decompState(units), score = units.map(u => (!u.rets.length ? null : topBy === 'ret' ? u.rets[0] : u.rets.reduce((t, r) => t + r, 0)));
  const top = topIndex(score);
  const mk = `${key}|${location.hash}`, saved = state.restoring ? MEMO.get(mk) : null; if (!saved) MEMO.delete(mk); // 처음 들어오면 처음 값 · 돌아오면 고른 그대로
  let skip = new Set((saved?.skip ?? []).map(id => units.findIndex(u => u.id === id)).filter(i => i >= 0 && units[i].rets.length)), all = !!saved?.all || !show || units.length <= (Array.isArray(show) ? show[0] + show[1] : show);
  const ax = axis ?? axisOf(units.flatMap(u => (kind === 'stocks' ? u.rets : u.rets.length ? [u.rets.reduce((t, r) => t + r, 0) / base.n] : [])).concat(refs.map(r => r.v)));
  const sum = h('div', {class: 'ra-lab dc-head', 'data-at': '0'}), rowsBox = h('div', {class: 'dc-rows', 'data-at': '1'}), live = h('p', {class: 'dc-live', 'aria-live': 'polite'});
  // 누른 것과 바뀐 것을 잇는 짧은 표시(0.24초 · 통합본 0-F 「선택과 결과」) — 바뀐 요약 칸 · 누른 줄에 테가 한 번 · 동작 줄이기면 없음(style.css 공통 규칙)
  let acted = null, prevCells = null; // acted = 이번에 넣고 뺀 칸 번호들
  const act = (ids, next) => { acted = ids; skip = next; draw(); };
  const topBtn = h('button', {type: 'button', class: 'dc-b dc-top', 'aria-pressed': 'false', disabled: top < 0 ? '' : null, onclick: () => act([top, ...skip], skip.has(top) && skip.size === 1 ? new Set() : new Set([top]))}, topWord);
  const resetBtn = h('button', {type: 'button', class: 'dc-b dc-reset', onclick: () => act([...skip], new Set())}, '원래대로');
  const moreBtn = !all ? h('button', {type: 'button', class: 'dc-b dc-all', onclick: () => { all = true; moreBtn.hidden = true; draw(); }}, `${units.length}개 모두 보기`) : null;
  const tools = h('div', {class: 'dc-tools'}, topBtn, resetBtn, moreBtn);
  // 보일 줄 — show = 0(모두) · [앞 a, 뒤 b](값이 있는 칸 가운데 앞 a 개 · 뒤 b 개 + 뺀 칸) — 「모두 보기」를 누르면 모두
  const [headN, tailN] = Array.isArray(show) ? show : [show, 0];
  function rowsOf(st) {
    const order = [...units.keys()], vk = new Map(valid.map((i, k) => [i, k]));
    const shown = all ? order : order.filter(i => vk.has(i) && (vk.get(i) < headN || vk.get(i) >= valid.length - tailN) || skip.has(i));
    return shown.map(i => {
      const u = units[i], ex = skip.has(i), has = u.rets.length > 0;
      const sumR = has ? u.rets.reduce((t, r) => t + r, 0) : null, c = has && !ex ? st.contribs[i] : null;
      const v = kind === 'stocks' ? u.rets[0] ?? null : has ? sumR / base.n : null; // 막대 = 종목 수익률(%) · 업종은 처음 분모로 본 기여(%p · 축이 흔들리지 않게)
      const txt = !has ? '값 없음' : kind === 'stocks' ? P(u.rets[0]) : PP(v);
      const sub = !has ? (u.why ?? '값 없음 — 평균에서 뺌')
        : ex ? '제외 — 평균 계산에서 뺌(줄은 제자리)'
        : kind === 'stocks' ? `기여 ${PP(c)}(수익률 ÷ ${st.n}곳)` : `기여 ${PP(c)} · 업종 평균 ${P(sumR / u.rets.length)} · ${u.total}곳 중 ${u.rets.length}곳 값`;
      const tog = has ? h('button', {type: 'button', class: 'dc-x', 'aria-pressed': String(ex), 'aria-label': `${u.name} ${ex ? '다시 넣기' : '제외'}`, 'data-ident-label': '', onclick: () => { const s2 = new Set(skip); if (s2.has(i)) s2.delete(i); else s2.add(i); act([i], s2); }}, ex ? '다시 넣기' : '제외') : null;
      return {id: u.id, name: u.name, ident: !!u.ident, href: u.href, v, txt, sub, ex: ex || !has, tag: i === top ? (topBy === 'ret' ? '상승 1위' : '기여 1위') : null, tog, rank: null};
    });
  }
  /* 구성과 기여 한 줄(통합본 0-E 「구조: 첫 종목의 평균 기여 +4.8%p, 나머지 합계 −0.8%p」) — 처음 값이면 1위 기여와 나머지 합 · 뺀 뒤면 남은 곳 기여 합 = 새 평균
     *  산술 몫일 뿐 원인이 아님(왜 올랐는지는 공시 · 기사로 따로) — 「아직 모르는 것」 줄에 적음 */
  const unitW = kind === 'stocks' ? '곳' : '개 업종', whoW = kind === 'stocks' ? '상승 1위' : '기여 1위';
  function structEl(st, changed) {
    if (top < 0 || !fin(base.mean)) return h('p', {class: 'ra-li dc-struct'}, tag('구성과 기여'), '계산 불가');
    const u = units[top], c = base.contribs[top], nm = h('span', {'data-ident': u.ident ? '' : null}, u.name);
    if (!changed) return h('p', {class: 'ra-li dc-struct'}, tag('구성과 기여'), `${whoW} `, nm, ' ', h('b', {class: sgn(c)}, PP(c)), ` · 나머지 ${valid.length - 1}${unitW} 합 `, h('b', {class: sgn(base.mean - c)}, PP(base.mean - c)), ` = 평균 ${P(base.mean)}`);
    return h('p', {class: 'ra-li dc-struct'}, tag('구성과 기여'), `${skip.size}${unitW} 뺀 뒤 남은 ${kind === 'stocks' ? `${st.n}곳` : `${valid.length - skip.size}개 업종(${st.n}곳)`} 기여 합 = 평균 `, h('b', {class: sgn(st.mean)}, P(st.mean)), skip.has(top) ? [` · ${whoW} `, h('span', {'data-ident': u.ident ? '' : null}, u.name), ' 뺌'] : null);
  }
  function draw() {
    const st = decompState(units, skip), changed = skip.size > 0;
    topBtn.setAttribute('aria-pressed', String(skip.size === 1 && skip.has(top)));
    resetBtn.disabled = !changed;
    const gapOf = m => (fin(m) && fin(ref?.v) ? m - ref.v : null); // 지수 대비 격차(%p) = 평균 − 같은 20거래일 지수 수익률(통합본 0-B · 9)
    const cells = [ // replaceChildren 은 null 을 「null」 글로 넣음 — 걸러 넣음
      cell('평균(단순)', ...both(base.mean, changed ? st.mean : base.mean)),
      ref ? cell(`${ref.name} 대비`, ...(fin(ref.v) ? both(gapOf(base.mean), gapOf(changed ? st.mean : base.mean), PP) : [h('b', null, '계산 불가')])) : null,
      cell('오른 곳', h('b', null, `${base.up}/${base.n}곳`), changed ? [h('span', {class: 'dc-arrow'}, ' → '), h('b', null, `${st.up}/${st.n}곳`)] : null),
      cell('중앙값', ...both(base.median, changed ? st.median : base.median)),
      cell('분모(값이 있는 곳)', ...both(base.n, changed ? st.n : base.n, x => `${x}곳`, false)),
      weighted ? cell('시가총액 가중', ...(base.capsOk ? both(base.wMean, changed ? st.wMean : base.wMean) : [h('b', null, '자료 없음')])) : null].filter(Boolean); // 연습 화면은 시가총액이 없어 칸을 두지 않음
    sum.replaceChildren(...cells);
    if (acted && prevCells) cells.forEach((c, k) => { if (c.textContent !== prevCells[k]) c.classList.add('dc-flash'); });
    prevCells = cells.map(c => c.textContent);
    const rows = rowsOf(st);
    const chart = barRows(rows.map(r => ({...r, tog: undefined})), {ax, refs: kind === 'stocks' ? [{v: changed ? st.mean : base.mean, cls: ''}, ...refs] : []}); // 업종 탭 막대는 기여(%p) — 평균(%) 점선을 같은 축에 긋지 않음(단위가 다름)
    // 줄마다 「제외 · 다시 넣기」 단추(44px) — 이름 줄 끝
    [...chart.querySelectorAll('.bc-row')].forEach((el, k) => { el.classList.add('dc-row'); if (rows[k].tog) el.querySelector('.bc-top')?.append(rows[k].tog); });
    if (acted) for (const i of acted) chart.querySelector(`.dc-row[data-id="${CSS.escape(String(units[i]?.id ?? ''))}"]`)?.classList.add('dc-flash');
    rowsBox.replaceChildren(...[chart, !all ? h('p', {class: 'bc-more'}, `${units.length - rows.length}개 더 — 「${units.length}개 모두 보기」`) : null, structEl(st, changed)].filter(Boolean)); // replaceChildren 은 null 을 「null」 글로 넣음
    acted = null;
    MEMO.set(mk, {skip: [...skip].map(i => units[i].id), all});
    live.textContent = changed ? `${skip.size}칸 제외 · 평균 ${P(base.mean)} → ${P(st.mean)} · 분모 ${base.n}곳 → ${st.n}곳` : `처음 값 · 평균 ${P(base.mean)} · 분모 ${base.n}곳`;
  }
  draw();
  const key2 = keyEl([kind === 'stocks' ? {cls: '', label: '점선 = 평균(제외 반영)'} : {cls: 'up', label: '막대 = 기여(%p)'}, ...refKeys, {cls: 'ex', label: '빗금 = 제외 · 값 없음'}]);
  const capLine = base.capsOk ? `시가총액 가중 = 남은 곳 시가총액으로 다시 나눔(합 100%)${capDay ? ` · 가중치 = ${korDate(capDay)} 시가총액` : ''}` : place.id === 'us' ? '시가총액 가중: 미국 판은 시가총액 자료가 없어 계산하지 않음' : '시가총액 가중: 시가총액이 빠진 곳이 있어 계산하지 않음';
  const art = h('div', {class: 'dc'}, tools, rowsBox, key2);
  const labels = sum;
  const stage = artStage({key, art, labels, labFirst: true, steps: [{c: 0, at: 0, ms: 1100}, {c: 1, at: 1, ms: 1500}, {c: 2, at: 2, ms: 1200}, {c: 3, at: 3, ms: 1000}],
    tail: [h('div', {class: 'ra-tail', 'data-at': '2'}, h('p', {class: 'ra-li'}, tag('반대 근거'), h('span', {class: 'ob-counter'}, counter ?? '반대 근거 없음')), limits.length ? h('p', {class: 'ra-li dc-limit'}, tag('아직 모르는 것'), limits.join(' · ')) : null),
      h('div', {class: 'dc-note', 'data-at': '3'}, h('p', {class: 'ra-li'}, tag('확인할 것'), ...[].concat(nextLine ?? [])), weighted ? h('p', {class: 'dc-cap'}, capLine) : null), live]});
  const box = artSection({key: kind === 'stocks' ? 'industry' : 'sectors', label: label ?? (typeof kicker === 'string' ? kicker : '평균 펼치기'), kicker, when, title, stage, first});
  if (checkOf) box.querySelector('.ra-lab').dataset.check = JSON.stringify(checkOf({base, top, valid, units}));
  return box;
}
export {STATUS as DECOMP_STATUS};
