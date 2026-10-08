/* ATLAS 11 · 관심종목(#/watch · 위 막대 ★) — 「ATLAS 개편 실행 지시서」(사장님 2026-10-08 20:19 마카오 시각 첨부) 3 · 7
   · 여섯째 아래 탭을 만들지 않음 — 위 막대 ★ 로 어디서나 · 회사 화면 「★ 관심 등록」에서 남김
   · 남기는 것: 종목 · 등록 시각 · 그때 종가(날짜) · 등록 이유 · 반대 근거 · 다음 확인 조건 — 이 기기에만(기기 저장 · 「찾기」 최근 회사와 같은 방식 store.js prefs)
   · 계정 · 다른 기기와 맞춰지지 않음(그렇다고 화면에 씀) · 한국 판 · 미국 판은 따로 저장
   · 지금 종가와 등록 뒤 수익률은 판 자료로(종가 기준 · 같은 판 날짜) — 관심 등록은 공식 순위 · 기록을 바꾸지 않음 */
import {h, korDate, stamp, won, finite} from './util.js';
import {state, loadBoard, prefs} from './store.js';
import {foot} from './parts.js';
import {watchArt} from './scenes.js';
import {pv} from './lensparts.js';
import {pctRet} from './calc.js';

const KEY = 'watch', MAX = 60;
export const watchList = () => { const v = prefs.get(KEY, []); return Array.isArray(v) ? v.filter(x => x && x.code && x.at) : []; };
export const watchOf = code => watchList().find(x => x.code === code) ?? null;
export function watchAdd(x) { const l = watchList().filter(y => y.code !== x.code); l.unshift(x); prefs.set(KEY, l.slice(0, MAX)); }
export function watchRemove(code) { prefs.set(KEY, watchList().filter(y => y.code !== code)); }
const clip = t => String(t ?? '').trim().slice(0, 400);

/** 회사 화면 「★ 관심 등록」 — 등록 이유 · 반대 근거 · 다음 확인 조건(빈 칸이면 「적지 않음」) · 그때 종가 · 날짜 · 시각을 이 기기에 */
export function watchBox(s, onChange = null) {
  const box = h('section', {class: 'b-box wl-box', 'aria-label': '관심 등록'});
  const draw = () => {
    const w = watchOf(s.code);
    if (w) {
      box.replaceChildren(h('h2', {class: 'b-box-h'}, '★ 관심 종목', h('small', null, ' · 이 기기에만 저장')),
        h('p', {class: 'mk-l'}, `등록 ${stamp(w.at)} · 그때 종가 ${won(w.price)}(${korDate(w.date)})`),
        h('p', {class: 'mk-l'}, '등록 뒤 ', pv(pctRet(s.close, w.price)), ` · 지금 ${won(s.close)}(${korDate(s.date)})`),
        h('dl', {class: 'wl-dl'}, h('dt', null, '등록 이유'), h('dd', {lang: 'ko'}, w.reason || '적지 않음'), h('dt', null, '반대 근거'), h('dd', {lang: 'ko'}, w.counter || '적지 않음'), h('dt', null, '확인할 조건'), h('dd', {lang: 'ko'}, w.next || '적지 않음')),
        h('p', null, h('a', {href: '#/watch'}, '관심종목 모두 보기 ›'), ' · ', h('button', {class: 'b-link', type: 'button', onclick: () => { watchRemove(s.code); draw(); onChange?.(); }}, '관심에서 빼기')));
      return;
    }
    const ta = (label, id) => [h('label', {class: 'wl-l', for: id}, label), h('textarea', {class: 'wl-t', id, rows: 2, maxlength: 400})];
    const form = h('form', {class: 'wl-form', onsubmit: e => { e.preventDefault();
      watchAdd({code: s.code, name: s.name, at: new Date().toISOString(), date: s.date, price: s.close, reason: clip(form.querySelector('#wl-r').value), counter: clip(form.querySelector('#wl-c').value), next: clip(form.querySelector('#wl-n').value)});
      draw(); onChange?.(); }},
      ...ta('등록 이유', 'wl-r'), ...ta('반대 근거', 'wl-c'), ...ta('확인할 조건', 'wl-n'),
      h('button', {class: 'b-btn', type: 'submit'}, '★ 관심 등록'));
    box.replaceChildren(h('details', {class: 'wl-d'}, h('summary', null, '★ 관심 등록', h('small', null, ' · 이 기기에만 저장')), form,
      h('p', {class: 'muted xs'}, `지금 종가 ${won(s.close)}(${korDate(s.date)})와 등록 시각이 함께 남음 · 다른 기기 · 계정과 맞춰지지 않음`)));
  };
  draw();
  return box;
}

export async function renderWatch(main, {manifest}) {
  const board = await loadBoard(), byCode = new Map(board.companies.map(c => [c.code, c]));
  const list = h('ol', {class: 'wl-list'});
  const draw = () => {
    const xs = watchList();
    list.replaceChildren(...xs.map(w => { const c = byCode.get(w.code), r = c ? pctRet(c.close, w.price) : null;
      return h('li', {class: 'wl-row', 'data-code': w.code},
        h('a', {class: 'sk-a', href: '#/stock/' + encodeURIComponent(w.code).replace(/%2E/gi, '.')}, h('span', {class: 'sk-name'}, h('span', {'data-ident': ''}, w.name)), h('span', {class: 'sk-r'}, pv(r))),
        h('p', {class: 'muted xs'}, `등록 ${stamp(w.at)} · 그때 ${won(w.price)}(${korDate(w.date)}) · 지금 `, c ? `${won(c.close)}(${korDate(c.date)})` : '이 판에 없음'),
        h('dl', {class: 'wl-dl'}, h('dt', null, '등록 이유'), h('dd', {lang: 'ko'}, w.reason || '적지 않음'), h('dt', null, '반대 근거'), h('dd', {lang: 'ko'}, w.counter || '적지 않음'), h('dt', null, '확인할 조건'), h('dd', {lang: 'ko'}, w.next || '적지 않음')),
        h('button', {class: 'b-link', type: 'button', onclick: () => { watchRemove(w.code); draw(); }}, '관심에서 빼기')); }));
    if (!xs.length) list.replaceChildren(h('li', {class: 'muted small'}, '관심 등록한 종목이 없습니다 · 회사 화면의 「★ 관심 등록」으로 남깁니다'));
    state.summary = `관심종목 ${xs.length}곳 · 이 기기에만 저장`;
    return xs.length;
  };
  const n = draw();
  main.replaceChildren(h('div', {class: 'b-page wl-page'},
    h('section', {class: 'mk-b', 'data-first': '1', 'aria-label': '관심종목'}, h('h2', {class: 'mk-h'}, '★ 관심종목'),
      h('p', {class: 'mk-l'}, h('b', null, `${n}곳`), ` · ${korDate(board.asOf)} 종가와 견줌 · 이 기기에만 저장(다른 기기 · 계정과 맞춰지지 않음)`)),
    list,
    watchArt(n),
    h('p', {class: 'muted xs'}, '관심 등록은 공식 순위 · 선정 기록을 바꾸지 않습니다'),
    h('details', {class: 'b-how'}, h('summary', null, '계산 · 출처 자세히'), h('p', {class: 'muted xs'}, '등록 뒤 수익률(%) = 등록 때 종가에서 지금 종가까지 변화율')), // 산식은 접힘(다른 탭과 같은 「계산 · 출처」)
    foot(manifest)));
}
