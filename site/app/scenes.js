/* ATLAS 11 · 화면마다 그림 한 장(규칙 33 · 2026-10-09 규칙 42 로 고침) — 자료 차트
   2026-10-09 「ATLAS 업데이트 실행 프롬프트」(사장님 01:41 마카오 시각 첨부) 7 「장식 연출을 자료 차트로」:
     불장 봉화대 · 풍등 · 매화 · 구슬 그릇 → 같은 축 막대 · 분포 / 산수화 봉우리 → 같은 축 막대(지도 아래 땅 지도가 2D 표) / 방패연 → 평균 펼치기(decomp.js)
     먹 붓질 → 같은 업종 회사들의 같은 축 막대 / 달 → 날짜 축 / 매듭 끈 → 시간순 기둥 / 해시계 → 시간 띠 / 항아리 → 같은 축 막대 / 돌계단 → 순위 눈금 / 빈 하늘 → 빈 축(값 없음)
   · 그림마다 차례 넷(art.js): 현재 관측(차트) → 기여 요인 → 반대 근거 → 다음 확인(아래 요약 줄 셋) · 처음에는 최신 결과가 멈춘 채로
   · 그림 속 숫자는 판 자료 · 판 읽기 그대로 — 그림마다 data-check 에 실은 값을 검사기가 따로 셈해 맞댐(scripts/atlas11/art_expect.mjs)
   · 판(board) 값은 소수(0.123 = +12.3%) · 판 읽기(lens) 값은 %(12.3 = +12.3%) — 막대 축은 모두 %
   · 무대 · 배우 · 끝없는 장식 움직임 없음(옛 규칙 35 를 내림 · 2026-10-09) */
import {h, korDate, pct, finite} from './util.js';
import {artStage, artSection, chgEl, p1} from './art.js';
import {familiesByRise, familyOf, riseDesc} from './family.js';
import {plain} from './comment.js';
import {barRows, axisOf, keyEl, histoEl, dateAxisEl, columnsEl, posOf, trackEl} from './charts.js';
import {fmtPct, fmtPp, fin, summarize} from './calc.js';

/* ── 작은 도구 ── */
/** 그림 속 숫자를 검사기가 맞댈 수 있게 — data-check='{"k":v}' (화면에 보이지 않음 · 읽기 프로그램도 건너뜀) */
const check = (el, obj) => { el.dataset.check = JSON.stringify(obj); return el; };
const when = d => (d ? `${korDate(d)} 종가` : null);
const tag = t => h('span', {class: 'ra-k ra-tag'}, t);
/** 요약 줄 하나(차례 번호 at) */
const li = (at, ...kids) => h('p', {class: 'ra-li', 'data-at': at == null ? null : String(at)}, ...kids);
const lab = (...lines) => h('div', {class: 'ra-lab'}, ...lines.filter(Boolean));
/** 차례 넷 — 차트(0) → 요약 줄 셋(1 · 2 · 3) */
const STEPS4 = [{c: 0, at: 0, ms: 1200}, {c: 1, at: 1, ms: 1300}, {c: 2, at: 2, ms: 1300}, {c: 3, at: 3, ms: 1000}];
const co = name => h('span', {'data-ident': ''}, name); // 회사 이름 그대로(이름 속 숫자를 단위 없는 숫자로 세지 않음)
const pp = v => h('b', {class: 'rt-n' + (v > 0 ? ' up' : v < 0 ? ' down' : '')}, fmtPct(v)); // 판 읽기 % 값
const rowB = (x, k, name, href, ident = false) => ({id: x.id ?? x.code, name, ident, href, v: finite(x.change20) ? x.change20 * 100 : null, txt: finite(x.change20) ? p1(x.change20) : '없음', rank: `${k + 1}위`, at: 0});
const fig = (key, label, kicker, w, stage, extra = {}) => artSection({key, label, kicker, when: w, stage, ...extra});

/* ═════════ 불장(#/hot) — 불장 업종의 지난 20거래일 변화(같은 축) ═════════ */
export function hotArt(board) {
  const groups = board?.groups ?? [], hot = groups.filter(g => g.hot), gs = hot.filter(g => finite(g.change20)).sort(riseDesc);
  if (!gs.length) return null;
  const g0 = gs[0], g1 = gs[1] ?? null, low = gs.at(-1), dn = gs.filter(g => g.change20 < 0).length;
  const rows = gs.slice(0, 3).map((g, k) => rowB(g, k, g.label, '#/i/' + g.id)); // 위 3개(한 화면 · 나머지는 아래 목록)
  const art = h('div', null, barRows(rows), gs.length > 3 ? h('p', {class: 'bc-more'}, `불장 업종 ${gs.length}개 가운데 위 3개 · 나머지는 아래 목록`) : null);
  const labels = check(lab(
    li(1, tag('1위'), h('b', null, g0.label), chgEl(g0.change20), g1 ? [' · ', tag('2위'), h('b', null, g1.label), chgEl(g1.change20)] : null),
    li(2, tag('반대 근거'), gs.length > 1 ? [`가장 낮은 불장 업종 ${low.label} `, chgEl(low.change20), ` · 내린 업종 ${dn}개`] : '불장 업종이 하나뿐'),
    li(3, tag('확인할 것'), '업종을 누르면 구성 종목의 수익률 · 기여')), {g0: g0.id, v0: +g0.change20.toFixed(6), g1: g1?.id ?? null, n: hot.length});
  return fig('home', '불장', '불장', `불장 업종 ${hot.length}개 · 지난 20거래일 · ${when(board.asOf)}`, artStage({key: 'hot', art, labels, steps: STEPS4}));
}

