/* ATLAS 11 · 판 공용 부품 — 일정·공시 줄(★) · 출목표 칸 · 시장 일정 · 읽는 법 · 바뀔 묶음 미리 보기 · 값 줄 · 맨 아래 출처 줄
   2026-10-04 15:37 사장님 「이제 예측을 하지 않는다 예측에 관련된 모든 기능과 화면을 삭제하고. 표현하지 마라」 — 앞날 값은 어디에도 없다
   일정 이름·공시 제목은 공식 이름 그대로라(「SEDEX 2026」 · 「2단계 가격제한폭」) 또렷함 검사에서 식별자(data-ident)로 센다 — 우리 숫자가 아님. */
import {h, won, pct, korDate, stamp, signCls, signMark, finite, kst, place} from './util.js';
import {roadOf, roadSvg, roadKey, unitText} from './road.js';
import {integrityText} from './frame.js';

export const LV = {3: '★★★', 2: '★★', 1: '★'};
export const LV_WORD = {3: '아주 중요', 2: '중요', 1: '참고'};

/** 별(★)만으로 뜻을 전하지 않는다 — 별 옆에 말(아주 중요 · 중요 · 참고) · 2026-10-05 「잡스였다면」 개혁 */
const star = level => h('b', {class: 'lv lv' + level, title: LV_WORD[level], 'aria-label': `${LV_WORD[level]}(별 ${level}개)`}, LV[level], h('small', {class: 'lv-w', 'aria-hidden': 'true'}, ' ' + LV_WORD[level]));
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
    entry.missing?.includes('공시') ? h('p', {class: 'muted small'}, place.disclosuresNone ?? '공시 자료 없음 · 거래일 16:00 실행 때 모읍니다') // 미국 판은 공시를 아직 싣지 않음(util.js place)
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
    h('span', {class: 'b-date'}, `${korDate(c.date)} ${place.close} 종가`)); // 한국 「15:30」 · 미국 「16:00(뉴욕)」
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
/* 36칸 판 칸 색의 세기와 색 보기표는 2026-10-05 「잡스였다면」 개혁에서 덜어 냄 — 칸 차례가 크기를 말하고, 칸 위 가는 선 하나가 오름(빨강)·내림(파랑)만 말한다 */
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
/* ── 회사 한 곳의 선 그래프 · 수급 · 기사(출목표 한 판 칸과 업종 카드가 함께 쓴다) ──
   2026-10-04 22:51 사장님 「출목표만 있으면 않돼 그래프로 있어야 해 그리고 그 회사들 뉴스와 수급도」
   · 선 그래프: 출목표와 같은 21개 종가(지난 20거래일) · 첫날 종가에 옅은 점선(선이 그 위면 첫날보다 높음) · 마지막 날 점 · 첫날보다 높으면 빨강, 낮으면 파랑
     넓이를 칠하지 않는다(바닥이 0 이 아닌 넓이는 크기를 부풀려 보이게 함) · 화면 폭에 맞춰 커져도 비율은 그대로
   · 수급: 최근 5거래일 외국인·기관 순매수 합(주) — 가운데 0 에서 좌우 막대(둘 중 큰 값이 반 폭) · 잠정인 날은 적는다
   · 기사: 가장 최근 기사 가운데 회사 이름이 든 1건(언론사 · 시각) — 제목은 원문 그대로(식별자) · 없으면 없다고 적는다 */
const SVGNS = 'http://www.w3.org/2000/svg';
export const sv = (tag, attrs = {}, ...kids) => { const el = document.createElementNS(SVGNS, tag); for (const [k, v] of Object.entries(attrs)) if (v != null) el.setAttribute(k, String(v)); for (const c of kids) if (c) el.append(c); return el; };
/** 뜨거운 태양(2026-10-05 14:30 사장님 「모양을 뜨거운 태양으로 하셔」) — 노란 해 + 주황 불꽃 테 + 빛살 12개(길고 짧게 번갈아)
   빛살은 천천히 돌고 불꽃 테는 숨 쉬듯(움직임 줄이기면 멈춤 · style.css) · label 이 없으면 그림일 뿐이라 글로 읽히지 않음(aria-hidden)
   2026-10-05 15:24 「잡스가 … 36가지」 B: 출목표에만 있던 해를 모든 화면이 함께 쓰도록 여기로 옮김(한 개념 · 한 그림) */
