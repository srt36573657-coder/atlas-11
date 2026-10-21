/* 테마 시계 첫 화면 칸(#/ 맨 위 · app.js 가 처음부터 부름) + 쪽들이 같이 쓰는 그림 조각(시계 · 점 넷 · 막대 · 줄 · 성적표 · 다음 단추)
   사장님 2026-10-19(싱가포르) 16:06 · 16:46 · 16:54 — 셈은 결정표 그대로(올릴 때 /next/data/theme-home.json · theme.json) · 이 파일은 그리기만
   첫 그림이 가볍게(느린 4G 2.5초 · check_white ③): 이 파일 + theme-rule.js + theme-home.json(4KB 남짓)만 · 쪽들(p-theme.js)은 누를 때 받음
   글은 textContent 로만(보안 규칙) · 앞날 말 없음 · 사고팔기 권하지 않음 */
import {ZONES, RULE, pp, nearBar} from './theme-rule.js';

const nx = () => globalThis.NX;
const h = (...a) => nx().h(...a);
const sv = (...a) => nx().sv(...a);
const enc = s => encodeURIComponent(s);
const num = n => Number(n).toLocaleString('ko-KR');
const cls = v => (!Number.isFinite(v) ? '' : Math.round(v * 10) === 0 ? 'fl' : v > 0 ? 'up' : 'dn');
export const indOf = (TH, n) => TH?.inds?.find(i => i.n === n) ?? null;
const okHome = j => !!j && j.schema === 'dori-theme-1-home' && Array.isArray(j.inds) && j.order && j.count;
/** 첫 화면 자료 — app.js 공용 받기(need('themeHome') · index.html 이 미리 받음 · 15초 뒤 다시) */
export const themeHomeData = () => (nx()?.need ? nx().need('themeHome').then(j => (okHome(j) ? j : null)).catch(() => null) : Promise.resolve(null));

/** 쪽 아래 「다음」 큰 단추 하나 */
export function nextBtn(title, href, lead = '다음') {
  return h('a', {class: 'th-next', href}, h('span', {class: 'th-nx'}, h('small', {text: lead}), h('b', {text: title})), h('i', {'aria-hidden': 'true', text: '›'}));
}
/** 있는 쪽 맨 아래 「다음」 한 줄(app.js flowFoot) — 가운데 맞춘 글 한 덩이(그 쪽 「글 시작 왼쪽 줄 셋」 규칙 [10] 7 에 줄을 더하지 않음) */
export function footBtn(title, href) { return h('a', {class: 'th-next th-one', href}, h('span', {text: `다음 · ${title} ›`})); }
/* ── 그림: 테마 시계(가로 = 한 달 동안 시장보다 더 오른 %p · 세로 = 지난 닷새 · 꽃 선 = 가로 5) ── */
/* 행성 사진(사장님 2026-10-20(서울) 22:17 「우주에 주황샥으로만 여러게 있는데 태양계 그리고 몰라 진짜 실사 행성으로 해 / 학습해서 해」 · 22:22 행성 사진 보기)
   업종 점 = 진짜 행성 사진(미국 항공우주국 NASA · /media/planet/ · 출처 /media/planet/sources.json) — 큰 업종 열 무리마다 행성 하나 · 가운데(꽃 선과 가로축이 만나는 곳)는 해
   싹 자리는 크고 밝게 · 다른 자리는 작고 흐리게 · 번호 셋(또는 고른 업종)은 가장 크게 — 자리 셈 · 누르는 곳 · 번호는 그대로 */
