/* ATLAS 11 · 출목표 한 판(#/road) — 예측 없음 · 180곳의 출목표를 한 화면에
   2026-10-04 22:12 사장님 「너 에볼루션에 바카라 출몰표 한곳에 모여 있는것도 잡스라면 그리고 애플이라면 해서 추가로 더 만들어」
   카지노 로비는 탁자마다 표를 늘어놓기만 한다 — 탁자끼리는 서로 상관없고, 어떤 탁자가 어떤 흐름인지는 사람이 하나씩 읽어야 한다.
   여기서는 두 가지로 모은다(단추 둘 · 고른 것은 이 기기에 기억):
     ① 업종별 — 36칸 판 차례 그대로 업종 5곳을 나란히(회사는 탁자와 달리 같은 업종끼리 함께 움직인다 — 다섯이 함께 빨간지 한눈에)
     ② 흐름별 — 180곳의 표를 우리가 먼저 읽어 「흐름이 같은 것끼리」 묶는다(흐름 = 처음 15거래일과 최근 5거래일의 빨강·파랑 수 · road.js 아홉 칸 표 그대로)
   칸: 이름 · 20거래일 변화 · (흐름별이면 업종) · 선 그래프(같은 20거래일 종가) · 출목표 · 지금 며칠째 같은 쪽인가 · 수급(외국인·기관 5거래일 합) · 이름이 든 최근 기사 1건
       — 22:51 「출목표만 있으면 않돼 그래프로 있어야 해 그리고 그 회사들 뉴스와 수급도」 · 누르면 회사 화면(되돌아오면 보던 자리)
   지난 종가로 그린 표일 뿐 앞날 값은 없다 — 카지노 화면의 「다음 예상」 같은 칸은 두지 않는다 */
import {h, korDate, pct, finite, signCls} from './util.js';
import {state, loadBoard, prefs} from './store.js';
import {roadOf, roadSvg, STORY} from './road.js';
import {foot, sparkSvg, sparkScale, scaleText, flowBars, newsLine, meanRets, meanSpark} from './parts.js';
import {upLine} from './view-home.js';

/** 흐름 묶음 차례 — 최근 5거래일 오름 쪽부터 내림 쪽까지(처음 15거래일은 오름 → 비슷 → 내림) · 둘 다 잠잠하면 「거의 안 움직임」 */
export const FLOW_ORDER = ['up-up', 'flat-up', 'down-up', 'up-flat', 'flat-flat', 'still', 'down-flat', 'up-down', 'flat-down', 'down-down'];
const SIDE_WORD = {up: '빨강이 많음', flat: '빨강·파랑이 비슷하거나 적음', down: '파랑이 많음'};
const calm = x => x === 'still' ? 'flat' : x;
/** 가장 많은 값(같으면 늦은 날) — 한 회사 종가가 늦어도 기간 글이 흔들리지 않게(처음 화면과 같은 셈) */
const mode = xs => { const n = new Map(); for (const x of xs) if (x) n.set(x, (n.get(x) ?? 0) + 1); return [...n].sort((a, b) => b[1] - a[1] || (a[0] < b[0] ? 1 : -1))[0]?.[0] ?? null; };
/** 한 회사의 흐름 열쇠(road.js roadStory 와 같은 규칙) */
export const flowKey = road => road.before.side === 'still' && road.now.side === 'still' ? 'still' : `${calm(road.before.side)}-${calm(road.now.side)}`;
export const flowText = (key, days = 20) => key === 'still' ? `${days}거래일 내내 거의 안 움직임` : STORY[key.split('-')[0]][key.split('-')[1]];
const nowSide = key => key === 'still' ? 'flat' : key.split('-')[1];
/** 지금 같은 쪽으로 몇 거래일째인가(보합은 건너뜀) */
export const streakText = road => road.streak.side ? `${road.streak.side === 'up' ? '오름' : '내림'} ${road.streak.len}일째` : '움직임 없음';
/** 수급·기사를 모은 곳 수 — 다 모으지 못했으면 몇 곳인지와 언제 모은 것인지 적는다 */
function ctxNote(cs) {
  const got = cs.filter(c => c.brief && !c.brief.missing?.includes('수급') && !c.brief.missing?.includes('기사')).length, day = cs.map(c => c.brief?.day).filter(Boolean).sort().at(-1);
  return h('p', {class: 'f-ctx small', 'data-got': got}, got === cs.length ? `수급·기사: ${cs.length}곳 모두${day ? ` · ${korDate(day)} 기준` : ''}` : `수급·기사: ${cs.length}곳 가운데 ${got}곳만 모았음${day ? `(${korDate(day)} 기준)` : ''} · 나머지 ${cs.length - got}곳은 다음 관측 수집 때 채움`);
}
/** 묶는 법 두 가지(앞이 처음 보이는 것) */
export const ROAD_MODES = [{id: 'ind', text: '업종별'}, {id: 'flow', text: '흐름별'}];