/* ═════════ 지도(#/map) · 갈래(#/map/f/<갈래>) — 갈래 평균 · 업종 변화(같은 축 · 위 3 + 아래 2) ═════════ */
const headTail = (xs, a = 3, b = 2) => (xs.length <= a + b ? xs.map((x, k) => [x, k]) : [...xs.slice(0, a).map((x, k) => [x, k]), ...xs.slice(-b).map((x, k) => [x, xs.length - b + k])]);
export function mapArt(board) {
  const fams = familiesByRise(board?.groups ?? []).filter(f => finite(f.avg));
  if (!fams.length) return null;
  const top = fams[0], low = fams.at(-1), up = fams.filter(f => f.avg > 0).length;
  const rows = headTail(fams, 2, 1).map(([f, k]) => ({id: f.fam.id, name: f.fam.label, href: '#/map/f/' + f.fam.id, v: f.avg * 100, txt: p1(f.avg), rank: `${k + 1}위`, at: 0}));
  const art = h('div', null, barRows(rows), fams.length > 3 ? h('p', {class: 'bc-more'}, `갈래 ${fams.length}개 가운데 위 2개 · 맨 아래 1개 · 모두는 아래 땅 지도`) : null);
  const labels = check(lab(
    li(1, tag(top.avg > 0 ? '가장 높은 갈래' : '가장 덜 내린 갈래'), h('b', null, top.fam.label), chgEl(top.avg)),
    li(2, tag(low.avg < 0 ? '가장 낮은 갈래' : '가장 덜 오른 갈래'), h('b', null, low.fam.label), chgEl(low.avg), ` · 갈래 ${fams.length}개 중 ${up}개 오름`),
    li(3, tag('확인할 것'), '갈래를 누르면 그 안 업종들')), {top: top.fam.id, topAvg: +top.avg.toFixed(6), low: low.fam.id, lowAvg: +low.avg.toFixed(6), up, n: fams.length});
  return fig('map', '지도', '지도', `갈래 평균 · 지난 20거래일 · ${when(board.asOf)}`, artStage({key: 'map', art, labels, steps: STEPS4}));
}
export function landArt(board, famId) {
  const gs = (board?.groups ?? []).filter(g => familyOf(g.label).id === famId && finite(g.change20)).sort(riseDesc);
  if (!gs.length) return null;
  const g0 = gs[0], g1 = gs[1] ?? null, up = gs.filter(g => g.change20 > 0).length, low = gs.at(-1);
  const rows = headTail(gs, 2, 1).map(([g, k]) => rowB(g, k, g.label, '#/i/' + g.id));
  const art = h('div', null, barRows(rows), gs.length > 3 ? h('p', {class: 'bc-more'}, `업종 ${gs.length}개 가운데 위 2개 · 맨 아래 1개 · 모두는 아래 목록`) : null);
  const labels = check(lab(
    li(1, tag('1위'), h('b', null, g0.label), chgEl(g0.change20), g1 ? [' · ', tag('2위'), h('b', null, g1.label), chgEl(g1.change20)] : null),
    li(2, tag('반대 근거'), gs.length > 1 ? [`가장 낮은 업종 ${low.label} `, chgEl(low.change20), ` · 업종 ${gs.length}개 가운데 ${up}개 오름`] : `업종 ${gs.length}개 가운데 ${up}개 오름`),
    li(3, tag('확인할 것'), '업종을 누르면 구성 종목의 수익률 · 기여')), {g0: g0.id, v0: +g0.change20.toFixed(6), g1: g1?.id ?? null, up, n: gs.length});
  const fam = familyOf(g0.label);
  return fig('land', fam.label, fam.label, `업종 ${gs.length}개 · 지난 20거래일 · ${when(board.asOf)}`, artStage({key: 'land-' + famId, art, labels, steps: STEPS4}));
}

/* ═════════ 업종(#/i/<업종>) — 판 읽기를 못 읽은 날의 대신 그림(판 값 · 종목마다 자기 마지막 21개 종가) · 판 읽기가 있으면 평균 펼치기(decomp.js) ═════════ */
export function industryArt(board, g, upLineText) {
  if (!g) return null;
  const byCode = new Map((board?.companies ?? []).map(c => [c.code, c]));
  const cs = (g.codes ?? []).map(code => byCode.get(code)).filter(c => c && finite(c.change20)).sort(riseDesc);
  if (!cs.length) return null;
  const c0 = cs[0];
  const rows = cs.map((c, k) => rowB(c, k, c.name, '#/stock/' + c.code, true));
  const art = barRows(rows, {refs: finite(g.change20) ? [{v: g.change20 * 100}] : []});
  const labels = check(lab(
    li(1, tag('1위'), h('b', null, co(c0.name)), chgEl(c0.change20), ' · ', tag('업종 평균'), chgEl(g.change20)),
    li(2, tag('반대 근거'), upLineText),
    li(3, tag('확인할 것'), '판 읽기 파일을 읽지 못해 판 값(종목마다 자기 마지막 21개 종가)으로 그림')), {lead: c0.code, v0: +c0.change20.toFixed(6), avg: finite(g.change20) ? +g.change20.toFixed(6) : null, n: cs.length});
  return fig('industry', g.label, g.label, `${cs.length}곳 · 지난 20거래일 · ${when(board.asOf)}`, artStage({key: 'ind-' + g.id, art: h('div', null, art, keyEl([{cls: '', label: '점선 = 업종 평균'}])), labels, steps: STEPS4}));
}

