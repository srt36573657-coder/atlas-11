/* ATLAS 11 · 판 공용 부품 — 일정·공시 줄(★) · 출목표 칸 · 시장 일정 · 읽는 법 · 바뀔 묶음 미리 보기 · 값 줄 · 맨 아래 출처 줄
   2026-10-04 15:37 사장님 「이제 예측을 하지 않는다 예측에 관련된 모든 기능과 화면을 삭제하고. 표현하지 마라」 — 앞날 값은 어디에도 없다
   일정 이름·공시 제목은 공식 이름 그대로라(「SEDEX 2026」 · 「2단계 가격제한폭」) 또렷함 검사에서 식별자(data-ident)로 센다 — 우리 숫자가 아님. */
import {h, won, pct, korDate, stamp, signCls, signMark, finite} from './util.js';
import {roadOf, roadSvg, roadKey, unitText} from './road.js';
import {integrityText} from './frame.js';

export const LV = {3: '★★★', 2: '★★', 1: '★'};
export const LV_WORD = {3: '아주 중요', 2: '중요', 1: '참고'};

const star = level => h('b', {class: 'lv lv' + level, title: LV_WORD[level], 'aria-label': `${LV_WORD[level]}(별 ${level}개)`}, LV[level]);
/** 회사 이름 링크(여럿이면 「 · 」로 잇는다) */
const whoLinks = who => (Array.isArray(who) ? who : [who]).flatMap((w, i) => [i ? ' · ' : null, h('a', {class: 'ag-who', href: '#/stock/' + w.code}, w.name)]);