export const PLANET = Object.freeze({semi: 'earth', elec: 'mercury', it: 'neptune', bio: 'uranus', kcon: 'venus', hold: 'moon', mat: 'mars', power: 'jupiter', heavy: 'saturn', fin: 'pluto'});
export const PLANET_KO = Object.freeze({earth: '지구', mercury: '수성', neptune: '해왕성', uranus: '천왕성', venus: '금성', moon: '달', mars: '화성', jupiter: '목성', saturn: '토성', pluto: '명왕성', sun: '해'});
export const planetSrc = (g, px = 96) => `/media/planet/${g === 'sun' ? 'sun' : PLANET[g] ?? 'moon'}-${px}.webp`;
let HIT_SEQ = 0;
/** 번호 하나의 누르는 칸 — (cx, cy) 둘레 네모(±r)를 다른 번호와의 가운데 선으로 자름(그 번호가 가장 가까운 곳) · 꼭짓점 목록 */
function voronoiCell(cx, cy, r, others) {
  let poly = [[cx - r, cy - r], [cx + r, cy - r], [cx + r, cy + r], [cx - r, cy + r]];
  for (const o of others) {
    const nx = o.cx - cx, ny = o.cy - cy, m = ((o.cx * o.cx + o.cy * o.cy) - (cx * cx + cy * cy)) / 2; // 남길 곳: nx·x + ny·y ≤ m
    if (!nx && !ny) continue;
    const side = ([x, y]) => nx * x + ny * y - m, out = [];
    for (let j = 0; j < poly.length; j++) {
      const P = poly[j], Q = poly[(j + 1) % poly.length], a = side(P), b = side(Q);
      if (a <= 0) out.push(P);
      if ((a < 0 && b > 0) || (a > 0 && b < 0)) { const t = a / (a - b); out.push([P[0] + (Q[0] - P[0]) * t, P[1] + (Q[1] - P[1]) * t]); }
    }
    poly = out; if (poly.length < 3) break;
  }
  return poly;
}
function txt(x, y, s, a = {}) { const e = sv('text', {x, y, ...a}); e.textContent = s; return e; }
/** links = 첫 화면 시계 — 주황 번호 셋은 그 업종 쪽 · 싹 칸은 싹 자리 전부로 넘어감(사장님 2026-10-20 07:05 「여기 주황색 있는 4곳 클릭하면 해당페이지로 넘어가게」 · 07:08 「응」)
 *  그림(점 · 길 · 글)은 aria-hidden 묶음 · 누르는 곳만 <a>(글 읽기 프로그램 · 키보드도 감) · 누르는 자리는 투명 원 · 네모(320 폭에서도 48px 넘게 — 흰 판 새 단추) */