/* ═════════ 회사(#/stock/CODE) — 같은 업종 회사들 사이 이 회사(같은 축 · 판 읽기 20거래일 · 값 없는 곳은 까닭) ═════════ */
const LENS_WHY = {late: '지연(그날 종가 없음)', stale: '오래된 종가', ca: '기업행사 확인(가격 기준 바뀜)', missing: '값 없음'};
export function companyArt(board, s, lens = null) {
  if (!s || !board) return null;
  const L = lens && !lens.none ? lens : null;
  if (L) {
    const me = L.stocks.find(x => x.code === s.code) ?? null, sc = me?.g ? L.sectors.find(x => x.id === me.g) : null;
    if (me && sc) {
      const ms = sc.codes.map(c => L.stocks.find(x => x.code === c)).filter(Boolean);
      const valid = ms.filter(x => fin(x.r20)).sort((a, b) => b.r20 - a.r20 || a.code.localeCompare(b.code)), bad = ms.filter(x => !fin(x.r20));
      const peers = ms.length - 1, avg = sc.d20?.mean ?? null, I = L.market?.ref?.r20 ?? null;
      const rows = [...valid, ...bad].map(x => ({id: x.code, name: x.name, ident: true, href: x.code === s.code ? null : '#/stock/' + encodeURIComponent(x.code), v: x.r20, txt: fin(x.r20) ? fmtPct(x.r20) : '값 없음',
        sub: fin(x.r20) ? null : LENS_WHY[x.status] ?? '값 없음', ex: !fin(x.r20), mine: x.code === s.code, cls: x.code === s.code ? 'is-mine' : '', tag: x.code === s.code ? '이 회사' : null, at: 0}));
      const art = h('div', null, barRows(rows, {refs: [{v: avg}, {v: I, cls: 'idx'}]}), keyEl([{cls: '', label: `점선 = 업종 평균 ${fmtPct(avg)}`}, {cls: 'idx', label: `점 점선 = ${L.market?.ref?.name ?? '지수'} ${fmtPct(I)}`}]));
      const rank = fin(me.r20) ? valid.findIndex(x => x.code === s.code) + 1 : null;
      // 요약 한 줄을 차트 위에(회사 화면은 이름 · 값 아래라 첫 화면에 숫자가 먼저) · 기여 · 반대 · 다음 확인 줄은 차트 아래
      const labels = check(lab(li(null, tag('이 회사'), fin(me.r20) ? pp(me.r20) : h('b', null, LENS_WHY[me.status] ?? '값 없음'), ' · ', tag('업종 평균'), pp(avg), rank ? ` · 업종 ${valid.length}곳 중 ${rank}위` : '')), {code: s.code, v: fin(me.r20) ? me.r20 : null, avg: fin(avg) ? avg : null, peers, u: 'pct'});
      const tail = [
        li(1, tag('구성과 기여'), fin(me.r20) && valid.length ? `업종 평균에 더한 몫 ${fmtPp(me.r20 / valid.length)}(수익률 ÷ ${valid.length}곳)` : '값이 없어 업종 평균에서 뺌'),
        li(2, tag('반대 근거'), fin(me.r20) && fin(avg) ? [`업종 평균과 격차 `, h('b', null, fmtPp(me.r20 - avg)), fin(I) ? [` · ${L.market.ref.name} 대비 `, h('b', null, fmtPp(me.r20 - I))] : null] : '값이 없어 격차 계산 불가'),
        li(3, tag('확인할 것'), '업종 평균은 값이 있는 곳만 · 아래 실적 · 재무와 일정')];
      return fig('company', '업종 · 시장과 같은 기간 비교', '업종 · 시장과 같은 기간 비교', `${sc.label} ${ms.length}곳 · 최근 20거래일 · ${when(L.asOf)}`, artStage({key: 'co-' + s.code, art, labels, labFirst: true, tail: [h('div', {class: 'ra-tail'}, ...tail)], steps: STEPS4}), {cls: 'ak-mid'});
    }
  }
  // 판 읽기가 없는 날 — 판 값(종목마다 자기 마지막 21개 종가)
  const g = (board.groups ?? []).find(x => x.id === s.group?.id) ?? null;
  const byCode = new Map((board.companies ?? []).map(c => [c.code, c])), me = byCode.get(s.code) ?? s;
  const peers = (g?.codes ?? []).filter(c => c !== s.code).map(c => byCode.get(c)).filter(Boolean);
  const all = [me, ...peers].sort(riseDesc);
  const rows = all.map((c, k) => ({...rowB(c, k, c.name, c.code === s.code ? null : '#/stock/' + c.code, true), mine: c.code === s.code, cls: c.code === s.code ? 'is-mine' : '', tag: c.code === s.code ? '이 회사' : null}));
  const art = h('div', null, barRows(rows, {refs: finite(g?.change20) ? [{v: g.change20 * 100}] : []}), keyEl([{cls: '', label: '점선 = 업종 평균'}]));
  const labels = check(lab(
    li(1, tag('지난 20거래일'), chgEl(s.change20), ' · ', tag('업종 평균'), chgEl(g?.change20)),
    li(2, tag('반대 근거'), g ? `업종 ${all.length}곳 · 판 값은 종목마다 자기 마지막 21개 종가` : '업종 모름'),
    li(3, tag('확인할 것'), '판 읽기 파일을 읽지 못한 날 — 판 값으로 그림')), {code: s.code, v: finite(s.change20) ? +s.change20.toFixed(6) : null, avg: finite(g?.change20) ? +g.change20.toFixed(6) : null, peers: peers.length});
  return fig('company', '지난 20거래일', '지난 20거래일', s.cFrom ? `${korDate(s.cFrom)}부터 ${korDate(s.date)}까지` : when(s.date), artStage({key: 'co-' + s.code, art, labels, steps: STEPS4}), {cls: 'ak-mid'});
}

