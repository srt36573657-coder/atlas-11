/* ATLAS 11 · 출목표(바카라 큰길 + 크기) — 판 곳곳에 같은 표를 그린다(지난 종가만 · 앞날 값 없음)
   2026-10-04 08:19 사장님 「바카라 그 표가 곳곳에 다 들어가 있게 해봐」 · 15:37 「이제 예측을 하지 않는다」 뒤에도 지난 오르내림 표로 남김
   규칙은 tests/atlas11/road.test.mjs 가 실제 종가(9/28 입력 사본 52종목)로 따로 센 값과 맞대어 본다
   · 하루 등락을 1% 단위로 반올림한 수만큼 동그라미(빨강 오름 · 파랑 내림) · 0.5% 안쪽 잔물결은 그리지 않음
   · 같은 쪽이 이어지면 아래로, 바뀌면 새 줄 · 여섯 칸이 차거나 막히면 오른쪽으로(용꼬리)
   · 아주 크게 움직이는 종목(1%로 24줄 넘음)만 한 칸을 2%·3%·5% 로 키우고 「하나 = ○%」로 적는다
   · 힘 저울 두 줄(처음 15일 · 최근 5일) → 흐름 한 마디(아홉 칸 표) — 지난 기록을 읽은 말
   색은 화면 글자색 체계(--up 빨강 · --down 파랑)를 CSS 로 입힌다 · 글 속 style 을 쓰지 않는다(사이트 보안 규칙) */
export const FLAT_BAND = 0.001; // ±0.1% 안쪽은 보합으로 센다
export const outcome = r => r > FLAT_BAND ? 'up' : r < -FLAT_BAND ? 'down' : 'flat';
export const ROAD_UNITS = [0.01, 0.02, 0.03, 0.05], ROAD_MAX_COLS = 24, ROAD_RECENT = 5;

export function roadLayout(rets, unit) {
  const cells = [], occ = new Set();
  let last = null, colStart = -1, col = 0, row = 0, turned = false;
  rets.forEach((r, day) => {
    const n = Math.round(Math.abs(r) / unit), o = r > 0 ? 'up' : 'down';
    for (let k = 0; k < n; k++) {
      if (o !== last) { colStart++; while (occ.has(colStart + ',0')) colStart++; col = colStart; row = 0; turned = false; }
      else if (!turned && row < 5 && !occ.has(col + ',' + (row + 1))) row++;
      else { col++; turned = true; }
      occ.add(col + ',' + row); cells.push({col, row, side: o, day}); last = o;
    }
  });
  return {cells, cols: cells.length ? Math.max(...cells.map(c => c.col)) + 1 : 0};
}
/** 저울 하나: 빨간 수 대 파란 수 — 동그라미가 1개 이하면 잠잠 · 차이가 1개 또는 전체의 10% 이하면 비슷 */
export const balance = (up, down) => ({up, down, side: up + down <= 1 ? 'still' : Math.abs(up - down) <= Math.max(1, (up + down) * .1) ? 'flat' : up > down ? 'up' : 'down'});
export function roadOf(closes) {
  const cs = (closes ?? []).filter(v => typeof v === 'number' && Number.isFinite(v) && v > 0);
  const rets = cs.slice(1).map((c, i) => c / cs[i] - 1);
  let unit = ROAD_UNITS[0], lay = roadLayout(rets, unit);
  for (const u of ROAD_UNITS.slice(1)) { if (lay.cols <= ROAD_MAX_COLS) break; unit = u; lay = roadLayout(rets, u); }
  const ups = rets.filter(r => outcome(r) === 'up').length, downs = rets.filter(r => outcome(r) === 'down').length;
  const side = [...rets].reverse().map(outcome).find(o => o !== 'flat') ?? null;
  let len = 0, i = rets.length - 1;
  for (; i >= 0; i--) { const o = outcome(rets[i]); if (o === 'flat') continue; if (o !== side) break; len++; }
  const from = i + 1, ret = side ? cs.at(-1) / cs[from] - 1 : 0;
  const count = (cells, sd) => cells.filter(c => c.side === sd).length, cut = rets.length - ROAD_RECENT;
  const early = lay.cells.filter(c => c.day < cut), recent = lay.cells.filter(c => c.day >= cut);
  return {...lay, unit, all: balance(count(lay.cells, 'up'), count(lay.cells, 'down')), before: balance(count(early, 'up'), count(early, 'down')), now: balance(count(recent, 'up'), count(recent, 'down')),
    beforeDays: Math.max(0, cut), recentDays: Math.min(ROAD_RECENT, rets.length), ups, downs, flats: rets.length - ups - downs, days: rets.length, streak: {side, len, ret}, total: cs.length > 1 ? cs.at(-1) / cs[0] - 1 : 0};
}
/** 흐름 한 마디: 처음 15일 힘 → 최근 5일 힘 (아홉 칸 표) — 글자 색은 최근 5일 쪽 */
export const STORY = {
  up: {up: '계속 오르는 흐름', flat: '오르다가 요즘 쉬는 중', down: '오르다가 요즘 꺾임'},
  flat: {up: '요즘은 오름 쪽', flat: '뚜렷한 쪽 없음', down: '요즘은 내림 쪽'},
  down: {up: '내리다가 요즘 반등', flat: '내리다가 요즘 쉬는 중', down: '계속 내리는 흐름'}};
