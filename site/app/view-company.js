/* ATLAS 11 · 회사 화면(#/stock/CODE) — 예측 없음
   2026-10-04 15:37 사장님 「이제 예측을 하지 않는다 예측에 관련된 모든 기능과 화면을 삭제하고. 표현하지 마라」
   지난 60거래일 실제 종가 선 · 출목표(지난 20거래일) · 지난 1년 숫자 · 일정·공시 모두(★) · 수급·기사·공시 기록(눌러야 열림)
   기사·공시 제목에 앞날을 짐작하는 말이 있으면 판을 만들 때 빼고, 뺀 수만 적는다(lib/atlas11/board.mjs). */
import {h, won, pct, num, korDate, stamp, kst, signCls, signMark, finite} from './util.js';
import {state, loadStock, loadAgenda} from './store.js';
import {marketStrip, closeChart} from './frame.js';
import {agendaBox, roadBox, priceLine, foot} from './parts.js';

const signed = v => finite(v) ? (v > 0 ? '+' : v < 0 ? '−' : '') + Math.abs(v).toLocaleString('ko-KR') + '주' : '없음';
const hm = iso => { if (!iso || !Number.isFinite(Date.parse(iso))) return ''; const t = kst(iso); return `${korDate(t.date)} ${t.time}`; };

function infoGrid(s) {
  const i = s.info ?? {}, cell = (label, value, cls = '') => h('div', {class: 'c-cell'}, h('dt', null, label), h('dd', {class: cls}, value));
  const chg = v => finite(v) ? `${signMark(v)} ${pct(v)}` : '없음';
  return h('div', null,
    h('dl', {class: 'c-info'},
      cell(`1년 최고 · ${num(i.days52)}거래일 가운데`, won(i.high52)),
      cell(`1년 최저 · ${num(i.days52)}거래일 가운데`, won(i.low52)),
      cell('1년 범위 안 지금 자리', finite(i.pos52) ? Math.round(i.pos52 * 100) + '%' : '없음'),
      cell('21거래일 전보다', chg(i.ret21), signCls(i.ret21)),
      cell('252거래일 전보다', chg(i.ret252), signCls(i.ret252))),
    h('p', {class: 'muted xs'}, '자리: 1년 최저를 0%, 최고를 100% 로 본 지금 종가의 자리 · 모두 지난 종가로 센 값'));
}
function contextBox(c) {
  const box = h('details', {class: 'b-how c-ctx'});
  if (!c) { box.append(h('summary', null, '수급·기사·공시 기록 · 아직 없음'), h('p', {class: 'muted small'}, '아직 이 회사의 기록이 없습니다 · 거래일 16:00 실행 때 모읍니다')); return box; }
  const flows = (c.flows ?? []).slice().reverse(), news = c.news ?? [], disc = c.disclosures ?? [];
  const flowTable = flows.length ? h('div', {class: 'c-scroll', 'data-scroll': 'x'}, h('table', {class: 'c-table'},
    h('thead', null, h('tr', null, ...['날짜', '외국인', '기관', '개인', '상태'].map(x => h('th', {scope: 'col'}, x)))),
    h('tbody', null, ...flows.map(r => h('tr', null, h('th', {scope: 'row'}, korDate(r.date)), h('td', {class: signCls(r.foreignNet)}, signed(r.foreignNet)), h('td', {class: signCls(r.institutionNet)}, signed(r.institutionNet)), h('td', {class: signCls(r.individualNet)}, signed(r.individualNet)), h('td', null, r.status === 'provisional_same_day' ? '잠정' : '보고')))))) : h('p', {class: 'muted small'}, '수급 자료를 받지 못했습니다(0 으로 채우지 않음).');
  box.append(
    h('summary', null, `수급·기사·공시 기록 열기 · 기사 ${news.length}건 · 공시 ${disc.length}건`),
    h('p', {class: 'muted xs'}, `외국인·기관·개인 순매매 수량(주) · 기관은 연기금 포함 합계 · 16:00 무렵 값은 잠정일 수 있음 · 받은 시각 ${stamp(c.fetchedAt)}`),
    h('h3', {class: 'ag-h'}, `수급 · 지난 ${flows.length}거래일`), flowTable,
    h('h3', {class: 'ag-h'}, `받은 기사 ${news.length}건`, c.newsRepublished ? h('small', null, ` · 같은 제목 다시 실린 기사 ${c.newsRepublished}건 가림`) : null),
    news.length ? h('ul', {class: 'c-news'}, ...news.map(n => h('li', null, h('span', {class: 'muted xs'}, `${hm(n.publishedAt)} · ${n.office ?? ''} `), n.url ? h('a', {href: n.url, target: '_blank', rel: 'noopener noreferrer', 'data-ident': ''}, n.title) : h('span', {'data-ident': ''}, n.title)))) : h('p', {class: 'muted small'}, '받은 기사 없음'),
    c.newsHidden ? h('p', {class: 'muted xs'}, `앞날을 짐작하는 말이 든 기사 제목 ${c.newsHidden}건은 싣지 않음(10월 4일(일) 사장님 말씀)`) : null,
    h('h3', {class: 'ag-h'}, `받은 공시 ${disc.length}건`),
    disc.length ? h('ul', {class: 'c-news'}, ...disc.map(d => h('li', null, h('span', {class: 'muted xs'}, `${hm(d.publishedAt)} `), d.corporateAction ? h('span', {class: 'ag-notice'}, '기업행위 · ' + (d.actionWord ?? '')) : null, ' ', h('span', {'data-ident': ''}, d.title)))) : h('p', {class: 'muted small'}, '받은 공시 없음'),
    c.disclosuresHidden ? h('p', {class: 'muted xs'}, `앞날을 짐작하는 말이 든 공시 제목 ${c.disclosuresHidden}건은 싣지 않음`) : null,
    h('p', {class: 'muted xs'}, '출처: 네이버 증권(종목 투자자 동향 · 뉴스 · 공시) · 기사는 제목만 저장(본문 없음)'));
  return box;
}