/* ═════════ 예비(#/similar) · 오름 상위(#/rise) ═════════ */
export function similarArt(board) {
  const sim = board?.similar, items = [...(sim?.items ?? [])].filter(x => finite(x.change20)).sort(riseDesc);
  if (!items.length) return null;
  const common = (sim.common ?? []).length, x0 = items[0];
  const rows = items.slice(0, 3).map((x, k) => rowB(x, k, x.name, '#/stock/' + x.code, true));
  const art = h('div', null, barRows(rows), items.length > 3 ? h('p', {class: 'bc-more'}, `예비 ${items.length}곳 가운데 위 3곳 · 모두는 아래 목록`) : null);
  const labels = check(lab(
    li(1, tag('1위'), h('b', null, co(x0.name)), chgEl(x0.change20), ` · 예비 ${items.length}곳`),
    li(2, tag('반대 근거'), `불장 회사들의 공통점 ${common}가지와 닮았을 뿐 — 이 회사의 업종은 불장 밖`),
    li(3, tag('확인할 것'), '회사를 누르면 「왜 예비인가」')), {lead: x0.code, v0: +x0.change20.toFixed(6), n: items.length, common});
  return fig('similar', '예비', '예비', when(board.asOf), artStage({key: 'similar', art, labels, steps: STEPS4}));
}
export function riseArt(board) {
  const items = (board?.next?.items ?? []).filter(x => finite(x.change20));
  if (!items.length) return null;
  const x0 = items[0], xl = items.at(-1), n = items.length;
  const rows = headTail(items, 2, 1).map(([x, k]) => rowB(x, k, x.name, '#/stock/' + x.code, true));
  const art = h('div', null, barRows(rows), n > 3 ? h('p', {class: 'bc-more'}, `오름 상위 ${n}곳 가운데 위 2곳과 ${n}위 · 모두는 아래 목록`) : null);
  const labels = check(lab(
    li(1, tag('1위'), h('b', null, co(x0.name)), chgEl(x0.change20)),
    li(2, tag(`${n}위(마지막 자리)`), h('b', null, co(xl.name)), chgEl(xl.change20)),
    li(3, tag('확인할 것'), `오름 상위 ${n}곳 — 불장 밖 업종에서 지난 20거래일 변화가 큰 차례`)), {lead: x0.code, v0: +x0.change20.toFixed(6), last: xl.code, vl: +xl.change20.toFixed(6), n});
  return fig('rise', '오름 상위', '오름 상위', `지난 20거래일 · ${when(board.asOf)}`, artStage({key: 'rise', art, labels, steps: STEPS4}));
}

/* ═════════ 출목표(#/road) — 지난 20거래일 변화 분포(오른 곳 · 내린 곳) ═════════ */
export function roadArt(board) {
  const cs = (board?.companies ?? []).filter(c => finite(c.change20)).sort(riseDesc);
  if (!cs.length) return null;
  const up = cs.filter(c => c.change20 > 0).length, down = cs.filter(c => c.change20 < 0).length, N = board.companies.length, c0 = cs[0];
  const hg = histoEl(cs.map(c => c.change20 * 100), {at: 0});
  const labels = check(lab(
    li(1, tag('오름'), h('b', {class: 'up'}, `${up}곳`), ' · ', tag('내림'), h('b', {class: 'down'}, `${down}곳`), ` · 모두 ${N}곳`),
    li(2, tag('1위'), h('b', null, co(c0.name)), chgEl(c0.change20), ' · ', h('span', null, '지난 20거래일 많이 오른 순')), // 「많이」 곁에 기간 숫자(또렷함 2번 — 옛 「가장 많이 오른 한 곳」은 숫자가 없어 흐릿)
    li(3, tag('확인할 것'), '칸을 누르면 그 회사 출목표')), {up, down, N, lead: c0.code, v0: +c0.change20.toFixed(6)});
  return fig('road', '출목표', '출목표', `${N}곳 · 지난 20거래일 · ${when(board.asOf)}`, artStage({key: 'road', art: h('div', null, hg.el, keyEl([{cls: 'up', label: '빨강 = 오른 구간'}, {cls: 'down', label: '파랑 = 내린 구간'}])), labels, steps: STEPS4}));
}