export function sunIcon(cls = '', label = null) {
  const rays = [];
  for (let k = 0; k < 12; k++) { const a = k * Math.PI / 6, r2 = k % 2 ? 9.4 : 11.3, c = Math.cos(a), s = Math.sin(a);
    rays.push(sv('line', {x1: (12 + 7.3 * c).toFixed(2), y1: (12 + 7.3 * s).toFixed(2), x2: (12 + r2 * c).toFixed(2), y2: (12 + r2 * s).toFixed(2)})); }
  return sv('svg', {class: 'sun' + (cls ? ' ' + cls : ''), viewBox: '0 0 24 24', ...(label ? {role: 'img', 'aria-label': label} : {'aria-hidden': 'true'}), focusable: 'false'},
    sv('g', {class: 'sun-rays'}, ...rays), sv('circle', {class: 'sun-glow', cx: 12, cy: 12, r: 6.6}), sv('circle', {class: 'sun-core', cx: 12, cy: 12, r: 4.9}));
}
/** 회사 이름 곁 작은 해 — 태양 회사(오른 회사 출목표의 공통 모양을 모두 가진 곳)이면 · 그림 안에 글자가 없어 이름 글은 그대로(화면 읽기는 「태양」) */
export const sunTag = on => on ? sunIcon('sun-tag', '태양') : null;
/** 업종 칸 · 불장 줄의 태양 수 「☀2곳」(0 이면 없음) */
export const sunNum = (n, cls = 'sun-n') => n ? h('span', {class: cls, title: `태양 ${n}곳`}, sunIcon(), h('span', {class: 'sun-n-t'}, `${n}곳`)) : null;
/** 태양 보기표 한 줄 — 「☀ = 태양 … · 출목표에서 태양 n곳 모아 보기 ›」(불장 · 업종 탭 맨 아래 · 같은 업종 칸 표시의 뜻) */
export function sunKey(shp) {
  if (!shp?.sparkle?.size) return null;
  return h('p', {class: 't-key sun-key xs'}, sunIcon(), ` = 태양(지난 20거래일 오른 회사 출목표의 공통 모양 ${shp.common.length}가지를 모두 가진 회사) 수 · `,
    h('a', {class: 'sun-go', href: '#/road/sun'}, `출목표에서 태양 ${shp.sparkle.size}곳 모아 보기 ›`));
}
/** 첫날 대비 변화(0 = 첫날 종가) — 지난 20거래일 21개 종가 */
const retsOf = c => { const cs = (c?.c ?? []).filter(v => finite(v) && v > 0); return cs.length < 2 ? [] : cs.map(v => v / cs[0] - 1); };
/** 한 묶음(업종 5곳 · 흐름 한 가지)이 함께 쓰는 눈금 — 같은 눈금이라야 칸끼리 크기를 견줄 수 있다 · 위아래로 적어도 3% */
export function sparkScale(companies) {
  const all = companies.flatMap(retsOf);
  return {lo: Math.min(-0.03, ...all), hi: Math.max(0.03, ...all)};
}
export const scaleText = sc => `선 그래프 눈금은 이 묶음이 함께 씀(${pct(sc.lo, 0)} ~ ${pct(sc.hi, 0)} · 점선이 첫날 종가)`;
export function sparkSvg(c, scale = null) {
  const cs = (c?.c ?? []).filter(v => finite(v) && v > 0), rs = retsOf(c);
  if (cs.length < 2) return h('span', {class: 'sp-none'}, '선 그래프 없음(종가가 모자람)');
  const sc = scale ?? sparkScale([c]), W = 200, H = 50, P = 5, span = sc.hi - sc.lo || 1;
  const x = i => P + i * (W - 2 * P) / (cs.length - 1), y = r => P + (sc.hi - r) / span * (H - 2 * P);
  const side = cs.at(-1) > cs[0] ? 'up' : cs.at(-1) < cs[0] ? 'down' : 'flat';
  return sv('svg', {class: 'spark ' + side, viewBox: `0 0 ${W} ${H}`, role: 'img', 'data-points': cs.length, 'data-lo': sc.lo.toFixed(4), 'data-hi': sc.hi.toFixed(4),
    'aria-label': `선 그래프 · 지난 ${cs.length - 1}거래일 종가 · ${korDate(c.cFrom)} ${won(cs[0])}에서 ${korDate(c.date)} ${won(cs.at(-1))}로(${pct(rs.at(-1), 1)}) · 가장 높은 종가 ${won(Math.max(...cs))} · 가장 낮은 종가 ${won(Math.min(...cs))}`},
    sv('line', {class: 'sp-base', x1: P, x2: W - P, y1: y(0).toFixed(1), y2: y(0).toFixed(1)}),
    sv('polyline', {class: 'sp-line', points: rs.map((r, i) => `${x(i).toFixed(1)},${y(r).toFixed(1)}`).join(' ')}),
    sv('circle', {class: 'sp-end', cx: x(cs.length - 1).toFixed(1), cy: y(rs.at(-1)).toFixed(1), r: 3.4}));
}
/** 묶음 평균 선(흐름 목록 줄마다) — 같은 날짜까지 종가가 있는 회사들의 첫날 대비 변화를 날마다 평균 · 모든 줄이 같은 눈금 */
export const meanRets = cs => { const ok = cs.filter(c => (c.c?.length ?? 0) >= 2 && c.c.every(v => finite(v) && v > 0)), n = Math.min(...ok.map(c => c.c.length));
  return ok.length ? Array.from({length: n}, (_, i) => ok.reduce((t, c) => t + c.c[i] / c.c[0] - 1, 0) / ok.length) : []; };
