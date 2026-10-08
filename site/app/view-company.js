/* ATLAS 11 · 회사 화면(#/stock/CODE) — 예측 없음 · 뒤로 가기는 그 회사의 업종 화면(#/i/<업종>) · 출목표 한 판에서 왔으면 그 판
   2026-10-04 15:37 사장님 「이제 예측을 하지 않는다 예측에 관련된 모든 기능과 화면을 삭제하고. 표현하지 마라」
   지난 60거래일 실제 종가 선 · 출목표(지난 20거래일) · 지난 1년 숫자 · 일정·공시 모두(★) · 수급·기사·공시 기록(눌러야 열림)
   기사·공시 제목에 앞날을 짐작하는 말이 있으면 판을 만들 때 빼고, 뺀 수만 적는다(lib/atlas11/board.mjs).
   2026-10-05 02:44 「잡스였다면」 개혁 — 앞 화면과 이어 보이기: 머리에 「지난 20거래일 ▲변화」(판·출목표 칸과 같은 숫자) · 60거래일 그래프 안에 그 20거래일을 옅은 띠로
     · 끝에 「같은 업종 4곳」(근처에 무엇이 있나 — 애플 WWDC17 길 찾기) */
import {companyArt, quietArt} from './scenes.js'; // 그림 한 장(먹 붓질 · 규칙 33) · 판을 못 읽은 날은 빈 하늘(2026-10-08 05:05 빈 날 막기)
import {h, won, pct, num, korDate, stamp, kst, signCls, signMark, finite, place} from './util.js';
import {state, loadStock, loadAgenda, loadBoard} from './store.js';
import {marketStrip, closeChart} from './frame.js';
import {agendaBox, roadBox, priceLine, foot, kindBadge, sparkSvg, sparkScale, flowLine, newsLine, sunIcon, sunTag} from './parts.js';
import {sunOf} from './shapes.js';
import {riseDesc} from './family.js';
import {companyComment, commentSay} from './comment.js'; // 논평(2026-10-07 03:17) — 회사 화면은 숫자(값 · 20거래일) 바로 다음에 그 숫자를 읽는 한 줄
import {similarReason, sunReason, beatsEl} from './reason.js'; // 「왜 태양인가」 · 「왜 예비인가」 기승전결 넷(2026-10-08 06:48 · 06:49)
import {loadLens} from './store.js';
import {pv, ppv, sharesTxt, idxName, LEVEL, tagEl} from './lensparts.js'; // 판 읽기(2026-10-08 20:19 「ATLAS 개편 실행 지시서」 7 — 종목 상세 고정 순서 ①~⑥)
import {whyText, LISTS, STATUS} from './view-stocks.js';
import {watchBox} from './view-watch.js';
import {relPct, stdev, pctRet} from './calc.js';

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
  return h('section', {class: 'b-box c-brief', 'aria-label': '수급·기사'}, h('h2', {class: 'b-box-h'}, '수급·기사', h('small', null, ' · 한 줄씩 · 자세한 기록은 아래 「수급·기사·공시 기록」')), h('div', {class: 'bf-box'}, flowLine(bc.brief), newsLine(bc.brief, {here: true})));
}
function contextBox(c) {
  const box = h('details', {class: 'b-how c-ctx'});
  if (!c) { box.append(h('summary', null, '수급·기사·공시 기록 · 아직 없음'), h('p', {class: 'muted small'}, place.contextNone ?? '아직 이 회사의 기록이 없습니다 · 거래일 16:00 실행 때 모읍니다')); return box; }
  const flows = (c.flows ?? []).slice().reverse(), news = c.news ?? [], disc = c.disclosures ?? [];
  const flowTable = flows.length ? h('div', {class: 'c-scroll', 'data-scroll': 'x'}, h('table', {class: 'c-table'},
    h('thead', null, h('tr', null, ...['날짜', '외국인', '기관', '개인', '상태'].map(x => h('th', {scope: 'col'}, x)))),
    h('tbody', null, ...flows.map(r => h('tr', null, h('th', {scope: 'row'}, korDate(r.date)), h('td', {class: signCls(r.foreignNet)}, signed(r.foreignNet)), h('td', {class: signCls(r.institutionNet)}, signed(r.institutionNet)), h('td', {class: signCls(r.individualNet)}, signed(r.individualNet)), h('td', null, r.status === 'provisional_same_day' ? '잠정' : '보고')))))) : h('p', {class: 'muted small'}, '수급 자료를 받지 못했습니다(0 으로 채우지 않음).');
  box.append(...[ // null 은 걸러 붙임(DOM append 는 null 을 「null」 글자로 붙임 — 2026-10-08 07:10 v3 검사기가 접힌 칸 안 「null」 두 줄을 찾음)
    h('summary', null, `수급·기사·공시 기록 열기 · 기사 ${news.length}건 · 공시 ${disc.length}건`),
    // 미국 판: 투자자별 매매 공개 자료가 없다 — 빈 표 대신 그렇다고 한 줄(util.js place.flows === false)
    ...(place.flows === false ? [h('p', {class: 'muted xs'}, `받은 시각 ${stamp(c.fetchedAt)}`), h('h3', {class: 'ag-h'}, '수급'), h('p', {class: 'muted small'}, place.flowsNone ?? '투자자별 매매 자료 없음')]
      : [h('p', {class: 'muted xs'}, `외국인·기관·개인 순매매 수량(주) · 기관은 연기금 포함 합계 · 16:00 무렵 값은 잠정일 수 있음 · 받은 시각 ${stamp(c.fetchedAt)}`),
        h('h3', {class: 'ag-h'}, `수급 · 지난 ${flows.length}거래일`), flowTable]),
    h('h3', {class: 'ag-h'}, `받은 기사 ${news.length}건`, c.newsRepublished ? h('small', null, ` · 같은 제목 다시 실린 기사 ${c.newsRepublished}건 가림`) : null),
    news.length ? h('ul', {class: 'c-news'}, ...news.map(n => h('li', null, h('span', {class: 'muted xs'}, `${hm(n.publishedAt)} · `, n.office ? h('span', {'data-ident': '', lang: 'ko'}, n.office) : '', ' '), n.url ? h('a', {href: n.url, target: '_blank', rel: 'noopener noreferrer', 'data-ident': '', lang: 'ko'}, n.title) : h('span', {'data-ident': '', lang: 'ko'}, n.title)))) : h('p', {class: 'muted small'}, '받은 기사 없음'),
    c.newsHidden ? h('p', {class: 'muted xs'}, `앞날을 짐작하는 말이 든 기사 제목 ${c.newsHidden}건은 싣지 않음(10월 4일(일) 사장님 말씀)`) : null,
    h('h3', {class: 'ag-h'}, `받은 공시 ${disc.length}건`),
    disc.length ? h('ul', {class: 'c-news'}, ...disc.map(d => h('li', null, h('span', {class: 'muted xs'}, `${hm(d.publishedAt)} `), d.corporateAction ? h('span', {class: 'ag-notice'}, '기업행위', d.actionWord ? [' · ', h('span', {'data-ident': '', lang: 'ko'}, d.actionWord)] : null) : null, ' ', h('span', {'data-ident': '', lang: 'ko'}, d.title)))) : h('p', {class: 'muted small'}, place.disclosuresNone && c.missing?.includes('공시') ? place.disclosuresNone : '받은 공시 없음'),
    c.disclosuresHidden ? h('p', {class: 'muted xs'}, `앞날을 짐작하는 말이 든 공시 제목 ${c.disclosuresHidden}건은 싣지 않음`) : null,
    h('p', {class: 'muted xs'}, place.contextSource)].filter(x => x != null)); // 시장마다(util.js place)
  return box;
}