function tile(c, road, g, scale) {
  const st = road.streak.side ?? 'flat';
  return h('a', {class: 'f-tile', href: '#/stock/' + c.code, 'data-code': c.code},
    h('span', {class: 'f-top'}, h('span', {class: 'f-name'}, c.name), h('b', {class: 'chg20 f-chg ' + (signCls(c.change20) || 'flat')}, finite(c.change20) ? pct(c.change20, 1) : '없음')),
    g ? h('span', {class: 'f-ind'}, g.label) : null,
    sparkSvg(c, scale),
    roadSvg(road, {minCols: 20}),
    h('span', {class: 'f-cap'}, h('b', {class: 'f-st ' + st}, streakText(road)), road.unit > 0.01 ? h('span', {class: 'f-unit'}, `동그라미 하나 = ${Math.round(road.unit * 100)}%`) : null),
    flowBars(c.brief),
    newsLine(c.brief));
}

export async function renderRoad(main, {manifest} = {}) {
  const board = await loadBoard();
  const groups = board.groups ?? [], groupOf = new Map(groups.map(g => [g.id, g]));
  const items = board.companies.map(c => { const road = roadOf(c.c); return {c, road, key: flowKey(road), g: groupOf.get(c.group?.id) ?? c.group ?? null}; });
  const itemOf = new Map(items.map(x => [x.c.code, x]));
  const by = new Map(FLOW_ORDER.map(k => [k, []]));
  for (const x of items) by.get(x.key).push(x);
  for (const xs of by.values()) xs.sort((a, b) => (finite(b.c.change20) ? b.c.change20 : -Infinity) - (finite(a.c.change20) ? a.c.change20 : -Infinity) || a.c.code.localeCompare(b.c.code));
  const days = items[0]?.road.days ?? 20, before = items[0]?.road.beforeDays ?? 15, recent = items[0]?.road.recentDays ?? 5;
  const flows = FLOW_ORDER.map(k => ({key: k, text: flowText(k, days), items: by.get(k)})).filter(f => f.items.length);
  const max = Math.max(1, ...flows.map(f => f.items.length)), n = items.length;
  const from = mode(board.companies.map(c => c.cFrom)), to = mode(board.companies.map(c => c.date)) ?? board.asOf;
  let view = prefs.get('roadView', 'ind'); if (!ROAD_MODES.some(m => m.id === view)) view = 'ind';
  const reduce = () => matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth';
  const jump = key => { document.getElementById('f-' + key)?.scrollIntoView({behavior: reduce(), block: 'start'}); };

  // ① 업종별 — 36칸 판 차례(지난 20거래일 평균이 큰 업종부터) · 업종 안은 시가총액 큰 순
  const indView = () => groups.map((g, k) => { const xs = g.codes.map(code => itemOf.get(code)).filter(Boolean), sc = sparkScale(xs.map(x => x.c));
    return h('section', {class: 'f-sec', id: 'f-' + g.id, 'data-group': g.id, 'aria-label': `${k + 1}위 ${g.label} ${g.codes.length}곳`},
      h('h2', {class: 'f-h'}, h('span', {class: 'f-h-rank'}, `${k + 1}위`), h('span', {class: 'f-h-name'}, g.label), g.hot ? h('span', {class: 't-fire'}, '불장') : null,
        h('b', {class: 'chg20 f-h-chg ' + (signCls(g.change20) || 'flat')}, finite(g.change20) ? pct(g.change20, 1) : '없음')),
      h('p', {class: 't-sub'}, `${xs.length}곳 지난 20거래일 평균 · ${upLine(g)} · ${scaleText(sc)}`),
      h('div', {class: 'f-grid'}, ...xs.map(x => tile(x.c, x.road, null, sc)))); });
  // ② 흐름별 — 흐름 목록(몇 곳인지 막대로 · 누르면 그 묶음으로) → 묶음마다 회사 칸(지난 20거래일 많이 오른 순)
  // 흐름 목록 줄마다 묶음 평균 선 — 「흐름별」을 열면 첫 화면부터 그래프가 보이게(2026-10-05 00:26 「출목표 처음 보이는 곳에 그곳에 바로 그래프도 보여야 한다는거야 클릭해서 들어가는게 아니라 그래야 직관이잖아」)
  //   같은 날 종가까지 있는 회사만 평균(늦은 종가 회사는 빼고 셈) · 모든 줄이 같은 눈금
  const means = new Map(flows.map(f => [f.key, meanRets(f.items.map(x => x.c).filter(c => c.date === to))])), msc = sparkScale([]);
  for (const r of means.values()) for (const v of r) { msc.lo = Math.min(msc.lo, v); msc.hi = Math.max(msc.hi, v); }
  const flowRow = f => {
    const bar = h('span', {class: 'f-bar ' + nowSide(f.key)}); bar.style.width = `${Math.max(2, f.items.length / max * 100)}%`;
    const r = means.get(f.key);
    return h('li', null, h('button', {class: 'f-row', type: 'button', 'data-flow': f.key, onclick: () => jump(f.key)},
      h('span', {class: 'f-lab'}, f.text), meanSpark(r, msc, `${f.text} ${f.items.length}곳 평균 선 · 지난 ${Math.max(0, r.length - 1)}거래일 · 첫날 대비 ${r.length ? pct(r.at(-1), 1) : '없음'}`), h('b', {class: 'f-n'}, `${f.items.length}곳`), h('span', {class: 'f-track', 'aria-hidden': 'true'}, bar)));
  };
  const flowView = () => [
    h('section', {class: 't-sec f-index', 'aria-label': '흐름 목록'},
      h('h2', {class: 't-h2'}, `흐름 ${flows.length}가지`),
      h('p', {class: 't-sub'}, `처음 ${before}거래일과 최근 ${recent}거래일의 빨강·파랑 수로 나눔 · 줄마다 묶음 평균 선(모든 줄 같은 눈금 ${pct(msc.lo, 0)} ~ ${pct(msc.hi, 0)}) · 누르면 그 묶음으로`),
      h('ol', {class: 'f-list'}, ...flows.map(flowRow))),
    ...flows.map(f => { const sc = sparkScale(f.items.map(x => x.c));
      return h('section', {class: 'f-sec', id: 'f-' + f.key, 'data-flow': f.key, 'aria-label': `${f.text} ${f.items.length}곳`},
        h('h2', {class: 't-h2'}, f.text, h('small', null, ` · ${f.items.length}곳`)),
        h('p', {class: 't-sub'}, `${f.key === 'still' ? `${days}거래일 동안 동그라미가 거의 없음` : `처음 ${before}거래일: ${SIDE_WORD[f.key.split('-')[0]]} → 최근 ${recent}거래일: ${SIDE_WORD[f.key.split('-')[1]]} · 지난 20거래일 많이 오른 순`} · ${scaleText(sc)}`),
        h('div', {class: 'f-grid'}, ...f.items.map(x => tile(x.c, x.road, x.g, sc)))); })];

  const body = h('div', {class: 'f-body'});
  const segs = ROAD_MODES.map(m => h('button', {class: 'f-seg-b', type: 'button', 'data-mode': m.id, 'aria-pressed': 'false', onclick: () => { if (view !== m.id) { view = m.id; prefs.set('roadView', view); draw(); } }},
    m.text, h('small', null, m.id === 'ind' ? ` ${groups.length}개` : ` ${flows.length}가지`)));
  const say = () => { state.summary = view === 'ind' ? `출목표 ${n}곳, 업종별. ${groups.slice(0, 3).map((g, i) => `${i + 1}위 ${g.label} ${pct(g.change20, 1)}`).join(', ')}.` : `출목표 ${n}곳, 흐름별. ${flows.slice(0, 3).map(f => `${f.text} ${f.items.length}곳`).join(', ')}.`; };
  function draw() {
    for (const b of segs) b.setAttribute('aria-pressed', String(b.dataset.mode === view));
    body.dataset.mode = view; body.replaceChildren(...(view === 'ind' ? indView() : flowView())); say();
  }
  draw();
  main.replaceChildren(h('div', {class: 'b-page f-page'},
    h('header', {class: 'b-head'},
      h('h1', {class: 'b-title', 'data-speak': ''}, `출목표 ${n}곳`),
      h('p', {class: 'b-when', 'data-speak': ''}, `지난 ${days}거래일 · ${from ? korDate(from) + '부터 ' : ''}${korDate(to)} 15:30 종가까지 · 한 화면에 모두`),
      h('p', {class: 'f-key muted small'}, '칸마다 선 그래프 · 출목표(동그라미 하나 = 하루 1% · 빨강 오름 · 파랑 내림) · 수급 · 기사'),
      ctxNote(board.companies)),
    h('div', {class: 'f-seg', role: 'group', 'aria-label': '묶는 법'}, ...segs),
    body,
    h('p', {class: 'b-kinds muted small'}, '지난 종가로 그린 표입니다 · 앞날 값은 셈하지 않습니다'),
    foot(manifest ?? state.manifest)));
}
