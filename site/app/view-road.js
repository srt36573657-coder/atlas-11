/* ATLAS 11 · 출목표 한 판(#/road) — 예측 없음 · 180곳의 출목표를 한 화면에
   2026-10-04 22:12 사장님 「너 에볼루션에 바카라 출몰표 한곳에 모여 있는것도 잡스라면 그리고 애플이라면 해서 추가로 더 만들어」
   카지노 로비는 탁자마다 표를 늘어놓기만 한다 — 탁자끼리는 서로 상관없고, 어떤 탁자가 어떤 흐름인지는 사람이 하나씩 읽어야 한다.
   여기서는 두 가지로 모은다(단추 둘 · 고른 것은 이 기기에 기억):
     ① 업종별 — 36칸 판 차례 그대로 업종 5곳을 나란히(회사는 탁자와 달리 같은 업종끼리 함께 움직인다 — 다섯이 함께 빨간지 한눈에)
     ② 흐름별 — 180곳의 표를 우리가 먼저 읽어 「흐름이 같은 것끼리」 묶는다(흐름 = 처음 15거래일과 최근 5거래일의 빨강·파랑 수 · road.js 아홉 칸 표 그대로)
   칸: 이름 · 20거래일 변화 · (흐름별이면 업종) · 선 그래프(같은 20거래일 종가) · 출목표 · 지금 며칠째 같은 쪽인가 · 수급(외국인·기관 5거래일 합) · 이름이 든 최근 기사 1건
       — 22:51 「출목표만 있으면 않돼 그래프로 있어야 해 그리고 그 회사들 뉴스와 수급도」 · 누르면 회사 화면(되돌아오면 보던 자리)
   지난 종가로 그린 표일 뿐 앞날 값은 없다 — 카지노 화면의 「다음 예상」 같은 칸은 두지 않는다
   2026-10-05 02:44 「잡스였다면」 개혁(보고서 「잡스였다면 ATLAS 개혁 공부」):
     · 칸 두 층 — 큰 층: 이름 · 20거래일 변화 · 선 그래프(누르지 않아도 보임) / 작은 층: 출목표 · 「20거래일 중 오른 날 n일」 · 수급 한 줄 · 기사 한 줄
     · 「오름 2일째」 같은 연속 글은 뺐다 — 한국 카지노 1,797만 판 자료에서 같은 결과를 세로로 쌓은 점수판은 연속을 따라 더 크게 걸게 했다(Muto 외 2025)
     · 오른 날 = 빈 동그라미 · 내린 날 = 찬 동그라미(색을 못 가려도 읽힘) · 흐름 이름은 지난 두 구간 그대로(「내림 → 오름」 — 앞 15거래일 → 끝 5거래일)
     · 묶음 이름이 화면 위에 붙어 따라온다(여기가 어디인가 — 애플 WWDC17 길 찾기)
   2026-10-05 10:24 「잡스라면 … 36가지」 → 「만들어 줘」: 업종별에 큰 갈래 단추(누르면 그 갈래 업종 묶음만 · 「모두」로 되돌림 · 이 기기에 기억)
     21번(작은 칸 모아 보기)은 하지 않았다 — 10/4 22:51 「그래프로 있어야 해 그리고 그 회사들 뉴스와 수급도」 · 10/5 00:26 「처음 보이는 곳에 바로 그래프도」와 부딪혀서.
     칸은 그대로 두고, 365장을 큰 갈래로 좁혀 보는 길을 더했다
   2026-10-05 11:36 사장님 「출목표 탭을 클릭하면 가장 상승한순으로 배치해줘」 → 「모든 배치가 가장 많이 상승한순으로 배치해줘」:
     · 묶는 법 셋 — 「오른 순」(처음 · 365곳을 지난 20거래일 많이 오른 차례로 · 20곳씩 끊어 「1위~20위」) · 업종별 · 흐름별
     · 아래 탭 「출목표」를 다른 탭에서 누르면 늘 「오른 순」 맨 위로(app.js) · 회사 화면에서 되돌아오면 보던 묶는 법 · 자리 그대로
     · 업종별: 업종 안 회사도 오른 순(옛: 시가총액 순) · 흐름별: 흐름 묶음을 묶음 평균이 큰 순(옛: 오름 쪽부터 정한 차례) · 큰 갈래 단추도 갈래 평균이 큰 순
   2026-10-05 12:28 사장님 「출목표를 클릭하면 지금 365개 다 나오잖아 불편해 어떻게든 그 안에 탭을 더 만들어서 편하면서도 직관적으로 만들어봐」:
     · 묶는 법 셋 아래에 탭 한 줄 — 한 번에 한 탭만 그린다(옛: 365장을 한 화면에 모두)
       오른 순 = 20곳씩 「1위~20위」 「21위~40위」 … · 업종별 = 큰 갈래 12개(갈래 평균이 큰 순 · 옛 「큰 갈래 단추」와 「모두」를 탭이 대신)
       흐름별 = 흐름 10가지(묶음 평균이 큰 순 · 옛 흐름 목록을 탭이 대신 · 묶음 평균 선은 그 탭 머리에)
     · 한 탭이 45곳을 넘으면 20곳씩 「더 보기」(오름 → 오름 90곳 같은 큰 흐름) · 맨 아래 넘김 단추(「2번째 탭 · 21위~40위 보기 ›」)
     · 휴대폰에서는 탭 줄을 옆으로 밀어 봄(고른 탭이 가운데로) · 넓은 화면에서는 여러 줄 · 화살표 글쇠로도 넘김
     · 고른 탭은 이 기기에 기억(회사 화면에서 되돌아오면 보던 탭 · 자리 그대로) · 다른 아래 탭에서 들어오면 늘 「오른 순」 1위~20위 맨 위(app.js → resetRoad)
   2026-10-05 13:53 사장님 「이렇게 출목표를 보면 상승할 때에 묘한 공통점들이 있을 거 아냐 … 반짝반짝 반짝 해가지고 바보도 알 수 있게끔 … 기획 좀 해 봐 그리고 만들어 봐」:
     · 오른 순 위 20%의 출목표에 많이 보이는 모양(shapes.js — 후보 8가지 · 예비 탭과 같은 잣대)을 모두 가진 칸이 반짝인다(해 빛깔 테 · 빛이 한 번씩 지나감 · 「☀ 오른 모양 n가지」)
     · 맨 위 「☀ 반짝이는 칸 n곳」 상자 — 모양마다 작은 출목표 그림 · 펼치면 후보 8가지가 오른 곳 · 나머지에서 몇 %인지
     · 탭마다 반짝 수(「☀17곳」) — 어느 탭에 반짝이는 칸이 있는지 · 움직임 줄이기 설정이면 빛은 지나가지 않고 해도 멈춤
   2026-10-05 14:30 사장님 「모양을 뜨거운 태양으로 하셔」: 반짝 표시의 별을 뜨거운 태양(sunIcon — 빛살 12개가 천천히 돌고 불꽃 테가 숨 쉬듯)으로 · 테와 빛도 해 빛깔(주황)
     · 지난 20거래일 모양을 견준 것일 뿐 앞날을 맞히지 않는다(2026-10-04 15:37) */
