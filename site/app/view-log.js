/* ATLAS 11 · 「기록」(#/log · 아래 탭 여섯째) — 사장님 2026-10-06 16:10
   「업데이트한 날짜랑 자료 변경한 날짜를 업데이트한 내용을 별도의 탭에다가 해가지고 뭘 어떻게 변화 시켰는지에 대해서 기록 하는 탭을 만들어 줘」
   · 업데이트 = 화면을 바꾼 것 · 자료 변경 = 자료가 바뀐 것(새 종가 · 모은 수급·기사·공시 · 저녁 들고 남 · 회사 목록)
   · 새것이 위 · 날짜마다 묶음 · 시각 = 사이트에 올라간 때 · 줄마다 무엇 · 뺀 것(규칙 1) · 까닭(사장님 지시) · 커밋
   · 맨 위 [모두 · 이슈 · 업데이트 · 자료 변경] — 한 번 눌러 거름(화면 안에서만 · 주소는 그대로)
   · 이슈(2026-10-06 18:37 「이날 어떤 이슈들이 있었는지도 이슈칸을 만들어서 기록해 좋은방법으로」) = 새 종가 날마다 한 줄 —
     지수 · 원/달러 · 오른/내린 곳 수 · 가장 오른/내린 회사 · 업종 평균 · 제목에 이름이 나온 기사 · 회사 일 공시(모은 자료로만 · 앞날 말 없음 · 출처 줄)
   · 기록 파일은 사이트 맨 위 /changelog.json 하나(한국 · 미국 판이 함께 · scripts/atlas11/package.mjs 가 reports/atlas11/changelog 에서 모음)
   넣으면서 뺀 것(규칙 1): 모든 화면 맨 아래 「기술 정보」 접힘(만든 시각 · 판 이름 · 무결성) — 이 탭 맨 아래로 옮김
   이슈를 넣으면서 뺀 것(규칙 1): 목록 아래 「기록은 …부터」 한 줄 — 「기술 정보」 접힘 안으로 옮김 */
import {h, korDate, stamp, place} from './util.js';
import {state, loadBoard} from './store.js';
import {foot} from './parts.js';
import {integrityText} from './frame.js';

const KIND = {issue: '이슈', update: '업데이트', data: '자료 변경'}, PLACE = {kr: '한국 판', us: '미국 판'};
const SHOW = [['all', '모두'], ['issue', KIND.issue], ['update', KIND.update], ['data', KIND.data]];
const esc = t => t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
/** 이름 속 숫자는 식별자(또렷함 검사 3번에서 단위 없는 숫자로 세지 않음) — S&P 500 + 기록 줄이 적어 둔 이름(e.idents · 필립스 66 같은) */
const identRe = (extra = []) => new RegExp(`(${['S&P 500', ...extra].filter(Boolean).sort((a, b) => b.length - a.length).map(esc).join('|')})`);
const IDENT = identRe();
let show = 'all'; // 모두 · issue · update · data — 탭을 다시 열어도 고른 그대로(창을 닫으면 처음으로)
let cached = null;

const withIdent = (t, re = IDENT) => String(t).split(re).map(p => (re.test(p) ? h('span', {'data-ident': ''}, p) : p));
/** 까닭 줄의 사장님 말씀 · 이슈 줄의 기사 제목 · 공시 제목 「…」은 원문 그대로라 식별자(「왜 3단 클릭 구조가 아니지?」의 숫자를 우리 글로 세지 않음) */
const QUOTE = /(「[^」]*」)/;
const withQuote = (t, re = IDENT) => String(t).split(QUOTE).flatMap(p => (QUOTE.test(p) ? [h('span', {'data-ident': '', lang: 'ko'}, p)] : withIdent(p, re))); // 「…」 원문은 언어판에서도 그대로
async function loadLog() {
  if (cached) return cached;
  const r = await fetch('/changelog.json', {cache: 'no-cache'});
  if (!r.ok) throw Error(`기록 파일을 읽지 못했습니다 (HTTP ${r.status})`);
  const log = await r.json();
  if (log?.schema !== 'atlas11-changelog-1' || !Array.isArray(log.entries)) throw Error('기록 파일 모양이 다릅니다');
  cached = log; return log;
}

function item(e) {
  const re = e.idents?.length ? identRe(e.idents) : IDENT;
  const orig = e.kind === 'update' ? 'ko' : null; // 업데이트 글은 손으로 쓴 원문(언어판에서도 한국어 그대로) · 자료 변경 · 이슈 줄은 틀로 만든 글이라 바뀜
  return h('li', {class: 'lg-item', 'data-kind': e.kind, 'data-id': e.id},
    h('p', {class: 'lg-top'},
      h('span', {class: 'lg-kind lg-' + e.kind}, KIND[e.kind]),
      PLACE[e.place] ? h('span', {class: 'lg-place'}, PLACE[e.place]) : null,
      h('time', {class: 'lg-time', datetime: e.live}, e.live.slice(11, 16))),
    h('h3', {class: 'lg-title', lang: orig}, ...withIdent(e.title, re)),
    h('ul', {class: 'lg-what', lang: orig}, ...e.what.map(w => h('li', null, ...withQuote(w, re)))),
    ...(e.fixed ?? []).map(f => h('p', {class: 'lg-fixed muted xs'}, `${korDate(f.made.slice(0, 10))} ${f.made.slice(11, 16)} 업데이트가 이 기록의 글 한 줄을 고침 — 옛 글은 기록 파일에 그대로`)), // 고침(2026-10-07 · 규칙 8 — 파일은 고치지 않음)
    e.removed?.length ? h('p', {class: 'lg-removed'}, h('b', null, '뺀 것 '), h('span', {lang: orig}, e.removed.join(' · '))) : null,
    e.why ? h('p', {class: 'lg-why muted small'}, '까닭 · ', h('span', {lang: 'ko'}, ...withQuote(e.why))) : null,
    e.commits?.length ? h('p', {class: 'lg-commits muted xs'}, '커밋 ', ...e.commits.flatMap((c, i) => [i ? ' · ' : null, h('code', null, c)])) : null,
    e.source ? h('p', {class: 'lg-src muted xs'}, '출처 · ', ...withIdent(e.source, re)) : null);
}