/** 태양 점검 — 오른 회사들(지난 20거래일 오른 순 위 20%) 출목표의 공통 모양 n가지를 이 회사가 몇 가지 가졌나
   2026-10-05 15:24 「잡스가 … 36가지」 B2: 출목표에서만 보이던 태양을 회사 화면에도 — 모양마다 ✓(가짐) · 「·」(안 가짐) · 앞날 말 없음 */
function sunCheck(shp, code, asOf) {
  if (!shp?.common?.length || !shp.hits.has(code)) return null;
  const has = new Set(shp.hits.get(code)), on = shp.sparkle.has(code), k = shp.common.length;
  return h('div', {class: 'c-sun' + (on ? ' on' : ''), 'data-sun': String(on), 'data-has': String(has.size)},
    h('p', {class: 'c-sun-h'}, on ? sunIcon('sun-mid') : null, on ? ` 태양 — 오른 회사들의 공통 모양 ${k}가지를 모두 가짐` : `태양 아님 — 오른 회사들의 공통 모양 ${k}가지 가운데 ${has.size}가지`),
    h('ul', {class: 'c-sun-list'}, ...shp.common.map(id => { const t = shp.traits.find(x => x.id === id), y = has.has(id);
      return h('li', {class: y ? 'on' : 'off', 'data-shape': id, 'data-has': String(y)}, h('span', {class: 'c-sun-ck', 'aria-hidden': 'true'}, y ? '✓' : '·'), h('span', null, t.name), h('span', {class: 'sr-only'}, y ? ' 가짐' : ' 안 가짐')); })),
    h('p', {class: 'muted xs c-sun-n'}, `오른 회사 = 지난 20거래일 오른 순 1위~${shp.topN}위 · ${korDate(asOf)} 종가까지 모양을 견준 것일 뿐 앞날을 맞히지 않습니다 · `,
      h('a', {class: 'sun-go', href: '#/road/sun'}, `출목표에서 태양 ${shp.sparkle.size}곳 모아 보기 ›`)));
}
/** 「왜 태양인가」 · 「왜 예비인가」 — 근거를 기승전결 넷으로(reason.js · 늘 펼침) · 출목표 칸(태양 점검) 바로 아래 · 태양 · 예비인 회사만
   사장님 2026-10-08 06:48 「그리고 왜 예비 후보인지 그 근거와 이유가 분명히 기승전결로 있어야 한다」 · 06:49 「태양도 왜 태양인지 마찮가지로 그 근거가 있러야 한다」 */