import {h, korDate, pct, finite, signCls} from './util.js';
import {state, loadBoard, prefs} from './store.js';
import {roadOf, roadSvg, STORY} from './road.js';
import {foot, sparkSvg, sparkScale, scaleText, flowLine, newsLine, meanRets, meanSpark, sv} from './parts.js';
import {upLine} from './view-home.js';
import {familyOf, familiesByRise, riseDesc, meanOf} from './family.js';
import {SHAPES, SHAPE_PICS, shapeBoard} from './shapes.js';

/** 흐름 묶음 차례 — 최근 5거래일 오름 쪽부터 내림 쪽까지(처음 15거래일은 오름 → 비슷 → 내림) · 둘 다 잠잠하면 「거의 안 움직임」 */
export const FLOW_ORDER = ['up-up', 'flat-up', 'down-up', 'up-flat', 'flat-flat', 'still', 'down-flat', 'up-down', 'flat-down', 'down-down'];
const SIDE_WORD = {up: '오른 날 동그라미가 많음', flat: '오른 날·내린 날 동그라미가 비슷하거나 적음', down: '내린 날 동그라미가 많음'};
const calm = x => x === 'still' ? 'flat' : x;
/** 가장 많은 값(같으면 늦은 날) — 한 회사 종가가 늦어도 기간 글이 흔들리지 않게(처음 화면과 같은 셈) */
const mode = xs => { const n = new Map(); for (const x of xs) if (x) n.set(x, (n.get(x) ?? 0) + 1); return [...n].sort((a, b) => b[1] - a[1] || (a[0] < b[0] ? 1 : -1))[0]?.[0] ?? null; };
/** 한 회사의 흐름 열쇠(road.js roadStory 와 같은 규칙) */
export const flowKey = road => road.before.side === 'still' && road.now.side === 'still' ? 'still' : `${calm(road.before.side)}-${calm(road.now.side)}`;
export const flowText = (key, days = 20) => key === 'still' ? `${days}거래일 내내 거의 안 움직임` : STORY[key.split('-')[0]][key.split('-')[1]];
const nowSide = key => key === 'still' ? 'flat' : key.split('-')[1];
/** 20거래일 가운데 오른 날 수(±0.1% 안쪽은 보합으로 셈 · road.js) — 연속 글(「오름 n일째」) 대신 */
export const upDaysText = road => `${road.days}거래일 중 오른 날 ${road.ups}일`;
/** 수급·기사를 모은 곳 수 — 다 모으지 못했으면 몇 곳인지와 언제 모은 것인지 적는다 */
function ctxNote(cs) {
  const got = cs.filter(c => c.brief && !c.brief.missing?.includes('수급') && !c.brief.missing?.includes('기사')).length, day = cs.map(c => c.brief?.day).filter(Boolean).sort().at(-1);
  return h('p', {class: 'f-ctx small', 'data-got': got}, got === cs.length ? `수급·기사: ${cs.length}곳 모두${day ? ` · ${korDate(day)} 기준` : ''}` : `수급·기사: ${cs.length}곳 가운데 ${got}곳만 모았음${day ? `(${korDate(day)} 기준)` : ''} · 나머지 ${cs.length - got}곳은 다음 관측 수집 때 채움`);
}
/** 묶는 법 셋(앞이 처음 보이는 것) — 「오른 순」이 처음(2026-10-05 11:36) */
export const ROAD_MODES = [{id: 'rise', text: '오른 순'}, {id: 'ind', text: '업종별'}, {id: 'flow', text: '흐름별'}];
/** 「오른 순」 한 묶음 칸 수 — 20곳씩(1위~20위 · 21위~40위 …) · 묶음마다 선 그래프 같은 눈금 */
export const RISE_CHUNK = 20;
/** 이 기기에 기억하는 묶는 법 — 옛 열쇠(roadView)는 「업종별」이 처음이던 때 것이라 새 열쇠로(옛 값을 따르지 않게) */
export const ROAD_VIEW_KEY = 'roadView2';

