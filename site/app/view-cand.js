/* ATLAS 11 · 아래 탭 「후보 7」 — 매수 검토 후보(최대 7곳) 첫 화면(#/) · 다른 후보와 비교(#/compare/A/B) · 종목 화면 「후보 판단」 칸
   사장님 2026-10-09 03:09(마카오 시각) 첨부 「ATLAS 제품 재설계 명령 — 목적: 지금 매수할 가치가 있는 후보 7개를 찾는다」
   · 03:53 「아틀란스 365개에서 돈에 흐름이 강한 업종내에서 종목을 찾아내야 해」 · 03:59 「알아서 해 단 잡스라면 어떻게 했나가 기준이고 애플의 방식이 중심이야」
   · 셈은 판 읽기(lens.json · lib/atlas11/cand.mjs 규칙 cand-rules-2 「돈이 들어온 업종 안에서」 · 연구용 · 성능 검증 전) 한 곳 — 목록 · 이유 · 그림 · 기록이 같은 판(같은 발행본)
   · 잡스라면(한 문장): 「돈이 들어온 업종에서, 돈이 실제로 들어온 회사를 고른다」 — 첫 화면은 ① 시점 → ② 돈이 들어온 업종 → 후보 7곳(이름 · 지금 값 · 고른 까닭 한 줄 · 상태 · 가장 큰 위험)
   · 「매수 검토 우선순위」 — 예상 수익률 순위 아님 · 7곳은 상한(모자라면 모자란 대로 · 없으면 없다고) · 포트폴리오 아님
   · 단추 이름 = 누르면 보는 것(8): 왜 선정됐나요? · 다른 후보와 비교 · 진입 조건 확인 · 판단이 바뀌는 조건 · 선정 이후 결과
   · 움직임(10): 처음에는 최신 결과가 멈춘 채 · 후보를 누르면 그 이름이 종목 화면 「후보 판단」 머리로 옮겨 가며 이어짐(움직임 줄이기면 바로) · 비교는 같은 축에서 막대만 옮겨 감 */
import {h, korDate, won, finite, place, stamp} from './util.js';
import {state, loadBoard, loadLens, prefs} from './store.js';
import {foot} from './parts.js';
import {blk} from './view-market.js';
import {quietArt} from './scenes.js';
import {artStage, artSection} from './art.js';
import {barRows, axisOf, posOf} from './charts.js';
import {candLand} from './land3d.js'; // 「후보 7」 입체 땅(2026-10-09 08:26 「입체적으로 보여야하는 중심으로」)
import {pv, ppv, lensMissing, idxName} from './lensparts.js';
import {fmtPct} from './calc.js';

export const ST = {met: '조건 충족', wait: '조건 대기', recheck: '재검토'};
const MARK = {met: '✓', wait: '…', recheck: '!'};
export const stEl = st => h('span', {class: `cd-st cd-st-${st}`}, h('span', {class: 'cd-st-m', 'aria-hidden': 'true'}, MARK[st] ?? ''), ST[st] ?? '후보 아님');
export const stockHref = code => '#/stock/' + encodeURIComponent(code).replace(/%2E/gi, '.');
const md = d => (d ? `${Number(d.slice(5, 7))}월 ${Number(d.slice(8, 10))}일` : '날짜 없음');
const plusDays = (d, n) => { const t = Date.parse(d + 'T00:00:00Z'); return Number.isFinite(t) ? new Date(t + n * 864e5).toISOString().slice(0, 10) : null; };
/** 억 원 금액 — 「+2,947억」 · 「+25.0조」(부호 앞 · 빨강 · 파랑) */
export const eokTxt = v => { if (!finite(v)) return '계산 불가'; const s = v > 0 ? '+' : v < 0 ? '−' : '', a = Math.abs(v); return a >= 1e4 ? `${s}${(a / 1e4).toFixed(1)}조` : `${s}${Math.round(a).toLocaleString('ko-KR')}억`; };
const eokEl = v => h('b', {class: `lv-n ${finite(v) ? (v > 0 ? 'up' : v < 0 ? 'down' : 'flat') : 'na'}`}, eokTxt(v));
const eokWon = v => (finite(v) ? `${v < 0 ? '−' : ''}${Math.abs(v) >= 1e4 ? `${(Math.abs(v) / 1e4).toFixed(1)}조 원` : `${Math.round(Math.abs(v)).toLocaleString('ko-KR')}억 원`}` : '자료 없음');
const powTxt = v => (finite(v) ? `${v.toFixed(2)}%` : '계산 불가');
/** 1만 번 다시 뽑기(몬테카를로 · 규칙 cand-rules-3 · 2026-10-09 10:14) — 「6,944번」 · 「1만 번」 */
const timesTxt = v => (finite(v) ? `${Math.round(v).toLocaleString('ko-KR')}번` : '계산 불가');
const drawsTxt = v => (finite(v) && v > 0 && v % 10000 === 0 ? `${v / 10000}만 번` : timesTxt(v));
const fyTxt = fy => { const m = String(fy ?? '').match(/^(\d{4})\.(\d{1,2})$/); return m ? `${m[1]}년 ${Number(m[2])}월 결산` : '결산'; };
const title = t => h('span', {class: 'cd-src', 'data-ident': '', lang: 'ko'}, `「${t}」`); // 공시 제목은 원문 그대로
/** 사업 변화가 이익으로 이어지는 길(공시 종류마다 — 고르는 데는 쓰지 않음 · 크기 · 기간은 원문 확인) */
const PATH = {contract: '수주 = 앞으로 매출로 잡힐 수 있는 일감(계약 금액 · 기간 · 상대 회사는 원문 확인)', capex: '시설투자 = 생산 능력을 늘리는 돈 — 이익은 설비가 돈 뒤(그 사이 비용이 먼저)', return: '주식 소각 · 자기주식 취득 = 주식 수를 줄여 한 주의 몫을 키움(취득만 하고 소각하지 않으면 다를 수 있음)'};
/** 지금 판 후보 묶음(판 읽기) — 못 읽으면 null */
export const candOfLens = lens => (lens && !lens.none ? lens.cand ?? null : null);
/** 가장 가까운 다른 후보(비교 짝) — 바로 아래 순위 · 마지막이면 바로 위 */
const pairOf = (C, code) => { const xs = C?.items ?? [], i = xs.findIndex(x => x.code === code); return i < 0 ? xs[0]?.code ?? null : (xs[i + 1] ?? xs[i - 1])?.code ?? null; };
/** 고른 까닭 한 문장 — 어느 업종(돈 흐름 차례) · 이 회사에 들어온 외국인+기관 돈 · 회사 크기에 견준 세기 */
export const reasonEl = (x, C) => [...(x.mc ? [`${drawsTxt(x.mc.of)} 다시 뽑아 `, h('b', {class: 'cd-mcn'}, timesTxt(x.mc.n)), ' 7곳에 듦 · '] : []),
  `돈이 들어온 업종 ${x.flow.sector.rank}위 ${x.flow.sector.label} · 외국인+기관 ${C.flowDays ?? 10}거래일 `, eokEl(x.flow.fi), ` = 시가총액의 ${powTxt(x.flow.power)}`];

/* ── ① 기준(한 줄 + 작은 약속 한 줄) ── */
function baseLines(C) {
  const rec = (C.records ?? []).find(r => r.asOf === C.asOf) ?? null;
  return [h('p', {class: 'ob-base'}, h('b', null, `${place.label} · ${korDate(C.asOf)} 종가`), ` · 돈 흐름 ${C.flowDays ?? 10}거래일`),
  h('p', {class: 'cd-rule'}, h('b', null, '매수 검토 우선순위'), ' — 예상 수익률 순위 아님 · ', h('b', null, '연구용 · 성능 검증 전'), ' · 포트폴리오 아님',
    rec ? ` · 고정 기록 ${md(new Date(Date.parse(rec.recordedAt) + 9 * 3600e3).toISOString().slice(0, 10))}` : ' · 고정 기록 전')];
}