export function meanSpark(rets, sc, label) {
  if (rets.length < 2) return h('span', {class: 'sp-none'}, '선 없음');
  const W = 120, H = 30, P = 3, span = sc.hi - sc.lo || 1, x = i => P + i * (W - 2 * P) / (rets.length - 1), y = r => P + (sc.hi - r) / span * (H - 2 * P);
  const side = rets.at(-1) > 0 ? 'up' : rets.at(-1) < 0 ? 'down' : 'flat';
  return sv('svg', {class: 'spark mini ' + side, viewBox: `0 0 ${W} ${H}`, role: 'img', 'data-points': rets.length, 'data-lo': sc.lo.toFixed(4), 'data-hi': sc.hi.toFixed(4), 'aria-label': label},
    sv('line', {class: 'sp-base', x1: P, x2: W - P, y1: y(0).toFixed(1), y2: y(0).toFixed(1)}),
    sv('polyline', {class: 'sp-line', points: rets.map((r, i) => `${x(i).toFixed(1)},${y(r).toFixed(1)}`).join(' ')}),
    sv('circle', {class: 'sp-end', cx: x(rets.length - 1).toFixed(1), cy: y(rets.at(-1)).toFixed(1), r: 2.6}));
}
/** 주 단위 순매수 → 「+12만주」 「−1,071만주」 「+3,400주」 「−1.2억주」 */
export const sharesText = v => { if (!finite(v)) return '없음'; const a = Math.abs(v), sg = v > 0 ? '+' : v < 0 ? '−' : ''; return a >= 1e8 ? `${sg}${(a / 1e8).toFixed(1)}억주` : a >= 1e4 ? `${sg}${Math.round(a / 1e4).toLocaleString('ko-KR')}만주` : `${sg}${a.toLocaleString('ko-KR')}주`; };
const notYet = '아직 모으지 않음';
/** 수급 한 줄: 「수급 5거래일 · 외국인 +7,954주 · 기관 +13만주」 · 잠정인 날은 적는다 · 언제까지인지는 그 화면 머리 한 줄(출목표 「수급·기사: … 기준」 · 업종 「수급: … 까지 5거래일 합」)과 읽어 주기 글에
   2026-10-05 「잡스였다면」 개혁: 칸 하나에 넷까지(애플 WWDC20) — 막대 두 줄 대신 부호 달린 숫자 한 줄(색만이 아니라 + · − 로) */
