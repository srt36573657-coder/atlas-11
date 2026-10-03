/* ATLAS 11 · 「오를 쪽」·「내릴 쪽」 쪽(#/up · #/down)
   2026-10-04 08:19 사장님 「정리 정돈 하자 — 상승할 것 같은 회사들만 한곳에, 그렇지 않은 회사들도 한곳으로 · 페이지 만들어서」
     · 「바카라 그 표가 곳곳에 다 들어가 있게」 · 「그 회사들 예정된 뉴스나 공시 나타나게 해주고 얼마나 중요한지 표기」 · 「처음부터 다시 해」
   한 쪽 = 한 묶음. 회사마다: 이름(누르면 종목 화면) · ATLAS 확률 · 출목표(지난 20거래일) · 힘 저울 두 줄 · 흐름 한 마디 · 다가오는 일정(★) · 지난 30일 공시(★)
   시장 전체 일정(미국 금리·물가, 한국은행)은 모든 회사에 해당하므로 쪽 맨 위에 한 번만.
   묶음 나누기는 첫 화면 원과 같다: ATLAS 선택이 오름이면 오를 쪽, 내림이면 내릴 쪽(보합이면 등락 부호) · 「거의 반반」은 점선 테두리.
   전망 숫자에는 data-forecast-date(내일 하나) · 일정·공시는 전망이 아니므로 그 표시를 달지 않는다.
   일정 이름·공시 제목은 공식 이름 그대로라(「SEDEX 2026」 · 「2단계 가격제한폭」) 또렷함 검사에서 식별자(data-ident)로 센다 — 우리 숫자가 아님. */
import {h, won, pct, prob, korDate, weekday, finite} from './util.js';
import {state, loadCards, loadJSON} from './store.js';
import {roadOf, roadSvg, roadKey, unitText} from './road.js';

const longDate = d => d ? `${Number(d.slice(5, 7))}월 ${Number(d.slice(8, 10))}일 ${weekday(d)}요일` : '';
const md = d => d ? `${Number(d.slice(5, 7))}월 ${Number(d.slice(8, 10))}일` : '';
export const LV = {3: '★★★', 2: '★★', 1: '★'};
export const LV_WORD = {3: '아주 중요', 2: '중요', 1: '참고'};

/** 카드 → 줄(첫 화면 view-tomorrow.js 와 같은 나누기) */
export function rowsOf(cardsDoc, tomorrow) {
  return (cardsDoc.cards ?? []).filter(c => c.day1).map(c => {
    const d1 = c.day1, sel = d1.selected === 'up' || d1.selected === 'down' ? d1.selected : (finite(d1.return) && d1.return < 0 ? 'down' : 'up');
    return {code: c.code, name: c.name, sector: c.sector, close: c.close, anchorDate: c.anchorDate, c: c.c ?? null, sel, half: Boolean(d1.closeCall || d1.statisticalTie || (d1.selected !== 'up' && d1.selected !== 'down')), p: d1.probabilities?.[sel], p50: d1.p50, ret: d1.return, date: d1.date ?? tomorrow};
  });
}
export const sideRows = (rows, side) => rows.filter(r => r.sel === side).sort((a, b) => Number(a.half) - Number(b.half) || (b.p ?? 0) - (a.p ?? 0) || (side === 'up' ? (b.ret ?? 0) - (a.ret ?? 0) : (a.ret ?? 0) - (b.ret ?? 0)) || a.code.localeCompare(b.code));