/* ═════════ 일정(#/agenda) — 날짜 축(오늘부터 60일 · 점 = 일정 · 테 = 가장 중요한 일정) ═════════ */
export function agendaArt(cm, events = []) {
  const top = cm?.ev, dd = cm?.dd;
  if (!top || !Number.isFinite(dd) || dd < 0 || !cm.day) return null;
  const days = Math.max(30, Math.min(120, Math.ceil((dd + 5) / 30) * 30));
  const evs = events.filter(e => e?.date && e.date >= cm.day && (Date.parse(e.date) - Date.parse(cm.day)) / 864e5 <= days && !(e.date === top.date && e.name === top.name)).map(e => ({date: e.date, level: e.level}));
  const ax = dateAxisEl(cm.day, [...evs, {date: top.date, level: top.level, top: true}], {days, at: 0, atTop: 1}); // 차례 0 = 모든 일정 점 · 차례 1 = 가장 중요한 일정(테)
  const nameEl = h('span', {'data-ident': top.scope === 'market' ? null : '', lang: top.scope === 'market' ? null : 'ko'}, top.name);
  const labels = check(lab(
    li(null, tag('가장 중요한 일정'), h('b', null, korDate(top.date)), ' ', nameEl, ` · 별 ${top.level}개`),
    li(2, tag('남은 날'), h('b', null, dd ? `${dd}일 뒤` : '그날'), ` · 앞으로 ${days}일 안 일정 ${evs.length + 1}건`),
    li(3, tag('확인할 것'), '일정마다 공식 출처 · 지난 일정은 그날 관측만(원인 아님)')), {date: top.date, day: cm.day, dd, level: top.level});
  return fig('agenda', '일정', '일정', `${korDate(cm.day)} 기준`, artStage({key: 'agenda', art: h('div', null, ax, keyEl([{cls: 'ix', label: '테 = 가장 중요한 일정'}])), labels, steps: STEPS4}));
}
/** 일정이 없는 판 — 빈 날짜 축 · 일정 0건(지어내지 않음) */
export function agendaEmptyArt(agenda, nCo) {
  if (!agenda) return null;
  const nm = (agenda.market ?? []).length, day = agenda.builtDay ?? null;
  const ax = day ? dateAxisEl(day, [], {days: 60, at: null, atTop: null}) : h('div', {class: 'da'});
  const labels = check(lab(
    li(1, tag('일정'), h('b', null, `시장 전체 일정 ${nm}건`), ` · 회사·업종 일정 ${nCo}건`),
    li(2, tag('반대 근거'), '확인된 일정만 모았습니다(일정마다 공식 출처)'),
    li(3, tag('확인할 것'), '새 일정은 판을 만들 때마다 다시 모음')), {market: nm, company: nCo});
  return fig('agenda', '일정', '일정', day ? `${korDate(day)} 기준` : null, artStage({key: 'agenda-none', art: h('div', {'data-at': '0'}, ax), labels, steps: STEPS4}));
}

/* ═════════ 찾기(옛 #/find) — 판마다 회사 수 ═════════ */
export function findArt(boards, hereId, w = null) {
  if (!boards?.length) return null;
  const N = boards.reduce((t, b) => t + b.n, 0);
  const rows = boards.map(b => ({id: b.id, name: b.label, v: b.n, txt: `${b.n}곳`, tag: b.id === hereId ? '지금 판' : null, at: 0}));
  const labels = check(lab(li(1, tag('모두'), h('b', null, `${N}곳`)), li(2, tag('지금 판'), boards.find(b => b.id === hereId)?.label ?? ''), li(3, tag('확인할 것'), '이름 · 기호 · 초성으로 찾기')), {N, boards: boards.map(b => [b.id, b.n])});
  return fig('find', '찾기', '찾기', w, artStage({key: 'find', art: barRows(rows, {ax: axisOf(boards.map(b => b.n))}), labels, steps: STEPS4}), {cls: 'ak-find'});
}

/* ═════════ 운영 기록(#/log) — 날마다 기록 수(시간순 기둥 · 업데이트 · 자료 변경 · 이슈) ═════════ */
export function logArt(entries) {
  if (!entries?.length) return null;
  const by = new Map();
  for (const e of entries) { const d = String(e.live ?? '').slice(0, 10); if (!d) continue; const x = by.get(d) ?? {d, n: 0, issue: 0, update: 0, data: 0}; x.n++; if (x[e.kind] != null) x[e.kind]++; by.set(d, x); }
  const days = [...by.values()].sort((a, b) => a.d.localeCompare(b.d)), last = days.at(-1), shown = days.slice(-10);
  const k = {issue: entries.filter(e => e.kind === 'issue').length, update: entries.filter(e => e.kind === 'update').length, data: entries.filter(e => e.kind === 'data').length};
  const cols = columnsEl(shown.map((d, i) => ({key: d.d, label: i === 0 || i === shown.length - 1 ? `${Number(d.d.slice(5, 7))}월 ${Number(d.d.slice(8, 10))}일` : '', parts: [{v: d.update, cls: 'update'}, {v: d.data, cls: 'data'}, {v: d.issue, cls: 'issue'}]})));
  const labels = check(lab(
    li(1, tag('모두'), h('b', null, `${entries.length}개`), ` · ${days.length}일`),
    li(2, tag('가장 새 날'), h('b', null, korDate(last.d)), ` · ${last.n}개`),
    li(3, tag('나눔'), `업데이트 ${k.update}개 · 자료 변경 ${k.data}개 · 이슈 ${k.issue}개`)), {n: entries.length, days: days.length, last: last.d, lastN: last.n, ...k});
  const key = keyEl([{cls: 'acc', label: '보라 = 업데이트'}, {cls: 'subc', label: '회색 = 자료 변경'}, {cls: 'inkc', label: '먹빛 = 이슈'}]); // 보기 칸 = 기둥 칸 색 그대로(2026-10-10 다섯 팀 검토 — 옛 보기는 빨강 · 파랑 칸이라 「오름 · 내림」과 섞임)
  return fig('log', '기록', '기록', `최근 ${shown.length}일 · 날마다 기록 수`, artStage({key: 'log', art: h('div', {'data-at': '0'}, cols, key), labels, steps: STEPS4}), {cls: 'ak-short'});
}