/** 날짜(사이트에 올라간 날)마다 묶어 새것이 위 */
function days(entries) {
  const by = new Map();
  for (const e of entries) { const d = e.live.slice(0, 10); if (!by.has(d)) by.set(d, []); by.get(d).push(e); }
  return [...by].map(([d, es]) => h('li', {class: 'lg-day', 'data-date': d},
    h('h2', {class: 'lg-date'}, korDate(d), h('small', {class: 'lg-n'}, ` ${es.length}개`)),
    h('ol', {class: 'lg-items'}, ...es.map(item))));
}

export async function renderLog(main, {manifest} = {}) {
  const m = manifest ?? state.manifest;
  let board = null; try { board = await loadBoard(); } catch {} // 판 이름 · 무결성(읽은 파일)을 이 탭에서 보이려고
  let log = null, err = null; try { log = await loadLog(); } catch (e) { err = e; }
  const all = log?.entries ?? [], n = {all: all.length, ...Object.fromEntries(Object.keys(KIND).map(k => [k, all.filter(e => e.kind === k).length]))};
  const list = h('ol', {class: 'lg-days', 'aria-label': '기록 · 새것이 위'});
  const seg = h('nav', {class: 'f-seg lg-seg', 'aria-label': '모두 · 이슈 · 업데이트 · 자료 변경 고르기'},
    ...SHOW.map(([id, label]) => h('button', {class: 'f-seg-b hs-b lg-b', type: 'button', 'data-show': id, 'aria-pressed': String(show === id),
      onclick: () => { show = id; for (const b of seg.querySelectorAll('button')) b.setAttribute('aria-pressed', String(b.dataset.show === id)); fill(); }},
    h('span', {class: 'hs-l'}, label), h('small', {class: 'hs-n'}, `${n[id]}개`))));
  const fill = () => {
    const es = all.filter(e => show === 'all' || e.kind === show);
    list.replaceChildren(...days(es));
    const top = es[0];
    state.summary = err ? '기록. 기록 파일을 읽지 못했습니다.' : `기록. ${show === 'all' ? `이슈 ${n.issue}개, 업데이트 ${n.update}개, 자료 변경 ${n.data}개` : `${KIND[show]} ${es.length}개`}. 가장 새것은 ${top ? `${korDate(top.live.slice(0, 10))} ${top.live.slice(11, 16)}, ${top.title}` : '없음'}.`;
  };
  const tech = h('details', {class: 'b-tech lg-tech'}, h('summary', null, '기술 정보'),
    h('p', null, `자료를 만든 시각 ${stamp(m?.generatedAt)} · 판 `, h('code', null, m?.boardId ?? '없음')),
    board ? h('p', null, `판: 회사 ${board.companies.length}곳 · 업종 ${board.groups?.length ?? 0}개 · ${korDate(board.asOf)} ${place.closeAt} 종가`) : null,
    h('p', null, '무결성: ', h('span', {class: 'integrity-text'}, integrityText())),
    log ? h('p', null, `기록 파일을 만든 시각 ${stamp(log.generatedAt)} · `, h('code', null, '/changelog.json')) : null,
    h('p', {class: 'lg-from'}, `기록은 ${log?.from ? korDate(log.from.slice(0, 10)) : '10월 5일(월)'}부터 — 저장소가 그때 새로 시작해 그 전 기록은 없음 · 한 줄 한 파일로 쌓기만 하고 고치지 않음 · 이슈는 종가 날짜마다 한 번`));

  main.replaceChildren(h('div', {class: 'b-page lg-page'},
    h('header', {class: 'b-head'},
      h('h1', {class: 'b-title', 'data-speak': ''}, '기록 ', h('span', {class: 'b-count'}, `${n.all}개`)),
      h('p', {class: 'b-when', 'data-speak': ''}, '그 날 장 이슈 · 화면을 바꾼 날(업데이트) · 자료가 바뀐 날(자료 변경) · 새것이 위'),
      h('p', {class: 'i-src muted small'}, `시각 = 사이트에 올라간 때 · 이 화면 자료 ${korDate(m?.asOf)} ${place.closeAt} 종가`)),
    seg,
    err ? h('p', {class: 'b-note', role: 'status'}, `기록을 읽지 못했습니다 · ${err.message}`) : list,
    tech,
    foot(m)));
  fill();
}