/** 일정 한 줄: ★ · 날짜 · 이름 · (출처) — who 가 있으면 회사 이름(링크) · date:false 면 날짜를 빼고(날짜 머리 아래) */
export function eventLine(e, {who = null, withRoute = false, date = true} = {}) {
  return h('li', {class: 'ag-li', 'data-level': e.level},
    star(e.level),
    date ? h('span', {class: 'ag-date'}, korDate(e.date)) : null,
    h('span', {class: 'ag-name'}, h('span', {'data-ident': ''}, e.name), withRoute && e.scope === 'sector' ? h('span', {class: 'ag-route'}, ' · 업종 행사') : null,
      who ? h('span', {class: 'ag-whos'}, ' — ', ...whoLinks(who)) : null,
      e.source?.url ? h('span', {class: 'ag-srcw'}, ' · ', h('a', {class: 'ag-src', href: e.source.url, target: '_blank', rel: 'noopener noreferrer', title: e.source.name ?? '공식 출처'}, '출처')) : null));
}
/** 공시 한 줄: ★ · 공시한 날 · 제목 · (예고·알림) */
export function disclosureLine(d, {who = null} = {}) {
  return h('li', {class: 'ag-li', 'data-level': d.level},
    star(d.level),
    h('span', {class: 'ag-date'}, korDate(d.publishedAt.slice(0, 10))),
    h('span', {class: 'ag-name'}, who ? h('span', {class: 'ag-whos'}, ...whoLinks(who), ' — ') : null, h('span', {'data-ident': ''}, d.title)),
    d.times > 1 ? h('span', {class: 'ag-times'}, `${d.times}건`) : null, d.notice ? h('span', {class: 'ag-notice'}, d.notice) : null);
}
/** 회사 한 곳의 일정·공시 칸 — max: 일정·공시 각각 몇 줄까지(0 이면 모두) · code 가 있으면 「더 보기」가 회사 화면으로 */
export function agendaBox(entry, {max = 3, builtDay = null, code = null} = {}) {
  if (!entry) return h('div', {class: 'ag-box'}, h('p', {class: 'muted small'}, '일정·공시 표를 읽지 못했습니다.'));
  const up = entry.upcoming ?? [], disc = entry.disclosures ?? [], cut = list => max ? list.slice(0, max) : list, days = entry.disclosureDays ?? 30;
  const more = (n, what) => n > 0 && max ? h('p', {class: 'ag-more xs'}, code ? h('a', {href: '#/stock/' + code}, `${what} ${n}건 더 보기 ›`) : `그 밖 ${n}건`) : null;
  return h('div', {class: 'ag-box'},
    h('h3', {class: 'ag-h'}, `다가오는 일정 ${up.length}건`, h('small', null, ' · 회사·업종')),
    up.length ? h('ul', {class: 'ag-list ag-ev'}, ...cut(up).map(e => eventLine(e, {withRoute: true}))) : h('p', {class: 'muted small ag-none'}, '확인된 회사·업종 일정 없음'),
    more(up.length - max, '일정'),
    h('h3', {class: 'ag-h'}, `공시 ${disc.length}건`, h('small', null, ` · 지난 ${days}일${builtDay ? ` · ${korDate(builtDay)}까지 받은 것` : ''}`)),
    entry.missing?.includes('공시') ? h('p', {class: 'muted small'}, '공시 자료 없음 · 거래일 16:00 실행 때 모읍니다')
      : disc.length ? h('ul', {class: 'ag-list ag-ds'}, ...cut(disc).map(d => disclosureLine(d))) : h('p', {class: 'muted small ag-none'}, `지난 ${days}일 공시 없음`),
    more(disc.length - max, '공시'),
    entry.disclosuresHidden ? h('p', {class: 'muted xs'}, `앞날을 짐작하는 말이 든 공시 제목 ${entry.disclosuresHidden}건은 싣지 않음`) : null);
}
/** 출목표 칸: 표 · 힘 저울 두 줄 · 흐름 한 마디 (한 칸이 1% 가 아니면 그 크기를 적는다) */
export function roadBox(closes, {note = false, title = true, from = null, change = null} = {}) {
  if (!Array.isArray(closes) || closes.length < 3) return h('p', {class: 'muted small'}, '출목표를 그릴 종가가 모자랍니다.');
  const road = roadOf(closes);
  return h('div', {class: 'rd-box'},
    title ? h('p', {class: 'rd-h'}, h('span', null, `출목표 · 지난 ${road.days}거래일`, from ? ` · ${korDate(from)}부터` : '', finite(change) ? ' · ' : '', finite(change) ? h('b', {class: 'chg20 ' + signCls(change)}, pct(change, 1)) : null), road.unit !== 0.01 ? h('b', null, unitText(road)) : null) : null,
    roadSvg(road), roadKey(road, {note}));
}
/** 시장 전체 일정(모든 회사에 해당) — max 0 이면 모두 */
export function marketBox(agenda, {max = 6} = {}) {
  const list = agenda?.market ?? [];
  return h('section', {class: 'b-box', 'aria-label': '시장 전체 일정'},
    h('h2', {class: 'b-box-h'}, `시장 전체 일정 ${list.length}건`, h('small', null, ' · 모든 회사에 해당')),
    list.length ? h('ul', {class: 'ag-list'}, ...(max ? list.slice(0, max) : list).map(e => eventLine(e))) : h('p', {class: 'muted small'}, '확인된 시장 일정 없음'),
    max && list.length > max ? h('p', {class: 'ag-more xs'}, h('a', {href: '#/agenda'}, `시장 일정 ${list.length - max}건 더 보기 ›`)) : null);
}
/** 읽는 법(출목표 · 별) — 접어 둠 */
export function howBox(agenda) {
  return h('details', {class: 'b-how'}, h('summary', null, '출목표와 별(★) 읽는 법'),
    h('ul', null,
      h('li', null, '출목표: 지난 20거래일 하루 등락을 1% 에 동그라미 하나로 쌓은 표입니다 · 빨강 = 오른 날 · 파랑 = 내린 날 · 같은 쪽이 이어지면 아래로, 바뀌면 옆 줄'),
      h('li', null, '힘 저울: 처음 15일과 최근 5일의 빨간 동그라미 수 대 파란 동그라미 수 · 흐름 한 마디는 둘을 이어 읽은 말입니다(지난 거래일만 봄)'),
      ...(agenda?.rules?.events ?? []).map(x => h('li', null, '일정 ' + x)),
      ...(agenda?.rules?.disclosures ?? []).map(x => h('li', null, '공시 ' + x)),
      h('li', null, agenda?.rules?.note ?? '중요도는 일정·공시의 종류로 매긴 ATLAS 규칙입니다')),
    h('p', {class: 'muted xs'}, `일정 출처: ${agenda?.sources?.events ?? '확인된 일정표'} · 공시 출처: ${agenda?.sources?.disclosures?.provider ?? '네이버 증권 공시 목록'}`));
}
/** 값 줄: 「276,000원 · 전날과 같음 · 10월 2일(금) 15:30 종가」 / 「… ▲ +1.23% …」 */
export function priceLine(c, {big = false} = {}) {
  const chg = c.change1, cls = signCls(chg);
  return h('p', {class: 'b-price' + (big ? ' big' : '')},
    h('span', {class: 'b-close'}, won(c.close)),
    h('span', {class: 'b-chg ' + cls}, finite(chg) ? (c.prevGap ? `${chg === 0 ? '같음' : `${signMark(chg)} ${pct(chg)}`} · ${korDate(c.prevDate)} 종가보다` : chg === 0 ? '전날과 같음' : `${signMark(chg)} ${pct(chg)}`) : '전날 종가 없음'),
    h('span', {class: 'b-date'}, `${korDate(c.date)} 15:30 종가`));
}
/** 바뀔 묶음 미리 보기 — 바꾸기 전까지만 · 이름만(누를 곳 없음) · 「새」 = 이번에 새로 들어오는 회사 */
export function nextBox(n) {
  if (!n?.companies?.length) return null;
  const when = n.from ? `${korDate(n.from)} 16:00 매일 실행 때 바뀝니다` : `${korDate(n.switchOn)}부터 매일 실행 때 바뀝니다`;
  const len = s => s.length >= 7 ? 'l' : 's';
  const total = n.companies.length;
  return h('section', {class: 'nx', 'aria-label': `바뀔 ${total}곳 미리 보기 · ${n.label}`},
    h('p', {class: 'nx-tag'}, '미리 보기'),
    h('h2', {class: 'nx-h', 'data-speak': ''}, `${n.label}으로 바뀝니다`),
    h('p', {class: 'nx-when', 'data-speak': ''}, `${when} · 새 회사들의 그날 종가를 모두 받아야 바뀌고, 못 받으면 그다음 거래일에 다시 합니다`),
    h('p', {class: 'nx-when'}, `그대로 남는 회사 ${n.kept}곳 · 새로 들어오는 회사 ${n.added}곳`),
    n.kinds ? h('p', {class: 'nx-when'}, `우량주 ${n.kinds.quality}곳 · 시대 트렌드 ${n.kinds.trend}곳`) : null,
    h('details', {class: 'nx-how'}, h('summary', null, `새 ${total}곳 이름 보기 · 새로 들어오는 회사 ${n.added}곳 표시`),
      h('div', {class: 'nx-chips'}, ...n.companies.map(c => h('span', {class: 'nx-chip', 'data-len': len(c.name)}, h('span', {class: 'nx-n'}, c.name), c.isNew ? h('span', {class: 'nx-new', title: '이번에 새로 들어오는 회사'}, '새') : null))),
      h('p', {class: 'nx-key'}, h('span', {class: 'nx-new'}, '새'), ' = 이번에 새로 들어오는 회사', n.selectedOn ? ` · ${korDate(n.selectedOn)}에 고름` : '')),
    n.how?.length ? h('details', {class: 'nx-how'}, h('summary', null, '어떻게 골랐나'), h('ul', null, ...n.how.map(x => h('li', null, x)))) : null,
    n.dropped?.length ? h('details', {class: 'nx-how'}, h('summary', null, `빠지는 회사 ${n.dropped.length}곳`), h('p', {class: 'nx-out'}, n.dropped.map(d => d.name).join(' · '))) : null);
}
/** 고른 까닭 표시(색 대신 글자 · 우량 = 네 조건을 모두 넘은 회사 · 트렌드 = 우량 조건은 못 넘었지만 시대 트렌드 업종 · 흑자 = 둘 다 아니지만 최근 결산 흑자 · 채움 = 업종 5곳을 채우려고 넣은 그 업종 큰 회사) */
const KIND_TEXT = {quality: ['우량', '우량 조건 네 가지(2년 연속 흑자 · ROE 5% 이상 · 부채비율 150% 이하)를 모두 넘은 회사'], trend: ['트렌드', '우량 조건은 못 넘었지만 시대 트렌드 업종의 회사'],
  profit: ['흑자', '우량·트렌드는 아니지만 최근 결산 흑자인 그 업종의 큰 회사(업종 5곳을 채우려고 넣음)'], size: ['채움', '업종 5곳을 채우려고 넣은 그 업종의 큰 회사(최근 결산 흑자 아님)']};