/** 일정 한 줄: ★ · 날짜 · 이름 · (출처) */
export function eventLine(e, {withRoute = false} = {}) {
  return h('li', {class: 'ag-li', 'data-level': e.level},
    h('b', {class: 'lv lv' + e.level, title: LV_WORD[e.level], 'aria-label': `${LV_WORD[e.level]}(별 ${e.level}개)`}, LV[e.level]),
    h('span', {class: 'ag-date'}, korDate(e.date)),
    h('span', {class: 'ag-name', 'data-ident': ''}, e.name, withRoute && e.scope === 'sector' ? h('span', {class: 'ag-route', title: e.route ?? ''}, ' · 업종 행사') : null),
    e.source?.url ? h('a', {class: 'ag-src', href: e.source.url, target: '_blank', rel: 'noopener noreferrer', title: e.source.name ?? '공식 출처'}, '출처') : null);
}
/** 공시 한 줄: ★ · 공시한 날 · 제목 · (예고·알림) */
export function disclosureLine(d) {
  return h('li', {class: 'ag-li', 'data-level': d.level},
    h('b', {class: 'lv lv' + d.level, title: LV_WORD[d.level], 'aria-label': `${LV_WORD[d.level]}(별 ${d.level}개)`}, LV[d.level]),
    h('span', {class: 'ag-date'}, korDate(d.publishedAt.slice(0, 10))),
    h('span', {class: 'ag-name', 'data-ident': ''}, d.title), d.times > 1 ? h('span', {class: 'ag-times'}, ` ${d.times}건`) : null, d.notice ? h('span', {class: 'ag-notice'}, d.notice) : null);
}
/** 회사 한 곳의 일정·공시 칸 — max: 일정·공시 각각 몇 줄까지(0 이면 모두) */
export function agendaBox(entry, {max = 3, builtDay = null} = {}) {
  if (!entry) return h('div', {class: 's-ag'}, h('p', {class: 'muted small'}, '일정·공시 표를 읽지 못했습니다.'));
  const up = entry.upcoming ?? [], disc = entry.disclosures ?? [], cut = list => max ? list.slice(0, max) : list;
  return h('div', {class: 's-ag'},
    h('h3', {class: 's-ag-h'}, `다가오는 일정 ${up.length}건`, h('small', null, ' · 회사·업종')),
    up.length ? h('ul', {class: 'ag-list ag-ev'}, ...cut(up).map(e => eventLine(e, {withRoute: true}))) : h('p', {class: 'muted small ag-none'}, '확인된 회사·업종 일정 없음'),
    up.length > max && max ? h('p', {class: 'muted xs'}, `그 밖 ${up.length - max}건은 종목 화면에`) : null,
    h('h3', {class: 's-ag-h'}, `공시 ${disc.length}건`, h('small', null, ` · 지난 ${entry.disclosureDays ?? 30}일${builtDay ? `(${md(builtDay)}까지 받은 것)` : ''}`)),
    entry.missing?.includes('공시') ? h('p', {class: 'muted small'}, '공시 자료 없음 · 거래일 16:00 실행 때 모읍니다')
      : disc.length ? h('ul', {class: 'ag-list ag-ds'}, ...cut(disc).map(disclosureLine)) : h('p', {class: 'muted small ag-none'}, `지난 ${entry.disclosureDays ?? 30}일 공시 없음`),
    disc.length > max && max ? h('p', {class: 'muted xs'}, `그 밖 ${disc.length - max}건은 종목 화면에`) : null);
}
/** 출목표 칸: 표 · 힘 저울 두 줄 · 흐름 한 마디 (한 칸이 1% 가 아니면 그 크기를 적는다) */
export function roadBox(closes, {note = false, title = true} = {}) {
  if (!Array.isArray(closes) || closes.length < 3) return h('p', {class: 'muted small'}, '출목표를 그릴 종가가 모자랍니다.');
  const road = roadOf(closes);
  return h('div', {class: 's-road'},
    title ? h('p', {class: 's-road-h'}, h('span', null, `출목표 · 지난 ${road.days}거래일`), road.unit !== 0.01 ? h('b', null, unitText(road)) : null) : null,
    roadSvg(road), roadKey(road, {note}));
}
/** 시장 전체 일정(모든 회사에 해당) */
export function marketBox(agenda, {max = 6} = {}) {
  const list = agenda?.market ?? [];
  return h('section', {class: 's-market', 'aria-label': '시장 전체 일정'},
    h('h2', {class: 's-sec-h', 'data-speak': ''}, `시장 전체 일정 ${list.length}건`, h('small', null, ' · 모든 회사에 해당')),
    list.length ? h('ul', {class: 'ag-list'}, ...list.slice(0, max).map(e => eventLine(e))) : h('p', {class: 'muted small'}, '확인된 시장 일정 없음'));
}
/** 읽는 법(출목표 · 별) — 접어 둠 */
export function howBox(agenda) {
  return h('details', {class: 's-how'}, h('summary', null, '출목표와 별(★) 읽는 법'),
    h('ul', null,
      h('li', null, '출목표: 지난 20거래일 하루 등락을 1% 에 동그라미 하나로 쌓은 표입니다 · 빨강 = 오른 날 · 파랑 = 내린 날 · 같은 쪽이 이어지면 아래로, 바뀌면 옆 줄'),
      h('li', null, '힘 저울: 처음 15일과 최근 5일의 빨간 동그라미 수 대 파란 동그라미 수 · 흐름 한 마디는 둘을 이어 읽은 말이며 다음 날을 맞히는 말이 아닙니다'),
      ...(agenda?.rules?.events ?? []).map(x => h('li', null, '일정 ' + x)),
      ...(agenda?.rules?.disclosures ?? []).map(x => h('li', null, '공시 ' + x)),
      h('li', null, agenda?.rules?.note ?? '중요도는 일정·공시의 종류로 매긴 ATLAS 규칙입니다')),
    h('p', {class: 'muted xs'}, `일정 출처: ${agenda?.sources?.events ?? '확인된 일정표'} · 공시 출처: ${agenda?.sources?.disclosures?.provider ?? '네이버 증권 공시 목록'}`));
}

