/* 테마 시계 첫 화면 칸(#/ 맨 위 · app.js 가 처음부터 부름) + 쪽들이 같이 쓰는 그림 조각(시계 · 점 넷 · 막대 · 줄 · 성적표 · 다음 단추)
   사장님 2026-10-19(싱가포르) 16:06 · 16:46 · 16:54 — 셈은 결정표 그대로(올릴 때 /next/data/theme-home.json · theme.json) · 이 파일은 그리기만
   첫 그림이 가볍게(느린 4G 2.5초 · check_white ③): 이 파일 + theme-rule.js + theme-home.json(4KB 남짓)만 · 쪽들(p-theme.js)은 누를 때 받음
   글은 textContent 로만(보안 규칙) · 앞날 말 없음 · 사고팔기 권하지 않음 */
import {ZONES, RULE, pp, nearBar} from './theme-rule.js';
import {kakaoText} from './share-btn.js'; // 「카톡 보내기」 글 단추(사장님 2026-10-25 「진짜모든곳에」) — app.js 가 이미 받는 모듈(첫 그림 무게 0)
import {NAME, josa} from './brand.js';

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
/* 행성 사진 표(사장님 2026-10-20(서울) 22:17 「진짜 실사 행성으로 해」) — 2026-10-21 18:22 「그랴」부터 화면에는 행성을 그리지 않음(17:51 「이렇기 행성 나오는것 지우고 … 장난스러워」)
   첫 화면은 업종 줄과 줄 그림 · 시계는 작은 점 · 아래 이름 · 파일 표는 시험(theme.test.mjs)과 사진 출처 기록(/media/planet/sources.json)만 남김 */
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
  const inds = TH.inds ?? [], mark = hi ? [hi] : (marks ?? []);
  for (const i of inds) if (mark.includes(i.n) && Array.isArray(i.t)) g.append(sv('polyline', {points: i.t.map(([a, b]) => X(a).toFixed(1) + ',' + Y(b).toFixed(1)).join(' '), class: 'th-tail'}));
  const pts = inds.filter(i => Number.isFinite(i.x) && Number.isFinite(i.y)).map(i => ({i, big: mark.includes(i.n), on: mark.includes(i.n) || (!hi && i.z === 'S')})).sort((a, b) => (a.on - b.on) || (a.big - b.big));
  for (const {i, on, big} of pts) g.append(sv('circle', {cx: X(i.x).toFixed(1), cy: Y(i.y).toFixed(1), r: big ? 9 : on ? 6 : 4, class: on ? 'th-dot on' : 'th-dot'})); // 업종 = 작은 점(행성 사진은 2026-10-21 18:22 지움 — 「주식에 본질에 맞지도 않고 장난스러워」)
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
/* 계절 이름 · 계절 각 — 옛 첫 화면 궤도(2026-10-21 00:51 「확임 했어 이기준에 스마트하게 만들어」)의 말과 셈(결정표 네 자리와 같은 쪽 · 시험 theme.test.mjs)
   궤도 · 해 · 행성 그림은 사장님 2026-10-21 17:51 「이렇기 행성 나오는것 지우고 주싣쪽으로 표혐할수 있는 방법 모색해보 … 이건 주식에 본질에 맞지도 않고 장난스러워」 · 18:22 「그랴」로 지움(아래 첫 화면 업종 줄 · 원문 docs/design/stockview-2026-10-21/order-1751.txt) */
export const SEASON = Object.freeze({Q: '겨울', S: '봄', B: '여름', W: '가을'});
export const seasonAngle = (x, y) => Math.atan2(y, x - RULE.bloomX);
/* ── 지난 한 해 다시 보기 — 사장님 2026-10-21 10:44 「1.2.3 번에 … 지난 1년에 주식 변화를 그래프로도 … 1번 보여주고 그다음 2번 보여주고 그다음 3번」 · 11:07 「음 단추가 아니라 자동으로 보여주게해」
   18:22 「그랴」(구글과 잡스라면 — 위 업종 줄 셋 · 아래 줄 그림 하나 · 행성 없음)부터 궤도 위 움직임은 없고 줄 그림만 1번 → 2번 → 3번 차례로 · 지금 그려지는 업종 줄을 밝힘
   여기는 칸 뼈대만(첫 그림 가볍게 — 느린 4G 2.5초 · check_white ③) · 움직임과 자료(/next/data/theme-path.json)는 창 load 뒤 theme-year.js(+ theme-year.css) · 칸 자리는 처음부터 잡아 둠 · 날짜 글 없음([6] 2) */
