/* ATLAS 11 · 출목표 모양 — 오른 회사들의 출목표에 많이 보이는 모양을 찾아, 그 모양을 모두 가진 칸을 반짝이게
   2026-10-05 13:53 사장님 「이렇게 출목표를 보면 상승할 때에 묘한 공통점들이 있을 거 아냐 있더라고 … 반짝반짝 반짝 해가지고
   바보도 알 수 있게끔 좀 그렇게 기획 좀 해 봐 그리고 만들어 봐」
   · 후보 모양 8가지는 표(road.js 큰길)에 보이는 그대로 센다 — 동그라미 수 · 줄 길이 · 하루 동그라미 수 · 끝 줄 색
     (줄 = 같은 색 동그라미가 끊김 없이 이어진 덩어리 · 한 칸 = 하루 1%, 크게 움직이는 회사는 2%·3%·5%)
   · 「오른 회사」 = 지난 20거래일 많이 오른 순 위 20%(365곳이면 1위~73위) — 나머지와 견준다
     오른 회사의 50% 넘게 가졌고 나머지보다 10%p 넘게 많이 가진 모양 = 공통 모양(예비 탭 「공통점」과 같은 잣대 · 셋이 안 되면 차이가 큰 순으로 셋까지)
   · 반짝 = 오늘의 공통 모양을 모두 가진 칸 — 지난 20거래일 모양을 견준 것일 뿐 앞날을 맞히지 않는다
     (2026-10-04 15:37 「이제 예측을 하지 않는다 … 표현하지 마라」) · 화면 그리기 없이 셈만(검사기·시험이 따로 불러 씀) */
import {riseDesc} from './family.js';
import {roadOf} from './road.js';

/** 줄 — 같은 색 동그라미가 끊김 없이 이어진 덩어리(표에서 한 줄 + 용꼬리) */
const runsOf = road => { const out = []; for (const c of road.cells) { const l = out.at(-1); if (l && l.side === c.side) l.n++; else out.push({side: c.side, n: 1}); } return out; };
/** 하루마다 그 색 동그라미 수 */
const perDay = (road, side) => { const m = new Map(); for (const c of road.cells) if (c.side === side) m.set(c.day, (m.get(c.day) ?? 0) + 1); return [...m.values()]; };
/** 최근 5거래일 그 색 동그라미 수 */
const recentOf = (road, side) => road.cells.filter(c => c.side === side && c.day >= road.days - road.recentDays).length;

/** 후보 모양 여덟 — 이름은 표에 보이는 그대로 · short = 맨 위 상자 그림 밑 짧은 이름 · 글은 셈 그대로 */
export const SHAPES = [
  {id: 'longRed', name: '긴 빨강 줄', short: '긴 빨강 줄', text: '빨강 동그라미 6개 이상이 끊김 없이 이어짐(한 줄을 꽉 채움)', test: r => runsOf(r).some(x => x.side === 'up' && x.n >= 6)},
  {id: 'redTwice', name: '빨강이 파랑의 2배', short: '빨강 2배', text: '빨강 동그라미가 파랑의 2배 이상', test: r => r.all.up > 0 && r.all.up >= 2 * r.all.down},
  {id: 'bigRedDay', name: '하루 빨강 5개', short: '하루 빨강 5개', text: '하루에 빨강 동그라미 5개 이상인 날이 있음', test: r => perDay(r, 'up').some(n => n >= 5)},
  {id: 'recentRed', name: '끝 5일 빨강', short: '끝 5일 빨강', text: '최근 5거래일 빨강이 파랑보다 2개 이상 많음', test: r => recentOf(r, 'up') >= recentOf(r, 'down') + 2},
  {id: 'lastRed', name: '끝 줄 빨강', short: '끝 줄 빨강', text: '맨 오른쪽 끝 줄(가장 최근 줄)이 빨강', test: r => r.cells.at(-1)?.side === 'up'},
  {id: 'shortBlue', name: '짧은 파랑 줄', short: '짧은 파랑', text: '파랑 줄이 모두 2개 이하', test: r => { const rs = runsOf(r); return rs.some(x => x.side === 'up') && rs.every(x => x.side !== 'down' || x.n <= 2); }},
  {id: 'noBigBlue', name: '큰 파랑 날 없음', short: '큰 파랑 없음', text: '하루에 파랑 동그라미 3개 이상인 날이 없음', test: r => r.cells.length > 0 && perDay(r, 'down').every(n => n < 3)},
  {id: 'redCols', name: '빨강 줄이 더 많음', short: '빨강 줄 많음', text: '빨강 줄 수가 파랑 줄 수보다 많음', test: r => { const rs = runsOf(r); return rs.filter(x => x.side === 'up').length > rs.filter(x => x.side === 'down').length; }},
];
/** 그림 표(작은 출목표) — [줄, 칸, 색] · mark = 눈여겨볼 줄 범위 [처음, 끝] */
export const SHAPE_PICS = {
  longRed: {cells: [[0, 0, 'down'], [0, 1, 'down'], [1, 0, 'up'], [1, 1, 'up'], [1, 2, 'up'], [1, 3, 'up'], [1, 4, 'up'], [1, 5, 'up'], [2, 5, 'up'], [3, 0, 'down']], mark: [1, 2]},
  redTwice: {cells: [[0, 0, 'up'], [0, 1, 'up'], [0, 2, 'up'], [1, 0, 'down'], [2, 0, 'up'], [2, 1, 'up'], [2, 2, 'up'], [3, 0, 'down'], [4, 0, 'up'], [4, 1, 'up']], mark: null},
  bigRedDay: {cells: [[0, 0, 'down'], [1, 0, 'up'], [1, 1, 'up'], [1, 2, 'up'], [1, 3, 'up'], [1, 4, 'up'], [2, 0, 'down'], [3, 0, 'up']], mark: [1, 1]},
  recentRed: {cells: [[0, 0, 'up'], [0, 1, 'up'], [1, 0, 'down'], [1, 1, 'down'], [2, 0, 'up'], [3, 0, 'down'], [4, 0, 'up'], [4, 1, 'up'], [4, 2, 'up'], [5, 0, 'down'], [6, 0, 'up'], [6, 1, 'up']], mark: [4, 6]},
  lastRed: {cells: [[0, 0, 'down'], [0, 1, 'down'], [1, 0, 'up'], [1, 1, 'up'], [2, 0, 'down'], [2, 1, 'down'], [2, 2, 'down'], [3, 0, 'up'], [3, 1, 'up']], mark: [3, 3]},
  shortBlue: {cells: [[0, 0, 'up'], [0, 1, 'up'], [0, 2, 'up'], [1, 0, 'down'], [2, 0, 'up'], [2, 1, 'up'], [3, 0, 'down'], [3, 1, 'down'], [4, 0, 'up'], [4, 1, 'up'], [4, 2, 'up']], mark: null},
  noBigBlue: {cells: [[0, 0, 'up'], [0, 1, 'up'], [1, 0, 'down'], [2, 0, 'up'], [2, 1, 'up'], [2, 2, 'up'], [3, 0, 'down'], [4, 0, 'up']], mark: null},
  redCols: {cells: [[0, 0, 'up'], [1, 0, 'down'], [1, 1, 'down'], [2, 0, 'up'], [3, 0, 'down'], [4, 0, 'up'], [5, 0, 'down'], [6, 0, 'up']], mark: null},
};
export const SHAPE_TOP = 0.2, SHAPE_MIN = 0.5, SHAPE_GAP = 0.10;