export function clock(TH, {hi = null, marks = null, W = 326, H = 300, links = false} = {}) {
  const X0 = RULE.bloomX, pad = 14, hiI = hi ? indOf(TH, hi) : null;
  const hp = (hiI ? [[hiI.x, hiI.y], ...(Array.isArray(hiI.t) ? hiI.t : [])] : (marks ?? []).map(n => indOf(TH, n)).filter(Boolean).map(i => [i.x, i.y])).filter(([a, b]) => Number.isFinite(a) && Number.isFinite(b));
  const SX = Math.max(15, ...hp.map(([a]) => Math.ceil(Math.abs(a - X0) * 1.15))), SY = Math.max(6, ...hp.map(([, b]) => Math.ceil(Math.abs(b) * 1.15))); // 고른 업종(지나온 길 꼬리 · 첫 화면 번호 셋)이 끝에 붙거나 번호가 그림 밖으로 나가지 않게 눈금을 넓힘(2026-10-19 실제 사이트 첫 화면 ① 이 잘림)
  const X = v => W / 2 + Math.max(-1, Math.min(1, (v - X0) / SX)) * (W / 2 - pad);
  const Y = v => H / 2 - Math.max(-1, Math.min(1, v / SY)) * (H / 2 - pad);
  const s = sv('svg', links ? {class: 'th-clock', viewBox: `0 0 ${W} ${H}`, width: '100%', role: 'group', 'aria-label': '테마 시계'} : {class: 'th-clock', viewBox: `0 0 ${W} ${H}`, width: '100%', 'aria-hidden': 'true', focusable: 'false'});
  const g = links ? sv('g', {'aria-hidden': 'true'}) : s, tap = []; // g = 그림 · tap = 누르는 곳(그림 위에 얹음)
  const defs = sv('defs'), mk = sv('marker', {id: 'th-ah', viewBox: '0 0 10 10', refX: 8, refY: 5, markerWidth: 7, markerHeight: 7, orient: 'auto'});
  mk.append(sv('path', {d: 'M0 0L10 5L0 10z', class: 'th-arw'})); defs.append(mk); s.append(defs); if (links) s.append(g);
  g.append(sv('rect', {x: 0, y: 0, width: W / 2, height: H / 2, class: 'th-sz'}), sv('line', {x1: 0, y1: H / 2, x2: W, y2: H / 2, class: 'th-ax'}), sv('line', {x1: W / 2, y1: H / 2, x2: W / 2, y2: H, class: 'th-ax'}),
    sv('line', {x1: W / 2, y1: 0, x2: W / 2, y2: H / 2, class: 'th-bl'}));
  for (const d of [`M ${W / 2 - 50} 40 Q ${W / 2} 14 ${W / 2 + 50} 40`, `M ${W - 40} ${H / 2 - 50} Q ${W - 14} ${H / 2} ${W - 40} ${H / 2 + 50}`, `M ${W / 2 + 50} ${H - 40} Q ${W / 2} ${H - 14} ${W / 2 - 50} ${H - 40}`, `M 40 ${H / 2 + 50} Q 14 ${H / 2} 40 ${H / 2 - 50}`])
    g.append(sv('path', {d, class: 'th-turn', 'marker-end': 'url(#th-ah)'}));
  g.append(sv('image', {href: planetSrc('sun'), x: (W / 2 - 15).toFixed(1), y: (H / 2 - 15).toFixed(1), width: 30, height: 30, class: 'th-sun'})); // 가운데 해(2026-10-20 22:17 「태양계」) — 점보다 먼저 그려 점이 위
  const inds = TH.inds ?? [], mark = hi ? [hi] : (marks ?? []);
  for (const i of inds) if (mark.includes(i.n) && Array.isArray(i.t)) g.append(sv('polyline', {points: i.t.map(([a, b]) => X(a).toFixed(1) + ',' + Y(b).toFixed(1)).join(' '), class: 'th-tail'}));
  const pts = inds.filter(i => Number.isFinite(i.x) && Number.isFinite(i.y)).map(i => ({i, big: mark.includes(i.n), on: mark.includes(i.n) || (!hi && i.z === 'S')})).sort((a, b) => (a.on - b.on) || (a.big - b.big));
  for (const {i, on, big} of pts) { const d = big ? 22 : on ? 15 : 9; g.append(sv('image', {href: planetSrc(i.g), x: (X(i.x) - d / 2).toFixed(1), y: (Y(i.y) - d / 2).toFixed(1), width: d, height: d, class: on ? 'th-dot th-pl on' : 'th-dot th-pl', 'data-g': i.g ?? ''})); } // 업종 = 행성 사진(큰 업종 무리마다 하나)
  if (hi) { const i = indOf(TH, hi); if (i) { const lx = X(i.x), right = lx < W / 2; g.append(txt((right ? lx + 12 : lx - 12).toFixed(1), (Y(i.y) - 12).toFixed(1), i.n, {class: 'th-lb', 'text-anchor': right ? 'start' : 'end'})); } }
  else {
    const bs = (marks ?? []).map((n, k) => { const i = indOf(TH, n); return i ? {i, k, cx: X(i.x) + (k % 2 ? 16 : -16), cy: Y(i.y) - 18} : null; }).filter(Boolean);
    for (const {i, k, cx, cy} of bs) {
      const parts = [sv('circle', {cx: cx.toFixed(1), cy: cy.toFixed(1), r: 12, class: 'th-nb'}), txt(cx.toFixed(1), (cy + 6).toFixed(1), String(k + 1), {class: 'th-nbt', 'text-anchor': 'middle'})];
      if (!links) { g.append(...parts); continue; }
      const a = sv('a', {href: '#/t/i/' + enc(i.n), class: 'th-tap th-tapn', 'aria-label': `${k + 1}번 ${i.n} 보기`}); // 번호 = 그 업종 쪽
      // 누르는 원 r 33(320 폭 51px · 흰 판 새 단추 48) — 번호끼리 가까우면 원이 겹쳐 옆 번호를 덮음(2026-10-20 ① ③ 35 떨어짐) →
      // 원을 「이 번호가 가장 가까운 곳」만 남게 자름(가까운 번호 쪽으로 감 · 보이는 번호는 늘 제 고리)
      const id = 'th-hc' + (++HIT_SEQ), cell = voronoiCell(cx, cy, 33, bs.filter(o => o.k !== k));
      const cp = sv('clipPath', {id}); cp.append(sv('polygon', {points: cell.map(([x, y]) => x.toFixed(1) + ',' + y.toFixed(1)).join(' ')})); defs.append(cp);
      a.append(sv('circle', {cx: cx.toFixed(1), cy: cy.toFixed(1), r: 33, class: 'th-hit', 'clip-path': `url(#${id})`}), ...parts); tap.push(a);
    }
  }
  g.append(txt(10, 24, ZONES.S, {class: 'th-zl th-zs'}), txt(W - 10, 24, ZONES.B, {class: 'th-zl', 'text-anchor': 'end'}), txt(W - 10, H - 10, ZONES.W, {class: 'th-zl th-zq', 'text-anchor': 'end'}), txt(10, H - 10, ZONES.Q, {class: 'th-zl th-zq'}),
    txt(W / 2 + 6, H / 2 - 8, '꽃 선', {class: 'th-bt'}));
  if (links) { // 싹 칸(투명 네모 — 점 · 「싹」 글 위) 먼저 · 번호 셋이 그 위
    const za = sv('a', {href: '#/t/sprout', class: 'th-tap th-tapz', 'aria-label': '싹 자리 전부 보기'});
    za.append(sv('rect', {x: 0, y: 0, width: W / 2, height: H / 2, class: 'th-hit'})); s.append(za, ...tap.reverse()); // ① 이 맨 위(겹치면 앞 번호)
  }
  return s;
}
/* ── 계절 궤도(첫 화면 · 2026-10-21 00:51 「확임 했어 이기준에 스마트하게 만들어」 — 기준 = 00:49 시안 「지금 봄이 온 곳」 · 원문 docs/design/season-2026-10-21/order-0051.txt)
   뿌리를 쉽게: 축 · %p · 꽃 선은 접고(자세히 · 시계 읽는 법), 해 · 행성 · 계절 넷만 보임 · 셈은 그대로(결정표 — 네 자리 = 계절 넷)
   행성 자리 = 시계 자리의 각도 그대로(꽃 선 x 5 · 가로축 y 0 이 만나는 곳을 해로 두고 잰 각) — 싹 = 왼쪽 위 = 봄 · 꽃 = 오른쪽 위 = 여름 · 시듦 = 오른쪽 아래 = 가을 · 잠잠 = 왼쪽 아래 = 겨울
   궤도 위 거리는 뜻이 없음(모든 행성이 한 궤도 — 겹치지 않게 세 줄로만 나눔) · 앞날 말 없음 · 누르는 곳(번호 셋 · 봄 칸)은 시계와 같은 고리 · 같은 이름표 */
