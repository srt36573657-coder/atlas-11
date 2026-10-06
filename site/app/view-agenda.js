/* ATLAS 11 · 「일정」(#/agenda) — 지금 묶음(180곳)에 걸린 다가오는 일정과 공시를 한곳에 · 예측 없음
   2026-10-04 08:18 사장님 「그 회사들 예정된 뉴스나 공시 나타나게 해주고 얼마나 중요한지 표기해줘」 · 15:37 「이제 예측을 하지 않는다」
   ⓪ 바뀔 회사 묶음 미리 보기(있을 때만 · 10/5 첫 화면에서 옮김) ① 시장 전체 일정(모든 회사) ② 회사·업종 일정 — 날짜마다 묶고, 같은 일정이 여러 회사에 걸리면 한 줄에 회사 이름 여럿
   ③ 앞으로 있을 일을 알리는 공시(예고·알림) ④ 아주 중요(★★★) 공시 — 지난 30일. 중요도는 종류로 매긴 ATLAS 규칙(주가에 미친 크기가 아님). */
import {h, korDate, place} from './util.js';
import {state, loadAgenda} from './store.js';
import {marketStrip} from './frame.js';
import {eventLine, disclosureLine, marketBox, howBox, foot, nextBox} from './parts.js';
import {agendaComment, commentBox, commentSay} from './comment.js'; // 논평(2026-10-07 03:17)

/** 긴 공시 목록은 앞 10건만 펼치고 나머지는 접는다(2026-10-05 15:24 「잡스가 … 36가지」 D1 · D2 — 일정 화면이 휴대폰 화면 열여덟 장 길이라)
   접힌 줄도 같은 목록 안에 그대로 있다(지우지 않음 · 화면 읽기 프로그램과 검사기는 모두 셈) · 12건 이하면 접지 않는다 */
const FOLD = 10;
function foldList(items, line, what) {
  if (items.length <= FOLD + 2) return h('ul', {class: 'ag-list'}, ...items.map(line));
  return h('div', {class: 'ag-folded'}, h('ul', {class: 'ag-list'}, ...items.slice(0, FOLD).map(line)),
    h('details', {class: 'ag-fold'}, h('summary', null, `${what} ${items.length - FOLD}건 더 보기`, h('small', null, ` · 모두 ${items.length}건`)), h('ul', {class: 'ag-list'}, ...items.slice(FOLD).map(line))));
}

export async function renderAgenda(main, {manifest}) {
  const agenda = await loadAgenda();
  const evs = new Map(), notices = [], big = [];
  for (const [code, e] of Object.entries(agenda.byCode ?? {})) {
    for (const ev of e.upcoming ?? []) { const x = evs.get(ev.id) ?? {...ev, who: []}; x.who.push({code, name: e.name}); evs.set(ev.id, x); }
    for (const d of e.disclosures ?? []) { if (d.notice) notices.push({...d, who: {code, name: e.name}}); else if (d.level === 3) big.push({...d, who: {code, name: e.name}}); }
  }
  const list = [...evs.values()].sort((a, b) => a.date.localeCompare(b.date) || b.level - a.level || a.name.localeCompare(b.name, 'ko'));
  const days = [...new Set(list.map(e => e.date))];
  const byNew = (a, b) => b.publishedAt.localeCompare(a.publishedAt) || a.who.name.localeCompare(b.who.name, 'ko');
  notices.sort(byNew); big.sort(byNew);
  const n = agenda.byCode ? Object.keys(agenda.byCode).length : 0, dd = agenda.sources?.disclosures;
  const cm = agendaComment([...(agenda.market ?? []), ...list]);
  state.summary = `${commentSay(cm)}일정. 다가오는 회사·업종 일정 ${list.length}건, 시장 전체 일정 ${(agenda.market ?? []).length}건.`;
  main.replaceChildren(h('div', {class: 'b-page a-page'},
    marketStrip(manifest),
    h('header', {class: 'b-head'},
      h('h1', {class: 'b-title', 'data-speak': ''}, '일정'),
      commentBox(cm),
      h('p', {class: 'b-when', 'data-speak': ''}, `${korDate(agenda.builtDay)}부터 · ${manifest.universeSet?.label ?? n + '곳'}에 걸린 일정`),
      h('p', {class: 'b-lead'}, '확인된 일정만 모았습니다(일정마다 공식 출처) · 별(★)은 일정·공시의 종류로 매긴 중요도입니다')),
    nextBox(manifest.universeNext), // 바뀔 회사 묶음 미리 보기 — 「무엇이 다가오나」라 일정 탭으로(2026-10-05 「잡스라면」 9번 · 오늘 판과 섞이지 않게)
    marketBox(agenda, {max: 0}),
    h('section', {class: 'b-box', 'aria-label': '회사·업종 일정'},
      h('h2', {class: 'b-box-h'}, `회사·업종 일정 ${list.length}건`, h('small', null, ' · 날짜 차례')),
      list.length ? h('div', {class: 'a-days'}, ...days.map(d => h('section', {class: 'a-day'}, h('h3', {class: 'a-day-h'}, korDate(d)), h('ul', {class: 'ag-list'}, ...list.filter(e => e.date === d).map(e => eventLine(e, {who: e.who, withRoute: true, date: false})))))) : h('p', {class: 'muted small'}, '확인된 회사·업종 일정 없음'),
      agenda.eventsHidden ? h('p', {class: 'muted xs'}, `앞날을 짐작하는 말이 든 일정 이름 ${agenda.eventsHidden}건은 싣지 않음`) : null),
    // 미국 판: 공시를 아직 싣지 않는다 — 「공시 0건 · 없음」 두 칸 대신 그렇다고 한 칸(util.js place.disclosures === false · 2026-10-05 18:02 「미국 주식도」)
    place.disclosures === false ? h('section', {class: 'b-box', 'aria-label': '공시'}, h('h2', {class: 'b-box-h'}, '공시'), h('p', {class: 'muted small'}, place.disclosuresNone ?? '공시 자료 없음')) : null,
    place.disclosures === false ? null : h('section', {class: 'b-box', 'aria-label': '예고 공시'},
      h('h2', {class: 'b-box-h'}, `예고·알림 공시 ${notices.length}건`, h('small', null, ` · 지난 ${dd?.windowDays ?? 30}일에 낸 것`)),
      h('p', {class: 'muted xs'}, '실적 발표 · 설명회 · 주주총회 · 기준일처럼 앞으로 있을 회사 일을 알린 공시입니다 · 그 날짜는 공시 원문에 있습니다'),
      notices.length ? foldList(notices, d => disclosureLine(d, {who: d.who}), '예고·알림 공시') : h('p', {class: 'muted small'}, '예고·알림 공시 없음')),
    place.disclosures === false ? null : h('section', {class: 'b-box', 'aria-label': '아주 중요한 공시'},
      h('h2', {class: 'b-box-h'}, `아주 중요(★★★) 공시 ${big.length}건`, h('small', null, ` · 지난 ${dd?.windowDays ?? 30}일`)),
      big.length ? foldList(big, d => disclosureLine(d, {who: d.who}), '아주 중요 공시') : h('p', {class: 'muted small'}, '아주 중요(★★★) 공시 없음'),
      dd?.day ? h('p', {class: 'muted xs'}, `공시는 ${korDate(dd.day)}까지 받은 것 · 출처 ${dd.provider}`) : null),
    howBox(agenda),
    foot(manifest)));
}