export function flowLine(brief) {
  const f = brief?.flows;
  // 미국 판: 투자자별(외국인·기관) 매매는 공개 자료가 없다 — 「아직 모으지 않음」이 아니라 그렇다고 적는다(2026-10-05 18:02 「미국 주식도」)
  if (!f && place.flows === false) return h('span', {class: 'fl fl-none'}, h('span', {class: 'fl-h'}, '수급 · '), h('span', {class: 'fl-miss'}, place.flowsNone ?? '미국은 투자자별 매매 공개 자료 없음'));
  if (!f) return h('span', {class: 'fl fl-none'}, h('span', {class: 'fl-h'}, '수급 · '), h('span', {class: 'fl-miss'}, !brief || brief.missing?.includes('수급') ? notYet : '수급 자료 없음'));
  const side = v => v > 0 ? 'up' : v < 0 ? 'down' : 'flat', pv = f.provisional.length ? ` · ${f.provisional.length === 1 && f.provisional[0] === f.to ? '마지막 날' : f.provisional.map(korDate).join('·')} 잠정` : '';
  const val = (label, v) => h('span', {class: 'fl-it', 'data-who': label}, `${label} `, h('b', {class: 'fl-val ' + side(v)}, sharesText(v)));
  return h('span', {class: 'fl', 'data-days': f.days, 'aria-label': `수급 · ${korDate(f.from)}부터 ${korDate(f.to)}까지 ${f.days}거래일 순매수 합 · 외국인 ${sharesText(f.foreign)} · 기관 ${sharesText(f.institution)}${f.provisional.length ? ` · ${f.provisional.map(korDate).join(', ')} 값은 잠정` : ''}`},
    h('span', {class: 'fl-h'}, `수급 ${f.days}거래일${pv}`), ' · ', val('외국인', f.foreign), ' · ', val('기관', f.institution));
}
/** here: 회사 화면 안이면 「회사 화면에」 대신 「아래 「수급·기사·공시 기록」에」(2026-10-05 15:24 「잡스가 … 36가지」 C1 — 회사 화면이 저를 가리키지 않게) */
export function newsLine(brief, {here = false} = {}) {
  const n = brief?.news;
  if (!n) return h('span', {class: 'nw nw-none'}, h('span', {class: 'nw-h'}, '기사'), h('span', {class: 'nw-miss'}, !brief || brief.missing?.includes('기사') ? notYet : brief.newsCount ? `회사 이름이 든 기사 없음 · 모은 기사 ${brief.newsCount}건은 ${here ? '아래 「수급·기사·공시 기록」에' : '회사 화면에'}` : '모은 기사 없음'));
  // 언론사 이름(「아이뉴스24」 같은)도 원문 이름이라 식별자로 둔다 — 이름 속 숫자를 단위 없는 숫자로 세지 않게
  return h('span', {class: 'nw'}, h('span', {class: 'nw-h'}, `기사 · ${stamp(n.publishedAt)} · `, n.office ? h('span', {'data-ident': ''}, n.office) : '언론사 이름 없음'), h('span', {class: 'nw-t', 'data-ident': ''}, n.title));
}