export const SEASON = Object.freeze({Q: '겨울', S: '봄', B: '여름', W: '가을'});
/** 계절 각(라디안 · 수학 각) — 꽃 선(x = bloomX)과 가로축(y = 0)이 만나는 곳을 해로 둔 시계 자리의 각 · 0 ~ π/2 여름 · π/2 ~ π 봄 · 그 아래 반쪽은 가을 · 겨울(결정표 네 자리와 같음) */
export const seasonAngle = (x, y) => Math.atan2(y, x - RULE.bloomX);
export const ORB_R = 86; // 궤도 반지름(그림 단위) — 궤도 그림과 한 해 다시 보기(theme-year.js)가 같이 씀
export function orbit(TH, {marks = [], links = false, W = 326, H = 240} = {}) {
  const cx = W / 2, cy = H / 2, R = ORB_R, X0 = RULE.bloomX; // 첫 줄 셋이 엄지 칸 위에 보이게 높이 240(2026-10-21 01:00 첫 판 390 에서 첫 줄이 가림)
  const s = sv('svg', links ? {class: 'th-clock th-orbit', viewBox: `0 0 ${W} ${H}`, width: '100%', role: 'group', 'aria-label': '테마 시계'} : {class: 'th-clock th-orbit', viewBox: `0 0 ${W} ${H}`, width: '100%', 'aria-hidden': 'true', focusable: 'false'});
  const g = links ? sv('g', {'aria-hidden': 'true'}) : s, tap = [];
  const defs = sv('defs'), mk = sv('marker', {id: 'th-oh', viewBox: '0 0 10 10', refX: 8, refY: 5, markerWidth: 6, markerHeight: 6, orient: 'auto'});
  mk.append(sv('path', {d: 'M0 0L10 5L0 10z', class: 'th-arw'})); defs.append(mk); s.append(defs); if (links) s.append(g);
  const P = (r, a) => [cx + r * Math.cos(a), cy - r * Math.sin(a)]; // a = 수학 각(라디안 · 반시계) → 화면 자리
  g.append(sv('circle', {cx, cy, r: R, class: 'th-orb'}));
  { const [x1, y1] = P(R, Math.PI), [x2, y2] = P(R, Math.PI / 2); g.append(sv('path', {d: `M ${x1.toFixed(1)} ${y1.toFixed(1)} A ${R} ${R} 0 0 1 ${x2.toFixed(1)} ${y2.toFixed(1)}`, class: 'th-orbs'})); } // 봄 활(왼쪽 → 위)
  for (const m of [135, 45, -45, -135]) { // 도는 쪽(시계 방향 = 각이 줄어듦) 작은 화살 넷 — 궤도 바깥
    const a0 = (m + 13) * Math.PI / 180, a1 = (m - 13) * Math.PI / 180, r = R + 30, [x1, y1] = P(r, a0), [x2, y2] = P(r, a1);
    g.append(sv('path', {d: `M ${x1.toFixed(1)} ${y1.toFixed(1)} A ${r} ${r} 0 0 1 ${x2.toFixed(1)} ${y2.toFixed(1)}`, class: 'th-turn th-oturn', 'marker-end': 'url(#th-oh)'}));
  }
  g.append(sv('image', {href: planetSrc('sun'), x: cx - 22, y: cy - 22, width: 44, height: 44, class: 'th-sun'}), txt(cx, cy + 40, '시장', {class: 'th-sunl', 'text-anchor': 'middle'}));
  const inds = (TH.inds ?? []).filter(i => Number.isFinite(i.x) && Number.isFinite(i.y)).map(i => ({i, a: seasonAngle(i.x, i.y), big: marks.includes(i.n), on: marks.includes(i.n) || i.z === 'S'}));
  inds.sort((p, q) => q.a - p.a); // 각 차례 — 겹치지 않게 세 줄(안 · 가운데 · 밖)로 번갈아
  inds.forEach((p, k) => { p.r = p.big ? R : R + [0, -13, 13][k % 3]; });
  for (const p of [...inds].sort((u, v) => (u.on - v.on) || (u.big - v.big))) {
    const d = p.big ? 24 : p.on ? 13 : 9, [x, y] = P(p.r, p.a);
    g.append(sv('image', {href: planetSrc(p.i.g), x: (x - d / 2).toFixed(1), y: (y - d / 2).toFixed(1), width: d, height: d, class: p.big ? 'th-dot th-pl on th-big' : p.on ? 'th-dot th-pl on' : 'th-dot th-pl', 'data-g': p.i.g ?? '', 'data-z': p.i.z}));
  }
  // 번호 셋 — 궤도 안쪽(해 쪽 빈 곳)에 둠 · 서로 26 넘게 떨어지게 살짝 밂 · 그림 안
  const bs = marks.map((n, k) => { const p = inds.find(q => q.i.n === n); if (!p) return null; const [x, y] = P(R - 32, p.a); return {i: p.i, k, cx: x, cy: y}; }).filter(Boolean);
  for (let it = 0; it < 12; it++) for (const a of bs) for (const b of bs) { if (a === b) continue; const dx = b.cx - a.cx, dy = b.cy - a.cy, dd = Math.hypot(dx, dy) || 0.01; if (dd < 26) { const f = (26 - dd) / 2 / dd; a.cx -= dx * f; a.cy -= dy * f; b.cx += dx * f; b.cy += dy * f; } }
  for (const b of bs) { b.cx = Math.max(14, Math.min(W - 14, b.cx)); b.cy = Math.max(14, Math.min(H - 14, b.cy)); }
  for (const {i, k, cx: bx, cy: by} of bs) {
    const parts = [sv('circle', {cx: bx.toFixed(1), cy: by.toFixed(1), r: 12, class: 'th-nb'}), txt(bx.toFixed(1), (by + 6).toFixed(1), String(k + 1), {class: 'th-nbt', 'text-anchor': 'middle'})];
    if (!links) { g.append(...parts); continue; }
    const a = sv('a', {href: '#/t/i/' + enc(i.n), class: 'th-tap th-tapn', 'aria-label': `${k + 1}번 ${i.n} 보기`});
    const id = 'th-hc' + (++HIT_SEQ), cell = voronoiCell(bx, by, 33, bs.filter(o => o.k !== k));
    const cp = sv('clipPath', {id}); cp.append(sv('polygon', {points: cell.map(([x, y]) => x.toFixed(1) + ',' + y.toFixed(1)).join(' ')})); defs.append(cp);
    a.append(sv('circle', {cx: bx.toFixed(1), cy: by.toFixed(1), r: 33, class: 'th-hit', 'clip-path': `url(#${id})`}), ...parts); tap.push(a);
  }
  g.append(txt(8, 24, SEASON.S + ' · ' + ZONES.S, {class: 'th-zl th-zs', 'data-z': 'S'}), txt(W - 8, 24, SEASON.B + ' · ' + ZONES.B, {class: 'th-zl', 'text-anchor': 'end', 'data-z': 'B'}),
    txt(W - 8, H - 10, SEASON.W + ' · ' + ZONES.W, {class: 'th-zl th-zq', 'text-anchor': 'end', 'data-z': 'W'}), txt(8, H - 10, SEASON.Q + ' · ' + ZONES.Q, {class: 'th-zl th-zq', 'data-z': 'Q'})); // data-z = 한 해 다시 보기가 지금 계절 글만 밝힘
  if (links) { // 봄 칸(왼쪽 위 네모 = 싹 자리 전부) 먼저 · 번호 셋이 그 위
    const za = sv('a', {href: '#/t/sprout', class: 'th-tap th-tapz', 'aria-label': '싹 자리 전부 보기'});
    za.append(sv('rect', {x: 0, y: 0, width: W / 2, height: H / 2, class: 'th-hit'})); s.append(za, ...tap.reverse());
  }
  return s;
}
/* ── 지난 한 해 다시 보기 — 사장님 2026-10-21 10:44 「1.2.3 번에 행성이 어떻게 움직었는지 지난 1년에 주식 변화를 그래프로도 이 우주안에서 동영상으로 보여줘야해 1번 보여주고 그다음 2번 보여주고 그다음 3번 보려주는거야」 · 11:07 「음 단추가 아니라 자동으로 보여주게해」
   여기는 칸 뼈대만(첫 그림 가볍게 — 느린 4G 2.5초 · check_white ③): 그림 칸 단추 하나 · 머리 줄(굵은 줄 = 업종 줄 · 번호와 이름) · 아래 글(1년 전 · 오늘 · 시장) — 칸 자리는 처음부터 잡아 둠(밀림 0)
   움직임 · 자료(/next/data/theme-path.json)는 창 load 뒤 한가할 때 theme-year.js(+ theme-year.css)가 붙임 — 1번 → 2번 → 3번이 저절로 차례로 · 날짜 글은 쓰지 않음([6] 2) */