const afterLoad = f => { const go = () => (globalThis.requestIdleCallback ? requestIdleCallback(f, {timeout: 1500}) : setTimeout(f, 300)); if (document.readyState === 'complete') go(); else addEventListener('load', go, {once: true}); };
/** 줄 그림 오른쪽 끝(그림 단위) — 그 오른쪽은 끝 숫자 이름표 자리(「업종 1년 +21%」 · 「시장 1년 +2%」 · 2026-10-22 총정리 · 감사 A3) · theme-year.js 가 같은 값을 받음 */
export const YR_X1 = 196;
function yearBox(TH, top, rows) {
  const svg = sv('svg', {class: 'th-yrg', viewBox: '0 0 326 112', width: '100%', 'aria-hidden': 'true', focusable: 'false'});
  const btn = h('button', {type: 'button', class: 'th-yr', 'aria-label': '멈춤', disabled: true}, svg);
  const tt = txt(24, 21, top[0] ? `1번 ${top[0].n}` : '', {class: 'th-yrt'});
  svg.append(sv('line', {x1: 1, y1: 14, x2: 17, y2: 14, class: 'th-yrs'}), tt, txt(0, 106, '1년 전', {class: 'th-yra'}), txt(YR_X1, 106, '오늘', {class: 'th-yra', 'text-anchor': 'end'}), sv('line', {x1: 248, y1: 100, x2: 262, y2: 100, class: 'th-yrlm'}), txt(268, 106, '시장', {class: 'th-yra'}));
  if (top.length) afterLoad(() => { if (btn.isConnected) import('./theme-year.js').then(m => m.run({TH, top, rows, btn, svg, tt, x1: YR_X1})).catch(() => { if (btn.isConnected) svg.append(txt(0, 64, '? 한 해 길을 받지 못했어요.', {class: 'th-yra'})); }); });
  return btn;
}
/** 첫 화면 업종 줄 — 번호 · 이름 · 닷새 동안 시장보다 더 오른 만큼(숫자 알약) · ›(2026-10-21 18:22 「그랴」 — 증권사 업종 시세 · 아이폰 주식 앱 꼴 · 행성 사진 없음) */
export function seasonRow(i, k) {
  const v = Number(i.y), t = Number.isFinite(v) ? (Math.round(v * 10) > 0 ? '+' : Math.round(v * 10) < 0 ? '−' : '') + Math.abs(v).toFixed(1) + '%' : '?';
  return h('a', {class: 'th-row th-row2', href: '#/t/i/' + enc(i.n)}, h('span', {class: 'th-n' + (k < 3 ? ' th-top' : ''), text: String(k + 1)}),
    h('span', {class: 'th-mid2'}, h('span', {class: 'th-rn', text: i.n})), h('b', {class: v < 0 ? 'th-pill th-pdn' : 'th-pill', text: t}), h('i', {class: 'th-go', 'aria-hidden': 'true', text: '›'}));
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
/** 꽃 · 시듦 목록 줄(견본 flow36 5 · 6 쪽) — 이름 · 한 달 동안 시장보다 더 오른 %p · 「한 달」(이웃 업종 쪽 그대로)
 *  mode 'B'(꽃 자리) = 큰 값 「꽃 n일째」 · 한 달 값은 작은 글로(많이 오른 차례의 큰 주황 숫자가 급등 자랑처럼 읽히던 것 · 감사 A14 — 숫자는 숨기지 않음)
 *  mode 'W'(시듦 자리) = 큰 값 = 지난 닷새(시듦의 까닭 · 줄 차례와 같은 값 · 내림은 파랑) · 한 달 값은 작은 글로(감사 A15) — 2026-10-22 총정리 */
export function simpleRow(i, {zone = false, mode = null} = {}) {
  if (mode === 'B' || mode === 'W') {
    const big = mode === 'B' ? h('b', {class: 'th-sv', text: `꽃 ${num(i.d)}일째`}) : h('b', {class: 'th-sv ' + cls(i.y), text: pp(i.y) + '%p'});
    return h('a', {class: 'th-srow', href: '#/t/i/' + enc(i.n)}, h('span', {class: 'th-rn', text: i.n}), h('span', {class: 'th-sv2'}, big, h('span', {class: 'th-sk', text: `한 달 ${pp(i.x)}%p`})));
  }
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

/** 고른 싹 회사 기록 칸 — theme-bloom.json 의 달력(지난 60거래일) 가운데 한 달이 지난 날만 셈 · 누르면 #/t/pick(기록 달력)
 *  2026-10-26 사장님 03:20 「여기 이해가 가지도 않고 디자인도 맘에 들지 않아 잡스라면」 — 한 칸에 답 하나: 물음 → 막대 두 개(돌이가 고른 회사 · 아무거나 고른 회사)
 *  날마다 작은 네모 줄(뜻 풀이 없이 파랑 · 초록 · 빈 네모)은 첫 화면에서 빼고 기록 달력 쪽(#/t/pick)에만 · 숫자는 100곳 가운데로 맞춤(앞 판과 같은 셈 — 꽃 된 수 ÷ 한 달 지난 수)
 *  정직: 돌이가 더 적으면 막대도 더 짧게 그대로(감추지 않음 · 2026-10-22 22:54 「신빙성에대해 딱 정직하게 앞에」) · 글자는 테마 칸 200자 안(앞 판 43자 → 36자) */
/** 막대 둘 — 돌이가 고른 회사 · 아무거나 고른 회사(100곳 가운데 꽃이 된 수) · 첫 화면 칸과 기록 쪽(#/t/pick 결론)이 같이 씀 */
export function pickBars(P, Q, note = '100곳 가운데 꽃이 된 수예요') {
  const bar = v => { const f = h('span', {class: 'th-pqf'}); f.style.width = Math.max(0, Math.min(100, v)) + '%'; return h('span', {class: 'th-pqt', 'aria-hidden': 'true'}, f); }; // 너비는 CSSOM — 글 속 style 없음
  const line = (who, v, c) => [h('span', {class: 'th-pqr ' + c}, h('span', {class: 'th-pql', text: who}), h('b', {class: 'th-pqn', text: `${v}곳`})), bar(v)];
  const out = [];
  if (P != null) out.push(...line('돌이가 고른 회사', P, 'th-pqme'));
  if (Q != null) out.push(...line('아무거나 고른 회사', Q, 'th-pqany'));
  if (out.length) out.unshift(h('span', {class: 'th-pqx', text: note}));
  return out;
}
/** 지난 기록 전체(theme-bloom.json record.all — 지금 고르는 조건 · 100곳 가운데) — 사장님 2026-10-27 19:52 「돌이가 고른 회사 이제 이거 아니잖아 수정해야지」 · 19:54 「맞아」(첫 화면 칸은 새 조건 성적을 크게 · 요즘 두 달은 아래 작은 글) */
export function pickLong(B) {
  const a = B?.record?.all;
  return Number.isFinite(a?.rate) && Number.isFinite(a?.base) ? {P: Math.round(a.rate), Q: Math.round(a.base)} : {P: null, Q: null};
}
/** 요즘 두 달 한 줄(기록 달력 가운데 한 달이 지난 날 — pickPQ) — 큰 막대 아래 작은 글(감추지 않음) */
export function recentLine(B) {
  const {P, Q} = pickPQ(B);
  return P != null && Q != null ? h('span', {class: 'th-pqx', text: `요즘 두 달은 고른 회사 ${P}곳, 아무거나 ${Q}곳이에요.`}) : null;
}
/** 기록 달력(지난 60거래일) 가운데 한 달이 지난 날만 — P = 돌이가 고른 회사 · Q = 같은 날 아무 회사(100곳 가운데) */
export function pickPQ(B) {
  const days = Array.isArray(B?.cal?.days) ? B.cal.days.filter(d => d && typeof d.d === 'string') : [];
  const done = days.filter(d => d.hit + d.miss > 0), sum = f => done.reduce((p, d) => p + (Number(f(d)) || 0), 0);
  const D = sum(d => d.hit + d.miss), N = sum(d => d.bn);
  return {P: D ? Math.round((sum(d => d.hit) / D) * 100) : null, Q: N ? Math.round((sum(d => d.bh) / N) * 100) : null};
}
function pickCard() {
  const body = h('span', {class: 'th-pqb'}, h('span', {class: 'th-pql', text: '기록을 불러오는 중이에요.'}));
  const card = h('a', {class: 'th-pkhome', href: '#/t/pick'}, h('b', {class: 'th-pkhh', text: '고른 싹이 꽃이 됐을까?'}), body, h('span', {class: 'th-pkhgo'}, h('span', {text: '기록 달력 보기'}), h('i', {'aria-hidden': 'true', text: '›'})));
  const fill = B => {
    const {P, Q} = pickLong(B), out = pickBars(P, Q, '지난 기록 100곳 가운데 꽃이 된 수예요'), r = out.length ? recentLine(B) : null;
    if (r) out.push(r);
    body.replaceChildren(...(out.length ? out : [h('span', {class: 'th-pql', text: '? 기록을 아직 못 받았어요.'})]));
  };
  setTimeout(() => { fetch('/next/data/theme-bloom.json', {cache: 'no-cache'}).then(r => (r.ok ? r.json() : null)).then(j => fill(j && typeof j.schema === 'string' && j.schema.startsWith('dori-theme-1') ? j : null)).catch(() => fill(null)); }, 0);
  return card;
}

/* ── 첫 화면 큰 네 칸(사장님 2026-10-25 22:52 「좋아 디자인 신경 더써서 세계 최고로 만들어봐」 · 22:54 「어 진짜 싸이트까지 바꿔」
   — 고르신 판 docs/design/dori-new-2026-10-25/best ① · 22:39 「모량이 넘 추상적이야 직관적으로 해야 하고 글씨도 넘 보이질 않아」)
   돌 시계 바로 아래 · 네 자리를 그림 + 낱말 + 큰 숫자로 · 놓는 자리 = 테마 시계 자리(위 왼쪽 싹 · 위 오른쪽 꽃 · 아래 왼쪽 잠잠 · 아래 오른쪽 시듦 — theme-rule.js zoneOf)
   빛나는 곳은 싹 칸 하나(초록 꽉 찬 면 · 마티스 판 「자라남」) · 그림은 검은 선 · 그림자 · 광택 없음(check_white ④) · 잠잠은 따로 쪽이 없어 「시계 읽는 법」(네 자리 뜻)으로
   글은 textContent 로만 · 숫자는 theme-home.json count 그대로(셈 없음) */
const ZCELL = [['S', '#/t/sprout'], ['B', '#/t/bloom'], ['Q', '#/t/how'], ['W', '#/t/wilt']];
function zIcon(z) {
  const s = sv('svg', {class: 'th-zic', viewBox: '0 0 100 100', 'aria-hidden': 'true', focusable: 'false'});
  const P = (d, a = {}) => s.append(sv('path', {d, fill: 'none', stroke: '#000000', 'stroke-width': 6, 'stroke-linecap': 'round', 'stroke-linejoin': 'round', ...a}));
  if (z === 'S') { P('M20 84Q50 73 80 84'); P('M50 82V52'); P('M50 55C50 39 38 29 20 31C20 47 32 57 50 55Z', {fill: '#007A35'}); P('M50 48C50 31 62 21 81 23C81 40 69 50 50 48Z', {fill: '#007A35'}); }
  else if (z === 'B') {
    P('M50 92V56'); P('M50 76C42 67 31 67 26 73C33 81 43 82 50 76Z', {fill: '#FFFFFF', 'stroke-width': 5});
    for (let k = 0; k < 5; k++) { const a = k * 72 * Math.PI / 180; s.append(sv('circle', {cx: (50 + 14.5 * Math.sin(a)).toFixed(1), cy: (35 - 14.5 * Math.cos(a)).toFixed(1), r: 10.5, fill: '#FFFFFF', stroke: '#000000', 'stroke-width': 5})); }
    s.append(sv('circle', {cx: 50, cy: 35, r: 8, fill: '#000000'}));
  } else if (z === 'Q') {
    P('M58 15A36 36 0 1 0 87 70A29 29 0 0 1 58 15Z', {fill: '#EEEEEE', 'stroke-width': 5.5});
    const star = (x, y, r) => P(`M${x} ${y - r}L${x + r * .3} ${y - r * .3}L${x + r} ${y}L${x + r * .3} ${y + r * .3}L${x} ${y + r}L${x - r * .3} ${y + r * .3}L${x - r} ${y}L${x - r * .3} ${y - r * .3}Z`, {fill: '#000000', 'stroke-width': 1.5});
    star(79, 25, 8); star(68, 45, 5);
  } else {
    P('M40 92V61C40 41 55 31 67 39'); P('M67 39C80 42 86 57 80 70C70 63 64 51 67 39Z', {fill: '#DDDDDD', 'stroke-width': 5}); P('M40 69C30 61 19 63 16 70C24 77 33 77 40 69Z', {fill: '#DDDDDD', 'stroke-width': 5});
  }
  return s;
}
/* ── 돌 시계 판 그림(사장님 2026-10-26 08:16 「디자인 이렇게 하라고 어 다 다시해」 — 어젯밤 22:03 돌 시계 판 docs/design/dori-new-2026-10-25/clock/parts.py 그대로)
   싹 난 조약돌 얼굴 넷 · 시계 방향 화살 · 첫 화면 그림 단추 넷 — 색은 고르신 청록 100가지 안 · 검은 선 #171615 · 판이 살짝 어긋난 겹침(워홀 기법만) ── */
const PEB = 'M10 63C10 45 26 35 49 35C73 35 90 46 90 64C90 81 73 90 50 90C27 90 10 81 10 63Z';
const LEAF = 'M51 25C45 13 33 10 26 15C31 24 41 29 51 25ZM52 23C57 10 69 6 77 10C72 21 62 26 52 23Z';
const KK = '#171615';
/** 작은 그림 짓기 — spec = [태그, 속성, 아이들?] 목록 */
function draw(cls, spec) {
  const s = sv('svg', {class: cls, viewBox: '0 0 100 100', 'aria-hidden': 'true', focusable: 'false'});
  const put = (par, [tag, a, kids]) => { const e = sv(tag, a); par.append(e); for (const k of kids ?? []) put(e, k); };
  for (const x of spec) put(s, x);
  return s;
}
const LN = {fill: 'none', stroke: KK, 'stroke-linecap': 'round', 'stroke-linejoin': 'round'};
const sprout = (body = '#F2F3F3', leaf = '#284E53', sway = true, mouth = 'M44 72Q50 77 56 72') => [
  ['path', {d: PEB, fill: body, transform: 'translate(-4 3)'}],
  ['g', sway ? {class: 'th-sway'} : {}, [['path', {d: LEAF, fill: leaf, transform: 'translate(3 -2.5)'}], ['path', {d: LEAF, fill: 'none', stroke: KK, 'stroke-width': 3.4, 'stroke-linejoin': 'round'}]]],
  ['g', LN, [['path', {d: PEB, 'stroke-width': 4.4}], ['path', {d: 'M50 36C50 31 50.5 27 51.5 23', 'stroke-width': 4}], ['path', {d: mouth, 'stroke-width': 3.4}]]],
  ['ellipse', {cx: 38, cy: 61, rx: 3.6, ry: 4.8, fill: KK}], ['ellipse', {cx: 61, cy: 61, rx: 3.6, ry: 4.8, fill: KK}]];
const PET = [[50, 6], [56.7, 10.8], [54.1, 18.7], [45.9, 18.7], [43.3, 10.8]];
const LEAF2 = 'M50 31C44 25 37 25 33 28C37 33 44 34 50 31ZM50 29C56 23 63 23 67 26C63 31 56 32 50 29Z';
const BLOOM = [
  ['path', {d: PEB, fill: '#4E99A3', transform: 'translate(3.5 3)'}], ['path', {d: LEAF2, fill: '#315D62', transform: 'translate(-2 2)'}],
  ['g', {fill: '#FFFFFF', transform: 'translate(-2.5 2)'}, PET.map(([cx, cy]) => ['circle', {cx, cy, r: 5.2}])],
  ['g', LN, [['path', {d: PEB, 'stroke-width': 4.4}], ['path', {d: 'M50 36V20', 'stroke-width': 3.6}], ['path', {d: LEAF2, 'stroke-width': 3}],
    ['g', {'stroke-width': 2.8}, PET.map(([cx, cy]) => ['circle', {cx, cy, r: 5.2}])], ['path', {d: 'M33 63Q38 56.5 43 63M56 63Q61 56.5 66 63', 'stroke-width': 3.4}], ['path', {d: 'M42 70Q50 79 58 70', 'stroke-width': 3.4}]]],
  ['circle', {cx: 50, cy: 13, r: 3.6, fill: KK}]];
const ZZ = [[74, 27, 3], [82, 17, 4], [91, 6, 5]];
const SLEEP = [
  ['path', {d: PEB, fill: '#AAC1C5', transform: 'translate(3 3)'}], ['g', {fill: '#E2E5E6', transform: 'translate(-1.5 1.5)'}, ZZ.map(([cx, cy, r]) => ['circle', {cx, cy, r}])],
  ['g', LN, [['path', {d: PEB, 'stroke-width': 4.4}], ['path', {d: 'M33 60Q38 65.5 43 60M56 60Q61 65.5 66 60', 'stroke-width': 3.4}], ['path', {d: 'M47 72Q50 74.5 53 72', 'stroke-width': 3.2}],
    ['g', {'stroke-width': 2.6}, ZZ.map(([cx, cy, r]) => ['circle', {cx, cy, r}])]]]];
const WLEAF = 'M50 36C50 26 56 19 64 19C70 19 74 24 75 31C69 33 63 31 60 26C58 31 56 35 54 37Z';
const WILT = [
  ['path', {d: PEB, fill: '#D6D5D4', transform: 'translate(-3.5 3)'}], ['path', {d: WLEAF, fill: '#3C4E51', transform: 'translate(2.5 2.5)'}],
  ['g', LN, [['path', {d: PEB, 'stroke-width': 4.4}], ['path', {d: WLEAF, 'stroke-width': 3.4}], ['path', {d: 'M33 60L43 63M56 63L66 60', 'stroke-width': 3.6}], ['path', {d: 'M44 75Q50 69 56 75', 'stroke-width': 3.4}]]]];
const FACE = {S: () => sprout(), B: () => BLOOM, Q: () => SLEEP, W: () => WILT};
/** 시계 방향 화살(둘레 네 곳) — rot 0 = 오른쪽 */
const arrow = rot => draw('th-arw', [['path', {d: 'M26 50H72M54 31L73 50L54 69', fill: 'none', stroke: KK, 'stroke-width': 11, 'stroke-linecap': 'round', 'stroke-linejoin': 'round', transform: `rotate(${rot} 50 50)`}]]);
const G = {fill: 'none', stroke: KK, 'stroke-linecap': 'round', 'stroke-linejoin': 'round'};
/** 첫 화면 그림 단추 그림 넷(꽃 될 회사 · 회사 찾기 · 싹 달력 · 고객센터) */
export const APP_ICON = {
  bloom: () => draw('s-apic', sprout('#FFFFFF', '#315D62', false, 'M42 70Q50 79 58 70')),
  search: () => draw('s-apic', [['circle', {cx: 44, cy: 44, r: 20, fill: '#F2F3F3', transform: 'translate(3 3)'}], ['circle', {cx: 44, cy: 44, r: 20, ...G, 'stroke-width': 6}], ['path', {d: 'M59 59L76 76', ...G, 'stroke-width': 8}]]),
  cal: () => draw('s-apic', [['rect', {x: 22, y: 28, width: 56, height: 50, rx: 6, fill: '#F2F3F3', transform: 'translate(3 3)'}], ['rect', {x: 22, y: 28, width: 56, height: 50, rx: 6, ...G, 'stroke-width': 5}],
    ['path', {d: 'M22 42H78M36 22V32M64 22V32', ...G, 'stroke-width': 5}], ['rect', {x: 31, y: 50, width: 9, height: 9, rx: 2, fill: KK}], ['rect', {x: 45.5, y: 50, width: 9, height: 9, rx: 2, fill: '#1FB8CD', stroke: KK, 'stroke-width': 2}],
    ['rect', {x: 60, y: 50, width: 9, height: 9, rx: 2, fill: KK}], ['rect', {x: 31, y: 63, width: 9, height: 9, rx: 2, fill: KK}]]),
  help: () => draw('s-apic', [['path', {d: 'M26 56V48C26 34 37 24 50 24C63 24 74 34 74 48V56', fill: 'none', stroke: '#F2F3F3', 'stroke-width': 7, transform: 'translate(3 3)'}],
    ['path', {d: 'M26 56V48C26 34 37 24 50 24C63 24 74 34 74 48V56', ...G, 'stroke-width': 5.5}], ['rect', {x: 18, y: 50, width: 16, height: 24, rx: 6, fill: '#F2F3F3', stroke: KK, 'stroke-width': 5}],
    ['rect', {x: 66, y: 50, width: 16, height: 24, rx: 6, fill: '#F2F3F3', stroke: KK, 'stroke-width': 5}], ['path', {d: 'M74 74C74 82 66 84 57 84', ...G, 'stroke-width': 4.5}], ['rect', {x: 45, y: 80, width: 13, height: 8, rx: 4, fill: KK}]]),
};

/** 큰 네 칸 — 한 칸 = 그림 동그라미 · 자리 이름 · 업종 수 · 「›」(칸 전체가 고리 · 48px 넘게) */
/* 큰 숫자 + 작은 「곳」(고르신 판 best ① 꼴) — 숫자는 글자가 아니라 영어에서도 그대로 · 「곳」만 자리 표 data-tr 로 영어 낱말(업종 → industries · 하나면 업종1 → industry · i18n.js 자리 표) */
function zoneCells(TH) {
  const cell = ([z, href]) => {
    const n = TH.count[z], w = ZONES[z];
    return h('a', {class: 'th-zc th-zc' + z, href, 'aria-label': z === 'Q' ? '잠잠 자리 뜻 보기' : `${w} 자리 업종 ${num(n)}곳 보기`},
      h('span', {class: 'th-zi'}, draw('th-zic th-face', FACE[z]())), h('span', {class: 'th-zw', text: w}), // 얼굴(2026-10-26 돌 시계 판) — 옛 선 그림 zIcon 은 남겨 둠
      h('b', {class: 'th-zn'}, h('span', {text: num(n)}), h('small', {class: 'th-zu', 'data-tr': n === 1 ? '업종1' : '업종', text: '곳'})), h('i', {class: 'th-zgo', 'aria-hidden': 'true', text: '›'}));
  };
  // 시계 방향 화살 넷(싹 › 꽃 · 꽃 › 시듦 · 시듦 › 잠잠 · 잠잠 › 싹) — 돌 시계는 app.js 가 이 칸 가운데(.th-zones)에 넣음
  const ar = (k, rot) => h('span', {class: 'th-ar th-ar-' + k, 'aria-hidden': 'true'}, arrow(rot));
  return h('nav', {class: 'th-zones', 'aria-label': '네 자리'}, ZCELL.map(cell), ar('t', 0), ar('r', 90), ar('b', 180), ar('l', 270));
}

/* ── 첫 화면(#/) 맨 위 칸 — app.js vHomeAll 이 부름(본질 세 줄 · 찾기 칸 · 바로 가기 넷 · 전부 보기는 그 아래 그대로) ── */
/** 관심 업종을 담은 기기인가(theme-watch.js 를 받기 전 · 저장소 한 칸만 봄) */
const hasWatch = () => { try { const a = JSON.parse(localStorage.getItem('dori:watch-ind') ?? '[]'); return Array.isArray(a) && a.length > 0; } catch { return false; } };
export async function homeBlock() {
  const TH = await themeHomeData();
  const box = h('section', {class: 'th-home', 'data-w': 'theme', 'aria-label': '테마 시계'});
  if (!TH) { box.append(h('p', {class: 'empty', text: '? 테마 시계 자료를 받지 못했어요. 잠시 뒤 다시 열어 주세요.'})); return box; }
  const S = TH.order.S.map(n => indOf(TH, n)).filter(Boolean), top = S.slice(0, 3);
  box.append(zoneCells(TH)); // 큰 네 칸(2026-10-25 22:54 「어 진짜 싸이트까지 바꿔」) — 칸마다 「›」 · 안내 글은 뺌(테마 칸 글자 200자 안 · check_white ②) · 그 아래 업종 줄 · 한 해 줄 그림은 그대로
  // 기승전결(사장님 2026-10-27 01:50 「돌이가 중요순으로 해서 기승전결이 되게해 · 샘플 180가지를 만든후 그중 3개를 선택해서 그 3갱에 장단점을 보완한 1개를 만들어」)
  //   기 = 제목 · 계절 네 칸 · 돌 시계 · 그림 단추 넷(첫 화면) → 승 = 고른 싹이 꽃이 됐을까?(본질 1 · 지난 기록으로 정직하게 앞에) · 싹 자리 모두 보기
  //   → 전 = ① 왜 사? ② 지난 기록 → 결 = ③ 한 달 뒤(app.js 가 이 둘 뒤에 본질 세 줄을 넣음) → 그 뒤 = 힘이 붙은 곳 · 싹 달력 · 카톡 · 선물 · 숫자 · 읽는 법 · 인사
  box.append(pickCard()); // 승 ① 고른 싹 회사 기록 달력(사장님 2026-10-22 22:54 「그 기록을 한 달력이 첫화면에 직관적으로 … 신빙성에대해 딱 정직하게 앞에」) — 자료는 첫 그림 뒤에 받음(느린 4G 첫 그림에 안 끼게)
  box.append(h('a', {class: 'th-more', href: '#/t/sprout'}, h('span', {text: `봄(싹) 자리 ${num(TH.count.S)}곳 모두 보기`}), h('i', {'aria-hidden': 'true', text: '›'}))); // 승 ②
  // 2026-10-21 18:22 「그랴」(18:11 「구글과 잡스라면 … 뭘 고를까?」의 답 — 13번 업종 시세판 위 · 1번 두 줄 견주기 아래) — 카드 안: 업종 줄 셋 → 한 해 줄 그림(저절로 1 · 2 · 3) → 모두 보기 → 숫자는 「자세히」 안(접음) → 시계 읽는 법 → 처음이세요?
  const rows = top.map((i, k) => seasonRow(i, k)); if (rows[0]) rows[0].classList.add('th-now'); // 지금 줄 그림의 업종(처음 = 1번)
  const site = nx()?.absUrl ? nx().absUrl('#/') : location.origin + '/#/'; // 카톡 보내기(사장님 2026-10-25 「진짜모든곳에」 · 12:24 「어」) — 보내는 글 = 이름 · 주소만(오른 % 없음)
  // 줄마다 「카톡 보내기」는 달지 않음(2026-10-25 짝 검사) — 줄 아래에 셋을 쌓으면 320 × 568 에서 1년 줄 그림이 화면 밖으로 밀림(그림 아래 499 → 661 · 한도 500 · check_white ①) · 칸 하나에 하나(아래 세 곳 함께 보내기)
  box.append(h('div', {class: 'th-map th-map2'}, h('h2', {class: 'th-lt', text: '요즘 시장보다 힘이 붙은 곳'}), h('p', {class: 'th-lc', text: '닷새 동안 시장보다'}), h('div', {class: 'th-rows'}, rows),
    yearBox(TH, top, rows), h('p', {class: 'th-cap th-cap1', text: '지난 1년 동안 걸어온 길이에요. 위 줄은 점이 많이 찬 차례예요. 숫자는 닷새 동안 시장보다 더 오른 만큼이에요.'}))); // 그림 아래 글 = 뜻(지난 기록 · 줄 차례의 까닭 · 숫자의 뜻) — 움직임 설명 대신(2026-10-22 총정리 · 감사 A2 · A4 · 그림 아래라 320 높이 그대로)
  // 싹 달력 큰 단추(사장님 2026-10-23 13:33 「달력늘 클릭하면 1.2.3 찾아낸것을 날짜별로 정리하고 … 꺽기그래프로」 · 10-25 12:24 「어」) — 1 · 2 · 3번 칸 바로 아래 · 그 아래 「카톡 보내기」(세 곳 이름 · 주소 · 칸 폭 가득)
  const kkAll = kakaoText({title: `${josa(NAME, '가')} 찾은 1번 2번 3번`, text: top.length ? `${josa(NAME, '가')} 찾은 싹 1번 2번 3번 — ${top.map(i => i.n).join(', ')}` : `${NAME} 테마 시계`, url: site});
  kkAll.classList.add('th-kkall');
  box.append(h('div', {class: 'th-gorow'}, h('a', {class: 'th-calgo', href: '#/t/cal'}, h('span', {text: '싹 달력 보기'}), h('i', {'aria-hidden': 'true', text: '›'})), kkAll,
    h('a', {class: 'kk-gift th-gift', href: '#/gift', text: '선물 받기'}))); // 한 줄에 둘(390 폭 첫 화면 안에 「카톡 보내기」도 보이게 · 좁으면 두 줄) · 그 밑 「선물 받기」(사장님 2026-10-25 13:40 「곳곳에 선물 받기를 다 집어넣어 놔」)
  if (hasWatch()) { try { const nb = (await import('./theme-watch.js')).noticeBox(TH); if (nb) box.append(nb); } catch { /* 소식 칸 없이 */ } } // 관심 업종 소식(사이트 안 알림 · 2026-10-19 「다해」) — 담은 기기만 받음
  // 「날마다 찾은 세 곳 달력」 작은 고리는 위 큰 「싹 달력 보기」로 옮김(2026-10-25)
  // 숫자는 접어 둠 — 주황 숫자(사장님 2026-10-20 09:46 — 진짜 싹 · 새로 들어옴 · 싹 자리)와 성적표는 「숫자로 자세히 보기」 안에 그대로
  // 2026-10-22 총정리(사장님 04:09 「결과부터」 · 감사 A7): 맨 위 = 성적표 한 줄(가장 중요한 숫자) → 한 줄에 하나(진짜 싹 · 새로 들어옴 · 싹 자리 · 같은 고리 · 48px 넘게) → 점 넷 뜻
  //   테 두른 작은 네모 셋(지도 규칙 11 「작은 네모 판 금지」)과 같은 숫자를 두 번 쓰던 머리 줄은 지움
  const fold = h('details', {class: 'th-hfold'}, h('summary', {text: '숫자로 자세히 보기'}));
  fold.append(recordLine(TH));
  fold.append(h('div', {class: 'th-three', 'data-tr': '업종'}, ...[[TH.count.real, '진짜 싹', '#/t/sprout/real'], [TH.count.fresh, '새로 들어옴', '#/t/sprout/new'], [TH.count.S, '싹 자리', '#/t/sprout']].map(([n, t, href]) => h('a', {href}, h('span', {text: t}), h('b', {text: num(n) + '곳'}), h('i', {'aria-hidden': 'true', text: '›'}))))); // data-tr = 영어에서 「n곳」을 업종 수로(i18n.js 자리 표)
  fold.append(h('p', {class: 'th-sub', text: '점 넷이 다 차면 진짜 싹이에요.'})); // 싹 순서(점 수 → 지난 닷새 · 결정표 4)는 그림 아래 글에
  box.append(fold, nextBtn('시계 읽는 법', '#/t/how')); // 기준 날은 첫 화면에 안 씀(보이는 날짜는 띠에 한 번 — [6] 2 · next_check) · 테마 쪽마다 아래에 씀
  box.append(h('a', {class: 'th-hi', href: '#/t/hello', text: '처음이세요? 돌이 인사 ›'})); // 서른여섯 장의 1장(돌이 인사)으로 가는 고리 — 가운데 맞춘 한 줄(2026-10-19 사장님 「다해」 · 못 한 것 5)
  return box;
}