/** 칸 하나 — spk = 반짝(오른 회사 출목표의 공통 모양 n가지를 모두 가짐)이면 그 n · 아니면 0 */
function tile(c, road, g, scale, spk = 0) {
  return h('a', {class: 'f-tile' + (spk ? ' sparkle' : ''), href: '#/stock/' + c.code, 'data-code': c.code, 'data-sparkle': spk ? String(spk) : null},
    h('span', {class: 'f-top'}, h('span', {class: 'f-name'}, c.name), h('b', {class: 'chg20 f-chg ' + (signCls(c.change20) || 'flat')}, finite(c.change20) ? pct(c.change20, 1) : '없음')),
    g ? h('span', {class: 'f-ind'}, g.label) : null,
    sparkSvg(c, scale),
    roadSvg(road, {minCols: 20}),
    h('span', {class: 'f-cap'}, spk ? h('span', {class: 'f-spk-row'}, h('span', {class: 'f-spk'}, sunIcon(), ` 오른 모양 ${spk}가지`)) : null,
      h('span', {class: 'f-st'}, upDaysText(road)), road.unit > 0.01 ? h('span', {class: 'f-unit'}, `동그라미 하나 = ${Math.round(road.unit * 100)}%`) : null),
    flowLine(c.brief),
    newsLine(c.brief));
}

/** 뜨거운 태양(2026-10-05 14:30 사장님 「모양을 뜨거운 태양으로 하셔」) — 반짝 칸 표 · 탭 반짝 수 · 맨 위 상자의 표시(옛 별 모양 대신)
   노란 해 + 주황 불꽃 테 + 빛살 12개(길고 짧게 번갈아) · 빛살은 천천히 돌고 불꽃 테는 숨 쉬듯(움직임 줄이기면 멈춤 · style.css) · 그림이라 글로 읽히지 않음(aria-hidden) */