/* ── ② 고른 한 곳 카드(그림의 이름 · 숫자 — 설명은 한 번에 한 가지) ── */
function cardOf(C) {
  const rk = h('span', {class: 'cd-rk'}), name = h('span', {class: 'cd-name', 'data-ident': ''}), sec = h('small', {class: 'cd-sec'}), stw = h('span', {class: 'cd-stw'}), px = h('p', {class: 'cd-px'});
  const why = h('p', {class: 'ra-li cd-why'}), risk = h('p', {class: 'ra-li cd-risk', 'data-at': '2'}), note = h('p', {class: 'cd-note'}), acts = h('p', {class: 'cd-acts', 'data-at': '3'});
  const el = h('div', {class: 'ra-lab cd-card', 'aria-live': 'polite'}, h('div', {class: 'cd-ch'}, rk, h('span', {class: 'cd-nm'}, name, sec), stw, px), why, risk, note, acts);
  const go = () => { state.candGo = 'why'; state.vt = {el: name, name: 'cd-name'}; }; // 이 이름이 종목 화면 「후보 판단」 머리로 이어짐(app.js 화면 넘김 움직임)
  function fill(x) {
    el.dataset.code = x.code;
    rk.textContent = `${x.rank}위`; name.textContent = x.name; sec.textContent = x.sector ?? '';
    stw.replaceChildren(stEl(x.status));
    px.replaceChildren(h('b', null, won(x.close)), ` · ${korDate(x.date)} 종가 · 20거래일 `, pv(x.r20));
    why.replaceChildren(h('span', {class: 'cd-k'}, '고른 까닭'), ' ', ...reasonEl(x, C));
    risk.replaceChildren(h('span', {class: 'cd-k'}, '가장 큰 위험'), ' ', x.risk.text);
    const many = x.status === 'wait' && String(x.waitWhy ?? '').includes(' · '); // 조건 대기 까닭이 하나면 「가장 큰 위험」 줄과 같은 말이라 한 번만(글 줄이기) · 둘 이상이면 모두 적음 · 재검토 까닭은 따로
    note.hidden = !(x.status === 'recheck' || many); note.className = x.status === 'recheck' ? 'cd-note cd-note-re' : 'cd-note';
    note.textContent = x.status === 'recheck' ? `재검토 까닭: ${x.recheckWhy}` : many ? `조건 대기 까닭: ${x.waitWhy}` : '';
    acts.replaceChildren(...[h('a', {class: 'cd-btn', href: stockHref(x.code), onclick: go}, '왜 선정됐나요?'),
      C.items.length > 1 ? h('a', {class: 'cd-btn', href: `#/compare/${x.code}/${pairOf(C, x.code)}`, onclick: () => { state.compareBack = '#/'; }}, '다른 후보와 비교') : null].filter(Boolean));
  }
  return {el, fill};
}
/** 짧은 줄 하나 — 순위 · 이름 · 1만 번 다시 뽑아 7곳에 든 횟수(그림은 위 탑 높이 — 줄에는 숫자만) · 상태 · 누르면 위 카드 */
function miniRow(x, draws, onPick) {
  const n = x.mc?.n;
  return h('li', {class: 'cd-row', 'data-code': x.code, 'data-rank': String(x.rank), 'data-status': x.status, 'data-n': finite(n) ? String(n) : ''},
    h('button', {type: 'button', class: 'cd-pick', 'aria-pressed': 'false', 'aria-label': `검토 순위 ${x.rank}위 ${x.name} · ${ST[x.status]} · ${drawsTxt(draws)} 다시 뽑아 ${timesTxt(n)} 7곳에 듦`, onclick: () => onPick(x.code)},
      h('span', {class: 'cd-rk'}, `${x.rank}위`),
      h('span', {class: 'cd-nm'}, h('span', {class: 'cd-name', 'data-ident': ''}, x.name), x.sector ? h('small', {class: 'cd-sec'}, x.sector) : null),
      h('span', {class: 'cd-pw'}, h('b', {class: 'cd-pwv'}, timesTxt(n))),
      h('span', {class: `cd-stm cd-stm-${x.status}`}, x.status === 'met' ? '✓' : ST[x.status])));
}