/* ═════════ 처음(#/start) — 다섯 곳 · 보통 회사의 가장 깊게 떨어진 때(같은 축) · 3년이 모자란 판은 쌓인 날 ═════════ */
export function startArt(board, cm) {
  const s = board?.start; if (!s || !cm) return null;
  if (!s.ready) {
    const need = s.rule?.days ?? 756, have = s.have?.days ?? 0;
    const ax = {lo: 0, hi: need};
    const art = h('div', {class: 'bc', 'data-at': '0'}, h('div', {class: 'bc-row'}, h('p', {class: 'bc-top'}, h('span', {class: 'bc-name'}, '쌓인 거래일'), h('b', {class: 'bc-val flat'}, `${have}/${need}거래일`)), trackEl(ax, have)));
    const labels = check(lab(li(1, tag(plain(cm.head)), h('b', null, cm.big?.t ?? '')), li(2, tag('지금'), `${have}거래일`), li(3, tag('확인할 것'), `${need}거래일이 쌓이면 엶`)), {have, need});
    return fig('start', '처음', '처음', when(board.asOf), artStage({key: 'start-wait', art, labels, steps: STEPS4}));
  }
  const picks = (s.picks ?? []).filter(x => finite(x.mdd)), typ = s.typical?.mdd;
  if (!picks.length || !finite(typ)) return null;
  const worst = Math.min(...picks.map(x => x.mdd));
  const rows = picks.map((x, k) => ({id: x.code, name: x.name ?? x.code, ident: true, href: x.code ? '#/stock/' + x.code : null, v: x.mdd * 100, txt: pct(x.mdd, 0), rank: `${k + 1}위`, at: 0}));
  const art = h('div', null, barRows(rows, {refs: [{v: typ * 100}]}), keyEl([{cls: '', label: `점선 = 보통 회사(${s.measured}곳 가운데 값) ${pct(typ, 0)}`}]));
  const labels = check(lab(
    li(1, tag(`${picks.length}곳 · 가장 깊게 떨어진 때`), h('b', {class: 'down'}, pct(worst, 0))),
    li(2, tag(`보통 회사(${s.measured}곳 가운데 값)`), h('b', {class: 'down'}, pct(typ, 0))),
    li(3, tag('확인할 것'), plain(cm.head))), {worst: +worst.toFixed(6), typ: +typ.toFixed(6), n: picks.length});
  return fig('start', '처음', '처음', `${korDate(board.asOf)} 종가까지 지난 3년 기록`, artStage({key: 'start', art, labels, steps: STEPS4}));
}

/* ═════════ 안내(#/guide) — 하루 시간 띠(06:00 ~ 22:00 · 한국 시각) ═════════ */
export function guideArt(bars, hm) {
  const reg = bars?.find(b => b[3] === 'reg'), nxt = bars?.find(b => b[3] === 'nxt');
  if (!reg || !nxt) return null;
  const ax = {lo: 6, hi: 22}, seg = (a, b, cls) => { const el = h('span', {class: `bc-bar ${cls}`}); el.style.setProperty('--l', `${posOf(ax, a).toFixed(2)}%`); el.style.setProperty('--w', `${(posOf(ax, b) - posOf(ax, a)).toFixed(2)}%`); return el; };
  const row = (name, ident, a, b, cls) => h('div', {class: 'bc-row'}, h('p', {class: 'bc-top'}, h('span', {class: 'bc-name', 'data-ident': ident ? '' : null}, name), h('b', {class: 'bc-val flat'}, `${hm(a)}~${hm(b)}`)), h('span', {class: 'bc-track', 'aria-hidden': 'true'}, seg(a, b, cls)));
  const art = h('div', {class: 'bc', 'data-at': '0'}, row('정규장', false, reg[1], reg[2], 'up'), row(nxt[0], true, nxt[1], nxt[2], 'flat'));
  const labels = check(lab(li(1, tag('정규장'), h('b', null, `${hm(reg[1])}~${hm(reg[2])}`)), li(2, h('span', {class: 'ra-k ra-tag', 'data-ident': ''}, nxt[0]), h('b', null, `${hm(nxt[1])}~${hm(nxt[2])}`)), li(3, tag('종가'), h('b', null, hm(reg[2])))), {reg: [reg[1], reg[2]], nxt: [nxt[1], nxt[2]]});
  return fig('guide', '시간(한국 시각)', '시간(한국 시각)', '06:00~22:00', artStage({key: 'guide', art, labels, steps: STEPS4}));
}

/* ═════════ 긴 눈(#/long) — 500만 원 · 10 · 20 · 30년 뒤(가장 나빴던 때) · 주식 · 서울 아파트(같은 축 · 점선 = 처음 500만 원) ═════════ */
export function longArt(LONG, man, START) {
  const stock = LONG?.[0]?.[2]?.[0]?.[1], home = LONG?.[1]?.[2]?.[0]?.[1];
  if (!stock || !home) return null;
  const rows = [10, 20, 30].map(y => ({y, a: stock[y]?.[0], b: home[y]?.[0]})).filter(r => finite(r.a) && finite(r.b));
  if (rows.length !== 3) return null;
  const ax = {lo: 0, hi: Math.max(...rows.flatMap(r => [r.a, r.b])) * 1.04};
  // 해마다 한 줄 · 막대 둘(위 = 주식 · 아래 = 서울 아파트) · 점선 = 처음 500만 원
  const yr = r => h('div', {class: 'bc-row'}, h('p', {class: 'bc-top'}, h('span', {class: 'bc-name'}, `${r.y}년 뒤`), h('b', {class: 'bc-val flat'}, `${man(r.a)} · ${man(r.b)}`)), trackEl(ax, r.a, [{v: START}]), trackEl(ax, r.b, [{v: START}], 'bc-alt'));
  const art = h('div', null, h('div', {class: 'bc', 'data-at': '0'}, ...rows.map(yr)), keyEl([{cls: 'up', label: '위 막대 = 주식'}, {cls: 'ex', label: '아래 막대 = 서울 아파트'}, {cls: '', label: `점선 = 처음 ${man(START)}`}]));
  const labels = check(lab(...rows.map((r, i) => li(i + 1, tag(`${r.y}년 뒤`), `주식 ${man(r.a)} · 서울 아파트 ${man(r.b)}`))), {rows: rows.map(r => [r.y, r.a, r.b]), start: START});
  return fig('long', '500만 원을 오래 들고 있었다면', '500만 원을 오래 들고 있었다면', '가장 나빴던 때 · 주식 = 코스피 · 배당 넣음(가정)', artStage({key: 'long', art, labels, steps: STEPS4}));
}

