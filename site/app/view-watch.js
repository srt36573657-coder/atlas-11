/* ATLAS 11 · 관심종목(#/watch · 위 막대 ★) — 「ATLAS 개편 실행 지시서」(사장님 2026-10-08 20:19 마카오 시각 첨부) 3 · 7
   · 여섯째 아래 탭을 만들지 않음 — 위 막대 ★ 로 어디서나 · 회사 화면 「★ 관심 등록」에서 남김
   · 남기는 것: 종목 · 등록 시각 · 그때 종가(날짜) · 등록 이유 · 반대 근거 · 다음 확인 조건 — 이 기기에만(기기 저장 · 「찾기」 최근 회사와 같은 방식 store.js prefs)
   · 계정 · 다른 기기와 맞춰지지 않음(그렇다고 화면에 씀) · 한국 판 · 미국 판은 따로 저장
   · 지금 종가와 등록 뒤 수익률은 판 자료로(종가 기준 · 같은 판 날짜) — 관심 등록은 공식 순위 · 기록을 바꾸지 않음 */
import {h, korDate, stamp, won, finite} from './util.js';
import {state, loadBoard, loadAgenda, loadLens, prefs} from './store.js';
import {candOfLens, candFlagsOf, FLAG_NAMES, stEl} from './view-cand.js'; // 후보 상태(2026-10-09 03:09 「ATLAS 제품 재설계 명령」 9 「관심 · 추적 — 내가 관심을 둔 후보의 조건이 어떻게 달라졌는가」)
import {foot} from './parts.js';
import {watchArt} from './scenes.js';
import {pv} from './lensparts.js';
import {pctRet} from './calc.js';

const KEY = 'watch', MAX = 60;
export const watchList = () => { const v = prefs.get(KEY, []); return Array.isArray(v) ? v.filter(x => x && x.code && x.at) : []; };
export const watchOf = code => watchList().find(x => x.code === code) ?? null;
/** 저장하고 다시 읽어 확인 — 저장 칸이 막힌 브라우저(사생활 보호 창 등)면 false(2026-10-09 「ATLAS 업데이트 실행 프롬프트」 0-E 「관심 저장 · 실패를 바로 알림」) */
export function watchAdd(x) { const l = watchList().filter(y => y.code !== x.code); l.unshift(x); return prefs.set(KEY, l.slice(0, MAX)) && !!watchOf(x.code); }
export function watchRemove(code) { return prefs.set(KEY, watchList().filter(y => y.code !== code)) && !watchOf(code); }
const clip = t => String(t ?? '').trim().slice(0, 400);

