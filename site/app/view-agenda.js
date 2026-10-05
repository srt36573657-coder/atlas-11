/* ATLAS 11 · 「일정」(#/agenda) — 지금 묶음(180곳)에 걸린 다가오는 일정과 공시를 한곳에 · 예측 없음
   2026-10-04 08:18 사장님 「그 회사들 예정된 뉴스나 공시 나타나게 해주고 얼마나 중요한지 표기해줘」 · 15:37 「이제 예측을 하지 않는다」
   ① 시장 전체 일정(모든 회사) ② 회사·업종 일정 — 날짜마다 묶고, 같은 일정이 여러 회사에 걸리면 한 줄에 회사 이름 여럿
   ③ 앞으로 있을 일을 알리는 공시(예고·알림) ④ 아주 중요(★★★) 공시 — 지난 30일. 중요도는 종류로 매긴 ATLAS 규칙(주가에 미친 크기가 아님). */
import {h, korDate} from './util.js';
import {state, loadAgenda} from './store.js';
import {marketStrip} from './frame.js';
import {eventLine, disclosureLine, marketBox, howBox, foot} from './parts.js';

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
  state.summary = `일정. 다가오는 회사·업종 일정 ${list.length}건, 시장 전체 일정 ${(agenda.market ?? []).length}건.`;
  main.replaceChildren(h('div', {class: 'b-page a-page'},
    marketStrip(manifest),
    h('header', {class: 'b-head'},
      h('h1', {class: 'b-title', 'data-speak': ''}, '일정'),
      h('p', {class: 'b-when', 'data-speak': ''}, `${korDate(agenda.builtDay)}부터 · ${manifest.universeSet?.label ?? n + '곳'}에 걸린 일정`),
      h('p', {class: 'b-lead'}, '확인된 일정만 모았습니다(일정마다 공식 출처) · 별(★)은 일정·공시의 종류로 매긴 중요도입니다')),
    marketBox(agenda, {max: 0}),
    h('section', {class: 'b-box', 'aria-label': '회사·업종 일정'},
      h('h2', {class: 'b-box-h'}, `회사·업종 일정 ${list.length}건`, h('small', null, ' · 날짜 차례')),
      list.length ? h('div', {class: 'a-days'}, ...days.map(d => h('section', {class: 'a-day'}, h('h3', {class: 'a-day-h'}, korDate(d)), h('ul', {class: 'ag-list'}, ...list.filter(e => e.date === d).map(e => eventLine(e, {who: e.who, withRoute: true, date: false})))))) : h('p', {class: 'muted small'}, '확인된 회사·업종 일정 없음'),
      agenda.eventsHidden ? h('p', {class: 'muted xs'}, `앞날을 짐작하는 말이 든 일정 이름 ${agenda.eventsHidden}건은 싣지 않음`) : null),
    h('section', {class: 'b-box', 'aria-label': '예고 공시'},
      h('h2', {class: 'b-box-h'}, `예고·알림 공시 ${notices.length}건`, h('small', null, ` · 지난 ${dd?.windowDays ?? 30}일에 낸 것`)),
      h('p', {class: 'muted xs'}, '실적 발표 · 설명회 · 주주총회 · 기준일처럼 앞으로 있을 회사 일을 알린 공시입니다 · 그 날짜는 공시 원문에 있습니다'),
      notices.length ? h('ul', {class: 'ag-list'}, ...notices.map(d => disclosureLine(d, {who: d.who}))) : h('p', {class: 'muted small'}, '예고·알림 공시 없음')),
    h('section', {class: 'b-box', 'aria-label': '아주 중요한 공시'},
      h('h2', {class: 'b-box-h'}, `아주 중요(★★★) 공시 ${big.length}건`, h('small', null, ` · 지난 ${dd?.windowDays ?? 30}일`)),
      big.length ? h('ul', {class: 'ag-list'}, ...big.map(d => disclosureLine(d, {who: d.who}))) : h('p', {class: 'muted small'}, '아주 중요(★★★) 공시 없음'),
      dd?.day ? h('p', {class: 'muted xs'}, `공시는 ${korDate(dd.day)}까지 받은 것 · 출처 ${dd.provider}`) : null),
    howBox(agenda),
    foot(manifest)));
}
