/* ATLAS 11 · 「지도」 한 장 — 아래 탭 「지도」(#/map) 맨 위
   2026-10-06 00:21 사장님 「자 더 깊이 본질로 간다 잡스라면 이 아틀란스를 어떻게 만들었을까? 그리고 개선하라」
   뿌리: 10/5 21:07 「아틀라스가 지도라는 뜻 … 이 주식이 지도 판처럼 의미가 있게끔」 · 10/6 00:01 로고 5번 「땅 나누기」(「이거 맞아 알아서 해」)
   [판단] 잡스라면 지도책(ATLAS)의 첫 장은 목록이 아니라 지도 한 장이다 — 로고(땅 나누기)가 화면에서 그대로 커진 것
   · 땅 하나 = 큰 갈래(family.js · ATLAS 가 업종 이름을 보고 묶은 것) · 땅 넓이 = 그 갈래의 업종 수(업종마다 5곳이라 회사 수와 같은 비율)
   · 땅 안의 칸 하나 = 업종 하나(넓이 같음) · 칸 색 = 지난 20거래일 평균(빨강 오름 · 파랑 내림 · 진할수록 크게 · ±30% 에서 가장 진함)
   · 땅 자리는 날마다 같다(넓이가 업종 수로만 정해짐) — 지도는 자리가 같아야 외워진다 · 땅 안의 칸은 오른 순(규칙 9 · 위 왼쪽이 가장 많이 오른 업종)
   · 땅을 누르면 그 갈래 화면(#/map/f/<갈래> · view-home.js renderLand) — 2026-10-06 07:03 사장님 「왜 3단 클릭 구조가 아니지?」: 땅 → 업종 → 회사, 세 번이면 회사
     (옛 00:21 판: 땅을 누르면 지도 아래 73칸이 그 갈래만 남았다 — 휴대폰에서는 그 칸들이 화면 밖이라 눌러도 아무 일이 없는 것처럼 보였다 · 땅 안의 작은 칸은 누를 수 없었다)
   · 글자(갈래 이름 · 평균)는 땅 맨 위 한 줄(칸을 가리지 않음) — 큰 글씨에서 넘치거나 칸 자리가 모자라면 지도를 세로로 키워 다시 그린다(잘린 글자 0)
   빨강 · 파랑은 칸(작은 땅 조각)에만 · 글자는 판 색 바탕 위(대비 4.5:1 이상) · 칸은 그림이라 화면 읽기 프로그램에는 땅 단추 이름으로 읽힘 */
import {h, pct, finite, signCls} from './util.js';
import {familyOf, FAMILIES, OTHER, meanOf, riseDesc} from './family.js';

const ORDER = [...FAMILIES, OTHER].map(f => f.id);
const MAX = 0.3; // 이 변화(±30%)에서 칸 색이 가장 진함

/** 땅 나누기(squarified) — 넓은 땅부터 · 같은 넓이면 갈래 차례(정렬이 안정적이라 날마다 같은 자리) */
function squarify(items, x, y, w, hh) {
  const list = items.filter(it => it.value > 0).sort((a, b) => b.value - a.value);
  const total = list.reduce((s, it) => s + it.value, 0); if (!total) return [];
  const scale = (w * hh) / total, out = [];
  let rest = list.map(it => ({it, a: it.value * scale})), rx = x, ry = y, rw = w, rh = hh;
  const worst = (row, side) => { const s = row.reduce((t, r) => t + r.a, 0), mx = Math.max(...row.map(r => r.a)), mn = Math.min(...row.map(r => r.a)); return Math.max(side * side * mx / (s * s), (s * s) / (side * side * mn)); };
  while (rest.length) {
    const side = Math.min(rw, rh); let row = [rest[0]], i = 1;
    while (i < rest.length && worst([...row, rest[i]], side) <= worst(row, side)) { row.push(rest[i]); i++; }
    const s = row.reduce((t, r) => t + r.a, 0);
    if (rw >= rh) { const cw = s / rh; let cy = ry; for (const r of row) { const ch = r.a / cw; out.push({...r.it, x: rx, y: cy, w: cw, h: ch}); cy += ch; } rx += cw; rw -= cw; }
    else { const ch = s / rw; let cx = rx; for (const r of row) { const cw = r.a / ch; out.push({...r.it, x: cx, y: ry, w: cw, h: ch}); cx += cw; } ry += ch; rh -= ch; }
    rest = rest.slice(i);
  }
  return out;
}

/** 땅 안의 칸을 몇 줄로 — 칸이 가장 네모에 가깝게(마지막 줄은 남은 칸이 넓어져 빈자리 없음) */
function rowsOf(n, w, hh) {
  let best = 1, score = Infinity;
  for (let c = 1; c <= n; c++) { const r = Math.ceil(n / c), q = (w / c) / (hh / r), s = Math.max(q, 1 / q); if (s < score - 1e-9) { score = s; best = c; } }
  const rows = []; for (let i = 0; i < n; i += best) rows.push([i, Math.min(n, i + best)]);
  return rows;
}