/** 회사 화면 「★ 관심 등록」 — 등록 이유 · 반대 근거 · 다음 확인 조건(빈 칸이면 「적지 않음」) · 그때 종가 · 날짜 · 시각을 이 기기에 */
export function watchBox(s, onChange = null, {cand = null} = {}) { // cand = 등록 때 후보 상태(조건 다섯 · 순위 · 판 날짜) — 관심 화면이 「등록 뒤 바뀐 조건」을 셈
  const box = h('section', {class: 'b-box wl-box', 'aria-label': '관심 등록'});
  let note = null; // 방금 한 일의 결과 한 줄(저장함 · 저장하지 못함 · 뺌)
  const say = () => (note ? h('p', {class: 'wl-say' + (note.ok ? '' : ' wl-bad'), role: 'status', 'aria-live': 'polite'}, note.text) : null);
  const draw = () => {
    const w = watchOf(s.code);
    if (w) {
      box.replaceChildren(h('h2', {class: 'b-box-h'}, '★ 관심 종목', h('small', null, ' · 이 기기에만 저장')), say(),
        h('p', {class: 'mk-l'}, `등록 ${stamp(w.at)} · 그때 종가 ${won(w.price)}(${korDate(w.date)})`),
        h('p', {class: 'mk-l'}, '등록 뒤 ', pv(pctRet(s.close, w.price)), ` · 지금 ${won(s.close)}(${korDate(s.date)})`),
        h('dl', {class: 'wl-dl'}, h('dt', null, '등록 이유'), h('dd', {lang: 'ko'}, w.reason || '적지 않음'), h('dt', null, '반대 근거'), h('dd', {lang: 'ko'}, w.counter || '적지 않음'), h('dt', null, '확인할 조건'), h('dd', {lang: 'ko'}, w.next || '적지 않음')),
        h('p', null, h('a', {href: '#/watch'}, '관심종목 모두 보기 ›'), ' · ', h('button', {class: 'b-link', type: 'button', onclick: () => { const ok = watchRemove(s.code); note = ok ? {ok, text: '관심에서 뺐습니다'} : {ok, text: '빼지 못했습니다 — 이 브라우저가 이 기기 저장을 막았습니다'}; draw(); onChange?.(); }}, '관심에서 빼기')));
      return;
    }
    const ta = (label, id) => [h('label', {class: 'wl-l', for: id}, label), h('textarea', {class: 'wl-t', id, rows: 2, maxlength: 400})];
    const form = h('form', {class: 'wl-form', onsubmit: e => { e.preventDefault();
      const ok = watchAdd({code: s.code, name: s.name, at: new Date().toISOString(), date: s.date, price: s.close, reason: clip(form.querySelector('#wl-r').value), counter: clip(form.querySelector('#wl-c').value), next: clip(form.querySelector('#wl-n').value), ...(cand ? {cand} : {})});
      note = ok ? {ok, text: '저장했습니다 · 이 기기에만'} : {ok, text: '저장하지 못했습니다 — 이 브라우저가 이 기기 저장을 막았습니다(사생활 보호 창 등) · 적은 글은 그대로 둠'};
      if (ok) draw(); else { form.querySelector('.wl-say')?.remove(); form.prepend(say()); } onChange?.(); }},
      ...ta('등록 이유', 'wl-r'), ...ta('반대 근거', 'wl-c'), ...ta('확인할 조건', 'wl-n'),
      h('button', {class: 'b-btn', type: 'submit'}, '★ 관심 등록'));
    box.replaceChildren(h('details', {class: 'wl-d'}, h('summary', null, '★ 관심 등록', h('small', null, ' · 이 기기에만 저장')), form,
      h('p', {class: 'muted xs'}, `지금 종가 ${won(s.close)}(${korDate(s.date)})와 등록 시각이 함께 남음 · 다른 기기 · 계정과 맞춰지지 않음`)));
  };
  draw();
  return box;
}