/* ═════════ 한국 순위(#/korea) — 25개 시장 가운데 자리(순위 눈금) ═════════ */
export function koreaArt(RANKS) {
  const r = RANKS?.[0]; if (!r) return null;
  const [what, v, rank, n, how] = r;
  const ax = {lo: 0.5, hi: n + 0.5}, dots = h('span', {class: 'bc-track', 'aria-hidden': 'true'});
  for (let k = 1; k <= n; k++) { const d = h('span', {class: 'bc-ref' + (k === rank ? '' : ' idx')}); d.style.setProperty('--l', `${posOf(ax, k).toFixed(2)}%`); dots.append(d); }
  const me = h('span', {class: 'bc-bar up'}); me.style.setProperty('--l', `${(posOf(ax, rank) - 1.6).toFixed(2)}%`); me.style.setProperty('--w', '3.2%'); dots.append(me);
  const art = h('div', {class: 'bc', 'data-at': '0'}, h('div', {class: 'bc-row'}, h('p', {class: 'bc-top'}, h('span', {class: 'bc-name'}, '1위 ← 순위 → 마지막'), h('b', {class: 'bc-val flat'}, `${n}곳`)), dots));
  const labels = check(lab(li(1, tag(what), h('b', null, v)), li(2, tag('자리'), h('b', null, `${n}곳 중 ${rank}위`)), li(3, tag('확인할 것'), how ?? '')), {rank, n, v});
  return fig('korea', '한국 주식시장은 몇 위인가', '한국 주식시장은 몇 위인가', null, artStage({key: 'korea', art, labels, steps: STEPS4}));
}