export function roadStory(road) {
  const calm = x => x === 'still' ? 'flat' : x, b = road.before.side, n = road.now.side;
  if (b === 'still' && n === 'still') return {side: 'flat', text: `${road.days}거래일 내내 거의 안 움직임`};
  return {side: calm(n), text: STORY[calm(b)][calm(n)]};
}
export const WORD = {up: '오름이 셈', down: '내림이 셈', flat: '비슷함', still: '잠잠함'};
export const unitText = road => `동그라미 하나 = ${Math.round(road.unit * 100)}%`;

const NS = 'http://www.w3.org/2000/svg';
function s(tag, attrs = {}, ...kids) { const el = document.createElementNS(NS, tag); for (const [k, v] of Object.entries(attrs)) if (v != null) el.setAttribute(k, String(v)); for (const c of kids.flat()) if (c != null) el.append(c); return el; }
function e(tag, attrs = {}, ...kids) { const el = document.createElement(tag); for (const [k, v] of Object.entries(attrs)) if (v != null) el.setAttribute(k, String(v)); for (const c of kids.flat()) if (c != null) el.append(c.nodeType ? c : document.createTextNode(String(c))); return el; }

/** 표: 칸 12 · 여섯 줄 · 적어도 20칸(짧아도 같은 크기로 보이게) */
export function roadSvg(road, {minCols = 20} = {}) {
  const cs = 12, cols = Math.max(minCols, road.cols);
  const svg = s('svg', {class: 'road', viewBox: `0 0 ${cols * cs} ${6 * cs}`, role: 'img', 'data-cols': cols,
    'aria-label': `출목표 ${road.days}거래일 · ${unitText(road)} 움직임: 빨간 동그라미 ${road.all.up}개(오름) · 파란 동그라미 ${road.all.down}개(내림) · 처음 ${road.beforeDays}거래일 빨강 ${road.before.up}개 · 파랑 ${road.before.down}개 · 최근 ${road.recentDays}거래일 빨강 ${road.now.up}개 · 파랑 ${road.now.down}개 · ${roadStory(road).text}`});
  const grid = s('g', {class: 'road-grid'});
  for (let c = 0; c <= cols; c++) grid.append(s('line', {x1: c * cs, y1: 0, x2: c * cs, y2: 6 * cs}));
  for (let r = 0; r <= 6; r++) grid.append(s('line', {x1: 0, y1: r * cs, x2: cols * cs, y2: r * cs}));
  svg.append(grid);
  for (const c of road.cells) svg.append(s('circle', {class: 'bead ' + c.side, cx: c.col * cs + cs / 2, cy: c.row * cs + cs / 2, r: 4.3}));
  return svg;
}
/** 표 아래: 힘 저울 두 줄(처음 15일 · 최근 5일) → 흐름 한 마디 · note 면 작은 읽는 법 */
export function roadKey(road, {note = true} = {}) {
  const story = roadStory(road), w = 240;
  const bar = b => {
    const all = b.up + b.down, upW = all ? b.up / all * w : w / 2, show = b.side !== 'still', dim = b.side === 'flat' ? ' dim' : '';
    return s('svg', {class: 'scale', viewBox: `0 0 ${w} 10`, preserveAspectRatio: 'none', 'aria-hidden': 'true'},
      s('title', {}, `빨간 동그라미 ${b.up}개 · 파란 동그라미 ${b.down}개`),
      s('rect', {class: 'sc-bg', x: 0, y: 1, width: w, height: 8, rx: 4}),
      ...(show && b.up ? [s('rect', {class: 'sc-up' + dim, x: 0, y: 1, width: Math.max(4, upW - (b.down ? 1 : 0)), height: 8, rx: 4})] : []),
      ...(show && b.down ? [s('rect', {class: 'sc-down' + dim, x: b.up ? Math.min(w - 4, upW + 1) : 0, y: 1, width: Math.max(4, w - upW - (b.up ? 1 : 0)), height: 8, rx: 4})] : []));
  };
  const row = (label, b) => e('div', {class: 'rk-row', 'data-up': b.up, 'data-down': b.down, 'data-side': b.side}, e('span', {class: 'rk-lab'}, label), bar(b), e('b', {class: 'rk-word ' + b.side}, WORD[b.side]));
  return e('div', {class: 'road-key'},
    road.beforeDays ? row(`처음 ${road.beforeDays}일`, road.before) : null, row(`최근 ${road.recentDays}일`, road.now),
    e('p', {class: 'rk-story ' + story.side}, story.text),
    note ? e('p', {class: 'rk-note'}, e('span', {}, `${unitText(road)} · 빨강 오름 · 파랑 내림`), e('span', {}, '막대 길이 = 동그라미 개수')) : null);
}
