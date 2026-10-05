/* ATLAS 11 · 회사 화면(#/stock/CODE) — 예측 없음 · 뒤로 가기는 그 회사의 업종 화면(#/i/<업종>) · 출목표 한 판에서 왔으면 그 판
   2026-10-04 15:37 사장님 「이제 예측을 하지 않는다 예측에 관련된 모든 기능과 화면을 삭제하고. 표현하지 마라」
   지난 60거래일 실제 종가 선 · 출목표(지난 20거래일) · 지난 1년 숫자 · 일정·공시 모두(★) · 수급·기사·공시 기록(눌러야 열림)
   기사·공시 제목에 앞날을 짐작하는 말이 있으면 판을 만들 때 빼고, 뺀 수만 적는다(lib/atlas11/board.mjs).
   2026-10-05 02:44 「잡스였다면」 개혁 — 앞 화면과 이어 보이기: 머리에 「지난 20거래일 ▲변화」(판·출목표 칸과 같은 숫자) · 60거래일 그래프 안에 그 20거래일을 옅은 띠로
     · 끝에 「같은 업종 4곳」(근처에 무엇이 있나 — 애플 WWDC17 길 찾기) */
import {h, won, pct, num, korDate, stamp, kst, signCls, signMark, finite} from './util.js';
import {state, loadStock, loadAgenda, loadBoard} from './store.js';
import {marketStrip, closeChart} from './frame.js';
import {agendaBox, roadBox, priceLine, foot, kindBadge, sparkSvg, sparkScale, flowLine, newsLine} from './parts.js';

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
/** 수급·기사 한 줄씩 — 업종 화면 카드와 같은 두 줄(판의 회사 요약 · 외국인·기관 5거래일 합 · 이름이 든 최근 기사 1건) */
function briefBox(board, s) {
  const bc = board?.companies?.find(c => c.code === s.code);
  if (!bc?.brief) return null;
  return h('section', {class: 'b-box c-brief', 'aria-label': '수급·기사'}, h('h2', {class: 'b-box-h'}, '수급·기사', h('small', null, ' · 한 줄씩 · 자세한 기록은 아래 「수급·기사·공시 기록」')), h('div', {class: 'bf-box'}, flowLine(bc.brief), newsLine(bc.brief)));
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

/** 같은 업종의 다른 회사(판의 업종 차례 그대로) — 한 줄에 넷: 이름 · 업종 · 작은 선 그래프(같은 눈금) · ▲변화 */
function nearBox(board, s) {
  const g = (board?.groups ?? []).find(x => x.id === s.group?.id); if (!g) return null;
  const byCode = new Map(board.companies.map(c => [c.code, c])), cs = g.codes.filter(c => c !== s.code).map(c => byCode.get(c)).filter(Boolean);
  if (!cs.length) return null;
  const sc = sparkScale(cs);
  return h('section', {class: 'b-box c-near', 'aria-label': `같은 업종 ${cs.length}곳`},
    h('h2', {class: 'b-box-h'}, `같은 업종 ${cs.length}곳`, h('small', null, ` · ${g.label} · 지난 20거래일 · 선 그래프는 ${cs.length}곳 같은 눈금`)),
    h('ol', {class: 'nc-list'}, ...cs.map(c => h('li', null, h('a', {class: 'nc-row', href: '#/stock/' + c.code},
      h('span', {class: 'nc-mid'}, h('span', {class: 'nc-name'}, c.name), h('small', {class: 'nc-ind'}, c.sector ?? '')),
      sparkSvg(c, sc),
      h('b', {class: 'chg20 nc-chg ' + (signCls(c.change20) || 'flat')}, finite(c.change20) ? pct(c.change20, 1) : '없음'))))));
}

export async function renderCompany(main, {hash, manifest}) {
  const code = hash.match(/\d{6}/)[0];
  const [s, agenda, board] = await Promise.all([loadStock(code), loadAgenda().catch(() => null), loadBoard().catch(() => null)]);
  const rows = s.closes60 ?? [], first = rows[0]?.date, last = rows.at(-1)?.date, band = s.cFrom ? rows.findIndex(r => r.date === s.cFrom) : -1;
  state.summary = `${s.name}. ${korDate(s.date)} 종가 ${won(s.close)}.${finite(s.change20) ? ` 지난 20거래일 ${pct(s.change20, 1)}.` : ''}`;
  const chartBox = h('div', {class: 'c-chart'});
  main.replaceChildren(h('article', {class: 'b-page c-page', 'data-code': s.code},
    // 뒤로: 출목표 한 판에서 왔으면 그 판(보던 자리 그대로) · 아니면 이 회사의 업종 화면(처음 화면 → 업종 → 회사 순서를 거꾸로) · 업종을 모르면 처음 화면
    // 2026-10-05 탭 다섯: 「예비」(닮은 7곳) · 「22곳」에서 왔으면 그 목록으로(보던 자리 그대로)
    state.from === 'road' ? h('a', {class: 'c-back', href: '#/road'}, '‹ 출목표')
      : state.from === 'similar' ? h('a', {class: 'c-back', href: '#/similar'}, '‹ 예비')
      : state.from === 'rise' ? h('a', {class: 'c-back', href: '#/rise'}, '‹ 오름 상위')
      : h('a', {class: 'c-back', href: s.group?.id ? '#/i/' + s.group.id : '#/'}, `‹ ${s.group?.label ?? manifest.universeSet?.label ?? '처음 화면'}`),
    marketStrip(manifest),
    h('header', {class: 'b-head'},
      h('h1', {class: 'b-title', 'data-speak': ''}, s.name),
      // 업종: 한국거래소 업종(한국표준산업분류)이 있으면 그 이름 · 없으면 네이버 증권 업종(2026-10-05 365곳 묶음부터 더 잘게)
      h('p', {class: 'b-when'}, h('code', null, s.code), s.ksic ? ` · 업종 ${s.group?.label ?? s.ksic}(한국거래소: ${s.ksic})` : s.sector ? ` · 업종 ${s.group?.label && s.group.label !== s.sector ? `${s.group.label}(${s.sector})` : s.sector}` : '', s.kind ? ' ' : null, kindBadge(s.kind)),
      priceLine(s, {big: true}),
      h('p', {class: 'c-20'}, '지난 20거래일 ', h('b', {class: 'chg20 ' + (signCls(s.change20) || 'flat')}, finite(s.change20) ? pct(s.change20, 1) : '없음'), s.cFrom ? ` · ${korDate(s.cFrom)}부터 ${korDate(s.date)}까지` : '')),
    h('section', {class: 'b-box'}, h('h2', {class: 'b-box-h'}, `지난 ${rows.length}거래일 종가`, h('small', null, first ? ` · ${korDate(first)}부터 ${korDate(last)}까지${band > 0 ? ' · 옅은 띠 = 지난 20거래일(판 · 출목표와 같은 구간)' : ''}` : '')), chartBox,
      s.closeSource ? h('p', {class: 'muted xs'}, `마지막 종가: 한국거래소 정규장 15:30 종가 · 받은 시각 ${stamp(s.closeSource.observedAt)}`) : null),
    h('section', {class: 'b-box'}, h('h2', {class: 'b-box-h'}, '출목표', h('small', null, s.cFrom ? ` · 지난 ${Math.max(0, (s.c?.length ?? 1) - 1)}거래일 · ${korDate(s.cFrom)}부터` : '', finite(s.change20) ? ` · ${pct(s.change20, 1)}` : '')), roadBox(s.c, {note: true, title: false})),
    briefBox(board, s), // 2026-10-05 「잡스라면」 22번 — 회사 화면 차례: 20거래일 변화 → 그래프 → 출목표 → 수급·기사 → 일정 → (접힘) 1년 숫자
    h('section', {class: 'b-box'}, h('h2', {class: 'b-box-h'}, '일정·공시'), agendaBox(agenda?.byCode?.[s.code] ?? null, {max: 0, builtDay: agenda?.sources?.disclosures?.day ?? null})),
    contextBox(s.context),
    h('details', {class: 'b-how c-year'}, h('summary', null, '지난 1년 숫자 · 1년 최고·최저 · 252거래일 변화'), infoGrid(s)), // 기간이 20거래일과 달라 접어 둠(25번 「기간 잣대 하나」)
    nearBox(board, s),
    foot(manifest)));
  closeChart(chartBox, rows, {band: band > 0 ? band : null, ariaLabel: `${s.name} 지난 ${rows.length}거래일 종가 · 처음 ${won(rows[0]?.close)} · 마지막 ${won(rows.at(-1)?.close)}${band > 0 ? ` · ${korDate(rows[band].date)}부터 끝까지 옅은 띠(지난 20거래일)` : ''}`});
}