/** 「ATLAS가 하지 않는 일」 — 잡스는 안 한 일도 한 일만큼 자랑했다(포춘 2008. 3.) · 애플 2026 원칙 「제품이 무엇을 왜 하는지 숨김없이」 · 접어 둠 */
export const NOT_DO = ['지난 기록만 보여 줍니다(거래일 15:30 종가 · 16:00에 올림)', '앞날 값을 맞히지 않습니다', '어느 회사를 고르라고 하지 않습니다', '알림을 보내지 않습니다',
  '축하 그림 · 점수 · 배지를 쓰지 않습니다', '「그때 샀다면 얼마」 같은 가정 수익을 셈하지 않습니다', '값이 늦거나 빠지면 그렇다고 적습니다(0 으로 채우지 않음)'];
/* 저녁 7시 들고 남 칸 — 2026-10-05 05:03 사장님 「매일 저녁 7시에 … 여러 주건들에 이동이 반영되게 하라」 · 10:24 「잡스라면」 24번: 탭 「불장」 세 화면의 스위치 바로 아래 같은 자리 하나로
   (옛 자리: 예비 화면 맨 위 칸 + 22곳 화면 한 줄 — 둘로 나뉘어 있었음) · 견준 기록이 있으면 한 줄 요약만 보이고 이름은 눌러서 */
/** 들고 남 한 줄 — 표시(글자) · 무엇 · 이름들(없으면 「없음」) */
const moveRow = (mark, what, list, kind) => h('li', {class: 'mvx-row', 'data-kind': kind, 'data-n': list.length},
  h('span', {class: 'mvx-mark', 'aria-hidden': 'true'}, mark), h('span', {class: 'mvx-what'}, what), h('span', {class: 'mvx-who'}, list.length ? list.map(x => x.label ?? (x.groupLabel ? `${x.name}(${x.groupLabel})` : x.name)).join(' · ') : '없음'));
/** 기록한 때 「10월 5일(월) 19:03」 — GitHub 예약이 늦게 오는 날이 있어 실제로 기록한 시각을 그대로 적는다 */
const at = iso => iso && Number.isFinite(Date.parse(iso)) ? `${korDate(kst(iso).date)} ${kst(iso).time}` : '';
/** 저녁 7시 들고 남 — 기록 둘을 맞대어 본 값(판에 적힌 그대로) */
export function movesBox(mv) {
  if (place.moves === false) return null; // 미국 판: 저녁 7시 기록이 없다(한국 판 atlas11-evening 만 적음) — 빈 칸을 두지 않는다
  const head = sub => h('p', {class: 'mvx-h'}, h('b', null, '저녁 7시 들고 남'), sub ? h('span', {class: 'mvx-when'}, sub) : null);
  // 기록이 없을 때는 한 줄만(2026-10-05 15:24 「잡스가 … 36가지」 A6 — 빈 칸이 세 화면 맨 위 두 줄을 차지하지 않게)
  if (!mv) return h('section', {class: 'mvx mvx-quiet mvx-none', 'aria-label': '저녁 7시 들고 남', 'data-state': 'none'}, head('아직 기록 없음 · 거래일 19:00마다 적음'));
  if (mv.first) return h('section', {class: 'mvx mvx-quiet', 'aria-label': '저녁 7시 들고 남', 'data-state': 'first'}, head(`${korDate(mv.to)} 종가 · 처음 기록(${at(mv.at)})`),
    h('p', {class: 'mvx-note'}, '처음 기록이라 견줄 앞 기록이 없습니다 · 다음 거래일 19:00 기록부터 들고 난 업종·회사를 적습니다'));
  return h('section', {class: 'mvx', 'aria-label': '저녁 7시 들고 남', 'data-state': 'moves'}, head(`${korDate(mv.from)} 종가 → ${korDate(mv.to)} 종가 · ${at(mv.at)} 기록`),
    h('details', {class: 'mvx-more'}, h('summary', {class: 'mvx-sum'}, `불장 든 업종 ${mv.hotIn.length}개 · 빠진 업종 ${mv.hotOut.length}개 · 예비 든 회사 ${mv.similarIn.length}곳 · 빠진 회사 ${mv.similarOut.length}곳 · 오름 상위 든 곳 ${mv.nextIn.length}곳 · 빠진 곳 ${mv.nextOut.length}곳`),
    h('ul', {class: 'mvx-list'},
      moveRow('▲', '불장에 든 업종', mv.hotIn, 'hot-in'),
      moveRow('▼', '불장에서 빠진 업종', mv.hotOut, 'hot-out'),
      moveRow('★', '예비에서 불장이 된 회사', mv.becameHot, 'became'),
      moveRow('＋', '예비에 새로 든 회사', mv.similarIn, 'sim-in'),
      moveRow('－', '예비에서 빠진 회사', mv.similarOut, 'sim-out')),
    h('p', {class: 'mvx-22'}, `오름 상위: 새로 든 곳 ${mv.nextIn.length}곳 · 빠진 곳 ${mv.nextOut.length}곳`)));
}