/** 후보 상태 한 줄 — 지금(순위 · 조건 충족 / 조건 대기 / 재검토 · 아니면 처음 막힌 조건) · 등록 때와 바뀐 조건(등록 때 상태를 남긴 것만) */
function candLine(C, w) {
  if (!C?.ready) return null;
  const x = C.items.find(y => y.code === w.code), now = candFlagsOf(C, w.code), was = typeof w.cand?.flags === 'string' && w.cand.flags.length === FLAG_NAMES.length ? [...w.cand.flags].map(c => c === '1') : null; // 규칙이 바뀌어 조건 수가 다르면 견주지 않음
  const first = now ? now.findIndex(ok => !ok) : -1, ruleMoved = typeof w.cand?.flags === 'string' && !was; // 등록 뒤 고르는 규칙이 바뀜(조건 수가 다름 — 2026-10-09 규칙 4판)
  const diff = now && was ? FLAG_NAMES.map((k, i) => (now[i] !== was[i] ? `${k} ${was[i] ? '✓' : '✕'} → ${now[i] ? '✓' : '✕'}` : null)).filter(Boolean) : null;
  return h('p', {class: 'wl-cand'}, h('span', {class: 'cd-k'}, '후보 상태'), ' ',
    x ? [`검토 순위 ${x.rank}위 `, stEl(x.status), ` · 가장 큰 위험: ${x.risk.text}`] : now ? (first >= 0 ? `후보 아님 — 처음 막힌 조건: ${FLAG_NAMES[first]}` : '조건은 넘었지만 7곳 밖') : '이 판에 없음',
    diff ? (diff.length ? ` · 등록(${korDate(w.cand.asOf)} 판) 뒤 바뀐 조건: ${diff.join(' · ')}` : ` · 등록(${korDate(w.cand.asOf)} 판) 뒤 바뀐 조건 없음`) : ruleMoved ? ` · 등록(${korDate(w.cand.asOf)} 판) 뒤 고르는 규칙이 바뀌어 조건을 견주지 않음` : was ? '' : ' · 등록 때 후보 상태는 남기지 않았음(후보 기능 전에 등록)');
}
export async function renderWatch(main, {manifest}) {
  const [board, agenda, lens] = await Promise.all([loadBoard(), loadAgenda().catch(() => null), loadLens().catch(() => null)]), byCode = new Map(board.companies.map(c => [c.code, c])), C = candOfLens(lens);
  const list = h('ol', {class: 'wl-list'});
  /* 등록 뒤 확인된 변화 · 아직 확인 안 된 것(2026-10-09 셋째 개정본 0-I 「다음 방문에서 확인된 변화와 아직 미확인인 항목을 구분한다」)
     확인된 것 = 종가 변화(위 줄) · 등록한 날 뒤 새 공시 수 · 다가오는 일정 수(일정표) — 적어 둔 「확인할 조건」은 ATLAS가 판정하지 않음(사람이 확인) */
  const since = w => { const a = agenda?.byCode?.[w.code]; if (!a) return null; const after = (a.disclosures ?? []).filter(d => String(d.publishedAt ?? '').slice(0, 10) > String(w.date ?? '')), up = (a.upcoming ?? []).filter(e => e.date >= board.asOf);
    return {n: after.length, top: after.filter(d => d.level === 3).length, up: up.length, next: up[0] ?? null}; };
  const draw = () => {
    const xs = watchList();
    list.replaceChildren(...xs.map(w => { const c = byCode.get(w.code), r = c ? pctRet(c.close, w.price) : null;
      return h('li', {class: 'wl-row', 'data-code': w.code},
        h('a', {class: 'sk-a', href: '#/stock/' + encodeURIComponent(w.code).replace(/%2E/gi, '.')}, h('span', {class: 'sk-name'}, h('span', {'data-ident': ''}, w.name)), h('span', {class: 'sk-r'}, pv(r))),
        h('p', {class: 'muted xs'}, `등록 ${stamp(w.at)} · 그때 ${won(w.price)}(${korDate(w.date)}) · 지금 `, c ? `${won(c.close)}(${korDate(c.date)})` : '이 판에 없음'),
        candLine(C, w),
        (() => { const s = since(w); return h('p', {class: 'wl-seen'}, h('b', null, '등록 뒤 확인된 것'), ' · ', s ? [`새 공시 ${s.n}건${s.top ? `(★★★ ${s.top}건)` : ''}`, ' · ', s.next ? `다가오는 일정 ${s.up}건 · 가장 가까운 날 ${korDate(s.next.date)}` : '다가오는 일정 없음'] : '일정표에 없음'); })(),
        h('dl', {class: 'wl-dl'}, h('dt', null, '등록 이유'), h('dd', {lang: 'ko'}, w.reason || '적지 않음'), h('dt', null, '반대 근거'), h('dd', {lang: 'ko'}, w.counter || '적지 않음'), h('dt', null, '확인할 조건'), h('dd', null, h('span', {lang: 'ko'}, w.next || '적지 않음'), w.next ? h('small', {class: 'wl-open'}, ' · 아직 확인 안 됨(ATLAS가 판정하지 않음 · 직접 확인)') : null)),
        h('button', {class: 'b-link', type: 'button', onclick: () => { watchRemove(w.code); draw(); }}, '관심에서 빼기')); }));
    if (!xs.length) list.replaceChildren(h('li', {class: 'muted small'}, '관심 등록한 종목이 없습니다 · 회사 화면의 「★ 관심 등록」으로 남깁니다'));
    state.summary = `관심종목 ${xs.length}곳 · 이 기기에만 저장`;
    return xs.length;
  };
  const n = draw();
  main.replaceChildren(h('div', {class: 'b-page wl-page'},
    h('section', {class: 'mk-b', 'data-first': '1', 'aria-label': '관심 · 추적'}, h('h2', {class: 'mk-h'}, '★ 관심 · 추적'),
      h('p', {class: 'mk-l'}, h('b', null, `${n}곳`), ` · ${korDate(board.asOf)} 종가와 견줌 · 후보 조건이 등록 뒤 어떻게 달라졌나 · 이 기기에만 저장(다른 기기 · 계정과 맞춰지지 않음)`)),
    list,
    watchArt(n),
    h('p', {class: 'muted xs'}, '관심 등록은 공식 순위 · 선정 기록을 바꾸지 않습니다'),
    h('details', {class: 'b-how'}, h('summary', null, '계산 · 출처 자세히'), h('p', {class: 'muted xs'}, '등록 뒤 수익률(%) = 등록 때 종가에서 지금 종가까지 변화율')), // 산식은 접힘(다른 탭과 같은 「계산 · 출처」)
    foot(manifest)));
}