function sunIcon(cls = '') {
  const rays = [];
  for (let k = 0; k < 12; k++) { const a = k * Math.PI / 6, r2 = k % 2 ? 9.4 : 11.3, c = Math.cos(a), sn = Math.sin(a);
    rays.push(sv('line', {x1: (12 + 7.3 * c).toFixed(2), y1: (12 + 7.3 * sn).toFixed(2), x2: (12 + r2 * c).toFixed(2), y2: (12 + r2 * sn).toFixed(2)})); }
  return sv('svg', {class: 'sun' + (cls ? ' ' + cls : ''), viewBox: '0 0 24 24', 'aria-hidden': 'true', focusable: 'false'},
    sv('g', {class: 'sun-rays'}, ...rays), sv('circle', {class: 'sun-glow', cx: 12, cy: 12, r: 6.6}), sv('circle', {class: 'sun-core', cx: 12, cy: 12, r: 4.9}));
}
/** 모양 그림 — 작은 출목표(8칸 × 6줄) · 눈여겨볼 줄은 옅은 해 빛깔 바탕(SHAPE_PICS) */
function shapePic(id) {
  const P = SHAPE_PICS[id]; if (!P) return null;
  const cs = 8, cols = 8, rows = 6, W = cols * cs, H = rows * cs;
  let d = ''; for (let c = 0; c <= cols; c++) d += `M${c * cs} 0V${H}`; for (let r = 0; r <= rows; r++) d += `M0 ${r * cs}H${W}`;
  return sv('svg', {class: 'road spk-pic', viewBox: `0 0 ${W} ${H}`, 'aria-hidden': 'true'},
    P.mark ? sv('rect', {class: 'spk-mark', x: P.mark[0] * cs, y: 0, width: (P.mark[1] - P.mark[0] + 1) * cs, height: H, rx: 2}) : null,
    sv('g', {class: 'road-grid'}, sv('path', {d})),
    ...P.cells.map(([c, r, side]) => sv('circle', {class: 'bead ' + side, cx: c * cs + cs / 2, cy: r * cs + cs / 2, r: 2.8})));
}
const pcOf = x => `${x.n ? Math.round(x.yes / x.n * 100) : 0}%`;
/** 맨 위 「☀ 반짝이는 칸」 상자 — 무엇이 반짝이나(모양 그림) · 펼치면 후보 8가지와 고른 법 */
function sparkleBox(shp) {
  const commonT = shp.common.map(id => shp.traits.find(t => t.id === id));
  if (!commonT.length) return null;
  return h('section', {class: 'f-spk-box', 'aria-label': `반짝이는 칸 ${shp.sparkle.size}곳`},
    h('p', {class: 'f-spk-h'}, sunIcon('sun-big'), ` 반짝이는 칸 ${shp.sparkle.size}곳`),
    h('p', {class: 'f-spk-t'}, `지난 20거래일 많이 오른 ${shp.topN}곳(오른 순 1위~${shp.topN}위)의 출목표에 많이 보이는 모양 ${commonT.length}가지를 모두 가진 곳`),
    h('ul', {class: 'f-spk-list'}, ...commonT.map(t => h('li', {class: 'f-spk-li', 'data-shape': t.id}, shapePic(t.id), h('span', {class: 'f-spk-n'}, t.short)))),
    h('details', {class: 'f-spk-how'}, h('summary', null, `모양마다 몇 %인가 · 후보 ${SHAPES.length}가지`),
      h('ul', {class: 'f-spk-all'}, ...shp.traits.map(t => h('li', {'data-shape': t.id, 'data-common': String(t.common)}, h('b', null, `${t.common ? '✓' : '·'} ${t.name}`), ` — ${t.text} · 오른 ${t.top.n}곳 가운데 ${t.top.yes}곳(${pcOf(t.top)}) · 나머지 ${t.rest.n}곳 가운데 ${t.rest.yes}곳(${pcOf(t.rest)})`))),
      h('p', null, `✓ 공통 모양 = 오른 ${shp.topN}곳의 50% 넘게 가졌고 나머지보다 10%p 넘게 많이 가진 모양 · 반짝 = 그 ${commonT.length}가지를 모두 가진 곳`),
      h('p', null, '지난 20거래일 출목표 모양을 견준 것일 뿐 앞날을 맞히지 않습니다')));
}