/** 불장 탭 맨 위 스위치 셋 — [불장 | 예비 | 오름 상위] (2026-10-05 10:24 「잡스라면 36가지」 14번)
   세 명단이 모두 「어디가 뜨겁나」에 답하므로 아래 탭 셋이 아니라 한 탭 안의 스위치로 · 내리지 않고 한 번 눌러 바뀐다(05:03 「밑으로 내려야 하잖아」 그대로 지킴)
   이름에는 숫자를 넣지 않고(28번) 개수는 작은 글로 곁에 — 개수가 바뀌어도 이름은 그대로
   셋째 이름은 처음에 「많이 오른 곳」이었으나 또렷함 검사 2번(숫자 없는 「많이」 = 흐릿한 말)에 걸려 「오름 상위」로 — 뜻은 같고(불장 밖에서 20거래일 많이 오른 차례) 흐릿한 말이 없다 */
export const HOT_SEGS = [{id: 'home', href: '#/', label: '불장', unit: '개'}, {id: 'similar', href: '#/similar', label: '예비', unit: '곳'}, {id: 'rise', href: '#/rise', label: '오름 상위', unit: '곳'}];
export const hotCounts = board => ({home: board?.hot?.items?.length ?? 0, similar: board?.similar?.items?.length ?? 0, rise: board?.next?.items?.length ?? 0});
export function hotSwitch(active, counts = {}) {
  return h('nav', {class: 'f-seg hs-seg', 'aria-label': '불장 · 예비 · 오름 상위 바꾸기'},
    ...HOT_SEGS.map(s => h('a', {class: 'f-seg-b hs-b', href: s.href, 'data-seg': s.id, 'aria-current': s.id === active ? 'page' : null},
      h('span', {class: 'hs-l'}, s.label), Number.isInteger(counts[s.id]) ? h('small', {class: 'hs-n'}, `${counts[s.id]}${s.unit}`) : null)));
}
export function promiseBox() {
  const list = [place.notDo, ...NOT_DO.slice(1)]; // 첫 줄은 시장마다(한국 15:30 · 미국 뉴욕 16:00)
  return h('details', {class: 'b-how b-promise-box'}, h('summary', null, `ATLAS가 하지 않는 일 ${list.length}가지`), h('ul', null, ...list.map(x => h('li', null, x))));
}
/** 맨 아래: 약속 한 줄 · 출처 · 기술 정보(만든 시각 · 판 이름 · 무결성 — 접어 둠) */
export function foot(m) {
  return h('footer', {class: 'b-foot'},
    h('p', {class: 'b-promise'}, '지난 기록만 보여 줍니다 · 앞날을 맞히지 않습니다'),
    h('p', null, place.foot), // 시장마다(util.js place)
    h('details', {class: 'b-tech'}, h('summary', null, '기술 정보'),
      h('p', null, `자료를 만든 시각 ${stamp(m?.generatedAt)} · 판 `, h('code', null, m?.boardId ?? '없음')),
      h('p', null, '무결성: ', h('span', {class: 'integrity-text'}, integrityText()))));
}