export function kindBadge(kind) {
  const k = KIND_TEXT[kind]; if (!k) return null;
  return h('span', {class: 'b-kind ' + kind, title: k[1]}, k[0]);
}
/** 36칸 판 칸 색 — 지난 20거래일 평균 변화의 크기(빨강 오름 · 파랑 내림 · 한국 시장 관례) · 뜻은 색만이 아니라 부호와 글자로도 */
export const heatOf = v => !finite(v) ? 'na' : v >= 0.15 ? 'h3' : v >= 0.08 ? 'h2' : v >= 0.03 ? 'h1' : v > -0.03 ? 'n' : v > -0.08 ? 'c1' : 'c2';
export const HEAT_KEY = '빨강이 짙을수록 많이 오름(+3% · +8% · +15% 이상) · 파랑이 짙을수록 많이 내림(−3% · −8% 아래) · −3%~+3% 는 색 없음 · 칸마다 숫자도 함께 적음';
/** 칸 색 보기표 — 색 여섯 칸과 그 범위(밝은·어두운 화면 모두 같은 말) */
export const HEAT_STEPS = [['c2', '−8% 아래'], ['c1', '−3% 아래'], ['n', '−3%~+3%'], ['h1', '+3% 이상'], ['h2', '+8% 이상'], ['h3', '+15% 이상']];
export function heatLegend() {
  return h('ol', {class: 't-legend', 'aria-label': '칸 색 = 지난 20거래일 평균 변화'}, ...HEAT_STEPS.map(([k, t]) => h('li', {'data-heat': k}, h('span', {class: 't-sw heat-' + k, 'aria-hidden': 'true'}), t)));
}
/** 업종 화면 「누가 끌었나」 — 5곳의 지난 20거래일 변화를 가운데 0 에서 좌우로 뻗은 막대로(가장 큰 값이 반 폭) · 폭은 CSSOM 으로만(글 속 style 속성 없음) */
export function moverBars(companies) {
  const vals = companies.map(c => c.change20).filter(finite), max = Math.max(0.01, ...vals.map(Math.abs));
  const rows = companies.map(c => {
    const v = c.change20, bar = h('span', {class: 'mv-bar ' + (finite(v) ? (v > 0 ? 'up' : v < 0 ? 'down' : 'flat') : 'flat')});
    if (finite(v)) { bar.style.width = `${Math.max(1.5, Math.abs(v) / max * 50)}%`; if (v < 0) bar.style.right = '50%'; else bar.style.left = '50%'; }
    return h('li', {class: 'mv-row', 'data-code': c.code},
      h('a', {class: 'mv-name', href: '#/stock/' + c.code}, c.name),
      h('span', {class: 'mv-track', 'aria-hidden': 'true'}, h('span', {class: 'mv-zero'}), bar),
      h('b', {class: 'mv-val chg20 ' + (finite(v) ? (v > 0 ? 'up' : v < 0 ? 'down' : 'flat') : 'flat')}, finite(v) ? pct(v, 1) : '없음'));
  });
  return h('ul', {class: 'mv-list', 'aria-label': `${companies.length}곳의 지난 20거래일 변화`}, ...rows);
}
/** 맨 아래: 만든 시각 · 판 이름 · 무결성 */
export function foot(m) {
  return h('footer', {class: 'b-foot'},
    h('p', null, `자료를 만든 시각 ${stamp(m?.generatedAt)} · 판 `, h('code', null, m?.boardId ?? '없음')),
    h('p', null, '무결성: ', h('span', {class: 'integrity-text'}, integrityText())),
    h('p', null, '종가 출처: 한국거래소 정규장 15:30 종가(네이버 증권 분봉 원문) · 수급·기사·공시: 네이버 증권 · 일정: 공식 발표처'));
}