export async function renderSide(main, {hash, manifest}) {
  const side = /^#\/down/.test(hash) ? 'down' : 'up', other = side === 'up' ? 'down' : 'up';
  const [cardsDoc, agenda] = await Promise.all([loadCards(), loadJSON('agenda.json').catch(() => null)]);
  const tomorrow = manifest.futureDates?.[0], past = Boolean(tomorrow) && Date.now() >= Date.parse(tomorrow + 'T15:30:00+09:00');
  const rows = rowsOf(cardsDoc, tomorrow), list = sideRows(rows, side), n = {up: rows.filter(r => r.sel === 'up').length, down: rows.filter(r => r.sel === 'down').length};
  const W = {up: '오를 쪽', down: '내릴 쪽'}, uni = manifest.universeSet?.label ?? `${rows.length}종목`;
  const lead = `ATLAS가 ${md(tomorrow)}에 ${W[side]}으로 본 ${list.length}곳입니다. 확률이 높은 순입니다.`;
  state.summary = `${W[side]} ${list.length}곳. ${lead}`;
  const tabs = h('nav', {class: 's-tabs', 'aria-label': '오를 쪽 · 내릴 쪽'},
    ...['up', 'down'].map(k => h('a', {class: 's-tab ' + k + (k === side ? ' on' : ''), href: '#/' + k, ...(k === side ? {'aria-current': 'page'} : {})}, h('span', {class: 's-tab-m', 'aria-hidden': 'true'}, k === 'up' ? '▲' : '▼'), `${W[k]} ${n[k]}곳`)));
  const head = h('header', {class: 's-head'},
    h('h1', {class: 's-title ' + side, 'data-speak': ''}, `${W[side]} ${list.length}곳`),
    h('p', {class: 's-when'}, past ? `지난 예측 · ${longDate(tomorrow)}` : `${longDate(tomorrow)} 예측`, ` · ${uni}`),
    h('p', {class: 's-lead', 'data-speak': ''}, lead));
  const card = r => {
    const entry = agenda?.byCode?.[r.code] ?? null;
    return h('section', {class: `s-card ${r.sel}${r.half ? ' half' : ''}`, 'data-code': r.code, 'aria-label': `${r.name} · ${W[r.sel]}${r.half ? ' · 거의 반반' : ''}`},
      h('a', {class: 's-name-row', href: '#/stock/' + r.code},
        h('span', {class: 's-name'}, r.name),
        h('span', {class: `s-pill ${r.sel}${r.half ? ' half' : ''}`, 'data-forecast-date': r.date}, r.half ? `거의 반반 · ${r.sel === 'up' ? '오를' : '내릴'} ${prob(r.p)}` : `${r.sel === 'up' ? '오를' : '내릴'} 확률 ${prob(r.p)}`),
        h('span', {class: 's-go', 'aria-hidden': 'true'}, '›')),
      h('p', {class: 's-sub'}, `${r.sector ?? ''} · ${md(r.anchorDate)} 종가 ${won(r.close)} → `, h('span', {'data-forecast-date': r.date}, `중앙 전망 ${won(r.p50)}(${pct(r.ret)})`)),
      roadBox(r.c),
      agendaBox(entry, {max: 3, builtDay: agenda?.sources?.disclosures?.day ?? null}));
  };
  main.replaceChildren(h('section', {class: 's-page', 'data-side': side},
    tabs, head, marketBox(agenda), howBox(agenda),
    h('div', {class: 's-list'}, ...list.map(card)),
    list.length ? null : h('p', {class: 'muted'}, `${W[side]} 회사가 없습니다.`),
    h('p', {class: 's-other'}, h('a', {href: '#/' + other}, `${W[other]} ${n[other]}곳 보기 ›`), h('a', {href: '#/forecast'}, '첫 화면으로 ›'))));
}