const afterLoad = f => { const go = () => (globalThis.requestIdleCallback ? requestIdleCallback(f, {timeout: 1500}) : setTimeout(f, 300)); if (document.readyState === 'complete') go(); else addEventListener('load', go, {once: true}); };
function yearBox(TH, top, orb) {
  const svg = sv('svg', {class: 'th-yrg', viewBox: '0 0 326 112', width: '100%', 'aria-hidden': 'true', focusable: 'false'});
  const btn = h('button', {type: 'button', class: 'th-yr', 'aria-label': '멈춤', disabled: true}, svg);
  const tt = txt(24, 21, top[0] ? `1번 ${top[0].n}` : '', {class: 'th-yrt'});
  svg.append(sv('line', {x1: 1, y1: 14, x2: 17, y2: 14, class: 'th-yrs'}), tt, txt(0, 106, '1년 전', {class: 'th-yra'}), txt(236, 106, '오늘', {class: 'th-yra', 'text-anchor': 'end'}), sv('line', {x1: 248, y1: 100, x2: 262, y2: 100, class: 'th-yrlm'}), txt(268, 106, '시장', {class: 'th-yra'}));
  if (top.length) afterLoad(() => { if (btn.isConnected) import('./theme-year.js').then(m => m.run({TH, top, orb, btn, svg, tt})).catch(() => { if (btn.isConnected) svg.append(txt(0, 64, '? 한 해 길을 받지 못했어요.', {class: 'th-yra'})); }); });
  return btn;
}
/** 첫 화면 줄(계절 판) — 번호 · 이름 · 행성 · › 한 줄(점 넷 · 꽃까지 막대는 싹 자리 쪽에 그대로) */
export function seasonRow(i, k) {
  return h('a', {class: 'th-row th-row2', href: '#/t/i/' + enc(i.n)}, h('span', {class: 'th-n' + (k < 3 ? ' th-top' : ''), text: String(k + 1)}),
    h('span', {class: 'th-mid2'}, h('span', {class: 'th-rn', text: i.n})), h('img', {class: 'th-rp', src: planetSrc(i.g), alt: '', width: 32, height: 32, decoding: 'async'}), h('i', {class: 'th-go', 'aria-hidden': 'true', text: '›'}));
}
/** 점 넷(채운 동그라미 = 참) */
export function dots(i) { const s = sv('svg', {class: 'th-dots', viewBox: '0 0 88 20', width: 88, height: 20, role: 'img', 'aria-label': '점 넷 가운데 ' + i.sc + '개'}); i.dots.forEach((v, k) => s.append(sv('circle', {cx: 10 + k * 22, cy: 10, r: 7, class: v ? 'th-d on' : 'th-d'}))); return s; }
/** 꽃까지 막대 */
export function bar(x) { const W = 64, s = sv('svg', {class: 'th-bar', viewBox: `0 0 ${W} 8`, width: W, height: 8, preserveAspectRatio: 'none', 'aria-hidden': 'true'}); s.append(sv('rect', {x: 0, y: 0, width: W, height: 8, rx: 4, class: 'th-bar0'}), sv('rect', {x: 0, y: 0, width: Math.round(nearBar(x) * W), height: 8, rx: 4, class: 'th-bar1'})); return s; } // 길이 64 하나(줄마다 같은 길이)
/** 줄 하나(싹 · 꽃 · 시듦 목록 · 첫 화면) */
export function row(i, k, {num: showNum = true, meta = 'near'} = {}) {
  const tag = i.d === 1 ? '새로 들어옴' : i.d + '일째';
  const mid = h('span', {class: 'th-mid2'}, h('span', {class: 'th-rn', text: i.n}),
    meta === 'near' ? h('span', {class: 'th-meta'}, h('em', {class: 'th-tg' + (i.d === 1 ? ' new' : ''), text: tag}), h('span', {class: 'th-to'}, h('span', {text: '꽃까지'}), bar(i.x))) // 둘째 줄 며칠째 · 셋째 줄 「꽃까지 ▬」(견본 차례 · 줄 높이 늘 같게 · 새 눈 검사 2026-10-19 22시)
      : h('span', {class: 'th-meta'}, h('em', {class: 'th-tg', text: tag}), h('span', {text: '한 달 시장보다'}), h('b', {class: cls(i.x), text: pp(i.x) + '%p'})));
  return h('a', {class: 'th-row', href: '#/t/i/' + enc(i.n)}, showNum ? h('span', {class: 'th-n' + (k < 3 ? ' th-top' : ''), text: String(k + 1)}) : null, mid, dots(i), h('i', {class: 'th-go', 'aria-hidden': 'true', text: '›'}));
}
/** 꽃 · 시듦 목록 줄(견본 flow36 5 · 6 쪽 그대로) — 이름 · 한 달 동안 시장보다 더 오른 %p · 「한 달」 */
export function simpleRow(i, {zone = false} = {}) {
  return h('a', {class: 'th-srow', href: '#/t/i/' + enc(i.n)}, h('span', {class: 'th-rn', text: i.n}), zone ? h('b', {class: 'th-z ' + i.z, text: ZONES[i.z] ?? '?'}) : null, h('b', {class: 'th-sv ' + cls(i.x), text: pp(i.x) + '%p'}), h('span', {class: 'th-sk', text: '한 달'}));
}
export const yearsOf = TH => { const a = Date.parse(TH.recFrom), b = Date.parse(TH.recTo); return Number.isFinite(a) && Number.isFinite(b) ? Math.max(1, Math.round((b - a) / (365.25 * 864e5))) : null; };
/** 성적표 한 줄 — 지난 기록에서 센 횟수(앞날을 맞히는 숫자 아님 · 결정표 6) */
export function recordLine(TH) {
  const R = TH.record, y = yearsOf(TH);
  if (!R?.real?.n || R.real.p == null || R.all.p == null) return h('p', {class: 'th-rec', text: '? 지난 기록을 아직 못 셌어요.'});
  return h('p', {class: 'th-rec'}, h('span', {text: '지난 ' + (y ?? '?') + '년 기록'}),
    h('span', {text: R.more ? `진짜 싹이었던 날, 100번 가운데 ${Math.round(R.real.p)}번은 한 달 뒤 꽃 선을 넘었어요.` : `진짜 싹이었던 날도 아무 업종과 차이가 없었어요.`}),
    h('span', {text: `아무 업종은 100번 가운데 ${Math.round(R.all.p)}번이었어요.`}));
}