/** 판 하나의 태양 셈 — 화면마다 다시 세지 않게 판마다 한 번(2026-10-05 15:24 「잡스가 … 36가지」 B — 태양을 모든 화면에 잇기)
   불장 · 업종 · 업종 화면 · 회사 · 예비 · 오름 상위 · 출목표가 모두 같은 셈을 쓴다(한 개념 · 한 셈) */
const sunMemo = new WeakMap();
export function sunOf(board) {
  if (!board) return shapeBoard([]);
  let r = sunMemo.get(board); if (!r) { r = shapeBoard(board.companies ?? []); sunMemo.set(board, r); }
  return r;
}
/** 업종(또는 회사 묶음) 안 태양 수 */
export const sunCount = (shp, codes) => codes.filter(code => shp.sparkle.has(code)).length;

/** 판의 회사들 → {topN, restN, traits, common(후보 차례 그대로), hits(code → 가진 공통 모양), sparkle(공통 모양을 모두 가진 code)} */
export function shapeBoard(companies) {
  const ranked = [...(companies ?? [])].sort(riseDesc), topN = Math.round(ranked.length * SHAPE_TOP);
  const roads = new Map(ranked.map(c => [c.code, roadOf(c.c)]));
  const top = ranked.slice(0, topN), rest = ranked.slice(topN);
  const yes = (xs, s) => xs.filter(c => s.test(roads.get(c.code))).length;
  const traits = SHAPES.map(s => { const a = yes(top, s), b = yes(rest, s), sa = top.length ? a / top.length : 0, sb = rest.length ? b / rest.length : 0;
    return {id: s.id, name: s.name, short: s.short, text: s.text, top: {yes: a, n: top.length}, rest: {yes: b, n: rest.length}, topShare: sa, gap: sa - sb, common: false}; });
  let picked = traits.filter(t => t.topShare > SHAPE_MIN && t.gap > SHAPE_GAP);
  if (top.length && picked.length < 3) picked = [...picked, ...traits.filter(t => !picked.includes(t) && t.gap > 0).sort((a, b) => b.gap - a.gap).slice(0, 3 - picked.length)];
  const common = SHAPES.map(s => s.id).filter(id => picked.some(t => t.id === id));
  for (const t of traits) t.common = common.includes(t.id);
  const tests = common.map(id => SHAPES.find(s => s.id === id));
  const hits = new Map(ranked.map(c => [c.code, tests.filter(s => s.test(roads.get(c.code))).map(s => s.id)]));
  const sparkle = new Set(common.length ? ranked.filter(c => hits.get(c.code).length === common.length).map(c => c.code) : []);
  return {topN, restN: rest.length, traits, common, hits, sparkle};
}