function whyBoxes(board, shp, s) {
  const sun = board && shp ? sunReason(shp, board, s.code) : null, sim = board ? similarReason(board, s.code) : null;
  return [
    sun ? h('section', {class: 'b-box rs-box rs-sun', 'aria-label': '왜 태양인가', 'data-why': 'sun'}, h('h2', {class: 'b-box-h rs-bh'}, sunIcon('sun-mid'), h('span', {'data-speak': ''}, '왜 태양인가')), beatsEl(sun, {speak: true})) : null,
    sim ? h('section', {class: 'b-box rs-box', 'aria-label': '왜 예비인가', 'data-why': 'similar'}, h('h2', {class: 'b-box-h rs-bh'}, h('span', {'data-speak': ''}, '왜 예비인가')), beatsEl(sim, {speak: true})) : null];
}

/** 오른 순 자리 · 앞뒤 회사(2026-10-05 15:24 「잡스가 … 36가지」 E2 · E3 · E4) — 「‹ 11위 · 오른 순 365곳 가운데 12위 · 13위 ›」
   가운데를 누르면 출목표 「오른 순」의 그 칸으로(#/road/at/CODE) · 양옆은 오른 순 바로 앞 · 뒤 회사(되돌아가지 않고 넘겨 보기) */
function rankNav(board, s) {
  const ranked = [...(board?.companies ?? [])].sort(riseDesc), i = ranked.findIndex(c => c.code === s.code), N = ranked.length;
  if (i < 0) return null;
  const prev = ranked[i - 1], next = ranked[i + 1];
  return h('nav', {class: 'c-rank', 'aria-label': `오른 순 ${N}곳 가운데 ${i + 1}위 · 앞뒤 회사`},
    prev ? h('a', {class: 'c-rk-b c-rk-prev', href: '#/stock/' + prev.code, 'aria-label': `오른 순 ${i}위 ${prev.name}`, title: prev.name}, `‹ ${i}위`) : h('span', {class: 'c-rk-b c-rk-none', 'aria-hidden': 'true'}),
    h('a', {class: 'c-rk-mid', href: '#/road/at/' + s.code}, `오른 순 ${N}곳 가운데 ${i + 1}위`, h('small', null, ' · 출목표 자리 ›')),
    next ? h('a', {class: 'c-rk-b c-rk-next', href: '#/stock/' + next.code, 'aria-label': `오른 순 ${i + 2}위 ${next.name}`, title: next.name}, `${i + 2}위 ›`) : h('span', {class: 'c-rk-b c-rk-none', 'aria-hidden': 'true'}));
}