/* ═════════ 판 읽기(lens.json) 그림 — 시장 · 투자자 매매 · 종목 · 검증 · 관심종목 ═════════ */
/** 시장(#/) — 선정 표본 최근 20거래일 수익률 분포 · 지수 · 중앙값 · 평균(지시서 5 ④ 핵심 차트 + 반대 근거) · obs = observe.js marketObservation */
export function marketArt(lens, obs) {
  const S = lens?.market?.sample?.d20, R = lens?.market?.ref ?? {};
  if (!S?.n || !obs) return null;
  const vals = (lens.stocks ?? []).map(s => s.r20).filter(fin);
  const hg = histoEl(vals, {marks: [{v: R.r20, cls: 'ix'}, {v: S.median, cls: 'med'}, {v: S.mean, cls: 'avg'}], at: 0});
  const key = keyEl([{cls: 'ix', label: `굵은 선 = ${R.name ?? '지수'} ${fmtPct(R.r20)}`}, {cls: 'med', label: `파선 = 중앙값 ${fmtPct(S.median)}`}, {cls: 'avg', label: `점선 = 평균 ${fmtPct(S.mean)}`}]);
  const t = obs.top;
  const labels = check(lab(
    li(1, tag('구성과 기여'), t ? [`기여 1위 업종 ${t.label} `, h('b', null, fmtPp(t.contrib)), ` · 빼면 평균 ${fmtPct(obs.M)} → ${fmtPct(obs.exTop)}`] : '계산 불가'),
    li(2, tag('반대 근거'), obs.counter?.text ?? '반대 근거 없음'),
    li(3, tag('확인할 것'), h('a', {href: '#/sectors'}, '변화의 근거 보기 ›'))),
  (() => { const z = summarize(vals); return {idx: fin(R.r20) ? R.r20 : null, n: z.n, up: z.up, down: z.down, flat: z.flat, median: z.median, mean: z.mean, kind: obs.kind, top: t?.id ?? null}; })()); // 그림이 그린 값(종목 20거래일 값 그대로 · 판 읽기 요약은 소수 넷째 자리로 줄인 값)
  return artSection({key: 'market', label: '선정 표본 분포', kicker: '선정 표본 분포', when: `ATLAS 선정 ${S.n}곳 · 최근 20거래일 · ${when(lens.asOf)}`, stage: artStage({key: 'market', art: h('div', null, hg.el, key), labels, steps: STEPS4}), first: 4});
}
/** 투자자 매매(#/flow) — 외국인 · 기관 · 개인 5거래일 순매수 추정액(같은 축 · 공식 금액 아님) */
export function flowWhoArt(lens) {
  const m = lens?.flows?.available ? lens.flows.market : null; if (!m) return null;
  const f = m.foreign?.d5?.est ?? null, i = m.institution?.d5?.est ?? null, p = m.individual?.d5?.est ?? null;
  if (!finite(f) && !finite(i)) return null;
  const won = v => { if (!finite(v)) return '계산 불가'; const s = v > 0 ? '+' : v < 0 ? '−' : '', a = Math.abs(v); return a >= 1e12 ? `${s}${(a / 1e12).toFixed(2)}조 원` : `${s}${Math.round(a / 1e8).toLocaleString('ko-KR')}억 원`; };
  const rows = [['외국인', f], ['기관', i], ['개인', p]].filter(x => finite(x[1])).map(([name, v]) => ({id: name, name, v: v / 1e8, txt: won(v), at: 0}));
  const labels = check(lab(li(1, tag('외국인'), h('b', {class: f > 0 ? 'up' : f < 0 ? 'down' : ''}, won(f))), li(2, tag('기관'), h('b', {class: i > 0 ? 'up' : i < 0 ? 'down' : ''}, won(i))),
    li(3, tag('추정'), '날마다 순매수 주식 수 × 그날 종가의 합 — 공식 금액 아님')), {f5: finite(f) ? Math.round(f / 1e8) : null, i5: finite(i) ? Math.round(i / 1e8) : null});
  return fig('flowwho', '투자자 매매', '투자자 매매', `5거래일 · ${when(lens.asOf)}`, artStage({key: 'flowwho', art: barRows(rows), labels, steps: STEPS4}));
}
/** 종목(#/stocks) — 새로 발견 · 근거 강화 · 근거 약화 곳 수(실험 규칙) */
export function stocksArt(lens) {
  const b = lens?.buckets; if (!b || lens?.changes == null) return null;
  const rows = [['new', '새로 발견', b.new], ['up', '근거 강화', b.up], ['down', '근거 약화', b.down]].map(([id, name, v]) => ({id, name, v, txt: `${v}곳`, at: 0}));
  const labels = check(lab(li(1, tag('근거 강화'), h('b', null, `${b.up}곳`)), li(2, tag('근거 약화'), h('b', null, `${b.down}곳`)), li(3, tag('새로 발견'), h('b', null, `${b.new}곳`), ' · 실험 규칙(검증 전)')), {up: b.up, down: b.down, new: b.new});
  return fig('stocks', '종목', '종목', `${korDate(lens.changes.from)} 기록과 견줌 · ${when(lens.asOf)}`, artStage({key: 'stocks', art: barRows(rows, {ax: axisOf(rows.map(r => r.v))}), labels, steps: STEPS4}));
}
/** 검증(#/check) — 고정 기록마다 평가 끝 · 평가 대기(시간순 기둥) */
export function checkArt(lens) {
  const v = lens?.verify, recs = v?.records ?? []; if (!recs.length) return null;
  const evals = recs.flatMap(r => Object.values(r.evals).flat()), pending = evals.filter(e => e.status === 'pending').length, done = evals.filter(e => e.status === 'done').length;
  const cols = columnsEl(recs.map((r, k) => { const ev = Object.values(r.evals).flat(); return {key: r.asOf, label: k === 0 || k === recs.length - 1 ? `${Number(r.asOf.slice(5, 7))}월 ${Number(r.asOf.slice(8, 10))}일` : '', parts: [{v: ev.filter(e => e.status === 'done').length, cls: 'done'}, {v: ev.filter(e => e.status === 'pending').length, cls: 'wait'}]}; }));
  const labels = check(lab(li(1, tag('고정 기록'), h('b', null, `${recs.length}장`)), li(2, tag('평가 끝'), h('b', null, `${done}건`), ' · ', tag('평가 대기'), h('b', null, `${pending}건`)), li(3, tag('확인할 것'), '지난 기록을 센 것 — 투자 성과 입증 아님')), {records: recs.length, pending, done});
  return fig('check', '검증', '검증', `${korDate(recs[0].asOf)}~${korDate(recs.at(-1).asOf)} 기록`, artStage({key: 'check', art: h('div', {'data-at': '0'}, cols, keyEl([{cls: 'acc', label: '보라 = 평가 끝'}, {cls: 'ex', label: '흐린 칸 = 평가 대기'}])), labels, steps: STEPS4}));
}
/** 관심종목(#/watch) — 이 기기에 등록한 곳 수(0곳이면 빈 축) */
export function watchArt(n) {
  if (!(n > 0)) return quietArt({key: 'watch', label: '관심종목', word: '0곳'});
  const rows = [{id: 'n', name: '이 기기에 저장한 곳', v: n, txt: `${n}곳`, at: 0}];
  const labels = check(lab(li(1, tag('관심종목'), h('b', null, `${n}곳`)), li(2, tag('저장'), '이 기기에만'), li(3, tag('확인할 것'), '등록 이유 · 반대 근거 · 확인할 조건')), {n});
  return fig('watch', '관심종목', '관심종목', null, artStage({key: 'watch', art: barRows(rows, {ax: {lo: 0, hi: Math.max(10, n)}}), labels, steps: STEPS4}));
}

/* ═════════ 빈 축 — 그 화면 그림이 그릴 값이 없는 날(지어내지 않음 · 「없음」 · 「0곳」) ═════════ */
export function quietArt({key, label, tagText = null, word = '없음', when: w = null}) {
  const t = tagText ?? label;
  const art = h('div', {class: 'bc', 'data-at': '0'}, h('div', {class: 'bc-row'}, h('p', {class: 'bc-top'}, h('span', {class: 'bc-name'}, label), h('b', {class: 'bc-val na'}, word)), trackEl({lo: -1, hi: 1}, null)));
  const labels = check(lab(li(1, h('span', {class: 'ra-k ra-tag'}, t), h('b', null, word)), li(2, tag('반대 근거'), '숫자를 지어내지 않음'), li(3, tag('확인할 것'), '값이 생기면 그림')), {quiet: key});
  return artSection({key, label, kicker: label, when: w, stage: artStage({key: 'quiet-' + key, art, labels, steps: STEPS4})});
}