/* ── 첫 화면(#/) 맨 위 칸 — app.js vHomeAll 이 부름(본질 세 줄 · 찾기 칸 · 바로 가기 넷 · 전부 보기는 그 아래 그대로) ── */
/** 관심 업종을 담은 기기인가(theme-watch.js 를 받기 전 · 저장소 한 칸만 봄) */
const hasWatch = () => { try { const a = JSON.parse(localStorage.getItem('dori:watch-ind') ?? '[]'); return Array.isArray(a) && a.length > 0; } catch { return false; } };
export async function homeBlock() {
  const TH = await themeHomeData();
  const box = h('section', {class: 'th-home', 'data-w': 'theme', 'aria-label': '테마 시계'});
  if (!TH) { box.append(h('p', {class: 'empty', text: '? 테마 시계 자료를 받지 못했어요. 잠시 뒤 다시 열어 주세요.'})); return box; }
  const S = TH.order.S.map(n => indOf(TH, n)).filter(Boolean), top = S.slice(0, 3);
  // 계절 판(2026-10-21 00:51 「이기준에 스마트하게」 · 00:49 시안) — 궤도 → 봄이 온 곳 셋 → 모두 보기 → 숫자는 「자세히」 안(접음) → 시계 읽는 법 → 처음이세요?
  const orb = orbit(TH, {marks: top.map(i => i.n), links: true}); // 궤도 + 그 아래 지난 한 해 다시 보기(1 · 2 · 3번이 저절로 차례로 — 2026-10-21 10:44 · 11:07)
  box.append(h('div', {class: 'th-map'}, orb, yearBox(TH, top, orb), h('p', {class: 'th-cap th-cap1', text: '행성 하나가 업종 무리 하나예요.'})));
  if (hasWatch()) { try { const nb = (await import('./theme-watch.js')).noticeBox(TH); if (nb) box.append(nb); } catch { /* 소식 칸 없이 */ } } // 관심 업종 소식(사이트 안 알림 · 2026-10-19 「다해」) — 담은 기기만 받음
  box.append(h('p', {class: 'th-sub', text: '요즘 시장보다 힘이 붙은 곳이에요.'}));
  box.append(h('div', {class: 'th-rows'}, top.map((i, k) => seasonRow(i, k))));
  box.append(h('a', {class: 'th-more', href: '#/t/sprout'}, h('span', {text: `봄이 온 곳 ${num(TH.count.S)}곳 모두 보기`}), h('i', {'aria-hidden': 'true', text: '›'})));
  // 숫자는 접어 둠 — 주황 숫자 넷(사장님 2026-10-20 09:46 — 진짜 싹 · 새로 들어옴 · 싹 자리)과 점 넷 · 성적표는 「숫자로 자세히 보기」 안에 그대로
  const fold = h('details', {class: 'th-hfold'}, h('summary', {text: '숫자로 자세히 보기'}));
  fold.append(TH.count.real ? h('h2', {class: 'th-ans'}, h('a', {class: 'th-ansl', href: '#/t/sprout/real'}, h('span', {text: '진짜 싹 '}), h('em', {'data-tr': '업종', text: num(TH.count.real) + '곳'}), h('i', {'aria-hidden': 'true', text: '›'}))) : h('h2', {class: 'th-ans', text: '지금은 진짜 싹이 없어요'})); // data-tr = 영어에서 「n곳」을 업종 수로(i18n.js 자리 표)
  fold.append(h('div', {class: 'th-three', 'data-tr': '업종'}, ...[[TH.count.real, '진짜 싹', '#/t/sprout/real'], [TH.count.fresh, '새로 들어옴', '#/t/sprout/new'], [TH.count.S, '싹 자리', '#/t/sprout']].map(([n, t, href]) => h('a', {href}, h('b', {text: num(n) + '곳'}), h('span', {text: t})))));
  fold.append(h('p', {class: 'th-sub', text: '점 넷이 다 차면 진짜 싹이에요. 점이 많이 찬 순서예요.'}), recordLine(TH)); // 싹 순서 = 점 수 → 지난 닷새(결정표 4)
  box.append(fold, nextBtn('시계 읽는 법', '#/t/how')); // 기준 날은 첫 화면에 안 씀(보이는 날짜는 띠에 한 번 — [6] 2 · next_check) · 테마 쪽마다 아래에 씀
  box.append(h('a', {class: 'th-hi', href: '#/t/hello', text: '처음이세요? 돌이 인사 ›'})); // 서른여섯 장의 1장(돌이 인사)으로 가는 고리 — 가운데 맞춘 한 줄(2026-10-19 사장님 「다해」 · 못 한 것 5)
  return box;
}