/** 같은 업종의 다른 회사(지난 20거래일 많이 오른 순 · 2026-10-05 11:36) — 한 줄에 넷: 이름 · 업종 · 작은 선 그래프(같은 눈금) · ▲변화 */
function nearBox(board, s, shp = null) {
  const g = (board?.groups ?? []).find(x => x.id === s.group?.id); if (!g) return null;
  const byCode = new Map(board.companies.map(c => [c.code, c])), cs = g.codes.filter(c => c !== s.code).map(c => byCode.get(c)).filter(Boolean).sort(riseDesc);
  if (!cs.length) return null;
  const sc = sparkScale(cs);
  return h('section', {class: 'b-box c-near', 'aria-label': `같은 업종 ${cs.length}곳`},
    h('h2', {class: 'b-box-h'}, `같은 업종 ${cs.length}곳`, h('small', null, ` · ${g.label} · 지난 20거래일 많이 오른 순 · 선 그래프는 ${cs.length}곳 같은 눈금`)),
    h('p', {class: 'c-near-go'}, h('a', {href: '#/i/' + g.id}, `${g.label} 업종 화면 · 누가 끌었나 ›`)), // 출목표에서 왔어도 그 업종 화면으로 가는 길(E6)
    h('ol', {class: 'nc-list'}, ...cs.map(c => h('li', null, h('a', {class: 'nc-row', href: '#/stock/' + c.code},
      h('span', {class: 'nc-mid'}, h('span', {class: 'nc-name'}, c.name, sunTag(shp?.sparkle.has(c.code))), h('small', {class: 'nc-ind'}, c.sector ?? '')),
      sparkSvg(c, sc),
      h('b', {class: 'chg20 nc-chg ' + (signCls(c.change20) || 'flat')}, finite(c.change20) ? pct(c.change20, 1) : '없음'))))));
}

/* ── 종목 상세 고정 순서(「ATLAS 개편 실행 지시서」 7): ① 지금 종가 · 기준 시각 · 자료 상태(머리) → ② 지난 확인 이후 달라진 점 → ③ 주목할 근거(3개까지)
      → ④ 반대 근거와 위험 → ⑤ 다음 확인 조건 · 날짜 → ⑥ 같은 조건의 검증 상태 · 결과 — 근거 영역(가격 · 수급 · 실적 · 사건)은 따로 · 종합점수 없음 ── */