/** 지도 한 장 — groups: 판의 업종(판 차례) · 땅 하나 = 그 갈래 화면으로 가는 링크 · 돌려주는 것: {el, lands, lay()} */
export function landMap(groups) {
  const by = new Map();
  for (const g of groups) { const f = familyOf(g.label); if (!by.has(f.id)) by.set(f.id, {fam: f, groups: []}); by.get(f.id).groups.push(g); }
  const lands = [...by.values()].sort((a, b) => ORDER.indexOf(a.fam.id) - ORDER.indexOf(b.fam.id)).map((x, i) => {
    const gs = [...x.groups].sort(riseDesc), avg = meanOf(gs.map(g => g.change20)), up = gs.filter(g => finite(g.change20) && g.change20 > 0).length;
    return {i, fam: x.fam, groups: gs, avg, up, value: gs.length};
  });
  const el = h('nav', {class: 'lm', 'aria-label': `지도 · 큰 갈래 ${lands.length}개 · 땅을 누르면 그 갈래 업종`});
  const btns = lands.map(L => {
    const cells = h('span', {class: 'lm-cells', 'aria-hidden': 'true'});
    // 이름은 「·」 뒤에서만 줄을 바꿈(「인터넷·」 / 「소프트웨어」 — 낱말 가운데서 끊지 않게) · 0 에 아주 가까운 평균은 둘째 자리까지(「−0.0%」 대신 「−0.02%」)
    const avgT = finite(L.avg) ? pct(L.avg, Math.abs(L.avg) < 0.0005 ? 2 : 1) : '없음';
    const lab = h('span', {class: 'lm-lab'}, h('b', {class: 'lm-name'}, L.fam.label.replace(/·/g, '·\u200b')), h('small', {class: 'lm-avg chg20 ' + (signCls(L.avg) || 'flat')}, avgT));
    const b = h('a', {class: 'lm-n', href: '#/map/f/' + L.fam.id, 'data-family': L.fam.id, 'data-n': String(L.groups.length),
      'aria-label': `${L.fam.label} · 업종 ${L.groups.length}개 가운데 ${L.up}개 오름 · 갈래 평균 ${avgT} · 누르면 그 갈래 업종`}, lab, cells);
    return {L, b, cells, lab};
  });
  el.append(...btns.map(x => x.b));

  /** 칸 그리기(땅 크기에 맞춰 줄 수만 바뀜 · 칸 차례는 오른 순) */
  const fill = (x, w, hh) => {
    const rows = rowsOf(x.L.groups.length, w, hh);
    x.cells.replaceChildren(...rows.map(([a, z]) => h('span', {class: 'lm-row'}, ...x.L.groups.slice(a, z).map(g => {
      const c = h('span', {class: 'lm-c s-' + (signCls(g.change20) || 'flat'), 'data-group': g.id});
      const k = finite(g.change20) ? Math.min(1, Math.abs(g.change20) / MAX) : 0;
      c.style.setProperty('--k', (0.14 + 0.86 * Math.pow(k, 0.75)).toFixed(3)); // 0 근처도 옅게 보이게 · 세기는 가장 진한 칸에서 1
      return c;
    }))));
  };
  /** 지도 그리기 — 폭에 맞추고, 글자가 땅을 넘치면 세로를 키워 다시(글씨가 클수록 지도가 길어짐) */
  function lay() {
    const W = Math.floor(el.clientWidth); if (!W) return;
    const R = parseFloat(getComputedStyle(document.documentElement).fontSize) || 16;
    let H = Math.round(Math.max(W * 0.82, R * 17));
    for (let t = 0; t < 24; t++) {
      const rects = squarify(lands.map(L => ({i: L.i, value: L.value})), 0, 0, W, H);
      for (const r of rects) {
        const x = btns[r.i], g = 2; // 땅 사이 틈 4px(양쪽 2px)
        const left = Math.round(r.x) + g, top = Math.round(r.y) + g, w = Math.round(r.x + r.w) - Math.round(r.x) - 2 * g, hh = Math.round(r.y + r.h) - Math.round(r.y) - 2 * g;
        Object.assign(x.b.style, {left: left + 'px', top: top + 'px', width: w + 'px', height: hh + 'px'});
        const lh = x.lab.offsetHeight + 8; // 이름 줄(땅 맨 위 · 칸을 가리지 않음) — 가장 많이 오른 칸이 늘 위 왼쪽에 보이게
        fill(x, w - 4, Math.max(1, hh - lh - 4));
      }
      el.style.height = H + 'px';
      const over = btns.some(x => x.lab.scrollWidth > x.lab.clientWidth + 1 || [...x.lab.children].some(c => c.offsetWidth > x.lab.clientWidth) || x.b.clientHeight - x.lab.offsetHeight - 10 < R * 1.25); // 이름 줄이 옆으로 넘치거나 칸 자리가 글씨 한 줄 남짓보다 낮으면 다시
      if (!over) break;
      H = Math.round(H * 1.08);
    }
  }
  if (typeof ResizeObserver !== 'undefined') { let last = 0; new ResizeObserver(() => { const w = el.clientWidth; if (w && w !== last) { last = w; lay(); } }).observe(el); }
  document.fonts?.ready?.then(() => lay());
  return {el, lands, lay};
}