/** 출목표 안의 탭 — 한 탭이 45곳을 넘으면 20곳씩 「더 보기」(2026-10-05 12:28) */
export const MORE_STEP = 20, PAGE_MAX = 45;
const tabKey = m => 'roadTab:' + m;
/** 「더 보기」로 펼친 칸 수 — 회사 화면에 갔다 돌아와도 같은 자리(창을 닫으면 사라짐) */
const shownMemo = new Map();
/** 다른 아래 탭에서 「출목표」로 들어올 때(app.js) — 늘 「오른 순」 첫 탭(1위~20위) 맨 위 */
export function resetRoad() { prefs.set(ROAD_VIEW_KEY, 'rise'); for (const m of ROAD_MODES) prefs.set(tabKey(m.id), null); shownMemo.clear(); }
/** 탭 줄에 쓰는 흐름 이름(「20거래일 내내 거의 안 움직임」은 탭에서 짧게) */
const flowChip = key => key === 'still' ? '거의 안 움직임' : flowText(key);

export async function renderRoad(main, {manifest} = {}) {
  const board = await loadBoard();
  const groups = board.groups ?? [], groupOf = new Map(groups.map(g => [g.id, g]));
  const items = board.companies.map(c => { const road = roadOf(c.c); return {c, road, key: flowKey(road), g: groupOf.get(c.group?.id) ?? c.group ?? null}; });
  const itemOf = new Map(items.map(x => [x.c.code, x])), byRise = (a, b) => riseDesc(a.c, b.c);
  const ranked = [...items].sort(byRise); // 365곳 오른 순
  const by = new Map(FLOW_ORDER.map(k => [k, []]));
  for (const x of ranked) by.get(x.key).push(x); // 흐름마다 오른 순 그대로
  const days = items[0]?.road.days ?? 20, before = items[0]?.road.beforeDays ?? 15, recent = items[0]?.road.recentDays ?? 5;
  const flows = FLOW_ORDER.map(k => ({key: k, text: flowText(k, days), items: by.get(k)})).filter(f => f.items.length)
    .map(f => ({...f, avg: meanOf(f.items.map(x => x.c.change20))})).sort((a, b) => (Number.isFinite(b.avg) ? b.avg : -Infinity) - (Number.isFinite(a.avg) ? a.avg : -Infinity)); // 묶음 평균이 큰 순
  const fams = familiesByRise(groups), n = items.length;
  const shp = shapeBoard(board.companies), nCommon = shp.common.length, spkOf = c => shp.sparkle.has(c.code) ? nCommon : 0; // 반짝(13:53)
  const from = mode(board.companies.map(c => c.cFrom)), to = mode(board.companies.map(c => c.date)) ?? board.asOf;
  const reduce = () => matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth';
  // 흐름마다 묶음 평균 선 — 같은 날 종가까지 있는 회사만 평균(늦은 종가 회사는 빼고 셈) · 모든 흐름이 같은 눈금(탭을 넘겨도 견줄 수 있게)
  //   2026-10-05 00:26 「출목표 처음 보이는 곳에 그곳에 바로 그래프도 보여야 한다는거야 클릭해서 들어가는게 아니라 그래야 직관이잖아」 — 탭 머리에 바로
  const means = new Map(flows.map(f => [f.key, meanRets(f.items.map(x => x.c).filter(c => c.date === to))])), msc = sparkScale([]);
  for (const r of means.values()) for (const v of r) { msc.lo = Math.min(msc.lo, v); msc.hi = Math.max(msc.hi, v); }

  // 탭 = {id, label(탭 줄 글), small(작은 글), cls, lead(탭 맨 위 한 줄), parts: [{sec: 머리만 있는 묶음, items, withInd, sc}], say}
  // ⓪ 오른 순 — 20곳씩 · 칸마다 업종 이름 · 탭마다 선 그래프 같은 눈금
  const riseTabs = () => { const out = []; for (let i = 0; i < ranked.length; i += RISE_CHUNK) { const xs = ranked.slice(i, i + RISE_CHUNK), a = i + 1, b = i + xs.length, sc = sparkScale(xs.map(x => x.c));
    out.push({id: 'r' + a, label: `${a}위~${b}위`, say: xs.slice(0, 3).map((x, k) => `${a + k}위 ${x.c.name} ${pct(x.c.change20, 1)}`).join(', '),
      parts: [{items: xs, withInd: true, sc, sec: () => h('section', {class: 'f-sec', id: 'f-r' + a, 'data-rank': String(a), 'aria-label': `오른 순 ${a}위~${b}위`},
        h('h2', {class: 't-h2'}, `${a}위~${b}위`, h('small', null, ` · ${xs.length}곳`)),
        h('p', {class: 't-sub'}, `지난 20거래일 많이 오른 차례 · ${a}위 ${pct(xs[0].c.change20, 1)} ~ ${b}위 ${pct(xs.at(-1).c.change20, 1)} · ${scaleText(sc)}`),
        h('div', {class: 'f-grid'}))}]}); } return out; };
  // ① 업종별 — 큰 갈래 하나가 탭 하나(갈래 평균이 큰 순) · 그 안 업종은 판 차례(지난 20거래일 평균이 큰 업종부터) · 업종 안 회사도 오른 순
  const indTabs = () => fams.map(f => ({id: f.fam.id, label: f.fam.label, small: finite(f.avg) ? pct(f.avg, 1) : '없음', cls: signCls(f.avg) || 'flat',
    lead: `${f.fam.label} · 업종 ${f.groups.length}개 · ${f.groups.reduce((t, g) => t + g.codes.length, 0)}곳 · 갈래 평균 ${finite(f.avg) ? pct(f.avg, 1) : '없음'}`,
    say: f.groups.slice(0, 3).map(g => `${groups.indexOf(g) + 1}위 ${g.label} ${pct(g.change20, 1)}`).join(', '),
    parts: f.groups.map(g => { const k = groups.indexOf(g), xs = g.codes.map(code => itemOf.get(code)).filter(Boolean).sort(byRise), sc = sparkScale(xs.map(x => x.c));
      return {items: xs, withInd: false, sc, sec: () => h('section', {class: 'f-sec', id: 'f-' + g.id, 'data-group': g.id, 'data-family': familyOf(g.label).id, 'aria-label': `${k + 1}위 ${g.label} ${g.codes.length}곳`},
        h('h2', {class: 'f-h'}, h('span', {class: 'f-h-rank'}, `${k + 1}위`), h('span', {class: 'f-h-name'}, g.label), g.hot ? h('span', {class: 't-fire'}, '불장') : null,
          h('b', {class: 'chg20 f-h-chg ' + (signCls(g.change20) || 'flat')}, finite(g.change20) ? pct(g.change20, 1) : '없음')),
        h('p', {class: 't-sub'}, `${xs.length}곳 지난 20거래일 평균 · ${upLine(g)} · ${scaleText(sc)}`),
        h('div', {class: 'f-grid'}))}; })}));
  // ② 흐름별 — 흐름 하나가 탭 하나(묶음 평균이 큰 순) · 탭 머리에 묶음 평균 선 · 칸은 오른 순
  const flowTabs = () => flows.map(f => { const sc = sparkScale(f.items.map(x => x.c)), r = means.get(f.key), last = r.length ? pct(r.at(-1), 1) : '없음';
    return {id: f.key, label: flowChip(f.key), small: `${f.items.length}곳`, say: `${f.text}, ${f.items.length}곳, 묶음 평균 ${pct(f.avg, 1)}`,
      parts: [{items: f.items, withInd: true, sc, sec: () => h('section', {class: 'f-sec', id: 'f-' + f.key, 'data-flow': f.key, 'aria-label': `${f.text} ${f.items.length}곳`},
        h('h2', {class: 't-h2'}, f.text, h('small', null, ` · ${f.items.length}곳`)),
        h('p', {class: 't-sub'}, `${f.key === 'still' ? `${days}거래일 동안 동그라미가 거의 없음` : `앞 ${before}거래일: ${SIDE_WORD[f.key.split('-')[0]]} → 끝 ${recent}거래일: ${SIDE_WORD[f.key.split('-')[1]]}`} · 지난 20거래일 많이 오른 순 · ${scaleText(sc)}`),
        h('p', {class: 'f-mean'}, meanSpark(r, msc, `${f.text} ${f.items.length}곳 평균 선 · 지난 ${Math.max(0, r.length - 1)}거래일 · 첫날 대비 ${last}`),
          h('span', {class: 'f-mean-t small'}, `묶음 평균 선 · 첫날 대비 ${last} · 흐름 ${flows.length}가지 같은 눈금(${pct(msc.lo, 0)} ~ ${pct(msc.hi, 0)})`)),
        h('div', {class: 'f-grid'}))}]}; });
  const TABS = {rise: riseTabs(), ind: indTabs(), flow: flowTabs()};
  for (const ts of Object.values(TABS)) for (const t of ts) t.spk = t.parts.reduce((k, p) => k + p.items.filter(x => shp.sparkle.has(x.c.code)).length, 0); // 탭마다 반짝 수
  const HINT = {rise: ts => `탭 ${ts.length}개 · 20곳씩 · 지난 20거래일 많이 오른 차례`,
    ind: ts => `큰 갈래 탭 ${ts.length}개 · 갈래 평균이 큰 순 · 갈래 이름은 ATLAS가 업종 이름을 보고 묶은 것`,
    flow: ts => `흐름 탭 ${ts.length}가지 · 묶음 평균(지난 20거래일 변화)이 큰 순 · 앞 ${before}거래일 → 끝 ${recent}거래일의 오른 날·내린 날 동그라미 수로 나눔`};

  let view = prefs.get(ROAD_VIEW_KEY, 'rise'); if (!TABS[view]) view = 'rise';
  const tabOf = m => { const id = prefs.get(tabKey(m), null), ts = TABS[m]; return ts.find(t => t.id === id) ?? ts[0]; };
  let cur = tabOf(view), shown = 0;

  const body = h('div', {class: 'f-body', id: 'f-body', role: 'tabpanel'});
  const hint = h('p', {class: 't-sub f-tabs-h'});
  const strip = h('div', {class: 'f-tabs', role: 'tablist', 'data-scroll': 'x'}); // 일부러 옆으로 밀어 보는 줄(또렷함 검사가 「가려진 글」로 세지 않음)
  const segs = ROAD_MODES.map(m => h('button', {class: 'f-seg-b', type: 'button', 'data-mode': m.id, 'aria-pressed': 'false', onclick: () => { if (view !== m.id) { view = m.id; prefs.set(ROAD_VIEW_KEY, view); cur = tabOf(view); draw(); } }},
    m.text, h('small', null, m.id === 'rise' ? ` ${n}곳` : m.id === 'ind' ? ` ${groups.length}개` : ` ${flows.length}가지`)));
  const segBox = h('div', {class: 'f-seg', role: 'group', 'aria-label': '묶는 법'}, ...segs);
  const say = () => { const ts = TABS[view], i = ts.indexOf(cur); state.summary = `${korDate(to)} 종가 기준. 출목표 ${n}곳, ${ROAD_MODES.find(m => m.id === view).text}, 탭 ${ts.length}개 가운데 ${i + 1}번째 ${cur.label}. ${cur.say}.${cur.spk ? ` 반짝이는 칸 ${cur.spk}곳.` : ''}`; };
  /** 고른 탭을 탭 줄 가운데로(화면은 위아래로 움직이지 않게 줄만 옆으로) */
  const centerTab = () => { const b = strip.querySelector('[aria-selected="true"]'); if (b && strip.scrollWidth > strip.clientWidth + 1) strip.scrollLeft = Math.max(0, b.offsetLeft - (strip.clientWidth - b.offsetWidth) / 2); };
  const markTabs = () => { for (const b of strip.children) { const on = b.dataset.tab === cur.id; b.setAttribute('aria-selected', String(on)); b.tabIndex = on ? 0 : -1; } };
  function drawTabs() {
    strip.setAttribute('aria-label', HINT[view](TABS[view]));
    strip.replaceChildren(...TABS[view].map(t => h('button', {class: 'f-tab', type: 'button', role: 'tab', id: 'ft-' + t.id, 'data-tab': t.id, 'aria-controls': 'f-body', 'aria-selected': 'false', tabindex: '-1', onclick: () => pick(t, false)},
      h('span', {class: 'f-tab-l'}, t.label), t.small ? h('small', {class: 'f-tab-n' + (t.cls ? ' ' + t.cls : '')}, t.small) : null,
      t.spk ? h('small', {class: 'f-tab-s', 'aria-label': `반짝 ${t.spk}곳`}, sunIcon(), `${t.spk}곳`) : null)));
    markTabs();
  }
  /** 맨 아래 넘김 단추 — 「2번째 탭 · 21위~40위 보기 ›」 · 「‹ 1번째 탭 · 1위~20위」 */
  function pager() {
    const ts = TABS[view], i = ts.indexOf(cur), prev = ts[i - 1], next = ts[i + 1];
    return h('nav', {class: 'f-pager', 'aria-label': '탭 넘기기'},
      next ? h('button', {class: 'f-pg f-pg-next', type: 'button', 'data-to': next.id, onclick: () => pick(next, true)}, `${i + 2}번째 탭 · `, h('span', {class: 'f-nw'}, next.label), ' 보기 ›') : null,
      prev ? h('button', {class: 'f-pg f-pg-prev', type: 'button', 'data-to': prev.id, onclick: () => pick(prev, true)}, `‹ ${i}번째 탭 · `, h('span', {class: 'f-nw'}, prev.label)) : null,
      h('p', {class: 'f-pg-pos small'}, `탭 ${ts.length}개 가운데 ${i + 1}번째`));
  }
  /** 고른 탭 하나만 그린다 — 45곳이 넘으면 20곳씩(「더 보기」로 펼친 수는 기억) */
  function drawPage() {
    const total = cur.parts.reduce((t, p) => t + p.items.length, 0);
    shown = total <= PAGE_MAX ? total : Math.min(total, Math.max(MORE_STEP, shownMemo.get(view + ':' + cur.id) ?? MORE_STEP));
    body.dataset.mode = view; body.dataset.tab = cur.id; delete body.dataset.ready;
    const kids = cur.lead ? [h('p', {class: 't-sub f-lead'}, cur.lead)] : [];
    let k = 0;
    for (const p of cur.parts) {
      if (k >= shown) break;
      const sec = p.sec(), grid = sec.querySelector('.f-grid');
      for (const x of p.items) { if (k >= shown) break; grid.append(tile(x.c, x.road, p.withInd ? x.g : null, p.sc, spkOf(x.c))); k++; }
      kids.push(sec);
    }
    if (shown < total) kids.push(h('button', {class: 'f-more', type: 'button', onclick: () => more(total)}, '이 탭 ', h('span', {class: 'f-nw'}, `${shown + 1}위~${Math.min(total, shown + MORE_STEP)}위`), ' 더 보기', h('small', {class: 'f-nw'}, ` · 남은 ${total - shown}곳`)));
    kids.push(pager());
    body.replaceChildren(...kids);
    body.dataset.ready = '';
    say();
  }
  function more(total) {
    const was = shown; shownMemo.set(view + ':' + cur.id, Math.min(total, shown + MORE_STEP)); drawPage();
    body.querySelectorAll('.f-tile')[was]?.focus({preventScroll: true}); // 새로 붙은 첫 칸으로 초점(화면은 그대로)
  }
  function pick(t, fromBottom) {
    if (t !== cur) { cur = t; prefs.set(tabKey(view), t.id); markTabs(); drawPage(); }
    centerTab();
    if (fromBottom) { segBox.scrollIntoView({block: 'start', behavior: reduce()}); strip.querySelector('[aria-selected="true"]')?.focus({preventScroll: true}); }
  }
  // 화살표 글쇠로 탭 넘기기(왼쪽 · 오른쪽 · 처음 · 끝)
  strip.addEventListener('keydown', e => {
    const ts = TABS[view], i = ts.indexOf(cur), j = e.key === 'ArrowRight' ? i + 1 : e.key === 'ArrowLeft' ? i - 1 : e.key === 'Home' ? 0 : e.key === 'End' ? ts.length - 1 : null;
    if (j == null || !ts[j]) return; e.preventDefault(); pick(ts[j], false); strip.querySelector('[aria-selected="true"]')?.focus();
  });
  function draw() {
    for (const b of segs) b.setAttribute('aria-pressed', String(b.dataset.mode === view));
    hint.textContent = HINT[view](TABS[view]); drawTabs(); drawPage(); centerTab();
  }
  main.replaceChildren(h('div', {class: 'b-page f-page'},
    h('header', {class: 'b-head'},
      h('h1', {class: 'b-title', 'data-speak': ''}, `출목표 ${n}곳`),
      h('p', {class: 'b-when', 'data-speak': ''}, `지난 ${days}거래일 · ${from ? korDate(from) + '부터 ' : ''}${korDate(to)} 15:30 종가까지`),
      h('p', {class: 'f-key muted small'}, '칸마다 선 그래프 · 출목표(동그라미 하나 = 하루 1% · 빈 빨강 = 오른 날 · 찬 파랑 = 내린 날) · 수급 · 기사'),
      ctxNote(board.companies)),
    sparkleBox(shp),
    segBox, hint, strip, body,
    foot(manifest ?? state.manifest)));
  draw(); // 한 탭은 많아야 45곳이라 한꺼번에 그린다 — 되돌아올 때는 app.js 가 보던 자리로
}