/** 결산 연월 「2025.12」 → 「2025년 12월」(단위 없는 숫자를 쓰지 않음 · 또렷함 3번) */
const fyTxt = fy => { const m = String(fy ?? '').match(/^(\d{4})\.(\d{1,2})$/); return m ? `${m[1]}년 ${Number(m[2])}월` : (fy || null); };
const lsBox = (n, title, ...kids) => h('section', {class: 'b-box cd-box', 'data-order': String(n), 'aria-label': title}, h('h2', {class: 'b-box-h'}, h('span', {class: 'mk-no', 'aria-hidden': 'true'}, ['①', '②', '③', '④', '⑤', '⑥'][n - 1]), ' ', title), ...kids);
const li2 = (k, ...v) => h('li', null, h('b', null, k), ' · ', ...v);
/** 자료 상태 글 — 지연 · 오래된 종가: 「10월 7일(수) 종가까지만 있음」 · 기업행사 확인 필요: 가격 제한폭을 넘은 날 */
export const statusWhy = ls => (ls.status === 'ca' ? `하루 변화가 가격 제한폭(±30%)을 넘은 날 ${(ls.jumps ?? []).map(korDate).join(' · ')}` : ls.status === 'missing' ? '종가 없음' : `${korDate(ls.date)} 종가까지만 있음`);
function statusLine(ls, s) {
  const st = ls ? (ls.status === 'ok' ? '그날 종가' : `${STATUS[ls.status]} — ${statusWhy(ls)}`) : '판 읽기 없음';
  return h('p', {class: 'c-status muted xs', 'data-status': ls?.status ?? ''}, `자료 상태: ${st}`, s.closeSource?.observedAt ? ` · 종가 받은 때 ${stamp(s.closeSource.observedAt)}` : '');
}
function sinceBox(ls, lens) {
  const x = ls?.since, why = ls ? whyText(ls) : null;
  return lsBox(2, '지난 확인 이후 달라진 점',
    !x ? h('p', {class: 'muted small'}, '견줄 앞 기록 없음') : h('ul', {class: 'cd-l'},
      li2(`${korDate(x.from)} 기록 이후`, '종가 ', pv(x.r), ' · 업종 대비 ', ppv(x.vsGroup)),
      lens.flows?.available ? li2('외국인+기관', sharesTxt(x.fiShares), ' · 순매수 주식 수 합(공식 값)') : null,
      li2('새 공시', `${x.disc}건 · ★★★ ${x.discTop}건`),
      li2('이번 기록 목록', ls.lists.length ? ls.lists.map(k => LISTS[k] ?? k).join(' · ') : '없음'),
      why ? li2('묶음', h('span', {class: 'lv-tag bk-' + ls.bucket}, {new: '새로 발견', up: '근거 강화', down: '근거 약화'}[ls.bucket]), ' ', ...[].concat(why)) : null));
}
const vol = c => { const xs = (c ?? []).filter(v => finite(v) && v > 0); if (xs.length < 3) return null; const d = xs.slice(1).map((v, i) => pctRet(v, xs[i])); return stdev(d); };
function evidenceBoxes(ls, lens, s) {
  const pro = [], con = [], unknown = [], f = ls?.fund, fl = ls?.fl;
  if (ls && finite(ls.vsGroup20)) (ls.vsGroup20 > 0 ? pro : con).push(['가격', ['20거래일 ', pv(ls.r20), ' · 업종 대비 ', ppv(ls.vsGroup20), ` · ${idxName(lens)} 대비 `, ppv(ls.vsIdx20)]]);
  else unknown.push(['가격', ['20거래일 비교 계산 불가']]);
  if (lens?.flows?.available) { if (fl && finite(fl.f5) && finite(fl.i5)) (fl.f5 + fl.i5 > 0 ? pro : con).push(['수급', [`외국인 ${sharesTxt(fl.f5)} · 기관 ${sharesTxt(fl.i5)} · 5거래일 순매수 주식 수(공식 값)`]]); else unknown.push(['수급', ['자료 없음']]); }
  else unknown.push(['수급', [lens?.flows?.reason ?? '투자자별 매매 자료 없음']]);
  if (f && finite(f.roe)) { const good = f.roe >= 5 && (f.debtExempt || (finite(f.debt) && f.debt <= 150)); (good ? pro : con).push(['실적', [`ROE ${f.roe.toFixed(1)}% · 부채비율 ${f.debtExempt ? '금융회사 빼고 봄' : finite(f.debt) ? Math.round(f.debt) + '%' : '없음'}${fyTxt(f.fy) ? ` · ${fyTxt(f.fy)} 결산(선정 때 값)` : ''}`]]); }
  else unknown.push(['실적', ['자료 없음']]);
  unknown.push(['현금흐름 · 기업가치', ['자료 없음(모으지 않음)']]);
  if (ls && ls.status !== 'ok') con.push(['자료', [`${STATUS[ls.status]} — ${statusWhy(ls)}`]]);
  if (ls?.cas?.length) con.push(['기업행사 공시', [ls.cas.join(' · ') + ' — 가격 기준 확인 필요']]);
  const v1 = vol(s.c), vI = lens?.market?.ref?.vol20;
  if (finite(v1)) con.push(['변동', [`20거래일 하루 변화 표준편차 ${v1.toFixed(2)}%`, finite(vI) ? ` · ${idxName(lens)} ${vI.toFixed(2)}%` : '']]);
  const ul = xs => h('ul', {class: 'cd-l'}, ...xs.map(([k, v]) => li2(k, ...v)));
  return [lsBox(3, '주목할 근거', pro.length ? ul(pro.slice(0, 3)) : h('p', {class: 'muted small'}, '주목할 근거 없음'), h('p', {class: 'muted xs'}, '영역마다 하나 · 불장 · 출목표 · 태양 · 포모는 같은 종가 자료라 「가격」 하나로 셈 · 종합점수 없음')),
    lsBox(4, '반대 근거와 위험', con.length ? ul(con) : h('p', {class: 'muted small'}, '반대 근거 없음'), unknown.length ? h('p', {class: 'muted xs'}, `확인 못 한 것(낮은 가치와 다름): ${unknown.map(([k, v]) => `${k}: ${v.join('')}`).join(' · ')}`) : null)];
}
function nextBox(ls, lens, agenda, s) {
  const up = (agenda?.byCode?.[s.code]?.upcoming ?? []).slice(0, 3);
  return lsBox(5, '확인할 조건 · 날짜',
    h('ul', {class: 'cd-l'},
      ...up.map(e => li2(korDate(e.date), h('span', {'data-ident': '', lang: e.scope === 'market' ? null : 'ko'}, e.name), e.scope === 'sector' ? ' · 업종 행사(회사 참가 확인 안 됨)' : '')),
      up.length ? null : li2('일정', '확인된 회사 · 업종 일정 없음'),
      lens?.verify?.records?.length ? li2('다음 저녁 기록', '다음 거래일 19:00(한국 시각) — 목록에 남는지 · 빠지는지') : li2('고정 기록', '이 판은 아직 없음'),
      li2('확인할 것', '업종 대비 격차의 방향', lens?.flows?.available ? ' · 외국인+기관 순매수 방향' : '', ' · 새 공시')));
}
function verifyBox(ls, lens) {
  const recs = lens?.verify?.records ?? [], last = recs.at(-1), fs = ls?.firstSeen;
  const evalTxt = e => (e.status === 'pending' ? `${e.h}거래일 평가 대기(${korDate(e.due)})` : e.status === 'done' ? `${e.h}거래일 평균 ${e.ret.mean?.toFixed(1)}% · 성공 ${e.success.hit}곳/${e.success.n}곳` : `${e.h}거래일 평가일 모름`);
  return lsBox(6, '같은 조건의 검증 상태',
    h('ul', {class: 'cd-l'},
      ...(ls?.lists ?? []).filter(k => last?.evals?.[k]).map(k => li2(LISTS[k], last.evals[k].map(evalTxt).join(' · '))),
      ls?.lists?.length ? null : li2('이번 기록 목록', '없음 — 이 종목에 걸린 검증 없음'),
      fs ? li2('최초 포착', `${korDate(fs.asOf)} 기록 · ${fs.lists.map(k => LISTS[k] ?? k).join(' · ')} · 그 뒤 `, pv(fs.r), ` · ${idxName(lens)} 대비 `, ppv(fs.gap), ` · 기록 ${fs.records}장에 듦`) : li2('최초 포착', '저녁 기록에 든 적 없음')),
    h('p', {class: 'muted xs'}, h('a', {href: '#/check'}, '선정 결과 검증 ›'), ' · 결과가 쌓이기 전에는 검증 전'));
}
function compareBox(ls, lens) {
  if (!ls) return null;
  const R = lens.market.ref ?? {}, sc = lens.sectors.find(x => x.id === ls.g);
  const row = (n, a, b) => h('tr', null, h('th', {scope: 'row'}, `${n}거래일`), h('td', null, pv(a)), h('td', null, pv(b)), h('td', null, ppv(finite(a) && finite(b) ? a - b : null)), h('td', null, pv(relPct(a, b))));
  return h('section', {class: 'b-box cd-cmp', 'aria-label': '비교'},
    h('h2', {class: 'b-box-h'}, '비교 · 같은 기간', h('small', null, ` · ${korDate(lens.asOf)} 종가까지`)),
    h('div', {class: 'c-scroll', 'data-scroll': 'x'}, h('table', {class: 'c-table'},
      h('thead', null, h('tr', null, ...['기간', '이 종목', idxName(lens), '격차(%p)', '상대 가격비(%)'].map(x => h('th', {scope: 'col'}, x)))),
      h('tbody', null, row(5, ls.r5, R.r5), row(20, ls.r20, R.r20), row(60, ls.r60, R.r60)))),
    h('ul', {class: 'cd-l'},
      li2('업종 평균 대비(20거래일)', ppv(ls.vsGroup20), sc ? ` · ${sc.label} 평균 ` : '', sc ? pv(sc.d20.mean) : '', sc ? [' ', tagEl(sc.level, LEVEL, 'lvl')] : ''),
      li2('같은 업종 다른 곳 평균 대비', ppv(ls.vsPeers20), ' · 자기 자신을 뺀 평균'),
      sc ? li2('업종 1위 제외 평균', pv(sc.d20.exTop1), ' · 상위 2개 제외 평균 ', pv(sc.d20.exTop2)) : null,
      li2('위험조정 성과', '계산하지 않음(검증된 정의 없음)')),
    h('p', {class: 'muted xs'}, '격차(%p)와 상대 가격비(%)는 다른 값 · 이 비교는 공식 순위 · 기록을 바꾸지 않음'),
    h('details', {class: 'b-how'}, h('summary', null, '계산 · 출처 자세히'), h('p', {class: 'muted xs'}, '격차(%p) = 종목 수익률 − 지수 수익률 · 상대 가격비(%) = (1 + 종목) ÷ (1 + 지수) − 1'))); // 산식은 접힘(또렷함 3번 — 펼친 글에 단위 없는 숫자 없음)
}