/* ── ② 그림: 입체 땅(돈이 빠진 땅 · 들어온 땅 · 후보 탑) + 고른 한 곳 + 짧은 줄 일곱 ── */
export function candArt(C, {sel = null} = {}) {
  if (!C?.ready || !C.pool) return null;
  const n = C.items.length, draws = C.mc?.draws ?? 10000;
  let cur = C.items.find(x => x.code === sel) ?? C.items[0] ?? null;
  const card = n ? cardOf(C) : null;
  const rows = n ? C.items.map(x => miniRow(x, draws, code => pick(code, false))) : [];
  const land = candLand(C, {fmt: eokTxt, sel: cur?.code ?? null, onPick: code => pick(code, true)});
  function pick(code, fromScene, user = true) {
    const x = C.items.find(y => y.code === code); if (!x || !card) return;
    cur = x; card.fill(x); land.setSel(code, user);
    if (user) state.candSel = code; // 사람이 고른 것만 기억(돌아오면 그 카드 · 그 탑)
    for (const r of rows) r.querySelector('.cd-pick')?.setAttribute('aria-pressed', String(r.dataset.code === code));
    if (fromScene) card.el.scrollIntoView?.({block: 'nearest', behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth'});
  }
  const p = C.pool;
  land.el.dataset.check = JSON.stringify({universe: p.universe, sectors: p.sectors, inSector: p.inSector, data: p.data, profit: p.profit, risk: p.risk, screen: p.screen, met: p.met, n, mc: C.mc?.draws ?? null,
    plates: land.check.plates, pits: land.check.pits, towers: land.check.towers});
  const labels = card ? card.el : h('div', {class: 'ra-lab'}, h('p', {class: 'ra-li', 'data-at': '2'}, h('span', {class: 'cd-k'}, '조건을 모두 넘은 곳 없음'), ` 돈이 들어온 업종 안 ${p.inSector}곳 · 기준을 낮추지 않음`),
    h('p', {class: 'ra-li', 'data-at': '3'}, h('a', {href: '#/flow/rotation'}, '돈 흐름 자세히 ›')));
  const list = n ? h('ol', {class: 'cd-list cd-mini', 'aria-label': `후보 ${n}곳 — 누르면 위 카드`}, ...rows) : null;
  const steps = [{c: 0, at: 0, ms: 1300}, {c: 1, at: 1, ms: 1400}, {c: 2, at: 2, ms: 1200}, {c: 3, at: 3, ms: 1000}];
  const fig = artSection({key: 'cand', label: '매수 검토 후보', kicker: `매수 검토 후보 ${n}곳`, when: '돈이 들어온 업종 안에서', title: n ? `${drawsTxt(draws)} 다시 뽑아도 남은 탑` : '조건을 모두 넘은 곳 없음',
    stage: artStage({key: 'cand', art: land.el, labels, labFirst: false, tail: list ? [list] : [], steps}), first: 2});
  if (cur) pick(cur.code, false, !!sel && sel === cur.code); // 처음 열면 1위 카드(고른 것 아님 — 탑은 모두 또렷) · 돌아오면 고른 그 카드
  return fig;
}

/* ── ③ 자세히(접힘) — 어떻게 골랐나(조건마다 남은 곳) ── */
function funnelEl(C) {
  const p = C.pool, n = C.items.length, m = (v, sub = null) => ({v, txt: `${v}곳`, sub}), draws = C.mc?.draws ?? 10000, out = C.mc?.out ?? [];
  const rows = [
    {id: 'u', name: '후보군(ATLAS 선정)', ...m(p.universe)},
    {id: 's', name: `① 돈이 들어온 업종 ${p.sectors}곳 안`, ...m(p.inSector, `업종 순환 1위~3위 가운데 외국인+기관 순매수 · 값도 오른 업종`)},
    {id: 'd', name: '② 그날 종가 있음', ...m(p.data, `${p.inSector - p.data}곳 뺌(빈칸을 숫자로 채우지 않음)`)},
    {id: 'f', name: '③ 흑자(영업이익 · 순이익)', ...m(p.profit, `${p.data - p.profit}곳 뺌`)},
    {id: 'r', name: '④ 위험 공시 없음', ...m(p.risk, `${p.profit - p.risk}곳 뺌`)},
    {id: 'w', name: `⑤ 외국인+기관 ${C.flowDays ?? 10}거래일 순매수`, ...m(p.screen, `${p.risk - p.screen}곳 뺌 · 진입 조건까지 ${p.met}곳`)},
    {id: 'n', name: `⑥ ${drawsTxt(draws)} 다시 뽑아 소거 · 같은 업종 ${C.perSector ?? 3}곳 · ${C.want ?? 7}곳까지`, ...m(n, n ? (out.length ? `뺀 곳 ${out.map(x => `${x.name}(${timesTxt(x.n)} · ${x.why})`).join(' · ')}` : '뺀 곳 없음') : '조건을 모두 넘은 곳 없음 — 기준을 낮추지 않음'), mine: true}];
  const M = C.mc;
  return [barRows(rows, {ax: {lo: 0, hi: Math.max(1, p.universe)}, cls: 'cd-funnel'}),
    M ? h('p', {class: 'mk-l cd-mcl'}, h('span', {class: 'cd-k'}, '업종이 3곳에 든 횟수'), ' ', (M.sectors ?? []).map(s => `${s.label} ${timesTxt(s.n)}${s.rank ? '' : '(3곳 밖)'}`).join(' · ')) : null,
    M?.outside?.length ? h('p', {class: 'mk-l cd-mcl'}, h('span', {class: 'cd-k'}, `기준 밖이라 넣지 않음(지난 ${C.flowDays ?? 10}거래일 그대로 세면)`), ' ', M.outside.map(x => `${x.name} ${timesTxt(x.n)}(${x.why})`).join(' · ')) : null,
    M?.seeds ? h('p', {class: 'mk-l cd-mcl'}, h('span', {class: 'cd-k'}, '흔들림 검사'), ` 씨앗을 바꿔 ${M.seeds.n}번 더 — 7곳 ${M.seeds.sameSet ? '같음' : '다름'} · 차례 ${M.seeds.sameOrder ? '같음' : `바뀐 곳 ${M.seeds.moved.map(x => x.name).join(' · ')}`}`) : null,
    M ? h('p', {class: 'muted xs'}, `${drawsTxt(draws)} = 지난 ${C.flowDays ?? 10}거래일 가운데 열 날을 다시 뽑아(같은 날 거듭 · 빠짐 있음) 같은 규칙으로 7곳을 골라 본 횟수 · 앞날 아님 · 열 날을 그대로 한 번씩 뽑으면 다시 뽑기 전과 같은 7곳${M.asIs?.same ? ' ✓' : ' — 다름(검사 필요)'}`) : null,
    h('p', {class: 'muted xs'}, '금액은 추정(공식 금액 아님) · 업종 금액은 시장 대비 시가총액 변화(실제 투자금 아님)')].filter(Boolean);
}

/* ── ④ 바뀐 후보 · 공통 위험 ── */
function changesEl(C) {
  const X = C.changes, kids = [];
  if (!X) kids.push(h('p', {class: 'mk-l'}, (C.records ?? []).some(r => r.asOf === C.asOf) ? '이 목록이 첫 고정 기록 — 견줄 앞 기록 없음' : '견줄 앞 기록 없음 · 이 목록이 기록되면 그 뒤 판부터 신규 · 유지 · 제외를 셈'));
  else {
    const names = xs => (xs.length ? xs : null);
    kids.push(h('p', {class: 'mk-l'}, h('b', null, `${md(X.from)} 기록 → ${md(X.to)}`), ` · 신규 ${X.added.length}곳 · 유지 ${X.kept.length}곳 · 제외 ${X.removed.length}곳`),
      h('ul', {class: 'cd-chg'},
        h('li', null, h('span', {class: 'cd-k'}, '신규'), ' ', names(X.added)?.map(x => `${x.name}(${x.why})`).join(' · ') ?? '없음'),
        h('li', null, h('span', {class: 'cd-k'}, '유지'), ' ', names(X.kept)?.map(x => `${x.name}(${x.rankFrom}위 → ${x.rankTo}위)`).join(' · ') ?? '없음'),
        h('li', null, h('span', {class: 'cd-k'}, '제외'), ' ', names(X.removed)?.map(x => `${x.name} — ${x.why} · ${x.status}`).join(' · ') ?? '없음')),
      h('p', {class: 'muted xs'}, '순위가 한두 칸 바뀐 것은 새 기회가 아님 · 제외 까닭 = 처음 깨진 조건(돈 흐름 이탈 · 자료 지연 · 위험 공시 · 적자) · 아니면 순위 밖'));
  }
  const common = (C.common ?? []).map(g => `${g.sector ?? '같은 업종'} ${g.n}곳(${C.items.filter(x => x.g === g.g).map(x => x.name).join(' · ')})`);
  kids.push(h('p', {class: 'mk-l'}, h('span', {class: 'cd-k'}, '공통 위험'), ' ', common.length ? `${common.join(' · ')} — 같은 업종은 같은 사건에 함께 흔들릴 수 있음 · 7곳 모두 돈 흐름 한 가지 잣대` : '같은 업종 후보 없음 · 7곳 모두 돈 흐름 한 가지 잣대'),
    h('p', {class: 'muted xs'}, `분산 규칙: 같은 업종은 ${C.perSector ?? 3}곳까지 — `, (C.held ?? []).length ? `밀린 곳 ${C.held.map(x => (finite(x.mc) ? `${x.name}(${timesTxt(x.mc)})` : x.name)).join(' · ')}` : '이번에 밀린 곳 없음'));
  if (C.nWaiting) kids.push(h('details', {class: 'b-how'}, h('summary', null, `조건은 넘었지만 ${C.want ?? 7}곳 밖 ${C.nWaiting}곳`),
    h('p', {class: 'muted xs'}, C.waiting.map(x => `${x.name}(${x.status})`).join(' · ') + (C.nWaiting > C.waiting.length ? ` 외 ${C.nWaiting - C.waiting.length}곳` : ''))));
  return kids;
}

/* ── ⑤ 선정 이후 결과 · 규칙 ── */
function resultEl(C, lens) {
  const v = lens?.verify, recs = (v?.records ?? []).filter(r => r.evals?.cand);
  const ev = recs.flatMap(r => r.evals.cand), done = ev.filter(e => e.status === 'done').length, wait = ev.filter(e => e.status === 'pending');
  return [h('p', {class: 'mk-l'}, recs.length ? [h('b', null, `후보 기록 ${recs.length}장`), ` · 평가 끝 ${done}건 · 평가 대기 ${wait.length}건`, wait[0] ? ` · 첫 평가일 ${md(wait.map(e => e.due).sort()[0])}` : ''] : '후보 고정 기록 없음 — 평가할 것이 아직 없음'),
    h('p', {class: 'mk-l'}, h('a', {href: '#/check'}, '선정 이후 결과 · 시장 · 단순 선정과 비교 ›')),
    h('p', {class: 'muted xs'}, '검증 전 — 기록 기능이 있다는 것과 투자 성능이 입증됐다는 것은 다름 · 후보 관측 성과 ≠ 실제 매매 성과(진입 · 청산 · 비중 · 비용 규칙 없음)')];
}
function rulesEl(C) {
  const W = C.flow?.window;
  return h('div', {class: 'cd-rules'},
    h('ul', {class: 'cd-l'},
      h('li', null, h('b', null, '한 문장'), ` · 돈이 들어온 업종에서 돈이 실제로 들어온 회사를 고르고, 지난 ${C.flowDays ?? 10}거래일을 ${drawsTxt(C.mc?.draws ?? 10000)} 다시 뽑아 자주 남은 곳부터 7곳을 남긴다(규칙 `, h('code', null, C.rules ?? 'cand-rules-3'), ' · 연구용 · 성능 검증 전)'),
      h('li', null, h('b', null, '후보군'), ` · ATLAS 선정 묶음 ${C.pool?.universe ?? 0}곳(${place.label} · 시장 전체 아님)`),
      h('li', null, h('b', null, '① 돈이 들어온 업종'), ` · 돈 흐름(업종 순환 · ${W ? `${md(W.from)}~${md(W.to)} ` : ''}${C.flowDays ?? 10}거래일 시장 대비 시가총액 몫 변화) 「늘어난 곳」 1위~3위 가운데 같은 기간 외국인+기관 순매수(추정)가 + 이고 업종 값도 오른 곳`),
      h('li', null, h('b', null, '② 그 안 회사'), ` · 그날 종가 있음 · 마지막 결산 영업이익 · 순이익 흑자 · 위험 공시 없음(거래정지 · 관리종목 · 상장폐지 · 불성실공시 · 감사의견 · 회생 · 횡령 · 배임 · 투자위험 · 투자경고 지정 · 공급계약 해지 — 최근 ${C.window?.days ?? 30}일 · 장 마감 전) · 외국인+기관 ${C.flowDays ?? 10}거래일 순매수(추정) +`),
      h('li', null, h('b', null, `③ ${drawsTxt(C.mc?.draws ?? 10000)} 다시 뽑기(몬테카를로)`), ` · 지난 ${C.flowDays ?? 10}거래일 가운데 열 날을 다시 뽑아(같은 날 거듭 · 빠짐 있음) 그 날들의 업종 금액 · 업종 값 · 외국인+기관과 회사 순매수로 ①②와 차례를 처음부터 다시 셈 → 회사마다 7곳에 든 횟수 · 다시 뽑는 회사는 종가 · 흑자 · 위험 공시 없음을 넘은 ${C.mc?.base ?? '?'}곳 · 씨앗(규칙 이름 · 판 날짜)이 같으면 누가 돌려도 같은 횟수 · 다른 셈틀(파이썬)로 따로 세어 맞댐 · 지난 자료가 얼마나 단단한지 — 앞날이 아님`),
      h('li', null, h('b', null, '④ 소거법 · 차례(검토 우선순위)'), ' · ①② 기준을 넘은 곳을 진입 조건 충족 먼저 → 7곳에 든 횟수가 많은 순 → 회사 크기(시가총액)에 견준 외국인+기관 순매수 세기 → 금액 → 종목 기호로 세우고 같은 업종 3곳 · 7곳까지 남김 · 절반(5,000번) 아래는 빼지 않고 「가장 큰 위험」에 적음 · 점수 · 가중치를 만들지 않음'),
      h('li', null, h('b', null, '흔들림 검사'), ` · 씨앗만 바꿔 ${drawsTxt(C.mc?.draws ?? 10000)}을 ${C.mc?.seeds?.n ?? 4}번 더 돌려 같은 소거법 — 7곳 · 차례가 같은지 적음(공식 답은 첫 씨앗) · 횟수 차이가 100번 안쪽인 곳끼리는 차례가 바뀔 수 있음`),
      h('li', null, h('b', null, '진입 조건(상태)'), ' · 20거래일 수익률 +30.0% 이하 · 희석 공시(유상증자 · 전환사채 · 신주인수권 등 — 30일) 없음 · 과열 공시(공매도 과열 · 단기과열 · 투자경고 지정예고 — 7일) 없음 → 조건 충족 / 아니면 조건 대기 · 진입 가격 · 범위는 만들지 않음'),
      h('li', null, h('b', null, '갱신 · 교체'), ' · 거래일 16:00 판마다 다시 셈 · 저녁 19:00 기록에 그날 목록을 남김(고치지 않음) · 앞 기록과 신규 · 유지 · 제외를 적음'),
      h('li', null, h('b', null, '판단이 바뀌는 조건'), ` · 돈 흐름 이탈(업종이 1위~3위 밖 · 외국인+기관 순매도) · 사업 가설 훼손(해지 · 위험 · 희석 공시 · 결산 적자) · 가격 기준 이탈(처음 기록 종가 대비 −10.0% 또는 지수 대비 −5.0%p 아래) · 평가 기간 종료(${C.evalDays ?? 20}거래일) — 따로 셈`),
      h('li', null, h('b', null, '여섯 질문과 대용'), ' · ① 사업 · 실적 변화 = 결산 흑자 · 최근 30일 사업 변화 공시(있으면 보임 — 고르는 데 쓰지 않음) ② 이익 경로 = 공시 종류마다 길(크기는 원문) ③ 가격에 실린 기대 = 직접 볼 수 없음 — 대용: 돈 흐름(업종 · 회사) · 20거래일 수익률 · 52주 범위 자리(컨센서스 · 가치평가 자료 없음) ④ 확인 · 반박 = 그 뒤 판의 돈 흐름 · 일정 · 20거래일 평가 ⑤ 손실 경로 = 가장 큰 위험 · 판단이 바뀌는 조건 ⑥ 우선 이유 = 위 차례 규칙'),
      h('li', null, h('b', null, '금액의 뜻'), ' · 업종 금액 = 시장 대비 시가총액 몫의 변화(실제 투자금 아님) · 외국인+기관 금액 = 날마다 순매수 주식 수 × 그날 종가(공식 금액 아님 · 추정)'),
      h('li', null, h('b', null, '하지 않는 것'), ' · 「아직 가격에 반영 안 됨」이라고 단정하지 않음 · 목표가 · 기대 수익률 · 수익을 약속하는 말 없음 · 미국 판은 외국인 · 기관 매매 자료가 없어 고르지 않음')));
}
/** 기준 자세히(⑤ 맨 아래) — 시각 · 공시 범위 · 만든 때 · 규칙 이름 · 기록 */
function baseMore(C, manifest) {
  const rec = (C.records ?? []).find(r => r.asOf === C.asOf) ?? null;
  return h('p', {class: 'muted xs'}, `${place.closeAt} 종가 · 장중 값 아님 · 공시 ${md(C.window?.from)}~${md(C.asOf)} 장 마감까지 · 평가 ${C.evalDays ?? 20}거래일${C.evalEnd ? `(${md(C.evalEnd)}까지)` : ''}`,
    manifest?.generatedAt ? ` · 만든 때 ${stamp(manifest.generatedAt)}` : '', ' · 규칙 ', h('code', null, C.rules ?? 'cand-rules-3'), C.mc ? ` · 씨앗 ${C.mc.seed}` : '',
    rec ? ` · 고정 기록 ${stamp(rec.recordedAt)}(${rec.src === 'pub' ? '후보 발행본' : '저녁 기록'} · 고치지 않음)` : ' · 고정 기록 전 — 거래일 19:00 저녁 기록에 그날 목록을 남김(고치지 않음)');
}

export async function renderCand(main, {manifest}) {
  const [board, lens0] = await Promise.all([loadBoard(), loadLens().catch(() => null)]);
  const lens = lens0 && !lens0.none ? lens0 : null, C = candOfLens(lens);
  const explore = h('p', {class: 'ob-more'}, h('a', {href: '#/flow/rotation'}, '돈 흐름 ›'), h('a', {href: '#/market'}, '시장 ›'), h('a', {href: '#/stocks'}, '종목 찾기 ›'), h('a', {href: '#/agenda'}, '일정 ›'));
  if (!lens || !C) { // 판 읽기를 못 읽은 날 — 후보를 지어내지 않음
    state.summary = `${korDate(board.asOf)} 종가 · 매수 검토 후보 판단 보류`;
    main.replaceChildren(h('div', {class: 'b-page cd-page'},
      blk(1, '기준', h('p', {class: 'ob-base'}, h('b', null, `${place.label} · ${korDate(board.asOf)} 종가`), ` · ${place.closeAt}`), lensMissing(lens0)),
      blk(2, '매수 검토 후보', h('p', {class: 'ob-say'}, '판단 보류 — 판 읽기 파일을 읽지 못해 후보를 셈하지 않음')),
      quietArt({key: 'cand', label: '매수 검토 후보', word: '0곳', when: `${korDate(board.asOf)} 종가`}), explore, foot(manifest)));
    main.querySelector('section[data-art]')?.setAttribute('data-first', '3');
    return;
  }
  if (!C.ready) { // 미국 판 · 돈 흐름이나 매매 자료가 없는 판 — 고르지 않고 까닭
    state.summary = `${place.label} 판 · 매수 검토 후보 없음 · ${C.why}`;
    main.replaceChildren(h('div', {class: 'b-page cd-page'},
      blk(1, '기준', h('p', {class: 'ob-base'}, h('b', null, `${place.label} · ${korDate(C.asOf)} 종가`), ` · ${place.closeAt} · 후보군 ${C.pool?.universe ?? 0}곳`)),
      blk(2, '매수 검토 후보 0곳', h('p', {class: 'ob-say'}, '고르지 않음'), h('p', {class: 'mk-l'}, C.why), h('p', {class: 'mk-l'}, h('span', {class: 'cd-k'}, '필요한 자료'), ' ', (C.need ?? []).join(' · ')),
        h('p', {class: 'muted xs'}, '자리를 채우려고 기준을 낮추거나 숫자를 지어내지 않음 · 한국 판에서는 같은 규칙으로 셈')),
      quietArt({key: 'cand', label: '매수 검토 후보', word: '0곳', when: `${korDate(C.asOf)} 종가`}), explore, foot(manifest)));
    main.querySelector('section[data-art]')?.setAttribute('data-first', '3');
    return;
  }
  const n = C.items.length;
  state.summary = n ? `매수 검토 후보 ${n}곳 · ${korDate(C.asOf)} 종가 · 돈이 들어온 업종 ${(C.flow?.sectors ?? []).filter(s => s.ok).map(s => s.label).join(' · ')} · 연구용 · 성능 검증 전. ` + C.items.map(x => `${x.rank}위 ${x.name} · ${ST[x.status]} · 가장 큰 위험 ${x.risk.text}`).join('. ')
    : `${korDate(C.asOf)} 종가 · 조건을 모두 넘은 곳 없음 · 기준을 낮추지 않음`;
  const fold = (t, ...kids) => h('details', {class: 'cd-more-d'}, h('summary', null, t), ...kids);
  main.replaceChildren(h('div', {class: 'b-page cd-page'},
    blk(1, '기준', ...baseLines(C)),
    candArt(C, {sel: state.candSel}),
    blk(3, '자세히', h('div', {class: 'cd-fold'},
      fold(`어떻게 골랐나 · ${C.pool.universe}곳 → ${n}곳`, ...funnelEl(C)),
      fold('바뀐 후보 · 공통 위험', ...changesEl(C)),
      fold('선정 이후 결과', ...resultEl(C, lens)),
      fold('고르는 법 · 기준 자세히', rulesEl(C), baseMore(C, manifest)))),
    explore,
    foot(manifest)));
}

/* ═════════ 다른 후보와 비교(#/compare/A/B) — 같은 기간 · 같은 기준에 둘을 놓음 · 고르면 그 자리에서 막대만 옮겨 감 ═════════ */
/** 두 후보 가운데 앞 순위가 앞선 까닭 — 순위 규칙을 차례로 견줘 처음 갈린 것 */
function decide(a, b) {
  if (!a || !b) return null;
  const [p, q] = a.rank <= b.rank ? [a, b] : [b, a], head = `앞선 쪽은 ${p.rank}위 ${p.name}`;
  if (p.met !== q.met) return `${head} — 진입 조건 충족(상대 쪽은 조건 대기)`;
  if (finite(p.mc?.n) && finite(q.mc?.n) && p.mc.n !== q.mc.n) return `${head} — ${drawsTxt(p.mc.of)} 다시 뽑아 7곳에 든 횟수가 더 많음(${timesTxt(p.mc.n)} 대 ${timesTxt(q.mc.n)})`;
  if ((p.flow.power ?? 0) !== (q.flow.power ?? 0)) return `${head} — 회사 크기에 견준 외국인+기관 순매수가 더 셈(${powTxt(p.flow.power)} 대 ${powTxt(q.flow.power)})`;
  return `${head} — 외국인+기관 순매수 금액이 더 큼(${eokTxt(p.flow.fi)} 대 ${eokTxt(q.flow.fi)})`;
}
function cmpTable(a, b, C) {
  const row = (k, f) => h('tr', null, h('th', {scope: 'row'}, k), h('td', null, ...[].concat(f(a))), h('td', null, ...[].concat(f(b))));
  return h('div', {class: 'c-scroll', 'data-scroll': 'x'}, h('table', {class: 'c-table cmp-t'},
    h('thead', null, h('tr', null, h('th', {scope: 'col'}, '같은 기준'), h('th', {scope: 'col'}, h('span', {'data-ident': ''}, a.name)), h('th', {scope: 'col'}, h('span', {'data-ident': ''}, b.name)))),
    h('tbody', null,
      row('검토 순위', x => `${x.rank}위`),
      row('상태', x => stEl(x.status)),
      row(`${drawsTxt(C.mc?.draws ?? 10000)} 다시 뽑기`, x => `${timesTxt(x.mc?.n)} 7곳에 듦`),
      row('지금 값', x => `${won(x.close)} · ${md(x.date)} 종가`),
      row('업종(돈 흐름)', x => [`${x.flow.sector.rank}위 ${x.flow.sector.label} `, eokEl(x.flow.sector.amount)]),
      row(`외국인+기관 ${C.flowDays ?? 10}거래일`, x => [eokEl(x.flow.fi), ' (추정)']),
      row('회사 크기에 견준 세기', x => `시가총액의 ${powTxt(x.flow.power)}`),
      row('20거래일 수익률', x => pv(x.r20)),
      row(`${C.index?.name ?? '지수'} 대비(20거래일)`, x => ppv(x.gap)),
      row('52주 범위 자리', x => (finite(x.pos52) ? `${Math.round(x.pos52 * 100)}%` : '자료 없음')),
      row('영업이익', x => eokWon(x.fund?.op)),
      row('가장 큰 위험', x => x.risk.text),
      row('같은 업종 후보', x => `${C.items.filter(y => y.g === x.g).length}곳`))));
}
export async function renderCompare(main, {hash, manifest}) {
  const [board, lens0] = await Promise.all([loadBoard(), loadLens().catch(() => null)]);
  const lens = lens0 && !lens0.none ? lens0 : null, C = candOfLens(lens), xs = C?.ready ? C.items : [];
  const back = h('a', {class: 'c-back', href: state.compareBack ?? '#/'}, '‹ ', state.compareBack?.startsWith('#/stock/') ? '종목 화면' : '후보 7곳');
  if (xs.length < 2) {
    state.summary = '다른 후보와 비교 · 비교할 후보가 둘 미만';
    main.replaceChildren(h('div', {class: 'b-page cmp-page'}, back,
      blk(1, '기준', h('p', {class: 'ob-base'}, h('b', null, `${place.label} · ${korDate(C?.asOf ?? board.asOf)} 종가`), ` · ${place.closeAt}`), lens ? null : lensMissing(lens0)),
      blk(2, '다른 후보와 비교', h('p', {class: 'mk-l'}, `비교할 후보가 ${xs.length}곳 — 둘 이상일 때 같은 기준으로 견줌`)),
      quietArt({key: 'compare', label: '다른 후보와 비교', word: `${xs.length}곳`, when: `${korDate(C?.asOf ?? board.asOf)} 종가`}), foot(manifest)));
    main.querySelector('section[data-art]')?.setAttribute('data-first', '3');
    return;
  }
  const [, ca, cb] = hash.match(/^#\/compare(?:\/([^/]+))?(?:\/([^/]+))?$/) ?? [];
  const memo = prefs.get('cmp', null); // 고른 짝을 기억(다시 와도 다시 고르지 않게 · 8)
  let A = xs.find(x => x.code === decodeURIComponent(ca ?? '')) ?? xs.find(x => x.code === memo?.a) ?? xs[0];
  let B = xs.find(x => x.code === decodeURIComponent(cb ?? '') && x.code !== A.code) ?? xs.find(x => x.code === memo?.b && x.code !== A.code) ?? xs.find(x => x.code !== A.code);
  // 묶음마다 같은 축(후보 모두의 값으로 정함) — 짝을 바꿔도 축은 그대로라 막대만 옮겨 감
  const axP = axisOf(xs.map(x => x.flow.power)), axR = axisOf(xs.map(x => x.r20));
  const mk = (who, k, ax) => { const name = h('span', {class: 'bc-name', 'data-ident': ''}), val = h('b', {class: 'bc-val'}), b = h('span', {class: 'bc-bar cmp-bar'}), z = h('span', {class: 'bc-zero'});
    z.style.setProperty('--l', `${posOf(ax, 0).toFixed(2)}%`);
    return {who, k, ax, name, val, b, el: h('div', {class: 'bc-row cmp-row', 'data-who': who, 'data-k': k}, h('p', {class: 'bc-top'}, h('span', {class: 'bc-rk'}, who === 'a' ? '가' : '나'), name, val), h('span', {class: 'bc-track', 'aria-hidden': 'true'}, z, b))}; };
  const R = [mk('a', 'power', axP), mk('b', 'power', axP), mk('a', 'r20', axR), mk('b', 'r20', axR)];
  const setBar = r => { const x = r.who === 'a' ? A : B, v = r.k === 'power' ? x.flow.power : x.r20, zero = posOf(r.ax, 0), z = posOf(r.ax, finite(v) ? v : 0);
    r.name.textContent = x.name; r.val.textContent = r.k === 'power' ? powTxt(v) : finite(v) ? fmtPct(v) : '계산 불가'; r.val.className = `bc-val ${finite(v) ? (r.k === 'power' ? 'cmp-pow' : v > 0 ? 'up' : v < 0 ? 'down' : 'flat') : 'na'}`;
    r.b.className = `bc-bar cmp-bar ${finite(v) ? (r.k === 'power' ? 'cmp-pow' : v > 0 ? 'up' : v < 0 ? 'down' : 'flat') : 'bc-none'}`; r.b.style.setProperty('--l', `${Math.min(zero, z).toFixed(2)}%`); r.b.style.setProperty('--w', `${Math.max(0.6, Math.abs(z - zero)).toFixed(2)}%`); };
  const chart = h('div', {class: 'bc cmp-bc'}, h('p', {class: 'cmp-cap'}, `회사 크기에 견준 외국인+기관 순매수(${C.flowDays ?? 10}거래일)`), h('div', {class: 'bc-grp', 'data-at': '0'}, R[0].el, R[1].el),
    h('p', {class: 'cmp-cap'}, '20거래일 수익률'), h('div', {class: 'bc-grp', 'data-at': '1'}, R[2].el, R[3].el));
  const why = h('p', {class: 'ra-li'}), risk = h('p', {class: 'ra-li', 'data-at': '2'}), next = h('p', {class: 'ra-li', 'data-at': '3'});
  const labels = h('div', {class: 'ra-lab'}, h('p', {class: 'ra-li'}, h('span', {class: 'ra-k ra-tag'}, '같은 축'), '묶음마다 두 회사가 같은 눈금 — 후보 모두의 값으로 정한 축'), why, risk, next);
  const fig = artSection({key: 'compare', label: '다른 후보와 비교', kicker: '같은 기간 · 같은 축', when: `${korDate(C.asOf)} 종가`, stage: artStage({key: 'compare', art: chart, labels, steps: [{c: 0, at: 0, ms: 1200}, {c: 1, at: 1, ms: 1300}, {c: 2, at: 2, ms: 1300}, {c: 3, at: 3, ms: 1000}]}), first: 4});
  const tableBox = h('div'), sayBox = h('p', {class: 'ob-say cmp-say', 'data-speak': ''}), linkBox = h('div', {class: 'ob-next'});
  // 고르기 = 휴대폰 기본 고르기 칸 둘(가 · 나 — 첫 화면에 차이가 먼저 보이게 · 화면 읽기 · 자판으로도 그대로)
  const pick = who => { const sel = h('select', {class: 'cmp-sel', id: 'cmp-' + who, onchange: () => { const x = xs.find(y => y.code === sel.value); if (x) choose(who, x); }},
    ...xs.map(x => h('option', {value: x.code}, `${x.rank}위 ${x.name}`)));
    return h('label', {class: 'cmp-pick', for: 'cmp-' + who}, h('span', {class: 'cmp-who'}, who === 'a' ? '가' : '나'), sel); };
  const pickA = pick('a'), pickB = pick('b');
  function paint() {
    for (const [box, cur, other] of [[pickA, A, B], [pickB, B, A]]) { const sel = box.querySelector('select'); sel.value = cur.code; for (const o of sel.options) o.disabled = o.value === other.code; }
    for (const r of R) setBar(r);
    why.replaceChildren(h('span', {class: 'ra-k ra-tag'}, '앞선 까닭'), decide(A, B));
    risk.replaceChildren(h('span', {class: 'ra-k ra-tag'}, '반대 근거'), `가 ${A.risk.text} · 나 ${B.risk.text}`);
    next.replaceChildren(h('span', {class: 'ra-k ra-tag'}, '확인할 것'), `그 뒤 판(거래일 16:00)의 돈 흐름 · 평가 ${C.evalDays ?? 20}거래일${C.evalEnd ? `(${md(C.evalEnd)})` : ''}`);
    labels.dataset.check = JSON.stringify({a: A.code, b: B.code, apow: A.flow.power, bpow: B.flow.power, ar20: A.r20, br20: B.r20});
    sayBox.textContent = decide(A, B);
    tableBox.replaceChildren(cmpTable(A, B, C));
    linkBox.replaceChildren(h('a', {class: 'ob-go', href: stockHref(A.code), onclick: () => { state.candGo = 'why'; }}, `${A.name} · 왜 선정됐나요? ›`), h('a', {class: 'ob-go', href: stockHref(B.code), onclick: () => { state.candGo = 'why'; }}, `${B.name} · 왜 선정됐나요? ›`));
    state.summary = `다른 후보와 비교 · ${A.rank}위 ${A.name} 대 ${B.rank}위 ${B.name} · ${decide(A, B)}`;
    prefs.set('cmp', {a: A.code, b: B.code});
  }
  function choose(who, x) {
    if (who === 'a') { if (x.code === B.code) return; A = x; } else { if (x.code === A.code) return; B = x; }
    history.replaceState(null, '', location.pathname + location.search + `#/compare/${A.code}/${B.code}`); // 주소만 바꿈(화면을 새로 그리지 않음 — 막대가 같은 축에서 옮겨 감)
    paint();
  }
  main.replaceChildren(h('div', {class: 'b-page cmp-page'}, back,
    blk(1, '기준', h('p', {class: 'ob-base'}, h('b', null, `${place.label} · ${korDate(C.asOf)} 종가`), ` · 같은 기간(돈 흐름 ${C.flowDays ?? 10}거래일 · 수익률 20거래일) · 비교 ${C.index?.name ?? '지수'} · 같은 규칙`)),
    blk(2, '고르기 · 후보 둘', h('div', {class: 'cmp-picks'}, pickA, pickB)),
    blk(3, '같은 기준에서의 차이', sayBox, tableBox, h('p', {class: 'muted xs'}, `순위는 미리 정한 규칙의 차례(진입 조건 충족 → ${drawsTxt(C.mc?.draws ?? 10000)} 다시 뽑아 7곳에 든 횟수 → 회사 크기에 견준 외국인+기관 순매수 → 금액) — 오를 차례가 아님`)),
    fig,
    blk(5, '이어서 보기', linkBox),
    foot(manifest)));
  paint();
}

/* ═════════ 종목 화면 「후보 판단」 칸 — 여섯 질문(7) · 주장 → 관측 → 계산 · 해석 → 반대 근거 → 확인할 것 ═════════ */
const qRow = (k, ...v) => h('div', {class: 'cj-r'}, h('dt', null, k), h('dd', null, ...v));
function qBox(id, q, rows) { return h('section', {class: 'cj-q', id, 'aria-label': q, tabindex: '-1'}, h('h3', {class: 'cj-qh'}, q), h('dl', {class: 'cj-dl'}, ...rows)); }
const okEl = ok => h('b', {class: 'cj-ok ' + (ok ? 'yes' : 'no')}, ok ? '✓ 넘음' : '✕ 못 넘음');
/** 후보가 아닌 종목 — 조건마다 넘었나(판 읽기 cand.flags) · 처음 막힌 조건 */
export const FLAG_NAMES = ['돈이 들어온 업종', '그날 종가', '흑자', '위험 공시 없음', '외국인+기관 순매수', '진입 조건'];
export function candFlagsOf(C, code) { const f = C?.flags?.[code]; return typeof f === 'string' && f.length === FLAG_NAMES.length ? [...f].map(c => c === '1') : null; }
export function candJudgeBox(lens, s) {
  const C = candOfLens(lens); if (!C?.ready) return null;
  const x = C.items.find(y => y.code === s.code) ?? null, hist = C.hist?.[s.code] ?? null, flags = candFlagsOf(C, s.code);
  const afterEl = () => (hist ? [qRow('처음 기록', `${md(hist.first.asOf)} 기록 ${hist.first.rank}위 · 그때 종가 ${won(hist.first.close)} · 남긴 때 ${stamp(hist.first.recordedAt)}`),
    qRow('그때 적은 까닭', h('span', {lang: 'ko'}, hist.first.reason ?? '없음'), ' (고치지 않음)'),
    qRow('그 뒤', '이 종목 ', pv(hist.r), ` · ${C.index?.name ?? '지수'} `, pv(hist.idx), ' · 격차 ', ppv(hist.gap), ` · 기록 ${hist.records}장에 듦`),
    qRow('평가', hist.due ? (hist.due > C.asOf ? `${C.evalDays ?? 20}거래일 평가 대기(${md(hist.due)})` : `${C.evalDays ?? 20}거래일 평가일 ${md(hist.due)} 지남 — 검증 화면`) : '평가일 모름(달력 밖)', ' · ', h('a', {href: '#/check'}, '검증 ›'))]
    : [qRow('기록', '아직 이 종목이 든 후보 고정 기록 없음 — 기록하면 그날 종가부터 셈')]);
  if (!x) { // 후보가 아닌 종목 — 조건 상태만(짧게)
    if (!flags && !hist) return null;
    const firstFail = flags ? flags.findIndex(ok => !ok) : -1;
    return h('section', {class: 'b-box cj-box cj-out', 'aria-label': '후보 판단', 'data-cand': 'out'},
      h('h2', {class: 'b-box-h'}, '후보 판단', h('small', null, ` · ${korDate(C.asOf)} 종가 · 규칙 ${C.rules}`)),
      h('p', {class: 'mk-l'}, h('b', null, '매수 검토 후보 아님'), firstFail >= 0 ? ` — 처음 막힌 조건: ${FLAG_NAMES[firstFail]}` : flags ? ' — 조건은 넘었지만 7곳 밖(순위 · 업종 한도)' : ''),
      flags ? h('ul', {class: 'cj-flags'}, ...FLAG_NAMES.map((k, i) => h('li', {'data-ok': String(flags[i])}, okEl(flags[i]), ' ', k))) : null,
      hist ? h('dl', {class: 'cj-dl'}, ...afterEl()) : null,
      h('p', {class: 'muted xs'}, h('a', {href: '#/'}, `지금 후보 ${C.items.length}곳 보기 ›`)));
  }
  const F = x.flow, f = x.fund ?? {}, ex = x.exit, pr = ex.price, per = ex.period, idx = C.index?.name ?? '지수', ev = x.evidence;
  const W = C.flow?.waves ?? [], lastWaves = W.slice(-3);
  const go = id => () => { const t = box.querySelector('#' + id); if (!t) return; t.scrollIntoView({block: 'start', behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth'}); t.focus({preventScroll: true}); t.classList.remove('cj-hi'); void t.offsetWidth; t.classList.add('cj-hi'); };
  const btn = (label, id) => h('button', {type: 'button', class: 'cd-btn', 'aria-controls': id, onclick: go(id)}, label);
  const box = h('section', {class: 'b-box cj-box', 'aria-label': '후보 판단', 'data-cand': x.code, 'data-status': x.status},
    h('h2', {class: 'b-box-h cj-h', tabindex: '-1'}, h('span', {class: 'cj-hn'}, `후보 판단 · 검토 순위 ${x.rank}위`), ' ', stEl(x.status)),
    h('p', {class: 'cj-sum'}, h('span', {class: 'cd-k'}, '고른 까닭'), ' ', ...reasonEl(x, C)),
    h('p', {class: 'cj-risk'}, h('span', {class: 'cd-k'}, '가장 강한 반대 근거'), ' ', x.risk.text), // 반대 근거는 이유 바로 아래(7)
    x.status === 'recheck' ? h('p', {class: 'cd-note cd-note-re'}, `재검토 까닭: ${x.recheckWhy}`) : x.status === 'wait' ? h('p', {class: 'cd-note'}, `조건 대기 까닭: ${x.waitWhy}`) : null,
    h('nav', {class: 'cj-acts', 'aria-label': '후보 판단 바로 가기'},
      btn('왜 선정됐나요?', 'cj-why'),
      C.items.length > 1 ? h('a', {class: 'cd-btn', href: `#/compare/${x.code}/${pairOf(C, x.code)}`, onclick: () => { state.compareBack = location.hash; }}, '다른 후보와 비교') : null,
      btn('진입 조건 확인', 'cj-entry'), btn('판단이 바뀌는 조건', 'cj-exit'), btn('선정 이후 결과', 'cj-after')),
    qBox('cj-why', '왜 이 종목인가?', [
      qRow('주장', '돈이 들어온 업종 안에서, 외국인과 기관의 돈이 실제로 들어왔고 이익을 내는 회사'),
      qRow('관측', `업종 ${F.sector.label} — 돈 흐름 ${F.sector.rank}위 · ${C.flowDays ?? 10}거래일 시장 대비 시가총액 `, eokEl(F.sector.amount), ' · 업종 외국인+기관 ', eokEl(F.sector.fi),
        ` · 이 회사 외국인 ${finite(F.f10) ? `${F.f10 > 0 ? '+' : F.f10 < 0 ? '−' : ''}${Math.abs(F.f10).toLocaleString('ko-KR')}주` : '자료 없음'} · 기관 ${finite(F.i10) ? `${F.i10 > 0 ? '+' : F.i10 < 0 ? '−' : ''}${Math.abs(F.i10).toLocaleString('ko-KR')}주` : '자료 없음'}(추정 `, eokEl(F.fi), ')'),
      qRow('계산 · 해석', `회사 크기에 견준 세기 = 순매수 ${eokTxt(F.fi)} ÷ 시가총액 ${eokWon(F.cap)} = ${powTxt(F.power)} — 다섯 조건을 넘은 ${C.pool?.screen ?? '?'}곳 가운데 ${F.powerRank ?? '?'}번째로 셈 · 영업이익 ${eokWon(f.op)} · 순이익 ${eokWon(f.net)}(${fyTxt(f.fy)})`),
      x.mc ? qRow(`${drawsTxt(x.mc.of)} 다시 뽑기`, `지난 ${C.flowDays ?? 10}거래일을 ${drawsTxt(x.mc.of)} 다시 뽑아 같은 규칙으로 고르면 ${timesTxt(x.mc.n)} 7곳에 듦 · ${x.mc.sector} 업종이 돈이 들어온 3곳에 든 것 ${timesTxt(x.mc.sectorN)} — 지난 자료가 얼마나 단단한지(앞날 아님)`) : null,
      qRow('반대 근거', x.risk.text, ' · 사고판 돈은 값을 움직이는 힘일 뿐 — 사업 · 실적이 바뀌었다는 뜻은 아님'),
      qRow('사업 변화', ev ? [`최근 30일 ${md(ev.date)} ${ev.kindLabel} 공시 `, title(ev.title), ` — ${PATH[ev.kind] ?? ''}`] : '최근 30일 사업 변화 공시(수주 · 시설투자 · 주주환원) 없음 — 돈 흐름만으로 고름'),
      qRow('확인할 것', '그 뒤 판(거래일 16:00)에서 업종이 1위~3위에 남는지 · 이 회사 외국인+기관 순매수가 이어지는지')]),
    qBox('cj-now', `왜 ${md(C.asOf)} 종가에 검토하나?`, [
      qRow('주장', `돈 흐름은 최근 ${C.flowDays ?? 10}거래일 일(${C.flow?.window ? `${md(C.flow.window.from)}~${md(C.flow.window.to)}` : '기간 표시 없음'}) — 지금 이어지는 중`),
      qRow('관측', `업종 ${C.flowDays ?? 10}거래일 `, pv(F.sector.change), ' · 이 회사 20거래일 ', pv(x.r20), ` · ${idx} 대비 `, ppv(x.gap)),
      qRow('계산 · 해석', '돈이 들어오는 동안 값도 받쳐 주는지 보는 대용 값(입증 아님) · 「아직 가격에 반영 안 됨」이라고 하지 않음'),
      qRow('반대 근거', lastWaves.length ? `돈 흐름은 자주 바뀜 — 최근 파장 ${lastWaves.map(w => `${w.from} → ${w.to}(${w.days}거래일)`).join(' · ')}` : '돈 흐름은 자주 바뀜'),
      qRow('확인할 것', '거래일 16:00 판마다 업종 차례 · 저녁 19:00 기록')]),
    qBox('cj-price', `${won(x.close)}(${md(x.date)} 종가)은 분석에서 어떤 뜻인가?`, [
      qRow('주장', '이 값은 판단의 기준선 — 싸다 · 비싸다를 말하지 않음'),
      qRow('관측', finite(x.pos52) ? `52주 범위의 ${Math.round(x.pos52 * 100)}% 자리(최저 ${won(x.low52)} ~ 최고 ${won(x.high52)})` : '52주 범위 자료 없음', ` · 처음 기록한 종가 ${won(pr.refClose)}(${md(pr.refDate)})${pr.recorded ? '' : ' — 기록 전이라 지금 값'}`),
      qRow('계산 · 해석', '가격에 실린 기대는 직접 볼 수 없음 — 대용: 돈 흐름 · 20거래일 수익률 · 52주 자리 · 컨센서스 · 가치평가(EPS · PER) 자료 없음 → 적정가를 셈하지 않음'),
      qRow('반대 근거', !finite(x.pos52) ? '범위를 몰라 자리를 말할 수 없음' : x.pos52 >= 0.9 ? '52주 최고 근처 — 되돌림 폭이 클 수 있음' : x.pos52 <= 0.2 ? '52주 최저 근처 — 낙폭이 크다고 싸다는 뜻 아님' : '범위 가운데 — 값만으로는 판단 근거 없음'),
      qRow('확인할 것', '가격 기준선 대비 변화(아래 「판단이 바뀌는 조건」)')]),
    qBox('cj-entry', '어떤 조건에서 진입을 검토하는가?', [
      qRow('주장', '미리 정한 조건을 모두 넘을 때만 「조건 충족」'),
      qRow('관측', h('div', {class: 'c-scroll', 'data-scroll': 'x'}, h('table', {class: 'c-table cj-t'}, h('thead', null, h('tr', null, h('th', {scope: 'col'}, '조건'), h('th', {scope: 'col'}, '정한 값'), h('th', {scope: 'col'}, '이번 판'), h('th', {scope: 'col'}, '판정'))),
        h('tbody', null,
          h('tr', null, h('th', {scope: 'row'}, '20거래일 수익률'), h('td', null, '+30.0% 이하'), h('td', null, pv(x.r20)), h('td', null, okEl(finite(x.r20) && x.r20 <= 30))),
          h('tr', null, h('th', {scope: 'row'}, '희석 공시(30일)'), h('td', null, '없음'), h('td', null, x.checks.dilute.now), h('td', null, okEl(x.checks.dilute.ok))),
          h('tr', null, h('th', {scope: 'row'}, '과열 공시(7일)'), h('td', null, '없음'), h('td', null, x.checks.heat.now), h('td', null, okEl(x.checks.heat.ok))))))),
      qRow('계산 · 해석', `상태 ${ST[x.met ? 'met' : 'wait']} · 진입 가격 · 범위는 만들지 않음(산식 · 가정이 검증되지 않음 — 근거 부족)`),
      qRow('반대 근거', '조건 충족은 오른다는 뜻이 아님 · 조건은 연구용(성능 검증 전)'),
      qRow('확인할 것', `유효 기간: ${md(C.asOf)} 종가 기준 · 거래일 16:00 판마다 다시 셈`)]),
    qBox('cj-exit', '무엇이 달라지면 판단을 거두는가?', [
      qRow('돈 흐름 이탈', h('b', {class: 'cj-ok yes'}, '✓ 유지'), ` · 이번 판: ${ex.flow.now} · 기준: 업종이 돈이 들어온 1위~3위 밖 · 이 회사 외국인+기관 ${C.flowDays ?? 10}거래일 순매도`),
      qRow('사업 가설 훼손', h('b', {class: 'cj-ok ' + (ex.business.broken ? 'no' : 'yes')}, ex.business.broken ? '! 깨짐' : '✓ 유지'), ` · 이번 판: ${ex.business.now ?? '해당 공시 없음'} · 기준: 공급계약 해지 · 위험 공시 · 희석 공시 · 새 결산 적자`),
      qRow('가격 기준 이탈', h('b', {class: 'cj-ok ' + (pr.broken ? 'no' : 'yes')}, pr.broken ? '! 이탈' : '✓ 안 넘음'), ` · 기준선 ${won(pr.refClose)}(${md(pr.refDate)}) 대비 −10.0% = ${won(pr.stop)} 아래 또는 ${idx} 대비 −5.0%p 아래 · 지금 `, pv(pr.fromRef), ' · 격차 ', ppv(x.gap)),
      qRow('평가 기간 종료', h('b', {class: 'cj-ok ' + (per.ended ? 'no' : 'yes')}, per.ended ? '끝남' : per.start ? '진행 중' : '기록 전'), per.start ? ` · ${md(per.start)} 기록 ~ ${md(per.end)}(${C.evalDays ?? 20}거래일)` : ` · 기록한 날부터 ${C.evalDays ?? 20}거래일(이 판으로 기록하면 ${md(per.end)}까지)`),
      qRow('알아 둘 것', '넷은 따로 셈 · 가격 기준은 판단을 거두는 선 — 그 값에 팔린다는 뜻 아님(갭 · 거래정지 때 체결 값은 다를 수 있음)')]),
    qBox('cj-next', '이어서 확인할 것', [
      ...(x.next?.events?.length ? x.next.events.map(e => qRow(md(e.date), h('span', {'data-ident': '', lang: 'ko'}, e.name))) : [qRow('일정', '확인된 회사 일정 없음')]),
      qRow('돈 흐름', x.next?.read ?? '그 뒤 판의 돈 흐름'),
      qRow('기록', '거래일 19:00 저녁 기록 — 목록에 남는지 · 빠지는지 · 순위')]),
    qBox('cj-after', '선정 이후 결과', afterEl()),
    h('p', {class: 'muted xs'}, `이 판단은 연구용 규칙(${C.rules} · 성능 검증 전)의 결과 · 사거나 팔라는 뜻 아님 · 후보 ${C.items.length}곳은 포트폴리오가 아님`));
  return box;
}
