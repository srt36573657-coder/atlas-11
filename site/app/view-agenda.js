/* ATLAS 11 · 「일정」(#/agenda) — 지금 묶음(180곳)에 걸린 다가오는 일정과 공시를 한곳에 · 예측 없음
   2026-10-04 08:18 사장님 「그 회사들 예정된 뉴스나 공시 나타나게 해주고 얼마나 중요한지 표기해줘」 · 15:37 「이제 예측을 하지 않는다」
   ⓪ 바뀔 회사 묶음 미리 보기(있을 때만 · 10/5 첫 화면에서 옮김) ① 시장 전체 일정(모든 회사) ② 회사·업종 일정 — 날짜마다 묶고, 같은 일정이 여러 회사에 걸리면 한 줄에 회사 이름 여럿
   ③ 앞으로 있을 일을 알리는 공시(예고·알림) ④ 아주 중요(★★★) 공시 — 지난 30일. 중요도는 종류로 매긴 ATLAS 규칙(주가에 미친 크기가 아님). */
import {agendaArt, agendaEmptyArt} from './scenes.js'; // 그림 한 장(달이 그날로 · 규칙 33) · 일정 자료를 못 읽은 날은 화면 오류(app.js failure — 그 화면도 빈 하늘)
import {h, korDate, place} from './util.js';
import {state, loadAgenda} from './store.js';
import {marketStrip} from './frame.js';
import {eventLine, disclosureLine, marketBox, howBox, foot, nextBox} from './parts.js';
import {agendaComment, commentSay} from './comment.js'; // 논평(2026-10-07 03:17)
import {loadLens, loadBoard} from './store.js';
import {pv, idxName} from './lensparts.js';
import {LV, LV_WORD} from './parts.js';

/* 사건 카드(2026-10-08 20:19 「ATLAS 개편 실행 지시서」 8) — 날짜 · 시간대 · 받은 날 · 확정 여부 · 원문 · 직접 관련 종목 · 업종 참고 종목 · 중요 이유 · 발표 뒤 확인할 것
   · 설명 차례: 새 사실 → 기업에 미치는 경로 → 규모 → 반영 시점 → 미확인 · 업종 행사는 회사 확정 일정이 아님 · 중요도(별)와 호재 · 악재 방향을 나눔(방향은 매기지 않음)
   · 지난 일정: 그날 지수 · 관련 종목 하루 변화를 보이되 인과로 단정하지 않음 · 예상치가 없는 사건에 예상값을 만들지 않음 */
const STATUS_EV = {scheduled: '확정 일정(공식 출처)', announced: '발표된 사실(공식 출처)'};
function evCard(e, lens, nameOf) {
  const co = codes => codes.flatMap((c, i) => [i ? ' · ' : null, h('a', {href: '#/stock/' + c}, h('span', {'data-ident': ''}, nameOf.get(c) ?? c))]);
  const sure = e.scope === 'sector' ? '업종 행사 — 회사 참가 확인 안 됨(회사 확정 일정 아님)' : STATUS_EV[e.status] ?? '확인 안 됨';
  return h('li', {class: 'ev-card', 'data-event': e.id},
    h('p', {class: 'ev-h'}, e.level ? h('b', {class: 'lv lv' + e.level, title: LV_WORD[e.level]}, LV[e.level]) : null, ' ', h('span', {class: 'ag-date'}, korDate(e.date)), ' ', h('span', {'data-ident': '', lang: e.scope === 'market' ? null : 'ko'}, e.name)),
    h('p', {class: 'ev-l muted xs'}, `새 사실: ${sure} → 경로: `, h('span', {'data-ident': '', lang: 'ko'}, e.route ?? '—'), ' → 규모: 재지 않음 → 반영 시점: ', korDate(e.date), ' → 미확인: 실제 내용 · 크기'),
    h('ul', {class: 'cd-l'},
      h('li', null, h('b', null, '날짜 · 시간대'), ` · ${korDate(e.date)} · 시각은 원문 기준(저장 안 함)`, e.seen ? ` · 받은 날 ${korDate(e.seen)}` : ''),
      h('li', null, h('b', null, '원문'), ' · ', ...e.sources.slice(0, 2).flatMap((x, i) => [i ? ' · ' : null, x.url ? h('a', {href: x.url, target: '_blank', rel: 'noopener noreferrer', 'data-ident': '', lang: 'ko'}, x.name ?? '출처') : h('span', {'data-ident': '', lang: 'ko'}, x.name ?? '출처')])),
      e.direct.length ? h('li', null, h('b', null, '직접 관련 종목'), ' · ', ...co(e.direct)) : null,
      e.nRef ? h('li', null, h('b', null, '업종 참고 종목'), ` · ${e.nRef}곳 · `, ...co(e.ref.slice(0, 5))) : null,
      h('li', null, h('b', null, '중요 이유'), e.level ? ` · ${LV_WORD[e.level]} — 종류로 매긴 ATLAS 규칙` : ' · 중요도 매기지 않음', ' · 호재 · 악재 방향은 매기지 않음'),
      e.after ? h('li', null, h('b', null, '그 뒤 관측(인과 아님)'), e.after.session ? [` · 그날 ${idxName(lens)} `, pv(e.after.idx), ...e.after.stocks.flatMap(x => [' · ', h('span', {'data-ident': ''}, nameOf.get(x.code) ?? x.code), ' ', pv(x.day)])] : ' · 그날은 장이 열리지 않음')
        : h('li', null, h('b', null, '발표 뒤 확인할 것'), ' · 원문의 실제 내용 · 그날 관련 종목 종가 · 지수 하루 변화')));
}
function eventsBox(lens, board) {
  const ev = lens?.events ?? []; if (!ev.length) return null;
  const nameOf = new Map(board.companies.map(c => [c.code, c.name])), up = ev.filter(e => e.date >= lens.asOf), past = ev.filter(e => e.date < lens.asOf).reverse();
  return h('section', {class: 'b-box ev-box', 'aria-label': '사건 카드'},
    h('h2', {class: 'b-box-h'}, `사건 카드 ${ev.length}건`, h('small', null, ' · 확인된 일정표 · 일정마다 공식 출처')),
    h('h3', {class: 'ag-h'}, `다가오는 것 ${up.length}건`), up.length ? h('ol', {class: 'ev-list'}, ...up.slice(0, 12).map(e => evCard(e, lens, nameOf))) : h('p', {class: 'muted small'}, '없음'),
    up.length > 12 ? h('p', {class: 'muted xs'}, `그 밖 ${up.length - 12}건은 아래 날짜별 목록`) : null,
    h('h3', {class: 'ag-h'}, `지난 것 ${past.length}건`, h('small', null, ' · 그 뒤 관측은 인과가 아님')), past.length ? h('ol', {class: 'ev-list'}, ...past.slice(0, 8).map(e => evCard(e, lens, nameOf))) : h('p', {class: 'muted small'}, '없음'),
    h('p', {class: 'muted xs'}, '설명 차례: 새 사실 → 경로 → 규모 → 반영 시점 → 미확인 · 같은 발표를 되풀이한 기사는 한 사건 · 이름이 비슷하다는 까닭만으로 다른 회사 기사를 붙이지 않음'));
}