export async function renderCompany(main, {hash, manifest}) {
  const code = decodeURIComponent(hash.replace(/^#\/stock\//, '')); // 한국 6자리 · 미국 영문 기호(AAPL · BRK.B)
  const [s, agenda, board, lens0] = await Promise.all([loadStock(code), loadAgenda().catch(() => null), loadBoard().catch(() => null), loadLens().catch(() => null)]);
  const lens = lens0 && !lens0.none ? lens0 : null, ls = lens?.stocks?.find(x => x.code === s.code) ?? null;
  const rows = s.closes60 ?? [], first = rows[0]?.date, last = rows.at(-1)?.date, band = s.cFrom ? rows.findIndex(r => r.date === s.cFrom) : -1;
  const shp = board ? sunOf(board) : null, sunOn = !!shp?.sparkle.has(s.code), sunHas = shp?.hits.get(s.code)?.length ?? 0, cm = board ? companyComment(board, s) : null;
  state.summary = `${commentSay(cm)}${s.name}. ${korDate(s.date)} 종가 ${won(s.close)}.${finite(s.change20) ? ` 지난 20거래일 ${pct(s.change20, 1)}.` : ''}${shp?.common.length && shp.hits.has(s.code) ? (sunOn ? ' 태양입니다.' : ` 공통 모양 ${shp.common.length}가지 가운데 ${sunHas}가지.`) : ''}`;
  const chartBox = h('div', {class: 'c-chart'});
  // 그림 한 장은 언제나(규칙 33) — 20거래일 값이 없는 회사도 먹 붓질(값 「없음」) · 판을 못 읽은 날은 빈 하늘 / 한 번만 만든다(저절로 한 번 · 그림마다 기억)
  const art = (board ? companyArt(board, s, cm) : null) ?? quietArt({key: 'company', label: '지난 20거래일', when: s.date ? `${korDate(s.date)} 종가` : null});
  const codeLine = h('p', {class: 'b-when'}, h('code', null, s.code), s.ksic ? ` · 업종 ${s.group?.label ?? s.ksic}(한국거래소: ${s.ksic})` : s.sector ? ` · 업종 ${s.group?.label && s.group.label !== s.sector ? `${s.group.label}(${s.sector})` : s.sector}` : '', s.kind ? ' ' : null, kindBadge(s.kind));
  main.replaceChildren(h('article', {class: 'b-page c-page', 'data-code': s.code},
    // 뒤로: 출목표 한 판에서 왔으면 그 판(보던 자리 그대로) · 아니면 이 회사의 업종 화면(처음 화면 → 업종 → 회사 순서를 거꾸로) · 업종을 모르면 처음 화면
    // 2026-10-05 탭 다섯: 「예비」(닮은 7곳) · 「22곳」에서 왔으면 그 목록으로(보던 자리 그대로)
    state.from === 'road' ? h('a', {class: 'c-back', href: '#/road'}, '‹ 출목표')
      : state.from === 'stocks' ? h('a', {class: 'c-back', href: '#/stocks'}, '‹ 종목') // 「ATLAS 개편 실행 지시서」(2026-10-08 20:19) — 옛 「찾기」는 아래 탭 「종목」 안 · 넣은 글자 · 고른 묶음 그대로
      : state.from === 'watch' ? h('a', {class: 'c-back', href: '#/watch'}, '‹ 관심종목')
      : state.from === 'flow' ? h('a', {class: 'c-back', href: '#/flow'}, '‹ 투자자 매매') // 아래 탭 「돈 흐름」 첫 화면(route id 'flow')
      : state.from === 'rotation' ? h('a', {class: 'c-back', href: '#/flow/rotation'}, '‹ 업종 순환')
      : state.from === 'similar' ? h('a', {class: 'c-back', href: '#/similar'}, '‹ 예비')
      : state.from === 'rise' ? h('a', {class: 'c-back', href: '#/rise'}, '‹ 오름 상위')
      : h('a', {class: 'c-back', href: s.group?.id ? '#/i/' + s.group.id : '#/'}, '‹ ', s.group?.label ?? manifest.universeSet?.label ?? '처음 화면'), // 「‹ 」 와 이름을 나눠 이름만 사전에서 찾음
    h('header', {class: 'b-head'},
      h('h1', {class: 'b-title' + (String(s.name ?? '').length > 10 ? ' c-long' : ''), 'data-speak': ''}, s.name, sunTag(sunOn)), // 긴 이름은 작게 · 두 줄까지(한국어 360px 에서 이름이 세 줄이 되어 그림 이름표가 아래 탭 밑으로 가던 것 — 2026-10-08 06:27 두 말 검사가 찾음) // 태양 회사면 이름 곁 작은 해(B3)
      // 업종: 한국거래소 업종(한국표준산업분류)이 있으면 그 이름 · 없으면 네이버 증권 업종(2026-10-05 365곳 묶음부터 더 잘게)
      priceLine(s, {big: true})), // ① 지금 종가 · 기준 시각(머리) — 자료 상태 줄은 그림 바로 아래(긴 말에서도 그림 이름 · 숫자가 첫 화면에 · 규칙 30)
    // 2026-10-08 01:27 「이런식으로 모두」 — 값 바로 아래 그림 한 장(먹 붓질 · 규칙 33): 지난 20거래일 줄(기간은 그림 이름표 · 변화는 그림 숫자) · 논평 무대를 그림이 대신(규칙 1) · 순위 단추 · 지수 띠는 그림 아래
    art,
    statusLine(ls, s), // ① 자료 상태(「ATLAS 개편 실행 지시서」 7 — 그날 종가 · 지연 · 오래된 종가 · 기업행사 확인 필요 · 받은 때)
    codeLine, // 기호 · 업종 줄은 그림 아래(값 · 그림이 한 화면에 · 규칙 30)
    lens ? [sinceBox(ls, lens), ...evidenceBoxes(ls, lens, s), nextBox(ls, lens, agenda, s), verifyBox(ls, lens), compareBox(ls, lens)] : null, // ② ~ ⑥ · 비교(「ATLAS 개편 실행 지시서」 7)
    watchBox(s), // ★ 관심 등록(이 기기에만 · 7)
    rankNav(board, s),
    marketStrip(manifest),
    h('section', {class: 'b-box'}, h('h2', {class: 'b-box-h'}, `지난 ${rows.length}거래일 종가`, h('small', null, first ? ` · ${korDate(first)}부터 ${korDate(last)}까지${band > 0 ? ' · 옅은 띠 = 지난 20거래일(판 · 출목표와 같은 구간)' : ''}` : '')), chartBox,
      s.closeSource ? h('p', {class: 'muted xs'}, `마지막 종가: ${place.exchange} ${place.close} 종가 · 받은 시각 ${stamp(s.closeSource.observedAt)}`) : null),
    h('section', {class: 'b-box'}, h('h2', {class: 'b-box-h'}, '출목표', h('small', null, s.cFrom ? ` · 지난 ${Math.max(0, (s.c?.length ?? 1) - 1)}거래일 · ${korDate(s.cFrom)}부터` : '', finite(s.change20) ? ` · ${pct(s.change20, 1)}` : '')), roadBox(s.c, {note: true, title: false}), sunCheck(shp, s.code, board?.asOf ?? s.date)),
    whyBoxes(board, shp, s), // 「왜 태양인가」 · 「왜 예비인가」(2026-10-08 06:48 · 06:49) — 태양 점검 바로 아래 · 태양 · 예비인 회사만
    briefBox(board, s), // 2026-10-05 「잡스라면」 22번 — 회사 화면 차례: 20거래일 변화 → 그래프 → 출목표 → 수급·기사 → 일정 → (접힘) 1년 숫자
    h('section', {class: 'b-box'}, h('h2', {class: 'b-box-h'}, '일정·공시'), agendaBox(agenda?.byCode?.[s.code] ?? null, {max: 0, builtDay: agenda?.sources?.disclosures?.day ?? null})),
    contextBox(s.context),
    h('details', {class: 'b-how c-year'}, h('summary', null, '지난 1년 숫자 · 1년 최고·최저 · 252거래일 변화'), infoGrid(s)), // 기간이 20거래일과 달라 접어 둠(25번 「기간 잣대 하나」)
    nearBox(board, s, shp),
    foot(manifest)));
  closeChart(chartBox, rows, {band: band > 0 ? band : null, ariaLabel: `${s.name} 지난 ${rows.length}거래일 종가 · 처음 ${won(rows[0]?.close)} · 마지막 ${won(rows.at(-1)?.close)}${band > 0 ? ` · ${korDate(rows[band].date)}부터 끝까지 옅은 띠(지난 20거래일)` : ''}`});
}