export async function renderCompany(main, {hash, manifest}) {
  const code = hash.match(/\d{6}/)[0];
  const [s, agenda] = await Promise.all([loadStock(code), loadAgenda().catch(() => null)]);
  const rows = s.closes60 ?? [], first = rows[0]?.date, last = rows.at(-1)?.date;
  state.summary = `${s.name}. ${korDate(s.date)} 종가 ${won(s.close)}.`;
  const chartBox = h('div', {class: 'c-chart'});
  main.replaceChildren(h('article', {class: 'b-page c-page', 'data-code': s.code},
    h('a', {class: 'c-back', href: '#/'}, `‹ ${manifest.universeSet?.label ?? '52곳'}`),
    marketStrip(manifest),
    h('header', {class: 'b-head'},
      h('h1', {class: 'b-title', 'data-speak': ''}, s.name),
      h('p', {class: 'b-when'}, h('code', null, s.code), ` · ${s.sector ?? ''}`),
      priceLine(s, {big: true})),
    h('section', {class: 'b-box'}, h('h2', {class: 'b-box-h'}, `지난 ${rows.length}거래일 종가`, h('small', null, first ? ` · ${korDate(first)}부터 ${korDate(last)}까지` : '')), chartBox,
      s.closeSource ? h('p', {class: 'muted xs'}, `마지막 종가: 한국거래소 정규장 15:30 종가 · 받은 시각 ${stamp(s.closeSource.observedAt)}`) : null),
    h('section', {class: 'b-box'}, h('h2', {class: 'b-box-h'}, '출목표', h('small', null, s.cFrom ? ` · 지난 ${Math.max(0, (s.c?.length ?? 1) - 1)}거래일 · ${korDate(s.cFrom)}부터` : '')), roadBox(s.c, {note: true, title: false})),
    h('section', {class: 'b-box'}, h('h2', {class: 'b-box-h'}, '지난 1년 숫자'), infoGrid(s)),
    h('section', {class: 'b-box'}, h('h2', {class: 'b-box-h'}, '일정·공시'), agendaBox(agenda?.byCode?.[s.code] ?? null, {max: 0, builtDay: agenda?.sources?.disclosures?.day ?? null})),
    contextBox(s.context),
    foot(manifest)));
  closeChart(chartBox, rows, {ariaLabel: `${s.name} 지난 ${rows.length}거래일 종가 · 처음 ${won(rows[0]?.close)} · 마지막 ${won(rows.at(-1)?.close)}`});
}