/** 긴 공시 목록은 앞 10건만 펼치고 나머지는 접는다(2026-10-05 15:24 「잡스가 … 36가지」 D1 · D2 — 일정 화면이 휴대폰 화면 열여덟 장 길이라)
   접힌 줄도 같은 목록 안에 그대로 있다(지우지 않음 · 화면 읽기 프로그램과 검사기는 모두 셈) · 12건 이하면 접지 않는다 */
const FOLD = 10;
function foldList(items, line, what) {
  if (items.length <= FOLD + 2) return h('ul', {class: 'ag-list'}, ...items.map(line));
  return h('div', {class: 'ag-folded'}, h('ul', {class: 'ag-list'}, ...items.slice(0, FOLD).map(line)),
    h('details', {class: 'ag-fold'}, h('summary', null, `${what} ${items.length - FOLD}건 더 보기`, h('small', null, ` · 모두 ${items.length}건`)), h('ul', {class: 'ag-list'}, ...items.slice(FOLD).map(line))));
}

export async function renderAgenda(main, {manifest}) {
  const [agenda, lens0, board] = await Promise.all([loadAgenda(), loadLens().catch(() => null), loadBoard().catch(() => null)]);
  const lens = lens0 && !lens0.none ? lens0 : null;
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
  const cm = agendaComment([...(agenda.market ?? []), ...list], agenda.builtDay ?? null);
  state.summary = `${commentSay(cm)}일정. 다가오는 회사·업종 일정 ${list.length}건, 시장 전체 일정 ${(agenda.market ?? []).length}건.`;
  main.replaceChildren(h('div', {class: 'b-page a-page'},
    agendaArt(cm, [...(agenda.market ?? []), ...list]) ?? agendaEmptyArt(agenda, list.length), // 2026-10-09 날짜 축(점 = 일정 · 테 = 가장 중요한 일정) // 일정이 없는 판도 그림 한 장(빈 하늘 · 일정 0건 · agenda 가 있으면 늘 그림 — 논평 무대를 뺌 · 규칙 1) // 그림 한 장(달이 그날로 · 규칙 33) — 넣으면서 뺀 것: 논평 무대 · 머리 아래 설명 한 줄(「어떻게 셌나」로 접음)
    marketStrip(manifest),
    h('header', {class: 'b-head'},
      h('h1', {class: 'b-title', 'data-speak': ''}, '일정'),
      h('p', {class: 'b-when', 'data-speak': ''}, `${korDate(agenda.builtDay)}부터 · ${manifest.universeSet?.label ?? n + '곳'}에 걸린 일정`),
      h('details', {class: 'b-how ak-more'}, h('summary', null, '어떻게 셌나'), h('p', {class: 'b-lead'}, '확인된 일정만 모았습니다(일정마다 공식 출처) · 별(★)은 일정·공시의 종류로 매긴 중요도입니다'))),
    nextBox(manifest.universeNext), // 바뀔 회사 묶음 미리 보기 — 「무엇이 다가오나」라 일정 탭으로(2026-10-05 「잡스라면」 9번 · 오늘 판과 섞이지 않게)
    marketBox(agenda, {max: 0}),
    lens && board ? eventsBox(lens, board) : null, // 사건 카드(지시서 8)
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
